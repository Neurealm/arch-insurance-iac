CREATE OR REPLACE FUNCTION public.commercial_change_set_upsert_item(_change_set_id uuid, _scenario_id uuid, _assumption_code text, _proposed_value_numeric numeric, _proposed_value_text text, _rationale text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _tenant UUID; _status TEXT; _prev NUMERIC; _prev_txt TEXT; _unit TEXT;
  _item_id UUID; _impact TEXT[]; _hash TEXT; _actor UUID;
BEGIN
  _actor := auth.uid();
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
    (tenant_id, change_set_id, scenario_id, assumption_code, previous_value_numeric, previous_value_text,
     proposed_value_numeric, proposed_value_text, unit, rationale, impact_scopes, validation_status, created_by, updated_by)
  VALUES (_tenant, _change_set_id, _scenario_id, _assumption_code, _prev, _prev_txt,
          _proposed_value_numeric, _proposed_value_text, _unit, _rationale, _impact, 'unvalidated', _actor, _actor)
  ON CONFLICT (change_set_id, scenario_id, assumption_code) DO UPDATE
    SET proposed_value_numeric = EXCLUDED.proposed_value_numeric,
        proposed_value_text    = EXCLUDED.proposed_value_text,
        previous_value_numeric = EXCLUDED.previous_value_numeric,
        previous_value_text    = EXCLUDED.previous_value_text,
        unit                   = EXCLUDED.unit,
        rationale              = EXCLUDED.rationale,
        impact_scopes          = EXCLUDED.impact_scopes,
        validation_status      = 'unvalidated',
        validation_message     = NULL,
        updated_by             = _actor,
        updated_at             = now()
  RETURNING id INTO _item_id;

  _hash := public.commercial_change_set_hash(_change_set_id);

  PERFORM set_config('app.commercial_change_set_op', 'server', true);
  UPDATE public.commercial_assumption_change_sets h
     SET change_count = (SELECT count(*) FROM public.commercial_assumption_change_set_items WHERE change_set_id = _change_set_id),
         content_hash = _hash,
         validation_summary = '{}'::jsonb
   WHERE h.id = _change_set_id;
  PERFORM set_config('app.commercial_change_set_op', '', true);

  RETURN _item_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.commercial_change_set_remove_item(_item_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  PERFORM set_config('app.commercial_change_set_op', 'server', true);
  UPDATE public.commercial_assumption_change_sets
     SET change_count = (SELECT count(*) FROM public.commercial_assumption_change_set_items WHERE change_set_id = _cs),
         content_hash = public.commercial_change_set_hash(_cs),
         validation_summary = '{}'::jsonb
   WHERE id = _cs;
  PERFORM set_config('app.commercial_change_set_op', '', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.commercial_change_set_validate(_change_set_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  PERFORM set_config('app.commercial_change_set_op', 'server', true);
  UPDATE public.commercial_assumption_change_sets
     SET status = CASE WHEN _errors = 0 THEN 'validated' ELSE 'draft' END,
         validated_by = CASE WHEN _errors = 0 THEN auth.uid() ELSE validated_by END,
         validated_at = CASE WHEN _errors = 0 THEN now() ELSE validated_at END,
         validation_summary = jsonb_build_object(
           'valid', _valid, 'warnings', _warnings, 'errors', _errors,
           'ran_at', now(), 'ran_by', auth.uid())
   WHERE id = _change_set_id;
  PERFORM set_config('app.commercial_change_set_op', '', true);

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action_code, object_type, object_id, metadata)
  VALUES (_tenant, auth.uid(),
          CASE WHEN _errors = 0 THEN 'commercial.assumption.change_set.validation_passed'
               ELSE 'commercial.assumption.change_set.validation_failed' END,
          'commercial_assumption_change_set', _change_set_id::text,
          jsonb_build_object('errors', _errors, 'warnings', _warnings, 'valid', _valid));

  RETURN jsonb_build_object('valid', _errors = 0, 'errors', _errors, 'warnings', _warnings, 'ok', _valid);
END;
$function$;

CREATE OR REPLACE FUNCTION public.commercial_change_set_apply(_change_set_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    PERFORM set_config('app.commercial_change_set_op', 'server', true);
    UPDATE public.commercial_assumption_change_sets
       SET status = 'draft', validation_summary = jsonb_build_object('conflict', true, 'ran_at', now())
     WHERE id = _change_set_id;
    PERFORM set_config('app.commercial_change_set_op', '', true);
    INSERT INTO public.audit_events (tenant_id, actor_user_id, action_code, object_type, object_id, metadata)
    VALUES (_tenant, auth.uid(), 'commercial.assumption.change_set.conflict_detected',
            'commercial_assumption_change_set', _change_set_id::text,
            jsonb_build_object('expected_hash', _hash, 'current_hash', _cur_hash));
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

  PERFORM set_config('app.commercial_change_set_op', 'server', true);
  UPDATE public.commercial_assumption_change_sets
     SET status = 'applied', applied_by = auth.uid(), applied_at = now()
   WHERE id = _change_set_id;
  PERFORM set_config('app.commercial_change_set_op', '', true);

  INSERT INTO public.commercial_assumption_apply_log
    (tenant_id, program_id, model_version_id, change_set_id, content_hash, applied_item_count, impact_scopes, applied_by,
     snapshot)
  VALUES (_tenant, _prog, _ver, _change_set_id, _hash, _applied, _impact, auth.uid(),
    (SELECT jsonb_agg(to_jsonb(i)) FROM public.commercial_assumption_change_set_items i WHERE i.change_set_id = _change_set_id));

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action_code, object_type, object_id, metadata)
  VALUES (_tenant, auth.uid(), 'commercial.assumption.change_set.applied',
          'commercial_assumption_change_set', _change_set_id::text,
          jsonb_build_object('items', _applied, 'impact', _impact, 'hash', _hash));

  RETURN jsonb_build_object('applied', true, 'applied_items', _applied, 'impact_scopes', _impact);
END;
$function$;

CREATE OR REPLACE FUNCTION public.commercial_change_set_cancel(_change_set_id uuid, _reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _tenant UUID; _status TEXT;
BEGIN
  SELECT tenant_id, status INTO _tenant, _status
    FROM public.commercial_assumption_change_sets WHERE id = _change_set_id;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'change set not found' USING ERRCODE='23503'; END IF;
  IF _status NOT IN ('draft','validated') THEN
    RAISE EXCEPTION 'cannot cancel change set with status %', _status USING ERRCODE='22023';
  END IF;
  PERFORM public._commercial_require_perm(_tenant, 'commercial.assumption.change.cancel');

  PERFORM set_config('app.commercial_change_set_op', 'server', true);
  UPDATE public.commercial_assumption_change_sets
     SET status = 'cancelled', cancelled_by = auth.uid(), cancelled_at = now(), cancel_reason = _reason
   WHERE id = _change_set_id;
  PERFORM set_config('app.commercial_change_set_op', '', true);

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action_code, object_type, object_id, metadata, reason)
  VALUES (_tenant, auth.uid(), 'commercial.assumption.change_set.cancelled',
          'commercial_assumption_change_set', _change_set_id::text,
          jsonb_build_object('reason', _reason), _reason);
END;
$function$;