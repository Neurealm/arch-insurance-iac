-- Targeted repair of the SECURITY DEFINER hardening regression.
--
-- Root cause: the prior hardening migration revoked EXECUTE on every
-- SECURITY DEFINER function from `authenticated`. RLS policy predicates
-- are evaluated as the invoking role, so predicates that call helper
-- functions require the invoking role to hold EXECUTE on those helpers
-- even when the helper itself is SECURITY DEFINER. As a result,
-- authenticated reads on public.profiles and public.user_roles (and every
-- public.runops_* table) began returning 403 / "permission denied for
-- function ...".
--
-- Fix: restore EXECUTE to `authenticated` on ONLY the helpers that are
-- referenced by existing RLS policies. Mutation RPCs (runops_advance_scenario,
-- runops_reset_scenario, runops_resolve_incident, runops_approve_change,
-- runops_approve_execution, runops_deny_execution,
-- runops_certify_runbook_version, runops_bootstrap_current_user) are NOT
-- re-granted -- they are not invoked from the client and remain
-- service-role only, preserving the prior hardening.
--
-- Helpers referenced by RLS policies (verified via pg_policy inspection):
--   * public.is_platform_admin(uuid)        -> profiles, user_roles,
--                                              tools_catalog, agents_catalog,
--                                              crm_* policies
--   * public.runops_has_tenant_access(uuid) -> every runops_* _read policy
--   * public.runops_can_write(uuid)         -> every runops_* _write policy
--
-- Helpers NOT re-granted (not referenced by any current RLS policy):
--   * public.has_role(uuid, app_role)
--   * public.is_user_approved(uuid)
--   * public.runops_has_role / runops_has_any_role
--     (called only from inside other SECURITY DEFINER functions, which run
--      as their owner and therefore do not need caller EXECUTE.)
--
-- All targeted functions are SECURITY DEFINER with an explicit
-- `SET search_path = public`, take typed parameters, scope by auth.uid()
-- and/or tenant membership, and do not accept caller-controlled SQL.
-- They are safe to expose to authenticated for indirect invocation via
-- RLS. `anon` is intentionally NOT granted -- no anonymous workflow
-- reads these tables. Statements below are idempotent.

-- is_platform_admin: required for profiles + user_roles + several admin-managed catalog policies.
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated;

-- runops_has_tenant_access: required for every runops_* SELECT policy.
GRANT EXECUTE ON FUNCTION public.runops_has_tenant_access(uuid) TO authenticated;

-- runops_can_write: required for every runops_* write policy (INSERT/UPDATE/DELETE).
GRANT EXECUTE ON FUNCTION public.runops_can_write(uuid) TO authenticated;

-- Explicitly ensure no anon exposure of these helpers.
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_has_tenant_access(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_can_write(uuid) FROM anon;

COMMENT ON FUNCTION public.is_platform_admin(uuid) IS
  'SECURITY DEFINER helper. EXECUTE granted to authenticated because it is referenced by RLS policies on profiles, user_roles, and admin-managed catalog tables. Not granted to anon.';
COMMENT ON FUNCTION public.runops_has_tenant_access(uuid) IS
  'SECURITY DEFINER helper. EXECUTE granted to authenticated because every runops_* SELECT policy calls it. Not granted to anon.';
COMMENT ON FUNCTION public.runops_can_write(uuid) IS
  'SECURITY DEFINER helper. EXECUTE granted to authenticated because every runops_* write policy calls it. Not granted to anon.';
