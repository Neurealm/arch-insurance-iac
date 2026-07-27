-- CAE.070: administrative support functions for the Contextual Audio Enrichment Manager

CREATE OR REPLACE FUNCTION public.audio_admin_list_narratives(_tenant_id uuid)
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  call_id text,
  name text,
  description text,
  module_key text,
  topic_key text,
  scope_type text,
  scope_reference text,
  audience text,
  default_locale text,
  status text,
  owner_user_id uuid,
  owner_name text,
  active_version_id uuid,
  active_version_no integer,
  speech_profile_id uuid,
  speech_profile_name text,
  placement_count integer,
  enabled_placement_count integer,
  version_count integer,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    n.id,
    n.tenant_id,
    n.call_id,
    n.name,
    n.description,
    n.module_key,
    n.topic_key,
    n.scope_type,
    n.scope_reference,
    n.audience,
    n.default_locale,
    n.status,
    n.owner_user_id,
    NULLIF(TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), '') AS owner_name,
    n.active_version_id,
    av.version_no,
    COALESCE(av.speech_profile_id, n.default_speech_profile_id) AS speech_profile_id,
    sp.display_name AS speech_profile_name,
    (SELECT COUNT(*)::int FROM public.audio_placements pl WHERE pl.narrative_id = n.id),
    (SELECT COUNT(*)::int FROM public.audio_placements pl WHERE pl.narrative_id = n.id AND pl.is_enabled),
    (SELECT COUNT(*)::int FROM public.audio_narrative_versions v WHERE v.narrative_id = n.id),
    n.updated_at
  FROM public.audio_narratives n
  LEFT JOIN public.audio_narrative_versions av ON av.id = n.active_version_id
  LEFT JOIN public.audio_speech_profiles sp ON sp.id = COALESCE(av.speech_profile_id, n.default_speech_profile_id)
  LEFT JOIN public.profiles p ON p.id = n.owner_user_id
  WHERE n.tenant_id = _tenant_id
    AND public.audio_can_view(_tenant_id)
  ORDER BY n.call_id;
$$;

REVOKE EXECUTE ON FUNCTION public.audio_admin_list_narratives(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_admin_list_narratives(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.audio_admin_create_narrative(
  _tenant_id uuid,
  _call_id text,
  _name text,
  _module_key text,
  _topic_key text,
  _description text DEFAULT NULL,
  _scope_type text DEFAULT 'page',
  _scope_reference text DEFAULT NULL,
  _audience text DEFAULT 'all',
  _default_locale text DEFAULT 'en-US',
  _speech_profile_id uuid DEFAULT NULL,
  _source_text text DEFAULT '',
  _speech_text text DEFAULT NULL,
  _change_summary text DEFAULT NULL,
  _estimated_duration_seconds integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.audio_can_manage(_tenant_id, 'audio.narrative.author') THEN
    RAISE EXCEPTION 'permission audio.narrative.author is required';
  END IF;
  IF _call_id !~ '^CAE\.[A-Z][A-Z0-9]*\.[A-Z][A-Z0-9_]*\.[0-9]{3}$' THEN
    RAISE EXCEPTION 'call_id must match CAE.<MODULE>.<TOPIC>.<SEQUENCE>';
  END IF;

  INSERT INTO public.audio_narratives (
    tenant_id, call_id, name, description, module_key, topic_key,
    scope_type, scope_reference, audience, default_locale,
    default_speech_profile_id, owner_user_id, status
  ) VALUES (
    _tenant_id, _call_id, _name, NULLIF(_description, ''), _module_key, _topic_key,
    COALESCE(NULLIF(_scope_type, ''), 'page'), NULLIF(_scope_reference, ''),
    COALESCE(NULLIF(_audience, ''), 'all'), COALESCE(NULLIF(_default_locale, ''), 'en-US'),
    _speech_profile_id, auth.uid(), 'draft'
  )
  RETURNING id INTO v_id;

  INSERT INTO public.audio_narrative_versions (
    tenant_id, narrative_id, version_no, source_text, speech_text,
    change_summary, status, speech_profile_id, estimated_duration_seconds
  ) VALUES (
    _tenant_id, v_id, 1, COALESCE(_source_text, ''), NULLIF(_speech_text, ''),
    NULLIF(_change_summary, ''), 'draft', _speech_profile_id, _estimated_duration_seconds
  );

  PERFORM public.emit_audit_event(
    _tenant_id, 'cae.narrative.created', 'audio_narrative', v_id::text,
    NULL, jsonb_build_object('call_id', _call_id, 'name', _name), NULL, '{}'::jsonb
  );

  RETURN v_id;
END $$;

REVOKE EXECUTE ON FUNCTION public.audio_admin_create_narrative(uuid, text, text, text, text, text, text, text, text, text, uuid, text, text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_admin_create_narrative(uuid, text, text, text, text, text, text, text, text, text, uuid, text, text, text, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.audio_admin_duplicate_narrative(
  _narrative_id uuid,
  _new_call_id text,
  _new_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_src public.audio_narratives%ROWTYPE;
  v_ver public.audio_narrative_versions%ROWTYPE;
  v_id uuid;
BEGIN
  SELECT * INTO v_src FROM public.audio_narratives WHERE id = _narrative_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'narrative not found';
  END IF;
  IF NOT public.audio_can_manage(v_src.tenant_id, 'audio.narrative.author') THEN
    RAISE EXCEPTION 'permission audio.narrative.author is required';
  END IF;

  SELECT * INTO v_ver FROM public.audio_narrative_versions
   WHERE narrative_id = _narrative_id
   ORDER BY (id = v_src.active_version_id) DESC, version_no DESC
   LIMIT 1;

  v_id := public.audio_admin_create_narrative(
    v_src.tenant_id, _new_call_id, _new_name,
    split_part(_new_call_id, '.', 2), split_part(_new_call_id, '.', 3),
    v_src.description, v_src.scope_type, v_src.scope_reference,
    v_src.audience, v_src.default_locale, v_src.default_speech_profile_id,
    COALESCE(v_ver.source_text, ''), v_ver.speech_text,
    'Duplicated from ' || v_src.call_id, v_ver.estimated_duration_seconds
  );

  RETURN v_id;
END $$;

REVOKE EXECUTE ON FUNCTION public.audio_admin_duplicate_narrative(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_admin_duplicate_narrative(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.audio_admin_set_narrative_status(
  _narrative_id uuid,
  _status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_src public.audio_narratives%ROWTYPE;
  v_required text;
  v_next text;
BEGIN
  SELECT * INTO v_src FROM public.audio_narratives WHERE id = _narrative_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'narrative not found';
  END IF;

  IF _status = 'retired' THEN
    v_required := 'audio.narrative.retire';
    v_next := 'retired';
  ELSIF _status = 'restore' THEN
    v_required := 'audio.narrative.author';
    v_next := CASE WHEN v_src.active_version_id IS NOT NULL THEN 'published' ELSE 'draft' END;
  ELSE
    RAISE EXCEPTION 'unsupported narrative status %', _status;
  END IF;

  IF NOT public.audio_can_manage(v_src.tenant_id, v_required) THEN
    RAISE EXCEPTION 'permission % is required', v_required;
  END IF;

  UPDATE public.audio_narratives
     SET status = v_next, updated_at = now(), updated_by = auth.uid()
   WHERE id = _narrative_id;

  IF v_next = 'retired' THEN
    UPDATE public.audio_placements SET is_enabled = false WHERE narrative_id = _narrative_id;
  END IF;

  PERFORM public.emit_audit_event(
    v_src.tenant_id, 'cae.narrative.' || v_next, 'audio_narrative', _narrative_id::text,
    jsonb_build_object('status', v_src.status),
    jsonb_build_object('status', v_next, 'call_id', v_src.call_id),
    NULL, '{}'::jsonb
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.audio_admin_set_narrative_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_admin_set_narrative_status(uuid, text) TO authenticated;