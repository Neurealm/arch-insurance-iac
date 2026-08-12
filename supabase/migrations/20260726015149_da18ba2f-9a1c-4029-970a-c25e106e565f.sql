CREATE OR REPLACE FUNCTION public.commercial_sensitivity_reset_to_draft(_experiment_id uuid, _reason text DEFAULT NULL::text)
 RETURNS TABLE(experiment_id uuid, status text, reset_at timestamp with time zone, perturbations_removed integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_row              public.commercial_sensitivity_experiments;
  v_runs_count       integer := 0;
  v_results_count    integer := 0;
  v_perts_removed    integer := 0;
  v_now              timestamptz := now();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth_required' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO v_row
    FROM public.commercial_sensitivity_experiments AS e
   WHERE e.id = _experiment_id
   FOR UPDATE;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'experiment_not_found';
  END IF;

  IF NOT public.commercial_can_write(v_row.tenant_id, 'commercial.sensitivity.execute') THEN
    RAISE EXCEPTION 'sensitivity_reset_not_authorized' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF v_row.status = 'completed' THEN
    RAISE EXCEPTION 'sensitivity_reset_completed';
  ELSIF v_row.status = 'archived' THEN
    RAISE EXCEPTION 'sensitivity_reset_archived';
  ELSIF v_row.status <> 'failed' THEN
    RAISE EXCEPTION 'sensitivity_reset_invalid_status (status=%)', v_row.status;
  END IF;

  IF v_row.completed_at IS NOT NULL OR v_row.archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'sensitivity_reset_unsafe';
  END IF;

  SELECT count(*) INTO v_runs_count
    FROM public.commercial_sensitivity_runs AS r
   WHERE r.experiment_id = _experiment_id;
  IF v_runs_count > 0 THEN
    RAISE EXCEPTION 'sensitivity_reset_has_runs';
  END IF;

  SELECT count(*) INTO v_results_count
    FROM public.commercial_sensitivity_results AS s
   WHERE s.experiment_id = _experiment_id;
  IF v_results_count > 0 THEN
    RAISE EXCEPTION 'sensitivity_reset_has_results';
  END IF;

  PERFORM set_config('app.commercial_sensitivity_op', 'server', true);

  DELETE FROM public.commercial_sensitivity_perturbations AS p
   WHERE p.experiment_id = _experiment_id;
  GET DIAGNOSTICS v_perts_removed = ROW_COUNT;

  UPDATE public.commercial_sensitivity_experiments AS e
     SET status                     = 'draft',
         error_code                 = NULL,
         error_message              = NULL,
         completed_at               = NULL,
         completed_by               = NULL,
         archived_at                = NULL,
         archived_by                = NULL,
         baseline_run_manifest      = '{}'::jsonb,
         baseline_run_manifest_hash = NULL,
         stale_at_creation          = false,
         warning_summary            = '{}'::jsonb,
         updated_by                 = auth.uid(),
         updated_at                 = v_now
   WHERE e.id = _experiment_id;

  PERFORM set_config('app.commercial_sensitivity_op', '', true);

  PERFORM public.emit_audit_event(
    v_row.tenant_id,
    'commercial.sensitivity.reset'::text,
    'commercial_sensitivity_experiment'::text,
    _experiment_id::text,
    NULL::jsonb,
    jsonb_build_object(
      'prior_status',              v_row.status,
      'new_status',                'draft',
      'prior_error_code',          v_row.error_code,
      'perturbations_removed',     v_perts_removed,
      'sensitivity_runs_found',    v_runs_count,
      'sensitivity_results_found', v_results_count,
      'retry_allowed',             true,
      'reason',                    COALESCE(_reason, 'failed_attempt_recovery')
    ),
    NULL::text,
    '{}'::jsonb
  );

  RETURN QUERY SELECT _experiment_id, 'draft'::text, v_now, v_perts_removed;
END
$function$;