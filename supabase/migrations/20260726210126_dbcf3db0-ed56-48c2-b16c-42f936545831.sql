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
  -- Explode apply-log impacted scopes AND the scenarios actually included in
  -- the apply event. Scope propagation is unchanged:
  -- revenue -> {revenue,pnl,cash}, pnl -> {pnl,cash}, cash -> {cash}.
  applies AS (
    SELECT al.applied_at,
           sid.scenario_id,
           prop.scope
    FROM public.commercial_assumption_apply_log al
    CROSS JOIN LATERAL unnest(al.impacted_scopes) AS direct_scope
    CROSS JOIN LATERAL unnest(al.scenario_ids) AS sid(scenario_id)
    CROSS JOIN LATERAL unnest(
      CASE direct_scope
        WHEN 'revenue' THEN ARRAY['revenue','pnl','cash']
        WHEN 'pnl'     THEN ARRAY['pnl','cash']
        WHEN 'cash'    THEN ARRAY['cash']
        ELSE ARRAY[]::TEXT[]
      END
    ) AS prop(scope)
    WHERE al.program_id = _program_id
  ),
  per_scope_scenario AS (
    SELECT a.scope, a.scenario_id, max(a.applied_at) AS last_apply_at
    FROM applies a
    GROUP BY a.scope, a.scenario_id
  )
  SELECT l.run_scope, l.scenario_id, l.latest_run_id, l.completed_at,
         ps.last_apply_at,
         COALESCE(ps.last_apply_at > l.completed_at, false) AS is_stale
  FROM latest l
  LEFT JOIN per_scope_scenario ps
    ON ps.scope = l.run_scope
   AND ps.scenario_id = l.scenario_id
  WHERE (
    public.is_platform_admin(auth.uid())
    OR public.has_permission(auth.uid(),
      (SELECT tenant_id FROM public.commercial_programs WHERE id = _program_id),
      'commercial.view'
    )
  );
$function$;

REVOKE ALL ON FUNCTION public.commercial_program_run_staleness(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_program_run_staleness(uuid) TO authenticated, service_role;