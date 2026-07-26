# CDT Lifecycle Catalogue

Status: Foundation (CDT-REFERENCE-FOUNDATION, 2026-07-26).
Every lifecycle state a user can encounter in the Commercial module, with the standard
explanation set required by every screen chapter §12 and §18.

For each state: meaning, entry conditions, allowed actions, prohibited actions, exit
paths, reversibility, audit implications, user-facing interpretation.

Confidence: C2 unless noted.

---

## 1. State inventory by object

| Object | States |
|---|---|
| Change set | Draft, Validated, Applied, Cancelled, Locked |
| Model run | Running, Completed, Completed with errors, Failed, Superseded |
| Run currency | Current, Stale |
| Comparison | Draft, Saved, Archived (+ "Stale at save" flag) |
| Comparison readiness row | Missing, Stale, Current |
| Sensitivity experiment | Draft, Running, Completed, Failed, Archived |
| Certification | Draft, Certified, Invalidated |
| Readiness control | Pass, Warning, Blocking |
| Model version | Draft, Active |
| Evidence | Immutable |
| Programme scope | Deferred |

---

## 2. Change-set states

### Draft
Meaning: a bundle of proposed assumption changes that has no effect yet.
Entry: `ACT-16`. Allowed: add item, remove item, validate, cancel.
Prohibited: apply. Exit: Validated or Cancelled. Reversible: yes.
Audit: creation and item edits recorded. User reading: *nothing has changed yet.*

### Validated
Meaning: every staged item passed directionality and bounds checks.
Entry: `ACT-19` succeeds. Allowed: apply, cancel, re-edit (returns to validation).
Prohibited: none beyond permissions. Exit: Applied or Cancelled. Reversible: yes.
User reading: *this bundle is safe to commit, but has not been committed.*

### Applied
Meaning: the proposed values are now the effective assumptions.
Entry: `ACT-20`. Allowed: view only. Prohibited: edit, re-apply, cancel.
Exit: none — terminal. Reversible: **no**; correction requires a new change set.
Audit: apply-log entry plus governed audit event.
User reading: *the model inputs changed; downstream results are now stale.*
`IN_APP_WARNING` candidate.

### Cancelled
Meaning: the bundle was abandoned. Entry: `ACT-21`. Allowed: view.
Exit: terminal. Financial effect: none. User reading: *nothing was committed.*

### Locked
Meaning: the change set can no longer accept items (toast "Change set is locked").
Entry: transition out of Draft. User reading: *create a new change set to propose
further changes.*

---

## 3. Model-run states

### Running
Meaning: the engine is computing. Allowed: wait. Prohibited: re-trigger the same
inputs (deduplicated by input hash + runtime fingerprint).
Exit: Completed, Completed with errors, or Failed.

### Completed
Meaning: results persisted successfully. Banner shows run id, completion time and
input hash. Allowed: read, use in comparison and sensitivity, include in release
evidence. Reversible: no — results are immutable. Exit: Superseded when a corrected
rerun replaces it.

### Completed with errors
Meaning: the run finished but reported issues (toasts "Run completed with errors",
"P&L run completed with errors", "Cash run completed with errors").
User reading: *treat these numbers as provisional and investigate before quoting.*
`IN_APP_WARNING` candidate.

### Failed
Meaning: the run did not produce results. The failure banner exposes error code,
message, run id and failure timestamp. Allowed: rerun after remediation.
Note (C2): the Revenue screen distinguishes a *current* failure from a stale historic
failure by comparing the latest failed run's timestamp against the latest completed
run — a historic failure is not surfaced as a current problem.

### Superseded
Meaning: replaced by a corrected run via `supersedes_run_id`.
Prohibited: quoting superseded numbers as authoritative.
Audit: retained permanently. Precedent: BP3.4.1 cash corrections; BP3.4.2 repaired
self-referencing supersession pointers (C5).

---

## 4. Run currency states

### Current
Meaning: the run postdates the most recent applied change set for its
(scope, scenario). Determined by `commercial_program_run_staleness`, which aggregates
`max(applied_at)` per (scope, scenario) after the BP3.8.3 correction (C3/C5).

### Stale
Meaning: assumptions were applied after this run was computed.
Allowed: view, rerun. Prohibited: certification treats staleness as a control input;
comparisons record "Stale at save".
User reading: *these numbers no longer reflect current assumptions — rerun before
deciding.* `IN_APP_WARNING` candidate.

---

## 5. Comparison states

### Draft
Meaning: a comparison definition with on-demand calculation. No snapshot rows exist
("Snapshots persist only on Save"). Allowed: recalculate, save, archive.

### Saved
Meaning: variance rows, roll-up, assumption differences and source-run manifest are
frozen as immutable evidence. Prohibited: edit. Exit: Archived.
The "Stale at save" badge permanently records whether inputs were stale at freeze
time — it is evidence, not a defect.

### Archived
Meaning: retired from active use, content unchanged. Terminal. Reversible: no.

### Readiness row states — Missing / Stale / Current
Missing: no completed run exists for that (scenario, scope). Stale: run predates the
latest apply. Current: run is authoritative. These govern whether a comparison should
be saved at all.

---

## 6. Sensitivity experiment states

### Draft
Entry: `ACT-29`, or recovery from Failed via `ACT-31`. Allowed: execute, archive.

### Running
Entry: `ACT-30`. Perturbations execute against resolved baseline runs.

### Completed
Meaning: perturbation results and tornado ranking are persisted. Terminal except for
archive. Reversible: no.

### Failed
Meaning: execution aborted. Allowed: "Reset to Draft" when the experiment is failed
and unexecuted. Prohibited: partial-result interpretation.
Recovery precedent: BP3.7.3A introduced the governed reset; BP3.7.3B fixed identifier
ambiguity in it (C5).

### Archived
Terminal, immutable, retained as evidence.

---

## 7. Certification states

### Draft
Meaning: a readiness snapshot and release manifest have been captured but not frozen
as authoritative. Allowed: refresh snapshot, certify, invalidate.

### Certified
Meaning: readiness and manifest hashes are frozen and the version may be activated.
Allowed: activate, invalidate. Prohibited: edit.
User reading: *the model has passed the governed readiness gate.*

### Invalidated
Meaning: withdrawn with a recorded reason. Terminal, retained for audit.
Prohibited: activation on this certification.

---

## 8. Readiness control states

### Pass
The control's actual value matches the expected value. No action.

### Warning
A recorded concern that does not prevent certification. Precedent: `SENS-LABEL-FMT`
(1 warning on the certified snapshot, C4). User reading: *note it, proceed.*

### Blocking
Certification and activation are prevented until remediated. Activation requires
`blocking.length === 0` (C2). The readiness table exposes a Remediation column.

---

## 9. Model-version states

### Draft
Meaning: under construction; runnable; the only status from which certification and
activation may proceed. Mutability: governed inputs may still change.

### Active
Meaning: the single authoritative version. Enforced single-active by partial unique
index (C3/C5). The Revenue screen surfaces a notice that runs execute against the
active version's status.
User reading: *this is what the business is entitled to rely on.*
Mutability: read-only for governed inputs. Exit: superseded by activating a successor.
`IN_APP_CONTEXT` candidate: "Read-only because the model version is Active."

---

## 10. Cross-cutting states

### Immutable
Meaning: enforced by database triggers and header guards — completed runs, results,
saved comparison snapshots, certifications, activations and lineage cannot be edited.
User reading: *the record you are viewing can never be silently changed.*

### Deferred
Meaning: known, accepted, non-blocking work not yet implemented
(`docs/commercial/bp3-deferred-items.md`: BP3.7.4, DEF-01…DEF-09).
Rule: never described as implemented; every affected screen chapter §28 must list the
relevant items.

---

## 11. Screen-level UI states (all screens)

| State | Trigger | Standard copy source |
|---|---|---|
| Loading | query in flight | "Loading workspace…", "Loading sources…" |
| Empty | no records | `EmptyState` (e.g. "No comparisons yet", "No account records imported", "No source references configured") |
| No active workspace | no tenant selected and not platform admin | "No active workspace" + "Open Platform" |
| Permission denied | `hasPermission` false | `ForbiddenState` via `PermissionRoute` |
| View-only | run permission absent | badge "View-only (missing commercial.model.run)" |
| Pending data | metric not yet known | badge "Pending" versus "Known" |

---

## 12. End-to-end lifecycle narrative (for Volume 1 §5)

Seed foundation → seed scenarios → review sources → inspect effective assumptions →
create a change set → validate → apply → rerun Revenue → rerun P&L → rerun Cash →
compare scenarios and save the comparison → run a sensitivity experiment → evaluate
release readiness → create a certification → refresh → certify → activate →
(later) create a successor draft and repeat.
