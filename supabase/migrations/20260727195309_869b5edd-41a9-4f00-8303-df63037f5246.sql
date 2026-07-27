REVOKE ALL ON FUNCTION public.audio_playback_event_guard() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.audio_record_event(text, text, text, text, text, text, text, integer, text, text, text, text, integer, integer, text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.audio_record_event(text, text, text, text, text, text, text, integer, text, text, text, text, integer, integer, text, text) TO authenticated;
REVOKE ALL ON FUNCTION public.audio_analytics_overview(uuid, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.audio_analytics_overview(uuid, integer) TO authenticated;