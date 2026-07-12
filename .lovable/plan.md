# Pre-Implementation Readiness Assessment — Meridian University Epic EHR Azure CMDB Digital Twin

Strictly read-only. No code, schema, policy, route, config, dependency, or UI changes. Deliverable is a written assessment only.

## Scope

Assess whether the Neugain.io (Pre-Sales PRD) project is ready to host a new tenant-scoped Digital Twin for Meridian University (Epic EHR on Azure, CMDB-driven) alongside the existing Contoso / Atlas / Apex / semiconductor twins, without disturbing anything already shipped.

## Assessment passes (all read-only)

### 1. Build & tooling baseline
- Confirm `bun run build`, `tsgo --noEmit`, `eslint`, and `vitest` current status.
- Record any pre-existing warnings/errors that would otherwise be blamed on the new work.
- Confirm dev server, preview URL, console, and network are clean at baseline.

### 2. Recent security repair state
- Re-verify the RLS helper grant matrix (`is_platform_admin`, `runops_has_tenant_access`, `runops_can_write` executable to `authenticated`; others locked down).
- Confirm no lingering 403s on `profiles` / `user_roles`.
- Confirm mutation RPCs still service-role only.

### 3. Multi-tenant architecture fit
Inspect the seams the new twin must plug into:
- `src/runops/profiles/**` — `TenantPresentationProfile` / `TenantOperationalProfile` shape, `contosoProfile` as reference, `presentation.ts`, `validate.ts`, `index.ts` registry.
- `src/runops/providers/OperationsProvider.ts` + `ConnectedOperationsProvider.ts` — tenant selection, `setTenant`, cache invalidation, drawer/stage/role reload contract from `.lovable/plan.md`.
- `src/runops/scenario/*` — stage definitions, ScenarioStore, industry guardrails.
- `src/runops/search/searchCatalog.ts`, `src/runops/nova/askNovaEngine.ts`, `src/runops/shell/*` — global search, Nova, speech scoping.
- `src/hooks/useTenantScope.ts`, `src/components/auth/TenantAccessGuard.tsx`, `src/runops/shell/routes.ts` — route allow-listing for a new tenant/tool.
- Query-key convention in `src/runops/domain/queryKeys.ts` (must accept `selectedTenantId`).

### 4. Domain-specific readiness (Epic EHR / Azure CMDB / Higher-Ed Health System)
- Confirm healthcare guardrails already encoded (no autonomous med-order changes, no PHI in narration) per plan.md Pass 3, and whether they generalize or need a Meridian-scoped variant.
- Inventory Azure-flavored primitives available (existing `foc-twin`, `sre-twin`, `prod-twin`, `data-orchestration-twin`, `semiconductor` twins) — identify which is the closest architectural template for CMDB + EHR topology.
- Check for existing CMDB/CI modeling constructs (`src/data/**`, `src/runops/domain/models.ts`) vs. what an Epic-on-Azure CMDB twin needs (CI classes, relationships, environments, change/incident linkage).
- Identify whether Meridian's role set (e.g., Epic Analyst, HIM, Clinical Informaticist, Azure Platform Eng, HIPAA Compliance) requires new `app_role` enum values or maps onto existing `runops_has_role` roles.

### 5. Database & RLS readiness
- Enumerate current `runops_*` tables via `supabase--read_query` (read-only) and confirm every table is `tenant_id`-scoped.
- Confirm `runops_has_tenant_access` / `runops_can_write` / `runops_has_role` are the only helpers needed for a new tenant's tables — no new helper functions required.
- Identify whether a new Meridian tenant row + membership seed is the only data prerequisite, or whether additional CI/CMDB tables would need to be introduced later.

### 6. Routing / navigation surface
- Map where a new `/meridian` (or equivalent) route tree would attach, given `TenantAccessGuard` allow-list and `RunOpsLayout` sidebar.
- Confirm no existing route collides with expected Meridian paths.
- Confirm tenant switcher (`setTenant`) contract will handle a fifth profile without code changes to the switcher itself.

### 7. Design system readiness
- Confirm semantic tokens in `index.css` + `tailwind.config.ts` are sufficient (no hardcoded colors needed for a healthcare-blue accent).
- Confirm shadcn variant surface (buttons, cards, badges, tabs, drawers) already covers CMDB explorer / topology / change-mgmt patterns used by other twins.

### 8. Risk register
- Cross-tenant leakage risk if new profile forgets `selectedTenantId` in a query key.
- PHI narration risk in Nova / speech providers if healthcare guardrail isn't reapplied per-tenant.
- Role-escalation risk if new Meridian roles are added to `profiles` instead of `user_roles`.
- Feature-flag posture: `defaultFeatureFlags` must remain `demoMode: true, connectedMode: false` for the new twin.
- Any pre-existing 791 eslint errors that could mask new regressions.

## Deliverable

A single markdown report covering, for each pass above:
- What was inspected (files, tables, RPCs).
- Green / yellow / red status.
- Concrete prerequisites the Meridian twin build will need to satisfy (profile file, registry entry, route allow-list entry, sidebar entry, scenario stages, guardrails, roles, tenant seed).
- Explicit list of things NOT ready and would require follow-up work before implementation begins.
- Explicit confirmation that nothing was modified.

No code, schema, or configuration changes will be produced by this pass.
