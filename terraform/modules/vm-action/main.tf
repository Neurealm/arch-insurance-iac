// azapi_resource_action has no built-in way to force a repeat action to
// re-run: Terraform only diffs type/resource_id/action/method, none of which
// differ between two distinct change requests asking for the same action on
// the same VM. Without this, the second (and every subsequent) identical
// request plans as a no-op, which the platform's own policy then refuses to
// approve since a no-op proves nothing will happen. This resource holds
// nothing but the current change_request_id -- it calls no API and owns no
// Azure identity -- purely so its `replace_triggered_by` reference below has
// something that changes on every new, distinct ticket.
resource "terraform_data" "action_trigger" {
  input = var.change_request_id
}

resource "azapi_resource_action" "vm" {
  type        = "Microsoft.Compute/virtualMachines@2024-07-01"
  resource_id = var.target_resource_id
  action      = var.action
  method      = "POST"

  lifecycle {
    replace_triggered_by = [terraform_data.action_trigger]
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The action is not bound to an approved change request."
    }
  }
}
