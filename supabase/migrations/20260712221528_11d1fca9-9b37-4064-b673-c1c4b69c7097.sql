-- Tighten EXECUTE privileges on SECURITY DEFINER functions.
-- Default Postgres grants EXECUTE to PUBLIC, which the Supabase linter (0029)
-- flags because it exposes SECURITY DEFINER functions to signed-in users
-- through PostgREST. Revoke from PUBLIC/anon everywhere, then re-grant to the
-- minimum set of roles that actually need to call each function (authenticated
-- for RLS helpers and user-invoked RPCs; service_role for admin/edge paths).
-- Trigger-only functions get no client-callable grants.

-- Trigger-only functions: no client role needs EXECUTE.
REVOKE ALL ON FUNCTION public.handle_new_user()                 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_user_category_from_email()    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column()        FROM PUBLIC, anon, authenticated;

-- RLS helper predicates: required by RLS policies evaluated as authenticated.
REVOKE ALL ON FUNCTION public.is_platform_admin(uuid)                    FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_platform_admin(uuid)                TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_user_approved(uuid)                     FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_user_approved(uuid)                 TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role)            FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)        TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_can_write(uuid)                     FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_can_write(uuid)                 TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_has_tenant_access(uuid)             FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_has_tenant_access(uuid)         TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_has_role(uuid, public.runops_role)  FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_has_role(uuid, public.runops_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_has_any_role(uuid, public.runops_role[]) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_has_any_role(uuid, public.runops_role[]) TO authenticated, service_role;

-- User-invoked RPCs: callable by authenticated users; internal checks in-function.
REVOKE ALL ON FUNCTION public.record_user_login_event(uuid, text, text, text, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.record_user_login_event(uuid, text, text, text, text, text, text, jsonb) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_bootstrap_current_user()            FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_bootstrap_current_user()        TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_advance_scenario(uuid, text)        FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_advance_scenario(uuid, text)    TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_reset_scenario(uuid, text)          FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_reset_scenario(uuid, text)      TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_resolve_incident(uuid, text)        FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_resolve_incident(uuid, text)    TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_approve_change(uuid, text)          FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_approve_change(uuid, text)      TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_approve_execution(uuid, text)       FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_approve_execution(uuid, text)   TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_deny_execution(uuid, text, text)    FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_deny_execution(uuid, text, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.runops_certify_runbook_version(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.runops_certify_runbook_version(uuid, text) TO authenticated, service_role;

-- Admin-only RPCs: enforce platform-admin check in-function; keep executable by authenticated
-- so admins reach it via the normal client, but revoke public/anon exposure.
REVOKE ALL ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_user_page_activity(uuid, integer, integer)  FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_user_page_activity(uuid, integer, integer) TO authenticated, service_role;
