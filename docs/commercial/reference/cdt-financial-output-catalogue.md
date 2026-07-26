# CDT Financial Output Catalogue

Status: Foundation (CDT-REFERENCE-FOUNDATION, 2026-07-26).
Metric codes below are confirmed in application source and/or the engine
(`supabase/functions/commercial-run-scenario`) — C2/C3. Formula bodies are governed
by `docs/commercial/bp3-formula-catalog.md` and the scope-specific formula documents
(C5); **no formula is inferred here**. Where a formula reference is required for
authorship but not yet transcribed into this catalogue, the entry points to the
authoritative formula document rather than restating it.

Currency: USD. Time grains present: fiscal year (`FY2027`…`FY2031`), fiscal quarter
(`FY2027-Q1`…`FY2027-Q4`), and the multi-year span key `FY2027-FY2031`.
Persistence: all metrics listed are persisted as `commercial_model_results` rows
unless marked derived. Release-evidence status: all persisted results for the active
version are covered by the certified release manifest and lineage (C4).

---

## 1. Interpretation framework (mandatory per metric)

Every metric chapter in Volume 4 must state all sixteen attributes from the authoring
standard §8: name, plain meaning, formula/derivation, source inputs, scenario
sensitivity, time basis, currency basis, unit basis, positive-versus-negative
interpretation, relationship to other metrics, decision supported, warning
conditions, common misinterpretation, input/intermediate/final classification,
persisted-or-derived, and release-evidence status.

---

## 2. Volume / demand metrics (scope: revenue)

| Metric code | Display sense | Class | Unit | Grain |
|---|---|---|---|---|
| `VOL-NEW-ACT` | New activations in period | Intermediate | count | Year/Quarter |
| `VOL-CUM-ACT` | Cumulative activated accounts | Intermediate | count | Year |
| `VOL-CONV-REBATE` | Accounts converting on rebate terms | Intermediate | count | Year |
| `VOL-CONV-MS` | Accounts converting to managed services | Intermediate | count | Year |
| `VOL-CONV-EXPAND` | Accounts converting to expansion | Intermediate | count | Year |

Interpretation frame: volume is the demand engine. It answers *how many accounts, how
fast*. Volume is the single largest driver of scenario divergence and is charted on
SCR-03 as "Activation Ramp (cumulative accounts)".

---

## 3. Revenue metrics (scope: revenue, screen SCR-06)

| Metric code | Display sense | Class |
|---|---|---|
| `REV-01-BASE-REB` | Base rebate revenue line | Intermediate |
| `REV-02-MKT-REB` | Market rebate line | Intermediate |
| `REV-03-NFLEX-REB` | Non-flex rebate line | Intermediate |
| `REV-04-FLEX-REB` | Flex rebate line | Intermediate |
| `REV-05-GROWTH-ACCEL` | Growth accelerator line | Intermediate |
| `REV-06-GROWTH-SHARE` | Growth-share line | Intermediate |
| `REV-07-ACT-FUND` | Activation funding line | Intermediate |
| `REV-08-MDF` | Market development funds line | Intermediate |
| `REV-09-SUP-READ` | Support readiness line | Intermediate |
| `REV-10-MS` | Managed services line | Intermediate |
| `REV-11-PS` | Professional services line | Intermediate |
| `REV-ACT-ARR` | Activated ARR | Intermediate |
| `REV-NEW-ACT-ARR` | New activated ARR | Intermediate |
| `REV-INCR-ARR` | Incremental ARR | Intermediate |
| `REV-EAR-INFLUENCED` | Influenced earnings base | Intermediate |
| `REV-TOTAL` | Total revenue | **Final (scope)** |

Revenue explanation requirements for Volume 4 (framework, not yet authored):
demand/volume, price, mix, adoption or ramp, program timing, scenario-specific
assumptions, period revenue, cumulative revenue, revenue by supported dimension
(the eleven `REV-nn` lines are the supported dimensional breakdown; product, channel
and geography dimensions are **not** present — `GAP-06`), scenario divergence,
revenue's flow into P&L and into cash, run currency and timing, current-versus-stale,
authoritative-versus-historical.

Every Revenue screen explanation must answer the ten mandated questions: what revenue,
which program, which model version, which scenario, which period, which assumptions,
why it differs from another scenario, is it current, is it authoritative, what should
the user conclude.

---

## 4. P&L metrics (scope: pnl, screen SCR-07)

| Metric code | Display sense | Class | Unit |
|---|---|---|---|
| `PNL-REVENUE` | Revenue carried into P&L | Input to scope | USD |
| `COD-LINE` | Cost-of-delivery line item | Intermediate | USD |
| `COD-TOTAL` | Total cost of delivery | Intermediate | USD |
| `POD-FTE` | Delivery staffing (FTE) | Intermediate | count |
| `OPEX-LINE` | Operating expense line item | Intermediate | USD |
| `OPEX-TOTAL` | Total operating expense | Intermediate | USD |
| `PL-GROSS-PROFIT` / `PNL-GROSS-PROFIT` | Gross profit | Intermediate | USD |
| `PL-GROSS-MARGIN-PCT` | Gross margin | Intermediate | ratio |
| `PL-EBITDA` / `PNL-EBITDA` | EBITDA | **Final (scope)** | USD |
| `PL-EBITDA-MARGIN-PCT` / `PNL-EBITDA-MARGIN` | EBITDA margin | **Final (scope)** | ratio |

Note (C2): both `PL-` and `PNL-` prefixed codes appear in source. The manual must
confirm which family is persisted versus display-only before authoring — `GAP-07`.

P&L explanation requirements: revenue carried into P&L, direct cost, gross profit,
gross margin, staffing, operating expenses, EBITDA, EBITDA margin, fixed versus
variable cost behaviour, scenario effects, timing effects, profitability inflection,
current-versus-stale, authoritative-versus-historical.

Unit rule (C2): the P&L screen renders `ratio` for margin metrics and `USD`
otherwise. Margins must never be presented as percentages without unit conversion
being stated.

---

## 5. Cash, working capital, break-even, payback and sustainability (scope: cash, SCR-08)

### Cash flow
| Metric code | Display sense | Class | Grain |
|---|---|---|---|
| `CASH-ACCRUED-REV` | Accrued revenue | Intermediate | Year |
| `CASH-COLLECTED` | Cash collected | Intermediate | Year |
| `CASH-COSTS-PAID` | Cash costs paid | Intermediate | Year |
| `CASH-NCF-QTR` | Net cash flow, quarterly | Intermediate | Quarter |
| `CASH-CUM-NCF-QTR` | Cumulative net cash flow, quarterly | Intermediate | Quarter |
| `CASH-NCF-ANNUAL` | Net cash flow, annual | **Final** | Year |
| `CASH-CUM-ANNUAL` | Cumulative cash, annual | **Final** | Year |
| `CASH-CONVERSION` | Cash conversion | Intermediate | Year |
| `CASH-MAX-FUNDING` | Maximum funding drawn | **Final** | Span |

### Working capital
| Metric code | Display sense |
|---|---|
| `WC-REQUIREMENT` | Working-capital requirement |
| `WC-PEAK-TROUGH-Y1` | Year-1 peak-to-trough working-capital swing |
| `WC-MAX-FUNDING` | Maximum working-capital funding need |

`WC-PEAK-TROUGH-Y1` carries specific history: it was the defect surfaced in
BP3.4.EXECUTE and corrected by BP3.4.1 (Year-1 quarterly travel front-load). Runs
produced by the prior engine build were superseded and cancelled (C4/C5). Any manual
chapter quoting this metric must state the `bp3.4.1` runtime fingerprint requirement.

### Break-even
| Metric code | Display sense |
|---|---|
| `BE-EBITDA-YEAR` | First year of positive EBITDA |
| `BE-CASH-YEAR` | First year of positive cumulative cash |
| `BE-STATUS` | Break-even status classification |

### Payback
| Metric code | Display sense |
|---|---|
| `PB-MONTHS` | Payback period in months |
| `PB-YEAR` | Payback year |
| `PB-CUM-RECOVERY-TERMINAL` | Cumulative recovery at terminal period |
| `CASH-PAYBACK` | Payback measured on the cash basis |

### Sustainability
| Metric code | Display sense |
|---|---|
| `SUS-STATUS` | Overall sustainability classification |
| `SUS-MODEL-HEALTH` | Model health indicator |
| `SUS-NEG-YEARS` | Count of negative cash years |
| `SUS-FUNDING-DEPENDENCY` | Degree of external funding dependency |

Cash explanation requirements for Volume 4: opening cash, inflows, outflows, working
capital, receivables, payables, inventory (**not applicable** to this program —
state explicitly rather than omitting), capital expenditure (**not modelled** —
`GAP-08`), net cash flow, closing cash, runway, break-even, payback, funding
requirement, minimum cash point, scenario effects, current-versus-stale,
authoritative-versus-superseded.

---

## 6. Comparison and sensitivity outputs (derived evidence)

| Output | Where | Class | Persisted |
|---|---|---|---|
| Variance row (Metric, Period, Baseline, Compared, Direction) | SCR-12 | Derived → frozen on Save | Only after Save |
| Key metric roll-up | SCR-12 | Derived | Only after Save |
| Effective assumption difference | SCR-12 | Derived | Only after Save |
| Source-run manifest | SCR-12 | Evidence | Only after Save |
| Perturbation result (Baseline, Perturbed) | SCR-14 | Persisted | Yes |
| Elasticity | SCR-14 | Derived from perturbation results | Per engine |
| Tornado ranking (Top 25 by \|Δ%\|) | SCR-14 | Derived ordering | Display |

Direction is interpreted through `commercial_metric_directionality`: a metric's
"good" direction is data-driven, not assumed. Manual chapters must never assert that
an increase is favourable without citing directionality (C3).

---

## 7. Financial output-to-source matrix

| Scope | Metric family | Formula source | Golden baseline | Engine |
|---|---|---|---|---|
| Revenue | `VOL-*`, `REV-*` | `bp3-2-revenue-formulas.md` | `bp3-golden-output-baseline.md` | `commercial-run-scenario` scope `revenue` |
| P&L | `COD-*`, `POD-*`, `OPEX-*`, `PL-*`/`PNL-*` | `bp3-3-pnl-formulas.md` | `bp3-golden-output-baseline.md` | scope `pnl` |
| Cash | `CASH-*`, `WC-*`, `BE-*`, `PB-*`, `SUS-*` | `bp3-4-cash-formulas.md` (+ BP3.4.1 correction) | `bp3-golden-output-baseline.md` | scope `cash` |
| All | cell provenance | `bp3-source-cell-map.md` | — | — |
| All | catalogue of 87+ formulas | `bp3-formula-catalog.md` | — | — |

Parity status (C4/C5): revenue 378/378 cells at parity; P&L 453 results cent-perfect
against golden anchors; cash metrics at $0.00 variance after BP3.4.1/BP3.4.2.

---

## 8. Scenario explanation framework

1. Scenarios are coherent assumption sets, not separate models — the formulas are
   identical across Conservative, Base and Upside.
2. Common across scenarios: the formula catalogue, metric definitions, period grid,
   currency, directionality, and the model version.
3. May vary: assumption values only.
4. Base is not a forecast commitment; it is the central assumption set.
5. Conservative is not a worst case; it is a cautious assumption set, not a stress test.
6. Upside is not a target; it is a favourable assumption set.
7. Assumptions become effective via the governed apply path (`ACT-20`).
8. After any applied change, affected scenarios must be rerun — prior results are
   stale, not wrong-in-place.
9. Comparisons operate on frozen completed runs, never on live recomputation.
10. Sensitivity varies **one** assumption across perturbations within a single
    baseline; scenarios vary **many** assumptions coherently. They answer different
    questions and must never be conflated.

---

## 9. Catalogue row template for Volume 4

Every metric entry authored in Volume 4 uses these eighteen columns: metric code,
display name, scope, plain-language meaning, formula reference, inputs, unit,
currency treatment, time grain, scenario behaviour, interpretation, related metrics,
screen locations, persisted-or-derived, release-evidence status, source, confidence,
gap status.
