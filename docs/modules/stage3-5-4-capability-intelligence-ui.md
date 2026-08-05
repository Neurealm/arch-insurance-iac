# Capability Intelligence Application (Stage 3.5.4)

Read-only user interface over the deterministic capability graph engines. It renders
existing analysis output; it never mutates the graph, never writes to the database,
and never triggers remediation.

## Stage history

| Stage | Scope |
| --- | --- |
| 3.5.4.1 | Initial application foundation: provider, Overview, Explorer, Recommendation Center, Entity Drawer, shared `PagedDataTable` and `StatusBadge` |
| 3.5.4.1.1 | Foundation hardening: route authorization, priority-band correction, metric precision and context, registration-coverage framing, humanized confidence, recommendation identity/status, Explorer terminology and orphan visibility, table and KPI accessibility, application-level test coverage |
| 3.5.4.1.2 | Final semantic and integration hardening: valid `dt`→`dd` KPI markup, integration tests against the real `App.tsx` route element, provider lifecycle across actual child-route navigation, balanced eight-tile recommendation-summary grid |
| 3.5.4.2 | Interactive Graph Explorer: bounded neighbourhood traversal, deterministic layout, cross-screen "Explore relationships" navigation and the `?root=` deep-link contract |
| 3.5.4.2.1 | Transparency and integration hardening: traversal-warning presentation, accessible graph contents expanded by default, recommendation root policy, `?root=` normalization, re-root contract, RunOps graph regression coverage |
| 3.5.4.2.2 | Warning deduplication and accessibility closure: identical warnings reported by both traversal branches are consolidated into one card, and warning appearance, change and clearing are announced in a dedicated polite live region. The warning source remains the Query Engine — no engine warning emission, traversal semantics or taxonomy was changed. |
| 3.5.4.3 | Simulation and Change Planning Workspace: the fifth screen. Deterministic default recommendation, `?recommendation=` deep-link contract, proposal and parameter surfaces, simulation results, alternative comparison and a read-only change-plan preview |
| 3.5.4.3.1 | Workflow gating and evidence hardening: one canonical eligibility policy enforced in both UI state and action handlers, seven explicit stages with no automatic engine execution, narrowed `simultaneous-alternatives` conflict handling, measured real-graph plan-status evidence separated from clearly labelled fixtures, bounded rendering of steps/patches/blockers, and polite/assertive announcement separation |


## Location

- Route group: `/platform/capability-intelligence`
- Navigation: Platform sidebar, "Capability Intelligence" (platform admin only)
- Source: `src/platform/capability-intelligence/`

## Screens

| Screen | Route | Purpose |
| --- | --- | --- |
| Overview | `/platform/capability-intelligence` | Executive health: graph scale, registration coverage, orphan/unregistered inventory, recommendation distribution, graph hash provenance |
| Capability Explorer | `.../explorer` | Paginated, filterable, sortable table over all graph nodes |
| Recommendation Center | `.../recommendations` | Advisory recommendations with identity, status, evidence, remediation sequence and confidence rationale |
| Interactive Graph Explorer | `.../graph` | Bounded neighbourhood traversal over the canonical graph with the `?root=` deep-link contract |
| Remediation Workspace | `.../remediation` | Seven-stage, explicitly invoked simulation and change-planning workspace with the `?recommendation=` deep-link contract |
| Entity Detail Drawer | overlay on both list screens | Identity, connectivity, owning module, registration, traceability, relationships, dependencies, dependents, lineage, reasoning findings and recommendations for one entity |

## Route authorization

The complete route group is guarded by `PlatformAdminRoute` (exported from
`src/components/auth/PermissionRoute.tsx`). Since Stage 3.5.4.1.2 the group is defined
once, in `src/platform/capability-intelligence/routes.tsx`, and exported as
`capabilityIntelligenceRoutes`; `src/App.tsx` renders that element inside the existing
`/platform` shell. Lazy loading, paths and the Platform layout are unchanged — the
extraction exists so tests exercise the authoritative wiring instead of a copy that
could drift. Every current and future nested route inherits the guard.



- Authentication is delegated to the existing `ProtectedRoute`.
- Authorization reads `isPlatformAdmin` from `AccessContext` — the same source that
  drives the `adminOnly` navigation flag, so navigation visibility and route
  authorization can never diverge.
- Unauthorized authenticated users receive the existing `ForbiddenState`
  (`permission="platform.admin"`), not screen content.

Why this approach: Capability Intelligence is a platform-wide diagnostic surface that
is not tenant-scoped, so a named tenant permission would be the wrong unit. The
repository already models "platform administrator only" through `AccessContext`;
`PlatformAdminRoute` reuses that flag and the shared forbidden component rather than
introducing a second authorization system or a new permission code.

## Data flow and provider lifecycle

```text
buildCapabilityGraph -> populateCapabilityGraph
        |                        |
   GraphQueryEngine        GraphIntelligenceEngine
        \                        /
      CapabilityIntelligenceProvider   (memoised once per browser session)
                     |
      Overview | Explorer | Recommendations | Graph | Remediation | Drawer
```

`RemediationWorkspaceProvider` nests inside that provider on the Remediation
route only. It owns workflow state and a memoized simulation/change-plan engine
pair; the plan engine is bound explicitly to the simulation engine's populated
graph so every surface reports the same canonical hash. It never re-runs
`analyzeGraph()`.

`CapabilityIntelligenceProvider` computes the snapshot exactly once and caches it in a
module-level singleton, because `analyzeGraph()` is the heaviest synchronous call in
the stack. Analysis is deferred to a macrotask so the loading state paints first.
Every screen reads from that snapshot; no screen recomputes analysis. Tab navigation,
filtering, sorting, pagination and drawer open/close never trigger recomputation —
asserted through `__capabilityIntelligenceComputeCount()`.

Cold analysis is roughly 300 ms; warm reads are effectively free.

## Shared components

- `PagedDataTable` — caller-controlled sorting and filtering, rendering only.
  Sortable headers expose `aria-sort` (`ascending`/`descending`/`none`), the result
  range is a polite live region, and pagination buttons carry both `disabled` and
  `aria-disabled`.
- `StatusBadge` — domain-aware read-only chip; tone derived from the value unless
  explicitly supplied.

## Overview metric definitions

- Priority bands render independently — `critical`, `high`, `medium`, `low` and
  `informational` — directly from `intelligence.statistics.recommendationsByPriority`.
  Low and informational are never merged, which keeps the Overview and Recommendation
  Center numerically identical.
- Rate metrics (ownership resolution, route traceability) render at engine precision,
  one decimal place when the value carries decimals (for example `46.2%`, `9.7%`).
- Rate cards carry a definition hint rather than a fabricated denominator, because the
  engine exposes the rate but not the numerator/denominator pair.
- `MetricState` distinguishes a true zero (`0%`) from `Not available` and
  `Unable to verify`; missing data is never rendered as `0`.
- Analysis confidence renders a human label (`Unable to verify`) with the engine
  rationale as supporting text; the raw enum remains visible in the provenance line
  (`data-testid="confidence-raw"`).

## Registration-coverage framing

Registration figures are presented as governance and migration coverage:
"Registration coverage", "Unregistered inventory", "Open coverage gaps",
"Expected-by-design exclusions". The section states explicitly that the measurements
are valid, the graph is functioning, the registration model is incomplete, and some
exclusions are intentional. Engine classification, counts and severity are unchanged;
no critical styling is applied unless the engine policy classifies it so.

## Recommendation presentation

Each card exposes the recommendation `id`, `status` (mapped to readable labels while
preserving the canonical value in `data-status`), `priority`, `severity`, `category`,
`policyId`, priority score and `confidence`. Priority (urgency) and severity (nature
and seriousness of the condition) are labelled explicitly and explained in help text.
Status is also a filter, matching the existing filter architecture. No scoring,
priority or severity policy was changed.

## Orphan-node definition

An orphan is a node with a total degree of zero — it participates in no graph edge in
either direction. This is exactly the definition behind
`graphStatistics().totals.orphanNodes`; candidate edges do not count as connectivity.
The UI builds a single memoised `Set<string>` index per engine instance
(`buildOrphanIndex`), so row renderers perform an O(1) lookup and never rescan the
graph. Orphan state appears as a "Connectivity" column, a "Connectivity" filter
(orphan/connected) and a badge in the Entity Drawer.

## Accessibility decisions

- KPI tiles are description-list groups: each `dl > div` contains exactly one `<dt>`
  (label) followed by one `<dd>` (value), with supporting context as a `<p>` linked from
  the value through `aria-describedby`. Visual order (figure above caption) is restored
  with flex `order-*` utilities, so the accessibility tree stays valid without ARIA
  patches on `<dd>`. Zero, "Not available" and "Unable to verify" states still render
  distinctly, and `data-testid="kpi-<label>"` identifiers are unchanged.
- The recommendation summary renders eight tiles as `grid-cols-2 md:grid-cols-4
  2xl:grid-cols-8` — full rows at every breakpoint and no narrow cards between 768 and
  1024 px. Other KPI grids keep their six- and four-column layouts.

- Sortable table headers expose `aria-sort`; result counts announce politely.
- Recommendation result counts also announce politely.

## Read-only guarantees

- No mutation APIs are imported by any file under `src/platform/capability-intelligence/`.
- The simulation and change-plan engines are imported only by the Remediation
  Workspace, and only for in-memory planning: no patch is applied, no state is
  persisted, and no repository, Supabase or graph mutation is possible.
- No approve, reject, dismiss, edit, execute or export-to-write affordances exist.
- Recommendations are labelled advisory; the UI surfaces a persistent `read-only` chip.
- Every screen displays the graph content hash so any rendered figure is traceable to a
  specific graph snapshot.

## Provenance

All figures are derived from the canonical graph (content hash `e889b604`). No synthetic,
placeholder or mocked data is used anywhere in the UI.

## Tests

| File | Coverage |
| --- | --- |
| `capabilityIntelligence.test.tsx` | Analysis determinism, card provenance, filtering without source mutation, read-only query access |
| `capabilityIntelligenceRouting.test.tsx` | Authorized access, unauthorized direct-URL block, child-route inheritance, forbidden component reuse, loading state, navigation/authorization consistency |
| `capabilityIntelligenceApp.test.tsx` | Provider single-compute lifecycle, Overview data contracts and priority bands, precision and unavailable-state handling, registration framing, confidence labelling, KPI semantic order (`dt` before `dd`, single `dd` per group, `aria-describedby` hint), recommendation-summary grid contract, Explorer filtering/paging/clamping/terminology/orphans/`aria-sort`, recommendation identity and status, expected-by-design distinction, drawer behaviour, orphan-definition parity |
| `remediationWorkspace.test.tsx`, `remediationSelection.test.tsx` | Stage 3.5.4.3: engine determinism and hash preservation, plan contracts, route authorization, the deterministic default recommendation, the full `?recommendation=` matrix and the labelled seven-step workflow list |
| `remediationGating.test.tsx` (52), `remediationPlanStatus.test.tsx` (22) | Stage 3.5.4.3.1: explicit generation/validation lifecycles, simulation, comparison and change-plan eligibility gates enforced at handler level, announcement deduplication, measured real-graph plan-status evidence, labelled fixture statuses and `BoundedList` bounds |
| `capabilityIntelligenceRouteIntegration.test.tsx` | Mounts the real `capabilityIntelligenceRoutes` element from `routes.tsx` (the same element `App.tsx` renders): unauthorized block on parent and both child routes, authorized entry, and provider lifecycle across actual link navigation Overview → Explorer → Recommendations → Overview with `analyzeGraph()` executing exactly once and hash `e889b604` stable |


Validation commands:

```bash
bunx vitest run                       # full repository suite
bunx vitest run src/platform/capability-intelligence
tsgo --noEmit -p tsconfig.app.json    # typecheck
bunx vitest run src/modules/graph     # graph engine + determinism
```

## Known limitations

- Stage 3.5.4.1 shipped without a graph visualisation canvas; the canvas arrived in
  Stage 3.5.4.2 (Interactive Graph Explorer) and this limitation no longer applies.
- Filters are client-side over the in-memory snapshot; there is no server-side paging.
- The snapshot is computed once per session; a full page reload is required to pick up a
  regenerated graph.
- Rate metrics show definitions rather than numerator/denominator pairs, which the
  engine does not currently expose.
- Every change plan the real graph can currently produce is `blocked` (dominated by
  `unresolved-artifact-mapping` and `unresolved-approval-role`); `draft` and
  `ready-for-review` are demonstrated only through fixtures that are labelled
  "Fixture — not derived from the repository graph".
- Remediation workspace state is not persisted; a reload restarts the workflow.
- No authenticated browser-based visual validation has been performed for the
  Remediation Workspace.

## Deferred work

Drawer deep-linking, URL-encoded filters, page-size selector, shared command palette,
shared KPI/filter-bar extraction, tablet/mobile redesign, in-shell nested 404.

Change review, approval, rejection and patch execution are deferred to
Stage 3.5.4.4 (Change Review and Approval Experience) and are deliberately absent
from every current screen.

## Stage 3.5.4.2 — Interactive Graph Explorer

Full detail: `docs/modules/stage3-5-4-2-graph-explorer.md`. Summary:

- **Route** — `/platform/capability-intelligence/graph`, lazy loaded from
  `src/platform/capability-intelligence/routes.tsx`, inheriting `PlatformAdminRoute`
  and the shared Capability Intelligence provider. Direct load and refresh supported.
- **Screen architecture** — `pages/GraphExplorer.tsx` composes `RootEntityPicker`,
  `GraphControls`, `GraphLegend`, the RunOps `TopologyCanvas`, `EdgeDetailPanel`,
  `GraphContentsList` and the existing `EntityDrawer`.
- **Initial-root policy** — `graph/initialRoot.ts`: registered capability with the
  highest total degree, tie-broken by normalised label then canonical node id, with a
  highest-degree connected-node fallback and an empty state when nothing is connected.
  No hardcoded identifier.
- **Traversal controls** — direction (dependencies / dependents / both), depth 1–3,
  relationship-type filtering, candidate edges excluded unless explicitly enabled.
- **Safety limits** — 120 visible nodes, 200 visible edges; truncation is deterministic
  and reported in a live region.
- **Layout** — `graph/graphLayout.ts`, a pure deterministic layered layout (dependencies
  left, root centre, dependents right) with fixed spacing constants; no physics.
- **React Flow** — reuses `src/runops/components/graphs.tsx` via a backward-compatible
  extension (`animateHighlights`, `selectedEdgeIds`); no competing graph framework.
- **Interaction** — node selection, neighbour highlighting, re-root, entity drawer, edge
  selection with read-only detail and endpoint navigation, clear selection, fit view,
  reset view. No editing of any kind.
- **Cross-screen navigation** — `graph/exploreLink.ts` and
  `components/ExploreRelationshipsLink.tsx` add an "Explore relationships" action to the
  Capability Explorer table, the Entity Drawer and Recommendation cards with an affected
  entity. The action is a router `Link` to `?root=<nodeId>`, so the provider stays
  mounted and `analyzeGraph()` is not re-executed. The `root` query parameter is the
  single source of truth for the root, giving browser back/forward support.
- **Accessibility** — labelled controls, keyboard-usable root search, live counts and
  truncation announcements, a graph contents list expanded by default that states the
  same bounded entities and relationships as the canvas, text markers alongside colour,
  predictable drawer focus, reduced-motion support.
- **Transparency (Stage 3.5.4.2.1)** — traversal and query warnings raised by the query
  engine are presented verbatim in `components/GraphWarningList.tsx` with a plain-language
  explanation and suggested actions; the recommendation root policy lives in
  `graph/recommendationRoot.ts`; empty and whitespace-only `?root=` parameters resolve to
  the deterministic initial root.
- **Tests** — `graphExplorer.test.tsx`, `graphExplorerNavigation.test.tsx`,
  `graphExplorerHardening.test.ts`, `graphExplorerTransparency.test.tsx` and
  `src/runops/components/runopsGraphRegression.test.tsx`.
- **Determinism** — canonical graph hash `e889b604` unchanged before and after.

### Remaining limitations

Bounded views only (no whole-graph rendering), no persisted view state beyond the root
parameter, no simulation or change-plan surfaces (deferred to later stages).

## Stage 3.5.4.3 / 3.5.4.3.1 — Remediation Workspace

Full detail: `docs/modules/stage3-5-4-3-simulation-change-planning-workspace.md`.
Application-level summary:

- **Route** — `/platform/capability-intelligence/remediation`, lazy loaded from
  `routes.tsx`, inheriting `PlatformAdminRoute`.
- **Deep link** — `?recommendation=<canonical-recommendation-id>`. Missing, empty
  and unknown identifiers fall back to the deterministic default recommendation;
  an unknown identifier also shows a notice naming it.
- **Deterministic default recommendation** — priority band, then priority score,
  then severity, then affected-entity count, then identifier. Nothing hardcoded.
- **Explicit proposal generation** — no proposal exists until the operator asks.
- **Local parameter binding** — graph-derived candidates with support scores;
  "Leave unresolved" is always available and yields an `incomplete` classification
  rather than a guessed value. Bindings are in-memory only.
- **Explicit validation** — the engine classification is the only thing that
  authorises a simulation.
- **Eligibility gating** — one canonical policy in `remediation/eligibility.ts`,
  applied both to the controls and inside the action handlers, so a programmatic
  call cannot bypass it.
- **Simulation, alternatives comparison and change-plan preview** — each is a
  separate explicit action; comparison accepts 2–4 eligible alternatives only.
- **Stale-state behaviour** — changing an input marks dependent results stale and
  keeps them visible with a warning; nothing re-executes automatically.
- **Evidence separation** — real plans are marked repository-derived; fixture
  plans carry "Fixture — not derived from the repository graph".
- **Bounded collections** — steps, patches and blockers show 10 initially with the
  true total stated and full expansion available.
- **Read-only** — no approve, reject, execute, apply, persist or write path exists.
- **Determinism** — canonical graph hash `e889b604` unchanged.

## Verified totals (current)

- Repository-wide: **968 tests across 56 files, all passing** (`bunx vitest run`).
- Capability Intelligence focused suite: **266 tests across 14 files**.
- Typecheck clean; canonical graph hash `e889b604`; `analyzeGraph()` executes once.
