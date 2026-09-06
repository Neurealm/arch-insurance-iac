variable "target_resource_group_id" {
  description = "Azure Resource Manager ID of the destination resource group where the VMs and NICs will be created."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+$", var.target_resource_group_id))
    error_message = "target_resource_group_id must be an exact Azure Resource Group resource ID."
  }
}

variable "subnet_id" {
  description = "Azure Resource Manager ID of the subnet to which each Network Interface will connect."
  type        = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\.Network/virtualNetworks/[^/]+/subnets/[^/]+$", var.subnet_id))
    error_message = "subnet_id must be an exact Azure Subnet resource ID."
  }
}

variable "vm_names" {
  description = "A list of desired names for the virtual machines. Each name will result in one VM and one NIC."
  type        = list(string)
  validation {
    condition     = length(var.vm_names) >= 1 && length(var.vm_names) <= 50
    error_message = "The 'vm_names' list must contain between 1 and 50 virtual machine names."
  }
  validation {
    condition     = alltrue([for name in var.vm_names : can(regex("^[a-zA-Z0-9-]{1,64}$", name))])
    error_message = "All VM names must be alphanumeric, hyphenated, and between 1 and 64 characters."
  }
}

variable "vm_size" {
  description = "The Azure VM size (e.g., 'Standard_B2s', 'Standard_D2s_v3')."
  type        = string
  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.vm_size))
    error_message = "The 'vm_size' must follow the Azure naming convention (e.g., 'Standard_B2s')."
  }
}

variable "admin_username" {
  description = "The administrative username for the virtual machine."
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9_.-]{1,32}$", var.admin_username)) && !can(regex("^(root|admin|administrator|guest|\b[aA]z(ure)?admin\b)", lower(var.admin_username)))
    error_message = "Admin username must be 1-32 alphanumeric characters (including . and _), and cannot be reserved names like 'root' or 'admin'."
  }
}

variable "ssh_public_key" {
  description = "The SSH public key for authentication to the virtual machine."
  type        = string
  validation {
    condition     = can(regex("^ssh-(rsa|ed25519|dss) [A-Za-z0-9+/=]+", var.ssh_public_key))
    error_message = "The SSH public key must be in a valid OpenSSH format (e.g., starts with 'ssh-rsa')."
  }
}

variable "os_publisher" {
  description = "The publisher of the OS image (e.g., 'Canonical', 'MicrosoftWindowsServer')."
  type        = string
}

variable "os_offer" {
  description = "The offer for the OS image (e.g., 'UbuntuServer', 'WindowsServer')."
  type        = string
}

variable "os_sku" {
  description = "The SKU for the OS image (e.g., '18.04-LTS', '2019-Datacenter')."
  type        = string
}

variable "os_version" {
  description = "The version of the OS image (e.g., 'latest', '22.04.202306200')."
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
  description = "A map of tags to apply to all created resources."
  type        = map(string)
  default     = {}
}