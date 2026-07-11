/**
 * Meridian University Health — Healthcare AMC demonstration tenant.
 *
 * A fictional 1,050-bed academic medical center with three hospitals, one
 * Level I trauma center, and ~95 ambulatory and specialty locations. ALL data
 * is synthetic. No PHI. No live clinical system integrations. No vendor
 * certification or partnership is claimed by any simulated alias.
 *
 * This module extends the shared multi-industry tenant architecture — it does
 * NOT create a parallel application. Pages consume it through the existing
 * OperationsProvider via the TenantFixtureBundle contract.
 */

import type {
  Approval, BusinessService, Change, Component, Connector, DigitalWorker,
  EvidenceItem, Execution, Incident, KnowledgeItem, Problem, Runbook,
  ScenarioStage, Slo, Tenant,
} from "@/runops/data/scenario";
import { healthcareAmcIndustry } from "./industryProfiles";
import type {
  TenantFixtureBundle, TenantOperationalProfile, TenantProfileRecord,
} from "./types";

export const meridianTenant: Tenant = {
  id: "tenant-healthcare-amc",
  name: "Meridian University Health",
};

/* -------------------------------------------------------------------------- */
/* Services — Clinical Care Delivery Platform + supporting clinical services  */
/* -------------------------------------------------------------------------- */

const services: BusinessService[] = [
  {
    id: "svc-hc-clinical-care-delivery",
    name: "Clinical Care Delivery Platform",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "Degraded",
    sloAvailability: 99.95, sloLatencyMs: 900, errorBudgetRemaining: 41,
    componentIds: [
      "cmp-hc-ehr-web", "cmp-hc-ehr-app", "cmp-hc-ehr-opdb", "cmp-hc-empi",
      "cmp-hc-sso-badge", "cmp-hc-vdi-controller",
    ],
  },
  {
    id: "svc-hc-ehr-core",
    name: "EHR Clinical Core",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "At Risk",
    sloAvailability: 99.95, sloLatencyMs: 850, errorBudgetRemaining: 52,
    componentIds: [
      "cmp-hc-ehr-web", "cmp-hc-ehr-app", "cmp-hc-ehr-opdb", "cmp-hc-ehr-rptdb",
      "cmp-hc-ehr-fhir-gw",
    ],
  },
  {
    id: "svc-hc-patient-identity",
    name: "Patient Identity and ADT",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "Degraded",
    sloAvailability: 99.95, sloLatencyMs: 500, errorBudgetRemaining: 33,
    componentIds: ["cmp-hc-empi", "cmp-hc-adt-feed", "cmp-hc-iface-node-a", "cmp-hc-iface-node-b"],
  },
  {
    id: "svc-hc-clinical-integration",
    name: "Clinical Integration Platform",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "Severely Degraded",
    sloAvailability: 99.9, sloLatencyMs: 400, errorBudgetRemaining: 9,
    componentIds: [
      "cmp-hc-iface-node-a", "cmp-hc-iface-node-b", "cmp-hc-iface-node-c",
      "cmp-hc-mllp-ch-lab", "cmp-hc-mllp-ch-rx", "cmp-hc-mllp-ch-adt",
      "cmp-hc-order-feed", "cmp-hc-result-feed", "cmp-hc-adt-feed",
    ],
  },
  {
    id: "svc-hc-lab-blood-bank",
    name: "Laboratory and Blood Bank Systems",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "Degraded",
    sloAvailability: 99.9, sloLatencyMs: 1500, errorBudgetRemaining: 46,
    componentIds: ["cmp-hc-lis", "cmp-hc-blood-bank", "cmp-hc-result-feed", "cmp-hc-mllp-ch-lab"],
  },
  {
    id: "svc-hc-pharmacy-medication",
    name: "Pharmacy and Medication Administration",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "Degraded",
    sloAvailability: 99.99, sloLatencyMs: 700, errorBudgetRemaining: 55,
    componentIds: ["cmp-hc-pharmacy", "cmp-hc-medadmin", "cmp-hc-mllp-ch-rx", "cmp-hc-order-feed"],
  },
  {
    id: "svc-hc-imaging",
    name: "Diagnostic Imaging, PACS, and VNA",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "At Risk",
    sloAvailability: 99.9, sloLatencyMs: 1200, errorBudgetRemaining: 62,
    componentIds: ["cmp-hc-pacs", "cmp-hc-vna", "cmp-hc-dicom-router", "cmp-hc-modality-wl", "cmp-hc-ris"],
  },
  {
    id: "svc-hc-perioperative",
    name: "Perioperative and Anesthesia Systems",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "Healthy",
    sloAvailability: 99.9, sloLatencyMs: 900, errorBudgetRemaining: 74,
    componentIds: ["cmp-hc-ehr-app", "cmp-hc-empi", "cmp-hc-order-feed"],
  },
  {
    id: "svc-hc-emergency",
    name: "Emergency Department Technology",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "Degraded",
    sloAvailability: 99.95, sloLatencyMs: 700, errorBudgetRemaining: 38,
    componentIds: ["cmp-hc-ehr-app", "cmp-hc-adt-feed", "cmp-hc-result-feed", "cmp-hc-clin-comms"],
  },
  {
    id: "svc-hc-clinical-access",
    name: "Clinical Access, VDI, and SSO",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "At Risk",
    sloAvailability: 99.9, sloLatencyMs: 4000, errorBudgetRemaining: 57,
    componentIds: [
      "cmp-hc-vdi-controller", "cmp-hc-vdi-hosts", "cmp-hc-sso-badge",
      "cmp-hc-idp", "cmp-hc-pam",
    ],
  },
  {
    id: "svc-hc-patient-digital",
    name: "Patient Portal and Digital Front Door",
    tier: "Tier 2", environment: "Production", region: "Meridian Enterprise",
    health: "Healthy",
    sloAvailability: 99.5, sloLatencyMs: 1500, errorBudgetRemaining: 81,
    componentIds: ["cmp-hc-portal-web", "cmp-hc-portal-api-gw", "cmp-hc-idp"],
  },
  {
    id: "svc-hc-clinical-communications",
    name: "Clinical Communications",
    tier: "Tier 1", environment: "Production", region: "Meridian Enterprise",
    health: "Healthy",
    sloAvailability: 99.9, sloLatencyMs: 800, errorBudgetRemaining: 77,
    componentIds: ["cmp-hc-clin-comms", "cmp-hc-idp"],
  },
  {
    id: "svc-hc-analytics-research",
    name: "Clinical Analytics and Research Data",
    tier: "Tier 2", environment: "Production", region: "Meridian Enterprise",
    health: "Healthy",
    sloAvailability: 99.5, sloLatencyMs: 5000, errorBudgetRemaining: 89,
    componentIds: ["cmp-hc-ehr-rptdb", "cmp-hc-analytics-warehouse"],
  },
];

/* -------------------------------------------------------------------------- */
/* Topology components — >35 healthcare-specific components                   */
/* -------------------------------------------------------------------------- */

const components: Component[] = [
  // EHR
  { id: "cmp-hc-ehr-web",         name: "EHR Presentation Tier (simulated Epic Hyperspace)", kind: "api",      health: "At Risk" },
  { id: "cmp-hc-ehr-app",         name: "EHR Application Tier (simulated Epic)",              kind: "compute",  health: "Degraded" },
  { id: "cmp-hc-ehr-opdb",        name: "EHR Operational DB (simulated Chronicles)",          kind: "database", health: "Degraded" },
  { id: "cmp-hc-ehr-rptdb",       name: "EHR Reporting DB (simulated Clarity)",               kind: "database", health: "Healthy" },
  { id: "cmp-hc-ehr-caboodle",    name: "EHR Enterprise Data Warehouse (simulated Caboodle)", kind: "database", health: "Healthy" },
  { id: "cmp-hc-ehr-fhir-gw",     name: "FHIR API Gateway (simulated Interconnect)",          kind: "api",      health: "Healthy" },
  { id: "cmp-hc-ehr-webservices", name: "Clinical Web Services Tier",                          kind: "api",      health: "Healthy" },
  { id: "cmp-hc-ehr-bca",         name: "Business Continuity Access (simulated BCA)",         kind: "compute",  health: "Healthy" },

  // Identity + patient index
  { id: "cmp-hc-empi",           name: "Enterprise Master Patient Index (EMPI)",   kind: "identity", health: "Healthy" },
  { id: "cmp-hc-idp",            name: "Identity Provider (clinician + patient)",   kind: "identity", health: "Healthy" },
  { id: "cmp-hc-sso-badge",      name: "Badge-Tap SSO",                             kind: "identity", health: "Healthy" },
  { id: "cmp-hc-pam",            name: "Privileged Access Service",                 kind: "identity", health: "Healthy" },

  // Interface engine and channels
  { id: "cmp-hc-iface-node-a",   name: "Interface Engine Node A (simulated Bridges)", kind: "compute",  health: "Severely Degraded" },
  { id: "cmp-hc-iface-node-b",   name: "Interface Engine Node B (simulated Bridges)", kind: "compute",  health: "At Risk" },
  { id: "cmp-hc-iface-node-c",   name: "Interface Engine Node C (simulated Bridges)", kind: "compute",  health: "Healthy" },
  { id: "cmp-hc-mllp-ch-lab",    name: "MLLP Channel · Laboratory ORU",              kind: "queue",    health: "Degraded" },
  { id: "cmp-hc-mllp-ch-rx",     name: "MLLP Channel · Pharmacy ORM",                kind: "queue",    health: "Degraded" },
  { id: "cmp-hc-mllp-ch-adt",    name: "MLLP Channel · ADT A01/A03/A04/A08",         kind: "queue",    health: "Degraded" },
  { id: "cmp-hc-adt-feed",       name: "ADT Feed Aggregator",                        kind: "queue",    health: "Degraded" },
  { id: "cmp-hc-order-feed",     name: "Order Feed (ORM/OMG)",                       kind: "queue",    health: "Degraded" },
  { id: "cmp-hc-result-feed",    name: "Result Feed (ORU)",                          kind: "queue",    health: "Degraded" },

  // Lab, Blood Bank, Pharmacy, MedAdmin
  { id: "cmp-hc-lis",            name: "Laboratory Information System (LIS)",         kind: "compute",  health: "Healthy" },
  { id: "cmp-hc-blood-bank",     name: "Blood Bank System",                           kind: "compute",  health: "Healthy" },
  { id: "cmp-hc-pharmacy",       name: "Pharmacy System",                             kind: "compute",  health: "Healthy" },
  { id: "cmp-hc-medadmin",       name: "Medication Administration Service (BCMA)",    kind: "compute",  health: "Healthy" },

  // Imaging
  { id: "cmp-hc-pacs",           name: "PACS (simulated vendor)",                     kind: "compute",  health: "At Risk" },
  { id: "cmp-hc-vna",            name: "Vendor Neutral Archive (VNA)",                kind: "database", health: "Healthy" },
  { id: "cmp-hc-dicom-router",   name: "DICOM Router",                                kind: "network",  health: "At Risk" },
  { id: "cmp-hc-modality-wl",    name: "Modality Worklist Service",                   kind: "api",      health: "Healthy" },
  { id: "cmp-hc-ris",            name: "Radiology Information System (RIS)",          kind: "compute",  health: "Healthy" },

  // VDI + patient portal
  { id: "cmp-hc-vdi-controller", name: "Clinical VDI Delivery Controllers",           kind: "compute",  health: "At Risk" },
  { id: "cmp-hc-vdi-hosts",      name: "Clinical VDI Session Hosts",                  kind: "compute",  health: "Healthy" },
  { id: "cmp-hc-portal-web",     name: "Patient Portal Web",                          kind: "api",      health: "Healthy" },
  { id: "cmp-hc-portal-api-gw",  name: "Patient Portal API Gateway",                  kind: "api",      health: "Healthy" },

  // Communications
  { id: "cmp-hc-clin-comms",     name: "Clinical Communications Platform (simulated)", kind: "vendor",  health: "Healthy" },

  // Platform + supporting
  { id: "cmp-hc-monitoring",     name: "Clinical Observability Stack (simulated)",    kind: "vendor",   health: "Healthy" },
  { id: "cmp-hc-cmdb",           name: "Clinical CMDB (simulated)",                   kind: "vendor",   health: "Healthy" },
  { id: "cmp-hc-itsm",           name: "Clinical ITSM (simulated)",                   kind: "vendor",   health: "Healthy" },
  { id: "cmp-hc-backup",         name: "Backup and Recovery (simulated)",             kind: "vendor",   health: "Healthy" },
  { id: "cmp-hc-dr-env",         name: "Disaster Recovery Environment",               kind: "compute",  health: "Healthy" },
  { id: "cmp-hc-net-segment",    name: "Clinical Network Segmentation",               kind: "network",  health: "Healthy" },
  { id: "cmp-hc-dns",            name: "Clinical DNS",                                kind: "network",  health: "Healthy" },
  { id: "cmp-hc-lb",             name: "Clinical Load Balancers",                     kind: "network",  health: "Healthy" },

  // Analytics
  { id: "cmp-hc-analytics-warehouse", name: "Clinical Analytics Warehouse (simulated)", kind: "database", health: "Healthy" },
];

/* -------------------------------------------------------------------------- */
/* Digital workers — 12 healthcare-specific personas                          */
/* -------------------------------------------------------------------------- */

const digitalWorkers: DigitalWorker[] = [
  { id: "DW-HC-IC-01",    name: "DW-HC-IC-01",    role: "Clinical Technology Incident Commander", autonomy: "Human Guided",             status: "Investigating" },
  { id: "DW-HC-EHR-02",   name: "DW-HC-EHR-02",   role: "EHR Reliability Engineer",               autonomy: "AI Recommended",           status: "Investigating" },
  { id: "DW-HC-INT-03",   name: "DW-HC-INT-03",   role: "Clinical Integration Analyst",           autonomy: "AI Recommended",           status: "Recommending"  },
  { id: "DW-HC-IMG-04",   name: "DW-HC-IMG-04",   role: "Imaging Operations Analyst",             autonomy: "AI Recommended",           status: "Idle"          },
  { id: "DW-HC-LAB-05",   name: "DW-HC-LAB-05",   role: "Laboratory and Blood Bank Systems Analyst", autonomy: "AI Recommended",        status: "Idle"          },
  { id: "DW-HC-RX-06",    name: "DW-HC-RX-06",    role: "Pharmacy Systems Analyst",               autonomy: "AI Recommended",           status: "Idle"          },
  { id: "DW-HC-VDI-07",   name: "DW-HC-VDI-07",   role: "Clinical Access and VDI Engineer",       autonomy: "AI Recommended",           status: "Idle"          },
  { id: "DW-HC-IAM-08",   name: "DW-HC-IAM-08",   role: "Clinical Identity Engineer",             autonomy: "Approval Gated Automation", status: "Idle"         },
  { id: "DW-HC-SAFE-09",  name: "DW-HC-SAFE-09",  role: "Patient Safety Liaison",                 autonomy: "Human Guided",             status: "Investigating" },
  { id: "DW-HC-DT-10",    name: "DW-HC-DT-10",    role: "Clinical Downtime Coordinator",          autonomy: "Human Guided",             status: "Idle"          },
  { id: "DW-HC-COMMS-11", name: "DW-HC-COMMS-11", role: "Clinical Communications Coordinator",   autonomy: "Human Initiated Automation", status: "Idle"        },
  { id: "DW-HC-EVID-12",  name: "DW-HC-EVID-12",  role: "Healthcare Evidence and Compliance Analyst", autonomy: "Documentation Only",  status: "Idle"          },
];

/* -------------------------------------------------------------------------- */
/* Primary incident scenario — clinical interface degradation                 */
/* -------------------------------------------------------------------------- */

const primaryIncident: Incident = {
  id: "INC-HC-2407",
  title: "Clinical message delivery degradation affecting ED, laboratory, and pharmacy workflows",
  severity: "SEV 1",
  state: "Investigating",
  serviceId: "svc-hc-clinical-integration",
  openedAt: "07:41 CT",
  commander: "DW-HC-IC-01",
  summary:
    "Following a scheduled certificate rotation on clinical-integration node A (CHG-HC-6104), a downstream MLLP endpoint began reconnecting repeatedly. HL7 v2 ORM and ORU acknowledgment latency has increased, the interface queue has grown, and oldest message age has exceeded the internal clinical reliability threshold. Laboratory results and pharmacy order acknowledgments are delayed and ADT synchronization is falling behind, affecting Emergency Department and inpatient workflows across all three hospitals. No messages have been lost. Patient-safety risk is currently potential rather than confirmed. Clinical downtime activation is under evaluation. All data is synthetic.",
  findings: [
    "Certificate rotation completed on interface node A at 07:12 CT (CHG-HC-6104).",
    "Downstream MLLP endpoint began repeated reconnects at 07:24 CT.",
    "HL7 v2 ORU acknowledgment latency exceeded 4× baseline at 07:31 CT.",
    "Oldest message age reached 6m 20s at 07:38 CT (internal threshold: 5 minutes).",
    "Laboratory result delivery to the EHR is delayed by 3–7 minutes.",
    "Pharmacy order acknowledgment delivery is delayed by 4–9 minutes.",
    "ADT A08 (patient update) processing lag is growing.",
    "No message loss confirmed; duplicate-prevention and sequence controls remain enforced.",
    "Clinical downtime thresholds not yet met; Patient Safety Liaison engaged to reassess every 5 minutes.",
    "Most likely mitigation: quarantine the malformed reconnect loop, reroute eligible traffic to node C, drain backlog at a controlled rate.",
    "Autonomous production message replay is prohibited by policy; requires Clinical Integration Owner + Incident Commander approval.",
  ],
};

const primaryChange: Change = {
  id: "CHG-HC-6104",
  title: "Clinical integration node A certificate rotation",
  deployedAt: "07:12 CT",
  serviceId: "svc-hc-clinical-integration",
  linkedIncidentId: primaryIncident.id,
  risk: "Medium",
};

/* -------------------------------------------------------------------------- */
/* Runbooks — 14 healthcare-specific runbooks                                 */
/* -------------------------------------------------------------------------- */

const primaryRunbook: Runbook = {
  id: "RB-HC-014",
  title: "Clinical Interface Queue Saturation and Message Recovery",
  version: "v2.4",
  state: "Certified",
  autonomy: "Approval Gated Automation",
  serviceId: "svc-hc-clinical-integration",
  fitnessScore: 91,
  steps: [
    { key: "s01", label: "Confirm affected facilities, units, message types, and workflows",
      description: "Enumerate impacted hospitals, ED/inpatient units, ancillary systems, and HL7 message families (ADT, ORM, ORU). Anchor findings in the ITSM incident record.",
      kind: "diagnose" },
    { key: "s02", label: "Assess patient-safety and medication-safety impact",
      description: "Engage the Patient Safety Liaison to score current risk against clinical continuity and medication-administration integrity. Re-score every 5 minutes.",
      kind: "diagnose" },
    { key: "s03", label: "Determine whether clinical downtime thresholds have been met",
      description: "Compare oldest message age, ADT lag, and result-delivery delay against the Clinical Downtime Policy. Recommend activation only when policy criteria are met.",
      kind: "diagnose" },
    { key: "s04", label: "Inspect interface-node and endpoint health",
      description: "Review queue depth, message age, ACK/NACK patterns, certificate state, and downstream endpoint reachability for each interface node and MLLP channel.",
      kind: "diagnose" },
    { key: "s05", label: "Identify repeated reconnects or malformed-message loops",
      description: "Correlate reconnect storms and NACK bursts to specific channels and endpoints. Isolate offending message patterns without inspecting PHI payload beyond envelope metadata.",
      kind: "diagnose" },
    { key: "s06", label: "Quarantine problematic message through approved reversible workflow",
      description: "Move offending messages to the reversible quarantine queue. No autonomous release. Requires Clinical Integration Owner acknowledgment.",
      kind: "mitigate" },
    { key: "s07", label: "Reroute eligible traffic to a healthy integration node",
      description: "Shift MLLP channels for ADT, ORM, and ORU to node C under human-initiated automation, preserving message order.",
      kind: "mitigate" },
    { key: "s08", label: "Preserve message order and duplicate-prevention controls",
      description: "Validate that reroute did not disable dedupe, sequence, or checksum controls. Any bypass halts the runbook.",
      kind: "validate" },
    { key: "s09", label: "Drain backlog at a controlled rate",
      description: "Release backlog with a bounded throughput budget. Watch downstream ancillary ACK rates and abort if NACK rate rises.",
      kind: "mitigate" },
    { key: "s10", label: "Validate ADT, orders, results, and pharmacy acknowledgments",
      description: "Confirm end-to-end delivery for a control cohort of ADT A01/A08, ORM, and ORU messages using synthetic identifiers.",
      kind: "validate" },
    { key: "s11", label: "Reconcile downstream systems",
      description: "Coordinate with LIS, Blood Bank, Pharmacy, and PACS to confirm current demographics, orders, and results.",
      kind: "validate" },
    { key: "s12", label: "Confirm with clinical operations",
      description: "Sign-off from Laboratory, Pharmacy, Nursing, and Clinical Operations leaders. Patient Safety Liaison closes safety re-scoring.",
      kind: "validate" },
    { key: "s13", label: "Maintain PHI-safe evidence",
      description: "Capture evidence with PHI redaction enforced. Use synthetic identifiers only (SYN-ENC-*, SYN-PAT-*, SYN-ORD-*).",
      kind: "validate" },
    { key: "s14", label: "Continue enhanced monitoring",
      description: "Hold enhanced monitoring for 60 minutes post-recovery. Auto-open a problem ticket if signals regress.",
      kind: "validate" },
    { key: "s15", label: "Roll back or stop replay on integrity risk",
      description: "If duplicate, sequence, or data-integrity risk is detected, halt drain, revert quarantine changes, and escalate to Clinical Integration Owner and Incident Commander.",
      kind: "rollback" },
  ],
};

const runbooksList: Runbook[] = [
  primaryRunbook,
  { id: "RB-HC-021", title: "EHR Clinical Performance Degradation",             version: "v1.6", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-hc-ehr-core",              fitnessScore: 84, steps: [
    { key: "s1", label: "Confirm clinician-side symptoms",           description: "Correlate EHR login duration, chart-open latency, and CPOE save latency against baseline.", kind: "diagnose" },
    { key: "s2", label: "Isolate application vs database tier",       description: "Split latency budget across web, app, opdb, and reporting queries.", kind: "diagnose" },
    { key: "s3", label: "Mitigate hot query / plan regression",       description: "Apply canonical mitigation with change-control approval.", kind: "mitigate" },
    { key: "s4", label: "Validate clinician workflow",                description: "Run synthetic clinician session; confirm chart-open, orders, notes.", kind: "validate" },
    { key: "s5", label: "Rollback if patient-safety risk detected",    description: "Revert change and escalate to Clinical Integration Owner + Patient Safety Liaison.", kind: "rollback" },
  ]},
  { id: "RB-HC-027", title: "EHR Downtime and Business Continuity Activation",  version: "v3.1", state: "Certified", autonomy: "Human Guided",              serviceId: "svc-hc-ehr-core",              fitnessScore: 93, steps: [
    { key: "s1", label: "Confirm downtime criteria per policy",       description: "Validate policy thresholds with Clinical Downtime Coordinator and Patient Safety Liaison.", kind: "diagnose" },
    { key: "s2", label: "Activate Business Continuity Access (BCA)",   description: "Bring BCA read-only clinical view online per policy.", kind: "mitigate" },
    { key: "s3", label: "Coordinate clinical downtime procedures",     description: "Distribute paper-order and paper-MAR downtime kits to affected units.", kind: "mitigate" },
    { key: "s4", label: "Validate clinician access to BCA",            description: "Confirm badge-tap SSO and read-only chart access on control units.", kind: "validate" },
    { key: "s5", label: "Rollback / stand-down downtime",              description: "Return to primary EHR only after Clinical Integration Owner sign-off.", kind: "rollback" },
  ]},
  { id: "RB-HC-033", title: "PACS Image Routing and Study Availability Recovery", version: "v1.4", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-hc-imaging",             fitnessScore: 80, steps: [
    { key: "s1", label: "Confirm affected modalities and studies",   description: "Identify affected modality worklists and studies awaiting routing.", kind: "diagnose" },
    { key: "s2", label: "Reroute DICOM traffic to healthy node",      description: "Shift DICOM router to secondary path.", kind: "mitigate" },
    { key: "s3", label: "Validate study availability",                 description: "Confirm study retrieval for a control cohort.", kind: "validate" },
    { key: "s4", label: "Rollback on integrity risk",                  description: "Revert routing if any DICOM header or object integrity concern arises.", kind: "rollback" },
  ]},
  { id: "RB-HC-038", title: "Clinical VDI Login Storm and Session Recovery",     version: "v1.2", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-hc-clinical-access",       fitnessScore: 78, steps: [
    { key: "s1", label: "Confirm login storm signature",  description: "Correlate delivery controller CPU, session-host readiness, and login duration.", kind: "diagnose" },
    { key: "s2", label: "Scale session hosts",             description: "Bring warm-standby session hosts online under change control.", kind: "mitigate" },
    { key: "s3", label: "Validate clinician session launch", description: "Verify launch success for control unit clinicians.", kind: "validate" },
    { key: "s4", label: "Rollback scaling if instability",  description: "Return to baseline capacity if new hosts degrade.", kind: "rollback" },
  ]},
  { id: "RB-HC-041", title: "Badge-Tap SSO and Clinician Authentication Failure", version: "v1.3", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-hc-clinical-access",      fitnessScore: 82, steps: [
    { key: "s1", label: "Confirm badge SSO failure signature", description: "Correlate IdP health, badge reader errors, and login duration.", kind: "diagnose" },
    { key: "s2", label: "Failover to secondary IdP",           description: "Shift authentication to standby IdP under change control.", kind: "mitigate" },
    { key: "s3", label: "Validate clinician login",             description: "Confirm badge-tap SSO on control units.", kind: "validate" },
    { key: "s4", label: "Rollback if session integrity risk",   description: "Revert IdP if session issuance shows anomaly.", kind: "rollback" },
  ]},
  { id: "RB-HC-046", title: "Pharmacy Order Interface Degradation",              version: "v1.1", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-hc-pharmacy-medication",   fitnessScore: 77, steps: [
    { key: "s1", label: "Confirm ORM delivery delay",   description: "Measure oldest ORM message age to pharmacy.", kind: "diagnose" },
    { key: "s2", label: "Reroute pharmacy MLLP channel", description: "Move ORM traffic to healthy interface node.", kind: "mitigate" },
    { key: "s3", label: "Validate order acknowledgment", description: "Confirm ACK for a control ORM batch.", kind: "validate" },
    { key: "s4", label: "Rollback on medication integrity risk", description: "Halt and escalate to Pharmacy leadership.", kind: "rollback" },
  ]},
  { id: "RB-HC-052", title: "Laboratory Result Delivery Delay",                  version: "v1.2", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-hc-lab-blood-bank",         fitnessScore: 79, steps: [
    { key: "s1", label: "Confirm ORU delivery delay",   description: "Measure oldest ORU message age from LIS.", kind: "diagnose" },
    { key: "s2", label: "Reroute lab MLLP channel",      description: "Move ORU traffic to healthy interface node.", kind: "mitigate" },
    { key: "s3", label: "Validate result delivery",       description: "Confirm result acknowledgment for control cohort.", kind: "validate" },
    { key: "s4", label: "Rollback if result-integrity risk", description: "Halt and escalate to Lab Director.", kind: "rollback" },
  ]},
  { id: "RB-HC-057", title: "ADT Feed Disruption and Downstream Reconciliation", version: "v1.5", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-hc-patient-identity",       fitnessScore: 86, steps: [
    { key: "s1", label: "Confirm ADT lag",              description: "Correlate A01/A03/A04/A08 processing lag with downstream ancillary freshness.", kind: "diagnose" },
    { key: "s2", label: "Reroute ADT channel",           description: "Move ADT traffic to healthy node with sequence preservation.", kind: "mitigate" },
    { key: "s3", label: "Reconcile downstream systems",  description: "Confirm LIS, Blood Bank, Pharmacy, PACS have current demographics.", kind: "validate" },
    { key: "s4", label: "Rollback on duplicate risk",     description: "Halt if dedupe or sequence controls are stressed.", kind: "rollback" },
  ]},
  { id: "RB-HC-061", title: "FHIR API Saturation and Consumer Protection",       version: "v1.1", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-hc-ehr-core",              fitnessScore: 74, steps: [
    { key: "s1", label: "Confirm FHIR saturation",   description: "Identify top consumers and query patterns saturating the gateway.", kind: "diagnose" },
    { key: "s2", label: "Apply consumer throttle",    description: "Enforce per-consumer rate limit under change control.", kind: "mitigate" },
    { key: "s3", label: "Validate clinician-facing consumers", description: "Confirm clinician-facing traffic is unaffected.", kind: "validate" },
    { key: "s4", label: "Rollback throttle",          description: "Remove throttle once demand normalizes.", kind: "rollback" },
  ]},
  { id: "RB-HC-066", title: "Clinical Interface Certificate Expiration",         version: "v1.2", state: "Certified", autonomy: "Human Guided",              serviceId: "svc-hc-clinical-integration",  fitnessScore: 88, steps: [
    { key: "s1", label: "Confirm certificate state",         description: "Inventory certificates on interface nodes and downstream endpoints.", kind: "diagnose" },
    { key: "s2", label: "Stage rotation with rollback plan", description: "Prepare rotation change with reversible steps.", kind: "mitigate" },
    { key: "s3", label: "Validate MLLP connectivity",         description: "Confirm downstream endpoints reconnect cleanly.", kind: "validate" },
    { key: "s4", label: "Rollback rotation on reconnect loop", description: "Revert to previous certificate on repeated reconnect symptoms.", kind: "rollback" },
  ]},
  { id: "RB-HC-072", title: "Clinical Application Disaster-Recovery Failover",   version: "v2.0", state: "Certified", autonomy: "Human Guided",              serviceId: "svc-hc-clinical-care-delivery", fitnessScore: 90, steps: [
    { key: "s1", label: "Confirm DR criteria",     description: "Validate DR criteria with Clinical Downtime Coordinator.", kind: "diagnose" },
    { key: "s2", label: "Execute DR failover",      description: "Fail production clinical services to DR environment under approval.", kind: "mitigate" },
    { key: "s3", label: "Validate DR clinical flows", description: "Verify EHR, orders, results, and medication flows on DR.", kind: "validate" },
    { key: "s4", label: "Failback plan",            description: "Publish and stage failback runbook once primary recovers.", kind: "rollback" },
  ]},
  { id: "RB-HC-079", title: "DICOM Modality Worklist Failure",                   version: "v1.1", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-hc-imaging",                fitnessScore: 76, steps: [
    { key: "s1", label: "Confirm modality worklist failure", description: "Identify affected modalities and studies awaiting worklist.", kind: "diagnose" },
    { key: "s2", label: "Reroute worklist service",           description: "Move worklist provider to standby.", kind: "mitigate" },
    { key: "s3", label: "Validate modality retrieval",         description: "Confirm worklist retrieval on control modalities.", kind: "validate" },
    { key: "s4", label: "Rollback on integrity risk",          description: "Revert if worklist entries appear mismatched.", kind: "rollback" },
  ]},
  { id: "RB-HC-083", title: "Patient Portal Authentication Degradation",         version: "v1.0", state: "Published", autonomy: "Approval Gated Automation", serviceId: "svc-hc-patient-digital",         fitnessScore: 71, steps: [
    { key: "s1", label: "Confirm portal auth failure",  description: "Correlate IdP health with portal login success.", kind: "diagnose" },
    { key: "s2", label: "Failover portal IdP",           description: "Shift portal to standby IdP.", kind: "mitigate" },
    { key: "s3", label: "Validate patient login",         description: "Confirm patient portal login for control cohort.", kind: "validate" },
    { key: "s4", label: "Rollback if session anomaly",    description: "Revert IdP if anomalies detected.", kind: "rollback" },
  ]},
];

const primaryExecution: Execution = {
  id: "EXE-HC-9012",
  runbookId: primaryRunbook.id,
  incidentId: primaryIncident.id,
  state: "Awaiting Approval",
  approvalId: "APR-HC-2407",
};

const primaryApproval: Approval = {
  id: "APR-HC-2407",
  runbookId: primaryRunbook.id,
  executionId: primaryExecution.id,
  requestedBy: "DW-HC-IC-01",
  requestedAt: "07:52 CT",
  state: "Pending",
  reason: "Approval-gated automation: quarantine offending MLLP reconnect loop, reroute ADT/ORM/ORU to node C, and drain backlog at a controlled rate. Requires Clinical Integration Owner + Incident Commander acknowledgment. No autonomous production message replay.",
};

/* -------------------------------------------------------------------------- */
/* Reliability objectives (illustrative internal targets)                     */
/* -------------------------------------------------------------------------- */

const slos: Slo[] = [
  { id: "SLO-HC-EHR-LOGIN-SUCC",    serviceId: "svc-hc-ehr-core",              name: "Clinician EHR login success",                target: 99.9,  current: 99.71, errorBudgetRemaining: 62, window: "28d" },
  { id: "SLO-HC-EHR-LOGIN-DUR",     serviceId: "svc-hc-ehr-core",              name: "Clinician EHR login duration p95 <7s",       target: 99.0,  current: 96.4,  errorBudgetRemaining: 44, window: "28d" },
  { id: "SLO-HC-CPOE-ACCEPT",       serviceId: "svc-hc-ehr-core",              name: "CPOE order acceptance",                       target: 99.95, current: 99.83, errorBudgetRemaining: 55, window: "28d" },
  { id: "SLO-HC-ADT-LAG",           serviceId: "svc-hc-patient-identity",     name: "ADT event processing latency p95 <30s",      target: 99.0,  current: 88.6,  errorBudgetRemaining: 14, window: "28d" },
  { id: "SLO-HC-LAB-RESULT-LAT",    serviceId: "svc-hc-lab-blood-bank",       name: "Laboratory result-delivery latency p95 <60s", target: 99.0,  current: 91.2,  errorBudgetRemaining: 22, window: "28d" },
  { id: "SLO-HC-RX-ACK-LAT",        serviceId: "svc-hc-pharmacy-medication", name: "Pharmacy order-acknowledgment latency p95 <45s", target: 99.0, current: 90.8, errorBudgetRemaining: 19, window: "28d" },
  { id: "SLO-HC-BCMA-AV",           serviceId: "svc-hc-pharmacy-medication", name: "Medication-administration verification availability", target: 99.99, current: 99.98, errorBudgetRemaining: 88, window: "28d" },
  { id: "SLO-HC-PACS-AV",           serviceId: "svc-hc-imaging",               name: "PACS study availability",                     target: 99.9,  current: 99.71, errorBudgetRemaining: 58, window: "28d" },
  { id: "SLO-HC-DICOM-ROUTE",       serviceId: "svc-hc-imaging",               name: "DICOM routing success",                        target: 99.9,  current: 99.62, errorBudgetRemaining: 51, window: "28d" },
  { id: "SLO-HC-PORTAL-AV",         serviceId: "svc-hc-patient-digital",      name: "Patient portal availability",                  target: 99.5,  current: 99.82, errorBudgetRemaining: 81, window: "28d" },
  { id: "SLO-HC-VDI-LAUNCH",        serviceId: "svc-hc-clinical-access",      name: "Clinical VDI session-launch success",          target: 99.5,  current: 98.7,  errorBudgetRemaining: 47, window: "28d" },
  { id: "SLO-HC-FHIR-AV",           serviceId: "svc-hc-ehr-core",              name: "FHIR API availability",                        target: 99.9,  current: 99.86, errorBudgetRemaining: 66, window: "28d" },
  { id: "SLO-HC-IFACE-MSG-AGE",     serviceId: "svc-hc-clinical-integration", name: "Oldest interface message age <5m",             target: 99.0,  current: 82.4,  errorBudgetRemaining: 9,  window: "28d" },
  { id: "SLO-HC-IFACE-NACK",        serviceId: "svc-hc-clinical-integration", name: "Clinical interface NACK rate <0.5%",           target: 99.0,  current: 96.1,  errorBudgetRemaining: 38, window: "28d" },
];

/* -------------------------------------------------------------------------- */
/* Connectors — simulated, ownership + PHI handling implied by naming         */
/* -------------------------------------------------------------------------- */

const connectors: Connector[] = [
  { id: "CON-HC-EHR",     name: "EHR (simulated Epic) telemetry",                    kind: "Data",          status: "Healthy",  freshness: "10s ago" },
  { id: "CON-HC-IFACE",   name: "Clinical interface engine (simulated) telemetry",    kind: "Data",          status: "Degraded", freshness: "45s ago" },
  { id: "CON-HC-FHIR",    name: "FHIR API (simulated) gateway",                       kind: "Data",          status: "Healthy",  freshness: "12s ago" },
  { id: "CON-HC-PACS",    name: "PACS and VNA (simulated) telemetry",                 kind: "Data",          status: "Healthy",  freshness: "20s ago" },
  { id: "CON-HC-LIS",     name: "LIS (simulated) telemetry",                          kind: "Data",          status: "Healthy",  freshness: "18s ago" },
  { id: "CON-HC-BB",      name: "Blood Bank (simulated) telemetry",                   kind: "Data",          status: "Healthy",  freshness: "22s ago" },
  { id: "CON-HC-RX",      name: "Pharmacy (simulated) telemetry",                     kind: "Data",          status: "Healthy",  freshness: "15s ago" },
  { id: "CON-HC-VDI",     name: "Clinical VDI (simulated Citrix) telemetry",          kind: "Data",          status: "Healthy",  freshness: "25s ago" },
  { id: "CON-HC-IDP",     name: "Identity and SSO (simulated) telemetry",             kind: "Data",          status: "Healthy",  freshness: "8s ago"  },
  { id: "CON-HC-ITSM",    name: "Clinical ITSM (simulated)",                          kind: "ITSM",          status: "Healthy",  freshness: "35s ago" },
  { id: "CON-HC-CMDB",    name: "Clinical CMDB (simulated)",                          kind: "Data",          status: "Healthy",  freshness: "2m ago"  },
  { id: "CON-HC-OTEL",    name: "OpenTelemetry Collector (synthetic)",                kind: "Observability", status: "Healthy",  freshness: "10s ago" },
  { id: "CON-HC-PROM",    name: "Prometheus (synthetic)",                              kind: "Observability", status: "Healthy",  freshness: "12s ago" },
  { id: "CON-HC-BACKUP",  name: "Backup and Recovery (simulated)",                    kind: "Data",          status: "Healthy",  freshness: "5m ago"  },
  { id: "CON-HC-ONCALL",  name: "On-call notification (simulated)",                   kind: "Chat",          status: "Healthy",  freshness: "20s ago" },
  { id: "CON-HC-COMMS",   name: "Clinical incident communications (simulated)",       kind: "Chat",          status: "Healthy",  freshness: "8s ago"  },
];

/* -------------------------------------------------------------------------- */
/* Changes, knowledge, evidence, problems, executions                         */
/* -------------------------------------------------------------------------- */

const changesList: Change[] = [
  primaryChange,
  { id: "CHG-HC-6098", title: "PACS DICOM router firmware update",   deployedAt: "yesterday", serviceId: "svc-hc-imaging",              risk: "Low" },
  { id: "CHG-HC-6091", title: "Clinical VDI delivery controller patch", deployedAt: "2d ago",  serviceId: "svc-hc-clinical-access",       risk: "Low" },
  { id: "CHG-HC-6084", title: "EHR reporting DB index tuning",          deployedAt: "3d ago",   serviceId: "svc-hc-analytics-research",    risk: "Low" },
];

const knowledgeItems: KnowledgeItem[] = [
  { id: "K-HC-RB-014",  title: "RB-HC-014 · Clinical Interface Queue Saturation and Message Recovery", kind: "Runbook",    serviceId: "svc-hc-clinical-integration",   source: "runbook-library", freshness: "5m ago",  snippet: "Approval-gated quarantine, reroute, and controlled drain. No autonomous replay." },
  { id: "K-HC-RB-027",  title: "RB-HC-027 · EHR Downtime and Business Continuity Activation",         kind: "Runbook",    serviceId: "svc-hc-ehr-core",                 source: "runbook-library", freshness: "1h ago",  snippet: "Downtime activation criteria and BCA read-only clinical view." },
  { id: "K-HC-KE-118",  title: "KE-118 · Post-certificate-rotation MLLP reconnect loops",              kind: "Known Error", serviceId: "svc-hc-clinical-integration",   source: "knowledge-base",  freshness: "1d ago",  snippet: "Symptoms and mitigation for reconnect loops after certificate rotation." },
  { id: "K-HC-KE-121",  title: "KE-121 · Duplicate suppression under drain acceleration",              kind: "Known Error", serviceId: "svc-hc-clinical-integration",   source: "knowledge-base",  freshness: "2d ago",  snippet: "Guardrails against dedupe stress when draining large backlogs." },
  { id: "K-HC-PB-DT",   title: "Playbook · Clinical downtime activation and communications",           kind: "Playbook",    serviceId: "svc-hc-ehr-core",                 source: "knowledge-base",  freshness: "3d ago",  snippet: "Trigger conditions and clinical communications for EHR downtime." },
  { id: "K-HC-PB-SAFE", title: "Playbook · Patient-safety escalation for clinical technology events",  kind: "Playbook",    serviceId: "svc-hc-clinical-care-delivery",   source: "knowledge-base",  freshness: "5d ago",  snippet: "Patient Safety Liaison engagement and re-scoring cadence." },
  { id: "K-HC-PM-2407", title: "PM-HC-2407 · Clinical interface degradation postmortem (draft)",       kind: "Postmortem",  serviceId: "svc-hc-clinical-integration",   source: "knowledge-base",  freshness: "in progress", snippet: "Draft postmortem including clinical impact, downtime effectiveness, patient-safety findings." },
];

const evidenceItems: EvidenceItem[] = [
  { id: "EV-HC-401", title: "Interface engine queue depth trend (synthetic)",       source: "Interface engine (simulated)", capturedAt: "07:38 CT", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-HC-402", title: "CHG-HC-6104 change record",                              source: "ITSM (simulated)",              capturedAt: "07:12 CT", incidentId: primaryIncident.id, kind: "change" },
  { id: "EV-HC-403", title: "MLLP endpoint reconnect log (envelope only, PHI redacted)", source: "Loki (synthetic)",         capturedAt: "07:24 CT", incidentId: primaryIncident.id, kind: "log"    },
  { id: "EV-HC-404", title: "ORU acknowledgment latency histogram",                   source: "Prometheus (synthetic)",        capturedAt: "07:33 CT", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-HC-405", title: "ADT A08 lag trace (synthetic identifiers only)",         source: "OpenTelemetry (synthetic)",     capturedAt: "07:37 CT", incidentId: primaryIncident.id, kind: "trace"  },
  { id: "EV-HC-406", title: "Interface node A certificate state",                     source: "CMDB (simulated)",              capturedAt: "07:15 CT", incidentId: primaryIncident.id, kind: "config" },
  { id: "EV-HC-407", title: "Patient Safety Liaison re-scoring notes (synthetic)",    source: "Clinical ITSM (simulated)",     capturedAt: "07:45 CT", incidentId: primaryIncident.id, kind: "log"    },
];

const problemsList: Problem[] = [
  { id: "PRB-HC-314", title: "Post-certificate-rotation reconnect regressions on clinical integration nodes", state: "Investigating", serviceId: "svc-hc-clinical-integration" },
  { id: "PRB-HC-309", title: "EHR reporting query contention during shift change",                            state: "Open",          serviceId: "svc-hc-ehr-core" },
  { id: "PRB-HC-302", title: "Clinical VDI login storm at 07:00 CT unit turnover",                            state: "Open",          serviceId: "svc-hc-clinical-access" },
];

/* -------------------------------------------------------------------------- */
/* Scenario stages — Healthcare AMC demo story                                */
/* -------------------------------------------------------------------------- */

const scenarioStages: ScenarioStage[] = [
  { index: 0,  label: "Clinical Reliability Command Center — baseline" },
  { index: 1,  label: "Clinical Care Delivery Digital Twin overview" },
  { index: 2,  label: "Clinical Integration Topology inspection" },
  { index: 3,  label: "Message flow and clinical telemetry review" },
  { index: 4,  label: "Reliability objective burn: message age, ADT lag" },
  { index: 5,  label: "Correlated clinical alerts converge on interface node A" },
  { index: 6,  label: "Clinical Technology Incident Command declared (SEV 1)" },
  { index: 7,  label: "Clinical investigation identifies post-rotation reconnect loop" },
  { index: 8,  label: "Evidence and hypothesis review with PHI redaction" },
  { index: 9,  label: "Remediation options compared with clinical informatics" },
  { index: 10, label: "Clinical runbook RB-HC-014 selected" },
  { index: 11, label: "Safety and change preflight — Patient Safety Liaison sign-off" },
  { index: 12, label: "Human approval requested (Clinical Integration Owner + IC)" },
  { index: 13, label: "Controlled execution: quarantine, reroute, controlled drain" },
  { index: 14, label: "Clinical workflow validation across Lab, Pharmacy, ED" },
  { index: 15, label: "Clinical communications sent to affected units" },
  { index: 16, label: "Incident resolves — no downtime procedure activated" },
  { index: 17, label: "Blameless postmortem PM-HC-2407 opens" },
  { index: 18, label: "Runbook improvement proposed for RB-HC-014" },
  { index: 19, label: "Clinical reliability value captured for the story" },
];

const executionsList: (Execution & { title: string })[] = [
  { ...primaryExecution, title: "Interface reconnect quarantine + controlled drain (RB-HC-014)" },
  { id: "EXE-HC-8955", runbookId: "RB-HC-021", incidentId: "INC-HC-2390", state: "Completed", title: "EHR clinical performance degradation rehearsal" },
  { id: "EXE-HC-8931", runbookId: "RB-HC-033", incidentId: "INC-HC-2377", state: "Completed", title: "PACS image routing recovery rehearsal" },
  { id: "EXE-HC-8912", runbookId: "RB-HC-057", incidentId: "INC-HC-2358", state: "Completed", title: "ADT feed disruption reconciliation rehearsal" },
];

/* -------------------------------------------------------------------------- */
/* Profile record                                                             */
/* -------------------------------------------------------------------------- */

export const meridianProfile: TenantOperationalProfile = {
  tenantId: meridianTenant.id,
  industryProfileId: healthcareAmcIndustry.id,
  displayName: "Meridian University Health",
  shortName: "Meridian",
  industry: "healthcare-amc",
  businessDescription:
    "Fictional academic medical center with three hospitals, one Level I trauma center, ~1,050 licensed beds, and ~95 ambulatory and specialty locations. Missions span emergency, inpatient, perioperative, imaging, laboratory, pharmacy, oncology, transplant, research, and teaching. 24×7 clinical operations across a hybrid on-premises and cloud footprint. Highly integrated clinical application environment.",
  operatingModel:
    "Central Clinical Technology organization with service-owner teams for EHR, Clinical Integration, Imaging, Laboratory, Pharmacy, Clinical Access, and Digital Patient. Patient Safety Liaison and Clinical Downtime Coordinator embedded in every SEV response.",
  operatingHours: "24×7 clinical operations",
  geographicScope: "Regional academic medical center · 3 hospitals · 1 Level I trauma center · ~95 ambulatory sites",
  defaultServiceId: "svc-hc-clinical-care-delivery",
  defaultScenarioId: "scenario-hc-clinical-interface-degradation",
  defaultStoryId: "story-hc-clinical-interface-degradation",
  defaultEnvironment: "Production",
  defaultRegion: "Meridian Enterprise",
  defaultTimeRange: "1h",
  tenantAccent: "teal",
  dataClassification: "Synthetic demonstration — no PHI, no real MRNs, no real SSNs",
  complianceContext: [
    "HIPAA Security Rule (mapping only)",
    "HHS Healthcare Cybersecurity Performance Goals (mapping only)",
    "HL7 v2 (mapping only)",
    "HL7 FHIR (mapping only)",
    "DICOM and DICOMweb (mapping only)",
    "Clinical Downtime Policy (internal reference)",
    "Patient Safety Escalation Policy (internal reference)",
    "Business Continuity (internal reference)",
    "Access Control and Break-Glass Auditing (internal reference)",
    "Change Management (internal reference)",
    "Data Retention (internal reference)",
    "Evidence Redaction (internal reference)",
  ],
  operationalPriorities: [
    "Patient safety",
    "Medication safety",
    "Clinical continuity",
    "Clinical data integrity",
    "Privacy and PHI protection",
    "Downtime procedure readiness",
    "Clinical-owner approval discipline",
  ],
  hardGuardrails: [
    ...healthcareAmcIndustry.hardGuardrails,
    { id: "gr-hc-med-safety",  title: "Medication safety",
      rule: "No autonomous change to medication data, orders, or administration records. All changes require Pharmacy and Clinical Integration Owner approval." },
    { id: "gr-hc-integrity",   title: "Clinical data integrity",
      rule: "Duplicate-prevention, sequence, and checksum controls on HL7/MLLP channels must remain enforced. No bypass permitted." },
    { id: "gr-hc-no-replay",   title: "No autonomous production message replay",
      rule: "Production HL7 message replay requires Clinical Integration Owner + Incident Commander approval and a reversible quarantine workflow." },
    { id: "gr-hc-break-glass", title: "Break-glass auditability",
      rule: "Any break-glass access must be recorded to the audit log with actor, target, reason, and duration. Digital workers may not initiate break-glass access." },
    { id: "gr-hc-phi",         title: "PHI redaction",
      rule: "All evidence, logs, traces, and narration must redact PHI. Only synthetic identifiers (SYN-ENC-*, SYN-PAT-*, SYN-ORD-*) may appear." },
    { id: "gr-hc-downtime",    title: "Clinical downtime activation",
      rule: "Only the Clinical Downtime Coordinator may activate or stand down clinical downtime procedures, with Patient Safety Liaison acknowledgment." },
    { id: "gr-hc-clin-approval", title: "Clinical owner approval",
      rule: "Any change to production clinical-interface mappings, medication data, or clinical records requires the designated clinical owner's approval." },
  ],
  terminologyOverrides: {
    incident:    "Clinical technology incident",
    approval:    "Clinical informatics acknowledgment",
    change:      "Clinical change",
    service:     "Clinical service",
    journey:     "Clinical workflow",
    slo:         "Clinical reliability objective",
    errorBudget: "Clinical reliability tolerance",
    impact:      "Clinical impact",
  },
  scenarioMode: "demonstration",
  syntheticDataNotice:
    "Synthetic demonstration environment. All patient, clinician, order, result, and encounter data is fictional. No PHI, no real MRNs, no real SSNs. Simulated vendor aliases (Epic, Citrix, and similar) are illustrative only — no vendor certification, partnership, or live integration is implied.",
  sourceSystemAliases: [
    { id: "ssa-hc-ehr-hyperspace", systemName: "Simulated Epic Hyperspace",     aliasIn: "EHR presentation",           purpose: "Clinician workstation front-end (simulation only)" },
    { id: "ssa-hc-ehr-chronicles", systemName: "Simulated Epic Chronicles",     aliasIn: "EHR operational database",   purpose: "Operational clinical data (simulation only)" },
    { id: "ssa-hc-ehr-clarity",    systemName: "Simulated Epic Clarity",         aliasIn: "EHR reporting database",     purpose: "Reporting warehouse (simulation only)" },
    { id: "ssa-hc-ehr-caboodle",   systemName: "Simulated Epic Caboodle",        aliasIn: "EHR enterprise data warehouse", purpose: "Enterprise analytics (simulation only)" },
    { id: "ssa-hc-ehr-interconn",  systemName: "Simulated Epic Interconnect",   aliasIn: "FHIR API gateway",           purpose: "External API surface (simulation only)" },
    { id: "ssa-hc-ehr-bridges",    systemName: "Simulated Epic Bridges",         aliasIn: "Clinical integration engine",purpose: "HL7 v2 / MLLP routing (simulation only)" },
    { id: "ssa-hc-ehr-bca",        systemName: "Simulated Epic Business Continuity Access", aliasIn: "BCA",             purpose: "Read-only clinical continuity view (simulation only)" },
    { id: "ssa-hc-vdi-citrix",     systemName: "Simulated Citrix Clinical VDI", aliasIn: "Clinical VDI",              purpose: "Clinician virtual desktop (simulation only)" },
    { id: "ssa-hc-empi",           systemName: "Simulated EMPI",                 aliasIn: "Patient identity",           purpose: "Patient identity resolution (simulation only)" },
    { id: "ssa-hc-pacs",           systemName: "Simulated PACS/VNA",             aliasIn: "Imaging",                    purpose: "Study retrieval and archive (simulation only)" },
    { id: "ssa-hc-lis",            systemName: "Simulated LIS",                  aliasIn: "Laboratory",                 purpose: "Result generation (simulation only)" },
    { id: "ssa-hc-bloodbank",      systemName: "Simulated Blood Bank",           aliasIn: "Blood Bank",                 purpose: "Transfusion services (simulation only)" },
    { id: "ssa-hc-rx",             systemName: "Simulated Pharmacy",             aliasIn: "Pharmacy",                   purpose: "Order fulfillment (simulation only)" },
  ],
  profileVersion: "2.0.0",
  profileState: "Active",
};

/* -------------------------------------------------------------------------- */
/* Bundle                                                                     */
/* -------------------------------------------------------------------------- */

export const meridianBundle: TenantFixtureBundle = {
  tenant: meridianTenant,
  services, components, digitalWorkers, slos, connectors,
  runbooksList, changesList, knowledgeItems, evidenceItems, problemsList,
  scenarioStages,
  primaryIncident, primaryChange, primaryRunbook, primaryExecution, primaryApproval,
  primaryProblemId: "PRB-HC-314",
  primaryPostmortemId: "PM-HC-2407",
  executionsList,
  initialAuditLog: [
    { id: "AUD-HC-1", at: "07:12 CT", actor: "system",          action: "change.deployed",     target: primaryChange.id,   detail: "Clinical integration node A certificate rotation completed" },
    { id: "AUD-HC-2", at: "07:24 CT", actor: "system",          action: "signal.detected",     target: "cmp-hc-mllp-ch-lab", detail: "Downstream MLLP endpoint reconnect loop" },
    { id: "AUD-HC-3", at: "07:41 CT", actor: "system",          action: "incident.declared",   target: primaryIncident.id, detail: "SEV 1 clinical technology incident" },
    { id: "AUD-HC-4", at: "07:47 CT", actor: "DW-HC-INT-03",    action: "hypothesis.raised",   target: primaryIncident.id, detail: "Post-rotation reconnect loop on interface node A" },
    { id: "AUD-HC-5", at: "07:49 CT", actor: "DW-HC-SAFE-09",   action: "safety.rescored",     target: primaryIncident.id, detail: "Patient safety risk potential, not confirmed" },
    { id: "AUD-HC-6", at: "07:52 CT", actor: "DW-HC-IC-01",     action: "approval.requested",  target: primaryApproval.id, detail: "Quarantine, reroute, controlled drain (RB-HC-014)" },
  ],
  initialNotifications: [
    { id: "N-HC-1", at: "07:41 CT", kind: "critical", title: "SEV 1 clinical technology incident",           detail: `${primaryIncident.id} · Clinical Integration Platform`, entityRef: primaryIncident.id,  route: `/runops/incidents/${primaryIncident.id}` },
    { id: "N-HC-2", at: "07:45 CT", kind: "warning",  title: "Clinical reliability tolerance burn",          detail: "Oldest interface message age · Meridian Enterprise",    entityRef: "SLO-HC-IFACE-MSG-AGE", route: "/runops/reliability/slos" },
    { id: "N-HC-3", at: "07:48 CT", kind: "warning",  title: "Laboratory result delivery delayed",            detail: "ORU delivery latency > 3× baseline",                    entityRef: "SLO-HC-LAB-RESULT-LAT", route: "/runops/reliability/slos" },
    { id: "N-HC-4", at: "07:49 CT", kind: "warning",  title: "Pharmacy order acknowledgment delayed",          detail: "ORM acknowledgment latency > 3× baseline",              entityRef: "SLO-HC-RX-ACK-LAT",     route: "/runops/reliability/slos" },
    { id: "N-HC-5", at: "07:52 CT", kind: "info",     title: "Clinical informatics acknowledgment requested", detail: `${primaryApproval.id} · ${primaryRunbook.id}`,          entityRef: primaryApproval.id,     route: "/runops/approvals" },
  ],
};

export const meridianRecord: TenantProfileRecord = {
  profile: meridianProfile,
  industry: healthcareAmcIndustry,
  bundle: meridianBundle,
};
