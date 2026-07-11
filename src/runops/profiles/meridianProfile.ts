/**
 * Meridian University Health — Healthcare AMC demonstration tenant.
 * ALL data is synthetic. No PHI. No connectors to real clinical systems.
 */

import type {
  Approval, BusinessService, Change, Component, Connector, DigitalWorker,
  EvidenceItem, Execution, Incident, KnowledgeItem, Problem, Runbook,
  ScenarioStage, Slo, Tenant,
} from "@/runops/data/scenario";
import { healthcareAmcIndustry } from "./industryProfiles";
import type { TenantFixtureBundle, TenantOperationalProfile, TenantProfileRecord } from "./types";

export const meridianTenant: Tenant = {
  id: "tenant-healthcare-amc",
  name: "Meridian University Health",
};

const services: BusinessService[] = [
  {
    id: "svc-meridian-ehr", name: "Enterprise EHR (Order Entry & Documentation)",
    tier: "Tier 1", environment: "Production", region: "US Central", health: "Degraded",
    sloAvailability: 99.95, sloLatencyMs: 900, errorBudgetRemaining: 34,
    componentIds: ["cmp-mer-ehr-web", "cmp-mer-ehr-app", "cmp-mer-ehr-db", "cmp-mer-mpi", "cmp-mer-iam"],
  },
  {
    id: "svc-meridian-interface-engine", name: "HL7/FHIR Interface Engine",
    tier: "Tier 1", environment: "Production", region: "US Central", health: "Severely Degraded",
    sloAvailability: 99.9, sloLatencyMs: 500, errorBudgetRemaining: 12,
    componentIds: ["cmp-mer-hl7-engine", "cmp-mer-hl7-queue", "cmp-mer-adt-router"],
  },
  {
    id: "svc-meridian-pacs", name: "Imaging (PACS) Retrieval",
    tier: "Tier 1", environment: "Production", region: "US Central", health: "At Risk",
    sloAvailability: 99.9, sloLatencyMs: 1200, errorBudgetRemaining: 58,
    componentIds: ["cmp-mer-pacs-gw", "cmp-mer-pacs-store"],
  },
  {
    id: "svc-meridian-patient-portal", name: "Patient Portal",
    tier: "Tier 2", environment: "Production", region: "US Central", health: "Healthy",
    sloAvailability: 99.5, sloLatencyMs: 1500, errorBudgetRemaining: 78,
    componentIds: ["cmp-mer-portal-web", "cmp-mer-iam"],
  },
  {
    id: "svc-meridian-medadmin", name: "Medication Administration (BCMA)",
    tier: "Tier 1", environment: "Production", region: "US Central", health: "Healthy",
    sloAvailability: 99.99, sloLatencyMs: 600, errorBudgetRemaining: 92,
    componentIds: ["cmp-mer-bcma-app", "cmp-mer-bcma-db"],
  },
];

const components: Component[] = [
  { id: "cmp-mer-ehr-web",     name: "EHR Web Front End",       kind: "api",      health: "Healthy" },
  { id: "cmp-mer-ehr-app",     name: "EHR Application Tier",    kind: "compute",  health: "At Risk" },
  { id: "cmp-mer-ehr-db",      name: "EHR Clinical DB",         kind: "database", health: "Degraded" },
  { id: "cmp-mer-mpi",         name: "Master Patient Index",    kind: "identity", health: "Healthy" },
  { id: "cmp-mer-iam",         name: "Clinician SSO",           kind: "identity", health: "Healthy" },
  { id: "cmp-mer-hl7-engine",  name: "HL7 Interface Engine",    kind: "compute",  health: "Severely Degraded" },
  { id: "cmp-mer-hl7-queue",   name: "HL7 Message Queue",       kind: "queue",    health: "Severely Degraded" },
  { id: "cmp-mer-adt-router",  name: "ADT Message Router",      kind: "network",  health: "Degraded" },
  { id: "cmp-mer-pacs-gw",     name: "PACS Query Gateway",      kind: "api",      health: "At Risk" },
  { id: "cmp-mer-pacs-store",  name: "Imaging Object Store",    kind: "database", health: "Healthy" },
  { id: "cmp-mer-portal-web",  name: "Patient Portal Web",      kind: "api",      health: "Healthy" },
  { id: "cmp-mer-bcma-app",   name: "BCMA App Tier",             kind: "compute",  health: "Healthy" },
  { id: "cmp-mer-bcma-db",    name: "BCMA Data Store",           kind: "database", health: "Healthy" },
];

const digitalWorkers: DigitalWorker[] = [
  { id: "DW-CTC-01",  name: "DW-CTC-01",  role: "Clinical Technology Commander", autonomy: "Human Guided",             status: "Investigating" },
  { id: "DW-EHR-02",  name: "DW-EHR-02",  role: "EHR SRE",                       autonomy: "AI Recommended",           status: "Investigating" },
  { id: "DW-HL7-03",  name: "DW-HL7-03",  role: "Interface Engine SRE",          autonomy: "AI Recommended",           status: "Recommending"  },
  { id: "DW-PACS-04", name: "DW-PACS-04", role: "Imaging Systems SRE",           autonomy: "AI Recommended",           status: "Idle"          },
  { id: "DW-IAM-05",  name: "DW-IAM-05",  role: "Identity/Access SRE",           autonomy: "AI Recommended",           status: "Idle"          },
  { id: "DW-COMMS-06",name: "DW-COMMS-06",role: "Clinical Communications",       autonomy: "Human Initiated Automation", status: "Idle"        },
  { id: "DW-DOWN-07", name: "DW-DOWN-07", role: "Downtime Procedure Coordinator", autonomy: "Human Guided",            status: "Idle"          },
  { id: "DW-INFO-08", name: "DW-INFO-08", role: "Clinical Informatics Liaison",  autonomy: "Documentation Only",       status: "Idle"          },
];

const primaryIncident: Incident = {
  id: "INC-MER-2044",
  title: "ADT message backlog impacting registration and downstream ancillaries",
  severity: "SEV 1",
  state: "Investigating",
  serviceId: "svc-meridian-interface-engine",
  openedAt: "07:41 CT",
  commander: "DW-CTC-01",
  summary:
    "ADT^A01/A04 message throughput fell to ~12% of baseline at 07:29 following overnight interface-engine patch. Queue depth is 42,000 and growing. Downstream lab, radiology, and pharmacy systems are receiving stale demographics. No PHI exposed in this demonstration.",
  findings: [
    "Interface-engine patch completed 06:58 CT (change CHG-MER-8871).",
    "ADT throughput degraded starting 07:29 CT.",
    "Queue depth reached 42,000 messages by 07:39 CT.",
    "Downstream ancillaries flagged stale patient demographics.",
    "Downtime procedure not yet activated; clinical continuity currently maintained.",
    "Most appropriate mitigation: revert interface-engine patch and drain queue in supervised batches.",
    "Fallback: activate registration downtime procedure per policy.",
  ],
};

const primaryChange: Change = {
  id: "CHG-MER-8871",
  title: "Interface engine 4.9.2 security patch",
  deployedAt: "06:58 CT",
  serviceId: "svc-meridian-interface-engine",
  linkedIncidentId: primaryIncident.id,
  risk: "Medium",
};

const primaryRunbook: Runbook = {
  id: "RB-MER-101",
  title: "Interface Engine ADT Backlog Recovery",
  version: "v2.0",
  state: "Certified",
  autonomy: "Approval Gated Automation",
  serviceId: "svc-meridian-interface-engine",
  fitnessScore: 84,
  steps: [
    { key: "s1", label: "Confirm ADT backlog signature",       description: "Correlate queue depth, throughput, and downstream ADT lag with the recent interface-engine change.", kind: "diagnose" },
    { key: "s2", label: "Assess clinical continuity risk",      description: "Coordinate with the on-call clinical informatics liaison to determine whether downtime procedure activation is required.", kind: "diagnose" },
    { key: "s3", label: "Revert interface-engine patch",        description: "Rollback CHG-MER-8871 to the last-known-good build under supervised change control.", kind: "mitigate" },
    { key: "s4", label: "Drain queue in supervised batches",    description: "Release ADT messages downstream in bounded batches, verifying ancillary acknowledgments.", kind: "mitigate" },
    { key: "s5", label: "Validate downstream ancillary receipt", description: "Confirm lab, radiology, and pharmacy systems reflect current demographics for control cohort.", kind: "validate" },
    { key: "s6", label: "Fallback: activate registration downtime procedure", description: "If validation fails, activate the registration downtime procedure per Meridian policy.", kind: "rollback" },
  ],
};

const primaryExecution: Execution = {
  id: "EXE-MER-441",
  runbookId: primaryRunbook.id,
  incidentId: primaryIncident.id,
  state: "Awaiting Approval",
  approvalId: "APR-MER-221",
};

const primaryApproval: Approval = {
  id: "APR-MER-221",
  runbookId: primaryRunbook.id,
  executionId: primaryExecution.id,
  requestedBy: "DW-CTC-01",
  requestedAt: "07:52 CT",
  state: "Pending",
  reason: "Approval-gated automation: revert interface-engine patch and drain ADT queue in supervised batches. Requires clinical informatics acknowledgment.",
};

const slos: Slo[] = [
  { id: "SLO-MER-EHR-AV", serviceId: "svc-meridian-ehr",               name: "EHR availability",             target: 99.95, current: 99.82, errorBudgetRemaining: 34, window: "28d" },
  { id: "SLO-MER-EHR-LT", serviceId: "svc-meridian-ehr",               name: "Order-entry save p95 <900ms",  target: 99.0,  current: 95.6,  errorBudgetRemaining: 41, window: "28d" },
  { id: "SLO-MER-HL7-AV", serviceId: "svc-meridian-interface-engine", name: "ADT delivery availability",     target: 99.9,  current: 88.3,  errorBudgetRemaining: 12, window: "28d" },
  { id: "SLO-MER-PACS-AV",serviceId: "svc-meridian-pacs",             name: "Imaging retrieval availability", target: 99.9, current: 99.7,  errorBudgetRemaining: 58, window: "28d" },
];

const connectors: Connector[] = [
  { id: "CON-MER-OTEL",   name: "OpenTelemetry Collector (synthetic)",    kind: "Observability", status: "Healthy",   freshness: "10s ago" },
  { id: "CON-MER-PROM",   name: "Prometheus (synthetic)",                  kind: "Observability", status: "Healthy",   freshness: "15s ago" },
  { id: "CON-MER-ITSM",   name: "Clinical ITSM (simulated)",               kind: "ITSM",          status: "Healthy",   freshness: "35s ago" },
  { id: "CON-MER-CHAT",   name: "Clinical Ops Chat (simulated)",           kind: "Chat",          status: "Healthy",   freshness: "8s ago"  },
  { id: "CON-MER-IE",     name: "Interface Engine Telemetry (simulated)",  kind: "Data",          status: "Degraded",  freshness: "45s ago" },
  { id: "CON-MER-PACS",   name: "PACS Gateway Telemetry (simulated)",      kind: "Data",          status: "Healthy",   freshness: "1m ago"  },
];

const runbooksList: Runbook[] = [
  primaryRunbook,
  { id: "RB-MER-104", title: "EHR Order-Entry Latency Recovery", version: "v1.3", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-meridian-ehr", fitnessScore: 79, steps: [] },
  { id: "RB-MER-110", title: "PACS Retrieval Failover",           version: "v1.1", state: "Published", autonomy: "Human Guided",              serviceId: "svc-meridian-pacs", fitnessScore: 72, steps: [] },
  { id: "RB-MER-120", title: "Registration Downtime Procedure Activation", version: "v3.0", state: "Certified", autonomy: "Human Guided", serviceId: "svc-meridian-interface-engine", fitnessScore: 88, steps: [] },
];

const changesList: Change[] = [
  primaryChange,
  { id: "CHG-MER-8868", title: "EHR app-tier hotfix rollout",      deployedAt: "yesterday", serviceId: "svc-meridian-ehr",   risk: "Low"  },
  { id: "CHG-MER-8865", title: "PACS gateway TLS rotation",         deployedAt: "2d ago",     serviceId: "svc-meridian-pacs",  risk: "Low"  },
];

const knowledgeItems: KnowledgeItem[] = [
  { id: "K-MER-RB-101", title: "RB-MER-101 · Interface Engine ADT Backlog Recovery", kind: "Runbook",   serviceId: "svc-meridian-interface-engine", source: "runbook-library", freshness: "5m ago",  snippet: "Approval-gated rollback and supervised queue drain." },
  { id: "K-MER-KE-33",  title: "KE-33 · Post-patch throughput regressions on interface engine", kind: "Known Error", serviceId: "svc-meridian-interface-engine", source: "knowledge-base", freshness: "1d ago", snippet: "Known post-patch throughput regressions and validation gates." },
  { id: "K-MER-PB-DT",  title: "Playbook · Registration downtime procedure",           kind: "Playbook",  serviceId: "svc-meridian-interface-engine", source: "knowledge-base",  freshness: "3d ago",  snippet: "Trigger conditions and clinician communications for registration downtime." },
];

const evidenceItems: EvidenceItem[] = [
  { id: "EV-MER-201", title: "Interface engine queue depth trend", source: "Interface engine (synthetic)", capturedAt: "07:45 CT", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-MER-202", title: "CHG-MER-8871 change record",         source: "ITSM (simulated)",            capturedAt: "06:58 CT", incidentId: primaryIncident.id, kind: "change" },
  { id: "EV-MER-203", title: "ADT throughput histogram",           source: "Prometheus (synthetic)",       capturedAt: "07:38 CT", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-MER-204", title: "Downstream ancillary lag log",       source: "Loki (synthetic)",             capturedAt: "07:40 CT", incidentId: primaryIncident.id, kind: "log"    },
];

const problemsList: Problem[] = [
  { id: "PRB-MER-77", title: "Interface engine throughput regression after patch cycles", state: "Investigating", serviceId: "svc-meridian-interface-engine" },
  { id: "PRB-MER-72", title: "EHR order-entry latency spikes at shift change",             state: "Open",          serviceId: "svc-meridian-ehr" },
];

const scenarioStages: ScenarioStage[] = [
  { index: 0, label: "Baseline clinical operations" },
  { index: 1, label: "Interface engine patch completes" },
  { index: 2, label: "ADT throughput degradation begins" },
  { index: 3, label: "Downstream ancillaries flag stale demographics" },
  { index: 4, label: "SEV 1 clinical technology incident declared" },
  { index: 5, label: "Digital workers investigate" },
  { index: 6, label: "Patch-regression hypothesis becomes dominant" },
  { index: 7, label: "Mitigation options compared with clinical informatics" },
  { index: 8, label: "Runbook execution requested" },
  { index: 9, label: "Clinical informatics acknowledgment requested" },
  { index: 10, label: "Execution begins" },
  { index: 11, label: "Queue drain proceeds under supervision" },
  { index: 12, label: "Downstream ancillaries confirm current demographics" },
  { index: 13, label: "ADT throughput restored to baseline" },
  { index: 14, label: "Downtime procedure remains unactivated" },
  { index: 15, label: "Incident resolves" },
  { index: 16, label: "Postmortem opens" },
  { index: 17, label: "Runbook improvement proposed" },
  { index: 18, label: "New runbook version certified" },
];

const executionsList: (Execution & { title: string })[] = [
  { ...primaryExecution, title: "Interface engine patch rollback and supervised drain" },
  { id: "EXE-MER-430", runbookId: "RB-MER-104", incidentId: "INC-MER-2010", state: "Completed", title: "EHR order-entry latency mitigation rehearsal" },
  { id: "EXE-MER-425", runbookId: "RB-MER-110", incidentId: "INC-MER-2005", state: "Completed", title: "PACS retrieval failover rehearsal" },
];

export const meridianProfile: TenantOperationalProfile = {
  tenantId: meridianTenant.id,
  industryProfileId: healthcareAmcIndustry.id,
  displayName: "Meridian University Health",
  shortName: "Meridian",
  industry: "healthcare-amc",
  businessDescription:
    "Fictional 900-bed academic medical center with an integrated ambulatory network. Operates a shared EHR, HL7/FHIR interface engine, PACS, patient portal, and medication administration platform.",
  operatingModel: "Central clinical technology team supported by service-owner teams for EHR, imaging, and patient access.",
  operatingHours: "24×7 clinical operations",
  geographicScope: "Regional (single US state)",
  defaultServiceId: "svc-meridian-interface-engine",
  defaultScenarioId: "scenario-meridian-adt-backlog",
  defaultStoryId: "story-meridian-adt-backlog",
  defaultEnvironment: "Production",
  defaultRegion: "US Central",
  defaultTimeRange: "1h",
  tenantAccent: "teal",
  dataClassification: "Synthetic demonstration — no PHI",
  complianceContext: ["HIPAA (mapping only)", "HITRUST CSF (mapping only)", "Joint Commission IM standards (mapping only)"],
  operationalPriorities: ["Patient safety", "Clinical continuity", "Data integrity", "Privacy"],
  hardGuardrails: healthcareAmcIndustry.hardGuardrails,
  terminologyOverrides: {
    incident: "Clinical technology incident",
    approval: "Clinical informatics acknowledgment",
  },
  scenarioMode: "demonstration",
  syntheticDataNotice:
    "Synthetic demonstration data. No PHI. No live clinical system integrations. Not a live customer environment.",
  sourceSystemAliases: [
    { id: "ssa-mer-ie",   systemName: "Interface engine (simulated)", aliasIn: "HL7 telemetry",         purpose: "ADT/ORU/ORM routing" },
    { id: "ssa-mer-mpi",  systemName: "MPI (simulated)",              aliasIn: "Identity",               purpose: "Patient identity resolution" },
    { id: "ssa-mer-pacs", systemName: "PACS (simulated)",             aliasIn: "Imaging",                purpose: "Study retrieval" },
  ],
  profileVersion: "1.0.0",
  profileState: "Active",
};

export const meridianBundle: TenantFixtureBundle = {
  tenant: meridianTenant,
  services, components, digitalWorkers, slos, connectors,
  runbooksList, changesList, knowledgeItems, evidenceItems, problemsList,
  scenarioStages,
  primaryIncident, primaryChange, primaryRunbook, primaryExecution, primaryApproval,
  primaryProblemId: "PRB-MER-77",
  primaryPostmortemId: "PM-MER-2044",
  executionsList,
  initialAuditLog: [
    { id: "AUD-MER-1", at: "07:41 CT", actor: "system",     action: "incident.declared",  target: primaryIncident.id, detail: "SEV 1 declared" },
    { id: "AUD-MER-2", at: "07:47 CT", actor: "DW-HL7-03",  action: "hypothesis.raised",   target: primaryIncident.id, detail: "Post-patch throughput regression" },
    { id: "AUD-MER-3", at: "07:52 CT", actor: "DW-CTC-01",  action: "approval.requested",  target: primaryApproval.id, detail: "Revert CHG-MER-8871" },
  ],
  initialNotifications: [
    { id: "N-MER-1", at: "07:41 CT", kind: "critical", title: "SEV 1 clinical technology incident", detail: `${primaryIncident.id} · Interface engine`, entityRef: primaryIncident.id, route: `/runops/incidents/${primaryIncident.id}` },
    { id: "N-MER-2", at: "07:47 CT", kind: "warning",  title: "Reliability tolerance burn",         detail: "ADT delivery objective · US Central",       entityRef: "SLO-MER-HL7-AV", route: "/runops/reliability/slos" },
    { id: "N-MER-3", at: "07:52 CT", kind: "info",     title: "Clinical informatics acknowledgment requested", detail: `${primaryApproval.id} · ${primaryRunbook.id}`, entityRef: primaryApproval.id, route: "/runops/approvals" },
  ],
};

export const meridianRecord: TenantProfileRecord = {
  profile: meridianProfile,
  industry: healthcareAmcIndustry,
  bundle: meridianBundle,
};
