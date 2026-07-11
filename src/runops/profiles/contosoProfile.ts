/**
 * Contoso Global — the existing reference tenant. This module wraps the
 * canonical fixtures from src/runops/data/scenario.ts as a
 * TenantProfileRecord so it flows through the same profile-driven pipeline
 * as the new industry tenants. All existing behavior is preserved.
 */

import {
  changesList as contosoChangesList,
  components as contosoComponents,
  connectors as contosoConnectors,
  digitalWorkers as contosoWorkers,
  evidenceItems as contosoEvidence,
  executionsList as contosoExecutionsList,
  knowledgeItems as contosoKnowledge,
  problemsList as contosoProblems,
  primaryApproval as contosoApproval,
  primaryChange as contosoChange,
  primaryExecution as contosoExecution,
  primaryIncident as contosoIncident,
  primaryPostmortemId as contosoPostmortemId,
  primaryProblemId as contosoProblemId,
  primaryRunbook as contosoRunbook,
  runbooksList as contosoRunbooksList,
  scenarioStages as sharedScenarioStages,
  services as contosoServices,
  slos as contosoSlos,
} from "@/runops/data/scenario";
import type { Tenant } from "@/runops/data/scenario";
import { genericEnterpriseIndustry } from "./industryProfiles";
import type { TenantFixtureBundle, TenantOperationalProfile, TenantProfileRecord } from "./types";

export const contosoTenant: Tenant = { id: "tenant-contoso", name: "Contoso Global" };

export const contosoProfile: TenantOperationalProfile = {
  tenantId: contosoTenant.id,
  industryProfileId: genericEnterpriseIndustry.id,
  displayName: "Contoso Global",
  shortName: "Contoso",
  industry: "generic-enterprise",
  businessDescription:
    "Global enterprise operating a portfolio of customer-facing and internal digital services. Used as the NOVA reference tenant.",
  operatingModel: "Federated product engineering with a central platform organization.",
  operatingHours: "24×7",
  geographicScope: "Global",
  defaultServiceId: "svc-global-order-processing",
  defaultScenarioId: "scenario-contoso-primary",
  defaultStoryId: "story-contoso-checkout-latency",
  defaultEnvironment: "Production",
  defaultRegion: "US Central",
  defaultTimeRange: "1h",
  tenantAccent: "slate",
  dataClassification: "Reference / demonstration",
  complianceContext: ["SOC 2", "ISO/IEC 27001"],
  operationalPriorities: ["Customer experience", "Revenue path reliability", "Change safety"],
  hardGuardrails: genericEnterpriseIndustry.hardGuardrails,
  terminologyOverrides: {},
  scenarioMode: "demonstration",
  syntheticDataNotice:
    "Reference demonstration data. Not derived from any real customer system.",
  sourceSystemAliases: [
    { id: "ssa-otel",  systemName: "OpenTelemetry Collector", aliasIn: "Observability", purpose: "Traces and metrics ingest" },
    { id: "ssa-prom",  systemName: "Prometheus",               aliasIn: "Observability", purpose: "SLI metrics" },
    { id: "ssa-snow",  systemName: "ServiceNow ITSM",          aliasIn: "ITSM",           purpose: "Incident and change records" },
  ],
  profileVersion: "1.0.0",
  profileState: "Active",
};

export const contosoBundle: TenantFixtureBundle = {
  tenant: contosoTenant,
  services: contosoServices,
  components: contosoComponents,
  digitalWorkers: contosoWorkers,
  slos: contosoSlos,
  connectors: contosoConnectors,
  runbooksList: contosoRunbooksList,
  changesList: contosoChangesList,
  knowledgeItems: contosoKnowledge,
  evidenceItems: contosoEvidence,
  problemsList: contosoProblems,
  scenarioStages: sharedScenarioStages,
  primaryIncident: contosoIncident,
  primaryChange: contosoChange,
  primaryRunbook: contosoRunbook,
  primaryExecution: contosoExecution,
  primaryApproval: contosoApproval,
  primaryProblemId: contosoProblemId,
  primaryPostmortemId: contosoPostmortemId,
  executionsList: contosoExecutionsList,
  initialAuditLog: [
    { id: "AUD-1", at: "10:14 CT", actor: "system",   action: "incident.declared",  target: contosoIncident.id, detail: "SEV 1 declared" },
    { id: "AUD-2", at: "10:19 CT", actor: "DW-DB-03", action: "hypothesis.raised",   target: contosoIncident.id, detail: "Database wait time dominant" },
    { id: "AUD-3", at: "10:23 CT", actor: "DW-IC-01", action: "approval.requested",  target: contosoApproval.id, detail: "Revert CHG-20391" },
  ],
  initialNotifications: [
    { id: "N-1", at: "10:14 CT", kind: "critical", title: "SEV 1 declared",         detail: "INC-10482 · Global Order Processing", entityRef: "INC-10482", route: "/runops/incidents/INC-10482" },
    { id: "N-2", at: "10:19 CT", kind: "warning",  title: "SLO burn accelerated",   detail: "Availability window · US Central",    entityRef: "SLO-GOP-AV", route: "/runops/reliability/slos" },
    { id: "N-3", at: "10:23 CT", kind: "info",     title: "Approval requested",      detail: "APR-4471 · RB-0042",                  entityRef: "APR-4471", route: "/runops/approvals" },
  ],
};

export const contosoRecord: TenantProfileRecord = {
  profile: contosoProfile,
  industry: genericEnterpriseIndustry,
  bundle: contosoBundle,
};
