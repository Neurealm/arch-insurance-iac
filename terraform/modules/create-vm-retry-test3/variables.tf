variable "target_resource_group_id" {
  description = "The Azure Resource Manager ID of the target resource group where the VMs will be created."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+$", var.target_resource_group_id))
    error_message = "target_resource_group_id must be an exact Azure resource group ID."
  }
}

variable "subnet_id" {
  description = "The Azure Resource Manager ID of the subnet to which the VMs' network interfaces will be connected."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\.Network/virtualNetworks/[^/]+/subnets/[^/]+$", var.subnet_id))
    error_message = "subnet_id must be an exact Azure subnet resource ID."
  }
}

variable "vm_names" {
  description = "A list of desired names for the virtual machines to be created. Each name will result in a new VM and NIC."
  type        = list(string)
  validation {
    condition     = length(var.vm_names) >= 1 && length(var.vm_names) <= 50
    error_message = "The vm_names list must contain between 1 and 50 names."
  }
  validation {
    condition     = all([for name in var.vm_names : can(regex("^[a-zA-Z0-9-]{1,64}$", name))])
    error_message = "VM names must be alphanumeric and hyphens, 1-64 characters long."
  }
}

variable "vm_size" {
  description = "The size of the virtual machines (e.g., 'Standard_B2s', 'Standard_DS1_v2')."
  type        = string
  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.vm_size))
    error_message = "vm_size must start with 'Standard_' and follow Azure VM naming conventions."
  }
}

variable "admin_username" {
  description = "The administrative username for the virtual machines."
  type        = string
  validation {
    condition     = length(trimspace(var.admin_username)) >= 1 && length(var.admin_username) <= 64
    error_message = "admin_username must be between 1 and 64 characters."
  }
}

variable "ssh_public_key" {
  description = "The SSH public key for authentication to Linux virtual machines. For Windows, this variable should still be provided but will not be used."
  type        = string
  validation {
    condition     = length(trimspace(var.ssh_public_key)) >= 15 # A minimal SSH public key is typically much longer
    error_message = "ssh_public_key must be a valid SSH public key string."
  }
}

variable "os_publisher" {
  description = "The publisher of the operating system image (e.g., 'Canonical', 'MicrosoftWindowsServer')."
  type        = string
  validation {
    condition     = length(trimspace(var.os_publisher)) >= 1
    error_message = "os_publisher cannot be empty."
  }
}

variable "os_offer" {
  description = "The offer of the operating system image (e.g., '0001-com-ubuntu-server-focal', 'WindowsServer')."
  type        = string
  validation {
    condition     = length(trimspace(var.os_offer)) >= 1
    error_message = "os_offer cannot be empty."
  }
}

variable "os_sku" {
  description = "The SKU of the operating system image (e.g., '22_04-lts', '2022-datacenter')."
  type        = string
  validation {
    condition     = length(trimspace(var.os_sku)) >= 1
    error_message = "os_sku cannot be empty."
  }
}

variable "os_version" {
  description = "The version of the operating system image (e.g., 'latest')."
  type        = string
  validation {
    condition     = length(trimspace(var.os_version)) >= 1
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