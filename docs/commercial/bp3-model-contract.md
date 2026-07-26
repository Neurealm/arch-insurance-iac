# BP3.0 — Project Momentous Model Contract

Authoritative source: `Neurealm_Citrix_Deal_PL_Model-revised.xlsx` (13 sheets).  
Contract owner: Commercial calculation engine.  
Status: **Completed and Validated (GO).**

> **Closeout status note — 2026-07-26.** BP3.0.VALIDATE returned **GO**. The contract was
> implemented by BP3.1–BP3.8 and is realized by the Active model version PM-FIN-2026.1
> (`5097c3a9-021e-4b2c-9377-540a5d18ada6`, formula catalog `bp3.0-catalog-v1`, source
> fingerprint `bp3.0-baseline`). BP3 closeout documentation has been authored and is pending
> closeout execution and final closeout validation. See
> `docs/commercial/bp3-program-closeout.md` and `docs/commercial/bp3-evidence-index.md`.
> The contract body below is preserved unchanged.

> **Data caveat (must appear on every derived surface):**  
> Portfolio-level directional model. Account-level ARR, renewal dates, product
> footprint, Flex status, opportunity status, customer access, and crediting
> rules remain pending validation. Outputs are not a bookable forecast.

## 1. Modeling Period

- Horizon: **FY2027 → FY2031** (5 fiscal years).
- Historical context: FY2022–FY2026 ARR history (Assumptions §A) and FY2026–FY2031
  EAR / Renewal Pool (Assumptions §B) are inputs, not outputs.
- Fiscal year convention: Citrix fiscal year aligned to workbook column
  headers `FY2027..FY2031` (Activation Ramp `C5:G5`, PL `C5:G5`).
- No mid-year granularity except the **Year-1 quarterly cash view** in
  `Cash Flow WC` §Part 1 (Q1–Q4 of FY2027, Base case only).

## 2. Currency & Numeric Conventions

| Item | Contract |
|---|---|
| Currency | USD |
| Dollar scaling | Assumptions §A/B stored in `$M`; multiplied by `1,000,000` inside PL formulas (e.g. `PL Base!C11 = C6 * Assumptions!$C$15 * 1000000`). Engine must apply the same explicit scaling. |
| Percentage storage | Fractional decimal (0.05 = 5%). |
| Boolean storage | Numeric `1` / `0` (Scenario Drivers row 27: `L1/L2 Support In Scope`). Text mirror allowed for display. |
| Internal numeric precision | IEEE-754 float64. Engine must retain full precision through the chain; no intermediate rounding unless a workbook `ROUND(...)` is present. |
| Display precision | Counts: integer. USD: `$#,##0`. Percentages/ratios: 0.0%. Multiples: 0.0x. FTE: 2 decimals (workbook uses `ROUND(x*4,0)/4` → 0.25-step precision). |
| Rounding of counts | Explicit `ROUND(cum_accounts * conversion_pct, 0)` — see Activation Ramp §D rows 32–34, 44–46, 56–58. |
| Rounding of FTE | `ROUND(cum_accounts / capacity * 4, 0) / 4` (0.25-FTE step). Applied with `MAX(floor, …)` — see PL rows 33–41, 51–55. |
| Rounding of currency | None inside formulas. Presentation rounds to cents; the engine stores full precision. |
| Negative values | Preserved as negative floats (Conservative EBITDA is negative in FY2028–FY2031). Display with parentheses. |
| Zero denominators | Guarded via `IFERROR(x/y, 0)` (PL rows 47, 65). Engine returns `0` and sets a `division_by_zero: true` provenance flag. |
| Blank source cells | Treated as `0` where the workbook uses them in arithmetic (Scenario Drivers `C15=0` for Conservative Strategic Growth Accelerator). |
| Error propagation | Any input `null` outside the sanctioned zero-substitutable set fails the run with `INPUT_MISSING` — never silently coerced. |

## 3. Scenario Contract

| Scenario | Role | Baseline flag |
|---|---|---|
| CONSERVATIVE | Binding underwriting case. Neurealm is underwritten here. | No |
| BASE | Operating target and the comparison baseline for scenario deltas and sensitivity. | **Yes (baseline)** |
| UPSIDE | Value-creation case. Not a guaranteed outcome. | No |

Rules:
1. Conservative, Base, Upside are **alternative** cases — not sequential
   maturity stages.
2. **Base is the only baseline.** Sensitivity and deltas anchor to Base.
3. No scenario inherits assumptions from another. Every assumption row exists
   independently for each of the 3 scenarios (23 assumptions × 3 = 69 rows —
   matches BP2.5 seed).
4. Growth-Share Model 1 (GP-share) is **illustrative only**. Model 2
   (ARR/ACV proxy) drives the P&L (Assumptions §F, Scenario Drivers row 16).

## 4. Portfolio Baseline (FY2026 anchor)

| Metric | Value | Source cell |
|---|---|---|
| No-Partner Customer Count | 104 accounts | `Assumptions!C14` |
| Avg ARR per Customer | $1.24M / account | `Assumptions!C15` |
| FY2026 Baseline No-Partner ARR | $140.9M | `Assumptions!C16` (`=G6`) |
| Broader HC universe | 338 accounts / $442M ARR | BP2.4 metrics only — not used by engine |

## 5. Formula Evaluation Order

Deterministic topological order (no circular references detected in the
workbook):

1. **Inputs**: `Assumptions` (§A–J), `Scenario Drivers` (rows 6–29),
   `Activation Ramp` §A/§B/§C.
2. **Volume**: `Activation Ramp` §D rows 30–38 (Conservative), 42–50 (Base),
   54–62 (Upside).
3. **PL Volume**: `PL <scenario>` rows 6–14.
4. **Revenue**: `PL <scenario>` rows 18–29.
5. **Cost of Delivery**: `PL <scenario>` rows 33–45.
6. **Gross Profit / Margin**: `PL <scenario>` rows 46–47.
7. **Operating Expenses**: `PL <scenario>` rows 51–61.
8. **EBITDA / Margin / FTE memo**: `PL <scenario>` rows 64–65, 67.
9. **Summary**: `Scenario Summary` §Headline (rows 6–12), §Snapshot (rows 16–22),
   §Flags (rows 25, 28–29), §EBITDA-by-year (rows 33–35).
10. **Cash / WC**: `Cash Flow WC` §Part 1 rows 6–14, §Part 2 rows 18–20.
11. **Break-even / Payback**: `Breakeven Payback` §Parts 1–3.
12. **Sensitivity**: `Sensitivity` quantified rows 6–17, cash row 21, qualitative
    rows 26–27.
13. **Terms interpretation**: `Terms Recommendation` (narrative, not
    calculated).

Circular references: **none**.

## 6. Run Governance

- **Immutable runs.** Every calculation produces a `commercial_model_run`
  record with `input_snapshot_hash`, `scenario_code`, `engine_version`,
  `formula_catalog_version`, `started_at`, `completed_at`, `status`. Outputs
  are inserted once and never mutated.
- **Input snapshot.** Every run persists the exact assumption row IDs and
  `updated_at` timestamps that fed the run. Editing an assumption invalidates
  no prior run; it only opens a new run.
- **Source lineage.** Every output row carries `source_formula_id` (from the
  Formula Catalog) and, transitively, a `source_reference_code`
  (`SRC-001..SRC-006`).
- **Run versioning.** `engine_version` follows semver. Any change that alters
  a formula expression bumps the minor version and re-runs golden tests.

## 7. Server-Authoritative Engine Decision

**Selected: Pattern A — Authenticated Supabase Edge Function with a
side-effect-free TypeScript domain engine and an RLS-preserving user-context
database client.**

Rationale (scored against required criteria):

| Criterion | Pattern A (Edge Function + TS engine) | Pattern B (Postgres functions/RPC) |
|---|---|---|
| Determinism | ✅ Pure TS module, unit-testable end-to-end | ✅ Deterministic but harder to snapshot inputs |
| Testability | ✅ Full Vitest coverage, deterministic fixtures, golden diff harness | ⚠ Requires pgTAP + fixture tenants for every formula |
| Source parity | ✅ Formulas expressible almost 1:1 with workbook expressions (arithmetic + `ROUND`/`MAX`/`IF`) | ⚠ Same, but PL/pgSQL is verbose for nested MAX/ROUND arithmetic |
| Security | ✅ Server-only. Edge Function verifies JWT, calls DB with user context, permissions enforced by RLS + `commercial.calculation.execute` permission | ✅ Equivalent, via `SECURITY INVOKER` |
| Transactional persistence | ✅ Single transaction that inserts `commercial_model_run` + output tables | ✅ Native to Postgres |
| Maintainability | ✅ Formulas live next to catalog; typed inputs/outputs; refactor safety | ⚠ SQL-only refactors are riskier |
| No browser duplication | ✅ Browser only invokes `POST /commercial-run-scenario` and reads persisted outputs | ✅ Same |

**Rejected: Pattern B.** Not implemented in BP3. Do not port formulas to
PL/pgSQL.

Client responsibilities are limited to:
- Displaying persisted `commercial_model_run` outputs.
- Rendering assumption forms (BP2.5, already shipped).
- Invoking the Edge Function (never recomputing outputs client-side).

The browser is **never** the authoritative calculator.

## 8. Source Color Contract (workbook)

- **Blue** = editable input / scenario lever. Engine treats as assumption row.
- **Black** = formula calculated within the same sheet. Engine mirrors the
  formula.
- **Green** = formula linking to another sheet. Engine resolves via evaluation
  order (§5).

Editability in the engine is determined by the assumption's registration in
`commercial_scenario_assumptions`, not by cell color alone (§ Terms narrative
cells are blue in the workbook but not editable in the engine).

## 9. Known Approximations & Source Caveats

Every approximation below must be exposed as an engine-level note on the
affected output.

| ID | Approximation | Workbook evidence |
|---|---|---|
| APX-01 | Growth-Share Model 2 (ARR/ACV proxy) is used in P&L; Model 1 (GP-share) is illustrative only | Assumptions §F narrative, Scenario Drivers row 16 vs 17 |
| APX-02 | Cash Flow WC §Part 1 is Base-case, Year-1 only; other scenarios use cumulative-EBITDA proxy in §Part 2 | Cash Flow WC row 22 |
| APX-03 | Break-even §Part 3 uses **Base-case fixed costs** for all activation-level tests; understates the true threshold for non-Base scenarios | Breakeven Payback row 27 |
| APX-04 | Sensitivity variable 2 (activation level) scales COD at 0.3×, not 1.0× | Sensitivity `I7` |
| APX-05 | Sensitivity variable 3 (license-rebate account share) is a "half-weighted proxy" | Sensitivity `I8` |
| APX-06 | Sensitivity variable 8 (services GM) does not re-flow into core COD lines | Sensitivity `I13` |
| APX-07 | Cash sensitivity to payment lag shifts trough by 1 quarter per 90 days (approximation) | Sensitivity row 22 |
| APX-08 | Growth Accelerator applies only when `INCR_ARR_GROWTH_PCT > 0.05` (Assumptions §E `C33`); Conservative rate is 0 so the IF short-circuits | PL rows 22, Assumptions `C33` |

## 10. Model Limitations (non-exhaustive)

1. No account-level data; portfolio averages drive every revenue line.
2. No Citrix GM disclosure; Model 2 used in P&L.
3. Cash view is quarterly for Year-1 Base only; other years use annual
   cumulative EBITDA proxy.
4. Sensitivity is one-way, Base-case, FY2029 anchor only.
5. No FX, no discounting, no NPV, no IRR computed by BP3 (deferred).
6. Terms Recommendation is narrative — not a formula output.
