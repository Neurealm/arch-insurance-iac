
-- ==============================================================
-- RunOps Runbook — persistent backend (schema, RLS, functions, seed)
-- ==============================================================

-- ---------------- Enums ----------------
CREATE TYPE public.runops_role AS ENUM (
  'sre_engineer','noc_operator','incident_commander','service_owner',
  'runbook_author','change_manager','digital_worker_administrator',
  'platform_engineer','auditor','executive','read_only_user','demo_controller'
);
CREATE TYPE public.runops_severity AS ENUM ('SEV 1','SEV 2','SEV 3','SEV 4');
CREATE TYPE public.runops_health AS ENUM ('Healthy','At Risk','Degraded','Severely Degraded','Unavailable','Recovering');
CREATE TYPE public.runops_tier AS ENUM ('Tier 1','Tier 2','Tier 3');
CREATE TYPE public.runops_env AS ENUM ('Production','Staging','Development');
CREATE TYPE public.runops_incident_state AS ENUM ('Detected','Triaged','Declared','Investigating','Mitigating','Monitoring','Resolved','Closed');
CREATE TYPE public.runops_execution_state AS ENUM ('Pending','Awaiting Approval','Queued','Running','Paused','Validating','Rolling Back','Completed','Failed','Cancelled');
CREATE TYPE public.runops_step_state AS ENUM ('Pending','Running','Skipped','Succeeded','Failed','Compensated');
CREATE TYPE public.runops_approval_state AS ENUM ('Pending','Approved','Denied','Expired','Revoked');
CREATE TYPE public.runops_runbook_state AS ENUM ('Draft','In Review','Approved','Certified','Published','Deprecated','Retired');
CREATE TYPE public.runops_autonomy AS ENUM ('Documentation Only','Human Guided','AI Recommended','Human Initiated Automation','Approval Gated Automation','Supervised Autonomous','Policy Bounded Autonomous');
CREATE TYPE public.runops_component_kind AS ENUM ('api','compute','database','cache','queue','network','identity','vendor','storage','function');
CREATE TYPE public.runops_risk AS ENUM ('Low','Medium','High','Critical');
CREATE TYPE public.runops_change_state AS ENUM ('Planned','Approved','Deploying','Deployed','Reverted','Failed');
CREATE TYPE public.runops_problem_state AS ENUM ('Open','Investigating','Known Error','Resolved','Closed');
CREATE TYPE public.runops_postmortem_state AS ENUM ('Drafting','Review','Published','Archived');
CREATE TYPE public.runops_policy_outcome AS ENUM ('Allow','Require Approval','Deny');
CREATE TYPE public.runops_worker_status AS ENUM ('Idle','Investigating','Recommending','Executing','Validating','Paused','Disabled');
CREATE TYPE public.runops_channel AS ENUM ('Status Page','Email','Chat','Executive Brief','Customer Notice');

-- ---------------- Core tenant/identity tables ----------------
CREATE TABLE public.runops_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, user_id)
);
CREATE INDEX runops_profiles_user_idx ON public.runops_profiles(user_id);

CREATE TABLE public.runops_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.runops_role NOT NULL,
  team_id uuid REFERENCES public.runops_teams(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, user_id, role)
);
CREATE INDEX runops_role_assignments_user_idx ON public.runops_role_assignments(user_id, tenant_id);

-- ---------------- Helper functions ----------------
CREATE OR REPLACE FUNCTION public.runops_has_tenant_access(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_platform_admin(auth.uid())
      OR EXISTS(SELECT 1 FROM public.runops_profiles WHERE user_id = auth.uid() AND tenant_id = _tenant_id);
$$;

CREATE OR REPLACE FUNCTION public.runops_has_role(_tenant_id uuid, _role public.runops_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.runops_role_assignments
    WHERE tenant_id = _tenant_id AND user_id = auth.uid() AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.runops_can_write(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.runops_has_tenant_access(_tenant_id)
    AND NOT EXISTS(
      SELECT 1 FROM public.runops_role_assignments
      WHERE tenant_id = _tenant_id AND user_id = auth.uid()
        AND role IN ('read_only_user','auditor')
    );
$$;

CREATE OR REPLACE FUNCTION public.runops_has_any_role(_tenant_id uuid, _roles public.runops_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.runops_role_assignments
    WHERE tenant_id = _tenant_id AND user_id = auth.uid() AND role = ANY(_roles)
  );
$$;

-- ---------------- Service model ----------------
CREATE TABLE public.runops_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  tier public.runops_tier NOT NULL,
  environment public.runops_env NOT NULL DEFAULT 'Production',
  region text NOT NULL,
  health public.runops_health NOT NULL DEFAULT 'Healthy',
  owner_team_id uuid REFERENCES public.runops_teams(id) ON DELETE SET NULL,
  slo_availability numeric,
  slo_latency_ms integer,
  error_budget_remaining numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_service_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.runops_services(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.runops_teams(id) ON DELETE CASCADE,
  primary_user_id uuid,
  secondary_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  service_id uuid REFERENCES public.runops_services(id) ON DELETE SET NULL,
  name text NOT NULL,
  kind public.runops_component_kind NOT NULL,
  health public.runops_health NOT NULL DEFAULT 'Healthy',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  from_service_id uuid NOT NULL REFERENCES public.runops_services(id) ON DELETE CASCADE,
  to_service_id uuid NOT NULL REFERENCES public.runops_services(id) ON DELETE CASCADE,
  criticality text NOT NULL DEFAULT 'Hard',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_customer_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  service_id uuid REFERENCES public.runops_services(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

-- ---------------- Reliability ----------------
CREATE TABLE public.runops_slis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  service_id uuid NOT NULL REFERENCES public.runops_services(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text NOT NULL,
  query_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_slos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  sli_id uuid NOT NULL REFERENCES public.runops_slis(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.runops_services(id) ON DELETE CASCADE,
  target numeric NOT NULL,
  "window" text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_error_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  slo_id uuid NOT NULL REFERENCES public.runops_slos(id) ON DELETE CASCADE,
  "window" text NOT NULL,
  remaining_percent numeric NOT NULL,
  burn_rate numeric,
  time_to_exhaustion_hours numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_telemetry_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.runops_services(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text NOT NULL,
  points jsonb NOT NULL DEFAULT '[]'::jsonb,
  captured_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  service_id uuid REFERENCES public.runops_services(id) ON DELETE SET NULL,
  slo_id uuid REFERENCES public.runops_slos(id) ON DELETE SET NULL,
  severity public.runops_severity NOT NULL,
  title text NOT NULL,
  fired_at timestamptz NOT NULL,
  state text NOT NULL DEFAULT 'Firing',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------- Runbooks ----------------
CREATE TABLE public.runops_runbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  title text NOT NULL,
  service_id uuid REFERENCES public.runops_services(id) ON DELETE SET NULL,
  current_version_id uuid,
  autonomy public.runops_autonomy NOT NULL DEFAULT 'Human Guided',
  fitness_score integer NOT NULL DEFAULT 0,
  state public.runops_runbook_state NOT NULL DEFAULT 'Draft',
  owner_team_id uuid REFERENCES public.runops_teams(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_runbook_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  runbook_id uuid NOT NULL REFERENCES public.runops_runbooks(id) ON DELETE CASCADE,
  version text NOT NULL,
  state public.runops_runbook_state NOT NULL DEFAULT 'Draft',
  changelog text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (runbook_id, version)
);

ALTER TABLE public.runops_runbooks
  ADD CONSTRAINT runops_runbooks_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES public.runops_runbook_versions(id) ON DELETE SET NULL;

CREATE TABLE public.runops_runbook_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  runbook_version_id uuid NOT NULL REFERENCES public.runops_runbook_versions(id) ON DELETE CASCADE,
  key text NOT NULL,
  position integer NOT NULL,
  label text NOT NULL,
  description text,
  kind text NOT NULL,
  autonomy public.runops_autonomy NOT NULL DEFAULT 'Human Guided',
  required_approval boolean NOT NULL DEFAULT false,
  tool_grants jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (runbook_version_id, key)
);

CREATE TABLE public.runops_runbook_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  runbook_id uuid NOT NULL REFERENCES public.runops_runbooks(id) ON DELETE CASCADE,
  kind text NOT NULL,
  expression text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_runbook_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  runbook_id uuid NOT NULL REFERENCES public.runops_runbooks(id) ON DELETE CASCADE,
  name text NOT NULL,
  scenario_ref text,
  expected_outcome text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_runbook_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  runbook_id uuid NOT NULL REFERENCES public.runops_runbooks(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES public.runops_runbook_versions(id) ON DELETE CASCADE,
  certified_by uuid,
  certified_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  fitness_score integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------- Governance & execution ----------------
CREATE TABLE public.runops_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  description text,
  scope text NOT NULL DEFAULT 'Tenant',
  rule_expression text,
  requires_approval boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_policy_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  policy_id uuid NOT NULL REFERENCES public.runops_policies(id) ON DELETE CASCADE,
  subject_ref text NOT NULL,
  decided_at timestamptz NOT NULL DEFAULT now(),
  outcome public.runops_policy_outcome NOT NULL,
  rationale text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_digital_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  autonomy public.runops_autonomy NOT NULL DEFAULT 'Human Guided',
  status public.runops_worker_status NOT NULL DEFAULT 'Idle',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  service_id uuid REFERENCES public.runops_services(id) ON DELETE SET NULL,
  title text NOT NULL,
  severity public.runops_severity NOT NULL,
  state public.runops_incident_state NOT NULL DEFAULT 'Detected',
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  commander_user_id uuid,
  commander_worker_id uuid REFERENCES public.runops_digital_workers(id) ON DELETE SET NULL,
  summary text,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  runbook_id uuid NOT NULL REFERENCES public.runops_runbooks(id) ON DELETE CASCADE,
  runbook_version_id uuid REFERENCES public.runops_runbook_versions(id) ON DELETE SET NULL,
  incident_id uuid REFERENCES public.runops_incidents(id) ON DELETE SET NULL,
  state public.runops_execution_state NOT NULL DEFAULT 'Pending',
  started_at timestamptz,
  ended_at timestamptz,
  approval_id uuid,
  initiated_by_user_id uuid,
  initiated_by_worker_id uuid REFERENCES public.runops_digital_workers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  runbook_id uuid REFERENCES public.runops_runbooks(id) ON DELETE SET NULL,
  execution_id uuid REFERENCES public.runops_executions(id) ON DELETE CASCADE,
  requested_by_user_id uuid,
  requested_by_worker_id uuid REFERENCES public.runops_digital_workers(id) ON DELETE SET NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  state public.runops_approval_state NOT NULL DEFAULT 'Pending',
  reason text,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

ALTER TABLE public.runops_executions
  ADD CONSTRAINT runops_executions_approval_fk
  FOREIGN KEY (approval_id) REFERENCES public.runops_approvals(id) ON DELETE SET NULL;

CREATE TABLE public.runops_step_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  execution_id uuid NOT NULL REFERENCES public.runops_executions(id) ON DELETE CASCADE,
  step_id uuid REFERENCES public.runops_runbook_steps(id) ON DELETE SET NULL,
  state public.runops_step_state NOT NULL DEFAULT 'Pending',
  started_at timestamptz,
  ended_at timestamptz,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text,
  step_execution_id uuid REFERENCES public.runops_step_executions(id) ON DELETE SET NULL,
  incident_id uuid REFERENCES public.runops_incidents(id) ON DELETE SET NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  label text NOT NULL,
  reference text,
  hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------- Incident detail ----------------
CREATE TABLE public.runops_incident_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  incident_id uuid NOT NULL REFERENCES public.runops_incidents(id) ON DELETE CASCADE,
  at timestamptz NOT NULL DEFAULT now(),
  actor_ref text NOT NULL,
  kind text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_hypotheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  incident_id uuid NOT NULL REFERENCES public.runops_incidents(id) ON DELETE CASCADE,
  statement text NOT NULL,
  supporting jsonb NOT NULL DEFAULT '[]'::jsonb,
  contradictory jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence integer NOT NULL DEFAULT 0,
  state text NOT NULL DEFAULT 'Open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_remediation_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  incident_id uuid NOT NULL REFERENCES public.runops_incidents(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  runbook_id uuid REFERENCES public.runops_runbooks(id) ON DELETE SET NULL,
  risk public.runops_risk NOT NULL DEFAULT 'Medium',
  confidence integer NOT NULL DEFAULT 0,
  selected boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  incident_id uuid NOT NULL REFERENCES public.runops_incidents(id) ON DELETE CASCADE,
  channel public.runops_channel NOT NULL,
  audience text NOT NULL,
  sent_at timestamptz,
  state text NOT NULL DEFAULT 'Draft',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------- Change / Problem ----------------
CREATE TABLE public.runops_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  title text NOT NULL,
  service_id uuid REFERENCES public.runops_services(id) ON DELETE SET NULL,
  deployed_at timestamptz NOT NULL,
  state public.runops_change_state NOT NULL DEFAULT 'Planned',
  risk public.runops_risk NOT NULL DEFAULT 'Medium',
  requested_by uuid,
  approved_by uuid,
  linked_incident_id uuid REFERENCES public.runops_incidents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  title text NOT NULL,
  service_id uuid REFERENCES public.runops_services(id) ON DELETE SET NULL,
  state public.runops_problem_state NOT NULL DEFAULT 'Open',
  opened_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_known_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  problem_id uuid REFERENCES public.runops_problems(id) ON DELETE CASCADE,
  title text NOT NULL,
  workaround text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_postmortems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  incident_id uuid REFERENCES public.runops_incidents(id) ON DELETE SET NULL,
  state public.runops_postmortem_state NOT NULL DEFAULT 'Drafting',
  author_user_id uuid,
  published_at timestamptz,
  summary text,
  contributing_factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  what_worked jsonb NOT NULL DEFAULT '[]'::jsonb,
  what_did_not jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  postmortem_id uuid REFERENCES public.runops_postmortems(id) ON DELETE CASCADE,
  title text NOT NULL,
  owner_team_id uuid REFERENCES public.runops_teams(id) ON DELETE SET NULL,
  due_at timestamptz,
  state text NOT NULL DEFAULT 'Open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

-- ---------------- Digital worker detail ----------------
CREATE TABLE public.runops_worker_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.runops_digital_workers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  autonomy public.runops_autonomy NOT NULL DEFAULT 'Human Guided',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_worker_tool_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.runops_digital_workers(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  scope text NOT NULL DEFAULT 'Read',
  requires_approval boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_worker_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.runops_digital_workers(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  context_incident_id uuid REFERENCES public.runops_incidents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_worker_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.runops_digital_workers(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.runops_worker_sessions(id) ON DELETE CASCADE,
  at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_worker_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.runops_digital_workers(id) ON DELETE CASCADE,
  "window" text NOT NULL,
  outcome text NOT NULL,
  score integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------- Platform ----------------
CREATE TABLE public.runops_connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  kind text NOT NULL,
  state text NOT NULL DEFAULT 'Not Configured',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_knowledge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  title text NOT NULL,
  service_id uuid REFERENCES public.runops_services(id) ON DELETE SET NULL,
  kind text NOT NULL,
  summary text,
  ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_operations_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  title text NOT NULL,
  assigned_team_id uuid REFERENCES public.runops_teams(id) ON DELETE SET NULL,
  state text NOT NULL DEFAULT 'Todo',
  due_at timestamptz,
  related_incident_id uuid REFERENCES public.runops_incidents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  target_user_id uuid,
  at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  title text NOT NULL,
  detail text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.runops_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  actor_ref text NOT NULL,
  action text NOT NULL,
  target_ref text NOT NULL,
  detail text,
  at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------- Scenario ----------------
CREATE TABLE public.runops_scenario_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  description text,
  stage_index integer NOT NULL DEFAULT 0,
  stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE public.runops_scenario_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.runops_tenants(id) ON DELETE CASCADE,
  scenario_instance_id uuid NOT NULL REFERENCES public.runops_scenario_instances(id) ON DELETE CASCADE,
  at timestamptz NOT NULL DEFAULT now(),
  index integer NOT NULL,
  label text NOT NULL,
  actor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  source_system text NOT NULL DEFAULT 'demo',
  data_freshness timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ==============================================================
-- Grants, RLS, triggers (loop)
-- ==============================================================
DO $do$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'runops_%' LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $do$;

DO $do$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public'
             AND tablename LIKE 'runops_%'
             AND tablename NOT IN ('runops_tenants','runops_profiles','runops_role_assignments') LOOP
    EXECUTE format($p$CREATE POLICY "%1$s_read" ON public.%1$I FOR SELECT TO authenticated USING (public.runops_has_tenant_access(tenant_id))$p$, t);
    EXECUTE format($p$CREATE POLICY "%1$s_write" ON public.%1$I FOR ALL TO authenticated USING (public.runops_can_write(tenant_id)) WITH CHECK (public.runops_can_write(tenant_id))$p$, t);
  END LOOP;
END $do$;

CREATE POLICY runops_tenants_read ON public.runops_tenants FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.runops_profiles WHERE user_id = auth.uid() AND tenant_id = runops_tenants.id));
CREATE POLICY runops_tenants_admin_write ON public.runops_tenants FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY runops_profiles_read ON public.runops_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()) OR public.runops_has_tenant_access(tenant_id));
CREATE POLICY runops_profiles_admin_write ON public.runops_profiles FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY runops_role_assignments_read ON public.runops_role_assignments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()) OR public.runops_has_tenant_access(tenant_id));
CREATE POLICY runops_role_assignments_admin_write ON public.runops_role_assignments FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- ==============================================================
-- Privileged server-side mutation functions
-- ==============================================================
CREATE OR REPLACE FUNCTION public.runops_approve_execution(_approval_id uuid, _actor text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_approval public.runops_approvals; v_execution public.runops_executions;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_approval FROM public.runops_approvals WHERE id = _approval_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'approval_not_found'; END IF;
  IF NOT public.runops_can_write(v_approval.tenant_id) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT public.runops_has_any_role(v_approval.tenant_id,
       ARRAY['change_manager','incident_commander','service_owner','platform_engineer','sre_engineer']::public.runops_role[]) THEN
    RAISE EXCEPTION 'insufficient_role';
  END IF;
  IF v_approval.requested_by_user_id IS NOT NULL AND v_approval.requested_by_user_id = auth.uid() THEN
    RAISE EXCEPTION 'self_approval_not_allowed';
  END IF;
  IF v_approval.state <> 'Pending' THEN RAISE EXCEPTION 'invalid_state'; END IF;
  UPDATE public.runops_approvals SET state = 'Approved', decided_by = auth.uid(), decided_at = now()
    WHERE id = _approval_id RETURNING * INTO v_approval;
  UPDATE public.runops_executions SET state = 'Running', started_at = COALESCE(started_at, now())
    WHERE id = v_approval.execution_id RETURNING * INTO v_execution;
  INSERT INTO public.runops_audit_events(tenant_id, actor_ref, action, target_ref)
    VALUES (v_approval.tenant_id, _actor, 'approval.approved', v_approval.external_id);
  INSERT INTO public.runops_domain_events(tenant_id, kind, payload)
    VALUES (v_approval.tenant_id, 'ApprovalApproved',
      jsonb_build_object('approval_id', v_approval.id, 'execution_id', v_execution.id));
  RETURN jsonb_build_object('approval', to_jsonb(v_approval), 'execution', to_jsonb(v_execution));
END $$;

CREATE OR REPLACE FUNCTION public.runops_deny_execution(_approval_id uuid, _actor text, _reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_approval public.runops_approvals; v_execution public.runops_executions;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_approval FROM public.runops_approvals WHERE id = _approval_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'approval_not_found'; END IF;
  IF NOT public.runops_can_write(v_approval.tenant_id) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT public.runops_has_any_role(v_approval.tenant_id,
       ARRAY['change_manager','incident_commander','service_owner','platform_engineer','sre_engineer']::public.runops_role[]) THEN
    RAISE EXCEPTION 'insufficient_role';
  END IF;
  IF v_approval.requested_by_user_id IS NOT NULL AND v_approval.requested_by_user_id = auth.uid() THEN
    RAISE EXCEPTION 'self_denial_not_allowed';
  END IF;
  IF v_approval.state <> 'Pending' THEN RAISE EXCEPTION 'invalid_state'; END IF;
  UPDATE public.runops_approvals SET state = 'Denied', decided_by = auth.uid(), decided_at = now(), reason = COALESCE(_reason, reason)
    WHERE id = _approval_id RETURNING * INTO v_approval;
  UPDATE public.runops_executions SET state = 'Cancelled' WHERE id = v_approval.execution_id RETURNING * INTO v_execution;
  INSERT INTO public.runops_audit_events(tenant_id, actor_ref, action, target_ref, detail)
    VALUES (v_approval.tenant_id, _actor, 'approval.denied', v_approval.external_id, _reason);
  INSERT INTO public.runops_domain_events(tenant_id, kind, payload)
    VALUES (v_approval.tenant_id, 'ApprovalDenied', jsonb_build_object('approval_id', v_approval.id, 'reason', _reason));
  RETURN jsonb_build_object('approval', to_jsonb(v_approval), 'execution', to_jsonb(v_execution));
END $$;

CREATE OR REPLACE FUNCTION public.runops_certify_runbook_version(_version_id uuid, _actor text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ver public.runops_runbook_versions; v_cert public.runops_runbook_certifications;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_ver FROM public.runops_runbook_versions WHERE id = _version_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'version_not_found'; END IF;
  IF NOT public.runops_can_write(v_ver.tenant_id) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT public.runops_has_any_role(v_ver.tenant_id,
       ARRAY['platform_engineer','service_owner']::public.runops_role[]) THEN
    RAISE EXCEPTION 'insufficient_role';
  END IF;
  IF v_ver.created_by IS NOT NULL AND v_ver.created_by = auth.uid() THEN
    RAISE EXCEPTION 'self_certification_not_allowed';
  END IF;
  UPDATE public.runops_runbook_versions SET state = 'Certified' WHERE id = _version_id RETURNING * INTO v_ver;
  INSERT INTO public.runops_runbook_certifications(tenant_id, runbook_id, version_id, certified_by, certified_at, expires_at, fitness_score)
    VALUES (v_ver.tenant_id, v_ver.runbook_id, v_ver.id, auth.uid(), now(), now() + interval '180 days', 90)
    RETURNING * INTO v_cert;
  INSERT INTO public.runops_audit_events(tenant_id, actor_ref, action, target_ref)
    VALUES (v_ver.tenant_id, _actor, 'runbook.certified', v_ver.version);
  RETURN jsonb_build_object('version', to_jsonb(v_ver), 'certification', to_jsonb(v_cert));
END $$;

CREATE OR REPLACE FUNCTION public.runops_approve_change(_change_id uuid, _actor text)
RETURNS public.runops_changes LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.runops_changes;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v FROM public.runops_changes WHERE id = _change_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'change_not_found'; END IF;
  IF NOT public.runops_can_write(v.tenant_id) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT public.runops_has_role(v.tenant_id, 'change_manager') THEN RAISE EXCEPTION 'insufficient_role'; END IF;
  IF v.requested_by IS NOT NULL AND v.requested_by = auth.uid() THEN RAISE EXCEPTION 'self_approval_not_allowed'; END IF;
  UPDATE public.runops_changes SET state = 'Approved', approved_by = auth.uid() WHERE id = _change_id RETURNING * INTO v;
  INSERT INTO public.runops_audit_events(tenant_id, actor_ref, action, target_ref) VALUES (v.tenant_id, _actor, 'change.approved', v.external_id);
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.runops_resolve_incident(_incident_id uuid, _actor text)
RETURNS public.runops_incidents LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.runops_incidents;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v FROM public.runops_incidents WHERE id = _incident_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'incident_not_found'; END IF;
  IF NOT public.runops_can_write(v.tenant_id) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT public.runops_has_any_role(v.tenant_id,
       ARRAY['incident_commander','sre_engineer','platform_engineer','service_owner']::public.runops_role[]) THEN
    RAISE EXCEPTION 'insufficient_role';
  END IF;
  UPDATE public.runops_incidents SET state = 'Resolved', closed_at = now() WHERE id = _incident_id RETURNING * INTO v;
  INSERT INTO public.runops_audit_events(tenant_id, actor_ref, action, target_ref) VALUES (v.tenant_id, _actor, 'incident.resolved', v.external_id);
  INSERT INTO public.runops_domain_events(tenant_id, kind, payload) VALUES (v.tenant_id, 'IncidentResolved', jsonb_build_object('incident_id', v.id));
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.runops_advance_scenario(_scenario_id uuid, _actor text)
RETURNS public.runops_scenario_instances LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.runops_scenario_instances;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v FROM public.runops_scenario_instances WHERE id = _scenario_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'scenario_not_found'; END IF;
  IF NOT public.runops_has_role(v.tenant_id, 'demo_controller') THEN RAISE EXCEPTION 'demo_controller_required'; END IF;
  UPDATE public.runops_scenario_instances SET stage_index = LEAST(stage_index + 1, jsonb_array_length(stages) - 1)
    WHERE id = _scenario_id RETURNING * INTO v;
  INSERT INTO public.runops_scenario_events(tenant_id, scenario_instance_id, at, index, label, actor)
    VALUES (v.tenant_id, v.id, now(), v.stage_index, COALESCE(v.stages->v.stage_index->>'label',''), _actor);
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.runops_reset_scenario(_scenario_id uuid, _actor text)
RETURNS public.runops_scenario_instances LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.runops_scenario_instances;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v FROM public.runops_scenario_instances WHERE id = _scenario_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'scenario_not_found'; END IF;
  IF NOT public.runops_has_role(v.tenant_id, 'demo_controller') THEN RAISE EXCEPTION 'demo_controller_required'; END IF;
  UPDATE public.runops_scenario_instances SET stage_index = 5 WHERE id = _scenario_id RETURNING * INTO v;
  INSERT INTO public.runops_scenario_events(tenant_id, scenario_instance_id, at, index, label, actor)
    VALUES (v.tenant_id, v.id, now(), 5, 'Scenario reset to stage 5', _actor);
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.runops_bootstrap_current_user()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tenant uuid; v_uid uuid := auth.uid(); r public.runops_role;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT id INTO v_tenant FROM public.runops_tenants WHERE external_id = 'tenant-contoso';
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'tenant_missing'; END IF;
  INSERT INTO public.runops_profiles(tenant_id, user_id, display_name)
    VALUES (v_tenant, v_uid, (SELECT display_name FROM public.profiles WHERE user_id = v_uid))
    ON CONFLICT (tenant_id, user_id) DO NOTHING;
  FOR r IN SELECT unnest(enum_range(NULL::public.runops_role)) LOOP
    INSERT INTO public.runops_role_assignments(tenant_id, user_id, role)
      VALUES (v_tenant, v_uid, r) ON CONFLICT DO NOTHING;
  END LOOP;
  RETURN jsonb_build_object('tenant_id', v_tenant, 'user_id', v_uid);
END $$;

GRANT EXECUTE ON FUNCTION public.runops_bootstrap_current_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.runops_approve_execution(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.runops_deny_execution(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.runops_certify_runbook_version(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.runops_approve_change(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.runops_resolve_incident(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.runops_advance_scenario(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.runops_reset_scenario(uuid, text) TO authenticated;

-- ==============================================================
-- Deterministic Contoso Global seed
-- ==============================================================
DO $seed$
DECLARE
  T uuid := '11111111-0000-0000-0000-000000000001'::uuid;
  T_SRE uuid := '11111111-1111-0000-0000-000000000001'::uuid;
  T_ORDER uuid := '11111111-1111-0000-0000-000000000002'::uuid;
  T_PAY uuid := '11111111-1111-0000-0000-000000000003'::uuid;
  T_IDN uuid := '11111111-1111-0000-0000-000000000004'::uuid;
  T_DATA uuid := '11111111-1111-0000-0000-000000000005'::uuid;
  S_GOP uuid := '11111111-2222-0000-0000-000000000001'::uuid;
  S_PAY uuid := '11111111-2222-0000-0000-000000000002'::uuid;
  S_IDN uuid := '11111111-2222-0000-0000-000000000003'::uuid;
  S_FUL uuid := '11111111-2222-0000-0000-000000000004'::uuid;
  S_INV uuid := '11111111-2222-0000-0000-000000000005'::uuid;
  S_NOT uuid := '11111111-2222-0000-0000-000000000006'::uuid;
  S_ANL uuid := '11111111-2222-0000-0000-000000000007'::uuid;
  S_MKT uuid := '11111111-2222-0000-0000-000000000008'::uuid;
  RB uuid := '11111111-3333-0000-0000-000000000001'::uuid;
  RB_V uuid := '11111111-3333-1111-0000-000000000001'::uuid;
  EXE uuid := '11111111-4444-0000-0000-000000000001'::uuid;
  APR uuid := '11111111-5555-0000-0000-000000000001'::uuid;
  INC uuid := '11111111-6666-0000-0000-000000000001'::uuid;
  CHG uuid := '11111111-7777-0000-0000-000000000001'::uuid;
  PRB uuid := '11111111-8888-0000-0000-000000000001'::uuid;
  PM  uuid := '11111111-9999-0000-0000-000000000001'::uuid;
  SCEN uuid := '11111111-aaaa-0000-0000-000000000001'::uuid;
  SLI_LAT uuid := '11111111-bbbb-0000-0000-000000000001'::uuid;
  SLO_LAT uuid := '11111111-cccc-0000-0000-000000000001'::uuid;
  BASE timestamptz := '2026-07-10 10:00:00+00'::timestamptz;
BEGIN
  INSERT INTO public.runops_tenants(id, external_id, name, slug)
    VALUES (T, 'tenant-contoso', 'Contoso Global', 'contoso') ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_teams(id, tenant_id, external_id, name) VALUES
    (T_SRE, T, 'team-platform-sre', 'Platform SRE'),
    (T_ORDER, T, 'team-order-platform', 'Order Platform SRE'),
    (T_PAY, T, 'team-payments', 'Payments Engineering'),
    (T_IDN, T, 'team-identity', 'Identity Engineering'),
    (T_DATA, T, 'team-data-platform', 'Data Platform')
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_services(id, tenant_id, external_id, name, tier, environment, region, health, owner_team_id, slo_availability, slo_latency_ms, error_budget_remaining) VALUES
    (S_GOP, T, 'svc-global-order-processing', 'Global Order Processing', 'Tier 1', 'Production', 'US Central', 'Degraded', T_ORDER, 99.95, 750, 42),
    (S_PAY, T, 'svc-payments', 'Payments Platform', 'Tier 1', 'Production', 'US Central', 'Healthy', T_PAY, 99.99, 400, 78),
    (S_IDN, T, 'svc-identity', 'Identity Services', 'Tier 1', 'Production', 'US Central', 'At Risk', T_IDN, 99.95, 250, 61),
    (S_FUL, T, 'svc-order-fulfillment', 'Order Fulfillment', 'Tier 2', 'Production', 'US East', 'Healthy', T_ORDER, 99.9, 800, 82),
    (S_INV, T, 'svc-inventory-platform', 'Inventory Platform', 'Tier 2', 'Production', 'US Central', 'Healthy', T_ORDER, 99.9, 600, 74),
    (S_NOT, T, 'svc-customer-notifications', 'Customer Notifications', 'Tier 3', 'Production', 'US East', 'Healthy', T_ORDER, 99.5, 1500, 91),
    (S_ANL, T, 'svc-analytics-warehouse', 'Analytics Warehouse', 'Tier 3', 'Production', 'US Central', 'Healthy', T_DATA, 99.0, 5000, 88),
    (S_MKT, T, 'svc-marketing-automation', 'Marketing Automation', 'Tier 3', 'Production', 'EU West', 'Healthy', T_DATA, 99.0, 3000, 85)
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_components(tenant_id, external_id, service_id, name, kind, health) VALUES
    (T, 'cmp-api-gateway',       S_GOP, 'API Gateway',          'network',  'Healthy'),
    (T, 'cmp-checkout-api',      S_GOP, 'Checkout API',         'api',      'Degraded'),
    (T, 'cmp-orders-api',        S_GOP, 'Orders API',           'api',      'At Risk'),
    (T, 'cmp-aks-checkout',      S_GOP, 'AKS Checkout Cluster', 'compute',  'At Risk'),
    (T, 'cmp-sql-primary',       S_GOP, 'SQL Primary',          'database', 'Severely Degraded'),
    (T, 'cmp-redis-cache',       S_GOP, 'Redis Cache',          'cache',    'Healthy'),
    (T, 'cmp-kafka-orders',      S_GOP, 'Kafka Orders',         'queue',    'At Risk'),
    (T, 'cmp-identity-provider', S_IDN, 'Identity Provider',    'identity', 'Healthy'),
    (T, 'cmp-network-ingress',   S_GOP, 'Network Ingress',      'network',  'Healthy'),
    (T, 'cmp-payment-provider',  S_PAY, 'Payment Provider',     'vendor',   'Healthy')
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_dependencies(tenant_id, from_service_id, to_service_id, criticality, description) VALUES
    (T, S_GOP, S_PAY, 'Hard', 'Checkout requires payments'),
    (T, S_GOP, S_IDN, 'Hard', 'Checkout requires identity'),
    (T, S_GOP, S_INV, 'Soft', 'Inventory availability check'),
    (T, S_FUL, S_INV, 'Hard', 'Fulfillment reserves inventory'),
    (T, S_NOT, S_GOP, 'Soft', 'Order confirmation notifications');

  INSERT INTO public.runops_customer_journeys(tenant_id, external_id, service_id, name, description, steps) VALUES
    (T, 'cj-checkout', S_GOP, 'Checkout Journey', 'End-to-end order placement',
      '["Browse","Add to cart","Sign in","Payment","Confirm","Receipt"]'::jsonb) ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_slis(id, tenant_id, external_id, service_id, name, unit, query_ref) VALUES
    (SLI_LAT, T, 'sli-gop-latency-p95', S_GOP, 'Checkout p95 latency', 'ms', 'metrics://gop.checkout.latency.p95') ON CONFLICT DO NOTHING;
  INSERT INTO public.runops_slos(id, tenant_id, external_id, sli_id, service_id, target, "window", description) VALUES
    (SLO_LAT, T, 'slo-gop-latency', SLI_LAT, S_GOP, 750, '30d', 'Checkout p95 latency ≤ 750ms over 30d') ON CONFLICT DO NOTHING;
  INSERT INTO public.runops_error_budgets(tenant_id, slo_id, "window", remaining_percent, burn_rate, time_to_exhaustion_hours) VALUES
    (T, SLO_LAT, '30d', 42, 6.2, 14.0);

  INSERT INTO public.runops_telemetry_snapshots(tenant_id, service_id, name, unit, points, captured_at) VALUES
    (T, S_GOP, 'Checkout p95 latency baseline', 'ms',
      '[{"at":"09:50","value":410},{"at":"09:55","value":420},{"at":"10:00","value":425},{"at":"10:05","value":430},{"at":"10:07","value":540},{"at":"10:10","value":1200},{"at":"10:15","value":2400},{"at":"10:20","value":2800}]'::jsonb,
      BASE + interval '20 minutes'),
    (T, S_GOP, 'SQL primary connection utilization', 'percent',
      '[{"at":"09:50","value":38},{"at":"10:00","value":45},{"at":"10:05","value":62},{"at":"10:10","value":88},{"at":"10:12","value":98}]'::jsonb,
      BASE + interval '12 minutes');

  INSERT INTO public.runops_alerts(tenant_id, external_id, service_id, slo_id, severity, title, fired_at) VALUES
    (T, 'ALT-1001', S_GOP, SLO_LAT, 'SEV 1', 'Checkout p95 latency SLO burn', BASE + interval '9 minutes');

  INSERT INTO public.runops_runbooks(id, tenant_id, external_id, title, service_id, autonomy, fitness_score, state, owner_team_id, tags) VALUES
    (RB, T, 'RB-0042', 'Checkout Latency and Database Connection Saturation', S_GOP,
     'Approval Gated Automation', 87, 'Certified', T_ORDER, ARRAY['checkout','sql','latency']) ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_runbook_versions(id, tenant_id, runbook_id, version, state, changelog) VALUES
    (RB_V, T, RB, 'v3.2', 'Certified', 'Added fallback pool-cap step; validation window tightened to 6 minutes') ON CONFLICT DO NOTHING;

  UPDATE public.runops_runbooks SET current_version_id = RB_V WHERE id = RB;

  INSERT INTO public.runops_runbook_steps(tenant_id, runbook_version_id, key, position, label, description, kind, autonomy, required_approval) VALUES
    (T, RB_V, 's1', 1, 'Confirm degradation signature',    'Correlate latency, error rate, and DB wait time against baseline.',        'diagnose', 'AI Recommended',           false),
    (T, RB_V, 's2', 2, 'Identify offending index',         'Compare query plans against pre-change baseline for top checkout queries.','diagnose', 'AI Recommended',           false),
    (T, RB_V, 's3', 3, 'Revert affected index',            'Drop and recreate the previous index definition in a controlled window.', 'mitigate', 'Approval Gated Automation', true),
    (T, RB_V, 's4', 4, 'Recycle checkout app connections', 'Drain and recycle a controlled subset of pods to refresh the connection pool.','mitigate', 'Approval Gated Automation', true),
    (T, RB_V, 's5', 5, 'Validate journey and SLIs',        'Run synthetic checkout journey; verify latency, error rate, connections, queue depth.', 'validate', 'Supervised Autonomous', false),
    (T, RB_V, 's6', 6, 'Fallback: raise connection pool cap','If validation fails, temporarily raise SQL pool cap and re-validate.',   'rollback', 'Approval Gated Automation', true)
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_runbook_triggers(tenant_id, runbook_id, kind, expression) VALUES
    (T, RB, 'Alert',    'sli.gop.checkout.latency.p95 > 1500 for 3m'),
    (T, RB, 'Incident', 'incident.severity in (SEV 1, SEV 2) AND service = svc-global-order-processing');

  INSERT INTO public.runops_runbook_tests(tenant_id, runbook_id, name, scenario_ref, expected_outcome) VALUES
    (T, RB, 'Query plan regression drill', 'scenario-plan-regression', 'Mitigated');

  INSERT INTO public.runops_runbook_certifications(tenant_id, runbook_id, version_id, certified_at, expires_at, fitness_score) VALUES
    (T, RB, RB_V, BASE - interval '30 days', BASE + interval '150 days', 87);

  INSERT INTO public.runops_incidents(id, tenant_id, external_id, service_id, title, severity, state, opened_at, summary, findings) VALUES
    (INC, T, 'INC-10482', S_GOP,
     'Global Order Processing checkout latency degradation', 'SEV 1', 'Investigating', BASE + interval '14 minutes',
     'Checkout API p95 latency rose from 420ms to 2.8s. Tx success declined from 99.7% to 91.4%. SQL primary connection utilization at 98%.',
     '["Index deployment CHG-20391 completed at 09:58","Latency increase began 10:07","SQL connection pool at 98% by 10:12","App CPU nominal","Trace: DB wait dominant"]'::jsonb)
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_changes(id, tenant_id, external_id, title, service_id, deployed_at, state, risk, linked_incident_id) VALUES
    (CHG, T, 'CHG-20391', 'Order database index optimization deployment', S_GOP, BASE - interval '2 minutes', 'Deployed', 'Medium', INC)
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_executions(id, tenant_id, external_id, runbook_id, runbook_version_id, incident_id, state) VALUES
    (EXE, T, 'EXE-8841', RB, RB_V, INC, 'Awaiting Approval') ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_approvals(id, tenant_id, external_id, runbook_id, execution_id, requested_at, state, reason) VALUES
    (APR, T, 'APR-4471', RB, EXE, BASE + interval '23 minutes', 'Pending',
     'Approval-gated automation: revert index CHG-20391 and recycle checkout pods.') ON CONFLICT DO NOTHING;
  UPDATE public.runops_executions SET approval_id = APR WHERE id = EXE;

  INSERT INTO public.runops_incident_events(tenant_id, incident_id, at, actor_ref, kind, message) VALUES
    (T, INC, BASE + interval '14 minutes', 'system',   'state',      'SEV 1 declared'),
    (T, INC, BASE + interval '19 minutes', 'DW-DB-03', 'hypothesis', 'Database wait time dominant'),
    (T, INC, BASE + interval '23 minutes', 'DW-IC-01', 'action',     'Approval requested for RB-0042 execution EXE-8841');

  INSERT INTO public.runops_hypotheses(tenant_id, incident_id, statement, supporting, contradictory, confidence, state) VALUES
    (T, INC,
     'Checkout latency spike caused by query-plan regression after CHG-20391 index deployment.',
     '["Onset aligns with CHG-20391 completion","DB wait dominant","SQL primary util 98%","Query plan changed post-deploy"]'::jsonb,
     '["Redis and ingress healthy — canary would isolate app-tier"]'::jsonb, 88, 'Confirmed'),
    (T, INC,
     'Application-tier saturation from traffic spike.',
     '["Checkout throughput slightly elevated"]'::jsonb,
     '["App CPU nominal","Pod count within HPA"]'::jsonb, 22, 'Rejected');

  INSERT INTO public.runops_remediation_options(tenant_id, incident_id, title, description, runbook_id, risk, confidence, selected) VALUES
    (T, INC, 'Revert CHG-20391 index and recycle checkout pods',
      'Restores prior query plan; recycles a controlled subset of pods to refresh the connection pool.', RB, 'Low', 88, true),
    (T, INC, 'Temporarily raise SQL connection pool cap',
      'Bridge mitigation; does not resolve underlying plan regression.', NULL, 'Medium', 62, false);

  INSERT INTO public.runops_evidence_items(tenant_id, incident_id, captured_at, kind, label, reference, hash) VALUES
    (T, INC, BASE + interval '12 minutes', 'metric', 'SQL primary utilization at 98%',  'metrics://sql.primary.util', 'sha256:evidence-001'),
    (T, INC, BASE + interval '15 minutes', 'trace',  'Checkout span DB wait dominant',  'traces://checkout.p95',      'sha256:evidence-002'),
    (T, INC, BASE + interval '16 minutes', 'query',  'Plan diff for top checkout query','sql://plan.diff.checkout',   'sha256:evidence-003');

  INSERT INTO public.runops_problems(id, tenant_id, external_id, title, service_id, state, opened_at) VALUES
    (PRB, T, 'PRB-1082', 'Query plan regression risk from index changes', S_GOP, 'Investigating', BASE + interval '30 minutes')
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_known_errors(tenant_id, external_id, problem_id, title, workaround) VALUES
    (T, 'KE-2004', PRB, 'Post-deploy plan cache warmup can saturate connection pool',
     'Pre-stage connection pool cap increase and validate plan diff before rollout.')
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_postmortems(id, tenant_id, external_id, incident_id, state, summary, contributing_factors, what_worked, what_did_not) VALUES
    (PM, T, 'PM-10482', INC, 'Drafting',
     'An index optimization changed the query plan of a high-volume checkout query, saturating the SQL connection pool.',
     '["No plan-regression detection in change validation","Insufficient pool headroom for warmup"]'::jsonb,
     '["SLO burn alerting fired within 4 minutes","Approval gate preserved human control"]'::jsonb,
     '["Canary window too short to observe plan-cache effect"]'::jsonb)
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_corrective_actions(tenant_id, external_id, postmortem_id, title, owner_team_id, due_at, state) VALUES
    (T, 'CA-1', PM, 'Add query plan diff to change validation gate',       T_DATA,  BASE + interval '30 days', 'Open'),
    (T, 'CA-2', PM, 'Pre-stage connection pool fallback on high-risk changes', T_ORDER, BASE + interval '14 days', 'Open')
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_digital_workers(tenant_id, external_id, name, role, autonomy, status) VALUES
    (T, 'DW-IC-01',       'DW-IC-01',       'Incident Commander',       'Human Guided',             'Investigating'),
    (T, 'DW-APP-02',      'DW-APP-02',      'Application SRE',          'AI Recommended',           'Investigating'),
    (T, 'DW-DB-03',       'DW-DB-03',       'Database SRE',             'AI Recommended',           'Recommending'),
    (T, 'DW-NET-04',      'DW-NET-04',      'Network SRE',              'AI Recommended',           'Idle'),
    (T, 'DW-CHANGE-05',   'DW-CHANGE-05',   'Change Risk Analyst',      'AI Recommended',           'Recommending'),
    (T, 'DW-COMMS-06',    'DW-COMMS-06',    'Communications Coordinator','Human Initiated Automation','Idle'),
    (T, 'DW-KNOW-07',     'DW-KNOW-07',     'Knowledge Engineer',       'Documentation Only',       'Idle'),
    (T, 'DW-RCA-08',      'DW-RCA-08',      'RCA Analyst',              'AI Recommended',           'Investigating'),
    (T, 'DW-SEC-09',      'DW-SEC-09',      'Security Operations',      'Approval Gated Automation','Idle'),
    (T, 'DW-VALIDATE-10', 'DW-VALIDATE-10', 'Execution Validator',      'Supervised Autonomous',    'Idle')
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_worker_capabilities(tenant_id, worker_id, name, description, autonomy)
    SELECT T, id, 'Baseline analysis', 'Reads telemetry and correlates with recent changes.', 'AI Recommended'
    FROM public.runops_digital_workers WHERE tenant_id = T;

  INSERT INTO public.runops_worker_tool_grants(tenant_id, worker_id, tool_name, scope, requires_approval)
    SELECT T, id, 'metrics.read', 'Read', false FROM public.runops_digital_workers WHERE tenant_id = T;

  INSERT INTO public.runops_worker_sessions(tenant_id, worker_id, started_at, context_incident_id)
    SELECT T, id, BASE + interval '15 minutes', INC FROM public.runops_digital_workers WHERE external_id IN ('DW-IC-01','DW-DB-03','DW-APP-02') AND tenant_id = T;

  INSERT INTO public.runops_operations_tasks(tenant_id, external_id, title, assigned_team_id, state, due_at, related_incident_id) VALUES
    (T, 'OPS-1', 'Prepare customer-facing status update', T_ORDER, 'In Progress', BASE + interval '30 minutes', INC),
    (T, 'OPS-2', 'Pre-stage SQL pool cap increase',        T_ORDER, 'Todo',        BASE + interval '20 minutes', INC),
    (T, 'OPS-3', 'Publish post-incident review draft',     T_ORDER, 'Todo',        BASE + interval '5 days',      INC)
    ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_notifications(tenant_id, at, kind, title, detail) VALUES
    (T, BASE + interval '14 minutes', 'critical', 'SEV 1 declared',       'INC-10482 · Global Order Processing'),
    (T, BASE + interval '19 minutes', 'warning',  'SLO burn accelerated', 'Availability window · US Central'),
    (T, BASE + interval '23 minutes', 'info',     'Approval requested',   'APR-4471 · RB-0042');

  INSERT INTO public.runops_audit_events(tenant_id, actor_ref, action, target_ref, detail, at) VALUES
    (T, 'system',   'incident.declared',  'INC-10482', 'SEV 1 declared',              BASE + interval '14 minutes'),
    (T, 'DW-DB-03', 'hypothesis.raised',  'INC-10482', 'Database wait time dominant', BASE + interval '19 minutes'),
    (T, 'DW-IC-01', 'approval.requested', 'APR-4471',  'Revert CHG-20391',            BASE + interval '23 minutes');

  INSERT INTO public.runops_scenario_instances(id, tenant_id, external_id, name, description, stage_index, stages) VALUES
    (SCEN, T, 'scenario-contoso-primary', 'Contoso Global — Checkout Degradation',
     'Canonical demonstration scenario of a query-plan regression, remediation, and postmortem.',
     5,
     '[
       {"index":0,"label":"Healthy baseline"},
       {"index":1,"label":"Degradation begins"},
       {"index":2,"label":"SLO burn alert activates"},
       {"index":3,"label":"Alerts correlate into one operational situation"},
       {"index":4,"label":"SEV 1 incident is declared"},
       {"index":5,"label":"Digital workers investigate"},
       {"index":6,"label":"Database hypothesis becomes dominant"},
       {"index":7,"label":"Remediation options are compared"},
       {"index":8,"label":"Runbook execution is requested"},
       {"index":9,"label":"Human approval is requested"},
       {"index":10,"label":"Execution begins"},
       {"index":11,"label":"Initial validation partially fails"},
       {"index":12,"label":"Corrective branch executes"},
       {"index":13,"label":"Service telemetry recovers"},
       {"index":14,"label":"Customer journey validation succeeds"},
       {"index":15,"label":"Incident resolves"},
       {"index":16,"label":"Postmortem opens"},
       {"index":17,"label":"Runbook improvement is proposed"},
       {"index":18,"label":"New runbook version is certified"}
     ]'::jsonb) ON CONFLICT DO NOTHING;

  INSERT INTO public.runops_connectors(tenant_id, external_id, name, kind, state) VALUES
    (T, 'conn-observability', 'Observability Platform', 'Observability', 'Not Configured'),
    (T, 'conn-ticketing',     'Ticketing System',       'Ticketing',     'Not Configured'),
    (T, 'conn-chat',          'Chat',                    'Chat',          'Not Configured'),
    (T, 'conn-cloud',         'Cloud Provider',          'Cloud',         'Not Configured'),
    (T, 'conn-cmdb',          'Service CMDB',            'CMDB',          'Not Configured');

  INSERT INTO public.runops_knowledge_items(tenant_id, external_id, title, service_id, kind, summary, ref) VALUES
    (T, 'K-RB-0042', 'RB-0042 Checkout Latency Runbook', S_GOP, 'runbook',
     'Approval-gated automation for query-plan regressions.', 'runbooks/RB-0042'),
    (T, 'K-PM-10482', 'PM-10482 Postmortem draft', S_GOP, 'postmortem',
     'Post-incident review for INC-10482.', 'postmortems/PM-10482'),
    (T, 'K-KE-2004', 'KE-2004 Known error', S_GOP, 'known_error',
     'Plan-cache warmup can saturate the connection pool.', 'known-errors/KE-2004');

END $seed$;
