# HCP Terraform configurations

These root configurations are for the API-driven HCP Terraform workspaces.

- HCP Terraform owns state for these configurations. Do not add an `azurerm` backend block here.
- The existing `terraform/environments/pilot` Azure Blob backend remains for the legacy custom-runner design; it is not used by HCP workspaces.
- `authentication-check/` is a read-only AzureRM plan used to prove HCP Terraform workload-identity federation.
- It reads one existing VM and produces no resource changes. It must succeed before we enable operational VM actions through HCP Terraform.
- The workflow receives the workspace ID, resource group and VM name only at run time. No secrets, state, plans or customer-specific `.tfvars` files are committed.
