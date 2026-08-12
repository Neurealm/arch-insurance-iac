/**
 * Global Optical Operations Center — synthetic Taara-aligned demonstration data.
 *
 * ALL values here are fabricated for demonstration purposes only. No real
 * customer, site, incident or financial data is represented. Keep this module
 * free of React so the fixtures can be swapped for live telemetry later.
 */

export type LinkStatus =
  | "healthy"
  | "at_risk"
  | "degraded"
  | "unavailable"
  | "rf_fallback"
  | "maintenance"
  | "stale";

export type Severity = "critical" | "high" | "moderate" | "low";

export const REGIONS = [
  "India",
  "Southeast Asia",
  "East Africa",
  "Central Africa",
  "Brazil",
  "United States",
  "Europe",
] as const;
export type Region = (typeof REGIONS)[number];

export const PRODUCTS = ["Lightbridge", "Lightbridge Pro", "Beam"] as const;
export type Product = (typeof PRODUCTS)[number];

export const TIME_RANGES = ["1h", "6h", "12h", "24h", "7d"] as const;

export const CUSTOMERS = [
  "Bharat Mobility Networks",
  "Metro Fiber Alliance",
  "Rift Valley Telecom",
  "Cidade Conectada",
  "Pacific Cloud Systems",
  "Congo Basin Connect",
] as const;
export type Customer = (typeof CUSTOMERS)[number];

/* ------------------------------- KPIs -------------------------------- */

export interface Kpi {
  id: string;
  title: string;
  value: string;
  sub: string;
  status: "good" | "watch" | "risk";
  trend: "up" | "down" | "flat";
  delta: string;
  explain: string;
  /** Filter applied to the page when the card is clicked. */
  filter?: { kind: "status" | "product" | "region" | "none"; value?: string };
  spark: number[];
}

export const kpis: Kpi[] = [
  {
    id: "healthy",
    title: "Customer Services Healthy",
    value: "98.7%",
    sub: "316 of 320 services within objective",
    status: "good",
    trend: "up",
    delta: "+0.4 pts vs yesterday",
    explain: "Share of customer services meeting their availability and latency objectives across all regions.",
    filter: { kind: "none" },
    spark: [97.9, 98.1, 98.0, 98.3, 98.2, 98.4, 98.5, 98.4, 98.6, 98.7, 98.6, 98.7],
  },
  {
    id: "links",
    title: "Active Optical Links",
    value: "1,248",
    sub: "1,231 healthy, 11 at risk, 6 degraded",
    status: "good",
    trend: "up",
    delta: "+12 links vs last week",
    explain: "Optical links currently carrying traffic across Lightbridge, Lightbridge Pro and Beam deployments.",
    filter: { kind: "none" },
    spark: [1210, 1216, 1219, 1222, 1228, 1231, 1233, 1238, 1240, 1244, 1246, 1248],
  },
  {
    id: "customers",
    title: "Customers Affected",
    value: "6",
    sub: "2 with active impact, 4 at elevated risk",
    status: "watch",
    trend: "up",
    delta: "+2 vs previous period",
    explain: "Customers with at least one service currently impacted or forecast to be impacted within 24 hours.",
    filter: { kind: "status", value: "at_risk" },
    spark: [3, 3, 4, 4, 4, 5, 5, 4, 5, 6, 6, 6],
  },
  {
    id: "share",
    title: "Optical Traffic Share",
    value: "96.8%",
    sub: "41.2 Tbps carried over optical paths",
    status: "good",
    trend: "flat",
    delta: "-0.2 pts vs yesterday",
    explain: "Proportion of total delivered traffic carried on primary optical paths rather than fallback transport.",
    filter: { kind: "none" },
    spark: [97.1, 97.0, 97.2, 96.9, 96.8, 97.0, 96.9, 96.7, 96.8, 96.9, 96.8, 96.8],
  },
  {
    id: "fallback",
    title: "Services on RF Fallback",
    value: "14",
    sub: "9 planned, 5 weather-related",
    status: "watch",
    trend: "up",
    delta: "+3 vs previous period",
    explain: "Customer services currently delivered over RF fallback transport instead of their primary optical path.",
    filter: { kind: "status", value: "rf_fallback" },
    spark: [9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 14],
  },
  {
    id: "weather",
    title: "Weather Exposure",
    value: "23 links",
    sub: "Elevated risk within the next 12 hours",
    status: "watch",
    trend: "up",
    delta: "+8 links vs 6 hours ago",
    explain: "Links whose forecast visibility, rain rate or wind loading exceeds the safe operating envelope.",
    filter: { kind: "status", value: "at_risk" },
    spark: [9, 11, 12, 12, 14, 15, 17, 18, 20, 21, 22, 23],
  },
  {
    id: "situations",
    title: "Active Situations",
    value: "8",
    sub: "2 critical, 3 high, 3 moderate",
    status: "risk",
    trend: "up",
    delta: "+2 vs previous period",
    explain: "Correlated operational conditions with customer or service context, not raw alerts.",
    filter: { kind: "none" },
    spark: [5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8],
  },
  {
    id: "agents",
    title: "Agent Actions Today",
    value: "147",
    sub: "23 recoveries, 41 investigations, 83 preventive actions",
    status: "good",
    trend: "up",
    delta: "+19% vs daily average",
    explain: "Actions completed by digital coworkers under defined operating guardrails in the last 24 hours.",
    filter: { kind: "none" },
    spark: [58, 71, 79, 88, 96, 104, 112, 121, 129, 136, 142, 147],
  },
];

/* ------------------------------- Links -------------------------------- */

export interface OpticalLink {
  id: string;
  name: string;
  region: Region;
  product: Product;
  customer: Customer;
  service: string;
  status: LinkStatus;
  terminalA: string;
  terminalB: string;
  /** Equirectangular percentage coordinates for the simplified world map. */
  ax: number;
  ay: number;
  bx: number;
  by: number;
  distanceKm: number;
  committedGbps: number;
  throughputGbps: number;
  availability: string;
  beamLock: string;
  marginDb: string;
  rxPowerDbm: string;
  attenuationDb: string;
  visibilityKm: string;
  weatherRisk: string;
  rfFallback: string;
  sloStatus: string;
  agent: string;
  nextAction: string;
}

export const links: OpticalLink[] = [
  {
    id: "lnk-chennai-041",
    name: "Chennai Mobile Backhaul 041",
    region: "India",
    product: "Lightbridge",
    customer: "Bharat Mobility Networks",
    service: "10 Gbps mobile backhaul",
    status: "at_risk",
    terminalA: "Chennai Guindy Rooftop A",
    terminalB: "Chennai Perungudi Aggregation B",
    ax: 70.6, ay: 57.4, bx: 71.4, by: 58.6,
    distanceKm: 3.8,
    committedGbps: 10,
    throughputGbps: 8.6,
    availability: "99.982%",
    beamLock: "Locked — 6 h 12 m",
    marginDb: "7.4 dB (declining)",
    rxPowerDbm: "-24.8 dBm",
    attenuationDb: "3.1 dB/km",
    visibilityKm: "4.2 km, falling",
    weatherRisk: "Dense fog forecast within 6 hours",
    rfFallback: "Available — 6 Gbps usable",
    sloStatus: "Within objective, forecast breach in 6 h",
    agent: "Weather Risk Agent",
    nextAction: "Recommend preventive traffic transition to RF fallback",
  },
  {
    id: "lnk-mumbai-018",
    name: "Mumbai Metro Link 018",
    region: "India",
    product: "Lightbridge Pro",
    customer: "Metro Fiber Alliance",
    service: "Metro transport ring segment",
    status: "at_risk",
    terminalA: "Mumbai Lower Parel Tower",
    terminalB: "Mumbai Bandra East Hub",
    ax: 66.6, ay: 54.6, bx: 67.4, by: 55.4,
    distanceKm: 2.4,
    committedGbps: 20,
    throughputGbps: 14.1,
    availability: "99.991%",
    beamLock: "Locked — intermittent re-acquire",
    marginDb: "9.1 dB",
    rxPowerDbm: "-22.3 dBm",
    attenuationDb: "1.8 dB/km",
    visibilityKm: "11.6 km",
    weatherRisk: "Low",
    rfFallback: "Available — 10 Gbps usable",
    sloStatus: "Within objective",
    agent: "Beam Alignment Agent",
    nextAction: "Schedule mount inspection during maintenance window",
  },
  {
    id: "lnk-nairobi-007",
    name: "Nairobi Middle Mile 007",
    region: "East Africa",
    product: "Lightbridge",
    customer: "Rift Valley Telecom",
    service: "Middle mile aggregation",
    status: "rf_fallback",
    terminalA: "Nairobi Westlands Mast",
    terminalB: "Nairobi Karen Exchange",
    ax: 55.4, ay: 62.4, bx: 56.2, by: 63.4,
    distanceKm: 5.1,
    committedGbps: 10,
    throughputGbps: 4.2,
    availability: "99.948%",
    beamLock: "Unlocked — fallback engaged",
    marginDb: "2.2 dB",
    rxPowerDbm: "-31.6 dBm",
    attenuationDb: "6.4 dB/km",
    visibilityKm: "1.8 km",
    weatherRisk: "Heavy rain cell overhead",
    rfFallback: "Active — 42% capacity",
    sloStatus: "Latency objective at risk",
    agent: "RF Fallback Guardian",
    nextAction: "Hold fallback until rain cell clears, then validate optical return",
  },
  {
    id: "lnk-rio-023",
    name: "Rio Smart City Mesh 023",
    region: "Brazil",
    product: "Beam",
    customer: "Cidade Conectada",
    service: "Smart city mesh backhaul",
    status: "degraded",
    terminalA: "Rio Centro Mesh Node 4",
    terminalB: "Rio Botafogo Mesh Node 9",
    ax: 33.2, ay: 70.2, bx: 34.1, by: 71.1,
    distanceKm: 1.9,
    committedGbps: 5,
    throughputGbps: 4.7,
    availability: "99.902%",
    beamLock: "Locked",
    marginDb: "8.8 dB",
    rxPowerDbm: "-23.9 dBm",
    attenuationDb: "2.0 dB/km",
    visibilityKm: "14.0 km",
    weatherRisk: "Low",
    rfFallback: "Available — 3 Gbps usable",
    sloStatus: "Latency objective at risk",
    agent: "Capacity Optimization Agent",
    nextAction: "Rebalance mesh routes to adjacent node pair",
  },
  {
    id: "lnk-california-012",
    name: "California DCI Link 012",
    region: "United States",
    product: "Lightbridge Pro",
    customer: "Pacific Cloud Systems",
    service: "Data centre interconnect",
    status: "unavailable",
    terminalA: "San Jose DC Roof North",
    terminalB: "Santa Clara DC Roof East",
    ax: 15.4, ay: 40.2, bx: 16.2, by: 41.0,
    distanceKm: 6.7,
    committedGbps: 40,
    throughputGbps: 0,
    availability: "99.871%",
    beamLock: "Locked — optical healthy",
    marginDb: "12.6 dB",
    rxPowerDbm: "-19.4 dBm",
    attenuationDb: "0.9 dB/km",
    visibilityKm: "22.0 km",
    weatherRisk: "None",
    rfFallback: "Not engaged — upstream handoff down",
    sloStatus: "Breached",
    agent: "Optical Path Investigator",
    nextAction: "Escalate upstream fiber handoff to carrier partner",
  },
  {
    id: "lnk-central-africa-004",
    name: "Central Africa River Crossing 004",
    region: "Central Africa",
    product: "Lightbridge",
    customer: "Congo Basin Connect",
    service: "Cross-river trunk",
    status: "maintenance",
    terminalA: "Brazzaville North Mast",
    terminalB: "Kinshasa East Mast",
    ax: 50.4, ay: 62.0, bx: 51.0, by: 62.8,
    distanceKm: 4.6,
    committedGbps: 10,
    throughputGbps: 6.3,
    availability: "99.930%",
    beamLock: "Locked",
    marginDb: "10.2 dB",
    rxPowerDbm: "-21.8 dBm",
    attenuationDb: "1.6 dB/km",
    visibilityKm: "9.4 km",
    weatherRisk: "Moderate — afternoon storms",
    rfFallback: "Available — 6 Gbps usable",
    sloStatus: "Within objective",
    agent: "Global Link Health Agent",
    nextAction: "Complete scheduled mount torque check",
  },
  {
    id: "lnk-jakarta-031",
    name: "Jakarta Coastal Link 031",
    region: "Southeast Asia",
    product: "Beam",
    customer: "Metro Fiber Alliance",
    service: "Coastal mesh extension",
    status: "healthy",
    terminalA: "Jakarta Kota Node 2",
    terminalB: "Jakarta Tanjung Priok Node 5",
    ax: 77.8, ay: 65.4, bx: 78.6, by: 66.2,
    distanceKm: 3.2,
    committedGbps: 5,
    throughputGbps: 3.1,
    availability: "99.995%",
    beamLock: "Locked — 42 h",
    marginDb: "13.1 dB",
    rxPowerDbm: "-18.9 dBm",
    attenuationDb: "0.8 dB/km",
    visibilityKm: "18.2 km",
    weatherRisk: "Low",
    rfFallback: "Available — 3 Gbps usable",
    sloStatus: "Within objective",
    agent: "Global Link Health Agent",
    nextAction: "No action required",
  },
  {
    id: "lnk-frankfurt-009",
    name: "Frankfurt Enterprise Span 009",
    region: "Europe",
    product: "Lightbridge Pro",
    customer: "Pacific Cloud Systems",
    service: "Enterprise campus connectivity",
    status: "healthy",
    terminalA: "Frankfurt Westend Roof",
    terminalB: "Frankfurt Ostend Roof",
    ax: 48.6, ay: 33.0, bx: 49.4, by: 33.8,
    distanceKm: 2.8,
    committedGbps: 20,
    throughputGbps: 11.4,
    availability: "99.997%",
    beamLock: "Locked — 96 h",
    marginDb: "14.8 dB",
    rxPowerDbm: "-17.6 dBm",
    attenuationDb: "0.6 dB/km",
    visibilityKm: "20.4 km",
    weatherRisk: "Low",
    rfFallback: "Available — 10 Gbps usable",
    sloStatus: "Within objective",
    agent: "SLO Guardian",
    nextAction: "No action required",
  },
  {
    id: "lnk-bangalore-055",
    name: "Bengaluru Enterprise Ring 055",
    region: "India",
    product: "Beam",
    customer: "Bharat Mobility Networks",
    service: "Enterprise ring segment",
    status: "stale",
    terminalA: "Bengaluru Whitefield Node 1",
    terminalB: "Bengaluru Indiranagar Node 6",
    ax: 68.4, ay: 59.4, bx: 69.2, by: 60.2,
    distanceKm: 2.2,
    committedGbps: 5,
    throughputGbps: 2.8,
    availability: "Unknown — telemetry stale",
    beamLock: "Last reported locked",
    marginDb: "Last reported 11.4 dB",
    rxPowerDbm: "Last reported -20.6 dBm",
    attenuationDb: "Unknown",
    visibilityKm: "Unknown",
    weatherRisk: "Unknown",
    rfFallback: "Available — 3 Gbps usable",
    sloStatus: "Reporting gap 14 minutes",
    agent: "Telemetry Quality Agent",
    nextAction: "Restore telemetry ingestion for the Bengaluru collector",
  },
  {
    id: "lnk-singapore-026",
    name: "Singapore Port Link 026",
    region: "Southeast Asia",
    product: "Lightbridge",
    customer: "Metro Fiber Alliance",
    service: "Port logistics connectivity",
    status: "healthy",
    terminalA: "Singapore Tuas Mast",
    terminalB: "Singapore Jurong Hub",
    ax: 75.4, ay: 63.0, bx: 76.2, by: 63.6,
    distanceKm: 4.1,
    committedGbps: 10,
    throughputGbps: 6.9,
    availability: "99.994%",
    beamLock: "Locked — 58 h",
    marginDb: "12.9 dB",
    rxPowerDbm: "-19.1 dBm",
    attenuationDb: "0.9 dB/km",
    visibilityKm: "16.8 km",
    weatherRisk: "Low",
    rfFallback: "Available — 6 Gbps usable",
    sloStatus: "Within objective",
    agent: "Global Link Health Agent",
    nextAction: "No action required",
  },
];

/* ----------------------------- Situations ----------------------------- */

export interface Situation {
  id: string;
  title: string;
  severity: Severity;
  region: Region;
  product: Product;
  customer: Customer;
  service: string;
  likelyCause: string;
  customerImpact: string;
  agent: string;
  confidence: number;
  detectedAt: string;
  currentAction: string;
  linkId: string;
  summary: string;
  telemetry: { label: string; value: string }[];
  weatherContext: string;
  hypotheses: { cause: string; likelihood: number; basis: string }[];
  recommendation: string;
  evidence: string[];
  suggestedAction: string;
  approval: string;
}

export const situations: Situation[] = [
  {
    id: "sit-chennai",
    title: "Chennai optical route facing fog-related degradation risk",
    severity: "high",
    region: "India",
    product: "Lightbridge",
    customer: "Bharat Mobility Networks",
    service: "10 Gbps mobile backhaul",
    likelyCause: "Advection fog reducing visibility along the Guindy–Perungudi path",
    customerImpact: "10 Gbps mobile backhaul service at risk",
    agent: "Weather Risk Agent",
    confidence: 92,
    detectedAt: "06:12 local",
    currentAction: "Validating RF fallback capacity before recommending transition",
    linkId: "lnk-chennai-041",
    summary:
      "Forecast visibility on the Chennai Guindy–Perungudi optical route falls below 1.5 km within six hours. Link margin has declined 3.1 dB over the last four hours and is trending toward the fallback threshold.",
    telemetry: [
      { label: "Link margin", value: "7.4 dB (-3.1 dB / 4 h)" },
      { label: "Received power", value: "-24.8 dBm" },
      { label: "Throughput", value: "8.6 Gbps of 10 Gbps" },
      { label: "Beam lock", value: "Stable, 6 h 12 m" },
    ],
    weatherContext: "Coastal advection fog, visibility 4.2 km falling to 0.9 km by 12:00 local.",
    hypotheses: [
      { cause: "Atmospheric attenuation from dense fog", likelihood: 92, basis: "Visibility forecast plus margin decline correlation" },
      { cause: "Progressive mount misalignment", likelihood: 5, basis: "Beam lock has remained stable with no pointing corrections" },
      { cause: "Transceiver degradation", likelihood: 3, basis: "Transmit power nominal, no laser bias drift" },
    ],
    recommendation: "Pre-emptively transition the customer service to RF fallback before visibility crosses the fade threshold.",
    evidence: [
      "Visibility forecast from three independent regional sources",
      "Four hours of link margin telemetry",
      "RF fallback capacity validation: 6 Gbps usable, 0 competing services",
      "Historical fog events at this site: 11 of 12 resulted in optical fade",
    ],
    suggestedAction: "Transition Bharat Mobility Networks backhaul to RF fallback at 11:15 local, return to optical when visibility exceeds 3 km for 20 minutes.",
    approval: "Human approval required — customer-impacting transport change",
  },
  {
    id: "sit-mumbai",
    title: "Mumbai rooftop terminal showing progressive alignment drift",
    severity: "moderate",
    region: "India",
    product: "Lightbridge Pro",
    customer: "Metro Fiber Alliance",
    service: "Metro transport ring segment",
    likelyCause: "Thermal mount expansion on the Lower Parel tower",
    customerImpact: "No current impact",
    agent: "Beam Alignment Agent",
    confidence: 87,
    detectedAt: "04:48 local",
    currentAction: "Tracking pointing corrections against the diurnal temperature curve",
    linkId: "lnk-mumbai-018",
    summary:
      "Auto-alignment corrections on the Lower Parel terminal have increased from 4 to 19 per day over three weeks, following the diurnal temperature curve.",
    telemetry: [
      { label: "Pointing corrections", value: "19 / day (was 4)" },
      { label: "Link margin", value: "9.1 dB" },
      { label: "Re-acquire events", value: "2 in 24 h" },
      { label: "Throughput", value: "14.1 Gbps of 20 Gbps" },
    ],
    weatherContext: "Clear conditions, ambient swing of 11 °C across the day.",
    hypotheses: [
      { cause: "Thermal expansion of the mount assembly", likelihood: 87, basis: "Correction rate tracks temperature with a 40 minute lag" },
      { cause: "Structural sway of the host building", likelihood: 9, basis: "Wind loading low during correction peaks" },
      { cause: "Servo calibration drift", likelihood: 4, basis: "Servo self-test nominal" },
    ],
    recommendation: "Schedule a mount torque and shim inspection during the next planned maintenance window.",
    evidence: [
      "21 days of pointing correction telemetry",
      "Site ambient temperature series",
      "Comparable drift signature at two other rooftop sites",
    ],
    suggestedAction: "Raise a planned maintenance task; no traffic change required.",
    approval: "No approval required — planning action only",
  },
  {
    id: "sit-nairobi",
    title: "Nairobi service operating on RF fallback",
    severity: "high",
    region: "East Africa",
    product: "Lightbridge",
    customer: "Rift Valley Telecom",
    service: "Middle mile aggregation",
    likelyCause: "Convective rain cell producing deep optical fade",
    customerImpact: "Reduced capacity and increased latency",
    agent: "RF Fallback Guardian",
    confidence: 95,
    detectedAt: "08:03 local",
    currentAction: "Holding fallback and monitoring rain cell movement for optical return",
    linkId: "lnk-nairobi-007",
    summary:
      "The Westlands–Karen middle mile link faded below threshold at 08:03 local. Fallback engaged automatically within 900 ms and is carrying 4.2 Gbps of the 10 Gbps committed rate.",
    telemetry: [
      { label: "Fallback duration", value: "1 h 26 m" },
      { label: "Delivered capacity", value: "4.2 Gbps of 10 Gbps" },
      { label: "Added latency", value: "+6.4 ms" },
      { label: "Optical margin", value: "2.2 dB" },
    ],
    weatherContext: "Convective cell tracking east, expected to clear the path within 45 minutes.",
    hypotheses: [
      { cause: "Rain-induced optical attenuation", likelihood: 95, basis: "Rain rate 62 mm/h coincident with fade onset" },
      { cause: "Terminal window contamination", likelihood: 3, basis: "Pre-event margin was nominal" },
      { cause: "Receiver fault", likelihood: 2, basis: "Receiver self-test nominal" },
    ],
    recommendation: "Maintain fallback, then validate optical return once margin exceeds 8 dB for 10 minutes.",
    evidence: [
      "Rain radar sequence for the Nairobi corridor",
      "Fade onset and fallback switch telemetry",
      "Fallback capacity utilisation profile",
    ],
    suggestedAction: "Automated optical return once stability criteria are met.",
    approval: "Pre-approved automation — return within guardrails",
  },
  {
    id: "sit-rio",
    title: "Rio Beam mesh approaching peak capacity",
    severity: "moderate",
    region: "Brazil",
    product: "Beam",
    customer: "Cidade Conectada",
    service: "Smart city mesh backhaul",
    likelyCause: "Sustained growth in municipal camera and sensor traffic",
    customerImpact: "Latency objective at risk",
    agent: "Capacity Optimization Agent",
    confidence: 84,
    detectedAt: "Yesterday 19:40 local",
    currentAction: "Modelling mesh route rebalance across adjacent node pairs",
    linkId: "lnk-rio-023",
    summary:
      "Node pair 4–9 has run above 92% utilisation during the evening peak for six consecutive days, pushing queueing latency toward the customer objective.",
    telemetry: [
      { label: "Peak utilisation", value: "94% of 5 Gbps" },
      { label: "Queueing latency", value: "8.9 ms at peak" },
      { label: "Objective", value: "≤ 10 ms" },
      { label: "Growth", value: "+18% month over month" },
    ],
    weatherContext: "Not a weather-driven condition.",
    hypotheses: [
      { cause: "Organic traffic growth on municipal sensors", likelihood: 84, basis: "Steady month-over-month growth curve" },
      { cause: "Mesh route inefficiency", likelihood: 12, basis: "Two adjacent pairs below 40% utilisation" },
      { cause: "Misconfigured shaping policy", likelihood: 4, basis: "Policy unchanged for 90 days" },
    ],
    recommendation: "Rebalance a subset of mesh routes onto the adjacent under-used node pairs.",
    evidence: [
      "Six days of evening peak utilisation",
      "Mesh topology and per-pair headroom",
      "Latency objective attainment history",
    ],
    suggestedAction: "Apply mesh route rebalance during the 02:00 local low-traffic window.",
    approval: "Human approval required — customer topology change",
  },
  {
    id: "sit-california",
    title: "California optical link healthy, upstream fiber handoff unavailable",
    severity: "critical",
    region: "United States",
    product: "Lightbridge Pro",
    customer: "Pacific Cloud Systems",
    service: "Data centre interconnect",
    likelyCause: "Carrier partner fiber handoff outage at the San Jose facility",
    customerImpact: "Enterprise connectivity interrupted",
    agent: "Optical Path Investigator",
    confidence: 97,
    detectedAt: "02:21 local",
    currentAction: "Correlating optical health with upstream carrier state and preparing escalation evidence",
    linkId: "lnk-california-012",
    summary:
      "The optical span between San Jose and Santa Clara is fully healthy with 12.6 dB margin, but no traffic is passing. The fault is isolated to the upstream carrier fiber handoff.",
    telemetry: [
      { label: "Optical margin", value: "12.6 dB (nominal)" },
      { label: "Throughput", value: "0 Gbps of 40 Gbps" },
      { label: "Handoff port state", value: "Down since 02:21" },
      { label: "Beam lock", value: "Locked, stable" },
    ],
    weatherContext: "Clear, no weather contribution.",
    hypotheses: [
      { cause: "Upstream carrier fiber handoff outage", likelihood: 97, basis: "Handoff port down while optical span remains nominal" },
      { cause: "Customer edge device failure", likelihood: 2, basis: "Customer edge reachable on management plane" },
      { cause: "Optical terminal fault", likelihood: 1, basis: "All terminal diagnostics nominal" },
    ],
    recommendation: "Escalate to the carrier partner with optical health evidence to prevent misdirected field dispatch.",
    evidence: [
      "Optical span diagnostics showing nominal margin",
      "Handoff port state transitions",
      "Customer edge reachability checks",
    ],
    suggestedAction: "Raise a carrier escalation with attached evidence pack; notify the customer of the isolated fault domain.",
    approval: "Human approval required — external escalation",
  },
  {
    id: "sit-telemetry",
    title: "Regional telemetry ingestion delayed",
    severity: "moderate",
    region: "India",
    product: "Beam",
    customer: "Bharat Mobility Networks",
    service: "Enterprise ring segment",
    likelyCause: "Collector backlog in the Bengaluru ingestion pipeline",
    customerImpact: "No current impact — operational visibility reduced",
    agent: "Telemetry Quality Agent",
    confidence: 89,
    detectedAt: "09:31 local",
    currentAction: "Quantifying the visibility gap and suppressing false health signals",
    linkId: "lnk-bangalore-055",
    summary:
      "The Bengaluru collector is 14 minutes behind real time, affecting 38 links. Health state for these links is being reported as stale rather than healthy to avoid false assurance.",
    telemetry: [
      { label: "Ingestion lag", value: "14 minutes" },
      { label: "Links affected", value: "38" },
      { label: "Events queued", value: "412,000" },
      { label: "Confidence", value: "Reduced for the affected region" },
    ],
    weatherContext: "Not a weather-driven condition.",
    hypotheses: [
      { cause: "Collector processing backlog", likelihood: 89, basis: "Queue depth rising with normal event rate" },
      { cause: "Network path congestion to the collector", likelihood: 8, basis: "Transport latency within normal band" },
      { cause: "Schema change rejecting events", likelihood: 3, basis: "No parse error increase observed" },
    ],
    recommendation: "Scale the collector consumer group and replay the queued window.",
    evidence: [
      "Collector queue depth series",
      "Per-link last-reported timestamps",
      "Event parse error rate",
    ],
    suggestedAction: "Apply consumer scaling; mark the affected window as reduced confidence in reporting.",
    approval: "Pre-approved automation — platform scaling within guardrails",
  },
];

/* --------------------------- Predictive risk --------------------------- */

export interface PredictiveRisk {
  id: string;
  category: string;
  region: Region;
  horizon: "1h" | "6h" | "12h" | "24h";
  linksExposed: number;
  probability: number;
  confidence: number;
  timeToImpact: string;
  servicesExposed: string;
  recommendation: string;
  automation: "Eligible" | "Approval required" | "Not eligible";
  featured?: boolean;
}

export const predictiveRisks: PredictiveRisk[] = [
  { id: "risk-fog-chennai", category: "Fog", region: "India", horizon: "6h", linksExposed: 3, probability: 92, confidence: 92, timeToImpact: "5 h 40 m", servicesExposed: "One 10 Gbps customer service", recommendation: "Preventive traffic transition to RF fallback", automation: "Approval required", featured: true },
  { id: "risk-rain-nairobi", category: "Heavy rain", region: "East Africa", horizon: "1h", linksExposed: 5, probability: 78, confidence: 90, timeToImpact: "35 m", servicesExposed: "Two middle mile services", recommendation: "Hold RF fallback, pre-stage capacity", automation: "Eligible" },
  { id: "risk-wind-brazzaville", category: "Wind", region: "Central Africa", horizon: "12h", linksExposed: 4, probability: 54, confidence: 81, timeToImpact: "9 h", servicesExposed: "One trunk service", recommendation: "Raise pointing tolerance and pre-position field team", automation: "Approval required" },
  { id: "risk-vibration-mumbai", category: "Mount vibration", region: "India", horizon: "24h", linksExposed: 2, probability: 46, confidence: 79, timeToImpact: "18 h", servicesExposed: "One metro ring segment", recommendation: "Schedule mount inspection", automation: "Not eligible" },
  { id: "risk-drift-mumbai", category: "Alignment drift", region: "India", horizon: "24h", linksExposed: 6, probability: 61, confidence: 87, timeToImpact: "20 h", servicesExposed: "Three metro services", recommendation: "Apply adaptive pointing profile", automation: "Eligible" },
  { id: "risk-atten-jakarta", category: "Optical attenuation", region: "Southeast Asia", horizon: "12h", linksExposed: 7, probability: 44, confidence: 76, timeToImpact: "11 h", servicesExposed: "Two mesh services", recommendation: "Increase telemetry sampling on exposed spans", automation: "Eligible" },
  { id: "risk-capacity-rio", category: "Capacity pressure", region: "Brazil", horizon: "6h", linksExposed: 3, probability: 71, confidence: 84, timeToImpact: "4 h 20 m", servicesExposed: "Smart city mesh backhaul", recommendation: "Rebalance mesh routes ahead of the evening peak", automation: "Approval required" },
  { id: "risk-fallback-nairobi", category: "RF fallback saturation", region: "East Africa", horizon: "1h", linksExposed: 2, probability: 66, confidence: 88, timeToImpact: "50 m", servicesExposed: "One aggregation service", recommendation: "Shape non-critical traffic classes on fallback", automation: "Eligible" },
  { id: "risk-power-kinshasa", category: "Power instability", region: "Central Africa", horizon: "24h", linksExposed: 5, probability: 39, confidence: 72, timeToImpact: "16 h", servicesExposed: "Cross-river trunk", recommendation: "Verify battery reserve and generator readiness", automation: "Approval required" },
  { id: "risk-telemetry-bengaluru", category: "Telemetry loss", region: "India", horizon: "1h", linksExposed: 38, probability: 83, confidence: 89, timeToImpact: "Active now", servicesExposed: "Visibility only", recommendation: "Scale collector consumer group and replay backlog", automation: "Eligible" },
  { id: "risk-fog-europe", category: "Fog", region: "Europe", horizon: "12h", linksExposed: 4, probability: 35, confidence: 74, timeToImpact: "10 h", servicesExposed: "One enterprise campus service", recommendation: "Monitor only", automation: "Not eligible" },
  { id: "risk-rain-jakarta", category: "Heavy rain", region: "Southeast Asia", horizon: "6h", linksExposed: 6, probability: 58, confidence: 82, timeToImpact: "3 h 10 m", servicesExposed: "Port logistics connectivity", recommendation: "Validate fallback readiness", automation: "Eligible" },
];

export const riskCategories = [
  "Fog", "Heavy rain", "Wind", "Mount vibration", "Alignment drift",
  "Optical attenuation", "Capacity pressure", "RF fallback saturation",
  "Power instability", "Telemetry loss",
] as const;

/* --------------------------- Digital coworkers -------------------------- */

export interface Agent {
  id: string;
  name: string;
  task: string;
  status: "Active" | "Monitoring" | "Awaiting approval" | "Investigating";
  scope: string;
  confidence: number;
  actionsToday: number;
  awaitingApproval: number;
  lastOutcome: string;
  guardrail: "Within guardrails" | "Approval gate engaged";
  objective: string;
  queue: string[];
  decisions: string[];
  evidence: string[];
  recommendations: string[];
  completed: string[];
  pending: string[];
  guardrails: string[];
}

export const agents: Agent[] = [
  {
    id: "agent-global-health",
    name: "Global Link Health Agent",
    task: "Maintaining health state across 1,248 optical links",
    status: "Monitoring",
    scope: "1,248 links, 320 customer services",
    confidence: 96,
    actionsToday: 38,
    awaitingApproval: 0,
    lastOutcome: "Confirmed service recovery on Nairobi aggregation",
    guardrail: "Within guardrails",
    objective: "Maintain an accurate, current health state for every optical link and derived customer service.",
    queue: ["Re-baseline 14 links after firmware update", "Reconcile 38 stale links in Bengaluru"],
    decisions: ["Downgraded 6 links from healthy to stale pending telemetry", "Cleared 4 transient margin alerts as weather noise"],
    evidence: ["Per-link margin series", "Service dependency map", "Telemetry freshness index"],
    recommendations: ["Suppress duplicate alerting for the Bengaluru collector window"],
    completed: ["38 health state reconciliations"],
    pending: [],
    guardrails: ["Read-only on customer traffic", "No state change without corroborating telemetry"],
  },
  {
    id: "agent-weather",
    name: "Weather Risk Agent",
    task: "Correlating visibility forecasts with declining link margin",
    status: "Awaiting approval",
    scope: "23 weather-exposed links across 4 regions",
    confidence: 92,
    actionsToday: 21,
    awaitingApproval: 1,
    lastOutcome: "Recommended preventive transition for Chennai backhaul",
    guardrail: "Approval gate engaged",
    objective: "Predict weather-driven optical degradation early enough to protect customer services.",
    queue: ["Chennai fog event — awaiting approval", "Nairobi rain cell — tracking", "Jakarta convective outlook — modelling"],
    decisions: ["Raised Chennai risk from moderate to high at 06:12", "Discounted alignment drift as a contributing cause"],
    evidence: ["Three independent visibility forecasts", "Four hours of margin telemetry", "12 historical fog events at the site"],
    recommendations: ["Transition Chennai backhaul to RF fallback at 11:15 local"],
    completed: ["21 forecast correlations"],
    pending: ["Chennai preventive traffic transition"],
    guardrails: ["Customer-impacting transport changes require human approval", "No action when fallback capacity is unvalidated"],
  },
  {
    id: "agent-path",
    name: "Optical Path Investigator",
    task: "Investigating upstream fiber handoff failure",
    status: "Investigating",
    scope: "California DCI Link 012",
    confidence: 97,
    actionsToday: 14,
    awaitingApproval: 1,
    lastOutcome: "Isolated fault domain to the carrier partner handoff",
    guardrail: "Approval gate engaged",
    objective: "Determine the true fault domain for service-affecting conditions before dispatch or escalation.",
    queue: ["California DCI escalation pack", "Rio mesh path verification"],
    decisions: ["Excluded optical terminal fault", "Excluded customer edge failure"],
    evidence: ["Optical span diagnostics", "Handoff port state history", "Customer edge reachability"],
    recommendations: ["Escalate to the carrier partner rather than dispatching a field team"],
    completed: ["14 path investigations"],
    pending: ["Carrier escalation approval"],
    guardrails: ["External escalation requires human approval", "Evidence pack must accompany every escalation"],
  },
  {
    id: "agent-alignment",
    name: "Beam Alignment Agent",
    task: "Detecting long-term alignment drift",
    status: "Active",
    scope: "184 rooftop terminals",
    confidence: 87,
    actionsToday: 26,
    awaitingApproval: 0,
    lastOutcome: "Raised planned maintenance for Mumbai Lower Parel mount",
    guardrail: "Within guardrails",
    objective: "Detect mechanical and thermal drift before it becomes customer-visible.",
    queue: ["Mumbai mount inspection request", "Two Brazil rooftops under observation"],
    decisions: ["Classified Mumbai drift as thermal rather than structural"],
    evidence: ["21 days of pointing corrections", "Ambient temperature series"],
    recommendations: ["Mount torque and shim inspection in the next maintenance window"],
    completed: ["26 drift assessments"],
    pending: [],
    guardrails: ["Pointing adjustments limited to defined tolerance", "No physical dispatch without human review"],
  },
  {
    id: "agent-fallback",
    name: "RF Fallback Guardian",
    task: "Validating available RF fallback capacity",
    status: "Active",
    scope: "14 services currently on fallback",
    confidence: 95,
    actionsToday: 19,
    awaitingApproval: 0,
    lastOutcome: "Validated 6 Gbps usable fallback for Chennai backhaul",
    guardrail: "Within guardrails",
    objective: "Guarantee that fallback transport is genuinely available and sized before it is relied upon.",
    queue: ["Chennai fallback reservation", "Nairobi fallback saturation watch"],
    decisions: ["Reserved 6 Gbps on the Chennai fallback path", "Shaped two non-critical classes in Nairobi"],
    evidence: ["Fallback capacity inventory", "Competing service utilisation", "Historical fallback throughput"],
    recommendations: ["Hold Nairobi fallback until rain cell clears"],
    completed: ["19 capacity validations"],
    pending: [],
    guardrails: ["Never report fallback available without a live capacity check", "Automated return only within stability criteria"],
  },
  {
    id: "agent-customer",
    name: "Customer Impact Agent",
    task: "Calculating customer SLO exposure",
    status: "Active",
    scope: "320 customer services, 6 customers at risk",
    confidence: 91,
    actionsToday: 17,
    awaitingApproval: 0,
    lastOutcome: "Quantified 42 minutes of avoidable outage for Bharat Mobility Networks",
    guardrail: "Within guardrails",
    objective: "Translate technical conditions into customer and contractual impact.",
    queue: ["Chennai impact model refresh", "California DCI customer notification draft"],
    decisions: ["Rated Chennai exposure as high, single service, 10 Gbps"],
    evidence: ["Service dependency map", "Contractual objectives", "Historical impact outcomes"],
    recommendations: ["Notify Bharat Mobility Networks of planned preventive transition"],
    completed: ["17 impact calculations"],
    pending: [],
    guardrails: ["Customer notifications require human release", "No contractual interpretation without source reference"],
  },
  {
    id: "agent-slo",
    name: "SLO Guardian",
    task: "Recomputing error budget consumption across regions",
    status: "Monitoring",
    scope: "320 services, 7 regions",
    confidence: 94,
    actionsToday: 8,
    awaitingApproval: 0,
    lastOutcome: "Global error budget remaining held at 72%",
    guardrail: "Within guardrails",
    objective: "Keep error budget accounting accurate and forward looking.",
    queue: ["Recompute after Chennai scenario", "Monthly budget rollup"],
    decisions: ["Attributed 12 minutes of budget burn to the California handoff outage"],
    evidence: ["Availability series", "Objective definitions", "Incident attribution records"],
    recommendations: ["Freeze non-essential change in the United States region this week"],
    completed: ["8 budget recalculations"],
    pending: [],
    guardrails: ["Budget attribution requires an incident record", "No objective changes without governance approval"],
  },
  {
    id: "agent-telemetry",
    name: "Telemetry Quality Agent",
    task: "Identifying missing telemetry events",
    status: "Active",
    scope: "38 links with reduced confidence",
    confidence: 89,
    actionsToday: 4,
    awaitingApproval: 0,
    lastOutcome: "Marked Bengaluru window as reduced confidence",
    guardrail: "Within guardrails",
    objective: "Prevent false assurance by exposing gaps in observability.",
    queue: ["Scale Bengaluru collector", "Replay 412,000 queued events"],
    decisions: ["Reported affected links as stale rather than healthy"],
    evidence: ["Collector queue depth", "Last-reported timestamps", "Parse error rate"],
    recommendations: ["Scale consumer group and replay the queued window"],
    completed: ["4 quality interventions"],
    pending: [],
    guardrails: ["Platform scaling only within pre-approved limits", "Never infer health from absent telemetry"],
  },
];

/* ---------------------------- Traffic analytics ------------------------- */

export interface TrafficPoint {
  t: string;
  optical: number;
  rf: number;
  altOptical: number;
  fiber: number;
}

export const trafficSeries: TrafficPoint[] = Array.from({ length: 25 }, (_, i) => {
  const base = 34 + Math.sin(i / 3.2) * 5.2 + i * 0.12;
  const rf = 0.9 + (i > 14 && i < 21 ? 0.9 : 0) + Math.sin(i / 2) * 0.18;
  return {
    t: `${String(i).padStart(2, "0")}:00`,
    optical: Number(base.toFixed(2)),
    rf: Number(rf.toFixed(2)),
    altOptical: Number((2.4 + Math.sin(i / 4) * 0.6).toFixed(2)),
    fiber: Number((1.1 + Math.cos(i / 5) * 0.3).toFixed(2)),
  };
});

export interface TransportSlice {
  name: string;
  throughput: string;
  share: number;
  services: number;
  headroom: string;
  color: string;
}

export const transportMix: TransportSlice[] = [
  { name: "Lightbridge", throughput: "18.4 Tbps", share: 43.2, services: 141, headroom: "31%", color: "#4f46e5" },
  { name: "Lightbridge Pro", throughput: "14.1 Tbps", share: 33.1, services: 96, headroom: "38%", color: "#0284c7" },
  { name: "Beam", throughput: "8.7 Tbps", share: 20.5, services: 69, headroom: "22%", color: "#059669" },
  { name: "RF fallback", throughput: "0.9 Tbps", share: 2.1, services: 14, headroom: "46%", color: "#d97706" },
  { name: "Other backup paths", throughput: "0.5 Tbps", share: 1.1, services: 8, headroom: "63%", color: "#64748b" },
];

/* ------------------------------- Outcomes ------------------------------- */

export interface Outcome {
  id: string;
  label: string;
  value: string;
  sub: string;
}

export const outcomes: Outcome[] = [
  { id: "protected", label: "Customers Protected Today", value: "18", sub: "Preventive action taken before customer impact" },
  { id: "minutes", label: "Outage Minutes Avoided", value: "1,420", sub: "Modelled against historical event outcomes" },
  { id: "capacity", label: "Capacity Protected", value: "86 Gbps", sub: "Committed capacity kept within objective" },
  { id: "recoveries", label: "Autonomous Recoveries", value: "23", sub: "Completed within pre-approved guardrails" },
  { id: "field", label: "Field Visits Avoided", value: "7", sub: "Fault domain isolated before dispatch" },
  { id: "budget", label: "Global Error Budget Remaining", value: "72%", sub: "Across 320 customer services this period" },
];

export interface ReliabilityMetric {
  label: string;
  value: string;
  target: string;
  attainment: number;
  trend: "up" | "down" | "flat";
}

export const reliabilityMetrics: ReliabilityMetric[] = [
  { label: "Service availability", value: "99.982%", target: "99.950%", attainment: 96, trend: "up" },
  { label: "Optical link availability", value: "99.941%", target: "99.900%", attainment: 92, trend: "up" },
  { label: "Mean time to detect", value: "48 s", target: "≤ 120 s", attainment: 94, trend: "up" },
  { label: "Mean time to diagnose", value: "3 m 20 s", target: "≤ 10 m", attainment: 89, trend: "up" },
  { label: "Mean time to restore", value: "11 m 40 s", target: "≤ 30 m", attainment: 87, trend: "flat" },
  { label: "Autonomous remediation rate", value: "64%", target: "≥ 55%", attainment: 91, trend: "up" },
  { label: "RF fallback duration", value: "1 h 26 m avg", target: "≤ 2 h", attainment: 78, trend: "down" },
  { label: "Error budget consumption", value: "28%", target: "≤ 40%", attainment: 84, trend: "flat" },
];

/* ------------------------------- Timeline ------------------------------- */

export interface TimelineEventRow {
  id: string;
  at: string;
  type: string;
  actor: string;
  service: string;
  outcome: string;
  status: "Complete" | "In progress" | "Awaiting approval" | "Recorded";
  detail: string;
}

export const timelineEvents: TimelineEventRow[] = [
  { id: "tl-1", at: "10:42:18", type: "Weather risk detected", actor: "Weather Risk Agent", service: "Chennai Mobile Backhaul 041", outcome: "Risk raised to high, 92% probability", status: "Complete", detail: "Visibility forecast crossed the 1.5 km threshold within the six hour horizon while link margin declined 3.1 dB over four hours." },
  { id: "tl-2", at: "10:43:02", type: "Customer impact calculated", actor: "Customer Impact Agent", service: "Bharat Mobility Networks", outcome: "One 10 Gbps service exposed", status: "Complete", detail: "Service dependency mapping identified a single customer service with contractual availability exposure of 42 minutes." },
  { id: "tl-3", at: "10:44:31", type: "Optical path investigation started", actor: "Optical Path Investigator", service: "California DCI Link 012", outcome: "Fault domain isolated upstream", status: "Complete", detail: "Optical diagnostics nominal at 12.6 dB margin; the handoff port has been down since 02:21 local." },
  { id: "tl-4", at: "10:46:07", type: "RF fallback capacity validated", actor: "RF Fallback Guardian", service: "Chennai Mobile Backhaul 041", outcome: "6 Gbps usable, reservation held", status: "Complete", detail: "Live capacity check confirmed fallback headroom with no competing customer services on the path." },
  { id: "tl-5", at: "10:47:55", type: "Human approval requested", actor: "Weather Risk Agent", service: "Chennai Mobile Backhaul 041", outcome: "Preventive transition pending approval", status: "Awaiting approval", detail: "Customer-impacting transport change requires human approval under the current operating guardrails." },
  { id: "tl-6", at: "10:52:12", type: "Traffic transitioned", actor: "S. Rao — Network Operations", service: "Nairobi Middle Mile 007", outcome: "Fallback engaged in 900 ms", status: "Complete", detail: "Automatic fallback engaged at fade onset; delivered capacity 4.2 Gbps with 6.4 ms added latency." },
  { id: "tl-7", at: "10:55:40", type: "Customer service validated", actor: "Global Link Health Agent", service: "Rift Valley Telecom", outcome: "Service reachable, reduced capacity", status: "Complete", detail: "End to end synthetic transactions confirmed service continuity during the fallback window." },
  { id: "tl-8", at: "10:58:03", type: "SLO impact recalculated", actor: "SLO Guardian", service: "Global", outcome: "Error budget remaining 72%", status: "Complete", detail: "Attribution applied 12 minutes of burn to the California handoff outage; no burn attributed to the Nairobi fallback." },
  { id: "tl-9", at: "11:01:26", type: "Evidence stored", actor: "Optical Path Investigator", service: "Pacific Cloud Systems", outcome: "Escalation pack ready", status: "Recorded", detail: "Diagnostics, port state history and reachability checks were bundled into a carrier escalation pack." },
  { id: "tl-10", at: "11:03:44", type: "Operational knowledge updated", actor: "Beam Alignment Agent", service: "Mumbai Metro Link 018", outcome: "Thermal drift signature recorded", status: "Recorded", detail: "The drift signature was added to the pattern library and matched against two comparable rooftop sites." },
];

/* --------------------------- Chennai scenario --------------------------- */

export interface ScenarioStep {
  id: string;
  label: string;
  detail: string;
  actor: string;
  requiresApproval?: boolean;
  timelineType: string;
  timelineOutcome: string;
}

export const chennaiScenario: ScenarioStep[] = [
  { id: "s1", label: "Weather risk detected", detail: "Dense fog forecast on the Guindy–Perungudi route within six hours.", actor: "Weather Risk Agent", timelineType: "Weather risk detected", timelineOutcome: "Risk raised to high, 92% probability" },
  { id: "s2", label: "Link margin decline identified", detail: "Link margin has fallen 3.1 dB over four hours to 7.4 dB.", actor: "Global Link Health Agent", timelineType: "Link margin decline identified", timelineOutcome: "Margin trending toward fallback threshold" },
  { id: "s3", label: "Customer impact calculated", detail: "One 10 Gbps mobile backhaul service exposed, 42 minutes of avoidable outage.", actor: "Customer Impact Agent", timelineType: "Customer impact calculated", timelineOutcome: "One customer service exposed" },
  { id: "s4", label: "RF fallback capacity validated", detail: "6 Gbps usable fallback confirmed and reserved.", actor: "RF Fallback Guardian", timelineType: "RF fallback capacity validated", timelineOutcome: "6 Gbps usable, reservation held" },
  { id: "s5", label: "Preventive action recommended", detail: "Transition the customer service to RF fallback at 11:15 local.", actor: "Weather Risk Agent", timelineType: "Preventive action recommended", timelineOutcome: "Preventive transition proposed" },
  { id: "s6", label: "Human approval requested", detail: "Customer-impacting transport change requires approval.", actor: "Weather Risk Agent", requiresApproval: true, timelineType: "Human approval requested", timelineOutcome: "Awaiting operator decision" },
  { id: "s7", label: "Traffic transition simulated", detail: "Traffic moved to RF fallback with no packet loss observed.", actor: "RF Fallback Guardian", timelineType: "Traffic transitioned", timelineOutcome: "Transition completed, 0 packets lost" },
  { id: "s8", label: "Service health validated", detail: "Synthetic transactions confirm customer service continuity.", actor: "Global Link Health Agent", timelineType: "Customer service validated", timelineOutcome: "Service healthy on fallback" },
  { id: "s9", label: "Customer impact avoided", detail: "42 minutes of customer outage avoided for Bharat Mobility Networks.", actor: "Customer Impact Agent", timelineType: "Customer impact avoided", timelineOutcome: "42 outage minutes avoided" },
  { id: "s10", label: "Outcome recorded", detail: "Evidence stored and the operating knowledge base updated.", actor: "SLO Guardian", timelineType: "Outcome recorded", timelineOutcome: "Evidence stored, error budget protected" },
];

export const statusLabels: Record<LinkStatus, string> = {
  healthy: "Healthy",
  at_risk: "At risk",
  degraded: "Degraded",
  unavailable: "Unavailable",
  rf_fallback: "On RF fallback",
  maintenance: "Under maintenance",
  stale: "Telemetry stale",
};

export const statusColors: Record<LinkStatus, string> = {
  healthy: "#059669",
  at_risk: "#d97706",
  degraded: "#ea580c",
  unavailable: "#e11d48",
  rf_fallback: "#0284c7",
  maintenance: "#7c3aed",
  stale: "#64748b",
};

export const severityChip: Record<Severity, string> = {
  critical: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-700 border-slate-200",
};
