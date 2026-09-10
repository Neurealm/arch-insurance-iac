import { OS_DISK_VARIABLES } from "../_shared/os-disk-draft-policy.ts";
import { formatGeneratedHclAssignments, moduleVersionsTf, templateRootFiles } from "../_shared/terraform-draft-template.ts";
import { failedJobIds, governedModule, parseRepairResponse, redactCiLog, validateRepairArchive, validateRepairProposal, type RepairGap, type RepairProposal } from "./policy.ts";

function assert(ok: unknown, message: string) { if (!ok) throw new Error(message); }
const gap: RepairGap = {
  id: "10000000-0000-0000-0000-000000000001",
  provider: "azure", resource_type: "Microsoft.Compute/virtualMachines", action_type: "increase_os_disk",
  module_source: "terraform/modules/vm-os-disk-expand", draft_branch: "ai-draft/vm-os-disk-expand-10000000",
  draft_pr_number: 16, ci_head_sha: "a".repeat(40), ci_evidence: {},
};
const proposal: RepairProposal = {
  summary: "Correct the disk update module while preserving its governed interface.",
  mainTf: `resource "azapi_update_resource" "os_disk" {
  type        = "Microsoft.Compute/virtualMachines@2024-07-01"
  resource_id = var.target_resource_id
  body = {
    properties = {
      storageProfile = {
        osDisk = {
          diskSizeGB = var.requested_os_disk_size_gb
        }
      }
    }
  }
  lifecycle {
    precondition {
      condition     = length(trimspace(var.change_request_id)) >= 6
      error_message = "A valid change request is required."
    }
  }
}`,
  variablesTf: `variable "target_resource_id" {
  type = string
  validation {
    condition     = can(regex("^/subscriptions/[0-9a-fA-F-]{36}/resourceGroups/[^/]+/providers/Microsoft\\\\.Compute/virtualMachines/[^/]+$", var.target_resource_id))
    error_message = "An exact Azure VM resource ID is required."
  }
}
variable "requested_os_disk_size_gb" {
  type = number
  validation {
    condition     = var.requested_os_disk_size_gb >= 64 && var.requested_os_disk_size_gb <= 4095
    error_message = "The requested disk size must be from 64 through 4095 GB."
  }
}
variable "change_request_id" {
  type = string
  validation {
    condition     = length(trimspace(var.change_request_id)) >= 6
    error_message = "A valid change request is required."
  }
}`,
  outputsTf: `output "target_resource_id" {
  value = azapi_update_resource.os_disk.resource_id
}`,
};

Deno.test("accepts a bounded OS-disk repair proposal", () => {
  assert(validateRepairProposal(gap, proposal).length === 0, JSON.stringify(validateRepairProposal(gap, proposal)));
});

Deno.test("accepts the complete seven-file repair archive with trusted companion files", () => {
  const root = templateRootFiles("vm-os-disk-expand", OS_DISK_VARIABLES);
  const files = [
    { path: `${gap.module_source}/main.tf`, content: proposal.mainTf },
    { path: `${gap.module_source}/variables.tf`, content: proposal.variablesTf },
    { path: `${gap.module_source}/outputs.tf`, content: proposal.outputsTf },
    { path: `${gap.module_source}/versions.tf`, content: moduleVersionsTf() },
    { path: "terraform/environments/pilot/vm-os-disk-expand/main.tf", content: root.main },
    { path: "terraform/environments/pilot/vm-os-disk-expand/variables.tf", content: root.variablesTf },
    { path: "terraform/environments/pilot/vm-os-disk-expand/versions.tf", content: root.versions },
  ].map((file) => ({ ...file, content: formatGeneratedHclAssignments(file.content) }));
  const problems = validateRepairArchive(gap, proposal, files);
  assert(problems.length === 0, JSON.stringify(problems));
});

Deno.test("rejects repairs that add another Azure mutation", () => {
  const malicious = { ...proposal, mainTf: `${proposal.mainTf}\nresource "azapi_update_resource" "identity" { resource_id = var.target_resource_id body = { identity = {} } }` };
  assert(validateRepairProposal(gap, malicious).length > 0, "additional resource was accepted");
});

Deno.test("repair policy binds an exact gap, module and branch", () => {
  assert(governedModule(gap).moduleName === "vm-os-disk-expand", "correct module rejected");
  let rejected = false;
  try { governedModule({ ...gap, draft_branch: "feature/untrusted" }); } catch { rejected = true; }
  assert(rejected, "untrusted branch was accepted");
});

Deno.test("failure evidence selects only failed jobs and caps the list", () => {
  const ids = failedJobIds({ workflows: [{ jobs: [
    { id: 1, status: "completed", conclusion: "success" },
    { id: 2, status: "completed", conclusion: "failure" },
    { id: 3, status: "completed", conclusion: "cancelled" },
  ] }] });
  assert(JSON.stringify(ids) === "[2,3]", `unexpected job selection ${JSON.stringify(ids)}`);
});

Deno.test("CI log redaction removes common credential shapes", () => {
  const clean = redactCiLog("\u001b[31mAuthorization: Bearer ghp_abcdefghijklmnopqrstuvwxyz123456\u001b[0m\nOPENAI_API_KEY=sk-secretsecretsecretsecret");
  assert(!clean.includes("ghp_"), "GitHub token survived redaction");
  assert(!clean.includes("sk-secret"), "API key survived redaction");
  assert(!clean.includes("\u001b"), "ANSI escape survived redaction");
});

Deno.test("structured model output is parsed without accepting extra fields", () => {
  const parsed = parseRepairResponse({ output: [{ content: [{ type: "output_text", text: JSON.stringify(proposal) }] }] });
  assert(parsed.mainTf === proposal.mainTf, "structured response lost main.tf");
  let rejected = false;
  try { parseRepairResponse({ output_text: JSON.stringify({ ...proposal, workflow: "edit CI" }) }); } catch { rejected = true; }
  assert(rejected, "extra model fields were accepted");
});
