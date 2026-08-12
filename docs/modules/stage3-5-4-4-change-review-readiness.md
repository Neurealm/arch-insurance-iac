# Stage 3.5.4.4 — Change Review Readiness and Approval Requirements

Screen 5 of the Capability Intelligence UI. Route:
`/platform/capability-intelligence/remediation/review` (Platform Admin guarded).

## Purpose

Explain whether the current change-plan preview is ready to enter a formal
review, and exactly what stands in the way.

## Explicit non-goals

The screen records **no** approval decision. It offers no approve, reject,
waive, override, execute, apply or merge control, resolves no artifact mapping,
assigns no person to a role, persists nothing and never mutates the canonical
graph, a registry, a manifest or any file. It also runs **no engine**:
"Prepare review package" groups results the Remediation Workspace already
produced; it never regenerates a proposal, re-validates, re-simulates or builds
a second plan. A blocked plan produces a blocked review package.

## Architecture

| Concern | Location |
| --- | --- |
| Readiness gate matrix (16 gates) | `src/platform/capability-intelligence/review/gateMatrix.ts` |
| Review presentation model | `src/platform/capability-intelligence/review/reviewPackage.ts` |
| Navigation contract | `src/platform/capability-intelligence/review/reviewLink.ts` |
| Page | `src/platform/capability-intelligence/pages/ChangeReviewReadiness.tsx` |
| Panels | `src/platform/capability-intelligence/components/review/` |
| Shared session layout | `src/platform/capability-intelligence/pages/RemediationLayout.tsx` |

`remediation` is now a layout route. The workspace remains its index child, so
`/platform/capability-intelligence/remediation` is unchanged; both children
share one `RemediationWorkspaceProvider` and therefore one session-local plan.
Change plans are never persisted, so a hard refresh of the review URL shows a
"no current review package" state that names the six workflow actions required.

`buildReviewPackage` is pure and deterministic; the page memoises it on the
identity of the engine results, so expanding a bounded list or opening the
drawer rebuilds nothing.

## Sections

Executive summary, gate matrix (captioned accessible table), blocker analysis
(grouped by canonical kind with fixed severity and canonical resolution),
artifact mapping readiness (resolved / multiple candidates / unresolved / human
selection required), approval requirements by role, validation checkpoints and
tolerances, rollback readiness, patch review, workstream readiness, and the
evidence package with canonical IDs.

There is deliberately **no aggregate readiness score or percentage**. The
canonical plan status stays authoritative.

## Measured real-graph evidence

Measured against canonical graph hash `e889b604` (1,291 nodes, 889 edges):

- 25 executable proposals produce 25 change plans; **all are `blocked`**.
- The largest plan carries **26 steps and 26 patches** (54 blockers, 26 required
  approvals). Every step is specified by exactly one patch, which is why the
  step and patch counts are equal.
- Dominant blocker kinds: `unresolved-artifact-mapping` and
  `unresolved-approval-role`.

## Corrections carried in this stage

- `remediationPlanStatus.test.tsx` now binds the change-plan engine to the
  **populated** graph (`getPopulatedGraph().graph`), matching the graph the
  simulation engine reasons over. It previously bound to the unpopulated
  skeleton from `getCapabilityGraph()`.
- Documented plan size corrected from 25 to **26** steps and patches, measured
  rather than assumed, and asserted in the test suite so a repository change
  fails loudly.

## Verification

- `src/platform/capability-intelligence/changeReviewReadiness.test.tsx` — 26 tests.
- Full suite: **995 passing** (57 files). Typecheck clean.
- Canonical graph hash `e889b604` unchanged.
