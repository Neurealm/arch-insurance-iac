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