/**
 * Tenant profile integrity validation service.
 *
 * Pure function: takes a TenantProfileRecord, returns a ValidationReport.
 * Consumed by the Tenant Profile Manager and by a dev-time console warning
 * inside DemoOperationsProvider.
 */

import type {
  TenantProfileRecord, ValidationFinding, ValidationReport,
} from "./types";

export function validateTenantProfile(record: TenantProfileRecord): ValidationReport {
  const findings: ValidationFinding[] = [];
  const { profile, bundle } = record;

  const push = (severity: ValidationFinding["severity"], code: string, message: string) =>
    findings.push({ severity, code, message });

  const isCrossTenant = (id: string) =>
    id.includes("-contoso") ||
    id.includes("-mer-") ||
    id.includes("-atl-") ||
    id.includes("-apex-") ||
    id.includes("-atlas-") ||
    id.includes("-meridian-");

  // Default service exists
  if (!bundle.services.find((s) => s.id === profile.defaultServiceId)) {
    push("error", "default-service-missing",
      `Default service ${profile.defaultServiceId} is not present in the tenant bundle.`);
  }
  // Default scenario / story presence
  if (!profile.defaultScenarioId) push("error", "default-scenario-missing", "Default scenario is not set.");
  if (!profile.defaultStoryId)    push("error", "default-story-missing",    "Default story is not set.");

  // Runbooks: owners + prod runbooks have validate+rollback
  for (const rb of bundle.runbooksList) {
    if (!rb.serviceId) push("error", "runbook-no-owner", `Runbook ${rb.id} has no owning service.`);
    if (rb.state === "Certified" || rb.state === "Published") {
      const hasValidate = rb.steps.some((s) => s.kind === "validate");
      const hasRollback = rb.steps.some((s) => s.kind === "rollback");
      if (rb.steps.length > 0 && (!hasValidate || !hasRollback)) {
        push("warning", "runbook-missing-validate-or-rollback",
          `Runbook ${rb.id} (${rb.state}) is missing a ${!hasValidate ? "validate" : "rollback"} step or approved exception.`);
      }
    }
  }

  // SLOs must reference a service
  for (const slo of bundle.slos) {
    if (!bundle.services.find((s) => s.id === slo.serviceId)) {
      push("error", "slo-orphan-service", `SLO ${slo.id} references unknown service ${slo.serviceId}.`);
    }
  }

  // Workers have identifiers (proxy for tool grants + authority boundaries)
  for (const w of bundle.digitalWorkers) {
    if (!w.role || !w.autonomy) {
      push("error", "worker-missing-authority",
        `Digital worker ${w.id} is missing role or autonomy boundary.`);
    }
  }

  // Connectors present, marked as simulated for non-generic tenants
  for (const c of bundle.connectors) {
    if (profile.industry !== "generic-enterprise" &&
        !/simulated|synthetic/i.test(c.name)) {
      push("warning", "connector-not-simulated",
        `Connector ${c.id} is not clearly labeled as simulated/synthetic.`);
    }
  }

  // Incidents reference valid services
  if (!bundle.services.find((s) => s.id === bundle.primaryIncident.serviceId)) {
    push("error", "incident-orphan-service",
      `Primary incident references unknown service ${bundle.primaryIncident.serviceId}.`);
  }

  // Components belong to a service
  const componentIdsInServices = new Set(
    bundle.services.flatMap((s) => s.componentIds),
  );
  for (const c of bundle.components) {
    if (!componentIdsInServices.has(c.id)) {
      push("info", "component-unlinked", `Component ${c.id} is not attached to any service.`);
    }
  }

  // Synthetic-data notice present for demo tenants
  if (profile.industry !== "generic-enterprise" && !profile.syntheticDataNotice) {
    push("error", "missing-synthetic-notice",
      "Synthetic data notice must be present for demonstration tenants.");
  }

  // Standards mappings are mappings, not certifications
  for (const sm of record.industry.standardsMappings) {
    if (sm.kind !== "mapping") {
      push("error", "standards-not-mapping",
        `Standards entry ${sm.id} must be labeled as a mapping, not a certification.`);
    }
  }

  // Cross-tenant reference check (very shallow): id prefixes should be tenant-consistent.
  const tenantPrefix = profile.tenantId.replace("tenant-", "");
  const wrongPrefixed = [
    ...bundle.services.map((s) => s.id),
    ...bundle.runbooksList.map((r) => r.id),
    ...bundle.digitalWorkers.map((w) => w.id),
    bundle.primaryIncident.id, bundle.primaryChange.id, bundle.primaryApproval.id,
  ].filter((id) => {
    // Contoso IDs are not prefixed with -contoso-, they use the original scenario IDs.
    if (profile.industry === "generic-enterprise") return false;
    // Very simple heuristic: at least one ID should carry a tenant-specific token.
    return isCrossTenant(id) && !id.toLowerCase().includes(tenantPrefix.slice(0, 3));
  });
  if (wrongPrefixed.length > 3) {
    push("warning", "possible-cross-tenant-refs",
      `Some entity IDs may reference another tenant: ${wrongPrefixed.slice(0, 3).join(", ")}…`);
  }

  const total = findings.length;
  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;

  // Completeness heuristic: 100 minus weighted penalties.
  const completenessPercent = Math.max(0, 100 - errors * 12 - warnings * 4);

  return {
    tenantId: profile.tenantId,
    ok: errors === 0,
    findings,
    completenessPercent: total === 0 ? 100 : completenessPercent,
  };
}
