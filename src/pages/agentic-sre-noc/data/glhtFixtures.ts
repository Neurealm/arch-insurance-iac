/**
 * Global Link Health Twin — synthetic Terra Communications demonstration data.
 *
 * Every value in this file is fabricated for demonstration only. No real
 * customer, terminal, incident or financial data is represented. Keep this
 * module free of React so it can be swapped for live telemetry later.
 */

export const GLHT_REGIONS = [
  "All regions", "California", "London", "Rio de Janeiro", "Nairobi",
  "Chennai", "Mumbai", "Johannesburg", "Dubai", "Southeast Asia",
  "Central Africa", "Europe",
] as const;

export const GLHT_PRODUCTS = ["All products", "Lightbridge", "Lightbridge Pro", "Beam"] as const;

export const GLHT_LINK_TYPES = [
  "All link types", "Optical point-to-point", "Resilient optical", "Beam mesh",
  "RF fallback", "Fiber backup", "Customer handoff",
] as const;

export const GLHT_TIME_RANGES = ["1h", "6h", "12h", "24h", "7d", "30d"] as const;

export const GLHT_SAVED_VIEWS = [
  "Default operations view", "Executive briefing", "Chennai watch", "Fallback exposure",
] as const;

/* ------------------------------- KPIs -------------------------------- */

export interface GlhtKpi {
  id: string;
  title: string;
  value: string;
  sub: string;
  status: "good" | "watch" | "risk";
  trend: "up" | "down" | "flat";
  prior: string;
  target: string;
  timestamp: string;
  explain: string;
  spark: number[];
  filter: { kind: "none" | "region" | "state"; value?: string };
}

export const glhtKpis: GlhtKpi[] = [
  {
    id: "links", title: "Optical Links", value: "1,248", sub: "1,216 online, 97.4%",
    status: "good", trend: "up", prior: "1,236 last week", target: "≥ 97% online",
    timestamp: "09:42 UTC", spark: [1210, 1216, 1219, 1224, 1228, 1233, 1238, 1242, 1244, 1246, 1247, 1248],
    explain: "Optical links deployed across the Terra Communications synthetic estate and currently carrying traffic.",
    filter: { kind: "none" },
  },
  {
    id: "services", title: "Customer Services", value: "320", sub: "309 healthy, 96.6%",
    status: "good", trend: "flat", prior: "318 last week", target: "≥ 96% healthy",
    timestamp: "09:42 UTC", spark: [312, 313, 315, 316, 316, 317, 318, 318, 319, 320, 320, 320],
    explain: "Customer services delivered over the optical estate and meeting their availability objective.",
    filter: { kind: "none" },
  },
  {
    id: "capacity", title: "Total Capacity", value: "18.6 Tbps", sub: "12.4 Tbps utilized, 66%",
    status: "good", trend: "up", prior: "18.1 Tbps last week", target: "< 75% utilized",
    timestamp: "09:41 UTC", spark: [17.4, 17.6, 17.8, 17.9, 18.0, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.6],
    explain: "Committed optical capacity across all regions with current aggregate utilization.",
    filter: { kind: "none" },
  },
  {
    id: "availability", title: "Availability, Month to Date", value: "99.999%", sub: "Target 99.999%",
    status: "good", trend: "flat", prior: "99.998% last month", target: "99.999%",
    timestamp: "09:40 UTC", spark: [99.996, 99.997, 99.998, 99.999, 99.999, 99.998, 99.999, 99.999, 99.999, 99.999, 99.999, 99.999],
    explain: "Weighted service availability across the global optical estate for the month to date.",
    filter: { kind: "none" },
  },
  {
    id: "atrisk", title: "Predicted at Risk", value: "23", sub: "Within the next six hours",
    status: "watch", trend: "up", prior: "14 yesterday", target: "< 15 links",
    timestamp: "09:42 UTC", spark: [9, 11, 10, 12, 13, 15, 16, 18, 19, 21, 22, 23],
    explain: "Links forecast to breach their margin or availability threshold within the next six hours.",
    filter: { kind: "state", value: "At risk" },
  },
  {
    id: "incidents", title: "Active Incidents", value: "3", sub: "Two high impact",
    status: "risk", trend: "flat", prior: "4 yesterday", target: "0 high impact",
    timestamp: "09:42 UTC", spark: [5, 4, 4, 5, 4, 4, 3, 4, 3, 3, 3, 3],
    explain: "Incidents currently open against optical links or derived customer services.",
    filter: { kind: "state", value: "Down" },
  },
];

/* ------------------------------ map data ------------------------------ */

export type TwinState =
  | "Healthy" | "Degraded" | "At risk" | "Down"
  | "Maintenance" | "Telemetry stale" | "Recovering" | "On fallback";

export const twinStateColors: Record<TwinState, string> = {
  Healthy: "#059669",
  Degraded: "#ea580c",
  "At risk": "#d97706",
  Down: "#e11d48",
  Maintenance: "#2563eb",
  "Telemetry stale": "#64748b",
  Recovering: "#0891b2",
  "On fallback": "#0284c7",
};

export interface TwinLink {
  id: string;
  name: string;
  region: string;
  product: "Lightbridge" | "Lightbridge Pro" | "Beam";
  linkType: string;
  service: string;
  customer: string;
  state: TwinState;
  terminalA: string;
  terminalB: string;
  ax: number; ay: number; bx: number; by: number;
  capacityGbps: number;
  throughputGbps: number;
  availability: string;
  marginDb: string;
  rxPowerDbm: string;
  attenuationDb: string;
  beamLock: string;
  pointingError: string;
  weather: string;
  rfFallback: string;
  slo: string;
  situation: string;
  agents: string[];
  recommendation: string;
  evidenceCount: number;
}

export const twinLinks: TwinLink[] = [
  {
    id: "CHN-MBL-041", name: "Chennai Mobile Backhaul 041", region: "Chennai", product: "Lightbridge",
    linkType: "Optical point-to-point", service: "10 Gbps mobile backhaul", customer: "Bharat Mobility Networks",
    state: "At risk", terminalA: "Chennai Guindy Rooftop A", terminalB: "Chennai Perungudi Aggregation B",
    ax: 70.4, ay: 57.2, bx: 71.6, by: 58.4, capacityGbps: 10, throughputGbps: 8.6,
    availability: "99.982%", marginDb: "7.4 dB, declining", rxPowerDbm: "-24.8 dBm", attenuationDb: "3.1 dB/km",
    beamLock: "Locked, 6 h 12 m", pointingError: "0.18 mrad", weather: "Dense fog forecast within six hours",
    rfFallback: "Available, 6 Gbps usable", slo: "Within objective, forecast breach in six hours",
    situation: "SIT-2026-0417 Chennai visibility decline", agents: ["Weather Intelligence Agent", "Risk Prediction Agent"],
    recommendation: "Pre-position RF fallback for priority services", evidenceCount: 14,
  },
  {
    id: "CHN-ENT-087", name: "Chennai Enterprise Ring 087", region: "Chennai", product: "Lightbridge Pro",
    linkType: "Resilient optical", service: "5 Gbps enterprise transport", customer: "Metro Fiber Alliance",
    state: "At risk", terminalA: "Chennai OMR Campus A", terminalB: "Chennai Taramani Core B",
    ax: 71.2, ay: 58.6, bx: 72.2, by: 57.6, capacityGbps: 5, throughputGbps: 4.1,
    availability: "99.991%", marginDb: "6.9 dB, declining", rxPowerDbm: "-25.6 dBm", attenuationDb: "3.4 dB/km",
    beamLock: "Locked, 11 h 04 m", pointingError: "0.12 mrad", weather: "Visibility 4.2 km and falling",
    rfFallback: "Available, 3 Gbps usable", slo: "Within objective",
    situation: "SIT-2026-0417 Chennai visibility decline", agents: ["Customer Impact Agent"],
    recommendation: "Notify customer operations of the potential impact window", evidenceCount: 11,
  },
  {
    id: "MUM-DC-012", name: "Mumbai Data Centre Span 012", region: "Mumbai", product: "Lightbridge Pro",
    linkType: "Resilient optical", service: "4 Gbps data centre interconnect", customer: "Pacific Cloud Systems",
    state: "Degraded", terminalA: "Mumbai BKC Rooftop", terminalB: "Mumbai Powai Core",
    ax: 68.4, ay: 54.4, bx: 69.6, by: 53.6, capacityGbps: 4, throughputGbps: 3.4,
    availability: "99.974%", marginDb: "5.8 dB", rxPowerDbm: "-26.4 dBm", attenuationDb: "3.9 dB/km",
    beamLock: "Locked, 2 h 18 m", pointingError: "0.31 mrad", weather: "Monsoon haze",
    rfFallback: "Available, 2 Gbps usable", slo: "Within objective, margin watch",
    situation: "None", agents: ["Anomaly Detection Agent"], recommendation: "Increase telemetry sampling to 10 seconds", evidenceCount: 8,
  },
  {
    id: "JNB-ISP-033", name: "Johannesburg ISP Uplink 033", region: "Johannesburg", product: "Beam",
    linkType: "Beam mesh", service: "3 Gbps internet uplink", customer: "Rift Valley Telecom",
    state: "At risk", terminalA: "Johannesburg Sandton Node", terminalB: "Johannesburg Midrand Node",
    ax: 53.0, ay: 71.0, bx: 54.2, by: 72.0, capacityGbps: 3, throughputGbps: 2.2,
    availability: "99.968%", marginDb: "6.2 dB", rxPowerDbm: "-25.1 dBm", attenuationDb: "3.3 dB/km",
    beamLock: "Locked, 18 h 41 m", pointingError: "0.22 mrad", weather: "Dust and thermal turbulence",
    rfFallback: "Partial, 1 Gbps usable", slo: "Within objective",
    situation: "None", agents: ["Risk Prediction Agent"], recommendation: "Validate fallback route headroom", evidenceCount: 6,
  },
  {
    id: "DXB-ENT-009", name: "Dubai Enterprise Handoff 009", region: "Dubai", product: "Lightbridge",
    linkType: "Customer handoff", service: "2 Gbps enterprise handoff", customer: "Metro Fiber Alliance",
    state: "Healthy", terminalA: "Dubai Marina Rooftop", terminalB: "Dubai Internet City Core",
    ax: 60.4, ay: 53.6, bx: 61.4, by: 54.4, capacityGbps: 2, throughputGbps: 1.3,
    availability: "99.996%", marginDb: "9.1 dB", rxPowerDbm: "-22.4 dBm", attenuationDb: "2.4 dB/km",
    beamLock: "Locked, 3 d 04 h", pointingError: "0.08 mrad", weather: "Clear",
    rfFallback: "Available, 2 Gbps usable", slo: "Within objective",
    situation: "None", agents: ["Link Health Monitor"], recommendation: "No action required", evidenceCount: 3,
  },
  {
    id: "LON-ENT-003", name: "London Enterprise Core 003", region: "London", product: "Lightbridge Pro",
    linkType: "Resilient optical", service: "20 Gbps enterprise core", customer: "Metro Fiber Alliance",
    state: "Maintenance", terminalA: "London Docklands A", terminalB: "London Slough Core B",
    ax: 46.6, ay: 34.2, bx: 45.6, by: 35.0, capacityGbps: 20, throughputGbps: 11.2,
    availability: "99.994%", marginDb: "10.4 dB", rxPowerDbm: "-21.6 dBm", attenuationDb: "2.1 dB/km",
    beamLock: "Locked, 12 h 02 m", pointingError: "0.06 mrad", weather: "Light rain",
    rfFallback: "Available, 10 Gbps usable", slo: "Within objective",
    situation: "Planned maintenance window", agents: ["Capacity Guardian Agent"], recommendation: "Complete post-change validation", evidenceCount: 5,
  },
  {
    id: "RIO-MBL-055", name: "Rio Backbone Span 055", region: "Rio de Janeiro", product: "Lightbridge",
    linkType: "Optical point-to-point", service: "8 Gbps metro backbone", customer: "Cidade Conectada",
    state: "Recovering", terminalA: "Rio Centro Rooftop", terminalB: "Rio Barra Aggregation",
    ax: 33.4, ay: 70.6, bx: 34.6, by: 71.6, capacityGbps: 8, throughputGbps: 6.4,
    availability: "99.979%", marginDb: "8.2 dB, improving", rxPowerDbm: "-23.8 dBm", attenuationDb: "2.8 dB/km",
    beamLock: "Reacquired, 22 m", pointingError: "0.14 mrad", weather: "Clearing",
    rfFallback: "Available, 4 Gbps usable", slo: "Recovered",
    situation: "Resolved capacity event", agents: ["Recovery Orchestrator Agent"], recommendation: "Monitor for two hours then close", evidenceCount: 9,
  },
  {
    id: "NBO-ISP-021", name: "Nairobi Aggregation 021", region: "Nairobi", product: "Beam",
    linkType: "Beam mesh", service: "6 Gbps regional aggregation", customer: "Rift Valley Telecom",
    state: "Healthy", terminalA: "Nairobi Westlands Node", terminalB: "Nairobi Embakasi Node",
    ax: 56.6, ay: 62.4, bx: 57.6, by: 63.2, capacityGbps: 6, throughputGbps: 3.2,
    availability: "99.993%", marginDb: "9.6 dB", rxPowerDbm: "-22.1 dBm", attenuationDb: "2.3 dB/km",
    beamLock: "Locked, 5 d 11 h", pointingError: "0.07 mrad", weather: "Clear",
    rfFallback: "Available, 4 Gbps usable", slo: "Within objective",
    situation: "None", agents: ["Link Health Monitor"], recommendation: "No action required", evidenceCount: 2,
  },
  {
    id: "CAL-DC-114", name: "California Backbone 114", region: "California", product: "Lightbridge Pro",
    linkType: "Fiber backup", service: "40 Gbps regional backbone", customer: "Pacific Cloud Systems",
    state: "Healthy", terminalA: "San Jose Core A", terminalB: "Fremont Core B",
    ax: 15.4, ay: 39.4, bx: 16.6, by: 40.2, capacityGbps: 40, throughputGbps: 24.6,
    availability: "99.998%", marginDb: "11.2 dB", rxPowerDbm: "-20.8 dBm", attenuationDb: "1.9 dB/km",
    beamLock: "Locked, 9 d 02 h", pointingError: "0.05 mrad", weather: "Clear",
    rfFallback: "Available, 20 Gbps usable", slo: "Within objective",
    situation: "None", agents: ["Capacity Guardian Agent"], recommendation: "No action required", evidenceCount: 4,
  },
  {
    id: "SEA-MSH-076", name: "Southeast Asia Mesh 076", region: "Southeast Asia", product: "Beam",
    linkType: "Beam mesh", service: "5 Gbps mesh transport", customer: "Pacific Cloud Systems",
    state: "Telemetry stale", terminalA: "Jakarta North Node", terminalB: "Jakarta South Node",
    ax: 77.4, ay: 63.4, bx: 78.6, by: 64.2, capacityGbps: 5, throughputGbps: 3.0,
    availability: "99.981%", marginDb: "8.0 dB", rxPowerDbm: "-23.4 dBm", attenuationDb: "2.7 dB/km",
    beamLock: "Locked, 1 d 06 h", pointingError: "0.11 mrad", weather: "Convective storms",
    rfFallback: "Available, 2 Gbps usable", slo: "Unknown, telemetry stale",
    situation: "Collector backlog", agents: ["Anomaly Detection Agent"], recommendation: "Reconcile collector backlog", evidenceCount: 7,
  },
  {
    id: "CAF-ISP-048", name: "Central Africa Corridor 048", region: "Central Africa", product: "Lightbridge",
    linkType: "Optical point-to-point", service: "3 Gbps regional corridor", customer: "Congo Basin Connect",
    state: "On fallback", terminalA: "Kinshasa Central Node", terminalB: "Kinshasa East Node",
    ax: 49.4, ay: 61.4, bx: 50.6, by: 62.2, capacityGbps: 3, throughputGbps: 1.8,
    availability: "99.962%", marginDb: "5.2 dB", rxPowerDbm: "-27.1 dBm", attenuationDb: "4.1 dB/km",
    beamLock: "Intermittent", pointingError: "0.36 mrad", weather: "Heavy rain",
    rfFallback: "Active, carrying 1.8 Gbps", slo: "Degraded, fallback protecting service",
    situation: "Weather driven fallback", agents: ["Recovery Orchestrator Agent"], recommendation: "Hold fallback until visibility recovers", evidenceCount: 10,
  },
  {
    id: "EUR-DC-201", name: "Europe Core Interconnect 201", region: "Europe", product: "Lightbridge Pro",
    linkType: "Resilient optical", service: "25 Gbps core interconnect", customer: "Metro Fiber Alliance",
    state: "Healthy", terminalA: "Frankfurt Core A", terminalB: "Amsterdam Core B",
    ax: 48.6, ay: 35.4, bx: 47.6, by: 34.4, capacityGbps: 25, throughputGbps: 15.8,
    availability: "99.997%", marginDb: "10.8 dB", rxPowerDbm: "-21.2 dBm", attenuationDb: "2.0 dB/km",
    beamLock: "Locked, 7 d 14 h", pointingError: "0.06 mrad", weather: "Overcast",
    rfFallback: "Available, 12 Gbps usable", slo: "Within objective",
    situation: "None", agents: ["SLO Guardian"], recommendation: "No action required", evidenceCount: 3,
  },
];

export interface RegionCallout {
  region: string;
  links: number;
  state: TwinState;
  capacity: string;
  utilization: number;
  x: number; y: number;
}

export const regionCallouts: RegionCallout[] = [
  { region: "California", links: 98, state: "Healthy", capacity: "1.8 Tbps", utilization: 62, x: 16, y: 40 },
  { region: "London", links: 84, state: "Healthy", capacity: "1.2 Tbps", utilization: 58, x: 46, y: 34 },
  { region: "Rio de Janeiro", links: 72, state: "Healthy", capacity: "620 Gbps", utilization: 71, x: 34, y: 71 },
  { region: "Nairobi", links: 68, state: "Healthy", capacity: "450 Gbps", utilization: 54, x: 57, y: 63 },
  { region: "Chennai", links: 38, state: "At risk", capacity: "340 Gbps", utilization: 63, x: 71, y: 58 },
];

/* ------------------------------ reasoning ----------------------------- */

export const twinAssessment = {
  confidence: 96,
  summary:
    "Overall global link health remains strong. The Chennai region shows elevated risk because visibility is declining, link margin is trending downward on six links, and historical fog conditions indicate likely service degradation within approximately six hours.",
  drivers: [
    "Visibility forecast declining in Chennai",
    "Link margin trending downward on six links",
    "Historical fog impact in this corridor",
    "RF fallback capacity is sufficient",
    "No terminal hardware fault is detected",
    "Customer impact is preventable if action occurs within the recommended window",
  ],
  evidence: [
    { id: "EV-1", label: "Chennai visibility forecast, six hour horizon", source: "Weather Intelligence Agent", weight: "High" },
    { id: "EV-2", label: "Link margin trend on six Chennai links", source: "Link Health Monitor", weight: "High" },
    { id: "EV-3", label: "Historical fog impact, 14 comparable events", source: "Risk Prediction Agent", weight: "Medium" },
    { id: "EV-4", label: "RF fallback headroom validation", source: "Capacity Guardian Agent", weight: "Medium" },
    { id: "EV-5", label: "Terminal hardware diagnostics, no fault", source: "Anomaly Detection Agent", weight: "Supporting" },
    { id: "EV-6", label: "Exposed customer service inventory", source: "Customer Impact Agent", weight: "High" },
  ],
};

export interface Recommendation {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  outcome: string;
  impactProtected: string;
  confidence: number;
  policy: "Within policy" | "Policy review";
  approval: "Automatic" | "Human approval";
  agent: string;
  window: string;
}

export const recommendations: Recommendation[] = [
  { id: "REC-1", title: "Increase monitoring frequency for Chennai links", priority: "High", outcome: "Earlier detection of margin decline", impactProtected: "15 Gbps across 2 services", confidence: 96, policy: "Within policy", approval: "Automatic", agent: "Link Health Monitor", window: "Immediate" },
  { id: "REC-2", title: "Pre-position RF fallback for priority services", priority: "High", outcome: "Fallback ready before visibility loss", impactProtected: "10 Gbps mobile backhaul", confidence: 94, policy: "Within policy", approval: "Human approval", agent: "Capacity Guardian Agent", window: "Next 60 minutes" },
  { id: "REC-3", title: "Notify customer operations of the potential impact window", priority: "Medium", outcome: "Customer awareness ahead of impact", impactProtected: "2 enterprise customers", confidence: 92, policy: "Within policy", approval: "Automatic", agent: "Customer Impact Agent", window: "Next 30 minutes" },
  { id: "REC-4", title: "Re-evaluate conditions in two hours or earlier if visibility changes", priority: "Medium", outcome: "Assessment stays current", impactProtected: "Chennai region", confidence: 90, policy: "Within policy", approval: "Automatic", agent: "Risk Prediction Agent", window: "Two hours" },
  { id: "REC-5", title: "Restrict nonessential changes on exposed links", priority: "Medium", outcome: "Removes change-induced risk", impactProtected: "6 Chennai links", confidence: 88, policy: "Policy review", approval: "Human approval", agent: "SLO Guardian", window: "Next six hours" },
  { id: "REC-6", title: "Validate fallback route headroom", priority: "Low", outcome: "Confirms fallback can carry priority traffic", impactProtected: "9 Gbps fallback capacity", confidence: 93, policy: "Within policy", approval: "Automatic", agent: "Capacity Guardian Agent", window: "Immediate" },
];

/* ------------------------------ risk table ---------------------------- */

export interface TwinRisk {
  linkId: string;
  route: string;
  region: string;
  risk: "High" | "Moderate" | "Low";
  customerImpact: string;
  capacityExposed: string;
  confidence: number;
  timeToImpact: string;
  fallbackReadiness: "Ready" | "Partial" | "Validating";
  agent: string;
  action: string;
}

export const twinRisks: TwinRisk[] = [
  { linkId: "CHN-MBL-041", route: "Chennai Guindy to Perungudi", region: "Chennai", risk: "High", customerImpact: "Bharat Mobility Networks", capacityExposed: "10 Gbps", confidence: 94, timeToImpact: "5 h 40 m", fallbackReadiness: "Ready", agent: "Weather Intelligence Agent", action: "Pre-position RF fallback" },
  { linkId: "CHN-ENT-087", route: "Chennai OMR to Taramani", region: "Chennai", risk: "High", customerImpact: "Metro Fiber Alliance", capacityExposed: "5 Gbps", confidence: 92, timeToImpact: "6 h 05 m", fallbackReadiness: "Ready", agent: "Customer Impact Agent", action: "Notify customer operations" },
  { linkId: "MUM-DC-012", route: "Mumbai BKC to Powai", region: "Mumbai", risk: "Moderate", customerImpact: "Pacific Cloud Systems", capacityExposed: "4 Gbps", confidence: 87, timeToImpact: "9 h 20 m", fallbackReadiness: "Partial", agent: "Anomaly Detection Agent", action: "Increase telemetry sampling" },
  { linkId: "JNB-ISP-033", route: "Johannesburg Sandton to Midrand", region: "Johannesburg", risk: "Moderate", customerImpact: "Rift Valley Telecom", capacityExposed: "3 Gbps", confidence: 85, timeToImpact: "11 h 10 m", fallbackReadiness: "Partial", agent: "Risk Prediction Agent", action: "Validate fallback headroom" },
  { linkId: "DXB-ENT-009", route: "Dubai Marina to Internet City", region: "Dubai", risk: "Low", customerImpact: "Metro Fiber Alliance", capacityExposed: "2 Gbps", confidence: 72, timeToImpact: "18 h 45 m", fallbackReadiness: "Validating", agent: "Link Health Monitor", action: "Continue observation" },
];

/* ------------------------------- trend -------------------------------- */

export interface TrendPoint {
  day: string;
  availability: number;
  atRisk: number;
  incidents: number;
  recoveries: number;
  impactEvents: number;
  annotation?: string;
}

export const trendSeries: TrendPoint[] = [
  { day: "May 8", availability: 99.997, atRisk: 12, incidents: 4, recoveries: 5, impactEvents: 1 },
  { day: "May 9", availability: 99.996, atRisk: 15, incidents: 5, recoveries: 6, impactEvents: 1, annotation: "Monsoon front, Mumbai" },
  { day: "May 10", availability: 99.998, atRisk: 11, incidents: 3, recoveries: 7, impactEvents: 0 },
  { day: "May 11", availability: 99.999, atRisk: 9, incidents: 2, recoveries: 4, impactEvents: 0 },
  { day: "May 12", availability: 99.998, atRisk: 14, incidents: 3, recoveries: 6, impactEvents: 0, annotation: "Agent action, Rio rerouting" },
  { day: "May 13", availability: 99.999, atRisk: 18, incidents: 3, recoveries: 5, impactEvents: 0 },
  { day: "May 14", availability: 99.999, atRisk: 23, incidents: 3, recoveries: 5, impactEvents: 0, annotation: "Chennai fog forecast" },
];

/* ---------------------------- incidents ------------------------------- */

export const incidentSummary = [
  { severity: "High", count: 3, color: "#e11d48" },
  { severity: "Medium", count: 2, color: "#ea580c" },
  { severity: "Low", count: 1, color: "#d97706" },
  { severity: "Informational", count: 4, color: "#2563eb" },
];

/* -------------------------- digital coworkers ------------------------- */

export interface Coworker {
  id: string;
  name: string;
  mission: string;
  task: string;
  status: "Active" | "Monitoring" | "Awaiting approval";
  scope: string;
  confidence: number;
  actionsToday: number;
  awaitingApproval: number;
  lastDecision: string;
  guardrail: string;
  objective: string;
  inputs: string[];
  connectedData: string[];
  queue: string[];
  findings: string[];
  recommendations: string[];
  evidenceReviewed: number;
  guardrails: string[];
  autonomy: "Advisory" | "Supervised" | "Bounded autonomy";
  owner: string;
  outcomes: string[];
}

export const coworkers: Coworker[] = [
  {
    id: "cw-health", name: "Link Health Monitor", mission: "Maintain an accurate health state for every optical link",
    task: "Monitoring 1,248 links", status: "Active", scope: "1,248 links, 320 services", confidence: 96,
    actionsToday: 38, awaitingApproval: 0, lastDecision: "Confirmed service recovery on Nairobi aggregation",
    guardrail: "Within guardrails", objective: "Detect health state change within 30 seconds of telemetry arrival",
    inputs: ["Per-link margin", "Beam lock state", "Telemetry freshness"], connectedData: ["Optical telemetry stream", "Service dependency map"],
    queue: ["Re-baseline 14 links after firmware update", "Reconcile stale telemetry in Southeast Asia"],
    findings: ["Six Chennai links show margin decline", "One collector backlog in Jakarta"],
    recommendations: ["Increase monitoring frequency for Chennai links"], evidenceReviewed: 214,
    guardrails: ["Read-only on customer traffic", "No state change without corroborating telemetry"],
    autonomy: "Bounded autonomy", owner: "VP Network Operations",
    outcomes: ["38 health reconciliations completed today"],
  },
  {
    id: "cw-weather", name: "Weather Intelligence Agent", mission: "Anticipate atmospheric impact on optical propagation",
    task: "Tracking 14 weather systems", status: "Active", scope: "23 countries, 14 weather systems", confidence: 94,
    actionsToday: 12, awaitingApproval: 0, lastDecision: "Raised Chennai fog watch for the next six hours",
    guardrail: "Within guardrails", objective: "Provide six hour visibility forecasts per corridor",
    inputs: ["Visibility forecast", "Precipitation radar", "Historical fog patterns"], connectedData: ["Meteorological feed", "Corridor history"],
    queue: ["Refresh India South forecast", "Score Central Africa rainfall"],
    findings: ["Chennai visibility declining below 4 km", "Central Africa rainfall sustaining fallback"],
    recommendations: ["Create weather watch for India South"], evidenceReviewed: 96,
    guardrails: ["Forecast only, no traffic actions"], autonomy: "Advisory", owner: "Regional Operations Lead, India",
    outcomes: ["Two preventive watches created this week"],
  },
  {
    id: "cw-risk", name: "Risk Prediction Agent", mission: "Predict link degradation before customers notice",
    task: "Evaluating 23 at-risk links", status: "Active", scope: "23 predicted risks", confidence: 91,
    actionsToday: 19, awaitingApproval: 1, lastDecision: "Ranked Chennai corridor as highest six hour risk",
    guardrail: "Within guardrails", objective: "Maintain a ranked six hour risk register with calibrated confidence",
    inputs: ["Margin trend", "Weather forecast", "Historical outcomes"], connectedData: ["Risk model registry", "Outcome ledger"],
    queue: ["Recalibrate Johannesburg dust model"], findings: ["Chennai risk probability 94%"],
    recommendations: ["Restrict nonessential changes on exposed links"], evidenceReviewed: 148,
    guardrails: ["Predictions must cite at least three evidence sources"], autonomy: "Advisory", owner: "SRE Reliability Lead",
    outcomes: ["11 predicted risks avoided this month"],
  },
  {
    id: "cw-capacity", name: "Capacity Guardian Agent", mission: "Guarantee fallback and backup capacity is usable",
    task: "Validating fallback capacity", status: "Active", scope: "RF fallback and fiber backup estate", confidence: 93,
    actionsToday: 9, awaitingApproval: 0, lastDecision: "Validated 9 Gbps of Chennai fallback headroom",
    guardrail: "Within guardrails", objective: "Confirm fallback headroom before any traffic transition",
    inputs: ["Fallback utilization", "Backup route state"], connectedData: ["Capacity inventory", "Route database"],
    queue: ["Revalidate Johannesburg fallback"], findings: ["Chennai fallback sufficient for priority traffic"],
    recommendations: ["Validate fallback route headroom"], evidenceReviewed: 72,
    guardrails: ["No transition without validated headroom"], autonomy: "Supervised", owner: "Capacity Planning Lead",
    outcomes: ["286 Gbps of capacity protected this month"],
  },
  {
    id: "cw-anomaly", name: "Anomaly Detection Agent", mission: "Detect abnormal link behaviour early",
    task: "Scanning for abnormal link behaviour", status: "Active", scope: "500 operational signals", confidence: 89,
    actionsToday: 24, awaitingApproval: 0, lastDecision: "Cleared four transient margin alerts as weather noise",
    guardrail: "Within guardrails", objective: "Separate genuine anomalies from environmental noise",
    inputs: ["Signal baselines", "Pointing error", "Attenuation"], connectedData: ["Signal baseline store"],
    queue: ["Investigate Jakarta collector backlog"], findings: ["No terminal hardware fault detected in Chennai"],
    recommendations: ["Reconcile Jakarta collector backlog"], evidenceReviewed: 302,
    guardrails: ["No suppression of unexplained anomalies"], autonomy: "Bounded autonomy", owner: "SRE Reliability Lead",
    outcomes: ["Two false incidents prevented today"],
  },
  {
    id: "cw-impact", name: "Customer Impact Agent", mission: "Translate link conditions into customer consequence",
    task: "Mapping exposed customer services", status: "Active", scope: "320 customer services", confidence: 92,
    actionsToday: 15, awaitingApproval: 0, lastDecision: "Identified two exposed Chennai services",
    guardrail: "Within guardrails", objective: "Keep customer exposure current for every active risk",
    inputs: ["Service topology", "Contract tiers"], connectedData: ["Customer service registry"],
    queue: ["Refresh Chennai service exposure"], findings: ["15 Gbps of customer traffic exposed in Chennai"],
    recommendations: ["Notify customer operations of the potential impact window"], evidenceReviewed: 118,
    guardrails: ["No customer communication without human approval"], autonomy: "Supervised", owner: "Customer Operations Lead",
    outcomes: ["Zero customer impact events this month"],
  },
  {
    id: "cw-slo", name: "SLO Guardian", mission: "Protect service level objectives and error budget",
    task: "Tracking error budget across 320 services", status: "Monitoring", scope: "320 SLOs", confidence: 95,
    actionsToday: 7, awaitingApproval: 0, lastDecision: "Held Chennai error budget burn within threshold",
    guardrail: "Within guardrails", objective: "Prevent unplanned error budget consumption",
    inputs: ["SLO definitions", "Burn rate"], connectedData: ["Error budget ledger"],
    queue: ["Review India South burn rate"], findings: ["18% of monthly error budget preserved"],
    recommendations: ["Restrict nonessential changes on exposed links"], evidenceReviewed: 64,
    guardrails: ["Escalate any burn rate above two times budget"], autonomy: "Advisory", owner: "VP Network Operations",
    outcomes: ["Error budget preserved on all priority services"],
  },
  {
    id: "cw-recovery", name: "Recovery Orchestrator Agent", mission: "Execute and validate approved recovery actions",
    task: "Holding Central Africa fallback until visibility recovers", status: "Awaiting approval", scope: "Approved recovery workflows", confidence: 90,
    actionsToday: 5, awaitingApproval: 1, lastDecision: "Requested approval for Chennai traffic movement",
    guardrail: "Approval required", objective: "Execute governed recovery with rollback readiness at every step",
    inputs: ["Approved action plan", "Rollback checkpoints"], connectedData: ["Runbook library", "Change register"],
    queue: ["Chennai priority traffic transition, awaiting approval"],
    findings: ["Rollback checkpoint verified for Chennai transition"],
    recommendations: ["Pre-position RF fallback for priority services"], evidenceReviewed: 88,
    guardrails: ["Human approval required for traffic movement", "Rollback verified before execution"],
    autonomy: "Supervised", owner: "NOC Duty Manager",
    outcomes: ["38 autonomous recoveries completed this month"],
  },
];

/* ---------------------------- activity feed --------------------------- */

export interface ActivityEvent {
  id: string;
  time: string;
  event: string;
  region: string;
  service: string;
  actor: string;
  status: "Detected" | "Completed" | "Validated" | "Created";
  outcome: string;
  stage: string;
}

export const activityEvents: ActivityEvent[] = [
  { id: "AC-1", time: "09:40", event: "Risk detected on CHN-MBL-041", region: "Chennai", service: "10 Gbps mobile backhaul", actor: "Risk Prediction Agent", status: "Detected", outcome: "Watch created", stage: "Predict" },
  { id: "AC-2", time: "09:37", event: "Capacity increase detected on RIO-MBL-055", region: "Rio de Janeiro", service: "8 Gbps metro backbone", actor: "Capacity Guardian Agent", status: "Detected", outcome: "Capacity headroom confirmed", stage: "Observe" },
  { id: "AC-3", time: "09:33", event: "Service recovery confirmed on NBO-ISP-021", region: "Nairobi", service: "6 Gbps regional aggregation", actor: "Recovery Orchestrator Agent", status: "Validated", outcome: "Service healthy", stage: "Validate" },
  { id: "AC-4", time: "09:28", event: "Maintenance completed on LON-ENT-003", region: "London", service: "20 Gbps enterprise core", actor: "NOC Duty Manager", status: "Completed", outcome: "Post-change validation passed", stage: "Execute" },
  { id: "AC-5", time: "09:22", event: "RF fallback validated for Chennai priority services", region: "Chennai", service: "Priority services", actor: "Capacity Guardian Agent", status: "Validated", outcome: "9 Gbps headroom available", stage: "Recommend" },
  { id: "AC-6", time: "09:14", event: "Weather watch created for India South", region: "Chennai", service: "Regional", actor: "Weather Intelligence Agent", status: "Created", outcome: "Six hour fog watch active", stage: "Understand" },
];

/* ---------------------------- outcomes -------------------------------- */

export interface OutcomeRow {
  id: string;
  time: string;
  outcome: string;
  scope: string;
  businessValue: string;
  sreValue: string;
  status: "Positive" | "Preventive" | "Validated";
}

export const outcomeRows: OutcomeRow[] = [
  { id: "OC-1", time: "09:33", outcome: "Confirmed service recovery on Nairobi aggregation", scope: "Rift Valley Telecom", businessValue: "6 Gbps service restored", sreValue: "Error budget protected", status: "Positive" },
  { id: "OC-2", time: "09:21", outcome: "Prevented potential outage on Rio backbone link", scope: "Cidade Conectada", businessValue: "8 Gbps outage avoided", sreValue: "Zero customer impact", status: "Preventive" },
  { id: "OC-3", time: "09:12", outcome: "Traffic rerouted because of fog risk in Chennai", scope: "Bharat Mobility Networks", businessValue: "10 Gbps protected", sreValue: "Preventive action inside window", status: "Preventive" },
  { id: "OC-4", time: "08:58", outcome: "Capacity optimization completed in California", scope: "Pacific Cloud Systems", businessValue: "40 Gbps optimized", sreValue: "Headroom restored", status: "Positive" },
  { id: "OC-5", time: "08:41", outcome: "Avoided field dispatch after remote terminal validation", scope: "Johannesburg", businessValue: "Field visit avoided", sreValue: "Toil reduced", status: "Validated" },
  { id: "OC-6", time: "08:19", outcome: "Preserved customer SLO through RF fallback", scope: "Congo Basin Connect", businessValue: "3 Gbps service preserved", sreValue: "SLO maintained", status: "Validated" },
];

export const monthlyMetrics = [
  { label: "Outage Minutes Avoided", value: "1,248" },
  { label: "Autonomous Recoveries", value: "38" },
  { label: "Customer Impact Events", value: "0" },
  { label: "Field Visits Avoided", value: "11" },
  { label: "Capacity Protected", value: "286 Gbps" },
  { label: "Error Budget Preserved", value: "18%" },
  { label: "Investigations Completed", value: "147" },
  { label: "Preventive Actions Completed", value: "83" },
];

/* --------------------------- operating loop --------------------------- */

export interface LoopStage {
  stage: string;
  count: number;
  agent: string;
  status: string;
  latest: string;
}

export const loopStages: LoopStage[] = [
  { stage: "Observe", count: 500, agent: "Link Health Monitor", status: "Active", latest: "Telemetry current across 1,216 links" },
  { stage: "Understand", count: 42, agent: "Weather Intelligence Agent", status: "Active", latest: "Chennai fog watch created" },
  { stage: "Predict", count: 23, agent: "Risk Prediction Agent", status: "Active", latest: "Chennai risk ranked highest" },
  { stage: "Recommend", count: 6, agent: "Capacity Guardian Agent", status: "Active", latest: "Fallback pre-positioning proposed" },
  { stage: "Approve", count: 1, agent: "Recovery Orchestrator Agent", status: "Awaiting human", latest: "Traffic movement pending approval" },
  { stage: "Execute", count: 4, agent: "Recovery Orchestrator Agent", status: "Ready", latest: "Monitoring changes executed" },
  { stage: "Validate", count: 5, agent: "SLO Guardian", status: "Active", latest: "Nairobi recovery validated" },
  { stage: "Learn", count: 3, agent: "Risk Prediction Agent", status: "Active", latest: "Fog pattern knowledge recorded" },
];

/* ------------------------ natural language demo ----------------------- */

export interface TwinPrompt {
  id: string;
  prompt: string;
  answer: string;
  detail: string[];
  focusRegion?: string;
}

export const twinPrompts: TwinPrompt[] = [
  {
    id: "P1", prompt: "Which links are most likely to degrade in the next six hours?",
    answer: "Five links carry elevated degradation probability, concentrated in Chennai.",
    detail: ["CHN-MBL-041, 94% confidence, 5 h 40 m to impact", "CHN-ENT-087, 92% confidence, 6 h 05 m to impact", "MUM-DC-012, 87% confidence, 9 h 20 m to impact"],
    focusRegion: "Chennai",
  },
  {
    id: "P2", prompt: "Why is Chennai at risk?",
    answer: "Visibility is declining, margin is trending downward on six links, and comparable fog events historically produced degradation.",
    detail: ["Visibility 4.2 km and falling", "Six links below 7.5 dB margin", "14 comparable historical fog events"],
    focusRegion: "Chennai",
  },
  {
    id: "P3", prompt: "Which customer services are using RF fallback?",
    answer: "One service is currently delivered on RF fallback, with two more pre-positioned.",
    detail: ["CAF-ISP-048, Congo Basin Connect, 1.8 Gbps on fallback", "CHN-MBL-041 fallback pre-positioned", "CHN-ENT-087 fallback pre-positioned"],
  },
  {
    id: "P4", prompt: "Show links with declining margin and no backup capacity.",
    answer: "Two links show declining margin with only partial fallback headroom.",
    detail: ["JNB-ISP-033, partial fallback, 1 Gbps usable", "MUM-DC-012, partial fallback, 2 Gbps usable"],
  },
  {
    id: "P5", prompt: "Which regions consumed the most error budget this week?",
    answer: "Chennai and Central Africa consumed the most error budget, both within threshold.",
    detail: ["Chennai, 6% of monthly budget", "Central Africa, 4% of monthly budget", "18% of monthly budget preserved overall"],
  },
  {
    id: "P6", prompt: "What actions did the Twin complete today?",
    answer: "129 agent actions completed today, none of which caused customer impact.",
    detail: ["38 health reconciliations", "24 anomaly evaluations", "9 capacity validations"],
  },
  {
    id: "P7", prompt: "Which risks require human approval?",
    answer: "One recommendation requires human approval.",
    detail: ["Pre-position RF fallback for priority services, Chennai", "Owner: NOC Duty Manager", "Rollback checkpoint verified"],
    focusRegion: "Chennai",
  },
];

/* ------------------------------ scenario ------------------------------ */

export interface ScenarioStage {
  index: number;
  label: string;
  narrative: string;
  activity?: ActivityEvent;
  outcome?: OutcomeRow;
  atRisk: number;
  incidents: number;
  chennaiState: TwinState;
  assessment: string;
  confidence: number;
  awaitingApproval: boolean;
}

export const chennaiScenario: ScenarioStage[] = [
  { index: 0, label: "Visibility begins declining", narrative: "Chennai visibility falls below 6 km and the Weather Intelligence Agent begins closer tracking.", atRisk: 23, incidents: 3, chennaiState: "Healthy", confidence: 88, awaitingApproval: false, assessment: "Chennai visibility is declining. No customer impact is currently forecast." },
  { index: 1, label: "Six Chennai links enter watch state", narrative: "Six links move to watch as margin headroom narrows.", atRisk: 25, incidents: 3, chennaiState: "At risk", confidence: 90, awaitingApproval: false, assessment: "Six Chennai links are now in watch state pending margin confirmation." },
  { index: 2, label: "Link margin trends downward", narrative: "Margin trends confirm a consistent downward slope across the corridor.", atRisk: 27, incidents: 3, chennaiState: "At risk", confidence: 92, awaitingApproval: false, assessment: "Margin decline is consistent across the Chennai corridor." },
  { index: 3, label: "Weather Intelligence Agent identifies the pattern", narrative: "The pattern matches 14 comparable historical fog events.", atRisk: 27, incidents: 3, chennaiState: "At risk", confidence: 94, awaitingApproval: false, assessment: "The decline matches a known fog signature for this corridor.", activity: { id: "SC-1", time: "09:44", event: "Fog pattern matched for Chennai corridor", region: "Chennai", service: "Regional", actor: "Weather Intelligence Agent", status: "Detected", outcome: "Pattern confidence 94%", stage: "Understand" } },
  { index: 4, label: "Customer Impact Agent identifies exposed services", narrative: "Two customer services totalling 15 Gbps are exposed.", atRisk: 27, incidents: 3, chennaiState: "At risk", confidence: 94, awaitingApproval: false, assessment: "Two customer services totalling 15 Gbps are exposed to the forecast window.", activity: { id: "SC-2", time: "09:46", event: "Two exposed customer services identified", region: "Chennai", service: "Mobile backhaul, enterprise transport", actor: "Customer Impact Agent", status: "Detected", outcome: "15 Gbps exposure mapped", stage: "Understand" } },
  { index: 5, label: "RF fallback capacity is validated", narrative: "The Capacity Guardian Agent validates 9 Gbps of usable fallback headroom.", atRisk: 27, incidents: 3, chennaiState: "At risk", confidence: 95, awaitingApproval: false, assessment: "RF fallback headroom is sufficient to protect priority traffic.", activity: { id: "SC-3", time: "09:48", event: "RF fallback headroom validated", region: "Chennai", service: "Priority services", actor: "Capacity Guardian Agent", status: "Validated", outcome: "9 Gbps usable", stage: "Recommend" } },
  { index: 6, label: "Preventive actions are recommended", narrative: "Six preventive actions are proposed with policy status and approval requirements.", atRisk: 27, incidents: 3, chennaiState: "At risk", confidence: 96, awaitingApproval: false, assessment: "Preventive actions are recommended within the six hour window." },
  { index: 7, label: "Low-risk monitoring changes execute", narrative: "Monitoring frequency increases automatically under bounded autonomy.", atRisk: 27, incidents: 3, chennaiState: "At risk", confidence: 96, awaitingApproval: false, assessment: "Low-risk monitoring changes executed within policy.", activity: { id: "SC-4", time: "09:52", event: "Monitoring frequency increased on six Chennai links", region: "Chennai", service: "Regional", actor: "Link Health Monitor", status: "Completed", outcome: "Sampling at 10 seconds", stage: "Execute" } },
  { index: 8, label: "Human approval is requested for traffic movement", narrative: "The Recovery Orchestrator Agent requests approval to move priority traffic.", atRisk: 27, incidents: 3, chennaiState: "At risk", confidence: 96, awaitingApproval: true, assessment: "Human approval is required before priority traffic moves to fallback." },
  { index: 9, label: "Priority traffic transitions to fallback", narrative: "Approved traffic movement executes with rollback readiness verified.", atRisk: 24, incidents: 3, chennaiState: "On fallback", confidence: 96, awaitingApproval: false, assessment: "Priority traffic is now protected on RF fallback.", activity: { id: "SC-5", time: "10:04", event: "Priority traffic transitioned to RF fallback", region: "Chennai", service: "10 Gbps mobile backhaul", actor: "Recovery Orchestrator Agent", status: "Completed", outcome: "Rollback checkpoint held", stage: "Execute" } },
  { index: 10, label: "Customer service remains healthy", narrative: "Service level checks confirm no customer impact.", atRisk: 20, incidents: 3, chennaiState: "Recovering", confidence: 96, awaitingApproval: false, assessment: "Customer services remain healthy through the forecast window.", outcome: { id: "SC-O1", time: "10:08", outcome: "Customer service protected through fog window", scope: "Bharat Mobility Networks", businessValue: "10 Gbps protected", sreValue: "Zero customer impact", status: "Preventive" } },
  { index: 11, label: "The risk level declines", narrative: "Visibility stabilizes and the risk register falls back toward baseline.", atRisk: 16, incidents: 2, chennaiState: "Recovering", confidence: 95, awaitingApproval: false, assessment: "Chennai risk is declining as visibility stabilizes." },
  { index: 12, label: "Outcome metrics update", narrative: "Outage minutes avoided and preventive actions increase.", atRisk: 14, incidents: 2, chennaiState: "Healthy", confidence: 95, awaitingApproval: false, assessment: "Preventive action completed. Outcome metrics updated.", outcome: { id: "SC-O2", time: "10:16", outcome: "Preventive action recorded for Chennai corridor", scope: "Chennai", businessValue: "48 outage minutes avoided", sreValue: "Preventive action completed", status: "Positive" } },
  { index: 13, label: "Operational knowledge is recorded", narrative: "The fog signature and successful response are recorded for future events.", atRisk: 12, incidents: 2, chennaiState: "Healthy", confidence: 96, awaitingApproval: false, assessment: "Operational knowledge recorded. Chennai corridor returned to healthy state.", activity: { id: "SC-6", time: "10:22", event: "Fog response knowledge recorded", region: "Chennai", service: "Regional", actor: "Risk Prediction Agent", status: "Completed", outcome: "Model calibration updated", stage: "Learn" } },
];
