/**
 * Weather Intelligence Twin — synthetic demonstration fixtures.
 *
 * Terra Communications demonstration environment. No production connection.
 * Identifiers for links, customers, services, regions, products and agents
 * are kept consistent with the other Agentic SRE NOC pages.
 */

/* ----------------------------- filter options ---------------------------- */

export const WIT_REGIONS = [
  "All regions", "Chennai", "Mumbai", "Gulf of Guinea", "Rio de Janeiro",
  "Southeast Asia", "California", "Nairobi", "Johannesburg", "Dubai", "London",
] as const;

export const WIT_PRODUCTS = ["All products", "Lightbridge", "Lightbridge Pro", "Beam"] as const;

export const WIT_HORIZONS = [
  "Next hour", "Next 6 hours", "Next 12 hours", "Next 24 hours", "Next 48 hours", "Next 7 days",
] as const;

export const WIT_DRIVERS = [
  "All drivers", "Dense fog", "Low visibility", "Heavy rain", "High humidity", "Wind",
  "Structural vibration", "Dust or smoke", "Snow", "Atmospheric turbulence", "Convective activity",
] as const;

export const WIT_LINK_STATUS = [
  "All link states", "Healthy", "Under watch", "At risk", "Degraded", "On fallback", "No data",
] as const;

export const WIT_CUSTOMERS = [
  "All customers", "Rift Valley Telecom", "Coastal Data Networks", "Meridian Financial",
  "Southern Cross Media", "Harbour Logistics", "Deccan Cloud Services",
] as const;

export const WIT_SAVED_VIEWS = [
  "Default weather view", "Fog exposure review", "Monsoon corridor watch", "Low-confidence predictions",
] as const;

/* ------------------------------- risk states ----------------------------- */

export type WeatherRiskState =
  | "Low" | "Moderate" | "High" | "Severe" | "No data"
  | "Monitoring" | "Preventive action active" | "Risk mitigated";

export const weatherRiskColors: Record<WeatherRiskState, string> = {
  Low: "#059669",
  Moderate: "#d97706",
  High: "#ea580c",
  Severe: "#e11d48",
  "No data": "#94a3b8",
  Monitoring: "#2563eb",
  "Preventive action active": "#7c3aed",
  "Risk mitigated": "#0d9488",
};

/* ---------------------------------- KPIs --------------------------------- */

export interface WitKpi {
  id: string;
  title: string;
  value: string;
  sub: string;
  status: "good" | "watch" | "risk";
  trend: "up" | "down" | "flat";
  prior: string;
  timestamp: string;
  explain: string;
  spark: number[];
  filter: { kind: "none" | "state" | "driver"; value?: string };
}

export const witKpis: WitKpi[] = [
  {
    id: "systems", title: "Weather Systems", value: "14", sub: "Active and tracked",
    status: "watch", trend: "up", prior: "12 yesterday", timestamp: "09:38 UTC",
    explain: "Distinct atmospheric systems currently tracked across monitored optical corridors.",
    spark: [9, 10, 11, 11, 12, 13, 14], filter: { kind: "none" },
  },
  {
    id: "watch", title: "Links Under Watch", value: "68", sub: "12 more than yesterday",
    status: "watch", trend: "up", prior: "56 yesterday", timestamp: "09:40 UTC",
    explain: "Optical links inside an active weather watch boundary with elevated monitoring frequency.",
    spark: [44, 48, 51, 55, 56, 62, 68], filter: { kind: "state", value: "Under watch" },
  },
  {
    id: "atrisk", title: "At-Risk Links", value: "23", sub: "6 more than yesterday",
    status: "risk", trend: "up", prior: "17 yesterday", timestamp: "09:41 UTC",
    explain: "Links with a confidence-scored prediction of margin loss within the selected risk horizon.",
    spark: [12, 14, 15, 16, 17, 20, 23], filter: { kind: "state", value: "At risk" },
  },
  {
    id: "capacity", title: "Predicted Capacity Impact", value: "286 Gbps", sub: "Potential exposure within 48 hours",
    status: "risk", trend: "up", prior: "214 Gbps yesterday", timestamp: "09:38 UTC",
    explain: "Committed capacity on links predicted to degrade before preventive action is applied.",
    spark: [180, 192, 201, 214, 236, 262, 286], filter: { kind: "none" },
  },
  {
    id: "confidence", title: "Model Confidence", value: "94%", sub: "Across current active predictions",
    status: "good", trend: "flat", prior: "93% yesterday", timestamp: "09:38 UTC",
    explain: "Weighted mean confidence across active predictions, reduced when source data is stale.",
    spark: [92, 93, 93, 94, 94, 93, 94], filter: { kind: "none" },
  },
  {
    id: "run", title: "Last Model Run", value: "09:38 UTC", sub: "Completed successfully",
    status: "good", trend: "flat", prior: "08:38 UTC prior run", timestamp: "09:38 UTC",
    explain: "Most recent hourly forecast run, including alignment, feature calculation and scoring.",
    spark: [1, 1, 1, 1, 1, 1, 1], filter: { kind: "none" },
  },
];

/* ------------------------------ weather systems -------------------------- */

export interface WeatherSystem {
  id: string;
  region: string;
  name: string;
  driver: string;
  secondaryDriver: string;
  state: WeatherRiskState;
  /** Percentage coordinates on the simplified equirectangular canvas. */
  x: number;
  y: number;
  radius: number;
  linksUnderWatch: number;
  linksAtRisk: number;
  capacityExposed: string;
  servicesExposed: number;
  visibilityKm: string;
  forecastVisibilityKm: string;
  humidity: string;
  rainfall: string;
  windKph: string;
  watchActive: boolean;
  fallbackReady: boolean;
  dataGap: boolean;
  linkIds: string[];
}

export const weatherSystems: WeatherSystem[] = [
  {
    id: "WS-01", region: "Chennai", name: "South India dense fog cell", driver: "Dense fog",
    secondaryDriver: "High humidity", state: "High", x: 70.5, y: 52, radius: 5,
    linksUnderWatch: 12, linksAtRisk: 6, capacityExposed: "160 Gbps", servicesExposed: 9,
    visibilityKm: "8.6 km", forecastVisibilityKm: "1.8 km", humidity: "72% to 94%",
    rainfall: "0.2 mm/h", windKph: "12 km/h", watchActive: true, fallbackReady: true, dataGap: false,
    linkIds: ["CHN-MBL-041", "CHN-MBL-042", "CHN-PDY-018", "CHN-BLR-007", "CHN-VZG-022", "CHN-TRV-030"],
  },
  {
    id: "WS-02", region: "Mumbai", name: "Central India visibility degradation", driver: "Low visibility",
    secondaryDriver: "Dust or smoke", state: "Moderate", x: 67.5, y: 48, radius: 4,
    linksUnderWatch: 9, linksAtRisk: 4, capacityExposed: "69 Gbps", servicesExposed: 6,
    visibilityKm: "6.2 km", forecastVisibilityKm: "2.4 km", humidity: "68% to 88%",
    rainfall: "0.0 mm/h", windKph: "16 km/h", watchActive: true, fallbackReady: true, dataGap: false,
    linkIds: ["MUM-PUN-011", "MUM-AHM-014", "MUM-NAG-021", "MUM-GOA-009"],
  },
  {
    id: "WS-03", region: "Gulf of Guinea", name: "Gulf coast convective rainband", driver: "Heavy rain",
    secondaryDriver: "Atmospheric turbulence", state: "Moderate", x: 49.5, y: 57, radius: 4.5,
    linksUnderWatch: 11, linksAtRisk: 5, capacityExposed: "48 Gbps", servicesExposed: 5,
    visibilityKm: "9.4 km", forecastVisibilityKm: "5.1 km", humidity: "81% to 92%",
    rainfall: "15 to 30 mm/h", windKph: "28 km/h", watchActive: true, fallbackReady: false, dataGap: false,
    linkIds: ["GOG-LOS-004", "GOG-ACC-006", "GOG-ABJ-012", "GOG-LBV-017", "GOG-DLA-019"],
  },
  {
    id: "WS-04", region: "Rio de Janeiro", name: "Brazil coastal humidity mass", driver: "High humidity",
    secondaryDriver: "Atmospheric turbulence", state: "Low", x: 33.5, y: 66, radius: 3.6,
    linksUnderWatch: 7, linksAtRisk: 3, capacityExposed: "34 Gbps", servicesExposed: 4,
    visibilityKm: "11.2 km", forecastVisibilityKm: "9.6 km", humidity: "84% to 93%",
    rainfall: "0.4 mm/h", windKph: "9 km/h", watchActive: true, fallbackReady: true, dataGap: false,
    linkIds: ["RIO-SAO-003", "RIO-BHZ-015", "RIO-CWB-024"],
  },
  {
    id: "WS-05", region: "Southeast Asia", name: "Equatorial convective cells", driver: "Convective activity",
    secondaryDriver: "Heavy rain", state: "Low", x: 78.5, y: 57, radius: 4,
    linksUnderWatch: 6, linksAtRisk: 2, capacityExposed: "17 Gbps", servicesExposed: 3,
    visibilityKm: "10.1 km", forecastVisibilityKm: "7.8 km", humidity: "79% to 90%",
    rainfall: "6 to 12 mm/h", windKph: "22 km/h", watchActive: true, fallbackReady: true, dataGap: false,
    linkIds: ["SEA-SIN-002", "SEA-KUL-013"],
  },
  {
    id: "WS-06", region: "California", name: "Pacific coast marine layer", driver: "Low visibility",
    secondaryDriver: "Dust or smoke", state: "Monitoring", x: 15.5, y: 39, radius: 3.4,
    linksUnderWatch: 8, linksAtRisk: 1, capacityExposed: "12 Gbps", servicesExposed: 2,
    visibilityKm: "7.8 km", forecastVisibilityKm: "6.4 km", humidity: "74% to 80%",
    rainfall: "0.0 mm/h", windKph: "14 km/h", watchActive: false, fallbackReady: true, dataGap: false,
    linkIds: ["CAL-SFO-001", "CAL-LAX-008"],
  },
  {
    id: "WS-07", region: "Nairobi", name: "East African highland rain", driver: "Heavy rain",
    secondaryDriver: "Wind", state: "Moderate", x: 57.5, y: 58, radius: 3.4,
    linksUnderWatch: 6, linksAtRisk: 2, capacityExposed: "21 Gbps", servicesExposed: 3,
    visibilityKm: "8.9 km", forecastVisibilityKm: "4.7 km", humidity: "76% to 89%",
    rainfall: "9 to 18 mm/h", windKph: "31 km/h", watchActive: false, fallbackReady: true, dataGap: false,
    linkIds: ["NBO-MBA-005", "NBO-KIS-016"],
  },
  {
    id: "WS-08", region: "Johannesburg", name: "Highveld wind and dust", driver: "Wind",
    secondaryDriver: "Dust or smoke", state: "Low", x: 55.5, y: 69, radius: 3.2,
    linksUnderWatch: 4, linksAtRisk: 0, capacityExposed: "0 Gbps", servicesExposed: 0,
    visibilityKm: "12.4 km", forecastVisibilityKm: "10.8 km", humidity: "38% to 44%",
    rainfall: "0.0 mm/h", windKph: "42 km/h", watchActive: false, fallbackReady: true, dataGap: false,
    linkIds: ["JNB-DUR-010"],
  },
  {
    id: "WS-09", region: "Dubai", name: "Gulf dust advection", driver: "Dust or smoke",
    secondaryDriver: "Wind", state: "No data", x: 62.5, y: 46, radius: 3.2,
    linksUnderWatch: 3, linksAtRisk: 0, capacityExposed: "0 Gbps", servicesExposed: 0,
    visibilityKm: "Unavailable", forecastVisibilityKm: "Unavailable", humidity: "Unavailable",
    rainfall: "Unavailable", windKph: "26 km/h", watchActive: false, fallbackReady: true, dataGap: true,
    linkIds: ["DXB-AUH-020"],
  },
  {
    id: "WS-10", region: "London", name: "North Atlantic frontal system", driver: "Heavy rain",
    secondaryDriver: "Wind", state: "Risk mitigated", x: 48.5, y: 32, radius: 3.4,
    linksUnderWatch: 2, linksAtRisk: 0, capacityExposed: "0 Gbps", servicesExposed: 0,
    visibilityKm: "9.8 km", forecastVisibilityKm: "8.2 km", humidity: "82% to 86%",
    rainfall: "3 to 6 mm/h", windKph: "34 km/h", watchActive: false, fallbackReady: true, dataGap: false,
    linkIds: ["LON-AMS-023"],
  },
];

/* ---------------------------------- links -------------------------------- */

export interface WeatherLink {
  id: string;
  name: string;
  region: string;
  product: string;
  service: string;
  customer: string;
  terminalA: string;
  terminalB: string;
  distanceKm: string;
  visibilityKm: string;
  forecastVisibilityKm: string;
  fogDensity: string;
  rainfall: string;
  humidity: string;
  windKph: string;
  vibration: string;
  rxPowerDbm: string;
  marginDb: string;
  attenuationDb: string;
  degradationTime: string;
  probability: number;
  confidence: number;
  capacityExposed: string;
  servicesExposed: number;
  fallback: string;
  recommendation: string;
  evidenceCount: number;
  dataFreshness: string;
  state: WeatherRiskState;
  driver: string;
  ax: number; ay: number; bx: number; by: number;
}

export const weatherLinks: WeatherLink[] = [
  {
    id: "CHN-MBL-041", name: "Chennai to Mahabalipuram coastal span", region: "Chennai",
    product: "Lightbridge Pro", service: "Deccan Cloud Interconnect", customer: "Deccan Cloud Services",
    terminalA: "TRM-CHN-118", terminalB: "TRM-MBL-042", distanceKm: "48.2 km",
    visibilityKm: "8.6 km", forecastVisibilityKm: "1.8 km", fogDensity: "Low, forecast high",
    rainfall: "0.2 mm/h, forecast 0.8 mm/h", humidity: "72%, forecast 94%", windKph: "12 km/h, forecast 8 km/h",
    vibration: "Nominal, 0.4 mm/s", rxPowerDbm: "-21.4 dBm", marginDb: "7.4 dB",
    attenuationDb: "2.1 dB, forecast 6.8 dB", degradationTime: "Approximately six hours",
    probability: 92, confidence: 94, capacityExposed: "40 Gbps", servicesExposed: 3,
    fallback: "Ready, 9 Gbps headroom", recommendation: "Pre-position RF fallback and raise monitoring frequency",
    evidenceCount: 14, dataFreshness: "1 minute", state: "High", driver: "Dense fog",
    ax: 70.2, ay: 51.6, bx: 71.4, by: 52.6,
  },
  {
    id: "CHN-MBL-042", name: "Chennai to Mahabalipuram protection span", region: "Chennai",
    product: "Lightbridge Pro", service: "Deccan Cloud Interconnect", customer: "Deccan Cloud Services",
    terminalA: "TRM-CHN-119", terminalB: "TRM-MBL-043", distanceKm: "49.1 km",
    visibilityKm: "8.4 km", forecastVisibilityKm: "1.9 km", fogDensity: "Low, forecast high",
    rainfall: "0.2 mm/h, forecast 0.8 mm/h", humidity: "73%, forecast 94%", windKph: "12 km/h, forecast 8 km/h",
    vibration: "Nominal, 0.3 mm/s", rxPowerDbm: "-21.9 dBm", marginDb: "7.1 dB",
    attenuationDb: "2.3 dB, forecast 7.0 dB", degradationTime: "Approximately six hours",
    probability: 89, confidence: 93, capacityExposed: "40 Gbps", servicesExposed: 3,
    fallback: "Ready, 9 Gbps headroom", recommendation: "Hold protection span, validate fallback headroom",
    evidenceCount: 12, dataFreshness: "1 minute", state: "High", driver: "Dense fog",
    ax: 70.6, ay: 52.2, bx: 71.8, by: 53.1,
  },
  {
    id: "CHN-PDY-018", name: "Chennai to Puducherry corridor", region: "Chennai",
    product: "Lightbridge", service: "Harbour Logistics Transport", customer: "Harbour Logistics",
    terminalA: "TRM-CHN-120", terminalB: "TRM-PDY-018", distanceKm: "132.6 km",
    visibilityKm: "9.1 km", forecastVisibilityKm: "2.4 km", fogDensity: "Low, forecast moderate",
    rainfall: "0.1 mm/h, forecast 0.5 mm/h", humidity: "70%, forecast 91%", windKph: "14 km/h, forecast 9 km/h",
    vibration: "Nominal, 0.5 mm/s", rxPowerDbm: "-22.6 dBm", marginDb: "6.8 dB",
    attenuationDb: "2.6 dB, forecast 6.1 dB", degradationTime: "Approximately seven hours",
    probability: 84, confidence: 91, capacityExposed: "25 Gbps", servicesExposed: 2,
    fallback: "Ready, 6 Gbps headroom", recommendation: "Place link under fog watch",
    evidenceCount: 11, dataFreshness: "2 minutes", state: "At risk", driver: "Dense fog",
    ax: 70.9, ay: 53.4, bx: 71.9, by: 54.4,
  },
  {
    id: "CHN-BLR-007", name: "Chennai to Bengaluru inland span", region: "Chennai",
    product: "Lightbridge", service: "Meridian Financial Trading", customer: "Meridian Financial",
    terminalA: "TRM-CHN-121", terminalB: "TRM-BLR-007", distanceKm: "289.4 km",
    visibilityKm: "10.2 km", forecastVisibilityKm: "4.6 km", fogDensity: "Low, forecast moderate",
    rainfall: "0.0 mm/h, forecast 0.2 mm/h", humidity: "66%, forecast 84%", windKph: "16 km/h, forecast 11 km/h",
    vibration: "Nominal, 0.4 mm/s", rxPowerDbm: "-20.8 dBm", marginDb: "8.6 dB",
    attenuationDb: "1.8 dB, forecast 3.9 dB", degradationTime: "Approximately eleven hours",
    probability: 61, confidence: 88, capacityExposed: "30 Gbps", servicesExposed: 2,
    fallback: "Ready, 12 Gbps headroom", recommendation: "Monitor, no preventive action required yet",
    evidenceCount: 9, dataFreshness: "1 minute", state: "Under watch", driver: "Low visibility",
    ax: 69.4, ay: 52.8, bx: 68.6, by: 53.6,
  },
  {
    id: "CHN-VZG-022", name: "Chennai to Visakhapatnam coastal chain", region: "Chennai",
    product: "Beam", service: "Coastal Data Backhaul", customer: "Coastal Data Networks",
    terminalA: "TRM-CHN-122", terminalB: "TRM-VZG-022", distanceKm: "614.8 km",
    visibilityKm: "9.6 km", forecastVisibilityKm: "3.2 km", fogDensity: "Low, forecast moderate",
    rainfall: "0.3 mm/h, forecast 0.9 mm/h", humidity: "74%, forecast 90%", windKph: "18 km/h, forecast 12 km/h",
    vibration: "Nominal, 0.6 mm/s", rxPowerDbm: "-23.1 dBm", marginDb: "6.2 dB",
    attenuationDb: "2.9 dB, forecast 5.6 dB", degradationTime: "Approximately eight hours",
    probability: 72, confidence: 89, capacityExposed: "15 Gbps", servicesExposed: 1,
    fallback: "Partial, 3 Gbps headroom", recommendation: "Validate fallback headroom before impact window",
    evidenceCount: 10, dataFreshness: "3 minutes", state: "At risk", driver: "Dense fog",
    ax: 70.8, ay: 50.4, bx: 71.6, by: 49.2,
  },
  {
    id: "CHN-TRV-030", name: "Chennai to Tiruvallur metro span", region: "Chennai",
    product: "Lightbridge", service: "Deccan Cloud Interconnect", customer: "Deccan Cloud Services",
    terminalA: "TRM-CHN-123", terminalB: "TRM-TRV-030", distanceKm: "41.7 km",
    visibilityKm: "8.9 km", forecastVisibilityKm: "2.1 km", fogDensity: "Low, forecast high",
    rainfall: "0.2 mm/h, forecast 0.7 mm/h", humidity: "71%, forecast 93%", windKph: "13 km/h, forecast 8 km/h",
    vibration: "Nominal, 0.3 mm/s", rxPowerDbm: "-21.1 dBm", marginDb: "7.9 dB",
    attenuationDb: "2.0 dB, forecast 6.2 dB", degradationTime: "Approximately six hours",
    probability: 86, confidence: 92, capacityExposed: "10 Gbps", servicesExposed: 1,
    fallback: "Ready, 4 Gbps headroom", recommendation: "Place link under fog watch",
    evidenceCount: 11, dataFreshness: "1 minute", state: "At risk", driver: "Dense fog",
    ax: 69.9, ay: 51.2, bx: 69.2, by: 50.6,
  },
  {
    id: "MUM-PUN-011", name: "Mumbai to Pune corridor", region: "Mumbai",
    product: "Lightbridge Pro", service: "Meridian Financial Trading", customer: "Meridian Financial",
    terminalA: "TRM-MUM-011", terminalB: "TRM-PUN-011", distanceKm: "148.3 km",
    visibilityKm: "6.2 km", forecastVisibilityKm: "2.4 km", fogDensity: "Moderate, forecast high",
    rainfall: "0.0 mm/h, forecast 0.1 mm/h", humidity: "68%, forecast 88%", windKph: "16 km/h, forecast 12 km/h",
    vibration: "Nominal, 0.4 mm/s", rxPowerDbm: "-22.2 dBm", marginDb: "7.0 dB",
    attenuationDb: "2.4 dB, forecast 5.4 dB", degradationTime: "Approximately nine hours",
    probability: 74, confidence: 90, capacityExposed: "24 Gbps", servicesExposed: 2,
    fallback: "Ready, 8 Gbps headroom", recommendation: "Raise monitoring frequency on the corridor",
    evidenceCount: 10, dataFreshness: "2 minutes", state: "At risk", driver: "Low visibility",
    ax: 67.2, ay: 47.8, bx: 68.1, by: 48.4,
  },
  {
    id: "MUM-AHM-014", name: "Mumbai to Ahmedabad span", region: "Mumbai",
    product: "Lightbridge", service: "Harbour Logistics Transport", customer: "Harbour Logistics",
    terminalA: "TRM-MUM-014", terminalB: "TRM-AHM-014", distanceKm: "441.2 km",
    visibilityKm: "7.4 km", forecastVisibilityKm: "3.6 km", fogDensity: "Low, forecast moderate",
    rainfall: "0.0 mm/h, forecast 0.0 mm/h", humidity: "62%, forecast 79%", windKph: "18 km/h, forecast 15 km/h",
    vibration: "Nominal, 0.5 mm/s", rxPowerDbm: "-22.8 dBm", marginDb: "6.6 dB",
    attenuationDb: "2.7 dB, forecast 4.4 dB", degradationTime: "Approximately fourteen hours",
    probability: 58, confidence: 86, capacityExposed: "18 Gbps", servicesExposed: 2,
    fallback: "Ready, 7 Gbps headroom", recommendation: "Monitor visibility trend",
    evidenceCount: 8, dataFreshness: "4 minutes", state: "Under watch", driver: "Low visibility",
    ax: 66.9, ay: 47.2, bx: 66.2, by: 45.8,
  },
  {
    id: "MUM-NAG-021", name: "Mumbai to Nagpur inland span", region: "Mumbai",
    product: "Beam", service: "Southern Cross Distribution", customer: "Southern Cross Media",
    terminalA: "TRM-MUM-021", terminalB: "TRM-NAG-021", distanceKm: "706.4 km",
    visibilityKm: "8.1 km", forecastVisibilityKm: "4.9 km", fogDensity: "Low, forecast low",
    rainfall: "0.0 mm/h, forecast 0.0 mm/h", humidity: "58%, forecast 71%", windKph: "20 km/h, forecast 17 km/h",
    vibration: "Nominal, 0.6 mm/s", rxPowerDbm: "-23.4 dBm", marginDb: "6.1 dB",
    attenuationDb: "3.0 dB, forecast 3.8 dB", degradationTime: "Beyond the 48 hour horizon",
    probability: 34, confidence: 84, capacityExposed: "12 Gbps", servicesExposed: 1,
    fallback: "Ready, 5 Gbps headroom", recommendation: "No action required",
    evidenceCount: 6, dataFreshness: "3 minutes", state: "Under watch", driver: "Dust or smoke",
    ax: 67.6, ay: 48.6, bx: 69.0, by: 48.9,
  },
  {
    id: "MUM-GOA-009", name: "Mumbai to Goa coastal span", region: "Mumbai",
    product: "Lightbridge", service: "Coastal Data Backhaul", customer: "Coastal Data Networks",
    terminalA: "TRM-MUM-009", terminalB: "TRM-GOA-009", distanceKm: "429.7 km",
    visibilityKm: "7.9 km", forecastVisibilityKm: "3.1 km", fogDensity: "Low, forecast moderate",
    rainfall: "0.1 mm/h, forecast 0.4 mm/h", humidity: "71%, forecast 90%", windKph: "17 km/h, forecast 13 km/h",
    vibration: "Nominal, 0.4 mm/s", rxPowerDbm: "-22.4 dBm", marginDb: "6.9 dB",
    attenuationDb: "2.5 dB, forecast 5.1 dB", degradationTime: "Approximately twelve hours",
    probability: 66, confidence: 88, capacityExposed: "15 Gbps", servicesExposed: 1,
    fallback: "Ready, 6 Gbps headroom", recommendation: "Place link under visibility watch",
    evidenceCount: 9, dataFreshness: "2 minutes", state: "At risk", driver: "Low visibility",
    ax: 67.0, ay: 48.2, bx: 67.6, by: 49.6,
  },
  {
    id: "GOG-LOS-004", name: "Lagos coastal aggregation span", region: "Gulf of Guinea",
    product: "Lightbridge Pro", service: "Rift Valley Backbone", customer: "Rift Valley Telecom",
    terminalA: "TRM-LOS-004", terminalB: "TRM-IBA-004", distanceKm: "126.8 km",
    visibilityKm: "9.4 km", forecastVisibilityKm: "5.1 km", fogDensity: "Low, forecast low",
    rainfall: "15 mm/h, forecast 30 mm/h", humidity: "81%, forecast 92%", windKph: "28 km/h, forecast 34 km/h",
    vibration: "Elevated, 1.4 mm/s", rxPowerDbm: "-23.8 dBm", marginDb: "5.8 dB",
    attenuationDb: "3.2 dB, forecast 7.4 dB", degradationTime: "Approximately four hours",
    probability: 81, confidence: 87, capacityExposed: "20 Gbps", servicesExposed: 2,
    fallback: "Not validated", recommendation: "Validate RF fallback before rainband arrival",
    evidenceCount: 12, dataFreshness: "2 minutes", state: "High", driver: "Heavy rain",
    ax: 49.2, ay: 56.8, bx: 50.1, by: 57.6,
  },
  {
    id: "GOG-ACC-006", name: "Accra coastal span", region: "Gulf of Guinea",
    product: "Lightbridge", service: "Rift Valley Backbone", customer: "Rift Valley Telecom",
    terminalA: "TRM-ACC-006", terminalB: "TRM-TEM-006", distanceKm: "84.2 km",
    visibilityKm: "9.8 km", forecastVisibilityKm: "6.2 km", fogDensity: "Low, forecast low",
    rainfall: "12 mm/h, forecast 24 mm/h", humidity: "80%, forecast 90%", windKph: "26 km/h, forecast 31 km/h",
    vibration: "Nominal, 0.7 mm/s", rxPowerDbm: "-22.9 dBm", marginDb: "6.4 dB",
    attenuationDb: "2.8 dB, forecast 6.1 dB", degradationTime: "Approximately five hours",
    probability: 73, confidence: 85, capacityExposed: "12 Gbps", servicesExposed: 1,
    fallback: "Partial, 2 Gbps headroom", recommendation: "Prepare fallback and notify customer operations",
    evidenceCount: 10, dataFreshness: "3 minutes", state: "At risk", driver: "Heavy rain",
    ax: 48.4, ay: 57.2, bx: 47.8, by: 57.9,
  },
  {
    id: "GOG-ABJ-012", name: "Abidjan metropolitan span", region: "Gulf of Guinea",
    product: "Beam", service: "Harbour Logistics Transport", customer: "Harbour Logistics",
    terminalA: "TRM-ABJ-012", terminalB: "TRM-YAM-012", distanceKm: "231.5 km",
    visibilityKm: "10.2 km", forecastVisibilityKm: "7.4 km", fogDensity: "Low, forecast low",
    rainfall: "9 mm/h, forecast 18 mm/h", humidity: "78%, forecast 88%", windKph: "24 km/h, forecast 27 km/h",
    vibration: "Nominal, 0.6 mm/s", rxPowerDbm: "-23.2 dBm", marginDb: "6.0 dB",
    attenuationDb: "3.0 dB, forecast 5.2 dB", degradationTime: "Approximately eight hours",
    probability: 62, confidence: 84, capacityExposed: "8 Gbps", servicesExposed: 1,
    fallback: "Ready, 4 Gbps headroom", recommendation: "Monitor rainfall intensity",
    evidenceCount: 8, dataFreshness: "4 minutes", state: "Under watch", driver: "Heavy rain",
    ax: 47.6, ay: 57.4, bx: 47.1, by: 56.6,
  },
  {
    id: "GOG-LBV-017", name: "Libreville coastal span", region: "Gulf of Guinea",
    product: "Lightbridge", service: "Coastal Data Backhaul", customer: "Coastal Data Networks",
    terminalA: "TRM-LBV-017", terminalB: "TRM-POG-017", distanceKm: "302.1 km",
    visibilityKm: "9.1 km", forecastVisibilityKm: "6.8 km", fogDensity: "Low, forecast low",
    rainfall: "11 mm/h, forecast 21 mm/h", humidity: "83%, forecast 91%", windKph: "22 km/h, forecast 25 km/h",
    vibration: "Nominal, 0.5 mm/s", rxPowerDbm: "-22.6 dBm", marginDb: "6.7 dB",
    attenuationDb: "2.7 dB, forecast 5.0 dB", degradationTime: "Approximately nine hours",
    probability: 57, confidence: 83, capacityExposed: "5 Gbps", servicesExposed: 1,
    fallback: "Ready, 3 Gbps headroom", recommendation: "Monitor, no preventive action required yet",
    evidenceCount: 7, dataFreshness: "5 minutes", state: "Under watch", driver: "Heavy rain",
    ax: 51.4, ay: 58.6, bx: 51.9, by: 59.4,
  },
  {
    id: "GOG-DLA-019", name: "Douala aggregation span", region: "Gulf of Guinea",
    product: "Lightbridge", service: "Rift Valley Backbone", customer: "Rift Valley Telecom",
    terminalA: "TRM-DLA-019", terminalB: "TRM-YDE-019", distanceKm: "196.4 km",
    visibilityKm: "8.8 km", forecastVisibilityKm: "5.9 km", fogDensity: "Low, forecast low",
    rainfall: "13 mm/h, forecast 26 mm/h", humidity: "84%, forecast 93%", windKph: "25 km/h, forecast 29 km/h",
    vibration: "Nominal, 0.6 mm/s", rxPowerDbm: "-23.4 dBm", marginDb: "5.9 dB",
    attenuationDb: "3.1 dB, forecast 6.4 dB", degradationTime: "Approximately six hours",
    probability: 69, confidence: 84, capacityExposed: "3 Gbps", servicesExposed: 1,
    fallback: "Ready, 2 Gbps headroom", recommendation: "Place link under rain watch",
    evidenceCount: 9, dataFreshness: "3 minutes", state: "At risk", driver: "Heavy rain",
    ax: 51.0, ay: 57.6, bx: 51.6, by: 58.2,
  },
  {
    id: "RIO-SAO-003", name: "Rio de Janeiro to Sao Paulo span", region: "Rio de Janeiro",
    product: "Lightbridge Pro", service: "Southern Cross Distribution", customer: "Southern Cross Media",
    terminalA: "TRM-RIO-003", terminalB: "TRM-SAO-003", distanceKm: "358.9 km",
    visibilityKm: "11.2 km", forecastVisibilityKm: "9.6 km", fogDensity: "Low, forecast low",
    rainfall: "0.4 mm/h, forecast 1.1 mm/h", humidity: "84%, forecast 93%", windKph: "9 km/h, forecast 11 km/h",
    vibration: "Nominal, 0.3 mm/s", rxPowerDbm: "-21.8 dBm", marginDb: "7.8 dB",
    attenuationDb: "2.2 dB, forecast 3.4 dB", degradationTime: "Approximately eighteen hours",
    probability: 41, confidence: 86, capacityExposed: "18 Gbps", servicesExposed: 2,
    fallback: "Ready, 8 Gbps headroom", recommendation: "Monitor humidity trend",
    evidenceCount: 7, dataFreshness: "2 minutes", state: "Under watch", driver: "High humidity",
    ax: 33.2, ay: 65.6, bx: 32.4, by: 65.1,
  },
  {
    id: "RIO-BHZ-015", name: "Rio de Janeiro to Belo Horizonte span", region: "Rio de Janeiro",
    product: "Lightbridge", service: "Southern Cross Distribution", customer: "Southern Cross Media",
    terminalA: "TRM-RIO-015", terminalB: "TRM-BHZ-015", distanceKm: "339.4 km",
    visibilityKm: "10.8 km", forecastVisibilityKm: "9.1 km", fogDensity: "Low, forecast low",
    rainfall: "0.3 mm/h, forecast 0.9 mm/h", humidity: "85%, forecast 92%", windKph: "10 km/h, forecast 12 km/h",
    vibration: "Nominal, 0.4 mm/s", rxPowerDbm: "-22.1 dBm", marginDb: "7.5 dB",
    attenuationDb: "2.4 dB, forecast 3.6 dB", degradationTime: "Approximately twenty hours",
    probability: 38, confidence: 85, capacityExposed: "10 Gbps", servicesExposed: 1,
    fallback: "Ready, 5 Gbps headroom", recommendation: "No action required",
    evidenceCount: 6, dataFreshness: "3 minutes", state: "Under watch", driver: "High humidity",
    ax: 33.6, ay: 65.0, bx: 33.1, by: 64.2,
  },
  {
    id: "RIO-CWB-024", name: "Rio de Janeiro to Curitiba span", region: "Rio de Janeiro",
    product: "Beam", service: "Harbour Logistics Transport", customer: "Harbour Logistics",
    terminalA: "TRM-RIO-024", terminalB: "TRM-CWB-024", distanceKm: "681.2 km",
    visibilityKm: "11.4 km", forecastVisibilityKm: "10.2 km", fogDensity: "Low, forecast low",
    rainfall: "0.2 mm/h, forecast 0.6 mm/h", humidity: "82%, forecast 90%", windKph: "12 km/h, forecast 13 km/h",
    vibration: "Nominal, 0.3 mm/s", rxPowerDbm: "-22.4 dBm", marginDb: "7.2 dB",
    attenuationDb: "2.5 dB, forecast 3.3 dB", degradationTime: "Beyond the 48 hour horizon",
    probability: 29, confidence: 84, capacityExposed: "6 Gbps", servicesExposed: 1,
    fallback: "Ready, 3 Gbps headroom", recommendation: "No action required",
    evidenceCount: 5, dataFreshness: "4 minutes", state: "Low", driver: "High humidity",
    ax: 33.0, ay: 66.4, bx: 32.2, by: 67.2,
  },
  {
    id: "SEA-SIN-002", name: "Singapore metropolitan span", region: "Southeast Asia",
    product: "Lightbridge Pro", service: "Deccan Cloud Interconnect", customer: "Deccan Cloud Services",
    terminalA: "TRM-SIN-002", terminalB: "TRM-JHB-002", distanceKm: "62.4 km",
    visibilityKm: "10.1 km", forecastVisibilityKm: "7.8 km", fogDensity: "Low, forecast low",
    rainfall: "6 mm/h, forecast 12 mm/h", humidity: "79%, forecast 90%", windKph: "22 km/h, forecast 26 km/h",
    vibration: "Nominal, 0.4 mm/s", rxPowerDbm: "-21.6 dBm", marginDb: "7.9 dB",
    attenuationDb: "2.1 dB, forecast 4.1 dB", degradationTime: "Approximately ten hours",
    probability: 48, confidence: 87, capacityExposed: "12 Gbps", servicesExposed: 2,
    fallback: "Ready, 6 Gbps headroom", recommendation: "Monitor convective cell movement",
    evidenceCount: 7, dataFreshness: "2 minutes", state: "Under watch", driver: "Convective activity",
    ax: 78.2, ay: 56.8, bx: 78.9, by: 57.4,
  },
  {
    id: "SEA-KUL-013", name: "Kuala Lumpur aggregation span", region: "Southeast Asia",
    product: "Lightbridge", service: "Coastal Data Backhaul", customer: "Coastal Data Networks",
    terminalA: "TRM-KUL-013", terminalB: "TRM-IPH-013", distanceKm: "204.6 km",
    visibilityKm: "9.8 km", forecastVisibilityKm: "7.2 km", fogDensity: "Low, forecast low",
    rainfall: "7 mm/h, forecast 14 mm/h", humidity: "81%, forecast 91%", windKph: "20 km/h, forecast 24 km/h",
    vibration: "Nominal, 0.5 mm/s", rxPowerDbm: "-22.3 dBm", marginDb: "7.1 dB",
    attenuationDb: "2.5 dB, forecast 4.6 dB", degradationTime: "Approximately eleven hours",
    probability: 44, confidence: 86, capacityExposed: "5 Gbps", servicesExposed: 1,
    fallback: "Ready, 3 Gbps headroom", recommendation: "Monitor rainfall intensity",
    evidenceCount: 6, dataFreshness: "3 minutes", state: "Under watch", driver: "Convective activity",
    ax: 77.6, ay: 56.2, bx: 77.1, by: 55.6,
  },
  {
    id: "CAL-SFO-001", name: "San Francisco bay span", region: "California",
    product: "Lightbridge Pro", service: "Meridian Financial Trading", customer: "Meridian Financial",
    terminalA: "TRM-SFO-001", terminalB: "TRM-OAK-001", distanceKm: "18.9 km",
    visibilityKm: "7.8 km", forecastVisibilityKm: "6.4 km", fogDensity: "Moderate, forecast moderate",
    rainfall: "0.0 mm/h, forecast 0.0 mm/h", humidity: "74%, forecast 80%", windKph: "14 km/h, forecast 16 km/h",
    vibration: "Nominal, 0.3 mm/s", rxPowerDbm: "-20.4 dBm", marginDb: "9.1 dB",
    attenuationDb: "1.6 dB, forecast 2.4 dB", degradationTime: "Beyond the 48 hour horizon",
    probability: 22, confidence: 89, capacityExposed: "8 Gbps", servicesExposed: 1,
    fallback: "Ready, 6 Gbps headroom", recommendation: "No action required",
    evidenceCount: 5, dataFreshness: "1 minute", state: "Monitoring", driver: "Low visibility",
    ax: 15.2, ay: 38.8, bx: 15.9, by: 39.3,
  },
  {
    id: "CAL-LAX-008", name: "Los Angeles metropolitan span", region: "California",
    product: "Beam", service: "Southern Cross Distribution", customer: "Southern Cross Media",
    terminalA: "TRM-LAX-008", terminalB: "TRM-ANA-008", distanceKm: "44.2 km",
    visibilityKm: "8.6 km", forecastVisibilityKm: "7.1 km", fogDensity: "Low, forecast low",
    rainfall: "0.0 mm/h, forecast 0.0 mm/h", humidity: "68%, forecast 74%", windKph: "12 km/h, forecast 14 km/h",
    vibration: "Nominal, 0.4 mm/s", rxPowerDbm: "-21.2 dBm", marginDb: "8.4 dB",
    attenuationDb: "1.9 dB, forecast 2.6 dB", degradationTime: "Beyond the 48 hour horizon",
    probability: 18, confidence: 88, capacityExposed: "4 Gbps", servicesExposed: 1,
    fallback: "Ready, 3 Gbps headroom", recommendation: "No action required",
    evidenceCount: 4, dataFreshness: "2 minutes", state: "Low", driver: "Dust or smoke",
    ax: 16.1, ay: 40.6, bx: 16.8, by: 41.0,
  },
  {
    id: "NBO-MBA-005", name: "Nairobi to Mombasa corridor", region: "Nairobi",
    product: "Lightbridge Pro", service: "Rift Valley Backbone", customer: "Rift Valley Telecom",
    terminalA: "TRM-NBO-005", terminalB: "TRM-MBA-005", distanceKm: "484.7 km",
    visibilityKm: "8.9 km", forecastVisibilityKm: "4.7 km", fogDensity: "Low, forecast low",
    rainfall: "9 mm/h, forecast 18 mm/h", humidity: "76%, forecast 89%", windKph: "31 km/h, forecast 36 km/h",
    vibration: "Elevated, 1.2 mm/s", rxPowerDbm: "-23.6 dBm", marginDb: "5.7 dB",
    attenuationDb: "3.3 dB, forecast 6.0 dB", degradationTime: "Approximately seven hours",
    probability: 64, confidence: 85, capacityExposed: "15 Gbps", servicesExposed: 2,
    fallback: "Ready, 7 Gbps headroom", recommendation: "Place corridor under rain watch",
    evidenceCount: 9, dataFreshness: "2 minutes", state: "At risk", driver: "Heavy rain",
    ax: 57.2, ay: 57.8, bx: 58.1, by: 58.6,
  },
  {
    id: "NBO-KIS-016", name: "Nairobi to Kisumu span", region: "Nairobi",
    product: "Lightbridge", service: "Rift Valley Backbone", customer: "Rift Valley Telecom",
    terminalA: "TRM-NBO-016", terminalB: "TRM-KIS-016", distanceKm: "263.8 km",
    visibilityKm: "9.4 km", forecastVisibilityKm: "6.1 km", fogDensity: "Low, forecast low",
    rainfall: "7 mm/h, forecast 14 mm/h", humidity: "74%, forecast 86%", windKph: "28 km/h, forecast 32 km/h",
    vibration: "Nominal, 0.7 mm/s", rxPowerDbm: "-22.8 dBm", marginDb: "6.5 dB",
    attenuationDb: "2.8 dB, forecast 4.8 dB", degradationTime: "Approximately twelve hours",
    probability: 47, confidence: 84, capacityExposed: "6 Gbps", servicesExposed: 1,
    fallback: "Ready, 4 Gbps headroom", recommendation: "Monitor rainfall intensity",
    evidenceCount: 6, dataFreshness: "3 minutes", state: "Under watch", driver: "Heavy rain",
    ax: 56.8, ay: 57.4, bx: 55.9, by: 57.0,
  },
  {
    id: "JNB-DUR-010", name: "Johannesburg to Durban span", region: "Johannesburg",
    product: "Lightbridge", service: "Southern Cross Distribution", customer: "Southern Cross Media",
    terminalA: "TRM-JNB-010", terminalB: "TRM-DUR-010", distanceKm: "567.3 km",
    visibilityKm: "12.4 km", forecastVisibilityKm: "10.8 km", fogDensity: "Low, forecast low",
    rainfall: "0.0 mm/h, forecast 0.0 mm/h", humidity: "38%, forecast 44%", windKph: "42 km/h, forecast 48 km/h",
    vibration: "Elevated, 1.6 mm/s", rxPowerDbm: "-22.0 dBm", marginDb: "7.6 dB",
    attenuationDb: "2.2 dB, forecast 2.6 dB", degradationTime: "Beyond the 48 hour horizon",
    probability: 26, confidence: 82, capacityExposed: "0 Gbps", servicesExposed: 0,
    fallback: "Ready, 9 Gbps headroom", recommendation: "Monitor mounting vibration under wind load",
    evidenceCount: 5, dataFreshness: "2 minutes", state: "Low", driver: "Wind",
    ax: 55.2, ay: 68.6, bx: 56.2, by: 69.4,
  },
  {
    id: "DXB-AUH-020", name: "Dubai to Abu Dhabi span", region: "Dubai",
    product: "Lightbridge Pro", service: "Meridian Financial Trading", customer: "Meridian Financial",
    terminalA: "TRM-DXB-020", terminalB: "TRM-AUH-020", distanceKm: "138.6 km",
    visibilityKm: "Unavailable", forecastVisibilityKm: "Unavailable", fogDensity: "Unavailable",
    rainfall: "Unavailable", humidity: "Unavailable", windKph: "26 km/h",
    vibration: "Nominal, 0.5 mm/s", rxPowerDbm: "-21.9 dBm", marginDb: "7.7 dB",
    attenuationDb: "2.2 dB, forecast unavailable", degradationTime: "Not predicted, data incomplete",
    probability: 0, confidence: 42, capacityExposed: "Unknown", servicesExposed: 1,
    fallback: "Ready, 5 Gbps headroom", recommendation: "Restore ground sensor feed before predicting",
    evidenceCount: 2, dataFreshness: "46 minutes", state: "No data", driver: "Dust or smoke",
    ax: 62.2, ay: 45.8, bx: 61.6, by: 46.4,
  },
  {
    id: "LON-AMS-023", name: "London to Amsterdam span", region: "London",
    product: "Lightbridge Pro", service: "Meridian Financial Trading", customer: "Meridian Financial",
    terminalA: "TRM-LON-023", terminalB: "TRM-AMS-023", distanceKm: "358.1 km",
    visibilityKm: "9.8 km", forecastVisibilityKm: "8.2 km", fogDensity: "Low, forecast low",
    rainfall: "3 mm/h, forecast 6 mm/h", humidity: "82%, forecast 86%", windKph: "34 km/h, forecast 38 km/h",
    vibration: "Nominal, 0.6 mm/s", rxPowerDbm: "-20.9 dBm", marginDb: "8.8 dB",
    attenuationDb: "1.8 dB, forecast 2.9 dB", degradationTime: "Risk mitigated by earlier action",
    probability: 14, confidence: 91, capacityExposed: "0 Gbps", servicesExposed: 0,
    fallback: "Ready, 11 Gbps headroom", recommendation: "Close watch, conditions improving",
    evidenceCount: 6, dataFreshness: "1 minute", state: "Risk mitigated", driver: "Heavy rain",
    ax: 48.2, ay: 31.8, bx: 49.1, by: 32.4,
  },
];

/* ------------------------------ ranked risks ----------------------------- */

export interface AtmosphericRisk {
  id: string;
  corridor: string;
  region: string;
  primaryDriver: string;
  secondaryDriver: string;
  links: number;
  services: number;
  capacity: string;
  severity: "High" | "Moderate" | "Low";
  probability: number;
  confidence: number;
  window: string;
  fallback: string;
  action: string;
}

export const atmosphericRisks: AtmosphericRisk[] = [
  {
    id: "AR-01", corridor: "South India, Chennai", region: "Chennai", primaryDriver: "Dense fog",
    secondaryDriver: "High humidity", links: 6, services: 9, capacity: "160 Gbps", severity: "High",
    probability: 92, confidence: 94, window: "+3h to +9h", fallback: "Ready",
    action: "Pre-position RF fallback for priority services",
  },
  {
    id: "AR-02", corridor: "Central India, Mumbai", region: "Mumbai", primaryDriver: "Visibility degradation",
    secondaryDriver: "Dust or smoke", links: 4, services: 6, capacity: "69 Gbps", severity: "Moderate",
    probability: 74, confidence: 90, window: "+6h to +12h", fallback: "Ready",
    action: "Raise monitoring frequency on the corridor",
  },
  {
    id: "AR-03", corridor: "Gulf of Guinea Coast", region: "Gulf of Guinea", primaryDriver: "Heavy rain",
    secondaryDriver: "Wind", links: 5, services: 5, capacity: "48 Gbps", severity: "Moderate",
    probability: 81, confidence: 87, window: "+2h to +8h", fallback: "Not validated",
    action: "Validate RF fallback before rainband arrival",
  },
  {
    id: "AR-04", corridor: "Brazil, Rio de Janeiro", region: "Rio de Janeiro", primaryDriver: "High humidity",
    secondaryDriver: "Atmospheric turbulence", links: 3, services: 4, capacity: "34 Gbps", severity: "Low",
    probability: 41, confidence: 86, window: "+12h to +24h", fallback: "Ready",
    action: "Monitor humidity trend, no action required",
  },
  {
    id: "AR-05", corridor: "Southeast Asia", region: "Southeast Asia", primaryDriver: "Convective activity",
    secondaryDriver: "Heavy rain", links: 2, services: 3, capacity: "17 Gbps", severity: "Low",
    probability: 48, confidence: 87, window: "+8h to +16h", fallback: "Ready",
    action: "Monitor convective cell movement",
  },
  {
    id: "AR-06", corridor: "East Africa, Nairobi", region: "Nairobi", primaryDriver: "Heavy rain",
    secondaryDriver: "Wind", links: 2, services: 3, capacity: "21 Gbps", severity: "Moderate",
    probability: 64, confidence: 85, window: "+5h to +13h", fallback: "Ready",
    action: "Place corridor under rain watch",
  },
];

/* --------------------------- processing pipeline ------------------------- */

export interface PipelineStage {
  id: string;
  index: number;
  title: string;
  inputs: string[];
  logic: string[];
  output: string;
  freshness: string;
  qualityChecks: string[];
  status: string;
  example: string;
  recentResult: string;
}

export const pipelineStages: PipelineStage[] = [
  {
    id: "ST-1", index: 1, title: "Data Ingestion",
    inputs: [
      "Satellite weather observations", "Numerical weather models", "Regional radar",
      "Ground weather stations", "Link-site environmental sensors", "Terminal telemetry",
      "Optical telemetry", "Historical service events",
    ],
    logic: [
      "Poll each feed on its published cadence",
      "Record receipt time and source identity for every record",
      "Reject records outside the accepted observation window",
    ],
    output: "Raw observation set for 1,248 links, 2,496 terminals and 512 ground stations",
    freshness: "1 minute", status: "Complete, 09:38 UTC",
    qualityChecks: ["Feed reachable", "Record count within expected range", "Schema valid"],
    example: "Himawari satellite feed delivered 4,812 cells covering the Chennai corridor at 09:36 UTC.",
    recentResult: "10 of 10 feeds delivered, 0 rejected records.",
  },
  {
    id: "ST-2", index: 2, title: "Data Alignment and Quality",
    inputs: ["Raw observation set", "Optical route geometry", "Terminal site coordinates", "Source reliability history"],
    logic: [
      "Align timestamps to a common five-minute grid",
      "Align weather cells to optical route segments",
      "Detect stale data", "Detect missing data", "Detect conflicting sources",
      "Normalize units", "Score source reliability", "Flag low-confidence regions",
    ],
    output: "Route-aligned weather series with per-source reliability scores",
    freshness: "1 minute", status: "Complete, 09:38 UTC",
    qualityChecks: ["Time alignment within 5 minutes", "Route coverage above 95%", "No unresolved unit mismatch"],
    example: "48.2 km Chennai route split into 12 segments; each segment matched to the nearest 2 km weather cell.",
    recentResult: "Route coverage 98.4%. One low-confidence region flagged in Dubai due to a missing ground sensor.",
  },
  {
    id: "ST-3", index: 3, title: "Feature Calculation",
    inputs: ["Route-aligned weather series", "Terminal product characteristics", "Optical telemetry baseline"],
    logic: [
      "Route-level visibility", "Fog density", "Rainfall intensity", "Relative humidity",
      "Wind exposure", "Estimated atmospheric attenuation", "Expected link-margin loss",
      "Expected optical-power reduction", "Expected capacity degradation", "Expected fallback demand",
    ],
    output: "Engineering feature vector per link and per forecast interval",
    freshness: "2 minutes", status: "Complete, 09:38 UTC",
    qualityChecks: ["Feature ranges plausible", "No negative attenuation", "Interval continuity preserved"],
    example: "Chennai route visibility 1.8 km implies 4.7 dB additional attenuation across a 48.2 km span.",
    recentResult: "Features generated for 1,248 links across 8 six-hour intervals.",
  },
  {
    id: "ST-4", index: 4, title: "Link-Specific Impact Modeling",
    inputs: ["Feature vector", "Link distance", "Terminal product type", "Current link margin", "Historical sensitivity", "Terrain and mounting conditions", "Current traffic demand"],
    logic: [
      "Apply the selected link's distance", "Apply terminal product type", "Apply current link margin",
      "Apply historical sensitivity", "Apply local terrain and mounting conditions",
      "Apply current traffic demand", "Compare similar links", "Estimate time to degradation",
    ],
    output: "Per-link margin trajectory and estimated time to degradation",
    freshness: "2 minutes", status: "Complete, 09:38 UTC",
    qualityChecks: ["Similar-link sample size above 5", "Historical sensitivity available", "Traffic demand current"],
    example: "CHN-MBL-041 margin 7.4 dB minus 4.7 dB forecast attenuation crosses the 3.0 dB threshold in about six hours.",
    recentResult: "23 links crossed the degradation threshold inside the 48 hour horizon.",
  },
  {
    id: "ST-5", index: 5, title: "Risk Scoring",
    inputs: ["Margin trajectory", "Service topology", "SLO records", "Fallback capacity records"],
    logic: [
      "Risk probability", "Confidence", "Time to expected impact", "Capacity exposed",
      "Customer services exposed", "SLO exposure", "Fallback readiness", "Preventive action window",
    ],
    output: "Confidence-scored risk record per link with a preventive action window",
    freshness: "2 minutes", status: "Complete, 09:38 UTC",
    qualityChecks: ["Confidence reduced when a contributing source is stale", "Fallback record present", "SLO record present"],
    example: "CHN-MBL-041 scored at 92% probability and 94% confidence with a preventive window closing at 12:30 UTC.",
    recentResult: "68 links under watch, 23 at risk, 286 Gbps capacity exposed.",
  },
  {
    id: "ST-6", index: 6, title: "Continuous Validation",
    inputs: ["Prior predictions", "Observed optical telemetry", "Service incident records"],
    logic: [
      "Compare prediction to observed telemetry", "Record correct predictions", "Record false positives",
      "Record missed events", "Recalibrate link-specific thresholds", "Update historical weather signatures",
      "Update similar-link comparisons", "Preserve evidence for audit",
    ],
    output: "Accuracy record, recalibrated thresholds and an auditable evidence set",
    freshness: "Hourly", status: "Complete, 09:00 UTC",
    qualityChecks: ["Observation window closed", "Telemetry complete", "Evidence retained"],
    example: "The 03:38 UTC Chennai prediction was compared with observed margin at 09:00 UTC and recorded as correct.",
    recentResult: "Month to date: 1,248 predictions, 94% accuracy, 9 false positives, 3 missed events.",
  },
];

/* -------------------------- atmospheric drivers -------------------------- */

export interface AtmosphericDriver {
  id: string;
  name: string;
  current: string;
  normal: string;
  forecast: string;
  trend: "up" | "down" | "flat";
  contribution: number;
  material: boolean;
  source: string;
  freshness: string;
  confidence: number;
}

export const atmosphericDrivers: AtmosphericDriver[] = [
  { id: "AD-01", name: "Visibility", current: "8.6 km", normal: "8 to 12 km", forecast: "1.8 km", trend: "down", contribution: 42, material: true, source: "Ground weather station network", freshness: "1 minute", confidence: 95 },
  { id: "AD-02", name: "Fog density", current: "Low, index 0.14", normal: "Index below 0.20", forecast: "High, index 0.71", trend: "up", contribution: 27, material: true, source: "Regional radar network", freshness: "2 minutes", confidence: 92 },
  { id: "AD-03", name: "Precipitation", current: "0.2 mm/h", normal: "0 to 1 mm/h", forecast: "0.8 mm/h", trend: "up", contribution: 6, material: false, source: "Weather radar networks", freshness: "3 minutes", confidence: 90 },
  { id: "AD-04", name: "Relative humidity", current: "72%", normal: "60 to 78%", forecast: "94%", trend: "up", contribution: 18, material: true, source: "Link-site IoT sensors", freshness: "1 minute", confidence: 93 },
  { id: "AD-05", name: "Wind speed", current: "12 km/h", normal: "8 to 24 km/h", forecast: "8 km/h", trend: "down", contribution: 3, material: false, source: "Ground weather station network", freshness: "1 minute", confidence: 94 },
  { id: "AD-06", name: "Wind direction", current: "Northeast, 042 degrees", normal: "Variable", forecast: "Northeast, 038 degrees", trend: "flat", contribution: 1, material: false, source: "Ground weather station network", freshness: "1 minute", confidence: 94 },
  { id: "AD-07", name: "Temperature", current: "28.4 C", normal: "26 to 32 C", forecast: "24.1 C", trend: "down", contribution: 2, material: false, source: "ECMWF forecast model", freshness: "22 minutes", confidence: 91 },
  { id: "AD-08", name: "Atmospheric turbulence", current: "Low, Cn2 index 0.11", normal: "Index below 0.30", forecast: "Low, Cn2 index 0.13", trend: "flat", contribution: 1, material: false, source: "Terminal telemetry", freshness: "1 minute", confidence: 89 },
  { id: "AD-09", name: "Dust or smoke", current: "Not detected", normal: "Not detected", forecast: "Not detected", trend: "flat", contribution: 0, material: false, source: "Himawari satellite feed", freshness: "4 minutes", confidence: 88 },
  { id: "AD-10", name: "Structural vibration", current: "0.4 mm/s", normal: "Below 1.0 mm/s", forecast: "0.4 mm/s", trend: "flat", contribution: 0, material: false, source: "Link-site IoT sensors", freshness: "1 minute", confidence: 96 },
];

/* ------------------------------- forecast -------------------------------- */

export interface ForecastPoint {
  time: string;
  linksAffected: number;
  linksAtRisk: number;
  capacityImpact: number;
  marginLoss: number;
  attenuation: number;
  throughputReduction: number;
  fallbackDemand: number;
  confidenceLow: number;
  confidenceHigh: number;
  annotation?: string;
}

export const forecastSeries: ForecastPoint[] = [
  { time: "Now", linksAffected: 12, linksAtRisk: 4, capacityImpact: 34, marginLoss: 0.4, attenuation: 2.1, throughputReduction: 2, fallbackDemand: 0, confidenceLow: 28, confidenceHigh: 40, annotation: "Weather update received" },
  { time: "+6h", linksAffected: 28, linksAtRisk: 11, capacityImpact: 118, marginLoss: 2.6, attenuation: 4.4, throughputReduction: 9, fallbackDemand: 14, confidenceLow: 96, confidenceHigh: 142, annotation: "Preventive action window opens" },
  { time: "+12h", linksAffected: 46, linksAtRisk: 19, capacityImpact: 214, marginLoss: 4.1, attenuation: 6.2, throughputReduction: 18, fallbackDemand: 42, confidenceLow: 182, confidenceHigh: 248, annotation: "Degradation threshold crossed" },
  { time: "+18h", linksAffected: 58, linksAtRisk: 23, capacityImpact: 286, marginLoss: 4.7, attenuation: 6.8, throughputReduction: 24, fallbackDemand: 61, confidenceLow: 246, confidenceHigh: 322, annotation: "Customer impact threshold" },
  { time: "+24h", linksAffected: 54, linksAtRisk: 21, capacityImpact: 262, marginLoss: 4.3, attenuation: 6.4, throughputReduction: 21, fallbackDemand: 56 },
  { time: "+30h", linksAffected: 44, linksAtRisk: 16, capacityImpact: 198, marginLoss: 3.4, attenuation: 5.4, throughputReduction: 16, fallbackDemand: 38 },
  { time: "+36h", linksAffected: 31, linksAtRisk: 10, capacityImpact: 132, marginLoss: 2.2, attenuation: 4.1, throughputReduction: 10, fallbackDemand: 21, annotation: "Agent action, monitoring reduced" },
  { time: "+42h", linksAffected: 22, linksAtRisk: 6, capacityImpact: 78, marginLoss: 1.3, attenuation: 3.2, throughputReduction: 6, fallbackDemand: 9 },
  { time: "+48h", linksAffected: 14, linksAtRisk: 3, capacityImpact: 41, marginLoss: 0.7, attenuation: 2.4, throughputReduction: 3, fallbackDemand: 2 },
];

export const impactBreakdown = [
  { driver: "Fog and low visibility", percent: 56, capacity: 160, color: "#ea580c" },
  { driver: "Rain and moisture", percent: 24, capacity: 69, color: "#2563eb" },
  { driver: "High humidity", percent: 12, capacity: 34, color: "#059669" },
  { driver: "Wind and turbulence", percent: 6, capacity: 17, color: "#d97706" },
  { driver: "Other", percent: 2, capacity: 6, color: "#94a3b8" },
];

/* --------------------------- customer exposure --------------------------- */

export const exposureSummary = [
  { label: "Customer services exposed", value: "27" },
  { label: "Customers exposed", value: "6" },
  { label: "Committed capacity exposed", value: "286 Gbps" },
  { label: "Delivered traffic exposed", value: "214 Gbps" },
  { label: "SLOs at risk", value: "9" },
  { label: "Error budget exposure", value: "18.4% of monthly budget" },
  { label: "Services with validated fallback", value: "21" },
  { label: "Services without validated fallback", value: "6" },
  { label: "Critical services exposed", value: "4" },
  { label: "Latest safe intervention time", value: "12:30 UTC" },
];

export interface ExposureRow {
  id: string;
  customer: string;
  service: string;
  region: string;
  product: string;
  committed: string;
  throughput: string;
  driver: string;
  impact: string;
  slo: string;
  fallback: string;
  action: string;
  owner: string;
}

export const exposureRows: ExposureRow[] = [
  { id: "EX-01", customer: "Deccan Cloud Services", service: "Deccan Cloud Interconnect", region: "Chennai", product: "Lightbridge Pro", committed: "80 Gbps", throughput: "62 Gbps", driver: "Dense fog", impact: "Capacity reduction of 40 Gbps for up to 6 hours", slo: "At risk", fallback: "Ready", action: "Pre-position RF fallback", owner: "Optical Engineering" },
  { id: "EX-02", customer: "Harbour Logistics", service: "Harbour Logistics Transport", region: "Chennai", product: "Lightbridge", committed: "25 Gbps", throughput: "18 Gbps", driver: "Dense fog", impact: "Degraded throughput of about 30%", slo: "At risk", fallback: "Ready", action: "Place link under fog watch", owner: "Service Operations" },
  { id: "EX-03", customer: "Coastal Data Networks", service: "Coastal Data Backhaul", region: "Chennai", product: "Beam", committed: "15 Gbps", throughput: "11 Gbps", driver: "Dense fog", impact: "Fallback headroom insufficient by 2 Gbps", slo: "Breaching", fallback: "Partial", action: "Increase fallback allocation", owner: "Capacity Management" },
  { id: "EX-04", customer: "Meridian Financial", service: "Meridian Financial Trading", region: "Mumbai", product: "Lightbridge Pro", committed: "24 Gbps", throughput: "20 Gbps", driver: "Low visibility", impact: "Latency variance during fallback", slo: "At risk", fallback: "Ready", action: "Raise monitoring frequency", owner: "Optical Engineering" },
  { id: "EX-05", customer: "Rift Valley Telecom", service: "Rift Valley Backbone", region: "Gulf of Guinea", product: "Lightbridge Pro", committed: "20 Gbps", throughput: "16 Gbps", driver: "Heavy rain", impact: "Rain attenuation of about 4 dB", slo: "At risk", fallback: "Not validated", action: "Validate RF fallback", owner: "Field Engineering" },
  { id: "EX-06", customer: "Southern Cross Media", service: "Southern Cross Distribution", region: "Rio de Janeiro", product: "Lightbridge Pro", committed: "18 Gbps", throughput: "13 Gbps", driver: "High humidity", impact: "Marginal attenuation increase", slo: "Within budget", fallback: "Ready", action: "Monitor humidity trend", owner: "Service Operations" },
];

/* ---------------------------- connected sources -------------------------- */

export interface DataSource {
  id: string;
  category: string;
  name: string;
  status: "Live" | "Degraded" | "Stale" | "Offline";
  lastUpdate: string;
  coverage: string;
  latency: string;
  completeness: string;
  reliability: number;
  records: string;
  issue: string;
  contribution: number;
  effect: string;
  resolution: string;
}

export const dataSources: DataSource[] = [
  { id: "DS-01", category: "Satellite observations", name: "Himawari satellite feed", status: "Live", lastUpdate: "09:36 UTC", coverage: "Asia Pacific", latency: "4 minutes", completeness: "99.2%", reliability: 96, records: "4,812 cells", issue: "None", contribution: 18, effect: "Primary visibility and cloud structure input", resolution: "Not required" },
  { id: "DS-02", category: "Satellite observations", name: "GOES satellite feed", status: "Live", lastUpdate: "09:35 UTC", coverage: "Americas", latency: "5 minutes", completeness: "98.7%", reliability: 95, records: "3,904 cells", issue: "None", contribution: 11, effect: "Visibility and convective structure for Americas", resolution: "Not required" },
  { id: "DS-03", category: "Satellite observations", name: "Meteosat satellite feed", status: "Live", lastUpdate: "09:34 UTC", coverage: "Europe, Africa", latency: "6 minutes", completeness: "98.1%", reliability: 94, records: "3,518 cells", issue: "None", contribution: 10, effect: "Rainband tracking for Gulf of Guinea", resolution: "Not required" },
  { id: "DS-04", category: "Global numerical weather models", name: "ECMWF forecast model", status: "Live", lastUpdate: "09:16 UTC", coverage: "Global", latency: "22 minutes", completeness: "100%", reliability: 93, records: "1 run", issue: "None", contribution: 14, effect: "Primary 48 hour forecast trajectory", resolution: "Not required" },
  { id: "DS-05", category: "Global numerical weather models", name: "GFS forecast model", status: "Live", lastUpdate: "09:12 UTC", coverage: "Global", latency: "26 minutes", completeness: "100%", reliability: 90, records: "1 run", issue: "None", contribution: 9, effect: "Cross-check for forecast agreement", resolution: "Not required" },
  { id: "DS-06", category: "Regional weather models and radar", name: "Regional radar network", status: "Live", lastUpdate: "09:40 UTC", coverage: "India, Southeast Asia, West Africa", latency: "2 minutes", completeness: "97.4%", reliability: 92, records: "612 sweeps", issue: "Two radars offline for maintenance in Southeast Asia", contribution: 12, effect: "Reduced rainfall precision in Southeast Asia", resolution: "Maintenance ends 14:00 UTC" },
  { id: "DS-07", category: "Ground weather stations", name: "Ground weather station network", status: "Live", lastUpdate: "09:41 UTC", coverage: "512 stations", latency: "1 minute", completeness: "96.8%", reliability: 94, records: "512 records", issue: "16 stations reporting intermittently", contribution: 13, effect: "Minor gaps interpolated from neighbouring stations", resolution: "Monitoring" },
  { id: "DS-08", category: "Link-site environmental sensors", name: "Link-site IoT sensors", status: "Live", lastUpdate: "09:41 UTC", coverage: "1,248 link sites", latency: "1 minute", completeness: "99.6%", reliability: 97, records: "1,242 records", issue: "6 sensors offline", contribution: 8, effect: "Route humidity interpolated for 6 links", resolution: "Field ticket raised" },
  { id: "DS-09", category: "Aircraft observations", name: "Aircraft weather observations", status: "Degraded", lastUpdate: "09:04 UTC", coverage: "Major flight corridors", latency: "38 minutes", completeness: "72.4%", reliability: 78, records: "184 reports", issue: "Reduced report frequency overnight", contribution: 3, effect: "Small reduction in upper-level confidence", resolution: "Expected to recover by 11:00 UTC" },
  { id: "DS-10", category: "Historical records", name: "Ten-year historical weather archive", status: "Live", lastUpdate: "09:00 UTC", coverage: "Global, 10 years", latency: "Hourly", completeness: "100%", reliability: 98, records: "3,652 daily summaries", issue: "None", contribution: 12, effect: "Historical fog signature matching", resolution: "Not required" },
];

export const qualityChecks = [
  { id: "QC-01", label: "Source completeness", value: "97.8%", state: "Pass" },
  { id: "QC-02", label: "Source freshness", value: "9 of 10 sources within target", state: "Watch" },
  { id: "QC-03", label: "Time alignment", value: "Within 5 minutes", state: "Pass" },
  { id: "QC-04", label: "Route coverage", value: "98.4% of route segments", state: "Pass" },
  { id: "QC-05", label: "Sensor consistency", value: "0.4 dB mean deviation", state: "Pass" },
  { id: "QC-06", label: "Forecast agreement", value: "ECMWF and GFS agree within 0.6 km visibility", state: "Pass" },
  { id: "QC-07", label: "Missing values", value: "1.6% interpolated", state: "Watch" },
  { id: "QC-08", label: "Stale values", value: "1 source above latency target", state: "Watch" },
  { id: "QC-09", label: "Conflicting sources", value: "None unresolved", state: "Pass" },
  { id: "QC-10", label: "Low-confidence regions", value: "Dubai corridor flagged", state: "Watch" },
];

/* -------------------------- evidence and confidence ---------------------- */

export interface EvidenceItem {
  id: string;
  label: string;
  detail: string;
  source: string;
  supports: "Supports" | "Neutral" | "Contradicts";
  weight: "High" | "Medium" | "Low";
}

export const predictionEvidence: EvidenceItem[] = [
  { id: "EV-01", label: "Visibility forecast decline", detail: "8.6 km falling to 1.8 km within six hours", source: "Ground weather station network", supports: "Supports", weight: "High" },
  { id: "EV-02", label: "Fog density increase", detail: "Density index rising from 0.14 to 0.71", source: "Regional radar network", supports: "Supports", weight: "High" },
  { id: "EV-03", label: "Humidity increase", detail: "72% rising to 94%", source: "Link-site IoT sensors", supports: "Supports", weight: "Medium" },
  { id: "EV-04", label: "Received optical power decline", detail: "-20.6 dBm falling to -21.4 dBm over four hours", source: "Optical link telemetry", supports: "Supports", weight: "High" },
  { id: "EV-05", label: "Optical attenuation increase", detail: "1.6 dB rising to 2.1 dB", source: "Optical link telemetry", supports: "Supports", weight: "High" },
  { id: "EV-06", label: "Link-margin decline", detail: "10.5 dB falling to 7.4 dB over four hours", source: "Optical link telemetry", supports: "Supports", weight: "High" },
  { id: "EV-07", label: "Historical Chennai fog signature", detail: "Matches 11 of 13 prior seasonal fog events", source: "Ten-year historical weather archive", supports: "Supports", weight: "High" },
  { id: "EV-08", label: "Similar nearby-link behaviour", detail: "CHN-TRV-030 and CHN-PDY-018 show the same margin slope", source: "Optical link telemetry", supports: "Supports", weight: "Medium" },
  { id: "EV-09", label: "Stable terminal health", detail: "No hardware fault, temperature and current nominal", source: "Terminal telemetry", supports: "Neutral", weight: "Medium" },
  { id: "EV-10", label: "Stable beam alignment", detail: "Pointing error 0.11 mrad, within tolerance", source: "Terminal telemetry", supports: "Neutral", weight: "Medium" },
  { id: "EV-11", label: "Stable mounting vibration", detail: "0.4 mm/s, well below the 1.0 mm/s threshold", source: "Link-site IoT sensors", supports: "Neutral", weight: "Low" },
  { id: "EV-12", label: "Stable upstream and downstream path", detail: "No packet loss or latency deviation on adjacent segments", source: "Network performance telemetry", supports: "Neutral", weight: "Medium" },
  { id: "EV-13", label: "Available RF fallback capacity", detail: "9 Gbps headroom validated at 09:20 UTC", source: "Service topology", supports: "Supports", weight: "Medium" },
  { id: "EV-14", label: "Current customer traffic", detail: "62 Gbps delivered against an 80 Gbps commitment", source: "Network performance telemetry", supports: "Supports", weight: "Medium" },
];

export const confidenceContributors = [
  { label: "Source agreement", value: 96, note: "ECMWF and GFS agree within 0.6 km visibility" },
  { label: "Data freshness", value: 95, note: "Nine of ten sources within latency target" },
  { label: "Historical match", value: 92, note: "11 of 13 prior Chennai fog events match" },
  { label: "Optical correlation", value: 94, note: "Margin decline correlates with visibility decline at r = 0.88" },
  { label: "Similar-link agreement", value: 90, note: "Two nearby links show the same slope" },
  { label: "Sensor quality", value: 97, note: "Link-site sensors reporting at 99.6% completeness" },
  { label: "Forecast stability", value: 91, note: "Three consecutive runs produced the same trajectory" },
  { label: "Model calibration", value: 93, note: "Chennai fog threshold recalibrated on 4 May 2026" },
];

export const missingEvidence = [
  "Aircraft observations reduced overnight, upper-level moisture profile is partly interpolated",
  "Two Southeast Asia radars offline, not material to the Chennai prediction",
];

export const contradictingEvidence = [
  "Wind forecast falling from 12 km/h to 8 km/h slightly reduces expected dispersion of the fog layer",
  "Temperature falling to 24.1 C is consistent with fog formation but was not observed in two prior matched events",
];

/* --------------------------- historical events --------------------------- */

export interface HistoricalEvent {
  id: string;
  name: string;
  similarity: number;
  driver: string;
  opticalEffect: string;
  customerImpact: string;
  fallbackAction: string;
  recoveryTime: string;
  accuracy: string;
  outcome: string;
  evidenceQuality: string;
  lesson: string;
}

export const historicalEvents: HistoricalEvent[] = [
  { id: "HE-01", name: "Chennai seasonal fog event, 12 January 2026", similarity: 94, driver: "Dense fog", opticalEffect: "Margin fell 5.2 dB over five hours", customerImpact: "38 Gbps degraded for 3 hours", fallbackAction: "RF fallback engaged for priority services", recoveryTime: "3 hours 40 minutes", accuracy: "Predicted correctly, 6.2 hours warning", outcome: "No customer incident raised", evidenceQuality: "High", lesson: "Pre-positioning fallback one hour earlier removed all customer impact" },
  { id: "HE-02", name: "Mumbai visibility degradation, 3 February 2026", similarity: 81, driver: "Low visibility", opticalEffect: "Margin fell 3.4 dB over seven hours", customerImpact: "22 Gbps degraded for 2 hours", fallbackAction: "Monitoring increased, no fallback required", recoveryTime: "2 hours 10 minutes", accuracy: "Predicted correctly, 8.4 hours warning", outcome: "Service maintained", evidenceQuality: "High", lesson: "Dust contribution was overestimated, threshold recalibrated" },
  { id: "HE-03", name: "Nairobi heavy rain event, 21 March 2026", similarity: 68, driver: "Heavy rain", opticalEffect: "Attenuation rose 4.1 dB during a 40 minute cell", customerImpact: "15 Gbps degraded for 45 minutes", fallbackAction: "Automatic traffic reroute", recoveryTime: "48 minutes", accuracy: "Predicted correctly, 2.1 hours warning", outcome: "SLO preserved", evidenceQuality: "Medium", lesson: "Short convective cells need radar rather than model input" },
  { id: "HE-04", name: "Gulf of Guinea rain attenuation, 8 April 2026", similarity: 63, driver: "Heavy rain", opticalEffect: "Attenuation rose 5.6 dB across five links", customerImpact: "20 Gbps unavailable for 1 hour", fallbackAction: "Fallback unavailable, manual reroute", recoveryTime: "1 hour 20 minutes", accuracy: "Predicted late, 0.8 hours warning", outcome: "Customer incident raised", evidenceQuality: "Medium", lesson: "Fallback validation must precede the rainy season" },
  { id: "HE-05", name: "Rio high-humidity event, 2 May 2026", similarity: 57, driver: "High humidity", opticalEffect: "Margin fell 1.8 dB over twelve hours", customerImpact: "None", fallbackAction: "None required", recoveryTime: "Not applicable", accuracy: "False positive, no degradation observed", outcome: "Prediction withdrawn", evidenceQuality: "Medium", lesson: "Humidity alone is a weak predictor below 95%" },
];

/* ----------------------------- weather watches --------------------------- */

export interface WeatherWatch {
  id: string;
  corridor: string;
  type: string;
  start: string;
  end: string;
  links: number;
  customers: number;
  capacity: string;
  risk: WeatherRiskState;
  owner: string;
  status: "Active" | "Closed";
}

export const weatherWatches: WeatherWatch[] = [
  { id: "WW-01", corridor: "South India, Chennai", type: "Fog Watch", start: "09:30 UTC", end: "21:00 UTC", links: 12, customers: 3, capacity: "160 Gbps", risk: "High", owner: "Optical Engineering", status: "Active" },
  { id: "WW-02", corridor: "Central India, Mumbai", type: "Visibility Watch", start: "09:10 UTC", end: "23:00 UTC", links: 9, customers: 3, capacity: "69 Gbps", risk: "Moderate", owner: "Service Operations", status: "Active" },
  { id: "WW-03", corridor: "Gulf of Guinea Coast", type: "Rain Watch", start: "08:50 UTC", end: "18:00 UTC", links: 11, customers: 2, capacity: "48 Gbps", risk: "Moderate", owner: "Field Engineering", status: "Active" },
  { id: "WW-04", corridor: "Brazil, Rio de Janeiro", type: "Humidity Watch", start: "07:40 UTC", end: "22:00 UTC", links: 7, customers: 2, capacity: "34 Gbps", risk: "Low", owner: "Service Operations", status: "Active" },
  { id: "WW-05", corridor: "Southeast Asia", type: "Convective Activity Watch", start: "06:20 UTC", end: "20:00 UTC", links: 6, customers: 2, capacity: "17 Gbps", risk: "Low", owner: "Optical Engineering", status: "Active" },
];

/* ------------------------------ alerts, history -------------------------- */

export interface WeatherAlert {
  id: string;
  time: string;
  region: string;
  condition: string;
  severity: "High" | "Moderate" | "Low";
  links: number;
  services: number;
  status: string;
  actionTaken: string;
}

export const weatherAlerts: WeatherAlert[] = [
  { id: "WA-01", time: "09:38 UTC", region: "Chennai", condition: "Dense fog formation", severity: "High", links: 6, services: 9, status: "Open", actionTaken: "Fog watch opened, fallback pre-positioning requested" },
  { id: "WA-02", time: "09:12 UTC", region: "Mumbai", condition: "Visibility degradation", severity: "Moderate", links: 4, services: 6, status: "Open", actionTaken: "Monitoring frequency increased to 1 minute" },
  { id: "WA-03", time: "08:54 UTC", region: "Gulf of Guinea", condition: "Heavy rain forecast", severity: "Moderate", links: 5, services: 5, status: "Open", actionTaken: "Fallback validation requested from field engineering" },
  { id: "WA-04", time: "08:33 UTC", region: "Rio de Janeiro", condition: "High humidity", severity: "Low", links: 3, services: 4, status: "Monitoring", actionTaken: "No action required" },
  { id: "WA-05", time: "07:58 UTC", region: "Southeast Asia", condition: "Convective activity", severity: "Low", links: 2, services: 3, status: "Monitoring", actionTaken: "Radar cadence increased" },
];

export interface PredictionRecord {
  id: string;
  time: string;
  prediction: string;
  region: string;
  links: number;
  confidence: number;
  window: string;
  action: string;
  outcome: string;
}

export const recentPredictions: PredictionRecord[] = [
  { id: "PR-01", time: "09:38 UTC", prediction: "Fog impact on six Chennai links", region: "Chennai", links: 6, confidence: 94, window: "+3h to +9h", action: "Pre-position RF fallback", outcome: "Awaiting validation" },
  { id: "PR-02", time: "09:12 UTC", prediction: "Visibility drop on the Mumbai corridor", region: "Mumbai", links: 4, confidence: 88, window: "+6h to +12h", action: "Raise monitoring frequency", outcome: "Awaiting validation" },
  { id: "PR-03", time: "08:54 UTC", prediction: "Rain impact on Gulf Coast links", region: "Gulf of Guinea", links: 5, confidence: 90, window: "+2h to +8h", action: "Validate RF fallback", outcome: "Awaiting validation" },
  { id: "PR-04", time: "08:33 UTC", prediction: "Humidity effect on the Rio corridor", region: "Rio de Janeiro", links: 3, confidence: 76, window: "+12h to +24h", action: "Monitor only", outcome: "Confirmed, no degradation" },
  { id: "PR-05", time: "03:38 UTC", prediction: "Overnight fog on two Chennai links", region: "Chennai", links: 2, confidence: 91, window: "+2h to +6h", action: "Increase monitoring", outcome: "Confirmed correct" },
];

/* --------------------------- prediction performance ---------------------- */

export const performanceSummary = [
  { label: "Predictions generated", value: "1,248" },
  { label: "High-risk predictions", value: "86" },
  { label: "Confirmed predictions", value: "1,174" },
  { label: "False positives", value: "9" },
  { label: "Missed events", value: "3" },
  { label: "Average warning time", value: "5.8 hours" },
  { label: "Prediction precision", value: "92.4%" },
  { label: "Prediction recall", value: "96.1%" },
  { label: "Average confidence", value: "91.8%" },
  { label: "Capacity impact prevented", value: "286 Gbps" },
];

export const accuracyTrend = [
  { day: "May 8", accuracy: 91, warning: 5.1 },
  { day: "May 9", accuracy: 92, warning: 5.3 },
  { day: "May 10", accuracy: 93, warning: 5.6 },
  { day: "May 11", accuracy: 92, warning: 5.4 },
  { day: "May 12", accuracy: 94, warning: 5.9 },
  { day: "May 13", accuracy: 95, warning: 6.1 },
  { day: "May 14", accuracy: 94, warning: 5.8 },
];

export const accuracyByDriver = [
  { key: "Dense fog", accuracy: 96 },
  { key: "Low visibility", accuracy: 93 },
  { key: "Heavy rain", accuracy: 91 },
  { key: "High humidity", accuracy: 84 },
  { key: "Wind", accuracy: 88 },
  { key: "Convective activity", accuracy: 86 },
];

export const accuracyByRegion = [
  { key: "Chennai", accuracy: 96 },
  { key: "Mumbai", accuracy: 93 },
  { key: "Gulf of Guinea", accuracy: 89 },
  { key: "Rio de Janeiro", accuracy: 85 },
  { key: "Southeast Asia", accuracy: 87 },
  { key: "Nairobi", accuracy: 90 },
];

export const accuracyByProduct = [
  { key: "Lightbridge", accuracy: 92 },
  { key: "Lightbridge Pro", accuracy: 95 },
  { key: "Beam", accuracy: 89 },
];

export const warningDistribution = [
  { bucket: "0 to 2h", count: 84 },
  { bucket: "2 to 4h", count: 196 },
  { bucket: "4 to 6h", count: 412 },
  { bucket: "6 to 8h", count: 338 },
  { bucket: "8 to 12h", count: 162 },
  { bucket: "Over 12h", count: 56 },
];

export const confidenceCalibration = [
  { bucket: "60 to 70%", predicted: 65, observed: 62 },
  { bucket: "70 to 80%", predicted: 75, observed: 73 },
  { bucket: "80 to 90%", predicted: 85, observed: 86 },
  { bucket: "90 to 95%", predicted: 92, observed: 93 },
  { bucket: "Above 95%", predicted: 97, observed: 96 },
];

export const twinOutcomes = [
  { label: "Predictions generated", value: "1,248" },
  { label: "High-risk predictions", value: "86" },
  { label: "Prediction accuracy", value: "94%" },
  { label: "Predicted capacity impact", value: "286 Gbps" },
  { label: "Outage minutes avoided", value: "1,248" },
  { label: "Preventive actions initiated", value: "83" },
  { label: "Customer incidents avoided", value: "18" },
  { label: "Field visits avoided", value: "7" },
  { label: "False positives", value: "9" },
  { label: "Average warning time", value: "5.8 hours" },
];

/* ------------------------------ query prompts ---------------------------- */

export interface WitPrompt {
  id: string;
  prompt: string;
  answer: string;
  detail: string[];
  focusRegion?: string;
  focusDriver?: string;
  focusPanel?: "risks" | "quality" | "exposure" | "evidence";
}

export const witPrompts: WitPrompt[] = [
  { id: "Q1", prompt: "Which links are most exposed to fog in the next six hours?", answer: "Six Chennai links are exposed to dense fog within the next six hours.", detail: ["CHN-MBL-041 and CHN-MBL-042 at 92% and 89% probability", "CHN-TRV-030, CHN-PDY-018 and CHN-VZG-022 follow between 72% and 86%", "160 Gbps of committed capacity is exposed"], focusRegion: "Chennai", focusDriver: "Dense fog", focusPanel: "risks" },
  { id: "Q2", prompt: "Why is Chennai classified as high risk?", answer: "Visibility falls from 8.6 km to 1.8 km while link margin has already declined 3.1 dB.", detail: ["Fog density index rises from 0.14 to 0.71", "The pattern matches 11 of 13 prior Chennai fog events", "Terminal health, alignment and vibration are all stable, so the cause is environmental"], focusRegion: "Chennai", focusPanel: "evidence" },
  { id: "Q3", prompt: "Show links where weather risk and declining link margin agree.", answer: "Five links show both an atmospheric risk and an observed margin decline.", detail: ["CHN-MBL-041, CHN-MBL-042, CHN-TRV-030, GOG-LOS-004, NBO-MBA-005", "Correlation between visibility decline and margin decline is r = 0.88"], focusPanel: "risks" },
  { id: "Q4", prompt: "Show weather risks where fallback capacity is insufficient.", answer: "Two corridors do not have validated fallback capacity.", detail: ["Gulf of Guinea Coast, fallback not validated across five links", "CHN-VZG-022 has partial fallback with a 2 Gbps shortfall"], focusPanel: "exposure" },
  { id: "Q5", prompt: "Which predictions have the lowest confidence?", answer: "The Dubai corridor prediction is withheld at 42% confidence.", detail: ["A missing ground sensor prevents route-level visibility calculation", "The Rio humidity prediction is next lowest at 76%"], focusRegion: "Dubai", focusPanel: "quality" },
  { id: "Q6", prompt: "Which data sources are stale?", answer: "Aircraft weather observations are degraded at 38 minutes latency.", detail: ["Report frequency fell overnight, completeness is 72.4%", "Upper-level confidence is reduced by roughly 2 points", "Recovery expected by 11:00 UTC"], focusPanel: "quality" },
  { id: "Q7", prompt: "Compare the Chennai forecast with the previous forecast run.", answer: "The 09:38 run brings the impact window forward by 40 minutes.", detail: ["Forecast visibility fell from 2.4 km to 1.8 km between runs", "Probability rose from 87% to 92%", "Three consecutive runs now agree on the trajectory"], focusRegion: "Chennai", focusPanel: "risks" },
  { id: "Q8", prompt: "Show customer services exposed to heavy rain.", answer: "Five services across the Gulf of Guinea and Nairobi are exposed to heavy rain.", detail: ["Rift Valley Backbone carries the largest exposure at 20 Gbps", "One service has no validated fallback"], focusDriver: "Heavy rain", focusPanel: "exposure" },
  { id: "Q9", prompt: "Which weather predictions became actual service incidents?", answer: "One of the last twenty high-risk predictions became a customer incident.", detail: ["Gulf of Guinea rain attenuation on 8 April 2026", "Warning time was only 0.8 hours and fallback was unavailable"], focusPanel: "evidence" },
  { id: "Q10", prompt: "Which links require an operational watch?", answer: "Twelve links meet the watch threshold that are not yet under an active watch.", detail: ["Six in Chennai, four in Mumbai, two in Nairobi", "All twelve have a preventive action window longer than three hours"], focusPanel: "risks" },
];

/* ------------------------------- scenario -------------------------------- */

export interface WitScenarioStage {
  index: number;
  label: string;
  narrative: string;
  atRisk: number;
  underWatch: number;
  capacity: string;
  confidence: number;
  chennaiState: WeatherRiskState;
  visibility: string;
  fogDensity: string;
  awaitingApproval?: boolean;
  prediction?: PredictionRecord;
  watch?: WeatherWatch;
}

export const chennaiWeatherScenario: WitScenarioStage[] = [
  { index: 0, label: "Satellite and ground data update", narrative: "Himawari and 512 ground stations deliver the 09:36 UTC observation set for the Chennai corridor.", atRisk: 17, underWatch: 56, capacity: "214 Gbps", confidence: 92, chennaiState: "Monitoring", visibility: "8.6 km", fogDensity: "Low, index 0.14" },
  { index: 1, label: "Visibility forecast declines", narrative: "The 09:38 forecast run lowers Chennai route visibility from 8.6 km to 1.8 km within six hours.", atRisk: 18, underWatch: 58, capacity: "228 Gbps", confidence: 92, chennaiState: "Moderate", visibility: "8.6 km falling to 1.8 km", fogDensity: "Low, index 0.14" },
  { index: 2, label: "Fog-density forecast increases", narrative: "Radar-derived fog density rises from 0.14 to 0.71 across the coastal segment.", atRisk: 19, underWatch: 60, capacity: "236 Gbps", confidence: 92, chennaiState: "Moderate", visibility: "Falling to 1.8 km", fogDensity: "Rising to 0.71" },
  { index: 3, label: "Route-level alignment", narrative: "The 48.2 km Chennai route is split into 12 segments and matched to 2 km weather cells.", atRisk: 19, underWatch: 62, capacity: "244 Gbps", confidence: 93, chennaiState: "Moderate", visibility: "Falling to 1.8 km", fogDensity: "Rising to 0.71" },
  { index: 4, label: "Data-quality checks pass", narrative: "Route coverage is 98.4%, time alignment is within five minutes and no source conflict is unresolved.", atRisk: 19, underWatch: 62, capacity: "244 Gbps", confidence: 94, chennaiState: "Moderate", visibility: "Falling to 1.8 km", fogDensity: "Rising to 0.71" },
  { index: 5, label: "Optical telemetry compared", narrative: "Observed margin decline is compared with the forecast attenuation curve for each Chennai link.", atRisk: 20, underWatch: 64, capacity: "252 Gbps", confidence: 94, chennaiState: "High", visibility: "Falling to 1.8 km", fogDensity: "Rising to 0.71" },
  { index: 6, label: "Link-margin decline detected", narrative: "CHN-MBL-041 margin has fallen 3.1 dB over four hours to 7.4 dB, correlating with visibility at r = 0.88.", atRisk: 21, underWatch: 66, capacity: "264 Gbps", confidence: 94, chennaiState: "High", visibility: "Falling to 1.8 km", fogDensity: "Rising to 0.71" },
  { index: 7, label: "Historical fog signature matched", narrative: "The pattern matches 11 of 13 prior Chennai seasonal fog events, including 12 January 2026.", atRisk: 21, underWatch: 66, capacity: "264 Gbps", confidence: 95, chennaiState: "High", visibility: "Falling to 1.8 km", fogDensity: "Rising to 0.71" },
  { index: 8, label: "Six links move into watch", narrative: "Six Chennai links are placed under an active fog watch with one-minute monitoring.", atRisk: 21, underWatch: 68, capacity: "272 Gbps", confidence: 95, chennaiState: "High", visibility: "Falling to 1.8 km", fogDensity: "Rising to 0.71", watch: { id: "WW-06", corridor: "South India, Chennai", type: "Fog Watch, scenario", start: "09:44 UTC", end: "21:00 UTC", links: 6, customers: 3, capacity: "160 Gbps", risk: "High", owner: "Optical Engineering", status: "Active" } },
  { index: 9, label: "Three links move to high risk", narrative: "CHN-MBL-041, CHN-MBL-042 and CHN-TRV-030 cross the degradation threshold inside the horizon.", atRisk: 23, underWatch: 68, capacity: "286 Gbps", confidence: 94, chennaiState: "High", visibility: "1.8 km forecast", fogDensity: "0.71 forecast" },
  { index: 10, label: "Customer and capacity exposure calculated", narrative: "Nine customer services and 160 Gbps of committed capacity are exposed across three customers.", atRisk: 23, underWatch: 68, capacity: "286 Gbps", confidence: 94, chennaiState: "High", visibility: "1.8 km forecast", fogDensity: "0.71 forecast" },
  { index: 11, label: "Fallback readiness checked", narrative: "RF fallback headroom of 9 Gbps is validated for priority services; CHN-VZG-022 is short by 2 Gbps.", atRisk: 23, underWatch: 68, capacity: "286 Gbps", confidence: 94, chennaiState: "High", visibility: "1.8 km forecast", fogDensity: "0.71 forecast" },
  { index: 12, label: "Preventive actions recommended", narrative: "Pre-position RF fallback, raise monitoring frequency and notify customer operations.", atRisk: 23, underWatch: 68, capacity: "286 Gbps", confidence: 94, chennaiState: "Preventive action active", visibility: "1.8 km forecast", fogDensity: "0.71 forecast" },
  { index: 13, label: "Human approval requested", narrative: "Moving priority traffic to RF fallback requires human approval. Rollback checkpoint is verified.", atRisk: 23, underWatch: 68, capacity: "286 Gbps", confidence: 94, chennaiState: "Preventive action active", visibility: "1.8 km forecast", fogDensity: "0.71 forecast", awaitingApproval: true },
  { index: 14, label: "Weather impact occurs", narrative: "Visibility falls to 1.9 km at 15:20 UTC. Margin reaches 3.2 dB with traffic already on fallback.", atRisk: 21, underWatch: 68, capacity: "248 Gbps", confidence: 95, chennaiState: "Preventive action active", visibility: "1.9 km observed", fogDensity: "0.69 observed" },
  { index: 15, label: "Prediction validated against telemetry", narrative: "Observed margin trajectory is compared with the predicted curve; deviation is 0.3 dB.", atRisk: 12, underWatch: 62, capacity: "142 Gbps", confidence: 96, chennaiState: "Risk mitigated", visibility: "1.9 km observed", fogDensity: "0.69 observed", prediction: { id: "PR-06", time: "15:20 UTC", prediction: "Fog impact on six Chennai links", region: "Chennai", links: 6, confidence: 94, window: "+3h to +9h", action: "RF fallback engaged", outcome: "Confirmed correct, 0.3 dB deviation" } },
  { index: 16, label: "Prediction accuracy updated", narrative: "Month-to-date accuracy rises to 94.2% and the Chennai fog threshold is recalibrated.", atRisk: 9, underWatch: 58, capacity: "108 Gbps", confidence: 96, chennaiState: "Risk mitigated", visibility: "Recovering", fogDensity: "Falling" },
  { index: 17, label: "Operational knowledge recorded", narrative: "Evidence, actions and outcome are stored against the Chennai fog signature for future matching.", atRisk: 7, underWatch: 54, capacity: "86 Gbps", confidence: 96, chennaiState: "Risk mitigated", visibility: "Recovered, 8.2 km", fogDensity: "Low, index 0.16" },
];

export const corridorTabs = [
  "Summary", "Weather Inputs", "Optical Evidence", "Forecast",
  "Customer Exposure", "Similar Events", "Data Quality", "Prediction History",
] as const;

export type CorridorTab = typeof corridorTabs[number];
