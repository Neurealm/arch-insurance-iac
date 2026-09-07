
CREATE TABLE IF NOT EXISTS public.stakeholder_registers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  register_id TEXT NOT NULL,
  stakeholder_name TEXT NOT NULL,
  company TEXT DEFAULT '',
  role TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  department TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'Medium',
  influence_level TEXT NOT NULL DEFAULT 'Medium',
  engagement_strategy TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stakeholder_registers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view stakeholder registers" ON public.stakeholder_registers;
DROP POLICY IF EXISTS "Anyone can view stakeholder registers" ON public.stakeholder_registers;
CREATE POLICY "Anyone can view stakeholder registers" ON public.stakeholder_registers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert stakeholder registers" ON public.stakeholder_registers;
DROP POLICY IF EXISTS "Anyone can insert stakeholder registers" ON public.stakeholder_registers;
CREATE POLICY "Anyone can insert stakeholder registers" ON public.stakeholder_registers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update stakeholder registers" ON public.stakeholder_registers;
DROP POLICY IF EXISTS "Anyone can update stakeholder registers" ON public.stakeholder_registers;
CREATE POLICY "Anyone can update stakeholder registers" ON public.stakeholder_registers FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Anyone can delete stakeholder registers" ON public.stakeholder_registers;
DROP POLICY IF EXISTS "Anyone can delete stakeholder registers" ON public.stakeholder_registers;
CREATE POLICY "Anyone can delete stakeholder registers" ON public.stakeholder_registers FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_stakeholder_registers_updated_at ON public.stakeholder_registers;
DROP TRIGGER IF EXISTS update_stakeholder_registers_updated_at ON public.stakeholder_registers;
CREATE TRIGGER update_stakeholder_registers_updated_at BEFORE UPDATE ON public.stakeholder_registers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Companies
CREATE TABLE IF NOT EXISTS public.crm_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text DEFAULT '',
  company_type text NOT NULL DEFAULT 'Customer',
  website text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  account_owner text DEFAULT '',
  status boolean NOT NULL DEFAULT true,
  priority text NOT NULL DEFAULT 'Medium',
  notes text DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  head_stakeholder_id uuid,
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_departments_company ON public.crm_departments(company_id);

CREATE TABLE IF NOT EXISTS public.crm_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.crm_departments(id) ON DELETE SET NULL,
  name text NOT NULL,
  lead_stakeholder_id uuid,
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_teams_company ON public.crm_teams(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_teams_department ON public.crm_teams(department_id);

CREATE TABLE IF NOT EXISTS public.crm_stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.crm_departments(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.crm_teams(id) ON DELETE SET NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  job_title text DEFAULT '',
  emails text[] NOT NULL DEFAULT '{}',
  phones text[] NOT NULL DEFAULT '{}',
  linkedin text DEFAULT '',
  influence_level text NOT NULL DEFAULT 'Medium',
  reporting_manager_id uuid REFERENCES public.crm_stakeholders(id) ON DELETE SET NULL,
  status boolean NOT NULL DEFAULT true,
  notes text DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  photo_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_stakeholders_company ON public.crm_stakeholders(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_stakeholders_department ON public.crm_stakeholders(department_id);
CREATE INDEX IF NOT EXISTS idx_crm_stakeholders_team ON public.crm_stakeholders(team_id);

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  stakeholder_id uuid REFERENCES public.crm_stakeholders(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'Note',
  subject text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_activities_company ON public.crm_activities(company_id);

CREATE TABLE IF NOT EXISTS public.crm_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  stakeholder_id uuid REFERENCES public.crm_stakeholders(id) ON DELETE SET NULL,
  body text NOT NULL DEFAULT '',
  author text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_notes_company ON public.crm_notes(company_id);

ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['crm_companies','crm_departments','crm_teams','crm_stakeholders','crm_activities','crm_notes']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can view %1$s" ON public.;
CREATE POLICY "Anyone can view %1$s" ON public.%1$s FOR SELECT USING (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can insert %1$s" ON public.;
CREATE POLICY "Anyone can insert %1$s" ON public.%1$s FOR INSERT WITH CHECK (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can update %1$s" ON public.;
CREATE POLICY "Anyone can update %1$s" ON public.%1$s FOR UPDATE USING (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can delete %1$s" ON public.;
CREATE POLICY "Anyone can delete %1$s" ON public.%1$s FOR DELETE USING (true);', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t);
  END LOOP;
END $$;

DO $idem$ BEGIN
CREATE TYPE public.app_role AS ENUM ('platform_admin', 'platform_support');
EXCEPTION WHEN duplicate_object THEN NULL; END $idem$;
DO $idem$ BEGIN
CREATE TYPE public.tenant_role AS ENUM ('tenant_admin', 'tenant_manager', 'tenant_member');
EXCEPTION WHEN duplicate_object THEN NULL; END $idem$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status boolean NOT NULL DEFAULT true,
  logo_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.tenant_role NOT NULL DEFAULT 'tenant_member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user ON public.tenant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant ON public.tenant_memberships(tenant_id);

CREATE TABLE IF NOT EXISTS public.tools_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '',
  icon text DEFAULT '',
  route text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agents_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT '',
  capability text DEFAULT '',
  icon text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_tool_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.tools_catalog(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, tool_id)
);
CREATE INDEX IF NOT EXISTS idx_tta_tenant ON public.tenant_tool_assignments(tenant_id);

CREATE TABLE IF NOT EXISTS public.tenant_agent_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents_catalog(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, agent_id)
);
CREATE INDEX IF NOT EXISTS idx_taa_tenant ON public.tenant_agent_assignments(tenant_id);

CREATE TABLE IF NOT EXISTS public.user_tool_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  tool_id uuid NOT NULL REFERENCES public.tools_catalog(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id, tool_id)
);
CREATE INDEX IF NOT EXISTS idx_uta_user ON public.user_tool_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_uta_tenant ON public.user_tool_assignments(tenant_id);

CREATE TABLE IF NOT EXISTS public.user_agent_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  agent_id uuid NOT NULL REFERENCES public.agents_catalog(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id, agent_id)
);
CREATE INDEX IF NOT EXISTS idx_uaa_user ON public.user_agent_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_uaa_tenant ON public.user_agent_assignments(tenant_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'platform_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenant_memberships WHERE user_id = _user_id AND tenant_id = _tenant_id);
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role(_user_id uuid, _tenant_id uuid, _role public.tenant_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenant_memberships WHERE user_id = _user_id AND tenant_id = _tenant_id AND role = _role);
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_tenants_updated ON public.tenants;
DROP TRIGGER IF EXISTS trg_tenants_updated ON public.tenants;
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_tools_catalog_updated ON public.tools_catalog;
DROP TRIGGER IF EXISTS trg_tools_catalog_updated ON public.tools_catalog;
CREATE TRIGGER trg_tools_catalog_updated BEFORE UPDATE ON public.tools_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_agents_catalog_updated ON public.agents_catalog;
DROP TRIGGER IF EXISTS trg_agents_catalog_updated ON public.agents_catalog;
CREATE TRIGGER trg_agents_catalog_updated BEFORE UPDATE ON public.agents_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_tool_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tool_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agent_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles readable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Profiles readable by authenticated" ON public.profiles;
CREATE POLICY "Profiles readable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Platform admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Platform admins manage roles" ON public.user_roles;
CREATE POLICY "Platform admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Members or admins read tenant" ON public.tenants;
DROP POLICY IF EXISTS "Members or admins read tenant" ON public.tenants;
CREATE POLICY "Members or admins read tenant" ON public.tenants
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), id));
DROP POLICY IF EXISTS "Platform admins insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Platform admins insert tenants" ON public.tenants;
CREATE POLICY "Platform admins insert tenants" ON public.tenants
  FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS "Tenant admins update tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant admins update tenant" ON public.tenants;
CREATE POLICY "Tenant admins update tenant" ON public.tenants
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), id, 'tenant_admin'));
DROP POLICY IF EXISTS "Platform admins delete tenants" ON public.tenants;
DROP POLICY IF EXISTS "Platform admins delete tenants" ON public.tenants;
CREATE POLICY "Platform admins delete tenants" ON public.tenants
  FOR DELETE TO authenticated USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Members read same-tenant memberships" ON public.tenant_memberships;
DROP POLICY IF EXISTS "Members read same-tenant memberships" ON public.tenant_memberships;
CREATE POLICY "Members read same-tenant memberships" ON public.tenant_memberships
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
DROP POLICY IF EXISTS "Tenant admins manage memberships" ON public.tenant_memberships;
DROP POLICY IF EXISTS "Tenant admins manage memberships" ON public.tenant_memberships;
CREATE POLICY "Tenant admins manage memberships" ON public.tenant_memberships
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'))
  WITH CHECK (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

DROP POLICY IF EXISTS "Authenticated read tools_catalog" ON public.tools_catalog;
DROP POLICY IF EXISTS "Authenticated read tools_catalog" ON public.tools_catalog;
CREATE POLICY "Authenticated read tools_catalog" ON public.tools_catalog
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Platform admins manage tools_catalog" ON public.tools_catalog;
DROP POLICY IF EXISTS "Platform admins manage tools_catalog" ON public.tools_catalog;
CREATE POLICY "Platform admins manage tools_catalog" ON public.tools_catalog
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated read agents_catalog" ON public.agents_catalog;
DROP POLICY IF EXISTS "Authenticated read agents_catalog" ON public.agents_catalog;
CREATE POLICY "Authenticated read agents_catalog" ON public.agents_catalog
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Platform admins manage agents_catalog" ON public.agents_catalog;
DROP POLICY IF EXISTS "Platform admins manage agents_catalog" ON public.agents_catalog;
CREATE POLICY "Platform admins manage agents_catalog" ON public.agents_catalog
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Members read tenant_tool_assignments" ON public.tenant_tool_assignments;
DROP POLICY IF EXISTS "Members read tenant_tool_assignments" ON public.tenant_tool_assignments;
CREATE POLICY "Members read tenant_tool_assignments" ON public.tenant_tool_assignments
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
DROP POLICY IF EXISTS "Platform admins manage tenant_tool_assignments" ON public.tenant_tool_assignments;
DROP POLICY IF EXISTS "Platform admins manage tenant_tool_assignments" ON public.tenant_tool_assignments;
CREATE POLICY "Platform admins manage tenant_tool_assignments" ON public.tenant_tool_assignments
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Members read tenant_agent_assignments" ON public.tenant_agent_assignments;
DROP POLICY IF EXISTS "Members read tenant_agent_assignments" ON public.tenant_agent_assignments;
CREATE POLICY "Members read tenant_agent_assignments" ON public.tenant_agent_assignments
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
DROP POLICY IF EXISTS "Platform admins manage tenant_agent_assignments" ON public.tenant_agent_assignments;
DROP POLICY IF EXISTS "Platform admins manage tenant_agent_assignments" ON public.tenant_agent_assignments;
CREATE POLICY "Platform admins manage tenant_agent_assignments" ON public.tenant_agent_assignments
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Self or tenant admin read user_tool_assignments" ON public.user_tool_assignments;
DROP POLICY IF EXISTS "Self or tenant admin read user_tool_assignments" ON public.user_tool_assignments;
CREATE POLICY "Self or tenant admin read user_tool_assignments" ON public.user_tool_assignments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));
DROP POLICY IF EXISTS "Tenant admins manage user_tool_assignments" ON public.user_tool_assignments;
DROP POLICY IF EXISTS "Tenant admins manage user_tool_assignments" ON public.user_tool_assignments;
CREATE POLICY "Tenant admins manage user_tool_assignments" ON public.user_tool_assignments
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'))
  WITH CHECK (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

DROP POLICY IF EXISTS "Self or tenant admin read user_agent_assignments" ON public.user_agent_assignments;
DROP POLICY IF EXISTS "Self or tenant admin read user_agent_assignments" ON public.user_agent_assignments;
CREATE POLICY "Self or tenant admin read user_agent_assignments" ON public.user_agent_assignments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));
DROP POLICY IF EXISTS "Tenant admins manage user_agent_assignments" ON public.user_agent_assignments;
DROP POLICY IF EXISTS "Tenant admins manage user_agent_assignments" ON public.user_agent_assignments;
CREATE POLICY "Tenant admins manage user_agent_assignments" ON public.user_agent_assignments
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'))
  WITH CHECK (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

CREATE TABLE IF NOT EXISTS public.org_business_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.org_practices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id uuid REFERENCES public.org_business_units(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.org_capability_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid NOT NULL REFERENCES public.org_practices(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_org_capability_areas_parent ON public.org_capability_areas(practice_id);

CREATE TABLE IF NOT EXISTS public.org_service_functions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_area_id uuid NOT NULL REFERENCES public.org_capability_areas(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_org_service_functions_parent ON public.org_service_functions(capability_area_id);

CREATE TABLE IF NOT EXISTS public.org_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_function_id uuid NOT NULL REFERENCES public.org_service_functions(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_org_workflows_parent ON public.org_workflows(service_function_id);

CREATE TABLE IF NOT EXISTS public.org_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.org_workflows(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_org_activities_parent ON public.org_activities(workflow_id);

CREATE TABLE IF NOT EXISTS public.org_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.org_activities(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_org_tasks_parent ON public.org_tasks(activity_id);

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'org_business_units','org_practices','org_capability_areas',
    'org_service_functions','org_workflows','org_activities','org_tasks'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE TRIGGER set_updated_at_%1$s BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
  END LOOP;
END $$;

ALTER TABLE public.org_capability_areas ALTER COLUMN description SET DEFAULT '';
ALTER TABLE public.org_capability_areas ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.org_business_units ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.org_practices ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.org_service_functions ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.org_workflows ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.org_activities ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.org_tasks ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.crm_departments ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.crm_teams ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.agents_catalog ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.tools_catalog ALTER COLUMN description SET DEFAULT '', ALTER COLUMN description SET NOT NULL;

ALTER TABLE public.org_practices DROP COLUMN IF EXISTS business_unit_id;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_approval_status_check
  CHECK (approval_status IN ('pending','approved','rejected'));

CREATE OR REPLACE FUNCTION public.is_user_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND approval_status = 'approved'
  ) OR public.is_platform_admin(_user_id);
$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS time_zone text,
  ADD COLUMN IF NOT EXISTS preferred_language text;

DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable" ON storage.objects for select
using (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects for update
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects for delete
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, uuid, tenant_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_user_approved(uuid) FROM anon;

ALTER TABLE public.crm_stakeholders
  ADD COLUMN IF NOT EXISTS stakeholder_code text,
  ADD COLUMN IF NOT EXISTS stakeholder_type text,
  ADD COLUMN IF NOT EXISTS stakeholder_category text,
  ADD COLUMN IF NOT EXISTS organization_name text,
  ADD COLUMN IF NOT EXISTS department_name text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS alternate_phone text,
  ADD COLUMN IF NOT EXISTS preferred_contact_method text,
  ADD COLUMN IF NOT EXISTS preferred_contact_time text,
  ADD COLUMN IF NOT EXISTS time_zone text,
  ADD COLUMN IF NOT EXISTS project_code text,
  ADD COLUMN IF NOT EXISTS project_name text,
  ADD COLUMN IF NOT EXISTS program_name text,
  ADD COLUMN IF NOT EXISTS portfolio_name text,
  ADD COLUMN IF NOT EXISTS account_name text,
  ADD COLUMN IF NOT EXISTS business_unit text,
  ADD COLUMN IF NOT EXISTS practice_area text,
  ADD COLUMN IF NOT EXISTS project_phase text,
  ADD COLUMN IF NOT EXISTS stakeholder_role text,
  ADD COLUMN IF NOT EXISTS responsibility text,
  ADD COLUMN IF NOT EXISTS ownership_area text,
  ADD COLUMN IF NOT EXISTS involvement_level text,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS internal_external text,
  ADD COLUMN IF NOT EXISTS primary_secondary text,
  ADD COLUMN IF NOT EXISTS direct_indirect text,
  ADD COLUMN IF NOT EXISTS decision_maker boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS approver boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS influencer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS impacted_by_project boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS beneficiary boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS regulatory_or_compliance_role boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS power_level text,
  ADD COLUMN IF NOT EXISTS interest_level text,
  ADD COLUMN IF NOT EXISTS impact_level text,
  ADD COLUMN IF NOT EXISTS urgency_level text,
  ADD COLUMN IF NOT EXISTS legitimacy_level text,
  ADD COLUMN IF NOT EXISTS priority_level text,
  ADD COLUMN IF NOT EXISTS support_level text,
  ADD COLUMN IF NOT EXISTS attitude text,
  ADD COLUMN IF NOT EXISTS risk_sensitivity text,
  ADD COLUMN IF NOT EXISTS power_interest_category text,
  ADD COLUMN IF NOT EXISTS stakeholder_management_strategy text,
  ADD COLUMN IF NOT EXISTS current_engagement_level text,
  ADD COLUMN IF NOT EXISTS desired_engagement_level text,
  ADD COLUMN IF NOT EXISTS engagement_gap text,
  ADD COLUMN IF NOT EXISTS engagement_strategy text,
  ADD COLUMN IF NOT EXISTS engagement_owner text,
  ADD COLUMN IF NOT EXISTS relationship_health text,
  ADD COLUMN IF NOT EXISTS communication_method text,
  ADD COLUMN IF NOT EXISTS communication_frequency text,
  ADD COLUMN IF NOT EXISTS communication_format text,
  ADD COLUMN IF NOT EXISTS information_needs text,
  ADD COLUMN IF NOT EXISTS reporting_needs text,
  ADD COLUMN IF NOT EXISTS meeting_cadence text,
  ADD COLUMN IF NOT EXISTS communication_owner text,
  ADD COLUMN IF NOT EXISTS last_contacted_date date,
  ADD COLUMN IF NOT EXISTS next_followup_date date,
  ADD COLUMN IF NOT EXISTS communication_notes text,
  ADD COLUMN IF NOT EXISTS decision_authority text,
  ADD COLUMN IF NOT EXISTS approval_authority text,
  ADD COLUMN IF NOT EXISTS approval_areas text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS approval_limit text,
  ADD COLUMN IF NOT EXISTS signoff_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS signoff_stage text,
  ADD COLUMN IF NOT EXISTS escalation_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS escalation_path text,
  ADD COLUMN IF NOT EXISTS governance_role text,
  ADD COLUMN IF NOT EXISTS raci_role text,
  ADD COLUMN IF NOT EXISTS responsible_for text,
  ADD COLUMN IF NOT EXISTS accountable_for text,
  ADD COLUMN IF NOT EXISTS consulted_for text,
  ADD COLUMN IF NOT EXISTS informed_for text,
  ADD COLUMN IF NOT EXISTS key_expectations text,
  ADD COLUMN IF NOT EXISTS success_criteria text,
  ADD COLUMN IF NOT EXISTS key_concerns text,
  ADD COLUMN IF NOT EXISTS pain_points text,
  ADD COLUMN IF NOT EXISTS business_needs text,
  ADD COLUMN IF NOT EXISTS constraints text,
  ADD COLUMN IF NOT EXISTS assumptions text,
  ADD COLUMN IF NOT EXISTS stakeholder_risk_level text,
  ADD COLUMN IF NOT EXISTS risk_description text,
  ADD COLUMN IF NOT EXISTS possible_project_impact text,
  ADD COLUMN IF NOT EXISTS mitigation_plan text,
  ADD COLUMN IF NOT EXISTS issue_history text,
  ADD COLUMN IF NOT EXISTS open_actions text,
  ADD COLUMN IF NOT EXISTS escalation_notes text,
  ADD COLUMN IF NOT EXISTS change_impact_level text,
  ADD COLUMN IF NOT EXISTS change_readiness text,
  ADD COLUMN IF NOT EXISTS training_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS adoption_owner text,
  ADD COLUMN IF NOT EXISTS resistance_reason text,
  ADD COLUMN IF NOT EXISTS change_management_strategy text,
  ADD COLUMN IF NOT EXISTS attachments text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_documents text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meeting_notes text,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

ALTER TABLE public.crm_companies
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lifecycle_stage text NOT NULL DEFAULT 'prospect';
CREATE INDEX IF NOT EXISTS idx_crm_companies_tenant_id ON public.crm_companies(tenant_id);

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS source_company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_admin_email text;
CREATE INDEX IF NOT EXISTS idx_tenants_source_company_id ON public.tenants(source_company_id);

CREATE TABLE IF NOT EXISTS public.integrations_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  auth_type text NOT NULL DEFAULT 'oauth',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.integrations_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read integrations_catalog" ON public.integrations_catalog;
DROP POLICY IF EXISTS "Authenticated read integrations_catalog" ON public.integrations_catalog;
CREATE POLICY "Authenticated read integrations_catalog" ON public.integrations_catalog FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Platform admins manage integrations_catalog" ON public.integrations_catalog;
DROP POLICY IF EXISTS "Platform admins manage integrations_catalog" ON public.integrations_catalog;
CREATE POLICY "Platform admins manage integrations_catalog" ON public.integrations_catalog FOR ALL TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_integrations_catalog_updated ON public.integrations_catalog;
DROP TRIGGER IF EXISTS trg_integrations_catalog_updated ON public.integrations_catalog;
CREATE TRIGGER trg_integrations_catalog_updated BEFORE UPDATE ON public.integrations_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.tenant_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  integration_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'not_installed',
  enabled boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, integration_id)
);

ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members read tenant_integrations" ON public.tenant_integrations;
DROP POLICY IF EXISTS "Members read tenant_integrations" ON public.tenant_integrations;
CREATE POLICY "Members read tenant_integrations" ON public.tenant_integrations FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()) OR is_tenant_member(auth.uid(), tenant_id));
DROP POLICY IF EXISTS "Platform admins manage tenant_integrations" ON public.tenant_integrations;
DROP POLICY IF EXISTS "Platform admins manage tenant_integrations" ON public.tenant_integrations;
CREATE POLICY "Platform admins manage tenant_integrations" ON public.tenant_integrations FOR ALL TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_tenant_integrations_updated ON public.tenant_integrations;
DROP TRIGGER IF EXISTS trg_tenant_integrations_updated ON public.tenant_integrations;
CREATE TRIGGER trg_tenant_integrations_updated BEFORE UPDATE ON public.tenant_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.integrations_catalog (key, name, description, category, icon, auth_type) VALUES
  ('servicenow', 'ServiceNow', 'ITSM tickets, incidents, change requests', 'ITSM', 'ticket', 'oauth'),
  ('jira', 'Jira', 'Issue and project tracking', 'DevOps', 'kanban', 'oauth'),
  ('slack', 'Slack', 'Team messaging and notifications', 'Collaboration', 'message-square', 'oauth'),
  ('github', 'GitHub', 'Source control and CI events', 'DevOps', 'github', 'oauth'),
  ('datadog', 'Datadog', 'Metrics, traces, and monitoring', 'Observability', 'activity', 'api_key'),
  ('splunk', 'Splunk', 'Log analytics and SIEM', 'Observability', 'search', 'api_key'),
  ('azure', 'Azure', 'Cloud resources and identity', 'Cloud', 'cloud', 'oauth'),
  ('aws', 'AWS', 'Cloud resources and services', 'Cloud', 'cloud', 'iam_role');

DROP POLICY IF EXISTS "Users self-join tenant on signup" ON public.tenant_memberships;
DROP POLICY IF EXISTS "Users self-join tenant on signup" ON public.tenant_memberships;
CREATE POLICY "Users self-join tenant on signup" ON public.tenant_memberships FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'tenant_member'::tenant_role
    AND public.is_user_approved(auth.uid())
  );

INSERT INTO public.tools_catalog (key, name, description, route, category, is_active) VALUES
  ('nav-operations',   'Operations Overview',                          'Real-time operational health and incidents',                      '/operations',                                  'Sidebar', true),
  ('nav-runops',       'RunOps Practice',                              'IT, EUC, Cloud, Network, App, Data, SRE, EHR, Workforce',         '/practice-library',                            'Sidebar', true),
  ('nav-cyber',        'Cyber Security Practice',                      'IAM, SOC, EDR/XDR, CNAPP, Vulnerability, GRC, DLP, DevSecOps, IR','/practice-library/cyber-security',             'Sidebar', true),
  ('nav-carveout',     'IT Carve-Out & Separation Operating Model',    'Carve-out programs, workstreams, and dashboards',                 '/carve-out',                                   'Sidebar', true),
  ('nav-itsm',         'IT Service Desk & ITSM Operations',            'Executive ITSM, incidents, alerts, change management',            '/itsm',                                        'Sidebar', true),
  ('nav-services',     'Business Services',                            'Service portfolio and health',                                    '/itsm/exec-biz-ops/business-services',         'Sidebar', true),
  ('nav-coworkers',    'Digital Coworkers',                            'SRE, Network, Infra, Carve-out, Healthcare Payer',                '/coworkers',                                   'Sidebar', true),
  ('nav-vendors',      'Vendor Management',                            'Vendor scorecards and SLA tracking',                              '/vendors',                                     'Sidebar', true),
  ('nav-reports',      'Reports & Analytics',                          'Executive reports and analytics',                                 '/reports',                                     'Sidebar', true),
  ('nav-risk',         'Risk & Compliance',                            'Operational, security, and compliance risk',                      '/risk',                                        'Sidebar', true),
  ('nav-knowledge',    'Knowledge Center',                             'Knowledge articles and runbooks',                                 '/knowledge',                                   'Sidebar', true),
  ('nav-audit',        'Audit & Logs',                                 'Audit trail and system logs',                                     '/audit',                                       'Sidebar', true);

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'crm_companies','crm_stakeholders','crm_departments','crm_teams',
    'crm_activities','crm_notes','stakeholder_registers'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can view %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can insert %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can update %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can delete %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Platform admins manage %1$s" ON public.;
CREATE POLICY "Platform admins manage %1$s" ON public.%1$s FOR ALL TO authenticated USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Approved users read %1$s" ON public.;
CREATE POLICY "Approved users read %1$s" ON public.%1$s FOR SELECT TO authenticated USING (public.is_user_approved(auth.uid()))', t);
  END LOOP;
END $$;

-- drop ones added separately
DROP POLICY IF EXISTS "Anyone can view stakeholder registers" ON public.stakeholder_registers;
DROP POLICY IF EXISTS "Anyone can insert stakeholder registers" ON public.stakeholder_registers;
DROP POLICY IF EXISTS "Anyone can update stakeholder registers" ON public.stakeholder_registers;
DROP POLICY IF EXISTS "Anyone can delete stakeholder registers" ON public.stakeholder_registers;

-- org tenant_id + tenant-scoped policies + auto-fill trigger
ALTER TABLE public.org_business_units    ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_practices         ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_capability_areas  ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_service_functions ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_workflows         ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_activities        ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.org_tasks             ADD COLUMN IF NOT EXISTS tenant_id uuid;

CREATE INDEX IF NOT EXISTS idx_org_business_units_tenant    ON public.org_business_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_practices_tenant         ON public.org_practices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_capability_areas_tenant  ON public.org_capability_areas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_service_functions_tenant ON public.org_service_functions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_workflows_tenant         ON public.org_workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_activities_tenant        ON public.org_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_tasks_tenant             ON public.org_tasks(tenant_id);

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
    EXECUTE format('DROP TRIGGER IF EXISTS set_tenant_id ON public.;
CREATE TRIGGER set_tenant_id BEFORE INSERT ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership()', t);

    EXECUTE format($p$
      DROP POLICY IF EXISTS "Tenant members read %1$s" ON public.;
CREATE POLICY "Tenant members read %1$s" ON public.%1$s
      FOR SELECT TO authenticated
      USING (is_platform_admin(auth.uid()) OR is_tenant_member(auth.uid(), tenant_id))
    $p$, t);

    EXECUTE format($p$
      DROP POLICY IF EXISTS "Tenant admins insert %1$s" ON public.;
CREATE POLICY "Tenant admins insert %1$s" ON public.%1$s
      FOR INSERT TO authenticated
      WITH CHECK (
        is_platform_admin(auth.uid())
        OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'::tenant_role)
      )
    $p$, t);

    EXECUTE format($p$
      DROP POLICY IF EXISTS "Tenant admins update %1$s" ON public.;
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
      DROP POLICY IF EXISTS "Tenant admins delete %1$s" ON public.;
CREATE POLICY "Tenant admins delete %1$s" ON public.%1$s
      FOR DELETE TO authenticated
      USING (
        is_platform_admin(auth.uid())
        OR has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'::tenant_role)
      )
    $p$, t);
  END LOOP;
END $$;

-- handle_new_user with full super-admin list and personal-domain block
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  super_admin_emails text[] := ARRAY[
    'ryan.blackwell@neurealm.com',
    'vidyarth.v@neurealm.com',
    'bala.janagaraja@neurealm.com',
    'srikanth.burra@neurealm.com'
  ];
  blocked_domains text[] := ARRAY[
    'gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','yahoo.co.in','ymail.com','rocketmail.com',
    'hotmail.com','outlook.com','live.com','msn.com','passport.com',
    'aol.com','icloud.com','me.com','mac.com','proton.me','protonmail.com','pm.me',
    'zoho.com','gmx.com','gmx.net','mail.com','yandex.com','yandex.ru','tutanota.com',
    'fastmail.com','hey.com','duck.com','qq.com','163.com','126.com','sina.com','naver.com','rediffmail.com'
  ];
  is_super boolean;
  is_invited boolean;
  email_domain text;
BEGIN
  email_domain := lower(split_part(NEW.email, '@', 2));
  is_super := lower(NEW.email) = ANY(super_admin_emails);
  is_invited := (NEW.raw_user_meta_data ? 'invited_to_tenant')
                OR (NEW.invited_at IS NOT NULL);

  IF NOT is_super AND NOT is_invited AND email_domain = ANY(blocked_domains) THEN
    RAISE EXCEPTION 'Please use your work email — personal email domains are not allowed';
  END IF;

  INSERT INTO public.profiles (user_id, email, display_name, approval_status, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN is_super OR is_invited THEN 'approved' ELSE 'pending' END,
    CASE WHEN is_super OR is_invited THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

  IF is_super THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'platform_admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tenants public anon read of safe columns only
GRANT SELECT (id, name, slug, logo_url, status) ON public.tenants TO anon;
DROP POLICY IF EXISTS "Public read tenant basics" ON public.tenants;
DROP POLICY IF EXISTS "Public read tenant basics" ON public.tenants;
CREATE POLICY "Public read tenant basics" ON public.tenants FOR SELECT
  TO anon
  USING (true);

-- Prevent profile self-approval
REVOKE UPDATE (approval_status, approved_by, approved_at) ON public.profiles FROM authenticated;

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile basic fields" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile basic fields" ON public.profiles;
CREATE POLICY "Users update own profile basic fields" ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Platform admins update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins update any profile" ON public.profiles;
CREATE POLICY "Platform admins update any profile" ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Safety GRANTs for every public table (idempotent)
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', r.tablename);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', r.tablename);
  END LOOP;
END $$;
