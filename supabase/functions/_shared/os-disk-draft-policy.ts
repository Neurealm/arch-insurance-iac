import { parseDraftHcl, validateGeneratedDraftArchive, type DraftResult, type DraftVariable } from "./terraform-draft-policy.ts";

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
const forbidden = /\b(?:data|module|provider|terraform|provisioner|dynamic)\b|(?:local-exec|remote-exec|customData|userData|adminPassword|extensions|applicationProfile|ignore_changes|replace_triggered_by)\b|<<-?\s*[A-Za-z_]/i;
const object = (value: unknown): Json => value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
function onlyKeys(value: Json, allowed: string[], label: string, problems: string[]) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) problems.push(`${label}: unsupported key/block ${key}.`);
}

export function validateOsDiskDraft(draft: DraftResult): string[] {
  const problems: string[] = [];
  if (draft.moduleName !== "vm-os-disk-expand") problems.push("moduleName must be vm-os-disk-expand.");
  if (forbidden.test(`${draft.moduleMainTf}\n${draft.moduleVariablesTf}\n${draft.moduleOutputsTf}`)) problems.push("Draft contains a forbidden Terraform construct.");
  const metadata = new Map(draft.variables.map((variable) => [variable.name, variable.type]));
  if (metadata.size !== OS_DISK_VARIABLES.length || OS_DISK_VARIABLES.some((variable) => metadata.get(variable.name) !== variable.type)) problems.push("Variable metadata must match the governed OS-disk interface.");
  if (!same(draft.inputSchema, OS_DISK_INPUT_SCHEMA)) problems.push("inputSchema must match the governed OS-disk interface.");

  const parsed: Record<string, Json> = {};
  for (const [label, content] of Object.entries({ main: draft.moduleMainTf, variables: draft.moduleVariablesTf, outputs: draft.moduleOutputsTf })) {
    try { parsed[label] = parseDraftHcl(content, label); }
    catch (error) { problems.push(error instanceof Error ? error.message : "HCL parse failed."); }
  }
  if (Object.keys(parsed).length === 3) {
    onlyKeys(parsed.main, ["resource"], "main.tf", problems);
    onlyKeys(parsed.variables, ["variable"], "variables.tf", problems);
    onlyKeys(parsed.outputs, ["output"], "outputs.tf", problems);
    const resourceTypes = object(parsed.main.resource);
    onlyKeys(resourceTypes, ["azapi_update_resource"], "main.tf.resource", problems);
    const resources = object(resourceTypes.azapi_update_resource);
    if (Object.keys(resources).length !== 1 || array(resources[Object.keys(resources)[0]]).length !== 1) problems.push("Exactly one named azapi_update_resource block is required.");
    if (!Object.keys(object(parsed.outputs.output)).length) problems.push("outputs.tf must expose the updated VM identifier or disk size.");
  }

  const variables = draft.moduleVariablesTf;
  for (const variable of OS_DISK_VARIABLES) {
    const exact = new RegExp(`variable\\s+"${variable.name}"\\s*\\{[\\s\\S]*?type\\s*=\\s*${variable.type.replace(/[()]/g, "\\\\$&")}[\\s\\S]*?\\}`, "m");
    if (!exact.test(variables)) problems.push(`Missing or invalid variable declaration: ${variable.name}.`);
  }
  const declared = [...variables.matchAll(/variable\s+"([^"]+)"/g)].map((match) => match[1]);
  if (declared.length !== OS_DISK_VARIABLES.length || declared.some((name) => !metadata.has(name))) problems.push("variables.tf declares unexpected inputs.");
  if (!/requested_os_disk_size_gb[\s\S]*?(?:>=\s*64|>\s*63)[\s\S]*?(?:<=\s*4095|<\s*4096)/.test(variables)) problems.push("Disk size must be constrained to 64–4095 GB.");
  if (!/change_request_id[\s\S]*?length\s*\(\s*trimspace\s*\(\s*var\.change_request_id\s*\)\s*\)\s*>=\s*6/.test(variables)) problems.push("change_request_id validation is required.");

  const main = draft.moduleMainTf;
  if ((main.match(/resource\s+"azapi_update_resource"/g) ?? []).length !== 1) problems.push("Exactly one azapi_update_resource is required.");
  if (/\bresource\s+"(?!azapi_update_resource")/.test(main)) problems.push("Only azapi_update_resource is allowed.");
  if (!/type\s*=\s*"Microsoft\.Compute\/virtualMachines@2024-07-01"/.test(main)) problems.push("The module must update one Azure VM using the approved API version.");
  if (!/resource_id\s*=\s*var\.target_resource_id/.test(main)) problems.push("The exact approved VM target is required.");
  if (!/storageProfile\s*=\s*\{[\s\S]*?osDisk\s*=\s*\{[\s\S]*?diskSizeGB\s*=\s*var\.requested_os_disk_size_gb/.test(main)) problems.push("The update must set only the requested OS disk size.");
  if (/\b(?:hardwareProfile|networkProfile|securityProfile|identity|diagnosticsProfile)\b/.test(main)) problems.push("The OS-disk draft may not update other VM properties.");
  if (!/lifecycle\s*\{[\s\S]*?precondition\s*\{[\s\S]*?length\s*\(\s*trimspace\s*\(\s*var\.change_request_id\s*\)\s*\)\s*>=\s*6/.test(main)) problems.push("The exact change-request precondition is required.");
  return [...new Set(problems)];
}

export function validateOsDiskGeneratedFiles(draft: DraftResult, files: Array<{ path: string; content: string }>): string[] {
  return validateGeneratedDraftArchive(draft, files, OS_DISK_VARIABLES, validateOsDiskDraft);
}
