resource "azapi_resource" "network_interface" {
  for_each = toset(var.vm_names)

  type      = "Microsoft.Network/networkInterfaces@2023-11-01"
  name      = "${each.key}-nic"
  parent_id = var.target_resource_group_id
  location  = trimprefix(var.target_resource_group_id, "/subscriptions/${element(split("/", var.target_resource_group_id), 2)}/resourceGroups/${element(split("/", var.target_resource_group_id), 4)}/providers/Microsoft.Resources/resourceGroups/") # Extract location from resource group ID. This is a hack, a dedicated location var would be better.

  body = jsonencode({
    properties = {
      ipConfigurations = [
        {
          name = "ipconfig1"
          properties = {
            subnet = {
              id = var.subnet_id
            }
            privateIpAllocationMethod = "Dynamic"
          }
        }
      ]
    }
    tags = var.tags
  })

  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The action is not bound to an approved change request."
    }
  }
}

resource "azapi_resource" "virtual_machine" {
  for_each = toset(var.vm_names)

  type      = "Microsoft.Compute/virtualMachines@2024-07-01"
  name      = each.key
  parent_id = var.target_resource_group_id
  location  = trimprefix(var.target_resource_group_id, "/subscriptions/${element(split("/", var.target_resource_group_id), 2)}/resourceGroups/${element(split("/", var.target_resource_group_id), 4)}/providers/Microsoft.Resources/resourceGroups/") # Extract location from resource group ID. This is a hack, a dedicated location var would be better.

  body = jsonencode({
    properties = {
      hardwareProfile = {
        vmSize = var.vm_size
      }
      storageProfile = {
        imageReference = {
          publisher = var.os_publisher
          offer     = var.os_offer
          sku       = var.os_sku
          version   = var.os_version
        }
        osDisk = {
          createOption = "FromImage"
          managedDisk = {
            storageAccountType = "Standard_LRS"
          }
        }
      }
      osProfile = {
        computerName  = each.key
        adminUsername = var.admin_username
        linuxConfiguration = {
          disablePasswordAuthentication = true
          ssh = {
            publicKeys = [
              {
                path    = "/home/${var.admin_username}/.ssh/authorized_keys"
                keyData = var.ssh_public_key
              }
            ]
          }
        }
      }
      networkProfile = {
        networkInterfaces = [
          {
            id = azapi_resource.network_interface[each.key].id
          }
        ]
      }
      diagnosticsProfile = {
        bootDiagnostics = {
          enabled = true
          # storageUri = "<your_storage_account_uri>" # Optional: specify a storage account for boot diagnostics
        }
      }
    }
    tags = var.tags
  })

  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The action is not bound to an approved change request."
    }
  }
}