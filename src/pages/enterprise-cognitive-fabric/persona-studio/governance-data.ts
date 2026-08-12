/**
 * Team Persona Construction — Prompt 2 governance data model.
 *
 * Extends the Prompt 1 construction model (see ./data.ts) with validation,
 * conflict resolution, approval, versioning, drift, publishing, readiness,
 * activity, coverage and demonstration scenarios. All data is deterministic
 * and local; no backend or external service is required.
 */

export type ComponentState =
  | "Loading" | "Empty" | "Error" | "Healthy" | "Warning" | "Blocked" | "Conflict"
  | "Review Required" | "Stale" | "Drift Detected" | "Approval in Progress"
  | "Approved" | "Publishing" | "Published" | "Paused";

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Materiality = "Material" | "Minor" | "Nonmaterial";

/* ------------------------------ review model ------------------------------ */

export type ReviewType =
  | "Team Owner Review" | "Dependency Conflict" | "Evidence Gap" | "Effective Rule Review"
  | "Dependency Owner Review" | "Governance Approval";

export type ReviewStatus = "Open" | "In Review" | "Changes Requested" | "Approved" | "Escalated" | "Overdue";

export interface PersonaReview {
  id: string;
  personaId: string;
  personaName: string;
  sectionId: string;
  sectionName: string;
  reviewType: ReviewType;
  reason: string;
  priority: Priority;
  assignedReviewer: string;
  reviewerRole: string;
  requiredApprovalLevel: string;
  dependencyTeamIds: string[];
  dependencyTeams: string[];
  dueDate: string;
  age: string;
  qualityImpact: number;
  downstreamImpact: string;
  status: ReviewStatus;
  decision: string | null;
  comments: string[];
  currentValue: string;
  proposedValue: string;
  mappedConditionIds: string[];
  evidencePassage: string;
  sourceAuthority: string;
  confidence: number;
  freshness: string;
  conflicts: string[];
  gaps: string[];
  affectedEvaluations: string[];
  createdAt: string;
  completedAt: string | null;
}

export const REVIEW_ACTIONS = [
  "Open Review", "Approve", "Request Changes", "Request Evidence",
  "Reassign", "Extend Due Date", "Escalate",
] as const;

export const REVIEW_DECISIONS = [
  "Approve Section", "Approve Persona", "Edit Section", "Request Correction",
  "Request Additional Evidence", "Exclude Condition", "Change Condition Mapping",
  "Assign Owner", "Resolve Conflict", "Mark Known Gap", "Approve with Exception",
  "Reject Persona", "Escalate to Governance",
] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

/** Decisions that cannot be recorded without a reviewer comment. */
export const COMMENT_REQUIRED_DECISIONS: ReviewDecision[] = [
  "Edit Section", "Request Correction", "Exclude Condition", "Change Condition Mapping",
  "Approve with Exception", "Reject Persona", "Escalate to Governance",
];

export const COMMENT_REQUIRED_REASONS: Record<string, string> = {
  "Edit Section": "Manual override of a generated Persona section",
  "Request Correction": "Correction changes the approved operating model",
  "Exclude Condition": "Condition exclusion removes approved evidence",
  "Change Condition Mapping": "Decision logic changes require justification",
  "Approve with Exception": "Approval with an unresolved gap or low authority evidence",
  "Reject Persona": "Rejection blocks downstream consumers",
  "Escalate to Governance": "Escalation changes the approval chain",
};

export const reviewSummary = [
  { id: "team-owner", label: "Awaiting Team Owner Review", value: 7 },
  { id: "dependency", label: "Awaiting Dependency Owner Review", value: 4 },
  { id: "governance", label: "Awaiting Governance Approval", value: 3 },
  { id: "conflict", label: "Conflict Reviews", value: 4 },
  { id: "evidence", label: "Evidence Gap Reviews", value: 5 },
  { id: "overdue", label: "Overdue Reviews", value: 2 },
];

export const personaReviews: PersonaReview[] = [
  {
    id: "PVR 3401",
    personaId: "PERSONA-1001",
    personaName: "Payments Platform",
    sectionId: "SEC-DECISION",
    sectionName: "Decision Rules and Approval Requirements",
    reviewType: "Team Owner Review",
    reason: "Validate decision logic and approval thresholds",
    priority: "High",
    assignedReviewer: "Jane Smith",
    reviewerRole: "Persona Owner",
    requiredApprovalLevel: "Team Owner",
    dependencyTeamIds: ["TEAM-FRAUD", "TEAM-SRE"],
    dependencyTeams: ["Fraud Engineering", "Site Reliability Engineering"],
    dueDate: "Today",
    age: "1d 4h",
    qualityImpact: 6,
    downstreamImpact: "24 active impact evaluations",
    status: "Open",
    decision: null,
    comments: [],
    currentValue: "Traffic changes above 10 percent require Payments Reliability and Fraud Engineering approval",
    proposedValue: "Traffic changes above 10 percent require Payments Reliability, Fraud Engineering and Site Reliability approval",
    mappedConditionIds: ["COND-100421", "COND-100448"],
    evidencePassage:
      "Any change affecting more than ten percent of production payment traffic shall be approved by Payments Reliability and Fraud Engineering before release.",
    sourceAuthority: "Primary",
    confidence: 94,
    freshness: "Current",
    conflicts: ["Approval Threshold Conflict with COND-100512"],
    gaps: [],
    affectedEvaluations: ["EVAL-8841", "EVAL-8846"],
    createdAt: "2026-08-05T09:10:00Z",
    completedAt: null,
  },
  {
    id: "PVR 3402",
    personaId: "PERSONA-1002",
    personaName: "Identity Engineering",
    sectionId: "SEC-SLA",
    sectionName: "Service Levels and Metrics",
    reviewType: "Dependency Conflict",
    reason: "Conflicting latency threshold and ownership records",
    priority: "Critical",
    assignedReviewer: "Security Architecture",
    reviewerRole: "Dependency Owner",
    requiredApprovalLevel: "Governance",
    dependencyTeamIds: ["TEAM-PAY", "TEAM-CHECKOUT"],
    dependencyTeams: ["Payments Platform", "Checkout Engineering"],
    dueDate: "Two hours",
    age: "6h",
    qualityImpact: 11,
    downstreamImpact: "Blocks 3 Persona publications",
    status: "In Review",
    decision: null,
    comments: [],
    currentValue: "Token validation completes below 150 milliseconds at the ninety fifth percentile",
    proposedValue: "Token validation completes below 200 milliseconds at the ninety fifth percentile",
    mappedConditionIds: ["COND-100510", "COND-100511"],
    evidencePassage:
      "Token validation shall complete in under 150 milliseconds measured at the regional edge for the ninety fifth percentile of requests.",
    sourceAuthority: "Primary and Supporting in conflict",
    confidence: 71,
    freshness: "Aging",
    conflicts: ["Value and Authority Conflict"],
    gaps: ["Owner of the supporting record is unassigned"],
    affectedEvaluations: ["EVAL-8842", "EVAL-8851", "EVAL-8853"],
    createdAt: "2026-08-06T04:00:00Z",
    completedAt: null,
  },
  {
    id: "PVR 3403",
    personaId: "PERSONA-1004",
    personaName: "Customer Support Operations",
    sectionId: "SEC-ESCALATION",
    sectionName: "Escalation Philosophy",
    reviewType: "Evidence Gap",
    reason: "Escalation philosophy lacks approved supporting evidence",
    priority: "Medium",
    assignedReviewer: "Customer Support Leadership",
    reviewerRole: "Team Owner",
    requiredApprovalLevel: "Team Owner",
    dependencyTeamIds: ["TEAM-PAY"],
    dependencyTeams: ["Payments Platform"],
    dueDate: "Tomorrow",
    age: "2d",
    qualityImpact: 4,
    downstreamImpact: "Cognitive Intake applicability scoring reduced",
    status: "Open",
    decision: null,
    comments: [],
    currentValue: "Escalate to duty manager when customer impact exceeds thirty minutes",
    proposedValue: "Escalate to duty manager when customer impact exceeds fifteen minutes",
    mappedConditionIds: ["COND-100604"],
    evidencePassage:
      "Support escalation guidance is described in the operations handbook but has not been approved as a business condition.",
    sourceAuthority: "Unconfirmed",
    confidence: 58,
    freshness: "Stale",
    conflicts: [],
    gaps: ["No approved condition supports the escalation threshold"],
    affectedEvaluations: ["EVAL-8860"],
    createdAt: "2026-08-04T11:00:00Z",
    completedAt: null,
  },
  {
    id: "PVR 3404",
    personaId: "PERSONA-1005",
    personaName: "Release Governance",
    sectionId: "SEC-CONSTRAINTS",
    sectionName: "Constraints and Change Restrictions",
    reviewType: "Effective Rule Review",
    reason: "Three day and five day quarter end restrictions conflict",
    priority: "High",
    assignedReviewer: "Engineering Governance",
    reviewerRole: "Governance Approver",
    requiredApprovalLevel: "Governance",
    dependencyTeamIds: ["TEAM-PAY", "TEAM-CHECKOUT", "TEAM-SRE"],
    dependencyTeams: ["Payments Platform", "Checkout Engineering", "Site Reliability Engineering"],
    dueDate: "Today",
    age: "3d 2h",
    qualityImpact: 7,
    downstreamImpact: "Change calendar guidance for 61 personas",
    status: "Overdue",
    decision: null,
    comments: [],
    currentValue: "No deployment during the final three business days of the quarter",
    proposedValue: "No deployment during the final five business days of the quarter",
    mappedConditionIds: ["COND-100701", "COND-100702"],
    evidencePassage:
      "Production change is restricted during the final five business days of each fiscal quarter for revenue impacting services.",
    sourceAuthority: "Primary",
    confidence: 88,
    freshness: "Current",
    conflicts: ["Effective Rule Conflict"],
    gaps: [],
    affectedEvaluations: ["EVAL-8870", "EVAL-8871"],
    createdAt: "2026-08-03T08:30:00Z",
    completedAt: null,
  },
];

/* ----------------------------- conflict model ----------------------------- */

export type ConflictType =
  | "Approval Threshold Conflict" | "Value and Authority Conflict" | "Effective Rule Conflict"
  | "Ownership Conflict" | "Applicability Conflict";

export type ConflictStatus = "Open" | "In Review" | "Escalated" | "Resolved";

export interface ConflictSide {
  statement: string;
  personaSection: string;
  sourceConditionId: string;
  sourceArtifact: string;
  evidencePassage: string;
  authority: string;
  owner: string;
  confidence: number;
  freshness: string;
  effectiveDate: string;
  applicableTeams: string;
  applicableServices: string;
  environment: string;
  downstreamConsumers: string;
  currentPersonaUse: string;
}

export interface PersonaConflict {
  id: string;
  personaId: string;
  personaName: string;
  sectionId: string;
  sectionName: string;
  conditionAId: string;
  conditionBId: string;
  relationshipAId: string | null;
  relationshipBId: string | null;
  conflictType: ConflictType;
  severity: Priority;
  authorityA: string;
  authorityB: string;
  confidenceA: number;
  confidenceB: number;
  applicabilityConflict: boolean;
  effectiveDateConflict: boolean;
  affectedTeamIds: string[];
  affectedTeams: string;
  affectedEvaluationIds: string[];
  businessImpact: string;
  recommendedResolution: string;
  assignedReviewer: string;
  reviewStatus: ConflictStatus;
  resolution: string | null;
  owner: string;
  createdAt: string;
  resolvedAt: string | null;
  a: ConflictSide;
  b: ConflictSide;
}

export const conflictSummary = [
  { id: "dependency", label: "Active Dependency Conflicts", value: 4 },
  { id: "rules", label: "Conflicting Decision Rules", value: 3 },
  { id: "owners", label: "Missing Owners", value: 3 },
  { id: "evidence", label: "Missing Evidence", value: 5 },
  { id: "stale", label: "Stale Conditions", value: 12 },
  { id: "controls", label: "Incomplete Risk Controls", value: 7 },
  { id: "consumers", label: "Missing Downstream Consumers", value: 5 },
  { id: "authority", label: "Authority Conflicts", value: 2 },
  { id: "applicability", label: "Applicability Conflicts", value: 4 },
];

export const CONFLICT_ACTIONS = [
  "Open Comparison", "Select Authoritative Record", "Merge", "Define Applicability",
  "Define Effective Period", "Mark Historical", "Request Clarification", "Assign Review", "Resolve",
] as const;

export const RESOLUTION_CHOICES = [
  "Select A", "Select B", "Merge",
  "Keep Both for Different Environments", "Keep Both for Different Services",
  "Keep Both for Different Effective Periods", "Mark One Historical", "Mark One Supporting",
  "Remove Both and Request Evidence", "Escalate to Governance",
] as const;
export type ResolutionChoice = (typeof RESOLUTION_CHOICES)[number];

export const personaConflicts: PersonaConflict[] = [
  {
    id: "PCF-5101",
    personaId: "PERSONA-1001",
    personaName: "Payments Platform",
    sectionId: "SEC-APPROVAL",
    sectionName: "Approval Requirements",
    conditionAId: "COND-100421",
    conditionBId: "COND-100512",
    relationshipAId: "REL-2201",
    relationshipBId: "REL-2214",
    conflictType: "Approval Threshold Conflict",
    severity: "High",
    authorityA: "Primary",
    authorityB: "Supporting",
    confidenceA: 94,
    confidenceB: 79,
    applicabilityConflict: false,
    effectiveDateConflict: false,
    affectedTeamIds: ["TEAM-PAY", "TEAM-FRAUD"],
    affectedTeams: "Payments Platform, Fraud Engineering",
    affectedEvaluationIds: ["EVAL-8841", "EVAL-8846"],
    businessImpact: "Change approval routing for high traffic payment releases is ambiguous",
    recommendedResolution: "Select the primary authority record and mark the supporting record historical",
    assignedReviewer: "Jane Smith",
    reviewStatus: "Open",
    resolution: null,
    owner: "Payments Reliability",
    createdAt: "2026-08-05T09:14:00Z",
    resolvedAt: null,
    a: {
      statement: "More than 10 percent traffic requires Payments Reliability and Fraud Engineering approval",
      personaSection: "Approval Requirements",
      sourceConditionId: "COND-100421",
      sourceArtifact: "Payments Change Management Standard v6.2",
      evidencePassage:
        "Any change affecting more than ten percent of production payment traffic shall be approved by Payments Reliability and Fraud Engineering.",
      authority: "Primary",
      owner: "Payments Reliability",
      confidence: 94,
      freshness: "Current",
      effectiveDate: "2026-04-01",
      applicableTeams: "Payments Platform, Checkout Engineering",
      applicableServices: "Payments API, Retry Orchestrator",
      environment: "Production",
      downstreamConsumers: "Impact Analysis, Decision Intelligence",
      currentPersonaUse: "Approval Requirements, Decision Rules",
    },
    b: {
      statement: "More than 20 percent traffic requires Payments Platform approval only",
      personaSection: "Approval Requirements",
      sourceConditionId: "COND-100512",
      sourceArtifact: "Payments Release Playbook 2025",
      evidencePassage:
        "Releases affecting more than twenty percent of traffic require Payments Platform approval prior to deployment.",
      authority: "Supporting",
      owner: "Unassigned",
      confidence: 79,
      freshness: "Aging",
      effectiveDate: "2025-07-01",
      applicableTeams: "Payments Platform",
      applicableServices: "Payments API",
      environment: "Production",
      downstreamConsumers: "Cognitive Search",
      currentPersonaUse: "Approval Requirements",
    },
  },
  {
    id: "PCF-5102",
    personaId: "PERSONA-1002",
    personaName: "Identity Engineering",
    sectionId: "SEC-SLA",
    sectionName: "Service Levels",
    conditionAId: "COND-100510",
    conditionBId: "COND-100511",
    relationshipAId: null,
    relationshipBId: null,
    conflictType: "Value and Authority Conflict",
    severity: "Critical",
    authorityA: "Primary",
    authorityB: "Primary",
    confidenceA: 91,
    confidenceB: 88,
    applicabilityConflict: true,
    effectiveDateConflict: false,
    affectedTeamIds: ["TEAM-ID", "TEAM-PAY", "TEAM-CHECKOUT"],
    affectedTeams: "Identity Engineering, Payments Platform, Checkout Engineering",
    affectedEvaluationIds: ["EVAL-8842", "EVAL-8851", "EVAL-8853"],
    businessImpact: "Dependent teams cannot agree the identity latency budget used in impact analysis",
    recommendedResolution: "Keep both records with environment specific applicability",
    assignedReviewer: "Security Architecture",
    reviewStatus: "In Review",
    resolution: null,
    owner: "Identity Platform",
    createdAt: "2026-08-06T04:02:00Z",
    resolvedAt: null,
    a: {
      statement: "Token validation below 150 milliseconds",
      personaSection: "Service Levels",
      sourceConditionId: "COND-100510",
      sourceArtifact: "Identity Service Level Definition v3.0",
      evidencePassage: "Token validation shall complete in under 150 milliseconds at the ninety fifth percentile.",
      authority: "Primary",
      owner: "Identity Platform",
      confidence: 91,
      freshness: "Current",
      effectiveDate: "2026-01-01",
      applicableTeams: "Identity Engineering",
      applicableServices: "Token Service",
      environment: "Production",
      downstreamConsumers: "Impact Analysis, Context Graph",
      currentPersonaUse: "Service Levels, Dependencies",
    },
    b: {
      statement: "Token validation below 200 milliseconds",
      personaSection: "Service Levels",
      sourceConditionId: "COND-100511",
      sourceArtifact: "Regional Identity Operations Addendum",
      evidencePassage: "Regional deployments shall validate tokens in under 200 milliseconds during failover conditions.",
      authority: "Primary",
      owner: "Regional Identity Operations",
      confidence: 88,
      freshness: "Current",
      effectiveDate: "2026-05-15",
      applicableTeams: "Identity Engineering, Regional Operations",
      applicableServices: "Regional Token Vault",
      environment: "Regional failover",
      downstreamConsumers: "Decision Intelligence",
      currentPersonaUse: "Service Levels",
    },
  },
  {
    id: "PCF-5103",
    personaId: "PERSONA-1005",
    personaName: "Release Governance",
    sectionId: "SEC-CONSTRAINTS",
    sectionName: "Change Restrictions",
    conditionAId: "COND-100701",
    conditionBId: "COND-100702",
    relationshipAId: null,
    relationshipBId: null,
    conflictType: "Effective Rule Conflict",
    severity: "High",
    authorityA: "Primary",
    authorityB: "Primary",
    confidenceA: 86,
    confidenceB: 90,
    applicabilityConflict: false,
    effectiveDateConflict: true,
    affectedTeamIds: ["TEAM-PAY", "TEAM-CHECKOUT", "TEAM-SRE"],
    affectedTeams: "Payments Platform, Checkout Engineering, Site Reliability Engineering",
    affectedEvaluationIds: ["EVAL-8870", "EVAL-8871"],
    businessImpact: "Quarter end change freeze guidance differs by two business days across 61 personas",
    recommendedResolution: "Keep both records for different effective periods",
    assignedReviewer: "Engineering Governance",
    reviewStatus: "Open",
    resolution: null,
    owner: "Release Governance",
    createdAt: "2026-08-03T08:34:00Z",
    resolvedAt: null,
    a: {
      statement: "No deployment during final three business days",
      personaSection: "Change Restrictions",
      sourceConditionId: "COND-100701",
      sourceArtifact: "Enterprise Change Calendar 2025",
      evidencePassage: "Production change is restricted during the final three business days of each fiscal quarter.",
      authority: "Primary",
      owner: "Release Governance",
      confidence: 86,
      freshness: "Aging",
      effectiveDate: "2025-01-01",
      applicableTeams: "All engineering teams",
      applicableServices: "All revenue services",
      environment: "Production",
      downstreamConsumers: "Cognitive Intake, Decision Intelligence",
      currentPersonaUse: "Constraints, Decision Rules",
    },
    b: {
      statement: "No deployment during final five business days",
      personaSection: "Change Restrictions",
      sourceConditionId: "COND-100702",
      sourceArtifact: "Enterprise Change Calendar 2026",
      evidencePassage: "Production change is restricted during the final five business days of each fiscal quarter for revenue impacting services.",
      authority: "Primary",
      owner: "Release Governance",
      confidence: 90,
      freshness: "Current",
      effectiveDate: "2026-01-01",
      applicableTeams: "All engineering teams",
      applicableServices: "Revenue impacting services",
      environment: "Production",
      downstreamConsumers: "Cognitive Intake, Decision Intelligence",
      currentPersonaUse: "Constraints",
    },
  },
  {
    id: "PCF-5104",
    personaId: "PERSONA-1003",
    personaName: "Checkout Engineering",
    sectionId: "SEC-DEPENDENCIES",
    sectionName: "Dependencies",
    conditionAId: "COND-100811",
    conditionBId: "COND-100812",
    relationshipAId: "REL-2260",
    relationshipBId: "REL-2261",
    conflictType: "Ownership Conflict",
    severity: "Medium",
    authorityA: "Primary",
    authorityB: "Unconfirmed",
    confidenceA: 83,
    confidenceB: 61,
    applicabilityConflict: false,
    effectiveDateConflict: false,
    affectedTeamIds: ["TEAM-CHECKOUT", "TEAM-PAY"],
    affectedTeams: "Checkout Engineering, Payments Platform",
    affectedEvaluationIds: ["EVAL-8880"],
    businessImpact: "Retry orchestration ownership is claimed by two teams",
    recommendedResolution: "Assign a single accountable owner and request clarification",
    assignedReviewer: "Commerce Architecture Council",
    reviewStatus: "Open",
    resolution: null,
    owner: "Unassigned",
    createdAt: "2026-08-05T15:22:00Z",
    resolvedAt: null,
    a: {
      statement: "Retry Orchestrator is owned by Payments Platform",
      personaSection: "Dependencies",
      sourceConditionId: "COND-100811",
      sourceArtifact: "Service Ownership Register",
      evidencePassage: "Retry Orchestrator is registered to the Payments Platform team.",
      authority: "Primary",
      owner: "Payments Platform",
      confidence: 83,
      freshness: "Current",
      effectiveDate: "2026-02-01",
      applicableTeams: "Payments Platform",
      applicableServices: "Retry Orchestrator",
      environment: "Production",
      downstreamConsumers: "Context Graph",
      currentPersonaUse: "Dependencies",
    },
    b: {
      statement: "Retry Orchestrator is owned by Checkout Engineering",
      personaSection: "Dependencies",
      sourceConditionId: "COND-100812",
      sourceArtifact: "Checkout Runbook",
      evidencePassage: "Checkout Engineering operates and releases the retry orchestration component.",
      authority: "Unconfirmed",
      owner: "Unassigned",
      confidence: 61,
      freshness: "Aging",
      effectiveDate: "2025-11-01",
      applicableTeams: "Checkout Engineering",
      applicableServices: "Retry Orchestrator",
      environment: "Production",
      downstreamConsumers: "Cognitive Search",
      currentPersonaUse: "Dependencies",
    },
  },
];

/* ----------------------------- approval model ----------------------------- */

export const APPROVAL_STAGES = [
  "Draft Complete", "Persona Owner Review", "Team Owner Approval",
  "Dependency Owner Review", "Governance Review", "Approved", "Published",
] as const;
export type ApprovalStage = (typeof APPROVAL_STAGES)[number];

export type ApprovalStatus = "Not Started" | "In Progress" | "Approved" | "Approved with Conditions" | "Changes Requested" | "Rejected";

export interface PersonaApproval {
  id: string;
  personaId: string;
  personaVersionId: string;
  approvalStage: ApprovalStage;
  approverId: string;
  approverRole: string;
  status: ApprovalStatus;
  decision: string | null;
  comments: string[];
  submittedAt: string | null;
  completedAt: string | null;
}

export const approvalRequirementDrivers = [
  { key: "criticality", label: "Persona criticality", value: "Tier 1 revenue critical", requires: "Governance Review" },
  { key: "access", label: "Access classification", value: "Internal Restricted", requires: "Access policy validation" },
  { key: "dependencies", label: "Dependency teams", value: "5 teams", requires: "Dependency Owner Review" },
  { key: "regulatory", label: "Regulatory scope", value: "PCI DSS in scope", requires: "Governance Review" },
  { key: "customer", label: "Customer impact", value: "Direct customer payment flows", requires: "Team Owner Approval" },
  { key: "risk", label: "Risk level", value: "High", requires: "Reliability Reviewer" },
  { key: "authority", label: "Condition authority", value: "Primary with 2 supporting", requires: "Persona Owner Review" },
  { key: "exceptions", label: "Unresolved exceptions", value: "1 open", requires: "Approval with Conditions" },
];

export const paymentsApprovalChain: PersonaApproval[] = [
  { id: "APR-7001", personaId: "PERSONA-1001", personaVersionId: "PV-34", approvalStage: "Draft Complete", approverId: "system", approverRole: "Construction Service", status: "Approved", decision: "Draft assembled", comments: [], submittedAt: "2026-08-06T09:40:00Z", completedAt: "2026-08-06T09:42:00Z" },
  { id: "APR-7002", personaId: "PERSONA-1001", personaVersionId: "PV-34", approvalStage: "Persona Owner Review", approverId: "Jane Smith", approverRole: "Persona Owner", status: "In Progress", decision: null, comments: [], submittedAt: "2026-08-06T10:22:00Z", completedAt: null },
  { id: "APR-7003", personaId: "PERSONA-1001", personaVersionId: "PV-34", approvalStage: "Team Owner Approval", approverId: "Payments Engineering Director", approverRole: "Team Owner", status: "Not Started", decision: null, comments: [], submittedAt: null, completedAt: null },
  { id: "APR-7004", personaId: "PERSONA-1001", personaVersionId: "PV-34", approvalStage: "Dependency Owner Review", approverId: "Fraud Engineering, Identity Engineering", approverRole: "Dependency Reviewers", status: "Not Started", decision: null, comments: [], submittedAt: null, completedAt: null },
  { id: "APR-7005", personaId: "PERSONA-1001", personaVersionId: "PV-34", approvalStage: "Governance Review", approverId: "Commerce Architecture Council", approverRole: "Governance Approver", status: "Not Started", decision: null, comments: [], submittedAt: null, completedAt: null },
  { id: "APR-7006", personaId: "PERSONA-1001", personaVersionId: "PV-34", approvalStage: "Approved", approverId: "—", approverRole: "Approval Service", status: "Not Started", decision: null, comments: [], submittedAt: null, completedAt: null },
  { id: "APR-7007", personaId: "PERSONA-1001", personaVersionId: "PV-34", approvalStage: "Published", approverId: "—", approverRole: "Publishing Service", status: "Not Started", decision: null, comments: [], submittedAt: null, completedAt: null },
];

export const reliabilityReviewer = { role: "Reliability Reviewer", name: "Site Reliability Engineering" };

export const APPROVAL_ACTIONS = [
  "Submit for Review", "Approve", "Approve with Conditions", "Request Changes", "Reject", "Withdraw",
] as const;

/* ------------------------------ version model ----------------------------- */

export type VersionStatus = "Draft" | "Published" | "Superseded" | "Historical";

export interface PersonaVersion {
  id: string;
  personaId: string;
  version: string;
  previousVersionId: string | null;
  status: VersionStatus;
  changeReason: string;
  createdAt: string;
  effectiveDate: string;
  expirationDate: string;
  qualityScore: number;
  completenessScore: number;
  confidence: number;
  conditionsAdded: number;
  conditionsRemoved: number;
  relationshipsChanged: number;
  sectionsChanged: number;
  decisionLogicChanged: boolean;
  risksChanged: boolean;
  evidenceChanged: boolean;
  createdBy: string;
  approvedBy: string;
  publishedAt: string | null;
}

export const personaVersions: PersonaVersion[] = [
  {
    id: "PV-34", personaId: "PERSONA-1001", version: "3.4", previousVersionId: "PV-33", status: "Draft",
    changeReason: "Retry approval threshold and quarter end restriction updated",
    createdAt: "Today", effectiveDate: "Pending approval", expirationDate: "—",
    qualityScore: 92, completenessScore: 91, confidence: 89,
    conditionsAdded: 6, conditionsRemoved: 2, relationshipsChanged: 4, sectionsChanged: 5,
    decisionLogicChanged: true, risksChanged: true, evidenceChanged: true,
    createdBy: "Jane Smith", approvedBy: "—", publishedAt: null,
  },
  {
    id: "PV-33", personaId: "PERSONA-1001", version: "3.3", previousVersionId: "PV-32", status: "Published",
    changeReason: "Fraud dependency and idempotency controls added",
    createdAt: "Previous month", effectiveDate: "Previous month", expirationDate: "—",
    qualityScore: 94, completenessScore: 93, confidence: 92,
    conditionsAdded: 11, conditionsRemoved: 1, relationshipsChanged: 7, sectionsChanged: 8,
    decisionLogicChanged: true, risksChanged: true, evidenceChanged: true,
    createdBy: "Jane Smith", approvedBy: "Commerce Architecture Council", publishedAt: "Previous month",
  },
  {
    id: "PV-32", personaId: "PERSONA-1001", version: "3.2", previousVersionId: "PV-31", status: "Superseded",
    changeReason: "Regional availability objectives revised",
    createdAt: "Previous quarter", effectiveDate: "Previous quarter", expirationDate: "Previous month",
    qualityScore: 90, completenessScore: 88, confidence: 88,
    conditionsAdded: 8, conditionsRemoved: 3, relationshipsChanged: 5, sectionsChanged: 6,
    decisionLogicChanged: false, risksChanged: true, evidenceChanged: true,
    createdBy: "Persona Construction Service", approvedBy: "Payments Engineering Director", publishedAt: "Previous quarter",
  },
  {
    id: "PV-31", personaId: "PERSONA-1001", version: "3.1", previousVersionId: null, status: "Historical",
    changeReason: "Initial governed Persona baseline",
    createdAt: "Previous year", effectiveDate: "Previous year", expirationDate: "Previous quarter",
    qualityScore: 84, completenessScore: 80, confidence: 81,
    conditionsAdded: 214, conditionsRemoved: 0, relationshipsChanged: 21, sectionsChanged: 43,
    decisionLogicChanged: true, risksChanged: true, evidenceChanged: true,
    createdBy: "Persona Construction Service", approvedBy: "Commerce Architecture Council", publishedAt: "Previous year",
  },
];

export const VERSION_ACTIONS = ["View Version", "Compare", "Restore as Draft", "Mark Historical", "Export"] as const;

export interface VersionDiffRow {
  dimension: string;
  a: string;
  b: string;
  change: "Added" | "Removed" | "Changed" | "Unchanged";
  downstreamImpact: string;
}

export const versionDiff: VersionDiffRow[] = [
  { dimension: "Mission", a: "Enable reliable, secure, low friction payment processing", b: "Enable reliable, secure, low friction payment processing for every checkout transaction", change: "Changed", downstreamImpact: "Cognitive Search summary refreshed" },
  { dimension: "Capabilities", a: "Payment authorization, routing, settlement", b: "Payment authorization, routing, settlement, retry orchestration", change: "Added", downstreamImpact: "2 impact evaluations reassessed" },
  { dimension: "Products and services", a: "Payments API, Settlement Service", b: "Payments API, Settlement Service, Retry Orchestrator", change: "Added", downstreamImpact: "Context Graph nodes added" },
  { dimension: "Customers", a: "Checkout Engineering, Finance Operations", b: "Checkout Engineering, Finance Operations, Merchant Services", change: "Added", downstreamImpact: "Applicability scoring widened" },
  { dimension: "Objectives", a: "99.95 percent availability", b: "99.95 percent availability and duplicate rate below 0.01 percent", change: "Changed", downstreamImpact: "Decision Intelligence thresholds updated" },
  { dimension: "Metrics", a: "Availability, latency", b: "Availability, latency, duplicate transaction rate", change: "Added", downstreamImpact: "Metric mapping refreshed" },
  { dimension: "Constraints", a: "No deployment final three business days", b: "No deployment final five business days", change: "Changed", downstreamImpact: "Change calendar guidance updated" },
  { dimension: "Dependencies", a: "Identity Services, Fraud Decision Service", b: "Identity Services, Fraud Decision Service, Regional Token Vault", change: "Added", downstreamImpact: "Cross Team Impact Matrix updated" },
  { dimension: "Risks", a: "Duplicate transactions, regional failover", b: "Duplicate transactions, regional failover, fraud loss exposure", change: "Added", downstreamImpact: "Risk register synchronised" },
  { dimension: "Controls", a: "Idempotency keys", b: "Idempotency keys, retry budget ceiling", change: "Added", downstreamImpact: "Control coverage recalculated" },
  { dimension: "Decision priorities", a: "Availability before latency", b: "Correctness before availability before latency", change: "Changed", downstreamImpact: "Decision rules recompiled" },
  { dimension: "Tradeoffs", a: "Accept latency for correctness", b: "Accept latency for correctness and fraud containment", change: "Changed", downstreamImpact: "Tradeoff guidance refreshed" },
  { dimension: "Preferred evidence", a: "Production telemetry", b: "Production telemetry and idempotency test results", change: "Changed", downstreamImpact: "Evidence preferences updated" },
  { dimension: "Escalation philosophy", a: "Escalate on customer impact", b: "Escalate on customer impact within fifteen minutes", change: "Changed", downstreamImpact: "Escalation routing updated" },
  { dimension: "Risk appetite", a: "Low for correctness, moderate for latency", b: "Very low for correctness, moderate for latency", change: "Changed", downstreamImpact: "Risk appetite propagated" },
  { dimension: "Condition mappings", a: "208 conditions", b: "212 conditions", change: "Changed", downstreamImpact: "Mapping index rebuilt" },
  { dimension: "Evidence", a: "1,204 references", b: "1,286 references", change: "Changed", downstreamImpact: "Evidence index rebuilt" },
  { dimension: "Owners", a: "Jane Smith", b: "Jane Smith", change: "Unchanged", downstreamImpact: "—" },
  { dimension: "Effective dates", a: "Previous month", b: "Pending approval", change: "Changed", downstreamImpact: "Effective period recalculated" },
  { dimension: "Quality", a: "94", b: "92", change: "Changed", downstreamImpact: "Portfolio quality recalculated" },
  { dimension: "Completeness", a: "93", b: "91", change: "Changed", downstreamImpact: "Readiness recalculated" },
  { dimension: "Confidence", a: "92", b: "89", change: "Changed", downstreamImpact: "Confidence banding updated" },
];

/* ------------------------------- drift model ------------------------------ */

export type DriftType =
  | "Condition Changed" | "Source Authority Changed" | "Owner Changed" | "Dependency Changed"
  | "Service Added" | "Service Retired" | "Metric Changed" | "Threshold Changed"
  | "Policy Changed" | "Customer Journey Changed" | "Access Classification Changed";

export const DRIFT_TYPES: DriftType[] = [
  "Condition Changed", "Source Authority Changed", "Owner Changed", "Dependency Changed",
  "Service Added", "Service Retired", "Metric Changed", "Threshold Changed",
  "Policy Changed", "Customer Journey Changed", "Access Classification Changed",
];

export interface PersonaDrift {
  id: string;
  personaId: string;
  personaName: string;
  driftType: DriftType;
  changedRecordType: string;
  changedRecordId: string;
  previousValue: string;
  currentValue: string;
  materiality: Materiality;
  affectedSectionIds: string[];
  affectedSections: string;
  affectedEvaluationIds: string[];
  affectedDecisionIds: string[];
  downstreamImpact: string;
  detectedAt: string;
  status: "Detected" | "Under Review" | "Accepted" | "Dismissed" | "Refreshed";
  recommendedAction: string;
}

export const driftSummary = [
  { id: "current", label: "Current Personas", value: 61 },
  { id: "source", label: "Personas with Source Changes", value: 8 },
  { id: "material", label: "Material Drift Detected", value: 3 },
  { id: "minor", label: "Minor Drift Detected", value: 5 },
  { id: "stale", label: "Stale Personas", value: 2 },
  { id: "reassess", label: "Impact Evaluations Requiring Reassessment", value: 4 },
];

export const personaDrift: PersonaDrift[] = [
  {
    id: "DRF-9001", personaId: "PERSONA-1001", personaName: "Payments Platform",
    driftType: "Threshold Changed", changedRecordType: "Business Condition", changedRecordId: "COND-100702",
    previousValue: "Final three business days", currentValue: "Final five business days",
    materiality: "Material", affectedSectionIds: ["SEC-CONSTRAINTS", "SEC-DECISION"],
    affectedSections: "Constraints, Decision Rules",
    affectedEvaluationIds: ["EVAL-8870", "EVAL-8871"], affectedDecisionIds: ["DEC-4412"],
    downstreamImpact: "2 impact evaluations require reassessment",
    detectedAt: "09:58 AM", status: "Detected", recommendedAction: "Refresh Persona and create a draft version",
  },
  {
    id: "DRF-9002", personaId: "PERSONA-1002", personaName: "Identity Engineering",
    driftType: "Source Authority Changed", changedRecordType: "Source Artifact", changedRecordId: "ART-3320",
    previousValue: "Supporting authority", currentValue: "Primary authority",
    materiality: "Material", affectedSectionIds: ["SEC-SLA"], affectedSections: "Service Levels",
    affectedEvaluationIds: ["EVAL-8842"], affectedDecisionIds: ["DEC-4420"],
    downstreamImpact: "Latency budget conflict escalated",
    detectedAt: "09:41 AM", status: "Under Review", recommendedAction: "Open comparison and resolve the authority conflict",
  },
  {
    id: "DRF-9003", personaId: "PERSONA-1003", personaName: "Checkout Engineering",
    driftType: "Service Added", changedRecordType: "Service Registry", changedRecordId: "SVC-771",
    previousValue: "—", currentValue: "Retry Orchestrator",
    materiality: "Minor", affectedSectionIds: ["SEC-SERVICES", "SEC-DEPENDENCIES"],
    affectedSections: "Products and Services, Dependencies",
    affectedEvaluationIds: ["EVAL-8880"], affectedDecisionIds: [],
    downstreamImpact: "Context Graph relationships added",
    detectedAt: "09:22 AM", status: "Detected", recommendedAction: "Accept update",
  },
  {
    id: "DRF-9004", personaId: "PERSONA-1004", personaName: "Customer Support Operations",
    driftType: "Owner Changed", changedRecordType: "Ownership Register", changedRecordId: "OWN-118",
    previousValue: "Support Operations Manager", currentValue: "Customer Support Leadership",
    materiality: "Minor", affectedSectionIds: ["SEC-ESCALATION"], affectedSections: "Escalation Philosophy",
    affectedEvaluationIds: [], affectedDecisionIds: [],
    downstreamImpact: "Review routing updated",
    detectedAt: "08:55 AM", status: "Accepted", recommendedAction: "Dismiss as nonmaterial",
  },
  {
    id: "DRF-9005", personaId: "PERSONA-1005", personaName: "Release Governance",
    driftType: "Policy Changed", changedRecordType: "Policy", changedRecordId: "POL-2026-04",
    previousValue: "Quarterly freeze guidance 2025", currentValue: "Quarterly freeze guidance 2026",
    materiality: "Material", affectedSectionIds: ["SEC-CONSTRAINTS"], affectedSections: "Constraints",
    affectedEvaluationIds: ["EVAL-8871"], affectedDecisionIds: ["DEC-4430"],
    downstreamImpact: "Change calendar guidance for 61 personas",
    detectedAt: "08:30 AM", status: "Refreshed", recommendedAction: "Create draft version",
  },
];

export const DRIFT_ACTIONS = [
  "Open Comparison", "Accept Update", "Refresh Persona", "Create Draft Version",
  "Dismiss as Nonmaterial", "Request Review",
] as const;

/* ---------------------------- refresh workflow ---------------------------- */

export const REFRESH_SCOPES = [
  "All Changed Conditions", "Selected Conditions", "Relationships Only",
  "Ownership Only", "Evidence Only", "Full Persona Rebuild",
];

export const REFRESH_RULES = [
  "Preserve approved manual edits", "Preserve known exceptions", "Reevaluate conflicts",
  "Recalculate dependencies", "Recalculate quality", "Recalculate freshness",
  "Recalculate downstream impact",
];

export const REFRESH_STEPS = [
  "Loading Current Persona", "Loading Changed Conditions", "Comparing Versions",
  "Refreshing Sections", "Rebuilding Relationships", "Recalculating Quality",
  "Assessing Downstream Impact", "Creating Draft Version", "Completed",
];

export interface RefreshResult {
  sectionsUpdated: number;
  conditionsAdded: number;
  conditionsRemoved: number;
  relationshipsChanged: number;
  conflictsCreated: number;
  reviewTasksCreated: number;
  evaluationsFlagged: number;
  draftVersion: string;
}

/* ---------------------------- publishing model ---------------------------- */

export interface PublishDestination {
  id: string;
  name: string;
  ready: number;
  pending: number;
  blocked: number;
  lastPublished: string;
  status: "Published" | "Publishing" | "Paused" | "Blocked" | "Pending";
  version: string;
  accessPolicyStatus: "Validated" | "Pending" | "Blocked";
}

export const publishDestinations: PublishDestination[] = [
  { id: "memory", name: "Enterprise Cognitive Memory", ready: 61, pending: 4, blocked: 0, lastPublished: "10:09 AM", status: "Published", version: "3.3", accessPolicyStatus: "Validated" },
  { id: "graph", name: "Context Graph", ready: 61, pending: 4, blocked: 0, lastPublished: "10:09 AM", status: "Published", version: "3.3", accessPolicyStatus: "Validated" },
  { id: "intake", name: "Cognitive Intake", ready: 61, pending: 3, blocked: 0, lastPublished: "10:07 AM", status: "Published", version: "3.3", accessPolicyStatus: "Validated" },
  { id: "impact", name: "Persona Impact Analysis", ready: 58, pending: 5, blocked: 1, lastPublished: "09:52 AM", status: "Pending", version: "3.3", accessPolicyStatus: "Pending" },
  { id: "matrix", name: "Cross Team Impact Matrix", ready: 58, pending: 5, blocked: 1, lastPublished: "09:52 AM", status: "Pending", version: "3.3", accessPolicyStatus: "Pending" },
  { id: "decision", name: "Decision Intelligence", ready: 57, pending: 4, blocked: 2, lastPublished: "09:44 AM", status: "Blocked", version: "3.2", accessPolicyStatus: "Blocked" },
  { id: "search", name: "Cognitive Search", ready: 61, pending: 2, blocked: 0, lastPublished: "10:06 AM", status: "Published", version: "3.3", accessPolicyStatus: "Validated" },
  { id: "mcp", name: "MCP Context Services", ready: 60, pending: 3, blocked: 1, lastPublished: "09:58 AM", status: "Paused", version: "3.3", accessPolicyStatus: "Validated" },
  { id: "learning", name: "Organizational Learning", ready: 61, pending: 1, blocked: 0, lastPublished: "10:02 AM", status: "Published", version: "3.3", accessPolicyStatus: "Validated" },
];

export const PUBLISH_STEPS = [
  "Validating Persona", "Validating Approvals", "Validating Access Context",
  "Publishing to Cognitive Memory", "Updating Context Graph", "Updating Cognitive Intake",
  "Updating Impact Analysis", "Updating Search", "Updating MCP Context Services", "Completed",
];

export interface PublishGate {
  key: string;
  label: string;
  requirement: string;
  actual: string;
  met: boolean;
}

export const publishGates = (opts: {
  approved: boolean; quality: number; completeness: number; evidence: number;
  criticalConflicts: number; owner: string; effectiveDate: string; classification: string; consumers: number;
}): PublishGate[] => [
  { key: "approved", label: "Approved state", requirement: "Approved", actual: opts.approved ? "Approved" : "Approval in progress", met: opts.approved },
  { key: "quality", label: "Minimum quality", requirement: "90", actual: String(opts.quality), met: opts.quality >= 90 },
  { key: "completeness", label: "Minimum completeness", requirement: "90", actual: String(opts.completeness), met: opts.completeness >= 90 },
  { key: "evidence", label: "Minimum evidence coverage", requirement: "90", actual: String(opts.evidence), met: opts.evidence >= 90 },
  { key: "conflicts", label: "No unresolved critical conflicts", requirement: "0", actual: String(opts.criticalConflicts), met: opts.criticalConflicts === 0 },
  { key: "owner", label: "Assigned Persona owner", requirement: "Assigned", actual: opts.owner, met: opts.owner !== "Unassigned" },
  { key: "effective", label: "Effective date", requirement: "Set", actual: opts.effectiveDate, met: !!opts.effectiveDate },
  { key: "classification", label: "Access classification", requirement: "Set", actual: opts.classification, met: !!opts.classification },
  { key: "consumers", label: "Approved downstream consumers", requirement: "At least 1", actual: String(opts.consumers), met: opts.consumers > 0 },
];

export interface PersonaPublication {
  id: string;
  personaId: string;
  personaVersionId: string;
  destinations: string[];
  status: "Published" | "Publishing" | "Blocked" | "Paused";
  readyDestinations: string[];
  pendingDestinations: string[];
  blockedDestinations: string[];
  accessValidationStatus: "Validated" | "Pending" | "Blocked";
  startedAt: string;
  completedAt: string | null;
  publishedBy: string;
}

export const publicationHistory: PersonaPublication[] = [
  {
    id: "PUB-6601", personaId: "PERSONA-1003", personaVersionId: "PV-41",
    destinations: publishDestinations.map((d) => d.name), status: "Published",
    readyDestinations: publishDestinations.map((d) => d.name), pendingDestinations: [], blockedDestinations: [],
    accessValidationStatus: "Validated", startedAt: "10:07 AM", completedAt: "10:09 AM", publishedBy: "Checkout Engineering",
  },
  {
    id: "PUB-6600", personaId: "PERSONA-1001", personaVersionId: "PV-33",
    destinations: publishDestinations.map((d) => d.name), status: "Published",
    readyDestinations: publishDestinations.map((d) => d.name), pendingDestinations: [], blockedDestinations: [],
    accessValidationStatus: "Validated", startedAt: "Previous month", completedAt: "Previous month", publishedBy: "Jane Smith",
  },
];

/* ----------------------------- coverage model ----------------------------- */

export const coverageDimensions = ["Business Unit", "Knowledge Domain", "Business Capability", "Customer Journey", "Critical Service", "Region"] as const;
export type CoverageDimension = (typeof coverageDimensions)[number];

export const coverageData: Record<CoverageDimension, { name: string; covered: number; teams: number }[]> = {
  "Business Unit": [
    { name: "Commerce Engineering", covered: 96, teams: 18 },
    { name: "Identity and Trust", covered: 91, teams: 11 },
    { name: "Customer Operations", covered: 78, teams: 9 },
    { name: "Finance Technology", covered: 84, teams: 7 },
    { name: "Platform Reliability", covered: 93, teams: 8 },
    { name: "Merchant Services", covered: 69, teams: 5 },
  ],
  "Knowledge Domain": [
    { name: "Payments", covered: 97, teams: 12 },
    { name: "Identity", covered: 92, teams: 8 },
    { name: "Fraud and Risk", covered: 89, teams: 6 },
    { name: "Reliability", covered: 94, teams: 9 },
    { name: "Governance", covered: 88, teams: 5 },
    { name: "Support", covered: 74, teams: 7 },
  ],
  "Business Capability": [
    { name: "Payment Authorization", covered: 98, teams: 6 },
    { name: "Settlement", covered: 92, teams: 4 },
    { name: "Retry Orchestration", covered: 81, teams: 3 },
    { name: "Dispute Handling", covered: 72, teams: 4 },
    { name: "Access Management", covered: 90, teams: 5 },
    { name: "Change Governance", covered: 86, teams: 3 },
  ],
  "Customer Journey": [
    { name: "Checkout", covered: 95, teams: 9 },
    { name: "Refund", covered: 79, teams: 5 },
    { name: "Onboarding", covered: 83, teams: 6 },
    { name: "Dispute", covered: 68, teams: 4 },
    { name: "Account Recovery", covered: 77, teams: 4 },
  ],
  "Critical Service": [
    { name: "Payments API", covered: 99, teams: 4 },
    { name: "Token Service", covered: 96, teams: 3 },
    { name: "Fraud Decision Service", covered: 94, teams: 3 },
    { name: "Retry Orchestrator", covered: 85, teams: 2 },
    { name: "Settlement Service", covered: 92, teams: 3 },
  ],
  Region: [
    { name: "North America", covered: 95, teams: 22 },
    { name: "Europe", covered: 90, teams: 16 },
    { name: "Asia Pacific", covered: 82, teams: 12 },
    { name: "Latin America", covered: 71, teams: 6 },
  ],
};

export const coverageMetrics = [
  { label: "Priority Teams Covered", value: "87 percent" },
  { label: "Critical Services Covered", value: "94 percent" },
  { label: "Customer Journeys Covered", value: "82 percent" },
  { label: "Knowledge Domains Covered", value: "91 percent" },
  { label: "Teams with Approved Personas", value: "61" },
  { label: "Teams with Draft Personas", value: "4" },
  { label: "Teams Requiring Persona Construction", value: "7" },
];

/* ---------------------------- readiness model ----------------------------- */

export const readinessMetrics = [
  { label: "Approved Personas", value: 61, tone: "green" as const },
  { label: "Personas Ready for Cognitive Intake", value: 61, tone: "green" as const },
  { label: "Personas Ready for Impact Analysis", value: 58, tone: "green" as const },
  { label: "Personas Ready for Decision Intelligence", value: 57, tone: "blue" as const },
  { label: "Personas Awaiting Review", value: 7, tone: "amber" as const },
  { label: "Personas Blocked by Conflict", value: 3, tone: "red" as const },
  { label: "Personas with Drift", value: 8, tone: "amber" as const },
];

export const downstreamUsage = [
  { label: "Active Impact Evaluations Using Personas", value: "24" },
  { label: "Incoming Work Items Evaluated", value: "186" },
  { label: "Decisions Referencing Personas", value: "4,812" },
  { label: "Context Graph Relationships", value: "52,632" },
  { label: "Cognitive Search Queries Using Personas", value: "8,426" },
];

/* -------------------------- impact preview model -------------------------- */

export const impactPreview = {
  changeTitle: "Checkout Retry Policy Update",
  changeSummary: "Increase automated retry attempts from two to three for selected payment failures",
  reactions: [
    { label: "Potential Availability Benefit", level: "Medium" as const },
    { label: "Duplicate Transaction Risk", level: "High" as const },
    { label: "Latency Risk", level: "Medium" as const },
    { label: "Fraud Dependency Impact", level: "High" as const },
  ],
  approvalRequired: "Yes",
  requiredReviewers: ["Payments Reliability", "Fraud Engineering", "Site Reliability Engineering"],
  recommendedEvidence: [
    "Traffic segmentation plan", "Idempotency test results", "Fraud loss analysis",
    "Rollback threshold", "Regional dependency health",
  ],
};

/* ------------------------------ activity feed ----------------------------- */

export interface PersonaActivity {
  id: string;
  timestamp: string;
  personaId: string;
  personaName: string;
  teamId: string;
  team: string;
  sectionId: string;
  section: string;
  action: string;
  description: string;
  result: string;
  owner: string;
  auditId: string;
  target: { kind: "persona" | "review" | "conflict" | "version" | "drift" | "evidence"; id: string };
}

export const personaActivity: PersonaActivity[] = [
  { id: "ACT-1", timestamp: "10:22 AM", personaId: "PERSONA-1001", personaName: "Payments Platform", teamId: "TEAM-PAY", team: "Payments Platform", sectionId: "SEC-DECISION", section: "Decision Rules", action: "Submitted for team review", description: "Payments Platform Persona submitted for team review", result: "Review Required", owner: "Jane Smith", auditId: "AUD-77120", target: { kind: "review", id: "PVR 3401" } },
  { id: "ACT-2", timestamp: "10:18 AM", personaId: "PERSONA-1001", personaName: "Payments Platform", teamId: "TEAM-FRAUD", team: "Fraud Engineering", sectionId: "SEC-DEPENDENCIES", section: "Dependencies", action: "Dependency approved", description: "Fraud Engineering dependency approved", result: "Approved", owner: "Fraud Engineering", auditId: "AUD-77118", target: { kind: "persona", id: "PERSONA-1001" } },
  { id: "ACT-3", timestamp: "10:14 AM", personaId: "PERSONA-1002", personaName: "Identity Engineering", teamId: "TEAM-ID", team: "Identity Engineering", sectionId: "SEC-SLA", section: "Service Levels", action: "Conflict opened", description: "Identity latency conflict opened", result: "Conflict", owner: "Security Architecture", auditId: "AUD-77115", target: { kind: "conflict", id: "PCF-5102" } },
  { id: "ACT-4", timestamp: "10:09 AM", personaId: "PERSONA-1003", personaName: "Checkout Engineering", teamId: "TEAM-CHECKOUT", team: "Checkout Engineering", sectionId: "SEC-ALL", section: "All sections", action: "Version published", description: "Checkout Engineering Persona version 4.1 published", result: "Published", owner: "Checkout Engineering", auditId: "AUD-77110", target: { kind: "version", id: "PV-41" } },
  { id: "ACT-5", timestamp: "10:06 AM", personaId: "PERSONA-1001", personaName: "Payments Platform", teamId: "TEAM-PAY", team: "Payments Platform", sectionId: "SEC-EVIDENCE", section: "Evidence and Provenance", action: "Evidence coverage increased", description: "Payments Platform evidence coverage increased to 95 percent", result: "Healthy", owner: "Jane Smith", auditId: "AUD-77108", target: { kind: "evidence", id: "COND-100421" } },
  { id: "ACT-6", timestamp: "10:03 AM", personaId: "PERSONA-1004", personaName: "Customer Support Operations", teamId: "TEAM-SUPPORT", team: "Customer Support Operations", sectionId: "SEC-ESCALATION", section: "Escalation Philosophy", action: "Revision requested", description: "Customer Support escalation philosophy requested for revision", result: "Changes Requested", owner: "Customer Support Leadership", auditId: "AUD-77105", target: { kind: "review", id: "PVR 3403" } },
  { id: "ACT-7", timestamp: "9:58 AM", personaId: "PERSONA-1005", personaName: "Release Governance", teamId: "TEAM-GOV", team: "Release Governance", sectionId: "SEC-CONSTRAINTS", section: "Constraints", action: "Persona refreshed", description: "Release Governance Persona refreshed from changed conditions", result: "Drift Detected", owner: "Engineering Governance", auditId: "AUD-77101", target: { kind: "drift", id: "DRF-9005" } },
  { id: "ACT-8", timestamp: "9:52 AM", personaId: "PERSONA-1001", personaName: "Payments Platform", teamId: "TEAM-PAY", team: "Enterprise", sectionId: "SEC-ALL", section: "Taxonomy", action: "Taxonomy activated", description: "Persona taxonomy version 2.4 activated", result: "Approved", owner: "Enterprise Architecture", auditId: "AUD-77098", target: { kind: "version", id: "PV-33" } },
];

/* ------------------------------ notifications ----------------------------- */

export const NOTIFICATION_CATEGORIES = [
  "Persona construction completed", "Persona review requested", "Persona approved", "Persona rejected",
  "Dependency review requested", "Conflict detected", "Evidence gap detected", "Persona drift detected",
  "Persona refresh completed", "Persona published", "Downstream evaluation requires reassessment",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export interface GovernanceNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  detail: string;
  timestamp: string;
  tone: "green" | "amber" | "red" | "blue";
  read: boolean;
  targetKind: "persona" | "review" | "conflict" | "drift" | "version" | "publishing";
  targetId: string;
}

export const governanceNotifications: GovernanceNotification[] = [
  { id: "NTF-1", category: "Persona review requested", title: "Team owner review requested", detail: "PVR 3401 · Payments Platform decision logic", timestamp: "10:22 AM", tone: "amber", read: false, targetKind: "review", targetId: "PVR 3401" },
  { id: "NTF-2", category: "Conflict detected", title: "Critical conflict detected", detail: "PCF-5102 · Identity token latency threshold", timestamp: "10:14 AM", tone: "red", read: false, targetKind: "conflict", targetId: "PCF-5102" },
  { id: "NTF-3", category: "Persona published", title: "Persona published", detail: "Checkout Engineering version 4.1 published to nine destinations", timestamp: "10:09 AM", tone: "green", read: false, targetKind: "publishing", targetId: "PUB-6601" },
  { id: "NTF-4", category: "Evidence gap detected", title: "Evidence gap detected", detail: "Customer Support escalation philosophy lacks approved evidence", timestamp: "10:03 AM", tone: "amber", read: false, targetKind: "review", targetId: "PVR 3403" },
  { id: "NTF-5", category: "Persona drift detected", title: "Material drift detected", detail: "Payments Platform quarter end restriction changed", timestamp: "09:58 AM", tone: "amber", read: false, targetKind: "drift", targetId: "DRF-9001" },
  { id: "NTF-6", category: "Dependency review requested", title: "Dependency review requested", detail: "Fraud Engineering review required for Payments Platform", timestamp: "09:47 AM", tone: "blue", read: true, targetKind: "review", targetId: "PVR 3401" },
  { id: "NTF-7", category: "Persona construction completed", title: "Construction completed", detail: "Release Governance draft assembled from 184 conditions", timestamp: "09:31 AM", tone: "green", read: true, targetKind: "persona", targetId: "PERSONA-1005" },
  { id: "NTF-8", category: "Downstream evaluation requires reassessment", title: "Evaluations flagged", detail: "4 impact evaluations require reassessment after drift", timestamp: "09:20 AM", tone: "amber", read: true, targetKind: "drift", targetId: "DRF-9001" },
];

/* -------------------------------- exports --------------------------------- */

export const EXPORT_FORMATS = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const EXPORT_SCOPES = [
  "Current Persona", "Selected Personas", "Current Filtered View", "Approved Personas",
  "Draft Personas", "Personas Requiring Review", "Persona Quality Summary",
  "Persona Relationship Summary", "Full Persona Library",
] as const;

export const EXPORT_OPTIONS = [
  "Include conditions", "Include evidence references", "Include mission and capabilities",
  "Include products and services", "Include customers", "Include objectives and metrics",
  "Include constraints", "Include dependencies", "Include risks and controls",
  "Include decision logic", "Include How This Team Thinks", "Include quality and confidence",
  "Include versions", "Include approval history", "Include audit history",
];

/* ------------------------------ global search ----------------------------- */

export const SEARCH_TYPES = [
  "Team Persona", "Team", "Business Unit", "Capability", "Product", "Service", "Customer",
  "Condition", "Dependency", "Risk", "Control", "Metric", "Decision Rule", "Evidence",
  "Review", "Conflict", "Version",
] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export interface SearchRecord {
  id: string;
  type: SearchType;
  record: string;
  team: string;
  section: string;
  status: string;
  quality: number;
  confidence: number;
  keywords: string;
  target: { kind: "persona" | "review" | "conflict" | "version" | "drift"; id: string };
}

export const searchIndex: SearchRecord[] = [
  { id: "SR-1", type: "Team Persona", record: "Payments Platform Persona", team: "Payments Platform", section: "All sections", status: "In Review", quality: 92, confidence: 89, keywords: "payments availability identity services fraud decision service retry", target: { kind: "persona", id: "PERSONA-1001" } },
  { id: "SR-2", type: "Team Persona", record: "Identity Engineering Persona", team: "Identity Engineering", section: "Service Levels", status: "Conflict", quality: 88, confidence: 79, keywords: "identity services token latency stale evidence", target: { kind: "persona", id: "PERSONA-1002" } },
  { id: "SR-3", type: "Team Persona", record: "Checkout Engineering Persona", team: "Checkout Engineering", section: "All sections", status: "Published", quality: 95, confidence: 93, keywords: "checkout identity services payment availability", target: { kind: "persona", id: "PERSONA-1003" } },
  { id: "SR-4", type: "Team Persona", record: "Customer Support Operations Persona", team: "Customer Support Operations", section: "Escalation Philosophy", status: "Review Required", quality: 81, confidence: 58, keywords: "missing escalation philosophy support stale evidence", target: { kind: "persona", id: "PERSONA-1004" } },
  { id: "SR-5", type: "Team Persona", record: "Release Governance Persona", team: "Release Governance", section: "Constraints", status: "Drift Detected", quality: 87, confidence: 85, keywords: "quarter end deployment restrictions change freeze", target: { kind: "persona", id: "PERSONA-1005" } },
  { id: "SR-6", type: "Condition", record: "COND-100421 approval threshold", team: "Payments Platform", section: "Approval Requirements", status: "Approved", quality: 94, confidence: 94, keywords: "payment availability approval threshold traffic", target: { kind: "conflict", id: "PCF-5101" } },
  { id: "SR-7", type: "Condition", record: "COND-100510 token validation latency", team: "Identity Engineering", section: "Service Levels", status: "Conflict", quality: 91, confidence: 91, keywords: "identity services token latency", target: { kind: "conflict", id: "PCF-5102" } },
  { id: "SR-8", type: "Condition", record: "COND-100702 quarter end restriction", team: "Release Governance", section: "Constraints", status: "Approved", quality: 90, confidence: 90, keywords: "quarter end deployment restrictions", target: { kind: "conflict", id: "PCF-5103" } },
  { id: "SR-9", type: "Dependency", record: "Payments Platform depends on Identity Services", team: "Payments Platform", section: "Dependencies", status: "Critical", quality: 92, confidence: 90, keywords: "personas dependent on identity services", target: { kind: "persona", id: "PERSONA-1001" } },
  { id: "SR-10", type: "Dependency", record: "Checkout Engineering depends on Identity Services", team: "Checkout Engineering", section: "Dependencies", status: "Critical", quality: 95, confidence: 92, keywords: "personas dependent on identity services", target: { kind: "persona", id: "PERSONA-1003" } },
  { id: "SR-11", type: "Service", record: "Fraud Decision Service", team: "Fraud Engineering", section: "Dependencies", status: "Healthy", quality: 93, confidence: 91, keywords: "personas using fraud decision service", target: { kind: "persona", id: "PERSONA-1001" } },
  { id: "SR-12", type: "Metric", record: "Payment availability 99.95 percent", team: "Payments Platform", section: "Objectives and Metrics", status: "On target", quality: 94, confidence: 93, keywords: "teams with payment availability requirements", target: { kind: "persona", id: "PERSONA-1001" } },
  { id: "SR-13", type: "Review", record: "PVR 3401 team owner review", team: "Payments Platform", section: "Decision Rules", status: "Open", quality: 92, confidence: 89, keywords: "review decision logic approval thresholds", target: { kind: "review", id: "PVR 3401" } },
  { id: "SR-14", type: "Conflict", record: "PCF-5102 latency conflict", team: "Identity Engineering", section: "Service Levels", status: "In Review", quality: 88, confidence: 79, keywords: "critical personas with stale evidence identity", target: { kind: "conflict", id: "PCF-5102" } },
  { id: "SR-15", type: "Version", record: "Payments Platform version 3.4 draft", team: "Payments Platform", section: "All sections", status: "Draft", quality: 92, confidence: 89, keywords: "version draft retry approval threshold", target: { kind: "version", id: "PV-34" } },
  { id: "SR-16", type: "Risk", record: "Duplicate transaction exposure", team: "Payments Platform", section: "Risks and Controls", status: "High", quality: 90, confidence: 88, keywords: "duplicate transaction retry risk", target: { kind: "persona", id: "PERSONA-1001" } },
  { id: "SR-17", type: "Control", record: "Idempotency key enforcement", team: "Payments Platform", section: "Risks and Controls", status: "Healthy", quality: 93, confidence: 92, keywords: "idempotency control duplicate", target: { kind: "persona", id: "PERSONA-1001" } },
  { id: "SR-18", type: "Decision Rule", record: "Correctness before availability", team: "Payments Platform", section: "Decision Rules", status: "Approved", quality: 92, confidence: 91, keywords: "decision priority correctness availability", target: { kind: "persona", id: "PERSONA-1001" } },
  { id: "SR-19", type: "Evidence", record: "Payments API Reliability Standard passage", team: "Payments Platform", section: "Service Levels", status: "Current", quality: 94, confidence: 94, keywords: "evidence payments api reliability", target: { kind: "persona", id: "PERSONA-1001" } },
  { id: "SR-20", type: "Business Unit", record: "Commerce Engineering", team: "Commerce Engineering", section: "Portfolio", status: "Healthy", quality: 93, confidence: 91, keywords: "business unit commerce engineering coverage", target: { kind: "persona", id: "PERSONA-1001" } },
];

export const EXAMPLE_SEARCHES = [
  "Personas dependent on Identity Services",
  "Teams with payment availability requirements",
  "Personas missing escalation philosophy",
  "Critical Personas with stale evidence",
  "Teams affected by quarter end deployment restrictions",
  "Personas using Fraud Decision Service",
];

export function runSearch(query: string, type: SearchType | "All"): SearchRecord[] {
  const q = query.trim().toLowerCase();
  return searchIndex.filter((r) => {
    if (type !== "All" && r.type !== type) return false;
    if (!q) return true;
    const hay = `${r.record} ${r.team} ${r.section} ${r.status} ${r.keywords} ${r.type}`.toLowerCase();
    return q.split(/\s+/).filter((t) => t.length > 2).some((t) => hay.includes(t));
  });
}

/* ------------------------------- demo story ------------------------------- */

export interface DemoStep {
  target: string;
  caption: string;
  notes: string;
  view?: "portfolio" | "construction" | "workbench" | "architecture";
}

export const demoStorySteps: DemoStep[] = [
  { target: "panel-kpis", caption: "The Enterprise Cognitive Fabric assembles approved business conditions into evidence linked operating models for each team.", notes: "Point at Active Team Personas and Conditions Mapped. 72 personas built from 82,906 approved conditions." },
  { target: "panel-lifecycle", caption: "Mission, capabilities, services, customers, metrics, constraints, dependencies, risks, and decision rules are constructed through a governed workflow.", notes: "Ten stages, each with throughput, success rate and review state." },
  { target: "panel-workbench", caption: "Every Persona field remains linked to the conditions and exact evidence that support it.", notes: "Select a condition on the left and watch the canvas and evidence inspector synchronise.", view: "workbench" },
  { target: "panel-how-team-thinks", caption: "The Persona explains how the team prioritizes outcomes, evaluates tradeoffs, uses evidence, accepts risk, and escalates.", notes: "How This Team Thinks is what makes the Persona reusable for evaluation." },
  { target: "panel-graph", caption: "The Fabric identifies the teams, services, systems, customers, and decisions connected to this team.", notes: "16 nodes and 8 relationship types centred on Payments Platform.", view: "construction" },
  { target: "panel-conflicts", caption: "Conflicting rules, missing owners, stale evidence, and incomplete dependencies are identified before the Persona can be trusted.", notes: "Four active conflicts including a critical identity latency conflict." },
  { target: "panel-conflicts", caption: "Human reviewers determine which condition is authoritative or whether different rules apply to different environments, services, or effective periods.", notes: "Open PCF-5102 and resolve with environment specific applicability." },
  { target: "panel-approval", caption: "Team owners, dependency owners, and governance reviewers approve the Persona before publication.", notes: "Seven stage approval chain with configurable requirements." },
  { target: "panel-drift", caption: "When source conditions, owners, policies, metrics, or dependencies change, the Fabric identifies which Personas and decisions require reassessment.", notes: "Three material drift records and four evaluations flagged." },
  { target: "panel-readiness", caption: "Approved Personas become reusable enterprise memory for Cognitive Intake, impact analysis, decision intelligence, and organizational learning.", notes: "Close by proceeding to Cognitive Intake." },
];

/* ----------------------------- demo scenarios ----------------------------- */

export const DEMO_SCENARIOS = [
  "Healthy Persona Portfolio", "New Team Persona Construction", "Missing Persona Owner",
  "Evidence Gap", "Dependency Conflict", "Decision Rule Conflict", "Low Confidence Persona",
  "Stale Persona", "Source Condition Changed", "Persona Drift Detected", "Persona Review Backlog",
  "Persona Approval in Progress", "Persona Publishing in Progress", "Persona Published",
  "Downstream Evaluation Flagged", "Reset Demo Data",
] as const;
export type DemoScenario = (typeof DEMO_SCENARIOS)[number];

export interface ScenarioState {
  serviceState: ComponentState;
  banner: string;
  attentionCount: number;
  qualityScore: number;
  openConflicts: number;
  openReviews: number;
  driftRecords: number;
  publishingState: "Idle" | "Publishing" | "Published" | "Blocked" | "Paused";
  approvalStage: ApprovalStage;
  activityHeadline: string;
  notification: { category: NotificationCategory; title: string; detail: string; tone: "green" | "amber" | "red" | "blue" } | null;
  readinessDelta: number;
  emphasisPanel: string | null;
}

const base: ScenarioState = {
  serviceState: "Review Required",
  banner: "Seeded demonstration portfolio. 61 approved personas, 7 awaiting review.",
  attentionCount: 14,
  qualityScore: 92,
  openConflicts: 4,
  openReviews: 7,
  driftRecords: 8,
  publishingState: "Idle",
  approvalStage: "Persona Owner Review",
  activityHeadline: "Payments Platform Persona submitted for team review",
  notification: null,
  readinessDelta: 0,
  emphasisPanel: null,
};

export const scenarioStates: Record<DemoScenario, ScenarioState> = {
  "Healthy Persona Portfolio": { ...base, serviceState: "Healthy", banner: "All priority personas are approved, evidence linked and fresh.", attentionCount: 0, qualityScore: 96, openConflicts: 0, openReviews: 0, driftRecords: 0, activityHeadline: "Portfolio quality reached 96 across 61 approved personas", notification: { category: "Persona approved", title: "Portfolio healthy", detail: "No open conflicts, reviews or drift", tone: "green" }, readinessDelta: 3, emphasisPanel: "panel-readiness" },
  "New Team Persona Construction": { ...base, serviceState: "Warning", banner: "Merchant Services Persona construction started from 184 approved conditions.", attentionCount: 6, qualityScore: 84, openReviews: 8, activityHeadline: "Merchant Services Persona construction started", notification: { category: "Persona construction completed", title: "Construction started", detail: "Merchant Services draft assembling", tone: "blue" }, emphasisPanel: "panel-lifecycle" },
  "Missing Persona Owner": { ...base, serviceState: "Blocked", banner: "Three personas cannot progress because no accountable owner is assigned.", attentionCount: 17, qualityScore: 88, openConflicts: 5, activityHeadline: "Retry Orchestrator ownership conflict raised", notification: { category: "Conflict detected", title: "Missing Persona owner", detail: "3 personas blocked pending owner assignment", tone: "red" }, emphasisPanel: "panel-conflicts" },
  "Evidence Gap": { ...base, serviceState: "Warning", banner: "Five persona sections assert behaviour without approved supporting evidence.", attentionCount: 19, qualityScore: 86, openReviews: 12, activityHeadline: "Evidence gap raised on Customer Support escalation philosophy", notification: { category: "Evidence gap detected", title: "Evidence gap detected", detail: "5 sections lack approved evidence", tone: "amber" }, emphasisPanel: "panel-conflicts" },
  "Dependency Conflict": { ...base, serviceState: "Conflict", banner: "Identity latency conflict blocks three dependent persona publications.", attentionCount: 21, qualityScore: 83, openConflicts: 7, openReviews: 11, driftRecords: 9, publishingState: "Blocked", activityHeadline: "Identity latency conflict opened", notification: { category: "Conflict detected", title: "Dependency conflict", detail: "PCF-5102 blocks 3 publications", tone: "red" }, readinessDelta: -4, emphasisPanel: "panel-conflicts" },
  "Decision Rule Conflict": { ...base, serviceState: "Conflict", banner: "Quarter end change freeze rules disagree by two business days.", attentionCount: 16, qualityScore: 87, openConflicts: 6, activityHeadline: "Effective rule conflict raised on Release Governance", notification: { category: "Conflict detected", title: "Decision rule conflict", detail: "PCF-5103 effective rule conflict", tone: "red" }, emphasisPanel: "panel-conflicts" },
  "Low Confidence Persona": { ...base, serviceState: "Warning", banner: "Customer Support Operations Persona confidence has fallen to 58.", attentionCount: 15, qualityScore: 81, activityHeadline: "Customer Support Operations confidence fell below threshold", notification: { category: "Evidence gap detected", title: "Low confidence persona", detail: "Confidence 58 against threshold 80", tone: "amber" }, emphasisPanel: "panel-quality" },
  "Stale Persona": { ...base, serviceState: "Stale", banner: "Two personas have not been refreshed since their source conditions changed.", attentionCount: 13, qualityScore: 85, driftRecords: 10, activityHeadline: "Two personas marked stale", notification: { category: "Persona drift detected", title: "Stale personas", detail: "2 personas exceed the freshness threshold", tone: "amber" }, emphasisPanel: "panel-drift" },
  "Source Condition Changed": { ...base, serviceState: "Drift Detected", banner: "Quarter end restriction changed from three to five business days.", attentionCount: 12, driftRecords: 11, activityHeadline: "Source condition COND-100702 changed", notification: { category: "Persona drift detected", title: "Source condition changed", detail: "COND-100702 updated", tone: "amber" }, emphasisPanel: "panel-drift" },
  "Persona Drift Detected": { ...base, serviceState: "Drift Detected", banner: "Three material drift records require persona refresh.", attentionCount: 18, driftRecords: 12, activityHeadline: "Material drift detected on Payments Platform", notification: { category: "Persona drift detected", title: "Material drift detected", detail: "4 evaluations require reassessment", tone: "amber" }, readinessDelta: -2, emphasisPanel: "panel-drift" },
  "Persona Review Backlog": { ...base, serviceState: "Review Required", banner: "Nineteen reviews are open and two are overdue.", attentionCount: 22, openReviews: 19, activityHeadline: "Review backlog exceeded the service threshold", notification: { category: "Persona review requested", title: "Review backlog", detail: "19 open reviews, 2 overdue", tone: "amber" }, emphasisPanel: "panel-validation-queue" },
  "Persona Approval in Progress": { ...base, serviceState: "Approval in Progress", banner: "Payments Platform version 3.4 is in governance review.", approvalStage: "Governance Review", activityHeadline: "Payments Platform version 3.4 reached governance review", notification: { category: "Persona review requested", title: "Governance review", detail: "Commerce Architecture Council review pending", tone: "blue" }, emphasisPanel: "panel-approval" },
  "Persona Publishing in Progress": { ...base, serviceState: "Publishing", banner: "Payments Platform version 3.4 is publishing to nine destinations.", approvalStage: "Approved", publishingState: "Publishing", activityHeadline: "Publishing Payments Platform version 3.4", notification: { category: "Persona published", title: "Publishing started", detail: "9 destinations updating", tone: "blue" }, emphasisPanel: "panel-publishing" },
  "Persona Published": { ...base, serviceState: "Published", banner: "Payments Platform version 3.4 is published and available downstream.", attentionCount: 4, qualityScore: 94, openConflicts: 1, openReviews: 2, approvalStage: "Published", publishingState: "Published", activityHeadline: "Payments Platform version 3.4 published", notification: { category: "Persona published", title: "Persona published", detail: "Version 3.4 live on 9 destinations", tone: "green" }, readinessDelta: 2, emphasisPanel: "panel-publishing" },
  "Downstream Evaluation Flagged": { ...base, serviceState: "Warning", banner: "Four impact evaluations require reassessment after persona change.", attentionCount: 11, activityHeadline: "Four impact evaluations flagged for reassessment", notification: { category: "Downstream evaluation requires reassessment", title: "Evaluations flagged", detail: "4 evaluations require reassessment", tone: "amber" }, readinessDelta: -1, emphasisPanel: "panel-readiness" },
  "Reset Demo Data": { ...base },
};

/* --------------------------- quality detail model -------------------------- */

export interface QualityDetail {
  definition: string;
  target: number;
  personaDistribution: { band: string; count: number }[];
  businessUnitDistribution: { name: string; score: number }[];
  knowledgeDomainDistribution: { name: string; score: number }[];
  failureCauses: string[];
  affectedSections: string[];
  affectedConditions: string[];
  affectedTeams: string[];
  recommendedActions: string[];
  recentChanges: string[];
}

export const qualityDetailFor = (name: string, score: number, target: number): QualityDetail => ({
  definition: `${name} measures the proportion of Persona assertions that satisfy the enterprise standard for ${name.toLowerCase()} before publication.`,
  target,
  personaDistribution: [
    { band: "95 and above", count: 28 },
    { band: "90 to 94", count: 21 },
    { band: "80 to 89", count: 9 },
    { band: "Below 80", count: 3 },
  ],
  businessUnitDistribution: coverageData["Business Unit"].map((b) => ({ name: b.name, score: Math.max(60, Math.min(100, b.covered - (100 - score))) })),
  knowledgeDomainDistribution: coverageData["Knowledge Domain"].map((b) => ({ name: b.name, score: Math.max(60, Math.min(100, b.covered - (100 - score))) })),
  failureCauses: [
    "Supporting authority used where a primary record exists",
    "Evidence passage older than the freshness threshold",
    "Section owner not assigned",
    "Conflicting condition unresolved",
  ],
  affectedSections: ["Approval Requirements", "Service Levels", "Escalation Philosophy", "Dependencies"],
  affectedConditions: ["COND-100421", "COND-100510", "COND-100604", "COND-100702"],
  affectedTeams: ["Payments Platform", "Identity Engineering", "Customer Support Operations"],
  recommendedActions: [
    "Resolve the two open authority conflicts",
    "Request approved evidence for the escalation philosophy",
    "Assign owners to three unowned sections",
    "Refresh personas with material drift",
  ],
  recentChanges: [
    "Evidence coverage increased to 95 percent at 10:06 AM",
    "Fraud dependency approved at 10:18 AM",
    "Identity latency conflict opened at 10:14 AM",
  ],
});

/* --------------------------------- helpers -------------------------------- */

export const toYaml = (value: unknown, indent = 0): string => {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value.map((v) => (typeof v === "object" && v !== null
      ? `${pad}-\n${toYaml(v, indent + 1)}`
      : `${pad}- ${String(v)}`)).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      typeof v === "object" && v !== null
        ? `${pad}${k}:\n${toYaml(v, indent + 1)}`
        : `${pad}${k}: ${String(v)}`).join("\n");
  }
  return `${pad}${String(value)}`;
};

export const rowsToCsv = (head: string[], body: (string | number)[][]) =>
  [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
