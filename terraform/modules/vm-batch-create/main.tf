resource "azapi_resource" "network_interface" {
  for_each = toset(var.vm_names)

  type      = "Microsoft.Network/networkInterfaces@2023-11-01"
  name      = "${each.key}-nic"
  parent_id = var.target_resource_group_id
  location  = var.location

  body = {
    properties = {
      ipConfigurations = [
        {
          name       = "ipconfig1"
          properties = {
            primary                   = true
            privateIPAllocationMethod = "Dynamic"
            subnet = {
              id = var.subnet_id
            }
          }
        }
      ]
    }
    tags = var.tags
  }

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
  location  = var.location

  body = {
    properties = {
      hardwareProfile = {
        vmSize = var.vm_size
      }
      osProfile = {
        computerName       = each.key
        adminUsername      = var.admin_username
        linuxConfiguration = {
          disablePasswordAuthentication = true
          ssh                           = {
            publicKeys = [
              {
                path    = "/home/${var.admin_username}/.ssh/authorized_keys"
                keyData = var.ssh_public_key
              }
            ]
          }
        }
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
          managedDisk  = {
            storageAccountType = "Standard_LRS"
          }
        }
      }
      networkProfile = {
        networkInterfaces = [
          {
            id      = azapi_resource.network_interface[each.key].id
            primary = true
          }
        ]
      }
      diagnosticsProfile = {
        bootDiagnostics = {
          enabled = true
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
