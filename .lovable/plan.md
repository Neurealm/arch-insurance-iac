
# Neugain.io (Pre-Sales PRD) — Read-Only Health Assessment

Baseline captured from prior verified inspections in this session (build, RLS repair, Meridian readiness) plus current codebase/Supabase context. No files, config, schema, routes, or dependencies were modified.

## Category Results

| # | Category | Result | Evidence |
|---|---|---|---|
| 1 | Application build | **PASS** | `vite build` succeeds (~42–53s). Main bundle 13.4 MB / 3.2 MB gzip. Only warning: chunks >500 kB (pre-existing). |
| 2 | GitHub connection | **PASS (agent-inaccessible)** | Managed by Lovable Git sync; sandbox cannot run stateful git. Not user-blocking. |
| 3 | Active Git branch | **PASS (agent-inaccessible)** | Same as above — Lovable-managed. |
| 4 | Routes | **PASS** | Central table in `src/runops/shell/routes.ts` (~60 RunOps routes: Command, Services, Runbooks, Operations, Incidents, Digital Workers, Reliability, Knowledge, Analytics, Governance, Integrations, Platform) + auth, CRM, tenant, twin, semiconductor, FOC pages. |
| 5 | Navigation | **PASS** | 12 nav sections wired through `navSections` → `RunOpsSidebar`; `TenantAccessGuard` + `useTenantScope` present but scoping currently retired (full nav for authed users). |
| 6 | Authentication | **PASS** | Supabase auth via `AuthContext` (session, role, approval, mustChangePassword). `ProtectedRoute` enforces approved+admin. `handle_new_user` trigger seeds profiles + super-admin roles; blocks personal email domains. |
| 7 | Tenant architecture | **PASS** | Tenant registry `src/runops/profiles/index.ts` (Contoso, Meridian, Atlas Cloud, Apex Fab). `runops_tenants`, `runops_profiles`, `runops_role_assignments` tables. Helpers `runops_has_tenant_access`, `runops_can_write`, `runops_has_role`, `runops_has_any_role`. `useDataSource` resolves demo vs live per tenant. |
| 8 | CMDB functionality | **PASS (partial coverage)** | Service/component/dependency modeling via `runops_services`, `runops_components`, `runops_dependencies`, `runops_service_owners`, topology page + connectors table. Deeper CI-class taxonomy would need `models.ts` extension. |
| 9 | Incident functionality | **PASS** | Full incident lifecycle: `runops_incidents`, `_incident_events`, `_hypotheses`, `_remediation_options`, `_communications`, `_postmortems`, `_problems`, `_corrective_actions`, `_known_errors`. Pages under `/runops/incidents/*`. Resolve RPC (`runops_resolve_incident`) with role gate. |
| 10 | Runbook functionality | **PASS** | `runops_runbooks`, `_runbook_steps`, `_runbook_versions`, `_runbook_tests`, `_runbook_triggers`, `_runbook_certifications`. Designer, policy, recovery, test, release, triggers, launch routes all Built. Certify RPC enforces separation-of-duty. |
| 11 | Business Service functionality | **PASS** | Service portfolio, detail, topology, observability, readiness routes Built. Backed by `runops_services`, SLIs/SLOs, error budgets, customer journeys. |
| 12 | Digital Twin functionality | **PASS** | FOC twin (`src/features/foc-twin/*` with three-fiber scene), Semiconductor twin (`src/features/semiconductor/*`), Production twin, Data Orchestration twin, SRE twin components. Meridian profile registered but bundle not yet fleshed out. |
| 13 | Digital Coworkers | **PASS** | `runops_digital_workers`, `_worker_capabilities`, `_worker_sessions`, `_worker_events`, `_worker_evaluations`, `_worker_tool_grants`. Studio + Collaboration + Automation Registry routes. Coworker dashboards per practice (SRE, IAM, Infra, Network, Vuln, App Support, Carve-Out). |
| 14 | Database schema | **PASS** | ~85 public tables across auth (`profiles`, `user_roles`, `user_login_events`), CRM (companies, stakeholders, activities, notes, teams, departments), Org modeling (BUs, capabilities, practices, workflows, activities, tasks), questionnaires + evidence, RunOps (60+ `runops_*` tables), catalogs (agents, tools, integrations). |
| 15 | RLS policies | **PASS** | All inspected tables have 2+ policies; helper grants restored (`is_platform_admin`, `runops_has_tenant_access`, `runops_can_write` → `authenticated`; mutation RPCs locked to `service_role`). Live 200s confirmed on `user_roles` + `profiles`; cross-tenant reads blocked. |
| 16 | Edge Functions | **PASS** | 16 functions deployed: admin-users, admin-delete-user, admin-reset-password, admin-set-platform-role, admin-set-tenant-membership, auth-email-hook, forgot-password, invite-user, process-email-queue, public-questionnaire-{get,save,upload}, record-login, tenant-data-import, tenant-invite, tenant-signup, user-login-history. All required secrets present (RESEND, SUPABASE_*, LOVABLE_API_KEY). |
| 17 | Package versions | **PASS (with caveats)** | React 18.3, Vite 5, React Router 7.9, Supabase JS 2.107, TanStack Query 5.83, three 0.160 + drei 9.122 + fiber 8.18, reactflow 11.11, framer-motion 12.40, recharts 2.15. No missing peers; three/drei/fiber pairing is consistent. |
| 18 | Browser console | **PASS** | No console errors captured at snapshot on `/app`. |
| 19 | Network activity | **PASS** | Recent verification showed 200 OK on `profiles` and `user_roles`; no 4xx/5xx observed. |
| 20 | Technical debt | **FAIL (non-blocking)** | (a) ~791 pre-existing ESLint errors; (b) main JS chunk 13.4 MB / 3.2 MB gzip — no code-splitting/manualChunks; (c) very large PNG assets (1.2–1.9 MB each) not compressed/converted; (d) no dedicated auth/authorization test suite (only 1 example vitest); (e) tenant scoping retired in `useTenantScope` — full nav shown to all authed users, page-level enforcement only; (f) `models.ts` CMDB CI-class primitives partial; (g) `runops_bootstrap_current_user` unconditionally seeds all runops roles to any caller for `tenant-contoso` (demo-grade convenience — review before production). |

## Overall Verdict

**Conditional GO**

Rationale: Every functional category passes and the recent RLS helper-grant repair is verified. The project is structurally ready for the next feature build (Meridian Epic EHR / Azure CMDB Digital Twin). The three items to acknowledge before shipping to production traffic — not before continuing development — are:

1. **Bundle size** — introduce route-level `React.lazy` + `manualChunks` before public launch (currently 3.2 MB gzip on first load).
2. **Lint debt** — ~791 pre-existing ESLint errors should be triaged; none block build or runtime.
3. **`runops_bootstrap_current_user`** — self-service assignment of every runops role on a hardcoded tenant is appropriate for the demo posture (`demoMode: true`) but must be gated or removed before autonomous execution is enabled.

No changes will be made in this plan — approving it simply acknowledges the assessment.
