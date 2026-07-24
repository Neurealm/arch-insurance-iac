
-- BP2.2 — bootstrap_commercial_workspace + Commercial default roles

CREATE OR REPLACE FUNCTION public.bootstrap_commercial_workspace()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid            uuid := auth.uid();
  v_owner_email    constant text := 'ryancblackwell@outlook.com';
  v_owner_id       uuid;
  v_is_platform    boolean;
  v_tenant_id      uuid;
  v_tenant_created boolean := false;
  v_membership_id  uuid;
  v_membership_created boolean := false;
  v_admin_role_id  uuid;
  v_analyst_role_id uuid;
  v_viewer_role_id  uuid;
  v_comm_admin_role_id uuid;
  v_role_assigned  boolean := false;
  v_slug           constant text := 'neugain-commercial';
  v_name           constant text := 'NeuGAIN Commercial';
  v_tz             constant text := 'America/Chicago';
  v_ccy            constant text := 'USD';
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;

  SELECT id INTO v_owner_id FROM auth.users WHERE lower(email) = v_owner_email;
  IF v_owner_id IS NULL THEN RAISE EXCEPTION 'authorized_owner_not_found'; END IF;

  v_is_platform := public.is_platform_admin(v_uid);
  IF NOT v_is_platform AND v_uid <> v_owner_id THEN
    RAISE EXCEPTION 'not_authorized_to_bootstrap_commercial';
  END IF;

  -- 1. Tenant (create or reuse)
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = v_slug;
  IF v_tenant_id IS NULL THEN
    INSERT INTO public.tenants(name, slug, status, default_currency_code, default_timezone, created_by)
      VALUES (v_name, v_slug, 'active', v_ccy, v_tz, v_uid)
      RETURNING id INTO v_tenant_id;
    v_tenant_created := true;
    PERFORM public.bootstrap_tenant_default_roles(v_tenant_id, v_uid);
    PERFORM public.emit_audit_event(v_tenant_id, 'tenant.created', 'tenant', v_tenant_id::text,
      NULL, jsonb_build_object('name', v_name, 'slug', v_slug, 'source', 'bootstrap_commercial_workspace'));
  END IF;

  -- 2. Commercial-specific roles (idempotent)
  FOR v_admin_role_id IN
    SELECT NULL::uuid WHERE false  -- unused loop var placeholder
  LOOP NULL; END LOOP;

  -- Commercial Administrator
  SELECT id INTO v_comm_admin_role_id FROM public.tenant_roles
    WHERE tenant_id = v_tenant_id AND code = 'commercial_admin';
  IF v_comm_admin_role_id IS NULL THEN
    INSERT INTO public.tenant_roles(tenant_id, code, name, description, status, is_system_protected, created_by)
      VALUES (v_tenant_id, 'commercial_admin', 'Commercial Administrator',
              'Full administration of the Commercial module for this workspace.',
              'active', true, v_uid)
      RETURNING id INTO v_comm_admin_role_id;
  END IF;

  -- Commercial Analyst
  SELECT id INTO v_analyst_role_id FROM public.tenant_roles
    WHERE tenant_id = v_tenant_id AND code = 'commercial_analyst';
  IF v_analyst_role_id IS NULL THEN
    INSERT INTO public.tenant_roles(tenant_id, code, name, description, status, is_system_protected, created_by)
      VALUES (v_tenant_id, 'commercial_analyst', 'Commercial Analyst',
              'Manages scenarios, assumptions, accounts, and sources.',
              'active', true, v_uid)
      RETURNING id INTO v_analyst_role_id;
  END IF;

  -- Commercial Executive Viewer
  SELECT id INTO v_viewer_role_id FROM public.tenant_roles
    WHERE tenant_id = v_tenant_id AND code = 'commercial_exec_viewer';
  IF v_viewer_role_id IS NULL THEN
    INSERT INTO public.tenant_roles(tenant_id, code, name, description, status, is_system_protected, created_by)
      VALUES (v_tenant_id, 'commercial_exec_viewer', 'Commercial Executive Viewer',
              'Read-only executive view of Commercial data.',
              'active', true, v_uid)
      RETURNING id INTO v_viewer_role_id;
  END IF;

  -- 3. Role → permission mappings (idempotent)
  INSERT INTO public.tenant_role_permissions(tenant_id, role_id, permission_code, assigned_by)
  SELECT v_tenant_id, v_comm_admin_role_id, code, v_uid FROM (VALUES
    ('commercial.view'), ('commercial.program.manage'), ('commercial.scenario.manage'),
    ('commercial.assumption.manage'), ('commercial.account.manage'),
    ('commercial.source.manage'), ('commercial.admin')
  ) x(code)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.tenant_role_permissions(tenant_id, role_id, permission_code, assigned_by)
  SELECT v_tenant_id, v_analyst_role_id, code, v_uid FROM (VALUES
    ('commercial.view'), ('commercial.scenario.manage'),
    ('commercial.assumption.manage'), ('commercial.account.manage'),
    ('commercial.source.manage')
  ) x(code)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.tenant_role_permissions(tenant_id, role_id, permission_code, assigned_by)
  VALUES (v_tenant_id, v_viewer_role_id, 'commercial.view', v_uid)
  ON CONFLICT DO NOTHING;

  -- 4. Owner membership (active)
  SELECT id INTO v_membership_id FROM public.memberships
    WHERE tenant_id = v_tenant_id AND user_id = v_owner_id;
  IF v_membership_id IS NULL THEN
    INSERT INTO public.memberships(tenant_id, user_id, status, joined_at, created_by)
      VALUES (v_tenant_id, v_owner_id, 'active', now(), v_uid)
      RETURNING id INTO v_membership_id;
    v_membership_created := true;
    PERFORM public.emit_audit_event(v_tenant_id, 'member.accepted', 'membership', v_membership_id::text,
      NULL, jsonb_build_object('user_id', v_owner_id, 'bootstrap', true, 'source', 'bootstrap_commercial_workspace'));
  ELSIF (SELECT status FROM public.memberships WHERE id = v_membership_id) <> 'active' THEN
    UPDATE public.memberships SET status = 'active', joined_at = COALESCE(joined_at, now())
      WHERE id = v_membership_id;
  END IF;

  -- 5. Ensure owner has tenant_admin (base) and commercial_admin
  SELECT id INTO v_admin_role_id FROM public.tenant_roles
    WHERE tenant_id = v_tenant_id AND code = 'tenant_admin';
  IF v_admin_role_id IS NOT NULL THEN
    INSERT INTO public.membership_roles(tenant_id, membership_id, role_id, assigned_by)
      VALUES (v_tenant_id, v_membership_id, v_admin_role_id, v_uid)
      ON CONFLICT DO NOTHING;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.membership_roles
    WHERE membership_id = v_membership_id AND role_id = v_comm_admin_role_id
  ) THEN
    INSERT INTO public.membership_roles(tenant_id, membership_id, role_id, assigned_by)
      VALUES (v_tenant_id, v_membership_id, v_comm_admin_role_id, v_uid);
    v_role_assigned := true;
    PERFORM public.emit_audit_event(v_tenant_id, 'role.assigned', 'membership_role', v_membership_id::text,
      NULL, jsonb_build_object('role_code', 'commercial_admin', 'user_id', v_owner_id,
                               'source', 'bootstrap_commercial_workspace'));
  END IF;

  RETURN jsonb_build_object(
    'tenant_id', v_tenant_id,
    'tenant_created', v_tenant_created,
    'membership_id', v_membership_id,
    'membership_created', v_membership_created,
    'commercial_admin_role_id', v_comm_admin_role_id,
    'commercial_admin_assigned', v_role_assigned,
    'roles', jsonb_build_object(
      'commercial_admin', v_comm_admin_role_id,
      'commercial_analyst', v_analyst_role_id,
      'commercial_exec_viewer', v_viewer_role_id
    )
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.bootstrap_commercial_workspace() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.bootstrap_commercial_workspace() TO authenticated, service_role;
