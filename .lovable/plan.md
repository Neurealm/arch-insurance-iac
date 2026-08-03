# Module Registration & Boundary Framework — Assessment and Implementation Plan

Scope of this step: architecture assessment plus a staged plan. No application code changes yet.
First registered module: **SRE Practice** (the "Site Resilience Engineering" navigation group, implemented under `src/pages/prod-twin/`).

## 1. Current-state module map (verified by inspection)

| Apparent module | Source | Route surface | Confidence |
|---|---|---|---|
| Commercial Digital Twin | `src/commercial/**` | `/commercial/*` | High — dedicated tree, layout, hooks, `commercial_*` tables, `commercial.*` permissions |
| Platform Administration | `src/platform/**` | `/platform/*` | High — layout, AccessContext, permission model |
| Contextual Audio Enrichment | `src/platform/cae/**` | `/platform/audio` | High — `audio_*` tables, permission codes |
| RunOps (S.E.A.D.) | `src/runops/**` | `/runops/*` | High — own shell, providers, domain layer |
| AVEP / Silicon | `src/avep/**`, `src/silicon/**` | `/ai-vlsi-engineering/*` | High — own shell, canonical data, build manifest |
| SRE Practice | `src/pages/prod-twin/**` | ~25 flat top-level routes | Medium — coherent nav group, but folder name (`prod-twin`) does not match the module name and routes are unnamespaced |
| Practice Library | `src/pages/practice-library/**` | `/practice-library/*` | Medium |
| Digital Coworkers | `src/pages/coworkers/**` | `/coworkers/*` | Medium — includes an SRE coworker area distinct from SRE Practice |
| Carve-Out / ETDM / CRM / Questionnaires | `src/pages/*`, `src/hooks/*` | mixed | Low — folder-driven grouping only |
| SRE Data Orchestration | `/data-orchestration-twin` subtree | nested routes | Low — sits inside the SRE nav region but is a separate twin |

Folder names and nav labels were treated as hints only; classification is based on route registration in `src/App.tsx`, import graphs, and data access.

## 2. SRE boundary assessment (evidence)

**SRE-owned**
- Pages: 38 files in `src/pages/prod-twin/`, of which ~25 are reachable from the `sre-practice` nav group in `src/components/eoc/Sidebar.tsx` (lines ~69–105).
- Routes: `/operational-friction-index`, `/reliability-foundations` + 8 descendants, `/product-reliability-anatomy`, `/transformation-journey`, `/measuring-success`, `/prod-resilience-twin`, `/product-line-map`, `/golden-workflow-map`, `/production-topology`, `/sre-operating-model`, `/signal-intelligence`, `/enterprise-cloud-twin`, `/aws-resilience-architecture-twin`, `/platform-engineering-factory`, `/hybrid-cloud-workbench`, `/automation-marketplace`, `/modernization-factory`, `/cyber-resilience-overlay`, `/ai-coworker-control-room`, `/transition-dual-run`, `/acquisition-onboarding-factory`, `/value-creation-board`, `/modernization-roadmap`, `/modernization-roadmap-v2`, `/interactive-demo-center`.
- Components/data: `src/components/sre-twin/SRETwinSections.tsx` and `src/data/sreTwinData.ts`, each imported by exactly one page (`AWSResilienceArchitectureTwin.tsx`).
- Local data: `src/pages/prod-twin/frictionPanelData.ts`.

**Shared**
- `src/components/eoc/*` — 33 imports from prod-twin pages, also used by other page areas.
- `src/context/ScenarioStateContext`, `GuidedInvestigationContext`, `EvidenceGraphContext` with `src/components/scenario|investigation|evidence`.

**Platform-owned**
- `src/components/ui/*` (172 imports), routing/auth (`ProtectedRoute`, `PermissionRoute`), `AccessContext`, Supabase client, toasts.

**Unclear / unable to verify**
- Whether `/data-orchestration-twin` belongs to SRE or is a peer module.
- Ownership of prod-twin files with no nav entry (e.g. `DeliveryOrgTwin`, `ExecutiveServiceOwnerTwin`, `EngagementManagerTwin`, `ModernizationRoadmapV2`) — route presence to be confirmed file-by-file during Stage 1.

**Explicit non-findings (must not be invented)**
- No Supabase usage anywhere under `src/pages/prod-twin/` — there are **no** SRE database entities, services, APIs, edge functions, workflows, integrations, or AI agents.
- No `sre.*` permission codes exist; SRE routes are not wrapped in `PermissionRoute`.
- Every SRE capability is therefore `mock` or `static` status in the draft manifest.

## 3. Architectural issues found

1. Naming mismatch: module "Site Resilience Engineering" / "SRE Practice" implemented in `src/pages/prod-twin/`.
2. Flat, unnamespaced routes (`/sre-operating-model`, `/signal-intelligence`) — no `/sre` prefix, so route-based ownership cannot be derived.
3. Duplicate capability: `/operational-friction-index` and `/product-reliability-transformation-index` render the same `OperationalFrictionIndex` component.
4. Duplicate nav labels: two "Modernization Roadmap" entries (`sre-mrm`, `sre-mrm2`).
5. Shared contexts and `components/eoc` have no declared owner.
6. Probable orphaned pages in `prod-twin` (no nav entry).
7. No RBAC coverage for the SRE surface.
8. `src/App.tsx` is a single ~900-line route registry with no module segmentation.

## 4. Proposed framework

Manifest-first, move-nothing-yet:

```text
src/modules/{module-id}/module.manifest.ts   <- new, declarative only
src/modules/registry.ts                      <- discovery + validation + runtime registry
src/modules/types.ts                         <- schema types
```

Manifests reference existing files by path; no page or component is relocated in Stages 1–3.

**Manifest schema** (`src/modules/types.ts`): `schemaVersion`, identity (`moduleId`, `name`, `description`, `version`, `status`, `domain`, `productOwner`, `technicalOwner`), `boundaries` (sourcePaths, routePrefixes, routes, navIds, pageIds, components, services, apiPrefixes, entities, workflowIds, integrationIds, agentIds, automationActionIds, dashboardIds, reportIds, permissionIds), `capabilities[]` (id, name, description, domain, subdomain, businessPurpose, primaryPersona, secondaryPersonas, `implementationStatus: 'implemented' | 'partial' | 'mock' | 'static' | 'planned'`, related refs, evidence hints, dependencies, knownLimitations), `ownership` (`module-owned` / `shared` / `platform-owned`, with `primaryOwner`, `consumers[]`, `relationship`), `dependsOn` (shared + platform), and `exclusions` (paths, routes, components, capabilities, entities, workflows, integrations, agents, permissions). All read-only (`as const` friendly), no runtime side effects.

**Discovery**: `import.meta.glob('/src/modules/**/module.manifest.ts', { eager: true })` — Vite-native, no build step, no second hand-maintained list. Registry exposes `getModules()`, `getModule(id)`, `resolveRouteOwner(path)`, `getCapabilities()`, and a `validateRegistry()` report for a future Module Capability Intelligence consumer.

**Validation rules** → findings classified `valid | warning | error | ownership-conflict | missing-reference | unable-to-verify`:
duplicate module IDs (error), duplicate capability IDs (error), route claimed by two modules (ownership-conflict), route in manifest but absent from `App.tsx` (missing-reference), source path not on disk (missing-reference), entity/workflow/permission ID not resolvable (unable-to-verify), item both included and excluded (error), shared capability without primary owner (ownership-conflict), module without owners or capabilities (warning), implementation present but unregistered (warning).

## 5. Documents produced in Stage 1

Under `docs/modules/`: `module-map.md`, `sre-boundary-assessment.md`, `shared-and-platform-capability-map.md`, `ownership-conflicts.md`, `manifest-schema.md`, `discovery-architecture.md`, `validation-rules.md`, `sre-manifest-draft.md`, `migration-plan.md`, `risks-and-safeguards.md`.

## 6. Implementation sequence

**Stage 1 — foundation (no behaviour change)**
- `src/modules/types.ts`, `src/modules/validate.ts`, `src/modules/registry.ts`
- `src/modules/sre/module.manifest.ts` (SRE, evidence-backed, every capability marked `mock`/`static`)
- `src/modules/registry.test.ts` — schema, duplicate-ID, exclusion-conflict, route-ownership tests
- The ten documents above

**Stage 2 — discovery and reporting**
- Glob-based auto-discovery, ownership-conflict detection, unregistered-implementation report (routes in `App.tsx` claimed by no manifest), optional dev-only `/platform/modules` diagnostics view.

**Stage 3 — coverage**
- Manifests for Commercial, Platform, CAE, RunOps, AVEP, Practice Library, Coworkers; shared-capability and platform-capability registries; governance docs for adding a module.

**Stage 4 — Module Capability Intelligence**
- Inventory snapshots, visualisations, benchmark comparison, gap analysis (separate build request).

## 7. Risks and safeguards

- *Manifest drift* → validation tests run in the existing vitest suite; missing references fail CI.
- *Scope creep into file moves* → Stages 1–3 are additive only; `src/App.tsx` and all SRE pages remain untouched.
- *Over-claiming maturity* → status enum plus a rule that any capability with no service/entity reference cannot be `implemented`.
- *Bundle impact* → registry is data-only, no page imports; tree-shakeable and dev-gated where possible.

## 8. Files created in Stage 1

Created: `src/modules/types.ts`, `src/modules/validate.ts`, `src/modules/registry.ts`, `src/modules/registry.test.ts`, `src/modules/sre/module.manifest.ts`, plus the ten `docs/modules/*.md` files.
Modified: none.
