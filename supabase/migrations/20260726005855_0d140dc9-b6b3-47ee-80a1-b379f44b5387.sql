
-- BP3.7 SENSITIVITY ANALYSIS FOUNDATION

CREATE TABLE public.commercial_sensitivity_experiments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  model_version_id uuid NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE RESTRICT,
  baseline_scenario_id uuid NOT NULL REFERENCES public.commercial_scenarios(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','running','completed','failed','archived')),
  assumption_code text NOT NULL,
  included_scopes text[] NOT NULL DEFAULT ARRAY['revenue','pnl','cash']::text[],
  perturbation_strategy text NOT NULL
    CHECK (perturbation_strategy IN ('absolute','pct_delta','increment_list','value_list')),
  perturbation_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  baseline_run_manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  baseline_run_manifest_hash text,
  content_hash text,
  stale_at_creation boolean NOT NULL DEFAULT false,
  warning_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_code text,
  error_message text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_by uuid,
  completed_at timestamptz,
  archived_by uuid,
  archived_at timestamptz
);
CREATE INDEX cse_tenant_program_idx ON public.commercial_sensitivity_experiments(tenant_id, program_id, status);
CREATE INDEX cse_created_idx ON public.commercial_sensitivity_experiments(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_sensitivity_experiments TO authenticated;
GRANT ALL ON public.commercial_sensitivity_experiments TO service_role;
ALTER TABLE public.commercial_sensitivity_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY cse_select ON public.commercial_sensitivity_experiments FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY cse_insert ON public.commercial_sensitivity_experiments FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.sensitivity.create'));
CREATE POLICY cse_update ON public.commercial_sensitivity_experiments FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.sensitivity.create'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.sensitivity.create'));
CREATE POLICY cse_delete ON public.commercial_sensitivity_experiments FOR DELETE TO authenticated
  USING (false);

CREATE TABLE public.commercial_sensitivity_perturbations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  experiment_id uuid NOT NULL REFERENCES public.commercial_sensitivity_experiments(id) ON DELETE CASCADE,
  perturbation_index integer NOT NULL,
  perturbation_label text NOT NULL,
  perturbed_value numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','running','completed','failed','skipped')),
  input_hash text,
  runtime_fingerprint text,
  temp_run_ids jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (experiment_id, perturbation_index)
);
CREATE INDEX csp_experiment_idx ON public.commercial_sensitivity_perturbations(experiment_id, perturbation_index);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_sensitivity_perturbations TO authenticated;
GRANT ALL ON public.commercial_sensitivity_perturbations TO service_role;
ALTER TABLE public.commercial_sensitivity_perturbations ENABLE ROW LEVEL SECURITY;
CREATE POLICY csp_select ON public.commercial_sensitivity_perturbations FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY csp_write ON public.commercial_sensitivity_perturbations FOR ALL TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.sensitivity.execute'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.sensitivity.execute'));

CREATE TABLE public.commercial_sensitivity_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  experiment_id uuid NOT NULL REFERENCES public.commercial_sensitivity_experiments(id) ON DELETE CASCADE,
  perturbation_id uuid NOT NULL REFERENCES public.commercial_sensitivity_perturbations(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL,
  model_version_id uuid NOT NULL,
  run_scope text NOT NULL CHECK (run_scope IN ('revenue','pnl','cash')),
  status text NOT NULL CHECK (status IN ('running','completed','failed')),
  input_hash text NOT NULL,
  runtime_fingerprint text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  error_code text,
  error_message text
);
CREATE INDEX csr_experiment_idx ON public.commercial_sensitivity_runs(experiment_id, run_scope);
GRANT SELECT, INSERT, UPDATE ON public.commercial_sensitivity_runs TO authenticated;
GRANT ALL ON public.commercial_sensitivity_runs TO service_role;
ALTER TABLE public.commercial_sensitivity_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY csrun_select ON public.commercial_sensitivity_runs FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY csrun_write ON public.commercial_sensitivity_runs FOR ALL TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.sensitivity.execute'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.sensitivity.execute'));

CREATE TABLE public.commercial_sensitivity_run_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  sensitivity_run_id uuid NOT NULL REFERENCES public.commercial_sensitivity_runs(id) ON DELETE CASCADE,
  metric_code text NOT NULL,
  metric_group text NOT NULL,
  fiscal_period text,
  period_sequence integer,
  value_numeric numeric,
  value_text text,
  unit text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX csrr_run_metric_idx ON public.commercial_sensitivity_run_results(sensitivity_run_id, metric_code, fiscal_period);
GRANT SELECT, INSERT ON public.commercial_sensitivity_run_results TO authenticated;
GRANT ALL ON public.commercial_sensitivity_run_results TO service_role;
ALTER TABLE public.commercial_sensitivity_run_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY csrr_select ON public.commercial_sensitivity_run_results FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY csrr_insert ON public.commercial_sensitivity_run_results FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.sensitivity.execute'));

CREATE TABLE public.commercial_sensitivity_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  experiment_id uuid NOT NULL REFERENCES public.commercial_sensitivity_experiments(id) ON DELETE CASCADE,
  perturbation_id uuid NOT NULL REFERENCES public.commercial_sensitivity_perturbations(id) ON DELETE CASCADE,
  metric_code text NOT NULL,
  metric_group text NOT NULL,
  fiscal_period text,
  period_sequence integer,
  unit text,
  scope text NOT NULL,
  baseline_value numeric,
  perturbed_value numeric,
  absolute_delta numeric,
  percentage_delta numeric,
  elasticity numeric,
  elasticity_reason text,
  variance_direction text NOT NULL DEFAULT 'not_applicable',
  direction_reason text,
  impact_rank integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cs_results_experiment_idx ON public.commercial_sensitivity_results(experiment_id, metric_code, perturbation_id);
CREATE INDEX cs_results_rank_idx ON public.commercial_sensitivity_results(experiment_id, impact_rank);
GRANT SELECT, INSERT ON public.commercial_sensitivity_results TO authenticated;
GRANT ALL ON public.commercial_sensitivity_results TO service_role;
ALTER TABLE public.commercial_sensitivity_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY csres_select ON public.commercial_sensitivity_results FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY csres_insert ON public.commercial_sensitivity_results FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.sensitivity.execute'));

INSERT INTO public.permissions (code, description, category)
VALUES
  ('commercial.sensitivity.view',    'View sensitivity experiments and results', 'commercial'),
  ('commercial.sensitivity.create',  'Create draft sensitivity experiments',     'commercial'),
  ('commercial.sensitivity.execute', 'Execute sensitivity perturbations',        'commercial'),
  ('commercial.sensitivity.archive', 'Archive completed sensitivity experiments','commercial')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.tenant_role_permissions (tenant_id, role_id, permission_code)
SELECT tr.tenant_id, tr.id, p.code
FROM public.tenant_roles tr
CROSS JOIN (VALUES
  ('commercial.sensitivity.view'),
  ('commercial.sensitivity.create'),
  ('commercial.sensitivity.execute')
) AS p(code)
WHERE tr.name = 'Commercial Analyst'
ON CONFLICT DO NOTHING;

INSERT INTO public.tenant_role_permissions (tenant_id, role_id, permission_code)
SELECT tr.tenant_id, tr.id, p.code
FROM public.tenant_roles tr
CROSS JOIN (VALUES
  ('commercial.sensitivity.view'),
  ('commercial.sensitivity.create'),
  ('commercial.sensitivity.execute'),
  ('commercial.sensitivity.archive')
) AS p(code)
WHERE tr.name = 'Commercial Administrator'
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_header_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('app.commercial_sensitivity_op', true) = 'server' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status IN ('completed','failed','archived') THEN
    RAISE EXCEPTION 'commercial_sensitivity_terminal_immutable (status=%)', OLD.status USING ERRCODE = 'check_violation';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'commercial_sensitivity_status_must_use_rpc' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_cse_guard BEFORE UPDATE OR DELETE ON public.commercial_sensitivity_experiments
  FOR EACH ROW EXECUTE FUNCTION public.commercial_sensitivity_header_guard();

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_child_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_status text;
BEGIN
  IF current_setting('app.commercial_sensitivity_op', true) = 'server' THEN RETURN COALESCE(NEW, OLD); END IF;
  SELECT status INTO v_status FROM public.commercial_sensitivity_experiments
   WHERE id = COALESCE(NEW.experiment_id, OLD.experiment_id);
  IF v_status IN ('completed','failed','archived') THEN
    RAISE EXCEPTION 'commercial_sensitivity_child_immutable (experiment_status=%)', v_status USING ERRCODE = 'check_violation';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_csp_guard BEFORE UPDATE OR DELETE ON public.commercial_sensitivity_perturbations
  FOR EACH ROW EXECUTE FUNCTION public.commercial_sensitivity_child_guard();
CREATE TRIGGER trg_csres_guard BEFORE UPDATE OR DELETE ON public.commercial_sensitivity_results
  FOR EACH ROW EXECUTE FUNCTION public.commercial_sensitivity_child_guard();
CREATE TRIGGER trg_csrun_guard BEFORE DELETE ON public.commercial_sensitivity_runs
  FOR EACH ROW EXECUTE FUNCTION public.commercial_sensitivity_child_guard();

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_list_baseline_runs(
  _program_id uuid, _model_version_id uuid, _scenario_id uuid, _scopes text[]
) RETURNS TABLE(scope text, run_id uuid, input_hash text, completed_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT ON (r.run_scope) r.run_scope, r.id, r.input_hash, r.completed_at
    FROM public.commercial_model_runs r
   WHERE r.program_id = _program_id AND r.model_version_id = _model_version_id
     AND r.scenario_id = _scenario_id AND r.status = 'completed'
     AND r.run_scope = ANY(_scopes) AND r.supersedes_run_id IS NULL
   ORDER BY r.run_scope, r.completed_at DESC;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_list_baseline_runs(uuid,uuid,uuid,text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_list_baseline_runs(uuid,uuid,uuid,text[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_create(
  _program_id uuid, _model_version_id uuid, _baseline_scenario_id uuid,
  _assumption_code text, _included_scopes text[], _perturbation_strategy text,
  _perturbation_config jsonb, _title text, _description text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tenant uuid; v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT tenant_id INTO v_tenant FROM public.commercial_programs WHERE id = _program_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'program_not_found'; END IF;
  IF NOT public.commercial_can_write(v_tenant, 'commercial.sensitivity.create') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF _perturbation_strategy NOT IN ('absolute','pct_delta','increment_list','value_list') THEN
    RAISE EXCEPTION 'invalid_strategy';
  END IF;
  IF _title IS NULL OR btrim(_title) = '' THEN RAISE EXCEPTION 'title_required'; END IF;
  IF _assumption_code IS NULL OR btrim(_assumption_code) = '' THEN RAISE EXCEPTION 'assumption_required'; END IF;
  PERFORM set_config('app.commercial_sensitivity_op','server', true);
  INSERT INTO public.commercial_sensitivity_experiments (
    tenant_id, program_id, model_version_id, baseline_scenario_id,
    title, description, assumption_code, included_scopes,
    perturbation_strategy, perturbation_config, created_by, updated_by
  ) VALUES (
    v_tenant, _program_id, _model_version_id, _baseline_scenario_id,
    _title, _description, _assumption_code,
    COALESCE(_included_scopes, ARRAY['revenue','pnl','cash']::text[]),
    _perturbation_strategy, COALESCE(_perturbation_config,'{}'::jsonb),
    auth.uid(), auth.uid()
  ) RETURNING id INTO v_id;
  PERFORM set_config('app.commercial_sensitivity_op','', true);
  PERFORM public.emit_audit_event(v_tenant, 'commercial.sensitivity.created'::text,
    'commercial_sensitivity_experiment'::text, v_id::text, NULL::jsonb,
    jsonb_build_object('assumption', _assumption_code, 'strategy', _perturbation_strategy,
                       'baseline_scenario_id', _baseline_scenario_id, 'scopes', _included_scopes),
    NULL::text, '{}'::jsonb);
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_create(uuid,uuid,uuid,text,text[],text,jsonb,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_create(uuid,uuid,uuid,text,text[],text,jsonb,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_update_draft(
  _experiment_id uuid, _title text, _description text,
  _included_scopes text[], _perturbation_strategy text, _perturbation_config jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_sensitivity_experiments;
BEGIN
  SELECT * INTO v_row FROM public.commercial_sensitivity_experiments WHERE id = _experiment_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'experiment_not_found'; END IF;
  IF NOT public.commercial_can_write(v_row.tenant_id, 'commercial.sensitivity.create') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_row.status <> 'draft' THEN RAISE EXCEPTION 'experiment_not_draft'; END IF;
  PERFORM set_config('app.commercial_sensitivity_op','server', true);
  UPDATE public.commercial_sensitivity_experiments
     SET title = COALESCE(_title, title), description = _description,
         included_scopes = COALESCE(_included_scopes, included_scopes),
         perturbation_strategy = COALESCE(_perturbation_strategy, perturbation_strategy),
         perturbation_config = COALESCE(_perturbation_config, perturbation_config),
         updated_at = now(), updated_by = auth.uid()
   WHERE id = _experiment_id;
  PERFORM set_config('app.commercial_sensitivity_op','', true);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_update_draft(uuid,text,text,text[],text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_update_draft(uuid,text,text,text[],text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_readiness(_experiment_id uuid)
RETURNS TABLE(scope text, is_stale boolean, latest_run_id uuid, latest_completed_at timestamptz, is_missing boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_sensitivity_experiments;
BEGIN
  SELECT * INTO v_row FROM public.commercial_sensitivity_experiments WHERE id = _experiment_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'experiment_not_found'; END IF;
  RETURN QUERY
    SELECT s.scope, COALESCE(st.is_stale, true), st.latest_run_id, st.latest_completed_at,
           (st.latest_run_id IS NULL)
      FROM unnest(v_row.included_scopes) AS s(scope)
      LEFT JOIN public.commercial_program_run_staleness st
             ON st.program_id = v_row.program_id
            AND st.model_version_id = v_row.model_version_id
            AND st.scenario_id = v_row.baseline_scenario_id
            AND st.scope = s.scope;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_readiness(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_readiness(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_build_manifest(_experiment_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_sensitivity_experiments; v_manifest jsonb := '{}'::jsonb; v_rec record;
BEGIN
  SELECT * INTO v_row FROM public.commercial_sensitivity_experiments WHERE id = _experiment_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'experiment_not_found'; END IF;
  FOR v_rec IN
    SELECT scope, run_id, input_hash, completed_at
      FROM public.commercial_sensitivity_list_baseline_runs(
        v_row.program_id, v_row.model_version_id, v_row.baseline_scenario_id, v_row.included_scopes)
  LOOP
    v_manifest := v_manifest || jsonb_build_object(v_rec.scope,
      jsonb_build_object('run_id', v_rec.run_id, 'input_hash', v_rec.input_hash,
                         'completed_at', v_rec.completed_at, 'status','completed'));
  END LOOP;
  FOR v_rec IN SELECT s.scope FROM unnest(v_row.included_scopes) s(scope) LOOP
    IF NOT (v_manifest ? v_rec.scope) THEN
      v_manifest := v_manifest || jsonb_build_object(v_rec.scope, jsonb_build_object('status','missing'));
    END IF;
  END LOOP;
  RETURN v_manifest;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_build_manifest(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_build_manifest(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_start_execution(_experiment_id uuid, _perturbations jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_sensitivity_experiments; v_manifest jsonb; v_manifest_hash text;
        v_stale boolean := false; v_p jsonb; v_idx int := 0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_row FROM public.commercial_sensitivity_experiments WHERE id = _experiment_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'experiment_not_found'; END IF;
  IF NOT public.commercial_can_write(v_row.tenant_id, 'commercial.sensitivity.execute') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_row.status <> 'draft' THEN RAISE EXCEPTION 'experiment_not_draft'; END IF;
  IF jsonb_array_length(COALESCE(_perturbations,'[]'::jsonb)) = 0 THEN RAISE EXCEPTION 'no_perturbations'; END IF;
  v_manifest := public.commercial_sensitivity_build_manifest(_experiment_id);
  IF (SELECT bool_or((v->>'status') = 'missing') FROM jsonb_each(v_manifest) x(k,v)) THEN
    RAISE EXCEPTION 'baseline_runs_missing';
  END IF;
  v_manifest_hash := encode(extensions.digest(convert_to(v_manifest::text,'UTF8'),'sha256'::text),'hex');
  SELECT bool_or(is_stale) INTO v_stale FROM public.commercial_sensitivity_readiness(_experiment_id);
  PERFORM set_config('app.commercial_sensitivity_op','server', true);
  UPDATE public.commercial_sensitivity_experiments
     SET status = 'running', baseline_run_manifest = v_manifest,
         baseline_run_manifest_hash = v_manifest_hash,
         stale_at_creation = COALESCE(v_stale,false),
         updated_at = now(), updated_by = auth.uid()
   WHERE id = _experiment_id;
  FOR v_p IN SELECT jsonb_array_elements(_perturbations) LOOP
    INSERT INTO public.commercial_sensitivity_perturbations
      (tenant_id, experiment_id, perturbation_index, perturbation_label, perturbed_value)
    VALUES (v_row.tenant_id, _experiment_id, v_idx,
            COALESCE(v_p->>'label', v_p->>'value'), (v_p->>'value')::numeric);
    v_idx := v_idx + 1;
  END LOOP;
  PERFORM set_config('app.commercial_sensitivity_op','', true);
  PERFORM public.emit_audit_event(v_row.tenant_id, 'commercial.sensitivity.executed'::text,
    'commercial_sensitivity_experiment'::text, _experiment_id::text, NULL::jsonb,
    jsonb_build_object('perturbation_count', v_idx, 'manifest_hash', v_manifest_hash, 'stale_at_creation', v_stale),
    NULL::text, '{}'::jsonb);
  RETURN jsonb_build_object('experiment_id', _experiment_id, 'perturbation_count', v_idx,
    'manifest_hash', v_manifest_hash, 'stale_at_creation', v_stale);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_start_execution(uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_start_execution(uuid,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_record_perturbation_run(
  _perturbation_id uuid, _run_scope text, _input_hash text, _runtime_fingerprint text, _results jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_p public.commercial_sensitivity_perturbations; v_exp public.commercial_sensitivity_experiments;
        v_run_id uuid; v_r jsonb; v_temp jsonb;
BEGIN
  SELECT * INTO v_p FROM public.commercial_sensitivity_perturbations WHERE id = _perturbation_id;
  IF v_p.id IS NULL THEN RAISE EXCEPTION 'perturbation_not_found'; END IF;
  SELECT * INTO v_exp FROM public.commercial_sensitivity_experiments WHERE id = v_p.experiment_id;
  IF NOT public.commercial_can_write(v_exp.tenant_id, 'commercial.sensitivity.execute') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_exp.status <> 'running' THEN RAISE EXCEPTION 'experiment_not_running'; END IF;
  PERFORM set_config('app.commercial_sensitivity_op','server', true);
  INSERT INTO public.commercial_sensitivity_runs
    (tenant_id, experiment_id, perturbation_id, scenario_id, model_version_id,
     run_scope, status, input_hash, runtime_fingerprint, completed_at)
  VALUES (v_exp.tenant_id, v_exp.id, _perturbation_id, v_exp.baseline_scenario_id,
          v_exp.model_version_id, _run_scope, 'completed',
          _input_hash, _runtime_fingerprint, now())
  RETURNING id INTO v_run_id;
  FOR v_r IN SELECT jsonb_array_elements(_results) LOOP
    INSERT INTO public.commercial_sensitivity_run_results
      (tenant_id, sensitivity_run_id, metric_code, metric_group, fiscal_period,
       period_sequence, value_numeric, value_text, unit)
    VALUES (v_exp.tenant_id, v_run_id, v_r->>'metric_code', COALESCE(v_r->>'metric_group','GENERAL'),
            v_r->>'fiscal_period', (v_r->>'period_sequence')::int,
            NULLIF(v_r->>'value_numeric','')::numeric, v_r->>'value_text', v_r->>'unit');
  END LOOP;
  v_temp := COALESCE(v_p.temp_run_ids,'{}'::jsonb) || jsonb_build_object(_run_scope, v_run_id);
  UPDATE public.commercial_sensitivity_perturbations
     SET status = 'running', temp_run_ids = v_temp,
         input_hash = _input_hash, runtime_fingerprint = _runtime_fingerprint,
         started_at = COALESCE(started_at, now())
   WHERE id = _perturbation_id;
  PERFORM set_config('app.commercial_sensitivity_op','', true);
  RETURN v_run_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_record_perturbation_run(uuid,text,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_record_perturbation_run(uuid,text,text,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_compute_hash(_experiment_id uuid)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_sensitivity_experiments; v_rows jsonb; v_payload text;
BEGIN
  SELECT * INTO v_row FROM public.commercial_sensitivity_experiments WHERE id = _experiment_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'experiment_not_found'; END IF;
  SELECT jsonb_agg(to_jsonb(r) ORDER BY metric_code, fiscal_period, perturbation_id)
    INTO v_rows FROM public.commercial_sensitivity_results r WHERE experiment_id = _experiment_id;
  v_payload := concat_ws('|', 'v1', v_row.tenant_id::text, v_row.program_id::text,
    v_row.model_version_id::text, v_row.baseline_scenario_id::text,
    v_row.assumption_code, v_row.perturbation_strategy, v_row.perturbation_config::text,
    array_to_string(v_row.included_scopes,','),
    COALESCE(v_row.baseline_run_manifest::text,''), COALESCE(v_rows::text,'[]'));
  RETURN encode(extensions.digest(convert_to(v_payload,'UTF8'),'sha256'::text),'hex');
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_compute_hash(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_compute_hash(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_finalize(_experiment_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_exp public.commercial_sensitivity_experiments; v_baseline numeric; v_count int := 0; v_hash text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_exp FROM public.commercial_sensitivity_experiments WHERE id = _experiment_id;
  IF v_exp.id IS NULL THEN RAISE EXCEPTION 'experiment_not_found'; END IF;
  IF NOT public.commercial_can_write(v_exp.tenant_id, 'commercial.sensitivity.execute') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_exp.status <> 'running' THEN RAISE EXCEPTION 'experiment_not_running'; END IF;
  PERFORM set_config('app.commercial_sensitivity_op','server', true);
  SELECT numeric_value INTO v_baseline FROM public.commercial_scenario_assumptions
   WHERE scenario_id = v_exp.baseline_scenario_id AND assumption_code = v_exp.assumption_code;
  DELETE FROM public.commercial_sensitivity_results WHERE experiment_id = _experiment_id;
  INSERT INTO public.commercial_sensitivity_results
    (tenant_id, experiment_id, perturbation_id, metric_code, metric_group,
     fiscal_period, period_sequence, unit, scope, baseline_value, perturbed_value,
     absolute_delta, percentage_delta, elasticity, elasticity_reason,
     variance_direction, direction_reason)
  SELECT v_exp.tenant_id, _experiment_id, p.id, pr.metric_code, pr.metric_group,
    pr.fiscal_period, pr.period_sequence, pr.unit, sr.run_scope,
    br.value_numeric, pr.value_numeric, (pr.value_numeric - br.value_numeric),
    CASE WHEN br.value_numeric IS NULL OR pr.value_numeric IS NULL THEN NULL
         WHEN br.value_numeric = 0 AND pr.value_numeric = 0 THEN 0
         WHEN br.value_numeric = 0 THEN NULL
         ELSE (pr.value_numeric - br.value_numeric)/abs(br.value_numeric) END,
    CASE WHEN v_baseline IS NULL OR v_baseline = 0 THEN NULL
         WHEN br.value_numeric IS NULL OR br.value_numeric = 0 THEN NULL
         WHEN p.perturbed_value = v_baseline THEN NULL
         ELSE ((pr.value_numeric - br.value_numeric)/abs(br.value_numeric))
            / ((p.perturbed_value - v_baseline)/abs(v_baseline)) END,
    CASE WHEN v_baseline IS NULL OR v_baseline = 0 THEN 'undefined_zero_baseline_input'
         WHEN br.value_numeric IS NULL OR br.value_numeric = 0 THEN 'undefined_zero_baseline_output'
         WHEN p.perturbed_value = v_baseline THEN 'undefined_zero_input_delta'
         ELSE NULL END,
    COALESCE(
      CASE WHEN (pr.value_numeric - br.value_numeric) = 0 THEN 'neutral'
           WHEN dm.higher_is_favorable IS NULL THEN 'not_applicable'
           WHEN (pr.value_numeric - br.value_numeric) > 0 AND dm.higher_is_favorable THEN 'favorable'
           WHEN (pr.value_numeric - br.value_numeric) < 0 AND dm.higher_is_favorable THEN 'unfavorable'
           WHEN (pr.value_numeric - br.value_numeric) > 0 AND NOT dm.higher_is_favorable THEN 'unfavorable'
           WHEN (pr.value_numeric - br.value_numeric) < 0 AND NOT dm.higher_is_favorable THEN 'favorable'
           ELSE 'not_applicable' END, 'not_applicable'),
    CASE WHEN dm.higher_is_favorable IS NULL THEN 'no_directionality_metadata' ELSE NULL END
    FROM public.commercial_sensitivity_perturbations p
    JOIN public.commercial_sensitivity_runs sr ON sr.perturbation_id = p.id
    JOIN public.commercial_sensitivity_run_results pr ON pr.sensitivity_run_id = sr.id
    LEFT JOIN LATERAL (
      SELECT r.value_numeric FROM public.commercial_model_results r
       WHERE r.run_id = ((v_exp.baseline_run_manifest -> sr.run_scope) ->> 'run_id')::uuid
         AND r.metric_code = pr.metric_code
         AND r.fiscal_period IS NOT DISTINCT FROM pr.fiscal_period LIMIT 1
    ) br ON true
    LEFT JOIN public.commercial_metric_directionality dm ON dm.metric_code = pr.metric_code
   WHERE p.experiment_id = _experiment_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  WITH ranked AS (
    SELECT id, RANK() OVER (PARTITION BY metric_code, fiscal_period
      ORDER BY abs(COALESCE(absolute_delta,0)) DESC) AS r
    FROM public.commercial_sensitivity_results WHERE experiment_id = _experiment_id
  )
  UPDATE public.commercial_sensitivity_results t SET impact_rank = ranked.r
    FROM ranked WHERE ranked.id = t.id;
  UPDATE public.commercial_sensitivity_perturbations
     SET status = 'completed', completed_at = now()
   WHERE experiment_id = _experiment_id AND status <> 'failed';
  v_hash := public.commercial_sensitivity_compute_hash(_experiment_id);
  UPDATE public.commercial_sensitivity_experiments
     SET status = 'completed', content_hash = v_hash, completed_at = now(),
         completed_by = auth.uid(), updated_at = now(), updated_by = auth.uid()
   WHERE id = _experiment_id;
  PERFORM set_config('app.commercial_sensitivity_op','', true);
  PERFORM public.emit_audit_event(v_exp.tenant_id, 'commercial.sensitivity.completed'::text,
    'commercial_sensitivity_experiment'::text, _experiment_id::text, NULL::jsonb,
    jsonb_build_object('result_count', v_count, 'content_hash', v_hash,
                       'manifest_hash', v_exp.baseline_run_manifest_hash),
    NULL::text, '{}'::jsonb);
  RETURN jsonb_build_object('experiment_id', _experiment_id, 'status','completed',
    'result_count', v_count, 'content_hash', v_hash);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_finalize(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_finalize(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_fail(_experiment_id uuid, _error_code text, _error_message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_sensitivity_experiments;
BEGIN
  SELECT * INTO v_row FROM public.commercial_sensitivity_experiments WHERE id = _experiment_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'experiment_not_found'; END IF;
  IF NOT public.commercial_can_write(v_row.tenant_id, 'commercial.sensitivity.execute') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  PERFORM set_config('app.commercial_sensitivity_op','server', true);
  UPDATE public.commercial_sensitivity_experiments
     SET status = 'failed', error_code = _error_code,
         error_message = left(COALESCE(_error_message,''),1000),
         updated_at = now(), updated_by = auth.uid()
   WHERE id = _experiment_id;
  PERFORM set_config('app.commercial_sensitivity_op','', true);
  PERFORM public.emit_audit_event(v_row.tenant_id, 'commercial.sensitivity.failed'::text,
    'commercial_sensitivity_experiment'::text, _experiment_id::text, NULL::jsonb,
    jsonb_build_object('error_code', _error_code), NULL::text, '{}'::jsonb);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_fail(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_fail(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.commercial_sensitivity_archive(_experiment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_sensitivity_experiments;
BEGIN
  SELECT * INTO v_row FROM public.commercial_sensitivity_experiments WHERE id = _experiment_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'experiment_not_found'; END IF;
  IF NOT public.commercial_can_write(v_row.tenant_id, 'commercial.sensitivity.archive') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_row.status NOT IN ('completed','failed') THEN
    RAISE EXCEPTION 'archive_requires_terminal_status (status=%)', v_row.status;
  END IF;
  PERFORM set_config('app.commercial_sensitivity_op','server', true);
  UPDATE public.commercial_sensitivity_experiments
     SET status='archived', archived_at=now(), archived_by=auth.uid()
   WHERE id = _experiment_id;
  PERFORM set_config('app.commercial_sensitivity_op','', true);
  PERFORM public.emit_audit_event(v_row.tenant_id, 'commercial.sensitivity.archived'::text,
    'commercial_sensitivity_experiment'::text, _experiment_id::text, NULL::jsonb,
    jsonb_build_object('content_hash', v_row.content_hash), NULL::text, '{}'::jsonb);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_sensitivity_archive(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_sensitivity_archive(uuid) TO authenticated;
