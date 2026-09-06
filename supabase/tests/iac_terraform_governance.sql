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

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'hcp_plan_run_identity_required'
  ) THEN
    RAISE EXCEPTION 'HCP saved-plan identity constraint is missing';
  END IF;

  -- Phase 2: N-target change packages (iac_change_package_targets).
  IF EXISTS (
    SELECT 1 FROM public.iac_change_packages p
    WHERE NOT EXISTS (SELECT 1 FROM public.iac_change_package_targets t WHERE t.package_id = p.id)
  ) THEN RAISE EXCEPTION 'a change package exists with zero declared targets'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.iac_change_packages p
    WHERE p.target_count <> (SELECT count(*) FROM public.iac_change_package_targets t WHERE t.package_id = p.id)
  ) THEN RAISE EXCEPTION 'target_count is out of sync with iac_change_package_targets for at least one package'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.iac_automation_capabilities
    WHERE lifecycle_status = 'approved' AND (max_targets_per_run < 1 OR max_targets_per_run > 50)
  ) THEN RAISE EXCEPTION 'an approved capability has max_targets_per_run outside [1, 50]'; END IF;

  IF NOT (
    SELECT relrowsecurity FROM pg_class WHERE oid = 'public.iac_change_package_targets'::regclass
  ) THEN RAISE EXCEPTION 'RLS is not enabled on iac_change_package_targets'; END IF;
END;
$$;

ROLLBACK;
