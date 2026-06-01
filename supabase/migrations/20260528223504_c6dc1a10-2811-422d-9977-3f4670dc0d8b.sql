GRANT SELECT ON public.tenants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_memberships TO authenticated;
GRANT ALL ON public.tenant_memberships TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_tool_assignments TO authenticated;
GRANT ALL ON public.tenant_tool_assignments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tools_catalog TO authenticated;
GRANT ALL ON public.tools_catalog TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;