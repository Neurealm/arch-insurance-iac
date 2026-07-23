
# Regenerate `.lovable/plan.md` as a Living Implementation Plan

## Goal
Replace the current `.lovable/plan.md` (a stale BP1.1D validation report) with a comprehensive, living engineering plan derived from the current state of the repository, database schema, migrations, tests, CI, and docs. No source, schema, migrations, workflows, or documentation outside `.lovable/plan.md` will be modified.

## Deliverable
A single file rewrite: `.lovable/plan.md`, containing the 20 sections requested, with per-task Priority / Dependency / Effort / Status / Files / Acceptance Criteria.

---

## Content Outline for the New `.lovable/plan.md`

### 1. Executive Summary
- Product: NeuGAIN — multi-tenant enterprise platform hosting several digital-twin / digital-coworker modules (RunOps, AVEP AI VLSI Engineering, ETDM, CRM, Questionnaires, Neurealm Agentic AI Studio, Service Desk / Auto Ticket Categorization).
- Foundation program **BP1.1 (Platform Foundation)** — packages A/B/C/D — has been built; execution evidence for BP1.1D CI + disposable-DB regression remains outstanding.
- Product modules layered on the foundation are in varying states: RunOps and AVEP are the most complete; ITSM/ATC, Neurealm Agentic AI, and settings/user-management have shipped recent iterations.

### 2. Current Build Status
Matrix of module → phase → status (Planned / In Progress / Shipped / Hardening / Blocked), sourced from:
- `src/platform/**` (BP1.1 A–D)
- `src/runops/**`, `src/pages/coworkers/**`, `src/pages/itsm/**`
- `src/avep/**`
- `src/silicon/**` (legacy AVEP foundation prototype)
- `src/components/eoc/**`, `src/pages/neurealm-agentic-ai/**`
- `src/pages/crm/**`, `src/components/etdm/**`, `src/components/questionnaires/**`
- `supabase/migrations/**`, `supabase/functions/**`, `supabase/tests/**`
- `.github/workflows/**`, `scripts/**`, `docs/**`

### 3. Completed Work (per package)
- **BP1.1A** canonical tables + audit + profile hardening (`supabase/tests/bp1_1a_regression.sql`).
- **BP1.1B** permission model, `has_permission`, `provision_tenant`, membership lifecycle.
- **BP1.1C + Final Patch** platform admin UX: `AccessContext`, `PermissionRoute`, `MemberAdmin`, `RoleAdmin`, `AuditExplorer`, `TenantSettings`, `Profile`, `AcceptInvitation`, `CreateTenantDialog` w/ `ConfirmDialog`.
- **BP1.1D** hardening artifacts: 4 SQL suites, `scripts/validate-bp1-1.sh`, `.github/workflows/bp1-1-platform-foundation.yml`, `States.test.tsx`, 7 ops docs.
- **RunOps** shell, providers, scenarios, Contoso profile, Service Digital Twin, Runbook linking.
- **AVEP** shell + theme, canonical DDMAC data, 21-route navigation, phase workspaces (Overview, Program, Requirements Intake/Review, Traceability, Logical Architecture, Eng Spec & Verification, RTL Studio, Change Impact, Verification Env Builder, Test Factory, Sim Ops, Waveform Intelligence, Coverage Closure, Signoff Readiness, Release Package, AI Governance, Physical-Design Intake, End-to-End Story).
- **Digital Coworkers** ITSM Auto Ticket Categorization dashboard + 15 sub-pages via `AtcShell`.
- **Neurealm Agentic AI Studio** 10-tab module under Digital Coworkers.
- **Integrations Catalog** 14 profiles + technical drawer.
- **Security remediation** for the recent finding set (SECURITY DEFINER anon revocation, `user_login_events` insert scoping, questionnaire respondent validation via edge functions, `rls_helper_arbitrary_uid` self-only check).
- **User Management** profile view/edit dialog + `sync_profile_company` trigger.

### 4. In Progress Work
- BP1.1D **execution evidence**: disposable-DB SQL regression run + first green CI workflow run.
- AVEP data alignment pass (DDMAC scenario continuity across all pages).
- ITSM ATC sub-page data continuity with parent dashboard.

### 5. Remaining Work
- BP1.2 tenant-scoping of legacy admin-only tables: ETDM, CRM, questionnaires share-links (TD-07).
- Bridge `runops_tenants` ↔ `public.tenants` (TD-03).
- Externalize super-admin bootstrap roster (TD-02).
- Playwright E2E harness (TD-05).
- Automated axe-core a11y in CI (TD-04).
- Local scratch-DB bootstrap script for BP1.1 tests (TD-06).
- `AcceptInvitation` routing coupling cleanup (TD-01).
- AVEP Phase-4 delivery modules (Deliver group was removed pending scope).
- Production data connectors for `ConnectedOperationsProvider` and `ConnectedAiProvider`.

### 6. Outstanding Technical Debt
Full copy of `docs/bp1-1-technical-debt.md` (TD-01…TD-07) plus:
- **TD-08** `.lovable/plan.md` previously used as a validation-report scratchpad — this rewrite makes it the living plan.
- **TD-09** `src/silicon/**` is an earlier AVEP prototype now superseded by `src/avep/**`; schedule removal or explicit archival.
- **TD-10** Multiple long-lived documentation snapshots (`docs/meridian-*`, `docs/bp1-1*`) — need a docs index.

### 7. Architecture Decisions
- Permission-based authz (`has_permission`) — role-name checks are legacy.
- Roles in dedicated tables (`user_roles`, `tenant_roles`, `membership_roles`), never on `profiles`.
- Public-schema tables MUST ship with explicit `GRANT`s.
- Supabase Lovable Cloud project `esfpbiishpkvhlejnxzq`; anon key only in client.
- RunOps preserved as an independent sub-domain with its own tenant table until BP1.2.
- AVEP built as its own themed shell (`src/avep/theme`, `AvepLayout`).
- Frontend: React 18 + Vite 5 + Tailwind v3 + shadcn/ui + TanStack Query + Zustand (silicon/avep) + Deno edge functions.
- Providers pattern: `OperationsProvider` + `AiProvider` with Demo/Connected variants.

### 8. Database Status
- 100 public tables (see injected schema summary) across platform, RunOps, ETDM, CRM, questionnaires, org taxonomy.
- Canonical BP1.1 tables present with RLS + GRANTs.
- Security scan: 58 warnings (dispositioned), 0 High/Critical.
- Outstanding: tenant-scope migration for ETDM/CRM/questionnaire share-links; runops/public tenant bridge.

### 9. Frontend Status
- Platform shell (`src/platform/shell/PlatformLayout.tsx`) + auth guards (`ProtectedRoute`, `PermissionRoute`, `TenantAccessGuard`).
- RunOps shell (`src/runops/shell/*`).
- AVEP shell (`src/avep/shell/*`) — 21 routes wired.
- Digital Coworkers dashboards under `src/pages/coworkers`, `src/pages/itsm`, `src/pages/neurealm-agentic-ai`.
- Global design tokens in `src/index.css` + Tailwind config; AVEP uses its own `tokens.css`.
- Component tests scaffolded (`States.test.tsx`); broader coverage pending.

### 10. Backend Status
- Supabase Postgres + RLS as primary backend.
- Edge functions: 18 shipped (`admin-*`, `tenant-*`, `public-questionnaire-*`, `auth-email-hook`, `process-email-queue`, `forgot-password`, `record-login`, `user-login-history`, `invite-user`).
- Email templates under `supabase/functions/_shared/email-templates/`.
- No standalone Node/Python backend (per platform rule).

### 11. Security Status
- Latest scan: 58 warn, 0 High/Critical.
- Recent fixes: anon revocation on SECURITY DEFINER RPCs, `user_login_events` spoofing, questionnaire respondent validation, `is_platform_admin/has_role/is_user_approved` self-guarded.
- Open items: leaked-password protection (config, deferred by baseline); TD-07 tenant scoping for legacy catalogs.

### 12. Testing Status
- Vitest: 2 test files (`example.test.ts`, `States.test.tsx`), 6 tests passing.
- SQL: 5 regression suites in `supabase/tests/` (authored; execution pending in CI).
- No E2E harness (TD-05).
- No axe automation (TD-04).

### 13. CI/CD Status
- `.github/workflows/bp1-1-platform-foundation.yml` present: app job (install/typecheck/lint/test/build) + database job (Supabase Postgres service, migration replay, 5 SQL suites).
- No green run recorded yet — first execution is the BP1.1 release gate.
- No other workflows detected.

### 14. Documentation Status
- BP1.1 doc set complete (`docs/bp1-1-*.md`) including baseline, permission-model, RLS matrix, security-disposition, runbook, rollback, release checklist/notes, production-readiness, tech debt.
- Meridian baseline docs preserved (`docs/meridian-*`).
- Missing: master docs index; per-module design docs for AVEP, RunOps, ATC.

### 15. Known Risks
- Missing execution evidence blocks BP1.1 final approval.
- Legacy admin-gated catalogs (ETDM/CRM/questionnaires) still cross-tenant readable to admins.
- Divergent tenant identity (`runops_tenants` vs `public.tenants`).
- `src/silicon/**` duplication with `src/avep/**` invites drift.
- No E2E coverage for tenant switch or invitation flow.

### 16. Blockers
- **B1** Disposable-DB SQL regression not executed (needs CI run or local `SUPABASE_DB_URL`).
- **B2** First green run of `bp1-1-platform-foundation.yml` outstanding.
- **B3** Post-merge security rescan showing 0 High/Critical not captured for the record.

### 17. Recommended Next Build Phase
**BP1.1E — Release Evidence & Handoff** followed by **BP1.2 — Legacy Catalog Tenant Scoping**.
- BP1.1E: execute all authored evidence, capture screenshots, close blockers B1–B3, publish release notes.
- BP1.2: bring ETDM/CRM/questionnaires under `tenants` + `has_permission`; retire admin-only gating.

### 18. Prioritized Task Backlog
Each task lists: **ID · Priority · Dep · Effort · Status · Files · Acceptance**.

- **T-001 · P0 · — · S · Not started** — Run `bp1-1-platform-foundation.yml` on `main`.
  - Files: `.github/workflows/bp1-1-platform-foundation.yml`.
  - Accept: both jobs green; URL recorded in `docs/bp1-1-test-evidence.md`.
- **T-002 · P0 · T-001 · S · Not started** — Execute `supabase/tests/*.sql` against disposable DB and archive logs.
  - Files: `supabase/tests/*.sql`, `docs/bp1-1-test-evidence.md`.
  - Accept: 5 suites exit 0; logs attached.
- **T-003 · P0 · — · S · Not started** — Post-merge `security--run_security_scan`, confirm 0 High/Critical.
  - Files: `docs/bp1-1-security-disposition.md`.
  - Accept: rescan snapshot committed.
- **T-004 · P0 · T-001..003 · S · Not started** — Persona click-through screenshots for BP1.1 UX evidence (25 items).
  - Files: `docs/bp1-1-test-evidence.md`.
  - Accept: all items captured.
- **T-005 · P1 · — · M · Not started** — BP1.2 migration: bring `etdm_*`, `crm_*`, `questionnaires`, `questionnaire_*` under `tenant_id` with RLS via `has_permission`.
  - Files: new `supabase/migrations/*_bp1_2_tenant_scope.sql`; affected hooks under `src/hooks/crm`, `src/hooks/etdm`, `src/hooks/questionnaires`.
  - Accept: no admin-only cross-tenant reads; regression SQL added; grants explicit.
- **T-006 · P1 · T-005 · M · Not started** — Frontend refactor of admin pages to use tenant-scoped queries.
  - Files: `src/pages/crm/**`, `src/components/etdm/**`, `src/components/questionnaires/**`.
  - Accept: pages function per-tenant; tests pass.
- **T-007 · P1 · — · M · Not started** — Bridge `runops_tenants` ↔ `public.tenants` (TD-03).
  - Files: new migration + `src/runops/providers/*`.
  - Accept: single tenant identity resolvable across modules; RunOps behavior preserved.
- **T-008 · P1 · — · M · Not started** — Playwright E2E harness (TD-05) for tenant switch, invitation, permission gating.
  - Files: `playwright.config.ts`, `e2e/**`, CI workflow addition.
  - Accept: 3 flows green in CI.
- **T-009 · P2 · — · S · Not started** — Axe-core a11y automation in CI (TD-04).
  - Files: `vitest.config.ts` / new job.
  - Accept: axe run in CI, fail on serious violations.
- **T-010 · P2 · — · S · Not started** — Local scratch-DB bootstrap script (TD-06).
  - Files: `scripts/bootstrap-scratch-db.sh`.
  - Accept: developer runs one command to get a validated local DB.
- **T-011 · P2 · — · S · Not started** — Super-admin roster externalization (TD-02).
  - Files: migration to move roster into `permissions`/config table; `handle_new_user`.
  - Accept: adding an admin no longer needs a code migration.
- **T-012 · P2 · — · S · Not started** — Remove `AcceptInvitation` `localStorage` coupling (TD-01).
  - Files: `src/platform/pages/AcceptInvitation.tsx`, `src/platform/access/AccessContext.tsx`.
  - Accept: no client-supplied active tenant crosses provider boundary.
- **T-013 · P2 · — · S · Not started** — Archive or delete `src/silicon/**` prototype (TD-09).
  - Files: `src/silicon/**`, `src/App.tsx`.
  - Accept: no route depends on `silicon`; module removed or moved under `/archive`.
- **T-014 · P3 · — · S · Not started** — Docs index + per-module design docs (TD-10).
  - Files: `docs/README.md`, `docs/avep-*.md`, `docs/runops-*.md`.
  - Accept: single entry-point index; module docs linked.
- **T-015 · P1 · — · M · In progress** — AVEP scenario continuity pass (DDMAC scenario across all 21 routes).
  - Files: `src/avep/data/canonical.ts`, `src/avep/pages/**`.
  - Accept: KPIs/entities consistent across pages; snapshot review.
- **T-016 · P1 · — · M · In progress** — ITSM ATC sub-page data continuity.
  - Files: `src/pages/itsm/**`.
  - Accept: 15 sub-pages reflect parent dashboard KPIs.
- **T-017 · P2 · T-007 · M · Not started** — `ConnectedOperationsProvider` real integration (SolarWinds/Cribl/PagerDuty).
  - Files: `src/runops/providers/ConnectedOperationsProvider.ts`, edge functions.
  - Accept: at least one integration returns live data behind a feature flag.

### 19. Acceptance Criteria for Next Phase (BP1.1E)
- CI workflow green on `main` (URL recorded).
- 5 SQL suites executed 0-exit against disposable DB; logs archived.
- Post-merge security scan: 0 High / 0 Critical.
- 25 UX evidence items captured in `docs/bp1-1-test-evidence.md`.
- `docs/bp1-1-release-notes.md` published for GA.
- No regressions in Vitest suite; typecheck clean.

### 20. Recommended Build Order
1. T-001 → T-002 → T-003 → T-004 (close BP1.1 release evidence).
2. T-015, T-016 (in-flight continuity) in parallel with (1).
3. T-005 → T-006 (BP1.2 tenant scoping).
4. T-007 → T-017 (runops/public bridge, then real integrations).
5. T-008 → T-009 (test/a11y automation).
6. T-010, T-011, T-012, T-013 (debt burn-down).
7. T-014 (docs index).

---

## Constraints on this Task
- Only `.lovable/plan.md` will be rewritten. No changes to source, migrations, workflows, or other docs.
- No commands executed; no database changes.
- The file will be produced as a single overwrite of `.lovable/plan.md`.
