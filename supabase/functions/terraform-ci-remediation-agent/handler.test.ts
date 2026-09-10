import { test } from "node:test";
import assert from "node:assert/strict";
import { createRemediationHandler, type Dependencies, type Principal } from "./handler.ts";

const GAP_ID = "10000000-0000-0000-0000-000000000001";
const HEAD = "a".repeat(40);
const NEXT = "b".repeat(40);

function harness(options: { principal?: Principal | null; ready?: boolean; exhausted?: boolean; repairOutcome?: "committed" | "rejected"; overrides?: Partial<Dependencies> } = {}) {
  const calls: string[] = [];
  const deps: Dependencies = {
    headers: () => ({}),
    authenticate: async () => { calls.push("auth"); return options.principal === undefined ? { id: "admin", isAdmin: true } : options.principal; },
    ready: () => { calls.push("ready"); return options.ready === false ? { ready: false, reason: "missing OPENAI_API_KEY" } : { ready: true }; },
    getGap: async (id) => { calls.push(`get:${id}`); return { id }; },
    claim: async (_id, version, head) => { calls.push(`claim:${version}:${head}`); return { claimed: !options.exhausted, exhausted: !!options.exhausted, attempt: options.exhausted ? 3 : 1, headSha: head }; },
    repair: async (_gap, attempt, head) => { calls.push(`repair:${attempt}:${head}`); return options.repairOutcome === "rejected" ? { outcome: "rejected", model: "test-model", summary: "Policy rejected the proposed module repair." } : { outcome: "committed", model: "test-model", summary: "Corrected the Terraform validation failure.", newHeadSha: NEXT }; },
    complete: async (input) => { calls.push(`complete:${input.outcome}:${input.attempt}`); return { remediationStatus: input.outcome === "committed" ? "waiting_ci" : "failed" }; },
    ...options.overrides,
  };
  const handler = createRemediationHandler(deps);
  const invoke = (body: unknown = { gapId: GAP_ID, expectedHeadSha: HEAD, expectedCiVersion: 7 }, method = "POST") => handler(new Request("https://example.invalid/terraform-ci-remediation-agent", { method, ...(method === "POST" ? { body: JSON.stringify(body) } : {}) }));
  return { invoke, calls };
}

test("admin claim produces one validated repair commit result", async () => {
  const h = harness();
  const response = await h.invoke();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).newHeadSha, NEXT);
  assert.deepEqual(h.calls, ["auth", "ready", `get:${GAP_ID}`, `claim:7:${HEAD}`, `repair:1:${HEAD}`, "complete:committed:1"]);
});

test("policy-rejected model output is completed without a GitHub commit", async () => {
  const h = harness({ repairOutcome: "rejected" });
  const response = await h.invoke();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.outcome, "rejected");
  assert.equal(body.newHeadSha, null);
  assert.deepEqual(h.calls.slice(-2), [`repair:1:${HEAD}`, "complete:rejected:1"]);
});

test("exhausted retry budget never calls the model or GitHub writer", async () => {
  const h = harness({ exhausted: true });
  const response = await h.invoke();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).outcome, "exhausted");
  assert.ok(!h.calls.some((call) => call.startsWith("repair:")));
});

test("missing server configuration does not consume a repair attempt", async () => {
  const h = harness({ ready: false });
  assert.equal((await h.invoke()).status, 503);
  assert.deepEqual(h.calls, ["auth", "ready"]);
});

for (const [principal, status] of [[null, 401], [{ id: "user", isAdmin: false }, 403]] as const) test(`caller ${JSON.stringify(principal)} is rejected`, async () => {
  const h = harness({ principal });
  assert.equal((await h.invoke()).status, status);
  assert.deepEqual(h.calls, ["auth"]);
});

for (const body of [
  {},
  { gapId: "bad", expectedHeadSha: HEAD, expectedCiVersion: 1 },
  { gapId: GAP_ID, expectedHeadSha: "main", expectedCiVersion: 1 },
  { gapId: GAP_ID, expectedHeadSha: HEAD, expectedCiVersion: 1.5 },
]) test("malformed repair claims are rejected before database access", async () => {
  const h = harness();
  assert.equal((await h.invoke(body)).status, 400);
  assert.deepEqual(h.calls, ["auth", "ready"]);
});

test("an internal repair failure is recorded and remains eligible for the bounded retry loop", async () => {
  const h = harness({ overrides: { repair: async () => { h.calls.push("repair:boom"); throw new Error("PRIVATE CI LOG"); } } });
  const response = await h.invoke();
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.ok(!text.includes("PRIVATE"));
  assert.equal(JSON.parse(text).outcome, "failed");
  assert.deepEqual(h.calls.slice(-2), ["repair:boom", "complete:failed:1"]);
});

test("preflight and non-POST requests have no side effects", async () => {
  const preflight = harness();
  assert.equal((await preflight.invoke(undefined, "OPTIONS")).status, 200);
  assert.deepEqual(preflight.calls, []);
  const get = harness();
  assert.equal((await get.invoke(undefined, "GET")).status, 405);
  assert.deepEqual(get.calls, []);
});
