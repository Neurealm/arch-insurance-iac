# CDT Reference Gap Register

Status: Foundation (CDT-REFERENCE-FOUNDATION, 2026-07-26).
Open research items that must be resolved before the affected chapters are authored.
No gap in this register blocks Volume 1.

Columns: what is confirmed · what is unknown · missing source · follow-up · blocks.

---

## GAP-01 — Direct scenario assumption writes versus governed change sets

**Confirmed (C2):** `CommercialScenarios` (SCR-03) edits assumption values in place
and persists them with a "Save changes" control through
`useProjectMomentousScenarios`, writing to `commercial_scenario_assumptions`.
**Confirmed (C5):** BP3.5 establishes change sets as the governed path for assumption
change, with validation, apply-log and staleness propagation.
**Unknown:** whether the direct-write path also triggers staleness propagation and an
audit event; which permission the database enforces on it; whether the two paths are
intentionally coexisting (directional seeding versus governed modelling) or whether
one supersedes the other in current policy.
**Missing source:** RLS policy and trigger definitions on
`commercial_scenario_assumptions`; BP3.5 policy statement on the seeding path.
**Follow-up:** inspect the table's policies, triggers and grants read-only.
**Blocks:** Volume 2 chapter 2.3; Volume 3 §3.3 (`ACT-15`).
**Disposition:** record both behaviours; deployed behaviour is the current-state
authority; do not reconcile in prose.

---

## GAP-02 — Stale documentation headers

**Confirmed (C5):** `docs/commercial/bp3-delivery-map.md` and
`docs/commercial/architecture.md` still carry "Pending Independent Validation"
headers despite BP3 closeout returning GO. Tracked as DEF-07.
**Unknown:** nothing material.
**Follow-up:** none required for authorship; cite closeout documents instead.
**Blocks:** nothing.

---

## GAP-03 — Program screen management capability

**Confirmed (C2):** `commercial.program.manage` exists and is exposed by
`useCommercialAccess`; `CommercialProgram` renders Operating Gates and metrics with
no mutating control.
**Unknown:** whether program/gate management is deferred, handled elsewhere, or
intentionally read-only.
**Missing source:** BP2 delivery map statement on gate management scope.
**Follow-up:** confirm from `bp2-delivery-map.md` and the deferred register.
**Blocks:** Volume 2 chapter 2.2 §11 and §28.

---

## GAP-04 — Audit-event code catalogue

**Confirmed (C3/C5):** governed operations are executed by `SECURITY DEFINER` RPCs
that write to the commercial audit trail; the BP3 closeout verified the activation
audit sequence.
**Unknown:** the exact audit event code emitted by each of the 28 RPCs.
**Missing source:** function bodies / `audit_events` distinct event types.
**Follow-up:** read-only enumeration of distinct commercial audit event types and
their emitting function.
**Blocks:** Volume 3 §17 for §3.4–3.8; Volume 6 §7.

---

## GAP-05 — Absent conveniences recorded as non-features

**Confirmed (C2):** no pagination, sorting, export, print, bulk import, post-save
comparison editing, un-archive, de-activation or run deletion exists in the current
Commercial UI.
**Unknown:** whether any of these are planned.
**Follow-up:** confirm against the deferred register before Volume 5 workflow copy.
**Blocks:** nothing; prevents invention.

---

## GAP-06 — Revenue dimensional breakdown

**Confirmed (C2):** revenue decomposes into eleven `REV-nn` lines plus ARR
aggregates.
**Unknown:** whether product, channel or geography dimensions exist anywhere in the
model contract.
**Missing source:** `bp3-2-revenue-formulas.md`, `bp3-source-cell-map.md`.
**Follow-up:** confirm the supported dimension set.
**Blocks:** Volume 4 §4 dimensional subsection.

---

## GAP-07 — Duplicate P&L metric code families

**Confirmed (C2):** both `PL-*` (`PL-EBITDA`, `PL-GROSS-PROFIT`,
`PL-EBITDA-MARGIN-PCT`, `PL-GROSS-MARGIN-PCT`) and `PNL-*` (`PNL-EBITDA`,
`PNL-GROSS-PROFIT`, `PNL-EBITDA-MARGIN`, `PNL-REVENUE`) code families appear in
source.
**Unknown:** which family is persisted in `commercial_model_results` and which is
display-only or legacy.
**Missing source:** distinct metric codes in `commercial_model_results` for the
active version.
**Follow-up:** read-only distinct-code query scoped to the active version.
**Blocks:** Volume 4 §5 metric entries.

---

## GAP-08 — Cash concepts not modelled

**Confirmed (C2):** inventory and capital expenditure metric codes are absent from
the cash scope.
**Unknown:** whether they are out of scope by design for a services program or simply
deferred.
**Missing source:** `bp3-4-cash-formulas.md` scope statement.
**Follow-up:** confirm and state explicitly rather than omitting.
**Blocks:** Volume 4 §6 completeness statement.

---

## GAP-09 — Tenant role to permission-code mapping

**Confirmed (C2/C3):** permission codes are checked per tenant via `AccessContext`;
`tenant_roles`, `tenant_role_permissions` and `permissions` tables exist.
**Unknown:** which named tenant roles actually carry which commercial codes in the
NeuGAIN Commercial tenant.
**Missing source:** read-only join of tenant roles to commercial permissions.
**Follow-up:** enumerate before writing role-based learning paths.
**Blocks:** Volume 5 §9 role-based learning paths (concrete role names only; the
capability profiles in the permission catalogue are usable meanwhile).

---

## GAP-10 — Edge Function internal structure

**Confirmed (C2):** `commercial-run-scenario` is the single runtime entry point for
revenue, pnl, cash and sensitivity modes; scope-specific runtime fingerprints exist
(`cash → bp3.4.1`).
**Unknown:** the full internal scope-dispatch structure and the complete fingerprint
set for revenue and pnl.
**Missing source:** a full read of the function body.
**Follow-up:** read-only inspection before Volume 6 §4.
**Blocks:** Volume 6 §4 completeness.

---

## Gap summary

| Gap | Blocks | Severity |
|---|---|---|
| GAP-01 | Vol 2 ch 2.3, Vol 3 §3.3 | Must resolve |
| GAP-02 | none | Informational |
| GAP-03 | Vol 2 ch 2.2 | Should resolve |
| GAP-04 | Vol 3 §17, Vol 6 §7 | Must resolve |
| GAP-05 | none | Informational |
| GAP-06 | Vol 4 §4 | Should resolve |
| GAP-07 | Vol 4 §5 | Must resolve |
| GAP-08 | Vol 4 §6 | Should resolve |
| GAP-09 | Vol 5 §9 | Should resolve |
| GAP-10 | Vol 6 §4 | Should resolve |

No gap blocks Volume 1. All gaps are resolvable by read-only inspection; none require
application, database or runtime change.
