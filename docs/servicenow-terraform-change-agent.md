# ServiceNow Terraform Change Agent

## Purpose and non-negotiable boundary

The ServiceNow Terraform Change Agent turns one permanent ServiceNow ticket
conversation into either a concise clarification or a governed, **draft-only**
Terraform change package. It prepares evidence and code for human review. It
does not run Terraform plans, applies, destroys, imports, HCP Terraform runs,
promotion/deployment pipelines, PR merges, or infrastructure actions.

The existing `servicenow-intake` pilot and reusable `iac_engineering_gaps`
remain in place during migration. A reusable capability gap is not the same
thing as the new ticket-scoped governed gap; the new workflow keeps both
concepts separate.

## Architecture

```text
ServiceNow webhook / demo note
  -> signature and caller verification
  -> redaction + immutable ticket snapshot
  -> canonical ticket event ledger (ticket number is the correlation key)
  -> candidate extraction (LLM is untrusted)
  -> deterministic reconciliation + validation + question registry
  -> governed ticket gap
  -> isolated static validation only
  -> GitHub draft PR writer
  -> human review handoff
```

The database is the authority for workflow state, idempotency, audit history,
and permitted transitions. The model can suggest candidates; it cannot choose a
state transition, invoke a tool, or make an infrastructure change.

## Durable records

The Phase 1 migration adds the following service-managed records:

- `servicenow_intake_tickets`: one canonical ticket header and optimistic
  workflow version.
- immutable snapshots, events, attachments, facts, requirement revisions,
  question events, conflict members, workflow transitions, tool audits, and
  idempotency records.
- `servicenow_intake_question_registry`: one semantic question thread per
  canonical field.
- versioned request schemas and policies.
- one ticket-scoped governance gap, package, validation-run collection, and
  draft PR record per ticket.

RLS prevents browser writes. Service-only RPCs lock the ticket row, check the
expected version, write the immutable event, and update the state atomically.
The state machine is:

```text
INGESTED -> ANALYZING -> WAITING_FOR_INFORMATION | REQUEST_COMPLETE | BLOCKED | FAILED
REQUEST_COMPLETE -> GAP_CREATED -> PACKAGE_GENERATED -> PACKAGE_VALIDATED
                 -> DRAFT_PR_CREATED -> HANDOFF_COMPLETE
```

Artifact-backed states cannot be set through the generic transition RPC. A
gap, package, validation attestation, or draft PR must be written in the same
transaction as its corresponding transition.

## Security controls

- Ticket text, comments, and attachment text are data, never instructions.
- A recursive redactor removes secret-like fields and common inline credential
  forms before durable agent storage and before an LLM prompt.
- The first verified ticket number and ServiceNow `sys_id` are immutable. A
  later mismatch is an explicit conflict; it cannot redirect a comment to a
  different ticket.
- Delayed webhook events cannot replace a newer canonical snapshot.
- Static-validation records only accept an allowlisted non-deploying command
  class. Prohibited operations are also denied by the agent policy layer.
- GitHub draft creation requires a validated package, a draft flag, exact
  package digest, ticket/gap traceability, and service-only credentials.

## Deployment order

1. Apply `20260910235525_service_now_change_agent_foundation.sql`.
2. Deploy the updated `servicenow-intake` Edge Function.
3. Verify a demo ticket writes a canonical ticket, snapshot, and legacy-link
   row before enabling any later workflow phase.
4. Add the ServiceNow history adapter and durable fact/question writer.
5. Add the isolated package generator and static validator.
6. Enable the ticket-specific draft PR adapter only after its end-to-end tests
   pass. Do not repoint the existing reusable-capability drafting path early.

## Configuration

All secrets stay server-side. Required Phase 1 variables are:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
LOVABLE_API_KEY
SERVICENOW_WEBHOOK_SECRET             # legacy compatibility only
SERVICENOW_WEBHOOK_HMAC_SECRET        # required before production cutover
SERVICENOW_BASE_URL
SERVICENOW_CLIENT_ID
SERVICENOW_CLIENT_SECRET
SERVICENOW_CHANGE_TABLE
APP_ORIGIN
```

The source-control writer must use a separate, repository-limited credential.
It must not share a credential with an infrastructure runner, Terraform state,
or HCP Terraform.

## Mocked example

`REQ0012345` is opened with a VM request and its initial fields. The agent
stores an immutable snapshot. A requester later adds a subnet ARM ID. The new
event is stored separately, then merged with the original description and
fields. The requester is asked only for any still-missing valid fields; the
previous subnet question is not repeated. If all policy fields are valid, the
agent creates exactly one governed ticket gap, then a package record, then
records static validation. Only a successful final static-validation
attestation permits a **draft** PR record. No Terraform plan or Azure action is
performed anywhere in this flow.

## Current implementation status

Phase 1 is a dual-write foundation and fixes the observed lost-history defect.
It is deliberately not a claim that the entire production lifecycle is live:

- complete ServiceNow journal/catalog-variable/attachment retrieval;
- persistent fact extraction and question-resolution transactions;
- isolated Terraform generation/validation; and
- ticket-specific GitHub draft-PR creation

are subsequent phases. Until those are tested end-to-end, the legacy pilot
continues to own its existing package/capability behavior, and no new automated
PR path is enabled.

**Update:** the "persistent fact extraction and question-resolution
transactions" gap above is now closed for `servicenow-intake-agent` (not for
`servicenow-intake`) -- see
[servicenow-change-readiness-agent.md](servicenow-change-readiness-agent.md).
That work deliberately reuses the *existing* `iac_engineering_gaps`/
`iac_change_packages` pipeline instead of this document's ticket-scoped gap/
package/validation-run/draft-PR tables, which remain unimplemented and are
not on that agent's roadmap. "Isolated Terraform generation" and
"ticket-specific GitHub draft-PR creation" above are still not live for any
function.
