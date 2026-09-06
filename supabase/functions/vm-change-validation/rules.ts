// Pure, fail-closed verification rules. No browser state or LLM output is authoritative.
export type Json = Record<string, unknown>;
export type Check = { checkCode: string; domain: string; measure: string; expected: string; observed: string; result: "PASS" | "WARN" | "FAIL"; source: string; raw: Json };
export const record = (value: unknown): Json => value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
export const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const sameId = (a: unknown, b: unknown) => !!text(a) && text(a).toLowerCase() === text(b).toLowerCase();
export const MAX_OBSERVATION_AGE_MS = 5 * 60_000;

export function assertAppliedApproval(pkg: Json, apply: Json, plan: Json, review: Json) {
  if (pkg.status !== "executed") throw new Error("A completed execution is required for final validation.");
  if (apply.package_id !== pkg.id || plan.package_id !== pkg.id || review.package_id !== pkg.id || apply.run_type !== "apply" || plan.run_type !== "plan") throw new Error("Execution evidence does not belong to this package.");
  if (apply.execution_engine !== "hcp_terraform" || plan.execution_engine !== "hcp_terraform" || apply.status !== "succeeded" || apply.hcp_run_status !== "applied" || plan.status !== "succeeded") throw new Error("The approved HCP Terraform apply has not succeeded.");
  if (review.decision !== "approved" || !text(review.reviewed_by) || review.reviewed_by === pkg.created_by) throw new Error("An independent human approval is required.");
  if (!text(plan.id) || apply.plan_run_id !== plan.id || review.approved_plan_run_id !== plan.id) throw new Error("The apply is not bound to the exact approved saved plan.");
  for (const [planKey, reviewKey] of [["plan_sha256", "approved_plan_sha256"], ["source_revision", "approved_source_revision"], ["hcp_run_id", "approved_hcp_run_id"], ["hcp_plan_id", "approved_hcp_plan_id"]]) {
    if (!text(plan[planKey]) || plan[planKey] !== apply[planKey] || plan[planKey] !== review[reviewKey]) throw new Error("The approved plan identity does not match the completed apply.");
  }
  if (!text(plan.hcp_workspace_id) || plan.hcp_workspace_id !== apply.hcp_workspace_id || plan.has_destroy !== false || plan.has_replace !== false || record(plan.reconciliation).matched !== true) throw new Error("Saved-plan governance evidence is missing or invalid.");
  if (!Number.isFinite(Date.parse(text(apply.completed_at))) || !Number.isFinite(Date.parse(text(pkg.execution_completed_at)))) throw new Error("Execution completion timestamps are missing.");
}

export function assertRemoteApplied(remote: Json, apply: Json) {
  const relation = (name: string) => text(record(record(record(remote.relationships)[name]).data).id);
  if (remote.id !== apply.hcp_run_id || record(remote.attributes).status !== "applied" || relation("plan") !== apply.hcp_plan_id || relation("workspace") !== apply.hcp_workspace_id) throw new Error("HCP Terraform has not confirmed the exact saved-plan apply as successful.");
}

function afterObject(value: unknown): Json {
  if (typeof value === "string") { try { return record(JSON.parse(value)); } catch { return {}; } }
  return record(value);
}

function createdVm(plan: Json, target: string): Json | null {
  const matches = list(plan.resource_changes).map(record).filter(item => {
    const change = record(item.change); const after = record(change.after);
    if (item.type !== "azapi_resource" || !text(after.type).toLowerCase().startsWith("microsoft.compute/virtualmachines@") || JSON.stringify(change.actions) !== '["create"]') return false;
    const id = text(after.id) || `${text(after.parent_id)}/providers/Microsoft.Compute/virtualMachines/${text(after.name)}`;
    return sameId(id, target);
  });
  if (matches.length !== 1) return null;
  return record(record(matches[0].change).after);
}

export function buildValidationChecks(pkg: Json, apply: Json, plan: Json, targets: string[], observations: Json[], now = Date.now()): Check[] {
  if (!targets.length || targets.length > 50 || new Set(targets.map(id => id.toLowerCase())).size !== targets.length) throw new Error("The package must declare a unique, bounded target set.");
  const checks: Check[] = [];
  const appliedAt = Math.max(Date.parse(text(apply.completed_at)), Date.parse(text(pkg.execution_completed_at)));
  targets.forEach((target, index) => {
    const observationsForTarget = observations.filter(item => sameId(item.resourceId, target));
    const observation = observationsForTarget.length === 1 ? observationsForTarget[0] : {};
    const configuration = record(observation.configuration);
    const prefix = `VM-${index + 1}`;
    const check = (code: string, measure: string, expected: unknown, observed: unknown, pass: boolean, mandatory = true) => checks.push({
      checkCode: `${prefix}-${code}`, domain: target.split("/").at(-1) || "Azure VM", measure,
      expected: typeof expected === "string" ? expected : JSON.stringify(expected) ?? "Not reported",
      observed: typeof observed === "string" && observed ? observed : JSON.stringify(observed) ?? "Not reported",
      result: pass ? "PASS" : mandatory ? "FAIL" : "WARN", source: "Server-read Azure Resource Manager observation", raw: { targetResourceId: target, mandatory },
    });
    check("IDENTITY", "Exact target identity", target, observation.resourceId ?? "Not returned", observationsForTarget.length === 1);
    const observedAt = Date.parse(text(observation.observedAt));
    check("FRESHNESS", "Post-apply observation freshness", "Within 5 minutes, after execution completed", observation.observedAt ?? "Not reported", Number.isFinite(appliedAt) && observedAt >= appliedAt && observedAt <= now + 30_000 && now - observedAt <= MAX_OBSERVATION_AGE_MS);
    check("PROVISIONING", "Provisioning state", "Succeeded", observation.provisioningState ?? "Not reported", text(observation.provisioningState).toLowerCase() === "succeeded");
    const power = text(observation.powerState).toLowerCase().replace(/^powerstate\//, "");
    switch (pkg.action_type) {
      case "start_vm": check("START", "VM power state", "running", power || "Not reported", power === "running"); break;
      case "stop_vm": {
        const action = text(record(plan.resolved_inputs).action);
        const expected = action === "powerOff" ? "stopped" : action === "deallocate" ? "deallocated" : "Unknown approved stop operation";
        check("STOP", "VM power state", expected, power || "Not reported", ["powerOff", "deallocate"].includes(action) && power === expected); break;
      }
      case "resize_vm": {
        const expected = text(record(plan.resolved_inputs).requested_vm_size);
        check("SIZE", "Approved VM size", expected || "Missing approved SKU", configuration.vmSize ?? "Not reported", !!expected && configuration.vmSize === expected); break;
      }
      case "restart_vm":
        check("RUNNING", "VM power state", "running", power || "Not reported", power === "running");
        // Merely being running does not prove a restart occurred. Do not manufacture
        // boot/correlation evidence that the current Azure API does not expose.
        check("RESTART", "Restart-specific evidence", "Correlated restart/boot evidence after apply started", "Unavailable from the current observation API", false); break;
      case "create_vm": {
        const expected = createdVm(record(plan.hcp_plan_json), target);
        const properties = record(afterObject(expected?.body).properties);
        const hardware = record(properties.hardwareProfile); const disk = record(record(properties.storageProfile).osDisk);
        check("CREATE-PLAN", "Approved create specification", "One exact VM create in the saved plan", expected ? "Found" : "Missing or ambiguous", !!expected);
        check("CREATE-SIZE", "VM size", hardware.vmSize ?? "Missing approved SKU", configuration.vmSize ?? "Not reported", !!text(hardware.vmSize) && hardware.vmSize === configuration.vmSize);
        check("CREATE-OS", "Operating system", disk.osType ?? "Missing approved OS", configuration.osType ?? "Not reported", !!text(disk.osType) && text(disk.osType).toLowerCase() === text(configuration.osType).toLowerCase());
        check("CREATE-REGION", "Azure region", expected?.location ?? "Missing approved region", observation.location ?? "Not reported", !!text(expected?.location) && text(expected?.location).toLowerCase() === text(observation.location).toLowerCase());
        check("CREATE-RUNNING", "VM power state", "running", power || "Not reported", power === "running");
        const expectedNics = list(record(properties.networkProfile).networkInterfaces).map(value => text(record(value).id).toLowerCase());
        const actualNics = list(observation.networkInterfaceIds).map(value => text(value).toLowerCase());
        check("CREATE-NETWORK", "Approved network attachments", expectedNics, actualNics, expectedNics.length > 0 && expectedNics.every(id => !!id && actualNics.includes(id)) && actualNics.length === expectedNics.length);
        break;
      }
      default: check("ACTION", "Action-specific verification", "A supported authoritative verification rule", pkg.action_type, false);
    }
    check("MONITOR", "Monitoring coverage", "available", record(observation.monitoring).state ?? "unavailable", record(observation.monitoring).state === "available", false);
    check("BACKUP", "Backup protection", "protected", record(observation.backup).state ?? "unavailable", record(observation.backup).state === "protected", false);
  });
  return checks;
}
