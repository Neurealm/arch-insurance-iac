# Stage 3 — Shared Capability Catalog

Source of truth: `src/modules/shared/sharedCapabilities.ts`.

A shared capability is implementation used by more than one module. Registering it here keeps it
out of every module's capability count and forces the ownership question into the open.

| Capability | Owner | Consumers | Status | Maturity | Evidence strength |
| --- | --- | --- | --- | --- | --- |
| Operations Console Shell (EOC) | unassigned | sre, coworkers, practice-library, carve-out | contested | established | client-side-functional |
| Persona Context | unassigned | sre, coworkers | active | emerging | client-side-functional |
| Scenario State | unassigned | sre, runops | contested | emerging | client-side-functional |
| Guided Investigation | unassigned | sre, runops | contested | emerging | client-side-functional |
| Evidence Graph | unassigned | sre, runops | contested | emerging | client-side-functional |
| Contextual Audio Enrichment | cae | commercial, runops, platform | active | hardened | database-backed |
| Contextual Page Guide | commercial | commercial | proposed | established | client-side-functional |

## Ownership gaps

Five capabilities have no primary owner. Governance reports each one as
`shared-capability-without-primary-owner`. Until an owner is assigned, no module can be held
responsible for a regression in shared chrome — this is the single largest structural risk in the
catalog.

## Deliberate omissions

The framework anticipates shared categories that this codebase does not yet contain. They are
**not** registered, because registering an empty capability would mislead Module Capability
Intelligence:

- Notification fan-out beyond toasts and transactional email (email is a platform capability).
- Reporting and export services — no shared export service exists.
- Workflow execution — workflow references in the codebase are descriptive content, not runtime.
- Operational communications (paging, on-call, status pages).
- A shared search or indexing service.

## Contested-capability notes

- **Operations Console Shell** — five widgets in `src/components/eoc/` have zero import sites.
  They are candidates for removal, not ownership.
- **Scenario State** — duplicated by `src/runops/scenario/ScenarioStore.tsx`. One of the two must
  win before either can be declared owned.
- **Contextual Page Guide** — a reusable engine with a single consumer. It is listed as
  `proposed` precisely because "shared" is currently potential, not fact.
