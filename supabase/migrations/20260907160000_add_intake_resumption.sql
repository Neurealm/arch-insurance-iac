-- Phase 7: close the loop between a paused ticket and an approved capability.
--
-- The customer-facing comment has always promised that a request "pauses until
-- tests and human approval finish". Nothing kept that promise:
-- iac_engineering_gaps.source_intake_request_id was written and never read by
-- anything, and approve_iac_capability did not look at intake at all.
--
-- Two problems to fix, in order.

-- 1. The linkage is lossy -------------------------------------------------
--
-- Gap reuse is deliberate: one drafting effort serves every ticket asking for
-- the same action. But maybeCreateGap records only the FIRST ticket on the gap
-- row; later ones become an event whose detail carries a ticket number and no
-- intake request ID. So N tickets can wait on one capability and N-1 of them
-- are unrecoverable. A join table makes every waiting ticket addressable.

CREATE TABLE public.iac_engineering_gap_intake_requests (
  gap_id uuid NOT NULL REFERENCES public.iac_engineering_gaps(id) ON DELETE CASCADE,
  intake_request_id uuid NOT NULL REFERENCES public.servicenow_intake_requests(id) ON DELETE CASCADE,
  linked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (gap_id, intake_request_id)
);

INSERT INTO public.iac_engineering_gap_intake_requests (gap_id, intake_request_id)
SELECT id, source_intake_request_id FROM public.iac_engineering_gaps
WHERE source_intake_request_id IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE public.iac_engineering_gap_intake_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iac_engineering_gap_intake_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.iac_engineering_gap_intake_requests TO authenticated;
GRANT ALL ON public.iac_engineering_gap_intake_requests TO service_role;

CREATE POLICY iac_gap_intake_links_visible_to_requester_or_admin
ON public.iac_engineering_gap_intake_requests FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.servicenow_intake_requests r
    WHERE r.id = intake_request_id
      AND ((SELECT auth.uid()) = r.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))
  )
);

-- 2. Nothing revisits a waiting ticket ------------------------------------
--
-- A queue rather than a direct call, because resuming re-runs classification
-- against a live model and live Azure and can fail; that needs to be
-- retryable and visible, not swallowed inside an approval transaction.

CREATE TABLE public.iac_intake_resumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_request_id uuid NOT NULL REFERENCES public.servicenow_intake_requests(id) ON DELETE CASCADE,
  gap_id uuid REFERENCES public.iac_engineering_gaps(id) ON DELETE SET NULL,
  capability_id uuid REFERENCES public.iac_automation_capabilities(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','failed','skipped')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 10),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One live resumption per ticket; a finished one does not block a later retry.
CREATE UNIQUE INDEX iac_one_live_resumption_per_intake
  ON public.iac_intake_resumptions(intake_request_id) WHERE status IN ('queued','running');
CREATE INDEX iac_intake_resumptions_queue_idx ON public.iac_intake_resumptions(created_at) WHERE status = 'queued';

ALTER TABLE public.iac_intake_resumptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iac_intake_resumptions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.iac_intake_resumptions TO authenticated;
GRANT ALL ON public.iac_intake_resumptions TO service_role;

CREATE POLICY iac_intake_resumptions_visible_to_requester_or_admin
ON public.iac_intake_resumptions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.servicenow_intake_requests r
    WHERE r.id = intake_request_id
      AND ((SELECT auth.uid()) = r.requested_by_user_id OR (SELECT public.is_platform_admin(auth.uid())))
  )
);

-- Enqueue declaratively on approval rather than editing approve_iac_capability,
-- which is a reviewed security function with separation-of-duty, freshness and
-- snapshot checks under row locks. A trigger also means any future approval
-- path enqueues too, without remembering to.
CREATE FUNCTION public.enqueue_iac_intake_resumptions() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $enqueue$
BEGIN
  IF NEW.lifecycle_status = 'approved' AND OLD.lifecycle_status IS DISTINCT FROM 'approved' THEN
    INSERT INTO public.iac_intake_resumptions (intake_request_id, gap_id, capability_id)
    SELECT DISTINCT link.intake_request_id, gap.id, NEW.id
    FROM public.iac_engineering_gaps gap
    JOIN public.iac_engineering_gap_intake_requests link ON link.gap_id = gap.id
    JOIN public.servicenow_intake_requests intake ON intake.id = link.intake_request_id
    WHERE gap.linked_capability_id = NEW.id
      -- A ticket that already produced a package has nothing to resume.
      AND intake.change_package_id IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.iac_intake_resumptions queued
        WHERE queued.intake_request_id = link.intake_request_id AND queued.status IN ('queued','running')
      );
  END IF;
  RETURN NEW;
END;
$enqueue$;

CREATE TRIGGER enqueue_iac_intake_resumptions
  AFTER UPDATE ON public.iac_automation_capabilities
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_iac_intake_resumptions();

REVOKE ALL ON FUNCTION public.enqueue_iac_intake_resumptions() FROM PUBLIC, anon, authenticated;

-- Claim the next queued resumptions atomically, so two concurrent workers --
-- the cron poll and a human pressing Resume -- cannot process the same ticket.
CREATE FUNCTION public.claim_iac_intake_resumptions(p_limit integer DEFAULT 5)
RETURNS SETOF public.iac_intake_resumptions
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $claim$
BEGIN
  RETURN QUERY
  UPDATE public.iac_intake_resumptions SET status = 'running', attempts = attempts + 1, updated_at = now()
  WHERE id IN (
    SELECT id FROM public.iac_intake_resumptions
    WHERE status = 'queued' AND attempts < 5
    ORDER BY created_at
    FOR UPDATE SKIP LOCKED
    LIMIT greatest(1, least(coalesce(p_limit, 5), 25))
  )
  RETURNING *;
END;
$claim$;

CREATE FUNCTION public.finish_iac_intake_resumption(p_id uuid, p_status text, p_error text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $finish$
BEGIN
  IF p_status NOT IN ('succeeded','failed','skipped') THEN RAISE EXCEPTION 'invalid_resumption_status' USING ERRCODE = '22023'; END IF;
  UPDATE public.iac_intake_resumptions
  SET status = p_status, last_error = left(p_error, 2000), updated_at = now()
  WHERE id = p_id;
END;
$finish$;

REVOKE ALL ON FUNCTION public.claim_iac_intake_resumptions(integer), public.finish_iac_intake_resumption(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_iac_intake_resumptions(integer), public.finish_iac_intake_resumption(uuid, text, text) TO service_role;

COMMENT ON TABLE public.iac_intake_resumptions IS
  'Tickets waiting to be re-analysed because the capability they needed has since been approved. Enqueued by trigger on approval; drained by the servicenow-intake resume operation.';
