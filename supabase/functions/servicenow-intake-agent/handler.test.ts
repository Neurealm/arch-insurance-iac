import { test } from "node:test";
import assert from "node:assert/strict";
import { createIntakeAgentHandler, statusForOutcome, type Dependencies } from "./handler.ts";
import type { NormalizedTicket } from "../_shared/servicenow-intake-agent-core.ts";
import type { AgentOutcome } from "./tools.ts";
import type { AgentRunResult } from "./agent-loop.ts";
import type { ChangeReadinessOutput } from "../_shared/servicenow-change-readiness-core.ts";

const TICKET_NUMBER = "CHG0000999";

function ticket(overrides: Partial<NormalizedTicket> = {}): NormalizedTicket {
  return {
    ticketNumber: TICKET_NUMBER, sysId: "sys-1", requester: "jane", application: "billing",
    environment: "production", description: "Restart the billing VM.", maintenanceWindow: "Sat 02:00 ET",
    businessImpact: "none", applicationOwner: "jane", rollbackPlan: "revert",
    identityConflicts: [], sourceUpdatedAt: null, priorQuestions: [], clarificationAnswers: [],
    ...overrides,
  };
}

function outcome(overrides: Partial<AgentOutcome> = {}): AgentOutcome {
  return { kind: "needs_clarification", note: "please clarify", draft: null, gap: null, analysis: null, validation: null, ...overrides };
}

function readiness(overrides: Partial<ChangeReadinessOutput> = {}): ChangeReadinessOutput {
  return {
    ticketId: "ticket-1", ticketVersion: 1, detectedChangeTypes: ["restart_vm"], classificationConfidence: 90,
    extractedFields: {}, fieldProvenance: {}, missingFields: [], invalidFields: [], conflicts: [],
    validationResults: [], clarifyingQuestions: [], assumptions: [], riskFlags: [],
    readinessStatus: "NEEDS_CLARIFICATION", readinessReason: "test default", recommendedAssignmentGroup: "Cloud Platform Engineering",
    handoffPackage: null, terraformEligibility: { eligible: false, reason: "test default" },
    auditMetadata: { requestId: "req-1", analyzedAt: new Date(0).toISOString(), turnsUsed: 2 },
    ...overrides,
  };
}

function runResult(overrides: Partial<AgentRunResult> = {}): AgentRunResult {
  return { outcome: outcome(), turnsUsed: 2, transcript: [], azureObservation: null, readiness: readiness(), ...overrides };
}

/**
 * Builds a full Dependencies fake with every function recorded in `calls`
 * and safe, inert defaults. Individual tests override just the functions
 * whose behavior they need to steer.
 */
function harness(overrides: Partial<Dependencies> = {}) {
  const calls: string[] = [];
  const deps: Dependencies = {
    headers: () => ({ "access-control-allow-origin": "*" }),
    redact: (body) => body,
    verifyServiceNowWebhook: async () => { calls.push("verifyServiceNowWebhook"); return null; },
    authenticateDemoCaller: async () => { calls.push("authenticateDemoCaller"); return "user-1"; },
    authorizeResume: async () => { calls.push("authorizeResume"); return true; },
    resume: async () => { calls.push("resume"); return new Response(JSON.stringify({ processed: 0, results: [] }), { status: 200 }); },
    normalizeTicket: (body, history) => { calls.push(`normalizeTicket:${history ? "withHistory" : "initial"}`); return ticket(); },
    sha256: async () => { calls.push("sha256"); return "hash-1"; },
    findExisting: async () => { calls.push("findExisting"); return null; },
    resetForReanalysis: async () => { calls.push("resetForReanalysis"); return {}; },
    createIntakeRequest: async () => { calls.push("createIntakeRequest"); return { id: "req-1" }; },
    loadTicketHistory: async () => { calls.push("loadTicketHistory"); return []; },
    recordCanonical: async () => { calls.push("recordCanonical"); return { ticketId: "canon-1", snapshotId: "snap-1", inserted: true, workflowVersion: 1, identityConflict: false }; },
    linkCanonical: async () => { calls.push("linkCanonical"); },
    markIdentityConflict: async () => { calls.push("markIdentityConflict"); },
    markCanonicalFailure: async () => { calls.push("markCanonicalFailure"); },
    runAgent: async () => { calls.push("runAgent"); return runResult(); },
    persistOutcome: async () => { calls.push("persistOutcome"); },
    markDemoGenerated: async () => { calls.push("markDemoGenerated"); },
    postComment: async () => { calls.push("postComment"); },
    markCommentPosted: async () => { calls.push("markCommentPosted"); },
    markCommentFailed: async () => { calls.push("markCommentFailed"); },
    logEvent: async (_id, type) => { calls.push(`logEvent:${type}`); },
    ...overrides,
  };
  const handler = createIntakeAgentHandler(deps);
  const invoke = (body: unknown, headers: Record<string, string> = {}, method = "POST") =>
    handler(new Request("https://example.invalid/servicenow-intake-agent", { method, headers, ...(method === "POST" ? { body: JSON.stringify(body) } : {}) }));
  return { invoke, calls, deps, handler };
}

test("OPTIONS is answered without touching any dependency", async () => {
  const h = harness();
  const response = await h.invoke({}, {}, "OPTIONS");
  assert.equal(response.status, 200);
  assert.deepEqual(h.calls, []);
});

test("GET is rejected as method not allowed", async () => {
  const h = harness();
  const response = await h.invoke({}, {}, "GET");
  assert.equal(response.status, 405);
});

test("invalid JSON body is rejected before any dependency runs", async () => {
  const h = harness();
  const response = await h.handler(new Request("https://example.invalid/servicenow-intake-agent", { method: "POST", body: "{not json" }));
  assert.equal(response.status, 400);
  assert.deepEqual(h.calls, []);
});

test("resume mode delegates to deps.resume only when authorized", async () => {
  const h = harness();
  const response = await h.invoke({ mode: "resume" });
  assert.equal(response.status, 200);
  assert.deepEqual(h.calls, ["authorizeResume", "resume"]);
});

test("resume mode is refused when not authorized, without calling resume", async () => {
  const h = harness({ authorizeResume: async () => { return false; } });
  const response = await h.invoke({ mode: "resume" });
  assert.equal(response.status, 403);
  assert.ok(!h.calls.includes("resume"));
});

test("demo mode requires an authenticated caller", async () => {
  const h = harness({ authenticateDemoCaller: async () => null });
  const response = await h.invoke({ mode: "demo" });
  assert.equal(response.status, 401);
});

test("webhook mode is refused when verifyServiceNowWebhook rejects it", async () => {
  const h = harness({ verifyServiceNowWebhook: async () => ({ status: 401, message: "unauthorized" }) });
  const response = await h.invoke({});
  assert.equal(response.status, 401);
  assert.ok(!h.calls.includes("runAgent"));
});

test("a ticket with no ticket number is rejected before any persistence", async () => {
  const h = harness({ normalizeTicket: () => ticket({ ticketNumber: "" }) });
  const response = await h.invoke({});
  assert.equal(response.status, 400);
  assert.ok(!h.calls.includes("findExisting"));
});

test("an already-commented duplicate short-circuits before creating a new request", async () => {
  const h = harness({ findExisting: async () => ({ id: "req-existing", status: "comment_posted", changePackageId: "pkg-1" }) });
  const response = await h.invoke({});
  const payload = await response.json();
  assert.equal(payload.duplicate, true);
  assert.equal(payload.requestId, "req-existing");
  assert.ok(!h.calls.includes("createIntakeRequest"));
  assert.ok(!h.calls.includes("runAgent"));
});

test("a re-submitted (non-duplicate) existing request is reset for reanalysis instead of recreated", async () => {
  const h = harness({ findExisting: async () => ({ id: "req-existing", status: "needs_clarification", changePackageId: null }) });
  await h.invoke({});
  assert.ok(h.calls.includes("resetForReanalysis"));
  assert.ok(!h.calls.includes("createIntakeRequest"));
});

test("an identity conflict stops processing before the agent ever runs", async () => {
  const h = harness({ recordCanonical: async () => ({ ticketId: "canon-1", snapshotId: null, inserted: false, workflowVersion: 2, identityConflict: true }) });
  const response = await h.invoke({});
  assert.equal(response.status, 409);
  assert.ok(!h.calls.includes("runAgent"));
  assert.ok(h.calls.includes("markIdentityConflict"));
});

test("a canonical recording failure is reported and the agent never runs", async () => {
  const h = harness({ recordCanonical: async () => { throw new Error("db unreachable"); } });
  const response = await h.invoke({});
  assert.equal(response.status, 502);
  assert.ok(!h.calls.includes("runAgent"));
  assert.ok(h.calls.includes("markCanonicalFailure"));
});

test("demo mode never posts a ServiceNow comment", async () => {
  const h = harness();
  const response = await h.invoke({ mode: "demo" });
  const payload = await response.json();
  assert.equal(payload.status, "demo_comment_generated");
  assert.ok(!h.calls.includes("postComment"));
  assert.ok(h.calls.includes("markDemoGenerated"));
});

test("webhook mode posts the comment and marks it posted", async () => {
  const h = harness();
  const response = await h.invoke({});
  const payload = await response.json();
  assert.equal(payload.status, "comment_posted");
  assert.ok(h.calls.includes("postComment"));
  assert.ok(h.calls.includes("markCommentPosted"));
});

test("a ServiceNow comment-post failure is reported as comment_failed, not silently swallowed", async () => {
  const h = harness({ postComment: async () => { throw new Error("ServiceNow unreachable"); } });
  const response = await h.invoke({});
  assert.equal(response.status, 502);
  assert.ok(h.calls.includes("markCommentFailed"));
});

test("statusForOutcome maps every outcome kind to a status, never leaving one unmapped", () => {
  assert.equal(statusForOutcome("ready"), "ready_for_engineering");
  assert.equal(statusForOutcome("gap_opened"), "engineering_gap_opened");
  assert.equal(statusForOutcome("needs_clarification"), "needs_clarification");
  assert.equal(statusForOutcome("blocked"), "needs_clarification");
});
