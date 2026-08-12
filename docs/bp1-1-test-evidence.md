# BP1.1 Test Evidence

> **Status legend:** `[ ]` = not yet executed, `[x]` = executed and
> attached, `[BLOCKED]` = execution blocked (see notes), `[FAIL]` =
> executed and failed (see notes).
>
> Do not populate a field with fabricated values. Leave visible
> placeholders (`_pending_`) until real evidence is captured.

## Release-candidate provenance

| Field | Value |
|---|---|
| Repository | `_pending_` |
| Branch | `_pending_` |
| Validated code SHA | `_pending_` |
| Evidence documentation SHA | `_pending_` |
| Execution date (ISO-8601) | `_pending_` |
| Executed by | `_pending_` |

> Confirm no changes to `src/**`, `supabase/migrations/**`,
> `supabase/functions/**`, `supabase/tests/**`,
> `.github/workflows/**`, `package.json`, or `bun.lockb` occurred
> between validated code SHA and evidence documentation SHA.

## GitHub Actions execution

| Field | Value |
|---|---|
| Workflow file | `.github/workflows/bp1-1-platform-foundation.yml` |
| Workflow run URL | `_pending_` |
| Workflow run ID | `_pending_` |
| Started at | `_pending_` |
| Completed at | `_pending_` |
| Application job result | `[ ]` `_pending_` |
| Database job result | `[ ]` `_pending_` |

### Application job step matrix

| Step | Result |
|---|---|
| Dependency install (`bun install --frozen-lockfile`) | `[ ]` |
| Type check (`tsgo --noEmit` / `tsc --noEmit`) | `[ ]` |
| Lint (`bun run lint`) | `[ ]` |
| Vitest (`bun run test`) | `[ ]` |
| Production build (`bun run build`) | `[ ]` |

### Database job — migration replay

| Field | Value |
|---|---|
| Postgres image | `supabase/postgres:15.6.1.115` |
| Migration count | `_pending_` |
| Migrations replayed in filename order | `[ ]` |
| Any migration failure | `_pending_` |

## SQL suite matrix

| Suite | File | Runner | Exit code | Log |
|---|---|---|---|---|
| BP1.1A regression | `supabase/tests/bp1_1a_regression.sql` | `psql` | `_pending_` | `docs/evidence/bp1-1/database/BP1.1E_bp1_1a_regression_<date>.log` |
| Platform security | `supabase/tests/bp1_1_platform_security.sql` | `psql` | `_pending_` | `docs/evidence/bp1-1/database/BP1.1E_bp1_1_platform_security_<date>.log` |
| Tenant isolation | `supabase/tests/bp1_1_tenant_isolation.sql` | `psql` | `_pending_` | `docs/evidence/bp1-1/database/BP1.1E_bp1_1_tenant_isolation_<date>.log` |
| Invitations | `supabase/tests/bp1_1_invitations.sql` | `psql` | `_pending_` | `docs/evidence/bp1-1/database/BP1.1E_bp1_1_invitations_<date>.log` |
| Last-administrator | `supabase/tests/bp1_1_last_admin.sql` | `psql` | `_pending_` | `docs/evidence/bp1-1/database/BP1.1E_bp1_1_last_admin_<date>.log` |

## Security scan result

| Field | Value |
|---|---|
| Scan date/time | `_pending_` |
| Supabase project ref | `esfpbiishpkvhlejnxzq` |
| Commit/deployment SHA scanned | `_pending_` |
| Critical count | `_pending_` (must be `0`) |
| High count | `_pending_` (must be `0`) |
| Warning count | `_pending_` |
| Informational count | `_pending_` |
| Retained warnings match `docs/bp1-1-security-disposition.md` | `[ ]` |
| Snapshot log | `docs/evidence/bp1-1/security/BP1.1E_security-scan_<date>.md` |

## UX evidence summary

| Metric | Count |
|---|---|
| Total items | 25 |
| Passed | `0` |
| Failed | `0` |
| Blocked | `25` |

## UX evidence index

Reference: `docs/bp1-1-ux-evidence-checklist.md` (UX-001 – UX-025).

| ID | Persona | Status | Evidence file | Reviewer | Date |
|---|---|---|---|---|---|
| UX-001 | P-ADMIN | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-002 | P-ADMIN | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-003 | P-ADMIN | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-004 | P-ADMIN | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-005 | P-ADMIN | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-006 | T-MEMBER-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-007 | P-ADMIN | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-008 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-009 | T-MEMBER-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-010 | DENIED | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-011 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-012 | INVITEE | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-013 | INVITEE | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-014 | INVITEE | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-015 | INVITEE | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-016 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-017 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-018 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-019 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-020 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-021 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-022 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-023 | T-ADMIN-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-024 | T-MEMBER-A | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |
| UX-025 | mixed | `[BLOCKED]` | `_pending_` | `_pending_` | `_pending_` |

## Automated suites (authored, pre-existing)

| Suite | Location | Runner |
|---|---|---|
| Vitest (unit + component) | `src/**/*.test.ts(x)` | `bun run test` |
| BP1.1A SQL regression | `supabase/tests/bp1_1a_regression.sql` | `psql` |
| Platform security | `supabase/tests/bp1_1_platform_security.sql` | `psql` |
| Tenant isolation | `supabase/tests/bp1_1_tenant_isolation.sql` | `psql` |
| Invitations | `supabase/tests/bp1_1_invitations.sql` | `psql` |
| Last-administrator | `supabase/tests/bp1_1_last_admin.sql` | `psql` |

Aggregate command: `./scripts/validate-bp1-1.sh` (typecheck, lint,
Vitest, build; SQL suites when `SUPABASE_DB_URL` is set).

CI: `.github/workflows/bp1-1-platform-foundation.yml` runs the app job
plus a database job with a disposable Supabase Postgres service
container.

## Coverage matrix (high level)

- Authentication & grants: platform security suite (`anon` grants,
  SECURITY DEFINER search_path, audit trigger).
- Tenant isolation: tenant-isolation suite (RLS enabled, cross-tenant
  triggers reject bad foreign keys).
- Invitation lifecycle: invitations suite (normalized email, token
  hash uniqueness).
- Last-administrator safeguard: last-admin suite (pending invites
  don't count; suspending drops the count).
- Platform UI states: `src/platform/components/States.test.tsx`.

## Open failures

None recorded yet.

## Open blockers

- **B1** Disposable-DB migration replay + SQL suite execution.
- **B2** First green CI run of `bp1-1-platform-foundation.yml`.
- **B3** Post-merge security scan tied to release-candidate SHA.
- **B4** 25 persona-driven UX evidence items.
- **B5** Release-candidate branch + commit SHA not yet recorded.

## Independent validation decision

`_pending_` — do not stamp until every evidence field above is
populated with real values and all blockers are cleared.

## Evidence integrity statement

By committing this document with populated values, the reviewer
attests that every value above reflects work actually executed
against the release-candidate code SHA. No value has been inferred,
fabricated, or copied from a prior release cycle.
