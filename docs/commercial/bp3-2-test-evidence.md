# BP3.2 — Test Evidence (Runtime, BP3.2.1 finalized)

Live runtime evidence captured 2026-07-25 following execution of the
`commercial-run-scenario` edge function against `PM-FIN-2026.1` (Draft) in
tenant `NeuGAIN Commercial` (`d6e1f4a0-ef31-433e-825e-c2f6dc60cfbb`),
program `PROJECT_MOMENTOUS` (`877dcf86-24a4-443f-95bd-28e24952bb80`).

Actor: `04bd0a7f-7487-4ba7-a751-a6540b3b4a33` (ryancblackwell@outlook.com,
Platform Admin + Commercial Admin). All three scenarios executed under an
authenticated preview session; the edge function verified JWT claims and
enforced `commercial.model.run` permission.

## 1. Execution matrix

| Scenario | Run ID | Model version | Scope | Status | Completed (UTC) | Input hash |
|---|---|---|---|---|---|---|
| CONSERVATIVE | `8faf610d-758a-4e57-be79-317efcd44e83` | PM-FIN-2026.1 | revenue | completed | 2026-07-25 15:56:36.281 | `2a297f6f71d49bc6381e3c64bfe471ca` |
| BASE         | `1c9576c5-f225-4a25-839b-52df904fa7a4` | PM-FIN-2026.1 | revenue | completed | 2026-07-25 15:56:36.824 | `e91075d4d3b50f712feb5ef9260b814e` |
| UPSIDE       | `a135e1d1-789e-4d06-8d09-9e901c9abee9` | PM-FIN-2026.1 | revenue | completed | 2026-07-25 15:56:37.058 | `744085fa5b30211cd10644a65be13757` |

Historical failed runs (pre-BP3.0.1 ACT_RAMP fix) remain in
`commercial_model_runs` for audit — 6 rows across the three scenarios, all
with `status='failed'`, `started_at IS NULL`. They are correctly excluded
from the current-run selector and surfaced only in the historical disclosure.

## 2. Persistence matrix

| Table | CONSERVATIVE | BASE | UPSIDE |
|---|---:|---:|---:|
| commercial_model_run_inputs   | 34 | 34 | 34 |
| commercial_model_results      | 126 | 126 | 126 |
| results missing lineage       | 0 | 0 | 0 |
| results missing formula_code  | 0 | 0 | 0 |

All rows tenant-scoped to `d6e1f4a0-ef31-433e-825e-c2f6dc60cfbb`, program
`877dcf86-24a4-443f-95bd-28e24952bb80`, model version `5097c3a9-021e-4b2c-9377-540a5d18ada6`.

## 3. Golden parity result

Comparison against `docs/commercial/bp3-golden-output-baseline.md`.

### BASE — key metrics

| Metric | Period | Engine | Golden | Δ |
|---|---|---:|---:|---:|
| VOL-CUM-ACT | FY2027..FY2031 | 30 / 55 / 75 / 90 / 100 | 30 / 55 / 75 / 90 / 100 | 0 |
| VOL-NEW-ACT | FY2027..FY2031 | 30 / 25 / 20 / 15 / 10 | 30 / 25 / 20 / 15 / 10 | 0 |
| REV-ACT-ARR | FY2027..FY2031 | 37.2M / 68.2M / 93.0M / 111.6M / 124.0M | identical | 0 |
| REV-01-BASE-REB | FY2027..FY2031 | 814k / 730k / 638k / 110k / 64k | identical | 0 |
| REV-10-MS | 5-yr total | 17,027,308.526 | 17,027,308.526 | 0 |
| REV-TOTAL | 5-yr total | 34,779,308.526 | 34,779,308.526 | 0 |

### 5-yr REV-TOTAL parity across scenarios

| Scenario | Engine | Golden | Δ |
|---|---:|---:|---:|
| CONSERVATIVE | 9,876,419.41125 | 9,876,419.41125 | 0 |
| BASE         | 34,779,308.526  | 34,779,308.526  | 0 |
| UPSIDE       | 80,328,983.262  | 80,328,983.262  | 0 |

Summary: **all in-scope VOL-* and REV-* metrics match the workbook cache to
0.00 absolute variance** (well inside the ±0.5 % tolerance for revenue lines
and exact-match tolerance for account counts). Out-of-scope metrics
(COD-*, OPEX-*, PNL-*, cash, sensitivity) are intentionally not produced by
BP3.2 and remain deferred to BP3.3+.

## 4. Lineage result

Every persisted row in `commercial_model_results` carries:

- `formula_code` (populated on 378/378 rows)
- `lineage_json` with `formula`, source workbook cell, input dependency
  bindings, model version, scenario, period, and `approximation` flag
  (`APX-01` on REV-06-GROWTH-SHARE rows, null elsewhere)

Rows missing lineage: **0**. Formula-code mismatches vs
`bp3-formula-catalog.md`: **0**.

## 5. Idempotency result

Second invocation of `Run all scenarios` (no assumption or version change)
returned:

```
{ runs: [
  { scenario: CONSERVATIVE, reused: true, run_id: 8faf610d… },
  { scenario: BASE,         reused: true, run_id: 1c9576c5… },
  { scenario: UPSIDE,       reused: true, run_id: a135e1d1… }
] }
```

Toast: **0 new · 3 reused**. No new rows written to `commercial_model_runs`,
`commercial_model_run_inputs`, or `commercial_model_results`. Input hashes
unchanged; completed run IDs unchanged. Deterministic reuse verified.

## 6. Security result

- Edge function verifies JWT via `supabase.auth.getClaims()` and requires the
  `commercial.model.run` permission mapped through `has_permission()`.
- Anonymous invocation returns `401 auth_required` (re-verified during
  BP3.2.1).
- Batch-persist RPC `commercial_model_run_persist_results_batch` — `anon_exec=false`, `public_exec=false`, `auth_exec=true` (SECURITY DEFINER, callable only through the edge function under the caller JWT).
- Immutability trigger blocks UPDATE/DELETE on completed runs (SQL harness §5).
- No `service_role` key exposed to browser; all writes go through edge function.
- Tenant isolation: results reachable only via RLS scoped by `tenant_id` = active tenant of caller.

## 7. UI result (`/commercial/model/revenue`)

- Scenario selector: CONSERVATIVE / BASE / UPSIDE — all three render the
  matching current run.
- Completed banner shows current run ID, completed timestamp, and input hash.
- Historical failure disclosure collapsed inside the success banner (no red
  blocker); expanding reveals prior ACT_RAMP failure record.
- Volume and Revenue tables populated for FY2027–FY2031 with 5-yr total column.
- Lineage popover on any row shows formula, cell reference, and input bindings.
- Directional-portfolio caveat banner visible.
- **Draft model banner visible** — expected. PM-FIN-2026.1 activation is
  deferred to BP3.8 per `docs/commercial/bp3-0-2-model-activation.md`.

## 8. Automated SQL harness

`supabase/tests/bp3_2_revenue_engine.sql` — 6 assertions (schema, seed count,
permission scope, unique index, immutability, metric-group whitelist).
Re-executed post-runs; all assertions pass. Metric-group census confirms
only `volume`, `revenue_base`, `revenue_stream`, `revenue_total` populated.

## 9. Remaining issues

- **Draft model warning** on `/commercial/model/revenue` — **Expected**,
  deferred to BP3.8 (governed activation workflow).
- Cost / OPEX / Gross-margin / EBITDA / Cash / Sensitivity metrics — out of
  BP3.2 scope; downstream views show placeholder alerts.
- Growth-share revenue uses workbook approximation APX-01 (Model 2 only) —
  documented; matches golden.

## 10. Known limitations

- Portfolio-level directional model; account-level ARR, contract terms, and
  crediting rules remain pending validation.
- Engine does not compute cost, OPEX, gross-margin, EBITDA, cash, or
  sensitivity outputs.
