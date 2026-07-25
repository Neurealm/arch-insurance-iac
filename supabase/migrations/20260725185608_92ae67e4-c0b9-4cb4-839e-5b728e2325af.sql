
-- BP3.5.1 audit contract repair: align commercial_change_set_* audit inserts
-- with canonical audit_events schema (action_code/object_type/object_id/metadata).

CREATE OR REPLACE FUNCTION public.commercial_change_set_create(_tenant_id uuid, _program_id uuid, _model_version_id uuid, _title text, _description text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action_code, object_type, object_id, metadata)
  VALUES (_tenant_id, auth.uid(), 'commercial.assumption.change_set.created',
          'commercial_assumption_change_set', _id::text,
          jsonb_build_object('title', trim(_title), 'model_version_id', _model_version_id, 'program_id', _program_id));
  RETURN _id;
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

  UPDATE public.commercial_assumption_change_sets
     SET status = CASE WHEN _errors = 0 THEN 'validated' ELSE 'draft' END,
         validated_by = CASE WHEN _errors = 0 THEN auth.uid() ELSE validated_by END,
         validated_at = CASE WHEN _errors = 0 THEN now() ELSE validated_at END,
         validation_summary = jsonb_build_object(
           'valid', _valid, 'warnings', _warnings, 'errors', _errors,
           'ran_at', now(), 'ran_by', auth.uid())
   WHERE id = _change_set_id;

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
    UPDATE public.commercial_assumption_change_sets
       SET status = 'draft', validation_summary = jsonb_build_object('conflict', true, 'ran_at', now())
     WHERE id = _change_set_id;
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

  UPDATE public.commercial_assumption_change_sets
     SET status = 'applied', applied_by = auth.uid(), applied_at = now()
   WHERE id = _change_set_id;

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

  UPDATE public.commercial_assumption_change_sets
     SET status = 'cancelled', cancelled_by = auth.uid(), cancelled_at = now(), cancel_reason = _reason
   WHERE id = _change_set_id;

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action_code, object_type, object_id, metadata, reason)
  VALUES (_tenant, auth.uid(), 'commercial.assumption.change_set.cancelled',
          'commercial_assumption_change_set', _change_set_id::text,
          jsonb_build_object('reason', _reason), _reason);
END;
$function$;
