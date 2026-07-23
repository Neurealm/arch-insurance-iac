# BP1.1 Release Checklist

Use this checklist before promoting BP1.1 to production.

## Pre-flight

- [ ] Restore point pinned in Lovable Edit History (`pre-bp1.1-foundation`).
- [ ] Git commit / release tag recorded: `_______`.
- [ ] Latest migration filename recorded: `_______`.
- [ ] Required env vars present (`.env`): `VITE_SUPABASE_URL`,
      `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.
- [ ] Server-only secrets present in Edge Function Secrets (never in `.env`).
- [ ] Production Supabase database backup taken.

## CI gates (must be green)

- [ ] `app` job: typecheck, lint, unit tests, production build.
- [ ] `database` job: migration replay + BP1.1A / security / isolation /
      invitations / last-admin SQL regressions.

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
