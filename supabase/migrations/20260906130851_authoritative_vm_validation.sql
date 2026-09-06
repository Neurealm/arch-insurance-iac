-- Validation/closure is server-authoritative. Existing client-created history
-- stays readable but has no authority until independently verified again.
ALTER TABLE public.iac_validation_runs
  ADD COLUMN validation_authority text CHECK (validation_authority = 'server-v1'),
  ADD COLUMN apply_run_id uuid REFERENCES public.iac_terraform_runs(id) ON DELETE RESTRICT;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.iac_validation_runs, public.iac_validation_results, public.iac_evidence_items FROM authenticated;
REVOKE ALL ON public.iac_validation_runs, public.iac_validation_results, public.iac_evidence_items FROM anon;
GRANT SELECT ON public.iac_validation_runs, public.iac_validation_results, public.iac_evidence_items TO authenticated;
DROP POLICY IF EXISTS iac_validation_runs_insert_for_package_participants ON public.iac_validation_runs;
DROP POLICY IF EXISTS iac_validation_runs_update_for_package_participants ON public.iac_validation_runs;
DROP POLICY IF EXISTS iac_validation_results_insert_for_package_participants ON public.iac_validation_results;
DROP POLICY IF EXISTS iac_evidence_items_insert_for_package_participants ON public.iac_evidence_items;

CREATE OR REPLACE FUNCTION public.record_iac_vm_validation(
  p_package_id uuid, p_actor_id uuid, p_apply_run_id uuid,
  p_checks jsonb, p_observations jsonb, p_close boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_package public.iac_change_packages%ROWTYPE;
  v_apply public.iac_terraform_runs%ROWTYPE;
  v_plan public.iac_terraform_runs%ROWTYPE;
  v_review public.iac_change_package_reviews%ROWTYPE;
  v_run public.iac_validation_runs%ROWTYPE;
  v_now timestamptz := clock_timestamp();
  v_payload jsonb;
  v_hash text;
  v_valid boolean;
  v_passed integer;
  v_mandatory integer;
  v_targets integer;
  v_item jsonb;
  v_existing_results jsonb;
BEGIN
  IF current_user <> 'service_role' THEN RAISE EXCEPTION 'server_validation_required'; END IF;
  SELECT * INTO v_package FROM public.iac_change_packages WHERE id = p_package_id FOR UPDATE;
  IF NOT FOUND OR p_actor_id IS NULL OR (v_package.created_by <> p_actor_id AND NOT public.is_platform_admin(p_actor_id)) THEN RAISE EXCEPTION 'package_not_available'; END IF;
  IF v_package.status <> 'executed' THEN RAISE EXCEPTION 'completed_execution_required'; END IF;
  SELECT * INTO v_apply FROM public.iac_terraform_runs WHERE id = p_apply_run_id AND package_id = p_package_id FOR SHARE;
  IF NOT FOUND OR v_apply.run_type <> 'apply' OR v_apply.execution_engine <> 'hcp_terraform' OR v_apply.status <> 'succeeded' OR v_apply.hcp_run_status IS DISTINCT FROM 'applied' THEN RAISE EXCEPTION 'successful_hcp_apply_required'; END IF;
  SELECT * INTO v_plan FROM public.iac_terraform_runs WHERE id = v_apply.plan_run_id AND package_id = p_package_id FOR SHARE;
  IF NOT FOUND OR v_plan.run_type <> 'plan' OR v_plan.status <> 'succeeded' OR v_plan.execution_engine <> 'hcp_terraform' THEN RAISE EXCEPTION 'successful_saved_plan_required'; END IF;
  SELECT * INTO v_review FROM public.iac_change_package_reviews WHERE package_id = p_package_id ORDER BY reviewed_at DESC, id DESC LIMIT 1;
  IF NOT FOUND OR v_review.decision <> 'approved' OR v_review.reviewed_by = v_package.created_by
    OR v_review.approved_plan_run_id IS DISTINCT FROM v_plan.id
    OR v_review.approved_plan_sha256 IS NULL OR v_review.approved_plan_sha256 IS DISTINCT FROM v_plan.plan_sha256 OR v_review.approved_plan_sha256 IS DISTINCT FROM v_apply.plan_sha256
    OR v_review.approved_source_revision IS NULL OR v_review.approved_source_revision IS DISTINCT FROM v_plan.source_revision OR v_review.approved_source_revision IS DISTINCT FROM v_apply.source_revision
    OR v_review.approved_hcp_run_id IS NULL OR v_review.approved_hcp_run_id IS DISTINCT FROM v_plan.hcp_run_id OR v_review.approved_hcp_run_id IS DISTINCT FROM v_apply.hcp_run_id
    OR v_review.approved_hcp_plan_id IS NULL OR v_review.approved_hcp_plan_id IS DISTINCT FROM v_plan.hcp_plan_id OR v_review.approved_hcp_plan_id IS DISTINCT FROM v_apply.hcp_plan_id
    OR v_plan.hcp_workspace_id IS NULL OR v_plan.hcp_workspace_id IS DISTINCT FROM v_apply.hcp_workspace_id
    OR v_plan.has_destroy OR v_plan.has_replace OR coalesce((v_plan.reconciliation->>'matched')::boolean, false) IS NOT TRUE
    THEN RAISE EXCEPTION 'exact_approved_apply_evidence_required';
  END IF;
  IF v_apply.completed_at IS NULL OR v_package.execution_completed_at IS NULL THEN RAISE EXCEPTION 'execution_completion_timestamp_required'; END IF;
  IF jsonb_typeof(p_checks) IS DISTINCT FROM 'array' OR jsonb_typeof(p_observations) IS DISTINCT FROM 'array' OR jsonb_array_length(p_checks) = 0 THEN RAISE EXCEPTION 'validation_results_required'; END IF;
  SELECT count(*), count(*) FILTER (WHERE item->>'result' = 'PASS') INTO v_mandatory, v_passed
    FROM jsonb_array_elements(p_checks) item WHERE coalesce((item->'raw'->>'mandatory')::boolean, true);
  SELECT count(*) INTO v_targets FROM public.iac_change_package_targets WHERE package_id = p_package_id;
  v_valid := v_mandatory > 0 AND v_mandatory = v_passed AND v_targets > 0
    AND jsonb_array_length(p_observations) = v_targets
    AND NOT EXISTS (
      SELECT 1 FROM public.iac_change_package_targets target WHERE target.package_id = p_package_id
      AND (SELECT count(*) FROM jsonb_array_elements(p_observations) observation
        WHERE lower(observation->>'resourceId') = lower(target.target_resource_id)
        AND (observation->>'observedAt')::timestamptz >= greatest(v_apply.completed_at, v_package.execution_completed_at)
        AND (observation->>'observedAt')::timestamptz BETWEEN v_now - interval '5 minutes' AND v_now + interval '30 seconds') <> 1
    );
  SELECT * INTO v_run FROM public.iac_validation_runs WHERE package_id = p_package_id FOR UPDATE;
  IF FOUND AND v_run.status = 'closed' AND v_run.validation_authority = 'server-v1' THEN RAISE EXCEPTION 'validation_already_closed'; END IF;
  v_payload := jsonb_build_object('authority', 'server-v1', 'packageId', p_package_id, 'actorId', p_actor_id, 'capturedAt', v_now,
    'apply', jsonb_build_object('id', v_apply.id, 'hcpRunId', v_apply.hcp_run_id, 'hcpPlanId', v_apply.hcp_plan_id, 'planSha256', v_apply.plan_sha256, 'sourceRevision', v_apply.source_revision, 'completedAt', v_apply.completed_at),
    'approval', to_jsonb(v_review), 'observations', p_observations, 'checks', p_checks, 'closeRequested', p_close);
  v_hash := 'sha256:' || encode(sha256(convert_to(v_payload::text, 'UTF8')), 'hex');
  INSERT INTO public.iac_validation_runs(package_id, created_by, status, started_at, completed_at, closed_at, validated_by,
    confidence, before_state, after_state, summary, evidence_hash, validation_authority, apply_run_id)
    VALUES (p_package_id, p_actor_id, CASE WHEN v_valid THEN CASE WHEN p_close THEN 'closed' ELSE 'verified' END ELSE 'failed' END,
      v_now, v_now, CASE WHEN p_close AND v_valid THEN v_now ELSE NULL END, p_actor_id,
      CASE WHEN v_mandatory > 0 THEN round(v_passed * 100.0 / v_mandatory)::integer ELSE 0 END,
      v_package.current_state, jsonb_build_object('observations', p_observations),
      CASE WHEN v_valid THEN 'All mandatory server-side checks passed; operational warnings may remain.' ELSE 'Mandatory verification or fresh evidence is missing. Closure is blocked.' END,
      v_hash, 'server-v1', p_apply_run_id)
    ON CONFLICT (package_id) DO UPDATE SET status = EXCLUDED.status, completed_at = EXCLUDED.completed_at,
      closed_at = EXCLUDED.closed_at, validated_by = EXCLUDED.validated_by, confidence = EXCLUDED.confidence,
      after_state = EXCLUDED.after_state, summary = EXCLUDED.summary, evidence_hash = EXCLUDED.evidence_hash,
      validation_authority = EXCLUDED.validation_authority, apply_run_id = EXCLUDED.apply_run_id, updated_at = v_now
    RETURNING * INTO v_run;
  -- Retain previous checks in the append-only evidence history before refreshing
  -- the current result projection (including legacy browser-created records).
  SELECT jsonb_agg(to_jsonb(result)) INTO v_existing_results FROM public.iac_validation_results result WHERE run_id = v_run.id;
  IF v_existing_results IS NOT NULL THEN
    INSERT INTO public.iac_evidence_items(run_id, kind, name, source, content, captured_at, content_hash)
      VALUES(v_run.id, 'validation_output', 'Previous validation result projection', 'iac_validation_results', jsonb_build_object('results', v_existing_results), v_now,
        'sha256:' || encode(sha256(convert_to(v_existing_results::text, 'UTF8')), 'hex'));
  END IF;
  DELETE FROM public.iac_validation_results WHERE run_id = v_run.id;
  INSERT INTO public.iac_validation_results(run_id, check_code, domain, measure, expected, observed, result, source, raw, checked_at)
    SELECT v_run.id, item->>'checkCode', item->>'domain', item->>'measure', item->>'expected', item->>'observed', item->>'result', item->>'source', item->'raw', v_now
    FROM jsonb_array_elements(p_checks) item;
  INSERT INTO public.iac_evidence_items(run_id, kind, name, source, content, captured_at, content_hash)
    VALUES(v_run.id, 'validation_output', CASE WHEN p_close THEN 'Server validation and closure decision' ELSE 'Server validation decision' END, 'vm-change-validation', v_payload, v_now, v_hash);
  RETURN jsonb_build_object('run', to_jsonb(v_run), 'results', (SELECT jsonb_agg(to_jsonb(result)) FROM public.iac_validation_results result WHERE run_id = v_run.id));
END;
$$;
REVOKE ALL ON FUNCTION public.record_iac_vm_validation(uuid, uuid, uuid, jsonb, jsonb, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_iac_vm_validation(uuid, uuid, uuid, jsonb, jsonb, boolean) TO service_role;
COMMENT ON FUNCTION public.record_iac_vm_validation(uuid, uuid, uuid, jsonb, jsonb, boolean)
  IS 'Service-only atomic evidence persistence after authenticated server reads of HCP and Azure. Never callable from the browser.';
