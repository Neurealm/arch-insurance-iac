variable "target_resource_group_id" {
  description = "Exact Azure Resource Manager ID of the destination resource group where the VMs will be created."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+$", var.target_resource_group_id))
    error_message = "target_resource_group_id must be an exact Azure Resource Group ID."
  }
}

variable "subnet_id" {
  description = "Exact Azure Resource Manager ID of the subnet to which each Network Interface will connect."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\.Network/virtualNetworks/[^/]+/subnets/[^/]+$", var.subnet_id))
    error_message = "subnet_id must be an exact Azure Subnet Resource ID."
  }
}

variable "vm_names" {
  description = "A list of desired names for the virtual machines. Each name will result in a new VM and Network Interface."
  type        = list(string)
  validation {
    condition     = length(var.vm_names) >= 1 && length(var.vm_names) <= 50
    error_message = "The list of VM names must contain between 1 and 50 entries."
  }
}

variable "vm_size" {
  description = "The size of the virtual machines, e.g., 'Standard_B2s'."
  type        = string
  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.vm_size))
    error_message = "vm_size must follow the pattern 'Standard_Xxxx', e.g., Standard_B2s."
  }
}

variable "admin_username" {
  description = "The administrator username for the virtual machines."
  type        = string
}

variable "ssh_public_key" {
  description = "The SSH public key for authentication to Linux virtual machines."
  type        = string
  validation {
    condition     = length(trimspace(var.ssh_public_key)) > 0
    error_message = "ssh_public_key cannot be empty."
  }
}

variable "os_publisher" {
  description = "The publisher of the OS image, e.g., 'Canonical'."
  type        = string
}

variable "os_offer" {
  description = "The offer of the OS image, e.g., '0001-com-ubuntu-server-jammy'."
  type        = string
}

variable "os_sku" {
  description = "The SKU of the OS image, e.g., '22_04-lts-gen2'."
  type        = string
}

variable "os_version" {
  description = "The version of the OS image, e.g., 'latest'."
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