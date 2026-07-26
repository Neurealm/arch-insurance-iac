# Program Status

## Model version
- **PM-FIN-2026.1** — **Active** (model version `5097c3a9-021e-4b2c-9377-540a5d18ada6`, certification `86f09fd7-39f9-4994-bb09-a7ace339634c`, activation `eefc6c50-b73f-41d3-8def-f6ff244000d9`, activated 2026-07-26 21:18:52 UTC).
- Successor version **PM-FIN-2026.2** — **Not created** (create only when the next governed model change is required).

## Package status
- **BP3.0** — Contract and Golden Baseline — **Completed & Validated (GO)**.
- **BP3.1** — Assumption Catalog and Runtime Foundation — **Completed & Validated (GO)**.
- **BP3.2** — Revenue Engine — **Completed & Validated (GO)**.
- **BP3.3** — P&L Engine — **Completed & Validated (GO)**.
- **BP3.4** — Cash and Sustainability Engine — **Completed & Validated (GO)** (BP3.4.1 fingerprint).
- **BP3.5** — Governed Assumption Lifecycle — **Completed & Validated (GO)**.
- **BP3.6** — Scenario Comparison — **Completed & Validated (GO)** (comparisons `22cb9697-f146-4c3d-be1e-d7df841aecce`, `89cd8566-ef82-48a0-806c-6a2a719c2419`).
- **BP3.7** — Sensitivity Analysis — **Completed & Validated (GO)** (experiment `e2b3499e-a96a-4fd2-8aeb-b8b0fb8fffb9`, 5 perturbations, 15 sensitivity runs, 1,660 results).
  - **BP3.7.4** — Perturbation percentage-label formatting — **Deferred** (non-blocking, presentation only).
- **BP3.8** — Release Certification, Activation, and Lineage — **Completed & Validated (GO)** (22 lineage rows; no prior active version, so no supersession occurred).

## Program closeout
- **BP3 Program** — **Closed** (formally closed 2026-07-26 by `BP3.CLOSEOUT-VALIDATE`, decision **GO**).
- **BP3 Program Closeout Documentation** — **Complete**.
- **BP3 Program Closeout Execution** — **Complete** (2026-07-26; evidence `docs/commercial/bp3-closeout-execution-evidence.md`).
- **BP3 Program Closeout Independent Validation** — **Complete — Decision GO** (2026-07-26; evidence `docs/commercial/bp3-closeout-validation-evidence.md`).
- **Next phase** — Operational Support and Future Successor Planning.

### Closeout references
- Closeout record — `docs/commercial/bp3-program-closeout.md`
- Evidence index — `docs/commercial/bp3-evidence-index.md`
- Operational handoff — `docs/commercial/bp3-operational-handoff.md`
- Deferred-item register — `docs/commercial/bp3-deferred-items.md`

## Persistent principles
- No automatic model execution. Comparison never triggers Revenue/P&L/Cash re-runs.
- Historical runs, hashes, lineage, and supersession mappings are immutable.
- Activation is metadata-only and never mutates historical runs or results.
