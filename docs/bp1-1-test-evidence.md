# BP1.1 Test Evidence

## Automated suites

| Suite | Location | Runner |
|---|---|---|
| Vitest (unit + component) | `src/**/*.test.ts(x)` | `bun run test` |
| BP1.1A SQL regression | `supabase/tests/bp1_1a_regression.sql` | `psql` |
| Platform security | `supabase/tests/bp1_1_platform_security.sql` | `psql` |
| Tenant isolation | `supabase/tests/bp1_1_tenant_isolation.sql` | `psql` |
| Invitations | `supabase/tests/bp1_1_invitations.sql` | `psql` |
| Last-administrator | `supabase/tests/bp1_1_last_admin.sql` | `psql` |

## Aggregate command

`./scripts/validate-bp1-1.sh` runs typecheck, lint, Vitest, production
build, and (when `SUPABASE_DB_URL` is set) every SQL regression in order.

## CI

`.github/workflows/bp1-1-platform-foundation.yml` runs the app job on
every PR touching `src/**`, `supabase/**`, or BP1.1 docs, plus a
`database` job that applies migrations to a disposable Supabase Postgres
service container and runs the SQL regression suite.

## Coverage matrix (high level)

- Authentication & grants: platform security suite (`anon` grants,
  SECURITY DEFINER search_path, audit trigger).
- Tenant isolation: tenant-isolation suite (RLS enabled, cross-tenant
  triggers reject bad foreign keys).
- Invitation lifecycle: invitations suite (normalized email, token hash
  uniqueness).
- Last-administrator safeguard: last-admin suite (pending invites don't
  count; suspending drops the count).
- Platform UI states: `src/platform/components/States.test.tsx`.

## Blocked / limitations

- Full end-to-end browser flow (Playwright) — deferred (TD-05).
- Automated a11y (axe-core) — deferred (TD-04).
- Live CI evidence — awaiting first workflow run in the target repo.
