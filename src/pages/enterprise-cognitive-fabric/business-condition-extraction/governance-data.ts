/**
 * Prompt 2 — governance, review, versioning, publication and demo models for
 * Business Condition Extraction. Deterministic. No live services.
 * Extends (never replaces) the Prompt 1 models in ./data.
 */

import { conditions, type BusinessCondition } from "./data";

/* ------------------------------------------------------------------ models */

export interface ConditionReview {
  id: string;
  conditionId: string | null;
  candidateId: string | null;
  conflictId: string | null;
  gapId: string | null;
  reviewType: string;
  conditionCandidate: string;
  reason: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  assignedReviewer: string;
  dueDate: string;
  age: string;
  affectedTeams: string[];
  downstreamImpact: string;
  status: "Open" | "In Review" | "Clarification Requested" | "Escalated" | "Approved" | "Rejected";
  decision: string | null;
  comments: string[];
  createdAt: string;
  completedAt: string | null;
}

export interface ConditionVersion {
  id: string;
  conditionId: string;
  version: string;
  previousVersionId: string | null;
  changeType: "Created" | "Value Change" | "Owner Change" | "Authority Change" | "Applicability Change" | "Evidence Change" | "Supersession";
  changeSummary: string;
  status: "Current" | "Superseded" | "Historical" | "Draft";
  effectiveDate: string;
  expirationDate: string | null;
  owner: string;
  authorityLevel: string;
  approvalState: string;
  approval: string;
  valueChanges: string;
  ownerChanges: string;
  evidenceChanges: string;
  applicabilityChanges: string;
  downstreamConsumers: string[];
  changedBy: string;
  changedAt: string;
  fields: Record<string, string>;
}

export interface ConditionApproval {
  id: string;
  conditionId: string;
  conditionVersionId: string;
  approvalStage: ApprovalStage;
  approverId: string;
  approverRole: string;
  status: "Pending" | "Complete" | "Blocked";
  decision: "Approved" | "Approved with Conditions" | "Changes Requested" | "Rejected" | "Withdrawn" | null;
  comments: string;
  submittedAt: string;
  completedAt: string | null;
}

export interface ConditionPublication {
  id: string;
  conditionIds: string[];
  destinations: string[];
  status: "Queued" | "Validating" | "Publishing" | "Published" | "Blocked";
  readyCount: number;
  pendingCount: number;
  blockedCount: number;
  accessValidationStatus: "Passed" | "Warning" | "Failed";
  startedAt: string;
  completedAt: string | null;
  publishedBy: string;
}

export interface ExtractionActivity {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  conditionId: string | null;
  candidateId: string | null;
  jobId: string | null;
  conflictId: string | null;
  reviewId: string | null;
  sourceId: string;
  teamId: string;
  result: "Success" | "Warning" | "Blocked" | "Pending";
  owner: string;
  auditId: string;
}

export type ApprovalStage =
  | "Candidate" | "Structured" | "Evidence Validated" | "Owner Validated" | "Conflict Validated"
  | "Domain Review" | "Governance Review" | "Approved" | "Published";

export const approvalStages: ApprovalStage[] = [
  "Candidate", "Structured", "Evidence Validated", "Owner Validated", "Conflict Validated",
  "Domain Review", "Governance Review", "Approved", "Published",
];

/* ------------------------------------------------------------- review queue */

export const reviewCategories = [
  "Conflict Resolution", "Missing Owner", "Missing Evidence", "Low Confidence", "Ambiguous Value",
  "Authority Review", "Effective Date Review", "Applicability Review", "Classification Review",
  "Approval Requirement Review",
];

export const reviewSummary = [
  { label: "Total Reviews", value: 427, tone: "slate" as const },
  { label: "Critical", value: 18, tone: "red" as const },
  { label: "High", value: 104, tone: "amber" as const },
  { label: "Medium", value: 212, tone: "blue" as const },
  { label: "Low", value: 93, tone: "slate" as const },
  { label: "Overdue", value: 14, tone: "red" as const },
];

export const reviewCategoryCounts: Record<string, number> = {
  "Conflict Resolution": 148, "Missing Owner": 92, "Missing Evidence": 61, "Low Confidence": 74,
  "Ambiguous Value": 52, "Authority Review": 41, "Effective Date Review": 33, "Applicability Review": 28,
  "Classification Review": 24, "Approval Requirement Review": 19,
};

export const reviewsSeed: ConditionReview[] = [
  {
    id: "REV-2401", conditionId: "COND-100427", candidateId: "CAND-5", conflictId: null, gapId: null,
    reviewType: "Owner and Approval Validation", conditionCandidate: "Retry policy approval requirement",
    reason: "Two required approvers detected", priority: "High", assignedReviewer: "Payments Governance",
    dueDate: "Due Today", age: "6h", affectedTeams: ["Payments Platform", "Release Governance"],
    downstreamImpact: "1 release approval · 1 persona", status: "Open", decision: null, comments: [],
    createdAt: "04:12", completedAt: null,
  },
  {
    id: "REV-2402", conditionId: "COND-100422", candidateId: "CAND-2", conflictId: "CFL-3302", gapId: null,
    reviewType: "Conflict Resolution", conditionCandidate: "Identity token validation threshold",
    reason: "Conflicting 150 and 200 millisecond thresholds", priority: "Critical", assignedReviewer: "Security Architecture",
    dueDate: "Due Two Hours", age: "2h", affectedTeams: ["Identity Services", "Security Engineering", "Checkout Engineering"],
    downstreamImpact: "3 personas · 2 impact evaluations", status: "Open", decision: null, comments: [],
    createdAt: "08:04", completedAt: null,
  },
  {
    id: "REV-2403", conditionId: "COND-100425", candidateId: null, conflictId: "CFL-3303", gapId: null,
    reviewType: "Effective Date Review", conditionCandidate: "Quarter end deployment restriction",
    reason: "Three day and five day restrictions conflict", priority: "High", assignedReviewer: "Release Governance",
    dueDate: "Due Today", age: "9h", affectedTeams: ["Release Governance", "Payments Platform"],
    downstreamImpact: "1 change calendar · 2 decisions", status: "In Review", decision: null, comments: [],
    createdAt: "01:22", completedAt: null,
  },
  {
    id: "REV-2404", conditionId: null, candidateId: "CAND-4", conflictId: null, gapId: "GAP-4402",
    reviewType: "Low Confidence", conditionCandidate: "Fraud decision timeout",
    reason: "Requirement inferred from meeting transcript", priority: "Medium", assignedReviewer: "Fraud Engineering",
    dueDate: "Due Tomorrow", age: "1d", affectedTeams: ["Fraud Engineering"],
    downstreamImpact: "1 persona", status: "Open", decision: null, comments: [],
    createdAt: "Yesterday 15:40", completedAt: null,
  },
  {
    id: "REV-2405", conditionId: null, candidateId: "CAND-6", conflictId: null, gapId: "GAP-4401",
    reviewType: "Missing Owner", conditionCandidate: "Regional token vault dependency",
    reason: "Dependency owner unresolved", priority: "Medium", assignedReviewer: "Platform Architecture",
    dueDate: "Due Two Days", age: "1d 4h", affectedTeams: ["Platform Architecture", "Identity Services"],
    downstreamImpact: "1 dependency chain", status: "Open", decision: null, comments: [],
    createdAt: "Yesterday 11:08", completedAt: null,
  },
];

export const reviewActions = [
  "Open Review", "Approve", "Edit", "Reject", "Request Clarification", "Reassign", "Extend Due Date", "Escalate",
];

export const reviewerDecisionActions = [
  "Approve Candidate", "Edit Statement", "Edit Structured Fields", "Change Condition Type", "Select Canonical Owner",
  "Select Canonical Entity", "Add Evidence", "Mark as Assumption", "Merge with Existing Condition",
  "Reject Candidate", "Request Source Clarification", "Escalate",
];

/** Reviewer actions that must capture a comment before they can complete. */
export const commentRequiredActions = new Set([
  "Edit Statement", "Edit Structured Fields", "Change Condition Type", "Select Canonical Owner",
  "Mark as Assumption", "Reject Candidate", "Escalate",
]);

export function requiresComment(action: string, ctx: { conflict?: boolean; missingEvidence?: boolean; confidence?: number }) {
  if (commentRequiredActions.has(action)) return true;
  if (action === "Approve Candidate" && (ctx.conflict || ctx.missingEvidence)) return true;
  if (action === "Reject Candidate" && (ctx.confidence ?? 0) >= 90) return true;
  return false;
}

export const suggestedCorrections = [
  "Normalize unit to Milliseconds (P95)",
  "Set canonical owner to Identity Services",
  "Link evidence EVD-77104 § Service Level Objectives",
  "Reclassify as Performance Threshold (from Requirement)",
  "Set effective period to current quarter",
];

export const confidenceComponents = [
  { label: "Source authority", value: 34, max: 35 },
  { label: "Evidence directness", value: 26, max: 30 },
  { label: "Value explicitness", value: 18, max: 20 },
  { label: "Owner resolution", value: 12, max: 10 },
  { label: "Corroboration", value: 8, max: 5 },
];

/* --------------------------------------------------- conflict + gap analysis */

export const conflictGapSummary = [
  { label: "Active Conflicts", value: 148, tone: "red" as const, issue: "Value Conflict" },
  { label: "Missing Owners", value: 92, tone: "amber" as const, issue: "Missing Owner" },
  { label: "Missing Evidence", value: 61, tone: "amber" as const, issue: "Missing Evidence" },
  { label: "Ambiguous Values", value: 52, tone: "amber" as const, issue: "Ambiguous Value" },
  { label: "Overlapping Conditions", value: 84, tone: "blue" as const, issue: "Overlapping Condition" },
  { label: "Stale Conditions", value: 47, tone: "amber" as const, issue: "Stale Condition" },
  { label: "Conflicting Effective Dates", value: 33, tone: "red" as const, issue: "Effective Rule Conflict" },
  { label: "Unit Mismatches", value: 26, tone: "amber" as const, issue: "Unit Mismatch" },
  { label: "Authority Conflicts", value: 41, tone: "red" as const, issue: "Authority and Value Conflict" },
];

export interface ConflictRow {
  id: string;
  condition: string;
  conditionAId: string;
  conditionBId: string | null;
  issueType: string;
  detail: string;
  severity: "High Risk" | "Medium Risk" | "Low Risk";
  authority: string;
  confidence: number;
  affectedTeams: string[];
  downstreamImpact: string;
  owner: string;
  age: string;
  recommendedAction: string;
  status: "Open" | "Acknowledged" | "Assigned" | "Resolved";
  a: ConflictSide;
  b: ConflictSide;
}

export interface ConflictSide {
  label: string;
  statement: string;
  conditionType: string;
  subject: string;
  operator: string;
  value: string;
  unit: string;
  timeWindow: string;
  owner: string;
  authority: string;
  evidence: string;
  freshness: string;
  effectiveDate: string;
  applicableTeams: string;
  applicableSystems: string;
  downstreamUse: string;
}

export const conflictRows: ConflictRow[] = [
  {
    id: "CFL-3301", condition: "Payments API latency threshold", conditionAId: "COND-100422", conditionBId: "COND-100432",
    issueType: "Value Conflict", detail: "A less than 250 ms · B less than 300 ms", severity: "Medium Risk",
    authority: "A Primary · B Supporting", confidence: 91,
    affectedTeams: ["Payments Platform", "Checkout Engineering", "Site Reliability Engineering"],
    downstreamImpact: "3 personas · 2 evaluations · 3 dashboards", owner: "Payments Platform", age: "2d",
    recommendedAction: "Select Primary condition (A) and mark B supporting", status: "Open",
    a: {
      label: "Condition A · COND-100422", statement: "Payments API P95 latency shall remain below 250 milliseconds during peak checkout periods",
      conditionType: "Performance Threshold", subject: "Payments API P95 Latency", operator: "<", value: "250", unit: "Milliseconds",
      timeWindow: "Peak checkout periods", owner: "Payments Platform", authority: "Primary",
      evidence: "EVD-77120 § Performance Requirements · direct", freshness: "Current", effectiveDate: "2026-07-01",
      applicableTeams: "Payments Platform, Checkout Engineering", applicableSystems: "Payments, Checkout",
      downstreamUse: "Payments Platform Persona, Impact Analysis, SRE dashboards",
    },
    b: {
      label: "Condition B · COND-100432", statement: "Payments API P95 latency should remain below 300 milliseconds",
      conditionType: "Performance Threshold", subject: "Payments API P95 Latency", operator: "<", value: "300", unit: "Milliseconds",
      timeWindow: "All periods", owner: "Site Reliability Engineering", authority: "Supporting",
      evidence: "EVD-70884 § Runbook Appendix · inferred", freshness: "Aging", effectiveDate: "2025-10-01",
      applicableTeams: "Site Reliability Engineering", applicableSystems: "Payments",
      downstreamUse: "SRE runbook, Reliability review",
    },
  },
  {
    id: "CFL-3302", condition: "Identity token validation threshold", conditionAId: "COND-100428", conditionBId: "COND-100429",
    issueType: "Authority and Value Conflict", detail: "A less than 150 ms · B less than 200 ms", severity: "High Risk",
    authority: "A Unconfirmed · B Primary", confidence: 84,
    affectedTeams: ["Identity Services", "Security Engineering", "Checkout Engineering"],
    downstreamImpact: "3 personas · 2 evaluations · 1 release approval", owner: "Security Architecture", age: "1d",
    recommendedAction: "Escalate to Security Architecture and confirm the authoritative source", status: "Open",
    a: {
      label: "Condition A · COND-100428", statement: "Identity token validation shall complete within 150 milliseconds at P95",
      conditionType: "Performance Threshold", subject: "Identity Token Validation", operator: "<", value: "150", unit: "Milliseconds",
      timeWindow: "P95 rolling hour", owner: "Identity Services", authority: "Unconfirmed",
      evidence: "EVD-71208 § Apigee policy notes · inferred", freshness: "Current", effectiveDate: "2026-05-01",
      applicableTeams: "Identity Services", applicableSystems: "Identity",
      downstreamUse: "Identity Persona",
    },
    b: {
      label: "Condition B · COND-100429", statement: "Identity token validation shall complete within 200 milliseconds at P95",
      conditionType: "Performance Threshold", subject: "Identity Token Validation", operator: "<", value: "200", unit: "Milliseconds",
      timeWindow: "P95 rolling hour", owner: "Security Engineering", authority: "Primary",
      evidence: "EVD-71322 § Security Architecture Standard v4 · direct", freshness: "Current", effectiveDate: "2026-07-01",
      applicableTeams: "Security Engineering, Identity Services", applicableSystems: "Identity, Checkout",
      downstreamUse: "Security Persona, Checkout Persona, Impact Analysis",
    },
  },
  {
    id: "CFL-3303", condition: "Quarter end deployment restriction", conditionAId: "COND-100425", conditionBId: "COND-100433",
    issueType: "Effective Rule Conflict", detail: "A final three business days · B final five business days", severity: "High Risk",
    authority: "A Primary · B Primary", confidence: 88,
    affectedTeams: ["Release Governance", "Payments Platform", "Finance Systems"],
    downstreamImpact: "1 change calendar · 2 decisions · 1 customer journey", owner: "Release Governance", age: "4d",
    recommendedAction: "Create an effective date transition at the next quarter boundary", status: "Acknowledged",
    a: {
      label: "Condition A · COND-100425", statement: "No production deployments during the final three business days of a fiscal quarter",
      conditionType: "Change Restriction", subject: "Production Deployments", operator: "=", value: "Restricted", unit: "Business days",
      timeWindow: "Final 3 business days of quarter", owner: "Release Governance", authority: "Primary",
      evidence: "EVD-69110 § Change Policy v2.9 · direct", freshness: "Aging", effectiveDate: "2026-01-01",
      applicableTeams: "All engineering", applicableSystems: "All production systems",
      downstreamUse: "Change calendar, Release approvals",
    },
    b: {
      label: "Condition B · COND-100433", statement: "No production deployments during the final five business days of a fiscal quarter",
      conditionType: "Change Restriction", subject: "Production Deployments", operator: "=", value: "Restricted", unit: "Business days",
      timeWindow: "Final 5 business days of quarter", owner: "Finance Systems", authority: "Primary",
      evidence: "EVD-72440 § Quarter Close Controls · direct", freshness: "Current", effectiveDate: "2026-07-01",
      applicableTeams: "Finance Systems, Payments Platform", applicableSystems: "Finance, Payments",
      downstreamUse: "Quarter close controls, Release approvals",
    },
  },
];

export const conflictComparisonRows: { label: string; key: keyof ConflictSide; conflictWhenDifferent: boolean }[] = [
  { label: "Subject match", key: "subject", conflictWhenDifferent: true },
  { label: "Type match", key: "conditionType", conflictWhenDifferent: true },
  { label: "Operator conflict", key: "operator", conflictWhenDifferent: true },
  { label: "Value conflict", key: "value", conflictWhenDifferent: true },
  { label: "Unit conflict", key: "unit", conflictWhenDifferent: true },
  { label: "Owner conflict", key: "owner", conflictWhenDifferent: true },
  { label: "Authority conflict", key: "authority", conflictWhenDifferent: true },
  { label: "Evidence agreement", key: "evidence", conflictWhenDifferent: true },
  { label: "Freshness difference", key: "freshness", conflictWhenDifferent: true },
  { label: "Effective period overlap", key: "effectiveDate", conflictWhenDifferent: true },
  { label: "Applicability conflict", key: "applicableTeams", conflictWhenDifferent: true },
];

export const conflictActions = [
  "Assign", "Acknowledge", "Open Comparison", "Select Authoritative Condition", "Merge", "Supersede",
  "Set Effective Period", "Request Clarification", "Create Review Task", "Create Incident",
];

export const resolutionChoices = [
  "Select A", "Select B", "Merge Conditions", "Create Effective Date Transition",
  "Keep Both for Different Applicability", "Keep Both for Different Environments",
  "Keep Both for Different Services", "Mark One Historical", "Mark One Supporting",
  "Mark One Assumption", "Request Source Clarification", "Escalate to Governance",
];

/* --------------------------------------------------------------- taxonomy */

export interface ConditionTypeDefinition {
  id: string;
  name: string;
  definition: string;
  businessPurpose: string;
  requiredFields: string[];
  optionalFields: string[];
  allowedOperators: string[];
  allowedValueTypes: string[];
  supportedUnits: string[];
  ownerRequirements: string;
  evidenceRequirements: string;
  authorityRequirements: string;
  approvalRequirements: string;
  conflictRules: string;
  freshnessRules: string;
  exampleStatements: string[];
  extractionGuidance: string;
  validationRules: string[];
  downstreamUses: string[];
  status: "Active" | "Draft" | "Deprecated";
  version: string;
}

const td = (
  name: string, definition: string, businessPurpose: string, extra: Partial<ConditionTypeDefinition> = {},
): ConditionTypeDefinition => ({
  id: name.toLowerCase().replace(/\s+/g, "-"),
  name, definition, businessPurpose,
  requiredFields: ["Statement", "Subject", "Owner", "Authority", "Evidence", "Effective Date"],
  optionalFields: ["Time Window", "Expiration Date", "Applicable Systems", "Dependencies", "Risks"],
  allowedOperators: ["=", "!=", ">", ">=", "<", "<=", "between", "in", "not in"],
  allowedValueTypes: ["Numeric", "Percentage", "Duration", "Currency", "Boolean", "Enumeration", "Text"],
  supportedUnits: ["Percent", "Milliseconds", "Seconds", "Count", "Currency", "Business days", "None"],
  ownerRequirements: "Canonical owning team required before approval",
  evidenceRequirements: "At least one direct evidence passage from a canonical artifact",
  authorityRequirements: "Primary or Supporting source required for approval",
  approvalRequirements: "Domain review; governance review when customer impacting",
  conflictRules: "Same subject and operator with divergent value raises a value conflict",
  freshnessRules: "Stale after 180 days without evidence reconfirmation",
  exampleStatements: [],
  extractionGuidance: "Extract one atomic rule per record. Split compound statements.",
  validationRules: ["Statement is atomic", "Unit resolved", "Owner resolved", "Evidence linked"],
  downstreamUses: ["Team Persona Builder", "Impact Analysis", "Context Graph"],
  status: "Active", version: "3.6",
  ...extra,
});

export const conditionTypeDefinitions: ConditionTypeDefinition[] = [
  td("Business Objective", "Desired business outcome or capability", "Anchors priorities and success measures", {
    exampleStatements: ["Protect checkout conversion by eliminating avoidable authorization failures"],
    allowedOperators: ["="], allowedValueTypes: ["Text"], approvalRequirements: "Domain review",
  }),
  td("Requirement", "Mandatory capability, behavior, or result", "Defines what must be true for delivery", {
    exampleStatements: ["Regional token vault failover must complete within 60 seconds"],
  }),
  td("Constraint", "Boundary limiting an action or design", "Prevents designs that violate operating limits", {
    exampleStatements: ["Checkout retry budget shall not exceed 3 attempts per authorization"],
  }),
  td("Policy", "Governed organizational rule", "Encodes governance rules for repeatable decisions", {
    approvalRequirements: "Governance review required", authorityRequirements: "Primary source required",
    exampleStatements: ["Production changes require two approvers for restricted systems"],
  }),
  td("Baseline", "Measured current state", "Establishes the starting point for change evaluation", {
    exampleStatements: ["Current Payments API error rate is 0.8 percent"],
    freshnessRules: "Stale after 30 days without a measurement refresh",
  }),
  td("Target", "Desired future state", "Defines the intended improvement", {
    exampleStatements: ["Payments API error rate target below 0.3 percent"],
  }),
  td("Threshold", "Value triggering action, approval, risk, or escalation", "Drives alerting, approval, and escalation", {
    exampleStatements: ["Payments API P95 latency shall remain below 250 milliseconds"],
    conflictRules: "Divergent thresholds on the same subject always raise a conflict",
  }),
  td("Service Level Objective", "Measurable reliability or performance commitment", "Commits reliability to customers and partners", {
    exampleStatements: ["Payments API monthly availability shall be at least 99.95 percent"],
    approvalRequirements: "Domain review and governance review",
  }),
  td("Decision Rule", "Condition determining action", "Makes recurring decisions consistent and explainable", {
    exampleStatements: ["Fraud decision latency above 1.2 s triggers graceful degradation"],
  }),
  td("Assumption", "Statement treated as true for planning", "Makes planning premises explicit and reviewable", {
    authorityRequirements: "May be Unconfirmed; must be labelled as an assumption",
    exampleStatements: ["Peak checkout traffic grows 18 percent year over year"],
  }),
  td("Dependency", "Entity, team, service, system, or event required for success", "Reveals cross-team coupling", {
    exampleStatements: ["Payments API depends on Identity token validation"],
  }),
  td("Risk", "Potential condition negatively affecting an objective", "Surfaces exposure before decisions are made", {
    exampleStatements: ["Single region token vault creates a checkout availability risk"],
  }),
  td("Control", "Mechanism reducing or preventing risk", "Links risks to mitigations", {
    exampleStatements: ["Dual region vault replication controls checkout availability risk"],
  }),
  td("Approval Requirement", "Condition requiring authorization before execution", "Prevents unauthorized change", {
    approvalRequirements: "Governance review required",
    exampleStatements: ["Retry policy changes require Payments Governance approval"],
  }),
];

export const taxonomyActions = [
  "View Type", "Edit Draft", "Clone", "Compare Versions", "Activate", "Deprecate", "Test Against Sample", "Create Condition Type",
];

export const taxonomyTestResult = {
  candidatesDetected: 7,
  classificationChanges: 2,
  requiredFields: ["Statement", "Subject", "Owner", "Authority", "Evidence", "Effective Date"],
  validationFailures: 1,
  conflictBehavior: "Divergent thresholds now raise a conflict instead of a warning",
  confidenceChange: "+3 points average",
  backwardCompatibility: "Compatible — existing approvals preserved for 12 of 14 types",
};

/* --------------------------------------------------------------- versioning */

const versionFields = (value: string, owner: string, authority: string, applicability: string) => ({
  Statement: "Payments API P95 latency shall remain below " + value + " milliseconds during peak checkout periods",
  Type: "Performance Threshold",
  Subject: "Payments API P95 Latency",
  Operator: "<",
  Value: value,
  Unit: "Milliseconds",
  Baseline: "228",
  Target: value,
  Threshold: value,
  Owner: owner,
  Authority: authority,
  Applicability: applicability,
  Dependencies: "Identity Services, Fraud Decision Service",
  Evidence: "EVD-77120 § Performance Requirements",
  "Effective Dates": "2026-07-01 →",
  Approval: "Payments Governance",
  Confidence: "97",
  Freshness: "Current",
});

export const conditionVersions: ConditionVersion[] = [
  {
    id: "VER-3.2", conditionId: "COND-100422", version: "3.2", previousVersionId: "VER-3.1", changeType: "Value Change",
    changeSummary: "Latency threshold tightened from 300 ms to 250 ms for peak checkout periods",
    status: "Current", effectiveDate: "2026-07-01", expirationDate: null, owner: "Payments Platform",
    authorityLevel: "Primary", approvalState: "Approved", approval: "Approved · Payments Governance",
    valueChanges: "300 → 250 ms", ownerChanges: "None", evidenceChanges: "EVD-77120 added",
    applicabilityChanges: "Checkout Engineering added",
    downstreamConsumers: ["Payments Platform Persona", "Impact Analysis", "Context Graph", "SRE dashboards"],
    changedBy: "M. Alvarez", changedAt: "2026-06-24 14:12",
    fields: versionFields("250", "Payments Platform", "Primary", "Payments Platform, Checkout Engineering"),
  },
  {
    id: "VER-3.1", conditionId: "COND-100422", version: "3.1", previousVersionId: "VER-3.0", changeType: "Owner Change",
    changeSummary: "Ownership moved from Site Reliability Engineering to Payments Platform",
    status: "Superseded", effectiveDate: "2026-04-01", expirationDate: "2026-06-30", owner: "Payments Platform",
    authorityLevel: "Primary", approvalState: "Approved", approval: "Approved · Reliability Council",
    valueChanges: "None", ownerChanges: "SRE → Payments Platform", evidenceChanges: "None",
    applicabilityChanges: "None",
    downstreamConsumers: ["Payments Platform Persona", "Impact Analysis"],
    changedBy: "D. Okafor", changedAt: "2026-03-18 09:40",
    fields: versionFields("300", "Payments Platform", "Primary", "Payments Platform"),
  },
  {
    id: "VER-3.0", conditionId: "COND-100422", version: "3.0", previousVersionId: null, changeType: "Created",
    changeSummary: "Initial extraction from Payments API Reliability Requirements v2.8",
    status: "Historical", effectiveDate: "2025-10-01", expirationDate: "2026-03-31", owner: "Site Reliability Engineering",
    authorityLevel: "Supporting", approvalState: "Approved", approval: "Approved · Reliability Council",
    valueChanges: "Created at 300 ms", ownerChanges: "Created", evidenceChanges: "EVD-70884 linked",
    applicabilityChanges: "Created",
    downstreamConsumers: ["SRE runbook"],
    changedBy: "Extraction Service", changedAt: "2025-09-22 03:11",
    fields: versionFields("300", "Site Reliability Engineering", "Supporting", "Site Reliability Engineering"),
  },
];

export const versionCompareFields = [
  "Statement", "Type", "Subject", "Operator", "Value", "Unit", "Baseline", "Target", "Threshold",
  "Owner", "Authority", "Applicability", "Dependencies", "Evidence", "Effective Dates", "Approval",
  "Confidence", "Freshness",
];

export function diffVersions(a: ConditionVersion, b: ConditionVersion) {
  const changed: string[] = []; const added: string[] = []; const removed: string[] = [];
  for (const f of versionCompareFields) {
    const av = a.fields[f]; const bv = b.fields[f];
    if (av && !bv) removed.push(f);
    else if (!av && bv) added.push(f);
    else if (av !== bv) changed.push(f);
  }
  return { changed, added, removed };
}

export const supersessionOptions = [
  "Supersede Now", "Supersede on Effective Date", "Retain Both for Different Applicability",
  "Retain Both for Different Environments", "Mark Prior Historical",
];

/* ------------------------------------------------------------- approvals */

export const approvalRequirementDrivers = [
  { driver: "Condition Type", value: "Performance Threshold", requirement: "Domain review" },
  { driver: "Authority", value: "Primary", requirement: "Owner attestation" },
  { driver: "Risk", value: "Medium", requirement: "Domain review" },
  { driver: "Regulatory Scope", value: "PCI DSS", requirement: "Governance review" },
  { driver: "Teams Affected", value: "3", requirement: "Cross-team acknowledgement" },
  { driver: "Customer Impact", value: "Yes", requirement: "Governance review" },
  { driver: "Access Classification", value: "Internal", requirement: "Standard" },
  { driver: "Conflict Status", value: "1 open conflict", requirement: "Conflict validation before approval" },
];

export const approvalsSeed: ConditionApproval[] = [
  { id: "APR-8801", conditionId: "COND-100422", conditionVersionId: "VER-3.2", approvalStage: "Domain Review", approverId: "d.okafor", approverRole: "Domain Steward · Payments", status: "Complete", decision: "Approved", comments: "Evidence verified against v3.2 artifact.", submittedAt: "2026-06-22 10:04", completedAt: "2026-06-22 15:22" },
  { id: "APR-8802", conditionId: "COND-100422", conditionVersionId: "VER-3.2", approvalStage: "Governance Review", approverId: "r.mehta", approverRole: "Knowledge Governance", status: "Complete", decision: "Approved with Conditions", comments: "Re-validate after quarter close.", submittedAt: "2026-06-23 09:00", completedAt: "2026-06-24 11:38" },
  { id: "APR-8803", conditionId: "COND-100428", conditionVersionId: "VER-1.4", approvalStage: "Conflict Validated", approverId: "s.iyer", approverRole: "Security Architecture", status: "Blocked", decision: null, comments: "Blocked by CFL-3302.", submittedAt: "2026-08-05 08:12", completedAt: null },
];

export const approvalActions = [
  "Submit for Review", "Approve", "Approve with Conditions", "Request Changes", "Reject", "Withdraw",
];

/* ------------------------------------------------------------ publishing */

export interface PublishDestination {
  id: string; name: string; state: "Ready" | "Pending" | "Blocked" | "Paused";
  ready: number; pending: number; blocked: number; lastPublished: string; version: string;
  status: string; accessValidation: "Passed" | "Warning" | "Failed";
}

export const publishDestinations: PublishDestination[] = [
  { id: "registry", name: "Conditions Registry", state: "Ready", ready: 87_442, pending: 2_184, blocked: 148, lastPublished: "09:58", version: "v3.6", status: "Healthy", accessValidation: "Passed" },
  { id: "graph", name: "Context Graph", state: "Ready", ready: 85_214, pending: 2_412, blocked: 148, lastPublished: "09:54", version: "v3.6", status: "Healthy", accessValidation: "Passed" },
  { id: "memory", name: "Enterprise Cognitive Memory", state: "Ready", ready: 87_442, pending: 1_986, blocked: 92, lastPublished: "09:56", version: "v3.6", status: "Healthy", accessValidation: "Passed" },
  { id: "persona", name: "Team Persona Builder", state: "Pending", ready: 82_906, pending: 3_642, blocked: 427, lastPublished: "09:31", version: "v3.5", status: "Degraded", accessValidation: "Warning" },
  { id: "intake", name: "Cognitive Intake", state: "Ready", ready: 84_118, pending: 2_042, blocked: 118, lastPublished: "09:44", version: "v3.6", status: "Healthy", accessValidation: "Passed" },
  { id: "impact", name: "Impact Analysis", state: "Pending", ready: 79_842, pending: 4_128, blocked: 427, lastPublished: "09:28", version: "v3.5", status: "Degraded", accessValidation: "Warning" },
  { id: "decision", name: "Decision Intelligence", state: "Ready", ready: 78_204, pending: 3_884, blocked: 214, lastPublished: "09:22", version: "v3.6", status: "Healthy", accessValidation: "Passed" },
  { id: "search", name: "Cognitive Search", state: "Ready", ready: 87_442, pending: 1_204, blocked: 0, lastPublished: "10:01", version: "v3.6", status: "Healthy", accessValidation: "Passed" },
  { id: "mcp", name: "MCP Context Services", state: "Blocked", ready: 86_118, pending: 1_486, blocked: 61, lastPublished: "09:49", version: "v3.5", status: "Access revalidation required", accessValidation: "Failed" },
];

export const publishScopeOptions = [
  "Selected Conditions", "Selected Condition Types", "Selected Domain", "Selected Team",
  "Approved Changes", "Incremental Publication",
];

export const publishValidationChecks = [
  { id: "approval", label: "Approval", detail: "All records approved at the required stage" },
  { id: "authority", label: "Authority", detail: "Primary or Supporting authority present" },
  { id: "evidence", label: "Evidence", detail: "Passage level evidence linked" },
  { id: "ownership", label: "Ownership", detail: "Canonical owner resolved" },
  { id: "conflict", label: "Conflict status", detail: "No unresolved conflicts in scope" },
  { id: "freshness", label: "Freshness", detail: "Evidence reconfirmed within policy window" },
  { id: "access", label: "Access", detail: "Destination access classification honoured" },
  { id: "version", label: "Version", detail: "Version lineage intact" },
  { id: "compat", label: "Destination compatibility", detail: "Schema compatible with destination contract" },
];

export const publishSteps = [
  "Validating Conditions", "Validating Evidence", "Validating Access", "Publishing Registry Records",
  "Updating Context Graph", "Updating Cognitive Memory", "Updating Persona Services",
  "Updating Impact Analysis", "Updating Search", "Updating MCP Context", "Completed",
];

export const publishingHistory = [
  { id: "PUB-5521", scope: "1,842 Jira conditions", destinations: "Registry, Graph, Memory", status: "Published", started: "10:04", completed: "10:09", by: "A. Valencia" },
  { id: "PUB-5520", scope: "Approved changes · Payments", destinations: "All destinations", status: "Published", started: "09:52", completed: "09:58", by: "Extraction Service" },
  { id: "PUB-5519", scope: "Identity domain increment", destinations: "Registry, Search", status: "Blocked", started: "09:31", completed: "09:33", by: "Extraction Service" },
];

/* ---------------------------------------------------- downstream impact */

export const downstreamImpactModel = {
  headline: "Changing Payments API latency threshold from 250 to 300 ms",
  personas: ["Payments Platform Persona", "Checkout Engineering Persona", "Site Reliability Engineering Persona"],
  services: ["Payments API", "Checkout Orchestrator", "Identity Token Service"],
  products: ["Checkout"],
  customerJourneys: ["Guest checkout completion"],
  evaluations: ["EVAL-2210 Peak season readiness", "EVAL-2244 Regional failover"],
  decisions: ["DEC-881 Release approval for 2026.8"],
  policies: ["Change Policy v2.9"],
  graphRelationships: ["Payments API MEASURED BY P95 Latency", "Checkout DEPENDS ON Payments API", "SRE OWNS Reliability dashboards"],
  dashboards: ["Payments reliability", "Checkout funnel", "SRE golden signals"],
};

/* ------------------------------------------------------------ bulk actions */

export const bulkActions = [
  "Approve", "Assign Owner", "Change Authority", "Apply Effective Date", "Apply Expiration Date",
  "Add Evidence", "Mark Assumption", "Request Review", "Resolve Conflict", "Publish", "Retire", "Export",
];

export const highImpactBulkActions = new Set(["Approve", "Change Authority", "Publish", "Retire", "Resolve Conflict"]);

/* -------------------------------------------------------------- reprocess */

export const reprocessScopes = ["Selected artifact", "Selected extraction job", "Selected condition family", "Selected conditions"];
export const reprocessOptions = [
  "Create New Versions", "Reprocess Failed Candidates", "Reprocess Selected Types",
  "Reprocess Full Artifact", "Preserve Existing Approvals where valid",
];
export const reprocessPreview = {
  currentTaxonomy: "v3.6", proposedTaxonomy: "v3.7 (draft)",
  conditionsAffected: 4_218, classificationChanges: 612, requiredFieldChanges: 184,
  authorityRuleChanges: 96, conflictRuleChanges: 41, potentialNewVersions: 1_042,
  affectedDownstream: ["Team Persona Builder", "Impact Analysis", "Context Graph", "Cognitive Search"],
};

/* ----------------------------------------------------------- pause/resume */

export const pauseOptions = [
  "Pause New Jobs", "Pause Condition Types", "Pause Domains", "Drain Queue", "Immediate Pause", "Maintenance Window",
];
export const pauseImpact = {
  jobsAffected: 14, artifactsAffected: 42_118, reviewBacklogImpact: "+180 reviews per hour deferred",
  personaImpact: "2 persona builds delayed", impactAnalysisImpact: "2 evaluations paused",
  registryDelay: "Registry publishing delayed by approximately 45 minutes",
};
export const resumeChecks = ["Service validation", "Taxonomy validation", "Evidence validation", "Registry validation"];

/* ------------------------------------------------------------- activity */

export const activitySeed: ExtractionActivity[] = [
  { id: "ACT-9101", timestamp: "10:22 AM", action: "Conditions Extracted", description: "42 conditions extracted from Payments API Reliability Requirements", conditionId: null, candidateId: null, jobId: "JOB-4412", conflictId: null, reviewId: null, sourceId: "Confluence Cloud", teamId: "Payments Reliability", result: "Success", owner: "Extraction Service", auditId: "AUD-77120" },
  { id: "ACT-9102", timestamp: "10:18 AM", action: "Condition Approved", description: "Payments availability objective approved", conditionId: "COND-100421", candidateId: null, jobId: null, conflictId: null, reviewId: null, sourceId: "Confluence Cloud", teamId: "Payments Reliability", result: "Success", owner: "D. Okafor", auditId: "AUD-77121" },
  { id: "ACT-9103", timestamp: "10:14 AM", action: "Conflict Assigned", description: "Identity latency conflict assigned to Security Architecture", conditionId: "COND-100428", candidateId: null, jobId: null, conflictId: "CFL-3302", reviewId: "REV-2402", sourceId: "Apigee", teamId: "Security Architecture", result: "Pending", owner: "S. Iyer", auditId: "AUD-77122" },
  { id: "ACT-9104", timestamp: "10:09 AM", action: "Conditions Published", description: "1,842 Jira conditions published to Conditions Registry", conditionId: null, candidateId: null, jobId: "JOB-4409", conflictId: null, reviewId: null, sourceId: "Jira", teamId: "Registry Operations", result: "Success", owner: "Registry Operations", auditId: "AUD-77123" },
  { id: "ACT-9105", timestamp: "10:06 AM", action: "Review Requested", description: "Quarter end deployment restriction flagged for review", conditionId: "COND-100425", candidateId: null, jobId: null, conflictId: "CFL-3303", reviewId: "REV-2403", sourceId: "Confluence Cloud", teamId: "Release Governance", result: "Warning", owner: "Release Governance", auditId: "AUD-77124" },
  { id: "ACT-9106", timestamp: "10:03 AM", action: "Owner Confirmed", description: "Payments Platform owner mapping confirmed", conditionId: "COND-100422", candidateId: null, jobId: null, conflictId: null, reviewId: null, sourceId: "Workday", teamId: "Payments Platform", result: "Success", owner: "Organizational Data", auditId: "AUD-77125" },
  { id: "ACT-9107", timestamp: "9:58 AM", action: "Candidate Created", description: "Fraud decision timeout candidate created from meeting evidence", conditionId: null, candidateId: "CAND-4", jobId: "JOB-4411", conflictId: null, reviewId: "REV-2404", sourceId: "Meeting Intelligence", teamId: "Fraud Engineering", result: "Pending", owner: "Extraction Service", auditId: "AUD-77126" },
  { id: "ACT-9108", timestamp: "9:52 AM", action: "Taxonomy Updated", description: "Condition taxonomy version 3.6 activated", conditionId: null, candidateId: null, jobId: null, conflictId: null, reviewId: null, sourceId: "Taxonomy Governance", teamId: "Taxonomy Governance", result: "Success", owner: "R. Mehta", auditId: "AUD-77127" },
];

/* --------------------------------------------------------- notifications */

export const notificationCategories = [
  "Extraction Completed", "Extraction Failed", "Condition Approved", "Human Review Requested",
  "Conflict Detected", "Owner Missing", "Evidence Missing", "Low Confidence", "Taxonomy Updated",
  "Condition Superseded", "Conditions Published", "Downstream Evaluation Requires Reassessment",
];

export interface GovernanceNotification {
  id: string; category: string; title: string; detail: string; time: string; read: boolean;
  targetId: string | null; targetKind: "condition" | "review" | "conflict" | "job" | "panel";
}

export const governanceNotifications: GovernanceNotification[] = [
  { id: "N-1", category: "Conflict Detected", title: "Identity latency conflict detected", detail: "CFL-3302 · 150 ms vs 200 ms · Critical", time: "10:14", read: false, targetId: "CFL-3302", targetKind: "conflict" },
  { id: "N-2", category: "Human Review Requested", title: "Quarter end restriction requires review", detail: "REV-2403 · Release Governance · due today", time: "10:06", read: false, targetId: "REV-2403", targetKind: "review" },
  { id: "N-3", category: "Conditions Published", title: "1,842 conditions published", detail: "Jira increment published to Conditions Registry", time: "10:09", read: false, targetId: "publish", targetKind: "panel" },
  { id: "N-4", category: "Condition Approved", title: "Payments availability objective approved", detail: "COND-100421 · v3.4", time: "10:18", read: true, targetId: "COND-100421", targetKind: "condition" },
  { id: "N-5", category: "Owner Missing", title: "92 conditions missing canonical owner", detail: "Owner resolution backlog elevated", time: "09:48", read: false, targetId: "panel-conflicts", targetKind: "panel" },
  { id: "N-6", category: "Evidence Missing", title: "61 conditions missing direct evidence", detail: "Evidence linkage below target for legacy PDFs", time: "09:41", read: true, targetId: "panel-conflicts", targetKind: "panel" },
  { id: "N-7", category: "Low Confidence", title: "74 low confidence candidates", detail: "Inferred from transcripts and chat", time: "09:36", read: true, targetId: "panel-reviews", targetKind: "panel" },
  { id: "N-8", category: "Taxonomy Updated", title: "Taxonomy v3.6 activated", detail: "Threshold conflict rules tightened", time: "09:52", read: true, targetId: "panel-taxonomy-admin", targetKind: "panel" },
  { id: "N-9", category: "Extraction Completed", title: "JOB-4412 completed", detail: "42 conditions from Payments API Reliability Requirements", time: "10:22", read: false, targetId: "JOB-4412", targetKind: "job" },
  { id: "N-10", category: "Extraction Failed", title: "JOB-4407 failed at normalization", detail: "Unit resolution failure on legacy PDFs", time: "09:12", read: true, targetId: "JOB-4407", targetKind: "job" },
  { id: "N-11", category: "Condition Superseded", title: "COND-100432 superseded", detail: "Replaced by COND-100422 v3.2", time: "09:04", read: true, targetId: "COND-100422", targetKind: "condition" },
  { id: "N-12", category: "Downstream Evaluation Requires Reassessment", title: "EVAL-2210 requires reassessment", detail: "Latency threshold changed after evaluation baseline", time: "08:58", read: false, targetId: "panel-downstream", targetKind: "panel" },
];

/* ------------------------------------------------------------- demo story */

export interface DemoStep { id: number; target: string; title: string; caption: string; notes: string; }

export const demoSteps: DemoStep[] = [
  { id: 1, target: "panel-kpis", title: "Conditions, not summaries", caption: "The Enterprise Cognitive Fabric converts normalized organizational knowledge into reusable business conditions rather than relying on document summaries.", notes: "Anchor on Conditions Extracted and Approved Conditions." },
  { id: 2, target: "panel-lifecycle", title: "Extraction lifecycle", caption: "Evidence is identified, candidate conditions are detected, values and units are normalized, owners and dependencies are resolved, and authority is evaluated.", notes: "Ten measured stages with SLA and throughput." },
  { id: 3, target: "panel-workbench", title: "Evidence traceability", caption: "Every condition remains connected to the exact evidence passage that supports it.", notes: "Hover a candidate to highlight its evidence passage." },
  { id: 4, target: "panel-baseline", title: "Baseline, target, threshold", caption: "The Fabric distinguishes current state, desired outcome, warning level, failure threshold, and escalation trigger.", notes: "Switch metrics to show the same model across measures." },
  { id: 5, target: "panel-authority", title: "Authority and evidence", caption: "Primary, supporting, historical, reference, and unconfirmed sources are treated differently so contradictory statements do not carry equal weight.", notes: "Unconfirmed sources cannot approve on their own." },
  { id: 6, target: "panel-conflicts", title: "Conflict and gap detection", caption: "Contradictory requirements, missing owners, ambiguous values, stale rules, and incomplete evidence are detected before influencing Team Personas or decisions.", notes: "148 active conflicts across nine issue classes." },
  { id: 7, target: "panel-conflicts", title: "Conflict resolution", caption: "Human reviewers determine which condition is authoritative or preserve different rules for different environments, services, or effective periods.", notes: "Opens the side by side comparison." },
  { id: 8, target: "panel-reviews", title: "Human validation", caption: "High impact or uncertain conditions require accountable human validation.", notes: "427 reviews with priority, reviewer, and due date." },
  { id: 9, target: "panel-publishing", title: "Registry publishing", caption: "Approved, evidence linked, current, and conflict free conditions become reusable enterprise memory.", notes: "Nine destinations with access validation." },
  { id: 10, target: "panel-downstream", title: "Downstream readiness", caption: "These conditions provide the operating rules, priorities, dependencies, risks, and decision criteria used to construct Team Personas and evaluate change.", notes: "Hand off to Team Persona Construction." },
];

/* ---------------------------------------------------------- demo scenarios */

export type ScenarioId =
  | "healthy" | "high-volume" | "low-confidence" | "missing-owners" | "missing-evidence"
  | "authority-conflict" | "value-conflict" | "unit-mismatch" | "effective-date-conflict"
  | "stale" | "review-backlog" | "taxonomy-change" | "publishing-delay" | "paused"
  | "conflict-resolved" | "superseded" | "published" | "reset";

export interface Scenario {
  id: ScenarioId;
  label: string;
  serviceState: string;
  banner: string;
  kpi: { extracted: number; approved: number; jobs: string; quality: string; review: number; ready: number };
  conflicts: number;
  reviews: number;
  publishingState: string;
  activity: string;
  notification: string;
  operationalState: string;
}

const baseScenario = {
  serviceState: "Operational",
  kpi: { extracted: 94_812, approved: 87_442, jobs: "14", quality: "93/100", review: 427, ready: 82_906 },
  conflicts: 148, reviews: 427, publishingState: "Healthy", operationalState: "Healthy",
};

export const scenarios: Scenario[] = [
  { ...baseScenario, id: "healthy", label: "Healthy Extraction", banner: "All ten stages within SLA. Conflicts and review backlog at baseline.", activity: "Healthy extraction baseline restored", notification: "Extraction Completed" },
  { ...baseScenario, id: "high-volume", label: "High Candidate Volume", serviceState: "Extracting", kpi: { extracted: 128_440, approved: 91_204, jobs: "31", quality: "91/100", review: 612, ready: 84_118 }, conflicts: 186, reviews: 612, activity: "Candidate volume surge — 31 jobs running", notification: "Extraction Completed", operationalState: "Warning", banner: "Candidate volume 36 percent above baseline. Detection and classification queues growing." },
  { ...baseScenario, id: "low-confidence", label: "Low Confidence", serviceState: "Review Required", kpi: { extracted: 94_812, approved: 81_204, jobs: "14", quality: "86/100", review: 704, ready: 76_412 }, reviews: 704, activity: "Low confidence candidates increased to 318", notification: "Low Confidence", operationalState: "Review Required", banner: "318 candidates inferred from transcripts and chat fall below the confidence floor." },
  { ...baseScenario, id: "missing-owners", label: "Missing Owners", serviceState: "Backlogged", kpi: { extracted: 94_812, approved: 79_884, jobs: "14", quality: "88/100", review: 688, ready: 74_206 }, reviews: 688, activity: "Owner resolution backlog elevated to 412", notification: "Owner Missing", operationalState: "Warning", banner: "412 conditions cannot be approved until a canonical owning team is resolved." },
  { ...baseScenario, id: "missing-evidence", label: "Missing Evidence", serviceState: "Review Required", kpi: { extracted: 94_812, approved: 80_118, jobs: "14", quality: "87/100", review: 596, ready: 75_002 }, reviews: 596, activity: "Evidence linkage failures increased to 284", notification: "Evidence Missing", operationalState: "Review Required", banner: "284 conditions lack a direct evidence passage and are blocked from publication." },
  { ...baseScenario, id: "authority-conflict", label: "Authority Conflict", serviceState: "Review Required", kpi: { extracted: 94_812, approved: 84_112, jobs: "14", quality: "89/100", review: 512, ready: 78_884 }, conflicts: 214, reviews: 512, activity: "Authority conflicts increased to 96", notification: "Conflict Detected", operationalState: "Conflict", banner: "96 conditions carry contradictory statements from sources of different authority." },
  { ...baseScenario, id: "value-conflict", label: "Value Conflict", serviceState: "Review Required", kpi: { extracted: 94_812, approved: 83_804, jobs: "14", quality: "88/100", review: 548, ready: 78_112 }, conflicts: 236, reviews: 548, activity: "Value conflicts increased to 236", notification: "Conflict Detected", operationalState: "Conflict", banner: "236 same subject conditions disagree on threshold values." },
  { ...baseScenario, id: "unit-mismatch", label: "Unit Mismatch", serviceState: "Degraded", kpi: { extracted: 94_812, approved: 82_996, jobs: "14", quality: "85/100", review: 574, ready: 77_204 }, conflicts: 168, reviews: 574, activity: "Unit normalization failures increased to 142", notification: "Conflict Detected", operationalState: "Warning", banner: "142 conditions mix seconds and milliseconds on the same subject." },
  { ...baseScenario, id: "effective-date-conflict", label: "Effective Date Conflict", serviceState: "Review Required", kpi: { extracted: 94_812, approved: 84_442, jobs: "14", quality: "90/100", review: 498, ready: 79_118 }, conflicts: 182, reviews: 498, activity: "Effective date conflicts increased to 78", notification: "Conflict Detected", operationalState: "Conflict", banner: "78 rules overlap across effective periods including quarter end restrictions." },
  { ...baseScenario, id: "stale", label: "Stale Conditions", serviceState: "Degraded", kpi: { extracted: 94_812, approved: 85_004, jobs: "14", quality: "87/100", review: 486, ready: 76_884 }, activity: "Stale conditions increased to 1,204", notification: "Downstream Evaluation Requires Reassessment", operationalState: "Stale", banner: "1,204 conditions have not been reconfirmed against evidence in 180 days." },
  { ...baseScenario, id: "review-backlog", label: "Review Backlog", serviceState: "Backlogged", kpi: { extracted: 94_812, approved: 82_118, jobs: "14", quality: "88/100", review: 1_284, ready: 74_886 }, reviews: 1_284, activity: "Human review backlog increased to 1,284", notification: "Human Review Requested", operationalState: "Review Required", banner: "Human validation backlog exceeds the 24 hour service target." },
  { ...baseScenario, id: "taxonomy-change", label: "Taxonomy Version Change", serviceState: "Maintenance", kpi: { extracted: 94_812, approved: 84_886, jobs: "9", quality: "91/100", review: 512, ready: 78_442 }, activity: "Taxonomy v3.7 draft staged for reprocessing", notification: "Taxonomy Updated", operationalState: "Warning", banner: "Taxonomy v3.7 draft changes classification for 612 conditions. Reprocessing required." },
  { ...baseScenario, id: "publishing-delay", label: "Registry Publishing Delay", serviceState: "Degraded", publishingState: "Blocked", activity: "Registry publishing delayed by 45 minutes", notification: "Conditions Published", operationalState: "Publishing", banner: "MCP Context Services access revalidation is blocking two destinations." },
  { ...baseScenario, id: "paused", label: "Extraction Paused", serviceState: "Paused", kpi: { extracted: 94_812, approved: 87_442, jobs: "0", quality: "93/100", review: 427, ready: 82_906 }, publishingState: "Paused", activity: "Extraction paused for maintenance window", notification: "Extraction Failed", operationalState: "Paused", banner: "Extraction paused. Queues are draining and publishing is held." },
  { ...baseScenario, id: "conflict-resolved", label: "Conflict Resolved", kpi: { extracted: 94_812, approved: 88_204, jobs: "14", quality: "95/100", review: 386, ready: 84_118 }, conflicts: 112, reviews: 386, activity: "Identity latency conflict resolved in favour of the Primary source", notification: "Conflict Detected", operationalState: "Healthy", banner: "Conflict CFL-3302 resolved. Confidence and readiness recalculated." },
  { ...baseScenario, id: "superseded", label: "Condition Superseded", kpi: { extracted: 94_812, approved: 87_608, jobs: "14", quality: "94/100", review: 402, ready: 83_204 }, conflicts: 128, reviews: 402, activity: "COND-100432 superseded by COND-100422 v3.2", notification: "Condition Superseded", operationalState: "Superseded", banner: "Prior condition retained as historical. Point in time queries preserved." },
  { ...baseScenario, id: "published", label: "Condition Published", kpi: { extracted: 94_812, approved: 88_442, jobs: "14", quality: "96/100", review: 364, ready: 86_112 }, conflicts: 104, reviews: 364, publishingState: "Published", activity: "Approved conditions published to nine destinations", notification: "Conditions Published", operationalState: "Published", banner: "Approved conditions published. Downstream consumers notified." },
  { ...baseScenario, id: "reset", label: "Reset Demo Data", banner: "Demonstration data reset to the seeded baseline.", activity: "Demo data reset", notification: "Extraction Completed" },
];

export const scenarioById = (id: ScenarioId) => scenarios.find((s) => s.id === id) ?? scenarios[0];

/* -------------------------------------------------------------- search */

export interface GovernanceSearchResult {
  id: string; kind: string; statement: string; conditionType: string; domain: string;
  owner: string; authority: string; confidence: number; status: string; action: string;
}

export const governanceSearchExamples = [
  "Payments thresholds above 200 milliseconds",
  "Conditions owned by Security Engineering",
  "Unapproved retry requirements",
  "Stale SLOs",
  "Conflicting quarter end restrictions",
  "Conditions affecting Checkout",
  "Dependencies on Identity Services",
  "Conditions missing owners",
];

export const governanceSearchIndex: GovernanceSearchResult[] = [
  ...conditions.slice(0, 9).map((c: BusinessCondition) => ({
    id: c.id, kind: "Approved Condition", statement: c.conditionStatement, conditionType: c.conditionTypeId,
    domain: c.knowledgeDomains[0] ?? "Enterprise", owner: c.ownerTeamName, authority: c.authorityLevel,
    confidence: c.confidence, status: c.approvalState, action: "Open condition",
  })),
  { id: "JOB-4412", kind: "Extraction Job", statement: "Payments API Reliability Requirements extraction", conditionType: "Job", domain: "Payments and Reliability", owner: "Knowledge Operations", authority: "Primary", confidence: 97, status: "Running", action: "Open job" },
  { id: "CAND-2", kind: "Condition Candidate", statement: "Payments API P95 latency shall remain below 250 milliseconds", conditionType: "Performance Threshold", domain: "Payments and Checkout", owner: "Payments Platform", authority: "Primary", confidence: 97, status: "Suggested", action: "Open workbench" },
  { id: "Performance Threshold", kind: "Condition Type", statement: "Value triggering action, approval, risk, or escalation", conditionType: "Taxonomy", domain: "Taxonomy Governance", owner: "Taxonomy Governance", authority: "Primary", confidence: 100, status: "Active", action: "Open taxonomy" },
  { id: "TEAM-SEC", kind: "Team", statement: "Security Engineering", conditionType: "Team", domain: "Identity and Security", owner: "Security Engineering", authority: "Primary", confidence: 100, status: "Active", action: "Filter inventory" },
  { id: "SVC-Identity", kind: "Service", statement: "Identity Token Service", conditionType: "Service", domain: "Identity and Security", owner: "Identity Services", authority: "Primary", confidence: 100, status: "Active", action: "Open dependency graph" },
  { id: "DEP-2", kind: "Dependency", statement: "Payments API depends on Identity token validation", conditionType: "Dependency", domain: "Identity and Security", owner: "Identity Services", authority: "Primary", confidence: 95, status: "Active", action: "Open dependency graph" },
  { id: "RSK-14", kind: "Risk", statement: "Single region token vault creates a checkout availability risk", conditionType: "Risk", domain: "Identity and Security", owner: "Platform Architecture", authority: "Supporting", confidence: 89, status: "Open", action: "Open condition" },
  { id: "EVD-77120", kind: "Evidence", statement: "Payments API Reliability Requirements v3.2 § Performance Requirements", conditionType: "Evidence", domain: "Payments and Reliability", owner: "Knowledge Operations", authority: "Primary", confidence: 100, status: "Linked", action: "Open workbench" },
  { id: "CFL-3302", kind: "Conflict", statement: "Identity token validation 150 ms versus 200 ms", conditionType: "Performance Threshold", domain: "Identity and Security", owner: "Security Architecture", authority: "Mixed", confidence: 84, status: "Open", action: "Open conflict" },
  { id: "REV-2402", kind: "Review", statement: "Identity token validation threshold review", conditionType: "Conflict Resolution", domain: "Identity and Security", owner: "Security Architecture", authority: "Mixed", confidence: 84, status: "Open", action: "Open review" },
  { id: "VER-3.2", kind: "Version", statement: "COND-100422 version 3.2 — 300 ms to 250 ms", conditionType: "Performance Threshold", domain: "Payments and Checkout", owner: "Payments Platform", authority: "Primary", confidence: 97, status: "Current", action: "Open version history" },
  { id: "MET-error-rate", kind: "Metric", statement: "Payments API error rate", conditionType: "Baseline", domain: "Payments and Reliability", owner: "Payments Reliability", authority: "Primary", confidence: 96, status: "Current", action: "Open baseline model" },
  { id: "SYS-Payments", kind: "System", statement: "Payments platform", conditionType: "System", domain: "Payments and Reliability", owner: "Payments Platform", authority: "Primary", confidence: 100, status: "Active", action: "Filter inventory" },
  { id: "OWN-d.okafor", kind: "Owner", statement: "D. Okafor — Payments business owner", conditionType: "Owner", domain: "Payments and Reliability", owner: "Payments Reliability", authority: "Primary", confidence: 100, status: "Active", action: "Filter inventory" },
];

export function searchGovernance(query: string): GovernanceSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return governanceSearchIndex.slice(0, 12);
  const terms = q.split(/\s+/);
  return governanceSearchIndex
    .map((r) => {
      const hay = `${r.id} ${r.kind} ${r.statement} ${r.conditionType} ${r.domain} ${r.owner} ${r.authority} ${r.status}`.toLowerCase();
      const score = terms.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
      return { r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.r);
}

/* --------------------------------------------------------------- exports */

export const exportFormats = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot"] as const;
export type ExportFormat = (typeof exportFormats)[number];

export const exportScopes = [
  "Current View", "Selected Conditions", "Approved Conditions", "Review Required", "Conflicts",
  "Condition Taxonomy", "Evidence Mapping", "Downstream Readiness", "Full Conditions Registry Export",
];

export const exportOptions = [
  "Structured Fields", "Ownership", "Applicability", "Dependencies", "Risks", "Evidence References",
  "Confidence", "Authority", "Approvals", "Versions", "Conflicts", "Audit History",
];

export function buildExportRows(scope: string, rows: BusinessCondition[]): Record<string, string>[] {
  if (scope === "Condition Taxonomy") {
    return conditionTypeDefinitions.map((t) => ({
      id: t.id, name: t.name, definition: t.definition, status: t.status, version: t.version,
      requiredFields: t.requiredFields.join("; "), approvalRequirements: t.approvalRequirements,
    }));
  }
  if (scope === "Conflicts") {
    return conflictRows.map((c) => ({
      id: c.id, condition: c.condition, issueType: c.issueType, detail: c.detail, severity: c.severity,
      owner: c.owner, status: c.status, recommendedAction: c.recommendedAction,
    }));
  }
  if (scope === "Review Required") {
    return reviewsSeed.map((r) => ({
      id: r.id, conditionCandidate: r.conditionCandidate, reviewType: r.reviewType, reason: r.reason,
      priority: r.priority, assignedReviewer: r.assignedReviewer, dueDate: r.dueDate, status: r.status,
    }));
  }
  const source = scope === "Approved Conditions" ? rows.filter((r) => r.approvalState === "Approved") : rows;
  return source.map((c) => ({
    id: c.id, conditionStatement: c.conditionStatement, conditionType: c.conditionTypeId,
    subject: c.subjectName, operator: c.operator, value: c.value, unit: c.unit,
    owner: c.ownerTeamName, authority: c.authorityLevel, approvalState: c.approvalState,
    confidence: String(c.confidence), freshness: c.freshnessStatus, effectiveDate: c.effectiveDate,
    evidence: c.evidenceReferenceIds.join("; "),
  }));
}

export function toCsv(rows: Record<string, string>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

export function toYaml(rows: Record<string, string>[]): string {
  return rows
    .map((r) => "- " + Object.entries(r).map(([k, v]) => `${k}: ${JSON.stringify(v ?? "")}`).join("\n  "))
    .join("\n");
}

export function serializeExport(format: ExportFormat, rows: Record<string, string>[]): { text: string; mime: string; ext: string } {
  if (format === "CSV") return { text: toCsv(rows), mime: "text/csv", ext: "csv" };
  if (format === "YAML") return { text: toYaml(rows), mime: "text/yaml", ext: "yaml" };
  if (format === "JSON") return { text: JSON.stringify(rows, null, 2), mime: "application/json", ext: "json" };
  const title = format === "PDF Summary" ? "Business Condition Extraction — Summary" : "Business Condition Extraction — Presentation Snapshot";
  return {
    text: `${title}\n\nRecords: ${rows.length}\n\n` + rows.slice(0, 40).map((r) => Object.values(r).join(" · ")).join("\n"),
    mime: "text/plain", ext: "txt",
  };
}

export function downloadExport(name: string, format: ExportFormat, rows: Record<string, string>[]) {
  const { text, mime, ext } = serializeExport(format, rows);
  if (typeof document === "undefined") return text;
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = `${name}.${ext}`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return text;
}

/* -------------------------------------------------------- operational states */

export const operationalStates = [
  "Loading", "Empty", "Error", "Healthy", "Warning", "Blocked", "Conflict", "Review Required",
  "Stale", "Paused", "Publishing", "Published", "Superseded", "Historical",
] as const;
export type OperationalState = (typeof operationalStates)[number];

export const operationalStateCopy: Record<string, { title: string; detail: string }> = {
  Empty: { title: "No conditions match this view", detail: "Clear filters or start an extraction to populate the conditions inventory." },
  Error: { title: "Extraction telemetry unavailable", detail: "Retry the request. Seeded demonstration data remains available." },
  Conflict: { title: "Conflicting conditions detected", detail: "Contradictory rules would give Team Personas and impact evaluations incompatible operating constraints." },
  "Review Required": { title: "Human validation required", detail: "Assigned reviewer and due date are shown on each review record." },
  Stale: { title: "Evidence reconfirmation overdue", detail: "Last evidence update exceeds the 180 day freshness policy." },
  Paused: { title: "Extraction paused", detail: "Queues are draining. Publishing is held until extraction resumes." },
  Publishing: { title: "Publishing in progress", detail: "Records are being written to the selected destinations." },
  Published: { title: "Published to enterprise memory", detail: "Downstream consumers have been notified." },
  Superseded: { title: "Superseded by a newer condition", detail: "The prior record is retained for point in time queries." },
};
