-- Real VM package approval workflow: a submitted package can be reviewed once
-- by an authorized, non-requesting platform administrator. Review decisions are
-- immutable and the package itself is never altered after submission.
ALTER TABLE public.iac_change_packages
  DROP CONSTRAINT iac_change_packages_status_check,
  DROP CONSTRAINT iac_change_packages_submission_timestamp;

ALTER TABLE public.iac_change_packages
  ADD CONSTRAINT iac_change_packages_status_check
    CHECK (status IN ('draft', 'submitted', 'approved', 'changes_requested', 'rejected')),
  ADD CONSTRAINT iac_change_packages_submission_timestamp
    CHECK (
      (status = 'draft' AND submitted_at IS NULL)
      OR (status <> 'draft' AND submitted_at IS NOT NULL)
    );

CREATE TABLE public.iac_change_package_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL UNIQUE REFERENCES public.iac_change_packages(id) ON DELETE RESTRICT,
  decision text NOT NULL CHECK (decision IN ('approved', 'changes_requested', 'rejected')),
  comment text,
  reviewed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT iac_change_package_reviews_comment_required
    CHECK (decision = 'approved' OR length(trim(coalesce(comment, ''))) >= 10)
);

CREATE INDEX iac_change_package_reviews_reviewer_idx
  ON public.iac_change_package_reviews (reviewed_by, reviewed_at DESC);

ALTER TABLE public.iac_change_package_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.iac_change_package_reviews FROM anon;
GRANT SELECT ON TABLE public.iac_change_package_reviews TO authenticated;

CREATE POLICY "iac_change_packages_select_requester_or_reviewer"
  ON public.iac_change_packages
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = created_by
    OR (
      (SELECT public.is_platform_admin(auth.uid()))
      AND status <> 'draft'
    )
  );

DROP POLICY "iac_change_packages_select_own" ON public.iac_change_packages;

CREATE POLICY "iac_change_package_reviews_select_requester_or_reviewer"
  ON public.iac_change_package_reviews
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_platform_admin(auth.uid()))
    OR EXISTS (
      SELECT 1
      FROM public.iac_change_packages package
      WHERE package.id = package_id
        AND package.created_by = (SELECT auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.iac_change_package_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.created_by <> OLD.created_by THEN
      RAISE EXCEPTION 'change_package_creator_cannot_change';
    END IF;

    IF OLD.status = 'draft' THEN
      IF NEW.status NOT IN ('draft', 'submitted') THEN
        RAISE EXCEPTION 'draft_package_must_be_submitted_before_review';
      END IF;
    ELSIF OLD.status = 'submitted' THEN
      IF NEW.status NOT IN ('approved', 'changes_requested', 'rejected') THEN
        RAISE EXCEPTION 'submitted_package_requires_review_decision';
      END IF;
      IF ROW(
        NEW.package_number, NEW.target_resource_id, NEW.target_name,
        NEW.subscription_id, NEW.resource_group, NEW.region, NEW.action_type,
        NEW.action_label, NEW.parameters, NEW.rationale, NEW.current_state,
        NEW.policy_evidence, NEW.validation_plan, NEW.risk_score,
        NEW.risk_level, NEW.approval_required, NEW.submitted_at
      ) IS DISTINCT FROM ROW(
        OLD.package_number, OLD.target_resource_id, OLD.target_name,
        OLD.subscription_id, OLD.resource_group, OLD.region, OLD.action_type,
        OLD.action_label, OLD.parameters, OLD.rationale, OLD.current_state,
        OLD.policy_evidence, OLD.validation_plan, OLD.risk_score,
        OLD.risk_level, OLD.approval_required, OLD.submitted_at
      ) THEN
        RAISE EXCEPTION 'submitted_change_package_contents_are_immutable';
      END IF;
    ELSE
      RAISE EXCEPTION 'reviewed_change_package_is_immutable';
    END IF;
  END IF;

  IF NEW.status = 'submitted' AND NEW.submitted_at IS NULL THEN
    NEW.submitted_at := now();
  ELSIF NEW.status = 'draft' THEN
    NEW.submitted_at := NULL;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_iac_change_package(
  p_package_id uuid,
  p_decision text,
  p_comment text DEFAULT NULL
)
RETURNS public.iac_change_package_reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_package public.iac_change_packages%ROWTYPE;
  v_review public.iac_change_package_reviews%ROWTYPE;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  IF NOT public.is_platform_admin(v_actor) THEN
    RAISE EXCEPTION 'reviewer_not_authorized';
  END IF;
  IF p_decision NOT IN ('approved', 'changes_requested', 'rejected') THEN
    RAISE EXCEPTION 'invalid_review_decision';
  END IF;
  IF p_decision <> 'approved' AND length(trim(coalesce(p_comment, ''))) < 10 THEN
    RAISE EXCEPTION 'review_comment_must_contain_at_least_10_characters';
  END IF;

  SELECT * INTO v_package
  FROM public.iac_change_packages
  WHERE id = p_package_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'change_package_not_found';
  END IF;
  IF v_package.status <> 'submitted' THEN
    RAISE EXCEPTION 'only_submitted_packages_can_be_reviewed';
  END IF;
  IF v_package.created_by = v_actor THEN
    RAISE EXCEPTION 'self_approval_is_not_permitted';
  END IF;

  INSERT INTO public.iac_change_package_reviews (package_id, decision, comment, reviewed_by)
  VALUES (p_package_id, p_decision, nullif(trim(coalesce(p_comment, '')), ''), v_actor)
  RETURNING * INTO v_review;

  UPDATE public.iac_change_packages
  SET status = p_decision
  WHERE id = p_package_id;

  RETURN v_review;
END;
$$;

REVOKE ALL ON FUNCTION public.review_iac_change_package(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_iac_change_package(uuid, text, text) TO authenticated;
