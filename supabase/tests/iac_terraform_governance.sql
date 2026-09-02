BEGIN;

DO $$
DECLARE approved_count integer;
BEGIN
  SELECT count(*) INTO approved_count FROM public.iac_automation_capabilities
   WHERE resource_type = 'Microsoft.Compute/virtualMachines' AND lifecycle_status = 'approved';
  IF approved_count <> 4 THEN RAISE EXCEPTION 'expected four approved VM capabilities, found %', approved_count; END IF;

  IF EXISTS (
    SELECT 1 FROM public.iac_automation_capabilities
    WHERE action_type = 'increase_os_disk' AND lifecycle_status = 'approved'
  ) THEN RAISE EXCEPTION 'OS disk expansion must remain gated in testing'; END IF;

  IF EXISTS (
    SELECT action_type FROM public.iac_automation_capabilities
    WHERE lifecycle_status = 'approved'
    GROUP BY provider, resource_type, action_type HAVING count(*) > 1
  ) THEN RAISE EXCEPTION 'multiple approved module versions found for one action'; END IF;
END;
$$;

ROLLBACK;
