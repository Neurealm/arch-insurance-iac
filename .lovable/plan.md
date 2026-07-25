# BP3.6 — Scenario Comparison Workspace

Governed comparison layer over validated BP3.2–BP3.5 runs. Read-only against runtimes; no formula recomputation in-browser; no automatic model execution.

## 1. Database (single migration)

New tables (tenant + program + model-version scoped, RLS on, GRANT to `authenticated` + `service_role`, no `anon`):

- `commercial_scenario_comparisons` — header
  - id, tenant_id, program_id, model_version_id, title, description, status (`draft|saved|archived`), mode (`pairwise|three_way|historical`), baseline_scenario_id, compared_scenario_ids (uuid[]), included_scopes (text[]), source_run_manifest (jsonb), source_run_manifest_hash, content_hash, stale_at_creation, created_by/at, updated_by/at, saved_by/at, archived_by/at.
- `commercial_scenario_comparison_results` — snapshot rows
  - comparison_id, tenant_id, metric_code, metric_group, period, unit, baseline_scenario_id, compared_scenario_id, baseline_run_id, compared_run_id, baseline_value, compared_value, absolute_variance, percentage_variance, variance_direction, direction_reason, comparison_rule, source_refs jsonb, lineage_refs jsonb, created_at.
- `commercial_metric_directionality` — seed metadata (metric_code, higher_is_favorable bool, category, unit_hint).

Guards:
- Immutability triggers: Saved rows block updates except archive fields; Archived fully immutable; results insert-only tied to draft-or-just-saved parent via transaction marker (reuse BP3.5 pattern).
- Status transitions via RPC only; direct status update blocked.

Permissions (into `permissions` + tenant_role bindings):
- `commercial.comparison.view`, `.create`, `.save`, `.archive`.

RPCs (`SECURITY DEFINER`, `SET search_path=public`, revoke from PUBLIC/anon, grant to authenticated):
- `commercial_comparison_create(program_id, model_version_id, mode, baseline_scenario_id, compared_scenario_ids, included_scopes, title, description)`
- `commercial_comparison_update_draft(id, ...)`
- `commercial_comparison_calculate(id, historical_run_ids jsonb default null)` — resolves manifest, reads persisted results, computes variance, returns rows (no persistence).
- `commercial_comparison_save(id, expected_content_hash)` — persists results + manifest + hashes + stale_at_creation.
- `commercial_comparison_archive(id)`.
- `commercial_comparison_list_selectable_runs(program_id, model_version_id, scenario_id, scope)` — completed, not superseded, tenant-matched.
- `commercial_comparison_resolve_manifest(id)`.

All RPCs write canonical audit events (`action_code` = `commercial.comparison.*`).

## 2. Run-selection & variance (server, in Postgres)

Inside RPCs:
- Reject failed/superseded/incomplete/cross-tenant/cross-program/cross-model-version/scenario mismatch.
- Align results by `(metric_code, metric_group, period, unit)`.
- Absolute = compared − baseline; Percentage = (compared − baseline) / abs(baseline) with documented zero-baseline rules.
- Direction from `commercial_metric_directionality` (favorable/unfavorable/neutral/not_applicable + reason).
- Content hash: deterministic sha256 of ordered JSON of normalized manifest + rows.

## 3. Effective assumption comparison

Reuse existing effective-value resolver. New RPC `commercial_comparison_assumptions(program_id, model_version_id, scenario_ids uuid[])` returns rows scenario-wide, excluding Draft/Cancelled proposals. Diff computed server-side vs baseline.

## 4. Readiness

Reuse `commercial_program_run_staleness` per scenario/scope; expose via `commercial_comparison_readiness(program_id, model_version_id, scenario_ids, scopes)`.

## 5. Frontend (`src/commercial/`)

Hooks:
- `useComparisons`, `useComparison(id)`, `useComparisonCalculate`, `useComparisonSave`, `useComparisonArchive`, `useSelectableRuns`, `useComparisonAssumptions`, `useComparisonReadiness`.

Pages/routes (register in `App.tsx` under existing `CommercialLayout`):
- `/commercial/model/compare` — list + config workspace.
- `/commercial/model/compare/:id` — detail (Draft editor or Saved/Archived viewer).

Components (`src/commercial/components/comparison/`):
- `ComparisonConfigPanel`, `ReadinessPanel`, `SummaryCards`, `ComparisonTable`, `AssumptionDiffTable`, `DriverOutcomePanel`, `SavedComparisonsList`, `SaveConfirmDialog`, `ArchiveConfirmDialog`, lightweight `VarianceBarChart` and `WaterfallChart` using existing recharts.

UI rules: stale badges + acknowledgement gate for Save; missing-run blocks scope; all values sourced from server RPC output; no client-side variance recomputation.

## 6. Tests

`supabase/functions/*` skipped (no new edge functions). SQL-driven tests via `docs/commercial/bp3-6-test-evidence.md` matrix executed manually with `supabase--read_query` in the EXECUTE step. Add Vitest unit tests for pure UI helpers (direction rendering, formatting, null handling).

## 7. Docs

- Create `docs/commercial/bp3-6-scenario-comparison.md` (architecture, contracts, matrices).
- Create `docs/commercial/bp3-6-test-evidence.md` (schema/service inventory, pending runtime evidence).
- Amend `docs/commercial/bp3-model-contract.md` with a comparison-snapshot section.
- Update `.lovable/plan.md`: BP3.5 Completed & Validated; BP3.6 Built, Pending Runtime Execution; BP3.7/BP3.8 Not Started; PM-FIN-2026.1 remains Draft.

## Technical constraints preserved

- No changes to `commercial-run-scenario`, existing runs, results, hashes, lineage, supersession, effective assumptions, staleness helper, or golden baselines.
- No `anon` grants; every new RPC revokes PUBLIC; RLS enforces `tenant_id = current tenant OR platform admin`.
- No automatic execution — Calculate reads persisted results only; Save persists comparison snapshot only.

## Deliverables order

1. Migration (schema + directionality seed + RPCs + audit + permissions + RLS).
2. Frontend hooks + pages + components + route registration.
3. Docs + plan update.

Reply `approve` to proceed.
