# BP1.1E External Execution Guide

This guide tells a maintainer how to complete BP1.1E release evidence
**outside** the Lovable build sandbox. The Lovable agent cannot
dispatch GitHub Actions, stand up a disposable Postgres, or sign in as
multiple real personas — so a human maintainer with repository write
access and preview credentials must execute and return the evidence.

Do **not** change application code, database schema, migrations, tests,
workflows, edge functions, RLS policies, or dependencies while
executing this guide. If evidence execution reveals a defect, stop and
open a BP1.1D.1 remediation prompt.

---

## 1. Release-candidate identification

Record the following in `docs/bp1-1-test-evidence.md` **before**
executing any evidence:

- **Repository**: `<org>/<repo>`
- **Branch**: the release-candidate branch (typically `main` or a
  `release/bp1.1` branch).
- **Validated code SHA**: `git rev-parse HEAD` on the release branch,
  captured immediately before triggering CI.
- **Working-tree status**: `git status --porcelain` must be empty.
- **Execution date / operator**: ISO-8601 timestamp + reviewer name.

Later, when evidence documentation is committed, capture the
**evidence-documentation SHA** separately. Between the two SHAs there
must be **no** changes to `src/**`, `supabase/migrations/**`,
`supabase/functions/**`, `supabase/tests/**`, `.github/workflows/**`,
or `package.json` / `bun.lockb`.

## 2. Triggering the CI workflow

Workflow file: `.github/workflows/bp1-1-platform-foundation.yml`.

Trigger options:

- Push to `main`, or
- Open a pull request that touches `src/**`, `supabase/**`, or the
  BP1.1 docs, or
- Manually via **Actions → BP1.1 Platform Foundation → Run workflow**
  (`workflow_dispatch`) on the release-candidate branch.

Required outcomes:

**Job `app`** — every step exit 0, none skipped:

1. `actions/checkout@v4`
2. `oven-sh/setup-bun@v2`
3. `bun install --frozen-lockfile`
4. `bunx tsgo --noEmit || bunx tsc --noEmit`
5. `bun run lint`
6. `bun run test`
7. `bun run build`

**Job `database`** — every step exit 0, none skipped:

1. `supabase/setup-cli@v1`
2. Postgres service healthy.
3. Migration replay loop applies every `supabase/migrations/*.sql`
   in filename order with `ON_ERROR_STOP=1`.
4. `bp1_1a_regression.sql`
5. `bp1_1_platform_security.sql`
6. `bp1_1_tenant_isolation.sql`
7. `bp1_1_invitations.sql`
8. `bp1_1_last_admin.sql`

Capture and record:

- Workflow run URL (`https://github.com/<org>/<repo>/actions/runs/<id>`).
- Workflow run ID.
- Branch and commit SHA reported by the run.
- Start / completion timestamps.
- Application-job status and step outcomes.
- Database-job status and step outcomes.
- Any warnings or skipped steps.

If GitHub Actions cannot be triggered from your environment, mark
T-001/T-002 **Blocked** and record the reason (no permissions, org
policy, etc.). Do not simulate a run or invent a URL.

## 3. Preserving logs

For each of the five SQL suites, save the raw job log to
`docs/evidence/bp1-1/database/BP1.1E_<suite-name>_<YYYY-MM-DD>.log`.

For the application job save
`docs/evidence/bp1-1/ci/BP1.1E_app-job_<YYYY-MM-DD>.log`.

Logs may be trimmed to the specific step output but must preserve the
`RAISE NOTICE` / `RAISE EXCEPTION` lines and the final exit code
banner.

## 4. Security scan against the release candidate

Run the Supabase security scan **after** the release-candidate SHA is
deployed / merged so the scan reflects the same code that produced the
CI evidence.

Record in `docs/bp1-1-security-disposition.md` (append, do not
overwrite existing disposition history):

- Scan date/time.
- Supabase project reference (`esfpbiishpkvhlejnxzq`).
- Commit or deployment SHA scanned.
- Critical count (must be `0`).
- High count (must be `0`).
- Warning count.
- Informational count (if provided).
- For each retained warning: assert it matches the class, scope, and
  risk already dispositioned. If a warning is new or has changed
  scope, escalate — do not silently accept.

If any Critical or High finding is present, stop and mark the build
FAIL. Do not attempt to fix inside the evidence prompt; open a
BP1.1D.1 remediation prompt.

## 5. Persona preparation

You will need signed-in browser sessions for the personas defined in
`docs/bp1-1-ux-evidence-checklist.md`. Suggested preparation:

1. Seed the **P-ADMIN** platform administrator via the existing super-
   admin bootstrap.
2. As P-ADMIN, provision two tenants (**Tenant A** and **Tenant B**)
   using `CreateTenantDialog`.
3. Create **T-ADMIN-A** and **T-ADMIN-B** by inviting fresh accounts
   with the built-in Administrator role.
4. Create **T-MEMBER-A** by inviting a fresh account into Tenant A
   with the built-in Member role only.
5. Create **DENIED** by signing up a new approved user without
   creating a membership.
6. Create **INVITEE** by issuing an invitation to a new email; do not
   accept until UX-012.
7. For UX-013 create a second invitation and update `expires_at` in
   the Supabase console to a past timestamp. For UX-015 issue an
   invitation to `alice@...` and open it while signed in as
   `bob@...`.

Reuse fixture email addresses (e.g. `bp1.1e+admin@example.com`) so
screenshots can be captured without exposing real user identities.

## 6. Executing UX-001 – UX-025

Follow `docs/bp1-1-ux-evidence-checklist.md` item by item. For each
item:

1. Sign in as the required persona in an incognito/isolated browser
   profile.
2. Perform the listed actions on the release-candidate preview URL.
3. Capture a full-page screenshot.
4. Save the file as
   `docs/evidence/bp1-1/ux/UX-###_<persona>_<short-description>_<YYYY-MM-DD>.png`.
5. Record actual result, pass/fail/blocked, reviewer initials, and
   date in `docs/bp1-1-test-evidence.md`.

## 7. Screenshot and redaction requirements

- Naming convention: `UX-###_<persona>_<short-description>_<YYYY-MM-DD>.png`.
- Format: PNG, viewport ≥ 1280 px wide.
- Redact before saving: raw passwords, session tokens, invitation
  `token_hash`, service-role keys, third-party PII, and any audit
  payload key matching `password|token|secret|invitation`.
- Do not include browser DevTools windows unless the evidence
  explicitly requires network / storage inspection (UX-005).

## 8. Recording blocked or failed items

- **Blocked**: environment cannot execute the item (e.g. cannot mint
  a required persona). Record the exact missing capability.
- **Failed**: item executed but produced an incorrect result. Record
  the observed behavior, attach the screenshot, and open a BP1.1D.1
  remediation prompt. Do not patch inside this evidence pass.
- **Pass**: expected result achieved; screenshot and caption stored.

## 9. Evidence returned to Lovable

Commit the following back to the repository on the evidence-
documentation branch:

- Updated `docs/bp1-1-test-evidence.md` with the fields in §1 and §2.
- Updated `docs/bp1-1-security-disposition.md` with the §4 snapshot.
- `docs/evidence/bp1-1/ci/` job logs.
- `docs/evidence/bp1-1/database/` per-suite logs.
- `docs/evidence/bp1-1/security/` scan snapshot (JSON or Markdown
  summary).
- `docs/evidence/bp1-1/ux/` screenshots for UX-001 – UX-025.
- Updated `docs/bp1-1-release-checklist.md` with only the gates that
  are now proven complete.

## 10. When to run BP1.1E.VALIDATE

`BP1.1E.VALIDATE` may be run **only after**:

- Both CI jobs are green on the release-candidate SHA.
- All five SQL suites exit zero in the database job.
- Security scan reports 0 Critical / 0 High against the release-
  candidate SHA.
- All 25 UX evidence items are captured with pass results (or their
  blocked/failed status is documented and resolved).
- `.lovable/plan.md`, `docs/bp1-1-test-evidence.md`,
  `docs/bp1-1-security-disposition.md`, and
  `docs/bp1-1-release-checklist.md` all reflect the executed evidence.

Do not run `BP1.1E.VALIDATE` while any blocker remains open.
