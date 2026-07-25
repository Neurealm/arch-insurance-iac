# BP3.3 P&L Engine — Runtime Test Evidence

**Status:** ✅ Executed, parity-verified, idempotent
**Executed by:** ryancblackwell@outlook.com (04bd0a7f-7487-4ba7-a751-a6540b3b4a33)
**Model version:** 5097c3a9-021e-4b2c-9377-540a5d18ada6 (PM-FIN-2026.1, draft)
**Program:** 877dcf86-24a4-443f-95bd-28e24952bb80 (Project Momentous)
**Tenant:** d6e1f4a0-ef31-433e-825e-c2f6dc60cfbb (neugain-commercial)

## Run manifest (run_scope = pnl)

| Scenario | Scenario ID | Run ID | Input hash | Status | Completed |
|---|---|---|---|---|---|
| CONS | 8298f1d7-4045-471f-b842-c6357c5eeb12 | 54cc3b9d-9f1f-47b9-886b-23237d4d7cd3 | 4fc1aee99a466da9ec80e137eda9a27d | completed | 2026-07-25T16:48:14.234Z |
| BASE | 702bf181-f356-462b-88d9-1f27457703c0 | 862d95f4-ce7c-457f-a5e8-13cc13c246a0 | c20c11840ca13cd25b034d11db0ec5c0 | completed | 2026-07-25T16:48:14.721Z |
| UPSIDE | 7927a437-714a-427c-82fa-0e571132ee9d | c473055c-502f-448c-9723-ac6781598ee6 | cadc52035955eecd2a7c8819323de6e3 | completed | 2026-07-25T16:48:15.121Z |

Each run: 151 immutable metrics · 149 snapshotted inputs · 100% lineage coverage.

## Golden parity — Base FY2027 anchors

| Metric | Runtime | Golden | Variance |
|---|---|---|---|
| Revenue | $5,210,000 | $5,210,000 | 0.00 |
| Cost of Delivery | $1,380,000 | $1,380,000 | 0.00 |
| Gross Profit | $3,830,000 | $3,830,000 | 0.00 |
| OPEX | $1,050,000 | $1,050,000 | 0.00 |
| EBITDA | $2,780,000 | $2,780,000 | 0.00 |

5-year totals (CONS / BASE / UPSIDE) match golden baseline to the cent.

## Idempotency evidence

Second invocation of "Run P&L (all scenarios)" at 2026-07-25T16:49Z:
- New runs created: **0**
- Existing runs reused: **3** (same run IDs, same input hashes)
- `commercial_model_runs` count for run_scope='pnl' remains **3** (1 per scenario).

Result: Deterministic input-hash reuse works as designed.

## Decision

BP3.3 EXECUTE: **GO** — ready for BP3.3.VALIDATE.
