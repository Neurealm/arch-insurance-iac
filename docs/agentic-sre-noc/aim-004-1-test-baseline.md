# AIM-004.1 — Test Stabilization and Regression Baseline

Stage: AIM-004.1
Page: Predictive Optical Link Intelligence
Route: `/agentic-sre-noc/global-link-health-twin/predictive-optical-link-intelligence`
Date: 2026-08-05

No product features were added, no styling changed, and no behaviour of AIM-001
through AIM-004 was altered.

## 1. Flaky test root cause

Test: `predictiveOpticalLinkIntelligence.test.tsx > Predictive Optical Link
Intelligence (AIM-001) > exposes all header controls`

Observed full-suite failure mode: `Error: Test timed out in 5000ms.` — not a
query-ambiguity or state-leak failure.

Measured evidence (isolated, verbose reporter, before the fix):

| Test | Duration |
| --- | --- |
| renders the page identity | 596 ms |
| exposes all header controls | **4592 ms** |
| renders seven KPI cards | 303 ms |
| every placeholder panel shell | 375 ms |
| opens the Explain Model drawer | 1175 ms |

Root cause: the test ran eleven unscoped accessible-name queries
(`screen.getByRole("combobox", { name })` × 6 and
`screen.getAllByRole("button", { name: RegExp })` × 5) against the whole
document. After AIM-004 the page DOM grew by five analytics panels (Recharts
SVG subtrees, the high-risk table and the threshold control), so each
whole-tree role scan with accessible-name computation became roughly an order
of magnitude more expensive. In isolation this landed at 4.59 s, just under the
5 s default timeout; under full-suite parallel CPU contention it crossed the
limit intermittently. This is test-query cost, not non-determinism: no shared
DOM state, no fixture mutation, no timer, observer, storage, router or MapLibre
mock leakage was involved (each test uses a fresh `render`, and RTL auto
cleanup is active via the global setup).

## 2. Fix

Test change (`src/pages/agentic-sre-noc/__tests__/predictiveOpticalLinkIntelligence.test.tsx`):
the assertions are scoped to the page header with
`within(screen.getByTestId("pli-header"))`, and the header's comboboxes and
buttons are collected in a single pass each, then asserted against the expected
control names. All eleven controls are still asserted; nothing was skipped,
weakened or removed. No sleeps, no timeout increases, no retries, no changes to
parallelism.

Production change (minimal, non-visual):
`src/pages/agentic-sre-noc/PredictiveOpticalLinkIntelligence.tsx` — added
`data-testid="pli-header"` to the existing `<header>` element. This is a test
hook only; no markup, layout, class, semantics or behaviour changed. It was
required so the assertions can be scoped to the header container instead of the
whole page, which also removes the ambiguity between header filters and the
AIM-004 analytics filters.

Result: 4592 ms → **214 ms** for the same assertions.

## 3. Verification

| Run | Result |
| --- | --- |
| Header test in isolation (`-t "exposes all header controls"`) | pass, 214 ms |
| Header test, 20 consecutive isolated executions | 20 pass / 0 fail |
| Its test file (10 tests) | 10/10 pass |
| All Predictive Optical Link Intelligence tests | pass |
| `src/pages/agentic-sre-noc` module directory, 5 consecutive runs | 201/201 pass each run |
| Full repository suite, run 1 | 1232 passed, 5 failed |
| Full repository suite, run 2 | 1232 passed, 5 failed |
| Full repository suite, run 3 | 1232 passed, 5 failed |
| Typecheck (`tsgo --noEmit -p tsconfig.app.json`) | clean |

The three consecutive full-suite runs produced an identical failure set, so the
suite is deterministic.

## 4. Known repository baseline (5 pre-existing failures)

1. `src/modules/graph/population.test.ts > Stage 3.5.2 — candidate isolation >
   returns candidate edges deterministically sorted and de-duplicated`
2. `src/modules/graph/intelligence/intelligence.test.ts > real populated graph >
   runs at production scale and preserves the graph hash` — expected
   `88ceb819`, received `fc7066d3`
3. `src/platform/capability-intelligence/capabilityIntelligenceRouteIntegration.test.tsx >
   Stage 3.5.4.1.2 — provider lifecycle across real route navigation` — same
   hash mismatch
4. `src/platform/capability-intelligence/changeReviewReadiness.test.tsx >
   Stage 3.5.4.4 — real-graph review evidence > the canonical graph hash is
   unchanged by this stage` — same hash mismatch
5. `src/platform/capability-intelligence/remediationWorkspace.test.tsx >
   Stage 3.5.4.3 — remediation route wiring > renders the workspace for a
   platform administrator with later stages gated`

### Classification: not caused by AIM route or capability registration

Evidence gathered rather than assumed:

- The capability graph is built from the static generated snapshot
  `src/modules/generated/implementationInventory.ts`; nothing under
  `src/modules/graph/` or `src/modules/generated/` imports from `src/pages`, so
  page edits cannot change graph content at test time.
- `git diff --name-only <last src/modules commit>..HEAD` shows **no** file under
  `src/modules/` changed across the whole AIM-001 → AIM-004 work; every AIM
  change is confined to `src/pages/agentic-sre-noc/`, `src/App.tsx` and the
  sidebar.
- The generated inventory does not contain the AIM route
  (`predictive-optical-link-intelligence` is absent); it still lists only
  `/agentic-sre-noc/global-link-health-twin`. The inventory is regenerated only
  by the explicit `scripts/scan-implementation.mjs` tooling, which was not run
  during AIM work.
- No AIM file appears in any of the five stack traces.

Therefore the graph hash drift (`88ceb819` → `fc7066d3`) predates AIM-004 and is
not a stale-expectation consequence of AIM page registration. No hash, expected
count or graph artifact was edited in this stage; the failures are preserved
verbatim as the known repository baseline and must be reconciled through the
project's normal graph regeneration process in a dedicated stage.

## 5. Files touched

Created:
- `docs/agentic-sre-noc/aim-004-1-test-baseline.md` (this document)

Modified:
- `src/pages/agentic-sre-noc/__tests__/predictiveOpticalLinkIntelligence.test.tsx`
  (header-controls query scoping)
- `src/pages/agentic-sre-noc/PredictiveOpticalLinkIntelligence.tsx`
  (`data-testid="pli-header"` hook only)

## 6. Gate

AIM-001 through AIM-004 behaviour, route, header layout, KPI, pipeline, map,
What-If and analytics behaviour are unchanged. The header-controls test no
longer flakes across 20 repeated executions and three full-suite runs.
AIM-005 may safely begin against this baseline.
