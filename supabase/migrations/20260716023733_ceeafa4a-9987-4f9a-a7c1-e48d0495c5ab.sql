
DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon;', f.proname, f.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated, service_role;', f.proname, f.args);
  END LOOP;
END $$;

-- Trigger-only helper: no direct callers needed
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

-- handle_new_user runs from an auth trigger; no client role needs EXECUTE
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- seed_user_defaults is called from handle_new_user only
REVOKE ALL ON FUNCTION public.seed_user_defaults(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.seed_user_defaults(uuid, text) TO service_role;

-- set_user_category_from_email is a trigger function
REVOKE ALL ON FUNCTION public.set_user_category_from_email() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_category_from_email() TO service_role;

-- ETDM audit trigger functions
REVOKE ALL ON FUNCTION public.etdm_write_audit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.etdm_write_audit() TO service_role;
REVOKE ALL ON FUNCTION public.etdm_write_audit_domains() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.etdm_write_audit_domains() TO service_role;
REVOKE ALL ON FUNCTION public.etdm_enforce_practice() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.etdm_enforce_practice() TO service_role;
