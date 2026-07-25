# BP3.0 — Source Cell Map

Every input value the engine reads from the workbook, and every calculated cell
the engine reproduces. Cell addresses come from
`Neurealm_Citrix_Deal_PL_Model-revised.xlsx`.

## 1. Assumptions Sheet — Constants (Blue)

| Assumption code | Cell | Value | Unit | Notes |
|---|---|---|---|---|
| HIST_NP_ARR_FY2022..FY2026 | `C6..G6` | 95.4/116.4/141/152.5/140.9 | $M | Historical anchor |
| EAR_POOL_FY2026 | `C10` | 23.9 | $M | Not used in engine (out of horizon) |
| EAR_POOL_FY2027 | `D10` | 40.7 | $M | REV-EAR-INFLUENCED |
| EAR_POOL_FY2028 | `E10` | 36.5 | $M | REV-EAR-INFLUENCED |
| EAR_POOL_FY2029 | `F10` | 31.9 | $M | REV-EAR-INFLUENCED |
| EAR_POOL_FY2030 | `G10` | 5.5 | $M | REV-EAR-INFLUENCED |
| EAR_POOL_FY2031 | `H10` | 3.2 | $M | REV-EAR-INFLUENCED |
| NO_PARTNER_CUSTOMER_COUNT | `C14` | 104 | accounts | Reference only |
| AVG_ARR_PER_CUSTOMER | `C15` | 1.24 | $M/account | Multiplier for REV-ACT-ARR & REV-NEW-ACT-ARR |
| FY2026_BASELINE_NP_ARR | `C16` | 140.9 (=G6) | $M | Reference only |
| GROWTH_ACCEL_THRESHOLD | `C33` | 0.05 | ratio | Trigger for REV-05-GROWTH-ACCEL |
| CONV_REBATE_C/B/U | `C23/D23/E23` | 0.45/0.55/0.65 | ratio | VOL-CONV-REBATE |
| CONV_EXPAND_C/B/U | `C24/D24/E24` | 0.175/0.30/0.40 | ratio | VOL-CONV-EXPAND |
| CONV_MS_C/B/U | `C25/D25/E25` | 0.125/0.225/0.325 | ratio | VOL-CONV-MS |
| GP_SHARE_M2_C/B/U | `C37/C38/C39` and `D37/D38/D39` | 0.045/0.07/0.09 (Model 2 tiers) | ratio | Reference; Scenario Driver row 16 is the single point-estimate consumed |
| GP_SHARE_M1_C/B/U | `C37..C39` | 0.125/0.175/0.225 (Model 1 tiers) | ratio | Illustrative only (APX-01) |
| CITRIX_GM_PLACEHOLDER | `C40` | 0.70 | ratio | Illustrative only |
| RATE_PROGRAM_GM | `C56` | 300000 | USD | OPEX-01 |
| RATE_ALLIANCE_LEAD | `C57` | 215000 | USD | OPEX-02 |
| RATE_POD_LEAD | `C58` | 200000 | USD | COD-01 |
| RATE_CS_LEAD | `C59` | 165000 | USD | COD-02 |
| RATE_SA | `C60` | 237500 | USD | COD-03 |
| RATE_HC_SME | `C61` | 215000 | USD | COD-04 |
| RATE_SVC_PRE | `C62` | 212500 | USD | COD-05 |
| RATE_DEL_LEAD | `C63` | 212500 | USD | COD-09, COD-09B |
| RATE_L1L2 | `C64` | 135000 | USD | COD-06 |
| RATE_DATA | `C65` | 145000 | USD | COD-07 |
| RATE_PMO | `C66` | 135000 | USD | COD-08 |
| RATE_MKT | `C67` | 160000 | USD | OPEX-05 |
| RATE_FINANCE | `C68` | 155000 | USD | OPEX-03 |
| RATE_LEGAL | `C69` | 175000 | USD | OPEX-04 |
| FLOOR_PROGRAM_GM | `C73` | 0.5 | FTE | OPEX-01 |
| CAP_PROGRAM_GM | `D73` | 150 | acct/FTE | OPEX-01 |
| FLOOR/CAP_ALLIANCE | `C74/D74` | 0.5 / 130 | — | OPEX-02 |
| FLOOR/CAP_POD_LEAD | `C75/D75` | 1 / 40 | — | COD-01 |
| FLOOR/CAP_CS_LEAD | `C76/D76` | 0.5 / 32 | — | COD-02 |
| FLOOR/CAP_SA | `C77/D77` | 0.5 / 45 | — | COD-03 |
| FLOOR/CAP_HC_SME | `C78/D78` | 0.25 / 55 | — | COD-04 |
| FLOOR/CAP_SVC_PRE | `C79/D79` | 0.25 / 55 | — | COD-05 |
| FLOOR/CAP_DEL_LEAD | `C80/D80` | 0.25 / 55 | — | COD-09 |
| FLOOR/CAP_L1L2 | `C81/D81` | 0 / 28 | — | COD-06 |
| FLOOR/CAP_DATA | `C82/D82` | 0.25 / 65 | — | COD-07 |
| FLOOR/CAP_PMO | `C83/D83` | 0.5 / 55 | — | COD-08 |
| FLOOR/CAP_MKT | `C84/D84` | 0.25 / 110 | — | OPEX-05 |
| FLOOR/CAP_FINANCE | `C85/D85` | 0.25 / 130 | — | OPEX-03 |
| FLOOR/CAP_LEGAL | `C86/D86` | 0.15 / 175 | — | OPEX-04 |
| MS_DELIVERY_CAPACITY | `C88` | 15 | acct/FTE | COD-09B |
| COST_ESCALATOR | `C92` | 0.03 | ratio | All escalated lines |
| GA_ALLOCATION_PCT | `C93` | 0.08 | ratio | OPEX-08 |
| INT_SYSTEMS_ANNUAL | `C94` | 30000 | USD | OPEX-09 |
| THIRD_PARTY_TOOLS | `C95` | 35000 | USD | COD-10 |
| MKT_MATERIALS | `C96` | 25000 | USD | OPEX-05 (added inside FTE line) |
| TRAVEL_PER_NEW_ACCT | `C97` | 3500 | USD | COD-11 |
| TRAVEL_NON_DELIVERY | `C98` | 20000 | USD | OPEX-07 |
| FIN_OPS_NONPPL | `C99` | 15000 | USD | OPEX-03 (added, escalated) |
| LEGAL_Y1_ONETIME | `C100` | 75000 | USD | OPEX-04 (FY27 only, no escalator) |
| LEGAL_ANNUAL_NONPPL | `C101` | 15000 | USD | OPEX-04 |
| TRAINING_Y1_ONETIME | `C102` | 30000 | USD | OPEX-06 |
| TRAINING_ANNUAL | `C103` | 10000 | USD | OPEX-06 |
| RECRUIT_COST_PER_FTE | `C104` | 12000 | USD | OPEX-10 |

## 2. Scenario Drivers Sheet — Levers (Blue)

Columns: C = Conservative, D = Base, E = Upside. All 23 rows are stored in
`commercial_scenario_assumptions` today (BP2.5 seed).

| DB assumption_code | Row | Cells (C/D/E) | Unit |
|---|---|---|---|
| RENEWAL_INFLUENCED_PCT | 6 | 0.25 / 0.40 / 0.55 | ratio |
| INCR_ARR_GROWTH_PCT | 7 | 0.02 / 0.06 / 0.11 | ratio |
| NON_FLEX_MIX_PCT | 8 | 0.70 / 0.60 / 0.50 | ratio |
| MARKETPLACE_MIX_PCT | 9 | 0.20 / 0.30 / 0.40 | ratio |
| BASE_RENEWAL_REBATE_PCT | 11 | 0.04 / 0.05 / 0.06 | ratio |
| MARKETPLACE_REBATE_PCT | 12 | 0.04 / 0.05 / 0.06 | ratio |
| NON_FLEX_EXPANSION_REBATE_PCT | 13 | 0.12 / 0.135 / 0.15 | ratio |
| FLEX_MIGRATION_REBATE_PCT | 14 | 0.22 / 0.235 / 0.25 | ratio |
| STRATEGIC_GROWTH_ACCEL_PCT | 15 | 0 / 0.03 / 0.05 | ratio |
| ARR_PROXY_GROWTH_SHARE_PCT | 16 | 0.045 / 0.07 / 0.09 | ratio |
| — (Model 1 illustrative) | 17 | 0.125 / 0.175 / 0.225 | ratio (not in DB) |
| MS_ANNUAL_REV_PER_ACCT_USD | 19 | 125000 / 200000 / 300000 | USD |
| PS_ONETIME_REV_PER_ACCT_USD | 20 | 25000 / 45000 / 70000 | USD |
| MS_GROSS_MARGIN_PCT | 21 | 0.55 / 0.62 / 0.68 | ratio |
| ACTIVATION_FUND_PER_ACCT_USD | 23 | 8000 / 10000 / 12000 | USD |
| MDF_COSELL_ANNUAL_USD | 24 | 50000 / 100000 / 175000 | USD |
| SUPPORT_READINESS_FUND_USD | 25 | 0 / 75000 / 150000 | USD |
| L1_L2_SUPPORT_IN_SCOPE | 27 | 0 / 1 / 1 | boolean |
| PAYMENT_LAG_DAYS | 29 | 90 / 60 / 45 | days |
| ACT_RAMP_FY2027..FY2031 | Activation Ramp §A rows 6–8 | (C:20/35/50/65/75, B:30/55/75/90/100, U:40/75/95/104/104) | accounts |

**DB ↔ workbook parity: 100% (23 rows × 3 scenarios = 69 assumptions
already seeded in BP2.5; verified against `commercial_scenario_assumptions`).**

## 3. PL Sheets — Calculated Cells

Cells the engine reproduces per scenario. `<scen>` ∈ {Conservative, Base, Upside}
selects the matching PL tab and Scenario Drivers column.

| Formula ID | Cells (per PL tab, FY27..FY31) | Total column | Type |
|---|---|---|---|
| VOL-CUM-ACT | C6..G6 | H6 (`=G6`) | LINK |
| VOL-NEW-ACT | C7..G7 | H7 (SUM) | LINK |
| VOL-CONV-REBATE | C8..G8 | H8 (`=G8`) | LINK |
| VOL-CONV-EXPAND | C9..G9 | H9 (`=G9`) | LINK |
| VOL-CONV-MS | C10..G10 | H10 (`=G10`) | LINK |
| REV-ACT-ARR | C11..G11 | H11 (`=G11`) | CALC |
| REV-INCR-ARR | C12..G12 | H12 (SUM) | CALC |
| REV-NEW-ACT-ARR | C13..G13 | H13 (SUM) | CALC |
| REV-EAR-INFLUENCED | C14..G14 | H14 (SUM) | CALC |
| REV-01..REV-11 | C18..G18 through C28..G28 | H18..H28 (SUM) | CALC |
| REV-TOTAL | C29..G29 | H29 (SUM) | CALC |
| COD-01..COD-11 | C33..G33 through C44..G44 | H33..H44 (SUM) | CALC |
| COD-TOTAL | C45..G45 | H45 (SUM) | CALC |
| PNL-GP | C46..G46 | H46 (SUM) | CALC |
| PNL-GM-PCT | C47..G47 | H47 (AVERAGE) | CALC |
| OPEX-01..OPEX-10 | C51..G51 through C60..G60 | H51..H60 (SUM) | CALC |
| OPEX-TOTAL | C61..G61 | H61 (SUM) | CALC |
| PNL-EBITDA | C64..G64 | H64 (SUM) | CALC |
| PNL-EBITDA-MGN | C65..G65 | H65 (AVERAGE) | CALC |
| PNL-POD-FTE | C67..G67 | — | CALC |

## 4. Scenario Summary Sheet

| Formula ID | Cells | Type |
|---|---|---|
| PNL-EBITDA-CUM (per scen, per year) | C18:G20 (Cash Flow WC) & C12:G14 (Breakeven Payback) | CALC |
| Headline 5-yr Revenue/COD/GP/GM%/OPEX/EBITDA/EBITDA% | C6:E12 | LINK from PL H29/H45/H46/H47/H61/H64/H65 |
| Y1 snapshot | C16:E22 | LINK from PL C-col FY27 |
| Years-with-negative-EBITDA | C25:E25 | CALC (`COUNTIF(<row>,"<0")`) |
| Cum EBITDA shortfall | C28:E28 | CALC (`MIN(cum_ebitda_row, 0)`) |
| Min additional Citrix funding | C29:E29 | CALC (`ABS(cum_ebitda_shortfall)`) |
| EBITDA-by-year chart data | C33:G35 | LINK from PL row 64 |

## 5. Cash Flow WC

See Formula Catalog §9. Cells `C6:G14` (Part 1 quarterly) and `C18:G20`
(Part 2 annual).

## 6. Breakeven Payback

Cells `C6:H8` (annual EBITDA + first BE year), `C12:H14` (cumulative EBITDA
+ payback year), `C17:E17` (sustained profitability text), `C20:J23` (Y1
sensitivity), `C25` (interpolated break-even accounts).

## 7. Sensitivity

Cells `C6:H17` (quantified sensitivity table), `C21:H21` (cash lag),
narrative in `C26:C27`, `B30`.

## 8. Terms Recommendation

All values are narrative text in column C (rows 6..66). Stored verbatim in a
`terms_recommendation` static table; no formula.

## 9. Cell Style Verification (color contract)

Blue-styled inputs verified by `openpyxl`: every cell listed in §1 and §2 is
either explicitly typed constant (int/float/bool) or a top-level `=` reference
to another blue cell (e.g. `C16 = G6`). No blue-styled cell contains a
downstream computation.

Green (cross-sheet) references verified for every PL row 6–14 pointing to
`'Activation Ramp'!*`, and for Scenario Summary/Cash/Breakeven pointing to
`'PL <scen>'!*`.

Black (in-sheet formulas) verified for every computed cell in §3–§7. No
formula/style mismatch detected.
