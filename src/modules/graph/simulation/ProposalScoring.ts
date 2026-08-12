/**
 * Stage 3.5.3.4 — published proposal scoring model.
 *
 * The score is explainable and gated: critical regressions, blocking conflicts,
 * invalid validation outcomes and unbound parameters override any aggregate
 * benefit rather than being averaged away.
 */

import {
  round2,
  type ChangeProposal,
  type MetricDelta,
  type ProposalConflict,
  type ProposalRecommendationBand,
  type ProposalScore,
  type RecommendationResolution,
  type RegressionFinding,
  type ScoreComponent,
  type ValidationResult,
} from "./SimulationTypes";
import type { ReasoningConfidence } from "../reasoning/index";

/** Benefit weights. Published, fixed and summing to 100. */
export const BENEFIT_WEIGHTS = {
  recommendationsResolved: 30,
  resolvedPriority: 20,
  ownershipImprovement: 15,
  traceabilityImprovement: 15,
  coverageImprovement: 10,
  resilienceImprovement: 10,
} as const;

/** Risk weights. Published, fixed and summing to 100. */
export const RISK_WEIGHTS = {
  criticalRegressions: 45,
  warningRegressions: 20,
  blockingConflicts: 25,
  advisoryConflicts: 10,
} as const;

/** Complexity weights. Published, fixed and summing to 100. */
export const COMPLEXITY_WEIGHTS = {
  changeCount: 40,
  entityCount: 25,
  dependencyCount: 15,
  irreversibility: 20,
} as const;

export const CONFIDENCE_SCORE: Readonly<Record<ReasoningConfidence, number>> = {
  high: 100,
  medium: 85,
  low: 70,
  "unable-to-verify": 50,
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const component = (
  key: string,
  label: string,
  normalized: number,
  weight: number,
  explanation: string,
): ScoreComponent => ({
  key,
  label,
  normalized: round2(clamp01(normalized)),
  weight,
  contribution: round2(clamp01(normalized) * weight),
  explanation,
});

const deltaOf = (deltas: readonly MetricDelta[], key: string): MetricDelta | undefined =>
  deltas.find((d) => d.key === key);

const improvement = (deltas: readonly MetricDelta[], key: string): number => {
  const delta = deltaOf(deltas, key);
  if (!delta) return 0;
  const signed = delta.higherIsBetter ? delta.delta : -delta.delta;
  const scale = Math.max(1, Math.abs(delta.baseline));
  return clamp01(signed / scale);
};

export interface ScoreInput {
  proposal: ChangeProposal;
  validation: ValidationResult;
  conflicts: readonly ProposalConflict[];
  resolutions: readonly RecommendationResolution[];
  regressions: readonly RegressionFinding[];
  deltas: readonly MetricDelta[];
}

export function scoreProposal(input: ScoreInput): ProposalScore {
  const { proposal, validation, conflicts, resolutions, regressions, deltas } = input;

  const resolved = resolutions.filter((r) => r.classification === "resolved");
  const partial = resolutions.filter((r) => r.classification === "partially-resolved");
  const targetCount = Math.max(1, proposal.expectedImprovement.resolvesRecommendationIds.length);
  const resolvedCredit = resolved.length + partial.length * 0.5;

  const priorityWeight = (band: string): number =>
    band === "critical" ? 1 : band === "high" ? 0.8 : band === "medium" ? 0.6 : band === "low" ? 0.4 : 0.2;
  const resolvedPriority =
    resolved.length === 0
      ? 0
      : resolved.reduce((sum, r) => sum + priorityWeight(r.baselineState.priority), 0) / resolved.length;

  const benefitComponents: ScoreComponent[] = [
    component(
      "recommendations-resolved",
      "Recommendations resolved",
      resolvedCredit / targetCount,
      BENEFIT_WEIGHTS.recommendationsResolved,
      `${resolved.length} resolved and ${partial.length} partially resolved against ${targetCount} targeted.`,
    ),
    component(
      "resolved-priority",
      "Priority of resolved recommendations",
      resolvedPriority,
      BENEFIT_WEIGHTS.resolvedPriority,
      resolved.length === 0
        ? "No recommendations were fully resolved."
        : `Mean priority weight of resolved recommendations is ${round2(resolvedPriority)}.`,
    ),
    component(
      "ownership-improvement",
      "Ownership improvement",
      Math.max(
        improvement(deltas, "unresolvedOwnershipCount"),
        improvement(deltas, "ownershipResolutionRate"),
      ),
      BENEFIT_WEIGHTS.ownershipImprovement,
      "Derived from unresolved ownership and the ownership resolution rate.",
    ),
    component(
      "traceability-improvement",
      "Traceability improvement",
      Math.max(
        improvement(deltas, "routeTraceabilityRate"),
        improvement(deltas, "missingLineageLayerCount"),
      ),
      BENEFIT_WEIGHTS.traceabilityImprovement,
      "Derived from route traceability rate and missing lineage layers.",
    ),
    component(
      "coverage-improvement",
      "Coverage improvement",
      Math.max(improvement(deltas, "coverageGapCount"), improvement(deltas, "expectedByDesignGapCount")),
      BENEFIT_WEIGHTS.coverageImprovement,
      "Derived from open coverage gaps and registered exceptions.",
    ),
    component(
      "resilience-improvement",
      "Resilience improvement",
      Math.max(
        improvement(deltas, "singlePointOfFailureCount"),
        improvement(deltas, "dependencyCycleCount"),
      ),
      BENEFIT_WEIGHTS.resilienceImprovement,
      "Derived from single points of failure and dependency cycles.",
    ),
  ];

  const criticalRegressions = regressions.filter((r) => r.severity === "critical");
  const warningRegressions = regressions.filter((r) => r.severity === "warning");
  const blockingConflicts = conflicts.filter((c) => c.severity === "blocking");
  const advisoryConflicts = conflicts.filter((c) => c.severity !== "blocking");

  const riskComponents: ScoreComponent[] = [
    component(
      "critical-regressions",
      "Critical regressions",
      criticalRegressions.length === 0 ? 0 : 1,
      RISK_WEIGHTS.criticalRegressions,
      `${criticalRegressions.length} critical regression(s) detected.`,
    ),
    component(
      "warning-regressions",
      "Warning regressions",
      Math.min(1, warningRegressions.length / 3),
      RISK_WEIGHTS.warningRegressions,
      `${warningRegressions.length} warning regression(s) detected.`,
    ),
    component(
      "blocking-conflicts",
      "Blocking conflicts",
      blockingConflicts.length === 0 ? 0 : 1,
      RISK_WEIGHTS.blockingConflicts,
      `${blockingConflicts.length} blocking conflict(s) detected.`,
    ),
    component(
      "advisory-conflicts",
      "Advisory conflicts",
      Math.min(1, advisoryConflicts.length / 3),
      RISK_WEIGHTS.advisoryConflicts,
      `${advisoryConflicts.length} advisory or warning conflict(s) detected.`,
    ),
  ];

  const entityCount = new Set(proposal.changes.flatMap((c) => c.target.nodeIds)).size;
  const dependencyCount = proposal.changes.reduce((sum, c) => sum + c.dependencies.length, 0);
  const complexityComponents: ScoreComponent[] = [
    component(
      "change-count",
      "Number of changes",
      Math.min(1, proposal.changes.length / 25),
      COMPLEXITY_WEIGHTS.changeCount,
      `${proposal.changes.length} change operation(s).`,
    ),
    component(
      "entity-count",
      "Number of entities changed",
      Math.min(1, entityCount / 25),
      COMPLEXITY_WEIGHTS.entityCount,
      `${entityCount} entity(ies) touched.`,
    ),
    component(
      "dependency-count",
      "Change dependencies",
      Math.min(1, dependencyCount / 10),
      COMPLEXITY_WEIGHTS.dependencyCount,
      `${dependencyCount} intra-proposal dependency(ies).`,
    ),
    component(
      "irreversibility",
      "Irreversibility",
      proposal.reversible ? 0 : 1,
      COMPLEXITY_WEIGHTS.irreversibility,
      proposal.reversible ? "Every change is deterministically reversible." : "At least one change is irreversible.",
    ),
  ];

  const benefitScore = round2(benefitComponents.reduce((s, c) => s + c.contribution, 0));
  const riskScore = round2(riskComponents.reduce((s, c) => s + c.contribution, 0));
  const complexityScore = round2(complexityComponents.reduce((s, c) => s + c.contribution, 0));
  const confidenceScore = CONFIDENCE_SCORE[proposal.confidence];

  const raw =
    benefitScore * 0.6 - riskScore * 0.3 - complexityScore * 0.1 + (confidenceScore - 85) * 0.1;
  const score = round2(Math.min(100, Math.max(0, raw + 30)));

  /* --------------------------------------------------------------- gating */
  const gates: string[] = [];
  let band: ProposalRecommendationBand;

  if (validation.outcome === "invalid") {
    gates.push("gate:invalid-validation — validation returned invalid; the proposal cannot be applied.");
    band = "invalid";
  } else if (validation.outcome === "incomplete" || proposal.incomplete) {
    gates.push("gate:incomplete-parameters — required parameters are unbound; the proposal is not executable.");
    band = "conditional";
  } else if (blockingConflicts.length > 0) {
    gates.push("gate:blocking-conflict — an unresolved blocking conflict prevents recommendation.");
    band = "not-recommended";
  } else if (criticalRegressions.length > 0) {
    gates.push("gate:critical-regression — a critical regression is never hidden behind aggregate benefit.");
    band = "not-recommended";
  } else if (resolved.length === 0 && partial.length === 0) {
    gates.push("gate:no-resolution — no recommendation was resolved or partially resolved.");
    band = "low-value";
  } else if (warningRegressions.length > 0 || advisoryConflicts.length > 0) {
    gates.push("gate:conditional — warning-level regressions or conflicts require a decision.");
    band = "conditional";
  } else if (score >= 70) {
    band = "strongly-recommended";
  } else if (score >= 50) {
    band = "recommended";
  } else if (score >= 30) {
    band = "conditional";
  } else {
    band = "low-value";
  }

  return {
    score,
    benefitScore,
    riskScore,
    complexityScore,
    confidenceScore,
    band,
    benefitComponents,
    riskComponents,
    complexityComponents,
    gatesApplied: gates,
    explanation: [
      `score = clamp(0..100, benefit(${benefitScore}) * 0.6 - risk(${riskScore}) * 0.3 - complexity(${complexityScore}) * 0.1 + (confidence(${confidenceScore}) - 85) * 0.1 + 30) = ${score}.`,
      `Band "${band}"${gates.length ? ` forced by ${gates.length} gate(s).` : " derived from the score thresholds 70/50/30."}`,
    ].join(" "),
  };
}
