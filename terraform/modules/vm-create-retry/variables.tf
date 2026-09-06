variable "target_resource_group_id" {
  description = "Exact Azure Resource Manager ID of the destination resource group where VMs will be created."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+$", var.target_resource_group_id))
    error_message = "target_resource_group_id must be an exact Azure resource group ID."
  }
}

variable "subnet_id" {
  description = "Exact Azure Resource Manager ID of the subnet to which each VM's network interface will connect."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\.Network/virtualNetworks/[^/]+/subnets/[^/]+$", var.subnet_id))
    error_message = "subnet_id must be an exact Azure subnet resource ID."
  }
}

variable "vm_names" {
  description = "A list of desired names for the virtual machines to be created. Each name will result in a new VM."
  type        = list(string)
  validation {
    condition     = length(var.vm_names) >= 1 && length(var.vm_names) <= 50
    error_message = "vm_names must contain between 1 and 50 entries."
  }
  validation {
    condition     = all([for name in var.vm_names : length(name) >= 1 && length(name) <= 64 && can(regex("^[A-Za-z0-9_.-]+$", name))])
    error_message = "Each VM name must be between 1 and 64 characters, and contain only letters, numbers, hyphens, underscores, or periods."
  }
}

variable "vm_size" {
  description = "The size of the virtual machines (e.g., 'Standard_B2s')."
  type        = string
  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.vm_size))
    error_message = "vm_size must start with 'Standard_' followed by alphanumeric characters or underscores."
  }
}

variable "admin_username" {
  description = "The administrative username for the virtual machines."
  type        = string
  validation {
    condition     = length(var.admin_username) >= 1 && length(var.admin_username) <= 64 && can(regex("^[A-Za-z0-9_.-]+$", var.admin_username))
    error_message = "admin_username must be between 1 and 64 characters, and contain only letters, numbers, hyphens, underscores, or periods."
  }
}

variable "ssh_public_key" {
  description = "The SSH public key to be used for authentication on Linux virtual machines."
  type        = string
  validation {
    condition     = length(var.ssh_public_key) > 0 && substr(var.ssh_public_key, 0, 4) == "ssh-"
    error_message = "ssh_public_key must be a valid SSH public key string (e.g., starting with 'ssh-rsa')."
  }
}

variable "os_publisher" {
  description = "The publisher of the OS image (e.g., 'Canonical')."
  type        = string
  validation {
    condition     = length(var.os_publisher) > 0
    error_message = "os_publisher cannot be empty."
  }
}

variable "os_offer" {
  description = "The offer of the OS image (e.g., '0001-com-ubuntu-server-jammy')."
  type        = string
  validation {
    condition     = length(var.os_offer) > 0
    error_message = "os_offer cannot be empty."
  }
}

variable "os_sku" {
  description = "The SKU of the OS image (e.g., '22_04-lts-gen2')."
  type        = string
  validation {
    condition     = length(var.os_sku) > 0
    error_message = "os_sku cannot be empty."
  }
}

variable "os_version" {
  description = "The version of the OS image (e.g., 'latest' or a specific version like '22.04.202305240')."
  type        = string
  validation {
    condition     = length(var.os_version) > 0
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
  description = "A map of tags to assign to the virtual machines and network interfaces."
  type        = map(string)
  default     = {}
}