-- BP2.5 regression: Project Momentous scenarios and directional assumptions.
-- Run against the seeded NeuGAIN Commercial workspace. Read-only assertions.

DO $$
DECLARE
  v_tenant uuid;
  v_program uuid;
  v_cons uuid; v_base uuid; v_up uuid;
  v_n int;
BEGIN
  SELECT id INTO v_tenant FROM public.tenants WHERE slug='neugain-commercial';
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'test setup failed: neugain-commercial tenant missing'; END IF;

  SELECT id INTO v_program FROM public.commercial_programs
    WHERE tenant_id=v_tenant AND code='PROJECT_MOMENTOUS';
  IF v_program IS NULL THEN RAISE EXCEPTION 'test setup failed: PROJECT_MOMENTOUS program missing'; END IF;

  -- 1. Exactly three scenarios exist for the program.
  SELECT count(*) INTO v_n FROM public.commercial_scenarios WHERE program_id=v_program;
  IF v_n <> 3 THEN RAISE EXCEPTION 'expected 3 scenarios, found %', v_n; END IF;

  -- 2. Exactly one baseline scenario, and it is BASE.
  SELECT count(*) INTO v_n FROM public.commercial_scenarios
    WHERE program_id=v_program AND is_baseline=true;
  IF v_n <> 1 THEN RAISE EXCEPTION 'expected exactly one baseline scenario, found %', v_n; END IF;
  PERFORM 1 FROM public.commercial_scenarios
    WHERE program_id=v_program AND code='BASE' AND is_baseline=true;
  IF NOT FOUND THEN RAISE EXCEPTION 'BASE must be the baseline scenario'; END IF;

  -- 3. All scenarios active + directional.
  SELECT count(*) INTO v_n FROM public.commercial_scenarios
    WHERE program_id=v_program AND status='active' AND source_status='directional';
  IF v_n <> 3 THEN RAISE EXCEPTION 'all 3 scenarios must be active + directional, found %', v_n; END IF;

  SELECT id INTO v_cons FROM public.commercial_scenarios WHERE program_id=v_program AND code='CONSERVATIVE';
  SELECT id INTO v_base FROM public.commercial_scenarios WHERE program_id=v_program AND code='BASE';
  SELECT id INTO v_up   FROM public.commercial_scenarios WHERE program_id=v_program AND code='UPSIDE';

  -- 4. Expected assumption count per scenario = 22 (5 ramp + 4 growth + 6 rebate + 3 services + 3 funding + 2 operating).
  FOR v_n IN
    SELECT count(*) FROM public.commercial_scenario_assumptions
      WHERE scenario_id IN (v_cons, v_base, v_up) GROUP BY scenario_id
  LOOP
    IF v_n <> 22 THEN RAISE EXCEPTION 'expected 22 assumptions per scenario, found %', v_n; END IF;
  END LOOP;

  -- 5. Expected values (spot-check every group).
  PERFORM 1 FROM public.commercial_scenario_assumptions
    WHERE scenario_id=v_cons AND assumption_code='ACT_RAMP_FY2027' AND numeric_value=20 AND unit='accounts';
  IF NOT FOUND THEN RAISE EXCEPTION 'CONS ACT_RAMP_FY2027 must be 20 accounts'; END IF;
  PERFORM 1 FROM public.commercial_scenario_assumptions
    WHERE scenario_id=v_base AND assumption_code='ACT_RAMP_FY2031' AND numeric_value=100;
  IF NOT FOUND THEN RAISE EXCEPTION 'BASE ACT_RAMP_FY2031 must be 100'; END IF;
  PERFORM 1 FROM public.commercial_scenario_assumptions
    WHERE scenario_id=v_up AND assumption_code='ACT_RAMP_FY2030' AND numeric_value=104;
  IF NOT FOUND THEN RAISE EXCEPTION 'UPSIDE ACT_RAMP_FY2030 must be 104'; END IF;
  PERFORM 1 FROM public.commercial_scenario_assumptions
    WHERE scenario_id=v_base AND assumption_code='INCR_ARR_GROWTH_PCT' AND numeric_value=0.06 AND unit='ratio';
  IF NOT FOUND THEN RAISE EXCEPTION 'BASE INCR_ARR_GROWTH_PCT must be 0.06 ratio'; END IF;
  PERFORM 1 FROM public.commercial_scenario_assumptions
    WHERE scenario_id=v_up AND assumption_code='FLEX_MIGRATION_REBATE_PCT' AND numeric_value=0.25;
  IF NOT FOUND THEN RAISE EXCEPTION 'UPSIDE FLEX_MIGRATION_REBATE_PCT must be 0.25'; END IF;
  PERFORM 1 FROM public.commercial_scenario_assumptions
    WHERE scenario_id=v_base AND assumption_code='MS_ANNUAL_REV_PER_ACCT_USD' AND numeric_value=200000 AND unit='USD';
  IF NOT FOUND THEN RAISE EXCEPTION 'BASE MS_ANNUAL_REV_PER_ACCT_USD must be $200,000'; END IF;
  PERFORM 1 FROM public.commercial_scenario_assumptions
    WHERE scenario_id=v_cons AND assumption_code='SUPPORT_READINESS_FUND_USD' AND numeric_value=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'CONS SUPPORT_READINESS_FUND_USD must be 0'; END IF;
  PERFORM 1 FROM public.commercial_scenario_assumptions
    WHERE scenario_id=v_cons AND assumption_code='L1_L2_SUPPORT_IN_SCOPE' AND text_value='No';
  IF NOT FOUND THEN RAISE EXCEPTION 'CONS L1_L2_SUPPORT_IN_SCOPE must be No'; END IF;
  PERFORM 1 FROM public.commercial_scenario_assumptions
    WHERE scenario_id=v_up AND assumption_code='PAYMENT_LAG_DAYS' AND numeric_value=45 AND unit='days';
  IF NOT FOUND THEN RAISE EXCEPTION 'UPSIDE PAYMENT_LAG_DAYS must be 45 days'; END IF;

  -- 6. All assumptions carry directional confidence, unit, and SRC-002 pointer.
  SELECT count(*) INTO v_n FROM public.commercial_scenario_assumptions
    WHERE scenario_id IN (v_cons, v_base, v_up)
      AND (confidence <> 'directional' OR unit IS NULL OR source_reference_id IS NULL);
  IF v_n <> 0 THEN RAISE EXCEPTION '% assumption rows are missing confidence/unit/source', v_n; END IF;

  -- 7. Tenant isolation on all rows.
  SELECT count(*) INTO v_n FROM public.commercial_scenario_assumptions
    WHERE scenario_id IN (v_cons, v_base, v_up) AND tenant_id <> v_tenant;
  IF v_n <> 0 THEN RAISE EXCEPTION 'tenant isolation broken on assumptions'; END IF;
  SELECT count(*) INTO v_n FROM public.commercial_scenarios
    WHERE program_id=v_program AND tenant_id <> v_tenant;
  IF v_n <> 0 THEN RAISE EXCEPTION 'tenant isolation broken on scenarios'; END IF;

  -- 8. No P&L / calculated-output rows created (no such table introduced).
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name IN ('commercial_pl_outputs','commercial_scenario_results')
  ) THEN
    RAISE EXCEPTION 'BP2.5 must not introduce calculated P&L output tables';
  END IF;

  RAISE NOTICE 'BP2.5 scenario foundation regression: PASS';
END $$;
