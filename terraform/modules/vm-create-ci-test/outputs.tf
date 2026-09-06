output "vm_resource_ids" {
  description = "A map from VM name to its created Azure Resource Manager ID."
  value       = { for vm_name in var.vm_names : vm_name => azapi_resource.virtual_machine[vm_name].id }
}