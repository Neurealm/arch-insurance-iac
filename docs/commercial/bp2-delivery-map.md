# BP2 Delivery Map — Commercial Module

Sequenced from BP2.0 through BP2.6. Each package is independently validated before the next begins. BP2.0 is architecture and contract only; no code, schema, or data is produced in this package.

---

## BP2.0 — Architecture, Source Truth, and Scope Contract
Status: Built, Pending Independent Validation.
Inputs: BP1.1 platform foundation; source documents SRC-001..SRC-006.
Deliverables:
- `docs/commercial/architecture.md`
- `docs/commercial/source-truth-register.md`
- `docs/commercial/bp2-delivery-map.md`
- Minimal `.lovable/plan.md` update adding the BP2 sequence.
Exit criteria: Workspace-vs-program distinction explicit; BP1.1 reuse documented; source precedence + confidence documented; 338-account universe vs 104-account model kept distinct; G0 + G1..G4 modeled; no application, schema, RLS, or data change.

## BP2.1 — Commercial Schema, RLS, Permissions, Roles
Depends on: BP2.0.
Deliverables:
- Migrations creating `commercial_programs`, `commercial_program_members`, `commercial_account_universes`, `commercial_accounts`, `commercial_account_attributes`, `commercial_opportunities`, `commercial_financial_scenarios`, `commercial_financial_lines`, `commercial_gates`, `commercial_gate_criteria`, `commercial_evidence`, optional `commercial_audit_link`.
- Explicit `GRANT` per table (authenticated + service_role; no anon).
- RLS on every table using `is_tenant_member` and `has_permission`.
- Permission-code seeds and default-role seeds (from architecture §5 and §6).
Exit criteria: All commercial tables tenant-scoped; RLS regression pack green; no changes to BP1.1 tables.

## BP2.2 — Commercial Shell, Routes, Program CRUD
Depends on: BP2.1.
Deliverables:
- `src/commercial/**` shell (layout, navigation, breadcrumbs) matching platform design system.
- Routes: `/commercial`, `/commercial/programs/:programId` overview.
- Navigation entry visible only when the active tenant is `NeuGAIN Commercial`.
- Program CRUD gated by `commercial.program.manage`.
Exit criteria: Non-Commercial tenants see no Commercial nav; permission gating verified.

## BP2.3 — Gate Model (G0 + G1..G4) and Evidence Register UI
Depends on: BP2.2.
Deliverables:
- Gate strip (G0 kickoff readiness, G1..G4 formal decision gates).
- Gate criteria authoring; decision recording gated by `commercial.gate.decide`.
- Evidence register CRUD (pointers only; never binary attachments).
Exit criteria: Gates and evidence tie to `source_id` and `confidence`; audit events emitted.

## BP2.4 — Account Universes and Accounts
Depends on: BP2.3.
Deliverables:
- Universe management preserving the distinction between the 338-account healthcare ICP universe and the 104-account no-partner financial-model scope.
- Account records only from validated source register entries; no fabrication.
- Attribute-level `source_id` + `confidence`; variance surfacing.
Exit criteria: 338 and 104 remain queryably distinct; unverified/disputed facts flagged.

## BP2.5 — Financial Scenarios and Opportunities
Depends on: BP2.4.
Deliverables:
- Scenario authoring; two initial scenarios sourced from SRC-002 (`revised`) and SRC-003 (`noPartner-noRebate`) stored as separate records.
- Line-item authoring with `source_id` + `confidence`.
- Opportunity records tied to accounts and scenarios.
Exit criteria: Scenarios never merged; variance ledger reflected in UI.

## BP2.6 — Commercial Audit Slice, Reports, Release Hardening
Depends on: BP2.5.
Deliverables:
- Commercial audit view sourced from `public.audit_events` filtered to `commercial.*` event types.
- Program reports (gate status, universe coverage, scenario deltas).
- Full RLS regression, security scan, release checklist and rollback plan.
Exit criteria: Ready for Product Organization review; no regression against BP1.1.

---

## Cross-cutting non-negotiables

- Every `commercial_*` write emits an audit event via the BP1.1 helper.
- Route authorization uses permission codes and `has_permission`. Role-name checks are forbidden in route guards.
- No commercial function accepts an arbitrary `_user_id`; helpers default to `auth.uid()` and reject other identities unless the caller is a platform admin.
- Source documents are never exposed as browser-readable attachments.
- Project Momentous values remain directional until account-level and contractual validation occur.
