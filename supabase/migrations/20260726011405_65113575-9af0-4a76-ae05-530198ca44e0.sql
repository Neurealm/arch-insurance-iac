CREATE OR REPLACE FUNCTION public.commercial_sensitivity_list_baseline_runs(
  _program_id uuid, _model_version_id uuid, _scenario_id uuid, _scopes text[]
) RETURNS TABLE(scope text, run_id uuid, input_hash text, completed_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT ON (r.run_scope) r.run_scope, r.id, r.input_hash, r.completed_at
    FROM public.commercial_model_runs r
   WHERE r.program_id = _program_id AND r.model_version_id = _model_version_id
     AND r.scenario_id = _scenario_id AND r.status = 'completed'
     AND r.run_scope = ANY(_scopes)
     AND NOT EXISTS (
       SELECT 1 FROM public.commercial_model_runs r2
        WHERE r2.supersedes_run_id = r.id
     )
   ORDER BY r.run_scope, r.completed_at DESC;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_list_baseline_runs(uuid,uuid,uuid,text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_list_baseline_runs(uuid,uuid,uuid,text[]) TO authenticated;