variable "target_resource_id" {
  description = "Exact Azure Resource Manager ID of the approved VM target."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\.Compute/virtualMachines/[^/]+$", var.target_resource_id))
    error_message = "target_resource_id must be an exact Azure virtual machine resource ID."
  }
}

variable "requested_os_disk_size_gb" {
  description = "Governed OS-disk expansion input: requested_os_disk_size_gb."
  type        = number
  validation {
    condition     = var.requested_os_disk_size_gb >= 64 && var.requested_os_disk_size_gb <= 4095
    error_message = "requested_os_disk_size_gb must be between 64 and 4095 GB."
  }
}

variable "change_request_id" {
  description = "Governed OS-disk expansion input: change_request_id."
  type        = string
  validation {
    condition     = length(trimspace(var.change_request_id)) >= 6
    error_message = "A valid change request identifier is required."
  }
}