import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertAppliedApproval, assertRemoteApplied, buildValidationChecks, type Json } from "./rules.ts";

const TARGET = "/subscriptions/11111111-2222-4333-8444-555555555555/resourceGroups/pilot/providers/Microsoft.Compute/virtualMachines/vm1";
const NOW = Date.parse("2026-09-06T13:00:00Z");
const before = new Date(NOW - 30_000).toISOString();
const pkg = { id: "package", created_by: "owner", status: "executed", action_type: "start_vm", execution_completed_at: before };
const identity = { package_id: "package", status: "succeeded", execution_engine: "hcp_terraform", plan_sha256: "a".repeat(64), source_revision: "b".repeat(40), hcp_run_id: "run-1", hcp_plan_id: "plan-1", hcp_workspace_id: "ws-1" };
const plan: Json = { ...identity, id: "plan", run_type: "plan", has_destroy: false, has_replace: false, reconciliation: { matched: true }, resolved_inputs: {} };
const apply = { ...identity, id: "apply", plan_run_id: "plan", run_type: "apply", hcp_run_status: "applied", completed_at: before };
const review = { package_id: "package", decision: "approved", reviewed_by: "reviewer", approved_plan_run_id: "plan", approved_plan_sha256: identity.plan_sha256, approved_source_revision: identity.source_revision, approved_hcp_run_id: identity.hcp_run_id, approved_hcp_plan_id: identity.hcp_plan_id };
const observation = { resourceId: TARGET, observedAt: new Date(NOW).toISOString(), provisioningState: "Succeeded", powerState: "PowerState/running", configuration: { vmSize: "Standard_D2s_v5", osType: "Linux" } };
const check = (action: string, patch: Json = {}, planPatch: Json = {}) => buildValidationChecks({ ...pkg, action_type: action }, apply, { ...plan, ...planPatch }, [TARGET], [{ ...observation, ...patch }], NOW);
const passes = (checks: ReturnType<typeof check>) => !checks.some(item => item.result === "FAIL");

describe("Exact applied approval evidence", () => {
  it("accepts the independently approved saved plan and matching successful apply", () => assert.doesNotThrow(() => assertAppliedApproval(pkg, apply, plan, review)));
  for (const [name, mutation] of [
    ["unfinished execution", { pkg: { status: "executing" } }],
    ["failed apply", { apply: { status: "failed" } }],
    ["legacy apply", { apply: { execution_engine: "legacy_runner" } }],
    ["unbound legacy review", { review: { approved_plan_run_id: null } }],
    ["different approved plan", { review: { approved_plan_run_id: "another" } }],
    ["different hash", { apply: { plan_sha256: "c".repeat(64) } }],
    ["different source", { apply: { source_revision: "c".repeat(40) } }],
    ["different HCP run", { apply: { hcp_run_id: "run-2" } }],
    ["different HCP plan", { apply: { hcp_plan_id: "plan-2" } }],
    ["different workspace", { apply: { hcp_workspace_id: "ws-2" } }],
    ["wrong package", { apply: { package_id: "another" } }],
    ["self approval", { review: { reviewed_by: "owner" } }],
    ["destructive plan", { plan: { has_destroy: true } }],
    ["missing completion time", { apply: { completed_at: null } }],
  ] as Array<[string, { pkg?: Json; apply?: Json; plan?: Json; review?: Json }]>) {
    it(`blocks ${name}`, () => assert.throws(() => assertAppliedApproval({ ...pkg, ...mutation.pkg }, { ...apply, ...mutation.apply }, { ...plan, ...mutation.plan }, { ...review, ...mutation.review })));
  }
  it("requires fresh HCP confirmation of the exact run/plan/workspace", () => {
    const remote = { id: "run-1", attributes: { status: "applied" }, relationships: { plan: { data: { id: "plan-1" } }, workspace: { data: { id: "ws-1" } } } };
    assert.doesNotThrow(() => assertRemoteApplied(remote, apply));
    assert.throws(() => assertRemoteApplied({ ...remote, attributes: { status: "applying" } }, apply));
    assert.throws(() => assertRemoteApplied({ ...remote, id: "run-2" }, apply));
  });
});

describe("Authoritative action-specific Azure validation", () => {
  it("passes a fresh running start despite optional missing telemetry", () => { const checks = check("start_vm"); assert.equal(passes(checks), true); assert.equal(checks.filter(item => item.result === "WARN").length, 2); });
  it("does not substring-match not-running states", () => assert.equal(passes(check("start_vm", { powerState: "not-running" })), false));
  it("requires exact powerOff/stopped and does not confuse deallocated with stopped", () => {
    assert.equal(passes(check("stop_vm", { powerState: "PowerState/stopped" }, { resolved_inputs: { action: "powerOff" } })), true);
    assert.equal(passes(check("stop_vm", { powerState: "PowerState/deallocated" }, { resolved_inputs: { action: "powerOff" } })), false);
    assert.equal(passes(check("stop_vm", { powerState: "PowerState/deallocated" }, { resolved_inputs: { action: "deallocate" } })), true);
  });
  it("compares resize against approved immutable inputs, not package/browser hints", () => {
    assert.equal(passes(check("resize_vm", {}, { resolved_inputs: { requested_vm_size: "Standard_D2s_v5" } })), true);
    assert.equal(passes(check("resize_vm", {}, { resolved_inputs: { requested_vm_size: "Standard_D4s_v5" } })), false);
    assert.equal(passes(check("resize_vm")), false);
  });
  it("never claims a running VM proves restart", () => assert.equal(passes(check("restart_vm")), false));
  for (const [name, patch] of [
    ["missing timestamp", { observedAt: null }],
    ["stale timestamp", { observedAt: new Date(NOW - 6 * 60_000).toISOString() }],
    ["pre-apply timestamp", { observedAt: new Date(NOW - 40_000).toISOString() }],
    ["future timestamp", { observedAt: new Date(NOW + 60_000).toISOString() }],
    ["wrong same-name target", { resourceId: TARGET.replace("/pilot/", "/other/") }],
    ["missing provisioning", { provisioningState: null }],
  ] as Array<[string, Json]>) it(`blocks ${name}`, () => assert.equal(passes(check("start_vm", patch)), false));
  it("fails an entire multi-VM package if one declared target is missing", () => assert.equal(passes(buildValidationChecks(pkg, apply, plan, [TARGET, `${TARGET}-2`], [observation], NOW)), false));
  it("rejects duplicate declared targets and duplicate observations", () => {
    assert.throws(() => buildValidationChecks(pkg, apply, plan, [TARGET, TARGET.toUpperCase()], [observation], NOW));
    assert.equal(passes(buildValidationChecks(pkg, apply, plan, [TARGET], [observation, observation], NOW)), false);
  });
  it("fails unsupported actions rather than reporting a warning and closing", () => assert.equal(passes(check("enable_backup")), false));
  it("verifies create existence, approved size, OS, region and exact NIC attachments", () => {
    const nic = TARGET.replace("Microsoft.Compute/virtualMachines/vm1", "Microsoft.Network/networkInterfaces/nic1");
    const after = { type: "Microsoft.Compute/virtualMachines@2024-07-01", parent_id: TARGET.split("/providers/")[0], name: "vm1", location: "eastus", body: { properties: { hardwareProfile: { vmSize: "Standard_D2s_v5" }, storageProfile: { osDisk: { osType: "Linux" } }, networkProfile: { networkInterfaces: [{ id: nic }] } } } };
    const planPatch = { hcp_plan_json: { resource_changes: [{ type: "azapi_resource", change: { actions: ["create"], after } }] } };
    assert.equal(passes(check("create_vm", { location: "eastus", networkInterfaceIds: [nic] }, planPatch)), true);
    assert.equal(passes(check("create_vm", { location: "westus", networkInterfaceIds: [nic] }, planPatch)), false);
    assert.equal(passes(check("create_vm", { location: "eastus", networkInterfaceIds: [] }, planPatch)), false);
    assert.equal(passes(check("create_vm")), false);
  });
});
