-- Phase 1: close the change-package write path.
--
-- Three defects, all live before this migration:
--
-- 1. Nothing ever wrote iac_change_package_targets. The only INSERT was the
--    one-time backfill in 20260906060000. Both producers -- the console
--    (saveVmChangePackage) and servicenow-intake (maybeCreateDraft) -- write
--    the parent row only, so every package created after that migration has
--    zero targets and terraform-orchestrator's packageTargets() raises
--    "The change package has no declared target resources." That breaks every
--    capability, not only provisioning.
--
-- 2. action_type permits neither stop_vm nor create_vm. stop_vm is offered in
--    the console and is an approved capability, so saving one has always failed
--    with a check violation.
--
-- 3. iac_change_package_guard() applies its content-immutability rule to drafts
--    as well as reviewed packages, contradicting both its own name and the
--    iac_change_packages_update_own_draft policy. The console's own
--    save-then-submit flow rewrites current_state from freshly observed Azure
--    data, so submitting a draft raised
--    submitted_change_package_contents_are_immutable whenever anything moved.
--
-- Rather than patch each caller, package writes now go through one SECURITY
-- DEFINER RPC and the raw INSERT grant is withdrawn -- the shape already used
-- by review_iac_terraform_plan and claim_iac_terraform_apply.

-- 1. Action vocabulary -------------------------------------------------------

ALTER TABLE public.iac_change_packages DROP CONSTRAINT iac_change_packages_action_type_check;
ALTER TABLE public.iac_change_packages ADD CONSTRAINT iac_change_packages_action_type_check
  CHECK (action_type = ANY (ARRAY[
    'start_vm', 'stop_vm', 'restart_vm', 'resize_vm', 'create_vm',
    'increase_os_disk', 'configure_backup', 'enable_monitoring', 'assess_patches'
  ]));

-- target_count is trigger-maintained and passes through 0 while a draft's
-- target set is replaced, so the floor is enforced at submission by the guard
-- below rather than as a column constraint.
ALTER TABLE public.iac_change_packages ADD CONSTRAINT iac_change_packages_target_count_check
  CHECK (target_count BETWEEN 0 AND 50);

-- 2. Guard: drafts are editable; nothing leaves draft without targets --------

CREATE OR REPLACE FUNCTION public.iac_change_package_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$
DECLARE declared_targets integer;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.created_by <> OLD.created_by THEN RAISE EXCEPTION 'change_package_creator_cannot_change'; END IF;
    -- A draft belongs to its author and stays editable. Immutability begins the
    -- moment the package is submitted for review, which is the point at which
    -- somebody else starts relying on its contents.
    IF OLD.status <> 'draft' AND ROW(NEW.package_number, NEW.target_resource_id, NEW.target_name, NEW.subscription_id, NEW.resource_group, NEW.region, NEW.action_type, NEW.action_label, NEW.parameters, NEW.rationale, NEW.current_state, NEW.policy_evidence, NEW.validation_plan, NEW.risk_score, NEW.risk_level, NEW.approval_required, NEW.submitted_at)
      IS DISTINCT FROM ROW(OLD.package_number, OLD.target_resource_id, OLD.target_name, OLD.subscription_id, OLD.resource_group, OLD.region, OLD.action_type, OLD.action_label, OLD.parameters, OLD.rationale, OLD.current_state, OLD.policy_evidence, OLD.validation_plan, OLD.risk_score, OLD.risk_level, OLD.approval_required, OLD.submitted_at)
      THEN RAISE EXCEPTION 'submitted_change_package_contents_are_immutable'; END IF;
    IF OLD.status = 'draft' AND NEW.status NOT IN ('draft','submitted') THEN RAISE EXCEPTION 'draft_package_must_be_submitted_before_review'; END IF;
    IF OLD.status = 'submitted' AND NEW.status NOT IN ('approved','changes_requested','rejected') THEN RAISE EXCEPTION 'submitted_package_requires_review_decision'; END IF;
    IF OLD.status = 'approved' AND NEW.status <> 'executing' THEN RAISE EXCEPTION 'approved_package_requires_bound_execution'; END IF;
    IF OLD.status = 'executing' AND NEW.status NOT IN ('executed','execution_failed') THEN RAISE EXCEPTION 'executing_package_requires_terminal_result'; END IF;
    IF OLD.status IN ('changes_requested','rejected','executed','execution_failed') THEN RAISE EXCEPTION 'terminal_change_package_is_immutable'; END IF;
    -- The structural invariant. Whatever code path submits a package, it cannot
    -- reach review with nothing declared, so the missing write path above
    -- cannot be reintroduced by a future caller.
    IF OLD.status = 'draft' AND NEW.status <> 'draft' THEN
      SELECT count(*) INTO declared_targets FROM public.iac_change_package_targets WHERE package_id = NEW.id;
      IF declared_targets < 1 THEN RAISE EXCEPTION 'change_package_requires_declared_targets'; END IF;
    END IF;
  END IF;
  IF NEW.status = 'submitted' AND NEW.submitted_at IS NULL THEN NEW.submitted_at := now();
  ELSIF NEW.status = 'draft' THEN NEW.submitted_at := NULL; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- 3. The only supported way to write a change package ------------------------

CREATE FUNCTION public.save_iac_change_package(
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
    IF current_user <> 'service_role' THEN RAISE EXCEPTION 'package_author_cannot_be_delegated' USING ERRCODE = '42501'; END IF;
    v_actor := p_created_by;
  END IF;
  IF v_actor IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501'; END IF;

  IF jsonb_typeof(p_package) IS DISTINCT FROM 'object' OR jsonb_typeof(p_targets) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'invalid_change_package_payload' USING ERRCODE = '22023';
  END IF;
  v_count := jsonb_array_length(p_targets);
  IF v_count < 1 OR v_count > 50 THEN RAISE EXCEPTION 'a_change_package_declares_between_1_and_50_targets' USING ERRCODE = '22023'; END IF;

  -- Every target must be an exact VM ARM ID, distinct, and inside one
  -- subscription and one resource group. resolveExecutionScope re-checks the
  -- resource group server-side; this keeps the failure early and legible.
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

  -- One in-flight package per Azure VM. Serialise on the resource group so two
  -- concurrent batches cannot both pass this check.
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

  -- Replace the declared set wholesale. The targets guard permits this only
  -- while the parent is a draft, which is why submission is the last step.
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

-- 4. Withdraw the raw write path --------------------------------------------

DROP POLICY IF EXISTS "iac_change_packages_insert_own" ON public.iac_change_packages;
REVOKE INSERT ON public.iac_change_packages FROM authenticated;

REVOKE ALL ON FUNCTION public.save_iac_change_package(jsonb, jsonb, boolean, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_iac_change_package(jsonb, jsonb, boolean, uuid, uuid) TO authenticated, service_role;

COMMENT ON FUNCTION public.save_iac_change_package(jsonb, jsonb, boolean, uuid, uuid) IS
  'The only supported way to create or edit a change package. Writes the parent and its declared targets in one transaction; direct INSERT is revoked so no caller can produce a package with no targets.';
