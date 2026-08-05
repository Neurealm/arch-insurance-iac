/**
 * AIM-004 — Operational Model Analytics types.
 *
 * Every record here is synthetic demonstration data for the Predictive Optical
 * Link Intelligence page. No live model, no Taara integration.
 */

export type MetricStatus = "On target" | "Near target" | "Below target";
export type TrendDirection = "up" | "down" | "flat";
export type RiskClassName = "High" | "Moderate" | "Low" | "Unknown";

export interface OperationalModelMetric {
  key: string;
  label: string;
  /** Numeric value in the metric's own unit. */
  value: number;
  unit: "%" | "min" | "count";
  displayValue: string;
  priorValue: number;
  priorDisplayValue: string;
  target: number;
  targetDisplayValue: string;
  /** Which direction of movement is good. */
  positiveDirection: "up" | "down";
  period: string;
  /** Short hover explanation. */
  explanation: string;
  /** Plain-language operational interpretation. */
  interpretation: string;
}

export interface TechnicalModelMetric {
  key: string;
  label: string;
  displayValue: string;
  target: string;
  definition: string;
  whyItMatters: string;
  limitation: string;
}

export interface ModelPerformanceSeriesPoint {
  period: string;
  value: number;
  priorValue: number;
}

export interface ModelPerformanceSeries {
  key: string;
  label: string;
  unit: "%" | "min";
  points: ModelPerformanceSeriesPoint[];
}

export interface PredictiveFactor {
  key: string;
  label: string;
  /** Model feature contribution, percent of total. */
  contributionPct: number;
  ciLowPct: number;
  ciHighPct: number;
  signalKey: string;
  currentValue: string;
  normalRange: string;
  direction: "Increasing" | "Decreasing" | "Stable";
  evidenceCount: number;
  evidenceSection: string;
  interpretation: string;
}

export interface FeatureContributionRecord {
  key: string;
  label: string;
  /** Signed contribution to the modelled risk score. */
  contribution: number;
  rawValue: number;
  rawUnit: string;
  normalRange: string;
  direction: "Increases risk" | "Reduces risk";
  evidenceSection: string;
  source: string;
  confidencePct: number;
}

export interface WaterfallBar {
  key: string;
  label: string;
  contribution: number;
  rawValue: number;
  rawUnit: string;
  start: number;
  end: number;
  direction: "Increases risk" | "Reduces risk";
  isTotal?: boolean;
}

export interface WaterfallResult {
  baseline: number;
  bars: WaterfallBar[];
  finalScore: number;
  runningSubtotal: number[];
  interpretation: string;
}

export interface PredictionHorizonPoint {
  hour: number;
  label: string;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  confidence: number;
}

export interface PredictionHorizonSeries {
  key: string;
  label: string;
  points: PredictionHorizonPoint[];
}

export interface HighRiskLinkRecord {
  priority: number;
  linkId: string;
  route: string;
  region: string;
  product: string;
  riskScore: number;
  riskClass: RiskClassName;
  capacityImpactGbps: number;
  etaMinutes: number;
  etaLabel: string;
  confidencePct: number;
  primaryDriver: string;
  customerServices: number;
  sloExposure: string;
  fallbackReadiness: "Ready" | "Degraded" | "Insufficient" | "Unavailable";
  recommendedAction: string;
  lastEvaluated: string;
}

export interface MetricComparison {
  key: string;
  label: string;
  current: number;
  prior: number;
  delta: number;
  deltaLabel: string;
  direction: TrendDirection;
  improved: boolean;
}

export interface ThresholdTradeoffPoint {
  threshold: number;
  highRiskCount: number;
  precision: number;
  recall: number;
  falsePositiveRate: number;
  missedEventRate: number;
  preventiveActions: number;
  servicesProtected: number;
}

export interface AnalyticsAnnotation {
  key: string;
  period: string;
  kind: "Retraining" | "Threshold change" | "Data quality";
  label: string;
}

export interface AnalyticsFilterState {
  region: string;
  product: string;
  riskClass: RiskClassName | "All";
  modelVersion: string;
  timePeriod: string;
  horizonHours: number;
  confidenceThreshold: number;
  kpiKey: string | null;
  metricKey: string;
  factorKey: string | null;
  factorScope: "global" | "selected";
  waterfallMode: "contribution" | "raw";
  technicalVisible: boolean;
  comparePrior: boolean;
}

export interface AnalyticsExportRecord {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}
