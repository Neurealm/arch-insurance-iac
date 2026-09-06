-- Minimal pre-existing platform contract needed to test the Terraform
-- governance migration in isolation. The full historical migration chain has
-- independent legacy failures and is exercised by the baseline SQL job.
CREATE TABLE public.iac_change_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'submitted',
  -- Single-target columns the N-target migration backfills from. Defaulted
  -- here (the real schema has them NOT NULL without defaults) purely so this
  -- isolated fixture stays a one-line insert for tests that don't care.
  target_resource_id text NOT NULL DEFAULT '',
  target_name text NOT NULL DEFAULT '',
  subscription_id text NOT NULL DEFAULT '',
  resource_group text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  current_state jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Minimal stand-in for the intake table an engineering gap links back to.
-- The status CHECK is reproduced under its real constraint name because the
-- engineering-gap migration drops and re-adds it to widen the allowed set.
CREATE TABLE public.servicenow_intake_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'received',
  CONSTRAINT servicenow_intake_requests_status_check CHECK (status = ANY (ARRAY[
    'received', 'analyzing', 'needs_clarification', 'ready_for_engineering',
    'comment_posted', 'comment_failed', 'demo_comment_generated', 'failed'
  ]))
);

CREATE TABLE public.iac_change_package_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.iac_change_packages(id) ON DELETE CASCADE,
  decision text NOT NULL,
  comment text,
  reviewed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

-- Production grants anon nothing on any of these tables; a bare CREATE TABLE
-- here inherits the schema's default anon grants instead, which made the
-- governance suite's anon sweep fail against the fixture rather than against
-- a real problem. Match production's posture explicitly.
REVOKE ALL ON public.iac_change_packages FROM anon;
REVOKE ALL ON public.iac_change_package_reviews FROM anon;
REVOKE ALL ON public.servicenow_intake_requests FROM anon;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT false;
$$;
