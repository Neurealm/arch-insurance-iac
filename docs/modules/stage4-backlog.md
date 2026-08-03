# Stage 4 — Recommended Backlog

Ordered by dependency, not by size. Each item states the decision or the work, and the signal
that proves it is done.

## Track A — Decisions that unblock registration

| # | Decision | Owner | Unblocks |
| --- | --- | --- | --- |
| A1 | Assign a primary owner to the Operations Console Shell, or promote it to platform | Architecture | 4 candidates |
| A2 | Converge the two scenario-state implementations | Architecture | sre, runops |
| A3 | Decide whether CAE is a product module or a shared platform service | Product | cae |
| A4 | Decide the owner of the coworker catalogue (SRE automation vs coworkers) | Product | sre, coworkers |
| A5 | Fold or separate the Data Orchestration Twin | Product | sre-data-orchestration |
| A6 | Retire one of the two modernization roadmaps | Product | sre |
| A7 | Decide the Agentic AI Studio boundary against coworkers | Product | agentic-ai-studio |

## Track B — Registration

| # | Work | Precondition | Done when |
| --- | --- | --- | --- |
| B1 | Register `practice-library` | none | Manifest validates; its 32 routes leave the unregistered list |
| B2 | Register `runops` with warnings | A2 | Manifest records the dynamic route family as unable-to-verify |
| B3 | Register `crm` and `etdm` with warnings | none | Manifests declare their platform dependencies explicitly |
| B4 | Register `agentic-ai-studio` | A7 | Manifest validates |
| B5 | Register `commercial` | C1 | Manifest validates; guide ownership settled |
| B6 | Register `avep` | C2 | Single source root |
| B7 | Register `coworkers` | A4, C3 | Route family namespaced |
| B8 | Register `carve-out` and `questionnaires` | C4 | Boundaries resolvable from source |

## Track C — Architecture cleanup

| # | Work | Affects |
| --- | --- | --- |
| C1 | Move or rename `src/features/commercial-guide/` | commercial |
| C2 | Consolidate `src/avep/` and `src/silicon/` | avep |
| C3 | Consolidate flat `src/pages/Coworkers*.tsx` into `src/pages/coworkers/` | coworkers |
| C4 | Give `questionnaires` a single source root | questionnaires |
| C5 | Namespace ETDM routes away from `/admin` | etdm |
| C6 | Route CRM tenant writes through a platform service | crm, platform |
| C7 | Split `src/App.tsx` into per-module route files | platform |

## Track D — Catalog completion

| # | Work | Done when |
| --- | --- | --- |
| D1 | Human-classify the 367 `unable-to-determine` items | `unableToDetermineCount` falls below 50 |
| D2 | Triage the 211 orphaned items: delete, route, or register | Orphan count falls |
| D3 | Resolve the 12 duplicates | Duplicate count is 0 |
| D4 | Build capability hierarchies for the data-backed modules | Each has a domain root and levelled nodes |
| D5 | Add an application-level error boundary | Platform Error Handling reaches `established` |
| D6 | Decide the fate of the five zero-import EOC widgets | Orphan count falls |

## Track E — Capability Intelligence enablement

| # | Work |
| --- | --- |
| E1 | Define the customer-need taxonomy that capabilities map onto |
| E2 | Add answer-quality guards enforcing the seven rules in the readiness report |
| E3 | Emit a machine-readable catalog export from the registry |
| E4 | Add a CI check that fails on new governance **errors** only |

## Suggested first sprint

A1, A2, B1, B3, D3. Together they settle the largest shared-ownership question, remove the
duplicate surfaces, and take three modules out of the unregistered list — a measurable drop in
the 359 unregistered routes without waiting for any large refactor.
