# Azure VM IaC pilot: inspection and continuation

Inspected 2026-09-06 in `C:\repos\arch-insurance-iac`, based on main
`dbf0cc187f8c03993c5a5f455adf027ed82e42aa`. This document supersedes the
**current-status assertions**, not the historical record, in the September 4
handoff. Code present, historical test claims, and current deployment state are
different things. No Azure change, Terraform plan/apply, database migration,
deployment, merge, or push was performed during this inspection.

## Repository and architecture

The tracked tree contains the focused IaC application plus inherited platform
SQL, documentation, and utilities. The old module-discovery/NOVA/Meridian
documents describe a larger ancestor application; they are not evidence that
those products are still routed in the current `src/App.tsx`.

| Component | Entry point / authoritative source | Current responsibility |
| --- | --- | --- |
| Web application | `index.html`, `src/main.tsx`, `src/App.tsx` | React 18, Vite, TypeScript, React Router, React Query, Tailwind/shadcn; lazy-loaded authenticated IaC routes. |
| Identity | `src/context/AuthContext.tsx`, `src/components/routing/RequireAuth.tsx`, `supabase/functions/admin-*` | Supabase sessions, server-side identity verification and legacy platform-admin roles. Browser route guards do not replace backend authorization. |
| Azure discovery | `src/pages/agentic-iac/azureControlPlane.ts`, `azure-vm-operations-api/src/functions/vm-operations.js` | Browser calls authenticated Azure Function APIs; the operations API obtains Azure tokens using managed identity and reads VM configuration, relationships, monitoring, backup and patch observations. |
| Ticket intake | `DemoChangeRequest.tsx`, `ServiceNowIntake.tsx`, `supabase/functions/servicenow-intake/index.ts` | Separate demo ticket submission and analysis queue; external webhook support, normalization/deduplication, Gemini classification, Azure enrichment and clarification comments. |
| VM change workflow | `ChangeEngineering.tsx`, `ChangeReviewApproval.tsx`, `ExecutionCenter.tsx`, `ValidationEvidence.tsx` | Persisted packages, review, saved-plan execution UI and post-change evidence. |
| Terraform control plane | `supabase/functions/terraform-orchestrator/index.ts` | Capability lookup, input binding, GitHub source archive, HCP saved plan, synchronization and apply of an existing HCP run. |
| Missing-capability pipeline | `capability-resolver/`, `terraform-drafting-agent/`, engineering-gap migrations | Track missing capabilities, search the repository, draft modules with Gemini and open real GitHub PRs. |
| Storage/governance | `supabase/migrations/`, `supabase/tests/` | 138 migration files at the inspected revision, RLS/grants, review RPCs, package/run/target/gap/event tables. |
| Terraform source | `terraform/modules/`, `terraform/environments/pilot/`, `terraform/hcp/authentication-check/` | Existing VM action/resize roots and modules; separate read-only OIDC authentication test. |
| Legacy / utilities | `runner/`, `scripts/`, `.github/workflows/nova-kb-sync.yml`, `mem/`, `docs/modules/` | Historical runner contract, validation/KB scripts and inherited documentation. Do not rebuild these as if they were the next VM feature. |

The HCP roots deliberately omit a backend and use HCP-managed state. The
parent `terraform/environments/pilot/backend.tf` retains the old Azure Blob
backend; it is not included in the HCP source bundle. Do not combine the two
state authorities. HCP authentication uses generated OIDC credential files;
the repository does not require or create an Azure client secret.

The main branch contains VM **action/update** definitions, not the managed
configuration/state of every VM discovered in Azure. Discovery is not
Terraform ownership. The Azure VM's current size, OS, disks, identity, network,
and deployed runtime credentials were not re-queried in this code inspection.

## Completed implementation to preserve

- Live-data VM resource/twin/remediation screens and the package/review/
  execution/evidence screens exist. Unavailable Azure observations are surfaced
  rather than fabricated by the VM operations endpoint.
- Intake and module drafting use `google/gemini-2.5-flash` through the Lovable
  gateway. The VM remediation assessment is a separate rules-based feature;
  not every screen described as intelligence is an LLM call.
- HCP configuration-version upload, saved plans, plan hashes and exact-run
  apply requests exist. Human review requires another platform administrator,
  a successful HCP plan, a comment, and passing stored guardrail evidence.
- Phase 0 extracted read-only GitHub helpers and generalized Terraform CI.
- Phase 1 made module paths/input mapping capability-driven.
- Phase 2 introduced immutable-after-submission package target rows and a
  capability blast-radius limit.
- Phase 3 introduced engineering gaps, intake handoff and the resolver.
- Phase 4 introduced the separately write-credentialed Terraform drafting
  agent and PR tracking. Draft capabilities remain unapproved.
- Recent fixes already cover stable JSON comparisons, browser preflight,
  `planned_and_saved`, plan/apply HCP identity uniqueness and recovery when an
  apply-run insert fails. Do not reimplement these fixes.

The Git history records successful live development saved-plan and draft-PR
tests. Those messages are historical evidence, not a fresh runtime audit.
GitHub was checked read-only during this inspection: main matched local HEAD;
[PR #13](https://github.com/Neurealm/arch-insurance-iac/pull/13), a batch-VM
module draft at `4960c0e51ad029feb00f4c11541bcd1c67b2def7`, was open. Its
Terraform validation and governance SQL checks passed; application and broad
database checks were skipped. There was no recorded review decision. A green
syntax/SQL check does **not** approve the module or prove VM creation works.

## What remains unfinished or unsafe

### Authorization and approval

1. **Fixed locally in this continuation:** resolve/plan previously ran with a
   Supabase service-role client after authentication but without checking
   ownership of the supplied package ID. An unrelated signed-in user could
   reach privileged package binding and HCP planning. All four package
   operations now share the owner-or-administrator gate before dispatch.
   Missing/inaccessible packages return the same 404 response; lookup failures
   fail closed. Existing apply/status/business rules remain unchanged.
2. Review verifies the latest plan but the review row does not persist an
   immutable approved-plan ID/hash binding. Apply independently selects a
   successful plan. Close the concurrent-plan/approval race with transactional
   plan claims and an explicit reviewed plan reference before wider execution.
3. `requires_managed_resource` exists in the capability catalog but
   `packageCapability()` does not enforce a verified ownership/adoption check.
   An environment tag or browser-supplied parameter is not a trusted Azure
   scope policy. Enforce environment, subscription/RG and resource ownership
   on the server.

### Terraform and Azure

- `safeguards()` collects `resource_id` strings from `planned_values`. It does
  not validate every managed resource change, provider type, action and
  unknown value. New `azapi_resource` IDs can be unknown before creation;
  this existing-resource matcher is not a finished VM-provisioning policy.
- N-target persistence is implemented, but create-VM target declarations,
  subnet/RG authorization, derived NIC targets, typed parameter validation,
  quota/SKU/region checks and server-side target-to-plan mapping are not a
  complete pipeline. The intake still routes `create_vm` to a gap instead of
  resuming against a newly approved creation capability.
- One configured workspace per environment is reused while root
  configurations vary by action/module. Terraform state is persistent, not
  a per-ticket scratchpad. Test state continuity, repeated operations and
  cross-module changes without removing managed resources from configuration.
  A no-op plan does not prove a repeat restart will execute.
- Per-module version tags fall back to the global source ref, including when
  tag resolution errors. Module version labels are not immutable commit pins;
  promotion must bind reviewed source and distinguish missing tags from
  authentication/network errors.
- HCP apply success is not enough for closure. Current browser-side validation
  meaningfully checks start state, but returns a warning for other action
  states; it is not proof that a resize/restart/batch create succeeded. Move
  authoritative action-specific evidence collection/closure to the server.
- The Azure operations API retains a legacy direct-start execution route.
  Keep the Terraform path separate and verify that no alternate route can
  bypass the approved capability/run boundary before enabling more actions.

### AI agents and feature completion

- **Phase 5, `terraform-ci-status-sync`, does not exist.** PR tracking columns
  explicitly name it as the next consumer. There is no implementation that
  records current-head CI results and advances draft gaps for human review.
- Resolver/drafter invocation is implemented, but scheduling is not committed.
  No durable claim/lease protects all agent work from duplicate concurrent
  invocations. GitHub failure and event-write paths need reconciliation.
- Draft validation is based on regexes in `moduleMainTf`, not a parser and
  complete HCL policy across all generated files. The claim that it rejects
  every resource outside the allowlist is stronger than the code guarantees.
  Root variable/type strings also originate from the model. Do not enable a
  generated capability just because `terraform validate` passes.
- There is no complete capability-promotion UI/API with immutable reviewed
  revision, independent human sign-off, tests and resumable ticket linkage.
  The intake UI still describes a blocked engineering gap as clarification in
  its next-step text; it does not show the gap's PR/CI lifecycle.
- Some platform-administration screens remain demonstrations:
  `platform/policyData.ts` explicitly describes a mock policy simulation.
  These screens are not the backend enforcement mechanism.

### Tests, CI and documentation

- The pre-existing frontend test suite contains one example assertion, not
  VM workflow regression coverage. SQL governance tests mostly inspect
  schema/grants/catalog invariants, not race conditions or full user journeys.
- `bp1-1-platform-foundation.yml` skips its `changes` job on push, and its
  dependent jobs lack the status condition needed to run after that skip.
  GitHub confirmed the latest main run was skipped. The new independent
  authorization test workflow avoids inheriting this problem; the existing
  aggregate workflow still needs repair and full verification.
- The disposable governance fixture omits the later HCP uniqueness-fix
  migration. The migration directory also contains both original governance
  DDL and a later consolidated copy. Clean full replay is not established by
  the selected-migration CI job. Reconcile migration history without deleting
  applied migrations or resetting a shared database.
- `runner/README.md` describes an abandoned self-hosted/Blob design; the
  September 4 handoff incorrectly presents later deployed work as absent.
  Use this report plus current code/history for continuation, not a stale
  statement of live deployment state.
- The root npm lockfile has existing user updates reconciling dependencies.
  Neither it nor the existing drafting prompt edit was changed in this step.

## Implementation order and acceptance criteria

| Milestone | Work | Completion evidence |
| --- | --- | --- |
| 1. Close execution trust gaps | Deploy the tested package-access fix after review; bind approvals to an exact plan and block concurrent unreviewed substitution; enforce Azure scope/ownership. | Negative authorization/race tests and one independent-user saved-plan review with apply disabled. |
| 2. Complete draft-to-review (Phase 5) | Add deterministic CI synchronization using a read-only GitHub token. Match repository, PR, current head SHA and the required workflow/jobs; persist evidence atomically. Handle reruns/new commits, missing/skipped/failed checks, closed PRs and API outages. | A real draft PR's current checks appear on its gap; stale/unknown evidence cannot yield `ci_passed`; no capability is auto-approved and no Terraform run occurs. |
| 3. Govern capability promotion | Add human review, complete HCL policy, isolated static/security tests, immutable source promotion and durable ticket-gap linkage. Resume complete intake requests only after approval. | Approved capability identifies exactly the reviewed code; rejected/changed drafts cannot be executed; requester sees the correct blocked/resume state. |
| 4. Complete provisioning/state safety | Implement server-resolved typed creation inputs and all intended targets, workspace/state ownership, concurrency, Azure prechecks and action-specific plan validation. | Non-applicable/read-only or supervised plan tests cover multi-VM/NIC boundaries, unknown IDs, forbidden resources, repeat runs and state continuity. |
| 5. Supervised end-to-end pilot | After explicit authorization and least-privilege runtime review, apply one exact development saved plan; capture independent server-side Azure evidence and governed closure. | Stored approval/run/source/target evidence agrees with observed Azure state; failures/retries are auditable. No production execution is implied. |

The first implementation component was the **orchestrator package-authorization
boundary**, because extending automation before closing it would increase the
impact of an existing access-control defect. The next additive feature is
Phase 5 CI synchronization; it can be developed without authorizing new Azure
execution while the remaining milestone-1 execution gates are hardened.

## This continuation: local verification and handoff

- New production router: `supabase/functions/terraform-orchestrator/request-handler.ts`.
- Production entry point uses that router; HCP/capability implementations were
  retained rather than rewritten.
- `node --test supabase/functions/terraform-orchestrator/request-handler.test.ts`:
  **51 passed**. Tests exercise unauthorized/owner/admin access for every
  operation, identity spoofing in payloads, malformed requests, missing
  packages, lookup outages and ordering before side effects.
- Strict TypeScript check and focused ESLint for the new handler/tests: passed.
- The Edge runtime check exposed an existing `BufferSource` type mismatch in
  the plan-hash helper. `plan-digest.ts` now uses an ArrayBuffer-backed byte
  view without changing the hash encoding; six compatibility tests cover
  known hashes, byte views/offsets, shared buffers and UTF-8 plan JSON.
- Combined cloud-free test suite: **57 passed**. Full orchestrator Deno type
  check passed using `deno check --no-config --no-lock --node-modules-dir=none
  supabase/functions/terraform-orchestrator/index.ts`. This uses Deno's cache
  rather than changing the user's existing npm dependency tree/lockfile.
- Application TypeScript check (`tsc --noEmit -p tsconfig.app.json`): passed.
- Existing frontend test (`npm test -- --reporter=dot`): 1 passed; this does not
  constitute an end-to-end regression suite.
- `npm run build`: passed; Browserslist reported stale compatibility data.
- Azure operations JavaScript syntax check: passed.
- New `.github/workflows/terraform-orchestrator-tests.yml` runs the isolated
  tests on relevant PRs and main pushes without package installation or cloud
  credentials. It has not run remotely yet.
- No database schema changed, so no new migration is required for this fix.
- Working-tree changes are local and uncommitted. Deployment and live
  cross-account denial verification are still required before claiming the
  running site is patched.

Preserved pre-existing local work: `package-lock.json`, the prompt addition in
`supabase/functions/terraform-drafting-agent/index.ts`, `.claude/` and
`supabase/.temp/`. Do not stage these incidentally when committing this patch.
