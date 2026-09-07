-- Phase 3: turn "10 VMs in this resource group" into declared targets.
--
-- A create_vm request names machines that do not exist yet, so their ARM IDs
-- have to be synthesised before the package can declare them. Two callers need
-- this -- the console provisioning screen and servicenow-intake -- and two
-- implementations would drift, so the synthesis lives in SQL and both call it.
--
-- The name charset is not cosmetic. armIdentity() in execution-policy.ts parses
-- a resource name as [A-Za-z0-9_-]+ and the drafted module validates
-- [a-zA-Z0-9-]{1,63}. A ticket asking for "app.dev.01" would otherwise produce
-- a target the orchestrator rejects deep inside planning with a cryptic "An
-- exact VM or NIC ARM resource ID is required". Rejecting it here means intake
-- can ask the requester for a valid name instead.
--
-- The cap of 20 matches the create_vm capability's max_targets_per_run and the
-- draft policy's maxItems, so an over-large request fails early and legibly
-- rather than at scope resolution.

CREATE FUNCTION public.iac_vm_target_ids(p_resource_group_arm_id text, p_vm_names text[])
RETURNS text[]
LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, pg_temp AS $ids$
DECLARE
  v_group text := btrim(coalesce(p_resource_group_arm_id, ''));
  v_name text;
  v_seen text[] := ARRAY[]::text[];
  v_ids text[] := ARRAY[]::text[];
BEGIN
  IF v_group !~ '^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[A-Za-z0-9_.()-]+$' THEN
    RAISE EXCEPTION 'a destination resource group ARM ID is required' USING ERRCODE = '22023';
  END IF;
  IF p_vm_names IS NULL OR array_length(p_vm_names, 1) IS NULL THEN
    RAISE EXCEPTION 'at least one virtual machine name is required' USING ERRCODE = '22023';
  END IF;
  IF array_length(p_vm_names, 1) > 20 THEN
    RAISE EXCEPTION 'at most 20 virtual machines may be requested in one change package' USING ERRCODE = '22023';
  END IF;

  FOREACH v_name IN ARRAY p_vm_names LOOP
    v_name := btrim(coalesce(v_name, ''));
    IF v_name !~ '^[A-Za-z0-9][A-Za-z0-9-]{0,62}$' THEN
      RAISE EXCEPTION 'virtual machine name is not valid for Azure: %', coalesce(nullif(v_name, ''), '(empty)') USING ERRCODE = '22023';
    END IF;
    IF lower(v_name) = ANY (v_seen) THEN
      RAISE EXCEPTION 'duplicate virtual machine name: %', v_name USING ERRCODE = '22023';
    END IF;
    v_seen := array_append(v_seen, lower(v_name));
    v_ids := array_append(v_ids, v_group || '/providers/Microsoft.Compute/virtualMachines/' || v_name);
  END LOOP;

  RETURN v_ids;
END;
$ids$;

REVOKE ALL ON FUNCTION public.iac_vm_target_ids(text, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.iac_vm_target_ids(text, text[]) TO authenticated, service_role;

COMMENT ON FUNCTION public.iac_vm_target_ids(text, text[]) IS
  'Synthesises the exact VM ARM IDs a create_vm package will declare, from a destination resource group and the requested machine names. The single synthesis point for both the console and servicenow-intake; save_iac_change_package re-validates the result independently.';
