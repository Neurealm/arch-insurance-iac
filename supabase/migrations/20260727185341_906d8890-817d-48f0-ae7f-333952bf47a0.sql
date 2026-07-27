ALTER TABLE public.audio_speech_profiles
  ADD COLUMN IF NOT EXISTS fallback_profile_id uuid NULL REFERENCES public.audio_speech_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS audio_speech_profiles_fallback_idx
  ON public.audio_speech_profiles(fallback_profile_id);

ALTER TABLE public.audio_speech_profiles
  DROP CONSTRAINT IF EXISTS audio_speech_profiles_fallback_not_self;

ALTER TABLE public.audio_speech_profiles
  ADD CONSTRAINT audio_speech_profiles_fallback_not_self
  CHECK (fallback_profile_id IS NULL OR fallback_profile_id <> id);