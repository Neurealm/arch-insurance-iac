# BP3.6 — Scenario Comparison Workspace

## Purpose
Governed analytical layer over persisted BP3.2–BP3.5 outputs. Enables pairwise, three-way, and historical scenario comparison without recomputing financial formulas, mutating runs, or auto-executing the model.

## Architecture
- **Comparison service** — `commercial_comparison_calculate(_comparison_id)` server-authoritative variance calculation.
- **Run-selection service** — `commercial_comparison_list_selectable_runs`, `commercial_comparison_build_manifest` reject failed/superseded/cross-context runs.
- **Snapshot service** — `commercial_comparison_save` persists immutable results + manifest + hashes.
- **Readiness service** — `commercial_comparison_readiness` wraps `commercial_program_run_staleness`.
- **Assumption-comparison** — `commercial_comparison_assumptions` reads `commercial_scenario_assumptions` (Applied only).
- **UI boundary** — pages/hooks in `src/commercial/pages/CommercialCompare*.tsx` + `src/commercial/hooks/useComparisons.ts` (display only).
- **Runtime boundary** — no calls to `commercial-run-scenario`; no writes to runs/results/lineage.

## Data model
| Table | Purpose |
|---|---|
| `commercial_scenario_comparisons` | Header (tenant, program, model version, mode, baseline, compared, scopes, manifest, hashes, lifecycle) |
| `commercial_scenario_comparison_results` | Immutable snapshot rows persisted on Save |
| `commercial_metric_directionality` | Metric-code → higher_is_favorable metadata |

## Comparison modes
- **pairwise** — baseline vs 1 compared scenario.
- **three_way** — baseline vs 2 compared scenarios (Conservative, Base, Upside).
- **historical** — same shape; consumer selects earlier completed runs.

## Run-selection policy
Enforced inside `commercial_comparison_build_manifest`:
- Only `status = 'completed'` runs.
- Filter by tenant + program + model_version + scenario + scope.
- Ordered by `completed_at DESC` (latest first).
- Missing → manifest entry `status='missing'`; visible in readiness; blocks the compared row.

## Readiness
- Emits per (scenario, scope): `is_stale`, `latest_run_id`, `latest_completed_at`, `latest_apply_at`, `is_missing`.
- Any-stale → Save persists `stale_at_creation = true`.
- Any-missing → row absent from comparison output.

## Metric alignment
Key: `(metric_code, metric_group, fiscal_period, unit, scope)`.
Mismatched unit rows are dropped (unit is part of the join key).

## Variance rules
- `absolute = compared - baseline`.
- `percentage = (compared - baseline) / abs(baseline)`.
- baseline=0 & compared=0 → 0.
- baseline=0 & compared≠0 → NULL, reason `undefined_zero_baseline`.
- NULL input → NULL variance, direction `not_applicable`.

## Directionality
Server-side via `commercial_metric_directionality`:
- Higher favorable: Revenue, Volume, Gross Profit, Gross Margin, EBITDA, EBITDA Margin, Cash, WC-Trough, Sustainability.
- Lower favorable: Direct Cost, Staffing, OPEX, Max Funding, Break-even, Payback.
- Missing metadata → `not_applicable` with reason `no_directionality_metadata`.

## Assumption comparison
- Reads `commercial_scenario_assumptions` (Applied values only).
- Draft/Cancelled change-set proposals are excluded by design (never mutate this table).

## Source-run manifest
JSON keyed by `<scope>:<scenario_id>` with `run_id`, `input_hash`, `completed_at`, `status`.
Manifest hash = sha256 of manifest JSON.
Immutable after Save.

## Deterministic hashing
`commercial_comparison_compute_hash` = sha256 of:
`v1|tenant|program|model_version|mode|baseline|compared_ids|scopes|manifest_json|ordered_rows_json`.
Excludes actor, timestamps, display state.

## Lifecycle
- `draft` — mutable via `commercial_comparison_update_draft`.
- `saved` — snapshot + manifest + hashes frozen; only Archive allowed.
- `archived` — fully read-only.
Transitions gated by transaction-local marker `app.commercial_comparison_op = 'server'`; direct client status updates raise `commercial_comparison_status_must_use_rpc`.

## Permissions
- `commercial.comparison.view` (Analyst, Admin).
- `commercial.comparison.create` (Analyst, Admin).
- `commercial.comparison.save` (Analyst, Admin).
- `commercial.comparison.archive` (Admin only).

## RLS
- SELECT: `commercial_is_member_with_view(tenant_id)`.
- INSERT/UPDATE/DELETE on headers: `commercial_can_write(tenant_id, 'commercial.comparison.create')`.
- Results table: no client writes; guard requires server marker + parent status `draft`/`saved`.
- All SECURITY DEFINER functions pin `search_path=public` and revoke from PUBLIC/anon.

## Audit
Canonical `emit_audit_event` for: created, updated, saved, archived. Payloads include comparison IDs, hashes, and stale flags.

## UI
- `/commercial/model/compare` — list + create workspace.
- `/commercial/model/compare/:id` — readiness, variance table, key-metric summary, assumption diffs, source-run manifest.
- Save & Archive gated behind confirmation dialogs.

## Deferred
- Sensitivity analysis (BP3.7).
- Lineage enrichment + model activation (BP3.8).
- Exports, cross-program comparison, AI narratives.
