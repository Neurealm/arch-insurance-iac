# BP3.1 — Test Evidence

**Status**: Completed and Validated (GO).

> **Closeout status note — 2026-07-26.** BP3.1.VALIDATE returned **GO**. BP3 closeout
> documentation has been authored and is pending closeout execution and final closeout
> validation. See `docs/commercial/bp3-program-closeout.md` and
> `docs/commercial/bp3-evidence-index.md`. The historical test evidence below is preserved
> unchanged.

## Automated harness

`supabase/tests/bp3_1_model_runtime.sql` runs 10 in-database assertions:

1. All four runtime tables exist (`commercial_model_versions`, `commercial_model_runs`, `commercial_model_run_inputs`, `commercial_model_results`).
2. Three permission codes exist (`commercial.model.run`, `commercial.model.manage`, `commercial.sensitivity.run`).
3. RLS is enabled on all four tables.
4. Anonymous access is denied via `commercial_is_member_with_view` (returns false when `auth.uid()` is null).
5. Commercial Analyst has `commercial.model.run` and does **not** have `commercial.model.manage`.
6. Partial unique index `commercial_model_versions_one_active_per_program` enforces one active version per program.
7. `commercial_compute_input_hash` is deterministic across repeated calls with the same inputs.
8. Zero rows exist in `commercial_model_results` immediately after install.
9. The `PM-FIN-2026.1` draft model version is seeded for Project Momentous.
10. No SECURITY DEFINER runtime function is executable by `PUBLIC` (all revoked; only `authenticated` may execute).

Run:

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/bp3_1_model_runtime.sql
```

Expected final row: `BP3.1 model runtime tests passed`.

## Live-session assertions (deferred to BP3.1.VALIDATE)

The following require an authenticated Supabase session and are covered in the
independent validation probe rather than in the SQL harness:

- Analyst can call `commercial_model_run_start` → run created, inputs snapshotted, `commercial.model.run.created` audit event emitted.
- Second call with unchanged assumptions → `reused = true` and no new run row.
- Any change to a `commercial_scenario_assumptions` value produces a different `input_hash`.
- After `commercial_model_run_mark_running`, a direct `INSERT INTO commercial_model_results` from an authenticated client is denied (no RLS INSERT policy).
- After `commercial_model_run_complete`, attempts to `UPDATE`/`DELETE` inputs or results raise the immutability exceptions from the guard triggers.
- After completion, updating the run header fields other than `status → superseded` raises `commercial_run_immutable_after_terminal_state`.
- Cross-tenant probe: a member of a different tenant cannot see runs, inputs, or results from `neugain-commercial`.
- Executive Viewer role cannot execute `commercial_model_run_start` (permission denied).

## Financial results created

**None.** `SELECT count(*) FROM public.commercial_model_results = 0`.
