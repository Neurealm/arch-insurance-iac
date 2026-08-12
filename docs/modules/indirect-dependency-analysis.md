# Stage 2 — Indirect Dependency Analysis

Question answered: *does an SRE screen actually reach data, a service or a
workflow — directly or through anything it imports?*

Method: `scripts/analyze-sre-evidence.mjs` walks the transitive import graph of
every SRE page and classifies each reached dependency. Output is committed to
`src/modules/sre/evidence.generated.ts` (37 page records).

## Dependency classes and how they are counted

| Class | Counted as data backing | Rationale |
|---|---|---|
| Supabase client / RPC / edge-function call | `database`, `service` | Real backend reach |
| Shared data hook (`src/hooks/**`) that touches Supabase | `shared-service` | Real backend reach, indirectly |
| Shared React context / Zustand store | `client-generated-state` | Client state only — **not** a service |
| Local fixture (`src/data/**`, `*Data.ts`) | `local-fixture` | Static content |
| Platform chrome (auth, toasts, activity tracking, layout) | *not counted* | Inherited by every page; proves nothing about the page |

The chrome exclusion is the substantive correction from Stage 1. In Stage 1 an
SRE page importing the sidebar appeared to reach the database, because the
sidebar reaches `AuthContext`, which reaches Supabase. That is a property of the
shell, not of the SRE capability. 33 of 37 SRE pages reach Supabase **only**
through chrome.

Likewise, shared React contexts (`ScenarioStateContext`,
`GuidedInvestigationContext`, `EvidenceGraphContext`) are client state
containers with no persistence, so they are recorded as
`client-generated-state`, not as a service.

## Result for SRE

| Data backing | Pages |
|---|---|
| `client-generated-state` | 37 |
| `local-fixture` | 3 |
| `shared-service` | 0 |
| `database` | 0 |
| `service` / `api` / `workflow` / `agent` | 0 |

**No SRE page has any indirect path to persisted data, an API, a workflow, an
integration or an AI agent.** Every interaction is in-memory and resets on
reload.

## Cross-module indirect dependencies observed elsewhere

Recorded for Stage 3 scoping, not analysed in depth:

- `src/hooks/` mixes platform, commercial and CRM data access in one folder; any
  module manifest that claims the folder would over-claim.
- `src/context/ScenarioStateContext` is consumed by both the SRE cloud twin and
  RunOps scenario screens — a genuine shared capability with no declared owner.
- 25 edge functions are reached only from `commercial`, `platform` and `cae`
  surfaces; none from SRE.
