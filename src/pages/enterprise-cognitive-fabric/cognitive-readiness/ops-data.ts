/**
 * Cognitive Readiness Assessment — Prompt 2 extended data models and seeds.
 *
 * These models extend (never replace) the Prompt 1 canonical models in data.ts.
 * Everything here is local and deterministic. No backend, no live enterprise call.
 */

import { assumptions, ambiguities, constraints, conditionStates, dependencyStates, personaStates } from "./data";

/* --------------------------------------------------------------- taxonomy -- */

export const gapTypes = [
  "Missing Context", "Missing Evidence", "Unresolved Assumption", "Ambiguous Scope",
  "Unresolved Dependency", "Conflicting Evidence", "Unbound Policy Variable", "Missing Owner",
  "Missing Rollback Context", "Missing Outcome Definition", "Nonblocking Uncertainty",
  "Blocking Gap", "Accepted Exception",
] as const;
export type GapType = (typeof gapTypes)[number];

export const remediationCategories = [
  "Evidence", "Clarification", "Dependency", "Assumption", "Constraint", "Policy Binding",
  "Ownership", "Execution Context", "Expected Outcome", "Contradiction",
] as const;
export type RemediationCategory = (typeof remediationCategories)[number];

export const severities = ["Critical", "High", "Medium", "Low"] as const;
export type Severity = (typeof severities)[number];

export const operationalStates = [
  "Loading", "Empty", "Error", "Assessing", "Ready", "Conditionally Ready", "Evidence Required",
  "Clarification Required", "Remediation Required", "Blocked", "Exception Pending",
  "Exception Approved", "Override Pending", "Reassessment Running", "Ready for Persona Impact",
  "Routed to Persona Impact", "Historical Integrity Alert", "Paused",
] as const;
export type OperationalState = (typeof operationalStates)[number];

/* ------------------------------------------------------------- 36. models -- */

export interface CognitiveReadinessRemediation {
  id: string;
  assessment: string;
  workItem: string;
  category: RemediationCategory;
  gapType: GapType;
  description: string;
  currentContext: string;
  requiredContext: string;
  whyRequired: string;
  affectedDimension: string;
  affectedGate: string;
  affectedPersonas: string[];
  affectedConditions: string[];
  affectedDependencies: string[];
  downstreamEvaluations: string[];
  severity: Severity;
  blocking: boolean;
  owner: string;
  due: string;
  status: string;
  history: { at: string; entry: string }[];
  resolutionOptions: string[];
}

export interface CognitiveReadinessClarification {
  id: string;
  remediationId: string | null;
  assessment: string;
  topic: string;
  question: string;
  assignedTo: string;
  responseType: string;
  due: string;
  impactIfUnresolved: string;
  status: "Requested" | "Answered" | "Cancelled";
  response?: string;
  effect?: string;
}

export interface CognitiveReadinessEvidenceRequest {
  id: string;
  assessment: string;
  evidenceType: string;
  description: string;
  requiredFor: string;
  affectedDimension: string;
  affectedPersona: string;
  owner: string;
  due: string;
  necessity: "Required to Proceed" | "Optional but Recommended";
  status: "Requested" | "Received" | "Cancelled";
}

export interface CognitiveReadinessAddedEvidence {
  id: string;
  name: string;
  evidenceType: string;
  description: string;
  source: string;
  owner: string;
  authority: string;
  freshness: string;
  relatedWorkContext: string;
  relatedDimension: string;
  relatedGap: string;
  accessClassification: string;
  synthetic: boolean;
  addedAt: string;
}

export interface CognitiveReadinessReview {
  id: string;
  assessment: string;
  workItem: string;
  reviewType: string;
  issue: string;
  severity: Severity;
  reviewer: string;
  due: string;
  status: string;
  decision?: string;
  comments?: string;
}

export interface CognitiveReadinessException {
  id: string;
  assessment: string;
  blockingItem: string;
  reason: string;
  affectedPersonas: string[];
  affectedDimensions: string[];
  potentialConsequence: string;
  compensatingControls: string;
  owner: string;
  approver: string;
  expiration: string;
  downstreamWarning: string;
  restriction: string;
  status: "Requested" | "Approved" | "Rejected" | "Expired";
}

export interface CognitiveReadinessOverride {
  id: string;
  assessment: string;
  currentState: string;
  proposedState: string;
  blockingFindings: string[];
  businessReason: string;
  decisionOwner: string;
  riskOwner: string;
  affectedPersonas: string[];
  compensatingControls: string;
  expiration: string;
  approver: string;
  comments: string;
  status: "Requested" | "Approved" | "Rejected" | "Blocked" | "Expired";
}

export interface CognitiveReadinessAssessmentVersion {
  id: string;
  assessment: string;
  version: number;
  label: string;
  timestamp: string;
  intakePackageVersion: string;
  personaScope: string[];
  conditionSet: string[];
  evidenceCoverage: number;
  dependencyCoverage: number;
  dimensionScores: Record<string, number>;
  gateStates: Record<string, string>;
  score: number;
  state: string;
  openFindings: number;
  createdBy: string;
  reason: string;
}

export interface CognitiveReadinessHandoffPackage {
  workItem: string;
  intakePackageVersion: string;
  assessmentVersion: string;
  readinessState: string;
  readinessScore: number;
  readinessConfidence: number;
  intent: string;
  currentState: string;
  proposedState: string;
  scope: string;
  systems: string[];
  services: string[];
  dependencies: string[];
  candidatePersonas: string[];
  personaReadiness: { persona: string; readiness: string }[];
  applicableConditions: string[];
  policyBindings: { variable: string; value: string }[];
  evidence: string[];
  evidenceGaps: string[];
  assumptions: string[];
  acceptedAssumptions: string[];
  constraints: string[];
  ambiguities: string[];
  acceptedInterpretations: string[];
  contradictions: string[];
  resolvedContradictions: string[];
  exceptions: string[];
  rollout: string;
  rollback: string;
  expectedOutcomes: string;
  observationRequirements: string[];
  uncertaintyMarkers: string[];
  criticalDownstreamWarnings: string[];
  historicalContextVersion: string;
}

export interface CognitiveReadinessActivity {
  id: string;
  time: string;
  category: string;
  entry: string;
}

export interface CognitiveReadinessNotification {
  id: string;
  category: string;
  title: string;
  detail: string;
  severity: Severity;
  time: string;
  read: boolean;
  acknowledged: boolean;
  assignee?: string;
}

/* ------------------------------------------------------------ 2. seeds -- */

const H = (at: string, entry: string) => ({ at, entry });

export const seedRemediations: CognitiveReadinessRemediation[] = [
  {
    id: "REM 8101", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update",
    category: "Evidence", gapType: "Missing Evidence",
    description: "Fraud Loss Analysis missing",
    currentContext: "Fraud tolerance is asserted in the design document with no quantified analysis.",
    requiredContext: "Quantified fraud loss exposure for a third retry attempt across transient failure classes.",
    whyRequired: "Fraud Engineering cannot be evaluated for material impact without loss exposure evidence.",
    affectedDimension: "Evidence Sufficiency", affectedGate: "Evidence Gate",
    affectedPersonas: ["Fraud Engineering"],
    affectedConditions: ["Fraud Loss Materiality"], affectedDependencies: ["Fraud Decision Service"],
    downstreamEvaluations: ["Persona Impact — Fraud Engineering", "Decision Intelligence recommendation"],
    severity: "High", blocking: false, owner: "Risk Technology", due: "2026-08-14",
    status: "Evidence Requested",
    history: [H("10:18 AM", "Evidence requested from Risk Technology"), H("09:41 AM", "Gap detected during evidence sufficiency scan")],
    resolutionOptions: ["Add Evidence", "Request Evidence", "Accept Nonblocking Uncertainty", "Recommend Exception"],
  },
  {
    id: "REM 8102", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update",
    category: "Dependency", gapType: "Unresolved Dependency",
    description: "Regional Dependency Stress Test missing",
    currentContext: "Regional Token Vault capacity headroom is unverified for retry amplification.",
    requiredContext: "Stress test evidence covering retry amplification against the regional token vault.",
    whyRequired: "Scope and dependency context drives which Personas can be meaningfully evaluated.",
    affectedDimension: "Scope & Dependency Context", affectedGate: "Material Impact Context Gate",
    affectedPersonas: ["SRE", "Payments", "Identity"],
    affectedConditions: ["Regional Dependency Capacity"], affectedDependencies: ["Regional Token Vault", "Identity Services"],
    downstreamEvaluations: ["Persona Impact — Identity Engineering", "Persona Impact — Site Reliability Engineering"],
    severity: "High", blocking: false, owner: "Identity Engineering", due: "2026-08-15",
    status: "Open",
    history: [H("09:44 AM", "Dependency validation flagged as required")],
    resolutionOptions: ["Add Evidence", "Request Owner Confirmation", "Mark Nonmaterial", "Escalate"],
  },
  {
    id: "REM 8103", assessment: "CRA 7003", workItem: "Regional Token Vault Migration",
    category: "Execution Context", gapType: "Missing Rollback Context",
    description: "Rollback Path Undefined",
    currentContext: "No rollback trigger, stop condition, or reversal runbook is present.",
    requiredContext: "Documented rollback trigger, threshold, owner, and validated reversal procedure.",
    whyRequired: "Execution safety cannot be assessed and implementation level impact analysis is unsafe.",
    affectedDimension: "Execution & Reversibility", affectedGate: "Execution Safety Gate",
    affectedPersonas: ["Site Reliability Engineering", "Identity Engineering"],
    affectedConditions: ["Availability >=99.95%"], affectedDependencies: ["Regional Token Vault"],
    downstreamEvaluations: ["All implementation level Persona Impact Analysis"],
    severity: "Critical", blocking: true, owner: "SRE Architecture", due: "2026-08-11",
    status: "Remediation Required",
    history: [H("08:55 AM", "Execution Safety Gate failed")],
    resolutionOptions: ["Add Evidence", "Request Clarification", "Recommend Exception", "Escalate"],
  },
  {
    id: "REM 8104", assessment: "CRA 7004", workItem: "Fraud Decision Timeout Adjustment",
    category: "Clarification", gapType: "Ambiguous Scope",
    description: "Does timeout apply to all transaction classes or only transient retry flows?",
    currentContext: "The proposal says the timeout applies to payment transactions without qualification.",
    requiredContext: "An explicit transaction class list bounded to eligible retry flows.",
    whyRequired: "Applicable Business Conditions and candidate Personas change with transaction class scope.",
    affectedDimension: "Intent & Decision Clarity", affectedGate: "Required Context Gate",
    affectedPersonas: ["Fraud Engineering", "Payments Platform"],
    affectedConditions: ["Idempotency Required"], affectedDependencies: ["Fraud Decision Service"],
    downstreamEvaluations: ["Persona scope selection", "Condition applicability"],
    severity: "High", blocking: true, owner: "Payments Architecture", due: "2026-08-12",
    status: "Clarification Required",
    history: [H("08:30 AM", "Ambiguity detected in proposed state")],
    resolutionOptions: ["Request Clarification", "Accept Bounded Interpretation", "Escalate"],
  },
  {
    id: "REM 8105", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update",
    category: "Policy Binding", gapType: "Unbound Policy Variable",
    description: "risk.fraud.materiality is unbound for this work type",
    currentContext: "Fraud Loss Materiality condition references an unbound policy variable.",
    requiredContext: "A bound authoritative value with effective date and owner.",
    whyRequired: "Condition readiness cannot be resolved while the threshold is unbound.",
    affectedDimension: "Enterprise Context Coverage", affectedGate: "Material Impact Context Gate",
    affectedPersonas: ["Fraud Engineering", "Release Governance"],
    affectedConditions: ["Fraud Loss Materiality"], affectedDependencies: [],
    downstreamEvaluations: ["Condition readiness", "Decision Intelligence thresholds"],
    severity: "Medium", blocking: false, owner: "Risk Policy Office", due: "2026-08-18",
    status: "Open",
    history: [H("09:12 AM", "Policy binding review opened")],
    resolutionOptions: ["Bind Current Value", "Request Policy Owner Review", "Mark Not Applicable"],
  },
  {
    id: "REM 8106", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update",
    category: "Contradiction", gapType: "Conflicting Evidence",
    description: "Phase 2 exposure stated as 15% and 25% in two authoritative sources",
    currentContext: "Design Document and Rollout Plan disagree on Phase 2 traffic exposure.",
    requiredContext: "A single resolved exposure value or two explicitly governed scenarios.",
    whyRequired: "Governance conditions activate at different exposure thresholds.",
    affectedDimension: "Uncertainty & Assumption Transparency", affectedGate: "Material Impact Context Gate",
    affectedPersonas: ["Release Governance", "Payments Platform", "Fraud Engineering"],
    affectedConditions: ["Traffic >10% Joint Approval"], affectedDependencies: [],
    downstreamEvaluations: ["Governance review requirement", "Persona Impact — Release Governance"],
    severity: "Medium", blocking: false, owner: "Release Governance", due: "2026-08-16",
    status: "Open",
    history: [H("09:02 AM", "Contradiction detected across sources")],
    resolutionOptions: ["Use A", "Use B", "Create Resolved Value", "Keep Both as Scenarios", "Request Owner Decision"],
  },
];

export const seedReviews: CognitiveReadinessReview[] = [
  { id: "CRR 9001", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", reviewType: "Evidence Review", issue: "Fraud Evidence Review", severity: "High", reviewer: "Fraud Engineering Lead", due: "2026-08-13", status: "Open" },
  { id: "CRR 9002", assessment: "CRA 7003", workItem: "Regional Token Vault Migration", reviewType: "Readiness Review", issue: "Execution Safety Review", severity: "Critical", reviewer: "SRE Architecture", due: "2026-08-11", status: "Open" },
  { id: "CRR 9003", assessment: "CRA 7004", workItem: "Fraud Decision Timeout Adjustment", reviewType: "Readiness Review", issue: "Scope Clarification Review", severity: "High", reviewer: "Payments Architecture", due: "2026-08-12", status: "Open" },
  { id: "CRR 9004", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", reviewType: "Dependency Review", issue: "Regional Token Vault confidence 78%", severity: "High", reviewer: "Identity Engineering", due: "2026-08-14", status: "Open" },
  { id: "CRR 9005", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", reviewType: "Policy Review", issue: "risk.fraud.materiality unbound", severity: "Medium", reviewer: "Risk Policy Office", due: "2026-08-18", status: "Open" },
  { id: "CRR 9006", assessment: "CRA 7002", workItem: "Settlement Batch Window Change", reviewType: "Readiness Review", issue: "Outcome definition incomplete", severity: "Medium", reviewer: "Payments Platform", due: "2026-08-17", status: "Open" },
  { id: "CRR 9007", assessment: "CRA 7005", workItem: "Checkout Latency Budget Revision", reviewType: "Evidence Review", issue: "Latency baseline aging", severity: "Medium", reviewer: "Checkout Engineering", due: "2026-08-19", status: "Open" },
  { id: "CRR 9008", assessment: "CRA 7003", workItem: "Regional Token Vault Migration", reviewType: "Exception Review", issue: "Capacity evidence unavailable at architecture stage", severity: "High", reviewer: "Enterprise Architecture", due: "2026-08-13", status: "Open" },
  { id: "CRR 9009", assessment: "CRA 7004", workItem: "Fraud Decision Timeout Adjustment", reviewType: "Override Review", issue: "Requested override of Required Context Gate", severity: "High", reviewer: "Governance Board", due: "2026-08-12", status: "Open" },
  { id: "CRR 9010", assessment: "CRA 7001", workItem: "Checkout Retry Policy Update", reviewType: "Readiness Review", issue: "Ambiguity AM 01 bounded interpretation confirmation", severity: "Medium", reviewer: "Payments Architecture", due: "2026-08-15", status: "Open" },
  { id: "CRR 9011", assessment: "CRA 7005", workItem: "Checkout Latency Budget Revision", reviewType: "Policy Review", issue: "Latency policy variable version drift", severity: "High", reviewer: "Service Level Office", due: "2026-08-20", status: "Open" },
];

/* ---------------------------------------------------- 11. policy variables -- */

export interface PolicyVariable {
  variable: string;
  currentValue: string;
  unit: string;
  authority: string;
  effectiveDate: string;
  owner: string;
  version: string;
  applicableConditions: string[];
  affectedPersonas: string[];
  history: { version: string; value: string; effectiveDate: string }[];
}

export const policyVariables: PolicyVariable[] = [
  {
    variable: "payments.retry.approval_traffic_threshold", currentValue: "10", unit: "percent of production traffic",
    authority: "Release Policy v4", effectiveDate: "2026-04-01", owner: "Release Governance", version: "v4",
    applicableConditions: ["Traffic >10% Joint Approval"], affectedPersonas: ["Release Governance", "Payments Platform"],
    history: [{ version: "v4", value: "10", effectiveDate: "2026-04-01" }, { version: "v3", value: "20", effectiveDate: "2025-10-01" }],
  },
  {
    variable: "risk.fraud.materiality", currentValue: "0.35", unit: "percent of authorized volume",
    authority: "Risk Register v7", effectiveDate: "2026-02-15", owner: "Risk Policy Office", version: "v7",
    applicableConditions: ["Fraud Loss Materiality"], affectedPersonas: ["Fraud Engineering", "Release Governance"],
    history: [{ version: "v7", value: "0.35", effectiveDate: "2026-02-15" }, { version: "v6", value: "0.50", effectiveDate: "2025-06-01" }],
  },
  {
    variable: "reliability.rollback.threshold", currentValue: "0.2", unit: "percent duplicate authorizations over five minutes",
    authority: "Reliability Standard v3", effectiveDate: "2026-01-10", owner: "Site Reliability Engineering", version: "v3",
    applicableConditions: ["Availability >=99.95%"], affectedPersonas: ["Site Reliability Engineering", "Release Governance"],
    history: [{ version: "v3", value: "0.2", effectiveDate: "2026-01-10" }, { version: "v2", value: "0.5", effectiveDate: "2025-03-01" }],
  },
  {
    variable: "finops.materiality.threshold", currentValue: "250000", unit: "USD annualized",
    authority: "FinOps Policy v2", effectiveDate: "2026-03-01", owner: "Cloud FinOps", version: "v2",
    applicableConditions: ["Regional Dependency Capacity"], affectedPersonas: ["Release Governance"],
    history: [{ version: "v2", value: "250000", effectiveDate: "2026-03-01" }, { version: "v1", value: "100000", effectiveDate: "2024-11-01" }],
  },
];

/* ------------------------------------------------------------- 23. versions -- */

const baseDims = {
  intent: 92, state: 90, scope: 84, evidence: 78, enterprise: 90, assumptions: 82, execution: 88, outcome: 90,
};

export const seedVersions: CognitiveReadinessAssessmentVersion[] = [
  {
    id: "CRA 7001 v1", assessment: "CRA 7001", version: 1, label: "Initial Intake Assessment",
    timestamp: "2026-08-06 16:40", intakePackageVersion: "v3",
    personaScope: personaStates.slice(0, 5).map((p) => p.persona),
    conditionSet: conditionStates.slice(0, 5).map((c) => c.condition),
    evidenceCoverage: 74, dependencyCoverage: 82,
    dimensionScores: { ...baseDims, evidence: 70, execution: 74 },
    gateStates: { "required-context": "Passed", "material-impact": "Passed with Warning", evidence: "Needs Evidence", "execution-safety": "Passed with Warning" },
    score: 78, state: "Evidence Required", openFindings: 9, createdBy: "Cognitive Fabric", reason: "Initial assessment from Intake Package v3",
  },
  {
    id: "CRA 7001 v2", assessment: "CRA 7001", version: 2, label: "After Idempotency Test Added",
    timestamp: "2026-08-07 09:05", intakePackageVersion: "v3",
    personaScope: personaStates.slice(0, 5).map((p) => p.persona),
    conditionSet: conditionStates.slice(0, 6).map((c) => c.condition),
    evidenceCoverage: 80, dependencyCoverage: 84,
    dimensionScores: { ...baseDims, evidence: 76, execution: 80 },
    gateStates: { "required-context": "Passed", "material-impact": "Passed with Warning", evidence: "Passed with Warning", "execution-safety": "Passed with Warning" },
    score: 82, state: "Remediation Required", openFindings: 7, createdBy: "Payments Architecture", reason: "Idempotency Test Results attached",
  },
  {
    id: "CRA 7001 v3", assessment: "CRA 7001", version: 3, label: "After Rollback Threshold Defined",
    timestamp: "2026-08-07 09:52", intakePackageVersion: "v3",
    personaScope: personaStates.map((p) => p.persona),
    conditionSet: conditionStates.slice(0, 6).map((c) => c.condition),
    evidenceCoverage: 84, dependencyCoverage: 86,
    dimensionScores: { ...baseDims, execution: 88 },
    gateStates: { "required-context": "Passed", "material-impact": "Passed with Warning", evidence: "Passed with Warning", "execution-safety": "Passed" },
    score: 86, state: "Conditionally Ready", openFindings: 5, createdBy: "SRE Architecture", reason: "Rollback trigger and threshold defined",
  },
  {
    id: "CRA 7001 v4", assessment: "CRA 7001", version: 4, label: "After Fraud Analysis Added",
    timestamp: "2026-08-07 10:22", intakePackageVersion: "v3",
    personaScope: personaStates.map((p) => p.persona),
    conditionSet: conditionStates.map((c) => c.condition),
    evidenceCoverage: 93, dependencyCoverage: 90,
    dimensionScores: { ...baseDims, evidence: 92, scope: 90, assumptions: 88 },
    gateStates: { "required-context": "Passed", "material-impact": "Passed", evidence: "Passed", "execution-safety": "Passed" },
    score: 92, state: "Ready", openFindings: 2, createdBy: "Risk Technology", reason: "Fraud Loss Analysis attached",
  },
];

/* --------------------------------------------------------- 32. seed activity -- */

export const seedActivity: CognitiveReadinessActivity[] = [
  { id: "ACT 01", time: "10:22 AM", category: "Readiness Changed", entry: "Checkout Retry assessment changed to Conditionally Ready" },
  { id: "ACT 02", time: "10:18 AM", category: "Evidence Requested", entry: "Fraud Loss Analysis requested" },
  { id: "ACT 03", time: "10:14 AM", category: "Dependency Validation Required", entry: "Identity Services dependency warning acknowledged" },
  { id: "ACT 04", time: "10:09 AM", category: "Clarification Received", entry: "Traffic exposure clarified at 15%" },
  { id: "ACT 05", time: "10:06 AM", category: "Readiness Changed", entry: "Joint approval condition activated" },
  { id: "ACT 06", time: "10:03 AM", category: "Evidence Added", entry: "Rollback threshold validated" },
  { id: "ACT 07", time: "9:58 AM", category: "Persona Scope Changed", entry: "Release Governance Persona marked Ready" },
  { id: "ACT 08", time: "9:52 AM", category: "Assessment Completed", entry: "CRA 7001 version 3 created" },
];

export const notificationCategories = [
  "Assessment Started", "Assessment Completed", "Blocking Gap Detected", "Evidence Requested",
  "Evidence Added", "Clarification Requested", "Clarification Received", "Dependency Validation Required",
  "Persona Scope Changed", "Policy Binding Required", "Contradiction Detected", "Assumption Accepted",
  "Exception Requested", "Exception Approved", "Override Requested", "Reassessment Required",
  "Readiness Changed", "Ready for Persona Impact", "Routed to Persona Impact", "Historical Integrity Alert",
] as const;

export const seedNotifications: CognitiveReadinessNotification[] = [
  { id: "NTF 01", category: "Blocking Gap Detected", title: "Rollback path undefined on CRA 7003", detail: "Execution Safety Gate failed for Regional Token Vault Migration.", severity: "Critical", time: "08:55 AM", read: false, acknowledged: false },
  { id: "NTF 02", category: "Evidence Requested", title: "Fraud Loss Analysis requested", detail: "Requested from Risk Technology, due 2026-08-14.", severity: "High", time: "10:18 AM", read: false, acknowledged: false },
  { id: "NTF 03", category: "Dependency Validation Required", title: "Regional Token Vault confidence 78%", detail: "Validation required before dependency readiness can resolve.", severity: "High", time: "09:44 AM", read: false, acknowledged: false },
  { id: "NTF 04", category: "Policy Binding Required", title: "risk.fraud.materiality unbound", detail: "Bind an authoritative value to resolve Fraud Loss Materiality.", severity: "Medium", time: "09:12 AM", read: true, acknowledged: false },
  { id: "NTF 05", category: "Contradiction Detected", title: "Phase 2 exposure conflict", detail: "Design Document 15% versus Rollout Plan 25%.", severity: "Medium", time: "09:02 AM", read: true, acknowledged: false },
  { id: "NTF 06", category: "Readiness Changed", title: "CRA 7001 moved to Conditionally Ready", detail: "Readiness recalculated after rollback threshold validation.", severity: "Low", time: "10:22 AM", read: true, acknowledged: true },
];

/* ------------------------------------------------------ 4/6/7 dialog options -- */

export const clarificationTopics = [
  "Intent", "Scope", "Current State", "Proposed State", "Dependency", "Assumption", "Rollout",
  "Rollback", "Expected Outcome", "Ownership", "Policy Applicability", "Other",
];
export const clarificationAssignees = [
  "Work Owner", "Technical Owner", "Dependency Owner", "Business Owner", "Persona Owner", "Policy Owner",
];
export const clarificationResponseTypes = [
  "Text Answer", "Structured Value", "Owner Confirmation", "Artifact", "Evidence", "Threshold", "Approval",
];
export const clarificationImpacts = [
  "Blocking", "Can Proceed with Uncertainty", "Persona Limited", "Evidence Required",
];
export const evidenceTypes = [
  "Architecture", "Technical Validation", "Dependency Validation", "Load Test", "Security Review",
  "Compliance Evidence", "Financial Analysis", "Customer Analysis", "Fraud Analysis",
  "Operational Readiness", "Rollback Validation", "Policy Evidence", "Prior Outcome Evidence",
];
export const constraintCategories = [
  "Policy", "Technical", "Operational", "Financial", "Security", "Compliance", "Capacity", "Time",
  "Architecture", "Access", "Change Window",
];
export const conditionValidationStates = [
  "Resolved", "Unbound Policy Variable", "Stale", "Conflicting", "Applicability Review",
  "Evidence Required", "Not Applicable",
];
export const reviewTypes = [
  "Readiness Review", "Evidence Review", "Dependency Review", "Policy Review", "Exception Review", "Override Review",
];

/* --------------------------------------------------- 21. protected overrides -- */

export const protectedOverrideItems = [
  "Missing Work Identity",
  "Missing Proposed State",
  "Corrupted Context Package",
  "Access Validation Failure",
  "Historical Context Integrity Violation",
];

/* ------------------------------------------------------------ 33. export -- */

export const exportFormats = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot", "Readiness Package"];
export const exportScopes = [
  "Current Assessment", "Selected Assessments", "Readiness Dimensions", "Gates", "Evidence Gaps",
  "Dependencies", "Personas", "Conditions", "Assumptions", "Constraints", "Ambiguities",
  "Contradictions", "Exceptions", "Version Comparison", "Persona Impact Handoff Package", "Full Assessment",
];
export const exportOptions = [
  "Work Context", "Evidence", "Personas", "Conditions", "Dependencies", "Assumptions", "Constraints",
  "Rollout", "Rollback", "Expected Outcomes", "Findings", "Gate States", "Readiness Score", "History",
];

/* ------------------------------------------------------------ 35. scenarios -- */

export const demoScenarios = [
  "Healthy Assessment Portfolio", "New Intake Received", "Ready", "Conditionally Ready",
  "Evidence Required", "Clarification Required", "Remediation Required", "Blocked", "Rollback Missing",
  "Dependency Unknown", "Persona Context Missing", "Condition Binding Missing", "Assumption Accepted",
  "Ambiguity Detected", "Contradiction Detected", "Evidence Added", "Exception Requested",
  "Exception Approved", "Reassessment Complete", "Ready for Persona Impact", "Routed to Persona Impact",
  "Historical Integrity Warning", "Reset Demo Data",
] as const;
export type DemoScenario = (typeof demoScenarios)[number];

/* ------------------------------------------------------------ 34. demo story -- */

export interface DemoStoryStep {
  id: number;
  target: string;
  title: string;
  caption: string;
  presenterNotes: string;
}

export const demoStorySteps: DemoStoryStep[] = [
  { id: 1, target: "panel-queue", title: "Assessment Queue", caption: "Cognitive Intake tells us what work is being proposed. Cognitive Readiness asks whether we understand it well enough to evaluate its consequences.", presenterNotes: "Set the boundary between Intake and Readiness before showing any score." },
  { id: 2, target: "panel-workbench", title: "Checkout Retry Policy Update", caption: "The Fabric evaluates clarity, scope, dependencies, evidence, enterprise context, uncertainty, execution safety, and expected outcomes.", presenterNotes: "Open the workbench for CRA 7001." },
  { id: 3, target: "panel-workbench", title: "Eight Readiness Dimensions", caption: "Readiness is not one generic completeness percentage. Different dimensions can be strong or weak for different reasons.", presenterNotes: "Point at two dimensions that disagree." },
  { id: 4, target: "panel-gates", title: "Readiness Gates", caption: "A high average score cannot hide a critical missing context or safety requirement.", presenterNotes: "Gates are categorical, not averaged." },
  { id: 5, target: "panel-gates", title: "Remove Rollback Threshold", caption: "When rollback context disappears, the Execution Safety Gate fails and the assessment moves to Remediation Required.", presenterNotes: "The story mutates workbench state deterministically." },
  { id: 6, target: "panel-gates", title: "Restore Rollback Threshold", caption: "Once the context is restored, the gate recalculates immediately.", presenterNotes: "Emphasise instant recalculation." },
  { id: 7, target: "panel-persona-scope", title: "Fraud Engineering Persona Readiness", caption: "Persona readiness asks whether enough context exists to evaluate that team, not whether the team is positively or negatively impacted.", presenterNotes: "Readiness is not impact." },
  { id: 8, target: "panel-remediation", title: "Missing Fraud Loss Analysis", caption: "Missing evidence can affect one Persona without preventing every other Persona from being evaluated.", presenterNotes: "Show REM 8101." },
  { id: 9, target: "panel-remediation", title: "Add Fraud Loss Analysis", caption: "As evidence arrives, Persona readiness and overall readiness update without changing the original Intake history.", presenterNotes: "Intake history stays immutable." },
  { id: 10, target: "panel-assumption-register", title: "Assumption Register", caption: "Not every unknown must stop the process. Important assumptions can be explicitly carried forward as uncertainty rather than hidden.", presenterNotes: "Accepted does not mean true." },
  { id: 11, target: "panel-conditions", title: "Traffic Exposure 15%", caption: "As scope becomes more material, additional Business Conditions and governance requirements become necessary for readiness.", presenterNotes: "Joint approval condition activates." },
  { id: 12, target: "panel-handoff-package", title: "Persona Impact Handoff Package", caption: "The output is not an approval. It is a governed package containing the context, uncertainty, evidence, conditions, and Personas needed for impact analysis.", presenterNotes: "Readiness is not approval." },
  { id: 13, target: "panel-handoff-package", title: "Proceed to Persona Impact Analysis", caption: "The next stage can now evaluate how the proposed work affects each relevant team using a complete and traceable context package.", presenterNotes: "Route with the package version preserved." },
];

/* ------------------------------------------------------- 26. handoff readiness -- */

export const handoffReadinessBaseline: { area: string; value: number }[] = [
  { area: "Work Definition", value: 98 },
  { area: "Scope", value: 94 },
  { area: "Dependencies", value: 87 },
  { area: "Persona Context", value: 94 },
  { area: "Business Conditions", value: 94 },
  { area: "Evidence", value: 84 },
  { area: "Assumptions Explicit", value: 100 },
  { area: "Execution Context", value: 88 },
  { area: "Outcome Definition", value: 90 },
];

export const observationRequirements = [
  "Checkout completion rate by transaction class",
  "Duplicate authorization rate over five minute windows",
  "Fraud decision latency P95",
  "Regional token vault saturation",
];

/* --------------------------------------------------------- convenience seeds -- */

export const seedPersonaScope = Object.fromEntries(
  personaStates.map((p) => [p.persona, { included: true, primary: p.candidateMatch === "Primary" }]),
) as Record<string, { included: boolean; primary: boolean }>;

export const additionalPersonaCandidates = [
  "Customer Support Operations", "Data Platform Engineering", "Merchant Experience", "Finance Operations",
];

export const seedAssumptionStates = Object.fromEntries(
  assumptions.map((a) => [a.id, a.validationState]),
) as Record<string, string>;

export const seedConstraintStates = Object.fromEntries(
  constraints.map((c) => [c.id, c.status]),
) as Record<string, string>;

export const seedConditionStates = Object.fromEntries(
  conditionStates.map((c) => [c.condition, c.status]),
) as Record<string, string>;

export const seedDependencyStates = Object.fromEntries(
  dependencyStates.map((d) => [d.dependency, { status: d.status, confidence: d.confidence }]),
) as Record<string, { status: string; confidence: number }>;

export const seedAmbiguityStates = Object.fromEntries(
  ambiguities.map((a) => [a.id, { status: a.status, interpretation: "", confidence: "" }]),
) as Record<string, { status: string; interpretation: string; confidence: string }>;
