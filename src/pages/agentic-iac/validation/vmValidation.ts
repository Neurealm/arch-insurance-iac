import { supabase } from "@/integrations/supabase/client";
import { type AzureVirtualMachine, type AzureVmOperations } from "../azureControlPlane";
import { type VmChangePackage } from "../changePackages";

export type ValidationResult = {
  id?: string;
  checkCode: string;
  domain: string;
  measure: string;
  expected: string;
  observed: string;
  result: "PASS" | "WARN" | "FAIL";
  source: string;
  raw: Record<string, unknown>;
  checkedAt?: string;
};

export type ValidationRun = {
  id: string;
  packageId: string;
  status: "pending" | "running" | "verified" | "failed" | "closed";
  startedAt: string | null;
  completedAt: string | null;
  closedAt: string | null;
  validatedBy: string | null;
  confidence: number | null;
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  summary: string | null;
  evidenceHash: string | null;
};

export type EvidenceItem = { id: string; kind: string; name: string; source: string; capturedAt: string; content: Record<string, unknown>; contentHash: string | null };

const db = () => supabase as unknown as { from: (name: string) => any };

function mapRun(row: Record<string, any>): ValidationRun {
  return { id: row.id, packageId: row.package_id, status: row.status, startedAt: row.started_at, completedAt: row.completed_at, closedAt: row.closed_at, validatedBy: row.validated_by, confidence: row.confidence, beforeState: row.before_state ?? {}, afterState: row.after_state ?? {}, summary: row.summary ?? null, evidenceHash: row.evidence_hash ?? null };
}

function mapResult(row: Record<string, any>): ValidationResult {
  return { id: row.id, checkCode: row.check_code, domain: row.domain, measure: row.measure, expected: row.expected, observed: row.observed, result: row.result, source: row.source, raw: row.raw ?? {}, checkedAt: row.checked_at };
}

function mapEvidence(row: Record<string, any>): EvidenceItem {
  return { id: row.id, kind: row.kind, name: row.name, source: row.source, capturedAt: row.captured_at, content: row.content ?? {}, contentHash: row.content_hash ?? null };
}

export async function getValidationRun(packageId: string) {
  const { data, error } = await db().from("iac_validation_runs").select("*").eq("package_id", packageId).maybeSingle();
  if (error) throw error;
  return data ? mapRun(data) : null;
}

export async function getValidationResults(runId: string) {
  const { data, error } = await db().from("iac_validation_results").select("*").eq("run_id", runId).order("checked_at");
  if (error) throw error;
  return (data ?? []).map(mapResult);
}

export async function getEvidenceItems(runId: string) {
  const { data, error } = await db().from("iac_evidence_items").select("*").eq("run_id", runId).order("captured_at");
  if (error) throw error;
  return (data ?? []).map(mapEvidence);
}

export async function createValidationRun(pkg: VmChangePackage, vm: AzureVirtualMachine) {
  const { data, error } = await db().from("iac_validation_runs").insert({ package_id: pkg.id, before_state: pkg.currentState, status: "pending" }).select("*").single();
  if (error) throw error;
  return mapRun(data);
}

function stateSnapshot(vm: AzureVirtualMachine, operations: AzureVmOperations | null) {
  return { resourceId: vm.id, name: vm.name, powerState: vm.powerState, provisioningState: vm.provisioningState, vmSize: operations?.configuration.vmSize ?? vm.vmSize, osType: operations?.configuration.osType ?? vm.osType, monitoring: operations?.monitoring.state ?? "unavailable", backup: operations?.backup.state ?? "unavailable", patching: operations?.patching.state ?? "unavailable", observedAt: operations?.observedAt ?? new Date().toISOString() };
}

export function buildVmValidationResults(pkg: VmChangePackage, vm: AzureVirtualMachine, operations: AzureVmOperations | null): ValidationResult[] {
  const after = stateSnapshot(vm, operations);
  const isStart = pkg.actionType === "start_vm";
  const running = /running/i.test(vm.powerState);
  const provisioning = /succeeded|successful/i.test(vm.provisioningState);
  const checks: ValidationResult[] = [
    { checkCode: "VM-TARGET-001", domain: "Azure identity", measure: "Target resource", expected: pkg.targetResourceId, observed: vm.id, result: vm.id.toLowerCase() === pkg.targetResourceId.toLowerCase() ? "PASS" : "FAIL", source: "Azure control plane / virtual-machines", raw: { packageTarget: pkg.targetResourceId, observedTarget: vm.id } },
    { checkCode: "VM-STATE-001", domain: "Azure compute", measure: "Power state", expected: isStart ? "running" : "Action-specific state", observed: vm.powerState, result: isStart ? (running ? "PASS" : "FAIL") : "WARN", source: "Azure control plane / virtual-machines", raw: { actionType: pkg.actionType, powerState: vm.powerState } },
    { checkCode: "VM-STATE-002", domain: "Azure compute", measure: "Provisioning state", expected: "succeeded", observed: vm.provisioningState, result: provisioning ? "PASS" : "FAIL", source: "Azure control plane / virtual-machines", raw: { provisioningState: vm.provisioningState } },
    { checkCode: "VM-OPS-001", domain: "Operations", measure: "Azure Monitor", expected: "available", observed: operations?.monitoring.state ?? "unavailable", result: operations?.monitoring.state === "available" ? "PASS" : "WARN", source: "Azure VM operations API / Monitor", raw: { monitoring: operations?.monitoring ?? null } },
    { checkCode: "VM-OPS-002", domain: "Operations", measure: "Backup protection", expected: "protected", observed: operations?.backup.state ?? "unavailable", result: operations?.backup.state === "protected" ? "PASS" : "WARN", source: "Azure VM operations API / Backup", raw: { backup: operations?.backup ?? null } },
    { checkCode: "VM-OPS-003", domain: "Operations", measure: "Patch assessment", expected: "compliant", observed: operations?.patching.state ?? "unavailable", result: operations?.patching.state === "compliant" ? "PASS" : "WARN", source: "Azure VM operations API / Update Manager", raw: { patching: operations?.patching ?? null } },
  ];
  return checks.map((check) => ({ ...check, raw: { ...check.raw, after } }));
}

export async function persistValidation(pkg: VmChangePackage, vm: AzureVirtualMachine, operations: AzureVmOperations | null) {
  const existing = await getValidationRun(pkg.id);
  const run = existing ?? await createValidationRun(pkg, vm);
  const results = buildVmValidationResults(pkg, vm, operations);
  const failed = results.some((x) => x.result === "FAIL");
  const confidence = Math.round((results.filter((x) => x.result === "PASS").length / results.length) * 100);
  const afterState = stateSnapshot(vm, operations);
  const now = new Date().toISOString();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify({ packageId: pkg.id, afterState, results })));
  const evidenceHash = `sha256:${Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  const { data: updated, error: updateError } = await db().from("iac_validation_runs").update({ status: failed ? "failed" : "verified", started_at: run.startedAt ?? now, completed_at: now, validated_by: (await supabase.auth.getUser()).data.user?.id, confidence, after_state: afterState, evidence_hash: evidenceHash, summary: failed ? "One or more mandatory Azure checks failed." : "All mandatory Azure checks passed; operational warnings may remain." }).eq("id", run.id).select("*").single();
  if (updateError) throw updateError;
  const { error: resultError } = await db().from("iac_validation_results").upsert(results.map((item) => ({ run_id: run.id, check_code: item.checkCode, domain: item.domain, measure: item.measure, expected: item.expected, observed: item.observed, result: item.result, source: item.source, raw: item.raw, checked_at: now })), { onConflict: "run_id,check_code" });
  if (resultError) throw resultError;
  const { error: evidenceError } = await db().from("iac_evidence_items").insert([
    { run_id: run.id, kind: "azure_observation", name: "Post-change Azure VM observation", source: "Azure VM operations API", content: afterState, captured_at: now },
    { run_id: run.id, kind: "execution_event", name: "Execution outcome", source: "iac_change_packages", content: { status: pkg.status, executionStartedAt: pkg.executionStartedAt, executionCompletedAt: pkg.executionCompletedAt, message: pkg.executionMessage }, captured_at: now },
    { run_id: run.id, kind: "approval_record", name: "Approval decision", source: "iac_change_package_reviews", content: { packageId: pkg.id, action: pkg.actionLabel }, captured_at: now },
  ]);
  if (evidenceError) throw evidenceError;
  return { run: mapRun(updated), results };
}

export async function closeValidationRun(runId: string) {
  const { data, error } = await db().from("iac_validation_runs").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", runId).eq("status", "verified").select("*").single();
  if (error) throw error;
  return mapRun(data);
}
