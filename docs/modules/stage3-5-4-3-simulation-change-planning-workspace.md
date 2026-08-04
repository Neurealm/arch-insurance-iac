# Stage 3.5.4.3 — Simulation and Change Planning Workspace

Route: `/platform/capability-intelligence/remediation` (Platform administrators
only, lazy-loaded inside the existing `/platform` shell).

The workspace is the operator surface for the Stage 3.5.3.4 simulation engine
and the Stage 3.5.3.5 change-plan engine. It is planning-only: nothing here
mutates the canonical graph, the registries, the manifests, the route table or
any repository file, and **no patch is ever applied**.

## Components

| File | Responsibility |
| --- | --- |
| `RemediationWorkspaceProvider.tsx` | Route-scoped workflow state; owns the memoized engine pair and defers every engine call off the commit path |
| `remediationPresentation.ts` | Pure token → label/tone mapping and metric formatting |
| `pages/RemediationWorkspace.tsx` | Five-stage progressive workflow shell and stage gating |
| `components/remediation/RecommendationPicker.tsx` | Stage 1 — filterable recommendation selection |
| `components/remediation/ProposalPanel.tsx` | Stage 2 — proposals, parameter binding, validation, conflicts |
| `components/remediation/SimulationPanel.tsx` | Stage 3 — metric deltas, resolutions, regressions, residual risk, score derivation |
| `components/remediation/AlternativesPanel.tsx` | Stage 4 — mutually exclusive alternative comparison |
| `components/remediation/ChangePlanPanel.tsx` | Stage 5 — workstreams, steps, patch specifications, approvals, validation checkpoints, rollback, drift |

## Workflow

```text
1 Recommendation  →  2 Proposal  →  3 Simulation  →  5 Change plan
                          └─────→  4 Alternatives
```

Later stages are always visible but locked with an explanation, so the operator
can see the whole path rather than facing hidden UI. Stage 4 is optional: it
reports plainly when a proposal has no mutually exclusive alternative.

## Guarantees

- Engines run only in response to an explicit user action, never during render,
  and always after the busy state has painted.
- The simulation engine is the process-wide instance, so its baseline snapshot
  is computed at most once per browser session and shared with the other
  Capability Intelligence screens.
- The change-plan engine is bound explicitly to the simulation engine's
  populated graph. Without that binding it would default to the unpopulated
  capability graph and report a different canonical hash than every other
  Capability Intelligence surface.
- The canonical graph hash before and after every simulation is surfaced in the
  UI, including the failure case (`Canonical graph changed — investigate`).
- Parameters the engine refuses to invent are surfaced with their graph-derived
  candidates and support scores. "Leave unresolved" is always available, and an
  unresolved required parameter produces an `incomplete` validation outcome
  rather than a guessed value.
- Presentation never softens a verdict: `not-recommended`, `invalid`, `blocked`
  and `regressed` all map to critical tones, and unknown tokens fall through to
  the raw engine value.
- Only the three emittable plan statuses (`draft`, `blocked`,
  `ready-for-review`) can appear; the workspace has no approve or execute
  action.

## Copy correction carried in this stage

`summarizeGraphWarningsForAnnouncement` (Stage 3.5.4.2.2) repeated an identical
spoken clause when a node-limit truncation and an edge-limit truncation were
both present. Distinct warnings remain distinct cards; the polite announcement
now states each distinct clause once.

## Verification

- `src/platform/capability-intelligence/remediationWorkspace.test.tsx` — engine
  determinism and canonical-hash preservation over the real repository graph,
  plan status and immutability contracts, presentation mapping, route
  authorization and stage gating.
- `src/platform/capability-intelligence/graphWarningDeduplication.test.ts` —
  extended with the truncation announcement copy correction.
- Clean typecheck (`tsconfig.app.json`).
- Canonical graph hash unchanged by the stage.
