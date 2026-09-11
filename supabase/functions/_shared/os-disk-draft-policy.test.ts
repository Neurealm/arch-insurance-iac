import { OS_DISK_INPUT_SCHEMA, OS_DISK_VARIABLES, validateOsDiskDraft, validateOsDiskGeneratedFiles } from "./os-disk-draft-policy.ts";
import { templateRootFiles, moduleVersionsTf } from "./terraform-draft-template.ts";
import type { DraftResult } from "./terraform-draft-policy.ts";

function assert(ok: unknown, message: string) { if (!ok) throw new Error(message); }

const validMainTf = `resource "azapi_update_resource" "os_disk" {
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
}`;
const validVariablesTf = `variable "target_resource_id" {
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
}`;
const validOutputsTf = `output "target_resource_id" {
  value = azapi_update_resource.os_disk.resource_id
}`;

const validDraft: DraftResult = {
  moduleName: "vm-os-disk-expand",
  displayName: "Increase Azure VM OS disk capacity",
  rationale: "Updates only the OS disk size of an existing, approved VM.",
  variables: OS_DISK_VARIABLES,
  moduleMainTf: validMainTf,
  moduleVariablesTf: validVariablesTf,
  moduleOutputsTf: validOutputsTf,
  inputSchema: OS_DISK_INPUT_SCHEMA,
};

Deno.test("accepts a valid OS-disk draft", () => {
  assert(validateOsDiskDraft(validDraft).length === 0, JSON.stringify(validateOsDiskDraft(validDraft)));
});

Deno.test("accepts the complete seven-file generated archive", () => {
  const root = templateRootFiles(validDraft.moduleName, OS_DISK_VARIABLES);
  const files = [
    { path: `terraform/modules/${validDraft.moduleName}/main.tf`, content: validDraft.moduleMainTf },
    { path: `terraform/modules/${validDraft.moduleName}/variables.tf`, content: validDraft.moduleVariablesTf },
    { path: `terraform/modules/${validDraft.moduleName}/outputs.tf`, content: validDraft.moduleOutputsTf },
    { path: `terraform/modules/${validDraft.moduleName}/versions.tf`, content: moduleVersionsTf() },
    { path: `terraform/environments/pilot/${validDraft.moduleName}/main.tf`, content: root.main },
    { path: `terraform/environments/pilot/${validDraft.moduleName}/variables.tf`, content: root.variablesTf },
    { path: `terraform/environments/pilot/${validDraft.moduleName}/versions.tf`, content: root.versions },
  ];
  const problems = validateOsDiskGeneratedFiles(validDraft, files);
  assert(problems.length === 0, JSON.stringify(problems));
});

Deno.test("rejects a reserved/incorrect module name", () => {
  const draft = { ...validDraft, moduleName: "vm-batch-create" };
  assert(validateOsDiskDraft(draft).length > 0, "expected rejection");
});

Deno.test("rejects a second resource block", () => {
  const draft = { ...validDraft, moduleMainTf: `${validMainTf}\nresource "azapi_update_resource" "extra" {\n  type        = "Microsoft.Compute/virtualMachines@2024-07-01"\n  resource_id = var.target_resource_id\n  body = { properties = { storageProfile = { osDisk = { diskSizeGB = var.requested_os_disk_size_gb } } } }\n  lifecycle { precondition { condition = length(trimspace(var.change_request_id)) >= 6\n error_message = "x" } }\n}` };
  const problems = validateOsDiskDraft(draft);
  assert(problems.length > 0, "expected rejection");
});

Deno.test("rejects an unsupported Azure resource type", () => {
  const draft = { ...validDraft, moduleMainTf: validMainTf.replace("Microsoft.Compute/virtualMachines@2024-07-01", "Microsoft.Compute/disks@2024-07-01") };
  assert(validateOsDiskDraft(draft).length > 0, "expected rejection");
});

Deno.test("rejects a forbidden key inside body (guest execution / other VM property)", () => {
  const draft = { ...validDraft, moduleMainTf: validMainTf.replace(
    "properties = {\n      storageProfile",
    "properties = {\n      hardwareProfile = {}\n      storageProfile",
  ) };
  assert(validateOsDiskDraft(draft).length > 0, "expected rejection");
});

Deno.test("rejects a credential-shaped key anywhere in the body", () => {
  const draft = { ...validDraft, moduleMainTf: validMainTf.replace("body = {", "body = {\n    adminPassword = \"x\"") };
  const problems = validateOsDiskDraft(draft);
  assert(problems.some((p) => /credential/i.test(p)), JSON.stringify(problems));
});

Deno.test("rejects a missing correlation lifecycle precondition", () => {
  const draft = { ...validDraft, moduleMainTf: validMainTf.replace(/\n  lifecycle \{[\s\S]*/, "\n}") };
  const problems = validateOsDiskDraft(draft);
  assert(problems.some((p) => /precondition/i.test(p)), JSON.stringify(problems));
});

Deno.test("rejects an undeclared variable reference", () => {
  const draft = { ...validDraft, moduleMainTf: validMainTf.replace("var.target_resource_id", "var.not_a_real_variable") };
  const problems = validateOsDiskDraft(draft);
  assert(problems.some((p) => /undeclared/i.test(p)), JSON.stringify(problems));
});

Deno.test("rejects a disallowed function call", () => {
  const draft = { ...validDraft, moduleMainTf: validMainTf.replace("var.target_resource_id", "templatefile(\"x\", {})") };
  const problems = validateOsDiskDraft(draft);
  assert(problems.some((p) => /not allowed/i.test(p)), JSON.stringify(problems));
});

Deno.test("rejects diskSizeGB not bound to the requested variable", () => {
  const draft = { ...validDraft, moduleMainTf: validMainTf.replace("diskSizeGB = var.requested_os_disk_size_gb", "diskSizeGB = 100") };
  assert(validateOsDiskDraft(draft).length > 0, "expected rejection");
});

Deno.test("rejects a variable declared with the wrong type", () => {
  const draft = { ...validDraft, moduleVariablesTf: validVariablesTf.replace('variable "requested_os_disk_size_gb" {\n  type = number', 'variable "requested_os_disk_size_gb" {\n  type = string') };
  assert(validateOsDiskDraft(draft).length > 0, "expected rejection");
});

Deno.test("rejects a disk-size validation missing its upper bound", () => {
  const draft = { ...validDraft, moduleVariablesTf: validVariablesTf.replace(
    "condition     = var.requested_os_disk_size_gb >= 64 && var.requested_os_disk_size_gb <= 4095",
    "condition     = var.requested_os_disk_size_gb >= 64",
  ) };
  const problems = validateOsDiskDraft(draft);
  assert(problems.some((p) => /64-4095/.test(p)), JSON.stringify(problems));
});

Deno.test("rejects heredocs and block comments outside the draft grammar", () => {
  const draft = { ...validDraft, moduleMainTf: `${validMainTf}\n/* comment */` };
  assert(validateOsDiskDraft(draft).length > 0, "expected rejection");
});
