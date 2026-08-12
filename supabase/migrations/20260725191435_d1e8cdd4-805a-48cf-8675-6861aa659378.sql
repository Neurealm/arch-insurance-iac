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

  UPDATE public.commercial_assumption_change_sets h
     SET change_count = (SELECT count(*) FROM public.commercial_assumption_change_set_items WHERE change_set_id = _change_set_id),
         content_hash = _hash,
         validation_summary = '{}'::jsonb
   WHERE h.id = _change_set_id;

  RETURN _item_id;
END;
$function$;