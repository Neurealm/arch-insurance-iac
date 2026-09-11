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

REVOKE ALL ON FUNCTION
  public.activate_servicenow_request_schema(uuid, text, text),
  public.activate_servicenow_policy_rule(uuid, text, text),
  public.complete_servicenow_ticket_request(uuid, bigint, uuid, text, text, uuid),
  public.retry_servicenow_ticket_terraform_package(uuid, bigint, text, text, text, uuid),
  public.record_servicenow_ticket_github_observation(uuid, jsonb, text, text),
  public.prevent_servicenow_agent_history_mutation(),
  public.enforce_iac_request_schema_immutability(),
  public.enforce_iac_policy_rule_immutability(),
  public.enforce_servicenow_ticket_header_integrity()
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.activate_servicenow_request_schema(uuid, text, text),
  public.activate_servicenow_policy_rule(uuid, text, text),
  public.complete_servicenow_ticket_request(uuid, bigint, uuid, text, text, uuid),
  public.retry_servicenow_ticket_terraform_package(uuid, bigint, text, text, text, uuid),
  public.record_servicenow_ticket_github_observation(uuid, jsonb, text, text)
TO service_role;