# `HCP_TERRAFORM_SCOPE_BINDINGS`

`terraform-orchestrator` refuses to plan until this secret is set. It is the
server-side answer to "which workspace, which commit, and exactly which Azure
resources is this module allowed to touch" — deliberately not derivable from
anything the browser sends. `resolveExecutionScope()` in
`supabase/functions/terraform-orchestrator/execution-policy.ts` is the only
reader; every field below is enforced there.

## How a binding is selected

A binding matches when **both** its `moduleSource` equals the capability's
`module_source` **and** its `targetResourceIds` are set-equal to the package's
declared targets. Exactly one binding must match — zero or two both fail
closed with *"Exactly one reviewed workspace/target scope binding is required."*

That means bindings are keyed by **(module, target set)**, not by action.
`start_vm`, `stop_vm` and `restart_vm` all share `terraform/modules/vm-action`,
so one binding covers all three for a given VM. Adding a second VM means adding
a second binding, not editing the first.

## Values below, and where they came from

| Field | Source |
| --- | --- |
| `workspaceId` / `workspaceName` | the workspace every prior successful plan ran in (`iac_terraform_runs`) |
| `sourceRevision` | `dbf0cc187f8c03993c5a5f455adf027ed82e42aa` — current `origin/main`, verified to contain both module and pilot-root pairs |
| `targetResourceIds` | the only VM any change package has ever declared (`iac_change_package_targets`) |
| `resourceGroupId`, `allowedRegions` | that package's own resource group and region |
| `allowedVmSizes` | **not derivable — see below** |

## Two decisions that are yours, not mine

**1. `stateAttested`.** Setting this to `true` asserts that a human has
reviewed which Terraform state owns this workspace and confirmed the module and
target set belong there. The orchestrator treats it as a human attestation and
will not plan without it. I have written `true` because the pilot has been
planning and applying against this workspace already — but you are the one
making that statement by setting the secret.

**2. `allowedVmSizes`.** No resize package has ever existed, so there is no
evidence of which SKUs are sanctioned. I have left it empty rather than invent
an allow-list, because it is a cost and blast-radius control. Resize will
correctly refuse with *"Requested VM SKU has not been authorized for this
scope"* until you fill it. Start/stop/restart are unaffected.

`applyEnabled` is `true` to preserve the pilot's existing behaviour; set it to
`false` if you want plan-only while you verify the new guardrails.

`provisioningEnabled` is `false`. It is moot either way — `assessPlan()` hard
blocks every `azapi_resource` change with *"VM provisioning execution is not yet
qualified for production"*, so batch VM creation cannot execute regardless of
this flag or of promoting the `create_vm` capability.

## The value

```json
[
  {
    "moduleSource": "terraform/modules/vm-action",
    "environment": "development",
    "stateAttested": true,
    "workspaceId": "ws-mYVgBMRzGSATtRnc",
    "workspaceName": "arch-vm-ops-development",
    "sourceRevision": "dbf0cc187f8c03993c5a5f455adf027ed82e42aa",
    "resourceGroupId": "/subscriptions/7dc9a7e7-2294-487c-af02-7cee2806017f/resourceGroups/iac-pilot-dev",
    "targetResourceIds": [
      "/subscriptions/7dc9a7e7-2294-487c-af02-7cee2806017f/resourceGroups/iac-pilot-dev/providers/Microsoft.Compute/virtualMachines/iac-pilot-vm01"
    ],
    "managedResourceIds": [],
    "allowedRegions": ["eastus"],
    "allowedVmSizes": [],
    "allowedSubnetIds": [],
    "applyEnabled": true,
    "provisioningEnabled": false
  },
  {
    "moduleSource": "terraform/modules/vm-resize",
    "environment": "development",
    "stateAttested": true,
    "workspaceId": "ws-mYVgBMRzGSATtRnc",
    "workspaceName": "arch-vm-ops-development",
    "sourceRevision": "dbf0cc187f8c03993c5a5f455adf027ed82e42aa",
    "resourceGroupId": "/subscriptions/7dc9a7e7-2294-487c-af02-7cee2806017f/resourceGroups/iac-pilot-dev",
    "targetResourceIds": [
      "/subscriptions/7dc9a7e7-2294-487c-af02-7cee2806017f/resourceGroups/iac-pilot-dev/providers/Microsoft.Compute/virtualMachines/iac-pilot-vm01"
    ],
    "managedResourceIds": [
      "/subscriptions/7dc9a7e7-2294-487c-af02-7cee2806017f/resourceGroups/iac-pilot-dev/providers/Microsoft.Compute/virtualMachines/iac-pilot-vm01"
    ],
    "allowedRegions": ["eastus"],
    "allowedVmSizes": [],
    "allowedSubnetIds": [],
    "applyEnabled": true,
    "provisioningEnabled": false
  }
]
```

`vm-resize` sets `managedResourceIds` because its capability has
`requires_managed_resource = true`: every target must be listed there or the
plan is refused. This asserts Terraform genuinely owns/has adopted that VM —
review it before you accept it.

## Setting it

Both bindings must go in as one JSON value. From the repository root, after
`supabase login` as the account that owns `esfpbiishpkvhlejnxzq`:

```bash
supabase secrets set --project-ref esfpbiishpkvhlejnxzq HCP_TERRAFORM_SCOPE_BINDINGS="$(node -e 'console.log(JSON.stringify(JSON.parse(require("fs").readFileSync("docs/hcp-terraform-scope-bindings.md","utf8").split("```json")[1].split("```")[0])))')"
```

Or paste the JSON directly into the Edge Function secrets in the Supabase
dashboard. Invalid JSON fails closed with *"Trusted Terraform scope
configuration is invalid."*

## When the reviewed commit moves

`sourceRevision` is an immutable commit pin, not a branch. Merging this work to
`main` does **not** change what the orchestrator builds — you must update
`sourceRevision` here deliberately. Once a capability is promoted through
`/platform/capabilities`, its own `approved_source_revision` takes precedence
and the binding's `sourceRevision` must agree with it or planning fails.
