resource "azapi_update_resource" "os_disk_expansion" {
  type        = "Microsoft.Compute/virtualMachines@2024-07-01"
  resource_id = var.target_resource_id

  body = jsonencode({
    properties = {
      storageProfile = {
        osDisk = {
          diskSizeGB = var.requested_os_disk_size_gb
        }
      }
    }
  })

  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The 'change_request_id' must be provided and have a minimum length of 6 characters to proceed with the OS disk expansion."
    }
  }
}