# BP3.1 — Commercial Model Runtime Architecture

**Status**: Completed and Validated (GO).

> **Closeout status note — 2026-07-26.** BP3.1 independent validation returned **GO**.
> This document also serves as the canonical BP3.1 assumption/runtime catalog. BP3 closeout
> documentation has been authored and is pending closeout execution and final closeout
> validation. See `docs/commercial/bp3-program-closeout.md`,
> `docs/commercial/bp3-evidence-index.md`, and package evidence in
> `docs/commercial/bp3-1-test-evidence.md`. The historical body below, including the seeded
> **draft** state of PM-FIN-2026.1, is preserved as written; PM-FIN-2026.1 is now **active**
> (`5097c3a9-021e-4b2c-9377-540a5d18ada6`, activated 2026-07-26 21:18:52.696359+00).

## Purpose

BP3.1 delivers the secure persistence and execution scaffolding required to run
Project Momentous model executions. It contains **no business formulas** and
**no calculated financial outputs**. Every value in the results table will be
written by an authorized server runtime in a later package (BP3.2+).

## Tables

| Table | Purpose | Client writes? |
|---|---|---|
| `commercial_model_versions` | Registered, fingerprinted model versions per program. Only one `active` version per program (partial unique index). | INSERT/UPDATE gated by `commercial.model.manage`. |
| `commercial_model_runs` | Run header with lifecycle (`queued`→`running`→`completed`/`failed`, with `superseded` terminal). Deterministic `input_hash` supports idempotent reuse. | **No.** All writes go through SECURITY DEFINER runtime functions. |
| `commercial_model_run_inputs` | Frozen snapshot of scenario assumptions used by the run. | **No.** Immutable once the run leaves `queued`. |
| `commercial_model_results` | Per-metric numeric/text outputs with lineage. | **No.** Only writable while the run is `running`; immutable after `completed`. |

## Permissions

| Permission | Commercial Admin | Commercial Analyst | Executive Viewer |
|---|---|---|---|
| `commercial.model.run` | ✔ | ✔ | — |
| `commercial.model.manage` | ✔ | — | — |
| `commercial.sensitivity.run` | ✔ | ✔ | — |

All reads still require `commercial.view` via `commercial_is_member_with_view`.

## Runtime functions

All are `SECURITY DEFINER`, `SET search_path = public`, `REVOKE FROM PUBLIC`,
`GRANT EXECUTE TO authenticated`, and check `commercial_can_write(...)` on the
resolved tenant before doing any write.

- `commercial_compute_input_hash(model_version, scenario, run_scope, formula_catalog_version, inputs jsonb) → text` — MD5 over a canonical serialization: model version, scenario, run scope, formula catalog version, and each assumption sorted by `assumption_code` with normalized numeric formatting, text, and unit.
- `commercial_snapshot_scenario_assumptions(scenario) → jsonb` — Returns the ordered assumption array for hashing/inputs, guarded by `commercial_is_member_with_view`.
- `commercial_model_run_start(program, scenario, model_version, run_scope) → { run_id, reused, input_hash }` — Requires `commercial.model.run` (or `commercial.sensitivity.run` for `sensitivity`). Computes the input hash; if an identical **completed** run exists for `(tenant, program, scenario, model_version, run_scope, input_hash)` it returns that run (`reused: true`) instead of creating a duplicate. Otherwise inserts a `queued` run and snapshots inputs.
- `commercial_model_run_mark_running(run_id)` — Transitions `queued → running`.
- `commercial_model_run_persist_result(run_id, metric_code, metric_group, formula_code, fiscal_period, period_sequence, value_numeric, value_text, unit, lineage_json, is_approximation) → uuid` — Only path to insert into `commercial_model_results`. Enforces `status = 'running'`.
- `commercial_model_run_complete(run_id)` — Transitions `running → completed`; results are frozen from this point.
- `commercial_model_run_fail(run_id, error_code, error_message)` — Transitions `queued|running → failed`.
- `commercial_model_run_supersede(run_id, superseded_by)` — Only path to transition a `completed` run to `superseded`. Requires `commercial.model.manage`.

## Immutability

Enforced by three triggers plus a header guard:

- `trg_cmri_guard` — `commercial_model_run_inputs` rejects any INSERT/UPDATE/DELETE when the parent run status ≠ `queued`.
- `trg_cmres_guard` — `commercial_model_results` rejects INSERT unless status = `running`; rejects UPDATE/DELETE once status ∈ (`completed`, `failed`, `superseded`).
- `trg_cmr_guard` — `commercial_model_runs` rejects any UPDATE/DELETE once status is terminal, except a single well-formed `completed → superseded` transition that touches only `status` and `supersedes_run_id`.

Direct client mutations on `runs`, `run_inputs`, and `results` are further blocked because those tables expose **no** RLS INSERT/UPDATE/DELETE policies to `authenticated`. Only the SECURITY DEFINER functions (which run as the table owner) can write.

## Idempotency contract

Given identical `(tenant, program, scenario, model_version, run_scope,
input_hash)` with a completed matching run, `commercial_model_run_start`
returns that run's UUID with `reused = true`. New runs are only created when
inputs, scope, or model version differ. `input_hash` is deterministic across
sessions because inputs are canonicalized (sorted assumption codes, normalized
numeric formatting via `FM999999999999999990.000000000000` trimming trailing
zeros, plus explicit text and unit fields).

## Audit events

`emit_audit_event` is called with **no financial payloads** for:

- `commercial.model.version.created`
- `commercial.model.run.created`
- `commercial.model.run.started`
- `commercial.model.run.completed`
- `commercial.model.run.failed`
- `commercial.model.run.superseded`

Payload contains `run_scope`, `input_hash`, `scenario_id`, and
`model_version_id` where relevant. Metric outputs are never logged.

## Seeded state

- One **draft** model version for Project Momentous:
  - `version_code = PM-FIN-2026.1`
  - `formula_catalog_version = bp3.0-catalog-v1`
  - `source_fingerprint = bp3.0-baseline`
  - `status = draft` (do not activate until BP3.8 validated)
- Zero rows in `commercial_model_runs`, `commercial_model_run_inputs`, `commercial_model_results`.
