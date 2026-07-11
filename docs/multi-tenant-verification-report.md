# NOVA RunOps — Multi-Tenant Verification & Hardening Report

_Static audit + code-trace verification. No browser testing was run in this pass (per request)._

## Profiles verified

| Tenant                        | Industry profile     | Status |
|-------------------------------|----------------------|--------|
| tenant-contoso                | generic-enterprise   | Reference tenant, unchanged |
| tenant-healthcare-amc         | healthcare-amc       | Wired, guardrails present |
| tenant-saas-production        | saas-production      | Wired, guardrails present |
| tenant-chip-manufacturing     | chip-manufacturing   | Wired, guardrails present |

## Routes audited

All 40 `/runops/**` routes registered in `src/runops/shell/routes.ts`. Every page consumes `useOperations()` and reads tenant-scoped collections from `OperationsState`. No page imports a tenant profile fixture directly (`rg` verified against `src/runops/profiles/*Profile.ts` outside the profiles directory returns zero hits).

## Stories traced (code-only, no live run)

Traced through profile bundles and scenario stages:

- Healthcare AMC — INC-HC-2407 / RB-HC-014 / CHG-HC-3312 / PM-HC-2407: all 22 story steps reachable through `bundle.scenarioStages`, `bundle.primaryIncident/Execution/Approval/Runbook`, and hard controls in `industryProfiles.ts:150-157` (PHI, medication-admin, patient-safety guardrails immutable).
- SaaS Production — INC-SAAS-8842 / RB-SAAS-042: 20 steps reachable; hard-freeze guardrails at `industryProfiles.ts:301-306`.
- Chip Manufacturing — INC-FAB-7712 / RB-FAB-207 / CHG-FAB-3317: 22 steps reachable; recipe/interlock/lot/chamber-release guardrails at `industryProfiles.ts:438-444`.

## Defects fixed in this pass

| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 1 | P0 | `src/runops/search/searchCatalog.ts` | Search catalog imported `runbooksList`, `executionsList`, `changesList`, `problemsList`, `slos`, `connectors`, `knowledgeItems`, `evidenceItems` from the global Contoso `data/scenario` module, so the command palette returned Contoso records under every tenant. | Read exclusively from tenant-scoped `ops.*` collections. Cross-tenant leak eliminated. |
| 2 | P0 | `src/runops/shell/AskNovaPanel.tsx` | Conversation turns from the previous tenant remained visible after switching tenants, even though the underlying answer engine already read tenant-scoped state. | Clear `turns` and reset the sequence counter on `ops.tenant.id` change. |
| 3 | P0 | `src/runops/state/RunOpsProviders.tsx` (RightDrawerProvider) | `setTenant` dispatched `runops:tenant-changed` but no listener existed, so an entity drawer opened for tenant A stayed open and rendered its stale payload after switching to tenant B. | RightDrawerProvider now subscribes to the tenant-changed event and closes+clears its payload. |
| 4 | P0 | `src/runops/shell/RunOpsLayout.tsx` | Detail routes (`/runops/runbooks/:id`, `/runops/services/:id`, `/runops/executions/:id`, `/runops/workers/:id/*`, `/runops/incidents/:id`) could silently render the bundle's first record when the URL entity id did not exist in the newly-selected tenant. | Added `useTenantRouteEqualizer()` hook mounted in Shell that redirects to the nearest section landing when the URL entity id is not in the current tenant's collection. |
| 5 | P1 | `src/runops/pages/ExecutionSecurity.tsx` | Identity registry was Contoso-only (`tenantRef: "tenant-contoso"` on every seed row) and rendered without filtering by the active tenant, showing Contoso identities under Meridian / AtlasCloud / Apex Fab. | Filtered identities and summary counts by `ops.tenant.id`. Non-Contoso tenants now show an empty identity registry until provisioned (documented as simulated data). |

Type-check: `tsgo --noEmit` clean after all fixes.

## Defects surfaced but deferred (with rationale)

| # | Severity | Ref | Rationale for deferral |
|---|----------|-----|----------------------|
| A | P1 | `IntegrationHub.tsx:233` — hardcoded `cisco-nx-fabric` connector | Tenant-invariant platform connector by design. No leak: it is not a per-tenant record. Left in place; if this must vary per industry, moving it into `industryProfiles.ts` is a small follow-up. |
| B | P1 | Dual context surface in `RunOpsProviders.tsx:157` vs `providers/OperationsProvider.ts:87` | Both are wired and functioning; consolidating requires touching the formal-provider adapter and its unsafe casts. Larger refactor than a hardening pass. |
| C | P1 | Grants / sessions / breakglass / secrets registries inside `ExecutionSecurity.tsx` | Same Contoso-only seed pattern as identities. Fixing correctly requires expanding the seed to a per-tenant catalog rather than a filter (there is nothing to filter for non-Contoso tenants today). Recommend adding per-tenant security fixtures in a follow-up. |
| D | P2 | Missing `no-restricted-imports` ESLint rule blocking `@/runops/profiles/*Profile` from non-profile code | Nice-to-have guardrail; audit found zero current violations. |
| E | P2 | `queryKeys.ts` factory is defined but unused | Inert. If React Query is wired later, `tenantId` must be a mandatory first segment. |
| F | P2 | Role revalidation on `setTenant` | Roles (`demoRoles` in `data/scenario.ts`) are tenant-invariant, so no revalidation is needed under the current model. Add if per-industry role catalogs are introduced. |

## Cross-tenant security summary

Post-fix isolation matrix (static verification):

| Surface | Isolation source | Status |
|---------|------------------|--------|
| Service portfolio / topology / observability | `ops.services`, `ops.components` from `getTenantBundle(tenant.id)` | Isolated |
| Runbook library / detail / designer | `ops.runbooks` | Isolated |
| Incident / investigation / hypotheses / remediation | `ops.incident` + `ops.problems` from bundle | Isolated |
| Executions / approvals / evidence | `ops.executions`, `ops.evidenceItems` | Isolated |
| Digital workers / studio / collaboration | `ops.digitalWorkers` | Isolated |
| SLOs / error budgets / analytics | `ops.slos` | Isolated |
| Knowledge base | `ops.knowledgeItems` | Isolated |
| Command palette (⌘K) | Now sourced entirely from `ops.*` | **Fixed** |
| Ask NOVA panel | Tenant-scoped ops + turns cleared on switch | **Fixed** |
| Right drawer | Cleared on tenant-changed event | **Fixed** |
| Entity URL params | Route equalizer redirects on invalid id | **Fixed** |
| Execution Security identities | Filtered by `ops.tenant.id` | **Fixed** (empty for non-Contoso until seeded) |
| Row-level security (Supabase) | `runops_has_tenant_access`, `runops_can_write`, `runops_has_role` on every mutation RPC and table policy | Verified (unchanged) |

## Simulated integrations (labeled synthetic)

All connectors in every profile carry `simulated` / `synthetic` labels enforced by `profiles/validate.ts:79-98`. Sample list per tenant is available on the Tenant Profile Manager page.

## Production work still required

- Per-tenant seed data for security registries (identities, grants, sessions, break-glass, secrets, command policies).
- Per-tenant integration-hub connector catalog if platform connectors need to vary by industry.
- Live speech / TTS wiring — no `SpeechProvider` currently exists in `src/runops/**`; narration is text-only today.
- React Query wiring: if introduced, `tenantId` must be the first segment of every `queryKey`.
- Server-side enforcement of industry hard guardrails via edge functions (today the guardrails are enforced client-side and by RLS role checks; recipe-change / interlock / lot-release actions should have dedicated policy-decision RPCs before real integration).
- ESLint `no-restricted-imports` rule preventing direct profile-fixture imports outside `src/runops/profiles/**`.

## Test posture

- Static verification: `rg`-based passes across pages, shell, providers, profiles, and search.
- Type-check: `tsgo --noEmit` clean.
- No browser tests run in this pass (per request). Story dry-runs were traced through code and profile bundle contents.
