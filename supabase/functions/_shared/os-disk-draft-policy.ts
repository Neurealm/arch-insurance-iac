import {
  array, inspectExpressions, keysOnly, literalExpression, obj, parseDraftHcl, text,
  validateGeneratedDraftArchive, type DraftResult, type DraftVariable,
} from "./terraform-draft-policy.ts";

type Json = Record<string, unknown>;

const INPUTS = [
  ["target_resource_id", "string", "string", "target"],
  ["requested_os_disk_size_gb", "number", "integer", "parameters.requestedOsDiskSizeGB"],
  ["change_request_id", "string", "string", "package_number_or_ticket"],
] as const;

export const OS_DISK_VARIABLES: DraftVariable[] = INPUTS.map(([name, terraformType]) => ({
  name, type: terraformType, description: `Governed OS-disk expansion input: ${name}.`,
}));
export const OS_DISK_INPUT_SCHEMA: Json = {
  fields: INPUTS.map(([key, , schemaType, source]) => ({
    key, type: schemaType, source, required: true,
    ...(key === "change_request_id" ? { minLength: 6 } : {}),
    ...(key === "target_resource_id" ? { pattern: "^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\\\.Compute/virtualMachines/[^/]+$" } : {}),
    ...(key === "requested_os_disk_size_gb" ? { minimum: 64, maximum: 4095 } : {}),
  })),
};

const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const IDENTIFIER = /^[a-z][a-z0-9_]*$/;
const RESOURCE_TYPE = "Microsoft.Compute/virtualMachines@2024-07-01";

/**
 * Structural, parsed-HCL validation for the OS-disk expansion draft -- the
 * same category of rigor terraform-draft-policy.ts's validateDraft uses for
 * create_vm (parse, then walk the tree), rather than the previous approach
 * of a regex blocklist plus matching against raw, unparsed source text.
 * That text-matching approach could in principle be fooled by a match
 * appearing inside a comment or unrelated string, and its forbidden-content
 * checks (a hand-maintained regex) could drift out of sync with the
 * create-VM path's tested function allowlist. This reuses inspectExpressions
 * (the same credential/function/variable-reference walk create_vm uses,
 * parameterized here with OS_DISK_VARIABLES) for that part, and adds
 * structural checks for this module's specific shape.
 */
export function validateOsDiskDraft(draft: DraftResult): string[] {
  const problems: string[] = [];
  if (draft.moduleName !== "vm-os-disk-expand") problems.push("moduleName must be vm-os-disk-expand.");
  const names = new Set<string>();
  for (const variable of draft.variables) {
    const expected = OS_DISK_VARIABLES.find((v) => v.name === variable.name);
    if (!IDENTIFIER.test(variable.name) || !expected || variable.type !== expected.type || names.has(variable.name)) problems.push(`Unsafe, duplicate or unexpected variable metadata: ${variable.name}.`);
    if (/\$\{|%\{/.test(variable.description)) problems.push(`Variable ${variable.name}: interpolated descriptions are forbidden.`);
    names.add(variable.name);
  }
  if (names.size !== OS_DISK_VARIABLES.length || OS_DISK_VARIABLES.some((v) => !names.has(v.name))) problems.push("Variable metadata must match the complete OS-disk interface.");
  if (!same(draft.inputSchema, OS_DISK_INPUT_SCHEMA)) problems.push("inputSchema must match the governed OS-disk interface.");

  const parsed: Record<string, Json> = {};
  for (const [label, content] of Object.entries({ main: draft.moduleMainTf, variables: draft.moduleVariablesTf, outputs: draft.moduleOutputsTf })) {
    try { parsed[label] = parseDraftHcl(content, label); inspectExpressions(parsed[label], label, problems, OS_DISK_VARIABLES); }
    catch (error) { problems.push(error instanceof Error ? error.message : "HCL parse failed."); }
  }
  if (Object.keys(parsed).length !== 3) return [...new Set(problems)];

  keysOnly(parsed.main, ["resource"], "main.tf", problems);
  keysOnly(parsed.variables, ["variable"], "variables.tf", problems);
  keysOnly(parsed.outputs, ["output"], "outputs.tf", problems);

  const declared = obj(parsed.variables.variable);
  if (Object.keys(declared).length !== OS_DISK_VARIABLES.length) problems.push("variables.tf must declare precisely the canonical inputs.");
  for (const expected of OS_DISK_VARIABLES) {
    const blocks = array(declared[expected.name]);
    const variable = obj(blocks[0]);
    if (blocks.length !== 1 || literalExpression(variable.type) !== `\${${expected.type}}`) problems.push(`variables.tf: ${expected.name} has a missing/duplicate declaration or incorrect type.`);
    keysOnly(variable, ["type", "description", "validation", "sensitive", "nullable"], `variable.${expected.name}`, problems);
    if ("default" in variable) problems.push(`variable.${expected.name}: defaults are forbidden.`);
    const validations = array(variable.validation).map(obj);
    if (!validations.length) { problems.push(`variable.${expected.name}: validation is required.`); continue; }
    for (const validation of validations) keysOnly(validation, ["condition", "error_message"], `variable.${expected.name}.validation`, problems);
    const conditions = validations.map((v) => literalExpression(v.condition));
    if (expected.name === "change_request_id" && !conditions.includes("${length(trimspace(var.change_request_id))>=6}")) {
      problems.push("variable.change_request_id: missing exact length validation.");
    }
    if (expected.name === "requested_os_disk_size_gb" && !conditions.some((c) => c.includes("var.requested_os_disk_size_gb>=64") && c.includes("var.requested_os_disk_size_gb<=4095"))) {
      problems.push("variable.requested_os_disk_size_gb: must validate the 64-4095 GB bound against this variable.");
    }
    if (expected.name === "target_resource_id" && !conditions.some((c) => c.includes("regex(") && c.includes("var.target_resource_id"))) {
      problems.push("variable.target_resource_id: an exact VM ARM ID regex validation is required.");
    }
  }

  const types = obj(parsed.main.resource);
  keysOnly(types, ["azapi_update_resource"], "resource", problems);
  const resources = obj(types.azapi_update_resource);
  if (Object.keys(resources).length !== 1) problems.push("Exactly one azapi_update_resource block is required.");
  for (const [name, blocks] of Object.entries(resources)) {
    const resource = obj(array(blocks)[0]);
    if (!IDENTIFIER.test(name) || array(blocks).length !== 1) problems.push(`resource.${name}: invalid or duplicate resource label.`);
    keysOnly(resource, ["type", "resource_id", "body", "lifecycle"], `resource.${name}`, problems);
    if (text(resource.type) !== RESOURCE_TYPE) problems.push(`resource.${name}: unsupported or missing Azure resource type.`);
    if (literalExpression(resource.resource_id) !== "${var.target_resource_id}") problems.push(`resource.${name}: resource_id must be the declared approved VM target.`);
    if (!("body" in resource)) { problems.push(`resource.${name}: Azure body is required.`); continue; }
    const body = obj(resource.body);
    keysOnly(body, ["properties"], `resource.${name}.body`, problems);
    const properties = obj(body.properties);
    keysOnly(properties, ["storageProfile"], `resource.${name}.body.properties`, problems);
    const storageProfile = obj(properties.storageProfile);
    keysOnly(storageProfile, ["osDisk"], `resource.${name}.body.properties.storageProfile`, problems);
    const osDisk = obj(storageProfile.osDisk);
    keysOnly(osDisk, ["diskSizeGB"], `resource.${name}.body.properties.storageProfile.osDisk`, problems);
    if (literalExpression(osDisk.diskSizeGB) !== "${var.requested_os_disk_size_gb}") problems.push(`resource.${name}: diskSizeGB must be set exactly to var.requested_os_disk_size_gb.`);
    // Lifecycle execution hooks, ignore_changes and replacement triggers are
    // not draftable; only the correlation precondition is.
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
  if (!Object.keys(outputs).length) problems.push("outputs.tf must expose the updated VM identifier or disk size.");
  for (const [name, blocks] of Object.entries(outputs)) {
    if (!IDENTIFIER.test(name) || array(blocks).length !== 1) problems.push(`output.${name}: invalid/duplicate output.`);
    keysOnly(obj(array(blocks)[0]), ["value", "description", "sensitive"], `output.${name}`, problems);
  }
  return [...new Set(problems)];
}

export function validateOsDiskGeneratedFiles(draft: DraftResult, files: Array<{ path: string; content: string }>): string[] {
  return validateGeneratedDraftArchive(draft, files, OS_DISK_VARIABLES, validateOsDiskDraft);
}
