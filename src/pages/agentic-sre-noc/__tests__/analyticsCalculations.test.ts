/**
 * AIM-004 — pure analytics calculation tests.
 */

import { describe, expect, it } from "vitest";
import {
  aggregateFeatureContributions, calculateCalibrationError, calculateCustomerImpactPredictionRate,
  calculateFalsePositiveRate, calculateFeatureImpactWaterfall, calculateHorizonRiskSeries,
  calculateMeanLeadTimeError, calculateModelCoverage, calculateOperationalPredictionAccuracy,
  calculatePreventiveActionEffectiveness, calculateServiceProtectionEffectiveness,
  calculateThresholdTradeoff, compareModelPeriods, filterHighRiskLinks, metricStatus,
} from "../analytics/analyticsCalculations";
import {
  contributionsForLink, DEFAULT_ANALYTICS_LINK_ID, getHorizonSeries, highRiskLinkRecords,
  WATERFALL_BASELINE, THRESHOLD_BASELINE,
} from "../analytics/analyticsFixtures";
import type { FeatureContributionRecord } from "../analytics/analyticsTypes";

const chennai = contributionsForLink(DEFAULT_ANALYTICS_LINK_ID, 0.94);

describe("rate metrics", () => {
  it("calculates operational prediction accuracy", () => {
    expect(calculateOperationalPredictionAccuracy({ correctPredictions: 941, totalPredictions: 1000 })).toBe(94.1);
  });

  it("returns null for zero predictions", () => {
    expect(calculateOperationalPredictionAccuracy({ correctPredictions: 0, totalPredictions: 0 })).toBeNull();
  });

  it("caps all-correct predictions at 100", () => {
    expect(calculateOperationalPredictionAccuracy({ correctPredictions: 120, totalPredictions: 100 })).toBe(100);
  });

  it("calculates preventive action effectiveness", () => {
    expect(calculatePreventiveActionEffectiveness({ successfulActions: 466, totalActions: 500 })).toBe(93.2);
  });

  it("calculates customer impact prediction rate", () => {
    expect(calculateCustomerImpactPredictionRate({ predictedImpactEvents: 918, actualImpactEvents: 1000 })).toBe(91.8);
  });

  it("calculates service protection effectiveness", () => {
    expect(calculateServiceProtectionEffectiveness({ servicesProtected: 925, servicesAtRisk: 1000 })).toBe(92.5);
  });

  it("calculates false positive rate and handles all-false-positive input", () => {
    expect(calculateFalsePositiveRate({ falsePositives: 28, positivePredictions: 1000 })).toBe(2.8);
    expect(calculateFalsePositiveRate({ falsePositives: 50, positivePredictions: 50 })).toBe(100);
  });

  it("calculates model coverage and rejects missing values", () => {
    expect(calculateModelCoverage({ modeledLinks: 8721, eligibleLinks: 8845 })).toBe(98.6);
    expect(calculateModelCoverage({ modeledLinks: null, eligibleLinks: 100 })).toBeNull();
  });
});

describe("calculateMeanLeadTimeError", () => {
  it("averages absolute errors", () => {
    expect(calculateMeanLeadTimeError([10, -30, 44])).toBe(28);
  });
  it("skips missing values", () => {
    expect(calculateMeanLeadTimeError([10, null, undefined, 30])).toBe(20);
  });
  it("returns null for empty input", () => {
    expect(calculateMeanLeadTimeError([])).toBeNull();
    expect(calculateMeanLeadTimeError(null)).toBeNull();
  });
});

describe("calculateCalibrationError", () => {
  it("computes a weighted mean gap", () => {
    expect(calculateCalibrationError([
      { predicted: 0.9, observed: 0.88, weight: 1 },
      { predicted: 0.7, observed: 0.68, weight: 1 },
    ])).toBe(2);
  });
  it("returns null when no usable bins exist", () => {
    expect(calculateCalibrationError([])).toBeNull();
    expect(calculateCalibrationError([{ predicted: null, observed: 0.5 }])).toBeNull();
  });
});

describe("calculateThresholdTradeoff", () => {
  const base = {
    evaluatedLinks: THRESHOLD_BASELINE.evaluatedLinks,
    baselineHighRiskCount: THRESHOLD_BASELINE.baselineHighRiskCount,
    baselineServicesAtRisk: THRESHOLD_BASELINE.baselineServicesAtRisk,
  };

  it("increases precision and reduces recall as the threshold rises", () => {
    const low = calculateThresholdTradeoff({ ...base, threshold: 0.2 })!;
    const high = calculateThresholdTradeoff({ ...base, threshold: 0.9 })!;
    expect(high.precision).toBeGreaterThan(low.precision);
    expect(high.recall).toBeLessThan(low.recall);
    expect(high.highRiskCount).toBeLessThan(low.highRiskCount);
  });

  it("clamps the minimum and maximum threshold", () => {
    expect(calculateThresholdTradeoff({ ...base, threshold: 0 })!.threshold).toBe(0.05);
    expect(calculateThresholdTradeoff({ ...base, threshold: 5 })!.threshold).toBe(0.99);
  });

  it("returns null for an invalid threshold", () => {
    expect(calculateThresholdTradeoff({ ...base, threshold: null })).toBeNull();
  });
});

describe("calculateFeatureImpactWaterfall", () => {
  it("reaches the approved Chennai final score", () => {
    const result = calculateFeatureImpactWaterfall({ baselineScore: WATERFALL_BASELINE, contributions: chennai, selectedLinkId: DEFAULT_ANALYTICS_LINK_ID });
    expect(result.finalScore).toBe(0.94);
    expect(result.bars.at(-1)?.isTotal).toBe(true);
    expect(result.runningSubtotal).toHaveLength(chennai.length);
  });

  it("handles purely positive contributions", () => {
    const positives = chennai.filter((c) => c.contribution > 0);
    const result = calculateFeatureImpactWaterfall({ baselineScore: 0.1, contributions: positives });
    expect(result.finalScore).toBeGreaterThan(0.1);
  });

  it("handles purely negative contributions", () => {
    const negatives = chennai.filter((c) => c.contribution < 0);
    const result = calculateFeatureImpactWaterfall({ baselineScore: 0.5, contributions: negatives });
    expect(result.finalScore).toBeLessThan(0.5);
  });

  it("bounds the score at the lower and upper limits", () => {
    const down: FeatureContributionRecord[] = [{ ...chennai[0], contribution: -5 }];
    const up: FeatureContributionRecord[] = [{ ...chennai[0], contribution: 5 }];
    expect(calculateFeatureImpactWaterfall({ baselineScore: 0.2, contributions: down }).finalScore).toBe(0);
    expect(calculateFeatureImpactWaterfall({ baselineScore: 0.2, contributions: up }).finalScore).toBe(1);
  });

  it("returns a baseline-only result when contributions are missing", () => {
    const result = calculateFeatureImpactWaterfall({ baselineScore: 0.3, contributions: null });
    expect(result.finalScore).toBe(0.3);
    expect(result.interpretation).toMatch(/No feature-contribution data/);
  });

  it("supports a What-If comparison", () => {
    const baseResult = calculateFeatureImpactWaterfall({ baselineScore: WATERFALL_BASELINE, contributions: chennai });
    const whatIf = calculateFeatureImpactWaterfall({ baselineScore: WATERFALL_BASELINE, contributions: chennai, whatIfFactor: 0.5 });
    expect(whatIf.finalScore).toBeLessThan(baseResult.finalScore);
  });

  it("varies by selected link", () => {
    const other = contributionsForLink("CHN-MBL-044", 0.72);
    const result = calculateFeatureImpactWaterfall({ baselineScore: WATERFALL_BASELINE, contributions: other });
    expect(result.finalScore).toBeCloseTo(0.72, 1);
  });
});

describe("calculateHorizonRiskSeries", () => {
  const points = getHorizonSeries("current").points;

  it("finds the peak risk hour", () => {
    const result = calculateHorizonRiskSeries({ points, confidenceThresholdPct: 85 });
    expect(result.peakRisk).toBe(0.94);
    expect(result.peakRiskHour).toBe(6);
  });

  it("truncates at the requested horizon", () => {
    expect(calculateHorizonRiskSeries({ points, horizonHours: 4 }).points).toHaveLength(3);
  });

  it("reports where confidence falls below the threshold", () => {
    const result = calculateHorizonRiskSeries({ points, confidenceThresholdPct: 90 });
    expect(result.confidentThroughHour).toBe(6);
    expect(result.belowThresholdFromHour).toBe(8);
  });

  it("returns an empty result for missing input", () => {
    expect(calculateHorizonRiskSeries({ points: null }).points).toHaveLength(0);
  });
});

describe("filterHighRiskLinks", () => {
  it("returns every record with no filters", () => {
    expect(filterHighRiskLinks(highRiskLinkRecords)).toHaveLength(highRiskLinkRecords.length);
  });

  it("filters by region, product and risk class", () => {
    expect(filterHighRiskLinks(highRiskLinkRecords, { region: "Africa East" })).toHaveLength(1);
    expect(filterHighRiskLinks(highRiskLinkRecords, { product: "Metro Backhaul", riskClass: "High" })).toHaveLength(3);
  });

  it("filters by horizon and search", () => {
    expect(filterHighRiskLinks(highRiskLinkRecords, { horizonHours: 6 }).every((r) => r.etaMinutes <= 360)).toBe(true);
    expect(filterHighRiskLinks(highRiskLinkRecords, { search: "nairobi" })).toHaveLength(1);
  });

  it("handles empty input", () => {
    expect(filterHighRiskLinks([], { search: "x" })).toHaveLength(0);
    expect(filterHighRiskLinks(null)).toHaveLength(0);
  });
});

describe("aggregateFeatureContributions", () => {
  it("normalises contributions to shares that sum to about 100", () => {
    const factors = aggregateFeatureContributions(chennai);
    const total = factors.reduce((s, f) => s + f.contributionPct, 0);
    expect(Math.round(total)).toBe(100);
    expect(factors[0].contributionPct).toBeGreaterThanOrEqual(factors[1].contributionPct);
  });

  it("returns an empty list when nothing contributes", () => {
    expect(aggregateFeatureContributions([])).toHaveLength(0);
    expect(aggregateFeatureContributions([{ ...chennai[0], contribution: 0 }])).toHaveLength(0);
  });
});

describe("compareModelPeriods", () => {
  it("marks improvement using the metric direction", () => {
    const result = compareModelPeriods(
      [{ key: "fp", label: "False Positive Rate", value: 2.8, positiveDirection: "down" }],
      [{ key: "fp", label: "False Positive Rate", value: 3.4, positiveDirection: "down" }],
    );
    expect(result[0].delta).toBe(-0.6);
    expect(result[0].improved).toBe(true);
  });

  it("falls back to the current value when no prior period exists", () => {
    const result = compareModelPeriods([{ key: "a", label: "A", value: 10 }], null);
    expect(result[0].delta).toBe(0);
    expect(result[0].direction).toBe("flat");
  });

  it("returns an empty list for empty input", () => {
    expect(compareModelPeriods([], [])).toHaveLength(0);
  });
});

describe("metricStatus", () => {
  it("classifies against target and direction", () => {
    expect(metricStatus(94.1, 93, "up")).toBe("On target");
    expect(metricStatus(2.8, 3, "down")).toBe("On target");
    expect(metricStatus(91, 93, "up")).toBe("Near target");
    expect(metricStatus(50, 93, "up")).toBe("Below target");
  });
});
