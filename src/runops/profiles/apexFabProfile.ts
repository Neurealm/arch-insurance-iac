/**
 * Apex Semiconductor Fab 12 — Chip Manufacturing demonstration tenant.
 *
 * A fictional 300mm advanced-logic fab operating 24×7 with mixed-technology
 * production. All lots, wafers, FOUPs, recipes, tools, employees, and process
 * data are SYNTHETIC. There is no live MES/EAP/RTD/FDC/APC/AMHS integration
 * and no vendor endorsement is implied by any simulated alias.
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
import { chipManufacturingIndustry } from "./industryProfiles";
import type {
  TenantFixtureBundle, TenantOperationalProfile, TenantProfileRecord,
} from "./types";

export const apexFabTenant: Tenant = {
  id: "tenant-chip-manufacturing",
  name: "Apex Semiconductor Fab 12",
};

/* -------------------------------------------------------------------------- */
/* Services — Factory capabilities                                            */
/* -------------------------------------------------------------------------- */

const services: BusinessService[] = [
  {
    id: "svc-fab-production-control",
    name: "Fab Production Control",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "Degraded",
    sloAvailability: 99.95, sloLatencyMs: 800, errorBudgetRemaining: 34,
    componentIds: [
      "cmp-fab-mes-app-a", "cmp-fab-mes-app-b", "cmp-fab-mes-db",
      "cmp-fab-rtd-engine", "cmp-fab-wip-tracker", "cmp-fab-dispatch-rules",
    ],
  },
  {
    id: "svc-fab-mes",
    name: "Manufacturing Execution and Lot Genealogy",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "At Risk",
    sloAvailability: 99.95, sloLatencyMs: 700, errorBudgetRemaining: 52,
    componentIds: [
      "cmp-fab-mes-app-a", "cmp-fab-mes-app-b", "cmp-fab-mes-db",
      "cmp-fab-genealogy-svc", "cmp-fab-mes-bus",
    ],
  },
  {
    id: "svc-fab-rtd",
    name: "Real-Time Dispatch and Scheduling",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "At Risk",
    sloAvailability: 99.9, sloLatencyMs: 500, errorBudgetRemaining: 44,
    componentIds: ["cmp-fab-rtd-engine", "cmp-fab-dispatch-rules", "cmp-fab-wip-tracker"],
  },
  {
    id: "svc-fab-equipment-integration",
    name: "Equipment Integration and CIM",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "Severely Degraded",
    sloAvailability: 99.9, sloLatencyMs: 400, errorBudgetRemaining: 11,
    componentIds: [
      "cmp-fab-cim-host", "cmp-fab-secsgem-gw", "cmp-fab-hsms-sessions",
      "cmp-fab-etch204-host", "cmp-fab-etch204-secsgem",
    ],
  },
  {
    id: "svc-fab-fdc",
    name: "Fault Detection and Classification",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "Severely Degraded",
    sloAvailability: 99.9, sloLatencyMs: 900, errorBudgetRemaining: 6,
    componentIds: ["cmp-fab-fdc-platform", "cmp-fab-trace-collector", "cmp-fab-historian"],
  },
  {
    id: "svc-fab-apc",
    name: "Advanced Process Control",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "Degraded",
    sloAvailability: 99.9, sloLatencyMs: 600, errorBudgetRemaining: 38,
    componentIds: ["cmp-fab-apc-platform", "cmp-fab-metrology-svc", "cmp-fab-historian"],
  },
  {
    id: "svc-fab-spc-yield",
    name: "SPC and Yield Management",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "At Risk",
    sloAvailability: 99.9, sloLatencyMs: 1200, errorBudgetRemaining: 48,
    componentIds: ["cmp-fab-spc-platform", "cmp-fab-yield-platform", "cmp-fab-historian"],
  },
  {
    id: "svc-fab-recipe",
    name: "Recipe Management",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "Healthy",
    sloAvailability: 99.99, sloLatencyMs: 350, errorBudgetRemaining: 87,
    componentIds: ["cmp-fab-recipe-svr", "cmp-fab-recipe-approval", "cmp-fab-recipe-db"],
  },
  {
    id: "svc-fab-amhs",
    name: "Automated Material Handling",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "Degraded",
    sloAvailability: 99.9, sloLatencyMs: 900, errorBudgetRemaining: 41,
    componentIds: [
      "cmp-fab-amhs-ctrl", "cmp-fab-stocker-01", "cmp-fab-stocker-02",
      "cmp-fab-ohtv-fleet", "cmp-fab-foup-tracker",
    ],
  },
  {
    id: "svc-fab-maintenance",
    name: "Equipment Maintenance and EAM",
    tier: "Tier 2", environment: "Production", region: "Apex Fab 12",
    health: "At Risk",
    sloAvailability: 99.5, sloLatencyMs: 1500, errorBudgetRemaining: 63,
    componentIds: ["cmp-fab-eam", "cmp-fab-qual-wafer-svc"],
  },
  {
    id: "svc-fab-reticle",
    name: "Reticle Management",
    tier: "Tier 2", environment: "Production", region: "Apex Fab 12",
    health: "Healthy",
    sloAvailability: 99.9, sloLatencyMs: 800, errorBudgetRemaining: 74,
    componentIds: ["cmp-fab-reticle-mgr", "cmp-fab-reticle-stocker"],
  },
  {
    id: "svc-fab-historian",
    name: "Factory Data Historian",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "Healthy",
    sloAvailability: 99.95, sloLatencyMs: 500, errorBudgetRemaining: 71,
    componentIds: ["cmp-fab-historian", "cmp-fab-trace-collector"],
  },
  {
    id: "svc-fab-network",
    name: "Factory Network and Time Services",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "Healthy",
    sloAvailability: 99.99, sloLatencyMs: 200, errorBudgetRemaining: 82,
    componentIds: ["cmp-fab-network-core", "cmp-fab-ptp-time", "cmp-fab-identity"],
  },
  {
    id: "svc-fab-facilities",
    name: "Facilities and Critical Utilities",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "At Risk",
    sloAvailability: 99.99, sloLatencyMs: 1000, errorBudgetRemaining: 55,
    componentIds: [
      "cmp-fab-facilities-mon", "cmp-fab-power", "cmp-fab-pcw",
      "cmp-fab-bulk-gas", "cmp-fab-vacuum", "cmp-fab-compressed-air", "cmp-fab-exhaust",
    ],
  },
  {
    id: "svc-fab-quality",
    name: "Quality Hold and Release",
    tier: "Tier 1", environment: "Production", region: "Apex Fab 12",
    health: "Degraded",
    sloAvailability: 99.95, sloLatencyMs: 700, errorBudgetRemaining: 47,
    componentIds: ["cmp-fab-quality-mgr", "cmp-fab-genealogy-svc", "cmp-fab-mes-db"],
  },
];

/* -------------------------------------------------------------------------- */
/* Topology components — 45+ nodes including ETCH-204 hierarchy               */
/* -------------------------------------------------------------------------- */

const components: Component[] = [
  // MES + genealogy
  { id: "cmp-fab-mes-app-a",       name: "MES Application Node A",        kind: "compute",  health: "At Risk" },
  { id: "cmp-fab-mes-app-b",       name: "MES Application Node B",        kind: "compute",  health: "At Risk" },
  { id: "cmp-fab-mes-db",          name: "MES Database",                  kind: "database", health: "Degraded" },
  { id: "cmp-fab-mes-bus",         name: "MES Message Bus",               kind: "queue",    health: "At Risk" },
  { id: "cmp-fab-genealogy-svc",   name: "Lot Genealogy Service",         kind: "compute",  health: "Degraded" },
  { id: "cmp-fab-wip-tracker",     name: "WIP Tracker",                   kind: "compute",  health: "At Risk" },

  // RTD + dispatch
  { id: "cmp-fab-rtd-engine",      name: "RTD Engine",                    kind: "compute",  health: "At Risk" },
  { id: "cmp-fab-dispatch-rules",  name: "Dispatch Rules Service",        kind: "compute",  health: "Healthy" },

  // CIM + SECS/GEM + HSMS
  { id: "cmp-fab-cim-host",        name: "CIM Host",                      kind: "compute",  health: "Degraded" },
  { id: "cmp-fab-secsgem-gw",      name: "SECS/GEM Gateway",              kind: "network",  health: "Severely Degraded" },
  { id: "cmp-fab-hsms-sessions",   name: "HSMS Session Manager",          kind: "network",  health: "Degraded" },

  // FDC / APC / SPC / Yield / Historian
  { id: "cmp-fab-fdc-platform",    name: "FDC Platform",                  kind: "compute",  health: "Severely Degraded" },
  { id: "cmp-fab-trace-collector", name: "Process Trace Collector",       kind: "queue",    health: "Degraded" },
  { id: "cmp-fab-apc-platform",    name: "APC Platform",                  kind: "compute",  health: "Degraded" },
  { id: "cmp-fab-spc-platform",    name: "SPC Platform",                  kind: "compute",  health: "At Risk" },
  { id: "cmp-fab-yield-platform",  name: "Yield Management Platform",     kind: "compute",  health: "At Risk" },
  { id: "cmp-fab-historian",       name: "Factory Data Historian",        kind: "database", health: "Healthy" },
  { id: "cmp-fab-metrology-svc",   name: "Metrology Integration Service", kind: "compute",  health: "Healthy" },

  // Recipe
  { id: "cmp-fab-recipe-svr",      name: "Recipe Server",                 kind: "compute",  health: "Healthy" },
  { id: "cmp-fab-recipe-approval", name: "Recipe Approval Service",       kind: "compute",  health: "Healthy" },
  { id: "cmp-fab-recipe-db",       name: "Recipe Database",               kind: "database", health: "Healthy" },

  // AMHS
  { id: "cmp-fab-amhs-ctrl",       name: "AMHS Controller",               kind: "compute",  health: "Degraded" },
  { id: "cmp-fab-stocker-01",      name: "Stocker STK-01",                kind: "vendor",   health: "Healthy" },
  { id: "cmp-fab-stocker-02",      name: "Stocker STK-02",                kind: "vendor",   health: "At Risk" },
  { id: "cmp-fab-ohtv-fleet",      name: "OHTV Vehicle Fleet",            kind: "vendor",   health: "Degraded" },
  { id: "cmp-fab-foup-tracker",    name: "FOUP Tracking Service",         kind: "compute",  health: "Healthy" },

  // Maintenance / Reticle / Quality
  { id: "cmp-fab-eam",             name: "EAM / CMMS",                    kind: "vendor",   health: "Healthy" },
  { id: "cmp-fab-qual-wafer-svc",  name: "Qualification Wafer Service",   kind: "compute",  health: "Healthy" },
  { id: "cmp-fab-reticle-mgr",     name: "Reticle Manager",               kind: "compute",  health: "Healthy" },
  { id: "cmp-fab-reticle-stocker", name: "Reticle Stocker",               kind: "vendor",   health: "Healthy" },
  { id: "cmp-fab-quality-mgr",     name: "Quality Hold and Release Manager", kind: "compute", health: "Degraded" },

  // Network, identity, ITSM
  { id: "cmp-fab-network-core",    name: "Factory Network Core",          kind: "network",  health: "Healthy" },
  { id: "cmp-fab-ptp-time",        name: "PTP Time Synchronization",      kind: "network",  health: "Healthy" },
  { id: "cmp-fab-identity",        name: "Identity and Access",           kind: "identity", health: "Healthy" },
  { id: "cmp-fab-itsm",            name: "Fab ITSM (simulated)",          kind: "vendor",   health: "Healthy" },

  // Facilities / utilities
  { id: "cmp-fab-facilities-mon",  name: "Facilities Monitoring",         kind: "compute",  health: "At Risk" },
  { id: "cmp-fab-power",           name: "Power Distribution",            kind: "vendor",   health: "Healthy" },
  { id: "cmp-fab-pcw",             name: "Process Cooling Water",         kind: "vendor",   health: "At Risk" },
  { id: "cmp-fab-bulk-gas",        name: "Bulk Gases",                    kind: "vendor",   health: "Healthy" },
  { id: "cmp-fab-vacuum",          name: "House Vacuum",                  kind: "vendor",   health: "Healthy" },
  { id: "cmp-fab-compressed-air",  name: "Compressed Dry Air",            kind: "vendor",   health: "Healthy" },
  { id: "cmp-fab-exhaust",         name: "Exhaust System",                kind: "vendor",   health: "Healthy" },

  // ETCH-204 equipment hierarchy
  { id: "cmp-fab-etch204-host",       name: "ETCH-204 Host",                 kind: "compute", health: "Degraded" },
  { id: "cmp-fab-etch204-secsgem",    name: "ETCH-204 SECS/GEM Interface",   kind: "network", health: "Degraded" },
  { id: "cmp-fab-etch204-proc-ctrl",  name: "ETCH-204 Process Controller",   kind: "compute", health: "At Risk" },
  { id: "cmp-fab-etch204-cha",        name: "ETCH-204 Chamber A",            kind: "vendor",  health: "Healthy" },
  { id: "cmp-fab-etch204-chb",        name: "ETCH-204 Chamber B",            kind: "vendor",  health: "Severely Degraded" },
  { id: "cmp-fab-etch204-chc",        name: "ETCH-204 Chamber C",            kind: "vendor",  health: "Healthy" },
  { id: "cmp-fab-etch204-chd",        name: "ETCH-204 Chamber D",            kind: "vendor",  health: "Healthy" },
  { id: "cmp-fab-etch204-lp1",        name: "ETCH-204 Load Port 1",          kind: "vendor",  health: "Healthy" },
  { id: "cmp-fab-etch204-lp2",        name: "ETCH-204 Load Port 2",          kind: "vendor",  health: "Healthy" },
  { id: "cmp-fab-etch204-efem",       name: "ETCH-204 EFEM",                 kind: "vendor",  health: "Healthy" },
  { id: "cmp-fab-etch204-vacuum",     name: "ETCH-204 Vacuum Subsystem",     kind: "vendor",  health: "Healthy" },
  { id: "cmp-fab-etch204-rf",         name: "ETCH-204 RF Generator",         kind: "vendor",  health: "At Risk" },
  { id: "cmp-fab-etch204-mfc",        name: "ETCH-204 Mass-Flow Controllers", kind: "vendor", health: "Healthy" },
  { id: "cmp-fab-etch204-endpoint",   name: "ETCH-204 Endpoint Sensor",      kind: "vendor",  health: "At Risk" },
];

/* -------------------------------------------------------------------------- */
/* Digital Workers                                                            */
/* -------------------------------------------------------------------------- */

const digitalWorkers: DigitalWorker[] = [
  { id: "DW-FAB-IC-01",       name: "DW-FAB-IC-01",       role: "Fab Incident Commander",                autonomy: "Human Guided",               status: "Investigating" },
  { id: "DW-FAB-EQUIP-02",    name: "DW-FAB-EQUIP-02",    role: "Equipment Reliability Engineer",         autonomy: "AI Recommended",             status: "Investigating" },
  { id: "DW-FAB-PROC-03",     name: "DW-FAB-PROC-03",     role: "Process Control Engineer",               autonomy: "AI Recommended",             status: "Recommending"  },
  { id: "DW-FAB-CIM-04",      name: "DW-FAB-CIM-04",      role: "MES and CIM Engineer",                   autonomy: "AI Recommended",             status: "Investigating" },
  { id: "DW-FAB-DISPATCH-05", name: "DW-FAB-DISPATCH-05", role: "Production Control and Dispatch Coordinator", autonomy: "Human Initiated Automation", status: "Recommending" },
  { id: "DW-FAB-AMHS-06",     name: "DW-FAB-AMHS-06",     role: "AMHS Operations Coordinator",            autonomy: "Human Initiated Automation", status: "Idle" },
  { id: "DW-FAB-YIELD-07",    name: "DW-FAB-YIELD-07",    role: "Yield and Quality Analyst",              autonomy: "AI Recommended",             status: "Investigating" },
  { id: "DW-FAB-MAINT-08",    name: "DW-FAB-MAINT-08",    role: "Maintenance Planner",                    autonomy: "Documentation Only",         status: "Idle" },
  { id: "DW-FAB-FAC-09",      name: "DW-FAB-FAC-09",      role: "Facilities Reliability Engineer",        autonomy: "Documentation Only",         status: "Idle" },
  { id: "DW-FAB-RECIPE-10",   name: "DW-FAB-RECIPE-10",   role: "Recipe Governance Analyst",              autonomy: "Documentation Only",         status: "Idle" },
  { id: "DW-FAB-EHS-11",      name: "DW-FAB-EHS-11",      role: "EHS and Safety Control Analyst",         autonomy: "Documentation Only",         status: "Idle" },
  { id: "DW-FAB-COMMS-12",    name: "DW-FAB-COMMS-12",    role: "Fab Operations Communications Coordinator", autonomy: "Human Initiated Automation", status: "Idle" },
];

/* -------------------------------------------------------------------------- */
/* Primary scenario — ETCH-204 Chamber B excursion                             */
/* -------------------------------------------------------------------------- */

const primaryIncident: Incident = {
  id: "INC-FAB-7712",
  title: "ETCH-204 Chamber B process drift and rising wafer-excursion risk",
  severity: "SEV 1",
  state: "Investigating",
  serviceId: "svc-fab-production-control",
  openedAt: "02:41 local",
  commander: "DW-FAB-IC-01",
  summary:
    "ETCH-204 Chamber B returned from preventive maintenance at 01:58 local; qualification wafers initially passed. Starting 02:24 local, FDC fault score on Chamber B rose above CRITICAL threshold with chamber-pressure deviation, RF reflected-power drift, and endpoint-timing shift outside the chamber-matching baseline. No confirmed yield loss yet. LOT-STD-7724 (25 wafers) and LOT-STD-7725 (25 wafers) processed on Chamber B since qualification and are potentially at risk. LOT-HOT-9821 (hot lot, 25 wafers) and two additional standard lots are approaching ETCH-204. No safety-interlock breach; no recipe change; no lot released.",
  findings: [
    "Preventive maintenance CHG-FAB-3317 completed and initial qualification passed at 01:58 local.",
    "FDC fault score on Chamber B rose above CRITICAL threshold at 02:24 local.",
    "Chamber-pressure deviation, RF reflected-power drift, and endpoint timing outside chamber-matching baseline.",
    "LOT-STD-7724 and LOT-STD-7725 processed on Chamber B since qualification — potentially at risk, quality hold required.",
    "LOT-HOT-9821 (hot lot) and 4 additional standard lots approaching ETCH-204 in FOUP-4412 / FOUP-4418.",
    "Safety interlocks intact; recipe checksum matches approved version; no lot has been released.",
    "Recommended containment: place Chamber B in controlled hold, freeze dispatch to Chamber B, reroute eligible WIP to qualified Chambers A/C/D or alternate tool, place LOT-STD-7724/7725 on quality hold, initiate PM-qualification runbook.",
  ],
};

const primaryChange: Change = {
  id: "CHG-FAB-3317",
  title: "ETCH-204 Chamber B preventive-maintenance completion and qualification",
  deployedAt: "01:58 local",
  serviceId: "svc-fab-equipment-integration",
  linkedIncidentId: primaryIncident.id,
  risk: "Medium",
};

const primaryRunbook: Runbook = {
  id: "RB-FAB-207",
  title: "Etch Chamber Excursion Containment, Reroute, Recovery, and Qualification",
  version: "v3.1",
  state: "Certified",
  autonomy: "Approval Gated Automation",
  serviceId: "svc-fab-equipment-integration",
  fitnessScore: 88,
  steps: [
    { key: "s1",  label: "Confirm scope",                       description: "Confirm tool, chamber, recipe, product, lots, wafers, and alarm scope from FDC and MES.", kind: "diagnose" },
    { key: "s2",  label: "Controlled hold on Chamber B",        description: "Place ETCH-204 Chamber B in a controlled hold state via approved equipment control path.", kind: "mitigate" },
    { key: "s3",  label: "Freeze dispatch to Chamber B",         description: "Prevent RTD from dispatching new lots to Chamber B; do not modify recipes or interlocks.", kind: "mitigate" },
    { key: "s4",  label: "Identify at-risk lots and wafers",    description: "Identify lots and wafers processed on Chamber B since the last known-good qualification state.", kind: "diagnose" },
    { key: "s5",  label: "Preserve evidence",                   description: "Preserve FDC traces, process data, recipe version, equipment state, alarms, and maintenance history.", kind: "diagnose" },
    { key: "s6",  label: "Verify recipe integrity",             description: "Verify recipe checksum matches approved recipe version; do not modify recipe.", kind: "diagnose" },
    { key: "s7",  label: "Chamber-matching comparison",         description: "Compare Chamber B against A/C/D chamber-matching baselines.", kind: "diagnose" },
    { key: "s8",  label: "Signal review",                       description: "Evaluate pressure, RF forward/reflected, mass-flow, endpoint, and available trace signals.", kind: "diagnose" },
    { key: "s9",  label: "Identify eligible alternates",        description: "Identify qualified alternate chambers or tools within recipe/product qualification rules.", kind: "diagnose" },
    { key: "s10", label: "Reroute eligible WIP",                description: "Reroute eligible WIP while protecting hot-lot priority and qualification rules.", kind: "mitigate" },
    { key: "s11", label: "Quality hold on affected lots",        description: "Place LOT-STD-7724 and LOT-STD-7725 on quality hold pending disposition — do not release.", kind: "mitigate" },
    { key: "s12", label: "Coordinate maintenance diagnostics",  description: "Coordinate maintenance diagnostics and corrective action with equipment owner.", kind: "diagnose" },
    { key: "s13", label: "Run approved chamber service steps",  description: "Run chamber clean or service steps only as simulated approved actions.", kind: "mitigate" },
    { key: "s14", label: "Qualification wafers",                description: "Execute qualification wafers under process-engineering supervision.", kind: "validate" },
    { key: "s15", label: "Multi-system validation",             description: "Validate FDC, SPC, metrology, chamber matching, and equipment state.", kind: "validate" },
    { key: "s16", label: "Process Engineering & Quality approval", description: "Require explicit Process Engineering and Quality approval before release.", kind: "validate" },
    { key: "s17", label: "Release chamber",                     description: "Release Chamber B to production only after all required approvals.", kind: "validate" },
    { key: "s18", label: "Lot disposition",                     description: "Release held lots only through separate quality disposition — never from this runbook.", kind: "validate" },
    { key: "s19", label: "Monitor recurrence",                  description: "Monitor for recurrence and downstream yield signals.", kind: "validate" },
    { key: "s20", label: "Evidence and learning",               description: "Create evidence and learning records; open postmortem PM-FAB-7712.", kind: "validate" },
  ],
};

const primaryExecution: Execution = {
  id: "EXE-FAB-6204",
  runbookId: primaryRunbook.id,
  incidentId: primaryIncident.id,
  state: "Awaiting Approval",
  approvalId: "APR-FAB-6204",
};

const primaryApproval: Approval = {
  id: "APR-FAB-6204",
  runbookId: primaryRunbook.id,
  executionId: primaryExecution.id,
  requestedBy: "DW-FAB-IC-01",
  requestedAt: "02:49 local",
  state: "Pending",
  reason:
    "Approval-gated automation: place ETCH-204 Chamber B on controlled hold, freeze dispatch, reroute eligible WIP to qualified chambers, and place LOT-STD-7724 / LOT-STD-7725 on quality hold. Interlock bypass, recipe change, process-limit change, unqualified track-in, held-lot release, and chamber release to production are explicitly prohibited and require separate human authority.",
};

/* -------------------------------------------------------------------------- */
/* SLOs / Factory Objectives                                                  */
/* -------------------------------------------------------------------------- */

const slos: Slo[] = [
  { id: "SLO-FAB-MES-AV",         serviceId: "svc-fab-mes",                    name: "MES transaction availability",           target: 99.95, current: 99.72, errorBudgetRemaining: 52, window: "28d" },
  { id: "SLO-FAB-MES-LT",         serviceId: "svc-fab-mes",                    name: "MES transaction p95 <700ms",             target: 99.0,  current: 97.4,  errorBudgetRemaining: 58, window: "28d" },
  { id: "SLO-FAB-RTD-LT",         serviceId: "svc-fab-rtd",                    name: "RTD decision latency p95 <500ms",        target: 99.0,  current: 96.1,  errorBudgetRemaining: 44, window: "28d" },
  { id: "SLO-FAB-SECSGEM-AV",     serviceId: "svc-fab-equipment-integration",  name: "SECS/GEM host communication availability", target: 99.9,  current: 98.4,  errorBudgetRemaining: 22, window: "28d" },
  { id: "SLO-FAB-HSMS-STAB",      serviceId: "svc-fab-equipment-integration",  name: "HSMS session stability",                 target: 99.9,  current: 97.9,  errorBudgetRemaining: 11, window: "28d" },
  { id: "SLO-FAB-FDC-TRACE",      serviceId: "svc-fab-fdc",                    name: "FDC trace completeness",                 target: 99.5,  current: 94.6,  errorBudgetRemaining: 6,  window: "28d" },
  { id: "SLO-FAB-APC-FRESH",      serviceId: "svc-fab-apc",                    name: "APC recommendation freshness",           target: 99.0,  current: 96.8,  errorBudgetRemaining: 38, window: "28d" },
  { id: "SLO-FAB-RECIPE-DL",      serviceId: "svc-fab-recipe",                 name: "Recipe-download success",                target: 99.99, current: 99.97, errorBudgetRemaining: 87, window: "28d" },
  { id: "SLO-FAB-RECIPE-CHK",     serviceId: "svc-fab-recipe",                 name: "Recipe-checksum match (hard control)",   target: 100.0, current: 100.0, errorBudgetRemaining: 100, window: "28d" },
  { id: "SLO-FAB-GENEALOGY",      serviceId: "svc-fab-mes",                    name: "Lot-genealogy completeness (hard control)", target: 100.0, current: 100.0, errorBudgetRemaining: 100, window: "28d" },
  { id: "SLO-FAB-AMHS-DELIVERY",  serviceId: "svc-fab-amhs",                   name: "AMHS delivery time (P95 <4min)",         target: 99.0,  current: 96.7,  errorBudgetRemaining: 41, window: "28d" },
  { id: "SLO-FAB-FOUP-ID",        serviceId: "svc-fab-amhs",                   name: "FOUP identification success",            target: 99.99, current: 99.98, errorBudgetRemaining: 80, window: "28d" },
  { id: "SLO-FAB-TOOL-AV",        serviceId: "svc-fab-equipment-integration",  name: "Tool availability (ETCH fleet)",         target: 92.0,  current: 88.4,  errorBudgetRemaining: 34, window: "28d" },
  { id: "SLO-FAB-OEE",            serviceId: "svc-fab-production-control",     name: "Overall Equipment Effectiveness (OEE)",  target: 78.0,  current: 74.6,  errorBudgetRemaining: 40, window: "28d" },
  { id: "SLO-FAB-QUAL-HOLD",      serviceId: "svc-fab-quality",                name: "Approved lot release (hard control)",    target: 100.0, current: 100.0, errorBudgetRemaining: 100, window: "28d" },
];

/* -------------------------------------------------------------------------- */
/* Connectors                                                                  */
/* -------------------------------------------------------------------------- */

const connectors: Connector[] = [
  { id: "CON-FAB-MES",       name: "MES (simulated)",                     kind: "Data",          status: "Healthy",   freshness: "12s ago" },
  { id: "CON-FAB-RTD",       name: "RTD Engine (simulated)",              kind: "Data",          status: "Degraded",  freshness: "22s ago" },
  { id: "CON-FAB-CIM",       name: "CIM Host (simulated)",                kind: "Data",          status: "Degraded",  freshness: "18s ago" },
  { id: "CON-FAB-SECSGEM",   name: "SECS/GEM Gateway (simulated)",        kind: "Data",          status: "Degraded",  freshness: "9s ago"  },
  { id: "CON-FAB-FDC",       name: "FDC Platform (simulated)",            kind: "Observability", status: "Degraded",  freshness: "8s ago"  },
  { id: "CON-FAB-APC",       name: "APC Platform (simulated)",            kind: "Data",          status: "Healthy",   freshness: "30s ago" },
  { id: "CON-FAB-SPC",       name: "SPC Platform (simulated)",            kind: "Data",          status: "Healthy",   freshness: "40s ago" },
  { id: "CON-FAB-YIELD",     name: "Yield Management (simulated)",        kind: "Data",          status: "Healthy",   freshness: "1m ago"  },
  { id: "CON-FAB-RECIPE",    name: "Recipe Management (simulated)",       kind: "Change",        status: "Healthy",   freshness: "45s ago" },
  { id: "CON-FAB-AMHS",      name: "AMHS Controller (simulated)",         kind: "Data",          status: "Degraded",  freshness: "15s ago" },
  { id: "CON-FAB-EAM",       name: "EAM / CMMS (simulated)",              kind: "Change",        status: "Healthy",   freshness: "2m ago"  },
  { id: "CON-FAB-HIST",      name: "Factory Historian (simulated)",       kind: "Data",          status: "Healthy",   freshness: "10s ago" },
  { id: "CON-FAB-METRO",     name: "Metrology Integration (simulated)",   kind: "Data",          status: "Healthy",   freshness: "35s ago" },
  { id: "CON-FAB-FACILITIES", name: "Facilities Monitoring (simulated)",  kind: "Observability", status: "Degraded",  freshness: "20s ago" },
  { id: "CON-FAB-NETMON",    name: "Factory Network Monitoring (simulated)", kind: "Observability", status: "Healthy", freshness: "12s ago" },
  { id: "CON-FAB-ITSM",      name: "Fab ITSM (simulated)",                kind: "ITSM",          status: "Healthy",   freshness: "50s ago" },
  { id: "CON-FAB-IDENTITY",  name: "Identity Provider (simulated)",       kind: "Cloud",         status: "Healthy",   freshness: "1m ago"  },
  { id: "CON-FAB-CHAT",      name: "Fab Operations Chat (simulated)",     kind: "Chat",          status: "Healthy",   freshness: "8s ago"  },
  { id: "CON-FAB-ONCALL",    name: "On-Call Notification (simulated)",    kind: "Chat",          status: "Healthy",   freshness: "14s ago" },
  { id: "CON-FAB-OTEL",      name: "OpenTelemetry Collector (synthetic)", kind: "Observability", status: "Healthy",   freshness: "9s ago"  },
];

/* -------------------------------------------------------------------------- */
/* Runbooks (16 semiconductor-specific)                                        */
/* -------------------------------------------------------------------------- */

const runbooksList: Runbook[] = [
  primaryRunbook,
  { id: "RB-FAB-213", title: "Equipment Host Communication Loss",                    version: "v2.4", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-fab-equipment-integration", fitnessScore: 84, steps: [] },
  { id: "RB-FAB-219", title: "SECS/GEM and HSMS Session Recovery",                   version: "v2.1", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-fab-equipment-integration", fitnessScore: 81, steps: [] },
  { id: "RB-FAB-225", title: "Recipe Version or Checksum Mismatch",                  version: "v1.8", state: "Certified", autonomy: "Human Guided",              serviceId: "svc-fab-recipe",                fitnessScore: 90, steps: [] },
  { id: "RB-FAB-231", title: "FDC Trace Collection Gap",                             version: "v1.5", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-fab-fdc",                   fitnessScore: 79, steps: [] },
  { id: "RB-FAB-237", title: "APC Controller Recommendation Stale",                  version: "v1.3", state: "Published", autonomy: "Human Guided",              serviceId: "svc-fab-apc",                   fitnessScore: 74, steps: [] },
  { id: "RB-FAB-243", title: "AMHS Carrier Delivery Blockage",                       version: "v2.0", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-fab-amhs",                  fitnessScore: 82, steps: [] },
  { id: "RB-FAB-249", title: "FOUP Identification or Slot-Map Mismatch",             version: "v1.6", state: "Published", autonomy: "Human Guided",              serviceId: "svc-fab-amhs",                  fitnessScore: 77, steps: [] },
  { id: "RB-FAB-255", title: "MES Track-In Failure",                                 version: "v2.2", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-fab-mes",                   fitnessScore: 85, steps: [] },
  { id: "RB-FAB-261", title: "Lot Genealogy Discrepancy",                            version: "v1.4", state: "Certified", autonomy: "Human Guided",              serviceId: "svc-fab-mes",                   fitnessScore: 88, steps: [] },
  { id: "RB-FAB-267", title: "Hot-Lot Dispatch Delay",                               version: "v1.7", state: "Certified", autonomy: "Human Initiated Automation", serviceId: "svc-fab-rtd",                  fitnessScore: 80, steps: [] },
  { id: "RB-FAB-273", title: "Critical Utility Excursion",                           version: "v2.0", state: "Certified", autonomy: "Human Guided",              serviceId: "svc-fab-facilities",            fitnessScore: 83, steps: [] },
  { id: "RB-FAB-279", title: "Reticle Availability or Qualification Failure",        version: "v1.2", state: "Published", autonomy: "Human Guided",              serviceId: "svc-fab-reticle",               fitnessScore: 72, steps: [] },
  { id: "RB-FAB-285", title: "Preventive Maintenance Qualification",                 version: "v2.3", state: "Certified", autonomy: "Human Guided",              serviceId: "svc-fab-maintenance",           fitnessScore: 86, steps: [] },
  { id: "RB-FAB-291", title: "Yield Excursion Containment",                          version: "v1.9", state: "Certified", autonomy: "Human Guided",              serviceId: "svc-fab-spc-yield",             fitnessScore: 84, steps: [] },
  { id: "RB-FAB-297", title: "Factory Network Segment Degradation",                  version: "v1.5", state: "Published", autonomy: "Human Guided",              serviceId: "svc-fab-network",               fitnessScore: 78, steps: [] },
];

/* -------------------------------------------------------------------------- */
/* Changes                                                                     */
/* -------------------------------------------------------------------------- */

const changesList: Change[] = [
  primaryChange,
  { id: "CHG-FAB-3310", title: "Chamber-matching baseline refresh (ETCH fleet)", deployedAt: "yesterday", serviceId: "svc-fab-fdc",     risk: "Low"    },
  { id: "CHG-FAB-3298", title: "RTD dispatch-rule update (hot-lot priority)",     deployedAt: "3d ago",    serviceId: "svc-fab-rtd",     risk: "Low"    },
  { id: "CHG-FAB-3285", title: "AMHS OHTV firmware roll-forward",                 deployedAt: "1w ago",    serviceId: "svc-fab-amhs",    risk: "Medium" },
];

/* -------------------------------------------------------------------------- */
/* Knowledge, evidence, problems                                               */
/* -------------------------------------------------------------------------- */

const knowledgeItems: KnowledgeItem[] = [
  { id: "K-FAB-RB-207", title: "RB-FAB-207 · Etch Chamber Excursion Containment",     kind: "Runbook",     serviceId: "svc-fab-equipment-integration", source: "runbook-library", freshness: "6m ago",  snippet: "Contain, reroute, qualify, and release with hard controls on interlocks, recipes, and lot disposition." },
  { id: "K-FAB-KE-42",  title: "KE-42 · Post-PM chamber drift on etch clusters",       kind: "Known Error", serviceId: "svc-fab-equipment-integration", source: "knowledge-base",  freshness: "12d ago", snippet: "Endpoint timing shift and RF reflected-power drift after chamber PM if seasoning cycles are truncated." },
  { id: "K-FAB-PB-QUAL", title: "Playbook · Quality hold and disposition workflow",     kind: "Playbook",    serviceId: "svc-fab-quality",                source: "knowledge-base",  freshness: "2w ago",  snippet: "Quality hold is a hard control. Release only via approved disposition — never from a containment runbook." },
  { id: "K-FAB-PM-7100", title: "PM-FAB-7100 · Prior etch excursion postmortem",        kind: "Postmortem",  serviceId: "svc-fab-spc-yield",              source: "postmortem-lib",  freshness: "45d ago", snippet: "Contributors: PM seasoning gap, chamber-matching baseline drift, delayed FDC detection." },
];

const evidenceItems: EvidenceItem[] = [
  { id: "EV-FAB-701", title: "FDC fault-score trend (Chamber B)",              source: "FDC Platform (simulated)",   capturedAt: "02:30 local", incidentId: primaryIncident.id, kind: "trace"  },
  { id: "EV-FAB-702", title: "Chamber-pressure deviation (Chamber A/B/C/D)",    source: "Historian (simulated)",      capturedAt: "02:32 local", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-FAB-703", title: "RF reflected-power trace (Chamber B)",            source: "ETCH-204 Process Controller",capturedAt: "02:33 local", incidentId: primaryIncident.id, kind: "trace"  },
  { id: "EV-FAB-704", title: "Endpoint-timing chamber-matching delta",          source: "APC Platform (simulated)",   capturedAt: "02:34 local", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-FAB-705", title: "CHG-FAB-3317 PM completion record",               source: "EAM / CMMS (simulated)",     capturedAt: "01:58 local", incidentId: primaryIncident.id, kind: "change" },
  { id: "EV-FAB-706", title: "Recipe checksum verification (approved match)",    source: "Recipe Management (simulated)", capturedAt: "02:36 local", incidentId: primaryIncident.id, kind: "config" },
  { id: "EV-FAB-707", title: "MES lot-genealogy snapshot (LOT-STD-7724/7725)",  source: "MES (simulated)",            capturedAt: "02:38 local", incidentId: primaryIncident.id, kind: "log"    },
  { id: "EV-FAB-708", title: "WIP queue at ETCH-204 (incl. LOT-HOT-9821)",       source: "WIP Tracker (simulated)",    capturedAt: "02:40 local", incidentId: primaryIncident.id, kind: "metric" },
];

const problemsList: Problem[] = [
  { id: "PRB-FAB-812", title: "Post-PM chamber drift on ETCH cluster tools",             state: "Investigating", serviceId: "svc-fab-equipment-integration" },
  { id: "PRB-FAB-806", title: "SECS/GEM session flapping on shift boundaries",           state: "Open",          serviceId: "svc-fab-equipment-integration" },
  { id: "PRB-FAB-798", title: "AMHS OHTV routing contention near STK-02 loop",           state: "Open",          serviceId: "svc-fab-amhs" },
];

/* -------------------------------------------------------------------------- */
/* Scenario stages — 20-stage chip-manufacturing story                         */
/* -------------------------------------------------------------------------- */

const scenarioStages: ScenarioStage[] = [
  { index: 0,  label: "Fab Operations Command Center — baseline factory health" },
  { index: 1,  label: "Production Control Digital Twin — WIP, hot lots, tool status" },
  { index: 2,  label: "Factory and Equipment Topology — ETCH-204 hierarchy visible" },
  { index: 3,  label: "Tool and Process Telemetry — Chamber B signals begin drifting" },
  { index: 4,  label: "Factory Objective Risk — FDC trace completeness and tool availability degrade" },
  { index: 5,  label: "Correlated FDC and equipment alerts fire on Chamber B" },
  { index: 6,  label: "Fab Operational Event Command — INC-FAB-7712 declared" },
  { index: 7,  label: "Equipment and process investigation — pressure, RF, endpoint reviewed" },
  { index: 8,  label: "Excursion causal analysis — post-PM seasoning gap suspected" },
  { index: 9,  label: "Containment and reroute comparison — Chambers A/C/D vs alternate tool" },
  { index: 10, label: "Runbook selection — RB-FAB-207 recommended" },
  { index: 11, label: "Safety, quality, and recipe preflight — interlocks and checksum verified" },
  { index: 12, label: "Human approval requested — Process Engineering and Quality" },
  { index: 13, label: "Controlled execution — Chamber B held, dispatch frozen, WIP rerouted, lots on quality hold" },
  { index: 14, label: "Qualification and process validation — qualification wafers and chamber matching" },
  { index: 15, label: "Production communications — Ops, MFG, PE, Quality, EHS notified" },
  { index: 16, label: "Approved recovery — Chamber B released to production after multi-party approval" },
  { index: 17, label: "Blameless fab postmortem — PM-FAB-7712 opened" },
  { index: 18, label: "Runbook and maintenance improvement — RB-FAB-207 v3.2 drafted; PM procedure updated" },
  { index: 19, label: "Factory reliability and yield value — WIP-at-risk, cycle time, and yield-risk normalized" },
];

/* -------------------------------------------------------------------------- */
/* Executions list                                                             */
/* -------------------------------------------------------------------------- */

const executionsList: (Execution & { title: string })[] = [
  { ...primaryExecution, title: "ETCH-204 Chamber B excursion containment and qualification" },
  { id: "EXE-FAB-6198", runbookId: "RB-FAB-243", incidentId: "INC-FAB-7698", state: "Completed", title: "AMHS carrier delivery blockage rehearsal" },
  { id: "EXE-FAB-6190", runbookId: "RB-FAB-219", incidentId: "INC-FAB-7684", state: "Completed", title: "HSMS session recovery rehearsal" },
  { id: "EXE-FAB-6182", runbookId: "RB-FAB-255", incidentId: "INC-FAB-7671", state: "Completed", title: "MES track-in failure recovery rehearsal" },
];

/* -------------------------------------------------------------------------- */
/* Profile record                                                              */
/* -------------------------------------------------------------------------- */

export const apexFabProfile: TenantOperationalProfile = {
  tenantId: apexFabTenant.id,
  industryProfileId: chipManufacturingIndustry.id,
  displayName: "Apex Semiconductor Fab 12",
  shortName: "Apex Fab 12",
  industry: "chip-manufacturing",
  businessDescription:
    "Fictional 300mm advanced-logic semiconductor fab operating 24×7 with high-mix production, automated material handling, MES-controlled lot movement, real-time dispatch, integrated equipment automation, advanced process control, fault detection and classification, statistical process control, and chamber-level maintenance. Production, engineering, quality, facilities, and IT collaborate on hot lots under strict recipe, genealogy, quality, and safety controls.",
  operatingModel:
    "Central factory IT with tool-automation SREs embedded per bay; production, process, equipment, quality, maintenance, facilities, and CIM coordinate through MES/RTD/CIM/FDC/APC.",
  operatingHours: "24×7 continuous production",
  geographicScope: "Single-site, APAC (Apex Fab 12)",
  defaultServiceId: "svc-fab-production-control",
  defaultScenarioId: "scenario-fab-etch-excursion",
  defaultStoryId: "story-fab-etch-excursion",
  defaultEnvironment: "Production",
  defaultRegion: "Apex Fab 12",
  defaultTimeRange: "1h",
  tenantAccent: "amber",
  dataClassification:
    "Synthetic demonstration — no production process data, no real lot/wafer/recipe/employee identifiers.",
  complianceContext: [
    "ISA-95 (mapping only)",
    "SEMI E30 GEM (mapping only)",
    "SEMI E5 SECS-II (mapping only)",
    "SEMI E37 HSMS (mapping only)",
    "SEMI E10 (mapping only)",
    "SEMI E79 (mapping only)",
    "SEMI E87 (mapping only)",
    "SEMI E90 (mapping only)",
    "SEMI E40 (mapping only)",
    "SEMI E94 (mapping only)",
    "Internal recipe governance",
    "Internal quality hold and release",
    "EHS and safety-interlock policy",
  ],
  operationalPriorities: [
    "Safety and EHS interlocks",
    "Recipe integrity",
    "Lot and wafer genealogy",
    "Approved lot release",
    "Yield and quality",
    "Hot-lot cycle time",
    "Tool availability and OEE",
  ],
  hardGuardrails: chipManufacturingIndustry.hardGuardrails,
  terminologyOverrides: {
    incident: "Fab operational event",
    approval: "Fab authority approval",
    change: "Change / PM record",
    service: "Factory capability",
    component: "System / tool / chamber",
    errorBudget: "Operating tolerance",
  },
  scenarioMode: "demonstration",
  syntheticDataNotice:
    "Synthetic demonstration data. No live MES, RTD, CIM, FDC, APC, SPC, AMHS, EAM, historian, metrology, or facilities integration. No real lots, wafers, FOUPs, recipes, tools, chambers, employees, or process data. Vendor names, where they appear, are simulated aliases and imply no endorsement, partnership, or certification.",
  sourceSystemAliases: [
    { id: "ssa-fab-mes",      systemName: "MES (simulated)",              aliasIn: "Execution",             purpose: "Lot tracking, dispatch, genealogy" },
    { id: "ssa-fab-rtd",      systemName: "RTD Engine (simulated)",       aliasIn: "Dispatch",              purpose: "Real-time dispatch and scheduling" },
    { id: "ssa-fab-cim",      systemName: "CIM Host (simulated)",         aliasIn: "Equipment integration", purpose: "SECS/GEM/HSMS command exchange" },
    { id: "ssa-fab-fdc",      systemName: "FDC Platform (simulated)",     aliasIn: "Process control",       purpose: "Fault detection and classification" },
    { id: "ssa-fab-apc",      systemName: "APC Platform (simulated)",     aliasIn: "Process control",       purpose: "Advanced process control feedback" },
    { id: "ssa-fab-spc",      systemName: "SPC Platform (simulated)",     aliasIn: "Yield",                 purpose: "Statistical process control" },
    { id: "ssa-fab-recipe",   systemName: "Recipe Management (simulated)", aliasIn: "Recipe governance",     purpose: "Recipe versioning and checksum" },
    { id: "ssa-fab-amhs",     systemName: "AMHS Controller (simulated)",  aliasIn: "Material handling",     purpose: "FOUP delivery and stockers" },
    { id: "ssa-fab-eam",      systemName: "EAM / CMMS (simulated)",       aliasIn: "Maintenance",           purpose: "PM and corrective work orders" },
    { id: "ssa-fab-hist",     systemName: "Factory Historian (simulated)", aliasIn: "Telemetry",             purpose: "Process trace archive" },
    { id: "ssa-fab-metro",    systemName: "Metrology Integration (simulated)", aliasIn: "Measurement",       purpose: "Metrology feedback" },
    { id: "ssa-fab-quality",  systemName: "Quality Hold Manager (simulated)", aliasIn: "Quality",           purpose: "Lot hold and disposition" },
  ],
  profileVersion: "2.0.0",
  profileState: "Active",
};

export const apexFabBundle: TenantFixtureBundle = {
  tenant: apexFabTenant,
  services, components, digitalWorkers, slos, connectors,
  runbooksList, changesList, knowledgeItems, evidenceItems, problemsList,
  scenarioStages,
  primaryIncident, primaryChange, primaryRunbook, primaryExecution, primaryApproval,
  primaryProblemId: "PRB-FAB-812",
  primaryPostmortemId: "PM-FAB-7712",
  executionsList,
  initialAuditLog: [
    { id: "AUD-FAB-1", at: "02:24 local", actor: "system",             action: "alert.fdc.critical",     target: primaryIncident.id, detail: "FDC_FAULT_SCORE_CRITICAL on ETCH-204 Chamber B" },
    { id: "AUD-FAB-2", at: "02:28 local", actor: "DW-FAB-PROC-03",     action: "hypothesis.raised",       target: primaryIncident.id, detail: "Chamber B endpoint timing outside chamber-matching baseline" },
    { id: "AUD-FAB-3", at: "02:35 local", actor: "DW-FAB-EQUIP-02",    action: "hypothesis.raised",       target: primaryIncident.id, detail: "Post-PM seasoning gap suspected — refer PRB-FAB-812 / KE-42" },
    { id: "AUD-FAB-4", at: "02:41 local", actor: "system",             action: "incident.declared",       target: primaryIncident.id, detail: "SEV 1 fab operational event declared" },
    { id: "AUD-FAB-5", at: "02:45 local", actor: "DW-FAB-DISPATCH-05", action: "reroute.proposed",        target: primaryIncident.id, detail: "Reroute eligible WIP to Chambers A/C/D preserving hot-lot priority" },
    { id: "AUD-FAB-6", at: "02:49 local", actor: "DW-FAB-IC-01",       action: "approval.requested",      target: primaryApproval.id, detail: "RB-FAB-207 contain + reroute + quality hold" },
  ],
  initialNotifications: [
    { id: "N-FAB-1", at: "02:24 local", kind: "critical", title: "FDC CRITICAL — ETCH-204 Chamber B",   detail: "Fault score above threshold; chamber-pressure and RF drift", entityRef: primaryIncident.id, route: `/runops/incidents/${primaryIncident.id}` },
    { id: "N-FAB-2", at: "02:41 local", kind: "critical", title: "SEV 1 fab operational event",         detail: `${primaryIncident.id} · ETCH-204 Chamber B excursion risk`, entityRef: primaryIncident.id, route: `/runops/incidents/${primaryIncident.id}` },
    { id: "N-FAB-3", at: "02:44 local", kind: "warning",  title: "Hot-lot queue-time risk",              detail: "LOT-HOT-9821 approaching ETCH-204",                          entityRef: "SLO-FAB-TOOL-AV",   route: "/runops/reliability/slos" },
    { id: "N-FAB-4", at: "02:49 local", kind: "info",     title: "Fab authority approval requested",     detail: `${primaryApproval.id} · ${primaryRunbook.id}`,               entityRef: primaryApproval.id,  route: "/runops/approvals" },
  ],
};

export const apexFabRecord: TenantProfileRecord = {
  profile: apexFabProfile,
  industry: chipManufacturingIndustry,
  bundle: apexFabBundle,
};
