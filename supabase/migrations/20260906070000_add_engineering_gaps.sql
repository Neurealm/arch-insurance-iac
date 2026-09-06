-- Phase 3 of the multi-agent VM-provisioning capability plan: implement
-- the "engineering gap" the governance doc already promises
-- (docs/terraform-vm-governance.md: "If no approved capability exists,
-- create an engineering gap. AI may draft a module, but the request pauses
-- until tests and human approval finish.") -- today that path is
-- documented-only; servicenow-intake just hard-rejects create_vm.
--
-- This migration only adds the tracking tables. servicenow-intake's
-- create_vm handling and the new capability-resolver edge function ship in
-- the same deploy, and neither performs any Terraform/GitHub write yet
-- (that's Phase 4) -- this phase is read-only/tracking-only by design.

CREATE TABLE public.iac_engineering_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'searching_existing', 'drafting', 'pr_opened', 'ci_running',
    'ci_passed', 'ci_failed', 'ready_for_review', 'capability_approved', 'abandoned'
  )),
  provider text NOT NULL DEFAULT 'azure',
  resource_type text NOT NULL,
  action_type text NOT NULL,
  requested_by uuid,
  source_intake_request_id uuid REFERENCES public.servicenow_intake_requests(id),
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  discovered_module_source text,
  linked_capability_id uuid REFERENCES public.iac_automation_capabilities(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- At most one non-terminal gap per (provider, resource_type, action_type):
-- a second "create 10 VMs" ticket should link to the existing gap, not open
-- a duplicate drafting effort.
CREATE UNIQUE INDEX iac_engineering_gaps_one_open_per_action
  ON public.iac_engineering_gaps (provider, resource_type, action_type)
  WHERE status NOT IN ('capability_approved', 'abandoned');

CREATE TABLE public.iac_engineering_gap_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id uuid NOT NULL REFERENCES public.iac_engineering_gaps(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.iac_engineering_gap_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER iac_engineering_gap_touch_updated_at
BEFORE UPDATE ON public.iac_engineering_gaps
FOR EACH ROW EXECUTE FUNCTION public.iac_engineering_gap_touch_updated_at();

ALTER TABLE public.iac_engineering_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_engineering_gap_events ENABLE ROW LEVEL SECURITY;

-- Both tables are fully service-managed (servicenow-intake, capability-resolver,
-- terraform-drafting-agent, terraform-ci-status-sync all run as the service
-- role, which bypasses RLS) -- no authenticated client may insert/update/
-- delete either table, mirroring iac_terraform_runs/iac_terraform_run_events.
CREATE POLICY iac_engineering_gaps_visible_to_requester_or_admin
ON public.iac_engineering_gaps FOR SELECT
USING ((SELECT auth.uid()) = requested_by OR (SELECT is_platform_admin(auth.uid())));

CREATE POLICY iac_engineering_gap_events_visible_to_requester_or_admin
ON public.iac_engineering_gap_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.iac_engineering_gaps g
    WHERE g.id = gap_id AND ((SELECT auth.uid()) = g.requested_by OR (SELECT is_platform_admin(auth.uid())))
  )
);

-- New tables inherit the schema's default ALL-privileges grants to
-- anon/authenticated; every other fully service-managed table here
-- (iac_terraform_runs, iac_terraform_run_events, ...) only grants
-- authenticated SELECT and grants anon nothing -- RLS alone is not
-- sufficient defense-in-depth without also removing these raw grants.
REVOKE ALL ON public.iac_engineering_gaps FROM anon, authenticated;
REVOKE ALL ON public.iac_engineering_gap_events FROM anon, authenticated;
GRANT SELECT ON public.iac_engineering_gaps TO authenticated;
GRANT SELECT ON public.iac_engineering_gap_events TO authenticated;

-- servicenow-intake now reports a distinct terminal status for a create_vm
-- ticket that opened/linked an engineering gap, instead of folding it into
-- needs_clarification (a gap is not something the requester can "clarify"
-- their way out of).
ALTER TABLE public.servicenow_intake_requests DROP CONSTRAINT servicenow_intake_requests_status_check;
ALTER TABLE public.servicenow_intake_requests ADD CONSTRAINT servicenow_intake_requests_status_check
  CHECK (status = ANY (ARRAY[
    'received', 'analyzing', 'needs_clarification', 'ready_for_engineering',
    'engineering_gap_opened', 'comment_posted', 'comment_failed', 'demo_comment_generated', 'failed'
  ]));
