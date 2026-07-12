
# Neugain.io (Pre-Sales PRD) — Architecture Inventory & Reuse Matrix

Read-only inventory of the existing project, oriented toward reuse decisions for the upcoming Meridian University Epic EHR / Azure CMDB Digital Twin. No files, config, schema, or dependencies will be modified.

## Inventory

### 1. Existing routes
Central declarative table at `src/runops/shell/routes.ts` (~60 RunOps routes across 12 sections). Additional route families: `/login`, `/signup`, `/pending-approval`, `/reset-password`, `/set-password`, `/app`, `/profile`, `/t/:tenant`, `/q/:questionnaire`, `/crm/*`, `/carveout/*`, `/coworkers/*`, `/prod-twin/*`, `/data-orchestration-twin/*`, `/semiconductor/*`, `/foc-twin/*`, `/sead/*`, `/aocp/*`, `/itsm/*`, `/practice-library/*`, `/settings/*`.

### 2. Shared layouts
- `RunOpsLayout` (`src/runops/shell/RunOpsLayout.tsx`) — sidebar + topbar + right drawer.
- `RunOpsSidebar`, `RunOpsTopBar`, `RunOpsRightDrawer`, `AskNovaPanel`, `CommandPalette`, `NotificationCenter`, `SimulationBadge`, `DemoControllerDrawer`, `RunOpsErrorBoundary`.
- `AuthLayout` (`src/pages/auth/AuthLayout.tsx`) for public auth pages.
- `DataOrchLayout`, `OrganizationLayout`, `SemiShell`, `DashShell` (carveout), practice-library `TableOfContents`.

### 3. Authentication
- `AuthContext` (`src/context/AuthContext.tsx`) — session, user, `isAdmin`, `hasPlatformAdminRole`, approval status, `mustChangePassword`, `refreshRole`, `signOut`, `activeWorkspace`.
- `ProtectedRoute` gates approved+admin. `TenantAccessGuard` scopes routes (currently retired but wired).
- `handle_new_user` trigger seeds `profiles` + super-admin roles; blocks personal email domains.
- Edge functions: `forgot-password`, `invite-user`, `record-login`, `tenant-invite`, `tenant-signup`, `admin-reset-password`, `auth-email-hook`, `user-login-history`.

### 4. Tenant model
- Registry: `src/runops/profiles/index.ts` — Contoso, Meridian, Atlas Cloud, Apex Fab. Types in `types.ts`; presentation resolver in `presentation.ts`; validator in `validate.ts`.
- Tables: `runops_tenants`, `runops_profiles`, `runops_role_assignments`.
- Helpers: `runops_has_tenant_access`, `runops_can_write`, `runops_has_role`, `runops_has_any_role`, `runops_bootstrap_current_user`.
- Hook: `useDataSource` resolves demo/live per tenant from `runops_tenants.data_mode`.

### 5. User model
- `profiles` (20 cols): `user_id`, `email`, `display_name`, `approval_status`, `must_change_password`, `user_category`, timestamps.
- `user_roles` with `app_role` enum (`platform_admin`, `platform_support`, …).
- `runops_role_assignments` with `runops_role` enum per tenant (SRE, NOC, incident commander, service owner, runbook author, change manager, digital worker admin, platform engineer, demo controller, …).
- `user_login_events`, `user_page_activity` for audit.

### 6. Navigation
12 sections in `navSections` (Command, Services, Runbooks, Operations, Incidents, Digital Workers, Reliability, Knowledge, Analytics, Governance, Integrations, Platform). Rendered by `RunOpsSidebar` using `sectionLanding()`. Non-RunOps trees have their own sidebars (semiconductor, foc-twin, data-orch, practice-library, carveout, settings/organization).

### 7. Shared components
- `src/runops/components/*` — panels, indicators, metrics, telemetry, timeline, graphs, states, dialogs, variants, `StepCodeBuilder`.
- shadcn-ui primitives under `src/components/ui/*` (Radix).
- Auth: `ProtectedRoute`, `TenantAccessGuard`, `AuthVerificationOverlay`.
- Investigation: `GuidedInvestigationMode`.
- SRE twin: `SRETwinSections`.
- FOC twin: `DigitalTwinViewport`, `Overlays`, `SelectionDrawer`, `SceneObjects`, `CameraController`.
- CRM sheets: Company/Department/Stakeholder/Team/Note/Activity/PromoteToTenantDialog.
- Assurance: `AssuranceHeader`, `LiveAgentOverlay`.
- Coworkers: `CoworkerDashboard`.

### 8. Zustand stores
- `src/features/foc-twin/store.ts` — FOC twin selection/scene state.
- No global app-level Zustand store; state is otherwise React Query + Context.

### 9. Context providers
- `AuthContext` — session/role/approval.
- `PersonaContext` — active persona/journey.
- `ScenarioStateContext` — demo scenario stage state.
- `EvidenceGraphContext` — evidence graph selection.
- `GuidedInvestigationContext` — guided investigation flow.
- `ScenarioStore` (`src/runops/scenario/ScenarioStore.tsx`) — RunOps scenario stages.
- `OperationsProvider` / `AiProvider` (`src/runops/providers/*`) with connected variants.

### 10. Database schema
~85 public tables. Groupings: auth (`profiles`, `user_roles`, `user_login_events`, `user_page_activity`), CRM (companies/stakeholders/activities/notes/teams/departments), Org modeling (BUs/capabilities/practices/workflows/activities/tasks/service_functions), questionnaires + evidence, catalogs (agents/tools/integrations), and 60+ `runops_*` tables (services, components, dependencies, connectors, runbooks + steps/versions/tests/triggers/certifications, executions + step_executions, approvals, incidents + events/hypotheses/remediation/communications/postmortems, problems, corrective actions, known errors, changes, digital workers + capabilities/sessions/events/evaluations/tool_grants, SLIs/SLOs/error budgets, customer journeys, teams, policies + policy decisions, alerts, notifications, audit events, domain events, scenario instances/events, telemetry snapshots, knowledge items).

### 11. Existing CMDB
`runops_services`, `runops_components`, `runops_dependencies`, `runops_service_owners`, `runops_connectors`. Topology page under `/runops/services/:serviceId/topology`. CI-class taxonomy is partial in `src/runops/domain/models.ts`.

### 12. Existing Business Services
Portfolio, Detail, Topology, Observability, Readiness routes. Backed by services, SLIs/SLOs, error budgets, customer journeys.

### 13. Existing Runbooks
Library, Fitness, Designer, Steps, Policy, Recovery, Test, Release, Triggers, Launch. Tables: `runops_runbooks`, `_steps`, `_versions`, `_tests`, `_triggers`, `_certifications`. `runops_certify_runbook_version` RPC with separation-of-duty.

### 14. Existing Incident Management
Full lifecycle: incidents, investigate, hypotheses, remediation options, communications, recovery validation, postmortem, problem corrective actions. Tables: `runops_incidents`, `_incident_events`, `_hypotheses`, `_remediation_options`, `_communications`, `_postmortems`, `_problems`, `_corrective_actions`, `_known_errors`. RPC: `runops_resolve_incident`.

### 15. Existing Change Management
`runops_changes` table + `runops_approve_change` RPC (change_manager role, self-approval blocked). Approvals routed via `runops_approvals` and `runops_approve_execution` / `runops_deny_execution` RPCs. Change management is not currently a dedicated left-nav section — surfaced within Operations/Governance.

### 16. Existing Audit
`runops_audit_events` (structured actor/action/target), `runops_domain_events` (event stream). `user_login_events`, `user_page_activity`, `admin_get_user_login_history` RPC. Evidence: `runops_evidence_items`, `evidence` storage bucket, `evidence_files`.

### 17. Existing Digital Twin functionality
- FOC twin — `src/features/foc-twin/*` with `react-three/fiber` scene, buildings, overlays, selection drawer.
- Semiconductor twin — `src/features/semiconductor/*` with factory map, KPI ribbon, scenario context.
- Production twin — `src/pages/prod-twin/*` (Golden Workflow, Hybrid Cloud Workbench, Modernization Roadmap, Platform Engineering Factory, Production Topology, Value Creation Board).
- Data Orchestration twin — `src/pages/data-orchestration-twin/*`.
- SRE twin — `src/components/sre-twin/SRETwinSections.tsx`.
- Meridian profile stub registered but bundle not yet fleshed out.

### 18. Existing integrations
`runops_connectors` table, `integrations_catalog`, `tools_catalog`, `agents_catalog`. Routes: `/runops/integrations`, `/runops/developer`, `/runops/supply-chain`. Standard connectors available via Lovable gateway (not yet linked to project).

### 19. Existing Edge Functions
16 deployed: `admin-users`, `admin-delete-user`, `admin-reset-password`, `admin-set-platform-role`, `admin-set-tenant-membership`, `auth-email-hook`, `forgot-password`, `invite-user`, `process-email-queue`, `public-questionnaire-{get,save,upload}`, `record-login`, `tenant-data-import`, `tenant-invite`, `tenant-signup`, `user-login-history`. All required secrets present.

### 20. Existing feature flags
`src/runops/domain/featureFlags.ts` — `demoMode` (default true), `connectedMode`, `liveAi`, `autonomousExecution`, `externalPublishing`, `realInfrastructureActions` (all default false). Frozen `defaultFeatureFlags` + `assertFlagEnabled` helper. Per-tenant `data_mode` on `runops_tenants` toggles demo/live at the data layer.

## Reuse Matrix (for Meridian Epic EHR / Azure CMDB Digital Twin)

| Capability | Classification | Notes |
|---|---|---|
| Route table (`routes.ts`) | **Reuse unchanged** | Add Meridian entries into the same table; no structural change. |
| `RunOpsLayout` + sidebar/topbar/right drawer | **Reuse unchanged** | Layout is tenant-agnostic. |
| `AuthContext` + `ProtectedRoute` | **Reuse unchanged** | No new auth surface. |
| `TenantAccessGuard` + `useTenantScope` | **Extend** | Re-enable/tune scoping when Meridian goes live; today it is retired. |
| Tenant registry (`profiles/index.ts`) | **Extend** | Flesh out `meridianProfile.ts` bundle (presentation, scenario stages, roles, guardrails). |
| Tenant tables + RLS helpers | **Reuse unchanged** | `runops_has_tenant_access` / `_can_write` / `_has_role` cover Meridian. |
| User model (`profiles`, `user_roles`, `runops_role_assignments`) | **Reuse unchanged** | Existing `runops_role` enum values map onto Epic Analyst / HIM / Clinical Informaticist. |
| Navigation sections | **Reuse unchanged** | 12 sections already fit CMDB/Runbook/Incident coverage. |
| shadcn primitives + `src/runops/components/*` | **Reuse unchanged** | Full design system in place. |
| FOC twin scene primitives (`react-three/fiber`) | **Wrap with adapter** | Reuse camera/selection/overlays; adapt scene graph for Azure region/AZ/VNet topology. |
| Semiconductor + Production + Data-Orch twins | **Reuse unchanged (reference)** | Templates only; no runtime dependency for Meridian. |
| Zustand FOC store | **Wrap with adapter** | Model Meridian twin selection state via a parallel store rather than mutating shared FOC store. |
| Context providers (Persona/Scenario/Evidence/Guided) | **Reuse unchanged** | Tenant-agnostic; Meridian scenario just adds new stage definitions. |
| `ScenarioStore` + `stageDefinitions.ts` | **Extend** | Add Meridian-specific stages (Epic go-live, cutover, PHI-safe scenarios). |
| CMDB tables (`runops_services/_components/_dependencies/_connectors`) | **Extend** | May need additional CI classes (Epic modules, Azure resources) via `models.ts` and seed data; consider migration for a CI-class column if categorization becomes structured. |
| CMDB topology page | **Reuse unchanged** | Renders whatever is in `runops_dependencies`. |
| Business Services module | **Reuse unchanged** | Epic-hosted services register as `runops_services` rows. |
| Runbook module | **Reuse unchanged** | Meridian runbooks are additional rows; existing designer/certification pipeline applies. |
| Incident Management module | **Reuse unchanged** | Add PHI-safe communication templates as data, not code. |
| Change Management (`runops_changes` + approve RPC) | **Reuse unchanged** | Change_manager role enforcement already correct. |
| Audit (`runops_audit_events` + `_domain_events` + evidence) | **Reuse unchanged** | Meridian scenarios emit into the same audit stream. |
| Digital Coworkers (workers + capabilities + sessions + tool grants) | **Extend** | Add Meridian-specific worker templates + tool grants; no schema change. |
| Integrations (`runops_connectors`, catalogs) | **Wrap with adapter** | Add an Azure/Epic adapter surface in the catalog; keep gateway calls in an Edge Function when moving beyond demo. |
| Existing Edge Functions | **Reuse unchanged** | None are tenant-specific in a way that blocks Meridian. |
| Feature flags | **Reuse unchanged** | Meridian ships under `demoMode: true`; do not flip `autonomousExecution` / `realInfrastructureActions`. |
| Epic EHR domain services (charting, orders, HIM, revenue cycle) | **Create new module** | New Meridian profile bundle: services, components, dependencies, runbooks, roles, guardrails, PHI redaction. |
| Azure CMDB CI taxonomy (subscription/RG/VNet/Region/AKS/App Service/…) | **Create new module** | New CI-class definitions + seed data + optional `models.ts` extension. |
| Meridian digital twin scene (hospital campus + Azure regions) | **Create new module** | New page under `/meridian/*` (or reused `/runops/*`) with its own three-fiber scene composed via FOC adapter. |
| Meridian scenario stages + narration | **Create new module** | Author into `stageDefinitions.ts` under a Meridian scenario id. |
| Healthcare guardrails (PHI redaction, break-glass) | **Create new module** | Guardrail definitions in the Meridian profile bundle, enforced in narration/redaction helpers. |

Nothing will be implemented from this plan — approving it simply acknowledges the inventory + reuse matrix as the baseline for the Meridian build.
