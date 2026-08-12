
-- ============================================================================
-- BP3.1 — Commercial Model Runtime Foundation
-- ============================================================================

-- 1. PERMISSIONS ------------------------------------------------------------
INSERT INTO public.permissions (code, category, description, is_system, required_for_tenant_administration) VALUES
  ('commercial.model.run',        'commercial', 'Execute Commercial model runs (scenario calculation runtime).', true, false),
  ('commercial.model.manage',     'commercial', 'Create, edit, and lifecycle Commercial model versions.',        true, false),
  ('commercial.sensitivity.run',  'commercial', 'Execute Commercial sensitivity analyses.',                       true, false)
ON CONFLICT (code) DO NOTHING;

-- Grant to Commercial Administrator (all 3) and Commercial Analyst (run + sensitivity)
INSERT INTO public.tenant_role_permissions (tenant_id, role_id, permission_code, assigned_at)
SELECT r.tenant_id, r.id, p.code, now()
FROM public.tenant_roles r
CROSS JOIN (VALUES
  ('commercial_admin','commercial.model.run'),
  ('commercial_admin','commercial.model.manage'),
  ('commercial_admin','commercial.sensitivity.run'),
  ('commercial_analyst','commercial.model.run'),
  ('commercial_analyst','commercial.sensitivity.run')
) AS p(role_code, code)
WHERE r.code = p.role_code
ON CONFLICT (role_id, permission_code) DO NOTHING;

-- 2. TABLE: commercial_model_versions --------------------------------------
CREATE TABLE public.commercial_model_versions (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id                uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  version_code              text NOT NULL,
  name                      text NOT NULL,
  source_file_name          text,
  source_fingerprint        text,
  formula_catalog_version   text NOT NULL,
  status                    text NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','active','superseded','retired')),
  effective_from            timestamptz,
  notes                     text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  created_by                uuid,
  updated_by                uuid,
  UNIQUE (tenant_id, program_id, version_code)
);
CREATE UNIQUE INDEX commercial_model_versions_one_active_per_program
  ON public.commercial_model_versions (tenant_id, program_id)
  WHERE status = 'active';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_model_versions TO authenticated;
GRANT ALL ON public.commercial_model_versions TO service_role;
ALTER TABLE public.commercial_model_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cmv_select" ON public.commercial_model_versions FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY "cmv_insert" ON public.commercial_model_versions FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.model.manage'));
CREATE POLICY "cmv_update" ON public.commercial_model_versions FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.model.manage'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.model.manage'));
CREATE POLICY "cmv_delete" ON public.commercial_model_versions FOR DELETE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.model.manage'));

-- Same-tenant program linkage
CREATE OR REPLACE FUNCTION public.commercial_enforce_same_tenant_program()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE v uuid;
BEGIN
  SELECT tenant_id INTO v FROM public.commercial_programs WHERE id = NEW.program_id;
  IF v IS NULL OR v <> NEW.tenant_id THEN
    RAISE EXCEPTION 'commercial_cross_tenant_program_link';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_cmv_actor        BEFORE INSERT OR UPDATE ON public.commercial_model_versions
  FOR EACH ROW EXECUTE FUNCTION public.commercial_set_actor_and_timestamp();
CREATE TRIGGER trg_cmv_same_tenant  BEFORE INSERT OR UPDATE ON public.commercial_model_versions
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_program();

-- 3. TABLE: commercial_model_runs ------------------------------------------
CREATE TABLE public.commercial_model_runs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id         uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  scenario_id        uuid NOT NULL REFERENCES public.commercial_scenarios(id) ON DELETE CASCADE,
  model_version_id   uuid NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE RESTRICT,
  run_scope          text NOT NULL CHECK (run_scope IN ('revenue','pnl','cash','full','sensitivity')),
  status             text NOT NULL DEFAULT 'queued'
                       CHECK (status IN ('queued','running','completed','failed','superseded')),
  input_hash         text NOT NULL,
  started_at         timestamptz,
  completed_at       timestamptz,
  failed_at          timestamptz,
  error_code         text,
  error_message      text,
  supersedes_run_id  uuid REFERENCES public.commercial_model_runs(id),
  created_by         uuid,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX commercial_model_runs_idem
  ON public.commercial_model_runs (tenant_id, program_id, scenario_id, model_version_id, run_scope, input_hash, status);

GRANT SELECT ON public.commercial_model_runs TO authenticated;
GRANT ALL   ON public.commercial_model_runs TO service_role;
ALTER TABLE public.commercial_model_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cmr_select" ON public.commercial_model_runs FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
-- No INSERT/UPDATE/DELETE policies: all writes must go through SECURITY DEFINER runtime functions.

CREATE OR REPLACE FUNCTION public.commercial_enforce_same_tenant_run_refs()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE vp uuid; vs uuid; vv uuid;
BEGIN
  SELECT tenant_id INTO vp FROM public.commercial_programs         WHERE id = NEW.program_id;
  SELECT tenant_id INTO vs FROM public.commercial_scenarios        WHERE id = NEW.scenario_id;
  SELECT tenant_id INTO vv FROM public.commercial_model_versions   WHERE id = NEW.model_version_id;
  IF vp IS NULL OR vp <> NEW.tenant_id OR vs <> NEW.tenant_id OR vv <> NEW.tenant_id THEN
    RAISE EXCEPTION 'commercial_cross_tenant_run_link';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_cmr_same_tenant BEFORE INSERT OR UPDATE ON public.commercial_model_runs
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_run_refs();

-- Header immutability: once completed/failed, only allow status → superseded
CREATE OR REPLACE FUNCTION public.commercial_model_run_header_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IN ('completed','failed','superseded') THEN
      IF NEW.status = 'superseded' AND OLD.status <> 'superseded'
         AND NEW.id = OLD.id AND NEW.tenant_id = OLD.tenant_id
         AND NEW.program_id = OLD.program_id AND NEW.scenario_id = OLD.scenario_id
         AND NEW.model_version_id = OLD.model_version_id
         AND NEW.run_scope = OLD.run_scope AND NEW.input_hash = OLD.input_hash
         AND NEW.started_at IS NOT DISTINCT FROM OLD.started_at
         AND NEW.completed_at IS NOT DISTINCT FROM OLD.completed_at THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'commercial_run_immutable_after_terminal_state';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('completed','failed','superseded') THEN
      RAISE EXCEPTION 'commercial_run_immutable_after_terminal_state';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_cmr_guard BEFORE UPDATE OR DELETE ON public.commercial_model_runs
  FOR EACH ROW EXECUTE FUNCTION public.commercial_model_run_header_guard();

-- 4. TABLE: commercial_model_run_inputs -----------------------------------
CREATE TABLE public.commercial_model_run_inputs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  run_id                uuid NOT NULL REFERENCES public.commercial_model_runs(id) ON DELETE CASCADE,
  scenario_id           uuid NOT NULL REFERENCES public.commercial_scenarios(id) ON DELETE CASCADE,
  assumption_code       text NOT NULL,
  value_numeric         numeric,
  value_text            text,
  unit                  text,
  source_reference_id   uuid REFERENCES public.commercial_source_references(id),
  confidence            text,
  input_sequence        integer NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, assumption_code)
);
GRANT SELECT ON public.commercial_model_run_inputs TO authenticated;
GRANT ALL   ON public.commercial_model_run_inputs TO service_role;
ALTER TABLE public.commercial_model_run_inputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cmri_select" ON public.commercial_model_run_inputs FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
-- No client writes.

CREATE OR REPLACE FUNCTION public.commercial_enforce_same_tenant_run_input()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE vr uuid; vs uuid;
BEGIN
  SELECT tenant_id INTO vr FROM public.commercial_model_runs   WHERE id = NEW.run_id;
  SELECT tenant_id INTO vs FROM public.commercial_scenarios    WHERE id = NEW.scenario_id;
  IF vr IS NULL OR vr <> NEW.tenant_id OR vs <> NEW.tenant_id THEN
    RAISE EXCEPTION 'commercial_cross_tenant_run_input_link';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_cmri_same_tenant BEFORE INSERT OR UPDATE ON public.commercial_model_run_inputs
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_run_input();

-- Immutability: inputs frozen once run is not queued
CREATE OR REPLACE FUNCTION public.commercial_model_run_input_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE s text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT status INTO s FROM public.commercial_model_runs WHERE id = NEW.run_id;
    IF s IS NULL OR s <> 'queued' THEN
      RAISE EXCEPTION 'commercial_run_inputs_locked (status=%)', s;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    SELECT status INTO s FROM public.commercial_model_runs WHERE id = OLD.run_id;
    IF s <> 'queued' THEN
      RAISE EXCEPTION 'commercial_run_inputs_locked (status=%)', s;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT status INTO s FROM public.commercial_model_runs WHERE id = OLD.run_id;
    IF s <> 'queued' THEN
      RAISE EXCEPTION 'commercial_run_inputs_locked (status=%)', s;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_cmri_guard BEFORE INSERT OR UPDATE OR DELETE ON public.commercial_model_run_inputs
  FOR EACH ROW EXECUTE FUNCTION public.commercial_model_run_input_guard();

-- 5. TABLE: commercial_model_results --------------------------------------
CREATE TABLE public.commercial_model_results (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  run_id             uuid NOT NULL REFERENCES public.commercial_model_runs(id) ON DELETE CASCADE,
  metric_code        text NOT NULL,
  metric_group       text NOT NULL,
  formula_code       text NOT NULL,
  fiscal_period      text,
  period_sequence    integer,
  value_numeric      numeric,
  value_text         text,
  unit               text,
  lineage_json       jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_approximation   boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX commercial_model_results_run_metric
  ON public.commercial_model_results (run_id, metric_code, period_sequence);

GRANT SELECT ON public.commercial_model_results TO authenticated;
GRANT ALL   ON public.commercial_model_results TO service_role;
ALTER TABLE public.commercial_model_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cmres_select" ON public.commercial_model_results FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
-- Explicit deny: no INSERT/UPDATE/DELETE policies for authenticated. Runtime uses SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.commercial_enforce_same_tenant_result()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE vr uuid;
BEGIN
  SELECT tenant_id INTO vr FROM public.commercial_model_runs WHERE id = NEW.run_id;
  IF vr IS NULL OR vr <> NEW.tenant_id THEN
    RAISE EXCEPTION 'commercial_cross_tenant_result_link';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_cmres_same_tenant BEFORE INSERT OR UPDATE ON public.commercial_model_results
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_result();

-- Result immutability guard: once run completed, results are frozen
CREATE OR REPLACE FUNCTION public.commercial_model_result_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE s text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT status INTO s FROM public.commercial_model_runs WHERE id = NEW.run_id;
    IF s IS NULL OR s NOT IN ('running') THEN
      RAISE EXCEPTION 'commercial_results_only_writable_while_running (status=%)', s;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    SELECT status INTO s FROM public.commercial_model_runs WHERE id = OLD.run_id;
    IF s IN ('completed','failed','superseded') THEN
      RAISE EXCEPTION 'commercial_results_immutable (status=%)', s;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT status INTO s FROM public.commercial_model_runs WHERE id = OLD.run_id;
    IF s IN ('completed','failed','superseded') THEN
      RAISE EXCEPTION 'commercial_results_immutable (status=%)', s;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_cmres_guard BEFORE INSERT OR UPDATE OR DELETE ON public.commercial_model_results
  FOR EACH ROW EXECUTE FUNCTION public.commercial_model_result_guard();

-- 6. INPUT HASH (deterministic) --------------------------------------------
CREATE OR REPLACE FUNCTION public.commercial_compute_input_hash(
  _model_version_id uuid,
  _scenario_id uuid,
  _run_scope text,
  _formula_catalog_version text,
  _inputs jsonb  -- array of {assumption_code,value_numeric,value_text,unit}
) RETURNS text
LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public' AS $$
DECLARE
  canonical text;
BEGIN
  SELECT
    _model_version_id::text || '|' || _scenario_id::text || '|' || _run_scope || '|' || _formula_catalog_version || '|' ||
    string_agg(
      (elem->>'assumption_code') || '=' ||
      COALESCE( trim(trailing '0' from trim(trailing '.' from to_char((elem->>'value_numeric')::numeric, 'FM999999999999999990.000000000000'))),
                '' ) || ':' ||
      COALESCE(elem->>'value_text','') || ':' ||
      COALESCE(elem->>'unit',''),
      ';' ORDER BY (elem->>'assumption_code')
    )
  INTO canonical
  FROM jsonb_array_elements(COALESCE(_inputs,'[]'::jsonb)) elem;
  RETURN md5(COALESCE(canonical,''));
END $$;

-- 7. RUNTIME SERVER FUNCTIONS ---------------------------------------------

-- Snapshot scenario assumptions as JSONB (used by callers to build the hash & inputs)
CREATE OR REPLACE FUNCTION public.commercial_snapshot_scenario_assumptions(_scenario_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'assumption_code', a.assumption_code,
    'value_numeric',   a.numeric_value,
    'value_text',      a.text_value,
    'unit',            a.unit,
    'source_reference_id', a.source_reference_id,
    'confidence',      a.confidence
  ) ORDER BY a.assumption_code), '[]'::jsonb)
  FROM public.commercial_scenario_assumptions a
  WHERE a.scenario_id = _scenario_id
    AND public.commercial_is_member_with_view(a.tenant_id);
$$;

-- Create or reuse a run
CREATE OR REPLACE FUNCTION public.commercial_model_run_start(
  _program_id uuid,
  _scenario_id uuid,
  _model_version_id uuid,
  _run_scope text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_tenant uuid;
  v_perm text := CASE WHEN _run_scope = 'sensitivity' THEN 'commercial.sensitivity.run' ELSE 'commercial.model.run' END;
  v_inputs jsonb;
  v_hash text;
  v_catalog text;
  v_existing uuid;
  v_run_id uuid;
  v_seq int := 0;
  elem jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;

  SELECT tenant_id INTO v_tenant FROM public.commercial_programs WHERE id = _program_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'program_not_found'; END IF;

  IF NOT public.commercial_can_write(v_tenant, v_perm) THEN
    RAISE EXCEPTION 'permission_denied: %', v_perm;
  END IF;

  IF _run_scope NOT IN ('revenue','pnl','cash','full','sensitivity') THEN
    RAISE EXCEPTION 'invalid_run_scope';
  END IF;

  SELECT formula_catalog_version INTO v_catalog
  FROM public.commercial_model_versions
  WHERE id = _model_version_id AND tenant_id = v_tenant;
  IF v_catalog IS NULL THEN RAISE EXCEPTION 'model_version_not_found'; END IF;

  v_inputs := public.commercial_snapshot_scenario_assumptions(_scenario_id);
  v_hash   := public.commercial_compute_input_hash(_model_version_id, _scenario_id, _run_scope, v_catalog, v_inputs);

  -- Idempotency: return existing completed run
  SELECT id INTO v_existing
  FROM public.commercial_model_runs
  WHERE tenant_id = v_tenant
    AND program_id = _program_id
    AND scenario_id = _scenario_id
    AND model_version_id = _model_version_id
    AND run_scope = _run_scope
    AND input_hash = v_hash
    AND status = 'completed'
  ORDER BY completed_at DESC
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('run_id', v_existing, 'reused', true, 'input_hash', v_hash);
  END IF;

  INSERT INTO public.commercial_model_runs(
    tenant_id, program_id, scenario_id, model_version_id, run_scope, status, input_hash, created_by
  ) VALUES (v_tenant, _program_id, _scenario_id, _model_version_id, _run_scope, 'queued', v_hash, auth.uid())
  RETURNING id INTO v_run_id;

  -- Snapshot inputs (allowed only while queued)
  FOR elem IN SELECT jsonb_array_elements(v_inputs) LOOP
    v_seq := v_seq + 1;
    INSERT INTO public.commercial_model_run_inputs(
      tenant_id, run_id, scenario_id, assumption_code, value_numeric, value_text, unit,
      source_reference_id, confidence, input_sequence
    ) VALUES (
      v_tenant, v_run_id, _scenario_id,
      elem->>'assumption_code',
      NULLIF(elem->>'value_numeric','')::numeric,
      elem->>'value_text',
      elem->>'unit',
      NULLIF(elem->>'source_reference_id','')::uuid,
      elem->>'confidence',
      v_seq
    );
  END LOOP;

  PERFORM public.emit_audit_event(v_tenant, 'commercial.model.run.created', 'commercial_model_run', v_run_id::text,
    NULL, jsonb_build_object('run_scope', _run_scope, 'input_hash', v_hash, 'scenario_id', _scenario_id, 'model_version_id', _model_version_id), NULL, '{}'::jsonb);

  RETURN jsonb_build_object('run_id', v_run_id, 'reused', false, 'input_hash', v_hash);
END $$;

-- Mark running
CREATE OR REPLACE FUNCTION public.commercial_model_run_mark_running(_run_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_tenant uuid; v_status text; v_scope text;
BEGIN
  SELECT tenant_id, status, run_scope INTO v_tenant, v_status, v_scope FROM public.commercial_model_runs WHERE id = _run_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'run_not_found'; END IF;
  IF NOT public.commercial_can_write(v_tenant, CASE WHEN v_scope='sensitivity' THEN 'commercial.sensitivity.run' ELSE 'commercial.model.run' END) THEN
    RAISE EXCEPTION 'permission_denied';
  END IF;
  IF v_status <> 'queued' THEN RAISE EXCEPTION 'invalid_transition: % -> running', v_status; END IF;
  UPDATE public.commercial_model_runs SET status='running', started_at=now() WHERE id = _run_id;
  PERFORM public.emit_audit_event(v_tenant, 'commercial.model.run.started', 'commercial_model_run', _run_id::text, NULL, NULL, NULL, '{}'::jsonb);
END $$;

-- Persist result (SECURITY DEFINER — only path)
CREATE OR REPLACE FUNCTION public.commercial_model_run_persist_result(
  _run_id uuid,
  _metric_code text,
  _metric_group text,
  _formula_code text,
  _fiscal_period text,
  _period_sequence int,
  _value_numeric numeric,
  _value_text text,
  _unit text,
  _lineage jsonb,
  _is_approximation boolean
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_tenant uuid; v_status text; v_scope text; v_id uuid;
BEGIN
  SELECT tenant_id, status, run_scope INTO v_tenant, v_status, v_scope FROM public.commercial_model_runs WHERE id = _run_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'run_not_found'; END IF;
  IF NOT public.commercial_can_write(v_tenant, CASE WHEN v_scope='sensitivity' THEN 'commercial.sensitivity.run' ELSE 'commercial.model.run' END) THEN
    RAISE EXCEPTION 'permission_denied';
  END IF;
  IF v_status <> 'running' THEN RAISE EXCEPTION 'results_only_while_running (status=%)', v_status; END IF;
  INSERT INTO public.commercial_model_results(
    tenant_id, run_id, metric_code, metric_group, formula_code, fiscal_period, period_sequence,
    value_numeric, value_text, unit, lineage_json, is_approximation
  ) VALUES (
    v_tenant, _run_id, _metric_code, _metric_group, _formula_code, _fiscal_period, _period_sequence,
    _value_numeric, _value_text, _unit, COALESCE(_lineage,'{}'::jsonb), COALESCE(_is_approximation,false)
  ) RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- Complete
CREATE OR REPLACE FUNCTION public.commercial_model_run_complete(_run_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_tenant uuid; v_status text; v_scope text;
BEGIN
  SELECT tenant_id, status, run_scope INTO v_tenant, v_status, v_scope FROM public.commercial_model_runs WHERE id = _run_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'run_not_found'; END IF;
  IF NOT public.commercial_can_write(v_tenant, CASE WHEN v_scope='sensitivity' THEN 'commercial.sensitivity.run' ELSE 'commercial.model.run' END) THEN
    RAISE EXCEPTION 'permission_denied';
  END IF;
  IF v_status <> 'running' THEN RAISE EXCEPTION 'invalid_transition: % -> completed', v_status; END IF;
  UPDATE public.commercial_model_runs SET status='completed', completed_at=now() WHERE id = _run_id;
  PERFORM public.emit_audit_event(v_tenant, 'commercial.model.run.completed', 'commercial_model_run', _run_id::text, NULL, NULL, NULL, '{}'::jsonb);
END $$;

-- Fail
CREATE OR REPLACE FUNCTION public.commercial_model_run_fail(_run_id uuid, _error_code text, _error_message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_tenant uuid; v_status text; v_scope text;
BEGIN
  SELECT tenant_id, status, run_scope INTO v_tenant, v_status, v_scope FROM public.commercial_model_runs WHERE id = _run_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'run_not_found'; END IF;
  IF NOT public.commercial_can_write(v_tenant, CASE WHEN v_scope='sensitivity' THEN 'commercial.sensitivity.run' ELSE 'commercial.model.run' END) THEN
    RAISE EXCEPTION 'permission_denied';
  END IF;
  IF v_status NOT IN ('queued','running') THEN RAISE EXCEPTION 'invalid_transition: % -> failed', v_status; END IF;
  UPDATE public.commercial_model_runs SET status='failed', failed_at=now(), error_code=_error_code, error_message=_error_message WHERE id = _run_id;
  PERFORM public.emit_audit_event(v_tenant, 'commercial.model.run.failed', 'commercial_model_run', _run_id::text, NULL,
    jsonb_build_object('error_code',_error_code), _error_message, '{}'::jsonb);
END $$;

-- Supersede
CREATE OR REPLACE FUNCTION public.commercial_model_run_supersede(_run_id uuid, _superseded_by uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_tenant uuid; v_status text;
BEGIN
  SELECT tenant_id, status INTO v_tenant, v_status FROM public.commercial_model_runs WHERE id = _run_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'run_not_found'; END IF;
  IF NOT public.commercial_can_write(v_tenant, 'commercial.model.manage') THEN
    RAISE EXCEPTION 'permission_denied';
  END IF;
  IF v_status <> 'completed' THEN RAISE EXCEPTION 'only_completed_runs_can_be_superseded'; END IF;
  UPDATE public.commercial_model_runs SET status='superseded', supersedes_run_id=_superseded_by WHERE id = _run_id;
  PERFORM public.emit_audit_event(v_tenant, 'commercial.model.run.superseded', 'commercial_model_run', _run_id::text, NULL,
    jsonb_build_object('superseded_by',_superseded_by), NULL, '{}'::jsonb);
END $$;

-- Lock down execution: revoke public execute, grant to authenticated
REVOKE ALL ON FUNCTION public.commercial_compute_input_hash(uuid,uuid,text,text,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_snapshot_scenario_assumptions(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_model_run_start(uuid,uuid,uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_model_run_mark_running(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_model_run_persist_result(uuid,text,text,text,text,int,numeric,text,text,jsonb,boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_model_run_complete(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_model_run_fail(uuid,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.commercial_model_run_supersede(uuid,uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.commercial_compute_input_hash(uuid,uuid,text,text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_snapshot_scenario_assumptions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_model_run_start(uuid,uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_model_run_mark_running(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_model_run_persist_result(uuid,text,text,text,text,int,numeric,text,text,jsonb,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_model_run_complete(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_model_run_fail(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commercial_model_run_supersede(uuid,uuid) TO authenticated;

-- 8. SEED draft model version for Project Momentous -----------------------
INSERT INTO public.commercial_model_versions(
  tenant_id, program_id, version_code, name, source_file_name, source_fingerprint,
  formula_catalog_version, status, notes
)
SELECT
  p.tenant_id,
  p.id,
  'PM-FIN-2026.1',
  'Project Momentous — Neurealm x Citrix Healthcare P&L (BP3.0 baseline)',
  'Neurealm_Citrix_Deal_PL_Model-revised.xlsx',
  'bp3.0-baseline',
  'bp3.0-catalog-v1',
  'draft',
  'BP3.0 contract baseline. Do not mark active until BP3.8 final integration is validated.'
FROM public.commercial_programs p
WHERE p.code = 'PROJECT_MOMENTOUS'
  AND NOT EXISTS (
    SELECT 1 FROM public.commercial_model_versions v
    WHERE v.program_id = p.id AND v.version_code = 'PM-FIN-2026.1'
  );

-- Audit event for the seeded version
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT v.tenant_id, v.id FROM public.commercial_model_versions v WHERE v.version_code = 'PM-FIN-2026.1'
  LOOP
    INSERT INTO public.audit_events(tenant_id, actor_user_id, action_code, object_type, object_id, source, metadata)
    VALUES (r.tenant_id, NULL, 'commercial.model.version.created', 'commercial_model_version', r.id::text, 'system',
      jsonb_build_object('version_code','PM-FIN-2026.1','status','draft'))
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
