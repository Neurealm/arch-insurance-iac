variable "target_resource_id" {
  type        = string
  description = "Governed OS-disk expansion input: target_resource_id."
}

variable "requested_os_disk_size_gb" {
  type        = number
  description = "Governed OS-disk expansion input: requested_os_disk_size_gb."
}

variable "change_request_id" {
  type        = string
  description = "Governed OS-disk expansion input: change_request_id."
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
