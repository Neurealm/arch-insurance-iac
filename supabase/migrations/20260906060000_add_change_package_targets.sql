-- Phase 2 of the multi-agent VM-provisioning capability plan: let one
-- change package declare N target resources (e.g. "create 10 VMs" as one
-- package) instead of exactly one. This migration only adds the new table,
-- schema, backfill, and guardrail machinery -- terraform-orchestrator's
-- safeguards() rewrite to actually enforce N-target matching ships in the
-- same deploy as this migration, and no capability that produces N>1 yet
-- exists (create_vm is still Phase 3+), so all 4 existing capabilities keep
-- behaving exactly as today (N=1).

CREATE TABLE public.iac_change_package_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.iac_change_packages(id) ON DELETE CASCADE,
  target_resource_id text NOT NULL,
  target_name text NOT NULL,
  subscription_id text NOT NULL,
  resource_group text NOT NULL,
  region text NOT NULL,
  current_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, target_resource_id)
);

ALTER TABLE public.iac_change_packages
  ADD COLUMN target_count integer NOT NULL DEFAULT 1;

ALTER TABLE public.iac_automation_capabilities
  ADD COLUMN max_targets_per_run integer NOT NULL DEFAULT 1
    CHECK (max_targets_per_run BETWEEN 1 AND 50);

-- Backfill: every existing package becomes its own N=1 target row, using the
-- single-target columns that already live on iac_change_packages (those
-- columns stay in place -- for an N=1 package they remain the source of
-- truth and simply mirror the one row here; for a future N>1 package they
-- describe the package's primary/representative target for list views).
-- Done BEFORE the sync/guard triggers below exist, so it never has to touch
-- iac_change_packages itself (target_count's default of 1 is already
-- correct for every one of these N=1 rows) and can never trip the parent
-- table's terminal-immutability guard for already-executed/rejected packages.
INSERT INTO public.iac_change_package_targets
  (package_id, target_resource_id, target_name, subscription_id, resource_group, region, current_state)
SELECT id, target_resource_id, target_name, subscription_id, resource_group, region, current_state
FROM public.iac_change_packages;

-- Keep target_count in lockstep with the child table automatically, for all
-- CHANGES FROM HERE ON (the backfill above predates this trigger). In
-- practice this only ever fires while the parent package is still a draft:
-- the guard trigger below blocks any target mutation once the package
-- leaves draft, and a draft package's status transitions never hit the
-- parent table's terminal-immutability check.
CREATE OR REPLACE FUNCTION public.iac_change_package_target_count_sync()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  affected_package uuid := COALESCE(NEW.package_id, OLD.package_id);
BEGIN
  UPDATE public.iac_change_packages
  SET target_count = (SELECT count(*) FROM public.iac_change_package_targets WHERE package_id = affected_package)
  WHERE id = affected_package;
  RETURN NULL;
END;
$function$;

CREATE TRIGGER iac_change_package_target_count_sync
AFTER INSERT OR UPDATE OR DELETE ON public.iac_change_package_targets
FOR EACH ROW EXECUTE FUNCTION public.iac_change_package_target_count_sync();

-- Targets may only be declared/changed while the parent package is still a
-- draft -- mirrors iac_change_package_guard()'s immutability rule for the
-- parent row's own content columns, extended to this child table.
CREATE OR REPLACE FUNCTION public.iac_change_package_targets_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  package_status text;
BEGIN
  SELECT status INTO package_status FROM public.iac_change_packages WHERE id = COALESCE(NEW.package_id, OLD.package_id);
  IF package_status IS DISTINCT FROM 'draft' THEN
    RAISE EXCEPTION 'submitted_change_package_targets_are_immutable';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE TRIGGER iac_change_package_targets_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.iac_change_package_targets
FOR EACH ROW EXECUTE FUNCTION public.iac_change_package_targets_guard();

ALTER TABLE public.iac_change_package_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY iac_change_package_targets_select_requester_or_reviewer
ON public.iac_change_package_targets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.iac_change_packages p
    WHERE p.id = package_id
      AND ((SELECT auth.uid()) = p.created_by OR ((SELECT is_platform_admin(auth.uid())) AND p.status <> 'draft'))
  )
);

CREATE POLICY iac_change_package_targets_mutate_own_draft
ON public.iac_change_package_targets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.iac_change_packages p
    WHERE p.id = package_id AND p.created_by = (SELECT auth.uid()) AND p.status = 'draft'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.iac_change_packages p
    WHERE p.id = package_id AND p.created_by = (SELECT auth.uid()) AND p.status = 'draft'
  )
);
