import { test } from "node:test";
import assert from "node:assert/strict";
import { callTool, createAgentContext } from "./tools.ts";
import type { NormalizedTicket } from "../_shared/servicenow-intake-agent-core.ts";

const TICKET: NormalizedTicket = {
  ticketNumber: "CHG0000123", sysId: "sys123", requester: "jane", application: "billing",
  environment: "production", description: "Please restart the billing API VM, it is unresponsive.",
  maintenanceWindow: "Sat 02:00-04:00 ET", businessImpact: "Billing API unavailable", applicationOwner: "jane",
  rollbackPlan: "Revert to previous known-good state if restart does not resolve it.",
  identityConflicts: [], sourceUpdatedAt: null, priorQuestions: [], clarificationAnswers: [],
};

/**
 * Minimal fake standing in for the Supabase admin client. Only supports the
 * shapes this test file actually exercises: `.from(table).insert(...)`
 * (used by addEvent) and `.from(table).select().eq()...maybeSingle()` (used
 * by check_capability). Anything else throws loudly rather than returning a
 * plausible-looking wrong answer.
 */
function fakeAdmin(opts: { capabilityApproved?: boolean } = {}) {
  const calls: string[] = [];
  const chain = {
    select: () => chain,
    eq: () => chain,
    // deno-lint-ignore require-await
    maybeSingle: async () => ({ data: opts.capabilityApproved ? { id: "cap-1" } : null, error: null }),
  };
  return {
    calls,
    // deno-lint-ignore no-explicit-any
    from(table: string): any {
      calls.push(table);
      return {
        // deno-lint-ignore require-await
        insert: async (_row: unknown) => ({ error: null }),
        select: chain.select, eq: chain.eq, maybeSingle: chain.maybeSingle,
      };
    },
  };
}

function harness(opts: { capabilityApproved?: boolean } = {}) {
  const admin = fakeAdmin(opts);
  // deno-lint-ignore no-explicit-any
  const ctx = createAgentContext({ admin: admin as any, ticket: TICKET, requestId: "req-1", demoMode: true, callerId: "user-1" });
  return { admin, ctx };
}

const VALID_ANALYSIS = {
  action: "restart_vm", confidence: 90, summary: "Restart the billing API VM.",
  targetVmName: "billing-api-01", extractedFields: {}, missingFields: [], conflicts: [], clarificationQuestions: [],
};

test("ask_clarifying_question refuses without a prior submit_analysis", async () => {
  const { ctx } = harness();
  const result = await callTool("ask_clarifying_question", { rationale: "missing info" }, ctx);
  assert.equal(result.terminal, false);
  assert.match(String(result.content.error), /submit_analysis/);
});

test("ask_clarifying_question requires a rationale", async () => {
  const { ctx } = harness();
  const result = await callTool("ask_clarifying_question", {}, ctx);
  assert.equal(result.terminal, false);
  assert.match(String(result.content.error), /rationale/);
});

test("submit_analysis defaults to no approved capability until check_capability is called", async () => {
  const { ctx } = harness({ capabilityApproved: true }); // even if truly approved server-side...
  const submit = await callTool("submit_analysis", VALID_ANALYSIS, ctx);
  // ...the agent never asked, so it must not silently benefit from that fact.
  assert.equal(submit.content.capabilityChecked, false);
  assert.equal(submit.content.ready, false);
});

test("check_capability then submit_analysis: fully valid request without a target VM found is not ready", async () => {
  const { ctx } = harness({ capabilityApproved: true });
  await callTool("check_capability", { action_type: "restart_vm" }, ctx);
  const submit = await callTool("submit_analysis", VALID_ANALYSIS, ctx);
  // No get_azure_inventory call happened, so there is no VM to match against --
  // the deterministic validator must still ask for target confirmation rather
  // than assume the named VM exists.
  assert.equal(submit.content.ready, false);
  assert.ok((submit.content.missing as string[]).some((m) => /Azure target verification/.test(m)));
});

test("create_change_package fails safely (non-terminal) when validation was not ready", async () => {
  const { ctx } = harness({ capabilityApproved: true });
  await callTool("check_capability", { action_type: "restart_vm" }, ctx);
  await callTool("submit_analysis", VALID_ANALYSIS, ctx);
  const result = await callTool("create_change_package", { rationale: "looks ready" }, ctx);
  assert.equal(result.terminal, false);
  assert.equal(ctx.outcome, null);
});

test("submit_analysis can be called more than once -- the agent refining its read of the ticket uses the latest submission", async () => {
  const { ctx } = harness({ capabilityApproved: false });
  await callTool("submit_analysis", { ...VALID_ANALYSIS, confidence: 40, action: "unknown" }, ctx);
  assert.equal(ctx.lastAnalysis?.action, "unknown");
  await callTool("submit_analysis", VALID_ANALYSIS, ctx);
  assert.equal(ctx.lastAnalysis?.action, "restart_vm");
  assert.equal(ctx.lastAnalysis?.confidence, 90);
});

test("every terminal tool call is independent of what the model claims in its rationale", async () => {
  const { ctx } = harness({ capabilityApproved: false });
  await callTool("check_capability", { action_type: "create_vm" }, ctx);
  await callTool("submit_analysis", { ...VALID_ANALYSIS, action: "create_vm", provisioning: {} }, ctx);
  // The model insists everything is fine; the tool must not take its word for it.
  const result = await callTool("create_change_package", { rationale: "trust me, this is definitely ready" }, ctx);
  assert.equal(result.terminal, false);
  assert.match(String(result.content.error), /Not ready/);
});
