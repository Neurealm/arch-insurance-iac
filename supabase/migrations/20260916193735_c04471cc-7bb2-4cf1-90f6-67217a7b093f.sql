CREATE TABLE public.iac_proposed_actions (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_name       text        NOT NULL,
  display_name        text        NOT NULL,
  intake_request_id   uuid        REFERENCES public.servicenow_intake_requests(id) ON DELETE SET NULL,
  ticket_number       text        NOT NULL,
  agent_reasoning     text        NOT NULL,
  status              text        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason    text,
  gap_id              uuid        REFERENCES public.iac_engineering_gaps(id) ON DELETE SET NULL,
  reviewed_by         uuid,
  reviewed_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX iac_one_pending_proposal_per_action
  ON public.iac_proposed_actions(proposed_name) WHERE status = 'pending';

CREATE INDEX iac_proposed_actions_status_created
  ON public.iac_proposed_actions(status, created_at DESC);

REVOKE ALL ON public.iac_proposed_actions FROM anon, authenticated;
GRANT SELECT ON public.iac_proposed_actions TO authenticated;
GRANT ALL   ON public.iac_proposed_actions TO service_role;

ALTER TABLE public.iac_proposed_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY iac_proposed_actions_platform_admin_only
ON public.iac_proposed_actions FOR SELECT TO authenticated
USING ((SELECT public.is_platform_admin(auth.uid())));

CREATE FUNCTION public.approve_proposed_action(p_proposal_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
DECLARE
  v_proposal public.iac_proposed_actions;
  v_gap_id   uuid;
BEGIN
  IF NOT (SELECT public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'platform_admin_required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_proposal
  FROM public.iac_proposed_actions
  WHERE id = p_proposal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'proposal_not_found' USING ERRCODE = '02000';
  END IF;
  IF v_proposal.status <> 'pending' THEN
    RAISE EXCEPTION 'proposal_already_reviewed: current status is %', v_proposal.status
    USING ERRCODE = '23000';
  END IF;

  SELECT id INTO v_gap_id
  FROM public.iac_engineering_gaps
  WHERE provider       = 'azure'
    AND resource_type  = 'virtual_machine'
    AND action_type    = v_proposal.proposed_name
    AND status NOT IN ('capability_approved', 'abandoned')
  LIMIT 1;

  IF v_gap_id IS NULL THEN
    INSERT INTO public.iac_engineering_gaps (
      provider, resource_type, action_type,
      requested_by, source_intake_request_id, context
    )
    VALUES (
      'azure', 'virtual_machine', v_proposal.proposed_name,
      auth.uid(), v_proposal.intake_request_id,
      jsonb_build_object(
        'proposed_action_id', p_proposal_id,
        'ticket_number',       v_proposal.ticket_number,
        'display_name',        v_proposal.display_name,
        'agent_reasoning',     v_proposal.agent_reasoning
      )
    )
    RETURNING id INTO v_gap_id;
  END IF;

  UPDATE public.iac_proposed_actions
  SET status      = 'approved',
      gap_id      = v_gap_id,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = p_proposal_id;

  RETURN jsonb_build_object('gapId', v_gap_id);
END;
$fn$;

REVOKE ALL ON FUNCTION public.approve_proposed_action(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_proposed_action(uuid) TO authenticated;

ALTER TABLE public.servicenow_intake_requests
  DROP CONSTRAINT IF EXISTS servicenow_intake_requests_status_check;

ALTER TABLE public.servicenow_intake_requests
  ADD CONSTRAINT servicenow_intake_requests_status_check
  CHECK (status = ANY (ARRAY[
    'received', 'analyzing', 'needs_clarification', 'ready_for_engineering',
    'engineering_gap_opened', 'action_proposed',
    'comment_posted', 'comment_failed', 'demo_comment_generated',
    'identity_conflict', 'failed'
  ]));