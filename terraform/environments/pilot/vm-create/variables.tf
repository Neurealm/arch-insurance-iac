variable "target_resource_group_id" {
  type        = string
  description = "The Azure Resource Manager ID of the resource group where the VMs and NICs will be created."
}

variable "subnet_id" {
  type        = string
  description = "The Azure Resource Manager ID of the subnet to which the NICs will attach."
}

variable "vm_names" {
  type        = list(string)
  description = "A list of desired names for the virtual machines. Each name will result in one VM and one NIC."
}

variable "vm_size" {
  type        = string
  description = "The Azure VM size to use for the virtual machines (e.g., Standard_B2s)."
}

variable "admin_username" {
  type        = string
  description = "The administrator username for the virtual machines."
}

variable "ssh_public_key" {
  type        = string
  description = "The SSH public key to be installed on the Linux virtual machines for authentication."
}

variable "os_publisher" {
  type        = string
  description = "The publisher of the OS image (e.g., Canonical)."
}

variable "os_offer" {
  type        = string
  description = "The offer of the OS image (e.g., 0001-com-ubuntu-server-jammy)."
}

variable "os_sku" {
  type        = string
  description = "The SKU of the OS image (e.g., 22_04-lts-gen2)."
}

variable "os_version" {
  type        = string
  description = "The version of the OS image (e.g., latest)."
}

variable "change_request_id" {
  type        = string
  description = "Immutable ServiceNow/change-package correlation identifier."
}

variable "tags" {
  type        = map(string)
  description = "A map of tags to apply to all created resources."
}

variable "tfc_azure_dynamic_credentials" {
  description = "HCP Terraform-generated OIDC file locations for the default Azure provider."
  type = object({
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
