-- Corrects three gaps found while wiring the readiness engine's persistence
-- layer to the catalog seeded in 20260914120000/20260914121500:
--   1. "description" (ticket.description.length >= 10, validate()'s own
--      check) was missing from every seeded requiredFields list, for all 9
--      SUPPORTED_ACTIONS types.
--   2. create_vm's seeded requiredFields omitted "maintenanceWindow", which
--      CREATE_VM_FIELDS (_shared/servicenow-change-agent.ts) and validate()'s
--      shared common-field checks both require for create_vm same as every
--      other action.
--   3. configure_backup/enable_monitoring/assess_patches were seeded with
--      automationSupported=false, but validate() has real bespoke validation
--      for all three (RPO/RTO, monitoring, and patch-window text checks) and
--      maybeCreateDraft() treats them identically to the other 6 supported
--      actions once a target VM and approved capability exist. Corrected to
--      automationSupported=true, matching SUPPORTED_ACTIONS membership
--      exactly instead of the hand-picked 6-type subset from the first seed.
--
-- schema content is immutable once inserted (enforce_iac_request_schema_
-- immutability), so this adds a new version for each of the 9 affected
-- request_types and activates it, deactivating the current version first
-- (both cannot be active at once under the one-active-per-request_type
-- partial unique index) -- the same pattern 20260914121500 established.

DO $fix$
DECLARE
  v_common jsonb := '["requester","application","environment","description","maintenanceWindow","businessImpact","applicationOwner","rollbackPlan","targetVm"]'::jsonb;
  v_create_vm_fields jsonb := '["requester","application","environment","description","maintenanceWindow","businessImpact","applicationOwner","rollbackPlan","resourceGroupArmId","subnetArmId","location","vmNames","vmSize","adminUsername","sshPublicKey","osPublisher","osOffer","osSku","osVersion"]'::jsonb;
  v_type text;
  v_fields jsonb;
  v_next_version integer;
  v_schema_id uuid;
BEGIN
  FOREACH v_type IN ARRAY ARRAY[
    'start_vm','stop_vm','restart_vm','resize_vm','increase_os_disk','create_vm',
    'configure_backup','enable_monitoring','assess_patches'
  ] LOOP
    v_fields := CASE
      WHEN v_type = 'resize_vm' THEN v_common || '["requestedVmSize"]'::jsonb
      WHEN v_type = 'increase_os_disk' THEN v_common || '["requestedOsDiskSizeGb"]'::jsonb
      WHEN v_type = 'create_vm' THEN v_create_vm_fields
      ELSE v_common
    END;
    SELECT coalesce(max(version), 0) + 1 INTO v_next_version FROM public.iac_request_schemas WHERE request_type = v_type;

    PERFORM set_config('app.servicenow_agent_registry_activation', 'on', true);
    UPDATE public.iac_request_schemas SET active = false WHERE request_type = v_type AND active;

    INSERT INTO public.iac_request_schemas (request_type, version, schema, active)
    VALUES (v_type, v_next_version, jsonb_build_object('requiredFields', v_fields, 'requiredApprovals', '[]'::jsonb, 'automationSupported', true), false)
    RETURNING id INTO v_schema_id;

    PERFORM set_config('app.servicenow_agent_registry_activation', 'on', true);
    UPDATE public.iac_request_schemas SET active = true WHERE id = v_schema_id;
  END LOOP;
END;
$fix$;
