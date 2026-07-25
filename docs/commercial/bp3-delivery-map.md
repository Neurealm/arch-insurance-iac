# BP3 — Delivery Map

Sequenced work required to move from the BP3.0 contract to a fully validated,
persisted calculation engine.

BP3.0 (this package) freezes the contract. BP3.1–BP3.8 implement it. No BP3.1+
work may begin until BP3.0 is independently validated.

## Sequence

| ID | Title | Status | Depends on |
|---|---|---|---|
| BP3.0 | Commercial Modeling Source, Formula, Precision & Golden Baseline Contract | **Built, Pending Independent Validation** | BP2.6 GO |
| BP3.1 | Engine Schema, Run Governance & Permissions | Not Started | BP3.0 validated |
| BP3.2 | Deterministic TS Domain Engine (Volumes, Revenue, COD, OPEX, EBITDA, FTE) | Not Started | BP3.1 |
| BP3.3 | Engine — Scenario Summary, Cash/WC, Break-Even & Payback | Not Started | BP3.2 |
| BP3.4 | Engine — Sensitivity, Terms Interpretation | Not Started | BP3.3 |
| BP3.5 | Supabase Edge Function `commercial-run-scenario` + RLS wiring | Not Started | BP3.4 |
| BP3.6 | Golden-diff Test Harness & CI Gate | Not Started | BP3.2..BP3.5 |
| BP3.7 | Commercial UI — Run controls, output panels, delta and sensitivity views | Not Started | BP3.5, BP3.6 |
| BP3.8 | Documentation, Operator Guide, Release Evidence & BP3 Completion | Not Started | BP3.7 |

## BP3.1 — Engine Schema, Run Governance & Permissions

- Tables (all tenant-scoped, RLS on, GRANTs in same migration):
  `commercial_model_runs`, `commercial_model_run_outputs`,
  `commercial_model_run_inputs` (assumption snapshot),
  `commercial_terms_recommendation` (static narrative).
- New permission code: `commercial.calculation.execute`.
- Same-tenant triggers on every table.
- pgTAP regression under `supabase/tests/bp3_1_engine_schema.sql`.

## BP3.2 — Deterministic TS Domain Engine (Volumes → EBITDA)

- Location: `src/commercial/engine/` (server-shared module).
- Modules: `inputs.ts`, `volumes.ts`, `revenue.ts`, `cod.ts`, `opex.ts`,
  `ebitda.ts`, `fte.ts`, `index.ts`.
- Every function is pure, typed, and tagged with a `source_formula_id`.
- Vitest coverage: 100% of formulas in `bp3-formula-catalog.md` §1–§7.

## BP3.3 — Summary, Cash/WC, Break-Even, Payback

- `summary.ts`, `cashflow.ts`, `breakeven.ts`.
- Payback + sustained-profitability rules per Formula Catalog §10.

## BP3.4 — Sensitivity & Terms

- `sensitivity.ts` implements SENS-01..SENS-12 + SENS-CASH-LAG.
- Static `terms_recommendation` loader.

## BP3.5 — Supabase Edge Function

- `supabase/functions/commercial-run-scenario/index.ts`.
- Verifies JWT, checks `commercial.calculation.execute`.
- Runs the engine with an assumption snapshot in a single transaction.
- Emits audit event `commercial.model.run.completed`.

## BP3.6 — Golden-diff Harness & CI Gate

- Vitest suite that loads the frozen workbook golden values
  (`bp3-golden-output-baseline.md`) and diffs the engine outputs cell-by-cell.
- CI gate: PR merges blocked on any variance exceeding tolerances.

## BP3.7 — Commercial UI

- New pages/panels for Portfolio → Model Results, EBITDA charts, sensitivity
  heatmap, terms recommendation.
- All rendered from persisted outputs — the browser never recomputes.
- Uses existing `useCommercialAccess` and `PermissionRoute` scaffolding.

## BP3.8 — Release Evidence

- `docs/commercial/bp3-release-evidence.md` capturing golden-diff results,
  security scan, RLS tests, and operator runbook.
- `.lovable/plan.md` update marking BP3 complete.

## Non-Goals for BP3

- Account import (deferred to BP4).
- NPV / IRR / discounted cash flow.
- Approval governance workflow (post-BP4).
- External CRM/ERP integration.
- Exports (CSV/XLSX/PDF).
