output "vm_resource_ids" {
  description = "A map from VM name to the created Azure Virtual Machine resource ID."
  value       = {
    for vm_name in var.vm_names : vm_name => azapi_resource.virtual_machine[vm_name].id
  }
}