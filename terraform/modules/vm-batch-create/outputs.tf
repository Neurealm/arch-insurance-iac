output "virtual_machine_ids" {
  description = "A map from VM name to the created Virtual Machine's Azure Resource Manager ID."
  value       = { for name, vm in azapi_resource.virtual_machine : name => vm.id }
}