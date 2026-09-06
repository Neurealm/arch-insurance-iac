output "vm_resource_ids" {
  description = "A map from VM name to its created Azure Resource Manager ID."
  value       = { for name, vm in azapi_resource.virtual_machine : name => vm.id }
}