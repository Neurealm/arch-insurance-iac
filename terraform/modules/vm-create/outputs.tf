output "vm_resource_ids" {
  description = "A map from VM name to the created Virtual Machine's resource ID."
  value       = { for vm_name, vm in azapi_resource.vm : vm_name => vm.id }
}

output "nic_resource_ids" {
  description = "A map from VM name to the created Network Interface's resource ID."
  value       = { for vm_name, nic in azapi_resource.nic : vm_name => nic.id }
}