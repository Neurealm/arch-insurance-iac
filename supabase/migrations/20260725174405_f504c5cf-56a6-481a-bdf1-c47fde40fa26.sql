
-- =========================================================================
-- BP3.5 — Governed Assumption Editing
-- =========================================================================
-- Adds controlled change-set workflow WITHOUT modifying validated BP3.2/3.3/3.4
-- formulas, historical runs, or the runtime fingerprint.
-- =========================================================================

-- ---------- 1. Permissions --------------------------------------------------
INSERT INTO public.permissions(code, category, description, is_system, required_for_tenant_administration)
VALUES
  ('commercial.assumption.change.create',   'commercial', 'Create and edit Draft Commercial assumption change sets.',    true, false),
  ('commercial.assumption.change.validate', 'commercial', 'Validate Draft Commercial assumption change sets.',            true, false),
  ('commercial.assumption.change.apply',    'commercial', 'Apply Validated Commercial assumption change sets.',           true, false),
  ('commercial.assumption.change.cancel',   'commercial', 'Cancel Draft or Validated Commercial assumption change sets.', true, false)
ON CONFLICT (code) DO NOTHING;

-- ---------- 2. Impact classification (immutable) ---------------------------
CREATE OR REPLACE FUNCTION public.commercial_assumption_impact(_code text)
RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _code IS NULL THEN ARRAY['unknown']::text[]
    -- Cash-only inputs
    WHEN _code IN ('PAY_LAG_DAYS','Q1_TRAVEL_FRONTLOAD_PCT','Q1_ACT_FUND_TIMING_PCT')
      THEN ARRAY['cash']::text[]
    -- P&L (cost/OPEX/staffing) inputs => affect P&L and Cash
    WHEN _code LIKE 'COD_%' OR _code LIKE 'OPEX_%' OR _code = 'COST_ESCALATOR_PCT'
      THEN ARRAY['pnl','cash']::text[]
    -- Revenue drivers => cascade to P&L and Cash
    WHEN _code LIKE 'ACT_RAMP_%' OR _code LIKE 'AVG_ARR_%' OR _code LIKE 'ARR_PROXY_%'
      OR _code LIKE 'ACTIVATION_FUND_%' OR _code LIKE 'MARKETPLACE_%'
      OR _code LIKE 'INCR_ARR_%' OR _code LIKE 'CONV_%' OR _code LIKE 'EAR_POOL_%'
      OR _code LIKE 'BASE_RENEWAL_%' OR _code LIKE 'FLEX_MIGRATION_%'
      OR _code LIKE 'GROWTH_ACCEL_%'
      THEN ARRAY['revenue','pnl','cash']::text[]
    ELSE ARRAY['unknown']::text[]
  END;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_assumption_impact(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_assumption_impact(text) TO authenticated, service_role;

-- ---------- 3. Change-set header table --------------------------------------
CREATE TABLE public.commercial_assumption_change_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  model_version_id uuid NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  description text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','validated','applied','cancelled')),
  change_count integer NOT NULL DEFAULT 0,
  content_hash text,
  validation_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_change_set_id uuid REFERENCES public.commercial_assumption_change_sets(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  validated_by uuid,
  validated_at timestamptz,
  applied_by uuid,
  applied_at timestamptz,
  cancelled_by uuid,
  cancelled_at timestamptz
);
CREATE INDEX ix_ccs_tenant_prog_ver ON public.commercial_assumption_change_sets(tenant_id, program_id, model_version_id, status);
CREATE INDEX ix_ccs_created_at ON public.commercial_assumption_change_sets(created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.commercial_assumption_change_sets TO authenticated;
GRANT ALL ON public.commercial_assumption_change_sets TO service_role;
ALTER TABLE public.commercial_assumption_change_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ccs_select" ON public.commercial_assumption_change_sets
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'commercial.view'));

-- inserts/updates permitted (guard trigger enforces status transitions & permission)
CREATE POLICY "ccs_insert" ON public.commercial_assumption_change_sets
  FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), tenant_id, 'commercial.assumption.change.create'));

CREATE POLICY "ccs_update" ON public.commercial_assumption_change_sets
  FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'commercial.view'))
  WITH CHECK (public.has_permission(auth.uid(), tenant_id, 'commercial.view'));

-- ---------- 4. Change-set items table ---------------------------------------
CREATE TABLE public.commercial_assumption_change_set_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  change_set_id uuid NOT NULL REFERENCES public.commercial_assumption_change_sets(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES public.commercial_scenarios(id) ON DELETE CASCADE,
  assumption_code text NOT NULL,
  previous_value_numeric numeric,
  previous_value_text text,
  proposed_value_numeric numeric,
  proposed_value_text text,
  unit text,
  value_type text NOT NULL DEFAULT 'numeric' CHECK (value_type IN ('numeric','text','boolean')),
  rationale text,
  validation_status text NOT NULL DEFAULT 'unvalidated'
    CHECK (validation_status IN ('unvalidated','valid','warning','error')),
  validation_message text,
  impact_scopes text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (change_set_id, scenario_id, assumption_code)
);
CREATE INDEX ix_ccsi_change_set ON public.commercial_assumption_change_set_items(change_set_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_assumption_change_set_items TO authenticated;
GRANT ALL ON public.commercial_assumption_change_set_items TO service_role;
ALTER TABLE public.commercial_assumption_change_set_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ccsi_select" ON public.commercial_assumption_change_set_items
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'commercial.view'));

CREATE POLICY "ccsi_write" ON public.commercial_assumption_change_set_items
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'commercial.assumption.change.create'))
  WITH CHECK (public.has_permission(auth.uid(), tenant_id, 'commercial.assumption.change.create'));

-- ---------- 5. Immutability guard for header --------------------------------
CREATE OR REPLACE FUNCTION public.commercial_change_set_header_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_via text := current_setting('app.commercial_change_set_op', true);
BEGIN
  IF v_via = 'server' THEN
    RETURN NEW;
  END IF;
  -- Client-side updates: only title/description/updated_at/updated_by while draft.
  IF OLD.status <> 'draft' THEN
    RAISE EXCEPTION 'change set % is % and cannot be edited directly', OLD.id, OLD.status
      USING ERRCODE='check_violation';
  END IF;
  IF NEW.status <> OLD.status
     OR NEW.content_hash IS DISTINCT FROM OLD.content_hash
     OR NEW.validation_summary::text <> OLD.validation_summary::text
     OR NEW.change_count <> OLD.change_count
     OR NEW.validated_by IS DISTINCT FROM OLD.validated_by
     OR NEW.validated_at IS DISTINCT FROM OLD.validated_at
     OR NEW.applied_by IS DISTINCT FROM OLD.applied_by
     OR NEW.applied_at IS DISTINCT FROM OLD.applied_at
     OR NEW.cancelled_by IS DISTINCT FROM OLD.cancelled_by
     OR NEW.cancelled_at IS DISTINCT FROM OLD.cancelled_at
     OR NEW.tenant_id <> OLD.tenant_id
     OR NEW.program_id <> OLD.program_id
     OR NEW.model_version_id <> OLD.model_version_id
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.created_at <> OLD.created_at
  THEN
    RAISE EXCEPTION 'lifecycle columns on change set % may only be updated through server functions', OLD.id
      USING ERRCODE='check_violation';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_ccs_header_guard
  BEFORE UPDATE ON public.commercial_assumption_change_sets
  FOR EACH ROW EXECUTE FUNCTION public.commercial_change_set_header_guard();

-- items: forbid edits/deletes unless parent is Draft (server ops bypass)
CREATE OR REPLACE FUNCTION public.commercial_change_set_item_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_via text := current_setting('app.commercial_change_set_op', true);
  v_status text;
  v_id uuid;
BEGIN
  v_id := COALESCE(NEW.change_set_id, OLD.change_set_id);
  SELECT status INTO v_status FROM public.commercial_assumption_change_sets WHERE id = v_id;
  IF v_via = 'server' THEN RETURN COALESCE(NEW, OLD); END IF;
  IF v_status <> 'draft' THEN
    RAISE EXCEPTION 'change set % is % — items are immutable', v_id, v_status
      USING ERRCODE='check_violation';
  END IF;
  IF TG_OP = 'UPDATE' THEN NEW.updated_at := now(); END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_ccsi_guard
  BEFORE INSERT OR UPDATE OR DELETE ON public.commercial_assumption_change_set_items
  FOR EACH ROW EXECUTE FUNCTION public.commercial_change_set_item_guard();

-- ---------- 6. Apply log (used for staleness) ------------------------------
CREATE TABLE public.commercial_assumption_apply_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  model_version_id uuid NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE CASCADE,
  change_set_id uuid NOT NULL REFERENCES public.commercial_assumption_change_sets(id) ON DELETE CASCADE,
  scenario_ids uuid[] NOT NULL,
  impacted_scopes text[] NOT NULL,
  content_hash text NOT NULL,
  applied_by uuid,
  applied_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_ccal_program ON public.commercial_assumption_apply_log(tenant_id, program_id, applied_at DESC);

GRANT SELECT ON public.commercial_assumption_apply_log TO authenticated;
GRANT ALL ON public.commercial_assumption_apply_log TO service_role;
ALTER TABLE public.commercial_assumption_apply_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ccal_select" ON public.commercial_assumption_apply_log
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), tenant_id, 'commercial.view'));

-- ---------- 7. Deterministic content hash -----------------------------------
CREATE OR REPLACE FUNCTION public.commercial_change_set_compute_hash(_change_set_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT md5(
    coalesce(string_agg(
      concat_ws('|',
        cs.tenant_id::text, cs.program_id::text, cs.model_version_id::text,
        i.scenario_id::text, i.assumption_code,
        coalesce(i.proposed_value_numeric::text, ''),
        coalesce(i.proposed_value_text, ''),
        coalesce(i.unit, ''),
        i.value_type
      ),
      chr(10)
      ORDER BY i.scenario_id::text, i.assumption_code
    ), '')
  )
  FROM public.commercial_assumption_change_sets cs
  LEFT JOIN public.commercial_assumption_change_set_items i ON i.change_set_id = cs.id
  WHERE cs.id = _change_set_id
  GROUP BY cs.id;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_compute_hash(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_change_set_compute_hash(uuid) TO authenticated, service_role;

-- ---------- 8. Server-authoritative lifecycle RPCs --------------------------

-- 8a. create
CREATE OR REPLACE FUNCTION public.commercial_change_set_create(
  _tenant_id uuid, _program_id uuid, _model_version_id uuid,
  _title text, _description text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_status text;
BEGIN
  IF NOT public.has_permission(auth.uid(), _tenant_id, 'commercial.assumption.change.create') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  SELECT status INTO v_status FROM public.commercial_model_versions WHERE id=_model_version_id AND tenant_id=_tenant_id;
  IF v_status IS NULL THEN RAISE EXCEPTION 'model_version_not_found'; END IF;
  IF v_status <> 'draft' THEN
    RAISE EXCEPTION 'model_version_% is % — only Draft versions accept change sets', _model_version_id, v_status;
  END IF;
  PERFORM set_config('app.commercial_change_set_op','server', true);
  INSERT INTO public.commercial_assumption_change_sets(
    tenant_id, program_id, model_version_id, title, description,
    created_by, updated_by
  ) VALUES (_tenant_id, _program_id, _model_version_id, trim(_title), _description, auth.uid(), auth.uid())
  RETURNING id INTO v_id;
  PERFORM public.emit_audit_event(_tenant_id, 'commercial.assumption.change_set.created',
    'commercial_change_set', v_id::text, NULL,
    jsonb_build_object('title', _title, 'model_version_id', _model_version_id),
    NULL, jsonb_build_object('program_id', _program_id));
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_create(uuid,uuid,uuid,text,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_change_set_create(uuid,uuid,uuid,text,text) TO authenticated, service_role;

-- 8b. upsert item
CREATE OR REPLACE FUNCTION public.commercial_change_set_upsert_item(
  _change_set_id uuid, _scenario_id uuid, _assumption_code text,
  _proposed_value_numeric numeric DEFAULT NULL,
  _proposed_value_text text DEFAULT NULL,
  _rationale text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cs public.commercial_assumption_change_sets;
  v_src public.commercial_scenario_assumptions;
  v_item_id uuid;
  v_impact text[];
BEGIN
  SELECT * INTO v_cs FROM public.commercial_assumption_change_sets WHERE id=_change_set_id;
  IF v_cs.id IS NULL THEN RAISE EXCEPTION 'change_set_not_found'; END IF;
  IF v_cs.status <> 'draft' THEN RAISE EXCEPTION 'change_set_% is % — only Draft is editable', v_cs.id, v_cs.status; END IF;
  IF NOT public.has_permission(auth.uid(), v_cs.tenant_id, 'commercial.assumption.change.create') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;

  SELECT * INTO v_src FROM public.commercial_scenario_assumptions
   WHERE scenario_id=_scenario_id AND assumption_code=_assumption_code AND tenant_id=v_cs.tenant_id;
  IF v_src.id IS NULL THEN
    RAISE EXCEPTION 'assumption_% not editable in scenario_%', _assumption_code, _scenario_id;
  END IF;

  v_impact := public.commercial_assumption_impact(_assumption_code);
  PERFORM set_config('app.commercial_change_set_op','server', true);

  INSERT INTO public.commercial_assumption_change_set_items(
    tenant_id, change_set_id, scenario_id, assumption_code,
    previous_value_numeric, previous_value_text, proposed_value_numeric, proposed_value_text,
    unit, value_type, rationale, impact_scopes, created_by, updated_by
  ) VALUES (
    v_cs.tenant_id, v_cs.id, _scenario_id, _assumption_code,
    v_src.numeric_value, v_src.text_value, _proposed_value_numeric, _proposed_value_text,
    v_src.unit,
    CASE WHEN _proposed_value_text IS NOT NULL AND _proposed_value_numeric IS NULL THEN 'text' ELSE 'numeric' END,
    _rationale, v_impact, auth.uid(), auth.uid()
  )
  ON CONFLICT (change_set_id, scenario_id, assumption_code) DO UPDATE
    SET proposed_value_numeric = EXCLUDED.proposed_value_numeric,
        proposed_value_text    = EXCLUDED.proposed_value_text,
        previous_value_numeric = EXCLUDED.previous_value_numeric,
        previous_value_text    = EXCLUDED.previous_value_text,
        unit                   = EXCLUDED.unit,
        value_type             = EXCLUDED.value_type,
        rationale              = COALESCE(EXCLUDED.rationale, public.commercial_assumption_change_set_items.rationale),
        impact_scopes          = EXCLUDED.impact_scopes,
        validation_status      = 'unvalidated',
        validation_message     = NULL,
        updated_by             = auth.uid(),
        updated_at             = now()
  RETURNING id INTO v_item_id;

  UPDATE public.commercial_assumption_change_sets
     SET change_count = (SELECT count(*) FROM public.commercial_assumption_change_set_items WHERE change_set_id=v_cs.id),
         content_hash = NULL,
         validation_summary = '{}'::jsonb,
         updated_by = auth.uid(), updated_at = now()
   WHERE id=v_cs.id;

  RETURN v_item_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_upsert_item(uuid,uuid,text,numeric,text,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_change_set_upsert_item(uuid,uuid,text,numeric,text,text) TO authenticated, service_role;

-- 8c. remove item
CREATE OR REPLACE FUNCTION public.commercial_change_set_remove_item(_item_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cs_id uuid; v_tenant uuid; v_status text;
BEGIN
  SELECT i.change_set_id, i.tenant_id, cs.status
    INTO v_cs_id, v_tenant, v_status
    FROM public.commercial_assumption_change_set_items i
    JOIN public.commercial_assumption_change_sets cs ON cs.id=i.change_set_id
   WHERE i.id=_item_id;
  IF v_cs_id IS NULL THEN RAISE EXCEPTION 'item_not_found'; END IF;
  IF v_status <> 'draft' THEN RAISE EXCEPTION 'change_set is % — items immutable', v_status; END IF;
  IF NOT public.has_permission(auth.uid(), v_tenant, 'commercial.assumption.change.create') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  PERFORM set_config('app.commercial_change_set_op','server', true);
  DELETE FROM public.commercial_assumption_change_set_items WHERE id=_item_id;
  UPDATE public.commercial_assumption_change_sets
     SET change_count = (SELECT count(*) FROM public.commercial_assumption_change_set_items WHERE change_set_id=v_cs_id),
         content_hash = NULL, validation_summary='{}'::jsonb,
         updated_by = auth.uid(), updated_at = now()
   WHERE id=v_cs_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_remove_item(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_change_set_remove_item(uuid) TO authenticated, service_role;

-- 8d. validate
CREATE OR REPLACE FUNCTION public.commercial_change_set_validate(_change_set_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cs public.commercial_assumption_change_sets;
  v_item record;
  v_errs int := 0; v_warns int := 0; v_ok int := 0;
  v_msgs jsonb := '[]'::jsonb;
  v_hash text;
  v_summary jsonb;
BEGIN
  SELECT * INTO v_cs FROM public.commercial_assumption_change_sets WHERE id=_change_set_id;
  IF v_cs.id IS NULL THEN RAISE EXCEPTION 'change_set_not_found'; END IF;
  IF NOT public.has_permission(auth.uid(), v_cs.tenant_id, 'commercial.assumption.change.validate') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_cs.status NOT IN ('draft') THEN
    RAISE EXCEPTION 'change_set_% is % — only Draft can be validated', v_cs.id, v_cs.status;
  END IF;

  PERFORM set_config('app.commercial_change_set_op','server', true);

  FOR v_item IN
    SELECT i.*, sa.numeric_value AS current_numeric, sa.text_value AS current_text
      FROM public.commercial_assumption_change_set_items i
      LEFT JOIN public.commercial_scenario_assumptions sa
        ON sa.scenario_id = i.scenario_id AND sa.assumption_code=i.assumption_code AND sa.tenant_id=i.tenant_id
     WHERE i.change_set_id = v_cs.id
  LOOP
    DECLARE v_status text := 'valid'; v_msg text := NULL;
    BEGIN
      IF v_item.current_numeric IS NULL AND v_item.current_text IS NULL THEN
        v_status := 'error'; v_msg := 'assumption not found in scenario';
      ELSIF v_item.value_type='numeric' AND v_item.proposed_value_numeric IS NULL THEN
        v_status := 'error'; v_msg := 'numeric value required';
      ELSIF v_item.value_type='text' AND (v_item.proposed_value_text IS NULL OR length(trim(v_item.proposed_value_text))=0) THEN
        v_status := 'error'; v_msg := 'text value required';
      ELSIF v_item.value_type='numeric'
            AND v_item.unit='ratio'
            AND (v_item.proposed_value_numeric < 0 OR v_item.proposed_value_numeric > 5) THEN
        v_status := 'warning'; v_msg := 'ratio outside typical range [0..5]';
      ELSIF v_item.value_type='numeric'
            AND v_item.unit IN ('USD','USD_M','accounts')
            AND v_item.proposed_value_numeric < 0 THEN
        v_status := 'error'; v_msg := 'value must be >= 0';
      ELSIF v_item.value_type='numeric'
            AND v_item.assumption_code = 'PAY_LAG_DAYS'
            AND v_item.proposed_value_numeric < 0 THEN
        v_status := 'error'; v_msg := 'payment lag must be >= 0';
      ELSIF (v_item.proposed_value_numeric IS NOT DISTINCT FROM v_item.previous_value_numeric
             AND v_item.proposed_value_text IS NOT DISTINCT FROM v_item.previous_value_text) THEN
        v_status := 'warning'; v_msg := 'proposed value equals current effective value';
      END IF;

      UPDATE public.commercial_assumption_change_set_items
         SET validation_status=v_status, validation_message=v_msg, updated_at=now()
       WHERE id = v_item.id;

      IF v_status='error' THEN v_errs := v_errs+1;
      ELSIF v_status='warning' THEN v_warns := v_warns+1;
      ELSE v_ok := v_ok+1;
      END IF;
      IF v_msg IS NOT NULL THEN
        v_msgs := v_msgs || jsonb_build_object('item_id', v_item.id, 'code', v_item.assumption_code, 'status', v_status, 'message', v_msg);
      END IF;
    END;
  END LOOP;

  v_hash := public.commercial_change_set_compute_hash(v_cs.id);
  v_summary := jsonb_build_object(
    'valid', v_errs=0, 'errors', v_errs, 'warnings', v_warns, 'ok', v_ok,
    'messages', v_msgs, 'evaluated_at', now(), 'content_hash', v_hash);

  IF v_errs > 0 THEN
    UPDATE public.commercial_assumption_change_sets
       SET validation_summary = v_summary, content_hash = v_hash,
           updated_by=auth.uid(), updated_at=now()
     WHERE id=v_cs.id;
    PERFORM public.emit_audit_event(v_cs.tenant_id,'commercial.assumption.change_set.validation_failed',
      'commercial_change_set', v_cs.id::text, NULL,
      jsonb_build_object('errors', v_errs, 'warnings', v_warns), NULL,
      jsonb_build_object('content_hash', v_hash));
  ELSE
    UPDATE public.commercial_assumption_change_sets
       SET status='validated', validation_summary=v_summary, content_hash=v_hash,
           validated_by=auth.uid(), validated_at=now(),
           updated_by=auth.uid(), updated_at=now()
     WHERE id=v_cs.id;
    PERFORM public.emit_audit_event(v_cs.tenant_id,'commercial.assumption.change_set.validated',
      'commercial_change_set', v_cs.id::text, NULL,
      jsonb_build_object('warnings', v_warns, 'items', v_ok+v_warns), NULL,
      jsonb_build_object('content_hash', v_hash));
  END IF;
  RETURN v_summary;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_validate(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_change_set_validate(uuid) TO authenticated, service_role;

-- 8e. apply (transactional)
CREATE OR REPLACE FUNCTION public.commercial_change_set_apply(_change_set_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cs public.commercial_assumption_change_sets;
  v_item record;
  v_conflicts jsonb := '[]'::jsonb;
  v_scenarios uuid[];
  v_scopes text[];
  v_hash_now text;
  v_applied int := 0;
BEGIN
  SELECT * INTO v_cs FROM public.commercial_assumption_change_sets WHERE id=_change_set_id;
  IF v_cs.id IS NULL THEN RAISE EXCEPTION 'change_set_not_found'; END IF;
  IF NOT public.has_permission(auth.uid(), v_cs.tenant_id, 'commercial.assumption.change.apply') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_cs.status <> 'validated' THEN
    RAISE EXCEPTION 'change_set_% is % — only Validated may be applied', v_cs.id, v_cs.status;
  END IF;

  -- Model version must remain Draft
  IF (SELECT status FROM public.commercial_model_versions WHERE id=v_cs.model_version_id) <> 'draft' THEN
    RAISE EXCEPTION 'model_version_not_draft';
  END IF;

  -- Conflict detection: current effective value must still match previous_value
  FOR v_item IN
    SELECT i.*, sa.numeric_value AS current_numeric, sa.text_value AS current_text, sa.id AS sa_id
      FROM public.commercial_assumption_change_set_items i
      JOIN public.commercial_scenario_assumptions sa
        ON sa.scenario_id=i.scenario_id AND sa.assumption_code=i.assumption_code AND sa.tenant_id=i.tenant_id
     WHERE i.change_set_id = v_cs.id
  LOOP
    IF v_item.current_numeric IS DISTINCT FROM v_item.previous_value_numeric
       OR v_item.current_text  IS DISTINCT FROM v_item.previous_value_text THEN
      v_conflicts := v_conflicts || jsonb_build_object(
        'item_id', v_item.id, 'code', v_item.assumption_code, 'scenario_id', v_item.scenario_id,
        'expected_numeric', v_item.previous_value_numeric,
        'actual_numeric',   v_item.current_numeric);
    END IF;
  END LOOP;

  IF jsonb_array_length(v_conflicts) > 0 THEN
    PERFORM public.emit_audit_event(v_cs.tenant_id,'commercial.assumption.change_set.conflict_detected',
      'commercial_change_set', v_cs.id::text, NULL,
      jsonb_build_object('conflict_count', jsonb_array_length(v_conflicts)), NULL,
      jsonb_build_object('content_hash', v_cs.content_hash));
    RETURN jsonb_build_object('applied', false, 'reason','conflict', 'conflicts', v_conflicts);
  END IF;

  PERFORM set_config('app.commercial_change_set_op','server', true);

  -- Apply atomically
  FOR v_item IN
    SELECT i.*, sa.id AS sa_id
      FROM public.commercial_assumption_change_set_items i
      JOIN public.commercial_scenario_assumptions sa
        ON sa.scenario_id=i.scenario_id AND sa.assumption_code=i.assumption_code AND sa.tenant_id=i.tenant_id
     WHERE i.change_set_id = v_cs.id
  LOOP
    UPDATE public.commercial_scenario_assumptions
       SET numeric_value = v_item.proposed_value_numeric,
           text_value    = v_item.proposed_value_text,
           updated_by    = auth.uid(),
           updated_at    = now()
     WHERE id = v_item.sa_id;
    v_applied := v_applied + 1;
  END LOOP;

  -- Aggregate impacted scenarios & scopes
  SELECT COALESCE(array_agg(DISTINCT scenario_id), ARRAY[]::uuid[]),
         COALESCE(array_agg(DISTINCT s), ARRAY[]::text[])
    INTO v_scenarios, v_scopes
    FROM public.commercial_assumption_change_set_items i, unnest(i.impact_scopes) s
   WHERE i.change_set_id = v_cs.id;

  v_hash_now := v_cs.content_hash;

  INSERT INTO public.commercial_assumption_apply_log(
    tenant_id, program_id, model_version_id, change_set_id,
    scenario_ids, impacted_scopes, content_hash, applied_by
  ) VALUES (v_cs.tenant_id, v_cs.program_id, v_cs.model_version_id, v_cs.id,
            v_scenarios, v_scopes, v_hash_now, auth.uid());

  UPDATE public.commercial_assumption_change_sets
     SET status='applied', applied_by=auth.uid(), applied_at=now(),
         updated_by=auth.uid(), updated_at=now()
   WHERE id=v_cs.id;

  PERFORM public.emit_audit_event(v_cs.tenant_id,'commercial.assumption.change_set.applied',
    'commercial_change_set', v_cs.id::text, NULL,
    jsonb_build_object('applied_items', v_applied, 'impacted_scopes', v_scopes), NULL,
    jsonb_build_object('content_hash', v_hash_now));

  RETURN jsonb_build_object(
    'applied', true, 'applied_items', v_applied,
    'impacted_scopes', v_scopes, 'scenario_ids', v_scenarios,
    'content_hash', v_hash_now);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_apply(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_change_set_apply(uuid) TO authenticated, service_role;

-- 8f. cancel
CREATE OR REPLACE FUNCTION public.commercial_change_set_cancel(_change_set_id uuid, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cs public.commercial_assumption_change_sets;
BEGIN
  SELECT * INTO v_cs FROM public.commercial_assumption_change_sets WHERE id=_change_set_id;
  IF v_cs.id IS NULL THEN RAISE EXCEPTION 'change_set_not_found'; END IF;
  IF NOT public.has_permission(auth.uid(), v_cs.tenant_id, 'commercial.assumption.change.cancel') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_cs.status NOT IN ('draft','validated') THEN
    RAISE EXCEPTION 'change_set_% is % — cannot cancel', v_cs.id, v_cs.status;
  END IF;
  PERFORM set_config('app.commercial_change_set_op','server', true);
  UPDATE public.commercial_assumption_change_sets
     SET status='cancelled', cancelled_by=auth.uid(), cancelled_at=now(),
         updated_by=auth.uid(), updated_at=now()
   WHERE id=v_cs.id;
  PERFORM public.emit_audit_event(v_cs.tenant_id,'commercial.assumption.change_set.cancelled',
    'commercial_change_set', v_cs.id::text, NULL, NULL, _reason, '{}'::jsonb);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_cancel(uuid,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_change_set_cancel(uuid,text) TO authenticated, service_role;

-- 8g. staleness detector
CREATE OR REPLACE FUNCTION public.commercial_program_run_staleness(_program_id uuid)
RETURNS TABLE(run_scope text, scenario_id uuid, latest_run_id uuid, latest_completed_at timestamptz, last_apply_at timestamptz, is_stale boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH latest_runs AS (
    SELECT DISTINCT ON (r.run_scope, r.scenario_id)
           r.run_scope, r.scenario_id, r.id AS latest_run_id, r.completed_at AS latest_completed_at
      FROM public.commercial_model_runs r
     WHERE r.program_id=_program_id AND r.status='completed'
     ORDER BY r.run_scope, r.scenario_id, r.completed_at DESC
  ), apply_by_scope AS (
    SELECT sc AS run_scope, sid AS scenario_id, max(a.applied_at) AS last_apply_at
      FROM public.commercial_assumption_apply_log a,
           unnest(a.impacted_scopes) sc,
           unnest(a.scenario_ids) sid
     WHERE a.program_id=_program_id
     GROUP BY sc, sid
  )
  SELECT lr.run_scope, lr.scenario_id, lr.latest_run_id, lr.latest_completed_at, ab.last_apply_at,
         COALESCE(ab.last_apply_at > lr.latest_completed_at, false) AS is_stale
    FROM latest_runs lr
    LEFT JOIN apply_by_scope ab ON ab.run_scope=lr.run_scope AND ab.scenario_id=lr.scenario_id;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_program_run_staleness(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_program_run_staleness(uuid) TO authenticated, service_role;
