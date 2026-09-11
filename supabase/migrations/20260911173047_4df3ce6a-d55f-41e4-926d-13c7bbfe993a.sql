CREATE TABLE public.servicenow_intake_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL CHECK (length(btrim(ticket_number)) > 0),
  ticket_key text GENERATED ALWAYS AS (lower(btrim(ticket_number))) STORED,
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