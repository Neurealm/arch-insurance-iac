# BP3.7 — Sensitivity Analysis Runtime Evidence

## Execution Context
- **Actor:** 04bd0a7f-7487-4ba7-a751-a6540b3b4a33
- **Tenant:** d6e1f4a0-ef31-433e-825e-c2f6dc60cfbb (NeuGAIN Commercial)
- **Program:** 877dcf86-24a4-443f-95bd-28e24952bb80 (Project Momentous)
- **Model version:** 5097c3a9-021e-4b2c-9377-540a5d18ada6 (PM-FIN-2026.1 · Draft)
- **Experiment:** e2b3499e-a96a-4fd2-8aeb-b8b0fb8fffb9 — "BP3.7 Runtime Test"
- **Baseline scenario:** 702bf181-…7703c0 (Base)
- **Assumption:** COST_ESCALATOR_PCT
- **Scopes:** revenue, pnl, cash
- **Perturbation strategy:** increment_list [-20, -10, 0, +10, +20]
- **Completed at:** 2026-07-26 01:55:07 UTC
- **Completed by:** 04bd0a7f-…4a33
- **Manifest hash:** 47cf6d6f178542972b8897b4ee703ecb9235c971922218e707f7d47dbd5076dc
- **Content hash:** 65d93959c2e0197ea3ff20b7ae02297e59cecb82cbd141fc69b2185f6d66f992
- **stale_at_creation:** true (P&L/Cash baseline stale-warning path exercised; execution allowed under policy)

## Lifecycle
draft → running → failed → **reset (BP3.7.3A)** → draft → running → **completed**

## Perturbations (5/5 completed, 0 failed)
| # | Label | perturbed_value | Fingerprint | Status |
|---|---|---|---|---|
| 0 | -2000.0% | -0.57 | ✓ | completed |
| 1 | -1000.0% | -0.27 | ✓ | completed |
| 2 | +0.0%   | +0.03 | ✓ | completed |
| 3 | +1000.0%| +0.33 | ✓ | completed |
| 4 | +2000.0%| +0.63 | ✓ | completed |

Deferred cosmetic defect **BP3.7.4** — label formatting shows `-2000%` instead of `-20%`; underlying `perturbed_value` values are numerically correct.

## Sensitivity Results (persisted server-side)
- **Total rows:** 1,660
- **Distinct metrics:** verified across Revenue, Gross Profit, Gross Margin, EBITDA, Cash, Working Capital, Funding, Break-even, Payback, Financial Sustainability
- **Rows by scope:** revenue = 630 · pnl = 755 · cash = 275

## Manifest
Baseline runs pinned by BP3.7.1 supersession-aware resolver:
- Revenue: 922c4a81-…
- P&L:     1308913a-…
- Cash:    521cf9e1-…

Manifest hash immutable across reopen.

## Hash Determinism
- `baseline_run_manifest_hash` = 47cf6d6f… (stable)
- `content_hash` = 65d93959… (stable, non-null, deterministic)

## Audit Trail (canonical, in order)
1. commercial.sensitivity.created — 01:09:04
2. commercial.sensitivity.executed — 01:25:24
3. commercial.sensitivity.failed — 01:25:25
4. commercial.sensitivity.reset — 01:52:31 (BP3.7.3A governed recovery)
5. commercial.sensitivity.executed — 01:55:02
6. commercial.sensitivity.completed — 01:55:07

Failed audit preserved. No duplicate lifecycle events.

## Security
- `commercial_sensitivity_reset_to_draft`: SECURITY DEFINER, search_path=public, PUBLIC/anon EXECUTE revoked, authenticated grant, FOR UPDATE row lock, server-derived actor & tenant, `commercial.sensitivity.execute` enforced.
- Tenant isolation preserved; no cross-tenant access.
- BP3.7.3 Edge Function `commercial-run-scenario` routes sensitivity requests through `runSensitivity`; classic scenario contract unchanged.

## Historical Integrity
- `commercial_model_runs`, `_results`, `_run_inputs`: unchanged.
- Supersession relationships, governed assumptions, comparison snapshots, lineage: unchanged.
- **PM-FIN-2026.1 remains Draft.**

## Regression
Overview, Program, Portfolio, Scenarios, Sources, Assumptions, Revenue, P&L, Cash, Scenario Comparison, Sensitivity — all operational. No BP3.6 regression.

## Archive
Archive step remains as an optional authenticated UI action; terminal immutability contract is enforced by header/child guards.

## Deferred
- **BP3.7.4** — perturbation percentage label formatting (cosmetic only).
- **BP3.8** — activation / lineage enrichment (not started).
