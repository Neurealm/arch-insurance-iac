# Stage 3.5.2 — Graph Reconciliation Report

Produced by `reconcileGraph()` in `src/modules/graph/reconcile.ts`.

Reconciliation compares what the registries *declare* against what the generated
inventories *observe*. It reports; it never silently resolves.

## Summary

| Severity | Findings |
| --- | --- |
| Conflict | 0 |
| Warning | 9 |
| Info | 649 |
| Requiring human review | 267 |

## Findings by rule

| Rule | Count | Meaning |
| --- | --- | --- |
| `implementation-node-not-registered` | 613 | Real implementation exists, no manifest claims it |
| `implementation-relationship-not-declared` | 29 | Observed import relationship absent from the manifest |
| `declared-edge-without-implementation-evidence` | 7 | A declared relationship the scan could not confirm |
| `declared-node-without-implementation` | 6 | A manifest reference with no matching file |
| `duplicate-node-representation` | 3 | One file represented by two node types |

## Duplicate node reconciliation

The rule is one implementation file, one node. Route nodes are exempt: a route
legitimately carries the file path of the page it renders.

The three remaining duplicates are intentional dual representations of
customer-specific Project Momentous assets, which exist both as their technical
type and as a `customer-extension`:

- `src/commercial/components/SeedMomentousButton.tsx`
- `src/commercial/hooks/useProjectMomentous.ts`
- `src/commercial/hooks/useProjectMomentousScenarios.ts`

These are recorded as warnings so that a human decides whether the customer
extension or the technical node is canonical.

## Ownership conflicts

Zero. No node is claimed by two owners. This is expected while SRE is the only
registered module and will need re-checking as Stage 4 registers more modules.

## Declared-but-unconfirmed relationships

Seven declared edges could not be confirmed by the static scan. They are kept in
the graph — a manifest declaration is authoritative — but flagged with
`validationState: "unverified"` so they can be re-checked when the module is
next reviewed.

## Resolution policy

| Situation | Policy |
| --- | --- |
| Declared vs observed disagree | Keep the declared fact, flag as unverified |
| Two owners claim one node | Report as a conflict, resolve by human decision |
| Observed relationship not declared | Keep it, mark as deterministically discovered |
| No source at all | Do not create the fact |
