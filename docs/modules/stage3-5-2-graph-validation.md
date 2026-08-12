# Stage 3.5.2 — Graph Validation Summary

## Structural validation

`validateGraph()` against the fully populated graph:

| Severity | Count |
| --- | --- |
| Error | 0 |
| Warning | 5 |
| Info | 65 |
| Overall | **ok** |

### Warnings

All five are `shared-capability-without-owner`: shared capabilities consumed by
SRE whose primary owner has not been agreed. Ownership of a shared capability is
a governance decision, not something the builder may assume, so these remain
warnings until a human assigns an owner in the shared capability registry.

### Info

The 65 info findings are `orphan-node` records — nodes of a type that should be
connected but currently are not. They mirror the orphan analysis and are
tracked in `stage3-5-2-graph-orphan-analysis.md`.

## Invariants enforced

| Invariant | Enforced by | Status |
| --- | --- | --- |
| Every node ID is unique and content addressed | Population builder | Pass |
| Every edge ID is unique | Population builder | Pass |
| No dangling edge endpoints | Validator | Pass |
| No self-referencing edges | Validator | Pass |
| Every edge respects `EDGE_ENDPOINT_POLICY` | Validator | Pass |
| Containment (`BELONGS_TO`) is acyclic | Validator | Pass |
| One implementation file, one node | Reconciler | Pass (3 intentional customer-extension pairs) |
| Every node and edge carries provenance | Population builder | Pass |
| No weakly inferred edge in the graph | Population builder | Pass |
| Rebuild is byte-stable | Content hash | Pass (`e889b604`) |

## Test coverage

`src/modules/graph/population.test.ts` — 29 tests covering:

- Deterministic node and edge creation across rebuilds
- Content-hash stability and hash change on source change
- Registry, hierarchy, shared and platform population
- Route-to-page, page-to-capability, permission, database relationships
- Workflow, agent and integration endpoint-policy conformance
- Provenance presence on every edge
- Candidate-edge isolation, ordering and de-duplication
- Duplicate node and duplicate edge reconciliation
- Orphan detection and legitimacy classification
- Statistics consistency and machine-readable output
- SRE slice composition, chrome exclusion and no mock promotion

Suite status: 127/127 module tests pass, whole application suite green, typecheck
clean. No existing behaviour changed.
