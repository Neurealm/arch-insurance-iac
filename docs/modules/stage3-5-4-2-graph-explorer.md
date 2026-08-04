# Stage 3.5.4.2 — Interactive Graph Explorer

Read-only visual exploration of the canonical capability graph, added to the
existing Capability Intelligence application.

## Route and navigation

| Item | Value |
| --- | --- |
| Route | `/platform/capability-intelligence/graph` |
| Guard | `PlatformAdminRoute`, inherited from the route group |
| Tab | "Graph Explorer", after "Recommendation Center" |
| Loading | Lazy, consistent with the other Capability Intelligence screens |

The route is declared once, in `src/platform/capability-intelligence/routes.tsx`,
so the application wiring and the integration tests cannot drift.

## Architecture

| File | Responsibility |
| --- | --- |
| `graph/graphViewTypes.ts` | View contract, direction/depth vocabulary, safety limits |
| `graph/nodeTaxonomy.ts` | 19 canonical node types → 6 visual families |
| `graph/initialRoot.ts` | Deterministic default root selection |
| `graph/graphView.ts` | Bounded traversal adapter over the Stage 3.5.3.1 query engine |
| `graph/graphLayout.ts` | Pure arithmetic layered layout |
| `graph/reactFlowAdapter.ts` | Canonical → React Flow presentation view models |
| `pages/GraphExplorer.tsx` | Screen composition and local view state |
| `components/RootEntityPicker.tsx` | Bounded, ranked root search |
| `components/GraphControls.tsx` | Direction, depth, relationship types, candidates |
| `components/GraphLegend.tsx` | Families, edge treatments, markers, truncation |
| `components/GraphContentsList.tsx` | Accessible text equivalent of the canvas |
| `components/EdgeDetailPanel.tsx` | Read-only relationship detail |

No second graph model exists. Canonical nodes and edges are referenced, never
copied or rewritten, and the graph is never mutated.

## Safety and determinism

- Every view is a bounded neighbourhood of one root: depth 1–3 only.
- Hard caps: **120 entities**, **200 relationships**. Truncation is always
  stated in the header, in a status message, and in the legend — never silent.
- Retention order is canonical (nearest depth, then type, label, id), so the same
  inputs always yield the same visible set and the same node positions.
- Confirmed relationships sort ahead of candidates, so the edge cap can never
  drop a confirmed relationship in favour of an inferred one.
- Layout is pure arithmetic: root centred, dependencies left, dependents right.

## Candidate relationships

Excluded by default. When enabled they are drawn dashed, labelled
`TYPE (candidate)`, badged "candidate" in the contents list and detail panel, and
never counted as canonical. There is no promote, accept, reject or edit action.

## Empty states

Each condition has distinct, actionable copy: no root, unknown entity, genuine
orphan, filters excluding everything, and confirmed-empty-with-candidates. A
filtering artefact is never presented as an orphan.

## Accessibility

- The canvas carries a descriptive `aria-label` and is paired with a collapsible
  **Graph contents** table listing every visible entity and relationship with
  type, direction, registration and selection state.
- Node type, root state, candidate state and selection are all conveyed as text,
  never by colour alone.
- All controls are labelled and keyboard operable; edge animation is disabled
  under `prefers-reduced-motion`.

## Validation

- 753/753 tests passing (`src/platform/capability-intelligence/graphExplorer.test.tsx`
  adds 22 covering taxonomy completeness, root determinism, bounding, filtering,
  candidate handling, empty-state diagnosis, layout stability, highlighting,
  graph immutability and route registration).
- Typecheck clean.
- Canonical graph hash `e889b604` preserved — the explorer is strictly read-only.

READY FOR GRAPH EXPLORER VALIDATION
