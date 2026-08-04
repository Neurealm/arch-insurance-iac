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
      Overview | Explorer | Recommendations | Drawer
```

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
- No simulation or change-plan module is imported by the UI.
- No approve, dismiss, edit, execute or export-to-write affordances exist.
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
| `capabilityIntelligenceApp.test.tsx` | Provider single-compute lifecycle, Overview data contracts and priority bands, precision and unavailable-state handling, registration framing, confidence labelling, Explorer filtering/paging/clamping/terminology/orphans/`aria-sort`, recommendation identity and status, expected-by-design distinction, drawer behaviour, orphan-definition parity |

Validation commands:

```bash
bunx vitest run                       # full repository suite
bunx vitest run src/platform/capability-intelligence
tsgo --noEmit -p tsconfig.app.json    # typecheck
bunx vitest run src/modules/graph     # graph engine + determinism
```

## Known limitations

- No graph visualisation canvas in this iteration; relationships are shown as lists.
- Filters are client-side over the in-memory snapshot; there is no server-side paging.
- The snapshot is computed once per session; a full page reload is required to pick up a
  regenerated graph.
- Rate metrics show definitions rather than numerator/denominator pairs, which the
  engine does not currently expose.

## Deferred work

Drawer deep-linking, URL-encoded filters, page-size selector, shared command palette,
shared KPI/filter-bar extraction, tablet/mobile redesign, in-shell nested 404.

## Planned Stage 3.5.4.2

Interactive Graph Explorer: canvas visualisation with a deterministic layout over the
same read-only snapshot, with simulation and change-plan workspaces remaining out of
scope until separately approved.
