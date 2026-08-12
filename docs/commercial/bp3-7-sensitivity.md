# BP3.7 — Governed Sensitivity Analysis: Architecture and Governance Design

Status: **Completed and Validated (GO)**.
BP3 closeout documentation authored, pending closeout execution and final closeout validation.
Runtime evidence: `docs/commercial/bp3-7-test-evidence.md`. Closeout record:
`docs/commercial/bp3-program-closeout.md`.

This document describes deployed behaviour only. It does not describe planned capability.

## 1. Purpose

BP3.7 provides governed sensitivity analysis for the Project Momentous commercial model:
a persisted experiment perturbs a single assumption across a defined set of steps, re-executes
the deterministic engine for the affected scopes, persists every result immutably, and derives
elasticity and tornado ranking server-side.

## 2. Architectural boundary

| Boundary | Rule |
|---|---|
| Calculation | Executed only by the `commercial-run-scenario` Edge Function in sensitivity mode |
| Persistence | Only `SECURITY DEFINER` RPCs write experiment, perturbation, run and result rows |
| Browser | Renders persisted server data; performs no perturbation math, no elasticity, no hashing |
| Baseline | Sensitivity never mutates authoritative Revenue, P&L or Cash runs |
| Tenant | Every row is tenant-scoped and RLS-gated to `authenticated` members |

## 3. Experiment data model

`commercial_sensitivity_experiments` holds: `id`, `tenant_id`, `program_id`,
`model_version_id`, `baseline_scenario_id`, `title`, `description`, `status`,
`assumption_code`, `included_scopes`, `perturbation_strategy`, `perturbation_config`,
`baseline_run_manifest`, `baseline_run_manifest_hash`, `content_hash`, `stale_at_creation`,
`warning_summary`, `error_code`, `error_message`, and actor/timestamp columns for
create, update, complete and archive.

Lifecycle: `draft` → `running` → `completed`, with `failed` recoverable to `draft`
and `archived` as a terminal read-only state.

## 4. Perturbation model

`commercial_sensitivity_perturbations` stores one row per step, derived server-side from
`perturbation_strategy` and `perturbation_config`. The validated experiment
`e2b3499e-a96a-4fd2-8aeb-b8b0fb8fffb9` perturbs `COST_ESCALATOR_PCT` across 5 steps.
Only one assumption code is perturbed per experiment; multi-factor perturbation is not
implemented.

## 5. Baseline-run resolution

The baseline is resolved from authoritative completed runs for the baseline scenario across
the requested scopes. `commercial_sensitivity_list_baseline_runs` resolves authoritative runs
using an anti-join that excludes runs referenced as `supersedes_run_id` by another run
(BP3.7.1.PATCH). A `supersedes_run_id IS NULL` predicate is not used, because replacement
runs legitimately carry a supersession reference.

## 6. Scope-aware readiness

`commercial_sensitivity_readiness` reports per-scope currency of the baseline runs by
delegating to `commercial_program_run_staleness`, which aggregates the latest assumption
application per `(scope, scenario_id)` (BP3.8.3.PATCH). Stale scopes are surfaced as warnings
before execution and recorded in `stale_at_creation` / `warning_summary`.

## 7. Edge Function orchestration

Execution is invoked from the UI against `commercial-run-scenario` with the sensitivity
branch. The function verifies the caller JWT, requires `commercial.sensitivity.run`
(or `commercial.model.run` where the RPC permits), loads the frozen baseline manifest,
and iterates perturbations, executing the same deterministic engine used for the
authoritative scopes.

## 8. Revenue, P&L and Cash runtime reuse

Sensitivity reuses the BP3.2 (volume and revenue), BP3.3 (staffing, cost of delivery, OPEX,
EBITDA) and BP3.4 (cash, working capital, break-even, payback) engine code paths without
modification. No parallel formula implementation exists.

## 9. Sensitivity runs

Each perturbation × scope execution is recorded in `commercial_sensitivity_runs`
(15 rows for the validated experiment). These rows are distinct from
`commercial_model_runs`; sensitivity execution creates no authoritative model run.

## 10. Result persistence

`commercial_sensitivity_run_results` holds raw per-run metric values (1,660 rows) and
`commercial_sensitivity_results` holds the consolidated per-perturbation metric outcomes
(1,660 rows across 71 distinct metric codes). Both are written only while the experiment is
executing and are immutable afterwards.

## 11. Tornado ranking

Tornado ordering is derived from persisted results by ranking metrics on the magnitude of
their swing between the low and high perturbation bounds. Ranking is computed server-side and
rendered read-only in the UI.

## 12. Elasticity

Elasticity is persisted per metric and perturbation as the ratio of relative metric change to
relative assumption change against the baseline value. It is stored, not recomputed in the
browser.

## 13. Runtime fingerprints

Sensitivity execution inherits the scope-specific runtime fingerprints introduced in
BP3.4.1 (for example `cash → bp3.4.1`), so a corrected engine cannot silently reuse results
produced by a superseded implementation.

## 14. Hashing and manifests

The baseline run manifest freezes the exact source run identifiers and hashes used by the
experiment (`baseline_run_manifest_hash`
`47cf6d6f178542972b8897b4ee703ecb9235c971922218e707f7d47dbd5076dc`). The experiment content
hash (`65d93959c2e0197ea3ff20b7ae02297e59cecb82cbd141fc69b2185f6d66f992`) covers the
experiment definition and manifest. Both are computed server-side over canonical
serializations.

## 15. Failed-to-Draft recovery

`commercial_sensitivity_reset_to_draft` (BP3.7.3A, corrected for identifier ambiguity in
BP3.7.3B) is the only path from `failed` back to `draft`. It requires the sensitivity
permission, is tenant-scoped, clears the error fields, emits `commercial.sensitivity.reset`,
and does not delete or rewrite prior audit history. The validated experiment used this path
once on 2026-07-26 01:52:31.478108+00 before completing successfully.

## 16. Permissions

| Permission | Purpose |
|---|---|
| `commercial.view` | Read experiments, perturbations and results |
| `commercial.sensitivity.run` | Create, execute, reset and complete experiments |
| `commercial.model.manage` | Model-version governance (not required for sensitivity) |

## 17. RLS and security

RLS is enabled on all sensitivity tables. Read policies require tenant membership with
`commercial.view`; there are no client INSERT/UPDATE/DELETE policies — writes occur only
through `SECURITY DEFINER` RPCs owned by `postgres` with `search_path` pinned to `public`.
Actor and tenant are derived from `auth.uid()` server-side.

## 18. Audit lifecycle

`commercial.sensitivity.created`, `commercial.sensitivity.executed`,
`commercial.sensitivity.failed`, `commercial.sensitivity.reset`,
`commercial.sensitivity.completed`. Payloads carry identifiers and scope metadata only —
no financial values.

## 19. UI routes and tabs

| Route | Content |
|---|---|
| `/commercial/model/sensitivity` | Experiment register with status, assumption code and scope coverage |
| `/commercial/model/sensitivity/:id` | Experiment detail: readiness, perturbations, tornado ranking, elasticity, results, recovery control and hashes |

## 20. Historical integrity

The failed execution, its audit event, the reset event and the completed execution are all
retained. Sensitivity execution created no authoritative model run, modified no assumption,
and altered no golden-baseline evidence.

## 21. Validation outcome

BP3.7 independent validation returned **GO**. Runtime evidence: 1 completed experiment,
5 perturbations, 15 sensitivity runs, 1,660 persisted results, 71 metrics, verified recovery
lifecycle.

## 22. Known warning — BP3.7.4

Perturbation percentage labels are formatted inconsistently in the UI. This is presentation
only: persisted values, elasticity and ranking are correct. It surfaces as readiness control
`SENS-LABEL-FMT` (warning, non-blocking) and remains **deferred** — see
`docs/commercial/bp3-deferred-items.md`.

## 23. Out-of-scope capabilities

Not implemented: Monte Carlo or stochastic simulation, multi-factor or correlated perturbation,
optimization or solver behaviour, AI-generated recommendations, automatic re-run of
authoritative scopes, and export of sensitivity results.
