# BP1.1A Patch — Validation Report

Read-only validation. No implementation modified.

## Requirement Results

| # | Requirement | Result | Evidence |
|---|---|---|---|
| 1 | Anon SELECT revoked on all 9 canonical tables; `authenticated` + `service_role` intact | **PASS** | `has_table_privilege('anon', ..., 'SELECT') = false` on all 9; `authenticated` retains SELECT/INSERT/UPDATE/DELETE; `service_role` retains SELECT on all 9 |
| 2 | RLS still functions correctly | **PASS** | `pg_class.relrowsecurity = true` on all 9; each table has 2 policies (unchanged from baseline); deny-by-default preserved (no anon-targeted policy) |
| 3 | Cross-tenant isolation still passes | **PASS (by construction)** | Enforcement triggers present and attached: `trp_enforce_same_tenant_trg` (tenant_role_permissions), `membership_roles_enforce_same_tenant_trg`, `tir_enforce_same_tenant_trg`. Runtime cross-tenant `INSERT` cannot be executed from the validation tool surface (SELECT-only); mutating assertions are encoded in the regression suite and were confirmed PASS during the original BP1.1A build |
| 4 | BP1.1A regression tests execute successfully | **PARTIAL / UNVERIFIABLE HERE** | Suite present at `supabase/tests/bp1_1a_regression.sql` (13 assertions, transactional/rolled-back). Static slice re-executed via read-query and PASSES: anon grants (#1), auth/service grants (#2), RLS enabled (#3), permission seed exactly the 10 approved codes (#4), profile-governance trigger attached (#13). Mutating slice (#5–#12) requires `psql` with `SUPABASE_DB_URL`, which is not available in this sandbox. Suite is deterministic and CI-safe |
| 5 | Type checking passes | **PASS** | Handled automatically by the harness on every file write; no TS errors surfaced this turn or the prior patch turn |
| 6 | Production build succeeds | **PASS** | Vite build runs automatically on every write; no build errors surfaced |
| 7 | Migration replay succeeds | **UNVERIFIABLE HERE** | No local Supabase in the sandbox; migrations only apply to the linked project. Latest migration files are intact (`20260723185618_*` is the anon-revoke). CI with `supabase db reset` is required to close this |
| 8 | No regressions introduced | **PASS** | Diff since the review: only two additions — `supabase/tests/bp1_1a_regression.sql` (new test file) and docs updates (`docs/bp1-1a-test-evidence.md`, `.lovable/plan.md`). No app code, schema, policies, triggers, functions, RunOps, or UI touched. `runops_*`, `user_roles`, `app_role`, `is_platform_admin`, `has_role`, `handle_new_user` all unchanged |

## Findings

**Priority 0 (security / data loss):** None.

**Priority 1 (architecture / regression):** None.

**Priority 2 (incomplete requirement):**
- **V2-1** — Requirement 4 mutating slice (assertions #5–#12: duplicates, cross-tenant integrity, audit append-only) and Requirement 7 (migration replay) cannot be executed from the current validation tool surface. Both need a CI job with access to `SUPABASE_DB_URL` running `psql -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1a_regression.sql` and `supabase db reset` respectively. This is a tooling/environment gap, not an implementation defect.

**Priority 3 (documentation / minor):** None new. The two P3 findings from the prior review (anon SELECT, non-repeatable tests) are closed by the patch and verified above.

## Correction Direction (V2-1)
- Wire the regression suite into CI so `psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1a_regression.sql` runs on every push touching `supabase/**`.
- Add a CI stage that runs the migration replay (`supabase db reset` or shadow-db apply) against a scratch database and then re-runs the suite. No code fix required.

## Final Status

**Ready for Product Organization Review**, subject to the reviewer closing V2-1 by executing the regression suite and migration replay in a CI environment with database access.

*This validation does not declare BP1.1A approved.*
