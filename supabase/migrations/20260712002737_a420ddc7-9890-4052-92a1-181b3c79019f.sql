
-- 1) Invert runops_can_write to allow-list of writer roles
CREATE OR REPLACE FUNCTION public.runops_can_write(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_platform_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.runops_role_assignments
        WHERE tenant_id = _tenant_id
          AND user_id = auth.uid()
          AND role IN (
            'sre_engineer',
            'noc_operator',
            'incident_commander',
            'service_owner',
            'runbook_author',
            'change_manager',
            'digital_worker_administrator',
            'platform_engineer',
            'demo_controller'
          )
      );
$$;

-- 2) Restrict avatars bucket listing/reads via API (public URLs still work)
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;

-- 3) Lock down internal SECURITY DEFINER functions - only usable via triggers or edge functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_user_category_from_email() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_user_login_event(uuid, text, text, text, text, text, text, jsonb) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_user_page_activity(uuid, integer, integer) FROM anon, authenticated, PUBLIC;

-- Revoke anon execute on functions that require authentication
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_user_approved(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_can_write(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_has_any_role(uuid, public.runops_role[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_has_role(uuid, public.runops_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_has_tenant_access(uuid) FROM anon;
