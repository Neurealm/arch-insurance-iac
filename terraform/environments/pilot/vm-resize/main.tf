provider "azapi" {
  # HCP Terraform supplies these short-lived files through its Azure dynamic
  # credentials integration. Do not replace this with a client secret.
  use_cli              = false
  use_oidc             = true
  client_id_file_path  = var.tfc_azure_dynamic_credentials.default.client_id_file_path
  oidc_token_file_path = var.tfc_azure_dynamic_credentials.default.oidc_token_file_path
}

module "vm_resize" {
  source = "../../../modules/vm-resize"

  target_resource_id = var.target_resource_id
  requested_vm_size  = var.requested_vm_size
  change_request_id  = var.change_request_id
}
