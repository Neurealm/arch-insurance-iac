resource "azapi_resource_action" "vm" {
  type        = "Microsoft.Compute/virtualMachines@2024-07-01"
  resource_id = var.target_resource_id
  action      = var.action
  method      = "POST"

  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The action is not bound to an approved change request."
    }
  }
}
