/**
 * Persona Impact Analysis — Prompt 2 operational domain.
 *
 * Extended models for scenarios, alternatives, mitigation versions, reviews,
 * analysis versions, decision packages, routing, notifications, search,
 * export, demo story, and demo scenarios. Deterministic, local only.
 */

import {
  conflictsFor, evaluatePersona, impactConditions, impactEvidence, impactPersonas,
  initialProposal, mitigations, opportunities, personaById, recommendations, resultSummary,
  scorePersona, severityRank,
  type ImpactSeverity, type PersonaImpactFinding, type ProposalState,
} from "./data";

/* ------------------------------------------------------------- op states -- */

export type PiaOperationalState =
  | "Loading" | "Empty" | "Error" | "Analyzing" | "Needs Evidence" | "Review Required"
  | "Conflict Detected" | "Mitigation Required" | "Analysis Complete" | "Review Complete"
  | "Decision Package Ready" | "Routed to Matrix" | "Routed to Decision Intelligence"
  | "Blocked" | "Paused";

export const operationalStates: PiaOperationalState[] = [
  "Loading", "Empty", "Error", "Analyzing", "Needs Evidence", "Review Required",
  "Conflict Detected", "Mitigation Required", "Analysis Complete", "Review Complete",
  "Decision Package Ready", "Routed to Matrix", "Routed to Decision Intelligence",
  "Blocked", "Paused",
];

/* ------------------------------------------------------------- scenarios -- */

export interface PersonaImpactScenario {
  id: string;
  evaluationId: string;
  name: string;
  description: string;
  proposalParameters: ProposalState;
  trafficExposure: number;
  deploymentTiming: ProposalState["deploymentTiming"];
  progressiveRollout: boolean;
  rollbackThreshold: string;
  evidenceStates: { idempotency: boolean; fraudLoss: boolean; dependencyStress: boolean };
  personaScores: { personaId: string; score: number }[];
  findingIds: string[];
  conflictIds: string[];
  recommendationIds: string[];
  createdAt: string;
}

export interface PersonaImpactScenarioComparison {
  id: string;
  evaluationId: string;
  scenarioIds: string[];
  comparisonMetrics: string[];
  preferredForAnalysisOnly: string;
  createdAt: string;
}

export const scenarioMetrics = [
  "Impact Score", "Highest Severity", "Positive Opportunity", "Risk Count",
  "Approval Requirement", "Evidence Sufficiency", "Mitigation Count", "Confidence",
] as const;

export const retryOptions = [2, 3, 4];
export const trafficOptions = [5, 10, 15, 25, 50, 100];
export const timingOptions: ProposalState["deploymentTiming"][] = [
  "Standard window", "Quarter end window", "Maintenance window",
];

export const timingLabel = (t: ProposalState["deploymentTiming"]) =>
  t === "Standard window" ? "Normal Window" : t === "Quarter end window" ? "Quarter End Restricted Window" : "Maintenance Window";

export function buildScenario(
  id: string, name: string, description: string, patch: Partial<ProposalState>,
): PersonaImpactScenario {
  const proposal: ProposalState = { ...initialProposal, ...patch };
  const findings = impactPersonas.flatMap((p) => evaluatePersona(p.id, proposal));
  return {
    id, evaluationId: "EVAL 2048", name, description,
    proposalParameters: proposal,
    trafficExposure: proposal.maxTraffic,
    deploymentTiming: proposal.deploymentTiming,
    progressiveRollout: proposal.progressiveRollout,
    rollbackThreshold: proposal.rollbackThreshold
      ? "Duplicate Authorization >0.2% for 5 minutes" : "Not defined",
    evidenceStates: {
      idempotency: proposal.idempotencyEvidence,
      fraudLoss: proposal.fraudLossEvidence,
      dependencyStress: proposal.dependencyStressEvidence,
    },
    personaScores: impactPersonas.map((p) => ({ personaId: p.id, score: scorePersona(p.id, proposal).score })),
    findingIds: findings.map((f) => f.id),
    conflictIds: conflictsFor(proposal).map((c) => c.id),
    recommendationIds: recommendations.map((r) => r.id),
    createdAt: "Today 09:12",
  };
}

export const baselineScenario = buildScenario(
  "SCN 9001", "Baseline Proposal", "Three retries at five percent traffic with progressive rollout",
  { retryAttempts: 3, initialTraffic: 5, maxTraffic: 5, progressiveRollout: true },
);

export const seededScenarios: PersonaImpactScenario[] = [
  buildScenario("SCN 9001", "Scenario A", "Three retries, five percent traffic, progressive rollout",
    { retryAttempts: 3, initialTraffic: 5, maxTraffic: 5, progressiveRollout: true }),
  buildScenario("SCN 9002", "Scenario B", "Three retries, fifteen percent traffic, progressive rollout",
    { retryAttempts: 3, initialTraffic: 5, maxTraffic: 15, progressiveRollout: true }),
  buildScenario("SCN 9003", "Scenario C", "Three retries, full traffic, no progressive rollout",
    { retryAttempts: 3, initialTraffic: 100, maxTraffic: 100, progressiveRollout: false }),
];

export const defaultComparison: PersonaImpactScenarioComparison = {
  id: "SCC 9101", evaluationId: "EVAL 2048",
  scenarioIds: ["SCN 9001", "SCN 9002", "SCN 9003"],
  comparisonMetrics: [...scenarioMetrics],
  preferredForAnalysisOnly: "Scenario A retains the smallest governed exposure. This is analysis only, not a decision.",
  createdAt: "Today 09:14",
};

export type ScenarioDelta = "Improved" | "Worsened" | "Newly Activated" | "Resolved" | "Unchanged";

export function scenarioDelta(baseScore: number, score: number, baseApproval: boolean, approval: boolean): ScenarioDelta {
  if (approval && !baseApproval) return "Newly Activated";
  if (!approval && baseApproval) return "Resolved";
  if (score > baseScore) return "Worsened";
  if (score < baseScore) return "Improved";
  return "Unchanged";
}

export function scenarioPersonaMetrics(scenario: PersonaImpactScenario, personaId: string) {
  const p = scenario.proposalParameters;
  const findings = evaluatePersona(personaId, p);
  const score = scorePersona(personaId, p);
  const highest = findings.reduce<ImpactSeverity>(
    (a, f) => (severityRank(f.severity) > severityRank(a) ? f.severity : a), "Informational");
  const approval = p.maxTraffic > 10 || p.deploymentTiming === "Quarter end window";
  const evidence = [p.idempotencyEvidence, p.fraudLossEvidence, p.dependencyStressEvidence].filter(Boolean).length;
  return {
    impactScore: score.score,
    highestSeverity: highest,
    positiveOpportunity: findings.filter((f) => f.impactScoreContribution < 0).length,
    riskCount: findings.filter((f) => f.impactScoreContribution > 0).length,
    approvalRequirement: approval ? "Required" : "Not Required",
    approvalRequired: approval,
    evidenceSufficiency: `${Math.round((evidence / 3) * 100)}%`,
    mitigationCount: mitigations.filter((m) => m.personaId === personaId).length,
    confidence: score.confidence,
  };
}

/* ---------------------------------------------------------- alternatives -- */

export interface ChangeAlternative {
  id: string;
  label: string;
  title: string;
  patch: Partial<ProposalState>;
  expectedBenefit: string;
  personaImpact: string;
  customerImpact: string;
  operationalRisk: string;
  fraudRisk: string;
  dependencyRisk: string;
  governanceRequirements: string;
  evidenceRequirements: string;
  reversibility: string;
  complexity: string;
  confidence: number;
}

export const changeAlternatives: ChangeAlternative[] = [
  {
    id: "ALT A", label: "A", title: "Keep Current Two Retry Policy",
    patch: { retryAttempts: 2, initialTraffic: 5, maxTraffic: 5, progressiveRollout: true },
    expectedBenefit: "No change to current transient failure recovery",
    personaImpact: "Minimal across all Personas", customerImpact: "Unchanged abandonment at payment step",
    operationalRisk: "Low", fraudRisk: "Low", dependencyRisk: "Low",
    governanceRequirements: "None", evidenceRequirements: "None additional",
    reversibility: "Not applicable", complexity: "None", confidence: 96,
  },
  {
    id: "ALT B", label: "B", title: "Increase to Three Retries with Segmented Rollout",
    patch: { retryAttempts: 3, initialTraffic: 5, maxTraffic: 15, progressiveRollout: true },
    expectedBenefit: "Recovers transient failures with contained exposure",
    personaImpact: "Material for Payments, Fraud, and Release Governance",
    customerImpact: "Improved completion with modest latency in retry path",
    operationalRisk: "Medium", fraudRisk: "Medium", dependencyRisk: "Medium",
    governanceRequirements: "Joint approval above ten percent traffic",
    evidenceRequirements: "Idempotency, fraud loss analysis, dependency stress test",
    reversibility: "High with rollback threshold", complexity: "Medium", confidence: 91,
  },
  {
    id: "ALT C", label: "C", title: "Increase to Three Retries Globally",
    patch: { retryAttempts: 3, initialTraffic: 100, maxTraffic: 100, progressiveRollout: false },
    expectedBenefit: "Fastest recovery improvement across all traffic",
    personaImpact: "High for every evaluated Persona",
    customerImpact: "Improved completion with broad latency exposure",
    operationalRisk: "High", fraudRisk: "High", dependencyRisk: "High",
    governanceRequirements: "Joint approval and change advisory review",
    evidenceRequirements: "Full evidence set plus load test",
    reversibility: "Low without progressive rollout", complexity: "Low", confidence: 84,
  },
  {
    id: "ALT D", label: "D", title: "Dynamic Retry Based on Error Category",
    patch: { retryAttempts: 3, initialTraffic: 5, maxTraffic: 10, progressiveRollout: true },
    expectedBenefit: "Retries only where transient error categories are observed",
    personaImpact: "Moderate, concentrated in Payments and Checkout",
    customerImpact: "Targeted completion improvement",
    operationalRisk: "Medium", fraudRisk: "Low", dependencyRisk: "Low",
    governanceRequirements: "Standard change review",
    evidenceRequirements: "Error category telemetry and idempotency",
    reversibility: "High", complexity: "High", confidence: 88,
  },
];

/* ---------------------------------------------------- mitigation versions -- */

export interface PersonaImpactMitigationVersion {
  id: string;
  evaluationId: string;
  mitigationId: string;
  title: string;
  findingTitle: string;
  personaId: string;
  owner: string;
  requiredEvidence: string;
  originalSeverity: ImpactSeverity;
  residualSeverity: ImpactSeverity;
  expectedReduction: string;
  confidence: number;
  accepted: boolean;
  status: "Proposed" | "Accepted" | "Rejected" | "Evidence Requested";
  evidenceIds: string[];
  reason: string;
  updatedAt: string;
}

export const seededMitigationVersions: PersonaImpactMitigationVersion[] = [
  {
    id: "MTV 1", evaluationId: "EVAL 2048", mitigationId: "MIT 5501", title: "Idempotency Validation",
    findingTitle: "Duplicate Transaction Risk", personaId: "PER 4101", owner: "Payments Platform",
    requiredEvidence: "Idempotency Test Results", originalSeverity: "High", residualSeverity: "Medium",
    expectedReduction: "One severity band", confidence: 91, accepted: false, status: "Proposed",
    evidenceIds: ["EVD 7704"],
    reason: "Validated idempotency plus rollback threshold reduce duplicate authorization exposure",
    updatedAt: "Today 09:31",
  },
  {
    id: "MTV 2", evaluationId: "EVAL 2048", mitigationId: "MIT 5502", title: "Progressive Traffic Ramp",
    findingTitle: "Latency Amplification", personaId: "PER 4102", owner: "Checkout Engineering",
    requiredEvidence: "Rollout Plan", originalSeverity: "Medium", residualSeverity: "Low",
    expectedReduction: "One severity band", confidence: 89, accepted: false, status: "Proposed",
    evidenceIds: ["EVD 7703"],
    reason: "Ramping traffic limits the population exposed to added retry latency",
    updatedAt: "Today 09:31",
  },
  {
    id: "MTV 3", evaluationId: "EVAL 2048", mitigationId: "MIT 5504", title: "Fraud Loss Monitoring",
    findingTitle: "Fraud Risk", personaId: "PER 4103", owner: "Fraud Engineering",
    requiredEvidence: "Fraud Loss Analysis", originalSeverity: "High", residualSeverity: "Medium",
    expectedReduction: "One severity band when fraud loss monitoring exists", confidence: 87,
    accepted: false, status: "Evidence Requested", evidenceIds: ["EVD 7706"],
    reason: "Continuous fraud loss monitoring bounds exposure between expansion steps",
    updatedAt: "Today 09:33",
  },
  {
    id: "MTV 4", evaluationId: "EVAL 2048", mitigationId: "MIT 5502", title: "Dependency Load Validation",
    findingTitle: "Dependency Saturation", personaId: "PER 4104", owner: "Site Reliability Engineering",
    requiredEvidence: "Regional Dependency Stress Test", originalSeverity: "Medium", residualSeverity: "Low",
    expectedReduction: "One severity band when stress test and ramp controls are accepted", confidence: 90,
    accepted: false, status: "Proposed", evidenceIds: ["EVD 7707"],
    reason: "Stress tested dependency headroom plus ramp controls contain saturation risk",
    updatedAt: "Today 09:34",
  },
  {
    id: "MTV 5", evaluationId: "EVAL 2048", mitigationId: "MIT 5503", title: "Joint Approval Before >10% Traffic",
    findingTitle: "Governance Threshold", personaId: "PER 4106", owner: "Release Governance",
    requiredEvidence: "Approval Record", originalSeverity: "High", residualSeverity: "Medium",
    expectedReduction: "Governance exposure becomes procedural rather than unmanaged", confidence: 93,
    accepted: false, status: "Proposed", evidenceIds: ["EVD 7703"],
    reason: "Pre staged joint approval removes unapproved traffic expansion risk",
    updatedAt: "Today 09:35",
  },
];

const severityDown = (s: ImpactSeverity): ImpactSeverity => {
  const order: ImpactSeverity[] = ["Informational", "Low", "Medium", "High", "Critical"];
  return order[Math.max(0, order.indexOf(s) - 1)];
};

/** Residual severity for a finding given accepted mitigation versions. */
export function residualSeverity(f: PersonaImpactFinding, accepted: PersonaImpactMitigationVersion[]): ImpactSeverity {
  const hit = accepted.find((m) => m.personaId === f.personaId
    && (f.title.toLowerCase().includes(m.findingTitle.split(" ")[0].toLowerCase())
      || m.findingTitle.toLowerCase().includes(f.impactDimension.split(" ")[0].toLowerCase())));
  return hit ? severityDown(f.severity) : f.severity;
}

export function mitigatedScore(personaId: string, proposal: ProposalState, accepted: PersonaImpactMitigationVersion[]) {
  const raw = scorePersona(personaId, proposal);
  const reduction = accepted.filter((m) => m.personaId === personaId).length * 6;
  return { raw: raw.score, mitigated: Math.max(0, raw.score - reduction), reduction };
}

/* ---------------------------------------------------------------- review -- */

export interface PersonaImpactReview {
  id: string;
  evaluationId: string;
  evaluationTitle: string;
  personaId: string;
  findingId: string;
  findingTitle: string;
  reviewType: string;
  severity: ImpactSeverity;
  reviewer: string;
  reviewerRole: string;
  evidenceCoverage: number;
  status: "Open" | "In Review" | "Approved" | "Changes Requested" | "Escalated" | "Evidence Requested";
  decision: string;
  comments: string;
  requestedAt: string;
  dueAt: string;
  completedAt: string | null;
}

export const seededReviews: PersonaImpactReview[] = [
  {
    id: "PIR 4401", evaluationId: "EVAL 2048", evaluationTitle: "Checkout Retry Policy",
    personaId: "PER 4101", findingId: "PIF 8102", findingTitle: "Duplicate Transaction Risk",
    reviewType: "Persona Owner Review", severity: "High", reviewer: "Jane Smith",
    reviewerRole: "Payments Platform Owner", evidenceCoverage: 86, status: "Open",
    decision: "", comments: "", requestedAt: "Today 09:12", dueAt: "Today 17:00", completedAt: null,
  },
  {
    id: "PIR 4402", evaluationId: "EVAL 2048", evaluationTitle: "Checkout Retry Policy",
    personaId: "PER 4103", findingId: "PIF 8301", findingTitle: "Fraud Loss Risk",
    reviewType: "Evidence Review", severity: "High", reviewer: "Fraud Engineering Lead",
    reviewerRole: "Fraud Engineering Owner", evidenceCoverage: 72, status: "Evidence Requested",
    decision: "", comments: "", requestedAt: "Today 09:18", dueAt: "Tomorrow 12:00", completedAt: null,
  },
  {
    id: "PIR 4403", evaluationId: "EVAL 2048", evaluationTitle: "Checkout Retry Policy",
    personaId: "PER 4106", findingId: "PIF 8601", findingTitle: "Traffic Approval Requirement",
    reviewType: "Governance Review", severity: "High", reviewer: "Engineering Governance",
    reviewerRole: "Release Governance Owner", evidenceCoverage: 94, status: "In Review",
    decision: "", comments: "", requestedAt: "Today 09:20", dueAt: "Today 18:00", completedAt: null,
  },
  {
    id: "PIR 4404", evaluationId: "EVAL 2050", evaluationTitle: "Regional Token Vault Migration",
    personaId: "PER 4104", findingId: "PIF 8401", findingTitle: "Dependency Availability",
    reviewType: "Dependency Owner Review", severity: "Critical", reviewer: "Reliability Architecture",
    reviewerRole: "Site Reliability Engineering", evidenceCoverage: 68, status: "Open",
    decision: "", comments: "", requestedAt: "Yesterday 16:40", dueAt: "Today 12:00", completedAt: null,
  },
];

export const reviewSummary = (rows: PersonaImpactReview[]) => ({
  required: 12,
  critical: rows.filter((r) => r.severity === "Critical").length + 1,
  high: rows.filter((r) => r.severity === "High").length + 2,
  medium: 4,
  evidence: rows.filter((r) => r.reviewType === "Evidence Review").length,
});

export const reviewerActions = [
  "Confirm Impact", "Change Severity", "Change Direction", "Request Evidence", "Add Mitigation",
  "Reject Finding", "Mark Known Risk", "Request Persona Update", "Escalate",
] as const;

export const commentRequiredActions = [
  "Change Severity", "Reject Finding", "Mark Known Risk", "Add Mitigation",
];

export const personaOwnerActions = [
  "Confirm Interpretation", "Correct Persona Mapping", "Request Additional Context",
  "Challenge Finding", "Accept Mitigation", "Request Persona Refresh",
] as const;

export const crossTeamActions = [
  "Acknowledge", "Agree", "Disagree", "Request Evidence", "Propose Mitigation", "Escalate Conflict",
] as const;

export interface CrossTeamPosition {
  personaId: string;
  position: string;
  topPriority: string;
  topConcern: string;
  requiredEvidence: string;
  requiredMitigation: string;
  approvalRequirement: string;
  reviewStatus: string;
}

export const crossTeamPositions: CrossTeamPosition[] = [
  { personaId: "PER 4101", position: "Proceed only with validated idempotency", topPriority: "Payment integrity", topConcern: "Duplicate authorization", requiredEvidence: "Idempotency Test Results", requiredMitigation: "Idempotency Validation", approvalRequirement: "Required above 10% traffic", reviewStatus: "Pending Review" },
  { personaId: "PER 4102", position: "Support expansion with progressive ramp", topPriority: "Checkout completion", topConcern: "Added latency", requiredEvidence: "Latency Telemetry", requiredMitigation: "Progressive Traffic Ramp", approvalRequirement: "Not Required", reviewStatus: "Acknowledged" },
  { personaId: "PER 4103", position: "Block expansion until fraud loss analysis exists", topPriority: "Fraud loss containment", topConcern: "Retry driven fraud attempts", requiredEvidence: "Fraud Loss Analysis", requiredMitigation: "Fraud Loss Monitoring", approvalRequirement: "Required", reviewStatus: "Open" },
  { personaId: "PER 4104", position: "Require dependency headroom validation", topPriority: "Dependency health", topConcern: "Saturation of downstream services", requiredEvidence: "Regional Dependency Stress Test", requiredMitigation: "Dependency Load Validation", approvalRequirement: "Conditional", reviewStatus: "Open" },
  { personaId: "PER 4106", position: "Approval before traffic exceeds ten percent", topPriority: "Governed change", topConcern: "Unapproved expansion", requiredEvidence: "Approval Record", requiredMitigation: "Joint Approval", approvalRequirement: "Required", reviewStatus: "Pending Review" },
];

export const conflictResolutionTypes = [
  "No Conflict, Different Scope", "Accept Both Perspectives", "Add Mitigation",
  "Change Proposal Scope", "Change Rollout", "Request Evidence",
  "Escalate to Cross Team Impact Matrix", "Escalate to Decision Intelligence",
] as const;

/* ------------------------------------------------------------ reanalysis -- */

export const reanalysisScopes = [
  "Full Analysis", "Selected Persona", "Selected Impact Dimension", "Selected Findings",
  "Dependencies Only", "Conditions Only", "Evidence Update Only", "Persona Version Update",
] as const;

export const reanalysisSteps = [
  "Load Current Evaluation", "Apply Changes", "Refresh Persona Context", "Refresh Conditions",
  "Recalculate Findings", "Recalculate Scores", "Recalculate Recommendations",
  "Update Results Package", "Completed",
] as const;

/* --------------------------------------------------- version sensitivity -- */

export interface PersonaVersionSensitivity {
  personaId: string;
  fromVersion: string;
  toVersion: string;
  fromRule: string;
  toRule: string;
  fromScore: number;
  toScore: number;
  fromGovernanceSeverity: ImpactSeverity;
  toGovernanceSeverity: ImpactSeverity;
  findingsAdded: string[];
  findingsRemoved: string[];
  severityChanges: string[];
  recommendationChanges: string[];
  reviewerChanges: string[];
}

export const personaVersionSensitivity: PersonaVersionSensitivity = {
  personaId: "PER 4101", fromVersion: "v3.3", toVersion: "v3.4",
  fromRule: "Retry approval threshold 20% traffic",
  toRule: "Retry approval threshold 10% traffic",
  fromScore: 59, toScore: 68,
  fromGovernanceSeverity: "Medium", toGovernanceSeverity: "High",
  findingsAdded: ["Approval requirement activated at planned traffic exposure"],
  findingsRemoved: ["Unrestricted expansion below twenty percent"],
  severityChanges: ["Governance Threshold: Medium to High"],
  recommendationChanges: ["Add joint approval before exceeding ten percent traffic"],
  reviewerChanges: ["Add Fraud Engineering", "Add Payments Reliability"],
};

export interface ConditionSensitivity {
  id: string;
  name: string;
  priorValue: string;
  currentValue: string;
  impact: string;
  affectedPersonaIds: string[];
}

export const conditionSensitivity: ConditionSensitivity[] = [
  {
    id: "COND 100425", name: "Retry Approval Requirement", priorValue: "20% traffic", currentValue: "10% traffic",
    impact: "Release Governance and Fraud Engineering become required earlier",
    affectedPersonaIds: ["PER 4106", "PER 4103", "PER 4101"],
  },
  {
    id: "COND 100428", name: "Quarter End Restriction", priorValue: "5 business days", currentValue: "3 business days",
    impact: "Deployment window finding changes for the proposed release date",
    affectedPersonaIds: ["PER 4106", "PER 4104"],
  },
];

export const conditionSensitivityModes = ["Compare", "Use Current Approved", "Historical Simulation"] as const;

/* -------------------------------------------------------- analysis versions */

export interface PersonaImpactAnalysisVersion {
  id: string;
  evaluationId: string;
  version: string;
  previousVersionId: string | null;
  proposalVersion: string;
  personaVersions: string;
  conditionVersions: string;
  evidenceCoverage: number;
  personaScores: { personaId: string; score: number }[];
  findingIds: string[];
  conflictIds: string[];
  mitigationIds: string[];
  recommendationIds: string[];
  analysisConfidence: number;
  highestSeverity: ImpactSeverity;
  changeReason: string;
  createdBy: string;
  createdAt: string;
  timestamp: string;
  proposal: ProposalState;
}

function versionFrom(
  id: string, version: string, previous: string | null, reason: string, at: string,
  patch: Partial<ProposalState>, mitigationIds: string[] = [],
): PersonaImpactAnalysisVersion {
  const proposal: ProposalState = { ...initialProposal, ...patch };
  const r = resultSummary(proposal);
  const findings = impactPersonas.flatMap((p) => evaluatePersona(p.id, proposal));
  const highest = findings.reduce<ImpactSeverity>(
    (a, f) => (severityRank(f.severity) > severityRank(a) ? f.severity : a), "Informational");
  return {
    id, evaluationId: "EVAL 2048", version, previousVersionId: previous,
    proposalVersion: `PKG 5521 ${version}`,
    personaVersions: "Payments v3.4, Checkout v2.9, Fraud v4.1, SRE v3.7, Identity v2.4, Governance v1.8",
    conditionVersions: "18 approved conditions, current",
    evidenceCoverage: r.coverage,
    personaScores: r.scores.map((s) => ({ personaId: s.personaId, score: s.score })),
    findingIds: findings.map((f) => f.id),
    conflictIds: conflictsFor(proposal).map((c) => c.id),
    mitigationIds,
    recommendationIds: recommendations.map((x) => x.id),
    analysisConfidence: r.confidence,
    highestSeverity: highest,
    changeReason: reason, createdBy: "M. Chen", createdAt: at, timestamp: at, proposal,
  };
}

export const seededAnalysisVersions: PersonaImpactAnalysisVersion[] = [
  versionFrom("AV 1", "v1", null, "Initial analysis", "Today 08:12",
    { maxTraffic: 5, idempotencyEvidence: false }),
  versionFrom("AV 2", "v2", "AV 1", "After idempotency evidence", "Today 08:47",
    { maxTraffic: 5, idempotencyEvidence: true }),
  versionFrom("AV 3", "v3", "AV 2", "After traffic exposure changed to 15%", "Today 09:14",
    { maxTraffic: 15, idempotencyEvidence: true }),
  versionFrom("AV 4", "v4", "AV 3", "After mitigations accepted", "Today 09:41",
    { maxTraffic: 15, idempotencyEvidence: true }, ["MIT 5501", "MIT 5502", "MIT 5503"]),
];

export type ChangeKind = "Added" | "Removed" | "Changed" | "Unchanged" | "Material Change";

export interface VersionDiffRow { area: string; left: string; right: string; kind: ChangeKind }

export function diffVersions(a: PersonaImpactAnalysisVersion, b: PersonaImpactAnalysisVersion): VersionDiffRow[] {
  const kind = (l: string, r: string, material = false): ChangeKind =>
    l === r ? "Unchanged" : material ? "Material Change" : "Changed";
  const scoreText = (v: PersonaImpactAnalysisVersion) =>
    v.personaScores.map((s) => `${personaById(s.personaId).name} ${s.score}`).join(", ");
  return [
    { area: "Proposal", left: `${a.proposal.maxTraffic}% max traffic, ${a.proposal.retryAttempts} retries`, right: `${b.proposal.maxTraffic}% max traffic, ${b.proposal.retryAttempts} retries`, kind: kind(String(a.proposal.maxTraffic), String(b.proposal.maxTraffic), true) },
    { area: "Persona Scope", left: `${a.personaScores.length} Personas`, right: `${b.personaScores.length} Personas`, kind: kind(String(a.personaScores.length), String(b.personaScores.length)) },
    { area: "Persona Versions", left: a.personaVersions, right: b.personaVersions, kind: kind(a.personaVersions, b.personaVersions) },
    { area: "Applicable Conditions", left: a.conditionVersions, right: b.conditionVersions, kind: kind(a.conditionVersions, b.conditionVersions) },
    { area: "Findings", left: `${a.findingIds.length} findings`, right: `${b.findingIds.length} findings`, kind: a.findingIds.length === b.findingIds.length ? "Unchanged" : b.findingIds.length > a.findingIds.length ? "Added" : "Removed" },
    { area: "Scores", left: scoreText(a), right: scoreText(b), kind: kind(scoreText(a), scoreText(b), true) },
    { area: "Risks", left: `${a.findingIds.length} evaluated`, right: `${b.findingIds.length} evaluated`, kind: kind(String(a.findingIds.length), String(b.findingIds.length)) },
    { area: "Evidence", left: `${a.evidenceCoverage}% coverage`, right: `${b.evidenceCoverage}% coverage`, kind: kind(String(a.evidenceCoverage), String(b.evidenceCoverage), Math.abs(a.evidenceCoverage - b.evidenceCoverage) > 5) },
    { area: "Mitigations", left: a.mitigationIds.join(", ") || "None", right: b.mitigationIds.join(", ") || "None", kind: a.mitigationIds.length === b.mitigationIds.length ? "Unchanged" : b.mitigationIds.length > a.mitigationIds.length ? "Added" : "Removed" },
    { area: "Conflicts", left: `${a.conflictIds.length} conflicts`, right: `${b.conflictIds.length} conflicts`, kind: kind(String(a.conflictIds.length), String(b.conflictIds.length)) },
    { area: "Recommendations", left: `${a.recommendationIds.length}`, right: `${b.recommendationIds.length}`, kind: kind(String(a.recommendationIds.length), String(b.recommendationIds.length)) },
    { area: "Review State", left: a.mitigationIds.length ? "Review Complete" : "Review Required", right: b.mitigationIds.length ? "Review Complete" : "Review Required", kind: kind(String(!!a.mitigationIds.length), String(!!b.mitigationIds.length)) },
  ];
}

/* ------------------------------------------------------- decision package -- */

export interface PersonaImpactDecisionPackage {
  id: string;
  evaluationId: string;
  analysisVersionId: string;
  workItemId: string;
  personaIds: string[];
  personaVersions: string;
  findingIds: string[];
  opportunityIds: string[];
  conflictIds: string[];
  conditionIds: string[];
  dependencyPathIds: string[];
  riskIds: string[];
  controlIds: string[];
  mitigationIds: string[];
  evidenceIds: string[];
  missingEvidence: string[];
  reviewerIds: string[];
  personaPositions: { personaId: string; position: string }[];
  recommendedProceedConditions: string[];
  analysisConfidence: number;
  openIssues: string[];
  status: "Complete" | "Review Required" | "Needs Evidence" | "Blocked";
  createdAt: string;
}

export const proceedConditions = [
  "Validated fraud loss analysis",
  "Regional dependency stress test",
  "Idempotency controls",
  "Progressive rollout",
  "Rollback threshold",
  "Joint approval before traffic exceeds 10%",
];

export function buildDecisionPackage(
  proposal: ProposalState,
  analysisVersionId: string,
  acceptedMitigations: PersonaImpactMitigationVersion[],
  reviews: PersonaImpactReview[],
): PersonaImpactDecisionPackage {
  const r = resultSummary(proposal);
  const openIssues = [
    ...r.missingEvidence.map((m) => `Missing evidence: ${m}`),
    ...reviews.filter((x) => x.status === "Open" || x.status === "Evidence Requested").map((x) => `${x.id} ${x.reviewType} outstanding`),
    ...(r.conflictCount ? [`${r.conflictCount} open cross persona conflict(s)`] : []),
  ];
  const status: PersonaImpactDecisionPackage["status"] =
    r.missingEvidence.length > 1 ? "Needs Evidence"
      : openIssues.length > 2 ? "Review Required"
        : openIssues.length ? "Review Required" : "Complete";
  return {
    id: "PDP 3301", evaluationId: "EVAL 2048", analysisVersionId, workItemId: "INT 7001",
    personaIds: impactPersonas.map((p) => p.id),
    personaVersions: impactPersonas.map((p) => `${p.name} ${p.version}`).join(", "),
    findingIds: impactPersonas.flatMap((p) => evaluatePersona(p.id, proposal)).map((f) => f.id),
    opportunityIds: opportunities.map((o) => o.id),
    conflictIds: conflictsFor(proposal).map((c) => c.id),
    conditionIds: impactConditions.map((c) => c.id),
    dependencyPathIds: ["DEP 1", "DEP 2", "DEP 3"],
    riskIds: ["RSK 1", "RSK 2", "RSK 3"],
    controlIds: ["CTL 1", "CTL 2", "CTL 3"],
    mitigationIds: acceptedMitigations.map((m) => m.mitigationId),
    evidenceIds: impactEvidence.filter((e) => e.status === "Provided").map((e) => e.id),
    missingEvidence: r.missingEvidence,
    reviewerIds: ["Payments Reliability", "Fraud Engineering", "Site Reliability Engineering", "Release Governance"],
    personaPositions: crossTeamPositions.map((p) => ({ personaId: p.personaId, position: p.position })),
    recommendedProceedConditions: proceedConditions,
    analysisConfidence: r.confidence,
    openIssues,
    status,
    createdAt: "Today 09:44",
  };
}

/* --------------------------------------------------------------- routing -- */

export interface PersonaImpactRouting {
  id: string;
  evaluationId: string;
  analysisVersionId: string;
  destination: "Cross Team Impact Matrix" | "Decision Intelligence";
  validationStatus: "Passed" | "Passed with warnings" | "Blocked";
  blockingIssues: string[];
  warnings: string[];
  routedBy: string;
  routedAt: string;
  destinationRecordId: string;
  status: "Prepared" | "Routed";
}

export const matrixRoute = "/enterprise-cognitive-fabric/evaluation/cross-team-impact-matrix";
export const decisionRoute = "/enterprise-cognitive-fabric/evaluation/decision-intelligence";

export function validateRouting(
  destination: PersonaImpactRouting["destination"],
  pkg: PersonaImpactDecisionPackage,
  reviews: PersonaImpactReview[],
  analysisComplete: boolean,
) {
  const blocking: string[] = [];
  const warnings: string[] = [];
  if (!analysisComplete) blocking.push("Impact analysis is not complete");
  if (pkg.personaIds.length < 3) blocking.push("Required Personas have not been evaluated");
  if (destination === "Decision Intelligence") {
    const criticalUnacknowledged = reviews.filter((r) => r.severity === "Critical" && r.status === "Open");
    if (criticalUnacknowledged.length) blocking.push(`${criticalUnacknowledged.length} critical finding(s) not acknowledged`);
    if (!pkg.missingEvidence.length) warnings.push("No evidence gaps recorded");
    else warnings.push(`${pkg.missingEvidence.length} evidence gap(s) explicitly recorded and carried forward`);
    if (!pkg.mitigationIds.length) warnings.push("No mitigations captured");
    if (pkg.conflictIds.length) warnings.push("Material conflicts recorded and carried as decision topics");
  } else {
    if (!pkg.conflictIds.length) warnings.push("No conflicts to coordinate");
  }
  if (!pkg.analysisVersionId) blocking.push("Analysis version not preserved");
  const validationStatus: PersonaImpactRouting["validationStatus"] =
    blocking.length ? "Blocked" : warnings.length ? "Passed with warnings" : "Passed";
  return { blocking, warnings, validationStatus };
}

/* --------------------------------------------------------- notifications -- */

export const notificationTypes = [
  "Impact Analysis Started", "Impact Analysis Completed", "High Severity Finding", "Critical Finding",
  "Evidence Requested", "Evidence Added", "Persona Owner Review Requested", "Cross Team Review Requested",
  "Conflict Detected", "Mitigation Proposed", "Mitigation Accepted", "Analysis Recalculated",
  "Persona Version Changed", "Condition Version Changed", "Impact Package Ready", "Decision Reassessment Required",
] as const;

export type PiaNotificationType = (typeof notificationTypes)[number];

export interface PersonaImpactNotification {
  id: string;
  evaluationId: string;
  personaId: string;
  type: PiaNotificationType;
  title: string;
  description: string;
  severity: "Informational" | "Warning" | "Critical";
  owner: string;
  status: "Unread" | "Read" | "Acknowledged" | "Assigned";
  createdAt: string;
}

let notificationSeq = 100;
export function makeNotification(
  type: PiaNotificationType, title: string, description: string,
  severity: PersonaImpactNotification["severity"] = "Informational",
  personaId = "PER 4101", owner = "Analysis Services",
): PersonaImpactNotification {
  notificationSeq += 1;
  return {
    id: `PIN ${notificationSeq}`, evaluationId: "EVAL 2048", personaId, type, title, description,
    severity, owner, status: "Unread", createdAt: "Just now",
  };
}

export const seededNotifications: PersonaImpactNotification[] = [
  { id: "PIN 1", evaluationId: "EVAL 2048", personaId: "PER 4103", type: "High Severity Finding", title: "High fraud impact identified", description: "Checkout Retry Policy raises fraud loss exposure for Fraud Engineering.", severity: "Warning", owner: "Fraud Engineering", status: "Unread", createdAt: "Today 10:22" },
  { id: "PIN 2", evaluationId: "EVAL 2048", personaId: "PER 4106", type: "Conflict Detected", title: "Governance conflict detected", description: "Payments expansion preference conflicts with approval threshold.", severity: "Warning", owner: "Release Governance", status: "Unread", createdAt: "Today 10:14" },
  { id: "PIN 3", evaluationId: "EVAL 2048", personaId: "PER 4101", type: "Evidence Added", title: "Idempotency evidence added", description: "Idempotency test results attached to duplicate transaction finding.", severity: "Informational", owner: "Payments Platform", status: "Read", createdAt: "Today 10:09" },
  { id: "PIN 4", evaluationId: "EVAL 2050", personaId: "PER 4104", type: "Critical Finding", title: "Critical dependency availability finding", description: "Regional Token Vault Migration threatens dependency availability.", severity: "Critical", owner: "Site Reliability Engineering", status: "Unread", createdAt: "Today 09:31" },
  { id: "PIN 5", evaluationId: "EVAL 2048", personaId: "PER 4103", type: "Evidence Requested", title: "Fraud loss analysis requested", description: "Fraud loss analysis requested before traffic expansion.", severity: "Warning", owner: "Fraud Engineering", status: "Unread", createdAt: "Today 10:03" },
];

/* ------------------------------------------------------- recent activity -- */

export interface PiaActivityEvent {
  id: string;
  time: string;
  text: string;
  category: string;
  evaluationId: string;
}

export const seededRecentActivity: PiaActivityEvent[] = [
  { id: "RA 1", time: "10:22 AM", text: "Checkout Retry Policy identified High Fraud Engineering impact", category: "Finding", evaluationId: "EVAL 2048" },
  { id: "RA 2", time: "10:18 AM", text: "Payments Platform impact score recalculated to 68", category: "Score", evaluationId: "EVAL 2048" },
  { id: "RA 3", time: "10:14 AM", text: "Traffic exposure increased to 15%, joint approval rule activated", category: "Scenario", evaluationId: "EVAL 2048" },
  { id: "RA 4", time: "10:09 AM", text: "Idempotency evidence added", category: "Evidence", evaluationId: "EVAL 2048" },
  { id: "RA 5", time: "10:06 AM", text: "SRE dependency mitigation accepted", category: "Mitigation", evaluationId: "EVAL 2048" },
  { id: "RA 6", time: "10:03 AM", text: "Fraud loss evidence requested", category: "Evidence", evaluationId: "EVAL 2048" },
  { id: "RA 7", time: "9:58 AM", text: "Release Governance Persona added to evaluation", category: "Scope", evaluationId: "EVAL 2048" },
  { id: "RA 8", time: "9:52 AM", text: "Prior retry outcome linked to EVAL 2048", category: "Evidence", evaluationId: "EVAL 2048" },
];

let activitySeq = 100;
export function makeActivity(text: string, category: string): PiaActivityEvent {
  activitySeq += 1;
  return { id: `RA ${activitySeq}`, time: "Just now", text, category, evaluationId: "EVAL 2048" };
}

/* ------------------------------------------------------------ start flow -- */

export const startSteps = [
  "Select Intake Package", "Select Team Personas", "Analysis Scope", "Context Rules",
  "Quality Controls", "Review", "Execute",
] as const;

export const intakePackages = [
  { id: "INT 7001", title: "Checkout Retry Policy Update", completeness: 94, routedAt: "Today 08:02", team: "Checkout Engineering" },
  { id: "INT 7002", title: "Regional Token Vault Migration", completeness: 88, routedAt: "Yesterday 15:40", team: "Platform Engineering" },
  { id: "INT 7003", title: "Fraud Threshold Adjustment", completeness: 91, routedAt: "Yesterday 11:20", team: "Fraud Engineering" },
  { id: "INT 7004", title: "Checkout Latency Budget Change", completeness: 86, routedAt: "2 days ago", team: "Site Reliability Engineering" },
];

export const analysisScopeOptions = [
  "Objectives", "Metrics", "Service Levels", "Constraints", "Policies", "Dependencies",
  "Risks", "Controls", "Decision Rules", "Approval Requirements", "Operational Windows",
  "Customer Impact", "Financial Impact", "Security Impact", "Reliability Impact",
];

export const contextRuleOptions = [
  "Use Current Approved Persona Versions", "Allow Supporting Conditions", "Include Historical Decisions",
  "Include Outcomes", "Include Learning Records", "Require Current Active Conditions", "Respect Access Context",
];

export const qualityControlDefaults = {
  "Minimum Persona Confidence": 85,
  "Minimum Condition Authority": 80,
  "Minimum Evidence Coverage": 85,
  "Minimum Dependency Confidence": 80,
  "Human Review Threshold": 60,
  "High Severity Threshold": 70,
};

export const executionSteps = [
  "Loading Intake Package", "Loading Personas", "Retrieving Persona Context", "Matching Conditions",
  "Tracing Dependencies", "Evaluating Objectives", "Evaluating Constraints", "Evaluating Risks",
  "Evaluating Decision Logic", "Calculating Persona Impact", "Detecting Conflicts",
  "Generating Recommendations", "Completed",
] as const;

/* ------------------------------------------------------- persona scoping -- */

export interface PersonaCandidate {
  personaId: string;
  team: string;
  matchConfidence: number;
  whyIncluded: string;
  dependencyRelationship: string;
  applicableConditions: number;
  potentialSignals: string;
  included: boolean;
  primary: boolean;
  status: "Suggested" | "Included" | "Excluded" | "Added Manually";
}

export const personaCandidates: PersonaCandidate[] = [
  { personaId: "PER 4101", team: "Payments Platform", matchConfidence: 96, whyIncluded: "Owns the Payments API changed by the proposal", dependencyRelationship: "Direct owner", applicableConditions: 6, potentialSignals: "Duplicate authorization, reliability, governance", included: true, primary: true, status: "Included" },
  { personaId: "PER 4102", team: "Checkout Engineering", matchConfidence: 94, whyIncluded: "Submitting team and owner of the Retry Orchestrator", dependencyRelationship: "Direct owner", applicableConditions: 5, potentialSignals: "Completion opportunity, latency risk", included: true, primary: false, status: "Included" },
  { personaId: "PER 4103", team: "Fraud Engineering", matchConfidence: 92, whyIncluded: "Fraud Decision Service is invoked on each retry attempt", dependencyRelationship: "Downstream dependency owner", applicableConditions: 4, potentialSignals: "Fraud loss, decision volume", included: true, primary: false, status: "Included" },
  { personaId: "PER 4104", team: "Site Reliability Engineering", matchConfidence: 90, whyIncluded: "Owns error budget, dependency health, and rollback readiness", dependencyRelationship: "Reliability owner", applicableConditions: 5, potentialSignals: "Saturation, rollback readiness", included: true, primary: false, status: "Included" },
  { personaId: "PER 4105", team: "Identity Engineering", matchConfidence: 84, whyIncluded: "Identity Services validate tokens for each attempt", dependencyRelationship: "Transitive dependency owner", applicableConditions: 3, potentialSignals: "Validation load, residency", included: true, primary: false, status: "Included" },
  { personaId: "PER 4106", team: "Release Governance", matchConfidence: 88, whyIncluded: "Owns approval requirements and change window policy", dependencyRelationship: "Governance authority", applicableConditions: 4, potentialSignals: "Approval activation, change window", included: true, primary: false, status: "Included" },
];

/* -------------------------------------------------------------- evidence -- */

export const evidenceRequestTypes = [
  "Test Results", "Load Test", "Fraud Analysis", "Security Review", "Dependency Validation",
  "Rollback Test", "Customer Analysis", "Financial Analysis", "Compliance Review", "Architecture Evidence",
];

export const evidenceActions = [
  "Request Evidence", "Add Evidence", "Mark Not Applicable", "Link Existing Evidence", "Open Evidence",
] as const;

/* ---------------------------------------------------------------- search -- */

export type SearchResultType =
  | "Impact Evaluation" | "Work Item" | "Persona" | "Finding" | "Condition" | "Risk" | "Control"
  | "Mitigation" | "Evidence" | "Dependency" | "Conflict" | "Scenario" | "Analysis Version" | "Review Task";

export interface PiaSearchResult {
  id: string;
  type: SearchResultType;
  evaluation: string;
  persona: string;
  finding: string;
  severity: string;
  confidence: number;
  status: string;
}

export const searchExamples = [
  "High impacts on Fraud Engineering",
  "Evaluations requiring Release Governance",
  "Retry changes with missing fraud evidence",
  "Findings caused by Identity Services",
  "Evaluations using Payments Persona v3.3",
  "Critical dependency impacts",
];

export function searchAll(
  query: string, proposal: ProposalState, reviews: PersonaImpactReview[],
  versions: PersonaImpactAnalysisVersion[], scenarios: PersonaImpactScenario[],
  mitigationVersions: PersonaImpactMitigationVersion[],
): PiaSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: PiaSearchResult[] = [];
  const push = (r: PiaSearchResult, ...hay: string[]) => {
    if (hay.join(" ").toLowerCase().includes(q)) out.push(r);
  };

  push({ id: "EVAL 2048", type: "Impact Evaluation", evaluation: "Checkout Retry Policy Update", persona: "6 Personas", finding: "—", severity: "High", confidence: 93, status: "Analyzing" },
    "EVAL 2048 checkout retry policy update evaluation");
  push({ id: "INT 7001", type: "Work Item", evaluation: "Checkout Retry Policy Update", persona: "—", finding: "—", severity: "—", confidence: 94, status: "Routed" },
    "INT 7001 checkout retry work item");

  impactPersonas.forEach((p) => push(
    { id: p.id, type: "Persona", evaluation: "EVAL 2048", persona: p.name, finding: "—", severity: "—", confidence: p.confidence, status: p.freshness },
    p.name, p.version, p.mission, p.owner, ...p.decisionPriorities));

  impactPersonas.forEach((p) => evaluatePersona(p.id, proposal).forEach((f) => push(
    { id: f.id, type: "Finding", evaluation: "EVAL 2048", persona: p.name, finding: f.title, severity: f.severity, confidence: f.confidence, status: f.status },
    f.title, f.description, f.impactDimension, p.name, f.severity, f.direction)));

  impactConditions.forEach((c) => push(
    { id: c.id, type: "Condition", evaluation: "EVAL 2048", persona: c.personaIds.map((x) => personaById(x).name).join(", "), finding: c.statement, severity: c.conditionType, confidence: c.confidence, status: c.status },
    c.id, c.statement, c.conditionType, c.authority));

  impactEvidence.forEach((e) => push(
    { id: e.id, type: "Evidence", evaluation: "EVAL 2048", persona: e.personaIds.map((x) => personaById(x).name).join(", "), finding: e.name, severity: e.status, confidence: e.quality, status: e.status },
    e.id, e.name, e.summary, e.evidenceType, e.status === "Missing" ? "missing evidence" : "provided"));

  mitigationVersions.forEach((m) => push(
    { id: m.id, type: "Mitigation", evaluation: "EVAL 2048", persona: personaById(m.personaId).name, finding: m.title, severity: m.residualSeverity, confidence: m.confidence, status: m.status },
    m.title, m.findingTitle, m.owner, m.status));

  conflictsFor(proposal).forEach((c) => push(
    { id: c.id, type: "Conflict", evaluation: "EVAL 2048", persona: `${personaById(c.personaAId).name} vs ${personaById(c.personaBId).name}`, finding: c.description, severity: c.severity, confidence: 90, status: c.reviewStatus },
    c.description, c.conflictType, c.personaAPosition, c.personaBPosition));

  scenarios.forEach((s) => push(
    { id: s.id, type: "Scenario", evaluation: "EVAL 2048", persona: "All", finding: s.name, severity: `${s.trafficExposure}% traffic`, confidence: 92, status: s.progressiveRollout ? "Progressive" : "Direct" },
    s.name, s.description));

  versions.forEach((v) => push(
    { id: v.id, type: "Analysis Version", evaluation: "EVAL 2048", persona: "All", finding: v.changeReason, severity: v.highestSeverity, confidence: v.analysisConfidence, status: v.version },
    v.version, v.changeReason, v.personaVersions));

  reviews.forEach((r) => push(
    { id: r.id, type: "Review Task", evaluation: r.evaluationTitle, persona: personaById(r.personaId).name, finding: r.findingTitle, severity: r.severity, confidence: r.evidenceCoverage, status: r.status },
    r.id, r.findingTitle, r.reviewType, r.reviewer, personaById(r.personaId).name, r.severity));

  ["Regional Token Vault", "Identity Services", "Fraud Decision Service"].forEach((d, i) => push(
    { id: `DEP ${i + 1}`, type: "Dependency", evaluation: "EVAL 2048", persona: "SRE", finding: d, severity: "Critical", confidence: 92, status: "Traced" }, d, "dependency"));

  return out.slice(0, 60);
}

/* ---------------------------------------------------------------- export -- */

export const exportFormats = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot"] as const;
export const exportScopes = [
  "Current Evaluation", "Selected Evaluations", "Current Persona", "All Persona Findings",
  "Conflicts", "Opportunities", "Evidence", "Mitigations", "Scenario Comparison",
  "Version Comparison", "Decision Package", "Full Impact Analysis",
] as const;
export const exportOptions = [
  "Proposal", "Persona Context", "Persona Versions", "Conditions", "Findings", "Scores",
  "Dependencies", "Risks", "Controls", "Evidence", "Conflicts", "Mitigations", "Reviews",
  "Recommendations", "History",
];

const csvEscape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const head = Object.keys(rows[0]);
  return [head.join(","), ...rows.map((r) => head.map((h) => csvEscape(r[h])).join(","))].join("\n");
}

export function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value.map((v) => (typeof v === "object" && v !== null
      ? `${pad}-\n${toYaml(v, indent + 1)}`
      : `${pad}- ${String(v)}`)).join("\n");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      (typeof v === "object" && v !== null)
        ? `${pad}${k}:\n${toYaml(v, indent + 1)}`
        : `${pad}${k}: ${String(v)}`).join("\n");
  }
  return `${pad}${String(value)}`;
}

export function buildExportRows(
  scope: string, proposal: ProposalState, mitigationVersions: PersonaImpactMitigationVersion[],
  reviews: PersonaImpactReview[], personaId: string,
): Record<string, unknown>[] {
  const findingRows = (ids: string[]) => impactPersonas
    .filter((p) => ids.includes(p.id))
    .flatMap((p) => evaluatePersona(p.id, proposal).map((f) => ({
      finding: f.id, persona: p.name, dimension: f.impactDimension, direction: f.direction,
      severity: f.severity, confidence: f.confidence, evidence: f.evidenceReferenceIds.join("; ") || "Gap",
    })));
  switch (scope) {
    case "Current Persona": return findingRows([personaId]);
    case "Conflicts": return conflictsFor(proposal).map((c) => ({ conflict: c.id, type: c.conflictType, personaA: personaById(c.personaAId).name, personaB: personaById(c.personaBId).name, severity: c.severity, status: c.reviewStatus }));
    case "Opportunities": return opportunities.map((o) => ({ opportunity: o.id, title: o.title, benefit: o.benefitType, confidence: o.confidence }));
    case "Evidence": return impactEvidence.map((e) => ({ evidence: e.id, name: e.name, type: e.evidenceType, status: e.status, authority: e.authority }));
    case "Mitigations": return mitigationVersions.map((m) => ({ mitigation: m.id, title: m.title, persona: personaById(m.personaId).name, original: m.originalSeverity, residual: m.residualSeverity, status: m.status }));
    case "Version Comparison": return diffVersions(seededAnalysisVersions[0], seededAnalysisVersions[3]).map((d) => ({ area: d.area, from: d.left, to: d.right, change: d.kind }));
    case "Scenario Comparison": return seededScenarios.flatMap((s) => impactPersonas.map((p) => ({ scenario: s.name, persona: p.name, ...scenarioPersonaMetrics(s, p.id) })));
    case "Decision Package": {
      const pkg = buildDecisionPackage(proposal, "AV 4", mitigationVersions.filter((m) => m.accepted), reviews);
      return [{ package: pkg.id, status: pkg.status, personas: pkg.personaIds.length, findings: pkg.findingIds.length, conflicts: pkg.conflictIds.length, confidence: pkg.analysisConfidence, openIssues: pkg.openIssues.join("; ") || "None" }];
    }
    default: return findingRows(impactPersonas.map((p) => p.id));
  }
}

/* ----------------------------------------------------------- demo story -- */

export interface StoryStep {
  id: number;
  title: string;
  caption: string;
  target: string;
  notes: string;
  apply?: Partial<ProposalState>;
  personaId?: string;
  acceptMitigations?: boolean;
}

export const storySteps: StoryStep[] = [
  { id: 1, title: "Portfolio", target: "panel-kpis", notes: "Set the frame before opening a single evaluation.", caption: "Persona Impact Analysis evaluates one proposed change through the operating context of every team that may be affected." },
  { id: 2, title: "Open the evaluation", target: "panel-queue", notes: "One proposal, many perspectives.", caption: "The same proposal is evaluated differently depending on each team's mission, objectives, constraints, dependencies, risks, and decision rules." },
  { id: 3, title: "Payments Platform", target: "panel-workbench", personaId: "PER 4101", notes: "Show both benefit and exposure.", caption: "For Payments, the change may improve transaction completion but creates reliability, duplicate processing, dependency, and governance exposure." },
  { id: 4, title: "Checkout Engineering", target: "panel-workbench", personaId: "PER 4102", notes: "The opportunity is strongest here.", caption: "Checkout sees a stronger customer completion opportunity, but still inherits latency and payment reliability risk." },
  { id: 5, title: "Fraud Engineering", target: "panel-workbench", personaId: "PER 4103", notes: "Asymmetric impact is the point.", caption: "Fraud Engineering sees little direct benefit and materially more fraud and service load risk." },
  { id: 6, title: "Evidence trace", target: "panel-evidence", notes: "Traceability, not opinion.", caption: "Every impact finding remains traceable to approved business conditions, Team Persona context, prior outcomes, and exact enterprise evidence." },
  { id: 7, title: "Traffic exposure 15%", target: "panel-simulator", apply: { maxTraffic: 15 }, notes: "Governed rule activation.", caption: "As the proposal changes, the analysis immediately activates the governed rule requiring Payments Reliability and Fraud Engineering review above ten percent traffic exposure." },
  { id: 8, title: "Progressive rollout off", target: "panel-simulator", apply: { progressiveRollout: false }, notes: "Reversibility matters.", caption: "Removing reversibility increases operational impact because the proposed change is harder to contain." },
  { id: 9, title: "Add evidence", target: "panel-evidence", apply: { progressiveRollout: true, fraudLossEvidence: true, dependencyStressEvidence: true }, notes: "Evidence changes confidence, not history.", caption: "New evidence changes confidence and closes evidence gaps without erasing the original analysis." },
  { id: 10, title: "Apply mitigations", target: "panel-mitigation", acceptMitigations: true, notes: "Residual, not erased.", caption: "Mitigations reduce residual impact while preserving the original risk finding and its evidence." },
  { id: 11, title: "Conflicts", target: "panel-conflicts", notes: "Differences stay visible.", caption: "The Fabric makes differences in team priorities visible rather than forcing every team into one averaged perspective." },
  { id: 12, title: "Decision package", target: "panel-decision-package", notes: "Handoff, not verdict.", caption: "The completed analysis becomes structured input for cross team coordination and decision intelligence, not a black box recommendation." },
];

/* -------------------------------------------------------- demo scenarios -- */

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  proposal?: Partial<ProposalState>;
  operationalState: PiaOperationalState;
  acceptMitigations?: boolean;
  personaId?: string;
  emptyQueue?: boolean;
  error?: boolean;
  loading?: boolean;
  reset?: boolean;
  notification?: { type: PiaNotificationType; title: string; description: string; severity: PersonaImpactNotification["severity"] };
  activity?: string;
}

export const demoScenarios: DemoScenario[] = [
  { id: "DS 1", name: "Healthy Evaluation Portfolio", description: "Baseline portfolio with contained exposure", proposal: { maxTraffic: 5, progressiveRollout: true, idempotencyEvidence: true, fraudLossEvidence: true, dependencyStressEvidence: true }, operationalState: "Analysis Complete", activity: "Portfolio reset to healthy baseline" },
  { id: "DS 2", name: "New Impact Evaluation", description: "Fresh evaluation entering analysis", proposal: { maxTraffic: 5, fraudLossEvidence: false, dependencyStressEvidence: false }, operationalState: "Analyzing", activity: "New impact evaluation started", notification: { type: "Impact Analysis Started", title: "Impact analysis started", description: "EVAL 2048 analysis started for six Personas.", severity: "Informational" } },
  { id: "DS 3", name: "High Fraud Risk", description: "Broad exposure without fraud evidence", proposal: { maxTraffic: 50, fraudLossEvidence: false }, personaId: "PER 4103", operationalState: "Review Required", activity: "High fraud impact identified", notification: { type: "High Severity Finding", title: "High fraud impact", description: "Fraud loss exposure increases at fifty percent traffic.", severity: "Warning" } },
  { id: "DS 4", name: "High Reliability Risk", description: "No progressive rollout at high exposure", proposal: { maxTraffic: 100, progressiveRollout: false }, personaId: "PER 4104", operationalState: "Review Required", activity: "High reliability impact identified" },
  { id: "DS 5", name: "Dependency Saturation", description: "Dependency stress test missing at scale", proposal: { maxTraffic: 50, dependencyStressEvidence: false }, personaId: "PER 4105", operationalState: "Needs Evidence", activity: "Dependency saturation risk raised" },
  { id: "DS 6", name: "Approval Threshold Triggered", description: "Traffic above ten percent", proposal: { maxTraffic: 15 }, personaId: "PER 4106", operationalState: "Review Required", activity: "Joint approval rule activated", notification: { type: "Condition Version Changed", title: "Approval requirement activated", description: "Traffic exposure above ten percent requires joint approval.", severity: "Warning" } },
  { id: "DS 7", name: "Quarter End Restriction Triggered", description: "Deployment inside restricted window", proposal: { deploymentTiming: "Quarter end window" }, personaId: "PER 4106", operationalState: "Blocked", activity: "Quarter end restriction activated" },
  { id: "DS 8", name: "Missing Fraud Evidence", description: "Fraud loss analysis absent", proposal: { fraudLossEvidence: false }, operationalState: "Needs Evidence", activity: "Fraud loss evidence gap recorded" },
  { id: "DS 9", name: "Missing Dependency Evidence", description: "Dependency stress test absent", proposal: { dependencyStressEvidence: false }, operationalState: "Needs Evidence", activity: "Dependency evidence gap recorded" },
  { id: "DS 10", name: "Progressive Rollout Disabled", description: "Reversibility removed", proposal: { progressiveRollout: false }, operationalState: "Mitigation Required", activity: "Progressive rollout disabled" },
  { id: "DS 11", name: "Idempotency Evidence Removed", description: "Duplicate transaction exposure grows", proposal: { idempotencyEvidence: false }, personaId: "PER 4101", operationalState: "Needs Evidence", activity: "Idempotency evidence removed" },
  { id: "DS 12", name: "Mitigation Applied", description: "All mitigations accepted", acceptMitigations: true, operationalState: "Review Complete", activity: "Mitigations accepted", notification: { type: "Mitigation Accepted", title: "Mitigations accepted", description: "Residual impact recalculated with original findings preserved.", severity: "Informational" } },
  { id: "DS 13", name: "Persona Conflict Detected", description: "Governance and Payments in tension", proposal: { maxTraffic: 25 }, operationalState: "Conflict Detected", activity: "Persona conflict detected" },
  { id: "DS 14", name: "Persona Version Changed", description: "Payments Platform v3.3 to v3.4", operationalState: "Analysis Complete", activity: "Payments Platform Persona version changed", notification: { type: "Persona Version Changed", title: "Persona version changed", description: "Payments Platform moved from v3.3 to v3.4.", severity: "Warning" } },
  { id: "DS 15", name: "Condition Version Changed", description: "Approval threshold moved to ten percent", operationalState: "Analysis Complete", activity: "Approval condition version changed", notification: { type: "Condition Version Changed", title: "Condition version changed", description: "Retry approval requirement moved from twenty to ten percent.", severity: "Warning" } },
  { id: "DS 16", name: "Human Review Required", description: "Material findings awaiting review", proposal: { maxTraffic: 15 }, operationalState: "Review Required", activity: "Human review required" },
  { id: "DS 17", name: "Analysis Recalculated", description: "Reanalysis completed", operationalState: "Analysis Complete", activity: "Analysis recalculated", notification: { type: "Analysis Recalculated", title: "Analysis recalculated", description: "Impact scores and recommendations refreshed.", severity: "Informational" } },
  { id: "DS 18", name: "Decision Package Ready", description: "Evidence complete and mitigations accepted", proposal: { fraudLossEvidence: true, dependencyStressEvidence: true, idempotencyEvidence: true }, acceptMitigations: true, operationalState: "Decision Package Ready", activity: "Impact decision package ready", notification: { type: "Impact Package Ready", title: "Impact package ready", description: "Decision package prepared for coordination and decision intelligence.", severity: "Informational" } },
  { id: "DS 19", name: "Reset Demo Data", description: "Restore all seeded Prompt 1 and Prompt 2 state", reset: true, operationalState: "Analysis Complete", activity: "Demo data reset" },
];

/* --------------------------------------------------------- readiness ------ */

export function readinessState(
  proposal: ProposalState, reviews: PersonaImpactReview[],
  mitigationVersions: PersonaImpactMitigationVersion[], analysisComplete: boolean,
) {
  const r = resultSummary(proposal);
  const reviewsComplete = reviews.filter((x) => x.status === "Approved").length;
  const humanReviewCoverage = Math.round((reviewsComplete / Math.max(1, reviews.length)) * 100);
  const mitigationCoverage = Math.round(
    (mitigationVersions.filter((m) => m.accepted).length / Math.max(1, mitigationVersions.length)) * 100);
  return {
    personaCoverage: 100,
    conditionCoverage: 94,
    dependencyCoverage: 92,
    evidenceCoverage: r.coverage,
    findingTraceability: 98,
    humanReviewCoverage,
    mitigationCoverage,
    analysisConfidence: r.confidence,
    criticalOpenIssues: r.missingEvidence.length + reviews.filter((x) => x.severity === "Critical" && x.status === "Open").length,
    analysisComplete,
    reviewComplete: humanReviewCoverage === 100,
    decisionReady: analysisComplete && humanReviewCoverage === 100 && mitigationCoverage > 0,
    matrixReady: analysisComplete,
    decisionIntelligenceReady: analysisComplete && r.coverage >= 80,
  };
}
