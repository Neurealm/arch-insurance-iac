-- ingest_servicenow_ticket_snapshot's RETURNS TABLE names (ticket_id,
-- snapshot_id, inserted, workflow_version, identity_conflict) collide with
-- real column names on the tables the function writes to. PL/pgSQL exposes
-- OUT parameters as implicit variables, so every bare reference to one of
-- these names anywhere in the function body -- the ON CONFLICT (ticket_id, ...)
-- target list, the WHERE ticket_id = ... lookup, the workflow_version =
-- workflow_version + 1 update -- became genuinely ambiguous between "the
-- table column" and "the OUT parameter", and Postgres correctly refused to
-- guess ("column reference \"ticket_id\" is ambiguous"), breaking every
-- ticket submission.
--
-- The function's body never reads or assigns these names as scalar
-- variables (it returns via explicit RETURN QUERY SELECT, using its own
-- v_-prefixed locals throughout), so #variable_conflict use_column is exactly
-- correct here: it tells PL/pgSQL to always resolve a bare, ambiguous name to
-- the table column rather than the OUT parameter, with no behavioral change
-- versus what the function already intended.
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
#variable_conflict use_column
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
