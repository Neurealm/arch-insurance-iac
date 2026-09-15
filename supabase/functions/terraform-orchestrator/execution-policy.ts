type Json = Record<string, unknown>;
const obj = (value: unknown): Json => value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
const arr = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const str = (value: unknown): string => typeof value === "string" ? value.trim() : "";
const SHA = /^[0-9a-f]{40}$/;
const VM = "microsoft.compute/virtualmachines";
const NIC = "microsoft.network/networkinterfaces";
const hasUnknown = (value: unknown): boolean => value === true || (Array.isArray(value) ? value.some(hasUnknown) : !!value && typeof value === "object" && Object.values(value).some(hasUnknown));
const emptyObject = (value: unknown): boolean => value == null || (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0);
// HCP run variables are HCL expressions, not JSON-only string values. Escape
// Terraform template markers so user input cannot evaluate file/env functions.
export function hclLiteral(value: unknown): string {
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error("Undefined Terraform input.");
  return encoded.replace(/\$\{/g, () => "$${").replace(/%\{/g, () => "%%{");
}
export function armIdentity(value: unknown) {
  const match = str(value).match(/^\/subscriptions\/([0-9a-f-]{36})\/resourceGroups\/([A-Za-z0-9_.()-]+)\/providers\/(Microsoft\.(?:Compute|Network)\/(?:virtualMachines|networkInterfaces))\/([A-Za-z0-9_-]+)$/i);
  if (!match || ![VM, NIC].includes(match[3].toLowerCase())) throw new Error("An exact VM or NIC ARM resource ID is required.");
  return { id: str(value).toLowerCase(), type: match[3].toLowerCase(), name: match[4], resourceGroupId: `/subscriptions/${match[1]}/resourceGroups/${match[2]}`.toLowerCase() };
}
const sameSet = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

export type ExecutionScope = {
  environment: string; workspaceId: string; workspaceName: string; moduleSource: string;
  sourceRevision: string; targetResourceIds: string[]; managedResourceIds: string[];
  resourceGroupId: string; allowedRegions: string[]; allowedVmSizes: string[];
  allowedSubnetIds: string[]; maxOsDiskSizeGb: number | null; applyEnabled: boolean; provisioningEnabled: boolean;
};

/**
 * Server-only configuration; never fall back to caller tags or a global shared workspace.
 *
 * `authorizedTargets` is the exact machine set a platform administrator named
 * for a provisioning package (iac_provisioning_authorizations). It is required
 * only for `azapi_resource` capabilities and is ignored for every other one.
 */
export function resolveExecutionScope(raw: string | undefined, pkg: Json, capability: Json, targets: string[], authorizedTargets?: string[] | null): ExecutionScope {
  let values: unknown;
  try { values = JSON.parse(raw ?? "[]"); } catch { throw new Error("Trusted Terraform scope configuration is invalid."); }
  const exactTargets = targets.map(id => armIdentity(id).id);
  if (!exactTargets.length || new Set(exactTargets).size !== exactTargets.length) throw new Error("Target set is empty or duplicated.");
  const provisioning = capability.execution_mode === "azapi_resource";
  // Mutate-an-existing-VM capabilities are matched exactly as before: the
  // binding itself names the resources. A provisioning binding cannot, because
  // the machines do not exist yet, so it declares no targetResourceIds and the
  // exact set comes from the administrator's authorization below. A binding
  // that declares both is ambiguous and matches nothing.
  const candidates = arr(values).map(obj).filter(scope => scope.moduleSource === capability.module_source && (provisioning
    ? scope.provisioningEnabled === true && !arr(scope.targetResourceIds).length
    : sameSet(arr(scope.targetResourceIds).map(id => armIdentity(id).id), exactTargets)));
  if (candidates.length !== 1) throw new Error("Exactly one reviewed workspace/target scope binding is required. Configure HCP_TERRAFORM_SCOPE_BINDINGS on the server.");
  if (provisioning) {
    const authorized = (authorizedTargets ?? []).map(id => armIdentity(id).id);
    if (!authorized.length) throw new Error("A platform administrator must authorize the exact machines this package will create before it can be planned.");
    if (!sameSet(authorized, exactTargets)) throw new Error("The package's declared targets no longer match the authorized machines. Re-authorize before planning.");
  }
  const scope = candidates[0];
  const environment = str(scope.environment).toLowerCase();
  if (!["development", "preproduction", "pre-production", "production"].includes(environment) || scope.stateAttested !== true) throw new Error("Workspace state ownership must be reviewed and attested before planning.");
  if (!/^ws-[A-Za-z0-9]+$/.test(str(scope.workspaceId)) || !/^[A-Za-z0-9_-]+$/.test(str(scope.workspaceName))) throw new Error("Trusted workspace identity is invalid.");
  const sourceRevision = str(capability.approved_source_revision) || str(scope.sourceRevision);
  if (!SHA.test(sourceRevision) || (scope.sourceRevision && str(scope.sourceRevision) !== sourceRevision)) throw new Error("An exact reviewed source commit is required; mutable branch/tag fallback is disabled.");
  const requestedEnvironment = str(obj(pkg.parameters).environment).toLowerCase();
  const normal = (value: string) => value.replace("pre-production", "preproduction");
  if (requestedEnvironment && normal(requestedEnvironment) !== normal(environment)) throw new Error("Requested environment disagrees with the server-authorized Azure scope.");
  if (!arr(capability.allowed_environments).some(value => normal(str(value).toLowerCase()) === normal(environment))) throw new Error("Capability is not approved for the bound environment.");
  const group = str(scope.resourceGroupId).toLowerCase();
  if (!/^\/subscriptions\/[0-9a-f-]{36}\/resourcegroups\/[a-z0-9_.()-]+$/.test(group) || exactTargets.some(id => armIdentity(id).resourceGroupId !== group)) throw new Error("Package targets leave the authorized resource group.");
  const managed = arr(scope.managedResourceIds).map(id => armIdentity(id).id);
  if (capability.requires_managed_resource === true && exactTargets.some(id => !managed.includes(id))) throw new Error("Verified Terraform ownership/adoption is required for every target.");
  if (exactTargets.length > Number(capability.max_targets_per_run ?? 1)) throw new Error("Capability target limit exceeded.");
  const allowedRegions = arr(scope.allowedRegions).map(value => str(value).toLowerCase());
  if (!allowedRegions.length || !allowedRegions.includes(str(pkg.region).toLowerCase())) throw new Error("Requested region is outside the authorized scope.");
  const sizes = arr(scope.allowedVmSizes).map(str);
  if (pkg.action_type === "resize_vm" && !sizes.includes(str(obj(pkg.parameters).requestedVmSize))) throw new Error("Requested VM SKU has not been authorized for this scope.");
  const maxOsDiskSizeGb = Number(scope.maxOsDiskSizeGb);
  const requestedOsDiskSizeGb = Number(obj(pkg.parameters).requestedOsDiskSizeGB);
  if (pkg.action_type === "increase_os_disk" && (!Number.isSafeInteger(requestedOsDiskSizeGb) || !Number.isSafeInteger(maxOsDiskSizeGb) || maxOsDiskSizeGb < 64 || maxOsDiskSizeGb > 4095 || requestedOsDiskSizeGb > maxOsDiskSizeGb)) throw new Error("Requested OS disk capacity has not been authorized for this scope.");
  const subnets = arr(scope.allowedSubnetIds).map(value => str(value).toLowerCase());
  if (provisioning) {
    if (!capability.approved_source_revision || !capability.approval_gap_id || scope.provisioningEnabled !== true) throw new Error("Provisioning requires a promoted capability and an explicitly verified creation scope.");
    // The SKU is the cost control. Without this a ticket chooses the size of
    // every machine in the batch; resize_vm has been checked since day one and
    // creation is the larger exposure.
    if (!sizes.length || !sizes.includes(str(obj(pkg.parameters).vmSize))) throw new Error("Requested VM SKU has not been authorized for this scope.");
    // allowedSubnetIds has existed on the scope since it was introduced and was
    // never read. The subnet now arrives from a ticket, so it is checked here --
    // before HCP is contacted and before any credential is used -- against a
    // server secret the requester cannot reach.
    const requestedSubnet = str(obj(pkg.parameters).subnetArmId).toLowerCase();
    if (!subnets.length || !subnets.includes(requestedSubnet)) throw new Error("The requested subnet has not been authorized for this scope.");
  }
  return { environment, workspaceId: str(scope.workspaceId), workspaceName: str(scope.workspaceName), moduleSource: str(scope.moduleSource), sourceRevision,
    targetResourceIds: exactTargets, managedResourceIds: managed, resourceGroupId: group, allowedRegions, allowedVmSizes: sizes,
    allowedSubnetIds: subnets, maxOsDiskSizeGb: Number.isSafeInteger(maxOsDiskSizeGb) ? maxOsDiskSizeGb : null, applyEnabled: scope.applyEnabled === true, provisioningEnabled: scope.provisioningEnabled === true };
}

export function typedInputs(pkg: Json, capability: Json, target: string): Json {
  const schema = obj(capability.input_schema), fields = arr(schema.fields).map(obj), inputs: Json = {};
  if (!fields.length) throw new Error("Capability input schema is missing.");
  if (typeof schema.action === "string") inputs.action = schema.action;
  const keys = new Set<string>();
  for (const field of fields) {
    const key = str(field.key), source = str(field.source), type = str(field.type);
    if (!/^[a-z][a-z0-9_]*$/.test(key) || ["tfc_azure_dynamic_credentials", "action", "__proto__", "constructor", "prototype"].includes(key) || keys.has(key)) throw new Error("Capability input key is invalid or duplicated.");
    keys.add(key);
    let value: unknown;
    if (source === "target") value = target;
    else if (source === "package_number_or_ticket") value = str(pkg.package_number);
    else if (/^parameters\.[A-Za-z][A-Za-z0-9_.]*$/.test(source) && !source.split(".").some(part => ["__proto__", "constructor", "prototype"].includes(part))) value = source.slice(11).split(".").reduce<unknown>((current, part) => obj(current)[part], obj(pkg.parameters));
    else throw new Error(`Invalid input source for ${key}.`);
    if (value === undefined || value === null || value === "") { if (field.required === true) throw new Error(`Required Terraform input ${key} is missing.`); continue; }
    const valid = type === "string" ? typeof value === "string" : type === "number" ? typeof value === "number" && Number.isFinite(value) : type === "integer" ? Number.isSafeInteger(value) : type === "bool" || type === "boolean" ? typeof value === "boolean" : type === "list(string)" ? Array.isArray(value) && value.length > 0 && value.length <= 50 && value.every(item => typeof item === "string") : type === "map(string)" ? !Array.isArray(value) && typeof value === "object" && Object.values(value).every(item => typeof item === "string") : false;
    if (!valid) throw new Error(`Terraform input ${key} has an invalid ${type} value.`);
    if (typeof value === "string") {
      if (value.length > 16000 || (typeof field.minLength === "number" && value.length < field.minLength)) throw new Error(`Terraform input ${key} has an invalid length.`);
      if (typeof field.pattern === "string" && (field.pattern.length > 500 || !new RegExp(field.pattern).test(value))) throw new Error(`Terraform input ${key} failed validation.`);
    }
    if (typeof value === "number" && (type === "number" || type === "integer") && ((typeof field.minimum === "number" && value < field.minimum) || (typeof field.maximum === "number" && value > field.maximum))) throw new Error(`Terraform input ${key} is outside the approved range.`);
    inputs[key] = value;
  }
  return inputs;
}

/** Analyze actual resource changes, not arbitrary nested resource_id values. */
export function assessPlan(plan: Json, targets: string[], inputs: Json, capability: Json, options: { allowDestroy?: boolean } = {}) {
  // WARNING -- DELIBERATELY RELAXED, AUTHORIZED 2026-09-08 by the project owner.
  // allowDestroy lets a PLAN that deletes resources be recorded as policy-clean
  // so it can be reviewed. Apply must still call assessPlan without this option
  // (or reject `destroy` explicitly); nothing is ever deleted without a separate
  // human apply decision on the exact saved plan.
  const allowDestroy = options.allowDestroy === true;
  const expected = new Set(targets.map(value => armIdentity(value).id));
  const seen = new Set<string>(), createdNics = new Set<string>(), violations: string[] = [], actions: Json = {};
  // Resource groups the declared targets live in. resolveExecutionScope has
  // already proven every target sits in the single authorized group, so this is
  // the boundary a derived NIC is allowed to be created inside.
  const targetGroups = new Set([...expected].map(id => armIdentity(id).resourceGroupId));
  let destroy = false, replace = false;
  const changes = arr(plan.resource_changes).map(obj);
  if (!changes.length) violations.push("Plan contains no managed-resource evidence.");
  for (const resource of changes) {
    const change = obj(resource.change), after = obj(change.after), unknown = obj(change.after_unknown);
    const operations = arr(change.actions).map(str);
    for (const op of operations) actions[op] = Number(actions[op] ?? 0) + 1;

    // The vm-action module's retrigger helper (see its main.tf): a bare
    // terraform_data resource holding only the current change_request_id, so
    // that the azapi_resource_action below has something that changes on
    // every distinct ticket and can be force-replaced instead of planning as
    // an unprovable no-op. It calls no API and owns no Azure identity, so it
    // is validated here and excluded entirely from the ARM-identity/destroy/
    // replace bookkeeping below -- it can never stand in for, or mask, a
    // change to an actual Azure resource.
    if (resource.type === "terraform_data") {
      if (resource.mode !== "managed" || !str(resource.provider_name).toLowerCase().endsWith("builtin/terraform") || operations.includes("delete") || str(after.input) !== str(inputs.change_request_id)) {
        violations.push("Unexpected action-retrigger resource evidence.");
      }
      continue;
    }

    // A replace (delete+create) of exactly the action-invoking resource is
    // the one safe exception to the destroy ban below: azapi_resource_action
    // corresponds to no persistent Azure state, so removing Terraform's
    // bookkeeping for a past action call and recreating it has zero Azure
    // effect on its own -- it is what makes the retrigger above actually
    // cause the action to be re-invoked at apply, instead of silently
    // skipping a genuine repeat start/stop/restart request.
    const isActionReplace = resource.type === "azapi_resource_action" && operations.length === 2 && operations.includes("delete") && operations.includes("create");
    if (!isActionReplace) {
      if (operations.includes("delete")) destroy = true;
      if (operations.includes("delete") && operations.includes("create")) replace = true;
    }
    if (resource.mode !== "managed" || str(resource.provider_name).toLowerCase() !== "registry.terraform.io/azure/azapi") { violations.push("Unexpected resource mode or provider."); continue; }
    // A pure delete has no `after` body to validate against the request. When
    // deletions are permitted it is recorded and skipped; the destroy flag above
    // still carries it into every downstream decision.
    if (allowDestroy && operations.length === 1 && operations[0] === "delete") continue;
    if (!operations.length || (operations.some(op => !["create", "update", "no-op"].includes(op)) && !isActionReplace)) violations.push("Destroy, replace or unsupported resource operation is prohibited.");

    let id: string;
    try {
      if (resource.type === "azapi_resource_action" || resource.type === "azapi_update_resource") {
        if (unknown.resource_id || unknown.type) throw new Error("Unknown action target/type.");
        id = armIdentity(after.resource_id).id;
        if (str(after.type) !== "Microsoft.Compute/virtualMachines@2024-07-01") throw new Error("Unexpected VM API type/version.");
        if (resource.type === "azapi_resource_action") {
          if (capability.execution_mode !== "azapi_action" || hasUnknown(unknown.action) || hasUnknown(unknown.method) || hasUnknown(unknown.when) || hasUnknown(unknown.body) || hasUnknown(unknown.sensitive_body) || after.action !== inputs.action || after.method !== "POST" || (after.when ?? "apply") !== "apply" || !["start", "powerOff", "restart"].includes(str(after.action)) || !emptyObject(after.body) || !emptyObject(after.sensitive_body) || !emptyObject(after.query_parameters) || !emptyObject(after.headers)) throw new Error("Action does not match the approved VM request.");
          if (operations.includes("no-op")) throw new Error("No-op action plan cannot prove that a new requested VM action will execute.");
        } else {
          if (capability.execution_mode !== "azapi_update" || hasUnknown(unknown.body) || hasUnknown(unknown.sensitive_body) || !emptyObject(after.sensitive_body)) throw new Error("Unexpected or unknown VM update.");
          const body = obj(after.body), properties = obj(body.properties);
          if (capability.action_type === "resize_vm") {
            const profile = obj(properties.hardwareProfile);
            if (Object.keys(body).join() !== "properties" || Object.keys(properties).join() !== "hardwareProfile" || Object.keys(profile).join() !== "vmSize" || profile.vmSize !== inputs.requested_vm_size) throw new Error("VM update changes fields outside the requested size.");
          } else if (capability.action_type === "increase_os_disk") {
            const storage = obj(properties.storageProfile), disk = obj(storage.osDisk);
            if (Object.keys(body).join() !== "properties" || Object.keys(properties).join() !== "storageProfile" || Object.keys(storage).join() !== "osDisk" || Object.keys(disk).join() !== "diskSizeGB" || !Number.isSafeInteger(disk.diskSizeGB) || disk.diskSizeGB !== inputs.requested_os_disk_size_gb) throw new Error("VM update changes fields outside the requested OS disk capacity.");
          } else throw new Error("VM update action is not approved.");
        }
      } else if (resource.type === "azapi_resource" && capability.execution_mode === "azapi_resource") {
        if (["type", "parent_id", "name"].some(key => unknown[key])) throw new Error("Create target identity is unknown.");
        const type = str(after.type).split("@")[0];
        if (!["Microsoft.Compute/virtualMachines", "Microsoft.Network/networkInterfaces"].includes(type)) throw new Error("Unexpected created resource type.");
        id = armIdentity(`${str(after.parent_id)}/providers/${type}/${str(after.name)}`).id;
        if (!operations.includes("create") || change.before !== null || hasUnknown(unknown.body) || hasUnknown(unknown.sensitive_body) || !emptyObject(after.sensitive_body)) throw new Error("Only fully specified new VM/NIC creation is allowed.");
        // A VM create also creates its NIC, which no requester declares as a
        // target. Record it separately so the boundary check below can allow it
        // inside the authorized resource group instead of calling it unexpected.
        if (type.toLowerCase() === NIC) createdNics.add(id);
        // WARNING -- DELIBERATELY UNGUARDED, AUTHORIZED 2026-09-07.
        // Creation execution was enabled by explicit owner decision before the
        // creation-body policy existed. What is checked above: resource type is
        // VM or NIC, identity is known at plan time, the operation is a pure
        // create, and no unknown or sensitive body. What is NOT checked, and
        // what an AI-drafted module could therefore specify freely:
        //   * image reference, OS/data disk sizes, VM SKU
        //   * subnet placement -- scope.allowedSubnetIds is NOT enforced here
        //   * public IP attachment
        //   * custom script or any other VM extension
        //   * admin credentials carried in the plain body
        //   * subscription quota, SKU availability or region capacity
        // Compare azapi_update above, which pins the body to exactly
        // properties.hardwareProfile.vmSize. Creation has no equivalent.
        // Restore the gate by re-throwing here; close the gaps by validating
        // `after.body` against a per-capability creation policy.
      } else throw new Error("Unapproved resource implementation.");
      if (seen.has(id)) throw new Error("Multiple Terraform resources target the same Azure resource.");
      seen.add(id);
    } catch (cause) { violations.push(cause instanceof Error ? cause.message : "Invalid resource evidence."); }
  }
  // A resource is unexpected unless it is a declared target, or a NIC this plan
  // creates inside the same resource group as the declared targets. The second
  // clause is the narrowest relaxation that lets VM creation plan at all; it
  // still blocks a NIC created anywhere outside the authorized group, and every
  // non-NIC resource is judged exactly as before.
  const affected = [...seen];
  const unexpected = affected.filter(id => !expected.has(id)
    && !(createdNics.has(id) && targetGroups.has(armIdentity(id).resourceGroupId)));
  const missingFromPlan = [...expected].filter(id => !seen.has(id));
  if (plan.errored === true || plan.complete === false || arr(plan.deferred_changes).length) violations.push("Plan is incomplete, deferred or errored.");
  return { destroy, replace, affected, actions, unexpected, missingFromPlan, violations, matched: (allowDestroy || (!destroy && !replace)) && !unexpected.length && !missingFromPlan.length && !violations.length };
}
