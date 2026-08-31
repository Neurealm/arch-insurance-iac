-- ServiceNow webhook intake and LLM triage evidence.
-- The webhook writes through the Edge Function service role. Platform users
-- can read requests only when they are the mapped requester or platform admin.
CREATE TABLE public.servicenow_intake_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL CHECK (length(trim(ticket_number)) > 0),
  service_now_sys_id text,
  ticket_updated_at timestamptz,
  payload_hash text NOT NULL CHECK (length(trim(payload_hash)) > 0),
  status text NOT NULL DEFAULT 'received' CHECK (status IN (
    'received', 'analyzing', 'needs_clarification', 'ready_for_engineering',
    'comment_posted', 'comment_failed', 'failed'
  )),
  requested_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ticket_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_request jsonb NOT NULL DEFAULT '{}'::jsonb,
  llm_analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  azure_observation jsonb NOT NULL DEFAULT '{}'::jsonb,
  clarification_note text,
  change_package_id uuid REFERENCES public.iac_change_packages(id) ON DELETE SET NULL,
  error_message text,
  received_at timestamptz NOT NULL DEFAULT now(),
  analyzed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_number, payload_hash)
);

CREATE INDEX servicenow_intake_status_updated_idx
  ON public.servicenow_intake_requests (status, updated_at DESC);
CREATE INDEX servicenow_intake_ticket_idx
  ON public.servicenow_intake_requests (ticket_number, updated_at DESC);

CREATE TABLE public.servicenow_intake_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.servicenow_intake_requests(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (length(trim(event_type)) > 0),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX servicenow_intake_events_request_created_idx
  ON public.servicenow_intake_events (request_id, created_at ASC);

ALTER TABLE public.servicenow_intake_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicenow_intake_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.servicenow_intake_requests FROM anon;
REVOKE ALL ON TABLE public.servicenow_intake_events FROM anon;
GRANT SELECT ON TABLE public.servicenow_intake_requests TO authenticated;
GRANT SELECT ON TABLE public.servicenow_intake_events TO authenticated;

CREATE POLICY "servicenow_intake_select_mapped_or_admin" ON public.servicenow_intake_requests
  FOR SELECT TO authenticated
  USING (
    requested_by_user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = (SELECT auth.uid()) AND role = 'platform_admin'
    )
  );

CREATE POLICY "servicenow_intake_events_select_mapped_or_admin" ON public.servicenow_intake_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.servicenow_intake_requests request
      WHERE request.id = request_id
        AND (
          request.requested_by_user_id = (SELECT auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (SELECT auth.uid()) AND role = 'platform_admin'
          )
        )
    )
  );

CREATE TRIGGER servicenow_intake_requests_updated_at
  BEFORE UPDATE ON public.servicenow_intake_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
