resource "azapi_resource" "nic" {
  for_each  = toset(var.vm_names)
  parent_id = var.target_resource_group_id
  type      = "Microsoft.Network/networkInterfaces@2023-11-01"
  name      = "${each.key}-nic"
  location  = "${split("/", var.target_resource_group_id)[6]}"

  body = jsonencode({
    properties = {
      ipConfigurations = [
        {
          name       = "ipconfig1"
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
      error_message = "The resource creation is not bound to an approved change request."
    }
  }
}

resource "azapi_resource" "vm" {
  for_each  = toset(var.vm_names)
  parent_id = var.target_resource_group_id
  type      = "Microsoft.Compute/virtualMachines@2024-07-01"
  name      = each.key
  location  = "${split("/", var.target_resource_group_id)[6]}"

  body = jsonencode({
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
            id         = azapi_resource.nic[each.key].id
            properties = {
              primary = true
            }
          }
        ]
      }
      diagnosticsProfile = {
        bootDiagnostics = {
          enabled = true
          # storageUri = "..."
        }
      }
    }
    tags = var.tags
  })

  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The resource creation is not bound to an approved change request."
    }
  }
}