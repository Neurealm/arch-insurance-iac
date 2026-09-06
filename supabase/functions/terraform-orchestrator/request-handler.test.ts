import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTerraformRequestHandler } from "./request-handler.ts";
import type { PackageOperation, TerraformRequestDependencies } from "./request-handler.ts";

const PACKAGE_ID = "11111111-2222-4333-8444-555555555555";
const OWNER = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const OTHER_USER = "99999999-8888-4777-8666-555555555555";
const OPERATIONS: PackageOperation[] = ["resolve", "plan", "apply", "sync"];

function harness(options: { actor?: string | null; owner?: string | null; administrator?: boolean } = {}) {
  const calls: string[] = [];
  const db = { name: "isolated test database" };
  const actorId = options.actor === undefined ? OWNER : options.actor;
  const ownerId = options.owner === undefined ? OWNER : options.owner;
  const deps: TerraformRequestDependencies<typeof db> = {
    database: () => { calls.push("database"); return db; },
    authenticate: async () => { calls.push("authenticate"); return actorId ? { id: actorId } : null; },
    packageOwner: async (received, id) => {
      assert.equal(received, db);
      assert.equal(id, PACKAGE_ID);
      calls.push("packageOwner");
      return ownerId;
    },
    isAdministrator: async (received, actor) => {
      assert.equal(received, db);
      assert.equal(actor, actorId);
      calls.push("isAdministrator");
      return options.administrator ?? false;
    },
    operations: Object.fromEntries(OPERATIONS.map(operation => [operation, async (_request: Request, received: typeof db, actor: string, id: string) => {
      assert.equal(received, db);
      assert.equal(actor, actorId);
      assert.equal(id, PACKAGE_ID);
      calls.push(operation);
      return Response.json({ operation, packageId: id }, { status: operation === "plan" || operation === "apply" ? 202 : 200 });
    }])) as TerraformRequestDependencies<typeof db>["operations"],
    diagnose: async () => { calls.push("diagnose"); return Response.json({ diagnostic: true }); },
    reply: (_request, body, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } }),
    cors: () => ({ "access-control-allow-methods": "POST, OPTIONS" }),
  };
  return { calls, deps, handle: createTerraformRequestHandler(deps) };
}

function post(body: unknown) {
  return new Request("https://function.test/terraform-orchestrator", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

function assertNoOperation(calls: string[]) {
  assert.equal(calls.some(call => [...OPERATIONS, "diagnose"].includes(call)), false, "No business operation may run before authorization succeeds.");
}

describe("Terraform package authorization boundary", () => {
  for (const operation of OPERATIONS) {
    it(`${operation}: rejects an unauthenticated caller before package access`, async () => {
      const { handle, calls } = harness({ actor: null });
      const response = await handle(post({ operation, packageId: PACKAGE_ID }));
      assert.equal(response.status, 401);
      assert.deepEqual(calls, ["database", "authenticate"]);
    });

    it(`${operation}: rejects somebody else's package before any side effect or evidence read`, async () => {
      const { handle, calls } = harness({ actor: OTHER_USER });
      const response = await handle(post({ operation, packageId: PACKAGE_ID, actor: OWNER, created_by: OTHER_USER, isAdmin: true, role: "platform_admin" }));
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { error: "Change package not found or access denied." });
      assert.deepEqual(calls, ["database", "authenticate", "packageOwner", "isAdministrator"]);
      assert.equal(response.headers.get("cache-control"), "no-store");
    });

    it(`${operation}: does not reveal whether an inaccessible package exists`, async () => {
      const denied = harness({ actor: OTHER_USER });
      const missing = harness({ owner: null });
      const deniedResponse = await denied.handle(post({ operation, packageId: PACKAGE_ID }));
      const missingResponse = await missing.handle(post({ operation, packageId: PACKAGE_ID }));
      assert.equal(missingResponse.status, deniedResponse.status);
      assert.deepEqual(await missingResponse.json(), await deniedResponse.json());
      assertNoOperation(missing.calls);
    });

    it(`${operation}: preserves the requester's workflow after ownership verification`, async () => {
      const { handle, calls } = harness();
      const response = await handle(post({ operation, packageId: PACKAGE_ID }));
      assert.equal(response.status, operation === "plan" || operation === "apply" ? 202 : 200);
      assert.deepEqual(calls, ["database", "authenticate", "packageOwner", operation]);
    });

    it(`${operation}: preserves cross-package access for a verified administrator`, async () => {
      const { handle, calls } = harness({ actor: OTHER_USER, administrator: true });
      const response = await handle(post({ operation, packageId: PACKAGE_ID }));
      assert.ok(response.ok);
      assert.deepEqual(calls, ["database", "authenticate", "packageOwner", "isAdministrator", operation]);
    });

    it(`${operation}: does not let even an administrator operate on a missing package`, async () => {
      const { handle, calls } = harness({ owner: null, administrator: true });
      assert.equal((await handle(post({ operation, packageId: PACKAGE_ID }))).status, 404);
      assertNoOperation(calls);
    });
  }

  it("restricts diagnostics to a verified administrator", async () => {
    const ordinary = harness();
    assert.equal((await ordinary.handle(post({ operation: "diagnose" }))).status, 403);
    assertNoOperation(ordinary.calls);
    const admin = harness({ administrator: true });
    assert.equal((await admin.handle(post({ operation: "diagnose" }))).status, 200);
    assert.deepEqual(admin.calls, ["database", "authenticate", "isAdministrator", "diagnose"]);
  });

  for (const stage of ["database", "authenticate", "packageOwner", "isAdministrator"] as const) {
    it(`fails closed on ${stage} errors without disclosing backend details`, async () => {
      const { deps, handle, calls } = harness({ actor: OTHER_USER });
      deps[stage] = () => { throw new Error("private backend details must not appear"); };
      const response = await handle(post({ operation: "plan", packageId: PACKAGE_ID }));
      assert.equal(response.status, 503);
      assert.equal((await response.text()).includes("private backend"), false);
      assertNoOperation(calls);
    });
  }

  for (const id of [undefined, "", "-".repeat(36), "g".repeat(36), "not-a-uuid", 123, {}, `${PACKAGE_ID}/plan`]) {
    it(`rejects malformed package ID ${JSON.stringify(id)} before loading a package`, async () => {
      const { handle, calls } = harness();
      assert.equal((await handle(post({ operation: "plan", packageId: id }))).status, 400);
      assert.equal(calls.includes("packageOwner"), false);
      assertNoOperation(calls);
    });
  }

  for (const operation of [undefined, "", "destroy", "toString", "__proto__", {}, 123]) {
    it(`rejects unsupported operation ${JSON.stringify(operation)}`, async () => {
      const { handle, calls } = harness();
      assert.equal((await handle(post({ operation, packageId: PACKAGE_ID }))).status, 400);
      assert.equal(calls.includes("packageOwner"), false);
      assertNoOperation(calls);
    });
  }

  for (const body of [null, [], "plan", 42]) {
    it(`rejects non-object JSON ${JSON.stringify(body)} without initializing the database`, async () => {
      const { handle, calls } = harness();
      assert.equal((await handle(post(body))).status, 400);
      assert.deepEqual(calls, []);
    });
  }

  it("rejects malformed JSON", async () => {
    const { handle, calls } = harness();
    const request = new Request("https://function.test", { method: "POST", body: "{" });
    assert.equal((await handle(request)).status, 400);
    assert.deepEqual(calls, []);
  });

  it("handles preflight and unsupported methods without touching the database", async () => {
    const { handle, calls } = harness();
    const preflight = await handle(new Request("https://function.test", { method: "OPTIONS" }));
    assert.equal(preflight.status, 200);
    assert.equal(preflight.headers.get("access-control-allow-methods"), "POST, OPTIONS");
    assert.equal((await handle(new Request("https://function.test"))).status, 405);
    assert.deepEqual(calls, []);
  });

  it("preserves existing business guard errors after authorization", async () => {
    const { handle, deps, calls } = harness();
    deps.operations.plan = async () => { throw new Error("Only a submitted package can be planned."); };
    const response = await handle(post({ operation: "plan", packageId: PACKAGE_ID }));
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { error: "Only a submitted package can be planned." });
    assert.deepEqual(calls, ["database", "authenticate", "packageOwner"]);
  });
});
