/**
 * AIM-005 — pure, deterministic model-lifecycle calculations.
 *
 * Every function takes explicit typed inputs, returns explicit typed output,
 * holds no component state, tolerates empty and missing values and is directly
 * unit tested in `__tests__/lifecycleCalculations.test.ts`.
 */

import type {
  BacktestPoint,
  BacktestSummary,
  ClassBalanceRecord,
  DataQualityRecord,
  DriftMetric,
  DriftStatus,
  ExplainabilityQuality,
  ExplainabilityValidationRecord,
  GateStatus,
  GovernanceReadiness,
  ModelPromotionDecision,
  ModelReleaseGate,
  ModelRollbackDecision,
  ModelVersion,
  RetrainingLevel,
  RetrainingRecommendation,
  TrainingCoverageRecord,
  ValidationSegment,
} from "./lifecycleTypes";

/* -------------------------------- helpers -------------------------------- */

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function clampPct(value: number): number {
  if (!isFiniteNumber(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function round(value: number, digits = 1): number {
  if (!isFiniteNumber(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/* --------------------------- 1. dataset quality --------------------------- */

/**
 * Weighted quality score. Excluded and imputed rows are recoverable and cost
 * less than flagged or low-confidence data retained in the training set.
 */
const treatmentWeight: Record<string, number> = {
  Excluded: 0.4,
  Imputed: 0.6,
  "Down-weighted": 0.8,
  "Retained with quality feature": 1.0,
  Flagged: 1.2,
};

export function calculateDatasetQualityScore(records: readonly DataQualityRecord[]): number {
  if (!records || records.length === 0) return 100;
  const penalty = records.reduce((total, record) => {
    const affected = isFiniteNumber(record?.affectedPct) ? Math.max(0, record.affectedPct) : 0;
    const weight = treatmentWeight[record?.treatment ?? ""] ?? 1;
    return total + affected * weight;
  }, 0);
  return round(clampPct(100 - penalty), 1);
}

/* --------------------------- 2. coverage score ---------------------------- */

export interface CoverageScoreResult {
  scorePct: number;
  worstGap: { label: string; deltaPct: number } | null;
  underrepresented: string[];
}

/**
 * Compares training representation against the live operating estate. A
 * perfectly representative dataset scores 100.
 */
export function calculateCoverageScore(records: readonly TrainingCoverageRecord[]): CoverageScoreResult {
  if (!records || records.length === 0) {
    return { scorePct: 0, worstGap: null, underrepresented: [] };
  }
  let totalAbsDelta = 0;
  let worst: { label: string; deltaPct: number } | null = null;
  const underrepresented: string[] = [];

  for (const record of records) {
    const share = isFiniteNumber(record?.sharePct) ? record.sharePct : 0;
    const estate = isFiniteNumber(record?.estateSharePct) ? record.estateSharePct : share;
    const delta = share - estate;
    totalAbsDelta += Math.abs(delta);
    if (!worst || Math.abs(delta) > Math.abs(worst.deltaPct)) {
      worst = { label: record?.label ?? record?.key ?? "Unknown", deltaPct: round(delta, 1) };
    }
    if (delta <= -3) underrepresented.push(record?.label ?? record?.key ?? "Unknown");
  }

  const meanAbsDelta = totalAbsDelta / records.length;
  return {
    scorePct: round(clampPct(100 - meanAbsDelta * 5), 1),
    worstGap: worst,
    underrepresented,
  };
}

/* ------------------------- 3. class balance score ------------------------- */

export interface ClassBalanceResult {
  scorePct: number;
  rareEventAmplification: number;
  imbalanceRatio: number;
  handled: boolean;
}

/**
 * Rare classes must be amplified enough to be learnable but not so far that
 * production frequency is overstated. The ideal amplification band is 1.5x-6x.
 */
export function calculateClassBalanceScore(records: readonly ClassBalanceRecord[]): ClassBalanceResult {
  if (!records || records.length === 0) {
    return { scorePct: 0, rareEventAmplification: 0, imbalanceRatio: 0, handled: false };
  }
  const natural = records.map((r) => (isFiniteNumber(r?.naturalPct) ? Math.max(0, r.naturalPct) : 0));
  const training = records.map((r) => (isFiniteNumber(r?.trainingPct) ? Math.max(0, r.trainingPct) : 0));

  const maxNatural = Math.max(...natural, 0);
  const minNatural = Math.min(...natural.filter((n) => n > 0), maxNatural || 1);
  const imbalanceRatio = minNatural > 0 ? round(maxNatural / minNatural, 1) : 0;

  const rareIndex = natural.indexOf(Math.min(...natural.filter((n) => n > 0), maxNatural || 0));
  const rareNatural = natural[rareIndex] ?? 0;
  const rareTraining = training[rareIndex] ?? 0;
  const amplification = rareNatural > 0 ? round(rareTraining / rareNatural, 2) : 0;

  const inBand = amplification >= 1.5 && amplification <= 6;
  const distance = inBand ? 0 : amplification < 1.5 ? 1.5 - amplification : amplification - 6;
  const scorePct = round(clampPct(100 - distance * 18), 1);

  return { scorePct, rareEventAmplification: amplification, imbalanceRatio, handled: inBand };
}

/* ------------------------ 4. validation gate status ----------------------- */

export function calculateValidationGateStatus(gate: ModelReleaseGate | null | undefined): GateStatus {
  if (!gate) return "Insufficient Evidence";
  if (!isFiniteNumber(gate.actualValue) || !isFiniteNumber(gate.targetValue)) return "Insufficient Evidence";

  if (gate.unit === "boolean") {
    return gate.actualValue >= 1 ? "Pass" : gate.critical ? "Fail" : "Review";
  }

  const margin = gate.higherIsBetter
    ? gate.actualValue - gate.targetValue
    : gate.targetValue - gate.actualValue;
  const tolerance = Math.max(Math.abs(gate.targetValue) * 0.02, 0.2);

  if (margin >= tolerance) return "Pass";
  if (margin >= 0) return "Conditional Pass";
  if (margin >= -tolerance) return "Review";
  return "Fail";
}

/* --------------------- 5. segment validation status ----------------------- */

export function calculateSegmentValidationStatus(
  segment: ValidationSegment | null | undefined,
): GateStatus {
  if (!segment) return "Insufficient Evidence";
  const samples = isFiniteNumber(segment.samples) ? segment.samples : 0;
  if (samples < 2000) return "Insufficient Evidence";
  if (!isFiniteNumber(segment.accuracyPct) || !isFiniteNumber(segment.falsePositivePct)) {
    return "Insufficient Evidence";
  }

  const accuracy = segment.accuracyPct;
  const falsePositive = segment.falsePositivePct;
  const warningHours = (isFiniteNumber(segment.meanWarningMinutes) ? segment.meanWarningMinutes : 0) / 60;

  if (accuracy < 88 || falsePositive > 6) return "Fail";
  if (accuracy < 92 || falsePositive > 4 || warningHours < 4) return "Review";
  if (accuracy < 94 || falsePositive > 3 || warningHours < 5) return "Conditional Pass";
  return "Pass";
}

/* ----------------------------- 6. drift score ----------------------------- */

/**
 * Total variation distance between the training and current distributions,
 * expressed on a 0-1 scale. Buckets missing from either side count as zero.
 */
export function calculateDriftScore(
  training: readonly { bucket: string; sharePct: number }[],
  current: readonly { bucket: string; sharePct: number }[],
): number {
  if (!training?.length || !current?.length) return 0;
  const buckets = new Set<string>([...training.map((b) => b.bucket), ...current.map((b) => b.bucket)]);
  const share = (rows: readonly { bucket: string; sharePct: number }[], bucket: string) => {
    const row = rows.find((r) => r.bucket === bucket);
    return row && isFiniteNumber(row.sharePct) ? Math.max(0, row.sharePct) : 0;
  };
  let total = 0;
  buckets.forEach((bucket) => {
    total += Math.abs(share(training, bucket) - share(current, bucket));
  });
  return round(Math.min(1, total / 200), 3);
}

/* -------------------------- 7. drift classification ----------------------- */

export function classifyDriftStatus(
  metric: Pick<DriftMetric, "score" | "threshold" | "blocking" | "evidenceComplete"> | null | undefined,
): DriftStatus {
  if (!metric) return "Insufficient Evidence";
  if (metric.evidenceComplete === false) return "Insufficient Evidence";
  if (!isFiniteNumber(metric.score) || !isFiniteNumber(metric.threshold) || metric.threshold <= 0) {
    return "Insufficient Evidence";
  }
  const ratio = metric.score / metric.threshold;
  if (ratio >= 1.5 && metric.blocking) return "Blocking";
  if (ratio > 1) return "Action Required";
  if (ratio >= 0.9) return "Watch";
  return "Stable";
}

/* ---------------------- 8. retraining recommendation ---------------------- */

export interface RetrainingInput {
  driftStatuses: readonly DriftStatus[];
  accuracyDeltaPct: number;
  newSamplesSinceTraining: number;
  newRegionAdded: boolean;
  newProductCohort: boolean;
  weatherPatternChange: boolean;
  dataQualityDeltaPct: number;
  recentFalsePositivePct: number;
  recentMissedEvents: number;
  daysSinceScheduledReview: number;
}

export function calculateRetrainingRecommendation(
  input: RetrainingInput | null | undefined,
): RetrainingRecommendation {
  if (!input) {
    return {
      level: "Monitor",
      reasons: ["No lifecycle telemetry available."],
      score: 0,
      recommendedBy: "Lifecycle policy engine",
      targetWindow: "Not scheduled",
    };
  }

  const reasons: string[] = [];
  let score = 0;
  const statuses = input.driftStatuses ?? [];

  if (statuses.includes("Blocking")) { score += 5; reasons.push("Blocking drift detected."); }
  const actionCount = statuses.filter((s) => s === "Action Required").length;
  if (actionCount > 0) { score += 2 * actionCount; reasons.push(`${actionCount} drift metric${actionCount > 1 ? "s" : ""} above threshold.`); }
  const watchCount = statuses.filter((s) => s === "Watch").length;
  if (watchCount > 0) { score += watchCount; reasons.push(`${watchCount} drift metric${watchCount > 1 ? "s" : ""} in watch.`); }

  const accuracyDelta = isFiniteNumber(input.accuracyDeltaPct) ? input.accuracyDeltaPct : 0;
  if (accuracyDelta <= -2) { score += 3; reasons.push(`Accuracy down ${Math.abs(round(accuracyDelta, 1))} points since promotion.`); }
  else if (accuracyDelta <= -0.75) { score += 1; reasons.push("Accuracy softening against the promotion baseline."); }

  const newSamples = isFiniteNumber(input.newSamplesSinceTraining) ? input.newSamplesSinceTraining : 0;
  if (newSamples >= 250_000) { score += 2; reasons.push("Substantial new labelled data available."); }
  else if (newSamples >= 100_000) { score += 1; reasons.push("New labelled data available."); }

  if (input.newRegionAdded) { score += 2; reasons.push("New region entered the operating estate."); }
  if (input.newProductCohort) { score += 2; reasons.push("New product cohort is under-represented in training."); }
  if (input.weatherPatternChange) { score += 2; reasons.push("Weather pattern differs from the training population."); }

  const qualityDelta = isFiniteNumber(input.dataQualityDeltaPct) ? input.dataQualityDeltaPct : 0;
  if (qualityDelta <= -2) { score += 1; reasons.push("Input data quality has degraded."); }

  if (isFiniteNumber(input.recentFalsePositivePct) && input.recentFalsePositivePct > 4) {
    score += 2; reasons.push("Recent false-positive rate above the release gate.");
  }
  if (isFiniteNumber(input.recentMissedEvents) && input.recentMissedEvents >= 3) {
    score += 3; reasons.push("Repeated missed customer-impacting events.");
  }
  if (isFiniteNumber(input.daysSinceScheduledReview) && input.daysSinceScheduledReview > 90) {
    score += 1; reasons.push("Scheduled governance retraining window reached.");
  }

  let level: RetrainingLevel;
  if (score >= 7) level = "Retraining Required";
  else if (score >= 4) level = "Retraining Recommended";
  else if (score >= 1) level = "Monitor";
  else level = "No Action";

  if (reasons.length === 0) reasons.push("All lifecycle indicators inside policy thresholds.");

  const targetWindow =
    level === "Retraining Required" ? "Within 7 days"
      : level === "Retraining Recommended" ? "Within 30 days"
        : level === "Monitor" ? "Next scheduled review"
          : "Not scheduled";

  return { level, reasons, score, recommendedBy: "Lifecycle policy engine", targetWindow };
}

/* ------------------------ 9. promotion eligibility ------------------------ */

export interface PromotionInput {
  candidate: ModelVersion | null | undefined;
  gates: readonly ModelReleaseGate[];
  driftStatuses: readonly DriftStatus[];
  securityReviewPassed: boolean;
  explainabilityComplete: boolean;
  rollbackAvailable: boolean;
  approvals: readonly { role: string; granted: boolean }[];
  evidenceComplete: boolean;
}

export function evaluatePromotionEligibility(
  input: PromotionInput | null | undefined,
): ModelPromotionDecision {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input || !input.candidate) {
    return {
      eligible: false,
      blockers: ["No candidate model version is available for promotion."],
      warnings: [],
      requiredApprovers: [],
      steps: [],
    };
  }

  const gates = input.gates ?? [];
  const gateStatuses = gates.map((gate) => ({ gate, status: calculateValidationGateStatus(gate) }));
  const failedCritical = gateStatuses.filter((g) => g.gate.critical && (g.status === "Fail" || g.status === "Insufficient Evidence"));
  const softFailures = gateStatuses.filter((g) => !g.gate.critical && g.status === "Fail");
  const conditional = gateStatuses.filter((g) => g.status === "Conditional Pass" || g.status === "Review");

  if (gates.length === 0) blockers.push("No release gates were evaluated for the candidate.");
  failedCritical.forEach((g) => blockers.push(`Critical release gate failed: ${g.gate.label}.`));
  softFailures.forEach((g) => warnings.push(`Non-critical gate failed: ${g.gate.label}.`));
  conditional.forEach((g) => warnings.push(`Gate requires review: ${g.gate.label}.`));

  const statuses = input.driftStatuses ?? [];
  if (statuses.includes("Blocking")) blockers.push("Blocking drift must be resolved before promotion.");
  if (statuses.includes("Action Required")) warnings.push("Drift above threshold requires a documented decision.");

  if (!input.securityReviewPassed) blockers.push("Security review has not passed.");
  if (!input.explainabilityComplete) blockers.push("Explainability evidence is incomplete.");
  if (!input.rollbackAvailable) blockers.push("No rollback version is available.");
  if (!input.evidenceComplete) blockers.push("Required promotion evidence is incomplete.");

  const approvals = input.approvals ?? [];
  const missing = approvals.filter((a) => !a.granted).map((a) => a.role);
  missing.forEach((role) => blockers.push(`Required approval missing: ${role}.`));

  const steps = [
    { key: "gates", label: "Check release gates", passed: failedCritical.length === 0 && gates.length > 0, detail: `${gateStatuses.filter((g) => g.status === "Pass").length} of ${gates.length} gates pass` },
    { key: "drift", label: "Review drift", passed: !statuses.includes("Blocking"), detail: statuses.includes("Blocking") ? "Blocking drift present" : "No blocking drift" },
    { key: "explainability", label: "Review explainability", passed: Boolean(input.explainabilityComplete), detail: input.explainabilityComplete ? "Evidence complete" : "Evidence incomplete" },
    { key: "security", label: "Review security", passed: Boolean(input.securityReviewPassed), detail: input.securityReviewPassed ? "Review passed" : "Review outstanding" },
    { key: "operational", label: "Review operational impact", passed: softFailures.length === 0, detail: softFailures.length === 0 ? "No operational gate failures" : `${softFailures.length} operational concern(s)` },
    { key: "rollback", label: "Confirm rollback version", passed: Boolean(input.rollbackAvailable), detail: input.rollbackAvailable ? "Rollback artifact available" : "Rollback unavailable" },
    { key: "approvers", label: "Identify required approvers", passed: missing.length === 0, detail: missing.length === 0 ? "All approvals recorded" : `${missing.length} approval(s) outstanding` },
    { key: "evidence", label: "Record approval evidence", passed: Boolean(input.evidenceComplete), detail: input.evidenceComplete ? "Evidence bundle complete" : "Evidence bundle incomplete" },
  ];

  return {
    eligible: blockers.length === 0,
    blockers,
    warnings,
    requiredApprovers: approvals.map((a) => a.role),
    steps,
  };
}

/* ------------------------ 10. rollback readiness -------------------------- */

export interface RollbackInput {
  activeVersion: string;
  rollbackVersion: string | null;
  artifactAvailable: boolean;
  configurationAvailable: boolean;
  featureCompatible: boolean;
  dataCompatible: boolean;
  lastRollbackTest: string | null;
  estimatedMinutes: number;
  requiredApprover: string;
}

export function evaluateRollbackReadiness(
  input: RollbackInput | null | undefined,
): ModelRollbackDecision {
  if (!input) {
    return {
      ready: false,
      blockers: ["No rollback context available."],
      activeVersion: "Unknown",
      rollbackVersion: "Unknown",
      estimatedMinutes: 0,
      validationPlan: [],
      requiredApprover: "Unassigned",
    };
  }

  const blockers: string[] = [];
  if (!input.rollbackVersion) blockers.push("No rollback version is registered.");
  if (!input.artifactAvailable) blockers.push("Model artifact for the rollback version is unavailable.");
  if (!input.configurationAvailable) blockers.push("Runtime configuration for the rollback version is unavailable.");
  if (!input.featureCompatible) blockers.push("Feature set is incompatible with the rollback version.");
  if (!input.dataCompatible) blockers.push("Training-data lineage is incompatible with the rollback version.");
  if (!input.lastRollbackTest) blockers.push("No recorded rollback test.");
  if (input.rollbackVersion && input.rollbackVersion === input.activeVersion) {
    blockers.push("Rollback version matches the active version.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
    activeVersion: input.activeVersion || "Unknown",
    rollbackVersion: input.rollbackVersion ?? "Unavailable",
    estimatedMinutes: isFiniteNumber(input.estimatedMinutes) ? input.estimatedMinutes : 0,
    validationPlan: [
      "Confirm active version reported by the runtime",
      "Re-run holdout validation against the restored version",
      "Verify prediction volume and calibration for one horizon",
      "Confirm customer-impact alerting continuity",
      "Record the rollback in the model activity log",
    ],
    requiredApprover: input.requiredApprover || "Unassigned",
  };
}

/* ---------------------- 11. explainability quality ------------------------ */

export function calculateExplainabilityQuality(
  records: readonly ExplainabilityValidationRecord[],
  similarEventSupportPct = 0,
): ExplainabilityQuality {
  if (!records || records.length === 0) {
    return {
      completeEvidencePct: 0,
      stableFactorRankingPct: 0,
      similarEventSupportPct: clampPct(similarEventSupportPct),
      humanAgreementPct: 0,
      fastExplanationPct: 0,
      ruleOverridePct: 0,
      status: "Insufficient Evidence",
    };
  }

  const total = records.length;
  const complete = records.filter((r) => (isFiniteNumber(r.evidenceCompletenessPct) ? r.evidenceCompletenessPct : 0) >= 95).length;
  const stable = records.filter((r) => (isFiniteNumber(r.factorStabilityPct) ? r.factorStabilityPct : 0) >= 90).length;
  const agree = records.filter((r) => r.humanAgreement === "Agree").length;
  const fast = records.filter((r) => (isFiniteNumber(r.explanationLatencyMs) ? r.explanationLatencyMs : Number.MAX_SAFE_INTEGER) <= 2000).length;
  const overrides = records.filter((r) => r.ruleOverride).length;

  const completeEvidencePct = round((complete / total) * 100, 1);
  const stableFactorRankingPct = round((stable / total) * 100, 1);
  const humanAgreementPct = round((agree / total) * 100, 1);
  const fastExplanationPct = round((fast / total) * 100, 1);
  const ruleOverridePct = round((overrides / total) * 100, 1);

  let status: GateStatus;
  if (completeEvidencePct >= 95 && stableFactorRankingPct >= 90 && humanAgreementPct >= 90) status = "Pass";
  else if (completeEvidencePct >= 90 && stableFactorRankingPct >= 85 && humanAgreementPct >= 85) status = "Conditional Pass";
  else if (completeEvidencePct >= 80) status = "Review";
  else status = "Fail";

  return {
    completeEvidencePct,
    stableFactorRankingPct,
    similarEventSupportPct: clampPct(similarEventSupportPct),
    humanAgreementPct,
    fastExplanationPct,
    ruleOverridePct,
    status,
  };
}

/* ------------------------ 12. model version compare ----------------------- */

export interface ModelVersionComparisonRow {
  key: string;
  label: string;
  unit: string;
  baseValue: number;
  candidateValue: number;
  delta: number;
  improved: boolean;
}

export interface ModelVersionComparison {
  baseVersion: string;
  candidateVersion: string;
  rows: ModelVersionComparisonRow[];
  improvedCount: number;
  regressedCount: number;
  verdict: "Candidate stronger" | "Candidate weaker" | "Mixed" | "Insufficient Evidence";
}

export function compareModelVersions(
  base: ModelVersion | null | undefined,
  candidate: ModelVersion | null | undefined,
): ModelVersionComparison {
  if (!base || !candidate) {
    return {
      baseVersion: base?.version ?? "Unknown",
      candidateVersion: candidate?.version ?? "Unknown",
      rows: [],
      improvedCount: 0,
      regressedCount: 0,
      verdict: "Insufficient Evidence",
    };
  }

  const definitions: { key: string; label: string; unit: string; pick: (v: ModelVersion) => number; higherIsBetter: boolean }[] = [
    { key: "accuracy", label: "Accuracy", unit: "%", pick: (v) => v.accuracyPct, higherIsBetter: true },
    { key: "warning", label: "Mean warning time", unit: "min", pick: (v) => v.meanWarningMinutes, higherIsBetter: true },
    { key: "false-positive", label: "False positives", unit: "%", pick: (v) => v.falsePositivePct, higherIsBetter: false },
    { key: "missed", label: "Missed events", unit: "%", pick: (v) => v.missedEventPct, higherIsBetter: false },
    { key: "coverage", label: "Coverage", unit: "%", pick: (v) => v.coveragePct, higherIsBetter: true },
    { key: "calibration", label: "Calibration error", unit: "%", pick: (v) => v.calibrationErrorPct, higherIsBetter: false },
    { key: "cost", label: "Inference cost per 1k", unit: "USD", pick: (v) => v.inferenceCostPer1k, higherIsBetter: false },
    { key: "latency", label: "Runtime latency", unit: "ms", pick: (v) => v.runtimeLatencyMs, higherIsBetter: false },
  ];

  const rows = definitions.map((definition) => {
    const baseValue = isFiniteNumber(definition.pick(base)) ? definition.pick(base) : 0;
    const candidateValue = isFiniteNumber(definition.pick(candidate)) ? definition.pick(candidate) : 0;
    const delta = round(candidateValue - baseValue, 2);
    const improved = definition.higherIsBetter ? delta > 0 : delta < 0;
    return { key: definition.key, label: definition.label, unit: definition.unit, baseValue, candidateValue, delta, improved };
  });

  const improvedCount = rows.filter((r) => r.improved && r.delta !== 0).length;
  const regressedCount = rows.filter((r) => !r.improved && r.delta !== 0).length;
  const verdict: ModelVersionComparison["verdict"] =
    improvedCount === 0 && regressedCount === 0 ? "Mixed"
      : improvedCount >= regressedCount * 2 ? "Candidate stronger"
        : regressedCount >= improvedCount * 2 ? "Candidate weaker"
          : "Mixed";

  return { baseVersion: base.version, candidateVersion: candidate.version, rows, improvedCount, regressedCount, verdict };
}

/* -------------------------- 13. backtest summary -------------------------- */

export function calculateBacktestSummary(points: readonly BacktestPoint[]): BacktestSummary {
  if (!points || points.length === 0) {
    return {
      months: 0,
      meanAccuracyPct: 0,
      meanFalsePositivePct: 0,
      meanWarningMinutes: 0,
      bestMonth: "",
      worstMonth: "",
      trend: "flat",
    };
  }

  const safe = (value: number) => (isFiniteNumber(value) ? value : 0);
  const months = points.length;
  const meanAccuracyPct = round(points.reduce((t, p) => t + safe(p.accuracyPct), 0) / months, 2);
  const meanFalsePositivePct = round(points.reduce((t, p) => t + safe(p.falsePositivePct), 0) / months, 2);
  const meanWarningMinutes = Math.round(points.reduce((t, p) => t + safe(p.meanWarningMinutes), 0) / months);

  const sorted = [...points].sort((a, b) => safe(b.accuracyPct) - safe(a.accuracyPct));
  const first = safe(points[0].accuracyPct);
  const last = safe(points[months - 1].accuracyPct);
  const change = last - first;

  return {
    months,
    meanAccuracyPct,
    meanFalsePositivePct,
    meanWarningMinutes,
    bestMonth: sorted[0]?.month ?? "",
    worstMonth: sorted[sorted.length - 1]?.month ?? "",
    trend: change > 0.3 ? "improving" : change < -0.3 ? "declining" : "flat",
  };
}

/* ------------------------ 14. governance readiness ------------------------ */

export function calculateGovernanceReadiness(
  gates: readonly ModelReleaseGate[],
): GovernanceReadiness {
  if (!gates || gates.length === 0) {
    return { scorePct: 0, status: "Insufficient Evidence", passedGates: 0, totalGates: 0, failedCriticalGates: [] };
  }

  const evaluated = gates.map((gate) => ({ gate, status: calculateValidationGateStatus(gate) }));
  const weights: Record<GateStatus, number> = {
    Pass: 1,
    "Conditional Pass": 0.75,
    Review: 0.4,
    Fail: 0,
    "Insufficient Evidence": 0,
  };
  const scorePct = round(
    (evaluated.reduce((total, entry) => total + weights[entry.status], 0) / evaluated.length) * 100,
    1,
  );
  const passedGates = evaluated.filter((e) => e.status === "Pass").length;
  const failedCriticalGates = evaluated
    .filter((e) => e.gate.critical && (e.status === "Fail" || e.status === "Insufficient Evidence"))
    .map((e) => e.gate.label);

  let status: GateStatus;
  if (failedCriticalGates.length > 0) status = "Fail";
  else if (scorePct >= 95) status = "Pass";
  else if (scorePct >= 85) status = "Conditional Pass";
  else status = "Review";

  return { scorePct, status, passedGates, totalGates: evaluated.length, failedCriticalGates };
}
