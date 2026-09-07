-- save_iac_change_package guarded author delegation with
-- `current_user <> 'service_role'`. That test is correct in the SECURITY
-- INVOKER functions it was copied from (record_iac_capability_ci,
-- approve_iac_capability), where current_user really is the caller's role.
--
-- This function is SECURITY DEFINER, so inside it current_user is the function
-- OWNER (postgres), never the caller. The guard therefore always fired and
-- p_created_by could never be supplied -- which would have broken
-- servicenow-intake's draft creation the first time a ticket arrived.
--
-- auth.role() reads the role claim from the request JWT and is unaffected by
-- the definer switch, so it identifies the actual caller. Caught by exercising
-- the RPC against the live schema rather than by reading it.

CREATE OR REPLACE FUNCTION public.save_iac_change_package(
  p_package jsonb,
  p_targets jsonb,
  p_submit boolean DEFAULT false,
  p_package_id uuid DEFAULT NULL,
  p_created_by uuid DEFAULT NULL
) RETURNS public.iac_change_packages
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $save$
DECLARE
  v_actor uuid := auth.uid();
  v_pkg public.iac_change_packages%ROWTYPE;
  v_target jsonb;
  v_ids text[] := ARRAY[]::text[];
  v_id text;
  v_group text;
  v_subscription text;
  v_count integer;
BEGIN
  -- servicenow-intake runs as the service role on behalf of the ticket's
  -- requester; nobody else may nominate an author.
  IF p_created_by IS NOT NULL THEN
    IF coalesce(auth.role(), '') <> 'service_role' THEN
      RAISE EXCEPTION 'package_author_cannot_be_delegated' USING ERRCODE = '42501';
    END IF;
    v_actor := p_created_by;
  END IF;
  IF v_actor IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501'; END IF;

  IF jsonb_typeof(p_package) IS DISTINCT FROM 'object' OR jsonb_typeof(p_targets) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'invalid_change_package_payload' USING ERRCODE = '22023';
  END IF;
  v_count := jsonb_array_length(p_targets);
  IF v_count < 1 OR v_count > 50 THEN RAISE EXCEPTION 'a_change_package_declares_between_1_and_50_targets' USING ERRCODE = '22023'; END IF;

  FOR v_target IN SELECT * FROM jsonb_array_elements(p_targets) LOOP
    v_id := lower(btrim(coalesce(v_target->>'target_resource_id', '')));
    IF v_id !~ '^/subscriptions/[0-9a-f-]{36}/resourcegroups/[a-z0-9_.()-]+/providers/microsoft\.compute/virtualmachines/[a-z0-9_-]+$' THEN
      RAISE EXCEPTION 'target is not an exact Azure VM resource ID: %', coalesce(v_target->>'target_resource_id', '(null)') USING ERRCODE = '22023';
    END IF;
    IF v_id = ANY (v_ids) THEN RAISE EXCEPTION 'duplicate_change_package_target' USING ERRCODE = '22023'; END IF;
    v_ids := array_append(v_ids, v_id);
    IF v_group IS NULL THEN
      v_group := split_part(v_id, '/providers/', 1);
      v_subscription := split_part(v_id, '/', 3);
    ELSIF v_group <> split_part(v_id, '/providers/', 1) THEN
      RAISE EXCEPTION 'change_package_targets_span_multiple_resource_groups' USING ERRCODE = '22023';
    END IF;
  END LOOP;

  IF NOT (lower(btrim(coalesce(p_package->>'target_resource_id', ''))) = ANY (v_ids)) THEN
    RAISE EXCEPTION 'the_representative_target_must_be_one_of_the_declared_targets' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_group));
  IF EXISTS (
    SELECT 1 FROM public.iac_change_package_targets t
    JOIN public.iac_change_packages p ON p.id = t.package_id
    WHERE lower(t.target_resource_id) = ANY (v_ids)
      AND p.status NOT IN ('changes_requested','rejected','executed','execution_failed')
      AND (p_package_id IS NULL OR p.id <> p_package_id)
  ) THEN
    RAISE EXCEPTION 'another_in_flight_change_package_already_targets_one_of_these_resources' USING ERRCODE = '22023';
  END IF;

  IF p_package_id IS NULL THEN
    INSERT INTO public.iac_change_packages (
      created_by, status, package_number, target_resource_id, target_name, subscription_id,
      resource_group, region, action_type, action_label, parameters, rationale, current_state,
      policy_evidence, validation_plan, risk_score, risk_level, approval_required
    ) VALUES (
      v_actor, 'draft', p_package->>'package_number', p_package->>'target_resource_id',
      p_package->>'target_name', p_package->>'subscription_id', p_package->>'resource_group',
      lower(p_package->>'region'), p_package->>'action_type', p_package->>'action_label',
      coalesce(p_package->'parameters', '{}'::jsonb), p_package->>'rationale',
      coalesce(p_package->'current_state', '{}'::jsonb), coalesce(p_package->'policy_evidence', '[]'::jsonb),
      coalesce(p_package->'validation_plan', '[]'::jsonb), (p_package->>'risk_score')::integer,
      p_package->>'risk_level', coalesce((p_package->>'approval_required')::boolean, true)
    ) RETURNING * INTO v_pkg;
  ELSE
    SELECT * INTO v_pkg FROM public.iac_change_packages WHERE id = p_package_id FOR UPDATE;
    IF NOT FOUND OR v_pkg.created_by <> v_actor THEN RAISE EXCEPTION 'change_package_not_found_or_not_yours' USING ERRCODE = '42501'; END IF;
    IF v_pkg.status <> 'draft' THEN RAISE EXCEPTION 'only_a_draft_change_package_can_be_edited' USING ERRCODE = '22023'; END IF;
    UPDATE public.iac_change_packages SET
      target_resource_id = p_package->>'target_resource_id', target_name = p_package->>'target_name',
      subscription_id = p_package->>'subscription_id', resource_group = p_package->>'resource_group',
      region = lower(p_package->>'region'), action_type = p_package->>'action_type',
      action_label = p_package->>'action_label', parameters = coalesce(p_package->'parameters', '{}'::jsonb),
      rationale = p_package->>'rationale', current_state = coalesce(p_package->'current_state', '{}'::jsonb),
      policy_evidence = coalesce(p_package->'policy_evidence', '[]'::jsonb),
      validation_plan = coalesce(p_package->'validation_plan', '[]'::jsonb),
      risk_score = (p_package->>'risk_score')::integer, risk_level = p_package->>'risk_level',
      approval_required = coalesce((p_package->>'approval_required')::boolean, true)
    WHERE id = v_pkg.id RETURNING * INTO v_pkg;
  END IF;

  DELETE FROM public.iac_change_package_targets WHERE package_id = v_pkg.id;
  INSERT INTO public.iac_change_package_targets
    (package_id, target_resource_id, target_name, subscription_id, resource_group, region, current_state)
  SELECT v_pkg.id, t->>'target_resource_id', t->>'target_name',
         coalesce(t->>'subscription_id', v_subscription),
         coalesce(t->>'resource_group', split_part(v_group, '/', 5)),
         lower(coalesce(t->>'region', v_pkg.region)), coalesce(t->'current_state', '{}'::jsonb)
  FROM jsonb_array_elements(p_targets) t;

  IF p_submit THEN
    UPDATE public.iac_change_packages SET status = 'submitted' WHERE id = v_pkg.id RETURNING * INTO v_pkg;
  ELSE
    SELECT * INTO v_pkg FROM public.iac_change_packages WHERE id = v_pkg.id;
  END IF;
  RETURN v_pkg;
END;
$save$;
