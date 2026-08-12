# Migration Plan

## Principle

Registration is additive. A module is described by a manifest that references
files where they already live. No page, component or route moves in Stages 1–3.

## Stage 1 — foundation (delivered)

- `src/modules/types.ts` — manifest schema, schema version `1.0.0`
- `src/modules/validate.ts` — 15 validation rules, six-level finding model
- `src/modules/registry.ts` — glob discovery, runtime API
- `src/modules/sre/module.manifest.ts` — first registered module
- `src/modules/registry.test.ts` — discovery, rule and evidence-discipline tests
- `docs/modules/*.md` — this document set

No application file was modified; `src/App.tsx`, the sidebar and every SRE page
are untouched.

## Stage 2 — discovery and reporting

1. Export the application route table (derived from `src/App.tsx`) as a known-reference set.
2. Wire `validateRegistry({ routes })` into a dev-only diagnostics view at `/platform/modules`.
3. Emit the unregistered-implementation report (routes claimed by no module).
4. Add ownership-conflict output to the same view.

## Stage 3 — coverage

1. Manifests for Commercial, Platform, CAE, RunOps, AVEP, Practice Library, Coworkers.
2. Assign owners to the shared assets listed in `shared-and-platform-capability-map.md`, removing the OC-01/OC-02 conflicts.
3. Resolve OC-03 (`/data-orchestration-twin`) and AI-05 (unnavigated `*-twin` routes) by owner decision.
4. Governance doc: "how to add a module".

## Stage 4 — Module Capability Intelligence

Inventory snapshots, capability visualisations, benchmark comparison and gap
analysis, reading `getCapabilities()` and `validateRegistry()`.

## Optional later step — physical consolidation

Only after every module is registered and route ownership is unambiguous should
files move into `src/modules/{id}/{pages,components,services,workflows,agents,reports}/`.
Manifests make that move mechanical and verifiable: the validator fails the
moment a declared path stops resolving.
