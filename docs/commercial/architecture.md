# Commercial Module — Architecture Contract (BP2.0)

Status: Built, Pending Independent Validation.
Scope: Architecture and contracts only. No application code, schema, RLS, data, roles, or navigation are created in BP2.0.

---

## 1. Workspace and Program Hierarchy

```
public.tenants (BP1.1 platform authority)
└── Tenant: "NeuGAIN Commercial"           ← one workspace, reused BP1.1 primitives
    └── commercial_programs
        ├── Program: "Project Momentous"   ← first program
        └── Program: <future pursuits>     ← additional programs, NEVER new tenants
            └── commercial_accounts / opportunities / financial_scenarios / gates / evidence
```

Rules:
- `public.tenants` remains the sole workspace authority.
- The Commercial module is exposed inside exactly one tenant workspace, `NeuGAIN Commercial`.
- `Project Momentous` is a `commercial_program`, not a tenant.
- Every future commercial pursuit becomes an additional `commercial_program` inside the same workspace.
- Cross-program aggregation happens inside the Commercial module; it never crosses `tenant_id`.

## 2. Proposed Commercial Data Model (BP2.1 will implement)

Naming: all tables prefixed `commercial_`. All tables carry `tenant_id uuid not null references public.tenants(id) on delete restrict`.

| Table | Purpose |
|---|---|
| `commercial_programs` | A pursuit envelope (e.g., Project Momentous). Owns scope, timeline, gate cadence. |
| `commercial_program_members` | Program-level participation (owner, contributor, viewer). Layered on top of BP1.1 tenant membership, never a substitute. |
| `commercial_account_universes` | Named scope sets (e.g., "338-account ICP universe", "104-account no-partner model"). Prevents conflation. |
| `commercial_accounts` | Account-level rows imported from validated sources only. `universe_id` FK. No fabrication. |
| `commercial_account_attributes` | EAV-style validated attributes with `source_id` and `confidence`. |
| `commercial_opportunities` | Pursuit-specific opportunities tied to accounts. |
| `commercial_financial_scenarios` | Named P&L / rebate / partner scenarios (e.g., `revised`, `noPartner-noRebate`). Each is one authoritative variant. |
| `commercial_financial_lines` | Line items inside a scenario. |
| `commercial_gates` | Gate records: G0 kickoff readiness + G1..G4 formal decision gates. |
| `commercial_gate_criteria` | Named readiness criteria per gate with pass/hold/fail state. |
| `commercial_evidence` | Pointers to source documents (register entries), never binary content. |
| `commercial_audit_link` | Optional denormalized index that mirrors `public.audit_events` for fast per-program queries. All writes still go through the BP1.1 audit helper. |

Relationships (summary):

```
programs 1─* program_members
programs 1─* account_universes 1─* accounts 1─* opportunities
programs 1─* financial_scenarios 1─* financial_lines
programs 1─* gates 1─* gate_criteria
programs 1─* evidence  (source-truth pointers)
```

## 3. Table Purposes and Relationships

- `commercial_accounts` are only created from a validated source register entry. `account_universes` guarantees that the 338-account broader ICP universe and the 104-account no-partner financial-model scope are stored as distinct sets, cross-referenced but never merged.
- `commercial_financial_scenarios` model each P&L variant as its own record; the two supplied models (`revised` and `noPartner-noRebate`) become two scenarios, never a merged synthesis.
- `commercial_gates` implements G0 plus G1–G4. G0 is `readiness_kickoff`; G1–G4 are `decision`.
- `commercial_evidence` stores source pointers (title, register id, confidentiality, hash if available) — no browser-readable attachments.

## 4. Tenant-Boundary Rules

- Every `commercial_*` row is tenant-scoped by `tenant_id`.
- RLS (to be added in BP2.1) uses BP1.1 helpers:
  - `is_tenant_member(auth.uid(), tenant_id)` for read-eligibility.
  - `has_permission(auth.uid(), tenant_id, '<permission>')` for writes.
- Cross-tenant reads are forbidden. Platform Admin bypass exists only via `is_platform_admin(auth.uid())` and is auditable.
- No commercial_* function may accept an arbitrary `_user_id` — helpers must default to `auth.uid()` and reject other identities unless the caller is a platform admin (per the standing security memory).

## 5. Permission Matrix (permission codes; roles map to these in §6)

| Permission code | Scope | Purpose |
|---|---|---|
| `commercial.program.read` | Program | View program metadata and dashboards |
| `commercial.program.manage` | Program | Create, rename, retire programs |
| `commercial.account.read` | Program | View accounts and universes |
| `commercial.account.manage` | Program | Add/edit accounts (from validated sources only) |
| `commercial.opportunity.read` | Program | View opportunities |
| `commercial.opportunity.manage` | Program | Manage opportunities |
| `commercial.scenario.read` | Program | View financial scenarios |
| `commercial.scenario.manage` | Program | Author financial scenarios |
| `commercial.gate.read` | Program | View gates and criteria |
| `commercial.gate.decide` | Program | Record gate decisions (G0..G4) |
| `commercial.evidence.read` | Program | View source register entries |
| `commercial.evidence.manage` | Program | Register / retire source documents |
| `commercial.audit.read` | Program | Read commercial audit slice |

All runtime authorization uses `has_permission`. Named roles are configuration and never appear in route guards.

## 6. Default Role Matrix (configuration only)

| Role name | Permissions granted |
|---|---|
| Commercial Executive Sponsor | all `commercial.*.read`, `commercial.gate.decide` |
| Commercial Program Lead | all `commercial.*.read`, `commercial.program.manage`, `commercial.account.manage`, `commercial.opportunity.manage`, `commercial.scenario.manage`, `commercial.evidence.manage`, `commercial.gate.decide` |
| Commercial Analyst | all `commercial.*.read`, `commercial.account.manage`, `commercial.scenario.manage`, `commercial.evidence.manage` |
| Commercial Viewer | all `commercial.*.read` |

These are seeded as defaults; tenants may customize. Route authorization never checks role names.

## 7. Route and Navigation Map (planned; not created in BP2.0)

Under existing `Platform → Workspace` navigation, exposed only when the active tenant is `NeuGAIN Commercial`:

```
/commercial                              → Program list
/commercial/programs/:programId          → Program overview + gate strip (G0..G4)
/commercial/programs/:programId/accounts → Account universes + accounts
/commercial/programs/:programId/opportunities
/commercial/programs/:programId/scenarios
/commercial/programs/:programId/gates
/commercial/programs/:programId/evidence
/commercial/programs/:programId/audit
```

BP2.0 registers zero routes. Navigation additions are BP2.2.

## 8. Query-Key Strategy

React Query keys are structured hierarchically to enable precise invalidation:

```
['commercial']
['commercial','programs']
['commercial','programs', programId]
['commercial','programs', programId, 'accounts', { universeId, filters }]
['commercial','programs', programId, 'opportunities', filters]
['commercial','programs', programId, 'scenarios', scenarioId]
['commercial','programs', programId, 'gates']
['commercial','programs', programId, 'gates', gateId]
['commercial','programs', programId, 'evidence']
['commercial','programs', programId, 'audit', filters]
```

All commercial keys are prefixed `commercial` so RunOps / AVEP / Platform caches are never disturbed.

## 9. Audit-Event Strategy

- Every write in `commercial_*` calls the BP1.1 audit-write helper into `public.audit_events`.
- `event_type` uses the dotted permission-code namespace: e.g. `commercial.gate.decide`, `commercial.scenario.manage.create`.
- `resource_type` = `commercial_<table>`; `resource_id` = row PK.
- `metadata` JSON includes `program_id`, `universe_id` (if applicable), `source_id` (if evidence-linked), and `confidence` (if attribute-linked).
- Reads of highly confidential resources (evidence, scenarios) additionally emit `commercial.*.read` events.

## 10. Source-Provenance Strategy

- Every commercial fact (account attribute, financial line, gate criterion, opportunity value) must reference at least one `commercial_evidence` row.
- Precedence order when sources disagree:
  1. Signed / executed contractual documents (e.g., MOU when countersigned).
  2. Latest dated financial model where scope matches the fact being asserted.
  3. Validated account master list.
  4. Third-party account intelligence (e.g., Draup targeted details).
  5. Meeting materials and transcripts (directional only).
- Conflicts are never silently reconciled. Divergent values are stored as separate attribute rows with distinct `source_id`, and surfaced as a `variance` in the UI.

## 11. Data-Confidence Vocabulary

Every commercial fact carries `confidence ∈ { validated, directional, indicative, unverified, disputed }`.

- `validated` — source is contractual or from a validated master; account-level confirmation complete.
- `directional` — from a financial model or planning artifact; not yet account-validated.
- `indicative` — from meeting materials, transcripts, or drafts.
- `unverified` — imported without a source register entry (must be resolved before Gate advancement).
- `disputed` — two or more sources conflict and precedence has not resolved the conflict.

Gate advancement rules (BP2.3) will forbid `unverified` or `disputed` facts on any gate criterion.

## 12. Deferred Functionality (out of scope for BP2.0 / BP2.1)

- Automated import from source spreadsheets.
- Account de-duplication across universes.
- Partner and rebate modeling beyond the two supplied scenarios.
- External CRM sync.
- Signed-artifact storage (binary evidence).
- AI-assisted gate recommendations.
- Cross-tenant benchmarking.

## 13. Protected Existing Modules

BP2.0 and downstream BP2.x packages MUST NOT modify:

- BP1.1 platform foundation (tenants, memberships, roles, permissions, audit, access-context, RLS helpers).
- RunOps module (`runops_*` tables, functions, routes).
- AVEP, SEAD, Silicon, Neurealm Agentic AI Studio, CRM, ETDM, questionnaires, settings, coworkers, prod-twin, data-orchestration-twin, carve-out, practice library.
- Existing `app_role` enum and `public.user_roles`.
- Super-admin bootstrap in `handle_new_user`.
- Existing documentation outside `docs/commercial/**` and the minimal `.lovable/plan.md` update.

## 14. BP2.0 → BP2.6 Dependency Sequence

| Package | Title | Depends on | Deliverable |
|---|---|---|---|
| BP2.0 | Architecture, Source Truth, Scope Contract | BP1.1 | This document + source register + delivery map |
| BP2.1 | Commercial Schema, RLS, Permissions, Roles | BP2.0 | Migrations for `commercial_*`, permission seeds, default role seeds |
| BP2.2 | Commercial Shell, Routes, Navigation, Program CRUD | BP2.1 | `src/commercial/**` shell, program list + overview, navigation entry gated by tenant |
| BP2.3 | Gate Model (G0 + G1..G4), Evidence Register UI | BP2.2 | Gate strip, criteria authoring, evidence pointer CRUD |
| BP2.4 | Account Universes and Accounts | BP2.3 | Universe management (338 vs 104 distinct), account records with confidence + source |
| BP2.5 | Financial Scenarios and Opportunities | BP2.4 | Scenario authoring, line items, opportunity linkage |
| BP2.6 | Commercial Audit Slice, Reports, Release Hardening | BP2.5 | Audit views, program reports, RLS regression, release readiness |

Each subsequent package requires independent validation before the next begins.
