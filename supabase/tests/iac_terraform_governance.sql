BEGIN;

DO $$
DECLARE approved_count integer;
DECLARE table_name text;
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

  IF EXISTS (
    SELECT 1 FROM public.iac_automation_capabilities
    WHERE action_type = 'resize_vm'
      AND ('production' = ANY(allowed_environments) OR NOT requires_managed_resource)
  ) THEN RAISE EXCEPTION 'VM resize must remain non-production and require a managed resource'; END IF;

  FOREACH table_name IN ARRAY ARRAY[
    'iac_automation_capabilities',
    'iac_package_automation_bindings',
    'iac_terraform_runs',
    'iac_terraform_run_events'
  ]
  LOOP
    IF NOT (
      SELECT relrowsecurity
      FROM pg_class
      WHERE oid = format('public.%I', table_name)::regclass
    ) THEN
      RAISE EXCEPTION 'RLS is not enabled on %', table_name;
    END IF;

    IF has_table_privilege('authenticated', format('public.%I', table_name), 'INSERT')
      OR has_table_privilege('authenticated', format('public.%I', table_name), 'UPDATE')
      OR has_table_privilege('authenticated', format('public.%I', table_name), 'DELETE')
    THEN
      RAISE EXCEPTION 'authenticated clients can mutate %', table_name;
    END IF;
  END LOOP;

  IF has_function_privilege('public', 'public.review_iac_change_package(uuid,text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'PUBLIC can execute the privileged review function';
  END IF;

  IF NOT has_function_privilege('authenticated', 'public.review_iac_change_package(uuid,text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'authenticated reviewers cannot execute the review function';
  END IF;
END;
$$;

ROLLBACK;
