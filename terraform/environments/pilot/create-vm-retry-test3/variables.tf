variable "target_resource_group_id" {
  type        = string
  description = "The Azure Resource Manager ID of the target resource group where the VMs will be created."
}

variable "subnet_id" {
  type        = string
  description = "The Azure Resource Manager ID of the subnet to which the VMs' network interfaces will be connected."
}

variable "vm_names" {
  type        = list(string)
  description = "A list of desired names for the virtual machines to be created. Each name will result in a new VM and NIC."
}

variable "vm_size" {
  type        = string
  description = "The size of the virtual machines (e.g., 'Standard_B2s', 'Standard_DS1_v2')."
}

variable "admin_username" {
  type        = string
  description = "The administrative username for the virtual machines."
}

variable "ssh_public_key" {
  type        = string
  description = "The SSH public key for authentication to Linux virtual machines. For Windows, this variable should still be provided but will not be used."
}

variable "os_publisher" {
  type        = string
  description = "The publisher of the operating system image (e.g., 'Canonical', 'MicrosoftWindowsServer')."
}

variable "os_offer" {
  type        = string
  description = "The offer of the operating system image (e.g., '0001-com-ubuntu-server-focal', 'WindowsServer')."
}

variable "os_sku" {
  type        = string
  description = "The SKU of the operating system image (e.g., '22_04-lts', '2022-datacenter')."
}

variable "os_version" {
  type        = string
  description = "The version of the operating system image (e.g., 'latest')."
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
