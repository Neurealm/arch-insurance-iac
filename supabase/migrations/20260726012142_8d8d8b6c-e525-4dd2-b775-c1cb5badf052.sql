CREATE OR REPLACE FUNCTION public.commercial_sensitivity_readiness(_experiment_id uuid)
RETURNS TABLE(scope text, is_stale boolean, latest_run_id uuid, latest_completed_at timestamptz, is_missing boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_sensitivity_experiments;
BEGIN
  SELECT * INTO v_row FROM public.commercial_sensitivity_experiments WHERE id = _experiment_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'experiment_not_found'; END IF;
  RETURN QUERY
    SELECT s.scope,
           COALESCE(st.is_stale, true) AS is_stale,
           st.latest_run_id,
           st.latest_completed_at,
           (st.latest_run_id IS NULL) AS is_missing
      FROM unnest(v_row.included_scopes) AS s(scope)
      LEFT JOIN public.commercial_program_run_staleness(v_row.program_id) st
             ON st.scenario_id = v_row.baseline_scenario_id
            AND st.run_scope = s.scope;
END $$;

REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_readiness(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_readiness(uuid) TO authenticated;