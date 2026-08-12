-- BP3.4.1: cache invalidation for corrected cash formula
-- 1. Patch run start to fold a scope-specific formula fingerprint into the hash.
--    Revenue and P&L map to '' → hash unchanged. Cash maps to 'bp3.4.1' → new hash.
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
  v_scope_fp text;
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

  -- Scope-specific formula fingerprint. Revenue/P&L stay '' (hash unchanged).
  -- Cash bumps to 'bp3.4.1' to invalidate the pre-patch defective cache entries.
  v_scope_fp := CASE _run_scope
                  WHEN 'cash' THEN 'bp3.4.1'
                  ELSE ''
                END;
  IF v_scope_fp <> '' THEN
    v_catalog := v_catalog || '|scope=' || _run_scope || '|fp=' || v_scope_fp;
  END IF;

  v_inputs := public.commercial_snapshot_scenario_assumptions(_scenario_id);
  v_hash   := public.commercial_compute_input_hash(_model_version_id, _scenario_id, _run_scope, v_catalog, v_inputs);

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

REVOKE ALL ON FUNCTION public.commercial_model_run_start(uuid,uuid,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.commercial_model_run_start(uuid,uuid,uuid,text) TO authenticated;

-- 2. Mark the three pre-patch cash runs as superseded (self-reference until
--    the corrected runs exist; they are preserved as immutable historical evidence).
UPDATE public.commercial_model_runs
   SET status = 'superseded',
       supersedes_run_id = id
 WHERE run_scope = 'cash'
   AND status = 'completed'
   AND id IN (
     'e79ba517-4158-4516-8e37-62f09005139a',
     'd225ea9f-5a77-44d5-bd81-5dc64d2da5f2',
     '93f33caf-838f-4ee2-9b49-c3dfa671e43d'
   );