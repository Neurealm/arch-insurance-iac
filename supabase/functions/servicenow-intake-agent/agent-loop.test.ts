import { test } from "node:test";
import assert from "node:assert/strict";
import { persistReadiness } from "./agent-loop.ts";
import { createAgentContext } from "./tools.ts";
import type { AgentOutcome } from "./tools.ts";
import type { NormalizedTicket, Analysis, ValidationResult } from "../_shared/servicenow-intake-agent-core.ts";
import type { WorkflowState } from "../_shared/servicenow-change-readiness-core.ts";

const TICKET: NormalizedTicket = {
  ticketNumber: "CHG0000123", sysId: "sys123", requester: "jane", application: "billing",
  environment: "production", description: "Please restart the billing API VM, it is unresponsive.",
  maintenanceWindow: "Sat 02:00-04:00 ET", businessImpact: "Billing API unavailable", applicationOwner: "jane",
  rollbackPlan: "Revert to previous known-good state if restart does not resolve it.",
  identityConflicts: [], sourceUpdatedAt: "2026-09-14T00:00:00.000Z", priorQuestions: [], clarificationAnswers: [],
};

const READY_ANALYSIS: Analysis = {
  action: "restart_vm", confidence: 90, summary: "Restart the billing API VM.", targetVmName: "billing-api-01",
  extractedFields: {}, missingFields: [], conflicts: [], clarificationQuestions: [], provisioning: {},
};
const READY_VALIDATION: ValidationResult = {
  target: { id: "vm-1", name: "billing-api-01", resourceGroup: "rg", subscriptionId: "sub", location: "eastus", powerState: "Running", provisioningState: "Succeeded", vmSize: "Standard_B2s", osType: "Linux" },
  missing: [], conflicts: [], questions: [], ready: true, readyForGap: false,
};
const RESTART_VM_FIELDS = ["requester", "application", "environment", "description", "maintenanceWindow", "businessImpact", "applicationOwner", "rollbackPlan", "targetVm"];

/**
 * A small, stateful fake standing in for the Supabase admin client: enough
 * surface to drive persistReadiness's real branching (catalog lookup,
 * ticket-header read, fact/revision/question RPCs, and workflow-state
 * transitions with real version bookkeeping) without a live database.
 * transition_servicenow_intake_ticket/complete_servicenow_ticket_request
 * enforce the same expected-version and ANALYZING-only-for-completion rules
 * their real SQL counterparts do, so a test exercising illegal sequencing
 * fails the same way it would against the live RPCs.
 */
function fakeAdmin(opts: { schemaId?: string | null; automationSupported?: boolean; requiredFields?: string[]; initialState?: WorkflowState; initialVersion?: number } = {}) {
  let state: WorkflowState = opts.initialState ?? "INGESTED";
  let version = opts.initialVersion ?? 1;
  let factCounter = 0;
  const events: Array<{ type: string; detail: unknown }> = [];
  const rpcCalls: Array<{ name: string; params: Record<string, unknown> }> = [];

  return {
    events, rpcCalls,
    get state() { return state; },
    get version() { return version; },
    // deno-lint-ignore no-explicit-any
    from(table: string): any {
      if (table === "iac_request_schemas") {
        const chain = {
          select: () => chain, eq: () => chain,
          // deno-lint-ignore require-await
          maybeSingle: async () => ({
            data: opts.schemaId === null ? null : { id: opts.schemaId ?? "schema-1", schema: { requiredFields: opts.requiredFields ?? RESTART_VM_FIELDS, requiredApprovals: [], automationSupported: opts.automationSupported ?? true } },
            error: null,
          }),
        };
        return chain;
      }
      if (table === "servicenow_intake_tickets") {
        const chain = { select: () => chain, eq: () => chain, single: () => Promise.resolve({ data: { id: "ticket-1", workflow_state: state, workflow_version: version }, error: null }) };
        return chain;
      }
      return { insert: (row: Record<string, unknown>) => { events.push({ type: String(row.event_type ?? ""), detail: row.detail }); return Promise.resolve({ error: null }); } };
    },
    // deno-lint-ignore no-explicit-any
    rpc(name: string, params: Record<string, unknown>): Promise<any> {
      rpcCalls.push({ name, params });
      if (name === "record_servicenow_ticket_analysis_event") return Promise.resolve({ data: "event-1", error: null });
      if (name === "record_servicenow_ticket_facts") {
        const facts = (params.p_facts as Array<{ canonicalField: string }>).map((f) => ({ canonicalField: f.canonicalField, factId: `fact-${factCounter++}` }));
        return Promise.resolve({ data: { facts }, error: null });
      }
      if (name === "record_servicenow_requirement_revisions" || name === "sync_servicenow_question_registry") return Promise.resolve({ data: {}, error: null });
      if (name === "transition_servicenow_intake_ticket") {
        if (params.p_expected_version !== version) return Promise.resolve({ data: null, error: { code: "40001", message: "ticket workflow version changed" } });
        state = params.p_to_state as WorkflowState;
        version += 1;
        return Promise.resolve({ data: version, error: null });
      }
      if (name === "complete_servicenow_ticket_request") {
        if (state !== "ANALYZING") return Promise.resolve({ data: null, error: { code: "22023", message: "ticket is not ready for completion" } });
        if (params.p_expected_version !== version) return Promise.resolve({ data: null, error: { code: "40001", message: "ticket workflow version changed" } });
        state = "REQUEST_COMPLETE";
        version += 1;
        return Promise.resolve({ data: version, error: null });
      }
      return Promise.resolve({ data: {}, error: null });
    },
  };
}

function ctxFor(admin: ReturnType<typeof fakeAdmin>) {
  // deno-lint-ignore no-explicit-any
  return createAgentContext({ admin: admin as any, ticket: TICKET, requestId: "req-1", canonicalTicketId: "ticket-1", demoMode: false, callerId: null });
}

test("persistReadiness: a first-time ready outcome drives the ledger INGESTED -> ANALYZING -> REQUEST_COMPLETE", async () => {
  const admin = fakeAdmin();
  const outcome: AgentOutcome = { kind: "ready", note: "note", draft: { id: "pkg-1", package_number: "VM-CHG-1" }, gap: null, analysis: READY_ANALYSIS, validation: READY_VALIDATION };
  const readiness = await persistReadiness(ctxFor(admin), outcome, 3);
  assert.equal(admin.state, "REQUEST_COMPLETE");
  assert.equal(admin.version, 3); // INGESTED(1) -> ANALYZING(2) -> REQUEST_COMPLETE(3)
  assert.equal(readiness.readinessStatus, "READY_FOR_REVIEW");
  assert.equal(readiness.missingFields.length, 0);
  assert.equal(readiness.terraformEligibility.eligible, true);
});

test("persistReadiness: resuming a ticket that was WAITING_FOR_INFORMATION still reaches REQUEST_COMPLETE once fields are valid", async () => {
  const admin = fakeAdmin({ initialState: "WAITING_FOR_INFORMATION", initialVersion: 5 });
  const outcome: AgentOutcome = { kind: "ready", note: "note", draft: { id: "pkg-1", package_number: "VM-CHG-1" }, gap: null, analysis: READY_ANALYSIS, validation: READY_VALIDATION };
  const readiness = await persistReadiness(ctxFor(admin), outcome, 2);
  assert.equal(admin.state, "REQUEST_COMPLETE");
  assert.equal(readiness.readinessStatus, "READY_FOR_REVIEW");
});

test("persistReadiness: a gap_opened outcome (valid fields, no approved capability) also completes the ledger request", async () => {
  const admin = fakeAdmin();
  const outcome: AgentOutcome = { kind: "gap_opened", note: "note", draft: null, gap: { id: "gap-1", reused: false }, analysis: READY_ANALYSIS, validation: { ...READY_VALIDATION, ready: false, readyForGap: true } };
  const readiness = await persistReadiness(ctxFor(admin), outcome, 4);
  assert.equal(admin.state, "REQUEST_COMPLETE");
  assert.equal(readiness.readinessStatus, "READY_FOR_REVIEW");
});

test("persistReadiness: missing fields drive WAITING_FOR_INFORMATION and never attempt completion", async () => {
  const admin = fakeAdmin();
  const incompleteAnalysis: Analysis = { ...READY_ANALYSIS, targetVmName: null };
  const incompleteValidation: ValidationResult = { target: null, missing: ["Target VM confirmed in Azure inventory"], conflicts: [], questions: ["Please provide the target VM."], ready: false, readyForGap: false };
  const outcome: AgentOutcome = { kind: "needs_clarification", note: "note", draft: null, gap: null, analysis: incompleteAnalysis, validation: incompleteValidation };
  const readiness = await persistReadiness(ctxFor(admin), outcome, 2);
  assert.equal(admin.state, "WAITING_FOR_INFORMATION");
  assert.equal(readiness.readinessStatus, "NEEDS_CLARIFICATION");
  assert.ok(readiness.missingFields.includes("targetVm"));
  assert.ok(!admin.rpcCalls.some((c) => c.name === "complete_servicenow_ticket_request"));
});

test("persistReadiness: a blocked outcome (in-flight conflict) transitions the ledger to BLOCKED even though fields were valid", async () => {
  const admin = fakeAdmin();
  const outcome: AgentOutcome = { kind: "blocked", note: "note", draft: null, gap: null, analysis: READY_ANALYSIS, validation: READY_VALIDATION };
  const readiness = await persistReadiness(ctxFor(admin), outcome, 3);
  assert.equal(admin.state, "BLOCKED");
  assert.equal(readiness.readinessStatus, "VALIDATION_BLOCKED");
});

test("persistReadiness: with no active catalog schema (schemaId null), completion is never attempted even when every field validates ready", async () => {
  const admin = fakeAdmin({ schemaId: null });
  const originalError = console.error;
  console.error = () => {}; // loadActiveRequestSchema warns on fallback by design
  try {
    const outcome: AgentOutcome = { kind: "ready", note: "note", draft: { id: "pkg-1", package_number: "VM-CHG-1" }, gap: null, analysis: READY_ANALYSIS, validation: READY_VALIDATION };
    await persistReadiness(ctxFor(admin), outcome, 3);
    assert.ok(!admin.rpcCalls.some((c) => c.name === "complete_servicenow_ticket_request"));
    assert.equal(admin.state, "WAITING_FOR_INFORMATION");
  } finally {
    console.error = originalError;
  }
});

test("persistReadiness never throws when the ledger write fails, and still returns a usable degraded output", async () => {
  const admin = fakeAdmin();
  const failingAdmin = {
    ...admin,
    // deno-lint-ignore no-explicit-any
    rpc(name: string, params: Record<string, unknown>): Promise<any> {
      if (name === "record_servicenow_ticket_analysis_event") return Promise.reject(new Error("connection reset"));
      return admin.rpc(name, params);
    },
  };
  const outcome: AgentOutcome = { kind: "ready", note: "note", draft: { id: "pkg-1", package_number: "VM-CHG-1" }, gap: null, analysis: READY_ANALYSIS, validation: READY_VALIDATION };
  // deno-lint-ignore no-explicit-any
  const ctx = createAgentContext({ admin: failingAdmin as any, ticket: TICKET, requestId: "req-1", canonicalTicketId: "ticket-1", demoMode: false, callerId: null });
  const readiness = await persistReadiness(ctx, outcome, 1);
  assert.match(readiness.readinessReason, /connection reset/);
  assert.equal(readiness.terraformEligibility.eligible, false);
});
