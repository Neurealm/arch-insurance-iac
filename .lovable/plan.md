# Change Engineering becomes ticket-driven

Yes — understood. Instead of starting from a machine list, Change Engineering should start from the accepted ServiceNow request: the package is already drafted from the ticket, and the engineer's job is to review it and submit it for approval.

## What already exists

When a ServiceNow request is analysed and judged actionable, the intake service already builds a draft change package from the ticket (targets, action, parameters, reason) and links it to the ticket. That draft exists in the system today; Change Engineering simply does not show it — it shows a machine picker instead.

There are currently no intake requests or packages in the database (they were cleared earlier), so this will be exercised with a new ticket.

## New Change Engineering screen

**Main view: work queue of drafted packages**

A list, newest first, of packages drafted from tickets, each row showing:
- Ticket number and requester
- What is being done (create / start / stop / restart / resize) and the target machines
- Resource group, region, environment
- Status: Draft awaiting review, Submitted for approval, Changes requested, Approved
- Any blocking note (name already taken, size outside approved scope, machine not found)

Rows are grouped: "Needs your review" first, then submitted/approved for reference.

**Detail view: review and submit**

Opening a row shows the drafted package as a read-through, in the same shape every time:
1. Source ticket — number, requester, description, agreed clarifications
2. What will change — target machines, action, parameters, with each value marked as taken from the ticket
3. Scope checks — resource group, region, size, network and name availability, each passed or failed with the reason
4. Reason and window — carried from the ticket, editable
5. Actions — Submit for approval (only when checks pass), Edit values, or Return to intake for clarification

Edits are allowed and recorded; every change re-runs the checks. Nothing is applied to Azure here.

**Secondary, not primary**

The live machine list and the "provision new machines" form stay reachable for the occasional request raised without a ticket, behind a "Start a package without a ticket" link — no longer the first thing on the screen.

## Behaviour when a ticket has no draft yet

If a ticket is accepted but no package was drafted (missing capability or unresolved clarification), the row shows the reason and links back to ServiceNow Intake or Capability Promotion, instead of silently disappearing.

## Technical notes

- Rewrite `src/pages/agentic-iac/ChangeEngineering.tsx`: default view becomes the package queue, sourced from `listVmChangePackages` joined with `listServiceNowIntakeRequests` on `change_package_id`; the existing `VmChangeTargetSelection` moves behind the "without a ticket" route.
- New detail route `/changes/package/:packageNumber` rendering the drafted package with `iac_change_package_targets`, reusing `PackageContentsDrawer` content and the scope checks already used by the provisioning form.
- Submit action sets package status to `submitted`, which is what Change Review & Approval already reads; no schema change and no edge-function change is expected.
- Existing routes `/changes/:vmName` and `/changes/provision-vms` keep working, including the `fromTicket` prefill.
