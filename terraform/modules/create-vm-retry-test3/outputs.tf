output "vm_resource_ids" {
  description = "A map from VM name to the created VM's Azure Resource Manager ID."
  value       = { for vm_name, vm in azapi_resource.virtual_machine : vm_name => vm.id }
}