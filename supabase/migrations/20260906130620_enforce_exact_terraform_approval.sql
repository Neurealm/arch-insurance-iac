-- Exact reviewed artifacts and durable claims. No Azure/HCP credentials or
-- scope registrations are seeded. Existing unbound approvals fail closed.
ALTER TABLE public.iac_change_package_reviews
  ADD COLUMN approved_plan_run_id uuid REFERENCES public.iac_terraform_runs(id) ON DELETE RESTRICT,
  ADD COLUMN approved_plan_sha256 text CHECK (approved_plan_sha256 IS NULL OR approved_plan_sha256 ~ '^[0-9a-f]{64}$'),
  ADD COLUMN approved_source_revision text CHECK (approved_source_revision IS NULL OR approved_source_revision ~ '^[0-9a-f]{40}$'),
  ADD COLUMN approved_hcp_run_id text,
  ADD COLUMN approved_hcp_plan_id text;

CREATE TABLE public.iac_terraform_workspace_claims (
  workspace_id text PRIMARY KEY,
  configuration_key text NOT NULL,
  active_claim_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.iac_terraform_plan_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.iac_change_packages(id),
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  workspace_id text NOT NULL REFERENCES public.iac_terraform_workspace_claims(workspace_id),
  source_revision text NOT NULL CHECK (source_revision ~ '^[0-9a-f]{40}$'),
  scope_evidence jsonb NOT NULL,
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','recorded','uncertain','released')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX iac_one_active_plan_claim ON public.iac_terraform_plan_claims(package_id)
  WHERE status <> 'released';
ALTER TABLE public.iac_terraform_runs ADD COLUMN plan_claim_id uuid REFERENCES public.iac_terraform_plan_claims(id);
CREATE UNIQUE INDEX iac_one_plan_per_claim ON public.iac_terraform_runs(plan_claim_id)
  WHERE run_type='plan' AND plan_claim_id IS NOT NULL;
ALTER TABLE public.iac_terraform_workspace_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_terraform_plan_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iac_terraform_workspace_claims, public.iac_terraform_plan_claims FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.iac_terraform_workspace_claims, public.iac_terraform_plan_claims TO service_role;

-- An unresolved remote request never times out into another automatic attempt.
-- Release only after a confirmed terminal remote state; ambiguity needs review.
CREATE FUNCTION public.reserve_iac_terraform_plan(p_package_id uuid, p_actor uuid, p_workspace_id text,
  p_configuration_key text, p_source_revision text, p_scope_evidence jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE p public.iac_change_packages%ROWTYPE; w public.iac_terraform_workspace_claims%ROWTYPE; claim uuid;
BEGIN
  SELECT * INTO p FROM public.iac_change_packages WHERE id=p_package_id FOR UPDATE;
  IF NOT FOUND OR p_actor IS NULL OR (p.created_by<>p_actor AND NOT public.is_platform_admin(p_actor)) THEN RAISE EXCEPTION 'package_access_denied'; END IF;
  IF p.status<>'submitted' THEN RAISE EXCEPTION 'only_submitted_packages_can_be_planned'; END IF;
  IF EXISTS(SELECT 1 FROM public.iac_terraform_runs WHERE package_id=p.id AND status IN ('queued','running')) THEN RAISE EXCEPTION 'plan_already_in_progress'; END IF;
  IF p_workspace_id IS NULL OR p_configuration_key IS NULL OR p_source_revision IS NULL
    OR p_workspace_id !~ '^ws-[A-Za-z0-9]+$' OR length(p_configuration_key)<10 OR p_source_revision !~ '^[0-9a-f]{40}$'
    OR jsonb_typeof(p_scope_evidence) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'invalid_trusted_plan_scope'; END IF;
  INSERT INTO public.iac_terraform_workspace_claims(workspace_id,configuration_key)
    VALUES(p_workspace_id,p_configuration_key) ON CONFLICT DO NOTHING;
  SELECT * INTO w FROM public.iac_terraform_workspace_claims WHERE workspace_id=p_workspace_id FOR UPDATE;
  IF w.configuration_key<>p_configuration_key THEN RAISE EXCEPTION 'workspace_owned_by_different_configuration'; END IF;
  IF w.active_claim_id IS NOT NULL THEN RAISE EXCEPTION 'workspace_has_unresolved_saved_plan'; END IF;
  INSERT INTO public.iac_terraform_plan_claims(package_id,requested_by,workspace_id,source_revision,scope_evidence)
    VALUES(p.id,p_actor,p_workspace_id,p_source_revision,p_scope_evidence) RETURNING id INTO claim;
  UPDATE public.iac_terraform_workspace_claims SET active_claim_id=claim,updated_at=now() WHERE workspace_id=p_workspace_id;
  RETURN claim;
END $$;

CREATE FUNCTION public.guard_iac_terraform_run()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE p public.iac_change_packages%ROWTYPE; c public.iac_terraform_plan_claims%ROWTYPE;
BEGIN
  IF TG_OP='UPDATE' THEN
    IF OLD.status NOT IN ('queued','running') AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'terminal_run_evidence_is_immutable'; END IF;
    IF ROW(NEW.package_id,NEW.capability_id,NEW.run_type,NEW.requested_by,NEW.plan_run_id,NEW.module_source,NEW.module_version,NEW.resolved_inputs,NEW.hcp_run_id,NEW.source_revision,NEW.plan_claim_id,NEW.execution_engine,NEW.hcp_workspace_id,NEW.hcp_workspace_name,NEW.hcp_organization,NEW.hcp_configuration_version_id)
      IS DISTINCT FROM ROW(OLD.package_id,OLD.capability_id,OLD.run_type,OLD.requested_by,OLD.plan_run_id,OLD.module_source,OLD.module_version,OLD.resolved_inputs,OLD.hcp_run_id,OLD.source_revision,OLD.plan_claim_id,OLD.execution_engine,OLD.hcp_workspace_id,OLD.hcp_workspace_name,OLD.hcp_organization,OLD.hcp_configuration_version_id)
      THEN RAISE EXCEPTION 'run_identity_is_immutable'; END IF;
    RETURN NEW;
  END IF;
  SELECT * INTO p FROM public.iac_change_packages WHERE id=NEW.package_id FOR UPDATE;
  IF NEW.execution_engine<>'hcp_terraform' OR NEW.plan_claim_id IS NULL THEN RAISE EXCEPTION 'claimed_hcp_run_required'; END IF;
  SELECT * INTO c FROM public.iac_terraform_plan_claims WHERE id=NEW.plan_claim_id FOR UPDATE;
  IF NOT FOUND OR c.package_id<>p.id OR c.workspace_id<>NEW.hcp_workspace_id OR c.source_revision<>NEW.source_revision THEN RAISE EXCEPTION 'plan_claim_mismatch'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.iac_terraform_workspace_claims WHERE workspace_id=c.workspace_id AND active_claim_id=c.id) THEN RAISE EXCEPTION 'workspace_claim_missing'; END IF;
  IF NEW.run_type='plan' THEN
    IF p.status<>'submitted' OR c.status<>'reserved' OR c.requested_by IS DISTINCT FROM NEW.requested_by THEN RAISE EXCEPTION 'plan_claim_not_available'; END IF;
    UPDATE public.iac_terraform_plan_claims SET status='recorded' WHERE id=c.id;
  ELSE
    IF p.status<>'executing' OR c.status<>'recorded' OR NOT EXISTS (
      SELECT 1 FROM public.iac_change_package_reviews r JOIN public.iac_terraform_runs plan ON plan.id=r.approved_plan_run_id
      WHERE r.package_id=p.id AND r.decision='approved' AND plan.id=NEW.plan_run_id AND plan.status='succeeded'
        AND r.approved_plan_sha256=NEW.plan_sha256 AND r.approved_source_revision=NEW.source_revision
        AND r.approved_hcp_run_id=NEW.hcp_run_id AND r.approved_hcp_plan_id=NEW.hcp_plan_id
        AND plan.capability_id=NEW.capability_id AND plan.resolved_inputs=NEW.resolved_inputs
    ) THEN RAISE EXCEPTION 'apply_not_bound_to_reviewed_plan'; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_iac_terraform_run BEFORE INSERT OR UPDATE ON public.iac_terraform_runs
  FOR EACH ROW EXECUTE FUNCTION public.guard_iac_terraform_run();

CREATE FUNCTION public.review_iac_terraform_plan(p_package_id uuid,p_decision text,p_comment text,p_plan_run_id uuid,p_plan_sha256 text)
RETURNS public.iac_change_package_reviews LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE actor uuid:=auth.uid(); p public.iac_change_packages%ROWTYPE; plan public.iac_terraform_runs%ROWTYPE; r public.iac_change_package_reviews%ROWTYPE;
BEGIN
  IF actor IS NULL OR NOT public.is_platform_admin(actor) THEN RAISE EXCEPTION 'reviewer_not_authorized'; END IF;
  IF p_decision IS NULL OR p_decision NOT IN ('approved','rejected','changes_requested') OR length(trim(coalesce(p_comment,'')))<10 THEN RAISE EXCEPTION 'valid_decision_and_review_comment_required'; END IF;
  SELECT * INTO p FROM public.iac_change_packages WHERE id=p_package_id FOR UPDATE;
  IF NOT FOUND OR p.status<>'submitted' THEN RAISE EXCEPTION 'only_submitted_packages_can_be_reviewed'; END IF;
  IF p.created_by=actor THEN RAISE EXCEPTION 'self_approval_is_not_permitted'; END IF;
  IF p_decision='approved' THEN
    IF EXISTS(SELECT 1 FROM public.iac_terraform_plan_claims WHERE package_id=p.id AND status IN ('reserved','uncertain'))
      OR EXISTS(SELECT 1 FROM public.iac_terraform_runs WHERE package_id=p.id AND status IN ('queued','running')) THEN RAISE EXCEPTION 'plan_still_in_progress_or_uncertain'; END IF;
    SELECT * INTO plan FROM public.iac_terraform_runs WHERE package_id=p.id AND run_type='plan' ORDER BY created_at DESC,id DESC LIMIT 1 FOR UPDATE;
    IF NOT FOUND OR plan.id IS DISTINCT FROM p_plan_run_id OR plan.plan_sha256 IS DISTINCT FROM p_plan_sha256 THEN RAISE EXCEPTION 'displayed_plan_changed_refresh_review'; END IF;
    IF plan.status<>'succeeded' OR plan.execution_engine<>'hcp_terraform' OR plan.hcp_plan_id IS NULL OR plan.hcp_run_id IS NULL
      OR plan.plan_sha256 IS NULL OR plan.source_revision IS NULL OR plan.has_destroy OR plan.has_replace
      OR (plan.reconciliation->>'matched')::boolean IS DISTINCT FROM true THEN RAISE EXCEPTION 'clean_exact_saved_plan_required'; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.iac_terraform_plan_claims c JOIN public.iac_terraform_workspace_claims w ON w.active_claim_id=c.id
      WHERE c.id=plan.plan_claim_id AND c.status='recorded') THEN RAISE EXCEPTION 'plan_claim_is_not_active'; END IF;
  END IF;
  INSERT INTO public.iac_change_package_reviews(package_id,decision,comment,reviewed_by,approved_plan_run_id,approved_plan_sha256,approved_source_revision,approved_hcp_run_id,approved_hcp_plan_id)
    VALUES(p.id,p_decision,trim(p_comment),actor,plan.id,plan.plan_sha256,plan.source_revision,plan.hcp_run_id,plan.hcp_plan_id) RETURNING * INTO r;
  UPDATE public.iac_change_packages SET status=p_decision WHERE id=p.id;
  RETURN r;
END $$;
-- Old clients may reject/return a request, but cannot silently approve a plan
-- they did not identify. New clients send the displayed plan ID and digest.
CREATE OR REPLACE FUNCTION public.review_iac_change_package(p_package_id uuid,p_decision text,p_comment text DEFAULT NULL)
RETURNS public.iac_change_package_reviews LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
BEGIN RETURN public.review_iac_terraform_plan(p_package_id,p_decision,p_comment,NULL,NULL); END $$;

CREATE FUNCTION public.claim_iac_terraform_apply(p_package_id uuid,p_actor uuid,p_run_id uuid,p_plan_sha256 text)
RETURNS public.iac_terraform_runs LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE p public.iac_change_packages%ROWTYPE; r public.iac_change_package_reviews%ROWTYPE; plan public.iac_terraform_runs%ROWTYPE; applied public.iac_terraform_runs%ROWTYPE;
BEGIN
  SELECT * INTO p FROM public.iac_change_packages WHERE id=p_package_id FOR UPDATE;
  IF NOT FOUND OR p_actor IS NULL OR (p.created_by<>p_actor AND NOT public.is_platform_admin(p_actor)) THEN RAISE EXCEPTION 'execution_not_authorized'; END IF;
  IF p.status<>'approved' THEN RAISE EXCEPTION 'package_already_claimed_or_not_approved'; END IF;
  SELECT * INTO r FROM public.iac_change_package_reviews WHERE package_id=p.id AND decision='approved' ORDER BY reviewed_at DESC,id DESC LIMIT 1;
  SELECT * INTO plan FROM public.iac_terraform_runs WHERE id=r.approved_plan_run_id AND package_id=p.id FOR UPDATE;
  IF NOT FOUND OR plan.id IS DISTINCT FROM p_run_id OR plan.plan_sha256 IS DISTINCT FROM p_plan_sha256
    OR r.approved_plan_sha256 IS DISTINCT FROM plan.plan_sha256 OR r.approved_source_revision IS DISTINCT FROM plan.source_revision
    OR r.approved_hcp_run_id IS DISTINCT FROM plan.hcp_run_id OR r.approved_hcp_plan_id IS DISTINCT FROM plan.hcp_plan_id
    OR plan.status<>'succeeded' OR plan.has_destroy OR plan.has_replace OR (plan.reconciliation->>'matched')::boolean IS DISTINCT FROM true
    THEN RAISE EXCEPTION 'exact_reviewed_plan_required'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.iac_terraform_workspace_claims WHERE active_claim_id=plan.plan_claim_id) THEN RAISE EXCEPTION 'workspace_claim_missing'; END IF;
  UPDATE public.iac_change_packages SET status='executing',execution_started_at=now(),executed_by=p_actor WHERE id=p.id;
  INSERT INTO public.iac_terraform_runs(package_id,capability_id,run_type,status,requested_by,plan_run_id,module_source,module_version,resolved_inputs,runner_correlation_id,
    execution_engine,hcp_organization,hcp_workspace_id,hcp_workspace_name,hcp_run_id,hcp_plan_id,hcp_run_status,source_revision,artifact_uri,plan_sha256,plan_claim_id,started_at)
  VALUES(p.id,plan.capability_id,'apply','running',p_actor,plan.id,plan.module_source,plan.module_version,plan.resolved_inputs,'hcp-apply:'||plan.hcp_run_id,
    'hcp_terraform',plan.hcp_organization,plan.hcp_workspace_id,plan.hcp_workspace_name,plan.hcp_run_id,plan.hcp_plan_id,plan.hcp_run_status,plan.source_revision,plan.artifact_uri,plan.plan_sha256,plan.plan_claim_id,now()) RETURNING * INTO applied;
  INSERT INTO public.iac_terraform_run_events(run_id,event_type,detail) VALUES(applied.id,'exact_plan_claimed',jsonb_build_object('reviewId',r.id,'planRunId',plan.id));
  RETURN applied;
END $$;

CREATE FUNCTION public.release_iac_terraform_claim(p_claim_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.iac_terraform_runs WHERE plan_claim_id=p_claim_id AND
    ((run_type='apply' AND status='succeeded' AND hcp_run_status='applied') OR
     (status IN ('failed','cancelled','blocked') AND hcp_run_status IN ('errored','canceled','force_canceled','discarded','planned_and_finished')))) THEN
    RAISE EXCEPTION 'confirmed_remote_terminal_state_required'; END IF;
  UPDATE public.iac_terraform_workspace_claims SET active_claim_id=NULL,updated_at=now() WHERE active_claim_id=p_claim_id;
  UPDATE public.iac_terraform_plan_claims SET status='released' WHERE id=p_claim_id;
END $$;

REVOKE ALL ON FUNCTION public.reserve_iac_terraform_plan(uuid,uuid,text,text,text,jsonb), public.claim_iac_terraform_apply(uuid,uuid,uuid,text), public.release_iac_terraform_claim(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_iac_terraform_plan(uuid,uuid,text,text,text,jsonb), public.claim_iac_terraform_apply(uuid,uuid,uuid,text), public.release_iac_terraform_claim(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.review_iac_terraform_plan(uuid,text,text,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_iac_terraform_plan(uuid,text,text,uuid,text) TO authenticated;
REVOKE ALL ON FUNCTION public.guard_iac_terraform_run() FROM PUBLIC,anon,authenticated;
-- Old direct-execution RPCs must not permit client-forged execution success.
REVOKE ALL ON FUNCTION public.begin_iac_vm_execution(uuid), public.complete_iac_vm_execution(uuid,boolean,text) FROM PUBLIC,anon,authenticated;

-- Record the remote observation and its package transition in one transaction.
-- Otherwise a crash after marking a run terminal leaves an executing package
-- that no future poll would select. Only the authenticated server may call this.
CREATE FUNCTION public.synchronize_iac_terraform_run(p_run_id uuid,p_observation jsonb)
RETURNS public.iac_terraform_runs LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE r public.iac_terraform_runs%ROWTYPE; package_id_value uuid;
BEGIN
  SELECT package_id INTO package_id_value FROM public.iac_terraform_runs WHERE id=p_run_id;
  PERFORM 1 FROM public.iac_change_packages WHERE id=package_id_value FOR UPDATE;
  SELECT * INTO r FROM public.iac_terraform_runs WHERE id=p_run_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'run_not_found'; END IF;
  IF r.status NOT IN ('queued','running') THEN RETURN r; END IF;
  IF jsonb_typeof(p_observation) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'invalid_observation'; END IF;
  UPDATE public.iac_terraform_runs SET
    status=coalesce(p_observation->>'status',status),
    hcp_run_status=p_observation->>'hcp_run_status',
    hcp_plan_id=coalesce(p_observation->>'hcp_plan_id',hcp_plan_id),
    hcp_synced_at=now(),
    completed_at=CASE WHEN p_observation ? 'completed_at' THEN now() ELSE completed_at END,
    artifact_uri=coalesce(p_observation->>'artifact_uri',artifact_uri),
    plan_sha256=coalesce(p_observation->>'plan_sha256',plan_sha256),
    plan_summary=coalesce(p_observation->'plan_summary',plan_summary),
    reconciliation=coalesce(p_observation->'reconciliation',reconciliation),
    has_destroy=coalesce((p_observation->>'has_destroy')::boolean,has_destroy),
    has_replace=coalesce((p_observation->>'has_replace')::boolean,has_replace),
    hcp_plan_json=coalesce(p_observation->'hcp_plan_json',hcp_plan_json),
    error_message=CASE WHEN p_observation ? 'error_message' THEN p_observation->>'error_message' ELSE error_message END
    WHERE id=p_run_id RETURNING * INTO r;
  INSERT INTO public.iac_terraform_run_events(run_id,event_type,detail)
    VALUES(r.id,'hcp_run_synchronized',jsonb_build_object('status',r.status,'hcpStatus',r.hcp_run_status));
  IF r.run_type='apply' AND r.status IN ('succeeded','failed','blocked') THEN
    UPDATE public.iac_change_packages SET status=CASE WHEN r.status='succeeded' THEN 'executed' ELSE 'execution_failed' END,
      execution_completed_at=now(), execution_message=CASE WHEN r.status='succeeded'
        THEN 'Exact approved HCP plan applied. Independent Azure validation is required.' ELSE r.error_message END
      WHERE id=r.package_id AND status='executing';
  END IF;
  IF r.plan_claim_id IS NOT NULL AND r.hcp_run_status IN ('applied','errored','canceled','force_canceled','discarded','planned_and_finished') THEN
    PERFORM public.release_iac_terraform_claim(r.plan_claim_id);
  END IF;
  RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.synchronize_iac_terraform_run(uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.synchronize_iac_terraform_run(uuid,jsonb) TO service_role;
