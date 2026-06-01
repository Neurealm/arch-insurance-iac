-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('platform_admin', 'platform_support');
CREATE TYPE public.tenant_role AS ENUM ('tenant_admin', 'tenant_manager', 'tenant_member');

-- =========================================================
-- CORE TABLES
-- =========================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status boolean NOT NULL DEFAULT true,
  logo_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.tenant_role NOT NULL DEFAULT 'tenant_member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
CREATE INDEX idx_tenant_memberships_user ON public.tenant_memberships(user_id);
CREATE INDEX idx_tenant_memberships_tenant ON public.tenant_memberships(tenant_id);

-- =========================================================
-- CATALOGS (provider-managed)
-- =========================================================

CREATE TABLE public.tools_catalog (
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

CREATE TABLE public.agents_catalog (
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

-- =========================================================
-- ASSIGNMENTS (tenant-level and user-level)
-- =========================================================

CREATE TABLE public.tenant_tool_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.tools_catalog(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, tool_id)
);
CREATE INDEX idx_tta_tenant ON public.tenant_tool_assignments(tenant_id);

CREATE TABLE public.tenant_agent_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents_catalog(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, agent_id)
);
CREATE INDEX idx_taa_tenant ON public.tenant_agent_assignments(tenant_id);

CREATE TABLE public.user_tool_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  tool_id uuid NOT NULL REFERENCES public.tools_catalog(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id, tool_id)
);
CREATE INDEX idx_uta_user ON public.user_tool_assignments(user_id);
CREATE INDEX idx_uta_tenant ON public.user_tool_assignments(tenant_id);

CREATE TABLE public.user_agent_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  agent_id uuid NOT NULL REFERENCES public.agents_catalog(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id, agent_id)
);
CREATE INDEX idx_uaa_user ON public.user_agent_assignments(user_id);
CREATE INDEX idx_uaa_tenant ON public.user_agent_assignments(tenant_id);

-- =========================================================
-- SECURITY DEFINER HELPER FUNCTIONS (no recursion in RLS)
-- =========================================================

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

-- =========================================================
-- TRIGGERS for updated_at
-- =========================================================

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tools_catalog_updated BEFORE UPDATE ON public.tools_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_agents_catalog_updated BEFORE UPDATE ON public.agents_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- ENABLE RLS
-- =========================================================
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

-- =========================================================
-- POLICIES: profiles
-- =========================================================
CREATE POLICY "Profiles readable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- POLICIES: user_roles
-- =========================================================
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- =========================================================
-- POLICIES: tenants
-- =========================================================
CREATE POLICY "Members or admins read tenant" ON public.tenants
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), id));
CREATE POLICY "Platform admins insert tenants" ON public.tenants
  FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Tenant admins update tenant" ON public.tenants
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), id, 'tenant_admin'));
CREATE POLICY "Platform admins delete tenants" ON public.tenants
  FOR DELETE TO authenticated USING (public.is_platform_admin(auth.uid()));

-- =========================================================
-- POLICIES: tenant_memberships
-- =========================================================
CREATE POLICY "Members read same-tenant memberships" ON public.tenant_memberships
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "Tenant admins manage memberships" ON public.tenant_memberships
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'))
  WITH CHECK (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

-- =========================================================
-- POLICIES: catalogs (read for any authenticated, write for platform admins)
-- =========================================================
CREATE POLICY "Authenticated read tools_catalog" ON public.tools_catalog
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Platform admins manage tools_catalog" ON public.tools_catalog
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Authenticated read agents_catalog" ON public.agents_catalog
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Platform admins manage agents_catalog" ON public.agents_catalog
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- =========================================================
-- POLICIES: tenant assignments
-- =========================================================
CREATE POLICY "Members read tenant_tool_assignments" ON public.tenant_tool_assignments
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "Platform admins manage tenant_tool_assignments" ON public.tenant_tool_assignments
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Members read tenant_agent_assignments" ON public.tenant_agent_assignments
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "Platform admins manage tenant_agent_assignments" ON public.tenant_agent_assignments
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- =========================================================
-- POLICIES: user assignments
-- =========================================================
CREATE POLICY "Self or tenant admin read user_tool_assignments" ON public.user_tool_assignments
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_platform_admin(auth.uid())
    OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin')
  );
CREATE POLICY "Tenant admins manage user_tool_assignments" ON public.user_tool_assignments
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'))
  WITH CHECK (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));

CREATE POLICY "Self or tenant admin read user_agent_assignments" ON public.user_agent_assignments
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_platform_admin(auth.uid())
    OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin')
  );
CREATE POLICY "Tenant admins manage user_agent_assignments" ON public.user_agent_assignments
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'))
  WITH CHECK (public.is_platform_admin(auth.uid()) OR public.has_tenant_role(auth.uid(), tenant_id, 'tenant_admin'));