
CREATE OR REPLACE FUNCTION public.commercial_comparison_readiness(_comparison_id uuid)
RETURNS TABLE (scenario_id uuid, scope text, is_stale boolean, latest_run_id uuid, latest_completed_at timestamptz, latest_apply_at timestamptz, is_missing boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_scenario_comparisons; v_scenarios uuid[];
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_row FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  IF NOT public.commercial_is_member_with_view(v_row.tenant_id) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  v_scenarios := array_prepend(v_row.baseline_scenario_id, v_row.compared_scenario_ids);
  RETURN QUERY
    SELECT s.scenario_id, s.run_scope AS scope,
           COALESCE(s.is_stale, false) AS is_stale,
           s.latest_run_id,
           s.latest_completed_at,
           s.last_apply_at AS latest_apply_at,
           (s.latest_run_id IS NULL) AS is_missing
      FROM public.commercial_program_run_staleness(v_row.program_id) s
     WHERE s.scenario_id = ANY(v_scenarios)
       AND s.run_scope = ANY(v_row.included_scopes);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_readiness(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_readiness(uuid) TO authenticated, service_role;
