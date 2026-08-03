# Stage 3.5.2 — Graph Orphan and Connectivity Analysis

Produced by `analyzeOrphans()` in `src/modules/graph/orphans.ts`.

## Summary

| Metric | Value |
| --- | --- |
| Total connectivity findings | 715 |
| Legitimate low connectivity | 694 |
| Likely modelling omissions | 21 |

## Findings by class

| Class | Count | Meaning |
| --- | --- | --- |
| `page-without-capability` | 381 | A page exists but implements no declared capability |
| `isolated` | 318 | A node with no relationships at all |
| `ownership-only` | 5 | Connected only by an ownership edge |
| `capability-without-implementation` | 4 | A declared capability with no backing implementation node |
| `platform-capability-without-consumer` | 3 | No module declares consumption |
| `shared-capability-without-consumer` | 2 | No module declares consumption |
| `route-without-page` | 2 | A route whose rendering component could not be resolved |

## Legitimate versus omission

A finding is **legitimate** when the disconnection reflects the true state of the
estate rather than a modelling mistake:

- Implementation belonging to a module that has not been registered yet — 694 of
  the 715 findings fall here. These are Stage 4 registration work, not graph bugs.
- Persona nodes with no declared capability mapping.
- Platform capabilities that are genuinely consumed implicitly (design system,
  application shell) rather than by manifest declaration.

A finding is a **likely omission** when the surrounding module *is* registered and
the gap is therefore a manifest defect. All 21 likely omissions sit inside the
SRE boundary and are the highest-value fixes available:

- `capability-without-implementation` (4) — declared capabilities whose
  `relatedPages` entries do not resolve to inventory items.
- `route-without-page` (2) — routes rendering an element the extractor could not
  resolve to a file.
- `ownership-only` (5) — capabilities attached to the module but to nothing else.
- The remainder are SRE pages with no capability attribution.

## Recommended actions

1. Fix the 21 likely omissions inside the SRE manifest before registering any
   further module; they are the template for correctness.
2. Treat the 381 `page-without-capability` findings as the Stage 4 registration
   queue, ordered by candidate-module readiness.
3. Do not "fix" isolation by inventing edges. An isolated node is accurate
   information about an unregistered part of the estate.
