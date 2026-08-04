# Stage 3.5.3.4 — Graph Change Simulation and Remediation Proposal Engine

Location: `src/modules/graph/simulation/`. Read-only, deterministic, offline.
Nothing in this stage mutates the canonical graph, registries, manifests,
routes, or source files; no UI, no LLMs, no network.

## Components

| File | Responsibility |
| --- | --- |
| `SimulationTypes.ts` | 19 change operations, proposal/result envelopes, scoring and lineage types |
| `GraphOverlay.ts` | Immutable virtual graph built from proposed changes; deterministic overlay hash |
| `ProposalGeneration.ts` | Maps Stage 3.5.3.3 recommendations to parameterised proposals and alternatives |
| `ProposalValidation.ts` | Structural, endpoint-policy, cycle, duplication and completeness rules |
| `ConflictDetection.ts` | Divergent ownership, duplicate registration, removal dependency, contradictory candidate decisions, simultaneous alternatives, ordering and circular dependencies |
| `SimulationMetrics.ts` | 21+ metrics, metric deltas, recommendation resolution classification, 14 regression kinds, residual risks |
| `ProposalScoring.ts` | Gated benefit / risk / complexity / confidence score with explanation |
| `ProposalBundling.ts` | Deterministic dependency sequencing, parallel groups, rollback order |
| `SimulationEngine.ts` | Public facade: generate, bind, validate, simulate, bundle, compare, scope |

## Guarantees

- The canonical graph hash is captured before and after every simulation and
  reported as `canonicalGraphHashPreserved`.
- Overlay hashes are independent of the order changes are supplied in.
- Ownership is never invented: unresolved owners become required parameters
  with graph-derived candidates.
- Alternatives are surfaced for comparison; the engine states when no
  deterministic policy can choose between them (`decision-required`).
- Incomplete, invalid or blocking-conflict proposals never execute an overlay
  analysis and are gated in scoring.
- Critical regressions cannot be hidden by aggregate benefit.

## Verification

- `src/modules/graph/simulation/simulation.test.ts` — 60 tests covering overlay
  immutability, validation, conflicts, sequencing, metrics, scoring, generation,
  the engine facade and the real repository graph.
- Full repository suite: 650/650 tests passing across 40 files.
- Clean typecheck (`tsconfig.app.json`).
- Canonical graph hash unchanged by the stage.
