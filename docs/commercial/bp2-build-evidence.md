# BP2 — Commercial Build Evidence

Status: **Built, Pending Final Validation**

## Packages Delivered

| Package | Scope | Status |
|---|---|---|
| BP2.0 | Architecture, source-truth register, scope contract | Built (see `docs/commercial/architecture.md`, `source-truth-register.md`) |
| BP2.1 | 7-table Commercial schema, RLS, permissions, same-tenant triggers | Built (`supabase/tests/bp2_1_commercial_foundation.sql`) |
| BP2.2 | `bootstrap_commercial_workspace` RPC + 3 tenant roles | Built (`docs/commercial/bp2-2-test-evidence.md`) |
| BP2.3 | Commercial shell (5 routes), `useCommercialAccess`, sidebar | Built (`docs/commercial/bp2-3-test-evidence.md`) |
| BP2.4 | Project Momentous program, G0-G4 gates, 4 metrics, 6 sources | Built (`seed_project_momentous_foundation`) |
| BP2.5 | 3 scenarios (Conservative/Base/Upside) + 69 directional assumptions | Built (`supabase/tests/bp2_5_scenario_foundation.sql`) |
| BP2.6 | Integrated Overview, Portfolio empty state, data-readiness, platform integration, docs | Built (this document) |

## Integrated Overview (`/commercial`)

Renders 10 sections against live tenant data:
1. Workspace card, 2. Program card, 3. Current gate, 4. Gate progression (G0→G4),
5. Four aggregate metrics, 6. Baseline scenario, 7. Scenario comparison,
8. Source-validation summary (metadata only), 9. Data readiness, 10. Recommended next actions.

## Portfolio (`/commercial/portfolio`)

Intentional empty state — **no account rows inserted**. Displays the required
`No account records imported` message plus the three navigation actions and the
8-row data-readiness panel.

## Platform Integration

- Platform Home shows `Create` or `Open Commercial Workspace` action.
- Platform Test Hub lists Commercial Overview with permission gating.
- Selecting the NeuGAIN Commercial tenant makes the Commercial route group visible in the primary sidebar.
- `PermissionRoute permission="commercial.view"` denies non-permitted tenants.
- `AccessContext` clears `["commercial"]` query cache on tenant switch.

## Audit

All mutating operations write to `public.audit_events` via existing platform helpers:
`workspace.bootstrap`, `role.assign`, `program.seed`, `gate.seed`, `source.seed`,
`scenario.seed`, `assumption.seed`, `assumption.update`. Payloads never store
raw source content — only source_code + status references.

## Deferred (see `known-limitations.md`)

- Account import
- Financial calculation engine (P&L, EBITDA, NPV, payback)
- Approval governance
- AI recommendations
- Data exports
- External integrations (Salesforce, NetSuite, etc.)
