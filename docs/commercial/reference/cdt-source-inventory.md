# CDT Source Inventory

Status: Foundation (CDT-REFERENCE-FOUNDATION, 2026-07-26). Read-only inspection.
Confidence codes per `cdt-reference-authoring-standard.md` §4.

---

## 1. Commercial module boundary

The Commercial Digital Twin is the code and data reachable from the `/commercial`
route mount. It is distinct from RunOps (`/runops`), AVEP (`/ai-vlsi-engineering`),
Platform (`/platform`), CRM, ETDM, and questionnaire modules.

| Boundary dimension | Included | Confidence |
|---|---|---|
| Routes | `/commercial` and all descendants (17 route entries) | C2 |
| Source tree | `src/commercial/**` (shell, pages, hooks, components) | C2 |
| Shared platform code | `src/platform/access/AccessContext.tsx`, `src/components/auth/PermissionRoute.tsx`, `src/components/auth/ProtectedRoute.tsx`, `src/platform/components/States.tsx` | C2 |
| Edge Function | `supabase/functions/commercial-run-scenario` | C2 |
| Database tables | 27 tables prefixed `commercial_` | C3 |
| Permissions | codes prefixed `commercial.` | C2/C3 |
| Explicitly out of scope | RunOps, AVEP, Silicon, CRM, ETDM, questionnaires, generic platform admin screens | C2 |

---

## 2. Application source inventory

### 2.1 Route registration — `src/App.tsx` lines 870–886 (C2)

All 17 Commercial routes are registered under a single `CommercialLayout` element
route; each leaf is wrapped in `PermissionRoute permission="commercial.view"`.

### 2.2 Shell and providers (C2)

| File | Role |
|---|---|
| `src/commercial/shell/CommercialLayout.tsx` | `ProtectedRoute` → `AccessProvider` → `Shell` (Sidebar, Header, Breadcrumb, tenant selector, tenant-required state) |
| `src/platform/access/AccessContext.tsx` | Tenant list, active tenant, `hasPermission`, `isPlatformAdmin` |
| `src/commercial/hooks/useCommercialAccess.ts` | Canonical commercial access snapshot and `commercialQueryKey` factory |

Navigation is the in-file `NAV` array in `CommercialLayout.tsx`; there is no separate
Commercial navigation configuration file.

### 2.3 Page components — 16 files (C2)

| Component | Lines |
|---|---|
| `CommercialOverview.tsx` | 291 |
| `CommercialProgram.tsx` | 101 |
| `CommercialPortfolio.tsx` | 77 |
| `CommercialScenarios.tsx` | 380 |
| `CommercialSources.tsx` | 56 |
| `CommercialRevenue.tsx` | 478 |
| `CommercialPnl.tsx` | 396 |
| `CommercialCash.tsx` | 423 |
| `CommercialAssumptions.tsx` | 387 |
| `CommercialAssumptionChangeSet.tsx` | 308 |
| `CommercialCompare.tsx` | 242 |
| `CommercialCompareDetail.tsx` | 305 |
| `CommercialSensitivity.tsx` | 223 |
| `CommercialSensitivityDetail.tsx` | 264 |
| `CommercialRelease.tsx` | 139 |
| `CommercialReleaseDetail.tsx` | 453 |

### 2.4 Shared components (C2)

| Component | Role |
|---|---|
| `DirectionalBanner.tsx` | Directional-assumption disclaimer on foundation screens |
| `SeedMomentousButton.tsx` | Invokes `seed_project_momentous_foundation` |
| `SeedScenariosButton.tsx` | Invokes `seed_project_momentous_scenarios` |

### 2.5 Hooks — 10 files (C2)

| Hook | Reads | Writes / RPCs |
|---|---|---|
| `useCommercialAccess.ts` | AccessContext | none |
| `useProjectMomentous.ts` | `commercial_programs`, `commercial_stage_gates`, `commercial_program_metrics`, `commercial_source_references` | none |
| `useProjectMomentousScenarios.ts` | `commercial_programs`, `commercial_scenarios`, `commercial_scenario_assumptions` | direct writes (see `GAP-01`) |
| `useRevenueRuns.ts` | programs, scenarios, model_versions, model_runs, model_results | Edge Function `commercial-run-scenario` |
| `usePnlRuns.ts` | as above | Edge Function `commercial-run-scenario` |
| `useCashRuns.ts` | as above | Edge Function `commercial-run-scenario` |
| `useAssumptionChangeSets.ts` | programs, scenarios, model_versions, scenario_assumptions, change_sets, change_set_items | `commercial_program_run_staleness`, `commercial_change_set_create` / `_upsert_item` / `_remove_item` / `_validate` / `_apply` / `_cancel` |
| `useComparisons.ts` | `commercial_scenario_comparisons`, `commercial_scenario_comparison_results` | `commercial_comparison_calculate` / `_readiness` / `_assumptions` / `_create` / `_save` / `_archive` |
| `useSensitivity.ts` | `commercial_sensitivity_experiments` / `_perturbations` / `_results` | `commercial_sensitivity_create` / `_start_execution` / `_fail` / `_finalize` / `_archive` / `_reset_to_draft`, Edge Function |
| `useModelRelease.ts` | programs, model_versions, release_certifications, release_lineage, model_activations | `commercial_release_readiness`, `commercial_release_certification_create` / `_refresh` / `_certify` / `_invalidate`, `commercial_model_version_activate`, `commercial_model_version_create_successor` |

### 2.6 Edge Function (C2)

`commercial-run-scenario` — the single runtime entry point, invoked with scope
`revenue`, `pnl`, `cash`, and in sensitivity mode. Called from four hooks.

---

## 3. Database object inventory (C3)

### 3.1 Tables in scope (27)

Foundation: `commercial_programs`, `commercial_stage_gates`,
`commercial_program_metrics`, `commercial_source_references`,
`commercial_accounts`, `commercial_scenarios`, `commercial_scenario_assumptions`,
`commercial_metric_directionality`.

Model runtime: `commercial_model_versions`, `commercial_model_runs`,
`commercial_model_run_inputs`, `commercial_model_results`.

Governed assumptions: `commercial_assumption_change_sets`,
`commercial_assumption_change_set_items`, `commercial_assumption_apply_log`.

Comparison: `commercial_scenario_comparisons`,
`commercial_scenario_comparison_results`.

Sensitivity: `commercial_sensitivity_experiments`,
`commercial_sensitivity_perturbations`, `commercial_sensitivity_results`,
`commercial_sensitivity_runs`, `commercial_sensitivity_run_results`.

Release: `commercial_release_certifications`, `commercial_release_lineage`,
`commercial_model_activations`.

### 3.2 Database functions referenced by the UI (28)

Seeding (2), staleness (1), change-set lifecycle (6), comparison (6),
sensitivity (6), release (7). All are `SECURITY DEFINER` with pinned `search_path`
per the BP3 closeout audit (C5).

---

## 4. Documentation source inventory (C5)

| Document | Role |
|---|---|
| `docs/commercial/architecture.md` | Module architecture (stale header — DEF-07) |
| `docs/commercial/bp2-delivery-map.md`, `bp3-delivery-map.md` | Package delivery mapping |
| `docs/commercial/bp3-model-contract.md` | Model implementation contract |
| `docs/commercial/bp3-formula-catalog.md` | Formula catalogue |
| `docs/commercial/bp3-source-cell-map.md` | Workbook cell → formula mapping |
| `docs/commercial/bp3-golden-output-baseline.md` | Golden parity baseline |
| `docs/commercial/bp3-1-runtime-architecture.md` | Run runtime and immutability |
| `docs/commercial/bp3-2-revenue-formulas.md` | Revenue engine formulas |
| `docs/commercial/bp3-3-pnl-formulas.md` | P&L engine formulas |
| `docs/commercial/bp3-4-cash-formulas.md` | Cash engine formulas |
| `docs/commercial/bp3-5-governed-assumptions.md` | Change-set governance |
| `docs/commercial/bp3-6-scenario-comparison.md` | Comparison snapshots |
| `docs/commercial/bp3-7-sensitivity.md` | Sensitivity engine |
| `docs/commercial/bp3-8-release-activation.md` | Certification and activation |
| `docs/commercial/bp3-program-closeout.md` | Authoritative closeout record |
| `docs/commercial/bp3-evidence-index.md` | Consolidated evidence index |
| `docs/commercial/bp3-operational-handoff.md` | Support boundaries and escalation |
| `docs/commercial/bp3-deferred-items.md` | Deferred-item register (DEF-01…DEF-09) |
| `docs/commercial/bp3-closeout-execution-evidence.md` | Closeout execution record |
| `docs/commercial/bp3-closeout-validation-evidence.md` | Independent closeout validation (GO) |
| `docs/commercial/known-limitations.md`, `operator-guide.md`, `source-truth-register.md` | Supporting guidance |
| `.lovable/plan.md` | Programme status — BP3 Closed |
| `bp3-*-test-evidence.md` (BP3.1–BP3.8) | Verification history (C7 for current behaviour) |

---

## 5. Runtime evidence inventory (C4, as recorded at BP3 closeout)

| Artefact | Value |
|---|---|
| Active model version | `PM-FIN-2026.1` (`5097c3a9-021e-4b2c-9377-540a5d18ada6`) |
| Certification | `86f09fd7…` — certified, 21 pass / 1 warn / 0 block |
| Activation | `eefc6c50-b73f-41d3-8def-f6ff244000d9`, 2026-07-26 21:18:52 UTC |
| Manifest hash | `b76a08ee…` |
| Readiness hash | `d99ed93e…` |
| Model runs | 18 completed (9 authoritative) |
| Run inputs / results | 3,033 / 2,324 |
| Assumptions | 456 |
| Release lineage rows | 22 |
| Comparisons | 2 (996 comparison results) |
| Sensitivity experiments | 1 (1,660 results) |

---

## 6. Source disagreements recorded

| ID | Disagreement | Disposition |
|---|---|---|
| `GAP-01` | `CommercialScenarios` writes assumption values directly, while BP3.5 establishes change sets as the governed path | Record both; deployed behaviour is the current-state authority; do not reconcile |
| `GAP-02` | `bp3-delivery-map.md` and `architecture.md` carry stale "Pending Independent Validation" headers (DEF-07) | Historical only; closeout documents are authoritative |
