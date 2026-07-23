
# BP1.1 Preflight, Existing-State Assessment & Build Readiness

_Assessment-only deliverable. No code, schema, RLS, routes, navigation, or packages were changed._

---

## A. Executive Readiness Result

**Ready with preconditions.**

The Supabase backend, authentication, edge-function fleet, RLS baseline, and application shell exist and work. However, several BP1.1 canonical objects are **missing or partial** (no product-level `tenants`, no `memberships`, no `permissions` / `role_permissions`, no `tenant_invitations`, no unified `audit_events`), and the project carries a large body of customer- and technology-specific modules (RunOps, ETDM, AVEP, Silicon, SEAD, healthcare/Citrix demos) plus persistent instructions that assume a demo/single-tenant posture. These must be reconciled with the product-neutral direction before BP1.1 lands.

---

## B. Project Summary

- Lovable project `cf41b1c7-eed7-4ec8-8c7a-bb33fbe7ed6b`, published at `neugain.io`.
- Supabase project ref `esfpbiishpkvhlejnxzq` — connected, reachable, 89 public tables, 20 migrations, RLS enabled on every public table.
- Vite 5 + React 18 + TS SPA. React Router v6, TanStack Query, shadcn/Radix, Tailwind v3.
- Existing modules ship real value today (auth, user management, questionnaires, CRM, ETDM, RunOps demos, AVEP, SEAD, Agentic AI Studio) and must not regress.

---

## C. Existing Technology Stack

| Layer | Implementation |
|---|---|
| Frontend | Vite 5, React 18, TypeScript 5 |
| Routing | `react-router-dom` v6 (single `BrowserRouter` in `src/App.tsx`) |
| UI | shadcn/ui on Radix primitives, Tailwind v3, `class-variance-authority`, `lucide-react` |
| State / data | TanStack Query v5, React Context (`AuthContext`), Zustand (AVEP/Silicon) |
| Forms/validation | `react-hook-form` + `@hookform/resolvers` (zod present transitively) |
| 3D/Charts | `@react-three/fiber`, `@react-three/drei`, `recharts`, `d3-geo`, `framer-motion` |
| Auth SDK | `@supabase/supabase-js` + `@lovable.dev/cloud-auth-js` (OAuth wrapper) |
| Backend | Supabase Postgres + Auth + Storage + Edge Functions (Deno) |
| Tests | Vitest (`src/test/*`, config `vitest.config.ts`) |
| Lint | ESLint (`eslint.config.js`) |

Env: `.env` contains `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` (anon only — no service key on the client, confirmed). Server secrets present: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `OPENAI_API_KEY`, `LOVABLE_API_KEY`, JWKS/publishable/secret key sets.

---

## D. Existing Functionality to Preserve

Anything BP1.1 touches must leave these intact.

**Public / auth routes** — `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/pending-approval`, `/set-password`, `/complete-profile`, `/profile`, `/q/:token` (public questionnaire), `/app` (Command Center).

**Application modules** (each has its own route tree, pages, and Supabase dependencies):
- **RunOps Digital Twin** — `/runops/*` (~60 routes: services, runbooks, executions, incidents, workers, approvals, governance, integrations, tenant profiles).
- **AVEP (AI VLSI Engineering Platform)** — `/avep/*` (21 workspaces).
- **SEAD** — `/sead/*` (command center, cross-domain twin, equipment health, etc.).
- **Silicon** — `/silicon/*`.
- **Agentic AI Studio** — `/neurealm-agentic-ai`.
- **CRM** — companies, departments, teams, stakeholders, activities, notes.
- **ETDM** — technologies, domains, master domains, audit log.
- **Questionnaires** — authored + public token flow via edge functions.
- **Settings** — `UserManagement`, `ChangePassword`, `StakeholderRegister`, `organization/*` (org hierarchy).
- **Data-orchestration twin, prod-twin, carveout, coworkers** subtrees.

**Auth behavior** — `AuthProvider` (`src/context/AuthContext.tsx`) drives session, `platform_admin` detection via `user_roles`, profile approval gate, `must_change_password` gate, workspace slug in `sessionStorage`, durable login-event recording via `record-login` edge function.

**Guarded rendering** — `ProtectedRoute` (auth + approval + `requireAdmin`), `TenantAccessGuard` (currently a no-op — `useTenantScope` returns `scoped:false`).

**Backend-backed workflows** — user invite/reset/delete (edge functions `admin-*`, `invite-user`, `tenant-invite`, `tenant-signup`), auth email hook + queue, `forgot-password`, `record-login`, `user-login-history`, `tenant-data-import`, public questionnaire get/save/upload, ETDM clone/auto-build/reorder via SECURITY DEFINER functions.

**Existing roles** — `app_role` enum used by `user_roles` (values include `platform_admin`, `platform_support`). Second, unrelated `runops_role` enum drives `runops_role_assignments` (sre_engineer, noc_operator, incident_commander, service_owner, runbook_author, change_manager, digital_worker_administrator, platform_engineer, demo_controller).

**Regression risk / recommended post-BP1.1 validation** — smoke every module's index route while signed in as (a) platform admin, (b) pending user, (c) approved non-admin; run `bun run test`, confirm `record-login` fires, verify RunOps `runops_bootstrap_current_user` still succeeds, verify questionnaire public token flow, verify user invite email chain end-to-end.

---

## E. Canonical-Object Mapping

| BP1.1 Object | Existing Physical Name | Location | Key Fields | Reuse? | Notes / Migration Risk |
|---|---|---|---|---|---|
| **User profile** | `public.profiles` | migrations + `AuthContext` reads it | `user_id`, `email`, `display_name`, `full_name`, `first_name`, `last_name`, `phone`, `job_title`, `department`, `company`, `company_id`, `approval_status`, `approved_at/by`, `must_change_password`, `user_category`, `preferred_contact_method`, working/OOO/notification fields, `profile_completed_at` | **Reuse and extend.** | Very wide (33 cols). Trigger `sync_profile_company` writes `company_id` from free-text `company` — will affect any `tenants`-scoping later. |
| **Tenant** | ⚠ **No product-level `tenants` table.** `public.runops_tenants` exists but is module-local (RunOps demo) with `external_id`/`slug`; `crm_companies` is a CRM entity, not a tenant; `profiles.company` is free text; workspace slug lives only in `sessionStorage`. | `runops_tenants` + module code | `id`, `external_id`, `name`, `slug`, `metadata` | **Do not repurpose `runops_tenants`.** | BP1.1 must introduce a canonical `public.tenants`. Medium risk: existing modules assume no cross-tenant scoping today; RunOps has its own tenant concept that must map to (not be replaced by) the new one. |
| **Tenant membership** | ⚠ **Missing at product level.** Closest analog: `public.runops_profiles(tenant_id, user_id, display_name)` — RunOps-only. | `runops_profiles` | `tenant_id`, `user_id`, `display_name`, `metadata` | New table required. | Rename risk with `profiles` — must be clearly named (e.g. `tenant_memberships`). |
| **Permission** | ⚠ Missing. No permission catalog exists. | — | — | New. | Low migration risk; net-new. |
| **Role** | Partial. Two disjoint enums: `app_role` (platform-level, in `user_roles`) and `runops_role` (RunOps-only). No `roles` table with descriptions. | `user_roles`, `runops_role_assignments` | `user_id`, `role` (enum) | Retain `app_role` for platform admin lockout; introduce first-class `roles` table for tenant scope. | Enums are hard to alter — plan `roles` as a table, not an enum. |
| **Role permission** | ⚠ Missing. Authorization today is role-name based via `has_role`, `is_platform_admin`, `runops_can_write`, `runops_has_role`, `runops_has_any_role`. | DB functions | — | New. | Conflicts with the anti-role-name-based-authz rule — will need a `has_permission(user, tenant, perm)` helper. |
| **Membership role** | Partial: `runops_role_assignments(tenant_id, user_id, role)` and `user_roles(user_id, role)` (no tenant). | migrations | — | Model as `tenant_memberships` + `membership_roles` (or role FK). | Medium risk: existing `has_role(_user_id, app_role)` callers must keep working. |
| **Tenant invitation** | Edge functions `invite-user`, `tenant-invite`, `tenant-signup` exist, but no invitations table (tokens live in Supabase Auth). | `supabase/functions/*` | — | New table required for auditable, tenant-scoped invites with roles. | Low. |
| **Invitation role** | ⚠ Missing. | — | — | New. | Low. |
| **Audit event** | Partial and fragmented: `public.etdm_record_audit_log` (ETDM only), `public.runops_audit_events` (RunOps only), `public.user_login_events`, `public.user_page_activity`, `public.runops_domain_events`. No unified table. | migrations | — | **Introduce canonical `audit_events`**; keep module tables until BP1.2 migration. | Medium risk if consolidation is attempted now — do not remove module tables in BP1.1. |

**Duplicate/conflict summary:** RunOps ships a parallel tenant/role stack (`runops_tenants`, `runops_profiles`, `runops_role_assignments`, `runops_role` enum, `runops_bootstrap_current_user`). BP1.1 must define the **product-level** tenants/memberships/roles/permissions and later bridge RunOps to it — the RunOps stack must not be dropped.

---

## F. Project Knowledge Conflicts

| # | Instruction (summary) | Where | Why it conflicts | Retain / Revise / Archive / Remove | Suggested wording |
|---|---|---|---|---|---|
| F1 | `defaultFeatureFlags` freezes `demoMode: true`, `connectedMode: false`, `realInfrastructureActions: false` at product level. | `src/runops/domain/featureFlags.ts` | Suggests demo-only posture on a foundational file; conflicts with "suitable for production enterprise use". | **Retain (scoped to RunOps).** | Add header comment: "RunOps-module flags only; not global product policy." |
| F2 | RunOps `TenantOperationalProfile` seeded from hard-coded `contosoRecord`, `meridianRecord`, `atlasCloudRecord`, `apexFabRecord`. | `src/runops/profiles/*` | Hard-codes named tenants/industries into product code. | **Revise** post-BP1.1 to load from `tenants` table (leave untouched in BP1.1). | — |
| F3 | `handle_new_user` DB function hard-codes four Neurealm super-admin emails and blocks personal email domains. | migrations (function body) | Partner/customer-specific logic inside product-core. | **Revise** to configuration table + edge-function policy; do not touch in BP1.1. | Move super-admin bootstrap to `platform_admins_seed` config or `SUPER_ADMIN_EMAILS` secret. |
| F4 | `runops_bootstrap_current_user` grants every RunOps role to the caller against a hard-coded `tenant-contoso`. | DB function | Privilege escalation + customer-specific tenant. | **Revise** urgently; out of scope for BP1.1 but flag as follow-up. | Replace with invite-based, tenant-scoped role assignment. |
| F5 | `sync_profile_company` trigger auto-creates `crm_companies` rows from free-text `profiles.company`. | migrations | Couples auth/profile to CRM; would tangle with new `tenants` model. | **Revise** in BP1.2 (leave in BP1.1). | Move to explicit user action or map to `tenants` post-foundation. |
| F6 | `.lovable/plan.md` and `docs/meridian-*` reference the Meridian / Contoso / Citrix / Neurealm build direction. | `/docs`, `/.lovable/plan.md` | Customer-specific product direction. | **Archive** under `docs/legacy/` with a note that BP1.1 supersedes. | — |
| F7 | Security memory / project memory (`mem://index.md`) — currently empty. | `mem://` | No conflict; must be seeded with BP1.1 product-neutrality rule. | **Add** rule. | "Product must remain partner-, customer-, industry-, technology-neutral; named orgs are tenant data, not code." |
| F8 | Persistent instruction (system prompt) states: "roles MUST be stored in a separate table" and forbids client-side admin checks. | Lovable system prompt | Aligned with BP1.1 — no conflict; reinforces plan. | **Retain.** | — |
| F9 | Persistent instruction requires `GRANT` after every `CREATE TABLE public.*`. | Lovable system prompt | Aligned; BP1.1 must comply. | **Retain.** | — |
| F10 | `useTenantScope` is a no-op returning `scoped:false`, and `TenantAccessGuard` therefore short-circuits to permit everything. | `src/hooks/useTenantScope.ts`, `src/components/auth/TenantAccessGuard.tsx` | Effectively single-tenant runtime; conflicts with multi-tenant requirement. | **Revise in BP1.1** — this is the intended replacement point. | — |
| F11 | `useDataSource` reads `.from("tenants")` via `(supabase as any)` — code presumes a table that doesn't exist. | `src/hooks/useDataSource.ts` | Latent runtime error path. | **Revise in BP1.1** when `tenants` is created. | — |
| F12 | No workspace rule forbidding role-name-based authorization; existing code uses it broadly (`is_platform_admin`, `has_role`, `runops_has_role`). | codebase + DB functions | Conflicts with permission-based authorization goal. | **Add rule** to `mem://`; deprecate role-name gates in favor of `has_permission`. | — |

No instructions were found that: prohibit backend work, permit mock-only implementation, require destructive migrations, tell Lovable to skip tests, or bypass RLS.

---

## G. Security Baseline Findings

| Sev | Finding | Evidence |
|---|---|---|
| **Critical** | `runops_bootstrap_current_user` grants **every** RunOps role to any authenticated caller against hard-coded `tenant-contoso`. | DB function body. |
| **High** | Authorization is role-name based (`is_platform_admin`, `has_role`, `runops_can_write`, `runops_has_role`, `runops_has_any_role`). No permission layer. | DB functions. |
| **High** | Multiple SECURITY DEFINER functions (`etdm_clone_technology`, `etdm_clone_domain`, `etdm_reorder_domains`, `etdm_auto_build_domains`, `etdm_write_audit*`, `runops_*` mutators) — `search_path` is set (good), but privilege checks are role-name only. | DB functions. |
| **High** | `handle_new_user` embeds hard-coded super-admin emails; a single email edit at Auth level grants `platform_admin`. Also produces an admin-lockout risk if the four emails are lost. | DB function. |
| **Medium** | No unified `audit_events`; audits are per-module (`etdm_record_audit_log`, `runops_audit_events`, `user_login_events`, `user_page_activity`). Cross-module correlation impossible. | Schema. |
| **Medium** | `user_login_events` has only 1 policy — needs verification that INSERT is server-only (recent fix mentioned in history); PII sensitivity is high. | Schema summary. |
| **Medium** | `stakeholder_registers` (2 policies) previously flagged for PII exposure across admins without tenant scoping. Historical fix present; re-verify. | Prior finding. |
| **Medium** | `avatars` storage bucket is public — acceptable if only avatar images, but confirm no other objects land there. | Storage config. |
| **Low** | `useTenantScope` is a no-op → any signed-in, approved user sees full navigation; page-level access relies solely on route-embedded checks. | `useTenantScope.ts`. |
| **Low** | `useDataSource` queries a non-existent `tenants` table via `as any`; fails silently. | `useDataSource.ts`. |
| **Low** | `profiles.company` free text auto-creates CRM companies via `sync_profile_company` — potential CRM pollution and cross-tenant name collisions once tenants exist. | Trigger. |
| **Informational** | RLS enabled on **all 89 public tables** — good baseline. Service role key is **not** exposed to the browser (verified `.env` and `src/integrations/supabase/client.ts`). | Query above; file read. |
| **Informational** | No direct browser writes seen to `user_roles`; role changes go through `admin-set-platform-role` edge function. | Function inventory. |
| **Informational** | Recent history references fixes for: `SUPA_anon_security_definer_function_executable`, `SUPA_public_bucket_allows_listing`, `user_login_events_insert_spoofing`, `stakeholder_registers_pii_exposure_scope`, `questionnaire_responses_no_respondent_policy`, `rls_helper_arbitrary_uid`. **Re-run `security--run_security_scan` before BP1.1** to confirm none regressed. | Chat context. |

_No exploitation performed. No repair performed._

---

## H. Database and Row Level Security Summary

- Provider: Supabase Postgres, project `esfpbiishpkvhlejnxzq`.
- Tables (public schema): **89** — all with RLS enabled (verified via `pg_tables.rowsecurity`).
- Migrations: **20** applied files under `supabase/migrations/`, oldest `20260711200820`, most recent `20260720161028`. No pending destructive migration.
- Enums used for role: `app_role` (platform-level), `runops_role` (RunOps-only).
- Storage buckets: `avatars` (public), `evidence` (private), `etdm-assets` (private).
- Extensions of note: `gen_random_uuid()` in use throughout.
- Cross-cutting DB functions to be aware of during BP1.1:
  - Platform: `is_platform_admin`, `is_user_approved`, `has_role`, `handle_new_user`, `seed_user_defaults`, `set_user_category_from_email`, `sync_profile_company`, `update_updated_at_column`, `record_user_login_event`, `admin_get_user_login_history`, `admin_user_page_activity`.
  - RunOps: `runops_has_tenant_access`, `runops_can_write`, `runops_has_role`, `runops_has_any_role`, `runops_bootstrap_current_user`, `runops_advance_scenario`, `runops_reset_scenario`, `runops_approve_change`, `runops_resolve_incident`, `runops_approve_execution`, `runops_deny_execution`, `runops_certify_runbook_version`.
  - ETDM: `etdm_clone_technology`, `etdm_clone_domain`, `etdm_reorder_domains`, `etdm_auto_build_domains`, `etdm_write_audit`, `etdm_write_audit_domains`, `etdm_enforce_practice`.

---

## I. Build and Test Commands

- Dev: `bun run dev` (Vite, port 8080).
- Build: `bun run build` / `bun run build:dev`.
- Lint: `bun run lint`.
- Tests: `bun run test` (Vitest, single run) / `bun run test:watch`.
- Type-check: `tsgo` (per workspace rule; do not run `tsc --noEmit` manually).
- Supabase migrations: via `supabase--migration` tool (approval required, files written under `supabase/migrations/`).
- Edge functions auto-deploy on save. Logs at `https://supabase.com/dashboard/project/esfpbiishpkvhlejnxzq/functions/{name}/logs`.

---

## J. Restore-Point Recommendation

Available mechanisms:
- **Lovable version history** — always on for this project. **Primary rollback.**
- **Supabase migrations directory** — full forward history; no rollback tool exists in-tool, so a schema snapshot must be taken manually if BP1.1 alters existing tables.
- **Published version** — `neugain-connect-dream.lovable.app` and `neugain.io` — last published state acts as a live restore reference.
- **Database backup** — Supabase automatic daily backups (verify retention in the Supabase dashboard).
- Git commits — managed by Lovable; direct git ops not permitted from this environment.
- Supabase branches — not currently in use.

**Recommended baseline before BP1.1:**
1. Tag a Lovable version history checkpoint labeled `pre-bp1.1-foundation`.
2. Confirm Supabase automatic backup ran within the last 24 h; if uncertain, request a manual PITR checkpoint from Supabase dashboard.
3. Publish the current app so the live URL freezes the current baseline.
4. Snapshot `.env` values and the current secrets list.

_Not created automatically — awaiting explicit authorization._

---

## K. Required Preconditions Before BP1.1

1. **Rerun `security--run_security_scan`** and confirm no open Critical/High findings beyond those noted in G.
2. **Decide the RunOps tenant reconciliation strategy** — BP1.1 will introduce `public.tenants`; `runops_tenants` must be preserved and later linked (out-of-scope for BP1.1) or aliased. Confirm no rename of `runops_tenants` is expected.
3. **Decide role enum vs role table** — BP1.1 will introduce a `roles` table for tenant-scoped roles. Confirm `app_role` enum + `user_roles` (platform_admin, platform_support) will be retained as-is for platform-level admin.
4. **Authorize archival of Meridian/Contoso project docs** under `docs/legacy/` (BP1.1 execution step, not preflight).
5. **Authorize seeding of `mem://index.md`** with the product-neutrality core rule.
6. **Establish restore point** (section J).
7. **Confirm super-admin bootstrap path** — the four hard-coded emails in `handle_new_user` will be retained for BP1.1 but flagged for BP1.2 relocation to configuration.
8. **Confirm no in-flight edits** to `profiles`, `user_roles`, or auth-related migrations from other work streams.
9. **Confirm test scope** — BP1.1 tests should cover: signup → approval → login → tenant switch → member invite → role change → audit write → forbidden route → RLS negative test.
10. **Confirm no PII in test tenants**; use synthetic data only.

---

## L. Information to Retain for the BP1.1 Completion Report

- Migration file names created for `tenants`, `tenant_memberships`, `roles`, `permissions`, `role_permissions`, `tenant_invitations`, `audit_events`.
- Exact `GRANT` statements applied per new table.
- Names of new RLS policies and the helper function(s) introduced (e.g. `is_tenant_member`, `has_permission`).
- List of routes newly gated and their required permissions.
- Screenshots of: sign-in, tenant switcher, member admin, role admin, forbidden state, loading state, empty state.
- Test run output (`bun run test`) with pass counts.
- Post-migration `security--run_security_scan` results.
- Confirmation that the modules in section D still render for platform admin and a fresh tenant user.
- Any deviations from the BP1.1 build prompt and their justification.

---

## M. Files, Routes, Tables, Functions & Policies BP1.1 Must Inspect or Reuse

**Files (reuse / extend, do not rewrite):**
- `src/context/AuthContext.tsx` — session, role, approval, password-change gates.
- `src/components/auth/ProtectedRoute.tsx` — extend for permission gating.
- `src/components/auth/TenantAccessGuard.tsx` — replace no-op with real tenant/permission check.
- `src/hooks/useTenantScope.ts` — implement against new `tenant_memberships`.
- `src/hooks/useDataSource.ts` — repoint to new `tenants` table.
- `src/hooks/useUserProfile.ts` — reuse for profile reads.
- `src/pages/settings/UserManagement.tsx` — extend for tenant-scoped member admin.
- `src/pages/auth/*` — all auth screens; no rewrite expected.
- `src/integrations/supabase/client.ts` — anon client (do not touch).
- `src/integrations/supabase/types.ts` — auto-generated; do not edit.
- `src/App.tsx` — add BP1.1 routes only (tenants, members, roles, forbidden).
- `src/components/eoc/Sidebar.tsx` — extend for tenant switcher; preserve all groups.

**Routes to preserve** — every route enumerated in D, plus RunOps subtree from `src/runops/shell/routes.ts` and AVEP from `src/avep/shell/navigation.ts`.

**Tables to reuse:** `profiles`, `user_roles` (retain `app_role`), `user_login_events`, `user_page_activity`, `user_contact_methods`, `user_notification_rules`.

**Tables to leave untouched (module-owned):** all `runops_*`, all `etdm_*`, `crm_*`, `questionnaire*`, `nova_knowledge_base`, `agents_catalog`, `tools_catalog`, `integrations_catalog`, `org_*`, `programs`, `workstreams`, `stakeholder_registers`, `action_items`, `evidence_files`, `answers`, `answer_notes`.

**Functions to reuse:** `is_platform_admin`, `is_user_approved`, `has_role`, `handle_new_user`, `seed_user_defaults`, `update_updated_at_column`, `record_user_login_event`, `admin_get_user_login_history`.

**Functions to add (new in BP1.1):** `is_tenant_member(_user_id, _tenant_id)`, `has_permission(_user_id, _tenant_id, _permission text)`, `current_tenant_id()`, unified audit-write helper.

**Edge functions to preserve:** `admin-users`, `admin-set-platform-role`, `admin-set-tenant-membership`, `admin-reset-password`, `admin-delete-user`, `invite-user`, `tenant-invite`, `tenant-signup`, `auth-email-hook`, `process-email-queue`, `forgot-password`, `record-login`, `user-login-history`, `tenant-data-import`, `public-questionnaire-*`.

**Policies to inspect (do not modify pre-build):** every policy on `profiles`, `user_roles`, `user_login_events`, `user_page_activity`, `user_contact_methods`, `user_notification_rules`.

---

## Conclusion

The **previously supplied BP1.1 Build Prompt should NOT be pasted into Build mode yet.** Address preconditions **K.1, K.2, K.3, K.5, K.6, K.7** first (rescan security, confirm reconciliation strategy for RunOps/`app_role`, seed memory with the neutrality rule, and establish the Lovable version-history restore point). Once those are confirmed, the project is in a safe state for BP1.1 to run.
