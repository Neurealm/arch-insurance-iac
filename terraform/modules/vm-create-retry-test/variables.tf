variable "target_resource_group_id" {
  description = "The Azure Resource Manager ID of the resource group where the VMs and NICs will be created."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+$", var.target_resource_group_id))
    error_message = "target_resource_group_id must be an exact Azure resource group ID."
  }
}

variable "subnet_id" {
  description = "The Azure Resource Manager ID of the subnet to which each Network Interface will be attached."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\.Network/virtualNetworks/[^/]+/subnets/[^/]+$", var.subnet_id))
    error_message = "subnet_id must be an exact Azure subnet resource ID."
  }
}

variable "vm_names" {
  description = "A list of desired names for the virtual machines. Each name will result in a new VM."
  type        = list(string)
  validation {
    condition     = length(var.vm_names) >= 1 && length(var.vm_names) <= 50
    error_message = "The list of VM names must contain between 1 and 50 entries."
  }
  validation {
    condition     = all([for name in var.vm_names : can(regex("^[a-zA-Z0-9-]{1,63}$", name))])
    error_message = "VM names must be alphanumeric, can include hyphens, and be between 1 and 63 characters."
  }
}

variable "vm_size" {
  description = "The Azure VM size (e.g., 'Standard_B2s')."
  type        = string
  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.vm_size))
    error_message = "vm_size must follow the pattern 'Standard_[A-Za-z0-9_]+'."
  }
}

variable "admin_username" {
  description = "The administrator username for the virtual machines."
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9]{1,32}$", var.admin_username))
    error_message = "Admin username must be 1-32 lowercase alphanumeric characters."
  }
}

variable "ssh_public_key" {
  description = "The SSH public key for authentication to Linux virtual machines."
  type        = string
  validation {
    condition     = length(trimspace(var.ssh_public_key)) > 0
    error_message = "An SSH public key is required for Linux VMs."
  }
}

variable "os_publisher" {
  description = "The publisher of the OS image (e.g., 'Canonical')."
  type        = string
}

variable "os_offer" {
  description = "The offer of the OS image (e.g., '0001-com-ubuntu-server-jammy')."
  type        = string
}

variable "os_sku" {
  description = "The SKU of the OS image (e.g., '22_04-lts-gen2')."
  type        = string
}

variable "os_version" {
  description = "The version of the OS image (e.g., 'latest')."
  type        = string
}

variable "change_request_id" {
  description = "Immutable ServiceNow/change-package correlation identifier for auditing."
  type        = string
  validation {
    condition     = length(trimspace(var.change_request_id)) >= 6
    error_message = "A valid change request identifier is required."
  }
}

variable "tags" {
  description = "A map of tags to apply to all created resources."
  type        = map(string)
  default     = {}
}