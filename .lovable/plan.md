# Trim the app to the core workflow

Keep only the screens the actual work needs. Everything else stays in the codebase but disappears from the app, so it can be brought back later without rebuilding it.

## Screens that stay

- Connections
- ServiceNow Intake / Agent
- Change Engineering (including the Provision VMs form and per-machine view)
- Change Review & Approval
- Execution Center
- Validation & Evidence
- Capability Promotion

## Screens that go away

- Azure Resources and the machine detail page
- Demo Change Request
- Remediation Intelligence
- Customer-hosted Intelligent IaC / Deployment Architecture
- Integrations & Connectivity
- Access & Governance
- Policies & Governance
- System Settings
- Audit & Compliance

## Landing page

Signing in lands on ServiceNow Intake. The home address and any unknown address also go there, instead of Azure Resources as they do today.

## What "hidden" means

The pages and their data files are not deleted. Their sidebar links are removed and their addresses no longer open them — anyone typing an old address is sent to ServiceNow Intake. Restoring one later is a matter of putting its link and address back.

## Technical notes

- `src/pages/agentic-iac/IacLayout.tsx`: drop the removed entries from the primary and platform nav arrays; keep the platform group only for Capability Promotion.
- `src/App.tsx`: remove the routes for the hidden pages, change the `/` and `*` fallbacks from `/resources` to `/servicenow-intake`, and add redirects from the removed addresses to `/servicenow-intake`.
- Post-login redirects in `src/pages/auth/*` continue to point at `/connections`, which stays.
- No page files, data helpers, edge functions, or database objects are deleted.
- Verify with a typecheck (`npx tsgo --noEmit -p tsconfig.app.json`) plus a quick click-through of the remaining screens.
