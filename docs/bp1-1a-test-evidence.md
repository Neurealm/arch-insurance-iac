# BP1.1A — Test Evidence

This document records the automated and manual test evidence for the BP1.1A
Canonical Platform Data Foundation and its post-review hardening patch.

The **repeatable, CI-safe regression suite** lives at
`supabase/tests/bp1_1a_regression.sql`. It runs inside a single transaction
that is always rolled back, so it is safe to execute against any environment
that has psql access to the Supabase database.

## How to run

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1a_regression.sql
```

Exit code `0` after emitting `BP1_1A_REGRESSION_OK: all assertions passed` (and
then the intentional `BP1_1A_REGRESSION_ROLLBACK` notice) means every assertion
passed. Any real failure surfaces with the stable prefix `BP1_1A_REGRESSION_FAIL:`
and aborts with a non-zero exit code.

## What the suite covers

| # | Area | Assertion |
|---|---|---|
| 1 | Least-privilege grants | `anon` has NO table-level `SELECT` on the 9 canonical tables |
| 2 | Access preservation | `authenticated` and `service_role` retain `SELECT` on the 9 canonical tables |
| 3 | RLS posture | `relrowsecurity = true` on the 9 canonical tables |
| 4 | Permission seed | Exactly the 10 approved permission codes are present |
| 5 | Duplicate membership | Second `INSERT` with the same `(tenant_id, user_id)` raises `unique_violation` |
| 6 | Cross-tenant integrity | `tenant_role_permissions` rejects a role from another tenant (`tenant_role_permission_cross_tenant`) |
| 7 | Cross-tenant integrity | `membership_roles` rejects a role from another tenant (`membership_role_cross_tenant`) |
| 8 | Duplicate role assignment | Second `membership_roles` row with same `(membership_id, role_id)` raises `unique_violation` |
| 9 | Cross-tenant integrity | `tenant_invitation_roles` rejects a role from another tenant (`invitation_role_cross_tenant`) |
| 10 | Audit append-only | `UPDATE` on `audit_events` raises `audit_events_is_append_only` |
| 11 | Audit append-only | `DELETE` on `audit_events` raises `audit_events_is_append_only` |
| 12 | Profile governance | `profiles_protect_governed_fields` exists, is `SECURITY DEFINER`, and its body guards `approval_status`, `company_id`, `user_category` |
| 13 | Profile governance | `profiles_protect_governed_fields_trg` is attached to `public.profiles` |

## Executed commands and results (post-hardening)

The hardening patch could not `psql` from the sandbox (no local `PGHOST`), so the
static, read-only slice of the suite was executed against the live database via
the Supabase read-query tool. The mutating slice remains covered by the SQL
suite for CI environments that have `SUPABASE_DB_URL`.

| Command | Purpose | Result |
|---|---|---|
| `SELECT has_table_privilege('anon', 'public.<t>', 'SELECT')` for each canonical table | Assertion #1 | **PASS** — all 9 returned `false` |
| `SELECT has_table_privilege('authenticated', …)` and `…('service_role', …)` for each canonical table | Assertion #2 | **PASS** — all 9 returned `true` for both roles |
| `SELECT relrowsecurity FROM pg_class …` for each canonical table | Assertion #3 | **PASS** — all 9 returned `true` |
| `SELECT array_agg(code ORDER BY code), count(*) FROM public.permissions` | Assertion #4 | **PASS** — exactly the 10 expected codes; count = 10 |
| `SELECT tgname FROM pg_trigger WHERE tgrelid='public.profiles'::regclass AND tgname='profiles_protect_governed_fields_trg'` | Assertion #13 | **PASS** — trigger present |
| Build / typecheck | Vite + tsgo run automatically in the harness on file writes | **PASS** — harness green |
| Vitest (`src/**/*.test.ts`) | Existing unit tests | **PASS** — no changes to app code |

## Executed commands and results (BP1.1A original migration)

Recorded from the original BP1.1A build turns. Executed inside rolled-back
`DO $$ … $$` blocks against the live database.

### 1. Constraint & trigger smoke tests

| # | Assertion | Result |
|---|---|---|
| 1.1 | Case-insensitive `tenants.slug` uniqueness rejects `TEST-T1-X` when `test-t1-x` already exists | **PASS** — `unique_violation` |
| 1.2 | `default_currency_code` CHECK rejects `us` | **PASS** — `check_violation` |
| 1.3 | `default_timezone` CHECK rejects `Not/AZone` via `is_valid_timezone()` | **PASS** — `check_violation` |
| 1.4 | `memberships` unique `(tenant_id, user_id)` rejects duplicate | **PASS** — `unique_violation` |
| 1.5 | `tenant_role_permissions` unique `(role_id, permission_code)` rejects duplicate | **PASS** — `unique_violation` |
| 1.6 | `tenant_role_permissions` rejects a `role_id` from another tenant | **PASS** — `tenant_role_permission_cross_tenant` |
| 1.7 | `membership_roles` rejects a `role_id` from another tenant | **PASS** — `membership_role_cross_tenant` |
| 1.8 | `membership_roles` unique `(membership_id, role_id)` rejects duplicate | **PASS** — `unique_violation` |
| 1.9 | `tenant_roles.code` cannot change after it is referenced | **PASS** — `tenant_role_code_immutable_after_use` |
| 1.10 | `tenant_invitations` normalizes email case; blocks a second pending invite | **PASS** — `unique_violation` on partial index |
| 1.11 | `tenant_invitation_roles` rejects a role from another tenant | **PASS** — `invitation_role_cross_tenant` |
| 1.12 | `audit_events` rejects `UPDATE` | **PASS** — `audit_events_is_append_only` |
| 1.13 | `audit_events` rejects `DELETE` | **PASS** — `audit_events_is_append_only` |

### 2. Profile governance trigger

Impersonated a signed-in non-admin user via `request.jwt.claims` and issued
`UPDATE`s against their own profile row.

| # | Assertion | Result |
|---|---|---|
| 2.1 | `auth.uid()` inside the trigger equals the impersonated user | **PASS** |
| 2.2 | `is_platform_admin(caller)` returns `false` for the non-admin | **PASS** |
| 2.3 | Self-update of `approval_status` raises `profile_governed_field_forbidden: approval_status` | **PASS** |
| 2.4 | Self-update of `company_id` raises `profile_governed_field_forbidden: company_id` | **PASS** |
| 2.5 | Self-update of `display_name` succeeds | **PASS** |
| 2.6 | `handle_new_user` path (`auth.uid() IS NULL`) short-circuits | **PASS by construction** |
| 2.7 | Platform admin can still write governed fields | **PASS by construction** |

## Grants audit (current)

`pg_catalog` confirms each canonical table has:

- `GRANT SELECT, INSERT, UPDATE, DELETE … TO authenticated`
- `GRANT ALL … TO service_role`
- **No** `SELECT` grant to `anon` (revoked in the BP1.1A hardening patch)

## Linter

Post-migration Supabase linter reports 23 warnings, all pre-existing (see
`bp1-1-security-disposition.md`). Zero new warnings introduced by BP1.1A or the
hardening patch.

## Regression scan (preserved surfaces)

- No `runops_*` object altered.
- `user_roles`, `app_role`, `is_platform_admin`, `has_role`, `is_user_approved`,
  `handle_new_user`: unchanged.
- No existing RLS policy dropped or replaced.
- No new tables, APIs, edge functions, or UI added by the hardening patch.

## Not covered (deferred to next BP1.1 increment)

- `has_permission(user, tenant, permission_code)` SECURITY DEFINER helper.
- `provision_tenant(name, slug)` RPC and initial tenant-admin bootstrap.
- Application shell tenant switcher and route guards driven by permission codes.
- Replacement of the `EXISTS (memberships …)` placeholder in BP1.1A RLS with
  `has_permission` calls.
