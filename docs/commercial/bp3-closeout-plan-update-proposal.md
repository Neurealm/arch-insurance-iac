# BP3 — Closeout Plan Update Proposal

Status: **Proposal only.** `.lovable/plan.md` has **not** been modified by
`BP3.CLOSEOUT-DOCUMENT`. These changes are to be applied during `BP3.CLOSEOUT-EXECUTE`.

Source evidence for every change: `docs/commercial/bp3-program-closeout.md`,
`docs/commercial/bp3-evidence-index.md`, and the BP3.0–BP3.8 validation decisions.

## 1. Proposed changes

| # | Existing plan wording | Proposed replacement wording | Rationale | Source evidence |
|---|---|---|---|---|
| 1 | (no BP3.0 line exists) | `- **BP3.0** — Contract and Golden Baseline — Completed & Validated.` | BP3.0 received GO but is absent from the package list | `bp3-model-contract.md`, BP3.0.VALIDATE decision GO |
| 2 | `- **BP3.6** — Scenario Comparison Workspace — **Built; Runtime Executed (three-way archived + pairwise saved); Pending Independent Validation**.` | `- **BP3.6** — Scenario Comparison Workspace — **Completed & Validated (GO)**.` | BP3.6.VALIDATE returned GO | `bp3-6-test-evidence.md`; comparisons `22cb9697-f146-4c3d-be1e-d7df841aecce`, `89cd8566-ef82-48a0-806c-6a2a719c2419` |
| 3 | `- **BP3.7** — Sensitivity Analysis — **Built; Runtime Executed (5/5 perturbations completed, 1,660 persisted results, governed failed→draft recovery verified); Pending Independent Validation**. Deferred cosmetic BP3.7.4 (label formatting).` | `- **BP3.7** — Sensitivity Analysis — **Completed & Validated (GO)** (experiment `e2b3499e-a96a-4fd2-8aeb-b8b0fb8fffb9`, 5 perturbations, 15 sensitivity runs, 1,660 results). BP3.7.4 label formatting remains **deferred, non-blocking**.` | BP3.7.VALIDATE returned GO; BP3.7.4 must remain visible as deferred | `bp3-7-test-evidence.md`, `bp3-7-sensitivity.md` |
| 4 | (part of the BP3.7 line) | Retain the explicit "BP3.7.4 … deferred, non-blocking" clause | The deferred item must not be silently dropped or reclassified | `bp3-deferred-items.md` |
| 5 | `- **BP3.8** — Governed Activation, Release Certification, Lineage, Production Handoff — **Built; Runtime Executed (…); Pending Independent Validation**. BP3.7.4 remains deferred.` | `- **BP3.8** — Governed Activation, Release Certification, Lineage, Production Handoff — **Completed & Validated (GO)** (certification `86f09fd7-39f9-4994-bb09-a7ace339634c`, activation `eefc6c50-b73f-41d3-8def-f6ff244000d9`, 22 lineage rows). BP3.7.4 remains deferred.` | BP3.8.VALIDATE returned GO | `bp3-8-test-evidence.md` |
| 6 | `- **PM-FIN-2026.1** — **Active** (certified `86f09fd7…`, activated 2026-07-26 21:18:52 UTC, activation record `eefc6c50…`).` | Preserve, expanding to full identifiers: model version `5097c3a9-021e-4b2c-9377-540a5d18ada6`, certification `86f09fd7-39f9-4994-bb09-a7ace339634c`, activation `eefc6c50-b73f-41d3-8def-f6ff244000d9` | Active status is unchanged; abbreviated IDs should be expanded | `commercial_model_versions`, `commercial_model_activations` |
| 7 | (not currently stated) | `- Successor version PM-FIN-2026.2 — **Not created**.` | Prevents any inference that a successor exists | `bp3-deferred-items.md` DEF-03 |
| 8 | (new) | `- **BP3 Program Closeout Documentation** — Authored.` | Records completion of BP3.CLOSEOUT-DOCUMENT | `bp3-program-closeout.md` |
| 9 | (new) | `- **BP3 Program Closeout Execution** — Pending.` | Records the next stage | This proposal |
| 10 | (new) | `- **BP3 Program Closeout Validation** — Pending.` | Records the final stage | This proposal |

## 2. Execution order

1. Add the BP3.0 package line above BP3.1.
2. Replace the BP3.6, BP3.7 and BP3.8 status lines.
3. Expand the model-version line to full identifiers and add the successor line.
4. Append the three closeout status lines.
5. Leave the "Persistent principles" section unchanged.

## 3. Constraints during execution

1. Do not remove any historical statement about earlier pending validation from evidence documents.
2. Do not mark BP3 formally closed until `BP3.CLOSEOUT-VALIDATE` returns GO.
3. Do not add a successor version line that implies PM-FIN-2026.2 exists.
4. Do not reclassify BP3.7.4.

## 4. Rollback approach

If the plan update is rejected, revert `.lovable/plan.md` to its pre-execution content
(the version current as of 2026-07-26, listing BP3.6–BP3.8 as pending independent validation).
No other artifact depends on the plan text: the closeout record, evidence index and deferred-item
register remain authoritative regardless of whether the plan update is applied.
