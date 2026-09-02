import { supabase } from "@/integrations/supabase/client";

export type AutomationCapability = {
  id: string; actionType: string; displayName: string; moduleSource: string; moduleVersion: string;
  executionMode: "azapi_action" | "azapi_update" | "azurerm_resource";
  lifecycleStatus: "draft" | "testing" | "approved" | "retired";
  allowedEnvironments: string[]; requiresManagedResource: boolean;
};

export type TerraformRun = {
  id: string; packageId: string; runType: "plan" | "apply";
  status: "queued" | "running" | "succeeded" | "failed" | "blocked" | "cancelled";
  moduleSource: string; moduleVersion: string; planSha256: string | null;
  planSummary: Record<string, unknown>; reconciliation: Record<string, unknown>;
  hasDestroy: boolean; hasReplace: boolean; errorMessage: string | null; createdAt: string;
};

const db = () => supabase as unknown as { from: (name: string) => any };

const mapCapability = (row: Record<string, any>): AutomationCapability => ({
  id: row.id, actionType: row.action_type, displayName: row.display_name, moduleSource: row.module_source,
  moduleVersion: row.module_version, executionMode: row.execution_mode, lifecycleStatus: row.lifecycle_status,
  allowedEnvironments: row.allowed_environments ?? [], requiresManagedResource: row.requires_managed_resource,
});

const mapRun = (row: Record<string, any>): TerraformRun => ({
  id: row.id, packageId: row.package_id, runType: row.run_type, status: row.status,
  moduleSource: row.module_source, moduleVersion: row.module_version, planSha256: row.plan_sha256 ?? null,
  planSummary: row.plan_summary ?? {}, reconciliation: row.reconciliation ?? {}, hasDestroy: row.has_destroy,
  hasReplace: row.has_replace, errorMessage: row.error_message ?? null, createdAt: row.created_at,
});

export async function listApprovedVmCapabilities() {
  const { data, error } = await db().from("iac_automation_capabilities").select("*")
    .eq("resource_type", "Microsoft.Compute/virtualMachines").eq("lifecycle_status", "approved").order("action_type");
  if (error) throw error;
  return (data ?? []).map(mapCapability);
}

export async function listTerraformRuns(packageId: string) {
  const { data, error } = await db().from("iac_terraform_runs").select("*")
    .eq("package_id", packageId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRun);
}

async function invoke(operation: "resolve" | "plan" | "apply", packageId: string) {
  const { data, error } = await supabase.functions.invoke("terraform-orchestrator", { body: { operation, packageId } });
  if (error) throw error;
  return data as Record<string, unknown>;
}

export const resolveTerraformCapability = (packageId: string) => invoke("resolve", packageId);
export const createTerraformPlan = (packageId: string) => invoke("plan", packageId);
export const applyApprovedTerraformPlan = (packageId: string) => invoke("apply", packageId);
