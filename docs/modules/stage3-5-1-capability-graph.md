# Stage 3.5.1 — Capability Relationship Graph Foundation

Status: implemented. Data model and services only — no visualization, no
application behaviour change.

The graph is the intelligence layer that Module Capability Intelligence will
query. It is *derived* from the Stage 1–3 registries and the generated route
table; nothing in it mutates or replaces those sources.

## Files

| File | Purpose |
| --- | --- |
| `src/modules/graph/types.ts` | Node schema, edge schema, endpoint policy, versioning, validation and query models |
| `src/modules/graph/validate.ts` | 13 validation rules over any graph document |
| `src/modules/graph/build.ts` | Builder projecting registries into the graph |
| `src/modules/graph/query.ts` | Read-only query API (`GraphQuery`) |
| `src/modules/graph/serialize.ts` | Deterministic serialization, hashing, versioning, diffing |
| `src/modules/graph/index.ts` | Public API surface |
| `src/modules/graph/graph.test.ts` | 26 unit tests |

## Node schema

`GRAPH_NODE_TYPES` (19): `module`, `capability`, `sub-capability`, `persona`,
`route`, `page`, `component`, `service`, `workflow`, `ai-agent`, `integration`,
`api`, `database-entity`, `dashboard`, `report`, `permission`,
`shared-capability`, `platform-capability`, `customer-extension`.

```ts
interface GraphNode {
  id: string;            // `<type>:<ref>` — stable across rebuilds
  type: GraphNodeType;
  label: string;
  description?: string;
  moduleId: string | null;   // owning module, "platform", or null
  ownership: "module-owned" | "shared" | "platform-owned" | "customer-owned" | "unassigned";
  source: "declared" | "observed" | "derived";
  confidence: ConfidenceLevel;
  filePath?: string | null;
  evidence: readonly string[];
  attributes: Record<string, string | number | boolean | null>;
}
```

`source` records provenance explicitly: `declared` came from a manifest or
registry, `observed` from a generated scan of the real application, `derived`
from builder inference. Intelligence answers can therefore state how they know
what they claim.

## Edge schema

`GRAPH_EDGE_TYPES` (15): `BELONGS_TO`, `IMPLEMENTS`, `USES`, `DEPENDS_ON`,
`CONSUMES`, `PROVIDES`, `EXPOSES`, `INVOKES`, `STORES`, `REFERENCES`, `SECURES`,
`REPORTS_TO`, `EXTENDS`, `SHARES`, `OWNS`.

Edges are directed and identified as `<from>|<TYPE>|<to>`, so the same
relationship can never be recorded twice. `EDGE_ENDPOINT_POLICY` declares which
node types each relationship may connect; the validator enforces it.

## Validation rules

| Rule | Severity |
| --- | --- |
| `duplicate-node-id` | error |
| `duplicate-edge-id` | error |
| `unknown-node-type` | error |
| `unknown-edge-type` | error |
| `dangling-edge-endpoint` | error |
| `self-referencing-edge` | error |
| `invalid-edge-endpoint-type` | error |
| `cyclic-belongs-to` | error |
| `schema-version-mismatch` | error |
| `missing-node-label` | warning |
| `capability-without-module` | warning |
| `shared-capability-without-owner` | warning |
| `orphan-node` | info |

Validation never throws and never blocks a build. Errors mean the graph is
structurally unsound; warnings and info are modelling gaps for a human.

## Builder

`buildCapabilityGraph(input?)` projects:

- module manifests → module, capability, route, page, component, service, api,
  workflow, agent, integration, database-entity, dashboard, report, permission
  and persona nodes plus their containment, exposure and dependency edges;
- the shared capability registry → `shared-capability` nodes, `OWNS` from the
  primary owner and `CONSUMES` from every consumer;
- the platform capability registry → `platform-capability` nodes and `CONSUMES`
  from every consuming module;
- capability hierarchies → `sub-capability` containment plus `EXTENDS` lineage
  back to the Stage 1 capability each node supersedes;
- the generated route table → observed page backing and route permissions.

The builder is pure and deterministic; `getCapabilityGraph()` memoizes it.

Current output from the live registries (SRE is the only fully registered
module): **199 nodes, 460 edges**, 0 validation errors, 5 warnings, 1 info.
`customer-extension` nodes are supported by the schema but not yet emitted —
no customer-specific implementation has been registered.

## Query API

```ts
const q = queryGraph(getCapabilityGraph());

q.node(id);
q.nodes({ types, moduleIds, ownership, sources, search });
q.nodesByType("capability");
q.edges("out", id, ["DEPENDS_ON"]);
q.neighbors(id, { direction, edgeTypes, nodeTypes });
q.traverse(id, { direction, edgeTypes, maxDepth, includeStart });
q.path(fromId, toId);
q.subgraph([id], { maxDepth: 2 });
q.parentOf(id); q.childrenOf(id);
q.dependenciesOf(id); q.dependentsOf(id);   // impact analysis
q.hotspots(10); q.stats();
```

All methods are pure and return new arrays. Indexes are built once per
`GraphQuery` instance.

## Serialization and versioning

`serializeGraph` emits key-sorted, node/edge-sorted JSON, so identical content
always produces identical bytes. `computeGraphHash` (FNV-1a, dependency free)
hashes nodes and edges only — `generatedAt` is deliberately excluded so
rebuilding an unchanged codebase is not seen as a change.

`nextGraphVersion(nodes, edges, { generator, previous })` advances the integer
version only when the content hash changes and records `previousContentHash`.

`deserializeGraph(json)` rejects an unsupported schema version, a structurally
invalid document, or a content hash that does not match the payload.

`diffGraphs(before, after)` returns added, removed and modified node IDs and
added/removed edge IDs.

## Guarantees

- No existing file was modified; the graph layer is additive.
- No React, DOM, network or database access anywhere in `src/modules/graph/`.
- 26 unit tests cover schema completeness, every validation rule, builder
  determinism, the query API and serialization round-tripping.
