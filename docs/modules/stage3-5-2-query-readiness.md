# Stage 3.5.2 — Query Readiness Assessment

Can the populated graph answer the questions Module Capability Intelligence will
be asked? This is an evidence-based verdict per question class.

| Question | Verdict | Basis |
| --- | --- | --- |
| What modules exist? | **Partial** | One registered module node. The other 12 are Stage 3 candidates, deliberately not modelled as modules. |
| What does a module do? | **Ready for SRE** | 16 capabilities and 16 sub-capabilities with declared purpose, persona and status. |
| What capabilities exist? | **Partial** | Complete for SRE, absent elsewhere until registration. |
| Which pages implement a capability? | **Ready for SRE** | 98 `IMPLEMENTS` edges with provenance. |
| What routes does a module own? | **Ready** | 136 `EXPOSES` edges reconciled against the real 431-route table. |
| What does this page depend on? | **Ready for SRE** | Traced imports as `USES` / `REFERENCES`, platform chrome excluded. |
| What breaks if X changes? | **Ready for SRE** | `dependentsOf()` over the populated slice. |
| Which shared capabilities does a module consume? | **Ready** | 12 `CONSUMES` edges from manifests. |
| Which platform capabilities does a module consume? | **Ready** | Declared platform dependencies. |
| What data does a capability touch? | **Partial** | 21 `STORES` edges from observed Supabase usage, limited to registered boundaries. |
| Who is permitted to use a capability? | **Partial** | 35 `SECURES` edges; permission modelling is declared, not exhaustive. |
| Which capabilities are real versus prototype? | **Ready for SRE** | Evidence strength and implementation character preserved per node. |
| Which parts of the estate are unowned? | **Ready** | 710 unassigned nodes, explicitly reported. |
| Which relationships are unproven? | **Ready** | 4 candidate edges held outside the graph. |
| What workflows or agents does a module invoke? | **Not ready** | No authoritative source declares invocation; zero `INVOKES` edges by design. |
| Which reports serve which persona? | **Not ready** | No `REPORTS_TO` source exists yet. |

## Overall verdict

The graph is **query-ready for the SRE module and for estate-wide ownership and
route questions**, and **not yet query-ready for cross-module capability
questions** — because the underlying modules are not registered, not because the
graph or query API is deficient.

## Available query surface

`GraphQuery` (Stage 3.5.1) operates unchanged on the populated graph:

- `nodes(filter)`, `node(id)`, `neighbors(id, options)`
- `traverse(startId, options)`, `path(fromId, toId)`, `subgraph(nodeIds)`
- `dependenciesOf(id)`, `dependentsOf(id)`, `hotspots(limit)`

Performance on the current graph (1,291 nodes / 889 edges) is well inside
interactive latency; no indexing work is required at this scale.

## What unblocks the remaining questions

1. Register the Stage 3 candidate modules (Commercial, RunOps, AVEP first —
   highest evidence density).
2. Declare workflow, agent and integration ownership in those manifests, which
   converts today's empty `INVOKES` set into declared facts.
3. Agree primary owners for the five unowned shared capabilities.
4. Extend evidence assessment beyond SRE so `not-assessed` stops dominating the
   evidence-strength profile.
