-- VM-specific change packages. Drafts belong to their creator; a submitted
-- package is immutable until a governed approval/execution workflow is added.
CREATE TABLE public.iac_change_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_number text NOT NULL UNIQUE,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  target_resource_id text NOT NULL CHECK (target_resource_id LIKE '/subscriptions/%'),
  target_name text NOT NULL CHECK (length(trim(target_name)) > 0),
  subscription_id text NOT NULL CHECK (length(trim(subscription_id)) > 0),
  resource_group text NOT NULL CHECK (length(trim(resource_group)) > 0),
  region text NOT NULL CHECK (length(trim(region)) > 0),
  action_type text NOT NULL CHECK (action_type IN ('start_vm', 'restart_vm', 'resize_vm', 'increase_os_disk', 'configure_backup', 'enable_monitoring', 'assess_patches')),
  action_label text NOT NULL CHECK (length(trim(action_label)) > 0),
  parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  rationale text NOT NULL CHECK (length(trim(rationale)) >= 10),
  current_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  policy_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_score integer NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level text NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
  approval_required boolean NOT NULL DEFAULT true,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT iac_change_packages_submission_timestamp CHECK (
    (status = 'draft' AND submitted_at IS NULL) OR (status = 'submitted' AND submitted_at IS NOT NULL)
  )
);

CREATE INDEX iac_change_packages_creator_updated_idx ON public.iac_change_packages (created_by, updated_at DESC);
CREATE INDEX iac_change_packages_resource_updated_idx ON public.iac_change_packages (target_resource_id, updated_at DESC);

ALTER TABLE public.iac_change_packages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.iac_change_packages FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.iac_change_packages TO authenticated;

CREATE POLICY "iac_change_packages_select_own" ON public.iac_change_packages
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = created_by);
CREATE POLICY "iac_change_packages_insert_own" ON public.iac_change_packages
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = created_by);
CREATE POLICY "iac_change_packages_update_own_draft" ON public.iac_change_packages
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = created_by AND status = 'draft')
  WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE OR REPLACE FUNCTION public.iac_change_package_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status <> 'draft' THEN
      RAISE EXCEPTION 'submitted_change_package_is_immutable';
    END IF;
    IF NEW.created_by <> OLD.created_by THEN
      RAISE EXCEPTION 'change_package_creator_cannot_change';
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

CREATE TRIGGER iac_change_package_guard_before_write
  BEFORE INSERT OR UPDATE ON public.iac_change_packages
  FOR EACH ROW EXECUTE FUNCTION public.iac_change_package_guard();
