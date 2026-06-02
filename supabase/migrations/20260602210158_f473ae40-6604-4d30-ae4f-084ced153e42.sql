
-- 1. Tenants: data_mode + future per-tenant DB stub
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS data_mode text NOT NULL DEFAULT 'demo'
    CHECK (data_mode IN ('demo','live')),
  ADD COLUMN IF NOT EXISTS db_connection_id uuid NULL;

-- 2. tenant_incidents — template tenant-scoped domain table
CREATE TABLE IF NOT EXISTS public.tenant_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  incident_number text,
  title text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'P3',
  status text NOT NULL DEFAULT 'open',
  service text,
  owner text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  mttr_minutes integer GENERATED ALWAYS AS (
    CASE WHEN resolved_at IS NOT NULL
         THEN GREATEST(0, EXTRACT(EPOCH FROM (resolved_at - opened_at))::int / 60)
         ELSE NULL END
  ) STORED,
  source text NOT NULL DEFAULT 'manual',
  external_id text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_incidents TO authenticated;
GRANT ALL ON public.tenant_incidents TO service_role;

ALTER TABLE public.tenant_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members read tenant_incidents"
  ON public.tenant_incidents FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()) OR is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins insert tenant_incidents"
  ON public.tenant_incidents FOR INSERT TO authenticated
  WITH CHECK (is_platform_admin(auth.uid()) OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

CREATE POLICY "Tenant admins update tenant_incidents"
  ON public.tenant_incidents FOR UPDATE TO authenticated
  USING (is_platform_admin(auth.uid()) OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'))
  WITH CHECK (is_platform_admin(auth.uid()) OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

CREATE POLICY "Tenant admins delete tenant_incidents"
  ON public.tenant_incidents FOR DELETE TO authenticated
  USING (is_platform_admin(auth.uid()) OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

-- Tenant auto-fill trigger (reuses existing fn)
DROP TRIGGER IF EXISTS trg_tenant_incidents_set_tenant ON public.tenant_incidents;
CREATE TRIGGER trg_tenant_incidents_set_tenant
  BEFORE INSERT ON public.tenant_incidents
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership();

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_tenant_incidents_updated_at ON public.tenant_incidents;
CREATE TRIGGER trg_tenant_incidents_updated_at
  BEFORE UPDATE ON public.tenant_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_incidents_tenant_opened
  ON public.tenant_incidents (tenant_id, opened_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_tenant_incidents_source_ext
  ON public.tenant_incidents (tenant_id, source, external_id)
  WHERE external_id IS NOT NULL;
