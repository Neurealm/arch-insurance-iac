/**
 * AIM-004 — pure, deterministic analytics calculations.
 *
 * No UI state, no randomness, no side effects. Every function is boundary safe
 * and returns null (or an empty result) for missing or degenerate input.
 */

import type {
  AnalyticsFilterState, FeatureContributionRecord, HighRiskLinkRecord, MetricComparison,
  PredictionHorizonPoint, PredictiveFactor, ThresholdTradeoffPoint, WaterfallBar, WaterfallResult,
} from "./analyticsTypes";

export type Maybe<T> = T | null | undefined;

const isNum = (v: Maybe<number>): v is number => typeof v === "number" && Number.isFinite(v);

/** Rounds to a fixed number of decimals without float drift surprises. */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(value * f + Number.EPSILON * f) / f;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/* ----------------------------- rate metrics ----------------------------- */

function safeRatePct(numerator: Maybe<number>, denominator: Maybe<number>): number | null {
  if (!isNum(numerator) || !isNum(denominator)) return null;
  if (denominator <= 0) return null;
  if (numerator < 0) return null;
  return round(clamp((numerator / denominator) * 100, 0, 100), 1);
}

export interface AccuracyInput { correctPredictions: Maybe<number>; totalPredictions: Maybe<number> }

/** Share of predictions confirmed by observed link behaviour. */
export function calculateOperationalPredictionAccuracy(input: AccuracyInput): number | null {
  return safeRatePct(input.correctPredictions, input.totalPredictions);
}

export interface PreventiveActionInput { successfulActions: Maybe<number>; totalActions: Maybe<number> }

/** Share of preventive actions that avoided the predicted degradation. */
export function calculatePreventiveActionEffectiveness(input: PreventiveActionInput): number | null {
  return safeRatePct(input.successfulActions, input.totalActions);
}

export interface CustomerImpactInput { predictedImpactEvents: Maybe<number>; actualImpactEvents: Maybe<number> }

/** Share of customer-impacting events that the model predicted in advance. */
export function calculateCustomerImpactPredictionRate(input: CustomerImpactInput): number | null {
  return safeRatePct(input.predictedImpactEvents, input.actualImpactEvents);
}

export interface ServiceProtectionInput { servicesProtected: Maybe<number>; servicesAtRisk: Maybe<number> }

/** Share of at-risk customer services protected before degradation. */
export function calculateServiceProtectionEffectiveness(input: ServiceProtectionInput): number | null {
  return safeRatePct(input.servicesProtected, input.servicesAtRisk);
}

/** Mean absolute lead-time error, in minutes. */
export function calculateMeanLeadTimeError(errorsMinutes: Maybe<Maybe<number>[]>): number | null {
  if (!errorsMinutes) return null;
  const values = errorsMinutes.filter(isNum).map((v) => Math.abs(v));
  if (values.length === 0) return null;
  return round(values.reduce((a, b) => a + b, 0) / values.length, 1);
}

export interface FalsePositiveInput { falsePositives: Maybe<number>; positivePredictions: Maybe<number> }

export function calculateFalsePositiveRate(input: FalsePositiveInput): number | null {
  return safeRatePct(input.falsePositives, input.positivePredictions);
}

export interface CoverageInput { modeledLinks: Maybe<number>; eligibleLinks: Maybe<number> }

export function calculateModelCoverage(input: CoverageInput): number | null {
  return safeRatePct(input.modeledLinks, input.eligibleLinks);
}

export interface CalibrationBin { predicted: Maybe<number>; observed: Maybe<number>; weight?: Maybe<number> }

/** Weighted mean absolute gap between predicted and observed rates, percent. */
export function calculateCalibrationError(bins: Maybe<CalibrationBin[]>): number | null {
  if (!bins || bins.length === 0) return null;
  let weighted = 0;
  let totalWeight = 0;
  for (const bin of bins) {
    if (!isNum(bin.predicted) || !isNum(bin.observed)) continue;
    const weight = isNum(bin.weight) && bin.weight > 0 ? bin.weight : 1;
    weighted += Math.abs(bin.predicted - bin.observed) * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return null;
  return round((weighted / totalWeight) * 100, 1);
}

/* --------------------------- threshold tradeoff -------------------------- */

export interface ThresholdTradeoffInput {
  threshold: Maybe<number>;
  /** Total links currently evaluated by the model. */
  evaluatedLinks: number;
  /** Baseline count of links above a 0.50 threshold. */
  baselineHighRiskCount: number;
  /** Baseline services exposed across the evaluated estate. */
  baselineServicesAtRisk: number;
}

/**
 * Deterministic demonstration estimate of the precision / recall tradeoff at a
 * given confidence threshold. These are not measured model statistics.
 */
export function calculateThresholdTradeoff(input: ThresholdTradeoffInput): ThresholdTradeoffPoint | null {
  if (!isNum(input.threshold)) return null;
  const t = clamp(input.threshold, 0.05, 0.99);
  const scale = clamp((0.99 - t) / (0.99 - 0.05), 0, 1);

  const highRiskCount = Math.max(0, Math.round(input.baselineHighRiskCount * (0.15 + 1.85 * scale)));
  const precision = round(clamp(62 + 36 * (1 - scale), 0, 100), 1);
  const recall = round(clamp(38 + 58 * scale, 0, 100), 1);
  const falsePositiveRate = round(clamp(100 - precision, 0, 100), 1);
  const missedEventRate = round(clamp(100 - recall, 0, 100), 1);
  const preventiveActions = Math.round(highRiskCount * 0.72);
  const servicesProtected = Math.round(
    clamp(input.baselineServicesAtRisk * (recall / 100), 0, input.baselineServicesAtRisk),
  );

  return {
    threshold: round(t, 2),
    highRiskCount,
    precision,
    recall,
    falsePositiveRate,
    missedEventRate,
    preventiveActions,
    servicesProtected,
  };
}

/* ------------------------- feature impact waterfall ---------------------- */

export interface WaterfallInput {
  baselineScore: Maybe<number>;
  contributions: Maybe<FeatureContributionRecord[]>;
  selectedLinkId?: string | null;
  /** Optional What-If multiplier applied to positive contributions. */
  whatIfFactor?: Maybe<number>;
}

/**
 * Builds an ordered waterfall from a baseline score through each signed feature
 * contribution to a bounded final risk score in [0, 1].
 */
export function calculateFeatureImpactWaterfall(input: WaterfallInput): WaterfallResult {
  const baseline = isNum(input.baselineScore) ? clamp(input.baselineScore, 0, 1) : 0;
  const records = (input.contributions ?? []).filter((r) => r && isNum(r.contribution));
  const factor = isNum(input.whatIfFactor) ? clamp(input.whatIfFactor, 0, 3) : 1;

  const bars: WaterfallBar[] = [];
  const runningSubtotal: number[] = [];
  let cursor = baseline;

  for (const record of records) {
    const contribution = round(record.contribution > 0 ? record.contribution * factor : record.contribution, 3);
    // The cursor stays unclamped so a mid-sequence overshoot cannot silently
    // discard later negative contributions; only the drawn bar is clamped.
    const start = clamp(cursor, 0, 1);
    const raw = cursor + contribution;
    const end = clamp(raw, 0, 1);
    bars.push({
      key: record.key,
      label: record.label,
      contribution,
      rawValue: record.rawValue,
      rawUnit: record.rawUnit,
      start,
      end,
      direction: contribution >= 0 ? "Increases risk" : "Reduces risk",
    });
    cursor = raw;
    runningSubtotal.push(round(end, 3));
  }

  const finalScore = round(clamp(cursor, 0, 1), 2);
  bars.push({
    key: "final",
    label: "Final Risk Score",
    contribution: finalScore,
    rawValue: finalScore,
    rawUnit: "score",
    start: 0,
    end: finalScore,
    direction: "Increases risk",
    isTotal: true,
  });

  return {
    baseline: round(baseline, 3),
    bars,
    finalScore,
    runningSubtotal,
    interpretation:
      records.length === 0
        ? "No feature-contribution data is available for the current selection."
        : `Positive contributions increase modelled degradation risk. Negative contributions reduce modelled degradation risk. Modelled risk for ${input.selectedLinkId ?? "the selected link"} is ${finalScore.toFixed(2)}.`,
  };
}

/* ----------------------------- horizon series ---------------------------- */

export interface HorizonSeriesInput {
  points: Maybe<PredictionHorizonPoint[]>;
  /** Truncate the series at this hour, inclusive. */
  horizonHours?: Maybe<number>;
  /** Minimum acceptable confidence, percent. */
  confidenceThresholdPct?: Maybe<number>;
}

export interface HorizonSeriesResult {
  points: PredictionHorizonPoint[];
  peakRisk: number;
  peakRiskHour: number | null;
  confidentThroughHour: number | null;
  belowThresholdFromHour: number | null;
}

export function calculateHorizonRiskSeries(input: HorizonSeriesInput): HorizonSeriesResult {
  const all = (input.points ?? []).filter((p) => p && isNum(p.hour));
  const limit = isNum(input.horizonHours) ? input.horizonHours : Infinity;
  const points = all.filter((p) => p.hour <= limit).sort((a, b) => a.hour - b.hour);
  const threshold = isNum(input.confidenceThresholdPct) ? input.confidenceThresholdPct : 0;

  let peakRisk = 0;
  let peakRiskHour: number | null = null;
  let confidentThroughHour: number | null = null;
  let belowThresholdFromHour: number | null = null;

  for (const p of points) {
    if (isNum(p.highRisk) && p.highRisk > peakRisk) {
      peakRisk = p.highRisk;
      peakRiskHour = p.hour;
    }
    if (isNum(p.confidence) && p.confidence >= threshold) {
      if (belowThresholdFromHour === null) confidentThroughHour = p.hour;
    } else if (belowThresholdFromHour === null) {
      belowThresholdFromHour = p.hour;
    }
  }

  return { points, peakRisk: round(peakRisk, 2), peakRiskHour, confidentThroughHour, belowThresholdFromHour };
}

/* ------------------------------ link filters ----------------------------- */

export type HighRiskFilters = Partial<
  Pick<AnalyticsFilterState, "region" | "product" | "riskClass" | "horizonHours" | "confidenceThreshold">
> & { search?: string; minRiskScore?: number };

export function filterHighRiskLinks(
  records: Maybe<HighRiskLinkRecord[]>,
  filters: HighRiskFilters = {},
): HighRiskLinkRecord[] {
  if (!records || records.length === 0) return [];
  const search = (filters.search ?? "").trim().toLowerCase();

  return records.filter((r) => {
    if (!r) return false;
    if (filters.region && filters.region !== "All regions" && r.region !== filters.region) return false;
    if (filters.product && filters.product !== "All products" && r.product !== filters.product) return false;
    if (filters.riskClass && filters.riskClass !== "All" && r.riskClass !== filters.riskClass) return false;
    if (isNum(filters.horizonHours) && r.etaMinutes > filters.horizonHours * 60) return false;
    if (isNum(filters.minRiskScore) && r.riskScore < filters.minRiskScore) return false;
    if (isNum(filters.confidenceThreshold) && r.riskScore < filters.confidenceThreshold) return false;
    if (search) {
      const haystack = [r.linkId, r.route, r.region, r.product, r.primaryDriver, r.recommendedAction]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

/* ------------------------- contribution aggregation ---------------------- */

/**
 * Normalises signed feature contributions into positive percentage shares that
 * always sum to 100 (or an empty list when there is nothing to show).
 */
export function aggregateFeatureContributions(
  records: Maybe<FeatureContributionRecord[]>,
): PredictiveFactor[] {
  const valid = (records ?? []).filter((r) => r && isNum(r.contribution) && r.contribution !== 0);
  const total = valid.reduce((sum, r) => sum + Math.abs(r.contribution), 0);
  if (total === 0) return [];

  return valid
    .map<PredictiveFactor>((r) => {
      const pct = round((Math.abs(r.contribution) / total) * 100, 1);
      return {
        key: r.key,
        label: r.label,
        contributionPct: pct,
        ciLowPct: round(Math.max(0, pct - Math.max(0.8, pct * 0.12)), 1),
        ciHighPct: round(Math.min(100, pct + Math.max(0.8, pct * 0.12)), 1),
        signalKey: r.key,
        currentValue: `${r.rawValue} ${r.rawUnit}`.trim(),
        normalRange: r.normalRange,
        direction: r.contribution > 0 ? "Increasing" : "Decreasing",
        evidenceCount: Math.max(1, Math.round(Math.abs(r.contribution) * 40)),
        evidenceSection: r.evidenceSection,
        interpretation:
          r.contribution > 0
            ? `${r.label} is currently increasing modelled degradation risk.`
            : `${r.label} is currently reducing modelled degradation risk.`,
      };
    })
    .sort((a, b) => b.contributionPct - a.contributionPct);
}

/* ---------------------------- period comparison -------------------------- */

export interface PeriodMetric { key: string; label: string; value: Maybe<number>; positiveDirection?: "up" | "down" }

export function compareModelPeriods(
  current: Maybe<PeriodMetric[]>,
  prior: Maybe<PeriodMetric[]>,
): MetricComparison[] {
  if (!current || current.length === 0) return [];
  const priorByKey = new Map((prior ?? []).map((m) => [m.key, m]));

  return current
    .filter((m) => m && isNum(m.value))
    .map<MetricComparison>((m) => {
      const before = priorByKey.get(m.key);
      const priorValue = isNum(before?.value) ? (before!.value as number) : (m.value as number);
      const delta = round((m.value as number) - priorValue, 2);
      const direction: MetricComparison["direction"] = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
      const positiveDirection = m.positiveDirection ?? "up";
      return {
        key: m.key,
        label: m.label,
        current: round(m.value as number, 2),
        prior: round(priorValue, 2),
        delta,
        deltaLabel: `${delta > 0 ? "+" : ""}${delta}`,
        direction,
        improved: direction === "flat" ? true : direction === positiveDirection,
      };
    });
}

/* -------------------------------- status --------------------------------- */

export function metricStatus(
  value: Maybe<number>,
  target: Maybe<number>,
  positiveDirection: "up" | "down" = "up",
): "On target" | "Near target" | "Below target" {
  if (!isNum(value) || !isNum(target)) return "Below target";
  const meets = positiveDirection === "up" ? value >= target : value <= target;
  if (meets) return "On target";
  const gap = Math.abs(value - target) / Math.max(Math.abs(target), 1);
  return gap <= 0.05 ? "Near target" : "Below target";
}
