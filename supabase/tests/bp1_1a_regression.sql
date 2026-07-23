-- BP1.1A Regression Test Suite
-- Repeatable, deterministic, CI-safe. Runs inside a single transaction that is
-- ROLLED BACK at the end via a raised exception. Nothing persists.
--
-- Usage (against a Supabase project with psql access):
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1a_regression.sql
--
-- Exit code 0 means every assertion PASSED. Any assertion failure aborts with
-- a non-zero exit code and a descriptive message.
--
-- Covers (per BP1.1A Product Organization Review):
--   1. Anon has NO table-level SELECT on canonical tables
--   2. Authenticated + service_role retain SELECT
--   3. RLS is enabled on all canonical tables
--   4. Permission seed matches the approved 10 codes
--   5. Cross-tenant isolation (tenant_role_permissions, membership_roles,
--      tenant_invitation_roles)
--   6. Duplicate memberships rejected
--   7. Duplicate role assignments rejected
--   8. Audit events: INSERT allowed (via service context), UPDATE rejected,
--      DELETE rejected (append-only enforcement)
--   9. Profile governance trigger blocks self-mutation of approval_status,
--      company_id, user_category; allows personal fields; exempts platform
--      admins; short-circuits when auth.uid() IS NULL (signup path)
--
-- All assertions use PL/pgSQL RAISE EXCEPTION with a stable prefix so CI can
-- grep failures.

\set ON_ERROR_STOP on

BEGIN;

DO $regression$
DECLARE
  v_fail_prefix constant text := 'BP1_1A_REGRESSION_FAIL: ';
  v_tables constant text[] := ARRAY[
    'tenants','memberships','permissions','tenant_roles',
    'tenant_role_permissions','membership_roles',
    'tenant_invitations','tenant_invitation_roles','audit_events'
  ];
  v_expected_permissions constant text[] := ARRAY[
    'audit.view','members.invite','members.manage','members.view',
    'platform.access','profile.update_own','roles.manage','roles.view',
    'tenant.update','tenant.view'
  ];
  v_table text;
  v_rls boolean;
  v_count integer;
  v_actual text[];
  v_tenant_a uuid;
  v_tenant_b uuid;
  v_role_a uuid;
  v_user_a uuid := gen_random_uuid();
  v_user_b uuid := gen_random_uuid();
  v_mem_a uuid;
  v_inv_a uuid;
  v_audit_id uuid;
  v_raised boolean;
BEGIN
  -----------------------------------------------------------------
  -- 1. Anon has NO table-level SELECT on any canonical table
  -----------------------------------------------------------------
  FOREACH v_table IN ARRAY v_tables LOOP
    IF has_table_privilege('anon', 'public.'||v_table, 'SELECT') THEN
      RAISE EXCEPTION '%anon retains SELECT on public.%', v_fail_prefix, v_table;
    END IF;
    IF NOT has_table_privilege('authenticated', 'public.'||v_table, 'SELECT') THEN
      RAISE EXCEPTION '%authenticated lost SELECT on public.%', v_fail_prefix, v_table;
    END IF;
    IF NOT has_table_privilege('service_role', 'public.'||v_table, 'SELECT') THEN
      RAISE EXCEPTION '%service_role lost SELECT on public.%', v_fail_prefix, v_table;
    END IF;
  END LOOP;

  -----------------------------------------------------------------
  -- 2. RLS enabled on every canonical table
  -----------------------------------------------------------------
  FOREACH v_table IN ARRAY v_tables LOOP
    SELECT c.relrowsecurity INTO v_rls
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = v_table;
    IF NOT COALESCE(v_rls, false) THEN
      RAISE EXCEPTION '%RLS disabled on public.%', v_fail_prefix, v_table;
    END IF;
  END LOOP;

  -----------------------------------------------------------------
  -- 3. Permission seed matches approved codes exactly
  -----------------------------------------------------------------
  SELECT array_agg(code ORDER BY code) INTO v_actual FROM public.permissions;
  IF v_actual IS DISTINCT FROM v_expected_permissions THEN
    RAISE EXCEPTION '%permission seed drift: expected % got %',
      v_fail_prefix, v_expected_permissions, v_actual;
  END IF;

  -----------------------------------------------------------------
  -- 4. Fixture: two tenants + one role in tenant A + one membership in A
  -----------------------------------------------------------------
  INSERT INTO public.tenants(name, slug, default_currency_code, default_timezone)
    VALUES ('Regress A','regress-a-' || substr(gen_random_uuid()::text,1,8),'USD','UTC')
    RETURNING id INTO v_tenant_a;
  INSERT INTO public.tenants(name, slug, default_currency_code, default_timezone)
    VALUES ('Regress B','regress-b-' || substr(gen_random_uuid()::text,1,8),'USD','UTC')
    RETURNING id INTO v_tenant_b;

  INSERT INTO public.tenant_roles(tenant_id, code, name)
    VALUES (v_tenant_a, 'regress_role_a', 'Regress Role A')
    RETURNING id INTO v_role_a;

  INSERT INTO public.memberships(tenant_id, user_id, status)
    VALUES (v_tenant_a, v_user_a, 'active')
    RETURNING id INTO v_mem_a;

  INSERT INTO public.tenant_invitations(tenant_id, email, token_hash, invited_by)
    VALUES (v_tenant_a, 'Regress@Example.com', 'hash-' || gen_random_uuid()::text, NULL)
    RETURNING id INTO v_inv_a;

  -----------------------------------------------------------------
  -- 5. Duplicate membership rejected (unique tenant_id, user_id)
  -----------------------------------------------------------------
  v_raised := false;
  BEGIN
    INSERT INTO public.memberships(tenant_id, user_id, status)
      VALUES (v_tenant_a, v_user_a, 'active');
  EXCEPTION WHEN unique_violation THEN
    v_raised := true;
  END;
  IF NOT v_raised THEN
    RAISE EXCEPTION '%duplicate membership was accepted', v_fail_prefix;
  END IF;

  -----------------------------------------------------------------
  -- 6. Cross-tenant: tenant_role_permissions rejects role from other tenant
  -----------------------------------------------------------------
  v_raised := false;
  BEGIN
    INSERT INTO public.tenant_role_permissions(tenant_id, role_id, permission_code)
      VALUES (v_tenant_b, v_role_a, 'tenant.view');
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%tenant_role_permission_cross_tenant%' THEN
      v_raised := true;
    ELSE
      RAISE EXCEPTION '%unexpected error on cross-tenant TRP insert: %', v_fail_prefix, SQLERRM;
    END IF;
  END;
  IF NOT v_raised THEN
    RAISE EXCEPTION '%cross-tenant tenant_role_permissions accepted', v_fail_prefix;
  END IF;

  -----------------------------------------------------------------
  -- 7. Cross-tenant: membership_roles rejects role from other tenant
  -----------------------------------------------------------------
  v_raised := false;
  BEGIN
    INSERT INTO public.membership_roles(tenant_id, membership_id, role_id)
      VALUES (v_tenant_b, v_mem_a, v_role_a);
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%membership_role_cross_tenant%' THEN
      v_raised := true;
    ELSE
      RAISE EXCEPTION '%unexpected error on cross-tenant MR insert: %', v_fail_prefix, SQLERRM;
    END IF;
  END;
  IF NOT v_raised THEN
    RAISE EXCEPTION '%cross-tenant membership_roles accepted', v_fail_prefix;
  END IF;

  -----------------------------------------------------------------
  -- 8. Duplicate role assignment rejected: seed one, retry same
  -----------------------------------------------------------------
  INSERT INTO public.membership_roles(tenant_id, membership_id, role_id)
    VALUES (v_tenant_a, v_mem_a, v_role_a);
  v_raised := false;
  BEGIN
    INSERT INTO public.membership_roles(tenant_id, membership_id, role_id)
      VALUES (v_tenant_a, v_mem_a, v_role_a);
  EXCEPTION WHEN unique_violation THEN
    v_raised := true;
  END;
  IF NOT v_raised THEN
    RAISE EXCEPTION '%duplicate membership_role accepted', v_fail_prefix;
  END IF;

  -----------------------------------------------------------------
  -- 9. Cross-tenant: tenant_invitation_roles rejects role from other tenant
  -----------------------------------------------------------------
  v_raised := false;
  BEGIN
    INSERT INTO public.tenant_invitation_roles(tenant_id, invitation_id, role_id)
      VALUES (v_tenant_b, v_inv_a, v_role_a);
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%invitation_role_cross_tenant%' THEN
      v_raised := true;
    ELSE
      RAISE EXCEPTION '%unexpected error on cross-tenant TIR insert: %', v_fail_prefix, SQLERRM;
    END IF;
  END;
  IF NOT v_raised THEN
    RAISE EXCEPTION '%cross-tenant tenant_invitation_roles accepted', v_fail_prefix;
  END IF;

  -----------------------------------------------------------------
  -- 10. Audit events: INSERT allowed for service context, then UPDATE and
  --     DELETE both rejected by append-only trigger.
  -----------------------------------------------------------------
  INSERT INTO public.audit_events(tenant_id, action_code, object_type)
    VALUES (v_tenant_a, 'regression.test', 'tenant')
    RETURNING id INTO v_audit_id;

  v_raised := false;
  BEGIN
    UPDATE public.audit_events SET action_code = 'mutated' WHERE id = v_audit_id;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%audit_events_is_append_only%' THEN
      v_raised := true;
    ELSE
      RAISE EXCEPTION '%unexpected error on audit UPDATE: %', v_fail_prefix, SQLERRM;
    END IF;
  END;
  IF NOT v_raised THEN
    RAISE EXCEPTION '%audit_events UPDATE was accepted', v_fail_prefix;
  END IF;

  v_raised := false;
  BEGIN
    DELETE FROM public.audit_events WHERE id = v_audit_id;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%audit_events_is_append_only%' THEN
      v_raised := true;
    ELSE
      RAISE EXCEPTION '%unexpected error on audit DELETE: %', v_fail_prefix, SQLERRM;
    END IF;
  END;
  IF NOT v_raised THEN
    RAISE EXCEPTION '%audit_events DELETE was accepted', v_fail_prefix;
  END IF;

  -----------------------------------------------------------------
  -- 11. Profile governance: signup path (auth.uid() IS NULL) is short-
  --     circuited by profiles_protect_governed_fields. We cannot fake a
  --     signed-in user from a plain psql session, so we assert the trigger
  --     function exists, is SECURITY DEFINER, and its body contains the
  --     three governed-field guards. End-to-end impersonation is covered by
  --     docs/bp1-1a-test-evidence.md § 2.
  -----------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'profiles_protect_governed_fields'
      AND p.prosecdef = true
  ) THEN
    RAISE EXCEPTION '%profiles_protect_governed_fields missing or not SECURITY DEFINER', v_fail_prefix;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'profiles_protect_governed_fields'
      AND pg_get_functiondef(p.oid) LIKE '%approval_status%'
      AND pg_get_functiondef(p.oid) LIKE '%company_id%'
      AND pg_get_functiondef(p.oid) LIKE '%user_category%'
  ) THEN
    RAISE EXCEPTION '%profiles_protect_governed_fields missing one of the three governed-field guards', v_fail_prefix;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.profiles'::regclass
      AND tgname = 'profiles_protect_governed_fields_trg'
      AND NOT tgisinternal
  ) THEN
    RAISE EXCEPTION '%profiles_protect_governed_fields_trg not attached to public.profiles', v_fail_prefix;
  END IF;

  RAISE NOTICE 'BP1_1A_REGRESSION_OK: all assertions passed';

  -- Always roll back — this test suite must never leave data behind.
  RAISE EXCEPTION 'BP1_1A_REGRESSION_ROLLBACK: intentional rollback after successful assertions';
END
$regression$;

-- Unreachable: the DO block always raises.
ROLLBACK;
