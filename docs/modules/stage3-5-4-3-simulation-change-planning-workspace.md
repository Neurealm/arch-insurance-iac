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
| `RemediationWorkspaceProvider.tsx` | Route-scoped workflow state; owns the memoized engine pair, the seven-stage machine, staleness bookkeeping, request deduplication and handler-level eligibility enforcement |
| `remediation/eligibility.ts` | The canonical eligibility policy (simulation, alternative comparison, change plan) and blocker summarisation |
| `remediation/recommendationSelection.ts` | Deterministic default recommendation and the `?recommendation=` contract |
| `remediationPresentation.ts` | Pure token → label/tone mapping and metric formatting |
| `pages/RemediationWorkspace.tsx` | Seven-stage progressive workflow shell and stage gating |
| `components/remediation/RecommendationPicker.tsx` | Stage 1 — filterable recommendation selection |
| `components/remediation/ProposalPanel.tsx` | Stage 2 — explicit proposal generation, proposal selection, conflicts |
| `components/remediation/ParameterPanel.tsx` | Stage 3 — parameter binding with graph-derived candidates |
| `components/remediation/ValidationPanel.tsx` | Stage 4 — explicit validation invocation and classification display |
| `components/remediation/SimulationPanel.tsx` | Stage 5 — eligibility verdict, gate reason, metric deltas, resolutions, regressions, residual risk |
| `components/remediation/AlternativesPanel.tsx` | Stage 6 — explicit assessment, per-alternative eligibility, gated comparison |
| `components/remediation/ChangePlanPanel.tsx` | Stage 7 — readiness criteria, workstreams, steps, patches, approvals, rollback, drift, evidence source |
| `components/remediation/BoundedList.tsx` | Bounded rendering for steps, patches and blockers |

## Workflow

```text
1 Recommendation → 2 Generate proposals → 3 Resolve parameters → 4 Validate
                                                                    │
                                          6 Compare outcomes ←──────┤
                                                                    ▼
                                                            5 Run simulation
                                                                    ▼
                                                          7 Review change plan
```

Later stages are always visible but locked with an explanation, so the operator
can see the whole path rather than facing hidden UI. Stage 6 is optional: it
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

## Recommendation selection policy

`src/platform/capability-intelligence/remediation/recommendationSelection.ts`
owns the entire selection contract, so both the workspace and the Recommendation
Center hand-off agree on it.

Deep-link contract: `?recommendation=<canonical-recommendation-id>`.

| Parameter state | Behaviour |
| --- | --- |
| Missing | Deterministic default |
| Empty or whitespace | Deterministic default |
| Percent-encoded | Decoded, then matched (a malformed escape is used verbatim rather than throwing) |
| Known id | Selected |
| Unknown id | Deterministic default, plus a visible notice naming the id that was not found |

The deterministic default orders recommendations by canonical priority band,
then priority score, then canonical severity, then affected-entity count, then
the canonical identifier. No identifier is ever hardcoded, and the ordering is
independent of input order. Changing the selected recommendation clears the
proposal, bindings, validation, simulation, comparison and plan preview without
re-running `analyzeGraph()`.

The Recommendation Center renders an **Evaluate remediation** link on every
recommendation card, pointing at the encoded deep link. It is a navigation
hand-off only: nothing is approved, executed or persisted.

## Resolution classifications

The simulation panel reports all six engine classifications — resolved,
partially resolved, unresolved, superseded, invalidated and regressed. A
classification with no members is printed as `none` rather than omitted, so an
operator can distinguish "the engine found none" from "the engine did not
report on this".

## Stale results

Parameter, proposal or recommendation changes never re-simulate. Existing
simulation, comparison and plan results are marked stale and kept visible with a
warning, and the operator re-invokes explicitly.

## Additional verification

- `src/platform/capability-intelligence/remediationSelection.test.tsx` — the
  selection policy (every tie break, input-order independence, empty set,
  comparator antisymmetry), the full `?recommendation=` parameter matrix,
  and real-graph workspace behaviour: deep link, unknown-id fallback notice,
  no automatic simulation or plan generation, single intelligence computation,
  explicit simulation with a polite announcement, all six resolution
  classifications present, read-only status with no approve/reject/execute
  control, and the labelled five-step workflow list.
