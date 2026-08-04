# Stage 3.5.3.5 — Controlled Change Plan and Patch Specification

Location: `src/modules/graph/change-plan/`. Planning-only, deterministic,
offline. Nothing in this stage mutates the canonical graph, the simulation
results, the registries, manifests, routes or any source file; no patch is ever
applied, and there is no UI, no LLM and no network.

## Components

| File | Responsibility |
| --- | --- |
| `ChangePlanTypes.ts` | Plans, workstreams, steps, patches, selectors, approvals, tolerances, drift, blockers, lineage and the plan status transition table |
| `ArtifactMapping.ts` | Declared artifact catalog and deterministic node → repository-file resolution |
| `PatchSpecification.ts` | Semantic patch operations, typed selectors, pre/postconditions, before/after state and rollback specifications |
| `PlanEngine.ts` | `GraphChangePlanEngine` facade: scope, decomposition, approvals, validation checkpoints, conflicts, drift and implementation comparison |

## Guarantees

- Only three statuses are emitted: `draft`, `blocked`, `ready-for-review`. The
  full lifecycle table is declared and asserted, never executed here.
- Artifact paths are never invented. A mapping resolves only from the declared
  catalog, registry metadata, node provenance, graph evidence, or a documented
  path convention; otherwise it is reported unresolved and blocks the plan.
- Patches describe intent with typed operations and typed selectors. They never
  contain source code, and are never applied.
- Every patch carries a before-state, an after-state, planning-time and
  execution-time preconditions, postconditions, and a rollback specification.
  Operations with no deterministic inverse are marked manual-rollback-required.
- Approvals are only assigned from declared manifest owners. An unresolved owner
  is a blocker, not a guess.
- Validation checkpoints only cite commands that exist (`npm run test`,
  `npm run build`); everything else cites a rule identifier.
- Tolerances prohibit regression on ownership resolution, route traceability,
  coverage gaps, single points of failure, dependency cycles and incidental
  changes.
- Identical inputs produce byte-identical plans and identical plan ids.

## Verification

- `src/modules/graph/change-plan/changePlan.test.ts` — 41 tests covering static
  contracts, artifact mapping, plan generation over the real repository graph,
  scope resolution, conflicts, drift, implementation comparison and
  immutability.
- Canonical graph hash unchanged by the stage.
- Clean typecheck (`tsconfig.app.json`).
