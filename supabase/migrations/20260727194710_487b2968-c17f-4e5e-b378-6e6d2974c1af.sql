-- ============================================================
-- CAE.110 — usage analytics & operational diagnostics
-- ============================================================

ALTER TABLE public.audio_playback_events
  ADD COLUMN IF NOT EXISTS module_key text,
  ADD COLUMN IF NOT EXISTS page_key text,
  ADD COLUMN IF NOT EXISTS section_key text,
  ADD COLUMN IF NOT EXISTS audience text,
  ADD COLUMN IF NOT EXISTS version_no integer,
  ADD COLUMN IF NOT EXISTS browser_capability text,
  ADD COLUMN IF NOT EXISTS playback_state text,
  ADD COLUMN IF NOT EXISTS error_category text;

CREATE INDEX IF NOT EXISTS audio_playback_events_tenant_time_idx
  ON public.audio_playback_events (tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS audio_playback_events_call_idx
  ON public.audio_playback_events (tenant_id, call_id, event_type);

-- ---------- write guard: only known events, only bounded values ----------
CREATE OR REPLACE FUNCTION public.audio_playback_event_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_allowed text[] := ARRAY[
    'playback_requested','playback_started','playback_paused','playback_resumed',
    'playback_stopped','playback_completed','transcript_opened',
    'narrative_unavailable','unsupported_browser','playback_error'
  ];
BEGIN
  IF NEW.event_type IS NULL OR NOT (NEW.event_type = ANY (v_allowed)) THEN
    RAISE EXCEPTION 'audio_playback_events: unsupported event_type %', NEW.event_type
      USING ERRCODE = '22023';
  END IF;

  -- Bounded, low-cardinality context only. Anything longer than the identifier
  -- budget is treated as accidental payload and dropped rather than stored.
  NEW.call_id            := left(nullif(btrim(NEW.call_id), ''), 128);
  NEW.placement_key      := left(nullif(btrim(NEW.placement_key), ''), 128);
  NEW.module_key         := left(nullif(btrim(NEW.module_key), ''), 64);
  NEW.page_key           := left(nullif(btrim(NEW.page_key), ''), 128);
  NEW.section_key        := left(nullif(btrim(NEW.section_key), ''), 128);
  NEW.audience           := left(nullif(btrim(NEW.audience), ''), 64);
  NEW.locale             := left(nullif(btrim(NEW.locale), ''), 32);
  NEW.voice_name         := left(nullif(btrim(NEW.voice_name), ''), 96);
  NEW.error_code         := left(nullif(btrim(NEW.error_code), ''), 64);
  NEW.error_category     := left(nullif(btrim(NEW.error_category), ''), 64);
  NEW.playback_state     := left(nullif(btrim(NEW.playback_state), ''), 32);
  NEW.browser_capability := left(nullif(btrim(NEW.browser_capability), ''), 32);

  IF NEW.duration_ms IS NOT NULL AND (NEW.duration_ms < 0 OR NEW.duration_ms > 86400000) THEN
    NEW.duration_ms := NULL;
  END IF;
  IF NEW.char_count IS NOT NULL AND (NEW.char_count < 0 OR NEW.char_count > 1000000) THEN
    NEW.char_count := NULL;
  END IF;
  IF NEW.version_no IS NOT NULL AND (NEW.version_no < 0 OR NEW.version_no > 100000) THEN
    NEW.version_no := NULL;
  END IF;

  NEW.occurred_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audio_playback_event_guard_trg ON public.audio_playback_events;
CREATE TRIGGER audio_playback_event_guard_trg
  BEFORE INSERT ON public.audio_playback_events
  FOR EACH ROW EXECUTE FUNCTION public.audio_playback_event_guard();

-- ---------- recording service ----------
CREATE OR REPLACE FUNCTION public.audio_record_event(
  _event_type text,
  _call_id text DEFAULT NULL,
  _placement_key text DEFAULT NULL,
  _module_key text DEFAULT NULL,
  _page_key text DEFAULT NULL,
  _section_key text DEFAULT NULL,
  _audience text DEFAULT NULL,
  _version_no integer DEFAULT NULL,
  _playback_state text DEFAULT NULL,
  _browser_capability text DEFAULT NULL,
  _error_category text DEFAULT NULL,
  _error_code text DEFAULT NULL,
  _duration_ms integer DEFAULT NULL,
  _char_count integer DEFAULT NULL,
  _locale text DEFAULT NULL,
  _voice_name text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tenant uuid;
  v_narrative_id uuid;
  v_version_id uuid;
  v_audience text;
  v_module text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- Tenant, narrative, and version are derived server side. Client supplied
  -- identifiers are never trusted for scoping.
  IF _call_id IS NOT NULL THEN
    SELECT n.tenant_id, n.id, n.active_version_id, n.audience, n.module_key
      INTO v_tenant, v_narrative_id, v_version_id, v_audience, v_module
      FROM public.audio_narratives n
     WHERE n.call_id = _call_id
       AND public.audio_can_view(n.tenant_id)
     ORDER BY n.updated_at DESC
     LIMIT 1;
  END IF;

  IF v_tenant IS NULL THEN
    -- Diagnostics for unknown / unavailable call IDs still need a home: use the
    -- caller's tenant only when it is unambiguous.
    SELECT m.tenant_id INTO v_tenant
      FROM public.memberships m
     WHERE m.user_id = v_uid AND m.status = 'active'
     LIMIT 2;
    IF (SELECT count(*) FROM public.memberships m
         WHERE m.user_id = v_uid AND m.status = 'active') <> 1 THEN
      v_tenant := NULL;
    END IF;
  END IF;

  IF v_tenant IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.audio_playback_events (
    tenant_id, user_id, narrative_id, narrative_version_id, call_id, placement_key,
    event_type, module_key, page_key, section_key, audience, version_no,
    playback_state, browser_capability, error_category, error_code,
    duration_ms, char_count, locale, voice_name
  ) VALUES (
    v_tenant, v_uid, v_narrative_id, v_version_id, _call_id, _placement_key,
    _event_type, coalesce(_module_key, v_module), _page_key, _section_key,
    coalesce(_audience, v_audience), _version_no,
    _playback_state, _browser_capability, _error_category, _error_code,
    _duration_ms, _char_count, _locale, _voice_name
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.audio_record_event(text,text,text,text,text,text,text,integer,text,text,text,text,integer,integer,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_record_event(text,text,text,text,text,text,text,integer,text,text,text,text,integer,integer,text,text) TO authenticated;

-- ---------- analytics service ----------
CREATE OR REPLACE FUNCTION public.audio_analytics_overview(
  _tenant_id uuid,
  _days integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days integer := greatest(1, least(coalesce(_days, 30), 365));
  v_from timestamptz;
  v_out jsonb;
BEGIN
  IF NOT public.audio_can_manage(_tenant_id, 'audio.analytics.view') THEN
    RETURN jsonb_build_object('status', 'unauthorized',
      'message', 'You do not have access to audio analytics for this workspace.');
  END IF;

  v_from := now() - make_interval(days => v_days);

  WITH ev AS (
    SELECT * FROM public.audio_playback_events e
     WHERE e.tenant_id = _tenant_id AND e.occurred_at >= v_from
  ),
  totals AS (
    SELECT
      count(*) FILTER (WHERE event_type = 'playback_requested')  AS requested,
      count(*) FILTER (WHERE event_type = 'playback_started')    AS started,
      count(*) FILTER (WHERE event_type = 'playback_paused')     AS paused,
      count(*) FILTER (WHERE event_type = 'playback_resumed')    AS resumed,
      count(*) FILTER (WHERE event_type = 'playback_stopped')    AS stopped,
      count(*) FILTER (WHERE event_type = 'playback_completed')  AS completed,
      count(*) FILTER (WHERE event_type = 'transcript_opened')   AS transcripts,
      count(*) FILTER (WHERE event_type = 'narrative_unavailable') AS unavailable,
      count(*) FILTER (WHERE event_type = 'unsupported_browser') AS unsupported,
      count(*) FILTER (WHERE event_type = 'playback_error')      AS errors,
      count(*) AS total
    FROM ev
  ),
  top_narratives AS (
    SELECT e.call_id,
           max(n.name) AS title,
           max(e.module_key) AS module_key,
           count(*) FILTER (WHERE e.event_type = 'playback_started')   AS starts,
           count(*) FILTER (WHERE e.event_type = 'playback_completed') AS completes,
           count(*) FILTER (WHERE e.event_type = 'playback_stopped')   AS stops,
           count(*) FILTER (WHERE e.event_type = 'transcript_opened')  AS transcripts,
           count(*) FILTER (WHERE e.event_type = 'playback_error')     AS errors
      FROM ev e
      LEFT JOIN public.audio_narratives n ON n.id = e.narrative_id
     WHERE e.call_id IS NOT NULL
     GROUP BY e.call_id
     ORDER BY starts DESC, e.call_id
     LIMIT 25
  ),
  by_module_page AS (
    SELECT coalesce(e.module_key, 'unknown') AS module_key,
           coalesce(e.page_key, 'unknown')   AS page_key,
           count(*) FILTER (WHERE e.event_type = 'playback_started')   AS starts,
           count(*) FILTER (WHERE e.event_type = 'playback_completed') AS completes,
           count(*) FILTER (WHERE e.event_type = 'transcript_opened')  AS transcripts,
           count(*) FILTER (WHERE e.event_type = 'playback_error')     AS errors
      FROM ev e
     GROUP BY 1, 2
     ORDER BY starts DESC, 1, 2
     LIMIT 50
  ),
  broken_calls AS (
    SELECT e.call_id,
           count(*) AS failures,
           max(e.occurred_at) AS last_seen,
           coalesce(max(e.error_category), 'narrative_unavailable') AS category
      FROM ev e
     WHERE e.event_type IN ('narrative_unavailable', 'playback_error')
       AND e.call_id IS NOT NULL
     GROUP BY e.call_id
     ORDER BY failures DESC, e.call_id
     LIMIT 50
  ),
  used_narratives AS (
    SELECT DISTINCT narrative_id FROM ev
     WHERE narrative_id IS NOT NULL AND event_type = 'playback_started'
  ),
  unused_placements AS (
    SELECT p.placement_key, p.module_key, p.page_key, p.call_id, n.name AS title
      FROM public.audio_placements p
      JOIN public.audio_narratives n ON n.id = p.narrative_id
     WHERE p.tenant_id = _tenant_id
       AND p.is_enabled
       AND p.narrative_id NOT IN (SELECT narrative_id FROM used_narratives)
     ORDER BY p.module_key, p.placement_key
     LIMIT 100
  ),
  broken_placements AS (
    SELECT p.placement_key, p.module_key, p.page_key, p.call_id,
           CASE
             WHEN n.id IS NULL THEN 'missing_narrative'
             WHEN n.status = 'retired' THEN 'narrative_retired'
             WHEN n.active_version_id IS NULL THEN 'no_published_version'
             ELSE 'no_active_published_version'
           END AS reason
      FROM public.audio_placements p
      LEFT JOIN public.audio_narratives n
             ON n.id = p.narrative_id AND n.tenant_id = p.tenant_id
     WHERE p.tenant_id = _tenant_id
       AND p.is_enabled
       AND (
         n.id IS NULL
         OR n.status = 'retired'
         OR n.active_version_id IS NULL
         OR NOT EXISTS (
           SELECT 1 FROM public.audio_narrative_versions v
            WHERE v.id = n.active_version_id AND v.status = 'published'
              AND (v.effective_start_at IS NULL OR v.effective_start_at <= now())
              AND (v.effective_end_at   IS NULL OR v.effective_end_at   >  now())
         )
       )
     ORDER BY p.module_key, p.placement_key
     LIMIT 100
  ),
  version_trends AS (
    SELECT e.call_id, e.version_no,
           count(*) FILTER (WHERE e.event_type = 'playback_started')   AS starts,
           count(*) FILTER (WHERE e.event_type = 'playback_completed') AS completes,
           count(*) FILTER (WHERE e.event_type = 'playback_stopped')   AS stops,
           count(*) FILTER (WHERE e.event_type = 'playback_error')     AS errors,
           max(e.occurred_at) AS last_seen
      FROM ev e
     WHERE e.call_id IS NOT NULL AND e.version_no IS NOT NULL
     GROUP BY e.call_id, e.version_no
     ORDER BY e.call_id, e.version_no
     LIMIT 100
  )
  SELECT jsonb_build_object(
    'status', 'ok',
    'tenantId', _tenant_id,
    'windowDays', v_days,
    'generatedAt', now(),
    'totals', (SELECT to_jsonb(t) FROM totals t),
    'topNarratives', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM top_narratives x), '[]'::jsonb),
    'byModulePage', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM by_module_page x), '[]'::jsonb),
    'brokenCalls', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM broken_calls x), '[]'::jsonb),
    'unusedPlacements', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM unused_placements x), '[]'::jsonb),
    'brokenPlacements', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM broken_placements x), '[]'::jsonb),
    'versionTrends', coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM version_trends x), '[]'::jsonb)
  ) INTO v_out;

  RETURN v_out;
END;
$$;

REVOKE ALL ON FUNCTION public.audio_analytics_overview(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audio_analytics_overview(uuid, integer) TO authenticated;