# Stage 3 — Module Governance Model

Source of truth: `src/modules/governance.ts`. Surfaced at `/platform/modules` → **Governance**.

## Principle

Governance is advisory. It reports on catalog health; it never blocks local development. Only
`error` findings gate a release review (`blocksRelease`). Every finding carries a concrete
remediation — never "stop working".

## Rules

| Rule | Severity | Fires when |
| --- | --- | --- |
| route-without-module-ownership | warning | A route in `src/App.tsx` is claimed by no module, shared or platform capability |
| page-without-registration | warning | A page classifies as product implementation with no registered owner |
| capability-consumed-without-dependency | warning / error | A module consumes a shared capability without declaring it (warning), or declares a `shared.*` dependency that does not exist (error) |
| shared-capability-without-primary-owner | warning | A shared capability has no owning module |
| platform-capability-declared-as-module-owned | error | A module manifest claims a file inside a platform source path |
| agent-or-workflow-referenced-but-unregistered | info | An agent or workflow reference appears in the code but no capability declares it |
| registered-capability-without-evidence | error | A registered capability declares no page, route or component |
| capability-parent-missing | error | A hierarchy node references a parent that does not exist |
| capability-level-mismatch | warning | A node's level does not follow its parent's level |
| duplicate-capability-node | error | A capability ID is declared twice |

## Current state

| Severity | Count |
| --- | ---: |
| error | 0 |
| warning | 748 |
| info | 2 |

`blocksRelease` is **false**: there are no errors. The warning volume is expected — 359 routes
and 381 pages are unregistered because only SRE is registered as a product module. That number
is the Stage 4 workload, expressed as findings rather than prose.

Breakdown by rule:

| Rule | Findings |
| --- | ---: |
| page-without-registration | 381 |
| route-without-module-ownership | 359 |
| shared-capability-without-primary-owner | 5 |
| capability-consumed-without-dependency | 4 |
| agent-or-workflow-referenced-but-unregistered | 1 |

## How the numbers should move

Registering each ready candidate collapses hundreds of warnings at once. The metric to watch is
not "zero warnings" but the ratio of unregistered routes to total routes: 359/436 today.
