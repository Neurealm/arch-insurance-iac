/**
 * Predictive Link Risk Center — page-specific synthetic demonstration data.
 *
 * ALL values are fabricated for demonstration purposes only. Customers,
 * regions, products, optical links, services and digital coworkers are reused
 * from ./goocFixtures and ./cshFixtures so every Agentic SRE NOC page keeps the
 * same identifiers. Keep this module free of React.
 */

import {
  agents, links, CUSTOMERS, PRODUCTS, REGIONS,
  type Product, type Region,
} from "./goocFixtures";
import { customerServices } from "./cshFixtures";

/* ------------------------------ taxonomies ------------------------------ */

export const PREDICTION_HORIZONS = [
  "Next hour", "Next 6 hours", "Next 12 hours", "Next 24 hours", "Next 3 days", "Next 7 days",
] as const;
export type PredictionHorizon = (typeof PREDICTION_HORIZONS)[number];

/** Hours of look-ahead per horizon, used for deterministic queue filtering. */
export const HORIZON_HOURS: Record<PredictionHorizon, number> = {
  "Next hour": 1,
  "Next 6 hours": 6,
  "Next 12 hours": 12,
  "Next 24 hours": 24,
  "Next 3 days": 72,
  "Next 7 days": 168,
};

export const PLR_RISK_CATEGORIES = [
  "Fog", "Rain", "Wind", "Structural vibration", "Link margin decline",
  "Alignment drift", "Optical attenuation", "Capacity pressure",
  "RF fallback saturation", "Power instability", "Firmware instability",
  "Telemetry quality",
] as const;
export type PlrRiskCategory = (typeof PLR_RISK_CATEGORIES)[number];

export const RISK_SEVERITIES = ["Watch", "Elevated", "High", "Critical"] as const;
export type RiskSeverity = (typeof RISK_SEVERITIES)[number];

export const PREDICTIVE_STATES = [
  "Normal", "Watch", "Elevated risk", "High risk", "Critical risk",
  "Preventive action active", "Risk mitigated", "Data insufficient",
] as const;
export type PredictiveState = (typeof PREDICTIVE_STATES)[number];

export const AUTOMATION_ELIGIBILITY = [
  "Automatable", "Approval required", "Manual only",
] as const;
export type AutomationEligibility = (typeof AUTOMATION_ELIGIBILITY)[number];

export const SLO_EXPOSURES = ["None", "At risk", "Predicted breach"] as const;
export type SloExposure = (typeof SLO_EXPOSURES)[number];

export const CONFIDENCE_BANDS = [
  "All confidence", "Above 85 percent", "70 to 85 percent", "Below 70 percent",
] as const;

export const SAVED_VIEWS = [
  "Default predictive view",
  "High confidence only",
  "Customer impacting",
  "Automatable actions",
  "Weather driven risk",
] as const;

export const severityChipClass: Record<RiskSeverity, string> = {
  Watch: "border-slate-200 bg-slate-50 text-slate-600",
  Elevated: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Critical: "border-rose-200 bg-rose-50 text-rose-700",
};

export const stateChipClass: Record<PredictiveState, string> = {
  Normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Watch: "border-slate-200 bg-slate-50 text-slate-600",
  "Elevated risk": "border-amber-200 bg-amber-50 text-amber-700",
  "High risk": "border-orange-200 bg-orange-50 text-orange-700",
  "Critical risk": "border-rose-200 bg-rose-50 text-rose-700",
  "Preventive action active": "border-indigo-200 bg-indigo-50 text-indigo-700",
  "Risk mitigated": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Data insufficient": "border-slate-200 bg-slate-100 text-slate-500",
};

export const PLR_CUSTOMERS = CUSTOMERS;
export const PLR_PRODUCTS = PRODUCTS;
export const PLR_REGIONS = REGIONS;

/* --------------------------------- KPIs --------------------------------- */

export interface PlrKpi {
  id: string;
  title: string;
  value: string;
  sub: string;
  status: "good" | "watch" | "risk";
  trend: "up" | "down" | "flat";
  delta: string;
  target: string;
  explain: string;
  synthetic?: boolean;
  filter: { kind: "none" | "severity" | "confidence" | "automation" | "slo" | "category"; value?: string };
  spark: number[];
}

export const plrKpis: PlrKpi[] = [
  {
    id: "kpi-links-at-risk", title: "Links at Predicted Risk", value: "23",
    sub: "Within the next 12 hours", status: "watch", trend: "up",
    delta: "+8 vs 6 hours ago", target: "Target below 15 links",
    explain: "Optical links whose forecast conditions place them outside the safe operating envelope inside the selected prediction horizon.",
    filter: { kind: "none" },
    spark: [9, 11, 12, 12, 14, 15, 17, 18, 20, 21, 22, 23],
  },
  {
    id: "kpi-services-exposed", title: "Customer Services Exposed", value: "9",
    sub: "Across six synthetic customers", status: "watch", trend: "up",
    delta: "+3 vs previous period", target: "Target below 5 services",
    explain: "Customer services carried by at least one link with an open predictive risk.",
    filter: { kind: "slo", value: "At risk" },
    spark: [4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9],
  },
  {
    id: "kpi-capacity", title: "Capacity at Risk", value: "64 Gbps",
    sub: "Committed customer capacity exposed", status: "watch", trend: "up",
    delta: "+18 Gbps vs 6 hours ago", target: "Threshold 40 Gbps",
    explain: "Sum of committed capacity on customer services exposed to an open predictive risk.",
    filter: { kind: "none" },
    spark: [28, 31, 34, 38, 41, 45, 49, 52, 56, 59, 62, 64],
  },
  {
    id: "kpi-high-confidence", title: "High Confidence Predictions", value: "17",
    sub: "Predictions above 85 percent confidence", status: "good", trend: "up",
    delta: "+5 vs previous period", target: "Target above 70 percent of predictions",
    explain: "Predictions where evidence completeness and model calibration exceed the high confidence threshold.",
    filter: { kind: "confidence", value: "Above 85 percent" },
    spark: [8, 9, 10, 11, 12, 13, 14, 15, 16, 16, 17, 17],
  },
  {
    id: "kpi-actions", title: "Preventive Actions Available", value: "19",
    sub: "Alternate paths or remote recovery available", status: "good", trend: "up",
    delta: "+4 vs previous period", target: "Target above 80 percent coverage",
    explain: "Predicted risks with at least one validated preventive option that protects the customer service.",
    filter: { kind: "automation", value: "Automatable" },
    spark: [11, 12, 13, 14, 15, 16, 16, 17, 18, 18, 19, 19],
  },
  {
    id: "kpi-approval", title: "Approval Required", value: "7",
    sub: "High impact preventive actions awaiting review", status: "risk", trend: "up",
    delta: "+2 vs previous period", target: "Review within 30 minutes",
    explain: "Recommended preventive actions gated behind human approval because of customer or capacity impact.",
    filter: { kind: "automation", value: "Approval required" },
    spark: [3, 3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 7],
  },
  {
    id: "kpi-slo-avoidable", title: "Predicted SLO Breaches Avoidable", value: "8",
    sub: "With timely preventive intervention", status: "watch", trend: "flat",
    delta: "Unchanged vs previous period", target: "Target zero realised breaches",
    explain: "Predicted objective breaches that preventive action is forecast to avoid entirely.",
    synthetic: true,
    filter: { kind: "slo", value: "Predicted breach" },
    spark: [6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8],
  },
  {
    id: "kpi-prevented", title: "Incidents Prevented This Month", value: "41",
    sub: "Based on demonstration scenario outcomes", status: "good", trend: "up",
    delta: "+12 vs previous month", target: "Demonstration benchmark 35",
    explain: "Synthetic demonstration count of customer impacting incidents avoided through preventive agentic action.",
    synthetic: true,
    filter: { kind: "none" },
    spark: [12, 16, 19, 22, 25, 28, 31, 34, 36, 38, 40, 41],
  },
];

/* ---------------------------- predicted risks --------------------------- */

export interface PredictedLinkRisk {
  id: string;
  rank: number;
  linkId: string;
  linkName: string;
  serviceId: string;
  serviceName: string;
  customer: string;
  region: Region;
  product: Product;
  primaryRisk: PlrRiskCategory;
  secondaryRisk: PlrRiskCategory | "None";
  currentHealth: string;
  predictedState: PredictiveState;
  severity: RiskSeverity;
  probability: number;
  confidence: number;
  hoursToImpact: number;
  timeToImpact: string;
  capacityGbps: number;
  customersAffected: number;
  usersExposed: string;
  sloExposure: SloExposure;
  errorBudgetImpact: string;
  fallbackReadiness: string;
  preventiveAction: string;
  automation: AutomationEligibility;
  agent: string;
  lastUpdate: string;
}

export const predictedLinkRisks: PredictedLinkRisk[] = [
  {
    id: "plr-chennai-fog", rank: 1, linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041",
    serviceId: "csvc-chennai-041", serviceName: "Chennai Mobile Backhaul Service 041",
    customer: "Bharat Mobility Networks", region: "India", product: "Lightbridge Pro",
    primaryRisk: "Fog", secondaryRisk: "Optical attenuation", currentHealth: "Healthy",
    predictedState: "High risk", severity: "High", probability: 92, confidence: 91,
    hoursToImpact: 6, timeToImpact: "5 h 40 m", capacityGbps: 10, customersAffected: 1,
    usersExposed: "42,000", sloExposure: "Predicted breach",
    errorBudgetImpact: "23 points consumed without action",
    fallbackReadiness: "RF fallback validated, 10 Gbps available",
    preventiveAction: "Transition priority traffic to RF fallback",
    automation: "Approval required", agent: "Weather Risk Agent", lastUpdate: "11:04:22 UTC",
  },
  {
    id: "plr-mumbai-drift", rank: 2, linkId: "lnk-mumbai-018", linkName: "Mumbai Metro Link 018",
    serviceId: "csvc-mumbai-018", serviceName: "Mumbai Metro Ring Service 018",
    customer: "Metro Fiber Alliance", region: "India", product: "Lightbridge Pro",
    primaryRisk: "Alignment drift", secondaryRisk: "Link margin decline", currentHealth: "At risk",
    predictedState: "Elevated risk", severity: "Elevated", probability: 74, confidence: 87,
    hoursToImpact: 20, timeToImpact: "19 h 30 m", capacityGbps: 8, customersAffected: 1,
    usersExposed: "18,500", sloExposure: "At risk",
    errorBudgetImpact: "9 points consumed without action",
    fallbackReadiness: "Alternate optical route available",
    preventiveAction: "Apply adaptive pointing profile",
    automation: "Automatable", agent: "Beam Alignment Agent", lastUpdate: "11:02:10 UTC",
  },
  {
    id: "plr-nairobi-fallback", rank: 3, linkId: "lnk-nairobi-007", linkName: "Nairobi Middle Mile 007",
    serviceId: "csvc-nairobi-007", serviceName: "Nairobi Middle Mile Service 007",
    customer: "Rift Valley Telecom", region: "East Africa", product: "Lightbridge",
    primaryRisk: "RF fallback saturation", secondaryRisk: "Rain", currentHealth: "On RF fallback",
    predictedState: "Critical risk", severity: "Critical", probability: 81, confidence: 89,
    hoursToImpact: 1, timeToImpact: "50 m", capacityGbps: 5, customersAffected: 1,
    usersExposed: "12,300", sloExposure: "Predicted breach",
    errorBudgetImpact: "31 points consumed without action",
    fallbackReadiness: "Fallback at 88 percent utilisation",
    preventiveAction: "Shape non-critical traffic classes on fallback",
    automation: "Automatable", agent: "RF Fallback Guardian", lastUpdate: "11:03:41 UTC",
  },
  {
    id: "plr-rio-capacity", rank: 4, linkId: "lnk-rio-023", linkName: "Rio Smart City Mesh 023",
    serviceId: "csvc-rio-023", serviceName: "Rio Smart City Mesh Service 023",
    customer: "Cidade Conectada", region: "Brazil", product: "Beam",
    primaryRisk: "Capacity pressure", secondaryRisk: "Optical attenuation", currentHealth: "Degraded",
    predictedState: "High risk", severity: "High", probability: 71, confidence: 84,
    hoursToImpact: 4, timeToImpact: "4 h 20 m", capacityGbps: 6, customersAffected: 1,
    usersExposed: "26,100", sloExposure: "At risk",
    errorBudgetImpact: "14 points consumed without action",
    fallbackReadiness: "Mesh rebalance path available",
    preventiveAction: "Rebalance mesh routes before the evening peak",
    automation: "Approval required", agent: "Capacity Optimization Agent", lastUpdate: "10:58:07 UTC",
  },
  {
    id: "plr-california-handoff", rank: 5, linkId: "lnk-california-012", linkName: "California DCI Link 012",
    serviceId: "csvc-california-012", serviceName: "California Data Centre Interconnect 012",
    customer: "Pacific Cloud Systems", region: "United States", product: "Lightbridge Pro",
    primaryRisk: "Power instability", secondaryRisk: "Firmware instability", currentHealth: "Unavailable",
    predictedState: "Critical risk", severity: "Critical", probability: 68, confidence: 78,
    hoursToImpact: 2, timeToImpact: "2 h 05 m", capacityGbps: 20, customersAffected: 1,
    usersExposed: "Enterprise workloads",
    sloExposure: "Predicted breach", errorBudgetImpact: "41 points consumed without action",
    fallbackReadiness: "Alternate fiber route validated",
    preventiveAction: "Hold traffic on alternate fiber route and verify upstream handoff",
    automation: "Approval required", agent: "Optical Path Investigator", lastUpdate: "11:01:55 UTC",
  },
  {
    id: "plr-congo-rain", rank: 6, linkId: "lnk-central-africa-004", linkName: "Central Africa River Crossing 004",
    serviceId: "csvc-congo-004", serviceName: "Congo River Crossing Trunk 004",
    customer: "Congo Basin Connect", region: "Central Africa", product: "Lightbridge",
    primaryRisk: "Rain", secondaryRisk: "Wind", currentHealth: "Maintenance",
    predictedState: "Elevated risk", severity: "Elevated", probability: 58, confidence: 80,
    hoursToImpact: 9, timeToImpact: "8 h 45 m", capacityGbps: 4, customersAffected: 1,
    usersExposed: "9,400", sloExposure: "At risk",
    errorBudgetImpact: "7 points consumed without action",
    fallbackReadiness: "RF fallback partially available",
    preventiveAction: "Pre-position field team and restrict planned changes",
    automation: "Approval required", agent: "Weather Risk Agent", lastUpdate: "10:47:19 UTC",
  },
  {
    id: "plr-jakarta-vibration", rank: 7, linkId: "lnk-jakarta-031", linkName: "Jakarta Coastal Link 031",
    serviceId: "csvc-jakarta-031", serviceName: "Jakarta Coastal Mesh Service 031",
    customer: "Metro Fiber Alliance", region: "Southeast Asia", product: "Beam",
    primaryRisk: "Structural vibration", secondaryRisk: "Alignment drift", currentHealth: "Healthy",
    predictedState: "Watch", severity: "Watch", probability: 44, confidence: 76,
    hoursToImpact: 22, timeToImpact: "21 h 30 m", capacityGbps: 3, customersAffected: 1,
    usersExposed: "6,800", sloExposure: "None",
    errorBudgetImpact: "No material consumption forecast",
    fallbackReadiness: "Mesh redundancy available",
    preventiveAction: "Schedule mount inspection",
    automation: "Manual only", agent: "Beam Alignment Agent", lastUpdate: "10:39:02 UTC",
  },
  {
    id: "plr-frankfurt-power", rank: 8, linkId: "lnk-frankfurt-009", linkName: "Frankfurt Enterprise Span 009",
    serviceId: "csvc-frankfurt-009", serviceName: "Frankfurt Enterprise Campus Service 009",
    customer: "Pacific Cloud Systems", region: "Europe", product: "Lightbridge Pro",
    primaryRisk: "Power instability", secondaryRisk: "Telemetry quality", currentHealth: "Healthy",
    predictedState: "Watch", severity: "Watch", probability: 37, confidence: 72,
    hoursToImpact: 16, timeToImpact: "15 h 40 m", capacityGbps: 5, customersAffected: 1,
    usersExposed: "3,200", sloExposure: "None",
    errorBudgetImpact: "No material consumption forecast",
    fallbackReadiness: "Battery reserve verified",
    preventiveAction: "Verify battery reserve and generator readiness",
    automation: "Approval required", agent: "Global Link Health Agent", lastUpdate: "10:29:44 UTC",
  },
  {
    id: "plr-bengaluru-telemetry", rank: 9, linkId: "lnk-bangalore-055", linkName: "Bengaluru Enterprise Ring 055",
    serviceId: "csvc-bengaluru-055", serviceName: "Bengaluru Enterprise Ring Service 055",
    customer: "Bharat Mobility Networks", region: "India", product: "Beam",
    primaryRisk: "Telemetry quality", secondaryRisk: "None", currentHealth: "Telemetry stale",
    predictedState: "Data insufficient", severity: "Elevated", probability: 83, confidence: 69,
    hoursToImpact: 1, timeToImpact: "Active now", capacityGbps: 2, customersAffected: 1,
    usersExposed: "Visibility only", sloExposure: "None",
    errorBudgetImpact: "Prediction confidence reduced",
    fallbackReadiness: "Not assessable while telemetry is degraded",
    preventiveAction: "Scale collector consumer group and replay backlog",
    automation: "Automatable", agent: "Telemetry Quality Agent", lastUpdate: "11:04:02 UTC",
  },
  {
    id: "plr-singapore-firmware", rank: 10, linkId: "lnk-singapore-026", linkName: "Singapore Port Link 026",
    serviceId: "csvc-singapore-026", serviceName: "Singapore Port Logistics Service 026",
    customer: "Metro Fiber Alliance", region: "Southeast Asia", product: "Lightbridge",
    primaryRisk: "Firmware instability", secondaryRisk: "Link margin decline", currentHealth: "Healthy",
    predictedState: "Elevated risk", severity: "Elevated", probability: 52, confidence: 81,
    hoursToImpact: 11, timeToImpact: "10 h 50 m", capacityGbps: 4, customersAffected: 1,
    usersExposed: "8,100", sloExposure: "At risk",
    errorBudgetImpact: "5 points consumed without action",
    fallbackReadiness: "RF fallback validated",
    preventiveAction: "Restrict planned changes and stage firmware rollback",
    automation: "Approval required", agent: "Change Risk Agent", lastUpdate: "10:52:36 UTC",
  },
];

export const FEATURED_RISK_ID = "plr-chennai-fog";

/** Map from linkId to its predicted state, used for map colouring. */
export const riskByLinkId = new Map(predictedLinkRisks.map((r) => [r.linkId, r]));

/* ---------------------------- forecast series --------------------------- */

export interface ForecastPoint {
  t: string;
  hour: number;
  /** Negative hours are observed history, zero is now, positive is forecast. */
  actualMargin: number | null;
  margin: number;
  marginLow: number;
  marginHigh: number;
  rxPower: number;
  attenuation: number;
  visibility: number;
  humidity: number;
  wind: number;
  vibration: number;
  throughput: number;
  latency: number;
  packetLoss: number;
  fallbackUtil: number;
  headroom: number;
}

const round = (n: number, p = 2) => Number(n.toFixed(p));

/** Deterministic Chennai fog forecast from -6 h through +24 h. */
export const chennaiForecast: ForecastPoint[] = Array.from({ length: 31 }, (_, i) => {
  const hour = i - 6;
  const fog = hour <= 0 ? 0 : Math.min(1, hour / 6);
  const decay = hour <= 0 ? 0 : Math.min(1, Math.max(0, (hour - 1) / 5));
  const recover = hour > 9 ? Math.min(1, (hour - 9) / 6) : 0;
  const severity = Math.max(0, decay - recover);
  const margin = round(9.4 - 0.05 * Math.max(hour, 0) - 6.2 * severity);
  return {
    t: `${((11 + hour + 24) % 24).toString().padStart(2, "0")}:00`,
    hour,
    actualMargin: hour <= 0 ? round(9.6 + Math.sin(i) * 0.15) : null,
    margin,
    marginLow: round(margin - 0.4 - 0.9 * severity),
    marginHigh: round(margin + 0.4 + 0.9 * severity),
    rxPower: round(-24.1 - 4.6 * severity),
    attenuation: round(1.2 + 6.4 * severity),
    visibility: round(9.8 - 8.6 * fog + 6.0 * recover, 1),
    humidity: round(72 + 24 * fog - 14 * recover, 0),
    wind: round(11 + Math.sin(i / 2) * 3, 0),
    vibration: round(0.18 + Math.abs(Math.sin(i / 3)) * 0.05),
    throughput: round(9.8 - 5.4 * severity, 1),
    latency: round(4.2 + 6.8 * severity, 1),
    packetLoss: round(0.01 + 0.62 * severity),
    fallbackUtil: round(12 + 58 * severity, 0),
    headroom: round(88 - 58 * severity, 0),
  };
});

export const FORECAST_VIEWS = ["1 hour", "6 hours", "12 hours", "24 hours", "7 days"] as const;
export const FORECAST_VIEW_HOURS: Record<(typeof FORECAST_VIEWS)[number], number> = {
  "1 hour": 1, "6 hours": 6, "12 hours": 12, "24 hours": 24, "7 days": 24,
};

export const FORECAST_METRICS = [
  { key: "margin", label: "Link margin (dB)", color: "#4f46e5" },
  { key: "rxPower", label: "Received optical power (dBm)", color: "#0891b2" },
  { key: "attenuation", label: "Optical attenuation (dB)", color: "#f97316" },
  { key: "visibility", label: "Visibility (km)", color: "#0ea5e9" },
  { key: "humidity", label: "Humidity (%)", color: "#14b8a6" },
  { key: "wind", label: "Wind speed (km/h)", color: "#64748b" },
  { key: "vibration", label: "Structural vibration (g)", color: "#a855f7" },
  { key: "throughput", label: "Delivered throughput (Gbps)", color: "#16a34a" },
  { key: "latency", label: "Latency (ms)", color: "#eab308" },
  { key: "packetLoss", label: "Packet loss (%)", color: "#e11d48" },
  { key: "fallbackUtil", label: "RF fallback utilisation (%)", color: "#8b5cf6" },
  { key: "headroom", label: "Capacity headroom (%)", color: "#0f766e" },
] as const;
export type ForecastMetricKey = (typeof FORECAST_METRICS)[number]["key"];

export const riskHorizonMilestones = [
  { id: "now", label: "Current state", value: "Healthy", at: "Now", tone: "good" as const },
  { id: "emerging", label: "Risk emerging", value: "Visibility decline detected", at: "Within 2 hours", tone: "watch" as const },
  { id: "action", label: "Recommended preventive action", value: "Transition priority traffic", at: "Within 90 minutes", tone: "action" as const },
  { id: "latest", label: "Latest safe intervention", value: "Traffic transition still reversible", at: "Within 3 hours", tone: "action" as const },
  { id: "elevated", label: "Elevated risk", value: "Margin below planning threshold", at: "Within 4 hours", tone: "risk" as const },
  { id: "degraded", label: "Expected service degradation", value: "Customer throughput impacted", at: "Within 6 hours", tone: "risk" as const },
  { id: "recovery", label: "Predicted recovery window", value: "Visibility restored, optical resumed", at: "Within 15 hours", tone: "good" as const },
];

/* --------------------------- contributing factors ----------------------- */

export interface ContributingFactor {
  id: string;
  name: string;
  current: string;
  normalRange: string;
  trend: "Rising" | "Falling" | "Stable";
  contribution: number;
  direction: "increases" | "reduces";
  confidence: number;
  freshness: string;
  source: string;
}

export const chennaiFactors: ContributingFactor[] = [
  { id: "f-visibility", name: "Visibility decline", current: "9.8 km falling to 1.2 km", normalRange: "8 to 12 km", trend: "Falling", contribution: 24, direction: "increases", confidence: 93, freshness: "42 s", source: "Synthetic regional weather forecast" },
  { id: "f-fog", name: "Fog density increase", current: "0.42 g/m3", normalRange: "Below 0.10 g/m3", trend: "Rising", contribution: 19, direction: "increases", confidence: 90, freshness: "42 s", source: "Synthetic regional weather forecast" },
  { id: "f-humidity", name: "Relative humidity increase", current: "88 percent", normalRange: "60 to 80 percent", trend: "Rising", contribution: 8, direction: "increases", confidence: 88, freshness: "1 m", source: "Terminal environmental sensor" },
  { id: "f-rx", name: "Received optical power decline", current: "-24.1 dBm", normalRange: "-23.0 to -25.5 dBm", trend: "Falling", contribution: 14, direction: "increases", confidence: 95, freshness: "12 s", source: "Terminal optical telemetry" },
  { id: "f-atten", name: "Optical attenuation increase", current: "1.2 dB", normalRange: "0.6 to 1.4 dB", trend: "Rising", contribution: 12, direction: "increases", confidence: 94, freshness: "12 s", source: "Terminal optical telemetry" },
  { id: "f-margin", name: "Link margin decline", current: "9.4 dB", normalRange: "9.0 to 11.5 dB", trend: "Falling", contribution: 11, direction: "increases", confidence: 92, freshness: "12 s", source: "Link performance service" },
  { id: "f-history", name: "Historical fog sensitivity", current: "7 comparable events", normalRange: "Reference pattern", trend: "Stable", contribution: 9, direction: "increases", confidence: 86, freshness: "6 h", source: "Operational knowledge base" },
  { id: "f-demand", name: "Current traffic demand", current: "9.8 Gbps of 10 Gbps", normalRange: "7 to 10 Gbps", trend: "Rising", contribution: 6, direction: "increases", confidence: 90, freshness: "30 s", source: "Service delivery telemetry" },
  { id: "f-fallback", name: "Remaining RF fallback capacity", current: "10 Gbps available", normalRange: "Above 8 Gbps", trend: "Stable", contribution: 8, direction: "reduces", confidence: 91, freshness: "45 s", source: "Fallback readiness service" },
  { id: "f-terminal", name: "Terminal health", current: "Nominal, no faults", normalRange: "Nominal", trend: "Stable", contribution: 7, direction: "reduces", confidence: 96, freshness: "18 s", source: "Terminal health service" },
  { id: "f-alignment", name: "Alignment health", current: "Beam lock stable, 0.02 mrad drift", normalRange: "Below 0.08 mrad", trend: "Stable", contribution: 6, direction: "reduces", confidence: 95, freshness: "18 s", source: "Alignment telemetry" },
  { id: "f-mount", name: "Mounting stability", current: "0.18 g vibration", normalRange: "Below 0.35 g", trend: "Stable", contribution: 5, direction: "reduces", confidence: 93, freshness: "1 m", source: "Structural sensor" },
];

export const factorExplanation =
  "The forecast risk is primarily environmental. Terminal health, alignment, and mounting stability remain within expected operating ranges.";

/* ---------------------------- customer exposure ------------------------- */

export const chennaiExposure = {
  customersExposed: 1,
  servicesExposed: 1,
  committedCapacity: "10 Gbps",
  deliveredTraffic: "9.8 Gbps",
  downstreamLocations: "34 mobile sites",
  downstreamUsers: "42,000",
  availabilityObjective: "99.999%",
  latencyObjective: "6 ms",
  errorBudgetRemaining: "34%",
  errorBudgetWithoutAction: "11%",
  errorBudgetWithAction: "33%",
  creditExposure: "USD 48,000",
  revenueExposure: "USD 310,000 annualised",
  priority: "Platinum",
  communication: "Customer operations notified, standing by for transition window",
};

export interface ExposureOption {
  id: string;
  approach: string;
  customerOutcome: string;
  sreOutcome: string;
  errorBudget: string;
  outageMinutes: string;
  tone: "risk" | "watch" | "good";
}

export const exposureComparison: ExposureOption[] = [
  { id: "none", approach: "No action", customerOutcome: "Throughput falls to 4.4 Gbps for roughly 3 hours", sreOutcome: "Reactive incident, 4 responders engaged", errorBudget: "34% falls to 11%", outageMinutes: "182 degraded minutes", tone: "risk" },
  { id: "reactive", approach: "Reactive action after degradation", customerOutcome: "Impact begins, fallback restores service after 38 minutes", sreOutcome: "Incident opened, customer communication required", errorBudget: "34% falls to 24%", outageMinutes: "38 degraded minutes", tone: "watch" },
  { id: "preventive", approach: "Preventive agentic action", customerOutcome: "No perceptible customer impact", sreOutcome: "Governed transition with one approval, no incident", errorBudget: "34% holds at 33%", outageMinutes: "0 degraded minutes", tone: "good" },
];

/* -------------------------- preventive actions -------------------------- */

export interface PreventiveAction {
  id: string;
  name: string;
  customerOutcome: string;
  sloImpact: string;
  capacity: string;
  latency: string;
  operationalRisk: "Low" | "Moderate" | "High";
  duration: string;
  reversibility: string;
  policy: "Within policy" | "Policy review required" | "Outside policy";
  automation: AutomationEligibility;
  approval: string;
  confidence: number;
  validation: string;
  recommended?: boolean;
}

export const preventiveActions: PreventiveAction[] = [
  { id: "pa-observe", name: "Continue observing", customerOutcome: "Degradation likely at hour six", sloImpact: "Predicted breach", capacity: "No change", latency: "No change", operationalRisk: "High", duration: "None", reversibility: "Not applicable", policy: "Within policy", automation: "Automatable", approval: "Not required", confidence: 91, validation: "Risk probability remains above 90 percent" },
  { id: "pa-monitor", name: "Increase monitoring frequency", customerOutcome: "No protection, earlier detection only", sloImpact: "Predicted breach", capacity: "No change", latency: "No change", operationalRisk: "Low", duration: "Immediate", reversibility: "Fully reversible", policy: "Within policy", automation: "Automatable", approval: "Not required", confidence: 94, validation: "Sampling interval reduced to 5 seconds" },
  { id: "pa-priority", name: "Transition priority traffic to RF fallback", customerOutcome: "Priority classes protected, no perceptible impact", sloImpact: "Objective maintained", capacity: "10 Gbps fallback available", latency: "+1.4 ms", operationalRisk: "Low", duration: "6 minutes", reversibility: "Reversible within 5 minutes", policy: "Within policy", automation: "Approval required", approval: "Human approval required", confidence: 91, validation: "Fallback carries priority classes with loss below 0.01 percent", recommended: true },
  { id: "pa-all", name: "Transition all traffic to RF fallback", customerOutcome: "Service protected, best effort classes slower", sloImpact: "Objective maintained", capacity: "10 Gbps fallback, 0 headroom", latency: "+2.1 ms", operationalRisk: "Moderate", duration: "9 minutes", reversibility: "Reversible within 10 minutes", policy: "Policy review required", automation: "Approval required", approval: "Human approval required", confidence: 84, validation: "Fallback utilisation stays below 95 percent" },
  { id: "pa-optical", name: "Use alternate optical route", customerOutcome: "Protected only if the alternate span stays clear", sloImpact: "At risk", capacity: "6 Gbps", latency: "+0.6 ms", operationalRisk: "Moderate", duration: "11 minutes", reversibility: "Reversible", policy: "Within policy", automation: "Approval required", approval: "Human approval required", confidence: 68, validation: "Alternate span visibility remains above 4 km" },
  { id: "pa-fiber", name: "Use alternate fiber route", customerOutcome: "Fully protected, partner dependency", sloImpact: "Objective maintained", capacity: "10 Gbps", latency: "+4.8 ms", operationalRisk: "Moderate", duration: "26 minutes", reversibility: "Reversible with partner coordination", policy: "Policy review required", automation: "Manual only", approval: "Partner approval required", confidence: 72, validation: "Partner handoff confirms capacity reservation" },
  { id: "pa-beam", name: "Reacquire beam", customerOutcome: "No benefit, alignment already healthy", sloImpact: "Predicted breach", capacity: "No change", latency: "Brief interruption", operationalRisk: "Moderate", duration: "3 minutes", reversibility: "Reversible", policy: "Within policy", automation: "Automatable", approval: "Not required", confidence: 22, validation: "Alignment drift already within tolerance" },
  { id: "pa-field", name: "Schedule field inspection", customerOutcome: "No near term protection", sloImpact: "Predicted breach", capacity: "No change", latency: "No change", operationalRisk: "Low", duration: "Next business day", reversibility: "Not applicable", policy: "Within policy", automation: "Manual only", approval: "Dispatch approval required", confidence: 35, validation: "Inspection confirms mounting integrity" },
  { id: "pa-freeze", name: "Restrict planned changes", customerOutcome: "Removes change induced risk", sloImpact: "Marginal improvement", capacity: "No change", latency: "No change", operationalRisk: "Low", duration: "12 hours", reversibility: "Fully reversible", policy: "Within policy", automation: "Automatable", approval: "Not required", confidence: 88, validation: "No change requests approved during the risk window" },
  { id: "pa-notify", name: "Notify customer operations", customerOutcome: "Customer aware of the protection plan", sloImpact: "No direct impact", capacity: "No change", latency: "No change", operationalRisk: "Low", duration: "Immediate", reversibility: "Not applicable", policy: "Within policy", automation: "Approval required", approval: "Human approval required", confidence: 96, validation: "Acknowledgement received from customer operations" },
];

export const recommendationSummary = {
  headline: "Transition priority traffic to the validated RF fallback path before optical degradation begins.",
  confidence: 91,
  capacityProtected: "10 Gbps committed capacity",
  outageMinutesAvoided: "182 degraded minutes",
  errorBudgetPreserved: "22 points of error budget",
  fallbackDuration: "Approximately 4 hours",
  rollback: "Return to optical when visibility exceeds 6 km and margin holds above 8.5 dB for 15 minutes",
  approval: "Human approval required before execution",
};

/* -------------------------- predictive coworkers ------------------------ */

export interface PredictiveAgent {
  id: string;
  name: string;
  prediction: string;
  scope: string;
  confidence: number;
  evidenceReviewed: number;
  recommendation: string;
  timeToImpact: string;
  outcomeProtected: string;
  awaitingApproval: number;
  accuracy: string;
  guardrail: string;
  objective: string;
  queue: string[];
  predictionHistory: string[];
  confidenceHistory: number[];
}

const baseAgentName = (id: string) => agents.find((a) => a.id === id)?.name;

export const predictiveAgents: PredictiveAgent[] = [
  {
    id: "agent-weather", name: baseAgentName("agent-weather") ?? "Weather Risk Agent",
    prediction: "Fog driven optical attenuation on Chennai Mobile Backhaul 041 within 6 hours",
    scope: "23 links in India and Southeast Asia", confidence: 92, evidenceReviewed: 34,
    recommendation: "Transition priority traffic to RF fallback", timeToImpact: "5 h 40 m",
    outcomeProtected: "10 Gbps mobile backhaul service", awaitingApproval: 1, accuracy: "89 percent over 90 days",
    guardrail: "Within guardrails",
    objective: "Correlate forecast environmental conditions with optical link behaviour",
    queue: ["Correlating visibility decline with historical optical attenuation", "Refreshing Chennai fog density forecast", "Scoring Central Africa rain exposure"],
    predictionHistory: ["Chennai fog event predicted 5 h 40 m ahead", "Nairobi rain fade predicted 48 m ahead", "Jakarta squall predicted 3 h ahead"],
    confidenceHistory: [74, 78, 81, 85, 88, 90, 92],
  },
  {
    id: "agent-global-health", name: baseAgentName("agent-global-health") ?? "Global Link Health Agent",
    prediction: "Link margin on Chennai 041 falls below 4 dB in 4 hours",
    scope: "1,248 optical links", confidence: 90, evidenceReviewed: 52,
    recommendation: "Raise link to elevated watch and pre-stage fallback", timeToImpact: "4 h 10 m",
    outcomeProtected: "Fleet wide margin envelope", awaitingApproval: 0, accuracy: "91 percent over 90 days",
    guardrail: "Within guardrails",
    objective: "Maintain fleet wide optical margin within the safe operating envelope",
    queue: ["Recomputing margin decline slope for Chennai 041", "Comparing Mumbai 018 with fleet baseline"],
    predictionHistory: ["Mumbai margin decline predicted 20 h ahead", "Frankfurt margin stable"],
    confidenceHistory: [80, 82, 85, 86, 88, 89, 90],
  },
  {
    id: "agent-path", name: baseAgentName("agent-path") ?? "Optical Path Investigator",
    prediction: "No hardware or path fault contributes to the Chennai forecast",
    scope: "Chennai Guindy to Perungudi span", confidence: 95, evidenceReviewed: 27,
    recommendation: "Exclude hardware cause and keep environmental hypothesis", timeToImpact: "Not applicable",
    outcomeProtected: "Investigation accuracy", awaitingApproval: 0, accuracy: "94 percent over 90 days",
    guardrail: "Within guardrails",
    objective: "Establish or exclude physical path causes for predicted degradation",
    queue: ["Excluding terminal hardware failure", "Reviewing California upstream handoff instability"],
    predictionHistory: ["California handoff instability confirmed", "Rio mesh congestion path cleared"],
    confidenceHistory: [88, 90, 91, 92, 93, 94, 95],
  },
  {
    id: "agent-alignment", name: baseAgentName("agent-alignment") ?? "Beam Alignment Agent",
    prediction: "Alignment remains stable through the risk window",
    scope: "Chennai, Mumbai and Jakarta terminals", confidence: 95, evidenceReviewed: 19,
    recommendation: "No alignment action required for Chennai", timeToImpact: "Not applicable",
    outcomeProtected: "Avoided unnecessary beam reacquisition", awaitingApproval: 0, accuracy: "93 percent over 90 days",
    guardrail: "Within guardrails",
    objective: "Validate beam alignment stability before recommending optical actions",
    queue: ["Validating alignment stability", "Scoring Mumbai adaptive pointing profile"],
    predictionHistory: ["Mumbai drift predicted 20 h ahead", "Jakarta vibration watch opened"],
    confidenceHistory: [90, 91, 92, 93, 94, 95, 95],
  },
  {
    id: "agent-fallback", name: baseAgentName("agent-fallback") ?? "RF Fallback Guardian",
    prediction: "RF fallback can carry the full 10 Gbps Chennai service",
    scope: "All fallback paths", confidence: 93, evidenceReviewed: 22,
    recommendation: "Reserve fallback capacity for the Chennai transition window", timeToImpact: "5 h 40 m",
    outcomeProtected: "Fallback capacity guarantee", awaitingApproval: 1, accuracy: "90 percent over 90 days",
    guardrail: "Approval gate engaged",
    objective: "Guarantee fallback readiness before any traffic transition is recommended",
    queue: ["Confirming RF fallback capacity", "Shaping Nairobi fallback traffic classes"],
    predictionHistory: ["Nairobi fallback saturation predicted 50 m ahead"],
    confidenceHistory: [84, 86, 88, 90, 91, 92, 93],
  },
  {
    id: "agent-customer", name: baseAgentName("agent-customer") ?? "Customer Impact Agent",
    prediction: "42,000 synthetic downstream users exposed without preventive action",
    scope: "9 exposed customer services", confidence: 89, evidenceReviewed: 31,
    recommendation: "Notify customer operations ahead of the transition window", timeToImpact: "5 h 40 m",
    outcomeProtected: "Customer experience continuity", awaitingApproval: 1, accuracy: "87 percent over 90 days",
    guardrail: "Within guardrails",
    objective: "Translate link level risk into customer level exposure",
    queue: ["Calculating customer SLO exposure", "Ranking exposed services by priority"],
    predictionHistory: ["Chennai exposure calculated at 42,000 users"],
    confidenceHistory: [80, 82, 84, 86, 87, 88, 89],
  },
  {
    id: "agent-slo", name: baseAgentName("agent-slo") ?? "SLO Guardian",
    prediction: "Error budget falls from 34 percent to 11 percent without action",
    scope: "Availability and latency objectives", confidence: 90, evidenceReviewed: 18,
    recommendation: "Approve preventive transition to preserve error budget", timeToImpact: "5 h 40 m",
    outcomeProtected: "99.999 percent availability objective", awaitingApproval: 1, accuracy: "92 percent over 90 days",
    guardrail: "Approval gate engaged",
    objective: "Protect service objectives and error budgets ahead of predicted impact",
    queue: ["Predicting error budget consumption", "Recomputing burn rate for Chennai 041"],
    predictionHistory: ["Chennai burn rate forecast issued", "Nairobi breach forecast issued"],
    confidenceHistory: [83, 85, 87, 88, 89, 90, 90],
  },
  {
    id: "agent-capacity", name: "Capacity Optimization Agent",
    prediction: "Rio mesh reaches capacity pressure before the evening peak",
    scope: "Mesh and aggregation routes", confidence: 84, evidenceReviewed: 24,
    recommendation: "Rebalance mesh routes ahead of the peak", timeToImpact: "4 h 20 m",
    outcomeProtected: "Smart city mesh throughput", awaitingApproval: 1, accuracy: "85 percent over 90 days",
    guardrail: "Approval gate engaged",
    objective: "Keep committed capacity protected under forecast demand",
    queue: ["Modelling Rio evening peak", "Checking Chennai fallback headroom"],
    predictionHistory: ["Rio peak pressure predicted 4 h ahead"],
    confidenceHistory: [75, 78, 80, 81, 82, 83, 84],
  },
  {
    id: "agent-telemetry", name: baseAgentName("agent-telemetry") ?? "Telemetry Quality Agent",
    prediction: "Bengaluru collector backlog reduces prediction confidence",
    scope: "Regional telemetry ingestion", confidence: 88, evidenceReviewed: 15,
    recommendation: "Scale collector consumer group and replay backlog", timeToImpact: "Active now",
    outcomeProtected: "Prediction data completeness", awaitingApproval: 0, accuracy: "88 percent over 90 days",
    guardrail: "Within guardrails",
    objective: "Maintain telemetry completeness so predictions remain trustworthy",
    queue: ["Monitoring telemetry quality", "Replaying Bengaluru backlog"],
    predictionHistory: ["Bengaluru ingestion degradation detected"],
    confidenceHistory: [78, 80, 83, 85, 86, 87, 88],
  },
  {
    id: "agent-change", name: "Change Risk Agent",
    prediction: "Firmware rollout raises reacquisition delay risk on Singapore 026",
    scope: "Planned changes in the next 24 hours", confidence: 81, evidenceReviewed: 12,
    recommendation: "Restrict planned changes during the Chennai risk window", timeToImpact: "10 h 50 m",
    outcomeProtected: "Change induced incident avoidance", awaitingApproval: 1, accuracy: "83 percent over 90 days",
    guardrail: "Approval gate engaged",
    objective: "Prevent planned changes from compounding predicted environmental risk",
    queue: ["Evaluating upcoming changes", "Staging firmware rollback plan"],
    predictionHistory: ["Singapore firmware risk raised"],
    confidenceHistory: [72, 74, 76, 78, 79, 80, 81],
  },
];

/* -------------------------- prediction performance ---------------------- */

export const performanceMetrics = [
  { id: "generated", label: "Predictions generated", value: "1,284", sub: "Last 30 days" },
  { id: "high", label: "High confidence predictions", value: "812", sub: "Above 85 percent confidence" },
  { id: "confirmed", label: "Confirmed predictions", value: "731", sub: "Outcome matched the forecast" },
  { id: "fp", label: "False positives", value: "81", sub: "Predicted risk did not materialise" },
  { id: "missed", label: "Missed incidents", value: "17", sub: "Impact occurred without prediction" },
  { id: "accepted", label: "Preventive actions accepted", value: "268", sub: "Approved or automated" },
  { id: "avoided", label: "Customer incidents avoided", value: "41", sub: "Demonstration outcome model" },
  { id: "warning", label: "Average warning time", value: "3 h 42 m", sub: "From prediction to expected impact" },
  { id: "precision", label: "Prediction precision", value: "90.0%", sub: "Confirmed of all predicted" },
  { id: "recall", label: "Prediction recall", value: "97.7%", sub: "Predicted of all actual events" },
  { id: "confidence", label: "Average confidence", value: "86.4%", sub: "Across all open predictions" },
  { id: "evidence", label: "Evidence completeness", value: "94.1%", sub: "Required evidence items present" },
];

export const performanceByCategory = [
  { category: "Fog", precision: 93, recall: 96, warningHours: 5.4 },
  { category: "Rain", precision: 88, recall: 94, warningHours: 2.1 },
  { category: "Wind", precision: 82, recall: 90, warningHours: 7.8 },
  { category: "Vibration", precision: 76, recall: 84, warningHours: 18.2 },
  { category: "Alignment drift", precision: 89, recall: 92, warningHours: 16.4 },
  { category: "Link margin decline", precision: 91, recall: 95, warningHours: 4.6 },
  { category: "Capacity pressure", precision: 85, recall: 88, warningHours: 3.9 },
  { category: "Power instability", precision: 74, recall: 81, warningHours: 12.5 },
];

export const performanceByRegion = [
  { region: "India", precision: 92, predictions: 341 },
  { region: "Southeast Asia", precision: 88, predictions: 246 },
  { region: "East Africa", precision: 86, predictions: 198 },
  { region: "Central Africa", precision: 81, predictions: 152 },
  { region: "Brazil", precision: 87, predictions: 141 },
  { region: "United States", precision: 90, predictions: 118 },
  { region: "Europe", precision: 89, predictions: 88 },
];

export const performanceByProduct = [
  { product: "Lightbridge", precision: 88, predictions: 512 },
  { product: "Lightbridge Pro", precision: 92, predictions: 468 },
  { product: "Beam", precision: 84, predictions: 304 },
];

export const warningTimeDistribution = [
  { bucket: "Under 1 h", count: 118 },
  { bucket: "1 to 3 h", count: 264 },
  { bucket: "3 to 6 h", count: 371 },
  { bucket: "6 to 12 h", count: 292 },
  { bucket: "12 to 24 h", count: 164 },
  { bucket: "Over 24 h", count: 75 },
];

export const confidenceCalibration = [
  { band: "50-60", predicted: 55, observed: 52 },
  { band: "60-70", predicted: 65, observed: 63 },
  { band: "70-80", predicted: 75, observed: 74 },
  { band: "80-90", predicted: 85, observed: 86 },
  { band: "90-100", predicted: 95, observed: 93 },
];

export const predictedVersusActual = [
  { window: "-6 d", predicted: 18, actual: 16 },
  { window: "-5 d", predicted: 22, actual: 21 },
  { window: "-4 d", predicted: 19, actual: 20 },
  { window: "-3 d", predicted: 26, actual: 24 },
  { window: "-2 d", predicted: 31, actual: 29 },
  { window: "-1 d", predicted: 27, actual: 27 },
  { window: "Today", predicted: 23, actual: 21 },
];

/* -------------------------------- scenario ------------------------------ */

export interface PlrScenarioStage {
  id: string;
  title: string;
  detail: string;
  actor: string;
  probability: number;
  confidence: number;
  requiresApproval?: boolean;
  timelineOutcome: string;
  state: PredictiveState;
}

export const predictiveScenario: PlrScenarioStage[] = [
  { id: "s1", title: "Early visibility decline detected", detail: "Regional visibility falls from 9.8 km toward 6 km faster than the seasonal pattern.", actor: "Weather Risk Agent", probability: 38, confidence: 74, timelineOutcome: "Weak signal detected", state: "Watch" },
  { id: "s2", title: "Historical weather sensitivity identified", detail: "Seven comparable synthetic fog events on this span produced 5 to 7 dB of attenuation.", actor: "Weather Risk Agent", probability: 51, confidence: 79, timelineOutcome: "Risk pattern matched", state: "Watch" },
  { id: "s3", title: "Optical attenuation forecast generated", detail: "Attenuation is forecast to rise from 1.2 dB to 7.6 dB within six hours.", actor: "Global Link Health Agent", probability: 63, confidence: 83, timelineOutcome: "Attenuation forecast issued", state: "Elevated risk" },
  { id: "s4", title: "Link margin decline forecast generated", detail: "Margin is forecast to fall from 9.4 dB to 3.2 dB, below the 4 dB planning threshold.", actor: "Global Link Health Agent", probability: 74, confidence: 86, timelineOutcome: "Margin forecast issued", state: "Elevated risk" },
  { id: "s5", title: "Customer service exposure calculated", detail: "Chennai Mobile Backhaul Service 041 carries 9.8 Gbps for 42,000 synthetic downstream users.", actor: "Customer Impact Agent", probability: 79, confidence: 87, timelineOutcome: "Customer impact calculated", state: "High risk" },
  { id: "s6", title: "Error budget impact predicted", detail: "Error budget is forecast to fall from 34 percent to 11 percent without action.", actor: "SLO Guardian", probability: 83, confidence: 88, timelineOutcome: "SLO exposure forecast", state: "High risk" },
  { id: "s7", title: "Hardware and alignment causes excluded", detail: "Terminal health, beam lock and mounting stability remain nominal.", actor: "Optical Path Investigator", probability: 86, confidence: 92, timelineOutcome: "Alternative hypotheses excluded", state: "High risk" },
  { id: "s8", title: "RF fallback capacity validated", detail: "Fallback path confirms 10 Gbps of usable capacity with 1.4 ms added latency.", actor: "RF Fallback Guardian", probability: 88, confidence: 93, timelineOutcome: "Alternate route validated", state: "High risk" },
  { id: "s9", title: "Preventive action recommended", detail: "Transition priority traffic to the validated RF fallback path before degradation begins.", actor: "RF Fallback Guardian", probability: 92, confidence: 91, timelineOutcome: "Preventive action recommended", state: "High risk" },
  { id: "s10", title: "Human approval requested", detail: "Customer impacting transition requires an approval decision from the duty operator.", actor: "SLO Guardian", probability: 92, confidence: 91, requiresApproval: true, timelineOutcome: "Human approval requested", state: "High risk" },
  { id: "s11", title: "Traffic transition simulated", detail: "Simulation shows priority classes carried on fallback with loss below 0.01 percent.", actor: "RF Fallback Guardian", probability: 64, confidence: 92, timelineOutcome: "Traffic transition simulated", state: "Preventive action active" },
  { id: "s12", title: "Service health validated", detail: "Delivered throughput holds at 9.8 Gbps and latency settles at 5.6 ms.", actor: "Customer Impact Agent", probability: 31, confidence: 94, timelineOutcome: "Service validated", state: "Preventive action active" },
  { id: "s13", title: "Customer impact avoided", detail: "No perceptible customer impact. Error budget holds at 33 percent.", actor: "SLO Guardian", probability: 8, confidence: 95, timelineOutcome: "Customer impact avoided", state: "Risk mitigated" },
  { id: "s14", title: "Prediction outcome recorded", detail: "Outcome, evidence and warning time recorded against the prediction record.", actor: "Global Link Health Agent", probability: 4, confidence: 96, timelineOutcome: "Prediction outcome recorded", state: "Risk mitigated" },
];

export const fallbackFailureInjection = {
  title: "Simulated fallback capacity failure",
  detail: "RF fallback capacity drops to 4 Gbps during the transition. The agent halts the transition, restores optical priority classes and escalates to the alternate fiber route option.",
  probability: 87,
  confidence: 88,
};

/* ------------------------------- timeline ------------------------------- */

export interface PlrActivityEvent {
  id: string;
  at: string;
  event: string;
  actor: string;
  linkId: string;
  linkName: string;
  serviceName: string;
  probability: number;
  outcome: string;
  status: "Complete" | "In progress" | "Awaiting approval" | "Recorded";
}

export const plrActivity: PlrActivityEvent[] = [
  { id: "ev-1", at: "05:12 UTC", event: "Weak signal detected", actor: "Weather Risk Agent", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 38, outcome: "Visibility decline flagged", status: "Complete" },
  { id: "ev-2", at: "05:44 UTC", event: "Weather forecast updated", actor: "Weather Risk Agent", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 51, outcome: "Fog density forecast raised", status: "Complete" },
  { id: "ev-3", at: "06:21 UTC", event: "Link margin trend changed", actor: "Global Link Health Agent", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 63, outcome: "Decline slope exceeded daily pattern", status: "Complete" },
  { id: "ev-4", at: "07:05 UTC", event: "Risk probability increased", actor: "Global Link Health Agent", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 74, outcome: "Risk raised to elevated", status: "Complete" },
  { id: "ev-5", at: "08:12 UTC", event: "Customer impact calculated", actor: "Customer Impact Agent", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 79, outcome: "42,000 synthetic users exposed", status: "Complete" },
  { id: "ev-6", at: "08:48 UTC", event: "SLO exposure forecast", actor: "SLO Guardian", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 83, outcome: "Error budget forecast to fall to 11 percent", status: "Complete" },
  { id: "ev-7", at: "09:30 UTC", event: "Alternate route validated", actor: "RF Fallback Guardian", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 88, outcome: "10 Gbps fallback confirmed", status: "Complete" },
  { id: "ev-8", at: "10:14 UTC", event: "Preventive action recommended", actor: "RF Fallback Guardian", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 92, outcome: "Priority traffic transition proposed", status: "Complete" },
  { id: "ev-9", at: "10:52 UTC", event: "Human approval requested", actor: "SLO Guardian", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 92, outcome: "Awaiting duty operator decision", status: "Awaiting approval" },
  { id: "ev-10", at: "10:58 UTC", event: "Risk probability increased", actor: "Weather Risk Agent", linkId: "lnk-nairobi-007", linkName: "Nairobi Middle Mile 007", serviceName: "Nairobi Middle Mile Service 007", probability: 81, outcome: "Fallback saturation predicted within 50 minutes", status: "In progress" },
  { id: "ev-11", at: "11:01 UTC", event: "Evidence stored", actor: "Optical Path Investigator", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 92, outcome: "34 evidence items attached", status: "Recorded" },
  { id: "ev-12", at: "11:04 UTC", event: "Risk pattern added to operational knowledge", actor: "Global Link Health Agent", linkId: "lnk-chennai-041", linkName: "Chennai Mobile Backhaul 041", serviceName: "Chennai Mobile Backhaul Service 041", probability: 92, outcome: "Chennai coastal fog pattern version 4", status: "Recorded" },
];

/* -------------------------------- evidence ------------------------------ */

export interface EvidenceGroup {
  id: string;
  label: string;
  items: { name: string; value: string }[];
}

export const chennaiEvidence: EvidenceGroup[] = [
  { id: "telemetry", label: "Telemetry values", items: [
    { name: "Link margin", value: "9.4 dB, falling 0.6 dB per hour" },
    { name: "Received optical power", value: "-24.1 dBm" },
    { name: "Optical attenuation", value: "1.2 dB" },
    { name: "Delivered throughput", value: "9.8 Gbps of 10 Gbps committed" },
  ]},
  { id: "weather", label: "Weather forecast inputs", items: [
    { name: "Visibility forecast", value: "9.8 km falling to 1.2 km within 6 hours" },
    { name: "Fog density", value: "0.42 g/m3 and rising" },
    { name: "Relative humidity", value: "88 percent" },
    { name: "Wind", value: "11 km/h, no loading concern" },
  ]},
  { id: "history", label: "Historical link behaviour", items: [
    { name: "Comparable synthetic events", value: "7 fog events in 18 months" },
    { name: "Typical attenuation", value: "5 to 7 dB" },
    { name: "Typical duration", value: "3 to 5 hours" },
  ]},
  { id: "config", label: "Configuration and hardware", items: [
    { name: "Link configuration", value: "Lightbridge Pro, 10 Gbps, 2.6 km span" },
    { name: "Terminal health", value: "Nominal on both terminals" },
    { name: "Alignment health", value: "Beam lock stable, 0.02 mrad drift" },
    { name: "Mounting stability", value: "0.18 g vibration, within tolerance" },
  ]},
  { id: "capacity", label: "Capacity and fallback", items: [
    { name: "Current capacity", value: "9.8 Gbps delivered, 0.2 Gbps headroom" },
    { name: "Fallback readiness", value: "Validated, 10 Gbps available" },
    { name: "Fallback latency", value: "+1.4 ms" },
  ]},
  { id: "service", label: "Service, SLO and change", items: [
    { name: "Customer service", value: "Chennai Mobile Backhaul Service 041" },
    { name: "Availability objective", value: "99.999 percent" },
    { name: "Error budget", value: "34 percent remaining" },
    { name: "Recent changes", value: "No changes in the last 14 days" },
  ]},
  { id: "quality", label: "Data quality and validation", items: [
    { name: "Data freshness", value: "Telemetry 12 s, forecast 42 s" },
    { name: "Evidence completeness", value: "94 percent of required items present" },
    { name: "Validation criteria", value: "Fallback carries priority classes with loss below 0.01 percent" },
    { name: "Audit history", value: "Prediction created 05:12 UTC, 6 revisions" },
  ]},
];

export const alternativeHypotheses = [
  { hypothesis: "Terminal hardware degradation", verdict: "Excluded", reason: "No hardware faults, temperatures and currents nominal" },
  { hypothesis: "Beam misalignment", verdict: "Excluded", reason: "Beam lock stable with drift well inside tolerance" },
  { hypothesis: "Mounting movement", verdict: "Excluded", reason: "Structural vibration steady at 0.18 g" },
  { hypothesis: "Upstream capacity constraint", verdict: "Unlikely", reason: "Upstream aggregation shows 38 percent headroom" },
  { hypothesis: "Environmental attenuation from fog", verdict: "Supported", reason: "Visibility, humidity and historical sensitivity all align" },
];

/* -------------------------- derived helper values ----------------------- */

export const chennaiService = customerServices.find((s) => s.id === "csvc-chennai-041") ?? null;
export const chennaiLink = links.find((l) => l.id === "lnk-chennai-041") ?? null;
