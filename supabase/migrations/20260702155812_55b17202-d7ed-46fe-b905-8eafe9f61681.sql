GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_user_approved(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_tenant_role(uuid, uuid, tenant_role) TO authenticated, anon;