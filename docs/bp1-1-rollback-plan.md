# BP1.1 Rollback Plan

## Principle

BP1.1 migrations are **additive and forward-only**. Destructive rollback
SQL risks governed data (tenants, memberships, audit history) and is not
provided.

## Frontend rollback (safe, immediate)

1. Open Lovable Edit History.
2. Select version tagged `pre-bp1.1-foundation`.
3. Click **Publish → Update**.

This reverts UI only; database schema stays in the new state. This is the
recommended first response to a UI regression.

## Backend forward-fix

If a database defect is observed:

1. Do not run `supabase db reset` or drop canonical tables.
2. Author a new migration that corrects the defect.
3. Run `./scripts/validate-bp1-1.sh` with `SUPABASE_DB_URL` pointing at a
   disposable DB.
4. Merge and let CI apply the migration.

## Reversibility matrix

| Migration category | Reversible? | Notes |
|---|---|---|
| `CREATE TABLE public.<canonical>` | No | Contains governed data once tenants exist. |
| `CREATE POLICY` / `ALTER POLICY` | Yes, via forward `DROP POLICY` migration | |
| `CREATE INDEX CONCURRENTLY` | Yes | `DROP INDEX CONCURRENTLY` in forward migration. |
| `CREATE OR REPLACE FUNCTION` | Yes | Re-apply prior body via forward migration. |
| `GRANT` / `REVOKE` | Yes | Restate the desired grant set. |
| `ALTER TABLE ... ADD COLUMN` (nullable) | Practically no | Drop only if column carries no data. |

## Escalation

- Sev-1 (cross-tenant leakage, auth outage): page platform on-call, run
  frontend rollback immediately, open incident channel.
- Sev-2 (single-tenant regression): forward-fix migration in same-day
  release window.
- Sev-3 (cosmetic / accessibility): normal release cadence.
