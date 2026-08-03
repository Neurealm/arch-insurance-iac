# Draft SRE Module Manifest

Implemented at `src/modules/sre/module.manifest.ts`. This document explains the
draft; the file is the source of truth.

## Identity

| Field | Value |
|---|---|
| moduleId | `sre` |
| name | SRE Practice |
| moduleVersion | 0.1.0 |
| status | `prototype` |
| businessDomain | Site Reliability Engineering |
| productOwner | `unassigned` (no owner metadata exists in the repository) |
| technicalOwner | `unassigned` |
| identificationConfidence | `medium` |

## Boundaries

- **sourcePaths** — `src/pages/prod-twin`, `src/components/sre-twin`, `src/data/sreTwinData.ts`, `src/pages/prod-twin/frictionPanelData.ts`
- **routePrefixes** — `/reliability-foundations` only; the remaining routes are flat root paths
- **routes** — 35 exact paths (see manifest)
- **navigationIds** — 25 `sre-*` keys from the `sre-practice` group
- **pageIds** — 34 page files
- **componentRefs** — `src/components/sre-twin/SRETwinSections.tsx`
- **serviceRefs / apiPrefixes / databaseEntities / workflowIds / integrationIds / aiAgentIds / automationActionIds / dashboardIds / reportIds / permissionIds** — all empty, by evidence

The empty lists are deliberate. No file under `src/pages/prod-twin/` imports the
Supabase client, no `sre.*` permission exists, and no SRE route is wrapped in
`PermissionRoute`.

## Capabilities (8)

| ID | Status | Why not `implemented` |
|---|---|---|
| `sre.operating-model-cockpit` | static | authored content in the component |
| `sre.reliability-foundations` | static | editorial reference library |
| `sre.friction-index` | mock | scores hard-coded in `frictionPanelData.ts` |
| `sre.production-digital-twin` | mock | fixture topology and signals |
| `sre.cloud-architecture-twins` | mock | `src/data/sreTwinData.ts` fixture |
| `sre.platform-and-modernization-factories` | mock | no delivery backend |
| `sre.automation-marketplace` | mock | catalogue entries are not executable |
| `sre.transformation-narrative` | static | narrative screens |

## Dependencies

- **Shared (owner undeclared)** — `src/components/eoc/*`, scenario state, guided investigation, evidence graph.
- **Platform** — `src/components/ui/*`, `ProtectedRoute`, `AccessContext`, the EOC sidebar.

## Exclusions

`src/runops`, `src/pages/coworkers/sre`, `src/pages/practice-library`, the
`/coworkers/site-reliability-engineering*` routes, the Practice Library SRE
dashboard, `/data-orchestration-twin`, and the three unnavigated
`*-twin` routes.

## Unable to verify

1. Ownership of `/data-orchestration-twin`.
2. Ownership of `/executive-service-owner-twin`, `/delivery-org-twin`, `/engagement-manager-twin`.
3. Product and technical owner of the module.
4. Whether `ModernizationRoadmap` or `ModernizationRoadmapV2` is the survivor.
