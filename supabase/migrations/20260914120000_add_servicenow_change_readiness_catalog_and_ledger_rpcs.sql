-- ServiceNow Change Readiness Agent -- closes the write gap in the ticket
-- ledger/catalog foundation (20260911173047 and siblings). Every table this
-- migration writes to already exists, RLS-locked with SELECT-only granted to
-- service_role (deliberately, so no service-side bug can bypass provenance
-- or the workflow state machine with raw table DML). This migration adds
-- only the SECURITY DEFINER RPCs needed to actually populate them, following
-- the exact idempotency-key-against-iac_servicenow_tool_audit_events pattern
-- every existing RPC in this family already uses. No existing table,
-- trigger, RLS policy, or grant is altered.
--
-- Two structural gaps this closes:
--   1. iac_request_schemas/iac_policy_rules had activation RPCs but no way
--      to insert a new version at all (confirmed: zero INSERT grant to any
--      role, and the activate_* RPCs require the row to already exist).
--   2. servicenow_intake_facts/_requirement_revisions/_question_registry
--      have zero producers anywhere, including in the original migration's
--      own backfill -- complete_servicenow_ticket_request reads
--      _requirement_revisions to gate ticket completion, but nothing has
--      ever written to it, so that RPC could never succeed.

-- ---------------------------------------------------------------------------
-- 1. Catalog version authoring (schema/policy content stays immutable once
--    inserted; only activation, via the existing activate_* RPCs, is mutable)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_servicenow_request_schema_version(
  p_request_type text, p_schema jsonb, p_actor text, p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $create_schema_version$
DECLARE
  v_request_type text;
  v_next_version integer;
  v_row public.iac_request_schemas;
  v_existing public.iac_servicenow_tool_audit_events;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  v_request_type := lower(btrim(coalesce(p_request_type, '')));
  IF length(v_request_type) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0 OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 THEN
    RAISE EXCEPTION 'request schema version identity is required' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(p_schema) <> 'object'
    OR jsonb_typeof(coalesce(p_schema->'requiredFields', '[]'::jsonb)) <> 'array'
    OR jsonb_typeof(coalesce(p_schema->'requiredApprovals', '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'request schema must be an object with array requiredFields/requiredApprovals' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_existing FROM public.iac_servicenow_tool_audit_events WHERE idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_existing.tool_name <> 'request_schema_registry' OR v_existing.operation <> 'create_version'
      OR v_existing.redacted_detail->>'requestType' IS DISTINCT FROM v_request_type
      OR v_existing.redacted_detail->'schema' IS DISTINCT FROM p_schema THEN
      RAISE EXCEPTION 'idempotency key was reused with different schema version data' USING ERRCODE = '22023';
    END IF;
    RETURN v_existing.redacted_detail;
  END IF;
  -- Serializes concurrent "create the next version" calls for the same
  -- request_type so two callers can never both compute the same next version.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('servicenow-request-schema:' || v_request_type, 0));
  SELECT coalesce(max(version), 0) + 1 INTO v_next_version FROM public.iac_request_schemas WHERE lower(btrim(request_type)) = v_request_type;
  INSERT INTO public.iac_request_schemas (request_type, version, schema, active)
  VALUES (v_request_type, v_next_version, p_schema, false)
  RETURNING * INTO v_row;
  INSERT INTO public.iac_servicenow_tool_audit_events (tool_name, operation, outcome, redacted_detail, idempotency_key)
  VALUES ('request_schema_registry', 'create_version', 'succeeded',
    jsonb_build_object('schemaId', v_row.id, 'requestType', v_row.request_type, 'version', v_row.version, 'schema', p_schema, 'actor', btrim(p_actor)),
    p_idempotency_key);
  RETURN jsonb_build_object('schemaId', v_row.id, 'requestType', v_row.request_type, 'version', v_row.version);
END;
$create_schema_version$;

CREATE OR REPLACE FUNCTION public.create_servicenow_policy_rule_version(
  p_rule_code text, p_request_type text, p_rule jsonb, p_actor text, p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $create_rule_version$
DECLARE
  v_rule_code text;
  v_next_version integer;
  v_row public.iac_policy_rules;
  v_existing public.iac_servicenow_tool_audit_events;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  v_rule_code := lower(btrim(coalesce(p_rule_code, '')));
  IF length(v_rule_code) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0 OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 THEN
    RAISE EXCEPTION 'policy rule version identity is required' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(p_rule) <> 'object' THEN RAISE EXCEPTION 'policy rule must be an object' USING ERRCODE = '22023'; END IF;
  SELECT * INTO v_existing FROM public.iac_servicenow_tool_audit_events WHERE idempotency_key = p_idempotency_key;
  IF found THEN
    IF v_existing.tool_name <> 'policy_rule_registry' OR v_existing.operation <> 'create_version'
      OR v_existing.redacted_detail->>'ruleCode' IS DISTINCT FROM v_rule_code
      OR v_existing.redacted_detail->'rule' IS DISTINCT FROM p_rule THEN
      RAISE EXCEPTION 'idempotency key was reused with different policy rule version data' USING ERRCODE = '22023';
    END IF;
    RETURN v_existing.redacted_detail;
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('servicenow-policy-rule:' || v_rule_code, 0));
  SELECT coalesce(max(version), 0) + 1 INTO v_next_version FROM public.iac_policy_rules WHERE lower(btrim(rule_code)) = v_rule_code;
  INSERT INTO public.iac_policy_rules (rule_code, request_type, version, rule, active)
  VALUES (v_rule_code, nullif(btrim(p_request_type), ''), v_next_version, p_rule, false)
  RETURNING * INTO v_row;
  INSERT INTO public.iac_servicenow_tool_audit_events (tool_name, operation, outcome, redacted_detail, idempotency_key)
  VALUES ('policy_rule_registry', 'create_version', 'succeeded',
    jsonb_build_object('policyRuleId', v_row.id, 'ruleCode', v_row.rule_code, 'version', v_row.version, 'rule', p_rule, 'actor', btrim(p_actor)),
    p_idempotency_key);
  RETURN jsonb_build_object('policyRuleId', v_row.id, 'ruleCode', v_row.rule_code, 'version', v_row.version);
END;
$create_rule_version$;

-- ---------------------------------------------------------------------------
-- 2. Ledger writers: an analysis "event" a fact batch attaches to, the facts
--    themselves, requirement revisions, and the question registry. Each
--    follows the same guarded, idempotency-keyed, actor-attributed pattern.
-- ---------------------------------------------------------------------------

-- One row per agent analysis attempt. servicenow_intake_facts.source_event_id
-- is NOT NULL, so every fact this agent ever records must reference one of
-- these -- this is the missing link the original migration's backfill only
-- ever created for legacy webhook snapshots, never for agent analysis.
CREATE OR REPLACE FUNCTION public.record_servicenow_ticket_analysis_event(
  p_ticket_id uuid, p_redacted_summary jsonb, p_content_sha256 text, p_idempotency_key text, p_actor text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $record_event$
DECLARE
  v_ticket public.servicenow_intake_tickets;
  v_existing public.servicenow_intake_ticket_events;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF coalesce(p_content_sha256, '') !~ '^[0-9a-f]{64}$' OR length(btrim(coalesce(p_idempotency_key, ''))) = 0 OR length(btrim(coalesce(p_actor, ''))) = 0 THEN
    RAISE EXCEPTION 'analysis event identity is required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_ticket FROM public.servicenow_intake_tickets WHERE id = p_ticket_id;
  IF NOT found THEN RAISE EXCEPTION 'ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_existing FROM public.servicenow_intake_ticket_events WHERE ticket_id = p_ticket_id AND idempotency_key = p_idempotency_key;
  IF found THEN RETURN v_existing.id; END IF;
  INSERT INTO public.servicenow_intake_ticket_events (ticket_id, event_type, source_type, source_author, redacted_payload, content_sha256, idempotency_key)
  VALUES (p_ticket_id, 'agent_analysis_completed', 'agent', btrim(p_actor), public.redact_servicenow_agent_jsonb(coalesce(p_redacted_summary, '{}'::jsonb)), p_content_sha256, p_idempotency_key)
  RETURNING id INTO v_existing;
  RETURN v_existing.id;
END;
$record_event$;

-- Batch fact insert against one analysis event. Idempotent by construction:
-- the table's own UNIQUE(ticket_id, source_event_id, canonical_field,
-- value_sha256) means re-submitting the same event with identical field
-- values is a genuine no-op (ON CONFLICT DO NOTHING), not a duplicate row --
-- so re-analyzing an unchanged ticket never grows this table.
-- p_facts: jsonb array of {canonicalField, value, valueType, sourceType,
--   sourceRecordId, sourceAuthor, sourceOccurredAt, supportingText,
--   confidence, validationStatus, validationCode, precedenceRank}
CREATE OR REPLACE FUNCTION public.record_servicenow_ticket_facts(
  p_ticket_id uuid, p_source_event_id uuid, p_facts jsonb, p_actor text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $record_facts$
DECLARE
  v_item jsonb;
  v_value_sha256 text;
  v_fact_id uuid;
  v_results jsonb := '[]'::jsonb;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF length(btrim(coalesce(p_actor, ''))) = 0 THEN RAISE EXCEPTION 'actor is required' USING ERRCODE = '22023'; END IF;
  IF jsonb_typeof(p_facts) <> 'array' THEN RAISE EXCEPTION 'facts must be a jsonb array' USING ERRCODE = '22023'; END IF;
  PERFORM 1 FROM public.servicenow_intake_ticket_events WHERE id = p_source_event_id AND ticket_id = p_ticket_id;
  IF NOT found THEN RAISE EXCEPTION 'analysis event does not belong to this ticket' USING ERRCODE = '22023'; END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_facts) LOOP
    IF length(btrim(coalesce(v_item->>'canonicalField', ''))) = 0 THEN CONTINUE; END IF;
    v_value_sha256 := encode(extensions.digest(convert_to((v_item->'value')::text, 'UTF8'), 'sha256'::text), 'hex');
    INSERT INTO public.servicenow_intake_facts (
      ticket_id, source_event_id, canonical_field, value_jsonb, value_type, source_type,
      source_record_id, source_author, source_occurred_at, supporting_text, confidence,
      validation_status, validation_code, precedence_rank, value_sha256
    ) VALUES (
      p_ticket_id, p_source_event_id, btrim(v_item->>'canonicalField'), v_item->'value',
      coalesce(nullif(v_item->>'valueType', ''), 'string'), coalesce(nullif(v_item->>'sourceType', ''), 'inference'),
      nullif(v_item->>'sourceRecordId', ''), nullif(v_item->>'sourceAuthor', ''),
      nullif(v_item->>'sourceOccurredAt', '')::timestamptz, coalesce(v_item->>'supportingText', ''),
      coalesce((v_item->>'confidence')::numeric, 0), coalesce(nullif(v_item->>'validationStatus', ''), 'MISSING'),
      nullif(v_item->>'validationCode', ''), coalesce((v_item->>'precedenceRank')::smallint, 6), v_value_sha256
    )
    ON CONFLICT (ticket_id, source_event_id, canonical_field, value_sha256) DO NOTHING
    RETURNING id INTO v_fact_id;
    IF v_fact_id IS NULL THEN
      SELECT id INTO v_fact_id FROM public.servicenow_intake_facts
      WHERE ticket_id = p_ticket_id AND source_event_id = p_source_event_id AND canonical_field = btrim(v_item->>'canonicalField') AND value_sha256 = v_value_sha256;
    END IF;
    v_results := v_results || jsonb_build_object('canonicalField', btrim(v_item->>'canonicalField'), 'factId', v_fact_id);
  END LOOP;
  RETURN jsonb_build_object('facts', v_results);
END;
$record_facts$;

-- Appends the next revision only when the field's state actually changed
-- from its immediately-prior revision -- reprocessing an unchanged ticket
-- must not spam new revisions, matching the append-only trigger's intent
-- (a durable history of *changes*, not a heartbeat).
-- p_revisions: jsonb array of {canonicalField, selectedFactId, fieldState, policyRuleCode, explanation}
CREATE OR REPLACE FUNCTION public.record_servicenow_requirement_revisions(
  p_ticket_id uuid, p_revisions jsonb, p_actor text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $record_revisions$
DECLARE
  v_item jsonb;
  v_field text;
  v_latest public.servicenow_intake_requirement_revisions;
  v_next_revision integer;
  v_selected_fact_id uuid;
  v_written jsonb := '[]'::jsonb;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF length(btrim(coalesce(p_actor, ''))) = 0 THEN RAISE EXCEPTION 'actor is required' USING ERRCODE = '22023'; END IF;
  IF jsonb_typeof(p_revisions) <> 'array' THEN RAISE EXCEPTION 'revisions must be a jsonb array' USING ERRCODE = '22023'; END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_revisions) LOOP
    v_field := btrim(coalesce(v_item->>'canonicalField', ''));
    IF length(v_field) = 0 THEN CONTINUE; END IF;
    v_selected_fact_id := nullif(v_item->>'selectedFactId', '')::uuid;
    SELECT * INTO v_latest FROM public.servicenow_intake_requirement_revisions
    WHERE ticket_id = p_ticket_id AND canonical_field = v_field ORDER BY revision_number DESC LIMIT 1;
    IF found AND v_latest.field_state = coalesce(v_item->>'fieldState', 'MISSING')
      AND v_latest.selected_fact_id IS NOT DISTINCT FROM v_selected_fact_id
      AND v_latest.explanation = coalesce(v_item->>'explanation', '') THEN
      CONTINUE; -- unchanged since the last revision; do not spam a new one
    END IF;
    v_next_revision := coalesce(v_latest.revision_number, 0) + 1;
    INSERT INTO public.servicenow_intake_requirement_revisions (ticket_id, canonical_field, selected_fact_id, field_state, policy_rule_code, explanation, revision_number)
    VALUES (p_ticket_id, v_field, v_selected_fact_id, coalesce(v_item->>'fieldState', 'MISSING'), nullif(v_item->>'policyRuleCode', ''), coalesce(v_item->>'explanation', ''), v_next_revision);
    v_written := v_written || jsonb_build_object('canonicalField', v_field, 'revisionNumber', v_next_revision);
  END LOOP;
  RETURN jsonb_build_object('revisions', v_written);
END;
$record_revisions$;

-- Upserts the open-question registry and appends a _question_events row only
-- on an actual status transition -- this is the durable backing for
-- shouldAskForField()'s "never re-ask an already-open-or-answered question."
-- p_questions: jsonb array of {canonicalField, semanticFingerprint, question, status, answerFactId}
CREATE OR REPLACE FUNCTION public.sync_servicenow_question_registry(
  p_ticket_id uuid, p_questions jsonb, p_actor text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $sync_questions$
DECLARE
  v_item jsonb;
  v_field text;
  v_fingerprint text;
  v_status text;
  v_answer_fact_id uuid;
  v_row public.servicenow_intake_question_registry;
  v_written jsonb := '[]'::jsonb;
BEGIN
  PERFORM public.assert_servicenow_agent_service_role();
  IF length(btrim(coalesce(p_actor, ''))) = 0 THEN RAISE EXCEPTION 'actor is required' USING ERRCODE = '22023'; END IF;
  IF jsonb_typeof(p_questions) <> 'array' THEN RAISE EXCEPTION 'questions must be a jsonb array' USING ERRCODE = '22023'; END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_questions) LOOP
    v_field := btrim(coalesce(v_item->>'canonicalField', ''));
    v_fingerprint := btrim(coalesce(v_item->>'semanticFingerprint', ''));
    v_status := coalesce(nullif(v_item->>'status', ''), 'OPEN');
    v_answer_fact_id := nullif(v_item->>'answerFactId', '')::uuid;
    IF length(v_field) = 0 OR length(v_fingerprint) < 3 THEN CONTINUE; END IF;
    SELECT * INTO v_row FROM public.servicenow_intake_question_registry
    WHERE ticket_id = p_ticket_id AND canonical_field = v_field AND semantic_fingerprint = v_fingerprint;
    IF NOT found THEN
      INSERT INTO public.servicenow_intake_question_registry (ticket_id, canonical_field, semantic_fingerprint, status, initial_question, latest_answer_fact_id, resolved_at)
      VALUES (p_ticket_id, v_field, v_fingerprint, v_status, coalesce(v_item->>'question', ''), v_answer_fact_id, CASE WHEN v_status <> 'OPEN' THEN now() END)
      RETURNING * INTO v_row;
      INSERT INTO public.servicenow_intake_question_events (ticket_id, question_id, event_type, fact_id, idempotency_key)
      VALUES (p_ticket_id, v_row.id, 'asked', v_answer_fact_id, 'asked:' || v_row.id::text);
      IF v_status <> 'OPEN' THEN
        INSERT INTO public.servicenow_intake_question_events (ticket_id, question_id, event_type, fact_id, idempotency_key)
        VALUES (p_ticket_id, v_row.id, lower(v_status), v_answer_fact_id, lower(v_status) || ':' || v_row.id::text || ':' || coalesce(v_answer_fact_id::text, 'none'));
      END IF;
    ELSIF v_row.status IS DISTINCT FROM v_status OR v_row.latest_answer_fact_id IS DISTINCT FROM v_answer_fact_id THEN
      UPDATE public.servicenow_intake_question_registry
      SET status = v_status, latest_answer_fact_id = v_answer_fact_id, resolved_at = CASE WHEN v_status <> 'OPEN' THEN now() ELSE NULL END
      WHERE id = v_row.id;
      INSERT INTO public.servicenow_intake_question_events (ticket_id, question_id, event_type, fact_id, idempotency_key)
      VALUES (p_ticket_id, v_row.id, CASE v_status WHEN 'ANSWERED' THEN 'answered' WHEN 'INVALID' THEN 'invalid_answer' WHEN 'SUPERSEDED' THEN 'superseded' ELSE 'asked' END,
        v_answer_fact_id, 'transition:' || v_row.id::text || ':' || v_status || ':' || coalesce(v_answer_fact_id::text, 'none'))
      ON CONFLICT (question_id, idempotency_key) DO NOTHING;
    END IF;
    v_written := v_written || jsonb_build_object('canonicalField', v_field, 'status', v_status);
  END LOOP;
  RETURN jsonb_build_object('questions', v_written);
END;
$sync_questions$;

-- ---------------------------------------------------------------------------
-- 3. Seed the requirement catalog: one active schema version per canonical
--    request_type. The 6 types this platform actually automates get the
--    exact field list validate() already enforces; every other type gets the
--    spec's own "generic checklist" fallback and automationSupported=false,
--    which application code uses to force the human/engineering-gap path
--    instead of attempting a governed change package it cannot validate.
-- ---------------------------------------------------------------------------

-- Seeds via raw INSERT/UPDATE, not the RPCs above: this DO block runs with
-- the migration role's privileges, which has no service_role JWT context, so
-- assert_servicenow_agent_service_role() (correctly) would reject it. This
-- mirrors 20260910235525's own historical backfill, which populates
-- servicenow_intake_tickets/_snapshots/_events via direct INSERT rather than
-- through ingest_servicenow_ticket_snapshot() for the identical reason.
DO $seed$
DECLARE
  v_common jsonb := '["requester","application","environment","maintenanceWindow","businessImpact","applicationOwner","rollbackPlan","targetVm"]'::jsonb;
  v_types text[] := ARRAY[
    'start_vm','stop_vm','restart_vm','resize_vm','increase_os_disk','create_vm',
    'container_orchestration','network_change','iam_access','database_change','storage_change',
    'application_deployment','scaling_performance','monitoring_alerting','backup_restore',
    'migration','certificate_secret','decommissioning','unknown'
  ];
  v_type text;
  v_fields jsonb;
  v_automated boolean;
  v_schema_id uuid;
BEGIN
  FOREACH v_type IN ARRAY v_types LOOP
    -- Skip re-seeding if this request_type already has any version (keeps
    -- this migration re-runnable/idempotent against a partially-seeded DB).
    IF EXISTS (SELECT 1 FROM public.iac_request_schemas WHERE request_type = v_type) THEN CONTINUE; END IF;
    v_automated := v_type IN ('start_vm','stop_vm','restart_vm','resize_vm','increase_os_disk','create_vm');
    v_fields := CASE
      WHEN v_type = 'resize_vm' THEN v_common || '["requestedVmSize"]'::jsonb
      WHEN v_type = 'increase_os_disk' THEN v_common || '["requestedOsDiskSizeGb"]'::jsonb
      WHEN v_type = 'create_vm' THEN '["requester","application","environment","businessImpact","applicationOwner","rollbackPlan","resourceGroupArmId","subnetArmId","location","vmNames","vmSize","adminUsername","sshPublicKey","osPublisher","osOffer","osSku","osVersion"]'::jsonb
      ELSE v_common
    END;
    INSERT INTO public.iac_request_schemas (request_type, version, schema, active)
    VALUES (v_type, 1, jsonb_build_object('requiredFields', v_fields, 'requiredApprovals', '[]'::jsonb, 'automationSupported', v_automated), false)
    RETURNING id INTO v_schema_id;
    PERFORM set_config('app.servicenow_agent_registry_activation', 'on', true);
    UPDATE public.iac_request_schemas SET active = true WHERE id = v_schema_id;
  END LOOP;
END;
$seed$;
