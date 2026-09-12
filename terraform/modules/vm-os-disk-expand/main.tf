resource "azapi_update_resource" "os_disk_resize" {
  type        = "Microsoft.Compute/virtualMachines@2024-07-01"
  resource_id = var.target_resource_id

  body = {
    properties = {
      storageProfile = {
        osDisk = {
          diskSizeGB = var.requested_os_disk_size_gb
        }
      }
    }
  }

  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "The disk resize is not bound to an approved change request."
    }
  }
}