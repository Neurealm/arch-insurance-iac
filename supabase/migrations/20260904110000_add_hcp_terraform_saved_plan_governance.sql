-- HCP Terraform is the execution and state authority for governed VM changes.
-- This migration is additive so existing historical custom-runner evidence remains readable.

ALTER TABLE public.iac_terraform_runs
  ADD COLUMN execution_engine text NOT NULL DEFAULT 'legacy_runner'
    CHECK (execution_engine IN ('legacy_runner', 'hcp_terraform')),
  ADD COLUMN hcp_organization text,
  ADD COLUMN hcp_workspace_id text,
  ADD COLUMN hcp_workspace_name text,
  ADD COLUMN hcp_configuration_version_id text,
  ADD COLUMN hcp_run_id text,
  ADD COLUMN hcp_plan_id text,
  ADD COLUMN hcp_run_status text,
  ADD COLUMN source_revision text,
  ADD COLUMN hcp_plan_json jsonb,
  ADD COLUMN hcp_synced_at timestamptz;

ALTER TABLE public.iac_terraform_runs
  ADD CONSTRAINT hcp_plan_run_identity_required CHECK (
    execution_engine <> 'hcp_terraform' OR run_type <> 'plan' OR
    (hcp_organization IS NOT NULL AND hcp_workspace_id IS NOT NULL AND hcp_workspace_name IS NOT NULL AND
     hcp_configuration_version_id IS NOT NULL AND hcp_run_id IS NOT NULL AND source_revision IS NOT NULL)
  ),
  ADD CONSTRAINT hcp_apply_run_identity_required CHECK (
    execution_engine <> 'hcp_terraform' OR run_type <> 'apply' OR
    (plan_run_id IS NOT NULL AND hcp_organization IS NOT NULL AND hcp_workspace_id IS NOT NULL AND hcp_run_id IS NOT NULL)
  );

CREATE UNIQUE INDEX iac_terraform_hcp_run_id_unique
  ON public.iac_terraform_runs (hcp_run_id)
  WHERE hcp_run_id IS NOT NULL;

CREATE INDEX iac_terraform_hcp_status_idx
  ON public.iac_terraform_runs (execution_engine, hcp_run_status, created_at DESC)
  WHERE execution_engine = 'hcp_terraform';

-- A package is only approvable when the successful plan was generated and retained by HCP Terraform.
CREATE OR REPLACE FUNCTION public.review_iac_change_package(p_package_id uuid, p_decision text, p_comment text DEFAULT NULL)
RETURNS public.iac_change_package_reviews
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_package public.iac_change_packages%ROWTYPE;
  v_review public.iac_change_package_reviews%ROWTYPE;
  v_plan public.iac_terraform_runs%ROWTYPE;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  IF NOT public.is_platform_admin(v_actor) THEN RAISE EXCEPTION 'reviewer_not_authorized'; END IF;
  IF p_decision NOT IN ('approved', 'changes_requested', 'rejected') THEN RAISE EXCEPTION 'invalid_review_decision'; END IF;
  IF length(trim(coalesce(p_comment, ''))) < 10 THEN RAISE EXCEPTION 'review_comment_must_contain_at_least_10_characters'; END IF;
  SELECT * INTO v_package FROM public.iac_change_packages WHERE id = p_package_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'change_package_not_found'; END IF;
  IF v_package.status <> 'submitted' THEN RAISE EXCEPTION 'only_submitted_packages_can_be_reviewed'; END IF;
  IF v_package.created_by = v_actor THEN RAISE EXCEPTION 'self_approval_is_not_permitted'; END IF;
  IF p_decision = 'approved' THEN
    SELECT * INTO v_plan FROM public.iac_terraform_runs
      WHERE package_id = p_package_id AND run_type = 'plan'
      ORDER BY created_at DESC LIMIT 1;
    IF NOT FOUND OR v_plan.status <> 'succeeded' OR v_plan.execution_engine <> 'hcp_terraform' THEN
      RAISE EXCEPTION 'latest_hcp_terraform_plan_must_be_successful';
    END IF;
    IF v_plan.hcp_run_id IS NULL OR v_plan.hcp_plan_id IS NULL OR v_plan.plan_sha256 IS NULL THEN
      RAISE EXCEPTION 'hcp_saved_plan_identity_is_missing';
    END IF;
    IF v_plan.has_destroy OR v_plan.has_replace OR coalesce((v_plan.reconciliation->>'matched')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'terraform_plan_failed_governance_checks';
    END IF;
  END IF;
  INSERT INTO public.iac_change_package_reviews (package_id, decision, comment, reviewed_by)
  VALUES (p_package_id, p_decision, nullif(trim(p_comment), ''), v_actor) RETURNING * INTO v_review;
  UPDATE public.iac_change_packages SET status = p_decision WHERE id = p_package_id;
  RETURN v_review;
END;
$$;
REVOKE ALL ON FUNCTION public.review_iac_change_package(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_iac_change_package(uuid, text, text) TO authenticated;
