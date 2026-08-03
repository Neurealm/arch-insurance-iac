# Shared and Platform Capability Map

Stage 1 inventory of functionality that crosses module boundaries. Shared assets
listed here have **no declared owner** today; assigning one is Stage 3 work.

## Platform-owned (available to every module)

| Capability | Implementation | Notes |
|---|---|---|
| Design system / primitives | `src/components/ui/*` | shadcn components; the single largest cross-module dependency |
| Authentication | `src/context/AuthContext.tsx`, `src/components/auth/ProtectedRoute.tsx` | session, approval status, forced password change |
| Authorization | `src/platform/access/AccessContext.tsx`, `src/components/auth/PermissionRoute.tsx`, `has_permission(user, tenant, permission)` | permission-based; role-name checks are legacy |
| Tenant isolation | `src/hooks/useTenantScope.ts`, RLS on all tenant tables | |
| Audit logging | `src/platform/pages/AuditExplorer.tsx` and backing tables | |
| Notifications / toasts | `src/hooks/use-toast.ts`, sonner host | |
| Navigation shell | `src/components/eoc/Sidebar.tsx`, module layouts | hosts every module's nav group |
| Contextual Audio Enrichment | `src/platform/cae/**` | consumable by any module via `AudioEnrichmentButton` |
| Data access | `src/integrations/supabase/client.ts` | anon key only |

## Shared, owner undeclared

| Capability | Implementation | Known consumers | Proposed owner |
|---|---|---|---|
| EOC layout & chrome | `src/components/eoc/*` | SRE Practice (33 imports), Coworkers, Carve-Out, Practice Library | Platform |
| Scenario state | `src/context/ScenarioStateContext.tsx`, `src/components/scenario/*` | SRE Practice, RunOps | RunOps or Platform — decide in Stage 3 |
| Guided investigation | `src/context/GuidedInvestigationContext.tsx`, `src/components/investigation/*`, `src/data/guidedInvestigations.ts` | SRE Practice, RunOps | RunOps |
| Evidence graph | `src/context/EvidenceGraphContext.tsx`, `src/components/evidence/*`, `src/data/evidenceGraphData.ts` | SRE Practice, RunOps | RunOps |
| Persona context | `src/context/PersonaContext.tsx` | multiple | Platform |
| Commercial Guide framework | `src/features/commercial-guide/**` | Commercial only today, but framework is generic | Commercial (candidate for promotion to Platform) |

## Declaration rules

- A shared asset must name exactly one `primaryOwner` and list its `consumingModules`.
- A consuming module records the dependency in `sharedDependencies`, never in `boundaries`.
- Platform capabilities are recorded in `platformDependencies` with `owner: "platform"`.
- Two modules claiming the same asset as `module-owned` is an `ownership-conflict` finding.
