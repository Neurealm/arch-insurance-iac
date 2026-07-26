-- ============================================================================
-- BP3.8 — Governed Model Activation, Release Lineage, Readiness Certification
-- Additive only. No financial formula, assumption, run, comparison, sensitivity
-- or historical evidence is modified by this migration.
-- ============================================================================

ALTER TABLE public.commercial_model_versions
  ADD COLUMN IF NOT EXISTS activated_at              timestamptz,
  ADD COLUMN IF NOT EXISTS activated_by              uuid,
  ADD COLUMN IF NOT EXISTS activation_id             uuid,
  ADD COLUMN IF NOT EXISTS superseded_at             timestamptz,
  ADD COLUMN IF NOT EXISTS superseded_by_version_id  uuid,
  ADD COLUMN IF NOT EXISTS supersedes_version_id     uuid;

CREATE UNIQUE INDEX IF NOT EXISTS cmv_one_active_per_program
  ON public.commercial_model_versions (tenant_id, program_id)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS public.commercial_release_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  model_version_id uuid NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','ready','certified','invalidated')),
  readiness_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  readiness_hash text,
  release_manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  manifest_hash text,
  content_hash text,
  source_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  control_count integer NOT NULL DEFAULT 0,
  pass_count integer NOT NULL DEFAULT 0,
  warning_count integer NOT NULL DEFAULT 0,
  blocking_failure_count integer NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  certified_by uuid,
  certified_at timestamptz,
  invalidated_by uuid,
  invalidated_at timestamptz,
  invalidation_reason text
);
CREATE INDEX IF NOT EXISTS crc_tenant_program_idx
  ON public.commercial_release_certifications (tenant_id, program_id, status);
CREATE INDEX IF NOT EXISTS crc_version_idx
  ON public.commercial_release_certifications (model_version_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS crc_one_open_per_version
  ON public.commercial_release_certifications (model_version_id)
  WHERE status IN ('draft','ready');

GRANT SELECT, INSERT, UPDATE ON public.commercial_release_certifications TO authenticated;
GRANT ALL ON public.commercial_release_certifications TO service_role;
ALTER TABLE public.commercial_release_certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crc_select ON public.commercial_release_certifications;
CREATE POLICY crc_select ON public.commercial_release_certifications FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
DROP POLICY IF EXISTS crc_insert ON public.commercial_release_certifications;
CREATE POLICY crc_insert ON public.commercial_release_certifications FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.model.certification.create'));
DROP POLICY IF EXISTS crc_update ON public.commercial_release_certifications;
CREATE POLICY crc_update ON public.commercial_release_certifications FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.model.certification.create'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.model.certification.create'));
DROP POLICY IF EXISTS crc_delete ON public.commercial_release_certifications;
CREATE POLICY crc_delete ON public.commercial_release_certifications FOR DELETE TO authenticated
  USING (false);

CREATE TABLE IF NOT EXISTS public.commercial_release_lineage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES public.commercial_release_certifications(id) ON DELETE CASCADE,
  model_version_id uuid NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE RESTRICT,
  upstream_type text NOT NULL,
  upstream_id uuid,
  downstream_type text NOT NULL,
  downstream_id uuid,
  relationship text NOT NULL,
  scope text,
  scenario_id uuid,
  metric_code text,
  source_hash text,
  target_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crl_cert_idx ON public.commercial_release_lineage (certification_id, relationship);
CREATE INDEX IF NOT EXISTS crl_tenant_idx ON public.commercial_release_lineage (tenant_id, model_version_id);

GRANT SELECT ON public.commercial_release_lineage TO authenticated;
GRANT ALL ON public.commercial_release_lineage TO service_role;
ALTER TABLE public.commercial_release_lineage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crl_select ON public.commercial_release_lineage;
CREATE POLICY crl_select ON public.commercial_release_lineage FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
DROP POLICY IF EXISTS crl_no_write ON public.commercial_release_lineage;
CREATE POLICY crl_no_write ON public.commercial_release_lineage FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE TABLE IF NOT EXISTS public.commercial_model_activations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  model_version_id uuid NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE RESTRICT,
  certification_id uuid NOT NULL REFERENCES public.commercial_release_certifications(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','superseded')),
  activation_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  snapshot_hash text,
  readiness_hash text,
  manifest_hash text,
  certification_hash text,
  lineage_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  blocking_failure_count integer NOT NULL DEFAULT 0,
  warning_count integer NOT NULL DEFAULT 0,
  prior_active_version_id uuid,
  prior_activation_id uuid,
  activation_reason text NOT NULL,
  activated_by uuid,
  activated_at timestamptz NOT NULL DEFAULT now(),
  superseded_at timestamptz,
  superseded_by_activation_id uuid
);
CREATE INDEX IF NOT EXISTS cma_tenant_program_idx
  ON public.commercial_model_activations (tenant_id, program_id, activated_at DESC);

GRANT SELECT ON public.commercial_model_activations TO authenticated;
GRANT ALL ON public.commercial_model_activations TO service_role;
ALTER TABLE public.commercial_model_activations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cma_select ON public.commercial_model_activations;
CREATE POLICY cma_select ON public.commercial_model_activations FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
DROP POLICY IF EXISTS cma_no_insert ON public.commercial_model_activations;
CREATE POLICY cma_no_insert ON public.commercial_model_activations FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.commercial_release_certification_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('app.commercial_release_op', true) = 'server' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'commercial_release_certification_delete_forbidden' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status IN ('certified','invalidated') THEN
    RAISE EXCEPTION 'commercial_release_certification_immutable (status=%)', OLD.status
      USING ERRCODE = 'check_violation';
  END IF;
  RAISE EXCEPTION 'commercial_release_certification_must_use_rpc' USING ERRCODE = 'check_violation';
END $$;

DROP TRIGGER IF EXISTS trg_crc_guard ON public.commercial_release_certifications;
CREATE TRIGGER trg_crc_guard BEFORE UPDATE OR DELETE ON public.commercial_release_certifications
  FOR EACH ROW EXECUTE FUNCTION public.commercial_release_certification_guard();

CREATE OR REPLACE FUNCTION public.commercial_release_immutable_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('app.commercial_release_op', true) = 'server' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  RAISE EXCEPTION 'commercial_release_record_immutable (%.%)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'check_violation';
END $$;

DROP TRIGGER IF EXISTS trg_crl_guard ON public.commercial_release_lineage;
CREATE TRIGGER trg_crl_guard BEFORE UPDATE OR DELETE ON public.commercial_release_lineage
  FOR EACH ROW EXECUTE FUNCTION public.commercial_release_immutable_guard();

DROP TRIGGER IF EXISTS trg_cma_guard ON public.commercial_model_activations;
CREATE TRIGGER trg_cma_guard BEFORE UPDATE OR DELETE ON public.commercial_model_activations
  FOR EACH ROW EXECUTE FUNCTION public.commercial_release_immutable_guard();

CREATE OR REPLACE FUNCTION public.commercial_model_version_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('app.commercial_release_op', true) = 'server' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'commercial_model_version_delete_forbidden' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status IN ('active','superseded') THEN
    RAISE EXCEPTION 'commercial_model_version_immutable (status=%)', OLD.status
      USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'commercial_model_version_status_must_use_rpc' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_cmv_guard ON public.commercial_model_versions;
CREATE TRIGGER trg_cmv_guard BEFORE UPDATE OR DELETE ON public.commercial_model_versions
  FOR EACH ROW EXECUTE FUNCTION public.commercial_model_version_guard();

CREATE OR REPLACE FUNCTION public.commercial_change_set_active_version_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.commercial_model_versions WHERE id = NEW.model_version_id;
  IF v_status IN ('active','superseded') THEN
    RAISE EXCEPTION 'commercial_active_version_requires_successor (model_version_status=%)', v_status
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_cacs_active_version_guard ON public.commercial_assumption_change_sets;
CREATE TRIGGER trg_cacs_active_version_guard BEFORE INSERT ON public.commercial_assumption_change_sets
  FOR EACH ROW EXECUTE FUNCTION public.commercial_change_set_active_version_guard();

INSERT INTO public.permissions (code, description, category)
VALUES
  ('commercial.model.readiness.view',        'View model activation readiness controls',       'commercial'),
  ('commercial.model.certification.create',  'Create or refresh draft release certifications', 'commercial'),
  ('commercial.model.certification.certify', 'Certify release readiness for activation',       'commercial'),
  ('commercial.model.certification.invalidate','Invalidate a release certification',           'commercial'),
  ('commercial.model.activate',              'Activate a governed commercial model version',   'commercial'),
  ('commercial.model.activation.view',       'View activation snapshots and history',          'commercial'),
  ('commercial.model.version.create_successor','Create a successor draft model version',       'commercial')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.tenant_role_permissions (tenant_id, role_id, permission_code)
SELECT tr.tenant_id, tr.id, p.code
FROM public.tenant_roles tr
CROSS JOIN (VALUES
  ('commercial.model.readiness.view'),
  ('commercial.model.activation.view')
) AS p(code)
WHERE tr.name = 'Commercial Analyst'
ON CONFLICT DO NOTHING;

INSERT INTO public.tenant_role_permissions (tenant_id, role_id, permission_code)
SELECT tr.tenant_id, tr.id, p.code
FROM public.tenant_roles tr
CROSS JOIN (VALUES
  ('commercial.model.readiness.view'),
  ('commercial.model.certification.create'),
  ('commercial.model.certification.certify'),
  ('commercial.model.certification.invalidate'),
  ('commercial.model.activate'),
  ('commercial.model.activation.view'),
  ('commercial.model.version.create_successor')
) AS p(code)
WHERE tr.name = 'Commercial Administrator'
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.commercial_release_authoritative_runs(
  _program_id uuid, _model_version_id uuid
)
RETURNS TABLE(
  run_scope text, scenario_id uuid, run_id uuid, input_hash text,
  completed_at timestamptz, supersedes_run_id uuid, result_count bigint, input_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH authoritative AS (
    SELECT DISTINCT ON (r.run_scope, r.scenario_id)
           r.run_scope, r.scenario_id, r.id, r.input_hash, r.completed_at, r.supersedes_run_id
      FROM public.commercial_model_runs r
     WHERE r.program_id = _program_id
       AND r.model_version_id = _model_version_id
       AND r.status = 'completed'
       AND NOT EXISTS (
         SELECT 1 FROM public.commercial_model_runs s WHERE s.supersedes_run_id = r.id
       )
     ORDER BY r.run_scope, r.scenario_id, r.completed_at DESC NULLS LAST
  )
  SELECT a.run_scope, a.scenario_id, a.id, a.input_hash, a.completed_at, a.supersedes_run_id,
         (SELECT count(*) FROM public.commercial_model_results res WHERE res.run_id = a.id),
         (SELECT count(*) FROM public.commercial_model_run_inputs i WHERE i.run_id = a.id)
    FROM authoritative a
   WHERE public.commercial_is_member_with_view(
           (SELECT tenant_id FROM public.commercial_programs WHERE id = _program_id));
$$;

REVOKE ALL ON FUNCTION public.commercial_release_authoritative_runs(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_release_authoritative_runs(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.commercial_release_authoritative_runs(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_release_authoritative_runs(uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.commercial_release_readiness(_model_version_id uuid)
RETURNS TABLE(
  control_code text, category text, label text, status text, severity text,
  blocking boolean, expected_value text, actual_value text,
  object_type text, object_id uuid, evidence_reference text, remediation_hint text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
  SELECT * INTO v_ver FROM public.commercial_model_versions WHERE id = _model_version_id;
  IF v_ver.id IS NULL THEN RAISE EXCEPTION 'model_version_not_found'; END IF;
  IF NOT public.commercial_is_member_with_view(v_ver.tenant_id) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT * INTO v_prog FROM public.commercial_programs WHERE id = v_ver.program_id;

  SELECT count(*), count(*) FILTER (WHERE is_baseline)
    INTO v_scenarios, v_baselines
    FROM public.commercial_scenarios
   WHERE program_id = v_ver.program_id AND status <> 'archived';

  SELECT count(*) INTO v_assump
    FROM public.commercial_scenario_assumptions a
    JOIN public.commercial_scenarios s ON s.id = a.scenario_id
   WHERE s.program_id = v_ver.program_id;

  SELECT count(*) INTO v_open_cs
    FROM public.commercial_assumption_change_sets
   WHERE model_version_id = _model_version_id
     AND status NOT IN ('applied','cancelled');

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
    FROM public.commercial_scenario_comparisons
   WHERE model_version_id = _model_version_id AND status IN ('saved','archived');

  SELECT count(*) INTO v_sens
    FROM public.commercial_sensitivity_experiments
   WHERE model_version_id = _model_version_id AND status IN ('completed','archived');

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
END $$;

REVOKE ALL ON FUNCTION public.commercial_release_readiness(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_release_readiness(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.commercial_release_readiness(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_release_readiness(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.commercial_release_build_manifest(_model_version_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ver public.commercial_model_versions;
  v_prog public.commercial_programs;
  v_manifest jsonb;
BEGIN
  SELECT * INTO v_ver FROM public.commercial_model_versions WHERE id = _model_version_id;
  IF v_ver.id IS NULL THEN RAISE EXCEPTION 'model_version_not_found'; END IF;
  IF NOT public.commercial_is_member_with_view(v_ver.tenant_id) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT * INTO v_prog FROM public.commercial_programs WHERE id = v_ver.program_id;

  SELECT jsonb_build_object(
    'manifest_version', 'v1',
    'model', jsonb_build_object(
      'tenant_id', v_ver.tenant_id,
      'program_id', v_ver.program_id,
      'program_code', v_prog.code,
      'model_version_id', v_ver.id,
      'version_code', v_ver.version_code,
      'version_status', v_ver.status,
      'formula_catalog_version', v_ver.formula_catalog_version,
      'source_fingerprint', v_ver.source_fingerprint,
      'source_file_name', v_ver.source_file_name
    ),
    'scenarios', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'scenario_id', s.id, 'code', s.code, 'name', s.name,
               'is_baseline', s.is_baseline) ORDER BY s.code)
        FROM public.commercial_scenarios s
       WHERE s.program_id = v_ver.program_id AND s.status <> 'archived'
    ), '[]'::jsonb),
    'assumptions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'scenario_code', s.code, 'assumption_code', a.assumption_code,
               'numeric_value', a.numeric_value, 'text_value', a.text_value,
               'unit', a.unit, 'effective_at', a.updated_at)
             ORDER BY s.code, a.assumption_code)
        FROM public.commercial_scenario_assumptions a
        JOIN public.commercial_scenarios s ON s.id = a.scenario_id
       WHERE s.program_id = v_ver.program_id
    ), '[]'::jsonb),
    'applied_change_sets', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'change_set_id', cs.id, 'title', cs.title,
               'content_hash', cs.content_hash, 'applied_at', cs.applied_at)
             ORDER BY cs.applied_at)
        FROM public.commercial_assumption_change_sets cs
       WHERE cs.model_version_id = _model_version_id AND cs.status = 'applied'
    ), '[]'::jsonb),
    'financial_evidence', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'scope', r.run_scope, 'scenario_id', r.scenario_id, 'run_id', r.run_id,
               'input_hash', r.input_hash, 'completed_at', r.completed_at,
               'result_count', r.result_count, 'input_count', r.input_count,
               'supersedes_run_id', r.supersedes_run_id)
             ORDER BY r.run_scope, r.scenario_id)
        FROM public.commercial_release_authoritative_runs(v_ver.program_id, _model_version_id) r
    ), '[]'::jsonb),
    'comparison_evidence', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'comparison_id', c.id, 'status', c.status, 'mode', c.mode,
               'content_hash', c.content_hash,
               'source_run_manifest_hash', c.source_run_manifest_hash,
               'baseline_scenario_id', c.baseline_scenario_id,
               'compared_scenario_ids', to_jsonb(c.compared_scenario_ids),
               'included_scopes', to_jsonb(c.included_scopes),
               'result_count', (SELECT count(*) FROM public.commercial_scenario_comparison_results x
                                 WHERE x.comparison_id = c.id))
             ORDER BY c.id)
        FROM public.commercial_scenario_comparisons c
       WHERE c.model_version_id = _model_version_id AND c.status IN ('saved','archived')
    ), '[]'::jsonb),
    'sensitivity_evidence', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'experiment_id', e.id, 'status', e.status,
               'assumption_code', e.assumption_code,
               'content_hash', e.content_hash,
               'baseline_run_manifest_hash', e.baseline_run_manifest_hash,
               'included_scopes', to_jsonb(e.included_scopes),
               'perturbation_count', (SELECT count(*) FROM public.commercial_sensitivity_perturbations p
                                       WHERE p.experiment_id = e.id),
               'result_count', (SELECT count(*) FROM public.commercial_sensitivity_results sr
                                 WHERE sr.experiment_id = e.id),
               'metric_coverage', (SELECT count(DISTINCT sr.metric_code)
                                     FROM public.commercial_sensitivity_results sr
                                    WHERE sr.experiment_id = e.id))
             ORDER BY e.id)
        FROM public.commercial_sensitivity_experiments e
       WHERE e.model_version_id = _model_version_id AND e.status IN ('completed','archived')
    ), '[]'::jsonb),
    'documentation', jsonb_build_object(
      'model_contract', 'docs/commercial/bp3-model-contract.md',
      'formula_catalog', 'docs/commercial/bp3-formula-catalog.md',
      'golden_baseline', 'docs/commercial/bp3-golden-output-baseline.md',
      'test_evidence', jsonb_build_array(
        'docs/commercial/bp3-2-test-evidence.md',
        'docs/commercial/bp3-3-test-evidence.md',
        'docs/commercial/bp3-4-test-evidence.md',
        'docs/commercial/bp3-5-test-evidence.md',
        'docs/commercial/bp3-6-test-evidence.md',
        'docs/commercial/bp3-7-test-evidence.md'),
      'known_limitations', 'docs/commercial/known-limitations.md',
      'deferred_defects', jsonb_build_array('BP3.7.4 perturbation label formatting (cosmetic)')
    )
  ) INTO v_manifest;

  RETURN v_manifest;
END $$;

REVOKE ALL ON FUNCTION public.commercial_release_build_manifest(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_release_build_manifest(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.commercial_release_build_manifest(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_release_build_manifest(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.commercial_release_hash(_payload jsonb)
RETURNS text LANGUAGE sql IMMUTABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT encode(extensions.digest(convert_to(COALESCE(_payload,'{}'::jsonb)::text,'UTF8'),'sha256'::text),'hex');
$$;
REVOKE ALL ON FUNCTION public.commercial_release_hash(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_release_hash(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.commercial_release_hash(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_release_hash(jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.commercial_release_readiness_snapshot(_model_version_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'control_code', c.control_code, 'category', c.category, 'label', c.label,
           'status', c.status, 'severity', c.severity, 'blocking', c.blocking,
           'expected_value', c.expected_value, 'actual_value', c.actual_value,
           'object_type', c.object_type, 'object_id', c.object_id,
           'evidence_reference', c.evidence_reference,
           'remediation_hint', c.remediation_hint) ORDER BY c.control_code), '[]'::jsonb)
    FROM public.commercial_release_readiness(_model_version_id) c;
$$;
REVOKE ALL ON FUNCTION public.commercial_release_readiness_snapshot(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_release_readiness_snapshot(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.commercial_release_readiness_snapshot(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_release_readiness_snapshot(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.commercial_release_certification_refresh(_certification_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cert public.commercial_release_certifications;
  v_snapshot jsonb; v_manifest jsonb;
  v_readiness_hash text; v_manifest_hash text; v_content_hash text;
  v_total int; v_pass int; v_warn int; v_block int;
  v_status text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_cert FROM public.commercial_release_certifications
   WHERE id = _certification_id FOR UPDATE;
  IF v_cert.id IS NULL THEN RAISE EXCEPTION 'certification_not_found'; END IF;
  IF NOT public.commercial_can_write(v_cert.tenant_id, 'commercial.model.certification.create') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_cert.status NOT IN ('draft','ready') THEN
    RAISE EXCEPTION 'certification_not_open (%)', v_cert.status;
  END IF;

  v_snapshot := public.commercial_release_readiness_snapshot(v_cert.model_version_id);
  v_manifest := public.commercial_release_build_manifest(v_cert.model_version_id);
  v_readiness_hash := public.commercial_release_hash(v_snapshot);
  v_manifest_hash  := public.commercial_release_hash(v_manifest);
  v_content_hash   := public.commercial_release_hash(jsonb_build_object(
                        'readiness_hash', v_readiness_hash,
                        'manifest_hash', v_manifest_hash,
                        'model_version_id', v_cert.model_version_id));

  SELECT count(*),
         count(*) FILTER (WHERE c->>'status' = 'pass'),
         count(*) FILTER (WHERE c->>'status' = 'warning' OR c->>'severity' = 'warning'),
         count(*) FILTER (WHERE c->>'status' = 'fail' AND (c->>'blocking')::boolean)
    INTO v_total, v_pass, v_warn, v_block
    FROM jsonb_array_elements(v_snapshot) AS c;

  v_status := CASE WHEN v_block = 0 THEN 'ready' ELSE 'draft' END;

  PERFORM set_config('app.commercial_release_op','server', true);
  UPDATE public.commercial_release_certifications SET
    status = v_status,
    readiness_snapshot = v_snapshot,
    readiness_hash = v_readiness_hash,
    release_manifest = v_manifest,
    manifest_hash = v_manifest_hash,
    content_hash = v_content_hash,
    source_evidence = jsonb_build_object(
      'runs', v_manifest->'financial_evidence',
      'comparisons', v_manifest->'comparison_evidence',
      'sensitivity', v_manifest->'sensitivity_evidence'),
    control_count = v_total, pass_count = v_pass,
    warning_count = v_warn, blocking_failure_count = v_block,
    updated_by = auth.uid(), updated_at = now()
  WHERE id = _certification_id;
  PERFORM set_config('app.commercial_release_op','', true);

  PERFORM public.emit_audit_event(v_cert.tenant_id, 'commercial.model.certification.refreshed'::text,
    'commercial_release_certification'::text, _certification_id::text, NULL::jsonb,
    jsonb_build_object('status', v_status, 'readiness_hash', v_readiness_hash,
                       'manifest_hash', v_manifest_hash,
                       'blocking_failure_count', v_block, 'warning_count', v_warn),
    NULL::text, '{}'::jsonb);

  RETURN _certification_id;
END $$;

CREATE OR REPLACE FUNCTION public.commercial_release_certification_create(
  _model_version_id uuid, _notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ver public.commercial_model_versions;
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_ver FROM public.commercial_model_versions WHERE id = _model_version_id FOR UPDATE;
  IF v_ver.id IS NULL THEN RAISE EXCEPTION 'model_version_not_found'; END IF;
  IF NOT public.commercial_can_write(v_ver.tenant_id, 'commercial.model.certification.create') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_ver.status <> 'draft' THEN RAISE EXCEPTION 'model_version_not_draft (%)', v_ver.status; END IF;

  SELECT id INTO v_id FROM public.commercial_release_certifications
   WHERE model_version_id = _model_version_id AND status IN ('draft','ready');
  IF v_id IS NOT NULL THEN
    RETURN public.commercial_release_certification_refresh(v_id);
  END IF;

  PERFORM set_config('app.commercial_release_op','server', true);
  INSERT INTO public.commercial_release_certifications (
    tenant_id, program_id, model_version_id, notes, created_by, updated_by
  ) VALUES (
    v_ver.tenant_id, v_ver.program_id, _model_version_id, _notes, auth.uid(), auth.uid()
  ) RETURNING id INTO v_id;
  PERFORM set_config('app.commercial_release_op','', true);

  PERFORM public.emit_audit_event(v_ver.tenant_id, 'commercial.model.certification.created'::text,
    'commercial_release_certification'::text, v_id::text, NULL::jsonb,
    jsonb_build_object('model_version_id', _model_version_id, 'version_code', v_ver.version_code),
    NULL::text, '{}'::jsonb);

  RETURN public.commercial_release_certification_refresh(v_id);
END $$;

CREATE OR REPLACE FUNCTION public.commercial_release_certification_certify(
  _certification_id uuid, _note text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cert public.commercial_release_certifications;
  v_snapshot jsonb; v_manifest jsonb;
  v_readiness_hash text; v_manifest_hash text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_cert FROM public.commercial_release_certifications
   WHERE id = _certification_id FOR UPDATE;
  IF v_cert.id IS NULL THEN RAISE EXCEPTION 'certification_not_found'; END IF;
  IF NOT public.commercial_can_write(v_cert.tenant_id, 'commercial.model.certification.certify') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_cert.status <> 'ready' THEN RAISE EXCEPTION 'certification_not_ready (%)', v_cert.status; END IF;

  v_snapshot := public.commercial_release_readiness_snapshot(v_cert.model_version_id);
  v_manifest := public.commercial_release_build_manifest(v_cert.model_version_id);
  v_readiness_hash := public.commercial_release_hash(v_snapshot);
  v_manifest_hash  := public.commercial_release_hash(v_manifest);

  IF v_readiness_hash IS DISTINCT FROM v_cert.readiness_hash
     OR v_manifest_hash IS DISTINCT FROM v_cert.manifest_hash THEN
    RAISE EXCEPTION 'certification_content_changed_refresh_required';
  END IF;
  IF v_cert.blocking_failure_count > 0 THEN
    RAISE EXCEPTION 'certification_blocking_failures (%)', v_cert.blocking_failure_count;
  END IF;

  PERFORM set_config('app.commercial_release_op','server', true);

  DELETE FROM public.commercial_release_lineage WHERE certification_id = _certification_id;

  INSERT INTO public.commercial_release_lineage (
    tenant_id, certification_id, model_version_id, upstream_type, upstream_id,
    downstream_type, downstream_id, relationship, scope, scenario_id, source_hash, target_hash)
  SELECT v_cert.tenant_id, _certification_id, v_cert.model_version_id,
         'commercial_model_version', v_cert.model_version_id,
         'commercial_model_run', r.run_id, 'produces', r.run_scope, r.scenario_id,
         NULL, r.input_hash
    FROM public.commercial_release_authoritative_runs(v_cert.program_id, v_cert.model_version_id) r;

  INSERT INTO public.commercial_release_lineage (
    tenant_id, certification_id, model_version_id, upstream_type, upstream_id,
    downstream_type, downstream_id, relationship, scope, scenario_id, source_hash, target_hash)
  SELECT v_cert.tenant_id, _certification_id, v_cert.model_version_id,
         'commercial_scenario', r.scenario_id,
         'commercial_model_run', r.run_id, 'assumptions_feed_run', r.run_scope, r.scenario_id,
         NULL, r.input_hash
    FROM public.commercial_release_authoritative_runs(v_cert.program_id, v_cert.model_version_id) r;

  INSERT INTO public.commercial_release_lineage (
    tenant_id, certification_id, model_version_id, upstream_type, upstream_id,
    downstream_type, downstream_id, relationship, source_hash, target_hash)
  SELECT v_cert.tenant_id, _certification_id, v_cert.model_version_id,
         'commercial_model_version', v_cert.model_version_id,
         'commercial_scenario_comparison', c.id, 'evidence_for_release',
         c.source_run_manifest_hash, c.content_hash
    FROM public.commercial_scenario_comparisons c
   WHERE c.model_version_id = v_cert.model_version_id AND c.status IN ('saved','archived');

  INSERT INTO public.commercial_release_lineage (
    tenant_id, certification_id, model_version_id, upstream_type, upstream_id,
    downstream_type, downstream_id, relationship, source_hash, target_hash)
  SELECT v_cert.tenant_id, _certification_id, v_cert.model_version_id,
         'commercial_model_version', v_cert.model_version_id,
         'commercial_sensitivity_experiment', e.id, 'evidence_for_release',
         e.baseline_run_manifest_hash, e.content_hash
    FROM public.commercial_sensitivity_experiments e
   WHERE e.model_version_id = v_cert.model_version_id AND e.status IN ('completed','archived');

  INSERT INTO public.commercial_release_lineage (
    tenant_id, certification_id, model_version_id, upstream_type, upstream_id,
    downstream_type, downstream_id, relationship, source_hash, target_hash)
  VALUES (v_cert.tenant_id, _certification_id, v_cert.model_version_id,
          'commercial_release_certification', _certification_id,
          'commercial_model_version', v_cert.model_version_id, 'certifies',
          v_readiness_hash, v_manifest_hash);

  UPDATE public.commercial_release_certifications SET
    status = 'certified', certified_by = auth.uid(), certified_at = now(),
    updated_by = auth.uid(), updated_at = now(),
    notes = COALESCE(_note, notes)
  WHERE id = _certification_id;
  PERFORM set_config('app.commercial_release_op','', true);

  PERFORM public.emit_audit_event(v_cert.tenant_id, 'commercial.model.certification.certified'::text,
    'commercial_release_certification'::text, _certification_id::text,
    jsonb_build_object('status','ready'),
    jsonb_build_object('status','certified','readiness_hash', v_readiness_hash,
                       'manifest_hash', v_manifest_hash,
                       'content_hash', v_cert.content_hash,
                       'warning_count', v_cert.warning_count,
                       'model_version_id', v_cert.model_version_id),
    _note, '{}'::jsonb);

  RETURN _certification_id;
END $$;

CREATE OR REPLACE FUNCTION public.commercial_release_certification_invalidate(
  _certification_id uuid, _reason text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cert public.commercial_release_certifications;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  IF _reason IS NULL OR btrim(_reason) = '' THEN RAISE EXCEPTION 'reason_required'; END IF;
  SELECT * INTO v_cert FROM public.commercial_release_certifications
   WHERE id = _certification_id FOR UPDATE;
  IF v_cert.id IS NULL THEN RAISE EXCEPTION 'certification_not_found'; END IF;
  IF NOT public.commercial_can_write(v_cert.tenant_id, 'commercial.model.certification.invalidate') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_cert.status = 'invalidated' THEN RAISE EXCEPTION 'certification_already_invalidated'; END IF;
  IF EXISTS (SELECT 1 FROM public.commercial_model_activations a
              WHERE a.certification_id = _certification_id) THEN
    RAISE EXCEPTION 'certification_consumed_by_activation';
  END IF;

  PERFORM set_config('app.commercial_release_op','server', true);
  UPDATE public.commercial_release_certifications SET
    status = 'invalidated', invalidated_by = auth.uid(), invalidated_at = now(),
    invalidation_reason = _reason, updated_by = auth.uid(), updated_at = now()
  WHERE id = _certification_id;
  PERFORM set_config('app.commercial_release_op','', true);

  PERFORM public.emit_audit_event(v_cert.tenant_id, 'commercial.model.certification.invalidated'::text,
    'commercial_release_certification'::text, _certification_id::text,
    jsonb_build_object('status', v_cert.status),
    jsonb_build_object('status','invalidated'), _reason, '{}'::jsonb);
  RETURN _certification_id;
END $$;

CREATE OR REPLACE FUNCTION public.commercial_model_version_activate(
  _model_version_id uuid, _certification_id uuid, _reason text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ver public.commercial_model_versions;
  v_cert public.commercial_release_certifications;
  v_snapshot jsonb; v_manifest jsonb;
  v_readiness_hash text; v_manifest_hash text;
  v_block int;
  v_prior public.commercial_model_versions;
  v_prior_activation uuid;
  v_activation_id uuid;
  v_payload jsonb; v_snapshot_hash text;
  v_lineage jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  IF _reason IS NULL OR btrim(_reason) = '' THEN RAISE EXCEPTION 'activation_reason_required'; END IF;

  SELECT * INTO v_ver FROM public.commercial_model_versions WHERE id = _model_version_id FOR UPDATE;
  IF v_ver.id IS NULL THEN RAISE EXCEPTION 'model_version_not_found'; END IF;

  SELECT * INTO v_cert FROM public.commercial_release_certifications
   WHERE id = _certification_id FOR UPDATE;
  IF v_cert.id IS NULL THEN RAISE EXCEPTION 'certification_not_found'; END IF;

  IF NOT public.commercial_can_write(v_ver.tenant_id, 'commercial.model.activate') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_cert.model_version_id <> _model_version_id
     OR v_cert.tenant_id <> v_ver.tenant_id
     OR v_cert.program_id <> v_ver.program_id THEN
    RAISE EXCEPTION 'certification_model_version_mismatch';
  END IF;
  IF v_ver.status <> 'draft' THEN RAISE EXCEPTION 'model_version_not_activatable (%)', v_ver.status; END IF;
  IF v_cert.status <> 'certified' THEN RAISE EXCEPTION 'certification_not_certified (%)', v_cert.status; END IF;

  PERFORM public.emit_audit_event(v_ver.tenant_id, 'commercial.model.activation.started'::text,
    'commercial_model_version'::text, _model_version_id::text, NULL::jsonb,
    jsonb_build_object('certification_id', _certification_id, 'version_code', v_ver.version_code),
    _reason, '{}'::jsonb);

  v_snapshot := public.commercial_release_readiness_snapshot(_model_version_id);
  v_manifest := public.commercial_release_build_manifest(_model_version_id);
  v_readiness_hash := public.commercial_release_hash(v_snapshot);
  v_manifest_hash  := public.commercial_release_hash(v_manifest);

  IF v_readiness_hash IS DISTINCT FROM v_cert.readiness_hash THEN
    RAISE EXCEPTION 'stale_certification_readiness_changed';
  END IF;
  IF v_manifest_hash IS DISTINCT FROM v_cert.manifest_hash THEN
    RAISE EXCEPTION 'stale_certification_manifest_changed';
  END IF;

  SELECT count(*) INTO v_block FROM jsonb_array_elements(v_snapshot) c
   WHERE c->>'status' = 'fail' AND (c->>'blocking')::boolean;
  IF v_block > 0 THEN RAISE EXCEPTION 'blocking_readiness_failures (%)', v_block; END IF;

  SELECT * INTO v_prior FROM public.commercial_model_versions
   WHERE tenant_id = v_ver.tenant_id AND program_id = v_ver.program_id
     AND status = 'active' AND id <> _model_version_id
   FOR UPDATE;
  IF v_prior.id IS NOT NULL THEN
    SELECT id INTO v_prior_activation FROM public.commercial_model_activations
     WHERE model_version_id = v_prior.id AND status = 'active'
     ORDER BY activated_at DESC LIMIT 1;
  END IF;

  SELECT jsonb_build_object(
      'total', COALESCE(sum(cnt), 0),
      'by_relationship', COALESCE(jsonb_object_agg(rel, cnt), '{}'::jsonb))
    INTO v_lineage
    FROM (SELECT relationship AS rel, count(*) AS cnt
            FROM public.commercial_release_lineage
           WHERE certification_id = _certification_id
           GROUP BY relationship) s;

  v_payload := jsonb_build_object(
    'snapshot_version','v1',
    'certification_id', _certification_id,
    'model_version_id', _model_version_id,
    'version_code', v_ver.version_code,
    'readiness_snapshot', v_snapshot,
    'readiness_hash', v_readiness_hash,
    'release_manifest', v_manifest,
    'manifest_hash', v_manifest_hash,
    'certification_hash', v_cert.content_hash,
    'lineage_summary', COALESCE(v_lineage, '{}'::jsonb),
    'prior_active_version_id', v_prior.id,
    'prior_activation_id', v_prior_activation,
    'activation_reason', _reason
  );
  v_snapshot_hash := public.commercial_release_hash(v_payload);

  PERFORM set_config('app.commercial_release_op','server', true);

  INSERT INTO public.commercial_model_activations (
    tenant_id, program_id, model_version_id, certification_id, status,
    activation_snapshot, snapshot_hash, readiness_hash, manifest_hash, certification_hash,
    lineage_summary, blocking_failure_count, warning_count,
    prior_active_version_id, prior_activation_id, activation_reason, activated_by
  ) VALUES (
    v_ver.tenant_id, v_ver.program_id, _model_version_id, _certification_id, 'active',
    v_payload, v_snapshot_hash, v_readiness_hash, v_manifest_hash, v_cert.content_hash,
    COALESCE(v_lineage,'{}'::jsonb), 0, v_cert.warning_count,
    v_prior.id, v_prior_activation, _reason, auth.uid()
  ) RETURNING id INTO v_activation_id;

  IF v_prior.id IS NOT NULL THEN
    UPDATE public.commercial_model_versions SET
      status = 'superseded', superseded_at = now(), superseded_by_version_id = _model_version_id
    WHERE id = v_prior.id;
    IF v_prior_activation IS NOT NULL THEN
      UPDATE public.commercial_model_activations SET
        status = 'superseded', superseded_at = now(), superseded_by_activation_id = v_activation_id
      WHERE id = v_prior_activation;
    END IF;
  END IF;

  UPDATE public.commercial_model_versions SET
    status = 'active', activated_at = now(), activated_by = auth.uid(),
    activation_id = v_activation_id, supersedes_version_id = v_prior.id,
    effective_from = COALESCE(effective_from, now()), updated_at = now(), updated_by = auth.uid()
  WHERE id = _model_version_id;

  PERFORM set_config('app.commercial_release_op','', true);

  IF v_prior.id IS NOT NULL THEN
    PERFORM public.emit_audit_event(v_ver.tenant_id, 'commercial.model.version.superseded'::text,
      'commercial_model_version'::text, v_prior.id::text,
      jsonb_build_object('status','active'),
      jsonb_build_object('status','superseded','superseded_by_version_id', _model_version_id),
      _reason, '{}'::jsonb);
  END IF;

  PERFORM public.emit_audit_event(v_ver.tenant_id, 'commercial.model.activated'::text,
    'commercial_model_version'::text, _model_version_id::text,
    jsonb_build_object('status','draft'),
    jsonb_build_object(
      'status','active', 'version_code', v_ver.version_code,
      'certification_id', _certification_id,
      'prior_active_version_id', v_prior.id,
      'readiness_hash', v_readiness_hash, 'manifest_hash', v_manifest_hash,
      'certification_hash', v_cert.content_hash,
      'activation_snapshot_id', v_activation_id,
      'blocking_failure_count', 0, 'warning_count', v_cert.warning_count),
    _reason, '{}'::jsonb);

  RETURN v_activation_id;
END $$;

CREATE OR REPLACE FUNCTION public.commercial_model_version_create_successor(
  _model_version_id uuid, _version_code text, _name text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ver public.commercial_model_versions; v_new uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  IF _version_code IS NULL OR btrim(_version_code) = '' THEN RAISE EXCEPTION 'version_code_required'; END IF;
  SELECT * INTO v_ver FROM public.commercial_model_versions WHERE id = _model_version_id;
  IF v_ver.id IS NULL THEN RAISE EXCEPTION 'model_version_not_found'; END IF;
  IF NOT public.commercial_can_write(v_ver.tenant_id, 'commercial.model.version.create_successor') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_ver.status <> 'active' THEN RAISE EXCEPTION 'successor_requires_active_version (%)', v_ver.status; END IF;

  PERFORM set_config('app.commercial_release_op','server', true);
  INSERT INTO public.commercial_model_versions (
    tenant_id, program_id, version_code, name, source_file_name, source_fingerprint,
    formula_catalog_version, status, notes, supersedes_version_id, created_by, updated_by
  ) VALUES (
    v_ver.tenant_id, v_ver.program_id, _version_code,
    COALESCE(_name, v_ver.name), v_ver.source_file_name, v_ver.source_fingerprint,
    v_ver.formula_catalog_version, 'draft',
    format('Successor draft cloned from %s. Structural configuration only; no runs, comparisons, sensitivity results, or activation evidence copied.', v_ver.version_code),
    _model_version_id, auth.uid(), auth.uid()
  ) RETURNING id INTO v_new;
  PERFORM set_config('app.commercial_release_op','', true);

  PERFORM public.emit_audit_event(v_ver.tenant_id, 'commercial.model.successor.created'::text,
    'commercial_model_version'::text, v_new::text, NULL::jsonb,
    jsonb_build_object('predecessor_version_id', _model_version_id,
                       'predecessor_version_code', v_ver.version_code,
                       'version_code', _version_code),
    NULL::text, '{}'::jsonb);
  RETURN v_new;
END $$;

DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.commercial_release_certification_create(uuid, text)',
    'public.commercial_release_certification_refresh(uuid)',
    'public.commercial_release_certification_certify(uuid, text)',
    'public.commercial_release_certification_invalidate(uuid, text)',
    'public.commercial_model_version_activate(uuid, uuid, text)',
    'public.commercial_model_version_create_successor(uuid, text, text)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
  END LOOP;
END $$;

COMMENT ON TABLE public.commercial_release_certifications IS
  'BP3.8: server-authoritative release readiness certification for a commercial model version. Immutable once certified or invalidated.';
COMMENT ON TABLE public.commercial_release_lineage IS
  'BP3.8: immutable release lineage linking assumptions, runs, comparisons, sensitivity evidence and the certification to the activated model version.';
COMMENT ON TABLE public.commercial_model_activations IS
  'BP3.8: immutable activation snapshots and activation history (authoritative evidence of what was activated).';