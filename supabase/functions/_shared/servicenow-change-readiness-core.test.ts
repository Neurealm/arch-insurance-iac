import { test } from "node:test";
import assert from "node:assert/strict";
import type { NormalizedTicket, Analysis, ValidationResult } from "./servicenow-intake-agent-core.ts";
import {
  deriveReadinessStatus, computeReconciliation, validateChangeReadinessOutput,
  validateAzureTarget, validateCapability, fieldQuestion, loadActiveRequestSchema,
  persistAnalysis, syncQuestions, type ChangeReadinessOutput, type WorkflowState,
} from "./servicenow-change-readiness-core.ts";

const AT = "2026-09-14T00:00:00.000Z";

function ticket(overrides: Partial<NormalizedTicket> = {}): NormalizedTicket {
  return {
    ticketNumber: "CHG0000123", sysId: "sys123", requester: "jane", application: "billing",
    environment: "production", description: "Please restart the billing API VM, it is unresponsive.",
    maintenanceWindow: "Sat 02:00-04:00 ET", businessImpact: "Billing API unavailable", applicationOwner: "jane",
    rollbackPlan: "Revert to previous known-good state if restart does not resolve it.",
    identityConflicts: [], sourceUpdatedAt: AT, priorQuestions: [], clarificationAnswers: [],
    ...overrides,
  };
}

function analysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    action: "restart_vm", confidence: 90, summary: "Restart the billing API VM.", targetVmName: "billing-api-01",
    extractedFields: {}, missingFields: [], conflicts: [], clarificationQuestions: [], provisioning: {},
    ...overrides,
  };
}

const READY_VALIDATION: ValidationResult = { target: { id: "vm-1", name: "billing-api-01", resourceGroup: "rg", subscriptionId: "sub", location: "eastus", powerState: "Running", provisioningState: "Succeeded", vmSize: "Standard_B2s", osType: "Linux" }, missing: [], conflicts: [], questions: [], ready: true, readyForGap: false };
const NOT_READY_VALIDATION: ValidationResult = { target: null, missing: ["Target VM confirmed in Azure inventory"], conflicts: [], questions: ["Please provide the target VM."], ready: false, readyForGap: false };

const RESTART_VM_FIELDS = ["requester", "application", "environment", "description", "maintenanceWindow", "businessImpact", "applicationOwner", "rollbackPlan", "targetVm"];

test("deriveReadinessStatus maps every WorkflowState, with conflict/validation flags taking priority over a bare WAITING_FOR_INFORMATION reading", () => {
  const cases: Array<[WorkflowState, boolean, boolean, string]> = [
    ["INGESTED", false, false, "NEW"],
    ["ANALYZING", false, false, "ANALYZING"],
    ["WAITING_FOR_INFORMATION", false, false, "NEEDS_CLARIFICATION"],
    ["WAITING_FOR_INFORMATION", true, false, "CONFLICT_DETECTED"],
    ["WAITING_FOR_INFORMATION", false, true, "VALIDATION_BLOCKED"],
    ["WAITING_FOR_INFORMATION", true, true, "CONFLICT_DETECTED"],
    ["REQUEST_COMPLETE", false, false, "READY_FOR_REVIEW"],
    ["GAP_CREATED", false, false, "READY_FOR_CLOUD_TEAM"],
    ["PACKAGE_GENERATED", false, false, "READY_FOR_CLOUD_TEAM"],
    ["PACKAGE_VALIDATED", false, false, "READY_FOR_CLOUD_TEAM"],
    ["DRAFT_PR_CREATED", false, false, "READY_FOR_CLOUD_TEAM"],
    ["HANDOFF_COMPLETE", false, false, "ROUTED"],
    ["BLOCKED", false, false, "VALIDATION_BLOCKED"],
    ["FAILED", false, false, "CANCELLED"],
  ];
  for (const [state, conflicts, failedValidation, expected] of cases) {
    assert.equal(deriveReadinessStatus(state, conflicts, failedValidation), expected, `${state} conflicts=${conflicts} failed=${failedValidation}`);
  }
});

test("computeReconciliation: a fully complete ticket marks every required field VALID with no explanation", () => {
  const { revisions, factConflicts } = computeReconciliation(ticket(), analysis(), READY_VALIDATION, RESTART_VM_FIELDS);
  assert.equal(factConflicts.length, 0);
  for (const r of revisions) {
    assert.equal(r.state, "VALID", `${r.field} should be VALID`);
    assert.equal(r.explanation, "");
  }
});

test("computeReconciliation: missing common fields are reported MISSING with a real explanation naming the field", () => {
  const t = ticket({ businessImpact: "", rollbackPlan: "" });
  const { revisions } = computeReconciliation(t, analysis({ extractedFields: {} }), NOT_READY_VALIDATION, RESTART_VM_FIELDS);
  const businessImpact = revisions.find((r) => r.field === "businessImpact")!;
  const rollbackPlan = revisions.find((r) => r.field === "rollbackPlan")!;
  assert.equal(businessImpact.state, "MISSING");
  assert.match(businessImpact.explanation, /business impact/i);
  assert.equal(rollbackPlan.state, "MISSING");
  const targetVm = revisions.find((r) => r.field === "targetVm")!;
  assert.equal(targetVm.state, "MISSING");
});

test("computeReconciliation: a short description fails the same length rule validate() enforces", () => {
  const { revisions } = computeReconciliation(ticket({ description: "too short" }), analysis(), READY_VALIDATION, RESTART_VM_FIELDS);
  const description = revisions.find((r) => r.field === "description")!;
  assert.equal(description.state, "MISSING");
});

test("computeReconciliation: same-timestamp structured-vs-prose disagreement on environment is CONTRADICTORY, with both values named in the explanation", () => {
  const t = ticket({ environment: "production" });
  const a = analysis({ extractedFields: { environment: "staging" } });
  const { revisions, factConflicts } = computeReconciliation(t, a, READY_VALIDATION, RESTART_VM_FIELDS);
  assert.equal(factConflicts.length, 1);
  assert.equal(factConflicts[0].field, "environment");
  const environment = revisions.find((r) => r.field === "environment")!;
  assert.equal(environment.state, "CONTRADICTORY");
  assert.match(environment.explanation, /production/);
  assert.match(environment.explanation, /staging/);
});

test("computeReconciliation: create_vm's invalid provisioning fields are reported INVALID, not MISSING", () => {
  const createVmFields = ["requester", "application", "environment", "description", "maintenanceWindow", "businessImpact", "applicationOwner", "rollbackPlan", "resourceGroupArmId", "subnetArmId", "location", "vmNames", "vmSize", "adminUsername", "sshPublicKey", "osPublisher", "osOffer", "osSku", "osVersion"];
  const a = analysis({
    action: "create_vm",
    provisioning: {
      resourceGroupArmId: "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/rg1",
      subnetArmId: "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/rg1/providers/Microsoft.Network/virtualNetworks/vnet1/subnets/subnet1",
      location: "eastus", vmNames: ["vm1"], vmSize: "not-a-real-sku", adminUsername: "azureuser",
      sshPublicKey: "ssh-rsa AAAAB3NzaC1yc2EA", osPublisher: "Canonical", osOffer: "ubuntu", osSku: "22_04-lts", osVersion: "latest",
    },
  });
  const { revisions } = computeReconciliation(ticket(), a, READY_VALIDATION, createVmFields);
  const vmSize = revisions.find((r) => r.field === "vmSize")!;
  assert.equal(vmSize.state, "INVALID");
  assert.match(vmSize.explanation, /did not pass validation/i);
  const resourceGroupArmId = revisions.find((r) => r.field === "resourceGroupArmId")!;
  assert.equal(resourceGroupArmId.state, "VALID");
});

test("computeReconciliation is a pure function: identical input always reconciles to identical output (the property the persistence idempotency keys depend on)", () => {
  const t = ticket();
  const a = analysis();
  const first = computeReconciliation(t, a, READY_VALIDATION, RESTART_VM_FIELDS);
  const second = computeReconciliation(t, a, READY_VALIDATION, RESTART_VM_FIELDS);
  assert.deepEqual(first.revisions, second.revisions);
});

test("validateAzureTarget: matched, unmatched, and unavailable-system cases", () => {
  const vm = { id: "vm-1", name: "billing-api-01", resourceGroup: "rg", subscriptionId: "sub", location: "eastus", powerState: "Running", provisioningState: "Succeeded", vmSize: "Standard_B2s", osType: "Linux" };
  assert.equal(validateAzureTarget(vm, "available").status, "VALID");
  assert.equal(validateAzureTarget(null, "available").status, "INVALID");
  assert.equal(validateAzureTarget(null, "not_fetched").status, "NOT_VALIDATED");
});

test("validateCapability: unautomated categories are NOT_VALIDATED regardless of capability lookup, never a fabricated pass", () => {
  assert.equal(validateCapability(false, true).status, "NOT_VALIDATED");
  assert.equal(validateCapability(true, true).status, "VALID");
  assert.equal(validateCapability(true, false).status, "INVALID");
});

test("fieldQuestion produces a distinct, readable question per field rather than a generic placeholder", () => {
  assert.notEqual(fieldQuestion("rollbackPlan"), fieldQuestion("vmSize"));
  assert.match(fieldQuestion("rollbackPlan"), /rollback plan/i);
});

function validOutput(overrides: Partial<ChangeReadinessOutput> = {}): ChangeReadinessOutput {
  return {
    ticketId: "ticket-1", ticketVersion: 1, detectedChangeTypes: ["restart_vm"], classificationConfidence: 90,
    extractedFields: {}, fieldProvenance: {}, missingFields: [], invalidFields: [], conflicts: [],
    validationResults: [], clarifyingQuestions: [], assumptions: [], riskFlags: [],
    readinessStatus: "READY_FOR_REVIEW", readinessReason: "all valid", recommendedAssignmentGroup: "Cloud Platform Engineering",
    handoffPackage: null, terraformEligibility: { eligible: true, reason: "ok" },
    auditMetadata: { requestId: "req-1", analyzedAt: AT, turnsUsed: 3 },
    ...overrides,
  };
}

test("validateChangeReadinessOutput accepts a well-formed output with zero problems", () => {
  assert.deepEqual(validateChangeReadinessOutput(validOutput()), []);
});

test("validateChangeReadinessOutput reports every violation, not just the first", () => {
  // deno-lint-ignore no-explicit-any
  const bad: any = { ...validOutput(), ticketId: "", classificationConfidence: 200, missingFields: "nope", readinessStatus: "MADE_UP" };
  delete bad.terraformEligibility;
  const problems = validateChangeReadinessOutput(bad);
  assert.ok(problems.some((p) => p.includes("ticketId")));
  assert.ok(problems.some((p) => p.includes("classificationConfidence")));
  assert.ok(problems.some((p) => p.includes("missingFields")));
  assert.ok(problems.some((p) => p.includes("readinessStatus")));
  assert.ok(problems.some((p) => p.includes("terraformEligibility")));
});

/**
 * Minimal fake standing in for the Supabase admin client used by the
 * catalog/persistence functions. Records every .rpc() call so tests can
 * assert exact payload shape without a live database.
 */
function fakeAdmin(opts: { schemaRow?: { id: string; schema: unknown } | null } = {}) {
  const rpcCalls: Array<{ name: string; params: Record<string, unknown> }> = [];
  return {
    rpcCalls,
    // deno-lint-ignore no-explicit-any
    from(_table: string): any {
      const chain = {
        select: () => chain,
        eq: () => chain,
        // deno-lint-ignore require-await
        maybeSingle: async () => ({ data: opts.schemaRow ?? null, error: null }),
      };
      return chain;
    },
    // deno-lint-ignore require-await no-explicit-any
    rpc: async (name: string, params: Record<string, unknown>): Promise<any> => {
      rpcCalls.push({ name, params });
      if (name === "record_servicenow_ticket_analysis_event") return { data: "event-1", error: null };
      if (name === "record_servicenow_ticket_facts") {
        const facts = (params.p_facts as Array<{ canonicalField: string }>).map((f, i) => ({ canonicalField: f.canonicalField, factId: `fact-${i}` }));
        return { data: { facts }, error: null };
      }
      return { data: {}, error: null };
    },
  };
}

test("loadActiveRequestSchema returns the seeded fields when a catalog row is active", async () => {
  const admin = fakeAdmin({ schemaRow: { id: "schema-1", schema: { requiredFields: ["requester"], requiredApprovals: [], automationSupported: true } } });
  // deno-lint-ignore no-explicit-any
  const schema = await loadActiveRequestSchema(admin as any, "restart_vm");
  assert.equal(schema.schemaId, "schema-1");
  assert.deepEqual(schema.requiredFields, ["requester"]);
  assert.equal(schema.automationSupported, true);
});

test("loadActiveRequestSchema falls back to the generic checklist, unautomated, when no catalog row is active", async () => {
  const admin = fakeAdmin({ schemaRow: null });
  const originalError = console.error;
  console.error = () => {}; // the fallback logs a warning by design; keep test output clean
  try {
    // deno-lint-ignore no-explicit-any
    const schema = await loadActiveRequestSchema(admin as any, "some_unseeded_type");
    assert.equal(schema.schemaId, null);
    assert.equal(schema.automationSupported, false);
    assert.ok(schema.requiredFields.includes("requester"));
  } finally {
    console.error = originalError;
  }
});

test("persistAnalysis derives its idempotency key from content, so re-persisting identical reconciliation reuses the same key", async () => {
  const admin = fakeAdmin();
  const reconciled = computeReconciliation(ticket(), analysis(), READY_VALIDATION, RESTART_VM_FIELDS);
  // deno-lint-ignore no-explicit-any
  await persistAnalysis(admin as any, "ticket-1", "tester", reconciled);
  // deno-lint-ignore no-explicit-any
  await persistAnalysis(admin as any, "ticket-1", "tester", reconciled);
  const eventCalls = admin.rpcCalls.filter((c) => c.name === "record_servicenow_ticket_analysis_event");
  assert.equal(eventCalls.length, 2);
  assert.equal(eventCalls[0].params.p_idempotency_key, eventCalls[1].params.p_idempotency_key);
  assert.equal(eventCalls[0].params.p_content_sha256, eventCalls[0].params.p_idempotency_key);
});

test("persistAnalysis batches one fact per reconciled field with a 0-1 confidence and a real precedence rank, never a hardcoded constant", async () => {
  const admin = fakeAdmin();
  const reconciled = computeReconciliation(ticket(), analysis(), READY_VALIDATION, RESTART_VM_FIELDS);
  // deno-lint-ignore no-explicit-any
  await persistAnalysis(admin as any, "ticket-1", "tester", reconciled);
  const factsCall = admin.rpcCalls.find((c) => c.name === "record_servicenow_ticket_facts")!;
  // deno-lint-ignore no-explicit-any
  const facts = factsCall.params.p_facts as any[];
  assert.ok(facts.length > 0);
  for (const fact of facts) {
    assert.ok(fact.confidence >= 0 && fact.confidence <= 1, "confidence must be persisted as a 0-1 fraction, not a 0-100 percentage");
    assert.ok(fact.precedenceRank >= 1 && fact.precedenceRank <= 6);
  }
  const structuredFact = facts.find((f) => f.sourceType === "structured_ticket");
  assert.ok(structuredFact, "structured ticket facts should be present");
  assert.equal(structuredFact.precedenceRank, 4, "structured_ticket's real SOURCE_WEIGHT, not a placeholder");
});

test("syncQuestions maps INVALID field state to registry status INVALID, not OPEN -- shouldAskForField's always-re-ask distinction depends on this", async () => {
  const admin = fakeAdmin();
  const revisions = [
    { field: "vmSize", state: "INVALID" as const, selectedFactId: null, explanation: "bad", policyRuleCode: null },
    { field: "requester", state: "MISSING" as const, selectedFactId: null, explanation: "missing", policyRuleCode: null },
    { field: "application", state: "VALID" as const, selectedFactId: "fact-1", explanation: "", policyRuleCode: null },
  ];
  // deno-lint-ignore no-explicit-any
  await syncQuestions(admin as any, "ticket-1", "tester", revisions, { application: "fact-1" });
  const call = admin.rpcCalls.find((c) => c.name === "sync_servicenow_question_registry")!;
  // deno-lint-ignore no-explicit-any
  const questions = call.params.p_questions as any[];
  assert.equal(questions.find((q) => q.canonicalField === "vmSize")!.status, "INVALID");
  assert.equal(questions.find((q) => q.canonicalField === "requester")!.status, "OPEN");
  const applicationQuestion = questions.find((q) => q.canonicalField === "application")!;
  assert.equal(applicationQuestion.status, "ANSWERED");
  assert.equal(applicationQuestion.answerFactId, "fact-1");
});
