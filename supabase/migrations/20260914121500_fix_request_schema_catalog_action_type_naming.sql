-- Bugfix for 20260914120000's seed data: it invented request_type values
-- (backup_restore, monitoring_alerting, scaling_performance) that don't
-- match the actual action_type strings SUPPORTED_ACTIONS/validate()/
-- iac_automation_capabilities already use throughout this codebase
-- (configure_backup, enable_monitoring, assess_patches -- confirmed by
-- direct grep of _shared/servicenow-intake-agent-core.ts). A catalog
-- entry under the wrong key is never looked up by loadActiveRequestSchema,
-- so those three action types would silently fall back to the generic
-- schema instead of getting their real requirement list. request_type is
-- immutable once inserted (enforce_iac_request_schema_immutability), so
-- this seeds the correctly-named rows and deactivates the mis-named ones
-- rather than attempting to rename them in place.
-- scaling_performance is dropped outright, not renamed: resize_vm already
-- covers VM scaling/performance, the only automated case in this platform,
-- making it a pure duplicate rather than a distinct action type.

DO $fix$
DECLARE
  v_common jsonb := '["requester","application","environment","maintenanceWindow","businessImpact","applicationOwner","rollbackPlan","targetVm"]'::jsonb;
  v_schema_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.iac_request_schemas WHERE request_type = 'configure_backup') THEN
    INSERT INTO public.iac_request_schemas (request_type, version, schema, active)
    VALUES ('configure_backup', 1, jsonb_build_object('requiredFields', v_common, 'requiredApprovals', '[]'::jsonb, 'automationSupported', false), false)
    RETURNING id INTO v_schema_id;
    PERFORM set_config('app.servicenow_agent_registry_activation', 'on', true);
    UPDATE public.iac_request_schemas SET active = true WHERE id = v_schema_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.iac_request_schemas WHERE request_type = 'enable_monitoring') THEN
    INSERT INTO public.iac_request_schemas (request_type, version, schema, active)
    VALUES ('enable_monitoring', 1, jsonb_build_object('requiredFields', v_common, 'requiredApprovals', '[]'::jsonb, 'automationSupported', false), false)
    RETURNING id INTO v_schema_id;
    PERFORM set_config('app.servicenow_agent_registry_activation', 'on', true);
    UPDATE public.iac_request_schemas SET active = true WHERE id = v_schema_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.iac_request_schemas WHERE request_type = 'assess_patches') THEN
    INSERT INTO public.iac_request_schemas (request_type, version, schema, active)
    VALUES ('assess_patches', 1, jsonb_build_object('requiredFields', v_common, 'requiredApprovals', '[]'::jsonb, 'automationSupported', false), false)
    RETURNING id INTO v_schema_id;
    PERFORM set_config('app.servicenow_agent_registry_activation', 'on', true);
    UPDATE public.iac_request_schemas SET active = true WHERE id = v_schema_id;
  END IF;

  -- Deactivate the mis-named rows. They stay in history (immutable, append
  -- -only content) but no longer resolve via the "one active version" index,
  -- so loadActiveRequestSchema's WHERE active=true lookup never finds them.
  PERFORM set_config('app.servicenow_agent_registry_activation', 'on', true);
  UPDATE public.iac_request_schemas SET active = false
  WHERE request_type IN ('backup_restore', 'monitoring_alerting', 'scaling_performance') AND active;
END;
$fix$;
