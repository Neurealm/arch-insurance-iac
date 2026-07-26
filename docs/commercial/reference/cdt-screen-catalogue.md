# CDT Screen Catalogue

Status: Foundation (CDT-REFERENCE-FOUNDATION, 2026-07-26).
Confidence codes per authoring standard §4. All entries are C2 (application source)
unless otherwise noted. 17 routes / 16 screens (one route is the layout shell).

Route guard for every leaf: `PermissionRoute permission="commercial.view"` inside
`CommercialLayout` (`ProtectedRoute` → `AccessProvider` → tenant-required Shell).

---

## 1. Route and navigation matrix

| Screen ID | Route | Nav label | Nav group | Operating level |
|---|---|---|---|---|
| `SCR-00` | `/commercial` (layout) | — | — | Tenant |
| `SCR-01` | `/commercial` (index) | Overview | Commercial | Program |
| `SCR-02` | `/commercial/program` | Program | Commercial | Program |
| `SCR-03` | `/commercial/scenarios` | Scenarios | Commercial | Scenario |
| `SCR-04` | `/commercial/portfolio` | Portfolio | Commercial | Program |
| `SCR-05` | `/commercial/sources` | Sources | Commercial | Program |
| `SCR-06` | `/commercial/model/revenue` | Revenue | Model | Run |
| `SCR-07` | `/commercial/model/pnl` | P&L (Cost & EBITDA) | Model | Run |
| `SCR-08` | `/commercial/model/cash` | Cash & Sustainability | Model | Run |
| `SCR-09` | `/commercial/model/assumptions` | Assumptions & Change Sets | Model | Scenario |
| `SCR-10` | `/commercial/model/assumptions/change-sets/:id` | (detail, not in nav) | Model | Scenario |
| `SCR-11` | `/commercial/model/compare` | Scenario Comparison | Model | Analytical evidence |
| `SCR-12` | `/commercial/model/compare/:id` | (detail, not in nav) | Model | Analytical evidence |
| `SCR-13` | `/commercial/model/sensitivity` | Sensitivity Analysis | Model | Analytical evidence |
| `SCR-14` | `/commercial/model/sensitivity/:id` | (detail, not in nav) | Model | Analytical evidence |
| `SCR-15` | `/commercial/model/release` | Release & Activation | Model | Release |
| `SCR-16` | `/commercial/model/release/:versionId` | (detail, not in nav) | Model | Release |

Sidebar renders two groups: `Commercial` (SCR-01…SCR-05) and `Model`
(SCR-06…SCR-09, SCR-11, SCR-13, SCR-15). Detail screens are reached by drill-down
only. A persistent back-link to "NeuGAIN Command Center" (`/app`) sits above the
group headings.

---

## 2. Screen-to-component matrix

| Screen ID | Page component | Primary hooks |
|---|---|---|
| `SCR-00` | `shell/CommercialLayout.tsx` | `useAccess` |
| `SCR-01` | `pages/CommercialOverview.tsx` | `useProjectMomentous`, `useProjectMomentousScenarios` |
| `SCR-02` | `pages/CommercialProgram.tsx` | `useProjectMomentous` |
| `SCR-03` | `pages/CommercialScenarios.tsx` | `useProjectMomentousScenarios` |
| `SCR-04` | `pages/CommercialPortfolio.tsx` | `useProjectMomentous` |
| `SCR-05` | `pages/CommercialSources.tsx` | `useProjectMomentous` |
| `SCR-06` | `pages/CommercialRevenue.tsx` | `useRevenueRuns`, `useTriggerRevenueRun` |
| `SCR-07` | `pages/CommercialPnl.tsx` | `usePnlRuns` |
| `SCR-08` | `pages/CommercialCash.tsx` | `useCashRuns` |
| `SCR-09` | `pages/CommercialAssumptions.tsx` | `useAssumptionChangeSets` |
| `SCR-10` | `pages/CommercialAssumptionChangeSet.tsx` | `useAssumptionChangeSets` |
| `SCR-11` | `pages/CommercialCompare.tsx` | `useComparisons`, `useCreateComparison` |
| `SCR-12` | `pages/CommercialCompareDetail.tsx` | `useComparisons` (calculate/readiness/assumptions/save/archive) |
| `SCR-13` | `pages/CommercialSensitivity.tsx` | `useSensitivity` |
| `SCR-14` | `pages/CommercialSensitivityDetail.tsx` | `useSensitivity` (execute/archive/reset) |
| `SCR-15` | `pages/CommercialRelease.tsx` | `useModelRelease` |
| `SCR-16` | `pages/CommercialReleaseDetail.tsx` | `useModelRelease` (readiness, certification, activation, successor) |

---

## 3. Screen-to-system-object matrix

| Screen ID | Tables | Functions / Edge |
|---|---|---|
| `SCR-01` | programs, stage_gates, program_metrics, source_references, scenarios, scenario_assumptions | — |
| `SCR-02` | programs, stage_gates, program_metrics | — |
| `SCR-03` | programs, scenarios, scenario_assumptions | `seed_project_momentous_scenarios` |
| `SCR-04` | commercial_accounts, program_metrics | `seed_project_momentous_foundation` |
| `SCR-05` | source_references | `seed_project_momentous_foundation` |
| `SCR-06` | programs, scenarios, model_versions, model_runs, model_results | Edge `commercial-run-scenario` (revenue) |
| `SCR-07` | as above | Edge `commercial-run-scenario` (pnl) |
| `SCR-08` | as above | Edge `commercial-run-scenario` (cash) |
| `SCR-09` | scenario_assumptions, change_sets, change_set_items, model_versions | `commercial_program_run_staleness`, `commercial_change_set_create` / `_upsert_item` |
| `SCR-10` | change_sets, change_set_items, apply_log | `commercial_change_set_validate` / `_apply` / `_cancel` / `_remove_item` |
| `SCR-11` | scenario_comparisons | `commercial_comparison_create` |
| `SCR-12` | scenario_comparisons, scenario_comparison_results, model_runs | `commercial_comparison_calculate` / `_readiness` / `_assumptions` / `_save` / `_archive` |
| `SCR-13` | sensitivity_experiments | `commercial_sensitivity_create` |
| `SCR-14` | sensitivity_experiments, _perturbations, _results | `commercial_sensitivity_start_execution` / `_fail` / `_finalize` / `_archive` / `_reset_to_draft`, Edge |
| `SCR-15` | model_versions, model_activations | — |
| `SCR-16` | model_versions, release_certifications, release_lineage, model_activations | `commercial_release_readiness`, `_certification_create` / `_refresh` / `_certify` / `_invalidate`, `commercial_model_version_activate`, `_create_successor` |

---

## 4. Screen entries

Each entry supplies the catalogue row required by the prompt: ID, name, route,
navigation path, operating level, purpose, primary business question, page component,
main sections, main actions, permissions, lifecycle states, underlying objects,
related screens, documentation sources, confidence, gap status.

---

### SCR-00 — Commercial Shell
Route `/commercial` (layout). Level: Tenant. Component `CommercialLayout.tsx`.
Purpose: provide navigation, workspace context and access gating for the module.
Business question: *which workspace am I operating in, and what may I open?*
Sections: back-link to NeuGAIN Command Center, sidebar (Commercial + Model groups),
header (breadcrumb, tenant name, Platform Admin badge, workspace selector, Platform
button). Actions: switch workspace, navigate, return to Command Center, open Platform.
Permissions: authenticated; `commercial.view` on each child. Lifecycle/states:
loading ("Loading workspace…"), no-active-workspace state with "Open Platform".
Objects: tenants, memberships. Related: all. Sources: `CommercialLayout.tsx`,
`AccessContext.tsx`. Confidence C2. Gap: none.

### SCR-01 — Commercial Overview
Route `/commercial`. Nav: Commercial → Overview. Level: Program.
Purpose: single-page program health summary. Business question: *is Project
Momentous progressing, and what should I do next?*
Sections: Workspace · Program · Gate progression · Baseline scenario · Scenario
comparison · Source validation · Data readiness · Recommended next actions.
Actions: navigate to Release workspace, Review program metrics, Review source
requirements. Permissions: `commercial.view`. Lifecycle states: gate statuses,
Baseline badge, Known/Pending readiness badges. Objects: programs, stage_gates,
program_metrics, source_references, scenarios. Related: SCR-02, SCR-05, SCR-15.
Sources: `CommercialOverview.tsx`, `bp2-delivery-map.md`. Confidence C2. Gap: none.

### SCR-02 — Program
Route `/commercial/program`. Level: Program. Purpose: operating gates and program
metrics detail. Business question: *what stage is the program in and against which
metrics?* Sections: DirectionalBanner, Operating Gates, metrics. Actions: read-only
navigation. Permissions: `commercial.view`; management gated by
`commercial.program.manage` (no mutating control rendered — see `GAP-03`).
Objects: programs, stage_gates, program_metrics. Confidence C2. Gap: `GAP-03`.

### SCR-03 — Scenarios
Route `/commercial/scenarios`. Level: Scenario. Purpose: view and edit the
directional assumption set for Conservative, Base and Upside.
Business question: *what assumptions define each scenario?*
Sections: DirectionalBanner, seed control, scenario assumption groups (Operating
Scope, Renewal & Growth, Rebate & Growth Share, Services, Funding), Activation Ramp
(cumulative accounts) chart, per-assumption inputs. Actions: Seed scenarios,
edit assumption inputs, "Save changes" (enabled only when dirty). Permissions:
`commercial.view`; writes expected under `commercial.scenario.manage`.
Lifecycle: Baseline flag, Yes/No indicators, locked indicator.
Objects: scenarios, scenario_assumptions. Related: SCR-09. Confidence C2.
Gap: `GAP-01` (direct write path versus governed change sets).

### SCR-04 — Portfolio
Route `/commercial/portfolio`. Level: Program. Purpose: account population and data
readiness. Business question: *do we have account-level substantiation?*
Sections: "No account records imported" empty state, Data readiness (Known/Pending).
Actions: seed foundation. Permissions: `commercial.view`,
`commercial.account.manage`. Objects: commercial_accounts. Confidence C2. Gap: none.

### SCR-05 — Sources
Route `/commercial/sources`. Level: Program. Purpose: provenance register.
Business question: *where did these assumptions come from, and how reliable is it?*
Sections: DirectionalBanner, confidentiality notice ("Metadata only…"), source cards
(code, title, type, confidentiality, status, notes). Actions: seed foundation.
Permissions: `commercial.view`, `commercial.source.manage`.
Objects: source_references (SRC-001…SRC-006). Confidence C2. Gap: none.

### SCR-06 — Revenue
Route `/commercial/model/revenue`. Level: Run. Purpose: execute and interpret the
volume and revenue engine. Business question: *what revenue does each scenario
produce, and is it current?* Sections: title banner, permission badge ("View-only
(missing commercial.model.run)"), "Run all scenarios" control, active-version notice,
failure banner (error code, message, run id, timestamp), completed banner (run id,
completion time, input hash), Run header card with scenario selector, metric tables
by period. Actions: Run all scenarios, select scenario. Permissions:
`commercial.view` + `commercial.model.run`. Lifecycle: running, completed, completed
with errors, failed, stale, superseded. Objects: model_runs, model_run_inputs,
model_results. Related: SCR-07, SCR-08, SCR-11. Sources: `bp3-2-revenue-formulas.md`.
Confidence C2/C5. Gap: none.

### SCR-07 — P&L (Cost & EBITDA)
Route `/commercial/model/pnl`. Level: Run. Purpose: cost, staffing, OPEX, gross
profit and EBITDA. Business question: *is the program profitable and when?*
Sections: title, run controls, Run header, metric tables (USD / ratio units).
Actions: run P&L, select scenario. Permissions: `commercial.model.run`.
Sources: `bp3-3-pnl-formulas.md`. Confidence C2/C5. Gap: none.

### SCR-08 — Cash & Sustainability
Route `/commercial/model/cash`. Level: Run. Purpose: cash flow, working capital,
break-even, payback, sustainability. Business question: *can we fund this, and when
does it pay back?* Sections: Run header · Working Capital (Y1) · Annual Cash Flow &
Cumulative Cash · Break-even · Payback · Financial Sustainability.
Actions: run cash, select scenario. Permissions: `commercial.model.run`.
Sources: `bp3-4-cash-formulas.md`, BP3.4.1/BP3.4.2 patches. Confidence C2/C5.

### SCR-09 — Assumptions & Change Sets
Route `/commercial/model/assumptions`. Level: Scenario. Purpose: governed assumption
editing. Business question: *what will change, and what is the impact before I
commit?* Sections: "Governed Assumption Editing" heading, Change sets card, Browse
effective assumptions table (Code, Scenario, Effective, Unit, Impact, Proposed,
Rationale, Action), readiness/staleness indicators (✓/✗ validate, ✓/✗ apply),
"New Draft change set" dialog. Actions: create draft change set, stage a proposed
value, open change set. Permissions: `commercial.assumption.change.create` /
`.validate` / `.apply`. Objects: change_sets, change_set_items,
scenario_assumptions, staleness RPC. Confidence C2. Gap: none.

### SCR-10 — Change-Set Detail
Route `/commercial/model/assumptions/change-sets/:id`. Level: Scenario.
Purpose: review, validate, apply or cancel a change set. Business question: *is this
bundle safe to apply?* Sections: header/status, validation banner ("Validation
passed" / "Validation failed"), item table (Assumption, Scenario, From, To, Unit,
Impact, Validation, Rationale, Action). Dialogs: "Apply change set?",
"Cancel change set?". Actions: remove item, validate, apply, cancel.
Permissions: `.validate`, `.apply`, `.cancel`. Lifecycle: draft, validated, applied,
cancelled, locked ("Change set is locked"). Confidence C2. Gap: none.

### SCR-11 — Scenario Comparison
Route `/commercial/model/compare`. Level: Analytical evidence. Purpose: create and
list comparisons. Business question: *how do scenarios differ?* Sections: Model
context, New comparison ("Draft a comparison. Snapshots persist only on Save."),
Comparisons table (Title, Mode, Scenarios, Scopes, Status, Stale at save, Updated).
Actions: Create draft, open comparison. Permissions: `commercial.comparison.create`.
Lifecycle: draft, saved, archived, Stale badge. Confidence C2. Gap: none.

### SCR-12 — Comparison Detail
Route `/commercial/model/compare/:id`. Purpose: inspect and freeze a comparison.
Sections: Readiness (Scenario, Scope, State, Latest run, Latest apply; Missing /
Stale / Current badges) · Variance rows (Metric, Period, Compared vs, Baseline,
Compared, Direction) · Key metric roll-up · Effective assumption differences (Code,
Scenario, Value, Unit, Differs; Changed badge) · Source-run manifest.
Dialogs: "Save immutable comparison", "Archive comparison" (Cancel / Confirm archive).
Actions: Save, Archive. Permissions: `commercial.comparison.save` / `.archive`.
Lifecycle: draft → saved → archived; "Stale at save" badge. Confidence C2.

### SCR-13 — Sensitivity Analysis
Route `/commercial/model/sensitivity`. Purpose: create and list experiments.
Business question: *which assumption matters most?* Sections: New Experiment form,
Experiments table (Title, Assumption, Scopes, Status, Created). Actions:
"Create Experiment", open experiment. Permissions: `commercial.sensitivity.create`.
Lifecycle: draft, running, completed, failed, archived. Confidence C2.

### SCR-14 — Sensitivity Detail
Route `/commercial/model/sensitivity/:id`. Purpose: execute and interpret one
experiment. Sections: header/status, Perturbations (Label, Value, Status,
Fingerprint), Tornado (Top 25 by |Δ%|) (Metric, Period, Baseline, Perturbed,
Direction), All Results (Scope, Metric, Period, Baseline, Perturbed).
Actions: Execute, Reset to Draft (dialog "Reset failed experiment?"), Archive,
Back to experiments. Permissions: `commercial.sensitivity.execute` / `.archive`.
Lifecycle: draft → running → completed | failed → draft (recovery) → archived.
Sources: `bp3-7-sensitivity.md`, BP3.7.1/.2/.3/.3A/.3B patches. Confidence C2/C5.

### SCR-15 — Release & Activation
Route `/commercial/model/release`. Level: Release. Purpose: version and activation
register. Business question: *which model version is in force?* Sections: Model
versions (Version, Name, Status, Formula catalog, Activated, Release), Activation
history (Activated at, Model version, Status, Prior active, Manifest hash, Reason).
Actions: Open version. Permissions: `commercial.view`. Confidence C2.

### SCR-16 — Release Detail (model-version-specific)
Route `/commercial/model/release/:versionId`. Purpose: readiness, certification,
activation, lineage and successor creation. Business question: *is this version fit
to become authoritative?* Sections: version header, "Re-evaluate readiness",
readiness table (Control, Status, Expected, Actual, Remediation), tabbed content
including Certification; Certification actions card ("Certification freezes a
readiness snapshot and release manifest with deterministic hashes"), Certifications
table (Created, Status, Pass/Warn/Block, Readiness hash, Manifest hash, Actions),
Release lineage (Relationship, Upstream, Downstream, Scope, Source hash), Activation
card with reason input, Successor version card, Activation records (Activated,
Status, Certification hash, Warnings). Dialog: "Activate {version_code}?".
Actions: Re-evaluate readiness, Create certification draft, Refresh snapshot,
Certify, Invalidate, Activate, Create successor draft.
Permissions: `commercial.release.certify`, `commercial.model.version.activate`.
Activation precondition (C2): `canActivate && latestCert.status === 'certified' &&
version.status === 'draft' && blocking.length === 0`.
Sources: `bp3-8-release-activation.md`, closeout documents. Confidence C2/C4/C5.

---

## 5. Cross-cutting states (all screens)

Loading, empty (`EmptyState`), permission-denied (`ForbiddenState` via
`PermissionRoute`), no-active-workspace, stale-result, failed-run, immutable/locked,
and terminal (cancelled, archived, invalidated, superseded) states are catalogued in
`cdt-lifecycle-catalogue.md` and must be described in every screen chapter §18.
