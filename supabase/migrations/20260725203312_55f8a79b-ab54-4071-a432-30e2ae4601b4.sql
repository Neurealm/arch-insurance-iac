CREATE OR REPLACE FUNCTION public.commercial_program_run_staleness(_program_id uuid)
 RETURNS TABLE(run_scope text, scenario_id uuid, latest_run_id uuid, latest_completed_at timestamp with time zone, last_apply_at timestamp with time zone, is_stale boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH latest AS (
    SELECT DISTINCT ON (r.run_scope, r.scenario_id)
      r.run_scope, r.scenario_id, r.id AS latest_run_id, r.completed_at
    FROM public.commercial_model_runs r
    WHERE r.program_id = _program_id AND r.status = 'completed'
    ORDER BY r.run_scope, r.scenario_id, r.completed_at DESC NULLS LAST
  ),
  -- Explode apply-log impacted scopes into effective staled scopes using the
  -- documented propagation rules: revenue -> {revenue,pnl,cash}, pnl -> {pnl,cash}, cash -> {cash}.
  applies AS (
    SELECT applied_at, direct_scope,
      CASE direct_scope
        WHEN 'revenue' THEN ARRAY['revenue','pnl','cash']
        WHEN 'pnl'     THEN ARRAY['pnl','cash']
        WHEN 'cash'    THEN ARRAY['cash']
        ELSE ARRAY[]::TEXT[]
      END AS staled_scopes
    FROM public.commercial_assumption_apply_log,
         LATERAL unnest(impacted_scopes) AS direct_scope
    WHERE program_id = _program_id
  ),
  per_scope AS (
    SELECT s.scope, max(a.applied_at) AS last_apply_at
    FROM (VALUES ('revenue'),('pnl'),('cash')) AS s(scope)
    LEFT JOIN applies a ON s.scope = ANY(a.staled_scopes)
    GROUP BY s.scope
  )
  SELECT l.run_scope, l.scenario_id, l.latest_run_id, l.completed_at,
         ps.last_apply_at,
         COALESCE(ps.last_apply_at > l.completed_at, false) AS is_stale
  FROM latest l
  LEFT JOIN per_scope ps ON ps.scope = l.run_scope
  WHERE (
    public.is_platform_admin(auth.uid())
    OR public.has_permission(auth.uid(),
      (SELECT tenant_id FROM public.commercial_programs WHERE id = _program_id),
      'commercial.view'
    )
  );
$function$;