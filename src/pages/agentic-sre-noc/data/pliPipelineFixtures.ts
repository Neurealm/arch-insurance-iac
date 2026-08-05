/**
 * AIM-002 — Predictive Optical Link Intelligence, engineering pipeline fixtures.
 *
 * Extends the AIM-001 fixture set in `pliFixtures.ts`. All identifiers reuse the
 * canonical Chennai demonstration data already established on this page
 * (link CHN-MBL-041, region India South, model v2.4.1). Everything here is
 * synthetic, Taara-aligned demonstration data.
 */

import { pipelineStages, type PipelineStageKey } from "./pliFixtures";

export { pipelineStages };
export type { PipelineStageKey };

/* --------------------------------- types --------------------------------- */

export type StageState = "Complete" | "Active" | "Ready" | "Waiting" | "Warning" | "Blocked";
export type Determinism = "Deterministic" | "Model-based";
export type QualityState = "Good" | "Degraded" | "Stale" | "Missing";
export type RiskClass = "Normal" | "Watch" | "Elevated" | "High Risk" | "Data Quality Concern";

export interface PipelineStage {
  key: PipelineStageKey;
  index: number;
  title: string;
  caption: string;
  purpose: string;
  description: string;
  state: StageState;
  resultCount: string;
  owner: string;
  determinism: Determinism;
  inputs: string[];
  outputs: string[];
  currentResult: string;
}

export interface SignalDefinition {
  id: string;
  name: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "flat";
  normalRange: string;
  source: string;
  freshness: string;
  quality: QualityState;
  contributes: boolean;
  definition: string;
  /** Engineered feature ids that consume this signal. */
  featureIds: string[];
}

export interface SignalGroup {
  id: string;
  title: string;
  requirement: "Required" | "Optional";
  freshness: string;
  qualityScore: number;
  sourceCount: number;
  lastUpdate: string;
  warning: string | null;
  signals: SignalDefinition[];
}

export interface FeatureCalculationExample {
  inputs: { label: string; value: string }[];
  method: string;
  output: string;
}

export interface PipelineEvidenceReference {
  id: string;
  label: string;
  detail: string;
}

export interface EngineeredFeature {
  id: string;
  name: string;
  value: string;
  numericValue: number;
  unit: string;
  state: "Elevated" | "Normal" | "Watch";
  riskDirection: "Increases risk" | "Reduces risk" | "Context only";
  signalIds: string[];
  quality: QualityState;
  downstreamModelIds: string[];
  material: boolean;
  definition: string;
  whyItMatters: string;
  method: string;
  normalRange: string;
  historicalRange: string;
  contributionPct: number;
  freshness: string;
  missingDataHandling: string;
  limitations: string;
  example: FeatureCalculationExample;
  evidence: PipelineEvidenceReference[];
}

export interface AnomalyRecord {
  linkId: string;
  region: string;
  product: string;
  baselineDeviation: number;
  rateOfChange: number;
  riskClass: RiskClass;
  serviceCriticality: number;
  dataQuality: number;
  telemetryComplete: boolean;
  reasons: string[];
}

export interface AnomalyService {
  id: string;
  name: string;
  determinism: Determinism;
  state: StageState;
  evaluated: string;
  findings: number;
  lastRun: string;
  result: string;
}

export interface ModelComponent {
  id: string;
  name: string;
  weightPct: number;
  output: string;
  agreement: "Agrees" | "Partially agrees" | "Disagrees";
  dataRequirement: string;
  confidencePct: number;
  lastEvaluated: string;
  determinism: Determinism;
  issue: string | null;
}

export interface ModelEnsembleResult {
  linkId: string;
  riskProbability: number;
  riskClass: "High" | "Medium" | "Low";
  confidencePct: number;
  eta: string;
  capacityExposure: string;
  agreement: string;
  missingDataPenalty: number;
  calibration: string;
  engineeringRule: string;
  modelVersion: string;
}

export interface ServiceImpactRecord {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: "critical" | "warning" | "positive" | "neutral";
}

export interface ImpactTopologyNode {
  id: string;
  type: string;
  name: string;
  health: string;
  capacity: string;
  risk: string;
  owner: string;
  role: string;
  /** Grid coordinates in the controlled layout. */
  col: number;
  row: number;
}

export interface ImpactTopologyEdge {
  from: string;
  to: string;
  label: string;
  kind: "primary" | "fallback" | "governs";
}

export interface PipelineRecommendedAction {
  id: string;
  rank: number;
  name: string;
  expectedOutcome: string;
  technicalRisk: "Low" | "Medium" | "High";
  customerImpact: string;
  sloImpact: string;
  reversibility: "Fully reversible" | "Partially reversible" | "Not reversible";
  approval: "Automatic" | "Approval required";
  confidencePct: number;
  validation: string;
  rollback: string;
  status: "Recommended" | "Available" | "Standby" | "Not recommended";
  capacityProtected: string;
  timeToExecute: string;
  comparable: boolean;
  rationale: string;
}

/* -------------------------------- stages ---------------------------------- */

export const pipelineStageDetails: PipelineStage[] = [
  {
    key: "observe", index: 1, title: "Observe", caption: "Collect Signals",
    purpose: "Collect optical, environmental, network, service and historical signals for every modelled link.",
    description: "Signal collection", state: "Complete", resultCount: "40 signals, 4 groups",
    owner: "Telemetry Collection Service", determinism: "Deterministic",
    inputs: ["Lightbridge terminal telemetry", "Weather providers", "Network and service systems", "Historical event store"],
    outputs: ["Validated signal records", "Freshness and quality scores"],
    currentResult: "40 of 40 signals present, quality 0.96",
  },
  {
    key: "engineer", index: 2, title: "Engineer", caption: "Feature Engineering",
    purpose: "Convert raw signals into deterministic engineering features the model can reason over.",
    description: "Feature engineering", state: "Complete", resultCount: "12 features",
    owner: "Feature Engineering Service", determinism: "Deterministic",
    inputs: ["Validated signal records"],
    outputs: ["Engineered feature vector", "Feature quality flags"],
    currentResult: "12 of 12 features computed, 8 material for CHN-MBL-041",
  },
  {
    key: "detect", index: 3, title: "Detect", caption: "Anomaly Detection",
    purpose: "Identify links behaving abnormally against dynamic baselines and peer cohorts.",
    description: "Anomaly detection", state: "Active", resultCount: "118 links evaluated, 14 findings",
    owner: "Anomaly Detection Services", determinism: "Deterministic",
    inputs: ["Engineered feature vector", "Dynamic baselines"],
    outputs: ["Anomaly records", "Risk class per link"],
    currentResult: "CHN-MBL-041 flagged: 2.8 sigma deviation, rising loss rate",
  },
  {
    key: "predict", index: 4, title: "Predict", caption: "Risk Prediction",
    purpose: "Predict degradation probability and time to impact using the calibrated model ensemble.",
    description: "Risk prediction", state: "Active", resultCount: "Risk 0.94, High",
    owner: "Prediction Ensemble v2.4.1", determinism: "Model-based",
    inputs: ["Engineered feature vector", "Anomaly records"],
    outputs: ["Risk probability", "Confidence", "Time to impact"],
    currentResult: "0.94 probability, High risk, ETA 5h 42m, confidence 94%",
  },
  {
    key: "impact", index: 5, title: "Impact", caption: "Customer Impact",
    purpose: "Translate link risk into customer service, SLO and error-budget exposure.",
    description: "Customer and service impact", state: "Ready", resultCount: "1 service, 10 Gbps",
    owner: "Service Impact Service", determinism: "Deterministic",
    inputs: ["Risk probability", "Service topology", "SLO state"],
    outputs: ["Service impact record", "Blast radius", "Preventability"],
    currentResult: "1 critical service exposed, impact preventable, fallback ready",
  },
  {
    key: "act", index: 6, title: "Act", caption: "Protected Action",
    purpose: "Rank governed actions, apply approval policy and prepare validation and rollback.",
    description: "Recommended action", state: "Waiting", resultCount: "9 ranked, 1 awaiting approval",
    owner: "Action Policy and Governance", determinism: "Deterministic",
    inputs: ["Service impact record", "Autonomy policy", "Fallback readiness"],
    outputs: ["Ranked actions", "Approval requests", "Rollback plan"],
    currentResult: "Move Priority Traffic recommended, approval required",
  },
];

/* ----------------------------- signal inputs ------------------------------ */

function signal(
  id: string, name: string, value: string, unit: string, normalRange: string, source: string,
  featureIds: string[], definition: string,
  opts: Partial<Pick<SignalDefinition, "trend" | "freshness" | "quality" | "contributes">> = {},
): SignalDefinition {
  return {
    id, name, value, unit, normalRange, source, featureIds, definition,
    trend: opts.trend ?? "flat",
    freshness: opts.freshness ?? "30s ago",
    quality: opts.quality ?? "Good",
    contributes: opts.contributes ?? false,
  };
}

export const signalGroups: SignalGroup[] = [
  {
    id: "optical", title: "Optical Link Signals", requirement: "Required", freshness: "30s",
    qualityScore: 0.98, sourceCount: 2, lastUpdate: "30s ago", warning: null,
    signals: [
      signal("link-margin", "Link margin", "6.4", "dB", "8 to 14 dB", "Lightbridge terminal", ["optical-reserve-margin", "link-degradation-rate"], "Optical power headroom above the minimum required for error-free operation.", { trend: "down", contributes: true }),
      signal("received-power", "Received optical power", "-31.8", "dBm", "-26 to -30 dBm", "Lightbridge terminal", ["link-degradation-rate", "baseline-deviation"], "Measured optical power arriving at the receiving terminal.", { trend: "down", contributes: true }),
      signal("attenuation", "Optical attenuation", "9.6", "dB/km", "2 to 6 dB/km", "Lightbridge terminal", ["atmospheric-attenuation-index"], "Loss of optical power across the free-space path.", { trend: "up", contributes: true }),
      signal("beam-lock", "Beam-lock stability", "92.4", "%", "above 98%", "Lightbridge terminal", ["baseline-deviation", "multi-signal-correlation"], "Share of the observation window with a stable beam lock.", { trend: "down", contributes: true }),
      signal("pointing-error", "Pointing error", "0.34", "mrad", "below 0.2 mrad", "Lightbridge terminal", ["baseline-deviation"], "Angular deviation between commanded and actual beam pointing.", { trend: "up", contributes: true }),
      signal("reacquisition", "Reacquisition count", "7", "per hour", "0 to 1 per hour", "Lightbridge terminal", ["baseline-deviation", "link-degradation-rate"], "Number of times the terminal re-established beam lock.", { trend: "up", contributes: true }),
      signal("tracking-correction", "Tracking-correction rate", "18", "per min", "2 to 6 per min", "Lightbridge terminal", ["multi-signal-correlation"], "Frequency of automated pointing corrections.", { trend: "up", contributes: true }),
      signal("terminal-health", "Terminal health", "Nominal", "state", "Nominal", "Terminal management", ["sensor-quality-score"], "Composite hardware health reported by the terminal."),
      signal("terminal-temp", "Terminal temperature", "41.2", "degC", "10 to 55 degC", "Terminal management", ["sensor-quality-score"], "Internal terminal operating temperature."),
      signal("firmware-state", "Firmware state", "2.8.4, current", "version", "Current release", "Terminal management", ["recent-change-proximity"], "Deployed terminal firmware and its currency."),
    ],
  },
  {
    id: "environmental", title: "Environmental Signals", requirement: "Required", freshness: "5m",
    qualityScore: 0.94, sourceCount: 3, lastUpdate: "4m ago", warning: null,
    signals: [
      signal("visibility", "Visibility forecast", "1.2", "km", "above 4 km", "Weather ensemble", ["atmospheric-attenuation-index", "visibility-distance-ratio"], "Forecast horizontal visibility at the link corridor.", { trend: "down", contributes: true, freshness: "4m ago" }),
      signal("fog-probability", "Fog probability", "0.86", "0 to 1", "below 0.2", "Weather ensemble", ["atmospheric-attenuation-index", "weather-agreement-score"], "Ensemble probability of fog formation in the forecast window.", { trend: "up", contributes: true, freshness: "4m ago" }),
      signal("humidity", "Relative humidity", "96", "%", "40 to 80%", "Site sensor", ["atmospheric-attenuation-index"], "Relative humidity measured at the site.", { trend: "up", contributes: true }),
      signal("rainfall", "Rainfall intensity", "0.4", "mm/h", "0 to 2 mm/h", "Weather ensemble", ["atmospheric-attenuation-index"], "Forecast precipitation rate over the corridor.", { freshness: "4m ago" }),
      signal("wind-speed", "Wind speed", "6", "km/h", "0 to 35 km/h", "Site sensor", ["weather-agreement-score"], "Surface wind speed at the site."),
      signal("wind-direction", "Wind direction", "ESE", "compass", "Any", "Site sensor", ["weather-agreement-score"], "Prevailing wind direction, used for advection of fog banks."),
      signal("temperature", "Temperature", "24.1", "degC", "18 to 38 degC", "Site sensor", ["atmospheric-attenuation-index"], "Ambient air temperature, used with dew point.", { contributes: true }),
      signal("turbulence", "Atmospheric turbulence", "Moderate", "index", "Low", "Weather ensemble", ["multi-signal-correlation"], "Scintillation-inducing turbulence estimate.", { freshness: "4m ago" }),
      signal("dust-smoke", "Dust or smoke", "Low", "index", "Low", "Air quality feed", ["atmospheric-attenuation-index"], "Particulate scattering contribution to attenuation."),
      signal("vibration", "Site vibration", "0.8", "mm/s", "below 2 mm/s", "Site sensor", ["sensor-quality-score"], "Structural vibration affecting terminal pointing."),
    ],
  },
  {
    id: "network", title: "Network and Service Signals", requirement: "Required", freshness: "1m",
    qualityScore: 0.97, sourceCount: 4, lastUpdate: "50s ago", warning: null,
    signals: [
      signal("throughput", "Throughput", "8.6", "Gbps", "up to 10 Gbps", "Network telemetry", ["service-criticality-score"], "Traffic currently carried by the optical link.", { contributes: true }),
      signal("latency", "Latency", "4.1", "ms", "3 to 5 ms", "Network telemetry", ["baseline-deviation"], "Round-trip latency across the service route."),
      signal("packet-loss", "Packet loss", "0.02", "%", "below 0.01%", "Network telemetry", ["baseline-deviation"], "Loss observed on the service path.", { trend: "up", contributes: true }),
      signal("route-health", "Route health", "Degrading", "state", "Healthy", "Routing controller", ["service-criticality-score"], "Composite health of the end-to-end service route.", { contributes: true }),
      signal("fallback-capacity", "Fallback capacity", "10", "Gbps", "at least 10 Gbps", "RF fallback controller", ["fallback-headroom"], "Total capacity available on the RF fallback path.", { contributes: true }),
      signal("fallback-utilization", "Fallback utilization", "58", "%", "below 70%", "RF fallback controller", ["fallback-headroom"], "Share of fallback capacity already in use.", { contributes: true }),
      signal("interface-errors", "Interface errors", "12", "per min", "below 5 per min", "Network telemetry", ["baseline-deviation"], "Layer 1 and 2 error counters on the link interfaces.", { trend: "up" }),
      signal("routing-state", "Routing state", "Primary active", "state", "Primary active", "Routing controller", ["fallback-headroom"], "Which path is currently carrying the service."),
      signal("service-criticality", "Customer-service criticality", "Critical", "tier", "Any tier", "Service catalogue", ["service-criticality-score"], "Business criticality tier of the exposed service.", { contributes: true, freshness: "1h ago" }),
      signal("slo-state", "SLO state", "Elevated", "state", "Within objective", "SLO service", ["service-criticality-score"], "Current standing of the service against its objective.", { contributes: true }),
    ],
  },
  {
    id: "historical", title: "Historical and Context", requirement: "Optional", freshness: "1h",
    qualityScore: 0.89, sourceCount: 3, lastUpdate: "52m ago",
    warning: "Similar-link behaviour refreshed 52 minutes ago, slightly stale for fast-moving fog events.",
    signals: [
      signal("prior-incidents", "Prior incidents", "4", "last 12 months", "0 to 2", "Incident store", ["historical-similarity-score"], "Prior degradation incidents recorded on this link.", { contributes: true, freshness: "52m ago" }),
      signal("seasonal", "Seasonal patterns", "Nov to Feb fog season", "pattern", "Any", "Historical analytics", ["historical-similarity-score"], "Recurring seasonal conditions for the corridor.", { contributes: true, freshness: "52m ago" }),
      signal("site-characteristics", "Site characteristics", "Coastal, low elevation", "profile", "Any", "Site register", ["atmospheric-attenuation-index"], "Physical characteristics of the terminal sites."),
      signal("link-geometry", "Link geometry", "Rooftop, 42 m elevation delta", "profile", "Any", "Site register", ["visibility-distance-ratio"], "Geometry of the optical path between terminals."),
      signal("link-distance", "Link distance", "3.1", "km", "0.5 to 5 km", "Site register", ["visibility-distance-ratio", "atmospheric-attenuation-index"], "Span between terminal A and terminal B.", { contributes: true, freshness: "1d ago" }),
      signal("product-type", "Product type", "Lightbridge Terminal", "product", "Any", "Product catalogue", ["atmospheric-attenuation-index"], "Terminal product family and its optical characteristics.", { freshness: "1d ago" }),
      signal("degradation-history", "Historical degradation rate", "0.31", "dB/h typical", "below 0.2 dB/h", "Historical analytics", ["link-degradation-rate"], "Typical loss rate observed during past fog events.", { contributes: true, freshness: "52m ago" }),
      signal("similar-links", "Similar-link behaviour", "9 peer links degrading", "cohort", "0 to 2 peers", "Cohort analytics", ["historical-similarity-score", "multi-signal-correlation"], "Behaviour of geographically and optically similar links.", { quality: "Stale", contributes: true, freshness: "52m ago" }),
      signal("recent-changes", "Recent changes", "None in 72h", "change record", "None", "Change management", ["recent-change-proximity"], "Recent configuration or maintenance changes near the link.", { freshness: "12m ago" }),
      signal("maintenance-state", "Maintenance state", "No active window", "state", "No active window", "Change management", ["recent-change-proximity"], "Whether a maintenance window is currently in effect.", { freshness: "12m ago" }),
    ],
  },
];

export const allSignals: SignalDefinition[] = signalGroups.flatMap((g) => g.signals);

/* --------------------------- engineered features -------------------------- */

export const engineeredFeatures: EngineeredFeature[] = [
  {
    id: "atmospheric-attenuation-index", name: "Atmospheric Attenuation Index", value: "0.82", numericValue: 0.82,
    unit: "index 0 to 1", state: "Elevated", riskDirection: "Increases risk",
    signalIds: ["visibility", "fog-probability", "humidity", "rainfall", "link-distance", "product-type", "attenuation", "site-characteristics", "temperature", "dust-smoke"],
    quality: "Good", downstreamModelIds: ["weather-impact", "gradient-boosting", "temporal"], material: true,
    definition: "Normalized route-level atmospheric attenuation risk derived from visibility, fog, humidity, rainfall, span length and product characteristics.",
    whyItMatters: "Atmospheric attenuation is the dominant cause of free-space optical degradation. A single normalized index lets the ensemble compare corridors with very different weather instrumentation.",
    method: "Weighted blend of normalized environmental signals, scaled by a product susceptibility factor and clamped to 0 to 1.",
    normalRange: "0.00 to 0.35", historicalRange: "0.04 to 0.97", contributionPct: 31, freshness: "4m ago",
    missingDataHandling: "Missing inputs are dropped and the remaining weights are renormalized. If every environmental input is missing the feature returns no value and the ensemble applies a missing-data penalty.",
    limitations: "Synthetic reference logic. Real deployments would calibrate coefficients per corridor, per product and per season.",
    example: {
      inputs: [
        { label: "Visibility", value: "1.2 km" },
        { label: "Fog probability", value: "0.86" },
        { label: "Humidity", value: "96%" },
        { label: "Rainfall", value: "0.4 mm/h" },
        { label: "Link distance", value: "3.1 km" },
        { label: "Product factor", value: "1.12" },
      ],
      method: "0.35 x inverse visibility + 0.25 x fog + 0.15 x humidity + 0.15 x rainfall + 0.10 x distance, scaled by product factor",
      output: "0.82 normalized attenuation risk",
    },
    evidence: [
      { id: "ev-wx-1", label: "Weather ensemble", detail: "Three independent sources agree on fog formation within 6 hours." },
      { id: "ev-opt-1", label: "Terminal optics", detail: "Measured attenuation rose from 4.1 to 9.6 dB/km over 90 minutes." },
    ],
  },
  {
    id: "link-degradation-rate", name: "Link Degradation Rate", value: "0.46", numericValue: 0.46,
    unit: "dB per hour", state: "Elevated", riskDirection: "Increases risk",
    signalIds: ["link-margin", "received-power", "reacquisition", "degradation-history"],
    quality: "Good", downstreamModelIds: ["temporal", "link-performance", "gradient-boosting"], material: true,
    definition: "Rate at which usable optical margin is being lost across the observation window.",
    whyItMatters: "Rate of loss, not absolute margin, determines how much warning time operations actually has.",
    method: "Linear loss between the first and last valid margin samples in the window, expressed per hour.",
    normalRange: "0.00 to 0.15 dB/h", historicalRange: "0.00 to 1.20 dB/h", contributionPct: 18, freshness: "30s ago",
    missingDataHandling: "Requires at least two valid margin samples. Fewer samples return no value.",
    limitations: "Linear approximation. Fog onset is often non-linear near the visibility knee.",
    example: {
      inputs: [{ label: "Margin at T-90m", value: "7.1 dB" }, { label: "Margin now", value: "6.4 dB" }],
      method: "(7.1 - 6.4) dB / 1.5 h",
      output: "0.46 dB per hour",
    },
    evidence: [{ id: "ev-margin", label: "Margin trace", detail: "Continuous erosion over the last 90 minutes, no recovery." }],
  },
  {
    id: "visibility-distance-ratio", name: "Visibility-to-Distance Ratio", value: "0.38", numericValue: 0.38,
    unit: "ratio", state: "Elevated", riskDirection: "Increases risk",
    signalIds: ["visibility", "link-distance", "link-geometry"],
    quality: "Good", downstreamModelIds: ["weather-impact", "gradient-boosting"], material: true,
    definition: "Forecast visibility divided by the optical span. Values below one mean the path is longer than usable visibility.",
    whyItMatters: "Makes weather comparable across links with very different span lengths.",
    method: "visibility km divided by link distance km, capped at 5.",
    normalRange: "above 1.5", historicalRange: "0.12 to 5.00", contributionPct: 12, freshness: "4m ago",
    missingDataHandling: "Returns no value when distance is zero or visibility is missing.",
    limitations: "Ignores vertical profile and layered fog banks.",
    example: {
      inputs: [{ label: "Visibility", value: "1.2 km" }, { label: "Link distance", value: "3.1 km" }],
      method: "1.2 / 3.1",
      output: "0.38 ratio",
    },
    evidence: [{ id: "ev-geo", label: "Site register", detail: "Span confirmed at 3.1 km, rooftop to rooftop." }],
  },
  {
    id: "optical-reserve-margin", name: "Optical Reserve Margin", value: "3.7", numericValue: 3.7,
    unit: "dB", state: "Watch", riskDirection: "Reduces risk",
    signalIds: ["link-margin", "received-power"],
    quality: "Good", downstreamModelIds: ["link-performance", "gradient-boosting"], material: true,
    definition: "Margin still available above the engineering minimum for error-free operation.",
    whyItMatters: "Defines how much further attenuation the link can absorb before customer traffic is affected.",
    method: "current margin minus required margin.",
    normalRange: "above 5 dB", historicalRange: "-1.8 to 8.4 dB", contributionPct: 9, freshness: "30s ago",
    missingDataHandling: "Returns no value if either margin input is missing.",
    limitations: "Required margin is a static engineering constant in this demonstration.",
    example: {
      inputs: [{ label: "Current margin", value: "6.4 dB" }, { label: "Required margin", value: "2.7 dB" }],
      method: "6.4 - 2.7",
      output: "3.7 dB reserve",
    },
    evidence: [{ id: "ev-eng", label: "Engineering standard", detail: "Required margin for this product and span is 2.7 dB." }],
  },
  {
    id: "multi-signal-correlation", name: "Multi-Signal Correlation", value: "0.91", numericValue: 0.91,
    unit: "correlation", state: "Elevated", riskDirection: "Increases risk",
    signalIds: ["beam-lock", "tracking-correction", "turbulence", "similar-links"],
    quality: "Good", downstreamModelIds: ["gradient-boosting", "temporal"], material: true,
    definition: "Mean absolute pairwise correlation between optical, environmental and cohort series.",
    whyItMatters: "High correlation across independent domains separates genuine environmental events from single-sensor faults.",
    method: "Mean absolute Pearson correlation across the supplied series.",
    normalRange: "below 0.55", historicalRange: "0.05 to 0.98", contributionPct: 8, freshness: "1m ago",
    missingDataHandling: "Series with fewer than two valid points are dropped.",
    limitations: "Correlation is not causation; the ensemble treats it as corroboration only.",
    example: {
      inputs: [{ label: "Margin series", value: "12 samples" }, { label: "Visibility series", value: "12 samples" }, { label: "Peer cohort series", value: "9 links" }],
      method: "mean of absolute pairwise Pearson correlations",
      output: "0.91 correlation",
    },
    evidence: [{ id: "ev-cohort", label: "Cohort analytics", detail: "Nine peer Chennai links show the same signature." }],
  },
  {
    id: "fallback-headroom", name: "Fallback Headroom", value: "42", numericValue: 42,
    unit: "%", state: "Normal", riskDirection: "Reduces risk",
    signalIds: ["fallback-capacity", "fallback-utilization", "routing-state"],
    quality: "Good", downstreamModelIds: ["service-criticality", "engineering-rules"], material: true,
    definition: "Share of RF fallback capacity still free for protected traffic.",
    whyItMatters: "Determines whether traffic can actually be moved before degradation reaches customers.",
    method: "1 minus fallback utilization, expressed as a percentage of total fallback capacity.",
    normalRange: "above 30%", historicalRange: "0 to 96%", contributionPct: 6, freshness: "50s ago",
    missingDataHandling: "Returns no value if fallback capacity is unknown; the action layer then blocks traffic-move actions.",
    limitations: "Does not model RF path weather sensitivity in this stage.",
    example: {
      inputs: [{ label: "Fallback capacity", value: "10 Gbps" }, { label: "Fallback in use", value: "5.8 Gbps" }],
      method: "(1 - 5.8 / 10) x 100",
      output: "42% headroom",
    },
    evidence: [{ id: "ev-fb", label: "Fallback controller", detail: "RF path healthy, 4.2 Gbps free." }],
  },
  {
    id: "service-criticality-score", name: "Service Criticality Score", value: "0.88", numericValue: 0.88,
    unit: "index 0 to 1", state: "Elevated", riskDirection: "Context only",
    signalIds: ["service-criticality", "slo-state", "throughput", "route-health"],
    quality: "Good", downstreamModelIds: ["service-criticality"], material: true,
    definition: "Blended importance of the customer services carried by the link.",
    whyItMatters: "Two links with identical physics do not deserve identical urgency; criticality sets the ranking.",
    method: "Weighted blend of service tier, customer count, carried capacity and SLO tightness.",
    normalRange: "context dependent", historicalRange: "0.10 to 1.00", contributionPct: 7, freshness: "50s ago",
    missingDataHandling: "Falls back to the service catalogue tier alone when live counts are missing.",
    limitations: "Customer counts are synthetic in this demonstration.",
    example: {
      inputs: [{ label: "Tier", value: "Critical" }, { label: "Customers", value: "180" }, { label: "Capacity", value: "10 Gbps" }, { label: "SLO tightness", value: "0.82" }],
      method: "0.45 x tier + 0.20 x customers + 0.20 x capacity + 0.15 x SLO tightness",
      output: "0.88 criticality",
    },
    evidence: [{ id: "ev-svc", label: "Service catalogue", detail: "SVC-CHN-CORE-10G is a Critical tier managed service." }],
  },
  {
    id: "weather-agreement-score", name: "Weather Agreement Score", value: "0.93", numericValue: 0.93,
    unit: "index 0 to 1", state: "Normal", riskDirection: "Increases risk",
    signalIds: ["fog-probability", "wind-speed", "wind-direction", "visibility"],
    quality: "Good", downstreamModelIds: ["weather-impact"], material: true,
    definition: "Agreement between independent weather sources on the forecast condition.",
    whyItMatters: "High agreement raises confidence; disagreement lowers it and suppresses aggressive actions.",
    method: "1 minus the coefficient of variation across source forecasts.",
    normalRange: "above 0.70", historicalRange: "0.21 to 1.00", contributionPct: 5, freshness: "4m ago",
    missingDataHandling: "Requires at least two sources; a single source returns no value.",
    limitations: "Treats all providers as equally trustworthy.",
    example: {
      inputs: [{ label: "Source A fog probability", value: "0.88" }, { label: "Source B", value: "0.84" }, { label: "Source C", value: "0.86" }],
      method: "1 - (standard deviation / mean)",
      output: "0.93 agreement",
    },
    evidence: [{ id: "ev-wx-2", label: "Weather ensemble", detail: "Three of three sources predict fog within the window." }],
  },
  {
    id: "baseline-deviation", name: "Baseline Deviation", value: "2.8", numericValue: 2.8,
    unit: "standard deviations", state: "Elevated", riskDirection: "Increases risk",
    signalIds: ["received-power", "beam-lock", "pointing-error", "latency", "packet-loss", "interface-errors"],
    quality: "Good", downstreamModelIds: ["gradient-boosting", "temporal", "engineering-rules"], material: true,
    definition: "Distance of current behaviour from the link's own dynamic baseline.",
    whyItMatters: "Per-link baselines catch degradation long before any static global threshold is breached.",
    method: "(current value minus baseline mean) divided by baseline standard deviation.",
    normalRange: "-1.5 to 1.5 sigma", historicalRange: "-4.2 to 6.1 sigma", contributionPct: 14, freshness: "30s ago",
    missingDataHandling: "Returns no value when the baseline has zero variance or is not yet warm.",
    limitations: "Baselines need 14 days of history; new links start in a warm-up state.",
    example: {
      inputs: [{ label: "Current received power", value: "-31.8 dBm" }, { label: "Baseline mean", value: "-28.3 dBm" }, { label: "Baseline sigma", value: "1.25 dB" }],
      method: "(-31.8 - -28.3) / 1.25, magnitude reported",
      output: "2.8 standard deviations",
    },
    evidence: [{ id: "ev-base", label: "Dynamic baseline", detail: "14-day rolling baseline, warm and calibrated." }],
  },
  {
    id: "recent-change-proximity", name: "Recent-Change Proximity", value: "Low", numericValue: 0.08,
    unit: "band", state: "Normal", riskDirection: "Context only",
    signalIds: ["recent-changes", "maintenance-state", "firmware-state"],
    quality: "Good", downstreamModelIds: ["engineering-rules"], material: false,
    definition: "How close the prediction sits to a recent configuration or maintenance change.",
    whyItMatters: "Separates environmental degradation from change-induced degradation, which needs a different response.",
    method: "Decay function over hours since the last change, banded into Low, Medium and High.",
    normalRange: "Low", historicalRange: "Low to High", contributionPct: 2, freshness: "12m ago",
    missingDataHandling: "Absent change records are treated as no recent change and flagged in evidence.",
    limitations: "Only sees changes recorded in change management.",
    example: {
      inputs: [{ label: "Hours since last change", value: "66 h" }],
      method: "1 - 66 / 72, banded",
      output: "0.08, Low proximity",
    },
    evidence: [{ id: "ev-chg", label: "Change management", detail: "No change activity in the last 72 hours." }],
  },
  {
    id: "historical-similarity-score", name: "Historical Similarity Score", value: "0.88", numericValue: 0.88,
    unit: "similarity", state: "Elevated", riskDirection: "Increases risk",
    signalIds: ["prior-incidents", "seasonal", "similar-links", "degradation-history"],
    quality: "Degraded", downstreamModelIds: ["historical-similarity", "gradient-boosting"], material: true,
    definition: "Similarity between current conditions and the closest historical degradation event.",
    whyItMatters: "Prior events with known outcomes give the ensemble a calibrated prior and a proven playbook.",
    method: "Cosine similarity between the current condition vector and stored event vectors.",
    normalRange: "below 0.60", historicalRange: "0.03 to 0.99", contributionPct: 8, freshness: "52m ago",
    missingDataHandling: "Returns no value when no historical vectors exist for the corridor.",
    limitations: "Cohort feed is 52 minutes old, which is slightly stale for fast fog onset.",
    example: {
      inputs: [{ label: "Current vector", value: "6 dimensions" }, { label: "Closest event", value: "2025-12-14 Chennai fog" }],
      method: "cosine similarity of condition vectors",
      output: "0.88 similarity",
    },
    evidence: [{ id: "ev-hist", label: "Incident store", detail: "2025-12-14 event degraded the same corridor within 6 hours." }],
  },
  {
    id: "sensor-quality-score", name: "Sensor-Quality Score", value: "0.96", numericValue: 0.96,
    unit: "index 0 to 1", state: "Normal", riskDirection: "Reduces risk",
    signalIds: ["terminal-health", "terminal-temp", "vibration"],
    quality: "Good", downstreamModelIds: ["engineering-rules", "gradient-boosting"], material: false,
    definition: "Trustworthiness of the telemetry feeding every other feature.",
    whyItMatters: "A confident prediction built on incomplete telemetry is not safe to act on.",
    method: "0.5 x completeness + 0.3 x validity + 0.2 x freshness.",
    normalRange: "above 0.90", historicalRange: "0.42 to 1.00", contributionPct: 3, freshness: "30s ago",
    missingDataHandling: "Zero received samples returns no value and blocks autonomous action.",
    limitations: "Does not yet model sensor calibration drift.",
    example: {
      inputs: [{ label: "Expected samples", value: "180" }, { label: "Received", value: "176" }, { label: "Invalid", value: "2" }, { label: "Stale", value: "30 s" }],
      method: "0.5 x 0.978 + 0.3 x 0.989 + 0.2 x 0.967",
      output: "0.96 quality",
    },
    evidence: [{ id: "ev-tel", label: "Telemetry validation", detail: "176 of 180 expected samples, 2 invalid." }],
  },
];

/* --------------------------- anomaly detection ---------------------------- */

const ANOMALY_REGIONS = ["India South", "India West", "Africa East", "Americas", "Europe"];
const ANOMALY_PRODUCTS = ["Lightbridge Terminal", "Metro Backhaul", "Enterprise Access"];

/** Deterministic pseudo-random generator so fixtures never regenerate differently. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildAnomalyRecords(): AnomalyRecord[] {
  const rnd = seeded(20260805);
  const records: AnomalyRecord[] = [];
  const clusters: { riskClass: RiskClass; count: number; dev: [number, number]; roc: [number, number]; quality: [number, number] }[] = [
    { riskClass: "Normal", count: 52, dev: [-1.2, 1.3], roc: [0, 0.12], quality: [0.9, 1] },
    { riskClass: "Watch", count: 24, dev: [1.2, 2.0], roc: [0.08, 0.22], quality: [0.85, 0.99] },
    { riskClass: "Elevated", count: 18, dev: [1.8, 2.7], roc: [0.18, 0.36], quality: [0.82, 0.98] },
    { riskClass: "High Risk", count: 14, dev: [2.4, 3.8], roc: [0.32, 0.62], quality: [0.8, 0.99] },
    { riskClass: "Data Quality Concern", count: 10, dev: [-0.6, 2.4], roc: [0, 0.4], quality: [0.28, 0.62] },
  ];
  let n = 1;
  clusters.forEach((cluster) => {
    for (let i = 0; i < cluster.count; i += 1) {
      const region = ANOMALY_REGIONS[Math.floor(rnd() * ANOMALY_REGIONS.length)];
      const product = ANOMALY_PRODUCTS[Math.floor(rnd() * ANOMALY_PRODUCTS.length)];
      const dev = cluster.dev[0] + rnd() * (cluster.dev[1] - cluster.dev[0]);
      const roc = cluster.roc[0] + rnd() * (cluster.roc[1] - cluster.roc[0]);
      const quality = cluster.quality[0] + rnd() * (cluster.quality[1] - cluster.quality[0]);
      const complete = cluster.riskClass !== "Data Quality Concern" || rnd() > 0.5;
      records.push({
        linkId: `LNK-${String(1000 + n).slice(1)}-${String(n).padStart(3, "0")}`,
        region, product,
        baselineDeviation: Math.round(dev * 100) / 100,
        rateOfChange: Math.round(roc * 100) / 100,
        riskClass: cluster.riskClass,
        serviceCriticality: Math.round((0.2 + rnd() * 0.8) * 100) / 100,
        dataQuality: Math.round(quality * 100) / 100,
        telemetryComplete: complete,
        reasons:
          cluster.riskClass === "Data Quality Concern"
            ? ["Incomplete telemetry window", "Stale environmental source"]
            : cluster.riskClass === "High Risk"
              ? ["Baseline deviation above 2.4 sigma", "Rising optical loss rate", "Environmental corroboration"]
              : cluster.riskClass === "Elevated"
                ? ["Baseline deviation above 1.8 sigma", "Cohort peers degrading"]
                : cluster.riskClass === "Watch"
                  ? ["Mild baseline deviation"]
                  : ["Within baseline"],
      });
      n += 1;
    }
  });
  return records;
}

/** Selected demonstration link, always rendered prominently. */
export const SELECTED_LINK_ID = "CHN-MBL-041";

export const anomalyRecords: AnomalyRecord[] = [
  {
    linkId: SELECTED_LINK_ID, region: "India South", product: "Lightbridge Terminal",
    baselineDeviation: 2.8, rateOfChange: 0.46, riskClass: "High Risk",
    serviceCriticality: 0.88, dataQuality: 0.96, telemetryComplete: true,
    reasons: ["2.8 sigma baseline deviation", "0.46 dB/h loss rate", "Fog forecast agreement 0.93", "Nine peer links degrading"],
  },
  {
    linkId: "CHN-MBL-042", region: "India South", product: "Lightbridge Terminal",
    baselineDeviation: 2.5, rateOfChange: 0.39, riskClass: "High Risk",
    serviceCriticality: 0.71, dataQuality: 0.94, telemetryComplete: true,
    reasons: ["2.5 sigma baseline deviation", "Rising loss rate", "Same fog corridor"],
  },
  {
    linkId: "CHN-MBL-043", region: "India South", product: "Metro Backhaul",
    baselineDeviation: 1.9, rateOfChange: 0.24, riskClass: "Elevated",
    serviceCriticality: 0.52, dataQuality: 0.93, telemetryComplete: true,
    reasons: ["Cohort peers degrading", "Moderate baseline deviation"],
  },
  ...buildAnomalyRecords(),
];

export const anomalyServices: AnomalyService[] = [
  { id: "dynamic-baselines", name: "Dynamic Baselines", determinism: "Deterministic", state: "Complete", evaluated: "118 links", findings: 14, lastRun: "40s ago", result: "14 links outside baseline" },
  { id: "rate-of-change", name: "Rate-of-Change Detection", determinism: "Deterministic", state: "Complete", evaluated: "118 links", findings: 9, lastRun: "40s ago", result: "9 links losing margin faster than 0.2 dB/h" },
  { id: "cohort", name: "Cohort Comparison", determinism: "Deterministic", state: "Complete", evaluated: "12 cohorts", findings: 2, lastRun: "1m ago", result: "Chennai metro cohort degrading together" },
  { id: "missing-data", name: "Missing-Data Detection", determinism: "Deterministic", state: "Complete", evaluated: "40 signals", findings: 0, lastRun: "40s ago", result: "No missing required signals" },
  { id: "stale-data", name: "Stale-Data Detection", determinism: "Deterministic", state: "Warning", evaluated: "40 signals", findings: 1, lastRun: "40s ago", result: "Cohort feed 52 minutes old" },
  { id: "seasonal", name: "Seasonal Deviation", determinism: "Model-based", state: "Complete", evaluated: "118 links", findings: 6, lastRun: "5m ago", result: "Within seasonal fog expectation" },
  { id: "threshold", name: "Threshold Proximity", determinism: "Deterministic", state: "Active", evaluated: "118 links", findings: 5, lastRun: "40s ago", result: "CHN-MBL-041 within 3.7 dB of minimum" },
  { id: "pattern", name: "Multi-Signal Pattern Detection", determinism: "Model-based", state: "Complete", evaluated: "118 links", findings: 4, lastRun: "1m ago", result: "Fog-onset pattern matched" },
  { id: "contradiction", name: "Cross-Signal Contradiction Detection", determinism: "Deterministic", state: "Complete", evaluated: "40 signals", findings: 0, lastRun: "1m ago", result: "No contradicting sources" },
  { id: "telemetry-quality", name: "Telemetry-Quality Validation", determinism: "Deterministic", state: "Complete", evaluated: "118 links", findings: 10, lastRun: "40s ago", result: "10 links below quality 0.7" },
];

/* ------------------------------- prediction ------------------------------- */

export const modelComponents: ModelComponent[] = [
  { id: "gradient-boosting", name: "Gradient-Boosting Model", weightPct: 28, output: "0.93 risk", agreement: "Agrees", dataRequirement: "All engineered features", confidencePct: 95, lastEvaluated: "30s ago", determinism: "Model-based", issue: null },
  { id: "temporal", name: "Temporal Model", weightPct: 22, output: "ETA 5h 38m", agreement: "Agrees", dataRequirement: "90 minutes of margin history", confidencePct: 93, lastEvaluated: "30s ago", determinism: "Model-based", issue: null },
  { id: "weather-impact", name: "Weather-Impact Model", weightPct: 18, output: "0.96 risk", agreement: "Agrees", dataRequirement: "Two or more weather sources", confidencePct: 96, lastEvaluated: "4m ago", determinism: "Model-based", issue: null },
  { id: "link-performance", name: "Link-Performance Model", weightPct: 16, output: "0.89 risk", agreement: "Agrees", dataRequirement: "Optical telemetry", confidencePct: 92, lastEvaluated: "30s ago", determinism: "Model-based", issue: null },
  { id: "service-criticality", name: "Service-Criticality Model", weightPct: 8, output: "Critical service exposed", agreement: "Agrees", dataRequirement: "Service catalogue and SLO state", confidencePct: 90, lastEvaluated: "50s ago", determinism: "Deterministic", issue: null },
  { id: "historical-similarity", name: "Historical-Similarity Model", weightPct: 5, output: "0.88 similarity", agreement: "Partially agrees", dataRequirement: "Historical event vectors", confidencePct: 78, lastEvaluated: "52m ago", determinism: "Model-based", issue: "Cohort feed 52 minutes old" },
  { id: "engineering-rules", name: "Engineering Rules", weightPct: 3, output: "No override", agreement: "Agrees", dataRequirement: "Margin, quality and fallback state", confidencePct: 99, lastEvaluated: "30s ago", determinism: "Deterministic", issue: null },
];

export const ensembleResult: ModelEnsembleResult = {
  linkId: SELECTED_LINK_ID,
  riskProbability: 0.94,
  riskClass: "High",
  confidencePct: 94,
  eta: "5h 42m",
  capacityExposure: "10 Gbps",
  agreement: "Strong",
  missingDataPenalty: 0,
  calibration: "Within range",
  engineeringRule: "No override",
  modelVersion: "v2.4.1",
};

/* ------------------------------ service impact ---------------------------- */

export const serviceImpactRecords: ServiceImpactRecord[] = [
  { id: "services", label: "Services Exposed", value: "1", detail: "SVC-CHN-CORE-10G, Critical tier managed service", tone: "critical" },
  { id: "capacity", label: "Capacity at Risk", value: "10 Gbps", detail: "Full protected capacity of the primary optical path", tone: "warning" },
  { id: "customer", label: "Customer Impact", value: "Preventable", detail: "No customer impact if action completes before the predicted window", tone: "positive" },
  { id: "slo", label: "SLO Impact", value: "Elevated", detail: "Availability objective 99.99%, currently at elevated risk", tone: "warning" },
  { id: "error-budget", label: "Error-Budget Impact", value: "22% avoided", detail: "22% error-budget exposure avoided if the action succeeds", tone: "positive" },
  { id: "fallback", label: "Fallback Readiness", value: "Ready", detail: "RF fallback healthy with 42% headroom", tone: "positive" },
  { id: "blast", label: "Blast Radius", value: "3 clusters", detail: "Three downstream aggregation clusters depend on this path", tone: "warning" },
  { id: "downstream", label: "Downstream Sites", value: "3", detail: "Chennai South, Chennai West, Edge Aggregation", tone: "neutral" },
  { id: "priority", label: "Customer Priority", value: "Critical", detail: "Contracted priority restoration customer", tone: "critical" },
  { id: "preventability", label: "Preventability", value: "High", detail: "5h 42m of lead time with a ready fallback path", tone: "positive" },
];

export const impactTopologyNodes: ImpactTopologyNode[] = [
  { id: "customer", type: "Customer", name: "Chennai Metro Enterprise", health: "Unaffected", capacity: "n/a", risk: "Indirect", owner: "Customer Operations", role: "Service consumer", col: 0, row: 1 },
  { id: "service", type: "Customer Service", name: "SVC-CHN-CORE-10G", health: "At risk", capacity: "10 Gbps", risk: "High", owner: "Service Management", role: "Protected service", col: 1, row: 1 },
  { id: "route", type: "Service Route", name: "RTE-CHN-NORTH-CORE", health: "Degrading", capacity: "10 Gbps", risk: "High", owner: "Network Engineering", role: "Active path", col: 2, row: 1 },
  { id: "link", type: "Optical Link", name: SELECTED_LINK_ID, health: "Degrading", capacity: "10 Gbps", risk: "High", owner: "Optical Engineering", role: "Primary optical span", col: 3, row: 1 },
  { id: "terminal-a", type: "Terminal", name: "TRM-CHN-NORTH-A", health: "Nominal", capacity: "10 Gbps", risk: "Medium", owner: "Optical Engineering", role: "Transmit terminal", col: 4, row: 0 },
  { id: "terminal-b", type: "Terminal", name: "TRM-CHN-CORE-B", health: "Nominal", capacity: "10 Gbps", risk: "Medium", owner: "Optical Engineering", role: "Receive terminal", col: 4, row: 2 },
  { id: "fallback", type: "RF Fallback", name: "RF-CHN-CORE-01", health: "Ready", capacity: "10 Gbps, 42% free", risk: "Low", owner: "Network Engineering", role: "Protection path", col: 3, row: 3 },
  { id: "downstream", type: "Downstream Sites", name: "3 aggregation clusters", health: "Nominal", capacity: "18 Gbps combined", risk: "Medium", owner: "Regional Operations", role: "Dependent sites", col: 5, row: 1 },
  { id: "slo", type: "SLO", name: "Availability 99.99%", health: "Elevated", capacity: "n/a", risk: "Elevated", owner: "SRE", role: "Objective", col: 1, row: 3 },
  { id: "error-budget", type: "Error Budget", name: "Q3 error budget", health: "78% remaining", capacity: "n/a", risk: "22% exposed", owner: "SRE", role: "Budget", col: 2, row: 3 },
];

export const impactTopologyEdges: ImpactTopologyEdge[] = [
  { from: "customer", to: "service", label: "consumes", kind: "primary" },
  { from: "service", to: "route", label: "runs over", kind: "primary" },
  { from: "route", to: "link", label: "uses", kind: "primary" },
  { from: "link", to: "terminal-a", label: "terminates", kind: "primary" },
  { from: "link", to: "terminal-b", label: "terminates", kind: "primary" },
  { from: "route", to: "fallback", label: "protected by", kind: "fallback" },
  { from: "link", to: "downstream", label: "feeds", kind: "primary" },
  { from: "service", to: "slo", label: "measured by", kind: "governs" },
  { from: "slo", to: "error-budget", label: "consumes", kind: "governs" },
];

/* --------------------------- recommended actions -------------------------- */

export const pipelineActions: PipelineRecommendedAction[] = [
  {
    id: "move-priority", rank: 1, name: "Move Priority Traffic",
    expectedOutcome: "Critical customer traffic shifted to RF fallback before predicted degradation",
    technicalRisk: "Low", customerImpact: "None expected, sub-second reconvergence", sloImpact: "Protects 22% of error budget",
    reversibility: "Fully reversible", approval: "Approval required", confidencePct: 94,
    validation: "Confirm fallback throughput and loss for 15 minutes", rollback: "Automatic return to optical path when margin recovers",
    status: "Recommended", capacityProtected: "10 Gbps", timeToExecute: "4 min", comparable: true,
    rationale: "High-confidence fog-related optical degradation is predicted, RF fallback has sufficient headroom, customer impact is preventable, and the action is reversible.",
  },
  {
    id: "prepare-fallback", rank: 2, name: "Prepare Fallback",
    expectedOutcome: "RF fallback pre-staged and validated without moving traffic",
    technicalRisk: "Low", customerImpact: "None", sloImpact: "Neutral", reversibility: "Fully reversible",
    approval: "Automatic", confidencePct: 97, validation: "Fallback health check", rollback: "Release pre-staged capacity",
    status: "Available", capacityProtected: "0 Gbps until executed", timeToExecute: "2 min", comparable: true,
    rationale: "Low-risk preparation step that shortens execution time for any traffic move.",
  },
  {
    id: "monitor", rank: 3, name: "Monitor Closely",
    expectedOutcome: "Continued observation at the current cadence",
    technicalRisk: "Low", customerImpact: "None", sloImpact: "No protection", reversibility: "Fully reversible",
    approval: "Automatic", confidencePct: 99, validation: "None required", rollback: "Not applicable",
    status: "Available", capacityProtected: "0 Gbps", timeToExecute: "Immediate", comparable: true,
    rationale: "Baseline option, retained for comparison against protective actions.",
  },
  {
    id: "increase-monitoring", rank: 4, name: "Increase Monitoring Frequency",
    expectedOutcome: "Telemetry cadence raised to 5 seconds on the affected corridor",
    technicalRisk: "Low", customerImpact: "None", sloImpact: "Improves detection only", reversibility: "Fully reversible",
    approval: "Automatic", confidencePct: 98, validation: "Confirm cadence change", rollback: "Restore standard cadence",
    status: "Available", capacityProtected: "0 Gbps", timeToExecute: "1 min", comparable: false,
    rationale: "Improves evidence quality while the approval decision is pending.",
  },
  {
    id: "move-all", rank: 5, name: "Move All Traffic",
    expectedOutcome: "All traffic shifted to RF fallback",
    technicalRisk: "Medium", customerImpact: "Best-effort traffic may see reduced throughput", sloImpact: "Protects all services",
    reversibility: "Fully reversible", approval: "Approval required", confidencePct: 88,
    validation: "Confirm no congestion on fallback for 15 minutes", rollback: "Return all traffic to optical path",
    status: "Standby", capacityProtected: "10 Gbps", timeToExecute: "6 min", comparable: true,
    rationale: "Fallback headroom of 42% is insufficient for all classes at peak, so this is held in standby.",
  },
  {
    id: "investigate", rank: 6, name: "Open Investigation",
    expectedOutcome: "Agentic investigation workspace opened with the current evidence bundle",
    technicalRisk: "Low", customerImpact: "None", sloImpact: "Neutral", reversibility: "Fully reversible",
    approval: "Automatic", confidencePct: 96, validation: "None required", rollback: "Close investigation",
    status: "Available", capacityProtected: "0 Gbps", timeToExecute: "Immediate", comparable: false,
    rationale: "Useful when the operator wants cross-domain analysis before approving a traffic move.",
  },
  {
    id: "restrict-changes", rank: 7, name: "Restrict Planned Changes",
    expectedOutcome: "Change freeze applied to the Chennai metro corridor for 12 hours",
    technicalRisk: "Low", customerImpact: "None", sloImpact: "Reduces compound risk", reversibility: "Fully reversible",
    approval: "Approval required", confidencePct: 91, validation: "Confirm freeze in change management", rollback: "Lift freeze",
    status: "Available", capacityProtected: "0 Gbps", timeToExecute: "3 min", comparable: false,
    rationale: "Prevents change-induced risk stacking on top of the predicted environmental event.",
  },
  {
    id: "reacquire", rank: 8, name: "Reacquire Beam",
    expectedOutcome: "Terminal re-runs acquisition to recover pointing accuracy",
    technicalRisk: "Medium", customerImpact: "Brief interruption of up to 8 seconds", sloImpact: "Consumes error budget",
    reversibility: "Partially reversible", approval: "Approval required", confidencePct: 62,
    validation: "Confirm margin recovery after reacquisition", rollback: "Fail back to previous pointing solution",
    status: "Not recommended", capacityProtected: "10 Gbps", timeToExecute: "8 min", comparable: true,
    rationale: "Degradation is environmental rather than pointing related, so reacquisition is unlikely to help and risks an interruption.",
  },
  {
    id: "dispatch", rank: 9, name: "Dispatch Field Service",
    expectedOutcome: "Field engineer dispatched to inspect terminal optics",
    technicalRisk: "Low", customerImpact: "None", sloImpact: "Neutral", reversibility: "Not reversible",
    approval: "Approval required", confidencePct: 41, validation: "Field inspection report", rollback: "Recall dispatch, cost incurred",
    status: "Not recommended", capacityProtected: "0 Gbps", timeToExecute: "4 h", comparable: true,
    rationale: "No hardware fault indicated; dispatch would not arrive before the predicted window.",
  },
];

export const DEFAULT_ACTION_ID = "move-priority";
export const DEFAULT_STAGE: PipelineStageKey = "predict";

export const pipelineEvidence: PipelineEvidenceReference[] = [
  { id: "pev-1", label: "Weather ensemble agreement", detail: "Three of three sources predict fog within 6 hours, agreement 0.93." },
  { id: "pev-2", label: "Optical margin trace", detail: "Margin fell from 7.1 dB to 6.4 dB over 90 minutes, 0.46 dB/h." },
  { id: "pev-3", label: "Cohort behaviour", detail: "Nine peer Chennai links show the same degradation signature." },
  { id: "pev-4", label: "Historical precedent", detail: "2025-12-14 fog event degraded the same corridor within 6 hours." },
  { id: "pev-5", label: "Fallback readiness", detail: "RF fallback healthy, 42% headroom, validated 6 minutes ago." },
  { id: "pev-6", label: "Change context", detail: "No configuration or maintenance change in the last 72 hours." },
];
