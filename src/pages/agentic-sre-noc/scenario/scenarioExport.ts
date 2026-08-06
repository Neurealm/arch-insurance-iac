/**
 * AIM-006 — local export builders.
 *
 * Page-local downloads only. This is not a production reporting service.
 */

import { downloadCsv, type ExportOutcome } from "../analytics/analyticsExport";
import { comparisonMetrics, comparisonStages, currentPrediction, limitations, similarEvents } from "./scenarioFixtures";
import type { EvidenceItem, LearningUpdate, ScenarioOutcome, ScenarioTimelineEvent } from "./scenarioTypes";

export type { ExportOutcome };

const SYNTHETIC = "Synthetic demonstration values";

export function exportEvidenceIndex(items: readonly EvidenceItem[]): ExportOutcome {
  return downloadCsv({
    filename: "aim006-evidence-index.csv",
    headers: ["Evidence ID", "Category", "Source", "Observation", "Value", "Unit", "Timestamp", "Freshness", "Reliability", "Relevance", "Stance", "Interpretation", "Provenance", "Related feature", "Related hypothesis"],
    rows: items.map((i) => [i.id, i.category, i.source, i.observation, i.value, i.unit, i.timestamp, i.freshness, i.reliability, i.relevance, i.stance, i.interpretation, i.provenance, i.relatedFeature, i.relatedHypothesis]),
  });
}

export function exportSimilarEvents(ids: readonly string[] = []): ExportOutcome {
  const rows = (ids.length ? similarEvents.filter((e) => ids.includes(e.id)) : similarEvents).map((e) => [
    e.id, e.region, e.product, e.linkDistanceKm, e.primaryDriver, e.environmentalSignature, e.opticalSignature,
    e.similarity, e.predictionScore, e.actualOutcome, e.customerImpact, e.actionTaken, e.recoveryResult,
    e.predictionAccuracy, e.evidenceQuality, e.operationalLesson,
  ]);
  return downloadCsv({
    filename: "aim006-similar-events.csv",
    headers: ["Event ID", "Region", "Product", "Link distance km", "Primary driver", "Environmental signature", "Optical signature", "Similarity", "Prediction score", "Actual outcome", "Customer impact", "Action taken", "Recovery result", "Prediction accuracy", "Evidence quality", "Operational lesson"],
    rows,
  });
}

export function exportScenarioTimeline(events: readonly ScenarioTimelineEvent[]): ExportOutcome {
  return downloadCsv({
    filename: "aim006-scenario-timeline.csv",
    headers: ["Timestamp", "Stage", "Event", "Actor", "Object", "Input", "Output", "Evidence", "Policy state", "Customer state", "Status"],
    rows: events.map((e) => [e.timestamp, e.stage, e.event, e.actor, e.object, e.input, e.output, e.evidence, e.policyState, e.customerState, e.status]),
  });
}

export function exportScenarioOutcome(outcome: ScenarioOutcome): ExportOutcome {
  return downloadCsv({
    filename: "aim006-scenario-outcome.csv",
    headers: ["Measure", "Value", "Label"],
    rows: [
      ["Prediction result", outcome.predictionResult, SYNTHETIC],
      ["Customer outcome", outcome.customerOutcome, SYNTHETIC],
      ["Capacity protected Gbps", outcome.capacityProtectedGbps, SYNTHETIC],
      ["Outage minutes avoided", outcome.outageMinutesAvoided, SYNTHETIC],
      ["SLO impact", outcome.sloImpact, SYNTHETIC],
      ["Error budget preserved %", outcome.errorBudgetPreservedPct, SYNTHETIC],
      ["Preventive action result", outcome.preventiveActionResult, SYNTHETIC],
      ["Validation result", outcome.validationResult, SYNTHETIC],
      ["Rollback result", outcome.rollbackResult, SYNTHETIC],
      ["Evidence completeness %", outcome.evidenceCompletenessPct, SYNTHETIC],
      ["Learning recorded", outcome.learningRecorded ? "Yes" : "No", SYNTHETIC],
      ["Next recommended improvement", outcome.nextRecommendedImprovement, SYNTHETIC],
    ],
  });
}

export function exportTraditionalComparison(): ExportOutcome {
  return downloadCsv({
    filename: "aim006-traditional-comparison.csv",
    headers: ["Stage", "Traditional monitoring", "Agentic predictive protection", "Systems involved", "Engineering owner", "Operational risk", "Customer effect", "Evidence created", "Modernization requirement"],
    rows: [
      ...comparisonStages.map((s) => [s.stage, s.traditional, s.agentic, s.systemsInvolved, s.engineeringOwner, s.operationalRisk, s.customerEffect, s.evidenceCreated, s.modernizationRequirement]),
      ...comparisonMetrics.map((m) => [m.label, m.traditional, m.agentic, SYNTHETIC, "", "", "", "", ""]),
    ],
  });
}

export function exportGovernanceDecision(approvalReason: string, policyBasis: readonly string[]): ExportOutcome {
  return downloadCsv({
    filename: "aim006-governance-decision.csv",
    headers: ["Field", "Value"],
    rows: [
      ["Link", currentPrediction.linkId],
      ["Recommended action", currentPrediction.recommendedAction],
      ["Approval requirement", currentPrediction.approvalRequirement],
      ["Decision reason", approvalReason],
      ...policyBasis.map((p) => ["Policy basis", p] as [string, string]),
      ["Label", SYNTHETIC],
    ],
  });
}

export function exportExplainReport(items: readonly EvidenceItem[]): ExportOutcome {
  return downloadCsv({
    filename: "aim006-explain-model-report.csv",
    headers: ["Section", "Field", "Value"],
    rows: [
      ["Prediction", "Link", currentPrediction.linkId],
      ["Prediction", "Risk score", currentPrediction.riskScore],
      ["Prediction", "Risk class", currentPrediction.riskClass],
      ["Prediction", "Confidence %", currentPrediction.confidencePct],
      ["Prediction", "ETA", currentPrediction.eta],
      ["Prediction", "Capacity exposed Gbps", currentPrediction.capacityExposedGbps],
      ["Prediction", "Services exposed", currentPrediction.servicesExposed],
      ["Prediction", "Primary driver", currentPrediction.primaryDriver],
      ["Prediction", "Recommended action", currentPrediction.recommendedAction],
      ...items.map((i) => ["Evidence", i.id, `${i.observation} (${i.stance})`] as [string, string, string]),
      ...limitations.map((l) => ["Limitation", "Known limitation", l] as [string, string, string]),
      ["Report", "Label", SYNTHETIC],
    ],
  });
}

export function exportLearningSummary(updates: readonly LearningUpdate[]): ExportOutcome {
  return downloadCsv({
    filename: "aim006-learning-summary.csv",
    headers: ["Key", "Label", "Value", "Lifecycle state"],
    rows: updates.map((u) => [u.key, u.label, u.value, u.lifecycleState]),
  });
}

export function exportDemoReport(
  items: readonly EvidenceItem[],
  events: readonly ScenarioTimelineEvent[],
  outcome: ScenarioOutcome,
  updates: readonly LearningUpdate[],
): ExportOutcome {
  return downloadCsv({
    filename: "aim006-predictive-protection-demo-report.csv",
    headers: ["Section", "Field", "Value"],
    rows: [
      ["Scenario", "Link", currentPrediction.linkId],
      ["Scenario", "Stages recorded", events.length],
      ...events.map((e) => ["Timeline", e.stage, `${e.actor}: ${e.event}`] as [string, string, string]),
      ...items.map((i) => ["Evidence", i.id, i.observation] as [string, string, string]),
      ["Outcome", "Prediction result", outcome.predictionResult],
      ["Outcome", "Customer outcome", outcome.customerOutcome],
      ["Outcome", "Outage minutes avoided", outcome.outageMinutesAvoided],
      ...updates.map((u) => ["Learning", u.label, `${u.value} (${u.lifecycleState})`] as [string, string, string]),
      ["Report", "Label", SYNTHETIC],
    ],
  });
}
