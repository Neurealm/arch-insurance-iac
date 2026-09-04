variable "target_resource_id" {
  type        = string
  description = "Exact ARM ID of the Azure VM approved for this package."

  validation {
    condition     = can(regex("^/subscriptions/[^/]+/resourceGroups/[^/]+/providers/Microsoft\\.Compute/virtualMachines/[^/]+$", var.target_resource_id))
    error_message = "target_resource_id must be one Azure virtual machine ARM ID."
  }
}

variable "requested_vm_size" {
  type        = string
  description = "Approved target Azure VM SKU."

  validation {
    condition     = can(regex("^Standard_[A-Za-z0-9_]+$", var.requested_vm_size))
    error_message = "requested_vm_size must be an Azure Standard_* SKU."
  }
}

variable "change_request_id" {
  type        = string
  description = "Immutable application change-package reference."

  validation {
    condition     = length(trimspace(var.change_request_id)) >= 6
    error_message = "change_request_id must identify an approved change package."
  }
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
