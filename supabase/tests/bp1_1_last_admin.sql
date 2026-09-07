-- BP1.1 Last-Administrator Safeguard Regression
-- Confirms count_active_tenant_admins() reflects only active memberships with
-- an active admin-permission-bearing role. Pending invites and archived roles
-- must not count.

\set ON_ERROR_STOP on
BEGIN;

DO $la$
DECLARE
  v_prefix constant text := 'BP1_1_LAST_ADMIN_FAIL: ';
  v_tenant uuid := gen_random_uuid();
  v_role uuid;
  v_user uuid := gen_random_uuid();
  v_mem uuid;
  v_count int;
BEGIN
  INSERT INTO public.tenants(id,name,slug,status,default_currency_code,default_timezone)
    VALUES (v_tenant,'Tenant LA','tenant-la','active','USD','UTC');

  INSERT INTO public.tenant_roles(id, tenant_id, code, name, status)
    VALUES (gen_random_uuid(), v_tenant, 'tenant_admin', 'Tenant Admin', 'active')
    RETURNING id INTO v_role;

  INSERT INTO public.tenant_role_permissions(role_id, permission_code, tenant_id)
    VALUES (v_role, 'members.manage', v_tenant);

  -- Pending invitation MUST NOT count as admin.
  INSERT INTO public.tenant_invitations(id, tenant_id, email, normalized_email, status, token_hash, expires_at)
    VALUES (gen_random_uuid(), v_tenant, 'p@example.com','p@example.com','pending',
            sha256(gen_random_uuid()::text::bytea), now()+interval '7 days');

  SELECT public.count_active_tenant_admins(v_tenant) INTO v_count;
  IF v_count <> 0 THEN
    RAISE EXCEPTION '%pending invite counted as admin (got %)', v_prefix, v_count;
  END IF;

  -- Add active membership with the admin role.
  -- memberships.user_id references auth.users; seed the identity first.
  INSERT INTO auth.users(id) VALUES (v_user) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.memberships(id, tenant_id, user_id, status)
    VALUES (gen_random_uuid(), v_tenant, v_user, 'active') RETURNING id INTO v_mem;
  INSERT INTO public.membership_roles(membership_id, role_id, tenant_id)
    VALUES (v_mem, v_role, v_tenant);

  SELECT public.count_active_tenant_admins(v_tenant) INTO v_count;
  IF v_count <> 1 THEN
    RAISE EXCEPTION '%active admin membership not counted (got %)', v_prefix, v_count;
  END IF;

  -- Suspending the only administrator must be refused by the safeguard.
  BEGIN
    UPDATE public.memberships SET status='suspended' WHERE id = v_mem;
    RAISE EXCEPTION '%last administrator was allowed to be suspended', v_prefix;
  EXCEPTION WHEN others THEN
    IF SQLERRM LIKE (v_prefix || '%') THEN RAISE; END IF;
    IF SQLERRM NOT LIKE '%last_tenant_administrator_protected%' THEN
      RAISE EXCEPTION '%unexpected error suspending last admin: %', v_prefix, SQLERRM;
    END IF;
  END;

  -- With the admin role removed, suspension is allowed and the count is 0.
  DELETE FROM public.membership_roles WHERE membership_id = v_mem AND role_id = v_role;
  UPDATE public.memberships SET status='suspended' WHERE id = v_mem;
  SELECT public.count_active_tenant_admins(v_tenant) INTO v_count;
  IF v_count <> 0 THEN
    RAISE EXCEPTION '%suspended membership still counted (got %)', v_prefix, v_count;
  END IF;

  RAISE NOTICE 'BP1_1_LAST_ADMIN_PASS';
END $la$;

ROLLBACK;
