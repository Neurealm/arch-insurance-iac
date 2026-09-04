# Governed Azure VM Terraform automation

HCP Terraform is the state and execution authority for this pilot. The legacy
Azure Blob backend at `terraform/environments/pilot/backend.tf` is retained only
for historical reference and is not part of the HCP execution path.

## Execution boundary

1. The application resolves a package against an approved capability.
2. Its server-side orchestrator reads only allowlisted Terraform source from the
   protected repository and records the resolved commit SHA.
3. It uploads a temporary HCP configuration version and queues a saved plan in
   the existing environment workspace.
4. The application stores the HCP run, plan, configuration-version, source
   revision, and SHA-256 of the HCP JSON plan.
5. A different human administrator may approve only a clean HCP saved plan.
6. Apply uses HCP's apply action for that same run. It never regenerates a plan.

The two root configurations are packaged with their matching local module:

- `environments/pilot/vm-action` for start, stop, and restart;
- `environments/pilot/vm-resize` for non-production resize.

They rely on HCP Terraform Azure dynamic credentials. They do not accept a
client secret and do not configure an Azure Blob backend.

## Required server-side configuration

Set these as Supabase Edge Function secrets, never browser variables:

- `HCP_TERRAFORM_PLAN_TOKEN` — HCP team token limited to planning the pilot workspace;
- `HCP_TERRAFORM_APPLY_TOKEN` — separately scoped HCP token permitted to apply only
  after the application approval boundary;
- `HCP_TERRAFORM_DEVELOPMENT_WORKSPACE_ID` and `_NAME`;
- `HCP_TERRAFORM_PREPRODUCTION_WORKSPACE_ID` and `_NAME`;
- `GITHUB_TERRAFORM_SOURCE_TOKEN` — read-only access to this repository;
- optional `HCP_TERRAFORM_SOURCE_REF` — protected branch or immutable release ref.

Before setting the application secrets, run the plan-only authentication test in
PR #2. No apply is authorized until that test succeeds and the saved-plan review
flow has been validated in development.
