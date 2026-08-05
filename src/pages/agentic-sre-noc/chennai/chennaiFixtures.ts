/**
 * AIM-003 — Chennai Fog Scenario fixtures.
 *
 * Synthetic demonstration data only. Coordinates are real Chennai-area
 * longitudes and latitudes so the MapLibre geometry is genuinely geographic,
 * but every operational value, customer, terminal and event is invented for
 * this demonstration.
 */

export type RiskClassName = "High" | "Moderate" | "Low" | "Unknown";
export type Criticality = "Critical" | "High" | "Standard" | "Low";

export interface ChennaiTerminal {
  id: string;
  name: string;
  /** [longitude, latitude] */ coordinates: [number, number];
  product: string;
  health: "Healthy" | "Degrading" | "Impaired";
  pairedTerminalId: string;
  linkId: string;
  beamLock: "Locked" | "Reacquiring" | "Lost";
  temperatureC: number;
  firmware: string;
  telemetryFreshnessSec: number;
  pointingErrorMdeg: number;
  reacquisitionCount24h: number;
  powerDrawW: number;
  restarts30d: number;
}

export interface ChennaiLink {
  id: string;
  name: string;
  regionId: string;
  product: string;
  terminalA: string;
  terminalB: string;
  distanceKm: number;
  riskScore: number;
  riskClass: RiskClassName;
  confidencePct: number;
  predictedImpactMinutes: number;
  capacityGbps: number;
  currentThroughputGbps: number;
  availabilityPct: number;
  customerServiceCount: number;
  customerServiceIds: string[];
  primaryDriver: string;
  fallbackReady: boolean;
  fallbackHeadroomPct: number;
  fallbackLatencyMs: number;
  fallbackPacketLossPct: number;
  fallbackValidationAgeHours: number;
  linkMarginDb: number;
  linkMarginBaselineDb: number;
  thresholdMarginDb: number;
  receivedPowerDbm: number;
  attenuationDb: number;
  visibilityKm: number;
  fogProbability: number;
  humidityPct: number;
  rainfallMmHr: number;
  windKph: number;
  degradationRateDbHr: number;
  dataQualityPct: number;
  sourceAgreementPct: number;
  serviceCriticality: Criticality;
  currentStatus: "Healthy" | "At risk" | "Degrading" | "Protected";
  recommendedAction: string;
  historicalSimilarity: number;
  terminalHealthScore: number;
  alignmentStability: number;
  sloTargetPct: number;
  errorBudgetRemainingPct: number;
  lastEvaluated: string;
  lastTelemetry: string;
}

export const CHENNAI_REGION_ID = "REG-CHN";
export const CHENNAI_MODEL_VERSION = "v2.4.1";
export const DEFAULT_CHENNAI_LINK_ID = "CHN-MBL-041";
export const CHENNAI_SCENARIO_LABEL = "Chennai Fog Scenario";

/** Chennai metropolitan and regional service area. */
export const CHENNAI_BOUNDS: [[number, number], [number, number]] = [
  [79.98, 12.74],
  [80.44, 13.34],
];

export const CHENNAI_CENTER: [number, number] = [80.21, 13.04];

export const chennaiTerminals: ChennaiTerminal[] = [
  {
    id: "TRM-CHN-A041", name: "Chennai Guindy Rooftop A", coordinates: [80.2119, 13.0067],
    product: "Lightbridge Terminal", health: "Degrading", pairedTerminalId: "TRM-CHN-B041",
    linkId: "CHN-MBL-041", beamLock: "Locked", temperatureC: 41.2, firmware: "2.8.4-lb",
    telemetryFreshnessSec: 28, pointingErrorMdeg: 0.34, reacquisitionCount24h: 2, powerDrawW: 38.4, restarts30d: 0,
  },
  {
    id: "TRM-CHN-B041", name: "Chennai Perungudi Tower B", coordinates: [80.2461, 12.9612],
    product: "Lightbridge Terminal", health: "Degrading", pairedTerminalId: "TRM-CHN-A041",
    linkId: "CHN-MBL-041", beamLock: "Locked", temperatureC: 42.8, firmware: "2.8.4-lb",
    telemetryFreshnessSec: 31, pointingErrorMdeg: 0.41, reacquisitionCount24h: 3, powerDrawW: 39.1, restarts30d: 1,
  },
  {
    id: "TRM-CHN-A042", name: "Chennai Marina Coast A", coordinates: [80.2833, 13.0521],
    product: "Lightbridge Terminal", health: "Degrading", pairedTerminalId: "TRM-CHN-B042",
    linkId: "CHN-MBL-042", beamLock: "Locked", temperatureC: 40.1, firmware: "2.8.4-lb",
    telemetryFreshnessSec: 34, pointingErrorMdeg: 0.29, reacquisitionCount24h: 1, powerDrawW: 37.8, restarts30d: 0,
  },
  {
    id: "TRM-CHN-B042", name: "Chennai Kilpauk North B", coordinates: [80.2402, 13.0812],
    product: "Lightbridge Terminal", health: "Healthy", pairedTerminalId: "TRM-CHN-A042",
    linkId: "CHN-MBL-042", beamLock: "Locked", temperatureC: 39.4, firmware: "2.8.4-lb",
    telemetryFreshnessSec: 26, pointingErrorMdeg: 0.22, reacquisitionCount24h: 0, powerDrawW: 37.1, restarts30d: 0,
  },
  {
    id: "TRM-CHN-A043", name: "Chennai Porur West A", coordinates: [80.1592, 13.0359],
    product: "Metro Backhaul", health: "Degrading", pairedTerminalId: "TRM-CHN-B043",
    linkId: "CHN-MBL-043", beamLock: "Reacquiring", temperatureC: 43.6, firmware: "2.7.9-mb",
    telemetryFreshnessSec: 44, pointingErrorMdeg: 0.62, reacquisitionCount24h: 6, powerDrawW: 41.2, restarts30d: 2,
  },
  {
    id: "TRM-CHN-B043", name: "Chennai Egmore Core B", coordinates: [80.2601, 13.0732],
    product: "Metro Backhaul", health: "Healthy", pairedTerminalId: "TRM-CHN-A043",
    linkId: "CHN-MBL-043", beamLock: "Locked", temperatureC: 38.9, firmware: "2.7.9-mb",
    telemetryFreshnessSec: 29, pointingErrorMdeg: 0.18, reacquisitionCount24h: 0, powerDrawW: 36.4, restarts30d: 0,
  },
  {
    id: "TRM-CHN-A044", name: "Chennai Velachery A", coordinates: [80.2207, 12.9784],
    product: "Metro Backhaul", health: "Healthy", pairedTerminalId: "TRM-CHN-B044",
    linkId: "CHN-MBL-044", beamLock: "Locked", temperatureC: 38.2, firmware: "2.7.9-mb",
    telemetryFreshnessSec: 22, pointingErrorMdeg: 0.16, reacquisitionCount24h: 0, powerDrawW: 35.8, restarts30d: 0,
  },
  {
    id: "TRM-CHN-B044", name: "Chennai Tambaram South B", coordinates: [80.1281, 12.9229],
    product: "Metro Backhaul", health: "Healthy", pairedTerminalId: "TRM-CHN-A044",
    linkId: "CHN-MBL-044", beamLock: "Locked", temperatureC: 37.6, firmware: "2.7.9-mb",
    telemetryFreshnessSec: 25, pointingErrorMdeg: 0.19, reacquisitionCount24h: 1, powerDrawW: 36.0, restarts30d: 0,
  },
  {
    id: "TRM-CHN-A045", name: "Chennai Ambattur A", coordinates: [80.1548, 13.1143],
    product: "Enterprise Access", health: "Healthy", pairedTerminalId: "TRM-CHN-B045",
    linkId: "CHN-MBL-045", beamLock: "Locked", temperatureC: 39.0, firmware: "2.8.1-ea",
    telemetryFreshnessSec: 33, pointingErrorMdeg: 0.24, reacquisitionCount24h: 1, powerDrawW: 34.7, restarts30d: 0,
  },
  {
    id: "TRM-CHN-B045", name: "Chennai Anna Nagar B", coordinates: [80.2101, 13.0878],
    product: "Enterprise Access", health: "Healthy", pairedTerminalId: "TRM-CHN-A045",
    linkId: "CHN-MBL-045", beamLock: "Locked", temperatureC: 38.4, firmware: "2.8.1-ea",
    telemetryFreshnessSec: 27, pointingErrorMdeg: 0.2, reacquisitionCount24h: 0, powerDrawW: 34.2, restarts30d: 0,
  },
  {
    id: "TRM-CHN-A046", name: "Chennai Sholinganallur A", coordinates: [80.2274, 12.9009],
    product: "Enterprise Access", health: "Healthy", pairedTerminalId: "TRM-CHN-B046",
    linkId: "CHN-MBL-046", beamLock: "Locked", temperatureC: 36.8, firmware: "2.8.1-ea",
    telemetryFreshnessSec: 21, pointingErrorMdeg: 0.12, reacquisitionCount24h: 0, powerDrawW: 33.6, restarts30d: 0,
  },
  {
    id: "TRM-CHN-B046", name: "Chennai Siruseri Edge B", coordinates: [80.2288, 12.8236],
    product: "Enterprise Access", health: "Healthy", pairedTerminalId: "TRM-CHN-A046",
    linkId: "CHN-MBL-046", beamLock: "Locked", temperatureC: 36.2, firmware: "2.8.1-ea",
    telemetryFreshnessSec: 24, pointingErrorMdeg: 0.14, reacquisitionCount24h: 0, powerDrawW: 33.1, restarts30d: 0,
  },
];

export const chennaiLinks: ChennaiLink[] = [
  {
    id: "CHN-MBL-041", name: "Chennai Guindy to Perungudi mobile backhaul", regionId: CHENNAI_REGION_ID,
    product: "Lightbridge Terminal", terminalA: "TRM-CHN-A041", terminalB: "TRM-CHN-B041", distanceKm: 6.2,
    riskScore: 0.94, riskClass: "High", confidencePct: 94, predictedImpactMinutes: 342,
    capacityGbps: 10, currentThroughputGbps: 7.4, availabilityPct: 99.982,
    customerServiceCount: 1, customerServiceIds: ["SVC-CHN-CORE-10G"],
    primaryDriver: "Fog Attenuation", fallbackReady: true, fallbackHeadroomPct: 42,
    fallbackLatencyMs: 11, fallbackPacketLossPct: 0.02, fallbackValidationAgeHours: 6,
    linkMarginDb: 3.7, linkMarginBaselineDb: 9.5, thresholdMarginDb: 1.08,
    receivedPowerDbm: -28.4, attenuationDb: 5.8, visibilityKm: 1.8, fogProbability: 0.88,
    humidityPct: 94, rainfallMmHr: 0.8, windKph: 7, degradationRateDbHr: 0.46,
    dataQualityPct: 96, sourceAgreementPct: 93, serviceCriticality: "Critical",
    currentStatus: "At risk", recommendedAction: "Move Priority Traffic",
    historicalSimilarity: 0.88, terminalHealthScore: 0.78, alignmentStability: 0.82,
    sloTargetPct: 99.95, errorBudgetRemainingPct: 62,
    lastEvaluated: "2026-08-05T21:38:00Z", lastTelemetry: "28 seconds ago",
  },
  {
    id: "CHN-MBL-042", name: "Chennai Marina Coast to Kilpauk North", regionId: CHENNAI_REGION_ID,
    product: "Lightbridge Terminal", terminalA: "TRM-CHN-A042", terminalB: "TRM-CHN-B042", distanceKm: 5.4,
    riskScore: 0.88, riskClass: "High", confidencePct: 91, predictedImpactMinutes: 401,
    capacityGbps: 10, currentThroughputGbps: 6.1, availabilityPct: 99.975,
    customerServiceCount: 1, customerServiceIds: ["SVC-CHN-COAST-10G"],
    primaryDriver: "Coastal Humidity", fallbackReady: true, fallbackHeadroomPct: 36,
    fallbackLatencyMs: 13, fallbackPacketLossPct: 0.03, fallbackValidationAgeHours: 11,
    linkMarginDb: 4.4, linkMarginBaselineDb: 9.5, thresholdMarginDb: 1.1,
    receivedPowerDbm: -27.6, attenuationDb: 5.1, visibilityKm: 2.4, fogProbability: 0.79,
    humidityPct: 96, rainfallMmHr: 1.4, windKph: 12, degradationRateDbHr: 0.49,
    dataQualityPct: 94, sourceAgreementPct: 90, serviceCriticality: "High",
    currentStatus: "At risk", recommendedAction: "Prepare Fallback",
    historicalSimilarity: 0.81, terminalHealthScore: 0.85, alignmentStability: 0.88,
    sloTargetPct: 99.95, errorBudgetRemainingPct: 71,
    lastEvaluated: "2026-08-05T21:38:00Z", lastTelemetry: "34 seconds ago",
  },
  {
    id: "CHN-MBL-043", name: "Chennai Porur West to Egmore Core", regionId: CHENNAI_REGION_ID,
    product: "Metro Backhaul", terminalA: "TRM-CHN-A043", terminalB: "TRM-CHN-B043", distanceKm: 11.3,
    riskScore: 0.91, riskClass: "High", confidencePct: 88, predictedImpactMinutes: 268,
    capacityGbps: 40, currentThroughputGbps: 26.8, availabilityPct: 99.961,
    customerServiceCount: 3, customerServiceIds: ["SVC-CHN-METRO-40G", "SVC-CHN-ENT-004", "SVC-CHN-ENT-011"],
    primaryDriver: "Alignment Drift with Fog", fallbackReady: true, fallbackHeadroomPct: 21,
    fallbackLatencyMs: 19, fallbackPacketLossPct: 0.08, fallbackValidationAgeHours: 30,
    linkMarginDb: 3.1, linkMarginBaselineDb: 10.2, thresholdMarginDb: 1.2,
    receivedPowerDbm: -29.7, attenuationDb: 6.4, visibilityKm: 1.6, fogProbability: 0.84,
    humidityPct: 92, rainfallMmHr: 0.4, windKph: 9, degradationRateDbHr: 0.43,
    dataQualityPct: 89, sourceAgreementPct: 86, serviceCriticality: "Critical",
    currentStatus: "Degrading", recommendedAction: "Prepare Fallback",
    historicalSimilarity: 0.84, terminalHealthScore: 0.66, alignmentStability: 0.61,
    sloTargetPct: 99.9, errorBudgetRemainingPct: 38,
    lastEvaluated: "2026-08-05T21:38:00Z", lastTelemetry: "44 seconds ago",
  },
  {
    id: "CHN-MBL-044", name: "Chennai Velachery to Tambaram South", regionId: CHENNAI_REGION_ID,
    product: "Metro Backhaul", terminalA: "TRM-CHN-A044", terminalB: "TRM-CHN-B044", distanceKm: 11.1,
    riskScore: 0.72, riskClass: "Moderate", confidencePct: 86, predictedImpactMinutes: 612,
    capacityGbps: 40, currentThroughputGbps: 18.2, availabilityPct: 99.988,
    customerServiceCount: 2, customerServiceIds: ["SVC-CHN-SOUTH-40G", "SVC-CHN-ENT-021"],
    primaryDriver: "Rising Humidity", fallbackReady: true, fallbackHeadroomPct: 48,
    fallbackLatencyMs: 9, fallbackPacketLossPct: 0.01, fallbackValidationAgeHours: 4,
    linkMarginDb: 5.8, linkMarginBaselineDb: 10.2, thresholdMarginDb: 1.2,
    receivedPowerDbm: -26.1, attenuationDb: 3.6, visibilityKm: 3.9, fogProbability: 0.52,
    humidityPct: 88, rainfallMmHr: 0.2, windKph: 14, degradationRateDbHr: 0.31,
    dataQualityPct: 97, sourceAgreementPct: 94, serviceCriticality: "High",
    currentStatus: "At risk", recommendedAction: "Increase Monitoring Frequency",
    historicalSimilarity: 0.62, terminalHealthScore: 0.92, alignmentStability: 0.93,
    sloTargetPct: 99.9, errorBudgetRemainingPct: 78,
    lastEvaluated: "2026-08-05T21:38:00Z", lastTelemetry: "22 seconds ago",
  },
  {
    id: "CHN-MBL-045", name: "Chennai Ambattur to Anna Nagar enterprise access", regionId: CHENNAI_REGION_ID,
    product: "Enterprise Access", terminalA: "TRM-CHN-A045", terminalB: "TRM-CHN-B045", distanceKm: 6.3,
    riskScore: 0.64, riskClass: "Moderate", confidencePct: 84, predictedImpactMinutes: 726,
    capacityGbps: 5, currentThroughputGbps: 2.4, availabilityPct: 99.993,
    customerServiceCount: 1, customerServiceIds: ["SVC-CHN-ENT-045"],
    primaryDriver: "Inland Fog Formation", fallbackReady: true, fallbackHeadroomPct: 55,
    fallbackLatencyMs: 8, fallbackPacketLossPct: 0.01, fallbackValidationAgeHours: 2,
    linkMarginDb: 6.6, linkMarginBaselineDb: 9.8, thresholdMarginDb: 1.0,
    receivedPowerDbm: -25.3, attenuationDb: 2.9, visibilityKm: 4.6, fogProbability: 0.46,
    humidityPct: 84, rainfallMmHr: 0.1, windKph: 11, degradationRateDbHr: 0.28,
    dataQualityPct: 98, sourceAgreementPct: 95, serviceCriticality: "Standard",
    currentStatus: "Healthy", recommendedAction: "Monitor Closely",
    historicalSimilarity: 0.51, terminalHealthScore: 0.95, alignmentStability: 0.96,
    sloTargetPct: 99.5, errorBudgetRemainingPct: 88,
    lastEvaluated: "2026-08-05T21:38:00Z", lastTelemetry: "27 seconds ago",
  },
  {
    id: "CHN-MBL-046", name: "Chennai Sholinganallur to Siruseri edge", regionId: CHENNAI_REGION_ID,
    product: "Enterprise Access", terminalA: "TRM-CHN-A046", terminalB: "TRM-CHN-B046", distanceKm: 8.6,
    riskScore: 0.38, riskClass: "Low", confidencePct: 90, predictedImpactMinutes: 1180,
    capacityGbps: 5, currentThroughputGbps: 1.7, availabilityPct: 99.997,
    customerServiceCount: 1, customerServiceIds: ["SVC-CHN-ENT-046"],
    primaryDriver: "Nominal Conditions", fallbackReady: true, fallbackHeadroomPct: 61,
    fallbackLatencyMs: 7, fallbackPacketLossPct: 0.0, fallbackValidationAgeHours: 1,
    linkMarginDb: 8.1, linkMarginBaselineDb: 9.8, thresholdMarginDb: 1.0,
    receivedPowerDbm: -23.8, attenuationDb: 1.4, visibilityKm: 8.2, fogProbability: 0.18,
    humidityPct: 71, rainfallMmHr: 0.0, windKph: 16, degradationRateDbHr: 0.11,
    dataQualityPct: 99, sourceAgreementPct: 97, serviceCriticality: "Low",
    currentStatus: "Healthy", recommendedAction: "Monitor Closely",
    historicalSimilarity: 0.27, terminalHealthScore: 0.98, alignmentStability: 0.98,
    sloTargetPct: 99.5, errorBudgetRemainingPct: 94,
    lastEvaluated: "2026-08-05T21:38:00Z", lastTelemetry: "24 seconds ago",
  },
];

/** Customer-service route: Guindy aggregation to the Perungudi core POP. */
export const customerServiceRoute: {
  id: string;
  serviceId: string;
  customer: string;
  coordinates: [number, number][];
} = {
  id: "SVC-ROUTE-CHN-CORE",
  serviceId: "SVC-CHN-CORE-10G",
  customer: "Bharat Mobility Networks",
  coordinates: [
    [80.2119, 13.0067],
    [80.2246, 12.9908],
    [80.2461, 12.9612],
    [80.2585, 12.9498],
  ],
};

/** RF fallback path standing by for CHN-MBL-041. */
export const rfFallbackRoute: {
  id: string;
  linkId: string;
  coordinates: [number, number][];
} = {
  id: "RF-FALLBACK-CHN-041",
  linkId: "CHN-MBL-041",
  coordinates: [
    [80.2119, 13.0067],
    [80.1904, 12.9861],
    [80.2078, 12.9633],
    [80.2461, 12.9612],
  ],
};

/** Customer-service delivery location for the exposed 10 Gbps service. */
export const customerServiceLocation = {
  id: "CUST-CHN-CORE",
  name: "Bharat Mobility Networks, Perungudi core POP",
  coordinates: [80.2585, 12.9498] as [number, number],
  serviceId: "SVC-CHN-CORE-10G",
  capacityGbps: 10,
  criticality: "Critical" as Criticality,
};

/** Dense-fog risk zone over the Adyar and Pallikaranai corridor. */
export const weatherRiskZone = {
  id: "WX-CHN-FOG-01",
  label: "Dense fog advisory, Chennai south corridor",
  visibilityKm: 1.8,
  validFrom: "2026-08-05T22:00:00Z",
  validTo: "2026-08-06T05:00:00Z",
  coordinates: [
    [
      [80.14, 12.90],
      [80.31, 12.90],
      [80.33, 13.05],
      [80.24, 13.13],
      [80.13, 13.06],
      [80.14, 12.90],
    ],
  ] as [number, number][][],
};

/* -------------------------------- evidence -------------------------------- */

export interface EvidenceItem {
  id: string;
  label: string;
  value: string;
  source: string;
  timestamp: string;
  reliability: "High" | "Medium" | "Low";
  relevance: "Primary" | "Supporting" | "Contextual";
  freshness: string;
  stance: "Supporting" | "Contradicting" | "Neutral";
}

export interface EvidenceSection {
  id: string;
  title: string;
  items: EvidenceItem[];
}

const ev = (
  id: string, label: string, value: string, source: string, timestamp: string,
  reliability: EvidenceItem["reliability"], relevance: EvidenceItem["relevance"],
  freshness: string, stance: EvidenceItem["stance"] = "Supporting",
): EvidenceItem => ({ id, label, value, source, timestamp, reliability, relevance, freshness, stance });

export const chennaiEvidenceSections: EvidenceSection[] = [
  {
    id: "weather", title: "Weather Evidence",
    items: [
      ev("wx-1", "Visibility forecast", "1.8 km at 23:40 local, falling", "Regional meteorology feed", "21:30 UTC", "High", "Primary", "8 minutes"),
      ev("wx-2", "Fog probability", "88% within the six-hour window", "Ensemble fog model", "21:30 UTC", "High", "Primary", "8 minutes"),
      ev("wx-3", "Relative humidity", "94% and rising 1.4% per hour", "Site weather station", "21:36 UTC", "High", "Supporting", "2 minutes"),
      ev("wx-4", "Rainfall", "0.8 mm per hour, light drizzle", "Radar composite", "21:34 UTC", "Medium", "Supporting", "4 minutes"),
      ev("wx-5", "Forecast-provider agreement", "3 of 4 providers agree on dense fog", "Multi-provider comparison", "21:30 UTC", "Medium", "Supporting", "8 minutes"),
      ev("wx-6", "Update time", "Forecast refreshed 21:30 UTC", "Forecast scheduler", "21:30 UTC", "High", "Contextual", "8 minutes"),
    ],
  },
  {
    id: "optical", title: "Optical Evidence",
    items: [
      ev("op-1", "Link-margin trend", "9.5 dB to 3.7 dB over 11 hours", "Optical telemetry", "21:38 UTC", "High", "Primary", "28 seconds"),
      ev("op-2", "Received-power trend", "-23.1 dBm to -28.4 dBm", "Optical telemetry", "21:38 UTC", "High", "Primary", "28 seconds"),
      ev("op-3", "Attenuation trend", "1.2 dB to 5.8 dB", "Optical telemetry", "21:38 UTC", "High", "Primary", "28 seconds"),
      ev("op-4", "Degradation rate", "0.46 dB per hour, steady", "Derived feature", "21:38 UTC", "High", "Primary", "28 seconds"),
      ev("op-5", "Beam-lock state", "Locked, 2 reacquisitions in 24 hours", "Terminal telemetry", "21:38 UTC", "High", "Supporting", "28 seconds"),
      ev("op-6", "Pointing-error state", "0.34 mdeg, within tolerance", "Terminal telemetry", "21:38 UTC", "High", "Supporting", "28 seconds"),
    ],
  },
  {
    id: "terminal", title: "Terminal Evidence",
    items: [
      ev("tm-1", "Terminal health", "Both terminals degrading, no faults raised", "Terminal telemetry", "21:38 UTC", "High", "Supporting", "28 seconds"),
      ev("tm-2", "Temperature", "41.2 C and 42.8 C, within envelope", "Terminal telemetry", "21:38 UTC", "High", "Contextual", "28 seconds"),
      ev("tm-3", "Power", "38.4 W and 39.1 W, nominal", "Terminal telemetry", "21:38 UTC", "High", "Contextual", "28 seconds"),
      ev("tm-4", "Firmware", "2.8.4-lb on both terminals", "Asset inventory", "21:00 UTC", "High", "Contextual", "38 minutes"),
      ev("tm-5", "Restart history", "1 restart on terminal B in 30 days", "Terminal telemetry", "21:38 UTC", "Medium", "Contextual", "28 seconds"),
      ev("tm-6", "Telemetry freshness", "28 seconds, complete", "Collector", "21:38 UTC", "High", "Supporting", "28 seconds"),
    ],
  },
  {
    id: "network", title: "Network Evidence",
    items: [
      ev("nw-1", "Interface state", "Up, no errors in 24 hours", "Network telemetry", "21:38 UTC", "High", "Supporting", "30 seconds"),
      ev("nw-2", "Throughput", "7.4 Gbps of 10 Gbps committed", "Flow telemetry", "21:37 UTC", "High", "Primary", "1 minute"),
      ev("nw-3", "Latency", "4.1 ms, stable", "Active probe", "21:37 UTC", "High", "Supporting", "1 minute"),
      ev("nw-4", "Packet loss", "0.00%, no loss observed", "Active probe", "21:37 UTC", "High", "Supporting", "1 minute", "Contradicting"),
      ev("nw-5", "Routing state", "Primary optical path preferred", "Routing controller", "21:35 UTC", "High", "Contextual", "3 minutes"),
      ev("nw-6", "Handoff health", "RF handoff validated 6 hours ago", "Fallback controller", "15:38 UTC", "Medium", "Supporting", "6 hours"),
    ],
  },
  {
    id: "customer", title: "Customer and SLO Evidence",
    items: [
      ev("cs-1", "Service", "SVC-CHN-CORE-10G, Bharat Mobility Networks", "Service inventory", "21:00 UTC", "High", "Primary", "38 minutes"),
      ev("cs-2", "Capacity", "10 Gbps committed", "Service inventory", "21:00 UTC", "High", "Primary", "38 minutes"),
      ev("cs-3", "Criticality", "Critical, mobile backhaul", "Service inventory", "21:00 UTC", "High", "Primary", "38 minutes"),
      ev("cs-4", "SLO", "99.95% monthly availability", "SLO register", "21:00 UTC", "High", "Supporting", "38 minutes"),
      ev("cs-5", "Error budget", "62% remaining this period", "SLO register", "21:00 UTC", "High", "Supporting", "38 minutes"),
      ev("cs-6", "Downstream impact", "42 cell sites behind this backhaul", "Topology model", "21:00 UTC", "Medium", "Supporting", "38 minutes"),
    ],
  },
  {
    id: "historical", title: "Historical Evidence",
    items: [
      ev("hs-1", "Similar prior events", "6 comparable Chennai fog events in 24 months", "Event archive", "20:00 UTC", "High", "Supporting", "1 hour"),
      ev("hs-2", "Historical similarity", "0.88 against the 2025 December fog event", "Similarity model", "21:38 UTC", "Medium", "Supporting", "28 seconds"),
      ev("hs-3", "Prior prediction accuracy", "5 of 6 predictions were confirmed", "Model scorecard", "20:00 UTC", "High", "Supporting", "1 hour"),
      ev("hs-4", "Prior action outcome", "Priority traffic move prevented impact 4 times", "Action archive", "20:00 UTC", "High", "Supporting", "1 hour"),
    ],
  },
  {
    id: "fallback", title: "Fallback Evidence",
    items: [
      ev("fb-1", "Availability", "RF fallback provisioned and standing by", "Fallback controller", "21:36 UTC", "High", "Primary", "2 minutes"),
      ev("fb-2", "Headroom", "42% spare capacity", "Fallback controller", "21:36 UTC", "High", "Primary", "2 minutes"),
      ev("fb-3", "Latency", "11 ms, 7 ms above the optical path", "Active probe", "21:36 UTC", "High", "Supporting", "2 minutes"),
      ev("fb-4", "Packet loss", "0.02%", "Active probe", "21:36 UTC", "High", "Supporting", "2 minutes"),
      ev("fb-5", "Last validation", "6 hours ago, passed", "Fallback controller", "15:38 UTC", "Medium", "Supporting", "6 hours"),
      ev("fb-6", "Rollback readiness", "Automatic return when margin exceeds 6 dB", "Fallback controller", "21:36 UTC", "High", "Supporting", "2 minutes"),
    ],
  },
  {
    id: "quality", title: "Data Quality",
    items: [
      ev("dq-1", "Data quality", "96%, no required signal missing", "Collector", "21:38 UTC", "High", "Supporting", "28 seconds"),
      ev("dq-2", "Source agreement", "93% across weather and optical sources", "Source comparison", "21:38 UTC", "High", "Supporting", "28 seconds"),
      ev("dq-3", "Sensor calibration", "Last calibrated 9 days ago", "Asset inventory", "21:00 UTC", "Medium", "Contextual", "38 minutes"),
    ],
  },
  {
    id: "contradicting", title: "Contradicting Evidence",
    items: [
      ev("cx-1", "No customer-visible impact yet", "Packet loss and latency remain nominal", "Active probe", "21:37 UTC", "High", "Primary", "1 minute", "Contradicting"),
      ev("cx-2", "One provider disagrees", "1 of 4 forecast providers predicts light haze only", "Multi-provider comparison", "21:30 UTC", "Medium", "Supporting", "8 minutes", "Contradicting"),
      ev("cx-3", "Terminal faults absent", "No hardware alarm supports a terminal-driven cause", "Terminal telemetry", "21:38 UTC", "High", "Supporting", "28 seconds", "Contradicting"),
    ],
  },
  {
    id: "uncertainty", title: "Remaining Uncertainty",
    items: [
      ev("un-1", "Fog onset timing", "Onset could vary by plus or minus 70 minutes", "Ensemble spread", "21:30 UTC", "Medium", "Primary", "8 minutes", "Neutral"),
      ev("un-2", "Degradation linearity", "Rate is assumed steady; fog banks can step-change", "Model assumption", "21:38 UTC", "Medium", "Supporting", "28 seconds", "Neutral"),
      ev("un-3", "Fallback under load", "Headroom validated at 60% of expected peak only", "Fallback controller", "15:38 UTC", "Low", "Supporting", "6 hours", "Neutral"),
    ],
  },
];

/* ------------------------------ similar links ----------------------------- */

export interface SimilarLinkRecord {
  id: string;
  name: string;
  similarityPct: number;
  primaryDriver: string;
  product: string;
  distanceKm: number;
  opticalResponse: string;
  actualOutcome: string;
  actionTaken: string;
  predictionAccuracy: string;
  recoveryResult: string;
  evidenceQuality: "High" | "Medium" | "Low";
  supports: boolean;
  differences: string[];
}

export const similarLinkRecords: SimilarLinkRecord[] = [
  {
    id: "SIM-MUM-FOG", name: "Mumbai Fog Corridor", similarityPct: 91, primaryDriver: "Fog attenuation",
    product: "Lightbridge Terminal", distanceKm: 5.8, opticalResponse: "Margin fell 5.9 dB over 9 hours",
    actualOutcome: "Degradation confirmed, no customer impact", actionTaken: "Move Priority Traffic",
    predictionAccuracy: "Confirmed, 38 minutes early", recoveryResult: "Optical path restored in 4h 10m",
    evidenceQuality: "High", supports: true,
    differences: ["Shorter span", "Higher wind speed", "Fallback headroom 51% rather than 42%"],
  },
  {
    id: "SIM-NBO-RAIN", name: "Nairobi Heavy Rain Link", similarityPct: 63, primaryDriver: "Rain attenuation",
    product: "Metro Backhaul", distanceKm: 9.4, opticalResponse: "Margin fell 7.2 dB in 3 hours",
    actualOutcome: "Brief service degradation", actionTaken: "Move All Traffic",
    predictionAccuracy: "Confirmed, 12 minutes late", recoveryResult: "Optical path restored in 1h 40m",
    evidenceQuality: "Medium", supports: false,
    differences: ["Rain-driven rather than fog-driven", "Much faster degradation rate", "Different product class"],
  },
  {
    id: "SIM-RIO-HUM", name: "Rio Humidity-Sensitive Link", similarityPct: 72, primaryDriver: "Humidity",
    product: "Lightbridge Terminal", distanceKm: 6.9, opticalResponse: "Margin fell 3.4 dB over 14 hours",
    actualOutcome: "No threshold crossing", actionTaken: "Increase Monitoring Frequency",
    predictionAccuracy: "False positive", recoveryResult: "No action needed",
    evidenceQuality: "Medium", supports: false,
    differences: ["Humidity without fog formation", "Higher baseline margin", "Lower historical similarity"],
  },
  {
    id: "SIM-CHN-SEASON", name: "Chennai Seasonal Fog Event", similarityPct: 88, primaryDriver: "Fog attenuation",
    product: "Lightbridge Terminal", distanceKm: 6.2, opticalResponse: "Margin fell 6.4 dB over 12 hours",
    actualOutcome: "Degradation confirmed, impact prevented", actionTaken: "Move Priority Traffic",
    predictionAccuracy: "Confirmed, 24 minutes early", recoveryResult: "Optical path restored in 5h 05m",
    evidenceQuality: "High", supports: true,
    differences: ["Same corridor, prior season", "Data quality 91% rather than 96%"],
  },
  {
    id: "SIM-MUM-ALIGN", name: "Mumbai Alignment Drift Event", similarityPct: 54, primaryDriver: "Alignment drift",
    product: "Metro Backhaul", distanceKm: 12.1, opticalResponse: "Margin oscillated 4 dB with reacquisitions",
    actualOutcome: "Terminal maintenance required", actionTaken: "Dispatch Field Service",
    predictionAccuracy: "Partially confirmed", recoveryResult: "Restored after realignment",
    evidenceQuality: "Low", supports: false,
    differences: ["Mechanical cause rather than atmospheric", "Beam lock lost repeatedly", "No weather correlation"],
  },
];

/* ---------------------------- what-if presets ----------------------------- */

export interface WhatIfValues {
  visibilityKm: number;
  fogProbability: number;
  humidityPct: number;
  rainfallMmHr: number;
  windKph: number;
  linkMarginBaselineDb: number;
  linkMarginDb: number;
  attenuationDb: number;
  degradationRateDbHr: number;
  fallbackHeadroomPct: number;
  serviceCriticality: Criticality;
  dataQualityPct: number;
  sourceAgreementPct: number;
  confidenceThresholdPct: number;
}

export interface WhatIfControlSpec {
  key: keyof Omit<WhatIfValues, "serviceCriticality">;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  /** Higher values increase risk when true. */ riskIncreasing: boolean;
}

export const whatIfControls: WhatIfControlSpec[] = [
  { key: "visibilityKm", label: "Visibility Forecast", unit: "km", min: 0.2, max: 12, step: 0.1, riskIncreasing: false },
  { key: "fogProbability", label: "Fog Probability", unit: "%", min: 0, max: 100, step: 1, riskIncreasing: true },
  { key: "humidityPct", label: "Relative Humidity", unit: "%", min: 40, max: 100, step: 1, riskIncreasing: true },
  { key: "rainfallMmHr", label: "Rainfall Intensity", unit: "mm/h", min: 0, max: 25, step: 0.1, riskIncreasing: true },
  { key: "windKph", label: "Wind Speed", unit: "km/h", min: 0, max: 70, step: 1, riskIncreasing: true },
  { key: "linkMarginBaselineDb", label: "Link-Margin Baseline", unit: "dB", min: 4, max: 16, step: 0.1, riskIncreasing: false },
  { key: "linkMarginDb", label: "Current Link Margin", unit: "dB", min: 0, max: 16, step: 0.1, riskIncreasing: false },
  { key: "attenuationDb", label: "Optical Attenuation", unit: "dB", min: 0, max: 12, step: 0.1, riskIncreasing: true },
  { key: "degradationRateDbHr", label: "Degradation Rate", unit: "dB/h", min: 0, max: 1.2, step: 0.01, riskIncreasing: true },
  { key: "fallbackHeadroomPct", label: "Fallback Headroom", unit: "%", min: 0, max: 80, step: 1, riskIncreasing: false },
  { key: "dataQualityPct", label: "Data Quality", unit: "%", min: 40, max: 100, step: 1, riskIncreasing: false },
  { key: "sourceAgreementPct", label: "Source Agreement", unit: "%", min: 40, max: 100, step: 1, riskIncreasing: false },
  { key: "confidenceThresholdPct", label: "Confidence Threshold", unit: "%", min: 50, max: 99, step: 1, riskIncreasing: false },
];

export type WhatIfPresetId =
  | "baseline" | "moderate-fog" | "dense-fog" | "heavy-rain"
  | "degraded-telemetry" | "insufficient-fallback" | "clear-recovery";

export interface WhatIfPreset {
  id: WhatIfPresetId;
  label: string;
  description: string;
  /** Partial override applied on top of the selected link baseline. */
  patch: Partial<WhatIfValues>;
}

export const whatIfPresets: WhatIfPreset[] = [
  { id: "baseline", label: "Baseline", description: "Current fixture values for the selected link.", patch: {} },
  {
    id: "moderate-fog", label: "Moderate Fog",
    description: "Visibility 3.5 km with a 60% fog probability.",
    patch: { visibilityKm: 3.5, fogProbability: 60, humidityPct: 88, attenuationDb: 4.0, degradationRateDbHr: 0.32 },
  },
  {
    id: "dense-fog", label: "Dense Fog",
    description: "Visibility 0.6 km with a 97% fog probability and rapid margin loss.",
    patch: { visibilityKm: 0.6, fogProbability: 97, humidityPct: 99, attenuationDb: 8.4, degradationRateDbHr: 0.82, linkMarginDb: 2.6 },
  },
  {
    id: "heavy-rain", label: "Heavy Rain",
    description: "18 mm per hour rainfall with a strengthening coastal wind.",
    patch: { rainfallMmHr: 18, humidityPct: 97, windKph: 44, visibilityKm: 2.9, attenuationDb: 6.9, degradationRateDbHr: 0.61 },
  },
  {
    id: "degraded-telemetry", label: "Degraded Telemetry",
    description: "Data quality 62% and source agreement 58%.",
    patch: { dataQualityPct: 62, sourceAgreementPct: 58 },
  },
  {
    id: "insufficient-fallback", label: "Insufficient Fallback",
    description: "Fallback headroom collapses to 8%.",
    patch: { fallbackHeadroomPct: 8 },
  },
  {
    id: "clear-recovery", label: "Clear Recovery",
    description: "Fog clears, margin recovers and attenuation falls away.",
    patch: { visibilityKm: 10.5, fogProbability: 6, humidityPct: 62, rainfallMmHr: 0, attenuationDb: 0.9, degradationRateDbHr: 0.05, linkMarginDb: 8.9 },
  },
];

/** Baseline What-If values derived from a link fixture. */
export function baselineWhatIf(link: ChennaiLink): WhatIfValues {
  return {
    visibilityKm: link.visibilityKm,
    fogProbability: Math.round(link.fogProbability * 100),
    humidityPct: link.humidityPct,
    rainfallMmHr: link.rainfallMmHr,
    windKph: link.windKph,
    linkMarginBaselineDb: link.linkMarginBaselineDb,
    linkMarginDb: link.linkMarginDb,
    attenuationDb: link.attenuationDb,
    degradationRateDbHr: link.degradationRateDbHr,
    fallbackHeadroomPct: link.fallbackHeadroomPct,
    serviceCriticality: link.serviceCriticality,
    dataQualityPct: link.dataQualityPct,
    sourceAgreementPct: link.sourceAgreementPct,
    confidenceThresholdPct: 80,
  };
}

export function getChennaiLink(id: string): ChennaiLink | undefined {
  return chennaiLinks.find((l) => l.id === id);
}

export function getTerminal(id: string): ChennaiTerminal | undefined {
  return chennaiTerminals.find((t) => t.id === id);
}
