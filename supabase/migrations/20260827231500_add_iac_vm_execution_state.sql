-- Package-bound Azure execution for the pilot. Only an approved start_vm
-- package may move through execution; execution metadata is immutable evidence.
ALTER TABLE public.iac_change_packages
  DROP CONSTRAINT iac_change_packages_status_check,
  DROP CONSTRAINT iac_change_packages_submission_timestamp;

ALTER TABLE public.iac_change_packages
  ADD COLUMN execution_started_at timestamptz,
  ADD COLUMN execution_completed_at timestamptz,
  ADD COLUMN execution_message text,
  ADD COLUMN executed_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE public.iac_change_packages
  ADD CONSTRAINT iac_change_packages_status_check
    CHECK (status IN ('draft', 'submitted', 'approved', 'changes_requested', 'rejected', 'executing', 'executed', 'execution_failed')),
  ADD CONSTRAINT iac_change_packages_submission_timestamp
    CHECK ((status = 'draft' AND submitted_at IS NULL) OR (status <> 'draft' AND submitted_at IS NOT NULL)),
  ADD CONSTRAINT iac_change_packages_execution_metadata
    CHECK (
      (status IN ('executing', 'executed', 'execution_failed') AND execution_started_at IS NOT NULL AND executed_by IS NOT NULL)
      OR (status NOT IN ('executing', 'executed', 'execution_failed') AND execution_started_at IS NULL AND execution_completed_at IS NULL AND execution_message IS NULL AND executed_by IS NULL)
    );

CREATE OR REPLACE FUNCTION public.iac_change_package_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.created_by <> OLD.created_by THEN RAISE EXCEPTION 'change_package_creator_cannot_change'; END IF;
    IF ROW(NEW.package_number, NEW.target_resource_id, NEW.target_name, NEW.subscription_id, NEW.resource_group, NEW.region, NEW.action_type, NEW.action_label, NEW.parameters, NEW.rationale, NEW.current_state, NEW.policy_evidence, NEW.validation_plan, NEW.risk_score, NEW.risk_level, NEW.approval_required, NEW.submitted_at) IS DISTINCT FROM ROW(OLD.package_number, OLD.target_resource_id, OLD.target_name, OLD.subscription_id, OLD.resource_group, OLD.region, OLD.action_type, OLD.action_label, OLD.parameters, OLD.rationale, OLD.current_state, OLD.policy_evidence, OLD.validation_plan, OLD.risk_score, OLD.risk_level, OLD.approval_required, OLD.submitted_at) THEN RAISE EXCEPTION 'submitted_change_package_contents_are_immutable'; END IF;
    IF OLD.status = 'draft' AND NEW.status NOT IN ('draft','submitted') THEN RAISE EXCEPTION 'draft_package_must_be_submitted_before_review'; END IF;
    IF OLD.status = 'submitted' AND NEW.status NOT IN ('approved','changes_requested','rejected') THEN RAISE EXCEPTION 'submitted_package_requires_review_decision'; END IF;
    IF OLD.status = 'approved' AND NEW.status <> 'executing' THEN RAISE EXCEPTION 'approved_package_requires_bound_execution'; END IF;
    IF OLD.status = 'executing' AND NEW.status NOT IN ('executed','execution_failed') THEN RAISE EXCEPTION 'executing_package_requires_terminal_result'; END IF;
    IF OLD.status IN ('changes_requested','rejected','executed','execution_failed') THEN RAISE EXCEPTION 'terminal_change_package_is_immutable'; END IF;
  END IF;
  IF NEW.status = 'submitted' AND NEW.submitted_at IS NULL THEN NEW.submitted_at := now(); ELSIF NEW.status = 'draft' THEN NEW.submitted_at := NULL; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.begin_iac_vm_execution(p_package_id uuid)
RETURNS public.iac_change_packages
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_actor uuid := auth.uid(); v_package public.iac_change_packages%ROWTYPE;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  SELECT * INTO v_package FROM public.iac_change_packages WHERE id=p_package_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'change_package_not_found'; END IF;
  IF v_package.status <> 'approved' THEN RAISE EXCEPTION 'only_approved_packages_can_execute'; END IF;
  IF v_package.action_type <> 'start_vm' THEN RAISE EXCEPTION 'pilot_execution_supports_only_start_vm'; END IF;
  IF v_package.created_by <> v_actor AND NOT public.is_platform_admin(v_actor) THEN RAISE EXCEPTION 'execution_not_authorized'; END IF;
  UPDATE public.iac_change_packages SET status='executing', execution_started_at=now(), executed_by=v_actor WHERE id=p_package_id RETURNING * INTO v_package;
  RETURN v_package;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_iac_vm_execution(p_package_id uuid, p_success boolean, p_message text)
RETURNS public.iac_change_packages
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_actor uuid := auth.uid(); v_package public.iac_change_packages%ROWTYPE;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  SELECT * INTO v_package FROM public.iac_change_packages WHERE id=p_package_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'change_package_not_found'; END IF;
  IF v_package.status <> 'executing' OR v_package.executed_by <> v_actor THEN RAISE EXCEPTION 'execution_completion_not_authorized'; END IF;
  UPDATE public.iac_change_packages SET status=CASE WHEN p_success THEN 'executed' ELSE 'execution_failed' END, execution_completed_at=now(), execution_message=left(coalesce(p_message,''),1000) WHERE id=p_package_id RETURNING * INTO v_package;
  RETURN v_package;
END;
$$;

REVOKE ALL ON FUNCTION public.begin_iac_vm_execution(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.complete_iac_vm_execution(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.begin_iac_vm_execution(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_iac_vm_execution(uuid, boolean, text) TO authenticated;
