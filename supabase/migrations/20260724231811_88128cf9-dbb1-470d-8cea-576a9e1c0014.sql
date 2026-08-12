
CREATE OR REPLACE FUNCTION public.seed_project_momentous_scenarios()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_uid uuid := auth.uid();
  v_tenant uuid;
  v_program uuid;
  v_src_pl uuid;
  v_scenarios jsonb := '[]'::jsonb;
  v_scenarios_created int := 0;
  v_assumptions_upserted int := 0;
  v_scen record;
  v_scen_id uuid;
  r record;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;

  SELECT id INTO v_tenant FROM public.tenants WHERE slug='neugain-commercial';
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'neugain_commercial_workspace_missing'; END IF;

  IF NOT public.has_permission(v_uid, v_tenant, 'commercial.scenario.manage') THEN
    RAISE EXCEPTION 'permission_denied: commercial.scenario.manage';
  END IF;

  SELECT id INTO v_program FROM public.commercial_programs
   WHERE tenant_id=v_tenant AND code='PROJECT_MOMENTOUS';
  IF v_program IS NULL THEN RAISE EXCEPTION 'program_not_seeded: run seed_project_momentous_foundation first'; END IF;

  SELECT id INTO v_src_pl FROM public.commercial_source_references
   WHERE program_id=v_program AND source_code='SRC-002';

  -- 1) Scenarios (idempotent by program_id, code)
  FOR v_scen IN
    SELECT * FROM (VALUES
      ('CONSERVATIVE','Conservative','Underwriting-grade downside case. Neurealm is underwritten to this ramp and these rates.', false),
      ('BASE','Base','Operating target case. Baseline for portfolio economics and gate progression.', true),
      ('UPSIDE','Upside','Value-creation case. Not a guaranteed outcome — used for upside sizing only.', false)
    ) AS s(code, name, description, is_baseline)
  LOOP
    INSERT INTO public.commercial_scenarios(
      tenant_id, program_id, code, name, description,
      status, is_baseline, source_status, created_by, updated_by
    ) VALUES (
      v_tenant, v_program, v_scen.code, v_scen.name, v_scen.description,
      'active', v_scen.is_baseline, 'directional', v_uid, v_uid
    )
    ON CONFLICT (program_id, code) DO NOTHING;
    IF FOUND THEN v_scenarios_created := v_scenarios_created + 1; END IF;
  END LOOP;

  -- 2) Assumptions: iterate scenario × prompt matrix.
  FOR v_scen IN
    SELECT id, code FROM public.commercial_scenarios
     WHERE program_id = v_program AND code IN ('CONSERVATIVE','BASE','UPSIDE')
  LOOP
    v_scen_id := v_scen.id;

    FOR r IN
      SELECT * FROM (VALUES
        -- code, label, numeric_value_cons, numeric_value_base, numeric_value_upside, unit, text_cons, text_base, text_upside, notes
        -- Activation ramp (accounts, cumulative)
        ('ACT_RAMP_FY2027','Cumulative activated accounts — FY2027', 20::numeric, 30::numeric, 40::numeric,'accounts',NULL,NULL,NULL,'Source: Activation Ramp!C6/C7/C8'),
        ('ACT_RAMP_FY2028','Cumulative activated accounts — FY2028', 35::numeric, 55::numeric, 75::numeric,'accounts',NULL,NULL,NULL,'Source: Activation Ramp!D6/D7/D8'),
        ('ACT_RAMP_FY2029','Cumulative activated accounts — FY2029', 50::numeric, 75::numeric, 95::numeric,'accounts',NULL,NULL,NULL,'Source: Activation Ramp!E6/E7/E8'),
        ('ACT_RAMP_FY2030','Cumulative activated accounts — FY2030', 65::numeric, 90::numeric,104::numeric,'accounts',NULL,NULL,NULL,'Source: Activation Ramp!F6/F7/F8'),
        ('ACT_RAMP_FY2031','Cumulative activated accounts — FY2031', 75::numeric,100::numeric,104::numeric,'accounts',NULL,NULL,NULL,'Source: Activation Ramp!G6/G7/G8'),
        -- Renewal & growth (decimals)
        ('RENEWAL_INFLUENCED_PCT','Renewal (EAR) pool influenced', 0.25::numeric, 0.40::numeric, 0.55::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C6/D6/E6'),
        ('INCR_ARR_GROWTH_PCT','Incremental ARR growth (in-year expansion)', 0.02::numeric, 0.06::numeric, 0.11::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C7/D7/E7'),
        ('NON_FLEX_MIX_PCT','Non-Flex mix of incremental growth', 0.70::numeric, 0.60::numeric, 0.50::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C8/D8/E8'),
        ('MARKETPLACE_MIX_PCT','Marketplace mix of new-account ARR', 0.20::numeric, 0.30::numeric, 0.40::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C9/D9/E9'),
        -- Rebate & growth share (decimals)
        ('BASE_RENEWAL_REBATE_PCT','Enhanced base / influenced renewal rebate', 0.04::numeric, 0.05::numeric, 0.06::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C11/D11/E11'),
        ('MARKETPLACE_REBATE_PCT','Marketplace / transacted rebate', 0.04::numeric, 0.05::numeric, 0.06::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C12/D12/E12'),
        ('NON_FLEX_EXPANSION_REBATE_PCT','Non-Flex expansion rebate', 0.12::numeric, 0.135::numeric, 0.15::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C13/D13/E13'),
        ('FLEX_MIGRATION_REBATE_PCT','Flex expansion / migration uplift rebate', 0.22::numeric, 0.235::numeric, 0.25::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C14/D14/E14'),
        ('STRATEGIC_GROWTH_ACCEL_PCT','Strategic growth accelerator', 0.00::numeric, 0.03::numeric, 0.05::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C15/D15/E15'),
        ('ARR_PROXY_GROWTH_SHARE_PCT','ARR proxy growth-share rate (Model 2)', 0.045::numeric, 0.07::numeric, 0.09::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C16/D16/E16'),
        -- Services (USD & decimal)
        ('MS_ANNUAL_REV_PER_ACCT_USD','Annual managed-services revenue per attached account', 125000::numeric, 200000::numeric, 300000::numeric,'USD',NULL,NULL,NULL,'Source: Scenario Drivers!C19/D19/E19'),
        ('PS_ONETIME_REV_PER_ACCT_USD','One-time professional-services revenue per new account', 25000::numeric, 45000::numeric, 70000::numeric,'USD',NULL,NULL,NULL,'Source: Scenario Drivers!C20/D20/E20'),
        ('MS_GROSS_MARGIN_PCT','Managed-services gross margin', 0.55::numeric, 0.62::numeric, 0.68::numeric,'ratio',NULL,NULL,NULL,'Source: Scenario Drivers!C21/D21/E21'),
        -- Funding (USD)
        ('ACTIVATION_FUND_PER_ACCT_USD','Activation funding per new account', 8000::numeric, 10000::numeric, 12000::numeric,'USD',NULL,NULL,NULL,'Source: Scenario Drivers!C23/D23/E23'),
        ('MDF_COSELL_ANNUAL_USD','Annual MDF / co-sell funding', 50000::numeric, 100000::numeric, 175000::numeric,'USD',NULL,NULL,NULL,'Source: Scenario Drivers!C24/D24/E24'),
        ('SUPPORT_READINESS_FUND_USD','Annual Support Readiness Fund', 0::numeric, 75000::numeric, 150000::numeric,'USD',NULL,NULL,NULL,'Source: Scenario Drivers!C25/D25/E25'),
        -- Operating scope
        ('L1_L2_SUPPORT_IN_SCOPE','L1/L2 support in scope', 0::numeric, 1::numeric, 1::numeric,'boolean','No','Yes','Yes','1=in scope, 0=out. Source: Scenario Drivers!C27/D27/E27'),
        ('PAYMENT_LAG_DAYS','Payment lag (rebate/growth-share collections)', 90::numeric, 60::numeric, 45::numeric,'days',NULL,NULL,NULL,'Source: Scenario Drivers!C29/D29/E29')
      ) AS a(code,label,nv_cons,nv_base,nv_up,unit,tv_cons,tv_base,tv_up,notes)
    LOOP
      INSERT INTO public.commercial_scenario_assumptions(
        tenant_id, scenario_id, assumption_code, label,
        numeric_value, text_value, unit, confidence, source_reference_id, notes,
        created_by, updated_by
      ) VALUES (
        v_tenant, v_scen_id, r.code, r.label,
        CASE v_scen.code WHEN 'CONSERVATIVE' THEN r.nv_cons WHEN 'BASE' THEN r.nv_base WHEN 'UPSIDE' THEN r.nv_up END,
        CASE v_scen.code WHEN 'CONSERVATIVE' THEN r.tv_cons WHEN 'BASE' THEN r.tv_base WHEN 'UPSIDE' THEN r.tv_up END,
        r.unit, 'directional', v_src_pl, r.notes,
        v_uid, v_uid
      )
      ON CONFLICT (scenario_id, assumption_code) DO NOTHING;
      IF FOUND THEN v_assumptions_upserted := v_assumptions_upserted + 1; END IF;
    END LOOP;
  END LOOP;

  PERFORM public.emit_audit_event(
    v_tenant, 'commercial.scenarios.seeded', 'commercial_program', v_program::text,
    NULL, jsonb_build_object(
      'scenarios_created', v_scenarios_created,
      'assumptions_inserted', v_assumptions_upserted
    )
  );

  RETURN jsonb_build_object(
    'tenant_id', v_tenant,
    'program_id', v_program,
    'scenarios_created', v_scenarios_created,
    'assumptions_inserted', v_assumptions_upserted
  );
END
$fn$;

REVOKE ALL ON FUNCTION public.seed_project_momentous_scenarios() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_project_momentous_scenarios() TO authenticated;
