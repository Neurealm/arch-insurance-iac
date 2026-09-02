# Governed Azure VM Terraform automation

Tickets provide validated inputs; they never provide Terraform source code. The
Supabase catalogue binds each action to an immutable, approved module version.

## Mandatory controls

1. The Azure-hosted runner uses Managed Identity and an Azure Blob backend.
2. Each change package receives an isolated backend key.
3. `terraform plan -out=<package>.tfplan` is stored in private Blob storage.
4. Approval binds the package, module version, inputs, Git commit, artifact URI,
   and SHA-256 digest.
5. Apply verifies and uses that exact artifact; it never creates a new plan.
6. Destroy, replacement, target mismatch, unapproved modules, and environment
   mismatches are blocked.
7. Ticket content is untrusted data, never source code or CLI arguments.

Capability lifecycle: `draft -> testing -> approved -> retired`.

AI may draft a missing module on a branch, but only a tested and human-approved
catalogue entry may be planned for a customer request.

## Runner contract

The `terraform-orchestrator` Edge Function submits asynchronous jobs to
`POST /v1/jobs`. The runner must use the supplied correlation ID as an
idempotency key and call the Edge Function back with:

- `operation: callback`
- `runId`
- `success`
- private `artifactUri`
- lowercase SHA-256 `planSha256`
- Terraform JSON `summary` and `changes`
- exact Azure `affectedResourceIds`

Apply jobs receive the approved artifact URI and digest. The runner must verify
the digest before `terraform apply` and must not accept arbitrary module paths.
