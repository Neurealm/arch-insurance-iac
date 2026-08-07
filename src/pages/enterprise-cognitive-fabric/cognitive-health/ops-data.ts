/**
 * Enterprise Cognitive Health — Prompt 2 operational data models and engines.
 *
 * Everything here is deterministic and local. No backend, no live enterprise
 * systems, no predictive inference. Scenario and projection output is always
 * labelled as an estimate, never as an observed result.
 *
 * Prompt 1 models (dimensions, signals, contributors, diagnostic paths,
 * heatmaps, snapshots, activity) are imported and reused, never redefined.
 */

import {
  bandFor, dimensions, dimensionById, signals, signalById,
  type CognitiveHealthActivity, type HealthBand,
} from "./data";

/* ========================================================== identifiers === */

export const DIM_IDS = ["DIM IQ", "DIM CP", "DIM DV", "DIM CTA", "DIM DC", "DIM RL", "DIM LM"] as const;
export type DimId = (typeof DIM_IDS)[number];

export const dimName = (id: string) => dimensionById(id).name;
export const signalName = (id: string) => signalById(id)?.name ?? id;

export type ScopeType = "Enterprise" | "Business Unit" | "Team Persona" | "Knowledge Domain" | "Decision Portfolio";

export const scopeTypes: ScopeType[] = [
  "Enterprise", "Business Unit", "Team Persona", "Knowledge Domain", "Decision Portfolio",
];

/* ============================================== 32 · operational states === */

export type HealthOperationalState =
  | "Loading" | "Empty" | "Error"
  | "Strong" | "Healthy" | "Healthy with Attention Areas" | "Needs Attention" | "At Risk" | "Critical"
  | "Recalculating" | "Review Required" | "Intervention Proposed" | "Intervention In Progress"
  | "Measurement Window" | "Partially Successful" | "Successful" | "No Material Improvement"
  | "Risk Accepted" | "Reassessment Required" | "Escalated" | "Historical Integrity Alert";

export const operationalStates: HealthOperationalState[] = [
  "Loading", "Empty", "Error", "Strong", "Healthy", "Healthy with Attention Areas", "Needs Attention",
  "At Risk", "Critical", "Recalculating", "Review Required", "Intervention Proposed",
  "Intervention In Progress", "Measurement Window", "Partially Successful", "Successful",
  "No Material Improvement", "Risk Accepted", "Reassessment Required", "Escalated",
  "Historical Integrity Alert",
];

/* ======================================= 2 · health threshold governance == */

export interface CognitiveHealthThreshold {
  id: string;
  policyVersion: string;
  dimensionId: string;
  signalId: string | null;
  scopeType: ScopeType;
  scopeId: string;
  strongThreshold: string;
  healthyThreshold: string;
  attentionThreshold: string;
  atRiskThreshold: string;
  criticalThreshold: string;
  unit: "percent" | "business days" | "hours" | "count";
  owner: string;
  effectiveDate: string;
}

export const healthBands: HealthBand[] = [
  "Strong", "Healthy", "Healthy with Attention Areas", "Needs Attention", "At Risk", "Critical", "Unknown",
];

const scoreThreshold = (
  id: string, dimensionId: string, owner: string,
  strong = ">= 95", healthy = "90 to 94", attention = "85 to 89",
  needs = "75 to 84", risk = "60 to 74", critical = "< 60",
): CognitiveHealthThreshold => ({
  id, policyVersion: "v1.2", dimensionId, signalId: null, scopeType: "Enterprise", scopeId: "Enterprise",
  strongThreshold: strong, healthyThreshold: healthy, attentionThreshold: attention,
  atRiskThreshold: needs, criticalThreshold: `${risk} at risk · ${critical} critical`,
  unit: "percent", owner, effectiveDate: "2026-07-01",
});

export const seedThresholds: CognitiveHealthThreshold[] = [
  scoreThreshold("CHT 01", "DIM IQ", "Information Governance"),
  scoreThreshold("CHT 02", "DIM CP", "Memory Governance", ">= 97", "94 to 96", "90 to 93", "82 to 89", "70 to 81", "< 70"),
  scoreThreshold("CHT 03", "DIM DV", "Dependency Governance", ">= 95", "90 to 94", "85 to 89", "75 to 84", "60 to 74", "< 60"),
  scoreThreshold("CHT 04", "DIM CTA", "Coordination Governance", ">= 95", "90 to 94", "85 to 89", "75 to 84", "60 to 74", "< 60"),
  scoreThreshold("CHT 05", "DIM DC", "Decision Governance", ">= 95", "90 to 94", "86 to 89", "78 to 85", "65 to 77", "< 65"),
  scoreThreshold("CHT 06", "DIM RL", "Coordination Governance", ">= 92", "88 to 91", "82 to 87", "74 to 81", "62 to 73", "< 62"),
  scoreThreshold("CHT 07", "DIM LM", "Learning Governance", ">= 95", "90 to 94", "85 to 89", "76 to 84", "62 to 75", "< 62"),
  {
    id: "CHT 08", policyVersion: "v1.2", dimensionId: "DIM RL", signalId: "CHS 1006",
    scopeType: "Enterprise", scopeId: "Enterprise",
    strongThreshold: "< 0.5 business day", healthyThreshold: "< 1 business day",
    attentionThreshold: "1 to 2 business days", atRiskThreshold: "2 to 3 business days",
    criticalThreshold: "> 3 business days", unit: "business days",
    owner: "Coordination Governance", effectiveDate: "2026-07-01",
  },
  {
    id: "CHT 09", policyVersion: "v1.2", dimensionId: "DIM RL", signalId: "CHS 1020",
    scopeType: "Enterprise", scopeId: "Enterprise",
    strongThreshold: "< 4 hours", healthyThreshold: "< 8 hours", attentionThreshold: "8 to 16 hours",
    atRiskThreshold: "16 to 24 hours", criticalThreshold: "> 24 hours", unit: "hours",
    owner: "Intake Governance", effectiveDate: "2026-07-01",
  },
  {
    id: "CHT 10", policyVersion: "v1.2", dimensionId: "DIM RL", signalId: "CHS 1021",
    scopeType: "Enterprise", scopeId: "Enterprise",
    strongThreshold: "< 0.25 business day", healthyThreshold: "< 0.5 business day",
    attentionThreshold: "0.5 to 1 business day", atRiskThreshold: "1 to 2 business days",
    criticalThreshold: "> 2 business days", unit: "business days",
    owner: "Coordination Governance", effectiveDate: "2026-07-01",
  },
];

export const durationThresholdIds = ["CHT 08", "CHT 09", "CHT 10"];

/* =========================================== 3 · health scoring policy === */

export interface CognitiveHealthPolicyDimension {
  dimensionId: string;
  weight: number;
  minimumSignalCoverage: number;
  minimumConfidence: number;
  criticalOverrideRule: string;
  missingDataTreatment: string;
  target: number;
  owner: string;
}

export interface CognitiveHealthPolicy {
  id: string;
  version: string;
  dimensionWeights: Record<string, number>;
  dimensionTargets: Record<string, number>;
  healthBands: HealthBand[];
  criticalOverrideRules: string[];
  missingDataRules: string[];
  minimumSignalCoverage: number;
  minimumConfidence: number;
  owner: string;
  approvalState: "Draft" | "Submitted for Governance" | "Approved" | "Superseded";
  effectiveDate: string;
  createdAt: string;
  reason: string;
  dimensionPolicy: CognitiveHealthPolicyDimension[];
}

const dimPolicy = (
  dimensionId: string, weight: number, target: number, owner: string,
  coverage: number, confidence: number, override: string, missing: string,
): CognitiveHealthPolicyDimension => ({
  dimensionId, weight, minimumSignalCoverage: coverage, minimumConfidence: confidence,
  criticalOverrideRule: override, missingDataTreatment: missing, target, owner,
});

export const seedPolicyDimensions: CognitiveHealthPolicyDimension[] = [
  dimPolicy("DIM IQ", 0.15, 95, "Information Governance", 80, 85,
    "Any Critical information authority conflict on an active decision raises an attention banner", "Excluded from score and reported as coverage gap"),
  dimPolicy("DIM CP", 0.15, 97, "Memory Governance", 90, 90,
    "Any historical context integrity violation forces Critical regardless of score", "Treated as a Critical integrity gap, never interpolated"),
  dimPolicy("DIM DV", 0.15, 92, "Dependency Governance", 85, 85,
    "Unvalidated critical dependency on an active high priority decision raises an attention banner", "Excluded from score and reported as coverage gap"),
  dimPolicy("DIM CTA", 0.15, 90, "Coordination Governance", 85, 85,
    "Unowned coordination action on an active decision raises an attention banner", "Excluded from score and reported as coverage gap"),
  dimPolicy("DIM DC", 0.15, 95, "Decision Governance", 90, 90,
    "Decision confidence below minimum on an active decision raises an attention banner", "Decision excluded and flagged for reassessment"),
  dimPolicy("DIM RL", 0.10, 90, "Coordination Governance", 80, 80,
    "Sustained breach of the cross team understanding threshold raises an attention banner", "Latency reported as Unknown rather than assumed healthy"),
  dimPolicy("DIM LM", 0.15, 92, "Learning Governance", 80, 85,
    "Material learning failure on a repeated decision pattern raises an attention banner", "Excluded from score and reported as coverage gap"),
];

export const policyWeightTotal = (rows: CognitiveHealthPolicyDimension[]) =>
  Number(rows.reduce((a, r) => a + r.weight, 0).toFixed(4));

export const policyWeightsValid = (rows: CognitiveHealthPolicyDimension[]) =>
  Math.abs(policyWeightTotal(rows) - 1) < 0.0001;

const buildPolicy = (
  id: string, version: string, rows: CognitiveHealthPolicyDimension[],
  effectiveDate: string, approvalState: CognitiveHealthPolicy["approvalState"], reason: string,
): CognitiveHealthPolicy => ({
  id, version,
  dimensionWeights: Object.fromEntries(rows.map((r) => [r.dimensionId, r.weight])),
  dimensionTargets: Object.fromEntries(rows.map((r) => [r.dimensionId, r.target])),
  healthBands,
  criticalOverrideRules: rows.map((r) => `${dimName(r.dimensionId)} · ${r.criticalOverrideRule}`),
  missingDataRules: rows.map((r) => `${dimName(r.dimensionId)} · ${r.missingDataTreatment}`),
  minimumSignalCoverage: 85, minimumConfidence: 88,
  owner: "Enterprise Cognitive Governance", approvalState, effectiveDate,
  createdAt: effectiveDate, reason, dimensionPolicy: rows,
});

export const currentPolicy = buildPolicy(
  "CHP 3", "v1.2", seedPolicyDimensions, "2026-07-01", "Approved",
  "Learning effectiveness signal added to the Learning Maturity dimension",
);

/* ==================================== 19 · ECHI policy version history === */

export interface EchiPolicyVersion {
  version: string;
  effectiveDate: string;
  dimensionCount: number;
  weights: Record<string, number>;
  thresholdSummary: string;
  signalDefinitions: string;
  owner: string;
  approval: string;
  reason: string;
}

export const echiPolicyVersions: EchiPolicyVersion[] = [
  {
    version: "v1.0", effectiveDate: "2026-01-15", dimensionCount: 7,
    weights: { "DIM IQ": 0.15, "DIM CP": 0.15, "DIM DV": 0.15, "DIM CTA": 0.15, "DIM DC": 0.15, "DIM RL": 0.15, "DIM LM": 0.10 },
    thresholdSummary: "Uniform score bands across all seven dimensions",
    signalDefinitions: "19 seeded signals, no duration based thresholds",
    owner: "Enterprise Cognitive Governance", approval: "Approved 2026-01-14",
    reason: "Initial seven dimension model",
  },
  {
    version: "v1.1", effectiveDate: "2026-04-01", dimensionCount: 7,
    weights: { "DIM IQ": 0.15, "DIM CP": 0.15, "DIM DV": 0.15, "DIM CTA": 0.15, "DIM DC": 0.15, "DIM RL": 0.10, "DIM LM": 0.15 },
    thresholdSummary: "Response Latency moved to duration based source thresholds",
    signalDefinitions: "21 signals, cross team understanding time measured in business days",
    owner: "Coordination Governance", approval: "Approved 2026-03-27",
    reason: "Response Latency measurement refined to organizational understanding time rather than system response time",
  },
  {
    version: "v1.2", effectiveDate: "2026-07-01", dimensionCount: 7,
    weights: Object.fromEntries(seedPolicyDimensions.map((r) => [r.dimensionId, r.weight])),
    thresholdSummary: "Per dimension bands plus three duration based source thresholds",
    signalDefinitions: "23 signals including validated learning reuse effectiveness",
    owner: "Learning Governance", approval: "Approved 2026-06-24",
    reason: "Learning effectiveness signal added",
  },
];

/* ======================================== deterministic scoring engine === */

export interface HealthControlDef {
  id: string;
  label: string;
  signalId: string;
  baseline: number;
  best: number;
  unit: "percent" | "business days";
  step: number;
  inverted?: boolean;
  effects: Partial<Record<DimId, number>>;
}

/** Deterministic planning levers. Effects are enterprise modelling assumptions, not inference. */
export const healthControls: HealthControlDef[] = [
  { id: "depValidation", label: "Critical Dependency Validation", signalId: "CHS 1003", baseline: 84, best: 100, unit: "percent", step: 1, effects: { "DIM DV": 7, "DIM DC": 0 } },
  { id: "coordOwnership", label: "Coordination Ownership", signalId: "CHS 1016", baseline: 82, best: 100, unit: "percent", step: 1, effects: { "DIM CTA": 4, "DIM RL": 2 } },
  { id: "decisionEvidence", label: "Decision Evidence Coverage", signalId: "CHS 1005", baseline: 91, best: 100, unit: "percent", step: 1, effects: { "DIM DC": 3 } },
  { id: "understandingTime", label: "Average Cross Team Understanding Time", signalId: "CHS 1006", baseline: 2.1, best: 0.5, unit: "business days", step: 0.1, inverted: true, effects: { "DIM RL": 9, "DIM CTA": 2 } },
  { id: "learningPublication", label: "Validated Learning Publication", signalId: "CHS 1023", baseline: 82, best: 100, unit: "percent", step: 1, effects: { "DIM LM": 4 } },
  { id: "personaFreshness", label: "Persona Evidence Freshness", signalId: "CHS 1009", baseline: 89, best: 100, unit: "percent", step: 1, effects: { "DIM IQ": 2, "DIM CTA": 0.5 } },
  { id: "crossTeamAck", label: "Cross Team Acknowledgement", signalId: "CHS 1004", baseline: 84, best: 100, unit: "percent", step: 1, effects: { "DIM CTA": 0.5 } },
];

export type HealthControls = Record<string, number>;

export const baselineControls: HealthControls = Object.fromEntries(
  healthControls.map((c) => [c.id, c.baseline]),
);

export const controlById = (id: string) => healthControls.find((c) => c.id === id);

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Fractional progress of a control from baseline to best, always 0..1. */
export const controlProgress = (c: HealthControlDef, value: number) => {
  const span = c.best - c.baseline;
  if (span === 0) return 0;
  return clamp((value - c.baseline) / span, 0, 1);
};

export const baselineDimensionScores: Record<string, number> =
  Object.fromEntries(dimensions.map((d) => [d.id, d.score]));

export interface HealthComputation {
  dimensionScores: Record<string, number>;
  echi: number;
  band: HealthBand;
  contributions: { dimensionId: string; score: number; weight: number; contribution: number }[];
}

/** Deterministic ECHI computation from dimension scores and a scoring policy. */
export function computeEchi(
  dimensionScores: Record<string, number>,
  policy: CognitiveHealthPolicy = currentPolicy,
): HealthComputation {
  const contributions = policy.dimensionPolicy.map((p) => {
    const score = dimensionScores[p.dimensionId] ?? 0;
    return {
      dimensionId: p.dimensionId, score, weight: p.weight,
      contribution: Number((score * p.weight).toFixed(2)),
    };
  });
  const raw = contributions.reduce((a, c) => a + c.contribution, 0);
  const echi = Math.round(raw);
  return { dimensionScores, echi, band: bandFor(echi), contributions };
}

/** Deterministic scenario projection. Estimate only — never presented as observed. */
export function scenarioComputation(
  controls: HealthControls,
  policy: CognitiveHealthPolicy = currentPolicy,
  base: Record<string, number> = baselineDimensionScores,
): HealthComputation {
  const scores: Record<string, number> = { ...base };
  for (const c of healthControls) {
    const p = controlProgress(c, controls[c.id] ?? c.baseline);
    for (const [dim, eff] of Object.entries(c.effects)) {
      scores[dim] = Number(((scores[dim] ?? 0) + p * (eff as number)).toFixed(2));
    }
  }
  for (const k of Object.keys(scores)) scores[k] = Math.round(clamp(scores[k], 0, 100));
  return computeEchi(scores, policy);
}

export const baselineComputation = computeEchi(baselineDimensionScores);

/* =============================================== critical override rule === */

export interface CriticalOverride {
  active: boolean;
  reason: string;
  signalIds: string[];
  affectedDecisionIds: string[];
}

/**
 * A high ECHI never hides a Critical signal. If a Critical signal touches an
 * active high priority decision the page must still surface an attention banner.
 */
export function criticalOverride(
  criticalSignalIds: string[],
  integrityViolations: number,
  exposures: CognitiveHealthDecisionExposure[],
): CriticalOverride {
  if (integrityViolations > 0) {
    return {
      active: true,
      reason: "Historical context integrity violation detected. Context Preservation is Critical regardless of the Enterprise Cognitive Health Index.",
      signalIds: ["CHS 1002", "CHS 1011"],
      affectedDecisionIds: exposures.map((e) => e.decisionId),
    };
  }
  const highExposure = exposures.filter((e) => e.exposureSeverity === "High" || e.exposureSeverity === "Critical");
  if (criticalSignalIds.length && highExposure.length) {
    return {
      active: true,
      reason: `${criticalSignalIds.length} Critical signals affect ${highExposure.length} active high priority enterprise decisions. The overall index remains above threshold but the Critical signals are not resolved.`,
      signalIds: criticalSignalIds,
      affectedDecisionIds: highExposure.map((e) => e.decisionId),
    };
  }
  return { active: false, reason: "", signalIds: [], affectedDecisionIds: [] };
}

/* ================================================= 4 · health reviews ==== */

export type HealthReviewStatus =
  | "Open" | "Assigned" | "Acknowledged" | "In Review" | "Intervention Created"
  | "Reassessment Requested" | "Accepted Risk" | "Escalated" | "Closed";

export type HealthSeverity = "Critical" | "High" | "Medium High" | "Medium" | "Low";

export const healthSeverities: HealthSeverity[] = ["Critical", "High", "Medium High", "Medium", "Low"];

export interface CognitiveHealthReview {
  id: string;
  signalId: string;
  dimensionId: string;
  scopeType: ScopeType;
  scopeId: string;
  issueType: string;
  severity: HealthSeverity;
  currentValue: string;
  targetValue: string;
  trend: number;
  affectedDecisionIds: string[];
  affectedPersonaIds: string[];
  owner: string;
  dueDate: string;
  status: HealthReviewStatus;
  decision: string;
  comments: string;
  createdAt: string;
  completedAt: string | null;
}

export const seedHealthReviews: CognitiveHealthReview[] = [
  {
    id: "CHR 7001", signalId: "CHS 1003", dimensionId: "DIM DV", scopeType: "Knowledge Domain",
    scopeId: "Identity & Access", issueType: "Critical Dependency Validation", severity: "Critical",
    currentValue: "84%", targetValue: "95%", trend: 2,
    affectedDecisionIds: ["DEC 5006", "DEC 5011"], affectedPersonaIds: ["Identity Engineering", "Payments Platform"],
    owner: "Identity Architecture", dueDate: "2026-08-11", status: "Open", decision: "", comments: "",
    createdAt: "2026-08-05 09:12", completedAt: null,
  },
  {
    id: "CHR 7002", signalId: "CHS 1016", dimensionId: "DIM CTA", scopeType: "Business Unit",
    scopeId: "Commerce Engineering", issueType: "Coordination Ownership", severity: "High",
    currentValue: "82%", targetValue: "95%", trend: 2,
    affectedDecisionIds: ["DEC 5001"], affectedPersonaIds: ["Checkout Engineering", "Customer Support Operations"],
    owner: "Commerce Architecture", dueDate: "2026-08-12", status: "Open",
    decision: "", comments: "Four open coordination actions remain unowned", createdAt: "2026-08-05 10:41", completedAt: null,
  },
  {
    id: "CHR 7003", signalId: "CHS 1005", dimensionId: "DIM DC", scopeType: "Business Unit",
    scopeId: "Platform Engineering", issueType: "Decision Evidence Sufficiency", severity: "High",
    currentValue: "79%", targetValue: "92%", trend: -1,
    affectedDecisionIds: ["DEC 5003"], affectedPersonaIds: ["Identity Engineering", "Release Governance"],
    owner: "Platform Architecture", dueDate: "2026-08-10", status: "Open", decision: "", comments: "",
    createdAt: "2026-08-04 16:08", completedAt: null,
  },
  {
    id: "CHR 7004", signalId: "CHS 1023", dimensionId: "DIM LM", scopeType: "Enterprise",
    scopeId: "Enterprise", issueType: "Learning Publication Backlog", severity: "Medium High",
    currentValue: "18 records", targetValue: "Under 5", trend: 2,
    affectedDecisionIds: [], affectedPersonaIds: ["Payments Platform", "Site Reliability Engineering"],
    owner: "Commerce Reliability Governance", dueDate: "2026-08-18", status: "Open", decision: "", comments: "",
    createdAt: "2026-08-03 11:22", completedAt: null,
  },
  {
    id: "CHR 7005", signalId: "CHS 1009", dimensionId: "DIM IQ", scopeType: "Team Persona",
    scopeId: "Customer Support Operations", issueType: "Persona Evidence Freshness", severity: "Medium",
    currentValue: "78%", targetValue: "92%", trend: -3,
    affectedDecisionIds: ["DEC 5011"], affectedPersonaIds: ["Customer Support Operations"],
    owner: "Customer Support Operations", dueDate: "2026-08-20", status: "Open", decision: "", comments: "",
    createdAt: "2026-08-02 08:55", completedAt: null,
  },
];

/** The queue summary is a governed figure, larger than the seeded working set. */
export const reviewQueueSummary = { open: 24, critical: 4, high: 8, medium: 9, low: 3 };

export const reviewActions = [
  "Open Review", "Assign Owner", "Create Intervention", "Request Reassessment",
  "Acknowledge", "Escalate", "Mark Accepted Risk",
] as const;
export type ReviewAction = (typeof reviewActions)[number];

export const reviewDecisions = [
  "Create Intervention", "Request Data Refresh", "Request Persona Refresh",
  "Request Dependency Validation", "Request Learning Publication", "Assign Coordination Owner",
  "Request Evidence", "Accept Temporary Risk", "Escalate", "Dismiss Signal as Invalid",
] as const;
export type ReviewDecisionType = (typeof reviewDecisions)[number];

/** Governance requires a written rationale for judgement calls that reduce visibility. */
export const reviewCommentRequired = (d: string) =>
  d === "Accept Temporary Risk" || d === "Dismiss Signal as Invalid"
  || d === "Threshold Override" || d === "Cancel Intervention";

/* ==================================================== 6 · health alerts == */

export const alertTypes = [
  "Dimension Entered Attention State", "Dimension Entered At Risk", "Dimension Entered Critical",
  "Material Deterioration", "Critical Signal Detected", "Decision Exposure Increased",
  "Dependency Visibility Degraded", "Cross Team Awareness Degraded", "Response Latency Exceeded Target",
  "Decision Confidence Degraded", "Learning Backlog Increased", "Historical Context Integrity Violation",
] as const;
export type HealthAlertType = (typeof alertTypes)[number];

export type HealthAlertStatus = "Open" | "Acknowledged" | "Assigned" | "Intervention Created" | "Muted";

export interface CognitiveHealthAlert {
  id: string;
  signalId: string;
  dimensionId: string;
  scopeType: ScopeType;
  scopeId: string;
  alertType: HealthAlertType;
  severity: HealthSeverity;
  currentValue: string;
  threshold: string;
  affectedDecisionIds: string[];
  owner: string;
  status: HealthAlertStatus;
  triggeredAt: string;
  acknowledgedAt: string | null;
}

export const seedHealthAlerts: CognitiveHealthAlert[] = [
  { id: "CHA 8001", signalId: "CHS 1003", dimensionId: "DIM DV", scopeType: "Knowledge Domain", scopeId: "Identity & Access", alertType: "Dependency Visibility Degraded", severity: "Critical", currentValue: "84%", threshold: "95%", affectedDecisionIds: ["DEC 5006", "DEC 5011"], owner: "Identity Architecture", status: "Open", triggeredAt: "2026-08-06 09:41", acknowledgedAt: null },
  { id: "CHA 8002", signalId: "CHS 1006", dimensionId: "DIM RL", scopeType: "Enterprise", scopeId: "Enterprise", alertType: "Response Latency Exceeded Target", severity: "High", currentValue: "2.1 business days", threshold: "< 1 business day", affectedDecisionIds: ["DEC 5011"], owner: "Coordination Governance", status: "Open", triggeredAt: "2026-08-06 08:12", acknowledgedAt: null },
  { id: "CHA 8003", signalId: "CHS 1016", dimensionId: "DIM CTA", scopeType: "Business Unit", scopeId: "Commerce Engineering", alertType: "Cross Team Awareness Degraded", severity: "High", currentValue: "82%", threshold: "95%", affectedDecisionIds: ["DEC 5001"], owner: "Commerce Architecture", status: "Acknowledged", triggeredAt: "2026-08-05 15:30", acknowledgedAt: "2026-08-05 16:02" },
  { id: "CHA 8004", signalId: "CHS 1005", dimensionId: "DIM DC", scopeType: "Business Unit", scopeId: "Platform Engineering", alertType: "Decision Confidence Degraded", severity: "High", currentValue: "79%", threshold: "92%", affectedDecisionIds: ["DEC 5003"], owner: "Platform Architecture", status: "Open", triggeredAt: "2026-08-05 12:18", acknowledgedAt: null },
  { id: "CHA 8005", signalId: "CHS 1023", dimensionId: "DIM LM", scopeType: "Enterprise", scopeId: "Enterprise", alertType: "Learning Backlog Increased", severity: "Medium High", currentValue: "18 records", threshold: "Under 5", affectedDecisionIds: [], owner: "Learning Governance", status: "Assigned", triggeredAt: "2026-08-04 10:04", acknowledgedAt: "2026-08-04 10:40" },
  { id: "CHA 8006", signalId: "CHS 1009", dimensionId: "DIM IQ", scopeType: "Team Persona", scopeId: "Customer Support Operations", alertType: "Material Deterioration", severity: "Medium", currentValue: "78%", threshold: "92%", affectedDecisionIds: ["DEC 5011"], owner: "Customer Support Operations", status: "Open", triggeredAt: "2026-08-03 14:47", acknowledgedAt: null },
];

/** Healthy seeded enterprise state. Any value above zero is a Critical event. */
export const seedIntegrityViolations = 0;

export const integrityAlert = (count: number): CognitiveHealthAlert => ({
  id: "CHA 8900", signalId: "CHS 1002", dimensionId: "DIM CP", scopeType: "Enterprise", scopeId: "Enterprise",
  alertType: "Historical Context Integrity Violation", severity: "Critical",
  currentValue: `${count} violations`, threshold: "0 violations",
  affectedDecisionIds: ["DEC 5003", "DEC 5006", "DEC 5011"], owner: "Memory Governance",
  status: "Open", triggeredAt: "2026-08-07 00:04", acknowledgedAt: null,
});

/* =========================================== 7-9 · health interventions == */

export type InterventionStatus =
  | "Proposed" | "Assigned" | "Acknowledged" | "In Progress" | "Evidence Required" | "Blocked"
  | "Measurement Window" | "Successful" | "Partially Successful" | "No Material Improvement"
  | "Cancelled" | "Escalated";

export const interventionStatuses: InterventionStatus[] = [
  "Proposed", "Assigned", "Acknowledged", "In Progress", "Evidence Required", "Blocked",
  "Measurement Window", "Successful", "Partially Successful", "No Material Improvement",
  "Cancelled", "Escalated",
];

export const requiredActionTypes = [
  "Persona Refresh", "Dependency Validation", "Evidence Cleanup", "Conflict Resolution",
  "Coordination Ownership", "Learning Publication", "Decision Review", "Context Refresh", "Other",
] as const;
export type RequiredActionType = (typeof requiredActionTypes)[number];

export const measurementWindows = ["7 Days", "14 Days", "30 Days", "Quarter"] as const;

export interface CognitiveHealthIntervention {
  id: string;
  title: string;
  description: string;
  signalIds: string[];
  dimensionIds: string[];
  scopeType: ScopeType;
  scopeId: string;
  owner: string;
  participantIds: string[];
  baselineValues: Record<string, number>;
  targetValues: Record<string, number>;
  expectedHealthEffect: string;
  expectedEffectConfidence: number;
  measurementWindow: string;
  requiredActionTypes: RequiredActionType[];
  evidenceRequirementIds: string[];
  affectedDecisionIds: string[];
  status: InterventionStatus;
  dueDate: string;
  createdAt: string;
  completedAt: string | null;
  successSignal: string;
  dependencies: string[];
}

export const seedInterventions: CognitiveHealthIntervention[] = [
  {
    id: "CHI 9001", title: "Validate Identity Critical Dependencies",
    description: "Revalidate every critical dependency relationship in the Identity and Access domain against current evidence, then re-publish the validated relationships to Enterprise Cognitive Memory.",
    signalIds: ["CHS 1003"], dimensionIds: ["DIM DV"], scopeType: "Knowledge Domain", scopeId: "Identity & Access",
    owner: "Identity Architecture", participantIds: ["Identity Engineering", "Payments Platform", "Checkout Engineering", "Site Reliability Engineering"],
    baselineValues: { "CHS 1003": 84 }, targetValues: { "CHS 1003": 95 },
    expectedHealthEffect: "Dependency Visibility +4 to +6", expectedEffectConfidence: 88,
    measurementWindow: "30 Days", requiredActionTypes: ["Dependency Validation", "Evidence Cleanup"],
    evidenceRequirementIds: ["EVR 4401", "EVR 4402"], affectedDecisionIds: ["DEC 5006", "DEC 5011"],
    status: "In Progress", dueDate: "2026-08-21", createdAt: "2026-07-24", completedAt: null,
    successSignal: "Critical Dependency Validation at or above 95%",
    dependencies: ["Identity evidence refresh window", "Memory publication slot"],
  },
  {
    id: "CHI 9002", title: "Assign Open Commerce Coordination Ownership",
    description: "Assign a confirmed accountable owner to every open coordination action in the Commerce Engineering portfolio and record acknowledgement.",
    signalIds: ["CHS 1016"], dimensionIds: ["DIM CTA"], scopeType: "Business Unit", scopeId: "Commerce Engineering",
    owner: "Commerce Architecture", participantIds: ["Checkout Engineering", "Payments Platform", "Customer Support Operations"],
    baselineValues: { "CHS 1016": 82 }, targetValues: { "CHS 1016": 95 },
    expectedHealthEffect: "Cross Team Awareness +2 to +4", expectedEffectConfidence: 84,
    measurementWindow: "14 Days", requiredActionTypes: ["Coordination Ownership", "Conflict Resolution"],
    evidenceRequirementIds: ["EVR 4410"], affectedDecisionIds: ["DEC 5001"],
    status: "Assigned", dueDate: "2026-08-12", createdAt: "2026-08-01", completedAt: null,
    successSignal: "Coordination Ownership at or above 95%", dependencies: [],
  },
  {
    id: "CHI 9003", title: "Publish Approved Retry Learning Backlog",
    description: "Publish the approved retry reliability learning records into Enterprise Cognitive Memory so future decisions retrieve them automatically.",
    signalIds: ["CHS 1023"], dimensionIds: ["DIM LM"], scopeType: "Enterprise", scopeId: "Enterprise",
    owner: "Commerce Reliability Governance", participantIds: ["Payments Platform", "Site Reliability Engineering"],
    baselineValues: { "CHS 1023": 18 }, targetValues: { "CHS 1023": 5 },
    expectedHealthEffect: "Learning Maturity +2", expectedEffectConfidence: 90,
    measurementWindow: "14 Days", requiredActionTypes: ["Learning Publication"],
    evidenceRequirementIds: ["EVR 4420"], affectedDecisionIds: [],
    status: "In Progress", dueDate: "2026-08-15", createdAt: "2026-07-30", completedAt: null,
    successSignal: "Pending validated learning records below 5", dependencies: [],
  },
  {
    id: "CHI 9004", title: "Refresh Customer Support Persona Evidence",
    description: "Refresh the evidence set behind the Customer Support Operations Team Persona and re-validate authority on stale records.",
    signalIds: ["CHS 1009", "CHS 1004"], dimensionIds: ["DIM IQ", "DIM CTA"], scopeType: "Team Persona",
    scopeId: "Customer Support Operations", owner: "Customer Support Operations",
    participantIds: ["Customer Support Operations", "Information Governance"],
    baselineValues: { "CHS 1009": 89 }, targetValues: { "CHS 1009": 96 },
    expectedHealthEffect: "Information Quality +1 to +2, Cross Team Awareness +1", expectedEffectConfidence: 79,
    measurementWindow: "30 Days", requiredActionTypes: ["Persona Refresh", "Evidence Cleanup"],
    evidenceRequirementIds: ["EVR 4430"], affectedDecisionIds: ["DEC 5011"],
    status: "Evidence Required", dueDate: "2026-08-25", createdAt: "2026-08-02", completedAt: null,
    successSignal: "Persona evidence freshness at or above 96%", dependencies: ["Support knowledge base export"],
  },
  {
    id: "CHI 9005", title: "Improve Regional Token Vault Decision Evidence",
    description: "Close the evidence gaps behind the Regional Token Vault migration decision before the decision is executed.",
    signalIds: ["CHS 1005"], dimensionIds: ["DIM DC"], scopeType: "Decision Portfolio", scopeId: "Platform Engineering",
    owner: "Platform Architecture", participantIds: ["Identity Engineering", "Release Governance"],
    baselineValues: { "CHS 1005": 79 }, targetValues: { "CHS 1005": 92 },
    expectedHealthEffect: "Decision Confidence +2 to +3", expectedEffectConfidence: 82,
    measurementWindow: "14 Days", requiredActionTypes: ["Decision Review", "Evidence Cleanup"],
    evidenceRequirementIds: ["EVR 4440"], affectedDecisionIds: ["DEC 5003"],
    status: "Proposed", dueDate: "2026-08-14", createdAt: "2026-08-04", completedAt: null,
    successSignal: "Decision evidence coverage at or above 92%", dependencies: [],
  },
];

export const interventionSummary = { active: 18, dueThisWeek: 5 };

/* ============================================ 10 · intervention effect === */

export interface CognitiveHealthInterventionMeasurement {
  id: string;
  interventionId: string;
  baseline: number;
  target: number;
  current: number;
  observedChange: number;
  associatedDimensionChanges: { dimensionId: string; from: number; to: number }[];
  concurrentContributorIds: string[];
  concurrentContributors: string[];
  confidence: number;
  measurementStart: string;
  measurementEnd: string;
  status: InterventionStatus;
  remainingIssue: string;
}

export const seedMeasurements: CognitiveHealthInterventionMeasurement[] = [
  {
    id: "CHM 1", interventionId: "CHI 9001", baseline: 84, target: 95, current: 91, observedChange: 7,
    associatedDimensionChanges: [{ dimensionId: "DIM DV", from: 84, to: 87 }],
    concurrentContributorIds: ["CTR 05", "CTR 06"],
    concurrentContributors: [
      "Enterprise Cognitive Memory relationship refresh completed in the same window",
      "Cross Team Impact Analysis adoption increased in Commerce",
    ],
    confidence: 86, measurementStart: "2026-07-24", measurementEnd: "2026-08-23",
    status: "Partially Successful",
    remainingIssue: "Four relationships still lack fresh evidence",
  },
  {
    id: "CHM 2", interventionId: "CHI 9002", baseline: 82, target: 95, current: 86, observedChange: 4,
    associatedDimensionChanges: [{ dimensionId: "DIM CTA", from: 81, to: 82 }],
    concurrentContributorIds: ["CTR 07"],
    concurrentContributors: ["Persona coverage improvement in the same period"],
    confidence: 78, measurementStart: "2026-08-01", measurementEnd: "2026-08-15",
    status: "Measurement Window", remainingIssue: "Two coordination actions remain unowned",
  },
  {
    id: "CHM 3", interventionId: "CHI 9003", baseline: 21, target: 5, current: 18, observedChange: -3,
    associatedDimensionChanges: [{ dimensionId: "DIM LM", from: 86, to: 86 }],
    concurrentContributorIds: [],
    concurrentContributors: ["Learning validation throughput unchanged"],
    confidence: 74, measurementStart: "2026-07-30", measurementEnd: "2026-08-13",
    status: "No Material Improvement", remainingIssue: "Publication approval queue is the binding constraint",
  },
];

/** Association is not causality. Every measurement carries this framing. */
export const causalityDisclaimer =
  "Observed Health Change Associated with Intervention. Concurrent contributing changes are listed and causality is not asserted.";

/* ==================================== 12 · scenarios and comparison ====== */

export interface CognitiveHealthScenario {
  id: string;
  name: string;
  description: string;
  signalOverrides: HealthControls;
  baselineSnapshotId: string;
  scenarioDimensionScores: Record<string, number>;
  scenarioEchi: number;
  affectedScopeIds: string[];
  estimatedEffort: string;
  decisionBenefitIds: string[];
  riskNotes: string;
  createdAt: string;
}

const scenarioOf = (
  id: string, name: string, description: string, overrides: Partial<HealthControls>,
  effort: string, scopes: string[], decisions: string[], risk: string,
): CognitiveHealthScenario => {
  const signalOverrides = { ...baselineControls, ...overrides };
  const c = scenarioComputation(signalOverrides);
  return {
    id, name, description, signalOverrides, baselineSnapshotId: "ECHS 4410",
    scenarioDimensionScores: c.dimensionScores, scenarioEchi: c.echi,
    affectedScopeIds: scopes, estimatedEffort: effort, decisionBenefitIds: decisions,
    riskNotes: risk, createdAt: "2026-08-06",
  };
};

export const seedScenarios: CognitiveHealthScenario[] = [
  scenarioOf("CHSC 0", "Current", "Measured enterprise state with no modelled improvement", {},
    "None", ["Enterprise"], [], "No change. Existing exposure persists."),
  scenarioOf("CHSC A", "Dependency Validation Focus",
    "Validate every critical dependency relationship and refresh the supporting evidence",
    { depValidation: 100, crossTeamAck: 92 },
    "6 team weeks", ["Identity & Access", "Commerce Engineering"], ["DEC 5006", "DEC 5011"],
    "Validation work competes with the Regional Token Vault migration window."),
  scenarioOf("CHSC B", "Coordination Speed Focus",
    "Assign coordination ownership and reduce cross team understanding time",
    { coordOwnership: 100, understandingTime: 0.9, crossTeamAck: 95 },
    "9 team weeks", ["Commerce Engineering", "Customer Support Operations"], ["DEC 5001", "DEC 5011"],
    "Faster acknowledgement can hide unresolved dependency uncertainty if pursued alone."),
  scenarioOf("CHSC C", "Learning and Evidence Focus",
    "Clear the learning publication backlog and refresh persona evidence",
    { learningPublication: 100, personaFreshness: 98, decisionEvidence: 97 },
    "5 team weeks", ["Enterprise", "Customer Support Operations"], ["DEC 5003"],
    "Improves reuse and decision confidence but leaves dependency blind spots unchanged."),
];

export const scenarioComparisonRows = [
  "ECHI", "Information Quality", "Context Preservation", "Dependency Visibility",
  "Cross Team Awareness", "Decision Confidence", "Response Latency", "Learning Maturity",
  "Estimated Effort", "Teams Involved", "Decisions Benefiting", "Risks",
] as const;

export const scenarioNoRecommendation =
  "Scenario Estimate · Not Observed Result. The highest index is not automatically the recommended plan. Effort, risk and decision exposure must be weighed alongside score movement.";

/* ============================================== 13 · sensitivity ========= */

export type SensitivityLevel = "High" | "Medium High" | "Medium" | "Low";

export interface CognitiveHealthSensitivity {
  id: string;
  signalId: string;
  dimensionId: string;
  currentValue: string;
  targetValue: string;
  sensitivity: SensitivityLevel;
  echiDelta: number;
  affectedScopeIds: string[];
  affectedDecisionIds: string[];
  confidence: number;
}

/** Deterministic: move a single control to its best value and measure index movement. */
export function sensitivityAnalysis(policy: CognitiveHealthPolicy = currentPolicy): CognitiveHealthSensitivity[] {
  const base = computeEchi(baselineDimensionScores, policy).echi;
  return healthControls.map((c, i) => {
    const overrides = { ...baselineControls, [c.id]: c.best };
    const s = scenarioComputation(overrides, policy);
    const delta = Number((s.echi - base).toFixed(1));
    const sig = signalById(c.signalId);
    const level: SensitivityLevel = delta >= 1.5 ? "High" : delta >= 1 ? "Medium High" : delta >= 0.5 ? "Medium" : "Low";
    return {
      id: `CHSN ${i + 1}`, signalId: c.signalId, dimensionId: sig?.dimensionId ?? "DIM CTA",
      currentValue: sig?.currentValue ?? String(c.baseline), targetValue: sig?.targetValue ?? String(c.best),
      sensitivity: level, echiDelta: delta,
      affectedScopeIds: sig ? [sig.scopeId] : ["Enterprise"],
      affectedDecisionIds: sig?.affectedDecisionIds ?? [], confidence: sig?.confidence ?? 88,
    };
  }).sort((a, b) => b.echiDelta - a.echiDelta);
}

export const sensitivityDisclaimer =
  "Sensitivity prioritises attention. It measures modelled index movement, not proven causality.";

/* =============================================== 14 · trend projection === */

export type ProjectionHorizon = "30 Days" | "Quarter" | "Six Months";
export const projectionHorizons: ProjectionHorizon[] = ["30 Days", "Quarter", "Six Months"];

export type ProjectionType = "Current Trend Continuation" | "Target Trajectory" | "Intervention Scenario";
export const projectionTypes: ProjectionType[] = [
  "Current Trend Continuation", "Target Trajectory", "Intervention Scenario",
];

export interface CognitiveHealthProjection {
  id: string;
  baselineSnapshotId: string;
  timeHorizon: ProjectionHorizon;
  projectionType: ProjectionType;
  projectedEchi: number;
  projectedDimensionScores: Record<string, number>;
  assumptions: string[];
  selectedInterventionIds: string[];
  confidence: number;
  createdAt: string;
}

const horizonFactor: Record<ProjectionHorizon, number> = {
  "30 Days": 0.5, Quarter: 1, "Six Months": 1.6,
};

/** Deterministic trend continuation. Illustrative only. */
export function projectHealth(
  horizon: ProjectionHorizon,
  type: ProjectionType,
  interventionIds: string[],
  controls: HealthControls,
  policy: CognitiveHealthPolicy = currentPolicy,
): CognitiveHealthProjection {
  const f = horizonFactor[horizon];
  const base = computeEchi(baselineDimensionScores, policy);
  let scores: Record<string, number> = {};
  let confidence = 82;

  if (type === "Current Trend Continuation") {
    scores = Object.fromEntries(dimensions.map((d) => [d.id, Math.round(clamp(d.score + d.trend * 0.4 * f, 0, 100))]));
    confidence = 80;
  } else if (type === "Target Trajectory") {
    scores = Object.fromEntries(dimensions.map((d) => [d.id, Math.round(clamp(d.score + (d.target - d.score) * Math.min(1, f), 0, 100))]));
    confidence = 68;
  } else {
    const scenario = scenarioComputation(controls, policy);
    scores = Object.fromEntries(Object.entries(scenario.dimensionScores).map(([k, v]) => {
      const b = baselineDimensionScores[k] ?? v;
      return [k, Math.round(clamp(b + (v - b) * Math.min(1, f), 0, 100))];
    }));
    confidence = interventionIds.length ? 76 : 70;
  }

  const c = computeEchi(scores, policy);
  return {
    id: `CHPR ${horizon.replace(/\s/g, "")}-${type.slice(0, 3)}`,
    baselineSnapshotId: "ECHS 4410", timeHorizon: horizon, projectionType: type,
    projectedEchi: c.echi, projectedDimensionScores: scores,
    assumptions: [
      `Baseline Enterprise Cognitive Health Index ${base.echi}`,
      "Current signal stability is assumed to persist across the horizon",
      "No new enterprise programme is assumed to be introduced",
      type === "Intervention Scenario" ? `${interventionIds.length} selected interventions complete inside their measurement window` : "No additional intervention effect is assumed",
    ],
    selectedInterventionIds: interventionIds, confidence, createdAt: "2026-08-06",
  };
}

export const projectionDisclaimer =
  "Illustrative Projection Based on Current Trend. This is not a forecast guarantee and is not predictive artificial intelligence.";

/* ============================================ 15 · decision exposure ===== */

export type ExposureSeverity = "Critical" | "High" | "Medium High" | "Medium" | "Low";

export interface CognitiveHealthDecisionExposure {
  id: string;
  decisionId: string;
  decision: string;
  decisionOwner: string;
  decisionState: string;
  healthSnapshotId: string;
  affectedDimensionIds: string[];
  criticalSignalIds: string[];
  healthScore: number;
  evidenceCoverage: number;
  dependencyCoverage: number;
  crossTeamAwareness: number;
  decisionConfidence: number;
  exposureSeverity: ExposureSeverity;
  recommendedAction: string;
  status: "Open" | "Acknowledged" | "Intervention Created" | "Reassessment Requested" | "Accepted Risk";
}

export const seedExposures: CognitiveHealthDecisionExposure[] = [
  {
    id: "CHE 1", decisionId: "DEC 5003", decision: "Regional Token Vault Migration",
    decisionOwner: "Platform Architecture", decisionState: "Awaiting Approval", healthSnapshotId: "ECHS 4410",
    affectedDimensionIds: ["DIM DV", "DIM DC"], criticalSignalIds: ["CHS 1003"],
    healthScore: 76, evidenceCoverage: 79, dependencyCoverage: 76, crossTeamAwareness: 84, decisionConfidence: 79,
    exposureSeverity: "High",
    recommendedAction: "Validate Identity dependencies and close decision evidence gaps before approval",
    status: "Open",
  },
  {
    id: "CHE 2", decisionId: "DEC 5001", decision: "Checkout Retry Expansion",
    decisionOwner: "Commerce Architecture", decisionState: "In Review", healthSnapshotId: "ECHS 4410",
    affectedDimensionIds: ["DIM CTA"], criticalSignalIds: [],
    healthScore: 81, evidenceCoverage: 93, dependencyCoverage: 88, crossTeamAwareness: 81, decisionConfidence: 89,
    exposureSeverity: "Medium",
    recommendedAction: "Assign the four open coordination owners before the review closes",
    status: "Open",
  },
  {
    id: "CHE 3", decisionId: "DEC 5006", decision: "Identity Cache Optimization",
    decisionOwner: "Identity Architecture", decisionState: "In Analysis", healthSnapshotId: "ECHS 4410",
    affectedDimensionIds: ["DIM DV"], criticalSignalIds: ["CHS 1003"],
    healthScore: 80, evidenceCoverage: 88, dependencyCoverage: 80, crossTeamAwareness: 86, decisionConfidence: 87,
    exposureSeverity: "Medium High",
    recommendedAction: "Request dependency revalidation before the alternative set is frozen",
    status: "Open",
  },
  {
    id: "CHE 4", decisionId: "DEC 5011", decision: "Support Escalation Routing Change",
    decisionOwner: "Customer Support Operations", decisionState: "In Analysis", healthSnapshotId: "ECHS 4410",
    affectedDimensionIds: ["DIM CTA", "DIM RL", "DIM IQ"], criticalSignalIds: ["CHS 1006"],
    healthScore: 79, evidenceCoverage: 78, dependencyCoverage: 84, crossTeamAwareness: 68, decisionConfidence: 84,
    exposureSeverity: "Medium High",
    recommendedAction: "Refresh Customer Support persona evidence and shorten acknowledgement time",
    status: "Open",
  },
];

export const exposureActions = ["Open Decision", "Open Health Workbench", "Create Intervention", "Request Reassessment"] as const;

/* ================================================ 16 · reassessment ====== */

export const reassessmentTriggers = [
  "Critical dependency confidence changed", "Persona freshness degraded", "Authority conflict appeared",
  "Decision evidence quality degraded", "Learning materially changed future guidance",
  "Cross team coordination ownership became unresolved", "Historical context integrity issue",
] as const;
export type ReassessmentTrigger = (typeof reassessmentTriggers)[number];

export interface CognitiveHealthReassessment {
  id: string;
  triggerType: ReassessmentTrigger;
  triggerRecordId: string;
  affectedIntakeIds: string[];
  affectedPersonaImpactIds: string[];
  affectedCrossTeamAnalysisIds: string[];
  affectedDecisionIds: string[];
  recommendedAction: string;
  owner: string;
  status: "Pending" | "Requested" | "No Reassessment Required" | "Escalated" | "Complete";
  createdAt: string;
  completedAt: string | null;
}

export const seedReassessments: CognitiveHealthReassessment[] = [
  {
    id: "CHRA 1", triggerType: "Critical dependency confidence changed", triggerRecordId: "CHS 1003",
    affectedIntakeIds: ["CIN 2204", "CIN 2211"], affectedPersonaImpactIds: ["PIA 3301"],
    affectedCrossTeamAnalysisIds: ["CTA 4402"], affectedDecisionIds: ["DEC 5006", "DEC 5011"],
    recommendedAction: "Recheck the Identity dependency assumptions in the two open evaluations",
    owner: "Identity Architecture", status: "Pending", createdAt: "2026-08-06 09:44", completedAt: null,
  },
  {
    id: "CHRA 2", triggerType: "Persona freshness degraded", triggerRecordId: "CHS 1009",
    affectedIntakeIds: ["CIN 2219"], affectedPersonaImpactIds: ["PIA 3308"],
    affectedCrossTeamAnalysisIds: [], affectedDecisionIds: ["DEC 5011"],
    recommendedAction: "Refresh Customer Support persona evidence then recheck the impact evaluation",
    owner: "Customer Support Operations", status: "Pending", createdAt: "2026-08-05 14:22", completedAt: null,
  },
  {
    id: "CHRA 3", triggerType: "Cross team coordination ownership became unresolved", triggerRecordId: "CHS 1016",
    affectedIntakeIds: [], affectedPersonaImpactIds: [], affectedCrossTeamAnalysisIds: ["CTA 4407"],
    affectedDecisionIds: ["DEC 5001"],
    recommendedAction: "Confirm ownership before the cross team analysis is used for the decision",
    owner: "Commerce Architecture", status: "Requested", createdAt: "2026-08-04 11:05", completedAt: null,
  },
  {
    id: "CHRA 4", triggerType: "Learning materially changed future guidance", triggerRecordId: "CHS 1007",
    affectedIntakeIds: ["CIN 2230"], affectedPersonaImpactIds: [], affectedCrossTeamAnalysisIds: [],
    affectedDecisionIds: [], recommendedAction: "Acknowledge that no reassessment is required for closed decisions",
    owner: "Learning Governance", status: "No Reassessment Required", createdAt: "2026-08-02 10:12", completedAt: "2026-08-02 15:30",
  },
];

export const reassessmentSafety =
  "Reassessment never rewrites or invalidates a recorded decision. It recommends a recheck of active evaluations only.";

/* ============================ 17-18 · snapshot history and comparison ==== */

export interface HealthSnapshotRecord {
  id: string;
  label: string;
  timestamp: string;
  echi: number;
  dimensionScores: Record<string, number>;
  signalValues: Record<string, number>;
  thresholdPolicyVersion: string;
  scoringPolicyVersion: string;
  scopeType: ScopeType;
  scopeId: string;
  confidence: number;
  criticalSignalIds: string[];
  decisionExposureIds: string[];
  interventionsActive: number;
}

const snap = (
  id: string, label: string, timestamp: string, scores: Record<string, number>,
  thresholdV: string, scoringV: string, confidence: number,
  criticalSignalIds: string[], exposures: string[], interventionsActive: number,
): HealthSnapshotRecord => ({
  id, label, timestamp, echi: computeEchi(scores).echi, dimensionScores: scores,
  signalValues: {
    "CHS 1003": scores["DIM DV"] ?? 0, "CHS 1016": scores["DIM CTA"] ?? 0,
    "CHS 1005": scores["DIM DC"] ?? 0, "CHS 1023": scores["DIM LM"] ?? 0,
  },
  thresholdPolicyVersion: thresholdV, scoringPolicyVersion: scoringV,
  scopeType: "Enterprise", scopeId: "Enterprise", confidence,
  criticalSignalIds, decisionExposureIds: exposures, interventionsActive,
});

export const snapshotHistory: HealthSnapshotRecord[] = [
  snap("ECHS 4410", "Current", "2026-08-06 21:40",
    { "DIM IQ": 92, "DIM CP": 96, "DIM DV": 84, "DIM CTA": 81, "DIM DC": 89, "DIM RL": 78, "DIM LM": 86 },
    "v1.2", "v1.2", 94, ["CHS 1003", "CHS 1006"], ["CHE 1", "CHE 2", "CHE 3", "CHE 4"], 18),
  snap("ECHS 4386", "Prior Week", "2026-07-30 21:40",
    { "DIM IQ": 90, "DIM CP": 96, "DIM DV": 83, "DIM CTA": 78, "DIM DC": 88, "DIM RL": 74, "DIM LM": 84 },
    "v1.2", "v1.2", 93, ["CHS 1003", "CHS 1006", "CHS 1017"], ["CHE 1", "CHE 2", "CHE 3", "CHE 4"], 16),
  snap("ECHS 4302", "Prior Month", "2026-07-06 21:40",
    { "DIM IQ": 88, "DIM CP": 95, "DIM DV": 82, "DIM CTA": 76, "DIM DC": 87, "DIM RL": 72, "DIM LM": 82 },
    "v1.1", "v1.1", 91, ["CHS 1003", "CHS 1006", "CHS 1017", "CHS 1022"], ["CHE 1", "CHE 3", "CHE 4"], 12),
  snap("ECHS 4110", "Prior Quarter", "2026-05-06 21:40",
    { "DIM IQ": 84, "DIM CP": 93, "DIM DV": 79, "DIM CTA": 70, "DIM DC": 84, "DIM RL": 64, "DIM LM": 76 },
    "v1.1", "v1.1", 88, ["CHS 1003", "CHS 1006", "CHS 1017", "CHS 1022", "CHS 1021"], ["CHE 1", "CHE 3"], 9),
];

export const snapshotById = (id: string) => snapshotHistory.find((s) => s.id === id) ?? snapshotHistory[0];

export type ComparisonMode = "As Measured at the Time" | "Normalized to Current Scoring Policy";
export const comparisonModes: ComparisonMode[] = ["As Measured at the Time", "Normalized to Current Scoring Policy"];

export type DiffState = "Improved" | "Deteriorated" | "Unchanged" | "New Signal" | "Resolved Signal";

export interface SnapshotDiffRow {
  field: string;
  left: string;
  right: string;
  state: DiffState;
}

/**
 * Historical snapshots are never rewritten. Normalized mode recomputes a
 * comparison view under the current policy without touching the stored record.
 */
export function snapshotEchi(s: HealthSnapshotRecord, mode: ComparisonMode): number {
  return mode === "As Measured at the Time" ? s.echi : computeEchi(s.dimensionScores, currentPolicy).echi;
}

export function compareSnapshots(
  a: HealthSnapshotRecord, b: HealthSnapshotRecord, mode: ComparisonMode,
): SnapshotDiffRow[] {
  const state = (l: number, r: number): DiffState => (r > l ? "Improved" : r < l ? "Deteriorated" : "Unchanged");
  const rows: SnapshotDiffRow[] = [
    { field: "ECHI", left: String(snapshotEchi(a, mode)), right: String(snapshotEchi(b, mode)), state: state(snapshotEchi(a, mode), snapshotEchi(b, mode)) },
  ];
  for (const d of dimensions) {
    const l = a.dimensionScores[d.id] ?? 0;
    const r = b.dimensionScores[d.id] ?? 0;
    rows.push({ field: d.name, left: String(l), right: String(r), state: state(l, r) });
  }
  const leftCrit = new Set(a.criticalSignalIds);
  const rightCrit = new Set(b.criticalSignalIds);
  for (const id of new Set([...leftCrit, ...rightCrit])) {
    if (leftCrit.has(id) && !rightCrit.has(id)) rows.push({ field: `Critical · ${signalName(id)}`, left: "Critical", right: "Resolved", state: "Resolved Signal" });
    else if (!leftCrit.has(id) && rightCrit.has(id)) rows.push({ field: `Critical · ${signalName(id)}`, left: "Not present", right: "Critical", state: "New Signal" });
  }
  rows.push({
    field: "Decision Exposure", left: String(a.decisionExposureIds.length), right: String(b.decisionExposureIds.length),
    state: state(-a.decisionExposureIds.length, -b.decisionExposureIds.length),
  });
  rows.push({
    field: "Interventions Active", left: String(a.interventionsActive), right: String(b.interventionsActive),
    state: state(a.interventionsActive, b.interventionsActive),
  });
  rows.push({
    field: "Scoring Policy", left: a.scoringPolicyVersion,
    right: mode === "As Measured at the Time" ? b.scoringPolicyVersion : `${b.scoringPolicyVersion} normalized to ${currentPolicy.version}`,
    state: a.scoringPolicyVersion === b.scoringPolicyVersion ? "Unchanged" : "Improved",
  });
  return rows;
}

/* =================================================== 20 · governance ===== */

export interface GovernanceMetric { label: string; value: number; tone: "green" | "amber" | "red" | "blue" }

export const governanceMetrics = (integrityViolations: number, activeInterventions: number, riskAcceptances: number, reassessments: number): GovernanceMetric[] => [
  { label: "Health Signals Governed", value: 148, tone: "blue" },
  { label: "Critical Signals", value: 12, tone: "red" },
  { label: "Threshold Reviews Pending", value: 4, tone: "amber" },
  { label: "Scoring Policy Reviews", value: 1, tone: "amber" },
  { label: "Interventions Active", value: activeInterventions, tone: "blue" },
  { label: "Health Risk Acceptances", value: riskAcceptances, tone: "amber" },
  { label: "Reassessments Pending", value: reassessments, tone: "amber" },
  { label: "Historical Integrity Violations", value: integrityViolations, tone: integrityViolations > 0 ? "red" : "green" },
];

export const governanceDimensions = [
  { name: "Signal Quality", score: 93, owner: "Information Governance", note: "Signals carry definition, calculation, source records and freshness" },
  { name: "Threshold Integrity", score: 88, owner: "Enterprise Cognitive Governance", note: "Four thresholds awaiting governance review" },
  { name: "Scoring Transparency", score: 96, owner: "Enterprise Cognitive Governance", note: "Weights, targets and override rules are published" },
  { name: "Ownership", score: 84, owner: "Coordination Governance", note: "Two critical interventions lack a confirmed owner" },
  { name: "Intervention Coverage", score: 81, owner: "Health Operations", note: "Not every attention signal has an owned intervention" },
  { name: "Decision Exposure", score: 78, owner: "Decision Governance", note: "Four active decisions operate in degraded scopes" },
  { name: "Historical Integrity", score: 100, owner: "Memory Governance", note: "Zero rewrite violations in the current period" },
];

/* ============================================= 21 · risk acceptance ====== */

export interface CognitiveHealthRiskAcceptance {
  id: string;
  signalId: string;
  dimensionId: string;
  scopeType: ScopeType;
  scopeId: string;
  severity: HealthSeverity;
  affectedDecisionIds: string[];
  affectedTeams: string[];
  potentialConsequence: string;
  existingControls: string[];
  reason: string;
  expirationDate: string;
  owner: string;
  approver: string;
  monitoringRequirements: string[];
  status: "Active" | "Expiring" | "Expired" | "Withdrawn";
  createdAt: string;
}

export const seedRiskAcceptances: CognitiveHealthRiskAcceptance[] = [
  {
    id: "CHRK 1", signalId: "CHS 1022", dimensionId: "DIM LM", scopeType: "Enterprise", scopeId: "Enterprise",
    severity: "Medium High", affectedDecisionIds: [], affectedTeams: ["Payments Platform"],
    potentialConsequence: "Outcome reconciliation lag delays validated learning by up to two weeks",
    existingControls: ["Weekly reconciliation review", "Outcome registry monitoring"],
    reason: "Reconciliation tooling upgrade is scheduled and interim manual effort is not justified",
    expirationDate: "2026-09-15", owner: "Learning Governance", approver: "Enterprise Cognitive Governance",
    monitoringRequirements: ["Weekly reconciliation coverage report"], status: "Active", createdAt: "2026-07-15",
  },
  {
    id: "CHRK 2", signalId: "CHS 1017", dimensionId: "DIM CTA", scopeType: "Business Unit", scopeId: "Commerce Engineering",
    severity: "High", affectedDecisionIds: ["DEC 5001"], affectedTeams: ["Checkout Engineering"],
    potentialConsequence: "Unresolved conflicts surface during execution rather than during design",
    existingControls: ["Cross team matrix review", "Release governance gate"],
    reason: "Conflict resolution depends on the coordination ownership intervention completing first",
    expirationDate: "2026-08-20", owner: "Commerce Architecture", approver: "Decision Governance",
    monitoringRequirements: ["Daily conflict count", "Coordination ownership tracking"], status: "Expiring", createdAt: "2026-07-20",
  },
  {
    id: "CHRK 3", signalId: "CHS 1012", dimensionId: "DIM CP", scopeType: "Enterprise", scopeId: "Enterprise",
    severity: "Medium", affectedDecisionIds: ["DEC 5003"], affectedTeams: ["Release Governance"],
    potentialConsequence: "A small share of outcomes cannot be traced to their originating decision",
    existingControls: ["Outcome linkage audit"], reason: "Legacy outcome records predate the linkage requirement",
    expirationDate: "2026-10-01", owner: "Memory Governance", approver: "Enterprise Cognitive Governance",
    monitoringRequirements: ["Monthly linkage audit"], status: "Active", createdAt: "2026-06-30",
  },
];

export const riskAcceptanceRule =
  "Risk acceptance is temporary and governed. It must expire and it never suppresses the underlying health signal.";

/* ================================================= 22 · escalation ======= */

export const escalationReasons = [
  "Critical Decision Exposure", "Critical Dependency Blind Spot", "Critical Context Integrity Issue",
  "Cross Team Coordination Failure", "Decision Confidence Below Minimum", "Material Learning Failure",
  "Unowned Critical Intervention", "Repeated Response Latency Breach", "Historical Integrity Violation",
] as const;
export type EscalationReason = (typeof escalationReasons)[number];

export const escalationLevels = [
  "Team Lead", "Business Unit Architecture", "Enterprise Cognitive Governance", "Executive Steering",
] as const;

export interface CognitiveHealthEscalation {
  id: string;
  signalId: string;
  dimensionId: string;
  scopeType: ScopeType;
  scopeId: string;
  reason: EscalationReason;
  severity: HealthSeverity;
  affectedDecisionIds: string[];
  affectedPersonaIds: string[];
  businessConsequence: string;
  customerConsequence: string;
  evidenceReferenceIds: string[];
  owner: string;
  recommendedLevel: string;
  dueDate: string;
  status: "Open" | "Acknowledged" | "Resolved";
  createdAt: string;
}

export const seedEscalations: CognitiveHealthEscalation[] = [
  {
    id: "CHES 1", signalId: "CHS 1003", dimensionId: "DIM DV", scopeType: "Knowledge Domain",
    scopeId: "Identity & Access", reason: "Critical Dependency Blind Spot", severity: "Critical",
    affectedDecisionIds: ["DEC 5006", "DEC 5011"], affectedPersonaIds: ["Identity Engineering", "Payments Platform"],
    businessConsequence: "Migration sequencing may be planned against dependency relationships that are no longer accurate",
    customerConsequence: "Authentication interruption risk during a regional cutover",
    evidenceReferenceIds: ["EVR 4401", "SRC 1003A"], owner: "Identity Architecture",
    recommendedLevel: "Enterprise Cognitive Governance", dueDate: "2026-08-11", status: "Open", createdAt: "2026-08-06 09:50",
  },
];

/* ================================= 23-24 · executive briefing ============ */

export interface CognitiveHealthExecutiveBrief {
  id: string;
  scopeType: ScopeType;
  scopeId: string;
  timeRange: string;
  snapshotId: string;
  summary: string;
  topImprovements: string[];
  topAttentionAreas: string[];
  decisionExposureIds: string[];
  interventionIds: string[];
  recommendedFocus: string[];
  createdAt: string;
  sections: { title: string; body: string }[];
}

export const executiveQuestions = [
  "Where are we at risk of discovering downstream impact too late?",
  "Which teams are carrying the most unresolved coordination burden?",
  "Which active decisions are operating with weak context?",
  "Which cognitive weaknesses are improving?",
  "Which are persistent?",
  "Which interventions have produced measurable health change?",
];

export const executiveAnswers: Record<string, string> = {
  "Where are we at risk of discovering downstream impact too late?":
    "Identity and Access. Critical dependency validation sits at 84% against a 95% target and two active decisions depend on those relationships.",
  "Which teams are carrying the most unresolved coordination burden?":
    "Commerce Engineering and Customer Support Operations. Four coordination actions remain unowned and support acknowledgement coverage is 68%.",
  "Which active decisions are operating with weak context?":
    "Regional Token Vault Migration, Identity Cache Optimization and Support Escalation Routing Change.",
  "Which cognitive weaknesses are improving?":
    "Response Latency improved 6 points, Cross Team Awareness 5 points and Learning Maturity 4 points.",
  "Which are persistent?":
    "Dependency validation freshness and learning publication throughput have not moved materially in two quarters.",
  "Which interventions have produced measurable health change?":
    "Identity dependency validation is associated with a 7 point signal improvement and a 3 point dimension improvement. Learning publication shows no material improvement.",
};

export const briefTimeRanges = ["Prior Week", "Prior Month", "Prior Quarter", "Year to Date"];

export const briefSections = [
  "Current ECHI", "Dimension Health", "Material Changes", "Critical Signals", "Decision Exposure",
  "Active Interventions", "Learning Maturity", "Response Latency", "Major Risks", "Recommended Focus",
];

export function generateExecutiveBrief(
  scopeType: ScopeType, scopeId: string, timeRange: string,
  snapshot: HealthSnapshotRecord, exposures: CognitiveHealthDecisionExposure[],
  interventions: CognitiveHealthIntervention[], integrityViolations: number,
): CognitiveHealthExecutiveBrief {
  const prior = snapshotHistory.find((s) => s.label === timeRange) ?? snapshotHistory[1];
  const delta = snapshot.echi - prior.echi;
  const active = interventions.filter((i) => !["Cancelled", "Successful"].includes(i.status));
  const critical = exposures.filter((e) => e.exposureSeverity === "High" || e.exposureSeverity === "Critical");
  const sections = [
    { title: "Current ECHI", body: `Enterprise Cognitive Health Index ${snapshot.echi} against a target of 92. Band ${bandFor(snapshot.echi)}. Confidence ${snapshot.confidence}%.` },
    { title: "Dimension Health", body: dimensions.map((d) => `${d.name} ${snapshot.dimensionScores[d.id]}`).join(" · ") },
    { title: "Material Changes", body: `Compared with ${prior.label}: index ${delta >= 0 ? "+" : ""}${delta}. Response Latency +6, Cross Team Awareness +5, Learning Maturity +4, Identity dependency freshness -2.` },
    { title: "Critical Signals", body: integrityViolations > 0 ? `Historical context integrity violations detected: ${integrityViolations}. Context Preservation is Critical.` : `${snapshot.criticalSignalIds.map(signalName).join(", ") || "None"} remain Critical. Historical context integrity violations: 0.` },
    { title: "Decision Exposure", body: `${exposures.length} active decisions are exposed to degraded cognitive health. ${critical.length} carry High or Critical exposure.` },
    { title: "Active Interventions", body: `${active.length} interventions in the working set, ${interventionSummary.active} governed across the enterprise, ${interventionSummary.dueThisWeek} due this week.` },
    { title: "Learning Maturity", body: `Validated learning reuse at 82% with 18 records pending publication against a target below 5.` },
    { title: "Response Latency", body: `Average cross team understanding time is 2.1 business days against a target below one business day.` },
    { title: "Major Risks", body: `Identity dependency blind spot, unowned Commerce coordination actions, Regional Token Vault decision evidence gaps, learning publication backlog.` },
    { title: "Recommended Focus", body: `Validate Identity critical dependencies, assign Commerce coordination ownership, close Regional Token Vault evidence gaps.` },
  ];
  return {
    id: `CHEB ${Date.now().toString().slice(-5)}`, scopeType, scopeId, timeRange,
    snapshotId: snapshot.id,
    summary: `${scopeId} cognitive health is ${bandFor(snapshot.echi)} at ${snapshot.echi} against a target of 92, ${delta >= 0 ? "up" : "down"} ${Math.abs(delta)} since the ${timeRange.toLowerCase()}.`,
    topImprovements: ["Cross Team Awareness +5", "Response Latency +6", "Learning Maturity +4"],
    topAttentionAreas: ["Identity dependency validation", "Commerce coordination ownership", "Regional Token Vault evidence", "Learning publication backlog"],
    decisionExposureIds: exposures.map((e) => e.id), interventionIds: active.map((i) => i.id),
    recommendedFocus: ["Validate Identity critical dependencies", "Assign Commerce coordination ownership", "Close Regional Token Vault decision evidence gaps"],
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "), sections,
  };
}

/* ================================================= 25 · global search ==== */

export interface HealthSearchHit {
  type: string;
  record: string;
  dimension: string;
  scope: string;
  severity: string;
  owner: string;
  status: string;
  action: string;
  target: string;
}

export const searchExamples = [
  "Critical dependency health issues",
  "Commerce Cross Team Awareness",
  "Decisions exposed to low Dependency Visibility",
  "Learning maturity interventions",
  "Signals worsening this quarter",
  "Health issues affecting Identity Engineering",
  "Unowned health interventions",
];

export function searchHealth(
  q: string,
  reviews: CognitiveHealthReview[],
  alerts: CognitiveHealthAlert[],
  interventions: CognitiveHealthIntervention[],
  exposures: CognitiveHealthDecisionExposure[],
  risks: CognitiveHealthRiskAcceptance[],
  reassessments: CognitiveHealthReassessment[],
): HealthSearchHit[] {
  const query = q.trim().toLowerCase();
  const hits: HealthSearchHit[] = [];
  const push = (h: HealthSearchHit, hay: string) => {
    if (!query || hay.toLowerCase().includes(query)) hits.push(h);
  };

  for (const s of snapshotHistory) {
    push({ type: "Health Snapshot", record: `${s.id} · ${s.label}`, dimension: "All", scope: s.scopeId, severity: bandFor(s.echi), owner: "Health Modeling", status: `ECHI ${s.echi}`, action: "Open History", target: "panel-snapshot-history" },
      `${s.id} ${s.label} snapshot history ${s.echi}`);
  }
  for (const d of dimensions) {
    push({ type: "Health Dimension", record: d.name, dimension: d.name, scope: "Enterprise", severity: d.status, owner: "Health Modeling", status: String(d.score), action: "Open Dimension", target: `dimension:${d.id}` },
      `${d.name} ${d.short} dimension ${d.status} ${d.score} ${d.recommendedFocus}`);
  }
  for (const s of signals) {
    push({ type: "Health Signal", record: s.name, dimension: dimName(s.dimensionId), scope: s.scopeId, severity: s.severity, owner: s.sourceModule, status: s.status, action: "Open Signal", target: `signal:${s.id}` },
      `${s.id} ${s.name} ${s.scopeId} ${s.severity} ${s.sourceModule} ${s.status} ${s.currentValue} ${dimName(s.dimensionId)}`);
  }
  for (const r of reviews) {
    push({ type: "Health Review", record: `${r.id} · ${r.issueType}`, dimension: dimName(r.dimensionId), scope: r.scopeId, severity: r.severity, owner: r.owner, status: r.status, action: "Open Review", target: `review:${r.id}` },
      `${r.id} ${r.issueType} ${r.scopeId} ${r.owner} ${r.severity} ${r.status} ${dimName(r.dimensionId)} review`);
  }
  for (const a of alerts) {
    push({ type: "Health Alert", record: `${a.id} · ${a.alertType}`, dimension: dimName(a.dimensionId), scope: a.scopeId, severity: a.severity, owner: a.owner, status: a.status, action: "Open Alert", target: "panel-health-alerts" },
      `${a.id} ${a.alertType} ${a.scopeId} ${a.owner} ${a.severity} ${a.status} alert ${dimName(a.dimensionId)}`);
  }
  for (const i of interventions) {
    push({ type: "Intervention", record: `${i.id} · ${i.title}`, dimension: i.dimensionIds.map(dimName).join(", "), scope: i.scopeId, severity: i.status === "Blocked" ? "High" : "Medium", owner: i.owner || "Unowned", status: i.status, action: "Open Intervention", target: `intervention:${i.id}` },
      `${i.id} ${i.title} ${i.scopeId} ${i.owner} ${i.status} intervention ${i.dimensionIds.map(dimName).join(" ")} ${i.owner ? "" : "unowned"}`);
  }
  for (const e of exposures) {
    push({ type: "Decision Exposure", record: `${e.decisionId} · ${e.decision}`, dimension: e.affectedDimensionIds.map(dimName).join(", "), scope: e.decisionOwner, severity: e.exposureSeverity, owner: e.decisionOwner, status: e.status, action: "Open Exposure", target: "panel-decision-exposure" },
      `${e.decisionId} ${e.decision} ${e.decisionOwner} ${e.exposureSeverity} ${e.affectedDimensionIds.map(dimName).join(" ")} decision exposed`);
  }
  for (const r of risks) {
    push({ type: "Risk Acceptance", record: `${r.id} · ${signalName(r.signalId)}`, dimension: dimName(r.dimensionId), scope: r.scopeId, severity: r.severity, owner: r.owner, status: r.status, action: "Open Risk", target: "panel-risk-acceptance" },
      `${r.id} ${signalName(r.signalId)} ${r.scopeId} ${r.owner} ${r.status} risk acceptance`);
  }
  for (const r of reassessments) {
    push({ type: "Reassessment", record: `${r.id} · ${r.triggerType}`, dimension: "All", scope: r.owner, severity: "Medium", owner: r.owner, status: r.status, action: "Open Reassessment", target: "panel-reassessment" },
      `${r.id} ${r.triggerType} ${r.owner} ${r.status} reassessment`);
  }
  for (const p of echiPolicyVersions) {
    push({ type: "Health Policy Version", record: `ECHI Policy ${p.version}`, dimension: "All", scope: "Enterprise", severity: "Low", owner: p.owner, status: p.approval, action: "Open Policy", target: "panel-policy-history" },
      `${p.version} policy ${p.reason} ${p.owner} threshold scoring`);
  }
  return hits;
}

/* ==================================================== 26 · notifications = */

export const notificationTypes = [
  "Health Dimension Changed", "Health Dimension Entered Attention State", "Health Dimension Entered At Risk",
  "Critical Health Signal", "Decision Exposure Increased", "Health Review Assigned", "Intervention Assigned",
  "Intervention Blocked", "Intervention Measurement Complete", "Health Risk Acceptance Expiring",
  "Reassessment Required", "Threshold Change Proposed", "Scoring Policy Changed", "Executive Brief Ready",
  "Historical Integrity Alert",
] as const;
export type HealthNotificationType = (typeof notificationTypes)[number];

export interface CognitiveHealthNotification {
  id: string;
  signalId: string | null;
  dimensionId: string | null;
  interventionId: string | null;
  type: HealthNotificationType;
  title: string;
  description: string;
  severity: HealthSeverity;
  owner: string;
  status: "Unread" | "Read";
  createdAt: string;
}

export const seedNotifications: CognitiveHealthNotification[] = [
  { id: "CHN 1", signalId: "CHS 1003", dimensionId: "DIM DV", interventionId: "CHI 9001", type: "Critical Health Signal", title: "Critical dependency validation below threshold", description: "Identity and Access critical dependency validation is 84% against a 95% threshold", severity: "Critical", owner: "Identity Architecture", status: "Unread", createdAt: "2026-08-06 09:41" },
  { id: "CHN 2", signalId: "CHS 1006", dimensionId: "DIM RL", interventionId: null, type: "Health Dimension Entered Attention State", title: "Response Latency entered an attention state", description: "Cross team understanding time is 2.1 business days against a threshold below one day", severity: "High", owner: "Coordination Governance", status: "Unread", createdAt: "2026-08-06 08:12" },
  { id: "CHN 3", signalId: null, dimensionId: null, interventionId: null, type: "Decision Exposure Increased", title: "Regional Token Vault exposure raised to High", description: "Dependency visibility in the relevant scope fell to 76 while the decision awaits approval", severity: "High", owner: "Decision Governance", status: "Unread", createdAt: "2026-08-06 07:55" },
  { id: "CHN 4", signalId: "CHS 1016", dimensionId: "DIM CTA", interventionId: "CHI 9002", type: "Intervention Assigned", title: "Coordination ownership intervention assigned", description: "Commerce Architecture accepted ownership of CHI 9002", severity: "Medium", owner: "Commerce Architecture", status: "Read", createdAt: "2026-08-05 16:02" },
  { id: "CHN 5", signalId: "CHS 1017", dimensionId: "DIM CTA", interventionId: null, type: "Health Risk Acceptance Expiring", title: "Risk acceptance CHRK 2 expires in 13 days", description: "Conflict resolution coverage risk acceptance requires renewal or closure", severity: "Medium High", owner: "Commerce Architecture", status: "Unread", createdAt: "2026-08-05 09:30" },
  { id: "CHN 6", signalId: "CHS 1009", dimensionId: "DIM IQ", interventionId: null, type: "Reassessment Required", title: "Persona freshness degraded in Customer Support", description: "One persona impact evaluation and one intake should be rechecked", severity: "Medium", owner: "Customer Support Operations", status: "Unread", createdAt: "2026-08-05 14:22" },
  { id: "CHN 7", signalId: null, dimensionId: null, interventionId: null, type: "Threshold Change Proposed", title: "Response Latency duration thresholds proposed", description: "Coordination Governance proposed a tighter cross team understanding threshold", severity: "Low", owner: "Coordination Governance", status: "Read", createdAt: "2026-08-04 11:11" },
];

/* ============================================= 27 · recent activity ====== */

export interface HealthOpsActivity {
  id: string;
  time: string;
  label: string;
  detail: string;
  category: string;
}

export const seedOpsActivity: HealthOpsActivity[] = [
  { id: "HOA 1", time: "10:22 AM", label: "Cross Team Awareness improved from 80 to 81", detail: "Persona coverage and acknowledgement improvements recorded", category: "Health Change" },
  { id: "HOA 2", time: "10:18 AM", label: "Identity dependency validation intervention reached 91%", detail: "CHI 9001 measurement window in progress", category: "Intervention" },
  { id: "HOA 3", time: "10:14 AM", label: "Regional Token Vault decision exposure marked High", detail: "Dependency visibility 76 in the relevant scope", category: "Decision Exposure" },
  { id: "HOA 4", time: "10:09 AM", label: "Retry learning publication backlog reduced from 21 to 18", detail: "Three validated learnings published", category: "Learning" },
  { id: "HOA 5", time: "10:06 AM", label: "Commerce coordination owner assigned", detail: "CHI 9002 assigned to Commerce Architecture", category: "Intervention" },
  { id: "HOA 6", time: "10:03 AM", label: "Customer Support Persona evidence refresh started", detail: "CHI 9004 moved to Evidence Required", category: "Intervention" },
  { id: "HOA 7", time: "9:58 AM", label: "Response Latency improved to 2.1 business days", detail: "Down from 2.8 business days in the prior period", category: "Health Change" },
  { id: "HOA 8", time: "9:52 AM", label: "ECHI recalculated at 87", detail: "Scoring policy v1.2 applied to the current snapshot", category: "Recalculation" },
];

export const nowLabel = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/* ================================================== 28 · governed export = */

export const exportFormats = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot", "Executive Health Brief"];

export const exportScopes = [
  "Current Enterprise Health", "Selected Business Unit", "Selected Team", "Selected Dimension",
  "Health Signals", "Critical Signals", "Decision Exposure", "Interventions", "Health Reviews",
  "Health History", "Snapshot Comparison", "Governance", "Executive Brief", "Full Cognitive Health Report",
];

export const exportOptions = [
  "ECHI", "Dimension Scores", "Signal Details", "Targets", "Trends", "Confidence", "Affected Teams",
  "Affected Decisions", "Diagnostic Paths", "Interventions", "Risk Acceptances", "History", "Policy Versions",
];

export function buildExportRows(
  scope: string,
  snapshot: HealthSnapshotRecord,
  reviews: CognitiveHealthReview[],
  interventions: CognitiveHealthIntervention[],
  exposures: CognitiveHealthDecisionExposure[],
  risks: CognitiveHealthRiskAcceptance[],
  selectedDimensionId: string,
  selectedUnit: string,
  brief: CognitiveHealthExecutiveBrief | null,
): Record<string, unknown>[] {
  switch (scope) {
    case "Health Signals":
      return signals.map((s) => ({ id: s.id, signal: s.name, dimension: dimName(s.dimensionId), scope: s.scopeId, current: s.currentValue, target: s.targetValue, severity: s.severity, status: s.status, confidence: s.confidence, sourceModule: s.sourceModule }));
    case "Critical Signals":
      return signals.filter((s) => s.severity === "Critical" || s.severity === "High")
        .map((s) => ({ id: s.id, signal: s.name, dimension: dimName(s.dimensionId), scope: s.scopeId, current: s.currentValue, target: s.targetValue, severity: s.severity, affectedDecisions: s.affectedDecisionIds.join(" ") }));
    case "Decision Exposure":
      return exposures.map((e) => ({ id: e.id, decision: e.decision, owner: e.decisionOwner, state: e.decisionState, healthScore: e.healthScore, evidenceCoverage: e.evidenceCoverage, dependencyCoverage: e.dependencyCoverage, crossTeamAwareness: e.crossTeamAwareness, decisionConfidence: e.decisionConfidence, exposure: e.exposureSeverity, recommendedAction: e.recommendedAction }));
    case "Interventions":
      return interventions.map((i) => ({ id: i.id, title: i.title, owner: i.owner, dimensions: i.dimensionIds.map(dimName).join(" "), scope: i.scopeId, status: i.status, due: i.dueDate, expectedEffect: i.expectedHealthEffect, confidence: i.expectedEffectConfidence }));
    case "Health Reviews":
      return reviews.map((r) => ({ id: r.id, issue: r.issueType, dimension: dimName(r.dimensionId), scope: r.scopeId, severity: r.severity, current: r.currentValue, target: r.targetValue, owner: r.owner, due: r.dueDate, status: r.status }));
    case "Health History":
      return snapshotHistory.map((s) => ({ id: s.id, label: s.label, timestamp: s.timestamp, echi: s.echi, scoringPolicy: s.scoringPolicyVersion, thresholdPolicy: s.thresholdPolicyVersion, confidence: s.confidence, criticalSignals: s.criticalSignalIds.length, interventionsActive: s.interventionsActive }));
    case "Snapshot Comparison":
      return compareSnapshots(snapshotHistory[1], snapshotHistory[0], "As Measured at the Time")
        .map((r) => ({ field: r.field, prior: r.left, current: r.right, state: r.state }));
    case "Governance":
      return governanceDimensions.map((g) => ({ dimension: g.name, score: g.score, owner: g.owner, note: g.note }));
    case "Executive Brief":
      return (brief?.sections ?? []).map((s) => ({ section: s.title, body: s.body }));
    case "Selected Dimension":
      return signals.filter((s) => s.dimensionId === selectedDimensionId)
        .map((s) => ({ dimension: dimName(selectedDimensionId), signal: s.name, current: s.currentValue, target: s.targetValue, severity: s.severity, status: s.status }));
    case "Selected Business Unit":
    case "Selected Team":
      return signals.filter((s) => s.scopeId === selectedUnit || s.scopeId === "Enterprise")
        .map((s) => ({ scope: selectedUnit, signal: s.name, dimension: dimName(s.dimensionId), current: s.currentValue, target: s.targetValue, severity: s.severity }));
    case "Full Cognitive Health Report":
      return [
        ...dimensions.map((d) => ({ type: "Dimension", record: d.name, value: snapshot.dimensionScores[d.id], target: d.target, status: d.status })),
        ...reviews.map((r) => ({ type: "Review", record: r.id, value: r.currentValue, target: r.targetValue, status: r.status })),
        ...interventions.map((i) => ({ type: "Intervention", record: i.id, value: i.title, target: i.expectedHealthEffect, status: i.status })),
        ...exposures.map((e) => ({ type: "Decision Exposure", record: e.decision, value: e.healthScore, target: "92", status: e.exposureSeverity })),
        ...risks.map((r) => ({ type: "Risk Acceptance", record: r.id, value: signalName(r.signalId), target: r.expirationDate, status: r.status })),
      ];
    default:
      return dimensions.map((d) => ({
        dimension: d.name, score: snapshot.dimensionScores[d.id], target: d.target,
        status: d.status, weight: currentPolicy.dimensionWeights[d.id], confidence: d.confidence,
        echi: snapshot.echi, scoringPolicy: snapshot.scoringPolicyVersion,
      }));
  }
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const head = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [head.join(","), ...rows.map((r) => head.map((h) => esc(r[h])).join(","))].join("\n");
}

export function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) return value.map((v) => `${pad}- ${typeof v === "object" && v ? `\n${toYaml(v, indent + 1)}` : String(v)}`).join("\n");
  if (value && typeof value === "object")
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => (typeof v === "object" && v ? `${pad}${k}:\n${toYaml(v, indent + 1)}` : `${pad}${k}: ${String(v)}`))
      .join("\n");
  return `${pad}${String(value)}`;
}

/* ==================================================== 29 · demo story ==== */

export interface HealthStoryStep {
  id: string;
  title: string;
  caption: string;
  notes: string;
  target: string;
  view?: string;
  action?: "open-workbench" | "create-intervention" | "open-simulator" | "boost-scenario";
}

export const healthStorySteps: HealthStoryStep[] = [
  { id: "S1", title: "Enterprise Cognitive Health Index", caption: "Enterprise Cognitive Health measures how effectively the organization can turn information into shared context, coordinated decisions, and reusable learning.", notes: "Open on the index and the seven dimensions. Emphasise that this is organizational health, not system uptime.", target: "panel-echi", view: "executive" },
  { id: "S2", title: "Context Preservation", caption: "The enterprise is strong at preserving evidence, versions, and historical decision context.", notes: "Context Preservation is 96. Historical context integrity violations are zero.", target: "panel-dimensions", view: "executive" },
  { id: "S3", title: "Response Latency", caption: "But preserving context is not enough if teams still need more than two business days to establish shared understanding.", notes: "Response Latency is 78. Understanding time is organizational, not technical.", target: "panel-latency", view: "diagnostic" },
  { id: "S4", title: "Cross Team Awareness", caption: "The Fabric shows where coordination remains dependent on manual ownership, unresolved conflicts, and incomplete dependency context.", notes: "Cross Team Awareness is 81 with four unowned coordination actions.", target: "panel-cross-team-awareness", view: "portfolio" },
  { id: "S5", title: "Cross Team Awareness Workbench", caption: "Every health score can be traced to operational signals, underlying ECF records, affected teams, and active decisions.", notes: "Open the workbench on Cross Team Awareness.", target: "panel-workbench", view: "diagnostic", action: "open-workbench" },
  { id: "S6", title: "Identity Dependency Diagnostic Path", caption: "Aging dependency evidence creates uncertainty in Persona Impact Analysis, which increases cross team review and slows decision context formation.", notes: "Diagnostic paths are explainable chains, not proven causality.", target: "panel-workbench", view: "diagnostic" },
  { id: "S7", title: "Decision Exposure", caption: "Health matters because degraded organizational context can directly affect decisions that are being made right now.", notes: "Four active decisions are exposed. Regional Token Vault is High.", target: "panel-decision-exposure", view: "executive" },
  { id: "S8", title: "Create an Intervention", caption: "Enterprise Cognitive Health converts a diagnostic signal into an owned, measurable intervention.", notes: "Create the Identity dependency validation intervention.", target: "panel-interventions", view: "diagnostic", action: "create-intervention" },
  { id: "S9", title: "Health Scenario Simulator", caption: "The enterprise can explore which improvements are most likely to move organizational health without pretending the scenario is an observed result.", notes: "Everything here is labelled Scenario Estimate.", target: "panel-scenario-simulator", view: "learning", action: "open-simulator" },
  { id: "S10", title: "Dependency Validation and Coordination Ownership", caption: "Improving dependency visibility and ownership strengthens multiple dimensions at once.", notes: "Raise both controls and watch several dimensions move together.", target: "panel-scenario-simulator", view: "learning", action: "boost-scenario" },
  { id: "S11", title: "Intervention Effectiveness", caption: "The organization then measures whether the intervention was associated with actual improvement rather than assuming that completing an action fixed the problem.", notes: "Note the concurrent contributors and the Partially Successful status.", target: "panel-intervention-effectiveness", view: "learning" },
  { id: "S12", title: "Learning Maturity", caption: "Cognitive health also depends on whether validated lessons return to future decisions.", notes: "Learning reuse 82%, publication backlog 18.", target: "panel-learning-maturity", view: "learning" },
  { id: "S13", title: "Health Snapshot History", caption: "The enterprise can see how cognitive health changes over time while preserving the scoring model that existed at each point.", notes: "As Measured at the Time versus Normalized to Current Scoring Policy.", target: "panel-snapshot-history", view: "learning" },
  { id: "S14", title: "Executive Health Briefing", caption: "The result is not another operational dashboard. It is a view of where the organization can make connected decisions confidently and where cognitive friction still creates enterprise risk.", notes: "Close on the executive briefing and the six executive questions.", target: "panel-executive-brief", view: "executive" },
];

/* ================================================ 30 · demo scenarios ==== */

export interface HealthDemoScenario {
  id: string;
  name: string;
  description: string;
  note: string;
  dimensionOverrides?: Partial<Record<string, number>>;
  integrityViolations?: number;
  interventionStatus?: { id: string; status: InterventionStatus };
  reviewStatus?: { id: string; status: HealthReviewStatus };
  addAlert?: Partial<CognitiveHealthAlert> & { id: string };
  exposureSeverity?: { id: string; severity: ExposureSeverity };
  reassessmentStatus?: { id: string; status: CognitiveHealthReassessment["status"] };
  riskStatus?: { id: string; status: CognitiveHealthRiskAcceptance["status"] };
  policyVersion?: string;
  briefReady?: boolean;
  reset?: boolean;
  activity: string;
  notification?: { type: HealthNotificationType; title: string; description: string; severity: HealthSeverity };
}

export const demoScenarios: HealthDemoScenario[] = [
  { id: "DS 01", name: "Healthy Enterprise", description: "Every dimension inside its band", note: "All dimensions healthy, no critical exposure", dimensionOverrides: { "DIM IQ": 95, "DIM CP": 97, "DIM DV": 94, "DIM CTA": 93, "DIM DC": 95, "DIM RL": 91, "DIM LM": 93 }, integrityViolations: 0, activity: "Healthy enterprise scenario applied", notification: { type: "Health Dimension Changed", title: "All dimensions healthy", description: "No dimension is below its attention band", severity: "Low" } },
  { id: "DS 02", name: "Improving Health", description: "Broad improvement across coordination and learning", note: "ECHI trending toward target", dimensionOverrides: { "DIM DV": 88, "DIM CTA": 87, "DIM RL": 85, "DIM LM": 90 }, activity: "Improving health scenario applied", notification: { type: "Health Dimension Changed", title: "Coordination and learning improving", description: "Cross Team Awareness and Learning Maturity moved up together", severity: "Low" } },
  { id: "DS 03", name: "Cross Team Awareness Degraded", description: "Coordination ownership collapses", note: "Cross Team Awareness enters At Risk", dimensionOverrides: { "DIM CTA": 68 }, addAlert: { id: "DSA 03", alertType: "Cross Team Awareness Degraded", dimensionId: "DIM CTA", signalId: "CHS 1016", severity: "Critical", currentValue: "68%", threshold: "95%", scopeId: "Commerce Engineering" }, activity: "Cross Team Awareness degraded to 68", notification: { type: "Health Dimension Entered At Risk", title: "Cross Team Awareness entered At Risk", description: "Coordination ownership fell sharply in Commerce Engineering", severity: "Critical" } },
  { id: "DS 04", name: "Dependency Visibility Critical", description: "Critical dependency blind spot", note: "Dependency Visibility below the critical threshold", dimensionOverrides: { "DIM DV": 58 }, exposureSeverity: { id: "CHE 1", severity: "Critical" }, addAlert: { id: "DSA 04", alertType: "Dimension Entered Critical", dimensionId: "DIM DV", signalId: "CHS 1003", severity: "Critical", currentValue: "58%", threshold: "95%", scopeId: "Identity & Access" }, activity: "Dependency Visibility entered Critical", notification: { type: "Health Dimension Entered At Risk", title: "Dependency Visibility Critical", description: "Critical dependency validation collapsed in Identity and Access", severity: "Critical" } },
  { id: "DS 05", name: "Decision Confidence Degraded", description: "Evidence gaps on active decisions", note: "Decision Confidence below minimum", dimensionOverrides: { "DIM DC": 72 }, exposureSeverity: { id: "CHE 1", severity: "High" }, activity: "Decision Confidence degraded to 72", notification: { type: "Decision Exposure Increased", title: "Decision confidence below minimum", description: "Regional Token Vault decision evidence is insufficient", severity: "High" } },
  { id: "DS 06", name: "Response Latency Breach", description: "Understanding time exceeds three business days", note: "Duration threshold breached", dimensionOverrides: { "DIM RL": 61 }, addAlert: { id: "DSA 06", alertType: "Response Latency Exceeded Target", dimensionId: "DIM RL", signalId: "CHS 1006", severity: "Critical", currentValue: "3.4 business days", threshold: "< 1 business day", scopeId: "Enterprise" }, activity: "Response Latency threshold breached", notification: { type: "Health Dimension Entered At Risk", title: "Response Latency breach", description: "Cross team understanding time exceeded three business days", severity: "Critical" } },
  { id: "DS 07", name: "Learning Publication Backlog", description: "Validated learning is not reaching memory", note: "Learning Maturity deteriorates", dimensionOverrides: { "DIM LM": 74 }, interventionStatus: { id: "CHI 9003", status: "Blocked" }, activity: "Learning publication backlog increased", notification: { type: "Intervention Blocked", title: "Learning publication blocked", description: "Publication approval queue is the binding constraint", severity: "Medium High" } },
  { id: "DS 08", name: "Persona Evidence Stale", description: "Support persona evidence ages out", note: "Information Quality and Cross Team Awareness fall", dimensionOverrides: { "DIM IQ": 79, "DIM CTA": 76 }, reassessmentStatus: { id: "CHRA 2", status: "Requested" }, activity: "Customer Support persona evidence marked stale", notification: { type: "Reassessment Required", title: "Persona evidence stale", description: "Customer Support persona evidence requires refresh", severity: "Medium High" } },
  { id: "DS 09", name: "Critical Decision Exposure", description: "An active decision sits in a Critical scope", note: "Exposure raised to Critical", dimensionOverrides: { "DIM DV": 66, "DIM DC": 78 }, exposureSeverity: { id: "CHE 1", severity: "Critical" }, activity: "Regional Token Vault exposure raised to Critical", notification: { type: "Decision Exposure Increased", title: "Critical decision exposure", description: "Regional Token Vault Migration is exposed to a Critical dependency signal", severity: "Critical" } },
  { id: "DS 10", name: "Coordination Owner Missing", description: "A critical intervention has no owner", note: "Ownership governance dimension falls", dimensionOverrides: { "DIM CTA": 74 }, interventionStatus: { id: "CHI 9002", status: "Proposed" }, activity: "Coordination owner removed from CHI 9002", notification: { type: "Intervention Blocked", title: "Unowned critical intervention", description: "CHI 9002 has no confirmed accountable owner", severity: "High" } },
  { id: "DS 11", name: "Health Intervention Started", description: "Identity validation moves into progress", note: "Intervention In Progress", interventionStatus: { id: "CHI 9001", status: "In Progress" }, activity: "CHI 9001 moved to In Progress", notification: { type: "Intervention Assigned", title: "Intervention started", description: "Identity dependency validation is in progress", severity: "Medium" } },
  { id: "DS 12", name: "Health Intervention Blocked", description: "Evidence dependency prevents progress", note: "Intervention Blocked", interventionStatus: { id: "CHI 9001", status: "Blocked" }, activity: "CHI 9001 blocked on evidence refresh", notification: { type: "Intervention Blocked", title: "Intervention blocked", description: "Identity dependency validation is blocked on the evidence refresh window", severity: "High" } },
  { id: "DS 13", name: "Health Intervention Successful", description: "Target signal reached", note: "Intervention Successful", interventionStatus: { id: "CHI 9001", status: "Successful" }, dimensionOverrides: { "DIM DV": 91 }, activity: "CHI 9001 recorded as Successful", notification: { type: "Intervention Measurement Complete", title: "Intervention successful", description: "Critical dependency validation reached the 95% target", severity: "Low" } },
  { id: "DS 14", name: "Health Intervention No Improvement", description: "Action completed with no measured change", note: "No Material Improvement", interventionStatus: { id: "CHI 9003", status: "No Material Improvement" }, activity: "CHI 9003 recorded as No Material Improvement", notification: { type: "Intervention Measurement Complete", title: "No material improvement", description: "Completing the action did not move the signal", severity: "Medium High" } },
  { id: "DS 15", name: "Health Risk Accepted", description: "A signal is temporarily accepted", note: "Risk acceptance active with expiry", riskStatus: { id: "CHRK 2", status: "Active" }, reviewStatus: { id: "CHR 7004", status: "Accepted Risk" }, activity: "Temporary risk acceptance recorded for CHR 7004", notification: { type: "Health Risk Acceptance Expiring", title: "Risk acceptance recorded", description: "The underlying health signal remains visible and the acceptance expires", severity: "Medium" } },
  { id: "DS 16", name: "Reassessment Required", description: "Material signal change triggers recheck", note: "Reassessment pending across evaluations", reassessmentStatus: { id: "CHRA 1", status: "Requested" }, activity: "Reassessment requested for CHRA 1", notification: { type: "Reassessment Required", title: "Reassessment requested", description: "Two active evaluations should recheck Identity dependency assumptions", severity: "High" } },
  { id: "DS 17", name: "Threshold Policy Changed", description: "New threshold version created", note: "Historical snapshots are not rewritten", policyVersion: "v1.3 draft", activity: "Threshold policy version v1.3 draft created", notification: { type: "Threshold Change Proposed", title: "Threshold policy changed", description: "A new threshold version was created. Historical snapshots keep their original policy", severity: "Low" } },
  { id: "DS 18", name: "Scoring Policy Changed", description: "Weights rebalanced in a new version", note: "Scoring policy versioned, history preserved", policyVersion: "v1.3 draft", activity: "Scoring policy draft submitted for governance", notification: { type: "Scoring Policy Changed", title: "Scoring policy changed", description: "A draft scoring policy was submitted for governance review", severity: "Low" } },
  { id: "DS 19", name: "Historical Integrity Alert", description: "Context integrity violation detected", note: "Context Preservation becomes Critical immediately", integrityViolations: 3, dimensionOverrides: { "DIM CP": 52 }, exposureSeverity: { id: "CHE 1", severity: "Critical" }, activity: "Historical context integrity violation detected", notification: { type: "Historical Integrity Alert", title: "Historical context integrity violation", description: "Context Preservation is Critical. Historical records are not altered by this alert", severity: "Critical" } },
  { id: "DS 20", name: "Executive Brief Ready", description: "A generated brief is available", note: "Executive brief generated locally", briefReady: true, activity: "Executive health brief generated", notification: { type: "Executive Brief Ready", title: "Executive brief ready", description: "An enterprise scope brief was generated for the prior week", severity: "Low" } },
  { id: "DS 21", name: "Reset Demo Data", description: "Restore the seeded enterprise state", note: "Integrity violations return to zero", reset: true, integrityViolations: 0, activity: "Demo data reset to the seeded enterprise state" },
];

/* ============================================ activity bridge helpers ==== */

export const toChActivity = (a: HealthOpsActivity, index: number): CognitiveHealthActivity => ({
  id: `HOA X${index}`, timestamp: a.time, scopeType: "Enterprise", scopeId: "Enterprise",
  dimensionId: "DIM CTA", action: a.label, description: a.detail, result: a.category,
  owner: "Health Operations", auditId: `AUD 9${9000 + index}`,
});
