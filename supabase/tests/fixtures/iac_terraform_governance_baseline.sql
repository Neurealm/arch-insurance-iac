-- Minimal pre-existing platform contract needed to test the Terraform
-- governance migration in isolation. The full historical migration chain has
-- independent legacy failures and is exercised by the baseline SQL job.
CREATE TABLE public.iac_change_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'submitted'
);

CREATE TABLE public.iac_change_package_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.iac_change_packages(id) ON DELETE CASCADE,
  decision text NOT NULL,
  comment text,
  reviewed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT false;
$$;
