import { test } from "node:test";
import assert from "node:assert/strict";
import { hclLiteral, resolveExecutionScope } from "./execution-policy.ts";

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
