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

- The canvas carries a descriptive `aria-label` and is paired with a
  **Graph contents** table, expanded by default and collapsible, listing every visible
  entity and relationship with type, direction, registration and selection state. The
  table, the canvas, the header badges and the polite count announcement all derive from
  the same bounded graph-view result, so they cannot disagree.
- Node type, root state, candidate state and selection are all conveyed as text,
  never by colour alone.
- All controls are labelled and keyboard operable; edge animation is disabled
  under `prefers-reduced-motion`.

## Stage 3.5.4.2.1 — transparency and integration hardening

| Area | Behaviour |
| --- | --- |
| Traversal warnings | Every warning returned with the graph view is presented, with a title, plain-language explanation, suggested actions and the canonical warning code. No warning is invented, none is suppressed, and no additional query runs. |
| Accessible contents | Expanded by default, described as the text equivalent of the canvas, and always in step with the canvas counts. |
| Recommendation root | `graph/recommendationRoot.ts` prefers the recommendation subject when it resolves in the graph, otherwise the first affected entity that resolves, and reports the number of additional affected entities. When nothing resolves, no link is offered. |
| Root parameter | Missing, empty and whitespace-only `?root=` values resolve to the deterministic initial root; non-empty values are never trimmed, so an unknown id stays in the explicit unknown-entity state. |
| Re-root | Sets the root in the URL (a real history entry), clears node and edge selection, closes the entity drawer and refits the canvas. |

## Validation

- 814/814 tests passing. Stage 3.5.4.2 added `graphExplorer.test.tsx` and
  `graphExplorerNavigation.test.tsx`; Stage 3.5.4.2.1 adds
  `graphExplorerHardening.test.ts` (warnings, edge-limit truncation, recommendation root
  policy, root-parameter contract), `graphExplorerTransparency.test.tsx` (accessible
  contents, count announcements, re-root contract, real browser history) and
  `src/runops/components/runopsGraphRegression.test.tsx` (existing RunOps canvases are
  unaffected by the `animateHighlights` and `selectedEdgeIds` extension).
- Typecheck clean.
- Canonical graph hash `e889b604` preserved — the explorer is strictly read-only.

READY FOR GRAPH EXPLORER VALIDATION
