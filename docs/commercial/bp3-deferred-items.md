# BP3 — Deferred-Item, Technical-Debt and Hardening Register

Status: BP3 Program Closed and Independently Validated (2026-07-26, `BP3.CLOSEOUT-VALIDATE`, decision GO).
Authoritative closeout record: `docs/commercial/bp3-program-closeout.md`.

No item in this register is blocking. DEF-06, DEF-07 and DEF-08 are **closed** by BP3
closeout documentation, operational-handoff documentation and independent closeout
validation; their records are retained in full for history. All other items remain open,
deferred and non-blocking.

---

## BP3.7.4 — Perturbation percentage-label formatting

| Field | Value |
|---|---|
| Identifier | BP3.7.4 |
| Description | Perturbation percentage labels render inconsistently on the sensitivity detail view |
| Priority | 3 |
| Current state | Deferred (open) |
| Release impact | None — persisted values, elasticity and tornado ranking are correct |
| Security impact | None |
| Data-integrity impact | None |
| User impact | Minor readability inconsistency |
| Blocking status | Non-blocking (readiness control `SENS-LABEL-FMT` = warning) |
| Recommended owner | Commercial UI engineering |
| Recommended target phase | Next commercial UI maintenance release |
| Remediation recommendation | Normalize percentage formatting in the perturbation label renderer |
| Evidence reference | `docs/commercial/bp3-7-test-evidence.md`, `docs/commercial/bp3-8-test-evidence.md` §19, certified readiness snapshot `86f09fd7-39f9-4994-bb09-a7ace339634c` |
| Closure criteria | Labels formatted consistently and `SENS-LABEL-FMT` returns pass on a refreshed readiness evaluation |

## DEF-02 — Post-activation readiness pass-count display variance

| Field | Value |
|---|---|
| Identifier | DEF-02 |
| Description | After activation the live readiness evaluation may display 20 passes instead of 21 because the `MV-STATUS` control expects `draft` and the version is now `active` |
| Priority | 3 |
| Current state | Open, documented |
| Release impact | None — blocking failure count remains 0 |
| Security impact | None |
| Data-integrity impact | None; the certified snapshot is frozen at 21 passes |
| User impact | Potential misreading of readiness KPI cards |
| Blocking status | Non-blocking |
| Recommended owner | Commercial platform engineering |
| Recommended target phase | Successor-version cycle |
| Remediation recommendation | Make `MV-STATUS` status-aware (accept `draft` pre-activation and `active` post-activation) |
| Evidence reference | `docs/commercial/bp3-8-test-evidence.md` §2 and §19 |
| Closure criteria | Post-activation readiness reports a stable, correctly explained pass count |

## DEF-03 — Successor PM-FIN-2026.2 not created

| Field | Value |
|---|---|
| Identifier | DEF-03 |
| Description | No successor model version exists; the release detail view suggests the code PM-FIN-2026.2 but it is unused |
| Priority | 3 |
| Current state | Open by design |
| Release impact | None |
| Security impact | None |
| Data-integrity impact | None |
| User impact | None until a model change is required |
| Blocking status | Non-blocking |
| Recommended owner | Project Momentous model owner |
| Recommended target phase | When the first post-release formula or assumption change is required |
| Remediation recommendation | Follow the successor workflow in `docs/commercial/bp3-operational-handoff.md` §13 |
| Evidence reference | `docs/commercial/bp3-8-test-evidence.md` §17 |
| Closure criteria | A successor version is registered, certified and activated, superseding PM-FIN-2026.1 |

## DEF-04 — Prior-version supersession evidence not applicable

| Field | Value |
|---|---|
| Identifier | DEF-04 |
| Description | No prior active version existed at activation, so supersession behaviour has no runtime evidence |
| Priority | 3 |
| Current state | Open (not exercised) |
| Release impact | None |
| Security impact | None |
| Data-integrity impact | None; no supersession event was fabricated |
| User impact | None |
| Blocking status | Non-blocking |
| Recommended owner | Commercial platform engineering |
| Recommended target phase | First successor activation |
| Remediation recommendation | Capture supersession evidence during the first successor activation |
| Evidence reference | `docs/commercial/bp3-8-test-evidence.md` §11 |
| Closure criteria | A successor activation records `prior_active_version_id`, `prior_activation_id` and a supersession audit event |

## DEF-05 — Anonymous execution grants on commercial functions

| Field | Value |
|---|---|
| Identifier | DEF-05 |
| Description | Thirty-seven `commercial_*` functions remain anonymously executable at the grant level; each fails closed through authentication and tenant-membership checks |
| Priority | 3 |
| Current state | Open, documented hardening item |
| Release impact | None |
| Security impact | Low — every path fails closed; no data is returned to an anonymous caller |
| Data-integrity impact | None — no write path is reachable anonymously |
| User impact | None |
| Blocking status | Non-blocking |
| Recommended owner | Platform security |
| Recommended target phase | Next security hardening pass |
| Remediation recommendation | Revoke EXECUTE from `PUBLIC` and `anon` on the remaining functions and re-run the security scan |
| Evidence reference | BP3.CLOSEOUT-AUDIT security section; `docs/commercial/bp3-8-test-evidence.md` §14 and §19 |
| Closure criteria | Zero `commercial_*` functions grant EXECUTE to `anon` or `PUBLIC`, with regression evidence |

## DEF-06 — Documentation naming variance

| Field | Value |
|---|---|
| Identifier | DEF-06 |
| Description | Expected artifact names ("BP3.1 Assumption Catalog", "BP3.8 Model Activation") differ from the canonical files that hold that content |
| Priority | 3 |
| Current state | Documentation authored and closeout execution verified, pending final closeout validation |
| Release impact | None |
| Security impact | None |
| Data-integrity impact | None |
| User impact | Risk of a reader concluding a document is missing |
| Blocking status | Non-blocking |
| Recommended owner | Documentation owner |
| Recommended target phase | Closeout execution |
| Remediation recommendation | Canonical mapping recorded in `docs/commercial/bp3-evidence-index.md` §16; no duplicate documents created |
| Evidence reference | `docs/commercial/bp3-evidence-index.md` §16 |
| Closure criteria | Closeout validation confirms every expected artifact resolves to a canonical source |

## DEF-07 — Stale validation-status headers

| Field | Value |
|---|---|
| Identifier | DEF-07 |
| Description | Six BP3 documents carried "Pending Independent Validation" status headers after their packages had received GO |
| Priority | 3 |
| Current state | Status headers reconciled and closeout execution verified, pending final closeout validation |
| Release impact | None |
| Security impact | None |
| Data-integrity impact | None — historical bodies preserved unchanged |
| User impact | Risk of misreading package completion status |
| Blocking status | Non-blocking |
| Recommended owner | Documentation owner |
| Recommended target phase | Closeout execution |
| Remediation recommendation | Dated closeout status notes added to all six documents during BP3.CLOSEOUT-DOCUMENT |
| Evidence reference | `bp3-1-runtime-architecture.md`, `bp3-1-test-evidence.md`, `bp3-2-revenue-formulas.md`, `bp3-5-test-evidence.md`, `bp3-8-release-activation.md`, `bp3-model-contract.md` |
| Closure criteria | Closeout validation confirms no stale current-status header remains |

## DEF-08 — Operational support documentation gap

| Field | Value |
|---|---|
| Identifier | DEF-08 |
| Description | No BP3-specific operational handoff, incident classification or escalation documentation existed |
| Priority | 3 |
| Current state | Operational handoff authored and closeout execution verified, pending final closeout validation |
| Release impact | None |
| Security impact | None |
| Data-integrity impact | None |
| User impact | Operators previously lacked a defined support boundary |
| Blocking status | Non-blocking |
| Recommended owner | Platform operations |
| Recommended target phase | Closeout execution |
| Remediation recommendation | `docs/commercial/bp3-operational-handoff.md` authored; populate named escalation contacts in the operations directory |
| Evidence reference | `docs/commercial/bp3-operational-handoff.md` |
| Closure criteria | Handoff checklist completed and accepted by platform operations |

## DEF-09 — Release-lineage source-hash coverage

| Field | Value |
|---|---|
| Identifier | DEF-09 |
| Description | Only 4 of 22 release-lineage rows carry a `source_hash`; the 18 run-related rows rely on hashes stored on `commercial_model_runs` |
| Priority | 3 |
| Current state | Open enrichment item |
| Release impact | None — lineage integrity check reports 0 broken references |
| Security impact | None |
| Data-integrity impact | None — run hashes remain retrievable |
| User impact | Lineage view shows hashes only for evidence and certification rows |
| Blocking status | Non-blocking |
| Recommended owner | Commercial platform engineering |
| Recommended target phase | Successor-version cycle |
| Remediation recommendation | Populate `source_hash` with the run `input_hash` when writing run-related lineage rows |
| Evidence reference | `docs/commercial/bp3-evidence-index.md` §13 |
| Closure criteria | New lineage rows carry source hashes for all relationship types; historical rows remain unmodified |
