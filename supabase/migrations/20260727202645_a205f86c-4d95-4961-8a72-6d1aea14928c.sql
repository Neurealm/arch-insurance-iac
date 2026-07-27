CREATE OR REPLACE FUNCTION public.audio_version_transition(_version_id uuid, _action text, _comment text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ver   public.audio_narrative_versions%ROWTYPE;
  v_narr  public.audio_narratives%ROWTYPE;
  v_next  text;
  v_required text;
  v_uid uuid := auth.uid();
  v_is_admin boolean := false;
  v_self_approved boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'an authenticated session is required';
  END IF;

  SELECT * INTO v_ver FROM public.audio_narrative_versions WHERE id = _version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'version not found';
  END IF;
  SELECT * INTO v_narr FROM public.audio_narratives WHERE id = v_ver.narrative_id;

  v_next := CASE _action
    WHEN 'submit'  THEN 'in_review'
    WHEN 'approve' THEN 'approved'
    WHEN 'reject'  THEN 'draft'
    WHEN 'publish' THEN 'published'
    WHEN 'retire'  THEN 'retired'
    ELSE NULL END;
  IF v_next IS NULL THEN
    RAISE EXCEPTION 'unsupported lifecycle action %', _action;
  END IF;

  IF NOT (
       (_action = 'submit'  AND v_ver.status = 'draft')
    OR (_action = 'approve' AND v_ver.status = 'in_review')
    OR (_action = 'reject'  AND v_ver.status = 'in_review')
    OR (_action = 'publish' AND v_ver.status = 'approved')
    OR (_action = 'retire'  AND v_ver.status IN ('approved','published'))
  ) THEN
    RAISE EXCEPTION 'invalid lifecycle transition % -> % (action %)', v_ver.status, v_next, _action;
  END IF;

  v_required := CASE _action
    WHEN 'submit'  THEN 'audio.narrative.review'
    WHEN 'reject'  THEN 'audio.narrative.approve'
    WHEN 'approve' THEN 'audio.narrative.approve'
    WHEN 'publish' THEN 'audio.narrative.publish'
    WHEN 'retire'  THEN 'audio.narrative.retire'
  END;
  IF NOT public.audio_can_manage(v_ver.tenant_id, v_required) THEN
    RAISE EXCEPTION 'permission % is required for this action', v_required;
  END IF;

  v_is_admin := public.is_platform_admin(v_uid);

  -- separation of duties: an author may not approve their own version,
  -- except platform admins (single-operator workspaces would otherwise stall).
  IF _action = 'approve' AND v_ver.author_user_id IS NOT NULL AND v_ver.author_user_id = v_uid THEN
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'separation of duties: the author of a version cannot approve it';
    END IF;
    v_self_approved := true;
  END IF;

  IF _action = 'reject' AND (_comment IS NULL OR btrim(_comment) = '') THEN
    RAISE EXCEPTION 'a comment is required when rejecting a version';
  END IF;

  UPDATE public.audio_narrative_versions
     SET status = v_next
   WHERE id = _version_id;

  PERFORM public.emit_audit_event(
    v_ver.tenant_id,
    'cae.version.action.' || _action,
    'audio_narrative_version',
    _version_id::text,
    jsonb_build_object('status', v_ver.status),
    jsonb_build_object('status', v_next, 'call_id', v_narr.call_id, 'version_no', v_ver.version_no),
    NULLIF(btrim(COALESCE(_comment, '')), ''),
    jsonb_build_object('action', _action, 'narrative_id', v_ver.narrative_id, 'self_approved', v_self_approved)
  );

  RETURN jsonb_build_object('status', v_next, 'version_id', _version_id, 'version_no', v_ver.version_no, 'self_approved', v_self_approved);
END $function$;