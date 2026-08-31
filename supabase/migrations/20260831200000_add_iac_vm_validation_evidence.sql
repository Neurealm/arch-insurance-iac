-- Durable VM validation and evidence records for post-execution change closure.
CREATE TABLE public.iac_validation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL UNIQUE REFERENCES public.iac_change_packages(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'verified', 'failed', 'closed')),
  started_at timestamptz,
  completed_at timestamptz,
  closed_at timestamptz,
  validated_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  confidence integer CHECK (confidence BETWEEN 0 AND 100),
  before_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  after_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  evidence_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.iac_validation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.iac_validation_runs(id) ON DELETE CASCADE,
  check_code text NOT NULL,
  domain text NOT NULL,
  measure text NOT NULL,
  expected text NOT NULL,
  observed text NOT NULL,
  result text NOT NULL CHECK (result IN ('PASS', 'WARN', 'FAIL')),
  source text NOT NULL,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  checked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, check_code)
);

CREATE TABLE public.iac_evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.iac_validation_runs(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('azure_observation', 'execution_event', 'validation_output', 'approval_record')),
  name text NOT NULL,
  source text NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text
);

CREATE INDEX iac_validation_results_run_idx ON public.iac_validation_results(run_id, checked_at);
CREATE INDEX iac_evidence_items_run_idx ON public.iac_evidence_items(run_id, captured_at);

ALTER TABLE public.iac_validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iac_evidence_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.iac_validation_runs, public.iac_validation_results, public.iac_evidence_items FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.iac_validation_runs TO authenticated;
GRANT SELECT, INSERT ON TABLE public.iac_validation_results, public.iac_evidence_items TO authenticated;

CREATE POLICY "iac_validation_runs_visible_to_package_participants" ON public.iac_validation_runs
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.iac_change_packages p WHERE p.id = package_id
      AND (p.created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid()))))
  );
CREATE POLICY "iac_validation_runs_insert_for_package_participants" ON public.iac_validation_runs
  FOR INSERT TO authenticated WITH CHECK (
    created_by = (SELECT auth.uid()) AND EXISTS (SELECT 1 FROM public.iac_change_packages p WHERE p.id = package_id
      AND (p.created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid()))))
  );
CREATE POLICY "iac_validation_runs_update_for_package_participants" ON public.iac_validation_runs
  FOR UPDATE TO authenticated USING (
    created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid()))
  ) WITH CHECK (created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid())));

CREATE POLICY "iac_validation_results_visible_to_package_participants" ON public.iac_validation_results
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.iac_validation_runs r JOIN public.iac_change_packages p ON p.id = r.package_id
      WHERE r.id = run_id AND (p.created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid()))))
  );
CREATE POLICY "iac_validation_results_insert_for_package_participants" ON public.iac_validation_results
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.iac_validation_runs r JOIN public.iac_change_packages p ON p.id = r.package_id
      WHERE r.id = run_id AND (p.created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid()))))
  );

CREATE POLICY "iac_evidence_items_visible_to_package_participants" ON public.iac_evidence_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.iac_validation_runs r JOIN public.iac_change_packages p ON p.id = r.package_id
      WHERE r.id = run_id AND (p.created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid()))))
  );
CREATE POLICY "iac_evidence_items_insert_for_package_participants" ON public.iac_evidence_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.iac_validation_runs r JOIN public.iac_change_packages p ON p.id = r.package_id
      WHERE r.id = run_id AND (p.created_by = (SELECT auth.uid()) OR public.is_platform_admin((SELECT auth.uid()))))
  );
