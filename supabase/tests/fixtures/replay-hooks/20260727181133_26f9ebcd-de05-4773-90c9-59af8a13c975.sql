-- Replay hook for the audio narrative seed migration.
--
-- That migration is on the replay skip list because its body seeds narratives
-- for a specific live tenant/owner UUID pair that does not exist in a fresh
-- database. It also carries one schema statement that later migrations depend
-- on, so the schema part is replayed here.

ALTER TABLE public.audio_narrative_versions
  ADD COLUMN IF NOT EXISTS estimated_duration_seconds integer;
