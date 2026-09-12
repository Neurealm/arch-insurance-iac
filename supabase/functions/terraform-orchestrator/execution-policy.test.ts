import { test } from "node:test";
import assert from "node:assert/strict";
import { assessPlan, hclLiteral, resolveExecutionScope, typedInputs } from "./execution-policy.ts";

test("HCP run inputs preserve literal Terraform interpolation text", () => {
  assert.equal(hclLiteral("${1 + 1}"), '"$${1 + 1}"');
  assert.equal(hclLiteral('%{if true}x%{endif}'), '"%%{if true}x%%{endif}"');
  assert.equal(hclLiteral({ tag: "${file(path.root)}" }), '{"tag":"$${file(path.root)}"}');
  assert.equal(hclLiteral(["${var.other}", "literal"]), '["$${var.other}","literal"]');
  assert.equal(hclLiteral("$${already}"), '"$$${already}"');
});
test("HCP run inputs retain primitive literals", () => {
  assert.equal(hclLiteral("Standard_D2s_v5"), '"Standard_D2s_v5"');
  assert.equal(hclLiteral(2), "2");
  assert.equal(hclLiteral(false), "false");
  assert.throws(() => hclLiteral(undefined));
});

// ---------------------------------------------------------------------------
// resolveExecutionScope
//
// The four mutate-an-existing-VM capabilities are authorized by exact
// set-equality against HCP_TERRAFORM_SCOPE_BINDINGS. Provisioning cannot be,
// because the machines do not exist when the binding is written, so its exact
// set comes from a platform administrator's per-batch authorization instead.
// The first test below is the regression that matters: the existing path must
// behave identically.
// ---------------------------------------------------------------------------

const SUB = "7dc9a7e7-2294-487c-af02-7cee2806017f";
const RG = `/subscriptions/${SUB}/resourceGroups/iac-pilot-dev`;
const VM01 = `${RG}/providers/Microsoft.Compute/virtualMachines/iac-pilot-vm01`;
const NEW = (n: string) => `${RG}/providers/Microsoft.Compute/virtualMachines/claims-vm-${n}`;
const SUBNET = `${RG}/providers/Microsoft.Network/virtualNetworks/pilot-vnet/subnets/workload`;
const REVISION = "a305ac8de3712593e7c8f49201b53074507d3bd0";
const NO_BINDING = /Exactly one reviewed workspace\/target scope binding is required/;

const actionBinding = {
  moduleSource: "terraform/modules/vm-action", environment: "development", stateAttested: true,
  workspaceId: "ws-mYVgBMRzGSATtRnc", workspaceName: "arch-vm-ops-development", sourceRevision: REVISION,
  resourceGroupId: RG, targetResourceIds: [VM01], managedResourceIds: [],
  allowedRegions: ["eastus"], allowedVmSizes: [], allowedSubnetIds: [],
  applyEnabled: true, provisioningEnabled: false,
};
const createBinding = {
  moduleSource: "terraform/modules/vm-batch-create", environment: "development", stateAttested: true,
  workspaceId: "ws-mYVgBMRzGSATtRnc", workspaceName: "arch-vm-ops-development", sourceRevision: REVISION,
  resourceGroupId: RG, managedResourceIds: [],
  allowedRegions: ["eastus"], allowedVmSizes: ["Standard_B2s"], allowedSubnetIds: [SUBNET],
  applyEnabled: true, provisioningEnabled: true,
};
const bindings = (...items: unknown[]) => JSON.stringify(items);

const actionCapability = {
  module_source: "terraform/modules/vm-action", execution_mode: "azapi_action",
  allowed_environments: ["development"], max_targets_per_run: 1, requires_managed_resource: false,
  // Matches the real seeded shape (20260906050000_add_typed_input_schema.sql).
  input_schema: { action: "start", fields: [
    { key: "target_resource_id", source: "target", type: "string", required: true, pattern: "^/subscriptions/" },
    { key: "change_request_id", source: "package_number_or_ticket", type: "string", required: true, minLength: 6 },
  ] },
};
const createCapability = {
  module_source: "terraform/modules/vm-batch-create", execution_mode: "azapi_resource",
  allowed_environments: ["development"], max_targets_per_run: 20, requires_managed_resource: false,
  approved_source_revision: REVISION, approval_gap_id: "581ef9ed-67c2-492a-b327-e08e6d796cc4",
};
const startPkg = { region: "eastus", action_type: "start_vm", parameters: {} };
const createPkg = {
  region: "eastus", action_type: "create_vm",
  parameters: { environment: "development", vmSize: "Standard_B2s", subnetArmId: SUBNET },
};
const diskCapability = {
  module_source: "terraform/modules/vm-os-disk-expand", execution_mode: "azapi_update", action_type: "increase_os_disk",
  allowed_environments: ["development"], max_targets_per_run: 1, requires_managed_resource: true,
  input_schema: { fields: [
    { key: "target_resource_id", type: "string", source: "target", required: true },
    { key: "requested_os_disk_size_gb", type: "integer", source: "parameters.requestedOsDiskSizeGB", required: true, minimum: 64, maximum: 4095 },
    { key: "change_request_id", type: "string", source: "package_number_or_ticket", required: true, minLength: 6 },
  ] },
};
const diskPkg = { package_number: "VM-CHG-123456", region: "eastus", action_type: "increase_os_disk", parameters: { requestedOsDiskSizeGB: 128 } };
const diskBinding = {
  moduleSource: "terraform/modules/vm-os-disk-expand", environment: "development", stateAttested: true,
  workspaceId: "ws-mYVgBMRzGSATtRnc", workspaceName: "arch-vm-ops-development", sourceRevision: REVISION,
  resourceGroupId: RG, targetResourceIds: [VM01], managedResourceIds: [VM01],
  allowedRegions: ["eastus"], allowedVmSizes: [], allowedSubnetIds: [], maxOsDiskSizeGb: 256,
  applyEnabled: true, provisioningEnabled: false,
};

test("an existing mutate capability resolves exactly as before", () => {
  const scope = resolveExecutionScope(bindings(actionBinding), startPkg, actionCapability, [VM01]);
  assert.equal(scope.workspaceId, "ws-mYVgBMRzGSATtRnc");
  assert.equal(scope.sourceRevision, REVISION);
  assert.deepEqual(scope.targetResourceIds, [VM01.toLowerCase()]);
  assert.equal(scope.applyEnabled, true);
  // An authorization must not alter a non-provisioning result.
  const withAuthorization = resolveExecutionScope(bindings(actionBinding), startPkg, actionCapability, [VM01], [NEW("99")]);
  assert.deepEqual(withAuthorization, scope);
});

test("a mutate capability is still refused when the binding names a different VM", () => {
  assert.throws(() => resolveExecutionScope(bindings(actionBinding), startPkg, actionCapability, [NEW("01")]), NO_BINDING);
});

test("provisioning is refused until an administrator authorizes the exact machines", () => {
  assert.throws(() => resolveExecutionScope(bindings(createBinding), createPkg, createCapability, [NEW("01"), NEW("02")]),
    /must authorize the exact machines/);
  assert.throws(() => resolveExecutionScope(bindings(createBinding), createPkg, createCapability, [NEW("01"), NEW("02")], []),
    /must authorize the exact machines/);
});

test("provisioning is refused when the authorization disagrees by a single machine", () => {
  assert.throws(() => resolveExecutionScope(bindings(createBinding), createPkg, createCapability,
    [NEW("01"), NEW("02"), NEW("03")], [NEW("01"), NEW("02")]), /no longer match the authorized machines/);
  assert.throws(() => resolveExecutionScope(bindings(createBinding), createPkg, createCapability,
    [NEW("01"), NEW("02")], [NEW("01"), NEW("99")]), /no longer match the authorized machines/);
});

test("provisioning resolves when the authorization matches exactly, order-independently", () => {
  const scope = resolveExecutionScope(bindings(createBinding), createPkg, createCapability,
    [NEW("01"), NEW("02"), NEW("03")], [NEW("03"), NEW("01"), NEW("02")]);
  assert.equal(scope.provisioningEnabled, true);
  assert.equal(scope.targetResourceIds.length, 3);
  assert.deepEqual(scope.allowedSubnetIds, [SUBNET.toLowerCase()]);
});

test("a provisioning binding cannot capture a mutate capability", () => {
  const impostor = { ...createBinding, moduleSource: "terraform/modules/vm-action" };
  assert.throws(() => resolveExecutionScope(bindings(impostor), startPkg, actionCapability, [VM01]), NO_BINDING);
});

test("a binding that both names targets and enables provisioning is ambiguous and matches nothing", () => {
  const ambiguous = { ...createBinding, targetResourceIds: [NEW("01")] };
  assert.throws(() => resolveExecutionScope(bindings(ambiguous), createPkg, createCapability, [NEW("01")], [NEW("01")]), NO_BINDING);
});

test("creation enforces the authorized SKU list, and an empty list fails closed", () => {
  assert.throws(() => resolveExecutionScope(bindings(createBinding),
    { ...createPkg, parameters: { ...createPkg.parameters, vmSize: "Standard_D64s_v5" } },
    createCapability, [NEW("01")], [NEW("01")]), /VM SKU has not been authorized/);
  assert.throws(() => resolveExecutionScope(bindings({ ...createBinding, allowedVmSizes: [] }), createPkg,
    createCapability, [NEW("01")], [NEW("01")]), /VM SKU has not been authorized/);
});

test("creation enforces the authorized subnet, and an empty list fails closed", () => {
  const foreign = `/subscriptions/${SUB}/resourceGroups/other-rg/providers/Microsoft.Network/virtualNetworks/v/subnets/s`;
  assert.throws(() => resolveExecutionScope(bindings(createBinding),
    { ...createPkg, parameters: { ...createPkg.parameters, subnetArmId: foreign } },
    createCapability, [NEW("01")], [NEW("01")]), /subnet has not been authorized/);
  assert.throws(() => resolveExecutionScope(bindings({ ...createBinding, allowedSubnetIds: [] }), createPkg,
    createCapability, [NEW("01")], [NEW("01")]), /subnet has not been authorized/);
});

test("provisioning still requires a promoted capability and an enabled scope", () => {
  assert.throws(() => resolveExecutionScope(bindings(createBinding), createPkg,
    { ...createCapability, approved_source_revision: null }, [NEW("01")], [NEW("01")]), /promoted capability/);
  assert.throws(() => resolveExecutionScope(bindings({ ...createBinding, provisioningEnabled: false }), createPkg,
    createCapability, [NEW("01")], [NEW("01")]), NO_BINDING);
});

test("a target outside the authorized resource group is refused even when authorized", () => {
  const outside = `/subscriptions/${SUB}/resourceGroups/other-rg/providers/Microsoft.Compute/virtualMachines/claims-vm-01`;
  assert.throws(() => resolveExecutionScope(bindings(createBinding), createPkg, createCapability, [outside], [outside]),
    /leave the authorized resource group/);
});

test("OS disk expansion requires a managed target and an explicitly authorized maximum", () => {
  const scope = resolveExecutionScope(bindings(diskBinding), diskPkg, diskCapability, [VM01]);
  assert.equal(scope.maxOsDiskSizeGb, 256);
  assert.throws(() => resolveExecutionScope(bindings({ ...diskBinding, maxOsDiskSizeGb: 127 }), diskPkg, diskCapability, [VM01]), /capacity has not been authorized/);
  assert.throws(() => resolveExecutionScope(bindings({ ...diskBinding, managedResourceIds: [] }), diskPkg, diskCapability, [VM01]), /ownership\/adoption is required/);
  assert.throws(() => typedInputs({ ...diskPkg, parameters: { requestedOsDiskSizeGB: 32 } }, diskCapability, VM01), /outside the approved range/);
});

// ---------------------------------------------------------------------------
// vm-action retrigger: azapi_resource_action has no way to prove a repeat
// start/stop/restart will re-execute, since Terraform only diffs
// type/resource_id/action/method -- identical across two distinct change
// requests. The module now pairs it with a terraform_data resource holding
// change_request_id and a `replace_triggered_by` on the action, so a repeat
// request forces a replace (delete+create) instead of an unprovable no-op.
// These tests cover assessPlan's narrow, explicit exception for exactly that
// pattern -- and confirm it is not a general loosening of the destroy ban.
// ---------------------------------------------------------------------------

function actionResourceChange(actions: string[], overrides: Record<string, unknown> = {}) {
  return {
    mode: "managed", provider_name: "registry.terraform.io/azure/azapi", type: "azapi_resource_action",
    change: {
      actions,
      after: {
        resource_id: VM01, type: "Microsoft.Compute/virtualMachines@2024-07-01", action: "start", method: "POST",
        when: "apply", body: {}, sensitive_body: {}, query_parameters: {}, headers: {}, ...overrides,
      },
      after_unknown: {},
    },
  };
}
function triggerResourceChange(actions: string[], input: string) {
  return {
    mode: "managed", provider_name: "terraform.io/builtin/terraform", type: "terraform_data",
    change: { actions, after: { input, output: input, triggers_replace: null }, after_unknown: {} },
  };
}

test("a first-ever start_vm plan creates both the trigger and the action", () => {
  const inputs = typedInputs({ ...startPkg, package_number: "VM-CHG-000111" }, actionCapability, VM01);
  const plan = { resource_changes: [triggerResourceChange(["create"], "VM-CHG-000111"), actionResourceChange(["create"])] };
  assert.equal(assessPlan(plan, [VM01], inputs, actionCapability).matched, true);
});

test("a repeat start_vm request forces a replace and is still approvable", () => {
  const inputs = typedInputs({ ...startPkg, package_number: "VM-CHG-000222" }, actionCapability, VM01);
  const plan = { resource_changes: [triggerResourceChange(["update"], "VM-CHG-000222"), actionResourceChange(["delete", "create"])] };
  assert.equal(assessPlan(plan, [VM01], inputs, actionCapability).matched, true);
});

test("a trigger whose input does not match this ticket's change_request_id is rejected", () => {
  const inputs = typedInputs({ ...startPkg, package_number: "VM-CHG-000333" }, actionCapability, VM01);
  const plan = { resource_changes: [triggerResourceChange(["update"], "someone-elses-ticket"), actionResourceChange(["delete", "create"])] };
  assert.equal(assessPlan(plan, [VM01], inputs, actionCapability).matched, false);
});

test("a trigger the plan tries to delete outright is rejected", () => {
  const inputs = typedInputs({ ...startPkg, package_number: "VM-CHG-000444" }, actionCapability, VM01);
  const plan = { resource_changes: [triggerResourceChange(["delete"], "VM-CHG-000444"), actionResourceChange(["delete", "create"])] };
  assert.equal(assessPlan(plan, [VM01], inputs, actionCapability).matched, false);
});

test("the action resource deleted alone, without a paired create, is still prohibited", () => {
  const inputs = typedInputs({ ...startPkg, package_number: "VM-CHG-000555" }, actionCapability, VM01);
  const plan = { resource_changes: [triggerResourceChange(["update"], "VM-CHG-000555"), actionResourceChange(["delete"])] };
  const result = assessPlan(plan, [VM01], inputs, actionCapability);
  assert.equal(result.matched, false);
  assert.equal(result.destroy, true);
});

test("a genuine no-op (the trigger did not change) is still refused, not silently trusted", () => {
  const inputs = typedInputs({ ...startPkg, package_number: "VM-CHG-000666" }, actionCapability, VM01);
  const plan = { resource_changes: [triggerResourceChange(["no-op"], "VM-CHG-000666"), actionResourceChange(["no-op"])] };
  assert.equal(assessPlan(plan, [VM01], inputs, actionCapability).matched, false);
});

test("the replace exception is scoped to azapi_resource_action only, never azapi_update_resource", () => {
  const inputs = typedInputs(diskPkg, diskCapability, VM01);
  const plan = { resource_changes: [{
    mode: "managed", provider_name: "registry.terraform.io/azure/azapi", type: "azapi_update_resource",
    change: { actions: ["delete", "create"], after: { resource_id: VM01, type: "Microsoft.Compute/virtualMachines@2024-07-01", body: { properties: { storageProfile: { osDisk: { diskSizeGB: 128 } } } }, sensitive_body: {} }, after_unknown: {} },
  }] };
  const result = assessPlan(plan, [VM01], inputs, diskCapability);
  assert.equal(result.matched, false);
  assert.equal(result.replace, true);
});

test("OS disk plan must modify exactly diskSizeGB on the declared VM", () => {
  const inputs = typedInputs(diskPkg, diskCapability, VM01);
  const plan = { resource_changes: [{
    mode: "managed", provider_name: "registry.terraform.io/azure/azapi", type: "azapi_update_resource",
    change: { actions: ["update"], after: { resource_id: VM01, type: "Microsoft.Compute/virtualMachines@2024-07-01", body: { properties: { storageProfile: { osDisk: { diskSizeGB: 128 } } } }, sensitive_body: {} }, after_unknown: {} },
  }] };
  assert.equal(assessPlan(plan, [VM01], inputs, diskCapability).matched, true);
  const unsafe = {
    ...plan,
    resource_changes: [{
      ...plan.resource_changes[0],
      change: {
        ...plan.resource_changes[0].change,
        after: {
          ...plan.resource_changes[0].change.after,
          body: { properties: { storageProfile: { osDisk: { diskSizeGB: 128 } }, hardwareProfile: { vmSize: "Standard_D4s_v5" } } },
        },
      },
    }],
  };
  assert.equal(assessPlan(unsafe, [VM01], inputs, diskCapability).matched, false);
});
