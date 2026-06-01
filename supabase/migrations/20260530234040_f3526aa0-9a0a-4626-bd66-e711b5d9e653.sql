
-- =========================================================
-- 1) Lock CRM tables to platform admin only
-- =========================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'crm_companies','crm_stakeholders','crm_departments','crm_teams',
    'crm_activities','crm_notes','stakeholder_registers'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Approved read %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Approved insert %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Approved update %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Approved delete %1$s" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "Platform admins manage %1$s" ON public.%1$s FOR ALL TO authenticated USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()))', t);
  END LOOP;
END $$;

-- =========================================================
-- 2) Add tenant_id to org tables + backfill + NOT NULL + indexes
-- =========================================================
ALTER TABLE public.org_business_units    ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_practices         ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_capability_areas  ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_service_functions ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_workflows         ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_activities        ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_tasks             ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- Backfill existing rows to first tenant if any
DO $$
DECLARE default_tenant uuid;
BEGIN
  SELECT id INTO default_tenant FROM public.tenants ORDER BY created_at ASC LIMIT 1;
  IF default_tenant IS NOT NULL THEN
    UPDATE public.org_business_units    SET tenant_id = default_tenant WHERE tenant_id IS NULL;
    UPDATE public.org_practices         SET tenant_id = default_tenant WHERE tenant_id IS NULL;
    UPDATE public.org_capability_areas  SET tenant_id = default_tenant WHERE tenant_id IS NULL;
    UPDATE public.org_service_functions SET tenant_id = default_tenant WHERE tenant_id IS NULL;
    UPDATE public.org_workflows         SET tenant_id = default_tenant WHERE tenant_id IS NULL;
    UPDATE public.org_activities        SET tenant_id = default_tenant WHERE tenant_id IS NULL;
    UPDATE public.org_tasks             SET tenant_id = default_tenant WHERE tenant_id IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_org_business_units_tenant    ON public.org_business_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_practices_tenant         ON public.org_practices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_capability_areas_tenant  ON public.org_capability_areas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_service_functions_tenant ON public.org_service_functions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_workflows_tenant         ON public.org_workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_activities_tenant        ON public.org_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_tasks_tenant             ON public.org_tasks(tenant_id);

-- =========================================================
-- 3) Auto-fill tenant_id from current user's membership
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_tenant_id_from_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tenant_id IS NULL AND auth.uid() IS NOT NULL THEN
    SELECT tenant_id INTO NEW.tenant_id
      FROM public.tenant_memberships
     WHERE user_id = auth.uid()
     LIMIT 1;
  END IF;
  IF NEW.tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_id is required (no tenant membership for current user)';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'org_business_units','org_practices','org_capability_areas',
    'org_service_functions','org_workflows','org_activities','org_tasks'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_tenant_id ON public.%1$s', t);
    EXECUTE format('CREATE TRIGGER set_tenant_id BEFORE INSERT ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership()', t);
  END LOOP;
END $$;

-- =========================================================
-- 4) Replace org RLS with tenant-scoped policies
-- =========================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'org_business_units','org_practices','org_capability_areas',
    'org_service_functions','org_workflows','org_activities','org_tasks'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Approved read %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Platform admins manage %1$s" ON public.%1$s', t);

    EXECUTE format($p$
      CREATE POLICY "Tenant members read %1$s" ON public.%1$s
      FOR SELECT TO authenticated
      USING (is_platform_admin(auth.uid()) OR is_tenant_member(auth.uid(), tenant_id))
    $p$, t);

    EXECUTE format($p$
      CREATE POLICY "Tenant admins insert %1$s" ON public.%1$s
      FOR INSERT TO authenticated
      WITH CHECK (
        is_platform_admin(auth.uid())
        OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'::tenant_role)
      )
    $p$, t);

    EXECUTE format($p$
      CREATE POLICY "Tenant admins update %1$s" ON public.%1$s
      FOR UPDATE TO authenticated
      USING (
        is_platform_admin(auth.uid())
        OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'::tenant_role)
      )
      WITH CHECK (
        is_platform_admin(auth.uid())
        OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'::tenant_role)
      )
    $p$, t);

    EXECUTE format($p$
      CREATE POLICY "Tenant admins delete %1$s" ON public.%1$s
      FOR DELETE TO authenticated
      USING (
        is_platform_admin(auth.uid())
        OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'::tenant_role)
      )
    $p$, t);
  END LOOP;
END $$;
