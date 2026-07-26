CREATE OR REPLACE FUNCTION public.commercial_comparison_compute_hash(_comparison_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_header record; v_manifest jsonb; v_rows jsonb; v_payload text;
BEGIN
  SELECT * INTO v_header FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_header.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  v_manifest := COALESCE(v_header.source_run_manifest, '{}'::jsonb);
  SELECT COALESCE(jsonb_agg(to_jsonb(o) ORDER BY o.metric_code, o.fiscal_period, o.compared_scenario_id), '[]'::jsonb)
    INTO v_rows
    FROM (
      SELECT metric_code, metric_group, fiscal_period, period_sequence, unit,
             baseline_scenario_id, compared_scenario_id, baseline_run_id, compared_run_id,
             baseline_value, compared_value, absolute_variance, percentage_variance,
             variance_direction, comparison_rule
        FROM public.commercial_scenario_comparison_results
       WHERE comparison_id = _comparison_id
       ORDER BY metric_code, fiscal_period, compared_scenario_id
    ) o;
  v_payload := 'v1|' || v_header.tenant_id::text || '|' || v_header.program_id::text || '|'
    || v_header.model_version_id::text || '|' || v_header.mode || '|' || v_header.baseline_scenario_id::text
    || '|' || array_to_string(v_header.compared_scenario_ids, ',')
    || '|' || array_to_string(v_header.included_scopes, ',')
    || '|' || v_manifest::text || '|' || v_rows::text;
  RETURN encode(extensions.digest(convert_to(v_payload, 'UTF8'), 'sha256'::text), 'hex');
END $function$;

REVOKE EXECUTE ON FUNCTION public.commercial_comparison_compute_hash(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_comparison_compute_hash(uuid) TO authenticated;