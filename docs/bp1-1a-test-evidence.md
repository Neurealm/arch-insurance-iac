# BP1.1A — Test Evidence

All tests below were executed against the live Supabase project immediately after the BP1.1A migration ran, in transactions that were rolled back (except the profile-governance test, which uses a diagnostic capture pattern and is reverted).

## 1. Constraint & trigger smoke tests (`DO $$ … $$` in a rolled-back transaction)

| # | Assertion | Result |
|---|---|---|
| 1.1 | Case-insensitive `tenants.slug` uniqueness rejects `TEST-T1-X` when `test-t1-x` already exists. | **PASS** — `unique_violation`. |
| 1.2 | `default_currency_code` CHECK rejects `us`. | **PASS** — `check_violation`. |
| 1.3 | `default_timezone` CHECK rejects `Not/AZone` via `is_valid_timezone()`. | **PASS** — `check_violation`. |
| 1.4 | `memberships` unique `(tenant_id, user_id)` rejects duplicate. | **PASS** — `unique_violation`. |
| 1.5 | `tenant_role_permissions` unique `(role_id, permission_code)` rejects duplicate. | **PASS** — `unique_violation`. |
| 1.6 | `tenant_role_permissions` rejects a `role_id` from another tenant (cross-tenant integrity trigger). | **PASS** — raise `tenant_role_permission_cross_tenant`. |
| 1.7 | `membership_roles` rejects a `role_id` from another tenant. | **PASS** — raise `membership_role_cross_tenant`. |
| 1.8 | `membership_roles` unique `(membership_id, role_id)` rejects duplicate. | **PASS** — `unique_violation`. |
| 1.9 | `tenant_roles.code` cannot change after it is referenced by any assignment/grant/invitation-role. | **PASS** — raise `tenant_role_code_immutable_after_use`. |
| 1.10 | `tenant_invitations` normalizes email case and blocks a second pending invitation for the same address. | **PASS** — `unique_violation` on partial index. |
| 1.11 | `tenant_invitation_roles` rejects a role from another tenant. | **PASS** — raise `invitation_role_cross_tenant`. |
| 1.12 | `audit_events` rejects `UPDATE`. | **PASS** — raise `audit_events_is_append_only`. |
| 1.13 | `audit_events` rejects `DELETE`. | **PASS** — raise `audit_events_is_append_only`. |

Transaction closed with `RAISE EXCEPTION 'ROLLBACK_TEST_TX'`; no rows persisted.

## 2. Profile governance trigger (`profiles_protect_governed_fields_trg`)

Impersonated a signed-in non-admin user by setting `request.jwt.claims` and issuing UPDATEs on their own profile row.

| # | Assertion | Result |
|---|---|---|
| 2.1 | `auth.uid()` inside the trigger equals the impersonated user. | **PASS** — captured via diagnostic table. |
| 2.2 | `is_platform_admin(caller)` returns `false` for the non-admin. | **PASS**. |
| 2.3 | Self-update of `approval_status` to a **different** value raises `profile_governed_field_forbidden: approval_status`. | **PASS**. |
| 2.4 | Self-update of `company_id` raises `profile_governed_field_forbidden: company_id`. | **PASS**. |
| 2.5 | Self-update of a personal field (`display_name`) succeeds. | **PASS**. |
| 2.6 | `handle_new_user` path (`auth.uid() IS NULL`) short-circuits — no false positives during signup. | **PASS by construction** (explicit `RETURN NEW` when `v_caller IS NULL`). |
| 2.7 | Platform admin can still write governed fields. | **PASS by construction** (`is_platform_admin` short-circuit). |

Diagnostic table used to capture in-trigger observations was dropped and the trigger function restored to its clean version.

## 3. Grants audit

`pg_catalog` inspection confirmed each new table has `GRANT SELECT, INSERT, UPDATE, DELETE … TO authenticated` and `GRANT ALL … TO service_role`, with no grants to `anon`.

## 4. Linter

Post-migration Supabase linter reports 23 warnings, all pre-existing (see `bp1-1-security-disposition.md`). Zero new warnings introduced by BP1.1A.

## 5. Preserved surfaces (regression scan)

- No `runops_*` object was altered (verified by diffing `pg_proc` / `pg_class` against the pre-migration baseline).
- `user_roles`, `app_role`, `is_platform_admin`, `has_role`, `is_user_approved`, `handle_new_user`: unchanged.
- No existing RLS policy was dropped or replaced.

## What is NOT yet covered

The following are intentionally deferred to the next BP1.1 increment and therefore not tested here:

- `has_permission(user, tenant, permission_code)` SECURITY DEFINER helper.
- `provision_tenant(name, slug)` RPC and initial tenant-admin bootstrap.
- Application shell tenant switcher and route guards driven by permission codes.
- Replacement of the `EXISTS (memberships …)` placeholder in BP1.1A RLS with `has_permission` calls.
