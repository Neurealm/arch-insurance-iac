-- BP1.1 Platform Security Regression
-- Verifies anon revocations, SECURITY DEFINER hygiene, and privileged RPC
-- gating. Runs in a transaction and rolls back at the end.
--
-- Usage:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1_platform_security.sql

\set ON_ERROR_STOP on
BEGIN;

DO $sec$
DECLARE
  v_prefix constant text := 'BP1_1_SECURITY_FAIL: ';
  v_privileged constant text[] := ARRAY[
    'provision_tenant','invite_member','resend_invitation','cancel_invitation',
    'accept_invitation','set_membership_status','assign_membership_role',
    'remove_membership_role','create_tenant_role','update_tenant_role',
    'archive_tenant_role','assign_role_permission','remove_role_permission',
    'update_tenant','emit_audit_event','bootstrap_tenant_default_roles',
    'count_active_tenant_admins','get_current_access_context','has_permission'
  ];
  v_fn text;
  v_bad_count int;
BEGIN
  -- 1. Anon must NOT hold EXECUTE on privileged BP1.1 RPCs.
  FOREACH v_fn IN ARRAY v_privileged LOOP
    IF EXISTS (
      SELECT 1
        FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname='public' AND p.proname = v_fn
         AND has_function_privilege('anon', p.oid, 'EXECUTE')
    ) THEN
      RAISE EXCEPTION '%anon has EXECUTE on public.%()', v_prefix, v_fn;
    END IF;
  END LOOP;

  -- 2. Every SECURITY DEFINER function in public must set an explicit search_path.
  SELECT count(*) INTO v_bad_count
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname='public' AND p.prosecdef = true
     AND NOT EXISTS (
       SELECT 1 FROM unnest(coalesce(p.proconfig,'{}'::text[])) c
        WHERE c LIKE 'search_path=%'
     );
  IF v_bad_count > 0 THEN
    RAISE EXCEPTION '%% % SECURITY DEFINER function(s) missing search_path', v_prefix, v_bad_count;
  END IF;

  -- 3. anon must NOT have SELECT on canonical BP1.1 tables.
  IF EXISTS (
    SELECT 1 FROM information_schema.role_table_grants
     WHERE grantee='anon' AND table_schema='public'
       AND table_name IN ('tenants','memberships','tenant_roles',
         'tenant_role_permissions','membership_roles','tenant_invitations',
         'tenant_invitation_roles','audit_events','permissions')
       AND privilege_type='SELECT'
  ) THEN
    RAISE EXCEPTION '%anon retains SELECT on a canonical table', v_prefix;
  END IF;

  -- 4. audit_events must have UPDATE/DELETE rejection trigger.
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
     WHERE c.relname='audit_events' AND NOT t.tgisinternal
  ) THEN
    RAISE EXCEPTION '%audit_events lacks append-only trigger', v_prefix;
  END IF;

  RAISE NOTICE 'BP1_1_SECURITY_PASS';
END $sec$;

ROLLBACK;
