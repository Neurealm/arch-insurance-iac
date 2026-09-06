-- Phase 1 of the multi-agent VM-provisioning capability plan: make
-- iac_automation_capabilities.input_schema a real, typed field list instead
-- of the current bare {"required": [...]} convention, so terraform-orchestrator
-- can compute Terraform inputs generically from the catalog row instead of a
-- hardcoded per-action switch. This migration only changes data (backfilling
-- the 4 existing rows to the new shape with identical runtime meaning) and
-- adds a loose shape check; it does not change any approved behavior.
--
-- New shape:
-- {
--   "action": "start",                 -- optional literal injected verbatim
--   "fields": [
--     { "key": "...", "source": "target" | "package_number_or_ticket" | "parameters.<dotpath>",
--       "type": "string", "required": true, "pattern": "...", "minLength": 6 }
--   ]
-- }

ALTER TABLE public.iac_automation_capabilities
  ADD CONSTRAINT input_schema_shape CHECK (
    input_schema = '{}'::jsonb OR jsonb_typeof(input_schema -> 'fields') = 'array'
  );

UPDATE public.iac_automation_capabilities
SET input_schema = '{
  "action": "start",
  "fields": [
    {"key": "target_resource_id", "source": "target", "type": "string", "required": true, "pattern": "^/subscriptions/"},
    {"key": "change_request_id", "source": "package_number_or_ticket", "type": "string", "required": true, "minLength": 6}
  ]
}'::jsonb
WHERE action_type = 'start_vm';

UPDATE public.iac_automation_capabilities
SET input_schema = '{
  "action": "powerOff",
  "fields": [
    {"key": "target_resource_id", "source": "target", "type": "string", "required": true, "pattern": "^/subscriptions/"},
    {"key": "change_request_id", "source": "package_number_or_ticket", "type": "string", "required": true, "minLength": 6}
  ]
}'::jsonb
WHERE action_type = 'stop_vm';

UPDATE public.iac_automation_capabilities
SET input_schema = '{
  "action": "restart",
  "fields": [
    {"key": "target_resource_id", "source": "target", "type": "string", "required": true, "pattern": "^/subscriptions/"},
    {"key": "change_request_id", "source": "package_number_or_ticket", "type": "string", "required": true, "minLength": 6}
  ]
}'::jsonb
WHERE action_type = 'restart_vm';

UPDATE public.iac_automation_capabilities
SET input_schema = '{
  "fields": [
    {"key": "target_resource_id", "source": "target", "type": "string", "required": true, "pattern": "^/subscriptions/"},
    {"key": "change_request_id", "source": "package_number_or_ticket", "type": "string", "required": true, "minLength": 6},
    {"key": "requested_vm_size", "source": "parameters.requestedVmSize", "type": "string", "required": true, "pattern": "^Standard_[A-Za-z0-9_]+$"}
  ]
}'::jsonb
WHERE action_type = 'resize_vm';
