# Stage 3.5.2 — Candidate Relationships

Candidate edges are relationships the framework suspects but cannot prove. They
are returned by `populateCapabilityGraph()` as `candidateEdges` and are **never**
part of the authoritative graph.

## Why they are separated

A weakly inferred relationship that enters the graph becomes indistinguishable
from a declared one after a single rebuild. Once that happens, every downstream
Module Capability Intelligence answer inherits an unprovable assumption. So the
rule is absolute: `evidenceClassification: "weakly-inferred"` never appears on a
graph edge.

## Current candidates

| Count | Kind | Source |
| --- | --- | --- |
| 4 | `BELONGS_TO` → module | Unregistered classification (source-path heuristic) |

Each candidate records:

- `from`, `type`, `to` — the proposed relationship
- `reason` — why it is only a candidate
- `provenance` — source, method, classification and confidence
- `id` — the edge ID it *would* take if promoted

All four are implementation files that sit inside a registered module's source
boundary but are not declared in that module's manifest. That is suggestive, not
conclusive: a file inside a folder is not proof of capability ownership.

## Candidate sources that produce nothing today

| Source | Why it is empty |
| --- | --- |
| Observed AI agents | No agent references inside a registered module boundary |
| Observed workflows | No workflow references inside a registered module boundary |
| Observed integrations | No integration references inside a registered module boundary |
| Page-to-capability inference | SRE capability attribution is already declared |

These will populate as Stage 4 registers modules whose source boundaries cover
the agent, workflow and integration code.

## Promotion process

A candidate becomes a graph edge only by one of two routes:

1. **Declaration** — a human adds the relationship to a module manifest or
   capability registry. The next rebuild emits it as `declared`.
2. **Deterministic evidence** — a generated scan proves it (an actual import, a
   route registration, an observed table reference). The next rebuild emits it as
   `deterministically-discovered`.

There is no automatic promotion path, and none should be added.
