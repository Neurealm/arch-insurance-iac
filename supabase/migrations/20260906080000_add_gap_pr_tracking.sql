-- Phase 4 prep: track the PR a terraform-drafting-agent run opens for a
-- gap, so terraform-ci-status-sync (Phase 5) knows what to poll and a
-- future admin UI can link straight to the PR under review.
ALTER TABLE public.iac_engineering_gaps
  ADD COLUMN draft_branch text,
  ADD COLUMN draft_pr_number integer,
  ADD COLUMN draft_pr_url text;
