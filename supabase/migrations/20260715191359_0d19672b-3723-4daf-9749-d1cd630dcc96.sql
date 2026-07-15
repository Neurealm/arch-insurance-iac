
-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.etdm_domain_lifecycle AS ENUM (
    'Emerging','Evaluation','Strategic','Active','Maintenance',
    'Legacy','Deprecated','End of Support','Retired'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.etdm_domain_approval AS ENUM (
    'Draft','In Review','Approved','Rejected','Retired'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.etdm_domain_criticality AS ENUM (
    'Mission Critical','Business Critical','Important','Standard','Noncritical'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- MASTER DOMAINS reference list
-- ============================================================
CREATE TABLE IF NOT EXISTS public.etdm_master_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.etdm_master_domains TO authenticated;
GRANT ALL ON public.etdm_master_domains TO service_role;

ALTER TABLE public.etdm_master_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS etdm_master_domains_read ON public.etdm_master_domains;
CREATE POLICY etdm_master_domains_read ON public.etdm_master_domains
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS etdm_master_domains_admin_write ON public.etdm_master_domains;
CREATE POLICY etdm_master_domains_admin_write ON public.etdm_master_domains
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP TRIGGER IF EXISTS etdm_master_domains_updated_at ON public.etdm_master_domains;
CREATE TRIGGER etdm_master_domains_updated_at
  BEFORE UPDATE ON public.etdm_master_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 16 approved master domains (idempotent)
INSERT INTO public.etdm_master_domains (name, display_order) VALUES
  ('Business & Services', 10),
  ('Business Outcomes', 20),
  ('Architecture', 30),
  ('Engineering', 40),
  ('Platform & Applications', 50),
  ('Infrastructure', 60),
  ('Networking & Connectivity', 70),
  ('Cybersecurity', 80),
  ('Identity & Access Management', 90),
  ('Data & Information', 100),
  ('Observability & Operational Intelligence', 110),
  ('Reliability & Resilience', 120),
  ('Operations & Support', 130),
  ('Automation & AI', 140),
  ('Configuration & Knowledge', 150),
  ('Enterprise Governance', 160)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- DOMAINS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.etdm_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,

  -- Parent relationships. ON DELETE RESTRICT prevents orphaning; deletes should be soft.
  technology_id uuid NOT NULL REFERENCES public.etdm_technologies(id) ON DELETE RESTRICT,
  master_domain_id uuid NOT NULL REFERENCES public.etdm_master_domains(id) ON DELETE RESTRICT,

  -- Identity
  domain_display_name text NOT NULL,
  short_name text,
  slug text NOT NULL,
  description text,
  display_order int NOT NULL DEFAULT 0,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],

  -- Business
  scope_summary text,
  business_purpose text,
  business_criticality public.etdm_domain_criticality NOT NULL DEFAULT 'Standard',

  -- Governance
  lifecycle_status public.etdm_domain_lifecycle NOT NULL DEFAULT 'Active',
  approval_status public.etdm_domain_approval NOT NULL DEFAULT 'Draft',
  is_active boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  effective_date date,
  review_date date,
  expiration_date date,
  governance_notes text,
  source_of_record text,
  external_reference_id text,

  -- Metadata
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_version int NOT NULL DEFAULT 1,
  cloned_from_domain_id uuid REFERENCES public.etdm_domains(id) ON DELETE SET NULL,
  deleted_by uuid,
  deleted_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.etdm_domains TO authenticated;
GRANT ALL ON public.etdm_domains TO service_role;

ALTER TABLE public.etdm_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS etdm_domains_admin_select ON public.etdm_domains;
CREATE POLICY etdm_domains_admin_select ON public.etdm_domains
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS etdm_domains_admin_insert ON public.etdm_domains;
CREATE POLICY etdm_domains_admin_insert ON public.etdm_domains
  FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS etdm_domains_admin_update ON public.etdm_domains;
CREATE POLICY etdm_domains_admin_update ON public.etdm_domains
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS etdm_domains_admin_delete ON public.etdm_domains;
CREATE POLICY etdm_domains_admin_delete ON public.etdm_domains
  FOR DELETE TO authenticated USING (public.is_platform_admin(auth.uid()));

-- Uniqueness (partial, so soft-deleted rows do not block reuse)
CREATE UNIQUE INDEX IF NOT EXISTS etdm_domains_uq_tech_slug
  ON public.etdm_domains(technology_id, slug) WHERE is_deleted = false;

CREATE UNIQUE INDEX IF NOT EXISTS etdm_domains_uq_tech_master
  ON public.etdm_domains(technology_id, master_domain_id) WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS etdm_domains_ix_tech ON public.etdm_domains(technology_id);
CREATE INDEX IF NOT EXISTS etdm_domains_ix_master ON public.etdm_domains(master_domain_id);
CREATE INDEX IF NOT EXISTS etdm_domains_ix_soft ON public.etdm_domains(is_deleted);
CREATE INDEX IF NOT EXISTS etdm_domains_ix_order ON public.etdm_domains(technology_id, display_order);

-- updated_at trigger
DROP TRIGGER IF EXISTS etdm_domains_set_updated_at ON public.etdm_domains;
CREATE TRIGGER etdm_domains_set_updated_at
  BEFORE UPDATE ON public.etdm_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- AUDIT TRIGGER (writes to shared etdm_record_audit_log with entity_type='domain')
-- ============================================================
CREATE OR REPLACE FUNCTION public.etdm_write_audit_domains()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_action text;
  v_prev jsonb;
  v_new jsonb;
  v_changed text[];
  k text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_prev := NULL;
    v_new := to_jsonb(NEW);
    v_changed := ARRAY[]::text[];
  ELSIF TG_OP = 'UPDATE' THEN
    v_prev := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_changed := ARRAY[]::text[];
    FOR k IN SELECT jsonb_object_keys(v_new) LOOP
      IF v_prev->k IS DISTINCT FROM v_new->k THEN
        v_changed := array_append(v_changed, k);
      END IF;
    END LOOP;
    IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
      v_action := 'soft_delete';
    ELSIF NEW.is_deleted = false AND OLD.is_deleted = true THEN
      v_action := 'restore';
    ELSIF NEW.is_active <> OLD.is_active THEN
      v_action := CASE WHEN NEW.is_active THEN 'activate' ELSE 'deactivate' END;
    ELSIF NEW.approval_status <> OLD.approval_status THEN
      v_action := 'approval_status_change';
    ELSIF NEW.display_order <> OLD.display_order THEN
      v_action := 'reorder';
    ELSE
      v_action := 'update';
    END IF;
  ELSE
    v_action := 'delete';
    v_prev := to_jsonb(OLD);
    v_new := NULL;
    v_changed := ARRAY[]::text[];
  END IF;

  INSERT INTO public.etdm_record_audit_log(
    tenant_id, entity_type, entity_id, action, changed_by,
    previous_values, new_values, changed_fields, source
  ) VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    'domain',
    COALESCE(NEW.id, OLD.id),
    v_action,
    auth.uid(),
    v_prev, v_new, v_changed,
    'portal'
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS etdm_domains_audit_ins ON public.etdm_domains;
CREATE TRIGGER etdm_domains_audit_ins AFTER INSERT ON public.etdm_domains
  FOR EACH ROW EXECUTE FUNCTION public.etdm_write_audit_domains();

DROP TRIGGER IF EXISTS etdm_domains_audit_upd ON public.etdm_domains;
CREATE TRIGGER etdm_domains_audit_upd AFTER UPDATE ON public.etdm_domains
  FOR EACH ROW EXECUTE FUNCTION public.etdm_write_audit_domains();

DROP TRIGGER IF EXISTS etdm_domains_audit_del ON public.etdm_domains;
CREATE TRIGGER etdm_domains_audit_del AFTER DELETE ON public.etdm_domains
  FOR EACH ROW EXECUTE FUNCTION public.etdm_write_audit_domains();

-- ============================================================
-- CLONE RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.etdm_clone_domain(_source_id uuid)
RETURNS public.etdm_domains
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_new public.etdm_domains;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.etdm_domains (
    tenant_id, technology_id, master_domain_id,
    domain_display_name, short_name, slug, description, display_order, tags,
    scope_summary, business_purpose, business_criticality,
    lifecycle_status, approval_status, is_active, is_deleted,
    effective_date, review_date, expiration_date,
    governance_notes, source_of_record, external_reference_id,
    cloned_from_domain_id, created_by, updated_by
  )
  SELECT
    tenant_id,
    technology_id,
    master_domain_id,
    domain_display_name || ' (Copy)',
    short_name,
    slug || '-copy-' || substr(gen_random_uuid()::text, 1, 6),
    description,
    display_order,
    tags,
    scope_summary, business_purpose, business_criticality,
    lifecycle_status,
    'Draft'::public.etdm_domain_approval,
    false,
    false,
    effective_date, review_date, expiration_date,
    governance_notes, source_of_record, external_reference_id,
    id,
    auth.uid(),
    auth.uid()
  FROM public.etdm_domains
  WHERE id = _source_id AND is_deleted = false
  RETURNING * INTO v_new;

  IF v_new IS NULL THEN
    RAISE EXCEPTION 'source_not_found';
  END IF;

  RETURN v_new;
END;
$function$;

-- ============================================================
-- REORDER RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.etdm_reorder_domains(_technology_id uuid, _ordered_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  i int;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  FOR i IN 1 .. array_length(_ordered_ids, 1) LOOP
    UPDATE public.etdm_domains
       SET display_order = (i - 1) * 10,
           updated_by = auth.uid()
     WHERE id = _ordered_ids[i]
       AND technology_id = _technology_id;
  END LOOP;
END;
$function$;
