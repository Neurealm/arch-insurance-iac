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
  control, and the labelled seven-step workflow list.

---

# Stage 3.5.4.3.1 — Workflow Gating and Evidence Hardening

## Hardening summary

**Purpose.** Stage 3.5.4.3 shipped the workspace but left three correctness
gaps: eligibility was expressed in UI disabled-state only, some engine calls
ran without an explicit operator action, and plan-status claims were not
separable into repository-derived evidence and fixture evidence.

**Validation findings addressed**

1. Proposal eligibility was not enforced before simulation.
2. Proposal generation and validation were not explicitly user initiated.
3. Alternative comparison could include ineligible proposals.
4. Change-plan status (`blocked` / `draft` / `ready-for-review`) had no
   testable evidence, and no distinction between measured and fixture data.
5. Parent documentation described a five-stage workflow, and announcements did
   not distinguish an alert from a blocker.
6. Large collections (steps, patches, blockers) rendered unbounded — one real
   plan carries 54 blockers.

**Files and architectural areas changed**

- Added `remediation/eligibility.ts` (canonical policy) and
  `components/remediation/BoundedList.tsx`.
- Added `components/remediation/ParameterPanel.tsx` and
  `components/remediation/ValidationPanel.tsx` (stages 3 and 4 extracted).
- Reworked `RemediationWorkspaceProvider.tsx`: seven stages, explicit action
  handlers, handler-level gate re-checks, staleness bookkeeping, deduplicated
  engine calls, refined announcements.
- Updated `ProposalPanel`, `SimulationPanel`, `AlternativesPanel`,
  `ChangePlanPanel`, `pages/RemediationWorkspace.tsx`,
  `remediationPresentation.ts`.
- Added `remediationGating.test.tsx` and `remediationPlanStatus.test.tsx`;
  updated `remediationSelection.test.tsx` and `remediationWorkspace.test.tsx`.

**Final workflow behaviour.** Nothing is generated, validated, simulated,
compared or planned unless the operator asks for it, and no engine may be
reached unless the canonical policy says so.

## Canonical eligibility policy

Single location: `src/platform/capability-intelligence/remediation/eligibility.ts`.
It is pure and side-effect free, and it never re-implements validation — every
verdict is a projection of the Simulation Engine's own `ValidationResult`
(`outcome` plus the authoritative `executable` flag) and the workspace's
freshness bookkeeping.

| Operation | Policy function |
| --- | --- |
| Simulation | `evaluateSimulationEligibility` |
| Alternative comparison | `evaluateAlternativeEligibility` + `evaluateComparisonEligibility` |
| Change-plan generation | `evaluateChangePlanEligibility` |

Each verdict is `{ eligible, code, reason }`, and `reason` is always populated —
including when eligible — so the UI never has to invent copy.

**Two enforcement points, deliberately.** The verdict decides whether a control
is offered *and is re-evaluated inside the action handler itself*. A stale
render, a resurrected DOM node, a direct programmatic `runSimulation()` call
from context or a test can therefore not reach an engine it is not allowed to:
the handler recomputes the verdict from current state and returns without
calling the engine when it is not `eligible`. Disabled attributes are a
courtesy, not the boundary.

### Canonical handling of each proposal condition

| Condition | Code | Simulation | Comparison | Change plan |
| --- | --- | --- | --- | --- |
| Never validated | `not-validated` | Refused — "Run *Validate proposal* first" | Alternative reported not comparable | Unreachable (no simulation) |
| `valid` | `eligible` | Allowed | Comparable | Allowed once simulated |
| `valid-with-warnings` | `eligible` | Allowed, reason states "executable with warnings" | Comparable | Allowed |
| `incomplete` | `incomplete` | Refused, missing parameters named | Not comparable | Refused |
| `conflicting` (engine outcome) | `conflicting` | Refused | Not comparable | Refused |
| `invalid` | `invalid` | Refused | Not comparable | Refused |
| Any unknown outcome without `executable` | `not-executable` | Refused (fail-closed) | Not comparable | Refused |
| Validation describes another proposal | `validation-mismatch` | Refused | — | Refused |
| Inputs changed after validation | `stale-validation` | Refused until re-validated | — | Refused |
| Required parameters unresolved | `unresolved-parameters` | Refused, parameters named | Not comparable | Refused |
| Inputs changed after simulation | `stale-simulation` | — | — | Refused until re-simulated |
| Critical regression in the simulation | `critical-regression` | — | — | Refused, count stated |
| Simulation hash ≠ workspace hash | `graph-hash-mismatch` | — | — | Refused, both hashes stated |
| Engine call in flight | `busy` | Refused | Refused | Refused |
| Fewer than 2 / more than 4 selected | `too-few-alternatives` / `too-many-alternatives` | — | Refused | — |
| Any selected alternative ineligible | `ineligible-alternatives` | — | Refused, each rejection named | — |

Ordering is intentional: the operator is told the *first* thing to fix, not a
generic refusal.

### Narrowed conflict behaviour

A `simultaneous-alternatives` conflict describes variants that are mutually
exclusive **if applied together**. Simulating one independently selected
variant is exactly how an operator chooses between them, so this conflict type
no longer blocks simulation. Every other blocking conflict type still refuses
simulation with the engine's own explanation. The constraint is enforced where
it actually applies: the comparison stage, where the operator's selected
operation set can genuinely be conflicting, and where each rejected alternative
is named.

## Explicit workflow — the final seven stages

| # | Stage | Entry condition | Action | Completion | Blocked when | Stale when | Downstream cleared/stale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Recommendation | Always | Select recommendation (or deep link) | A recommendation is selected | never | never | Everything below is cleared |
| 2 | Generate proposals | Recommendation selected | **Generate proposals** (explicit) | ≥1 proposal generated and one selected | Engine returns no proposal | Recommendation changed | Parameters, validation, simulation, comparison, plan |
| 3 | Resolve parameters | Proposal selected | Bind values / "Leave unresolved" | No required parameter unresolved | Required parameter unresolved | Proposal changed | Validation, simulation, comparison, plan |
| 4 | Validate proposal | Proposal selected | **Validate proposal** (explicit) | Engine returns a classification for this proposal | — | Parameters or proposal changed | Simulation, comparison, plan |
| 5 | Run simulation | Simulation verdict `eligible` | **Run simulation** (explicit) | Simulation result present | Verdict ineligible; reason shown in the panel | Parameters, proposal or recommendation changed | Change plan |
| 6 | Compare outcomes | Proposal has mutually exclusive alternatives | **Assess alternatives**, then **Compare** (both explicit) | Comparison result present | <2 or >4 selected, or any selection ineligible | Proposal or parameters changed | — |
| 7 | Review change plan | Change-plan verdict `eligible` | **Build change plan** (explicit) | Plan preview rendered | No simulation, stale simulation, ineligible proposal, hash mismatch, critical regression | Any upstream change | — |

Proposal generation and proposal validation are **no longer automatic**. Neither
is simulation, comparison or plan generation. Opening the route — including via
a `?recommendation=` deep link — produces a selected recommendation and nothing
else.

## Engine execution boundaries

| Engine call | Only invoked by |
| --- | --- |
| `generateProposalFromRecommendation` | **Generate proposals** button |
| `validate` | **Validate proposal** button (and **Assess alternatives** for the alternative set) |
| `simulateProposal` | **Run simulation** button |
| `compareAlternatives` | **Compare** button |
| `buildPlanFromSimulation` | **Build change plan** button |

- **Duplicate-request prevention** — a workspace-wide `busy` flag is part of
  every verdict; while a call is in flight every gate returns `busy`, so a
  double click or a concurrent handler cannot enqueue a second identical call.
- **Error behaviour** — an engine throw is caught, the busy flag is released,
  the existing result is left untouched, and the failure is announced
  assertively with the engine's message.
- **Retry behaviour** — retry is a fresh explicit click. There is no automatic
  retry and no backoff loop.
- **Stale-result handling** — stale results stay visible with a warning rather
  than being deleted, so the operator can compare before and after. Nothing is
  re-executed on their behalf.

## Plan-status evidence

### Repository-derived evidence (measured, current)

Measured over the canonical graph with the engine pair used by the workspace:

| Measurement | Value |
| --- | --- |
| Proposals generated | 71 |
| Executable after validation | 25 (`valid` 25, `incomplete` 37, `invalid` 9) |
| Plans buildable | 25 |
| Distinct plan statuses produced | `blocked` only |
| Blockers per plan | 4 – 54 |
| `unresolved-artifact-mapping` occurrences | 260 |
| `unresolved-approval-role` occurrences | 224 |
| `critical-regression` occurrences | 8 |
| `not-recommended-proposal` / `conditional-proposal` | 8 / 4 |

Every real plan is `blocked`, dominated by `unresolved-artifact-mapping` and
`unresolved-approval-role`: the repository does not yet map remediation patches
to concrete artifacts, and approval roles do not resolve to owners. Plans
rendered from this source carry `data-evidence="real-graph"` and the on-screen
line *"Derived from the canonical repository graph"*.

Note on hashes: the standalone evidence harness constructs its own engine pair
over the unpopulated capability graph and therefore records `2a9035f5` on its
plans. The workspace binds the plan engine to the simulation engine's populated
graph, which is why every UI-visible surface reports the canonical `e889b604`.
The evidence test asserts hash *consistency across all plans from one engine
pair* rather than a literal, so it cannot silently drift.

### Fixture evidence

`draft` and `ready-for-review` cannot currently be produced by the real graph.
They are proven with focused fixtures rendered through the real
`ChangePlanPanel`, which stamps them with the exact badge:

> **Fixture — not derived from the repository graph**

Fixture statuses are **not repository evidence**. No current real plan is
ready for review.

## Bounded collections

`BoundedList` renders execution steps, patch specifications and plan blockers
(and any future collection passed to it).

- Initial visible limit: **10** (`DEFAULT_LIST_LIMIT`).
- The true total is always stated — *"Showing 10 of 54 blockers"* — so nothing
  is silently omitted.
- Expansion reveals every record; collapse returns to 10.
- Each list expands independently; steps, patches and blockers do not share
  state.
- Ordering is the engine's own deterministic order, stated in the caption.
- `data-total` and `data-visible` attributes make the contract testable.

## Announcements and accessibility

- **Polite status region** — workflow progress and successful outcomes
  ("Simulation complete", "Change plan generated").
- **Polite blocker summary** — one sentence, deduplicated, re-announced only
  when the blocker identity changes, and cleared when the blocker clears.
- **Assertive alerts** — engine failures and canonical-hash mismatches only.
- **Not-yet-reached states are silent** — `busy`, `no-proposal`,
  `not-validated`, `no-simulation` and `too-few-alternatives` are progress, not
  blockers, so they are never announced as blocked.
- **Stale state** is communicated both in the stage list (`stale`) and in the
  affected panel's warning.
- **Seven-stage semantics** are programmatic: each stage exposes
  `data-testid="stage-<id>"` with `data-state` in
  `locked | available | blocked | stale | complete`, and the progress list is
  labelled for assistive technology.
- The persistent `read-only` chip and the fixture badge are part of the
  accessible name of the surfaces they describe.

**Summarisation example.** The worst real plan carries **54 blockers**. The
announcement is a single sentence — *"Change plan blocked by 54 conditions,
including unresolved-artifact-mapping, unresolved-approval-role,
critical-regression."* — under 240 characters, while the panel still lists
every one of the 54 through `BoundedList`.

## Read-only and governance boundary

The workspace does not, and contains no code path to: approve, reject, execute,
apply patches, assign ownership, register entities, persist parameters, persist
simulations, persist plans, write to Supabase, write repository files, create
branches, commits or pull requests, or mutate the canonical graph. All state is
in-memory and route-scoped; navigating away discards it.

## Real-graph results (current)

- **Default recommendation** — deterministic, derived by canonical priority
  band → priority score → severity → affected-entity count → identifier. No
  identifier is hardcoded.
- **Proposal classifications** — 25 `valid`, 37 `incomplete`, 9 `invalid` of 71.
- **Simulation** — every `valid` proposal simulates; classifications reported
  across all six engine categories; hash before and after is identical.
- **Plan statuses** — 25 of 25 `blocked`.
- **Dominant blockers** — `unresolved-artifact-mapping` (260),
  `unresolved-approval-role` (224).
- **Canonical graph hash** — `e889b604`, unchanged.
- **Performance** — the full 56-file repository suite completes in ≈21 s;
  `analyzeGraph()` still executes exactly once per session.

## Automated tests

| Suite | Tests |
| --- | --- |
| `remediationWorkspace.test.tsx` (3.5.4.3) | engine determinism, hash preservation, plan contracts, routing, gating |
| `remediationSelection.test.tsx` (3.5.4.3) | selection policy, `?recommendation=` matrix, explicit invocation, seven-step labelled list |
| `remediationGating.test.tsx` (3.5.4.3.1) | 52 — explicit lifecycles, simulation/comparison/plan gates, handler-level enforcement, announcement dedup |
| `remediationPlanStatus.test.tsx` (3.5.4.3.1) | 22 — measured real-graph status evidence, labelled fixtures, `BoundedList` |
| Capability Intelligence focused suite | 266 tests across 14 files |
| Simulation engine (`src/modules/graph/simulation`) | included in the graph suite |
| Change-plan engine (`changePlan.test.ts`) | 41 |
| **Repository-wide** | **968 tests across 56 files, all passing** |

Typecheck (`tsgo --noEmit -p tsconfig.app.json`) is clean. Canonical graph hash
`e889b604` is preserved before and after the stage.

## Known limitations

- Every plan the real graph can currently produce is `blocked`.
- The workspace does not resolve artifact mappings or approval roles; that is
  repository data work, not UI work.
- `draft` and `ready-for-review` rendering is proven by fixtures only.
- Workspace state is not persisted; a reload restarts the workflow.
- No authenticated browser-based visual validation was performed for this
  stage; verification is test- and typecheck-based.
- Approval and execution remain deliberately deferred.

## Recommended next stage

Stage 3.5.4.4 — Change Review and Approval Experience. Not started.
