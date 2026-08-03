# Neugain.io Module Map

Status: Stage 1 of the Module Registration & Boundary Framework (2026-08-03).
Method: route registration in `src/App.tsx`, import-graph inspection, navigation
definitions, and data-access inspection. Folder names and navigation labels were
treated as hints only.

| Module | Source | Route surface | Backend | Confidence |
|---|---|---|---|---|
| Commercial Digital Twin | `src/commercial/**` | `/commercial/*` | 27 `commercial_*` tables, `commercial-run-scenario` edge function, `commercial.*` permissions | High |
| Platform Administration | `src/platform/**` (excl. `cae`) | `/platform/*` | tenants, roles, permissions, invitations | High |
| Contextual Audio Enrichment | `src/platform/cae/**` | `/platform/audio` | `audio_*` tables, `audio_resolve_call` RPC | High |
| RunOps (S.E.A.D.) | `src/runops/**` | `/runops/*` | providers + profile data; partially live | High |
| AVEP / Silicon | `src/avep/**`, `src/silicon/**` | `/ai-vlsi-engineering/*` | none (canonical fixtures) | High |
| **SRE Practice** | `src/pages/prod-twin/**` | ~35 flat routes | **none** | Medium |
| Practice Library | `src/pages/practice-library/**` | `/practice-library/*` | none observed | Medium |
| Digital Coworkers | `src/pages/coworkers/**` | `/coworkers/*` | mixed | Medium |
| Carve-Out | `src/pages/carveout/**`, `src/data/carveout.ts` | `/carve-out/*` | none observed | Low |
| CRM / ETDM / Questionnaires | `src/hooks/crm`, `src/hooks/etdm`, `src/pages/questionnaires` | mixed | Supabase-backed | Low |
| SRE Data Orchestration | `/data-orchestration-twin` subtree | nested | none observed | Unable to verify (module assignment) |

Confidence definitions:

- **High** — dedicated source tree, own shell/layout, own route namespace, and either its own database schema prefix or its own permission prefix.
- **Medium** — coherent navigation group and a single source directory, but no route namespace, no permissions, and/or a folder name that does not match the module name.
- **Low** — grouping is inferred from folder placement only.
- **Unable to verify** — the surface exists but no evidence assigns it to a module.

Only the SRE Practice module is registered in Stage 1
(`src/modules/sre/module.manifest.ts`). The remaining modules are registered in
Stage 3.

---

## Stage 2 update (route-table evidence)

The map above was produced from folder and navigation inspection. Stage 2
reconciled it against the extracted route table (436 route entries) and the
implementation inventory (1,387 items):

- Registered: `sre` only — 35 routes, 40 items, 2.9% coverage.
- Platform-owned by policy: 28 routes. Shared: 12. Unregistered: 359.
- Ownership conflicts between modules: 0. Manifest routes missing from the
  router: 0. Unresolvable (computed) route families: 2 (`/avep`, `/runops`).
- Candidate module clusters confirmed by path/folder analysis: `runops` (169
  items), `commercial` (99), `coworkers` (85), `avep` (79), `practice-library`
  (65), `sre-data-orchestration` (64), `cae` (34), `platform` (17); 632 items
  had no reliable cluster signal.

See `route-ownership-report.md`, `route-to-module-matrix.md` and
`unregistered-implementation-report.md` for the underlying data.
