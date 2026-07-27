CREATE OR REPLACE FUNCTION public.audio_resolve_call(
  _call_id text,
  _placement_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_narr public.audio_narratives%ROWTYPE;
  v_ver  public.audio_narrative_versions%ROWTYPE;
  v_prof public.audio_speech_profiles%ROWTYPE;
  v_place public.audio_placements%ROWTYPE;
  v_exists boolean;
  v_rules jsonb;
BEGIN
  -- 1. Call ID format ------------------------------------------------------
  IF _call_id IS NULL
     OR _call_id !~ '^CAE\.[A-Z][A-Z0-9]*\.[A-Z][A-Z0-9_]*\.[0-9]{3}$' THEN
    RETURN jsonb_build_object('status', 'invalid_call_id',
      'message', 'Call ID must match CAE.<MODULE>.<TOPIC>.<SEQUENCE>.');
  END IF;

  -- 2. Authenticated identity (never taken from the client) ----------------
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('status', 'unauthorized',
      'message', 'An authenticated session is required.');
  END IF;

  -- 3. Narrative resolution within a tenant the caller may view ------------
  SELECT n.* INTO v_narr
    FROM public.audio_narratives n
   WHERE n.call_id = _call_id
     AND public.audio_can_view(n.tenant_id)
   ORDER BY n.updated_at DESC
   LIMIT 1;

  IF NOT FOUND THEN
    SELECT EXISTS (SELECT 1 FROM public.audio_narratives n WHERE n.call_id = _call_id)
      INTO v_exists;
    IF v_exists THEN
      RETURN jsonb_build_object('status', 'unauthorized',
        'message', 'You do not have access to this narrative.');
    END IF;
    RETURN jsonb_build_object('status', 'narrative_not_found',
      'message', 'No narrative exists for this call ID.');
  END IF;

  IF v_narr.status = 'retired' THEN
    RETURN jsonb_build_object('status', 'narrative_unavailable',
      'message', 'This narrative has been retired.');
  END IF;

  -- 4. Active published version only ---------------------------------------
  IF v_narr.active_version_id IS NULL THEN
    RETURN jsonb_build_object('status', 'no_published_version',
      'message', 'This narrative has no active published version.');
  END IF;

  SELECT v.* INTO v_ver
    FROM public.audio_narrative_versions v
   WHERE v.id = v_narr.active_version_id
     AND v.tenant_id = v_narr.tenant_id
     AND v.status = 'published'
     AND (v.effective_start_at IS NULL OR v.effective_start_at <= now())
     AND (v.effective_end_at   IS NULL OR v.effective_end_at   >  now());

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'no_published_version',
      'message', 'This narrative has no active published version.');
  END IF;

  -- 5. Placement (optional) -------------------------------------------------
  IF _placement_key IS NOT NULL THEN
    SELECT p.* INTO v_place
      FROM public.audio_placements p
     WHERE p.tenant_id = v_narr.tenant_id
       AND p.placement_key = _placement_key;

    IF NOT FOUND
       OR v_place.is_enabled IS NOT TRUE
       OR v_place.narrative_id IS DISTINCT FROM v_narr.id THEN
      RETURN jsonb_build_object('status', 'unsupported_context',
        'message', 'The requested placement is unknown, disabled, or not bound to this narrative.');
    END IF;

    IF v_place.required_permission_code IS NOT NULL
       AND NOT public.audio_can_manage(v_narr.tenant_id, v_place.required_permission_code)
       AND NOT public.has_permission(v_uid, v_narr.tenant_id, v_place.required_permission_code) THEN
      RETURN jsonb_build_object('status', 'unauthorized',
        'message', 'You do not have permission for this placement context.');
    END IF;
  END IF;

  -- 6. Speech profile -------------------------------------------------------
  SELECT sp.* INTO v_prof
    FROM public.audio_speech_profiles sp
   WHERE sp.tenant_id = v_narr.tenant_id
     AND sp.is_enabled
     AND sp.id = COALESCE(v_ver.speech_profile_id, v_narr.default_speech_profile_id);

  IF NOT FOUND THEN
    SELECT sp.* INTO v_prof
      FROM public.audio_speech_profiles sp
     WHERE sp.tenant_id = v_narr.tenant_id
       AND sp.is_enabled
       AND sp.is_default
     LIMIT 1;
  END IF;

  IF v_prof.id IS NULL THEN
    RETURN jsonb_build_object('status', 'invalid_speech_configuration',
      'message', 'No enabled speech profile is available for this narrative.');
  END IF;

  -- 7. Pronunciation rules --------------------------------------------------
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'matchText', r.match_text,
           'matchType', r.match_type,
           'replacementText', r.replacement_text,
           'priority', r.priority
         ) ORDER BY r.priority, r.match_text), '[]'::jsonb)
    INTO v_rules
    FROM public.audio_pronunciation_rules r
   WHERE r.tenant_id = v_narr.tenant_id
     AND r.is_enabled
     AND (r.scope = 'global' OR r.module_key = v_narr.module_key)
     AND (r.locale IS NULL OR r.locale = COALESCE(v_prof.locale, v_narr.default_locale));

  RETURN jsonb_build_object(
    'status', 'ok',
    'narrative', jsonb_build_object(
      'callId', v_narr.call_id,
      'title', v_narr.name,
      'description', v_narr.description,
      'moduleKey', v_narr.module_key,
      'topicKey', v_narr.topic_key,
      'audience', v_narr.audience,
      'scopeType', v_narr.scope_type,
      'scopeReference', v_narr.scope_reference
    ),
    'version', jsonb_build_object(
      'versionNo', v_ver.version_no,
      'sourceText', v_ver.source_text,
      'speechText', COALESCE(v_ver.speech_text, v_ver.source_text),
      'transcriptText', COALESCE(v_ver.source_text, v_ver.speech_text),
      'estimatedDurationSeconds', v_ver.estimated_duration_seconds,
      'publishedAt', v_ver.published_at
    ),
    'speechProfile', jsonb_build_object(
      'profileKey', v_prof.profile_key,
      'displayName', v_prof.display_name,
      'locale', v_prof.locale,
      'fallbackLocale', v_prof.fallback_locale,
      'preferredVoiceNames', to_jsonb(v_prof.preferred_voice_names),
      'rate', v_prof.rate,
      'pitch', v_prof.pitch,
      'volume', v_prof.volume
    ),
    'pronunciationRules', v_rules,
    'placement', CASE WHEN v_place.id IS NULL THEN NULL ELSE jsonb_build_object(
      'placementKey', v_place.placement_key,
      'buttonLabel', v_place.button_label,
      'displayVariant', v_place.display_variant,
      'routePattern', v_place.route_pattern,
      'pageKey', v_place.page_key,
      'sectionKey', v_place.section_key,
      'componentKey', v_place.component_key,
      'sortOrder', v_place.sort_order
    ) END
  );
END
$function$;

REVOKE ALL ON FUNCTION public.audio_resolve_call(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_resolve_call(text, text) TO authenticated;