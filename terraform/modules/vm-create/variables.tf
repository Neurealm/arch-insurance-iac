variable "target_resource_group_id" {
  description = "The Azure Resource Manager ID of the resource group where the VMs and NICs will be created."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+$", var.target_resource_group_id))
    error_message = "target_resource_group_id must be an exact Azure Resource Group resource ID."
  }
}

variable "subnet_id" {
  description = "The Azure Resource Manager ID of the subnet to which the NICs will attach."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\.Network/virtualNetworks/[^/]+/subnets/[^/]+$", var.subnet_id))
    error_message = "subnet_id must be an exact Azure Subnet resource ID."
  }
}

variable "vm_names" {
  description = "A list of desired names for the virtual machines. Each name will result in one VM and one NIC."
  type        = list(string)
  validation {
    condition     = length(var.vm_names) >= 1 && length(var.vm_names) <= 50
    error_message = "vm_names must contain between 1 and 50 entries."
  }
}

variable "vm_size" {
  description = "The Azure VM size to use for the virtual machines (e.g., Standard_B2s)."
  type        = string
  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.vm_size))
    error_message = "vm_size must start with 'Standard_' and follow Azure VM size naming conventions."
  }
}

variable "admin_username" {
  description = "The administrator username for the virtual machines."
  type        = string
  validation {
    condition     = length(var.admin_username) >= 1 && length(var.admin_username) <= 64
    error_message = "admin_username must be between 1 and 64 characters."
  }
}

variable "ssh_public_key" {
  description = "The SSH public key to be installed on the Linux virtual machines for authentication."
  type        = string
  validation {
    condition     = length(var.ssh_public_key) >= 1
    error_message = "ssh_public_key cannot be empty."
  }
}

variable "os_publisher" {
  description = "The publisher of the OS image (e.g., Canonical)."
  type        = string
  validation {
    condition     = length(var.os_publisher) >= 1
    error_message = "os_publisher cannot be empty."
  }
}

variable "os_offer" {
  description = "The offer of the OS image (e.g., 0001-com-ubuntu-server-jammy)."
  type        = string
  validation {
    condition     = length(var.os_offer) >= 1
    error_message = "os_offer cannot be empty."
  }
}

variable "os_sku" {
  description = "The SKU of the OS image (e.g., 22_04-lts-gen2)."
  type        = string
  validation {
    condition     = length(var.os_sku) >= 1
    error_message = "os_sku cannot be empty."
  }
}

variable "os_version" {
  description = "The version of the OS image (e.g., latest)."
  type        = string
  validation {
    condition     = length(var.os_version) >= 1
    error_message = "os_version cannot be empty."
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

variable "tags" {
  description = "A map of tags to apply to all created resources."
  type        = map(string)
  default     = {}
}