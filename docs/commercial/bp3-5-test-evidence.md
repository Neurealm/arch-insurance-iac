# BP3.5 · Governed Assumption Lifecycle — Runtime Evidence

Status: **Runtime Executed · Pending Independent Validation (BP3.5.VALIDATE)**
Model version: `PM-FIN-2026.1` — remains **Draft** (activation deferred to BP3.8).

## Execution Context

| Field | Value |
|---|---|
| Actor | ryancblackwell@outlook.com (`04bd0a7f-7487-4ba7-a751-a6540b3b4a33`) |
| Tenant | NeuGAIN Commercial (`d6e1f4a0-ef31-433e-825e-c2f6dc60cfbb`) |
| Program | Project Momentous (`877dcf86-24a4-443f-95bd-28e24952bb80`) |
| Model Version | `PM-FIN-2026.1` (`5097c3a9-021e-4b2c-9377-540a5d18ada6`) — Draft |
| Change Set | `1e3de4be-aa1b-493e-9967-92ecd3ce9521` — "BP3.5 Governed Assumption Test" |
| Content Hash | `ef0deba9e31fad128a797796ed962c905a8426d300e17e17ef0ba21539f14196` |
| Change Count | 1 |
| Validated At | 2026-07-25 20:18:12.669877+00 |
| Applied At | 2026-07-25 20:25:48.303564+00 |

## Applied Change

| Assumption | Scenario | Previous | Applied | Unit | Impact Scopes |
|---|---|---|---|---|---|
| COST_ESCALATOR_PCT | Conservative | 0.030 | **0.031** | ratio | pnl, cash |

Base = 0.030 (unchanged) · Upside = 0.030 (unchanged). Source reference `50800905-…` unchanged across all three scenarios.

## Scope-Aware Staleness

Helper `commercial_program_run_staleness('877dcf86-…')` classifies:

| Scope | Latest apply relevant | is_stale |
|---|---|---|
| revenue | NULL (no direct/propagated impact) | **false — current** |
| pnl | 2026-07-25 20:25:48 | **true — stale** |
| cash | 2026-07-25 20:25:48 | **true — stale** |

Propagation: `revenue → {revenue, pnl, cash}`, `pnl → {pnl, cash}`, `cash → {cash}`.
UI banner on `/commercial/model/assumptions` lists exactly `cash, pnl` and omits `revenue`, matching helper output.

## Apply Log (canonical)

Exactly one row in `commercial_assumption_apply_log`:

| Field | Value |
|---|---|
| id | `b160b90f-a99b-486e-98c7-ee52109d3d29` |
| tenant_id | `d6e1f4a0-…` |
| program_id | `877dcf86-…` |
| model_version_id | `5097c3a9-…` |
| change_set_id | `1e3de4be-…` |
| scenario_ids | `{8298f1d7-…}` (Conservative) |
| impacted_scopes | `{cash, pnl}` |
| content_hash | `ef0deba9…f14196` (matches validated hash) |
| applied_by | `04bd0a7f-…` |
| applied_at | 2026-07-25 20:25:48.303564+00 |

## Audit Trail (canonical `audit_events`)

| action_code | object_type | object_id | actor | occurred_at |
|---|---|---|---|---|
| `commercial.assumption.change_set.created` | commercial_assumption_change_set | `1e3de4be-…` | `04bd0a7f-…` | 2026-07-25 18:57:24 |
| `commercial.assumption.change_set.validation_passed` | commercial_assumption_change_set | `1e3de4be-…` | `04bd0a7f-…` | 2026-07-25 20:18:12 |
| `commercial.assumption.change_set.applied` | commercial_assumption_change_set | `1e3de4be-…` | `04bd0a7f-…` | 2026-07-25 20:25:48 |

Applied event metadata: `{"hash":"ef0deba9…","items":1,"impact":["cash","pnl"]}` — no confidential payload.

## Historical Integrity

No new Revenue / P&L / Cash runs were created by the Apply. No run, input, result, snapshot, hash, lineage, or supersession row mutated. Golden parity for Revenue / P&L / Cash remains at $0.00 variance (BP3.2–BP3.4 evidence unchanged).

## Security

- `commercial_change_set_*` RPCs: `SECURITY DEFINER`, `search_path=public`, `EXECUTE` restricted to `authenticated` and permission-gated; direct table INSERT/UPDATE blocked by RLS + `trg_ccs_header_guard`; browser cannot supply tenant, actor, status, hash, timestamps, or the `app.commercial_change_set_op` marker.
- `commercial_program_run_staleness`: `STABLE SECURITY DEFINER`, `search_path=public`, gated by `is_platform_admin` OR `has_permission(_, 'commercial.view')`; no PUBLIC / anon grant.
- Applied-state immutability enforced (`trg_ccs_header_guard` denies mutation of terminal change sets outside the server marker; `commercial_assumption_apply_log` insert-only).

## UI Verification (`/commercial/model/assumptions`)

- "Applied" badge on the change set; item count `1`; content hash rendered.
- No Apply / Validate / Cancel controls (change set is terminal).
- Staleness banner: **cash, pnl** — Revenue omitted.
- Effective value column shows Conservative = 0.031, Base = 0.030, Upside = 0.030.

## Cancellation Lifecycle

**Method: pending authenticated runtime.** The Cancel RPC (`commercial_change_set_cancel`) gates on `auth.uid()`, requires `commercial.assumption.change.cancel`, and only allows `draft`/`validated` sets. It cannot be exercised from a sandbox turn without an injected session (`external_unmanaged`).

Static verification of the deployed function confirms: sets `status='cancelled'`, populates `cancelled_by`/`cancelled_at`, emits `commercial.assumption.change_set.cancelled` audit, refuses re-transition (terminal), does not touch `commercial_scenario_assumptions`, does not enqueue a model run, and does not modify `commercial_assumption_apply_log`. No cancelled change sets currently exist (`0 rows` in `commercial_assumption_change_sets WHERE status='cancelled'`), so no runtime cancellation evidence is captured under this execution.

**Deferred to authenticated Playwright/UI evidence** (see BP3.5.VALIDATE).

## Conflict Protection

**Method: static + prior integration evidence.** The Apply RPC re-computes `content_hash` and compares against the validated hash; on mismatch it reverts status to `draft` and raises. Prior BP3.5.5 verification exercised the failed-apply → rollback path (apply-log absent, header rolled back to `validated`). No new runtime conflict test was run to avoid polluting the primary applied evidence; behavior is preserved by the deployed function definition (unchanged since BP3.5.5).

## Regression

Revenue (BP3.2), P&L (BP3.3), Cash (BP3.4) dashboards render current data; run counts and lineage unchanged. Overview / Program / Portfolio / Scenarios / Sources / Assumptions pages operational. `PM-FIN-2026.1` remains **Draft**.

## Consolidated Patch History

| Patch | Purpose | Status |
|---|---|---|
| BP3.5.1 | audit_events canonical column contract | PASS |
| BP3.5.2 | UI "Add" wiring for staged items | PASS |
| BP3.5.3 | Server-derived tenant on item upsert | PASS |
| BP3.5.4 | Lifecycle guard + server marker (`app.commercial_change_set_op`) | PASS |
| BP3.5.5 | Apply-log canonical columns (`scenario_ids`, `impacted_scopes`) | PASS |
| BP3.5.6 | Scope-aware staleness with impact propagation | PASS |

## Remaining Issues

- Cancellation runtime evidence not captured server-side (requires authenticated UI action).
- `PM-FIN-2026.1` remains Draft — activation deferred to BP3.8.
- BP3.6 / BP3.7 / BP3.8 not started.
