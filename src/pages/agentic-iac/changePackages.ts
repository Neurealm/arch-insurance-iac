import { supabase } from "@/integrations/supabase/client";

export type ChangePackageStatus = "draft" | "submitted" | "approved" | "changes_requested" | "rejected" | "executing" | "executed" | "execution_failed";
export type ChangeReviewDecision = "approved" | "changes_requested" | "rejected";

export type VmChangePackageReview = {
  id: string;
  packageId: string;
  decision: ChangeReviewDecision;
  comment: string | null;
  reviewedBy: string;
  reviewedAt: string;
  approvedPlanRunId: string | null;
  approvedPlanSha256: string | null;
  approvedSourceRevision: string | null;
  approvedHcpRunId: string | null;
  approvedHcpPlanId: string | null;
};

export type VmChangePackage = {
  id: string;
  createdBy: string;
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
  executionStartedAt: string | null;
  executionCompletedAt: string | null;
  executionMessage: string | null;
  executedBy: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PackageInput = Omit<VmChangePackage, "id" | "createdBy" | "createdAt" | "updatedAt" | "submittedAt" | "executionStartedAt" | "executionCompletedAt" | "executionMessage" | "executedBy">;

/**
 * One Azure resource a package acts on. A package always declares at least one;
 * the four mutate-an-existing-VM actions declare exactly one, and create_vm
 * declares one per requested machine.
 */
export type ChangePackageTarget = {
  targetResourceId: string;
  targetName: string;
  subscriptionId: string;
  resourceGroup: string;
  region: string;
  currentState?: Record<string, unknown>;
};

const table = () => supabase as unknown as { from: (name: string) => any };

function map(row: Record<string, any>): VmChangePackage {
  return {
    id: row.id,
    createdBy: row.created_by,
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
    executionStartedAt: row.execution_started_at ?? null,
    executionCompletedAt: row.execution_completed_at ?? null,
    executionMessage: row.execution_message ?? null,
    executedBy: row.executed_by ?? null,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReview(row: Record<string, any>): VmChangePackageReview {
  return {
    id: row.id,
    packageId: row.package_id,
    decision: row.decision,
    comment: row.comment ?? null,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    approvedPlanRunId: row.approved_plan_run_id ?? null,
    approvedPlanSha256: row.approved_plan_sha256 ?? null,
    approvedSourceRevision: row.approved_source_revision ?? null,
    approvedHcpRunId: row.approved_hcp_run_id ?? null,
    approvedHcpPlanId: row.approved_hcp_plan_id ?? null,
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

export async function getVmChangePackage(id: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  const { data, error } = await table().from("iac_change_packages").select("*").eq(isUuid ? "id" : "package_number", id).maybeSingle();
  if (error) throw error;
  return data ? map(data) : null;
}

export async function listVmChangePackageReviews(packageId: string) {
  const { data, error } = await table().from("iac_change_package_reviews").select("*").eq("package_id", packageId).order("reviewed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapReview);
}

const rpcClient = () => supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: any; error: Error | null }> };

/**
 * The exact ARM IDs a create_vm package will declare, derived server-side.
 *
 * Synthesis lives in SQL so this screen and servicenow-intake cannot drift, and
 * so a name Azure would reject — or one that would break the orchestrator's ARM
 * ID parser — is refused here, while the requester can still fix it.
 */
export async function deriveVmTargetIds(resourceGroupArmId: string, vmNames: string[]): Promise<string[]> {
  const { data, error } = await rpcClient().rpc("iac_vm_target_ids", {
    p_resource_group_arm_id: resourceGroupArmId, p_vm_names: vmNames,
  });
  if (error) throw error;
  return Array.isArray(data) ? data.filter((item: unknown): item is string => typeof item === "string") : [];
}

/** Every resource a package declares. One row for a mutate action, N for a batch create. */
export async function listChangePackageTargets(packageId: string): Promise<ChangePackageTarget[]> {
  const { data, error } = await table().from("iac_change_package_targets").select("*").eq("package_id", packageId).order("target_resource_id");
  if (error) throw error;
  return (data ?? []).map((row: Record<string, any>) => ({
    targetResourceId: row.target_resource_id, targetName: row.target_name,
    subscriptionId: row.subscription_id, resourceGroup: row.resource_group,
    region: row.region, currentState: row.current_state ?? {},
  }));
}

export type ProvisioningAuthorization = {
  packageId: string; targetResourceIds: string[]; authorizedBy: string; authorizedAt: string; comment: string;
};

export async function getProvisioningAuthorization(packageId: string): Promise<ProvisioningAuthorization | null> {
  const { data, error } = await table().from("iac_provisioning_authorizations").select("*").eq("package_id", packageId).maybeSingle();
  if (error) throw error;
  return data ? {
    packageId: data.package_id, targetResourceIds: data.target_resource_ids ?? [],
    authorizedBy: data.authorized_by, authorizedAt: data.authorized_at, comment: data.comment,
  } : null;
}

/**
 * A platform administrator names the exact machines a batch may create.
 *
 * The caller passes the full set rather than a confirmation flag: the server
 * requires it to equal the package's declared targets, so authorising is an
 * explicit act rather than a rubber stamp on whatever the ticket contained.
 */
export async function authorizeProvisioningTargets(packageId: string, targetResourceIds: string[], comment: string) {
  const { data, error } = await rpcClient().rpc("authorize_iac_provisioning_targets", {
    p_package_id: packageId, p_target_resource_ids: targetResourceIds, p_comment: comment.trim(),
  });
  if (error) throw error;
  return data as Record<string, unknown>;
}

export async function reviewVmChangePackage(packageId: string, decision: ChangeReviewDecision, comment?: string, displayedPlan?: { id: string; planSha256: string | null } | null) {
  if (decision === "approved" && !displayedPlan?.planSha256) throw new Error("Refresh and review an exact saved Terraform plan before approval.");
  const rpc = supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: Record<string, any>; error: Error | null }> };
  const { data, error } = await rpc.rpc("review_iac_terraform_plan", {
    p_package_id: packageId,
    p_decision: decision,
    p_comment: comment?.trim() || null,
    p_plan_run_id: decision === "approved" ? displayedPlan?.id : null,
    p_plan_sha256: decision === "approved" ? displayedPlan?.planSha256 : null,
  });
  if (error) throw error;
  return mapReview(data);
}

/**
 * Writes a package and its declared targets in one transaction.
 *
 * Direct INSERT on iac_change_packages is revoked; save_iac_change_package is
 * the only supported write path. That is deliberate — it used to be possible to
 * create a package with no target rows, which the orchestrator then refused to
 * plan with "The change package has no declared target resources."
 *
 * `status: "submitted"` is passed as p_submit rather than written directly: the
 * RPC always creates the row as a draft, writes the targets, and submits last,
 * because the targets guard rejects child writes once the parent leaves draft.
 */
export async function saveVmChangePackage(input: PackageInput, targets: ChangePackageTarget[], existingId?: string) {
  if (!targets.length) throw new Error("A change package must declare at least one target resource.");
  const { status, ...rest } = payload(input);
  const rpc = supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: Record<string, any>; error: Error | null }> };
  const { data, error } = await rpc.rpc("save_iac_change_package", {
    p_package: rest,
    p_targets: targets.map((target) => ({
      target_resource_id: target.targetResourceId,
      target_name: target.targetName,
      subscription_id: target.subscriptionId,
      resource_group: target.resourceGroup,
      region: target.region,
      current_state: target.currentState ?? {},
    })),
    p_submit: status === "submitted",
    p_package_id: existingId ?? null,
  });
  if (error) throw error;
  return map(data);
}
