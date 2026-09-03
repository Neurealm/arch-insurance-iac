terraform {
  required_version = ">= 1.9.0, < 2.0.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_virtual_machine" "target" {
  name                = var.vm_name
  resource_group_name = var.resource_group_name
}

output "target_resource_id" {
  description = "The VM Azure Resource Manager ID resolved by the OIDC-authenticated plan."
  value       = data.azurerm_virtual_machine.target.id
}
