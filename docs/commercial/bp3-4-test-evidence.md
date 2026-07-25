# BP3.4.1 — Quarterly Cash Formula Reconciliation (Verified)

## Root cause
`computeCashScope` was subtracting the Q1 travel front-load from annual cost
*before* dividing by four and then adding the travel amount back into Q1.
Net effect: Q1 was overstated by ¾ of the travel load and Q2–Q4 each
understated by ¼ of the travel load; annual cash cost was correct but
quarterly timing (and therefore working-capital trough) was wrong.

- **Previous formula:** `baseCostPerQ = (annualCost − travelLoad) / 4`
- **Corrected formula (BP3.4.1):** `baseCostPerQ = annualCost / 4`,
  with `Q1 = baseCostPerQ + travelLoad`, `Q2..Q4 = baseCostPerQ`.

Affected metrics: `CASH-COSTS-PAID`, `CASH-NCF-QTR`, `CASH-CUM-NCF-QTR`,
`WC-PEAK-TROUGH-Y1`, `WC-MAX-FUNDING` (Y1, all scenarios).
Unaffected: annual EBITDA, revenue, P&L, break-even, payback, sustainability.

## Files changed
- `supabase/functions/commercial-run-scenario/index.ts` — `computeCashScope`.
- Migration `20260725171425` — `commercial_model_run_start` now folds a
  scope-specific formula fingerprint (`cash → bp3.4.1`) into the input hash.

## Runtime fingerprint
`bp3.4.1` (present in every corrected cash result's `lineage_json.formula_version`).

## Corrected vs defective run mapping

| Scenario     | Defective run ID                        | Corrected run ID                        | Corrected input hash               | Status of corrected |
|--------------|-----------------------------------------|-----------------------------------------|------------------------------------|---------------------|
| Conservative | `e79ba517-4158-4516-8e37-62f09005139a`  | `2aaab721-c8ba-4aec-9a63-36aa8a8493a4`  | `9e1995fb6795521e2b85247acd69510d` | completed (current) |
| Base         | `d225ea9f-5a77-44d5-bd81-5dc64d2da5f2`  | `521cf9e1-2031-4bde-809b-b6b005ed88c7`  | `322e70c5dcae33fbce6ff6fae0d30fa1` | completed (current) |
| Upside       | `93f33caf-838f-4ee2-9b49-c3dfa671e43d`  | `44eab7db-3952-46d3-9c97-f8ebd29f445b`  | `0e93889d65de064f759d38dbc63f9687` | completed (current) |

Defective runs remain immutable with `status='superseded'`. Corrected runs are
completed at 2026-07-25 17:16:55–17:16:57 UTC. Each corrected run persists
152 input rows and 55 result rows.

## Targeted FY2027 quarterly cash parity (Base) — golden vs computed

| Metric              | Period    | Golden           | Computed         | Δ    |
|---------------------|-----------|------------------|------------------|------|
| CASH-COSTS-PAID     | FY2027-Q1 | `$712,538.92`    | `$712,538.92`    | 0.00 |
| CASH-COSTS-PAID     | FY2027-Q2 | `$607,538.92`    | `$607,538.92`    | 0.00 |
| CASH-COSTS-PAID     | FY2027-Q3 | `$607,538.92`    | `$607,538.92`    | 0.00 |
| CASH-COSTS-PAID     | FY2027-Q4 | `$607,538.92`    | `$607,538.92`    | 0.00 |
| CASH-CUM-NCF-QTR    | FY2027-Q2 | `-$1,020,077.83` | `-$1,020,077.83` | 0.00 |
| WC-PEAK-TROUGH-Y1   | FY2027    | `-$1,020,077.83` | `-$1,020,077.83` | 0.00 |
| WC-MAX-FUNDING      | FY2027    | `$1,020,077.83`  | `$1,020,077.83`  | 0.00 |

Conservative FY2027 corrected values: Q1 `$470,804.90`, Q2–Q4 `$400,804.90`,
Q2 cum NCF `-$711,609.80`, WC trough `-$711,609.80`, max funding `$711,609.80`.
Upside FY2027 corrected values: Q1 `$1,004,662.47`, Q2–Q4 `$864,662.47`,
Q2 cum NCF `-$1,389,324.93`, WC trough `-$1,389,324.93`, max funding
`$1,389,324.93`.

Max absolute variance vs golden (Base targeted set): `$0.00`.

## Lineage (Base FY2027 CASH-COSTS-PAID)

Q1 lineage: `formula: cost/4 + Q1_travel_load`, `formula_version: bp3.4.1`,
`base_cost_per_q: 607,538.9167`, `q1_travel_load: 105,000`.
Q2–Q4 lineage: `formula: cost/4`, `formula_version: bp3.4.1`,
`q1_travel_load: 0`.

## Idempotency
Second authenticated execution returned toast
`Cash runs finished (3) — 0 new · 3 reused (idempotent)`.
Run-count, input-count, and result-count deltas across the second click: `0`.

## Upstream regression
Revenue and P&L runs are unchanged (one completed run per scenario, hashes
untouched by the `cash` fingerprint remap). No new revenue or P&L rows
appeared alongside the corrected cash runs.

| Scenario     | Revenue run                              | P&L run                                  |
|--------------|------------------------------------------|------------------------------------------|
| Conservative | `8faf610d-758a-4e57-be79-317efcd44e83`   | `54cc3b9d-9f1f-47b9-886b-23237d4d7cd3`   |
| Base         | `1c9576c5-f225-4a25-839b-52df904fa7a4`   | `862d95f4-ce7c-457f-a5e8-13cc13c246a0`   |
| Upside       | `a135e1d1-789e-4d06-8d09-9e901c9abee9`   | `c473055c-502f-448c-9723-ac6781598ee6`   |

## Security
Corrected runs were created by the authenticated Platform Admin actor
(`ryancblackwell@outlook.com`) via the `commercial.model.run` permission.
Anonymous execution remains denied, RLS tenant scoping active, completed
runs/inputs/results immutable.

## Remaining issues
1. **Supersession self-reference not reconciled.** Defective runs still
   carry `supersedes_run_id = self` (the "temporary" self-reference from
   the BP3.4.1 patch). Corrected runs have `supersedes_run_id = NULL`
   instead of the defective run ID. This is a data-hygiene defect only —
   `status='superseded'` correctly excludes the defective runs from
   "current" selection, and corrected runs are current. A targeted
   supersession-reconciliation migration is required before BP3.4 is
   marked validated.
2. Draft model version `PM-FIN-2026.1` — expected, deferred to BP3.8.
