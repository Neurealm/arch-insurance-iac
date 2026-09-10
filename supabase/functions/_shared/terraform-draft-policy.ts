import hcl from "npm:hcl2-parser@1.0.3";

// hcl2-parser compiles HashiCorp's HCL v2 parser to JavaScript. Parsing does
// not evaluate expressions, initialize providers, read Azure or run Terraform.
// This deliberately restrictive *draft* policy is not an approval or a plan
// safety proof. Terraform validate, saved-plan checks and human review remain.
type Json = Record<string, unknown>;
export type DraftVariable = { name: string; type: string; description: string };
export type DraftResult = {
  moduleName: string; displayName: string; rationale: string;
  variables: DraftVariable[]; moduleMainTf: string;
  moduleVariablesTf: string; moduleOutputsTf: string; inputSchema: Json;
};
const obj = (v: unknown): Json => v && typeof v === "object" && !Array.isArray(v) ? v as Json : {};
const array = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const text = (v: unknown): string => typeof v === "string" ? v : "";
const IDENTIFIER = /^[a-z][a-z0-9_]*$/;
const RESOURCE_TYPES = new Set([
  "Microsoft.Compute/virtualMachines@2024-07-01",
  "Microsoft.Network/networkInterfaces@2023-11-01",
]);

const INPUTS = [
  ["target_resource_group_id", "string", "resourceGroupArmId"],
  ["subnet_id", "string", "subnetArmId"],
  ["location", "string", "location"],
  ["vm_names", "list(string)", "vmNames"],
  ["vm_size", "string", "vmSize"],
  ["admin_username", "string", "adminUsername"],
  ["ssh_public_key", "string", "sshPublicKey"],
  ["os_publisher", "string", "osPublisher"],
  ["os_offer", "string", "osOffer"],
  ["os_sku", "string", "osSku"],
  ["os_version", "string", "osVersion"],
  ["change_request_id", "string", null],
  ["tags", "map(string)", "tags"],
] as const;
export const CREATE_VM_VARIABLES: DraftVariable[] = INPUTS.map(([name, type]) => ({ name, type, description: `Governed create-VM input: ${name}.` }));
export const CREATE_VM_INPUT_SCHEMA: Json = { fields: INPUTS.map(([key, type, parameter]) => ({
  key, type, source: parameter ? `parameters.${parameter}` : "package_number_or_ticket",
  required: key !== "tags", ...(key === "change_request_id" ? { minLength: 6 } : {}),
  ...(key === "vm_size" ? { pattern: "^Standard_[A-Za-z0-9_]+$" } : {}),
  ...(key === "vm_names" ? { minItems: 1, maxItems: 20 } : {}),
})) };

const FUNCTIONS = new Set([
  "alltrue", "anytrue", "can", "coalesce", "compact", "concat", "contains", "distinct",
  "endswith", "flatten", "format", "formatlist", "join", "jsonencode", "keys", "length",
  "list", "lookup", "lower", "map", "max", "merge", "min", "regex", "regexall", "replace",
  "slice", "sort", "split", "startswith", "substr", "title", "tobool", "tolist", "tomap",
  "tonumber", "toset", "tostring", "trim", "trimprefix", "trimspace", "trimsuffix", "try",
  "upper", "values", "zipmap",
]);

function keysOnly(value: Json, allowed: string[], label: string, problems: string[]) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) problems.push(`${label}: unsupported key/block ${key}.`);
}

/** Traverse the parsed tree, including expressions preserved by HCL2JSON.
 * Deliberately scan literal strings as well: false positives need a human
 * rewrite, never an unsafe expression bypass hidden in interpolation/heredoc.
 */
function inspectExpressions(value: unknown, label: string, problems: string[]) {
  if (Array.isArray(value)) { value.forEach((v, i) => inspectExpressions(v, `${label}[${i}]`, problems)); return; }
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if (/^(customData|userData|adminPassword|extensions|applicationProfile)$/i.test(key)) problems.push(`${label}.${key}: guest execution/credential payload is forbidden.`);
      inspectExpressions(v, `${label}.${key}`, problems);
    }
    return;
  }
  if (typeof value !== "string") return;
  if (value.includes("${") && /#|\/\//.test(value)) problems.push(`${label}: comments or URL literals inside expressions are outside the draft grammar.`);
  if (/\b(?:customData|userData|adminPassword|extensions|applicationProfile)\s*[=:]/i.test(value)) problems.push(`${label}: guest execution/credential payload is forbidden.`);
  // Provider-defined calls and traversal to credentials, local files or other
  // modules/data are never part of this finite draft interface.
  if (/::|\b(?:data|module|path|terraform|count)\s*\.|\b(?:tfc_azure_dynamic_credentials|ARM_CLIENT_SECRET|oidc_token_file_path|client_id_file_path)\b/.test(value)) {
    problems.push(`${label}: external, credential or provider-defined expression is forbidden.`);
  }
  for (const match of value.matchAll(/\b([A-Za-z_][A-Za-z0-9_-]*)\s*\(/g)) {
    if (!FUNCTIONS.has(match[1])) problems.push(`${label}: function ${match[1]} is not allowed.`);
  }
  for (const match of value.matchAll(/\bvar\.([A-Za-z_][A-Za-z0-9_]*)/g)) {
    if (!CREATE_VM_VARIABLES.some((v) => v.name === match[1])) problems.push(`${label}: undeclared or reserved variable ${match[1]}.`);
  }
}

export function parseDraftHcl(content: string, label: string): Json {
  if (!content || content.length > 20000) throw new Error(`${label}: empty or oversized HCL.`);
  // A finite draft grammar avoids normalization differences and executable
  // interpolation hidden inside heredocs, quoted identifiers or comments
  // between function names and parentheses. Rejected syntax can be rewritten.
  if (/<<-?\s*[A-Za-z_]|\/\*/.test(content)) throw new Error(`${label}: heredocs and block comments are outside the draft grammar.`);
  const parsed = hcl.parseToObject(content) as unknown;
  if (!Array.isArray(parsed) || parsed.length !== 2 || parsed[1] !== null || !parsed[0] || typeof parsed[0] !== "object") {
    throw new Error(`${label}: invalid HCL (parse failed).`);
  }
  return obj(parsed[0]);
}

function literalExpression(value: unknown): string { return text(value).replace(/\s+/g, ""); }

export function validateDraft(draft: DraftResult): string[] {
  const problems: string[] = [];
  if (!/^[a-z][a-z0-9-]{2,39}$/.test(draft.moduleName) || ["vm-action", "vm-resize", "resize-vm-managed-disk"].includes(draft.moduleName)) problems.push("moduleName is invalid or reserved.");
  const names = new Set<string>();
  for (const variable of draft.variables) {
    const expected = CREATE_VM_VARIABLES.find((v) => v.name === variable.name);
    if (!IDENTIFIER.test(variable.name) || !expected || variable.type !== expected.type || names.has(variable.name)) problems.push(`Unsafe, duplicate or unexpected variable metadata: ${variable.name}.`);
    if (/\$\{|%\{/.test(variable.description)) problems.push(`Variable ${variable.name}: interpolated descriptions are forbidden.`);
    names.add(variable.name);
  }
  if (names.size !== CREATE_VM_VARIABLES.length || CREATE_VM_VARIABLES.some((v) => !names.has(v.name))) problems.push("Variable metadata must match the complete create-VM interface.");
  const canonical = array(CREATE_VM_INPUT_SCHEMA.fields).map(obj);
  const fields = array(draft.inputSchema.fields).map(obj);
  if (Object.keys(draft.inputSchema).some((key) => key !== "fields") || fields.length !== canonical.length) problems.push("inputSchema must match the canonical create-VM schema.");
  const fieldKeys = new Set<string>();
  for (const field of fields) {
    const expected = canonical.find((f) => f.key === field.key);
    if (!expected || fieldKeys.has(text(field.key)) || Object.keys(field).some((key) => !(key in expected)) || Object.keys(expected ?? {}).some((key) => field[key] !== expected?.[key])) problems.push(`inputSchema field ${text(field.key)} does not match the canonical input binding.`);
    fieldKeys.add(text(field.key));
  }
  const parsed: Record<string, Json> = {};
  for (const [label, content] of Object.entries({ main: draft.moduleMainTf, variables: draft.moduleVariablesTf, outputs: draft.moduleOutputsTf })) {
    try { parsed[label] = parseDraftHcl(content, label); inspectExpressions(parsed[label], label, problems); }
    catch (error) { problems.push(error instanceof Error ? error.message : "HCL parse failed."); }
  }
  if (Object.keys(parsed).length !== 3) return problems;
  keysOnly(parsed.main, ["resource", "locals"], "main.tf", problems);
  keysOnly(parsed.variables, ["variable"], "variables.tf", problems);
  keysOnly(parsed.outputs, ["output"], "outputs.tf", problems);
  const declared = obj(parsed.variables.variable);
  if (Object.keys(declared).length !== CREATE_VM_VARIABLES.length) problems.push("variables.tf must declare precisely the canonical inputs.");
  for (const expected of CREATE_VM_VARIABLES) {
    const blocks = array(declared[expected.name]);
    const variable = obj(blocks[0]);
    if (blocks.length !== 1 || literalExpression(variable.type) !== `\${${expected.type}}`) problems.push(`variables.tf: ${expected.name} has a missing/duplicate declaration or incorrect type.`);
    keysOnly(variable, ["type", "description", "validation", "default", "sensitive", "nullable"], `variable.${expected.name}`, problems);
    if ("default" in variable && (expected.name !== "tags" || JSON.stringify(variable.default) !== "{}")) problems.push(`variable.${expected.name}: defaults are forbidden except tags = {}.`);
    if (["vm_names", "vm_size", "change_request_id"].includes(expected.name) && !array(variable.validation).length) problems.push(`variable.${expected.name}: validation is required.`);
    for (const validation of array(variable.validation)) keysOnly(obj(validation), ["condition", "error_message"], `variable.${expected.name}.validation`, problems);
  }
  const types = obj(parsed.main.resource);
  keysOnly(types, ["azapi_resource"], "resource", problems);
  const resources = obj(types.azapi_resource);
  const seenTypes = new Set<string>();
  if (Object.keys(resources).length !== 2) problems.push("Exactly one VM and one NIC resource declaration are required.");
  for (const [name, blocks] of Object.entries(resources)) {
    const resource = obj(array(blocks)[0]);
    if (!IDENTIFIER.test(name) || array(blocks).length !== 1) problems.push(`resource.${name}: invalid or duplicate resource label.`);
    keysOnly(resource, ["type", "name", "parent_id", "location", "for_each", "body", "tags", "lifecycle", "response_export_values", "schema_validation_enabled"], `resource.${name}`, problems);
    if (!RESOURCE_TYPES.has(text(resource.type)) || seenTypes.has(text(resource.type))) problems.push(`resource.${name}: unsupported, dynamic or duplicate Azure resource type.`);
    seenTypes.add(text(resource.type));
    if (literalExpression(resource.parent_id) !== "${var.target_resource_group_id}") problems.push(`resource.${name}: parent_id must be the declared destination resource group.`);
    if (literalExpression(resource.for_each) !== "${toset(var.vm_names)}") problems.push(`resource.${name}: for_each must be toset(var.vm_names).`);
    if (literalExpression(resource.location) !== "${var.location}") problems.push(`resource.${name}: location must come from var.location.`);
    if (!text(resource.name).includes("${each.key}")) problems.push(`resource.${name}: name must derive from each.key.`);
    if (!("body" in resource)) problems.push(`resource.${name}: Azure body is required.`);
    // Lifecycle execution hooks, ignore_changes, replacement triggers and
    // provisioners are not draftable; only the correlation precondition is.
    const lifecycles = array(resource.lifecycle);
    if (lifecycles.length !== 1) problems.push(`resource.${name}: a correlation lifecycle precondition is required.`);
    for (const lifecycle of lifecycles) {
      keysOnly(obj(lifecycle), ["precondition"], `resource.${name}.lifecycle`, problems);
      const conditions = array(obj(lifecycle).precondition).map(obj);
      if (!conditions.some((p) => literalExpression(p.condition) === "${length(trimspace(var.change_request_id))>=6}")) problems.push(`resource.${name}: missing exact change_request_id precondition.`);
      for (const p of conditions) keysOnly(p, ["condition", "error_message"], `resource.${name}.precondition`, problems);
    }
  }
  const outputs = obj(parsed.outputs.output);
  if (!Object.keys(outputs).length) problems.push("outputs.tf must export VM resource IDs.");
  for (const [name, blocks] of Object.entries(outputs)) {
    if (!IDENTIFIER.test(name) || array(blocks).length !== 1) problems.push(`output.${name}: invalid/duplicate output.`);
    keysOnly(obj(array(blocks)[0]), ["value", "description", "sensitive"], `output.${name}`, problems);
  }
  return [...new Set(problems)];
}

/** Parse and check the entire seven-file archive, including trusted root
 * wiring. This is also invoked by CI against files actually checked out.
 */
export function validateGeneratedDraftArchive(
  draft: DraftResult,
  files: Array<{ path: string; content: string }>,
  interfaceVariables: DraftVariable[],
  validateModule: (candidate: DraftResult) => string[],
): string[] {
  const problems: string[] = [];
  const modulePath = `terraform/modules/${draft.moduleName}`;
  const rootPath = `terraform/environments/pilot/${draft.moduleName}`;
  const expected = [`${modulePath}/main.tf`, `${modulePath}/variables.tf`, `${modulePath}/outputs.tf`, `${modulePath}/versions.tf`, `${rootPath}/main.tf`, `${rootPath}/variables.tf`, `${rootPath}/versions.tf`];
  const actual = new Map<string, string>();
  for (const file of files) {
    if (!expected.includes(file.path) || actual.has(file.path)) problems.push(`Unexpected/duplicate generated file: ${file.path}.`);
    actual.set(file.path, file.content);
  }
  if (expected.some((path) => !actual.has(path))) problems.push("Generated archive is incomplete.");
  if (problems.length) return problems;
  problems.push(...validateModule({ ...draft, moduleMainTf: actual.get(`${modulePath}/main.tf`)!, moduleVariablesTf: actual.get(`${modulePath}/variables.tf`)!, moduleOutputsTf: actual.get(`${modulePath}/outputs.tf`)! }));
  const parse = (path: string) => parseDraftHcl(actual.get(path)!, path);
  try {
    for (const path of [`${modulePath}/versions.tf`, `${rootPath}/versions.tf`]) {
      const parsed = parse(path);
      keysOnly(parsed, ["terraform"], path, problems);
      const blocks = array(parsed.terraform);
      if (blocks.length !== 1) problems.push(`${path}: exactly one terraform block is required.`);
      const config = obj(blocks[0]);
      keysOnly(config, ["required_version", "required_providers"], path, problems);
      if (config.required_version !== ">= 1.9.0, < 2.0.0") problems.push(`${path}: unsupported Terraform version constraint.`);
      const providers = array(config.required_providers);
      if (providers.length !== 1) problems.push(`${path}: exactly one required_providers block is required.`);
      keysOnly(obj(providers[0]), ["azapi"], path, problems);
      const azapi = obj(obj(providers[0]).azapi);
      if (JSON.stringify(Object.keys(azapi).sort()) !== '["source","version"]' || azapi.source !== "Azure/azapi" || azapi.version !== "~> 2.0") problems.push(`${path}: only the pinned Azure/azapi provider is permitted.`);
    }
    const root = parse(`${rootPath}/main.tf`);
    keysOnly(root, ["provider", "module"], "root.main", problems);
    const providers = obj(root.provider);
    keysOnly(providers, ["azapi"], "root.provider", problems);
    if (array(providers.azapi).length !== 1) problems.push("root.provider: exactly one azapi configuration is required.");
    const provider = obj(array(providers.azapi)[0]);
    keysOnly(provider, ["use_cli", "use_oidc", "client_id_file_path", "oidc_token_file_path"], "root.provider.azapi", problems);
    if (provider.use_cli !== false || provider.use_oidc !== true || provider.client_id_file_path !== "${var.tfc_azure_dynamic_credentials.default.client_id_file_path}" || provider.oidc_token_file_path !== "${var.tfc_azure_dynamic_credentials.default.oidc_token_file_path}") problems.push("Root Azure authentication must use only HCP dynamic credential files.");
    const modules = obj(root.module);
    const moduleName = draft.moduleName.replace(/-/g, "_");
    keysOnly(modules, [moduleName], "root.module", problems);
    if (array(modules[moduleName]).length !== 1) problems.push("root.module: exactly one local module is required.");
    const module = obj(array(modules[moduleName])[0]);
    keysOnly(module, ["source", ...interfaceVariables.map((v) => v.name)], "root.module", problems);
    if (module.source !== `../../../modules/${draft.moduleName}`) problems.push("Root module source must be its matching local module, never a remote source.");
    for (const v of interfaceVariables) if (module[v.name] !== `\${var.${v.name}}`) problems.push(`Root input ${v.name} must wire directly to its matching variable.`);
    const rootVars = parse(`${rootPath}/variables.tf`);
    keysOnly(rootVars, ["variable"], "root.variables", problems);
    const variables = obj(rootVars.variable);
    keysOnly(variables, [...interfaceVariables.map((v) => v.name), "tfc_azure_dynamic_credentials"], "root.variables", problems);
    for (const v of interfaceVariables) {
      const blocks = array(variables[v.name]);
      const variable = obj(blocks[0]);
      if (blocks.length !== 1 || literalExpression(variable.type) !== `\${${v.type}}`) problems.push(`Root variable ${v.name}: unexpected type/declaration.`);
      keysOnly(variable, ["type", "description", ...(v.name === "tags" ? ["default"] : [])], `root.variable.${v.name}`, problems);
      if (/\$\{|%\{/.test(text(variable.description))) problems.push(`Root variable ${v.name}: interpolated description is forbidden.`);
      if (v.name === "tags" && JSON.stringify(variable.default) !== "{}") problems.push("Root tags must default to an empty map.");
    }
    const dynamic = array(variables.tfc_azure_dynamic_credentials);
    const credential = obj(dynamic[0]);
    keysOnly(credential, ["type", "description"], "root.dynamic_credentials", problems);
    const credentialType = "${object({default=object({client_id_file_path=stringoidc_token_file_path=string})aliases=map(object({client_id_file_path=stringoidc_token_file_path=string}))})}";
    if (dynamic.length !== 1 || literalExpression(credential.type) !== credentialType || /\$\{|%\{/.test(text(credential.description))) problems.push("Unexpected HCP dynamic credential variable declaration.");
  } catch (error) { problems.push(error instanceof Error ? error.message : "Generated HCL parse failed."); }
  return [...new Set(problems)];
}

export function validateGeneratedDraftFiles(draft: DraftResult, files: Array<{ path: string; content: string }>): string[] {
  return validateGeneratedDraftArchive(draft, files, CREATE_VM_VARIABLES, validateDraft);
}
