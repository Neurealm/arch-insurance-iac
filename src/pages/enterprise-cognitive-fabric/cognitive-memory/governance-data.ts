/**
 * Enterprise Cognitive Memory — Prompt 2 domain models and deterministic
 * demonstration data. Extends the Prompt 1 memory model with governance,
 * curation, conflicts, versioning, drift, access, retention, publishing,
 * MCP services, usage, learning, activity, notifications and scenarios.
 *
 * No backend. All state is deterministic and simulated in the browser.
 */

import type { AccessClassification, AuthorityLevel, MemoryRecordType } from "./data";

/* ------------------------------------------------------------------ */
/* Governance overview                                                 */
/* ------------------------------------------------------------------ */

export interface GovernanceMetric {
  id: string;
  name: string;
  value: string;
  detail: string;
  status: "Healthy" | "Warning" | "Critical" | "Review Required";
}

export const governanceMetrics: GovernanceMetric[] = [
  { id: "gm-governed", name: "Governed Records", value: "23.9M", detail: "Owned, classified and versioned", status: "Healthy" },
  { id: "gm-review", name: "Records Requiring Review", value: "1,284", detail: "Open governance reviews", status: "Warning" },
  { id: "gm-access", name: "Access Conflicts", value: "42", detail: "Policy contradictions across consumers", status: "Critical" },
  { id: "gm-authority", name: "Authority Conflicts", value: "148", detail: "Competing authoritative records", status: "Critical" },
  { id: "gm-stale", name: "Stale Records", value: "482K", detail: "Beyond freshness target", status: "Warning" },
  { id: "gm-retention", name: "Retention Actions Due", value: "8,412", detail: "Archive or deletion review due", status: "Warning" },
  { id: "gm-hold", name: "Legal Holds", value: "18", detail: "Records frozen from retention action", status: "Healthy" },
  { id: "gm-drift", name: "Records with Drift", value: "3,284", detail: "Material source or condition change", status: "Warning" },
  { id: "gm-publishing", name: "Publishing Exceptions", value: "26", detail: "Blocked at destination validation", status: "Review Required" },
];

export interface GovernanceDimension {
  id: string;
  name: string;
  score: number;
  target: number;
  affectedRecords: string;
  trend: "up" | "down" | "flat";
  owner: string;
  status: "Healthy" | "Warning" | "Critical" | "Review Required";
  issueTypes: string[];
}

export const governanceDimensions: GovernanceDimension[] = [
  { id: "gd-ownership", name: "Ownership", score: 96.2, target: 98, affectedRecords: "218K", trend: "up", owner: "Enterprise Architecture", status: "Warning", issueTypes: ["Ownership Gap"] },
  { id: "gd-authority", name: "Authority", score: 91.4, target: 96, affectedRecords: "148", trend: "down", owner: "Release Governance", status: "Critical", issueTypes: ["Authority Conflict"] },
  { id: "gd-evidence", name: "Evidence", score: 93.8, target: 96, affectedRecords: "62K", trend: "up", owner: "Cognitive Intake", status: "Warning", issueTypes: ["Missing Evidence", "Stale Evidence"] },
  { id: "gd-access", name: "Access", score: 98.1, target: 99, affectedRecords: "42", trend: "flat", owner: "Security Governance", status: "Warning", issueTypes: ["Access Policy Conflict"] },
  { id: "gd-freshness", name: "Freshness", score: 88.6, target: 94, affectedRecords: "482K", trend: "down", owner: "Memory Operations", status: "Critical", issueTypes: ["Stale Evidence"] },
  { id: "gd-retention", name: "Retention", score: 95.0, target: 97, affectedRecords: "8,412", trend: "flat", owner: "Compliance", status: "Warning", issueTypes: ["Retention Review"] },
  { id: "gd-versioning", name: "Versioning", score: 97.4, target: 97, affectedRecords: "1,102", trend: "up", owner: "Memory Operations", status: "Healthy", issueTypes: ["Version Gap"] },
  { id: "gd-approval", name: "Approval", score: 94.7, target: 96, affectedRecords: "1,284", trend: "up", owner: "Governance Council", status: "Warning", issueTypes: ["Approval Pending"] },
  { id: "gd-relationship", name: "Relationship Integrity", score: 92.9, target: 95, affectedRecords: "61", trend: "down", owner: "Context Graph Operations", status: "Warning", issueTypes: ["Relationship Conflict"] },
  { id: "gd-decision", name: "Decision Linkage", score: 89.3, target: 92, affectedRecords: "2,184", trend: "up", owner: "Decision Intelligence", status: "Warning", issueTypes: ["Decision Linkage Gap"] },
  { id: "gd-outcome", name: "Outcome Linkage", score: 84.1, target: 90, affectedRecords: "4,206", trend: "up", owner: "Decision Intelligence", status: "Review Required", issueTypes: ["Outcome Linkage Gap"] },
  { id: "gd-learning", name: "Learning Linkage", score: 81.7, target: 88, affectedRecords: "5,918", trend: "up", owner: "Organizational Learning", status: "Review Required", issueTypes: ["Learning Linkage Gap"] },
];

/* ------------------------------------------------------------------ */
/* Governance queue                                                    */
/* ------------------------------------------------------------------ */

export type ReviewStatus = "Open" | "Acknowledged" | "In Review" | "Escalated" | "Resolved";

export interface MemoryGovernanceReview {
  id: string;
  memoryRecordId: string;
  memoryRecord: string;
  memoryType: MemoryRecordType | string;
  issueType: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  owner: string;
  authority: AuthorityLevel | string;
  accessClassification: AccessClassification | "Highly Restricted";
  affectedConsumerIds: string[];
  affectedPersonaIds: string[];
  affectedDecisionIds: string[];
  affectedConsumers: string;
  downstreamImpact: "High" | "Medium" | "Low";
  age: string;
  dueDate: string;
  recommendedAction: string;
  status: ReviewStatus;
  createdAt: string;
  resolvedAt: string | null;
  detail: string;
}

export const governanceReviews: MemoryGovernanceReview[] = [
  {
    id: "MGR 3401", memoryRecordId: "MEM 100431", memoryRecord: "Quarter End Deployment Restriction",
    memoryType: "Policy Condition", issueType: "Authority Conflict", severity: "High",
    owner: "Release Governance", authority: "Primary", accessClassification: "Internal",
    affectedConsumerIds: ["Persona Services", "Impact Analysis", "Decision Intelligence"],
    affectedPersonaIds: ["Payments Platform", "Release Governance", "Checkout Experience", "Identity Engineering"],
    affectedDecisionIds: ["DEC 4812", "DEC 4818"],
    affectedConsumers: "4 Team Personas · 3 active evaluations", downstreamImpact: "High",
    age: "6d", dueDate: "2026-08-11", recommendedAction: "Resolve Authority", status: "Open",
    createdAt: "2026-07-31T10:09:00Z", resolvedAt: null,
    detail: "Two approved policy conditions state different restriction windows for quarter end deployments. Three active release evaluations depend on the restriction window.",
  },
  {
    id: "MGR 3402", memoryRecordId: "MEM 100418", memoryRecord: "Identity Services Latency Threshold",
    memoryType: "Business Condition", issueType: "Stale Evidence", severity: "Critical",
    owner: "Identity Engineering", authority: "Primary", accessClassification: "Confidential",
    affectedConsumerIds: ["Impact Analysis", "Cognitive Search", "MCP Context Services"],
    affectedPersonaIds: ["Payments Platform", "Checkout Experience"],
    affectedDecisionIds: ["DEC 4812"],
    affectedConsumers: "Payments and Checkout Personas", downstreamImpact: "High",
    age: "11d", dueDate: "2026-08-08", recommendedAction: "Refresh Record", status: "Open",
    createdAt: "2026-07-26T09:14:00Z", resolvedAt: null,
    detail: "Supporting evidence for the 250 ms latency threshold is 214 days old and the source runbook changed 9 days ago.",
  },
  {
    id: "MGR 3403", memoryRecordId: "MEM 100425", memoryRecord: "Customer Support Escalation Philosophy",
    memoryType: "Team Persona Section", issueType: "Missing Evidence", severity: "Medium",
    owner: "Customer Support Leadership", authority: "Supporting", accessClassification: "Internal",
    affectedConsumerIds: ["Persona Services"],
    affectedPersonaIds: ["Customer Support"], affectedDecisionIds: [],
    affectedConsumers: "1 Team Persona", downstreamImpact: "Medium",
    age: "3d", dueDate: "2026-08-14", recommendedAction: "Request Evidence", status: "Acknowledged",
    createdAt: "2026-08-03T15:20:00Z", resolvedAt: null,
    detail: "Persona section asserts an escalation philosophy with no linked canonical artifact or evidence excerpt.",
  },
  {
    id: "MGR 3404", memoryRecordId: "MEM 100409", memoryRecord: "Legacy Payments Architecture Record",
    memoryType: "Canonical Artifact", issueType: "Retention Review", severity: "Low",
    owner: "Enterprise Architecture", authority: "Historical", accessClassification: "Internal",
    affectedConsumerIds: ["Cognitive Search"],
    affectedPersonaIds: [], affectedDecisionIds: ["DEC 4610"],
    affectedConsumers: "Search index only", downstreamImpact: "Low",
    age: "22d", dueDate: "2026-08-20", recommendedAction: "Apply Retention Action", status: "In Review",
    createdAt: "2026-07-15T11:00:00Z", resolvedAt: null,
    detail: "Record passed its 5 year retention period. Archive is recommended; deletion is blocked by decision linkage to DEC 4610.",
  },
  {
    id: "MGR 3405", memoryRecordId: "MEM 100404", memoryRecord: "Restricted Identity API Evidence",
    memoryType: "Evidence Record", issueType: "Access Policy Conflict", severity: "Critical",
    owner: "Security Governance", authority: "Primary", accessClassification: "Highly Restricted",
    affectedConsumerIds: ["MCP Context Services", "Impact Analysis"],
    affectedPersonaIds: ["Payments Platform"], affectedDecisionIds: ["DEC 4812"],
    affectedConsumers: "Payments Impact Evaluation Agent", downstreamImpact: "High",
    age: "1d", dueDate: "2026-08-07", recommendedAction: "Resolve Access", status: "Escalated",
    createdAt: "2026-08-05T09:58:00Z", resolvedAt: null,
    detail: "An impact evaluation agent without restricted evidence entitlement requested raw evidence. Derived condition access may be permitted instead.",
  },
];

export const governanceActions = [
  "Open Review", "Assign", "Acknowledge", "Request Evidence", "Resolve Authority", "Resolve Access",
  "Refresh Record", "Merge Records", "Supersede", "Apply Retention Action", "Create Review Task", "Escalate",
] as const;
export type GovernanceAction = (typeof governanceActions)[number];

export const governanceQueueFilters = {
  memoryType: ["All", "Policy Condition", "Business Condition", "Team Persona Section", "Canonical Artifact", "Evidence Record"],
  issueType: ["All", "Authority Conflict", "Stale Evidence", "Missing Evidence", "Retention Review", "Access Policy Conflict"],
  severity: ["All", "Critical", "High", "Medium", "Low"],
  owner: ["All", "Release Governance", "Identity Engineering", "Customer Support Leadership", "Enterprise Architecture", "Security Governance"],
  authority: ["All", "Primary", "Supporting", "Historical"],
  access: ["All", "Internal", "Confidential", "Restricted", "Highly Restricted"],
  status: ["All", "Open", "Acknowledged", "In Review", "Escalated", "Resolved"],
  dueDate: ["All", "Overdue", "Due this week", "Due this month"],
  downstreamImpact: ["All", "High", "Medium", "Low"],
} as const;

/* ------------------------------------------------------------------ */
/* Curation                                                            */
/* ------------------------------------------------------------------ */

export type CandidateCategory =
  | "Duplicates" | "Overlapping Records" | "Conflicting Records"
  | "Stale Records" | "Superseded Records" | "Ambiguous Records";

export interface CurationField {
  label: string;
  a: string;
  b: string;
}

export interface CurationCandidate {
  id: string;
  category: CandidateCategory;
  title: string;
  memoryType: string;
  recordAId: string;
  recordBId: string;
  recordATitle: string;
  recordBTitle: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  fields: CurationField[];
}

const cmp = (label: string, a: string, b: string): CurationField => ({ label, a, b });

export const curationCandidates: CurationCandidate[] = [
  {
    id: "CUR 8801", category: "Conflicting Records", title: "Quarter End Deployment Restriction",
    memoryType: "Policy Condition", recordAId: "MEM 100431", recordBId: "MEM 100432",
    recordATitle: "Quarter End Deployment Restriction (Release Governance)",
    recordBTitle: "Quarter End Deployment Restriction (Payments Platform)",
    severity: "High",
    fields: [
      cmp("Title or Statement", "No production deployments in the final three business days of a quarter", "No production deployments in the final five business days of a quarter"),
      cmp("Memory Type", "Policy Condition", "Policy Condition"),
      cmp("Subject", "Production deployment window", "Production deployment window"),
      cmp("Value", "3", "5"),
      cmp("Unit", "business days", "business days"),
      cmp("Owner", "Release Governance", "Payments Platform Engineering"),
      cmp("Authority", "Primary", "Supporting"),
      cmp("Evidence", "Release Governance Standard v6 §4.2", "Payments Runbook 2025 §9"),
      cmp("Confidence", "94%", "78%"),
      cmp("Freshness", "Current · 12d", "Aging · 168d"),
      cmp("Effective Date", "2026-01-01", "2025-04-01"),
      cmp("Expiration Date", "—", "2026-03-31"),
      cmp("Access", "Internal", "Internal"),
      cmp("Applicable Teams", "All engineering teams", "Payments Platform, Checkout Experience"),
      cmp("Applicable Systems", "All production systems", "Payments services"),
      cmp("Relationships", "12 (policy → teams, services)", "5 (policy → payments services)"),
      cmp("Downstream Consumers", "Persona Services, Impact Analysis, Decision Intelligence", "Impact Analysis"),
      cmp("Decision References", "DEC 4812, DEC 4818", "DEC 4610"),
      cmp("Outcome References", "OUT 2214", "—"),
    ],
  },
  {
    id: "CUR 8802", category: "Duplicates", title: "Payments Availability Condition",
    memoryType: "Business Condition", recordAId: "MEM 100415", recordBId: "MEM 100416",
    recordATitle: "Payments Availability Target 99.95%",
    recordBTitle: "Payments Service Availability Objective 99.95%",
    severity: "Medium",
    fields: [
      cmp("Title or Statement", "Payments availability target is 99.95% monthly", "Payments service availability objective is 99.95% monthly"),
      cmp("Memory Type", "Business Condition", "Business Condition"),
      cmp("Subject", "Payments availability", "Payments availability"),
      cmp("Value", "99.95", "99.95"),
      cmp("Unit", "% monthly", "% monthly"),
      cmp("Owner", "Payments Platform Engineering", "Reliability Engineering"),
      cmp("Authority", "Primary", "Supporting"),
      cmp("Evidence", "Payments SLO Register v11", "Reliability Review Q1 2026"),
      cmp("Confidence", "96%", "89%"),
      cmp("Freshness", "Current · 6d", "Current · 34d"),
      cmp("Effective Date", "2026-01-01", "2026-01-01"),
      cmp("Expiration Date", "—", "—"),
      cmp("Access", "Internal", "Internal"),
      cmp("Applicable Teams", "Payments Platform", "Payments Platform, Reliability"),
      cmp("Applicable Systems", "payments-api, payments-ledger", "payments-api"),
      cmp("Relationships", "18", "7"),
      cmp("Downstream Consumers", "Persona Services, Impact Analysis, MCP", "Cognitive Search"),
      cmp("Decision References", "DEC 4812", "—"),
      cmp("Outcome References", "OUT 2214", "—"),
    ],
  },
  {
    id: "CUR 8803", category: "Stale Records", title: "Identity Services Latency Threshold",
    memoryType: "Business Condition", recordAId: "MEM 100418", recordBId: "MEM 100419",
    recordATitle: "Identity latency threshold 250 ms (approved)",
    recordBTitle: "Identity latency threshold 180 ms (observed source state)",
    severity: "Critical",
    fields: [
      cmp("Title or Statement", "Identity Services p95 latency threshold is 250 ms", "Identity Services p95 latency threshold is 180 ms"),
      cmp("Memory Type", "Business Condition", "Business Condition"),
      cmp("Subject", "Identity latency", "Identity latency"),
      cmp("Value", "250", "180"),
      cmp("Unit", "ms p95", "ms p95"),
      cmp("Owner", "Identity Engineering", "Identity Engineering"),
      cmp("Authority", "Primary", "Candidate"),
      cmp("Evidence", "Identity Runbook v4 (214d old)", "Identity Runbook v5 (9d old)"),
      cmp("Confidence", "71%", "92%"),
      cmp("Freshness", "Stale · 214d", "Current · 9d"),
      cmp("Effective Date", "2025-04-01", "2026-07-28"),
      cmp("Expiration Date", "—", "—"),
      cmp("Access", "Confidential", "Confidential"),
      cmp("Applicable Teams", "Identity, Payments, Checkout", "Identity, Payments, Checkout"),
      cmp("Applicable Systems", "identity-api", "identity-api"),
      cmp("Relationships", "22", "3"),
      cmp("Downstream Consumers", "Impact Analysis, MCP Context Services", "—"),
      cmp("Decision References", "DEC 4812", "—"),
      cmp("Outcome References", "—", "—"),
    ],
  },
  {
    id: "CUR 8804", category: "Overlapping Records", title: "Retry Approval Requirement",
    memoryType: "Policy Condition", recordAId: "MEM 100428", recordBId: "MEM 100429",
    recordATitle: "Retry increase requires idempotency validation",
    recordBTitle: "Retry increase requires release governance approval",
    severity: "Medium",
    fields: [
      cmp("Title or Statement", "Retry traffic increases require idempotency validation evidence", "Retry traffic increases require release governance approval"),
      cmp("Memory Type", "Policy Condition", "Policy Condition"),
      cmp("Subject", "Retry policy change", "Retry policy change"),
      cmp("Value", "Idempotency validation", "Governance approval"),
      cmp("Unit", "—", "—"),
      cmp("Owner", "Payments Platform Engineering", "Release Governance"),
      cmp("Authority", "Primary", "Primary"),
      cmp("Evidence", "Learning record LRN 1426", "Release Governance Standard v6 §7"),
      cmp("Confidence", "93%", "95%"),
      cmp("Freshness", "Current · 2d", "Current · 12d"),
      cmp("Effective Date", "2026-08-04", "2026-01-01"),
      cmp("Expiration Date", "—", "—"),
      cmp("Access", "Internal", "Internal"),
      cmp("Applicable Teams", "Payments Platform", "All engineering teams"),
      cmp("Applicable Systems", "payments-api", "All production systems"),
      cmp("Relationships", "9", "14"),
      cmp("Downstream Consumers", "Impact Analysis, Decision Intelligence", "Decision Intelligence"),
      cmp("Decision References", "DEC 4812", "DEC 4812, DEC 4818"),
      cmp("Outcome References", "OUT 2214", "—"),
    ],
  },
  {
    id: "CUR 8805", category: "Superseded Records", title: "Checkout Retry Threshold",
    memoryType: "Business Condition", recordAId: "MEM 100421", recordBId: "MEM 100422",
    recordATitle: "Retry approval threshold 20% traffic exposure (v3.2)",
    recordBTitle: "Retry approval threshold 5% traffic exposure (v3.4)",
    severity: "High",
    fields: [
      cmp("Title or Statement", "Retry increases approved up to 20% traffic exposure", "Retry increases approved up to 5% traffic exposure"),
      cmp("Memory Type", "Business Condition", "Business Condition"),
      cmp("Subject", "Checkout retry exposure", "Checkout retry exposure"),
      cmp("Value", "20", "5"),
      cmp("Unit", "% traffic", "% traffic"),
      cmp("Owner", "Payments Platform Engineering", "Payments Platform Engineering"),
      cmp("Authority", "Historical", "Primary"),
      cmp("Evidence", "Checkout Retry Evaluation v1", "Learning record LRN 1426"),
      cmp("Confidence", "82%", "94%"),
      cmp("Freshness", "Historical", "Current · 2d"),
      cmp("Effective Date", "2026-05-02", "2026-08-04"),
      cmp("Expiration Date", "2026-08-04", "—"),
      cmp("Access", "Internal", "Internal"),
      cmp("Applicable Teams", "Payments Platform, Checkout Experience", "Payments Platform, Checkout Experience"),
      cmp("Applicable Systems", "checkout-api", "checkout-api"),
      cmp("Relationships", "11", "13"),
      cmp("Downstream Consumers", "Historical decision context", "Impact Analysis, MCP, Persona Services"),
      cmp("Decision References", "DEC 4812", "DEC 4818"),
      cmp("Outcome References", "OUT 2214", "—"),
    ],
  },
  {
    id: "CUR 8806", category: "Ambiguous Records", title: "Support Escalation Philosophy",
    memoryType: "Team Persona Section", recordAId: "MEM 100425", recordBId: "MEM 100426",
    recordATitle: "Escalate after two failed contacts",
    recordBTitle: "Escalate after customer sentiment threshold breach",
    severity: "Low",
    fields: [
      cmp("Title or Statement", "Escalate after two failed customer contacts", "Escalate when sentiment falls below threshold"),
      cmp("Memory Type", "Team Persona Section", "Team Persona Section"),
      cmp("Subject", "Support escalation", "Support escalation"),
      cmp("Value", "2 contacts", "Sentiment < 3.0"),
      cmp("Unit", "contacts", "score"),
      cmp("Owner", "Customer Support Leadership", "Customer Experience"),
      cmp("Authority", "Candidate", "Candidate"),
      cmp("Evidence", "—", "CX Review 2026"),
      cmp("Confidence", "58%", "64%"),
      cmp("Freshness", "Aging · 92d", "Current · 21d"),
      cmp("Effective Date", "2026-05-06", "2026-07-16"),
      cmp("Expiration Date", "—", "—"),
      cmp("Access", "Internal", "Internal"),
      cmp("Applicable Teams", "Customer Support", "Customer Support, CX"),
      cmp("Applicable Systems", "support-desk", "support-desk"),
      cmp("Relationships", "4", "6"),
      cmp("Downstream Consumers", "Persona Services", "Persona Services"),
      cmp("Decision References", "—", "—"),
      cmp("Outcome References", "—", "—"),
    ],
  },
];

export const curationDecisions = [
  "Keep Both", "Mark Related", "Merge Records", "Select Authoritative Record", "Mark Supporting",
  "Mark Historical", "Supersede", "Create Effective Date Transition", "Split Applicability",
  "Request Clarification", "Reject Record",
] as const;
export type CurationDecision = (typeof curationDecisions)[number];

export const curationDecisionsRequiringApproval: CurationDecision[] = [
  "Merge Records", "Supersede", "Create Effective Date Transition", "Reject Record",
];

export const curationReviewers = [
  "Chief Architect", "Release Governance Lead", "Payments Platform Lead", "Security Reviewer", "Compliance Reviewer",
];

/* ------------------------------------------------------------------ */
/* Conflicts                                                           */
/* ------------------------------------------------------------------ */

export interface ConflictSummaryRow { label: string; value: string }

export const conflictSummary: ConflictSummaryRow[] = [
  { label: "Authority Conflicts", value: "148" },
  { label: "Value Conflicts", value: "84" },
  { label: "Effective Date Conflicts", value: "33" },
  { label: "Ownership Conflicts", value: "52" },
  { label: "Access Conflicts", value: "42" },
  { label: "Relationship Conflicts", value: "61" },
  { label: "Duplicate Records", value: "642" },
  { label: "Ambiguous Applicability", value: "74" },
];

export interface MemoryConflict {
  id: string;
  recordAId: string;
  recordBId: string;
  recordATitle: string;
  recordBTitle: string;
  recordAStatement: string;
  recordBStatement: string;
  conflictType: string;
  memoryType: string;
  authorityA: string;
  authorityB: string;
  confidenceA: number;
  confidenceB: number;
  evidenceAgreement: string;
  applicabilityConflict: boolean;
  effectiveDateConflict: boolean;
  accessConflict: boolean;
  affectedTeamIds: string[];
  affectedPersonaIds: string[];
  affectedDecisionIds: string[];
  severity: "Critical" | "High" | "Medium" | "Low";
  recommendedResolution: string;
  reviewStatus: ReviewStatus;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  curationId?: string;
}

export const memoryConflicts: MemoryConflict[] = [
  {
    id: "CFL 5101", recordAId: "MEM 100431", recordBId: "MEM 100432",
    recordATitle: "Quarter End Deployment Restriction (Release Governance)",
    recordBTitle: "Quarter End Deployment Restriction (Payments Platform)",
    recordAStatement: "Final three business days", recordBStatement: "Final five business days",
    conflictType: "Effective Rule Conflict", memoryType: "Policy Condition",
    authorityA: "Primary", authorityB: "Supporting", confidenceA: 94, confidenceB: 78,
    evidenceAgreement: "Partial — different source standards",
    applicabilityConflict: true, effectiveDateConflict: true, accessConflict: false,
    affectedTeamIds: ["Payments Platform", "Release Governance"],
    affectedPersonaIds: ["Payments Platform Persona", "Release Governance Persona"],
    affectedDecisionIds: ["DEC 4812", "DEC 4818"],
    severity: "High", recommendedResolution: "Create Effective Date Transition",
    reviewStatus: "Open", resolution: null, createdAt: "2026-07-31T10:09:00Z", resolvedAt: null,
    curationId: "CUR 8801",
  },
  {
    id: "CFL 5102", recordAId: "MEM 100415", recordBId: "MEM 100416",
    recordATitle: "Payments Availability Target 99.95%", recordBTitle: "Payments Service Availability Objective 99.95%",
    recordAStatement: "99.95% monthly (SLO Register)", recordBStatement: "99.95% monthly (Reliability Review)",
    conflictType: "Duplicate Record", memoryType: "Business Condition",
    authorityA: "Primary", authorityB: "Supporting", confidenceA: 96, confidenceB: 89,
    evidenceAgreement: "Full", applicabilityConflict: false, effectiveDateConflict: false, accessConflict: false,
    affectedTeamIds: ["Payments Platform", "Reliability Engineering"],
    affectedPersonaIds: ["Payments Platform Persona"], affectedDecisionIds: ["DEC 4812"],
    severity: "Medium", recommendedResolution: "Merge", reviewStatus: "Open", resolution: null,
    createdAt: "2026-07-29T08:22:00Z", resolvedAt: null, curationId: "CUR 8802",
  },
  {
    id: "CFL 5103", recordAId: "MEM 100418", recordBId: "MEM 100419",
    recordATitle: "Identity latency threshold 250 ms", recordBTitle: "Identity latency threshold 180 ms",
    recordAStatement: "250 ms p95 (approved)", recordBStatement: "180 ms p95 (current source)",
    conflictType: "Value Conflict", memoryType: "Business Condition",
    authorityA: "Primary", authorityB: "Candidate", confidenceA: 71, confidenceB: 92,
    evidenceAgreement: "Contradicted — source runbook updated",
    applicabilityConflict: false, effectiveDateConflict: true, accessConflict: false,
    affectedTeamIds: ["Identity Engineering", "Payments Platform", "Checkout Experience"],
    affectedPersonaIds: ["Payments Platform Persona", "Checkout Experience Persona"],
    affectedDecisionIds: ["DEC 4812"],
    severity: "Critical", recommendedResolution: "Select B and version prior record",
    reviewStatus: "In Review", resolution: null, createdAt: "2026-07-28T09:14:00Z", resolvedAt: null,
    curationId: "CUR 8803",
  },
  {
    id: "CFL 5104", recordAId: "MEM 100404", recordBId: "MEM 100405",
    recordATitle: "Restricted Identity API Evidence", recordBTitle: "Derived Identity Dependency Condition",
    recordAStatement: "Raw restricted evidence excerpt", recordBStatement: "Derived business condition",
    conflictType: "Access Conflict", memoryType: "Evidence Record",
    authorityA: "Primary", authorityB: "Primary", confidenceA: 97, confidenceB: 86,
    evidenceAgreement: "Full", applicabilityConflict: false, effectiveDateConflict: false, accessConflict: true,
    affectedTeamIds: ["Security Governance", "Payments Platform"],
    affectedPersonaIds: ["Payments Platform Persona"], affectedDecisionIds: ["DEC 4812"],
    severity: "Critical", recommendedResolution: "Return derived condition only",
    reviewStatus: "Escalated", resolution: null, createdAt: "2026-08-05T09:58:00Z", resolvedAt: null,
  },
  {
    id: "CFL 5105", recordAId: "MEM 100425", recordBId: "MEM 100426",
    recordATitle: "Escalate after two failed contacts", recordBTitle: "Escalate on sentiment threshold",
    recordAStatement: "2 failed contacts", recordBStatement: "Sentiment below 3.0",
    conflictType: "Ambiguous Applicability", memoryType: "Team Persona Section",
    authorityA: "Candidate", authorityB: "Candidate", confidenceA: 58, confidenceB: 64,
    evidenceAgreement: "None", applicabilityConflict: true, effectiveDateConflict: false, accessConflict: false,
    affectedTeamIds: ["Customer Support"], affectedPersonaIds: ["Customer Support Persona"], affectedDecisionIds: [],
    severity: "Low", recommendedResolution: "Keep Both for Different Applicability",
    reviewStatus: "Open", resolution: null, createdAt: "2026-08-02T13:40:00Z", resolvedAt: null,
    curationId: "CUR 8806",
  },
  {
    id: "CFL 5106", recordAId: "MEM 100428", recordBId: "MEM 100429",
    recordATitle: "Retry requires idempotency validation", recordBTitle: "Retry requires governance approval",
    recordAStatement: "Idempotency validation required", recordBStatement: "Governance approval required",
    conflictType: "Relationship Conflict", memoryType: "Policy Condition",
    authorityA: "Primary", authorityB: "Primary", confidenceA: 93, confidenceB: 95,
    evidenceAgreement: "Complementary", applicabilityConflict: false, effectiveDateConflict: false, accessConflict: false,
    affectedTeamIds: ["Payments Platform", "Release Governance"],
    affectedPersonaIds: ["Payments Platform Persona"], affectedDecisionIds: ["DEC 4812", "DEC 4818"],
    severity: "Medium", recommendedResolution: "Mark Related", reviewStatus: "Open", resolution: null,
    createdAt: "2026-08-01T16:05:00Z", resolvedAt: null, curationId: "CUR 8804",
  },
];

export const conflictResolutionOptions = [
  "Select A", "Select B", "Merge", "Create Effective Date Transition",
  "Keep Both for Different Applicability", "Mark Historical", "Escalate", "Resolve",
] as const;

/* ------------------------------------------------------------------ */
/* Merge workflow                                                      */
/* ------------------------------------------------------------------ */

export const mergeFieldKeys = [
  "Title", "Owner", "Authority", "Access", "Effective Dates", "Applicability", "Relationships", "Evidence",
] as const;
export type MergeFieldKey = (typeof mergeFieldKeys)[number];

export const mergeHistoryItems = [
  "Aliases", "Prior IDs", "Historical Versions", "Decision References", "Outcome References", "External References",
];

export const mergeImpact = [
  { label: "Affected Personas", value: "4" },
  { label: "Affected Evaluations", value: "3" },
  { label: "Affected Decisions", value: "2" },
  { label: "Affected Agents", value: "5" },
  { label: "Affected Search Results", value: "1,284" },
];

export const mergeSimulationSteps = [
  "Lock Records", "Validate Access", "Combine Evidence", "Combine Relationships",
  "Update Semantic Index", "Update Context Graph", "Update Consumers", "Create Redirects", "Completed",
];

/* ------------------------------------------------------------------ */
/* Supersession                                                        */
/* ------------------------------------------------------------------ */

export interface SupersessionCase {
  id: string;
  currentRecordId: string;
  currentRecord: string;
  replacementRecordId: string;
  replacementRecord: string;
  effectiveDate: string;
  expirationDate: string;
  reason: string;
  authorityCurrent: string;
  authorityReplacement: string;
  evidenceCurrent: string;
  evidenceReplacement: string;
  affectedConsumers: string[];
  highImpact: boolean;
}

export const supersessionCases: SupersessionCase[] = [
  {
    id: "SUP 7301", currentRecordId: "MEM 100421", currentRecord: "Retry approval threshold 20% traffic exposure (v3.2)",
    replacementRecordId: "MEM 100422", replacementRecord: "Retry approval threshold 5% traffic exposure (v3.4)",
    effectiveDate: "2026-08-04", expirationDate: "2026-08-04",
    reason: "Observed duplicate authorizations required a lower exposure ceiling",
    authorityCurrent: "Historical", authorityReplacement: "Primary",
    evidenceCurrent: "Checkout Retry Evaluation v1", evidenceReplacement: "Learning record LRN 1426, Outcome OUT 2214",
    affectedConsumers: ["Payments Platform Persona", "Checkout Experience Persona", "Impact Analysis", "MCP Context Services"],
    highImpact: true,
  },
  {
    id: "SUP 7302", currentRecordId: "MEM 100418", currentRecord: "Identity latency threshold 250 ms",
    replacementRecordId: "MEM 100419", replacementRecord: "Identity latency threshold 180 ms",
    effectiveDate: "2026-08-10", expirationDate: "2026-08-09",
    reason: "Identity runbook v5 lowered the p95 threshold",
    authorityCurrent: "Primary", authorityReplacement: "Candidate",
    evidenceCurrent: "Identity Runbook v4", evidenceReplacement: "Identity Runbook v5",
    affectedConsumers: ["Payments Platform Persona", "Checkout Experience Persona", "Impact Analysis"],
    highImpact: true,
  },
  {
    id: "SUP 7303", currentRecordId: "MEM 100409", currentRecord: "Legacy Payments Architecture Record",
    replacementRecordId: "MEM 100410", replacementRecord: "Payments Architecture Record 2026",
    effectiveDate: "2026-06-01", expirationDate: "2026-05-31",
    reason: "Architecture refresh superseded the legacy description",
    authorityCurrent: "Historical", authorityReplacement: "Primary",
    evidenceCurrent: "Architecture Review 2021", evidenceReplacement: "Architecture Review 2026",
    affectedConsumers: ["Cognitive Search"],
    highImpact: false,
  },
];

export const supersessionOptions = [
  "Supersede Immediately", "Schedule Supersession", "Keep Both for Different Applicability",
  "Keep Both for Different Environments", "Mark Prior Record Historical",
] as const;

/* ------------------------------------------------------------------ */
/* Drift                                                               */
/* ------------------------------------------------------------------ */

export const driftSummary = [
  { label: "Records with Source Changes", value: "18,426" },
  { label: "Material Drift", value: "3,284" },
  { label: "Minor Drift", value: "15,142" },
  { label: "Stale Records", value: "482K" },
  { label: "Personas Requiring Refresh", value: "8" },
  { label: "Evaluations Requiring Reassessment", value: "4" },
  { label: "Decisions Requiring Review", value: "2" },
];

export const driftCategories = [
  "Source Content Changed", "Condition Changed", "Owner Changed", "Authority Changed",
  "Access Changed", "Relationship Changed", "Policy Changed", "Metric Changed",
  "Threshold Changed", "Outcome Contradicted Expectation",
];

export interface MemoryDrift {
  id: string;
  memoryRecordId: string;
  memoryRecord: string;
  driftType: string;
  changedSourceRecordId: string;
  previousValue: string;
  currentValue: string;
  materiality: "Material" | "Minor" | "Nonmaterial";
  affectedRelationshipIds: string[];
  affectedPersonaIds: string[];
  affectedEvaluationIds: string[];
  affectedDecisionIds: string[];
  detectedAt: string;
  owner: string;
  status: "Open" | "Accepted" | "Dismissed" | "Under Review";
  recommendedAction: string;
}

export const memoryDrifts: MemoryDrift[] = [
  {
    id: "DRF 9101", memoryRecordId: "MEM 100418", memoryRecord: "Identity Services Latency Threshold",
    driftType: "Threshold Changed", changedSourceRecordId: "SRC 4412", previousValue: "250 ms p95", currentValue: "180 ms p95",
    materiality: "Material", affectedRelationshipIds: ["REL 221", "REL 224"],
    affectedPersonaIds: ["Payments Platform", "Checkout Experience"], affectedEvaluationIds: ["EVL 981", "EVL 984"],
    affectedDecisionIds: ["DEC 4812"], detectedAt: "2026-07-28", owner: "Identity Engineering",
    status: "Open", recommendedAction: "Create Version",
  },
  {
    id: "DRF 9102", memoryRecordId: "MEM 100431", memoryRecord: "Quarter End Deployment Restriction",
    driftType: "Policy Changed", changedSourceRecordId: "SRC 4390", previousValue: "5 business days", currentValue: "3 business days",
    materiality: "Material", affectedRelationshipIds: ["REL 118"],
    affectedPersonaIds: ["Release Governance", "Payments Platform"], affectedEvaluationIds: ["EVL 990"],
    affectedDecisionIds: ["DEC 4818"], detectedAt: "2026-07-31", owner: "Release Governance",
    status: "Under Review", recommendedAction: "Open Comparison",
  },
  {
    id: "DRF 9103", memoryRecordId: "MEM 100422", memoryRecord: "Checkout Retry Exposure Threshold",
    driftType: "Outcome Contradicted Expectation", changedSourceRecordId: "OUT 2214",
    previousValue: "No increase in duplicate authorizations", currentValue: "Duplicate authorizations +0.4%",
    materiality: "Material", affectedRelationshipIds: ["REL 305"],
    affectedPersonaIds: ["Payments Platform"], affectedEvaluationIds: ["EVL 981"],
    affectedDecisionIds: ["DEC 4812"], detectedAt: "2026-08-04", owner: "Payments Platform Engineering",
    status: "Accepted", recommendedAction: "Accept Update",
  },
  {
    id: "DRF 9104", memoryRecordId: "MEM 100409", memoryRecord: "Legacy Payments Architecture Record",
    driftType: "Owner Changed", changedSourceRecordId: "SRC 3110", previousValue: "Payments Architecture Guild", currentValue: "Enterprise Architecture",
    materiality: "Minor", affectedRelationshipIds: [], affectedPersonaIds: [], affectedEvaluationIds: [],
    affectedDecisionIds: [], detectedAt: "2026-07-15", owner: "Enterprise Architecture",
    status: "Open", recommendedAction: "Dismiss as Nonmaterial",
  },
  {
    id: "DRF 9105", memoryRecordId: "MEM 100404", memoryRecord: "Restricted Identity API Evidence",
    driftType: "Access Changed", changedSourceRecordId: "POL 220", previousValue: "Restricted", currentValue: "Highly Restricted",
    materiality: "Material", affectedRelationshipIds: ["REL 402"], affectedPersonaIds: ["Payments Platform"],
    affectedEvaluationIds: ["EVL 981"], affectedDecisionIds: ["DEC 4812"], detectedAt: "2026-08-05",
    owner: "Security Governance", status: "Open", recommendedAction: "Request Review",
  },
  {
    id: "DRF 9106", memoryRecordId: "MEM 100415", memoryRecord: "Payments Availability Condition",
    driftType: "Relationship Changed", changedSourceRecordId: "GRA 881", previousValue: "18 relationships", currentValue: "21 relationships",
    materiality: "Minor", affectedRelationshipIds: ["REL 501", "REL 502", "REL 503"],
    affectedPersonaIds: ["Payments Platform"], affectedEvaluationIds: [], affectedDecisionIds: [],
    detectedAt: "2026-08-03", owner: "Context Graph Operations", status: "Open", recommendedAction: "Refresh Relationships",
  },
];

export const driftActions = [
  "Open Comparison", "Accept Update", "Create Version", "Refresh Relationships",
  "Reindex", "Dismiss as Nonmaterial", "Request Review",
] as const;

/* ------------------------------------------------------------------ */
/* Refresh workflow                                                    */
/* ------------------------------------------------------------------ */

export const refreshScopes = [
  "Selected Record", "Selected Memory Type", "Selected Domain", "Selected Team",
  "Records with Material Drift", "Full Memory Layer",
];

export const refreshOptions = [
  "Reload Source State", "Revalidate Authority", "Revalidate Ownership", "Revalidate Access",
  "Rebuild Evidence Links", "Rebuild Graph Relationships", "Rebuild Semantic Index",
  "Recalculate Quality", "Recalculate Freshness", "Reassess Downstream Impact",
];

export const refreshPreserve = [
  "Manual Curation Decisions", "Approved Exceptions", "Historical Versions",
  "Decision References", "Outcome References",
];

export const refreshSimulationSteps = [
  "Load Records", "Compare Source State", "Create Versions", "Rebuild Evidence",
  "Rebuild Relationships", "Reindex", "Recalculate Quality", "Assess Downstream Impact", "Completed",
];

export const refreshResults = [
  { label: "Records Updated", value: "3,284" },
  { label: "New Versions", value: "1,102" },
  { label: "Relationships Changed", value: "4,918" },
  { label: "Personas Flagged", value: "8" },
  { label: "Evaluations Flagged", value: "4" },
  { label: "Decisions Flagged", value: "2" },
  { label: "Index Records Updated", value: "12,406" },
];

/* ------------------------------------------------------------------ */
/* Point in time                                                       */
/* ------------------------------------------------------------------ */

export interface PointInTimeFact {
  label: string;
  value: string;
  current: string;
  differs: boolean;
}

export interface PointInTimeEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  decision: string;
  evaluation: string;
  team: string;
  domain: string;
  narrative: string;
  facts: PointInTimeFact[];
  knownDecisions: string[];
  knownOutcomes: string[];
  knownLearning: string[];
  accessPolicyVersion: string;
  personaVersion: string;
}

export const pointInTimeEvents: PointInTimeEvent[] = [
  {
    id: "pit-before", name: "Before Checkout Retry Evaluation", date: "2026-04-28", time: "09:00",
    decision: "DEC 4812 (not yet created)", evaluation: "Checkout Retry Evaluation (not yet started)",
    team: "Payments Platform", domain: "Payments",
    narrative: "The enterprise had the payments operating model but had not yet evaluated a retry increase.",
    facts: [
      { label: "Payments Platform Persona", value: "v3.1", current: "v3.4", differs: true },
      { label: "Availability", value: "99.95%", current: "99.95%", differs: false },
      { label: "Latency Threshold", value: "250 ms", current: "180 ms", differs: true },
      { label: "Retry Approval Threshold", value: "Not defined", current: "5% traffic exposure", differs: true },
      { label: "Idempotency Control", value: "Candidate", current: "Primary Authority", differs: true },
      { label: "Quarter End Restriction", value: "5 business days", current: "3 business days", differs: true },
      { label: "Identity Dependency Confidence", value: "82%", current: "91%", differs: true },
      { label: "Observed Production Outcome", value: "Not yet known", current: "Checkout Completion +1.8%", differs: true },
      { label: "Learning Record", value: "Does not yet exist", current: "LRN 1426", differs: true },
    ],
    knownDecisions: ["DEC 4610 Payments architecture refresh"],
    knownOutcomes: [], knownLearning: [],
    accessPolicyVersion: "v8", personaVersion: "v3.1",
  },
  {
    id: "pit-approval", name: "At Checkout Retry Approval", date: "2026-05-02", time: "14:30",
    decision: "DEC 4812 Approve retry increase for 5% traffic",
    evaluation: "Checkout Retry Evaluation v1",
    team: "Payments Platform", domain: "Payments",
    narrative: "The state of enterprise knowledge at the exact moment the retry increase was approved.",
    facts: [
      { label: "Payments Platform Persona", value: "v3.2", current: "v3.4", differs: true },
      { label: "Availability", value: "99.95%", current: "99.95%", differs: false },
      { label: "Latency Threshold", value: "250 ms", current: "180 ms", differs: true },
      { label: "Retry Approval Threshold", value: "20% traffic exposure", current: "5% traffic exposure", differs: true },
      { label: "Idempotency Control", value: "Supporting Authority", current: "Primary Authority", differs: true },
      { label: "Quarter End Restriction", value: "5 business days", current: "3 business days", differs: true },
      { label: "Identity Dependency Confidence", value: "86%", current: "91%", differs: true },
      { label: "Observed Production Outcome", value: "Not yet known", current: "Checkout Completion +1.8%", differs: true },
      { label: "Learning Record", value: "Does not yet exist", current: "LRN 1426", differs: true },
    ],
    knownDecisions: ["DEC 4610 Payments architecture refresh", "DEC 4812 Approve retry increase"],
    knownOutcomes: [], knownLearning: [],
    accessPolicyVersion: "v8", personaVersion: "v3.2",
  },
  {
    id: "pit-outcome", name: "After First Production Outcome", date: "2026-06-18", time: "11:15",
    decision: "DEC 4812 (executed)", evaluation: "Checkout Retry Evaluation v1",
    team: "Payments Platform", domain: "Payments",
    narrative: "The first production outcome had been observed but no learning record existed yet.",
    facts: [
      { label: "Payments Platform Persona", value: "v3.3", current: "v3.4", differs: true },
      { label: "Availability", value: "99.95%", current: "99.95%", differs: false },
      { label: "Latency Threshold", value: "250 ms", current: "180 ms", differs: true },
      { label: "Retry Approval Threshold", value: "20% traffic exposure", current: "5% traffic exposure", differs: true },
      { label: "Idempotency Control", value: "Supporting Authority", current: "Primary Authority", differs: true },
      { label: "Quarter End Restriction", value: "5 business days", current: "3 business days", differs: true },
      { label: "Identity Dependency Confidence", value: "88%", current: "91%", differs: true },
      { label: "Observed Production Outcome", value: "Checkout Completion +1.8%, Duplicate Authorizations +0.4%", current: "Checkout Completion +1.8%", differs: false },
      { label: "Learning Record", value: "Does not yet exist", current: "LRN 1426", differs: true },
    ],
    knownDecisions: ["DEC 4610", "DEC 4812"],
    knownOutcomes: ["OUT 2214 Checkout retry production outcome"], knownLearning: [],
    accessPolicyVersion: "v9", personaVersion: "v3.3",
  },
  {
    id: "pit-idempotency", name: "After Idempotency Control Update", date: "2026-08-04", time: "16:45",
    decision: "DEC 4818 Idempotency control promotion", evaluation: "Retry Reassessment v2",
    team: "Payments Platform", domain: "Payments",
    narrative: "Learning from the observed outcome promoted the idempotency control and lowered the exposure ceiling.",
    facts: [
      { label: "Payments Platform Persona", value: "v3.4", current: "v3.4", differs: false },
      { label: "Availability", value: "99.95%", current: "99.95%", differs: false },
      { label: "Latency Threshold", value: "250 ms", current: "180 ms", differs: true },
      { label: "Retry Approval Threshold", value: "5% traffic exposure", current: "5% traffic exposure", differs: false },
      { label: "Idempotency Control", value: "Primary Authority", current: "Primary Authority", differs: false },
      { label: "Quarter End Restriction", value: "3 business days", current: "3 business days", differs: false },
      { label: "Identity Dependency Confidence", value: "91%", current: "91%", differs: false },
      { label: "Observed Production Outcome", value: "Checkout Completion +1.8%", current: "Checkout Completion +1.8%", differs: false },
      { label: "Learning Record", value: "LRN 1426", current: "LRN 1426", differs: false },
    ],
    knownDecisions: ["DEC 4610", "DEC 4812", "DEC 4818"],
    knownOutcomes: ["OUT 2214"], knownLearning: ["LRN 1426"],
    accessPolicyVersion: "v10", personaVersion: "v3.4",
  },
  {
    id: "pit-current", name: "Current", date: "2026-08-06", time: "10:22",
    decision: "—", evaluation: "—", team: "Payments Platform", domain: "Payments",
    narrative: "Current operational memory state.",
    facts: [
      { label: "Payments Platform Persona", value: "v3.4", current: "v3.4", differs: false },
      { label: "Availability", value: "99.95%", current: "99.95%", differs: false },
      { label: "Latency Threshold", value: "180 ms (candidate) / 250 ms (approved)", current: "180 ms", differs: false },
      { label: "Retry Approval Threshold", value: "5% traffic exposure", current: "5% traffic exposure", differs: false },
      { label: "Idempotency Control", value: "Primary Authority", current: "Primary Authority", differs: false },
      { label: "Quarter End Restriction", value: "3 business days (conflict open)", current: "3 business days", differs: false },
      { label: "Identity Dependency Confidence", value: "91%", current: "91%", differs: false },
      { label: "Observed Production Outcome", value: "Checkout Completion +1.8%", current: "Checkout Completion +1.8%", differs: false },
      { label: "Learning Record", value: "LRN 1426", current: "LRN 1426", differs: false },
    ],
    knownDecisions: ["DEC 4610", "DEC 4812", "DEC 4818"],
    knownOutcomes: ["OUT 2214"], knownLearning: ["LRN 1426"],
    accessPolicyVersion: "v10", personaVersion: "v3.4",
  },
];

export const pointInTimeKnowledgeTypes = [
  "Business Conditions", "Team Persona Versions", "Policies", "Dependencies",
  "Evidence", "Decisions", "Known Outcomes", "Access Policies",
];

/* ------------------------------------------------------------------ */
/* Snapshots                                                           */
/* ------------------------------------------------------------------ */

export interface MemorySnapshot {
  id: string;
  name: string;
  timestamp: string;
  domains: string[];
  recordCount: string;
  relationshipCount: string;
  indexVersion: string;
  accessPolicyVersion: string;
  createdBy: string;
  reason: string;
  status: "Current" | "Immutable" | "Simulated" | "Archived";
}

export const memorySnapshots: MemorySnapshot[] = [
  { id: "SNP 1001", name: "Current Operational Memory", timestamp: "2026-08-06 10:22", domains: ["All"], recordCount: "23.9M", relationshipCount: "84.2M", indexVersion: "v412", accessPolicyVersion: "v10", createdBy: "Memory Operations", reason: "Live operational state", status: "Current" },
  { id: "SNP 1002", name: "Quarter End Release Snapshot", timestamp: "2026-06-30 23:59", domains: ["Payments", "Identity", "Release"], recordCount: "22.8M", relationshipCount: "80.1M", indexVersion: "v398", accessPolicyVersion: "v9", createdBy: "Release Governance", reason: "Quarter end release freeze evidence", status: "Immutable" },
  { id: "SNP 1003", name: "Checkout Retry Decision Snapshot", timestamp: "2026-05-02 14:30", domains: ["Payments", "Checkout"], recordCount: "21.4M", relationshipCount: "74.6M", indexVersion: "v361", accessPolicyVersion: "v8", createdBy: "Decision Intelligence", reason: "Context captured at DEC 4812 approval", status: "Immutable" },
  { id: "SNP 1004", name: "Security Policy Review Snapshot", timestamp: "2026-07-20 08:00", domains: ["Identity", "Security"], recordCount: "9.2M", relationshipCount: "28.4M", indexVersion: "v405", accessPolicyVersion: "v10", createdBy: "Security Governance", reason: "Access policy review baseline", status: "Immutable" },
];

export const snapshotScopes = [
  "Single Team", "Selected Records", "Business Unit", "Knowledge Domain",
  "Impact Evaluation Context", "Decision Context", "Point in Time",
];

export const snapshotIncludes = [
  "Memory Records", "Evidence Metadata", "Condition Metadata", "Persona Versions",
  "Relationships", "Decision Context", "Access Policy Metadata",
];

/* ------------------------------------------------------------------ */
/* Access & policy                                                     */
/* ------------------------------------------------------------------ */

export const accessSummary = [
  { label: "Access Validated", value: "98%" },
  { label: "Restricted Records", value: "3.4M" },
  { label: "Highly Restricted", value: "284K" },
  { label: "Access Conflicts", value: "42" },
  { label: "Permission Drift", value: "18" },
  { label: "Pending Access Reviews", value: "26" },
];

export const accessClassifications = ["Public", "Internal", "Confidential", "Restricted", "Highly Restricted"] as const;
export type AccessLevel = (typeof accessClassifications)[number];

export interface MemoryAccessPolicy {
  id: string;
  name: string;
  memoryTypes: string[];
  accessClassifications: AccessLevel[];
  approvedConsumerTypes: string[];
  restrictedConsumerTypes: string[];
  regionalRestrictions: string;
  evidenceInheritanceRules: string;
  derivedKnowledgeRules: string;
  status: "Active" | "Review Required" | "Draft";
  version: string;
}

export const accessPolicies: MemoryAccessPolicy[] = [
  {
    id: "POL 210", name: "Public Enterprise Knowledge", memoryTypes: ["Canonical Artifact"],
    accessClassifications: ["Public"], approvedConsumerTypes: ["All identities", "All agents"],
    restrictedConsumerTypes: [], regionalRestrictions: "None",
    evidenceInheritanceRules: "Evidence inherits public classification",
    derivedKnowledgeRules: "Derived knowledge remains public", status: "Active", version: "v4",
  },
  {
    id: "POL 212", name: "Internal Operating Knowledge", memoryTypes: ["Business Condition", "Team Persona", "Policy Condition"],
    accessClassifications: ["Internal"], approvedConsumerTypes: ["Employees", "Approved agents"],
    restrictedConsumerTypes: ["External Partner"], regionalRestrictions: "None",
    evidenceInheritanceRules: "Evidence inherits the most restrictive source classification",
    derivedKnowledgeRules: "Derived conditions may be returned to approved agents", status: "Active", version: "v7",
  },
  {
    id: "POL 216", name: "Confidential Reliability Evidence", memoryTypes: ["Evidence Record", "Business Condition"],
    accessClassifications: ["Confidential"], approvedConsumerTypes: ["Engineering identities", "Impact Evaluation Agent"],
    restrictedConsumerTypes: ["External Partner", "Customer Support Analyst"], regionalRestrictions: "EU data stays in EU",
    evidenceInheritanceRules: "Raw excerpts require confidential entitlement",
    derivedKnowledgeRules: "Derived conditions permitted at Internal classification", status: "Active", version: "v6",
  },
  {
    id: "POL 220", name: "Restricted Identity Evidence", memoryTypes: ["Evidence Record"],
    accessClassifications: ["Restricted", "Highly Restricted"],
    approvedConsumerTypes: ["Identity Engineering", "Security Architecture", "Compliance Reviewers"],
    restrictedConsumerTypes: ["Payments Impact Evaluation Agent", "External Partner", "Customer Support Analyst"],
    regionalRestrictions: "Restricted to primary region",
    evidenceInheritanceRules: "Raw evidence never inherited by derived consumers",
    derivedKnowledgeRules: "Approved derived business condition may be returned when policy permits",
    status: "Review Required", version: "v10",
  },
];

export interface AccessMatrixRow {
  memoryType: string;
  classification: AccessLevel;
  approvedConsumerType: string;
  restrictedConsumerType: string;
  evidenceInheritance: string;
  derivedKnowledgeRule: string;
  regionalRestrictions: string;
  status: "Validated" | "Conflict" | "Review Required";
}

export const accessMatrix: AccessMatrixRow[] = [
  { memoryType: "Canonical Artifact", classification: "Public", approvedConsumerType: "All identities", restrictedConsumerType: "—", evidenceInheritance: "Public", derivedKnowledgeRule: "Public", regionalRestrictions: "None", status: "Validated" },
  { memoryType: "Business Condition", classification: "Internal", approvedConsumerType: "Employees, approved agents", restrictedConsumerType: "External Partner", evidenceInheritance: "Most restrictive source", derivedKnowledgeRule: "Derived permitted", regionalRestrictions: "None", status: "Validated" },
  { memoryType: "Team Persona", classification: "Internal", approvedConsumerType: "Employees, Persona Services", restrictedConsumerType: "External Partner", evidenceInheritance: "Most restrictive source", derivedKnowledgeRule: "Derived permitted", regionalRestrictions: "None", status: "Validated" },
  { memoryType: "Evidence Record", classification: "Confidential", approvedConsumerType: "Engineering identities", restrictedConsumerType: "Support Analyst", evidenceInheritance: "Requires confidential entitlement", derivedKnowledgeRule: "Derived at Internal", regionalRestrictions: "EU in EU", status: "Review Required" },
  { memoryType: "Evidence Record", classification: "Restricted", approvedConsumerType: "Identity Engineering, Security Architecture", restrictedConsumerType: "Impact Evaluation Agent", evidenceInheritance: "Never inherited", derivedKnowledgeRule: "Derived condition only", regionalRestrictions: "Primary region", status: "Conflict" },
  { memoryType: "Evidence Record", classification: "Highly Restricted", approvedConsumerType: "Compliance Reviewers", restrictedConsumerType: "All agents", evidenceInheritance: "Never inherited", derivedKnowledgeRule: "Metadata only", regionalRestrictions: "Primary region", status: "Conflict" },
  { memoryType: "Decision Record", classification: "Internal", approvedConsumerType: "Decision Intelligence", restrictedConsumerType: "External Partner", evidenceInheritance: "Inherits decision context", derivedKnowledgeRule: "Derived permitted", regionalRestrictions: "None", status: "Validated" },
  { memoryType: "Learning Record", classification: "Internal", approvedConsumerType: "Organizational Learning", restrictedConsumerType: "External Partner", evidenceInheritance: "Inherits outcome context", derivedKnowledgeRule: "Derived permitted", regionalRestrictions: "None", status: "Validated" },
];

export const accessConflictSeed = {
  record: "Restricted Identity API Evidence",
  recordId: "MEM 100404",
  approved: ["Identity Engineering", "Security Architecture", "Compliance Reviewers"],
  requestedBy: "Payments Impact Evaluation Agent without restricted evidence entitlement",
  results: [
    "Raw evidence denied",
    "Approved derived business condition may be returned when policy permits",
    "Access event logged as AUD 90218",
  ],
};

/* Access simulator */

export interface SimIdentity {
  id: string;
  name: string;
  type: "Human" | "Agent" | "External";
  entitlements: AccessLevel[];
  restrictedEvidence: boolean;
}

export const simIdentities: SimIdentity[] = [
  { id: "id-chief", name: "Chief Architect", type: "Human", entitlements: ["Public", "Internal", "Confidential", "Restricted"], restrictedEvidence: true },
  { id: "id-payeng", name: "Payments Engineer", type: "Human", entitlements: ["Public", "Internal", "Confidential"], restrictedEvidence: false },
  { id: "id-secrev", name: "Security Reviewer", type: "Human", entitlements: ["Public", "Internal", "Confidential", "Restricted", "Highly Restricted"], restrictedEvidence: true },
  { id: "id-support", name: "Customer Support Analyst", type: "Human", entitlements: ["Public", "Internal"], restrictedEvidence: false },
  { id: "id-impact", name: "Impact Evaluation Agent", type: "Agent", entitlements: ["Public", "Internal", "Confidential"], restrictedEvidence: false },
  { id: "id-decision", name: "Decision Intelligence Agent", type: "Agent", entitlements: ["Public", "Internal", "Confidential"], restrictedEvidence: false },
  { id: "id-partner", name: "External Partner", type: "External", entitlements: ["Public"], restrictedEvidence: false },
];

export interface SimRecord {
  id: string;
  title: string;
  memoryType: string;
  classification: AccessLevel;
  policyId: string;
  derivedConditionId: string | null;
  inheritedFrom: string;
}

export const simRecords: SimRecord[] = [
  { id: "MEM 100404", title: "Restricted Identity API Evidence", memoryType: "Evidence Record", classification: "Restricted", policyId: "POL 220", derivedConditionId: "MEM 100405", inheritedFrom: "Identity API access log (Restricted)" },
  { id: "MEM 100405", title: "Identity Services Dependency Condition", memoryType: "Business Condition", classification: "Internal", policyId: "POL 212", derivedConditionId: null, inheritedFrom: "Derived from MEM 100404" },
  { id: "MEM 100418", title: "Identity Services Latency Threshold", memoryType: "Business Condition", classification: "Confidential", policyId: "POL 216", derivedConditionId: null, inheritedFrom: "Identity Runbook (Confidential)" },
  { id: "MEM 100422", title: "Payments Platform Persona v3.4", memoryType: "Team Persona", classification: "Internal", policyId: "POL 212", derivedConditionId: null, inheritedFrom: "Persona evidence set (Internal)" },
  { id: "MEM 100431", title: "Quarter End Deployment Restriction", memoryType: "Policy Condition", classification: "Internal", policyId: "POL 212", derivedConditionId: null, inheritedFrom: "Release Governance Standard (Internal)" },
  { id: "MEM 100499", title: "Compliance Investigation Evidence", memoryType: "Evidence Record", classification: "Highly Restricted", policyId: "POL 220", derivedConditionId: null, inheritedFrom: "Compliance case file (Highly Restricted)" },
];

const levelRank: Record<AccessLevel, number> = {
  Public: 0, Internal: 1, Confidential: 2, Restricted: 3, "Highly Restricted": 4,
};

export interface AccessSimulationResult {
  metadataVisible: boolean;
  contentVisible: boolean;
  evidenceVisible: boolean;
  derivedVisible: boolean;
  relationshipVisible: boolean;
  decision: "Allowed" | "Partially Allowed" | "Denied";
  reason: string;
  policyId: string;
  inheritedFrom: string;
  auditId: string;
}

export function simulateAccess(identity: SimIdentity, record: SimRecord): AccessSimulationResult {
  const need = levelRank[record.classification];
  const max = Math.max(...identity.entitlements.map((e) => levelRank[e]));
  const allowed = max >= need;
  const rawEvidence = record.memoryType === "Evidence Record";
  const evidenceVisible = allowed && (!rawEvidence || identity.restrictedEvidence || need <= levelRank.Confidential);
  const derivedVisible = !!record.derivedConditionId && max >= levelRank.Internal;
  const auditId = `AUD ${90200 + levelRank[record.classification] * 7 + identity.name.length}`;

  if (allowed && evidenceVisible) {
    return {
      metadataVisible: true, contentVisible: true, evidenceVisible: true, derivedVisible: derivedVisible || true,
      relationshipVisible: true, decision: "Allowed",
      reason: `${identity.name} holds ${record.classification} entitlement under ${record.policyId}.`,
      policyId: record.policyId, inheritedFrom: record.inheritedFrom, auditId,
    };
  }
  if (allowed && !evidenceVisible) {
    return {
      metadataVisible: true, contentVisible: true, evidenceVisible: false, derivedVisible,
      relationshipVisible: true, decision: "Partially Allowed",
      reason: `Raw evidence requires restricted evidence entitlement. ${derivedVisible ? "Approved derived business condition returned instead." : "No derived condition is approved for release."}`,
      policyId: record.policyId, inheritedFrom: record.inheritedFrom, auditId,
    };
  }
  return {
    metadataVisible: max >= levelRank.Internal && need <= levelRank.Restricted,
    contentVisible: false, evidenceVisible: false, derivedVisible,
    relationshipVisible: false, decision: "Denied",
    reason: `${identity.name} lacks ${record.classification} entitlement. ${derivedVisible ? "A derived business condition is available at Internal classification." : "No approved derived context exists."}`,
    policyId: record.policyId, inheritedFrom: record.inheritedFrom, auditId,
  };
}

/* ------------------------------------------------------------------ */
/* Retention & legal hold                                              */
/* ------------------------------------------------------------------ */

export const retentionMetrics = [
  { label: "Records Under Retention", value: "24.8M" },
  { label: "Retention Actions Due", value: "8,412" },
  { label: "Eligible for Archive", value: "3,284" },
  { label: "Eligible for Deletion Review", value: "842" },
  { label: "Legal Holds", value: "18" },
  { label: "Policy Exceptions", value: "12" },
];

export interface RetentionRow {
  id: string;
  record: string;
  recordId: string;
  memoryType: string;
  retentionPolicy: string;
  created: string;
  effectiveUntil: string;
  archiveDate: string;
  deletionEligibility: string;
  legalHold: boolean;
  owner: string;
  status: "Active" | "Archive Due" | "Deletion Review" | "Legal Hold" | "Archived" | "Exception";
}

export const retentionRows: RetentionRow[] = [
  { id: "RET 4401", recordId: "MEM 100409", record: "Legacy Payments Architecture Record", memoryType: "Canonical Artifact", retentionPolicy: "Architecture 5 year", created: "2021-03-14", effectiveUntil: "2026-03-14", archiveDate: "2026-08-20", deletionEligibility: "Blocked by decision linkage", legalHold: false, owner: "Enterprise Architecture", status: "Archive Due" },
  { id: "RET 4402", recordId: "MEM 100404", record: "Restricted Identity API Evidence", memoryType: "Evidence Record", retentionPolicy: "Security evidence 7 year", created: "2024-11-02", effectiveUntil: "2031-11-02", archiveDate: "—", deletionEligibility: "Not eligible", legalHold: true, owner: "Security Governance", status: "Legal Hold" },
  { id: "RET 4403", recordId: "MEM 100421", record: "Retry approval threshold v3.2", memoryType: "Business Condition", retentionPolicy: "Decision context 10 year", created: "2026-05-02", effectiveUntil: "2036-05-02", archiveDate: "—", deletionEligibility: "Not eligible — decision context", legalHold: false, owner: "Payments Platform Engineering", status: "Active" },
  { id: "RET 4404", recordId: "MEM 100380", record: "Deprecated Checkout Runbook 2019", memoryType: "Canonical Artifact", retentionPolicy: "Operational 3 year", created: "2019-06-30", effectiveUntil: "2022-06-30", archiveDate: "2022-08-01", deletionEligibility: "Eligible for deletion review", legalHold: false, owner: "Checkout Experience", status: "Deletion Review" },
  { id: "RET 4405", recordId: "MEM 100499", record: "Compliance Investigation Evidence", memoryType: "Evidence Record", retentionPolicy: "Compliance indefinite", created: "2025-09-11", effectiveUntil: "Indefinite", archiveDate: "—", deletionEligibility: "Not eligible", legalHold: true, owner: "Compliance", status: "Legal Hold" },
  { id: "RET 4406", recordId: "MEM 100415", record: "Payments Availability Condition", memoryType: "Business Condition", retentionPolicy: "Operating condition 5 year", created: "2026-01-01", effectiveUntil: "2031-01-01", archiveDate: "—", deletionEligibility: "Not eligible", legalHold: false, owner: "Payments Platform Engineering", status: "Active" },
  { id: "RET 4407", recordId: "MEM 100372", record: "Retired Identity Provider Notes", memoryType: "Canonical Artifact", retentionPolicy: "Operational 3 year", created: "2020-02-10", effectiveUntil: "2023-02-10", archiveDate: "2023-04-01", deletionEligibility: "Exception approved — historical reference", legalHold: false, owner: "Identity Engineering", status: "Exception" },
];

export interface MemoryLegalHold {
  id: string;
  name: string;
  memoryRecordIds: string[];
  reason: string;
  owner: string;
  effectiveDate: string;
  releaseDate: string | null;
  status: "Active" | "Released";
  createdAt: string;
}

export const legalHolds: MemoryLegalHold[] = [
  { id: "LGH 301", name: "Identity access investigation", memoryRecordIds: ["MEM 100404", "MEM 100499"], reason: "Regulatory inquiry into identity API access", owner: "Compliance", effectiveDate: "2026-03-02", releaseDate: null, status: "Active", createdAt: "2026-03-02T09:00:00Z" },
  { id: "LGH 302", name: "Payments dispute matter", memoryRecordIds: ["MEM 100421", "MEM 100422"], reason: "Duplicate authorization dispute", owner: "Legal", effectiveDate: "2026-07-10", releaseDate: null, status: "Active", createdAt: "2026-07-10T09:00:00Z" },
];

export const retentionActions = [
  "Apply Retention Policy", "Extend Retention", "Archive", "Mark Historical",
  "Place Legal Hold", "Release Legal Hold", "Request Review",
] as const;

/* ------------------------------------------------------------------ */
/* Publishing                                                          */
/* ------------------------------------------------------------------ */

export interface PublishDestination {
  id: string;
  name: string;
  readyRecords: string;
  published: string;
  pending: string;
  blocked: string;
  lastPublished: string;
  version: string;
  accessValidation: "Validated" | "Pending" | "Failed";
  status: "Healthy" | "Publishing" | "Blocked" | "Paused";
}

export const publishDestinations: PublishDestination[] = [
  { id: "dst-search", name: "Cognitive Search", readyRecords: "18,426", published: "23.4M", pending: "1,204", blocked: "12", lastPublished: "10:06 AM", version: "v412", accessValidation: "Validated", status: "Healthy" },
  { id: "dst-intake", name: "Cognitive Intake", readyRecords: "2,184", published: "4.1M", pending: "182", blocked: "0", lastPublished: "09:54 AM", version: "v118", accessValidation: "Validated", status: "Healthy" },
  { id: "dst-persona", name: "Team Persona Services", readyRecords: "61", published: "61", pending: "8", blocked: "2", lastPublished: "10:22 AM", version: "v3.4", accessValidation: "Validated", status: "Healthy" },
  { id: "dst-impact", name: "Persona Impact Analysis", readyRecords: "984", published: "62K", pending: "44", blocked: "3", lastPublished: "10:01 AM", version: "v88", accessValidation: "Pending", status: "Publishing" },
  { id: "dst-matrix", name: "Cross Team Impact Matrix", readyRecords: "412", published: "18K", pending: "26", blocked: "0", lastPublished: "09:48 AM", version: "v41", accessValidation: "Validated", status: "Healthy" },
  { id: "dst-decision", name: "Decision Intelligence", readyRecords: "2,412", published: "142K", pending: "61", blocked: "4", lastPublished: "10:18 AM", version: "v207", accessValidation: "Validated", status: "Healthy" },
  { id: "dst-mcp", name: "MCP Context Services", readyRecords: "23.9M", published: "23.9M", pending: "0", blocked: "5", lastPublished: "10:20 AM", version: "v66", accessValidation: "Validated", status: "Healthy" },
  { id: "dst-api", name: "Enterprise APIs", readyRecords: "23.9M", published: "23.8M", pending: "1,842", blocked: "0", lastPublished: "09:30 AM", version: "v29", accessValidation: "Validated", status: "Paused" },
  { id: "dst-learning", name: "Organizational Learning", readyRecords: "1,426", published: "18K", pending: "12", blocked: "0", lastPublished: "09:47 AM", version: "v15", accessValidation: "Validated", status: "Healthy" },
];

export const publishScopes = [
  "Selected Records", "Memory Type", "Domain", "Team", "Approved Changes", "Incremental Publication",
];

export const publishValidations = [
  "Approval", "Authority", "Evidence", "Access", "Freshness", "Version", "Conflict Status", "Destination Compatibility",
];

export const publishSimulationSteps = [
  "Validate Records", "Validate Access", "Publish Search Context", "Publish Graph Context",
  "Publish Persona Context", "Publish Decision Context", "Update MCP Context Services",
  "Update APIs", "Update Learning Services", "Completed",
];

/* ------------------------------------------------------------------ */
/* MCP context services                                                */
/* ------------------------------------------------------------------ */

export interface MemoryService {
  id: string;
  name: string;
  description: string;
  approvedMemoryTypes: string[];
  accessPolicyId: string;
  averageLatency: string;
  successRate: string;
  lastInvocation: string;
  status: "Operational" | "Degraded" | "Restricted" | "Paused";
}

export const memoryServices: MemoryService[] = [
  { id: "MCP 01", name: "Search Enterprise Memory", description: "Governed semantic and structured search across approved memory types", approvedMemoryTypes: ["Canonical Artifact", "Business Condition", "Team Persona", "Decision Record"], accessPolicyId: "POL 212", averageLatency: "184 ms", successRate: "99.6%", lastInvocation: "10:22 AM", status: "Operational" },
  { id: "MCP 02", name: "Retrieve Evidence", description: "Returns evidence excerpts only when the caller holds the inherited source entitlement", approvedMemoryTypes: ["Evidence Record"], accessPolicyId: "POL 216", averageLatency: "212 ms", successRate: "97.1%", lastInvocation: "10:21 AM", status: "Restricted" },
  { id: "MCP 03", name: "Retrieve Business Conditions", description: "Returns approved structured conditions with authority, confidence and freshness", approvedMemoryTypes: ["Business Condition", "Policy Condition"], accessPolicyId: "POL 212", averageLatency: "96 ms", successRate: "99.9%", lastInvocation: "10:22 AM", status: "Operational" },
  { id: "MCP 04", name: "Retrieve Team Persona", description: "Returns the approved persona version applicable to the requested moment", approvedMemoryTypes: ["Team Persona"], accessPolicyId: "POL 212", averageLatency: "142 ms", successRate: "99.8%", lastInvocation: "10:19 AM", status: "Operational" },
  { id: "MCP 05", name: "Retrieve Relationship Path", description: "Returns governed context graph paths between memory records", approvedMemoryTypes: ["Relationship"], accessPolicyId: "POL 212", averageLatency: "266 ms", successRate: "98.4%", lastInvocation: "10:16 AM", status: "Operational" },
  { id: "MCP 06", name: "Retrieve Decision Context", description: "Returns the decision record and the memory context used at approval", approvedMemoryTypes: ["Decision Record"], accessPolicyId: "POL 212", averageLatency: "178 ms", successRate: "99.2%", lastInvocation: "10:18 AM", status: "Operational" },
  { id: "MCP 07", name: "Retrieve Outcome Context", description: "Returns observed outcomes linked to prior decisions", approvedMemoryTypes: ["Outcome Record"], accessPolicyId: "POL 212", averageLatency: "154 ms", successRate: "99.4%", lastInvocation: "10:18 AM", status: "Operational" },
  { id: "MCP 08", name: "Retrieve Point in Time Context", description: "Reconstructs the memory state valid at a historical moment without future knowledge", approvedMemoryTypes: ["All approved types"], accessPolicyId: "POL 212", averageLatency: "412 ms", successRate: "98.9%", lastInvocation: "10:04 AM", status: "Operational" },
  { id: "MCP 09", name: "Validate Access", description: "Evaluates whether an identity may receive a record, its evidence or derived context", approvedMemoryTypes: ["All types"], accessPolicyId: "POL 220", averageLatency: "38 ms", successRate: "100%", lastInvocation: "10:22 AM", status: "Operational" },
  { id: "MCP 10", name: "Explain Memory Record", description: "Returns provenance, authority, freshness and lineage for a record", approvedMemoryTypes: ["All approved types"], accessPolicyId: "POL 212", averageLatency: "204 ms", successRate: "99.5%", lastInvocation: "10:11 AM", status: "Operational" },
];

/* ------------------------------------------------------------------ */
/* Agent context simulator                                             */
/* ------------------------------------------------------------------ */

export const simAgents = [
  "Cognitive Intake Agent", "Persona Impact Agent", "Decision Intelligence Agent",
  "Reliability Review Agent", "Security Review Agent",
];

export const simTasks = [
  "Evaluate Checkout Retry Policy Update",
  "Assess Identity Dependency Risk",
  "Review Quarter End Release Window",
];

export const simRequiredContext = [
  "Team Persona", "Business Conditions", "Policy Conditions", "Dependencies",
  "Evidence", "Decision History", "Outcome History", "Learning Records",
];

export interface AgentSimulationOutput {
  allowed: { id: string; title: string; type: string; classification: string; note: string }[];
  denied: { id: string; title: string; classification: string; reason: string; alternative: string }[];
  derived: { id: string; title: string; note: string }[];
  evidence: { id: string; title: string; access: string }[];
  relationshipPaths: string[];
  decisionHistory: string[];
  outcomeHistory: string[];
  learningRecords: string[];
  confidence: number;
  freshness: string;
  accessExplanations: string[];
}

/* ------------------------------------------------------------------ */
/* Usage & reuse                                                       */
/* ------------------------------------------------------------------ */

export const usageMetrics = [
  { label: "Memory Queries", value: "186K", detail: "this month" },
  { label: "Records Reused in Impact Evaluations", value: "79,842", detail: "" },
  { label: "Records Reused in Decisions", value: "42,184", detail: "" },
  { label: "Personas Reused", value: "61", detail: "" },
  { label: "Evidence Opened", value: "18,426", detail: "" },
  { label: "Point in Time Queries", value: "1,842", detail: "" },
  { label: "MCP Context Requests", value: "38,426", detail: "" },
];

export interface ReuseRow {
  record: string;
  recordId: string;
  reuseCount: string;
  consumerType: string;
  decisionImpact: string;
  outcomeLinkage: string;
  quality: string;
  freshness: string;
}

export const topReusedRecords: ReuseRow[] = [
  { record: "Payments Platform Persona", recordId: "MEM 100422", reuseCount: "12,842", consumerType: "Persona Services, Agents", decisionImpact: "High", outcomeLinkage: "OUT 2214", quality: "96", freshness: "Current" },
  { record: "Payments Availability Condition", recordId: "MEM 100415", reuseCount: "9,206", consumerType: "Impact Analysis", decisionImpact: "High", outcomeLinkage: "OUT 2214", quality: "94", freshness: "Current" },
  { record: "Identity Services Dependency", recordId: "MEM 100405", reuseCount: "7,418", consumerType: "Agents, Impact Analysis", decisionImpact: "High", outcomeLinkage: "—", quality: "88", freshness: "Aging" },
  { record: "Quarter End Restriction", recordId: "MEM 100431", reuseCount: "6,204", consumerType: "Decision Intelligence", decisionImpact: "Medium", outcomeLinkage: "—", quality: "91", freshness: "Current" },
  { record: "Retry Approval Requirement", recordId: "MEM 100428", reuseCount: "4,882", consumerType: "Impact Analysis, Agents", decisionImpact: "High", outcomeLinkage: "OUT 2214", quality: "93", freshness: "Current" },
];

/* ------------------------------------------------------------------ */
/* Decision & outcome learning                                         */
/* ------------------------------------------------------------------ */

export const learningFlowStages = [
  "Memory Context", "Impact Evaluation", "Decision", "Execution",
  "Observed Outcome", "Learning Record", "Future Memory Update",
];

export const learningLoop = {
  memoryContext: [
    "Payments Platform Persona v3.2",
    "Payments Availability Condition 99.95%",
    "Identity Latency Threshold 250 ms",
    "Idempotency Control (Supporting)",
  ],
  evaluation: "Checkout Retry Evaluation v1 — EVL 981",
  decision: "DEC 4812 · Approve retry increase for 5% traffic",
  execution: "Released 2026-05-14 within approved deployment window",
  expected: ["Checkout Completion +1.5%", "No increase in duplicate authorizations"],
  observed: ["Checkout Completion +1.8%", "Duplicate Authorizations +0.4%"],
  learning: "Require stronger idempotency validation before traffic expansion",
  futureUpdates: [
    "Idempotency Control promoted to Primary authority",
    "Retry approval checklist updated",
    "Payments Persona preferred evidence updated",
    "Confidence scores updated",
  ],
  immutabilityNote:
    "Historical decision context for DEC 4812 remains unchanged. Learning updates future context only.",
};

/* ------------------------------------------------------------------ */
/* Quality detail                                                      */
/* ------------------------------------------------------------------ */

export const qualityRecalculationTriggers = [
  "Evidence Added", "Owner Assigned", "Authority Resolved", "Conflict Resolved",
  "Access Corrected", "Record Refreshed", "Relationship Rebuilt", "Outcome Linked",
];

export interface QualityDetailBlock {
  definition: string;
  memoryTypeDistribution: { label: string; value: string }[];
  domainDistribution: { label: string; value: string }[];
  ownerDistribution: { label: string; value: string }[];
  topFailureCauses: string[];
  affectedConsumers: string[];
  affectedPersonas: string[];
  affectedEvaluations: string[];
  affectedDecisions: string[];
  affectedLearningRecords: string[];
  recommendedActions: string[];
  recentChanges: { when: string; what: string }[];
}

export const qualityDetail: QualityDetailBlock = {
  definition: "Share of records meeting the dimension target across all governed memory types.",
  memoryTypeDistribution: [
    { label: "Evidence Record", value: "38%" }, { label: "Business Condition", value: "24%" },
    { label: "Canonical Artifact", value: "18%" }, { label: "Team Persona", value: "11%" },
    { label: "Decision / Outcome", value: "9%" },
  ],
  domainDistribution: [
    { label: "Payments", value: "31%" }, { label: "Identity", value: "22%" },
    { label: "Checkout", value: "18%" }, { label: "Platform", value: "16%" }, { label: "Support", value: "13%" },
  ],
  ownerDistribution: [
    { label: "Payments Platform Engineering", value: "26%" }, { label: "Identity Engineering", value: "21%" },
    { label: "Enterprise Architecture", value: "19%" }, { label: "Release Governance", value: "18%" },
    { label: "Security Governance", value: "16%" },
  ],
  topFailureCauses: [
    "Source artifact updated after last evidence link",
    "Owner unassigned after team reorganisation",
    "Competing authoritative records not resolved",
    "Access classification inherited incorrectly",
  ],
  affectedConsumers: ["Cognitive Search", "Impact Analysis", "MCP Context Services", "Decision Intelligence"],
  affectedPersonas: ["Payments Platform", "Checkout Experience", "Identity Engineering", "Release Governance"],
  affectedEvaluations: ["EVL 981", "EVL 984", "EVL 990"],
  affectedDecisions: ["DEC 4812", "DEC 4818"],
  affectedLearningRecords: ["LRN 1426"],
  recommendedActions: ["Refresh stale evidence", "Resolve authority conflicts", "Assign missing owners", "Republish approved records"],
  recentChanges: [
    { when: "10:22 AM", what: "Persona v3.4 published — quality +0.4" },
    { when: "09:52 AM", what: "Idempotency authority resolved — authority +1.1" },
    { when: "09:14 AM", what: "Identity condition marked Aging — freshness −0.7" },
  ],
};

/* ------------------------------------------------------------------ */
/* Global search                                                       */
/* ------------------------------------------------------------------ */

export const globalSearchTypes = [
  "Memory Record", "Evidence", "Canonical Artifact", "Condition", "Team Persona", "Entity",
  "Relationship", "Policy", "Risk", "Control", "Decision", "Outcome", "Learning Record",
  "Governance Review", "Snapshot",
];

export interface GlobalSearchResult {
  id: string;
  type: string;
  title: string;
  domain: string;
  owner: string;
  authority: string;
  confidence: string;
  freshness: string;
  accessState: "Allowed" | "Derived Only" | "Denied";
  keywords: string[];
}

export const globalSearchIndex: GlobalSearchResult[] = [
  { id: "MEM 100415", type: "Condition", title: "Payments Availability Target 99.95%", domain: "Payments", owner: "Payments Platform Engineering", authority: "Primary", confidence: "96%", freshness: "Current", accessState: "Allowed", keywords: ["payments", "availability", "evidence", "slo"] },
  { id: "MEM 100404", type: "Evidence", title: "Restricted Identity API Evidence", domain: "Identity", owner: "Security Governance", authority: "Primary", confidence: "97%", freshness: "Current", accessState: "Denied", keywords: ["identity", "restricted", "evidence", "payments agents", "requested"] },
  { id: "MEM 100405", type: "Condition", title: "Identity Services Dependency Condition", domain: "Identity", owner: "Identity Engineering", authority: "Primary", confidence: "86%", freshness: "Aging", accessState: "Derived Only", keywords: ["identity", "dependency", "personas", "services"] },
  { id: "MEM 100418", type: "Condition", title: "Identity Services Latency Threshold", domain: "Identity", owner: "Identity Engineering", authority: "Primary", confidence: "71%", freshness: "Stale", accessState: "Allowed", keywords: ["stale", "conditions", "active evaluations", "latency"] },
  { id: "MEM 100422", type: "Team Persona", title: "Payments Platform Persona v3.4", domain: "Payments", owner: "Payments Platform Engineering", authority: "Primary", confidence: "94%", freshness: "Current", accessState: "Allowed", keywords: ["persona", "payments", "identity services", "dependent"] },
  { id: "MEM 100431", type: "Policy", title: "Quarter End Deployment Restriction", domain: "Release", owner: "Release Governance", authority: "Primary", confidence: "94%", freshness: "Current", accessState: "Allowed", keywords: ["quarter end", "restriction", "decisions", "release"] },
  { id: "DEC 4812", type: "Decision", title: "Approve retry increase for 5% traffic", domain: "Payments", owner: "Payments Platform Engineering", authority: "Primary", confidence: "—", freshness: "Historical", accessState: "Allowed", keywords: ["decision", "retry", "quarter end", "affected"] },
  { id: "OUT 2214", type: "Outcome", title: "Checkout retry production outcome", domain: "Payments", owner: "Payments Platform Engineering", authority: "Primary", confidence: "—", freshness: "Current", accessState: "Allowed", keywords: ["outcome", "contradicting", "expectations", "duplicate authorizations"] },
  { id: "LRN 1426", type: "Learning Record", title: "Require idempotency validation before traffic expansion", domain: "Payments", owner: "Organizational Learning", authority: "Primary", confidence: "93%", freshness: "Current", accessState: "Allowed", keywords: ["learning", "idempotency", "outcome"] },
  { id: "MEM 100421", type: "Memory Record", title: "Retry approval threshold 20% (superseded)", domain: "Payments", owner: "Payments Platform Engineering", authority: "Historical", confidence: "82%", freshness: "Historical", accessState: "Allowed", keywords: ["superseded", "quarter", "records", "retry"] },
  { id: "MGR 3405", type: "Governance Review", title: "Restricted Identity API Evidence access conflict", domain: "Identity", owner: "Security Governance", authority: "—", confidence: "—", freshness: "Current", accessState: "Allowed", keywords: ["restricted", "records", "requested", "payments agents", "governance"] },
  { id: "SNP 1003", type: "Snapshot", title: "Checkout Retry Decision Snapshot", domain: "Payments", owner: "Decision Intelligence", authority: "—", confidence: "—", freshness: "Historical", accessState: "Allowed", keywords: ["snapshot", "decision", "retry"] },
  { id: "REL 224", type: "Relationship", title: "Payments Persona depends on Identity Services", domain: "Payments", owner: "Context Graph Operations", authority: "Primary", confidence: "91%", freshness: "Current", accessState: "Allowed", keywords: ["personas", "dependent", "identity services", "relationship"] },
  { id: "CTL 118", type: "Control", title: "Idempotency validation control", domain: "Payments", owner: "Payments Platform Engineering", authority: "Primary", confidence: "93%", freshness: "Current", accessState: "Allowed", keywords: ["control", "idempotency"] },
  { id: "RSK 402", type: "Risk", title: "Duplicate authorization risk", domain: "Payments", owner: "Risk Management", authority: "Primary", confidence: "87%", freshness: "Current", accessState: "Allowed", keywords: ["risk", "duplicate", "authorization"] },
];

export const globalSearchExamples = [
  "Evidence supporting Payments availability",
  "Personas dependent on Identity Services",
  "Decisions affected by quarter end restriction",
  "Stale conditions used in active evaluations",
  "Outcomes contradicting expectations",
  "Restricted records requested by Payments agents",
  "Records superseded this quarter",
];

export function runGlobalSearch(q: string, type: string): GlobalSearchResult[] {
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  return globalSearchIndex.filter((r) => {
    if (type !== "All" && r.type !== type) return false;
    if (terms.length === 0) return true;
    const hay = `${r.title} ${r.type} ${r.domain} ${r.owner} ${r.keywords.join(" ")}`.toLowerCase();
    return terms.some((t) => hay.includes(t));
  });
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export const notificationCategories = [
  "Indexing Completed", "Indexing Failed", "Authority Conflict", "Access Conflict",
  "Record Became Stale", "Material Drift", "Memory Review Requested", "Record Superseded",
  "Snapshot Created", "Publishing Completed", "Publishing Failed", "Agent Access Denied",
  "Decision Requires Reassessment", "Outcome Updated Confidence", "Learning Record Published",
];

export interface MemoryNotification {
  id: string;
  category: string;
  title: string;
  detail: string;
  time: string;
  severity: "info" | "warning" | "critical";
  read: boolean;
  targetId: string;
}

export const seedNotifications: MemoryNotification[] = [
  { id: "NTF 701", category: "Learning Record Published", title: "LRN 1426 published", detail: "Idempotency validation required before traffic expansion", time: "09:47 AM", severity: "info", read: false, targetId: "LRN 1426" },
  { id: "NTF 702", category: "Agent Access Denied", title: "Restricted evidence denied", detail: "Payments Impact Evaluation Agent · MEM 100404", time: "09:58 AM", severity: "critical", read: false, targetId: "MEM 100404" },
  { id: "NTF 703", category: "Authority Conflict", title: "Quarter End Deployment Restriction", detail: "Two primary records disagree on the restriction window", time: "10:09 AM", severity: "warning", read: false, targetId: "CFL 5101" },
  { id: "NTF 704", category: "Record Became Stale", title: "Identity latency condition marked Aging", detail: "Evidence is 214 days old", time: "10:14 AM", severity: "warning", read: false, targetId: "MEM 100418" },
  { id: "NTF 705", category: "Outcome Updated Confidence", title: "OUT 2214 linked to DEC 4812", detail: "Confidence recalculated for 4 records", time: "10:18 AM", severity: "info", read: false, targetId: "OUT 2214" },
  { id: "NTF 706", category: "Publishing Completed", title: "Payments Platform Persona v3.4 published", detail: "9 destinations updated", time: "10:22 AM", severity: "info", read: true, targetId: "MEM 100422" },
  { id: "NTF 707", category: "Indexing Completed", title: "Semantic index refreshed", detail: "Payments domain · 12,406 records", time: "10:06 AM", severity: "info", read: true, targetId: "IDX 60451" },
  { id: "NTF 708", category: "Material Drift", title: "Identity threshold drift detected", detail: "250 ms → 180 ms", time: "07:28 AM", severity: "warning", read: false, targetId: "DRF 9101" },
  { id: "NTF 709", category: "Decision Requires Reassessment", title: "DEC 4812 requires reassessment", detail: "Outcome contradicted expected duplicate authorization result", time: "08:04 AM", severity: "warning", read: false, targetId: "DEC 4812" },
  { id: "NTF 710", category: "Snapshot Created", title: "Security Policy Review Snapshot", detail: "SNP 1004 · 9.2M records", time: "08:00 AM", severity: "info", read: true, targetId: "SNP 1004" },
];

/* ------------------------------------------------------------------ */
/* Recent activity                                                     */
/* ------------------------------------------------------------------ */

export interface MemoryActivity {
  id: string;
  timestamp: string;
  memoryRecordId: string;
  action: string;
  description: string;
  memoryType: string;
  domain: string;
  result: "Success" | "Warning" | "Denied" | "Conflict";
  owner: string;
  auditId: string;
}

export const memoryActivities: MemoryActivity[] = [
  { id: "ACT 5001", timestamp: "10:22 AM", memoryRecordId: "MEM 100422", action: "Published", description: "Payments Platform Persona v3.4 published", memoryType: "Team Persona", domain: "Payments", result: "Success", owner: "Payments Platform Engineering", auditId: "AUD 90311" },
  { id: "ACT 5002", timestamp: "10:18 AM", memoryRecordId: "OUT 2214", action: "Linked", description: "Checkout Retry Outcome linked to DEC 4812", memoryType: "Outcome Record", domain: "Payments", result: "Success", owner: "Decision Intelligence", auditId: "AUD 90309" },
  { id: "ACT 5003", timestamp: "10:14 AM", memoryRecordId: "MEM 100418", action: "Freshness Change", description: "Identity latency condition marked Aging", memoryType: "Business Condition", domain: "Identity", result: "Warning", owner: "Identity Engineering", auditId: "AUD 90307" },
  { id: "ACT 5004", timestamp: "10:09 AM", memoryRecordId: "MEM 100431", action: "Conflict Opened", description: "Quarter End Deployment Restriction conflict opened", memoryType: "Policy Condition", domain: "Release", result: "Conflict", owner: "Release Governance", auditId: "AUD 90304" },
  { id: "ACT 5005", timestamp: "10:06 AM", memoryRecordId: "IDX 60451", action: "Indexing Completed", description: "Semantic Index completed Payments domain refresh", memoryType: "Index Record", domain: "Payments", result: "Success", owner: "Memory Operations", auditId: "AUD 90301" },
  { id: "ACT 5006", timestamp: "10:03 AM", memoryRecordId: "GRA 881", action: "Graph Update", description: "New Context Graph relationships published", memoryType: "Relationship", domain: "Payments", result: "Success", owner: "Context Graph Operations", auditId: "AUD 90298" },
  { id: "ACT 5007", timestamp: "9:58 AM", memoryRecordId: "MEM 100404", action: "Access Denied", description: "Agent access denied for restricted Identity evidence", memoryType: "Evidence Record", domain: "Identity", result: "Denied", owner: "Security Governance", auditId: "AUD 90218" },
  { id: "ACT 5008", timestamp: "9:52 AM", memoryRecordId: "MEM 100428", action: "Authority Change", description: "Idempotency control authority increased to Primary", memoryType: "Policy Condition", domain: "Payments", result: "Success", owner: "Payments Platform Engineering", auditId: "AUD 90211" },
  { id: "ACT 5009", timestamp: "9:47 AM", memoryRecordId: "LRN 1426", action: "Learning Published", description: "Learning record LRN 1426 published", memoryType: "Learning Record", domain: "Payments", result: "Success", owner: "Organizational Learning", auditId: "AUD 90206" },
];

/* ------------------------------------------------------------------ */
/* Governed export                                                     */
/* ------------------------------------------------------------------ */

export const exportFormats = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot", "Graph Metadata Export"] as const;
export type ExportFormat = (typeof exportFormats)[number];

export const exportScopes = [
  "Current View", "Selected Records", "Selected Memory Layer", "Selected Domain", "Selected Team",
  "Evidence & Provenance", "Conditions", "Team Personas", "Decisions & Outcomes", "Learning Records",
  "Memory Quality", "Governance Queue", "Point in Time Snapshot", "Full Approved Memory Metadata",
];

export const exportOptions = [
  "Include Structured Fields", "Evidence References", "Relationships", "Owners", "Authority",
  "Access", "Versions", "Decisions", "Outcomes", "Learning", "Audit History",
];

/* ------------------------------------------------------------------ */
/* Demo story                                                          */
/* ------------------------------------------------------------------ */

export interface DemoStep {
  id: number;
  target: string;
  title: string;
  caption: string;
  presenterNote: string;
}

export const demoSteps: DemoStep[] = [
  { id: 1, target: "panel-architecture", title: "Enterprise Memory Records and Architecture", caption: "Enterprise Cognitive Memory preserves evidence, structured knowledge, Team Personas, relationships, decisions, outcomes, and learning as coordinated organizational memory.", presenterNote: "Anchor the audience on memory as an operating capability, not a repository." },
  { id: 2, target: "panel-composition", title: "Evidence Vault and Conditions Registry", caption: "The original evidence remains unchanged while reusable business meaning is stored beside it.", presenterNote: "Stress immutability of source evidence." },
  { id: 3, target: "panel-graph", title: "Team Persona Library and Context Graph", caption: "Approved conditions become part of evidence linked team operating models and enterprise relationships.", presenterNote: "Show relationships between conditions, personas and services." },
  { id: 4, target: "panel-explorer", title: "Enterprise Memory Explorer", caption: "Users can search across memory types without losing authority, freshness, evidence, ownership, access, or provenance.", presenterNote: "Point out authority and freshness columns." },
  { id: 5, target: "panel-workbench", title: "Checkout Retry query", caption: "The Fabric retrieves the conditions, Personas, dependencies, prior decisions, outcomes, and learning relevant to the proposed change.", presenterNote: "Run the seeded query and pause on the conclusions." },
  { id: 6, target: "panel-provenance", title: "Evidence and relationship tracing", caption: "Every conclusion can be traced to exact evidence and the path connecting it to teams, services, decisions, and outcomes.", presenterNote: "Open one lineage node." },
  { id: 7, target: "panel-conflicts", title: "Memory Conflicts", caption: "Conflicting rules, authority, ownership, access, and effective dates are resolved before reuse.", presenterNote: "Use the quarter end restriction conflict." },
  { id: 8, target: "panel-pit", title: "Point in Time Memory", caption: "The enterprise can reconstruct exactly what was known, approved, and applicable when a historical decision was made.", presenterNote: "Select At Checkout Retry Approval and highlight the excluded future knowledge." },
  { id: 9, target: "panel-mcp", title: "MCP Context Services and Agent Context Simulator", caption: "Agents receive only the approved context permitted for their task and identity.", presenterNote: "Run a denied simulation for restricted evidence." },
  { id: 10, target: "panel-learning", title: "Decision & Outcome Learning", caption: "Observed outcomes improve future context without rewriting the knowledge that existed when the original decision was made.", presenterNote: "Close on immutability of historical decision context." },
];

/* ------------------------------------------------------------------ */
/* Demo scenarios                                                      */
/* ------------------------------------------------------------------ */

export type ScenarioId =
  | "healthy" | "indexing-backlog" | "stale-evidence" | "authority-conflict" | "access-conflict"
  | "duplicate-records" | "material-drift" | "decision-reassessment" | "outcome-contradiction"
  | "point-in-time" | "legal-hold" | "publishing" | "mcp-denied" | "refreshed" | "learning-published";

export interface ScenarioOverlay {
  id: ScenarioId;
  name: string;
  description: string;
  serviceState: string;
  banner: string;
  bannerTone: "green" | "amber" | "red" | "blue";
  kpiDeltas: Record<string, string>;
  governanceStatus: string;
  qualityDelta: string;
  freshnessDelta: string;
  driftStatus: string;
  publishingStatus: string;
  focusPanel: string;
  activity: string;
  notification: string;
  operationalState: string;
}

export const demoScenarios: ScenarioOverlay[] = [
  { id: "healthy", name: "Healthy Enterprise Memory", description: "All memory layers operational, no blocking governance issues.", serviceState: "Operational", banner: "Enterprise memory is healthy — all layers current and published", bannerTone: "green", kpiDeltas: { quality: "96.2", freshness: "94.1" }, governanceStatus: "Healthy", qualityDelta: "+0.4", freshnessDelta: "+0.6", driftStatus: "Minor drift only", publishingStatus: "All destinations current", focusPanel: "panel-kpis", activity: "Memory health check completed", notification: "Indexing Completed", operationalState: "Healthy" },
  { id: "indexing-backlog", name: "Indexing Backlog", description: "Semantic index is behind the approved record set.", serviceState: "Indexing", banner: "Semantic index backlog — 184K records awaiting reindex", bannerTone: "amber", kpiDeltas: { quality: "93.8", freshness: "90.2" }, governanceStatus: "Warning", qualityDelta: "−1.9", freshnessDelta: "−3.1", driftStatus: "Detection delayed", publishingStatus: "Search destination pending", focusPanel: "panel-indexing", activity: "Indexing backlog detected", notification: "Indexing Failed", operationalState: "Indexing" },
  { id: "stale-evidence", name: "Stale Evidence", description: "Critical conditions rely on evidence beyond the freshness target.", serviceState: "Review Required", banner: "482K records stale — 2 active evaluations depend on stale evidence", bannerTone: "amber", kpiDeltas: { quality: "91.4", freshness: "84.6" }, governanceStatus: "Critical", qualityDelta: "−3.8", freshnessDelta: "−8.9", driftStatus: "Material drift on identity threshold", publishingStatus: "Blocked at freshness validation", focusPanel: "panel-drift", activity: "Identity latency condition marked Stale", notification: "Record Became Stale", operationalState: "Stale" },
  { id: "authority-conflict", name: "Authority Conflict", description: "Competing primary records for the quarter end restriction.", serviceState: "Review Required", banner: "Authority conflict — quarter end restriction has two primary records", bannerTone: "red", kpiDeltas: { quality: "92.1", freshness: "93.8" }, governanceStatus: "Critical", qualityDelta: "−2.4", freshnessDelta: "−0.2", driftStatus: "Policy drift detected", publishingStatus: "Blocked at conflict status", focusPanel: "panel-conflicts", activity: "Quarter End conflict opened", notification: "Authority Conflict", operationalState: "Conflict" },
  { id: "access-conflict", name: "Access Conflict", description: "Restricted evidence requested by an unentitled agent.", serviceState: "Degraded", banner: "Access conflict — restricted identity evidence requested without entitlement", bannerTone: "red", kpiDeltas: { quality: "94.0", freshness: "93.6" }, governanceStatus: "Critical", qualityDelta: "−0.6", freshnessDelta: "0.0", driftStatus: "Access classification drift", publishingStatus: "MCP destination restricted", focusPanel: "panel-access", activity: "Agent access denied", notification: "Access Conflict", operationalState: "Access Denied" },
  { id: "duplicate-records", name: "Duplicate Records", description: "Duplicate availability conditions across two owners.", serviceState: "Review Required", banner: "642 duplicate records pending curation", bannerTone: "amber", kpiDeltas: { quality: "93.2", freshness: "93.9" }, governanceStatus: "Warning", qualityDelta: "−1.2", freshnessDelta: "0.0", driftStatus: "No material drift", publishingStatus: "Search results deduplicating", focusPanel: "panel-curation", activity: "Duplicate candidate detected", notification: "Memory Review Requested", operationalState: "Review Required" },
  { id: "material-drift", name: "Material Memory Drift", description: "Source thresholds moved materially away from approved records.", serviceState: "Review Required", banner: "3,284 records with material drift — 8 personas require refresh", bannerTone: "amber", kpiDeltas: { quality: "90.8", freshness: "86.4" }, governanceStatus: "Critical", qualityDelta: "−4.1", freshnessDelta: "−7.2", driftStatus: "Material drift across payments and identity", publishingStatus: "Blocked at freshness validation", focusPanel: "panel-drift", activity: "Material drift detected", notification: "Material Drift", operationalState: "Drift Detected" },
  { id: "decision-reassessment", name: "Decision Requires Reassessment", description: "A prior decision depends on records that have changed.", serviceState: "Review Required", banner: "DEC 4812 requires reassessment — supporting memory changed", bannerTone: "amber", kpiDeltas: { quality: "93.4", freshness: "92.0" }, governanceStatus: "Warning", qualityDelta: "−1.1", freshnessDelta: "−1.8", driftStatus: "Threshold drift affects decision", publishingStatus: "Decision Intelligence pending", focusPanel: "panel-learning", activity: "Decision reassessment requested", notification: "Decision Requires Reassessment", operationalState: "Review Required" },
  { id: "outcome-contradiction", name: "Outcome Contradicts Expectation", description: "Observed production outcome diverged from the expected result.", serviceState: "Review Required", banner: "Observed outcome contradicts expectation — duplicate authorizations +0.4%", bannerTone: "amber", kpiDeltas: { quality: "93.9", freshness: "93.4" }, governanceStatus: "Warning", qualityDelta: "−0.7", freshnessDelta: "−0.4", driftStatus: "Outcome contradiction recorded", publishingStatus: "Learning destination pending", focusPanel: "panel-learning", activity: "Outcome contradiction recorded", notification: "Outcome Updated Confidence", operationalState: "Learning Pending" },
  { id: "point-in-time", name: "Point in Time Investigation", description: "Historical reconstruction for the checkout retry approval.", serviceState: "Operational", banner: "Historical reconstruction active — At Checkout Retry Approval", bannerTone: "blue", kpiDeltas: { quality: "94.6", freshness: "91.2" }, governanceStatus: "Healthy", qualityDelta: "historical", freshnessDelta: "historical", driftStatus: "Not applicable in historical view", publishingStatus: "Read only", focusPanel: "panel-pit", activity: "Point in time reconstruction executed", notification: "Snapshot Created", operationalState: "Historical" },
  { id: "legal-hold", name: "Legal Hold Applied", description: "Retention actions frozen for records under legal hold.", serviceState: "Operational", banner: "18 legal holds active — retention actions suspended", bannerTone: "amber", kpiDeltas: { quality: "95.1", freshness: "93.8" }, governanceStatus: "Warning", qualityDelta: "0.0", freshnessDelta: "0.0", driftStatus: "No change", publishingStatus: "Unaffected", focusPanel: "panel-retention", activity: "Legal hold LGH 302 applied", notification: "Memory Review Requested", operationalState: "Legal Hold" },
  { id: "publishing", name: "Memory Publishing in Progress", description: "Approved records publishing to all destinations.", serviceState: "Indexing", banner: "Publishing in progress — 6 of 9 destinations complete", bannerTone: "blue", kpiDeltas: { quality: "95.4", freshness: "94.0" }, governanceStatus: "Healthy", qualityDelta: "+0.2", freshnessDelta: "+0.3", driftStatus: "No material drift", publishingStatus: "Publishing", focusPanel: "panel-publishing", activity: "Publication PUB 2201 started", notification: "Publishing Completed", operationalState: "Publishing" },
  { id: "mcp-denied", name: "MCP Access Denied", description: "An agent request for restricted context was denied.", serviceState: "Degraded", banner: "MCP request denied — restricted evidence not entitled for requesting agent", bannerTone: "red", kpiDeltas: { quality: "94.2", freshness: "93.6" }, governanceStatus: "Critical", qualityDelta: "−0.4", freshnessDelta: "0.0", driftStatus: "No change", publishingStatus: "MCP destination restricted", focusPanel: "panel-agent-sim", activity: "MCP access denied", notification: "Agent Access Denied", operationalState: "Access Denied" },
  { id: "refreshed", name: "Memory Refreshed", description: "A refresh run completed and downstream impact was reassessed.", serviceState: "Operational", banner: "Memory refresh completed — 3,284 records updated, 1,102 new versions", bannerTone: "green", kpiDeltas: { quality: "96.6", freshness: "96.2" }, governanceStatus: "Healthy", qualityDelta: "+2.8", freshnessDelta: "+4.4", driftStatus: "Drift cleared", publishingStatus: "Republish queued", focusPanel: "panel-refresh", activity: "Memory refresh completed", notification: "Indexing Completed", operationalState: "Refreshing" },
  { id: "learning-published", name: "Learning Record Published", description: "Learning from the retry outcome now shapes future context.", serviceState: "Operational", banner: "Learning record LRN 1426 published — future context updated", bannerTone: "green", kpiDeltas: { quality: "96.0", freshness: "94.4" }, governanceStatus: "Healthy", qualityDelta: "+1.2", freshnessDelta: "+0.5", driftStatus: "Outcome linkage improved", publishingStatus: "Organizational Learning current", focusPanel: "panel-learning", activity: "Learning record published", notification: "Learning Record Published", operationalState: "Healthy" },
];

export const operationalStates = [
  "Loading", "Empty", "Error", "Healthy", "Warning", "Blocked", "Conflict", "Review Required",
  "Stale", "Drift Detected", "Indexing", "Refreshing", "Legal Hold", "Publishing", "Published",
  "Historical", "Superseded", "Access Denied", "Learning Pending",
] as const;
export type OperationalState = (typeof operationalStates)[number];

export const operationalStateExplanations: Record<string, { meaning: string; consumers: string; remediation: string }> = {
  Blocked: { meaning: "Records cannot publish because a validation gate failed.", consumers: "Cognitive Search, MCP Context Services", remediation: "Resolve the failing validation and republish the scope." },
  Conflict: { meaning: "Two or more records assert competing authority or values.", consumers: "Impact Analysis, Decision Intelligence", remediation: "Open the conflict comparison and select, merge, or transition the records." },
  Stale: { meaning: "Supporting evidence is older than the freshness target.", consumers: "Impact Analysis, Persona Services", remediation: "Run a memory refresh over the affected scope." },
  "Drift Detected": { meaning: "The source state moved away from the approved record.", consumers: "Persona Services, Decision Intelligence", remediation: "Open the drift comparison and accept, version, or dismiss the change." },
  "Access Denied": { meaning: "The requesting identity lacks the required entitlement.", consumers: "Requesting agent only", remediation: "Request entitlement or consume the approved derived condition." },
  "Legal Hold": { meaning: "Retention actions are suspended while a legal matter is open.", consumers: "Retention operations", remediation: "Release the hold once the matter closes." },
};

/* Deterministic YAML serialiser for governed export. */
export function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value.map((v) =>
      typeof v === "object" && v !== null
        ? `${pad}-\n${toYaml(v, indent + 1)}`
        : `${pad}- ${String(v)}`).join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) => {
      if (typeof v === "object" && v !== null) {
        const nested = toYaml(v, indent + 1);
        return Array.isArray(v)
          ? `${pad}${k}:\n${nested}`
          : `${pad}${k}:\n${nested}`;
      }
      return `${pad}${k}: ${String(v)}`;
    }).join("\n");
  }
  return `${pad}${String(value)}`;
}
