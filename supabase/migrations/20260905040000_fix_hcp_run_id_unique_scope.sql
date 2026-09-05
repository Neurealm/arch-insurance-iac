-- The plan and apply rows for one governed HCP saved plan share the same
-- hcp_run_id by design (apply executes the exact saved plan, it never
-- creates a new run). A unique index on hcp_run_id alone made every apply
-- insert collide with its own parent plan row, so no apply could ever
-- succeed. Scope uniqueness to (hcp_run_id, run_type) instead: still blocks
-- a duplicate plan or a duplicate apply for the same HCP run, but allows
-- the one plan row and one apply row that legitimately share an id.
DROP INDEX IF EXISTS public.iac_terraform_hcp_run_id_unique;

CREATE UNIQUE INDEX iac_terraform_hcp_run_id_unique
  ON public.iac_terraform_runs (hcp_run_id, run_type)
  WHERE hcp_run_id IS NOT NULL;
