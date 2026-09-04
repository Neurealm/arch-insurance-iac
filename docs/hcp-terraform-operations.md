# HCP Terraform VM pilot operations

## What is already external to this repository

The pilot uses existing API-driven HCP Terraform workspaces, Microsoft Entra
workload identity federation, and resource-group scoped Azure authorization.
This repository does not create, rotate, or expose those credentials.

## Safe enablement order

1. Merge PR #2 after its checks are green.
2. Confirm the four Azure dynamic-credentials settings are **environment**
   variables in each HCP workspace. If they are Terraform input variables, the
   Azure provider will not receive them and the OIDC plan will fail.
3. Create the short-lived plan-only HCP team token and run the PR #2 manual
   read-only authentication test against the development workspace and existing
   VM. Do not apply.
4. Add a separate least-privilege HCP apply credential only after the plan test
   and an application review demonstration succeed. A plan-only token cannot
   safely perform the final saved-plan apply.
5. Configure the listed Edge Function secrets and deploy the migration and
   `terraform-orchestrator` function.
6. Submit a development change package, inspect the HCP saved plan in the
   application and HCP, approve it with a different administrator, then decide
   whether a supervised development apply is authorized.

## Deliberate restrictions

- Production has no configured HCP workspace in the application path.
- The generated archive contains only allowlisted `.tf` files for an approved
  VM action or resize module; ticket text never becomes Terraform source.
- The application resolves a Git commit before uploading the HCP configuration
  version and preserves that commit with the package evidence.
- It rejects plan output that includes a destroy, replacement, more than one
  ARM target, or a target other than the package VM.
- Browser code cannot access HCP, GitHub source, or Azure credentials.
