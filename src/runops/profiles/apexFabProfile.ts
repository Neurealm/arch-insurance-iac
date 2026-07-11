/**
 * Apex Semiconductor Fab 12 — Chip Manufacturing demonstration tenant. Synthetic.
 */

import type {
  Approval, BusinessService, Change, Component, Connector, DigitalWorker,
  EvidenceItem, Execution, Incident, KnowledgeItem, Problem, Runbook,
  ScenarioStage, Slo, Tenant,
} from "@/runops/data/scenario";
import { chipManufacturingIndustry } from "./industryProfiles";
import type { TenantFixtureBundle, TenantOperationalProfile, TenantProfileRecord } from "./types";

export const apexFabTenant: Tenant = {
  id: "tenant-chip-manufacturing",
  name: "Apex Semiconductor Fab 12",
};

const services: BusinessService[] = [
  {
    id: "svc-apex-mes", name: "MES (Manufacturing Execution)",
    tier: "Tier 1", environment: "Production", region: "APAC", health: "Degraded",
    sloAvailability: 99.95, sloLatencyMs: 600, errorBudgetRemaining: 27,
    componentIds: ["cmp-apex-mes-app", "cmp-apex-mes-db", "cmp-apex-mes-bus"],
  },
  {
    id: "svc-apex-eap", name: "EAP (Equipment Automation)",
    tier: "Tier 1", environment: "Production", region: "APAC", health: "Severely Degraded",
    sloAvailability: 99.9, sloLatencyMs: 400, errorBudgetRemaining: 8,
    componentIds: ["cmp-apex-eap-gw", "cmp-apex-eap-orch", "cmp-apex-litho-ctrl"],
  },
  {
    id: "svc-apex-fdc", name: "FDC / SPC",
    tier: "Tier 1", environment: "Production", region: "APAC", health: "At Risk",
    sloAvailability: 99.9, sloLatencyMs: 500, errorBudgetRemaining: 44,
    componentIds: ["cmp-apex-fdc-eng", "cmp-apex-historian"],
  },
  {
    id: "svc-apex-rms", name: "Recipe Management",
    tier: "Tier 1", environment: "Production", region: "APAC", health: "Healthy",
    sloAvailability: 99.99, sloLatencyMs: 350, errorBudgetRemaining: 91,
    componentIds: ["cmp-apex-rms-app", "cmp-apex-rms-db"],
  },
  {
    id: "svc-apex-wip", name: "WIP Tracking & Dispatching",
    tier: "Tier 1", environment: "Production", region: "APAC", health: "At Risk",
    sloAvailability: 99.95, sloLatencyMs: 500, errorBudgetRemaining: 55,
    componentIds: ["cmp-apex-wip-app", "cmp-apex-mes-db"],
  },
];

const components: Component[] = [
  { id: "cmp-apex-mes-app",     name: "MES Application Tier",    kind: "compute",  health: "At Risk" },
  { id: "cmp-apex-mes-db",      name: "MES Database",            kind: "database", health: "Degraded" },
  { id: "cmp-apex-mes-bus",     name: "MES Message Bus",         kind: "queue",    health: "At Risk" },
  { id: "cmp-apex-eap-gw",      name: "EAP SECS/GEM Gateway",    kind: "network",  health: "Severely Degraded" },
  { id: "cmp-apex-eap-orch",    name: "EAP Orchestrator",        kind: "compute",  health: "Severely Degraded" },
  { id: "cmp-apex-litho-ctrl",  name: "Photolithography Tool Controller (LITHO-04)", kind: "compute", health: "Degraded" },
  { id: "cmp-apex-fdc-eng",     name: "FDC Engine",              kind: "compute",  health: "At Risk" },
  { id: "cmp-apex-historian",   name: "Process Historian",       kind: "database", health: "Healthy" },
  { id: "cmp-apex-rms-app",     name: "RMS Application",         kind: "compute",  health: "Healthy" },
  { id: "cmp-apex-rms-db",      name: "RMS Database",            kind: "database", health: "Healthy" },
  { id: "cmp-apex-wip-app",     name: "WIP Tracker",             kind: "compute",  health: "At Risk" },
];

const digitalWorkers: DigitalWorker[] = [
  { id: "DW-APX-FIC-01",  name: "DW-APX-FIC-01",  role: "Fab IT Commander",         autonomy: "Human Guided",             status: "Investigating" },
  { id: "DW-APX-MES-02",  name: "DW-APX-MES-02",  role: "MES SRE",                  autonomy: "AI Recommended",           status: "Recommending"  },
  { id: "DW-APX-EAP-03",  name: "DW-APX-EAP-03",  role: "EAP SRE",                  autonomy: "AI Recommended",           status: "Investigating" },
  { id: "DW-APX-TOOL-04", name: "DW-APX-TOOL-04", role: "Tool Automation SRE",      autonomy: "AI Recommended",           status: "Investigating" },
  { id: "DW-APX-FDC-05",  name: "DW-APX-FDC-05",  role: "FDC/SPC Analyst",          autonomy: "AI Recommended",           status: "Recommending"  },
  { id: "DW-APX-PE-06",   name: "DW-APX-PE-06",   role: "Process Engineering Liaison", autonomy: "Documentation Only",   status: "Idle"          },
  { id: "DW-APX-QA-07",   name: "DW-APX-QA-07",   role: "Quality Liaison",          autonomy: "Documentation Only",       status: "Idle"          },
  { id: "DW-APX-COMMS-08",name: "DW-APX-COMMS-08",role: "Operations Communications", autonomy: "Human Initiated Automation", status: "Idle"        },
];

const primaryIncident: Incident = {
  id: "INC-APX-4408",
  title: "EAP gateway degradation — LITHO-04 command timeouts, WIP at risk",
  severity: "SEV 1",
  state: "Investigating",
  serviceId: "svc-apex-eap",
  openedAt: "22:14 KST",
  commander: "DW-APX-FIC-01",
  summary:
    "EAP SECS/GEM gateway command latency rose from ~180ms to 4.6s at 22:03 KST after gateway configuration rollout CHG-APX-1204. Photolithography tool LITHO-04 is experiencing command timeouts. 6 lots (144 wafers) are queued at LITHO-04. No safety-interlock breach; no recipe change; no lot released.",
  findings: [
    "Gateway configuration rollout CHG-APX-1204 completed 21:58 KST.",
    "Command latency degradation began 22:03 KST.",
    "LITHO-04 reported command timeouts starting 22:07 KST.",
    "6 lots (144 wafers) at LITHO-04, 4 additional lots queued upstream.",
    "Safety interlocks: intact. Recipe integrity: intact.",
    "Most appropriate mitigation: rollback CHG-APX-1204 and restart EAP orchestrator process pool.",
    "Fallback: temporary reroute of LITHO-04 dispatch to LITHO-05 with process-engineering acknowledgment.",
  ],
};

const primaryChange: Change = {
  id: "CHG-APX-1204",
  title: "EAP SECS/GEM gateway configuration rollout",
  deployedAt: "21:58 KST",
  serviceId: "svc-apex-eap",
  linkedIncidentId: primaryIncident.id,
  risk: "Medium",
};

const primaryRunbook: Runbook = {
  id: "RB-APX-301",
  title: "EAP Gateway Degradation — Rollback and Orchestrator Restart",
  version: "v2.2",
  state: "Certified",
  autonomy: "Approval Gated Automation",
  serviceId: "svc-apex-eap",
  fitnessScore: 82,
  steps: [
    { key: "s1", label: "Confirm gateway degradation signature", description: "Correlate SECS/GEM command latency, tool timeout counts, and gateway CPU with the recent gateway config change.", kind: "diagnose" },
    { key: "s2", label: "Verify safety interlocks and recipes",  description: "Confirm no interlock trips, no recipe change requests in flight, and no lot state transitions outside policy.",   kind: "diagnose" },
    { key: "s3", label: "Rollback CHG-APX-1204",                  description: "Revert gateway configuration to last-known-good under change control.",                                           kind: "mitigate" },
    { key: "s4", label: "Restart EAP orchestrator process pool",  description: "Rolling restart of EAP orchestrator processes with drain semantics.",                                             kind: "mitigate" },
    { key: "s5", label: "Validate LITHO-04 command exchange",     description: "Verify command RTT and acknowledgment across LITHO-04 chambers returns to baseline.",                             kind: "validate" },
    { key: "s6", label: "Validate downstream WIP dispatch",       description: "Confirm queued lots re-enter dispatch and no traceability records are missing.",                                   kind: "validate" },
    { key: "s7", label: "Fallback: temporary dispatch reroute",   description: "If validation fails, reroute LITHO-04 dispatch to LITHO-05 with process-engineering acknowledgment.",             kind: "rollback" },
  ],
};

const primaryExecution: Execution = {
  id: "EXE-APX-881",
  runbookId: primaryRunbook.id,
  incidentId: primaryIncident.id,
  state: "Awaiting Approval",
  approvalId: "APR-APX-441",
};

const primaryApproval: Approval = {
  id: "APR-APX-441",
  runbookId: primaryRunbook.id,
  executionId: primaryExecution.id,
  requestedBy: "DW-APX-FIC-01",
  requestedAt: "22:22 KST",
  state: "Pending",
  reason: "Approval-gated automation: rollback CHG-APX-1204 and restart EAP orchestrator. Safety-interlock bypass, recipe change, and lot release explicitly prohibited.",
};

const slos: Slo[] = [
  { id: "SLO-APX-EAP-AV",  serviceId: "svc-apex-eap", name: "EAP command availability",   target: 99.9,  current: 92.4, errorBudgetRemaining: 8,  window: "28d" },
  { id: "SLO-APX-EAP-LT",  serviceId: "svc-apex-eap", name: "SECS/GEM command p95 <400ms", target: 99.0, current: 71.2, errorBudgetRemaining: 4,  window: "28d" },
  { id: "SLO-APX-MES-AV",  serviceId: "svc-apex-mes", name: "MES availability",           target: 99.95, current: 99.71, errorBudgetRemaining: 27, window: "28d" },
  { id: "SLO-APX-WIP-AV",  serviceId: "svc-apex-wip", name: "WIP tracking availability",  target: 99.95, current: 99.83, errorBudgetRemaining: 55, window: "28d" },
];

const connectors: Connector[] = [
  { id: "CON-APX-OTEL", name: "OpenTelemetry Collector (synthetic)", kind: "Observability", status: "Healthy",   freshness: "12s ago" },
  { id: "CON-APX-HIST", name: "Process Historian (simulated)",       kind: "Data",          status: "Healthy",   freshness: "20s ago" },
  { id: "CON-APX-EAP",  name: "EAP Gateway Telemetry (simulated)",   kind: "Data",          status: "Degraded",  freshness: "30s ago" },
  { id: "CON-APX-MES",  name: "MES Telemetry (simulated)",           kind: "Data",          status: "Healthy",   freshness: "18s ago" },
  { id: "CON-APX-ITSM", name: "Fab ITSM (simulated)",                kind: "ITSM",          status: "Healthy",   freshness: "45s ago" },
  { id: "CON-APX-CHAT", name: "Fab Ops Chat (simulated)",            kind: "Chat",          status: "Healthy",   freshness: "10s ago" },
];

const runbooksList: Runbook[] = [
  primaryRunbook,
  { id: "RB-APX-310", title: "MES Service Recovery",           version: "v1.6", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-apex-mes", fitnessScore: 80, steps: [] },
  { id: "RB-APX-320", title: "FDC Alarm Escalation Playbook",  version: "v2.0", state: "Published", autonomy: "Human Guided",              serviceId: "svc-apex-fdc", fitnessScore: 76, steps: [] },
  { id: "RB-APX-330", title: "WIP Dispatch Reroute Under Tool Outage", version: "v1.2", state: "Published", autonomy: "Human Guided", serviceId: "svc-apex-wip", fitnessScore: 70, steps: [] },
];

const changesList: Change[] = [
  primaryChange,
  { id: "CHG-APX-1200", title: "MES app-tier patch",              deployedAt: "yesterday", serviceId: "svc-apex-mes", risk: "Low" },
  { id: "CHG-APX-1195", title: "Historian schema evolution",       deployedAt: "3d ago",     serviceId: "svc-apex-fdc", risk: "Low" },
];

const knowledgeItems: KnowledgeItem[] = [
  { id: "K-APX-RB-301", title: "RB-APX-301 · EAP Gateway Rollback",        kind: "Runbook",   serviceId: "svc-apex-eap", source: "runbook-library", freshness: "4m ago", snippet: "Rollback and orchestrator restart with safety invariants." },
  { id: "K-APX-KE-19",  title: "KE-19 · EAP gateway command timeouts post-config", kind: "Known Error", serviceId: "svc-apex-eap", source: "knowledge-base", freshness: "5d ago", snippet: "Known-error pattern for gateway config regressions." },
  { id: "K-APX-PB-QC",  title: "Playbook · QC-gate escalation on excursion", kind: "Playbook", serviceId: "svc-apex-fdc", source: "knowledge-base", freshness: "1w ago", snippet: "Escalation to process engineering for FDC excursions." },
];

const evidenceItems: EvidenceItem[] = [
  { id: "EV-APX-401", title: "SECS/GEM command RTT histogram",   source: "EAP telemetry (simulated)", capturedAt: "22:12 KST", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-APX-402", title: "CHG-APX-1204 rollout record",       source: "Fab ITSM (simulated)",      capturedAt: "21:58 KST", incidentId: primaryIncident.id, kind: "change" },
  { id: "EV-APX-403", title: "LITHO-04 tool event log",           source: "Historian (simulated)",     capturedAt: "22:09 KST", incidentId: primaryIncident.id, kind: "log"    },
  { id: "EV-APX-404", title: "WIP queue snapshot",                 source: "WIP tracker (simulated)",   capturedAt: "22:15 KST", incidentId: primaryIncident.id, kind: "metric" },
];

const problemsList: Problem[] = [
  { id: "PRB-APX-31", title: "Recurrent EAP gateway config regressions", state: "Investigating", serviceId: "svc-apex-eap" },
  { id: "PRB-APX-27", title: "MES batch bus back-pressure at shift boundaries", state: "Open",   serviceId: "svc-apex-mes" },
];

const scenarioStages: ScenarioStage[] = [
  { index: 0,  label: "Baseline fab operations" },
  { index: 1,  label: "EAP gateway configuration rollout completes" },
  { index: 2,  label: "SECS/GEM command latency rises" },
  { index: 3,  label: "LITHO-04 command timeouts observed" },
  { index: 4,  label: "SEV 1 fab operational event declared" },
  { index: 5,  label: "Digital workers investigate" },
  { index: 6,  label: "Gateway config regression hypothesis dominant" },
  { index: 7,  label: "Rollback options compared" },
  { index: 8,  label: "Runbook execution requested" },
  { index: 9,  label: "Fab IT approval requested" },
  { index: 10, label: "Rollback proceeds; orchestrator restarts" },
  { index: 11, label: "LITHO-04 command RTT recovers" },
  { index: 12, label: "WIP dispatch resumes for queued lots" },
  { index: 13, label: "No traceability records missing; recipes intact" },
  { index: 14, label: "SLO burn stops; operating tolerance recovers" },
  { index: 15, label: "Event resolves" },
  { index: 16, label: "Postmortem opens; process engineering consulted" },
  { index: 17, label: "Runbook improvement proposed" },
  { index: 18, label: "New runbook version certified" },
];

const executionsList: (Execution & { title: string })[] = [
  { ...primaryExecution, title: "EAP gateway rollback and orchestrator restart" },
  { id: "EXE-APX-870", runbookId: "RB-APX-310", incidentId: "INC-APX-4390", state: "Completed", title: "MES service recovery rehearsal" },
  { id: "EXE-APX-860", runbookId: "RB-APX-320", incidentId: "INC-APX-4380", state: "Completed", title: "FDC alarm response rehearsal" },
];

export const apexFabProfile: TenantOperationalProfile = {
  tenantId: apexFabTenant.id,
  industryProfileId: chipManufacturingIndustry.id,
  displayName: "Apex Semiconductor Fab 12",
  shortName: "Apex Fab 12",
  industry: "chip-manufacturing",
  businessDescription:
    "Fictional 300mm advanced-logic fab operating 24×7 with mixed process technology. Factory IT provides MES, EAP, RMS, FDC/SPC, and dispatching for the tool fleet.",
  operatingModel: "Central factory IT with tool-automation SREs embedded per bay.",
  operatingHours: "24×7 continuous production",
  geographicScope: "Single-site, APAC",
  defaultServiceId: "svc-apex-eap",
  defaultScenarioId: "scenario-apex-eap-gateway",
  defaultStoryId: "story-apex-eap-gateway",
  defaultEnvironment: "Production",
  defaultRegion: "APAC",
  defaultTimeRange: "1h",
  tenantAccent: "amber",
  dataClassification: "Synthetic demonstration — no production process data",
  complianceContext: ["SEMI E10 (mapping only)", "SECS/GEM (protocol reference)", "ISO 9001 (mapping only)"],
  operationalPriorities: ["Safety", "Recipe integrity", "Traceability", "Yield", "Cycle time"],
  hardGuardrails: chipManufacturingIndustry.hardGuardrails,
  terminologyOverrides: {
    incident: "Fab operational event",
    approval: "Fab IT approval",
  },
  scenarioMode: "demonstration",
  syntheticDataNotice:
    "Synthetic demonstration data. No live tool controllers, MES, or process data. Not a live customer environment.",
  sourceSystemAliases: [
    { id: "ssa-apx-eap", systemName: "EAP Gateway (simulated)", aliasIn: "Equipment automation", purpose: "SECS/GEM command exchange" },
    { id: "ssa-apx-mes", systemName: "MES (simulated)",         aliasIn: "Execution",             purpose: "Lot tracking and dispatch" },
    { id: "ssa-apx-fdc", systemName: "FDC engine (simulated)",  aliasIn: "Process control",       purpose: "Excursion detection" },
  ],
  profileVersion: "1.0.0",
  profileState: "Active",
};

export const apexFabBundle: TenantFixtureBundle = {
  tenant: apexFabTenant,
  services, components, digitalWorkers, slos, connectors,
  runbooksList, changesList, knowledgeItems, evidenceItems, problemsList,
  scenarioStages,
  primaryIncident, primaryChange, primaryRunbook, primaryExecution, primaryApproval,
  primaryProblemId: "PRB-APX-31",
  primaryPostmortemId: "PM-APX-4408",
  executionsList,
  initialAuditLog: [
    { id: "AUD-APX-1", at: "22:14 KST", actor: "system",         action: "incident.declared",  target: primaryIncident.id, detail: "SEV 1 declared" },
    { id: "AUD-APX-2", at: "22:19 KST", actor: "DW-APX-EAP-03",  action: "hypothesis.raised",   target: primaryIncident.id, detail: "Gateway config regression" },
    { id: "AUD-APX-3", at: "22:22 KST", actor: "DW-APX-FIC-01",  action: "approval.requested",  target: primaryApproval.id, detail: "Rollback CHG-APX-1204" },
  ],
  initialNotifications: [
    { id: "N-APX-1", at: "22:14 KST", kind: "critical", title: "SEV 1 fab operational event",       detail: `${primaryIncident.id} · EAP gateway`, entityRef: primaryIncident.id, route: `/runops/incidents/${primaryIncident.id}` },
    { id: "N-APX-2", at: "22:19 KST", kind: "warning",  title: "Operating tolerance burn",           detail: "EAP command availability · APAC",    entityRef: "SLO-APX-EAP-AV",  route: "/runops/reliability/slos" },
    { id: "N-APX-3", at: "22:22 KST", kind: "info",     title: "Fab IT approval requested",           detail: `${primaryApproval.id} · ${primaryRunbook.id}`, entityRef: primaryApproval.id, route: "/runops/approvals" },
  ],
};

export const apexFabRecord: TenantProfileRecord = {
  profile: apexFabProfile,
  industry: chipManufacturingIndustry,
  bundle: apexFabBundle,
};
