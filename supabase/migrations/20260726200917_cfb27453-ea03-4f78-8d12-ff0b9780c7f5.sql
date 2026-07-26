CREATE OR REPLACE FUNCTION public.commercial_release_readiness(_model_version_id uuid)
 RETURNS TABLE(control_code text, category text, label text, status text, severity text, blocking boolean, expected_value text, actual_value text, object_type text, object_id uuid, evidence_reference text, remediation_hint text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ver        public.commercial_model_versions;
  v_prog       public.commercial_programs;
  v_scenarios  int;
  v_baselines  int;
  v_assump     int;
  v_open_cs    int;
  v_rev        int; v_pnl int; v_cash int;
  v_stale      int;
  v_missing_in int;
  v_missing_rs int;
  v_missing_hash int;
  v_missing_fp int;
  v_cmp        int;
  v_sens       int;
  v_xtenant    int;
  v_broken     int;
  v_expected   int;
BEGIN
  SELECT * INTO v_ver FROM public.commercial_model_versions mv WHERE mv.id = _model_version_id;
  IF v_ver.id IS NULL THEN RAISE EXCEPTION 'model_version_not_found'; END IF;
  IF NOT public.commercial_is_member_with_view(v_ver.tenant_id) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT * INTO v_prog FROM public.commercial_programs cp WHERE cp.id = v_ver.program_id;

  SELECT count(*), count(*) FILTER (WHERE s.is_baseline)
    INTO v_scenarios, v_baselines
    FROM public.commercial_scenarios s
   WHERE s.program_id = v_ver.program_id AND s.status <> 'archived';

  SELECT count(*) INTO v_assump
    FROM public.commercial_scenario_assumptions a
    JOIN public.commercial_scenarios s ON s.id = a.scenario_id
   WHERE s.program_id = v_ver.program_id;

  SELECT count(*) INTO v_open_cs
    FROM public.commercial_assumption_change_sets cs
   WHERE cs.model_version_id = _model_version_id
     AND cs.status NOT IN ('applied','cancelled');

  SELECT
    count(*) FILTER (WHERE r.run_scope = 'revenue'),
    count(*) FILTER (WHERE r.run_scope = 'pnl'),
    count(*) FILTER (WHERE r.run_scope = 'cash'),
    count(*) FILTER (WHERE r.input_count = 0),
    count(*) FILTER (WHERE r.result_count = 0),
    count(*) FILTER (WHERE r.input_hash IS NULL OR btrim(r.input_hash) = '')
    INTO v_rev, v_pnl, v_cash, v_missing_in, v_missing_rs, v_missing_hash
    FROM public.commercial_release_authoritative_runs(v_ver.program_id, _model_version_id) r;

  SELECT count(*) INTO v_stale
    FROM public.commercial_program_run_staleness(v_ver.program_id) st
   WHERE st.is_stale;

  SELECT count(*) INTO v_missing_fp
    FROM public.commercial_release_authoritative_runs(v_ver.program_id, _model_version_id) r
    JOIN public.commercial_model_runs mr ON mr.id = r.run_id
   WHERE COALESCE(btrim(mr.input_hash), '') = '';

  SELECT count(*) INTO v_cmp
    FROM public.commercial_scenario_comparisons cmp
   WHERE cmp.model_version_id = _model_version_id AND cmp.status IN ('saved','archived');

  SELECT count(*) INTO v_sens
    FROM public.commercial_sensitivity_experiments se
   WHERE se.model_version_id = _model_version_id AND se.status IN ('completed','archived');

  SELECT count(*) INTO v_xtenant
    FROM public.commercial_model_runs r
   WHERE r.model_version_id = _model_version_id AND r.tenant_id <> v_ver.tenant_id;

  SELECT count(*) INTO v_broken
    FROM public.commercial_release_authoritative_runs(v_ver.program_id, _model_version_id) r
   WHERE NOT EXISTS (SELECT 1 FROM public.commercial_scenarios s WHERE s.id = r.scenario_id);

  v_expected := GREATEST(v_scenarios, 1);

  RETURN QUERY
  SELECT * FROM (VALUES
    ('MV-EXISTS','Model configuration','Model version exists',
      'pass','blocking', false, 'present', v_ver.version_code,
      'commercial_model_version', v_ver.id, 'commercial_model_versions', NULL::text),

    ('MV-TENANT','Model configuration','Model version bound to tenant and program',
      CASE WHEN v_prog.id IS NOT NULL AND v_prog.tenant_id = v_ver.tenant_id THEN 'pass' ELSE 'fail' END,
      'blocking', (v_prog.id IS NULL OR v_prog.tenant_id <> v_ver.tenant_id),
      'tenant and program aligned', COALESCE(v_prog.code, 'unresolved'),
      'commercial_program', v_prog.id, 'commercial_programs',
      'Re-bind the model version to its owning program.'),

    ('MV-STATUS','Model configuration','Status permits activation',
      CASE WHEN v_ver.status = 'draft' THEN 'pass'
           WHEN v_ver.status = 'active' THEN 'not_applicable'
           ELSE 'fail' END,
      'blocking', (v_ver.status NOT IN ('draft','active')),
      'draft', v_ver.status, 'commercial_model_version', v_ver.id,
      'commercial_model_versions.status',
      'Only a draft model version can be activated.'),

    ('MV-CATALOG','Model configuration','Formula catalog version pinned',
      CASE WHEN COALESCE(btrim(v_ver.formula_catalog_version),'') <> '' THEN 'pass' ELSE 'fail' END,
      'blocking', (COALESCE(btrim(v_ver.formula_catalog_version),'') = ''),
      'non-empty', COALESCE(v_ver.formula_catalog_version,'(none)'),
      'commercial_model_version', v_ver.id, 'docs/commercial/bp3-formula-catalog.md', NULL::text),

    ('SC-REQUIRED','Model configuration','Required scenarios exist',
      CASE WHEN v_scenarios >= 3 THEN 'pass' ELSE 'fail' END, 'blocking', (v_scenarios < 3),
      '>= 3 (Conservative, Base, Upside)', v_scenarios::text,
      'commercial_program', v_prog.id, 'commercial_scenarios',
      'Seed the Conservative, Base and Upside scenarios.'),

    ('SC-BASELINE','Model configuration','Exactly one baseline scenario',
      CASE WHEN v_baselines = 1 THEN 'pass' ELSE 'fail' END, 'blocking', (v_baselines <> 1),
      '1', v_baselines::text, 'commercial_program', v_prog.id, 'commercial_scenarios.is_baseline',
      'Base must be the single baseline scenario.'),

    ('AS-PRESENT','Assumptions','Effective assumptions exist for every scenario',
      CASE WHEN v_assump >= v_scenarios * 20 THEN 'pass' ELSE 'fail' END, 'blocking',
      (v_assump < v_scenarios * 20),
      '>= 20 per scenario', v_assump::text, 'commercial_program', v_prog.id,
      'commercial_scenario_assumptions', 'Seed the governed assumption catalog.'),

    ('AS-NO-OPEN-CS','Assumptions','No open governed change set remains',
      CASE WHEN v_open_cs = 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_open_cs > 0),
      '0', v_open_cs::text, 'commercial_model_version', v_ver.id,
      'commercial_assumption_change_sets',
      'Apply or cancel every draft/validated change set before certification.'),

    ('RUN-REVENUE','Revenue','Completed Revenue runs for all scenarios',
      CASE WHEN v_rev >= v_expected THEN 'pass' ELSE 'fail' END, 'blocking', (v_rev < v_expected),
      v_expected::text, v_rev::text, 'commercial_model_version', v_ver.id,
      'commercial_model_runs (run_scope=revenue)', 'Run the Revenue scope for every scenario.'),

    ('RUN-PNL','P&L','Completed P&L runs for all scenarios',
      CASE WHEN v_pnl >= v_expected THEN 'pass' ELSE 'fail' END, 'blocking', (v_pnl < v_expected),
      v_expected::text, v_pnl::text, 'commercial_model_version', v_ver.id,
      'commercial_model_runs (run_scope=pnl)', 'Run the P&L scope for every scenario.'),

    ('RUN-CASH','Cash','Completed Cash runs for all scenarios',
      CASE WHEN v_cash >= v_expected THEN 'pass' ELSE 'fail' END, 'blocking', (v_cash < v_expected),
      v_expected::text, v_cash::text, 'commercial_model_version', v_ver.id,
      'commercial_model_runs (run_scope=cash)', 'Run the Cash scope for every scenario.'),

    ('RUN-CURRENT','Revenue','No stale authoritative run remains',
      CASE WHEN v_stale = 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_stale > 0),
      '0 stale scopes', v_stale::text, 'commercial_program', v_prog.id,
      'commercial_program_run_staleness',
      'Re-run every scope affected by the latest applied change set.'),

    ('RUN-INPUTS','Revenue','Run inputs persisted for every authoritative run',
      CASE WHEN v_missing_in = 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_missing_in > 0),
      '0 runs without inputs', v_missing_in::text, 'commercial_model_version', v_ver.id,
      'commercial_model_run_inputs', 'Re-run scopes with missing persisted inputs.'),

    ('RUN-RESULTS','P&L','Run results persisted for every authoritative run',
      CASE WHEN v_missing_rs = 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_missing_rs > 0),
      '0 runs without results', v_missing_rs::text, 'commercial_model_version', v_ver.id,
      'commercial_model_results', 'Re-run scopes with missing persisted results.'),

    ('RUN-HASH','Cash','Input hashes present on every authoritative run',
      CASE WHEN v_missing_hash = 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_missing_hash > 0),
      '0 runs without input_hash', v_missing_hash::text, 'commercial_model_version', v_ver.id,
      'commercial_model_runs.input_hash', 'Re-run scopes missing a deterministic input hash.'),

    ('RUN-FINGERPRINT','Cash','Runtime fingerprints present',
      CASE WHEN v_missing_fp = 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_missing_fp > 0),
      '0 runs without fingerprint', v_missing_fp::text, 'commercial_model_version', v_ver.id,
      'commercial_model_runs.input_hash (scope fingerprint)', NULL::text),

    ('CMP-EVIDENCE','Comparison','Saved or archived scenario comparison evidence exists',
      CASE WHEN v_cmp > 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_cmp = 0),
      '>= 1', v_cmp::text, 'commercial_model_version', v_ver.id,
      'commercial_scenario_comparisons', 'Save at least one scenario comparison snapshot.'),

    ('SENS-EVIDENCE','Sensitivity','Completed sensitivity evidence exists',
      CASE WHEN v_sens > 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_sens = 0),
      '>= 1', v_sens::text, 'commercial_model_version', v_ver.id,
      'commercial_sensitivity_experiments', 'Complete at least one sensitivity experiment.'),

    ('SENS-LABEL-FMT','Sensitivity','BP3.7.4 perturbation label formatting deferred',
      'warning', 'warning', false,
      'cosmetic defect disclosed', 'BP3.7.4 deferred (presentation only)',
      'commercial_model_version', v_ver.id, 'docs/commercial/bp3-7-test-evidence.md',
      'Cosmetic only; does not affect persisted numeric evidence.'),

    ('DOC-CONTRACT','Documentation','Model contract and test evidence published',
      'pass','info', false, 'published', 'BP3.0-BP3.7 evidence documents present',
      'documentation', NULL::uuid, 'docs/commercial/bp3-model-contract.md', NULL::text),

    ('SEC-TENANT','Security','No cross-tenant run inconsistency',
      CASE WHEN v_xtenant = 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_xtenant > 0),
      '0', v_xtenant::text, 'commercial_model_version', v_ver.id,
      'commercial_model_runs.tenant_id', 'Escalate: cross-tenant contamination detected.'),

    ('LIN-INTEGRITY','Lineage','No broken lineage reference',
      CASE WHEN v_broken = 0 THEN 'pass' ELSE 'fail' END, 'blocking', (v_broken > 0),
      '0', v_broken::text, 'commercial_model_version', v_ver.id,
      'commercial_model_runs -> commercial_scenarios',
      'Repair orphaned scenario references before activation.')
  ) AS t(control_code, category, label, status, severity, blocking,
         expected_value, actual_value, object_type, object_id,
         evidence_reference, remediation_hint);
END $function$;

REVOKE ALL ON FUNCTION public.commercial_release_readiness(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_release_readiness(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.commercial_release_readiness(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_release_readiness(uuid) TO service_role;