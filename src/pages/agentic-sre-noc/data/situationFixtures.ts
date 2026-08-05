/**
 * Active Situation Room — page-specific synthetic demonstration data.
 *
 * ALL values are fabricated for demonstration purposes only. Customers,
 * services, links, terminals, regions, products, weather risks and digital
 * coworkers are reused from ./goocFixtures, ./cshFixtures and ./plrFixtures so
 * every Agentic SRE NOC page keeps the same identifiers. Keep this module free
 * of React so it can be swapped for live telemetry later.
 */

import { links, agents } from "./goocFixtures";
import { customerServices, type RouteEdge, type RouteNode, type ServiceRoute } from "./cshFixtures";

/* ------------------------------ identity -------------------------------- */

export const SITUATION_ID = "SIT-2026-0417";

export const situationHeader = {
  id: SITUATION_ID,
  title: "Chennai Mobile Backhaul Service Degradation",
  severity: "High" as const,
  state: "Customer impact mitigated" as SituationState,
  stateLabel: "Active, Customer Impact Mitigated Through RF Fallback",
  customer: "Chennai Mobile Network",
  customerAccount: "Bharat Mobility Networks",
  serviceId: "csvc-chennai-041",
  serviceName: "Chennai Mobile Backhaul Service 041",
  linkId: "lnk-chennai-041",
  linkName: "Chennai Mobile Backhaul 041",
  product: "Lightbridge Pro",
  region: "India South",
  committedCapacity: "10 Gbps",
  detectedAt: "10:42:06 UTC",
  timeActive: "1 h 22 m",
  commander: "R. Venkatesan, Duty Incident Commander",
  customerImpact: "Moderate — reduced capacity, service remains available",
  objective: "Protect the 10 Gbps customer service and return to optical safely",
  lastUpdate: "11:04:22 UTC",
  dataConfidence: "94% evidence completeness",
  situationConfidence: "94% cause confidence",
  participants: 9,
  autonomy: "Level 2 — agent recommends, human approves",
};

export const SEVERITIES = ["Critical", "High", "Moderate", "Low"] as const;
export type SituationSeverity = (typeof SEVERITIES)[number];

export const SITUATION_STATES = [
  "Detected",
  "Validating",
  "Active",
  "Customer impact confirmed",
  "Mitigation in progress",
  "Customer impact mitigated",
  "Monitoring recovery",
  "Service restored",
  "Validation in progress",
  "Resolved",
  "Post-incident review pending",
] as const;
export type SituationState = (typeof SITUATION_STATES)[number];

export interface StateStage {
  state: SituationState;
  owner: string;
  duration: string;
  blocked?: boolean;
}

export const stateProgression: StateStage[] = [
  { state: "Detected", owner: "Weather Risk Agent", duration: "0 m 12 s" },
  { state: "Validating", owner: "Optical Path Investigator", duration: "1 m 04 s" },
  { state: "Active", owner: "Incident Commander Agent", duration: "0 m 46 s" },
  { state: "Customer impact confirmed", owner: "Customer Impact Agent", duration: "0 m 38 s" },
  { state: "Mitigation in progress", owner: "RF Fallback Guardian", duration: "4 m 18 s" },
  { state: "Customer impact mitigated", owner: "R. Venkatesan", duration: "1 h 14 m" },
  { state: "Monitoring recovery", owner: "Global Link Health Agent", duration: "Pending" },
  { state: "Service restored", owner: "RF Fallback Guardian", duration: "Pending" },
  { state: "Validation in progress", owner: "SLO Guardian", duration: "Pending" },
  { state: "Resolved", owner: "R. Venkatesan", duration: "Pending" },
  { state: "Post-incident review pending", owner: "Service Dependency Agent", duration: "Pending", blocked: true },
];

/* -------------------------------- KPIs ---------------------------------- */

export interface SituationKpi {
  id: string;
  title: string;
  value: string;
  sub: string;
  status: "good" | "watch" | "risk";
  trend: "up" | "down" | "flat";
  target: string;
  previous: string;
  at: string;
  explain: string;
  focus: string;
}

export const situationKpis: SituationKpi[] = [
  { id: "kpi-service-state", title: "Customer Service State", value: "Degraded", sub: "Priority traffic protected through fallback", status: "watch", trend: "flat", target: "Within objective", previous: "Healthy at 10:38 UTC", at: "11:04:22 UTC", explain: "Current operational state of Chennai Mobile Backhaul Service 041.", focus: "summary" },
  { id: "kpi-throughput", title: "Delivered Throughput", value: "8.6 Gbps", sub: "10 Gbps committed", status: "watch", trend: "down", target: "9.5 Gbps minimum", previous: "9.8 Gbps", at: "11:04:18 UTC", explain: "Traffic currently delivered to the customer across optical and fallback transport.", focus: "telemetry" },
  { id: "kpi-impact", title: "Customer Impact", value: "Moderate", sub: "Reduced capacity, service remains available", status: "watch", trend: "flat", target: "None", previous: "None", at: "11:02:40 UTC", explain: "Assessed customer experience impact for the affected service.", focus: "summary" },
  { id: "kpi-link", title: "Primary Optical Link", value: "Degraded", sub: "Atmospheric attenuation suspected", status: "risk", trend: "down", target: "Healthy", previous: "Healthy", at: "11:04:12 UTC", explain: "Health of the primary optical path between the Chennai terminals.", focus: "route" },
  { id: "kpi-fallback", title: "RF Fallback State", value: "Active", sub: "3.1 Gbps currently carried", status: "good", trend: "up", target: "Standby", previous: "Validated standby", at: "11:04:20 UTC", explain: "Current RF fallback transport state and carried traffic.", focus: "fallback" },
  { id: "kpi-mitigate", title: "Time to Mitigate", value: "4m 18s", sub: "From validated risk to fallback activation", status: "good", trend: "down", target: "Under 10 minutes", previous: "12m 40s median", at: "10:51:24 UTC", explain: "Elapsed time between validated risk and customer impact mitigation.", focus: "outcomes" },
  { id: "kpi-budget", title: "Error Budget Consumed", value: "3.4%", sub: "Of the service's monthly allowance", status: "watch", trend: "up", target: "Below 5%", previous: "0.9%", at: "11:03:00 UTC", explain: "Share of the monthly error budget consumed by this situation.", focus: "outcomes" },
  { id: "kpi-agents", title: "Agent Actions", value: "26", sub: "18 completed, 5 active, 3 awaiting approval", status: "good", trend: "up", target: "All within guardrails", previous: "14", at: "11:04:22 UTC", explain: "Digital coworker actions taken within this situation under guardrails.", focus: "investigation" },
];

/* ---------------------------- situation summary -------------------------- */

export const situationSummary = {
  whatHappened: "Dense fog developed earlier than forecast, driving optical attenuation on Chennai Mobile Backhaul 041.",
  began: "10:42:06 UTC, approximately 90 minutes ahead of the forecast fog onset",
  detection: "Predictive risk escalation from the Predictive Link Risk Center, confirmed by live optical telemetry",
  customerImpact: "Capacity reduced from 9.8 Gbps to 8.6 Gbps. Service remains available and within its availability objective.",
  mitigation: "Priority traffic transitioned to the validated RF fallback path at 10:51 UTC following human approval.",
  likelyCause: "Atmospheric attenuation caused by dense coastal fog",
  uncertainty: "Fog clearance timing remains uncertain within a two hour window",
  objective: "Protect the 10 Gbps customer service, avoid an SLO breach, and return traffic to the optical path when link margin remains stable for the required validation period.",
  nextDecision: "Approve or defer the return-to-optical plan once link margin holds above 8.5 dB for 15 continuous minutes",
  recovery: "Visibility above 6 km with sustained link margin above 8.5 dB for 15 minutes",
  narrative:
    "Dense fog caused optical attenuation and declining link margin on Chennai Mobile Backhaul 041. Both terminals and beam alignment remain healthy. Priority traffic has transitioned to RF fallback, preserving service availability while reducing available capacity. The response team is monitoring optical recovery and evaluating the safest time to restore full optical transport.",
};

/* ------------------------------ service route ---------------------------- */

const chennaiService = customerServices.find((s) => s.id === "csvc-chennai-041")!;
const chennaiLink = links.find((l) => l.id === "lnk-chennai-041")!;

const routeNodes: RouteNode[] = [
  { id: "n-customer", name: "Chennai Mobile Network", type: "Customer network", owner: "Customer operations", health: "At risk", capacity: "10 Gbps", latency: "0.2 ms", issue: "Reduced capacity observed", agentActivity: "Customer Impact Agent monitoring", x: 5, y: 50 },
  { id: "n-edge", name: "Customer edge router", type: "Customer edge", owner: "Customer operations", health: "Healthy", capacity: "10 Gbps", latency: "0.3 ms", issue: "None", agentActivity: "None", x: 15, y: 50 },
  { id: "n-partner", name: "Partner aggregation network", type: "Partner aggregation", owner: "Network partner", health: "Healthy", capacity: "40 Gbps", latency: "0.5 ms", issue: "None", agentActivity: "Service Dependency Agent validating", x: 25, y: 50 },
  { id: "n-handoff", name: "Fiber handoff", type: "Handoff port", owner: "Network partner", health: "Healthy", capacity: "10 Gbps", latency: "0.4 ms", issue: "None", agentActivity: "Optical Path Investigator validated handoff", x: 35, y: 50 },
  { id: "n-terminal-a", name: chennaiLink.terminalA, type: "Lightbridge Pro Terminal A", owner: "Taara operations", health: "Healthy", capacity: "10 Gbps", latency: "0.6 ms", issue: "None — attenuation is external", agentActivity: "Beam Alignment Agent confirming stability", x: 46, y: 50 },
  { id: "n-terminal-b", name: chennaiLink.terminalB, type: "Lightbridge Pro Terminal B", owner: "Taara operations", health: "Healthy", capacity: "10 Gbps", latency: "0.6 ms", issue: "None — attenuation is external", agentActivity: "Weather Risk Agent correlating", x: 62, y: 50 },
  { id: "n-regional", name: "Regional aggregation network", type: "Aggregation", owner: "Taara operations", health: "Healthy", capacity: "40 Gbps", latency: "1.1 ms", issue: "None", agentActivity: "Global Link Health Agent monitoring", x: 74, y: 50 },
  { id: "n-towers", name: "Mobile tower clusters", type: "Downstream sites", owner: "Customer operations", health: "At risk", capacity: "34 sites", latency: "1.6 ms", issue: "Capacity shaping applied to best effort classes", agentActivity: "Customer Impact Agent tracking", x: 86, y: 50 },
  { id: "n-downstream", name: "Downstream customer traffic", type: "Service endpoint", owner: "Customer operations", health: "At risk", capacity: "10 Gbps", latency: "5.6 ms", issue: "Reduced capacity for best effort classes", agentActivity: "SLO Guardian tracking", x: 95, y: 50 },
];

const routeEdges: RouteEdge[] = [
  { id: "e-access", from: "n-customer", to: "n-edge", transport: "Ethernet handoff", throughput: "8.6 Gbps", maxCapacity: "10 Gbps", availability: "99.999%", latency: "0.2 ms", state: "Active", fallbackEligible: "Not applicable" },
  { id: "e-partner", from: "n-edge", to: "n-partner", transport: "Ethernet handoff", throughput: "8.6 Gbps", maxCapacity: "10 Gbps", availability: "99.997%", latency: "0.3 ms", state: "Active", fallbackEligible: "Not applicable" },
  { id: "e-handoff", from: "n-partner", to: "n-handoff", transport: "Ethernet handoff", throughput: "8.6 Gbps", maxCapacity: "10 Gbps", availability: "99.996%", latency: "0.4 ms", state: "Active", fallbackEligible: "Not applicable" },
  { id: "e-uplink", from: "n-handoff", to: "n-terminal-a", transport: "Ethernet handoff", throughput: "8.6 Gbps", maxCapacity: "10 Gbps", availability: "99.998%", latency: "0.2 ms", state: "Active", fallbackEligible: "Not applicable" },
  { id: "e-primary", from: "n-terminal-a", to: "n-terminal-b", transport: "Primary optical", throughput: "5.5 Gbps", maxCapacity: "10 Gbps", availability: "99.94%", latency: "1.4 ms", state: "Degraded", fallbackEligible: "Yes" },
  { id: "e-rf", from: "n-terminal-a", to: "n-terminal-b", transport: "RF fallback", throughput: "3.1 Gbps", maxCapacity: "6 Gbps", availability: "99.90%", latency: "7.8 ms", state: "Active", fallbackEligible: "Yes" },
  { id: "e-alt", from: "n-terminal-a", to: "n-terminal-b", transport: "Alternate optical", throughput: "0 Gbps", maxCapacity: "7 Gbps", availability: "99.94%", latency: "2.1 ms", state: "Standby", fallbackEligible: "Yes" },
  { id: "e-fiber", from: "n-terminal-a", to: "n-terminal-b", transport: "Fiber backup", throughput: "0 Gbps", maxCapacity: "10 Gbps", availability: "99.99%", latency: "5.0 ms", state: "Validated standby", fallbackEligible: "Yes" },
  { id: "e-regional", from: "n-terminal-b", to: "n-regional", transport: "Ethernet handoff", throughput: "8.6 Gbps", maxCapacity: "40 Gbps", availability: "99.999%", latency: "1.1 ms", state: "Active", fallbackEligible: "Not applicable" },
  { id: "e-towers", from: "n-regional", to: "n-towers", transport: "Ethernet handoff", throughput: "8.6 Gbps", maxCapacity: "20 Gbps", availability: "99.998%", latency: "1.6 ms", state: "Active", fallbackEligible: "Not applicable" },
  { id: "e-downstream", from: "n-towers", to: "n-downstream", transport: "Ethernet handoff", throughput: "8.6 Gbps", maxCapacity: "10 Gbps", availability: "99.997%", latency: "0.4 ms", state: "Active", fallbackEligible: "Not applicable" },
];

export const situationRoute: ServiceRoute = {
  nodes: routeNodes,
  edges: routeEdges,
  activeEdgeId: "e-rf",
  incidents: [SITUATION_ID],
  predictedRisks: ["plr-chennai-fog"],
  recentChanges: ["No configuration changes in the last 14 days"],
  customerImpact: "Capacity reduced to 8.6 Gbps of 10 Gbps committed. Availability objective maintained.",
};

/** Segment level annotations shown alongside the shared route graph. */
export const routeSegmentNotes: Record<string, { evidence: string; responseAction: string; change: string }> = {
  "n-terminal-a": { evidence: "Terminal A telemetry snapshot 11:04:12 UTC", responseAction: "Confirm terminal health — completed", change: "None" },
  "n-terminal-b": { evidence: "Terminal B telemetry snapshot 11:04:12 UTC", responseAction: "Confirm terminal health — completed", change: "None" },
  "e-primary": { evidence: "Optical attenuation series 10:30 to 11:04 UTC", responseAction: "Monitor optical recovery — in progress", change: "None" },
  "e-rf": { evidence: "RF fallback validation record 10:49 UTC", responseAction: "Transition priority traffic — completed", change: "Traffic policy applied 10:51 UTC" },
  "n-partner": { evidence: "Partner handoff validation 10:47 UTC", responseAction: "Validate upstream handoff — completed", change: "None" },
};

export const routeOwnershipLegend = [
  { owner: "Taara operations", scope: "Terminals, optical path, regional aggregation" },
  { owner: "Network partner", scope: "Partner aggregation and fiber handoff" },
  { owner: "Customer operations", scope: "Customer network, edge, tower clusters" },
];

export const powerDependencies = [
  { site: "Chennai Guindy Rooftop A", supply: "Utility with 6 h battery reserve", state: "Stable", note: "Battery at 100 percent" },
  { site: "Chennai Perungudi Aggregation B", supply: "Utility with generator backup", state: "Stable", note: "Generator tested 3 days ago" },
];

/* ------------------------------ terminal health -------------------------- */

export interface TerminalHealth {
  id: string;
  name: string;
  product: string;
  site: string;
  firmware: string;
  availability: string;
  beamLock: string;
  txPower: string;
  rxPower: string;
  margin: string;
  pointingError: string;
  trackingRate: string;
  temperature: string;
  powerState: string;
  voltage: string;
  vibration: string;
  configDrift: string;
  telemetryFreshness: string;
  assessment: string;
}

export const terminalHealth: TerminalHealth[] = [
  {
    id: "term-chennai-a", name: chennaiLink.terminalA, product: "Lightbridge Pro", site: "Chennai Guindy, rooftop mast 2",
    firmware: "LB-Pro 4.8.2", availability: "100% in the last 24 hours", beamLock: "Locked, continuous since 06:00 UTC",
    txPower: "+12.4 dBm", rxPower: "-27.8 dBm", margin: "3.9 dB", pointingError: "0.02 mrad", trackingRate: "1.2 corrections per minute",
    temperature: "41.2 C", powerState: "Utility, battery 100 percent", voltage: "Stable, 48.1 V", vibration: "0.18 g",
    configDrift: "None detected", telemetryFreshness: "12 s", assessment: "Healthy — no hardware fault detected",
  },
  {
    id: "term-chennai-b", name: chennaiLink.terminalB, product: "Lightbridge Pro", site: "Chennai Perungudi, aggregation roof",
    firmware: "LB-Pro 4.8.2", availability: "100% in the last 24 hours", beamLock: "Locked, continuous since 06:00 UTC",
    txPower: "+12.6 dBm", rxPower: "-28.1 dBm", margin: "3.7 dB", pointingError: "0.03 mrad", trackingRate: "1.4 corrections per minute",
    temperature: "42.6 C", powerState: "Utility with generator backup", voltage: "Stable, 47.9 V", vibration: "0.21 g",
    configDrift: "None detected", telemetryFreshness: "14 s", assessment: "Healthy — no hardware fault detected",
  },
];

export const terminalAssessment = "Both terminals are healthy. No terminal hardware fault is currently detected.";

/* --------------------------- optical + weather series -------------------- */

export interface SituationPoint {
  t: string;
  minute: number;
  marginA: number;
  marginB: number;
  rxPower: number;
  attenuation: number;
  beamLock: number;
  pointingError: number;
  trackingRate: number;
  throughput: number;
  packetLoss: number;
  latency: number;
  reacquisitions: number;
  visibility: number;
  fogDensity: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  temperature: number;
}

const r = (n: number, p = 2) => Number(n.toFixed(p));

/** Deterministic series from 10:20 UTC to 12:00 UTC in 5 minute steps. */
export const situationSeries: SituationPoint[] = Array.from({ length: 21 }, (_, i) => {
  const minute = i * 5;
  const clock = 20 + minute;
  const hh = 10 + Math.floor(clock / 60);
  const mm = clock % 60;
  const onset = Math.min(1, Math.max(0, (minute - 20) / 25));
  const recovery = Math.min(1, Math.max(0, (minute - 65) / 30));
  const severity = Math.max(0, onset - recovery);
  const onFallback = minute >= 30 ? 1 : 0;
  return {
    t: `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`,
    minute,
    marginA: r(9.6 - 5.7 * severity),
    marginB: r(9.4 - 5.7 * severity),
    rxPower: r(-24.0 - 4.1 * severity),
    attenuation: r(1.1 + 6.2 * severity),
    beamLock: 1,
    pointingError: r(0.02 + 0.01 * severity),
    trackingRate: r(1.1 + 0.6 * severity, 1),
    throughput: r(9.8 - 1.2 * severity * (onFallback ? 1 : 2.4), 1),
    packetLoss: r(0.01 + 0.05 * severity * (onFallback ? 0.3 : 1)),
    latency: r(4.2 + (onFallback ? 1.4 : 0) + 1.2 * severity, 1),
    reacquisitions: 0,
    visibility: r(9.6 - 8.5 * onset + 7.4 * recovery, 1),
    fogDensity: r(0.05 + 0.4 * severity),
    humidity: r(74 + 22 * severity, 0),
    rainfall: 0,
    windSpeed: r(9 + Math.sin(i / 2) * 2, 0),
    temperature: r(28.4 - 1.6 * severity, 1),
  };
});

export const OPTICAL_METRICS = [
  { key: "marginA", label: "Link margin Terminal A (dB)", color: "#4f46e5" },
  { key: "marginB", label: "Link margin Terminal B (dB)", color: "#7c3aed" },
  { key: "rxPower", label: "Received optical power (dBm)", color: "#0891b2" },
  { key: "attenuation", label: "Optical attenuation (dB)", color: "#f97316" },
  { key: "pointingError", label: "Pointing error (mrad)", color: "#a855f7" },
  { key: "trackingRate", label: "Tracking corrections per minute", color: "#0ea5e9" },
  { key: "throughput", label: "Delivered throughput (Gbps)", color: "#16a34a" },
  { key: "packetLoss", label: "Packet loss (%)", color: "#e11d48" },
  { key: "latency", label: "Latency (ms)", color: "#eab308" },
  { key: "reacquisitions", label: "Reacquisition attempts", color: "#64748b" },
] as const;
export type OpticalMetricKey = (typeof OPTICAL_METRICS)[number]["key"];

export const WEATHER_METRICS = [
  { key: "visibility", label: "Visibility (km)", color: "#0ea5e9" },
  { key: "fogDensity", label: "Fog density (g/m3)", color: "#6366f1" },
  { key: "humidity", label: "Relative humidity (%)", color: "#14b8a6" },
  { key: "rainfall", label: "Rainfall (mm/h)", color: "#2563eb" },
  { key: "windSpeed", label: "Wind speed (km/h)", color: "#64748b" },
  { key: "temperature", label: "Temperature (C)", color: "#f97316" },
] as const;
export type WeatherMetricKey = (typeof WEATHER_METRICS)[number]["key"];

export const telemetryThresholds = {
  normalRange: "Link margin 8.5 to 11.5 dB",
  warning: 6,
  critical: 4,
};

export interface SeriesAnnotation { at: string; label: string; tone: "detect" | "weather" | "action" | "approval" | "customer" }

export const seriesAnnotations: SeriesAnnotation[] = [
  { at: "10:35", label: "Fog onset", tone: "weather" },
  { at: "10:42", label: "Situation detected", tone: "detect" },
  { at: "10:49", label: "Human approval granted", tone: "approval" },
  { at: "10:51", label: "RF fallback activated", tone: "action" },
  { at: "10:55", label: "Customer impact mitigated", tone: "customer" },
  { at: "11:05", label: "Current time", tone: "detect" },
  { at: "11:35", label: "Predicted recovery window", tone: "weather" },
];

export const weatherContext = {
  visibility: "1.4 km, improving slowly",
  fogDensity: "0.41 g/m3",
  humidity: "94 percent",
  rainfall: "0.0 mm/h",
  windSpeed: "9 km/h",
  windDirection: "East north east",
  temperature: "26.9 C",
  atmosphericRisk: "High attenuation risk",
  forecast: "Fog dispersal beginning within 60 to 120 minutes",
  improvement: "Expected between 12:05 and 13:05 UTC",
  freshness: "42 s",
  confidence: "86 percent forecast confidence",
  conclusion:
    "Weather conditions strongly correlate with the optical degradation. Terminal, alignment, mounting, and power conditions do not indicate equipment failure.",
};

/* --------------------------- fallback and routes ------------------------- */

export const fallbackState = {
  status: "Active for priority traffic",
  activatedAt: "10:51:24 UTC",
  totalCapacity: "6 Gbps",
  availableCapacity: "2.9 Gbps",
  currentThroughput: "3.1 Gbps",
  latency: "7.8 ms",
  packetLoss: "0.008 percent",
  protected: "Priority and control traffic classes",
  headroom: "48 percent",
  safeDuration: "Up to 8 hours at current load",
  policy: "Within policy",
  lastValidation: "10:49:02 UTC",
  owner: "RF Fallback Guardian with N. Iyer, Network Operations",
  returnReadiness: "Blocked until link margin holds above 8.5 dB for 15 minutes",
};

export interface RouteComparisonRow {
  route: string;
  state: string;
  capacity: string;
  throughput: string;
  latency: string;
  availability: string;
  risk: string;
  owner: string;
  readiness: string;
  recommended: string;
}

export const routeComparison: RouteComparisonRow[] = [
  { route: "Primary optical path", state: "Degraded", capacity: "10 Gbps", throughput: "5.5 Gbps", latency: "1.4 ms", availability: "99.94%", risk: "High while fog persists", owner: "Taara operations", readiness: "In service, degraded", recommended: "Retain for best effort classes, restore fully after validation" },
  { route: "RF fallback", state: "Active", capacity: "6 Gbps", throughput: "3.1 Gbps", latency: "7.8 ms", availability: "99.90%", risk: "Low", owner: "Taara operations", readiness: "Active", recommended: "Continue carrying priority traffic" },
  { route: "Alternate fiber route", state: "Validated standby", capacity: "10 Gbps", throughput: "0 Gbps", latency: "5.0 ms", availability: "99.99%", risk: "Partner dependency", owner: "Network partner", readiness: "26 minutes to activate", recommended: "Hold as contingency" },
  { route: "Alternate optical route", state: "Standby", capacity: "7 Gbps", throughput: "0 Gbps", latency: "2.1 ms", availability: "99.94%", risk: "Shares the same fog cell", owner: "Taara operations", readiness: "11 minutes to activate", recommended: "Not recommended during this fog event" },
];

/* --------------------------- agentic investigation ----------------------- */

export interface SituationAgent {
  id: string;
  name: string;
  objective: string;
  task: string;
  status: "Active" | "Monitoring" | "Awaiting approval" | "Complete";
  confidence: number;
  evidenceReviewed: number;
  finding: string;
  recommendation: string;
  ownerInteraction: string;
  guardrail: string;
  lastUpdate: string;
}

const nameOf = (id: string, fallback: string) => agents.find((a) => a.id === id)?.name ?? fallback;

export const situationAgents: SituationAgent[] = [
  { id: "agent-commander", name: "Incident Commander Agent", objective: "Keep the situation coordinated and the next decision clear", task: "Maintaining the response plan and decision queue", status: "Active", confidence: 93, evidenceReviewed: 46, finding: "Response is on plan, one decision pending", recommendation: "Hold fallback until recovery validation completes", ownerInteraction: "Briefs R. Venkatesan every 10 minutes", guardrail: "Within guardrails", lastUpdate: "11:04:22 UTC" },
  { id: "agent-path", name: nameOf("agent-path", "Optical Path Investigator"), objective: "Establish or exclude physical path causes", task: "Comparing terminal telemetry with path attenuation", status: "Complete", confidence: 95, evidenceReviewed: 27, finding: "No hardware or handoff fault on the path", recommendation: "Exclude equipment failure hypotheses", ownerInteraction: "Findings shared with optical engineering owner", guardrail: "Within guardrails", lastUpdate: "11:01:55 UTC" },
  { id: "agent-weather", name: nameOf("agent-weather", "Weather Risk Agent"), objective: "Correlate atmospheric conditions with optical behaviour", task: "Tracking fog dispersal against attenuation recovery", status: "Active", confidence: 94, evidenceReviewed: 34, finding: "Attenuation tracks visibility with a 4 minute lag", recommendation: "Expect optical recovery between 12:05 and 13:05 UTC", ownerInteraction: "Updates regional operations owner", guardrail: "Within guardrails", lastUpdate: "11:04:10 UTC" },
  { id: "agent-customer", name: nameOf("agent-customer", "Customer Impact Agent"), objective: "Quantify and track customer experience impact", task: "Recomputing downstream tower cluster impact", status: "Active", confidence: 91, evidenceReviewed: 31, finding: "42,000 synthetic downstream users see reduced best effort capacity", recommendation: "Maintain priority class protection", ownerInteraction: "Feeds customer operations owner", guardrail: "Within guardrails", lastUpdate: "11:03:41 UTC" },
  { id: "agent-fallback", name: nameOf("agent-fallback", "RF Fallback Guardian"), objective: "Keep fallback transport safe and validated", task: "Monitoring fallback headroom and stability", status: "Monitoring", confidence: 93, evidenceReviewed: 22, finding: "Fallback stable with 48 percent headroom", recommendation: "Continue fallback for priority traffic", ownerInteraction: "Coordinates with network operations owner", guardrail: "Approval gate engaged", lastUpdate: "11:04:20 UTC" },
  { id: "agent-slo", name: nameOf("agent-slo", "SLO Guardian"), objective: "Protect the service objective and error budget", task: "Recalculating burn rate under fallback", status: "Active", confidence: 92, evidenceReviewed: 18, finding: "3.4 percent of the monthly error budget consumed", recommendation: "Return to optical only after sustained validation", ownerInteraction: "Reports to SRE owner", guardrail: "Approval gate engaged", lastUpdate: "11:03:00 UTC" },
  { id: "agent-dependency", name: "Service Dependency Agent", objective: "Assemble the affected end to end service route", task: "Revalidating partner aggregation and handoff health", status: "Complete", confidence: 90, evidenceReviewed: 19, finding: "All non optical segments healthy", recommendation: "Focus the response on the optical span", ownerInteraction: "Shares route map with all owners", guardrail: "Within guardrails", lastUpdate: "10:58:12 UTC" },
  { id: "agent-comms", name: "Communications Agent", objective: "Keep stakeholders accurately informed", task: "Drafting the customer mitigation update", status: "Awaiting approval", confidence: 96, evidenceReviewed: 12, finding: "Customer operations awaiting a mitigation update", recommendation: "Approve and send the drafted customer update", ownerInteraction: "Draft with communications owner", guardrail: "Approval gate engaged", lastUpdate: "11:02:05 UTC" },
];

export interface Hypothesis {
  id: string;
  cause: string;
  confidence: number;
  status: string;
  supporting: string[];
  contradicting: string[];
  owner: string;
  lastEvaluated: string;
  leading?: boolean;
}

export const hypotheses: Hypothesis[] = [
  {
    id: "hyp-fog", cause: "Atmospheric attenuation caused by dense fog", confidence: 94, status: "Leading cause", leading: true,
    supporting: ["Visibility fell from 9.6 km to 1.4 km", "Attenuation rose from 1.1 dB to 7.3 dB", "Seven comparable synthetic fog events on this span"],
    contradicting: ["Fog arrived roughly 90 minutes earlier than forecast"],
    owner: "Weather Risk Agent", lastEvaluated: "11:04:10 UTC",
  },
  {
    id: "hyp-hardware", cause: "Terminal hardware degradation", confidence: 8, status: "Evidence does not support",
    supporting: ["Received optical power declined on both terminals"],
    contradicting: ["No hardware faults reported", "Temperatures and voltages nominal", "Both terminals show identical behaviour, consistent with a path cause"],
    owner: "Optical Path Investigator", lastEvaluated: "11:01:55 UTC",
  },
  {
    id: "hyp-alignment", cause: "Beam alignment drift", confidence: 6, status: "Alignment remains stable",
    supporting: ["Tracking correction rate rose slightly"],
    contradicting: ["Beam lock continuous since 06:00 UTC", "Pointing error steady at 0.02 mrad"],
    owner: "Beam Alignment Agent", lastEvaluated: "11:00:38 UTC",
  },
  {
    id: "hyp-vibration", cause: "Mounting vibration", confidence: 4, status: "Vibration remains within normal range",
    supporting: ["Coastal wind present at 9 km/h"],
    contradicting: ["Vibration steady at 0.18 g against a 0.35 g tolerance"],
    owner: "Beam Alignment Agent", lastEvaluated: "10:59:14 UTC",
  },
  {
    id: "hyp-handoff", cause: "Upstream network handoff issue", confidence: 3, status: "Handoff validated as healthy",
    supporting: ["Throughput reduction visible at the customer edge"],
    contradicting: ["Partner handoff counters clean", "Aggregation shows 38 percent headroom"],
    owner: "Service Dependency Agent", lastEvaluated: "10:58:12 UTC",
  },
];

/* --------------------------- response workstream ------------------------- */

export const WORKSTREAM_COLUMNS = [
  "Identified", "Investigating", "Awaiting Approval", "In Progress", "Validation", "Completed", "Blocked",
] as const;
export type WorkstreamColumn = (typeof WORKSTREAM_COLUMNS)[number];

export interface WorkItem {
  id: string;
  action: string;
  owner: string;
  ownerType: "Agent" | "Human";
  priority: "P1" | "P2" | "P3";
  status: WorkstreamColumn;
  due: string;
  dependencies: string;
  evidence: string;
  approval: string;
  customerImpact: string;
  note?: string;
}

export const workItems: WorkItem[] = [
  { id: "wi-impact", action: "Validate customer impact", owner: "Customer Impact Agent", ownerType: "Agent", priority: "P1", status: "Completed", due: "10:45 UTC", dependencies: "Service telemetry", evidence: "ev-service", approval: "Not required", customerImpact: "Impact quantified as moderate" },
  { id: "wi-terminals", action: "Confirm terminal health", owner: "Optical Path Investigator", ownerType: "Agent", priority: "P1", status: "Completed", due: "10:47 UTC", dependencies: "Terminal telemetry", evidence: "ev-terminal", approval: "Not required", customerImpact: "Hardware cause excluded" },
  { id: "wi-weather", action: "Correlate weather and optical telemetry", owner: "Weather Risk Agent", ownerType: "Agent", priority: "P1", status: "Completed", due: "10:48 UTC", dependencies: "Weather feed", evidence: "ev-weather", approval: "Not required", customerImpact: "Cause identified" },
  { id: "wi-fallback", action: "Validate RF fallback capacity", owner: "RF Fallback Guardian", ownerType: "Agent", priority: "P1", status: "Completed", due: "10:49 UTC", dependencies: "Fallback path", evidence: "ev-fallback", approval: "Not required", customerImpact: "Mitigation option confirmed" },
  { id: "wi-transition", action: "Transition priority traffic", owner: "N. Iyer, Network Operations", ownerType: "Human", priority: "P1", status: "Completed", due: "10:51 UTC", dependencies: "wi-fallback", evidence: "ev-approval", approval: "Approved 10:49 UTC", customerImpact: "Customer impact mitigated" },
  { id: "wi-notify", action: "Notify customer operations", owner: "Communications Agent", ownerType: "Agent", priority: "P2", status: "Awaiting Approval", due: "11:10 UTC", dependencies: "wi-transition", evidence: "ev-comms", approval: "Awaiting communications owner", customerImpact: "Customer awareness" },
  { id: "wi-monitor", action: "Monitor optical recovery", owner: "Global Link Health Agent", ownerType: "Agent", priority: "P1", status: "In Progress", due: "Continuous", dependencies: "Weather recovery", evidence: "ev-optical", approval: "Not required", customerImpact: "Enables safe restoration" },
  { id: "wi-margin", action: "Validate sustained link margin", owner: "SLO Guardian", ownerType: "Agent", priority: "P1", status: "Validation", due: "On recovery", dependencies: "wi-monitor", evidence: "ev-optical", approval: "Not required", customerImpact: "Prevents premature restoration" },
  { id: "wi-return", action: "Prepare return-to-optical plan", owner: "R. Venkatesan, Incident Commander", ownerType: "Human", priority: "P1", status: "Investigating", due: "11:45 UTC", dependencies: "wi-margin", evidence: "ev-runbook", approval: "Approval required", customerImpact: "Restores full capacity" },
  { id: "wi-slo", action: "Recalculate SLO impact", owner: "SLO Guardian", ownerType: "Agent", priority: "P2", status: "In Progress", due: "11:20 UTC", dependencies: "wi-transition", evidence: "ev-slo", approval: "Not required", customerImpact: "Error budget accuracy" },
  { id: "wi-evidence", action: "Capture evidence", owner: "Incident Commander Agent", ownerType: "Agent", priority: "P2", status: "In Progress", due: "Continuous", dependencies: "All workstreams", evidence: "ev-index", approval: "Not required", customerImpact: "Auditability" },
  { id: "wi-knowledge", action: "Update operational knowledge", owner: "Service Dependency Agent", ownerType: "Agent", priority: "P3", status: "Blocked", due: "After resolution", dependencies: "Situation resolution", evidence: "ev-pattern", approval: "Not required", customerImpact: "Future prevention", note: "Blocked until the situation is resolved" },
  { id: "wi-dispatch", action: "Assess field dispatch need", owner: "Field service partner", ownerType: "Human", priority: "P3", status: "Identified", due: "12:00 UTC", dependencies: "wi-terminals", evidence: "ev-terminal", approval: "Dispatch approval required", customerImpact: "None expected" },
];

/* ------------------------------- ownership ------------------------------- */

export interface OwnerRole {
  role: string;
  assignee: string;
  organisation: string;
  responsibility: string;
  currentAction: string;
  availability: string;
  lastUpdate: string;
  escalation: string;
  raci: "Responsible" | "Accountable" | "Consulted" | "Informed";
}

export const ownership: OwnerRole[] = [
  { role: "Incident commander", assignee: "R. Venkatesan", organisation: "Taara operations", responsibility: "Owns the response plan and decisions", currentAction: "Reviewing the return-to-optical plan", availability: "On console", lastUpdate: "11:04 UTC", escalation: "None", raci: "Accountable" },
  { role: "Optical engineering owner", assignee: "S. Krishnan", organisation: "Product engineering", responsibility: "Optical path and terminal integrity", currentAction: "Reviewing attenuation evidence", availability: "On console", lastUpdate: "11:02 UTC", escalation: "None", raci: "Responsible" },
  { role: "Network operations owner", assignee: "N. Iyer", organisation: "Taara operations", responsibility: "Transport state and traffic policy", currentAction: "Holding fallback policy", availability: "On console", lastUpdate: "11:03 UTC", escalation: "None", raci: "Responsible" },
  { role: "Customer operations owner", assignee: "A. Rahman", organisation: "Customer operations", responsibility: "Customer experience and expectations", currentAction: "Preparing the customer update", availability: "On call", lastUpdate: "11:01 UTC", escalation: "None", raci: "Consulted" },
  { role: "SRE owner", assignee: "M. Dorai", organisation: "Taara operations", responsibility: "SLO and error budget stewardship", currentAction: "Validating burn rate", availability: "On console", lastUpdate: "11:03 UTC", escalation: "None", raci: "Responsible" },
  { role: "Regional operations owner", assignee: "India South NOC", organisation: "Taara operations", responsibility: "Regional coordination", currentAction: "Monitoring nearby spans", availability: "24x7 desk", lastUpdate: "10:58 UTC", escalation: "None", raci: "Informed" },
  { role: "Partner escalation owner", assignee: "Coastal Transit Partners duty manager", organisation: "Network partner", responsibility: "Partner aggregation and fiber handoff", currentAction: "Alternate fiber route on standby", availability: "On call", lastUpdate: "10:52 UTC", escalation: "Standby", raci: "Consulted" },
  { role: "Communications owner", assignee: "P. Sundar", organisation: "Taara operations", responsibility: "Stakeholder communication accuracy", currentAction: "Reviewing the drafted update", availability: "On console", lastUpdate: "11:02 UTC", escalation: "None", raci: "Responsible" },
  { role: "Executive escalation owner", assignee: "Regional director, network services", organisation: "Taara operations", responsibility: "Executive awareness and commercial exposure", currentAction: "Briefed, no action required", availability: "Notified", lastUpdate: "10:57 UTC", escalation: "Informational", raci: "Informed" },
  { role: "Field service owner", assignee: "Chennai field crew 3", organisation: "Field service partner", responsibility: "On site inspection if required", currentAction: "No dispatch required", availability: "Standby", lastUpdate: "10:55 UTC", escalation: "None", raci: "Informed" },
  { role: "Cloud platform owner", assignee: "Telemetry platform duty engineer", organisation: "Cloud platform team", responsibility: "Telemetry pipeline availability", currentAction: "Pipeline healthy", availability: "On call", lastUpdate: "10:50 UTC", escalation: "None", raci: "Informed" },
  { role: "Digital coworker assignments", assignee: "8 agents engaged", organisation: "Agentic SRE NOC", responsibility: "Parallel investigation and validation", currentAction: "See Agentic Investigation", availability: "Continuous", lastUpdate: "11:04 UTC", escalation: "None", raci: "Responsible" },
];

/* ------------------------ recommendations and actions -------------------- */

export const primaryRecommendation = {
  headline: "Continue RF fallback for priority traffic and delay return to the optical path until link margin remains above the recovery threshold for 15 continuous minutes.",
  reason: "Optical attenuation remains elevated and fog dispersal timing is uncertain. Premature restoration risks a second customer impact.",
  confidence: 93,
  customerOutcome: "Service availability maintained, priority classes protected",
  capacityProtected: "10 Gbps committed capacity",
  latencyImpact: "+3.6 ms while on fallback",
  sloImpact: "Error budget consumption limited to approximately 3.4 percent",
  policy: "Within policy",
  approval: "Human approval required to change transport state",
  rollback: "Return to fallback immediately if margin falls below 6 dB after restoration",
  validation: "Link margin above 8.5 dB for 15 continuous minutes with attenuation below 2 dB",
  evidenceCount: 46,
  window: "Recommended execution window 12:05 to 13:05 UTC",
};

export interface AlternativeAction {
  id: string;
  name: string;
  outcome: string;
  operationalRisk: "Low" | "Moderate" | "High";
  customerImpact: string;
  sloImpact: string;
  reversibility: string;
  approval: string;
  confidence: number;
  recommended?: boolean;
}

export const alternativeActions: AlternativeAction[] = [
  { id: "alt-return-now", name: "Return all traffic to optical immediately", outcome: "Full capacity restored but likely second degradation", operationalRisk: "High", customerImpact: "Probable renewed impact", sloImpact: "Further budget consumption likely", reversibility: "Reversible in 6 minutes", approval: "Human approval required", confidence: 21 },
  { id: "alt-continue", name: "Continue current fallback", outcome: "Priority traffic protected while optical recovers", operationalRisk: "Low", customerImpact: "Reduced best effort capacity only", sloImpact: "Contained", reversibility: "Reversible", approval: "Human approval required", confidence: 93, recommended: true },
  { id: "alt-all-rf", name: "Move all traffic to RF fallback", outcome: "Optical fully offloaded, fallback saturated", operationalRisk: "Moderate", customerImpact: "Slower best effort classes", sloImpact: "Latency objective at risk", reversibility: "Reversible in 10 minutes", approval: "Human approval required", confidence: 58 },
  { id: "alt-fiber", name: "Use alternate fiber route", outcome: "Full capacity restored through the partner", operationalRisk: "Moderate", customerImpact: "Brief transition impact", sloImpact: "Neutral", reversibility: "Reversible with partner coordination", approval: "Partner approval required", confidence: 64 },
  { id: "alt-observe", name: "Maintain current state and observe", outcome: "No change, continued monitoring", operationalRisk: "Low", customerImpact: "Unchanged", sloImpact: "Contained", reversibility: "Not applicable", approval: "Not required", confidence: 71 },
  { id: "alt-field", name: "Dispatch field technician", outcome: "On site confirmation of terminal condition", operationalRisk: "Low", customerImpact: "None", sloImpact: "None", reversibility: "Not applicable", approval: "Dispatch approval required", confidence: 12 },
  { id: "alt-restart", name: "Restart terminal pair", outcome: "Service interruption with no expected benefit", operationalRisk: "High", customerImpact: "Full interruption for 4 minutes", sloImpact: "Direct budget consumption", reversibility: "Reversible", approval: "Human approval required", confidence: 6 },
  { id: "alt-beam", name: "Reacquire beam", outcome: "No benefit, alignment already stable", operationalRisk: "Moderate", customerImpact: "Brief interruption", sloImpact: "Minor consumption", reversibility: "Reversible", approval: "Not required", confidence: 9 },
];

/* -------------------------------- timeline ------------------------------- */

export const EVENT_CATEGORIES = [
  "Telemetry", "Weather", "Predictive risk", "Customer impact", "Agent finding",
  "Human decision", "Approval", "Traffic transition", "Service validation",
  "Communication", "Ownership", "Evidence", "SLO", "Recovery",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface SituationEvent {
  id: string;
  at: string;
  event: string;
  actor: string;
  actorType: "Agent" | "Human";
  category: EventCategory;
  component: string;
  customerImpact: string;
  evidence: string;
  decision: string;
  outcome: string;
  status: "Complete" | "In progress" | "Awaiting approval";
}

export const situationEvents: SituationEvent[] = [
  { id: "se-1", at: "10:35:10", event: "Fog onset detected ahead of forecast", actor: "Weather Risk Agent", actorType: "Agent", category: "Weather", component: "Chennai coastal cell", customerImpact: "None yet", evidence: "ev-weather", decision: "None", outcome: "Predictive risk escalated", status: "Complete" },
  { id: "se-2", at: "10:38:44", event: "Optical attenuation rising faster than predicted", actor: "Global Link Health Agent", actorType: "Agent", category: "Telemetry", component: "lnk-chennai-041", customerImpact: "None yet", evidence: "ev-optical", decision: "None", outcome: "Trend flagged", status: "Complete" },
  { id: "se-3", at: "10:42:06", event: "Situation SIT-2026-0417 created", actor: "Incident Commander Agent", actorType: "Agent", category: "Predictive risk", component: "csvc-chennai-041", customerImpact: "Pending calculation", evidence: "ev-index", decision: "Situation opened", outcome: "Response workspace created", status: "Complete" },
  { id: "se-4", at: "10:44:31", event: "Customer impact calculated as moderate", actor: "Customer Impact Agent", actorType: "Agent", category: "Customer impact", component: "csvc-chennai-041", customerImpact: "Moderate", evidence: "ev-service", decision: "None", outcome: "42,000 synthetic users exposed", status: "Complete" },
  { id: "se-5", at: "10:47:12", event: "Both terminals validated as healthy", actor: "Optical Path Investigator", actorType: "Agent", category: "Agent finding", component: "term-chennai-a, term-chennai-b", customerImpact: "Unchanged", evidence: "ev-terminal", decision: "Hardware cause excluded", outcome: "Investigation narrowed", status: "Complete" },
  { id: "se-6", at: "10:48:20", event: "Weather identified as the leading cause", actor: "Weather Risk Agent", actorType: "Agent", category: "Agent finding", component: "lnk-chennai-041", customerImpact: "Unchanged", evidence: "ev-weather", decision: "Leading hypothesis set", outcome: "94 percent confidence", status: "Complete" },
  { id: "se-7", at: "10:49:02", event: "RF fallback capacity validated", actor: "RF Fallback Guardian", actorType: "Agent", category: "Agent finding", component: "e-rf", customerImpact: "Unchanged", evidence: "ev-fallback", decision: "Mitigation available", outcome: "6 Gbps confirmed", status: "Complete" },
  { id: "se-8", at: "10:49:44", event: "Human approval granted for traffic transition", actor: "R. Venkatesan", actorType: "Human", category: "Approval", component: "csvc-chennai-041", customerImpact: "Unchanged", evidence: "ev-approval", decision: "Approved", outcome: "Transition authorised", status: "Complete" },
  { id: "se-9", at: "10:51:24", event: "Priority traffic transitioned to RF fallback", actor: "RF Fallback Guardian", actorType: "Agent", category: "Traffic transition", component: "e-rf", customerImpact: "Mitigated", evidence: "ev-fallback", decision: "Executed", outcome: "3.1 Gbps carried on fallback", status: "Complete" },
  { id: "se-10", at: "10:55:06", event: "Customer service validated after transition", actor: "Customer Impact Agent", actorType: "Agent", category: "Service validation", component: "csvc-chennai-041", customerImpact: "Moderate, availability maintained", evidence: "ev-service", decision: "None", outcome: "Service reachable, loss within threshold", status: "Complete" },
  { id: "se-11", at: "10:57:40", event: "Executive brief issued", actor: "Communications Agent", actorType: "Agent", category: "Communication", component: "Executive leadership", customerImpact: "Unchanged", evidence: "ev-comms", decision: "None", outcome: "Leadership informed", status: "Complete" },
  { id: "se-12", at: "11:00:12", event: "Ownership confirmed across partner and field teams", actor: "R. Venkatesan", actorType: "Human", category: "Ownership", component: "Response workstream", customerImpact: "Unchanged", evidence: "ev-index", decision: "Owners assigned", outcome: "RACI complete", status: "Complete" },
  { id: "se-13", at: "11:03:00", event: "SLO impact recalculated", actor: "SLO Guardian", actorType: "Agent", category: "SLO", component: "csvc-chennai-041", customerImpact: "Unchanged", evidence: "ev-slo", decision: "None", outcome: "3.4 percent of budget consumed", status: "Complete" },
  { id: "se-14", at: "11:04:10", event: "Optical recovery monitoring in progress", actor: "Global Link Health Agent", actorType: "Agent", category: "Recovery", component: "lnk-chennai-041", customerImpact: "Unchanged", evidence: "ev-optical", decision: "None", outcome: "Awaiting sustained margin", status: "In progress" },
  { id: "se-15", at: "11:04:22", event: "Customer mitigation update awaiting approval", actor: "Communications Agent", actorType: "Agent", category: "Communication", component: "Customer operations", customerImpact: "Unchanged", evidence: "ev-comms", decision: "Pending", outcome: "Draft ready", status: "Awaiting approval" },
];

/* -------------------------------- evidence ------------------------------- */

export const EVIDENCE_TYPES = [
  "Optical telemetry", "Terminal telemetry", "Weather data", "Customer service performance",
  "Route topology", "RF fallback validation", "Configuration", "Recent changes",
  "Similar historical situations", "Agent findings", "Human notes", "Customer communications",
  "Screenshots", "Field evidence", "SLO calculations", "Approval records",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  source: string;
  at: string;
  relatedObject: string;
  reliability: "High" | "Medium" | "Low";
  freshness: string;
  addedBy: string;
  usedBy: string;
  supports: string;
  preview: string;
  superseded?: boolean;
}

export const evidenceItems: EvidenceItem[] = [
  { id: "ev-optical", title: "Optical attenuation and margin series 10:20 to 11:05 UTC", type: "Optical telemetry", source: "Link performance service", at: "11:04:12", relatedObject: "lnk-chennai-041", reliability: "High", freshness: "12 s", addedBy: "Global Link Health Agent", usedBy: "4 agents", supports: "hyp-fog", preview: "Margin fell from 9.6 dB to 3.9 dB while attenuation rose to 7.3 dB." },
  { id: "ev-terminal", title: "Terminal A and B health snapshot", type: "Terminal telemetry", source: "Terminal health service", at: "11:04:12", relatedObject: "term-chennai-a, term-chennai-b", reliability: "High", freshness: "14 s", addedBy: "Optical Path Investigator", usedBy: "3 agents", supports: "hyp-hardware", preview: "No faults. Temperatures, voltages, beam lock and pointing error all nominal." },
  { id: "ev-weather", title: "Chennai coastal fog observation and forecast", type: "Weather data", source: "Synthetic regional weather forecast", at: "11:04:10", relatedObject: "Chennai coastal cell", reliability: "High", freshness: "42 s", addedBy: "Weather Risk Agent", usedBy: "5 agents", supports: "hyp-fog", preview: "Visibility 1.4 km, fog density 0.41 g/m3, dispersal expected 12:05 to 13:05 UTC." },
  { id: "ev-service", title: "Customer service performance after transition", type: "Customer service performance", source: "Service delivery telemetry", at: "11:03:41", relatedObject: "csvc-chennai-041", reliability: "High", freshness: "30 s", addedBy: "Customer Impact Agent", usedBy: "3 agents", supports: "Customer impact assessment", preview: "8.6 Gbps delivered, latency 5.6 ms, packet loss 0.008 percent." },
  { id: "ev-route", title: "End to end service route validation", type: "Route topology", source: "Service dependency graph", at: "10:58:12", relatedObject: "csvc-chennai-041", reliability: "High", freshness: "6 m", addedBy: "Service Dependency Agent", usedBy: "2 agents", supports: "hyp-handoff", preview: "All non optical segments healthy, including the partner fiber handoff." },
  { id: "ev-fallback", title: "RF fallback capacity validation record", type: "RF fallback validation", source: "Fallback readiness service", at: "10:49:02", relatedObject: "e-rf", reliability: "High", freshness: "15 m", addedBy: "RF Fallback Guardian", usedBy: "3 agents", supports: "Mitigation decision", preview: "6 Gbps usable, latency 7.8 ms, loss below 0.01 percent." },
  { id: "ev-config", title: "Link configuration baseline", type: "Configuration", source: "Configuration service", at: "10:44:00", relatedObject: "lnk-chennai-041", reliability: "High", freshness: "20 m", addedBy: "Optical Path Investigator", usedBy: "2 agents", supports: "hyp-hardware", preview: "Lightbridge Pro, 10 Gbps, 2.6 km span, firmware LB-Pro 4.8.2 on both terminals." },
  { id: "ev-changes", title: "Recent change record", type: "Recent changes", source: "Change management register", at: "10:44:10", relatedObject: "lnk-chennai-041", reliability: "High", freshness: "20 m", addedBy: "Service Dependency Agent", usedBy: "2 agents", supports: "Cause exclusion", preview: "No configuration or firmware changes in the last 14 days." },
  { id: "ev-pattern", title: "Comparable synthetic fog situations", type: "Similar historical situations", source: "Operational knowledge base", at: "10:46:30", relatedObject: "Chennai coastal fog pattern v4", reliability: "Medium", freshness: "6 h", addedBy: "Weather Risk Agent", usedBy: "3 agents", supports: "hyp-fog", preview: "Seven comparable events, attenuation 5 to 7 dB, duration 3 to 5 hours." },
  { id: "ev-slo", title: "Error budget recalculation", type: "SLO calculations", source: "SLO service", at: "11:03:00", relatedObject: "csvc-chennai-041", reliability: "High", freshness: "1 m", addedBy: "SLO Guardian", usedBy: "2 agents", supports: "Return-to-optical timing", preview: "3.4 percent of the monthly budget consumed, 30.6 percent remaining." },
  { id: "ev-approval", title: "Traffic transition approval record", type: "Approval records", source: "Situation decision log", at: "10:49:44", relatedObject: "wi-transition", reliability: "High", freshness: "15 m", addedBy: "R. Venkatesan", usedBy: "2 agents", supports: "Mitigation decision", preview: "Approved by the duty incident commander with rollback conditions attached." },
  { id: "ev-comms", title: "Drafted customer mitigation update", type: "Customer communications", source: "Communications Agent draft", at: "11:02:05", relatedObject: "Customer operations", reliability: "Medium", freshness: "2 m", addedBy: "Communications Agent", usedBy: "1 agent", supports: "Stakeholder communication", preview: "Awaiting communications owner approval before sending." },
  { id: "ev-note", title: "Commander note on restoration timing", type: "Human notes", source: "R. Venkatesan", at: "11:00:40", relatedObject: SITUATION_ID, reliability: "Medium", freshness: "4 m", addedBy: "R. Venkatesan", usedBy: "1 agent", supports: "Return-to-optical timing", preview: "Hold restoration until two consecutive clean validation windows." },
  { id: "ev-field", title: "Field crew standby confirmation", type: "Field evidence", source: "Chennai field crew 3", at: "10:55:20", relatedObject: "Chennai Guindy site", reliability: "Medium", freshness: "9 m", addedBy: "Field service partner", usedBy: "1 agent", supports: "Dispatch decision", preview: "Crew on standby, no dispatch requested." },
  { id: "ev-screenshot", title: "Route health snapshot", type: "Screenshots", source: "Situation workspace capture", at: "10:52:00", relatedObject: "csvc-chennai-041", reliability: "Low", freshness: "12 m", addedBy: "Incident Commander Agent", usedBy: "1 agent", supports: "Situation brief", preview: "Captured route state immediately after the transition." },
  { id: "ev-index", title: "Situation evidence index", type: "Agent findings", source: "Incident Commander Agent", at: "11:04:22", relatedObject: SITUATION_ID, reliability: "High", freshness: "12 s", addedBy: "Incident Commander Agent", usedBy: "8 agents", supports: "Situation brief", preview: "46 evidence items linked across 5 hypotheses and 13 response actions." },
  { id: "ev-runbook", title: "Superseded initial restoration plan", type: "Human notes", source: "Optical engineering", at: "10:53:10", relatedObject: "wi-return", reliability: "Low", freshness: "11 m", addedBy: "S. Krishnan", usedBy: "0 agents", supports: "Superseded by validation-gated plan", preview: "Original plan proposed restoration at 11:15 UTC without a validation window.", superseded: true },
];

/* ----------------------------- communications ---------------------------- */

export const COMM_AUDIENCES = [
  "Internal operations", "Customer operations", "Partner operations", "Executive leadership", "Field operations",
] as const;
export type CommAudience = (typeof COMM_AUDIENCES)[number];

export const COMM_TEMPLATES = [
  "Initial situation notification",
  "Customer impact update",
  "Mitigation update",
  "Service restoration update",
  "Executive brief",
  "Partner escalation",
  "Field dispatch request",
] as const;

export const aiDraftedUpdate =
  "The Chennai Mobile Backhaul service remains available. Priority traffic has been transitioned to RF fallback due to elevated optical attenuation associated with dense fog. Capacity is reduced but the customer service remains within its availability objective. The team is monitoring link margin and will restore full optical transport after sustained recovery validation.";

export interface CommMessage {
  id: string;
  at: string;
  audience: CommAudience;
  template: string;
  author: string;
  status: "Sent" | "Draft" | "Awaiting approval";
  body: string;
}

export const communications: CommMessage[] = [
  { id: "cm-1", at: "10:43:20", audience: "Internal operations", template: "Initial situation notification", author: "Incident Commander Agent", status: "Sent", body: "Situation SIT-2026-0417 opened for Chennai Mobile Backhaul Service 041. Optical attenuation rising, customer impact under calculation." },
  { id: "cm-2", at: "10:46:05", audience: "Customer operations", template: "Customer impact update", author: "Communications Agent", status: "Sent", body: "Reduced capacity observed on the Chennai mobile backhaul service. Availability is maintained. Mitigation options are being validated." },
  { id: "cm-3", at: "10:52:10", audience: "Partner operations", template: "Partner escalation", author: "Communications Agent", status: "Sent", body: "Alternate fiber route requested on standby for Chennai Mobile Backhaul Service 041. No activation required at this time." },
  { id: "cm-4", at: "10:57:40", audience: "Executive leadership", template: "Executive brief", author: "Communications Agent", status: "Sent", body: "Weather driven degradation on a Platinum mobile backhaul service. Customer impact mitigated within 4 minutes 18 seconds. No SLO breach expected." },
  { id: "cm-5", at: "11:02:05", audience: "Customer operations", template: "Mitigation update", author: "Communications Agent", status: "Awaiting approval", body: aiDraftedUpdate },
  { id: "cm-6", at: "11:03:30", audience: "Field operations", template: "Field dispatch request", author: "Incident Commander Agent", status: "Draft", body: "No dispatch required. Chennai field crew 3 to remain on standby until optical recovery is validated." },
];

/* --------------------------- validation and outcomes --------------------- */

export const sreOutcomes = [
  { label: "Customer service availability", value: "99.998%", note: "Objective 99.999% monthly" },
  { label: "Delivered throughput", value: "8.6 Gbps", note: "10 Gbps committed" },
  { label: "Latency", value: "5.6 ms", note: "Fallback objective 8 ms" },
  { label: "Packet loss", value: "0.008%", note: "Threshold 0.05%" },
  { label: "Optical traffic share", value: "64%", note: "36% carried on RF fallback" },
  { label: "RF fallback duration", value: "13 m so far", note: "Safe for up to 8 hours" },
  { label: "Time to detect", value: "0 m 12 s", note: "From first weak signal" },
  { label: "Time to diagnose", value: "6 m 14 s", note: "To leading cause at 94% confidence" },
  { label: "Time to mitigate", value: "4 m 18 s", note: "From validated risk to fallback" },
  { label: "Time to restore", value: "Pending", note: "Awaiting optical recovery" },
  { label: "Error budget consumed", value: "3.4%", note: "Of the monthly allowance" },
  { label: "Error budget preserved", value: "19.6%", note: "Versus the no action projection" },
  { label: "Outage minutes avoided", value: "148", note: "Synthetic demonstration model" },
  { label: "Capacity protected", value: "10 Gbps", note: "Committed customer capacity" },
  { label: "Customer impact avoided", value: "Full outage avoided", note: "Availability objective maintained" },
  { label: "Field dispatch avoided", value: "1 dispatch", note: "Hardware cause excluded remotely" },
];

export interface ValidationCheck {
  id: string;
  check: string;
  status: "Passed" | "Pending" | "Failed" | "Not applicable";
  detail: string;
}

export const validationChecks: ValidationCheck[] = [
  { id: "vc-reachable", check: "Customer service reachable", status: "Passed", detail: "End to end reachability confirmed at 11:04 UTC" },
  { id: "vc-throughput", check: "Throughput above temporary minimum", status: "Passed", detail: "8.6 Gbps against a 7.5 Gbps temporary minimum" },
  { id: "vc-latency", check: "Latency within fallback objective", status: "Passed", detail: "5.6 ms against an 8 ms fallback objective" },
  { id: "vc-loss", check: "Packet loss within threshold", status: "Passed", detail: "0.008 percent against a 0.05 percent threshold" },
  { id: "vc-fallback", check: "RF fallback stable", status: "Passed", detail: "48 percent headroom, no flaps since activation" },
  { id: "vc-margin", check: "Optical link margin recovering", status: "Pending", detail: "Requires 15 continuous minutes above 8.5 dB" },
  { id: "vc-terminal", check: "Terminal health stable", status: "Passed", detail: "Both terminals nominal throughout the situation" },
  { id: "vc-impact", check: "No new customer impact", status: "Passed", detail: "No new impacted services detected" },
  { id: "vc-slo", check: "SLO calculation updated", status: "Passed", detail: "Error budget recalculated at 11:03 UTC" },
  { id: "vc-evidence", check: "Evidence complete", status: "Pending", detail: "Awaiting restoration and post-incident evidence" },
  { id: "vc-field", check: "Field inspection outcome", status: "Not applicable", detail: "No dispatch required" },
];

/* ------------------------ manual versus agentic -------------------------- */

export const responseComparison = [
  { activity: "Time to identify customer impact", traditional: "14 minutes", agentic: "12 seconds" },
  { activity: "Time to validate terminal health", traditional: "22 minutes", agentic: "38 seconds" },
  { activity: "Time to correlate weather", traditional: "31 minutes", agentic: "26 seconds" },
  { activity: "Time to validate fallback", traditional: "18 minutes", agentic: "42 seconds" },
  { activity: "Time to assemble evidence", traditional: "24 minutes", agentic: "35 seconds" },
  { activity: "Time to determine ownership", traditional: "12 minutes", agentic: "8 seconds" },
  { activity: "Time to recommend mitigation", traditional: "38 minutes", agentic: "4 minutes" },
  { activity: "Time to communicate status", traditional: "16 minutes", agentic: "1 minute" },
  { activity: "Time to validate service", traditional: "20 minutes", agentic: "2 minutes" },
  { activity: "Documentation completeness", traditional: "Partial, reconstructed after the event", agentic: "94 percent complete in real time" },
];

/* -------------------------------- scenario ------------------------------- */

export interface SituationStage {
  id: string;
  title: string;
  detail: string;
  actor: string;
  state: SituationState;
  serviceState: string;
  throughput: string;
  fallback: string;
  impact: string;
  requiresApproval?: boolean;
  category: EventCategory;
}

export const situationScenario: SituationStage[] = [
  { id: "ss-1", title: "Fog arrives earlier than forecast", detail: "Visibility falls from 9.6 km to 4.2 km ninety minutes ahead of the forecast.", actor: "Weather Risk Agent", state: "Detected", serviceState: "Healthy", throughput: "9.8 Gbps", fallback: "Validated standby", impact: "None", category: "Weather" },
  { id: "ss-2", title: "Optical attenuation increases", detail: "Attenuation rises from 1.1 dB to 4.4 dB across both terminals.", actor: "Global Link Health Agent", state: "Validating", serviceState: "Healthy", throughput: "9.7 Gbps", fallback: "Validated standby", impact: "None", category: "Telemetry" },
  { id: "ss-3", title: "Link margin crosses the preventive threshold", detail: "Margin falls below 6 dB on both terminals.", actor: "Global Link Health Agent", state: "Active", serviceState: "At risk", throughput: "9.5 Gbps", fallback: "Validated standby", impact: "None", category: "Telemetry" },
  { id: "ss-4", title: "Throughput begins to decline", detail: "Delivered throughput falls below the committed capacity envelope.", actor: "Customer Impact Agent", state: "Active", serviceState: "At risk", throughput: "9.1 Gbps", fallback: "Validated standby", impact: "Emerging", category: "Customer impact" },
  { id: "ss-5", title: "Customer impact is calculated", detail: "42,000 synthetic downstream users identified across 34 tower clusters.", actor: "Customer Impact Agent", state: "Customer impact confirmed", serviceState: "Degraded", throughput: "8.9 Gbps", fallback: "Validated standby", impact: "Moderate", category: "Customer impact" },
  { id: "ss-6", title: "Both terminals are validated as healthy", detail: "No hardware faults, alignment and mounting stable.", actor: "Optical Path Investigator", state: "Customer impact confirmed", serviceState: "Degraded", throughput: "8.8 Gbps", fallback: "Validated standby", impact: "Moderate", category: "Agent finding" },
  { id: "ss-7", title: "Weather is identified as the leading cause", detail: "Attenuation tracks visibility decline with a four minute lag.", actor: "Weather Risk Agent", state: "Customer impact confirmed", serviceState: "Degraded", throughput: "8.8 Gbps", fallback: "Validated standby", impact: "Moderate", category: "Agent finding" },
  { id: "ss-8", title: "RF fallback capacity is validated", detail: "6 Gbps usable with 7.8 ms latency and loss below 0.01 percent.", actor: "RF Fallback Guardian", state: "Mitigation in progress", serviceState: "Degraded", throughput: "8.7 Gbps", fallback: "Validated standby", impact: "Moderate", category: "Agent finding" },
  { id: "ss-9", title: "Preventive traffic transition is recommended", detail: "Move priority classes to RF fallback before further optical decline.", actor: "RF Fallback Guardian", state: "Mitigation in progress", serviceState: "Degraded", throughput: "8.7 Gbps", fallback: "Validated standby", impact: "Moderate", category: "Agent finding" },
  { id: "ss-10", title: "Human approval is requested", detail: "Transport state change requires the incident commander's approval.", actor: "Incident Commander Agent", state: "Mitigation in progress", serviceState: "Degraded", throughput: "8.7 Gbps", fallback: "Validated standby", impact: "Moderate", requiresApproval: true, category: "Approval" },
  { id: "ss-11", title: "Priority traffic transitions to RF fallback", detail: "3.1 Gbps of priority traffic moves to the fallback path.", actor: "RF Fallback Guardian", state: "Customer impact mitigated", serviceState: "Degraded", throughput: "8.6 Gbps", fallback: "Active", impact: "Moderate, mitigated", category: "Traffic transition" },
  { id: "ss-12", title: "Customer service is validated", detail: "Reachability, throughput, latency and loss all within fallback objectives.", actor: "Customer Impact Agent", state: "Customer impact mitigated", serviceState: "Degraded", throughput: "8.6 Gbps", fallback: "Active", impact: "Moderate, mitigated", category: "Service validation" },
  { id: "ss-13", title: "SLO impact is recalculated", detail: "3.4 percent of the monthly error budget consumed.", actor: "SLO Guardian", state: "Customer impact mitigated", serviceState: "Degraded", throughput: "8.6 Gbps", fallback: "Active", impact: "Moderate, mitigated", category: "SLO" },
  { id: "ss-14", title: "Optical conditions begin to recover", detail: "Visibility improves past 4 km and attenuation starts falling.", actor: "Weather Risk Agent", state: "Monitoring recovery", serviceState: "Recovering", throughput: "8.8 Gbps", fallback: "Active", impact: "Reducing", category: "Recovery" },
  { id: "ss-15", title: "Return-to-optical recommendation is generated", detail: "Margin holds above 8.5 dB for 15 continuous minutes.", actor: "Global Link Health Agent", state: "Monitoring recovery", serviceState: "Recovering", throughput: "9.2 Gbps", fallback: "Active", impact: "Low", requiresApproval: true, category: "Agent finding" },
  { id: "ss-16", title: "Service is restored to the optical route", detail: "Priority traffic returns to the primary optical path.", actor: "RF Fallback Guardian", state: "Service restored", serviceState: "Healthy", throughput: "9.7 Gbps", fallback: "Validated standby", impact: "None", category: "Traffic transition" },
  { id: "ss-17", title: "Final validation is completed", detail: "All validation checks pass and evidence is complete.", actor: "SLO Guardian", state: "Validation in progress", serviceState: "Healthy", throughput: "9.8 Gbps", fallback: "Validated standby", impact: "None", category: "Service validation" },
  { id: "ss-18", title: "Situation is resolved", detail: "Situation closed and the fog response pattern retained as knowledge.", actor: "R. Venkatesan", state: "Resolved", serviceState: "Healthy", throughput: "9.8 Gbps", fallback: "Validated standby", impact: "None", category: "Recovery" },
];

export const fallbackFailureEvent = {
  title: "Simulated fallback capacity failure",
  detail: "RF fallback capacity drops to 1.8 Gbps. Priority traffic is held on the degraded optical path and the alternate fiber route is escalated to the partner escalation owner.",
};

export const weatherRecoveryEvent = {
  title: "Simulated early weather recovery",
  detail: "Fog disperses 40 minutes ahead of forecast. Link margin recovers above 8.5 dB and the return-to-optical validation window opens early.",
};

export const situationParticipants = [
  "R. Venkatesan, Incident Commander",
  "S. Krishnan, Optical Engineering",
  "N. Iyer, Network Operations",
  "A. Rahman, Customer Operations",
  "M. Dorai, SRE",
  "P. Sundar, Communications",
  "India South NOC duty desk",
  "Coastal Transit Partners duty manager",
  "Chennai field crew 3",
];

export { chennaiService as situationService, chennaiLink as situationLink };
