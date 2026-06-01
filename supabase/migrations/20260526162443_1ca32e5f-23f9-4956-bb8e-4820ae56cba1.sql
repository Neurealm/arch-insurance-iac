-- Link CRM companies to provisioned tenants & track lifecycle
ALTER TABLE public.crm_companies
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lifecycle_stage text NOT NULL DEFAULT 'prospect';

CREATE INDEX IF NOT EXISTS idx_crm_companies_tenant_id ON public.crm_companies(tenant_id);

-- Tenants: add fields needed for tenant onboarding from CRM
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS source_company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_admin_email text;

CREATE INDEX IF NOT EXISTS idx_tenants_source_company_id ON public.tenants(source_company_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tenants_slug ON public.tenants(slug);