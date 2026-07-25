# NeuGAIN Delivery Plan

## Build Package Sequence

- BP1.1 — Platform Foundation — **Released, BP1.1E external execution evidence unresolved** (see `docs/bp1-1-external-execution-guide.md`).
- BP2.0 — Commercial Architecture, Source Truth, and Scope Contract — **Built, Validated (GO)**.
- BP2.1 — Commercial Schema, RLS, Permissions, Roles — **Built, Validated (GO)**.
- BP2.2 — Commercial Workspace Bootstrap & Roles — **Built, Validated (GO)**.
- BP2.3 — Commercial Shell & Navigation (5 routes) — **Built, Validated (GO)**.
- BP2.4 — Project Momentous Program, Gates, Metrics, Sources — **Built, Validated (GO)**.
- BP2.5 — Scenarios (Conservative/Base/Upside) + 69 Directional Assumptions — **Built, Validated (GO)**.
- BP2.6 — Integrated Overview, Portfolio Foundation, Hardening, Docs — **Built, Pending Final Validation** (see `docs/commercial/bp2-build-evidence.md`, `operator-guide.md`, `known-limitations.md`).
- BP2 overall — **Built, Validated (GO)**.
- BP3.0 — Commercial Modeling Source, Formula, Precision & Golden Baseline Contract — **Completed, Validated (GO)**.
- BP3.1 — Commercial Model Runtime, Versioning, Run Persistence, RLS & Immutability — **Completed, Validated (GO)**.
- BP3.2 — Project Momentous Volume Driver & Revenue Calculation Engine — **Completed, Validated (GO)** (see `docs/commercial/bp3-2-revenue-formulas.md`, `bp3-2-test-evidence.md`, `supabase/tests/bp3_2_revenue_engine.sql`, edge function `commercial-run-scenario`, page `/commercial/model/revenue`).
- BP3.2.1 — Runtime Evidence Finalized — 3 completed runs (CONS/BASE/UPSIDE) against `PM-FIN-2026.1`, 34 inputs + 126 results per run, golden parity exact (378/378), idempotent reuse proven (0 new · 3 reused). PM-FIN-2026.1 remains Draft (activation deferred to BP3.8).

### BP3.2 COMPLETED AND VALIDATED

- **Status:** Completed
- **Independent Validation:** GO
- **Validation Date:** 2026-07-25

**Summary.** The Project Momentous Revenue Engine has been successfully implemented, runtime verified, independently validated, and accepted as the authoritative revenue modeling foundation for the Commercial Digital Twin.

**Delivered Capabilities**
- ✓ Server-authoritative revenue engine
- ✓ Project Momentous revenue model
- ✓ Volume-driver calculations
- ✓ Revenue-stream calculations
- ✓ Formula lineage
- ✓ Runtime persistence
- ✓ Deterministic input hashing
- ✓ Idempotent execution
- ✓ Golden-baseline parity (378 / 378)
- ✓ Complete runtime evidence
- ✓ Tenant isolation
- ✓ Row-Level Security enforcement
- ✓ Immutable completed runs
- ✓ Source-aligned formula catalog
- ✓ Persisted input snapshots
- ✓ Persisted model results
- ✓ Commercial Revenue workspace
- ✓ Scenario execution
- ✓ Historical execution audit

**Deferred Items**
- Model activation → BP3.8
- Cost / COD Engine → BP3.3
- Operating Expense Engine → BP3.3
- Cash Flow → BP3.4
- Sensitivity Analysis → BP3.7

**Executive Summary.** BP3.2 establishes the first production-ready calculation engine within the NeuGAIN Commercial Digital Twin. Revenue calculations are now server-authoritative, source-aligned, deterministic, tenant-secure, runtime verified, and independently validated. Subsequent Build Packages extend this foundation with Cost, EBITDA, Cash Flow, Sensitivity Analysis, and Executive Decision Support while reusing the validated revenue engine rather than duplicating financial calculations.

- BP3.3 — Engine — Cost of Delivery, OPEX, Gross Profit & EBITDA — **Executed, Parity & Idempotency Verified** (see `docs/commercial/bp3-3-pnl-formulas.md`, `docs/commercial/bp3-3-test-evidence.md`, page `/commercial/model/pnl`, edge function `commercial-run-scenario` with `run_scope=pnl`). 3 pnl runs completed (CONS 54cc3b9d, BASE 862d95f4, UPSIDE c473055c) — 151 metrics · 149 inputs · 100% lineage each. Base FY2027 anchors (Revenue $5.21M, COD $1.38M, GP $3.83M, OPEX $1.05M, EBITDA $2.78M) and 5-yr totals match golden to the cent. Idempotency re-verified: second click produced 0 new · 3 reused runs. Ready for BP3.3.VALIDATE.
- BP3.4 — Engine — Sensitivity & Terms Interpretation — **Not Started**.
- BP3.5 — Supabase Edge Function `commercial-run-scenario` + RLS wiring — **Not Started**.
- BP3.6 — Golden-diff Test Harness & CI Gate — **Not Started**.
- BP3.7 — Commercial UI — Run controls, output panels, delta and sensitivity views — **Not Started**.
- BP3.8 — Documentation, Operator Guide, Release Evidence & BP3 Completion — **Not Started**.
- Carry-forward: BP1.1E external execution evidence remains unresolved (see `docs/bp1-1-external-execution-guide.md`).

---

# BP1.1F — Functional UI Discovery Report (Read-Only)

Scope note. The NeuGAIN app registers **397 `<Route>` entries** in `src/App.tsx` across ~20 top-level modules, plus module-internal registries (`AVEP_NAV`, `runops/shell/routes.ts`, `eoc/Sidebar.tsx`, `PlatformLayout` tabs, `SeadRail`). A leaf-by-leaf table for all 397 routes exceeds the plan size budget (50K chars). This report enumerates every **module and navigation registry** exhaustively, gives per-module route counts and gating, and lists **every orphan / missing-nav / missing-route finding** discovered by cross-referencing registries. Any leaf-level drill-down (e.g. "list all 78 `/coworkers/*` routes with status") can be produced next as a follow-up plan against a chosen module.

No source files, migrations, or docs were modified.

---

## 1. Method

Read-only inspection of:
- `src/App.tsx` (route registry) — 397 `<Route path="…">` declarations extracted.
- Navigation registries: `src/components/eoc/Sidebar.tsx`, `src/avep/shell/navigation.ts`, `src/runops/shell/routes.ts` + `RunOpsSidebar.tsx`, `src/platform/shell/PlatformLayout.tsx` (TABS), `src/components/sead/SeadRail.tsx`.
- Auth/permission gates: `ProtectedRoute`, `PermissionRoute`, `TenantAccessGuard` (retired — returns `scoped:false`), `AccessContext`.
- Feature flags: `src/runops/domain/featureFlags.ts` (all non-demo flags default `false`).
- Filesystem enumeration of `src/pages/**`, `src/avep/pages/**`, `src/silicon/pages/**`, `src/runops/pages/**`, `src/platform/pages/**`.

## 2. Global Gating Summary

| Gate | Where enforced | Effect |
|---|---|---|
| Auth (`ProtectedRoute`) | `src/components/auth/ProtectedRoute.tsx` | Redirects unauthenticated → `/login`; unapproved → `/pending-approval`; forces `/set-password` when required. |
| Admin-only | `ProtectedRoute requireAdmin` | Non-admin → `/app`. Not currently applied to most routes. |
| Permission | `src/components/auth/PermissionRoute.tsx` | Used inside `/platform/*` only. |
| Tenant scope | `TenantAccessGuard` | **Retired** (`useTenantScope` returns `scoped:false`). No route is tenant-filtered at the router level today. |
| Feature flags | `runops/domain/featureFlags.ts` | `demoMode:true` default; `connectedMode`, `liveAi`, `autonomousExecution`, `externalPublishing`, `realInfrastructureActions` all `false`. Flags govern **behaviour inside RunOps pages**, not route visibility. |

Interpretation used below:
- "Required auth" = wrapped in `ProtectedRoute` in `App.tsx`.
- "Required permission" = wrapped in `PermissionRoute`.
- "Required tenant" = a tenant must be selected via `AccessContext` (currently only meaningful under `/platform/*`).

---

## 3. Module Inventory (per-module rollup)

Legend: **R** = routes registered in `App.tsx`; **Nav** = has a top-level nav entry the end user can click; **Auth** = wrapped in `ProtectedRoute`; **Perm** = uses `PermissionRoute`; **Flag** = behaviour gated by `FeatureFlags`.

| # | Module | Route prefix | R | Nav registry | Auth | Perm | Tenant | Flag | Placeholder pages | Prod-ready |
|---|---|---|---:|---|:-:|:-:|:-:|:-:|---|---|
| 1 | Landing / Public | `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/pending-approval`, `/q/:token`, `/no-access` | 8 | Landing hero + auth pages | — | — | — | — | none | Yes |
| 2 | Profile / Session | `/profile`, `/set-password`, `/complete-profile` | 3 | User menu | partial | — | — | — | none | Yes |
| 3 | Command Center (Home) | `/app` | 1 | `Index` hub | ✓ | — | — | — | none | Yes |
| 4 | **RunOps** | `/runops/**` | ~55 explicit + placeholder fallback from `runops/shell/routes.ts` | `RunOpsSidebar` (12 sections) + `runops/shell/routes.ts` | ✓ | — | — | ✓ | Any `routes.ts` path not explicitly registered renders `<RunOpsPlaceholder/>` | Mixed — Command / Services / Runbooks / Incidents implemented; several under Governance/Integrations/Platform still placeholder |
| 5 | RunOps → AWS COTS Digital Twin | `/runops/aws-cots-digital-twin` | 1 | RunOps sidebar bottom | ✓ | — | — | ✓ | none | Yes |
| 6 | **AVEP** (AI VLSI Engineering Platform) | `/avep/**` | 21 (matches `AVEP_NAV`) | `AvepSidebar` (Plan / Design / Verify groups) | ✓ | — | — | — | none — every nav item has a concrete page (Overview, Program, Requirements, Requirements-Review, Traceability, Architecture, RTL Spec, RTL Gen, Change-Impact, Env Builder, Test Factory, Sim Ops, Failure Diagnosis, Coverage Closure, Signoff, Release Pkg, AI Governance, PD Intake, End-to-End Story) | Yes — demo-grade |
| 7 | **Silicon** (legacy AVEP predecessor) | `/silicon/**` | 1 root (`FoundationStatus`) | not linked from any active sidebar | ✓ | — | — | — | Only foundation page reachable | **Orphan module** — see §5 |
| 8 | **Platform Admin** | `/platform/**` | 7 (`/platform`, `/platform/members`, `/platform/roles`, `/platform/audit`, `/platform/settings`, `/platform/profile`, `/platform/invitations/:token`) | `PlatformLayout` TABS | ✓ | ✓ (per tab) | ✓ (active tenant required) | — | none | Yes (BP1.1C-D hardened) |
| 9 | **SEAD** (Semiconductor Equipment Asset Digital Twin) | `/sead/**` | 21 | `SeadRail` in-app rail + eoc Sidebar entry `/sead/command-center` | ✓ | — | — | — | none | Yes — demo-grade |
| 10 | **Digital Coworkers** | `/coworkers/**` | 78 | eoc `Sidebar.tsx` — Digital Coworkers group | mostly unauth in `App.tsx` — **inconsistent with peers** (see §6) | — | — | — | Landing tiles are real; sub-agent pages implemented (Healthcare Payer has 22 leaves, Infra 8, Network 3, IAM 2, Vuln 2, SRE 2, App Support 3, Carve-out 18) | Mixed — some Healthcare Payer leaves are dashboard-grade, others are shells |
| 11 | **Neurealm Agentic AI** | `/neurealm-agentic-ai` | 1 (10 in-page tabs) | eoc Sidebar under Digital Coworkers | ✓ | — | — | — | none | Yes |
| 12 | **IT Carve-Out & Separation** operating model | `/carve-out/**` | 49 | eoc Sidebar → `carveOpModelChildren` | mixed | — | — | — | Each of 6 workstreams × 3 views (overview/design/dashboard) plus roll-ups | Yes — content-rich, demo grade |
| 13 | **Practice Library** | `/practice-library/**` | 32 | eoc Sidebar (2 groups: Ops practices + Cyber practices) | ✓ | — | — | — | Cyber master dashboard + 9 domain dashboards + 10 ops-practice dashboards | Yes — dashboard grade |
| 14 | **Enterprise Certificate Management** | `/enterprise-certificate-management/**` | 16 | Reached from eoc Sidebar (Digital Twins group) — check §5 | mixed | — | — | — | 15 sub-centers (Risk, Lifecycle, Ops Center, Agentic Exec, Global Ops, BSIC, Reports, Change Mgmt, Integrations, Security Posture, Compliance, Audit, Policy, CT Logs) | Yes |
| 15 | **Reliability Foundations** hub | `/reliability-foundations`, `/operational-friction-index`, `/product-reliability-anatomy`, `/transformation-journey`, `/measuring-success`, `/product-reliability-transformation-index` | 10 | eoc Sidebar → SRE Foundations children | ✓ | — | — | — | Real content pages | Yes |
| 16 | **PROD Resilience Twin** & related SRE twins | `/prod-resilience-twin`, `/product-line-map`, `/golden-workflow-map`, `/production-topology`, `/sre-operating-model`, `/signal-intelligence`, `/enterprise-cloud-twin`, `/aws-resilience-architecture-twin`, `/platform-engineering-factory`, `/hybrid-cloud-workbench`, `/automation-marketplace`, `/modernization-factory`, `/modernization-roadmap`, `/modernization-roadmap-v2`, `/cyber-resilience-overlay`, `/ai-coworker-control-room`, `/transition-dual-run`, `/acquisition-onboarding-factory`, `/value-creation-board`, `/interactive-demo-center`, `/executive-service-owner-twin`, `/engagement-manager-twin`, `/delivery-org-twin`, `/datadog-log-profile`, `/auth-orchestration`, `/schedule-builder` | ~26 | eoc Sidebar → SRE Command / SRE Program children | mixed | — | — | — | Content-rich for the flagship items; some are stubs | Mixed |
| 17 | **Data Orchestration Twin** | `/data-orchestration-twin`, `/data-orchestration-twin/placement-scenario-modeler` | 2 | eoc Sidebar top-level | ✓ | — | — | — | none | Yes |
| 18 | **CRM / CRM Demo** | `/crm/**`, `/crm-demo/**` | 9 | Settings + CRM Demo entry | ✓ | — | — | — | Full CRUD sheets present | Yes |
| 19 | **Assurance** | `/assurance/**` | 3 | Cross-linked from RunOps / Incidents | ✓ | — | — | — | Command / LiveExecution / WorkflowDetail | Yes |
| 20 | **Incidents / Alerts / Change / Questionnaires** | `/incidents`, `/alerts`, `/change`, `/questionnaires`, `/scenario/**` | 6 | eoc Sidebar utilities | ✓ | — | — | — | none | Yes |
| 21 | **Admin — Technology Taxonomy** | `/admin/technology-taxonomy/**` | 4 | Settings shell | ✓ (admin) | — | — | — | Domains + Technology profiles | Yes |
| 22 | **Settings** | `/settings/**` | 7 | eoc Sidebar → Settings | ✓ | — | — | — | Organization, StakeholderRegister, ChangePassword, UserManagement | Yes |
| 23 | **NeuGAIN Product Overview page** | `/neugain` | 1 | Landing CTA | — | — | — | — | none | Yes |
| 24 | **NotFound / Redirects** | `*`, `/no-access` | 2 | — | — | — | — | — | Router fallback | Yes |

Grand total registered routes: **397** (matches `grep '<Route path'`).

---

## 4. Navigation hierarchy (top-level)

- **Landing** (`/`) → CTA into `/app`.
- **Command Center** `/app` (`src/pages/Index.tsx`) — hub tiles into every module below.
- **eoc `Sidebar.tsx`** groups (primary in-app nav):
  1. Digital Coworkers (10 practice areas → sub-pages).
  2. Digital Twins (Data Orch, RunOps, SEAD, AVEP, Neurealm Agentic AI, PROD Resilience family, Enterprise Certificate Mgmt, Carve-out op model).
  3. SRE Foundations / SRE Program (Reliability Foundations family).
  4. Practice Library (ops + cyber sub-groups).
  5. Settings.
- **`RunOpsSidebar`** — 12 sections (Command, Services, Runbooks, Operations, Incidents, Digital Workers, Reliability, Knowledge, Analytics, Governance, Integrations, Platform) + AWS COTS Twin.
- **`AvepSidebar`** — 3 phase groups (Plan / Design / Verify) covering all 21 AVEP items.
- **`PlatformLayout` TABS** — Home, Members, Roles, Audit, Settings, Profile.
- **`SeadRail`** — in-page section rail (Command Center + 20 sub-pages).

---

## 5. Existing Orphaned Screens (implemented but unreachable via UI)

Discovered by comparing registered routes vs every nav registry.

| Orphan | Route | Why orphan |
|---|---|---|
| Silicon FoundationStatus | `/silicon` (and any `/silicon/*` future) | `SiliconLayout` still mounted in `App.tsx`, but no sidebar / hub tile links to it. Superseded by `/avep/**`. |
| RunOps Design System | `/runops/design-system` | Route registered; no `RunOpsSidebar` entry (dev-only). |
| RunOps Runbook builder variants | `/runops/runbooks/:runbookId/builder` | Registered but not linked from `RunbookDetail` main actions (verify next drill-down). |
| Practice Library route roots without index | Several `/practice-library/<category>/index` entries only reachable through Cyber master dashboard | Confirm per-category leaf visibility in follow-up. |
| `/tenant-profiles` legacy path (`RunOpsTenantProfileManager` under `/runops/platform/tenant-profiles`) | reachable, OK — no legacy orphan detected. |
| Assurance `/assurance/*` | reachable only via cross-links from Incidents/RunOps — no top-level nav entry. |
| CRM Demo `/crm-demo/*` | Reachable only via `/app` tile — not in sidebar. |

## 6. Missing Navigation entries (page exists, sidebar entry missing or unreachable at intended level)

| Page | Route | Missing where |
|---|---|---|
| Silicon workspace | `/silicon` | eoc Sidebar Digital Twins group |
| RunOps Design System | `/runops/design-system` | RunOps sidebar (dev tools) |
| Assurance Command | `/assurance/command` | eoc Sidebar or Command Center |
| Data Orchestration Twin — Placement Scenario Modeler | `/data-orchestration-twin/placement-scenario-modeler` | Not in eoc Sidebar (only parent listed) |
| Enterprise Certificate Management sub-centers (15) | `/enterprise-certificate-management/*` | Only the root is exposed in eoc Sidebar; the 15 sub-pages rely on in-page nav — confirm those in-page links exist |
| Coworkers → Citrix Platform | `/coworkers/citrix-platform-digital-coworkers` | Present in sidebar (OK) |
| AVEP Placeholder view | `ModulePlaceholder` used by `/avep/*` fallback | Not currently reachable — placeholder only mounted via manual navigation; safe to keep |

## 7. Missing Route Registrations (nav entry exists → route missing)

Cross-referencing `eoc/Sidebar.tsx` `to:` targets against registered routes:

| Sidebar `to:` | Route registered in `App.tsx`? |
|---|---|
| `/operational-friction-index` | ✓ |
| `/reliability-foundations` | ✓ |
| `/product-reliability-anatomy` | ✓ |
| `/transformation-journey` | ✓ |
| `/measuring-success` | ✓ |
| `/prod-resilience-twin` | ✓ |
| `/product-line-map` | ✓ |
| `/golden-workflow-map` | ✓ |
| `/production-topology` | ✓ |
| `/sre-operating-model` | ✓ |
| `/signal-intelligence` | ✓ |
| `/enterprise-cloud-twin` | ✓ |
| `/aws-resilience-architecture-twin` | ✓ |
| `/platform-engineering-factory` | ✓ |
| `/hybrid-cloud-workbench` | ✓ |
| `/automation-marketplace` | ✓ |
| `/modernization-factory` | ✓ |
| `/cyber-resilience-overlay` | ✓ |
| `/ai-coworker-control-room` | ✓ |
| `/transition-dual-run` | ✓ |
| `/acquisition-onboarding-factory` | ✓ |
| `/value-creation-board` | ✓ |
| `/modernization-roadmap` | ✓ |
| `/interactive-demo-center` | ✓ |
| `/modernization-roadmap-v2` | ✓ |
| `/practice-library/*` (all 20 leaves) | ✓ |
| `/carve-out/{group}/{slug}` (dynamic) | ✓ (covered by `:slug` route) |

No **missing route registrations** were detected across the eoc sidebar. The RunOps sidebar targets `sectionLanding()` values from `runops/shell/routes.ts`; every landing path is covered either by an explicit route or the `RunOpsPlaceholder` fallback (functional but content-empty).

## 8. Existing Hidden Screens (registered + protected but not featured in top nav — intentional deep-links)

| Screen | Route | Rationale |
|---|---|---|
| `/set-password`, `/complete-profile` | onboarding forcing | Intentional |
| `/no-access` | redirect target | Intentional |
| `/pending-approval` | approval gate | Intentional |
| `/q/:token` | public respondent link | Intentional |
| `/platform/invitations/:token` | invite acceptance | Intentional |
| Deep incident / execution / worker / runbook detail routes under `/runops/**` | Reached from list pages, not sidebar | Intentional |

## 9. Feature-flag-gated behaviour

None of the 397 routes are hidden behind a flag today. Flags in `runops/domain/featureFlags.ts` gate **actions inside RunOps pages** (autonomous exec, live AI, external publish, real-infra). Default flag state = demo-safe.

## 10. Placeholder content

- `src/avep/pages/ModulePlaceholder.tsx` — instantiable but no route uses it in the current `App.tsx` (all AVEP paths bind concrete components).
- `src/runops/pages/RunOpsPlaceholder.tsx` — used as fallback for any `routes.ts` entry not explicitly bound above.
- No other pages self-identify as placeholder shells; content-completeness varies (see §3 "Prod-ready" column).

---

## 11. Return: the seven required outputs

### 1. Existing Functional Screens
All entries in §3 rows 1–24 marked prod-ready or "Yes — demo-grade" are functional and reachable. Concretely: Landing/Auth (8), Profile/Session (3), Command Center (1), RunOps core (~40 of 55), AVEP (21), Platform Admin (7), SEAD (21), Neurealm Agentic AI (1), IT Carve-Out (49), Practice Library (32), Enterprise Certificate Mgmt (16), Reliability Foundations (10), PROD Resilience family (~20 of 26), Data Orchestration Twin (2), CRM (9), Assurance (3), Incidents/Alerts/Change/Questionnaires (6), Admin Taxonomy (4), Settings (7), NeuGAIN overview (1), NotFound (1).

### 2. Existing Hidden Screens
See §8 — onboarding, redirect, public-token, and deep-link detail routes.

### 3. Existing Orphaned Screens
See §5 — Silicon, RunOps Design System, Runbook Builder variant, Assurance top-level (no nav), CRM Demo (only via hub tile), select Practice Library category roots.

### 4. Missing Navigation
See §6 — Silicon, RunOps Design System, Assurance, Data Orch Placement Scenario Modeler, Enterprise Cert sub-centers (in-page nav to confirm).

### 5. Missing Route Registrations
None detected from the eoc, AVEP, RunOps, Platform, or SEAD navigation registries. All sidebar `to:` targets resolve to a registered route or a documented placeholder.

### 6. Recommended fixes (documentation only — not to be executed under BP1.1F)
1. Retire or link `/silicon` — decide whether to remove `SiliconLayout` from `App.tsx` (superseded by AVEP) or add a sidebar entry.
2. Add explicit RunOps sidebar entry for `/runops/design-system` behind a "dev mode" toggle or move it under `/runops/platform`.
3. Add an eoc-sidebar entry for `/assurance/command` (or explicitly document it as deep-link only from Incidents).
4. Add a child entry under Data Orchestration Twin for `/data-orchestration-twin/placement-scenario-modeler`.
5. Verify Enterprise Certificate Management root exposes in-page nav to all 15 sub-centers; otherwise add sidebar children.
6. Audit `/coworkers/*` `ProtectedRoute` coverage — most sibling modules require auth; coworkers routes are declared without a wrapper in `App.tsx`. Confirm intent.
7. Remove `ModulePlaceholder` mount points once every AVEP path is confirmed concrete (already true — safe to delete import if `App.tsx` no longer references).
8. Consolidate the manually-maintained RunOps route exclusion list in `App.tsx` (~40 lines of `r.path !==`) into `runops/shell/routes.ts` metadata to prevent drift.

### 7. Readiness to begin Build Package 2

**Ready with caveats.**

Ready because:
- Route registry is complete and consistent with the primary navigation registries.
- Auth / permission / tenant primitives from BP1.1 A–D are in place and enforced on the modules that require them (`/platform/**`).
- No blocking missing route registrations were found; no unreachable-yet-required screens.
- Feature flags are demo-safe by default; BP2 can layer on connected-mode behaviour without route reshuffling.

Caveats (not blockers, but should be scheduled into BP2 grooming):
- Legacy `/silicon` module is orphaned; BP2 should either delete or re-integrate.
- `/coworkers/**` auth-wrapper inconsistency should be resolved before BP2 introduces tenant-scoped data on those pages.
- Sub-center visibility for Enterprise Certificate Management and Data Orchestration Twin should be confirmed via a UX walk (candidate BP2 UX-evidence item).
- The manually-maintained RunOps exclusion list is a drift risk; BP2 refactor recommended.

If deeper per-page tables are needed (e.g. every `/coworkers/*` or every `/carve-out/*` leaf with prod-ready flag), request a follow-up plan scoped to one module and I will emit a per-leaf table for that module only.
