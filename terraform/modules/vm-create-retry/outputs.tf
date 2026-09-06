output "vm_resource_ids" {
  description = "A map from VM name to the created VM's resource ID."
  value       = { for name, vm in azapi_resource.vm : name => vm.id }
}