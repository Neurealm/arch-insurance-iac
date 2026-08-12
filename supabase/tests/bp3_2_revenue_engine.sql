-- BP3.2 Revenue Engine — SQL test evidence harness
-- Read-only assertions verifying schema, seed, permissions, and (optionally) run outputs.
-- Run in a psql session against the tenant DB.

\echo === BP3.2 assertion 1: constants seeded for all 3 scenarios ===
SELECT
  s.code AS scenario,
  count(*) FILTER (WHERE a.assumption_code IN (
    'CONV_REBATE_PCT','CONV_EXPAND_PCT','CONV_MS_PCT',
    'AVG_ARR_PER_CUSTOMER_MUSD','GROWTH_ACCEL_THRESHOLD_PCT','COST_ESCALATOR_PCT',
    'EAR_POOL_FY2027_MUSD','EAR_POOL_FY2028_MUSD','EAR_POOL_FY2029_MUSD',
    'EAR_POOL_FY2030_MUSD','EAR_POOL_FY2031_MUSD'
  )) AS bp3_2_constant_count
FROM commercial_scenarios s
JOIN commercial_scenario_assumptions a ON a.scenario_id = s.id
JOIN commercial_programs p ON p.id = s.program_id
WHERE p.code = 'PROJECT_MOMENTOUS'
GROUP BY s.code
ORDER BY s.code;
-- EXPECT: 11 per scenario (BASE, CONSERVATIVE, UPSIDE).

\echo === BP3.2 assertion 2: batch-persist RPC is not executable by anon/PUBLIC ===
SELECT
  n.nspname, p.proname,
  has_function_privilege('anon', p.oid, 'EXECUTE')          AS anon_exec,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_exec,
  has_function_privilege('public', p.oid, 'EXECUTE')        AS public_exec
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname='public' AND p.proname='commercial_model_run_persist_results_batch';
-- EXPECT: anon_exec=false, public_exec=false, auth_exec=true.

\echo === BP3.2 assertion 3: unique-assumption index exists ===
SELECT indexname FROM pg_indexes
WHERE tablename='commercial_scenario_assumptions'
  AND indexname='commercial_scenario_assumptions_unique_code';
-- EXPECT: one row.

\echo === BP3.2 assertion 4: model_results parity — Base FY27 ===
-- Post-run assertion. Requires at least one completed BASE revenue run.
WITH r AS (
  SELECT run.id
  FROM commercial_model_runs run
  JOIN commercial_scenarios s ON s.id = run.scenario_id
  WHERE s.code='BASE' AND run.run_scope='revenue' AND run.status='completed'
  ORDER BY run.completed_at DESC LIMIT 1
)
SELECT metric_code, value_numeric
FROM commercial_model_results
WHERE run_id = (SELECT id FROM r) AND fiscal_period='FY2027'
  AND metric_code IN ('VOL-CUM-ACT','VOL-NEW-ACT','REV-ACT-ARR','REV-01-BASE-REB','REV-TOTAL')
ORDER BY metric_code;
-- EXPECTED (Base FY27, ±0.5% tolerance for revenue lines):
--   VOL-CUM-ACT       = 30
--   VOL-NEW-ACT       = 30
--   REV-ACT-ARR       ≈ 37,200,000
--   REV-01-BASE-REB   ≈ 814,000
--   REV-TOTAL         ≈ 4,935,232  (sum of the 11 revenue streams for Base FY27)

\echo === BP3.2 assertion 5: immutability guard on completed runs ===
-- Attempts an update of a completed run's status; MUST error with 42501/immutable-guard.
-- Wrapped in a savepoint so it doesn't abort the session.
BEGIN;
SAVEPOINT s1;
DO $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM commercial_model_runs WHERE status='completed' LIMIT 1;
  IF v_id IS NOT NULL THEN
    BEGIN
      UPDATE commercial_model_runs SET status='queued' WHERE id=v_id;
      RAISE NOTICE 'FAIL: mutation allowed on completed run';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'PASS: mutation blocked (%): %', SQLSTATE, SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'SKIP: no completed run yet';
  END IF;
END $$;
ROLLBACK TO SAVEPOINT s1;
ROLLBACK;

\echo === BP3.2 assertion 6: no cost / opex / cash / sensitivity rows written ===
SELECT metric_group, count(*) AS n
FROM commercial_model_results
GROUP BY metric_group
ORDER BY metric_group;
-- EXPECT: only 'volume', 'revenue_base', 'revenue_stream', 'revenue_total'.
