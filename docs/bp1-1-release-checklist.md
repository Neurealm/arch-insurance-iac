# BP1.1 Release Checklist

Use this checklist before promoting BP1.1 to production. Do not check
a box until the underlying evidence exists in the repository.

## Pre-flight

- [ ] Restore point pinned in Lovable Edit History (`pre-bp1.1-foundation`).
- [ ] Git commit / release tag recorded: `_______`.
- [ ] Latest migration filename recorded: `_______`.
- [ ] Required env vars present (`.env`): `VITE_SUPABASE_URL`,
      `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.
- [ ] Server-only secrets present in Edge Function Secrets (never in `.env`).
- [ ] Production Supabase database backup taken.

## Release-candidate provenance

- [ ] Release-candidate branch recorded in `docs/bp1-1-test-evidence.md`.
- [ ] Release-candidate commit SHA recorded in `docs/bp1-1-test-evidence.md`.
- [ ] Working tree confirmed clean on release branch.

## CI evidence gates

- [ ] Application CI job green (install, typecheck, lint, Vitest, build).
- [ ] Database CI job green (migration replay + all five SQL suites).
- [ ] Workflow run URL and run ID recorded in `docs/bp1-1-test-evidence.md`.

## Database regression gates

- [ ] Migration replay complete against disposable Postgres.
- [ ] `bp1_1a_regression.sql` exit 0.
- [ ] `bp1_1_platform_security.sql` exit 0.
- [ ] `bp1_1_tenant_isolation.sql` exit 0.
- [ ] `bp1_1_invitations.sql` exit 0.
- [ ] `bp1_1_last_admin.sql` exit 0.

## Security gates

- [ ] Security scan executed against release-candidate SHA.
- [ ] Zero Critical findings.
- [ ] Zero High findings.
- [ ] Retained warnings reconciled against `docs/bp1-1-security-disposition.md`.

## UX evidence gates

- [ ] UX-001 through UX-025 executed per `docs/bp1-1-ux-evidence-checklist.md`.
- [ ] All screenshots stored under `docs/evidence/bp1-1/ux/` per naming convention.
- [ ] Evidence reviewed by a second maintainer.

## Independent validation

- [ ] BP1.1E independent validation GO decision recorded.

## Deployment sequence

1. Apply pending Supabase migrations in filename order (additive only).
2. Publish the frontend via Lovable **Publish → Update**.
3. Smoke tests below.

## Smoke tests (production)

- [ ] `/` loads.
- [ ] Sign-in works for a known platform admin.
- [ ] `/platform` loads with tenant selector populated.
- [ ] Create tenant → success + audit event.
- [ ] Invite member → resend → cancel.
- [ ] Suspend & reactivate a non-admin member (with confirmation).
- [ ] Tenant switch clears prior-tenant data.
- [ ] Audit filter + detail redaction.
- [ ] RunOps `/runops/*` routes still load.
- [ ] Any external questionnaire link still resolves.

## Rollback decision

Roll back when any of:

- Smoke test 1–4 fails.
- Cross-tenant leakage observed.
- Auth loop or permission storm affecting >1 tenant.

## Rollback steps

1. Frontend: Lovable Edit History → restore `pre-bp1.1-foundation` → Publish.
2. Backend: **do not destructively drop tables**. Author a forward-fix
   migration. If a specific migration is safely reversible, list it in
   `bp1-1-rollback-plan.md`.
3. Notify incident channel; open post-mortem.

## Post-deploy verification

- [ ] `audit_events` shows the expected `tenant.provisioned` / invite
      events from smoke tests.
- [ ] `count_active_tenant_admins()` ≥ 1 for every tenant.
- [ ] Security scan shows 0 Critical / 0 High.

## GA closure

- [ ] GA closure complete (`docs/bp1-1-release-notes.md` stamped GA
      only after every gate above is checked).
