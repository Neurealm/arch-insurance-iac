# NeuGAIN — Living Implementation Plan

_Last regenerated from repository state. Supersedes the prior BP1.1D validation report._

---

## 1. Executive Summary

NeuGAIN is a multi-tenant enterprise platform built on React 18 + Vite 5 + Tailwind v3 + shadcn/ui with a Supabase (Lovable Cloud) backend (project ref `esfpbiishpkvhlejnxzq`). It hosts several product modules on a shared platform foundation:

- **Platform Foundation (BP1.1 A–D)** — tenants, memberships, permissions, audit, invitations, admin UX.
- **RunOps Digital Twin** — services, runbooks, incidents, executions, scenarios (Contoso profile).
- **AVEP — AI VLSI Engineering Platform** — 21-route DDMAC descriptor-engine scenario spanning Plan → Build → Prove Readiness.
- **Digital Coworkers** — ITSM Auto Ticket Categorization dashboard + 15 sub-pages, Neurealm Agentic AI Studio (10 tabs), plus role-specific coworker pages.
- **Legacy modules** — ETDM, CRM, Questionnaires, Org taxonomy (still admin-gated, awaiting BP1.2 tenant scoping).

BP1.1 has been _built_ (packages A/B/C/D) and _security-remediated_ against recent findings; however, mandatory _execution evidence_ for BP1.1D (CI green run + disposable-DB SQL regression) is still outstanding. That is the immediate release blocker.

## 2. Current Build Status

| Area | Phase | Status |
|---|---|---|
| Platform Foundation BP1.1A (tables/audit/profile) | Shipped | ✅ |
| Platform Foundation BP1.1B (permissions, provision_tenant, memberships) | Shipped | ✅ |
| Platform Foundation BP1.1C + Final Patch (admin UX) | Shipped | ✅ |
| Platform Foundation BP1.1D (hardening artifacts) | Shipped | ✅ |
| BP1.1E — Release evidence & handoff | Not started | ⏳ Blocker |
| RunOps shell + Contoso profile + digital twins | Shipped | ✅ |
| RunOps `ConnectedOperationsProvider` (real integrations) | Planned | ⏸ |
| AVEP shell + 21 workspaces (DDMAC scenario) | Shipped | ✅ |
| AVEP scenario continuity pass | In progress | 🔄 |
| Digital Coworkers — ITSM ATC dashboard + 15 sub-pages | Shipped | ✅ |
| ITSM ATC sub-page data continuity | In progress | 🔄 |
| Neurealm Agentic AI Studio (10 tabs) | Shipped | ✅ |
| Integrations catalog (14 profiles + drawer) | Shipped | ✅ |
| User Management — profile edit + `sync_profile_company` | Shipped | ✅ |
| ETDM / CRM / Questionnaires — tenant scoping (BP1.2) | Planned | ⏸ |
| RunOps ↔ public tenant bridge | Planned | ⏸ |
| Playwright E2E harness | Planned | ⏸ |
| Automated a11y (axe-core) in CI | Planned | ⏸ |

## 3. Completed Work

### BP1.1A — Canonical Platform Data Foundation
- Canonical tables: `profiles`, `tenants`, `memberships`, `permissions`, `tenant_roles`, `tenant_role_permissions`, `membership_roles`, `tenant_invitations`, `tenant_invitation_roles`, `audit_events`.
- Explicit `GRANT`s in every migration; `anon` SELECT revoked on all 9 canonical tables.
- `audit_events` append-only trigger (`audit_events_reject_mutation`).
- Profile self-mutation governance (users can update self; admin fields restricted).
- Regression: `supabase/tests/bp1_1a_regression.sql`.

### BP1.1B — Tenant Authorization & Administrative Services
- Permission model with `has_permission(user, tenant, permission)` as sole authz oracle.
- Transactional `provision_tenant` RPC (creates tenant + admin membership + default roles atomically).
- Membership lifecycle helpers: invite, suspend, reactivate, deactivate, role assignment.
- Same-tenant enforcement triggers: `tir_enforce_same_tenant`, `trp_enforce_same_tenant`, `membership_roles_enforce_same_tenant`.
- `count_active_tenant_admins` for last-admin safeguards.
- All `SECURITY DEFINER` functions set `search_path = 'public'`; `anon` EXECUTE revoked on all 19 privileged RPCs.

### BP1.1C + Final Patch — Platform Experience
- `src/platform/access/AccessContext.tsx` — tenant switching with query cancellation + cache drop of `["platform"]` keys.
- `src/components/auth/PermissionRoute.tsx` — permission-code route gating (never role name).
- `src/platform/pages/`:
  - `PlatformHome.tsx`, `MemberAdmin.tsx`, `RoleAdmin.tsx`, `AuditExplorer.tsx`, `TenantSettings.tsx`, `Profile.tsx`, `AcceptInvitation.tsx`.
  - `MemberAdmin`: invite / suspend / reactivate / deactivate — all wrapped in `ConfirmDialog`; invitation pagination.
  - `AuditExplorer`: filters + explicit "View" button; payload redaction of `password|token|secret|invitation`.
  - `AcceptInvitation`: explicit error states (`INVITATION_EXPIRED`, `INVITATION_ALREADY_ACCEPTED`, `INVITATION_EMAIL_MISMATCH`).
- `src/platform/components/CreateTenantDialog.tsx` — curated `Select` for currency/timezone via `src/platform/data/tenantOptions.ts`.
- `src/platform/components/States.tsx` — `LoadingState`, `EmptyState`, `ErrorState`, `ForbiddenState` (a11y announced).

### BP1.1D — Production Hardening
- SQL regression suites: `bp1_1_platform_security.sql`, `bp1_1_tenant_isolation.sql`, `bp1_1_invitations.sql`, `bp1_1_last_admin.sql` (+ preserved `bp1_1a_regression.sql`).
- `scripts/validate-bp1-1.sh` aggregate runner.
- `.github/workflows/bp1-1-platform-foundation.yml` — app job (install/typecheck/lint/test/build) + database job (Supabase Postgres service, migration replay, all 5 SQL suites).
- `src/platform/components/States.test.tsx` — component tests (6 passing).
- Documentation set (see §14).

### Product Modules
- **RunOps**: `src/runops/shell/*`, `providers/`, `scenario/`, `profiles/contosoProfile.ts`, `pages/`. Service Digital Twin cross-links to `RB-HC-014` runbook.
- **AVEP** (`src/avep/`): shell + theme, `data/canonical.ts` DDMAC scenario, 21 pages including Overview, Program Workspace, Requirements Intake/Review, Traceability, Logical Architecture, Engineering Spec & Verification, RTL Generation Studio, RTL Change Impact, Verification Env Builder, Test Factory, Sim Ops, Waveform Intelligence & Failure Diagnosis, Coverage Closure, Signoff Readiness, Release Package, AI Governance, Physical-Design Intake, End-to-End Story.
- **ITSM ATC** (`src/pages/itsm/`): `Itsm.tsx` catalog card + `AutoTicketCategorization.tsx` dashboard + 15 sub-pages via `AtcShell`.
- **Neurealm Agentic AI Studio** (`src/pages/neurealm-agentic-ai/`): 10-tab module under Digital Coworkers.
- **Integrations** (`src/components/eoc/integrations/`): 14 profiles + technical `IntegrationDrawer.tsx`.
- **User Management** (`src/pages/settings/UserManagement.tsx`): profile cards + `EditProfileDialog` + `sync_profile_company` trigger.

### Security Remediations (recent findings)
- Public / anon `EXECUTE` revoked on `SECURITY DEFINER` functions.
- `user_login_events` INSERT restricted (spoofing fix).
- Public questionnaire respondent validation moved to edge functions (`public-questionnaire-*`).
- `is_platform_admin`, `is_user_approved`, `has_role` self-scoped unless caller is platform admin (`rls_helper_arbitrary_uid` fix).
- Stakeholder register PII scoping documented.
- Public bucket listing dispositioned.

## 4. In Progress Work

- **BP1.1D execution evidence** — CI + SQL regression not yet executed against disposable DB.
- **AVEP scenario continuity** — DDMAC scenario alignment across all 21 routes (`src/avep/data/canonical.ts`).
- **ITSM ATC sub-page continuity** — KPIs/lists across the 15 sub-pages aligned to parent dashboard.

## 5. Remaining Work

- **BP1.2** tenant-scoping migration for ETDM, CRM, Questionnaires, Questionnaire share-links (TD-07).
- Bridge `runops_tenants` ↔ `public.tenants` (TD-03).
- Externalize super-admin bootstrap roster from `handle_new_user` (TD-02).
- Playwright E2E harness (TD-05).
- Automated axe-core a11y in CI (TD-04).
- Local scratch-DB bootstrap script (TD-06).
- Remove `AcceptInvitation` `localStorage` coupling (TD-01).
- Retire or archive `src/silicon/**` (superseded by `src/avep/**`).
- AVEP Phase-4 Deliver module set.
- `ConnectedOperationsProvider` real integrations (SolarWinds, Cribl, PagerDuty, etc.).
- Master docs index.

## 6. Outstanding Technical Debt

Copied and extended from `docs/bp1-1-technical-debt.md`:

| ID | Item | Severity | Target |
|---|---|---|---|
| TD-01 | `AcceptInvitation` writes `platform:activeTenant` to localStorage before mounting `AccessProvider` | Low | BP1.2 |
| TD-02 | Super-admin bootstrap emails hard-coded in `handle_new_user` | Low | BP1.2 |
| TD-03 | `runops_tenants` not bridged to `public.tenants` | Medium | Post-BP1.1 |
| TD-04 | Automated a11y (axe-core) not wired into CI | Low | BP1.2 |
| TD-05 | No Playwright E2E harness | Low | BP1.2 |
| TD-06 | Migration replay only in CI; no local scratch DB script | Low | Post-BP1.1 |
| TD-07 | ETDM / CRM / questionnaire share-links remain admin-gated pending BP1.2 tenant scoping | Medium | BP1.2 |
| TD-08 | `.lovable/plan.md` previously used as a validation scratchpad — this rewrite establishes it as the living plan | Low | Now |
| TD-09 | `src/silicon/**` prototype superseded by `src/avep/**` — schedule archive/removal | Low | BP1.2 |
| TD-10 | No master docs index; many long-lived snapshots under `docs/meridian-*` and `docs/bp1-1-*` | Low | BP1.2 |

## 7. Architecture Decisions

- **Authorization**: permission-based via `has_permission(user, tenant, permission)`. Role-name checks (`is_platform_admin`, `has_role`, `runops_has_role`) are legacy and must not spread.
- **Role storage**: always in dedicated tables (`user_roles`, `tenant_roles`, `membership_roles`) — never on `profiles`/`users`. Never trust client-side/localStorage for role state.
- **Grants**: every `CREATE TABLE public.*` migration includes explicit `GRANT`s in the same migration.
- **Secrets**: anon key only in the browser; service-role only inside edge functions via `Deno.env`.
- **Multi-tenant boundary**: RunOps preserved as an independent sub-domain (own tenant table) until BP1.2 unification.
- **AVEP**: its own themed shell (`src/avep/theme/tokens.css`, `AvepLayout`) with independent navigation.
- **Providers pattern**: `OperationsProvider` and `AiProvider` with Demo/Connected variants; pages MUST NOT import fixtures directly.
- **No standalone Node/Python backend** — Supabase Postgres + Deno edge functions only.
- **Product neutrality**: named orgs (Contoso, Meridian, Neurealm, etc.) and verticals are tenant/module fixtures, not product-core logic.

## 8. Database Status

- ~100 tables in `public` (per injected schema summary): platform core, RunOps stack (`runops_*`), ETDM (`etdm_*`), CRM (`crm_*`), Questionnaires, Org taxonomy (`org_*`), user-notification, audit.
- RLS enabled on all tenant-owned tables; canonical BP1.1 tables have explicit GRANTs.
- Supabase linter / security scan: 58 warnings (all pre-dispositioned), 0 High, 0 Critical.
- Migrations managed exclusively via the migration tool (never edited manually).
- Storage buckets `evidence` and `etdm-assets` remain private per baseline.

## 9. Frontend Status

- Routing/entry: `src/App.tsx`, `src/main.tsx`, `src/pages/*`.
- Guards: `ProtectedRoute`, `PermissionRoute`, `TenantAccessGuard`.
- Platform shell: `src/platform/shell/PlatformLayout.tsx`.
- RunOps shell: `src/runops/shell/*` (top bar, sidebar, right drawer, command palette, Nova panel).
- AVEP shell: `src/avep/shell/*` — 21 routes wired.
- Digital Coworkers dashboards: `src/pages/coworkers/*`, `src/pages/itsm/*`, `src/pages/neurealm-agentic-ai/*`.
- Design tokens: `src/index.css` + `tailwind.config.ts` for the base; AVEP uses its own `src/avep/theme/tokens.css`.
- State: TanStack Query for server data; Zustand in AVEP/silicon; React Context for scenario/persona/access.
- Component tests: `src/platform/components/States.test.tsx` (6 passing) + example test.

## 10. Backend Status

- Supabase Postgres + RLS as primary backend.
- Edge functions (18) under `supabase/functions/`:
  - `admin-delete-user`, `admin-reset-password`, `admin-set-platform-role`, `admin-set-tenant-membership`, `admin-users`
  - `tenant-invite`, `tenant-signup`, `tenant-data-import`
  - `public-questionnaire-get`, `public-questionnaire-save`, `public-questionnaire-upload`
  - `auth-email-hook`, `process-email-queue`, `forgot-password`, `record-login`, `user-login-history`, `invite-user`
- Email templates under `supabase/functions/_shared/email-templates/`.
- `supabase/config.toml`: `forgot-password` has `verify_jwt = false`.

## 11. Security Status

- Latest scan: 58 warn, 0 High, 0 Critical.
- Recent hardening: SECURITY DEFINER anon revocation, login-event spoofing fix, questionnaire respondent validation via edge functions, self-scoped `is_platform_admin`/`has_role`/`is_user_approved`.
- Deferred by baseline: leaked-password protection (config item).
- Legacy admin-only cross-tenant reads on ETDM/CRM/questionnaires — closed by BP1.2 (T-005).

## 12. Testing Status

- Vitest: 2 files (`src/test/example.test.ts`, `src/platform/components/States.test.tsx`) — 6/6 passing.
- SQL regression: 5 suites authored in `supabase/tests/` — execution against disposable DB pending.
- E2E: none (TD-05).
- A11y automation: none (TD-04).
- Typecheck: `tsgo --noEmit` clean at last run.

## 13. CI/CD Status

- `.github/workflows/bp1-1-platform-foundation.yml`:
  - **app job** — Bun install → typecheck → lint → Vitest → build.
  - **database job** — Supabase Postgres 15 service container, migration replay, all 5 SQL suites with `-v ON_ERROR_STOP=1`.
- No other workflows detected.
- **No green run recorded yet** — first execution is the BP1.1 release gate.

## 14. Documentation Status

Present under `docs/`:
- BP1.1: `bp1-1-baseline.md`, `bp1.1-baseline.md`, `bp1-1-existing-asset-map.md`, `bp1-1-legacy-authorization-boundary.md`, `bp1-1-permission-model.md`, `bp1-1-platform-architecture.md`, `bp1-1-rls-matrix.md`, `bp1-1-security-disposition.md`, `bp1-1-operational-runbook.md`, `bp1-1-release-checklist.md`, `bp1-1-release-notes.md`, `bp1-1-rollback-plan.md`, `bp1-1-production-readiness.md`, `bp1-1-technical-debt.md`, `bp1-1-test-evidence.md`, `bp1-1a-test-evidence.md`, `bp1-1b-test-evidence.md`.
- Meridian baseline snapshots: `docs/meridian-*.md`.
- `docs/multi-tenant-verification-report.md`.
- **Missing**: master `docs/README.md` index; per-module design docs for AVEP, RunOps, ATC, Neurealm.

## 15. Known Risks

- **R1** Missing execution evidence blocks BP1.1 final approval.
- **R2** Legacy admin-gated catalogs (ETDM/CRM/questionnaires) are still cross-tenant readable to platform admins.
- **R3** Divergent tenant identity (`runops_tenants` vs `public.tenants`) risks drift as new features touch both.
- **R4** `src/silicon/**` duplication with `src/avep/**` invites accidental edits to the dead prototype.
- **R5** No E2E coverage for tenant switch, invitation acceptance, or permission gating — regressions could ship undetected.
- **R6** Super-admin roster in a code migration slows adding/removing admins.
- **R7** Real integrations (SolarWinds, Cribl, PagerDuty) not connected — RunOps runs on Demo provider only.

## 16. Blockers

- **B1** Disposable-DB SQL regression suite not executed (needs CI run or local `SUPABASE_DB_URL`). Blocks BP1.1E.
- **B2** First green run of `bp1-1-platform-foundation.yml` not captured. Blocks BP1.1E.
- **B3** Post-merge `security--run_security_scan` showing 0 High/Critical not archived. Blocks BP1.1E.
- **B4** 25 UX evidence screenshots (persona click-through) not captured. Blocks BP1.1E.

## 17. Recommended Next Build Phase

**BP1.1E — Release Evidence & Handoff**, followed by **BP1.2 — Legacy Catalog Tenant Scoping**.

- **BP1.1E**: execute all authored evidence, capture persona screenshots, close blockers B1–B4, publish release notes for GA.
- **BP1.2**: bring ETDM/CRM/questionnaires under `tenants` + `has_permission`; retire admin-only gating; bridge RunOps tenants.

## 18. Prioritized Task Backlog

Each task: **ID · Priority · Dependency · Effort · Status**.

### BP1.1E — Release Evidence

#### T-001 · P0 · — · S · Not started
Run `.github/workflows/bp1-1-platform-foundation.yml` on `main` and capture the run URL.
- **Files**: `.github/workflows/bp1-1-platform-foundation.yml`, `docs/bp1-1-test-evidence.md`.
- **Acceptance**: both `app` and `database` jobs exit 0; run URL committed under `docs/bp1-1-test-evidence.md`.

#### T-002 · P0 · T-001 · S · Not started
Execute all `supabase/tests/*.sql` against disposable DB and archive logs.
- **Files**: `supabase/tests/bp1_1a_regression.sql`, `bp1_1_platform_security.sql`, `bp1_1_tenant_isolation.sql`, `bp1_1_invitations.sql`, `bp1_1_last_admin.sql`; `docs/bp1-1-test-evidence.md`.
- **Acceptance**: 5 suites exit 0 with `ON_ERROR_STOP=1`; logs attached to evidence doc.

#### T-003 · P0 · — · S · Not started
Post-merge security rescan confirming 0 High / 0 Critical.
- **Files**: `docs/bp1-1-security-disposition.md`.
- **Acceptance**: rescan snapshot (date + counts) committed.

#### T-004 · P0 · T-001,T-002,T-003 · S · Not started
Persona click-through screenshots (25 UX evidence items).
- **Files**: `docs/bp1-1-test-evidence.md`.
- **Acceptance**: all 25 items captured with screenshot + short caption.

#### T-018 · P0 · T-001..T-004 · S · Not started
Publish `docs/bp1-1-release-notes.md` for GA and close BP1.1.
- **Files**: `docs/bp1-1-release-notes.md`, `docs/bp1-1-release-checklist.md`.
- **Acceptance**: release notes stamped GA; checklist boxes ticked.

### In-flight Continuity

#### T-015 · P1 · — · M · In progress
AVEP scenario continuity pass — DDMAC descriptor engine across all 21 routes.
- **Files**: `src/avep/data/canonical.ts`, `src/avep/pages/**`.
- **Acceptance**: KPIs, entity names, evidence IDs consistent across pages; visual review sign-off.

#### T-016 · P1 · — · M · In progress
ITSM Auto Ticket Categorization sub-page data continuity with parent dashboard.
- **Files**: `src/pages/itsm/**` (dashboard + 15 sub-pages under `AtcShell`).
- **Acceptance**: all 15 sub-pages reflect parent KPIs and shared entities; no orphan fixtures.

### BP1.2 — Legacy Catalog Tenant Scoping

#### T-005 · P1 · — · L · Not started
Migrate `etdm_*`, `crm_*`, `questionnaires`, `questionnaire_*`, `stakeholder_registers` to be tenant-scoped with RLS via `has_permission`.
- **Files**: new `supabase/migrations/*_bp1_2_tenant_scope.sql`; regression additions under `supabase/tests/`.
- **Acceptance**: no cross-tenant admin reads; every touched table has explicit GRANTs; regression SQL passes.

#### T-006 · P1 · T-005 · M · Not started
Refactor frontend hooks/pages to use tenant-scoped queries.
- **Files**: `src/hooks/crm/*`, `src/hooks/etdm/*`, `src/hooks/questionnaires/*`, `src/pages/crm/**`, `src/components/etdm/**`, `src/components/questionnaires/**`.
- **Acceptance**: pages function per-tenant; Vitest suite + typecheck pass; no `is_platform_admin` gates remaining on these pages.

#### T-007 · P1 · — · M · Not started
Bridge `runops_tenants` ↔ `public.tenants` (TD-03).
- **Files**: new migration + `src/runops/providers/*`, `src/runops/profiles/*`.
- **Acceptance**: single tenant identity resolvable across product + RunOps; RunOps behavior preserved (Contoso scenarios green).

### Test / A11y Automation

#### T-008 · P1 · — · M · Not started
Playwright E2E harness for tenant switch, invitation acceptance, permission gating (TD-05).
- **Files**: `playwright.config.ts`, `e2e/**`, CI workflow addition.
- **Acceptance**: 3 flows green in CI; Playwright job runs on PR.

#### T-009 · P2 · T-008 · S · Not started
Axe-core a11y automation in CI (TD-04).
- **Files**: `vitest.config.ts` or new axe job; `e2e/**` if using Playwright axe.
- **Acceptance**: axe run in CI; job fails on serious/critical violations.

### Debt Burn-down

#### T-010 · P2 · — · S · Not started
Local scratch-DB bootstrap script (TD-06).
- **Files**: `scripts/bootstrap-scratch-db.sh`.
- **Acceptance**: one command produces a validated local DB; documented in `docs/bp1-1-operational-runbook.md`.

#### T-011 · P2 · — · S · Not started
Externalize super-admin bootstrap roster (TD-02).
- **Files**: migration relocating roster into a config/permissions table; `handle_new_user` update.
- **Acceptance**: adding/removing a super admin no longer requires a code migration.

#### T-012 · P2 · — · S · Not started
Remove `AcceptInvitation` `localStorage` coupling (TD-01).
- **Files**: `src/platform/pages/AcceptInvitation.tsx`, `src/platform/access/AccessContext.tsx`.
- **Acceptance**: no client-supplied active tenant crosses the provider boundary; server-side revalidation only.

#### T-013 · P2 · — · S · Not started
Archive or delete `src/silicon/**` prototype (TD-09).
- **Files**: `src/silicon/**`, `src/App.tsx`.
- **Acceptance**: no active route imports `silicon`; module removed or explicitly archived under `/archive` with a README.

#### T-014 · P3 · — · S · Not started
Master docs index and per-module design docs (TD-10).
- **Files**: `docs/README.md`, new `docs/avep-*.md`, `docs/runops-*.md`, `docs/itsm-atc-*.md`.
- **Acceptance**: single entry-point index links every doc; each module has at least one design doc.

### Feature: Real Integrations

#### T-017 · P2 · T-007 · L · Not started
`ConnectedOperationsProvider` implementation for at least one real integration (SolarWinds / Cribl / PagerDuty).
- **Files**: `src/runops/providers/ConnectedOperationsProvider.ts`, new edge function(s) under `supabase/functions/`.
- **Acceptance**: at least one integration returns live data behind a feature flag; Demo provider remains default.

## 19. Acceptance Criteria for Next Phase (BP1.1E)

- CI workflow green on `main`; run URL committed.
- 5 SQL suites executed 0-exit against disposable DB; logs archived in `docs/bp1-1-test-evidence.md`.
- Post-merge security scan: 0 High / 0 Critical, snapshot committed.
- 25 UX evidence items captured (screenshot + caption) in `docs/bp1-1-test-evidence.md`.
- `docs/bp1-1-release-notes.md` published for GA; `docs/bp1-1-release-checklist.md` fully ticked.
- No regressions: Vitest 6/6, typecheck clean, build clean.

## 20. Recommended Build Order

1. **T-001 → T-002 → T-003 → T-004 → T-018** — close BP1.1 release evidence and ship GA.
2. In parallel: **T-015, T-016** — finish in-flight continuity work.
3. **T-005 → T-006** — BP1.2 tenant scoping (migration first, then frontend refactor).
4. **T-007 → T-017** — RunOps ↔ public tenant bridge, then first real integration.
5. **T-008 → T-009** — E2E harness, then a11y automation stacked on it.
6. **T-010, T-011, T-012, T-013** — debt burn-down (parallelizable).
7. **T-014** — docs index and per-module design docs.
