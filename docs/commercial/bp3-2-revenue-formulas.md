# BP3.2 — Revenue Engine (Volume + Revenue only)

**Status**: Completed and Validated (GO).

> **Closeout status note — 2026-07-26.** BP3.2.VALIDATE returned **GO** after BP3.2.1.PATCH
> corrected the revenue string-concatenation defect and full golden parity was re-established.
> BP3 closeout documentation has been authored and is pending closeout execution and final
> closeout validation. See `docs/commercial/bp3-program-closeout.md`,
> `docs/commercial/bp3-evidence-index.md`, and `docs/commercial/bp3-2-test-evidence.md`.
> The historical body below is preserved unchanged.
**Scope**: Formula catalog domains VOL-1..VOL-9 and REV-1..REV-13 only.
**Out of scope**: Cost of Delivery, OPEX, EBITDA, Cash, Sensitivity — reserved for later BP3 packages.

## Runtime

- Edge function `commercial-run-scenario` (Pattern A, TypeScript engine).
- Requires authenticated caller. RPC-side permission check enforces `commercial.model.run` (or `commercial.sensitivity.run` when `run_scope='sensitivity'`, unused here).
- Deterministic input hash via `commercial_compute_input_hash` — repeat runs with identical assumptions/version return `reused=true` and do not write new results (idempotency).
- Writes are gated by `trg_cmres_guard` (immutability once run terminal) and `trg_cmri_guard` (input snapshot immutability).

## Formulas implemented

### Volume (VOL-1..VOL-9)
| Metric | Formula | Notes |
|---|---|---|
| `VOL-CUM-ACT` | `ACT_RAMP_FYn` (input) | Snapshot column (LAST) |
| `VOL-NEW-ACT` | `cum[i] - cum[i-1]` (cum[0] for i=0) | SUM total |
| `VOL-CONV-REBATE` | `ROUND(cum * CONV_REBATE_PCT, 0)` | Integer-rounded per workbook |
| `VOL-CONV-EXPAND` | `ROUND(cum * CONV_EXPAND_PCT, 0)` | |
| `VOL-CONV-MS` | `ROUND(cum * CONV_MS_PCT, 0)` | |

### Revenue base
| Metric | Formula |
|---|---|
| `REV-ACT-ARR` | `VOL-CUM-ACT * AVG_ARR_PER_CUSTOMER_MUSD * 1e6` |
| `REV-INCR-ARR` | `REV-ACT-ARR * INCR_ARR_GROWTH_PCT` |
| `REV-NEW-ACT-ARR` | `VOL-NEW-ACT * AVG_ARR_PER_CUSTOMER_MUSD * 1e6` |
| `REV-EAR-INFLUENCED` | `EAR_POOL_FYn_MUSD * 1e6 * RENEWAL_INFLUENCED_PCT` |

### Revenue streams (11 lines, plus `REV-TOTAL`)
| Metric | Formula |
|---|---|
| `REV-01-BASE-REB` | `REV-EAR-INFLUENCED * BASE_RENEWAL_REBATE_PCT` |
| `REV-02-MKT-REB` | `REV-NEW-ACT-ARR * MARKETPLACE_MIX_PCT * MARKETPLACE_REBATE_PCT` |
| `REV-03-NFLEX-REB` | `REV-INCR-ARR * NON_FLEX_MIX_PCT * NON_FLEX_EXPANSION_REBATE_PCT` |
| `REV-04-FLEX-REB` | `REV-INCR-ARR * (1 - NON_FLEX_MIX_PCT) * FLEX_MIGRATION_REBATE_PCT` |
| `REV-05-GROWTH-ACCEL` | `IF(INCR_ARR_GROWTH_PCT > GROWTH_ACCEL_THRESHOLD_PCT, REV-INCR-ARR * STRATEGIC_GROWTH_ACCEL_PCT, 0)` |
| `REV-06-GROWTH-SHARE` | `REV-INCR-ARR * ARR_PROXY_GROWTH_SHARE_PCT` (Growth-Share **Model 2**, `is_approximation=true`, APX-01) |
| `REV-07-ACT-FUND` | `VOL-NEW-ACT * ACTIVATION_FUND_PER_ACCT_USD` |
| `REV-08-MDF` | `MDF_COSELL_ANNUAL_USD` (flat) |
| `REV-09-SUP-READ` | `SUPPORT_READINESS_FUND_USD` (flat) |
| `REV-10-MS` | `VOL-CONV-MS * MS_ANNUAL_REV_PER_ACCT_USD * (1 + COST_ESCALATOR_PCT)^year_index` (services rev, kept separate from license economics) |
| `REV-11-PS` | `VOL-NEW-ACT * PS_ONETIME_REV_PER_ACCT_USD` (services rev) |
| `REV-TOTAL` | `SUM(REV-01..REV-11)` |

## Constants seeded to `commercial_scenario_assumptions` (BP3.2 migration)

| Code | Source cell | Values |
|---|---|---|
| `CONV_REBATE_PCT` | Assumptions!C/D/E-23 | 0.45 / 0.55 / 0.65 |
| `CONV_EXPAND_PCT` | Assumptions!C/D/E-24 | 0.175 / 0.30 / 0.40 |
| `CONV_MS_PCT` | Assumptions!C/D/E-25 | 0.125 / 0.225 / 0.325 |
| `AVG_ARR_PER_CUSTOMER_MUSD` | Assumptions!C15 | 1.24 (all scenarios) |
| `GROWTH_ACCEL_THRESHOLD_PCT` | Assumptions!C33 | 0.05 |
| `COST_ESCALATOR_PCT` | Assumptions!C92 | 0.03 |
| `EAR_POOL_FY2027_MUSD..FY2031_MUSD` | Assumptions!D10..H10 | 40.7 · 36.5 · 31.9 · 5.5 · 3.2 |

## UI

`/commercial/model/revenue` — read-only dashboard rendering the latest completed
revenue run per scenario. Metrics are grouped into Volume, Revenue Base,
Revenue Streams. Each row exposes a formula-lineage popover displaying the
JSON captured by the engine (inputs, formula, source cells, and
approximation flags).

## Golden-baseline parity (spot checks, Base scenario)

- `VOL-CUM-ACT` FY27..FY31 = 30, 55, 75, 90, 100
- `VOL-NEW-ACT` FY27..FY31 = 30, 25, 20, 15, 10
- `REV-ACT-ARR` FY27 = $37,200,000
- `REV-01-BASE-REB` FY27 = $814,000
- `REV-05-GROWTH-ACCEL` FY27 = $66,960 (triggered: 0.06 > 0.05)
- `REV-05-GROWTH-ACCEL` Conservative FY27 = $0 (0.02 < 0.05)
- `REV-10-MS` Base FY28 = 12 accts × $200,000 × 1.03 = $2,472,000

All values within the ±0.5% tolerance defined in BP3.0-golden-output-baseline.

## Governance

- Financial numbers are directional and gated by `DirectionalBanner` in the UI.
- No PDF/print/export in this package (deferred to BP3.7 signoff).
- Approximation flag `is_approximation=true` set on Growth-Share Model 2 line (APX-01).
