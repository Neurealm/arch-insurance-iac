# Controlled Terraform runner

This directory defines the trusted execution boundary between the application orchestrator and Azure. It intentionally contains no deployable runner implementation yet because the Azure hosting service, private networking, and managed identity must be agreed before code is selected.

The runner must:

1. Accept only jobs matching `contracts/terraform-job.schema.json`.
2. Authenticate the orchestrator and enforce idempotency using `correlationId`.
3. Resolve `moduleSource` from an internal allowlist; never execute ticket-supplied HCL or shell text.
4. Use managed identity for Azure and Azure AD authentication for the Blob state backend.
5. Create a saved plan, store it in private immutable storage, and return its SHA-256 digest.
6. Reject plans that affect resources outside `inputs.target_resource_id` or contain unapproved replacement/destruction.
7. Apply only the saved artifact whose digest matches the approved plan.
8. Send authenticated callbacks to the orchestrator and never log tokens or callback secrets.
9. Run one isolated working directory per job with execution timeouts and complete audit logs.

Do not deploy a runner until state storage, artifact storage, identity/RBAC, network access, and secret delivery are configured.
