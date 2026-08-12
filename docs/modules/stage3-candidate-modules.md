# Stage 3 — Candidate Module Report

Produced by `discoverCandidateModules()` (`src/modules/candidates.ts`). A candidate is proposed
only where a route grouping, a source grouping and a navigation grouping agree. Database,
edge-function, agent and workflow signals raise confidence but are not required — several
candidates are legitimately client-side.

A navigation heading alone is never sufficient evidence for a module.

## Candidates

| Candidate | Routes | Files | Nav | Data-access files | Readiness | Confidence |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| commercial — Commercial Digital Twin | 19 | 120 | 16 | 13 | requires-architecture-cleanup | medium |
| runops — S.E.A.D. RunOps | 54 | 114 | 1 | 0 | register-with-warnings | medium |
| avep — AI VLSI Engineering Platform | 23 | 55 | 20 | 0 | requires-architecture-cleanup | medium |
| cae — Contextual Audio Enrichment | 9 | 34 | 5 | 4 | requires-product-owner-review | medium |
| practice-library — Practice Library | 32 | 34 | 21 | 0 | ready-to-register | medium |
| coworkers — Digital Coworkers | 78 | 52 | 10 | 0 | requires-architecture-cleanup | medium |
| sre-data-orchestration — SRE Data Orchestration Twin | 31 | 32 | 1 | 0 | requires-product-owner-review | medium |
| agentic-ai-studio — Agentic AI Architecture Studio | 1 | 13 | 1 | 0 | register-with-warnings | medium |
| carve-out — Carve-Out Command Centers | 49 | 2 | 1 | 0 | requires-architecture-cleanup | medium |
| questionnaires — Questionnaires and Evidence | 2 | 13 | 0 | 8 | requires-architecture-cleanup | medium |
| crm — Customer and Stakeholder Management | 4 | 30 | 0 | 8 | register-with-warnings | medium |
| etdm — Enterprise Technology Domain Model | 8 | 10 | 0 | 3 | register-with-warnings | medium |

## Readiness semantics

- **ready-to-register** — boundary is clean; a manifest can be written directly.
- **register-with-warnings** — registerable now, but the manifest must record the listed risks.
- **requires-architecture-cleanup** — the code must move or the routes must be namespaced first.
- **requires-product-owner-review** — the evidence is clear but the *product* boundary is a
  human decision.
- **insufficient-evidence** — do not register.

## Notable findings

- **commercial** has the strongest evidence of any candidate (20 tables, 28 RPC calls, 120
  files) but its guide framework lives outside `src/commercial/`, which is why it is not
  "ready".
- **runops** and **avep** are large and coherent but generate part of their route family at
  runtime; those routes cannot be statically owned.
- **carve-out** shows 49 routes against 2 source files: the surface is one dynamic route driven
  by a single data file. This is a content system, not 49 screens.
- **crm**, **questionnaires** and **etdm** have real database footprints but no navigation
  grouping — they are reachable only by direct link or from another module's page.
- **cae** is already registered as a shared capability. Whether it is *also* a product module is
  a product decision, hence the review status.
- **ITSM** was considered and rejected as a separate candidate: its screens live under
  `/practice-library/it-service-desk-itsm` and belong to the practice-library boundary.
