# Deployment reconciliation — September 6, 2026 (America/New_York)

This supersedes deployment-status claims in the earlier inspection report,
not its remaining production-readiness gaps.

## Completed

- The live database already contained capability promotion, exact Terraform
  approval, and authoritative validation migrations. Verified RPC signatures
  and grants; no migrations were rerun and no schema/data repair was performed.
- Deployed `terraform-orchestrator` v25, `terraform-ci-status-sync` v1,
  `vm-change-validation` v1, and `terraform-drafting-agent` v8.
- Read back the deployed orchestrator: package authorization, scope bindings,
  and plan reservation code are present.
- All four functions return OPTIONS 200 for the production origin and POST
  401 without authentication. No credential was printed.
- Published the current `azure-vm-operations-api` package to the existing
  `arch-iac-vm-operations-dev-01` Function App. It adds fresh VM identity/state
  evidence and retires direct execution with authenticated HTTP 410. No local
  settings were published or overwritten.
- The Azure deployment pipeline completed, but the older Core Tools client
  reported an unhealthy final probe. Independent ARM host status returned
  `Running`; both HTTP routes are enabled, and the legacy execution route
  returned OPTIONS 200 / unauthenticated POST 401. Authenticated 410 was not
  smoke-tested.

## Deployment corrections and verification

- Fixed nullable CI evidence SHA typing without weakening approval.
- Fixed HCL interpolation escaping: JavaScript consumed the intended doubled
  dollar sign in a replacement string. A callback now preserves the literal
  escape. Added two regression tests and CI coverage.
- Corrected invalid nested single-line HCL in the positive test fixture;
  the production parser policy was not relaxed.
- Passed: 175 Node tests, 40 HCL policy tests, four Edge Function Deno checks,
  application TypeScript check, Azure JavaScript syntax, and Vite build.

## Remaining — full deployment is not complete

- Live frontend still loads `index-CVoFjotC.js`, uses the old
  `review_iac_change_package` RPC, and lacks Capability Approval. The matching
  local frontend builds but has not been published.
- Lovable's existing private project shows "You don't have access" / sign-in.
  The user must sign in with the project-owning account before publication.
- Local HEAD is `781b9e0c`, three commits ahead of GitHub main (`dbf0cc18`).
  This session's deployment corrections are uncommitted. Release must use the
  matching reviewed source, not the older main.
- Supabase CLI secret listing returned 403. Secret presence and reviewed scope
  binding values were not independently verified. Do not fabricate state
  attestation or enable apply to bypass a missing gate.
- Authenticated end-to-end verification is pending. No HCP run, approval,
  Terraform apply, ticket creation, or Azure VM mutation was performed.
- Azure reports the existing Node 20 runtime. Its upgrade is separate
  maintenance work; runtime configuration was not changed.

Keep execution disabled until frontend/backend versions and the reviewed
runtime scope are consistent. Provisioning, restart evidence, state continuity,
and broader production qualification remain separate unfinished work.
