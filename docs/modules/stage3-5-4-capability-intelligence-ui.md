# Capability Intelligence Application (Stage 3.5.4)

Read-only user interface over the deterministic capability graph engines. It renders
existing analysis output; it never mutates the graph, never writes to the database,
and never triggers remediation.

## Location

- Route group: `/platform/capability-intelligence`
- Navigation: Platform sidebar, "Capability Intelligence" (platform admin only)
- Source: `src/platform/capability-intelligence/`

## Screens

| Screen | Route | Purpose |
| --- | --- | --- |
| Overview | `/platform/capability-intelligence` | Executive health: graph scale, registration coverage, orphan/unregistered counts, recommendation distribution, graph hash provenance |
| Capability Explorer | `.../explorer` | Paginated, filterable, sortable table over all graph nodes |
| Recommendation Center | `.../recommendations` | Advisory recommendations with evidence, remediation sequence and confidence rationale |
| Entity Detail Drawer | overlay on both list screens | Identity, owners, registration, traceability, relationships, dependencies, dependents, lineage, reasoning findings and recommendations for one entity |

## Data flow

```text
buildCapabilityGraph -> populateCapabilityGraph
        |                        |
   GraphQueryEngine        GraphIntelligenceEngine
        \                        /
      CapabilityIntelligenceProvider   (memoised once per browser session)
                     |
      Overview | Explorer | Recommendations | Drawer
```

`CapabilityIntelligenceProvider` computes the snapshot exactly once and caches it in a
module-level singleton, because `analyzeGraph()` is the heaviest synchronous call in
the stack. Every screen reads from that snapshot; no screen recomputes analysis.

## Read-only guarantees

- No mutation APIs are imported by any file under `src/platform/capability-intelligence/`.
- No approve, dismiss, edit, execute or export-to-write affordances exist.
- Recommendations are labelled advisory; the UI surfaces a persistent `read-only` chip.
- Every screen displays the graph content hash so any rendered figure is traceable to a
  specific graph snapshot.

## Provenance

All figures are derived from the canonical graph (content hash `e889b604`). No synthetic,
placeholder or mocked data is used anywhere in the UI.

## Tests

`src/platform/capability-intelligence/capabilityIntelligence.test.tsx` covers determinism
of the derived analysis, card rendering with policy provenance, filter behaviour without
source mutation, and read-only query access for recommendation subjects.

## Known limitations

- No graph visualisation canvas in this iteration; relationships are shown as lists.
- Filters are client-side over the in-memory snapshot; there is no server-side paging.
- The snapshot is computed once per session; a full page reload is required to pick up a
  regenerated graph.
