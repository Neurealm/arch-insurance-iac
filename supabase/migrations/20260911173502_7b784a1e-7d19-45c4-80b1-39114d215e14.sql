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
  v_redacted_payload := public.redact_servicenow_agent_jsonb(coalesce(p_redacted_payload, '{}'::jsonb));
  v_redacted_fields := public.redact_servicenow_agent_jsonb(coalesce(p_canonical_structured_fields, '{}'::jsonb));

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