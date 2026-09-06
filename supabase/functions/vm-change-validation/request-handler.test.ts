import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createValidationHandler, type ValidationDependencies } from "./request-handler.ts";
import type { Json } from "./rules.ts";

const PACKAGE = "11111111-2222-4333-8444-555555555555";
const TARGET = `/subscriptions/${PACKAGE}/resourceGroups/pilot/providers/Microsoft.Compute/virtualMachines/vm1`;
const completed = new Date(Date.now() - 10_000).toISOString();
function harness(options: { actor?: string | null; owner?: string; admin?: boolean; observations?: Json[]; failRead?: boolean } = {}) {
  const calls: string[] = [];
  const identity = { package_id: PACKAGE, execution_engine: "hcp_terraform", status: "succeeded", plan_sha256: "a".repeat(64), source_revision: "b".repeat(40), hcp_run_id: "run-1", hcp_plan_id: "plan-1", hcp_workspace_id: "ws-1" };
  const deps: ValidationDependencies = {
    authenticate: async () => options.actor === undefined ? "owner" : options.actor,
    loadPackage: async () => ({ id: PACKAGE, created_by: options.owner ?? "owner", status: "executed", action_type: "start_vm", execution_completed_at: completed }),
    isAdministrator: async () => options.admin ?? false,
    loadExecution: async () => { calls.push("execution"); return {
      apply: { ...identity, id: "apply", run_type: "apply", plan_run_id: "plan", hcp_run_status: "applied", completed_at: completed },
      plan: { ...identity, id: "plan", run_type: "plan", has_destroy: false, has_replace: false, reconciliation: { matched: true } },
      review: { package_id: PACKAGE, reviewed_by: "reviewer", decision: "approved", approved_plan_run_id: "plan", approved_plan_sha256: identity.plan_sha256, approved_source_revision: identity.source_revision, approved_hcp_run_id: identity.hcp_run_id, approved_hcp_plan_id: identity.hcp_plan_id }, targets: [TARGET],
    }; },
    remoteApply: async () => { calls.push("hcp"); return { id: "run-1", attributes: { status: "applied" }, relationships: { plan: { data: { id: "plan-1" } }, workspace: { data: { id: "ws-1" } } } }; },
    observe: async target => { calls.push("azure"); assert.equal(target, TARGET); if (options.failRead) throw new Error("Azure unavailable"); return options.observations?.[0] ?? { resourceId: TARGET, observedAt: new Date().toISOString(), powerState: "running", provisioningState: "Succeeded" }; },
    persist: async input => { calls.push("persist"); return { closed: input.close && !input.checks.some(check => check.result === "FAIL"), actor: input.actor }; },
    reply: (_request, body, status = 200) => Response.json(body, { status }),
  };
  const handle = createValidationHandler(deps);
  const post = (body: unknown = { action: "verify", packageId: PACKAGE }) => handle(new Request("https://local.test", { method: "POST", body: JSON.stringify(body) }));
  return { calls, handle, post };
}

describe("VM validation server boundary", () => {
  it("denies unauthenticated callers before privileged reads", async () => { const h = harness({ actor: null }); assert.equal((await h.post()).status, 401); assert.deepEqual(h.calls, []); });
  it("denies a different owner before HCP or Azure reads", async () => { const h = harness({ actor: "stranger" }); assert.equal((await h.post()).status, 404); assert.deepEqual(h.calls, []); });
  it("allows an administrator to validate another owner's package", async () => { const h = harness({ actor: "admin", admin: true }); assert.equal((await h.post()).status, 200); assert.deepEqual(h.calls, ["execution", "hcp", "azure", "persist"]); });
  it("rejects browser-supplied result or observation fields", async () => { const h = harness(); assert.equal((await h.post({ action: "verify", packageId: PACKAGE, results: [{ result: "PASS" }] })).status, 400); assert.deepEqual(h.calls, []); });
  it("re-reads HCP and Azure before closure, not only verification", async () => { const h = harness(); const response = await h.post({ action: "close", packageId: PACKAGE }); assert.equal((await response.json()).closed, true); assert.deepEqual(h.calls, ["execution", "hcp", "azure", "persist"]); });
  it("does not persist or close when an upstream read fails", async () => { const h = harness({ failRead: true }); assert.equal((await h.post({ action: "close", packageId: PACKAGE })).status, 409); assert.equal(h.calls.includes("persist"), false); });
  it("persists failed checks but cannot close on stale observations", async () => { const h = harness({ observations: [{ resourceId: TARGET, observedAt: "2020-01-01T00:00:00Z", powerState: "running", provisioningState: "Succeeded" }] }); const response = await h.post({ action: "close", packageId: PACKAGE }); assert.equal((await response.json()).closed, false); });
});
