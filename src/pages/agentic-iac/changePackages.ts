import { supabase } from "@/integrations/supabase/client";

export type ChangePackageStatus = "draft" | "submitted";

export type VmChangePackage = {
  id: string;
  packageNumber: string;
  status: ChangePackageStatus;
  targetResourceId: string;
  targetName: string;
  subscriptionId: string;
  resourceGroup: string;
  region: string;
  actionType: string;
  actionLabel: string;
  parameters: Record<string, unknown>;
  rationale: string;
  currentState: Record<string, unknown>;
  policyEvidence: unknown[];
  validationPlan: unknown[];
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  approvalRequired: boolean;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PackageInput = Omit<VmChangePackage, "id" | "createdAt" | "updatedAt" | "submittedAt">;

const table = () => supabase as unknown as { from: (name: string) => any };

function map(row: Record<string, any>): VmChangePackage {
  return {
    id: row.id,
    packageNumber: row.package_number,
    status: row.status,
    targetResourceId: row.target_resource_id,
    targetName: row.target_name,
    subscriptionId: row.subscription_id,
    resourceGroup: row.resource_group,
    region: row.region,
    actionType: row.action_type,
    actionLabel: row.action_label,
    parameters: row.parameters ?? {},
    rationale: row.rationale,
    currentState: row.current_state ?? {},
    policyEvidence: row.policy_evidence ?? [],
    validationPlan: row.validation_plan ?? [],
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    approvalRequired: row.approval_required,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function payload(input: PackageInput) {
  return {
    package_number: input.packageNumber,
    status: input.status,
    target_resource_id: input.targetResourceId,
    target_name: input.targetName,
    subscription_id: input.subscriptionId,
    resource_group: input.resourceGroup,
    region: input.region,
    action_type: input.actionType,
    action_label: input.actionLabel,
    parameters: input.parameters,
    rationale: input.rationale,
    current_state: input.currentState,
    policy_evidence: input.policyEvidence,
    validation_plan: input.validationPlan,
    risk_score: input.riskScore,
    risk_level: input.riskLevel,
    approval_required: input.approvalRequired,
  };
}

export async function listVmChangePackages() {
  const { data, error } = await table().from("iac_change_packages").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(map);
}

export async function saveVmChangePackage(input: PackageInput, existingId?: string) {
  const query = existingId
    ? table().from("iac_change_packages").update(payload(input)).eq("id", existingId).select("*").single()
    : table().from("iac_change_packages").insert(payload(input)).select("*").single();
  const { data, error } = await query;
  if (error) throw error;
  return map(data);
}
