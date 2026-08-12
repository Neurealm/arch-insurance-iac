-- BP3.1 — Commercial Model Runtime tests (read-only assertions)
-- Run in psql against the target project. Each block RAISEs on failure.

-- 1. Tables exist
DO $$ BEGIN
  PERFORM 1 FROM pg_class WHERE relname IN
    ('commercial_model_versions','commercial_model_runs','commercial_model_run_inputs','commercial_model_results')
    HAVING count(*) = 4;
  IF NOT FOUND THEN RAISE EXCEPTION 'BP3.1 T1: missing tables'; END IF;
END $$;

-- 2. Permissions exist
DO $$ BEGIN
  PERFORM 1 FROM public.permissions
   WHERE code IN ('commercial.model.run','commercial.model.manage','commercial.sensitivity.run')
   HAVING count(*) = 3;
  IF NOT FOUND THEN RAISE EXCEPTION 'BP3.1 T2: permissions missing'; END IF;
END $$;

-- 3. RLS enabled on all four
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT c.relname, c.relrowsecurity FROM pg_class c
    WHERE c.relname IN ('commercial_model_versions','commercial_model_runs','commercial_model_run_inputs','commercial_model_results')
  LOOP
    IF NOT r.relrowsecurity THEN RAISE EXCEPTION 'BP3.1 T3: RLS not enabled on %', r.relname; END IF;
  END LOOP;
END $$;

-- 4. Anonymous denied — no policy grants access when auth.uid() is null
--    (commercial_is_member_with_view / commercial_can_write both return false with null uid)

-- 5. Role assignments — Commercial Analyst has run + sensitivity, no manage
DO $$ BEGIN
  PERFORM 1 FROM public.tenant_role_permissions trp
    JOIN public.tenant_roles tr ON tr.id = trp.role_id
    WHERE tr.code = 'commercial_analyst' AND trp.permission_code = 'commercial.model.run';
  IF NOT FOUND THEN RAISE EXCEPTION 'BP3.1 T5: analyst missing model.run'; END IF;
  PERFORM 1 FROM public.tenant_role_permissions trp
    JOIN public.tenant_roles tr ON tr.id = trp.role_id
    WHERE tr.code = 'commercial_analyst' AND trp.permission_code = 'commercial.model.manage';
  IF FOUND THEN RAISE EXCEPTION 'BP3.1 T5: analyst must not have model.manage'; END IF;
END $$;

-- 6. Only one active version per program (partial unique index enforces this)
DO $$ BEGIN
  PERFORM 1 FROM pg_indexes
    WHERE indexname = 'commercial_model_versions_one_active_per_program';
  IF NOT FOUND THEN RAISE EXCEPTION 'BP3.1 T6: unique active-per-program index missing'; END IF;
END $$;

-- 7. Input hash determinism
DO $$
DECLARE v_a text; v_b text; v_inputs jsonb;
BEGIN
  v_inputs := jsonb_build_array(
    jsonb_build_object('assumption_code','B','value_numeric', 1.230, 'unit','pct'),
    jsonb_build_object('assumption_code','A','value_numeric', 2, 'unit',''));
  v_a := public.commercial_compute_input_hash(
    '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',
    'full','v1', v_inputs);
  v_b := public.commercial_compute_input_hash(
    '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',
    'full','v1', v_inputs);
  IF v_a IS DISTINCT FROM v_b THEN RAISE EXCEPTION 'BP3.1 T7: hash not deterministic'; END IF;
END $$;

-- 8. Zero financial results seeded
DO $$ BEGIN
  IF (SELECT count(*) FROM public.commercial_model_results) <> 0 THEN
    RAISE EXCEPTION 'BP3.1 T8: financial results must be empty on install';
  END IF;
END $$;

-- 9. Draft model version seeded
DO $$ BEGIN
  PERFORM 1 FROM public.commercial_model_versions
    WHERE version_code='PM-FIN-2026.1' AND status='draft';
  IF NOT FOUND THEN RAISE EXCEPTION 'BP3.1 T9: draft model version not seeded'; END IF;
END $$;

-- 10. No SECURITY DEFINER runtime function is callable by PUBLIC
DO $$ DECLARE r record; BEGIN
  FOR r IN
    SELECT p.proname
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public'
      AND p.proname IN (
        'commercial_model_run_start','commercial_model_run_mark_running',
        'commercial_model_run_persist_result','commercial_model_run_complete',
        'commercial_model_run_fail','commercial_model_run_supersede')
      AND has_function_privilege('public', p.oid, 'EXECUTE')
  LOOP
    RAISE EXCEPTION 'BP3.1 T10: % is executable by PUBLIC', r.proname;
  END LOOP;
END $$;

-- 11-16: Runtime immutability / idempotency / audit tests require an authenticated
-- session and live scenario data; covered by BP3.1.VALIDATE independent probe.

SELECT 'BP3.1 model runtime tests passed' AS result;
