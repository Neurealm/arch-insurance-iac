-- ServiceNow Terraform Change Agent -- Phase 1 foundation.
--
-- Legacy servicenow_intake_requests is a webhook-revision ledger. It is not a
-- durable ticket conversation: a newer partial webhook could hide values from
-- a previous revision and the browser used to re-submit transport envelopes.
-- These service-managed tables establish the permanent ticket correlation,
-- immutable evidence, question registry, deterministic workflow state, and
-- idempotency boundary. Existing tables remain intact as a compatibility read
-- model while the Edge Function moves to this foundation.

CREATE TABLE public.servicenow_intake_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL CHECK (length(btrim(ticket_number)) > 0),
  ticket_key text GENERATED ALWAYS AS (lower(btrim(ticket_number))) STORED,
  -- A ServiceNow sys_id is a second immutable ticket identity. Its normalized
  -- key prevents a record from being split into two conversations if a later
  -- webhook carries a conflicting ticket number.
  service_now_sys_id text CHECK (service_now_sys_id IS NULL OR length(btrim(service_now_sys_id)) > 0),
  service_now_sys_id_key text GENERATED ALWAYS AS (nullif(lower(btrim(service_now_sys_id)), '')) STORED,
  requested_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type text,
  workflow_state text NOT NULL DEFAULT 'INGESTED' CHECK (workflow_state IN (
    'INGESTED','ANALYZING','WAITING_FOR_INFORMATION','REQUEST_COMPLETE',
    'GAP_CREATED','PACKAGE_GENERATED','PACKAGE_VALIDATED','DRAFT_PR_CREATED',
    'HANDOFF_COMPLETE','BLOCKED','FAILED'
  )),
  workflow_version bigint NOT NULL DEFAULT 0 CHECK (workflow_version >= 0),
  reusable_capability_gap_id uuid REFERENCES public.iac_engineering_gaps(id) ON DELETE RESTRICT,
  change_package_id uuid REFERENCES public.iac_change_packages(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_key),
  UNIQUE (service_now_sys_id_key)
);

CREATE TABLE public.servicenow_intake_ticket_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  sequence_id bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  upstream_event_key text NOT NULL CHECK (length(btrim(upstream_event_key)) > 0),
  source_updated_at timestamptz,
  -- Payload must be redacted before it reaches this column. Ticket prose and
  -- attachments are untrusted data, never executable agent instructions.
  redacted_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  canonical_structured_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[0-9a-f]{64}$'),
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, upstream_event_key)
);

ALTER TABLE public.servicenow_intake_tickets
  ADD COLUMN current_snapshot_id uuid REFERENCES public.servicenow_intake_ticket_snapshots(id) ON DELETE RESTRICT;

CREATE TABLE public.servicenow_intake_ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  snapshot_id uuid REFERENCES public.servicenow_intake_ticket_snapshots(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (length(btrim(event_type)) > 0),
  source_type text NOT NULL CHECK (source_type IN (
    'servicenow_webhook','ticket_snapshot','requester_comment','work_note',
    'catalog_variable','attachment','agent','tool_call','external_write','system'
  )),
  source_record_id text,
  source_author text,
  source_occurred_at timestamptz,
  redacted_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  supporting_text text,
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[0-9a-f]{64}$'),
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, idempotency_key)
);

CREATE TABLE public.servicenow_intake_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  event_id uuid NOT NULL REFERENCES public.servicenow_intake_ticket_events(id) ON DELETE RESTRICT,
  source_attachment_id text NOT NULL,
  filename text NOT NULL,
  content_type text,
  byte_size bigint CHECK (byte_size IS NULL OR byte_size >= 0),
  extraction_status text NOT NULL DEFAULT 'not_requested' CHECK (extraction_status IN ('not_requested','supported','unsupported','failed')),
  redacted_text text,
  content_sha256 text,
  redaction_version text NOT NULL DEFAULT 'v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, source_attachment_id),
  CHECK (content_sha256 IS NULL OR content_sha256 ~ '^[0-9a-f]{64}$'),
  CHECK (length(btrim(redaction_version)) > 0)
);

CREATE TABLE public.servicenow_intake_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  source_event_id uuid NOT NULL REFERENCES public.servicenow_intake_ticket_events(id) ON DELETE RESTRICT,
  source_snapshot_id uuid REFERENCES public.servicenow_intake_ticket_snapshots(id) ON DELETE RESTRICT,
  canonical_field text NOT NULL CHECK (length(btrim(canonical_field)) > 0),
  value_jsonb jsonb NOT NULL,
  value_type text NOT NULL CHECK (value_type IN ('string','string_list','number','boolean','json')),
  source_type text NOT NULL CHECK (source_type IN ('requester_correction','requester_reply','structured_ticket','requester_prose','policy_default','inference')),
  source_record_id text,
  source_author text,
  source_occurred_at timestamptz,
  supporting_text text NOT NULL DEFAULT '',
  confidence numeric(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  validation_status text NOT NULL CHECK (validation_status IN ('VALID','MISSING','INVALID','CONTRADICTORY')),
  validation_code text,
  precedence_rank smallint NOT NULL CHECK (precedence_rank BETWEEN 1 AND 6),
  value_sha256 text NOT NULL CHECK (value_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, source_event_id, canonical_field, value_sha256),
  CHECK (
    (value_type = 'string' AND jsonb_typeof(value_jsonb) = 'string') OR
    (value_type = 'string_list' AND jsonb_typeof(value_jsonb) = 'array') OR
    (value_type = 'number' AND jsonb_typeof(value_jsonb) = 'number') OR
    (value_type = 'boolean' AND jsonb_typeof(value_jsonb) = 'boolean') OR
    value_type = 'json'
  )
);

CREATE TABLE public.servicenow_intake_requirement_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  canonical_field text NOT NULL,
  selected_fact_id uuid REFERENCES public.servicenow_intake_facts(id) ON DELETE RESTRICT,
  field_state text NOT NULL CHECK (field_state IN ('VALID','MISSING','INVALID','CONTRADICTORY')),
  policy_rule_code text,
  explanation text NOT NULL DEFAULT '',
  revision_number integer NOT NULL CHECK (revision_number > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, canonical_field, revision_number)
);

CREATE TABLE public.servicenow_intake_fact_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  canonical_field text NOT NULL,
  resolution text NOT NULL DEFAULT 'open' CHECK (resolution IN ('open','resolved','superseded')),
  resolution_detail text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, id)
);

CREATE TABLE public.servicenow_intake_fact_conflict_members (
  conflict_id uuid NOT NULL REFERENCES public.servicenow_intake_fact_conflicts(id) ON DELETE RESTRICT,
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  fact_id uuid NOT NULL REFERENCES public.servicenow_intake_facts(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conflict_id, fact_id)
);

CREATE TABLE public.servicenow_intake_question_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  canonical_field text NOT NULL,
  semantic_fingerprint text NOT NULL CHECK (length(btrim(semantic_fingerprint)) BETWEEN 3 AND 256),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','ANSWERED','INVALID','SUPERSEDED')),
  initial_question text NOT NULL,
  latest_answer_fact_id uuid REFERENCES public.servicenow_intake_facts(id) ON DELETE RESTRICT,
  opened_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE (ticket_id, canonical_field, semantic_fingerprint)
);

CREATE TABLE public.servicenow_intake_question_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  question_id uuid NOT NULL REFERENCES public.servicenow_intake_question_registry(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN ('asked','answered','invalid_answer','resolved','superseded')),
  fact_id uuid REFERENCES public.servicenow_intake_facts(id) ON DELETE RESTRICT,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, idempotency_key),
  UNIQUE (ticket_id, id)
);

CREATE TABLE public.iac_request_schemas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  schema jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_type, version)
);

ALTER TABLE public.servicenow_intake_tickets
  ADD COLUMN request_schema_id uuid REFERENCES public.iac_request_schemas(id) ON DELETE RESTRICT;

CREATE TABLE public.servicenow_intake_ticket_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  approval_type text NOT NULL CHECK (length(btrim(approval_type)) > 0),
  status text NOT NULL CHECK (status IN ('pending','approved','rejected','expired')),
  approver text,
  source_event_id uuid REFERENCES public.servicenow_intake_ticket_events(id) ON DELETE RESTRICT,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, idempotency_key),
  UNIQUE (ticket_id, id)
);

CREATE TABLE public.iac_policy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code text NOT NULL,
  request_type text,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  rule jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rule_code, version)
);

-- Drafting is intentionally confined to repositories and module roots that
-- platform administrators explicitly configure. This is a code-authoring
-- boundary, not an infrastructure-execution permission.
CREATE TABLE public.iac_terraform_agent_repository_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository text NOT NULL CHECK (repository ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  repository_key text GENERATED ALWAYS AS (lower(btrim(repository))) STORED,
  allowed_module_roots jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (repository_key),
  CHECK (jsonb_typeof(allowed_module_roots) = 'array' AND jsonb_array_length(allowed_module_roots) > 0)
);

INSERT INTO public.iac_terraform_agent_repository_allowlist (repository, allowed_module_roots)
VALUES ('Neurealm/arch-insurance-iac', '["terraform/modules"]'::jsonb)
ON CONFLICT (repository_key) DO NOTHING;

CREATE TABLE public.servicenow_intake_workflow_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  from_state text,
  to_state text NOT NULL,
  reason_code text NOT NULL,
  source_event_id uuid REFERENCES public.servicenow_intake_ticket_events(id) ON DELETE RESTRICT,
  expected_version bigint NOT NULL CHECK (expected_version >= 0),
  actor text NOT NULL,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, idempotency_key)
);

-- This is intentionally separate from iac_engineering_gaps. The latter is a
-- reusable capability-development record shared by many tickets; this row is
-- the one governed engineering record for exactly one complete ticket.
CREATE TABLE public.iac_ticket_engineering_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  reusable_capability_gap_id uuid REFERENCES public.iac_engineering_gaps(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','blocked','completed')),
  normalized_requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  security_considerations jsonb NOT NULL DEFAULT '[]'::jsonb,
  acceptance_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_level text NOT NULL DEFAULT 'unassessed',
  rollback_guidance text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.iac_ticket_terraform_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  engineering_gap_id uuid NOT NULL REFERENCES public.iac_ticket_engineering_gaps(id) ON DELETE RESTRICT,
  parent_package_id uuid REFERENCES public.iac_ticket_terraform_packages(id) ON DELETE RESTRICT,
  package_revision integer NOT NULL CHECK (package_revision > 0),
  generation_idempotency_key text NOT NULL CHECK (length(btrim(generation_idempotency_key)) > 0),
  generation_request_sha256 text NOT NULL CHECK (generation_request_sha256 ~ '^[0-9a-f]{64}$'),
  repository text NOT NULL,
  module_source text NOT NULL,
  branch_name text NOT NULL,
  package_manifest jsonb NOT NULL DEFAULT '[]'::jsonb,
  package_sha256 text NOT NULL CHECK (package_sha256 ~ '^[0-9a-f]{64}$'),
  requirement_traceability jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'generated' CHECK (status IN ('generated','validated','blocked','superseded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, package_revision),
  UNIQUE (ticket_id, generation_idempotency_key)
);

ALTER TABLE public.servicenow_intake_tickets
  ADD COLUMN active_terraform_package_id uuid REFERENCES public.iac_ticket_terraform_packages(id) ON DELETE RESTRICT;

CREATE TABLE public.iac_ticket_static_validation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  package_id uuid NOT NULL REFERENCES public.iac_ticket_terraform_packages(id) ON DELETE RESTRICT,
  validator text NOT NULL,
  command_name text NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('passed','failed','blocked')),
  package_sha256 text NOT NULL CHECK (package_sha256 ~ '^[0-9a-f]{64}$'),
  redacted_summary text NOT NULL DEFAULT '',
  actor text NOT NULL CHECK (length(btrim(actor)) > 0),
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  request_sha256 text NOT NULL CHECK (request_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, idempotency_key)
);

-- A trusted GitHub adapter must fetch the exact immutable commit/tree and
-- recompute the package manifest before a PR can be recorded. A branch is
-- deliberately not treated as evidence because it can move after review.
CREATE TABLE public.iac_ticket_github_commit_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  package_id uuid NOT NULL REFERENCES public.iac_ticket_terraform_packages(id) ON DELETE RESTRICT,
  repository text NOT NULL,
  pull_number bigint NOT NULL CHECK (pull_number > 0),
  pull_url text NOT NULL,
  head_ref text NOT NULL,
  head_sha text NOT NULL CHECK (head_sha ~ '^[0-9a-f]{40}$'),
  tree_sha text NOT NULL CHECK (tree_sha ~ '^[0-9a-f]{40}$'),
  observed_manifest jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_package_sha256 text NOT NULL CHECK (expected_package_sha256 ~ '^[0-9a-f]{64}$'),
  observed_manifest_sha256 text CHECK (observed_manifest_sha256 IS NULL OR observed_manifest_sha256 ~ '^[0-9a-f]{64}$'),
  verification_status text NOT NULL CHECK (verification_status IN ('verified','mismatch','unavailable')),
  redacted_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor text NOT NULL CHECK (length(btrim(actor)) > 0),
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  request_sha256 text NOT NULL CHECK (request_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, idempotency_key)
);

CREATE TABLE public.iac_ticket_draft_pull_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  package_id uuid NOT NULL REFERENCES public.iac_ticket_terraform_packages(id) ON DELETE RESTRICT,
  github_observation_id uuid NOT NULL REFERENCES public.iac_ticket_github_commit_observations(id) ON DELETE RESTRICT,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  repository text NOT NULL,
  pull_number bigint NOT NULL CHECK (pull_number > 0),
  pull_url text NOT NULL,
  head_sha text NOT NULL CHECK (head_sha ~ '^[0-9a-f]{40}$'),
  tree_sha text NOT NULL CHECK (tree_sha ~ '^[0-9a-f]{40}$'),
  package_sha256 text NOT NULL CHECK (package_sha256 ~ '^[0-9a-f]{64}$'),
  is_draft boolean NOT NULL DEFAULT true CHECK (is_draft),
  actor text NOT NULL CHECK (length(btrim(actor)) > 0),
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  request_sha256 text NOT NULL CHECK (request_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (repository, pull_number),
  UNIQUE (ticket_id, attempt_number),
  UNIQUE (ticket_id, idempotency_key)
);

CREATE TABLE public.iac_servicenow_tool_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  tool_name text NOT NULL,
  operation text NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('allowed','denied','succeeded','failed')),
  redacted_detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.servicenow_intake_idempotency_keys (
  idempotency_key text PRIMARY KEY,
  ticket_id uuid REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT,
  operation text NOT NULL,
  status text NOT NULL CHECK (status IN ('claimed','completed','failed')),
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Cross-ticket provenance is enforced in the database, not by convention.
-- The simple UUID foreign keys above provide readable definitions; these
-- composite keys additionally prove that every linked record belongs to the
-- same permanent ServiceNow ticket.
ALTER TABLE public.servicenow_intake_ticket_snapshots ADD CONSTRAINT servicenow_ticket_snapshots_ticket_id_id_key UNIQUE (ticket_id, id);
ALTER TABLE public.servicenow_intake_ticket_events ADD CONSTRAINT servicenow_ticket_events_ticket_id_id_key UNIQUE (ticket_id, id);
ALTER TABLE public.servicenow_intake_facts ADD CONSTRAINT servicenow_ticket_facts_ticket_id_id_key UNIQUE (ticket_id, id);
ALTER TABLE public.servicenow_intake_question_registry ADD CONSTRAINT servicenow_ticket_questions_ticket_id_id_key UNIQUE (ticket_id, id);
ALTER TABLE public.iac_ticket_engineering_gaps ADD CONSTRAINT iac_ticket_gaps_ticket_id_id_key UNIQUE (ticket_id, id);
ALTER TABLE public.iac_ticket_terraform_packages ADD CONSTRAINT iac_ticket_packages_ticket_id_id_key UNIQUE (ticket_id, id);
ALTER TABLE public.iac_ticket_github_commit_observations ADD CONSTRAINT iac_ticket_github_observations_ticket_id_id_key UNIQUE (ticket_id, id);
ALTER TABLE public.servicenow_intake_workflow_transitions
  ADD COLUMN github_observation_id uuid REFERENCES public.iac_ticket_github_commit_observations(id) ON DELETE RESTRICT;

ALTER TABLE public.servicenow_intake_attachments
  ADD CONSTRAINT servicenow_attachment_event_same_ticket_fkey
  FOREIGN KEY (ticket_id, event_id) REFERENCES public.servicenow_intake_ticket_events(ticket_id, id);
ALTER TABLE public.servicenow_intake_ticket_events
  ADD CONSTRAINT servicenow_event_snapshot_same_ticket_fkey
  FOREIGN KEY (ticket_id, snapshot_id) REFERENCES public.servicenow_intake_ticket_snapshots(ticket_id, id);
ALTER TABLE public.servicenow_intake_facts
  ADD CONSTRAINT servicenow_fact_event_same_ticket_fkey
  FOREIGN KEY (ticket_id, source_event_id) REFERENCES public.servicenow_intake_ticket_events(ticket_id, id),
  ADD CONSTRAINT servicenow_fact_snapshot_same_ticket_fkey
  FOREIGN KEY (ticket_id, source_snapshot_id) REFERENCES public.servicenow_intake_ticket_snapshots(ticket_id, id);
ALTER TABLE public.servicenow_intake_requirement_revisions
  ADD CONSTRAINT servicenow_requirement_fact_same_ticket_fkey
  FOREIGN KEY (ticket_id, selected_fact_id) REFERENCES public.servicenow_intake_facts(ticket_id, id);
ALTER TABLE public.servicenow_intake_question_registry
  ADD CONSTRAINT servicenow_question_answer_same_ticket_fkey
  FOREIGN KEY (ticket_id, latest_answer_fact_id) REFERENCES public.servicenow_intake_facts(ticket_id, id);
ALTER TABLE public.servicenow_intake_question_events
  ADD CONSTRAINT servicenow_question_event_question_same_ticket_fkey
  FOREIGN KEY (ticket_id, question_id) REFERENCES public.servicenow_intake_question_registry(ticket_id, id),
  ADD CONSTRAINT servicenow_question_event_fact_same_ticket_fkey
  FOREIGN KEY (ticket_id, fact_id) REFERENCES public.servicenow_intake_facts(ticket_id, id);
ALTER TABLE public.servicenow_intake_fact_conflict_members
  ADD CONSTRAINT servicenow_conflict_member_conflict_same_ticket_fkey
  FOREIGN KEY (ticket_id, conflict_id) REFERENCES public.servicenow_intake_fact_conflicts(ticket_id, id),
  ADD CONSTRAINT servicenow_conflict_member_fact_same_ticket_fkey
  FOREIGN KEY (ticket_id, fact_id) REFERENCES public.servicenow_intake_facts(ticket_id, id);
ALTER TABLE public.servicenow_intake_workflow_transitions
  ADD CONSTRAINT servicenow_transition_event_same_ticket_fkey
  FOREIGN KEY (ticket_id, source_event_id) REFERENCES public.servicenow_intake_ticket_events(ticket_id, id);
ALTER TABLE public.servicenow_intake_ticket_approvals
  ADD CONSTRAINT servicenow_ticket_approval_event_same_ticket_fkey
  FOREIGN KEY (ticket_id, source_event_id) REFERENCES public.servicenow_intake_ticket_events(ticket_id, id);
ALTER TABLE public.iac_ticket_terraform_packages
  ADD CONSTRAINT iac_ticket_package_gap_same_ticket_fkey
  FOREIGN KEY (ticket_id, engineering_gap_id) REFERENCES public.iac_ticket_engineering_gaps(ticket_id, id),
  ADD CONSTRAINT iac_ticket_package_parent_same_ticket_fkey
  FOREIGN KEY (ticket_id, parent_package_id) REFERENCES public.iac_ticket_terraform_packages(ticket_id, id);
ALTER TABLE public.servicenow_intake_tickets
  ADD CONSTRAINT servicenow_ticket_active_package_same_ticket_fkey
  FOREIGN KEY (id, active_terraform_package_id) REFERENCES public.iac_ticket_terraform_packages(ticket_id, id);
ALTER TABLE public.iac_ticket_static_validation_runs
  ADD CONSTRAINT iac_ticket_validation_package_same_ticket_fkey
  FOREIGN KEY (ticket_id, package_id) REFERENCES public.iac_ticket_terraform_packages(ticket_id, id);
ALTER TABLE public.iac_ticket_draft_pull_requests
  ADD CONSTRAINT iac_ticket_pr_package_same_ticket_fkey
  FOREIGN KEY (ticket_id, package_id) REFERENCES public.iac_ticket_terraform_packages(ticket_id, id),
  ADD CONSTRAINT iac_ticket_pr_github_observation_same_ticket_fkey
  FOREIGN KEY (ticket_id, github_observation_id) REFERENCES public.iac_ticket_github_commit_observations(ticket_id, id);
ALTER TABLE public.iac_ticket_github_commit_observations
  ADD CONSTRAINT iac_ticket_github_observation_package_same_ticket_fkey
  FOREIGN KEY (ticket_id, package_id) REFERENCES public.iac_ticket_terraform_packages(ticket_id, id);
ALTER TABLE public.servicenow_intake_workflow_transitions
  ADD CONSTRAINT servicenow_transition_github_observation_same_ticket_fkey
  FOREIGN KEY (ticket_id, github_observation_id) REFERENCES public.iac_ticket_github_commit_observations(ticket_id, id);

CREATE INDEX servicenow_ticket_events_ticket_created_idx ON public.servicenow_intake_ticket_events(ticket_id, created_at);
CREATE INDEX servicenow_ticket_facts_ticket_field_idx ON public.servicenow_intake_facts(ticket_id, canonical_field, created_at DESC);
CREATE INDEX servicenow_ticket_questions_open_idx ON public.servicenow_intake_question_registry(ticket_id) WHERE status = 'OPEN';
CREATE INDEX servicenow_ticket_transitions_ticket_created_idx ON public.servicenow_intake_workflow_transitions(ticket_id, created_at);
CREATE INDEX servicenow_ticket_approvals_ticket_type_created_idx ON public.servicenow_intake_ticket_approvals(ticket_id, approval_type, created_at DESC);
CREATE UNIQUE INDEX iac_request_schemas_one_active_version ON public.iac_request_schemas(request_type) WHERE active;
CREATE UNIQUE INDEX iac_policy_rules_one_active_version ON public.iac_policy_rules(rule_code) WHERE active;

CREATE OR REPLACE FUNCTION public.prevent_servicenow_agent_history_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $append_only$
BEGIN
  RAISE EXCEPTION 'ServiceNow Terraform Change Agent history is append-only';
END;
$append_only$;

-- Schema and policy content is immutable once stored. Activation is the only
-- mutable attribute and is permitted solely through the audited registry RPCs
-- below; changing a version's contents would retroactively reinterpret a
-- completed ticket.
CREATE OR REPLACE FUNCTION public.enforce_iac_request_schema_immutability()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $schema_immutability$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'request schema versions are append-only' USING ERRCODE = '42501';
  END IF;
  IF NEW.request_type IS DISTINCT FROM OLD.request_type OR NEW.version IS DISTINCT FROM OLD.version
    OR NEW.schema IS DISTINCT FROM OLD.schema THEN
    RAISE EXCEPTION 'request schema content is immutable; create a new version' USING ERRCODE = '42501';
  END IF;
  IF NEW.active IS DISTINCT FROM OLD.active
    AND current_setting('app.servicenow_agent_registry_activation', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'request schema activation requires the guarded registry RPC' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$schema_immutability$;

CREATE OR REPLACE FUNCTION public.enforce_iac_policy_rule_immutability()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $policy_immutability$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'policy rule versions are append-only' USING ERRCODE = '42501';
  END IF;
  IF NEW.rule_code IS DISTINCT FROM OLD.rule_code OR NEW.request_type IS DISTINCT FROM OLD.request_type
    OR NEW.version IS DISTINCT FROM OLD.version OR NEW.rule IS DISTINCT FROM OLD.rule THEN
    RAISE EXCEPTION 'policy rule content is immutable; create a new version' USING ERRCODE = '42501';
  END IF;
  IF NEW.active IS DISTINCT FROM OLD.active
    AND current_setting('app.servicenow_agent_registry_activation', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'policy activation requires the guarded registry RPC' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$policy_immutability$;

CREATE OR REPLACE FUNCTION public.enforce_servicenow_ticket_header_integrity()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $ticket_header$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.ticket_number IS DISTINCT FROM OLD.ticket_number THEN
    RAISE EXCEPTION 'the canonical ServiceNow ticket number is immutable' USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.service_now_sys_id IS NOT NULL
    AND NEW.service_now_sys_id IS DISTINCT FROM OLD.service_now_sys_id THEN
    RAISE EXCEPTION 'the canonical ServiceNow sys_id is immutable once bound' USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.service_now_sys_id IS NULL AND NEW.service_now_sys_id IS NOT NULL
    AND current_setting('app.servicenow_agent_identity_bind', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'a ServiceNow sys_id may only be bound through canonical ingestion' USING ERRCODE = '42501';
  END IF;
  IF NEW.current_snapshot_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.servicenow_intake_ticket_snapshots s
    WHERE s.id = NEW.current_snapshot_id AND s.ticket_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'current snapshot must belong to this ServiceNow ticket' USING ERRCODE = '23503';
  END IF;
  IF TG_OP = 'UPDATE'
    AND (NEW.workflow_state IS DISTINCT FROM OLD.workflow_state OR NEW.workflow_version IS DISTINCT FROM OLD.workflow_version)
    AND current_setting('app.servicenow_agent_transition', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'ServiceNow agent workflow state can only change through a guarded RPC' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$ticket_header$;

CREATE TRIGGER servicenow_ticket_header_integrity
BEFORE INSERT OR UPDATE ON public.servicenow_intake_tickets
FOR EACH ROW EXECUTE FUNCTION public.enforce_servicenow_ticket_header_integrity();

CREATE TRIGGER servicenow_ticket_snapshots_append_only BEFORE UPDATE OR DELETE ON public.servicenow_intake_ticket_snapshots FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER servicenow_ticket_events_append_only BEFORE UPDATE OR DELETE ON public.servicenow_intake_ticket_events FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER servicenow_ticket_attachments_append_only BEFORE UPDATE OR DELETE ON public.servicenow_intake_attachments FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER servicenow_ticket_facts_append_only BEFORE UPDATE OR DELETE ON public.servicenow_intake_facts FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER servicenow_ticket_requirement_revisions_append_only BEFORE UPDATE OR DELETE ON public.servicenow_intake_requirement_revisions FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER servicenow_ticket_conflict_members_append_only BEFORE UPDATE OR DELETE ON public.servicenow_intake_fact_conflict_members FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER servicenow_ticket_question_events_append_only BEFORE UPDATE OR DELETE ON public.servicenow_intake_question_events FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER servicenow_ticket_approvals_append_only BEFORE UPDATE OR DELETE ON public.servicenow_intake_ticket_approvals FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER servicenow_ticket_transitions_append_only BEFORE UPDATE OR DELETE ON public.servicenow_intake_workflow_transitions FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER iac_request_schemas_immutable BEFORE UPDATE OR DELETE ON public.iac_request_schemas FOR EACH ROW EXECUTE FUNCTION public.enforce_iac_request_schema_immutability();
CREATE TRIGGER iac_policy_rules_immutable BEFORE UPDATE OR DELETE ON public.iac_policy_rules FOR EACH ROW EXECUTE FUNCTION public.enforce_iac_policy_rule_immutability();
CREATE TRIGGER iac_ticket_validation_append_only BEFORE UPDATE OR DELETE ON public.iac_ticket_static_validation_runs FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER iac_ticket_github_observation_append_only BEFORE UPDATE OR DELETE ON public.iac_ticket_github_commit_observations FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER iac_ticket_draft_pr_append_only BEFORE UPDATE OR DELETE ON public.iac_ticket_draft_pull_requests FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER iac_servicenow_tool_audit_append_only BEFORE UPDATE OR DELETE ON public.iac_servicenow_tool_audit_events FOR EACH ROW EXECUTE FUNCTION public.prevent_servicenow_agent_history_mutation();
CREATE TRIGGER iac_ticket_gap_touch_updated_at BEFORE UPDATE ON public.iac_ticket_engineering_gaps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER iac_ticket_package_touch_updated_at BEFORE UPDATE ON public.iac_ticket_terraform_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER iac_terraform_agent_repository_allowlist_touch_updated_at BEFORE UPDATE ON public.iac_terraform_agent_repository_allowlist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.servicenow_intake_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_ticket_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_ticket_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_requirement_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_fact_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_fact_conflict_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_question_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_question_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_ticket_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_request_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_terraform_agent_repository_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_workflow_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_ticket_engineering_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_ticket_terraform_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_ticket_static_validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_ticket_github_commit_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_ticket_draft_pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_servicenow_tool_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_idempotency_keys ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.servicenow_intake_tickets, public.servicenow_intake_ticket_snapshots, public.servicenow_intake_ticket_events, public.servicenow_intake_attachments, public.servicenow_intake_facts, public.servicenow_intake_requirement_revisions, public.servicenow_intake_fact_conflicts, public.servicenow_intake_fact_conflict_members, public.servicenow_intake_question_registry, public.servicenow_intake_question_events, public.servicenow_intake_ticket_approvals, public.iac_request_schemas, public.iac_policy_rules, public.iac_terraform_agent_repository_allowlist, public.servicenow_intake_workflow_transitions, public.iac_ticket_engineering_gaps, public.iac_ticket_terraform_packages, public.iac_ticket_static_validation_runs, public.iac_ticket_github_commit_observations, public.iac_ticket_draft_pull_requests, public.iac_servicenow_tool_audit_events, public.servicenow_intake_idempotency_keys FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.servicenow_intake_tickets, public.servicenow_intake_ticket_snapshots, public.servicenow_intake_ticket_events, public.servicenow_intake_attachments, public.servicenow_intake_facts, public.servicenow_intake_requirement_revisions, public.servicenow_intake_fact_conflicts, public.servicenow_intake_fact_conflict_members, public.servicenow_intake_question_registry, public.servicenow_intake_question_events, public.servicenow_intake_ticket_approvals, public.servicenow_intake_workflow_transitions, public.iac_ticket_engineering_gaps, public.iac_ticket_terraform_packages, public.iac_ticket_static_validation_runs, public.iac_ticket_github_commit_observations, public.iac_ticket_draft_pull_requests TO authenticated;
-- The Edge Function may read safe evidence, but all writes must travel through
-- the SECURITY DEFINER RPCs below. This prevents a service-side agent bug from
-- bypassing redaction, state, provenance, or artifact guards with table DML.
GRANT SELECT ON TABLE public.servicenow_intake_tickets, public.servicenow_intake_ticket_snapshots, public.servicenow_intake_ticket_events, public.servicenow_intake_attachments, public.servicenow_intake_facts, public.servicenow_intake_requirement_revisions, public.servicenow_intake_fact_conflicts, public.servicenow_intake_fact_conflict_members, public.servicenow_intake_question_registry, public.servicenow_intake_question_events, public.servicenow_intake_ticket_approvals, public.iac_request_schemas, public.iac_policy_rules, public.iac_terraform_agent_repository_allowlist, public.servicenow_intake_workflow_transitions, public.iac_ticket_engineering_gaps, public.iac_ticket_terraform_packages, public.iac_ticket_static_validation_runs, public.iac_ticket_github_commit_observations, public.iac_ticket_draft_pull_requests, public.iac_servicenow_tool_audit_events, public.servicenow_intake_idempotency_keys TO service_role;

CREATE POLICY servicenow_ticket_visible_to_requester_or_admin ON public.servicenow_intake_tickets FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())));
CREATE POLICY servicenow_ticket_snapshots_visible_to_requester_or_admin ON public.servicenow_intake_ticket_snapshots FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_events_visible_to_requester_or_admin ON public.servicenow_intake_ticket_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_attachments_visible_to_requester_or_admin ON public.servicenow_intake_attachments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_facts_visible_to_requester_or_admin ON public.servicenow_intake_facts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_requirements_visible_to_requester_or_admin ON public.servicenow_intake_requirement_revisions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_conflicts_visible_to_requester_or_admin ON public.servicenow_intake_fact_conflicts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_conflict_members_visible_to_requester_or_admin ON public.servicenow_intake_fact_conflict_members FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_questions_visible_to_requester_or_admin ON public.servicenow_intake_question_registry FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_question_events_visible_to_requester_or_admin ON public.servicenow_intake_question_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_approvals_visible_to_requester_or_admin ON public.servicenow_intake_ticket_approvals FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY servicenow_ticket_transitions_visible_to_requester_or_admin ON public.servicenow_intake_workflow_transitions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY iac_ticket_gaps_visible_to_requester_or_admin ON public.iac_ticket_engineering_gaps FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY iac_ticket_packages_visible_to_requester_or_admin ON public.iac_ticket_terraform_packages FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY iac_ticket_validation_visible_to_requester_or_admin ON public.iac_ticket_static_validation_runs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY iac_ticket_github_observation_visible_to_requester_or_admin ON public.iac_ticket_github_commit_observations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));
CREATE POLICY iac_ticket_pr_visible_to_requester_or_admin ON public.iac_ticket_draft_pull_requests FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.servicenow_intake_tickets t WHERE t.id = ticket_id AND ((SELECT auth.uid()) = t.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))));

-- Redaction is deterministic and recursive. It protects the durable agent
-- ledger from legacy ticket secrets while preserving safe evidence; it never
-- modifies the legacy ServiceNow intake source records themselves.
CREATE OR REPLACE FUNCTION public.redact_servicenow_agent_jsonb(p_value jsonb, p_depth integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER SET search_path = pg_catalog AS $redact$
DECLARE v_result jsonb;
BEGIN
  IF p_value IS NULL THEN RETURN NULL; END IF;
  IF p_depth > 12 THEN RETURN to_jsonb('[REDACTED: nesting limit]'::text); END IF;
  CASE jsonb_typeof(p_value)
    WHEN 'object' THEN
      SELECT coalesce(jsonb_object_agg(key,
        CASE WHEN key ~* '(authorization|api[-_ ]?key|access[-_ ]?key|client[-_ ]?secret|connection[-_ ]?string|pass(word|phrase)?|private[-_ ]?key|secret|token)'
          THEN to_jsonb('[REDACTED]'::text)
          ELSE public.redact_servicenow_agent_jsonb(value, p_depth + 1) END), '{}'::jsonb)
      INTO v_result FROM jsonb_each(p_value);
      RETURN v_result;
    WHEN 'array' THEN
      SELECT coalesce(jsonb_agg(public.redact_servicenow_agent_jsonb(value, p_depth + 1)), '[]'::jsonb)
      INTO v_result FROM jsonb_array_elements(p_value) AS item(value);
      RETURN v_result;
    WHEN 'string' THEN
      RETURN to_jsonb(regexp_replace(
        regexp_replace(
          p_value #>> '{}',
          '(?is)-----BEGIN( [A-Z0-9]+)? PRIVATE KEY-----.*?-----END( [A-Z0-9]+)? PRIVATE KEY-----',
          '[REDACTED]', 'g'
        ),
        '(authorization|api[-_ ]?key|access[-_ ]?key|client[-_ ]?secret|connection[-_ ]?string|pass(word|phrase)?|private[-_ ]?key|secret|token)[[:space:]]*[:=][[:space:]]*[^[:space:],;]+',
        '[REDACTED]', 'gi'
      ));
    ELSE RETURN p_value;
  END CASE;
END;
$redact$;

-- Compatibility bridge and historical backfill. Old revisions remain the
-- source of record until the Edge Function cutover is deployed.
ALTER TABLE public.servicenow_intake_requests ADD COLUMN IF NOT EXISTS ticket_id uuid REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT;
ALTER TABLE public.servicenow_intake_requests DROP CONSTRAINT IF EXISTS servicenow_intake_requests_status_check;
ALTER TABLE public.servicenow_intake_requests ADD CONSTRAINT servicenow_intake_requests_status_check
  CHECK (status = ANY (ARRAY[
    'received', 'analyzing', 'needs_clarification', 'ready_for_engineering',
    'engineering_gap_opened', 'comment_posted', 'comment_failed',
    'demo_comment_generated', 'identity_conflict', 'failed'
  ]));

-- A historical sys_id that belongs to more than one legacy ticket number is
-- deliberately left unbound. The live ingest RPC will quarantine a later
-- mismatch instead of guessing which conversation should own it.
WITH normalized_legacy AS (
  SELECT r.ticket_number, nullif(btrim(r.service_now_sys_id), '') AS service_now_sys_id,
    r.requested_by_user_id, r.received_at, lower(btrim(r.ticket_number)) AS ticket_key,
    nullif(lower(btrim(r.service_now_sys_id)), '') AS service_now_sys_id_key
  FROM public.servicenow_intake_requests r
), unambiguous_sys_ids AS (
  SELECT service_now_sys_id_key
  FROM normalized_legacy
  WHERE service_now_sys_id_key IS NOT NULL
  GROUP BY service_now_sys_id_key
  HAVING count(DISTINCT ticket_key) = 1
), per_ticket AS (
  SELECT DISTINCT ON (n.ticket_key)
    n.ticket_number,
    CASE WHEN u.service_now_sys_id_key IS NOT NULL THEN n.service_now_sys_id ELSE NULL END AS service_now_sys_id,
    n.requested_by_user_id
  FROM normalized_legacy n
  LEFT JOIN unambiguous_sys_ids u ON u.service_now_sys_id_key = n.service_now_sys_id_key
  ORDER BY n.ticket_key, (u.service_now_sys_id_key IS NOT NULL) DESC,
    (n.requested_by_user_id IS NULL), n.received_at DESC
)
INSERT INTO public.servicenow_intake_tickets (ticket_number, service_now_sys_id, requested_by_user_id)
SELECT ticket_number, service_now_sys_id, requested_by_user_id FROM per_ticket
ON CONFLICT (ticket_key) DO NOTHING;

UPDATE public.servicenow_intake_requests r
SET ticket_id = t.id
FROM public.servicenow_intake_tickets t
WHERE t.ticket_key = lower(btrim(r.ticket_number)) AND r.ticket_id IS NULL;

CREATE INDEX servicenow_intake_requests_ticket_id_idx ON public.servicenow_intake_requests(ticket_id, received_at);

INSERT INTO public.servicenow_intake_ticket_snapshots (ticket_id, upstream_event_key, source_updated_at, redacted_payload, canonical_structured_fields, content_sha256, received_at)
SELECT r.ticket_id, 'legacy-intake:' || r.id::text, r.ticket_updated_at,
  public.redact_servicenow_agent_jsonb(r.ticket_payload), public.redact_servicenow_agent_jsonb(r.normalized_request), r.payload_hash, r.received_at
FROM public.servicenow_intake_requests r
WHERE r.ticket_id IS NOT NULL
ON CONFLICT (ticket_id, upstream_event_key) DO NOTHING;

INSERT INTO public.servicenow_intake_ticket_events (ticket_id, event_type, source_type, source_record_id, source_occurred_at, redacted_payload, content_sha256, idempotency_key, created_at)
SELECT r.ticket_id, 'legacy_snapshot_ingested', 'ticket_snapshot', r.id::text, r.received_at, jsonb_build_object('legacy_request_id', r.id), r.payload_hash, 'legacy-snapshot:' || r.id::text, r.received_at
FROM public.servicenow_intake_requests r
WHERE r.ticket_id IS NOT NULL
ON CONFLICT (ticket_id, idempotency_key) DO NOTHING;

INSERT INTO public.servicenow_intake_ticket_events (ticket_id, event_type, source_type, source_record_id, source_occurred_at, redacted_payload, content_sha256, idempotency_key, created_at)
SELECT r.ticket_id, 'legacy_' || e.event_type, 'system', e.id::text, e.created_at,
  public.redact_servicenow_agent_jsonb(e.detail), r.payload_hash, 'legacy-event:' || e.id::text, e.created_at
FROM public.servicenow_intake_events e
JOIN public.servicenow_intake_requests r ON r.id = e.request_id
WHERE r.ticket_id IS NOT NULL
ON CONFLICT (ticket_id, idempotency_key) DO NOTHING;

INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, expected_version, actor, idempotency_key, created_at)
SELECT t.id, NULL, 'INGESTED', 'legacy_migrated', 0, 'migration', 'legacy-initial:' || t.id::text, t.created_at
FROM public.servicenow_intake_tickets t
ON CONFLICT (ticket_id, idempotency_key) DO NOTHING;

UPDATE public.servicenow_intake_tickets t
SET current_snapshot_id = (
  SELECT s.id FROM public.servicenow_intake_ticket_snapshots s
  WHERE s.ticket_id = t.id ORDER BY s.source_updated_at DESC NULLS LAST, s.sequence_id DESC LIMIT 1
)
WHERE t.current_snapshot_id IS NULL
  AND EXISTS (SELECT 1 FROM public.servicenow_intake_ticket_snapshots s WHERE s.ticket_id = t.id);

CREATE OR REPLACE FUNCTION public.assert_servicenow_agent_service_role()
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $service_role$
BEGIN
  -- Guarded write RPCs are SECURITY DEFINER so they can operate without
  -- granting raw table DML to the service role. auth.role() retains the
  -- authenticated request role through the definer boundary; current_user
  -- would be the function owner and is therefore unsafe here.
  IF coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Service caller required' USING ERRCODE = '42501';
  END IF;
END;
$service_role$;

CREATE OR REPLACE FUNCTION public.activate_servicenow_request_schema(
  p_schema_id uuid, p_actor text, p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $activate_schema$
DECLARE
  v_schema public.iac_request_schemas;
  v_existing public.iac_servicenow_tool_audit_events;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF p_schema_id IS NULL OR length(btrim(coalesce(p_actor, ''))) = 0 OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 THEN
    RAISE EXCEPTION 'schema activation identity is required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_existing FROM public.iac_servicenow_tool_audit_events WHERE idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_existing.tool_name <> 'request_schema_registry' OR v_existing.operation <> 'activate'
      OR v_existing.redacted_detail->>'schemaId' IS DISTINCT FROM p_schema_id::text
      OR v_existing.redacted_detail->>'actor' IS DISTINCT FROM btrim(p_actor) THEN
      RAISE EXCEPTION 'idempotency key was reused with different schema activation data' USING ERRCODE = '22023';
    END IF;
    RETURN v_existing.redacted_detail;
  END IF;
  SELECT * INTO v_schema FROM public.iac_request_schemas WHERE id = p_schema_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'request schema not found' USING ERRCODE = 'P0002'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('servicenow-request-schema:' || lower(btrim(v_schema.request_type)), 0));
  PERFORM set_config('app.servicenow_agent_registry_activation', 'on', true);
  UPDATE public.iac_request_schemas SET active = false WHERE request_type = v_schema.request_type AND active;
  UPDATE public.iac_request_schemas SET active = true WHERE id = v_schema.id;
  INSERT INTO public.iac_servicenow_tool_audit_events (tool_name, operation, outcome, redacted_detail, idempotency_key)
  VALUES ('request_schema_registry', 'activate', 'succeeded',
    jsonb_build_object('schemaId', v_schema.id, 'requestType', v_schema.request_type, 'version', v_schema.version, 'actor', btrim(p_actor)),
    p_idempotency_key);
  RETURN jsonb_build_object('schemaId', v_schema.id, 'requestType', v_schema.request_type, 'version', v_schema.version, 'actor', btrim(p_actor));
END;
$activate_schema$;

CREATE OR REPLACE FUNCTION public.activate_servicenow_policy_rule(
  p_policy_rule_id uuid, p_actor text, p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $activate_policy$
DECLARE
  v_rule public.iac_policy_rules;
  v_existing public.iac_servicenow_tool_audit_events;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF p_policy_rule_id IS NULL OR length(btrim(coalesce(p_actor, ''))) = 0 OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 THEN
    RAISE EXCEPTION 'policy activation identity is required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_existing FROM public.iac_servicenow_tool_audit_events WHERE idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_existing.tool_name <> 'policy_rule_registry' OR v_existing.operation <> 'activate'
      OR v_existing.redacted_detail->>'policyRuleId' IS DISTINCT FROM p_policy_rule_id::text
      OR v_existing.redacted_detail->>'actor' IS DISTINCT FROM btrim(p_actor) THEN
      RAISE EXCEPTION 'idempotency key was reused with different policy activation data' USING ERRCODE = '22023';
    END IF;
    RETURN v_existing.redacted_detail;
  END IF;
  SELECT * INTO v_rule FROM public.iac_policy_rules WHERE id = p_policy_rule_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'policy rule not found' USING ERRCODE = 'P0002'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('servicenow-policy-rule:' || lower(btrim(v_rule.rule_code)), 0));
  PERFORM set_config('app.servicenow_agent_registry_activation', 'on', true);
  UPDATE public.iac_policy_rules SET active = false WHERE rule_code = v_rule.rule_code AND active;
  UPDATE public.iac_policy_rules SET active = true WHERE id = v_rule.id;
  INSERT INTO public.iac_servicenow_tool_audit_events (tool_name, operation, outcome, redacted_detail, idempotency_key)
  VALUES ('policy_rule_registry', 'activate', 'succeeded',
    jsonb_build_object('policyRuleId', v_rule.id, 'ruleCode', v_rule.rule_code, 'version', v_rule.version, 'actor', btrim(p_actor)),
    p_idempotency_key);
  RETURN jsonb_build_object('policyRuleId', v_rule.id, 'ruleCode', v_rule.rule_code, 'version', v_rule.version, 'actor', btrim(p_actor));
END;
$activate_policy$;

-- Atomic, service-only snapshot ingestion. The event key is supplied by the
-- ServiceNow adapter (or the payload hash for demo mode) and prevents duplicate
-- webhooks from creating duplicate history or analysis work. Both immutable
-- ServiceNow identities are resolved under locks before any snapshot is stored:
-- an identity mismatch is quarantined as an event, never silently merged.
CREATE OR REPLACE FUNCTION public.ingest_servicenow_ticket_snapshot(
  p_ticket_number text,
  p_service_now_sys_id text,
  p_requested_by_user_id uuid,
  p_upstream_event_key text,
  p_source_updated_at timestamptz,
  p_redacted_payload jsonb,
  p_canonical_structured_fields jsonb,
  p_content_sha256 text
) RETURNS TABLE(ticket_id uuid, snapshot_id uuid, inserted boolean, workflow_version bigint, identity_conflict boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $ingest$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_ticket_by_number public.servicenow_intake_tickets;
  v_ticket_by_sys_id public.servicenow_intake_tickets;
  v_snapshot_id uuid;
  v_existing_content_sha256 text;
  v_inserted boolean := false;
  v_created boolean := false;
  v_current_source_updated_at timestamptz;
  v_make_current boolean := false;
  v_workflow_version bigint;
  v_ticket_key text;
  v_observed_sys_id text;
  v_sys_id_key text;
  v_ticket_lock_key bigint;
  v_sys_id_lock_key bigint;
  v_redacted_payload jsonb;
  v_redacted_fields jsonb;
  v_conflict_detail jsonb;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF length(btrim(coalesce(p_ticket_number, ''))) = 0 OR length(btrim(coalesce(p_upstream_event_key, ''))) = 0 OR coalesce(p_content_sha256, '') !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid ServiceNow ticket snapshot' USING ERRCODE = '22023';
  END IF;
  v_ticket_key := lower(btrim(p_ticket_number));
  v_observed_sys_id := nullif(btrim(p_service_now_sys_id), '');
  v_sys_id_key := lower(v_observed_sys_id);
  -- The caller's redaction claim is never trusted. p_content_sha256 remains
  -- the source-event fingerprint, while only this re-redacted representation
  -- is allowed into the durable canonical ledger.
  v_redacted_payload := public.redact_servicenow_agent_jsonb(coalesce(p_redacted_payload, '{}'::jsonb));
  v_redacted_fields := public.redact_servicenow_agent_jsonb(coalesce(p_canonical_structured_fields, '{}'::jsonb));

  -- Lock both identity namespaces in a stable order so concurrent first-seen
  -- webhooks cannot create separate rows for the same ServiceNow record.
  v_ticket_lock_key := pg_catalog.hashtextextended('servicenow-ticket:' || v_ticket_key, 0);
  IF v_sys_id_key IS NOT NULL THEN
    v_sys_id_lock_key := pg_catalog.hashtextextended('servicenow-sys-id:' || v_sys_id_key, 0);
    IF v_ticket_lock_key <= v_sys_id_lock_key THEN
      PERFORM pg_catalog.pg_advisory_xact_lock(v_ticket_lock_key);
      PERFORM pg_catalog.pg_advisory_xact_lock(v_sys_id_lock_key);
    ELSE
      PERFORM pg_catalog.pg_advisory_xact_lock(v_sys_id_lock_key);
      PERFORM pg_catalog.pg_advisory_xact_lock(v_ticket_lock_key);
    END IF;
  ELSE
    PERFORM pg_catalog.pg_advisory_xact_lock(v_ticket_lock_key);
  END IF;

  SELECT * INTO v_ticket_by_number
  FROM public.servicenow_intake_tickets WHERE ticket_key = v_ticket_key FOR UPDATE;
  IF v_sys_id_key IS NOT NULL THEN
    SELECT * INTO v_ticket_by_sys_id
    FROM public.servicenow_intake_tickets WHERE service_now_sys_id_key = v_sys_id_key FOR UPDATE;
  END IF;

  IF v_ticket_by_number.id IS NOT NULL AND v_ticket_by_sys_id.id IS NOT NULL
    AND v_ticket_by_number.id <> v_ticket_by_sys_id.id THEN
    v_conflict_detail := jsonb_build_object(
      'reason', 'ticket_number_and_sys_id_resolve_to_different_canonical_tickets',
      'observedTicketNumber', btrim(p_ticket_number), 'observedServiceNowSysId', v_observed_sys_id,
      'ticketIdFromNumber', v_ticket_by_number.id, 'ticketIdFromSysId', v_ticket_by_sys_id.id
    );
    INSERT INTO public.servicenow_intake_ticket_events (ticket_id, event_type, source_type, source_record_id, source_occurred_at, redacted_payload, content_sha256, idempotency_key)
    VALUES (v_ticket_by_number.id, 'identity_conflict', 'system', p_upstream_event_key, p_source_updated_at, v_conflict_detail, p_content_sha256, 'identity-conflict:number:' || p_upstream_event_key || ':' || p_content_sha256)
    ON CONFLICT (ticket_id, idempotency_key) DO NOTHING;
    INSERT INTO public.servicenow_intake_ticket_events (ticket_id, event_type, source_type, source_record_id, source_occurred_at, redacted_payload, content_sha256, idempotency_key)
    VALUES (v_ticket_by_sys_id.id, 'identity_conflict', 'system', p_upstream_event_key, p_source_updated_at, v_conflict_detail, p_content_sha256, 'identity-conflict:sys-id:' || p_upstream_event_key || ':' || p_content_sha256)
    ON CONFLICT (ticket_id, idempotency_key) DO NOTHING;
    RETURN QUERY SELECT v_ticket_by_number.id, NULL::uuid, false, v_ticket_by_number.workflow_version, true;
    RETURN;
  END IF;

  IF v_ticket_by_sys_id.id IS NOT NULL THEN
    v_ticket := v_ticket_by_sys_id;
  ELSIF v_ticket_by_number.id IS NOT NULL THEN
    v_ticket := v_ticket_by_number;
  ELSE
    INSERT INTO public.servicenow_intake_tickets (ticket_number, service_now_sys_id, requested_by_user_id)
    VALUES (btrim(p_ticket_number), v_observed_sys_id, p_requested_by_user_id)
    RETURNING * INTO v_ticket;
    v_created := true;
    INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, expected_version, actor, idempotency_key)
    VALUES (v_ticket.id, NULL, 'INGESTED', 'ticket_created', 0, 'servicenow_adapter', 'initial:' || v_ticket.id::text)
    ON CONFLICT (ticket_id, idempotency_key) DO NOTHING;
  END IF;

  IF NOT v_created AND v_ticket.ticket_key <> v_ticket_key THEN
    v_conflict_detail := jsonb_build_object(
      'reason', 'sys_id_was_supplied_with_a_different_ticket_number',
      'expectedTicketNumber', v_ticket.ticket_number, 'observedTicketNumber', btrim(p_ticket_number),
      'serviceNowSysId', v_observed_sys_id
    );
    INSERT INTO public.servicenow_intake_ticket_events (ticket_id, event_type, source_type, source_record_id, source_occurred_at, redacted_payload, content_sha256, idempotency_key)
    VALUES (v_ticket.id, 'identity_conflict', 'system', p_upstream_event_key, p_source_updated_at, v_conflict_detail, p_content_sha256, 'identity-conflict:ticket-number:' || p_upstream_event_key || ':' || p_content_sha256)
    ON CONFLICT (ticket_id, idempotency_key) DO NOTHING;
    RETURN QUERY SELECT v_ticket.id, NULL::uuid, false, v_ticket.workflow_version, true;
    RETURN;
  END IF;
  IF NOT v_created AND v_observed_sys_id IS NOT NULL AND v_ticket.service_now_sys_id_key IS NOT NULL
    AND v_ticket.service_now_sys_id_key <> v_sys_id_key THEN
    v_conflict_detail := jsonb_build_object(
      'reason', 'ticket_number_was_supplied_with_a_different_sys_id',
      'ticketNumber', v_ticket.ticket_number, 'expectedServiceNowSysId', v_ticket.service_now_sys_id,
      'observedServiceNowSysId', v_observed_sys_id
    );
    INSERT INTO public.servicenow_intake_ticket_events (ticket_id, event_type, source_type, source_record_id, source_occurred_at, redacted_payload, content_sha256, idempotency_key)
    VALUES (v_ticket.id, 'identity_conflict', 'system', p_upstream_event_key, p_source_updated_at, v_conflict_detail, p_content_sha256, 'identity-conflict:sys-id:' || p_upstream_event_key || ':' || p_content_sha256)
    ON CONFLICT (ticket_id, idempotency_key) DO NOTHING;
    RETURN QUERY SELECT v_ticket.id, NULL::uuid, false, v_ticket.workflow_version, true;
    RETURN;
  END IF;

  INSERT INTO public.servicenow_intake_ticket_snapshots (ticket_id, upstream_event_key, source_updated_at, redacted_payload, canonical_structured_fields, content_sha256)
  VALUES (v_ticket.id, p_upstream_event_key, p_source_updated_at, v_redacted_payload, v_redacted_fields, p_content_sha256)
  ON CONFLICT (ticket_id, upstream_event_key) DO NOTHING
  RETURNING id INTO v_snapshot_id;
  v_inserted := found;
  IF NOT v_inserted THEN
    SELECT id, content_sha256 INTO v_snapshot_id, v_existing_content_sha256
    FROM public.servicenow_intake_ticket_snapshots WHERE ticket_id = v_ticket.id AND upstream_event_key = p_upstream_event_key;
    IF v_existing_content_sha256 IS DISTINCT FROM p_content_sha256 THEN
      RAISE EXCEPTION 'upstream event key was reused with different content' USING ERRCODE = '22023';
    END IF;
  ELSE
    INSERT INTO public.servicenow_intake_ticket_events (ticket_id, snapshot_id, event_type, source_type, source_record_id, source_occurred_at, redacted_payload, content_sha256, idempotency_key)
    VALUES (v_ticket.id, v_snapshot_id, 'snapshot_ingested', 'ticket_snapshot', p_upstream_event_key, p_source_updated_at, v_redacted_payload, p_content_sha256, 'snapshot:' || p_upstream_event_key);
    IF v_ticket.current_snapshot_id IS NOT NULL THEN
      SELECT source_updated_at INTO v_current_source_updated_at FROM public.servicenow_intake_ticket_snapshots WHERE id = v_ticket.current_snapshot_id;
    END IF;
    -- Equal or absent source timestamps are not evidence that a late event is
    -- newer. First-seen remains current unless an event has a strictly later
    -- source timestamp.
    v_make_current := v_ticket.current_snapshot_id IS NULL
      OR (p_source_updated_at IS NOT NULL AND (v_current_source_updated_at IS NULL OR p_source_updated_at > v_current_source_updated_at));
    IF v_ticket.service_now_sys_id IS NULL AND v_observed_sys_id IS NOT NULL THEN
      PERFORM set_config('app.servicenow_agent_identity_bind', 'on', true);
    END IF;
    PERFORM set_config('app.servicenow_agent_transition', 'on', true);
    UPDATE public.servicenow_intake_tickets SET
      current_snapshot_id = CASE WHEN v_make_current THEN v_snapshot_id ELSE current_snapshot_id END,
      service_now_sys_id = coalesce(service_now_sys_id, v_observed_sys_id),
      requested_by_user_id = coalesce(requested_by_user_id, p_requested_by_user_id),
      workflow_version = workflow_version + 1,
      updated_at = now()
    WHERE id = v_ticket.id
    RETURNING workflow_version INTO v_workflow_version;
  END IF;
  IF NOT v_inserted THEN v_workflow_version := v_ticket.workflow_version; END IF;
  RETURN QUERY SELECT v_ticket.id, v_snapshot_id, v_inserted, v_workflow_version, false;
END;
$ingest$;

CREATE OR REPLACE FUNCTION public.transition_servicenow_intake_ticket(
  p_ticket_id uuid, p_expected_version bigint, p_to_state text, p_reason_code text, p_idempotency_key text, p_actor text, p_source_event_id uuid DEFAULT NULL
) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $transition$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_existing public.servicenow_intake_workflow_transitions;
  v_allowed boolean;
  v_new_version bigint;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF length(btrim(coalesce(p_reason_code, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0 OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 THEN
    RAISE EXCEPTION 'transition reason, actor, and idempotency key are required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_existing FROM public.servicenow_intake_workflow_transitions WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_existing.to_state IS DISTINCT FROM p_to_state OR v_existing.reason_code IS DISTINCT FROM p_reason_code
      OR v_existing.expected_version IS DISTINCT FROM p_expected_version OR v_existing.actor IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION 'idempotency key was reused with different transition data' USING ERRCODE = '22023';
    END IF;
    RETURN v_ticket.workflow_version;
  END IF;
  IF v_ticket.workflow_version <> p_expected_version THEN RAISE EXCEPTION 'ticket workflow version changed' USING ERRCODE = '40001'; END IF;
  IF p_to_state IN ('GAP_CREATED','PACKAGE_GENERATED','PACKAGE_VALIDATED','DRAFT_PR_CREATED','HANDOFF_COMPLETE') THEN
    RAISE EXCEPTION 'artifact-backed state requires its dedicated guarded RPC' USING ERRCODE = '22023';
  END IF;
  v_allowed := CASE v_ticket.workflow_state
    WHEN 'INGESTED' THEN p_to_state IN ('ANALYZING','FAILED')
    WHEN 'ANALYZING' THEN p_to_state IN ('WAITING_FOR_INFORMATION','BLOCKED','FAILED')
    WHEN 'WAITING_FOR_INFORMATION' THEN p_to_state IN ('ANALYZING','BLOCKED','FAILED')
    WHEN 'REQUEST_COMPLETE' THEN p_to_state IN ('BLOCKED','FAILED')
    WHEN 'GAP_CREATED' THEN p_to_state IN ('BLOCKED','FAILED')
    WHEN 'PACKAGE_GENERATED' THEN p_to_state IN ('BLOCKED','FAILED')
    WHEN 'PACKAGE_VALIDATED' THEN p_to_state IN ('BLOCKED','FAILED')
    WHEN 'DRAFT_PR_CREATED' THEN p_to_state IN ('BLOCKED','FAILED')
    WHEN 'BLOCKED' THEN p_to_state IN ('ANALYZING','FAILED')
    WHEN 'FAILED' THEN p_to_state = 'ANALYZING'
    ELSE false END;
  IF NOT v_allowed THEN RAISE EXCEPTION 'illegal ServiceNow Terraform Change Agent transition: % -> %', v_ticket.workflow_state, p_to_state USING ERRCODE = '22023'; END IF;
  INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, source_event_id, expected_version, actor, idempotency_key)
  VALUES (p_ticket_id, v_ticket.workflow_state, p_to_state, p_reason_code, p_source_event_id, p_expected_version, p_actor, p_idempotency_key);
  PERFORM set_config('app.servicenow_agent_transition', 'on', true);
  UPDATE public.servicenow_intake_tickets SET workflow_state = p_to_state, workflow_version = workflow_version + 1, updated_at = now() WHERE id = p_ticket_id RETURNING workflow_version INTO v_new_version;
  RETURN v_new_version;
END;
$transition$;

-- Completeness is not a label selected by an LLM or a browser. This guarded
-- operation validates the active, versioned request schema against the latest
-- deterministic requirement revisions, approval evidence, and open conflicts.
CREATE OR REPLACE FUNCTION public.complete_servicenow_ticket_request(
  p_ticket_id uuid, p_expected_version bigint, p_request_schema_id uuid,
  p_idempotency_key text, p_actor text, p_source_event_id uuid DEFAULT NULL
) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $complete$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_schema public.iac_request_schemas;
  v_transition public.servicenow_intake_workflow_transitions;
  v_new_version bigint;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF p_request_schema_id IS NULL OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0 THEN
    RAISE EXCEPTION 'schema and completion identity are required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_transition FROM public.servicenow_intake_workflow_transitions WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_transition.to_state <> 'REQUEST_COMPLETE' OR v_transition.expected_version <> p_expected_version THEN RAISE EXCEPTION 'idempotency key was reused with different completion data' USING ERRCODE = '22023'; END IF;
    RETURN v_ticket.workflow_version;
  END IF;
  IF v_ticket.workflow_version <> p_expected_version OR v_ticket.workflow_state <> 'ANALYZING' THEN RAISE EXCEPTION 'ticket is not ready for completion' USING ERRCODE = '40001'; END IF;
  SELECT * INTO v_schema FROM public.iac_request_schemas WHERE id = p_request_schema_id AND active FOR SHARE;
  IF NOT found OR jsonb_typeof(v_schema.schema) <> 'object' OR jsonb_typeof(coalesce(v_schema.schema->'requiredFields', '[]'::jsonb)) <> 'array'
    OR jsonb_typeof(coalesce(v_schema.schema->'requiredApprovals', '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'active request schema is invalid' USING ERRCODE = '22023';
  END IF;
  IF v_ticket.request_type IS NOT NULL AND v_ticket.request_type <> v_schema.request_type THEN
    RAISE EXCEPTION 'request schema does not match ticket request type' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(coalesce(v_schema.schema->'requiredFields', '[]'::jsonb)) AS required(field)
    WHERE (
      SELECT r.field_state FROM public.servicenow_intake_requirement_revisions r
      WHERE r.ticket_id = p_ticket_id AND r.canonical_field = required.field
      ORDER BY r.revision_number DESC LIMIT 1
    ) IS DISTINCT FROM 'VALID'
  ) THEN RAISE EXCEPTION 'required ticket information is incomplete, invalid, or contradictory' USING ERRCODE = '22023'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(coalesce(v_schema.schema->'requiredApprovals', '[]'::jsonb)) AS required(approval_type)
    WHERE (
      SELECT a.status FROM public.servicenow_intake_ticket_approvals a
      WHERE a.ticket_id = p_ticket_id AND a.approval_type = required.approval_type
      ORDER BY a.created_at DESC, a.id DESC LIMIT 1
    ) IS DISTINCT FROM 'approved'
  ) THEN RAISE EXCEPTION 'required ticket approvals are not present' USING ERRCODE = '22023'; END IF;
  IF EXISTS (SELECT 1 FROM public.servicenow_intake_fact_conflicts c WHERE c.ticket_id = p_ticket_id AND c.resolution = 'open') THEN
    RAISE EXCEPTION 'unresolved ticket facts prevent completion' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, source_event_id, expected_version, actor, idempotency_key)
  VALUES (p_ticket_id, 'ANALYZING', 'REQUEST_COMPLETE', 'requirements_and_approvals_validated', p_source_event_id, p_expected_version, p_actor, p_idempotency_key);
  PERFORM set_config('app.servicenow_agent_transition', 'on', true);
  UPDATE public.servicenow_intake_tickets SET request_type = v_schema.request_type, request_schema_id = v_schema.id,
    workflow_state = 'REQUEST_COMPLETE', workflow_version = workflow_version + 1, updated_at = now()
  WHERE id = p_ticket_id RETURNING workflow_version INTO v_new_version;
  RETURN v_new_version;
END;
$complete$;

-- Artifact-backed states are created atomically with their durable record.
-- The generic transition RPC deliberately rejects these state names, so a
-- service bug cannot claim a package or PR exists when it does not.
CREATE OR REPLACE FUNCTION public.create_servicenow_ticket_engineering_gap(
  p_ticket_id uuid, p_expected_version bigint, p_gap jsonb,
  p_idempotency_key text, p_actor text, p_source_event_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $gap$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_transition public.servicenow_intake_workflow_transitions;
  v_gap public.iac_ticket_engineering_gaps;
  v_reusable_gap_id uuid;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF p_gap IS NULL OR jsonb_typeof(p_gap) <> 'object' OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0 THEN
    RAISE EXCEPTION 'valid governed gap and operation identity are required' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(coalesce(p_gap->'normalizedRequirements', '{}'::jsonb)) <> 'object'
    OR jsonb_typeof(coalesce(p_gap->'securityConsiderations', '[]'::jsonb)) <> 'array'
    OR jsonb_typeof(coalesce(p_gap->'acceptanceCriteria', '[]'::jsonb)) <> 'array'
    OR jsonb_typeof(coalesce(p_gap->'validationRequirements', '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'governed gap payload has invalid JSON shapes' USING ERRCODE = '22023';
  END IF;
  IF coalesce(p_gap->'normalizedRequirements', '{}'::jsonb) = '{}'::jsonb
    OR coalesce(jsonb_array_length(p_gap->'acceptanceCriteria'), 0) = 0
    OR coalesce(jsonb_array_length(p_gap->'validationRequirements'), 0) = 0 THEN
    RAISE EXCEPTION 'governed gap must contain requirements, acceptance criteria, and validation requirements' USING ERRCODE = '22023';
  END IF;
  IF nullif(btrim(coalesce(p_gap->>'reusableCapabilityGapId', '')), '') IS NOT NULL THEN
    v_reusable_gap_id := (p_gap->>'reusableCapabilityGapId')::uuid;
  END IF;
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_transition FROM public.servicenow_intake_workflow_transitions WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_transition.to_state <> 'GAP_CREATED' OR v_transition.expected_version <> p_expected_version THEN
      RAISE EXCEPTION 'idempotency key was reused with different gap data' USING ERRCODE = '22023';
    END IF;
    SELECT * INTO v_gap FROM public.iac_ticket_engineering_gaps WHERE ticket_id = p_ticket_id;
    RETURN jsonb_build_object('id', v_gap.id, 'ticketId', p_ticket_id, 'workflowVersion', v_ticket.workflow_version);
  END IF;
  IF v_ticket.workflow_version <> p_expected_version OR v_ticket.workflow_state <> 'REQUEST_COMPLETE' THEN
    RAISE EXCEPTION 'ticket is not ready for governed gap creation' USING ERRCODE = '40001';
  END IF;
  INSERT INTO public.iac_ticket_engineering_gaps (
    ticket_id, reusable_capability_gap_id, normalized_requirements,
    security_considerations, acceptance_criteria, validation_requirements,
    risk_level, rollback_guidance
  ) VALUES (
    p_ticket_id, v_reusable_gap_id, coalesce(p_gap->'normalizedRequirements', '{}'::jsonb),
    coalesce(p_gap->'securityConsiderations', '[]'::jsonb), coalesce(p_gap->'acceptanceCriteria', '[]'::jsonb),
    coalesce(p_gap->'validationRequirements', '[]'::jsonb),
    coalesce(nullif(btrim(p_gap->>'riskLevel'), ''), 'unassessed'),
    coalesce(p_gap->>'rollbackGuidance', '')
  ) RETURNING * INTO v_gap;
  INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, source_event_id, expected_version, actor, idempotency_key)
  VALUES (p_ticket_id, 'REQUEST_COMPLETE', 'GAP_CREATED', 'governed_gap_created', p_source_event_id, p_expected_version, p_actor, p_idempotency_key);
  PERFORM set_config('app.servicenow_agent_transition', 'on', true);
  UPDATE public.servicenow_intake_tickets SET
    reusable_capability_gap_id = coalesce(v_reusable_gap_id, reusable_capability_gap_id),
    workflow_state = 'GAP_CREATED', workflow_version = workflow_version + 1, updated_at = now()
  WHERE id = p_ticket_id
  RETURNING * INTO v_ticket;
  RETURN jsonb_build_object('id', v_gap.id, 'ticketId', p_ticket_id, 'workflowVersion', v_ticket.workflow_version);
END;
$gap$;

-- A package hash is the SHA-256 of a canonical, sorted manifest of every
-- intended Terraform/documentation file. The GitHub adapter later recomputes
-- this exact manifest from the immutable PR head tree.
CREATE OR REPLACE FUNCTION public.servicenow_agent_json_sha256(p_value jsonb)
RETURNS text LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = '' AS $json_hash$
  SELECT encode(extensions.digest(convert_to(coalesce(p_value, 'null'::jsonb)::text, 'UTF8'), 'sha256'::text), 'hex');
$json_hash$;

CREATE OR REPLACE FUNCTION public.canonical_servicenow_terraform_manifest(p_manifest jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = '' AS $canonical_manifest$
  SELECT coalesce(jsonb_agg(entry ORDER BY btrim(entry->>'path')), '[]'::jsonb)
  FROM jsonb_array_elements(CASE WHEN jsonb_typeof(p_manifest) = 'array' THEN p_manifest ELSE '[]'::jsonb END) AS entries(entry);
$canonical_manifest$;

CREATE OR REPLACE FUNCTION public.servicenow_terraform_manifest_sha256(p_manifest jsonb)
RETURNS text LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = '' AS $manifest_hash$
  SELECT public.servicenow_agent_json_sha256(public.canonical_servicenow_terraform_manifest(p_manifest));
$manifest_hash$;

CREATE OR REPLACE FUNCTION public.is_valid_servicenow_terraform_manifest(p_manifest jsonb)
RETURNS boolean LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = '' AS $manifest_valid$
  SELECT jsonb_typeof(p_manifest) = 'array'
    AND jsonb_array_length(p_manifest) BETWEEN 1 AND 250
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_manifest) AS entries(entry)
      WHERE jsonb_typeof(entry) <> 'object'
        OR length(btrim(coalesce(entry->>'path', ''))) NOT BETWEEN 1 AND 240
        OR btrim(coalesce(entry->>'path', '')) !~ '^[A-Za-z0-9][A-Za-z0-9._/-]*\.(tf|tf\.json|tftpl|md)$'
        OR btrim(coalesce(entry->>'path', '')) ~ '(^|/)(\.|\.\.)($|/)'
        OR coalesce(entry->>'sha256', '') !~ '^[0-9a-f]{64}$'
    )
    AND NOT EXISTS (
      SELECT btrim(entry->>'path') FROM jsonb_array_elements(p_manifest) AS entries(entry)
      GROUP BY btrim(entry->>'path') HAVING count(*) > 1
    );
$manifest_valid$;

CREATE OR REPLACE FUNCTION public.servicenow_validation_requirement_command(p_requirement jsonb)
RETURNS text LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = '' AS $validation_requirement$
  SELECT CASE jsonb_typeof(p_requirement)
    WHEN 'string' THEN lower(btrim(p_requirement #>> '{}'))
    WHEN 'object' THEN lower(btrim(p_requirement->>'commandName'))
    ELSE NULL END;
$validation_requirement$;

CREATE OR REPLACE FUNCTION public.record_servicenow_ticket_terraform_package(
  p_ticket_id uuid, p_expected_version bigint, p_package jsonb,
  p_idempotency_key text, p_actor text, p_source_event_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $package$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_transition public.servicenow_intake_workflow_transitions;
  v_gap public.iac_ticket_engineering_gaps;
  v_package public.iac_ticket_terraform_packages;
  v_previous_package public.iac_ticket_terraform_packages;
  v_repository_config public.iac_terraform_agent_repository_allowlist;
  v_package_revision integer;
  v_request_sha256 text;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF jsonb_typeof(p_package) <> 'object' OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0
    OR length(btrim(coalesce(p_package->>'repository', ''))) = 0 OR length(btrim(coalesce(p_package->>'moduleSource', ''))) = 0
    OR length(btrim(coalesce(p_package->>'branchName', ''))) = 0 OR coalesce(p_package->>'packageSha256', '') !~ '^[0-9a-f]{64}$'
    OR jsonb_typeof(coalesce(p_package->'requirementTraceability', '{}'::jsonb)) <> 'object'
    OR NOT public.is_valid_servicenow_terraform_manifest(p_package->'packageManifest')
    OR public.servicenow_terraform_manifest_sha256(p_package->'packageManifest') <> p_package->>'packageSha256' THEN
    RAISE EXCEPTION 'invalid Terraform package record' USING ERRCODE = '22023';
  END IF;
  IF btrim(p_package->>'moduleSource') !~ '^[A-Za-z0-9][A-Za-z0-9._/-]{0,239}$'
    OR btrim(p_package->>'moduleSource') ~ '(^|/)(\.|\.\.)($|/)'
    OR btrim(p_package->>'branchName') !~ '^ai-draft/[A-Za-z0-9][A-Za-z0-9._/-]{1,120}$'
    OR btrim(p_package->>'branchName') ~ '(^|/)(\.|\.\.)($|/)' THEN
    RAISE EXCEPTION 'module source or draft branch is outside the governed path policy' USING ERRCODE = '22023';
  END IF;
  v_request_sha256 := public.servicenow_agent_json_sha256(p_package);
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_transition FROM public.servicenow_intake_workflow_transitions WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_transition.to_state <> 'PACKAGE_GENERATED' OR v_transition.expected_version <> p_expected_version
      OR v_transition.actor IS DISTINCT FROM p_actor OR v_transition.source_event_id IS DISTINCT FROM p_source_event_id THEN
      RAISE EXCEPTION 'idempotency key was reused with different package data' USING ERRCODE = '22023';
    END IF;
    SELECT * INTO v_package FROM public.iac_ticket_terraform_packages WHERE ticket_id = p_ticket_id AND generation_idempotency_key = p_idempotency_key;
    IF NOT found OR v_package.generation_request_sha256 IS DISTINCT FROM v_request_sha256 THEN
      RAISE EXCEPTION 'idempotency key was reused with different package content' USING ERRCODE = '22023';
    END IF;
    RETURN jsonb_build_object('id', v_package.id, 'ticketId', p_ticket_id, 'workflowVersion', v_ticket.workflow_version);
  END IF;
  IF v_ticket.workflow_version <> p_expected_version OR v_ticket.workflow_state <> 'GAP_CREATED' THEN RAISE EXCEPTION 'ticket is not ready for package generation' USING ERRCODE = '40001'; END IF;
  SELECT * INTO v_gap FROM public.iac_ticket_engineering_gaps WHERE ticket_id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'governed gap is missing' USING ERRCODE = '23503'; END IF;
  SELECT * INTO v_repository_config FROM public.iac_terraform_agent_repository_allowlist
  WHERE repository_key = lower(btrim(p_package->>'repository')) AND active FOR SHARE;
  IF NOT found OR NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(v_repository_config.allowed_module_roots) AS roots(path)
    WHERE btrim(p_package->>'moduleSource') = btrim(roots.path)
      OR btrim(p_package->>'moduleSource') LIKE btrim(roots.path) || '/%'
  ) THEN
    RAISE EXCEPTION 'repository or module source is not enabled for Terraform drafting' USING ERRCODE = '42501';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_package->'packageManifest') AS entries(entry)
    WHERE btrim(entry->>'path') NOT LIKE btrim(p_package->>'moduleSource') || '/%'
  ) THEN
    RAISE EXCEPTION 'package manifest contains files outside the approved module source' USING ERRCODE = '22023';
  END IF;
  IF v_ticket.active_terraform_package_id IS NOT NULL THEN
    SELECT * INTO v_previous_package FROM public.iac_ticket_terraform_packages
    WHERE ticket_id = p_ticket_id AND id = v_ticket.active_terraform_package_id FOR UPDATE;
    IF NOT found OR v_previous_package.status <> 'blocked' THEN
      RAISE EXCEPTION 'a package retry requires the current package to be blocked' USING ERRCODE = '40001';
    END IF;
  END IF;
  SELECT coalesce(max(package_revision), 0) + 1 INTO v_package_revision FROM public.iac_ticket_terraform_packages WHERE ticket_id = p_ticket_id;
  INSERT INTO public.iac_ticket_terraform_packages (ticket_id, engineering_gap_id, parent_package_id, package_revision, generation_idempotency_key, generation_request_sha256, repository, module_source, branch_name, package_manifest, package_sha256, requirement_traceability)
  VALUES (p_ticket_id, v_gap.id, v_previous_package.id, v_package_revision, p_idempotency_key, v_request_sha256, btrim(p_package->>'repository'), btrim(p_package->>'moduleSource'), btrim(p_package->>'branchName'), public.canonical_servicenow_terraform_manifest(p_package->'packageManifest'), p_package->>'packageSha256', coalesce(p_package->'requirementTraceability', '{}'::jsonb))
  RETURNING * INTO v_package;
  IF v_previous_package.id IS NOT NULL THEN
    UPDATE public.iac_ticket_terraform_packages SET status = 'superseded' WHERE id = v_previous_package.id;
  END IF;
  INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, source_event_id, expected_version, actor, idempotency_key)
  VALUES (p_ticket_id, 'GAP_CREATED', 'PACKAGE_GENERATED', 'terraform_package_recorded', p_source_event_id, p_expected_version, p_actor, p_idempotency_key);
  PERFORM set_config('app.servicenow_agent_transition', 'on', true);
  UPDATE public.servicenow_intake_tickets SET active_terraform_package_id = v_package.id,
    workflow_state = 'PACKAGE_GENERATED', workflow_version = workflow_version + 1, updated_at = now()
  WHERE id = p_ticket_id RETURNING * INTO v_ticket;
  RETURN jsonb_build_object('id', v_package.id, 'ticketId', p_ticket_id, 'packageRevision', v_package.package_revision, 'workflowVersion', v_ticket.workflow_version);
END;
$package$;

CREATE OR REPLACE FUNCTION public.is_allowed_servicenow_static_validation_command(p_command text)
RETURNS boolean LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = '' AS $validation_command$
  SELECT lower(btrim(coalesce(p_command, ''))) ~
    '^(terraform[[:space:]]+fmt[[:space:]]+-check([[:space:]]+[-a-z0-9=._/]+)*|terraform[[:space:]]+validate([[:space:]]+[-a-z0-9=._/]+)*|tflint([[:space:]]+[-a-z0-9=._/]+)*|checkov([[:space:]]+[-a-z0-9=._/]+)*|trivy[[:space:]]+config([[:space:]]+[-a-z0-9=._/]+)*|secret[[:space:]]+scan|repository[[:space:]]+unit[[:space:]]+test|policy[[:space:]]+check)$';
$validation_command$;

-- Only a failed static validation can reopen the package stage. The failed
-- package remains immutable evidence and becomes the parent of the next
-- revision when record_servicenow_ticket_terraform_package runs.
CREATE OR REPLACE FUNCTION public.retry_servicenow_ticket_terraform_package(
  p_ticket_id uuid, p_expected_version bigint, p_reason_code text,
  p_idempotency_key text, p_actor text, p_source_event_id uuid DEFAULT NULL
) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $retry_package$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_package public.iac_ticket_terraform_packages;
  v_transition public.servicenow_intake_workflow_transitions;
  v_new_version bigint;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF length(btrim(coalesce(p_reason_code, ''))) = 0 OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0 THEN
    RAISE EXCEPTION 'package retry identity is required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_transition FROM public.servicenow_intake_workflow_transitions WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_transition.from_state <> 'BLOCKED' OR v_transition.to_state <> 'GAP_CREATED'
      OR v_transition.expected_version <> p_expected_version OR v_transition.reason_code <> p_reason_code
      OR v_transition.actor IS DISTINCT FROM p_actor OR v_transition.source_event_id IS DISTINCT FROM p_source_event_id THEN
      RAISE EXCEPTION 'idempotency key was reused with different package retry data' USING ERRCODE = '22023';
    END IF;
    RETURN v_ticket.workflow_version;
  END IF;
  IF v_ticket.workflow_version <> p_expected_version OR v_ticket.workflow_state <> 'BLOCKED'
    OR v_ticket.active_terraform_package_id IS NULL THEN
    RAISE EXCEPTION 'ticket is not ready for a package retry' USING ERRCODE = '40001';
  END IF;
  SELECT * INTO v_package FROM public.iac_ticket_terraform_packages
  WHERE ticket_id = p_ticket_id AND id = v_ticket.active_terraform_package_id FOR UPDATE;
  IF NOT found OR v_package.status <> 'blocked'
    OR NOT EXISTS (SELECT 1 FROM public.iac_ticket_static_validation_runs r
      WHERE r.ticket_id = p_ticket_id AND r.package_id = v_package.id AND r.outcome IN ('failed','blocked')) THEN
    RAISE EXCEPTION 'the active package is not blocked by static validation evidence' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, source_event_id, expected_version, actor, idempotency_key)
  VALUES (p_ticket_id, 'BLOCKED', 'GAP_CREATED', btrim(p_reason_code), p_source_event_id, p_expected_version, p_actor, p_idempotency_key);
  PERFORM set_config('app.servicenow_agent_transition', 'on', true);
  UPDATE public.servicenow_intake_tickets SET workflow_state = 'GAP_CREATED', workflow_version = workflow_version + 1, updated_at = now()
  WHERE id = p_ticket_id RETURNING workflow_version INTO v_new_version;
  RETURN v_new_version;
END;
$retry_package$;

CREATE OR REPLACE FUNCTION public.record_servicenow_ticket_static_validation(
  p_ticket_id uuid, p_expected_version bigint, p_validation jsonb,
  p_idempotency_key text, p_actor text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $validation$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_package public.iac_ticket_terraform_packages;
  v_gap public.iac_ticket_engineering_gaps;
  v_run public.iac_ticket_static_validation_runs;
  v_to_state text;
  v_package_id uuid;
  v_request_sha256 text;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF jsonb_typeof(p_validation) <> 'object' OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0
    OR length(btrim(coalesce(p_validation->>'validator', ''))) = 0 OR length(btrim(coalesce(p_validation->>'commandName', ''))) = 0
    OR coalesce(p_validation->>'outcome', '') NOT IN ('passed','failed','blocked') OR coalesce(p_validation->>'packageSha256', '') !~ '^[0-9a-f]{64}$'
    OR coalesce(p_validation->>'packageId', '') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    OR NOT public.is_allowed_servicenow_static_validation_command(p_validation->>'commandName') THEN
    RAISE EXCEPTION 'validation command is not an approved non-deploying static validation' USING ERRCODE = '22023';
  END IF;
  v_package_id := (p_validation->>'packageId')::uuid;
  v_request_sha256 := public.servicenow_agent_json_sha256(p_validation);
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_run FROM public.iac_ticket_static_validation_runs WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_run.request_sha256 IS DISTINCT FROM v_request_sha256 OR v_run.actor IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION 'idempotency key was reused with different validation data' USING ERRCODE = '22023';
    END IF;
    RETURN jsonb_build_object('id', v_run.id, 'ticketId', p_ticket_id, 'packageId', v_run.package_id, 'workflowVersion', v_ticket.workflow_version, 'outcome', v_run.outcome);
  END IF;
  IF v_ticket.workflow_version <> p_expected_version OR v_ticket.workflow_state <> 'PACKAGE_GENERATED' THEN RAISE EXCEPTION 'ticket is not ready for static validation' USING ERRCODE = '40001'; END IF;
  IF v_ticket.active_terraform_package_id IS DISTINCT FROM v_package_id THEN
    RAISE EXCEPTION 'validation must name the active governed package revision' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_package FROM public.iac_ticket_terraform_packages WHERE ticket_id = p_ticket_id AND id = v_package_id FOR UPDATE;
  IF NOT found OR v_package.status <> 'generated' OR v_package.package_sha256 <> p_validation->>'packageSha256' THEN
    RAISE EXCEPTION 'validation package does not match the active governed package' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_gap FROM public.iac_ticket_engineering_gaps WHERE ticket_id = p_ticket_id AND id = v_package.engineering_gap_id FOR SHARE;
  IF NOT found OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_gap.validation_requirements) AS requirements(requirement)
    WHERE public.servicenow_validation_requirement_command(requirement) IS NULL
      OR NOT public.is_allowed_servicenow_static_validation_command(public.servicenow_validation_requirement_command(requirement))
  ) THEN
    RAISE EXCEPTION 'governed gap contains an invalid static validation requirement' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.iac_ticket_static_validation_runs (ticket_id, package_id, validator, command_name, outcome, package_sha256, redacted_summary, actor, idempotency_key, request_sha256)
  VALUES (p_ticket_id, v_package.id, btrim(p_validation->>'validator'), lower(btrim(p_validation->>'commandName')), p_validation->>'outcome', p_validation->>'packageSha256', coalesce(public.redact_servicenow_agent_jsonb(to_jsonb(p_validation->>'redactedSummary')) #>> '{}', ''), btrim(p_actor), p_idempotency_key, v_request_sha256)
  RETURNING * INTO v_run;
  IF v_run.outcome = 'failed' OR v_run.outcome = 'blocked' THEN
    v_to_state := 'BLOCKED';
    UPDATE public.iac_ticket_terraform_packages SET status = 'blocked' WHERE id = v_package.id;
  ELSIF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_gap.validation_requirements) AS requirements(requirement)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.iac_ticket_static_validation_runs r
      WHERE r.ticket_id = p_ticket_id AND r.package_id = v_package.id AND r.outcome = 'passed'
        AND lower(btrim(r.command_name)) = public.servicenow_validation_requirement_command(requirement)
    )
  ) AND NOT EXISTS (
    SELECT 1 FROM public.iac_ticket_static_validation_runs r
    WHERE r.ticket_id = p_ticket_id AND r.package_id = v_package.id AND r.outcome <> 'passed'
  ) THEN
    v_to_state := 'PACKAGE_VALIDATED';
    UPDATE public.iac_ticket_terraform_packages SET status = 'validated' WHERE id = v_package.id;
  ELSE
    RETURN jsonb_build_object('id', v_run.id, 'ticketId', p_ticket_id, 'packageId', v_package.id, 'workflowVersion', v_ticket.workflow_version, 'outcome', v_run.outcome);
  END IF;
  INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, expected_version, actor, idempotency_key)
  VALUES (p_ticket_id, 'PACKAGE_GENERATED', v_to_state, CASE WHEN v_to_state = 'PACKAGE_VALIDATED' THEN 'static_validation_attested' ELSE 'static_validation_failed' END, p_expected_version, p_actor, 'validation-transition:' || p_idempotency_key);
  PERFORM set_config('app.servicenow_agent_transition', 'on', true);
  UPDATE public.servicenow_intake_tickets SET workflow_state = v_to_state, workflow_version = workflow_version + 1, updated_at = now() WHERE id = p_ticket_id RETURNING * INTO v_ticket;
  RETURN jsonb_build_object('id', v_run.id, 'ticketId', p_ticket_id, 'packageId', v_package.id, 'workflowVersion', v_ticket.workflow_version, 'outcome', v_run.outcome);
END;
$validation$;

CREATE OR REPLACE FUNCTION public.record_servicenow_ticket_github_observation(
  p_ticket_id uuid, p_observation jsonb, p_idempotency_key text, p_actor text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $github_observation$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_package public.iac_ticket_terraform_packages;
  v_observation public.iac_ticket_github_commit_observations;
  v_package_id uuid;
  v_observed_manifest_sha256 text;
  v_request_sha256 text;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF jsonb_typeof(p_observation) <> 'object' OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0
    OR coalesce(p_observation->>'packageId', '') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    OR coalesce(p_observation->>'repository', '') !~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'
    OR coalesce(p_observation->>'pullNumber', '') !~ '^[1-9][0-9]*$'
    OR coalesce(p_observation->>'pullUrl', '') !~ '^https://[^[:space:]]+$'
    OR length(btrim(coalesce(p_observation->>'headRef', ''))) = 0
    OR coalesce(p_observation->>'headSha', '') !~ '^[0-9a-f]{40}$'
    OR coalesce(p_observation->>'treeSha', '') !~ '^[0-9a-f]{40}$'
    OR coalesce(p_observation->>'verificationStatus', '') NOT IN ('verified','mismatch','unavailable')
    OR coalesce(p_observation->'isDraft', 'false'::jsonb) <> 'true'::jsonb
    OR jsonb_typeof(coalesce(p_observation->'redactedEvidence', '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'a complete GitHub draft-PR observation is required' USING ERRCODE = '22023';
  END IF;
  v_package_id := (p_observation->>'packageId')::uuid;
  v_request_sha256 := public.servicenow_agent_json_sha256(p_observation);
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_observation FROM public.iac_ticket_github_commit_observations
  WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_observation.request_sha256 IS DISTINCT FROM v_request_sha256 OR v_observation.actor IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION 'idempotency key was reused with different GitHub observation data' USING ERRCODE = '22023';
    END IF;
    RETURN jsonb_build_object('id', v_observation.id, 'ticketId', p_ticket_id, 'packageId', v_observation.package_id, 'verificationStatus', v_observation.verification_status);
  END IF;
  IF v_ticket.workflow_state NOT IN ('PACKAGE_VALIDATED', 'DRAFT_PR_CREATED') OR v_ticket.active_terraform_package_id IS DISTINCT FROM v_package_id THEN
    RAISE EXCEPTION 'GitHub evidence must name the active validated package or its recorded draft PR' USING ERRCODE = '40001';
  END IF;
  SELECT * INTO v_package FROM public.iac_ticket_terraform_packages WHERE ticket_id = p_ticket_id AND id = v_package_id FOR SHARE;
  IF NOT found OR v_package.status <> 'validated' OR v_package.repository IS DISTINCT FROM btrim(p_observation->>'repository') THEN
    RAISE EXCEPTION 'GitHub evidence does not match the active validated package' USING ERRCODE = '22023';
  END IF;
  IF lower(btrim(p_observation->>'pullUrl')) <> lower('https://github.com/' || btrim(p_observation->>'repository') || '/pull/' || p_observation->>'pullNumber') THEN
    RAISE EXCEPTION 'GitHub pull URL does not match the observed repository and pull number' USING ERRCODE = '22023';
  END IF;
  IF public.is_valid_servicenow_terraform_manifest(p_observation->'observedManifest') THEN
    v_observed_manifest_sha256 := public.servicenow_terraform_manifest_sha256(p_observation->'observedManifest');
  END IF;
  IF p_observation->>'verificationStatus' = 'verified' AND (
    v_observed_manifest_sha256 IS NULL OR v_observed_manifest_sha256 <> v_package.package_sha256
    OR btrim(p_observation->>'headRef') <> v_package.branch_name
  ) THEN
    RAISE EXCEPTION 'verified GitHub evidence does not reproduce the exact governed package manifest and draft branch' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.iac_ticket_github_commit_observations (
    ticket_id, package_id, repository, pull_number, pull_url, head_ref, head_sha, tree_sha,
    observed_manifest, expected_package_sha256, observed_manifest_sha256, verification_status,
    redacted_evidence, actor, idempotency_key, request_sha256
  ) VALUES (
    p_ticket_id, v_package.id, btrim(p_observation->>'repository'), (p_observation->>'pullNumber')::bigint,
    p_observation->>'pullUrl', btrim(p_observation->>'headRef'), p_observation->>'headSha', p_observation->>'treeSha',
    CASE WHEN v_observed_manifest_sha256 IS NULL THEN '[]'::jsonb ELSE public.canonical_servicenow_terraform_manifest(p_observation->'observedManifest') END,
    v_package.package_sha256, v_observed_manifest_sha256, p_observation->>'verificationStatus',
    public.redact_servicenow_agent_jsonb(coalesce(p_observation->'redactedEvidence', '{}'::jsonb)), btrim(p_actor), p_idempotency_key, v_request_sha256
  ) RETURNING * INTO v_observation;
  RETURN jsonb_build_object('id', v_observation.id, 'ticketId', p_ticket_id, 'packageId', v_observation.package_id, 'verificationStatus', v_observation.verification_status);
END;
$github_observation$;

CREATE OR REPLACE FUNCTION public.record_servicenow_ticket_draft_pr(
  p_ticket_id uuid, p_expected_version bigint, p_pr jsonb,
  p_idempotency_key text, p_actor text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $draft_pr$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_package public.iac_ticket_terraform_packages;
  v_observation public.iac_ticket_github_commit_observations;
  v_pr public.iac_ticket_draft_pull_requests;
  v_package_id uuid;
  v_observation_id uuid;
  v_attempt_number integer;
  v_request_sha256 text;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF jsonb_typeof(p_pr) <> 'object' OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0
    OR length(btrim(coalesce(p_pr->>'repository', ''))) = 0 OR coalesce(p_pr->>'pullNumber', '') !~ '^[1-9][0-9]*$'
    OR coalesce(p_pr->>'pullUrl', '') !~ '^https://[^[:space:]]+$' OR coalesce(p_pr->>'headSha', '') !~ '^[0-9a-f]{40}$'
    OR coalesce(p_pr->>'treeSha', '') !~ '^[0-9a-f]{40}$' OR coalesce(p_pr->>'packageSha256', '') !~ '^[0-9a-f]{64}$'
    OR coalesce(p_pr->>'packageId', '') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    OR coalesce(p_pr->>'githubObservationId', '') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    OR coalesce(p_pr->'isDraft', 'false'::jsonb) <> 'true'::jsonb THEN
    RAISE EXCEPTION 'a complete draft-only pull request record is required' USING ERRCODE = '22023';
  END IF;
  v_package_id := (p_pr->>'packageId')::uuid;
  v_observation_id := (p_pr->>'githubObservationId')::uuid;
  v_request_sha256 := public.servicenow_agent_json_sha256(p_pr);
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_pr FROM public.iac_ticket_draft_pull_requests WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_pr.request_sha256 IS DISTINCT FROM v_request_sha256 OR v_pr.actor IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION 'idempotency key was reused with different draft PR data' USING ERRCODE = '22023';
    END IF;
    RETURN jsonb_build_object('id', v_pr.id, 'ticketId', p_ticket_id, 'packageId', v_pr.package_id, 'workflowVersion', v_ticket.workflow_version, 'pullNumber', v_pr.pull_number);
  END IF;
  IF v_ticket.workflow_version <> p_expected_version OR v_ticket.workflow_state <> 'PACKAGE_VALIDATED' THEN RAISE EXCEPTION 'ticket is not ready for draft PR creation' USING ERRCODE = '40001'; END IF;
  IF v_ticket.active_terraform_package_id IS DISTINCT FROM v_package_id THEN
    RAISE EXCEPTION 'draft PR must name the active governed package revision' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_package FROM public.iac_ticket_terraform_packages WHERE ticket_id = p_ticket_id AND id = v_package_id FOR UPDATE;
  IF NOT found OR v_package.status <> 'validated' OR v_package.repository <> btrim(p_pr->>'repository')
    OR v_package.package_sha256 <> p_pr->>'packageSha256'
    OR NOT EXISTS (SELECT 1 FROM public.iac_ticket_static_validation_runs WHERE ticket_id = p_ticket_id AND package_id = v_package.id AND outcome = 'passed')
    OR EXISTS (SELECT 1 FROM public.iac_ticket_static_validation_runs WHERE ticket_id = p_ticket_id AND package_id = v_package.id AND outcome <> 'passed') THEN
    RAISE EXCEPTION 'a matching package with passing static validation is required before a draft PR' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_observation FROM public.iac_ticket_github_commit_observations
  WHERE ticket_id = p_ticket_id AND id = v_observation_id FOR SHARE;
  IF NOT found OR v_observation.package_id <> v_package.id OR v_observation.verification_status <> 'verified'
    OR v_observation.repository <> v_package.repository OR v_observation.pull_number <> (p_pr->>'pullNumber')::bigint
    OR v_observation.pull_url <> p_pr->>'pullUrl' OR v_observation.head_ref <> v_package.branch_name
    OR v_observation.head_sha <> p_pr->>'headSha' OR v_observation.tree_sha <> p_pr->>'treeSha'
    OR v_observation.expected_package_sha256 <> v_package.package_sha256
    OR v_observation.observed_manifest_sha256 IS DISTINCT FROM v_package.package_sha256 THEN
    RAISE EXCEPTION 'verified immutable GitHub head/tree evidence is required before recording a draft PR' USING ERRCODE = '22023';
  END IF;
  IF lower(btrim(p_pr->>'pullUrl')) <> lower('https://github.com/' || btrim(p_pr->>'repository') || '/pull/' || p_pr->>'pullNumber') THEN
    RAISE EXCEPTION 'draft PR URL does not match its repository and pull number' USING ERRCODE = '22023';
  END IF;
  SELECT coalesce(max(attempt_number), 0) + 1 INTO v_attempt_number FROM public.iac_ticket_draft_pull_requests WHERE ticket_id = p_ticket_id;
  INSERT INTO public.iac_ticket_draft_pull_requests (ticket_id, package_id, github_observation_id, attempt_number, repository, pull_number, pull_url, head_sha, tree_sha, package_sha256, is_draft, actor, idempotency_key, request_sha256)
  VALUES (p_ticket_id, v_package.id, v_observation.id, v_attempt_number, btrim(p_pr->>'repository'), (p_pr->>'pullNumber')::bigint, p_pr->>'pullUrl', p_pr->>'headSha', p_pr->>'treeSha', v_package.package_sha256, true, btrim(p_actor), p_idempotency_key, v_request_sha256)
  RETURNING * INTO v_pr;
  INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, expected_version, actor, idempotency_key)
  VALUES (p_ticket_id, 'PACKAGE_VALIDATED', 'DRAFT_PR_CREATED', 'draft_pr_created', p_expected_version, p_actor, p_idempotency_key);
  PERFORM set_config('app.servicenow_agent_transition', 'on', true);
  UPDATE public.servicenow_intake_tickets SET workflow_state = 'DRAFT_PR_CREATED', workflow_version = workflow_version + 1, updated_at = now() WHERE id = p_ticket_id RETURNING * INTO v_ticket;
  RETURN jsonb_build_object('id', v_pr.id, 'ticketId', p_ticket_id, 'packageId', v_package.id, 'workflowVersion', v_ticket.workflow_version, 'pullNumber', v_pr.pull_number);
END;
$draft_pr$;

CREATE OR REPLACE FUNCTION public.complete_servicenow_ticket_handoff(
  p_ticket_id uuid, p_expected_version bigint, p_idempotency_key text, p_actor text
) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $handoff$
DECLARE v_ticket public.servicenow_intake_tickets; v_pr public.iac_ticket_draft_pull_requests; v_transition public.servicenow_intake_workflow_transitions; v_new_version bigint;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF length(btrim(coalesce(p_idempotency_key, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0 THEN RAISE EXCEPTION 'handoff identity is required' USING ERRCODE = '22023'; END IF;
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_transition FROM public.servicenow_intake_workflow_transitions WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN RETURN v_ticket.workflow_version; END IF;
  IF v_ticket.workflow_version <> p_expected_version OR v_ticket.workflow_state <> 'DRAFT_PR_CREATED' THEN RAISE EXCEPTION 'ticket is not ready for handoff' USING ERRCODE = '40001'; END IF;
  SELECT * INTO v_pr FROM public.iac_ticket_draft_pull_requests WHERE ticket_id = p_ticket_id;
  IF NOT found OR NOT v_pr.is_draft THEN RAISE EXCEPTION 'draft PR is missing' USING ERRCODE = '23503'; END IF;
  INSERT INTO public.servicenow_intake_workflow_transitions (ticket_id, from_state, to_state, reason_code, expected_version, actor, idempotency_key)
  VALUES (p_ticket_id, 'DRAFT_PR_CREATED', 'HANDOFF_COMPLETE', 'human_review_handoff', p_expected_version, p_actor, p_idempotency_key);
  PERFORM set_config('app.servicenow_agent_transition', 'on', true);
  UPDATE public.servicenow_intake_tickets SET workflow_state = 'HANDOFF_COMPLETE', workflow_version = workflow_version + 1, updated_at = now() WHERE id = p_ticket_id RETURNING workflow_version INTO v_new_version;
  RETURN v_new_version;
END;
$handoff$;

REVOKE ALL ON FUNCTION public.redact_servicenow_agent_jsonb(jsonb, integer), public.assert_servicenow_agent_service_role(), public.ingest_servicenow_ticket_snapshot(text, text, uuid, text, timestamptz, jsonb, jsonb, text), public.transition_servicenow_intake_ticket(uuid, bigint, text, text, text, text, uuid), public.create_servicenow_ticket_engineering_gap(uuid, bigint, jsonb, text, text, uuid), public.record_servicenow_ticket_terraform_package(uuid, bigint, jsonb, text, text, uuid), public.is_allowed_servicenow_static_validation_command(text), public.record_servicenow_ticket_static_validation(uuid, bigint, jsonb, text, text), public.record_servicenow_ticket_draft_pr(uuid, bigint, jsonb, text, text), public.complete_servicenow_ticket_handoff(uuid, bigint, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redact_servicenow_agent_jsonb(jsonb, integer), public.assert_servicenow_agent_service_role(), public.ingest_servicenow_ticket_snapshot(text, text, uuid, text, timestamptz, jsonb, jsonb, text), public.transition_servicenow_intake_ticket(uuid, bigint, text, text, text, text, uuid), public.create_servicenow_ticket_engineering_gap(uuid, bigint, jsonb, text, text, uuid), public.record_servicenow_ticket_terraform_package(uuid, bigint, jsonb, text, text, uuid), public.is_allowed_servicenow_static_validation_command(text), public.record_servicenow_ticket_static_validation(uuid, bigint, jsonb, text, text), public.record_servicenow_ticket_draft_pr(uuid, bigint, jsonb, text, text), public.complete_servicenow_ticket_handoff(uuid, bigint, text, text) TO service_role;
