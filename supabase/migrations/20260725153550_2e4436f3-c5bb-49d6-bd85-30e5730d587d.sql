
-- =====================================================================
-- BP3.2 — Seed workbook Assumptions-sheet constants + batch persist RPC
-- =====================================================================

-- 1. Batch persist function (SECURITY DEFINER, authenticated-only)
CREATE OR REPLACE FUNCTION public.commercial_model_run_persist_results_batch(
  _run_id uuid,
  _results jsonb
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_tenant uuid; v_status text; v_scope text;
  v_count int := 0;
  r jsonb;
BEGIN
  SELECT tenant_id, status, run_scope INTO v_tenant, v_status, v_scope
    FROM public.commercial_model_runs WHERE id = _run_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'run_not_found'; END IF;
  IF NOT public.commercial_can_write(
       v_tenant,
       CASE WHEN v_scope='sensitivity' THEN 'commercial.sensitivity.run'
            ELSE 'commercial.model.run' END) THEN
    RAISE EXCEPTION 'permission_denied';
  END IF;
  IF v_status <> 'running' THEN
    RAISE EXCEPTION 'results_only_while_running (status=%)', v_status;
  END IF;
  IF jsonb_typeof(_results) <> 'array' THEN
    RAISE EXCEPTION 'results_must_be_array';
  END IF;

  FOR r IN SELECT jsonb_array_elements(_results) LOOP
    INSERT INTO public.commercial_model_results(
      tenant_id, run_id, metric_code, metric_group, formula_code,
      fiscal_period, period_sequence, value_numeric, value_text,
      unit, lineage_json, is_approximation
    ) VALUES (
      v_tenant, _run_id,
      r->>'metric_code',
      r->>'metric_group',
      r->>'formula_code',
      r->>'fiscal_period',
      (r->>'period_sequence')::int,
      NULLIF(r->>'value_numeric','')::numeric,
      r->>'value_text',
      r->>'unit',
      COALESCE(r->'lineage_json','{}'::jsonb),
      COALESCE((r->>'is_approximation')::boolean, false)
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END $function$;

REVOKE ALL ON FUNCTION public.commercial_model_run_persist_results_batch(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_model_run_persist_results_batch(uuid, jsonb) TO authenticated;

-- 2. Seed workbook Assumptions-sheet constants as scenario assumptions
DO $seed$
DECLARE
  v_tenant uuid;
  v_program uuid;
  v_scen record;
  v_src uuid;
  v_conv_rebate numeric;
  v_conv_expand numeric;
  v_conv_ms numeric;
BEGIN
  SELECT id INTO v_tenant FROM public.tenants WHERE slug = 'neugain-commercial';
  IF v_tenant IS NULL THEN RETURN; END IF;

  SELECT id INTO v_program
    FROM public.commercial_programs
    WHERE tenant_id = v_tenant AND code = 'PROJECT_MOMENTOUS';
  IF v_program IS NULL THEN RETURN; END IF;

  -- Pick any existing source_reference for lineage (already seeded in BP2.4)
  SELECT id INTO v_src FROM public.commercial_source_references
    WHERE tenant_id = v_tenant LIMIT 1;

  FOR v_scen IN
    SELECT id, code FROM public.commercial_scenarios WHERE program_id = v_program
  LOOP
    -- Per-scenario conversion percentages (Assumptions!C23/D23/E23 etc.)
    v_conv_rebate := CASE v_scen.code
      WHEN 'CONSERVATIVE' THEN 0.45
      WHEN 'BASE'         THEN 0.55
      WHEN 'UPSIDE'       THEN 0.65 END;
    v_conv_expand := CASE v_scen.code
      WHEN 'CONSERVATIVE' THEN 0.175
      WHEN 'BASE'         THEN 0.30
      WHEN 'UPSIDE'       THEN 0.40 END;
    v_conv_ms := CASE v_scen.code
      WHEN 'CONSERVATIVE' THEN 0.125
      WHEN 'BASE'         THEN 0.225
      WHEN 'UPSIDE'       THEN 0.325 END;

    INSERT INTO public.commercial_scenario_assumptions(
      tenant_id, scenario_id, assumption_code, label, numeric_value, unit,
      confidence, source_reference_id, notes, created_by, updated_by)
    VALUES
      (v_tenant, v_scen.id, 'CONV_REBATE_PCT',
       'Accounts converting to license rebate (share of cum accts)',
       v_conv_rebate, 'ratio', 'directional', v_src,
       'Source: Assumptions!C23/D23/E23', auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'CONV_EXPAND_PCT',
       'Accounts generating expansion or growth (share of cum accts)',
       v_conv_expand, 'ratio', 'directional', v_src,
       'Source: Assumptions!C24/D24/E24', auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'CONV_MS_PCT',
       'Accounts buying managed services (share of cum accts)',
       v_conv_ms, 'ratio', 'directional', v_src,
       'Source: Assumptions!C25/D25/E25', auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'AVG_ARR_PER_CUSTOMER_MUSD',
       'Average NP ARR per activated customer',
       1.24, 'USD_M', 'directional', v_src,
       'Source: Assumptions!C15 (constant across scenarios)',
       auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'GROWTH_ACCEL_THRESHOLD_PCT',
       'Strategic growth-accelerator trigger threshold',
       0.05, 'ratio', 'directional', v_src,
       'Source: Assumptions!C33 (constant across scenarios)',
       auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'COST_ESCALATOR_PCT',
       'Annual cost / rate escalator applied year-over-year',
       0.03, 'ratio', 'directional', v_src,
       'Source: Assumptions!C92 (constant across scenarios)',
       auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'EAR_POOL_FY2027_MUSD',
       'EAR renewal pool — FY2027', 40.7, 'USD_M', 'directional', v_src,
       'Source: Assumptions!D10 (constant across scenarios)',
       auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'EAR_POOL_FY2028_MUSD',
       'EAR renewal pool — FY2028', 36.5, 'USD_M', 'directional', v_src,
       'Source: Assumptions!E10 (constant across scenarios)',
       auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'EAR_POOL_FY2029_MUSD',
       'EAR renewal pool — FY2029', 31.9, 'USD_M', 'directional', v_src,
       'Source: Assumptions!F10 (constant across scenarios)',
       auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'EAR_POOL_FY2030_MUSD',
       'EAR renewal pool — FY2030', 5.5, 'USD_M', 'directional', v_src,
       'Source: Assumptions!G10 (constant across scenarios)',
       auth.uid(), auth.uid()),
      (v_tenant, v_scen.id, 'EAR_POOL_FY2031_MUSD',
       'EAR renewal pool — FY2031', 3.2, 'USD_M', 'directional', v_src,
       'Source: Assumptions!H10 (constant across scenarios)',
       auth.uid(), auth.uid())
    ON CONFLICT DO NOTHING;
  END LOOP;
END $seed$;

-- 3. Ensure uniqueness so re-runs don't duplicate constants
CREATE UNIQUE INDEX IF NOT EXISTS commercial_scenario_assumptions_unique_code
  ON public.commercial_scenario_assumptions(scenario_id, assumption_code);
