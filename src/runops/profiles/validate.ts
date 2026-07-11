/**
 * Tenant profile integrity validation service.
 *
 * Pure function: takes a TenantProfileRecord, returns a ValidationReport
 * containing (a) an 18-dimension completeness scorecard used by the
 * Tenant Profile Manager dashboard, and (b) a rolled-up findings list.
 *
 * The report is consumed by the Tenant Profile Manager and by a dev-time
 * console warning inside DemoOperationsProvider.
 */

import type {
  CompletenessDimension, TenantProfileRecord, ValidationFinding, ValidationReport,
} from "./types";

/** Score a single dimension. Score in 0..100, ok = score >= 70. */
function dim(
  key: string,
  label: string,
  score: number,
  detail: string,
  missing: readonly string[] = [],
): CompletenessDimension {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return { key, label, score: clamped, ok: clamped >= 70, detail, missing };
}

export function validateTenantProfile(record: TenantProfileRecord): ValidationReport {
  const findings: ValidationFinding[] = [];
  const { profile, bundle, industry } = record;

  const push = (severity: ValidationFinding["severity"], code: string, message: string) =>
    findings.push({ severity, code, message });

  const isCrossTenant = (id: string) =>
    id.includes("-contoso") ||
    id.includes("-mer-") ||
    id.includes("-atl-") ||
    id.includes("-apex-") ||
    id.includes("-atlas-") ||
    id.includes("-meridian-");

  /* ---------------- Findings (integrity issues) ---------------- */

  if (!bundle.services.find((s) => s.id === profile.defaultServiceId)) {
    push("error", "default-service-missing",
      `Default service ${profile.defaultServiceId} is not present in the tenant bundle.`);
  }
  if (!profile.defaultScenarioId) push("error", "default-scenario-missing", "Default scenario is not set.");
  if (!profile.defaultStoryId)    push("error", "default-story-missing",    "Default story is not set.");

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

  for (const slo of bundle.slos) {
    if (!bundle.services.find((s) => s.id === slo.serviceId)) {
      push("error", "slo-orphan-service", `SLO ${slo.id} references unknown service ${slo.serviceId}.`);
    }
  }

  for (const w of bundle.digitalWorkers) {
    if (!w.role || !w.autonomy) {
      push("error", "worker-missing-authority",
        `Digital worker ${w.id} is missing role or autonomy boundary.`);
    }
  }

  for (const c of bundle.connectors) {
    if (profile.industry !== "generic-enterprise" &&
        !/simulated|synthetic/i.test(c.name)) {
      push("warning", "connector-not-simulated",
        `Connector ${c.id} is not clearly labeled as simulated/synthetic.`);
    }
  }

  if (!bundle.services.find((s) => s.id === bundle.primaryIncident.serviceId)) {
    push("error", "incident-orphan-service",
      `Primary incident references unknown service ${bundle.primaryIncident.serviceId}.`);
  }

  const componentIdsInServices = new Set(bundle.services.flatMap((s) => s.componentIds));
  for (const c of bundle.components) {
    if (!componentIdsInServices.has(c.id)) {
      push("info", "component-unlinked", `Component ${c.id} is not attached to any service.`);
    }
  }

  if (profile.industry !== "generic-enterprise" && !profile.syntheticDataNotice) {
    push("error", "missing-synthetic-notice",
      "Synthetic data notice must be present for demonstration tenants.");
  }

  for (const sm of industry.standardsMappings) {
    if (sm.kind !== "mapping") {
      push("error", "standards-not-mapping",
        `Standards entry ${sm.id} must be labeled as a mapping, not a certification.`);
    }
  }

  const tenantPrefix = profile.tenantId.replace("tenant-", "");
  const wrongPrefixed = [
    ...bundle.services.map((s) => s.id),
    ...bundle.runbooksList.map((r) => r.id),
    ...bundle.digitalWorkers.map((w) => w.id),
    bundle.primaryIncident.id, bundle.primaryChange.id, bundle.primaryApproval.id,
  ].filter((id) => {
    if (profile.industry === "generic-enterprise") return false;
    return isCrossTenant(id) && !id.toLowerCase().includes(tenantPrefix.slice(0, 3));
  });
  if (wrongPrefixed.length > 3) {
    push("warning", "possible-cross-tenant-refs",
      `Some entity IDs may reference another tenant: ${wrongPrefixed.slice(0, 3).join(", ")}…`);
  }

  /* ---------------- 18-dimension completeness scorecard ---------------- */

  const svcCount     = bundle.services.length;
  const cmpCount     = bundle.components.length;
  const linkedCmp    = bundle.components.filter((c) => componentIdsInServices.has(c.id)).length;
  const journeyCount = bundle.services.length; // journeys are surfaced via services in current bundle shape
  const metricCount  = industry.defaultMetricDefinitions.length;
  const sloCount     = bundle.slos.length;
  const rbCount      = bundle.runbooksList.length;
  const rbCertified  = bundle.runbooksList.filter((r) => r.state === "Certified" || r.state === "Published").length;
  const rbWithTests  = bundle.runbooksList.filter((r) => r.steps.some((s) => s.kind === "validate")).length;
  const scenarioStages = bundle.scenarioStages.length;
  const incidentOk   = !!bundle.services.find((s) => s.id === bundle.primaryIncident.serviceId);
  const workerCount  = bundle.digitalWorkers.length;
  const connCount    = bundle.connectors.length;
  const policyCount  = industry.hardGuardrails.length + profile.hardGuardrails.length;
  const knowledgeCount = bundle.knowledgeItems.length;
  const analyticsCount = industry.defaultMetricDefinitions.length; // metric catalog drives analytics
  const storyStages    = bundle.scenarioStages.length;
  const syntheticOk    = profile.industry === "generic-enterprise"
    ? true
    : !!profile.syntheticDataNotice && bundle.connectors.every((c) =>
        profile.industry === "generic-enterprise" || /simulated|synthetic/i.test(c.name));
  const executionZones = bundle.digitalWorkers.length;

  const dimensions: CompletenessDimension[] = [
    dim("services",     "Services",          Math.min(100, svcCount * 8),
        `${svcCount} services defined.`),
    dim("components",   "Components",        Math.min(100, cmpCount * 4),
        `${cmpCount} components defined; ${linkedCmp} linked to services.`,
        cmpCount - linkedCmp > 0 ? [`${cmpCount - linkedCmp} component(s) unlinked to any service`] : []),
    dim("dependencies", "Dependencies",      svcCount === 0 ? 0 : Math.min(100, (linkedCmp / Math.max(1, cmpCount)) * 100),
        "Component-to-service links represent dependency edges."),
    dim("journeys",     "Journeys",          Math.min(100, journeyCount * 10),
        `${journeyCount} journey/service surfaces.`),
    dim("metrics",      "Metrics",           Math.min(100, metricCount * 25),
        `${metricCount} metric definitions available for this industry.`),
    dim("slos",         "SLOs",              Math.min(100, sloCount * 10),
        `${sloCount} SLOs defined.`),
    dim("runbooks",     "Runbooks",          Math.min(100, rbCount * 8),
        `${rbCount} runbooks; ${rbCertified} certified/published.`),
    dim("tests",        "Tests",             rbCount === 0 ? 0 : Math.round((rbWithTests / rbCount) * 100),
        `${rbWithTests}/${rbCount} runbooks include validate steps.`),
    dim("scenarios",    "Scenarios",         Math.min(100, scenarioStages * 6),
        `${scenarioStages} scenario stages defined.`),
    dim("incidents",    "Incidents",         incidentOk ? 100 : 30,
        incidentOk ? "Primary incident references a valid service." : "Primary incident references an unknown service."),
    dim("workers",      "Digital Workers",   Math.min(100, workerCount * 12),
        `${workerCount} digital workers assigned to this tenant.`),
    dim("connectors",   "Connectors",        Math.min(100, connCount * 8),
        `${connCount} connectors registered.`),
    dim("policies",     "Policies",          Math.min(100, policyCount * 25),
        `${policyCount} hard guardrails enforced.`),
    dim("knowledge",    "Knowledge",         Math.min(100, knowledgeCount * 20),
        `${knowledgeCount} knowledge items indexed for this tenant.`),
    dim("analytics",    "Analytics",         Math.min(100, analyticsCount * 25),
        `${analyticsCount} metric definitions drive the analytics catalog.`),
    dim("story",        "Story",             Math.min(100, storyStages * 6),
        `${storyStages} story stages available in the demo navigator.`),
    dim("security",     "Execution Security", Math.min(100, executionZones * 12),
        `${executionZones} digital-worker execution zones with authority boundaries.`),
    dim("synthetic",    "Synthetic-data labeling", syntheticOk ? 100 : 40,
        syntheticOk ? "All non-generic connectors and the tenant carry synthetic labels."
                     : "One or more connectors or the tenant profile is missing a synthetic label."),
  ];

  /* ---------------- Aggregate scores ---------------- */

  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;

  const dimAvg = dimensions.reduce((acc, d) => acc + d.score, 0) / Math.max(1, dimensions.length);
  const completenessPercent = Math.max(0, Math.round(dimAvg - errors * 6 - warnings * 2));

  return {
    tenantId: profile.tenantId,
    ok: errors === 0,
    findings,
    completenessPercent,
    dimensions,
  };
}
