variable "target_resource_id" {
  description = "Exact Azure Resource Manager ID of the approved VM target."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\.Compute/virtualMachines/[^/]+$", var.target_resource_id))
    error_message = "target_resource_id must be an exact Azure virtual machine resource ID."
  }
}

variable "action" {
  description = "Approved Azure VM control-plane action."
  type        = string
  validation {
    condition     = contains(["start", "powerOff", "deallocate", "restart"], var.action)
    error_message = "Only start, powerOff, deallocate, and restart are permitted."
  }
}

variable "change_request_id" {
  description = "Immutable ServiceNow/change-package correlation identifier."
  type        = string
  validation {
    condition     = length(trimspace(var.change_request_id)) >= 6
    error_message = "A valid change request identifier is required."
  }
}
