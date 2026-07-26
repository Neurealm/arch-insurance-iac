CREATE OR REPLACE FUNCTION public.commercial_comparison_save(_comparison_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_row public.commercial_scenario_comparisons; v_manifest jsonb; v_stale boolean := false;
        v_hash text; v_manifest_hash text; v_count int := 0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_row FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  IF NOT public.commercial_can_write(v_row.tenant_id, 'commercial.comparison.save') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_row.status <> 'draft' THEN RAISE EXCEPTION 'comparison_not_draft (status=%)', v_row.status; END IF;

  PERFORM set_config('app.commercial_comparison_op','server', true);

  v_manifest := public.commercial_comparison_build_manifest(_comparison_id);
  v_manifest_hash := encode(extensions.digest(convert_to(v_manifest::text, 'UTF8'), 'sha256'::text), 'hex');

  SELECT bool_or(is_stale) INTO v_stale
    FROM public.commercial_comparison_readiness(_comparison_id);
  v_stale := COALESCE(v_stale, false);

  DELETE FROM public.commercial_scenario_comparison_results WHERE comparison_id = _comparison_id;
  INSERT INTO public.commercial_scenario_comparison_results (
    tenant_id, comparison_id, metric_code, metric_group, fiscal_period, period_sequence, unit,
    baseline_scenario_id, compared_scenario_id, baseline_run_id, compared_run_id,
    baseline_value, compared_value, absolute_variance, percentage_variance,
    variance_direction, comparison_rule, direction_reason
  )
  SELECT v_row.tenant_id, _comparison_id, c.metric_code, c.metric_group, c.fiscal_period, c.period_sequence, c.unit,
         v_row.baseline_scenario_id, c.compared_scenario_id, c.baseline_run_id, c.compared_run_id,
         c.baseline_value, c.compared_value, c.absolute_variance, c.percentage_variance,
         c.variance_direction, 'compared_minus_baseline', c.direction_reason
    FROM public.commercial_comparison_calculate(_comparison_id) c;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE public.commercial_scenario_comparisons
     SET source_run_manifest = v_manifest,
         source_run_manifest_hash = v_manifest_hash,
         stale_at_creation = v_stale,
         updated_at = now(),
         updated_by = auth.uid()
   WHERE id = _comparison_id;

  v_hash := public.commercial_comparison_compute_hash(_comparison_id);

  UPDATE public.commercial_scenario_comparisons
     SET status = 'saved',
         content_hash = v_hash,
         saved_by = auth.uid(),
         saved_at = now()
   WHERE id = _comparison_id;

  PERFORM public.emit_audit_event(
    v_row.tenant_id,
    'commercial.comparison.saved'::text,
    'commercial_scenario_comparison'::text,
    _comparison_id::text,
    NULL::jsonb,
    NULL::jsonb,
    NULL::text,
    jsonb_build_object(
      'baseline_scenario_id', v_row.baseline_scenario_id,
      'compared_scenario_ids', v_row.compared_scenario_ids,
      'included_scopes', v_row.included_scopes,
      'metric_count', v_count,
      'stale_at_creation', v_stale,
      'source_run_manifest_hash', v_manifest_hash,
      'content_hash', v_hash
    )
  );

  PERFORM set_config('app.commercial_comparison_op','', true);

  RETURN jsonb_build_object(
    'comparison_id', _comparison_id,
    'status','saved',
    'content_hash', v_hash,
    'source_run_manifest_hash', v_manifest_hash,
    'metric_count', v_count,
    'stale_at_creation', v_stale
  );
END $function$;

REVOKE EXECUTE ON FUNCTION public.commercial_comparison_save(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_comparison_save(uuid) TO authenticated;