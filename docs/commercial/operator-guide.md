# Commercial Operator Guide

## Access the workspace

1. Sign in at `/login` as a Platform Administrator or member of `NeuGAIN Commercial`.
2. From **Platform Home** or **Platform Test Hub**, click **Open Commercial Workspace**.
   If the workspace has not been bootstrapped, click **Create Commercial Workspace** first.
3. In the tenant switcher (top bar), select **NeuGAIN Commercial**.

## Navigation

The Commercial left sidebar exposes five routes:

- **Overview** (`/commercial`) — integrated summary of workspace, program, gates, metrics, scenarios, sources, readiness, and next actions.
- **Program** (`/commercial/program`) — Project Momentous program detail and gate register.
- **Scenarios** (`/commercial/scenarios`) — Conservative / Base / Upside cases and directional assumptions.
- **Portfolio** (`/commercial/portfolio`) — intentionally empty until account records are validated and imported.
- **Sources** (`/commercial/sources`) — confidential source register (metadata only).

The **NeuGAIN Command Center** link at the top of the Commercial sidebar returns to the app hub.

## Roles

| Role | Permissions |
|---|---|
| `commercial_admin` | Full view/manage across program, scenarios, sources, accounts. |
| `commercial_analyst` | View + manage scenarios and assumptions. |
| `commercial_exec_viewer` | View only. |

Assign roles in **Platform → Members**.

## Seeding Project Momentous

When the program is not yet provisioned:
- On `/commercial` (Program card): click **Seed Project Momentous**.
- On `/commercial/scenarios`: click **Seed Scenarios** (three scenarios + 69 assumptions).

Both operations are idempotent and audited.

## Editing assumptions

Users with `commercial.scenario.manage` can edit numeric or text assumption values inline on `/commercial/scenarios`. All edits are directional; no P&L, EBITDA, NPV, or payback outputs are computed.
