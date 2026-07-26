# BP3.8 — Governed Model Certification, Activation, Release Lineage & Production Handoff
## Runtime Evidence Consolidation (BP3.8.EXECUTE)

Result: **PASS** — read-only consolidation. No lifecycle mutation, no migration, no implementation change.

---

## 1. Execution context

| Field | Value |
|---|---|
| Actor (auth.uid) | `04bd0a7f-7487-4ba7-a751-a6540b3b4a33` |
| Tenant | NeuGAIN Commercial — `d6e1f4a0-ef31-433e-825e-c2f6dc60cfbb` |
| Program | Project Momentous — `877dcf86-24a4-443f-95bd-28e24952bb80` (`PROJECT_MOMENTOUS`) |
| Model version | PM-FIN-2026.1 — `5097c3a9-021e-4b2c-9377-540a5d18ada6` |
| Current status | **active** (updated_at 2026-07-26 21:18:52.696359+00) |
| Final certification | `86f09fd7-39f9-4994-bb09-a7ace339634c` — created 21:14:38, certified 21:15:40 |
| Activation record | `eefc6c50-b73f-41d3-8def-f6ff244000d9` — activated 2026-07-26 21:18:52.696359+00 |
| Prior active version | NULL (none existed) |
| Activation reason | `Activate PM-FIN-2026.1 after BP3.1–BP3.8 release certification` |

## 2. Readiness control matrix (frozen certified snapshot)

Controls 22 · pass 21 · warning 1 · blocking failures 0.

Key controls: `MV-EXISTS` pass, `MV-STATUS` pass (`draft` at certification time), `MV-TENANT` pass,
`MV-CATALOG` = `bp3.0-catalog-v1`, `SC-REQUIRED` = 3, `SC-BASELINE` = 1, `AS-PRESENT` = 456,
`AS-NO-OPEN-CS` = 0, `RUN-REVENUE`/`RUN-PNL`/`RUN-CASH` = 3/3/3, `RUN-INPUTS`/`RUN-RESULTS`/
`RUN-HASH`/`RUN-FINGERPRINT` = 0 deficiencies, **`RUN-CURRENT` = 0 stale scopes (pass)**,
`CMP-EVIDENCE` = 2, `SENS-EVIDENCE` = 1, `DOC-CONTRACT` pass, `LIN-INTEGRITY` = 0 broken,
`SEC-TENANT` = 0 inconsistencies, `SENS-LABEL-FMT` = **warning** (BP3.7.4 deferred, non-blocking).

Scenario-scoped staleness remediation (BP3.8.3.PATCH) is confirmed effective: `RUN-CURRENT`
reports `0` stale scopes with zero new runs executed.

Post-activation note: the live readiness evaluation may show pass = 20 because `MV-STATUS`
expects `draft` and the version is now `active`. That control is non-blocking; blocking failure
count remains 0. Not a defect.

## 3. Readiness evidence

Scenarios: Conservative, Base, Upside (3, one baseline). Assumptions: 456 effective values, zero
open governed change sets (draft/cancelled excluded). Runs: 18 completed across revenue/pnl/cash
for all three scenarios; 3,033 persisted run inputs and 2,324 persisted results; all runs carry
input hashes and runtime fingerprints; no stale authoritative run. Comparison evidence: 2
saved/archived comparisons. Sensitivity: 1 completed experiment (`e2b3499e…`) with 5 perturbations,
1,660 results, 71 metrics covered. Documentation BP3.0–BP3.7 referenced. No cross-tenant
inconsistency; no broken lineage reference.

## 4. Certification history

| # | ID | Status | Controls | Pass/Warn/Block | Readiness hash | Manifest hash | Content hash |
|---|---|---|---|---|---|---|---|
| 1 | `4bfd28b0-0d5c-4a1b-a670-66895150ee4b` | **invalidated** (20:18:01, "Manual invalidation") | 22 | 20 / 1 / 1 | `3783f61785812aca…` | `b76a08eed66bfbbf…` | `4229f691b57383fd…` |
| 2 | `86f09fd7-39f9-4994-bb09-a7ace339634c` | **certified** (21:15:40) | 22 | 21 / 1 / 0 | `d99ed93efb041814…` | `b76a08eed66bfbbf…` | `4884db6f9ece3014…` |

The invalidated record was retained unmodified; history is ordered and complete; exactly one
certification (`86f09fd7…`) was consumed by activation.

## 5. Release manifest

Manifest sections: `manifest_version`, `model`, `scenarios` (3), `assumptions` (456),
`applied_change_sets`, `financial_evidence` (9 run records = 3 scopes × 3 scenarios),
`comparison_evidence` (2), `sensitivity_evidence` (1), `documentation`.
`model` = tenant, program, program_code, model_version_id, version_code, version_status (`draft`
at freeze), formula_catalog_version `bp3.0-catalog-v1`, source file
`Neurealm_Citrix_Deal_PL_Model-revised.xlsx`, fingerprint `bp3.0-baseline`.
Sensitivity entry carries experiment ID, content hash, baseline run manifest hash, scopes,
perturbation/result counts and metric coverage. Ordering is deterministic and server-built
(`commercial_release_build_manifest`, STABLE, SECURITY DEFINER); no transient UI state.

## 6. Hashes

| Artifact | Value (prefix) |
|---|---|
| Readiness hash (certified) | `d99ed93efb041814fd00e24128546276e35f99096437fc3f2ea306f10fd8498d` |
| Manifest hash | `b76a08eed66bfbbfae339ad814630052d04974035bdbb3e5b193491445bc8413` |
| Certification content hash | `4884db6f9ece30145f40839176a844954ed4ce64a628bf5a2e9c98a0e3a40053` |
| Activation snapshot hash | `ccdfca07b9474138…` |

Activation-record readiness/manifest/certification hashes match the certification byte-for-byte.
Invalidated certification hashes are unchanged. No BP3.1–BP3.7 hash was rewritten.

## 7. Certification transition & pre-activation consistency

draft → ready → **certified**; `certified_by` and `certified_at` populated; blocking = 0,
warning = 1; readiness snapshot and manifest frozen; certification remains `certified` after
activation; certification alone did not change model status (status was still `draft` at 21:15:40
and only changed at 21:18:52). Immediately before activation: version `draft`, exactly one
eligible certified, non-invalidated certification, hashes matching, single-active preflight clean
(zero active versions existed).

## 8. Activation confirmation & transaction

UI contract (`CommercialReleaseDetail.tsx`): activation button enabled only with
`commercial.model.version.activate` permission + certification `certified` + version `draft` +
zero blocking failures + non-empty reason; a modal then requires typing the exact version code
`PM-FIN-2026.1` before the mutation fires. The persisted reason matches the required string.

Transaction evidence: single activation row, `status = active`, server-derived tenant/program/
actor, certification ownership and status verified, snapshot persisted, version transitioned
draft → active in the same transaction (audit `before_values.status = draft`,
`after_values.status = active`), `prior_active_version_id` and `prior_activation_id` NULL,
lineage persisted (22 rows), audit written, no partial state.

## 9. Activation snapshot

`activation_snapshot` keys: `snapshot_version`, `model_version_id`, `version_code`,
`certification_id`, `readiness_hash`, `manifest_hash`, `certification_hash`, `release_manifest`,
`readiness_snapshot`, `lineage_summary`, `activation_reason`, plus actor/timestamp columns.
Immutable (row guard trigger), tenant-scoped, server-generated; no client-supplied field.

## 10. Release lineage (22 rows, certification `86f09fd7…`)

| Upstream | Downstream | Relationship | Scope | Rows |
|---|---|---|---|---|
| commercial_scenario | commercial_model_run | assumptions_feed_run | revenue / pnl / cash | 3 / 3 / 3 |
| commercial_model_version | commercial_model_run | produces | revenue / pnl / cash | 3 / 3 / 3 |
| commercial_model_version | commercial_scenario_comparison | evidence_for_release | — | 2 |
| commercial_model_version | commercial_sensitivity_experiment | evidence_for_release | — | 1 |
| commercial_release_certification | commercial_model_version | certifies | — | 1 |

`LIN-INTEGRITY` = 0 broken references; all rows tenant-consistent; no fabricated relationship.

## 11. Active-version uniqueness & prior supersession

Exactly **1** active version for NeuGAIN Commercial / Project Momentous = PM-FIN-2026.1. Zero
duplicates. Uniqueness invariant enforced in `commercial_model_activate` under row lock plus the
model-version guard trigger. Prior active version = NULL → supersession **N/A**; no supersession
event was fabricated and no historical version row was altered.

## 12. Post-activation immutability & stale-certification protection

Three non-internal triggers guard `commercial_release_certifications`,
`commercial_model_activations` and `commercial_release_lineage`. RLS policies:
`cma_no_insert` / `crl_no_write` are `WITH CHECK (false)` — direct client inserts impossible;
activation and lineage are SELECT-only to `authenticated`. Certified/invalidated certifications
reject refresh, certify and activate through lifecycle guards in the RPCs; activation rejects any
hash mismatch or invalidated certification. Completed runs, run inputs, results, comparison
snapshots and sensitivity results retain their pre-existing BP3.1–BP3.7 immutability triggers.

## 13. Audit (canonical sequence)

| Time (UTC) | Action | Object |
|---|---|---|
| 20:15:11 | certification.created + refreshed | `4bfd28b0…` |
| 20:15:15 | certification.refreshed | `4bfd28b0…` |
| 20:18:01 | certification.invalidated ("Manual invalidation") | `4bfd28b0…` |
| 21:14:38 | certification.created + refreshed | `86f09fd7…` |
| 21:15:07 | certification.refreshed | `86f09fd7…` |
| 21:15:40 | certification.certified | `86f09fd7…` |
| 21:18:52 | model.activation.started | version `5097c3a9…` |
| 21:18:52 | model.activated | version `5097c3a9…` |

`commercial.model.activated` after_values carry version_code, certification_id, readiness/manifest/
certification hashes, activation_snapshot_id, blocking_failure_count 0, warning_count 1,
prior_active_version_id null, status active; before_values `{status: draft}`; `source = server`.
Single actor and tenant throughout; no duplicate activation event; no confidential payloads.
No `prior_version_superseded` event was emitted (correct — none existed).

## 14. Permissions & security

All release RPCs are `SECURITY DEFINER`, `search_path=public`, owner `postgres`, ACL
`{postgres=X, authenticated=X, service_role=X}` — PUBLIC and anon hold no EXECUTE. Internal guards
(`commercial_release_certification_guard`, `commercial_release_immutable_guard`) are granted only
to `postgres`/`service_role`. Readiness/manifest/hash helpers are STABLE/IMMUTABLE. Actor, tenant
and program are derived server-side; readiness, hashes, lineage and prior-active-version cannot be
forged by the browser (no client-writable path exists). No dynamic SQL; no service-role dependency
in the application runtime; RLS enabled with 8 policies across the three release tables, all
`authenticated`-scoped and tenant-gated.

## 15. Historical integrity & automatic execution

Zero model runs, comparison calculations or sensitivity runs were created by certification or
activation (latest run 2026-07-25 20:36:37; latest comparison 2026-07-26 00:41:52; latest
experiment 2026-07-26 01:09:04 — all predate the 21:14–21:19 release window). Formulas,
assumptions, run inputs/results, input hashes, fingerprints, comparison and sensitivity hashes,
supersession chains, prior audit events and golden baselines are unchanged. Governed mutations
were limited to: final certification lifecycle, activation record, release lineage, model-version
status draft → active, and activation audit.

## 16. UI

`/commercial/model/release` and `/commercial/model/release/:versionId` render the version register,
readiness KPI cards (controls / passing / warnings / blocking failures), and Readiness,
Certification, Lineage and Handoff tabs. PM-FIN-2026.1 renders the `active` badge. Activation is
non-repeatable: `canActivateNow` requires `version.status === "draft"`, so the button is disabled
for the now-active version. Activation history table shows the activation timestamp, status and
certification hash; the certification table shows the certified and invalidated records; lineage is
listed with source hashes. Successor field is present with suggested code PM-FIN-2026.2 and unused.
BP3.7.4 remains disclosed as the single warning control. No browser-side readiness or hash
computation exists in `useModelRelease.ts` — all values are server-returned.

## 17. Successor workflow

No `PM-FIN-2026.2` row exists. No runs, snapshots or audit evidence were copied. Successor creation
is not required for BP3.8.EXECUTE.

## 18. Regression

Overview, Program, Portfolio, Scenarios, Sources, Assumptions, Revenue, P&L, Cash, Scenario
Comparison, Sensitivity and Release & Activation routes remain registered and operational.
BP3.1–BP3.7 evidence intact: 18 completed runs, 2 comparisons, 1 completed sensitivity experiment.

## 19. Known warnings

- BP3.7.4 perturbation percentage-label formatting — deferred, presentation-only, non-blocking.
- Post-activation readiness may display pass = 20 rather than 21 because the draft-only
  `MV-STATUS` control no longer passes; blocking failure count remains 0.
- `anon` retains a table-level SELECT grant on the release tables, but every RLS policy targets
  `authenticated` with tenant membership, so anon reads return zero rows.

## 20. Remaining issues

- BP3.8 independent validation pending (BP3.8.VALIDATE).
- Successor version PM-FIN-2026.2 not created.
- BP3.7.4 deferred.
