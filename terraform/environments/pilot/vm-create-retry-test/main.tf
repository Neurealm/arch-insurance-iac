provider "azapi" {
  # HCP Terraform supplies these short-lived files through its Azure dynamic
  # credentials integration. Do not replace this with a client secret.
  use_cli              = false
  use_oidc             = true
  client_id_file_path  = var.tfc_azure_dynamic_credentials.default.client_id_file_path
  oidc_token_file_path = var.tfc_azure_dynamic_credentials.default.oidc_token_file_path
}

module "vm_create_retry_test" {
  source = "../../../modules/vm-create-retry-test"

  target_resource_group_id = var.target_resource_group_id
  subnet_id = var.subnet_id
  vm_names = var.vm_names
  vm_size = var.vm_size
  admin_username = var.admin_username
  ssh_public_key = var.ssh_public_key
  os_publisher = var.os_publisher
  os_offer = var.os_offer
  os_sku = var.os_sku
  os_version = var.os_version
  change_request_id = var.change_request_id
  tags = var.tags
}
