/**
 * Organizational Learning — Prompt 1 domain models and deterministic seed data.
 *
 * OBSERVE. COMPARE. UNDERSTAND. VALIDATE. REMEMBER. REUSE.
 *
 * Service boundary note: every export in this file is a pure, deterministic
 * demonstration source. Replacing the seed constants and the `derive*`
 * functions with enterprise API responses is the only change required to move
 * this module onto live outcome, evidence and memory services.
 */

import type { Tone } from "../persona-studio/primitives";

/* ============================================================ view + tone */

export type OlView = "queue" | "workbench" | "outcome" | "pattern";

export const olViews: { id: OlView; label: string }[] = [
  { id: "queue", label: "Learning Queue" },
  { id: "workbench", label: "Workbench" },
  { id: "outcome", label: "Outcome Analysis" },
  { id: "pattern", label: "Patterns" },
];

export const olTone = (s: string): Tone =>
  ["Operational", "Validated", "Effective", "High", "Healthy", "Running", "Complete", "Within Expected Range",
    "Exceeded Positive", "Learning Package Ready", "Aligned", "Supports Candidate", "No", "Within SLA",
    "Applies To", "Preserved", "On Target"].includes(s) ? "green"
    : ["Warning", "Review Required", "Analyzing", "Partially Validated", "Near Threshold", "Adequate",
      "Publication Pending", "Mixed", "Medium", "Conditional", "Potentially Applies To", "Candidate",
      "Relevant Constraint", "Pending"].includes(s) ? "amber"
      : ["Degraded", "Learning Conflict", "Needs Evidence", "Evidence Required", "Material Negative Variance",
        "Negative Variance", "Invalidated", "Partially Invalidated", "Insufficient", "Insufficient Evidence",
        "Failed", "Critical", "Yes", "Does Not Apply", "Contradicted"].includes(s) ? "red"
        : ["Paused", "Idle", "Unresolved", "Unknown", "Observation Incomplete", "Not Applicable", "Draft",
          "Historical", "Low"].includes(s) ? "slate" : "blue";

/* ================================================================= models */

export interface OrganizationalLearningAnalysis {
  id: string;
  decisionId: string;
  decisionRecordVersionId: string;
  decisionContextSnapshotId: string;
  workItemId: string;
  workItem: string;
  decisionDate: string;
  status: string;
  owner: string;
  businessUnit: string;
  decisionOwner: string;
  decisionType: string;
  submittingTeam: string;
  affectedTeams: string[];
  knowledgeDomain: string;
  product: string;
  service: string;
  system: string;
  customerJourney: string;
  environment: string;
  region: string;
  observationStart: string;
  observationEnd: string;
  observationWindow: string;
  expectedOutcomeIds: string[];
  observedOutcomeIds: string[];
  varianceIds: string[];
  assumptionEvaluationIds: string[];
  riskRealizationIds: string[];
  controlEffectivenessIds: string[];
  mitigationEffectivenessIds: string[];
  unexpectedConsequenceIds: string[];
  learningCandidateIds: string[];
  materialVariances: number;
  evidenceCoverage: number;
  causalConfidence: number;
  currentStageId: string;
  learningPackageId: string;
  outcomeStatus: string;
  learningStatus: string;
  varianceDirection: string;
  varianceSeverity: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionExpectation {
  id: string;
  analysisId: string;
  decisionId: string;
  metric: string;
  baseline: string;
  expectedValue: string;
  expectedRange: string;
  observationWindow: string;
  owner: string;
}

export interface OutcomeObservation {
  id: string;
  analysisId: string;
  decisionId: string;
  expectedOutcomeId: string;
  metric: string;
  baseline: string;
  observedValue: string;
  unit: string;
  observationStart: string;
  observationEnd: string;
  observationPeriod: string;
  evidenceReferenceIds: string[];
  owner: string;
  confidence: number;
  assessment: string;
  note?: string;
  status: string;
}

export type VarianceDirection = "Positive" | "Negative" | "Neutral" | "Mixed";

export interface OutcomeVariance {
  id: string;
  analysisId: string;
  expectedOutcomeId: string;
  outcomeObservationId: string;
  metric: string;
  dimension: string;
  expectedValue: string;
  expectedRange: string;
  observedValue: string;
  varianceDirection: VarianceDirection;
  varianceMagnitude: string;
  absoluteDifference: string;
  relativeDifference: string;
  thresholdDifference: string;
  materiality: string;
  affectedPersonaIds: string[];
  evidenceReferenceIds: string[];
  contributors: string[];
  interpretation: string;
  mitigationEffect?: string;
  confidence: number;
  status: string;
}

export interface AssumptionEvaluation {
  id: string;
  analysisId: string;
  decisionAssumption: string;
  originalConfidence: number;
  validationState: string;
  reason: string;
  outcomeObservationIds: string[];
  evidenceReferenceIds: string[];
  confidence: number;
  status: string;
}

export interface RiskRealization {
  id: string;
  analysisId: string;
  riskId: string;
  risk: string;
  predictedSeverity: string;
  materialized: string;
  observedSeverity: string;
  observedResult: string;
  controlIds: string[];
  outcomeObservationIds: string[];
  evidenceReferenceIds: string[];
  learningImplication: string;
  confidence: number;
}

export interface ControlEffectiveness {
  id: string;
  analysisId: string;
  controlId: string;
  control: string;
  controlType: string;
  expectedPurpose: string;
  applied: string;
  observedEffect: string;
  effectiveness: string;
  limitation: string;
  evidenceReferenceIds: string[];
  confidence: number;
  learningCandidateId: string | null;
}

export interface MitigationEffectiveness {
  id: string;
  analysisId: string;
  mitigationId: string;
  mitigation: string;
  expectedEffect: string;
  observedEffect: string;
  variance: string;
  effectiveness: string;
  evidenceReferenceIds: string[];
  confidence: number;
}

export interface UnexpectedConsequence {
  id: string;
  analysisId: string;
  title: string;
  description: string;
  direction: "Positive" | "Negative" | "Mixed";
  severity: string;
  affectedPersonaIds: string[];
  affectedTeams: string[];
  customerImpact: string;
  businessImpact: string;
  evidenceReferenceIds: string[];
  wasPredicted: string;
  learningCandidateId: string | null;
}

export type LearningType =
  | "Control Improvement" | "Risk Recalibration" | "Mitigation Effectiveness" | "Decision Pattern"
  | "Conditional Outcome Pattern" | "Dependency Behavior" | "Customer Behavior" | "Operational Behavior"
  | "Policy Insight" | "Evidence Requirement" | "Escalation Insight" | "Approval Insight"
  | "Failure Pattern" | "Success Pattern" | "Invalidated Assumption" | "Validated Assumption"
  | "Unexpected Consequence" | "Observed Dependency Behavior";

export const learningTypes: LearningType[] = [
  "Control Improvement", "Risk Recalibration", "Mitigation Effectiveness", "Decision Pattern",
  "Conditional Outcome Pattern", "Dependency Behavior", "Observed Dependency Behavior", "Customer Behavior",
  "Operational Behavior", "Policy Insight", "Evidence Requirement", "Escalation Insight", "Approval Insight",
  "Failure Pattern", "Success Pattern", "Invalidated Assumption", "Validated Assumption", "Unexpected Consequence",
];

export interface LearningCandidate {
  id: string;
  analysisId: string;
  decisionId: string;
  candidateNumber: string;
  title: string;
  description: string;
  learningType: LearningType;
  triggerType: string;
  trigger: string;
  triggerIds: string[];
  supportingOutcomeIds: string[];
  evidenceReferenceIds: string[];
  causalConfidence: number;
  applicabilityConfidence: number;
  applicableScopes: string[];
  potentialScopes: string[];
  excludedScopes: string[];
  unknownScopes: string[];
  affectedPersonaIds: string[];
  affectedTeams: string[];
  potentialMemoryUpdateTypes: string[];
  relatedLearningIds: string[];
  conflictIds: string[];
  status: string;
  createdAt: string;
}

export interface LearningApplicability {
  id: string;
  learningCandidateId: string;
  scopeType: string;
  scopeValue: string;
  applicabilityState: "Applies To" | "Potentially Applies To" | "Does Not Apply" | "Unknown";
  confidence: number;
  reason: string;
  evidenceReferenceIds: string[];
  additionalEvidenceRequired: string;
}

export interface LearningCausalAssessment {
  id: string;
  learningCandidateId: string;
  temporalAlignment: number;
  evidenceQuality: number;
  alternativeExplanationCoverage: number;
  controlComparison: number;
  priorPatternSupport: number;
  mechanismPlausibility: number;
  outcomeConsistency: number;
  scopeConsistency: number;
  overallConfidence: number;
  status: string;
}

export interface LearningContradiction {
  id: string;
  learningCandidateId: string;
  existingRecordType: string;
  existingRecordId: string;
  existingRecord: string;
  conflictType: string;
  description: string;
  authorityComparison: string;
  evidenceReferenceIds: string[];
  severity: string;
  potentialResolution: string;
  status: string;
}

export interface LearningPatternCandidate {
  id: string;
  title: string;
  description: string;
  patternType: string;
  decisionIds: string[];
  decisionCount: number;
  supportingOutcomeIds: string[];
  supportingCount: number;
  contradictingCount: number;
  insufficientCount: number;
  confidence: number;
  status: string;
}

export interface LearningPackage {
  id: string;
  analysisId: string;
  decisionId: string;
  decisionContextSnapshotId: string;
  expectedOutcomeIds: string[];
  observedOutcomeIds: string[];
  varianceIds: string[];
  assumptionEvaluationIds: string[];
  riskRealizationIds: string[];
  controlEffectivenessIds: string[];
  mitigationEffectivenessIds: string[];
  unexpectedConsequenceIds: string[];
  learningCandidateIds: string[];
  evidenceReferenceIds: string[];
  potentialUpdateTargets: { type: string; target: string; note: string }[];
  packageConfidence: number;
  status: string;
  createdAt: string;
}

export interface OrganizationalLearningStage {
  id: string;
  name: string;
  sequence: number;
  status: string;
  detail: string;
  processedCount: number;
  pendingCount: number;
  failedCount: number;
  warningCount: number;
  successRate: number;
  averageDuration: string;
  p95Duration: string;
  throughput: string;
  slaStatus: string;
  owner: string;
}

export interface OrganizationalLearningActivity {
  id: string;
  timestamp: string;
  analysisId: string;
  learningCandidateId: string | null;
  action: string;
  description: string;
  result: string;
  owner: string;
  auditId: string;
}

export interface OlEvidence {
  id: string;
  title: string;
  evidenceType: string;
  authority: string;
  freshness: string;
  quality: number;
  supports: string;
  owner: string;
  status: string;
}

export interface RelatedKnowledge {
  id: string;
  recordType: string;
  title: string;
  relationship: string;
  authority: string;
  status: string;
}

/* ================================================================= filters */

export type FilterKey =
  | "businessUnit" | "decisionOwner" | "decisionType" | "submittingTeam" | "affectedTeam" | "teamPersona"
  | "knowledgeDomain" | "product" | "service" | "system" | "customerJourney" | "decisionStatus"
  | "outcomeStatus" | "learningStatus" | "learningType" | "varianceDirection" | "varianceSeverity"
  | "evidenceCoverage" | "learningConfidence" | "causalConfidence" | "applicabilityScope" | "riskType"
  | "controlType" | "environment" | "region" | "observationWindow" | "timeRange";

export const filterOptions: { key: FilterKey; label: string; options: string[] }[] = [
  { key: "businessUnit", label: "Business Unit", options: ["All", "Commerce", "Identity", "Risk & Fraud", "Platform"] },
  { key: "decisionOwner", label: "Decision Owner", options: ["All", "Payments Platform", "Identity Engineering", "Fraud Engineering", "Site Reliability Engineering"] },
  { key: "decisionType", label: "Decision Type", options: ["All", "Policy Change", "Configuration Change", "Migration", "Threshold Adjustment", "Observability Change"] },
  { key: "submittingTeam", label: "Submitting Team", options: ["All", "Checkout Engineering", "Identity Engineering", "Fraud Engineering", "Payments Platform"] },
  { key: "affectedTeam", label: "Affected Team", options: ["All", "Payments Platform", "Checkout Engineering", "Fraud Engineering", "Site Reliability Engineering", "Identity Engineering", "Release Governance"] },
  { key: "teamPersona", label: "Team Persona", options: ["All", "Payments Platform v3.4", "Checkout Engineering v4.1", "Fraud Engineering v2.8", "Site Reliability Engineering v5.2", "Identity Engineering v2.7", "Release Governance v2.3"] },
  { key: "knowledgeDomain", label: "Knowledge Domain", options: ["All", "Payments", "Identity", "Fraud", "Reliability", "Observability"] },
  { key: "product", label: "Product", options: ["All", "Checkout", "Identity Platform", "Fraud Platform"] },
  { key: "service", label: "Service", options: ["All", "Payment Retry Service", "Token Vault", "Fraud Decision Service", "Checkout Telemetry"] },
  { key: "system", label: "System", options: ["All", "Payments Core", "Identity Core", "Risk Core"] },
  { key: "customerJourney", label: "Customer Journey", options: ["All", "Checkout", "Sign In", "Account Recovery"] },
  { key: "decisionStatus", label: "Decision Status", options: ["All", "Recorded", "Executed", "Amended"] },
  { key: "outcomeStatus", label: "Outcome Status", options: ["All", "Fully Reconciled", "Partially Reconciled", "Observation Incomplete"] },
  { key: "learningStatus", label: "Learning Status", options: ["All", "Analyzing", "Review Required", "Needs Evidence", "Learning Package Ready"] },
  { key: "learningType", label: "Learning Type", options: ["All", ...learningTypes] },
  { key: "varianceDirection", label: "Variance Direction", options: ["All", "Positive", "Negative", "Mixed", "Neutral"] },
  { key: "varianceSeverity", label: "Variance Severity", options: ["All", "High", "Medium", "Low", "Material Positive"] },
  { key: "evidenceCoverage", label: "Evidence Coverage", options: ["All", "Below 85%", "85-95%", "Above 95%"] },
  { key: "learningConfidence", label: "Learning Confidence", options: ["All", "Below 85%", "85-92%", "Above 92%"] },
  { key: "causalConfidence", label: "Causal Confidence", options: ["All", "Low", "Moderate", "High"] },
  { key: "applicabilityScope", label: "Applicability Scope", options: ["All", "Bounded", "Broad", "Unresolved"] },
  { key: "riskType", label: "Risk Type", options: ["All", "Financial", "Operational", "Security", "Compliance", "Dependency"] },
  { key: "controlType", label: "Control Type", options: ["All", "Preventive", "Detective", "Corrective", "Governance"] },
  { key: "environment", label: "Environment", options: ["All", "Production", "Staging"] },
  { key: "region", label: "Region", options: ["All", "North America", "Europe", "Asia Pacific"] },
  { key: "observationWindow", label: "Observation Window", options: ["All", "7 days", "14 days", "30 days", "90 days"] },
  { key: "timeRange", label: "Time Range", options: ["All", "Last 30 days", "Last quarter", "Last 12 months"] },
];

export const defaultFilters = filterOptions.reduce((acc, f) => {
  acc[f.key] = "All";
  return acc;
}, {} as Record<FilterKey, string>);

export const activeFilterCount = (f: Record<FilterKey, string>) =>
  Object.values(f).filter((v) => v !== "All").length;

/* ==================================================================== KPIs */

export interface OlKpi {
  id: string;
  label: string;
  value: string;
  supporting: string;
  target?: string;
  status: string;
  trend: string;
  tooltip: string;
}

export const olKpis: OlKpi[] = [
  {
    id: "reconciliation", label: "Decisions with Observed Outcomes", value: "3,284",
    supporting: "1,426 fully reconciled", status: "Operational", trend: "+186 this quarter",
    tooltip: "Recorded decisions that have at least one observed outcome linked to an expected outcome.",
  },
  {
    id: "candidates", label: "Learning Candidates", value: "186",
    supporting: "114 New · 42 Review Required · 30 Validated", status: "Review Required", trend: "+24 this quarter",
    tooltip: "Proposed interpretations of observed outcomes. Candidates are not validated organizational knowledge.",
  },
  {
    id: "variance", label: "Material Outcome Variances", value: "74",
    supporting: "18 Positive · 39 Negative · 17 Mixed", status: "Warning", trend: "-6 versus prior quarter",
    tooltip: "Differences between expected and observed outcomes assessed as material.",
  },
  {
    id: "assumptions", label: "Assumptions Invalidated", value: "31",
    supporting: "Across 22 decisions", status: "Warning", trend: "+7 this quarter",
    tooltip: "Decision assumptions contradicted or partially contradicted by observed outcomes.",
  },
  {
    id: "coverage", label: "Reusable Learning Coverage", value: "82%", target: "Target 90%",
    supporting: "1,426 linked learning records", status: "Warning", trend: "+4 points",
    tooltip: "Share of reconciled decisions that produced a reusable, evidence linked learning record.",
  },
  {
    id: "quality", label: "Learning Quality", value: "93 / 100", target: "Target 95",
    supporting: "Healthy", status: "Healthy", trend: "+2 points",
    tooltip: "Composite of evidence coverage, traceability, causal confidence and applicability definition.",
  },
];

export const kpiFocusPanel = (id: string) => ({
  reconciliation: "panel-queue",
  candidates: "panel-candidates",
  variance: "panel-variance",
  assumptions: "panel-assumptions",
  coverage: "panel-package",
  quality: "panel-quality",
}[id] ?? "panel-queue");

/* =============================================================== lifecycle */

export const olStages: OrganizationalLearningStage[] = [
  ["OLS 1", "Load Decision Context", "Running", "3,284 decisions loaded", 3284, 0, 0, 0, 99.8, "0.9s", "2.1s", "412/hr", "Within SLA", "Decision Intelligence"],
  ["OLS 2", "Load Expected Outcomes", "Running", "3,021 complete", 3021, 263, 0, 4, 99.1, "1.1s", "2.6s", "388/hr", "Within SLA", "Decision Intelligence"],
  ["OLS 3", "Collect Observed Outcomes", "Warning", "1,426 fully linked", 1426, 1595, 12, 41, 92.4, "3.8s", "9.2s", "212/hr", "At Risk", "Outcome Observation"],
  ["OLS 4", "Validate Outcome Evidence", "Running", "92% complete", 1312, 114, 3, 18, 96.2, "2.4s", "5.8s", "244/hr", "Within SLA", "Evidence Governance"],
  ["OLS 5", "Compare Expected vs Observed", "Running", "1,426 reconciliations complete", 1426, 96, 1, 9, 98.1, "1.6s", "3.7s", "302/hr", "Within SLA", "Learning Analysis"],
  ["OLS 6", "Evaluate Assumptions", "Running", "486 assumptions evaluated", 486, 62, 0, 11, 96.8, "1.9s", "4.4s", "188/hr", "Within SLA", "Learning Analysis"],
  ["OLS 7", "Evaluate Risks & Controls", "Running", "278 risk outcomes evaluated", 278, 44, 0, 7, 95.9, "2.2s", "5.1s", "142/hr", "Within SLA", "Risk Governance"],
  ["OLS 8", "Evaluate Mitigations", "Running", "194 mitigations evaluated", 194, 28, 0, 5, 96.4, "2.0s", "4.6s", "126/hr", "Within SLA", "Release Governance"],
  ["OLS 9", "Identify Unexpected Consequences", "Warning", "74 material variances", 74, 22, 0, 14, 91.2, "2.8s", "6.9s", "88/hr", "At Risk", "Learning Analysis"],
  ["OLS 10", "Generate Learning Candidates", "Running", "186 candidates", 186, 34, 0, 6, 97.0, "2.1s", "4.9s", "104/hr", "Within SLA", "Learning Analysis"],
  ["OLS 11", "Evaluate Applicability", "Running", "162 complete", 162, 24, 0, 8, 95.1, "1.8s", "4.2s", "96/hr", "Within SLA", "Knowledge Governance"],
  ["OLS 12", "Evaluate Causal Confidence", "Warning", "21 require additional evidence", 141, 45, 0, 21, 89.4, "3.1s", "7.6s", "84/hr", "At Risk", "Learning Analysis"],
  ["OLS 13", "Compare Existing Knowledge", "Running", "144 complete", 144, 42, 0, 17, 94.2, "2.5s", "5.4s", "92/hr", "Within SLA", "Knowledge Governance"],
  ["OLS 14", "Prepare Learning Package", "Running", "128 complete · 18 pending", 128, 18, 0, 4, 97.6, "1.4s", "3.3s", "112/hr", "Within SLA", "Knowledge Governance"],
].map(([id, name, status, detail, processedCount, pendingCount, failedCount, warningCount, successRate, averageDuration, p95Duration, throughput, slaStatus, owner], i) => ({
  id: id as string, name: name as string, sequence: i + 1, status: status as string, detail: detail as string,
  processedCount: processedCount as number, pendingCount: pendingCount as number, failedCount: failedCount as number,
  warningCount: warningCount as number, successRate: successRate as number, averageDuration: averageDuration as string,
  p95Duration: p95Duration as string, throughput: throughput as string, slaStatus: slaStatus as string, owner: owner as string,
}));

export const stageById = (id: string) => olStages.find((s) => s.id === id) ?? olStages[4];

export const lifecycleCallouts = [
  "Checkout Retry decision produced one material positive variance and one material negative variance",
  "31 assumptions have been invalidated this quarter",
  "21 learning candidates have insufficient causal evidence",
  "17 learning candidates contradict existing guidance",
];

export const stageTabs = [
  "Overview", "Queue", "Expected Outcomes", "Observed Outcomes", "Variance", "Evidence", "Assumptions", "Outputs",
] as const;
export type StageTab = typeof stageTabs[number];

export const stageQueueRows = [
  { id: "OLQ 4401", analysis: "OL 9001", decision: "DEC 5001", workItem: "Checkout Retry Policy Update", metric: "Duplicate Authorization", expected: "<= 0.2%", observed: "0.4% initial", variance: "+0.2 pts", severity: "High", confidence: 96, status: "Review Required" },
  { id: "OLQ 4402", analysis: "OL 9001", decision: "DEC 5001", workItem: "Checkout Retry Policy Update", metric: "Checkout Completion", expected: "+1.0% to +2.0%", observed: "+1.8%", variance: "Within range", severity: "Material Positive", confidence: 97, status: "Validated" },
  { id: "OLQ 4403", analysis: "OL 9002", decision: "DEC 5002", workItem: "Identity Token Cache Optimization", metric: "P95 Latency", expected: "< 210 ms", observed: "196 ms", variance: "-14 ms", severity: "Low", confidence: 95, status: "Validated" },
  { id: "OLQ 4404", analysis: "OL 9003", decision: "DEC 5003", workItem: "Regional Token Vault Migration", metric: "Availability", expected: ">= 99.95%", observed: "99.91%", variance: "-0.04 pts", severity: "High", confidence: 72, status: "Needs Evidence" },
  { id: "OLQ 4405", analysis: "OL 9004", decision: "DEC 5004", workItem: "Fraud Decision Timeout Adjustment", metric: "Fraud Loss", expected: "No material increase", observed: "+0.03%", variance: "Immaterial", severity: "Low", confidence: 89, status: "Analyzing" },
  { id: "OLQ 4406", analysis: "OL 9005", decision: "DEC 5005", workItem: "Checkout Observability Expansion", metric: "Mean Detection Time", expected: "< 9 min", observed: "6.4 min", variance: "-2.6 min", severity: "Material Positive", confidence: 97, status: "Validated" },
];

/* ================================================================ analyses */

const analysis = (
  id: string, decisionId: string, workItem: string, opts: Partial<OrganizationalLearningAnalysis>,
): OrganizationalLearningAnalysis => ({
  id,
  decisionId,
  decisionRecordVersionId: `${decisionId} v1`,
  decisionContextSnapshotId: `DCS ${decisionId.split(" ")[1]}`,
  workItemId: `WRK ${7100 + Number(id.split(" ")[1]) - 9000}`,
  workItem,
  decisionDate: "2026-04-18",
  status: "Analyzing",
  owner: "Payments Reliability",
  businessUnit: "Commerce",
  decisionOwner: "Payments Platform",
  decisionType: "Policy Change",
  submittingTeam: "Checkout Engineering",
  affectedTeams: ["Payments Platform", "Checkout Engineering", "Fraud Engineering", "Site Reliability Engineering"],
  knowledgeDomain: "Payments",
  product: "Checkout",
  service: "Payment Retry Service",
  system: "Payments Core",
  customerJourney: "Checkout",
  environment: "Production",
  region: "North America",
  observationStart: "2026-04-22",
  observationEnd: "2026-05-22",
  observationWindow: "30 days",
  expectedOutcomeIds: [],
  observedOutcomeIds: [],
  varianceIds: [],
  assumptionEvaluationIds: [],
  riskRealizationIds: [],
  controlEffectivenessIds: [],
  mitigationEffectivenessIds: [],
  unexpectedConsequenceIds: [],
  learningCandidateIds: [],
  materialVariances: 1,
  evidenceCoverage: 92,
  causalConfidence: 90,
  currentStageId: "OLS 5",
  learningPackageId: `LP ${id.split(" ")[1]}`,
  outcomeStatus: "Fully Reconciled",
  learningStatus: "Analyzing",
  varianceDirection: "Mixed",
  varianceSeverity: "Medium",
  createdAt: "2026-05-23 09:10",
  updatedAt: "2026-05-30 14:42",
  ...opts,
});

export const analyses: OrganizationalLearningAnalysis[] = [
  analysis("OL 9001", "DEC 5001", "Checkout Retry Policy Update", {
    expectedOutcomeIds: ["EXO 1", "EXO 2", "EXO 3", "EXO 4", "EXO 5", "EXO 6"],
    observedOutcomeIds: ["OBS 1", "OBS 2", "OBS 3", "OBS 4", "OBS 5", "OBS 6"],
    varianceIds: ["VAR 1", "VAR 2"],
    assumptionEvaluationIds: ["ASM 1", "ASM 2", "ASM 3", "ASM 4", "ASM 5"],
    riskRealizationIds: ["RSK 1", "RSK 2", "RSK 3", "RSK 4", "RSK 5"],
    controlEffectivenessIds: ["CTL 1", "CTL 2", "CTL 3", "CTL 4", "CTL 5", "CTL 6", "CTL 7", "CTL 8"],
    mitigationEffectivenessIds: ["MIT 1", "MIT 2", "MIT 3", "MIT 4"],
    unexpectedConsequenceIds: ["UNX 1", "UNX 2", "UNX 3"],
    learningCandidateIds: ["LC 1426", "LC 1427", "LC 1428", "LC 1429"],
    materialVariances: 2, evidenceCoverage: 94, causalConfidence: 91,
    currentStageId: "OLS 11", status: "Review Required", learningStatus: "Review Required",
    varianceDirection: "Mixed", varianceSeverity: "High", owner: "Payments Reliability",
  }),
  analysis("OL 9002", "DEC 5002", "Identity Token Cache Optimization", {
    decisionOwner: "Identity Engineering", submittingTeam: "Identity Engineering",
    businessUnit: "Identity", knowledgeDomain: "Identity", product: "Identity Platform",
    service: "Token Vault", system: "Identity Core", customerJourney: "Sign In",
    decisionType: "Configuration Change", decisionDate: "2026-03-11",
    expectedOutcomeIds: ["EXO 7", "EXO 8", "EXO 9", "EXO 10", "EXO 11"],
    observedOutcomeIds: ["OBS 7", "OBS 8", "OBS 9", "OBS 10", "OBS 11"],
    learningCandidateIds: ["LC 1430", "LC 1431"],
    materialVariances: 1, evidenceCoverage: 96, causalConfidence: 95,
    currentStageId: "OLS 10", status: "Analyzing", learningStatus: "Analyzing",
    varianceDirection: "Positive", varianceSeverity: "Low", owner: "Identity Reliability",
  }),
  analysis("OL 9003", "DEC 5003", "Regional Token Vault Migration", {
    decisionOwner: "Identity Engineering", submittingTeam: "Identity Engineering",
    businessUnit: "Identity", knowledgeDomain: "Identity", product: "Identity Platform",
    service: "Token Vault", system: "Identity Core", customerJourney: "Sign In",
    decisionType: "Migration", region: "Europe", decisionDate: "2026-02-04",
    expectedOutcomeIds: ["EXO 12", "EXO 13", "EXO 14", "EXO 15", "EXO 16", "EXO 17", "EXO 18"],
    observedOutcomeIds: ["OBS 12", "OBS 13", "OBS 14", "OBS 15"],
    learningCandidateIds: ["LC 1432", "LC 1433", "LC 1434", "LC 1435", "LC 1436"],
    materialVariances: 3, evidenceCoverage: 76, causalConfidence: 72,
    currentStageId: "OLS 4", status: "Needs Evidence", learningStatus: "Needs Evidence",
    outcomeStatus: "Partially Reconciled", varianceDirection: "Negative", varianceSeverity: "High",
    owner: "Identity Reliability", observationWindow: "90 days",
  }),
  analysis("OL 9004", "DEC 5004", "Fraud Decision Timeout Adjustment", {
    decisionOwner: "Fraud Engineering", submittingTeam: "Fraud Engineering",
    businessUnit: "Risk & Fraud", knowledgeDomain: "Fraud", product: "Fraud Platform",
    service: "Fraud Decision Service", system: "Risk Core", decisionType: "Threshold Adjustment",
    decisionDate: "2026-04-02",
    expectedOutcomeIds: ["EXO 19", "EXO 20", "EXO 21", "EXO 22", "EXO 23"],
    observedOutcomeIds: ["OBS 16", "OBS 17", "OBS 18", "OBS 19", "OBS 20"],
    learningCandidateIds: ["LC 1437", "LC 1438", "LC 1439"],
    materialVariances: 2, evidenceCoverage: 92, causalConfidence: 89,
    currentStageId: "OLS 9", status: "Analyzing", learningStatus: "Analyzing",
    varianceDirection: "Mixed", varianceSeverity: "Medium", owner: "Fraud Reliability",
  }),
  analysis("OL 9005", "DEC 5005", "Checkout Observability Expansion", {
    decisionType: "Observability Change", knowledgeDomain: "Observability",
    service: "Checkout Telemetry", decisionDate: "2026-01-27",
    expectedOutcomeIds: ["EXO 24", "EXO 25", "EXO 26", "EXO 27"],
    observedOutcomeIds: ["OBS 21", "OBS 22", "OBS 23", "OBS 24"],
    learningCandidateIds: ["LC 1440", "LC 1441"],
    materialVariances: 1, evidenceCoverage: 98, causalConfidence: 97,
    currentStageId: "OLS 14", status: "Learning Package Ready", learningStatus: "Learning Package Ready",
    varianceDirection: "Positive", varianceSeverity: "Material Positive", owner: "Checkout Reliability",
  }),
  analysis("OL 9006", "DEC 5006", "Payment Provider Failover Policy", {
    decisionDate: "2026-03-25", decisionType: "Policy Change",
    expectedOutcomeIds: ["EXO 28", "EXO 29", "EXO 30"], observedOutcomeIds: ["OBS 25", "OBS 26"],
    learningCandidateIds: ["LC 1442"], materialVariances: 1, evidenceCoverage: 84, causalConfidence: 81,
    currentStageId: "OLS 6", status: "Analyzing", learningStatus: "Analyzing",
    outcomeStatus: "Partially Reconciled", varianceDirection: "Negative", varianceSeverity: "Medium",
  }),
  analysis("OL 9007", "DEC 5007", "Checkout Cart Persistence Change", {
    decisionDate: "2026-02-18", decisionType: "Configuration Change",
    expectedOutcomeIds: ["EXO 31", "EXO 32", "EXO 33"], observedOutcomeIds: ["OBS 27", "OBS 28", "OBS 29"],
    learningCandidateIds: ["LC 1443", "LC 1444"], materialVariances: 0, evidenceCoverage: 97, causalConfidence: 94,
    currentStageId: "OLS 13", status: "Analyzing", learningStatus: "Analyzing",
    varianceDirection: "Neutral", varianceSeverity: "Low",
  }),
  analysis("OL 9008", "DEC 5008", "SRE Error Budget Policy Revision", {
    decisionOwner: "Site Reliability Engineering", submittingTeam: "Payments Platform",
    businessUnit: "Platform", knowledgeDomain: "Reliability", decisionType: "Policy Change",
    decisionDate: "2026-01-09", region: "Asia Pacific",
    expectedOutcomeIds: ["EXO 34", "EXO 35"], observedOutcomeIds: ["OBS 30", "OBS 31"],
    learningCandidateIds: ["LC 1445"], materialVariances: 1, evidenceCoverage: 88, causalConfidence: 84,
    currentStageId: "OLS 12", status: "Review Required", learningStatus: "Review Required",
    varianceDirection: "Positive", varianceSeverity: "Low", owner: "Reliability Governance",
  }),
];

export const analysisById = (id: string) => analyses.find((a) => a.id === id) ?? analyses[0];

export const queueColumns = [
  "Learning ID", "Decision", "Work Item", "Decision Date", "Observation Window", "Expected Outcomes",
  "Observed Outcomes", "Material Variances", "Learning Candidates", "Evidence Coverage", "Causal Confidence",
  "Current Stage", "Learning Owner", "Status", "Actions",
];

/* ================================================ DEC 5001 decision context */

export const decisionContext = {
  decisionId: "DEC 5001",
  snapshotId: "DCS 5001",
  decisionQuestion: "Should automated payment retries increase from two to three, and under what rollout conditions?",
  recordedDecision: "Approve Option B with Conditions",
  selectedAlternative: "Three Retries with Segmented Rollout",
  initialTraffic: "5%",
  maximumWithoutApproval: "10%",
  decisionConfidence: 94,
  decisionOwner: "Payments Platform",
  decisionDate: "2026-04-18",
  rationale:
    "Segmented rollout with validated idempotency preserves checkout recovery upside while bounding duplicate authorization and fraud exposure to a reversible traffic slice.",
  conditions: [
    { id: "DCN 1", label: "Validated Idempotency", outcome: "Failed initially, satisfied after strengthening", evidence: "EV 8801" },
    { id: "DCN 2", label: "Progressive Rollout", outcome: "Succeeded", evidence: "EV 8803" },
    { id: "DCN 3", label: "Rollback Threshold", outcome: "Succeeded", evidence: "EV 8804" },
    { id: "DCN 4", label: "Fraud Monitoring", outcome: "Succeeded", evidence: "EV 8805" },
    { id: "DCN 5", label: "Dependency Health Monitoring", outcome: "Succeeded", evidence: "EV 8806" },
    { id: "DCN 6", label: "Joint approval before greater than 10% traffic", outcome: "Succeeded", evidence: "EV 8807" },
    { id: "DCN 7", label: "No deployment during final three business days of financial quarter", outcome: "Unresolved, not exercised", evidence: "EV 8808" },
  ],
  personaVersions: [
    { id: "PER 4101", label: "Payments Platform v3.4" },
    { id: "PER 4102", label: "Checkout Engineering v4.1" },
    { id: "PER 4103", label: "Fraud Engineering v2.8" },
    { id: "PER 4104", label: "Site Reliability Engineering v5.2" },
    { id: "PER 4105", label: "Identity Engineering v2.7" },
    { id: "PER 4106", label: "Release Governance v2.3" },
  ],
  applicableConditions: [
    "Availability >= 99.95%",
    "P95 Latency < 250ms",
    "Error Rate < 0.3%",
    "Idempotency required",
    "Approval above 10%",
    "Quarter end restriction",
  ],
  historicalNote:
    "This snapshot reflects the knowledge available on 2026-04-18. Organizational Learning never rewrites historical decision context.",
};

export const personaNameById = (id: string) =>
  decisionContext.personaVersions.find((p) => p.id === id)?.label ?? id;

/* =========================================================== expectations */

export const expectations: DecisionExpectation[] = [
  { id: "EXO 1", analysisId: "OL 9001", decisionId: "DEC 5001", metric: "Checkout Completion", baseline: "Current checkout completion baseline", expectedValue: "+1.5%", expectedRange: "+1.0% to +2.0%", observationWindow: "30 days", owner: "Checkout Engineering" },
  { id: "EXO 2", analysisId: "OL 9001", decisionId: "DEC 5001", metric: "Duplicate Authorization", baseline: "0.10%", expectedValue: "<= 0.2%", expectedRange: "0.0% to 0.2%", observationWindow: "30 days", owner: "Payments Platform" },
  { id: "EXO 3", analysisId: "OL 9001", decisionId: "DEC 5001", metric: "Availability", baseline: "99.96%", expectedValue: ">= 99.95%", expectedRange: "99.95% to 100%", observationWindow: "30 days", owner: "Site Reliability Engineering" },
  { id: "EXO 4", analysisId: "OL 9001", decisionId: "DEC 5001", metric: "P95 Latency", baseline: "224 ms", expectedValue: "< 250 ms", expectedRange: "0 ms to 250 ms", observationWindow: "30 days", owner: "Site Reliability Engineering" },
  { id: "EXO 5", analysisId: "OL 9001", decisionId: "DEC 5001", metric: "Fraud Loss", baseline: "0.42% of authorized volume", expectedValue: "No material increase", expectedRange: "Within statistical tolerance", observationWindow: "30 days", owner: "Fraud Engineering" },
  { id: "EXO 6", analysisId: "OL 9001", decisionId: "DEC 5001", metric: "Dependency Health", baseline: "Identity and Fraud services nominal", expectedValue: "No sustained saturation", expectedRange: "Utilization below 75%", observationWindow: "30 days", owner: "Site Reliability Engineering" },
];

export const observations: OutcomeObservation[] = [
  {
    id: "OBS 1", analysisId: "OL 9001", decisionId: "DEC 5001", expectedOutcomeId: "EXO 1", metric: "Checkout Completion",
    baseline: "Current checkout completion baseline", observedValue: "+1.8%", unit: "percentage points",
    observationStart: "2026-04-22", observationEnd: "2026-05-22", observationPeriod: "30 days",
    evidenceReferenceIds: ["EV 8801", "EV 8802"], owner: "Checkout Engineering", confidence: 97,
    assessment: "Validated", status: "Within Expected Range",
  },
  {
    id: "OBS 2", analysisId: "OL 9001", decisionId: "DEC 5001", expectedOutcomeId: "EXO 2", metric: "Duplicate Authorization",
    baseline: "0.10%", observedValue: "+0.4% during initial stage", unit: "percent of authorizations",
    observationStart: "2026-04-22", observationEnd: "2026-05-22", observationPeriod: "30 days",
    evidenceReferenceIds: ["EV 8809", "EV 8810"], owner: "Payments Platform", confidence: 96,
    assessment: "Material Negative Variance",
    note: "Observed after strengthened idempotency controls: +0.15%",
    status: "Material Negative Variance",
  },
  {
    id: "OBS 3", analysisId: "OL 9001", decisionId: "DEC 5001", expectedOutcomeId: "EXO 3", metric: "Availability",
    baseline: "99.96%", observedValue: "99.97%", unit: "percent",
    observationStart: "2026-04-22", observationEnd: "2026-05-22", observationPeriod: "30 days",
    evidenceReferenceIds: ["EV 8811"], owner: "Site Reliability Engineering", confidence: 99,
    assessment: "Validated", status: "Within Expected Range",
  },
  {
    id: "OBS 4", analysisId: "OL 9001", decisionId: "DEC 5001", expectedOutcomeId: "EXO 4", metric: "P95 Latency",
    baseline: "224 ms", observedValue: "238 ms", unit: "milliseconds",
    observationStart: "2026-04-22", observationEnd: "2026-05-22", observationPeriod: "30 days",
    evidenceReferenceIds: ["EV 8812"], owner: "Site Reliability Engineering", confidence: 98,
    assessment: "Validated, Near Threshold", status: "Near Threshold",
  },
  {
    id: "OBS 5", analysisId: "OL 9001", decisionId: "DEC 5001", expectedOutcomeId: "EXO 5", metric: "Fraud Loss",
    baseline: "0.42% of authorized volume", observedValue: "No statistically material increase during observation window",
    unit: "percent of authorized volume",
    observationStart: "2026-04-22", observationEnd: "2026-05-22", observationPeriod: "30 days",
    evidenceReferenceIds: ["EV 8813", "EV 8814"], owner: "Fraud Engineering", confidence: 88,
    assessment: "Validated for observed scope", status: "Within Expected Range",
  },
  {
    id: "OBS 6", analysisId: "OL 9001", decisionId: "DEC 5001", expectedOutcomeId: "EXO 6", metric: "Dependency Health",
    baseline: "Identity and Fraud services nominal",
    observedValue: "Identity Services +6% request volume · Fraud Decision Service +8% · no sustained saturation",
    unit: "request volume",
    observationStart: "2026-04-22", observationEnd: "2026-05-22", observationPeriod: "30 days",
    evidenceReferenceIds: ["EV 8815", "EV 8816"], owner: "Site Reliability Engineering", confidence: 91,
    assessment: "Validated for 15% traffic scope", status: "Within Expected Range",
  },
];

export const variances: OutcomeVariance[] = [
  {
    id: "VAR 1", analysisId: "OL 9001", expectedOutcomeId: "EXO 2", outcomeObservationId: "OBS 2",
    metric: "Duplicate Authorization", dimension: "Financial",
    expectedValue: "<= 0.2%", expectedRange: "0.0% to 0.2%", observedValue: "0.4% initial",
    varianceDirection: "Negative", varianceMagnitude: "2.0x expected ceiling",
    absoluteDifference: "+0.20 percentage points", relativeDifference: "+100% versus expected ceiling",
    thresholdDifference: "0.20 pts above the 0.2% threshold", materiality: "High",
    affectedPersonaIds: ["PER 4101", "PER 4102", "PER 4103"],
    evidenceReferenceIds: ["EV 8809", "EV 8810", "EV 8817"],
    contributors: [
      "Insufficient idempotency validation before first rollout",
      "Retry timing overlap",
      "Payment provider response timing",
    ],
    interpretation:
      "The additional retry created a higher duplicate authorization exposure than anticipated during the initial stage.",
    mitigationEffect:
      "After stronger idempotency safeguards, observed duplicate authorization fell to 0.15%. Causal confidence 94%.",
    confidence: 91, status: "Material Negative Variance",
  },
  {
    id: "VAR 2", analysisId: "OL 9001", expectedOutcomeId: "EXO 1", outcomeObservationId: "OBS 1",
    metric: "Checkout Completion", dimension: "Customer",
    expectedValue: "+1.0% to +2.0%", expectedRange: "+1.0% to +2.0%", observedValue: "+1.8%",
    varianceDirection: "Positive", varianceMagnitude: "Upper half of expected range",
    absoluteDifference: "+0.3 pts above midpoint", relativeDifference: "+20% versus expected midpoint",
    thresholdDifference: "0.2 pts below the upper bound", materiality: "Material Positive",
    affectedPersonaIds: ["PER 4102", "PER 4101"],
    evidenceReferenceIds: ["EV 8801", "EV 8802"],
    contributors: [
      "Recovery of transient payment failures",
      "Segmented rollout selection",
      "Stable dependency performance",
    ],
    interpretation:
      "Checkout completion improved toward the upper half of the expected range while dependencies remained healthy.",
    confidence: 92, status: "Within Expected Range",
  },
];

export const varianceSummary = [
  { label: "Material Positive", value: 18, tone: "green" },
  { label: "Material Negative", value: 39, tone: "red" },
  { label: "Mixed", value: 17, tone: "amber" },
  { label: "Within Expected Range", value: 1284, tone: "blue" },
  { label: "Insufficient Evidence", value: 68, tone: "slate" },
];

export const varianceDimensions = [
  { dimension: "Customer", material: 9, positive: 6, negative: 3, confidence: 93 },
  { dimension: "Business", material: 7, positive: 3, negative: 4, confidence: 90 },
  { dimension: "Financial", material: 11, positive: 2, negative: 9, confidence: 94 },
  { dimension: "Reliability", material: 8, positive: 4, negative: 4, confidence: 95 },
  { dimension: "Performance", material: 6, positive: 2, negative: 4, confidence: 96 },
  { dimension: "Security", material: 4, positive: 1, negative: 3, confidence: 88 },
  { dimension: "Compliance", material: 3, positive: 0, negative: 3, confidence: 92 },
  { dimension: "Operational", material: 9, positive: 3, negative: 6, confidence: 89 },
  { dimension: "Dependency", material: 7, positive: 2, negative: 5, confidence: 91 },
  { dimension: "Risk", material: 5, positive: 1, negative: 4, confidence: 90 },
  { dimension: "Control Effectiveness", material: 6, positive: 3, negative: 3, confidence: 92 },
  { dimension: "Mitigation Effectiveness", material: 5, positive: 4, negative: 1, confidence: 93 },
];

/* ============================================================= assumptions */

export const assumptionEvaluations: AssumptionEvaluation[] = [
  {
    id: "ASM 1", analysisId: "OL 9001", decisionAssumption: "Third retry improves checkout completion",
    originalConfidence: 88, validationState: "Validated", reason: "Validated for observed scope. Checkout completion +1.8%.",
    outcomeObservationIds: ["OBS 1"], evidenceReferenceIds: ["EV 8801", "EV 8802"], confidence: 92, status: "Validated",
  },
  {
    id: "ASM 2", analysisId: "OL 9001", decisionAssumption: "Retries remain adequately idempotent",
    originalConfidence: 91, validationState: "Partially Invalidated",
    reason: "Initial duplicate authorization exceeded expected threshold before controls were strengthened.",
    outcomeObservationIds: ["OBS 2"], evidenceReferenceIds: ["EV 8809", "EV 8810"], confidence: 96, status: "Partially Invalidated",
  },
  {
    id: "ASM 3", analysisId: "OL 9001", decisionAssumption: "Dependencies can absorb increased traffic",
    originalConfidence: 84, validationState: "Validated",
    reason: "Validated at 15% traffic exposure. Do not generalize beyond observed exposure.",
    outcomeObservationIds: ["OBS 6"], evidenceReferenceIds: ["EV 8815", "EV 8816"], confidence: 91, status: "Validated",
  },
  {
    id: "ASM 4", analysisId: "OL 9001", decisionAssumption: "Fraud loss remains within tolerance",
    originalConfidence: 80, validationState: "Validated",
    reason: "Validated for observation window only.",
    outcomeObservationIds: ["OBS 5"], evidenceReferenceIds: ["EV 8813", "EV 8814"], confidence: 88, status: "Validated",
  },
  {
    id: "ASM 5", analysisId: "OL 9001", decisionAssumption: "Rollback capability limits adverse impact",
    originalConfidence: 89, validationState: "Validated",
    reason: "Rollback threshold halted expansion before broader exposure.",
    outcomeObservationIds: ["OBS 2"], evidenceReferenceIds: ["EV 8804"], confidence: 94, status: "Validated",
  },
];

export const assumptionStates = [
  "Validated", "Partially Validated", "Partially Invalidated", "Invalidated", "Unresolved", "Insufficient Evidence",
];

/* ========================================================= risk / controls */

export const riskRealizations: RiskRealization[] = [
  {
    id: "RSK 1", analysisId: "OL 9001", riskId: "RIS 3301", risk: "Duplicate Authorization",
    predictedSeverity: "High", materialized: "Yes", observedSeverity: "High initially, reduced after mitigation",
    observedResult: "0.4% initial, 0.15% after idempotency strengthening",
    controlIds: ["CTL 1", "CTL 2"], outcomeObservationIds: ["OBS 2"], evidenceReferenceIds: ["EV 8809", "EV 8810"],
    learningImplication: "Idempotency validation must reflect production representative retry concurrency.", confidence: 94,
  },
  {
    id: "RSK 2", analysisId: "OL 9001", riskId: "RIS 3302", risk: "Fraud Exposure",
    predictedSeverity: "High", materialized: "No", observedSeverity: "No material increase in observed window",
    observedResult: "No statistically material increase during the 30 day observation window",
    controlIds: ["CTL 5"], outcomeObservationIds: ["OBS 5"], evidenceReferenceIds: ["EV 8813", "EV 8814"],
    learningImplication: "Fraud exposure prediction may be recalibrated, bounded to observed traffic and window.", confidence: 88,
  },
  {
    id: "RSK 3", analysisId: "OL 9001", riskId: "RIS 3303", risk: "Dependency Saturation",
    predictedSeverity: "Medium", materialized: "No", observedSeverity: "No sustained saturation at 15%",
    observedResult: "Identity +6%, Fraud Decision +8%, no sustained saturation",
    controlIds: ["CTL 6"], outcomeObservationIds: ["OBS 6"], evidenceReferenceIds: ["EV 8815", "EV 8816"],
    learningImplication: "Dependency headroom evidence exists only for the observed exposure range.", confidence: 91,
  },
  {
    id: "RSK 4", analysisId: "OL 9001", riskId: "RIS 3304", risk: "Latency Amplification",
    predictedSeverity: "Medium", materialized: "No", observedSeverity: "238 ms, remained below threshold",
    observedResult: "P95 latency 238 ms against a 250 ms threshold",
    controlIds: ["CTL 6"], outcomeObservationIds: ["OBS 4"], evidenceReferenceIds: ["EV 8812"],
    learningImplication: "Latency headroom is thin. Future retry increases should re-test before expansion.", confidence: 93,
  },
  {
    id: "RSK 5", analysisId: "OL 9001", riskId: "RIS 3305", risk: "Quarter End Governance",
    predictedSeverity: "Conditional", materialized: "Not Applicable", observedSeverity: "Not applicable in executed deployment window",
    observedResult: "Deployment did not intersect the restricted quarter end window",
    controlIds: ["CTL 8"], outcomeObservationIds: [], evidenceReferenceIds: ["EV 8808"],
    learningImplication: "Control remains untested. No learning may be inferred about its effectiveness.", confidence: 70,
  },
];

export const controlEffectiveness: ControlEffectiveness[] = [
  {
    id: "CTL 1", analysisId: "OL 9001", controlId: "CON 7701", control: "Idempotency Validation", controlType: "Preventive",
    expectedPurpose: "Prevent duplicate authorization when retries overlap", applied: "Applied",
    observedEffect: "Initially insufficient. Effective after strengthening.", effectiveness: "Insufficient",
    limitation: "Pre rollout validation did not reproduce production retry concurrency",
    evidenceReferenceIds: ["EV 8809", "EV 8810"], confidence: 96, learningCandidateId: "LC 1426",
  },
  {
    id: "CTL 2", analysisId: "OL 9001", controlId: "CON 7702", control: "Progressive Rollout", controlType: "Corrective",
    expectedPurpose: "Contain blast radius while outcomes are observed", applied: "Applied",
    observedEffect: "Contained duplicate authorization exposure before broader rollout", effectiveness: "Effective",
    limitation: "None observed", evidenceReferenceIds: ["EV 8803"], confidence: 95, learningCandidateId: "LC 1427",
  },
  {
    id: "CTL 3", analysisId: "OL 9001", controlId: "CON 7703", control: "Traffic Segmentation", controlType: "Preventive",
    expectedPurpose: "Restrict exposure to selected customer segments", applied: "Applied",
    observedEffect: "Exposure remained inside the intended segments", effectiveness: "Effective",
    limitation: "None observed", evidenceReferenceIds: ["EV 8803"], confidence: 93, learningCandidateId: null,
  },
  {
    id: "CTL 4", analysisId: "OL 9001", controlId: "CON 7704", control: "Automated Rollback", controlType: "Corrective",
    expectedPurpose: "Halt rollout when a threshold is breached", applied: "Applied",
    observedEffect: "Triggered on duplicate threshold breach and prevented broader exposure", effectiveness: "Effective",
    limitation: "None observed", evidenceReferenceIds: ["EV 8804"], confidence: 94, learningCandidateId: null,
  },
  {
    id: "CTL 5", analysisId: "OL 9001", controlId: "CON 7705", control: "Fraud Monitoring", controlType: "Detective",
    expectedPurpose: "Detect material fraud increase during rollout", applied: "Applied",
    observedEffect: "No material increase detected during the observation window", effectiveness: "Effective for observed scope",
    limitation: "Window limited to 30 days", evidenceReferenceIds: ["EV 8813"], confidence: 88, learningCandidateId: null,
  },
  {
    id: "CTL 6", analysisId: "OL 9001", controlId: "CON 7706", control: "Dependency Health Monitoring", controlType: "Detective",
    expectedPurpose: "Detect saturation of Identity and Fraud services", applied: "Applied",
    observedEffect: "Detected volume increases without sustained saturation", effectiveness: "Effective",
    limitation: "Evidence bounded to 15% exposure", evidenceReferenceIds: ["EV 8815", "EV 8816"], confidence: 91, learningCandidateId: "LC 1429",
  },
  {
    id: "CTL 7", analysisId: "OL 9001", controlId: "CON 7707", control: "Joint Approval", controlType: "Governance",
    expectedPurpose: "Require joint approval above 10% traffic", applied: "Applied",
    observedEffect: "Joint approval obtained before expansion to 15%", effectiveness: "Effective",
    limitation: "None observed", evidenceReferenceIds: ["EV 8807"], confidence: 92, learningCandidateId: null,
  },
  {
    id: "CTL 8", analysisId: "OL 9001", controlId: "CON 7708", control: "Change Window Restriction", controlType: "Governance",
    expectedPurpose: "Prevent deployment during the final three business days of a financial quarter", applied: "Not Exercised",
    observedEffect: "Deployment did not intersect the restricted window", effectiveness: "Unresolved",
    limitation: "No observation available. Effectiveness cannot be inferred.",
    evidenceReferenceIds: ["EV 8808"], confidence: 70, learningCandidateId: null,
  },
];

export const mitigationEffectiveness: MitigationEffectiveness[] = [
  {
    id: "MIT 1", analysisId: "OL 9001", mitigationId: "MTG 6601", mitigation: "Progressive Rollout",
    expectedEffect: "Limit blast radius", observedEffect: "Materially limited initial exposure",
    variance: "Performed as expected", effectiveness: "High", evidenceReferenceIds: ["EV 8803"], confidence: 95,
  },
  {
    id: "MIT 2", analysisId: "OL 9001", mitigationId: "MTG 6602", mitigation: "Rollback Threshold",
    expectedEffect: "Stop rollout after duplicate threshold breach", observedEffect: "Prevented broader exposure",
    variance: "Performed as expected", effectiveness: "High", evidenceReferenceIds: ["EV 8804"], confidence: 94,
  },
  {
    id: "MIT 3", analysisId: "OL 9001", mitigationId: "MTG 6603", mitigation: "Idempotency Strengthening",
    expectedEffect: "Reduce duplicates", observedEffect: "0.4% to 0.15%",
    variance: "Exceeded expected reduction", effectiveness: "High", evidenceReferenceIds: ["EV 8810", "EV 8817"], confidence: 94,
  },
  {
    id: "MIT 4", analysisId: "OL 9001", mitigationId: "MTG 6604", mitigation: "Fraud Monitoring",
    expectedEffect: "Detect material fraud increase", observedEffect: "No material increase detected",
    variance: "No detection event in window", effectiveness: "Adequate for observed window",
    evidenceReferenceIds: ["EV 8813"], confidence: 88,
  },
];

export const unexpectedConsequences: UnexpectedConsequence[] = [
  {
    id: "UNX 1", analysisId: "OL 9001", title: "Duplicate authorization increase exceeded expected threshold during initial rollout",
    description: "The first rollout stage produced duplicate authorizations at twice the expected ceiling before idempotency controls were strengthened.",
    direction: "Negative", severity: "High", affectedPersonaIds: ["PER 4101", "PER 4102"],
    affectedTeams: ["Payments Platform", "Checkout Engineering"],
    customerImpact: "A bounded set of customers saw duplicate authorization holds that were reversed",
    businessImpact: "Reversal handling and customer contact effort during the initial stage",
    evidenceReferenceIds: ["EV 8809", "EV 8810"], wasPredicted: "Partially", learningCandidateId: "LC 1426",
  },
  {
    id: "UNX 2", analysisId: "OL 9001", title: "Operational investigation required additional Payments and SRE coordination",
    description: "Diagnosing the duplicate authorization spike consumed unplanned joint investigation capacity across two teams.",
    direction: "Negative", severity: "Medium", affectedPersonaIds: ["PER 4101", "PER 4104"],
    affectedTeams: ["Payments Platform", "Site Reliability Engineering"],
    customerImpact: "None directly attributable", businessImpact: "Unplanned engineering coordination cost",
    evidenceReferenceIds: ["EV 8818"], wasPredicted: "No", learningCandidateId: "LC 1426",
  },
  {
    id: "UNX 3", analysisId: "OL 9001", title: "Dependency request volume increased more than expected but remained within capacity",
    description: "Identity Services and the Fraud Decision Service absorbed higher request volume than modelled while staying inside tolerated capacity.",
    direction: "Mixed", severity: "Low", affectedPersonaIds: ["PER 4105", "PER 4103"],
    affectedTeams: ["Identity Engineering", "Fraud Engineering"],
    customerImpact: "None observed", businessImpact: "Capacity planning assumptions require refresh",
    evidenceReferenceIds: ["EV 8815", "EV 8816"], wasPredicted: "No", learningCandidateId: "LC 1429",
  },
];

/* ====================================================== learning candidates */

export const learningCandidates: LearningCandidate[] = [
  {
    id: "LC 1426", analysisId: "OL 9001", decisionId: "DEC 5001", candidateNumber: "Learning Candidate 1",
    title: "Validate idempotency under production representative retry concurrency before traffic expansion",
    description:
      "Pre rollout idempotency validation that does not reproduce production retry concurrency understates duplicate authorization exposure for retry policy changes.",
    learningType: "Control Improvement", triggerType: "Material Variance", trigger: "Duplicate authorization variance",
    triggerIds: ["VAR 1"], supportingOutcomeIds: ["OBS 2"], evidenceReferenceIds: ["EV 8809", "EV 8810", "EV 8817"],
    causalConfidence: 94, applicabilityConfidence: 92,
    applicableScopes: ["Payment retry policy changes"],
    potentialScopes: ["Other transaction retry systems"],
    excludedScopes: ["Nonpayment workflows"],
    unknownScopes: ["Different payment providers"],
    affectedPersonaIds: ["PER 4101", "PER 4102", "PER 4104"],
    affectedTeams: ["Payments Platform", "Checkout Engineering", "Site Reliability Engineering"],
    potentialMemoryUpdateTypes: ["Idempotency Control", "Payments Persona Preferred Evidence", "Retry Change Review Checklist"],
    relatedLearningIds: ["LRN 1182"], conflictIds: ["LCF 1"], status: "Candidate", createdAt: "2026-05-24 10:12",
  },
  {
    id: "LC 1427", analysisId: "OL 9001", decisionId: "DEC 5001", candidateNumber: "Learning Candidate 2",
    title: "Progressive rollout materially limits the blast radius of retry policy changes",
    description:
      "Segmented progressive rollout contained duplicate authorization exposure to a reversible traffic slice before broader exposure occurred.",
    learningType: "Mitigation Effectiveness", triggerType: "Mitigation Outcome", trigger: "Progressive rollout effectiveness",
    triggerIds: ["MIT 1"], supportingOutcomeIds: ["OBS 2", "OBS 1"], evidenceReferenceIds: ["EV 8803", "EV 8804"],
    causalConfidence: 93, applicabilityConfidence: 90,
    applicableScopes: ["Customer facing payment configuration changes with progressive traffic controls"],
    potentialScopes: ["Other commerce flows"],
    excludedScopes: ["Immediate full rollout changes"],
    unknownScopes: ["Different peak traffic conditions"],
    affectedPersonaIds: ["PER 4102", "PER 4101", "PER 4104", "PER 4106"],
    affectedTeams: ["Checkout Engineering", "Payments Platform", "Site Reliability Engineering", "Release Governance"],
    potentialMemoryUpdateTypes: ["Rollout Guidance", "Release Governance Decision Rule"],
    relatedLearningIds: ["LRN 1182"], conflictIds: [], status: "Candidate", createdAt: "2026-05-24 10:14",
  },
  {
    id: "LC 1428", analysisId: "OL 9001", decisionId: "DEC 5001", candidateNumber: "Learning Candidate 3",
    title: "A third retry can improve checkout completion when transient payment failures dominate and downstream dependencies remain healthy",
    description:
      "Conditional pattern. The completion improvement was observed only where transient error categories dominated and dependency health remained acceptable.",
    learningType: "Conditional Outcome Pattern", triggerType: "Positive Variance", trigger: "Checkout completion variance",
    triggerIds: ["VAR 2"], supportingOutcomeIds: ["OBS 1", "OBS 6"], evidenceReferenceIds: ["EV 8801", "EV 8802", "EV 8815"],
    causalConfidence: 88, applicabilityConfidence: 84,
    applicableScopes: [
      "Transient error categories", "Dependency health acceptable", "Idempotency validated",
      "Fraud monitoring active", "Progressive rollout available",
    ],
    potentialScopes: ["Other commerce flows with transient failure profiles"],
    excludedScopes: ["Persistent decline categories", "All payment failures", "100% immediate rollout"],
    unknownScopes: ["Different fraud models", "Other regions without supporting evidence"],
    affectedPersonaIds: ["PER 4102", "PER 4101"],
    affectedTeams: ["Checkout Engineering", "Payments Platform"],
    potentialMemoryUpdateTypes: ["Decision Guidance", "Checkout Persona Decision Rule"],
    relatedLearningIds: [], conflictIds: [], status: "Candidate", createdAt: "2026-05-24 10:18",
  },
  {
    id: "LC 1429", analysisId: "OL 9001", decisionId: "DEC 5001", candidateNumber: "Learning Candidate 4",
    title: "Dependency load increases were measurable but remained within tolerated capacity at fifteen percent traffic exposure",
    description:
      "Identity and Fraud dependency volume rose measurably and stayed within tolerated capacity. Evidence exists only for the observed configuration and traffic range.",
    learningType: "Observed Dependency Behavior", triggerType: "Observed Outcome", trigger: "Dependency health observation",
    triggerIds: ["OBS 6"], supportingOutcomeIds: ["OBS 6"], evidenceReferenceIds: ["EV 8815", "EV 8816"],
    causalConfidence: 86, applicabilityConfidence: 80,
    applicableScopes: ["Observed configuration and traffic range only"],
    potentialScopes: ["Similar dependency topologies at comparable exposure"],
    excludedScopes: ["100% traffic", "Peak seasonal traffic"],
    unknownScopes: ["Different payment providers", "Different peak traffic conditions"],
    affectedPersonaIds: ["PER 4105", "PER 4103", "PER 4104"],
    affectedTeams: ["Identity Engineering", "Fraud Engineering", "Site Reliability Engineering"],
    potentialMemoryUpdateTypes: ["Dependency Capacity Reference", "SRE Preferred Evidence"],
    relatedLearningIds: [], conflictIds: [], status: "Candidate", createdAt: "2026-05-24 10:21",
  },
  {
    id: "LC 1430", analysisId: "OL 9002", decisionId: "DEC 5002", candidateNumber: "Learning Candidate 1",
    title: "Token cache warm start reduces sign in latency without increasing token reuse risk",
    description: "Warm start caching reduced P95 sign in latency with no observed increase in token reuse anomalies.",
    learningType: "Success Pattern", triggerType: "Positive Variance", trigger: "Latency variance",
    triggerIds: [], supportingOutcomeIds: ["OBS 7"], evidenceReferenceIds: ["EV 8820"],
    causalConfidence: 95, applicabilityConfidence: 91,
    applicableScopes: ["Identity token caching"], potentialScopes: ["Session caching"],
    excludedScopes: ["Credential caching"], unknownScopes: ["Multi region cache invalidation"],
    affectedPersonaIds: ["PER 4105"], affectedTeams: ["Identity Engineering"],
    potentialMemoryUpdateTypes: ["Identity Persona Decision Rule"], relatedLearningIds: [], conflictIds: [],
    status: "Candidate", createdAt: "2026-04-11 08:40",
  },
  {
    id: "LC 1432", analysisId: "OL 9003", decisionId: "DEC 5003", candidateNumber: "Learning Candidate 1",
    title: "Regional migration availability targets require region specific baselines",
    description: "A single global availability baseline understated the regional impact of the vault migration.",
    learningType: "Invalidated Assumption", triggerType: "Material Variance", trigger: "Availability variance",
    triggerIds: [], supportingOutcomeIds: ["OBS 12"], evidenceReferenceIds: ["EV 8830"],
    causalConfidence: 72, applicabilityConfidence: 68,
    applicableScopes: ["Regional migrations"], potentialScopes: ["Multi region rollouts"],
    excludedScopes: ["Single region changes"], unknownScopes: ["Regulated regions"],
    affectedPersonaIds: ["PER 4105"], affectedTeams: ["Identity Engineering"],
    potentialMemoryUpdateTypes: ["Business Condition"], relatedLearningIds: [], conflictIds: [],
    status: "Needs Evidence", createdAt: "2026-03-02 16:05",
  },
  {
    id: "LC 1437", analysisId: "OL 9004", decisionId: "DEC 5004", candidateNumber: "Learning Candidate 1",
    title: "Fraud decision timeout reductions shift load onto downstream retry paths",
    description: "Shorter fraud decision timeouts increased retry path volume without increasing fraud loss.",
    learningType: "Dependency Behavior", triggerType: "Observed Outcome", trigger: "Dependency observation",
    triggerIds: [], supportingOutcomeIds: ["OBS 17"], evidenceReferenceIds: ["EV 8840"],
    causalConfidence: 89, applicabilityConfidence: 85,
    applicableScopes: ["Fraud decision timeouts"], potentialScopes: ["Risk scoring timeouts"],
    excludedScopes: ["Manual review queues"], unknownScopes: ["Peak seasonal volumes"],
    affectedPersonaIds: ["PER 4103"], affectedTeams: ["Fraud Engineering"],
    potentialMemoryUpdateTypes: ["Risk Update"], relatedLearningIds: [], conflictIds: [],
    status: "Candidate", createdAt: "2026-05-06 11:22",
  },
  {
    id: "LC 1440", analysisId: "OL 9005", decisionId: "DEC 5005", candidateNumber: "Learning Candidate 1",
    title: "Expanded checkout telemetry shortens detection time for payment path regressions",
    description: "Mean detection time for checkout regressions fell from 9 minutes to 6.4 minutes after telemetry expansion.",
    learningType: "Operational Behavior", triggerType: "Positive Variance", trigger: "Detection time variance",
    triggerIds: [], supportingOutcomeIds: ["OBS 21"], evidenceReferenceIds: ["EV 8850"],
    causalConfidence: 97, applicabilityConfidence: 94,
    applicableScopes: ["Checkout observability"], potentialScopes: ["Payments observability"],
    excludedScopes: ["Batch processing paths"], unknownScopes: ["Third party provider telemetry"],
    affectedPersonaIds: ["PER 4102", "PER 4104"], affectedTeams: ["Checkout Engineering", "Site Reliability Engineering"],
    potentialMemoryUpdateTypes: ["Control Update"], relatedLearningIds: ["LRN 1182"], conflictIds: [],
    status: "Validated", createdAt: "2026-02-28 09:55",
  },
];

export const candidatesForAnalysis = (analysisId: string) =>
  learningCandidates.filter((c) => c.analysisId === analysisId);

export const candidateById = (id: string) => learningCandidates.find((c) => c.id === id);

/* ============================================================== evidence */

export const evidenceRecords: OlEvidence[] = [
  { id: "EV 8801", title: "Checkout completion telemetry, 30 day window", evidenceType: "Telemetry", authority: "Authoritative", freshness: "Current", quality: 96, supports: "OBS 1", owner: "Checkout Engineering", status: "Accepted" },
  { id: "EV 8802", title: "Payment recovery cohort analysis", evidenceType: "Analysis", authority: "Authoritative", freshness: "Current", quality: 93, supports: "OBS 1", owner: "Payments Platform", status: "Accepted" },
  { id: "EV 8803", title: "Progressive rollout execution log", evidenceType: "Execution Record", authority: "Authoritative", freshness: "Current", quality: 97, supports: "MIT 1", owner: "Release Governance", status: "Accepted" },
  { id: "EV 8804", title: "Rollback threshold trigger record", evidenceType: "Execution Record", authority: "Authoritative", freshness: "Current", quality: 96, supports: "MIT 2", owner: "Site Reliability Engineering", status: "Accepted" },
  { id: "EV 8805", title: "Fraud monitoring configuration attestation", evidenceType: "Attestation", authority: "Authoritative", freshness: "Current", quality: 90, supports: "DCN 4", owner: "Fraud Engineering", status: "Accepted" },
  { id: "EV 8806", title: "Dependency health monitoring dashboard export", evidenceType: "Telemetry", authority: "Authoritative", freshness: "Current", quality: 92, supports: "DCN 5", owner: "Site Reliability Engineering", status: "Accepted" },
  { id: "EV 8807", title: "Joint approval record for 15% expansion", evidenceType: "Approval Record", authority: "Authoritative", freshness: "Current", quality: 98, supports: "DCN 6", owner: "Release Governance", status: "Accepted" },
  { id: "EV 8808", title: "Change window calendar record", evidenceType: "Governance Record", authority: "Authoritative", freshness: "Current", quality: 88, supports: "DCN 7", owner: "Release Governance", status: "Accepted" },
  { id: "EV 8809", title: "Duplicate authorization transaction telemetry", evidenceType: "Telemetry", authority: "Authoritative", freshness: "Current", quality: 97, supports: "OBS 2", owner: "Payments Platform", status: "Accepted" },
  { id: "EV 8810", title: "Idempotency key collision logs", evidenceType: "Log", authority: "Authoritative", freshness: "Current", quality: 95, supports: "OBS 2", owner: "Payments Platform", status: "Accepted" },
  { id: "EV 8811", title: "Checkout availability SLO report", evidenceType: "Telemetry", authority: "Authoritative", freshness: "Current", quality: 98, supports: "OBS 3", owner: "Site Reliability Engineering", status: "Accepted" },
  { id: "EV 8812", title: "P95 latency distribution export", evidenceType: "Telemetry", authority: "Authoritative", freshness: "Current", quality: 97, supports: "OBS 4", owner: "Site Reliability Engineering", status: "Accepted" },
  { id: "EV 8813", title: "Fraud loss variance analysis", evidenceType: "Analysis", authority: "Authoritative", freshness: "Current", quality: 89, supports: "OBS 5", owner: "Fraud Engineering", status: "Accepted" },
  { id: "EV 8814", title: "Chargeback trend comparison", evidenceType: "Analysis", authority: "Supporting", freshness: "Aging", quality: 82, supports: "OBS 5", owner: "Fraud Engineering", status: "Accepted" },
  { id: "EV 8815", title: "Identity Services request volume telemetry", evidenceType: "Telemetry", authority: "Authoritative", freshness: "Current", quality: 94, supports: "OBS 6", owner: "Identity Engineering", status: "Accepted" },
  { id: "EV 8816", title: "Fraud Decision Service saturation report", evidenceType: "Telemetry", authority: "Authoritative", freshness: "Current", quality: 92, supports: "OBS 6", owner: "Fraud Engineering", status: "Accepted" },
  { id: "EV 8817", title: "Post mitigation duplicate authorization comparison", evidenceType: "Analysis", authority: "Authoritative", freshness: "Current", quality: 95, supports: "VAR 1", owner: "Payments Platform", status: "Accepted" },
  { id: "EV 8818", title: "Joint investigation timeline record", evidenceType: "Operational Record", authority: "Supporting", freshness: "Current", quality: 84, supports: "UNX 2", owner: "Site Reliability Engineering", status: "Accepted" },
];

export const evidenceById = (id: string) => evidenceRecords.find((e) => e.id === id);

/* =================================================== related knowledge */

export const relatedKnowledge: RelatedKnowledge[] = [
  {
    id: "LRN 1182", recordType: "Existing Learning",
    title: "Progressive rollout reduces operational blast radius for customer facing configuration changes",
    relationship: "Supports Candidate", authority: "Validated Learning", status: "Current",
  },
  {
    id: "COND 100425", recordType: "Existing Condition",
    title: "Traffic greater than 10% requires joint approval",
    relationship: "Relevant Constraint", authority: "Authoritative Condition", status: "Current",
  },
  {
    id: "PER 4101", recordType: "Existing Persona Rule",
    title: "Payments Platform: prefer reversible changes",
    relationship: "Aligned", authority: "Approved Persona v3.4", status: "Current",
  },
  {
    id: "GUID 2204", recordType: "Potential Conflict",
    title: "Legacy Retry Review Guidance: standard idempotency unit testing sufficient before rollout",
    relationship: "Potentially contradicted by observed outcome", authority: "Legacy Guidance", status: "Review Required",
  },
];

export const contradictions: LearningContradiction[] = [
  {
    id: "LCF 1", learningCandidateId: "LC 1426", existingRecordType: "Control Guidance", existingRecordId: "GUID 2204",
    existingRecord: "Legacy Retry Testing Guidance", conflictType: "Evidence Requirement",
    description:
      "Legacy guidance treats standard idempotency unit testing as sufficient before rollout. Observed duplicate authorization exposure contradicts that sufficiency claim for retry concurrency changes.",
    authorityComparison: "Observed outcome evidence is more recent. Legacy guidance holds broader enterprise scope.",
    evidenceReferenceIds: ["EV 8809", "EV 8810", "EV 8817"], severity: "High",
    potentialResolution: "Narrow legacy guidance to non concurrent retry paths and add a concurrency validation requirement",
    status: "Review Required",
  },
  {
    id: "LCF 2", learningCandidateId: "LC 1429", existingRecordType: "Business Condition", existingRecordId: "COND 100612",
    existingRecord: "Dependency capacity headroom assumed linear to traffic", conflictType: "Learning vs Business Condition",
    description: "Observed dependency volume growth was not linear to traffic exposure across the observed range.",
    authorityComparison: "Condition is authoritative. Observed evidence is bounded to 15% exposure.",
    evidenceReferenceIds: ["EV 8815", "EV 8816"], severity: "Medium",
    potentialResolution: "Flag the condition for re-derivation once higher exposure evidence exists",
    status: "Review Required",
  },
  {
    id: "LCF 3", learningCandidateId: "LC 1428", existingRecordType: "Persona Decision Rule", existingRecordId: "PER 4102",
    existingRecord: "Checkout Engineering: retry increases are conversion neutral", conflictType: "Outcome vs Assumption",
    description: "Observed checkout completion improved by 1.8%, which conflicts with the conversion neutral rule.",
    authorityComparison: "Persona rule predates the observation window.",
    evidenceReferenceIds: ["EV 8801"], severity: "Medium",
    potentialResolution: "Propose a bounded persona rule refresh in Prompt 2",
    status: "Review Required",
  },
];

export const patterns: LearningPatternCandidate[] = [
  {
    id: "LPC 1", title: "Progressive rollout associated with lower adverse blast radius across 14 customer facing configuration changes",
    description: "Across 14 customer facing configuration changes, progressive rollout correlated with narrower adverse impact before containment.",
    patternType: "Mitigation Effectiveness",
    decisionIds: ["DEC 5001", "DEC 5005", "DEC 5007"], decisionCount: 14,
    supportingOutcomeIds: ["OBS 2", "OBS 21"], supportingCount: 12, contradictingCount: 1, insufficientCount: 1,
    confidence: 89, status: "Candidate Pattern",
  },
  {
    id: "LPC 2", title: "Dependency saturation risk frequently underestimated when traffic amplification changes exceed 20%",
    description: "Across 9 decisions with traffic amplification above 20%, predicted dependency saturation understated observed load growth.",
    patternType: "Risk Recalibration",
    decisionIds: ["DEC 5001", "DEC 5003", "DEC 5006"], decisionCount: 9,
    supportingOutcomeIds: ["OBS 6"], supportingCount: 7, contradictingCount: 1, insufficientCount: 1,
    confidence: 86, status: "Candidate Pattern",
  },
  {
    id: "LPC 3", title: "Rollback thresholds defined before execution correlate with faster containment",
    description: "Across 18 decisions, pre defined rollback thresholds correlated with shorter containment intervals after a threshold breach.",
    patternType: "Decision Pattern",
    decisionIds: ["DEC 5001", "DEC 5004", "DEC 5005", "DEC 5008"], decisionCount: 18,
    supportingOutcomeIds: ["OBS 2"], supportingCount: 16, contradictingCount: 1, insufficientCount: 1,
    confidence: 92, status: "Candidate Pattern",
  },
];

/* ========================================================= causal + scope */

export const causalAssessments: LearningCausalAssessment[] = [
  {
    id: "LCA 1", learningCandidateId: "LC 1426", temporalAlignment: 96, evidenceQuality: 95,
    alternativeExplanationCoverage: 88, controlComparison: 92, priorPatternSupport: 86,
    mechanismPlausibility: 94, outcomeConsistency: 93, scopeConsistency: 90,
    overallConfidence: 91, status: "High Confidence",
  },
  {
    id: "LCA 2", learningCandidateId: "LC 1427", temporalAlignment: 94, evidenceQuality: 96,
    alternativeExplanationCoverage: 85, controlComparison: 94, priorPatternSupport: 92,
    mechanismPlausibility: 93, outcomeConsistency: 92, scopeConsistency: 89,
    overallConfidence: 93, status: "High Confidence",
  },
  {
    id: "LCA 3", learningCandidateId: "LC 1428", temporalAlignment: 90, evidenceQuality: 92,
    alternativeExplanationCoverage: 78, controlComparison: 84, priorPatternSupport: 74,
    mechanismPlausibility: 90, outcomeConsistency: 88, scopeConsistency: 80,
    overallConfidence: 88, status: "Moderate Confidence",
  },
  {
    id: "LCA 4", learningCandidateId: "LC 1429", temporalAlignment: 88, evidenceQuality: 90,
    alternativeExplanationCoverage: 74, controlComparison: 80, priorPatternSupport: 72,
    mechanismPlausibility: 88, outcomeConsistency: 86, scopeConsistency: 72,
    overallConfidence: 86, status: "Moderate Confidence",
  },
];

export const causalDimensionLabels: { key: keyof LearningCausalAssessment; label: string; description: string }[] = [
  { key: "temporalAlignment", label: "Temporal Alignment", description: "Observed change follows the decision in time" },
  { key: "evidenceQuality", label: "Evidence Quality", description: "Authority and freshness of supporting evidence" },
  { key: "alternativeExplanationCoverage", label: "Alternative Explanation Coverage", description: "Competing explanations examined and bounded" },
  { key: "controlComparison", label: "Control Comparison", description: "Comparable unaffected segments available" },
  { key: "priorPatternSupport", label: "Prior Pattern Support", description: "Consistency with prior observed outcomes" },
  { key: "mechanismPlausibility", label: "Mechanism Plausibility", description: "A concrete mechanism explains the outcome" },
  { key: "outcomeConsistency", label: "Outcome Consistency", description: "Stability of the outcome across the window" },
  { key: "scopeConsistency", label: "Scope Consistency", description: "Outcome consistent across the observed scope" },
];

export const causalFor = (candidateId: string) =>
  causalAssessments.find((c) => c.learningCandidateId === candidateId) ?? causalAssessments[0];

export const applicabilityRecords: LearningApplicability[] = [
  { id: "LAP 1", learningCandidateId: "LC 1426", scopeType: "Change Type", scopeValue: "Payment retry policy changes", applicabilityState: "Applies To", confidence: 94, reason: "Directly observed in the analysed decision", evidenceReferenceIds: ["EV 8809", "EV 8810"], additionalEvidenceRequired: "None" },
  { id: "LAP 2", learningCandidateId: "LC 1426", scopeType: "Journey", scopeValue: "Customer facing payment transaction paths", applicabilityState: "Applies To", confidence: 92, reason: "Observed transaction path matches the scope", evidenceReferenceIds: ["EV 8801"], additionalEvidenceRequired: "None" },
  { id: "LAP 3", learningCandidateId: "LC 1426", scopeType: "Environment", scopeValue: "Progressive rollout environments", applicabilityState: "Applies To", confidence: 91, reason: "Containment behaviour observed under progressive rollout", evidenceReferenceIds: ["EV 8803"], additionalEvidenceRequired: "None" },
  { id: "LAP 4", learningCandidateId: "LC 1426", scopeType: "Failure Category", scopeValue: "Transient payment failure categories", applicabilityState: "Applies To", confidence: 90, reason: "Observed recovery concentrated in transient categories", evidenceReferenceIds: ["EV 8802"], additionalEvidenceRequired: "None" },
  { id: "LAP 5", learningCandidateId: "LC 1426", scopeType: "System", scopeValue: "Other transaction retry systems", applicabilityState: "Potentially Applies To", confidence: 74, reason: "Mechanism is plausible but unobserved outside payments", evidenceReferenceIds: [], additionalEvidenceRequired: "Concurrency validation results from a non payment retry system" },
  { id: "LAP 6", learningCandidateId: "LC 1426", scopeType: "Journey", scopeValue: "Other commerce flows", applicabilityState: "Potentially Applies To", confidence: 71, reason: "Similar transaction semantics, no direct observation", evidenceReferenceIds: [], additionalEvidenceRequired: "Observed outcomes from another commerce flow" },
  { id: "LAP 7", learningCandidateId: "LC 1426", scopeType: "Rollout", scopeValue: "100% immediate rollout", applicabilityState: "Does Not Apply", confidence: 88, reason: "No evidence exists at full exposure. Extrapolation is not supported.", evidenceReferenceIds: [], additionalEvidenceRequired: "Full exposure observation" },
  { id: "LAP 8", learningCandidateId: "LC 1426", scopeType: "Failure Category", scopeValue: "Persistent decline categories", applicabilityState: "Does Not Apply", confidence: 86, reason: "Retries do not recover persistent declines", evidenceReferenceIds: ["EV 8802"], additionalEvidenceRequired: "None" },
  { id: "LAP 9", learningCandidateId: "LC 1426", scopeType: "Journey", scopeValue: "Nonpayment workflows", applicabilityState: "Does Not Apply", confidence: 84, reason: "Out of the observed domain", evidenceReferenceIds: [], additionalEvidenceRequired: "None" },
  { id: "LAP 10", learningCandidateId: "LC 1426", scopeType: "Region", scopeValue: "Other regions without supporting evidence", applicabilityState: "Does Not Apply", confidence: 80, reason: "Observation limited to North America", evidenceReferenceIds: [], additionalEvidenceRequired: "Regional observation window" },
  { id: "LAP 11", learningCandidateId: "LC 1426", scopeType: "Provider", scopeValue: "Different payment providers", applicabilityState: "Unknown", confidence: 52, reason: "Provider response timing was a contributor and varies by provider", evidenceReferenceIds: [], additionalEvidenceRequired: "Provider specific retry timing analysis" },
  { id: "LAP 12", learningCandidateId: "LC 1426", scopeType: "Risk Model", scopeValue: "Different fraud models", applicabilityState: "Unknown", confidence: 50, reason: "Fraud model behaviour was not varied during the window", evidenceReferenceIds: [], additionalEvidenceRequired: "Comparative fraud model observation" },
  { id: "LAP 13", learningCandidateId: "LC 1426", scopeType: "Traffic", scopeValue: "Different peak traffic conditions", applicabilityState: "Unknown", confidence: 48, reason: "Observation did not include a peak seasonal window", evidenceReferenceIds: [], additionalEvidenceRequired: "Peak window observation" },
];

export const applicabilityFor = (candidateId: string) => {
  const own = applicabilityRecords.filter((a) => a.learningCandidateId === candidateId);
  if (own.length) return own;
  const c = candidateById(candidateId);
  if (!c) return [];
  const mk = (scopeValue: string, state: LearningApplicability["applicabilityState"], confidence: number, reason: string, i: number): LearningApplicability => ({
    id: `LAP ${candidateId}-${i}`, learningCandidateId: candidateId, scopeType: "Scope", scopeValue,
    applicabilityState: state, confidence, reason, evidenceReferenceIds: [], additionalEvidenceRequired: state === "Unknown" ? "Additional observation required" : "None",
  });
  return [
    ...c.applicableScopes.map((s, i) => mk(s, "Applies To", c.applicabilityConfidence, "Directly observed", i)),
    ...c.potentialScopes.map((s, i) => mk(s, "Potentially Applies To", Math.max(50, c.applicabilityConfidence - 18), "Plausible but unobserved", 100 + i)),
    ...c.excludedScopes.map((s, i) => mk(s, "Does Not Apply", Math.max(50, c.applicabilityConfidence - 6), "No supporting evidence in scope", 200 + i)),
    ...c.unknownScopes.map((s, i) => mk(s, "Unknown", 50, "Not varied during the observation window", 300 + i)),
  ];
};

/* ================================================================ quality */

export const learningQuality = {
  overall: 93,
  target: 95,
  dimensions: [
    { name: "Outcome Evidence Coverage", current: 95, target: 96, trend: "+2", affected: 42 },
    { name: "Expectation Traceability", current: 98, target: 97, trend: "+1", affected: 8 },
    { name: "Variance Accuracy", current: 96, target: 96, trend: "0", affected: 14 },
    { name: "Assumption Coverage", current: 91, target: 95, trend: "+3", affected: 61 },
    { name: "Risk Realization Coverage", current: 92, target: 95, trend: "+2", affected: 48 },
    { name: "Control Effectiveness Coverage", current: 90, target: 95, trend: "+4", affected: 66 },
    { name: "Mitigation Effectiveness Coverage", current: 93, target: 95, trend: "+1", affected: 39 },
    { name: "Causal Confidence", current: 89, target: 92, trend: "-1", affected: 74 },
    { name: "Applicability Definition", current: 91, target: 94, trend: "+2", affected: 55 },
    { name: "Contradiction Detection", current: 94, target: 94, trend: "+3", affected: 17 },
    { name: "Historical Context Preservation", current: 99, target: 99, trend: "0", affected: 0 },
    { name: "Learning Traceability", current: 98, target: 97, trend: "+1", affected: 6 },
  ],
};

/* ============================================================== package */

export const learningPackage: LearningPackage = {
  id: "LP 9001", analysisId: "OL 9001", decisionId: "DEC 5001", decisionContextSnapshotId: "DCS 5001",
  expectedOutcomeIds: expectations.map((e) => e.id),
  observedOutcomeIds: observations.map((o) => o.id),
  varianceIds: variances.map((v) => v.id),
  assumptionEvaluationIds: assumptionEvaluations.map((a) => a.id),
  riskRealizationIds: riskRealizations.map((r) => r.id),
  controlEffectivenessIds: controlEffectiveness.map((c) => c.id),
  mitigationEffectivenessIds: mitigationEffectiveness.map((m) => m.id),
  unexpectedConsequenceIds: unexpectedConsequences.map((u) => u.id),
  learningCandidateIds: ["LC 1426", "LC 1427", "LC 1428", "LC 1429"],
  evidenceReferenceIds: evidenceRecords.map((e) => e.id),
  potentialUpdateTargets: [
    { type: "Business Condition", target: "COND 100612 · Dependency capacity headroom", note: "Flag for re-derivation once higher exposure evidence exists" },
    { type: "Team Persona", target: "Payments Platform v3.4 · Preferred Evidence", note: "Add production representative concurrency validation" },
    { type: "Team Persona", target: "Checkout Engineering v4.1 · Decision Rule", note: "Bounded refresh of the conversion neutral retry rule" },
    { type: "Risk", target: "RIS 3302 · Fraud Exposure", note: "Recalibrate predicted severity within the observed window only" },
    { type: "Control", target: "CON 7701 · Idempotency Validation", note: "Strengthen pre rollout validation requirement" },
    { type: "Decision Guidance", target: "Retry Change Review Checklist", note: "Add concurrency validation and rollback threshold checkpoints" },
  ],
  packageConfidence: 91,
  status: "Review Required",
  createdAt: "2026-05-24 10:26",
};

/* ============================================================= activity */

export const seedActivity: OrganizationalLearningActivity[] = [
  { id: "OLA 1", timestamp: "10:26", analysisId: "OL 9001", learningCandidateId: null, action: "Learning package prepared", description: "Learning package LP 9001 prepared with 4 learning candidates", result: "Review Required", owner: "Knowledge Governance", auditId: "AUD 91004" },
  { id: "OLA 2", timestamp: "10:21", analysisId: "OL 9001", learningCandidateId: "LC 1429", action: "Learning candidate generated", description: "Dependency behaviour candidate created from OBS 6", result: "Candidate", owner: "Learning Analysis", auditId: "AUD 91003" },
  { id: "OLA 3", timestamp: "10:12", analysisId: "OL 9001", learningCandidateId: "LC 1426", action: "Learning candidate generated", description: "Control improvement candidate created from VAR 1", result: "Candidate", owner: "Learning Analysis", auditId: "AUD 91002" },
  { id: "OLA 4", timestamp: "09:48", analysisId: "OL 9001", learningCandidateId: null, action: "Variance detected", description: "Duplicate authorization exceeded the expected ceiling during the initial stage", result: "Material Negative Variance", owner: "Learning Analysis", auditId: "AUD 91001" },
  { id: "OLA 5", timestamp: "09:31", analysisId: "OL 9001", learningCandidateId: null, action: "Outcome evidence validated", description: "18 evidence records validated for the observation window", result: "94% coverage", owner: "Evidence Governance", auditId: "AUD 91000" },
];

export const historyEvents = [
  { id: "HIS 1", label: "Decision Created", timestamp: "2026-04-11 09:04", detail: "DIA 5001 opened from Cognitive Intake" },
  { id: "HIS 2", label: "Decision Recorded", timestamp: "2026-04-18 16:22", detail: "DEC 5001 recorded, Approve Option B with Conditions" },
  { id: "HIS 3", label: "Execution Started", timestamp: "2026-04-22 08:00", detail: "Progressive rollout began at 5% traffic" },
  { id: "HIS 4", label: "Outcome Observed", timestamp: "2026-05-22 23:59", detail: "30 day observation window closed" },
  { id: "HIS 5", label: "Evidence Linked", timestamp: "2026-05-23 09:31", detail: "18 evidence records linked to observed outcomes" },
  { id: "HIS 6", label: "Variance Detected", timestamp: "2026-05-23 09:48", detail: "2 material variances identified" },
  { id: "HIS 7", label: "Learning Candidate Created", timestamp: "2026-05-24 10:12", detail: "4 learning candidates generated" },
];

/* ============================================== deterministic derivation */

export interface OlWorkbenchParams {
  excludedEvidence: string[];
  addedEvidence: string[];
  observationWindow: string;
  hypotheticalTraffic: number;
}

export const baselineParams: OlWorkbenchParams = {
  excludedEvidence: [],
  addedEvidence: [],
  observationWindow: "30 days",
  hypotheticalTraffic: 15,
};

export const optionalEvidence: OlEvidence[] = [
  { id: "EV 8819", title: "Peak window duplicate authorization sample", evidenceType: "Telemetry", authority: "Supporting", freshness: "Current", quality: 88, supports: "VAR 1", owner: "Payments Platform", status: "Available" },
  { id: "EV 8821", title: "Control segment comparison, unexposed traffic", evidenceType: "Analysis", authority: "Authoritative", freshness: "Current", quality: 93, supports: "VAR 2", owner: "Checkout Engineering", status: "Available" },
  { id: "EV 8822", title: "Provider response timing distribution", evidenceType: "Analysis", authority: "Supporting", freshness: "Aging", quality: 79, supports: "VAR 1", owner: "Payments Platform", status: "Available" },
];

export interface OlDerivedState {
  evidenceCoverage: number;
  causalConfidence: number;
  packageConfidence: number;
  applicabilityConfidence: number;
  causalClassification: string;
  extrapolationWarning: string | null;
  windowWarning: string | null;
  evidenceGaps: string[];
  serviceState: string;
  activeEvidenceIds: string[];
}

const WINDOW_ADJUSTMENT: Record<string, number> = {
  "7 days": -9, "14 days": -4, "30 days": 0, "90 days": +2,
};

/**
 * Deterministic recomputation of the workbench state.
 * Replace with an enterprise causal assessment service without changing callers.
 */
export function deriveLearningState(p: OlWorkbenchParams): OlDerivedState {
  const core = ["EV 8809", "EV 8810", "EV 8817", "EV 8801", "EV 8802"];
  const activeCore = core.filter((id) => !p.excludedEvidence.includes(id));
  const added = p.addedEvidence.length;

  let coverage = 94 - (core.length - activeCore.length) * 6 + added * 2;
  let causal = 91 - (core.length - activeCore.length) * 7 + added * 2;
  const windowAdj = WINDOW_ADJUSTMENT[p.observationWindow] ?? 0;
  causal += windowAdj;
  coverage += Math.round(windowAdj / 2);

  const extrapolationWarning = p.hypotheticalTraffic > 15
    ? `Observed evidence covers traffic exposure up to 15%. It does NOT support extrapolation to ${p.hypotheticalTraffic}%. Additional observation is required before any learning is applied at this exposure.`
    : null;

  if (p.hypotheticalTraffic > 15) causal -= Math.min(18, Math.round((p.hypotheticalTraffic - 15) / 5) * 4);

  const windowWarning = p.observationWindow === "7 days" || p.observationWindow === "14 days"
    ? `A ${p.observationWindow} window is shorter than the recorded 30 day expectation window. Fraud loss and dependency conclusions become scope limited.`
    : p.observationWindow === "90 days"
      ? "A 90 day window extends beyond the recorded expectation window. Outcomes after day 30 are contextual, not expectation linked."
      : null;

  coverage = Math.max(48, Math.min(99, coverage));
  causal = Math.max(42, Math.min(98, causal));

  const evidenceGaps: string[] = [];
  if (p.excludedEvidence.includes("EV 8809") || p.excludedEvidence.includes("EV 8810")) evidenceGaps.push("Duplicate authorization telemetry excluded. Variance 1 is no longer directly evidenced.");
  if (p.excludedEvidence.includes("EV 8801")) evidenceGaps.push("Checkout completion telemetry excluded. Variance 2 loses its primary observation.");
  if (p.excludedEvidence.includes("EV 8817")) evidenceGaps.push("Post mitigation comparison excluded. Mitigation effect cannot be attributed.");
  if (p.hypotheticalTraffic > 15) evidenceGaps.push("No observation exists above 15% traffic exposure.");

  const causalClassification = causal >= 90 ? "High Confidence" : causal >= 78 ? "Moderate Confidence" : causal >= 60 ? "Low Confidence" : "Unresolved";

  const serviceState = evidenceGaps.length > 2 ? "Evidence Required"
    : causal < 78 ? "Review Required"
      : coverage < 85 ? "Evidence Required"
        : extrapolationWarning ? "Review Required"
          : "Operational";

  const packageConfidence = Math.max(45, Math.min(97, Math.round((coverage + causal) / 2)));
  const applicabilityConfidence = Math.max(40, Math.min(96, causal - (p.hypotheticalTraffic > 15 ? 12 : 0)));

  return {
    evidenceCoverage: coverage,
    causalConfidence: causal,
    packageConfidence,
    applicabilityConfidence,
    causalClassification,
    extrapolationWarning,
    windowWarning,
    evidenceGaps,
    serviceState,
    activeEvidenceIds: [
      ...evidenceRecords.map((e) => e.id).filter((id) => !p.excludedEvidence.includes(id)),
      ...p.addedEvidence,
    ],
  };
}

/* ============================================== expected vs observed matrix */

export interface MatrixRow {
  metric: string;
  baseline: string;
  expectedValue: string;
  expectedRange: string;
  observedValue: string;
  variance: string;
  materiality: string;
  evidenceCoverage: number;
  confidence: number;
  status: string;
  expectedOutcomeId: string;
  observationId: string;
  varianceId: string | null;
}

export const matrixRows: MatrixRow[] = expectations.map((e, i) => {
  const o = observations[i];
  const v = variances.find((x) => x.expectedOutcomeId === e.id) ?? null;
  return {
    metric: e.metric,
    baseline: e.baseline,
    expectedValue: e.expectedValue,
    expectedRange: e.expectedRange,
    observedValue: o.observedValue,
    variance: v ? `${v.varianceDirection} · ${v.absoluteDifference}` : "Within expected range",
    materiality: v ? v.materiality : "Immaterial",
    evidenceCoverage: [96, 94, 98, 97, 88, 91][i],
    confidence: o.confidence,
    status: o.status,
    expectedOutcomeId: e.id,
    observationId: o.id,
    varianceId: v?.id ?? null,
  };
});

export const matrixStatuses = [
  "Exceeded Positive", "Within Expected Range", "Near Threshold", "Negative Variance",
  "Material Negative Variance", "Insufficient Evidence", "Observation Incomplete",
];
