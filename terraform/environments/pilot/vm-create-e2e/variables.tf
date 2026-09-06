variable "target_resource_group_id" {
  type        = string
  description = "Azure Resource Manager ID of the destination resource group where the VMs and NICs will be created."
}

variable "subnet_id" {
  type        = string
  description = "Azure Resource Manager ID of the subnet to which each Network Interface will connect."
}

variable "vm_names" {
  type        = list(string)
  description = "A list of desired names for the virtual machines. Each name will result in one VM and one NIC."
}

variable "vm_size" {
  type        = string
  description = "The Azure VM size (e.g., 'Standard_B2s', 'Standard_D2s_v3')."
}

variable "admin_username" {
  type        = string
  description = "The administrative username for the virtual machine."
}

variable "ssh_public_key" {
  type        = string
  description = "The SSH public key for authentication to the virtual machine."
}

variable "os_publisher" {
  type        = string
  description = "The publisher of the OS image (e.g., 'Canonical', 'MicrosoftWindowsServer')."
}

variable "os_offer" {
  type        = string
  description = "The offer for the OS image (e.g., 'UbuntuServer', 'WindowsServer')."
}

variable "os_sku" {
  type        = string
  description = "The SKU for the OS image (e.g., '18.04-LTS', '2019-Datacenter')."
}

variable "os_version" {
  type        = string
  description = "The version of the OS image (e.g., 'latest', '22.04.202306200')."
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
