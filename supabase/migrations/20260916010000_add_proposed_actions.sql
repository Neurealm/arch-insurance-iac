-- Dynamic Action Discovery: track unknown action types the agent surfaces for
-- platform admin review.
--
-- Flow:
--   1. Agent sees unknown action → calls propose_new_action tool (terminal) →
--      inserts a row here + posts an immediate ServiceNow comment to the requester
--      saying the platform doesn't support this action yet but it's logged.
--   2. Platform admin opens the "Actions" tab in Platform → Capabilities UI.
--   3. Approve → approve_proposed_action() RPC auto-creates an engineering gap
--      and marks this row approved. No ServiceNow comment is sent (the requester
--      already got one in step 1). Admin is redirected to the gap/capability page.
--   4. Reject → admin provides a reason → servicenow-intake-agent reject_proposal
--      mode updates this row and posts a rejection comment to ServiceNow.

CREATE TABLE public.iac_proposed_actions (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The snake_case action identifier the agent proposed (e.g. 'rotate_ssh_key')
  proposed_name       text        NOT NULL,
  -- Human-readable label for admin display (e.g. 'SSH Key Rotation')
  display_name        text        NOT NULL,
  -- The originating intake request that triggered the proposal
  intake_request_id   uuid        REFERENCES public.servicenow_intake_requests(id) ON DELETE SET NULL,
  -- Denormalized for quick display even if the intake row is deleted
  ticket_number       text        NOT NULL,
  -- The agent's explanation of why this is a new/unsupported action type
  agent_reasoning     text        NOT NULL,
  -- Lifecycle: pending → approved | rejected
  status              text        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'approved', 'rejected')),
  -- Populated on rejection; required before reject_proposed_action completes
  rejection_reason    text,
  -- Set on approval: the engineering gap created to build this capability
  gap_id              uuid        REFERENCES public.iac_engineering_gaps(id) ON DELETE SET NULL,
  reviewed_by         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Only one live (pending) proposal per action name -- a second ticket proposing
-- the same new action links to the same proposal rather than opening a duplicate.
CREATE UNIQUE INDEX iac_one_pending_proposal_per_action
  ON public.iac_proposed_actions(proposed_name) WHERE status = 'pending';

-- Admin list view: order by newest first, filter by status
CREATE INDEX iac_proposed_actions_status_created
  ON public.iac_proposed_actions(status, created_at DESC);

ALTER TABLE public.iac_proposed_actions ENABLE ROW LEVEL SECURITY;

-- Same access model as engineering gaps: service role has full access,
-- authenticated users get read access (gated further by RLS policy).
REVOKE ALL ON public.iac_proposed_actions FROM anon, authenticated;
GRANT SELECT ON public.iac_proposed_actions TO authenticated;
GRANT ALL   ON public.iac_proposed_actions TO service_role;

-- Only platform admins see proposals; requesters do NOT need visibility here
-- (they already got a ServiceNow comment explaining their ticket is logged).
CREATE POLICY iac_proposed_actions_platform_admin_only
ON public.iac_proposed_actions FOR SELECT TO authenticated
USING ((SELECT public.is_platform_admin(auth.uid())));

-- ---------------------------------------------------------------------------
-- approve_proposed_action
--
-- Called from the admin UI (authenticated Supabase client, not service role).
-- Checks is_platform_admin, marks the proposal approved, and creates (or
-- links to an existing open) engineering gap for the proposed action so the
-- normal capability-building workflow can proceed.
-- Returns: { "gapId": "<uuid>" } for the UI to redirect to the gap page.
-- ---------------------------------------------------------------------------
CREATE FUNCTION public.approve_proposed_action(p_proposal_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp
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

  -- Find an existing open gap for this action type, or create one.
  -- The unique index on (provider, resource_type, action_type) prevents
  -- duplicates; INSERT ... ON CONFLICT DO NOTHING + a follow-up SELECT
  -- gives us the id in both the new-gap and pre-existing-gap cases.
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
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_gap_id
  FROM public.iac_engineering_gaps
  WHERE provider       = 'azure'
    AND resource_type  = 'virtual_machine'
    AND action_type    = v_proposal.proposed_name
    AND status NOT IN ('capability_approved', 'abandoned')
  LIMIT 1;

  IF v_gap_id IS NULL THEN
    RAISE EXCEPTION 'unable_to_resolve_gap' USING ERRCODE = 'P0001';
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
-- Authenticated admins call this directly from the browser client
GRANT EXECUTE ON FUNCTION public.approve_proposed_action(uuid) TO authenticated;

COMMENT ON FUNCTION public.approve_proposed_action(uuid) IS
  'Platform-admin–only. Marks a pending proposed action as approved and creates '
  '(or links to) an engineering gap for the action type. Returns {"gapId": "<uuid>"} '
  'for the UI to redirect to the engineering gap detail page.';

-- ---------------------------------------------------------------------------
-- Extend servicenow_intake_requests.status to include action_proposed.
--
-- 'action_proposed' is a transient status between persistOutcome() and
-- markCommentPosted(). Its presence in the constraint is required; the final
-- settled status is always 'comment_posted' (or 'comment_failed') after the
-- ServiceNow customer comment is sent.
-- ---------------------------------------------------------------------------
ALTER TABLE public.servicenow_intake_requests
  DROP CONSTRAINT servicenow_intake_requests_status_check;

ALTER TABLE public.servicenow_intake_requests
  ADD CONSTRAINT servicenow_intake_requests_status_check
  CHECK (status = ANY (ARRAY[
    'received', 'analyzing', 'needs_clarification', 'ready_for_engineering',
    'engineering_gap_opened', 'action_proposed',
    'comment_posted', 'comment_failed', 'demo_comment_generated',
    'identity_conflict', 'failed'
  ]));
