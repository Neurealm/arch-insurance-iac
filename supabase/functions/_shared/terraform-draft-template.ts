import type { DraftVariable } from "./terraform-draft-policy.ts";

/**
 * Apply the assignment alignment used by `terraform fmt` to the small,
 * server-owned draft grammar. An assignment whose value opens a multiline
 * expression is a group boundary: Terraform does not align it with preceding
 * scalar assignments.
 */
export function formatGeneratedHclAssignments(content: string): string {
  const lines = content.split("\n");
  const assignment = /^(\s*)([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(.+)$/;
  const opensMultiline = (value: string) => ["(", "{", "["].includes(value.trimEnd().slice(-1));
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const first = lines[i].match(assignment);
    if (!first) { out.push(lines[i]); i += 1; continue; }
    if (opensMultiline(first[3])) {
      out.push(`${first[1]}${first[2]} = ${first[3]}`);
      i += 1;
      continue;
    }
    const indent = first[1];
    const group: Array<{ key: string; value: string }> = [];
    let j = i;
    while (j < lines.length) {
      const current = lines[j].match(assignment);
      if (!current || current[1] !== indent || opensMultiline(current[3])) break;
      group.push({ key: current[2], value: current[3] });
      j += 1;
    }
    const width = Math.max(...group.map((item) => item.key.length));
    for (const item of group) out.push(`${indent}${item.key.padEnd(width)} = ${item.value}`);
    i = j;
  }
  return out.join("\n");
}

export function templateRootFiles(moduleName: string, variables: DraftVariable[]) {
  const moduleSnake = moduleName.replace(/-/g, "_");
  const wiring = variables.map((variable) => `  ${variable.name} = var.${variable.name}`).join("\n");
  const varDecls = variables.map((variable) => `variable "${variable.name}" {
  type        = ${variable.type}
  description = ${JSON.stringify(variable.description || variable.name)}
${variable.name === "tags" ? "  default     = {}\n" : ""}}`).join("\n\n");
  const main = `provider "azapi" {
  # HCP Terraform supplies these short-lived files through its Azure dynamic
  # credentials integration. Do not replace this with a client secret.
  use_cli              = false
  use_oidc             = true
  client_id_file_path  = var.tfc_azure_dynamic_credentials.default.client_id_file_path
  oidc_token_file_path = var.tfc_azure_dynamic_credentials.default.oidc_token_file_path
}

module "${moduleSnake}" {
  source = "../../../modules/${moduleName}"

${wiring}
}
`;
  const variablesTf = `${varDecls}

variable "tfc_azure_dynamic_credentials" {
  description = "HCP Terraform-generated OIDC file locations for the default Azure provider."
  type = object({
    default = object({
      client_id_file_path  = string
      oidc_token_file_path = string
    })
    aliases = map(object({
      client_id_file_path  = string
      oidc_token_file_path = string
    }))
  })
}
`;
  const versions = `terraform {
  required_version = ">= 1.9.0, < 2.0.0"

  required_providers {
    azapi = {
      source  = "Azure/azapi"
      version = "~> 2.0"
    }
  }
}
`;
  return {
    main: formatGeneratedHclAssignments(main),
    variablesTf: formatGeneratedHclAssignments(variablesTf),
    versions: formatGeneratedHclAssignments(versions),
  };
}

export function moduleVersionsTf() {
  return formatGeneratedHclAssignments(`terraform {
  required_version = ">= 1.9.0, < 2.0.0"
  required_providers {
    azapi = {
      source  = "Azure/azapi"
      version = "~> 2.0"
    }
  }
}
`);
}
