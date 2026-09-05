-- Governed Terraform capability catalogue and immutable execution evidence.
CREATE TABLE public.iac_automation_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'azure' CHECK (provider = 'azure'),
  resource_type text NOT NULL CHECK (length(trim(resource_type)) > 0),
  action_type text NOT NULL CHECK (length(trim(action_type)) > 0),
  display_name text NOT NULL CHECK (length(trim(display_name)) > 0),
  module_source text NOT NULL CHECK (module_source ~ '^terraform/modules/[a-z0-9_-]+$'),
  module_version text NOT NULL CHECK (module_version ~ '^v[0-9]+\.[0-9]+\.[0-9]+$'),
  execution_mode text NOT NULL CHECK (execution_mode IN ('azapi_action', 'azapi_update', 'azurerm_resource')),
  lifecycle_status text NOT NULL DEFAULT 'draft' CHECK (lifecycle_status IN ('draft', 'testing', 'approved', 'retired')),
  input_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  allowed_environments text[] NOT NULL DEFAULT ARRAY['development']::text[],
  requires_managed_resource boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, resource_type, action_type, module_version)
);

CREATE UNIQUE INDEX iac_automation_capability_one_approved_action
  ON public.iac_automation_capabilities (provider, resource_type, action_type)
  WHERE lifecycle_status = 'approved';

CREATE TABLE public.iac_package_automation_bindings (
  package_id uuid PRIMARY KEY REFERENCES public.iac_change_packages(id) ON DELETE RESTRICT,
  capability_id uuid NOT NULL REFERENCES public.iac_automation_capabilities(id) ON DELETE RESTRICT,
  module_source text NOT NULL,
  module_version text NOT NULL,
  resolved_inputs jsonb NOT NULL,
  resolved_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  resolved_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.iac_terraform_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.iac_change_packages(id) ON DELETE RESTRICT,
  capability_id uuid NOT NULL REFERENCES public.iac_automation_capabilities(id) ON DELETE RESTRICT,
  run_type text NOT NULL CHECK (run_type IN ('plan', 'apply')),
  status text NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'blocked', 'cancelled')),
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_run_id uuid REFERENCES public.iac_terraform_runs(id) ON DELETE RESTRICT,
  module_source text NOT NULL,
  module_version text NOT NULL,
  resolved_inputs jsonb NOT NULL,
  runner_correlation_id text NOT NULL,
  artifact_uri text,
  plan_sha256 text CHECK (plan_sha256 IS NULL OR plan_sha256 ~ '^[0-9a-f]{64}$'),
  plan_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  reconciliation jsonb NOT NULL DEFAULT '{}'::jsonb,
  has_destroy boolean NOT NULL DEFAULT false,
  has_replace boolean NOT NULL DEFAULT false,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT terraform_apply_requires_plan CHECK (
    (run_type = 'plan' AND plan_run_id IS NULL) OR (run_type = 'apply' AND plan_run_id IS NOT NULL)
  ),
  CONSTRAINT successful_plan_requires_artifact CHECK (
    run_type <> 'plan' OR status <> 'succeeded' OR (artifact_uri IS NOT NULL AND plan_sha256 IS NOT NULL)
  )
);

CREATE UNIQUE INDEX iac_terraform_one_apply_per_plan ON public.iac_terraform_runs (plan_run_id) WHERE run_type = 'apply';
CREATE INDEX iac_terraform_runs_package_created_idx ON public.iac_terraform_runs (package_id, created_at DESC);

CREATE TABLE public.iac_terraform_run_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.iac_terraform_runs(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (length(trim(event_type)) > 0),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX iac_terraform_run_events_run_created_idx ON public.iac_terraform_run_events (run_id, created_at);

REVOKE ALL ON TABLE public.iac_automation_capabilities, public.iac_package_automation_bindings,
  public.iac_terraform_runs, public.iac_terraform_run_events FROM anon, authenticated;
GRANT SELECT ON TABLE public.iac_automation_capabilities, public.iac_package_automation_bindings,
  public.iac_terraform_runs, public.iac_terraform_run_events TO authenticated;
GRANT ALL ON TABLE public.iac_automation_capabilities, public.iac_package_automation_bindings,
  public.iac_terraform_runs, public.iac_terraform_run_events TO service_role;

ALTER TABLE public.iac_automation_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_package_automation_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_terraform_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_terraform_run_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approved_capabilities_are_visible" ON public.iac_automation_capabilities
  FOR SELECT TO authenticated USING (lifecycle_status = 'approved' OR public.is_platform_admin((SELECT auth.uid())));
CREATE POLICY "package_bindings_visible_to_participants" ON public.iac_package_automation_bindings
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.iac_change_packages package WHERE package.id = package_id AND (package.created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid())))));
CREATE POLICY "terraform_runs_visible_to_participants" ON public.iac_terraform_runs
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.iac_change_packages package WHERE package.id = package_id AND (package.created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid())))));
CREATE POLICY "terraform_events_visible_to_participants" ON public.iac_terraform_run_events
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.iac_terraform_runs run JOIN public.iac_change_packages package ON package.id = run.package_id WHERE run.id = run_id AND (package.created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid())))));

INSERT INTO public.iac_automation_capabilities
  (resource_type, action_type, display_name, module_source, module_version, execution_mode, lifecycle_status, input_schema, allowed_environments, requires_managed_resource)
VALUES
  ('Microsoft.Compute/virtualMachines', 'start_vm', 'Start Azure VM', 'terraform/modules/vm-action', 'v1.0.0', 'azapi_action', 'approved', '{"required":["target_resource_id","change_request_id"],"action":"start"}', ARRAY['development','pre-production','production'], false),
  ('Microsoft.Compute/virtualMachines', 'stop_vm', 'Stop Azure VM', 'terraform/modules/vm-action', 'v1.0.0', 'azapi_action', 'approved', '{"required":["target_resource_id","change_request_id"],"action":"powerOff"}', ARRAY['development','pre-production','production'], false),
  ('Microsoft.Compute/virtualMachines', 'restart_vm', 'Restart Azure VM', 'terraform/modules/vm-action', 'v1.0.0', 'azapi_action', 'approved', '{"required":["target_resource_id","change_request_id"],"action":"restart"}', ARRAY['development','pre-production','production'], false),
  ('Microsoft.Compute/virtualMachines', 'resize_vm', 'Resize Azure VM', 'terraform/modules/vm-resize', 'v1.0.0', 'azapi_update', 'approved', '{"required":["target_resource_id","requested_vm_size","change_request_id"]}', ARRAY['development','pre-production'], true);

-- HCP Terraform saved-plan governance.
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