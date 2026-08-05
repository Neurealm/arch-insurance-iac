/**
 * Global Optical Service Topology — page-specific synthetic demonstration data.
 *
 * ALL values are fabricated. Customers, services, links, terminals, regions,
 * products, situations and digital coworkers are reused from ./goocFixtures
 * and ./cshFixtures so identifiers stay consistent across the Agentic SRE NOC
 * module. Keep this module free of React.
 */

import { links, situations, type Region } from "./goocFixtures";
import { customerServices, DEFAULT_SERVICE_ID, type CustomerService } from "./cshFixtures";

/* ------------------------------ taxonomies ------------------------------ */

export const NODE_KINDS = [
  "Customer",
  "Customer service",
  "Customer edge",
  "Downstream service",
  "User population",
  "Optical terminal",
  "Optical path",
  "Mounting structure",
  "Power source",
  "Optical controller",
  "Fiber handoff",
  "Customer router",
  "Partner router",
  "Aggregation router",
  "Switch",
  "Mobile tower",
  "Data center",
  "Network point of presence",
  "RF fallback",
  "Alternate optical route",
  "Fiber backup route",
  "Secondary aggregation path",
  "Backup power",
  "Region",
  "Site",
  "Operating partner",
  "Service owner",
  "SLO",
  "Incident",
  "Situation",
  "Change",
  "Field work order",
  "Digital coworker",
  "Weather condition",
  "Evidence record",
] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

export const NODE_LAYERS = [
  "Customer and service",
  "Optical infrastructure",
  "Network",
  "Resilience",
  "Operational context",
] as const;
export type NodeLayer = (typeof NODE_LAYERS)[number];

export const nodeLayerOf: Record<NodeKind, NodeLayer> = {
  Customer: "Customer and service",
  "Customer service": "Customer and service",
  "Customer edge": "Customer and service",
  "Downstream service": "Customer and service",
  "User population": "Customer and service",
  "Optical terminal": "Optical infrastructure",
  "Optical path": "Optical infrastructure",
  "Mounting structure": "Optical infrastructure",
  "Power source": "Optical infrastructure",
  "Optical controller": "Optical infrastructure",
  "Fiber handoff": "Network",
  "Customer router": "Network",
  "Partner router": "Network",
  "Aggregation router": "Network",
  Switch: "Network",
  "Mobile tower": "Network",
  "Data center": "Network",
  "Network point of presence": "Network",
  "RF fallback": "Resilience",
  "Alternate optical route": "Resilience",
  "Fiber backup route": "Resilience",
  "Secondary aggregation path": "Resilience",
  "Backup power": "Resilience",
  Region: "Operational context",
  Site: "Operational context",
  "Operating partner": "Operational context",
  "Service owner": "Operational context",
  SLO: "Operational context",
  Incident: "Operational context",
  Situation: "Operational context",
  Change: "Operational context",
  "Field work order": "Operational context",
  "Digital coworker": "Operational context",
  "Weather condition": "Operational context",
  "Evidence record": "Operational context",
};

export const TOPOLOGY_HEALTH = [
  "Healthy",
  "At risk",
  "Degraded",
  "Unavailable",
  "On fallback",
  "Under maintenance",
  "Planned change",
  "Telemetry stale",
  "Ownership unclear",
  "Unprotected dependency",
] as const;
export type TopologyHealth = (typeof TOPOLOGY_HEALTH)[number];

/** Short text glyph so status is never conveyed by colour alone. */
export const healthGlyph: Record<TopologyHealth, string> = {
  Healthy: "OK",
  "At risk": "!",
  Degraded: "▼",
  Unavailable: "×",
  "On fallback": "⇄",
  "Under maintenance": "⚒",
  "Planned change": "⟳",
  "Telemetry stale": "⏱",
  "Ownership unclear": "?",
  "Unprotected dependency": "△",
};

export const healthChip: Record<TopologyHealth, string> = {
  Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "At risk": "border-amber-200 bg-amber-50 text-amber-800",
  Degraded: "border-orange-200 bg-orange-50 text-orange-800",
  Unavailable: "border-rose-200 bg-rose-50 text-rose-700",
  "On fallback": "border-sky-200 bg-sky-50 text-sky-700",
  "Under maintenance": "border-slate-200 bg-slate-50 text-slate-600",
  "Planned change": "border-violet-200 bg-violet-50 text-violet-700",
  "Telemetry stale": "border-slate-300 bg-slate-100 text-slate-600",
  "Ownership unclear": "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  "Unprotected dependency": "border-rose-300 bg-rose-50 text-rose-800",
};

export const healthStroke: Record<TopologyHealth, string> = {
  Healthy: "#059669",
  "At risk": "#d97706",
  Degraded: "#ea580c",
  Unavailable: "#e11d48",
  "On fallback": "#0284c7",
  "Under maintenance": "#64748b",
  "Planned change": "#7c3aed",
  "Telemetry stale": "#94a3b8",
  "Ownership unclear": "#c026d3",
  "Unprotected dependency": "#be123c",
};

export const RELATIONSHIPS = [
  "consumes service",
  "uses route",
  "includes terminal",
  "connects through optical path",
  "connects to network handoff",
  "protected by fallback route",
  "located at site",
  "belongs to region",
  "operated by partner",
  "owned by team",
  "governed by SLO",
  "affected by incident",
  "modified by change",
  "threatened by weather condition",
  "monitored by agent",
  "recommended action by agent",
  "depends on partner network",
  "supported by evidence",
  "powered by",
  "delivers traffic to",
] as const;
export type RelationshipKind = (typeof RELATIONSHIPS)[number];

export const OWNERS = [
  "Taara operations",
  "Customer network team",
  "Network operating partner",
  "Fiber partner",
  "Field service partner",
  "Cloud platform team",
  "Regional operations",
  "Product engineering",
] as const;
export type Owner = (typeof OWNERS)[number];

export const TOPOLOGY_VIEWS = [
  "Customer service view",
  "Optical infrastructure view",
  "Network dependency view",
  "Resilience view",
  "Partner ownership view",
  "Incident impact view",
  "Change impact view",
  "Agent activity view",
] as const;
export type TopologyView = (typeof TOPOLOGY_VIEWS)[number];

export const TOPOLOGY_SAVED_VIEWS = [
  "Default topology view",
  "Chennai weather exposure",
  "California upstream failure",
  "Unprotected dependencies",
  "Partner owned components",
] as const;

export const RISK_BANDS = ["Low", "Moderate", "High", "Critical"] as const;
export type RiskBand = (typeof RISK_BANDS)[number];

export const riskChipClass: Record<RiskBand, string> = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Moderate: "border-amber-200 bg-amber-50 text-amber-800",
  High: "border-orange-200 bg-orange-50 text-orange-800",
  Critical: "border-rose-200 bg-rose-50 text-rose-700",
};

/* -------------------------------- model --------------------------------- */

export interface TopoNode {
  id: string;
  label: string;
  kind: NodeKind;
  health: TopologyHealth;
  risk: RiskBand;
  owner: Owner;
  partner?: string;
  capacity: string;
  throughput: string;
  latency: string;
  state: string;
  freshness: string;
  agentActivity: string;
  customerImpact: string;
  site?: string;
  region: Region;
  detail: [string, string][];
  /** Canvas coordinates in a 0..200 by 0..110 space. */
  x: number;
  y: number;
  /** Chain stage index for the end to end path, when applicable. */
  stage?: number;
  /** Only rendered when the corresponding view or overlay is active. */
  context?: boolean;
}

export interface TopoEdge {
  id: string;
  from: string;
  to: string;
  relationship: RelationshipKind;
  health: TopologyHealth;
  risk: RiskBand;
  owner: Owner;
  capacity: string;
  throughput: string;
  latency: string;
  state: string;
  lastValidated: string;
  evidence: string;
  agentActivity: string;
  customerImpact: string;
  /** Resilience edges are dashed and only shown with alternates enabled. */
  alternate?: boolean;
  context?: boolean;
}

export interface TopoGraph {
  nodes: TopoNode[];
  edges: TopoEdge[];
  chain: string[];
}

/* ------------------------------- builders -------------------------------- */

const fmt = (n: number) => `${n} Gbps`;

/**
 * Deterministically derives the topology for a customer service. The Chennai
 * and California services carry the two demonstration stories; every other
 * service resolves to the same shape with healthy defaults.
 */
export function buildTopology(service: CustomerService): TopoGraph {
  const link = links.find((l) => l.id === service.linkId);
  const terminalA = link?.terminalA ?? "Terminal A";
  const terminalB = link?.terminalB ?? "Terminal B";
  const california = service.id === "csvc-california-012";
  const chennai = service.id === DEFAULT_SERVICE_ID;
  const degraded = service.sloStatus !== "Within objective";
  const region = service.region;
  const partner = california ? "Pacific Fiber Partners" : chennai ? "Chennai Metro Fiber Partners" : "Regional Network Partner";

  const opticalHealth: TopologyHealth = california ? "Healthy" : degraded ? "At risk" : "Healthy";
  const handoffHealth: TopologyHealth = california ? "Unavailable" : "Healthy";
  const serviceHealth: TopologyHealth = california ? "Unavailable" : degraded ? "At risk" : "Healthy";

  const n = (node: TopoNode) => node;

  const nodes: TopoNode[] = [
    n({
      id: "t-customer", label: service.customer, kind: "Customer", health: "Healthy", risk: "Low",
      owner: "Customer network team", capacity: fmt(service.committedGbps), throughput: fmt(service.deliveredGbps),
      latency: "0.2 ms", state: "Consuming service", freshness: "12 s ago", agentActivity: "Customer Impact Agent monitoring",
      customerImpact: service.usersAffected, region, x: 10, y: 46, stage: 0,
      detail: [["Customer priority", service.priority], ["Services consumed", "4 synthetic services"], ["Escalation contact", "Customer NOC duty manager"]],
    }),
    n({
      id: "t-service", label: service.name, kind: "Customer service", health: serviceHealth, risk: service.risk === "Critical" ? "Critical" : service.risk === "High" ? "High" : "Moderate",
      owner: "Taara operations", capacity: fmt(service.committedGbps), throughput: fmt(service.deliveredGbps),
      latency: `${service.latencyMs} ms`, state: service.sloStatus, freshness: "12 s ago",
      agentActivity: "SLO Guardian tracking", customerImpact: service.usersAffected, region, x: 10, y: 78,
      detail: [["Service type", service.serviceType], ["Availability", `${service.availability}%`], ["Error budget", `${service.errorBudgetPct}%`]],
    }),
    n({
      id: "t-edge", label: "Customer edge router", kind: "Customer edge", health: "Healthy", risk: "Low",
      owner: "Customer network team", capacity: fmt(service.committedGbps), throughput: fmt(service.deliveredGbps),
      latency: "0.3 ms", state: "Forwarding", freshness: "18 s ago", agentActivity: "None", customerImpact: "None currently attributed",
      region, x: 34, y: 46, stage: 1,
      detail: [["Platform", "Customer managed edge"], ["Port state", "Up"], ["Config drift", "None detected"]],
    }),
    n({
      id: "t-partner-net", label: `${partner} aggregation`, kind: "Partner router", health: california ? "Degraded" : "Healthy",
      risk: california ? "Critical" : "Moderate", owner: "Network operating partner", partner,
      capacity: fmt(service.committedGbps * 4), throughput: fmt(california ? 0 : service.deliveredGbps), latency: "0.6 ms",
      state: california ? "Isolated behind failed handoff" : "Forwarding", freshness: california ? "6 m ago" : "20 s ago",
      agentActivity: "Partner Escalation Agent engaged", customerImpact: california ? "Full service outage" : "None currently attributed",
      region, x: 58, y: 46, stage: 2,
      detail: [["Partner", partner], ["Shared responsibility", "Partner operates, Taara monitors"], ["Escalation", california ? "Escalation owner unassigned" : "Partner NOC 24x7"]],
    }),
    n({
      id: "t-handoff", label: california ? "California DCI fiber handoff 012" : "Fiber network handoff", kind: "Fiber handoff",
      health: handoffHealth, risk: california ? "Critical" : "Moderate", owner: "Fiber partner", partner,
      capacity: fmt(service.committedGbps), throughput: fmt(california ? 0 : service.deliveredGbps), latency: "0.4 ms",
      state: california ? "Port down since 02:21 local" : "Up", freshness: california ? "4 m ago" : "22 s ago",
      agentActivity: california ? "Service Dependency Agent isolating fault" : "Topology Quality Agent validating",
      customerImpact: california ? "Customer service unavailable" : "None currently attributed",
      region, x: 82, y: 46, stage: 3,
      detail: [["Handoff type", "Partner fiber cross connect"], ["Errors", california ? "Link down, no light" : "0 CRC errors in 24 h"], ["Escalation contact", california ? "Not assigned" : "Fiber partner duty engineer"]],
    }),
    n({
      id: "t-terminal-a", label: terminalA, kind: "Optical terminal", health: chennai ? "At risk" : "Healthy",
      risk: chennai ? "High" : "Low", owner: "Taara operations", capacity: fmt(service.committedGbps),
      throughput: fmt(service.deliveredGbps), latency: "0.6 ms", state: link?.beamLock ?? "Locked",
      freshness: "9 s ago", agentActivity: "Optical Path Investigator watching", customerImpact: chennai ? "Contributing to forecast SLO risk" : "None",
      region, site: `${terminalA} rooftop site`, x: 106, y: 46, stage: 4,
      detail: [["Terminal identifier", `${service.linkId}-A`], ["Product", service.product], ["Firmware", "3.8.2"], ["Received optical power", link?.rxPowerDbm ?? "-24.0 dBm"], ["Link margin", link?.marginDb ?? "8.0 dB"], ["Pointing error", "0.014°"], ["Power state", "Utility with battery backup"], ["Temperature", "41 °C"], ["Mounting health", "Inspection pending"]],
    }),
    n({
      id: "t-optical", label: "Primary optical path", kind: "Optical path", health: opticalHealth,
      risk: chennai ? "High" : "Low", owner: "Taara operations", capacity: fmt(service.committedGbps),
      throughput: fmt(service.deliveredGbps), latency: "1.4 ms", state: california ? "Healthy, carrying no traffic" : "Active",
      freshness: "9 s ago", agentActivity: "Weather Risk Agent correlating",
      customerImpact: chennai ? "182,000 subscribers exposed to forecast degradation" : "None",
      region, x: 130, y: 30, stage: 5,
      detail: [["Link identifier", service.linkId], ["Terminal pair", `${terminalA} ↔ ${terminalB}`], ["Distance", `${link?.distanceKm ?? 4} km`], ["Availability", link?.availability ?? "99.99%"], ["Optical attenuation", link?.attenuationDb ?? "1.4 dB/km"], ["Visibility", link?.visibilityKm ?? "12 km"], ["Weather exposure", link?.weatherRisk ?? "None material"], ["Predicted risk", chennai ? "Fog crossing threshold within 6 hours" : "None material"]],
    }),
    n({
      id: "t-terminal-b", label: terminalB, kind: "Optical terminal", health: chennai ? "At risk" : "Healthy",
      risk: chennai ? "High" : "Low", owner: "Taara operations", capacity: fmt(service.committedGbps),
      throughput: fmt(service.deliveredGbps), latency: "0.6 ms", state: "Locked", freshness: "9 s ago",
      agentActivity: "Beam Alignment Agent active", customerImpact: chennai ? "Contributing to forecast SLO risk" : "None",
      region, site: `${terminalB} site`, x: 154, y: 46, stage: 6,
      detail: [["Terminal identifier", `${service.linkId}-B`], ["Product", service.product], ["Firmware", "3.8.2"], ["Beam lock", "Locked — 6 h 12 m"], ["Received optical power", "-25.1 dBm"], ["Link margin", "7.1 dB"], ["Pointing error", "0.021°"], ["Power state", "Utility"], ["Temperature", "39 °C"], ["Mounting health", "Healthy"]],
    }),
    n({
      id: "t-aggregation", label: "Regional aggregation router", kind: "Aggregation router", health: "Healthy", risk: "Low",
      owner: "Taara operations", capacity: fmt(service.committedGbps * 4), throughput: fmt(service.deliveredGbps),
      latency: "1.1 ms", state: "Forwarding", freshness: "15 s ago", agentActivity: "Global Link Health Agent monitoring",
      customerImpact: "None currently attributed", region, x: 178, y: 46, stage: 7,
      detail: [["Platform", "Regional aggregation"], ["Redundancy", "Dual homed"], ["Capacity headroom", "62%"]],
    }),
    n({
      id: "t-tower", label: "Mobile tower cluster", kind: "Mobile tower", health: california ? "Unavailable" : "Healthy",
      risk: california ? "Critical" : "Moderate", owner: "Customer network team", capacity: fmt(service.committedGbps),
      throughput: fmt(california ? 0 : service.deliveredGbps), latency: "1.8 ms", state: california ? "No transport" : "Serving traffic",
      freshness: "30 s ago", agentActivity: "Customer Impact Agent quantifying", customerImpact: service.usersAffected,
      region, x: 196, y: 30, stage: 8,
      detail: [["Clusters", "3 synthetic clusters"], ["Sites served", "38 synthetic tower sites"], ["Backhaul dependency", "Single service"]],
    }),
    n({
      id: "t-users", label: "Downstream users", kind: "User population", health: california ? "Unavailable" : degraded ? "At risk" : "Healthy",
      risk: california ? "Critical" : "Moderate", owner: "Customer network team", capacity: "Not applicable",
      throughput: "Not applicable", latency: "Not applicable", state: california ? "Service unavailable" : "Served",
      freshness: "1 m ago", agentActivity: "Customer Impact Agent quantifying", customerImpact: service.usersAffected,
      region, x: 196, y: 66, stage: 9,
      detail: [["Population", service.usersAffected], ["Priority", service.priority], ["Impact basis", "Synthetic demonstration estimate"]],
    }),

    /* resilience */
    n({
      id: "t-rf", label: "Integrated RF fallback", kind: "RF fallback", health: "On fallback", risk: "Moderate",
      owner: "Taara operations", capacity: fmt(Math.round(service.committedGbps * 0.6)), throughput: fmt(0),
      latency: "7.8 ms", state: "Validated standby", freshness: "3 m ago", agentActivity: "RF Fallback Guardian validating",
      customerImpact: "Protects committed capacity at reduced throughput", region, x: 130, y: 66,
      detail: [["Readiness", "Validated 14 minutes ago"], ["Activation time", "Under 60 seconds"], ["Policy status", "Approved for preventive use"]],
    }),
    n({
      id: "t-alt-optical", label: "Alternate optical route", kind: "Alternate optical route", health: "Healthy", risk: "Moderate",
      owner: "Taara operations", capacity: fmt(Math.round(service.committedGbps * 0.7)), throughput: fmt(0),
      latency: "2.1 ms", state: "Standby", freshness: "9 m ago", agentActivity: "Optical Path Investigator evaluating",
      customerImpact: "Preserves optical transport at reduced capacity", region, x: 130, y: 86,
      detail: [["Readiness", "Requires 4 minute reconvergence"], ["Activation time", "4 minutes"], ["Policy status", "Approval required"]],
    }),
    n({
      id: "t-fiber-backup", label: "Alternate fiber route", kind: "Fiber backup route", health: "Healthy", risk: "Moderate",
      owner: "Fiber partner", partner, capacity: fmt(Math.round(service.committedGbps * 0.5)), throughput: fmt(0),
      latency: "3.4 ms", state: "Standby", freshness: "22 m ago", agentActivity: "Partner Escalation Agent tracking",
      customerImpact: "Partner dependent recovery path", region, x: 106, y: 86,
      detail: [["Readiness", "Partner activation required"], ["Activation time", "35 minutes"], ["Policy status", "Partner approval required"]],
    }),
    n({
      id: "t-power", label: "Rooftop power dependency", kind: "Power source", health: "Healthy", risk: "Moderate",
      owner: "Regional operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable",
      state: "Utility feed with battery backup", freshness: "2 m ago", agentActivity: "Topology Quality Agent monitoring",
      customerImpact: "Loss removes Terminal A from service", region, x: 106, y: 14,
      detail: [["Backup", "4 hour battery"], ["Last test", "18 days ago"], ["Unprotected", "Generator not present"]],
    }),
    n({
      id: "t-backup-power", label: "Backup power", kind: "Backup power", health: "Healthy", risk: "Low",
      owner: "Field service partner", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable",
      state: "Battery charged", freshness: "2 m ago", agentActivity: "None", customerImpact: "Sustains terminal for 4 hours",
      region, x: 82, y: 14,
      detail: [["Type", "Battery"], ["Autonomy", "4 hours"], ["Owner", "Field service partner"]],
    }),
    n({
      id: "t-telemetry", label: "GCP telemetry ingestion", kind: "Data center", health: "Healthy", risk: "Low",
      owner: "Cloud platform team", capacity: "Not applicable", throughput: "18k events per minute", latency: "9 s pipeline",
      state: "Ingesting", freshness: "9 s ago", agentActivity: "Topology Quality Agent validating freshness",
      customerImpact: "Loss reduces operational visibility", region, x: 154, y: 14,
      detail: [["Pipeline", "Synthetic telemetry ingestion"], ["Freshness", "9 seconds"], ["Coverage", "100% of route objects"]],
    }),

    /* operational context */
    n({
      id: "t-region", label: `${region} region`, kind: "Region", health: "Healthy", risk: "Moderate", owner: "Regional operations",
      capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: "Operational",
      freshness: "5 m ago", agentActivity: "Regional watch active", customerImpact: "Region wide exposure context",
      region, x: 58, y: 86, context: true,
      detail: [["Sites", "38 synthetic sites"], ["Services", "26 synthetic services"], ["Operating partners", "3"]],
    }),
    n({
      id: "t-partner", label: partner, kind: "Operating partner", health: california ? "Ownership unclear" : "Healthy",
      risk: california ? "Critical" : "Moderate", owner: "Network operating partner", partner,
      capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable",
      state: california ? "Escalation owner unassigned" : "Contracted and responsive", freshness: "8 m ago",
      agentActivity: "Partner Escalation Agent engaged", customerImpact: california ? "Delays recovery of the customer service" : "None",
      region, x: 82, y: 86, context: true,
      detail: [["Partner type", "Fiber and network operating partner"], ["Regions supported", `${region} and adjacent metros`], ["Open field work", california ? "2 open orders" : "1 open order"]],
    }),
    n({
      id: "t-slo", label: `${service.name} SLO`, kind: "SLO", health: degraded ? "At risk" : "Healthy",
      risk: degraded ? "High" : "Low", owner: "Taara operations", capacity: "Not applicable", throughput: "Not applicable",
      latency: `< ${service.latencyObjectiveMs} ms`, state: service.sloStatus, freshness: "1 m ago",
      agentActivity: "SLO Guardian tracking", customerImpact: `${service.errorBordgetLabel ?? service.errorBudgetPct}% error budget remaining`,
      region, x: 34, y: 86, context: true,
      detail: [["Availability objective", `${service.availabilityObjective}%`], ["Latency objective", `< ${service.latencyObjectiveMs} ms`], ["Error budget", `${service.errorBudgetPct}%`]],
    }),
    n({
      id: "t-situation", label: situations.find((s) => s.id === service.situationId)?.title ?? "No active situation",
      kind: "Situation", health: service.situationId ? "At risk" : "Healthy", risk: service.situationId ? "High" : "Low",
      owner: "Taara operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable",
      state: service.situationId ? "Under investigation" : "None", freshness: "3 m ago",
      agentActivity: "Weather Risk Agent correlating", customerImpact: service.usersAffected,
      region, x: 154, y: 86, context: true,
      detail: [["Situation identifier", service.situationId ?? "None"], ["Severity", service.situationId ? "High" : "None"], ["Evidence records", "4"]],
    }),
    n({
      id: "t-change", label: "Firmware upgrade 3.8.3 scheduled", kind: "Change", health: "Planned change", risk: "Moderate",
      owner: "Product engineering", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable",
      state: "Scheduled in 3 days", freshness: "1 h ago", agentActivity: "Change Risk Agent assessing",
      customerImpact: "Brief beam re-acquisition per terminal", region, x: 178, y: 86, context: true,
      detail: [["Change window", "Sunday 02:00 to 04:00 local"], ["Objects modified", "2 terminals"], ["Approval", "Change approver assigned"]],
    }),
    n({
      id: "t-weather", label: chennai ? "Dense fog forecast" : "No material weather risk", kind: "Weather condition",
      health: chennai ? "At risk" : "Healthy", risk: chennai ? "High" : "Low", owner: "Regional operations",
      capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable",
      state: chennai ? "Visibility falling to 0.9 km within 6 hours" : "Clear", freshness: "6 m ago",
      agentActivity: "Weather Risk Agent forecasting", customerImpact: chennai ? "Primary driver of forecast SLO breach" : "None",
      region, x: 178, y: 14, context: true,
      detail: [["Source", "Regional weather service"], ["Confidence", "92%"], ["Window", "Next 6 hours"]],
    }),
    n({
      id: "t-agent", label: "Service Dependency Agent", kind: "Digital coworker", health: "Healthy", risk: "Low",
      owner: "Taara operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable",
      state: "Analyzing the service chain", freshness: "20 s ago", agentActivity: "Active",
      customerImpact: "Explains dependencies behind the customer outcome", region, x: 10, y: 14, context: true,
      detail: [["Confidence", "94%"], ["Objects analyzed", "24"], ["Guardrail", "Read only on customer traffic"]],
    }),
    n({
      id: "t-field", label: "Rooftop mount inspection", kind: "Field work order", health: "Under maintenance", risk: "Moderate",
      owner: "Field service partner", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable",
      state: "Pending scheduling", freshness: "2 h ago", agentActivity: "None",
      customerImpact: "No current impact", region, x: 34, y: 14, context: true,
      detail: [["Work order", "FWO-2291"], ["Site", `${terminalA} rooftop site`], ["Partner", "Field service partner"]],
    }),
  ];

  const e = (edge: TopoEdge) => edge;
  const ok: TopologyHealth = california ? "Unavailable" : degraded ? "At risk" : "Healthy";

  const edges: TopoEdge[] = [
    e({ id: "te-consumes", from: "t-customer", to: "t-service", relationship: "consumes service", health: ok, risk: "Moderate", owner: "Customer network team", capacity: fmt(service.committedGbps), throughput: fmt(service.deliveredGbps), latency: "0.2 ms", state: "Contracted", lastValidated: "12 s ago", evidence: "Service catalogue record", agentActivity: "Customer Impact Agent", customerImpact: service.usersAffected }),
    e({ id: "te-edge", from: "t-customer", to: "t-edge", relationship: "uses route", health: "Healthy", risk: "Low", owner: "Customer network team", capacity: fmt(service.committedGbps), throughput: fmt(service.deliveredGbps), latency: "0.3 ms", state: "Active", lastValidated: "18 s ago", evidence: "Interface counters", agentActivity: "None", customerImpact: "None" }),
    e({ id: "te-partner", from: "t-edge", to: "t-partner-net", relationship: "depends on partner network", health: california ? "Degraded" : "Healthy", risk: california ? "Critical" : "Moderate", owner: "Network operating partner", capacity: fmt(service.committedGbps), throughput: fmt(california ? 0 : service.deliveredGbps), latency: "0.6 ms", state: california ? "Upstream failure" : "Active", lastValidated: "20 s ago", evidence: "Partner interface telemetry", agentActivity: "Partner Escalation Agent", customerImpact: california ? "Full outage" : "None" }),
    e({ id: "te-handoff", from: "t-partner-net", to: "t-handoff", relationship: "connects to network handoff", health: handoffHealth, risk: california ? "Critical" : "Moderate", owner: "Fiber partner", capacity: fmt(service.committedGbps), throughput: fmt(california ? 0 : service.deliveredGbps), latency: "0.4 ms", state: california ? "Down" : "Up", lastValidated: california ? "4 m ago" : "22 s ago", evidence: "Optical port state", agentActivity: "Service Dependency Agent", customerImpact: california ? "Customer service unavailable" : "None" }),
    e({ id: "te-uplink", from: "t-handoff", to: "t-terminal-a", relationship: "includes terminal", health: california ? "Degraded" : "Healthy", risk: "Moderate", owner: "Taara operations", capacity: fmt(service.committedGbps), throughput: fmt(california ? 0 : service.deliveredGbps), latency: "0.2 ms", state: california ? "No upstream traffic" : "Active", lastValidated: "9 s ago", evidence: "Terminal ingress counters", agentActivity: "Optical Path Investigator", customerImpact: california ? "Terminal healthy but idle" : "None" }),
    e({ id: "te-optical-a", from: "t-terminal-a", to: "t-optical", relationship: "connects through optical path", health: opticalHealth, risk: chennai ? "High" : "Low", owner: "Taara operations", capacity: fmt(service.committedGbps), throughput: fmt(california ? 0 : service.deliveredGbps), latency: "0.7 ms", state: california ? "Healthy, idle" : "Active", lastValidated: "9 s ago", evidence: "Beam lock and margin series", agentActivity: "Beam Alignment Agent", customerImpact: chennai ? "Forecast degradation risk" : "None" }),
    e({ id: "te-optical-b", from: "t-optical", to: "t-terminal-b", relationship: "connects through optical path", health: opticalHealth, risk: chennai ? "High" : "Low", owner: "Taara operations", capacity: fmt(service.committedGbps), throughput: fmt(california ? 0 : service.deliveredGbps), latency: "0.7 ms", state: california ? "Healthy, idle" : "Active", lastValidated: "9 s ago", evidence: "Beam lock and margin series", agentActivity: "Beam Alignment Agent", customerImpact: chennai ? "Forecast degradation risk" : "None" }),
    e({ id: "te-agg", from: "t-terminal-b", to: "t-aggregation", relationship: "connects to network handoff", health: "Healthy", risk: "Low", owner: "Taara operations", capacity: fmt(service.committedGbps * 4), throughput: fmt(california ? 0 : service.deliveredGbps), latency: "1.1 ms", state: "Active", lastValidated: "15 s ago", evidence: "Aggregation interface counters", agentActivity: "Global Link Health Agent", customerImpact: "None" }),
    e({ id: "te-tower", from: "t-aggregation", to: "t-tower", relationship: "delivers traffic to", health: california ? "Unavailable" : "Healthy", risk: california ? "Critical" : "Moderate", owner: "Customer network team", capacity: fmt(service.committedGbps), throughput: fmt(california ? 0 : service.deliveredGbps), latency: "1.8 ms", state: california ? "No transport" : "Active", lastValidated: "30 s ago", evidence: "Tower cluster telemetry", agentActivity: "Customer Impact Agent", customerImpact: service.usersAffected }),
    e({ id: "te-users", from: "t-tower", to: "t-users", relationship: "delivers traffic to", health: california ? "Unavailable" : degraded ? "At risk" : "Healthy", risk: california ? "Critical" : "Moderate", owner: "Customer network team", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: california ? "Users unserved" : "Users served", lastValidated: "1 m ago", evidence: "Synthetic subscriber model", agentActivity: "Customer Impact Agent", customerImpact: service.usersAffected }),

    /* resilience */
    e({ id: "te-rf", from: "t-service", to: "t-rf", relationship: "protected by fallback route", health: "On fallback", risk: "Moderate", owner: "Taara operations", capacity: fmt(Math.round(service.committedGbps * 0.6)), throughput: fmt(0), latency: "7.8 ms", state: "Validated standby", lastValidated: "14 m ago", evidence: "Fallback validation record", agentActivity: "RF Fallback Guardian", customerImpact: "Protects committed capacity", alternate: true }),
    e({ id: "te-rf-path", from: "t-terminal-a", to: "t-rf", relationship: "protected by fallback route", health: "On fallback", risk: "Moderate", owner: "Taara operations", capacity: fmt(Math.round(service.committedGbps * 0.6)), throughput: fmt(0), latency: "7.8 ms", state: "Validated standby", lastValidated: "14 m ago", evidence: "RF capacity reservation", agentActivity: "RF Fallback Guardian", customerImpact: "Reduced throughput path", alternate: true }),
    e({ id: "te-alt", from: "t-terminal-a", to: "t-alt-optical", relationship: "protected by fallback route", health: "Healthy", risk: "Moderate", owner: "Taara operations", capacity: fmt(Math.round(service.committedGbps * 0.7)), throughput: fmt(0), latency: "2.1 ms", state: "Standby", lastValidated: "9 m ago", evidence: "Alternate path survey", agentActivity: "Optical Path Investigator", customerImpact: "Reduced capacity path", alternate: true }),
    e({ id: "te-fiber", from: "t-handoff", to: "t-fiber-backup", relationship: "protected by fallback route", health: "Healthy", risk: "Moderate", owner: "Fiber partner", capacity: fmt(Math.round(service.committedGbps * 0.5)), throughput: fmt(0), latency: "3.4 ms", state: "Standby", lastValidated: "22 m ago", evidence: "Partner capacity confirmation", agentActivity: "Partner Escalation Agent", customerImpact: "Partner dependent recovery", alternate: true }),
    e({ id: "te-power", from: "t-terminal-a", to: "t-power", relationship: "powered by", health: "Healthy", risk: "Moderate", owner: "Regional operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: "Utility feed", lastValidated: "2 m ago", evidence: "Site power telemetry", agentActivity: "Topology Quality Agent", customerImpact: "Loss removes terminal from service" }),
    e({ id: "te-backup-power", from: "t-power", to: "t-backup-power", relationship: "powered by", health: "Healthy", risk: "Low", owner: "Field service partner", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: "Charged", lastValidated: "2 m ago", evidence: "Battery test record", agentActivity: "None", customerImpact: "4 hours of autonomy", alternate: true }),
    e({ id: "te-telemetry", from: "t-terminal-b", to: "t-telemetry", relationship: "supported by evidence", health: "Healthy", risk: "Low", owner: "Cloud platform team", capacity: "Not applicable", throughput: "18k events per minute", latency: "9 s", state: "Ingesting", lastValidated: "9 s ago", evidence: "Telemetry freshness index", agentActivity: "Topology Quality Agent", customerImpact: "Operational visibility", context: true }),

    /* operational context */
    e({ id: "te-region", from: "t-service", to: "t-region", relationship: "belongs to region", health: "Healthy", risk: "Low", owner: "Regional operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: "Mapped", lastValidated: "5 m ago", evidence: "Site registry", agentActivity: "None", customerImpact: "Regional exposure context", context: true }),
    e({ id: "te-partner-op", from: "t-handoff", to: "t-partner", relationship: "operated by partner", health: california ? "Ownership unclear" : "Healthy", risk: california ? "Critical" : "Moderate", owner: "Network operating partner", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: california ? "Escalation owner unassigned" : "Contracted", lastValidated: "8 m ago", evidence: "Partner responsibility matrix", agentActivity: "Partner Escalation Agent", customerImpact: california ? "Recovery delayed" : "None", context: true }),
    e({ id: "te-slo", from: "t-service", to: "t-slo", relationship: "governed by SLO", health: degraded ? "At risk" : "Healthy", risk: degraded ? "High" : "Low", owner: "Taara operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: service.sloStatus, lastValidated: "1 m ago", evidence: "SLO calculation record", agentActivity: "SLO Guardian", customerImpact: `${service.errorBudgetPct}% error budget remaining`, context: true }),
    e({ id: "te-situation", from: "t-optical", to: "t-situation", relationship: "affected by incident", health: service.situationId ? "At risk" : "Healthy", risk: service.situationId ? "High" : "Low", owner: "Taara operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: service.situationId ? "Linked" : "None", lastValidated: "3 m ago", evidence: "Situation evidence bundle", agentActivity: "Weather Risk Agent", customerImpact: service.usersAffected, context: true }),
    e({ id: "te-change", from: "t-terminal-b", to: "t-change", relationship: "modified by change", health: "Planned change", risk: "Moderate", owner: "Product engineering", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: "Scheduled", lastValidated: "1 h ago", evidence: "Change record", agentActivity: "Change Risk Agent", customerImpact: "Brief re-acquisition", context: true }),
    e({ id: "te-weather", from: "t-optical", to: "t-weather", relationship: "threatened by weather condition", health: chennai ? "At risk" : "Healthy", risk: chennai ? "High" : "Low", owner: "Regional operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: chennai ? "Forecast threat" : "Clear", lastValidated: "6 m ago", evidence: "Regional weather feed", agentActivity: "Weather Risk Agent", customerImpact: chennai ? "Forecast SLO breach" : "None", context: true }),
    e({ id: "te-agent", from: "t-agent", to: "t-service", relationship: "monitored by agent", health: "Healthy", risk: "Low", owner: "Taara operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: "Analyzing", lastValidated: "20 s ago", evidence: "Agent decision log", agentActivity: "Service Dependency Agent", customerImpact: "Explains dependencies", context: true }),
    e({ id: "te-field", from: "t-terminal-a", to: "t-field", relationship: "located at site", health: "Under maintenance", risk: "Moderate", owner: "Field service partner", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", state: "Inspection pending", lastValidated: "2 h ago", evidence: "Field work order", agentActivity: "None", customerImpact: "None currently", context: true }),
  ];

  const chain = [
    "t-customer", "t-edge", "t-partner-net", "t-handoff", "t-terminal-a",
    "t-optical", "t-terminal-b", "t-aggregation", "t-tower", "t-users",
  ];

  return { nodes, edges, chain };
}

/* --------------------------------- KPIs ---------------------------------- */

export interface TopologyKpi {
  id: string;
  title: string;
  value: string;
  sub: string;
  status: "good" | "watch" | "risk";
  trend: "up" | "down" | "flat";
  delta: string;
  explain: string;
  spark: number[];
  filter: { kind: "none" | "health" | "risk" | "owner" | "view"; value?: string };
}

export const topologyKpis: TopologyKpi[] = [
  { id: "services", title: "Customer Services Mapped", value: "320", sub: "100% linked to end to end service routes", status: "good", trend: "up", delta: "+6 vs previous period", explain: "Customer services with a complete synthetic dependency chain.", spark: [301, 306, 310, 314, 318, 320], filter: { kind: "view", value: "Customer service view" } },
  { id: "links", title: "Active Optical Links", value: "1,248", sub: "Across 23 synthetic operating countries", status: "good", trend: "up", delta: "+18 vs previous period", explain: "Optical links currently carrying or ready to carry customer traffic.", spark: [1198, 1211, 1224, 1233, 1241, 1248], filter: { kind: "view", value: "Optical infrastructure view" } },
  { id: "pairs", title: "Terminal Pairs", value: "1,248", sub: "2,496 managed terminals", status: "good", trend: "flat", delta: "+18 vs previous period", explain: "Paired terminals forming each optical path.", spark: [1198, 1211, 1224, 1233, 1241, 1248], filter: { kind: "view", value: "Optical infrastructure view" } },
  { id: "handoffs", title: "Network Handoffs", value: "684", sub: "Customer, partner, and aggregation connections", status: "watch", trend: "up", delta: "+9 vs previous period", explain: "Network boundaries where ownership changes hands.", spark: [660, 666, 671, 676, 681, 684], filter: { kind: "view", value: "Network dependency view" } },
  { id: "resilient", title: "Resilient Services", value: "87.5%", sub: "Services with validated alternate transport", status: "good", trend: "up", delta: "+1.4 pts vs previous period", explain: "Services with at least one validated alternate transport path.", spark: [84.1, 85.0, 85.8, 86.4, 87.1, 87.5], filter: { kind: "view", value: "Resilience view" } },
  { id: "unprotected", title: "Unprotected Dependencies", value: "17", sub: "Single points of customer service failure", status: "risk", trend: "down", delta: "-3 vs previous period", explain: "Dependencies with no validated alternate path.", spark: [24, 22, 21, 19, 18, 17], filter: { kind: "health", value: "Unprotected dependency" } },
  { id: "partners", title: "Partners in Service Chain", value: "14", sub: "Network, field, and operating partners", status: "watch", trend: "flat", delta: "No change vs previous period", explain: "Third parties operating components inside customer service chains.", spark: [14, 14, 14, 14, 14, 14], filter: { kind: "view", value: "Partner ownership view" } },
  { id: "risks", title: "Topology Risks Detected", value: "11", sub: "4 critical, 3 high, 4 moderate", status: "risk", trend: "up", delta: "+2 vs previous period", explain: "Structural risks detected across the synthetic topology.", spark: [7, 8, 8, 9, 10, 11], filter: { kind: "risk", value: "Critical" } },
];

/* ------------------------------- overlays -------------------------------- */

export interface TopologyOverlayItem {
  id: string;
  category: "Active incidents" | "Predicted weather risks" | "Planned changes" | "Maintenance" | "Capacity pressure" | "SLO risk" | "Ownership gaps" | "Telemetry gaps" | "Firmware risk" | "Field work";
  title: string;
  region: Region;
  severity: RiskBand;
  affectedNodes: string[];
  detail: string;
}

export const topologyOverlays: TopologyOverlayItem[] = [
  { id: "ov-fog", category: "Predicted weather risks", title: "Fog risk affecting Chennai optical path", region: "India", severity: "High", affectedNodes: ["t-optical", "t-terminal-a", "t-terminal-b", "t-weather"], detail: "Visibility forecast to fall below the service threshold within six hours." },
  { id: "ov-mumbai", category: "Active incidents", title: "Alignment drift affecting Mumbai terminal pair", region: "India", severity: "Moderate", affectedNodes: ["t-terminal-a", "t-terminal-b"], detail: "Pointing error trending upward on the Mumbai metro pair." },
  { id: "ov-nairobi", category: "Capacity pressure", title: "RF fallback capacity pressure in Nairobi", region: "East Africa", severity: "High", affectedNodes: ["t-rf"], detail: "Reserved fallback capacity below the committed service capacity." },
  { id: "ov-rio", category: "Capacity pressure", title: "Beam mesh capacity pressure in Rio", region: "Brazil", severity: "Moderate", affectedNodes: ["t-aggregation"], detail: "Mesh utilisation sustained above 82% during peak hours." },
  { id: "ov-california", category: "Active incidents", title: "Fiber handoff failure in California", region: "United States", severity: "Critical", affectedNodes: ["t-handoff", "t-partner-net", "t-tower", "t-users"], detail: "Partner owned fiber cross connect down while both terminals remain healthy." },
  { id: "ov-telemetry", category: "Telemetry gaps", title: "Telemetry delay affecting regional visibility", region: "Southeast Asia", severity: "Moderate", affectedNodes: ["t-telemetry"], detail: "Collector lag of four minutes on a regional ingestion shard." },
  { id: "ov-firmware", category: "Firmware risk", title: "Firmware upgrade scheduled for selected terminals", region: "India", severity: "Moderate", affectedNodes: ["t-change", "t-terminal-b"], detail: "Firmware 3.8.3 scheduled inside the approved maintenance window." },
  { id: "ov-mount", category: "Field work", title: "Mount inspection pending at a rooftop site", region: "India", severity: "Moderate", affectedNodes: ["t-field", "t-terminal-a"], detail: "Structural inspection outstanding for 12 days at the Guindy rooftop site." },
  { id: "ov-ownership", category: "Ownership gaps", title: "Escalation owner unassigned for California DCI Link 012", region: "United States", severity: "Critical", affectedNodes: ["t-partner", "t-handoff"], detail: "Upstream fiber handoff escalation owner is not assigned for California DCI Link 012." },
  { id: "ov-slo", category: "SLO risk", title: "Chennai service SLO forecast breach", region: "India", severity: "High", affectedNodes: ["t-slo", "t-service"], detail: "Error budget projected to exhaust within five days without preventive action." },
  { id: "ov-maint", category: "Maintenance", title: "Aggregation maintenance window scheduled", region: "India", severity: "Low", affectedNodes: ["t-aggregation"], detail: "Routine aggregation software maintenance in the next change window." },
];

export const OVERLAY_CATEGORIES = [...new Set(topologyOverlays.map((o) => o.category))];

/* ------------------------------ resilience -------------------------------- */

export interface ResiliencePath {
  id: string;
  route: string;
  transport: string;
  capacity: string;
  availableCapacity: string;
  latency: string;
  availability: string;
  currentState: string;
  health: TopologyHealth;
  readiness: string;
  lastValidation: string;
  owner: Owner;
  risk: RiskBand;
  activationTime: string;
  policyStatus: string;
  recommendedUse: string;
  nodeId: string;
}

export function resiliencePaths(service: CustomerService): ResiliencePath[] {
  const c = service.committedGbps;
  return [
    { id: "rp-primary", route: "Primary optical route", transport: "Optical", capacity: `${c} Gbps`, availableCapacity: `${(c - service.deliveredGbps).toFixed(1)} Gbps`, latency: "1.4 ms", availability: `${service.availability}%`, currentState: "Carrying customer traffic", health: service.sloStatus === "Within objective" ? "Healthy" : "At risk", readiness: "In service", lastValidation: "Continuous", owner: "Taara operations", risk: service.sloStatus === "Within objective" ? "Low" : "High", activationTime: "Not applicable", policyStatus: "Default path", recommendedUse: "Primary while weather remains within threshold", nodeId: "t-optical" },
    { id: "rp-rf", route: "Integrated RF fallback", transport: "RF", capacity: `${Math.round(c * 0.6)} Gbps`, availableCapacity: `${Math.round(c * 0.6)} Gbps`, latency: "7.8 ms", availability: "99.90%", currentState: "Validated standby", health: "On fallback", readiness: "Ready", lastValidation: "14 minutes ago", owner: "Taara operations", risk: "Moderate", activationTime: "Under 60 seconds", policyStatus: "Approved for preventive use", recommendedUse: "Preventive protection during fog exposure", nodeId: "t-rf" },
    { id: "rp-alt", route: "Alternate optical route", transport: "Optical", capacity: `${Math.round(c * 0.7)} Gbps`, availableCapacity: `${Math.round(c * 0.7)} Gbps`, latency: "2.1 ms", availability: "99.94%", currentState: "Standby", health: "Healthy", readiness: "Requires reconvergence", lastValidation: "9 minutes ago", owner: "Taara operations", risk: "Moderate", activationTime: "4 minutes", policyStatus: "Approval required", recommendedUse: "Secondary option if RF capacity is insufficient", nodeId: "t-alt-optical" },
    { id: "rp-fiber", route: "Alternate fiber route", transport: "Fiber", capacity: `${Math.round(c * 0.5)} Gbps`, availableCapacity: `${Math.round(c * 0.5)} Gbps`, latency: "3.4 ms", availability: "99.99%", currentState: "Standby", health: "Healthy", readiness: "Partner activation required", lastValidation: "22 minutes ago", owner: "Fiber partner", risk: "High", activationTime: "35 minutes", policyStatus: "Partner approval required", recommendedUse: "Recovery path for upstream handoff failure", nodeId: "t-fiber-backup" },
    { id: "rp-power", route: "Backup power dependency", transport: "Power", capacity: "Not applicable", availableCapacity: "4 hours autonomy", latency: "Not applicable", availability: "99.95%", currentState: "Battery charged", health: "Healthy", readiness: "Ready", lastValidation: "18 days ago", owner: "Field service partner", risk: "Moderate", activationTime: "Immediate", policyStatus: "No approval required", recommendedUse: "Sustains Terminal A during utility loss", nodeId: "t-backup-power" },
  ];
}

/* ------------------------------ blast radius ------------------------------ */

export interface BlastRadius {
  object: string;
  rows: [string, string][];
  summary: string;
  recoveryPath: string;
}

export function blastRadius(nodeId: string, service: CustomerService, graph: TopoGraph): BlastRadius {
  const node = graph.nodes.find((x) => x.id === nodeId);
  const label = node?.label ?? "Selected object";
  const upstream = graph.edges.filter((e) => e.to === nodeId).map((e) => e.from);
  const downstream = graph.edges.filter((e) => e.from === nodeId).map((e) => e.to);
  const nameOf = (id: string) => graph.nodes.find((x) => x.id === id)?.label ?? id;
  const protectedByFallback = ["t-optical", "t-terminal-a", "t-terminal-b"].includes(nodeId);
  return {
    object: label,
    summary: `Deterministic synthetic blast radius for ${label} on ${service.name}.`,
    recoveryPath: protectedByFallback ? "RF fallback available, expected recovery path validated" : "No validated alternate path for this dependency",
    rows: [
      ["Customers affected", "1 customer"],
      ["Customer services exposed", "1 customer service"],
      ["Committed capacity at risk", `${service.committedGbps} Gbps`],
      ["Downstream clusters affected", "3 mobile tower clusters"],
      ["Downstream users exposed", "Approximately 42,000 synthetic downstream users"],
      ["SLOs at risk", "1 SLO"],
      ["Regions affected", service.region],
      ["Partners involved", node?.partner ?? "Network operating partner"],
      ["Direct dependencies", String(upstream.length + downstream.length)],
      ["Upstream dependencies", upstream.map(nameOf).join(", ") || "None"],
      ["Downstream dependencies", downstream.map(nameOf).join(", ") || "None"],
      ["Active situations connected", service.situationId ? "1 situation" : "None"],
      ["Changes connected", "1 planned firmware change"],
      ["Agents assigned", "Service Dependency Agent, Customer Impact Agent, RF Fallback Guardian"],
      ["Alternate path", protectedByFallback ? "RF fallback available" : "None validated"],
    ],
  };
}

/* ------------------------------- ownership -------------------------------- */

export interface OwnershipRow {
  scope: string;
  objectOwner: Owner;
  operationalOwner: Owner;
  incidentOwner: Owner;
  escalationOwner: string;
  changeApprover: Owner;
  fieldSupport: Owner;
  gap: string;
}

export const ownershipMatrix: OwnershipRow[] = [
  { scope: "Customer network and edge", objectOwner: "Customer network team", operationalOwner: "Customer network team", incidentOwner: "Customer network team", escalationOwner: "Customer NOC duty manager", changeApprover: "Customer network team", fieldSupport: "Customer network team", gap: "None" },
  { scope: "Partner aggregation network", objectOwner: "Network operating partner", operationalOwner: "Network operating partner", incidentOwner: "Taara operations", escalationOwner: "Partner NOC duty engineer", changeApprover: "Network operating partner", fieldSupport: "Field service partner", gap: "None" },
  { scope: "Upstream fiber handoff (California DCI Link 012)", objectOwner: "Fiber partner", operationalOwner: "Fiber partner", incidentOwner: "Taara operations", escalationOwner: "Not assigned", changeApprover: "Fiber partner", fieldSupport: "Field service partner", gap: "Upstream fiber handoff escalation owner is not assigned for California DCI Link 012" },
  { scope: "Optical terminals and paths", objectOwner: "Taara operations", operationalOwner: "Taara operations", incidentOwner: "Taara operations", escalationOwner: "Regional optical duty lead", changeApprover: "Product engineering", fieldSupport: "Field service partner", gap: "None" },
  { scope: "Regional aggregation", objectOwner: "Taara operations", operationalOwner: "Regional operations", incidentOwner: "Regional operations", escalationOwner: "Regional operations manager", changeApprover: "Taara operations", fieldSupport: "Field service partner", gap: "None" },
  { scope: "Telemetry and evidence platform", objectOwner: "Cloud platform team", operationalOwner: "Cloud platform team", incidentOwner: "Cloud platform team", escalationOwner: "Platform on call", changeApprover: "Cloud platform team", fieldSupport: "Not applicable", gap: "None" },
  { scope: "Site power and mounting", objectOwner: "Regional operations", operationalOwner: "Field service partner", incidentOwner: "Regional operations", escalationOwner: "Field partner dispatcher", changeApprover: "Regional operations", fieldSupport: "Field service partner", gap: "Mount inspection outstanding for 12 days" },
  { scope: "Product firmware", objectOwner: "Product engineering", operationalOwner: "Product engineering", incidentOwner: "Product engineering", escalationOwner: "Firmware release manager", changeApprover: "Product engineering", fieldSupport: "Not applicable", gap: "None" },
];

export interface PartnerProfile {
  id: string;
  name: string;
  type: string;
  regions: string;
  components: string;
  services: string;
  incidents: string;
  fieldWork: string;
  performance: string;
  escalation: string;
  sharedResponsibility: string;
}

export const partners: PartnerProfile[] = [
  { id: "pt-pacific", name: "Pacific Fiber Partners", type: "Fiber and cross connect partner", regions: "United States", components: "Fiber handoffs, cross connects", services: "California Data Center Interconnect Service 012", incidents: "1 critical handoff failure", fieldWork: "2 open orders", performance: "97.1% handoff availability", escalation: "Escalation owner not assigned", sharedResponsibility: "Partner operates the handoff, Taara owns the customer outcome" },
  { id: "pt-chennai", name: "Chennai Metro Fiber Partners", type: "Metro fiber partner", regions: "India", components: "Metro fiber, aggregation cross connects", services: "Chennai Mobile Backhaul Service 041", incidents: "None open", fieldWork: "1 open order", performance: "99.98% handoff availability", escalation: "Partner NOC duty engineer", sharedResponsibility: "Partner operates the fiber, Taara monitors end to end" },
  { id: "pt-field", name: "Southern Field Services", type: "Field service partner", regions: "India, Southeast Asia", components: "Mounts, power, terminal replacement", services: "18 synthetic services", incidents: "None open", fieldWork: "4 open orders", performance: "Median response 3.9 hours", escalation: "Field partner dispatcher", sharedResponsibility: "Partner performs field work under Taara direction" },
  { id: "pt-cloud", name: "Cloud platform team", type: "Internal platform", regions: "Global", components: "Telemetry ingestion, evidence store", services: "All synthetic services", incidents: "1 telemetry delay", fieldWork: "None", performance: "9 second median pipeline latency", escalation: "Platform on call", sharedResponsibility: "Platform provides evidence, operations interpret it" },
];

/* --------------------------- agentic intelligence ------------------------- */

export interface TopologyInsight {
  id: string;
  agent: string;
  insight: string;
  confidence: number;
  evidenceCount: number;
  objectsAnalyzed: number;
  customerImpact: string;
  recommendedAction: string;
  policyStatus: string;
  highlight: string[];
}

export const TOPOLOGY_AGENTS = [
  "Service Dependency Agent",
  "Optical Path Investigator",
  "Customer Impact Agent",
  "RF Fallback Guardian",
  "Change Risk Agent",
  "SLO Guardian",
  "Partner Escalation Agent",
  "Topology Quality Agent",
] as const;

export const topologyInsights: TopologyInsight[] = [
  { id: "ti-1", agent: "Service Dependency Agent", insight: "The customer service is currently dependent on one primary optical path.", confidence: 96, evidenceCount: 5, objectsAnalyzed: 24, customerImpact: "182,000 subscribers ride a single transport path", recommendedAction: "Maintain validated fallback readiness", policyStatus: "Within guardrails", highlight: ["t-optical", "t-service"] },
  { id: "ti-2", agent: "RF Fallback Guardian", insight: "RF fallback has sufficient capacity for the committed service.", confidence: 93, evidenceCount: 4, objectsAnalyzed: 6, customerImpact: "6 Gbps of 10 Gbps protected at reduced throughput", recommendedAction: "Hold reservation until the weather window closes", policyStatus: "Within guardrails", highlight: ["t-rf"] },
  { id: "ti-3", agent: "Optical Path Investigator", insight: "The alternate fiber path is available but has higher latency.", confidence: 89, evidenceCount: 3, objectsAnalyzed: 7, customerImpact: "Latency objective would move from 4.7 ms to 6.9 ms", recommendedAction: "Rank below RF fallback for this service", policyStatus: "Approval required", highlight: ["t-fiber-backup", "t-alt-optical"] },
  { id: "ti-4", agent: "Optical Path Investigator", insight: "Dense fog is the highest probability threat to the optical path.", confidence: 92, evidenceCount: 6, objectsAnalyzed: 4, customerImpact: "Forecast SLO breach within six hours", recommendedAction: "Prepare preventive transition", policyStatus: "Within guardrails", highlight: ["t-weather", "t-optical"] },
  { id: "ti-5", agent: "Topology Quality Agent", insight: "No terminal hardware fault is currently detected.", confidence: 97, evidenceCount: 5, objectsAnalyzed: 2, customerImpact: "No hardware driven customer risk", recommendedAction: "Continue passive monitoring", policyStatus: "Within guardrails", highlight: ["t-terminal-a", "t-terminal-b"] },
  { id: "ti-6", agent: "Partner Escalation Agent", insight: "The service has one partner owned upstream dependency.", confidence: 91, evidenceCount: 4, objectsAnalyzed: 5, customerImpact: "Recovery time depends on partner response", recommendedAction: "Confirm partner escalation owner is current", policyStatus: "Ownership gap detected", highlight: ["t-partner", "t-handoff"] },
  { id: "ti-7", agent: "SLO Guardian", insight: "A preventive transition can protect the customer SLO.", confidence: 94, evidenceCount: 6, objectsAnalyzed: 9, customerImpact: "42 minutes of avoidable degradation prevented", recommendedAction: "Approve preventive transition to RF fallback", policyStatus: "Approval gate engaged", highlight: ["t-slo", "t-rf", "t-service"] },
  { id: "ti-8", agent: "Change Risk Agent", insight: "Human approval is required before traffic transition.", confidence: 99, evidenceCount: 2, objectsAnalyzed: 3, customerImpact: "No customer impacting change until approved", recommendedAction: "Route to the human approval queue", policyStatus: "Approval gate engaged", highlight: ["t-change", "t-service"] },
];

/* ------------------------------- scenario --------------------------------- */

export interface TopologyScenarioStep {
  id: string;
  label: string;
  actor: string;
  detail: string;
  outcome: string;
  highlight: string[];
  requiresApproval?: boolean;
  /** Node state overrides applied cumulatively as the scenario progresses. */
  nodeStates?: Record<string, TopologyHealth>;
}

export const dependencyScenario: TopologyScenarioStep[] = [
  { id: "sc-1", label: "Customer service degradation detected", actor: "Customer Impact Agent", detail: "California Data Center Interconnect Service 012 stops delivering traffic while both terminals report healthy.", outcome: "Customer service marked unavailable", highlight: ["t-service", "t-users"], nodeStates: { "t-service": "Unavailable", "t-users": "Unavailable" } },
  { id: "sc-2", label: "Optical terminals validated as healthy", actor: "Optical Path Investigator", detail: "Beam lock, margin, pointing error and temperature are all within nominal ranges on both terminals.", outcome: "Terminal fault excluded", highlight: ["t-terminal-a", "t-terminal-b"], nodeStates: { "t-terminal-a": "Healthy", "t-terminal-b": "Healthy" } },
  { id: "sc-3", label: "Optical path validated as healthy", actor: "Optical Path Investigator", detail: "Attenuation, visibility and availability on the optical path show no degradation.", outcome: "Optical path excluded", highlight: ["t-optical"], nodeStates: { "t-optical": "Healthy" } },
  { id: "sc-4", label: "Downstream network validated", actor: "Service Dependency Agent", detail: "Aggregation router and tower clusters are reachable and forwarding.", outcome: "Downstream excluded", highlight: ["t-aggregation", "t-tower"] },
  { id: "sc-5", label: "Upstream fiber handoff identified as unavailable", actor: "Service Dependency Agent", detail: "The partner owned fiber cross connect has been down since 02:21 local with no light on the port.", outcome: "Root dependency isolated", highlight: ["t-handoff", "t-partner-net"], nodeStates: { "t-handoff": "Unavailable", "t-partner-net": "Degraded" } },
  { id: "sc-6", label: "Partner ownership identified", actor: "Partner Escalation Agent", detail: "Pacific Fiber Partners operates the handoff, and the escalation owner is not assigned for California DCI Link 012.", outcome: "Ownership gap raised", highlight: ["t-partner"], nodeStates: { "t-partner": "Ownership unclear" } },
  { id: "sc-7", label: "Customer blast radius calculated", actor: "Customer Impact Agent", detail: "One customer, one service, 10 Gbps committed capacity, three tower clusters and approximately 42,000 synthetic users exposed.", outcome: "Impact quantified", highlight: ["t-users", "t-tower"] },
  { id: "sc-8", label: "Alternate route evaluated", actor: "RF Fallback Guardian", detail: "The alternate fiber route can carry 5 Gbps in 35 minutes; RF fallback does not bypass the failed upstream handoff.", outcome: "Alternate fiber route selected", highlight: ["t-fiber-backup", "t-rf"] },
  { id: "sc-9", label: "Escalation recommendation created", actor: "Partner Escalation Agent", detail: "Recommend partner escalation and simulated transition to the alternate fiber route.", outcome: "Awaiting human approval", highlight: ["t-partner", "t-fiber-backup"], requiresApproval: true },
  { id: "sc-10", label: "Traffic transition simulated", actor: "Service Dependency Agent", detail: "Traffic is simulated onto the alternate fiber route with the customer service restored at reduced capacity.", outcome: "Transition simulated", highlight: ["t-fiber-backup"], nodeStates: { "t-fiber-backup": "On fallback" } },
  { id: "sc-11", label: "Customer service restored", actor: "Customer Impact Agent", detail: "The customer service returns to service on the alternate path while the partner repair proceeds.", outcome: "Service restored", highlight: ["t-service", "t-users"], nodeStates: { "t-service": "On fallback", "t-users": "Healthy", "t-tower": "Healthy" } },
  { id: "sc-12", label: "Topology knowledge updated", actor: "Topology Quality Agent", detail: "The unprotected upstream dependency and the missing escalation owner are recorded against the topology.", outcome: "Topology knowledge updated", highlight: ["t-handoff", "t-partner"] },
];

export const manualVersusAgentic = [
  { measure: "Time to isolate the failing dependency", manual: "58 minutes across three teams", agentic: "6 minutes" },
  { measure: "Teams engaged before root dependency found", manual: "Optical, network, and partner", agentic: "Partner only" },
  { measure: "Customer impact duration", manual: "1 hour 47 minutes", agentic: "41 minutes" },
  { measure: "Evidence assembled", manual: "Collected manually after the fact", agentic: "Captured continuously" },
  { measure: "Ownership gap detection", manual: "Discovered during escalation", agentic: "Detected before escalation" },
];

/* --------------------------- relationship table --------------------------- */

export interface RelationshipRow {
  id: string;
  sourceLabel: string;
  sourceType: NodeKind;
  relationship: RelationshipKind;
  targetLabel: string;
  targetType: NodeKind;
  health: TopologyHealth;
  ownership: Owner;
  customerImpact: string;
  risk: RiskBand;
  lastValidated: string;
  evidence: string;
  agentActivity: string;
  edgeId: string;
}

export function relationshipRows(graph: TopoGraph): RelationshipRow[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  return graph.edges.map((e) => {
    const s = byId.get(e.from)!;
    const t = byId.get(e.to)!;
    return {
      id: `rel-${e.id}`,
      sourceLabel: s.label,
      sourceType: s.kind,
      relationship: e.relationship,
      targetLabel: t.label,
      targetType: t.kind,
      health: e.health,
      ownership: e.owner,
      customerImpact: e.customerImpact,
      risk: e.risk,
      lastValidated: e.lastValidated,
      evidence: e.evidence,
      agentActivity: e.agentActivity,
      edgeId: e.id,
    };
  });
}

/* ------------------------------- timeline --------------------------------- */

export interface TopologyEvent {
  id: string;
  at: string;
  event: string;
  actor: string;
  affectedObject: string;
  relationship: string;
  outcome: string;
  status: "Complete" | "Awaiting approval" | "In progress";
  highlight: string[];
}

export const topologyEvents: TopologyEvent[] = [
  { id: "tev-1", at: "11:04:22", event: "Agent recommendation created", actor: "SLO Guardian", affectedObject: "Chennai Mobile Backhaul Service 041", relationship: "governed by SLO", outcome: "Preventive transition recommended", status: "Awaiting approval", highlight: ["t-service", "t-slo"] },
  { id: "tev-2", at: "10:58:07", event: "Optical path risk detected", actor: "Weather Risk Agent", affectedObject: "Primary optical path", relationship: "threatened by weather condition", outcome: "Fog threat confirmed at 92% confidence", status: "Complete", highlight: ["t-optical", "t-weather"] },
  { id: "tev-3", at: "10:41:35", event: "Alternate route validated", actor: "RF Fallback Guardian", affectedObject: "Integrated RF fallback", relationship: "protected by fallback route", outcome: "6 Gbps reservation confirmed", status: "Complete", highlight: ["t-rf"] },
  { id: "tev-4", at: "09:52:14", event: "Partner handoff failed", actor: "Service Dependency Agent", affectedObject: "California DCI fiber handoff 012", relationship: "connects to network handoff", outcome: "Upstream dependency isolated", status: "Complete", highlight: ["t-handoff", "t-partner-net"] },
  { id: "tev-5", at: "09:44:02", event: "Ownership updated", actor: "Partner Escalation Agent", affectedObject: "Pacific Fiber Partners", relationship: "operated by partner", outcome: "Escalation owner gap raised", status: "In progress", highlight: ["t-partner"] },
  { id: "tev-6", at: "09:12:48", event: "Change added to topology", actor: "Change Risk Agent", affectedObject: "Firmware upgrade 3.8.3", relationship: "modified by change", outcome: "Change linked to two terminals", status: "Complete", highlight: ["t-change", "t-terminal-b"] },
  { id: "tev-7", at: "08:37:19", event: "Incident linked to service", actor: "Service Dependency Agent", affectedObject: "Chennai optical route situation", relationship: "affected by incident", outcome: "Situation attached to the service chain", status: "Complete", highlight: ["t-situation", "t-optical"] },
  { id: "tev-8", at: "07:58:41", event: "Topology relationship validated", actor: "Topology Quality Agent", affectedObject: "Regional aggregation router", relationship: "connects to network handoff", outcome: "Relationship confirmed against telemetry", status: "Complete", highlight: ["t-aggregation"] },
  { id: "tev-9", at: "07:20:05", event: "Service relationship discovered", actor: "Topology Quality Agent", affectedObject: "Mobile tower cluster", relationship: "delivers traffic to", outcome: "New downstream relationship recorded", status: "Complete", highlight: ["t-tower"] },
  { id: "tev-10", at: "06:44:30", event: "Service relationship evidence stored", actor: "Service Dependency Agent", affectedObject: "Chennai Mobile Backhaul Service 041", relationship: "supported by evidence", outcome: "Evidence bundle stored", status: "Complete", highlight: ["t-service"] },
];

export const TOPOLOGY_FRESHNESS = "11:04:22 UTC";
export const TOPOLOGY_CONFIDENCE = "94%";

export const topologyServices = customerServices;
export const CALIFORNIA_SERVICE_ID = "csvc-california-012";
