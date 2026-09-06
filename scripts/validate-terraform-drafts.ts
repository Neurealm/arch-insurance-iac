import { CREATE_VM_VARIABLES, CREATE_VM_INPUT_SCHEMA, validateGeneratedDraftFiles } from "../supabase/functions/_shared/terraform-draft-policy.ts";

// All additional modules must pass the create-VM draft boundary. Existing
// human-authored operational modules retain their current Terraform checks.
// Adding another module family requires an explicit, reviewed policy change.
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
  errors.push(...validateGeneratedDraftFiles({
    moduleName: entry.name, displayName: entry.name, rationale: "CI source validation",
    variables: CREATE_VM_VARIABLES, inputSchema: CREATE_VM_INPUT_SCHEMA,
    moduleMainTf: "", moduleVariablesTf: "", moduleOutputsTf: "",
  }, files));
  checked++;
}
if (errors.length) { console.error(errors.join("\n")); Deno.exit(1); }
console.log(`Draft HCL policy passed (${checked} module(s)); no cloud access, init, plan or apply.`);
