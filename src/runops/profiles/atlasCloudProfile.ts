/**
 * AtlasCloud Production — SaaS Production demonstration tenant. Synthetic.
 */

import type {
  Approval, BusinessService, Change, Component, Connector, DigitalWorker,
  EvidenceItem, Execution, Incident, KnowledgeItem, Problem, Runbook,
  ScenarioStage, Slo, Tenant,
} from "@/runops/data/scenario";
import { saasProductionIndustry } from "./industryProfiles";
import type { TenantFixtureBundle, TenantOperationalProfile, TenantProfileRecord } from "./types";

export const atlasCloudTenant: Tenant = {
  id: "tenant-saas-production",
  name: "AtlasCloud Production",
};

const services: BusinessService[] = [
  {
    id: "svc-atlas-edge", name: "Customer Edge (API Gateway)",
    tier: "Tier 1", environment: "Production", region: "US East", health: "Degraded",
    sloAvailability: 99.95, sloLatencyMs: 200, errorBudgetRemaining: 38,
    componentIds: ["cmp-atlas-edge-lb", "cmp-atlas-edge-gw", "cmp-atlas-authz"],
  },
  {
    id: "svc-atlas-ingest", name: "Event Ingestion Pipeline",
    tier: "Tier 1", environment: "Production", region: "US East", health: "Severely Degraded",
    sloAvailability: 99.9, sloLatencyMs: 300, errorBudgetRemaining: 9,
    componentIds: ["cmp-atlas-ingest-api", "cmp-atlas-stream", "cmp-atlas-ingest-workers"],
  },
  {
    id: "svc-atlas-checkout", name: "Checkout & Billing",
    tier: "Tier 1", environment: "Production", region: "US East", health: "At Risk",
    sloAvailability: 99.99, sloLatencyMs: 800, errorBudgetRemaining: 71,
    componentIds: ["cmp-atlas-checkout-api", "cmp-atlas-billing-db", "cmp-atlas-payment-vendor"],
  },
  {
    id: "svc-atlas-control-plane", name: "Control Plane",
    tier: "Tier 1", environment: "Production", region: "US East", health: "Healthy",
    sloAvailability: 99.95, sloLatencyMs: 400, errorBudgetRemaining: 82,
    componentIds: ["cmp-atlas-cp-api", "cmp-atlas-cp-db"],
  },
  {
    id: "svc-atlas-auth", name: "Identity & Tenant Isolation",
    tier: "Tier 1", environment: "Production", region: "US East", health: "Healthy",
    sloAvailability: 99.99, sloLatencyMs: 150, errorBudgetRemaining: 88,
    componentIds: ["cmp-atlas-authz", "cmp-atlas-idp"],
  },
];

const components: Component[] = [
  { id: "cmp-atlas-edge-lb",         name: "Edge Load Balancer",       kind: "network",  health: "Healthy" },
  { id: "cmp-atlas-edge-gw",         name: "API Gateway",               kind: "api",      health: "Degraded" },
  { id: "cmp-atlas-authz",           name: "Authorization Service",     kind: "identity", health: "Healthy" },
  { id: "cmp-atlas-idp",             name: "Identity Provider",         kind: "identity", health: "Healthy" },
  { id: "cmp-atlas-ingest-api",      name: "Ingest API",                kind: "api",      health: "At Risk" },
  { id: "cmp-atlas-stream",          name: "Event Stream (Kafka)",       kind: "queue",    health: "Severely Degraded" },
  { id: "cmp-atlas-ingest-workers",  name: "Ingest Workers",            kind: "compute",  health: "At Risk" },
  { id: "cmp-atlas-checkout-api",    name: "Checkout API",              kind: "api",      health: "At Risk" },
  { id: "cmp-atlas-billing-db",      name: "Billing DB",                kind: "database", health: "Healthy" },
  { id: "cmp-atlas-payment-vendor",  name: "Payment Vendor",            kind: "vendor",   health: "Healthy" },
  { id: "cmp-atlas-cp-api",          name: "Control Plane API",         kind: "api",      health: "Healthy" },
  { id: "cmp-atlas-cp-db",           name: "Control Plane DB",          kind: "database", health: "Healthy" },
];

const digitalWorkers: DigitalWorker[] = [
  { id: "DW-ATL-IC-01",   name: "DW-ATL-IC-01",   role: "Incident Commander",    autonomy: "Human Guided",             status: "Investigating" },
  { id: "DW-ATL-EDGE-02", name: "DW-ATL-EDGE-02", role: "Edge SRE",              autonomy: "AI Recommended",           status: "Recommending"  },
  { id: "DW-ATL-STR-03",  name: "DW-ATL-STR-03",  role: "Stream Platform SRE",   autonomy: "AI Recommended",           status: "Investigating" },
  { id: "DW-ATL-INGEST-04", name: "DW-ATL-INGEST-04", role: "Ingestion SRE",     autonomy: "AI Recommended",           status: "Recommending"  },
  { id: "DW-ATL-CHG-05",  name: "DW-ATL-CHG-05",  role: "Change Risk Analyst",   autonomy: "AI Recommended",           status: "Recommending"  },
  { id: "DW-ATL-SEC-06",  name: "DW-ATL-SEC-06",  role: "Security Operations",   autonomy: "Approval Gated Automation", status: "Idle"          },
  { id: "DW-ATL-COMMS-07",name: "DW-ATL-COMMS-07",role: "Customer Communications", autonomy: "Human Initiated Automation", status: "Idle"      },
];

const primaryIncident: Incident = {
  id: "INC-ATL-3125",
  title: "Ingestion pipeline consumer backpressure — customer data freshness at risk",
  severity: "SEV 1",
  state: "Investigating",
  serviceId: "svc-atlas-ingest",
  openedAt: "14:02 UTC",
  commander: "DW-ATL-IC-01",
  summary:
    "Consumer lag on the customer-event stream rose from ~3s to 320s starting 13:47 UTC after ingest-worker rollout CHG-ATL-9902. Approximately 18% of customer tenants observing stale dashboards. No security-control bypass observed.",
  findings: [
    "Ingest-worker canary rollout CHG-ATL-9902 promoted to 25% at 13:41 UTC.",
    "Consumer lag on primary partitions began growing at 13:47 UTC.",
    "Worker CPU nominal; deserialization spans doubled in tracing.",
    "Tenant isolation invariants intact — no cross-tenant reads observed.",
    "Most appropriate mitigation: progressive rollback of CHG-ATL-9902 to last-known-good.",
    "Fallback: scale-out consumer group and hold rollout at 25% until validation.",
  ],
};

const primaryChange: Change = {
  id: "CHG-ATL-9902",
  title: "Ingest worker deserialization refactor",
  deployedAt: "13:41 UTC",
  serviceId: "svc-atlas-ingest",
  linkedIncidentId: primaryIncident.id,
  risk: "Medium",
};

const primaryRunbook: Runbook = {
  id: "RB-ATL-201",
  title: "Ingestion Consumer Lag — Progressive Rollback",
  version: "v3.1",
  state: "Certified",
  autonomy: "Approval Gated Automation",
  serviceId: "svc-atlas-ingest",
  fitnessScore: 89,
  steps: [
    { key: "s1", label: "Confirm lag signature",             description: "Correlate consumer lag with recent ingest-worker rollout and deserialization span latency.", kind: "diagnose" },
    { key: "s2", label: "Verify tenant isolation invariants", description: "Confirm no cross-tenant reads or writes are occurring during degraded consumers.",           kind: "diagnose" },
    { key: "s3", label: "Progressive rollback",              description: "Roll rollout back from 25% to 0% under feature-flag control.",                              kind: "mitigate" },
    { key: "s4", label: "Scale-out consumer group",           description: "Temporarily scale consumer group to absorb backlog.",                                       kind: "mitigate" },
    { key: "s5", label: "Validate lag recovery",              description: "Verify consumer lag returns below SLI threshold across all customer partitions.",           kind: "validate" },
    { key: "s6", label: "Fallback: hold at 25% and reissue canary", description: "If rollback fails, hold the fleet at 25% and reissue a smaller canary for the fix.",  kind: "rollback" },
  ],
};

const primaryExecution: Execution = {
  id: "EXE-ATL-661",
  runbookId: primaryRunbook.id,
  incidentId: primaryIncident.id,
  state: "Awaiting Approval",
  approvalId: "APR-ATL-331",
};

const primaryApproval: Approval = {
  id: "APR-ATL-331",
  runbookId: primaryRunbook.id,
  executionId: primaryExecution.id,
  requestedBy: "DW-ATL-IC-01",
  requestedAt: "14:11 UTC",
  state: "Pending",
  reason: "Approval-gated automation: progressive rollback of CHG-ATL-9902 and consumer scale-out. Security-control bypass explicitly prohibited.",
};

const slos: Slo[] = [
  { id: "SLO-ATL-EDGE-AV",  serviceId: "svc-atlas-edge",     name: "Edge availability",             target: 99.95, current: 99.71, errorBudgetRemaining: 38, window: "28d" },
  { id: "SLO-ATL-INGEST-AV",serviceId: "svc-atlas-ingest",   name: "Ingest availability",           target: 99.9,  current: 98.4,  errorBudgetRemaining: 9,  window: "28d" },
  { id: "SLO-ATL-INGEST-LAG", serviceId: "svc-atlas-ingest", name: "Consumer lag < 30s",            target: 99.0,  current: 82.0,  errorBudgetRemaining: 5,  window: "28d" },
  { id: "SLO-ATL-CO-AV",    serviceId: "svc-atlas-checkout", name: "Checkout availability",         target: 99.99, current: 99.98, errorBudgetRemaining: 71, window: "28d" },
];

const connectors: Connector[] = [
  { id: "CON-ATL-OTEL", name: "OpenTelemetry Collector (synthetic)", kind: "Observability", status: "Healthy",   freshness: "8s ago"  },
  { id: "CON-ATL-PROM", name: "Prometheus (synthetic)",              kind: "Observability", status: "Healthy",   freshness: "10s ago" },
  { id: "CON-ATL-FF",   name: "Feature Flag Service (simulated)",     kind: "Change",        status: "Healthy",   freshness: "20s ago" },
  { id: "CON-ATL-ITSM", name: "ITSM (simulated)",                     kind: "ITSM",          status: "Healthy",   freshness: "40s ago" },
  { id: "CON-ATL-CHAT", name: "Ops Chat (simulated)",                 kind: "Chat",          status: "Healthy",   freshness: "6s ago"  },
  { id: "CON-ATL-KAFKA",name: "Stream Broker Telemetry (simulated)",  kind: "Data",          status: "Degraded",  freshness: "30s ago" },
];

const runbooksList: Runbook[] = [
  primaryRunbook,
  { id: "RB-ATL-210", title: "Edge Gateway Regional Traffic Shift", version: "v2.4", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-atlas-edge",     fitnessScore: 86, steps: [] },
  { id: "RB-ATL-220", title: "Checkout Provider Fallback",           version: "v1.8", state: "Published", autonomy: "Approval Gated Automation", serviceId: "svc-atlas-checkout", fitnessScore: 77, steps: [] },
  { id: "RB-ATL-230", title: "Control Plane Read Replica Failover",  version: "v1.1", state: "Approved",  autonomy: "Human Guided",              serviceId: "svc-atlas-control-plane", fitnessScore: 68, steps: [] },
];

const changesList: Change[] = [
  primaryChange,
  { id: "CHG-ATL-9898", title: "Edge WAF rule update",         deployedAt: "yesterday", serviceId: "svc-atlas-edge",     risk: "Low" },
  { id: "CHG-ATL-9890", title: "Checkout provider rotation",   deployedAt: "3d ago",     serviceId: "svc-atlas-checkout", risk: "Medium" },
];

const knowledgeItems: KnowledgeItem[] = [
  { id: "K-ATL-RB-201", title: "RB-ATL-201 · Ingestion Consumer Lag Rollback", kind: "Runbook",  serviceId: "svc-atlas-ingest", source: "runbook-library", freshness: "4m ago",  snippet: "Progressive rollback with tenant-isolation preserved." },
  { id: "K-ATL-PM-3010",title: "PM-ATL-3010 · Prior ingest lag postmortem",     kind: "Postmortem", serviceId: "svc-atlas-ingest", source: "knowledge-base", freshness: "2w ago",  snippet: "Consumer deserialization regression pattern." },
  { id: "K-ATL-KE-88",  title: "KE-88 · Stream backpressure on worker rollouts", kind: "Known Error", serviceId: "svc-atlas-ingest", source: "knowledge-base", freshness: "1d ago", snippet: "Symptoms and safe rollout strategy." },
];

const evidenceItems: EvidenceItem[] = [
  { id: "EV-ATL-301", title: "Consumer lag time series",       source: "Prometheus (synthetic)", capturedAt: "14:05 UTC", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-ATL-302", title: "CHG-ATL-9902 rollout record",    source: "Feature flag (simulated)", capturedAt: "13:41 UTC", incidentId: primaryIncident.id, kind: "change" },
  { id: "EV-ATL-303", title: "Deserialization span traces",    source: "OpenTelemetry (synthetic)", capturedAt: "13:58 UTC", incidentId: primaryIncident.id, kind: "trace"  },
  { id: "EV-ATL-304", title: "Tenant-isolation audit sample",  source: "Security audit (synthetic)", capturedAt: "14:07 UTC", incidentId: primaryIncident.id, kind: "log"    },
];

const problemsList: Problem[] = [
  { id: "PRB-ATL-58", title: "Recurring consumer backpressure on ingest-worker rollouts", state: "Investigating", serviceId: "svc-atlas-ingest" },
  { id: "PRB-ATL-52", title: "Edge WAF false positives after ruleset updates",             state: "Open",          serviceId: "svc-atlas-edge"   },
];

const scenarioStages: ScenarioStage[] = [
  { index: 0,  label: "Baseline production traffic" },
  { index: 1,  label: "Ingest-worker canary promoted to 25%" },
  { index: 2,  label: "Consumer lag begins growing" },
  { index: 3,  label: "Data-freshness SLO burn alert" },
  { index: 4,  label: "SEV 1 production incident declared" },
  { index: 5,  label: "Digital workers investigate" },
  { index: 6,  label: "Deserialization regression hypothesis dominant" },
  { index: 7,  label: "Rollback options compared" },
  { index: 8,  label: "Runbook execution requested" },
  { index: 9,  label: "Change-manager approval requested" },
  { index: 10, label: "Progressive rollback begins" },
  { index: 11, label: "Consumer group scaled out" },
  { index: 12, label: "Lag stabilizes on subset of partitions" },
  { index: 13, label: "Lag returns below SLI threshold" },
  { index: 14, label: "Customer dashboards freshness restored" },
  { index: 15, label: "Incident resolves" },
  { index: 16, label: "Postmortem opens" },
  { index: 17, label: "Runbook improvement proposed" },
  { index: 18, label: "New runbook version certified" },
];

const executionsList: (Execution & { title: string })[] = [
  { ...primaryExecution, title: "Progressive rollback of CHG-ATL-9902 and consumer scale-out" },
  { id: "EXE-ATL-650", runbookId: "RB-ATL-210", incidentId: "INC-ATL-3100", state: "Completed", title: "Edge regional traffic shift rehearsal" },
  { id: "EXE-ATL-640", runbookId: "RB-ATL-220", incidentId: "INC-ATL-3080", state: "Completed", title: "Checkout provider fallback rehearsal" },
];

export const atlasCloudProfile: TenantOperationalProfile = {
  tenantId: atlasCloudTenant.id,
  industryProfileId: saasProductionIndustry.id,
  displayName: "AtlasCloud Production",
  shortName: "AtlasCloud",
  industry: "saas-production",
  businessDescription:
    "Fictional multi-tenant B2B SaaS platform serving mid-market and enterprise customers with real-time analytics and integrations.",
  operatingModel: "Product-aligned teams with a central platform/SRE org running the ingestion and edge fleets.",
  operatingHours: "24×7 with follow-the-sun on-call",
  geographicScope: "Global (US East primary)",
  defaultServiceId: "svc-atlas-ingest",
  defaultScenarioId: "scenario-atlas-ingest-backpressure",
  defaultStoryId: "story-atlas-ingest-backpressure",
  defaultEnvironment: "Production",
  defaultRegion: "US East",
  defaultTimeRange: "1h",
  tenantAccent: "sky",
  dataClassification: "Synthetic demonstration — no customer data",
  complianceContext: ["SOC 2 (mapping only)", "ISO/IEC 27001 (mapping only)"],
  operationalPriorities: ["Customer availability", "Tenant isolation", "Data freshness", "Security"],
  hardGuardrails: saasProductionIndustry.hardGuardrails,
  terminologyOverrides: {},
  scenarioMode: "demonstration",
  syntheticDataNotice:
    "Synthetic demonstration data. No customer data. No live production integrations.",
  sourceSystemAliases: [
    { id: "ssa-atl-ff",     systemName: "Feature flag (simulated)",   aliasIn: "Change",      purpose: "Progressive rollout control" },
    { id: "ssa-atl-kafka",  systemName: "Stream broker (simulated)",  aliasIn: "Ingestion",    purpose: "Event stream telemetry" },
    { id: "ssa-atl-otel",   systemName: "OpenTelemetry (synthetic)",   aliasIn: "Observability", purpose: "Traces and metrics" },
  ],
  profileVersion: "1.0.0",
  profileState: "Active",
};

export const atlasCloudBundle: TenantFixtureBundle = {
  tenant: atlasCloudTenant,
  services, components, digitalWorkers, slos, connectors,
  runbooksList, changesList, knowledgeItems, evidenceItems, problemsList,
  scenarioStages,
  primaryIncident, primaryChange, primaryRunbook, primaryExecution, primaryApproval,
  primaryProblemId: "PRB-ATL-58",
  primaryPostmortemId: "PM-ATL-3125",
  executionsList,
  initialAuditLog: [
    { id: "AUD-ATL-1", at: "14:02 UTC", actor: "system",         action: "incident.declared", target: primaryIncident.id, detail: "SEV 1 declared" },
    { id: "AUD-ATL-2", at: "14:07 UTC", actor: "DW-ATL-STR-03",  action: "hypothesis.raised", target: primaryIncident.id, detail: "Deserialization regression" },
    { id: "AUD-ATL-3", at: "14:11 UTC", actor: "DW-ATL-IC-01",   action: "approval.requested", target: primaryApproval.id, detail: "Progressive rollback CHG-ATL-9902" },
  ],
  initialNotifications: [
    { id: "N-ATL-1", at: "14:02 UTC", kind: "critical", title: "SEV 1 production incident",        detail: `${primaryIncident.id} · Ingestion pipeline`, entityRef: primaryIncident.id, route: `/runops/incidents/${primaryIncident.id}` },
    { id: "N-ATL-2", at: "14:05 UTC", kind: "warning",  title: "Data-freshness SLO burn",           detail: "Consumer lag > 30s",                          entityRef: "SLO-ATL-INGEST-LAG", route: "/runops/reliability/slos" },
    { id: "N-ATL-3", at: "14:11 UTC", kind: "info",     title: "Change-manager approval requested", detail: `${primaryApproval.id} · ${primaryRunbook.id}`, entityRef: primaryApproval.id, route: "/runops/approvals" },
  ],
};

export const atlasCloudRecord: TenantProfileRecord = {
  profile: atlasCloudProfile,
  industry: saasProductionIndustry,
  bundle: atlasCloudBundle,
};
