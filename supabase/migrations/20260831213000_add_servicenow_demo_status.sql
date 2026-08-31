ALTER TABLE public.servicenow_intake_requests
  DROP CONSTRAINT IF EXISTS servicenow_intake_requests_status_check;

ALTER TABLE public.servicenow_intake_requests
  ADD CONSTRAINT servicenow_intake_requests_status_check CHECK (status IN (
    'received', 'analyzing', 'needs_clarification', 'ready_for_engineering',
    'comment_posted', 'comment_failed', 'demo_comment_generated', 'failed'
  ));
