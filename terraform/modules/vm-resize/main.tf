variable "target_resource_id" {
  type = string
  validation {
    condition     = can(regex("^/subscriptions/[^/]+/resourceGroups/[^/]+/providers/Microsoft\\.Compute/virtualMachines/[^/]+$", var.target_resource_id))
    error_message = "target_resource_id must be one Azure virtual machine ARM ID."
  }
}
variable "requested_vm_size" {
  type = string
  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.requested_vm_size))
    error_message = "requested_vm_size must be an Azure Standard_* SKU."
  }
}
variable "change_request_id" { type = string }

resource "azapi_update_resource" "vm_size" {
  type        = "Microsoft.Compute/virtualMachines@2024-07-01"
  resource_id = var.target_resource_id
  body = {
    properties = { hardwareProfile = { vmSize = var.requested_vm_size } }
  }
  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The resize is not bound to an approved change request."
    }
  }
}

output "target_resource_id" { value = var.target_resource_id }
output "requested_vm_size" { value = var.requested_vm_size }
