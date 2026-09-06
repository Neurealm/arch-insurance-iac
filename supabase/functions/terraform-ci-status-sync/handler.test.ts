import { test } from "node:test";
import assert from "node:assert/strict";
import { createCiHandler } from "./handler.ts";
import type { Dependencies, GapRecord, Principal } from "./handler.ts";
import { fixture, GAP, HEAD, REVIEWER } from "./test-fixture.ts";

function harness(options: { principal?: Principal | null; gap?: GapRecord | null; overrides?: Partial<Dependencies> } = {}) {
  const calls: string[] = []; const approvedActors: string[] = [];
  const deps: Dependencies = {
    authenticate: async () => { calls.push("auth"); return options.principal === undefined ? { kind: "human", id: REVIEWER, isAdmin: true } : options.principal; },
    getGap: async () => { calls.push("get"); return options.gap === undefined ? GAP : options.gap; },
    pendingGaps: async () => { calls.push("pending"); return [GAP]; },
    githubGet: fixture(true).get,
    record: async (gap, evidence) => { calls.push(`record:${evidence.status}`); return { ci_version: gap.ci_version + 1 }; },
    approve: async (_gap, version, head, actor) => { calls.push(`approve:${version}:${head}`); approvedActors.push(actor); return { id: "capability" }; },
    headers: () => ({}), ...options.overrides,
  };
  const handler = createCiHandler(deps);
  const invoke = (body: unknown = { operation: "sync", gapId: GAP.id }, method = "POST") => handler(new Request("https://example.invalid/terraform-ci-status-sync", { method, ...(method === "POST" ? { body: JSON.stringify(body) } : {}) }));
  return { invoke, calls, approvedActors };
}
const APPROVE = { operation: "approve", gapId: GAP.id, expectedHeadSha: HEAD, expectedCiVersion: GAP.ci_version, comment: "Reviewed exact source and the validation evidence." };

test("sync records evidence without approval, even when eligible", async () => { const h = harness(); assert.equal((await h.invoke()).status, 200); assert.deepEqual(h.calls, ["auth", "get", "record:passed"]); });
test("independent human approval refreshes evidence and passes authenticated identity, never payload actor", async () => {
  const h = harness(); assert.equal((await h.invoke({ ...APPROVE, actorId: GAP.requested_by })).status, 200);
  assert.deepEqual(h.approvedActors, [REVIEWER]); assert.deepEqual(h.calls, ["auth", "get", "record:passed", `approve:4:${HEAD}`]);
});
for (const [principal, code] of [[null, 401], [{ kind: "human", id: REVIEWER, isAdmin: false }, 403], [{ kind: "service" }, 403]] as const) test(`approval rejects principal ${JSON.stringify(principal)}`, async () => {
  const h = harness({ principal }); assert.equal((await h.invoke(APPROVE)).status, code); assert.deepEqual(h.calls, ["auth"]);
});
test("service caller may synchronize but cannot approve", async () => { const h = harness({ principal: { kind: "service" } }); assert.equal((await h.invoke()).status, 200); assert.equal(h.approvedActors.length, 0); });
test("missing requester blocks separation-of-duty approval", async () => { const h = harness({ gap: { ...GAP, requested_by: null } }); assert.equal((await h.invoke(APPROVE)).status, 403); assert.deepEqual(h.calls, ["auth", "get"]); });
test("requester cannot self-approve", async () => { const h = harness({ principal: { kind: "human", id: GAP.requested_by!, isAdmin: true } }); assert.equal((await h.invoke(APPROVE)).status, 403); });
for (const field of ["gapId", "expectedHeadSha", "expectedCiVersion", "comment"]) test(`approval requires ${field}`, async () => { const body = { ...APPROVE } as Record<string, unknown>; delete body[field]; const h = harness(); assert.equal((await h.invoke(body)).status, 400); assert.deepEqual(h.calls, ["auth"]); });
for (const [field, value] of [["expectedCiVersion", 1.1], ["expectedCiVersion", -1], ["expectedHeadSha", "main"], ["comment", "short"], ["gapId", "bad"]]) test(`rejects malformed ${field}: ${value}`, async () => { const h = harness(); assert.equal((await h.invoke({ ...APPROVE, [field]: value })).status, 400); });
test("review version/head must match the displayed observation", async () => { const h = harness(); assert.equal((await h.invoke({ ...APPROVE, expectedCiVersion: 2 })).status, 409); assert.deepEqual(h.calls, ["auth", "get"]); });
test("changed capability parameters must be synchronized and re-reviewed", async () => { const h = harness({ gap: { ...GAP, capabilitySnapshot: { ...GAP.capabilitySnapshot, allowed_environments: ["production"] } } }); assert.equal((await h.invoke(APPROVE)).status, 409); assert.deepEqual(h.calls, ["auth", "get"]); });
test("closed approval path is not silently retried", async () => { const h = harness({ gap: { ...GAP, status: "capability_approved" } }); assert.equal((await h.invoke(APPROVE)).status, 409); });
test("an unmerged PR remains unapproved after fresh synchronization", async () => { const h = harness({ overrides: { githubGet: fixture(false).get } }); assert.equal((await h.invoke(APPROVE)).status, 409); assert.deepEqual(h.calls, ["auth", "get", "record:passed"]); });
test("GitHub outage persists unknown evidence and clears the old passed gate", async () => { const h = harness({ overrides: { githubGet: async () => { throw new Error("GitHub failed"); } } }); assert.equal((await h.invoke(APPROVE)).status, 409); assert.deepEqual(h.calls, ["auth", "get", "record:unknown"]); });
for (const [code, status] of [["40001", 409], ["23505", 409], ["42501", 403], ["22023", 409], ["XX000", 500]] as const) test(`persistence failure ${code} prevents approval`, async () => { const h = harness({ overrides: { record: async () => { throw { code, message: "PRIVATE database details" }; } } }); const response = await h.invoke(APPROVE); assert.equal(response.status, status); assert.equal(h.approvedActors.length, 0); assert.ok(!(await response.text()).includes("PRIVATE")); });
test("missing gap is not a batch request", async () => { const h = harness({ gap: null }); assert.equal((await h.invoke()).status, 404); assert.deepEqual(h.calls, ["auth", "get"]); });
test("batch sync is read-only with respect to promotion", async () => { const h = harness(); assert.equal((await h.invoke({ operation: "sync" })).status, 200); assert.equal(h.approvedActors.length, 0); assert.deepEqual(h.calls, ["auth", "pending", "record:passed"]); });
test("preflight does not authenticate or touch evidence", async () => { const h = harness(); assert.equal((await h.invoke(undefined, "OPTIONS")).status, 200); assert.deepEqual(h.calls, []); });
test("non-POST calls have no side effects", async () => { const h = harness(); assert.equal((await h.invoke(undefined, "GET")).status, 405); assert.deepEqual(h.calls, []); });
