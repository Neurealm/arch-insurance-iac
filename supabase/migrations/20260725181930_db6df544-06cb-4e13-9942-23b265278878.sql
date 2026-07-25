
-- =====================================================================
-- BP3.5 · Governed Assumption Change Sets, Validation & Apply
-- =====================================================================

-- ---------- 1. Permissions ------------------------------------------------
INSERT INTO public.permissions (code, category, description)
VALUES
  ('commercial.assumption.change.create',   'commercial', 'Create governed commercial assumption change sets'),
  ('commercial.assumption.change.validate', 'commercial', 'Validate a Draft commercial assumption change set'),
  ('commercial.assumption.change.apply',    'commercial', 'Apply a Validated commercial assumption change set'),
  ('commercial.assumption.change.cancel',   'commercial', 'Cancel a Draft or Validated commercial assumption change set')
ON CONFLICT (code) DO NOTHING;

-- Grant to Commercial Admin role if present in the commercial tenant.
INSERT INTO public.tenant_role_permissions (tenant_id, role_id, permission_code)
SELECT tr.tenant_id, tr.id, p.code
FROM public.tenant_roles tr
JOIN public.tenants t ON t.id = tr.tenant_id AND t.slug = 'neugain-commercial'
CROSS JOIN (
  VALUES
    ('commercial.assumption.change.create'),
    ('commercial.assumption.change.validate'),
    ('commercial.assumption.change.apply'),
    ('commercial.assumption.change.cancel')
) AS p(code)
WHERE tr.code IN ('commercial_admin','admin')
ON CONFLICT DO NOTHING;

-- ---------- 2. change_sets header ----------------------------------------
CREATE TABLE IF NOT EXISTS public.commercial_assumption_change_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  model_version_id UUID NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','validated','applied','cancelled')),
  change_count INTEGER NOT NULL DEFAULT 0,
  content_hash TEXT,
  validation_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  applied_by UUID,
  applied_at TIMESTAMPTZ,
  cancelled_by UUID,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT
);
CREATE INDEX IF NOT EXISTS ix_ccs_tenant_prog ON public.commercial_assumption_change_sets(tenant_id, program_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_ccs_status ON public.commercial_assumption_change_sets(status);

GRANT SELECT, INSERT, UPDATE ON public.commercial_assumption_change_sets TO authenticated;
GRANT ALL ON public.commercial_assumption_change_sets TO service_role;
ALTER TABLE public.commercial_assumption_change_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ccs_select_tenant" ON public.commercial_assumption_change_sets;
CREATE POLICY "ccs_select_tenant"
  ON public.commercial_assumption_change_sets FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR public.has_permission(auth.uid(), tenant_id, 'commercial.view')
  );

-- Direct insert/update/delete are blocked; all writes go through RPCs (SECURITY DEFINER).
DROP POLICY IF EXISTS "ccs_no_direct_write" ON public.commercial_assumption_change_sets;
CREATE POLICY "ccs_no_direct_write"
  ON public.commercial_assumption_change_sets FOR INSERT TO authenticated
  WITH CHECK (false);
DROP POLICY IF EXISTS "ccs_no_direct_update" ON public.commercial_assumption_change_sets;
CREATE POLICY "ccs_no_direct_update"
  ON public.commercial_assumption_change_sets FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

-- ---------- 3. change_set_items ------------------------------------------
CREATE TABLE IF NOT EXISTS public.commercial_assumption_change_set_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_set_id UUID NOT NULL REFERENCES public.commercial_assumption_change_sets(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES public.commercial_scenarios(id) ON DELETE RESTRICT,
  assumption_code TEXT NOT NULL,
  value_type TEXT NOT NULL DEFAULT 'numeric' CHECK (value_type IN ('numeric','text','boolean')),
  previous_value_numeric NUMERIC,
  previous_value_text TEXT,
  proposed_value_numeric NUMERIC,
  proposed_value_text TEXT,
  unit TEXT,
  rationale TEXT,
  validation_status TEXT NOT NULL DEFAULT 'unvalidated'
    CHECK (validation_status IN ('unvalidated','valid','warning','error')),
  validation_message TEXT,
  impact_scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(change_set_id, scenario_id, assumption_code)
);
CREATE INDEX IF NOT EXISTS ix_ccsi_change_set ON public.commercial_assumption_change_set_items(change_set_id);

GRANT SELECT ON public.commercial_assumption_change_set_items TO authenticated;
GRANT ALL ON public.commercial_assumption_change_set_items TO service_role;
ALTER TABLE public.commercial_assumption_change_set_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ccsi_select_via_header" ON public.commercial_assumption_change_set_items;
CREATE POLICY "ccsi_select_via_header"
  ON public.commercial_assumption_change_set_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.commercial_assumption_change_sets h
      WHERE h.id = change_set_id
        AND (public.is_platform_admin(auth.uid()) OR public.has_permission(auth.uid(), h.tenant_id, 'commercial.view'))
    )
  );
DROP POLICY IF EXISTS "ccsi_no_direct_write" ON public.commercial_assumption_change_set_items;
CREATE POLICY "ccsi_no_direct_write"
  ON public.commercial_assumption_change_set_items FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "ccsi_no_direct_update" ON public.commercial_assumption_change_set_items;
CREATE POLICY "ccsi_no_direct_update"
  ON public.commercial_assumption_change_set_items FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

-- ---------- 4. apply_log --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commercial_assumption_apply_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  model_version_id UUID NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE RESTRICT,
  change_set_id UUID NOT NULL REFERENCES public.commercial_assumption_change_sets(id) ON DELETE RESTRICT,
  content_hash TEXT NOT NULL,
  applied_item_count INTEGER NOT NULL,
  impact_scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  applied_by UUID,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS ix_ccal_tenant_prog ON public.commercial_assumption_apply_log(tenant_id, program_id, applied_at DESC);

GRANT SELECT ON public.commercial_assumption_apply_log TO authenticated;
GRANT ALL ON public.commercial_assumption_apply_log TO service_role;
ALTER TABLE public.commercial_assumption_apply_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ccal_select_tenant" ON public.commercial_assumption_apply_log;
CREATE POLICY "ccal_select_tenant"
  ON public.commercial_assumption_apply_log FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR public.has_permission(auth.uid(), tenant_id, 'commercial.view')
  );

-- ---------- 5. Header immutability guard ---------------------------------
CREATE OR REPLACE FUNCTION public.commercial_change_set_touch_updated()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ccs_touch ON public.commercial_assumption_change_sets;
CREATE TRIGGER trg_ccs_touch
  BEFORE UPDATE ON public.commercial_assumption_change_sets
  FOR EACH ROW EXECUTE FUNCTION public.commercial_change_set_touch_updated();

DROP TRIGGER IF EXISTS trg_ccsi_touch ON public.commercial_assumption_change_set_items;
CREATE TRIGGER trg_ccsi_touch
  BEFORE UPDATE ON public.commercial_assumption_change_set_items
  FOR EACH ROW EXECUTE FUNCTION public.commercial_change_set_touch_updated();

-- ---------- 6. Helper: permission check -----------------------------------
CREATE OR REPLACE FUNCTION public._commercial_require_perm(_tenant_id UUID, _perm TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_platform_admin(auth.uid()) THEN RETURN; END IF;
  IF NOT public.has_permission(auth.uid(), _tenant_id, _perm) THEN
    RAISE EXCEPTION 'missing permission %', _perm USING ERRCODE = '42501';
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public._commercial_require_perm(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public._commercial_require_perm(UUID, TEXT) TO authenticated, service_role;

-- ---------- 7. Impact classifier (mirrors client) -------------------------
CREATE OR REPLACE FUNCTION public.commercial_classify_impact(_code TEXT)
RETURNS TEXT[] LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
BEGIN
  IF _code IN ('PAY_LAG_DAYS','Q1_TRAVEL_FRONTLOAD_PCT','Q1_ACT_FUND_TIMING_PCT') THEN
    RETURN ARRAY['cash'];
  END IF;
  IF _code LIKE 'COD\_%' ESCAPE '\' OR _code LIKE 'OPEX\_%' ESCAPE '\' OR _code = 'COST_ESCALATOR_PCT' THEN
    RETURN ARRAY['pnl','cash'];
  END IF;
  IF _code ~ '^(ACT_RAMP_|AVG_ARR_|ARR_PROXY_|ACTIVATION_FUND_|MARKETPLACE_|INCR_ARR_|CONV_|EAR_POOL_|BASE_RENEWAL_|FLEX_MIGRATION_|GROWTH_ACCEL_)' THEN
    RETURN ARRAY['revenue','pnl','cash'];
  END IF;
  RETURN ARRAY['unknown'];
END;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_classify_impact(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_classify_impact(TEXT) TO authenticated, service_role;

-- ---------- 8. Content hash -----------------------------------------------
CREATE OR REPLACE FUNCTION public.commercial_change_set_hash(_change_set_id UUID)
RETURNS TEXT LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT encode(sha256(coalesce(string_agg(
    scenario_id::text || '|' || assumption_code || '|' ||
    coalesce(proposed_value_numeric::text, '') || '|' ||
    coalesce(proposed_value_text, ''), E'\n'
    ORDER BY scenario_id::text, assumption_code
  ), '')::bytea), 'hex')
  FROM public.commercial_assumption_change_set_items
  WHERE change_set_id = _change_set_id;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_hash(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_change_set_hash(UUID) TO authenticated, service_role;

-- ---------- 9. RPC: create -------------------------------------------------
DROP FUNCTION IF EXISTS public.commercial_change_set_create(UUID,UUID,UUID,TEXT,TEXT);
CREATE OR REPLACE FUNCTION public.commercial_change_set_create(
  _tenant_id UUID, _program_id UUID, _model_version_id UUID,
  _title TEXT, _description TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id UUID; _ver_status TEXT;
BEGIN
  PERFORM public._commercial_require_perm(_tenant_id, 'commercial.assumption.change.create');
  IF _title IS NULL OR length(trim(_title)) = 0 THEN
    RAISE EXCEPTION 'title required' USING ERRCODE = '22023';
  END IF;
  SELECT status INTO _ver_status FROM public.commercial_model_versions
    WHERE id = _model_version_id AND program_id = _program_id AND tenant_id = _tenant_id;
  IF _ver_status IS NULL THEN
    RAISE EXCEPTION 'model version not found' USING ERRCODE = '23503';
  END IF;
  IF _ver_status <> 'draft' THEN
    RAISE EXCEPTION 'model version must be Draft (got %)', _ver_status USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.commercial_assumption_change_sets
    (tenant_id, program_id, model_version_id, title, description, created_by)
  VALUES (_tenant_id, _program_id, _model_version_id, trim(_title), _description, auth.uid())
  RETURNING id INTO _id;

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action, entity_type, entity_id, payload)
  VALUES (_tenant_id, auth.uid(), 'commercial.assumption.change_set.created',
          'commercial_assumption_change_set', _id,
          jsonb_build_object('title', trim(_title), 'model_version_id', _model_version_id));
  RETURN _id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_create(UUID,UUID,UUID,TEXT,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_change_set_create(UUID,UUID,UUID,TEXT,TEXT) TO authenticated, service_role;

-- ---------- 10. RPC: upsert_item ------------------------------------------
DROP FUNCTION IF EXISTS public.commercial_change_set_upsert_item(UUID,UUID,TEXT,NUMERIC,TEXT,TEXT);
CREATE OR REPLACE FUNCTION public.commercial_change_set_upsert_item(
  _change_set_id UUID, _scenario_id UUID, _assumption_code TEXT,
  _proposed_value_numeric NUMERIC, _proposed_value_text TEXT, _rationale TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant UUID; _status TEXT; _prev NUMERIC; _prev_txt TEXT; _unit TEXT;
  _item_id UUID; _impact TEXT[]; _hash TEXT;
BEGIN
  SELECT tenant_id, status INTO _tenant, _status
    FROM public.commercial_assumption_change_sets WHERE id = _change_set_id;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'change set not found' USING ERRCODE='23503'; END IF;
  IF _status <> 'draft' THEN RAISE EXCEPTION 'change set is % (only draft is editable)', _status USING ERRCODE='22023'; END IF;
  PERFORM public._commercial_require_perm(_tenant, 'commercial.assumption.change.create');

  SELECT numeric_value, text_value, unit INTO _prev, _prev_txt, _unit
    FROM public.commercial_scenario_assumptions
    WHERE scenario_id = _scenario_id AND assumption_code = _assumption_code AND tenant_id = _tenant;
  IF NOT FOUND THEN RAISE EXCEPTION 'assumption % not found for scenario', _assumption_code USING ERRCODE='23503'; END IF;

  _impact := public.commercial_classify_impact(_assumption_code);

  INSERT INTO public.commercial_assumption_change_set_items
    (change_set_id, scenario_id, assumption_code, previous_value_numeric, previous_value_text,
     proposed_value_numeric, proposed_value_text, unit, rationale, impact_scopes, validation_status)
  VALUES (_change_set_id, _scenario_id, _assumption_code, _prev, _prev_txt,
          _proposed_value_numeric, _proposed_value_text, _unit, _rationale, _impact, 'unvalidated')
  ON CONFLICT (change_set_id, scenario_id, assumption_code) DO UPDATE
    SET proposed_value_numeric = EXCLUDED.proposed_value_numeric,
        proposed_value_text    = EXCLUDED.proposed_value_text,
        previous_value_numeric = EXCLUDED.previous_value_numeric,
        previous_value_text    = EXCLUDED.previous_value_text,
        unit                   = EXCLUDED.unit,
        rationale              = EXCLUDED.rationale,
        impact_scopes          = EXCLUDED.impact_scopes,
        validation_status      = 'unvalidated',
        validation_message     = NULL
  RETURNING id INTO _item_id;

  _hash := public.commercial_change_set_hash(_change_set_id);

  UPDATE public.commercial_assumption_change_sets h
     SET change_count = (SELECT count(*) FROM public.commercial_assumption_change_set_items WHERE change_set_id = _change_set_id),
         content_hash = _hash,
         validation_summary = '{}'::jsonb
   WHERE h.id = _change_set_id;

  RETURN _item_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_upsert_item(UUID,UUID,TEXT,NUMERIC,TEXT,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_change_set_upsert_item(UUID,UUID,TEXT,NUMERIC,TEXT,TEXT) TO authenticated, service_role;

-- ---------- 11. RPC: remove_item ------------------------------------------
DROP FUNCTION IF EXISTS public.commercial_change_set_remove_item(UUID);
CREATE OR REPLACE FUNCTION public.commercial_change_set_remove_item(_item_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cs UUID; _tenant UUID; _status TEXT;
BEGIN
  SELECT h.id, h.tenant_id, h.status
    INTO _cs, _tenant, _status
    FROM public.commercial_assumption_change_set_items i
    JOIN public.commercial_assumption_change_sets h ON h.id = i.change_set_id
   WHERE i.id = _item_id;
  IF _cs IS NULL THEN RAISE EXCEPTION 'item not found' USING ERRCODE='23503'; END IF;
  IF _status <> 'draft' THEN RAISE EXCEPTION 'change set is % (only draft is editable)', _status USING ERRCODE='22023'; END IF;
  PERFORM public._commercial_require_perm(_tenant, 'commercial.assumption.change.create');

  DELETE FROM public.commercial_assumption_change_set_items WHERE id = _item_id;

  UPDATE public.commercial_assumption_change_sets
     SET change_count = (SELECT count(*) FROM public.commercial_assumption_change_set_items WHERE change_set_id = _cs),
         content_hash = public.commercial_change_set_hash(_cs),
         validation_summary = '{}'::jsonb
   WHERE id = _cs;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_remove_item(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_change_set_remove_item(UUID) TO authenticated, service_role;

-- ---------- 12. RPC: validate ---------------------------------------------
DROP FUNCTION IF EXISTS public.commercial_change_set_validate(UUID);
CREATE OR REPLACE FUNCTION public.commercial_change_set_validate(_change_set_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant UUID; _status TEXT; _errors INT := 0; _warnings INT := 0; _valid INT := 0;
  _rec RECORD; _msg TEXT; _st TEXT;
BEGIN
  SELECT tenant_id, status INTO _tenant, _status
    FROM public.commercial_assumption_change_sets WHERE id = _change_set_id;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'change set not found' USING ERRCODE='23503'; END IF;
  IF _status <> 'draft' THEN RAISE EXCEPTION 'only draft change sets can be validated (is %)', _status USING ERRCODE='22023'; END IF;
  PERFORM public._commercial_require_perm(_tenant, 'commercial.assumption.change.validate');

  FOR _rec IN SELECT * FROM public.commercial_assumption_change_set_items WHERE change_set_id = _change_set_id LOOP
    _msg := NULL; _st := 'valid';
    IF _rec.value_type = 'numeric' THEN
      IF _rec.proposed_value_numeric IS NULL THEN
        _st := 'error'; _msg := 'Numeric value required.';
      ELSIF _rec.assumption_code LIKE '%_PCT' AND (_rec.proposed_value_numeric < 0 OR _rec.proposed_value_numeric > 200) THEN
        _st := 'error'; _msg := 'Percentage assumption must be between 0 and 200.';
      ELSIF _rec.assumption_code LIKE '%_PCT' AND _rec.proposed_value_numeric > 100 THEN
        _st := 'warning'; _msg := 'Percentage exceeds 100 — confirm intent.';
      ELSIF _rec.previous_value_numeric IS NOT NULL AND _rec.previous_value_numeric <> 0
            AND abs(_rec.proposed_value_numeric - _rec.previous_value_numeric) / abs(_rec.previous_value_numeric) > 0.5 THEN
        _st := 'warning'; _msg := 'Change exceeds 50% of prior value.';
      END IF;
    ELSIF _rec.value_type = 'text' AND (_rec.proposed_value_text IS NULL OR length(trim(_rec.proposed_value_text)) = 0) THEN
      _st := 'error'; _msg := 'Text value required.';
    END IF;

    UPDATE public.commercial_assumption_change_set_items
       SET validation_status = _st, validation_message = _msg
     WHERE id = _rec.id;

    IF _st = 'error' THEN _errors := _errors + 1;
    ELSIF _st = 'warning' THEN _warnings := _warnings + 1;
    ELSE _valid := _valid + 1;
    END IF;
  END LOOP;

  UPDATE public.commercial_assumption_change_sets
     SET status = CASE WHEN _errors = 0 THEN 'validated' ELSE 'draft' END,
         validated_by = CASE WHEN _errors = 0 THEN auth.uid() ELSE validated_by END,
         validated_at = CASE WHEN _errors = 0 THEN now() ELSE validated_at END,
         validation_summary = jsonb_build_object(
           'valid', _valid, 'warnings', _warnings, 'errors', _errors,
           'ran_at', now(), 'ran_by', auth.uid())
   WHERE id = _change_set_id;

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action, entity_type, entity_id, payload)
  VALUES (_tenant, auth.uid(), 'commercial.assumption.change_set.validated',
          'commercial_assumption_change_set', _change_set_id,
          jsonb_build_object('errors', _errors, 'warnings', _warnings, 'valid', _valid));

  RETURN jsonb_build_object('valid', _errors = 0, 'errors', _errors, 'warnings', _warnings, 'ok', _valid);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_validate(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_change_set_validate(UUID) TO authenticated, service_role;

-- ---------- 13. RPC: apply -------------------------------------------------
DROP FUNCTION IF EXISTS public.commercial_change_set_apply(UUID);
CREATE OR REPLACE FUNCTION public.commercial_change_set_apply(_change_set_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _tenant UUID; _prog UUID; _ver UUID; _status TEXT; _hash TEXT; _cur_hash TEXT;
  _applied INT := 0; _impact TEXT[] := ARRAY[]::TEXT[]; _rec RECORD;
BEGIN
  SELECT tenant_id, program_id, model_version_id, status, content_hash
    INTO _tenant, _prog, _ver, _status, _hash
    FROM public.commercial_assumption_change_sets WHERE id = _change_set_id;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'change set not found' USING ERRCODE='23503'; END IF;
  IF _status <> 'validated' THEN RAISE EXCEPTION 'only validated change sets can be applied (is %)', _status USING ERRCODE='22023'; END IF;
  PERFORM public._commercial_require_perm(_tenant, 'commercial.assumption.change.apply');

  _cur_hash := public.commercial_change_set_hash(_change_set_id);
  IF _cur_hash IS DISTINCT FROM _hash THEN
    UPDATE public.commercial_assumption_change_sets
       SET status = 'draft', validation_summary = jsonb_build_object('conflict', true, 'ran_at', now())
     WHERE id = _change_set_id;
    RETURN jsonb_build_object('applied', false, 'reason', 'content_hash_mismatch');
  END IF;

  FOR _rec IN SELECT * FROM public.commercial_assumption_change_set_items WHERE change_set_id = _change_set_id LOOP
    UPDATE public.commercial_scenario_assumptions
       SET numeric_value = COALESCE(_rec.proposed_value_numeric, numeric_value),
           text_value    = COALESCE(_rec.proposed_value_text, text_value),
           updated_at    = now()
     WHERE tenant_id = _tenant
       AND scenario_id = _rec.scenario_id
       AND assumption_code = _rec.assumption_code;
    _applied := _applied + 1;
    _impact := (SELECT ARRAY(SELECT DISTINCT unnest(_impact || _rec.impact_scopes)));
  END LOOP;

  UPDATE public.commercial_assumption_change_sets
     SET status = 'applied', applied_by = auth.uid(), applied_at = now()
   WHERE id = _change_set_id;

  INSERT INTO public.commercial_assumption_apply_log
    (tenant_id, program_id, model_version_id, change_set_id, content_hash, applied_item_count, impact_scopes, applied_by,
     snapshot)
  VALUES (_tenant, _prog, _ver, _change_set_id, _hash, _applied, _impact, auth.uid(),
    (SELECT jsonb_agg(to_jsonb(i)) FROM public.commercial_assumption_change_set_items i WHERE i.change_set_id = _change_set_id));

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action, entity_type, entity_id, payload)
  VALUES (_tenant, auth.uid(), 'commercial.assumption.change_set.applied',
          'commercial_assumption_change_set', _change_set_id,
          jsonb_build_object('items', _applied, 'impact', _impact, 'hash', _hash));

  RETURN jsonb_build_object('applied', true, 'applied_items', _applied, 'impact_scopes', _impact);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_apply(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_change_set_apply(UUID) TO authenticated, service_role;

-- ---------- 14. RPC: cancel -----------------------------------------------
DROP FUNCTION IF EXISTS public.commercial_change_set_cancel(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.commercial_change_set_cancel(_change_set_id UUID, _reason TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tenant UUID; _status TEXT;
BEGIN
  SELECT tenant_id, status INTO _tenant, _status
    FROM public.commercial_assumption_change_sets WHERE id = _change_set_id;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'change set not found' USING ERRCODE='23503'; END IF;
  IF _status NOT IN ('draft','validated') THEN
    RAISE EXCEPTION 'cannot cancel change set with status %', _status USING ERRCODE='22023';
  END IF;
  PERFORM public._commercial_require_perm(_tenant, 'commercial.assumption.change.cancel');

  UPDATE public.commercial_assumption_change_sets
     SET status = 'cancelled', cancelled_by = auth.uid(), cancelled_at = now(), cancel_reason = _reason
   WHERE id = _change_set_id;

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action, entity_type, entity_id, payload)
  VALUES (_tenant, auth.uid(), 'commercial.assumption.change_set.cancelled',
          'commercial_assumption_change_set', _change_set_id,
          jsonb_build_object('reason', _reason));
END;
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_change_set_cancel(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_change_set_cancel(UUID, TEXT) TO authenticated, service_role;

-- ---------- 15. RPC: run staleness ----------------------------------------
DROP FUNCTION IF EXISTS public.commercial_program_run_staleness(UUID);
CREATE OR REPLACE FUNCTION public.commercial_program_run_staleness(_program_id UUID)
RETURNS TABLE (
  run_scope TEXT, scenario_id UUID,
  latest_run_id UUID, latest_completed_at TIMESTAMPTZ,
  last_apply_at TIMESTAMPTZ, is_stale BOOLEAN
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH latest AS (
    SELECT DISTINCT ON (r.run_scope, r.scenario_id)
      r.run_scope, r.scenario_id, r.id AS latest_run_id, r.completed_at
    FROM public.commercial_model_runs r
    WHERE r.program_id = _program_id AND r.status = 'completed'
    ORDER BY r.run_scope, r.scenario_id, r.completed_at DESC NULLS LAST
  ),
  last_apply AS (
    SELECT max(applied_at) AS last_apply_at FROM public.commercial_assumption_apply_log
    WHERE program_id = _program_id
  )
  SELECT l.run_scope, l.scenario_id, l.latest_run_id, l.completed_at,
         (SELECT last_apply_at FROM last_apply),
         COALESCE((SELECT last_apply_at FROM last_apply) > l.completed_at, false) AS is_stale
  FROM latest l
  WHERE (
    public.is_platform_admin(auth.uid())
    OR public.has_permission(auth.uid(),
      (SELECT tenant_id FROM public.commercial_programs WHERE id = _program_id),
      'commercial.view'
    )
  );
$$;
REVOKE EXECUTE ON FUNCTION public.commercial_program_run_staleness(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_program_run_staleness(UUID) TO authenticated, service_role;
