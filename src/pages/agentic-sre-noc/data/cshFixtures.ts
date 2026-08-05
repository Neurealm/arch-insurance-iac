/**
 * Customer Service Health Explorer — page-specific synthetic demonstration data.
 *
 * ALL values are fabricated for demonstration purposes only. Customers,
 * regions, products, optical links and digital coworkers are reused from
 * ./goocFixtures so the two pages stay consistent. Keep this module free of
 * React so it can be swapped for live telemetry later.
 */

import {
  agents, links, situations, CUSTOMERS, PRODUCTS, REGIONS,
  type Product, type Region,
} from "./goocFixtures";

/* ----------------------------- taxonomies ------------------------------ */

export const SERVICE_TYPES = [
  "Mobile backhaul",
  "Rural middle mile",
  "Metro building interconnect",
  "Data center interconnect",
  "Enterprise campus",
  "Smart city connectivity",
  "Emergency connectivity",
  "Event connectivity",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

/** Two additional synthetic customers beyond the six used by the GOOC page. */
export const EXTRA_CUSTOMERS = [
  "Andaman Campus Networks",
  "Rhine Urban Network Partner",
] as const;

export const CSH_CUSTOMERS = [...CUSTOMERS, ...EXTRA_CUSTOMERS] as const;

export const SLO_STATUSES = ["Within objective", "At risk", "Breaching"] as const;
export type SloStatus = (typeof SLO_STATUSES)[number];

export const RISK_LEVELS = ["Low", "Elevated", "High", "Critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const sloStatusChip: Record<SloStatus, string> = {
  "Within objective": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "At risk": "border-amber-200 bg-amber-50 text-amber-700",
  Breaching: "border-rose-200 bg-rose-50 text-rose-700",
};

export const riskChip: Record<RiskLevel, string> = {
  Low: "border-slate-200 bg-slate-50 text-slate-600",
  Elevated: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Critical: "border-rose-200 bg-rose-50 text-rose-700",
};

/* --------------------------- customer services -------------------------- */

export interface MatrixScores {
  availability: number;
  throughput: number;
  latency: number;
  packetLoss: number;
  opticalHealth: number;
  fallbackReadiness: number;
  weatherExposure: number;
  errorBudget: number;
  changeRisk: number;
  agentConfidence: number;
}

export interface CustomerService {
  id: string;
  customer: string;
  name: string;
  serviceType: ServiceType;
  region: Region;
  product: Product;
  committedGbps: number;
  deliveredGbps: number;
  availability: number;
  availabilityObjective: number;
  latencyMs: number;
  latencyObjectiveMs: number;
  packetLossPct: number;
  sloStatus: SloStatus;
  errorBudgetPct: number;
  primaryRoute: string;
  linkId: string;
  fallbackState: string;
  risk: RiskLevel;
  situationId: string | null;
  agent: string;
  lastUpdate: string;
  usersAffected: string;
  priority: "Platinum" | "Gold" | "Silver";
  creditExposure: string;
  revenueAtRisk: string;
  matrix: MatrixScores;
}

export const attainment = (s: CustomerService) =>
  Number(((s.deliveredGbps / s.committedGbps) * 100).toFixed(1));

export const customerServices: CustomerService[] = [
  {
    id: "csvc-chennai-041",
    customer: "Bharat Mobility Networks",
    name: "Chennai Mobile Backhaul Service 041",
    serviceType: "Mobile backhaul",
    region: "India",
    product: "Lightbridge Pro",
    committedGbps: 10,
    deliveredGbps: 9.4,
    availability: 99.997,
    availabilityObjective: 99.999,
    latencyMs: 4.7,
    latencyObjectiveMs: 5,
    packetLossPct: 0.014,
    sloStatus: "At risk",
    errorBudgetPct: 34,
    primaryRoute: "Guindy Rooftop A → Perungudi Aggregation B",
    linkId: "lnk-chennai-041",
    fallbackState: "RF fallback validated — 6 Gbps reserved",
    risk: "High",
    situationId: "sit-chennai",
    agent: "Weather Risk Agent",
    lastUpdate: "11:04:18",
    usersAffected: "182,000 mobile subscribers",
    priority: "Platinum",
    creditExposure: "$41,200",
    revenueAtRisk: "$268,000 monthly recurring",
    matrix: { availability: 82, throughput: 61, latency: 58, packetLoss: 74, opticalHealth: 48, fallbackReadiness: 92, weatherExposure: 28, errorBudget: 34, changeRisk: 62, agentConfidence: 92 },
  },
  {
    id: "csvc-mumbai-018",
    customer: "Metro Fiber Alliance",
    name: "Mumbai Metro Interconnect Service 018",
    serviceType: "Metro building interconnect",
    region: "India",
    product: "Lightbridge Pro",
    committedGbps: 20,
    deliveredGbps: 17.8,
    availability: 99.991,
    availabilityObjective: 99.99,
    latencyMs: 3.1,
    latencyObjectiveMs: 4,
    packetLossPct: 0.008,
    sloStatus: "At risk",
    errorBudgetPct: 46,
    primaryRoute: "Lower Parel Tower → Bandra East Hub",
    linkId: "lnk-mumbai-018",
    fallbackState: "Fiber backup available — 10 Gbps",
    risk: "Elevated",
    situationId: "sit-mumbai",
    agent: "Beam Alignment Agent",
    lastUpdate: "11:03:52",
    usersAffected: "64 enterprise tenants",
    priority: "Gold",
    creditExposure: "$18,400",
    revenueAtRisk: "$121,000 monthly recurring",
    matrix: { availability: 88, throughput: 78, latency: 84, packetLoss: 86, opticalHealth: 66, fallbackReadiness: 88, weatherExposure: 62, errorBudget: 46, changeRisk: 44, agentConfidence: 87 },
  },
  {
    id: "csvc-nairobi-007",
    customer: "Rift Valley Telecom",
    name: "Nairobi Middle Mile Service 007",
    serviceType: "Rural middle mile",
    region: "East Africa",
    product: "Lightbridge",
    committedGbps: 5,
    deliveredGbps: 4.2,
    availability: 99.94,
    availabilityObjective: 99.95,
    latencyMs: 9.8,
    latencyObjectiveMs: 12,
    packetLossPct: 0.041,
    sloStatus: "Breaching",
    errorBudgetPct: 9,
    primaryRoute: "Nairobi Karen Relay → Ngong Aggregation",
    linkId: "lnk-nairobi-007",
    fallbackState: "On RF fallback — 4.2 Gbps delivered",
    risk: "Critical",
    situationId: "sit-nairobi",
    agent: "RF Fallback Guardian",
    lastUpdate: "11:04:02",
    usersAffected: "48,000 rural broadband users",
    priority: "Gold",
    creditExposure: "$26,900",
    revenueAtRisk: "$88,000 monthly recurring",
    matrix: { availability: 42, throughput: 56, latency: 71, packetLoss: 48, opticalHealth: 31, fallbackReadiness: 64, weatherExposure: 22, errorBudget: 9, changeRisk: 58, agentConfidence: 90 },
  },
  {
    id: "csvc-rio-023",
    customer: "Cidade Conectada",
    name: "Rio Smart City Service 023",
    serviceType: "Smart city connectivity",
    region: "Brazil",
    product: "Beam",
    committedGbps: 8,
    deliveredGbps: 7.6,
    availability: 99.972,
    availabilityObjective: 99.95,
    latencyMs: 6.2,
    latencyObjectiveMs: 8,
    packetLossPct: 0.012,
    sloStatus: "Within objective",
    errorBudgetPct: 58,
    primaryRoute: "Rio Centro Mesh Node → Barra Aggregation",
    linkId: "lnk-rio-023",
    fallbackState: "Alternate optical route available",
    risk: "Elevated",
    situationId: "sit-rio",
    agent: "Global Link Health Agent",
    lastUpdate: "11:02:41",
    usersAffected: "1,240 municipal endpoints",
    priority: "Silver",
    creditExposure: "$7,600",
    revenueAtRisk: "$52,000 monthly recurring",
    matrix: { availability: 91, throughput: 88, latency: 82, packetLoss: 89, opticalHealth: 78, fallbackReadiness: 81, weatherExposure: 54, errorBudget: 58, changeRisk: 36, agentConfidence: 84 },
  },
  {
    id: "csvc-california-012",
    customer: "Pacific Cloud Systems",
    name: "California Data Center Interconnect Service 012",
    serviceType: "Data center interconnect",
    region: "United States",
    product: "Lightbridge Pro",
    committedGbps: 40,
    deliveredGbps: 0,
    availability: 99.62,
    availabilityObjective: 99.99,
    latencyMs: 0,
    latencyObjectiveMs: 3,
    packetLossPct: 100,
    sloStatus: "Breaching",
    errorBudgetPct: 0,
    primaryRoute: "San Jose Campus A → Santa Clara Exchange B",
    linkId: "lnk-california-012",
    fallbackState: "Fiber backup engaged upstream of handoff",
    risk: "Critical",
    situationId: "sit-california",
    agent: "Optical Path Investigator",
    lastUpdate: "11:04:11",
    usersAffected: "3 hyperscale tenants",
    priority: "Platinum",
    creditExposure: "$96,500",
    revenueAtRisk: "$410,000 monthly recurring",
    matrix: { availability: 12, throughput: 0, latency: 0, packetLoss: 4, opticalHealth: 88, fallbackReadiness: 46, weatherExposure: 92, errorBudget: 0, changeRisk: 74, agentConfidence: 88 },
  },
  {
    id: "csvc-congo-004",
    customer: "Congo Basin Connect",
    name: "Central Africa River Crossing Service 004",
    serviceType: "Emergency connectivity",
    region: "Central Africa",
    product: "Lightbridge",
    committedGbps: 4,
    deliveredGbps: 3.7,
    availability: 99.921,
    availabilityObjective: 99.9,
    latencyMs: 11.4,
    latencyObjectiveMs: 15,
    packetLossPct: 0.026,
    sloStatus: "Within objective",
    errorBudgetPct: 41,
    primaryRoute: "Brazzaville North Mast → Kinshasa South Mast",
    linkId: "lnk-central-africa-004",
    fallbackState: "No fallback path — single trunk",
    risk: "High",
    situationId: null,
    agent: "Beam Alignment Agent",
    lastUpdate: "11:01:19",
    usersAffected: "Regional emergency services",
    priority: "Gold",
    creditExposure: "$12,300",
    revenueAtRisk: "$64,000 monthly recurring",
    matrix: { availability: 84, throughput: 82, latency: 76, packetLoss: 81, opticalHealth: 62, fallbackReadiness: 18, weatherExposure: 44, errorBudget: 41, changeRisk: 68, agentConfidence: 79 },
  },
  {
    id: "csvc-jakarta-031",
    customer: "Metro Fiber Alliance",
    name: "Jakarta Coastal Service 031",
    serviceType: "Metro building interconnect",
    region: "Southeast Asia",
    product: "Lightbridge",
    committedGbps: 10,
    deliveredGbps: 9.1,
    availability: 99.964,
    availabilityObjective: 99.95,
    latencyMs: 5.4,
    latencyObjectiveMs: 6,
    packetLossPct: 0.018,
    sloStatus: "Within objective",
    errorBudgetPct: 52,
    primaryRoute: "Jakarta Kota Tower → Tanjung Priok Hub",
    linkId: "lnk-jakarta-031",
    fallbackState: "RF fallback available — 5 Gbps",
    risk: "Elevated",
    situationId: null,
    agent: "Weather Risk Agent",
    lastUpdate: "11:00:57",
    usersAffected: "38 building tenants",
    priority: "Silver",
    creditExposure: "$9,100",
    revenueAtRisk: "$47,000 monthly recurring",
    matrix: { availability: 89, throughput: 84, latency: 80, packetLoss: 85, opticalHealth: 71, fallbackReadiness: 83, weatherExposure: 38, errorBudget: 52, changeRisk: 40, agentConfidence: 82 },
  },
  {
    id: "csvc-frankfurt-009",
    customer: "Rhine Urban Network Partner",
    name: "Frankfurt Enterprise Campus Service 009",
    serviceType: "Enterprise campus",
    region: "Europe",
    product: "Lightbridge Pro",
    committedGbps: 25,
    deliveredGbps: 24.6,
    availability: 99.994,
    availabilityObjective: 99.99,
    latencyMs: 2.4,
    latencyObjectiveMs: 4,
    packetLossPct: 0.004,
    sloStatus: "Within objective",
    errorBudgetPct: 78,
    primaryRoute: "Frankfurt Westend Roof → Ostend Campus Roof",
    linkId: "lnk-frankfurt-009",
    fallbackState: "Alternate optical route available",
    risk: "Low",
    situationId: null,
    agent: "Global Link Health Agent",
    lastUpdate: "11:03:08",
    usersAffected: "11,400 campus users",
    priority: "Gold",
    creditExposure: "$0",
    revenueAtRisk: "$0",
    matrix: { availability: 97, throughput: 96, latency: 94, packetLoss: 96, opticalHealth: 93, fallbackReadiness: 90, weatherExposure: 76, errorBudget: 78, changeRisk: 22, agentConfidence: 95 },
  },
  {
    id: "csvc-bengaluru-055",
    customer: "Bharat Mobility Networks",
    name: "Bengaluru Enterprise Ring Service 055",
    serviceType: "Enterprise campus",
    region: "India",
    product: "Lightbridge",
    committedGbps: 15,
    deliveredGbps: 14.2,
    availability: 99.968,
    availabilityObjective: 99.95,
    latencyMs: 4.1,
    latencyObjectiveMs: 5,
    packetLossPct: 0.011,
    sloStatus: "At risk",
    errorBudgetPct: 37,
    primaryRoute: "Bengaluru Whitefield Roof → Marathahalli Hub",
    linkId: "lnk-bangalore-055",
    fallbackState: "Telemetry stale — fallback readiness unverified",
    risk: "Elevated",
    situationId: "sit-bengaluru",
    agent: "Telemetry Quality Agent",
    lastUpdate: "10:41:36",
    usersAffected: "6,800 campus users",
    priority: "Gold",
    creditExposure: "$14,800",
    revenueAtRisk: "$96,000 monthly recurring",
    matrix: { availability: 90, throughput: 86, latency: 88, packetLoss: 87, opticalHealth: 74, fallbackReadiness: 44, weatherExposure: 68, errorBudget: 37, changeRisk: 52, agentConfidence: 68 },
  },
  {
    id: "csvc-singapore-026",
    customer: "Andaman Campus Networks",
    name: "Singapore Port Event Service 026",
    serviceType: "Event connectivity",
    region: "Southeast Asia",
    product: "Beam",
    committedGbps: 6,
    deliveredGbps: 5.8,
    availability: 99.981,
    availabilityObjective: 99.9,
    latencyMs: 5.9,
    latencyObjectiveMs: 8,
    packetLossPct: 0.009,
    sloStatus: "Within objective",
    errorBudgetPct: 71,
    primaryRoute: "Singapore Pasir Panjang → Jurong Aggregation",
    linkId: "lnk-singapore-026",
    fallbackState: "RF fallback available — 3 Gbps",
    risk: "Low",
    situationId: null,
    agent: "Global Link Health Agent",
    lastUpdate: "11:02:14",
    usersAffected: "Port logistics operations",
    priority: "Silver",
    creditExposure: "$0",
    revenueAtRisk: "$0",
    matrix: { availability: 95, throughput: 93, latency: 89, packetLoss: 93, opticalHealth: 88, fallbackReadiness: 79, weatherExposure: 58, errorBudget: 71, changeRisk: 30, agentConfidence: 91 },
  },
  {
    id: "csvc-kisumu-014",
    customer: "Rift Valley Telecom",
    name: "Kisumu Rural Middle Mile Service 014",
    serviceType: "Rural middle mile",
    region: "East Africa",
    product: "Lightbridge",
    committedGbps: 3,
    deliveredGbps: 2.9,
    availability: 99.958,
    availabilityObjective: 99.9,
    latencyMs: 10.2,
    latencyObjectiveMs: 14,
    packetLossPct: 0.017,
    sloStatus: "Within objective",
    errorBudgetPct: 64,
    primaryRoute: "Kisumu Lakeside Mast → Ahero Aggregation",
    linkId: "lnk-nairobi-007",
    fallbackState: "RF fallback available — 2 Gbps",
    risk: "Low",
    situationId: null,
    agent: "Weather Risk Agent",
    lastUpdate: "11:00:22",
    usersAffected: "19,500 rural broadband users",
    priority: "Silver",
    creditExposure: "$0",
    revenueAtRisk: "$0",
    matrix: { availability: 93, throughput: 91, latency: 83, packetLoss: 90, opticalHealth: 82, fallbackReadiness: 76, weatherExposure: 49, errorBudget: 64, changeRisk: 34, agentConfidence: 86 },
  },
  {
    id: "csvc-saopaulo-033",
    customer: "Cidade Conectada",
    name: "Sao Paulo Emergency Response Service 033",
    serviceType: "Emergency connectivity",
    region: "Brazil",
    product: "Beam",
    committedGbps: 5,
    deliveredGbps: 4.9,
    availability: 99.988,
    availabilityObjective: 99.95,
    latencyMs: 6.8,
    latencyObjectiveMs: 10,
    packetLossPct: 0.006,
    sloStatus: "Within objective",
    errorBudgetPct: 82,
    primaryRoute: "Sao Paulo Se Mast → Osasco Aggregation",
    linkId: "lnk-rio-023",
    fallbackState: "Fiber backup available — 5 Gbps",
    risk: "Low",
    situationId: null,
    agent: "SLO Guardian",
    lastUpdate: "11:03:44",
    usersAffected: "Municipal emergency network",
    priority: "Gold",
    creditExposure: "$0",
    revenueAtRisk: "$0",
    matrix: { availability: 98, throughput: 97, latency: 92, packetLoss: 97, opticalHealth: 91, fallbackReadiness: 94, weatherExposure: 81, errorBudget: 82, changeRisk: 18, agentConfidence: 93 },
  },
];

export const DEFAULT_SERVICE_ID = "csvc-chennai-041";

export const matrixColumns: { key: keyof MatrixScores; label: string; short: string }[] = [
  { key: "availability", label: "Availability", short: "Avail" },
  { key: "throughput", label: "Throughput attainment", short: "Thrpt" },
  { key: "latency", label: "Latency", short: "Lat" },
  { key: "packetLoss", label: "Packet loss", short: "Loss" },
  { key: "opticalHealth", label: "Optical link health", short: "Optic" },
  { key: "fallbackReadiness", label: "Fallback readiness", short: "Fallbk" },
  { key: "weatherExposure", label: "Weather exposure", short: "Wx" },
  { key: "errorBudget", label: "Error budget", short: "Budget" },
  { key: "changeRisk", label: "Change risk", short: "Chg" },
  { key: "agentConfidence", label: "Agent confidence", short: "Conf" },
];

export type MatrixBand = "good" | "watch" | "risk";

export const matrixBand = (score: number): MatrixBand =>
  score >= 80 ? "good" : score >= 50 ? "watch" : "risk";

export const matrixBandLabel: Record<MatrixBand, string> = {
  good: "Meeting objective",
  watch: "Watch",
  risk: "Objective at risk",
};

export const matrixBandGlyph: Record<MatrixBand, string> = { good: "✓", watch: "!", risk: "×" };

export const matrixBandClass: Record<MatrixBand, string> = {
  good: "border-emerald-200 bg-emerald-100 text-emerald-800",
  watch: "border-amber-200 bg-amber-100 text-amber-800",
  risk: "border-rose-200 bg-rose-100 text-rose-800",
};

/* -------------------------------- KPIs ---------------------------------- */

export interface CshKpi {
  id: string;
  title: string;
  value: string;
  sub: string;
  status: "good" | "watch" | "risk";
  trend: "up" | "down" | "flat";
  delta: string;
  target: string;
  explain: string;
  filter: { kind: "none" | "slo" | "risk" | "fallback" | "budget"; value?: string };
  spark: number[];
}

export const cshKpis: CshKpi[] = [
  {
    id: "within-slo", title: "Services Within SLO", value: "94.6%", sub: "303 of 320 customer services",
    status: "good", trend: "up", delta: "+0.7 pts vs previous period", target: "Target 95.0%",
    explain: "Share of customer services currently meeting every contracted objective.",
    filter: { kind: "slo", value: "Within objective" },
    spark: [93.4, 93.6, 93.5, 93.9, 94.0, 93.8, 94.1, 94.2, 94.4, 94.3, 94.5, 94.6],
  },
  {
    id: "committed", title: "Committed Capacity", value: "43.8 Tbps", sub: "Across all active customer services",
    status: "good", trend: "up", delta: "+1.2 Tbps vs previous period", target: "Contracted 43.8 Tbps",
    explain: "Total contracted capacity across the active customer service portfolio.",
    filter: { kind: "none" },
    spark: [41.9, 42.1, 42.4, 42.6, 42.8, 43.0, 43.1, 43.3, 43.4, 43.6, 43.7, 43.8],
  },
  {
    id: "delivered", title: "Delivered Throughput", value: "41.2 Tbps", sub: "94.1% of committed capacity delivered",
    status: "watch", trend: "down", delta: "-0.4 Tbps vs previous period", target: "Target 98% attainment",
    explain: "Throughput actually delivered to customers against contracted capacity.",
    filter: { kind: "none" },
    spark: [41.6, 41.7, 41.5, 41.6, 41.4, 41.5, 41.3, 41.4, 41.2, 41.3, 41.2, 41.2],
  },
  {
    id: "at-risk", title: "Customers at Risk", value: "6", sub: "2 impacted, 4 approaching threshold",
    status: "risk", trend: "up", delta: "+2 vs previous period", target: "Target ≤ 3",
    explain: "Customers with at least one service impacted or forecast to breach an objective.",
    filter: { kind: "risk", value: "High" },
    spark: [3, 3, 4, 4, 5, 5, 4, 5, 5, 6, 6, 6],
  },
  {
    id: "availability", title: "Availability", value: "99.97%", sub: "Global customer service availability",
    status: "good", trend: "flat", delta: "-0.01 pts vs previous period", target: "Objective 99.95%",
    explain: "Weighted availability across all customer services in the selected period.",
    filter: { kind: "none" },
    spark: [99.98, 99.98, 99.97, 99.98, 99.97, 99.97, 99.96, 99.97, 99.97, 99.98, 99.97, 99.97],
  },
  {
    id: "latency", title: "Latency Within Objective", value: "97.8%", sub: "Services meeting contracted latency",
    status: "good", trend: "down", delta: "-0.3 pts vs previous period", target: "Target 98.5%",
    explain: "Share of customer services delivering latency inside their contracted objective.",
    filter: { kind: "none" },
    spark: [98.3, 98.2, 98.2, 98.1, 98.0, 98.1, 97.9, 98.0, 97.9, 97.8, 97.9, 97.8],
  },
  {
    id: "fallback", title: "Services Using Fallback", value: "14", sub: "9 planned, 5 protective transitions",
    status: "watch", trend: "up", delta: "+3 vs previous period", target: "Target ≤ 10",
    explain: "Customer services currently delivered over fallback transport instead of the primary optical path.",
    filter: { kind: "fallback" },
    spark: [9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 14],
  },
  {
    id: "budget", title: "Error Budget at Risk", value: "11 services", sub: "Projected to breach within seven days",
    status: "risk", trend: "up", delta: "+4 vs previous period", target: "Target ≤ 5",
    explain: "Services whose current burn rate projects an error budget breach inside seven days.",
    filter: { kind: "budget" },
    spark: [6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
  },
];

/* --------------------------- performance series -------------------------- */

export interface PerfPoint {
  t: string;
  committed: number;
  delivered: number;
  available: number;
  threshold: number;
  predicted: number | null;
  availability: number;
  latency: number;
  packetLoss: number;
  optical: number;
  rf: number;
  altOptical: number;
  fiber: number;
  annotation?: string;
}

/** Deterministic per-service performance series (24 hourly points + forecast). */
export function performanceSeries(service: CustomerService): PerfPoint[] {
  const seed = service.id.length + service.committedGbps;
  const cap = service.committedGbps;
  const target = service.deliveredGbps;
  return Array.from({ length: 24 }, (_, i) => {
    const wave = Math.sin((i + seed) / 3.4) * cap * 0.03;
    const decline = i > 14 ? ((i - 14) / 9) * (cap - target) : 0;
    const delivered = Math.max(0, Number((cap * 0.985 - decline + wave).toFixed(2)));
    const onFallback = service.fallbackState.startsWith("On RF fallback");
    const rf = onFallback ? Number((delivered * 0.82).toFixed(2)) : Number((delivered * 0.03).toFixed(2));
    const optical = Number(Math.max(0, delivered - rf).toFixed(2));
    return {
      t: `${String(i).padStart(2, "0")}:00`,
      committed: cap,
      delivered,
      available: Number((cap - delivered).toFixed(2)),
      threshold: Number((cap * 0.95).toFixed(2)),
      predicted: i >= 20 ? Number((delivered - (i - 19) * cap * 0.02).toFixed(2)) : null,
      availability: Number((service.availability - (i > 16 ? (i - 16) * 0.002 : 0)).toFixed(4)),
      latency: Number((service.latencyMs - 0.4 + Math.abs(wave) * 0.4 + (i > 16 ? (i - 16) * 0.06 : 0)).toFixed(2)),
      packetLoss: Number((service.packetLossPct * (1 + (i > 18 ? (i - 18) * 0.2 : 0))).toFixed(4)),
      optical,
      rf,
      altOptical: Number((delivered * 0.04).toFixed(2)),
      fiber: Number((delivered * 0.02).toFixed(2)),
      annotation:
        i === 10 ? "Weather risk detected" :
        i === 16 ? "Optical attenuation increase" :
        i === 20 ? "Agent recommendation issued" : undefined,
    };
  });
}

/* ------------------------------ SLO analysis ----------------------------- */

export interface SloObjective {
  label: string;
  objective: string;
  current: string;
  attainment: number;
  status: SloStatus;
}

export function sloObjectives(service: CustomerService): SloObjective[] {
  const att = attainment(service);
  return [
    { label: "Availability", objective: `${service.availabilityObjective}%`, current: `${service.availability}%`, attainment: Math.min(100, Math.round((service.availability / service.availabilityObjective) * 100)), status: service.availability >= service.availabilityObjective ? "Within objective" : "At risk" },
    { label: "Throughput attainment", objective: "98%", current: `${att}%`, attainment: Math.round(att), status: att >= 98 ? "Within objective" : att >= 90 ? "At risk" : "Breaching" },
    { label: "Latency", objective: `< ${service.latencyObjectiveMs} ms`, current: `${service.latencyMs} ms`, attainment: Math.max(0, Math.round(100 - (service.latencyMs / service.latencyObjectiveMs) * 100 + 60)), status: service.latencyMs < service.latencyObjectiveMs ? "Within objective" : "Breaching" },
    { label: "Packet loss", objective: "< 0.05%", current: `${service.packetLossPct}%`, attainment: service.packetLossPct < 0.05 ? 96 : 30, status: service.packetLossPct < 0.05 ? "Within objective" : "Breaching" },
    { label: "Beam recovery time", objective: "≤ 900 ms", current: "740 ms", attainment: 88, status: "Within objective" },
    { label: "Restoration time", objective: "≤ 30 m", current: "11 m 40 s", attainment: 87, status: "Within objective" },
    { label: "Maximum RF fallback duration", objective: "≤ 2 h", current: "1 h 26 m", attainment: 72, status: "At risk" },
  ];
}

export function errorBudgetBurn(service: CustomerService) {
  const start = 100;
  return Array.from({ length: 14 }, (_, i) => {
    const burn = ((start - service.errorBudgetPct) / 12) * i;
    return {
      day: `D${i - 9 > 0 ? `+${i - 9}` : i - 9}`,
      remaining: Number(Math.max(0, start - burn).toFixed(1)),
      projected: i >= 9 ? Number(Math.max(0, start - burn * 1.35).toFixed(1)) : null,
    };
  });
}

export const chennaiSloInsight =
  "Without preventive action, this service is projected to consume 68% of its remaining error budget within the next six hours.";

/* --------------------------- service route graph -------------------------- */

export interface RouteNode {
  id: string;
  name: string;
  type: string;
  owner: string;
  health: "Healthy" | "At risk" | "Degraded" | "Unavailable";
  capacity: string;
  latency: string;
  issue: string;
  agentActivity: string;
  x: number;
  y: number;
}

export interface RouteEdge {
  id: string;
  from: string;
  to: string;
  transport: "Primary optical" | "Alternate optical" | "RF fallback" | "Fiber backup" | "Ethernet handoff";
  throughput: string;
  maxCapacity: string;
  availability: string;
  latency: string;
  state: "Active" | "Standby" | "Validated standby" | "Degraded";
  fallbackEligible: string;
}

export interface ServiceRoute {
  nodes: RouteNode[];
  edges: RouteEdge[];
  activeEdgeId: string;
  incidents: string[];
  predictedRisks: string[];
  recentChanges: string[];
  customerImpact: string;
}

export function serviceRoute(service: CustomerService): ServiceRoute {
  const link = links.find((l) => l.id === service.linkId);
  const terminalA = link?.terminalA ?? "Terminal A";
  const terminalB = link?.terminalB ?? "Terminal B";
  const degraded = service.sloStatus !== "Within objective";
  const nodes: RouteNode[] = [
    { id: "n-customer", name: `${service.customer} network`, type: "Customer network", owner: "Customer", health: "Healthy", capacity: `${service.committedGbps} Gbps`, latency: "0.2 ms", issue: "None", agentActivity: "Customer Impact Agent monitoring", x: 6, y: 50 },
    { id: "n-edge", name: "Customer edge router", type: "Customer edge", owner: "Customer", health: "Healthy", capacity: `${service.committedGbps} Gbps`, latency: "0.3 ms", issue: "None", agentActivity: "None", x: 19, y: 50 },
    { id: "n-handoff", name: "Network handoff", type: "Handoff port", owner: "Shared", health: service.id === "csvc-california-012" ? "Unavailable" : "Healthy", capacity: `${service.committedGbps} Gbps`, latency: "0.4 ms", issue: service.id === "csvc-california-012" ? "Handoff port down since 02:21 local" : "None", agentActivity: "Optical Path Investigator watching", x: 32, y: 50 },
    { id: "n-terminal-a", name: terminalA, type: "Optical terminal", owner: "Taara operations", health: degraded ? "At risk" : "Healthy", capacity: `${service.committedGbps} Gbps`, latency: "0.6 ms", issue: degraded ? "Optical margin declining" : "None", agentActivity: "Beam Alignment Agent active", x: 45, y: 50 },
    { id: "n-terminal-b", name: terminalB, type: "Optical terminal", owner: "Taara operations", health: degraded ? "At risk" : "Healthy", capacity: `${service.committedGbps} Gbps`, latency: "0.6 ms", issue: degraded ? "Increased attenuation observed" : "None", agentActivity: "Weather Risk Agent correlating", x: 66, y: 50 },
    { id: "n-aggregation", name: "Aggregation network", type: "Aggregation", owner: "Taara operations", health: "Healthy", capacity: `${service.committedGbps * 4} Gbps`, latency: "1.1 ms", issue: "None", agentActivity: "Global Link Health Agent monitoring", x: 80, y: 50 },
    { id: "n-destination", name: "Destination service", type: "Service endpoint", owner: "Customer", health: degraded ? "At risk" : "Healthy", capacity: `${service.committedGbps} Gbps`, latency: `${service.latencyMs} ms`, issue: degraded ? "Approaching latency objective" : "None", agentActivity: "SLO Guardian tracking", x: 93, y: 50 },
  ];
  const onFallback = service.fallbackState.startsWith("On RF fallback");
  const edges: RouteEdge[] = [
    { id: "e-access", from: "n-customer", to: "n-edge", transport: "Ethernet handoff", throughput: `${service.deliveredGbps} Gbps`, maxCapacity: `${service.committedGbps} Gbps`, availability: "99.999%", latency: "0.2 ms", state: "Active", fallbackEligible: "Not applicable" },
    { id: "e-handoff", from: "n-edge", to: "n-handoff", transport: "Ethernet handoff", throughput: `${service.deliveredGbps} Gbps`, maxCapacity: `${service.committedGbps} Gbps`, availability: "99.997%", latency: "0.3 ms", state: service.id === "csvc-california-012" ? "Degraded" : "Active", fallbackEligible: "Not applicable" },
    { id: "e-uplink", from: "n-handoff", to: "n-terminal-a", transport: "Ethernet handoff", throughput: `${service.deliveredGbps} Gbps`, maxCapacity: `${service.committedGbps} Gbps`, availability: "99.998%", latency: "0.2 ms", state: "Active", fallbackEligible: "Not applicable" },
    { id: "e-primary", from: "n-terminal-a", to: "n-terminal-b", transport: "Primary optical", throughput: `${onFallback ? 0 : service.deliveredGbps} Gbps`, maxCapacity: `${service.committedGbps} Gbps`, availability: `${service.availability}%`, latency: "1.4 ms", state: onFallback ? "Degraded" : "Active", fallbackEligible: "Yes" },
    { id: "e-alt", from: "n-terminal-a", to: "n-terminal-b", transport: "Alternate optical", throughput: "0 Gbps", maxCapacity: `${Math.round(service.committedGbps * 0.7)} Gbps`, availability: "99.94%", latency: "2.1 ms", state: "Standby", fallbackEligible: "Yes" },
    { id: "e-rf", from: "n-terminal-a", to: "n-terminal-b", transport: "RF fallback", throughput: `${onFallback ? service.deliveredGbps : 0} Gbps`, maxCapacity: `${Math.round(service.committedGbps * 0.6)} Gbps`, availability: "99.90%", latency: "7.8 ms", state: onFallback ? "Active" : "Validated standby", fallbackEligible: "Yes" },
    { id: "e-fiber", from: "n-terminal-a", to: "n-terminal-b", transport: "Fiber backup", throughput: "0 Gbps", maxCapacity: `${Math.round(service.committedGbps * 0.5)} Gbps`, availability: "99.99%", latency: "3.4 ms", state: "Standby", fallbackEligible: "Yes" },
    { id: "e-agg", from: "n-terminal-b", to: "n-aggregation", transport: "Ethernet handoff", throughput: `${service.deliveredGbps} Gbps`, maxCapacity: `${service.committedGbps * 4} Gbps`, availability: "99.999%", latency: "1.1 ms", state: "Active", fallbackEligible: "Not applicable" },
    { id: "e-dest", from: "n-aggregation", to: "n-destination", transport: "Ethernet handoff", throughput: `${service.deliveredGbps} Gbps`, maxCapacity: `${service.committedGbps} Gbps`, availability: "99.998%", latency: "0.4 ms", state: "Active", fallbackEligible: "Not applicable" },
  ];
  return {
    nodes,
    edges,
    activeEdgeId: onFallback ? "e-rf" : "e-primary",
    incidents: service.situationId ? [situations.find((s) => s.id === service.situationId)?.title ?? "Active situation"] : ["No active incidents on this route"],
    predictedRisks: degraded
      ? ["Visibility decline forecast within 6 hours", "Optical attenuation trending toward fallback threshold"]
      : ["No material predicted risk in the next 24 hours"],
    recentChanges: ["Adaptive pointing profile applied 3 days ago", "Fallback capacity reservation refreshed 2 hours ago"],
    customerImpact: degraded
      ? `${service.usersAffected} exposed if the primary optical path degrades further`
      : `No customer impact currently attributed to this route`,
  };
}

/* ------------------------- customer impact and risk ----------------------- */

export interface RiskBreakdownRow {
  label: string;
  level: RiskLevel;
  detail: string;
}

export function riskBreakdown(service: CustomerService): RiskBreakdownRow[] {
  const high = service.sloStatus !== "Within objective";
  return [
    { label: "Immediate impact", level: high ? "High" : "Low", detail: high ? `${service.usersAffected} experiencing reduced delivered capacity` : "No measurable customer impact" },
    { label: "Predicted impact", level: high ? "Critical" : "Elevated", detail: high ? "Service interruption projected within 6 hours without intervention" : "Stable across the forecast window" },
    { label: "SLO impact", level: service.errorBudgetPct < 40 ? "High" : "Low", detail: `${service.errorBudgetPct}% error budget remaining` },
    { label: "Commercial impact", level: high ? "High" : "Low", detail: `Estimated service credit exposure ${service.creditExposure}` },
    { label: "Reputation impact", level: service.priority === "Platinum" && high ? "High" : "Elevated", detail: `${service.priority} customer with executive visibility` },
    { label: "Operational impact", level: high ? "Elevated" : "Low", detail: high ? "Requires coordinated preventive transition window" : "Routine monitoring only" },
  ];
}

/* --------------------------- agentic recommendation ----------------------- */

export interface ServiceRecommendation {
  recommendation: string;
  reason: string;
  confidence: number;
  outcomeProtected: string;
  sloImpactAvoided: string;
  expectedDuration: string;
  fallbackCapacity: string;
  policyStatus: string;
  approvalRequirement: string;
  rollbackCondition: string;
  validationCriteria: string[];
  evidence: string[];
  alternatives: { action: string; outcome: string; risk: string }[];
  agents: string[];
}

export function serviceRecommendation(service: CustomerService): ServiceRecommendation {
  return {
    recommendation:
      "Transition priority traffic to the validated RF fallback path before the forecast visibility decline reaches the optical service threshold.",
    reason: `Delivered throughput on ${service.name} has fallen to ${attainment(service)}% of committed capacity while optical attenuation continues to rise. Forecast visibility crosses the service threshold within six hours.`,
    confidence: service.matrix.agentConfidence,
    outcomeProtected: `${service.usersAffected} retain service continuity`,
    sloImpactAvoided: "42 minutes of avoidable outage and 23 points of error budget burn",
    expectedDuration: "1 h 45 m on fallback transport",
    fallbackCapacity: service.fallbackState,
    policyStatus: "Within transport change policy for customer-impacting preventive actions",
    approvalRequirement: "Human approval required — customer-impacting transport change",
    rollbackCondition: "Automatic revert to optical when visibility recovers above 3 km for 15 minutes",
    validationCriteria: [
      "Synthetic transactions succeed end to end after transition",
      "Delivered throughput remains above 5.5 Gbps",
      "Added latency remains under 3.0 ms",
      "No packet loss observed during the switch window",
    ],
    evidence: [
      "Six-hour visibility forecast for the Chennai corridor",
      "Four-hour optical margin decline series",
      "RF fallback live capacity check and reservation",
      "Customer contract objectives and error budget ledger",
      "Comparable historical fog transitions on this corridor",
    ],
    alternatives: [
      { action: "Take no action and monitor", outcome: "Probable 42 minute customer outage", risk: "High" },
      { action: "Transition after degradation begins", outcome: "Reactive switch with 9 minutes of packet loss", risk: "Elevated" },
      { action: "Preventive transition now", outcome: "Customer impact avoided, 23 points of budget preserved", risk: "Low" },
    ],
    agents: [
      "Customer Impact Agent",
      "Weather Risk Agent",
      "Optical Path Investigator",
      "RF Fallback Guardian",
      "SLO Guardian",
      "Incident Commander Agent",
    ],
  };
}

/** Digital coworkers supporting customer service assurance on this page. */
export const assuranceAgents = [
  ...agents.filter((a) =>
    ["Customer Impact Agent", "Weather Risk Agent", "Optical Path Investigator", "RF Fallback Guardian", "SLO Guardian"].includes(a.name)),
];

export const incidentCommander = {
  name: "Incident Commander Agent",
  task: "Coordinating the preventive service protection sequence",
  status: "Awaiting approval",
  confidence: 90,
  objective: "Sequence agent recommendations into a single customer-safe action plan.",
};

/* ------------------------- portfolio comparisons -------------------------- */

export interface RegionComparison {
  region: Region;
  services: number;
  availability: number;
  attainment: number;
  customersAtRisk: number;
  errorBudgetExposure: number;
  fallbackUsage: number;
}

export const regionComparison: RegionComparison[] = [
  { region: "India", services: 86, availability: 99.968, attainment: 94.2, customersAtRisk: 2, errorBudgetExposure: 38, fallbackUsage: 6 },
  { region: "Southeast Asia", services: 54, availability: 99.974, attainment: 96.1, customersAtRisk: 1, errorBudgetExposure: 24, fallbackUsage: 3 },
  { region: "East Africa", services: 48, availability: 99.941, attainment: 91.4, customersAtRisk: 2, errorBudgetExposure: 52, fallbackUsage: 4 },
  { region: "Central Africa", services: 31, availability: 99.928, attainment: 90.8, customersAtRisk: 1, errorBudgetExposure: 46, fallbackUsage: 2 },
  { region: "Brazil", services: 37, availability: 99.981, attainment: 97.2, customersAtRisk: 0, errorBudgetExposure: 18, fallbackUsage: 1 },
  { region: "United States", services: 40, availability: 99.912, attainment: 88.6, customersAtRisk: 1, errorBudgetExposure: 61, fallbackUsage: 2 },
  { region: "Europe", services: 24, availability: 99.993, attainment: 98.4, customersAtRisk: 0, errorBudgetExposure: 11, fallbackUsage: 0 },
];

export interface ProductComparison {
  product: Product;
  services: number;
  availability: number;
  attainment: number;
  latencyMs: number;
  weatherExposure: number;
  agentInterventions: number;
  errorBudget: number;
}

export const productComparison: ProductComparison[] = [
  { product: "Lightbridge", services: 148, availability: 99.958, attainment: 93.1, latencyMs: 6.4, weatherExposure: 42, agentInterventions: 68, errorBudget: 44 },
  { product: "Lightbridge Pro", services: 118, availability: 99.974, attainment: 95.8, latencyMs: 4.2, weatherExposure: 27, agentInterventions: 51, errorBudget: 58 },
  { product: "Beam", services: 54, availability: 99.966, attainment: 94.6, latencyMs: 5.9, weatherExposure: 33, agentInterventions: 24, errorBudget: 62 },
];

/* ------------------------- customer service events ------------------------ */

export interface ServiceEvent {
  id: string;
  at: string;
  type: string;
  actor: string;
  service: string;
  outcome: string;
  status: "Complete" | "In progress" | "Awaiting approval" | "Recorded";
  detail: string;
}

export const serviceEvents: ServiceEvent[] = [
  { id: "cse-1", at: "10:38:04", type: "Service health changed", actor: "Global Link Health Agent", service: "Chennai Mobile Backhaul Service 041", outcome: "Health moved from healthy to at risk", status: "Complete", detail: "Delivered throughput fell below 95% of committed capacity for three consecutive intervals." },
  { id: "cse-2", at: "10:42:18", type: "Weather risk detected", actor: "Weather Risk Agent", service: "Chennai Mobile Backhaul Service 041", outcome: "Risk raised to high, 92% probability", status: "Complete", detail: "Visibility forecast crosses the optical service threshold within six hours." },
  { id: "cse-3", at: "10:43:02", type: "Throughput threshold approached", actor: "SLO Guardian", service: "Chennai Mobile Backhaul Service 041", outcome: "Attainment 94% against a 98% objective", status: "Complete", detail: "Throughput attainment breached the warning band while latency reached 4.7 ms of a 5 ms objective." },
  { id: "cse-4", at: "10:43:51", type: "Customer impact calculated", actor: "Customer Impact Agent", service: "Bharat Mobility Networks", outcome: "182,000 subscribers exposed", status: "Complete", detail: "Contract objective, affected users and remaining error budget were resolved from the service dependency map." },
  { id: "cse-5", at: "10:45:12", type: "Agent investigation started", actor: "Optical Path Investigator", service: "Chennai Mobile Backhaul Service 041", outcome: "Fault domain isolated to atmospheric attenuation", status: "Complete", detail: "Terminal diagnostics nominal; attenuation rise correlates with the incoming fog front." },
  { id: "cse-6", at: "10:46:07", type: "Fallback path validated", actor: "RF Fallback Guardian", service: "Chennai Mobile Backhaul Service 041", outcome: "6 Gbps usable, reservation held", status: "Complete", detail: "Live capacity check confirmed fallback headroom with no competing customer services." },
  { id: "cse-7", at: "10:47:55", type: "Approval requested", actor: "Incident Commander Agent", service: "Chennai Mobile Backhaul Service 041", outcome: "Preventive transition pending approval", status: "Awaiting approval", detail: "Customer-impacting transport change requires human approval under current guardrails." },
  { id: "cse-8", at: "10:52:12", type: "Traffic transitioned", actor: "RF Fallback Guardian", service: "Nairobi Middle Mile Service 007", outcome: "Fallback engaged in 900 ms", status: "Complete", detail: "Automatic fallback engaged at fade onset with 4.2 Gbps delivered." },
  { id: "cse-9", at: "10:55:40", type: "Service performance validated", actor: "Global Link Health Agent", service: "Nairobi Middle Mile Service 007", outcome: "Service reachable at reduced capacity", status: "Complete", detail: "Synthetic transactions confirmed continuity during the fallback window." },
  { id: "cse-10", at: "10:58:03", type: "Customer communication created", actor: "Customer Impact Agent", service: "Rift Valley Telecom", outcome: "Draft notification ready for review", status: "Awaiting approval", detail: "Notification drafted with impact window, delivered capacity and expected restoration." },
  { id: "cse-11", at: "11:00:44", type: "SLO recalculated", actor: "SLO Guardian", service: "Portfolio", outcome: "11 services projected to breach in seven days", status: "Complete", detail: "Burn rates recalculated after attributing the California handoff outage." },
  { id: "cse-12", at: "11:03:26", type: "Evidence stored", actor: "Optical Path Investigator", service: "California Data Center Interconnect Service 012", outcome: "Carrier escalation pack ready", status: "Recorded", detail: "Diagnostics, port state history and reachability checks bundled for escalation." },
];

/* --------------------------- protection scenario -------------------------- */

export interface ProtectionStep {
  id: string;
  label: string;
  detail: string;
  actor: string;
  requiresApproval?: boolean;
  outcome: string;
}

export const protectionScenario: ProtectionStep[] = [
  { id: "p1", label: "Throughput degradation detected", detail: "Delivered throughput fell to 94% of committed capacity across three intervals.", actor: "Global Link Health Agent", outcome: "Degradation confirmed" },
  { id: "p2", label: "Customer service identified", detail: "Chennai Mobile Backhaul Service 041 for Bharat Mobility Networks.", actor: "Customer Impact Agent", outcome: "Service and contract resolved" },
  { id: "p3", label: "SLO exposure calculated", detail: "34% error budget remaining, forecast breach within five days.", actor: "SLO Guardian", outcome: "Exposure quantified" },
  { id: "p4", label: "Weather risk correlated", detail: "Dense fog forecast on the Guindy–Perungudi corridor within six hours.", actor: "Weather Risk Agent", outcome: "92% probability, high confidence" },
  { id: "p5", label: "Primary route assessed", detail: "Optical margin has declined 3.1 dB over four hours to 7.4 dB.", actor: "Optical Path Investigator", outcome: "Primary path trending to threshold" },
  { id: "p6", label: "Fallback capacity validated", detail: "6 Gbps usable RF fallback confirmed and reserved.", actor: "RF Fallback Guardian", outcome: "Fallback ready" },
  { id: "p7", label: "Preventive action recommended", detail: "Transition priority traffic to RF fallback before the visibility threshold is reached.", actor: "Incident Commander Agent", outcome: "Recommendation issued" },
  { id: "p8", label: "Human approval requested", detail: "Customer-impacting transport change requires operator approval.", actor: "Incident Commander Agent", requiresApproval: true, outcome: "Awaiting operator decision" },
  { id: "p9", label: "Traffic transition simulated", detail: "Priority traffic moved to RF fallback with no packet loss observed.", actor: "RF Fallback Guardian", outcome: "Transition completed" },
  { id: "p10", label: "Service performance validated", detail: "Synthetic transactions confirm customer service continuity on fallback.", actor: "Global Link Health Agent", outcome: "Service healthy on fallback" },
  { id: "p11", label: "Customer impact avoided", detail: "42 minutes of avoidable customer outage prevented.", actor: "Customer Impact Agent", outcome: "Impact avoided" },
  { id: "p12", label: "Error budget recalculated", detail: "Error budget preserved at 57% with the breach forecast cleared.", actor: "SLO Guardian", outcome: "Budget protected" },
];

export const preventiveVsReactive = [
  { measure: "Customer outage minutes", preventive: "0", reactive: "42" },
  { measure: "Packet loss during change", preventive: "None observed", reactive: "9 minutes" },
  { measure: "Error budget consumed", preventive: "0 points", reactive: "23 points" },
  { measure: "Service credit exposure", preventive: "$0", reactive: "$41,200" },
  { measure: "Customer notifications", preventive: "1 planned advisory", reactive: "3 incident updates" },
];

export const SAVED_VIEWS = [
  "Default portfolio view",
  "Customers at risk",
  "Error budget watchlist",
  "Fallback services",
] as const;

export const DATA_CONFIDENCE = "94%";
export const LAST_TELEMETRY = "11:04:22 UTC";

export { REGIONS, PRODUCTS };
