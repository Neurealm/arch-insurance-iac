/* Discovery Configuration — Prompt 2 governance data plane.
   Extends the Prompt 1 deterministic engine with validation, conflicts, reviews,
   approvals, versions, inheritance, exceptions, promotion, activation, rollback,
   drift, runtime compatibility, publishing, audit, notifications and demo control.
   All data is synthetic and local. No backend, no live enterprise systems. */

import type { DraftState } from "./data";

/* --------------------------------------------------------------- states */

export type ApprovalState =
  | "Draft" | "Validation Required" | "Validation Failed" | "Review Required"
  | "Approval Pending" | "Approved" | "Approved with Conditions" | "Rejected"
  | "Scheduled" | "Active" | "Superseded" | "Rolled Back" | "Historical";

export type OperationalState =
  | "Loading" | "Empty" | "Error" | "Draft" | "Validation Required" | "Validation Running"
  | "Validation Warning" | "Validation Failed" | "Review Required" | "Approval Pending"
  | "Approved" | "Approved with Conditions" | "Rejected" | "Scheduled" | "Activating"
  | "Active" | "Activation Failed" | "Superseded" | "Rollback Running" | "Rolled Back"
  | "Drift Detected" | "Exception Active" | "Historical" | "Blocked";

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type ValidationStatus = "Passed" | "Warning" | "Review Required" | "Blocked";

export const stateTone = (s: string): "green" | "amber" | "red" | "blue" | "slate" | "purple" => {
  if (["Active", "Approved", "Passed", "Valid", "Ready", "Supported", "Resolved", "Completed", "Confirmed"].includes(s)) return "green";
  if (["Warning", "Review Required", "Approval Pending", "Pending", "Validation Warning", "Scheduled", "Approved with Conditions", "Exception Active", "Drift Detected", "Investigating"].includes(s)) return "amber";
  if (["Blocked", "Rejected", "Validation Failed", "Activation Failed", "Error", "Unavailable", "Critical"].includes(s)) return "red";
  if (["Activating", "Validation Running", "Rollback Running", "Draft", "Loading"].includes(s)) return "blue";
  if (["Superseded", "Historical", "Rolled Back", "Not Started", "Empty"].includes(s)) return "slate";
  return "slate";
};

/* --------------------------------------------------------------- models */

export interface DiscoveryValidationResult {
  id: string; validationId: string; category: string;
  configurationElementType: string; configurationElementId: string;
  issue: string; severity: Severity; currentState: string; expectedState: string;
  affectedScopeIds: string[]; recommendedAction: string; owner: string;
  status: ValidationStatus | "Resolved" | "Accepted" | "Exception Created";
}

export interface DiscoveryConfigurationValidation {
  id: string; configurationId: string; configurationVersion: string;
  validationScore: number; passedCount: number; warningCount: number;
  reviewRequiredCount: number; blockedCount: number; validationResultIds: string[];
  status: "Not Run" | "Running" | "Completed" | "Failed";
  startedAt: string; completedAt: string;
}

export interface DiscoveryRuleConflict {
  id: string; configurationId: string; ruleAId: string; ruleBId: string;
  ruleAName: string; ruleBName: string; conflictType: string; overlapScope: string;
  severity: Severity; recommendedResolution: string;
  status: "Open" | "Resolved" | "Valid Override" | "Escalated";
  resolution: string; resolvedBy: string; resolvedAt: string;
}

export interface DiscoveryAccessValidation {
  id: string; configurationId: string; sourceId: string; sourceName: string;
  accessClassification: string; sourcePermissionState: string; residencyState: string;
  derivedContextPolicy: string; result: "Valid" | "Review Required" | "Blocked by policy";
  issues: string; status: ValidationStatus;
}

export interface ResidencyRow {
  id: string; source: string; region: string; classification: string;
  discoveryAllowed: string; processingRegion: string; evidenceRegion: string;
  derivedContextPolicy: string; status: "Valid" | "Review Required" | "Blocked";
}

export interface OwnershipRow {
  id: string; dimension: string; element: string; owner: string;
  status: "Confirmed" | "Pending" | "Missing";
}

export interface DiscoveryConfigurationReview {
  id: string; configurationId: string; configurationVersion: string; reviewType: string;
  issue: string; scope: string; severity: Severity; reviewer: string; reviewerRole: string;
  status: "Open" | "In Review" | "Approved" | "Approved with Conditions" | "Changes Requested" | "Rejected" | "Escalated";
  decision: string; conditions: string; comments: string;
  requestedAt: string; dueAt: string; completedAt: string;
}

export interface DiscoveryConfigurationApproval {
  id: string; configurationId: string; configurationVersion: string; approvalStage: string;
  approver: string; approverRole: string;
  status: "Not Started" | "Pending" | "Approved" | "Approved with Conditions" | "Rejected";
  decision: string; conditions: string; comments: string;
  submittedAt: string; dueAt: string; completedAt: string;
  requiredBecause?: string;
}

export interface DiscoveryConfigurationVersion {
  id: string; configurationId: string; version: string; previousVersionId: string;
  status: ApprovalState; changeReason: string;
  scopeSnapshot: string; sourceConfigSnapshot: string; ruleSnapshot: string;
  permissionPolicySnapshot: string; authorityPolicySnapshot: string; freshnessPolicySnapshot: string;
  cadencePolicySnapshot: string; changeDetectionSnapshot: string; duplicatePolicySnapshot: string;
  traversalPolicySnapshot: string; samplingPolicySnapshot: string; processingHandoffSnapshot: string;
  evidencePolicySnapshot: string;
  sources: number; rules: number; projectedVolume: number; validationScore: number;
  approvalState: ApprovalState; createdBy: string; createdAt: string;
  effectiveDate: string; supersededDate: string;
}

export interface DiscoveryConfigurationImpact {
  id: string; configurationId: string; fromVersion: string; toVersion: string;
  sourcesAdded: number; sourcesRemoved: number; sourcesRestricted: number;
  rulesChanged: number; permissionChanges: number; authorityChanges: number;
  freshnessChanges: number; cadenceChanges: number; processingChanges: number;
  projectedArtifactDelta: number; restrictedArtifactDelta: number;
  conditionEligibleDelta: number; personaRelevantDelta: number;
  downstreamReprocessingEstimate: number; affectedPersonaIds: string[];
  affectedIntakeIds: string[]; affectedImpactEvaluationIds: string[];
  historicalDecisionModificationCount: 0;
}

export interface DiscoveryConfigurationException {
  id: string; configurationId: string; configurationVersion: string; exceptionType: string;
  scope: string; ruleId: string; policyType: string; reason: string; owner: string;
  approver: string; effectiveDate: string; expirationDate: string;
  monitoringRequirements: string;
  status: "Active" | "Expiring" | "Expired" | "Pending Approval" | "Revoked";
}

export interface DiscoveryConfigurationActivation {
  id: string; configurationId: string; configurationVersion: string; environment: string;
  activationMode: "Immediate" | "Scheduled" | "Phased by Scope";
  scheduledAt: string; scope: string; validationStatus: string; approvalStatus: string;
  changeImpactId: string; rollbackVersionId: string; rollbackOwner: string;
  status: "Draft" | "Scheduled" | "Activating" | "Active" | "Activation Failed" | "Cancelled";
  startedAt: string; completedAt: string; activatedBy: string;
}

export interface DiscoveryConfigurationRollback {
  id: string; configurationId: string; fromVersion: string; toVersion: string;
  rollbackType: "Full Configuration" | "Scope Specific Override" | "Emergency Policy Rollback";
  scope: string; reason: string; owner: string; approvalState: string;
  downstreamImpact: string; status: "Draft" | "Rollback Running" | "Rolled Back" | "Failed";
  startedAt: string; completedAt: string;
}

export interface DiscoveryConfigurationDrift {
  id: string; configurationId: string; configurationName: string; configurationVersion: string;
  elementType: string; elementId: string; approvedState: string; observedState: string;
  driftType: string; severity: Severity; detectedAt: string; owner: string;
  status: "Open" | "Investigating" | "Reconciled" | "Exception Accepted" | "Escalated";
  resolution: string;
}

export interface DiscoveryRuntimeCompatibility {
  id: string; configurationId: string; configurationVersion: string; component: string;
  checkType: string; supported: boolean; warning: string; blockingIssue: string;
  status: "Supported" | "Warning" | "Blocked";
}

export interface DiscoveryConfigurationAuditEvent {
  id: string; configurationId: string; configurationVersion: string; timestamp: string;
  actor: string; actorRole: string; action: string; elementType: string; elementId: string;
  previousState: string; newState: string; reason: string; auditId: string;
}

export interface DiscoveryConfigurationNotification {
  id: string; configurationId: string; configurationVersion: string; type: string;
  title: string; description: string; severity: Severity; owner: string;
  status: "Unread" | "Read" | "Acknowledged"; createdAt: string;
}

export interface PublishingEvent {
  id: string; timestamp: string; configuration: string; version: string; environment: string;
  action: string; activatedBy: string; validationResult: string; approvalResult: string;
  scope: string; trigger: string; status: string; auditId: string;
}

export interface ActivityEvent { id: string; time: string; text: string; kind: string }

/* ---------------------------------------------------------------- seeds */

const CFG = "DISC-CFG-001";

export const seedValidationResults: DiscoveryValidationResult[] = [
  {
    id: "VAL-001", validationId: "DCV-4301", category: "Source Ownership",
    configurationElementType: "Source", configurationElementId: "SRC-Confluence-Ops",
    issue: "Source missing confirmed business owner", severity: "Medium",
    currentState: "Owner unconfirmed", expectedState: "Confirmed business owner on record",
    affectedScopeIds: ["Operations"], recommendedAction: "Assign or request owner confirmation",
    owner: "Discovery Operations", status: "Warning",
  },
  {
    id: "VAL-002", validationId: "DCV-4301", category: "Source Ownership",
    configurationElementType: "Source", configurationElementId: "SRC-SharePoint-Legacy",
    issue: "Source missing confirmed business owner", severity: "Medium",
    currentState: "Owner unconfirmed", expectedState: "Confirmed business owner on record",
    affectedScopeIds: ["Corporate"], recommendedAction: "Assign or request owner confirmation",
    owner: "Discovery Operations", status: "Warning",
  },
  {
    id: "VAL-003", validationId: "DCV-4301", category: "Data Residency",
    configurationElementType: "Knowledge Domain", configurationElementId: "DOM-Customer-Support",
    issue: "Domain has incomplete residency metadata", severity: "High",
    currentState: "Residency partially declared", expectedState: "Region and processing region declared",
    affectedScopeIds: ["Customer Support"], recommendedAction: "Complete residency metadata before activation",
    owner: "Data Governance", status: "Warning",
  },
  {
    id: "VAL-004", validationId: "DCV-4301", category: "Cadence Validity",
    configurationElementType: "Source Override", configurationElementId: "SRC-Commerce-Payments",
    issue: "Source override creates cadence inconsistency", severity: "Low",
    currentState: "Event driven under 2 hour parent", expectedState: "Cadence consistent with parent override",
    affectedScopeIds: ["Commerce"], recommendedAction: "Confirm override or reset to inherited",
    owner: "Commerce Architecture", status: "Warning",
  },
  {
    id: "VAL-005", validationId: "DCV-4301", category: "Freshness Coverage",
    configurationElementType: "Content Type", configurationElementId: "CT-Legacy-Wiki",
    issue: "Legacy content type has no freshness policy", severity: "Low",
    currentState: "No freshness SLA", expectedState: "Freshness SLA defined",
    affectedScopeIds: ["Corporate"], recommendedAction: "Define freshness SLA or exclude content type",
    owner: "Discovery Operations", status: "Warning",
  },
  {
    id: "VAL-006", validationId: "DCV-4301", category: "Permission Preservation",
    configurationElementType: "Source", configurationElementId: "SRC-Slack-Restricted",
    issue: "Slack restricted channel scope requires governance review", severity: "High",
    currentState: "Restricted channels in draft scope", expectedState: "Security governance approval on record",
    affectedScopeIds: ["Enterprise"], recommendedAction: "Route to Security Governance review",
    owner: "Security Governance", status: "Review Required",
  },
  {
    id: "VAL-007", validationId: "DCV-4301", category: "Authority Coverage",
    configurationElementType: "Source", configurationElementId: "SRC-Security-Architecture",
    issue: "Security architecture repository authority override", severity: "Medium",
    currentState: "Authority override to Authoritative", expectedState: "Enterprise Architecture confirmation",
    affectedScopeIds: ["Security"], recommendedAction: "Route to Enterprise Architecture review",
    owner: "Enterprise Architecture", status: "Review Required",
  },
  {
    id: "VAL-008", validationId: "DCV-4301", category: "Downstream Eligibility",
    configurationElementType: "Content Type", configurationElementId: "CT-Support-Transcript",
    issue: "Customer Support transcript eligibility requires review", severity: "High",
    currentState: "Condition eligible", expectedState: "Restricted to approved pilot channels",
    affectedScopeIds: ["Customer Support"], recommendedAction: "Restrict eligibility or create governed exception",
    owner: "Data Governance", status: "Review Required",
  },
];

export const validationCategories = [
  "Scope Integrity", "Source Availability Metadata", "Source Ownership", "Permission Preservation",
  "Access Classification", "Data Residency", "Rule Integrity", "Rule Conflicts", "Rule Reachability",
  "Rule Priority", "Authority Coverage", "Freshness Coverage", "Cadence Validity",
  "Change Detection Coverage", "Duplicate Policy", "Traversal Safety", "Sampling Safety",
  "Evidence Preservation", "Processing Handoff Compatibility", "Downstream Eligibility",
  "Configuration Inheritance", "Environment Compatibility",
];

export const seedValidation: DiscoveryConfigurationValidation = {
  id: "DCV-4301", configurationId: CFG, configurationVersion: "4.3",
  validationScore: 96, passedCount: 42, warningCount: 5, reviewRequiredCount: 3, blockedCount: 0,
  validationResultIds: seedValidationResults.map((r) => r.id),
  status: "Completed", startedAt: "10:19 AM", completedAt: "10:22 AM",
};

export const seedRuleConflicts: DiscoveryRuleConflict[] = [
  {
    id: "RCF-001", configurationId: CFG, ruleAId: "RULE-1001", ruleBId: "RULE-1048",
    ruleAName: "Include Architecture Decisions", ruleBName: "Exclude Restricted Security Architecture",
    conflictType: "Include vs Exclude", overlapScope: "Security architecture decision records",
    severity: "Medium", recommendedResolution: "Keep Both with restricted applicability",
    status: "Open", resolution: "", resolvedBy: "", resolvedAt: "",
  },
  {
    id: "RCF-002", configurationId: CFG, ruleAId: "RULE-1102", ruleBId: "RULE-1147",
    ruleAName: "Enterprise Transcript Rule", ruleBName: "Customer Support Restricted Transcript Rule",
    conflictType: "Include vs Restrict", overlapScope: "Customer support transcripts",
    severity: "High", recommendedResolution: "Restrict selected transcripts based on approved source scope",
    status: "Open", resolution: "", resolvedBy: "", resolvedAt: "",
  },
  {
    id: "RCF-003", configurationId: CFG, ruleAId: "RULE-1200", ruleBId: "RULE-1221",
    ruleAName: "Global 6 Hour Cadence", ruleBName: "Commerce 2 Hour Override",
    conflictType: "Conflicting Cadence", overlapScope: "Commerce knowledge domain",
    severity: "Low", recommendedResolution: "Legitimate inheritance override — no action required",
    status: "Valid Override", resolution: "Commerce override accepted under enterprise inheritance policy",
    resolvedBy: "Commerce Architecture", resolvedAt: "10:09 AM",
  },
];

export const conflictTypes = [
  "Include vs Exclude", "Include vs Restrict", "Priority Collision", "Overlapping Scope",
  "Unreachable Rule", "Conflicting Cadence", "Conflicting Authority",
  "Conflicting Processing Eligibility", "Freshness Conflict", "Permission Conflict", "Inheritance Conflict",
];

export const conflictResolutionActions = [
  "Use Rule A", "Use Rule B", "Keep Both with Explicit Precedence", "Split Applicability",
  "Change Priority", "Change Scope", "Create Exception", "Disable One Rule", "Escalate to Governance",
];

export interface ConflictRuleFace {
  name: string; type: string; scope: string; conditions: string; action: string;
  priority: number; owner: string; effectiveDate: string;
}

export const conflictRuleFaces: Record<string, { a: ConflictRuleFace; b: ConflictRuleFace }> = {
  "RCF-001": {
    a: { name: "Include Architecture Decisions", type: "Include", scope: "Enterprise · Architecture domain", conditions: "contentType in (Architecture Decision Record)", action: "Discover and preserve", priority: 20, owner: "Enterprise Architecture", effectiveDate: "2026-04-02" },
    b: { name: "Exclude Restricted Security Architecture", type: "Exclude", scope: "Security · Restricted repositories", conditions: "classification equals Highly Restricted", action: "Exclude from discovery", priority: 10, owner: "Security Governance", effectiveDate: "2026-05-18" },
  },
  "RCF-002": {
    a: { name: "Enterprise Transcript Rule", type: "Include", scope: "Enterprise · Transcript content", conditions: "contentType equals Transcript", action: "Discover with metadata", priority: 40, owner: "Discovery Operations", effectiveDate: "2026-03-11" },
    b: { name: "Customer Support Restricted Transcript Rule", type: "Restrict", scope: "Customer Support · Pilot channels", conditions: "sourceScope not in (Approved Pilot Channels)", action: "Restrict to metadata only", priority: 15, owner: "Data Governance", effectiveDate: "2026-06-01" },
  },
  "RCF-003": {
    a: { name: "Global 6 Hour Cadence", type: "Cadence", scope: "Enterprise", conditions: "always", action: "Incremental every 6 hours", priority: 60, owner: "Discovery Operations", effectiveDate: "2026-01-08" },
    b: { name: "Commerce 2 Hour Override", type: "Cadence Override", scope: "Commerce", conditions: "knowledgeDomain equals Commerce", action: "Incremental every 2 hours", priority: 30, owner: "Commerce Architecture", effectiveDate: "2026-02-20" },
  },
};

export const seedAccessValidations: DiscoveryAccessValidation[] = [
  {
    id: "ACV-001", configurationId: CFG, sourceId: "SRC-Identity-Restricted", sourceName: "Restricted Identity Repository",
    accessClassification: "Highly Restricted", sourcePermissionState: "Source ACL preserved",
    residencyState: "In region only", derivedContextPolicy: "Metadata available to approved governance roles",
    result: "Valid", issues: "Raw content restricted", status: "Passed",
  },
  {
    id: "ACV-002", configurationId: CFG, sourceId: "SRC-Security-Architecture", sourceName: "Security Architecture Repository",
    accessClassification: "Restricted", sourcePermissionState: "Source ACL preserved",
    residencyState: "In region only", derivedContextPolicy: "Governed publication only",
    result: "Review Required", issues: "Authority override and restricted access interact", status: "Review Required",
  },
  {
    id: "ACV-003", configurationId: CFG, sourceId: "SRC-Personal-Drive", sourceName: "Personal Drive Content",
    accessClassification: "Personal", sourcePermissionState: "Excluded by enterprise policy",
    residencyState: "Not applicable", derivedContextPolicy: "Never derived",
    result: "Blocked by policy", issues: "Expected behavior — personal content is never discovered", status: "Passed",
  },
  {
    id: "ACV-004", configurationId: CFG, sourceId: "SRC-Slack-Restricted", sourceName: "Restricted Slack Channels",
    accessClassification: "Restricted", sourcePermissionState: "Unknown permission metadata on 3 channels",
    residencyState: "Global", derivedContextPolicy: "Restricted until reviewed",
    result: "Review Required", issues: "Unknown permission behavior defaults to restrict", status: "Review Required",
  },
];

export const accessChecks = [
  "Source ACL preservation", "Restricted source behavior", "Metadata only behavior",
  "Derived record policy", "Unknown permission behavior", "Permission change handling",
  "Access classification inheritance", "Data residency", "Regional restrictions",
];

export const seedResidency: ResidencyRow[] = [
  { id: "RES-001", source: "EU Security Policy Repository", region: "EU", classification: "Restricted", discoveryAllowed: "Allowed", processingRegion: "EU", evidenceRegion: "EU governed storage", derivedContextPolicy: "Governed publication only", status: "Valid" },
  { id: "RES-002", source: "Customer Support Archive", region: "Mixed", classification: "Confidential", discoveryAllowed: "Allowed with restrictions", processingRegion: "Pending declaration", evidenceRegion: "Pending declaration", derivedContextPolicy: "Restricted until residency declared", status: "Review Required" },
  { id: "RES-003", source: "North America Product Knowledge", region: "North America", classification: "Internal", discoveryAllowed: "Allowed", processingRegion: "North America", evidenceRegion: "North America", derivedContextPolicy: "Standard governed publication", status: "Valid" },
  { id: "RES-004", source: "APAC Operations Wiki", region: "Asia Pacific", classification: "Internal", discoveryAllowed: "Allowed", processingRegion: "Asia Pacific", evidenceRegion: "Asia Pacific", derivedContextPolicy: "Standard governed publication", status: "Valid" },
];

export const seedOwnership: OwnershipRow[] = [
  { id: "OWN-001", dimension: "Configuration Owner", element: "Enterprise Knowledge Discovery", owner: "Discovery Operations", status: "Confirmed" },
  { id: "OWN-002", dimension: "Business Unit Owner", element: "Commerce", owner: "Commerce Architecture", status: "Confirmed" },
  { id: "OWN-003", dimension: "Business Unit Owner", element: "Customer Support", owner: "Support Operations", status: "Pending" },
  { id: "OWN-004", dimension: "Source Owner", element: "SRC-Confluence-Ops", owner: "", status: "Missing" },
  { id: "OWN-005", dimension: "Source Owner", element: "SRC-SharePoint-Legacy", owner: "", status: "Missing" },
  { id: "OWN-006", dimension: "Knowledge Domain Owner", element: "Identity and Access", owner: "Security Governance", status: "Confirmed" },
  { id: "OWN-007", dimension: "Policy Owner", element: "Permission Preservation Policy", owner: "Security Governance", status: "Confirmed" },
  { id: "OWN-008", dimension: "Processing Handoff Owner", element: "Condition Eligibility Handoff", owner: "", status: "Missing" },
  { id: "OWN-009", dimension: "Review Owner", element: "Discovery Configuration Review Queue", owner: "Discovery Governance", status: "Confirmed" },
];

export const seedImpact: DiscoveryConfigurationImpact = {
  id: "IMP-4203", configurationId: CFG, fromVersion: "4.2", toVersion: "4.3",
  sourcesAdded: 6, sourcesRemoved: 2, sourcesRestricted: 3, rulesChanged: 14,
  permissionChanges: 2, authorityChanges: 4, freshnessChanges: 5, cadenceChanges: 2,
  processingChanges: 3, projectedArtifactDelta: 186_000, restrictedArtifactDelta: 22_000,
  conditionEligibleDelta: 18_000, personaRelevantDelta: 9_000,
  downstreamReprocessingEstimate: 42_000,
  affectedPersonaIds: ["TP-101", "TP-104", "TP-107", "TP-112", "TP-118", "TP-121", "TP-126", "TP-133"],
  affectedIntakeIds: ["INT-2201", "INT-2214", "INT-2233"],
  affectedImpactEvaluationIds: ["PIA-3301", "PIA-3318"],
  historicalDecisionModificationCount: 0,
};

export const impactTabs = [
  "Scope Changes", "Source Changes", "Rule Changes", "Permission Changes", "Authority Changes",
  "Freshness Changes", "Cadence Changes", "Processing Changes", "Downstream Impact",
] as const;
export type ImpactTab = (typeof impactTabs)[number];

export const impactDetail: Record<ImpactTab, { label: string; change: string; note: string }[]> = {
  "Scope Changes": [
    { label: "Customer Support (Business Unit)", change: "Added", note: "Pilot scope, restricted transcripts" },
    { label: "Commerce Payments (Knowledge Domain)", change: "Restricted", note: "Metadata only until residency confirmed" },
    { label: "Legacy Corporate Wiki", change: "Removed", note: "Superseded by policy repository" },
  ],
  "Source Changes": [
    { label: "Support Transcript Archive", change: "New Source", note: "Restricted to approved pilot channels" },
    { label: "Learning Outcome Repository", change: "New Source", note: "Inherited from v4.2 expansion" },
    { label: "Legacy SharePoint Archive", change: "Excluded Source", note: "Retired content, superseded" },
    { label: "Security Architecture Repository", change: "Changed Source Policy", note: "Authority override to Authoritative" },
  ],
  "Rule Changes": [
    { label: "RULE-1147 Customer Support Restricted Transcript Rule", change: "Added", note: "Restrict to approved pilot channels" },
    { label: "RULE-1048 Exclude Restricted Security Architecture", change: "Changed", note: "Applicability narrowed" },
    { label: "12 further rule adjustments", change: "Changed", note: "Priority and scope refinements" },
  ],
  "Permission Changes": [
    { label: "Unknown permission behavior", change: "Changed", note: "Defaults to restrict rather than metadata only" },
    { label: "Derived record policy", change: "Changed", note: "Governed publication only for restricted sources" },
  ],
  "Authority Changes": [
    { label: "Architecture Decision Records", change: "Changed", note: "Raised to Authoritative" },
    { label: "Transcripts", change: "Changed", note: "Lowered to Contextual" },
    { label: "Chat messages", change: "Changed", note: "Lowered to Informal Signal" },
    { label: "Policy documents", change: "Unchanged", note: "Remains Authoritative" },
  ],
  "Freshness Changes": [
    { label: "Policy repositories", change: "Changed", note: "Freshness SLA 24 hours" },
    { label: "Engineering repositories", change: "Changed", note: "Freshness SLA 6 hours" },
    { label: "Legacy wiki", change: "Missing", note: "No freshness policy defined" },
  ],
  "Cadence Changes": [
    { label: "Enterprise cadence", change: "Unchanged", note: "Every 6 hours" },
    { label: "Commerce override", change: "Changed", note: "Every 2 hours, valid inheritance override" },
    { label: "Payments source override", change: "Added", note: "Event driven" },
  ],
  "Processing Changes": [
    { label: "Condition extraction eligibility", change: "Changed", note: "Support transcripts restricted" },
    { label: "Persona relevance handoff", change: "Changed", note: "Quality threshold raised" },
    { label: "Cognitive Memory publication", change: "Unchanged", note: "Governed publication only" },
  ],
  "Downstream Impact": [
    { label: "Artifact Ingestion", change: "Reassessment", note: "+186K artifacts eligible for discovery" },
    { label: "Normalization", change: "Reassessment", note: "42K artifacts may be reprocessed" },
    { label: "Conditions", change: "Reassessment", note: "+18K condition eligible artifacts" },
    { label: "Personas", change: "Reassessment", note: "8 team personas may gain new context" },
    { label: "Cognitive Memory", change: "Reassessment", note: "Publication remains governed" },
    { label: "Active Intake", change: "Notification", note: "3 active intakes may see new evidence" },
    { label: "Impact Evaluations", change: "Notification", note: "2 evaluations may be re-run by owners" },
    { label: "Decision Evaluations", change: "No modification", note: "Historical decisions are never modified" },
  ],
};

export const seedReviews: DiscoveryConfigurationReview[] = [
  { id: "DCR-4201", configurationId: CFG, configurationVersion: "4.3", reviewType: "Permission Review", issue: "Restricted Slack Scope", scope: "Enterprise Knowledge Discovery v4.3", severity: "High", reviewer: "Security Governance", reviewerRole: "Security Governance", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "10:18 AM", dueAt: "In 2 days", completedAt: "" },
  { id: "DCR-4202", configurationId: CFG, configurationVersion: "4.3", reviewType: "Residency Review", issue: "Customer Support Archive", scope: "Enterprise Knowledge Discovery v4.3", severity: "High", reviewer: "Data Governance", reviewerRole: "Data Governance", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "10:14 AM", dueAt: "In 2 days", completedAt: "" },
  { id: "DCR-4203", configurationId: CFG, configurationVersion: "4.3", reviewType: "Authority Review", issue: "Security Architecture Records", scope: "Enterprise Knowledge Discovery v4.3", severity: "Medium", reviewer: "Enterprise Architecture", reviewerRole: "Enterprise Architecture", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "10:11 AM", dueAt: "In 4 days", completedAt: "" },
  { id: "DCR-4204", configurationId: "DISC-CFG-002", configurationVersion: "3.2", reviewType: "Cadence Review", issue: "Two Hour Override", scope: "Commerce Discovery v3.2", severity: "Low", reviewer: "Commerce Architecture", reviewerRole: "Commerce Architecture", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "10:09 AM", dueAt: "In 6 days", completedAt: "" },
  { id: "DCR-4205", configurationId: CFG, configurationVersion: "4.3", reviewType: "Ownership Review", issue: "Two sources missing business owner", scope: "Operations, Corporate", severity: "Medium", reviewer: "Discovery Operations", reviewerRole: "Discovery Operations", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "10:03 AM", dueAt: "In 3 days", completedAt: "" },
  { id: "DCR-4206", configurationId: CFG, configurationVersion: "4.3", reviewType: "Processing Review", issue: "Condition eligibility handoff owner missing", scope: "Enterprise", severity: "Medium", reviewer: "Discovery Governance", reviewerRole: "Discovery Governance", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "10:01 AM", dueAt: "In 3 days", completedAt: "" },
  { id: "DCR-4207", configurationId: CFG, configurationVersion: "4.3", reviewType: "Rule Review", issue: "Architecture include versus security exclude", scope: "Security", severity: "Medium", reviewer: "Enterprise Architecture", reviewerRole: "Enterprise Architecture", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "09:57 AM", dueAt: "In 4 days", completedAt: "" },
  { id: "DCR-4208", configurationId: "DISC-CFG-003", configurationVersion: "2.6", reviewType: "Scope Review", issue: "Identity restricted knowledge scope", scope: "Identity Restricted Knowledge v2.6", severity: "Medium", reviewer: "Security Governance", reviewerRole: "Security Governance", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "09:51 AM", dueAt: "In 5 days", completedAt: "" },
  { id: "DCR-4209", configurationId: CFG, configurationVersion: "4.3", reviewType: "Freshness Review", issue: "Legacy content type freshness policy", scope: "Corporate", severity: "Low", reviewer: "Discovery Operations", reviewerRole: "Discovery Operations", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "09:47 AM", dueAt: "In 7 days", completedAt: "" },
  { id: "DCR-4210", configurationId: "DISC-CFG-002", configurationVersion: "3.2", reviewType: "Processing Review", issue: "Payments event driven override", scope: "Commerce", severity: "Low", reviewer: "Commerce Architecture", reviewerRole: "Commerce Architecture", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "09:42 AM", dueAt: "In 7 days", completedAt: "" },
  { id: "DCR-4211", configurationId: CFG, configurationVersion: "4.3", reviewType: "Evidence Review", issue: "Evidence preservation for restricted sources", scope: "Enterprise", severity: "Medium", reviewer: "Data Governance", reviewerRole: "Data Governance", status: "Open", decision: "", conditions: "", comments: "", requestedAt: "09:38 AM", dueAt: "In 5 days", completedAt: "" },
];

export const seedApprovals: DiscoveryConfigurationApproval[] = [
  { id: "APR-01", configurationId: CFG, configurationVersion: "4.3", approvalStage: "Configuration Owner Review", approver: "D. Okafor", approverRole: "Discovery Operations", status: "Approved", decision: "Approved", conditions: "", comments: "Scope and rules reviewed against v4.2 baseline.", submittedAt: "09:54 AM", dueAt: "Today", completedAt: "10:02 AM" },
  { id: "APR-02", configurationId: CFG, configurationVersion: "4.3", approvalStage: "Enterprise Architecture Review", approver: "M. Halvorsen", approverRole: "Enterprise Architecture", status: "Approved", decision: "Approved", conditions: "", comments: "Authority preferences acceptable.", submittedAt: "10:02 AM", dueAt: "Today", completedAt: "10:16 AM" },
  { id: "APR-03", configurationId: CFG, configurationVersion: "4.3", approvalStage: "Security Governance Review", approver: "R. Bhatt", approverRole: "Security Governance", status: "Pending", decision: "", conditions: "", comments: "", submittedAt: "10:18 AM", dueAt: "In 2 days", completedAt: "", requiredBecause: "Restricted Sources, Permission Policy" },
  { id: "APR-04", configurationId: CFG, configurationVersion: "4.3", approvalStage: "Data Governance Review", approver: "L. Ferreira", approverRole: "Data Governance", status: "Pending", decision: "", conditions: "", comments: "", submittedAt: "10:18 AM", dueAt: "In 2 days", completedAt: "", requiredBecause: "Data Residency, Evidence Preservation Changes" },
  { id: "APR-05", configurationId: CFG, configurationVersion: "4.3", approvalStage: "Discovery Operations Review", approver: "S. Iyer", approverRole: "Discovery Operations", status: "Not Started", decision: "", conditions: "", comments: "", submittedAt: "", dueAt: "", completedAt: "" },
  { id: "APR-06", configurationId: CFG, configurationVersion: "4.3", approvalStage: "Final Activation Approval", approver: "Discovery Governance Board", approverRole: "Governance Board", status: "Not Started", decision: "", conditions: "", comments: "", submittedAt: "", dueAt: "", completedAt: "" },
];

export const materialityTriggers = [
  "Restricted Sources", "Data Residency", "Permission Policy", "Enterprise Wide Exclusions",
  "Authority Overrides", "Evidence Preservation Changes", "Protected Content Sampling",
];

const snap = (s: string) => s;

export const seedVersions: DiscoveryConfigurationVersion[] = [
  {
    id: "DCVER-38", configurationId: CFG, version: "3.8", previousVersionId: "", status: "Historical",
    changeReason: "Initial enterprise wide configuration",
    scopeSnapshot: snap("6 business units"), sourceConfigSnapshot: snap("108 sources"), ruleSnapshot: snap("96 rules"),
    permissionPolicySnapshot: snap("Preserve source ACL"), authorityPolicySnapshot: snap("Baseline authority bands"),
    freshnessPolicySnapshot: snap("Daily"), cadencePolicySnapshot: snap("Every 12 hours"),
    changeDetectionSnapshot: snap("Content hash"), duplicatePolicySnapshot: snap("Exact match"),
    traversalPolicySnapshot: snap("Depth 2"), samplingPolicySnapshot: snap("No sampling"),
    processingHandoffSnapshot: snap("Ingestion only"), evidencePolicySnapshot: snap("Provenance preserved"),
    sources: 108, rules: 96, projectedVolume: 1_420_000, validationScore: 88, approvalState: "Historical",
    createdBy: "Discovery Operations", createdAt: "2025-08-14", effectiveDate: "2025-08-20", supersededDate: "2025-11-02",
  },
  {
    id: "DCVER-40", configurationId: CFG, version: "4.0", previousVersionId: "DCVER-38", status: "Superseded",
    changeReason: "Expanded architecture and policy repositories",
    scopeSnapshot: snap("8 business units"), sourceConfigSnapshot: snap("136 sources"), ruleSnapshot: snap("118 rules"),
    permissionPolicySnapshot: snap("Preserve source ACL"), authorityPolicySnapshot: snap("Architecture raised"),
    freshnessPolicySnapshot: snap("Daily and 12 hour"), cadencePolicySnapshot: snap("Every 8 hours"),
    changeDetectionSnapshot: snap("Content hash and metadata"), duplicatePolicySnapshot: snap("Exact and near match"),
    traversalPolicySnapshot: snap("Depth 3"), samplingPolicySnapshot: snap("No sampling"),
    processingHandoffSnapshot: snap("Ingestion, normalization"), evidencePolicySnapshot: snap("Provenance preserved"),
    sources: 136, rules: 118, projectedVolume: 1_880_000, validationScore: 91, approvalState: "Superseded",
    createdBy: "Enterprise Architecture", createdAt: "2025-10-29", effectiveDate: "2025-11-02", supersededDate: "2026-02-11",
  },
  {
    id: "DCVER-41", configurationId: CFG, version: "4.1", previousVersionId: "DCVER-40", status: "Superseded",
    changeReason: "Added stricter permission preservation",
    scopeSnapshot: snap("8 business units"), sourceConfigSnapshot: snap("144 sources"), ruleSnapshot: snap("128 rules"),
    permissionPolicySnapshot: snap("Preserve ACL, classification, residency"), authorityPolicySnapshot: snap("Unchanged"),
    freshnessPolicySnapshot: snap("Tiered"), cadencePolicySnapshot: snap("Every 6 hours"),
    changeDetectionSnapshot: snap("Hash, metadata, permission"), duplicatePolicySnapshot: snap("Near match with review"),
    traversalPolicySnapshot: snap("Depth 3"), samplingPolicySnapshot: snap("Protected classes excluded"),
    processingHandoffSnapshot: snap("Ingestion, normalization, conditions"), evidencePolicySnapshot: snap("Provenance and version preserved"),
    sources: 144, rules: 128, projectedVolume: 2_060_000, validationScore: 93, approvalState: "Superseded",
    createdBy: "Security Governance", createdAt: "2026-02-04", effectiveDate: "2026-02-11", supersededDate: "2026-05-06",
  },
  {
    id: "DCVER-42", configurationId: CFG, version: "4.2", previousVersionId: "DCVER-41", status: "Active",
    changeReason: "Added learning and outcome repositories",
    scopeSnapshot: snap("9 business units, 22 knowledge domains"), sourceConfigSnapshot: snap("156 sources"), ruleSnapshot: snap("148 rules"),
    permissionPolicySnapshot: snap("Preserve ACL, classification, residency"), authorityPolicySnapshot: snap("Learning content contextual"),
    freshnessPolicySnapshot: snap("Tiered by source type"), cadencePolicySnapshot: snap("Every 6 hours with Commerce 2 hour override"),
    changeDetectionSnapshot: snap("Hash, metadata, permission, deletion"), duplicatePolicySnapshot: snap("Near match with review"),
    traversalPolicySnapshot: snap("Depth 3 within approved scope"), samplingPolicySnapshot: snap("Protected classes excluded"),
    processingHandoffSnapshot: snap("Ingestion, normalization, conditions, personas, memory"), evidencePolicySnapshot: snap("Full provenance and version history"),
    sources: 156, rules: 148, projectedVolume: 2_214_000, validationScore: 95, approvalState: "Approved",
    createdBy: "Discovery Operations", createdAt: "2026-04-28", effectiveDate: "2026-05-06", supersededDate: "",
  },
  {
    id: "DCVER-43", configurationId: CFG, version: "4.3", previousVersionId: "DCVER-42", status: "Draft",
    changeReason: "Adds Customer Support pilot, revised transcript restrictions, new freshness policy",
    scopeSnapshot: snap("10 business units, 22 knowledge domains"), sourceConfigSnapshot: snap("162 sources"), ruleSnapshot: snap("162 rules"),
    permissionPolicySnapshot: snap("Unknown permissions restrict by default"), authorityPolicySnapshot: snap("Transcripts contextual, architecture authoritative"),
    freshnessPolicySnapshot: snap("New policy repository SLA"), cadencePolicySnapshot: snap("Every 6 hours, Commerce 2 hour, Payments event driven"),
    changeDetectionSnapshot: snap("Hash, metadata, permission, deletion"), duplicatePolicySnapshot: snap("Near match with review"),
    traversalPolicySnapshot: snap("Depth 3 within approved scope"), samplingPolicySnapshot: snap("Protected classes excluded"),
    processingHandoffSnapshot: snap("Support transcripts restricted"), evidencePolicySnapshot: snap("Full provenance and version history"),
    sources: 162, rules: 162, projectedVolume: 2_400_000, validationScore: 96, approvalState: "Approval Pending",
    createdBy: "Discovery Operations", createdAt: "2026-08-06", effectiveDate: "", supersededDate: "",
  },
];

export type DiffState = "Added" | "Removed" | "Changed" | "Unchanged" | "Restricted" | "Material Change";

export interface ComparisonRow {
  dimension: string; element: string; from: string; to: string; state: DiffState; panel: string;
}

export const seedComparison: ComparisonRow[] = [
  { dimension: "Scope", element: "Business Units", from: "9", to: "10", state: "Added", panel: "panel-scope" },
  { dimension: "Scope", element: "Knowledge Domains", from: "22", to: "22", state: "Unchanged", panel: "panel-scope" },
  { dimension: "Scope", element: "Customer Support", from: "Not in scope", to: "Pilot scope", state: "Material Change", panel: "panel-scope" },
  { dimension: "Sources", element: "Included sources", from: "156", to: "162", state: "Added", panel: "panel-platforms" },
  { dimension: "Sources", element: "Legacy SharePoint Archive", from: "Included", to: "Excluded", state: "Removed", panel: "panel-platforms" },
  { dimension: "Sources", element: "Support Transcript Archive", from: "Absent", to: "Restricted", state: "Restricted", panel: "panel-platforms" },
  { dimension: "Content Types", element: "Support transcript", from: "Not configured", to: "Restrict", state: "Restricted", panel: "panel-content-types" },
  { dimension: "Rules", element: "Total rules", from: "148", to: "162", state: "Changed", panel: "panel-rules" },
  { dimension: "Rules", element: "RULE-1147 Restricted transcripts", from: "Absent", to: "Active", state: "Added", panel: "panel-rules" },
  { dimension: "Permissions", element: "Unknown permission behavior", from: "Metadata only", to: "Restrict", state: "Material Change", panel: "panel-permissions" },
  { dimension: "Permissions", element: "Derived record policy", from: "Standard", to: "Governed publication only", state: "Changed", panel: "panel-permissions" },
  { dimension: "Authority", element: "Architecture decision records", from: "Reference", to: "Authoritative", state: "Changed", panel: "panel-authority" },
  { dimension: "Authority", element: "Transcripts", from: "Reference", to: "Contextual", state: "Changed", panel: "panel-authority" },
  { dimension: "Freshness", element: "Policy repositories", from: "48 hours", to: "24 hours", state: "Changed", panel: "panel-freshness" },
  { dimension: "Cadence", element: "Enterprise cadence", from: "Every 6 hours", to: "Every 6 hours", state: "Unchanged", panel: "panel-cadence" },
  { dimension: "Cadence", element: "Payments override", from: "Inherited", to: "Event driven", state: "Added", panel: "panel-cadence" },
  { dimension: "Change Detection", element: "Deletion handling", from: "Enabled", to: "Enabled", state: "Unchanged", panel: "panel-change-detection" },
  { dimension: "Duplicate Policy", element: "Human review threshold", from: "0.82", to: "0.86", state: "Changed", panel: "panel-duplicates" },
  { dimension: "Traversal", element: "Max depth", from: "3", to: "3", state: "Unchanged", panel: "panel-traversal" },
  { dimension: "Sampling", element: "Protected classes", from: "Excluded", to: "Excluded", state: "Unchanged", panel: "panel-sampling" },
  { dimension: "Processing Handoffs", element: "Condition eligibility", from: "Open", to: "Restricted for transcripts", state: "Material Change", panel: "panel-handoffs" },
  { dimension: "Evidence Preservation", element: "Version history", from: "Preserved", to: "Preserved", state: "Unchanged", panel: "panel-evidence" },
  { dimension: "Projected Volume", element: "Discoverable artifacts", from: "2.21M", to: "2.40M", state: "Changed", panel: "panel-preview" },
  { dimension: "Validation", element: "Validation score", from: "95", to: "96", state: "Changed", panel: "panel-validation" },
];

export interface InheritanceNode {
  id: string; level: string; label: string; cadence: string;
  state: "Inherited" | "Explicit Override" | "Locked by Enterprise Policy" | "Cannot Override" | "Conflict";
  note: string; depth: number;
}

export const seedInheritance: InheritanceNode[] = [
  { id: "INH-1", level: "Enterprise Configuration", label: "Enterprise Knowledge Discovery", cadence: "Every 6 hours", state: "Inherited", note: "Enterprise baseline", depth: 0 },
  { id: "INH-2", level: "Business Unit Configuration", label: "Commerce", cadence: "Every 2 hours", state: "Explicit Override", note: "Approved commerce override", depth: 1 },
  { id: "INH-3", level: "Knowledge Domain Configuration", label: "Payments", cadence: "Event driven", state: "Explicit Override", note: "Payments source override", depth: 2 },
  { id: "INH-4", level: "Source Platform Configuration", label: "Confluence", cadence: "Every 6 hours", state: "Inherited", note: "Inherits enterprise cadence", depth: 3 },
  { id: "INH-5", level: "Specific Source Override", label: "Payments Runbook Space", cadence: "Event driven", state: "Explicit Override", note: "Inherits payments override", depth: 4 },
  { id: "INH-6", level: "Enterprise Configuration", label: "Preserve Source Permissions", cadence: "Enforced", state: "Locked by Enterprise Policy", note: "Cannot be overridden at any level", depth: 0 },
  { id: "INH-7", level: "Enterprise Configuration", label: "Preserve Evidence Provenance", cadence: "Enforced", state: "Locked by Enterprise Policy", note: "Cannot be overridden at any level", depth: 0 },
  { id: "INH-8", level: "Enterprise Configuration", label: "Exclude Secrets", cadence: "Enforced", state: "Cannot Override", note: "Enterprise protected control", depth: 0 },
  { id: "INH-9", level: "Enterprise Configuration", label: "Historical Version Preservation", cadence: "Enforced", state: "Cannot Override", note: "Enterprise protected control", depth: 0 },
  { id: "INH-10", level: "Enterprise Configuration", label: "Data Residency Requirements", cadence: "Enforced", state: "Cannot Override", note: "Enterprise protected control", depth: 0 },
  { id: "INH-11", level: "Knowledge Domain Configuration", label: "Customer Support", cadence: "Every 6 hours", state: "Conflict", note: "Residency metadata incomplete", depth: 2 },
];

export const protectedControls = [
  "Preserve Source Permissions", "Preserve Evidence Provenance", "Exclude Secrets",
  "Historical Version Preservation", "Data Residency Requirements",
];

export const seedExceptions: DiscoveryConfigurationException[] = [
  {
    id: "EXC-501", configurationId: CFG, configurationVersion: "4.3",
    exceptionType: "Temporary source inclusion", scope: "Approved pilot channels", ruleId: "RULE-1147",
    policyType: "Restricted access behavior", reason: "Temporary Customer Support Transcript Pilot",
    owner: "Support Operations", approver: "Data Governance",
    effectiveDate: "2026-08-06", expirationDate: "2026-09-05",
    monitoringRequirements: "Weekly access review · Review required before extension", status: "Active",
  },
  {
    id: "EXC-502", configurationId: "DISC-CFG-002", configurationVersion: "3.2",
    exceptionType: "Temporary cadence change", scope: "Commerce peak trading window", ruleId: "RULE-1221",
    policyType: "Cadence", reason: "Peak trading discovery acceleration",
    owner: "Commerce Architecture", approver: "Discovery Operations",
    effectiveDate: "2026-07-20", expirationDate: "2026-08-09",
    monitoringRequirements: "Scheduler load monitoring", status: "Expiring",
  },
  {
    id: "EXC-503", configurationId: CFG, configurationVersion: "4.2",
    exceptionType: "Temporary source exclusion", scope: "Legacy SharePoint Archive", ruleId: "RULE-1066",
    policyType: "Scope", reason: "Retirement migration in progress",
    owner: "Discovery Operations", approver: "Enterprise Architecture",
    effectiveDate: "2026-05-10", expirationDate: "2026-07-09",
    monitoringRequirements: "Migration completion confirmation", status: "Expired",
  },
];

export const exceptionTypes = [
  "Temporary source inclusion", "Temporary source exclusion", "Temporary cadence change",
  "Temporary restricted access behavior", "Temporary sampling override",
];

export interface EnvironmentRow {
  id: string; environment: string; version: string; validation: string;
  preview: string; approval: string; activation: string;
  status: "Current" | "Ready" | "Blocked" | "Not Promoted";
}

export const seedEnvironments: EnvironmentRow[] = [
  { id: "ENV-1", environment: "Development Simulation", version: "4.3 Draft", validation: "Completed 96 / 100", preview: "2.4M artifacts", approval: "Not required", activation: "Simulated", status: "Current" },
  { id: "ENV-2", environment: "Validation", version: "4.3 Draft", validation: "Completed 96 / 100", preview: "2.4M artifacts", approval: "Not required", activation: "Validated", status: "Ready" },
  { id: "ENV-3", environment: "Preproduction", version: "4.2", validation: "Completed 95 / 100", preview: "2.21M artifacts", approval: "Approved", activation: "Active", status: "Ready" },
  { id: "ENV-4", environment: "Production", version: "4.2", validation: "Completed 95 / 100", preview: "2.21M artifacts", approval: "Approved", activation: "Active 2026-05-06", status: "Current" },
];

export const activationSteps = [
  "Select Approved Configuration Version", "Select Activation Mode", "Preactivation Validation",
  "Change Impact Review", "Activation Controls", "Rollback Plan", "Review", "Activate",
];

export const activationExecutionSteps = [
  "Lock Configuration Version", "Validate Policy", "Publish Configuration", "Update Discovery Scheduler",
  "Update Source Scope", "Update Rule Engine", "Update Permission Rules", "Update Processing Handoffs",
  "Create Activation Record", "Trigger Synthetic Discovery Job", "Completed",
];

export const preactivationChecks = [
  "Permissions", "Residency", "Owners", "Rules", "Processing Handoffs",
  "Connector Metadata Compatibility", "Source Scope",
];

export const seedRuntimeCompatibility: DiscoveryRuntimeCompatibility[] = [
  { id: "RTC-01", configurationId: CFG, configurationVersion: "4.3", component: "Source Registry", checkType: "Source Platform Supported", supported: true, warning: "", blockingIssue: "", status: "Supported" },
  { id: "RTC-02", configurationId: CFG, configurationVersion: "4.3", component: "Artifact Ingestion", checkType: "Content Type Supported", supported: true, warning: "Legacy wiki parser is deprecated", blockingIssue: "", status: "Warning" },
  { id: "RTC-03", configurationId: CFG, configurationVersion: "4.3", component: "Permission Policy Service", checkType: "Permission Metadata Supported", supported: true, warning: "", blockingIssue: "", status: "Supported" },
  { id: "RTC-04", configurationId: CFG, configurationVersion: "4.3", component: "Artifact Ingestion", checkType: "Parser Available", supported: true, warning: "", blockingIssue: "", status: "Supported" },
  { id: "RTC-05", configurationId: CFG, configurationVersion: "4.3", component: "Normalization Pipeline", checkType: "Normalization Path Available", supported: true, warning: "", blockingIssue: "", status: "Supported" },
  { id: "RTC-06", configurationId: CFG, configurationVersion: "4.3", component: "Conditions Pipeline", checkType: "Condition Eligibility Supported", supported: true, warning: "", blockingIssue: "", status: "Supported" },
  { id: "RTC-07", configurationId: CFG, configurationVersion: "4.3", component: "Persona Studio", checkType: "Persona Relevance Path Supported", supported: true, warning: "", blockingIssue: "", status: "Supported" },
  { id: "RTC-08", configurationId: CFG, configurationVersion: "4.3", component: "Cognitive Memory", checkType: "Memory Handoff Supported", supported: true, warning: "", blockingIssue: "", status: "Supported" },
  { id: "RTC-09", configurationId: CFG, configurationVersion: "4.3", component: "Discovery Scheduler", checkType: "Scheduler Compatible", supported: true, warning: "", blockingIssue: "", status: "Supported" },
  { id: "RTC-10", configurationId: CFG, configurationVersion: "4.3", component: "Configuration Service", checkType: "Current Version Compatible", supported: true, warning: "", blockingIssue: "", status: "Supported" },
];

export interface PrecheckRow { id: string; dependency: string; state: "Ready" | "Warning" | "Unavailable"; note: string }

export const seedPrecheck: PrecheckRow[] = [
  { id: "PRE-1", dependency: "Configuration Service", state: "Ready", note: "Synthetic configuration service responding" },
  { id: "PRE-2", dependency: "Rule Evaluation Service", state: "Ready", note: "162 rules loadable" },
  { id: "PRE-3", dependency: "Permission Policy Service", state: "Ready", note: "Policy set current" },
  { id: "PRE-4", dependency: "Discovery Scheduler", state: "Ready", note: "Schedule slots available" },
  { id: "PRE-5", dependency: "Source Registry", state: "Ready", note: "Registry scope reconciled" },
  { id: "PRE-6", dependency: "Ingestion Queue", state: "Ready", note: "Queue depth nominal" },
  { id: "PRE-7", dependency: "Normalization Pipeline", state: "Warning", note: "Normalization backlog elevated but within activation threshold" },
  { id: "PRE-8", dependency: "Conditions Pipeline", state: "Ready", note: "Extraction workers available" },
  { id: "PRE-9", dependency: "Memory Publishing", state: "Ready", note: "Governed publication path available" },
];

export const seedDrift: DiscoveryConfigurationDrift[] = [
  {
    id: "DRF-001", configurationId: "DISC-CFG-002", configurationName: "Commerce Discovery", configurationVersion: "3.2",
    elementType: "Cadence", elementId: "Commerce incremental cadence", approvedState: "2 Hours", observedState: "4 Hours",
    driftType: "Cadence Drift", severity: "High", detectedAt: "09:44 AM", owner: "Commerce Architecture",
    status: "Open", resolution: "",
  },
  {
    id: "DRF-002", configurationId: "DISC-CFG-003", configurationName: "Identity Restricted Knowledge", configurationVersion: "2.6",
    elementType: "Source Scope", elementId: "Identity source scope", approvedState: "28 sources", observedState: "27 sources",
    driftType: "Source Scope Drift", severity: "Medium", detectedAt: "09:31 AM", owner: "Security Governance",
    status: "Open", resolution: "",
  },
];

export const driftTypes = [
  "Source Scope Drift", "Rule Drift", "Cadence Drift", "Permission Policy Drift",
  "Authority Drift", "Processing Handoff Drift", "Environment Drift", "Owner Drift",
];

export const seedPublishing: PublishingEvent[] = [
  { id: "PUB-011", timestamp: "2026-05-06 08:12", configuration: "Enterprise Knowledge Discovery", version: "4.2", environment: "Production", action: "Activated", activatedBy: "D. Okafor", validationResult: "95 / 100", approvalResult: "Approved", scope: "Enterprise", trigger: "Manual activation", status: "Completed", auditId: "AUD-88120" },
  { id: "PUB-010", timestamp: "2026-05-04 15:40", configuration: "Enterprise Knowledge Discovery", version: "4.2", environment: "Preproduction", action: "Promoted", activatedBy: "S. Iyer", validationResult: "95 / 100", approvalResult: "Approved", scope: "Enterprise", trigger: "Promotion", status: "Completed", auditId: "AUD-88104" },
  { id: "PUB-009", timestamp: "2026-02-11 07:55", configuration: "Enterprise Knowledge Discovery", version: "4.1", environment: "Production", action: "Activated", activatedBy: "R. Bhatt", validationResult: "93 / 100", approvalResult: "Approved", scope: "Enterprise", trigger: "Scheduled activation", status: "Completed", auditId: "AUD-81022" },
  { id: "PUB-008", timestamp: "2026-01-19 11:02", configuration: "Commerce Discovery", version: "3.1", environment: "Production", action: "Rolled Back", activatedBy: "Commerce Architecture", validationResult: "90 / 100", approvalResult: "Emergency", scope: "Commerce", trigger: "Cadence regression", status: "Completed", auditId: "AUD-79553" },
  { id: "PUB-007", timestamp: "2025-11-02 09:14", configuration: "Enterprise Knowledge Discovery", version: "4.0", environment: "Production", action: "Activated", activatedBy: "Enterprise Architecture", validationResult: "91 / 100", approvalResult: "Approved", scope: "Enterprise", trigger: "Manual activation", status: "Completed", auditId: "AUD-70441" },
];

export const seedAudit: DiscoveryConfigurationAuditEvent[] = [
  { id: "AE-01", configurationId: CFG, configurationVersion: "4.3", timestamp: "10:22 AM", actor: "Discovery Operations", actorRole: "Configuration Owner", action: "Validation Run", elementType: "Configuration", elementId: CFG, previousState: "Validation Required", newState: "Validation Warning", reason: "Preapproval validation", auditId: "AUD-90211" },
  { id: "AE-02", configurationId: CFG, configurationVersion: "4.3", timestamp: "10:18 AM", actor: "Discovery Governance", actorRole: "Governance", action: "Review Submitted", elementType: "Review", elementId: "DCR-4201", previousState: "Draft", newState: "Open", reason: "Restricted Slack scope requires security review", auditId: "AUD-90208" },
  { id: "AE-03", configurationId: CFG, configurationVersion: "4.3", timestamp: "10:14 AM", actor: "Data Governance", actorRole: "Data Governance", action: "Rule Changed", elementType: "Rule", elementId: "RULE-1147", previousState: "Include", newState: "Restrict", reason: "Customer Support transcript restriction", auditId: "AUD-90204" },
  { id: "AE-04", configurationId: "DISC-CFG-002", configurationVersion: "3.2", timestamp: "10:09 AM", actor: "Commerce Architecture", actorRole: "Business Unit Owner", action: "Cadence Changed", elementType: "Cadence", elementId: "Commerce override", previousState: "Inherited 6 hours", newState: "2 hours", reason: "Confirmed valid inheritance override", auditId: "AUD-90199" },
  { id: "AE-05", configurationId: CFG, configurationVersion: "4.3", timestamp: "10:06 AM", actor: "Data Governance", actorRole: "Data Governance", action: "Validation Run", elementType: "Residency", elementId: "EU Security Policy Repository", previousState: "Unvalidated", newState: "Valid", reason: "EU residency validation", auditId: "AUD-90193" },
  { id: "AE-06", configurationId: CFG, configurationVersion: "4.3", timestamp: "10:03 AM", actor: "Discovery Operations", actorRole: "Configuration Owner", action: "Configuration Created", elementType: "Owner", elementId: "2 sources", previousState: "Missing", newState: "Assigned", reason: "Owner assignment", auditId: "AUD-90188" },
  { id: "AE-07", configurationId: CFG, configurationVersion: "4.3", timestamp: "09:52 AM", actor: "Discovery Operations", actorRole: "Configuration Owner", action: "Configuration Created", elementType: "Version", elementId: "4.3", previousState: "v4.2 Active", newState: "v4.3 Draft", reason: "Draft created from v4.2", auditId: "AUD-90170" },
];

export const auditActions = [
  "Configuration Created", "Scope Changed", "Source Added", "Source Removed", "Rule Added",
  "Rule Changed", "Rule Disabled", "Permission Changed", "Authority Changed", "Freshness Changed",
  "Cadence Changed", "Processing Handoff Changed", "Validation Run", "Warning Accepted",
  "Exception Created", "Review Submitted", "Approved", "Rejected", "Activated", "Rolled Back", "Drift Detected",
];

export const seedNotifications: DiscoveryConfigurationNotification[] = [
  { id: "NTF-01", configurationId: CFG, configurationVersion: "4.3", type: "Validation Completed", title: "Validation completed at 96 / 100", description: "5 warnings and 3 review required items", severity: "Medium", owner: "Discovery Operations", status: "Unread", createdAt: "10:22 AM" },
  { id: "NTF-02", configurationId: CFG, configurationVersion: "4.3", type: "Permission Review Required", title: "Restricted Slack scope requires security review", description: "DCR-4201 assigned to Security Governance", severity: "High", owner: "Security Governance", status: "Unread", createdAt: "10:18 AM" },
  { id: "NTF-03", configurationId: CFG, configurationVersion: "4.3", type: "Residency Review Required", title: "Customer Support Archive residency incomplete", description: "DCR-4202 assigned to Data Governance", severity: "High", owner: "Data Governance", status: "Unread", createdAt: "10:14 AM" },
  { id: "NTF-04", configurationId: CFG, configurationVersion: "4.3", type: "Rule Conflict Detected", title: "Transcript include versus restrict conflict", description: "RCF-002 requires resolution before activation", severity: "High", owner: "Discovery Governance", status: "Unread", createdAt: "10:12 AM" },
  { id: "NTF-05", configurationId: CFG, configurationVersion: "4.3", type: "Owner Missing", title: "Two sources missing business owner", description: "Assign or request owner confirmation", severity: "Medium", owner: "Discovery Operations", status: "Read", createdAt: "10:03 AM" },
  { id: "NTF-06", configurationId: "DISC-CFG-002", configurationVersion: "3.2", type: "Configuration Drift Detected", title: "Commerce cadence drift detected", description: "Approved 2 hours, observed 4 hours", severity: "High", owner: "Commerce Architecture", status: "Unread", createdAt: "09:44 AM" },
  { id: "NTF-07", configurationId: "DISC-CFG-002", configurationVersion: "3.2", type: "Exception Expiring", title: "Commerce peak cadence exception expires in 3 days", description: "EXC-502 requires review before extension", severity: "Medium", owner: "Commerce Architecture", status: "Unread", createdAt: "09:20 AM" },
  { id: "NTF-08", configurationId: CFG, configurationVersion: "4.3", type: "Configuration Draft Created", title: "Enterprise Discovery v4.3 draft created", description: "Draft created from Active v4.2", severity: "Low", owner: "Discovery Operations", status: "Read", createdAt: "09:52 AM" },
];

export const notificationTypes = [
  "Configuration Draft Created", "Validation Completed", "Validation Failed", "Rule Conflict Detected",
  "Permission Review Required", "Residency Review Required", "Owner Missing", "Review Requested",
  "Review Approved", "Review Rejected", "Configuration Approved", "Activation Scheduled",
  "Configuration Activated", "Activation Failed", "Rollback Initiated", "Rollback Completed",
  "Configuration Drift Detected", "Exception Expiring",
];

export const seedActivity: ActivityEvent[] = [
  { id: "ACT-01", time: "10:22 AM", text: "Enterprise Knowledge Discovery v4.3 validation completed", kind: "Validation" },
  { id: "ACT-02", time: "10:18 AM", text: "Restricted Slack scope assigned to Security Governance review", kind: "Review" },
  { id: "ACT-03", time: "10:14 AM", text: "Customer Support transcript rule changed to Restricted", kind: "Rule" },
  { id: "ACT-04", time: "10:09 AM", text: "Commerce cadence override confirmed at 2 hours", kind: "Cadence" },
  { id: "ACT-05", time: "10:06 AM", text: "EU residency policy validation passed", kind: "Residency" },
  { id: "ACT-06", time: "10:03 AM", text: "Two missing source owners assigned", kind: "Ownership" },
  { id: "ACT-07", time: "09:58 AM", text: "Discovery Preview recalculated at 2.4M artifacts", kind: "Preview" },
  { id: "ACT-08", time: "09:52 AM", text: "Enterprise Discovery v4.3 draft created from v4.2", kind: "Version" },
];

/* ------------------------------------------------------------ global search */

export interface SearchResult {
  id: string; type: string; configuration: string; version: string; element: string;
  scope: string; status: string; owner: string; panel: string;
}

export function buildSearchIndex(state: {
  reviews: DiscoveryConfigurationReview[];
  conflicts: DiscoveryRuleConflict[];
  results: DiscoveryValidationResult[];
  exceptions: DiscoveryConfigurationException[];
  drift: DiscoveryConfigurationDrift[];
  versions: DiscoveryConfigurationVersion[];
  approvals: DiscoveryConfigurationApproval[];
  draft: DraftState;
}): SearchResult[] {
  const idx: SearchResult[] = [];
  state.versions.forEach((v) =>
    idx.push({ id: v.id, type: "Version", configuration: "Enterprise Knowledge Discovery", version: v.version, element: v.changeReason, scope: v.scopeSnapshot, status: v.status, owner: v.createdBy, panel: "panel-versions" }));
  state.draft.rules.forEach((r) =>
    idx.push({ id: r.id, type: "Rule", configuration: "Enterprise Knowledge Discovery", version: "4.3", element: r.name, scope: r.scope, status: r.enabled ? "Enabled" : "Disabled", owner: r.owner, panel: "panel-rules" }));
  state.results.forEach((r) =>
    idx.push({ id: r.id, type: "Validation Issue", configuration: "Enterprise Knowledge Discovery", version: "4.3", element: `${r.category} · ${r.issue}`, scope: r.affectedScopeIds.join(", "), status: r.status, owner: r.owner, panel: "panel-validation-results" }));
  state.conflicts.forEach((c) =>
    idx.push({ id: c.id, type: "Conflict", configuration: "Enterprise Knowledge Discovery", version: "4.3", element: `${c.ruleAName} versus ${c.ruleBName}`, scope: c.overlapScope, status: c.status, owner: "Discovery Governance", panel: "panel-conflicts" }));
  state.reviews.forEach((r) =>
    idx.push({ id: r.id, type: "Review", configuration: r.configurationId, version: r.configurationVersion, element: `${r.reviewType} · ${r.issue}`, scope: r.scope, status: r.status, owner: r.reviewer, panel: "panel-reviews" }));
  state.approvals.forEach((a) =>
    idx.push({ id: a.id, type: "Approval", configuration: "Enterprise Knowledge Discovery", version: a.configurationVersion, element: a.approvalStage, scope: "Enterprise", status: a.status, owner: a.approver, panel: "panel-approvals" }));
  state.exceptions.forEach((e) =>
    idx.push({ id: e.id, type: "Exception", configuration: e.configurationId, version: e.configurationVersion, element: `${e.exceptionType} · ${e.reason}`, scope: e.scope, status: e.status, owner: e.owner, panel: "panel-exceptions" }));
  state.drift.forEach((d) =>
    idx.push({ id: d.id, type: "Drift", configuration: d.configurationName, version: d.configurationVersion, element: `${d.driftType} · ${d.elementId}`, scope: d.elementType, status: d.status, owner: d.owner, panel: "panel-drift" }));
  seedResidency.forEach((r) =>
    idx.push({ id: r.id, type: "Residency", configuration: "Enterprise Knowledge Discovery", version: "4.3", element: r.source, scope: r.region, status: r.status, owner: "Data Governance", panel: "panel-residency" }));
  seedOwnership.forEach((o) =>
    idx.push({ id: o.id, type: "Ownership", configuration: "Enterprise Knowledge Discovery", version: "4.3", element: `${o.dimension} · ${o.element}`, scope: o.dimension, status: o.status, owner: o.owner || "Unassigned", panel: "panel-ownership" }));
  seedAccessValidations.forEach((a) =>
    idx.push({ id: a.id, type: "Permission", configuration: "Enterprise Knowledge Discovery", version: "4.3", element: a.sourceName, scope: a.accessClassification, status: a.result, owner: "Security Governance", panel: "panel-access" }));
  seedPublishing.forEach((p) =>
    idx.push({ id: p.id, type: "Activation", configuration: p.configuration, version: p.version, element: `${p.action} · ${p.environment}`, scope: p.scope, status: p.status, owner: p.activatedBy, panel: "panel-publishing" }));
  seedInheritance.forEach((n) =>
    idx.push({ id: n.id, type: "Scope", configuration: "Enterprise Knowledge Discovery", version: "4.3", element: `${n.level} · ${n.label}`, scope: n.level, status: n.state, owner: "Discovery Operations", panel: "panel-inheritance" }));
  return idx;
}

export const searchExamples = [
  "Payments", "transcripts", "Restricted Slack", "Identity", "Security review",
  "missing business owner", "residency", "cadence override", "rollback",
];

/* ---------------------------------------------------------------- export */

export const exportFormats = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot", "Configuration Snapshot"];

export const exportScopes = [
  "Current Configuration", "Selected Configuration", "Selected Version", "Current Comparison",
  "Source Scope", "Rules", "Permission Policy", "Authority Policy", "Freshness Policy", "Cadence",
  "Processing Handoffs", "Validation Results", "Review History", "Approval History",
  "Activation History", "Drift", "Full Configuration Package",
];

export const exportOptions = [
  "Scope", "Sources", "Rules", "Permissions", "Authority", "Freshness", "Cadence",
  "Change Detection", "Duplicate Policy", "Traversal", "Sampling", "Processing Handoffs",
  "Evidence Preservation", "Preview", "Validation", "Approvals", "Exceptions", "Audit History",
];

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export function toYaml(rows: Record<string, unknown>[]): string {
  return rows
    .map((r) => `- ${Object.entries(r).map(([k, v]) => `${k}: ${JSON.stringify(v ?? "")}`).join("\n  ")}`)
    .join("\n");
}

export function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------- demo story */

export interface StorySt2ep { target: string; caption: string; notes: string }

export const demoStory: { target: string; caption: string; notes: string }[] = [
  { target: "panel-inventory", caption: "Enterprise Source Discovery should not begin by crawling everything. Discovery Configuration defines where ECF is allowed to look and why.", notes: "Anchor the audience on active configurations and configured sources before any execution detail." },
  { target: "panel-workbench", caption: "The enterprise defines scope across business units, knowledge domains, products, services, systems, regions, and approved source platforms.", notes: "Open the v4.3 draft and show the scope region of the workbench." },
  { target: "panel-platforms", caption: "Different enterprise sources have different value, authority, access, and discovery requirements.", notes: "Highlight source and content rules by platform." },
  { target: "panel-permissions", caption: "Discovery does not flatten enterprise access. Source permissions, classifications, and residency requirements remain part of the knowledge context.", notes: "Emphasise that permission preservation cannot be overridden." },
  { target: "panel-authority", caption: "A policy, architecture decision, ticket, transcript, and chat message do not automatically carry the same authority.", notes: "Authority preferences shape downstream trust, not just inclusion." },
  { target: "panel-handoffs", caption: "Discovery Configuration defines what may proceed toward evidence preservation, normalization, condition extraction, Persona context, and Cognitive Memory without approving those downstream records.", notes: "Eligibility is not approval." },
  { target: "panel-preview", caption: "Before activation, the enterprise can see what the configuration would include, exclude, restrict, and send downstream.", notes: "Preview is deterministic and recalculates with every configuration change." },
  { target: "panel-preview", caption: "The configuration can be tested without modifying Source Registry or downstream enterprise memory.", notes: "Run the dry run from the preview panel — no downstream state changes." },
  { target: "panel-validation", caption: "Scope, permissions, ownership, residency, rules, freshness, and processing compatibility are validated before approval.", notes: "Validation score 96 with 5 warnings and 3 review required items." },
  { target: "panel-comparison", caption: "Every configuration change is versioned so the enterprise can see exactly what discovery behavior will change.", notes: "Compare v4.2 against v4.3 across every policy dimension." },
  { target: "panel-impact", caption: "Before activation, the platform shows the projected source, artifact, restriction, and downstream processing impact.", notes: "Historical decisions modified always remains zero." },
  { target: "panel-approvals", caption: "High impact changes involving restricted sources, residency, or permission policies require the appropriate governance review.", notes: "Approval chain stages reflect change materiality." },
  { target: "panel-activation", caption: "Once approved, the configuration becomes the governed instruction set used by Enterprise Source Discovery.", notes: "Activation publishes to the discovery execution layer." },
  { target: "panel-rollback", caption: "Prior configurations remain preserved, allowing discovery behavior to be reversed without losing historical governance.", notes: "Rollback never modifies historical versions." },
];

/* ---------------------------------------------------------- demo scenarios */

export const demoScenarios = [
  "Healthy Configuration Portfolio", "New Configuration Draft", "Scope Expanded", "Source Excluded",
  "Restricted Source Added", "Permission Conflict", "Residency Review Required", "Rule Conflict",
  "Missing Owner", "Cadence Override", "High Volume Preview", "Dry Run Warning", "Validation Failed",
  "Review Pending", "Approved with Conditions", "Activation Scheduled", "Configuration Activated",
  "Activation Failed", "Rollback Required", "Configuration Drift", "Exception Expiring", "Reset Demo Data",
] as const;
export type DemoScenario = (typeof demoScenarios)[number];

export interface ScenarioState {
  serviceState: OperationalState;
  validationScore: number;
  passedCount: number;
  warningCount: number;
  reviewRequiredCount: number;
  blockedCount: number;
  activationBlocked: boolean;
  blockReason: string;
  approvalState: ApprovalState;
  activationStatus: DiscoveryConfigurationActivation["status"];
  openReviews: number;
  driftOpen: number;
  exceptionState: string;
  note: string;
}

const base: ScenarioState = {
  serviceState: "Review Required", validationScore: 96, passedCount: 42, warningCount: 5,
  reviewRequiredCount: 3, blockedCount: 0, activationBlocked: true,
  blockReason: "Security Governance and Data Governance approvals are pending",
  approvalState: "Approval Pending", activationStatus: "Draft", openReviews: 11,
  driftOpen: 2, exceptionState: "1 active, 1 expiring",
  note: "Draft v4.3 validated with warnings and outstanding governance reviews.",
};

export const scenarioStates: Record<DemoScenario, ScenarioState> = {
  "Healthy Configuration Portfolio": { ...base, serviceState: "Active", validationScore: 98, warningCount: 1, reviewRequiredCount: 0, activationBlocked: false, blockReason: "", approvalState: "Approved", openReviews: 2, driftOpen: 0, exceptionState: "1 active", note: "All configurations validated, approved and operating within policy." },
  "New Configuration Draft": { ...base, serviceState: "Draft", validationScore: 0, passedCount: 0, warningCount: 0, reviewRequiredCount: 0, approvalState: "Draft", activationBlocked: true, blockReason: "Validation has not been run for this draft", openReviews: 0, note: "A new draft has been created from the active version and awaits validation." },
  "Scope Expanded": { ...base, serviceState: "Validation Required", warningCount: 6, note: "Scope expanded to a new business unit. Preview and validation must be re-run." },
  "Source Excluded": { ...base, serviceState: "Validation Required", warningCount: 4, note: "A retired source has been excluded. Projected volume decreases." },
  "Restricted Source Added": { ...base, serviceState: "Review Required", reviewRequiredCount: 4, blockReason: "Restricted source requires Security Governance approval", note: "A restricted source has entered draft scope and requires governance review." },
  "Permission Conflict": { ...base, serviceState: "Blocked", validationScore: 88, warningCount: 4, reviewRequiredCount: 4, blockedCount: 1, activationBlocked: true, blockReason: "Permission conflict on Restricted Slack Channels must be resolved or covered by an approved governed exception", approvalState: "Review Required", openReviews: 12, note: "Activation is blocked until the permission conflict is resolved or a governed exception is approved." },
  "Residency Review Required": { ...base, serviceState: "Review Required", reviewRequiredCount: 4, blockReason: "Customer Support Archive residency metadata is incomplete", note: "Residency validation requires Data Governance review before activation." },
  "Rule Conflict": { ...base, serviceState: "Review Required", warningCount: 6, blockReason: "Unresolved rule conflict between transcript include and restrict rules", note: "Two discovery rules overlap on customer support transcripts." },
  "Missing Owner": { ...base, serviceState: "Validation Warning", warningCount: 7, blockReason: "Sources missing confirmed business owners", note: "Ownership validation reports missing business owners." },
  "Cadence Override": { ...base, serviceState: "Validation Warning", warningCount: 5, note: "Commerce two hour override confirmed as valid inheritance, not a conflict." },
  "High Volume Preview": { ...base, serviceState: "Validation Warning", warningCount: 6, note: "Projected discovery volume is high. Traversal and sampling policy should be reviewed." },
  "Dry Run Warning": { ...base, serviceState: "Validation Warning", warningCount: 6, note: "Dry run completed with warnings and no downstream state change." },
  "Validation Failed": { ...base, serviceState: "Validation Failed", validationScore: 61, passedCount: 31, warningCount: 8, reviewRequiredCount: 5, blockedCount: 4, approvalState: "Validation Failed", activationBlocked: true, blockReason: "Validation failed with 4 blocking issues", openReviews: 14, note: "Validation failed. The draft cannot progress to review or approval." },
  "Review Pending": { ...base, serviceState: "Review Required", openReviews: 11, note: "Governance reviews are open and awaiting reviewer decisions." },
  "Approved with Conditions": { ...base, serviceState: "Approved with Conditions", approvalState: "Approved with Conditions", activationBlocked: false, blockReason: "", reviewRequiredCount: 0, openReviews: 3, note: "Approved with conditions. Conditions must be recorded on the activation record." },
  "Activation Scheduled": { ...base, serviceState: "Scheduled", approvalState: "Scheduled", activationStatus: "Scheduled", activationBlocked: false, blockReason: "", reviewRequiredCount: 0, openReviews: 2, note: "Activation is scheduled inside the approved maintenance window." },
  "Configuration Activated": { ...base, serviceState: "Active", approvalState: "Active", activationStatus: "Active", validationScore: 96, reviewRequiredCount: 0, activationBlocked: false, blockReason: "", openReviews: 2, note: "v4.3 is active. v4.2 is preserved as superseded." },
  "Activation Failed": { ...base, serviceState: "Activation Failed", approvalState: "Approved", activationStatus: "Activation Failed", activationBlocked: true, blockReason: "Scheduler update failed during activation. Previous version remains active.", openReviews: 3, note: "Activation failed and halted on critical error. v4.2 remains the active configuration." },
  "Rollback Required": { ...base, serviceState: "Rollback Running", approvalState: "Rolled Back", activationStatus: "Active", activationBlocked: true, blockReason: "Rollback to v4.2 in progress", openReviews: 4, note: "A rollback to the prior approved version is running. History is preserved." },
  "Configuration Drift": { ...base, serviceState: "Drift Detected", driftOpen: 4, note: "Observed operational state differs from approved configuration in four places." },
  "Exception Expiring": { ...base, serviceState: "Exception Active", exceptionState: "1 active, 1 expiring in 3 days", note: "A governed exception is expiring and requires review before extension." },
  "Reset Demo Data": { ...base, note: "Demonstration data reset to the seeded v4.3 governance baseline." },
};
