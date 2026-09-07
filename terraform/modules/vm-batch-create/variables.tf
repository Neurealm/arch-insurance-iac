variable "target_resource_group_id" {
  description = "Exact Azure Resource Manager ID of the destination resource group where VMs will be created."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+$", var.target_resource_group_id))
    error_message = "target_resource_group_id must be an exact Azure resource group ID."
  }
}

variable "subnet_id" {
  description = "Exact Azure Resource Manager ID of the subnet to which each VM's Network Interface will be attached."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\.Network/virtualNetworks/[^/]+/subnets/[^/]+$", var.subnet_id))
    error_message = "subnet_id must be an exact Azure subnet resource ID."
  }
}

variable "vm_names" {
  description = "A list of desired names for the virtual machines. Each name in the list will result in one VM."
  type        = list(string)
  validation {
    condition     = length(var.vm_names) >= 1 && length(var.vm_names) <= 50
    error_message = "The list of VM names must contain between 1 and 50 entries."
  }
  validation {
    condition     = alltrue([for name in var.vm_names : can(regex("^[a-zA-Z0-9-]{1,63}$", name))])
    error_message = "VM names must be between 1 and 63 characters long and contain only letters, numbers, and hyphens."
  }
}

variable "vm_size" {
  description = "The Azure VM size to use for all virtual machines, for example 'Standard_B2s'."
  type        = string
  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.vm_size))
    error_message = "vm_size must follow the Azure naming convention, for example 'Standard_B2s'."
  }
}

variable "admin_username" {
  description = "The administrative username for accessing the Linux VMs."
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9]{1,32}$", var.admin_username))
    error_message = "Admin username must be 1-32 alphanumeric characters."
  }
}

variable "ssh_public_key" {
  description = "The SSH public key string for authenticating to the Linux VMs. Must be a valid OpenSSH public key format."
  type        = string
  validation {
    condition     = length(trimspace(var.ssh_public_key)) > 0
    error_message = "An SSH public key is required for Linux VMs."
  }
  validation {
    condition     = can(regex("^(ssh-rsa|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521|ssh-ed25519) [A-Za-z0-9+/=]+(?: .*)?$", trimspace(var.ssh_public_key)))
    error_message = "SSH public key must be in a valid OpenSSH format, for example starting with 'ssh-rsa', 'ecdsa-sha2-nistp', or 'ssh-ed25519'."
  }
}

variable "os_publisher" {
  description = "The publisher of the OS image, for example 'Canonical'."
  type        = string
}

variable "os_offer" {
  description = "The offer of the OS image, for example '0001-com-ubuntu-server-jammy'."
  type        = string
}

variable "os_sku" {
  description = "The SKU of the OS image, for example '22_04-lts-gen2'."
  type        = string
}

variable "os_version" {
  description = "The OS image version, for example 'latest' or a specific version like '22.04.202310030'."
  type        = string
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
  description = "A map of tags to assign to all created resources."
  type        = map(string)
  default     = {}
}

variable "location" {
  description = "Azure region the VMs and NICs are created in. Passed explicitly by the orchestrator from the change package region; never inferred."
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9]{3,40}$", var.location))
    error_message = "location must be an Azure region short name, for example eastus."
  }
}
