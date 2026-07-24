# Commercial — Known Limitations (as of BP2.6)

## Intentionally Deferred

| Capability | Reason | Target |
|---|---|---|
| Account import (338 broader + 104 no-partner) | Awaiting validated source dataset | Next Commercial data package |
| Financial calculation engine (P&L, EBITDA, cash flow, NPV, payback) | Requires validated account-level ARR & renewal dates | Next Commercial modeling package |
| Scenario comparison outputs (delta tables, sensitivity) | Blocked on calculation engine | Follows engine |
| Approval governance (multi-step gate approvals, reviewer routing) | Requires policy definition | Post-engine |
| AI recommendations (assumption suggestions, sentiment) | Requires source enrichment | Later |
| Data exports (CSV/XLSX/PDF) | Not in scope for BP2 | Post-engine |
| External integrations (Salesforce, NetSuite, CRM sync) | Requires connector strategy | Later phase |

## Model Characteristics

- **All values are directional.** Metrics and assumptions represent portfolio-level directional inputs, not contractually approved values or validated account-level forecasts.
- **No raw source content is stored client-side.** The source register exposes only `source_code`, title, type, confidentiality, and status.
- **Portfolio is intentionally empty.** `commercial_accounts` contains zero rows and the UI renders an explicit no-import state.

## Carry-forward BP1.1 Evidence

BP1.1 release-evidence workflow (SQL regression + green CI) remains **unresolved** and is tracked separately from BP2. BP2 does not close BP1.1E execution gaps.
