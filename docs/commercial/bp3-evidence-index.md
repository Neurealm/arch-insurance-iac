# BP3 — Consolidated Evidence Index

Status: BP3 Program Closed and Independently Validated (closeout execution 2026-07-26; independent closeout validation 2026-07-26, decision GO).

## 1. How to use the index

This index is the single lookup surface for BP3 evidence. Each entry records the package,
artifact type, path or table, object identifier, hash, status, validation decision, notes,
and whether the artifact is **authoritative** (the governing record) or **supporting**
(context that does not by itself establish a fact). Where an entry conflicts with a
historical document, the runtime evidence recorded here is the current state and the
historical document is preserved unchanged.

## 2. Package-to-document map

| Package | Document | Classification |
|---|---|---|
| BP3.0 | `docs/commercial/bp3-model-contract.md` | Authoritative |
| BP3.0 | `docs/commercial/bp3-formula-catalog.md` | Authoritative |
| BP3.0 | `docs/commercial/bp3-source-cell-map.md` | Authoritative |
| BP3.0 | `docs/commercial/bp3-golden-output-baseline.md` | Authoritative |
| BP3 (all) | `docs/commercial/bp3-delivery-map.md` | Supporting (historical sequencing plan) |
| BP3.1 | `docs/commercial/bp3-1-runtime-architecture.md` | Authoritative (also serves as the BP3.1 assumption/runtime catalog) |
| BP3.1 | `docs/commercial/bp3-1-test-evidence.md` | Authoritative |
| BP3.2 | `docs/commercial/bp3-2-revenue-formulas.md`, `bp3-2-test-evidence.md` | Authoritative |
| BP3.3 | `docs/commercial/bp3-3-pnl-formulas.md`, `bp3-3-test-evidence.md` | Authoritative |
| BP3.4 | `docs/commercial/bp3-4-cash-formulas.md`, `bp3-4-test-evidence.md` | Authoritative |
| BP3.5 | `docs/commercial/bp3-5-governed-assumptions.md`, `bp3-5-test-evidence.md` | Authoritative |
| BP3.6 | `docs/commercial/bp3-6-scenario-comparison.md`, `bp3-6-test-evidence.md` | Authoritative |
| BP3.7 | `docs/commercial/bp3-7-sensitivity.md`, `bp3-7-test-evidence.md` | Authoritative |
| BP3.8 | `docs/commercial/bp3-8-release-activation.md`, `bp3-8-test-evidence.md` | Authoritative |
| BP3.8 (predecessor) | `docs/commercial/bp3-0-2-model-activation.md` | Supporting (superseded design note) |
| Closeout | `docs/commercial/bp3-program-closeout.md` | Authoritative |
| Closeout | `docs/commercial/bp3-deferred-items.md` | Authoritative |
| Closeout | `docs/commercial/bp3-operational-handoff.md` | Authoritative |
| Closeout | `docs/commercial/bp3-closeout-plan-update-proposal.md` | Supporting (proposal, with applied execution disposition) |
| Closeout | `docs/commercial/bp3-closeout-execution-evidence.md` | Authoritative (closeout execution evidence) |
| Operations | `docs/commercial/operator-guide.md` | Supporting |
| Limitations | `docs/commercial/known-limitations.md` | Supporting |

## 3. Package-to-runtime-artifact map

| Package | Artifact type | Table | Count | Status |
|---|---|---|---|---|
| BP3.1 | Model version | `commercial_model_versions` | 1 | Active |
| BP3.2/3.3/3.4 | Model runs (completed) | `commercial_model_runs` | 18 | Completed (9 authoritative) |
| BP3.2/3.3/3.4 | Run inputs | `commercial_model_run_inputs` | 3,033 | Frozen |
| BP3.2/3.3/3.4 | Run results | `commercial_model_results` | 2,324 | Frozen |
| BP3.5 | Change sets | `commercial_assumption_change_sets` | 2 (1 applied, 1 cancelled) | Terminal |
| BP3.5 | Apply log | `commercial_assumption_apply_log` | 1 | Immutable |
| BP3.6 | Comparisons | `commercial_scenario_comparisons` | 2 (1 saved, 1 archived) | Immutable |
| BP3.6 | Comparison results | `commercial_scenario_comparison_results` | 996 | Immutable |
| BP3.7 | Sensitivity experiment | `commercial_sensitivity_experiments` | 1 | Completed |
| BP3.7 | Perturbations | `commercial_sensitivity_perturbations` | 5 | Completed |
| BP3.7 | Sensitivity runs | `commercial_sensitivity_runs` | 15 | Completed |
| BP3.7 | Sensitivity results | `commercial_sensitivity_results` | 1,660 | Immutable |
| BP3.7 | Sensitivity run results | `commercial_sensitivity_run_results` | 1,660 | Immutable |
| BP3.8 | Certifications | `commercial_release_certifications` | 2 (1 certified, 1 invalidated) | Terminal |
| BP3.8 | Activations | `commercial_model_activations` | 1 | Active |
| BP3.8 | Lineage | `commercial_release_lineage` | 22 | Immutable |

## 4. Package-to-validation-decision map

| Package | Execute result | Validation decision |
|---|---|---|
| BP3.0 | N/A (contract) | GO |
| BP3.1 | PASS | GO |
| BP3.2 | PASS (after BP3.2.1) | GO |
| BP3.3 | PASS | GO |
| BP3.4 | PASS (after BP3.4.1/BP3.4.2) | GO |
| BP3.5 | PASS | GO |
| BP3.6 | PASS (after BP3.6.1–BP3.6.4) | GO |
| BP3.7 | PASS (after BP3.7.1–BP3.7.3B) | GO |
| BP3.8 | PASS (after BP3.8.1/BP3.8.3) | GO |
| BP3 Closeout Audit | — | CLOSEOUT_READY_WITH_WARNINGS |
| BP3 Closeout Validate | — | Not yet performed |

## 5. Package-to-remediation map

| Package | Remediation IDs | Outcome |
|---|---|---|
| BP3.2 | BP3.2.1.PATCH | Resolved |
| BP3.4 | BP3.4.1.PATCH, BP3.4.2.PATCH | Resolved |
| BP3.6 | BP3.6.1–BP3.6.4.PATCH | Resolved |
| BP3.7 | BP3.7.1.PATCH, BP3.7.2.PATCH, BP3.7.3.DEPLOY, BP3.7.3A.RECOVERY-PATCH, BP3.7.3B.PATCH | Resolved; BP3.7.4 deferred |
| BP3.8 | BP3.8.1.PATCH, BP3.8.3.PATCH | Resolved |

## 6. Release-baseline IDs

| Item | Value |
|---|---|
| Tenant ID | `d6e1f4a0-ef31-433e-825e-c2f6dc60cfbb` |
| Program ID | `877dcf86-24a4-443f-95bd-28e24952bb80` |
| Program code | `PROJECT_MOMENTOUS` |
| Model-version ID | `5097c3a9-021e-4b2c-9377-540a5d18ada6` |
| Version code | PM-FIN-2026.1 |
| Version status | active |
| Formula catalog version | `bp3.0-catalog-v1` |
| Source fingerprint | `bp3.0-baseline` |
| Activation timestamp | 2026-07-26 21:18:52.696359+00 |
| Activation actor | `04bd0a7f-7487-4ba7-a751-a6540b3b4a33` |
| Certification (certified) | `86f09fd7-39f9-4994-bb09-a7ace339634c` |
| Certification (invalidated) | `4bfd28b0-0d5c-4a1b-a670-66895150ee4b` |
| Activation ID | `eefc6c50-b73f-41d3-8def-f6ff244000d9` |
| Prior active version | None |
| Successor version | Not created |

## 7. Release hashes

| Artifact | Hash |
|---|---|
| Readiness hash (certified `86f09fd7-39f9-4994-bb09-a7ace339634c`) | `d99ed93efb041814fd00e24128546276e35f99096437fc3f2ea306f10fd8498d` |
| Readiness hash (invalidated `4bfd28b0-0d5c-4a1b-a670-66895150ee4b`) | `3783f61785812acac95e241eee11c16aa1a0c9205b05822596acf99d7d842b66` |
| Release manifest hash (both certifications and the activation) | `b76a08eed66bfbbfae339ad814630052d04974035bdbb3e5b193491445bc8413` |
| Certification content hash (certified) | `4884db6f9ece30145f40839176a844954ed4ce64a628bf5a2e9c98a0e3a40053` |
| Certification content hash (invalidated) | `4229f691b57383fd1892c6da76a7fa360fd42daaaa4ee03a1798cebf1f210882` |
| Activation snapshot hash | `ccdfca07b94741384ac1bc5bf66ad2864553d04b3642782f7004793332781ce2` |

## 8. Financial run IDs

Authoritative runs (latest non-superseded completed run per scope and scenario):

| Scope | Scenario | Run ID | Input hash |
|---|---|---|---|
| revenue | CONSERVATIVE | `31d82f8b-ee55-4795-b487-d1f954c34ff7` | `2bd2c9261d770413a412b6f5e722c1ab` |
| revenue | BASE | `922c4a81-9ba1-4ef8-a1e8-b848170b6fb7` | `11e4db7e287382f4addfe18e6d8d5418` |
| revenue | UPSIDE | `256f253e-70d1-46c7-a56f-6cb00adbd81c` | `6d6561fdfa2405ef1cd2d78ce878278f` |
| pnl | CONSERVATIVE | `94e7fb1a-d66c-43c6-9487-f310f3f6cd91` | `f49174eb6f7a0c8ea88f5017825aeb90` |
| pnl | BASE | `1308913a-50e3-4e91-bdcc-ec568c191fe9` | `b35f85eeb5d1797e1545607cae702e01` |
| pnl | UPSIDE | `85d9c1b0-6e5d-4cda-bf24-95391e97e553` | `9e403428e35e4fd14c8e4b363b7746a7` |
| cash | CONSERVATIVE | `9e0ce5f8-5d0c-45e6-b3ac-b4b20ac3e3d8` | `55254764bbf2ea2b264159e5d6238582` |
| cash | BASE | `521cf9e1-2031-4bde-809b-b6b005ed88c7` | `322e70c5dcae33fbce6ff6fae0d30fa1` |
| cash | UPSIDE | `44eab7db-3952-46d3-9c97-f8ebd29f445b` | `0e93889d65de064f759d38dbc63f9687` |

Retained earlier completed runs (supporting evidence, not authoritative):

| Scope | Scenario | Run ID | Input hash | Note |
|---|---|---|---|---|
| revenue | CONSERVATIVE | `8faf610d-758a-4e57-be79-317efcd44e83` | `2a297f6f71d49bc6381e3c64bfe471ca` | BP3.2 original |
| revenue | CONSERVATIVE | `ae7dd1c1-df9a-48ef-ad9c-3fa9eb8c7948` | `406ab59ab054522ec2d7d399d5f502c4` | Post-assumption re-run |
| revenue | BASE | `1c9576c5-f225-4a25-839b-52df904fa7a4` | `e91075d4d3b50f712feb5ef9260b814e` | BP3.2 original |
| revenue | UPSIDE | `a135e1d1-789e-4d06-8d09-9e901c9abee9` | `744085fa5b30211cd10644a65be13757` | BP3.2 original |
| pnl | CONSERVATIVE | `54cc3b9d-9f1f-47b9-886b-23237d4d7cd3` | `4fc1aee99a466da9ec80e137eda9a27d` | BP3.3 original |
| pnl | CONSERVATIVE | `58ee786b-c17f-44c3-b125-025e0f59a2ee` | `4bb66f41e9bfd9fa78e1121bd3d53edb` | Post-assumption re-run |
| pnl | BASE | `862d95f4-ce7c-457f-a5e8-13cc13c246a0` | `c20c11840ca13cd25b034d11db0ec5c0` | BP3.3 original |
| pnl | UPSIDE | `c473055c-502f-448c-9723-ac6781598ee6` | `cadc52035955eecd2a7c8819323de6e3` | BP3.3 original |
| cash | CONSERVATIVE | `2aaab721-c8ba-4aec-9a63-36aa8a8493a4` | `9e1995fb6795521e2b85247acd69510d` | BP3.4.1 replacement, later re-run |

Supersession references (BP3.4.1 replacements): `521cf9e1-2031-4bde-809b-b6b005ed88c7` →
`d225ea9f-5a77-44d5-bd81-5dc64d2da5f2`; `2aaab721-c8ba-4aec-9a63-36aa8a8493a4` →
`e79ba517-4158-4516-8e37-62f09005139a`; `44eab7db-3952-46d3-9c97-f8ebd29f445b` →
`93f33caf-838f-4ee2-9b49-c3dfa671e43d`.

## 9. Governed assumption IDs

| Item | Value |
|---|---|
| Applied change set | `1e3de4be-aa1b-493e-9967-92ecd3ce9521` (hash `ef0deba9e31fad128a797796ed962c905a8426d300e17e17ef0ba21539f14196`, applied 2026-07-25 20:25:48.303564+00) |
| Cancelled change set | `443baaca-ec30-4705-b01e-2232c37bf9d7` (hash `130dd356028d52e577cec32b36c6820a96afc634f59f520c88c39a3eb0e51b98`, cancelled 2026-07-25 21:13:05.22081+00) |
| Apply log | `b160b90f-a99b-486e-98c7-ee52109d3d29` |
| Scenarios | 3 |
| Effective assumptions | 456 (certified control `AS-PRESENT`) |
| Open change sets | 0 |

## 10. Comparison IDs and hashes

| Comparison | ID | Mode | Status | Content hash | Source-run manifest hash |
|---|---|---|---|---|---|
| Pairwise | `22cb9697-f146-4c3d-be1e-d7df841aecce` | pairwise | saved | `8f2a8f802f11ffe062bffadda8d1032e48401b9e7b0c7d01bbda70809c5e6a84` | `2038e67180129e11a0501f87f1c5aabb61ad2d36ca8fdda90553ba19e6f74ec1` |
| Three-way | `89cd8566-ef82-48a0-806c-6a2a719c2419` | three_way | archived | `12c4c39f59c15ee4d48f488865c846393bca5406b27e61aee4fe3402267e3a1b` | `f8240371a22b6f0c8542956ac08205e06ff79d12c1e00f35ed2a4342c55c8ec5` |

Comparison result rows: 996.

## 11. Sensitivity IDs and hashes

| Item | Value |
|---|---|
| Experiment ID | `e2b3499e-a96a-4fd2-8aeb-b8b0fb8fffb9` |
| Perturbed assumption | `COST_ESCALATOR_PCT` |
| Status | completed (2026-07-26 01:55:07.501554+00) |
| Content hash | `65d93959c2e0197ea3ff20b7ae02297e59cecb82cbd141fc69b2185f6d66f992` |
| Baseline-run manifest hash | `47cf6d6f178542972b8897b4ee703ecb9235c971922218e707f7d47dbd5076dc` |
| Perturbations | 5 |
| Sensitivity runs | 15 |
| Results | 1,660 |
| Metrics | 71 |

## 12. Certification and activation IDs

| Item | ID | Status | Timestamp |
|---|---|---|---|
| Certification 1 | `4bfd28b0-0d5c-4a1b-a670-66895150ee4b` | invalidated | created 2026-07-26 20:15:11.853568+00, invalidated 20:18:01.332915+00 |
| Certification 2 | `86f09fd7-39f9-4994-bb09-a7ace339634c` | certified | created 2026-07-26 21:14:38.332976+00, certified 21:15:40.231941+00 |
| Activation | `eefc6c50-b73f-41d3-8def-f6ff244000d9` | active | 2026-07-26 21:18:52.696359+00 |

## 13. Release-lineage summary

22 rows: 9 `assumptions_feed_run`, 9 `produces`, 3 `evidence_for_release`
(2 comparison, 1 sensitivity), 1 `certifies`. Broken references: 0. Cross-tenant rows: 0.
Source-hash coverage: 4 of 22 (DEF-09).

## 14. Audit-event categories

`commercial.model.version.created`, `commercial.model.run.created|started|completed|failed|supersession_reconciled`,
`commercial.assumption.change_set.created|validation_passed|applied|cancelled`,
`commercial.comparison.created|saved|archived`,
`commercial.sensitivity.created|executed|failed|reset|completed`,
`commercial.model.certification.created|refreshed|invalidated|certified`,
`commercial.model.activation.started`, `commercial.model.activated`,
`commercial.program.created|seeded`, `commercial.scenarios.seeded`.

## 15. Route inventory

| Route | Page component |
|---|---|
| `/commercial` | `CommercialOverview` |
| `/commercial/program` | `CommercialProgram` |
| `/commercial/scenarios` | `CommercialScenarios` |
| `/commercial/portfolio` | `CommercialPortfolio` |
| `/commercial/sources` | `CommercialSources` |
| `/commercial/model/revenue` | `CommercialRevenue` |
| `/commercial/model/pnl` | `CommercialPnl` |
| `/commercial/model/cash` | `CommercialCash` |
| `/commercial/model/assumptions` | `CommercialAssumptions` |
| `/commercial/model/assumptions/change-sets/:id` | `CommercialAssumptionChangeSet` |
| `/commercial/model/compare` | `CommercialCompare` |
| `/commercial/model/compare/:id` | `CommercialCompareDetail` |
| `/commercial/model/sensitivity` | `CommercialSensitivity` |
| `/commercial/model/sensitivity/:id` | `CommercialSensitivityDetail` |
| `/commercial/model/release` | `CommercialRelease` |
| `/commercial/model/release/:versionId` | `CommercialReleaseDetail` |

All routes are guarded by `PermissionRoute` with `commercial.view`.

## 16. Canonical naming map

| Expected conceptual artifact | Canonical existing source |
|---|---|
| BP3.1 Assumption Catalog | `docs/commercial/bp3-1-runtime-architecture.md` |
| BP3.8 Model Activation | `docs/commercial/bp3-8-release-activation.md` |
| BP3.7 Sensitivity Design | `docs/commercial/bp3-7-sensitivity.md` (created during closeout documentation) |

No duplicate canonical document was created for an equivalent artifact.

## 17. Missing or deferred documentation

| Item | State |
|---|---|
| BP3.7 sensitivity design document | Authored during closeout documentation |
| Operational handoff guide | Authored during closeout documentation |
| Deferred-item register | Authored during closeout documentation |
| Naming variance reconciliation | Recorded in §16 (DEF-06) |
| Stale status headers | Reconciled in six documents (DEF-07) |

## 18. Closeout-stage references

| Stage | Decision / result | Date | Evidence |
|---|---|---|---|
| `BP3.CLOSEOUT-AUDIT` | `CLOSEOUT_READY_WITH_WARNINGS` | 2026-07-26 | Audit report (chat record), `bp3-deferred-items.md` |
| `BP3.CLOSEOUT-DOCUMENT` | `PASS` | 2026-07-26 | `bp3-program-closeout.md`, this index, `bp3-7-sensitivity.md`, `bp3-operational-handoff.md`, `bp3-deferred-items.md`, `bp3-closeout-plan-update-proposal.md` |
| `BP3.CLOSEOUT-EXECUTE` | Complete | 2026-07-26 | `docs/commercial/bp3-closeout-execution-evidence.md`; `.lovable/plan.md` updated |
| `BP3.CLOSEOUT-VALIDATE` | **GO** | 2026-07-26 | `docs/commercial/bp3-closeout-validation-evidence.md` |

### 18.1 Current `.lovable/plan.md` BP3 status

1. BP3.0 through BP3.8 — Completed and Validated (GO).
2. BP3.7.4 — Deferred, non-blocking, presentation only.
3. PM-FIN-2026.1 — Active; PM-FIN-2026.2 — Not created.
4. BP3 Program Closeout Documentation — Complete.
5. BP3 Program Closeout Execution — Complete (2026-07-26).
6. BP3 Program Closeout Independent Validation — Complete, decision GO (2026-07-26).
7. BP3 Program — Closed. Next phase: Operational Support and Future Successor Planning.

## 19. Final closeout validation

| Field | Value |
|---|---|
| Stage | `BP3.CLOSEOUT-VALIDATE` |
| Decision | GO |
| Validation date | 2026-07-26 |
| Validation evidence | `docs/commercial/bp3-closeout-validation-evidence.md` |
| Final BP3 status | **Closed** |
| Active release | PM-FIN-2026.1 (`5097c3a9-021e-4b2c-9377-540a5d18ada6`), Active; successor PM-FIN-2026.2 not created |
| Operational handoff | `docs/commercial/bp3-operational-handoff.md` |
| Deferred items still open | BP3.7.4, DEF-02, DEF-03, DEF-04, DEF-05, DEF-09 (all non-blocking) |
| Deferred items closed | DEF-06, DEF-07, DEF-08 |

All prior evidence references in sections 1–18 are preserved unchanged.
