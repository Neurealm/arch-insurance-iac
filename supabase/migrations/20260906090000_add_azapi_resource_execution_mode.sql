-- Phase 4: a create_vm capability declares new azapi_resource blocks (a
-- plain CRUD resource), which is neither the RPC-style azapi_resource_action
-- ("azapi_action", used by start/stop/restart) nor a PATCH-style
-- azapi_resource_update ("azapi_update", used by resize) nor a native
-- Terraform azurerm_* resource ("azurerm_resource"). Extend the allowed set
-- instead of mislabeling it as one of those.
ALTER TABLE public.iac_automation_capabilities DROP CONSTRAINT iac_automation_capabilities_execution_mode_check;
ALTER TABLE public.iac_automation_capabilities ADD CONSTRAINT iac_automation_capabilities_execution_mode_check
  CHECK (execution_mode = ANY (ARRAY['azapi_action', 'azapi_update', 'azurerm_resource', 'azapi_resource']));
