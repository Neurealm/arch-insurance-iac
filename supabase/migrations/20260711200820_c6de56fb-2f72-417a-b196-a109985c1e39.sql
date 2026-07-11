REVOKE EXECUTE ON FUNCTION public.runops_advance_scenario(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_reset_scenario(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_approve_change(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_approve_execution(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_deny_execution(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_certify_runbook_version(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_resolve_incident(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.runops_bootstrap_current_user() FROM anon;