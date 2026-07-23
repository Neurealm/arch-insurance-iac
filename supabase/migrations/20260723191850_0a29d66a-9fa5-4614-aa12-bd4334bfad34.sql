
-- ============================================================================
-- BP1.1B — Tenant Authorization, Security & Administrative Services
-- Extends BP1.1A. Does NOT modify BP1.1A schema, app_role, user_roles, runops_*.
-- ============================================================================

-- ---------- 1. Audit emitter (internal helper) -----------------------------
CREATE OR REPLACE FUNCTION public.emit_audit_event(
  _tenant_id uuid, _action_code text, _object_type text, _object_id text,
  _before jsonb DEFAULT NULL, _after jsonb DEFAULT NULL, _reason text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.audit_events(
    tenant_id, actor_user_id, action_code, object_type, object_id,
    before_values, after_values, reason, source, metadata
  ) VALUES (
    _tenant_id, auth.uid(), _action_code, _object_type, _object_id,
    _before, _after, _reason, 'server', COALESCE(_metadata,'{}'::jsonb)
  ) RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- ---------- 2. has_permission ----------------------------------------------
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id uuid, _tenant_id uuid, _permission_code text
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    _user_id IS NOT NULL
    AND _tenant_id IS NOT NULL
    AND _permission_code IS NOT NULL
    AND (
      -- Platform admin override
      EXISTS (SELECT 1 FROM public.user_roles ur
              WHERE ur.user_id = _user_id AND ur.role = 'platform_admin')
      OR EXISTS (
        SELECT 1
          FROM public.memberships m
          JOIN public.membership_roles mr ON mr.membership_id = m.id AND mr.tenant_id = m.tenant_id
          JOIN public.tenant_roles tr    ON tr.id = mr.role_id AND tr.tenant_id = m.tenant_id
          JOIN public.tenant_role_permissions trp
                                          ON trp.role_id = tr.id AND trp.tenant_id = m.tenant_id
         WHERE m.user_id = _user_id
           AND m.tenant_id = _tenant_id
           AND m.status = 'active'
           AND tr.status = 'active'
           AND trp.permission_code = _permission_code
      )
    );
$$;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid,uuid,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_permission(uuid,uuid,text) TO authenticated, service_role;

-- ---------- 3. get_current_access_context ----------------------------------
CREATE OR REPLACE FUNCTION public.get_current_access_context(_tenant_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_platform_admin boolean;
  v_membership jsonb;
  v_tenant jsonb;
  v_roles jsonb;
  v_perms jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('authenticated', false);
  END IF;
  v_is_platform_admin := EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=v_uid AND role='platform_admin');

  IF _tenant_id IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', true,
      'user_id', v_uid,
      'is_platform_admin', v_is_platform_admin,
      'tenant', NULL,
      'membership', NULL,
      'roles', '[]'::jsonb,
      'effective_permissions', '[]'::jsonb
    );
  END IF;

  SELECT to_jsonb(t) INTO v_tenant FROM public.tenants t WHERE t.id = _tenant_id;
  SELECT to_jsonb(m) INTO v_membership FROM public.memberships m
    WHERE m.tenant_id = _tenant_id AND m.user_id = v_uid;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('id',tr.id,'code',tr.code,'name',tr.name,'status',tr.status)), '[]'::jsonb)
    INTO v_roles
    FROM public.memberships m
    JOIN public.membership_roles mr ON mr.membership_id = m.id
    JOIN public.tenant_roles tr    ON tr.id = mr.role_id
   WHERE m.tenant_id = _tenant_id AND m.user_id = v_uid AND m.status='active' AND tr.status='active';

  IF v_is_platform_admin THEN
    SELECT COALESCE(jsonb_agg(DISTINCT p.code), '[]'::jsonb) INTO v_perms FROM public.permissions p;
  ELSE
    SELECT COALESCE(jsonb_agg(DISTINCT trp.permission_code), '[]'::jsonb) INTO v_perms
      FROM public.memberships m
      JOIN public.membership_roles mr ON mr.membership_id = m.id
      JOIN public.tenant_roles tr    ON tr.id = mr.role_id
      JOIN public.tenant_role_permissions trp ON trp.role_id = tr.id
     WHERE m.tenant_id = _tenant_id AND m.user_id = v_uid AND m.status='active' AND tr.status='active';
  END IF;

  RETURN jsonb_build_object(
    'authenticated', true,
    'user_id', v_uid,
    'is_platform_admin', v_is_platform_admin,
    'tenant', v_tenant,
    'membership', v_membership,
    'roles', v_roles,
    'effective_permissions', COALESCE(v_perms,'[]'::jsonb)
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.get_current_access_context(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_current_access_context(uuid) TO authenticated, service_role;

-- ---------- 4. Bootstrap default roles for a tenant ------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_tenant_default_roles(_tenant_id uuid, _actor uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_id uuid; v_member_id uuid; v_viewer_id uuid; v_auditor_id uuid;
  p record;
BEGIN
  INSERT INTO public.tenant_roles(tenant_id, code, name, description, status, is_system_protected, created_by)
    VALUES (_tenant_id,'tenant_admin','Tenant Administrator','Full administrative control of the tenant.','active',true,_actor)
    RETURNING id INTO v_admin_id;
  INSERT INTO public.tenant_roles(tenant_id, code, name, description, status, is_system_protected, created_by)
    VALUES (_tenant_id,'tenant_member','Tenant Member','Standard member with everyday access.','active',true,_actor)
    RETURNING id INTO v_member_id;
  INSERT INTO public.tenant_roles(tenant_id, code, name, description, status, is_system_protected, created_by)
    VALUES (_tenant_id,'tenant_viewer','Tenant Viewer','Read-only visibility into the tenant.','active',true,_actor)
    RETURNING id INTO v_viewer_id;
  INSERT INTO public.tenant_roles(tenant_id, code, name, description, status, is_system_protected, created_by)
    VALUES (_tenant_id,'tenant_auditor','Tenant Auditor','Read-only plus audit visibility.','active',true,_actor)
    RETURNING id INTO v_auditor_id;

  -- tenant_admin gets every required_for_tenant_administration permission + profile.update_own
  FOR p IN SELECT code FROM public.permissions
           WHERE required_for_tenant_administration = true OR code = 'profile.update_own'
  LOOP
    INSERT INTO public.tenant_role_permissions(tenant_id, role_id, permission_code, assigned_by)
      VALUES (_tenant_id, v_admin_id, p.code, _actor);
  END LOOP;

  -- tenant_member baseline
  INSERT INTO public.tenant_role_permissions(tenant_id, role_id, permission_code, assigned_by)
    SELECT _tenant_id, v_member_id, code, _actor FROM (VALUES
      ('tenant.view'),('members.view'),('roles.view'),('profile.update_own'),('platform.access')
    ) AS x(code);

  -- tenant_viewer minimal read
  INSERT INTO public.tenant_role_permissions(tenant_id, role_id, permission_code, assigned_by)
    SELECT _tenant_id, v_viewer_id, code, _actor FROM (VALUES
      ('tenant.view'),('members.view'),('platform.access')
    ) AS x(code);

  -- tenant_auditor read + audit
  INSERT INTO public.tenant_role_permissions(tenant_id, role_id, permission_code, assigned_by)
    SELECT _tenant_id, v_auditor_id, code, _actor FROM (VALUES
      ('tenant.view'),('members.view'),('roles.view'),('audit.view'),('platform.access')
    ) AS x(code);
END $$;
REVOKE EXECUTE ON FUNCTION public.bootstrap_tenant_default_roles(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.bootstrap_tenant_default_roles(uuid,uuid) TO service_role;

-- ---------- 5. provision_tenant --------------------------------------------
CREATE OR REPLACE FUNCTION public.provision_tenant(
  _name text, _slug text, _admin_user_id uuid,
  _timezone text DEFAULT 'UTC', _currency text DEFAULT 'USD'
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tenant_id uuid;
  v_membership_id uuid;
  v_admin_role_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  IF NOT public.is_platform_admin(v_uid) THEN RAISE EXCEPTION 'platform_admin_required'; END IF;
  IF _admin_user_id IS NULL THEN RAISE EXCEPTION 'admin_user_required'; END IF;

  INSERT INTO public.tenants(name, slug, status, default_currency_code, default_timezone, created_by)
    VALUES (_name, _slug, 'active', upper(_currency), _timezone, v_uid)
    RETURNING id INTO v_tenant_id;

  PERFORM public.bootstrap_tenant_default_roles(v_tenant_id, v_uid);

  INSERT INTO public.memberships(tenant_id, user_id, status, joined_at, created_by)
    VALUES (v_tenant_id, _admin_user_id, 'active', now(), v_uid)
    RETURNING id INTO v_membership_id;

  SELECT id INTO v_admin_role_id FROM public.tenant_roles
    WHERE tenant_id = v_tenant_id AND code = 'tenant_admin';
  INSERT INTO public.membership_roles(tenant_id, membership_id, role_id, assigned_by)
    VALUES (v_tenant_id, v_membership_id, v_admin_role_id, v_uid);

  PERFORM public.emit_audit_event(v_tenant_id, 'tenant.created', 'tenant', v_tenant_id::text,
    NULL, jsonb_build_object('name',_name,'slug',_slug,'admin_user_id',_admin_user_id));
  PERFORM public.emit_audit_event(v_tenant_id, 'member.accepted', 'membership', v_membership_id::text,
    NULL, jsonb_build_object('user_id',_admin_user_id,'bootstrap',true));

  RETURN public.get_current_access_context(v_tenant_id);
END $$;
REVOKE EXECUTE ON FUNCTION public.provision_tenant(text,text,uuid,text,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.provision_tenant(text,text,uuid,text,text) TO authenticated, service_role;

-- ---------- 6. Last-administrator safeguard --------------------------------
CREATE OR REPLACE FUNCTION public.count_active_tenant_admins(_tenant_id uuid, _exclude_membership uuid DEFAULT NULL)
RETURNS int
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(DISTINCT m.id)::int
    FROM public.memberships m
    JOIN public.membership_roles mr ON mr.membership_id = m.id
    JOIN public.tenant_roles tr    ON tr.id = mr.role_id
   WHERE m.tenant_id = _tenant_id
     AND m.status = 'active'
     AND tr.status = 'active'
     AND tr.code = 'tenant_admin'
     AND (_exclude_membership IS NULL OR m.id <> _exclude_membership);
$$;

-- Trigger: memberships (block deactivating/suspending last admin, block deleting last admin)
CREATE OR REPLACE FUNCTION public.trg_memberships_last_admin_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_was_admin boolean; v_tenant uuid; v_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = OLD.status THEN RETURN NEW; END IF;
    IF NEW.status = 'active' THEN RETURN NEW; END IF;
    v_tenant := OLD.tenant_id; v_id := OLD.id;
  ELSIF TG_OP = 'DELETE' THEN
    v_tenant := OLD.tenant_id; v_id := OLD.id;
  END IF;

  v_was_admin := EXISTS(
    SELECT 1 FROM public.membership_roles mr
    JOIN public.tenant_roles tr ON tr.id = mr.role_id
    WHERE mr.membership_id = v_id AND tr.code='tenant_admin' AND tr.status='active'
  );
  IF v_was_admin AND public.count_active_tenant_admins(v_tenant, v_id) = 0 THEN
    RAISE EXCEPTION 'last_tenant_administrator_protected';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
DROP TRIGGER IF EXISTS memberships_last_admin_guard_trg ON public.memberships;
CREATE TRIGGER memberships_last_admin_guard_trg
  BEFORE UPDATE OR DELETE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.trg_memberships_last_admin_guard();

-- Trigger: membership_roles (block removing tenant_admin role from last admin)
CREATE OR REPLACE FUNCTION public.trg_membership_roles_last_admin_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_is_admin_role boolean;
BEGIN
  SELECT (tr.code='tenant_admin') INTO v_is_admin_role
    FROM public.tenant_roles tr WHERE tr.id = OLD.role_id;
  IF COALESCE(v_is_admin_role,false)
     AND public.count_active_tenant_admins(OLD.tenant_id, OLD.membership_id) = 0
     AND NOT EXISTS (
       SELECT 1 FROM public.membership_roles mr2
       JOIN public.tenant_roles tr2 ON tr2.id = mr2.role_id
       WHERE mr2.membership_id = OLD.membership_id AND mr2.id <> OLD.id
         AND tr2.code='tenant_admin' AND tr2.status='active'
     ) THEN
    RAISE EXCEPTION 'last_tenant_administrator_protected';
  END IF;
  RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS membership_roles_last_admin_guard_trg ON public.membership_roles;
CREATE TRIGGER membership_roles_last_admin_guard_trg
  BEFORE DELETE ON public.membership_roles
  FOR EACH ROW EXECUTE FUNCTION public.trg_membership_roles_last_admin_guard();

-- Trigger: tenant_roles (block archiving tenant_admin if it would zero admins)
CREATE OR REPLACE FUNCTION public.trg_tenant_roles_last_admin_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP='UPDATE' AND OLD.code='tenant_admin'
     AND NEW.status='archived' AND OLD.status='active' THEN
    IF EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.membership_roles mr ON mr.membership_id=m.id
      WHERE mr.role_id = OLD.id AND m.status='active'
    ) THEN
      RAISE EXCEPTION 'last_tenant_administrator_protected';
    END IF;
  END IF;
  IF TG_OP='DELETE' AND OLD.is_system_protected THEN
    RAISE EXCEPTION 'system_role_delete_protected';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
DROP TRIGGER IF EXISTS tenant_roles_last_admin_guard_trg ON public.tenant_roles;
CREATE TRIGGER tenant_roles_last_admin_guard_trg
  BEFORE UPDATE OR DELETE ON public.tenant_roles
  FOR EACH ROW EXECUTE FUNCTION public.trg_tenant_roles_last_admin_guard();

-- Trigger: tenant_role_permissions (block removing admin-required perm from tenant_admin role)
CREATE OR REPLACE FUNCTION public.trg_role_permissions_admin_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_role_code text; v_required boolean;
BEGIN
  SELECT code INTO v_role_code FROM public.tenant_roles WHERE id = OLD.role_id;
  SELECT required_for_tenant_administration INTO v_required FROM public.permissions WHERE code = OLD.permission_code;
  IF v_role_code='tenant_admin' AND COALESCE(v_required,false) THEN
    RAISE EXCEPTION 'tenant_admin_required_permission_protected: %', OLD.permission_code;
  END IF;
  RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS role_permissions_admin_guard_trg ON public.tenant_role_permissions;
CREATE TRIGGER role_permissions_admin_guard_trg
  BEFORE DELETE ON public.tenant_role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.trg_role_permissions_admin_guard();

-- ---------- 7. Member services ---------------------------------------------
CREATE OR REPLACE FUNCTION public.invite_member(
  _tenant_id uuid, _email text, _role_codes text[] DEFAULT ARRAY['tenant_member'],
  _expires_in_days int DEFAULT 14
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid(); v_inv_id uuid; v_role record; v_token bytea;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  IF NOT public.has_permission(v_uid, _tenant_id, 'members.invite') THEN
    RAISE EXCEPTION 'permission_denied: members.invite';
  END IF;
  v_token := gen_random_bytes(32);

  INSERT INTO public.tenant_invitations(tenant_id, email, token_hash, status, expires_at, invited_by)
    VALUES (_tenant_id, _email, digest(encode(v_token,'hex'),'sha256'),
            'pending', now() + make_interval(days => GREATEST(1,_expires_in_days)), v_uid)
    RETURNING id INTO v_inv_id;

  FOR v_role IN
    SELECT id FROM public.tenant_roles
     WHERE tenant_id = _tenant_id AND status='active' AND code = ANY(_role_codes)
  LOOP
    INSERT INTO public.tenant_invitation_roles(tenant_id, invitation_id, role_id)
      VALUES (_tenant_id, v_inv_id, v_role.id);
  END LOOP;

  PERFORM public.emit_audit_event(_tenant_id, 'member.invited', 'invitation', v_inv_id::text,
    NULL, jsonb_build_object('email', lower(btrim(_email)), 'role_codes', to_jsonb(_role_codes)));
  RETURN jsonb_build_object('invitation_id', v_inv_id, 'token', encode(v_token,'hex'));
END $$;
REVOKE EXECUTE ON FUNCTION public.invite_member(uuid,text,text[],int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.invite_member(uuid,text,text[],int) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.resend_invitation(_invitation_id uuid, _expires_in_days int DEFAULT 14)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_inv public.tenant_invitations; v_token bytea;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_inv FROM public.tenant_invitations WHERE id = _invitation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'invitation_not_found'; END IF;
  IF NOT public.has_permission(v_uid, v_inv.tenant_id, 'members.invite') THEN
    RAISE EXCEPTION 'permission_denied: members.invite';
  END IF;
  IF v_inv.status <> 'pending' THEN RAISE EXCEPTION 'invitation_not_pending'; END IF;
  v_token := gen_random_bytes(32);
  UPDATE public.tenant_invitations SET
    token_hash = digest(encode(v_token,'hex'),'sha256'),
    expires_at = now() + make_interval(days => GREATEST(1,_expires_in_days))
    WHERE id = _invitation_id;
  PERFORM public.emit_audit_event(v_inv.tenant_id,'member.invited','invitation',_invitation_id::text,
    NULL, jsonb_build_object('resend',true));
  RETURN jsonb_build_object('invitation_id', _invitation_id, 'token', encode(v_token,'hex'));
END $$;
REVOKE EXECUTE ON FUNCTION public.resend_invitation(uuid,int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.resend_invitation(uuid,int) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.cancel_invitation(_invitation_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_inv public.tenant_invitations;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_inv FROM public.tenant_invitations WHERE id = _invitation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'invitation_not_found'; END IF;
  IF NOT public.has_permission(v_uid, v_inv.tenant_id, 'members.invite') THEN
    RAISE EXCEPTION 'permission_denied: members.invite';
  END IF;
  UPDATE public.tenant_invitations SET status='cancelled', cancelled_by=v_uid, cancelled_at=now()
    WHERE id = _invitation_id AND status='pending';
  PERFORM public.emit_audit_event(v_inv.tenant_id,'member.cancelled','invitation',_invitation_id::text);
END $$;
REVOKE EXECUTE ON FUNCTION public.cancel_invitation(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.cancel_invitation(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.accept_invitation(_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid(); v_email text; v_inv public.tenant_invitations;
  v_membership_id uuid; v_role record;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_uid;

  SELECT * INTO v_inv FROM public.tenant_invitations
    WHERE token_hash = digest(_token,'sha256');
  IF NOT FOUND THEN RAISE EXCEPTION 'invitation_invalid'; END IF;
  IF v_inv.status <> 'pending' THEN RAISE EXCEPTION 'invitation_not_pending'; END IF;
  IF v_inv.expires_at < now() THEN
    UPDATE public.tenant_invitations SET status='expired' WHERE id = v_inv.id;
    RAISE EXCEPTION 'invitation_expired';
  END IF;
  IF v_inv.normalized_email IS DISTINCT FROM v_email THEN
    RAISE EXCEPTION 'invitation_email_mismatch';
  END IF;
  IF EXISTS (SELECT 1 FROM public.memberships WHERE tenant_id=v_inv.tenant_id AND user_id=v_uid) THEN
    RAISE EXCEPTION 'membership_already_exists';
  END IF;

  INSERT INTO public.memberships(tenant_id, user_id, status, joined_at, created_by)
    VALUES (v_inv.tenant_id, v_uid, 'active', now(), v_inv.invited_by)
    RETURNING id INTO v_membership_id;

  FOR v_role IN
    SELECT role_id FROM public.tenant_invitation_roles WHERE invitation_id = v_inv.id
  LOOP
    INSERT INTO public.membership_roles(tenant_id, membership_id, role_id, assigned_by)
      VALUES (v_inv.tenant_id, v_membership_id, v_role.role_id, v_inv.invited_by);
  END LOOP;

  UPDATE public.tenant_invitations SET status='accepted', accepted_by=v_uid, accepted_at=now()
    WHERE id = v_inv.id;

  PERFORM public.emit_audit_event(v_inv.tenant_id,'member.accepted','membership',v_membership_id::text,
    NULL, jsonb_build_object('invitation_id', v_inv.id));
  RETURN public.get_current_access_context(v_inv.tenant_id);
END $$;
REVOKE EXECUTE ON FUNCTION public.accept_invitation(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_membership_status(_membership_id uuid, _status public.membership_status, _reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_m public.memberships; v_before jsonb; v_after jsonb; v_action text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_m FROM public.memberships WHERE id = _membership_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'membership_not_found'; END IF;
  IF NOT public.has_permission(v_uid, v_m.tenant_id, 'members.manage') THEN
    RAISE EXCEPTION 'permission_denied: members.manage';
  END IF;
  v_before := to_jsonb(v_m);
  UPDATE public.memberships SET status = _status,
    deactivated_at = CASE WHEN _status='deactivated' THEN now() ELSE deactivated_at END,
    joined_at = CASE WHEN _status='active' AND joined_at IS NULL THEN now() ELSE joined_at END,
    updated_at = now()
    WHERE id = _membership_id RETURNING to_jsonb(memberships.*) INTO v_after;
  v_action := CASE _status
    WHEN 'suspended'  THEN 'member.suspended'
    WHEN 'active'     THEN 'member.reactivated'
    WHEN 'deactivated' THEN 'member.deactivated'
    ELSE 'member.updated' END;
  PERFORM public.emit_audit_event(v_m.tenant_id, v_action, 'membership', _membership_id::text, v_before, v_after, _reason);
  RETURN v_after;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_membership_status(uuid,public.membership_status,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.set_membership_status(uuid,public.membership_status,text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.assign_membership_role(_membership_id uuid, _role_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_tenant uuid; v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT tenant_id INTO v_tenant FROM public.memberships WHERE id = _membership_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'membership_not_found'; END IF;
  IF NOT public.has_permission(v_uid, v_tenant, 'members.manage') THEN
    RAISE EXCEPTION 'permission_denied: members.manage';
  END IF;
  INSERT INTO public.membership_roles(tenant_id, membership_id, role_id, assigned_by)
    VALUES (v_tenant, _membership_id, _role_id, v_uid)
    ON CONFLICT DO NOTHING RETURNING id INTO v_id;
  PERFORM public.emit_audit_event(v_tenant,'membership.roles.changed','membership',_membership_id::text,
    NULL, jsonb_build_object('added_role_id', _role_id));
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.assign_membership_role(uuid,uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.assign_membership_role(uuid,uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.remove_membership_role(_membership_id uuid, _role_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_tenant uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT tenant_id INTO v_tenant FROM public.memberships WHERE id = _membership_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'membership_not_found'; END IF;
  IF NOT public.has_permission(v_uid, v_tenant, 'members.manage') THEN
    RAISE EXCEPTION 'permission_denied: members.manage';
  END IF;
  DELETE FROM public.membership_roles WHERE membership_id = _membership_id AND role_id = _role_id;
  PERFORM public.emit_audit_event(v_tenant,'membership.roles.changed','membership',_membership_id::text,
    NULL, jsonb_build_object('removed_role_id', _role_id));
END $$;
REVOKE EXECUTE ON FUNCTION public.remove_membership_role(uuid,uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.remove_membership_role(uuid,uuid) TO authenticated, service_role;

-- ---------- 8. Role administration services --------------------------------
CREATE OR REPLACE FUNCTION public.create_tenant_role(_tenant_id uuid, _code text, _name text, _description text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  IF NOT public.has_permission(v_uid,_tenant_id,'roles.manage') THEN RAISE EXCEPTION 'permission_denied: roles.manage'; END IF;
  INSERT INTO public.tenant_roles(tenant_id, code, name, description, status, is_system_protected, created_by)
    VALUES (_tenant_id, _code, _name, _description, 'active', false, v_uid)
    RETURNING id INTO v_id;
  PERFORM public.emit_audit_event(_tenant_id,'role.created','tenant_role',v_id::text,NULL,
    jsonb_build_object('code',_code,'name',_name));
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.create_tenant_role(uuid,text,text,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.create_tenant_role(uuid,text,text,text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.update_tenant_role(_role_id uuid, _name text, _description text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_tenant uuid; v_before jsonb; v_after jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT tenant_id INTO v_tenant FROM public.tenant_roles WHERE id = _role_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'role_not_found'; END IF;
  IF NOT public.has_permission(v_uid,v_tenant,'roles.manage') THEN RAISE EXCEPTION 'permission_denied: roles.manage'; END IF;
  SELECT to_jsonb(tr) INTO v_before FROM public.tenant_roles tr WHERE id = _role_id;
  UPDATE public.tenant_roles SET name = COALESCE(_name,name), description = COALESCE(_description,description)
    WHERE id = _role_id RETURNING to_jsonb(tenant_roles.*) INTO v_after;
  PERFORM public.emit_audit_event(v_tenant,'role.updated','tenant_role',_role_id::text,v_before,v_after);
END $$;
REVOKE EXECUTE ON FUNCTION public.update_tenant_role(uuid,text,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.update_tenant_role(uuid,text,text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.archive_tenant_role(_role_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_tenant uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT tenant_id INTO v_tenant FROM public.tenant_roles WHERE id = _role_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'role_not_found'; END IF;
  IF NOT public.has_permission(v_uid,v_tenant,'roles.manage') THEN RAISE EXCEPTION 'permission_denied: roles.manage'; END IF;
  UPDATE public.tenant_roles SET status='archived', archived_at=now() WHERE id = _role_id;
  PERFORM public.emit_audit_event(v_tenant,'role.archived','tenant_role',_role_id::text);
END $$;
REVOKE EXECUTE ON FUNCTION public.archive_tenant_role(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.archive_tenant_role(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.assign_role_permission(_role_id uuid, _permission_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_tenant uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT tenant_id INTO v_tenant FROM public.tenant_roles WHERE id = _role_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'role_not_found'; END IF;
  IF NOT public.has_permission(v_uid,v_tenant,'roles.manage') THEN RAISE EXCEPTION 'permission_denied: roles.manage'; END IF;
  INSERT INTO public.tenant_role_permissions(tenant_id, role_id, permission_code, assigned_by)
    VALUES (v_tenant, _role_id, _permission_code, v_uid) ON CONFLICT DO NOTHING;
  PERFORM public.emit_audit_event(v_tenant,'permission.changed','tenant_role',_role_id::text,NULL,
    jsonb_build_object('added_permission', _permission_code));
END $$;
REVOKE EXECUTE ON FUNCTION public.assign_role_permission(uuid,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.assign_role_permission(uuid,text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.remove_role_permission(_role_id uuid, _permission_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_tenant uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT tenant_id INTO v_tenant FROM public.tenant_roles WHERE id = _role_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'role_not_found'; END IF;
  IF NOT public.has_permission(v_uid,v_tenant,'roles.manage') THEN RAISE EXCEPTION 'permission_denied: roles.manage'; END IF;
  DELETE FROM public.tenant_role_permissions WHERE role_id = _role_id AND permission_code = _permission_code;
  PERFORM public.emit_audit_event(v_tenant,'permission.changed','tenant_role',_role_id::text,NULL,
    jsonb_build_object('removed_permission', _permission_code));
END $$;
REVOKE EXECUTE ON FUNCTION public.remove_role_permission(uuid,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.remove_role_permission(uuid,text) TO authenticated, service_role;

-- ---------- 9. Permission-based RLS ----------------------------------------
-- tenants
CREATE POLICY tenants_perm_read ON public.tenants FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), id, 'tenant.view'));
CREATE POLICY tenants_perm_update ON public.tenants FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), id, 'tenant.update'))
  WITH CHECK (public.has_permission(auth.uid(), id, 'tenant.update'));

-- memberships: users can see their own row; members.view can see all rows in tenant
CREATE POLICY memberships_self_read ON public.memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_permission(auth.uid(), tenant_id, 'members.view'));
CREATE POLICY memberships_perm_write ON public.memberships FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'members.manage'))
  WITH CHECK (public.has_permission(auth.uid(), tenant_id, 'members.manage'));

-- tenant_roles
CREATE POLICY tenant_roles_perm_read ON public.tenant_roles FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'roles.view'));
CREATE POLICY tenant_roles_perm_write ON public.tenant_roles FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'roles.manage'))
  WITH CHECK (public.has_permission(auth.uid(), tenant_id, 'roles.manage'));

-- tenant_role_permissions
CREATE POLICY trp_perm_read ON public.tenant_role_permissions FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'roles.view'));
CREATE POLICY trp_perm_write ON public.tenant_role_permissions FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'roles.manage'))
  WITH CHECK (public.has_permission(auth.uid(), tenant_id, 'roles.manage'));

-- membership_roles
CREATE POLICY mroles_perm_read ON public.membership_roles FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'members.view'));
CREATE POLICY mroles_perm_write ON public.membership_roles FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'members.manage'))
  WITH CHECK (public.has_permission(auth.uid(), tenant_id, 'members.manage'));

-- tenant_invitations
CREATE POLICY invites_perm_read ON public.tenant_invitations FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'members.view'));
CREATE POLICY invites_perm_write ON public.tenant_invitations FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'members.invite'))
  WITH CHECK (public.has_permission(auth.uid(), tenant_id, 'members.invite'));

-- tenant_invitation_roles
CREATE POLICY tir_perm_read ON public.tenant_invitation_roles FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'members.view'));
CREATE POLICY tir_perm_write ON public.tenant_invitation_roles FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'members.invite'))
  WITH CHECK (public.has_permission(auth.uid(), tenant_id, 'members.invite'));

-- audit_events (read only for tenant users; writes still restricted to platform admin + server via SECURITY DEFINER)
CREATE POLICY audit_perm_read ON public.audit_events FOR SELECT TO authenticated
  USING (tenant_id IS NOT NULL AND public.has_permission(auth.uid(), tenant_id, 'audit.view'));
