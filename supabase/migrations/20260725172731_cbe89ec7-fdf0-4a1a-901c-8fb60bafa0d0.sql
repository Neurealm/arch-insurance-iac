-- BP3.4.2 — Cash run supersession reference reconciliation
-- Data-only patch. Financial data, statuses, hashes, timestamps, inputs,
-- results, and lineage are NOT modified.

-- 1. Extend the terminal-state guard to permit a supersession-link-only
--    correction while keeping every other field (including status) immutable.
CREATE OR REPLACE FUNCTION public.commercial_model_run_header_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IN ('completed','failed','superseded') THEN
      -- Existing allowlist: self-transition to superseded.
      IF NEW.status = 'superseded' AND OLD.status <> 'superseded'
         AND NEW.id = OLD.id AND NEW.tenant_id = OLD.tenant_id
         AND NEW.program_id = OLD.program_id AND NEW.scenario_id = OLD.scenario_id
         AND NEW.model_version_id = OLD.model_version_id
         AND NEW.run_scope = OLD.run_scope AND NEW.input_hash = OLD.input_hash
         AND NEW.started_at IS NOT DISTINCT FROM OLD.started_at
         AND NEW.completed_at IS NOT DISTINCT FROM OLD.completed_at THEN
        RETURN NEW;
      END IF;
      -- New allowlist: supersession-link-only correction. Every other
      -- column (including status) must be identical. Only supersedes_run_id
      -- may change. Self-references are forbidden.
      IF NEW.id = OLD.id AND NEW.tenant_id = OLD.tenant_id
         AND NEW.program_id = OLD.program_id AND NEW.scenario_id = OLD.scenario_id
         AND NEW.model_version_id = OLD.model_version_id
         AND NEW.run_scope = OLD.run_scope AND NEW.status = OLD.status
         AND NEW.input_hash = OLD.input_hash
         AND NEW.started_at IS NOT DISTINCT FROM OLD.started_at
         AND NEW.completed_at IS NOT DISTINCT FROM OLD.completed_at
         AND NEW.failed_at IS NOT DISTINCT FROM OLD.failed_at
         AND NEW.error_code IS NOT DISTINCT FROM OLD.error_code
         AND NEW.error_message IS NOT DISTINCT FROM OLD.error_message
         AND NEW.created_by IS NOT DISTINCT FROM OLD.created_by
         AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at
         AND NEW.supersedes_run_id IS DISTINCT FROM OLD.supersedes_run_id
         AND (NEW.supersedes_run_id IS NULL OR NEW.supersedes_run_id <> NEW.id) THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'commercial_run_immutable_after_terminal_state';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('completed','failed','superseded') THEN
      RAISE EXCEPTION 'commercial_run_immutable_after_terminal_state';
    END IF;
  END IF;
  RETURN NEW;
END $function$;

-- 2. Reconcile the three cash run pairs inside a validated transactional block.
DO $$
DECLARE
  pairs CONSTANT jsonb := jsonb_build_array(
    jsonb_build_object('scenario','CONSERVATIVE',
      'defective','e79ba517-4158-4516-8e37-62f09005139a',
      'corrected','2aaab721-c8ba-4aec-9a63-36aa8a8493a4'),
    jsonb_build_object('scenario','BASE',
      'defective','d225ea9f-5a77-44d5-bd81-5dc64d2da5f2',
      'corrected','521cf9e1-2031-4bde-809b-b6b005ed88c7'),
    jsonb_build_object('scenario','UPSIDE',
      'defective','93f33caf-838f-4ee2-9b49-c3dfa671e43d',
      'corrected','44eab7db-3952-46d3-9c97-f8ebd29f445b')
  );
  pair jsonb;
  d_id uuid;
  c_id uuid;
  d_row public.commercial_model_runs;
  c_row public.commercial_model_runs;
  cleared_count int := 0;
  linked_count int := 0;
BEGIN
  FOR pair IN SELECT * FROM jsonb_array_elements(pairs) LOOP
    d_id := (pair->>'defective')::uuid;
    c_id := (pair->>'corrected')::uuid;

    SELECT * INTO d_row FROM public.commercial_model_runs WHERE id = d_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'bp3_4_2_missing_defective_run: %', d_id;
    END IF;
    SELECT * INTO c_row FROM public.commercial_model_runs WHERE id = c_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'bp3_4_2_missing_corrected_run: %', c_id;
    END IF;

    -- Preflight assertions.
    IF d_row.tenant_id <> c_row.tenant_id
       OR d_row.program_id <> c_row.program_id
       OR d_row.scenario_id <> c_row.scenario_id
       OR d_row.model_version_id <> c_row.model_version_id
       OR d_row.run_scope <> 'cash' OR c_row.run_scope <> 'cash' THEN
      RAISE EXCEPTION 'bp3_4_2_pair_context_mismatch: % / %', d_id, c_id;
    END IF;
    IF d_row.status <> 'superseded' THEN
      RAISE EXCEPTION 'bp3_4_2_defective_not_superseded: %', d_id;
    END IF;
    IF c_row.status <> 'completed' THEN
      RAISE EXCEPTION 'bp3_4_2_corrected_not_completed: %', c_id;
    END IF;
    IF c_row.completed_at IS NULL OR d_row.completed_at IS NULL
       OR c_row.completed_at <= d_row.completed_at THEN
      RAISE EXCEPTION 'bp3_4_2_corrected_not_after_defective: % / %', c_id, d_id;
    END IF;

    -- Idempotent clear of defective self-reference.
    IF d_row.supersedes_run_id IS NOT NULL THEN
      IF d_row.supersedes_run_id <> d_id THEN
        RAISE EXCEPTION 'bp3_4_2_unexpected_defective_reference: % -> %',
          d_id, d_row.supersedes_run_id;
      END IF;
      UPDATE public.commercial_model_runs
        SET supersedes_run_id = NULL
      WHERE id = d_id;
      cleared_count := cleared_count + 1;
    END IF;

    -- Idempotent link of corrected -> defective.
    IF c_row.supersedes_run_id IS DISTINCT FROM d_id THEN
      IF c_row.supersedes_run_id IS NOT NULL
         AND c_row.supersedes_run_id <> d_id THEN
        RAISE EXCEPTION 'bp3_4_2_unexpected_corrected_reference: % -> %',
          c_id, c_row.supersedes_run_id;
      END IF;
      UPDATE public.commercial_model_runs
        SET supersedes_run_id = d_id
      WHERE id = c_id;
      linked_count := linked_count + 1;
    END IF;

    -- Post-condition assertions per pair.
    PERFORM 1 FROM public.commercial_model_runs
      WHERE id = d_id AND status = 'superseded' AND supersedes_run_id IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'bp3_4_2_defective_postcheck_failed: %', d_id;
    END IF;
    PERFORM 1 FROM public.commercial_model_runs
      WHERE id = c_id AND status = 'completed' AND supersedes_run_id = d_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'bp3_4_2_corrected_postcheck_failed: %', c_id;
    END IF;
  END LOOP;

  RAISE NOTICE 'bp3_4_2 reconciliation: cleared=% linked=%',
    cleared_count, linked_count;
END $$;

-- 3. Emit one audit event per reconciled pair (idempotent — key on run pair).
INSERT INTO public.audit_events (
  tenant_id, actor_user_id, action_code, object_type, object_id, source, metadata
)
SELECT
  c.tenant_id,
  NULL::uuid,
  'commercial.model.run.supersession_reconciled',
  'commercial_model_run',
  c.id::text,
  'migration:bp3_4_2',
  jsonb_build_object(
    'patch', 'BP3.4.2',
    'scenario_id', c.scenario_id,
    'model_version_id', c.model_version_id,
    'defective_run_id', d.id,
    'corrected_run_id', c.id,
    'reason', 'BP3.4.1 supersession link direction reconciliation'
  )
FROM public.commercial_model_runs c
JOIN public.commercial_model_runs d ON d.id = c.supersedes_run_id
WHERE c.id IN (
    '2aaab721-c8ba-4aec-9a63-36aa8a8493a4',
    '521cf9e1-2031-4bde-809b-b6b005ed88c7',
    '44eab7db-3952-46d3-9c97-f8ebd29f445b')
  AND NOT EXISTS (
    SELECT 1 FROM public.audit_events ae
    WHERE ae.action_code = 'commercial.model.run.supersession_reconciled'
      AND ae.object_id = c.id::text
      AND ae.metadata->>'patch' = 'BP3.4.2'
  );