CREATE OR REPLACE FUNCTION public.commercial_change_set_apply(_change_set_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _tenant UUID; _prog UUID; _ver UUID; _status TEXT; _hash TEXT; _cur_hash TEXT;
  _applied INT := 0; _impact TEXT[] := ARRAY[]::TEXT[]; _scenarios UUID[] := ARRAY[]::UUID[]; _rec RECORD;
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
    IF NOT (_rec.scenario_id = ANY(_scenarios)) THEN
      _scenarios := _scenarios || _rec.scenario_id;
    END IF;
  END LOOP;

  PERFORM set_config('app.commercial_change_set_op', 'server', true);
  UPDATE public.commercial_assumption_change_sets
     SET status = 'applied', applied_by = auth.uid(), applied_at = now()
   WHERE id = _change_set_id;
  PERFORM set_config('app.commercial_change_set_op', '', true);

  INSERT INTO public.commercial_assumption_apply_log
    (tenant_id, program_id, model_version_id, change_set_id, scenario_ids, impacted_scopes, content_hash, applied_by)
  VALUES (_tenant, _prog, _ver, _change_set_id, _scenarios, _impact, _hash, auth.uid());

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action_code, object_type, object_id, metadata)
  VALUES (_tenant, auth.uid(), 'commercial.assumption.change_set.applied',
          'commercial_assumption_change_set', _change_set_id::text,
          jsonb_build_object('items', _applied, 'impact', _impact, 'hash', _hash));

  RETURN jsonb_build_object('applied', true, 'applied_items', _applied, 'impact_scopes', _impact);
END;
$function$;