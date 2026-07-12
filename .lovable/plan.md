
# Neugain.io (Pre-Sales PRD) — Read-Only Assessment

Reusing verified baselines from this session (build, RLS repair, Meridian readiness, prior 20-category discovery). No changes made.

## Category Results

| # | Category | Result | Evidence |
|---|---|---|---|
| 1 | Application build status | **PASS** | `vite build` succeeds ~42–53s, no errors. |
| 2 | Production build health | **PASS (warning)** | Bundle ships. Warning: main chunk 13.4 MB / 3.2 MB gzip; no code-splitting configured. |
| 3 | TypeScript health | **PASS** | `tsgo --noEmit` clean. |
| 4 | Lint status | **FAIL (non-blocking)** | ~791 pre-existing ESLint errors; unrelated to runtime, build unaffected. |
| 5 | Browser console | **PASS** | No console errors captured on `/app`. |
| 6 | Network requests | **PASS** | 200 OK on `profiles` and `user_roles` after RLS helper-grant repair; no 4xx/5xx. |
| 7 | Authentication health | **PASS** | Supabase `AuthContext` (session/role/approval/mustChangePassword); `ProtectedRoute` enforces approved+admin; `handle_new_user` seeds profiles/roles and blocks personal email domains. |
| 8 | Tenant selection | **PASS (scoping retired)** | Registry: Contoso, Meridian, Atlas Cloud, Apex Fab. `useTenantScope` currently returns unscoped (full nav for authed users); enforcement is page-level via `TenantAccessGuard` + tenant-scoped RLS helpers. |
| 9 | Existing routes | **PASS** | Central table `src/runops/shell/routes.ts` — ~60 RunOps routes plus auth, CRM, tenant, semiconductor, FOC/production/data-orchestration/SRE twin, practice-library. |
| 10 | Existing navigation | **PASS** | 12 sections (Command, Services, Runbooks, Operations, Incidents, Digital Workers, Reliability, Knowledge, Analytics, Governance, Integrations, Platform) rendered by `RunOpsSidebar`. |
| 11 | Existing dashboards | **PASS** | Command Center, ITSM (Business Services, Customer Experience, Exec BizOps, Executive Command Center, Risk Exposure, SLA/SLO/Error Budget), Reliability Analytics, Governance, Coworker dashboards (SRE/IAM/Infra/Network/Vuln/App Support/Carve-Out). |
| 12 | Existing CMDB functionality | **PASS (partial)** | `runops_services`, `runops_components`, `runops_dependencies`, `runops_service_owners`, `runops_connectors` + topology page. Deeper CI-class taxonomy would need `models.ts` extension. |
| 13 | Existing Business Services | **PASS** | Portfolio, Detail, Topology, Observability, Readiness routes Built; SLIs/SLOs/error-budgets/customer-journeys tables present. |
| 14 | Existing Runbooks | **PASS** | Library, Fitness, Designer, Steps, Policy, Recovery, Test, Release, Triggers, Launch routes Built. Tables: `runops_runbooks`, `_steps`, `_versions`, `_tests`, `_triggers`, `_certifications`. `runops_certify_runbook_version` enforces separation-of-duty. |
| 15 | Existing Incident Management | **PASS** | Full lifecycle: incidents, investigation, hypotheses, remediation, communications, recovery, postmortem, problems, corrective actions, known errors. Tables + `/runops/incidents/*` routes all Built. `runops_resolve_incident` RPC. |
| 16 | Existing Digital Coworkers | **PASS** | `runops_digital_workers`, `_worker_capabilities`, `_worker_sessions`, `_worker_events`, `_worker_evaluations`, `_worker_tool_grants`. Studio, Collaboration, Automation Registry routes plus per-practice dashboards. |
| 17 | Existing Digital Twin functionality | **PASS** | FOC twin (three-fiber), Semiconductor twin, Production twin, Data Orchestration twin, SRE twin. Meridian profile registered; bundle not yet fleshed out. |
| 18 | Current technical debt | **FAIL (non-blocking)** | (a) ~791 ESLint errors; (b) main chunk 13.4 MB / 3.2 MB gzip, no code-splitting; (c) 1.2–1.9 MB PNG assets uncompressed; (d) only one example vitest, no auth/authorization test suite; (e) `useTenantScope` retired; (f) `models.ts` CMDB primitives partial; (g) `runops_bootstrap_current_user` self-grants every runops role for `tenant-contoso` (demo-grade). |
| 19 | Current blocking issues | **PASS** | None. Prior RLS helper-grant 403 regression on `user_roles` / `profiles` is repaired and verified. |

## Verdict

**CONDITIONAL GO** — All functional categories pass and no blocking issues remain. Before public production launch, address: (1) bundle splitting, (2) ESLint debt triage, (3) gate/remove `runops_bootstrap_current_user`. Safe to proceed with the next feature (Meridian Epic EHR / Azure CMDB Digital Twin) under the current demo posture.

No changes will be made — approving this plan simply acknowledges the assessment.
