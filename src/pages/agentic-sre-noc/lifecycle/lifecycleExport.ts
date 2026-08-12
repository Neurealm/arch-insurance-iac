/**
 * AIM-005 — lifecycle export builders.
 *
 * Local demonstration exports only. These reuse the existing analytics CSV
 * helper and deliberately do not call a reporting backend.
 */

import { downloadCsv, type ExportOutcome } from "../analytics/analyticsExport";
import {
  backtestEvents,
  backtestSeriesByVersion,
  classBalance,
  dataQuality,
  explainabilityRecords,
  modelApprovals,
  releaseGates,
  trainingComposition,
  trainingCoverage,
  validationSummary,
} from "./lifecycleFixtures";
import { calculateSegmentValidationStatus, calculateValidationGateStatus } from "./lifecycleCalculations";
import type { DriftMetric, DriftStatus, ModelLifecycleActivity, ValidationSegment } from "./lifecycleTypes";
import type { ModelVersionComparison } from "./lifecycleCalculations";

export type { ExportOutcome };

export function exportTrainingSummary(): ExportOutcome {
  return downloadCsv({
    filename: "pli-training-data-summary.csv",
    headers: ["Section", "Item", "Value", "Reference"],
    rows: [
      ...trainingComposition.map((c) => ["Composition", c.label, `${c.sharePct}%`, `Prior ${c.priorSharePct}%`]),
      ...trainingCoverage.map((c) => [`Coverage — ${c.dimension}`, c.label, `${c.sharePct}%`, `Estate ${c.estateSharePct}%`]),
      ...classBalance.map((c) => ["Class balance", c.label, `Training ${c.trainingPct}%`, `Natural ${c.naturalPct}%`]),
      ...dataQuality.map((q) => ["Data quality", q.label, `${q.affectedPct}%`, q.treatment]),
    ],
  });
}

export function exportValidationResults(segments: readonly ValidationSegment[]): ExportOutcome {
  return downloadCsv({
    filename: "pli-validation-results.csv",
    headers: ["Scope", "Segment", "Samples", "Accuracy %", "False positive %", "Missed %", "Mean warning min", "Calibration %", "Status"],
    rows: [
      ...validationSummary.map((m) => ["Summary", m.label, "", m.unit === "%" ? m.value : "", "", "", m.unit === "min" ? m.value : "", "", `Target ${m.target}${m.unit}`]),
      ...segments.map((s) => [
        s.dimension, s.label, s.samples, s.accuracyPct, s.falsePositivePct, s.missedEventPct,
        s.meanWarningMinutes, s.calibrationErrorPct, calculateSegmentValidationStatus(s),
      ]),
    ],
  });
}

export function exportBacktestResults(version: string): ExportOutcome {
  const series = backtestSeriesByVersion[version];
  return downloadCsv({
    filename: `pli-backtest-${version.replace(/[^\w.]+/g, "-").toLowerCase()}.csv`,
    headers: ["Month", "Accuracy %", "Customer-impact recall %", "False positive %", "Mean warning min", "Preventive effectiveness %"],
    rows: (series?.points ?? []).map((p) => [
      p.month, p.accuracyPct, p.customerImpactRecallPct, p.falsePositivePct, p.meanWarningMinutes, p.preventiveEffectivenessPct,
    ]),
  });
}

export function exportBacktestEvents(): ExportOutcome {
  return downloadCsv({
    filename: "pli-backtest-events.csv",
    headers: ["Event", "Region", "Link", "Date", "Driver", "Score", "Predicted ETA", "Actual outcome", "Action", "Customer impact", "Classification", "Evidence"],
    rows: backtestEvents.map((e) => [
      e.event, e.region, e.linkId, e.date, e.driver, e.predictionScore, e.predictedEta,
      e.actualOutcome, e.actionTaken, e.customerImpact, e.classification, e.evidenceQuality,
    ]),
  });
}

export function exportExplainabilityResults(): ExportOutcome {
  return downloadCsv({
    filename: "pli-explainability-validation.csv",
    headers: ["Prediction", "Link", "Primary factor", "Evidence %", "Stability %", "Human agreement", "Rule override", "Latency ms"],
    rows: explainabilityRecords.map((r) => [
      r.predictionId, r.linkId, r.primaryFactor, r.evidenceCompletenessPct, r.factorStabilityPct,
      r.humanAgreement, r.ruleOverride ? "Yes" : "No", r.explanationLatencyMs,
    ]),
  });
}

export function exportDriftSummary(
  metrics: readonly (DriftMetric & { status: DriftStatus })[],
): ExportOutcome {
  return downloadCsv({
    filename: "pli-drift-summary.csv",
    headers: ["Drift type", "Score", "Threshold", "Trend", "Scope", "Status", "Owner", "Recommended response", "Last evaluated"],
    rows: metrics.map((m) => [
      m.label, m.score, m.threshold, m.trend, m.scope, m.status, m.owner, m.recommendedResponse, m.lastEvaluated,
    ]),
  });
}

export function exportGovernanceSummary(activeVersion: string, rollbackVersion: string): ExportOutcome {
  return downloadCsv({
    filename: "pli-governance-summary.csv",
    headers: ["Section", "Item", "Value", "Status"],
    rows: [
      ["Identity", "Active version", activeVersion, "Active"],
      ["Identity", "Rollback version", rollbackVersion, "Registered"],
      ...releaseGates.map((g) => ["Release gate", g.label, `${g.actualValue}${g.unit === "boolean" ? "" : g.unit} vs ${g.target}`, calculateValidationGateStatus(g)]),
      ...modelApprovals.map((a) => ["Approval", `${a.approvalType} ${a.version}`, `${a.approver} · ${a.timestamp}`, a.decision]),
    ],
  });
}

export function exportReleaseGateReport(): ExportOutcome {
  return downloadCsv({
    filename: "pli-release-gate-report.csv",
    headers: ["Gate", "Target", "Actual", "Critical", "Status", "Evidence", "Reviewer", "Review date"],
    rows: releaseGates.map((g) => [
      g.label, g.target, g.unit === "boolean" ? (g.actualValue >= 1 ? "Met" : "Not met") : `${g.actualValue}${g.unit}`,
      g.critical ? "Yes" : "No", calculateValidationGateStatus(g), g.evidence, g.reviewer, g.reviewDate,
    ]),
  });
}

export function exportVersionComparison(comparison: ModelVersionComparison): ExportOutcome {
  return downloadCsv({
    filename: "pli-model-version-comparison.csv",
    headers: ["Metric", "Unit", comparison.baseVersion, comparison.candidateVersion, "Delta", "Direction"],
    rows: comparison.rows.map((r) => [r.label, r.unit, r.baseValue, r.candidateValue, r.delta, r.improved ? "Improved" : "Regressed"]),
  });
}

export function exportModelActivity(activity: readonly ModelLifecycleActivity[]): ExportOutcome {
  return downloadCsv({
    filename: "pli-model-activity.csv",
    headers: ["Time", "Event", "Version", "Actor", "Result", "Scope", "Evidence", "Change record", "Status"],
    rows: activity.map((a) => [a.at, a.event, a.version, a.actor, a.result, a.scope, a.evidence, a.changeRecord, a.status]),
  });
}
