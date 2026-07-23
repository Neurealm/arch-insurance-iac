-- BP1.1B corrections: close D-1 (P0), D-2 (P1), D-3 (P1)

-- D-1: emit_audit_event must not be callable by anon and must require an authenticated caller.
REVOKE EXECUTE ON FUNCTION public.emit_audit_event(uuid, text, text, text, jsonb, jsonb, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.emit_audit_event(uuid, text, text, text, jsonb, jsonb, text, jsonb) FROM anon;

CREATE OR REPLACE FUNCTION public.emit_audit_event(
  _tenant_id uuid,
  _action_code text,
  _object_type text,
  _object_id text,
  _before jsonb DEFAULT NULL::jsonb,
  _after jsonb DEFAULT NULL::jsonb,
  _reason text DEFAULT NULL::text,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;
  INSERT INTO public.audit_events(
    tenant_id, actor_user_id, action_code, object_type, object_id,
    before_values, after_values, reason, source, metadata
  ) VALUES (
    _tenant_id, auth.uid(), _action_code, _object_type, _object_id,
    _before, _after, _reason, 'server', COALESCE(_metadata,'{}'::jsonb)
  ) RETURNING id INTO v_id;
  RETURN v_id;
END $function$;

-- Re-revoke after CREATE OR REPLACE (grants can reset on some Postgres versions).
REVOKE EXECUTE ON FUNCTION public.emit_audit_event(uuid, text, text, text, jsonb, jsonb, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.emit_audit_event(uuid, text, text, text, jsonb, jsonb, text, jsonb) FROM anon;

-- D-3: count_active_tenant_admins must not be callable by anon.
REVOKE EXECUTE ON FUNCTION public.count_active_tenant_admins(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.count_active_tenant_admins(uuid, uuid) FROM anon;

-- D-2: accept_invitation must require a verified (email_confirmed_at IS NOT NULL) matching email.
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

  -- Only accept when the caller's email is verified.
  SELECT lower(email) INTO v_email
    FROM auth.users
   WHERE id = v_uid AND email_confirmed_at IS NOT NULL;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'email_not_verified';
  END IF;

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
END $function$;