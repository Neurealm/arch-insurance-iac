# Stage 2 — Validation Summary

## What Stage 2 added

| Area | Stage 1 | Stage 2 |
|---|---|---|
| Route knowledge | Manifest declarations only | Real route table extracted from `src/App.tsx` (436 entries) |
| Ownership | Declared | Reconciled against the router, with a documented policy |
| Coverage | Unknown | 40 of 1,387 items registered (2.9%) |
| Orphans | Not detected | 198 unreachable routes, 230 unused files, with false-positive caveats |
| Evidence | Direct-import check | Transitive trace with platform-chrome exclusion |
| Visibility | None | `/platform/modules` diagnostics view (admin-only) |

## Validation results

| Check | Result |
|---|---|
| Manifest schema validity | Pass |
| Duplicate module IDs | 0 |
| Duplicate capability IDs | 0 |
| Manifest routes missing from the router | 0 |
| Routes claimed by two modules | 0 |
| Include/exclude contradictions | 0 |
| Shared assets without a primary owner | 4 (reported as `ownership-conflict`) |
| Capabilities claiming `implemented` without a service/entity | 0 (blocked by rule) |
| Unable-to-verify route families | 2 |

## Test coverage

`bunx vitest run src/modules` — **53 tests passing**:

- `registry.test.ts` (17) — discovery, schema, duplicate IDs, exclusions, route ownership.
- `routeOwnership.test.ts` (17) — reconciliation, conflict detection, platform-prefix policy, reachability, missing references.
- `inventory.test.ts` (9) — inventory scan, unregistered report, recommendation mapping, orphan filtering.
- `evidence.test.ts` (10) — evidence ranking, chrome exclusion, fixture detection, context-is-not-a-service rule, status ceiling.

## Regeneration

The generated artefacts are committed so the registry works without a build step:

```bash
node scripts/extract-route-table.mjs    # -> src/modules/generated/routeTable.ts
node scripts/scan-implementation.mjs    # -> src/modules/generated/implementationInventory.ts
node scripts/analyze-sre-evidence.mjs   # -> src/modules/sre/evidence.generated.ts
```

Re-run all three after adding routes, pages or modules, then re-run the module
tests. Drift shows up as a failing test, not as a silently stale report.

## Application behaviour

Unchanged. Stage 2 added one admin-only diagnostics route
(`/platform/modules`) and one navigation entry. No existing page, route, guard,
data path or style was modified.

## Honest limitations

- Route extraction is static; two dynamically generated route families cannot be
  resolved and are reported rather than assumed.
- Reachability and unused-file detection produce false positives wherever paths
  or imports are composed at runtime. Both reports say so inline.
- Ownership clustering for unregistered items is a heuristic. 176 items are
  marked `manual-review-required` precisely because the heuristic did not have
  enough signal, and 632 items received no module suggestion at all.
- Coverage of 2.9% means every conclusion outside the SRE module is provisional.
