output "resized_os_disk_gb" {
  description = "The OS disk size, in GB, applied to the target VM."
  value       = var.requested_os_disk_size_gb
}