-- ============================================================
-- CAE.080 — narrative version lifecycle, approval & audit
-- ============================================================

-- 1. Governed lifecycle transition -----------------------------------------
CREATE OR REPLACE FUNCTION public.audio_version_transition(
  _version_id uuid,
  _action text,
  _comment text DEFAULT NULL
)
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

  -- allowed transitions
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

  -- separation of duties: an author may not approve their own version
  IF _action = 'approve' AND v_ver.author_user_id IS NOT NULL AND v_ver.author_user_id = v_uid THEN
    RAISE EXCEPTION 'separation of duties: the author of a version cannot approve it';
  END IF;

  IF _action = 'reject' AND (_comment IS NULL OR btrim(_comment) = '') THEN
    RAISE EXCEPTION 'a comment is required when rejecting a version';
  END IF;

  UPDATE public.audio_narrative_versions
     SET status = v_next
   WHERE id = _version_id;

  -- comment-bearing audit entry (the guard trigger records the base transition)
  PERFORM public.emit_audit_event(
    v_ver.tenant_id,
    'cae.version.action.' || _action,
    'audio_narrative_version',
    _version_id::text,
    jsonb_build_object('status', v_ver.status),
    jsonb_build_object('status', v_next, 'call_id', v_narr.call_id, 'version_no', v_ver.version_no),
    NULLIF(btrim(COALESCE(_comment, '')), ''),
    jsonb_build_object('action', _action, 'narrative_id', v_ver.narrative_id)
  );

  RETURN jsonb_build_object('status', v_next, 'version_id', _version_id, 'version_no', v_ver.version_no);
END $function$;

REVOKE EXECUTE ON FUNCTION public.audio_version_transition(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_version_transition(uuid, text, text) TO authenticated;

-- 2. Create a new draft from any existing version (edit-published / restore)
CREATE OR REPLACE FUNCTION public.audio_version_create_draft_from(
  _source_version_id uuid,
  _change_summary text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_src public.audio_narrative_versions%ROWTYPE;
  v_narr public.audio_narratives%ROWTYPE;
  v_new_id uuid;
  v_no int;
BEGIN
  SELECT * INTO v_src FROM public.audio_narrative_versions WHERE id = _source_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'source version not found';
  END IF;
  SELECT * INTO v_narr FROM public.audio_narratives WHERE id = v_src.narrative_id;

  IF NOT public.audio_can_manage(v_src.tenant_id, 'audio.narrative.author') THEN
    RAISE EXCEPTION 'permission audio.narrative.author is required';
  END IF;

  IF EXISTS (SELECT 1 FROM public.audio_narrative_versions
              WHERE narrative_id = v_src.narrative_id AND status = 'draft') THEN
    RAISE EXCEPTION 'an open draft already exists for this narrative';
  END IF;

  SELECT COALESCE(MAX(version_no), 0) + 1 INTO v_no
    FROM public.audio_narrative_versions WHERE narrative_id = v_src.narrative_id;

  INSERT INTO public.audio_narrative_versions (
    tenant_id, narrative_id, version_no, source_text, speech_text, speech_markup,
    change_summary, status, speech_profile_id, estimated_duration_seconds, author_user_id
  ) VALUES (
    v_src.tenant_id, v_src.narrative_id, v_no, v_src.source_text, v_src.speech_text, v_src.speech_markup,
    COALESCE(NULLIF(btrim(COALESCE(_change_summary, '')), ''),
             'Draft created from v' || v_src.version_no),
    'draft', v_src.speech_profile_id, v_src.estimated_duration_seconds, auth.uid()
  )
  RETURNING id INTO v_new_id;

  PERFORM public.emit_audit_event(
    v_src.tenant_id, 'cae.version.action.restore', 'audio_narrative_version', v_new_id::text,
    jsonb_build_object('status', v_src.status, 'version_no', v_src.version_no),
    jsonb_build_object('status', 'draft', 'version_no', v_no, 'call_id', v_narr.call_id),
    NULLIF(btrim(COALESCE(_change_summary, '')), ''),
    jsonb_build_object('action', 'restore', 'source_version_id', _source_version_id,
                       'narrative_id', v_src.narrative_id)
  );

  RETURN v_new_id;
END $function$;

REVOKE EXECUTE ON FUNCTION public.audio_version_create_draft_from(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_version_create_draft_from(uuid, text) TO authenticated;

-- 3. Lifecycle audit history for a narrative --------------------------------
CREATE OR REPLACE FUNCTION public.audio_admin_narrative_audit(_narrative_id uuid)
RETURNS TABLE (
  id uuid,
  occurred_at timestamptz,
  action_code text,
  object_type text,
  object_id text,
  actor_user_id uuid,
  actor_name text,
  previous_status text,
  new_status text,
  version_no int,
  comment text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_narr public.audio_narratives%ROWTYPE;
BEGIN
  SELECT * INTO v_narr FROM public.audio_narratives WHERE id = _narrative_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'narrative not found';
  END IF;
  IF NOT public.audio_can_view(v_narr.tenant_id) THEN
    RAISE EXCEPTION 'permission audio.view is required';
  END IF;

  RETURN QUERY
  SELECT ae.id,
         ae.occurred_at,
         ae.action_code,
         ae.object_type,
         ae.object_id,
         ae.actor_user_id,
         COALESCE(NULLIF(btrim(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), ''), p.email),
         ae.before_values ->> 'status',
         ae.after_values  ->> 'status',
         COALESCE((ae.after_values ->> 'version_no')::int, v.version_no),
         ae.reason
    FROM public.audit_events ae
    LEFT JOIN public.audio_narrative_versions v
           ON ae.object_type = 'audio_narrative_version' AND v.id::text = ae.object_id
    LEFT JOIN public.profiles p ON p.id = ae.actor_user_id
   WHERE ae.tenant_id = v_narr.tenant_id
     AND (
       (ae.object_type = 'audio_narrative' AND ae.object_id = _narrative_id::text)
       OR (ae.object_type = 'audio_narrative_version' AND v.narrative_id = _narrative_id)
     )
   ORDER BY ae.occurred_at DESC
   LIMIT 300;
END $function$;

REVOKE EXECUTE ON FUNCTION public.audio_admin_narrative_audit(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_admin_narrative_audit(uuid) TO authenticated;