output "os_disk_expansion_resource_id" {
  description = "The ARM ID of the VM whose OS disk was expanded."
  value       = azapi_update_resource.os_disk_expansion.id
}

output "requested_os_disk_size_gb_applied" {
  description = "The OS disk size (in GB) that was requested and applied."
  value       = var.requested_os_disk_size_gb
}