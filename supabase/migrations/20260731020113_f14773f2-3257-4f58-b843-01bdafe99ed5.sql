CREATE OR REPLACE FUNCTION public.invite_member(_tenant_id uuid, _email text, _role_codes text[] DEFAULT ARRAY['tenant_member'::text], _expires_in_days integer DEFAULT 14)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid(); v_inv_id uuid; v_role record; v_token bytea;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  IF NOT public.has_permission(v_uid, _tenant_id, 'members.invite') THEN
    RAISE EXCEPTION 'permission_denied: members.invite';
  END IF;
  v_token := extensions.gen_random_bytes(32);

  INSERT INTO public.tenant_invitations(tenant_id, email, token_hash, status, expires_at, invited_by)
    VALUES (_tenant_id, _email, extensions.digest(encode(v_token,'hex'),'sha256'),
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
END $function$;

CREATE OR REPLACE FUNCTION public.resend_invitation(_invitation_id uuid, _expires_in_days integer DEFAULT 14)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_uid uuid := auth.uid(); v_inv public.tenant_invitations; v_token bytea;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_inv FROM public.tenant_invitations WHERE id = _invitation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'invitation_not_found'; END IF;
  IF NOT public.has_permission(v_uid, v_inv.tenant_id, 'members.invite') THEN
    RAISE EXCEPTION 'permission_denied: members.invite';
  END IF;
  IF v_inv.status <> 'pending' THEN RAISE EXCEPTION 'invitation_not_pending'; END IF;
  v_token := extensions.gen_random_bytes(32);
  UPDATE public.tenant_invitations SET
    token_hash = extensions.digest(encode(v_token,'hex'),'sha256'),
    expires_at = now() + make_interval(days => GREATEST(1,_expires_in_days))
    WHERE id = _invitation_id;
  PERFORM public.emit_audit_event(v_inv.tenant_id,'member.invited','invitation',_invitation_id::text,
    NULL, jsonb_build_object('resend',true));
  RETURN jsonb_build_object('invitation_id', _invitation_id, 'token', encode(v_token,'hex'));
END $function$;

CREATE OR REPLACE FUNCTION public.accept_invitation(_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid(); v_email text; v_inv public.tenant_invitations;
  v_membership_id uuid; v_role record;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;

  SELECT lower(email) INTO v_email
    FROM auth.users
   WHERE id = v_uid AND email_confirmed_at IS NOT NULL;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'email_not_verified';
  END IF;

  SELECT * INTO v_inv FROM public.tenant_invitations
    WHERE token_hash = extensions.digest(_token,'sha256');
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
END $function$;