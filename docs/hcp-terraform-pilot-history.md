# Governed Azure VM Terraform pilot — handoff record

Last verified: 2026-09-04

**Historical snapshot:** the implementation advanced after this date. Read
[the September 6 inspection and continuation](implementation-status-2026-09-06.md)
first for current code status, remaining gaps and test evidence. The deployment
blockers and single-target limitations below describe September 4, not a fresh
inspection of the running platform.

This is the authoritative implementation history and continuation guide for the
governed Azure VM Terraform pilot. It is deliberately factual: a feature is
either **validated**, **implemented but not deployed**, or **not enabled**.

## Objective

Build a workflow that can make an Azure VM change only through this sequence:

1. A user submits a governed VM change package.
2. The platform creates an immutable HCP Terraform saved plan for the requested
   VM and action.
3. The platform stores and validates the HCP plan evidence.
4. A different authorized administrator approves the exact clean plan.
5. HCP Terraform applies that same saved plan, if and only if a separately
   scoped apply credential has been enabled.

No browser client receives an Azure, HCP Terraform, GitHub, or Supabase service
credential.

## Current external setup

- HCP Terraform organization: `Arch-Neugain`.
- HCP project: `arch-insurance-iac-pilot`.
- API-driven workspaces: `arch-vm-ops-development` and
  `arch-vm-ops-preproduction`.
- HCP Terraform owns state and remote execution for this new path. The legacy
  Azure Blob backend under `terraform/environments/pilot` is historical only
  and must not be used by the HCP path.
- Azure authentication uses Microsoft Entra workload identity federation; no
  client secret is used or required.
- The pilot identity is scoped to the pilot resource group and intentionally
  cannot register Azure Resource Providers at subscription scope.

## Validated work

- PR #2 added the manual GitHub Actions HCP Terraform Azure OIDC authentication
  check and was merged.
- PR #3 disabled AzureRM automatic resource-provider registration in the
  read-only test and was merged. This preserves least privilege for the
  resource-group-scoped pilot identity.
- The manual GitHub workflow **HCP Terraform Azure OIDC authentication test**
  passed on 2026-09-04 against the existing development VM. It uploaded a
  read-only configuration, completed a speculative plan, and reported zero
  resource changes. A speculative run cannot be applied.
- Terraform static validation and the Terraform-governance SQL contract passed
  for both PRs.

The first read-only HCP run failed only because AzureRM attempted subscription
scope provider registration. No Azure resource changed. The PR #3 configuration
fix resolved that failure.

## Implemented but not deployed

- `supabase/migrations/20260904110000_add_hcp_terraform_saved_plan_governance.sql`
  adds HCP run/plan identity and prevents approval without a successful,
  request-matched HCP saved plan.
- `supabase/functions/terraform-orchestrator/index.ts` creates configuration
  versions, uploads an allowlisted Terraform archive, queues a saved plan,
  synchronizes its JSON evidence, validates guardrails, and requests apply only
  for the saved HCP run.
- The approved HCP roots are:
  - `terraform/environments/pilot/vm-action` for start, stop, and restart.
  - `terraform/environments/pilot/vm-resize` for a VM SKU change.

The orchestrator rejects a plan with a destroy, replacement, unexpected target,
or more than one affected ARM resource.

## Deployment blocker

The local repository configuration names Supabase project `esfpbiishpkvhlejnxzq`.
As of 2026-09-04, the authenticated Supabase CLI account cannot see or link that
project. Do not substitute a different project merely because it appears in
`supabase projects list`.

Before deployment, authenticate the CLI to the account/organization that owns
the configured project, then verify it can link that exact project. Database
passwords, API tokens, and service-role keys must never be committed or sent in
chat.

## Required server-side configuration before deployment

Set these as Supabase Edge Function secrets, never browser variables:

- `HCP_TERRAFORM_PLAN_TOKEN`
- `HCP_TERRAFORM_APPLY_TOKEN` — leave absent until a supervised development
  apply is explicitly authorized.
- `HCP_TERRAFORM_DEVELOPMENT_WORKSPACE_ID`
- `HCP_TERRAFORM_DEVELOPMENT_WORKSPACE_NAME`
- `HCP_TERRAFORM_PREPRODUCTION_WORKSPACE_ID`
- `HCP_TERRAFORM_PREPRODUCTION_WORKSPACE_NAME`
- `GITHUB_TERRAFORM_SOURCE_TOKEN` — read-only repository access only.
- `HCP_TERRAFORM_SOURCE_REF` — use a protected branch or immutable release ref.
- `APP_ORIGINS` — exact application origins allowed to call the function.

The automatic Supabase server credentials are consumed by the function at
runtime and must not be copied into repository configuration.

## Not enabled

- The Supabase migration and `terraform-orchestrator` Edge Function are not
  deployed to the target project.
- Application-created HCP saved plans are therefore not yet live.
- No HCP Terraform apply credential has been configured for application use.
- No Azure VM action has been applied through this workflow.
- Production execution is not configured.

The HCP Terraform Free plan provides only the `owners` team. An owners token is
acceptable only for the completed read-only demonstration, not for real
production execution. Obtain a plan with least-privilege teams or another
equivalent separation-of-duties mechanism before enabling apply.

## Safe continuation order

1. Restore Supabase CLI access to the configured project and verify the link.
2. Review the migration against the target database, then deploy it.
3. Set only the plan token and read-only GitHub source token; deploy
   `terraform-orchestrator`.
4. Create a development VM package in the UI and confirm the platform creates a
   clean, saved HCP plan whose evidence matches exactly one VM.
5. Demonstrate approval using a different administrator. Do not apply.
6. Only after a separate review, configure a least-privilege apply token and
   authorize one supervised development apply.

## Important repository locations

- HCP operational instructions: `docs/hcp-terraform-operations.md`
- Terraform architecture and required secrets: `terraform/README.md`
- HCP read-only authentication check: `terraform/hcp/authentication-check/`
- HCP saved-plan orchestrator: `supabase/functions/terraform-orchestrator/`
- HCP governance migration: `supabase/migrations/20260904110000_add_hcp_terraform_saved_plan_governance.sql`
- Manual read-only workflow:
  `.github/workflows/hcp-terraform-authentication-test.yml`
