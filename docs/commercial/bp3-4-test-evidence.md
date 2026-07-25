# BP3.4.1 — Quarterly Cash Formula Reconciliation

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
`WC-PEAK-TROUGH-Y1`, `WC-MAX-FUNDING` (Y1 only, all scenarios).
Unaffected: annual EBITDA, revenue, P&L, break-even, payback, sustainability.

## Files changed
- `supabase/functions/commercial-run-scenario/index.ts` — `computeCashScope`.
- Migration `20260725171425` — `commercial_model_run_start` now folds a
  scope-specific formula fingerprint (`cash → bp3.4.1`) into the input
  hash. Revenue and P&L map to empty fingerprint so their hashes stay
  identical; cash runs get a distinct fingerprint that prevents reuse of
  the defective cache entries.

## Cache invalidation mechanism
Per-scope formula fingerprint appended to `formula_catalog_version` inside
`commercial_model_run_start` before `commercial_compute_input_hash`. No
assumption values were changed; no result rows were mutated.

## Historical (defective) cash run handling
| Scenario     | Run ID                                 | Input hash                         | Status     |
|--------------|----------------------------------------|------------------------------------|------------|
| Conservative | `e79ba517-4158-4516-8e37-62f09005139a` | `c95eb9252d04f8a98025c7dac74dbdc3` | superseded |
| Base         | `d225ea9f-5a77-44d5-bd81-5dc64d2da5f2` | `bebb62bbabc9a342c7a7ad98964db4c1` | superseded |
| Upside       | `93f33caf-838f-4ee2-9b49-c3dfa671e43d` | `6b6aa30bb30ed5cec81c57fb446980fa` | superseded |

Rows are preserved as immutable historical evidence
(`supersedes_run_id` self-reference until the corrected runs are created;
downstream evidence will pivot the reference to the corrected run IDs).

## Remaining steps (requires authenticated user session)
Runtime execution of the corrected cash engine must run in the browser
because the sandbox cannot mint the Commercial user session. Sign in as
`ryancblackwell@outlook.com`, open `/commercial/model/cash`, and click
**Run Cash (all scenarios)** twice — first execution produces corrected
runs, second confirms idempotency (`0 new · 3 reused`).

After execution, this file will be updated with:
- Corrected run IDs, input hashes, `bp3.4.1` fingerprint.
- Parity matrix vs golden §7 (Q1..Q4 cash costs, cumulative net cash,
  peak trough, maximum funding, Conservative/Base/Upside).
- Regression matrix confirming revenue, P&L, EBITDA, break-even,
  payback, sustainability, and payment-lag rows are unchanged.
- Idempotency and UI verification.

## Remaining issues
- Draft model version `PM-FIN-2026.1` — expected, deferred to BP3.8.
