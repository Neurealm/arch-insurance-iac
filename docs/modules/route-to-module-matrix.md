# Stage 2 — Route-to-Module Matrix

Source of truth: `routeMatrix(reconcileRoutes())` in `src/modules/routeOwnership.ts`.
Viewable in the application at `/platform/modules` → **Routes**.

| Bucket | Route entries |
|---|---|
| `sre` | 35 |
| `platform` | 28 |
| `shared` | 12 |
| `unable-to-verify` | 2 |
| `unregistered` | 359 |

## Registered module: `sre`

All 35 routes matched exactly against `src/App.tsx`. No SRE route is wrapped in
`PermissionRoute`; all inherit only the application-level auth guard.

Route groups:

| Group | Routes | Capability |
|---|---|---|
| Operating model | `/sre-operating-model` | `sre.operating-model-cockpit` |
| Reliability foundations | `/reliability-foundations` + 8 descendants, `/product-reliability-anatomy` | `sre.reliability-foundations` |
| Friction index | `/operational-friction-index`, `/product-reliability-transformation-index` | `sre.friction-index` |
| Production twin | `/prod-resilience-twin`, `/product-line-map`, `/golden-workflow-map`, `/production-topology`, `/signal-intelligence` | `sre.production-digital-twin` |
| Cloud twins | `/enterprise-cloud-twin`, `/aws-resilience-architecture-twin` | `sre.cloud-architecture-twins` |
| Factories | `/platform-engineering-factory`, `/hybrid-cloud-workbench`, `/modernization-factory`, `/modernization-roadmap`, `/modernization-roadmap-v2` | `sre.platform-and-modernization-factories` |
| Automation | `/automation-marketplace`, `/ai-coworker-control-room` | `sre.automation-marketplace` |
| Transformation narrative | `/transformation-journey`, `/measuring-success`, `/cyber-resilience-overlay`, `/transition-dual-run`, `/acquisition-onboarding-factory`, `/value-creation-board`, `/interactive-demo-center` | `sre.transformation-narrative` |

## Unregistered clusters (likely future modules)

Derived from path and source-folder clustering by `buildUnregisteredReport()`.
These are **candidates**, not assignments.

| Candidate module | Unregistered items | Representative routes |
|---|---|---|
| `runops` | 169 | `/runops/*` |
| `commercial` | 99 | `/commercial/*` |
| `coworkers` | 85 | `/coworkers/*` |
| `avep` | 79 | `/avep/*` |
| `practice-library` | 65 | `/practice-library/*` |
| `sre-data-orchestration` | 64 | `/data-orchestration-twin/*` |
| `cae` | 34 | `/platform/audio` (platform-owned surface) |
| `platform` | 17 | `/platform/*` |
| unclustered | 632 | `/carve-out/*`, `/assurance/*`, `/admin/technology-taxonomy/*`, flat legacy routes |

`sre-data-orchestration` remains a separate candidate rather than part of `sre`:
it has its own nested route tree and layout, and no owner has confirmed the
relationship.
