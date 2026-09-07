-- BP1.1 Tenant Isolation Regression
-- Confirms RLS is enabled on tenant-owned tables and that cross-tenant
-- foreign-key associations are rejected by the tenant-scoping triggers.
--
-- Usage:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1_tenant_isolation.sql

\set ON_ERROR_STOP on
BEGIN;

DO $iso$
DECLARE
  v_prefix constant text := 'BP1_1_ISOLATION_FAIL: ';
  v_tenant_a uuid := gen_random_uuid();
  v_tenant_b uuid := gen_random_uuid();
  v_role_a uuid;
  v_mem_b uuid;
  v_inv_b uuid;
  v_tbl text;
  v_tables constant text[] := ARRAY[
    'tenants','memberships','tenant_roles','tenant_role_permissions',
    'membership_roles','tenant_invitations','tenant_invitation_roles','audit_events'
  ];
BEGIN
  -- 1. RLS is enabled on every canonical tenant-owned table.
  FOREACH v_tbl IN ARRAY v_tables LOOP
    IF NOT (SELECT c.relrowsecurity FROM pg_class c
              JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname = v_tbl) THEN
      RAISE EXCEPTION '%RLS not enabled on public.%', v_prefix, v_tbl;
    END IF;
  END LOOP;

  -- 2. Seed two tenants + minimal children as the definer superuser.
  INSERT INTO public.tenants(id, name, slug, status, default_currency_code, default_timezone)
    VALUES (v_tenant_a,'Tenant A','tenant-a-iso','active','USD','UTC'),
           (v_tenant_b,'Tenant B','tenant-b-iso','active','USD','UTC');

  INSERT INTO public.tenant_roles(id, tenant_id, code, name, status)
    VALUES (gen_random_uuid(), v_tenant_a, 'admin', 'Admin', 'active')
    RETURNING id INTO v_role_a;

  INSERT INTO public.memberships(id, tenant_id, user_id, status)
    VALUES (gen_random_uuid(), v_tenant_b, gen_random_uuid(), 'active')
    RETURNING id INTO v_mem_b;

  INSERT INTO public.tenant_invitations(id, tenant_id, email, normalized_email, status, token_hash, expires_at)
    VALUES (gen_random_uuid(), v_tenant_b, 'x@example.com','x@example.com','pending',
            encode(sha256(gen_random_uuid()::text::bytea),'hex'), now()+interval '7 days')
    RETURNING id INTO v_inv_b;

  -- 3. Cross-tenant membership_role must be rejected by trigger.
  BEGIN
    INSERT INTO public.membership_roles(membership_id, role_id, tenant_id)
      VALUES (v_mem_b, v_role_a, v_tenant_b);
    RAISE EXCEPTION '%membership_roles cross-tenant insert was not rejected', v_prefix;
  EXCEPTION WHEN raise_exception OR foreign_key_violation OR check_violation OR others THEN
    IF SQLERRM LIKE (v_prefix || '%') THEN RAISE; END IF;
  END;

  -- 4. Cross-tenant tenant_role_permissions must be rejected.
  BEGIN
    INSERT INTO public.tenant_role_permissions(role_id, permission_code, tenant_id)
      VALUES (v_role_a, 'tenant.view', v_tenant_b);
    RAISE EXCEPTION '%tenant_role_permissions cross-tenant insert not rejected', v_prefix;
  EXCEPTION WHEN raise_exception OR foreign_key_violation OR check_violation OR others THEN
    IF SQLERRM LIKE (v_prefix || '%') THEN RAISE; END IF;
  END;

  -- 5. Cross-tenant tenant_invitation_roles must be rejected.
  BEGIN
    INSERT INTO public.tenant_invitation_roles(invitation_id, role_id, tenant_id)
      VALUES (v_inv_b, v_role_a, v_tenant_b);
    RAISE EXCEPTION '%tenant_invitation_roles cross-tenant insert not rejected', v_prefix;
  EXCEPTION WHEN raise_exception OR foreign_key_violation OR check_violation OR others THEN
    IF SQLERRM LIKE (v_prefix || '%') THEN RAISE; END IF;
  END;

  RAISE NOTICE 'BP1_1_ISOLATION_PASS';
END $iso$;

ROLLBACK;
