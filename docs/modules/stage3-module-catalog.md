# Stage 3 — Enterprise Module Catalog

The consolidated view of what Neugain.io consists of, as of Stage 3. Three registers plus a
candidate pipeline.

## Registered product modules (1)

| Module | Routes owned | Capabilities | Evidence |
| --- | ---: | ---: | --- |
| sre — SRE Practice | 35 | 8 flat, decomposed to 22 hierarchy nodes | Client-side only; no database usage |

## Registered shared capabilities (7)

See `stage3-shared-capability-catalog.md`. Five of the seven have no primary owner.

## Registered platform capabilities (11)

See `stage3-platform-capability-catalog.md`. Eight are marked as frequently miscounted and are
protected by an error-severity governance rule.

## Candidate product modules (12)

See `stage3-candidate-modules.md`.

| Readiness | Candidates |
| --- | --- |
| ready-to-register | practice-library |
| register-with-warnings | runops, agentic-ai-studio, crm, etdm |
| requires-architecture-cleanup | commercial, avep, coworkers, carve-out, questionnaires |
| requires-product-owner-review | cae, sre-data-orchestration |

## Route coverage

| Ownership | Routes |
| --- | ---: |
| module-owned | 35 |
| platform-owned | 28 |
| shared | 12 |
| unregistered | 359 |
| ownership-conflict | 0 |
| unable-to-verify | 2 |
| **Total** | **436** |

## Domain signals by cluster

Evidence density per source cluster, from `src/modules/generated/domainSignals.ts`.

| Cluster | Files | Data-access files | Tables | RPCs | Edge functions |
| --- | ---: | ---: | ---: | ---: | ---: |
| commercial | 120 | 13 | 20 | 28 | 1 |
| runops | 114 | 0 | 0 | 0 | 0 |
| avep | 55 | 0 | 0 | 0 | 0 |
| coworkers | 51 | 0 | 0 | 0 | 0 |
| sre | 39 | 0 | 0 | 0 | 0 |
| cae | 34 | 4 | 7 | 11 | 0 |
| practice-library | 34 | 0 | 0 | 0 | 0 |
| sre-data-orchestration | 32 | 0 | 0 | 0 | 0 |
| crm | 30 | 8 | 19 | 0 | 2 |
| platform | 24 | 10 | 2 | 22 | 0 |
| questionnaires | 13 | 8 | 13 | 0 | 3 |
| agentic-ai-studio | 13 | 0 | 0 | 0 | 0 |
| etdm | 10 | 3 | 2 | 4 | 0 |
| carve-out | 1 | 0 | 0 | 0 | 0 |
| edge-functions (server) | 22 | 15 | 17 | 13 | 16 |

The headline observation: the product surface splits cleanly into a data-backed half
(commercial, crm, questionnaires, cae, platform, etdm) and a presentation half (runops, avep,
coworkers, sre, practice-library, carve-out, agentic-ai-studio) that touches no database at all.
Capability Intelligence must never conflate the two.
