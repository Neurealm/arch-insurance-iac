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
  allowedSubnetIds: string[]; applyEnabled: boolean; provisioningEnabled: boolean;
};

/** Server-only configuration; never fall back to caller tags or a global shared workspace. */
export function resolveExecutionScope(raw: string | undefined, pkg: Json, capability: Json, targets: string[]): ExecutionScope {
  let values: unknown;
  try { values = JSON.parse(raw ?? "[]"); } catch { throw new Error("Trusted Terraform scope configuration is invalid."); }
  const exactTargets = targets.map(id => armIdentity(id).id);
  if (!exactTargets.length || new Set(exactTargets).size !== exactTargets.length) throw new Error("Target set is empty or duplicated.");
  const candidates = arr(values).map(obj).filter(scope => scope.moduleSource === capability.module_source && sameSet(arr(scope.targetResourceIds).map(id => armIdentity(id).id), exactTargets));
  if (candidates.length !== 1) throw new Error("Exactly one reviewed workspace/target scope binding is required. Configure HCP_TERRAFORM_SCOPE_BINDINGS on the server.");
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
  if (capability.execution_mode === "azapi_resource" && (!capability.approved_source_revision || !capability.approval_gap_id || scope.provisioningEnabled !== true)) throw new Error("Provisioning requires a promoted capability and an explicitly verified creation scope.");
  return { environment, workspaceId: str(scope.workspaceId), workspaceName: str(scope.workspaceName), moduleSource: str(scope.moduleSource), sourceRevision,
    targetResourceIds: exactTargets, managedResourceIds: managed, resourceGroupId: group, allowedRegions, allowedVmSizes: sizes,
    allowedSubnetIds: arr(scope.allowedSubnetIds).map(value => str(value).toLowerCase()), applyEnabled: scope.applyEnabled === true, provisioningEnabled: scope.provisioningEnabled === true };
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
    inputs[key] = value;
  }
  return inputs;
}

/** Analyze actual resource changes, not arbitrary nested resource_id values. */
export function assessPlan(plan: Json, targets: string[], inputs: Json, capability: Json) {
  const expected = new Set(targets.map(value => armIdentity(value).id));
  const seen = new Set<string>(), violations: string[] = [], actions: Json = {};
  let destroy = false, replace = false;
  const changes = arr(plan.resource_changes).map(obj);
  if (!changes.length) violations.push("Plan contains no managed-resource evidence.");
  for (const resource of changes) {
    const change = obj(resource.change), after = obj(change.after), unknown = obj(change.after_unknown);
    const operations = arr(change.actions).map(str);
    for (const op of operations) actions[op] = Number(actions[op] ?? 0) + 1;
    if (operations.includes("delete")) destroy = true;
    if (operations.includes("delete") && operations.includes("create")) replace = true;
    if (resource.mode !== "managed" || str(resource.provider_name).toLowerCase() !== "registry.terraform.io/azure/azapi") { violations.push("Unexpected resource mode or provider."); continue; }
    if (!operations.length || operations.some(op => !["create", "update", "no-op"].includes(op))) violations.push("Destroy, replace or unsupported resource operation is prohibited.");
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
          const body = obj(after.body), properties = obj(body.properties), profile = obj(properties.hardwareProfile);
          if (Object.keys(body).join() !== "properties" || Object.keys(properties).join() !== "hardwareProfile" || Object.keys(profile).join() !== "vmSize" || profile.vmSize !== inputs.requested_vm_size) throw new Error("VM update changes fields outside the requested size.");
        }
      } else if (resource.type === "azapi_resource" && capability.execution_mode === "azapi_resource") {
        if (["type", "parent_id", "name"].some(key => unknown[key])) throw new Error("Create target identity is unknown.");
        const type = str(after.type).split("@")[0];
        if (!["Microsoft.Compute/virtualMachines", "Microsoft.Network/networkInterfaces"].includes(type)) throw new Error("Unexpected created resource type.");
        id = armIdentity(`${str(after.parent_id)}/providers/${type}/${str(after.name)}`).id;
        if (!operations.includes("create") || change.before !== null || hasUnknown(unknown.body) || hasUnknown(unknown.sensitive_body) || !emptyObject(after.sensitive_body)) throw new Error("Only fully specified new VM/NIC creation is allowed.");
        // Until the full creation-body policy and end-to-end validation have
        // been qualified, promotion does not automatically authorize creation.
        throw new Error("VM provisioning execution is not yet qualified for production. Keep this capability in engineering review.");
      } else throw new Error("Unapproved resource implementation.");
      if (seen.has(id)) throw new Error("Multiple Terraform resources target the same Azure resource.");
      seen.add(id);
    } catch (cause) { violations.push(cause instanceof Error ? cause.message : "Invalid resource evidence."); }
  }
  const affected = [...seen], unexpected = affected.filter(id => !expected.has(id)), missingFromPlan = [...expected].filter(id => !seen.has(id));
  if (plan.errored === true || plan.complete === false || arr(plan.deferred_changes).length) violations.push("Plan is incomplete, deferred or errored.");
  return { destroy, replace, affected, actions, unexpected, missingFromPlan, violations, matched: !destroy && !replace && !unexpected.length && !missingFromPlan.length && !violations.length };
}
