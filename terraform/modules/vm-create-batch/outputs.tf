output "vm_resource_ids" {
  description = "Map of VM name to the created VM's exact Azure Resource Manager ID."
  value       = { for vm_name, vm in azapi_resource.vm : vm_name => vm.id }
}