resource "azapi_resource" "nic" {
  for_each = toset(var.vm_names)

  type      = "Microsoft.Network/networkInterfaces@2023-11-01"
  name      = "nic-${each.key}"
  parent_id = var.target_resource_group_id
  location  = var.location
  tags      = var.tags

  body = jsonencode({
    properties = {
      ipConfigurations = [
        {
          name       = "ipconfig-${each.key}"
          properties = {
            privateIPAllocationMethod = "Dynamic"
            subnet                    = {
              id = var.subnet_id
            }
          }
        }
      ]
    }
  })

  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The creation of network interfaces is not bound to an approved change request."
    }
  }
}

resource "azapi_resource" "vm" {
  for_each = toset(var.vm_names)

  type      = "Microsoft.Compute/virtualMachines@2024-07-01"
  name      = each.key
  parent_id = var.target_resource_group_id
  location  = var.location
  tags      = var.tags

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
          managedDisk  = {
            storageAccountType = "Standard_LRS"
          }
        }
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
      networkProfile = {
        networkInterfaces = [
          {
            id      = azapi_resource.nic[each.key].id
            primary = true
          }
        ]
      }
    }
  })

  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The creation of virtual machines is not bound to an approved change request."
    }
  }
}