# BP2.1 Commercial Foundation — Test Evidence

Status: Authored. Independent execution required (see BP1.1 external-execution guide for how to run the SQL regression suite against a disposable Postgres).

## Artifact

- `supabase/tests/bp2_1_commercial_foundation.sql`

## Coverage

| # | Assertion | Mechanism |
|---|---|---|
| 1 | Seven `commercial_*` tables exist | `information_schema.tables` count == 7 |
| 2 | RLS enabled on each | `pg_class.relrowsecurity` count == 7 |
| 3 | `anon` has zero table privileges | `information_schema.role_table_grants` count == 0 |
| 4 | Seven `commercial.*` permissions exist | `public.permissions` count == 7 |
| 5 | Cross-tenant read denied | Viewer in tenant A cannot see program in tenant B |
| 6 | Cross-tenant write denied | Admin in tenant A cannot insert into tenant B (RLS `WITH CHECK` rejects) |
| 7 | Cross-tenant relationship denied | `stage_gates` insert with parent in another tenant is rejected by `commercial_cross_tenant_*` trigger |
| 8 | Same-tenant insert succeeds | Scenario + source inserts succeed under privileged fixture |
| 9 | Viewer cannot mutate | Viewer role with only `commercial.view` cannot insert |
| 10 | No Commercial business rows are seeded | Entire suite runs in a single rolled-back transaction |

## Execution instructions

```bash
export SUPABASE_DB_URL="postgres://…"   # disposable branch or local
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp2_1_commercial_foundation.sql
```

Expected final notice:

```
NOTICE:  bp2_1: all 10 assertions passed
ROLLBACK
```

## Execution result

Not yet executed in an independent environment. To be recorded by BP2.1.VALIDATE.
