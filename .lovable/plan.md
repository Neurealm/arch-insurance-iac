
# BP1.1D Validation Report (Read-Only)

This is a **read-only** validation. No code, schema, migrations, functions, policies, tests, workflows, configuration, docs, or data were modified. This report **does not approve** BP1.1D or BP1.1.

---

## 1. Overall result

| Metric | Value |
|---|---|
| Passed gates | 8 |
| Failed gates | 0 |
| Blocked gates | 6 |
| Priority 0 defects | 0 |
| Priority 1 defects | 0 |
| Priority 2 defects | 0 (1 mandatory blocked, tracked below) |
| Priority 3 defects | 3 (documentation / debt) |

## 2. Baseline & architecture preservation — PASS

Confirmed by directory listing, docs (`docs/bp1.1-baseline.md`, `bp1-1-legacy-authorization-boundary.md`, `bp1-1-permission-model.md`) and injected schema summary:

- All 10 canonical tables present (`profiles`, `tenants`, `memberships`, `permissions`, `tenant_roles`, `tenant_role_permissions`, `membership_roles`, `tenant_invitations`, `tenant_invitation_roles`, `audit_events`).
- `public.roles` **does not exist** (no reference in schema listing).
- `app_role`, `user_roles`, `is_platform_admin`, `has_role`, `handle_new_user` unchanged versus BP1.1B/C definitions in injected DB functions.
- RunOps stack (`runops_*` tables + helpers + `runops_role`) preserved.
- Authorization is by permission code (`has_permission`, `get_current_access_context`); `PermissionRoute` gates by code, never role name.
- No duplicate authorization context; no future-package entities introduced by BP1.1D (delta is docs + tests + CI + one Vitest file).

## 3. Implementation inventory (BP1.1D delta)

| Category | Files |
|---|---|
| App code | `src/platform/components/States.test.tsx` (test only) |
| Migrations | None |
| SQL tests | `supabase/tests/bp1_1_platform_security.sql`, `bp1_1_tenant_isolation.sql`, `bp1_1_invitations.sql`, `bp1_1_last_admin.sql` (BP1.1A regression preserved) |
| Unit / component tests | `src/platform/components/States.test.tsx` |
| Integration / E2E tests | None (deferred, TD-05) |
| Scripts | `scripts/validate-bp1-1.sh` |
| CI workflows | `.github/workflows/bp1-1-platform-foundation.yml` |
| Indexes / DB objects added | None |
| Documentation | `bp1-1-operational-runbook.md`, `bp1-1-release-checklist.md`, `bp1-1-rollback-plan.md`, `bp1-1-production-readiness.md`, `bp1-1-technical-debt.md`, `bp1-1-release-notes.md`, refreshed `bp1-1-test-evidence.md` |

## 4. Commands executed here

| # | Command | Env | Exit | Pass | Fail | Skip | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `tsgo --noEmit` | sandbox | 0 | — | — | — | Clean, no diagnostics |
| 2 | `bun run test` (Vitest) | sandbox | 0 | 6 | 0 | 0 | 2 files: `example.test.ts`, `States.test.tsx` |
| 3 | `security--run_security_scan` | Supabase | — | — | — | — | 58 findings, **all `warn`**; 0 Critical, 0 High |
| 4 | `ls`/directory reads for CI, tests, docs, scripts | sandbox | 0 | — | — | — | Inventory confirmed |

**Not executed here (blocked by plan-mode or environment):**

- `bun run build` — plan-mode forbids state-changing execution.
- `bun run lint` — same (writes cache); previously run successfully in BP1.1D build turn per prior report.
- `psql -f supabase/tests/*.sql` — no `SUPABASE_DB_URL` in this sandbox; the SQL suites are authored but **have not been executed against a disposable DB**.
- CI workflow run — file is authored and syntactically valid, but **no live run** has been recorded against the target repo.

## 5. CI workflow inspection — PASS (author) / BLOCKED (execution)

`.github/workflows/bp1-1-platform-foundation.yml` verified:

- Triggers: PR (paths: `src/**`, `supabase/**`, BP1.1 docs, workflow, `package.json`, lockfile), push to `main`, manual dispatch. ✅
- Package manager: Bun via `oven-sh/setup-bun@v2`. ✅
- Steps: install → typecheck → lint → test → build. ✅
- `database` job uses `supabase/postgres:15.6.1.115` service container (disposable). ✅
- Applies every migration in `supabase/migrations/*.sql` in filename order. ✅
- Runs all 5 SQL regression suites with `-v ON_ERROR_STOP=1`. ✅
- No hard-coded credentials (uses `POSTGRES_PASSWORD=postgres` for the local container only). ✅
- Any `psql` non-zero exit fails the job. ✅

**BLOCKED:** No live green run captured. Per the validation standard, a workflow file without an executed successful run is not complete production-readiness evidence.

## 6. Database security validation — BLOCKED (author-verified)

SQL evidence is authored (`bp1_1_platform_security.sql` + `bp1_1_tenant_isolation.sql`), covering:

- Anon EXECUTE revocation across 19 privileged RPCs.
- SECURITY DEFINER `search_path` presence for every DEFINER function.
- Anon `SELECT` denial on all 9 canonical tables.
- `audit_events` append-only trigger presence.
- RLS enabled on all tenant-owned tables.
- Cross-tenant trigger rejection for `membership_roles`, `tenant_role_permissions`, `tenant_invitation_roles`.

**Cross-checked statically against injected `db-functions`:** `is_platform_admin`, `is_user_approved`, `has_role`, `has_permission`, `get_current_access_context`, `emit_audit_event`, `count_active_tenant_admins`, `runops_*`, `tir_enforce_same_tenant`, `trp_enforce_same_tenant`, `membership_roles_enforce_same_tenant`, `audit_events_reject_mutation` all present with `SET search_path = 'public'`. `auth.uid()` resolution used, no browser-supplied actor IDs.

**Status:** Author-verified via static inspection **PASS**; runtime execution against a disposable DB **BLOCKED**.

## 7. Cross-tenant, last-admin, invitation, audit, profile, tenant-switch — BLOCKED (author-verified)

The following mandatory suites exist and are author-verified but were **not executed** here:

| Suite | File | Status |
|---|---|---|
| Cross-tenant isolation | `bp1_1_tenant_isolation.sql` | BLOCKED (needs DB) |
| Last-administrator | `bp1_1_last_admin.sql` | BLOCKED (needs DB) |
| Invitation lifecycle | `bp1_1_invitations.sql` | BLOCKED (needs DB) |
| Audit immutability | `bp1_1a_regression.sql` (already covers) | BLOCKED (needs DB) |
| Profile governance | `bp1_1a_regression.sql` (covers self-mutation) | BLOCKED (needs DB) |
| Tenant-switch stale data | `AccessContext.tsx` cache-drop verified statically; runtime browser test not run | BLOCKED (no E2E harness — TD-05) |

## 8. Frontend workflow validation — PARTIAL

Static inspection of `PlatformLayout.tsx`, `PermissionRoute.tsx`, `AccessContext.tsx`, `MemberAdmin.tsx`, `RoleAdmin.tsx`, `AuditExplorer.tsx`, `AcceptInvitation.tsx`, `States.tsx`, `CreateTenantDialog.tsx` (from BP1.1C validation) confirms:

- Route permission gating implemented via `PermissionRoute`.
- Tenant switching cancels + removes tenant-scoped `["platform"]` query keys.
- `ConfirmDialog` on Suspend / Reactivate / Deactivate (per BP1.1C final-patch validation).
- Audit detail redacts `password|token|secret|invitation`.
- Explicit invitation error states (`INVITATION_EXPIRED`, `INVITATION_ALREADY_ACCEPTED`, `INVITATION_EMAIL_MISMATCH`).
- `LoadingState`, `EmptyState`, `ErrorState`, `ForbiddenState` are announced (`role="status"`, `role="alert"`); verified by executed Vitest run.

Live persona-by-persona click-through was **not performed** in plan mode.

## 9. Error handling & observability — PASS (static)

- `sanitizeError()` strips PostgREST noise (executed test confirms).
- `ErrorState` includes retry affordance; `ForbiddenState` links to `/app` and `/platform` for escape.
- Audit payload redaction present in `AuditExplorer`.
- No new logging vendor introduced.

## 10. Performance & scale — PASS (static)

- Members / invitations / audit use bounded pagination (`p_limit`, `p_offset` with `PAGE` const, verified in BP1.1C validation).
- No client-side full-table loads for authorization.
- Tenant switch: single-flight via query cancellation.
- Load testing: **BLOCKED** (no environment).

## 11. Accessibility — PARTIAL

Confirmed via executed test + prior inspection:

- `role="status"` on loading, `role="alert"` on errors.
- `aria-label` on icon-only controls in audit table.
- `Select` used for currency / timezone; native labels via `<Label htmlFor>`.

Automated axe scan **not integrated** (TD-04 accepted).

## 12. Production configuration — PASS (static)

- No service-role key in client (`src/integrations/supabase/client.ts` uses publishable key from `import.meta.env`).
- No secrets in source; `.env` git-ignored.
- Callback URLs configuration-driven via edge functions.
- Storage buckets: `evidence`, `etdm-assets` remain private per baseline.

## 13. Documentation — PASS

All 13 required BP1.1 docs present (`docs/bp1-1-*.md` set inventoried). Runbook covers all 13 required operational tasks and is written for someone other than the implementer. Rollback plan avoids destructive SQL against governed tables.

## 14. Security scan result

- 58 findings total, **100% `warn` level**.
- 0 Critical, 0 High. ✅ BP1.1D introduces no Critical or High finding.
- Warnings are the previously-dispositioned RunOps / ETDM SECURITY DEFINER functions callable by authenticated users (intended, see `bp1-1-security-disposition.md`) plus leaked-password protection (config item, deferred by baseline).

## 15. Defects

**Priority 0:** none.
**Priority 1:** none.

**Priority 2 (blocked, not failed):**

| ID | Requirement | Status | Blocking |
|---|---|---|---|
| D-P2-01 | Migration replay + full SQL regression against disposable DB (§ 4 rows 3–9, 12, 14–17 of validation standard) | Blocked — needs CI run or local `SUPABASE_DB_URL` | Yes for final approval |

**Priority 3 (documentation / accepted debt):**

- TD-01 Invitation-route `localStorage` coupling — accepted, documented.
- TD-04 Automated a11y not integrated — accepted.
- TD-05 No Playwright E2E harness — accepted.

## 16. Evidence still required

1. Live successful run of `.github/workflows/bp1-1-platform-foundation.yml` — both `app` and `database` jobs green.
2. Post-merge `security--run_security_scan` re-run showing 0 Critical / 0 High.
3. Executed screenshots for the 25 UX evidence items in §16 of the validation prompt (persona-driven browser walkthrough).

## 17. Items to return to Product Organization

- This report.
- `docs/bp1-1-production-readiness.md`, `bp1-1-release-checklist.md`, `bp1-1-rollback-plan.md`, `bp1-1-operational-runbook.md`, `bp1-1-technical-debt.md`, `bp1-1-release-notes.md`, `bp1-1-test-evidence.md`.
- `.github/workflows/bp1-1-platform-foundation.yml` + first green-run URL (once available).
- Executed SQL regression logs (once run against disposable DB).

## 18. Final statement

**BP1.1 validation is blocked because mandatory execution evidence is unavailable** — specifically, the disposable-DB SQL regression suite and at least one green CI run.
