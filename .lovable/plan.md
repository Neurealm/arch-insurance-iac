# What the Change Engineering screen should contain

Change Engineering is step 2 of the workflow: an intake ticket has been agreed, and here a person turns it into a precise, approval-controlled change package. Nothing on this screen touches Azure.

## The screen should have, in order

1. **Where this came from**
   A ticket selector at the top. Either the screen was opened from a ServiceNow ticket (show the ticket number, requester and agreed summary, fields already filled and locked), or the person picks a ready ticket from a short list. Building a package with no ticket stays possible but is marked as unlinked.

2. **What is being changed**
   Two routes, clearly separated:
   - Existing machines: the live Azure list with search and filters (region, resource group, power state, environment) to pick one target.
   - New machines: the "provision new virtual machines" entry, for names that do not exist yet.

3. **Which change**
   Only actions the platform can actually perform today: start, stop, restart, resize, and create machines. Actions with no approved capability behind them (disk growth, backup, monitoring, patch assessment) are not offered as if they work; they appear only as "request this capability", which routes to the capability path.

4. **The details that decide approval**
   The inputs for the chosen action (new size, machine count, names, resource group, region, size, network) validated on the spot: name already in use, size not permitted in the approved scope, region or resource group outside scope, target machine not found.

5. **Why and when**
   Business reason carried from the ticket, plus intended window and any rollback note. This is what reviewers read.

6. **A preview of the package before it is created**
   A plain summary: targets, action, parameters, scope checks passed or failed, and a clear statement that the next step is authorization by someone else. One button to create the package, one to save as draft.

7. **Existing packages for this target**
   A short list of packages already raised for the same machines, with status, so nobody duplicates a request or claims a machine that another draft already holds.

## What should not be here

Azure execution, approval, plan output, and evidence. Those belong to Change Review & Approval, Execution Center, and Validation & Evidence.

## Current gaps versus the above

The screen today shows the live inventory, the provisioning entry, and the eight-action list, and builds a package. Ticket linkage exists on the provisioning path. The items above that are not yet fully in place: ticket linkage for changes to existing machines, hiding actions with no approved capability, scope validation shown before submission, the pre-create summary, and the existing-packages-for-this-target list.

Approving this plan means I build those missing pieces; approve only if that is what you want, otherwise treat this as the written definition.
