# Stage 3.5.3.2 — Enterprise Graph Reasoning and Analysis Engine

Location: `src/modules/graph/reasoning/`
Generator: `src/modules/graph/reasoning@1.0.0`
Graph analysed: Stage 3.5.2 populated graph — **1,291 nodes, 889 edges, content hash `e889b604`**

This stage builds *on top of* the Stage 3.5.3.1 query engine. It adds no new
graph state, no new edges, no LLMs, no embeddings and no statistical inference.
Every conclusion is derived deterministically from declared, observed or
explicitly-labelled candidate facts, and every conclusion carries its evidence.

---

## 1. Design rules

1. **Read-only.** The reasoning layer never mutates the graph. A test asserts
   the content hash and node count are unchanged after running every analysis.
2. **No duplication of traversal.** Impact, chains and lineage call the Stage
   3.5.3.1 engine (`getDownstreamImpact`, `getDependencies`, `traverseFrom`).
   Only whole-graph algorithms the query engine does not own — Tarjan SCC and
   degree/reach scoring — are implemented here, over dependency edges taken from
   the query engine's own edge set.
3. **Determinism.** Every result set is totally ordered by an explicit
   comparator ending in the node or edge id. Repeated runs and independently
   constructed engines return byte-identical ordering.
4. **Confidence is derived, never asserted.** The confidence of a conclusion is
   the *weakest* confidence on its evidence chain (nodes and edges), downgraded
   one step whenever a candidate relationship contributed.
5. **Candidate relationships are opt-in.** They are excluded from every default
   analysis. When `includeCandidateRelationships: true` is passed, the result
   sets `candidateRelationshipsIncluded` and emits a
   `candidate-relationships-included` warning.
6. **Absence is a first-class fact.** Coverage analysis reports missing
   relationships as `absence` evidence, and distinguishes gaps that are expected
   by design (personas, permissions, catch-all routes) from real defects.

## 2. Standard reasoning contract

Every analysis returns `ReasoningResult<T>`:

| Field | Meaning |
| --- | --- |
| `success` | `false` only for invalid input (e.g. unknown node) |
| `analysis` | one of the ten analysis ids |
| `generator` | `src/modules/graph/reasoning@1.0.0` |
| `subject` | node or module the analysis was scoped to, or `null` for whole-graph |
| `results` / `resultCount` | the typed records |
| `findings` | severity-graded conclusions with structured evidence |
| `recommendations` | deterministic, prioritised actions (P1/P2/P3) |
| `warnings` | `unknown-node`, `empty-result`, `candidate-relationships-included`, … |
| `candidateRelationshipsIncluded` | whether weak edges were followed |
| `confidence` | derived confidence for the analysis as a whole |
| `performance` | execution time, indexes used, nodes/edges scanned |
| `graph` | version, schema version, generator, content hash, counts |

A no-match analysis is an ordinary success carrying an `empty-result` warning.

## 3. Analyses

| Analysis | Entry point | Record type |
| --- | --- | --- |
| Upstream / downstream impact | `impact`, `downstreamImpact`, `upstreamImpact` | `ImpactedNodeRecord` + `BlastRadius` |
| Dependency chains | `dependencyChains` | `DependencyChainRecord` |
| Critical nodes | `criticalNodes` | `CriticalNodeRecord` |
| Bottlenecks | `bottlenecks` | `BottleneckRecord` |
| Single points of failure | `singlePointsOfFailure` | `SinglePointOfFailureRecord` |
| Ownership propagation | `ownershipPropagation` | `OwnershipRecord` |
| Coverage gaps | `coverageGaps` | `CoverageGapRecord` |
| Circular dependencies | `circularDependencies` | `CircularDependencyRecord` |
| Capability lineage | `capabilityLineage` | `LineageRecord` |
| Route traceability | `routeTraceability` | `TraceabilityRecord` |

### 3.1 Impact and blast radius

Downstream impact answers *"what breaks if this changes"* and walks
`IMPACT_EDGE_TYPES` inbound; upstream impact answers *"what must be correct for
this to work"*. The derived `BlastRadius` reports total and direct impact, max
depth, and breakdowns by node type and owning module. A change touching more
than one module raises a coordination recommendation (P1 above three modules).

### 3.2 Dependency chains

Chains are enumerated to *terminal* dependencies only: a hit whose own outgoing
dependency edges all leave the traversal frontier. This avoids reporting every
prefix of a chain. Each chain records its edge types and whether it leaves the
subject's owning module.

### 3.3 Criticality score

A published, reproducible composite, each component scaled 0–100 against the
graph maximum:

```text
score = 0.40 * dependents
      + 0.30 * downstream reach (depth-bounded, cycle-safe)
      + 0.20 * distinct dependent modules
      + 0.10 * brokerage  (min(fan-in, fan-out))
```

`basis` on every record lists the raw inputs, so a score is always explainable.

### 3.4 Bottlenecks and single points of failure

A bottleneck mediates flow: `min(fanIn, fanOut) >= 2` on dependency edges.
A single point of failure is a node that is the **only** dependency provider for
at least one other node; those dependents are reported as `strandedNodeIds`.

### 3.5 Ownership and accountability propagation

Declared ownership always wins. Where `moduleId` is absent, accountability is
propagated over `BELONGS_TO`, `IMPLEMENTS`, `EXPOSES` (upward) and `OWNS`,
`EXPOSES`, `PROVIDES` (downward) to the nearest owning ancestor, capped at depth
8. Outcomes: `declared`, `propagated` (confidence downgraded one step),
`conflicting` (multiple owners at equal distance — never resolved by guesswork)
and `unresolved`.

### 3.6 Coverage gaps

Six structural gap kinds: `route-without-capability`,
`capability-without-implementation`, `service-never-consumed`,
`module-without-persona`, `isolated-node`, `unowned-implementation`. Personas,
permissions and catch-all/placeholder routes are marked `expected: true`.

### 3.7 Circular dependencies

Iterative Tarjan strongly-connected-component analysis over dependency edges
(recursion is avoided at 1,291 nodes). Each component gets a deterministic
representative cycle found by BFS back to the lowest-sorted member, so the
finding names concrete edges to break.

### 3.8 Lineage and traceability

Capability lineage expects `capability → module → shared-capability →
platform-capability`; route traceability expects `route → page → service →
capability → module`. Both report `layersCovered`, `layersMissing` and
`complete`, so a partial trace is visible rather than silently truncated.

---

## 4. Observed results on the current graph

Run over the authoritative graph (`e889b604`), candidate edges excluded:

**Top critical nodes**

| Node | Score | Direct dependents |
| --- | --- | --- |
| `capability:sre.production-digital-twin` | 90 | 5 |
| `capability:sre.reliability-foundations` | 90 | 5 |
| `capability:sre.transformation-narrative` | 76 | 4 |
| `database-entity:profiles` | 68 | 3 |
| `capability:sre.platform-and-modernization-factories` | 62 | 3 |
| `database-entity:tenant_memberships` / `tenants` / `user_roles` | 54 | 2 |
| `platform-capability:platform.authentication` | 44 | 1 |

**Structural health**

| Measure | Value |
| --- | --- |
| Circular dependencies | **0** |
| Bottlenecks (brokerage ≥ 2) | **0** |
| Single points of failure | 10 (top: the five SRE capabilities above) |
| Ownership: declared / propagated / unresolved | 593 / 3 / 695 |
| Routes analysed / fully traceable | 431 / 42 |
| Coverage gaps (unexpected) | 878 |

**Coverage gaps by kind**

| Kind | Count |
| --- | --- |
| `route-without-capability` | 379 |
| `isolated-node` | 318 |
| `unowned-implementation` | 158 |
| `service-never-consumed` | 20 |
| `capability-without-implementation` | 4 |
| `module-without-persona` | 1 |

**Interpretation.** The graph is acyclic over dependency edges and has no
brokerage bottlenecks, which is the expected shape for a registry-derived model
where only one module (SRE) is fully registered. The dominant signal is
registration coverage, not architectural pathology: 695 unresolved owners and
379 untraceable routes are the direct consequence of the remaining 11 candidate
modules from Stage 3 not yet being registered. Every one of those counts is
expected to fall as module manifests land; the reasoning engine is the
instrument that will measure it.

## 5. Guarantees and non-goals

Guaranteed: read-only, deterministic ordering, derived confidence, structured
evidence on every finding, explicit candidate labelling, typed failures for
invalid input, whole-graph analyses complete in tens of milliseconds.

Not in scope for this stage: any visualization, any write path, any semantic or
probabilistic inference, any natural-language generation, and any change to the
Stage 1–3 registries or the Stage 3.5.2 population.

## 6. Verification

- Repository test suite: **549 / 549 passing** (526 baseline + 23 new).
- Module tests: 205 / 205 passing.
- Typecheck (`tsgo --noEmit`): clean.
- Graph lineage unchanged: content hash `e889b604`, 1,291 nodes, 889 edges,
  verified identical before and after every analysis.
