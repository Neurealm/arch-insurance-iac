# BP3.0 — Golden Output Baseline

Source-derived outputs from `Neurealm_Citrix_Deal_PL_Model-revised.xlsx`.  
Values below are the workbook's cached formula results (`data_only=True`).  
The BP3 engine must match these within the tolerances in §Tolerances.

> **Data caveat.** Portfolio-level directional model. Account-level ARR,
> renewal dates, product footprint, Flex status, opportunity status, customer
> access, and crediting rules remain pending validation. Outputs are not a
> bookable forecast.

## Tolerances

Unless a formula explicitly disagrees, apply:

| Output type | Absolute tolerance |
|---|---|
| Account counts, FTE (0.25-step) | Exact match |
| Currency ($) | ≤ $0.01 |
| Percentages / ratios | ≤ 1e-6 |
| Text outputs | Exact normalized match |
| Fiscal years / dates | Exact match |

Do not round internal calculations to force a match.

## 1. Volume Drivers (Activation Ramp §D)

### Cumulative Activated Accounts (`VOL-CUM-ACT`)

| Scenario | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 |
|---|---:|---:|---:|---:|---:|
| Conservative | 20 | 35 | 50 | 65 | 75 |
| Base | 30 | 55 | 75 | 90 | 100 |
| Upside | 40 | 75 | 95 | 104 | 104 |

### New Accounts Activated (`VOL-NEW-ACT`)

| Scenario | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | Total |
|---|---:|---:|---:|---:|---:|---:|
| Conservative | 20 | 15 | 15 | 15 | 10 | 75 |
| Base | 30 | 25 | 20 | 15 | 10 | 100 |
| Upside | 40 | 35 | 20 | 9 | 0 | 104 |

### Accounts Generating License Rebate (`VOL-CONV-REBATE`)

| Scenario | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 |
|---|---:|---:|---:|---:|---:|
| Conservative | 9 | 16 | 23 | 29 | 34 |
| Base | 17 | 30 | 41 | 50 | 55 |
| Upside | 26 | 49 | 62 | 68 | 68 |

### Accounts Generating Expansion (`VOL-CONV-EXPAND`)

| Scenario | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 |
|---|---:|---:|---:|---:|---:|
| Conservative | 4 | 6 | 9 | 11 | 13 |
| Base | 9 | 17 | 23 | 27 | 30 |
| Upside | 16 | 30 | 38 | 42 | 42 |

### Accounts Buying Managed Services (`VOL-CONV-MS`)

| Scenario | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 |
|---|---:|---:|---:|---:|---:|
| Conservative | 3 | 4 | 6 | 8 | 9 |
| Base | 7 | 12 | 17 | 20 | 23 |
| Upside | 13 | 24 | 31 | 34 | 34 |

## 2. Base Case P&L (`PL Base`)

All values in USD; column H is 5-yr total (SUM), except GM% and EBITDA% which
are simple averages.

| Line | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | 5-Yr Total |
|---|---:|---:|---:|---:|---:|---:|
| REV-ACT-ARR | 37,200,000 | 68,200,000 | 93,000,000 | 111,600,000 | 124,000,000 | — |
| REV-INCR-ARR | 2,232,000 | 4,092,000 | 5,580,000 | 6,696,000 | 7,440,000 | 26,040,000 |
| REV-NEW-ACT-ARR | 37,200,000 | 31,000,000 | 24,800,000 | 18,600,000 | 12,400,000 | 124,000,000 |
| REV-EAR-INFLUENCED | 16,280,000 | 14,600,000 | 12,760,000 | 2,200,000 | 1,280,000 | 47,120,000 |
| REV-01-BASE-REB | 814,000 | 730,000 | 638,000 | 110,000 | 64,000 | 2,356,000 |
| REV-02-MKT-REB | 558,000 | 465,000 | 372,000 | 279,000 | 186,000 | 1,860,000 |
| REV-03-NFLEX-REB | 180,792 | 331,452 | 451,980 | 542,376 | 602,640 | 2,109,240 |
| REV-04-FLEX-REB | 209,808 | 384,648 | 524,520 | 629,424 | 699,360 | 2,447,760 |
| REV-05-GROWTH-ACCEL | 66,960 | 122,760 | 167,400 | 200,880 | 223,200 | 781,200 |
| REV-06-GROWTH-SHARE | 156,240 | 286,440 | 390,600 | 468,720 | 520,800 | 1,822,800 |
| REV-07-ACT-FUND | 300,000 | 250,000 | 200,000 | 150,000 | 100,000 | 1,000,000 |
| REV-08-MDF | 100,000 | 100,000 | 100,000 | 100,000 | 100,000 | 500,000 |
| REV-09-SUP-READ | 75,000 | 75,000 | 75,000 | 75,000 | 75,000 | 375,000 |
| REV-10-MS | 1,400,000 | 2,472,000 | 3,607,060 | 4,370,908 | 5,177,340.526 | 17,027,308.526 |
| REV-11-PS | 1,350,000 | 1,125,000 | 900,000 | 675,000 | 450,000 | 4,500,000 |
| **REV-TOTAL** | **5,210,800** | **6,342,300** | **7,426,560** | **7,601,308** | **8,198,340.526** | **34,779,308.526** |
| COD-01-POD-LEAD | 200,000 | 309,000 | 424,360 | 491,727.15 | 562,754.405 | 1,987,841.555 |
| COD-02-CS-LEAD | 165,000 | 297,412.5 | 393,859.125 | 495,824.87625 | 603,554.0993625 | 1,955,650.6006125 |
| COD-03-SA | 178,125 | 305,781.25 | 440,936.5625 | 519,045.325 | 601,443.77034375 | 2,045,331.90784375 |
| COD-04-HC-SME | 107,500 | 221,450 | 285,116.875 | 411,138.53375 | 423,472.6897625 | 1,448,678.0985125 |
| COD-05-SVC-PRE | 106,250 | 218,875 | 281,801.5625 | 406,357.853125 | 418,548.58871875 | 1,431,833.00434375 |
| COD-06-L1L2 | 135,000 | 278,100 | 393,859.125 | 479,433.97125 | 531,802.912725 | 1,818,196.008975 |
| COD-07-DATA | 72,500 | 112,012.5 | 192,288.125 | 237,668.1225 | 244,798.166175 | 859,266.913675 |
| COD-08-PMO | 67,500 | 139,050 | 179,026.875 | 258,156.75375 | 265,901.4563625 | 909,635.0851125 |
| COD-09-DEL-LEAD | 106,250 | 218,875 | 281,801.5625 | 406,357.853125 | 418,548.58871875 | 1,431,833.00434375 |
| COD-09B-DEL-VAR | 99,166.6666667 | 175,100 | 255,500.083333 | 309,605.983333 | 366,728.287258 | 1,206,101.020592 |
| COD-10-TOOLS | 35,000 | 36,050 | 37,131.5 | 38,245.445 | 39,392.80835 | 185,819.75335 |
| COD-11-TRAVEL | 105,000 | 87,500 | 70,000 | 52,500 | 35,000 | 350,000 |
| **COD-TOTAL** | **1,377,291.666667** | **2,399,206.25** | **3,235,681.395833** | **4,106,061.867083** | **4,511,945.772777** | **15,630,186.952360** |
| **PNL-GP** | **3,833,508.333333** | **3,943,093.75** | **4,190,878.604167** | **3,495,246.132917** | **3,686,394.753223** | **19,149,121.573640** |
| **PNL-GM-PCT** | **0.735685179** | **0.621713535** | **0.564309533** | **0.459821669** | **0.449651334** | **0.566236250 (avg)** |
| OPEX-01-GM | 150,000 | 154,500 | 159,135 | 163,909.05 | 253,239.48225 | 880,783.53225 |
| OPEX-02-ALLIANCE | 107,500 | 110,725 | 114,046.75 | 176,202.22875 | 181,488.29561 | 689,962.27436 |
| OPEX-03-FIN | 53,750 | 95,275 | 98,133.25 | 143,420.41875 | 147,723.03131 | 538,301.70006 |
| OPEX-04-LEGAL | 133,750 | 60,512.5 | 108,742.25 | 112,004.5175 | 115,364.653025 | 530,373.920525 |
| OPEX-05-MKT | 65,000 | 108,150 | 153,830.5 | 158,445.415 | 208,219.12985 | 693,645.04485 |
| OPEX-06-TRAINING | 40,000 | 10,300 | 10,609 | 10,927.27 | 11,255.0881 | 83,091.3581 |
| OPEX-07-TRAVEL | 20,000 | 20,600 | 21,218 | 21,854.54 | 22,510.1762 | 106,182.7162 |
| OPEX-08-GA | 416,864 | 507,384 | 594,124.8 | 608,104.64 | 655,867.24208 | 2,782,344.68208 |
| OPEX-09-TOOLS | 30,000 | 30,900 | 31,827 | 32,781.81 | 33,765.2643 | 159,274.0743 |
| OPEX-10-RECRUIT | 36,000 | 30,000 | 24,000 | 18,000 | 12,000 | 120,000 |
| **OPEX-TOTAL** | **1,052,864** | **1,128,346.5** | **1,315,666.55** | **1,445,649.89** | **1,641,432.36273** | **6,583,959.30273** |
| **PNL-EBITDA** | **2,780,644.333333** | **2,814,747.25** | **2,875,212.054167** | **2,049,596.242917** | **2,044,962.390493** | **12,565,162.270910** |
| **PNL-EBITDA-MGN** | **0.533630984** | **0.443805441** | **0.387152606** | **0.269637310** | **0.249436137** | **0.376732496 (avg)** |
| **PNL-POD-FTE** | **8** | **13.5** | **17.75** | **22** | **23.75** | — |

## 3. Scenario Summary — Headline 5-Yr

| Metric | Conservative | Base | Upside |
|---|---:|---:|---:|
| Total Revenue ($) | 9,876,419.41125 | 34,779,308.526 | 80,328,983.262 |
| Total COD ($) | 9,542,607.26199375 | 15,630,186.95236 | 19,166,037.25224 |
| Gross Profit ($) | 333,812.14925625 | 19,149,121.57364 | 61,162,946.00976 |
| Avg GM % | 0.05706515473 | 0.56623625000 | 0.76668799387 |
| Total OPEX ($) | 3,948,129.086725 | 6,583,959.30273 | 10,622,360.13661 |
| Total EBITDA ($) | -3,614,316.93746875 | 12,565,162.27091 | 50,540,585.87315 |
| Avg EBITDA % | -0.34261924501 | 0.37673249566 | 0.63435633613 |

## 4. Scenario Summary — Year-1 Snapshot

| Metric | Conservative | Base | Upside |
|---|---:|---:|---:|
| Y1 Revenue ($) | 1,787,120 | 5,210,800 | 11,893,540 |
| Y1 EBITDA ($) | 183,900.4 | 2,780,644.333333 | 8,434,890.133333 |
| Y1 EBITDA % | 0.10290321859 | 0.53363098437 | 0.70919929082 |
| Y1 Cum Accts | 20 | 30 | 40 |
| Y1 Pod FTE | 5.4 | 8 | 10 |
| Y5 Cum Accts | 75 | 100 | 104 |
| Y5 Pod FTE | 15 | 23.75 | 25 |

## 5. Profitability Flags

| Metric | Conservative | Base | Upside |
|---|---:|---:|---:|
| Years with negative EBITDA (of 5) | 4 | 0 | 0 |
| Cumulative 5-Yr EBITDA Shortfall ($) | -3,614,316.937469 | 0 | 0 |
| Min additional Citrix funding needed ($) | 3,614,316.937469 | 0 | 0 |

## 6. EBITDA by Year (chart data)

| Scenario | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 |
|---|---:|---:|---:|---:|---:|
| Conservative | 183,900.4 | -303,932.716667 | -637,578.25 | -1,225,505.364583 | -1,631,201.006219 |
| Base | 2,780,644.333333 | 2,814,747.25 | 2,875,212.054167 | 2,049,596.242917 | 2,044,962.390493 |
| Upside | 8,434,890.133333 | 11,011,132.25 | 11,251,515.258333 | 10,329,821.815708 | 9,513,226.415780 |

## 7. Cash Flow WC — Year-1 Quarterly (Base only)

| Metric | Q1 | Q2 | Q3 | Q4 | FY2027 Total |
|---|---:|---:|---:|---:|---:|
| Accrued Revenue | 1,302,700 | 1,302,700 | 1,302,700 | 1,302,700 | 5,210,800 |
| Cash Collected | 300,000 | 0 | 1,302,700 | 1,302,700 | 2,905,400 |
| Cash Costs Paid | 712,538.916667 | 607,538.916667 | 607,538.916667 | 607,538.916667 | 2,535,155.666667 |
| Quarterly NCF | -412,538.916667 | -607,538.916667 | 695,161.083333 | 695,161.083333 | 370,244.333333 |
| Cumulative NCF | -412,538.916667 | -1,020,077.833333 | -324,916.75 | 370,244.333333 | — |
| **Peak WC Trough (Y1)** | | | | | **-1,020,077.833333** |

## 8. Cumulative EBITDA (Cash proxy, all scenarios)

| Scenario | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 |
|---|---:|---:|---:|---:|---:|
| Conservative | 183,900.4 | -120,032.316667 | -757,610.566667 | -1,983,115.93125 | -3,614,316.937469 |
| Base | 2,780,644.333333 | 5,595,391.583333 | 8,470,603.6375 | 10,520,199.880417 | 12,565,162.270910 |
| Upside | 8,434,890.133333 | 19,446,022.383333 | 30,697,537.641667 | 41,027,359.457375 | 50,540,585.873155 |

## 9. Break-Even & Payback

| Metric | Conservative | Base | Upside |
|---|---|---|---|
| First break-even year (EBITDA ≥ 0) | FY2027 | FY2027 | FY2027 |
| Payback year (cum EBITDA ≥ 0) | FY2027 | FY2027 | FY2027 |
| Sustained-profitability check | "Reverses negative by FY2031 despite early payback" | "Sustained positive through FY2031" | "Sustained positive through FY2031" |
| Y1 break-even cumulative accounts (Base rates) | 18.6333807572158 | 18.6333807572158 | 18.6333807572158 |

## 10. Sensitivity — FY2029 EBITDA (Base anchor)

Base EBITDA anchor = **$2,875,212.054167**.

| Variable | -20% | -10% | +10% | +20% | Range ($) |
|---|---:|---:|---:|---:|---:|
| SENS-01 Base Rebate Rate | 2,747,612.054 | 2,811,412.054 | 2,939,012.054 | 3,002,812.054 | 255,200 |
| SENS-02 Portfolio Activation % | 1,584,040.938 | 2,229,626.496 | 3,520,797.612 | 4,166,383.170 | 2,582,342.2325 |
| SENS-03 Rebate-Account Share | 2,811,412.054 | 2,843,312.054 | 2,907,112.054 | 2,939,012.054 | 127,600 |
| SENS-04 Incremental ARR Growth | 2,601,792.054 | 2,721,762.054 | 3,028,662.054 | 3,182,112.054 | 580,320 |
| SENS-05 Non-Flex / Flex Mix | 2,942,172.054 | 2,908,692.054 | 2,841,732.054 | 2,808,252.054 | 133,920 |
| SENS-06 Services Attach Rate | 2,238,672.054 | 2,450,852.054 | 3,299,572.054 | 3,511,752.054 | 1,273,080 |
| SENS-07 Avg MS Rev / Account | 2,153,800.054 | 2,514,506.054 | 3,235,918.054 | 3,596,624.054 | 1,442,824 |
| SENS-08 Services GM | -721,412 | -360,706 | 360,706 | 721,412 | 1,442,824 (services view only) |
| SENS-09 Growth-Share Rate | 2,797,092.054 | 2,836,152.054 | 2,914,272.054 | 2,953,332.054 | 156,240 |
| SENS-10 Activation Fund / Acct | 2,835,212.054 | 2,855,212.054 | 2,895,212.054 | 2,915,212.054 | 80,000 |
| SENS-11 FTE Ramp | 3,785,481.643 | 3,330,346.849 | 2,420,077.260 | 1,964,942.465 | 1,820,539.178 |
| SENS-12 Loaded Cost / FTE | 3,666,656.683 | 3,270,934.369 | 2,479,489.740 | 2,083,767.425 | 1,582,889.258 |

## 11. Cash Sensitivity — Y1 Peak Trough vs Payment Lag (Base)

| Lag (days) | 30 | 45 | 60 | 75 | 90 | 120 |
|---|---:|---:|---:|---:|---:|---:|
| Peak Y1 Cash Trough ($) | -585,844.5 | -802,961.166667 | -1,020,077.833333 | -1,237,194.5 | -1,454,311.166667 | -1,888,544.5 |

## 12. PL Conservative & PL Upside

The engine must reproduce the full PL table structure (rows 6..67) for
Conservative and Upside using the corresponding scenario column (`SD!C*` and
`SD!E*`). The 5-yr totals for both scenarios are in §3 and match the workbook
`Scenario Summary!C6:E12`.

## 13. Golden Diff Harness (contractual behavior)

BP3.1+ engine tests must, per scenario:

1. Load the frozen workbook, extract cached values.
2. Invoke the engine with the equivalent seeded assumptions.
3. Diff every calculated cell listed in this file.
4. Fail the test on any variance exceeding the §Tolerances table.

Approximations documented in `bp3-model-contract.md` §9 that intentionally
diverge from a naive re-derivation (APX-04, APX-05, APX-06, APX-07) are
enforced against the workbook's cached value, not against any recomputed
"cleaner" value.
