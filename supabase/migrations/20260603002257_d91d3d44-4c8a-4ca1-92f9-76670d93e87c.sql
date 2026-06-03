-- Add a true unique constraint for upsert ON CONFLICT (tenant_id, source, external_id).
-- Drop any existing partial unique index of the same purpose.
DROP INDEX IF EXISTS public.tenant_incidents_tenant_source_extid_uniq;
DROP INDEX IF EXISTS public.tenant_incidents_tenant_id_source_external_id_idx;

-- Ensure no null external_ids collide; backfill with a stable surrogate for existing rows.
UPDATE public.tenant_incidents
   SET external_id = COALESCE(external_id, incident_number, id::text)
 WHERE external_id IS NULL;

ALTER TABLE public.tenant_incidents
  ALTER COLUMN external_id SET NOT NULL;

ALTER TABLE public.tenant_incidents
  ADD CONSTRAINT tenant_incidents_tenant_source_extid_key
  UNIQUE (tenant_id, source, external_id);