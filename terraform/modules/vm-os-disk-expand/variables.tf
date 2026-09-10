variable "target_resource_id" {
  type        = string
  description = "Governed OS-disk expansion input: target_resource_id."
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\.Compute/virtualMachines/[^/]+$", var.target_resource_id))
    error_message = "Invalid Azure Virtual Machine ARM ID format. It must match '/subscriptions/{guid}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}'."
  }
}

variable "requested_os_disk_size_gb" {
  type        = number
  description = "Governed OS-disk expansion input: requested_os_disk_size_gb."
  validation {
    condition     = var.requested_os_disk_size_gb >= 64 && var.requested_os_disk_size_gb <= 4095
    error_message = "The requested OS disk size must be between 64 GB and 4095 GB, inclusive."
  }
}

variable "change_request_id" {
  type        = string
  description = "Governed OS-disk expansion input: change_request_id."
  validation {
    condition     = length(trimspace(var.change_request_id)) >= 6
    error_message = "The 'change_request_id' must be provided and have a minimum length of 6 characters."
  }
}