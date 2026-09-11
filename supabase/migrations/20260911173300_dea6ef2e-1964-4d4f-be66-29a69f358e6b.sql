CREATE UNIQUE INDEX iac_policy_rules_one_active_version ON public.iac_policy_rules(rule_code) WHERE active;

CREATE OR REPLACE FUNCTION public.prevent_servicenow_agent_history_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $append_only$
BEGIN
  RAISE EXCEPTION 'ServiceNow Terraform Change Agent history is append-only';
END;
$append_only$;

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

ALTER TABLE public.servicenow_intake_requests ADD COLUMN IF NOT EXISTS ticket_id uuid REFERENCES public.servicenow_intake_tickets(id) ON DELETE RESTRICT;
ALTER TABLE public.servicenow_intake_requests DROP CONSTRAINT IF EXISTS servicenow_intake_requests_status_check;
ALTER TABLE public.servicenow_intake_requests ADD CONSTRAINT servicenow_intake_requests_status_check
  CHECK (status = ANY (ARRAY[
    'received', 'analyzing', 'needs_clarification', 'ready_for_engineering',
    'engineering_gap_opened', 'comment_posted', 'comment_failed',
    'demo_comment_generated', 'identity_conflict', 'failed'
  ]));

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
  IF coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Service caller required' USING ERRCODE = '42501';
  END IF;
END;
$service_role$;