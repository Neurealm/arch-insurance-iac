/**
 * Stage 3.5.3.3 — published, explainable prioritization model.
 *
 * The formula is a fixed weighted sum of normalized signals, multiplied by a
 * confidence factor, penalised for candidate-edge involvement and adjusted for
 * remediation leverage. Nothing about array order, insertion order or wall
 * clock can affect the outcome.
 *
 *   subtotal        = Σ (normalized_i × weight_i)                 // max 100
 *   confidenceScaled= subtotal × confidenceFactor(confidence)
 *   raw             = confidenceScaled − candidatePenalty + remediationLeverage
 *   score           = round(clamp(raw, 0, 100))
 *   score           = min(score, 10) when the issue is expected by design
 */

import type { ReasoningConfidence, ReasoningSeverity } from "../reasoning/index";
import type {
  PriorityFactorValue,
  PriorityScore,
  RemediationComplexity,
} from "./IntelligenceTypes";
import { CONFIDENCE_FACTOR, bandForScore } from "./IntelligenceTypes";

export interface PriorityFactorDefinition {
  factor: string;
  weight: number;
  label: string;
  /** Value that maps to a normalized 1.0. */
  saturation: number;
}

/** The published factor table. Weights sum to 100. */
export const PRIORITY_FACTORS: readonly PriorityFactorDefinition[] = [
  { factor: "blast-radius", weight: 22, label: "Nodes affected downstream", saturation: 50 },
  { factor: "criticality", weight: 18, label: "Structural criticality of the subject", saturation: 100 },
  { factor: "ownership-risk", weight: 12, label: "Ownership unresolved or conflicting", saturation: 1 },
  { factor: "traceability-risk", weight: 12, label: "Missing lineage or traceability layers", saturation: 1 },
  { factor: "coverage-gap", weight: 10, label: "Registration or coverage gap weight", saturation: 1 },
  { factor: "breadth", weight: 10, label: "Distinct routes and modules affected", saturation: 25 },
  { factor: "dependency-depth", weight: 8, label: "Depth of the dependency chain involved", saturation: 10 },
  { factor: "operational-impact", weight: 8, label: "Severity of the operational consequence", saturation: 1 },
];

export const SEVERITY_IMPACT: Readonly<Record<ReasoningSeverity, number>> = {
  critical: 1,
  warning: 0.7,
  advisory: 0.4,
  info: 0.1,
};

export const REMEDIATION_LEVERAGE: Readonly<Record<RemediationComplexity, number>> = {
  trivial: 5,
  low: 3,
  moderate: 1,
  high: 0,
};

export const CANDIDATE_PENALTY = 10;

/** Raw, un-normalized signal values supplied by a policy. */
export interface PrioritySignals {
  /** Count of nodes in the blast radius / affected set. */
  blastRadius?: number;
  /** 0–100 criticality score of the subject. */
  criticality?: number;
  /** 0–1: 1 when ownership is unresolved or conflicting. */
  ownershipRisk?: number;
  /** 0–1: share of expected lineage layers that are missing. */
  traceabilityRisk?: number;
  /** 0–1: weight of the coverage/registration gap kind. */
  coverageGap?: number;
  /** Count of distinct affected routes plus modules. */
  breadth?: number;
  /** Longest dependency depth involved. */
  dependencyDepth?: number;
}

export interface PriorityInput {
  signals: PrioritySignals;
  severity: ReasoningSeverity;
  confidence: ReasoningConfidence;
  candidateInvolved: boolean;
  expectedByDesign: boolean;
  complexity: RemediationComplexity;
}

const clamp01 = (value: number): number => (value <= 0 ? 0 : value >= 1 ? 1 : value);
const round2 = (value: number): number => Math.round(value * 100) / 100;

const signalValue = (factor: string, input: PriorityInput): number => {
  const s = input.signals;
  switch (factor) {
    case "blast-radius":
      return s.blastRadius ?? 0;
    case "criticality":
      return s.criticality ?? 0;
    case "ownership-risk":
      return s.ownershipRisk ?? 0;
    case "traceability-risk":
      return s.traceabilityRisk ?? 0;
    case "coverage-gap":
      return s.coverageGap ?? 0;
    case "breadth":
      return s.breadth ?? 0;
    case "dependency-depth":
      return s.dependencyDepth ?? 0;
    case "operational-impact":
      return SEVERITY_IMPACT[input.severity];
    default:
      return 0;
  }
};

/** Deterministically scores a recommendation and explains every term. */
export function scorePriority(input: PriorityInput): PriorityScore {
  const factors: PriorityFactorValue[] = PRIORITY_FACTORS.map((definition) => {
    const raw = signalValue(definition.factor, input);
    const normalized = clamp01(definition.saturation <= 0 ? 0 : raw / definition.saturation);
    const contribution = round2(normalized * definition.weight);
    return {
      factor: definition.factor,
      normalized: round2(normalized),
      weight: definition.weight,
      contribution,
      explanation: `${definition.label}: raw ${round2(raw)} / saturation ${definition.saturation} = ${round2(
        normalized,
      )} × weight ${definition.weight} = ${contribution}`,
    };
  });

  const subtotal = round2(factors.reduce((sum, f) => sum + f.contribution, 0));
  const confidenceFactor = CONFIDENCE_FACTOR[input.confidence];
  const scaled = subtotal * confidenceFactor;
  const candidatePenalty = input.candidateInvolved ? CANDIDATE_PENALTY : 0;
  const remediationLeverage = REMEDIATION_LEVERAGE[input.complexity];
  const raw = scaled - candidatePenalty + remediationLeverage;
  const bounded = Math.round(Math.min(100, Math.max(0, raw)));
  const score = input.expectedByDesign ? Math.min(bounded, 10) : bounded;
  const band = input.expectedByDesign ? "informational" : bandForScore(score);

  const explanation = [
    `weighted subtotal ${subtotal}`,
    `× confidence factor ${confidenceFactor} (${input.confidence}) = ${round2(scaled)}`,
    candidatePenalty > 0 ? `− candidate-edge penalty ${candidatePenalty}` : "− candidate-edge penalty 0",
    `+ remediation leverage ${remediationLeverage} (${input.complexity})`,
    `= ${score}`,
    input.expectedByDesign ? "clamped to the informational band (expected by design)" : `band ${band}`,
  ].join(" ");

  return {
    score,
    band,
    factors,
    confidenceFactor,
    candidatePenalty,
    remediationLeverage,
    expectedByDesignClamp: input.expectedByDesign && bounded > 10,
    explanation,
  };
}
