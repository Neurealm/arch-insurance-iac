DO $$
DECLARE
  v_tenant uuid := 'd6e1f4a0-ef31-433e-825e-c2f6dc60cfbb';
  v_user   uuid := 'd0d8ae70-dec5-456e-b02f-3d168aa0e45d';
  v_role   uuid := '58503804-ee9d-47a8-836e-9cac7c004b83'; -- commercial_admin
  v_actor  uuid := '67dd965b-a3d1-489d-bc2d-62df04cb7707'; -- ryan.blackwell@neurealm.com (platform admin)
  v_mem    uuid;
  v_created boolean := false;
BEGIN
  SELECT id INTO v_mem FROM public.memberships WHERE tenant_id = v_tenant AND user_id = v_user;

  IF v_mem IS NULL THEN
    INSERT INTO public.memberships(tenant_id, user_id, status, joined_at, created_by)
    VALUES (v_tenant, v_user, 'active', now(), v_actor)
    RETURNING id INTO v_mem;
    v_created := true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.membership_roles
     WHERE membership_id = v_mem AND role_id = v_role
  ) THEN
    INSERT INTO public.membership_roles(tenant_id, membership_id, role_id, assigned_by)
    VALUES (v_tenant, v_mem, v_role, v_actor);
  END IF;

  INSERT INTO public.audit_events(
    tenant_id, actor_user_id, action_code, object_type, object_id,
    before_values, after_values, reason, source, metadata
  ) VALUES (
    v_tenant, v_actor,
    CASE WHEN v_created THEN 'member.added' ELSE 'member.role_assigned' END,
    'membership', v_mem::text, NULL,
    jsonb_build_object('user_id', v_user, 'role_code', 'commercial_admin'),
    'BP-COMMERCIAL-ACCESS-001: grant Commercial Administrator in NeuGAIN Commercial',
    'server',
    jsonb_build_object('email', 'bala.janagaraja@neurealm.com', 'tenant_slug', 'neugain-commercial')
  );
END $$;