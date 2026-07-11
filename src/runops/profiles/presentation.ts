/**
 * Presentation resolver — the single shared surface pages consume to render
 * tenant-appropriate labels, glossaries, and impact framing. Pages MUST NOT
 * write `if (industry === "healthcare-amc")` — they consume this object.
 */

import type {
  IndustryProfile, TenantOperationalProfile, TenantPresentationProfile,
} from "./types";

const NARRATION_BY_INDUSTRY: Record<
  IndustryProfile["code"],
  TenantPresentationProfile["narrationTemplates"]
> = {
  "generic-enterprise": {
    incidentOpen: "A production incident has been declared. Investigation is underway.",
    incidentMitigating: "Mitigation is executing. Human approval is enforcing the change safety gate.",
    incidentResolved: "The incident is resolved. Reliability is recovering.",
  },
  "healthcare-amc": {
    incidentOpen:
      "A clinical technology incident is active. Affected clinical workflows are being assessed. Downtime procedures are on standby. Patient-safety guardrails are enforced.",
    incidentMitigating:
      "Mitigation is executing under clinical informatics acknowledgment. No patient-safety, medication, or data-integrity risks are permitted.",
    incidentResolved:
      "Clinical continuity is restored. Downstream ancillary systems are current. No downtime procedure was activated.",
  },
  "saas-production": {
    incidentOpen:
      "A production incident is active. Customer impact is being scoped. Tenant isolation invariants remain enforced.",
    incidentMitigating:
      "Progressive rollback is executing. Security controls remain enforced and tenant isolation is intact.",
    incidentResolved:
      "Customer availability and data freshness are restored. Release velocity remains gated on reliability tolerance recovery.",
  },
  "chip-manufacturing": {
    incidentOpen:
      "A fab operational event is active. Wafers and lots at risk are being scoped. Safety interlocks and recipe integrity remain enforced.",
    incidentMitigating:
      "Recovery is executing under fab IT approval. No safety-interlock bypass, recipe change, or unauthorized lot release is permitted.",
    incidentResolved:
      "Production flow is restored. Traceability is complete. No excursion escaped the process-control envelope.",
  },
};

export function resolvePresentation(
  profile: TenantOperationalProfile,
  industry: IndustryProfile,
): TenantPresentationProfile {
  const isSyntheticDemo = profile.industry !== "generic-enterprise";
  return {
    tenantId: profile.tenantId,
    displayName: profile.displayName,
    shortName: profile.shortName,
    industry: profile.industry,
    industryName: industry.name,
    tenantAccent: profile.tenantAccent,
    isSyntheticDemo,
    syntheticDataNotice: profile.syntheticDataNotice,

    journeyLabel:      profile.terminologyOverrides.journey     ?? industry.journeyLabel,
    serviceLabel:      profile.terminologyOverrides.service     ?? industry.serviceLabel,
    componentLabel:    profile.terminologyOverrides.component   ?? industry.componentLabel,
    incidentLabel:     profile.terminologyOverrides.incident    ?? industry.incidentLabel,
    impactLabel:       profile.terminologyOverrides.impact      ?? industry.impactLabel,
    sloLabel:          profile.terminologyOverrides.slo         ?? industry.sloLabel,
    errorBudgetLabel:  profile.terminologyOverrides.errorBudget ?? industry.errorBudgetLabel,

    criticalityLevels:   industry.criticalityLevels,
    impactDimensions:    industry.impactDimensions,
    hardGuardrails:      [...industry.hardGuardrails, ...profile.hardGuardrails.filter(
      (g) => !industry.hardGuardrails.find((ig) => ig.id === g.id),
    )],
    standardsMappings:   industry.standardsMappings,
    metricDefinitions:   industry.defaultMetricDefinitions,
    runbookCategories:   industry.defaultRunbookCategories,
    workerCategories:    industry.defaultWorkerCategories,
    connectorCategories: industry.defaultConnectorCategories,
    topologyNodeTypes:   industry.topologyNodeTypes,
    glossary:            industry.glossary,
    sourceSystemAliases: profile.sourceSystemAliases,

    readinessCategories:         industry.readinessCategories         ?? [],
    communicationsAudiences:     industry.communicationsAudiences     ?? [],
    designerTemplates:           industry.designerTemplates           ?? [],
    toilCategories:              industry.toilCategories              ?? [],
    postmortemFactorCategories:  industry.postmortemFactorCategories  ?? [],
    scenarioInjections:          industry.scenarioInjections          ?? [],

    narrationTemplates: NARRATION_BY_INDUSTRY[industry.code],
  };
}
