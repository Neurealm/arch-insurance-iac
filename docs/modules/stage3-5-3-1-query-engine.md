# Stage 3.5.3.1 — Enterprise Capability Graph Query Engine

Status: complete. Source of truth for how the Capability Relationship Graph is
queried.

## What the engine is

A deterministic, strongly typed, **read-only** query surface over the Stage
3.5.2 populated graph (1,291 nodes, 889 edges, content hash `e889b604`). It adds
no visualization, no UI, no AI, no scoring model and no new facts. Every answer
it returns is already present in the graph.

Entry point: `src/modules/graph/query/`.

```ts
import { getQueryEngine } from "@/modules/graph";

const engine = getQueryEngine();
const capabilities = engine.findNodes({ nodeTypes: ["capability"], owners: ["sre"] });
```

## Guarantees

| Guarantee | How it is enforced |
| --- | --- |
| Read-only | The engine holds the graph by reference and only ever `filter`/`slice`s it. No method returns a mutable view of internal state. |
| Deterministic | Node results sort by `type` then `id`; edges by `type`, `from`, `to`, `id`; traversal by depth then node order; neighbours by edge type, target id, edge id. |
| No inference | Relationship meaning comes from a fixed `RELATIONSHIP_SEMANTICS` table, never from edge-name heuristics. |
| No invented attributes | Filters resolve through typed selectors over real schema keys. Fields with no schema backing are reported, not guessed. |
| Candidate isolation | The 4 weakly-inferred Stage 3.5.2 candidate edges are excluded from every default query and labelled `candidate: true` when explicitly requested. |

## Architecture

| File | Responsibility |
| --- | --- |
| `QueryTypes.ts` | Filter, option, error and relationship-semantics types |
| `QueryResults.ts` | The standard result envelope and its builders |
| `GraphIndexes.ts` | All indexes, built once per engine instance |
| `QueryFilters.ts` | Attribute selectors, text matching, criterion compilation |
| `GraphTraversal.ts` | Cycle-safe BFS/DFS, shortest path, simple-path enumeration |
| `GraphSearch.ts` | Deterministic ranked lexical search |
| `QueryEngine.ts` | The public `GraphQueryEngine` class |
| `LegacyGraphQuery.ts` | The Stage 3.5.1 `GraphQuery` helper, retained for existing callers |

## Indexes

Built once, in graph order, so index construction can never reorder results:

`nodeById`, `nodesByType`, `nodesByOwnership`, `nodesByModule`, `nodesByDomain`,
`nodesByCategory`, `nodesByStatus`, `nodesByRoute`, `nodesByPersona`,
`nodesByService`, `edgeById`, `edgesByType`, `outgoing`, `incoming`,
`candidateOutgoing`, `candidateIncoming`, `byNormalizedLabel`, `byToken`.

Persona and service indexes are **edge-backed**: the schema models personas and
services as nodes, so "find by persona" means "find nodes related to that
persona node", not "read a persona attribute".

## Attribute selectors

Logical query fields map onto the keys that actually exist in the graph:

| Field | Resolved from |
| --- | --- |
| `owner` | `moduleId`, `primaryOwner`, `productOwner`, `technicalOwner` |
| `application` | `moduleId`, `claimedBy` |
| `domain` | `domain`, `businessDomain`, `subdomain` |
| `category` | node `type`, `classification`, `implementationType`, `level`, `ownershipClass` |
| `status` | `status`, `implementationStatus`, `implementationClassification`, `declaredMaturity`, `maturity`, `validationState` |
| `route` | `routeRef`, route node path and label |
| `persona` | Edges incident to a `persona` node |
| `service` | Edges incident to a `service` node |
| `technology`, `tag` | **Not represented in the schema.** Filtering on them returns no results and emits an `unsupported-property` warning. |

## Query API

**Core lookups** — `getNode`, `hasNode`, `getNodes`, `getEdge`, `findByType`,
`findByOwner`, `findByDomain`, `findByCategory`, `findByStatus`,
`findByPersona`, `findByRoute`, `findByService`, `findByApplication`,
`findByLabel`.

**Composable filtering** — `findNodes(filters, options)` accepts node types,
ownership, every logical field above, free text, arbitrary property predicates
(`exact` / `iexact` / `contains` / `startsWith` / `endsWith` / `token` /
`equals`), `matchMode: "all" | "any"`, `limit` and `offset`.

**Search** — `search(term, options)` ranks matches on a fixed ladder: exact id,
exact label, prefix, token, suffix, contains, property. Ties break on node type
then node id. No fuzzy matching.

**Traversal** — `traverseFrom`, `getNeighbors`, `getChildren`, `getDescendants`,
`getAncestors`, `subgraph`. Depth-aware visitation means a depth-limited DFS
reaches exactly the same node set as a depth-limited BFS. Default `maxDepth` is
6; the hard cap is 64.

**Dependency and impact** — `getDependencies`, `getDependents`,
`getDownstreamImpact`, `getUpstreamImpact`, `findDependencyCycles`.

**Paths** — `findShortestPath`, `findAllPaths` (simple paths only, capped by
`maxPaths`, default 25).

**Candidates** — `getCandidateRelationships`, `candidateEdgesAsEdges`.

## Relationship semantics

| Relationship | Semantics | Dependency-bearing | Impact-bearing |
| --- | --- | --- | --- |
| `DEPENDS_ON` | dependency | yes | yes |
| `CONSUMES` | consumption | yes | yes |
| `USES` | dependency | yes | yes |
| `INVOKES` | dependency | yes | yes |
| `STORES` | dependency | yes | yes |
| `EXTENDS` | dependency | yes | yes |
| `IMPLEMENTS` | composition | no | yes |
| `EXPOSES` | composition | no | yes |
| `BELONGS_TO` | membership | no | yes |
| `PROVIDES` | support | no | no |
| `SECURES` | support | no | no |
| `OWNS` | ownership | no | no |
| `REFERENCES` | association | no | no |
| `REPORTS_TO` | association | no | no |
| `SHARES` | association | no | no |

Direction convention: `getDependencies` walks **outward** ("what this node
relies on"); `getDependents` and `getDownstreamImpact` walk **inward** ("what
would be affected if this node changed").

## Standard result contract

Every operation returns the same envelope:

```ts
{
  success: boolean;
  results: readonly T[];
  resultCount: number;
  totalAvailable: number;
  truncated: boolean;
  warnings: readonly QueryWarning[];
  filtersApplied?: QueryFilterSummary;
  traversal?: TraversalSummary;
  explanation?: readonly QueryMatchExplanation[];
  performance: { executionTimeMs; indexesUsed; scannedNodeCount; scannedEdgeCount };
  graph: { version; schemaVersion; generator; contentHash; nodeCount; edgeCount; candidateEdgeCount };
}
```

## Explainability

Pass `{ explain: true }` to any query. The engine then returns, per result:
which filters matched with expected and actual values, which search field and
match type produced the hit, the traversal path and distance, and the ranking
basis. Traversal results also carry a `traversal` summary listing the edge types
actually walked, depth reached and visited-node count.

## Error handling

- **Malformed query definitions** (unknown node/edge type, negative depth,
  negative limit or offset, invalid direction) throw `GraphQueryError` carrying
  a typed issue list. These are programmer errors, not data conditions.
- **Unknown start nodes** return `success: false` with an `unknown-node`
  warning; nothing is thrown.
- **No matches** is an ordinary success with an `empty-result` warning.
- **Truncation, depth limits, path limits and unsupported fields** each emit
  their own warning code. Nothing is silently dropped.

## Test coverage

`src/modules/graph/query/queryEngine.test.ts` — 55 tests across engine
construction, index integrity, determinism, core access, filters, search,
traversal, dependency and impact semantics, paths, explainability, error
handling and the result contract. Full module suite: 182/182 passing.

## Related documents

- `stage3-5-1-capability-graph.md` — schema, validator, builder
- `stage3-5-2-graph-population.md` — how the graph is populated
- `stage3-5-2-candidate-edges.md` — the held-out weakly-inferred relationships
- `stage3-5-2-query-readiness.md` — the readiness assessment this stage answers
