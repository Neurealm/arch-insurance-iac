/**
 * AIM-006 — pure scenario functions.
 *
 * Deterministic, boundary-safe and free of UI state. Base fixtures are never
 * mutated: every function returns new objects.
 */

import {
  APPROVAL_STAGE_INDEX, EXECUTION_STAGE_INDEX, comparisonMetrics, comparisonStages, currentPrediction,
  evidenceItems, scenarioStages,
} from "./scenarioFixtures";
import type {
  ApprovalState, ComparisonMetric, ComparisonStage, EvidenceItem, LearningUpdate, ScenarioApprovalResult,
  ScenarioFailureKey, ScenarioOutcome, ScenarioStageState, ScenarioTimelineEvent,
} from "./scenarioTypes";

const clamp = (value: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Clamps an arbitrary stage number into the defined 1..15 range. */
export function normaliseStageIndex(index: number): number {
  if (!Number.isFinite(index)) return 1;
  return clamp(Math.trunc(index), 1, scenarioStages.length);
}

export interface FailureEffect {
  key: ScenarioFailureKey;
  label: string;
  confidenceDeltaPct: number;
  fallbackReady: boolean;
  evidenceComplete: boolean;
  autonomyLevel: "Advisory" | "Recommend with approval" | "Blocked";
  requiresAdditionalEvidence: boolean;
  pausesBeforeApproval: boolean;
  blocksExecution: boolean;
  rollbackTriggered: boolean;
  predictionResult: "Correct" | "False positive" | "Missed event" | "Pending";
  notes: readonly string[];
}

const FAILURE_EFFECTS: Record<ScenarioFailureKey, FailureEffect> = {
  none: {
    key: "none", label: "No simulation", confidenceDeltaPct: 0, fallbackReady: true, evidenceComplete: true,
    autonomyLevel: "Recommend with approval", requiresAdditionalEvidence: false, pausesBeforeApproval: false,
    blocksExecution: false, rollbackTriggered: false, predictionResult: "Correct", notes: [],
  },
  "successful-protection": {
    key: "successful-protection", label: "Successful Protection", confidenceDeltaPct: 0, fallbackReady: true,
    evidenceComplete: true, autonomyLevel: "Recommend with approval", requiresAdditionalEvidence: false,
    pausesBeforeApproval: false, blocksExecution: false, rollbackTriggered: false, predictionResult: "Correct",
    notes: ["Customer remains healthy", "Prediction is validated", "Preventive action is effective"],
  },
  "stale-weather": {
    key: "stale-weather", label: "Stale Weather Data", confidenceDeltaPct: -17, fallbackReady: true,
    evidenceComplete: false, autonomyLevel: "Advisory", requiresAdditionalEvidence: true,
    pausesBeforeApproval: true, blocksExecution: false, rollbackTriggered: false, predictionResult: "Pending",
    notes: ["Weather freshness declines", "Autonomy reduced to advisory", "Additional evidence required before approval"],
  },
  "missing-telemetry": {
    key: "missing-telemetry", label: "Missing Terminal Telemetry", confidenceDeltaPct: -12, fallbackReady: true,
    evidenceComplete: false, autonomyLevel: "Recommend with approval", requiresAdditionalEvidence: true,
    pausesBeforeApproval: false, blocksExecution: false, rollbackTriggered: false, predictionResult: "Pending",
    notes: ["Terminal evidence incomplete", "Hardware cause cannot be fully eliminated", "Diagnostics recommended", "Additional approval may be required"],
  },
  "conflicting-forecasts": {
    key: "conflicting-forecasts", label: "Conflicting Weather Forecasts", confidenceDeltaPct: -9,
    fallbackReady: true, evidenceComplete: false, autonomyLevel: "Advisory", requiresAdditionalEvidence: true,
    pausesBeforeApproval: false, blocksExecution: false, rollbackTriggered: false, predictionResult: "Pending",
    notes: ["Source agreement decreases", "ETA range widens", "Additional observation recommended"],
  },
  "insufficient-fallback": {
    key: "insufficient-fallback", label: "Insufficient RF Fallback Capacity", confidenceDeltaPct: -4,
    fallbackReady: false, evidenceComplete: false, autonomyLevel: "Blocked", requiresAdditionalEvidence: false,
    pausesBeforeApproval: true, blocksExecution: true, rollbackTriggered: false, predictionResult: "Pending",
    notes: ["Fallback readiness fails", "Move Priority Traffic demoted", "Policy blocks execution", "Customer-risk status increases"],
  },
  "validation-failure": {
    key: "validation-failure", label: "Execution Validation Failure", confidenceDeltaPct: -2, fallbackReady: true,
    evidenceComplete: true, autonomyLevel: "Recommend with approval", requiresAdditionalEvidence: false,
    pausesBeforeApproval: false, blocksExecution: false, rollbackTriggered: true, predictionResult: "Correct",
    notes: ["Customer validation fails during execution", "Rollback triggers", "Human escalation required"],
  },
  "false-positive": {
    key: "false-positive", label: "False Positive", confidenceDeltaPct: 0, fallbackReady: true,
    evidenceComplete: true, autonomyLevel: "Recommend with approval", requiresAdditionalEvidence: false,
    pausesBeforeApproval: false, blocksExecution: false, rollbackTriggered: false,
    predictionResult: "False positive",
    notes: ["Predicted degradation does not occur", "False-positive rate updates", "Threshold review recommended"],
  },
  "missed-event": {
    key: "missed-event", label: "Missed Event", confidenceDeltaPct: -34, fallbackReady: true,
    evidenceComplete: false, autonomyLevel: "Advisory", requiresAdditionalEvidence: true,
    pausesBeforeApproval: true, blocksExecution: true, rollbackTriggered: false, predictionResult: "Missed event",
    notes: ["Degradation occurs without sufficient prediction", "Model gap recorded", "Governance review opens", "Model status changes to Review"],
  },
};

export function getFailureEffect(key: ScenarioFailureKey): FailureEffect {
  return FAILURE_EFFECTS[key] ?? FAILURE_EFFECTS.none;
}

/** Applies a failure simulation to the base evidence set without mutating it. */
export function applyScenarioFailure(
  items: readonly EvidenceItem[] = evidenceItems,
  failure: ScenarioFailureKey = "none",
): EvidenceItem[] {
  const source = Array.isArray(items) ? items : [];
  const effect = getFailureEffect(failure);
  if (effect.key === "none" || effect.key === "successful-protection" || effect.key === "false-positive") {
    return source.map((item) => ({ ...item }));
  }
  return source.map((item) => {
    const next: EvidenceItem = { ...item };
    if (failure === "stale-weather" && next.category === "Weather Evidence") {
      next.freshness = "stale";
      next.reliability = "low";
      next.interpretation = `${next.interpretation} Freshness degraded by simulation; treat as advisory only.`;
    }
    if (failure === "missing-telemetry" && next.category === "Terminal Evidence") {
      next.freshness = "missing";
      next.value = "Unavailable";
      next.reliability = "low";
      next.stance = "neutral";
      next.interpretation = "Terminal telemetry is unavailable, so a hardware cause cannot be fully eliminated.";
    }
    if (failure === "conflicting-forecasts" && next.id === "EV-015") {
      next.value = "23.4";
      next.stance = "contradicts";
      next.interpretation = "Provider disagreement exceeds the acceptable band and widens the ETA range.";
    }
    if (failure === "insufficient-fallback" && next.category === "Fallback Evidence") {
      next.value = "6";
      next.stance = "contradicts";
      next.reliability = "high";
      next.interpretation = "Headroom is insufficient to carry the exposed priority traffic, so the move is blocked.";
    }
    if (failure === "missed-event" && next.category === "Weather Evidence") {
      next.freshness = "missing";
      next.value = "Unavailable";
      next.reliability = "low";
      next.stance = "neutral";
      next.interpretation = "Forecast ingestion gap meant the driver signal was not available to the model.";
    }
    return next;
  });
}

/** Evidence completeness as a percentage of fresh, usable evidence. */
export function calculateEvidenceCompleteness(items: readonly EvidenceItem[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const usable = items.filter((i) => i && i.freshness !== "missing").length;
  const penalised = items.filter((i) => i && i.freshness === "stale").length;
  const score = ((usable - penalised * 0.5) / items.length) * 100;
  return Math.round(clamp(score, 0, 100));
}

/** Scenario confidence given stage progress and the active failure simulation. */
export function calculateScenarioConfidence(
  stageIndex: number,
  failure: ScenarioFailureKey = "none",
  baseConfidencePct: number = currentPrediction.confidencePct,
): number {
  const stage = normaliseStageIndex(stageIndex);
  const base = Number.isFinite(baseConfidencePct) ? baseConfidencePct : 0;
  const ramp = stage <= 1 ? 0.32 : stage >= 5 ? 1 : 0.32 + ((stage - 1) / 4) * 0.68;
  const value = base * ramp + getFailureEffect(failure).confidenceDeltaPct;
  return Math.round(clamp(value, 0, 100));
}

/** Approval evaluation for the current stage, failure and recorded decision. */
export function evaluateScenarioApproval(
  stageIndex: number,
  approvalState: ApprovalState = "pending",
  failure: ScenarioFailureKey = "none",
): ScenarioApprovalResult {
  const stage = normaliseStageIndex(stageIndex);
  const effect = getFailureEffect(failure);
  const policyBasis = [
    "Critical customer service",
    "10 Gbps capacity",
    "Active traffic-path change",
    "Reversible action",
    effect.fallbackReady ? "RF fallback validated" : "RF fallback validation failed",
    "Human approval required by policy",
  ];

  if (stage < APPROVAL_STAGE_INDEX) {
    return {
      required: false, state: "not-required", canExecute: false,
      reason: "Approval is requested at the Policy and Approval stage.", policyBasis,
    };
  }
  if (effect.blocksExecution) {
    return {
      required: true, state: approvalState === "approved" ? "pending" : approvalState, canExecute: false,
      reason: `Policy blocks execution: ${effect.label}.`, policyBasis,
    };
  }
  if (approvalState === "rejected") {
    return { required: true, state: "rejected", canExecute: false, reason: "Traffic movement was rejected, so execution is prevented.", policyBasis };
  }
  if (approvalState === "evidence-requested") {
    return { required: true, state: "evidence-requested", canExecute: false, reason: "More evidence was requested, so the scenario is paused before execution.", policyBasis };
  }
  if (effect.requiresAdditionalEvidence && approvalState !== "approved") {
    return { required: true, state: "pending", canExecute: false, reason: `Additional evidence is required before approval: ${effect.label}.`, policyBasis };
  }
  if (approvalState === "approved") {
    return { required: true, state: "approved", canExecute: true, reason: "Network Operations approved the controlled traffic movement.", policyBasis };
  }
  return { required: true, state: "pending", canExecute: false, reason: "Network Operations approval is required before execution.", policyBasis };
}

/** Derives the full display state of a scenario stage. */
export function deriveScenarioStageState(
  stageIndex: number,
  failure: ScenarioFailureKey = "none",
  approvalState: ApprovalState = "pending",
): ScenarioStageState {
  const index = normaliseStageIndex(stageIndex);
  const definition = scenarioStages[index - 1];
  const effect = getFailureEffect(failure);
  const approval = evaluateScenarioApproval(index, approvalState, failure);
  const riskRamp = [0.12, 0.28, 0.46, 0.71, 0.94, 0.94, 0.94, 0.94, 0.94, 0.94, 0.9, 0.86, 0.52, 0.22, 0.18];
  const rawRisk = riskRamp[index - 1] ?? 0.12;
  const risk = failure === "missed-event" ? round1(rawRisk * 0.4 * 100) / 100 : rawRisk;

  const blocked =
    (index >= EXECUTION_STAGE_INDEX && !approval.canExecute) ||
    (effect.pausesBeforeApproval && index >= APPROVAL_STAGE_INDEX && approvalState !== "approved");

  return {
    index,
    key: definition.key,
    title: definition.title,
    actor: definition.actor,
    summary: definition.summary,
    state: definition.state,
    focus: definition.focus,
    riskScore: risk,
    confidencePct: calculateScenarioConfidence(index, failure),
    etaLabel: failure === "conflicting-forecasts" ? "4h 10m to 7h 20m" : currentPrediction.eta,
    fallbackReady: effect.fallbackReady,
    customerHealthy: !(failure === "validation-failure" && index >= EXECUTION_STAGE_INDEX) && failure !== "missed-event",
    approvalRequired: approval.required,
    executionAllowed: approval.canExecute,
    pipelineStageKey: ["signals", "signals", "features", "anomaly", "risk", "impact", "impact", "actions", "actions", "actions", "actions", "actions", "actions", "actions", "actions"][index - 1],
    notes: effect.notes,
    blocked,
    blockedReason: blocked ? approval.reason : null,
  };
}

/** Outage minutes avoided by a successful preventive action. */
export function calculateOutageMinutesAvoided(
  predictedOutageMinutes: number,
  actualImpactMinutes: number,
): number {
  const predicted = Number.isFinite(predictedOutageMinutes) ? Math.max(0, predictedOutageMinutes) : 0;
  const actual = Number.isFinite(actualImpactMinutes) ? Math.max(0, actualImpactMinutes) : 0;
  return Math.max(0, Math.round(predicted - actual));
}

/** Error budget percentage points preserved out of the budget that was at risk. */
export function calculateScenarioErrorBudgetPreserved(
  budgetAtRiskPct: number,
  budgetConsumedPct: number,
): number {
  const atRisk = Number.isFinite(budgetAtRiskPct) ? clamp(budgetAtRiskPct, 0, 100) : 0;
  if (atRisk === 0) return 0;
  const consumed = Number.isFinite(budgetConsumedPct) ? clamp(budgetConsumedPct, 0, atRisk) : 0;
  return Math.round(clamp(atRisk - consumed, 0, 100));
}

/** Rollback decision for the current failure and stage. */
export function calculateRollbackDecision(
  stageIndex: number,
  failure: ScenarioFailureKey = "none",
  approvalState: ApprovalState = "pending",
): { triggered: boolean; available: boolean; result: string; reason: string } {
  const index = normaliseStageIndex(stageIndex);
  const effect = getFailureEffect(failure);
  const approval = evaluateScenarioApproval(index, approvalState, failure);
  if (effect.rollbackTriggered && index >= EXECUTION_STAGE_INDEX && approval.canExecute) {
    return {
      triggered: true, available: true, result: "Executed",
      reason: "Customer validation failed during execution, so traffic returned to the previous state.",
    };
  }
  if (index < EXECUTION_STAGE_INDEX) {
    return { triggered: false, available: true, result: "Not required", reason: "No traffic has moved yet." };
  }
  return { triggered: false, available: index < 15, result: "Not required", reason: "Customer validation passed at every increment." };
}

/** Final outcome record for the scenario. */
export function calculateScenarioOutcome(
  stageIndex: number,
  failure: ScenarioFailureKey = "none",
  approvalState: ApprovalState = "pending",
  items: readonly EvidenceItem[] = evidenceItems,
): ScenarioOutcome {
  const index = normaliseStageIndex(stageIndex);
  const effect = getFailureEffect(failure);
  const approval = evaluateScenarioApproval(index, approvalState, failure);
  const rollback = calculateRollbackDecision(index, failure, approvalState);
  const evidence = calculateEvidenceCompleteness(applyScenarioFailure(items, failure));
  const executed = index >= EXECUTION_STAGE_INDEX && approval.canExecute;

  const predictionResult =
    failure === "false-positive" ? "False positive"
      : failure === "missed-event" ? "Missed event"
        : index >= 12 ? "Correct" : "Pending";

  const customerOutcome =
    failure === "missed-event" ? "Customer impact occurred"
      : failure === "validation-failure" && executed ? "Brief validation failure, rolled back"
        : approval.state === "rejected" ? "Customer remains exposed"
          : executed ? "No impact" : "Exposure unmitigated";

  const outageMinutesAvoided =
    failure === "missed-event" ? 0
      : failure === "false-positive" ? 0
        : approval.state === "rejected" ? 0
          : executed ? calculateOutageMinutesAvoided(45, failure === "validation-failure" ? 6 : 0) : 0;

  const errorBudgetPreserved =
    failure === "missed-event" ? 0
      : approval.state === "rejected" ? 0
        : executed ? calculateScenarioErrorBudgetPreserved(22, failure === "validation-failure" ? 8 : 0) : 0;

  return {
    predictionResult,
    customerOutcome,
    capacityProtectedGbps: executed && failure !== "missed-event" ? currentPrediction.capacityExposedGbps : 0,
    outageMinutesAvoided,
    sloImpact: customerOutcome === "No impact" ? "None" : failure === "missed-event" ? "Breach recorded" : "Elevated",
    errorBudgetPreservedPct: errorBudgetPreserved,
    preventiveActionResult:
      failure === "validation-failure" && executed ? "Rolled back"
        : failure === "false-positive" ? "Unnecessary but safe"
          : executed ? "Effective" : "Not executed",
    validationResult: failure === "validation-failure" && executed ? "Failed" : executed ? "Passed" : "Not run",
    rollbackResult: rollback.result,
    evidenceCompletenessPct: effect.evidenceComplete && index >= 15 ? Math.max(evidence, 100) : evidence,
    learningRecorded: index >= 15 || failure === "missed-event" || failure === "false-positive",
    nextRecommendedImprovement:
      failure === "missed-event" ? "Open a governance review and schedule retraining with the missed-event cohort."
        : failure === "false-positive" ? "Review the high-risk confidence threshold for this cohort."
          : failure === "insufficient-fallback" ? "Add fallback capacity planning to the Chennai metro cluster."
            : "Expand the Lightbridge cohort in the similar-event library.",
  };
}

/** Learning updates recorded from the outcome. */
export function calculateLearningUpdates(
  failure: ScenarioFailureKey = "none",
  stageIndex: number = 15,
): LearningUpdate[] {
  const index = normaliseStageIndex(stageIndex);
  if (index < 12 && failure === "none") return [];
  const effect = getFailureEffect(failure);
  const confirmedCause =
    failure === "missed-event" ? "Fog attenuation, identified after the fact"
      : failure === "false-positive" ? "No qualifying degradation occurred"
        : "Fog attenuation on the Chennai metro path";

  const base: LearningUpdate[] = [
    { key: "cause", label: "Confirmed cause", value: confirmedCause, lifecycleState: "Reviewed lifecycle update" },
    { key: "signal", label: "Signal signature", value: "Visibility collapse with correlated margin decline and attenuation growth", lifecycleState: "Reviewed lifecycle update" },
    { key: "weather", label: "Weather signature", value: "Visibility 8.6 km to 1.8 km, humidity 94%, fog probability 88%", lifecycleState: "Reviewed lifecycle update" },
    { key: "optical", label: "Optical signature", value: "Margin 3.7 dB, attenuation 5.8 dB, received power -28.4 dBm", lifecycleState: "Reviewed lifecycle update" },
    { key: "eliminated", label: "Eliminated causes", value: "Hardware fault, alignment drift, routing instability, recent change", lifecycleState: "Approved lifecycle update" },
    { key: "action", label: "Effective action", value: failure === "insufficient-fallback" ? "None available, capacity action required" : "Move Priority Traffic to validated RF fallback", lifecycleState: "Approved lifecycle update" },
    { key: "rejected", label: "Rejected alternatives", value: "Move All Traffic, Reacquire Beam, Monitor Closely only", lifecycleState: "Reviewed lifecycle update" },
    { key: "warning", label: "Warning time", value: failure === "missed-event" ? "Insufficient" : "5h 42m", lifecycleState: "Reviewed lifecycle update" },
    { key: "validation", label: "Validation sequence", value: "Preflight, 25% increment validation, full increment validation, restoration validation", lifecycleState: "Approved lifecycle update" },
    { key: "customer", label: "Customer outcome", value: failure === "missed-event" ? "Impact occurred" : "Protected throughout", lifecycleState: "Reviewed lifecycle update" },
    { key: "runbook", label: "Runbook update", value: "Chennai fog runbook records a successful early priority move", lifecycleState: "Proposed lifecycle update" },
    { key: "model", label: "Model feedback", value: effect.predictionResult === "Correct" ? "Positive label added to the fog cohort" : "Gap label added for lifecycle review", lifecycleState: "Proposed lifecycle update" },
    { key: "threshold", label: "Threshold feedback", value: failure === "false-positive" ? "High-risk threshold review recommended" : "Current threshold retained", lifecycleState: "Proposed lifecycle update" },
    { key: "similar", label: "Similar-event update", value: "Event added to the Chennai seasonal fog cohort", lifecycleState: "Proposed lifecycle update" },
    { key: "autonomy", label: "Autonomy-readiness effect", value: effect.autonomyLevel === "Recommend with approval" ? "Readiness evidence increased, approval still required" : `Readiness reduced, level is ${effect.autonomyLevel}`, lifecycleState: "Proposed lifecycle update" },
  ];
  return base;
}

/** Traditional versus agentic comparison model. */
export function compareTraditionalAndAgentic(
  stages: readonly ComparisonStage[] = comparisonStages,
  metrics: readonly ComparisonMetric[] = comparisonMetrics,
): { stages: ComparisonStage[]; metrics: ComparisonMetric[]; stageCount: number; metricCount: number } {
  const safeStages = (Array.isArray(stages) ? stages : []).map((s) => ({ ...s }));
  const safeMetrics = (Array.isArray(metrics) ? metrics : []).map((m) => ({ ...m }));
  return {
    stages: safeStages,
    metrics: safeMetrics,
    stageCount: safeStages.length,
    metricCount: safeMetrics.length,
  };
}

/** Builds one deterministic timeline record. */
export function buildScenarioTimelineEvent(
  stageIndex: number,
  failure: ScenarioFailureKey = "none",
  approvalState: ApprovalState = "pending",
  status: ScenarioTimelineEvent["status"] = "complete",
): ScenarioTimelineEvent {
  const stage = deriveScenarioStageState(stageIndex, failure, approvalState);
  const approval = evaluateScenarioApproval(stage.index, approvalState, failure);
  const minutes = (stage.index - 1) * 7;
  const timestamp = `T+${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return {
    id: `SCN-${String(stage.index).padStart(2, "0")}-${failure}`,
    timestamp,
    stageIndex: stage.index,
    stage: stage.title,
    event: stage.summary,
    actor: stage.actor,
    object: currentPrediction.linkId,
    input: stage.state[0] ?? "None",
    output: stage.state[stage.state.length - 1] ?? "None",
    evidence: `${applyScenarioFailure(evidenceItems, failure).filter((e) => e.freshness !== "missing").length} evidence items`,
    policyState: approval.state,
    customerState: stage.customerHealthy ? "Healthy" : "At risk",
    status: stage.blocked ? "blocked" : status,
  };
}

/** Full deterministic timeline up to and including the current stage. */
export function buildScenarioTimeline(
  stageIndex: number,
  failure: ScenarioFailureKey = "none",
  approvalState: ApprovalState = "pending",
): ScenarioTimelineEvent[] {
  const current = normaliseStageIndex(stageIndex);
  const events: ScenarioTimelineEvent[] = [];
  for (let i = 1; i <= current; i += 1) {
    events.push(buildScenarioTimelineEvent(i, failure, approvalState, i === current ? "active" : "complete"));
  }
  return events;
}
