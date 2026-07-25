# BP3.2 — Test Evidence

## Automated

- `supabase/tests/bp3_2_revenue_engine.sql` — 6 assertions (schema, seed count, permission scope, unique index, run parity, immutability, metric-group whitelist).

## Manual verification checklist

1. Sign in as a Commercial admin, open `/commercial/model/revenue`.
2. Click **Run all scenarios** → toast should report 3 new runs the first time, then 3 reused (idempotent) if clicked again with no input changes.
3. Switch scenario selector between CONSERVATIVE / BASE / UPSIDE — table should re-render with the latest completed run per scenario.
4. Open any row's info popover — lineage JSON must contain the source formula, input values, and (for REV-06) the `approximation: "APX-01"` flag.
5. Attempt to hit the edge function unauthenticated — must return `401 auth_required`.
6. Run `supabase/tests/bp3_2_revenue_engine.sql` and confirm:
   - 11 constants per scenario
   - `anon_exec=false` on the batch-persist RPC
   - Only `volume` / `revenue_base` / `revenue_stream` / `revenue_total` metric groups populated
   - Immutability guard blocks any UPDATE on a completed run

## Golden parity — BASE FY27

| Metric | Expected | Tolerance |
|---|---:|---:|
| VOL-CUM-ACT | 30 | 0 (integer) |
| VOL-NEW-ACT | 30 | 0 |
| REV-ACT-ARR | $37,200,000 | ±0.1% |
| REV-01-BASE-REB | $814,000 | ±0.5% |
| REV-TOTAL | ≈ $4.9M | ±0.5% |

## Known limitations

- Cost of delivery, OPEX, gross-margin, EBITDA, cash, and sensitivity are NOT computed by this engine — attempting to display them in downstream pages will show placeholder alerts.
- Growth-share revenue uses Model 2 only (workbook approximation APX-01).
