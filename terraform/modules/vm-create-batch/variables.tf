variable "target_resource_group_id" {
  description = "ARM ID of the target resource group where the VMs and NICs will be deployed."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+$", var.target_resource_group_id))
    error_message = "target_resource_group_id must be an exact Azure resource group ID."
  }
}

variable "subnet_id" {
  description = "ARM ID of the subnet to which each Network Interface will be connected."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\.Network/virtualNetworks/[^/]+/subnets/[^/]+$", var.subnet_id))
    error_message = "subnet_id must be an exact Azure subnet resource ID."
  }
}

variable "vm_names" {
  description = "A list of desired names for the virtual machines. Each name must be unique within the resource group."
  type        = list(string)
  validation {
    condition     = length(var.vm_names) >= 1 && length(var.vm_names) <= 50
    error_message = "The number of VM names must be between 1 and 50."
  }
}

variable "vm_size" {
  description = "The Azure VM size (e.g., 'Standard_B2s', 'Standard_D2s_v3')."
  type        = string
  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.vm_size))
    error_message = "vm_size must start with 'Standard_' and follow Azure naming conventions."
  }
}

variable "admin_username" {
  description = "The administrative username for the OS on the VMs."
  type        = string
  validation {
    condition     = length(trimspace(var.admin_username)) > 0
    error_message = "admin_username cannot be empty."
  }
}

variable "ssh_public_key" {
  description = "The SSH public key string for authentication to Linux VMs."
  type        = string
  validation {
    condition     = length(trimspace(var.ssh_public_key)) > 0 && can(regex("^(ssh-rsa|ssh-dss|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521|ssh-ed25519) AAAA[0-9A-Za-z+/]+={0,3}( [^\\r\\n]*)?$", var.ssh_public_key))
    error_message = "ssh_public_key must be a valid SSH public key format (e.g., 'ssh-rsa AAAA...')."
  }
}

variable "os_publisher" {
  description = "The publisher of the OS image (e.g., 'Canonical')."
  type        = string
  validation {
    condition     = length(trimspace(var.os_publisher)) > 0
    error_message = "os_publisher cannot be empty."
  }
}

variable "os_offer" {
  description = "The offer of the OS image (e.g., '0001-com-ubuntu-server-jammy')."
  type        = string
  validation {
    condition     = length(trimspace(var.os_offer)) > 0
    error_message = "os_offer cannot be empty."
  }
}

variable "os_sku" {
  description = "The SKU of the OS image (e.g., '22_04-lts-gen2')."
  type        = string
  validation {
    condition     = length(trimspace(var.os_sku)) > 0
    error_message = "os_sku cannot be empty."
  }
}

variable "os_version" {
  description = "The version of the OS image (e.g., 'latest')."
  type        = string
  validation {
    condition     = length(trimspace(var.os_version)) > 0
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
  description = "A map of tags to assign to the created resources."
  type        = map(string)
  default     = {}
}