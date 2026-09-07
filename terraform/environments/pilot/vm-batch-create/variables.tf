variable "target_resource_group_id" {
  type        = string
  description = "Exact Azure Resource Manager ID of the destination resource group where VMs will be created."
}

variable "subnet_id" {
  type        = string
  description = "Exact Azure Resource Manager ID of the subnet to which each VM's Network Interface will be attached."
}

variable "vm_names" {
  type        = list(string)
  description = "A list of desired names for the virtual machines. Each name in the list will result in one VM."
}

variable "vm_size" {
  type        = string
  description = "The Azure VM size to use for all virtual machines (e.g., 'Standard_B2s')."
}

variable "admin_username" {
  type        = string
  description = "The administrative username for accessing the Linux VMs."
}

variable "ssh_public_key" {
  type        = string
  description = "The SSH public key string for authenticating to the Linux VMs. Must be a valid OpenSSH public key format."
}

variable "os_publisher" {
  type        = string
  description = "The publisher of the OS image (e.g., 'Canonical')."
}

variable "os_offer" {
  type        = string
  description = "The offer of the OS image (e.g., '0001-com-ubuntu-server-jammy')."
}

variable "os_sku" {
  type        = string
  description = "The SKU of the OS image (e.g., '22_04-lts-gen2')."
}

variable "os_version" {
  type        = string
  description = "The OS image version (e.g., 'latest' or a specific version like '22.04.202310030')."
}

variable "change_request_id" {
  type        = string
  description = "Immutable ServiceNow/change-package correlation identifier."
}

variable "tags" {
  type        = map(string)
  description = "A map of tags to assign to all created resources."
}

variable "tfc_azure_dynamic_credentials" {
  description = "HCP Terraform-generated OIDC file locations for the default Azure provider."
  type        = object({
    default = object({
      client_id_file_path  = string
      oidc_token_file_path = string
    })
    aliases = map(object({
      client_id_file_path  = string
      oidc_token_file_path = string
    }))
  })
}

variable "location" {
  description = "Azure region the VMs and NICs are created in. Passed explicitly by the orchestrator from the change package region; never inferred."
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9]{3,40}$", var.location))
    error_message = "location must be an Azure region short name, for example eastus."
  }
}
