# CDT Action Catalogue

Status: Foundation (CDT-REFERENCE-FOUNDATION, 2026-07-26).
Every user-triggered function in the Commercial module. Confidence codes per
authoring standard §4. Screen IDs per `cdt-screen-catalogue.md`.

Audit-event column: "Yes (governed)" means the operation is executed by a
`SECURITY DEFINER` RPC that writes to the commercial audit trail (C3/C5). Where the
specific event code is not confirmed from a function body in this pass, the entry is
marked C6 and listed in the gap register as `GAP-04`.

---

## 1. Navigation and view actions

| ID | Label | Screen | Purpose | Permission | Mutation |
|---|---|---|---|---|---|
| `ACT-01` | Workspace selector | SCR-00 | Switch active tenant | authenticated + membership | none (client context) |
| `ACT-02` | "NeuGAIN Command Center" | SCR-00 | Leave the module | authenticated | none |
| `ACT-03` | "Platform" | SCR-00 | Open platform admin | platform admin | none |
| `ACT-04` | Sidebar navigation | SCR-00 | Move between screens | `commercial.view` | none |
| `ACT-05` | "Release workspace" | SCR-01 | Jump to release | `commercial.view` | none |
| `ACT-06` | "Review program metrics" | SCR-01 | Jump to program | `commercial.view` | none |
| `ACT-07` | "Review source requirements" | SCR-01 | Jump to sources | `commercial.view` | none |
| `ACT-08` | Scenario selector | SCR-06/07/08 | Choose scenario view | `commercial.view` | none |
| `ACT-09` | "Open" (row drill-down) | SCR-11/15 | Open detail screen | `commercial.view` | none |
| `ACT-10` | "Back" / "Back to experiments" | SCR-10/12/14/16 | Return to list | `commercial.view` | none |
| `ACT-11` | Certification tab switch | SCR-16 | Change detail view | `commercial.view` | none |

All view actions: reversible, no audit event, no financial effect, no precondition
beyond an active tenant. Confidence C2.

---

## 2. Seeding actions

### `ACT-12` — Seed Project Momentous foundation
Screen SCR-04 / SCR-05 (`SeedMomentousButton`). Purpose: create the program, stage
gates, metrics and source references. Preconditions: no program present.
Inputs: none. RPC `seed_project_momentous_foundation`. State: absent → seeded.
Data affected: programs, stage_gates, program_metrics, source_references.
Reversible: no. Audit: Yes (governed, C6). Recovery: none — contact operations.
Related: `ACT-13`. Confidence C2/C6.

### `ACT-13` — Seed scenarios
Screen SCR-03 (`SeedScenariosButton`). Purpose: create Conservative, Base and Upside
with their directional assumptions. RPC `seed_project_momentous_scenarios`.
Data affected: scenarios, scenario_assumptions. Reversible: no. Confidence C2.

---

## 3. Scenario assumption actions

### `ACT-14` — Edit assumption input
Screen SCR-03. Purpose: stage a new directional value in the form.
Preconditions: scenario loaded. Inputs: numeric value parsed against the assumption
unit. State: client-side draft only; enables "Save changes".
Data affected: none until save. Reversible: yes. Audit: no. Confidence C2.

### `ACT-15` — "Save changes"
Screen SCR-03. Purpose: persist edited scenario assumption values.
Preconditions: at least one dirty field. Processing: direct update to
`commercial_scenario_assumptions` (`useProjectMomentousScenarios`).
Outputs: toast "Saved N assumption change(s)"; failure toast "Save failed".
Data affected: scenario assumption values. Data not affected: existing completed runs
(they become stale rather than changing). Reversible: only by editing back.
Financial effect: changes future run inputs. Audit: C8 — not confirmed in this pass.
Gap: `GAP-01` (relationship to governed change sets). Confidence C2.

---

## 4. Governed change-set actions

### `ACT-16` — "New Draft change set"
Screen SCR-09. RPC `commercial_change_set_create`. Precondition: create permission.
Inputs: title/notes. State: (none) → Draft. Toast "Draft change set created" /
"Create failed". Reversible: cancel the change set. Permission
`commercial.assumption.change.create`. Audit: Yes (governed). Confidence C2/C3.

### `ACT-17` — Stage proposed value (add item)
Screen SCR-09 (Action column). RPC `commercial_change_set_upsert_item`.
Preconditions: an open Draft change set selected ("Pick a change set"), a proposed
value entered ("Enter a proposed value"), value valid ("Invalid value"), value
differs ("No change to stage"), change set not locked ("Change set is locked").
State: Draft (unchanged) with one more item. Toast "Added to change set" /
"Could not add change". Reversible: `ACT-18`. Confidence C2.

### `ACT-18` — Remove item
Screen SCR-10. RPC `commercial_change_set_remove_item`. Toast "Item removed" /
"Remove failed". Precondition: change set still Draft. Reversible: re-add.
Confidence C2.

### `ACT-19` — Validate
Screen SCR-09/SCR-10. RPC `commercial_change_set_validate`.
Purpose: check every staged item against directionality and bounds.
Output: "Validation passed" or "Validation failed" banner and per-item validation.
State: Draft → Validated on success. No financial effect. Reversible: yes (re-edit).
Permission `commercial.assumption.change.validate`. Confidence C2/C3.

### `ACT-20` — Apply change set
Screen SCR-10, dialog "Apply change set?". RPC `commercial_change_set_apply`.
Preconditions: validated, not locked, apply permission.
Processing: transactional write of proposed values into effective assumptions plus an
apply-log entry. State: Validated → Applied. Data affected: scenario_assumptions,
apply_log. Data not affected: existing runs and their results — they are marked stale
by `commercial_program_run_staleness`, never edited.
Financial effect: all downstream Revenue / P&L / Cash results for the affected
scenarios become stale until rerun. Reversible: **no**. Audit: Yes (governed).
Failure modes: conflict ("Conflict detected"), "Apply failed". Recovery: create a new
change set restoring prior values. Confidence C2/C3/C5.

### `ACT-21` — Cancel change set
Screen SCR-10, dialog "Cancel change set?". RPC `commercial_change_set_cancel`.
State: Draft|Validated → Cancelled (terminal). No financial effect.
Toast "Change set cancelled" / "Cancel failed". Reversible: no — create a new set.
Permission `commercial.assumption.change.cancel`. Confidence C2.

---

## 5. Model execution actions

### `ACT-22` — "Run all scenarios" (Revenue)
Screen SCR-06. Edge Function `commercial-run-scenario`, scope `revenue`.
Preconditions: `commercial.model.run`; otherwise the badge "View-only (missing
commercial.model.run)" is shown and the control is disabled.
Inputs: tenant, program, model version, scenario set, scope.
Processing: resolves effective assumptions, computes an input hash and runtime
fingerprint, deduplicates identical runs, persists run, inputs and results.
State: (new run) queued → running → completed | completed with errors | failed.
Outputs: completed banner with run id, completion time and input hash.
Data affected: model_runs, model_run_inputs, model_results.
Data not affected: assumptions, prior runs (superseded, never mutated).
Reversible: no — but a corrected rerun supersedes the prior run.
Failure modes: toast "Run failed" / "Run completed with errors" plus a failure banner
carrying error code, message, run id and failure timestamp.
Recovery: fix the underlying cause and rerun. Audit: Yes (governed). Confidence C2/C4.

### `ACT-23` — Run P&L
Screen SCR-07. As `ACT-22` with scope `pnl`. Toasts "P&L run failed" / "P&L run
completed with errors". Precondition beyond `ACT-22`: current Revenue results.
Confidence C2.

### `ACT-24` — Run Cash
Screen SCR-08. As `ACT-22` with scope `cash`. Toasts "Cash run failed" / "Cash run
completed with errors". Runtime fingerprint `bp3.4.1` forces recomputation of cash
runs produced by the superseded engine build (C5). Confidence C2/C5.

---

## 6. Comparison actions

### `ACT-25` — "Create draft" comparison
Screen SCR-11. RPC `commercial_comparison_create`. Inputs: title (required —
"Title required"), mode, baseline scenario, compared scenarios (pairwise requires
exactly one — "Pairwise requires exactly 1 compared scenario"), scopes.
State: (none) → Draft. Toast "Draft comparison created" / "Create failed".
No snapshot rows are written yet. Permission `commercial.comparison.create`.
Reversible: archive. Confidence C2.

### `ACT-26` — Calculate / readiness / assumption diff (automatic on open)
Screen SCR-12. RPCs `commercial_comparison_calculate`, `_readiness`, `_assumptions`.
Purpose: compute variance rows, per-scenario/scope readiness (Missing / Stale /
Current) and effective-assumption differences on demand. Read-only. Confidence C2.

### `ACT-27` — "Save immutable comparison"
Screen SCR-12 dialog. RPC `commercial_comparison_save`. Precondition: draft
comparison, save permission. Processing: freezes variance rows and the source-run
manifest as immutable snapshot rows. State: Draft → Saved; records whether the inputs
were stale at save ("Stale at save"). Data affected:
`commercial_scenario_comparison_results`. Reversible: **no**. Audit: Yes (governed).
Toast "Comparison saved" / "Save failed". Confidence C2/C4.

### `ACT-28` — "Archive" comparison
Screen SCR-12 dialog (Cancel / "Confirm archive"). RPC
`commercial_comparison_archive`. State: Saved → Archived (terminal). Content remains
immutable. Toast "Archived" / "Archive failed". Permission
`commercial.comparison.archive`. Reversible: no. Confidence C2.

---

## 7. Sensitivity actions

### `ACT-29` — "Create Experiment"
Screen SCR-13. RPC `commercial_sensitivity_create`. Inputs: title, target assumption,
perturbation set, scopes, baseline scenario. Validation: "No valid perturbations".
State: (none) → Draft. Toast "Sensitivity experiment created".
Permission `commercial.sensitivity.create`. Confidence C2.

### `ACT-30` — "Execute" (label toggles to "Executing…")
Screen SCR-14. RPCs `commercial_sensitivity_start_execution` then per-perturbation
Edge Function invocations, closing with `_finalize` or `_fail`.
Preconditions: experiment in Draft, baseline runs resolvable (supersession-aware
resolution, BP3.7.1), readiness resolvable (BP3.7.2),
permission `commercial.sensitivity.execute`.
State: Draft → Running → Completed | Failed.
Outputs: perturbation rows with fingerprints, result rows, tornado ranking.
Data affected: sensitivity perturbations and results. Data not affected: model runs,
assumptions. Reversible: no; failed experiments recover via `ACT-31`.
Failure: toast "Execution failed". Confidence C2/C4/C5.

### `ACT-31` — "Reset to Draft"
Screen SCR-14, dialog "Reset failed experiment?". RPC
`commercial_sensitivity_reset_to_draft`. Precondition: experiment status `failed` and
unexecuted. State: Failed → Draft, clearing partial artefacts. Toast "Reset failed".
Purpose: governed recovery path added by BP3.7.3A/BP3.7.3B. Confidence C2/C5.

### `ACT-32` — "Archive" experiment
Screen SCR-14. RPC `commercial_sensitivity_archive`. State: Completed → Archived
(terminal). Permission `commercial.sensitivity.archive`. Reversible: no. Confidence C2.

---

## 8. Release actions

### `ACT-33` — "Re-evaluate readiness"
Screen SCR-16. RPC `commercial_release_readiness(version_id)`. Read-only: returns
per-control rows (Control, Status, Expected, Actual, Remediation) classified pass /
warning / blocking. No state change, no audit event. Confidence C2/C3.

### `ACT-34` — Create certification draft
Screen SCR-16 "Certification actions". RPC
`commercial_release_certification_create`. Inputs: model version, optional notes.
State: (none) → certification Draft; captures a readiness snapshot, builds the
release manifest and records release lineage. Toast "Certification draft created".
Permission `commercial.release.certify`. Confidence C2/C4.

### `ACT-35` — "Refresh snapshot"
Screen SCR-16. RPC `commercial_release_certification_refresh`. Purpose: recompute the
readiness snapshot and manifest for the latest draft certification.
State: Draft → Draft (new hashes). Toast "Certification refreshed". Confidence C2.

### `ACT-36` — "Certify"
Screen SCR-16. RPC `commercial_release_certification_certify`. Preconditions: latest
certification is Draft with zero blocking controls. State: Draft → Certified; hashes
become immutable. Data affected: `commercial_release_certifications`,
`commercial_release_lineage`. Reversible: only via `ACT-37`. Audit: Yes (governed).
Confidence C2/C4.

### `ACT-37` — "Invalidate"
Screen SCR-16 certifications table. RPC
`commercial_release_certification_invalidate`. Inputs: reason. State: Draft|Certified
→ Invalidated (terminal, retained). Toast "Certification invalidated".
Confidence C2.

### `ACT-38` — "Activate {version_code}"
Screen SCR-16, confirmation dialog "Activate {version_code}?". RPC
`commercial_model_version_activate`. Preconditions (C2, verbatim from source):
activate permission, latest certification `certified`, version status `draft`, zero
blocking controls, and a non-empty activation reason.
Processing: transactional single-active transition. State: version Draft → Active;
any prior active version is displaced. Data affected: model_versions,
`commercial_model_activations` (activated at, prior active, manifest hash, reason,
certification hash, warnings). Data not affected: runs, results, comparisons,
sensitivity evidence. Reversible: **no** — supersede via a successor version.
Audit: Yes (governed). Confidence C2/C4/C5.

### `ACT-39` — "Create successor draft"
Screen SCR-16 "Successor version". RPC
`commercial_model_version_create_successor`. Inputs: successor version code
(placeholder `PM-FIN-2026.2`). State: (none) → new Draft version; the active version
is untouched. Toast "Successor draft created". Permission
`commercial.model.version.activate`. Confidence C2.

---

## 9. Confirmation and cancel actions

| ID | Label | Screen | Effect |
|---|---|---|---|
| `ACT-40` | "Cancel" (dialog) | SCR-09/12/14/16 | Dismiss without change; always reversible |
| `ACT-41` | "Confirm archive" | SCR-12 | Commit `ACT-28` |
| `ACT-42` | Activate confirmation | SCR-16 | Commit `ACT-38` |
| `ACT-43` | Apply confirmation | SCR-10 | Commit `ACT-20` |
| `ACT-44` | Cancel-change-set confirmation | SCR-10 | Commit `ACT-21` |
| `ACT-45` | Reset confirmation | SCR-14 | Commit `ACT-31` |

---

## 10. Action-to-state-transition matrix

| Action | Object | From → To | Reversible | Audit |
|---|---|---|---|---|
| `ACT-16` | Change set | — → Draft | Yes (cancel) | Yes |
| `ACT-19` | Change set | Draft → Validated | Yes | Yes |
| `ACT-20` | Change set | Validated → Applied | No | Yes |
| `ACT-21` | Change set | Draft/Validated → Cancelled | No | Yes |
| `ACT-22/23/24` | Model run | — → Running → Completed/Failed | No | Yes |
| `ACT-22/23/24` | Prior run | Completed → Superseded | No | Yes |
| `ACT-25` | Comparison | — → Draft | Yes (archive) | Yes |
| `ACT-27` | Comparison | Draft → Saved | No | Yes |
| `ACT-28` | Comparison | Saved → Archived | No | Yes |
| `ACT-29` | Experiment | — → Draft | Yes | Yes |
| `ACT-30` | Experiment | Draft → Running → Completed/Failed | No | Yes |
| `ACT-31` | Experiment | Failed → Draft | n/a (is recovery) | Yes |
| `ACT-32` | Experiment | Completed → Archived | No | Yes |
| `ACT-34` | Certification | — → Draft | Yes (invalidate) | Yes |
| `ACT-35` | Certification | Draft → Draft (rehashed) | Yes | Yes |
| `ACT-36` | Certification | Draft → Certified | Via invalidate | Yes |
| `ACT-37` | Certification | Draft/Certified → Invalidated | No | Yes |
| `ACT-38` | Model version | Draft → Active (prior displaced) | No | Yes |
| `ACT-39` | Model version | — → Draft successor | Yes | Yes |

---

## 11. Actions not present in the current implementation

Recorded so later volumes do not imply them: pagination controls, column sorting,
data export, printing, bulk assumption import, comparison editing after save,
un-archive, de-activation, and run deletion. Confidence C2. Gap: `GAP-05`.
