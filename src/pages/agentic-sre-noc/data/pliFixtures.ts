/**
 * Predictive Optical Link Intelligence (AIM-001) — page framework fixtures.
 *
 * Internal capability: AI Modeling for Predictive Optical Link Protection.
 * Everything in this file is synthetic, Taara-aligned demonstration data used
 * only to establish the page framework. No model logic, no live telemetry.
 */

/* ------------------------------ typed model ------------------------------ */

export interface ModelSummary {
  name: string;
  capability: string;
  version: string;
  state: "Active Model" | "Shadow" | "Retired";
  lastRetrained: string;
  health: string;
  environment: string;
  owner: string;
}

export interface ModelMetric {
  key: string;
  label: string;
  value: string;
  deltaLabel: string;
  direction: "up" | "down" | "flat";
  intent: "positive" | "negative" | "neutral";
  /** Temporary fixture sparkline series — replaced in AIM-002. */
  sparkline: number[];
  description: string;
}

export interface OpticalLinkPrediction {
  linkId: string;
  route: string;
  risk: "High" | "Medium" | "Low" | "Unknown";
  leadTime: string;
  servicesExposed: number;
}

export interface ModelFeature {
  key: string;
  label: string;
  group: "Optical" | "Environmental" | "Network and Service" | "Historical and Context";
}

export interface FeatureContribution {
  feature: string;
  weightPct: number;
}

export interface TrainingDataset {
  key: string;
  label: string;
  sharePct: number;
  samples: string;
}

export interface ValidationResult {
  key: string;
  label: string;
  value: string;
}

export interface ModelActivity {
  at: string;
  actor: string;
  summary: string;
}

export interface ScenarioState {
  key: string;
  label: string;
  region: string;
  headline: string;
  riskLabel: "High Risk" | "Medium Risk" | "Low Risk";
}

export interface GovernanceRecord {
  key: string;
  label: string;
  value: string;
}

export interface RecommendedAction {
  key: string;
  label: string;
  approval: "Automatic" | "Approval required";
}

export interface ModelEvidence {
  key: string;
  label: string;
  detail: string;
}

/** Placeholder panel contract used by every shell on this page. */
export interface PanelSpec {
  id: string;
  title: string;
  visualType: string;
  /** Approximate final rendered height, desktop. */
  desktopHeight: string;
  description: string;
}

/* -------------------------------- content -------------------------------- */

export const modelSummary: ModelSummary = {
  name: "Predictive Optical Link Intelligence",
  capability: "AI Modeling for Predictive Optical Link Protection",
  version: "v2.4.1",
  state: "Active Model",
  lastRetrained: "15 min ago",
  health: "99.2%",
  environment: "Synthetic Taara-aligned demonstration environment",
  owner: "Optical Engineering and Applied ML",
};

export const pageSubtitle =
  "Predict optical-link degradation before customer impact using environmental, optical, network, service, and historical context";

export const breadcrumb = [
  "SRE",
  "Agentic SRE NOC",
  "Digital Twins",
  "Global Link Health Twin",
  "Predictive Optical Link Intelligence",
];

export const kpiMetrics: ModelMetric[] = [
  { key: "links-modeled", label: "Links Modeled", value: "8,721", deltaLabel: "3.2% vs 24h", direction: "up", intent: "positive", sparkline: [42, 45, 44, 49, 52, 51, 55], description: "Optical links currently covered by the prediction model." },
  { key: "at-risk", label: "Predicted At-Risk Links", value: "32", deltaLabel: "2 vs 24h", direction: "up", intent: "negative", sparkline: [18, 22, 20, 26, 24, 29, 32], description: "Links predicted to degrade within the forecast horizon." },
  { key: "high-risk-6h", label: "High Risk, Next 6 Hours", value: "6", deltaLabel: "1 vs 24h", direction: "up", intent: "negative", sparkline: [3, 4, 3, 5, 4, 5, 6], description: "Links with high-confidence degradation predicted in six hours." },
  { key: "lead-time", label: "Mean Lead Time", value: "5h 42m", deltaLabel: "1h 18m vs 24h", direction: "up", intent: "positive", sparkline: [3.1, 3.6, 4.0, 4.4, 4.9, 5.3, 5.7], description: "Average warning time between prediction and observed impact." },
  { key: "accuracy", label: "Prediction Accuracy", value: "94.1%", deltaLabel: "2.3% vs 7d", direction: "up", intent: "positive", sparkline: [90.4, 91.1, 91.8, 92.6, 93.2, 93.7, 94.1], description: "Share of predictions confirmed by observed link behaviour." },
  { key: "false-positive", label: "False Positive Rate", value: "2.8%", deltaLabel: "0.6% vs 7d", direction: "down", intent: "positive", sparkline: [4.1, 3.9, 3.6, 3.4, 3.1, 2.9, 2.8], description: "Predicted degradations that did not occur." },
  { key: "services-protected", label: "Customer Services Protected", value: "1,284", deltaLabel: "6.7% vs 7d", direction: "up", intent: "positive", sparkline: [1080, 1122, 1165, 1190, 1230, 1258, 1284], description: "Customer services shielded from predicted degradation." },
];

export const scenarios: ScenarioState[] = [
  { key: "chennai-fog", label: "Chennai Fog Risk", region: "India South", headline: "Fog attenuation predicted across Chennai metro links", riskLabel: "High Risk" },
  { key: "mumbai-monsoon", label: "Mumbai Monsoon Risk", region: "India West", headline: "Rain fade predicted on coastal spans", riskLabel: "Medium Risk" },
  { key: "nairobi-dust", label: "Nairobi Dust Risk", region: "Africa East", headline: "Particulate scattering on inland links", riskLabel: "Medium Risk" },
  { key: "baseline", label: "Baseline Operations", region: "Global", headline: "No elevated environmental risk", riskLabel: "Low Risk" },
];

export const timeRanges = ["Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days"] as const;
export const forecastHorizons = ["2 hours", "6 hours", "12 hours", "24 hours"] as const;
export const regions = ["All regions", "India South", "India West", "Africa East", "Americas", "Europe"] as const;
export const products = ["All products", "Lightbridge Terminal", "Metro Backhaul", "Enterprise Access"] as const;

export const pipelineStages = [
  { key: "observe", index: 1, title: "Observe", caption: "Collect Signals" },
  { key: "engineer", index: 2, title: "Engineer", caption: "Feature Engineering" },
  { key: "detect", index: 3, title: "Detect", caption: "Anomaly Detection" },
  { key: "predict", index: 4, title: "Predict", caption: "Risk Prediction" },
  { key: "impact", index: 5, title: "Impact", caption: "Customer Impact" },
  { key: "act", index: 6, title: "Act", caption: "Protected Action" },
] as const;

export type PipelineStageKey = (typeof pipelineStages)[number]["key"];

export const modelFeatures: ModelFeature[] = [
  { key: "link-margin", label: "Link Margin", group: "Optical" },
  { key: "received-power", label: "Received Power", group: "Optical" },
  { key: "attenuation", label: "Attenuation", group: "Optical" },
  { key: "beam-lock", label: "Beam Lock Stability", group: "Optical" },
  { key: "reacquisition", label: "Reacquisition Count", group: "Optical" },
  { key: "visibility", label: "Visibility Forecast", group: "Environmental" },
  { key: "fog", label: "Fog Probability", group: "Environmental" },
  { key: "humidity", label: "Humidity", group: "Environmental" },
  { key: "rainfall", label: "Rainfall Intensity", group: "Environmental" },
  { key: "wind", label: "Wind Conditions", group: "Environmental" },
  { key: "throughput", label: "Throughput", group: "Network and Service" },
  { key: "latency", label: "Latency", group: "Network and Service" },
  { key: "packet-loss", label: "Packet Loss", group: "Network and Service" },
  { key: "route-health", label: "Route Health", group: "Network and Service" },
  { key: "fallback-capacity", label: "Fallback Capacity", group: "Network and Service" },
  { key: "past-incidents", label: "Past Incidents", group: "Historical and Context" },
  { key: "seasonal", label: "Seasonal Patterns", group: "Historical and Context" },
  { key: "site", label: "Site Characteristics", group: "Historical and Context" },
  { key: "geometry", label: "Link Geometry", group: "Historical and Context" },
];

export const featureContributions: FeatureContribution[] = [
  { feature: "Visibility (km)", weightPct: 28 },
  { feature: "Fog Probability", weightPct: 22 },
  { feature: "Link Degradation Rate", weightPct: 18 },
  { feature: "Humidity", weightPct: 12 },
  { feature: "Historical Similarity", weightPct: 8 },
  { feature: "Rainfall Intensity", weightPct: 5 },
  { feature: "Wind Speed", weightPct: 3 },
  { feature: "Other Factors", weightPct: 4 },
];

export const trainingDatasets: TrainingDataset[] = [
  { key: "optical", label: "Optical Signals", sharePct: 42, samples: "504k" },
  { key: "weather", label: "Weather Data", sharePct: 28, samples: "336k" },
  { key: "network", label: "Network Data", sharePct: 16, samples: "192k" },
  { key: "historical", label: "Historical Events", sharePct: 9, samples: "108k" },
  { key: "other", label: "Other Context", sharePct: 5, samples: "60k" },
];

export const validationResults: ValidationResult[] = [
  { key: "precision", label: "Precision", value: "93.2%" },
  { key: "recall", label: "Recall", value: "91.8%" },
  { key: "f1", label: "F1 Score", value: "92.5%" },
  { key: "mae", label: "MAE (Lead Time)", value: "28 min" },
];

export const trainingTabs = ["Training Data", "Validation", "Backtesting", "Explainability"] as const;
export type TrainingTab = (typeof trainingTabs)[number];

export const linkPredictions: OpticalLinkPrediction[] = [
  { linkId: "CHN-MBL-041", route: "Chennai North to Chennai Core", risk: "High", leadTime: "5h 42m", servicesExposed: 1 },
  { linkId: "CHN-MBL-042", route: "Chennai Coast to Chennai North", risk: "High", leadTime: "6h 05m", servicesExposed: 1 },
  { linkId: "CHN-MBL-043", route: "Chennai West to Chennai Core", risk: "Medium", leadTime: "7h 20m", servicesExposed: 0 },
  { linkId: "CHN-MBL-044", route: "Chennai Core to Chennai South", risk: "Medium", leadTime: "8h 10m", servicesExposed: 0 },
  { linkId: "CHN-MBL-046", route: "Chennai South to Edge Aggregation", risk: "Low", leadTime: "11h 30m", servicesExposed: 0 },
];

export const recommendedActions: RecommendedAction[] = [
  { key: "monitor", label: "Monitor Closely", approval: "Automatic" },
  { key: "increase", label: "Increase Monitoring", approval: "Automatic" },
  { key: "fallback", label: "Prepare Fallback", approval: "Automatic" },
  { key: "priority", label: "Move Priority Traffic", approval: "Approval required" },
  { key: "all", label: "Move All Traffic", approval: "Approval required" },
  { key: "investigate", label: "Open Investigation", approval: "Automatic" },
];

export const modelEvidence: ModelEvidence[] = [
  { key: "driver", label: "Primary Driver", detail: "Fog Attenuation" },
  { key: "impact", label: "Predicted Impact", detail: "5h 42m" },
  { key: "links", label: "Links at Risk", detail: "6 (3 High, 3 Medium)" },
  { key: "services", label: "Services Exposed", detail: "1 Service (10 Gbps)" },
  { key: "confidence", label: "Confidence", detail: "94%" },
  { key: "window", label: "Recommended Window", detail: "Within 6 Hours" },
];

export const traditionalMonitoringGaps = [
  "Traditional tools detect after threshold breach, not before.",
  "No unified model that combines optical physics, weather, and service context.",
  "Manual correlation across multiple tools and teams.",
  "No customer-service-aware risk calculation.",
  "No governed recommendation with fallback validation.",
  "No continuous feedback loop from outcomes to the model.",
];

export const governanceRecords: GovernanceRecord[] = [
  { key: "owner", label: "Model owner", value: "Optical Engineering and Applied ML" },
  { key: "review", label: "Last governance review", value: "2026-07-28" },
  { key: "approval", label: "Autonomy tier", value: "L3, recommend with approval" },
  { key: "lineage", label: "Model lineage", value: "PLI-2026.2 from PLI-2026.1" },
  { key: "drift", label: "Drift monitoring", value: "Daily, threshold 3%" },
  { key: "retention", label: "Evidence retention", value: "400 days" },
];

export const modelActivity: ModelActivity[] = [
  { at: "15 min ago", actor: "Training pipeline", summary: "Incremental retrain completed, accuracy 94.1%" },
  { at: "3 hours ago", actor: "Optical Engineering", summary: "Chennai fog scenario reviewed and approved" },
  { at: "1 day ago", actor: "Governance", summary: "Autonomy tier confirmed at L3" },
];

/* ------------------------- placeholder panel specs ------------------------ */

export const panelSpecs: PanelSpec[] = [
  { id: "pipeline", title: "Predictive Optical Link Risk Model Pipeline", visualType: "Six-stage horizontal pipeline with grouped signal and model cards", desktopHeight: "480 to 560 px", description: "Shows how signals become features, anomalies, risk predictions, customer impact and protected action." },
  { id: "chennai", title: "Chennai Fog Scenario, Model Output", visualType: "Geospatial risk map with evidence sidebar", desktopHeight: "360 to 430 px", description: "Scenario map of predicted at-risk links with model evidence and recommended window." },
  { id: "performance", title: "Model Performance", visualType: "Accuracy gauge with precision, recall and F1 bars", desktopHeight: "260 to 330 px", description: "Rolling ninety day model quality metrics." },
  { id: "factors", title: "Top Predictive Factors", visualType: "Horizontal feature-importance bars", desktopHeight: "260 to 330 px", description: "Relative contribution of each input feature to the current prediction." },
  { id: "training", title: "Model Training and Validation", visualType: "Tabbed donut and backtest trend line", desktopHeight: "260 to 330 px", description: "Training composition, validation results, backtesting and explainability." },
  { id: "horizon", title: "Prediction Horizon Versus Confidence", visualType: "Multi-series confidence decay line chart", desktopHeight: "260 to 330 px", description: "Confidence by risk band across the forecast horizon." },
  { id: "traditional", title: "Why Traditional Monitoring Does Not Solve This", visualType: "Checklist with reactive versus predictive comparison", desktopHeight: "260 to 330 px", description: "Gaps in threshold based monitoring compared with predictive protection." },
  { id: "inputs", title: "Model Inputs", visualType: "Grouped input inventory", desktopHeight: "200 to 240 px", description: "Optical, environmental, network, service and historical inputs consumed by the model." },
  { id: "output", title: "Prediction Output", visualType: "Prediction record table", desktopHeight: "200 to 240 px", description: "Per-link prediction, lead time, risk band and exposed services." },
  { id: "governance", title: "Model Governance", visualType: "Governance record list with activity log", desktopHeight: "200 to 240 px", description: "Ownership, review, autonomy tier, lineage and evidence retention." },
];

export function getPanelSpec(id: string): PanelSpec {
  const found = panelSpecs.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown panel spec: ${id}`);
  return found;
}
