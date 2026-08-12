# BP3.0 — Formula Catalog

Every formula the BP3 engine must implement. IDs are stable and referenced by
`commercial_model_run_outputs.source_formula_id` in BP3.1+.

Legend:  
- **Type** — `INPUT` (Blue), `CALC` (Black), `LINK` (Green), `NARRATIVE`.  
- **Exact/Approx** — `E` matches workbook exactly; `A` is a documented
  approximation (see contract §9).  
- Cell references use the workbook's row/column addresses so validators can
  round-trip against the source.

## 1. Volume Drivers (`VOL-*`)

| ID | Label | Expression | Src sheet | Cells | Deps | Unit | Grain | Scen | Round | Blank | Err | Type | E/A |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| VOL-CUM-ACT | Cumulative Activated Accounts | Direct input | Activation Ramp | C6:G8 | ACT_RAMP_FY2027..FY2031 | accounts | annual | C/B/U | integer | fail | fail | INPUT | E |
| VOL-NEW-ACT | New Accounts Activated | Direct input | Activation Ramp | C12:G14 | — | accounts | annual | C/B/U | integer | fail | fail | INPUT | E |
| VOL-CONV-REBATE | Accounts Generating License Rebate | `ROUND(cum_acct * conv_rebate_pct, 0)` | Activation Ramp | C32/44/56 : G32/44/56 | VOL-CUM-ACT, `Assumptions!C23/D23/E23` | accounts | annual | C/B/U | ROUND(x,0) | fail | fail | CALC | E |
| VOL-CONV-EXPAND | Accounts Generating Expansion | `ROUND(cum_acct * conv_expand_pct, 0)` | Activation Ramp | C33/45/57 : G33/45/57 | VOL-CUM-ACT, `Assumptions!C24/D24/E24` | accounts | annual | C/B/U | ROUND(x,0) | fail | fail | CALC | E |
| VOL-CONV-MS | Accounts Buying Managed Services | `ROUND(cum_acct * conv_ms_pct, 0)` | Activation Ramp | C34/46/58 : G34/46/58 | VOL-CUM-ACT, `Assumptions!C25/D25/E25` | accounts | annual | C/B/U | ROUND(x,0) | fail | fail | CALC | E |
| VOL-POD-COVER | Accounts Requiring Pod Coverage | `= VOL-CUM-ACT` | Activation Ramp | C35..G35, 47, 59 | VOL-CUM-ACT | accounts | annual | C/B/U | — | — | fail | CALC | E |
| VOL-SA-SUPPORT | Accounts Requiring SA/Tech Support | `= VOL-CONV-EXPAND` | Activation Ramp | C36..G36, 48, 60 | VOL-CONV-EXPAND | accounts | annual | C/B/U | — | — | fail | CALC | E |
| VOL-CS-SUPPORT | Accounts Requiring CS/Adoption | `= VOL-CUM-ACT` | Activation Ramp | C37..G37, 49, 61 | VOL-CUM-ACT | accounts | annual | C/B/U | — | — | fail | CALC | E |
| VOL-PMO | Accounts Requiring PMO | `= VOL-CUM-ACT` | Activation Ramp | C38..G38, 50, 62 | VOL-CUM-ACT | accounts | annual | C/B/U | — | — | fail | CALC | E |

## 2. Activation ARR (`REV-BASE-*`)

| ID | Label | Expression | Src cells | Deps | Unit |
|---|---|---|---|---|---|
| REV-ACT-ARR | Activated ARR Base ($) | `VOL-CUM-ACT * Assumptions!C15 * 1_000_000` | PL row 11 | VOL-CUM-ACT, `C15` (1.24) | USD |
| REV-INCR-ARR | Incremental ARR — In-Year Expansion ($) | `REV-ACT-ARR * INCR_ARR_GROWTH_PCT` | PL row 12 | REV-ACT-ARR, `SD!$D$7` | USD |
| REV-NEW-ACT-ARR | New-Account ARR ($) | `VOL-NEW-ACT * Assumptions!C15 * 1_000_000` | PL row 13 | VOL-NEW-ACT, `C15` | USD |
| REV-EAR-INFLUENCED | Renewal (EAR) Pool Influenced ($) | `Assumptions!EAR_FYn * 1_000_000 * RENEWAL_INFLUENCED_PCT` | PL row 14 | `Assumptions!D10..H10`, `SD!$D$6` | USD |

## 3. Revenue Streams (`REV-*`)

| ID | Label | Expression | Src cell (Base) | Notes |
|---|---|---|---|---|
| REV-01-BASE-REB | 1. Enhanced Base / Influenced Renewal Rebate | `REV-EAR-INFLUENCED * BASE_RENEWAL_REBATE_PCT` | PL Base row 18 | Scen rate = `SD!$D$11` |
| REV-02-MKT-REB | 2. Marketplace / Transacted Rebate | `REV-NEW-ACT-ARR * MARKETPLACE_MIX_PCT * MARKETPLACE_REBATE_PCT` | PL Base row 19 | `SD!$D$9 * SD!$D$12` |
| REV-03-NFLEX-REB | 3. Non-Flex Expansion Rebate | `REV-INCR-ARR * NON_FLEX_MIX_PCT * NON_FLEX_EXPANSION_REBATE_PCT` | PL Base row 20 | `SD!$D$8 * SD!$D$13` |
| REV-04-FLEX-REB | 4. Flex Expansion / Migration Uplift Rebate | `REV-INCR-ARR * (1 - NON_FLEX_MIX_PCT) * FLEX_MIGRATION_REBATE_PCT` | PL Base row 21 | `(1-SD!$D$8) * SD!$D$14` |
| REV-05-GROWTH-ACCEL | 5. Strategic Growth Accelerator | `IF(INCR_ARR_GROWTH_PCT > Assumptions!C33 (0.05), REV-INCR-ARR * STRATEGIC_GROWTH_ACCEL_PCT, 0)` | PL Base row 22 | Conservative rate `C15=0` → zero |
| REV-06-GROWTH-SHARE | 6. Growth-Share / Profit-Share (Model 2) | `REV-INCR-ARR * ARR_PROXY_GROWTH_SHARE_PCT` | PL Base row 23 | `SD!$D$16` |
| REV-07-ACT-FUND | 7. Activation Fund (Citrix) | `VOL-NEW-ACT * ACTIVATION_FUND_PER_ACCT_USD` | PL Base row 24 | `SD!$D$23` |
| REV-08-MDF | 8. MDF / Co-Sell Funding | `MDF_COSELL_ANNUAL_USD` (flat/yr) | PL Base row 25 | `SD!$D$24` |
| REV-09-SUP-READ | 9. Support Readiness Fund / Retainer | `SUPPORT_READINESS_FUND_USD` (flat/yr) | PL Base row 26 | `SD!$D$25` |
| REV-10-MS | 10. Managed Services Revenue | `VOL-CONV-MS * MS_ANNUAL_REV_PER_ACCT_USD * (1 + Assumptions!C92)^year_index` | PL Base row 27 | `year_index` = 0..4 for FY27..FY31 |
| REV-11-PS | 11. Professional Services / Modernization | `VOL-NEW-ACT * PS_ONETIME_REV_PER_ACCT_USD` | PL Base row 28 | `SD!$D$20` |
| REV-TOTAL | TOTAL NEUREALM REVENUE | `SUM(REV-01..REV-11)` | PL Base row 29 | — |

## 4. Cost of Delivery (`COD-*`)

Common FTE pattern (rows 33–41):  
`FTE_headcount = MAX(floor_fte, ROUND(cum_acct / capacity * 4, 0) / 4)`  
`role_cost = FTE_headcount * annual_rate * (1 + escalator)^year_index`

Escalator `Assumptions!C92 = 0.03`. `year_index` = 0..4.

| ID | Label | Floor cell | Capacity cell | Rate cell | Src cell (Base) | Notes |
|---|---|---|---|---|---|---|
| COD-01-POD-LEAD | Account Pod Lead | C75 (1) | D75 (40) | C58 (200k) | PL row 33 | — |
| COD-02-CS-LEAD | Customer Success / Adoption Lead | C76 (0.5) | D76 (32) | C59 (165k) | PL row 34 | — |
| COD-03-SA | Citrix Solution Architect | C77 (0.5) | D77 (45) | C60 (237.5k) | PL row 35 | — |
| COD-04-HC-SME | Healthcare Workflow SME | C78 (0.25) | D78 (55) | C61 (215k) | PL row 36 | — |
| COD-05-SVC-PRE | Services Attach / Pre-Sales Lead | C79 (0.25) | D79 (55) | C62 (212.5k) | PL row 37 | — |
| COD-06-L1L2 | L1/L2 Support Resources | C81 (0) | D81 (28) | C64 (135k) | PL row 38 | Gated by `IF(SD!$D$27=0, 0, MAX(...))` |
| COD-07-DATA | Data / RevOps Analyst | C82 (0.25) | D82 (65) | C65 (145k) | PL row 39 | — |
| COD-08-PMO | Program Manager / PMO | C83 (0.5) | D83 (55) | C66 (135k) | PL row 40 | — |
| COD-09-DEL-LEAD | Delivery Lead (base FTE) | C80 (0.25) | D80 (55) | C63 (212.5k) | PL row 41 | — |
| COD-09B-DEL-VAR | Delivery Resources (variable) | — | C88 (15 acct/FTE) | C63 (212.5k) | PL row 42 | `(VOL-CONV-MS / 15) * rate * (1+esc)^y` |
| COD-10-TOOLS | Third-Party Tools & Infra | — | — | C95 (35k) | PL row 43 | `flat * (1+esc)^y` |
| COD-11-TRAVEL | Travel & Customer Workshops | — | — | C97 (3.5k/acct) | PL row 44 | `VOL-NEW-ACT * 3500` (no escalator per formula) |
| COD-TOTAL | TOTAL COST OF DELIVERY | — | — | — | PL row 45 | `SUM(COD-01..COD-11)` |

## 5. Gross Profit / Margin (`PNL-GP-*`)

| ID | Label | Expression | Cell | Blank/Err |
|---|---|---|---|---|
| PNL-GP | GROSS PROFIT | `REV-TOTAL - COD-TOTAL` | PL row 46 | fail |
| PNL-GM-PCT | Gross Margin % | `IFERROR(PNL-GP / REV-TOTAL, 0)` | PL row 47 | 0 on div-by-zero |
| PNL-GM-AVG | 5-yr Avg GM % | `AVERAGE(C47:G47)` (simple avg, not weighted) | PL row 47 col H | — |

## 6. Operating Expenses (`OPEX-*`)

Same FTE pattern as COD, plus one-time and G&A pieces.

| ID | Label | Expression | Src cell (Base) |
|---|---|---|---|
| OPEX-01-GM | Executive Sponsor / Program GM | FTE(C73=0.5, D73=150, C56=300k, esc) | PL row 51 |
| OPEX-02-ALLIANCE | Alliance Management | FTE(C74=0.5, D74=130, C57=215k, esc) | PL row 52 |
| OPEX-03-FIN | Finance & Deal Ops | FTE(C85=0.25, D85=130, C68=155k, esc) + `C99=15k * (1+esc)^y` | PL row 53 |
| OPEX-04-LEGAL | Legal & Contracting | FTE(C86=0.15, D86=175, C69=175k, esc) + `C100=75k one-time (FY27 only)` + `C101=15k * (1+esc)^y` | PL row 54 |
| OPEX-05-MKT | Marketing / Materials | FTE(C84=0.25, D84=110, C67=160k, esc) + `C96=25k * (1+esc)^y` | PL row 55 |
| OPEX-06-TRAINING | Training & Certification | FY27: `C102=30k + C103=10k`. FY28..FY31: `C103 * (1+esc)^y` | PL row 56 |
| OPEX-07-TRAVEL | Travel (not delivery-tied) | `C98=20k * (1+esc)^y` | PL row 57 |
| OPEX-08-GA | G&A Allocation | `REV-TOTAL * Assumptions!C93 (0.08)` | PL row 58 |
| OPEX-09-TOOLS | Internal Systems & Tooling | `C94=30k * (1+esc)^y` | PL row 59 |
| OPEX-10-RECRUIT | Recruiting / Hiring | `VOL-NEW-ACT / 10 * C104 (12k)` | PL row 60 |
| OPEX-TOTAL | TOTAL OPEX | `SUM(OPEX-01..OPEX-10)` | PL row 61 |

## 7. EBITDA (`PNL-EBITDA-*`)

| ID | Label | Expression | Cell |
|---|---|---|---|
| PNL-EBITDA | EBITDA | `PNL-GP - OPEX-TOTAL` | PL row 64 |
| PNL-EBITDA-MGN | EBITDA Margin % | `IFERROR(PNL-EBITDA / REV-TOTAL, 0)` | PL row 65 |
| PNL-EBITDA-CUM | Cumulative EBITDA | `SUM(PNL-EBITDA[FY27..FYn])` | Scenario Summary rows 18–20, Breakeven Payback rows 12–14 |

## 8. Pod FTE Memo (`PNL-FTE-*`)

| ID | Label | Expression | Cell |
|---|---|---|---|
| PNL-POD-FTE | Total Pod FTE | Sum of `MAX(floor, ROUND(cum/cap*4,0)/4)` across roles C73..C86 (excluding L1/L2 when `SD!$D$27=0`) | PL row 67 |

## 9. Cash / WC (`CASH-*`)

| ID | Label | Expression | Src cell |
|---|---|---|---|
| CASH-Y1-ACCR-REV | Accrued Revenue quarterly | `REV-TOTAL[FY27,Base] / 4` per Q | Cash Flow WC row 6 |
| CASH-Y1-LAG-Q | Payment Lag (quarters) | `ROUND(PAYMENT_LAG_DAYS / 90, 0)` | Cash Flow WC row 8 |
| CASH-Y1-COLLECT | Cash Collected per Q | Activation Fund upfront Q1 + accrual shifted by lag Q | Cash Flow WC row 9 |
| CASH-Y1-COSTS | Cash Costs Paid per Q | `(COD-TOTAL[FY27] + OPEX-TOTAL[FY27] - one-times) / 4`, plus one-times front-loaded Q1 | Cash Flow WC row 10 |
| CASH-Y1-NCF | Quarterly Net Cash Flow | `CASH-Y1-COLLECT - CASH-Y1-COSTS` | Cash Flow WC row 11 |
| CASH-Y1-CUM | Cumulative Net Cash Flow | Running sum of NCF | Cash Flow WC row 12 |
| CASH-Y1-TROUGH | Peak WC Requirement (Y1 Base) | `MIN(CASH-Y1-CUM Q1..Q4)` | Cash Flow WC row 14 |
| CASH-CUM-EBITDA | Cumulative EBITDA proxy | `PNL-EBITDA-CUM` per scenario | Cash Flow WC rows 18–20 |

## 10. Break-even & Payback (`BE-*`)

| ID | Label | Expression | Cell |
|---|---|---|---|
| BE-FIRST-EBITDA-POS | First Break-Even Year | First FY where `PNL-EBITDA >= 0` | Breakeven Payback H6:H8 |
| BE-PAYBACK-YR | Payback Year | First FY where `PNL-EBITDA-CUM >= 0` | Breakeven Payback H12:H14 |
| BE-SUSTAINED | Sustained Profitability text | Rule: `"Sustained positive through FY2031"` if `PNL-EBITDA-CUM[FY31] > 0` AND `PNL-EBITDA-CUM` strictly non-decreasing after payback year; else `"Reverses negative by FY2031 despite early payback"` | Breakeven Payback row 17 |
| BE-Y1-EBITDA-CURVE | Y1 EBITDA vs cumulative accounts | Recompute Y1 revenue at each tested cum-account level using Base-case rates; hold Base-case COD+OpEx fixed (APX-03) | Breakeven Payback rows 20–23 |
| BE-Y1-BREAKEVEN-ACCT | Break-Even Y1 Cumulative Accounts | Linear interpolation on BE-Y1-EBITDA-CURVE where EBITDA crosses 0 | Breakeven Payback C25 |

## 11. Sensitivity (`SENS-*`)

Anchor: Base case, FY2029 EBITDA (`PNL-EBITDA[Base,FY2029]`).

For each variable v ∈ {1..12}, recompute `PNL-EBITDA[Base,FY2029]` with `v`
scaled by `{-20%, -10%, +10%, +20%}`. Base column is unmodified EBITDA.

| ID | Variable | Anchor cell | Notes |
|---|---|---|---|
| SENS-01 | Enhanced Base Rebate Rate | `SD!D11` (0.05) | — |
| SENS-02 | % Portfolio Activated (proxy: cum accounts) | Activation Ramp Base row 42 | COD scales at 0.3×, revenue 1× (APX-04) |
| SENS-03 | % Accounts Generating Rebate | `Assumptions!D23` (0.55) | Half-weighted proxy (APX-05) |
| SENS-04 | Incremental ARR Growth Rate | `SD!D7` (0.06) | — |
| SENS-05 | Non-Flex vs Flex Mix | `SD!D8` (0.60) | — |
| SENS-06 | Services Attach Rate | `Assumptions!D25` (0.225) | — |
| SENS-07 | Avg MS Rev / Account | `SD!D19` (200k) | — |
| SENS-08 | Services GM | `SD!D21` (0.62) | Does not flow into COD (APX-06) |
| SENS-09 | Growth-Share Rate | `SD!D16` (0.07) | — |
| SENS-10 | Activation Fund / Account | `SD!D23` (10k) | — |
| SENS-11 | FTE Ramp / Staffing | All floor/capacity ratios | Inverse: -20% capacity => more FTE |
| SENS-12 | Loaded Cost / FTE | All `Assumptions!C56..C69` | — |
| SENS-CASH-LAG | Payment Lag → Y1 Peak Trough | `SD!D29` days | 1 Q shift per 90 days (APX-07) |
| SENS-13-Q | Support Scope toggle | `SD!D27` | Qualitative — narrative only |
| SENS-14-Q | GP Model 1 vs Model 2 | `SD!D17` vs `SD!D16` | Qualitative — narrative only |

## 12. Terms Interpretation (`TERM-*`)

All rows in `Terms Recommendation` are narrative. The engine renders them
statically from a rule table; no calculation. Verbatim strings stored in
`bp3-source-cell-map.md`.

| ID | Rule |
|---|---|
| TERM-MIN-TERMS | 20 rows (`Terms!B6:B25`) |
| TERM-RED-FLAGS | 8 rows (`Terms!B29:B36`) |
| TERM-DATA-REQ | (row range documented in cell map) |
| TERM-RECOMMENDATION | Accept/Renegotiate/Reject narrative rendered as-is |

## Formula Totals

- Volume drivers (`VOL-*`): 9
- Activation ARR (`REV-BASE-*`): 4
- Revenue streams (`REV-*`): 12 (11 lines + total)
- Cost of delivery (`COD-*`): 13 (12 lines + total)
- Gross Profit / Margin (`PNL-GP-*`): 3
- Operating Expenses (`OPEX-*`): 11 (10 lines + total)
- EBITDA (`PNL-EBITDA-*`): 3
- FTE memo (`PNL-FTE-*`): 1
- Cash / WC (`CASH-*`): 8
- Break-even / Payback (`BE-*`): 5
- Sensitivity (`SENS-*`): 14 (12 quantified + 1 cash + 2 qualitative flags — the 2 qualitative flags do not generate a numeric result)
- Terms (`TERM-*`): 4 narrative groups

**Total formula IDs: 87.**  
**Distinct calculated numeric outputs per scenario per year: 61.**

## Dependency Graph (high-level)

```text
Assumptions §A/B/C/E/F/H/I/J ─┐
Scenario Drivers rows 6–29 ───┤
Activation Ramp §A/§B/§C  ────┤
                              ▼
                     Activation Ramp §D  ──► VOL-*
                              │
                              ▼
                          PL rows 6–14   ──► REV-BASE-*
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       REV-* (rows 18–29)  COD-* (33–45)   OPEX-* (51–61)
              │                 │                 │
              └────► REV-TOTAL  │                 │
                                └────► PNL-GP ────┼────► PNL-EBITDA
                                                  │
                                            ─► PNL-* (rows 46–65, 67)
                                                  │
                       ┌──────────────────────────┼──────────────────────────┐
                       ▼                          ▼                          ▼
              Scenario Summary            Cash Flow WC              Breakeven Payback
                       │                                                     │
                       └────► Sensitivity (Base FY2029 EBITDA anchor) ◄──────┘
                                                                             │
                                                                Terms Recommendation (narrative)
```

Circular references: **none**. Every downstream sheet consumes upstream
outputs only.
