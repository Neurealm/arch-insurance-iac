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

## Stage 3.5.4.2.2 — warning deduplication and accessibility closure

### Presentation-layer deduplication

A bidirectional traversal runs an upstream and a downstream sub-query, and each
may report the same condition. The engine is correct to emit both; showing two
identical cards is not, because it reads as two separate defects.

`graph/graphWarnings.ts` therefore consolidates warnings **in the presentation
layer only**. Query Engine emission, traversal execution, canonical query
results, the graph-view warning source data and the warning taxonomy are all
unchanged.

| Aspect | Behaviour |
| --- | --- |
| Identity | `graphWarningIdentity()` = canonical **code + subject + verbatim message**. Two warnings collapse only when all three match, so the same code about different entities, depths, limits or conditions stays separate. |
| Ordering | Unchanged policy: truncation → depth → path → candidate relationships → empty result → any other code, ties broken by first emission index. |
| Determinism | Identical input yields byte-identical output; semantically identical input collapses regardless of array order; the input array and its warning objects are never mutated. |
| Preservation | Every unique warning survives, with its canonical code, verbatim message, subject, explanation and suggested actions intact. |
| Consolidation detail | When a card represents more than one report, its supporting line ends with "one condition, reported by N traversal branches" — explicitly one condition, not N defects. |

### Warning live region

`data-testid="graph-warning-announcement"` is a `role="status" aria-live="polite"`
region rendered next to the visible warning cards.

- **One warning** — `Graph warning. The view stops at depth 2 and may not show the complete relationship chain.`
- **Several warnings** — `Graph updated with 2 warnings. The view stops at depth 2 and may not show the complete relationship chain and candidate relationships are included.`
- **Warnings clear** — `Graph warnings cleared.`, announced once; a view that never had warnings stays silent.

`nextWarningAnnouncement()` compares the deduplicated warning-set signature, so
the region changes only when the warning state materially changes: root,
direction, depth, relationship filter, candidate inclusion, reset, empty-result
and truncation. Pan, zoom, node and edge hover, focus movement, entity-drawer
open/close, fit-view and contents expand/collapse leave the signature untouched
and are therefore silent. Duplicate engine warnings announce one condition.

### Two live regions, two purposes

The graph-count region ("how much is visible") and the warning region ("why the
view is bounded") are separate polite regions. Neither overwrites the other, and
both derive from the same bounded graph-view result, so they cannot disagree.
Full warning detail — title, explanation, suggested actions, canonical code,
subject and verbatim message — remains visible in the cards; the announcement is
a concise summary, never the only source of the information, and no warning
meaning depends on colour.

### Presentation utility

All pure warning logic lives in `graph/graphWarnings.ts`: `presentGraphWarnings`,
`deduplicateGraphWarnings`, `graphWarningIdentity`, `graphWarningSetSignature`,
`summarizeGraphWarningsForAnnouncement` and `nextWarningAnnouncement`. It is
React-free, deterministic, read-only and typed against the existing
`QueryWarning` contract. No engine logic moved into the UI and no broader warning
framework was introduced.

## Validation

- 853/853 tests passing. Stage 3.5.4.2 added `graphExplorer.test.tsx` and
  `graphExplorerNavigation.test.tsx`; Stage 3.5.4.2.1 adds
  `graphExplorerHardening.test.ts` (warnings, edge-limit truncation, recommendation root
  policy, root-parameter contract), `graphExplorerTransparency.test.tsx` (accessible
  contents, count announcements, re-root contract, real browser history) and
  `src/runops/components/runopsGraphRegression.test.tsx` (existing RunOps canvases are
  unaffected by the `animateHighlights` and `selectedEdgeIds` extension). Stage
  3.5.4.2.2 adds `graphWarningDeduplication.test.ts` (identity, collapse,
  ordering, order independence, non-mutation, announcement summaries and
  transitions) and `graphWarningAnnouncement.test.tsx` (live-region behaviour in
  the real route, including silence for pan/fit-view, contents toggle, hover,
  focus and drawer interactions).
- Typecheck clean.
- Canonical graph hash `e889b604` preserved — the explorer is strictly read-only.

## Remaining limitations

- Warning consolidation is presentation-only: the engine still emits one warning
  per traversal branch, and any consumer reading `view.warnings` directly sees
  the raw list.
- Warnings cannot be acknowledged, dismissed, suppressed or persisted, and no
  severity override exists. This is deliberate.
- Count parity between the canvas, contents table and announcements is asserted
  for the default view and control changes rather than for every combination of
  depth, filter, candidate and truncation state; parity is structurally
  guaranteed because all four derive from one memoized graph view.
- No graph editing, simulation, change-plan or approval surface exists here.

READY FOR FINAL GRAPH EXPLORER VALIDATION
