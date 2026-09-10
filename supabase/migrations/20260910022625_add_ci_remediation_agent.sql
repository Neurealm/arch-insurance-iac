-- Durable, bounded coordination for the CI-remediation agent. The browser may
-- ask for a check every ten seconds, but only these service-only RPCs can claim
-- or finish a repair attempt. Row locking prevents two open tabs from pushing
-- competing commits for the same failed head.
ALTER TABLE public.iac_engineering_gaps
  ADD COLUMN remediation_status text NOT NULL DEFAULT 'idle' CHECK (remediation_status IN (
    'idle', 'running', 'waiting_ci', 'succeeded', 'failed', 'exhausted'
  )),
  ADD COLUMN remediation_attempts integer NOT NULL DEFAULT 0 CHECK (remediation_attempts BETWEEN 0 AND 3),
  ADD COLUMN remediation_head_sha text CHECK (remediation_head_sha IS NULL OR remediation_head_sha ~ '^[0-9a-f]{40}$'),
  ADD COLUMN remediation_updated_at timestamptz;

CREATE FUNCTION public.claim_iac_ci_remediation(
  p_gap_id uuid,
  p_expected_version bigint,
  p_expected_head_sha text,
  p_max_attempts integer DEFAULT 3
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  g public.iac_engineering_gaps;
  c public.iac_automation_capabilities;
  next_attempt integer;
  expected_module text;
  expected_branch text;
BEGIN
  IF current_user <> 'service_role' THEN
    RAISE EXCEPTION 'Service caller required' USING ERRCODE = '42501';
  END IF;
  IF p_expected_head_sha !~ '^[0-9a-f]{40}$' OR p_max_attempts <> 3 THEN
    RAISE EXCEPTION 'Invalid remediation claim' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO g FROM public.iac_engineering_gaps WHERE id = p_gap_id FOR UPDATE;
  IF NOT FOUND OR g.ci_version <> p_expected_version OR g.status <> 'ci_failed'
    OR g.ci_status <> 'failed' OR g.ci_head_sha IS DISTINCT FROM p_expected_head_sha
    OR g.ci_evidence->>'headSha' IS DISTINCT FROM p_expected_head_sha THEN
    RAISE EXCEPTION 'Failed CI evidence changed; synchronize again' USING ERRCODE = '40001';
  END IF;

  SELECT * INTO c FROM public.iac_automation_capabilities WHERE id = g.linked_capability_id FOR SHARE;
  expected_module := CASE
    WHEN g.action_type = 'increase_os_disk' THEN 'terraform/modules/vm-os-disk-expand'
    WHEN g.action_type = 'create_vm'
      AND c.module_source ~ '^terraform/modules/[a-z][a-z0-9-]{2,39}$'
      AND split_part(c.module_source, '/', 3) NOT IN ('vm-action', 'vm-resize', 'resize-vm-managed-disk', 'vm-os-disk-expand')
      THEN c.module_source
    ELSE NULL
  END;
  expected_branch := CASE WHEN expected_module IS NOT NULL
    THEN 'ai-draft/' || split_part(expected_module, '/', 3) || '-' || left(g.id::text, 8)
    ELSE NULL
  END;
  IF NOT FOUND OR c.lifecycle_status NOT IN ('draft', 'testing')
    OR g.provider <> 'azure' OR lower(g.resource_type) <> 'microsoft.compute/virtualmachines'
    OR c.provider <> g.provider OR c.resource_type <> g.resource_type OR c.action_type <> g.action_type
    OR c.module_source IS DISTINCT FROM expected_module OR g.draft_branch IS DISTINCT FROM expected_branch
    OR g.draft_pr_number IS NULL OR g.draft_pr_number < 1 THEN
    RAISE EXCEPTION 'Gap is not eligible for bounded module repair' USING ERRCODE = '22023';
  END IF;
  IF g.remediation_status = 'running' AND g.remediation_updated_at >= clock_timestamp() - interval '8 minutes' THEN
    RAISE EXCEPTION 'A remediation attempt is already running' USING ERRCODE = '40001';
  ELSIF g.remediation_status = 'running' THEN
    UPDATE public.iac_engineering_gaps SET remediation_status = 'failed', remediation_updated_at = clock_timestamp() WHERE id = g.id;
    INSERT INTO public.iac_engineering_gap_events(gap_id, event_type, detail)
      VALUES (g.id, 'ci_remediation_failed', jsonb_build_object('attempt', g.remediation_attempts, 'headSha', p_expected_head_sha, 'summary', 'A stale repair claim was recovered.'));
  END IF;
  IF g.remediation_attempts >= p_max_attempts THEN
    IF g.remediation_status <> 'exhausted' THEN
      UPDATE public.iac_engineering_gaps SET remediation_status = 'exhausted', remediation_updated_at = clock_timestamp() WHERE id = g.id;
      INSERT INTO public.iac_engineering_gap_events(gap_id, event_type, detail)
        VALUES (g.id, 'ci_remediation_exhausted', jsonb_build_object('attempts', g.remediation_attempts, 'headSha', p_expected_head_sha));
    END IF;
    RETURN jsonb_build_object('claimed', false, 'exhausted', true, 'attempt', g.remediation_attempts, 'headSha', p_expected_head_sha);
  END IF;

  next_attempt := g.remediation_attempts + 1;
  UPDATE public.iac_engineering_gaps SET
    remediation_status = 'running', remediation_attempts = next_attempt,
    remediation_head_sha = p_expected_head_sha, remediation_updated_at = clock_timestamp()
  WHERE id = g.id;
  INSERT INTO public.iac_engineering_gap_events(gap_id, event_type, detail)
    VALUES (g.id, 'ci_remediation_started', jsonb_build_object('attempt', next_attempt, 'headSha', p_expected_head_sha));
  RETURN jsonb_build_object('claimed', true, 'exhausted', false, 'attempt', next_attempt, 'headSha', p_expected_head_sha);
END;
$$;

CREATE FUNCTION public.complete_iac_ci_remediation(
  p_gap_id uuid,
  p_expected_head_sha text,
  p_attempt integer,
  p_outcome text,
  p_new_head_sha text,
  p_model text,
  p_summary text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  g public.iac_engineering_gaps;
  final_status text;
  event_name text;
  detail jsonb;
BEGIN
  IF current_user <> 'service_role' THEN
    RAISE EXCEPTION 'Service caller required' USING ERRCODE = '42501';
  END IF;
  IF p_expected_head_sha !~ '^[0-9a-f]{40}$' OR p_attempt NOT BETWEEN 1 AND 3
    OR p_outcome NOT IN ('committed', 'rejected', 'failed')
    OR (p_outcome <> 'committed' AND p_new_head_sha IS NOT NULL)
    OR length(coalesce(p_model, '')) NOT BETWEEN 1 AND 100
    OR length(coalesce(p_summary, '')) NOT BETWEEN 1 AND 1000 THEN
    RAISE EXCEPTION 'Invalid remediation completion' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO g FROM public.iac_engineering_gaps WHERE id = p_gap_id FOR UPDATE;
  IF NOT FOUND OR g.remediation_status <> 'running' OR g.remediation_attempts <> p_attempt
    OR g.remediation_head_sha IS DISTINCT FROM p_expected_head_sha THEN
    RAISE EXCEPTION 'Remediation claim changed' USING ERRCODE = '40001';
  END IF;

  detail := jsonb_build_object(
    'attempt', p_attempt, 'previousHeadSha', p_expected_head_sha,
    'model', p_model, 'summary', btrim(p_summary)
  );
  IF p_outcome = 'committed' THEN
    IF p_new_head_sha IS NULL OR p_new_head_sha !~ '^[0-9a-f]{40}$' OR p_new_head_sha = p_expected_head_sha THEN
      RAISE EXCEPTION 'A new immutable head is required' USING ERRCODE = '22023';
    END IF;
    UPDATE public.iac_engineering_gaps SET
      status = 'pr_opened', ci_status = 'unknown', ci_head_sha = p_new_head_sha,
      ci_observed_at = NULL, ci_evidence = '{}'::jsonb, ci_capability_snapshot = '{}'::jsonb,
      ci_version = ci_version + 1, remediation_status = 'waiting_ci',
      remediation_head_sha = p_new_head_sha, remediation_updated_at = clock_timestamp()
    WHERE id = g.id;
    event_name := 'ci_remediation_committed';
    detail := detail || jsonb_build_object('newHeadSha', p_new_head_sha);
    final_status := 'waiting_ci';
  ELSE
    final_status := CASE WHEN g.remediation_attempts >= 3 THEN 'exhausted' ELSE 'failed' END;
    UPDATE public.iac_engineering_gaps SET remediation_status = final_status, remediation_updated_at = clock_timestamp() WHERE id = g.id;
    event_name := CASE p_outcome WHEN 'rejected' THEN 'ci_remediation_validation_failed' ELSE 'ci_remediation_failed' END;
  END IF;

  INSERT INTO public.iac_engineering_gap_events(gap_id, event_type, detail) VALUES (g.id, event_name, detail);
  IF final_status = 'exhausted' THEN
    INSERT INTO public.iac_engineering_gap_events(gap_id, event_type, detail)
      VALUES (g.id, 'ci_remediation_exhausted', jsonb_build_object('attempts', g.remediation_attempts, 'headSha', coalesce(p_new_head_sha, p_expected_head_sha)));
  END IF;
  RETURN jsonb_build_object('outcome', p_outcome, 'remediationStatus', final_status, 'attempt', p_attempt, 'newHeadSha', p_new_head_sha);
END;
$$;

CREATE FUNCTION public.track_iac_ci_remediation_observation()
RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NEW.remediation_attempts > 0 AND NEW.ci_head_sha IS NOT NULL AND (
    (NEW.ci_head_sha IS NOT DISTINCT FROM NEW.remediation_head_sha AND NEW.remediation_status <> 'running')
    OR (OLD.remediation_status = 'running' AND NEW.ci_head_sha IS DISTINCT FROM OLD.remediation_head_sha)
  ) THEN
    NEW.remediation_head_sha := NEW.ci_head_sha;
    NEW.remediation_status := CASE NEW.ci_status
      WHEN 'passed' THEN 'succeeded'
      WHEN 'failed' THEN CASE WHEN NEW.remediation_attempts >= 3 THEN 'exhausted' ELSE 'failed' END
      ELSE 'waiting_ci'
    END;
    NEW.remediation_updated_at := clock_timestamp();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER track_iac_ci_remediation_observation
BEFORE UPDATE OF ci_status, ci_head_sha ON public.iac_engineering_gaps
FOR EACH ROW EXECUTE FUNCTION public.track_iac_ci_remediation_observation();

REVOKE ALL ON FUNCTION public.claim_iac_ci_remediation(uuid,bigint,text,integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_iac_ci_remediation(uuid,text,integer,text,text,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.track_iac_ci_remediation_observation() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_iac_ci_remediation(uuid,bigint,text,integer),
  public.complete_iac_ci_remediation(uuid,text,integer,text,text,text,text),
  public.track_iac_ci_remediation_observation() TO service_role;
