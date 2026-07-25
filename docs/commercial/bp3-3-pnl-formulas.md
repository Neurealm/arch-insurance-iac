# BP3.3 — P&L Engine Formula Catalog

Server-authoritative extension of the Project Momentous model runtime. Adds Cost of
Delivery, Operating Expense, Gross Profit, Gross Margin %, EBITDA, and EBITDA % on
top of the BP3.2 revenue outputs. Cash and sensitivity remain out of scope.

## Scope keyword

`run_scope = "pnl"` (constrained by `commercial_model_runs_run_scope_check`). A pnl
run is only valid when a **completed revenue run for the same
`scenario_id + model_version_id` pair exists**; otherwise the engine fails with
`prerequisite_missing:revenue_run_required`.

## Inputs (per scenario, per FY 2027–2031)

| Domain              | Codes (per FY, suffix `_FY2027..FY2031`) | Count |
| ------------------- | ----------------------------------------- | ----- |
| Cost of Delivery    | `COD_01_POD_LEAD`, `COD_02_CS_LEAD`, `COD_03_SA`, `COD_04_HC_SME`, `COD_05_SVC_PRE`, `COD_06_L1L2`, `COD_07_DATA`, `COD_08_PMO`, `COD_09_DEL_LEAD`, `COD_09B_DEL_VAR`, `COD_10_TOOLS`, `COD_11_TRAVEL` | 12 × 5 = 60 |
| Operating Expense   | `OPEX_01_GM`, `OPEX_02_ALLIANCE`, `OPEX_03_FIN`, `OPEX_04_LEGAL`, `OPEX_05_MKT`, `OPEX_06_TRAINING`, `OPEX_07_TRAVEL`, `OPEX_08_GA`, `OPEX_09_TOOLS`, `OPEX_10_RECRUIT` | 10 × 5 = 50 |
| Staffing memo       | `POD_FTE`                                 | 5     |
| **Per-scenario total** |                                        | **115** |

All 115 codes are seeded in `commercial_scenario_assumptions` for each of the three
Project Momentous scenarios (Conservative, Base, Upside). Sources cite the specific
sheet + row/col from `Neurealm_Citrix_Deal_PL_Model-revised.xlsx`.

## Formulas

For each FY `y`:

```
COD-TOTAL[y]           = Σ COD_i[y]                 (12 lines)
OPEX-TOTAL[y]          = Σ OPEX_j[y]                (10 lines)
PL-GROSS-PROFIT[y]     = REV-TOTAL[y] − COD-TOTAL[y]
PL-GROSS-MARGIN-PCT[y] = PL-GROSS-PROFIT[y] / REV-TOTAL[y]
PL-EBITDA[y]           = PL-GROSS-PROFIT[y] − OPEX-TOTAL[y]
PL-EBITDA-MARGIN-PCT[y]= PL-EBITDA[y] / REV-TOTAL[y]
```

5-year totals use `SUM` on absolute-value rows and ratio-of-sums for margin rows.

`REV-TOTAL[y]` is pulled from the paired revenue run's persisted results
(`commercial_model_results.metric_code = 'REV-TOTAL'`). The revenue `run_id` is
embedded in every derived P&L row's `lineage_json.revenue_run_id`, so the auditor
can trace any EBITDA figure back to the exact upstream revenue run.

## Outputs (persisted rows per pnl run)

| Group                        | Rows per FY | Rows |
| ---------------------------- | ----------- | ---- |
| `cost_of_delivery` (12 lines)| 12          | 60   |
| `cost_of_delivery_total`     | 1 + 1 total | 6    |
| `operating_expense` (10)     | 10          | 50   |
| `operating_expense_total`    | 1 + 1 total | 6    |
| `staffing` (POD-FTE)         | 1           | 5    |
| `pnl` (GP, GM%, EBITDA, EBITDA%) | 4       | 4 × 5 + 4 = 24 |
| **Total**                    |             | **151** |

## Golden parity anchors (Base scenario, source workbook)

| FY      | Revenue        | COD-TOTAL     | Gross Profit  | OPEX-TOTAL   | EBITDA        | EBITDA %  |
| ------- | -------------- | ------------- | ------------- | ------------ | ------------- | --------- |
| FY2027  | 5,210,800.00   | 1,377,291.67  | 3,833,508.33  | 1,052,864.00 | 2,780,644.33  | 53.36 %   |
| FY2028  | 6,342,300.00   | 2,399,206.25  | 3,943,093.75  | 1,128,346.50 | 2,814,747.25  | 44.38 %   |
| FY2029  | 7,426,560.00   | 3,235,681.40  | 4,190,878.60  | 1,315,666.55 | 2,875,212.05  | 38.72 %   |
| FY2030  | 7,601,308.00   | 4,106,061.87  | 3,495,246.13  | 1,445,649.89 | 2,049,596.24  | 26.96 %   |
| FY2031  | 8,198,340.53   | 4,511,945.77  | 3,686,394.75  | 1,641,432.36 | 2,044,962.39  | 24.94 %   |
| 5-yr    | 34,779,308.53  | 15,630,186.95 | 19,149,121.57 | 6,583,959.30 | 12,565,162.27 | 36.13 %   |

Conservative and Upside anchors are captured in `bp3-3-test-evidence.md` after
execution. Parity tolerance: **0.01 USD absolute** and **0.05 pp absolute** for
margin rows (matches BP3.2).

## Immutability & idempotency

Handled by the same BP3.1 primitives used by the revenue scope:
- `commercial_model_run_start` hashes the assumption snapshot + revenue-run
  dependency, so re-invocation returns `reused: true` when nothing changed.
- `commercial_model_run_persist_results_batch` writes the 151 rows atomically.
- `commercial_model_run_complete` freezes the run; downstream edits require a new
  model version.

## Error surfaces

| `error_code`           | Trigger                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `MISSING_INPUT`        | any of the 115 assumption codes absent for the scenario        |
| `PREREQUISITE_MISSING` | no completed revenue run for scenario + model version          |
| `FORBIDDEN`            | caller lacks `commercial.model.run` permission                 |
| `STALE_MODEL_VERSION`  | referenced model version was archived / superseded             |
| `FORMULA_ERROR`        | any other engine exception                                     |
