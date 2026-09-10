import { formatGeneratedHclAssignments, templateRootFiles } from "./terraform-draft-template.ts";
import { OS_DISK_VARIABLES } from "./os-disk-draft-policy.ts";

function assert(ok: unknown, message: string) { if (!ok) throw new Error(message); }

Deno.test("generated formatter separates multiline expressions from scalar alignment", () => {
  const formatted = formatGeneratedHclAssignments(`value = "x"\nlong_value = "y"\nnested    = {\n  short = 1\n}`);
  assert(formatted.includes('value      = "x"\nlong_value = "y"\nnested = {'), formatted);
});

Deno.test("trusted root template uses Terraform-compatible object type spacing", () => {
  const root = templateRootFiles("vm-os-disk-expand", OS_DISK_VARIABLES);
  assert(root.variablesTf.includes("  type = object({"), root.variablesTf);
  assert(!root.variablesTf.includes("  type        = object({"), root.variablesTf);
});
