/**
 * Cognitive Intake — Prompt 2 operational domain.
 *
 * Extended models (jobs, clarifications, package versions, routing, rule
 * activations, evidence requests, notifications) plus the pure deterministic
 * logic those workflows depend on. Everything here is synthetic and side-effect
 * free so it can be unit tested without rendering the page.
 */

import type {
  CognitiveIntake, CognitiveIntakeContextMatch, CognitiveIntakeEvidence,
  CognitiveIntakeGap, CognitiveIntakePersonaCandidate, CognitiveIntakeRelatedWork,
} from "./data";
import { contextMatches, evidenceItems, gaps, intakes, personaCandidates, relatedWork } from "./data";

/* -------------------------------------------------------------- new models -- */

export type ClarificationResponseType =
  | "Answer" | "Evidence" | "Owner Confirmation" | "Scope Confirmation"
  | "Metric" | "Approval" | "Dependency Confirmation";

export interface CognitiveIntakeClarification {
  id: string;
  intakeId: string;
  gapId: string;
  question: string;
  assignedTo: string;
  responseType: ClarificationResponseType;
  status: "Requested" | "Responded" | "Closed" | "Overdue";
  requestedAt: string;
  dueAt: string;
  respondedAt: string | null;
  response: string | null;
  evidenceIds: string[];
}

export interface CognitiveIntakePackageVersion {
  id: string;
  intakeId: string;
  version: number;
  previousVersionId: string | null;
  contextRecordIds: string[];
  personaCandidateIds: string[];
  conditionIds: string[];
  evidenceIds: string[];
  missingEvidence: string[];
  openQuestions: string[];
  contextConfidence: number;
  packageCompleteness: number;
  changeReason: string;
  createdBy: string;
  createdAt: string;
}

export interface CognitiveIntakeJob {
  id: string;
  intakeIds: string[];
  intakeTitle: string;
  workType: string;
  status: "Running" | "Warning" | "Paused" | "Completed" | "Failed";
  currentStageId: string;
  contextRecordCount: number;
  personaCandidateCount: number;
  conditionCount: number;
  evidenceCoverage: number;
  gapCount: number;
  startedAt: string;
  elapsedTime: string;
  estimatedCompletion: string;
  owner: string;
  warningCount: number;
  configurationVersion: string;
}

export interface CognitiveIntakeRouting {
  id: string;
  intakeId: string;
  packageVersionId: string;
  destination: string;
  validationStatus: "Passed" | "Passed with Warnings" | "Blocked";
  blockingIssues: string[];
  warnings: string[];
  routedBy: string;
  routedAt: string;
  readinessAssessmentId: string;
  status: string;
}

export interface CognitiveIntakeRuleActivation {
  id: string;
  intakeId: string;
  ruleType: "Traffic Exposure" | "Quarter End Timing" | "Rollback Threshold" | "Idempotency Evidence" | "Fraud Analysis";
  triggerField: string;
  previousValue: string;
  currentValue: string;
  conditionId: string | null;
  personaIds: string[];
  governanceRequirement: string;
  activatedAt: string;
  status: "Active" | "Not Triggered" | "Resolved";
  reviewers: string[];
  gapId: string | null;
  detail: string;
}

export interface CognitiveIntakeEvidenceRequest {
  id: string;
  intakeId: string;
  gapId: string;
  evidenceType: string;
  requestedFrom: string;
  reason: string;
  requiredForNextStage: boolean;
  status: "Requested" | "Received" | "Overdue";
  requestedAt: string;
  dueAt: string;
  completedAt: string | null;
  evidenceId: string | null;
}

export interface CognitiveIntakeNotification {
  id: string;
  intakeId: string;
  notificationType: string;
  title: string;
  description: string;
  severity: "Info" | "Warning" | "Critical";
  owner: string;
  status: "Unread" | "Read" | "Acknowledged";
  createdAt: string;
}

export type IntakeOperationalState =
  | "Loading" | "Empty" | "Error" | "New" | "Analyzing" | "Needs Attention"
  | "Needs Clarification" | "Awaiting Evidence" | "Context Refreshing"
  | "Package Complete" | "Blocked" | "Routing" | "Routed to Readiness"
  | "Withdrawn" | "Paused";

/* ---------------------------------------------------------------- id helper */

let seq = 0;
export const nextId = (prefix: string) => `${prefix} ${9000 + ++seq}`;
export const nowLabel = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
export const isoNow = () => new Date().toISOString();

/* ------------------------------------------------------------- active jobs -- */

export const seedJobs: CognitiveIntakeJob[] = [
  {
    id: "CIJ 8101", intakeIds: ["INT 7001"], intakeTitle: "Checkout Retry Policy Update",
    workType: "Configuration Change", status: "Warning", currentStageId: "evidence",
    contextRecordCount: 42, personaCandidateCount: 6, conditionCount: 18, evidenceCoverage: 82,
    gapCount: 4, startedAt: "09:58", elapsedTime: "24 m 12 s", estimatedCompletion: "10:31",
    owner: "Evidence Governance", warningCount: 3, configurationVersion: "cfg-v14",
  },
  {
    id: "CIJ 8102", intakeIds: ["INT 7002"], intakeTitle: "Identity Token Cache Optimization",
    workType: "Performance Change", status: "Running", currentStageId: "package",
    contextRecordCount: 31, personaCandidateCount: 4, conditionCount: 12, evidenceCoverage: 96,
    gapCount: 0, startedAt: "10:04", elapsedTime: "18 m 40 s", estimatedCompletion: "10:26",
    owner: "Intake Operations", warningCount: 0, configurationVersion: "cfg-v14",
  },
  {
    id: "CIJ 8103", intakeIds: ["INT 7004"], intakeTitle: "Regional Token Vault Migration",
    workType: "Architecture Change", status: "Warning", currentStageId: "entities",
    contextRecordCount: 58, personaCandidateCount: 7, conditionCount: 22, evidenceCoverage: 76,
    gapCount: 6, startedAt: "09:41", elapsedTime: "41 m 05 s", estimatedCompletion: "10:48",
    owner: "Entity Resolution", warningCount: 5, configurationVersion: "cfg-v14",
  },
  {
    id: "CIJ 8104", intakeIds: ["INT 7006"], intakeTitle: "Quarter End Release Exception",
    workType: "Governance Exception", status: "Running", currentStageId: "context",
    contextRecordCount: 36, personaCandidateCount: 8, conditionCount: 16, evidenceCoverage: 88,
    gapCount: 2, startedAt: "10:12", elapsedTime: "10 m 22 s", estimatedCompletion: "10:39",
    owner: "Memory Services", warningCount: 1, configurationVersion: "cfg-v14",
  },
];

export const jobStageLog = (job: CognitiveIntakeJob) => [
  { at: job.startedAt, stage: "Receive Incoming Work", state: "Completed", detail: "Work item accepted from governed channel" },
  { at: job.startedAt, stage: "Preserve Original Submission", state: "Completed", detail: "Immutable submission stored with content hash" },
  { at: job.startedAt, stage: "Classify Work Type", state: "Completed", detail: `Classified as ${job.workType}` },
  { at: job.startedAt, stage: "Decompose Proposed Change", state: "Completed", detail: "Change elements extracted" },
  { at: job.startedAt, stage: "Resolve Enterprise Entities", state: job.currentStageId === "entities" ? "Running" : "Completed", detail: "Canonical entity mapping" },
  { at: job.startedAt, stage: "Retrieve Enterprise Context", state: job.currentStageId === "context" ? "Running" : "Completed", detail: `${job.contextRecordCount} memory records retrieved` },
  { at: job.startedAt, stage: "Identify Candidate Personas", state: "Completed", detail: `${job.personaCandidateCount} candidate Team Personas` },
  { at: job.startedAt, stage: "Identify Applicable Conditions", state: "Completed", detail: `${job.conditionCount} Business Conditions matched` },
  { at: job.startedAt, stage: "Evaluate Evidence & Gaps", state: job.currentStageId === "evidence" ? "Running" : "Pending", detail: `${job.evidenceCoverage}% evidence coverage · ${job.gapCount} gaps` },
  { at: job.startedAt, stage: "Build Intake Package", state: job.currentStageId === "package" ? "Running" : "Pending", detail: "Assemble structured Intake Package" },
  { at: job.startedAt, stage: "Route to Cognitive Readiness", state: "Pending", detail: "Awaiting complete package" },
];

/* -------------------------------------------------------- import sources -- */

export interface ImportSourceRecord {
  id: string;
  source: string;
  sourceId: string;
  title: string;
  owner: string;
  timestamp: string;
  status: string;
  attachments: string[];
  accessClassification: "Internal" | "Confidential" | "Restricted";
  workType: string;
  team: string;
  description: string;
  missingFields: string[];
}

export const importSources = [
  "Jira", "ServiceNow", "Azure DevOps", "GitHub", "Architecture Review",
  "Change Management Record", "Incident Record", "Policy Request",
];

export const importRecords: ImportSourceRecord[] = [
  { id: "IMP 01", source: "Jira", sourceId: "PAY-4821", title: "Increase settlement batch window", owner: "Nina Alvarez", timestamp: "2026-08-03 08:41", status: "In Progress", attachments: ["batch-design.pdf"], accessClassification: "Internal", workType: "Configuration Change", team: "Payments Platform", description: "Extend the settlement batch window to reduce failed settlement retries.", missingFields: ["Rollback Plan", "Success Metrics"] },
  { id: "IMP 02", source: "Jira", sourceId: "IDN-2290", title: "Token refresh interval tuning", owner: "Owen Park", timestamp: "2026-08-04 11:02", status: "Ready for Review", attachments: ["latency-analysis.xlsx"], accessClassification: "Internal", workType: "Performance Change", team: "Identity Engineering", description: "Reduce token refresh interval for high volume sessions.", missingFields: ["Technical Owner"] },
  { id: "IMP 03", source: "ServiceNow", sourceId: "CHG 88301", title: "Fraud rule threshold update", owner: "Ravi Chandrasekar", timestamp: "2026-08-05 09:18", status: "Scheduled", attachments: ["fraud-threshold-review.docx", "risk-signoff.pdf"], accessClassification: "Confidential", workType: "Policy Change", team: "Fraud Engineering", description: "Adjust fraud scoring thresholds for card-not-present transactions.", missingFields: ["Traffic Exposure"] },
  { id: "IMP 04", source: "Azure DevOps", sourceId: "AB#7712", title: "Checkout resiliency circuit breaker", owner: "Priya Raman", timestamp: "2026-08-02 15:33", status: "Active", attachments: [], accessClassification: "Internal", workType: "Reliability Improvement", team: "Checkout Engineering", description: "Add a circuit breaker in front of the payment authorization call.", missingFields: ["Evidence", "Rollback Threshold"] },
  { id: "IMP 05", source: "GitHub", sourceId: "PR 9142", title: "Retry orchestrator config schema v3", owner: "Marcus Lee", timestamp: "2026-08-05 17:26", status: "Open", attachments: ["schema-diff.md"], accessClassification: "Internal", workType: "Configuration Change", team: "Checkout Engineering", description: "Introduce a versioned retry configuration schema.", missingFields: ["Business Unit"] },
  { id: "IMP 06", source: "Architecture Review", sourceId: "RFC 2119", title: "Regional data residency topology", owner: "Helena Voss", timestamp: "2026-07-31 10:05", status: "Under Review", attachments: ["topology-v2.drawio", "residency-matrix.xlsx"], accessClassification: "Restricted", workType: "Architecture Change", team: "Platform Engineering", description: "Introduce regional token vault topology for EMEA residency.", missingFields: ["Work Owner", "Rollback Plan"] },
  { id: "IMP 07", source: "Incident Record", sourceId: "INC 55210", title: "Duplicate authorization remediation", owner: "Site Reliability Engineering", timestamp: "2026-07-29 22:14", status: "Resolved", attachments: ["postmortem.md"], accessClassification: "Internal", workType: "Incident Remediation", team: "Site Reliability Engineering", description: "Remediation follow-up from duplicate authorization incident.", missingFields: ["Target Date"] },
  { id: "IMP 08", source: "Policy Request", sourceId: "POL 3080", title: "Quarter end deployment exception policy", owner: "Release Governance", timestamp: "2026-08-01 13:47", status: "Draft", attachments: ["policy-draft.docx"], accessClassification: "Confidential", workType: "Governance Exception", team: "Release Engineering", description: "Define a repeatable exception path for quarter end deployments.", missingFields: ["Executive Sponsor"] },
];

/* ------------------------------------------------------- clarification seeds */

export const clarificationOwners = [
  "Work Owner", "Technical Owner", "Dependency Owner", "Security Reviewer", "Governance Reviewer",
];

export const clarificationResponseTypes: ClarificationResponseType[] = [
  "Answer", "Evidence", "Owner Confirmation", "Scope Confirmation", "Metric", "Approval", "Dependency Confirmation",
];

/** Deterministic synthetic responses keyed by the gap they answer. */
export const syntheticResponses: Record<string, {
  question: string; response: string; results: string[];
  effect: "traffic-15" | "rollback-threshold" | "idempotency-evidence" | "fraud-evidence" | "quarter-end" | "generic";
}> = {
  "GAP 9104": {
    question: "What is the maximum planned traffic exposure?",
    response: "15 percent during Phase 2 before broader expansion.",
    results: [
      "Activate retry approval condition above 10 percent",
      "Add Payments Reliability reviewer",
      "Add Fraud Engineering reviewer",
    ],
    effect: "traffic-15",
  },
  "GAP 9102": {
    question: "What duplicate transaction threshold triggers rollback?",
    response: "Rollback if duplicate authorization rate exceeds 0.2 percent for five minutes.",
    results: ["Close Rollback Threshold gap", "Add structured rollback threshold to Change Model"],
    effect: "rollback-threshold",
  },
  "GAP 9101": {
    question: "Provide idempotency validation.",
    response: "Synthetic idempotency test report attached (12,480 replayed authorizations, 0 duplicates).",
    results: ["Close Evidence Gap", "Increase Evidence Coverage", "Increase Package Completeness"],
    effect: "idempotency-evidence",
  },
  "GAP 9103": {
    question: "Provide fraud loss analysis.",
    response: "Fraud loss exposure modelled at 0.03 percent incremental loss for a third retry.",
    results: ["Close Fraud Engineering evidence requirement", "Update Intake Package"],
    effect: "fraud-evidence",
  },
  "GAP 9105": {
    question: "Confirm quarter end deployment applicability.",
    response: "Target deployment falls in the final three business days of the financial quarter.",
    results: ["Activate quarter end restriction", "Add Release Governance persona", "Add exception requirement"],
    effect: "quarter-end",
  },
};

/* ------------------------------------------------------- entity remediation */

export interface EntityCandidate {
  id: string;
  detected: string;
  candidateName: string;
  entityType: string;
  owner: string;
  relationship: string;
  confidence: number;
  evidence: string;
}

export const entityCandidates: EntityCandidate[] = [
  { id: "ECAND 01", detected: "token vault (EU)", candidateName: "Regional Token Vault Service", entityType: "Service", owner: "Platform Engineering", relationship: "Downstream dependency", confidence: 88, evidence: "Service registry, 14 dependency edges" },
  { id: "ECAND 02", detected: "token vault (EU)", candidateName: "Legacy Token Vault", entityType: "Service", owner: "Identity Engineering", relationship: "Deprecated predecessor", confidence: 54, evidence: "Decommission record DEC 3901" },
  { id: "ECAND 03", detected: "token vault (EU)", candidateName: "Global Token Vault Program", entityType: "Program", owner: "Platform Engineering", relationship: "Parent program", confidence: 41, evidence: "Program charter PRG 220" },
  { id: "ECAND 04", detected: "transient decline set", candidateName: "Payment Decline Taxonomy", entityType: "Data Domain", owner: "Payments Platform", relationship: "Classification source", confidence: 76, evidence: "Data catalog DAT 04" },
  { id: "ECAND 05", detected: "transient decline set", candidateName: "Issuer Response Code Registry", entityType: "Data Domain", owner: "Payments Platform", relationship: "Related registry", confidence: 62, evidence: "Data catalog DAT 09" },
];

export const entityRemediationActions = [
  "Select Canonical Entity", "Create Unresolved Entity Placeholder",
  "Request Owner Confirmation", "Mark External", "Exclude",
];

/* ------------------------------------------------------------ package history */

export const seedPackageVersions: CognitiveIntakePackageVersion[] = [
  {
    id: "PKGV 1", intakeId: "INT 7001", version: 1, previousVersionId: null,
    contextRecordIds: [], personaCandidateIds: [], conditionIds: [], evidenceIds: ["EV 01", "EV 02"],
    missingEvidence: ["Idempotency Test Results", "Fraud Loss Analysis", "Rollback Threshold", "Regional Dependency Health"],
    openQuestions: ["Will rollout exceed 10% traffic?", "What duplicate transaction threshold triggers rollback?"],
    contextConfidence: 0, packageCompleteness: 41,
    changeReason: "Original Intake", createdBy: "Marcus Lee", createdAt: "2026-07-28 09:12",
  },
  {
    id: "PKGV 2", intakeId: "INT 7001", version: 2, previousVersionId: "PKGV 1",
    contextRecordIds: contextMatches.filter((c) => c.intakeId === "INT 7001").map((c) => c.id),
    personaCandidateIds: personaCandidates.map((p) => p.id),
    conditionIds: contextMatches.filter((c) => c.memoryType === "Business Condition").map((c) => c.memoryRecordId),
    evidenceIds: ["EV 01", "EV 02", "EV 03", "EV 04"],
    missingEvidence: ["Idempotency Test Results", "Fraud Loss Analysis", "Rollback Threshold", "Regional Dependency Health"],
    openQuestions: ["Will rollout exceed 10% traffic?", "What duplicate transaction threshold triggers rollback?", "Will deployment occur during quarter end restricted period?"],
    contextConfidence: 94, packageCompleteness: 82,
    changeReason: "After Enterprise Context Retrieval", createdBy: "Memory Services", createdAt: "2026-07-28 09:21",
  },
];

/* ------------------------------------------------------------- notifications */

export const seedNotifications: CognitiveIntakeNotification[] = [
  { id: "NTF 01", intakeId: "INT 7001", notificationType: "Clarification Required", title: "Rollback threshold clarification outstanding", description: "GAP 9102 is required before the Intake Package can be completed.", severity: "Warning", owner: "Checkout Engineering", status: "Unread", createdAt: "10:06" },
  { id: "NTF 02", intakeId: "INT 7001", notificationType: "Evidence Requested", title: "Idempotency evidence requested", description: "Requested from Payments Platform, due 2026-08-11.", severity: "Warning", owner: "Payments Platform", status: "Unread", createdAt: "10:06" },
  { id: "NTF 03", intakeId: "INT 7004", notificationType: "Intake Blocked", title: "Unresolved entities block context retrieval", description: "3 vault identifiers cannot be resolved to canonical entities.", severity: "Critical", owner: "Platform Engineering", status: "Unread", createdAt: "10:14" },
  { id: "NTF 04", intakeId: "INT 7002", notificationType: "Package Updated", title: "Identity Token Cache package complete", description: "Package completeness reached 95 percent.", severity: "Info", owner: "Intake Operations", status: "Read", createdAt: "10:18" },
  { id: "NTF 05", intakeId: "INT 7001", notificationType: "Related Work Detected", title: "Prior retry outcome linked", description: "OUT 3284 measured a prior retry increase on the same change object.", severity: "Info", owner: "Memory Services", status: "Read", createdAt: "10:09" },
];

export const notificationTypes = [
  "New Work Submitted", "Intake Started", "Intake Completed", "Clarification Required",
  "Clarification Response Received", "Evidence Requested", "Evidence Added",
  "Persona Candidate Added", "Related Work Detected", "Context Retrieval Warning",
  "Enterprise Rule Activated", "Package Updated", "Intake Routed to Readiness", "Intake Blocked",
];

/* ---------------------------------------------------------- recent activity */

export const seedRecentActivity = [
  { id: "RA 01", timestamp: "10:22", intakeId: "INT 7001", action: "Personas Identified", description: "Checkout Retry Policy Update identified 6 candidate Team Personas", teamId: "Checkout Engineering", result: "Success" as const, owner: "Persona Services", auditId: "AUD 72001" },
  { id: "RA 02", timestamp: "10:18", intakeId: "INT 7002", action: "Package Complete", description: "Identity Token Cache Optimization package completed", teamId: "Identity Engineering", result: "Success" as const, owner: "Intake Operations", auditId: "AUD 72002" },
  { id: "RA 03", timestamp: "10:14", intakeId: "INT 7004", action: "Entities Unresolved", description: "Regional Token Vault Migration flagged 3 unresolved entities", teamId: "Platform Engineering", result: "Blocked" as const, owner: "Entity Resolution", auditId: "AUD 72003" },
  { id: "RA 04", timestamp: "10:09", intakeId: "INT 7001", action: "Related Work Linked", description: "Prior retry outcome linked to INT 7001", teamId: "Payments Platform", result: "Success" as const, owner: "Memory Services", auditId: "AUD 72004" },
  { id: "RA 05", timestamp: "10:06", intakeId: "INT 7001", action: "Evidence Requested", description: "Idempotency evidence requested from Payments Platform", teamId: "Payments Platform", result: "Warning" as const, owner: "Evidence Governance", auditId: "AUD 72005" },
  { id: "RA 06", timestamp: "10:03", intakeId: "INT 7006", action: "Persona Matched", description: "Quarter End Release Exception matched Release Governance Persona", teamId: "Release Engineering", result: "Success" as const, owner: "Persona Services", auditId: "AUD 72006" },
  { id: "RA 07", timestamp: "09:58", intakeId: "INT 7001", action: "Condition Added", description: "Fraud Decision timeout condition added to INT 7001", teamId: "Fraud Engineering", result: "Success" as const, owner: "Condition Services", auditId: "AUD 72007" },
  { id: "RA 08", timestamp: "09:52", intakeId: "INT 7007", action: "Work Received", description: "Customer Support workflow update entered Cognitive Intake", teamId: "Customer Support Operations", result: "Success" as const, owner: "Intake Operations", auditId: "AUD 72008" },
];

/* --------------------------------------------------------- dynamic rules --- */

export interface RuleInput {
  trafficExposure: number;
  deploymentTiming: "Standard window" | "Quarter end window";
  rollbackThresholdDefined: boolean;
  idempotencyEvidenceProvided: boolean;
  fraudAnalysisProvided: boolean;
}

export interface RuleOutcome {
  ruleType: CognitiveIntakeRuleActivation["ruleType"];
  triggered: boolean;
  conditionId: string | null;
  governanceRequirement: string;
  personaIds: string[];
  reviewers: string[];
  gapId: string | null;
  detail: string;
}

/**
 * Deterministic enterprise rule evaluation. Cognitive Intake surfaces which
 * governed rules become applicable — it never issues a readiness or impact
 * decision, and it never lowers a risk severity on its own.
 */
export const evaluateRules = (i: RuleInput): RuleOutcome[] => [
  {
    ruleType: "Traffic Exposure",
    triggered: i.trafficExposure > 10,
    conditionId: "BC 1104",
    governanceRequirement:
      "Retry policy changes affecting more than 10 percent of checkout traffic require approval from Payments Reliability and Fraud Engineering.",
    personaIds: i.trafficExposure > 10 ? ["PER 2201", "PER 2203"] : [],
    reviewers: i.trafficExposure > 10 ? ["Payments Reliability", "Fraud Engineering"] : [],
    gapId: i.trafficExposure > 10 ? "GAP 9104" : null,
    detail: `Planned traffic exposure ${i.trafficExposure} percent`,
  },
  {
    ruleType: "Quarter End Timing",
    triggered: i.deploymentTiming === "Quarter end window",
    conditionId: "BC 1106",
    governanceRequirement:
      "No Payments API deployment during final three business days of a financial quarter.",
    personaIds: i.deploymentTiming === "Quarter end window" ? ["PER 2205"] : [],
    reviewers: i.deploymentTiming === "Quarter end window" ? ["Release Governance"] : [],
    gapId: i.deploymentTiming === "Quarter end window" ? "GAP 9105" : null,
    detail: `Deployment timing ${i.deploymentTiming}`,
  },
  {
    ruleType: "Rollback Threshold",
    triggered: !i.rollbackThresholdDefined,
    conditionId: null,
    governanceRequirement: "A numeric rollback threshold is required before automated rollback can be relied upon.",
    personaIds: [],
    reviewers: [],
    gapId: "GAP 9102",
    detail: i.rollbackThresholdDefined ? "Rollback threshold defined" : "Rollback threshold missing — critical gap",
  },
  {
    ruleType: "Idempotency Evidence",
    triggered: !i.idempotencyEvidenceProvided,
    conditionId: "BC 1105",
    governanceRequirement: "Payment retries must preserve idempotency. Validation evidence is required.",
    personaIds: ["PER 2201"],
    reviewers: [],
    gapId: "GAP 9101",
    detail: i.idempotencyEvidenceProvided
      ? "Idempotency evidence supplied — evidence gap closed, duplicate transaction risk severity unchanged pending downstream evaluation"
      : "Idempotency evidence missing — high evidence gap, duplicate transaction risk remains High",
  },
  {
    ruleType: "Fraud Analysis",
    triggered: !i.fraudAnalysisProvided,
    conditionId: "BC 1107",
    governanceRequirement: "Fraud loss exposure analysis is required for retry volume increases.",
    personaIds: ["PER 2203"],
    reviewers: [],
    gapId: "GAP 9103",
    detail: i.fraudAnalysisProvided ? "Fraud loss analysis supplied" : "Fraud Engineering evidence gap open",
  },
];

export const activatedRules = (i: RuleInput) => evaluateRules(i).filter((r) => r.triggered);

/* ---------------------------------------------------- routing validation --- */

export interface RoutingInput {
  workOwner: string;
  intent: string;
  proposedState: string;
  scope: string;
  resolvedEntityCount: number;
  contextRetrievalComplete: boolean;
  personaSearchComplete: boolean;
  conditionSearchComplete: boolean;
  evidenceMetadataCaptured: boolean;
  criticalMissingEvidenceIdentified: boolean;
  openQuestionsRecorded: boolean;
  accessValidationComplete: boolean;
  packageIntact: boolean;
  criticalGapCount: number;
  nonCriticalGapCount: number;
}

export interface RoutingValidation {
  status: "Passed" | "Passed with Warnings" | "Blocked";
  blockingIssues: string[];
  warnings: string[];
  canRoute: boolean;
}

/**
 * Routing validation only. This never computes Cognitive Readiness — it checks
 * that the Intake Package is structurally complete enough to be evaluated.
 */
export const validateRouting = (i: RoutingInput): RoutingValidation => {
  const blockingIssues: string[] = [];
  const warnings: string[] = [];

  if (!i.workOwner.trim()) blockingIssues.push("Work Owner is missing");
  if (!i.intent.trim()) blockingIssues.push("Intent is missing");
  if (!i.proposedState.trim()) blockingIssues.push("Proposed State is missing");
  if (!i.scope.trim()) blockingIssues.push("Primary scope is missing");
  if (i.resolvedEntityCount < 1) blockingIssues.push("No resolved affected enterprise entity");
  if (!i.contextRetrievalComplete) blockingIssues.push("Enterprise context retrieval did not complete");
  if (!i.accessValidationComplete) blockingIssues.push("Access validation did not complete");
  if (!i.packageIntact) blockingIssues.push("Intake Package is corrupted");

  if (!i.personaSearchComplete) warnings.push("Candidate Persona search is incomplete");
  if (!i.conditionSearchComplete) warnings.push("Applicable Condition search is incomplete");
  if (!i.evidenceMetadataCaptured) warnings.push("Evidence metadata is incomplete");
  if (!i.criticalMissingEvidenceIdentified) warnings.push("Critical missing evidence has not been explicitly identified");
  if (!i.openQuestionsRecorded) warnings.push("Open questions have not been explicitly recorded");
  if (i.criticalGapCount > 0) warnings.push(`${i.criticalGapCount} critical gap(s) recorded and carried forward`);
  if (i.nonCriticalGapCount > 0) warnings.push(`${i.nonCriticalGapCount} noncritical gap(s) remain unresolved`);

  const status: RoutingValidation["status"] = blockingIssues.length
    ? "Blocked" : warnings.length ? "Passed with Warnings" : "Passed";
  return { status, blockingIssues, warnings, canRoute: blockingIssues.length === 0 };
};

export const readinessRoute = "/enterprise-cognitive-fabric/evaluation/cognitive-readiness-assessment";

/* ------------------------------------------------------------ global search */

export interface SearchResult {
  id: string;
  resultType: string;
  title: string;
  team: string;
  workType: string;
  stage: string;
  status: string;
  contextMatch: string;
  evidenceCoverage: string;
  intakeId: string;
}

const searchCorpus = (): SearchResult[] => {
  const rows: SearchResult[] = [];
  intakes.forEach((i) => rows.push({
    id: i.id, resultType: "Intake Item", title: i.title, team: i.submittingTeamName,
    workType: i.workType, stage: i.currentStageId, status: i.status,
    contextMatch: `${i.contextMatchScore}%`, evidenceCoverage: `${i.evidenceCoverage}%`, intakeId: i.id,
  }));
  personaCandidates.forEach((p) => rows.push({
    id: p.id, resultType: "Persona", title: p.personaName, team: p.teamName, workType: "—",
    stage: "personas", status: p.selectionState, contextMatch: `${p.matchConfidence}%`, evidenceCoverage: "—", intakeId: p.intakeId,
  }));
  contextMatches.forEach((c) => rows.push({
    id: c.id, resultType: c.memoryType, title: c.title, team: "Enterprise Cognitive Memory",
    workType: "—", stage: "context", status: c.included ? "Included" : "Excluded",
    contextMatch: `${c.relevanceScore}%`, evidenceCoverage: "—", intakeId: c.intakeId,
  }));
  evidenceItems.forEach((e) => rows.push({
    id: e.id, resultType: "Evidence", title: e.name, team: e.owner, workType: e.evidenceType,
    stage: "evidence", status: e.status, contextMatch: "—",
    evidenceCoverage: e.provided ? "Provided" : "Missing", intakeId: e.intakeId,
  }));
  gaps.forEach((g) => rows.push({
    id: g.id, resultType: "Clarification Task", title: g.question, team: g.assignedTo,
    workType: g.gapType, stage: "evidence", status: g.status, contextMatch: "—", evidenceCoverage: "—", intakeId: g.intakeId,
  }));
  relatedWork.forEach((r) => rows.push({
    id: r.id, resultType: "Related Work", title: r.title, team: r.owner, workType: r.relatedRecordType,
    stage: "context", status: r.status, contextMatch: `${r.similarity}%`, evidenceCoverage: "—", intakeId: r.intakeId,
  }));
  return rows;
};

export const searchIndex = searchCorpus();

export const searchIntake = (query: string): SearchResult[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter((t) => t.length > 2);
  return searchIndex.filter((r) => {
    const hay = `${r.id} ${r.resultType} ${r.title} ${r.team} ${r.workType} ${r.status} ${r.intakeId}`.toLowerCase();
    return terms.length ? terms.some((t) => hay.includes(t)) : hay.includes(q);
  }).slice(0, 60);
};

export const searchExamples = [
  "Payment changes awaiting clarification",
  "Work affecting Identity Services",
  "Incoming work requiring Fraud Engineering",
  "Intakes missing rollback evidence",
  "Quarter end changes",
  "Retry related work",
  "Packages complete for readiness",
];

/* ------------------------------------------------------------------ export */

export const exportFormats = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot"] as const;
export type ExportFormat = (typeof exportFormats)[number];

export const exportScopes = [
  "Current Intake", "Selected Intakes", "Current Filtered View", "Packages Complete",
  "Needs Clarification", "Evidence Gaps", "Persona Candidate Summary", "Context Summary",
  "Related Work Summary", "Full Intake Package",
];

export const exportOptions = [
  "Original Submission Metadata", "Change Decomposition", "Entities", "Candidate Personas",
  "Business Conditions", "Dependencies", "Risks", "Assumptions", "Evidence", "Missing Evidence",
  "Prior Decisions", "Outcomes", "Learning", "Clarifications", "Package Versions", "History",
];

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (rows: Record<string, unknown>[]): string => {
  if (!rows.length) return "";
  const head = Object.keys(rows[0]);
  return [head.join(","), ...rows.map((r) => head.map((h) => csvCell(r[h])).join(","))].join("\n");
};

export const toYaml = (value: unknown, indent = 0): string => {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value.map((v) =>
      typeof v === "object" && v !== null
        ? `${pad}-\n${toYaml(v, indent + 1)}`
        : `${pad}- ${String(v)}`).join("\n");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      typeof v === "object" && v !== null
        ? `${pad}${k}:\n${toYaml(v, indent + 1)}`
        : `${pad}${k}: ${String(v)}`).join("\n");
  }
  return `${pad}${String(value)}`;
};

export const buildExportRows = (rows: CognitiveIntake[]) => rows.map((r) => ({
  intakeId: r.id, title: r.title, workType: r.workType, priority: r.priority, status: r.status,
  submittingTeam: r.submittingTeamName, workOwner: r.workOwner, technicalOwner: r.technicalOwner,
  businessUnit: r.businessUnit, sourceSystem: r.sourceSystem, sourceRecordId: r.sourceRecordId,
  accessClassification: r.accessClassification, contextMatch: r.contextMatchScore,
  evidenceCoverage: r.evidenceCoverage, packageCompleteness: r.packageCompleteness,
  conditionsMatched: r.conditionsMatched, missingItems: r.missingItems, submittedAt: r.submittedAt,
}));

/* -------------------------------------------------------------- demo story */

export interface StoryStep {
  id: number;
  title: string;
  caption: string;
  target: string;
  notes: string;
}

export const demoStorySteps: StoryStep[] = [
  { id: 1, title: "Governed entry point", target: "panel-kpis", caption: "Cognitive Intake gives every proposed change a consistent enterprise entry point before impact evaluation begins.", notes: "Point at Incoming Work and Intake Packages Complete. Package completeness is not a readiness score." },
  { id: 2, title: "Intake lifecycle", target: "panel-lifecycle", caption: "The Fabric classifies the work, decomposes what is changing, resolves enterprise entities, and retrieves relevant organizational memory.", notes: "Eleven governed stages, each with owners and SLA posture." },
  { id: 3, title: "Preserved original work", target: "panel-workbench", caption: "The original proposal remains preserved while the Fabric constructs a structured model of the proposed change.", notes: "Region 1 is immutable. Region 2 is the derived structure." },
  { id: 4, title: "Enterprise context", target: "panel-context-match", caption: "The proposal is connected to applicable business conditions, Team Personas, dependencies, prior decisions, observed outcomes, and organizational learning.", notes: "Context comes from Enterprise Cognitive Memory, not from the submitter." },
  { id: 5, title: "Candidate Team Personas", target: "panel-personas", caption: "The Fabric identifies which team perspectives may matter without yet making the final impact determination.", notes: "Candidates only. Persona Impact Analysis scores impact later." },
  { id: 6, title: "Prior decision and outcome", target: "panel-related", caption: "The enterprise does not have to rediscover what happened the last time similar work was attempted.", notes: "DEC 4812 and OUT 3284 carry the prior retry increase history." },
  { id: 7, title: "Evidence completeness", target: "panel-evidence", caption: "Cognitive Intake makes missing information explicit before downstream evaluators are asked to reason with incomplete context.", notes: "Missing evidence is a first class output, not a hidden defect." },
  { id: 8, title: "Traffic exposure crosses a threshold", target: "panel-workbench", caption: "As the proposal changes, the Fabric immediately discovers that the change now crosses a governed approval threshold.", notes: "Traffic exposure moves 5 percent to 15 percent. The >10 percent approval condition activates." },
  { id: 9, title: "Quarter end restriction", target: "panel-workbench", caption: "The same intake automatically discovers an additional Release Governance restriction because the proposed timing changed.", notes: "Deployment timing moves into the final three business days of the quarter." },
  { id: 10, title: "Evidence and clarification supplied", target: "panel-evidence", caption: "As missing evidence and clarification are supplied, the Intake Package becomes more complete without losing its original submission history.", notes: "Idempotency evidence added, rollback threshold clarified. Package version increments." },
  { id: 11, title: "Package completeness", target: "panel-completeness", caption: "Cognitive Intake does not make the final decision. It creates the governed context package required for the next evaluation stage.", notes: "Completeness measures structure, not readiness." },
  { id: 12, title: "Route to readiness", target: "panel-completeness", caption: "The structured Intake Package now moves into formal readiness evaluation before Persona Impact Analysis begins.", notes: "Routing validation only. Readiness scoring happens in the next module." },
];

/* ----------------------------------------------------------- demo scenarios */

export type ScenarioId =
  | "healthy" | "new-work" | "high-priority" | "missing-evidence" | "ambiguous-scope"
  | "missing-owner" | "unresolved-entity" | "high-persona-match" | "prior-decision"
  | "prior-outcome" | "approval-threshold" | "quarter-end" | "clarification-requested"
  | "clarification-received" | "evidence-added" | "context-refreshing" | "blocked"
  | "package-complete" | "routed" | "reset";

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  description: string;
  serviceState: string;
  intakeStatus: string;
  operationalState: IntakeOperationalState;
  trafficExposure?: number;
  deploymentTiming?: "Standard window" | "Quarter end window";
  addEvidenceIds?: string[];
  closeGapIds?: string[];
  activity: string;
  notification: { type: string; title: string; severity: "Info" | "Warning" | "Critical" };
}

export const demoScenarios: ScenarioDefinition[] = [
  { id: "healthy", label: "Healthy Intake Portfolio", description: "Balanced intake flow with no blocking issues.", serviceState: "Operational", intakeStatus: "Analyzing", operationalState: "Analyzing", trafficExposure: 5, deploymentTiming: "Standard window", activity: "Intake portfolio healthy across all stages", notification: { type: "Intake Completed", title: "Intake portfolio healthy", severity: "Info" } },
  { id: "new-work", label: "New Work Submitted", description: "A new work item entered governed intake.", serviceState: "Operational", intakeStatus: "New", operationalState: "New", activity: "New work item entered Cognitive Intake", notification: { type: "New Work Submitted", title: "New work submitted", severity: "Info" } },
  { id: "high-priority", label: "High Priority Change", description: "A critical priority change requires expedited intake.", serviceState: "Analyzing", intakeStatus: "Analyzing", operationalState: "Analyzing", activity: "Critical priority work escalated in intake queue", notification: { type: "Intake Started", title: "Critical priority intake started", severity: "Warning" } },
  { id: "missing-evidence", label: "Missing Evidence", description: "Required evidence is absent.", serviceState: "Needs Attention", intakeStatus: "Awaiting Evidence", operationalState: "Awaiting Evidence", activity: "Required evidence missing for Checkout Retry Policy Update", notification: { type: "Evidence Requested", title: "Required evidence missing", severity: "Warning" } },
  { id: "ambiguous-scope", label: "Ambiguous Scope", description: "Scope boundaries cannot be determined.", serviceState: "Needs Attention", intakeStatus: "Needs Clarification", operationalState: "Needs Clarification", activity: "Ambiguous scope detected — maximum traffic exposure unconfirmed", notification: { type: "Clarification Required", title: "Ambiguous scope", severity: "Warning" } },
  { id: "missing-owner", label: "Missing Owner", description: "No accountable owner assigned.", serviceState: "Needs Attention", intakeStatus: "Needs Clarification", operationalState: "Needs Clarification", activity: "Accountable owner missing on incoming work", notification: { type: "Clarification Required", title: "Missing accountable owner", severity: "Warning" } },
  { id: "unresolved-entity", label: "Unresolved Entity", description: "Detected values cannot be resolved to canonical entities.", serviceState: "Needs Attention", intakeStatus: "Blocked", operationalState: "Blocked", activity: "Unresolved enterprise entity blocks context retrieval", notification: { type: "Context Retrieval Warning", title: "Unresolved enterprise entity", severity: "Critical" } },
  { id: "high-persona-match", label: "High Persona Match", description: "Many Team Personas may care about this work.", serviceState: "Operational", intakeStatus: "Analyzing", operationalState: "Analyzing", activity: "Six candidate Team Personas identified", notification: { type: "Persona Candidate Added", title: "Candidate personas identified", severity: "Info" } },
  { id: "prior-decision", label: "Related Prior Decision Found", description: "A governed prior decision covers the same change object.", serviceState: "Operational", intakeStatus: "Analyzing", operationalState: "Analyzing", activity: "Prior decision DEC 4812 linked to the intake", notification: { type: "Related Work Detected", title: "Prior decision linked", severity: "Info" } },
  { id: "prior-outcome", label: "Prior Outcome Found", description: "A measured outcome from prior similar work is available.", serviceState: "Operational", intakeStatus: "Analyzing", operationalState: "Analyzing", activity: "Prior outcome OUT 3284 linked to the intake", notification: { type: "Related Work Detected", title: "Prior outcome linked", severity: "Info" } },
  { id: "approval-threshold", label: "Approval Threshold Triggered", description: "Traffic exposure exceeds the governed 10 percent threshold.", serviceState: "Needs Attention", intakeStatus: "Needs Clarification", operationalState: "Needs Clarification", trafficExposure: 15, activity: "Traffic exposure 15 percent activated the >10 percent approval condition", notification: { type: "Enterprise Rule Activated", title: "Approval threshold activated", severity: "Warning" } },
  { id: "quarter-end", label: "Quarter End Restriction Triggered", description: "Deployment timing falls inside the restricted window.", serviceState: "Needs Attention", intakeStatus: "Needs Clarification", operationalState: "Needs Clarification", deploymentTiming: "Quarter end window", activity: "Quarter end deployment restriction activated", notification: { type: "Enterprise Rule Activated", title: "Quarter end restriction activated", severity: "Warning" } },
  { id: "clarification-requested", label: "Clarification Requested", description: "Clarification tasks issued to accountable owners.", serviceState: "Needs Attention", intakeStatus: "Needs Clarification", operationalState: "Needs Clarification", activity: "Clarification requested from accountable owners", notification: { type: "Clarification Required", title: "Clarification requested", severity: "Warning" } },
  { id: "clarification-received", label: "Clarification Received", description: "Owners responded to outstanding clarification.", serviceState: "Operational", intakeStatus: "Analyzing", operationalState: "Analyzing", closeGapIds: ["GAP 9102"], activity: "Clarification response received and applied to the Intake Package", notification: { type: "Clarification Response Received", title: "Clarification response received", severity: "Info" } },
  { id: "evidence-added", label: "Evidence Added", description: "Missing evidence supplied and validated.", serviceState: "Operational", intakeStatus: "Analyzing", operationalState: "Analyzing", addEvidenceIds: ["EV 05"], closeGapIds: ["GAP 9101"], activity: "Idempotency test evidence added, evidence coverage recalculated", notification: { type: "Evidence Added", title: "Evidence added", severity: "Info" } },
  { id: "context-refreshing", label: "Context Refreshing", description: "Enterprise Cognitive Memory is being re-queried.", serviceState: "Analyzing", intakeStatus: "Context Refreshing", operationalState: "Context Refreshing", activity: "Enterprise context refresh in progress", notification: { type: "Package Updated", title: "Context refresh running", severity: "Info" } },
  { id: "blocked", label: "Intake Blocked", description: "A blocking condition prevents further intake progress.", serviceState: "Needs Attention", intakeStatus: "Blocked", operationalState: "Blocked", activity: "Intake blocked — access validation incomplete", notification: { type: "Intake Blocked", title: "Intake blocked", severity: "Critical" } },
  { id: "package-complete", label: "Package Complete", description: "The Intake Package is structurally complete.", serviceState: "Operational", intakeStatus: "Package Complete", operationalState: "Package Complete", addEvidenceIds: ["EV 05", "EV 06", "EV 07", "EV 08"], closeGapIds: ["GAP 9101", "GAP 9102", "GAP 9103", "GAP 9104", "GAP 9105"], activity: "Intake Package completed and ready for routing", notification: { type: "Package Updated", title: "Intake package complete", severity: "Info" } },
  { id: "routed", label: "Routed to Readiness", description: "The Intake Package moved to Cognitive Readiness Assessment.", serviceState: "Operational", intakeStatus: "Routed to Readiness", operationalState: "Routed to Readiness", addEvidenceIds: ["EV 05", "EV 06", "EV 07", "EV 08"], closeGapIds: ["GAP 9101", "GAP 9102", "GAP 9103", "GAP 9104", "GAP 9105"], activity: "Intake Package routed to Cognitive Readiness Assessment", notification: { type: "Intake Routed to Readiness", title: "Routed to readiness", severity: "Info" } },
  { id: "reset", label: "Reset Demo Data", description: "Restore the seeded demonstration state.", serviceState: "Operational", intakeStatus: "Needs Clarification", operationalState: "Needs Clarification", trafficExposure: 5, deploymentTiming: "Standard window", addEvidenceIds: [], closeGapIds: [], activity: "Demonstration data reset to seeded state", notification: { type: "Package Updated", title: "Demo data reset", severity: "Info" } },
];

export const scenarioById = (id: ScenarioId) =>
  demoScenarios.find((s) => s.id === id) ?? demoScenarios[0];

/* -------------------------------------------------------- run intake config */

export const runScopeOptions = ["Single Intake", "Selected Intakes", "Submitting Team", "Work Type", "Pending Intake"];

export const analysisOptions = [
  "Classify Work", "Decompose Change", "Resolve Entities", "Retrieve Enterprise Context",
  "Identify Persona Candidates", "Identify Business Conditions", "Retrieve Policies",
  "Retrieve Prior Decisions", "Retrieve Outcomes", "Retrieve Learning Records",
  "Evaluate Evidence", "Detect Gaps", "Detect Related Work",
];

export const contextRuleOptions = [
  "Prefer Primary Authority", "Allow Supporting Context", "Allow Historical Context",
  "Require Current Active Conditions", "Include Outcomes", "Include Learning",
  "Include Prior Decisions", "Respect Access Context",
];

export const qualityControlDefaults = {
  minimumEntityConfidence: 70,
  minimumContextMatch: 80,
  minimumPersonaMatch: 75,
  minimumEvidenceMetadata: 60,
  maximumStaleContextDays: 180,
  maximumUnresolvedEntities: 3,
};

export const runIntakeStages = [
  "Loading Incoming Work", "Classifying Work", "Decomposing Proposed Change",
  "Resolving Entities", "Retrieving Enterprise Cognitive Memory", "Matching Team Personas",
  "Matching Business Conditions", "Retrieving Prior Decisions", "Retrieving Outcomes",
  "Retrieving Learning", "Evaluating Evidence", "Detecting Gaps", "Detecting Related Work",
  "Building Intake Package", "Completed",
];

export const submitStages = [
  "Preserving Original Submission", "Creating Intake Record", "Creating Evidence References",
  "Resolving Initial Entities", "Retrieving Initial Enterprise Context", "Creating Intake Job", "Completed",
];

export const contextRefreshStages = [
  "Loading Current Intake", "Querying Enterprise Cognitive Memory", "Resolving Changed Entities",
  "Refreshing Persona Candidates", "Refreshing Conditions", "Refreshing Decisions",
  "Refreshing Outcomes", "Refreshing Learning", "Rebuilding Package", "Completed",
];

export const contextRefreshScopes = [
  "All Context", "Business Conditions Only", "Team Personas Only", "Policies",
  "Decisions", "Outcomes", "Learning", "Entities", "Dependencies",
];

export const contextRefreshOptions = [
  "Use Current Memory", "Include Historical", "Prefer Primary Authority", "Include Supporting",
  "Respect Access", "Recalculate Candidate Personas", "Recalculate Conditions", "Recalculate Gaps",
];

export interface ContextRefreshDelta {
  recordsAdded: string[];
  recordsRemoved: string[];
  personasAdded: string[];
  personasRemoved: string[];
  conditionsAdded: string[];
  conditionsRemoved: string[];
  newGaps: string[];
  resolvedGaps: string[];
}

export const computeRefreshDelta = (state: RuleInput): ContextRefreshDelta => {
  const rules = activatedRules(state);
  const conditionsAdded = rules.filter((r) => r.conditionId && (r.ruleType === "Traffic Exposure" || r.ruleType === "Quarter End Timing"))
    .map((r) => `${r.conditionId} · ${r.governanceRequirement.slice(0, 60)}…`);
  const personasAdded = Array.from(new Set(rules.flatMap((r) => r.reviewers)));
  return {
    recordsAdded: [
      "LRN 1502 · Retry expansion learning record refreshed",
      "OUT 3311 · Recent duplicate authorization outcome",
      ...conditionsAdded,
    ],
    recordsRemoved: ["RFC 1980 · Superseded retry architecture note"],
    personasAdded,
    personasRemoved: state.trafficExposure <= 10 ? ["Payments Reliability"] : [],
    conditionsAdded,
    conditionsRemoved: state.deploymentTiming === "Standard window" ? ["BC 1106 · Quarter end restriction"] : [],
    newGaps: rules.filter((r) => r.gapId).map((r) => `${r.gapId} · ${r.detail}`),
    resolvedGaps: evaluateRules(state).filter((r) => !r.triggered && r.gapId).map((r) => `${r.gapId} · resolved`),
  };
};

/* ------------------------------------------------------------- bulk actions */

export const bulkActions = [
  "Run Intake", "Assign Owner", "Request Clarification", "Request Evidence",
  "Refresh Context", "Export", "Route Complete Packages to Readiness", "Mark Related",
];

export const unsupportedBulkActions = ["Bulk approval", "Bulk impact determination", "Bulk deletion"];

export const bulkRoutingPreview = (rows: CognitiveIntake[]) => ({
  selected: rows.length,
  incomplete: rows.filter((r) => r.packageCompleteness < 90).length,
  criticalGaps: rows.reduce((a, r) => a + (r.missingItems > 3 ? 1 : 0), 0),
  openQuestions: rows.reduce((a, r) => a + r.missingItems, 0),
  evidenceCoverage: rows.length ? Math.round(rows.reduce((a, r) => a + r.evidenceCoverage, 0) / rows.length) : 0,
  candidatePersonas: rows.reduce((a, r) => a + r.candidatePersonaIds.length, 0),
});

/* ---------------------------------------------------- evidence + related UI */

export const evidenceTypes = [
  "Design Document", "Test Results", "Telemetry", "Metrics", "Architecture Diagram",
  "Incident Evidence", "Customer Evidence", "Security Review", "Compliance Review",
  "Dependency Validation", "Rollback Plan", "Other",
];

export const relatedWorkActions = [
  "Link Related Work", "Mark Duplicate", "Mark Independent",
  "Use Prior Outcome", "Use Prior Decision Context", "Compare",
];

export const duplicateComparison = (current: CognitiveIntake, prior: CognitiveIntakeRelatedWork) => ([
  { label: "Similarity", current: `${prior.similarity}%`, prior: `${prior.similarity}%` },
  { label: "Scope Overlap", current: current.scope, prior: "Transient decline retry timeout window" },
  { label: "Systems Overlap", current: "Retry Orchestrator, Payments API", prior: "Retry Orchestrator, Payments API" },
  { label: "Persona Overlap", current: "6 candidates", prior: "5 of 6 shared" },
  { label: "Condition Overlap", current: `${current.conditionsMatched} conditions`, prior: "14 shared conditions" },
  { label: "Owner", current: current.workOwner, prior: prior.owner },
  { label: "Date", current: current.submittedAt, prior: prior.date },
  { label: "Status", current: current.status, prior: prior.status },
]);

/* -------------------------------------------------- quality detail (upgrade) */

export const qualityDetail: Record<string, {
  definition: string; failureCauses: string[]; affectedIntakes: string[];
  affectedSections: string[]; recommendedActions: string[]; recentChanges: string[];
  workTypeDistribution: { label: string; value: number }[];
  teamDistribution: { label: string; value: number }[];
}> = {
  scope: {
    definition: "Share of intakes where the affected scope is explicit, bounded, and mapped to canonical entities.",
    failureCauses: ["Scope described narratively only", "No maximum traffic exposure", "Region not specified", "Journey boundary unclear"],
    affectedIntakes: ["INT 7001", "INT 7004", "INT 7007"],
    affectedSections: ["Scope", "Affected Entities", "Potential Governance Requirements"],
    recommendedActions: ["Request scope confirmation from work owner", "Resolve unmatched entities", "Capture maximum traffic exposure"],
    recentChanges: ["-1 point after three architecture submissions with narrative scope"],
    workTypeDistribution: [{ label: "Architecture Change", value: 74 }, { label: "Configuration Change", value: 92 }, { label: "Feature Change", value: 88 }],
    teamDistribution: [{ label: "Platform Engineering", value: 79 }, { label: "Checkout Engineering", value: 91 }, { label: "Identity Engineering", value: 93 }],
  },
  entity: {
    definition: "Share of detected enterprise references resolved to canonical entities above the confidence threshold.",
    failureCauses: ["Colloquial system naming", "Regional instance suffixes", "Deprecated aliases", "Missing data catalog entry"],
    affectedIntakes: ["INT 7001", "INT 7004"],
    affectedSections: ["Affected Entities", "Dependencies", "Enterprise Context"],
    recommendedActions: ["Run entity remediation", "Request owner confirmation", "Register missing canonical alias"],
    recentChanges: ["+2 points after alias registration for Payments API"],
    workTypeDistribution: [{ label: "Architecture Change", value: 81 }, { label: "Data Change", value: 87 }, { label: "Configuration Change", value: 96 }],
    teamDistribution: [{ label: "Platform Engineering", value: 84 }, { label: "Payments Platform", value: 97 }, { label: "Fraud Engineering", value: 93 }],
  },
  evidence: {
    definition: "Share of required evidence identified with owner, authority, and freshness metadata captured.",
    failureCauses: ["Evidence referenced but not attached", "No owner recorded", "Stale telemetry window"],
    affectedIntakes: ["INT 7001", "INT 7006"],
    affectedSections: ["Evidence", "Missing Evidence", "Risks"],
    recommendedActions: ["Request evidence from accountable owner", "Add synthetic validation report", "Refresh telemetry window"],
    recentChanges: ["+3 points after evidence request automation"],
    workTypeDistribution: [{ label: "Governance Exception", value: 82 }, { label: "Security Change", value: 95 }, { label: "Release Change", value: 97 }],
    teamDistribution: [{ label: "Release Engineering", value: 86 }, { label: "Payments Platform", value: 94 }, { label: "Site Reliability Engineering", value: 96 }],
  },
};

export const qualityRecalculationTriggers = [
  "Scope changes", "Owner assigned", "Entity resolved", "Evidence added",
  "Clarification answered", "Context refreshed",
];
