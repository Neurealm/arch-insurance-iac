-- Phase 5: service-observed CI evidence and explicit, independent human
-- promotion of the exact reviewed source. No scheduler, cloud role, plan,
-- apply, GitHub merge or automatic capability approval is created here.
ALTER TABLE public.iac_engineering_gaps
  ADD COLUMN ci_status text NOT NULL DEFAULT 'unknown' CHECK (ci_status IN ('unknown','running','passed','failed')),
  ADD COLUMN ci_head_sha text CHECK (ci_head_sha IS NULL OR ci_head_sha ~ '^[0-9a-f]{40}$'),
  ADD COLUMN ci_observed_at timestamptz,
  ADD COLUMN ci_version bigint NOT NULL DEFAULT 0 CHECK (ci_version >= 0),
  ADD COLUMN ci_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN ci_capability_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.iac_automation_capabilities
  ADD COLUMN approved_source_revision text CHECK (approved_source_revision IS NULL OR approved_source_revision ~ '^[0-9a-f]{40}$'),
  ADD COLUMN approved_source_repository text CHECK (approved_source_repository IS NULL OR approved_source_repository = 'Neurealm/arch-insurance-iac'),
  ADD COLUMN approved_source_merge_revision text CHECK (approved_source_merge_revision IS NULL OR approved_source_merge_revision ~ '^[0-9a-f]{40}$'),
  ADD COLUMN approved_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  ADD COLUMN approved_at timestamptz,
  ADD COLUMN approval_gap_id uuid REFERENCES public.iac_engineering_gaps(id) ON DELETE RESTRICT;

CREATE INDEX iac_engineering_gap_ci_pending_idx ON public.iac_engineering_gaps(updated_at)
  WHERE draft_pr_number IS NOT NULL AND status IN ('pr_opened','ci_running','ci_passed','ci_failed','ready_for_review');

CREATE FUNCTION public.iac_capability_review_snapshot(p_cap public.iac_automation_capabilities)
RETURNS jsonb LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT jsonb_build_object(
    'provider', p_cap.provider, 'resource_type', p_cap.resource_type,
    'action_type', p_cap.action_type, 'module_source', p_cap.module_source,
    'module_version', p_cap.module_version, 'input_schema', p_cap.input_schema,
    'execution_mode', p_cap.execution_mode, 'allowed_environments', p_cap.allowed_environments,
    'requires_managed_resource', p_cap.requires_managed_resource, 'max_targets_per_run', p_cap.max_targets_per_run
  );
$$;

-- The Edge Function supplies a snapshot read before calling GitHub. CAS
-- prevents an old poll overwriting a newer observation or human decision.
CREATE FUNCTION public.record_iac_capability_ci(p_gap_id uuid, p_expected_version bigint, p_evidence jsonb)
RETURNS public.iac_engineering_gaps
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE g public.iac_engineering_gaps; c public.iac_automation_capabilities; observed timestamptz;
BEGIN
  IF current_user <> 'service_role' THEN RAISE EXCEPTION 'Service caller required' USING ERRCODE = '42501'; END IF;
  SELECT * INTO g FROM public.iac_engineering_gaps WHERE id = p_gap_id FOR UPDATE;
  IF NOT FOUND OR g.ci_version <> p_expected_version OR g.status NOT IN ('pr_opened','ci_running','ci_passed','ci_failed','ready_for_review') THEN
    RAISE EXCEPTION 'Engineering gap changed; refresh before continuing' USING ERRCODE = '40001';
  END IF;
  IF jsonb_typeof(p_evidence) <> 'object'
    OR p_evidence->>'schemaVersion' IS DISTINCT FROM '1'
    OR p_evidence->>'repository' IS DISTINCT FROM 'Neurealm/arch-insurance-iac'
    OR p_evidence->>'prNumber' IS DISTINCT FROM g.draft_pr_number::text
    OR p_evidence->>'branch' IS DISTINCT FROM g.draft_branch
    OR coalesce(p_evidence->>'status','') NOT IN ('unknown','running','passed','failed') THEN
    RAISE EXCEPTION 'CI evidence identity is invalid' USING ERRCODE = '22023';
  END IF;
  IF p_evidence->>'status' = 'passed' AND (coalesce(p_evidence->>'headSha','') !~ '^[0-9a-f]{40}$' OR jsonb_array_length(p_evidence->'workflows') <> 2) THEN
    RAISE EXCEPTION 'Passing CI must identify its exact source and required workflows' USING ERRCODE = '22023';
  END IF;
  observed := (p_evidence->>'observedAt')::timestamptz;
  IF observed IS NULL OR observed > clock_timestamp() + interval '30 seconds' OR observed < clock_timestamp() - interval '10 minutes'
    OR observed < g.ci_observed_at THEN RAISE EXCEPTION 'CI evidence is stale' USING ERRCODE = '22023'; END IF;
  SELECT * INTO c FROM public.iac_automation_capabilities WHERE id = g.linked_capability_id FOR SHARE;
  IF NOT FOUND OR c.lifecycle_status NOT IN ('draft','testing') THEN RAISE EXCEPTION 'Gap is not linked to a reviewable capability' USING ERRCODE = '22023'; END IF;
  IF p_evidence->>'capabilityId' IS DISTINCT FROM c.id::text OR p_evidence->'capabilitySnapshot' IS DISTINCT FROM public.iac_capability_review_snapshot(c) THEN
    RAISE EXCEPTION 'Capability changed during observation' USING ERRCODE = '40001';
  END IF;
  UPDATE public.iac_engineering_gaps SET
    ci_status = p_evidence->>'status', ci_head_sha = p_evidence->>'headSha', ci_observed_at = observed,
    ci_version = ci_version + 1, ci_evidence = p_evidence,
    ci_capability_snapshot = public.iac_capability_review_snapshot(c),
    status = CASE p_evidence->>'status' WHEN 'passed' THEN 'ci_passed' WHEN 'failed' THEN 'ci_failed' ELSE 'ci_running' END
  WHERE id = g.id RETURNING * INTO g;
  INSERT INTO public.iac_engineering_gap_events(gap_id,event_type,detail)
    VALUES (g.id,'ci_observed',jsonb_build_object('ciVersion',g.ci_version,'evidence',p_evidence));
  RETURN g;
END;
$$;

-- This RPC is NOT exposed to authenticated clients. Only the authenticated
-- Edge handler may supply p_actor_id, after a fresh auth.getUser + admin check
-- and a fresh read-only GitHub observation. Service automation cannot approve
-- via the handler: it must carry a real human session. SQL repeats role,
-- separation-of-duty, snapshot and freshness checks under row locks.
CREATE FUNCTION public.approve_iac_capability(p_gap_id uuid, p_expected_version bigint, p_head_sha text, p_actor_id uuid, p_comment text)
RETURNS public.iac_automation_capabilities
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE g public.iac_engineering_gaps; c public.iac_automation_capabilities;
BEGIN
  IF current_user <> 'service_role' THEN RAISE EXCEPTION 'Service caller required' USING ERRCODE = '42501'; END IF;
  IF p_actor_id IS NULL OR NOT coalesce(public.is_platform_admin(p_actor_id),false) THEN RAISE EXCEPTION 'Human platform administrator required' USING ERRCODE = '42501'; END IF;
  IF p_comment IS NULL OR length(btrim(p_comment)) < 10 OR length(p_comment) > 4000 THEN RAISE EXCEPTION 'A substantive review comment is required' USING ERRCODE = '22023'; END IF;
  SELECT * INTO g FROM public.iac_engineering_gaps WHERE id = p_gap_id FOR UPDATE;
  IF NOT FOUND OR g.ci_version <> p_expected_version OR g.status <> 'ci_passed' OR g.ci_status <> 'passed'
    OR g.ci_head_sha IS DISTINCT FROM p_head_sha OR p_head_sha !~ '^[0-9a-f]{40}$' THEN
    RAISE EXCEPTION 'Current passing CI for the exact reviewed revision is required' USING ERRCODE = '40001';
  END IF;
  IF g.requested_by IS NULL OR g.requested_by = p_actor_id THEN RAISE EXCEPTION 'An identified requester and independent reviewer are required' USING ERRCODE = '42501'; END IF;
  IF g.ci_observed_at < clock_timestamp() - interval '2 minutes' OR g.ci_evidence->>'promotionReady' IS DISTINCT FROM 'true'
    OR g.ci_evidence->>'merged' IS DISTINCT FROM 'true' OR coalesce(g.ci_evidence->>'mergeSha','') !~ '^[0-9a-f]{40}$'
    OR g.ci_evidence#>>'{review,state}' IS DISTINCT FROM 'APPROVED'
    OR g.ci_evidence#>>'{review,commitId}' IS DISTINCT FROM p_head_sha THEN
    RAISE EXCEPTION 'Fresh CI, independent GitHub review and verified merge are required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO c FROM public.iac_automation_capabilities WHERE id = g.linked_capability_id FOR UPDATE;
  IF NOT FOUND OR c.lifecycle_status NOT IN ('draft','testing') OR public.iac_capability_review_snapshot(c) IS DISTINCT FROM g.ci_capability_snapshot
    OR c.provider <> g.provider OR c.resource_type <> g.resource_type OR c.action_type <> g.action_type THEN
    RAISE EXCEPTION 'Capability changed after observation or does not match the gap' USING ERRCODE = '40001';
  END IF;
  IF EXISTS (SELECT 1 FROM public.iac_automation_capabilities WHERE provider=c.provider AND resource_type=c.resource_type AND action_type=c.action_type AND lifecycle_status='approved' AND id<>c.id) THEN
    RAISE EXCEPTION 'An approved capability already exists; explicit retirement review is required' USING ERRCODE = '22023';
  END IF;
  UPDATE public.iac_automation_capabilities SET lifecycle_status='approved', approved_source_revision=p_head_sha,
    approved_source_repository='Neurealm/arch-insurance-iac', approved_source_merge_revision=g.ci_evidence->>'mergeSha',
    approved_by=p_actor_id, approved_at=clock_timestamp(), approval_gap_id=g.id, updated_at=clock_timestamp()
  WHERE id=c.id RETURNING * INTO c;
  UPDATE public.iac_engineering_gaps SET status='capability_approved', ci_version=ci_version+1 WHERE id=g.id;
  INSERT INTO public.iac_engineering_gap_events(gap_id,event_type,detail) VALUES (g.id,'capability_approved',jsonb_build_object(
    'capabilityId',c.id,'approvedBy',p_actor_id,'comment',btrim(p_comment),'headSha',p_head_sha,'mergeSha',c.approved_source_merge_revision,
    'ciVersion',g.ci_version,'ciEvidence',g.ci_evidence,'capabilitySnapshot',g.ci_capability_snapshot));
  RETURN c;
END;
$$;

-- Reviewed fields and provenance cannot silently change under an existing
-- approved version. Retiring is allowed; replacement requires a new version.
CREATE FUNCTION public.protect_iac_capability_approval() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF OLD.approved_source_revision IS NOT NULL AND (
    public.iac_capability_review_snapshot(NEW) IS DISTINCT FROM public.iac_capability_review_snapshot(OLD)
    OR NEW.approved_source_revision IS DISTINCT FROM OLD.approved_source_revision
    OR NEW.approved_source_repository IS DISTINCT FROM OLD.approved_source_repository
    OR NEW.approved_source_merge_revision IS DISTINCT FROM OLD.approved_source_merge_revision
    OR NEW.approved_by IS DISTINCT FROM OLD.approved_by OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
    OR NEW.approval_gap_id IS DISTINCT FROM OLD.approval_gap_id
    OR (NEW.lifecycle_status IS DISTINCT FROM OLD.lifecycle_status AND NEW.lifecycle_status <> 'retired')
  ) THEN RAISE EXCEPTION 'Reviewed capability is immutable; create and review a new version' USING ERRCODE = '42501'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_iac_capability_approval BEFORE UPDATE ON public.iac_automation_capabilities
  FOR EACH ROW EXECUTE FUNCTION public.protect_iac_capability_approval();

REVOKE ALL ON FUNCTION public.iac_capability_review_snapshot(public.iac_automation_capabilities) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.protect_iac_capability_approval() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.record_iac_capability_ci(uuid,bigint,jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.approve_iac_capability(uuid,bigint,text,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.iac_capability_review_snapshot(public.iac_automation_capabilities),
  public.protect_iac_capability_approval(), public.record_iac_capability_ci(uuid,bigint,jsonb),
  public.approve_iac_capability(uuid,bigint,text,uuid,text) TO service_role;
