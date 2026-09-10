import { CREATE_VM_VARIABLES, CREATE_VM_INPUT_SCHEMA, validateGeneratedDraftFiles } from "../supabase/functions/_shared/terraform-draft-policy.ts";
import { OS_DISK_INPUT_SCHEMA, OS_DISK_VARIABLES, validateOsDiskGeneratedFiles } from "../supabase/functions/_shared/os-disk-draft-policy.ts";

// The OS-disk family has its own policy; every other additional AI-draft module
// must pass the create-VM policy. Existing human-authored operational modules
// retain their current Terraform checks.
const existingModules = new Set(["vm-action", "vm-resize"]);
const errors: string[] = [];
let checked = 0;
for await (const entry of Deno.readDir("terraform/modules")) {
  if (!entry.isDirectory || existingModules.has(entry.name)) continue;
  const modulePath = `terraform/modules/${entry.name}`;
  const rootPath = `terraform/environments/pilot/${entry.name}`;
  const files: Array<{path: string; content: string}> = [];
  for (const path of [modulePath, rootPath]) {
    try {
      for await (const file of Deno.readDir(path)) {
        if (file.name.startsWith(".terraform") || file.name.endsWith(".md")) continue;
        if (!file.isFile || !file.name.endsWith(".tf")) { errors.push(`${path}/${file.name}: unsupported draft artifact.`); continue; }
        files.push({path: `${path}/${file.name}`, content: await Deno.readTextFile(`${path}/${file.name}`)});
      }
    } catch { errors.push(`${path}: module and matching root must both exist.`); }
  }
  const osDisk = entry.name === "vm-os-disk-expand";
  const variables = osDisk ? OS_DISK_VARIABLES : CREATE_VM_VARIABLES;
  const inputSchema = osDisk ? OS_DISK_INPUT_SCHEMA : CREATE_VM_INPUT_SCHEMA;
  const draft = {
    moduleName: entry.name, displayName: entry.name, rationale: "CI source validation",
    variables, inputSchema, moduleMainTf: "", moduleVariablesTf: "", moduleOutputsTf: "",
  };
  errors.push(...(osDisk ? validateOsDiskGeneratedFiles(draft, files) : validateGeneratedDraftFiles(draft, files)));
  checked++;
}
if (errors.length) { console.error(errors.join("\n")); Deno.exit(1); }
console.log(`Draft HCL policy passed (${checked} module(s)); no cloud access, init, plan or apply.`);
