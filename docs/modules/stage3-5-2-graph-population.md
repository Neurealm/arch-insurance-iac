# Stage 3.5.2 — Capability Graph Population

Status: complete. Source of truth for how the Capability Relationship Graph is
populated from the Stage 1–3 registries.

## What population does

Stage 3.5.1 defined the graph schema, builder, validator and query API. Stage
3.5.2 fills that graph with the real architecture of Neugain.io. Population is a
pure projection: it reads registries, manifests, generated inventories and
evidence records, and produces nodes and edges. It never mutates a source, never
touches the database, and never changes application behaviour.

Entry point: `populateCapabilityGraph()` in `src/modules/graph/populate.ts`.

```ts
const { graph, candidateEdges, sources } = populateCapabilityGraph();
```

## Source layers, in precedence order

| Layer | Source | Fact class |
| --- | --- | --- |
| 1 | Module manifests (`src/modules/*/module.manifest.ts`) | declared |
| 2 | Shared capability registry | declared |
| 3 | Platform capability registry | declared |
| 4 | SRE capability hierarchy | declared |
| 5 | Generated route table (`src/modules/generated/routeTable.ts`) | deterministically discovered |
| 6 | Implementation inventory (`src/modules/generated/implementationInventory.ts`) | deterministically discovered |
| 7 | SRE evidence records (`src/modules/sre/evidence.generated.ts`) | deterministically discovered |
| 8 | Observed domain signals (`src/modules/generated/domainSignals.ts`) | deterministically discovered (entities, edge functions) / weakly inferred (agents, workflows, integrations) |
| 9 | Unregistered classification (Stage 3) | weakly inferred |

A declared fact always wins over a discovered one. A discovered fact always wins
over an inferred one. Inferred facts never enter the graph at all — they are
returned separately as candidate edges.

## Node identity

Node IDs are content addressed as `<type>:<ref>`:

- `module:sre`
- `capability:sre.production-digital-twin`
- `route:/operational-friction-index`
- `page:src/pages/prod-twin/ProdResilienceTwin.tsx`
- `database-entity:commercial_scenarios`
- `permission:platform.admin`

Nothing is positional, so two runs against the same sources produce byte-identical
IDs, ordering and content hash. Rebuilds are safe and diffable.

## Relationship population rules

| Relationship | Populated from |
| --- | --- |
| `BELONGS_TO` | Capability hierarchy, manifest capability lists, module boundary membership |
| `IMPLEMENTS` | Manifest `relatedPages` / `relatedComponents` / `relatedServices` / `relatedRoutes` |
| `EXPOSES` | Module and capability route ownership from the route table |
| `REFERENCES` | Route → page rendering, page → page module imports |
| `USES` | Traced imports from SRE evidence records (page → component/service) |
| `CONSUMES` | Manifest shared and platform dependencies |
| `DEPENDS_ON` | Declared capability dependencies |
| `PROVIDES` / `SHARES` | Shared capability registry ownership |
| `STORES` | Observed Supabase table usage inside a module source boundary |
| `SECURES` | Manifest permission declarations against routes and entities |
| `EXTENDS` | Customer-specific implementation classified in Stage 3 |
| `OWNS` | Module and platform ownership of shared assets |

## Provenance

Every node and every edge carries the same provenance envelope in its attributes:

- `sourceType` — which registry, manifest, inventory or scan produced the fact
- `sourceId` / `sourcePath` — the exact record or file
- `evidenceMethod` — how the fact was determined
- `evidenceClassification` — `declared` | `deterministically-discovered` | `weakly-inferred`
- `evidenceStrength` — `database-backed` | `client-side-functional` | `static-data` | `visual-only` | `not-assessed`
- `validationState` — `validated` | `unverified` | `conflicting`

No fact enters the graph without provenance. Assertions the framework cannot back
with a source are excluded by construction.

## Honest reporting rules

The population layer never inflates the architecture:

- Mock, static or prototype implementation is labelled as such and is never
  promoted to operational implementation.
- Platform chrome (app shell, design system, utilities) is never counted as
  module-owned capability evidence.
- Unregistered implementation is represented as unassigned, not silently
  attributed to the nearest module.
- Ownership conflicts are reported, never auto-resolved.

## Current output

| Metric | Value |
| --- | --- |
| Nodes | 1,291 |
| Edges | 889 |
| Candidate edges (held out) | 4 |
| Validation errors | 0 |
| Ownership conflicts | 0 |
| Content hash | `e889b604` |

See `graph-statistics.json` for the machine-readable profile.

## Related documents

- `stage3-5-1-capability-graph.md` — schema, validator, query API
- `stage3-5-2-graph-statistics.md`
- `stage3-5-2-graph-reconciliation.md`
- `stage3-5-2-graph-orphan-analysis.md`
- `stage3-5-2-candidate-edges.md`
- `stage3-5-2-sre-graph-slice.md`
- `stage3-5-2-graph-validation.md`
- `stage3-5-2-query-readiness.md`
