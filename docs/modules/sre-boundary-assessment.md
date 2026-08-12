# SRE Module Boundary Assessment

Module: **SRE Practice** (`moduleId: "sre"`).
Scope confirmed with the product owner: the "Site Resilience Engineering"
navigation group in `src/components/eoc/Sidebar.tsx` (25 entries), implemented
under `src/pages/prod-twin/`.

## 1. SRE-owned

| Item | Evidence |
|---|---|
| 34 page components | `src/pages/prod-twin/*.tsx` reachable from the `sre-practice` nav group |
| 35 routes | `src/App.tsx` lines 639–706 |
| `SRETwinSections.tsx` | `src/components/sre-twin/`; imported only by `AWSResilienceArchitectureTwin.tsx` |
| `src/data/sreTwinData.ts` | imported only by `AWSResilienceArchitectureTwin.tsx` |
| `src/pages/prod-twin/frictionPanelData.ts` | local fixture for the friction index |

## 2. Shared (used by SRE and at least one other module)

| Item | Evidence | Declared owner |
|---|---|---|
| `src/components/eoc/*` | 33 import sites in `src/pages/prod-twin/`; also imported by other page areas including the sidebar itself | none — conflict |
| `src/context/ScenarioStateContext` + `src/components/scenario` | `/enterprise-cloud-twin` is wrapped in `ScenarioStateProvider` in `src/App.tsx` | none — conflict |
| `src/context/GuidedInvestigationContext` + `src/components/investigation` | one import from prod-twin; also used by RunOps investigation screens | none — conflict |
| `src/context/EvidenceGraphContext` + `src/components/evidence` | one import from prod-twin | none — conflict |

## 3. Platform-owned

| Item | Evidence |
|---|---|
| `src/components/ui/*` | 172 import sites in `src/pages/prod-twin/` |
| `src/components/auth/ProtectedRoute.tsx`, `PermissionRoute.tsx` | applied at shell level; **not** applied to any SRE route |
| `src/platform/access/AccessContext.tsx` | tenant + permission resolution |
| `src/components/eoc/Sidebar.tsx` | hosts the `sre-practice` navigation group |
| Supabase client, toasts, routing | `src/integrations/supabase/client.ts`, `src/hooks/use-toast.ts` |

## 4. Verified non-findings

These were searched for and **do not exist**; they must not appear in the manifest.

- **Database entities** — no file under `src/pages/prod-twin/` imports `@/integrations/supabase/*`.
- **Services / APIs / edge functions** — none referenced from the SRE surface.
- **Workflows, integrations, AI agents, automation actions** — no registry or execution path exists for the SRE screens. The "Automation Marketplace" and "AI Coworker Control Room" screens render catalogue content only.
- **Permissions** — no `sre.*` permission code exists; no SRE route is wrapped in `PermissionRoute`.

Consequently every SRE capability is declared `mock` or `static`. None is
`implemented`, and the validator enforces this: a capability cannot claim
`implemented` without a service, API or entity reference.

## 5. Unclear / unable to verify

- `/data-orchestration-twin` — labelled "SRE Data Orchestration" in navigation but implemented as an independent nested route tree with its own layout.
- `/executive-service-owner-twin`, `/delivery-org-twin`, `/engagement-manager-twin` — registered routes whose page files sit in `src/pages/prod-twin/` but which appear in no navigation group. Excluded from the SRE boundary pending an owner decision.
- Product and technical owner of the module — no owner metadata exists anywhere in the repository; both fields are `"unassigned"`.
- Whether `ModernizationRoadmap` or `ModernizationRoadmapV2` is the intended survivor.

## 6. Declared capabilities

| Capability ID | Status | Routes |
|---|---|---|
| `sre.operating-model-cockpit` | static | 1 |
| `sre.reliability-foundations` | static | 10 |
| `sre.friction-index` | mock | 2 (duplicate surface) |
| `sre.production-digital-twin` | mock | 5 |
| `sre.cloud-architecture-twins` | mock | 2 |
| `sre.platform-and-modernization-factories` | mock | 5 |
| `sre.automation-marketplace` | mock | 2 |
| `sre.transformation-narrative` | static | 8 |
