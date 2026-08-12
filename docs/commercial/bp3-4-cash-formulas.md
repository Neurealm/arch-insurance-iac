# BP3.4 — Cash Flow, Working Capital, Break-even, Payback & Sustainability Formulas

## Prerequisite
Requires a completed **P&L run** (BP3.3) for the same `scenario_id` and `model_version_id`.
Reuses `REV-TOTAL`, `COD-TOTAL`, `OPEX-TOTAL`, `PL-EBITDA`, `COD-11_TRAVEL`, `REV-07-ACT-FUND` — **never recomputes** them.

## Assumptions (seeded across CONS / BASE / UPSIDE)
| Code | Value | Purpose |
|---|---|---|
| `PAY_LAG_DAYS` | 60 | Client payment lag (converted to whole quarters) |
| `Q1_ACT_FUND_TIMING_PCT` | 1.0 | Fraction of activation funding collected in Q1 (front-load) |
| `Q1_TRAVEL_FRONTLOAD_PCT` | 1.0 | Fraction of Y1 travel spent in Q1 |

## Y1 Quarterly Cash (metric_group = `cash_quarterly`)
- `CASH-ACCRUED-REV[q]` = `REV-TOTAL[Y1] / 4`
- `CASH-COLLECTED[q]`   = `accrued[q - lagQ] + (q==Q1 ? Y1_ACT_FUND * Q1_ACT_FUND_TIMING_PCT : 0)`
- `CASH-COSTS-PAID[q]`  = `(COD[Y1] + OPEX[Y1] - COD-11_TRAVEL[Y1] * Q1_TRAVEL_FRONTLOAD_PCT) / 4` plus, in Q1 only, `COD-11_TRAVEL[Y1] * Q1_TRAVEL_FRONTLOAD_PCT`
- `CASH-NCF-QTR[q]`     = `CASH-COLLECTED - CASH-COSTS-PAID`
- `CASH-CUM-NCF-QTR[q]` = running sum of `CASH-NCF-QTR`

## Working Capital (metric_group = `working_capital`)
- `WC-PEAK-TROUGH-Y1` = `MIN(CASH-CUM-NCF-QTR[Y1])`
- `WC-MAX-FUNDING`    = `MAX(0, -WC-PEAK-TROUGH-Y1)`
- `WC-REQUIREMENT[fy]` = `MAX(0, -CASH-CUM-ANNUAL[fy])`

## Annual Cash (metric_group = `cash_annual`)
Per model contract §7, annual net cash = EBITDA (cash proxy).
- `CASH-NCF-ANNUAL[fy]`  = `PL-EBITDA[fy]`
- `CASH-CUM-ANNUAL[fy]`  = `SUM(CASH-NCF-ANNUAL[1..y])`
- `CASH-CONVERSION[fy]`  = `CASH-NCF-ANNUAL / REV-TOTAL`
- 5-year total row emitted with `fiscal_period = "FY2027-FY2031"`.

## Break-even (metric_group = `breakeven`, fiscal_period = `SCENARIO`)
- `BE-EBITDA-YEAR` = first FY where `PL-EBITDA >= 0`
- `BE-CASH-YEAR`   = first FY where `CASH-CUM-ANNUAL >= 0`
- `BE-STATUS`      = `"achieved"` | `"not_achieved_by_FY2031"`

## Payback (metric_group = `payback`, fiscal_period = `SCENARIO`)
- `PB-YEAR`   = same year as `BE-CASH-YEAR`
- `PB-MONTHS` = months from FY2027-Q1 start until cumulative cash crosses zero (linear interp within crossover year)

## Financial Sustainability (metric_group = `sustainability`, fiscal_period = `SCENARIO`)
- `SUS-NEG-YEARS`          = count of FYs where `PL-EBITDA < 0`
- `SUS-FUNDING-DEPENDENCY` = `MAX(WC-MAX-FUNDING, MAX(WC-REQUIREMENT[fy]))`
- `SUS-STATUS`             = `"sustainable"` if `BE-STATUS="achieved"` and terminal `CASH-CUM-ANNUAL[FY2031] > 0`; else `"at_risk"`
- `SUS-MODEL-HEALTH`       = `"healthy"` when `SUS-STATUS="sustainable"` and `SUS-NEG-YEARS <= 1`, otherwise `"watch"`

## Lineage
Every result row includes `lineage_json` with `formula`, upstream metric values used, and (for cash proxies) the source `pnl_run_id` / `revenue_run_id` reference.
