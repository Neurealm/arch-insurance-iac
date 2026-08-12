/**
 * Persona Validation — deterministic seeded demonstration data.
 * Synthetic enterprise content only. No backend, no real employee data.
 */

export type ValidationView = "review-queue" | "workbench" | "governance" | "portfolio-risk";
export type Freshness = "Current" | "Aging" | "Stale";
export type Severity = "Critical" | "High" | "Medium" | "Low";

/* ------------------------------- lifecycle -------------------------------- */

export interface ValidationStage {
  id: string; index: number; name: string;
  status: "Running" | "Warning" | "Review Required" | "Blocked" | "Idle";
  processed: number; pending: number; successRate: number; avgDuration: string; p95Duration: string;
  warnings: number; failures: number; queue: number; owner: string; sla: "Within SLA" | "At risk" | "Breached";
  note: string;
}

export const validationStages: ValidationStage[] = [
  { id: "receive", index: 1, name: "Receive Draft Persona", status: "Running", processed: 72, pending: 12, successRate: 99, avgDuration: "42 s", p95Duration: "1 m 20 s", warnings: 0, failures: 0, queue: 12, owner: "Persona Construction", sla: "Within SLA", note: "72 draft Personas received this quarter." },
  { id: "identity", index: 2, name: "Validate Identity and Ownership", status: "Warning", processed: 69, pending: 3, successRate: 94, avgDuration: "3 m", p95Duration: "8 m", warnings: 3, failures: 0, queue: 3, owner: "Persona Governance", sla: "At risk", note: "3 Personas missing confirmed owners." },
  { id: "mission", index: 3, name: "Validate Mission and Scope", status: "Running", processed: 68, pending: 4, successRate: 94, avgDuration: "4 m", p95Duration: "11 m", warnings: 1, failures: 0, queue: 4, owner: "Team Owners", sla: "Within SLA", note: "94 percent validated." },
  { id: "evidence", index: 4, name: "Validate Conditions and Evidence", status: "Warning", processed: 64, pending: 8, successRate: 89, avgDuration: "9 m", p95Duration: "24 m", warnings: 12, failures: 1, queue: 8, owner: "Evidence Governance", sla: "At risk", note: "12 evidence issues open." },
  { id: "dependencies", index: 5, name: "Validate Dependencies", status: "Warning", processed: 58, pending: 6, successRate: 87, avgDuration: "12 m", p95Duration: "31 m", warnings: 4, failures: 0, queue: 6, owner: "Dependency Owners", sla: "At risk", note: "4 unresolved dependency conflicts." },
  { id: "risks", index: 6, name: "Validate Risks and Decision Logic", status: "Running", processed: 56, pending: 5, successRate: 91, avgDuration: "10 m", p95Duration: "26 m", warnings: 2, failures: 0, queue: 5, owner: "Architecture Council", sla: "Within SLA", note: "91 percent complete." },
  { id: "resolve", index: 7, name: "Resolve Conflicts and Gaps", status: "Review Required", processed: 47, pending: 9, successRate: 82, avgDuration: "26 m", p95Duration: "1 h 14 m", warnings: 9, failures: 2, queue: 26, owner: "Persona Review Board", sla: "Breached", note: "9 conflicts and 17 gaps open." },
  { id: "team-owner", index: 8, name: "Team Owner Review", status: "Review Required", processed: 44, pending: 7, successRate: 93, avgDuration: "6 h", p95Duration: "22 h", warnings: 2, failures: 0, queue: 7, owner: "Team Owners", sla: "At risk", note: "7 pending team owner reviews." },
  { id: "dependency-owner", index: 9, name: "Dependency Owner Review", status: "Review Required", processed: 41, pending: 4, successRate: 90, avgDuration: "8 h", p95Duration: "27 h", warnings: 1, failures: 0, queue: 4, owner: "Dependency Owners", sla: "At risk", note: "4 pending dependency reviews." },
  { id: "governance", index: 10, name: "Governance Approval", status: "Review Required", processed: 38, pending: 3, successRate: 96, avgDuration: "1 d", p95Duration: "3 d", warnings: 0, failures: 0, queue: 3, owner: "Governance Board", sla: "Within SLA", note: "3 pending governance approvals." },
  { id: "publish", index: 11, name: "Publish Persona", status: "Running", processed: 61, pending: 2, successRate: 99, avgDuration: "1 m", p95Duration: "3 m", warnings: 0, failures: 0, queue: 2, owner: "Cognitive Memory", sla: "Within SLA", note: "61 Personas published." },
];

export const lifecycleCallouts = [
  { tone: "red" as const, text: "Identity Engineering blocked by dependency conflict" },
  { tone: "amber" as const, text: "Customer Support Persona contains stale escalation evidence" },
  { tone: "amber" as const, text: "Payments Platform awaiting team owner approval" },
  { tone: "green" as const, text: "Persona publishing service healthy" },
];

/* -------------------------------- reviews --------------------------------- */

export interface ValidationReview {
  id: string; personaId: string; persona: string; team: string; businessUnit: string;
  knowledgeDomain: string; reviewType: string; reason: string; priority: Severity;
  currentStage: string; reviewer: string; reviewerRole: string; quality: number;
  completeness: number; confidence: number; evidenceCoverage: number; conflicts: number;
  due: string; overdue: boolean; age: string; downstreamImpact: string; status: string;
  severity: Severity; approvalStage: string; personaOwner: string; teamOwner: string;
  dependencyTeam: string; conflictType: string; gapType: string; riskLevel: string;
  accessClassification: string; freshness: Freshness; authorityLevel: string; versionStatus: string;
  sectionId: string;
}

export const validationReviews: ValidationReview[] = [
  {
    id: "PVR 3401", personaId: "PERSONA 1001", persona: "Payments Platform", team: "Payments Platform",
    businessUnit: "Commerce Engineering", knowledgeDomain: "Payments", reviewType: "Team Owner Review",
    reason: "Validate decision logic and retry approval threshold", priority: "High",
    currentStage: "Team Owner Review", reviewer: "Jane Smith", reviewerRole: "Persona Owner",
    quality: 94, completeness: 92, confidence: 95, evidenceCoverage: 95, conflicts: 1,
    due: "Today", overdue: false, age: "1 day", downstreamImpact: "2 active evaluations", status: "Pending",
    severity: "High", approvalStage: "Team Owner Approval", personaOwner: "Jane Smith",
    teamOwner: "Payments Engineering Director", dependencyTeam: "Fraud Engineering",
    conflictType: "Threshold Conflict", gapType: "None", riskLevel: "High",
    accessClassification: "Confidential", freshness: "Current", authorityLevel: "Primary",
    versionStatus: "Draft", sectionId: "approval-requirements",
  },
  {
    id: "PVR 3402", personaId: "PERSONA 1004", persona: "Identity Engineering", team: "Identity Engineering",
    businessUnit: "Security Engineering", knowledgeDomain: "Identity", reviewType: "Dependency Conflict",
    reason: "Conflicting identity latency threshold and ownership records", priority: "Critical",
    currentStage: "Resolve Conflicts and Gaps", reviewer: "Security Architecture", reviewerRole: "Architecture",
    quality: 81, completeness: 84, confidence: 82, evidenceCoverage: 87, conflicts: 3,
    due: "2 hours", overdue: true, age: "3 days", downstreamImpact: "Payments and Checkout Personas", status: "Blocked",
    severity: "Critical", approvalStage: "Dependency Owner Review", personaOwner: "Security Architecture",
    teamOwner: "Identity Engineering Director", dependencyTeam: "Payments Platform",
    conflictType: "Dependency Conflict", gapType: "Missing Owners", riskLevel: "High",
    accessClassification: "Restricted", freshness: "Aging", authorityLevel: "Supporting",
    versionStatus: "Draft", sectionId: "metrics",
  },
  {
    id: "PVR 3403", personaId: "PERSONA 1006", persona: "Customer Support Operations", team: "Customer Support Operations",
    businessUnit: "Customer Experience", knowledgeDomain: "Support", reviewType: "Evidence Gap",
    reason: "Escalation philosophy lacks approved supporting evidence", priority: "Medium",
    currentStage: "Validate Conditions and Evidence", reviewer: "Customer Support Leadership", reviewerRole: "Team Owner",
    quality: 86, completeness: 79, confidence: 87, evidenceCoverage: 78, conflicts: 0,
    due: "Tomorrow", overdue: false, age: "4 days", downstreamImpact: "Escalation guidance unavailable", status: "Review Required",
    severity: "Medium", approvalStage: "Persona Owner Review", personaOwner: "Customer Support Leadership",
    teamOwner: "Customer Experience Director", dependencyTeam: "Payments Platform",
    conflictType: "None", gapType: "Missing Evidence", riskLevel: "Medium",
    accessClassification: "Internal", freshness: "Stale", authorityLevel: "Supporting",
    versionStatus: "Draft", sectionId: "escalation-philosophy",
  },
  {
    id: "PVR 3404", personaId: "PERSONA 1007", persona: "Release Governance", team: "Release Governance",
    businessUnit: "Engineering Operations", knowledgeDomain: "Governance", reviewType: "Effective Rule Review",
    reason: "Three day and five day quarter end restrictions conflict", priority: "High",
    currentStage: "Resolve Conflicts and Gaps", reviewer: "Engineering Governance", reviewerRole: "Governance",
    quality: 92, completeness: 93, confidence: 94, evidenceCoverage: 92, conflicts: 1,
    due: "Today", overdue: false, age: "2 days", downstreamImpact: "Change windows across 6 teams", status: "Conflict Review",
    severity: "High", approvalStage: "Governance Approval", personaOwner: "Engineering Governance",
    teamOwner: "Engineering Operations Director", dependencyTeam: "Site Reliability Engineering",
    conflictType: "Effective Date Conflict", gapType: "None", riskLevel: "Medium",
    accessClassification: "Internal", freshness: "Current", authorityLevel: "Primary",
    versionStatus: "Draft", sectionId: "constraints",
  },
  {
    id: "PVR 3405", personaId: "PERSONA 1003", persona: "Fraud Engineering", team: "Fraud Engineering",
    businessUnit: "Risk Technology", knowledgeDomain: "Fraud", reviewType: "Dependency Owner Review",
    reason: "Confirm checkout degradation dependency and fraud timeout behavior", priority: "High",
    currentStage: "Dependency Owner Review", reviewer: "Fraud Engineering Director", reviewerRole: "Dependency Owner",
    quality: 93, completeness: 94, confidence: 94, evidenceCoverage: 93, conflicts: 0,
    due: "Today", overdue: false, age: "1 day", downstreamImpact: "Payments Platform retry evaluation", status: "Pending",
    severity: "High", approvalStage: "Dependency Owner Review", personaOwner: "Priya Patel",
    teamOwner: "Risk Technology Director", dependencyTeam: "Checkout Engineering",
    conflictType: "None", gapType: "None", riskLevel: "High",
    accessClassification: "Internal", freshness: "Current", authorityLevel: "Primary",
    versionStatus: "Draft", sectionId: "dependencies",
  },
  {
    id: "PVR 3406", personaId: "PERSONA 1005", persona: "Site Reliability Engineering", team: "Site Reliability Engineering",
    businessUnit: "Platform Operations", knowledgeDomain: "Reliability", reviewType: "Governance Approval",
    reason: "Critical service Persona requires architecture governance approval", priority: "Medium",
    currentStage: "Governance Approval", reviewer: "Platform Architecture Council", reviewerRole: "Governance",
    quality: 97, completeness: 98, confidence: 97, evidenceCoverage: 97, conflicts: 0,
    due: "Two days", overdue: false, age: "1 day", downstreamImpact: "Reliability context for 12 teams", status: "Awaiting Approval",
    severity: "Medium", approvalStage: "Governance Approval", personaOwner: "Reliability Operations",
    teamOwner: "Platform Operations Director", dependencyTeam: "Observability Engineering",
    conflictType: "None", gapType: "None", riskLevel: "Low",
    accessClassification: "Internal", freshness: "Current", authorityLevel: "Primary",
    versionStatus: "Draft", sectionId: "controls",
  },
];

/* -------------------------------- filters --------------------------------- */

export interface ValidationFilters {
  businessUnit: string; team: string; knowledgeDomain: string; personaStatus: string;
  reviewType: string; reviewStatus: string; approvalStage: string; reviewer: string;
  personaOwner: string; teamOwner: string; dependencyTeam: string; priority: string;
  severity: string; qualityBand: string; completenessBand: string; confidenceBand: string;
  freshness: string; evidenceCoverage: string; authorityLevel: string; conflictType: string;
  gapType: string; riskLevel: string; accessClassification: string; downstreamImpact: string;
  dueDate: string; overdueOnly: string; versionStatus: string;
}

export const defaultValidationFilters: ValidationFilters = {
  businessUnit: "All", team: "All", knowledgeDomain: "All", personaStatus: "All",
  reviewType: "All", reviewStatus: "All", approvalStage: "All", reviewer: "All",
  personaOwner: "All", teamOwner: "All", dependencyTeam: "All", priority: "All",
  severity: "All", qualityBand: "All", completenessBand: "All", confidenceBand: "All",
  freshness: "All", evidenceCoverage: "All", authorityLevel: "All", conflictType: "All",
  gapType: "All", riskLevel: "All", accessClassification: "All", downstreamImpact: "All",
  dueDate: "All", overdueOnly: "All", versionStatus: "All",
};

export const validationFilterLabels: Record<keyof ValidationFilters, string> = {
  businessUnit: "Business Unit", team: "Team", knowledgeDomain: "Knowledge Domain",
  personaStatus: "Persona Status", reviewType: "Review Type", reviewStatus: "Review Status",
  approvalStage: "Approval Stage", reviewer: "Reviewer", personaOwner: "Persona Owner",
  teamOwner: "Team Owner", dependencyTeam: "Dependency Team", priority: "Priority",
  severity: "Severity", qualityBand: "Quality Band", completenessBand: "Completeness Band",
  confidenceBand: "Confidence Band", freshness: "Freshness", evidenceCoverage: "Evidence Coverage",
  authorityLevel: "Authority Level", conflictType: "Conflict Type", gapType: "Gap Type",
  riskLevel: "Risk Level", accessClassification: "Access Classification",
  downstreamImpact: "Downstream Impact", dueDate: "Due Date", overdueOnly: "Overdue Only",
  versionStatus: "Version Status",
};

const uniq = (values: string[]) => ["All", ...Array.from(new Set(values)).sort()];

export const validationFilterOptions: Record<keyof ValidationFilters, string[]> = {
  businessUnit: uniq(validationReviews.map((r) => r.businessUnit)),
  team: uniq(validationReviews.map((r) => r.team)),
  knowledgeDomain: uniq(validationReviews.map((r) => r.knowledgeDomain)),
  personaStatus: ["All", "Draft", "In Review", "Blocked", "Approved", "Published"],
  reviewType: uniq(validationReviews.map((r) => r.reviewType)),
  reviewStatus: uniq(validationReviews.map((r) => r.status)),
  approvalStage: uniq(validationReviews.map((r) => r.approvalStage)),
  reviewer: uniq(validationReviews.map((r) => r.reviewer)),
  personaOwner: uniq(validationReviews.map((r) => r.personaOwner)),
  teamOwner: uniq(validationReviews.map((r) => r.teamOwner)),
  dependencyTeam: uniq(validationReviews.map((r) => r.dependencyTeam)),
  priority: ["All", "Critical", "High", "Medium", "Low"],
  severity: ["All", "Critical", "High", "Medium", "Low"],
  qualityBand: ["All", "90 and above", "80 to 89", "Below 80"],
  completenessBand: ["All", "90 and above", "80 to 89", "Below 80"],
  confidenceBand: ["All", "90 and above", "80 to 89", "Below 80"],
  freshness: ["All", "Current", "Aging", "Stale"],
  evidenceCoverage: ["All", "90 and above", "80 to 89", "Below 80"],
  authorityLevel: ["All", "Primary", "Supporting"],
  conflictType: uniq(validationReviews.map((r) => r.conflictType)),
  gapType: uniq(validationReviews.map((r) => r.gapType)),
  riskLevel: ["All", "Low", "Medium", "High"],
  accessClassification: ["All", "Internal", "Confidential", "Restricted"],
  downstreamImpact: ["All", "With downstream impact", "No downstream impact"],
  dueDate: ["All", "Today", "Tomorrow", "2 hours", "Two days"],
  overdueOnly: ["All", "Overdue only"],
  versionStatus: ["All", "Draft", "Current", "Superseded"],
};

const band = (value: number, choice: string) =>
  choice === "All" ? true
    : choice === "90 and above" ? value >= 90
      : choice === "80 to 89" ? value >= 80 && value < 90
        : value < 80;

export const activeValidationFilterCount = (f: ValidationFilters) =>
  Object.values(f).filter((v) => v !== "All").length;

export function applyValidationFilters(rows: ValidationReview[], f: ValidationFilters, search: string): ValidationReview[] {
  const q = search.trim().toLowerCase();
  return rows.filter((r) => {
    if (f.businessUnit !== "All" && r.businessUnit !== f.businessUnit) return false;
    if (f.team !== "All" && r.team !== f.team) return false;
    if (f.knowledgeDomain !== "All" && r.knowledgeDomain !== f.knowledgeDomain) return false;
    if (f.reviewType !== "All" && r.reviewType !== f.reviewType) return false;
    if (f.reviewStatus !== "All" && r.status !== f.reviewStatus) return false;
    if (f.approvalStage !== "All" && r.approvalStage !== f.approvalStage) return false;
    if (f.reviewer !== "All" && r.reviewer !== f.reviewer) return false;
    if (f.personaOwner !== "All" && r.personaOwner !== f.personaOwner) return false;
    if (f.teamOwner !== "All" && r.teamOwner !== f.teamOwner) return false;
    if (f.dependencyTeam !== "All" && r.dependencyTeam !== f.dependencyTeam) return false;
    if (f.priority !== "All" && r.priority !== f.priority) return false;
    if (f.severity !== "All" && r.severity !== f.severity) return false;
    if (!band(r.quality, f.qualityBand)) return false;
    if (!band(r.completeness, f.completenessBand)) return false;
    if (!band(r.confidence, f.confidenceBand)) return false;
    if (!band(r.evidenceCoverage, f.evidenceCoverage)) return false;
    if (f.freshness !== "All" && r.freshness !== f.freshness) return false;
    if (f.authorityLevel !== "All" && r.authorityLevel !== f.authorityLevel) return false;
    if (f.conflictType !== "All" && r.conflictType !== f.conflictType) return false;
    if (f.gapType !== "All" && r.gapType !== f.gapType) return false;
    if (f.riskLevel !== "All" && r.riskLevel !== f.riskLevel) return false;
    if (f.accessClassification !== "All" && r.accessClassification !== f.accessClassification) return false;
    if (f.downstreamImpact === "With downstream impact" && !r.downstreamImpact) return false;
    if (f.dueDate !== "All" && r.due !== f.dueDate) return false;
    if (f.overdueOnly === "Overdue only" && !r.overdue) return false;
    if (f.versionStatus !== "All" && r.versionStatus !== f.versionStatus) return false;
    if (f.personaStatus !== "All") {
      const map: Record<string, string[]> = {
        Draft: ["Review Required", "Pending"], "In Review": ["Pending", "Conflict Review", "Awaiting Approval"],
        Blocked: ["Blocked"], Approved: ["Approved"], Published: ["Published"],
      };
      if (!(map[f.personaStatus] ?? []).includes(r.status)) return false;
    }
    if (q) {
      const hay = [r.id, r.persona, r.team, r.reviewType, r.reason, r.reviewer, r.status, r.currentStage].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/* ---------------------------------- KPIs ----------------------------------- */

export interface ValidationKpi {
  id: string; name: string; value: string; target?: string; context: string;
  supporting: { label: string; value: string }[]; status: "Healthy" | "Attention" | "Warning";
  trend: number[]; tooltip: string;
}

export const validationKpis: ValidationKpi[] = [
  {
    id: "kpi-awaiting", name: "Personas Awaiting Validation", value: "14", context: "Draft Personas not yet approved for reuse",
    supporting: [{ label: "Team Owner Review", value: "7" }, { label: "Dependency Review", value: "4" }, { label: "Governance Review", value: "3" }],
    status: "Attention", trend: [21, 20, 18, 17, 16, 15, 14, 14],
    tooltip: "Personas with an open validation review. Selecting filters the review queue.",
  },
  {
    id: "kpi-tasks", name: "Open Review Tasks", value: "27", context: "Assigned validation work across all reviewers",
    supporting: [{ label: "Critical", value: "5" }, { label: "High", value: "8" }, { label: "Medium", value: "10" }, { label: "Low", value: "4" }],
    status: "Attention", trend: [39, 36, 34, 32, 30, 29, 28, 27],
    tooltip: "Individual review tasks in the validation queue.",
  },
  {
    id: "kpi-quality", name: "Validation Quality", value: "91 / 100", target: "Target 95", context: "Needs Attention",
    supporting: [{ label: "Dimensions below target", value: "9" }, { label: "Trend", value: "+1" }],
    status: "Warning", trend: [86, 87, 88, 89, 89, 90, 90, 91],
    tooltip: "Weighted validation quality across identity, evidence, dependency and decision logic dimensions.",
  },
  {
    id: "kpi-conflicts", name: "Open Conflicts", value: "9", context: "Contradictions blocking approval",
    supporting: [{ label: "Dependency", value: "4" }, { label: "Decision Rule", value: "3" }, { label: "Authority", value: "2" }],
    status: "Warning", trend: [14, 13, 12, 12, 11, 10, 10, 9],
    tooltip: "Conflicts between conditions, owners, thresholds, policies or applicability.",
  },
  {
    id: "kpi-gaps", name: "Evidence Gaps", value: "12", context: "Persona sections without sufficient evidence",
    supporting: [{ label: "Missing Evidence", value: "5" }, { label: "Low Authority", value: "4" }, { label: "Stale Evidence", value: "3" }],
    status: "Attention", trend: [19, 18, 17, 16, 15, 14, 13, 12],
    tooltip: "Evidence issues preventing section approval.",
  },
  {
    id: "kpi-downstream", name: "Downstream Context Blocked", value: "7 Personas", context: "Attention",
    supporting: [{ label: "Impact Evaluations", value: "4" }, { label: "Active Decisions", value: "2" }, { label: "Incoming Work Items", value: "11" }],
    status: "Attention", trend: [11, 10, 10, 9, 9, 8, 8, 7],
    tooltip: "Consumers waiting on Persona validation to complete.",
  },
];

/* ------------------------------- workbench --------------------------------- */

export interface PersonaSectionRef { id: string; name: string }

export const personaSections: PersonaSectionRef[] = [
  { id: "mission", name: "Mission" },
  { id: "capabilities", name: "Capabilities" },
  { id: "products-services", name: "Products and Services" },
  { id: "customers", name: "Customers" },
  { id: "objectives", name: "Objectives" },
  { id: "metrics", name: "Metrics" },
  { id: "constraints", name: "Constraints" },
  { id: "dependencies", name: "Dependencies" },
  { id: "risks", name: "Risks" },
  { id: "controls", name: "Controls" },
  { id: "decision-logic", name: "Decision Logic" },
  { id: "how-team-thinks", name: "How This Team Thinks" },
  { id: "approval-requirements", name: "Approval Requirements" },
  { id: "escalation-philosophy", name: "Escalation Philosophy" },
  { id: "risk-appetite", name: "Risk Appetite" },
];

export interface WorkbenchSection {
  sectionId: string; persona: string; personaId: string; statement: string; owner: string;
  quality: number; completeness: number; confidence: number; freshness: Freshness;
  reviewStatus: string; conditionCount: number; evidenceCount: number;
}

export const workbenchSections: Record<string, WorkbenchSection> = {
  "approval-requirements": {
    sectionId: "approval-requirements", persona: "Payments Platform", personaId: "PERSONA 1001",
    statement: "Retry policy changes affecting more than 10 percent of checkout traffic require approval from Payments Reliability and Fraud Engineering.",
    owner: "Jane Smith", quality: 88, completeness: 92, confidence: 84, freshness: "Current",
    reviewStatus: "Conflict", conditionCount: 2, evidenceCount: 2,
  },
  mission: {
    sectionId: "mission", persona: "Payments Platform", personaId: "PERSONA 1001",
    statement: "Enable reliable, secure, low friction payment processing for every checkout transaction.",
    owner: "Jane Smith", quality: 96, completeness: 98, confidence: 96, freshness: "Current",
    reviewStatus: "Approved", conditionCount: 6, evidenceCount: 4,
  },
  metrics: {
    sectionId: "metrics", persona: "Payments Platform", personaId: "PERSONA 1001",
    statement: "Availability at least 99.95 percent, P95 authorization latency below 250 milliseconds at peak, error rate below 0.3 percent.",
    owner: "Payments Reliability", quality: 92, completeness: 94, confidence: 91, freshness: "Current",
    reviewStatus: "In Review", conditionCount: 12, evidenceCount: 9,
  },
  dependencies: {
    sectionId: "dependencies", persona: "Payments Platform", personaId: "PERSONA 1001",
    statement: "Depends on Identity Services, Fraud Decision Service, Regional Token Vault and the Observability Platform.",
    owner: "Payments Architecture", quality: 86, completeness: 88, confidence: 85, freshness: "Aging",
    reviewStatus: "Dependency Review", conditionCount: 18, evidenceCount: 11,
  },
  "escalation-philosophy": {
    sectionId: "escalation-philosophy", persona: "Payments Platform", personaId: "PERSONA 1001",
    statement: "Escalate before customer impact becomes widespread and include affected dependency owners in the first escalation hop.",
    owner: "Payments Reliability", quality: 84, completeness: 82, confidence: 83, freshness: "Aging",
    reviewStatus: "Evidence Required", conditionCount: 4, evidenceCount: 2,
  },
};

export const defaultWorkbenchSection = (id: string): WorkbenchSection =>
  workbenchSections[id] ?? {
    sectionId: id, persona: "Payments Platform", personaId: "PERSONA 1001",
    statement: `Validated content for the ${personaSections.find((s) => s.id === id)?.name ?? id} section of the Payments Platform Persona.`,
    owner: "Jane Smith", quality: 90, completeness: 90, confidence: 90, freshness: "Current",
    reviewStatus: "In Review", conditionCount: 5, evidenceCount: 3,
  };

export interface WorkbenchCondition {
  id: string; label: string; statement: string; conditionType: string; owner: string;
  authority: "Primary" | "Supporting"; confidence: number; freshness: Freshness;
  evidenceCount: number; effectiveDate: string; permissions: string;
  artifact: string; passage: string; status: "Mapped" | "Conflict" | "Excluded";
  sectionId: string;
}

export const workbenchConditions: WorkbenchCondition[] = [
  {
    id: "COND 100612", label: "Condition A",
    statement: "Retry policy changes affecting more than 10 percent of checkout traffic require approval from Payments Reliability and Fraud Engineering",
    conditionType: "Approval requirement", owner: "Payments Platform", authority: "Primary", confidence: 94,
    freshness: "Current", evidenceCount: 2, effectiveDate: "2026-07-28", permissions: "Confidential",
    artifact: "Payments API Reliability Requirements v3.2",
    passage: "Retry policy changes affecting more than ten percent of checkout traffic require joint approval from Payments Reliability and Fraud Engineering.",
    status: "Conflict", sectionId: "approval-requirements",
  },
  {
    id: "COND 100489", label: "Condition B",
    statement: "Retry policy changes affecting more than 20 percent of checkout traffic require Payments Platform approval",
    conditionType: "Approval requirement", owner: "Payments Architecture", authority: "Supporting", confidence: 82,
    freshness: "Aging", evidenceCount: 1, effectiveDate: "2025-11-14", permissions: "Internal",
    artifact: "Architecture Review Transcript",
    passage: "For now, anything above twenty percent of checkout traffic should come back to the Payments Platform team for approval.",
    status: "Conflict", sectionId: "approval-requirements",
  },
  {
    id: "COND 100421", label: "Condition C",
    statement: "Payments API availability must be at least 99.95 percent measured at the edge",
    conditionType: "Service level", owner: "Payments Platform", authority: "Primary", confidence: 96,
    freshness: "Current", evidenceCount: 3, effectiveDate: "2026-02-03", permissions: "Internal",
    artifact: "Payments API Reliability Requirements v3.2",
    passage: "The service shall maintain monthly availability of no less than 99.95 percent measured at the edge.",
    status: "Mapped", sectionId: "metrics",
  },
  {
    id: "COND 100731", label: "Condition D",
    statement: "Identity validation P95 latency must remain below 150 milliseconds",
    conditionType: "Service level", owner: "Identity Engineering", authority: "Primary", confidence: 88,
    freshness: "Current", evidenceCount: 2, effectiveDate: "2026-06-11", permissions: "Restricted",
    artifact: "Identity Service Levels v2.1",
    passage: "Identity validation shall complete within 150 milliseconds at the 95th percentile.",
    status: "Conflict", sectionId: "dependencies",
  },
  {
    id: "COND 100777", label: "Condition E",
    statement: "Escalate to dependency owners before customer impact exceeds contained thresholds",
    conditionType: "Escalation rule", owner: "Payments Reliability", authority: "Supporting", confidence: 74,
    freshness: "Stale", evidenceCount: 1, effectiveDate: "2025-08-02", permissions: "Internal",
    artifact: "Incident Response Standard v4 (superseded)",
    passage: "Escalation should reach dependency owners before the impact becomes widely visible to customers.",
    status: "Mapped", sectionId: "escalation-philosophy",
  },
];

export const workbenchAnalysis = {
  conflictType: "Approval Threshold Conflict",
  primaryRecord: "10 percent threshold",
  supportingRecord: "20 percent threshold",
  recommendedResolution: "Use the 10 percent threshold because the supporting artifact predates the current primary approved requirements document",
  downstream: [
    "Payments Platform Persona",
    "Fraud Engineering Persona",
    "Checkout Engineering Persona",
    "2 active impact evaluations",
    "1 active release decision",
  ],
};

export const reviewerDecisionActions = [
  "Approve Section", "Edit Persona Section", "Select Authoritative Condition", "Merge Conditions",
  "Exclude Condition", "Request Additional Evidence", "Request Dependency Review",
  "Mark Known Exception", "Approve with Exception", "Reject Section", "Escalate to Governance",
];

/* ---------------------------- section matrix ------------------------------- */

export interface SectionMatrixRow {
  section: string; completeness: number; evidenceCoverage: number; authority: string;
  confidence: number; freshness: Freshness; ownerValidation: string; dependencyValidation: string;
  conflictState: string; reviewState: string; status: string; sectionId: string;
}

const matrixSeed: [string, string, number, number, string, number, Freshness, string, string, string, string, string][] = [
  ["Identity", "mission", 100, 98, "Primary", 98, "Current", "Confirmed", "Not required", "None", "Approved", "Approved"],
  ["Mission", "mission", 98, 97, "Primary", 96, "Current", "Confirmed", "Not required", "None", "Approved", "Approved"],
  ["Capabilities", "capabilities", 94, 93, "Primary", 93, "Current", "Confirmed", "Not required", "None", "In Review", "In Review"],
  ["Products and Services", "products-services", 96, 95, "Primary", 95, "Current", "Confirmed", "Confirmed", "None", "Approved", "Approved"],
  ["Customers and Stakeholders", "customers", 92, 91, "Supporting", 90, "Current", "Confirmed", "Not required", "None", "In Review", "In Review"],
  ["Objectives", "objectives", 93, 92, "Primary", 92, "Current", "Confirmed", "Not required", "None", "In Review", "In Review"],
  ["Metrics", "metrics", 94, 95, "Primary", 91, "Current", "Confirmed", "Pending", "Threshold", "Conflict Review", "Conflict"],
  ["Constraints", "constraints", 90, 89, "Primary", 89, "Current", "Confirmed", "Not required", "Effective date", "Conflict Review", "Conflict"],
  ["Policies", "constraints", 91, 90, "Primary", 91, "Current", "Confirmed", "Not required", "None", "In Review", "In Review"],
  ["Dependencies", "dependencies", 88, 86, "Supporting", 85, "Aging", "Confirmed", "Pending", "Dependency", "Dependency Review", "Blocked"],
  ["Risks", "risks", 87, 85, "Supporting", 86, "Aging", "Pending", "Not required", "None", "Evidence Required", "Evidence Required"],
  ["Controls", "controls", 89, 88, "Primary", 88, "Current", "Confirmed", "Not required", "Authority", "In Review", "In Review"],
  ["Decision Rules", "decision-logic", 90, 88, "Primary", 89, "Current", "Confirmed", "Pending", "Decision rule", "Conflict Review", "Conflict"],
  ["Decision Priorities", "how-team-thinks", 93, 92, "Primary", 92, "Current", "Confirmed", "Not required", "None", "In Review", "In Review"],
  ["Tradeoffs", "how-team-thinks", 91, 89, "Supporting", 88, "Current", "Confirmed", "Not required", "None", "In Review", "In Review"],
  ["Preferred Evidence", "how-team-thinks", 92, 93, "Primary", 91, "Current", "Confirmed", "Not required", "None", "Approved", "Approved"],
  ["Escalation Philosophy", "escalation-philosophy", 82, 78, "Supporting", 83, "Stale", "Pending", "Pending", "None", "Evidence Required", "Evidence Required"],
  ["Risk Appetite", "risk-appetite", 90, 88, "Primary", 90, "Current", "Confirmed", "Not required", "None", "In Review", "In Review"],
  ["Approval Requirements", "approval-requirements", 92, 95, "Primary", 84, "Current", "Confirmed", "Pending", "Threshold", "Conflict Review", "Conflict"],
  ["Operational Windows", "constraints", 94, 92, "Primary", 93, "Current", "Confirmed", "Not required", "None", "Approved", "Approved"],
  ["Evidence", "mission", 95, 95, "Primary", 94, "Current", "Confirmed", "Not required", "None", "In Review", "In Review"],
];

export const sectionMatrix: SectionMatrixRow[] = matrixSeed.map(
  ([section, sectionId, completeness, evidenceCoverage, authority, confidence, freshness, ownerValidation, dependencyValidation, conflictState, reviewState, status]) => ({
    section, sectionId, completeness, evidenceCoverage, authority, confidence, freshness,
    ownerValidation, dependencyValidation, conflictState, reviewState, status,
  }),
);

/* ------------------------------- conflicts --------------------------------- */

export interface ValidationConflict {
  id: string; persona: string; personaId: string; section: string; sectionId: string;
  conflictType: string; recordA: string; recordB: string; recordAId: string; recordBId: string;
  authorityA: string; authorityB: string; confidenceA: number; confidenceB: number;
  freshnessA: Freshness; freshnessB: Freshness; sourceA: string; sourceB: string;
  effectiveA: string; effectiveB: string; applicabilityA: string; applicabilityB: string;
  ownerA: string; ownerB: string; severity: Severity; affectedTeams: string;
  affectedEvaluations: string; affectedDecisions: string; downstreamImpact: string;
  recommendedResolution: string; status: string;
}

export const validationConflicts: ValidationConflict[] = [
  {
    id: "CONF 5101", persona: "Payments Platform", personaId: "PERSONA 1001", section: "Approval Requirements", sectionId: "approval-requirements",
    conflictType: "Threshold Conflict", recordA: "10 percent traffic threshold requires Payments Reliability and Fraud Engineering approval",
    recordB: "20 percent traffic threshold requires Payments Platform approval", recordAId: "COND 100612", recordBId: "COND 100489",
    authorityA: "Primary", authorityB: "Supporting", confidenceA: 94, confidenceB: 82,
    freshnessA: "Current", freshnessB: "Aging", sourceA: "Payments API Reliability Requirements v3.2", sourceB: "Architecture Review Transcript",
    effectiveA: "2026-07-28", effectiveB: "2025-11-14", applicabilityA: "All checkout traffic", applicabilityB: "Production only",
    ownerA: "Payments Platform", ownerB: "Payments Architecture", severity: "High",
    affectedTeams: "Payments Platform, Fraud Engineering, Checkout Engineering",
    affectedEvaluations: "EVAL 2048, EVAL 2071", affectedDecisions: "DEC 4812",
    downstreamImpact: "2 evaluations and 1 release decision", status: "Open",
    recommendedResolution: "Use the 10 percent threshold because the supporting artifact predates the current primary approved requirements document",
  },
  {
    id: "CONF 5102", persona: "Identity Engineering", personaId: "PERSONA 1004", section: "Service Levels", sectionId: "metrics",
    conflictType: "Dependency Conflict", recordA: "Identity validation P95 below 150 milliseconds",
    recordB: "Identity validation P95 below 200 milliseconds", recordAId: "COND 100731", recordBId: "COND 100702",
    authorityA: "Primary", authorityB: "Supporting", confidenceA: 88, confidenceB: 79,
    freshnessA: "Current", freshnessB: "Aging", sourceA: "Identity Service Levels v2.1", sourceB: "Payments Dependency Register v1.8",
    effectiveA: "2026-06-11", effectiveB: "2025-09-30", applicabilityA: "Global", applicabilityB: "Regional",
    ownerA: "Identity Engineering", ownerB: "Payments Platform", severity: "Critical",
    affectedTeams: "Identity Engineering, Payments Platform, Checkout Engineering",
    affectedEvaluations: "EVAL 2071", affectedDecisions: "DEC 4790",
    downstreamImpact: "Payments and Checkout Personas blocked", status: "Open",
    recommendedResolution: "Adopt the 150 millisecond primary condition and record the 200 millisecond record as historical",
  },
  {
    id: "CONF 5103", persona: "Release Governance", personaId: "PERSONA 1007", section: "Change Restrictions", sectionId: "constraints",
    conflictType: "Effective Date Conflict", recordA: "No production change during the final 3 business days of the quarter",
    recordB: "No production change during the final 5 business days of the quarter", recordAId: "COND 100488", recordBId: "COND 100491",
    authorityA: "Primary", authorityB: "Primary", confidenceA: 93, confidenceB: 90,
    freshnessA: "Current", freshnessB: "Current", sourceA: "Engineering Change Policy v7", sourceB: "Finance Close Calendar 2026",
    effectiveA: "2026-01-01", effectiveB: "2026-07-01", applicabilityA: "All engineering teams", applicabilityB: "Finance impacting systems",
    ownerA: "Engineering Governance", ownerB: "Finance Operations", severity: "High",
    affectedTeams: "6 engineering teams", affectedEvaluations: "EVAL 2090", affectedDecisions: "None",
    downstreamImpact: "Change windows across 6 teams", status: "Open",
    recommendedResolution: "Keep both records with applicability scoped to finance impacting systems",
  },
  {
    id: "CONF 5104", persona: "Checkout Engineering", personaId: "PERSONA 1002", section: "Decision Logic", sectionId: "decision-logic",
    conflictType: "Decision Rule Conflict", recordA: "Prioritize checkout completion when fraud service latency exceeds threshold",
    recordB: "Block all retries when fraud service latency exceeds threshold", recordAId: "COND 100455", recordBId: "COND 100544",
    authorityA: "Primary", authorityB: "Primary", confidenceA: 91, confidenceB: 93,
    freshnessA: "Current", freshnessB: "Current", sourceA: "Checkout Architecture Record v6", sourceB: "Fraud Decision Requirements v4.0",
    effectiveA: "2026-04-18", effectiveB: "2026-05-22", applicabilityA: "Checkout Engineering", applicabilityB: "Fraud Engineering",
    ownerA: "Checkout Engineering", ownerB: "Fraud Engineering", severity: "High",
    affectedTeams: "Checkout Engineering, Fraud Engineering, Payments Platform",
    affectedEvaluations: "EVAL 2048", affectedDecisions: "DEC 4812",
    downstreamImpact: "Retry evaluation cannot complete", status: "Open",
    recommendedResolution: "Escalate to governance because both records are primary and owned by different teams",
  },
];

export const conflictSummary = [
  { label: "Dependency Conflicts", value: 4, type: "Dependency Conflict" },
  { label: "Decision Rule Conflicts", value: 3, type: "Decision Rule Conflict" },
  { label: "Authority Conflicts", value: 2, type: "Authority Conflict" },
  { label: "Effective Date Conflicts", value: 2, type: "Effective Date Conflict" },
  { label: "Applicability Conflicts", value: 4, type: "Applicability Conflict" },
  { label: "Ownership Conflicts", value: 3, type: "Ownership Conflict" },
  { label: "Threshold Conflicts", value: 3, type: "Threshold Conflict" },
  { label: "Policy Conflicts", value: 2, type: "Policy Conflict" },
];

export const conflictActions = [
  "Open Comparison", "Select Authoritative Record", "Merge", "Define Applicability",
  "Define Effective Period", "Mark Historical", "Request Evidence", "Escalate", "Resolve",
];

export const resolutionChoices = [
  "Select A", "Select B", "Merge", "Keep Both for Different Applicability",
  "Keep Both for Different Environments", "Keep Both for Different Services",
  "Create Effective Date Transition", "Mark One Historical", "Mark One Supporting",
  "Remove Both and Request Evidence", "Escalate to Governance",
];

/* ---------------------------------- gaps ----------------------------------- */

export interface ValidationGap {
  id: string; persona: string; personaId: string; section: string; sectionId: string;
  gapType: string; missing: string; severity: Severity; owner: string; qualityImpact: string;
  downstreamImpact: string; recommendedAction: string; due: string; status: string;
  requiredForApproval: boolean;
}

export const gapSummary = [
  { label: "Missing Evidence", value: 5, type: "Missing Evidence" },
  { label: "Missing Owners", value: 3, type: "Missing Owners" },
  { label: "Incomplete Dependencies", value: 4, type: "Incomplete Dependencies" },
  { label: "Missing Decision Rules", value: 6, type: "Missing Decision Rules" },
  { label: "Incomplete Risk Controls", value: 7, type: "Incomplete Risk Controls" },
  { label: "Missing Downstream Consumers", value: 5, type: "Missing Downstream Consumers" },
  { label: "Low Authority Evidence", value: 4, type: "Low Authority Evidence" },
  { label: "Stale Evidence", value: 12, type: "Stale Evidence" },
  { label: "Incomplete Escalation Paths", value: 3, type: "Incomplete Escalation Paths" },
];

export const validationGaps: ValidationGap[] = [
  { id: "GAP 6101", persona: "Customer Support Operations", personaId: "PERSONA 1006", section: "Escalation Philosophy", sectionId: "escalation-philosophy", gapType: "Missing Evidence", missing: "No approved condition supports the contained escalation rule", severity: "High", owner: "Customer Support Leadership", qualityImpact: "-6", downstreamImpact: "Escalation guidance unavailable to Cognitive Intake", recommendedAction: "Request Team Input", due: "Tomorrow", status: "Open", requiredForApproval: true },
  { id: "GAP 6102", persona: "Identity Engineering", personaId: "PERSONA 1004", section: "Identity", sectionId: "mission", gapType: "Missing Owners", missing: "Technical owner unassigned after team transfer", severity: "High", owner: "Unassigned", qualityImpact: "-5", downstreamImpact: "Approval routing blocked", recommendedAction: "Assign Owner", due: "Today", status: "Open", requiredForApproval: true },
  { id: "GAP 6103", persona: "Payments Platform", personaId: "PERSONA 1001", section: "Risks", sectionId: "risks", gapType: "Incomplete Risk Controls", missing: "Recovery expectation undefined for regional vault failure", severity: "Medium", owner: "Payments Reliability", qualityImpact: "-3", downstreamImpact: "Impact evaluations lack recovery baseline", recommendedAction: "Add Control", due: "Two days", status: "Open", requiredForApproval: false },
  { id: "GAP 6104", persona: "Fraud Engineering", personaId: "PERSONA 1003", section: "Dependencies", sectionId: "dependencies", gapType: "Incomplete Dependencies", missing: "Checkout degradation dependency not mapped to a condition", severity: "Medium", owner: "Priya Patel", qualityImpact: "-4", downstreamImpact: "Cross team impact matrix incomplete", recommendedAction: "Add Dependency", due: "Today", status: "In Progress", requiredForApproval: true },
  { id: "GAP 6105", persona: "Release Governance", personaId: "PERSONA 1007", section: "Decision Rules", sectionId: "decision-logic", gapType: "Missing Decision Rules", missing: "No rule describes emergency change handling", severity: "Medium", owner: "Engineering Governance", qualityImpact: "-3", downstreamImpact: "Decision intelligence cannot evaluate emergency change", recommendedAction: "Map Condition", due: "Two days", status: "Open", requiredForApproval: false },
  { id: "GAP 6106", persona: "Customer Experience Analytics", personaId: "PERSONA 1009", section: "Evidence", sectionId: "mission", gapType: "Stale Evidence", missing: "Baseline metrics reference an artifact older than the freshness window", severity: "Low", owner: "CX Analytics", qualityImpact: "-2", downstreamImpact: "Search retrieval confidence reduced", recommendedAction: "Add Evidence", due: "Next week", status: "Open", requiredForApproval: false },
];

export const gapActions = [
  "Open Section", "Add Evidence", "Assign Owner", "Map Condition", "Add Dependency",
  "Add Control", "Request Team Input", "Accept Known Gap", "Escalate",
];

/* ------------------------------ evidence ----------------------------------- */

export const evidenceMetrics = [
  { label: "Persona Sections with Evidence", value: "95 percent" },
  { label: "Primary Authority Coverage", value: "91 percent" },
  { label: "Supporting Evidence Coverage", value: "96 percent" },
  { label: "Stale Evidence", value: "12 sections" },
  { label: "Missing Evidence", value: "5 sections" },
  { label: "Low Authority Evidence", value: "4 sections" },
];

export interface EvidenceValidationRow {
  id: string; persona: string; section: string; sectionId: string; condition: string;
  artifact: string; passage: string; authority: string; confidence: number;
  freshness: Freshness; accessClassification: string; status: string;
}

export const evidenceValidationRows: EvidenceValidationRow[] = [
  { id: "EV 7101", persona: "Payments Platform", section: "Approval Requirements", sectionId: "approval-requirements", condition: "COND 100612", artifact: "Payments API Reliability Requirements v3.2", passage: "Retry policy changes affecting more than ten percent of checkout traffic require joint approval.", authority: "Primary", confidence: 94, freshness: "Current", accessClassification: "Confidential", status: "Validated" },
  { id: "EV 7102", persona: "Payments Platform", section: "Approval Requirements", sectionId: "approval-requirements", condition: "COND 100489", artifact: "Architecture Review Transcript", passage: "Anything above twenty percent should come back to the Payments Platform team.", authority: "Supporting", confidence: 82, freshness: "Aging", accessClassification: "Internal", status: "Conflict" },
  { id: "EV 7103", persona: "Identity Engineering", section: "Service Levels", sectionId: "metrics", condition: "COND 100731", artifact: "Identity Service Levels v2.1", passage: "Identity validation shall complete within 150 milliseconds at the 95th percentile.", authority: "Primary", confidence: 88, freshness: "Current", accessClassification: "Restricted", status: "In Review" },
  { id: "EV 7104", persona: "Customer Support Operations", section: "Escalation Philosophy", sectionId: "escalation-philosophy", condition: "COND 100777", artifact: "Incident Response Standard v4 (superseded)", passage: "Escalation should reach dependency owners before impact becomes widely visible.", authority: "Supporting", confidence: 74, freshness: "Stale", accessClassification: "Internal", status: "Evidence Required" },
  { id: "EV 7105", persona: "Release Governance", section: "Change Restrictions", sectionId: "constraints", condition: "COND 100488", artifact: "Engineering Change Policy v7", passage: "Production change is suspended during the final three business days of each fiscal quarter.", authority: "Primary", confidence: 93, freshness: "Current", accessClassification: "Internal", status: "Validated" },
];

export const evidenceActions = [
  "Open Evidence", "Add Supporting Evidence", "Promote Evidence Authority", "Request Evidence", "Mark Superseded",
];

/* --------------------------- dependency validation ------------------------- */

export interface DependencyValidation {
  id: string; persona: string; dependencyTeam: string; dependency: string; relationship: string;
  criticality: string; evidence: string; personaOwner: string; dependencyReviewer: string;
  due: string; validationState: string; status: string;
}

export const dependencyValidations: DependencyValidation[] = [
  { id: "DEP 8101", persona: "Payments Platform", dependencyTeam: "Identity Engineering", dependency: "Identity Services", relationship: "DEPENDS ON", criticality: "Critical", evidence: "Identity Service Levels v2.1", personaOwner: "Jane Smith", dependencyReviewer: "Identity Engineering", due: "Today", validationState: "Awaiting reviewer", status: "Pending" },
  { id: "DEP 8102", persona: "Payments Platform", dependencyTeam: "Fraud Engineering", dependency: "Fraud Decision Service", relationship: "DEPENDS ON", criticality: "Critical", evidence: "Fraud Decision Requirements v4.0", personaOwner: "Jane Smith", dependencyReviewer: "Fraud Engineering", due: "Completed", validationState: "Confirmed by dependency owner", status: "Approved" },
  { id: "DEP 8103", persona: "Checkout Engineering", dependencyTeam: "Payments Platform", dependency: "Payments API", relationship: "CONSUMES", criticality: "Critical", evidence: "Checkout Architecture Record v6", personaOwner: "Marcus Lee", dependencyReviewer: "Payments Platform", due: "Completed", validationState: "Confirmed by dependency owner", status: "Approved" },
  { id: "DEP 8104", persona: "Site Reliability Engineering", dependencyTeam: "Observability Engineering", dependency: "Telemetry Platform", relationship: "DEPENDS ON", criticality: "High", evidence: "Reliability Measurement Standard v3", personaOwner: "Reliability Operations", dependencyReviewer: "Observability Engineering", due: "Two days", validationState: "Awaiting reviewer", status: "Pending" },
];

export const dependencyActions = [
  "Approve Relationship", "Request Correction", "Change Criticality", "Add Evidence", "Reject Relationship", "Escalate",
];

/* ------------------------ how this team thinks ----------------------------- */

export interface ThinkingCategory {
  id: string; name: string; items: string[]; evidenceCoverage: number; conditionCount: number;
  authority: string; confidence: number; reviewer: string; validationStatus: string;
}

export const thinkingCategories: ThinkingCategory[] = [
  {
    id: "priorities", name: "Decision Priorities",
    items: ["Payment integrity", "Checkout completion", "Reliability", "Security", "Regulatory compliance", "Operational reversibility"],
    evidenceCoverage: 96, conditionCount: 18, authority: "Primary", confidence: 95, reviewer: "Jane Smith", validationStatus: "Approved",
  },
  {
    id: "success", name: "Success Criteria",
    items: ["Availability >= 99.95 percent", "P95 latency < 250 ms", "Error rate target < 0.3 percent", "No duplicate transactions", "No unauthorized token persistence"],
    evidenceCoverage: 97, conditionCount: 24, authority: "Primary", confidence: 96, reviewer: "Payments Reliability", validationStatus: "Approved",
  },
  {
    id: "failure", name: "Failure Modes",
    items: ["Payment authorization unavailable", "Retry amplification", "Identity latency", "Fraud timeout", "Regional dependency failure"],
    evidenceCoverage: 91, conditionCount: 15, authority: "Primary", confidence: 90, reviewer: "Payments Reliability", validationStatus: "In Review",
  },
  {
    id: "tradeoffs", name: "Common Tradeoffs",
    items: ["Fraud protection versus checkout conversion", "Retry aggressiveness versus duplicate transaction risk", "Release speed versus stability", "Regional resilience versus complexity"],
    evidenceCoverage: 88, conditionCount: 11, authority: "Supporting", confidence: 86, reviewer: "Payments Architecture", validationStatus: "In Review",
  },
  {
    id: "evidence", name: "Preferred Evidence",
    items: ["Production telemetry", "Controlled experiments", "Incident trends", "Conversion metrics", "Fraud loss metrics", "Dependency health"],
    evidenceCoverage: 94, conditionCount: 9, authority: "Primary", confidence: 93, reviewer: "Jane Smith", validationStatus: "Approved",
  },
  {
    id: "escalation", name: "Escalation Philosophy",
    items: ["Escalate before widespread customer impact", "Include dependency owners", "Use contained escalation for measurable degradation", "Use critical escalation for payment integrity or broad customer impact"],
    evidenceCoverage: 79, conditionCount: 6, authority: "Supporting", confidence: 81, reviewer: "Payments Reliability", validationStatus: "Evidence Required",
  },
  {
    id: "appetite", name: "Risk Appetite",
    items: ["Low tolerance for payment integrity, security, compliance", "Moderate tolerance for reversible performance experiments", "Higher tolerance for internal tooling change without customer exposure"],
    evidenceCoverage: 90, conditionCount: 8, authority: "Primary", confidence: 90, reviewer: "Payments Engineering Director", validationStatus: "In Review",
  },
];

/* ----------------------------- approval chain ------------------------------ */

export interface ApprovalStage {
  id: string; name: string; reviewer: string; status: string; submitted: string;
  completed: string; due: string; comments: string; conditions: string;
}

export const approvalChain: ApprovalStage[] = [
  { id: "ap-1", name: "Draft Complete", reviewer: "Persona Construction", status: "Complete", submitted: "2026-07-24 09:12", completed: "2026-07-24 09:44", due: "—", comments: "Draft assembled from 428 approved conditions", conditions: "None" },
  { id: "ap-2", name: "Persona Owner Review", reviewer: "Jane Smith", status: "Complete", submitted: "2026-07-24 10:02", completed: "2026-07-25 15:31", due: "2026-07-26", comments: "Two sections edited, evidence requested for escalation", conditions: "None" },
  { id: "ap-3", name: "Team Owner Approval", reviewer: "Payments Engineering Director", status: "Pending", submitted: "2026-07-25 15:40", completed: "—", due: "Today", comments: "Awaiting resolution of retry approval threshold conflict", conditions: "Resolve CONF 5101" },
  { id: "ap-4", name: "Dependency Owner Review", reviewer: "Fraud Engineering, Identity Engineering", status: "Partial", submitted: "2026-07-25 16:05", completed: "—", due: "Today", comments: "Fraud Engineering approved, Identity Engineering pending", conditions: "Identity latency conflict" },
  { id: "ap-5", name: "Architecture Review", reviewer: "Commerce Architecture Council", status: "Not Started", submitted: "—", completed: "—", due: "Two days", comments: "Scheduled after dependency review", conditions: "None" },
  { id: "ap-6", name: "Governance Approval", reviewer: "Governance Board", status: "Not Required", submitted: "—", completed: "—", due: "—", comments: "Not required unless a high impact conflict remains", conditions: "Conditional" },
  { id: "ap-7", name: "Approved", reviewer: "—", status: "Not Started", submitted: "—", completed: "—", due: "—", comments: "Pending upstream approvals", conditions: "None" },
  { id: "ap-8", name: "Published", reviewer: "Cognitive Memory", status: "Not Started", submitted: "—", completed: "—", due: "—", comments: "Publication occurs automatically after approval", conditions: "None" },
];

export const approvalFactors = [
  { label: "Persona Criticality", value: "Tier 0" },
  { label: "Critical Services", value: "3" },
  { label: "Dependencies", value: "18" },
  { label: "Customer Impact", value: "Direct" },
  { label: "Financial Impact", value: "High" },
  { label: "Regulatory Scope", value: "PCI DSS 4.0" },
  { label: "Access Classification", value: "Confidential" },
  { label: "Conflict Count", value: "1 open" },
  { label: "Known Exceptions", value: "0" },
  { label: "Quality", value: "94" },
  { label: "Completeness", value: "92 percent" },
  { label: "Evidence Coverage", value: "95 percent" },
];

/* ---------------------------- validation quality --------------------------- */

export interface QualityMetric {
  name: string; score: number; target: number; trend: number[]; affected: number;
  status: "Healthy" | "Attention" | "Warning"; definition: string; causes: string[]; actions: string[];
}

export const qualityMetrics: QualityMetric[] = [
  { name: "Identity Validation", score: 98, target: 95, trend: [94, 96, 97, 98], affected: 1, status: "Healthy", definition: "Whether Persona identity and ownership records are confirmed by the team.", causes: ["One Persona lacks a confirmed technical owner"], actions: ["Assign technical owner"] },
  { name: "Mission Accuracy", score: 96, target: 95, trend: [92, 94, 95, 96], affected: 2, status: "Healthy", definition: "Whether the mission statement matches the team's stated purpose.", causes: ["Mission not restated after reorganization"], actions: ["Confirm mission with team owner"] },
  { name: "Ownership Validation", score: 92, target: 95, trend: [88, 90, 91, 92], affected: 3, status: "Attention", definition: "Whether Persona, team, technical, and dependency owners are validated.", causes: ["Three Personas missing confirmed owners"], actions: ["Assign owners", "Confirm approval chain"] },
  { name: "Condition Mapping Accuracy", score: 94, target: 95, trend: [90, 92, 93, 94], affected: 4, status: "Attention", definition: "Whether Persona fields map to the correct approved conditions.", causes: ["Two mappings reference superseded conditions"], actions: ["Remap superseded conditions"] },
  { name: "Evidence Coverage", score: 95, target: 95, trend: [91, 93, 94, 95], affected: 5, status: "Healthy", definition: "Share of Persona sections with supporting evidence.", causes: ["Five sections missing evidence"], actions: ["Request evidence"] },
  { name: "Authority Confidence", score: 93, target: 95, trend: [89, 91, 92, 93], affected: 4, status: "Attention", definition: "Authority strength of the sources supporting Persona sections.", causes: ["Four sections rely on supporting authority only"], actions: ["Promote evidence authority"] },
  { name: "Dependency Validation", score: 88, target: 95, trend: [82, 85, 87, 88], affected: 6, status: "Warning", definition: "Whether dependency teams confirmed the relationships attributed to them.", causes: ["Two dependency reviews pending", "One dependency conflict open"], actions: ["Request dependency review"] },
  { name: "Risk and Control Validation", score: 87, target: 95, trend: [81, 84, 86, 87], affected: 7, status: "Warning", definition: "Whether risks, failure modes and controls are validated.", causes: ["Recovery expectations undefined"], actions: ["Add controls"] },
  { name: "Decision Logic Validation", score: 90, target: 95, trend: [85, 87, 89, 90], affected: 5, status: "Attention", definition: "Whether decision rules, tradeoffs and escalation are validated.", causes: ["One decision rule conflict open"], actions: ["Resolve decision rule conflict"] },
  { name: "Reviewer Agreement", score: 89, target: 95, trend: [84, 86, 88, 89], affected: 4, status: "Attention", definition: "Agreement level between reviewers on section decisions.", causes: ["Two reviewers disagree on retry threshold"], actions: ["Escalate to governance"] },
  { name: "Freshness", score: 88, target: 95, trend: [92, 91, 89, 88], affected: 9, status: "Warning", definition: "Recency of the conditions and artifacts backing the Persona.", causes: ["Twelve sections use stale evidence"], actions: ["Refresh Persona"] },
  { name: "Approval Completeness", score: 91, target: 95, trend: [86, 88, 90, 91], affected: 5, status: "Attention", definition: "Whether all required approvals have been captured.", causes: ["Team owner approval pending"], actions: ["Request approval"] },
];

/* ---------------------------- downstream impact ---------------------------- */

export const downstreamMetrics = [
  { label: "Personas Blocked from Publication", value: "7" },
  { label: "Active Impact Evaluations Affected", value: "4" },
  { label: "Incoming Work Items Waiting", value: "11" },
  { label: "Decisions Using Prior Persona Version", value: "2" },
  { label: "Context Graph Updates Pending", value: "14" },
  { label: "Cognitive Search Context Pending", value: "7" },
];

export interface DownstreamConsumer {
  consumer: string; currentVersion: string; proposedVersion: string; impact: string; status: string;
}

export const downstreamConsumers: DownstreamConsumer[] = [
  { consumer: "Cognitive Intake", currentVersion: "v3.3", proposedVersion: "v3.4 Draft", impact: "11 incoming work items evaluated against the prior threshold", status: "Blocked" },
  { consumer: "Persona Impact Analysis", currentVersion: "v3.3", proposedVersion: "v3.4 Draft", impact: "2 evaluations require reassessment", status: "Blocked" },
  { consumer: "Cross Team Impact Matrix", currentVersion: "v3.3", proposedVersion: "v3.4 Draft", impact: "Retry approval path not reflected", status: "Blocked" },
  { consumer: "Decision Intelligence", currentVersion: "v3.3", proposedVersion: "v3.4 Draft", impact: "1 release decision references the prior threshold", status: "Blocked" },
  { consumer: "Cognitive Search", currentVersion: "v3.3", proposedVersion: "v3.4 Draft", impact: "Retrievals return the superseded approval rule", status: "Pending" },
  { consumer: "MCP Context Services", currentVersion: "v3.3", proposedVersion: "v3.4 Draft", impact: "Context bundle publication deferred", status: "Pending" },
];

export const downstreamReasons = [
  "Team Owner Approval Pending",
  "Approval Threshold Conflict Unresolved",
];

/* --------------------------- version validation ---------------------------- */

export interface VersionDiffRow {
  section: string; previous: string; current: string; change: "Added" | "Removed" | "Changed" | "Unchanged"; accepted?: boolean;
}

export const versionDiff: VersionDiffRow[] = [
  { section: "Mission", previous: "Enable reliable, secure, low friction payment processing", current: "Enable reliable, secure, low friction payment processing for every checkout transaction", change: "Changed" },
  { section: "Capabilities", previous: "4 capabilities", current: "4 capabilities", change: "Unchanged" },
  { section: "Services", previous: "3 services", current: "3 services", change: "Unchanged" },
  { section: "Objectives", previous: "2 objectives", current: "2 objectives", change: "Unchanged" },
  { section: "Metrics", previous: "P95 target 250 ms", current: "P95 target 250 ms", change: "Unchanged" },
  { section: "Constraints", previous: "Quarter end restriction, 3 business days", current: "Quarter end restriction updated with finance close alignment", change: "Changed" },
  { section: "Dependencies", previous: "Identity dependency confidence 84 percent", current: "Identity dependency confidence 91 percent", change: "Changed" },
  { section: "Risks", previous: "3 risks", current: "3 risks", change: "Unchanged" },
  { section: "Controls", previous: "Idempotency control authority Advisory", current: "Idempotency control authority Authoritative", change: "Changed" },
  { section: "Decision Logic", previous: "3 decision rules", current: "4 decision rules", change: "Added" },
  { section: "Approval Requirements", previous: "Fraud approval above 20 percent traffic exposure", current: "Fraud approval above 10 percent traffic exposure", change: "Changed" },
  { section: "How This Team Thinks", previous: "Escalation philosophy incomplete", current: "Escalation philosophy expanded with contained escalation rule", change: "Changed" },
  { section: "Conditions Added", previous: "—", current: "9 conditions added", change: "Added" },
  { section: "Conditions Removed", previous: "—", current: "2 superseded conditions removed", change: "Removed" },
  { section: "Evidence Changes", previous: "92 percent coverage", current: "95 percent coverage", change: "Changed" },
  { section: "Owners", previous: "Jane Smith", current: "Jane Smith", change: "Unchanged" },
  { section: "Quality", previous: "91", current: "94", change: "Changed" },
  { section: "Completeness", previous: "89 percent", current: "92 percent", change: "Changed" },
  { section: "Confidence", previous: "92 percent", current: "95 percent", change: "Changed" },
  { section: "Effective Date", previous: "2026-05-12", current: "2026-07-28", change: "Changed" },
];

export const versionDownstream = [
  "2 evaluations require reassessment",
  "1 release decision references the prior threshold",
  "3 Persona sections materially changed",
];

/* ---------------------------- validation history --------------------------- */

export interface HistoryEvent {
  id: string; at: string; action: string; reviewer: string; section: string;
  previousState: string; newState: string; comments: string; auditId: string;
}

export const validationHistory: HistoryEvent[] = [
  { id: "H-1", at: "2026-07-24 09:44", action: "Persona Constructed", reviewer: "Persona Construction", section: "All", previousState: "None", newState: "Draft", comments: "Assembled from 428 approved conditions", auditId: "AUD 90101" },
  { id: "H-2", at: "2026-07-24 10:12", action: "Evidence Validation Started", reviewer: "Evidence Governance", section: "Evidence", previousState: "Draft", newState: "In Review", comments: "Evidence sweep initiated", auditId: "AUD 90112" },
  { id: "H-3", at: "2026-07-24 14:03", action: "Owner Confirmed", reviewer: "Jane Smith", section: "Identity", previousState: "Pending", newState: "Confirmed", comments: "Persona owner confirmed", auditId: "AUD 90134" },
  { id: "H-4", at: "2026-07-25 09:21", action: "Dependency Review Requested", reviewer: "Jane Smith", section: "Dependencies", previousState: "Draft", newState: "Dependency Review", comments: "Identity and Fraud reviewers notified", auditId: "AUD 90158" },
  { id: "H-5", at: "2026-07-25 11:47", action: "Conflict Detected", reviewer: "Fabric Monitor", section: "Approval Requirements", previousState: "In Review", newState: "Conflict", comments: "10 percent versus 20 percent threshold", auditId: "AUD 90177" },
  { id: "H-6", at: "2026-07-26 08:32", action: "Conflict Resolved", reviewer: "Payments Review Board", section: "Constraints", previousState: "Conflict", newState: "Resolved", comments: "Effective date transition recorded", auditId: "AUD 90201" },
  { id: "H-7", at: "2026-07-26 15:10", action: "Team Owner Review", reviewer: "Payments Engineering Director", section: "All", previousState: "In Review", newState: "Pending Approval", comments: "Awaiting conflict resolution", auditId: "AUD 90233" },
  { id: "H-8", at: "2026-07-27 10:04", action: "Architecture Review", reviewer: "Commerce Architecture Council", section: "Dependencies", previousState: "Pending", newState: "Scheduled", comments: "Scheduled after dependency review", auditId: "AUD 90260" },
  { id: "H-9", at: "2026-07-28 09:11", action: "Approved", reviewer: "Engineering Governance", section: "Constraints", previousState: "Pending Approval", newState: "Approved", comments: "Section approved with conditions", auditId: "AUD 90288" },
  { id: "H-10", at: "2026-07-28 10:22", action: "Published", reviewer: "Cognitive Memory", section: "All", previousState: "Approved", newState: "Published", comments: "Version 3.4 published", auditId: "AUD 90301" },
  { id: "H-11", at: "2026-08-04 08:41", action: "Drift Detected", reviewer: "Fabric Monitor", section: "Approval Requirements", previousState: "Published", newState: "Reopened", comments: "Source condition changed materially", auditId: "AUD 90344" },
  { id: "H-12", at: "2026-08-04 09:02", action: "New Draft Created", reviewer: "Persona Construction", section: "All", previousState: "Reopened", newState: "Draft v3.5", comments: "Draft created from refreshed conditions", auditId: "AUD 90350" },
];

/* -------------------------------- activity --------------------------------- */

export interface ValidationActivity {
  id: string; at: string; action: string; persona: string; section: string;
  reviewer: string; result: string; auditId: string; reviewId: string;
}

export const validationActivity: ValidationActivity[] = [
  { id: "A-1", at: "10:22 AM", action: "Conflict opened", persona: "Payments Platform", section: "Approval Requirements", reviewer: "Fabric Monitor", result: "Approval threshold conflict opened", auditId: "AUD 91001", reviewId: "PVR 3401" },
  { id: "A-2", at: "10:18 AM", action: "Dependency approved", persona: "Fraud Engineering", section: "Dependencies", reviewer: "Fraud Engineering Director", result: "Dependency relationship approved", auditId: "AUD 91002", reviewId: "PVR 3405" },
  { id: "A-3", at: "10:14 AM", action: "Persona blocked", persona: "Identity Engineering", section: "Service Levels", reviewer: "Security Architecture", result: "Blocked by latency conflict", auditId: "AUD 91003", reviewId: "PVR 3402" },
  { id: "A-4", at: "10:09 AM", action: "Persona approved", persona: "Site Reliability Engineering", section: "All", reviewer: "Platform Architecture Council", result: "Approved by Platform Architecture", auditId: "AUD 91004", reviewId: "PVR 3406" },
  { id: "A-5", at: "10:06 AM", action: "Evidence requested", persona: "Customer Support Operations", section: "Escalation Philosophy", reviewer: "Persona Review Board", result: "Escalation evidence requested", auditId: "AUD 91005", reviewId: "PVR 3403" },
  { id: "A-6", at: "10:03 AM", action: "Evidence coverage increased", persona: "Payments Platform", section: "Evidence", reviewer: "Jane Smith", result: "Coverage increased to 95 percent", auditId: "AUD 91006", reviewId: "PVR 3401" },
  { id: "A-7", at: "9:58 AM", action: "Conflict assigned", persona: "Release Governance", section: "Change Restrictions", reviewer: "Engineering Governance", result: "Effective date conflict assigned", auditId: "AUD 91007", reviewId: "PVR 3404" },
  { id: "A-8", at: "9:52 AM", action: "Persona published", persona: "Checkout Engineering", section: "All", reviewer: "Cognitive Memory", result: "Published after validation", auditId: "AUD 91008", reviewId: "PVR 3401" },
];

/* ------------------------------ notifications ------------------------------ */

export interface ValidationNotification {
  id: string; at: string; category: string; title: string; detail: string;
  tone: "green" | "amber" | "red" | "blue" | "slate"; read: boolean;
}

export const validationNotifications: ValidationNotification[] = [
  { id: "N-1", at: "10:22 AM", category: "Conflict Detected", title: "Payments Platform approval threshold conflict", detail: "10 percent versus 20 percent traffic exposure.", tone: "red", read: false },
  { id: "N-2", at: "10:18 AM", category: "Dependency Approved", title: "Fraud Engineering dependency approved", detail: "Fraud Decision Service relationship confirmed.", tone: "green", read: false },
  { id: "N-3", at: "10:14 AM", category: "Persona Review Overdue", title: "Identity Engineering review overdue", detail: "Due 2 hours ago, blocked by conflict.", tone: "red", read: false },
  { id: "N-4", at: "10:06 AM", category: "Evidence Requested", title: "Customer Support escalation evidence", detail: "Approved supporting evidence requested from the team.", tone: "amber", read: false },
  { id: "N-5", at: "09:58 AM", category: "Team Owner Approval Requested", title: "Payments Platform awaiting team owner", detail: "Approval requested from Payments Engineering Director.", tone: "amber", read: true },
  { id: "N-6", at: "09:41 AM", category: "Dependency Review Requested", title: "Identity Engineering dependency review", detail: "Payments Platform requested confirmation.", tone: "blue", read: true },
  { id: "N-7", at: "09:12 AM", category: "Persona Published", title: "Checkout Engineering Persona published", detail: "Version 4.1 published to Cognitive Memory.", tone: "green", read: true },
  { id: "N-8", at: "08:47 AM", category: "Validation Reopened Due to Drift", title: "Payments Platform validation reopened", detail: "Source condition changed after publication.", tone: "amber", read: true },
];

/* ------------------------------ demo scenarios ----------------------------- */

export interface ValidationScenario {
  id: string; label: string; banner: string;
  serviceState: "Operational" | "Review Required" | "Backlogged" | "Conflict Detected" | "Degraded" | "Maintenance";
  kpiOverrides: Record<string, string>;
  reviewOverrides: Record<string, Partial<ValidationReview>>;
  extraNotification?: ValidationNotification;
  extraActivity?: ValidationActivity;
  extraGap?: ValidationGap;
  extraConflict?: ValidationConflict;
  approvalStageOverride?: Record<string, string>;
  downstreamOverride?: string;
}

const base = { kpiOverrides: {}, reviewOverrides: {} };

export const validationScenarios: ValidationScenario[] = [
  { id: "healthy", label: "Healthy Validation Portfolio", banner: "Validation service operating normally. No overdue reviews.", serviceState: "Operational", ...base },
  {
    id: "submitted", label: "New Persona Submitted", banner: "Marketplace Operations Persona submitted for validation.",
    serviceState: "Operational", kpiOverrides: { "kpi-awaiting": "15", "kpi-tasks": "29" }, reviewOverrides: {},
    extraNotification: { id: "N-100", at: "10:31 AM", category: "Persona Review Requested", title: "Marketplace Operations submitted", detail: "New draft Persona entered validation.", tone: "blue", read: false },
    extraActivity: { id: "A-100", at: "10:31 AM", action: "Persona submitted", persona: "Marketplace Operations", section: "All", reviewer: "Marketplace Leadership", result: "Entered validation queue", auditId: "AUD 91100", reviewId: "PVR 3407" },
  },
  {
    id: "critical-conflict", label: "Critical Conflict Detected", banner: "Critical identity latency conflict blocks two Personas.",
    serviceState: "Conflict Detected", kpiOverrides: { "kpi-conflicts": "11", "kpi-quality": "88 / 100" },
    reviewOverrides: { "PVR 3402": { status: "Blocked", priority: "Critical", conflicts: 4 }, "PVR 3401": { status: "Conflict Review" } },
    extraNotification: { id: "N-101", at: "10:34 AM", category: "Conflict Detected", title: "Critical identity latency conflict", detail: "Payments and Checkout Personas blocked.", tone: "red", read: false },
  },
  {
    id: "missing-owner", label: "Missing Persona Owner", banner: "Identity Engineering Persona has no confirmed owner.",
    serviceState: "Review Required", kpiOverrides: { "kpi-gaps": "13" },
    reviewOverrides: { "PVR 3402": { personaOwner: "Unassigned", reviewer: "Unassigned", status: "Blocked" } },
    extraGap: { id: "GAP 6200", persona: "Identity Engineering", personaId: "PERSONA 1004", section: "Identity", sectionId: "mission", gapType: "Missing Owners", missing: "Persona owner unassigned", severity: "Critical", owner: "Unassigned", qualityImpact: "-7", downstreamImpact: "Approval chain cannot start", recommendedAction: "Assign Owner", due: "Today", status: "Open", requiredForApproval: true },
  },
  {
    id: "evidence-gap", label: "Evidence Gap", banner: "Escalation philosophy lacks approved supporting evidence.",
    serviceState: "Review Required", kpiOverrides: { "kpi-gaps": "14", "kpi-quality": "89 / 100" },
    reviewOverrides: { "PVR 3403": { status: "Evidence Required", evidenceCoverage: 71, priority: "High" } },
  },
  {
    id: "dependency-review", label: "Dependency Review Required", banner: "Two dependency owners must confirm attributed relationships.",
    serviceState: "Review Required", kpiOverrides: { "kpi-awaiting": "15" },
    reviewOverrides: { "PVR 3405": { status: "Dependency Review", currentStage: "Dependency Owner Review" } },
  },
  {
    id: "dependency-rejected", label: "Dependency Rejected", banner: "Identity Engineering rejected the attributed dependency criticality.",
    serviceState: "Degraded", kpiOverrides: { "kpi-conflicts": "10" },
    reviewOverrides: { "PVR 3402": { status: "Rejected", priority: "Critical" } },
    extraNotification: { id: "N-102", at: "10:36 AM", category: "Persona Rejected", title: "Dependency relationship rejected", detail: "Identity Engineering disputes Critical criticality.", tone: "red", read: false },
  },
  {
    id: "decision-conflict", label: "Decision Rule Conflict", banner: "Checkout and Fraud decision rules disagree on retry handling.",
    serviceState: "Conflict Detected", kpiOverrides: { "kpi-conflicts": "10" }, reviewOverrides: {},
  },
  {
    id: "low-confidence", label: "Low Confidence Persona", banner: "Customer Support Persona confidence fell below the approval floor.",
    serviceState: "Review Required", kpiOverrides: { "kpi-quality": "87 / 100" },
    reviewOverrides: { "PVR 3403": { confidence: 68, quality: 74, status: "Review Required" } },
  },
  {
    id: "stale-evidence", label: "Stale Evidence", banner: "Twelve Persona sections reference artifacts beyond the freshness window.",
    serviceState: "Review Required", kpiOverrides: { "kpi-gaps": "15" },
    reviewOverrides: { "PVR 3403": { freshness: "Stale", evidenceCoverage: 70 } },
  },
  {
    id: "overdue", label: "Review Overdue", banner: "Three validation reviews have breached their due dates.",
    serviceState: "Backlogged", kpiOverrides: { "kpi-tasks": "31" },
    reviewOverrides: { "PVR 3401": { overdue: true, due: "Overdue" }, "PVR 3402": { overdue: true, due: "Overdue" }, "PVR 3404": { overdue: true, due: "Overdue" } },
  },
  {
    id: "team-owner-pending", label: "Team Owner Approval Pending", banner: "Payments Platform is waiting on team owner approval.",
    serviceState: "Review Required", kpiOverrides: {},
    reviewOverrides: { "PVR 3401": { status: "Awaiting Approval", currentStage: "Team Owner Review" } },
    approvalStageOverride: { "ap-3": "Pending" },
  },
  {
    id: "governance-pending", label: "Governance Approval Pending", banner: "Three Personas await governance board approval.",
    serviceState: "Review Required", kpiOverrides: {},
    reviewOverrides: { "PVR 3406": { status: "Awaiting Approval", currentStage: "Governance Approval" } },
    approvalStageOverride: { "ap-6": "Pending" },
  },
  {
    id: "approved", label: "Persona Approved", banner: "Payments Platform Persona approved by all required reviewers.",
    serviceState: "Operational", kpiOverrides: { "kpi-awaiting": "13", "kpi-conflicts": "8" },
    reviewOverrides: { "PVR 3401": { status: "Approved", conflicts: 0, quality: 96 } },
    approvalStageOverride: { "ap-3": "Complete", "ap-4": "Complete", "ap-5": "Complete", "ap-7": "Complete" },
    extraActivity: { id: "A-101", at: "10:42 AM", action: "Persona approved", persona: "Payments Platform", section: "All", reviewer: "Payments Engineering Director", result: "Approved for publication", auditId: "AUD 91110", reviewId: "PVR 3401" },
    downstreamOverride: "Approved for reuse. Downstream consumers unblocked.",
  },
  {
    id: "approved-conditions", label: "Persona Approved with Conditions", banner: "Payments Platform approved with a condition to resolve the retry threshold within 5 days.",
    serviceState: "Operational", kpiOverrides: { "kpi-awaiting": "13" },
    reviewOverrides: { "PVR 3401": { status: "Approved with Conditions" } },
    approvalStageOverride: { "ap-3": "Approved with Conditions" },
  },
  {
    id: "rejected", label: "Persona Rejected", banner: "Identity Engineering Persona rejected pending ownership and evidence correction.",
    serviceState: "Degraded", kpiOverrides: { "kpi-quality": "86 / 100" },
    reviewOverrides: { "PVR 3402": { status: "Rejected" } },
    extraNotification: { id: "N-103", at: "10:44 AM", category: "Persona Rejected", title: "Identity Engineering Persona rejected", detail: "Ownership and evidence correction required.", tone: "red", read: false },
  },
  {
    id: "reopened", label: "Validation Reopened Due to Drift", banner: "Payments Platform validation reopened after a material source change.",
    serviceState: "Review Required", kpiOverrides: { "kpi-awaiting": "15", "kpi-conflicts": "10" },
    reviewOverrides: { "PVR 3401": { status: "Reopened", currentStage: "Resolve Conflicts and Gaps", versionStatus: "Draft" } },
    extraNotification: { id: "N-104", at: "10:46 AM", category: "Validation Reopened Due to Drift", title: "Payments Platform validation reopened", detail: "Approval requirement condition changed after publication.", tone: "amber", read: false },
    extraActivity: { id: "A-102", at: "10:46 AM", action: "Validation reopened", persona: "Payments Platform", section: "Approval Requirements", reviewer: "Fabric Monitor", result: "Drift reopened validation", auditId: "AUD 91120", reviewId: "PVR 3401" },
  },
  {
    id: "published", label: "Persona Published", banner: "Payments Platform Persona v3.4 published to Enterprise Cognitive Memory.",
    serviceState: "Operational", kpiOverrides: { "kpi-awaiting": "13", "kpi-downstream": "5 Personas" },
    reviewOverrides: { "PVR 3401": { status: "Published" } },
    approvalStageOverride: { "ap-3": "Complete", "ap-4": "Complete", "ap-5": "Complete", "ap-7": "Complete", "ap-8": "Complete" },
    downstreamOverride: "Published. Consumers receiving version 3.4 context.",
  },
  { id: "reset", label: "Reset Demo Data", banner: "Demo data reset to the seeded validation state.", serviceState: "Operational", ...base },
];

/* -------------------------------- demo story ------------------------------- */

export interface ValidationStoryStep {
  id: string; target: string; caption: string; notes: string;
  action?: "open-workbench" | "open-conflict" | "resolve-conflict" | "approve";
}

export const validationStory: ValidationStoryStep[] = [
  { id: "v1", target: "kpis", caption: "Team Personas do not become trusted enterprise context simply because they were constructed.", notes: "Anchor on Personas Awaiting Validation and Open Review Tasks." },
  { id: "v2", target: "lifecycle", caption: "Identity, mission, evidence, dependencies, risks, and decision logic are validated before publication.", notes: "Walk the eleven lifecycle stages." },
  { id: "v3", target: "workbench", caption: "Every Persona field can be traced to approved business conditions and the exact evidence supporting it.", notes: "Open Payments Platform Approval Requirements.", action: "open-workbench" },
  { id: "v4", target: "workbench", caption: "The Fabric identifies when different sources imply different operating rules.", notes: "Highlight the 10 percent versus 20 percent thresholds." },
  { id: "v5", target: "conflicts", caption: "Reviewers select the authoritative condition, define applicability, or preserve different rules for different environments and effective periods.", notes: "Resolve the retry threshold conflict.", action: "open-conflict" },
  { id: "v6", target: "dependencies", caption: "Teams can confirm the dependencies attributed to them without requiring broad coordination meetings.", notes: "Dependency owner validation." },
  { id: "v7", target: "thinking", caption: "The team validates its priorities, tradeoffs, preferred evidence, escalation philosophy, and risk appetite.", notes: "How This Team Thinks validation." },
  { id: "v8", target: "approval", caption: "Persona owners, team leaders, dependency owners, and governance reviewers approve the operating model.", notes: "Approval chain." },
  { id: "v9", target: "downstream", caption: "Until validation is complete, dependent impact evaluations and decisions know that the Persona is not yet approved for reuse.", notes: "Downstream validation impact." },
  { id: "v10", target: "approval", caption: "The approved Persona can now become reusable enterprise context for Cognitive Intake, impact analysis, and decision intelligence.", notes: "Approve Payments Platform.", action: "approve" },
];

/* -------------------------------- search ----------------------------------- */

export const searchCategories = [
  "Personas", "Reviews", "Reviewers", "Conditions", "Evidence", "Dependencies",
  "Conflicts", "Gaps", "Approval Tasks", "Versions", "Teams", "Systems", "Services",
];

export const exampleSearches = [
  "Payments Personas awaiting approval",
  "Critical dependency conflicts",
  "Personas missing owners",
  "Stale evidence reviews",
  "Identity Engineering conflicts",
  "Reviews due today",
  "Personas affecting active evaluations",
];

/* ------------------------- start validation wizard -------------------------- */

export const validationScopes = [
  "Single Persona", "Selected Personas", "Business Unit", "Personas Awaiting Review",
  "Personas with Drift", "Personas with Conflicts",
];

export const validationAreas = [
  "Identity", "Mission", "Capabilities", "Products and Services", "Customers",
  "Objectives and Metrics", "Constraints", "Dependencies", "Risks and Controls",
  "Decision Logic", "How This Team Thinks", "Evidence", "Ownership", "Freshness",
];

export const validationRules = [
  "Require Primary Evidence for Critical Sections", "Require Team Owner Approval",
  "Require Dependency Owner Approval for Critical Dependencies",
  "Require Governance Approval for Critical Personas", "Flag Stale Evidence",
  "Flag Low Authority Evidence", "Flag Missing Owners", "Flag Conflicting Conditions",
  "Flag Missing Decision Rules",
];

export const reviewerRoles = [
  "Persona Owner", "Team Owner", "Dependency Owners", "Architecture", "Security", "Compliance", "Governance",
];

export const validationExecutionSteps = [
  "Loading Personas", "Validating Identity and Ownership", "Validating Mission and Scope",
  "Validating Conditions and Evidence", "Validating Dependencies",
  "Validating Risks and Decision Logic", "Detecting Conflicts and Gaps",
  "Creating Review Tasks", "Preparing Approval Chain", "Completed",
];

export const bulkActions = [
  "Assign Reviewer", "Assign Persona Owner", "Request Team Owner Approval",
  "Request Dependency Review", "Request Evidence", "Mark Known Exception",
  "Refresh Persona", "Export", "Escalate",
];

export const exportOptions = [
  "Include Persona Sections", "Include Conditions", "Include Evidence References",
  "Include Conflicts", "Include Gaps", "Include Reviewer Decisions",
  "Include Approval History", "Include Versions", "Include Downstream Impact", "Include Audit History",
];

export const exportScopes = [
  "Current Review", "Selected Reviews", "Current Persona", "Selected Personas",
  "Open Conflicts", "Evidence Gaps", "Dependency Reviews", "Approval Queue",
  "Validation Quality", "Validation History", "Full Validation Report",
];

export const reviewToRecord = (r: ValidationReview) => ({
  id: r.id, persona: r.persona, team: r.team, reviewType: r.reviewType, reason: r.reason,
  priority: r.priority, stage: r.currentStage, reviewer: r.reviewer, quality: r.quality,
  completeness: r.completeness, confidence: r.confidence, evidenceCoverage: r.evidenceCoverage,
  conflicts: r.conflicts, due: r.due, age: r.age, downstreamImpact: r.downstreamImpact, status: r.status,
});
