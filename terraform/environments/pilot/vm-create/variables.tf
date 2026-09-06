variable "target_resource_group_id" {
  type        = string
  description = "The exact Azure Resource Manager ID of the target Resource Group where the VMs and NICs will be created."
}

variable "subnet_id" {
  type        = string
  description = "The exact Azure Resource Manager ID of the subnet to which each Network Interface will be attached."
}

variable "vm_names" {
  type        = list(string)
  description = "A list of desired names for the virtual machines. One VM will be created for each name provided."
}

variable "vm_size" {
  type        = string
  description = "The Azure VM size (e.g., 'Standard_B2s') for all virtual machines created by this module."
}

variable "admin_username" {
  type        = string
  description = "The administrator username for the virtual machines."
}

variable "ssh_public_key" {
  type        = string
  description = "The SSH public key content (e.g., from '~/.ssh/id_rsa.pub') to be injected into the virtual machines for secure access."
}

variable "os_publisher" {
  type        = string
  description = "The publisher of the OS image (e.g., 'Canonical')."
}

variable "os_offer" {
  type        = string
  description = "The offer of the OS image (e.g., 'UbuntuServer')."
}

variable "os_sku" {
  type        = string
  description = "The SKU of the OS image (e.g., '22_04-lts')."
}

variable "os_version" {
  type        = string
  description = "The version of the OS image (e.g., 'latest' or '22.04.202306050')."
}

variable "change_request_id" {
  type        = string
  description = "Immutable ServiceNow/change-package correlation identifier."
}

variable "tags" {
  type        = map(string)
  description = "A map of tags to apply to all created resources (VMs and NICs)."
}

variable "location" {
  type        = string
  description = "The Azure region where the resources will be created. This must match the region of the target resource group."
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
