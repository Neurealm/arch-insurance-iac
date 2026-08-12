/**
 * AIM-004 — Operational Model Analytics fixtures.
 *
 * Synthetic, deterministic demonstration data. Link identifiers reuse the
 * existing Chennai estate; no duplicate link records are created here.
 */

import type {
  AnalyticsAnnotation, FeatureContributionRecord, HighRiskLinkRecord, ModelPerformanceSeries,
  OperationalModelMetric, PredictionHorizonSeries, TechnicalModelMetric,
} from "./analyticsTypes";

export const ANALYTICS_PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days", "Last 6 months"] as const;
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export const ANALYTICS_MODEL_VERSIONS = ["v2.4.1", "v2.3.6", "All versions"] as const;
export const ANALYTICS_HORIZONS = [2, 4, 6, 8, 10, 12] as const;
export const DEFAULT_ANALYTICS_LINK_ID = "CHN-MBL-041";

/* --------------------------- operational metrics -------------------------- */

export const operationalMetrics: OperationalModelMetric[] = [
  {
    key: "accuracy", label: "Operational Prediction Accuracy", value: 94.1, unit: "%",
    displayValue: "94.1%", priorValue: 91.8, priorDisplayValue: "91.8%", target: 93,
    targetDisplayValue: "93.0%", positiveDirection: "up", period: "Last 90 days",
    explanation: "Share of optical-link predictions confirmed by observed link behaviour.",
    interpretation: "94.1% of modelled degradation predictions matched what the links actually did.",
  },
  {
    key: "preventive", label: "Correct Preventive Action Rate", value: 93.2, unit: "%",
    displayValue: "93.2%", priorValue: 90.4, priorDisplayValue: "90.4%", target: 92,
    targetDisplayValue: "92.0%", positiveDirection: "up", period: "Last 90 days",
    explanation: "Share of preventive actions that avoided the predicted degradation.",
    interpretation: "93.2% of preventive actions taken on prediction avoided customer-visible degradation.",
  },
  {
    key: "customer-impact", label: "Customer-Impact Events Predicted", value: 91.8, unit: "%",
    displayValue: "91.8%", priorValue: 88.1, priorDisplayValue: "88.1%", target: 90,
    targetDisplayValue: "90.0%", positiveDirection: "up", period: "Last 90 days",
    explanation: "Share of customer-impacting optical events predicted before impact.",
    interpretation: "91.8% of events that reached customers were predicted ahead of time.",
  },
  {
    key: "protection", label: "Service Protection Effectiveness", value: 92.5, unit: "%",
    displayValue: "92.5%", priorValue: 89.7, priorDisplayValue: "89.7%", target: 91,
    targetDisplayValue: "91.0%", positiveDirection: "up", period: "Last 90 days",
    explanation: "Share of at-risk customer services protected before degradation began.",
    interpretation: "92.5% of exposed customer services were protected by a preventive action.",
  },
  {
    key: "lead-time-error", label: "Mean Lead-Time Error", value: 28, unit: "min",
    displayValue: "28 min", priorValue: 34, priorDisplayValue: "34 min", target: 30,
    targetDisplayValue: "30 min", positiveDirection: "down", period: "Last 90 days",
    explanation: "Average absolute difference between predicted and observed time to impact.",
    interpretation: "Predicted impact times were on average 28 minutes away from the observed time.",
  },
  {
    key: "false-positive", label: "False Positive Rate", value: 2.8, unit: "%",
    displayValue: "2.8%", priorValue: 3.4, priorDisplayValue: "3.4%", target: 3,
    targetDisplayValue: "3.0%", positiveDirection: "down", period: "Last 90 days",
    explanation: "High-risk predictions that did not become qualifying degradation events.",
    interpretation:
      "2.8% of high-risk predictions did not become qualifying optical degradation events within the modelled forecast window.",
  },
  {
    key: "coverage", label: "Model Coverage", value: 98.6, unit: "%",
    displayValue: "98.6%", priorValue: 97.9, priorDisplayValue: "97.9%", target: 98,
    targetDisplayValue: "98.0%", positiveDirection: "up", period: "Last 90 days",
    explanation: "Share of eligible optical links currently covered by the model.",
    interpretation: "98.6% of eligible links are scored by the model on every cycle.",
  },
  {
    key: "volume", label: "Prediction Volume", value: 24800, unit: "count",
    displayValue: "24,800", priorValue: 22150, priorDisplayValue: "22,150", target: 20000,
    targetDisplayValue: "20,000", positiveDirection: "up", period: "Last 90 days",
    explanation: "Total predictions produced across the modelled estate in the period.",
    interpretation: "24,800 link predictions were produced in the period.",
  },
  {
    key: "calibration", label: "Confidence Calibration", value: 98.1, unit: "%",
    displayValue: "98.1%", priorValue: 97.2, priorDisplayValue: "97.2%", target: 97,
    targetDisplayValue: "97.0%", positiveDirection: "up", period: "Last 90 days",
    explanation: "Agreement between stated confidence and observed outcome frequency.",
    interpretation: "Stated confidence matched observed outcomes within 1.9 percentage points.",
  },
];

export const PRIMARY_METRIC_KEY = "accuracy";

export function getOperationalMetric(key: string): OperationalModelMetric {
  return operationalMetrics.find((m) => m.key === key) ?? operationalMetrics[0];
}

/* ---------------------------- technical metrics --------------------------- */

export const technicalMetrics: TechnicalModelMetric[] = [
  {
    key: "precision", label: "Precision", displayValue: "93.2%", target: "≥ 92.0%",
    definition: "Share of high-risk predictions that became qualifying degradation events.",
    whyItMatters: "Low precision wastes preventive capacity and erodes operator trust.",
    limitation: "Sensitive to the confidence threshold and to event-qualification rules.",
  },
  {
    key: "recall", label: "Recall", displayValue: "91.8%", target: "≥ 90.0%",
    definition: "Share of qualifying degradation events the model predicted in advance.",
    whyItMatters: "Missed events become unprotected customer impact.",
    limitation: "Only counts events that were observable in the synthetic evidence set.",
  },
  {
    key: "f1", label: "F1 Score", displayValue: "92.5%", target: "≥ 91.0%",
    definition: "Harmonic mean of precision and recall.",
    whyItMatters: "Single balance point when tuning the decision threshold.",
    limitation: "Hides which side of the tradeoff is failing.",
  },
  {
    key: "roc-auc", label: "ROC AUC", displayValue: "0.967", target: "≥ 0.950",
    definition: "Ranking quality across all thresholds.",
    whyItMatters: "Indicates whether risky links are consistently ranked above safe links.",
    limitation: "Optimistic under heavy class imbalance.",
  },
  {
    key: "calibration-error", label: "Calibration Error", displayValue: "1.9%", target: "≤ 2.5%",
    definition: "Mean gap between stated confidence and observed outcome frequency.",
    whyItMatters: "Operators act on confidence, so confidence must mean what it says.",
    limitation: "Bin choice affects the reported value.",
  },
  {
    key: "brier", label: "Brier Score", displayValue: "0.041", target: "≤ 0.060",
    definition: "Mean squared error of the probability forecasts.",
    whyItMatters: "Penalises confident but wrong predictions.",
    limitation: "Not directly interpretable as an operational outcome.",
  },
];

/* ------------------------------ trend series ------------------------------ */

const trendPeriods = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8", "Wk 9", "Wk 10", "Wk 11", "Wk 12"];

function series(key: string, label: string, unit: "%" | "min", values: number[], priors: number[]): ModelPerformanceSeries {
  return {
    key, label, unit,
    points: trendPeriods.map((period, i) => ({ period, value: values[i], priorValue: priors[i] })),
  };
}

export const performanceSeries: ModelPerformanceSeries[] = [
  series("accuracy", "Operational Prediction Accuracy", "%",
    [90.2, 90.8, 91.1, 91.6, 92.0, 92.4, 92.7, 93.0, 93.3, 93.6, 93.9, 94.1],
    [88.1, 88.4, 88.9, 89.2, 89.6, 90.0, 90.3, 90.6, 90.9, 91.2, 91.5, 91.8]),
  series("preventive", "Preventive Action Effectiveness", "%",
    [88.4, 89.0, 89.6, 90.1, 90.6, 91.0, 91.4, 91.8, 92.2, 92.6, 92.9, 93.2],
    [86.0, 86.4, 86.9, 87.3, 87.8, 88.2, 88.6, 89.0, 89.4, 89.8, 90.1, 90.4]),
  series("false-positive", "False Positive Rate", "%",
    [4.3, 4.1, 4.0, 3.8, 3.7, 3.5, 3.4, 3.2, 3.1, 3.0, 2.9, 2.8],
    [5.1, 4.9, 4.7, 4.6, 4.4, 4.3, 4.1, 4.0, 3.8, 3.7, 3.5, 3.4]),
  series("lead-time-error", "Mean Lead-Time Error", "min",
    [41, 39, 38, 36, 35, 34, 33, 32, 31, 30, 29, 28],
    [48, 46, 45, 44, 42, 41, 40, 39, 38, 37, 35, 34]),
];

export const performanceAnnotations: AnalyticsAnnotation[] = [
  { key: "retrain-1", period: "Wk 4", kind: "Retraining", label: "Incremental retrain, fog feature set expanded" },
  { key: "threshold-1", period: "Wk 7", kind: "Threshold change", label: "Confidence threshold raised to 0.62" },
  { key: "dq-1", period: "Wk 9", kind: "Data quality", label: "Weather feed gap, 4 hours, India South" },
];

/* -------------------------- feature contributions ------------------------- */

/** Selected-link contributions for the Chennai fog scenario link. */
const chennaiContributions: FeatureContributionRecord[] = [
  { key: "visibility", label: "Visibility Decrease", contribution: 0.28, rawValue: 0.6, rawUnit: "km", normalRange: "4.0 to 10.0 km", direction: "Increases risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 96 },
  { key: "humidity", label: "Humidity Increase", contribution: 0.21, rawValue: 97, rawUnit: "%", normalRange: "55 to 80%", direction: "Increases risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 95 },
  { key: "link-margin", label: "Link-Margin Decrease", contribution: 0.17, rawValue: 2.4, rawUnit: "dB", normalRange: "6.0 to 12.0 dB", direction: "Increases risk", evidenceSection: "Optical Signals", source: "Terminal telemetry", confidencePct: 94 },
  { key: "attenuation", label: "Attenuation Increase", contribution: 0.12, rawValue: 9.8, rawUnit: "dB/km", normalRange: "1.0 to 4.0 dB/km", direction: "Increases risk", evidenceSection: "Optical Signals", source: "Terminal telemetry", confidencePct: 93 },
  { key: "received-power", label: "Received-Power Decrease", contribution: 0.08, rawValue: -34.2, rawUnit: "dBm", normalRange: "-28.0 to -20.0 dBm", direction: "Increases risk", evidenceSection: "Optical Signals", source: "Terminal telemetry", confidencePct: 92 },
  { key: "rain", label: "Rain Increase", contribution: 0.05, rawValue: 2.1, rawUnit: "mm/h", normalRange: "0.0 to 1.0 mm/h", direction: "Increases risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 88 },
  { key: "temperature", label: "Temperature Increase", contribution: -0.07, rawValue: 29.4, rawUnit: "°C", normalRange: "24.0 to 31.0 °C", direction: "Reduces risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 90 },
  { key: "wind", label: "Wind Increase", contribution: -0.04, rawValue: 18, rawUnit: "km/h", normalRange: "5 to 25 km/h", direction: "Reduces risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 89 },
  { key: "other", label: "Other Factors", contribution: -0.03, rawValue: 0, rawUnit: "", normalRange: "n/a", direction: "Reduces risk", evidenceSection: "Model Context", source: "Model context", confidencePct: 82 },
];

export const WATERFALL_BASELINE = 0.17;

/**
 * Deterministic per-link contributions. Non-Chennai links reuse the same
 * factor structure scaled to their own modelled risk score.
 */
export function contributionsForLink(linkId: string, riskScore: number): FeatureContributionRecord[] {
  if (linkId === DEFAULT_ANALYTICS_LINK_ID) return chennaiContributions;
  const baseTotal = chennaiContributions.reduce((s, c) => s + c.contribution, 0);
  const targetTotal = Math.max(0.01, riskScore - WATERFALL_BASELINE);
  const scale = targetTotal / baseTotal;
  return chennaiContributions.map((c, i) => ({
    ...c,
    contribution: Math.round(c.contribution * scale * 1000) / 1000,
    rawValue: Math.round((c.rawValue * (0.9 + ((i % 5) * 0.05))) * 10) / 10,
  }));
}

/** Global (all-estate) contributions, used by the Global Model factor scope. */
export const globalContributions: FeatureContributionRecord[] = [
  { key: "visibility", label: "Visibility", contribution: 0.28, rawValue: 3.4, rawUnit: "km", normalRange: "4.0 to 10.0 km", direction: "Increases risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 95 },
  { key: "fog", label: "Fog Probability", contribution: 0.22, rawValue: 46, rawUnit: "%", normalRange: "0 to 30%", direction: "Increases risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 94 },
  { key: "degradation-rate", label: "Link Degradation Rate", contribution: 0.18, rawValue: 1.6, rawUnit: "dB/h", normalRange: "0.0 to 0.8 dB/h", direction: "Increases risk", evidenceSection: "Optical Signals", source: "Terminal telemetry", confidencePct: 93 },
  { key: "humidity", label: "Humidity", contribution: 0.12, rawValue: 81, rawUnit: "%", normalRange: "55 to 80%", direction: "Increases risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 92 },
  { key: "historical", label: "Historical Similarity", contribution: 0.08, rawValue: 74, rawUnit: "%", normalRange: "0 to 60%", direction: "Increases risk", evidenceSection: "Historical Context", source: "Event archive", confidencePct: 88 },
  { key: "rain", label: "Rainfall Intensity", contribution: 0.05, rawValue: 1.2, rawUnit: "mm/h", normalRange: "0.0 to 1.0 mm/h", direction: "Increases risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 87 },
  { key: "wind", label: "Wind Speed", contribution: 0.03, rawValue: 21, rawUnit: "km/h", normalRange: "5 to 25 km/h", direction: "Increases risk", evidenceSection: "Environmental Signals", source: "Weather ensemble", confidencePct: 85 },
  { key: "other", label: "Other Factors", contribution: 0.04, rawValue: 0, rawUnit: "", normalRange: "n/a", direction: "Increases risk", evidenceSection: "Model Context", source: "Model context", confidencePct: 80 },
];

/* ------------------------------ horizon series ---------------------------- */

const horizonHours = [0, 2, 4, 6, 8, 10, 12];
const horizonLabels = ["Now", "2 hours", "4 hours", "6 hours", "8 hours", "10 hours", "12 hours"];

function horizon(
  key: string, label: string, high: number[], medium: number[], low: number[], confidence: number[],
): PredictionHorizonSeries {
  return {
    key, label,
    points: horizonHours.map((hour, i) => ({
      hour, label: horizonLabels[i],
      highRisk: high[i], mediumRisk: medium[i], lowRisk: low[i], confidence: confidence[i],
    })),
  };
}

export const horizonSeries: PredictionHorizonSeries[] = [
  horizon("current", "Current forecast",
    [0.18, 0.42, 0.71, 0.94, 0.88, 0.74, 0.61],
    [0.34, 0.41, 0.36, 0.28, 0.31, 0.36, 0.39],
    [0.48, 0.32, 0.19, 0.11, 0.14, 0.21, 0.28],
    [96, 95, 94, 94, 88, 79, 68]),
  horizon("previous", "Previous forecast",
    [0.16, 0.36, 0.62, 0.83, 0.79, 0.68, 0.57],
    [0.32, 0.39, 0.35, 0.30, 0.33, 0.37, 0.40],
    [0.52, 0.36, 0.24, 0.16, 0.19, 0.25, 0.31],
    [94, 93, 91, 90, 84, 76, 66]),
  horizon("dense-fog", "Dense-fog What-If",
    [0.24, 0.58, 0.86, 0.98, 0.96, 0.89, 0.78],
    [0.30, 0.34, 0.24, 0.14, 0.16, 0.22, 0.28],
    [0.42, 0.22, 0.11, 0.05, 0.07, 0.12, 0.18],
    [95, 94, 93, 92, 86, 77, 65]),
  horizon("clear-recovery", "Clear-recovery What-If",
    [0.15, 0.28, 0.34, 0.31, 0.24, 0.19, 0.16],
    [0.31, 0.36, 0.33, 0.29, 0.26, 0.24, 0.22],
    [0.58, 0.52, 0.48, 0.51, 0.58, 0.63, 0.68],
    [96, 95, 93, 91, 86, 78, 70]),
  horizon("insufficient-fallback", "Insufficient-fallback What-If",
    [0.21, 0.48, 0.78, 0.96, 0.93, 0.84, 0.72],
    [0.33, 0.38, 0.31, 0.22, 0.25, 0.30, 0.34],
    [0.44, 0.28, 0.15, 0.07, 0.09, 0.15, 0.22],
    [93, 92, 90, 89, 83, 74, 63]),
];

export function getHorizonSeries(key: string): PredictionHorizonSeries {
  return horizonSeries.find((s) => s.key === key) ?? horizonSeries[0];
}

export const HORIZON_MARKERS = {
  currentHour: 0,
  operatingWindowEndHour: 6,
  interventionWindowStartHour: 2,
  interventionWindowEndHour: 5,
  predictedImpactHour: 6,
  minimumConfidencePct: 85,
} as const;

/* ---------------------------- high-risk records --------------------------- */

export const highRiskLinkRecords: HighRiskLinkRecord[] = [
  { priority: 1, linkId: "CHN-MBL-041", route: "Chennai North to Chennai Core", region: "India South", product: "Metro Backhaul", riskScore: 0.94, riskClass: "High", capacityImpactGbps: 10, etaMinutes: 342, etaLabel: "5h 42m", confidencePct: 94, primaryDriver: "Fog attenuation", customerServices: 1, sloExposure: "Gold, 99.95%", fallbackReadiness: "Ready", recommendedAction: "Move priority traffic", lastEvaluated: "2 min ago" },
  { priority: 2, linkId: "CHN-MBL-043", route: "Chennai West to Chennai Core", region: "India South", product: "Metro Backhaul", riskScore: 0.91, riskClass: "High", capacityImpactGbps: 10, etaMinutes: 385, etaLabel: "6h 25m", confidencePct: 92, primaryDriver: "Fog attenuation", customerServices: 1, sloExposure: "Gold, 99.95%", fallbackReadiness: "Degraded", recommendedAction: "Prepare fallback", lastEvaluated: "2 min ago" },
  { priority: 3, linkId: "CHN-MBL-042", route: "Chennai Coast to Chennai North", region: "India South", product: "Metro Backhaul", riskScore: 0.88, riskClass: "High", capacityImpactGbps: 10, etaMinutes: 365, etaLabel: "6h 05m", confidencePct: 91, primaryDriver: "Humidity and fog", customerServices: 1, sloExposure: "Silver, 99.9%", fallbackReadiness: "Ready", recommendedAction: "Increase monitoring", lastEvaluated: "3 min ago" },
  { priority: 4, linkId: "CHN-MBL-044", route: "Chennai Core to Chennai South", region: "India South", product: "Enterprise Access", riskScore: 0.72, riskClass: "Moderate", capacityImpactGbps: 5, etaMinutes: 490, etaLabel: "8h 10m", confidencePct: 88, primaryDriver: "Link-margin decay", customerServices: 0, sloExposure: "Silver, 99.9%", fallbackReadiness: "Ready", recommendedAction: "Monitor closely", lastEvaluated: "3 min ago" },
  { priority: 5, linkId: "CHN-MBL-045", route: "Chennai South to Chennai West", region: "India South", product: "Enterprise Access", riskScore: 0.64, riskClass: "Moderate", capacityImpactGbps: 5, etaMinutes: 540, etaLabel: "9h 00m", confidencePct: 86, primaryDriver: "Rain fade", customerServices: 0, sloExposure: "Bronze, 99.5%", fallbackReadiness: "Ready", recommendedAction: "Monitor closely", lastEvaluated: "4 min ago" },
  { priority: 6, linkId: "MUM-DC-012", route: "Mumbai Coast to Mumbai Core", region: "India West", product: "Lightbridge Terminal", riskScore: 0.61, riskClass: "Moderate", capacityImpactGbps: 20, etaMinutes: 600, etaLabel: "10h 00m", confidencePct: 84, primaryDriver: "Rain fade", customerServices: 2, sloExposure: "Gold, 99.95%", fallbackReadiness: "Degraded", recommendedAction: "Prepare fallback", lastEvaluated: "5 min ago" },
  { priority: 7, linkId: "NBO-ISP-021", route: "Nairobi Central to Nairobi East", region: "Africa East", product: "Lightbridge Terminal", riskScore: 0.58, riskClass: "Moderate", capacityImpactGbps: 10, etaMinutes: 660, etaLabel: "11h 00m", confidencePct: 82, primaryDriver: "Particulate scattering", customerServices: 1, sloExposure: "Silver, 99.9%", fallbackReadiness: "Insufficient", recommendedAction: "Open investigation", lastEvaluated: "6 min ago" },
  { priority: 8, linkId: "RIO-MBL-055", route: "Rio North to Rio Core", region: "Americas", product: "Metro Backhaul", riskScore: 0.55, riskClass: "Moderate", capacityImpactGbps: 10, etaMinutes: 700, etaLabel: "11h 40m", confidencePct: 80, primaryDriver: "Humidity", customerServices: 0, sloExposure: "Bronze, 99.5%", fallbackReadiness: "Ready", recommendedAction: "Monitor closely", lastEvaluated: "7 min ago" },
  { priority: 9, linkId: "CHN-MBL-046", route: "Chennai South to Edge Aggregation", region: "India South", product: "Enterprise Access", riskScore: 0.31, riskClass: "Low", capacityImpactGbps: 2, etaMinutes: 690, etaLabel: "11h 30m", confidencePct: 78, primaryDriver: "Stable conditions", customerServices: 0, sloExposure: "Bronze, 99.5%", fallbackReadiness: "Ready", recommendedAction: "No action", lastEvaluated: "7 min ago" },
];

export const HIGH_RISK_COLUMNS = [
  { key: "priority", label: "Priority", numeric: true },
  { key: "linkId", label: "Link ID", numeric: false },
  { key: "route", label: "Route", numeric: false },
  { key: "region", label: "Region", numeric: false },
  { key: "product", label: "Product", numeric: false },
  { key: "riskScore", label: "Risk Score", numeric: true },
  { key: "riskClass", label: "Risk Class", numeric: false },
  { key: "capacityImpactGbps", label: "Capacity Impact", numeric: true },
  { key: "etaLabel", label: "ETA to Impact", numeric: false },
  { key: "confidencePct", label: "Confidence", numeric: true },
  { key: "primaryDriver", label: "Primary Driver", numeric: false },
  { key: "customerServices", label: "Customer Services", numeric: true },
  { key: "sloExposure", label: "SLO Exposure", numeric: false },
  { key: "fallbackReadiness", label: "Fallback Readiness", numeric: false },
  { key: "recommendedAction", label: "Recommended Action", numeric: false },
  { key: "lastEvaluated", label: "Last Evaluated", numeric: false },
] as const;

export type HighRiskColumnKey = (typeof HIGH_RISK_COLUMNS)[number]["key"];

export const DEFAULT_HIGH_RISK_COLUMNS: HighRiskColumnKey[] = [
  "priority", "linkId", "route", "region", "riskScore", "riskClass", "etaLabel",
  "confidencePct", "primaryDriver", "fallbackReadiness", "recommendedAction",
];

/* ------------------------------- KPI mapping ------------------------------ */

export interface KpiAction {
  kpiKey: string;
  metricKey: string;
  riskClass: "High" | "Moderate" | "Low" | "All";
  horizonHours: number | null;
  emphasises: "performance" | "horizon" | "high-risk" | "factors" | "threshold";
  summary: string;
}

export const kpiActions: KpiAction[] = [
  { kpiKey: "links-modeled", metricKey: "coverage", riskClass: "All", horizonHours: null, emphasises: "performance", summary: "Scope set to all modelled links. Risk-class filter cleared." },
  { kpiKey: "at-risk", metricKey: "customer-impact", riskClass: "All", horizonHours: 12, emphasises: "high-risk", summary: "Filtered to moderate and high risk across the full horizon." },
  { kpiKey: "high-risk-6h", metricKey: "accuracy", riskClass: "High", horizonHours: 6, emphasises: "high-risk", summary: "Filtered to high risk within the next six hours." },
  { kpiKey: "lead-time", metricKey: "lead-time-error", riskClass: "All", horizonHours: null, emphasises: "horizon", summary: "Lead-time metric selected. Prediction-horizon chart emphasised." },
  { kpiKey: "accuracy", metricKey: "accuracy", riskClass: "All", horizonHours: null, emphasises: "performance", summary: "Operational prediction accuracy selected." },
  { kpiKey: "false-positive", metricKey: "false-positive", riskClass: "All", horizonHours: null, emphasises: "threshold", summary: "False-positive metric selected. Threshold tradeoff shown." },
  { kpiKey: "services-protected", metricKey: "protection", riskClass: "All", horizonHours: null, emphasises: "performance", summary: "Service protection effectiveness selected." },
];

export function getKpiAction(kpiKey: string): KpiAction | undefined {
  return kpiActions.find((a) => a.kpiKey === kpiKey);
}

/** Baselines used by the deterministic threshold tradeoff estimate. */
export const THRESHOLD_BASELINE = {
  evaluatedLinks: 8721,
  baselineHighRiskCount: 32,
  baselineServicesAtRisk: 1284,
} as const;
