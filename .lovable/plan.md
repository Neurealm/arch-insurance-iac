# Prefill Change Engineering from a ServiceNow ticket

Today a ticket and the change form are disconnected. The intake agent extracts every value from a ticket (names, size, region, resource group, subnet, image, admin user, SSH key, environment, reason), and then a person retypes all of it into the provisioning form. This closes that gap: opening a change from a ticket arrives already filled in, with the ticket named on screen and on the resulting package.

## What the user sees

**On an analyzed ticket** (ServiceNow Intake, "Next governed step"), the existing "Open Change Engineering" link becomes specific to what the ticket asked for:

- Create machines → "Open provisioning request" → the provisioning page, prefilled.
- Any action on an existing machine → "Open change request" → the change builder with that machine and action already selected.
- Nothing extracted, or an unsupported action → the current plain link to Change Engineering, unchanged.

**On the provisioning page**, when it was opened from a ticket:

- A banner at the top: "Prefilled from DEMO-CHG-20260908-5FB7F0. Check every value before submitting." with a link back to the ticket and a "Clear and start blank" button.
- Every field the ticket supplied is filled. Fields the ticket did not supply stay empty and still block submit exactly as they do now.
- The reason box is prefilled with the ticket number, requester and the request summary.
- Each prefilled field carries a small "from ticket" marker that disappears once the person edits it, so a reviewer can tell typed values from extracted ones.

**Nothing about validation or governance changes.** Name-collision checks, the required-field gate, the max-machines cap, capability presence, authorization and two-person approval all behave as they do today. Prefill is a convenience only — no value bypasses a check.

## Traceability

The package created this way records the ticket it came from, so a reviewer can trace a package back to its request:

- `parameters.source` becomes `servicenow_ticket` instead of `console`.
- `parameters.serviceNowTicket` and `parameters.serviceNowSysId` are carried through, matching what the intake agent already writes on its own draft packages.
- A policy-evidence row: "Prefilled from ticket · DEMO-CHG-… · values confirmed by submitter".

## Technical detail

- **Route**: `/changes/provision-vms?fromTicket=<intakeRequestId>`; the existing-machine path reuses `/changes?fromTicket=<id>`.
- **`src/pages/agentic-iac/change/ProvisionVms.tsx`** — read `fromTicket` with `useSearchParams`, load the row via `listServiceNowIntakeRequests()` (already exported from `../servicenowIntakeRequests`), and seed state from `llmAnalysis.provisioning` (`resourceGroupArmId`, `subnetArmId`, `location`, `vmNames`, `vmSize`, `adminUsername`, `sshPublicKey`, `osPublisher`, `osOffer`, `osSku`, `osVersion`) plus `normalizedRequest.environment` and `llmAnalysis.summary`. Seed once on load, guarded so a later refresh does not overwrite edits. Track a `Set` of prefilled field keys, removing a key on first change, to drive the "from ticket" marker.
- **`src/pages/agentic-iac/ChangeEngineering.tsx`** — on `fromTicket`, resolve `llmAnalysis.action` to an entry in `ACTIONS`, preselect the VM matching `llmAnalysis.targetVmName` against live discovery, seed `vmSize`/`diskSize` from the analysis where the action needs them, and seed the rationale. If the machine is not found in live Azure, show the banner with a note that the target must be picked manually rather than silently selecting nothing.
- **`src/pages/agentic-iac/ServiceNowIntake.tsx`** — replace the single hardcoded `/changes` link with the three-way choice above, based on `llmAnalysis.action`.
- **Shared banner** — one small `PrefilledFromTicket` component in `src/pages/agentic-iac/change/`, used by both pages.
- No edge function, migration, schema or API-contract change. No new dependency. Type-check with `npx tsgo --noEmit -p tsconfig.app.json`.

## Out of scope

- Auto-submitting a package from a ticket without a person confirming it.
- Making the forms definition-driven, or merging provisioning into the shared change screen.
- Fixing the truncated application name ("laims Processing Platform") on the existing package — separate, say the word and it is a one-line data fix.
