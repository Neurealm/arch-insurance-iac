/**
 * Decision Intelligence — deterministic demonstration data and domain models.
 *
 * Service boundary note: every derivation below is a pure function of seeded
 * data plus local proposal parameters. Enterprise services can replace the
 * seeds and the `derive*` helpers without changing the interface contracts.
 */

/* ------------------------------------------------------------------ types -- */

export type DiView = "queue" | "workbench" | "comparison" | "executive";

export type DecisionPosture =
  | "Proceed"
  | "Proceed with Guardrails"
  | "Conditional Proceed"
  | "Defer Pending Evidence"
  | "Revise Proposal"
  | "Escalate"
  | "Do Not Proceed"
  | "Undetermined";

export type PersonaPosition =
  | "Support"
  | "Support with Concern"
  | "Conditional Support"
  | "Neutral"
  | "Concerned"
  | "Oppose"
  | "Review Required"
  | "Conditional";

export type Magnitude = "Low" | "Low to Medium" | "Medium" | "Medium High" | "High" | "Critical";

export interface DiKpi {
  id: string;
  name: string;
  value: string;
  change?: string;
  context: string;
  status: "Healthy" | "Attention" | "Critical";
  supporting: { label: string; value: string }[];
  trend: number[];
  tooltip: string;
  focus: string;
}

export interface DecisionIntelligenceStage {
  id: string;
  name: string;
  sequence: number;
  status: "Running" | "Warning" | "Pending" | "Blocked";
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

export interface DecisionIntelligenceEvaluation {
  id: string;
  workItemId: string;
  workItem: string;
  intakeId: string;
  crossTeamAnalysisId: string;
  crossTeamAnalysisVersionId: string;
  decisionQuestion: string;
  decisionReason: string;
  decisionOwner: string;
  decisionDeadline: string;
  submittingTeam: string;
  businessUnit: string;
  decisionType: string;
  workType: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  scope: string[];
  outOfScope: string[];
  assumptions: string[];
  status:
    | "Analyzing"
    | "Review Required"
    | "Needs Evidence"
    | "Decision Context Ready"
    | "Paused";
  currentStageId: string;
  alternativeIds: string[];
  recommendedAlternativeId: string | null;
  recommendationPosture: DecisionPosture;
  recommendationConfidence: number;
  evidenceCoverage: number;
  materialConflictCount: number;
  openIssueCount: number;
  highestRisk: string;
  riskLevel: Magnitude;
  customerImpact: Magnitude;
  financialImpact: Magnitude;
  operationalImpact: Magnitude;
  securityImpact: Magnitude;
  complianceImpact: Magnitude;
  customerJourney: string;
  environment: string;
  region: string;
  reviewStatus: string;
  approvalRequirement: string;
  knowledgeDomain: string;
  startedAt: string;
  updatedAt: string;
}

export interface DecisionAlternative {
  id: string;
  evaluationId: string;
  code: string;
  name: string;
  description: string;
  strategicIntent: string;
  customerBenefit: Magnitude;
  businessBenefit: Magnitude;
  financialImpact: string;
  operationalImpact: Magnitude;
  reliabilityImpact: Magnitude;
  securityImpact: Magnitude;
  complianceImpact: Magnitude;
  dependencyImpact: Magnitude;
  fraudRisk: Magnitude;
  coordinationCost: Magnitude;
  implementationEffort: Magnitude;
  timeToBenefit: string;
  reversibility: Magnitude;
  evidenceRequirement: Magnitude;
  governanceRequirement: string;
  requiredControlIds: string[];
  requiredApprovalIds: string[];
  residualRisk: Magnitude;
  opportunityCost: Magnitude;
  personaSupport: string[];
  personaConcern: string[];
  confidence: number;
  status: string;
}

export interface DecisionPersonaPositionRecord {
  id: string;
  evaluationId: string;
  personaId: string;
  persona: string;
  topPriority: string;
  primaryConcern: string;
  requiredCondition: string;
  confidence: number;
  positions: Record<string, PersonaPosition>;
  benefits: Record<string, string>;
  concerns: Record<string, string>;
}

export interface DecisionTradeoff {
  id: string;
  evaluationId: string;
  alternativeIds: string[];
  tradeoffType: "Customer" | "Financial" | "Operational" | "Governance";
  title: string;
  description: string;
  benefit: string;
  cost: string;
  affectedPersonaIds: string[];
  conditionIds: string[];
  evidenceReferenceIds: string[];
  confidence: number;
  potentialCondition: string;
  status: string;
}

export interface DecisionConstraint {
  id: string;
  evaluationId: string;
  conditionId: string;
  constraintType:
    | "Policy Constraint"
    | "Compliance Constraint"
    | "Security Constraint"
    | "Operational Window"
    | "SLO Constraint"
    | "Risk Threshold"
    | "Approval Requirement"
    | "Access Restriction";
  kind: "Constraint" | "Preference" | "Recommendation" | "Assumption";
  title: string;
  description: string;
  authority: string;
  affectedAlternativeIds: string[];
  affectedPersonaIds: string[];
  evidenceReferenceIds: string[];
  confidence: number;
  status: string;
}

export interface DecisionAlternativeRisk {
  id: string;
  evaluationId: string;
  alternativeId: string;
  riskId: string;
  risk: string;
  rawSeverity: Magnitude;
  controlIds: string[];
  control: string;
  residualSeverity: Magnitude;
  confidence: number;
  evidenceReferenceIds: string[];
  status: string;
}

export interface DecisionExpectedOutcome {
  id: string;
  evaluationId: string;
  alternativeId: string;
  outcomeType: "Customer" | "Business" | "Technical" | "Operational" | "Risk";
  metric: string;
  expectedValue: string;
  expectedRange: string;
  unit: string;
  observationWindow: string;
  confidence: number;
  conditionIds: string[];
  evidenceReferenceIds: string[];
}

export interface DiEvidence {
  id: string;
  evaluationId: string;
  name: string;
  decisionDimension: string;
  evidenceType: string;
  alternativesAffected: string[];
  authority: string;
  freshness: string;
  quality: number;
  required: boolean;
  confidence: number;
  status: "Available" | "Missing" | "Potentially Required";
}

export interface PriorDecision {
  id: string;
  name: string;
  decision: string;
  similarity: number;
  conditions: string[];
  expectedOutcome: string;
  observedOutcome: string;
  unexpectedOutcome: string;
  lesson: string;
  learningId: string;
  currentRelevance: "High" | "Medium" | "Low";
}

export interface DecisionRecommendation {
  id: string;
  evaluationId: string;
  preferredAlternativeId: string;
  posture: DecisionPosture;
  summary: string;
  confidence: number;
  supportingFactors: { factor: string; weight: string; direction: "positive" | "negative" }[];
  counterarguments: string[];
  benefits: string[];
  costs: string[];
  conditionIds: string[];
  conditions: string[];
  assumptions: string[];
  evidenceGapIds: string[];
  openIssues: string[];
  weakenTriggers: string[];
  strengthenTriggers: string[];
  createdAt: string;
}

export interface DecisionContextPackage {
  id: string;
  evaluationId: string;
  status: string;
  sections: { label: string; value: string }[];
  conditions: string[];
  openQuestions: string[];
  assumptions: string[];
  requiredApprovals: string[];
  requiredReviewers: string[];
  createdAt: string;
}

export interface DecisionIntelligenceActivity {
  id: string;
  timestamp: string;
  evaluationId: string;
  action: string;
  description: string;
  result: string;
  owner: string;
  auditId: string;
}

export interface QualityDimension {
  name: string;
  current: number;
  target: number;
  trend: string;
  affectedDecisions: number;
}

/* ------------------------------------------------------------------ views -- */

export const diViews: { id: DiView; label: string }[] = [
  { id: "queue", label: "Decision Queue" },
  { id: "workbench", label: "Decision Workbench" },
  { id: "comparison", label: "Alternative Comparison" },
  { id: "executive", label: "Executive" },
];

/* ---------------------------------------------------------------- filters -- */

export type FilterKey =
  | "businessUnit" | "submittingTeam" | "decisionOwner" | "decisionType" | "workType"
  | "priority" | "decisionStatus" | "recommendationState" | "confidenceBand" | "riskLevel"
  | "customerImpact" | "financialImpact" | "operationalImpact" | "securityImpact"
  | "complianceImpact" | "teamPersona" | "knowledgeDomain" | "product" | "service"
  | "system" | "customerJourney" | "approvalRequirement" | "evidenceCoverage"
  | "reviewStatus" | "environment" | "region" | "dueDate" | "timeRange";

export const filterOptions: Record<FilterKey, { label: string; options: string[] }> = {
  businessUnit: { label: "Business Unit", options: ["All", "Digital Commerce", "Platform Services", "Risk & Trust"] },
  submittingTeam: { label: "Submitting Team", options: ["All", "Checkout Engineering", "Identity Engineering", "Payments Platform", "Fraud Engineering", "Site Reliability Engineering"] },
  decisionOwner: { label: "Decision Owner", options: ["All", "Commerce Architecture Council", "Platform Governance Board", "Risk Committee"] },
  decisionType: { label: "Decision Type", options: ["All", "Policy Change", "Capacity Change", "Migration", "Configuration Change", "Observability Investment"] },
  workType: { label: "Work Type", options: ["All", "Change Request", "Initiative", "Incident Follow Up"] },
  priority: { label: "Priority", options: ["All", "Critical", "High", "Medium", "Low"] },
  decisionStatus: { label: "Decision Status", options: ["All", "Analyzing", "Review Required", "Needs Evidence", "Decision Context Ready", "Paused"] },
  recommendationState: { label: "Recommendation State", options: ["All", "Proceed", "Proceed with Guardrails", "Conditional Proceed", "Defer Pending Evidence", "Undetermined"] },
  confidenceBand: { label: "Confidence Band", options: ["All", "Below 90%", "90-94%", "Above 94%"] },
  riskLevel: { label: "Risk Level", options: ["All", "Low", "Medium", "High", "Critical"] },
  customerImpact: { label: "Customer Impact", options: ["All", "Low", "Medium", "High"] },
  financialImpact: { label: "Financial Impact", options: ["All", "Low", "Medium", "High"] },
  operationalImpact: { label: "Operational Impact", options: ["All", "Low", "Medium", "High"] },
  securityImpact: { label: "Security Impact", options: ["All", "Low", "Medium", "High"] },
  complianceImpact: { label: "Compliance Impact", options: ["All", "Low", "Medium", "High"] },
  teamPersona: { label: "Team Persona", options: ["All", "Checkout Engineering", "Payments Platform", "Fraud Engineering", "Site Reliability Engineering", "Identity Engineering", "Release Governance"] },
  knowledgeDomain: { label: "Knowledge Domain", options: ["All", "Payments", "Identity", "Reliability", "Risk & Fraud"] },
  product: { label: "Product", options: ["All", "Commerce Platform", "Identity Platform"] },
  service: { label: "Service", options: ["All", "Checkout Service", "Payments API", "Fraud Decision Service", "Regional Token Vault"] },
  system: { label: "System", options: ["All", "Order Management", "Ledger", "Token Vault"] },
  customerJourney: { label: "Customer Journey", options: ["All", "Purchase", "Authentication", "Refund"] },
  approvalRequirement: { label: "Approval Requirement", options: ["All", "Joint Approval", "Governance Board", "Single Owner", "None"] },
  evidenceCoverage: { label: "Evidence Coverage", options: ["All", "Below 85%", "85-95%", "Above 95%"] },
  reviewStatus: { label: "Review Status", options: ["All", "Pending Review", "In Review", "Reviewed"] },
  environment: { label: "Environment", options: ["All", "Production", "Staging"] },
  region: { label: "Region", options: ["All", "Global", "NA", "EU", "APAC"] },
  dueDate: { label: "Decision Due Date", options: ["All", "Next 7 days", "Next 14 days", "Next 30 days"] },
  timeRange: { label: "Time Range", options: ["Last 24 hours", "Last 7 days", "Last 30 days", "Quarter to date"] },
};

export const defaultFilters = Object.fromEntries(
  (Object.keys(filterOptions) as FilterKey[]).map((k) => [k, k === "timeRange" ? "Last 7 days" : "All"]),
) as Record<FilterKey, string>;

export const activeFilterCount = (f: Record<FilterKey, string>) =>
  (Object.keys(f) as FilterKey[]).filter((k) => k !== "timeRange" && f[k] !== "All").length;

/* ------------------------------------------------------------------- kpis -- */

export const diKpis: DiKpi[] = [
  {
    id: "active", name: "Active Decision Evaluations", value: "12", change: "+3 this week",
    context: "Decisions currently in the intelligence pipeline", status: "Healthy",
    supporting: [{ label: "Healthy", value: "8" }, { label: "Review Required", value: "3" }, { label: "Blocked", value: "1" }],
    trend: [7, 8, 9, 9, 10, 11, 12, 12],
    tooltip: "Decision evaluations receiving governed cross team context in the selected time range.",
    focus: "panel-queue",
  },
  {
    id: "alternatives", name: "Alternatives Under Evaluation", value: "34", change: "+6",
    context: "Across 12 decisions", status: "Healthy",
    supporting: [{ label: "Decisions", value: "12" }, { label: "Average", value: "2.8" }],
    trend: [21, 24, 26, 28, 30, 31, 33, 34],
    tooltip: "Distinct decision alternatives modelled with full impact profiles.",
    focus: "panel-comparison",
  },
  {
    id: "tradeoffs", name: "Material Tradeoffs", value: "28", change: "+4",
    context: "Tradeoffs judged material to the enterprise", status: "Attention",
    supporting: [{ label: "Customer", value: "11" }, { label: "Financial", value: "7" }, { label: "Operational", value: "6" }, { label: "Governance", value: "4" }],
    trend: [18, 20, 22, 23, 25, 26, 27, 28],
    tooltip: "Tradeoffs where one Persona's benefit becomes another Persona's cost.",
    focus: "panel-tradeoffs",
  },
  {
    id: "conflicts", name: "Unresolved Decision Conflicts", value: "7", change: "-1",
    context: "Positions that cannot both be satisfied", status: "Attention",
    supporting: [{ label: "Team Priority", value: "3" }, { label: "Governance", value: "2" }, { label: "Dependency", value: "2" }],
    trend: [11, 10, 10, 9, 9, 8, 8, 7],
    tooltip: "Conflicts inherited from Cross Team Impact Analysis and still unresolved at decision time.",
    focus: "panel-positions",
  },
  {
    id: "evidence", name: "Decisions Needing Evidence", value: "4",
    context: "Evidence gaps block a defensible recommendation", status: "Critical",
    supporting: [{ label: "Financial", value: "2" }, { label: "Dependency", value: "1" }, { label: "Security", value: "1" }],
    trend: [6, 6, 5, 5, 5, 4, 4, 4],
    tooltip: "Decisions where a required evidence record is missing or stale.",
    focus: "panel-evidence",
  },
  {
    id: "confidence", name: "Decision Context Confidence", value: "94%", change: "Target 95%",
    context: "Weighted confidence across decision context packages", status: "Healthy",
    supporting: [{ label: "Target", value: "95%" }, { label: "Variance", value: "-1" }],
    trend: [88, 89, 90, 91, 92, 93, 94, 94],
    tooltip: "Composite confidence of context, evidence, persona coverage, and traceability.",
    focus: "panel-quality",
  },
];

export const kpiFocusPanel = (id: string) => diKpis.find((k) => k.id === id)?.focus ?? "panel-queue";

/* -------------------------------------------------------------- lifecycle -- */

export const lifecycleStages: DecisionIntelligenceStage[] = [
  ["DIS 1", "Load Cross Team Context", "Running", "12 active packages", 12, 0, 0, 0, 99, "1.4s", "2.6s", "12/hr", "Within SLA", "Coordination Office"],
  ["DIS 2", "Define Decision Question", "Running", "11 defined · 1 review required", 11, 1, 0, 1, 96, "3.1m", "6.4m", "11/hr", "Within SLA", "Decision Facilitation"],
  ["DIS 3", "Validate Decision Scope", "Running", "92% complete", 11, 1, 0, 0, 92, "2.2m", "4.8m", "11/hr", "Within SLA", "Decision Facilitation"],
  ["DIS 4", "Identify Alternatives", "Running", "34 alternatives", 34, 2, 0, 0, 97, "4.6m", "9.2m", "34/hr", "Within SLA", "Architecture Council"],
  ["DIS 5", "Retrieve Relevant Memory", "Running", "486 context records", 486, 0, 0, 0, 99, "0.9s", "2.1s", "486/hr", "Within SLA", "Cognitive Memory"],
  ["DIS 6", "Evaluate Enterprise Conditions", "Running", "94% complete", 11, 1, 0, 0, 94, "1.8m", "3.9m", "11/hr", "Within SLA", "Governance Office"],
  ["DIS 7", "Evaluate Persona Positions", "Running", "42 Personas", 42, 3, 0, 1, 95, "2.7m", "5.5m", "42/hr", "Within SLA", "Persona Stewards"],
  ["DIS 8", "Evaluate Customer Consequences", "Running", "91% complete", 11, 1, 0, 1, 91, "3.4m", "7.1m", "11/hr", "At Risk", "Customer Experience"],
  ["DIS 9", "Evaluate Business Consequences", "Running", "89% complete", 10, 2, 0, 1, 89, "3.9m", "8.0m", "10/hr", "At Risk", "Finance Partner"],
  ["DIS 10", "Evaluate Risk & Dependencies", "Warning", "7 material conflicts", 12, 0, 0, 7, 84, "5.2m", "11.4m", "12/hr", "At Risk", "Risk Committee"],
  ["DIS 11", "Evaluate Mitigations", "Running", "18 accepted candidates", 18, 4, 0, 1, 93, "4.1m", "8.6m", "18/hr", "Within SLA", "Coordination Office"],
  ["DIS 12", "Compare Tradeoffs", "Running", "10 complete · 2 pending", 10, 2, 0, 2, 93, "6.3m", "12.8m", "10/hr", "Within SLA", "Decision Facilitation"],
  ["DIS 13", "Synthesize Recommendation", "Warning", "4 decisions require additional evidence", 8, 4, 0, 4, 86, "7.8m", "15.2m", "8/hr", "At Risk", "Architecture Council"],
  ["DIS 14", "Prepare Decision Context", "Running", "8 complete · 4 pending", 8, 4, 0, 1, 90, "2.9m", "6.0m", "8/hr", "Within SLA", "Decision Facilitation"],
].map((r, i) => ({
  id: r[0] as string,
  name: r[1] as string,
  sequence: i + 1,
  status: r[2] as DecisionIntelligenceStage["status"],
  detail: r[3] as string,
  processedCount: r[4] as number,
  pendingCount: r[5] as number,
  failedCount: r[6] as number,
  warningCount: r[7] as number,
  successRate: r[8] as number,
  averageDuration: r[9] as string,
  p95Duration: r[10] as string,
  throughput: r[11] as string,
  slaStatus: r[12] as string,
  owner: r[13] as string,
}));

export const stageById = (id: string) =>
  lifecycleStages.find((s) => s.id === id) ?? lifecycleStages[11];

export const lifecycleCallouts = [
  "Checkout Retry decision contains one unresolved Fraud evidence gap",
  "Release Governance condition is active above 10% traffic",
  "Regional dependency confidence below target",
  "Two decision alternatives remain close after mitigation",
];

/* ------------------------------------------------------------ evaluations -- */

export const evaluations: DecisionIntelligenceEvaluation[] = [
  {
    id: "DIA 5001",
    workItemId: "WI 2291", workItem: "Checkout Retry Policy Update",
    intakeId: "INT 3301", crossTeamAnalysisId: "CTA 4401", crossTeamAnalysisVersionId: "CTA 4401 v4",
    decisionQuestion: "Should automated payment retries increase from two to three, and under what rollout conditions?",
    decisionReason: "Current transient payment failures contribute to checkout abandonment.",
    decisionOwner: "Commerce Architecture Council",
    decisionDeadline: "Before next commerce release window",
    submittingTeam: "Checkout Engineering", businessUnit: "Digital Commerce",
    decisionType: "Policy Change", workType: "Change Request", priority: "High",
    scope: ["Retry attempts", "Traffic exposure", "Rollout method", "Required evidence", "Rollback conditions", "Approval requirements"],
    outOfScope: ["Payment provider contract changes", "Fraud model redesign", "Checkout UI redesign"],
    assumptions: [
      "Third retry improves conversion",
      "Retries remain idempotent",
      "Dependencies can absorb increased volume",
      "Fraud loss remains within tolerance",
      "Controls can contain adverse impact",
    ],
    status: "Review Required", currentStageId: "DIS 12",
    alternativeIds: ["ALT 5001 A", "ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
    recommendedAlternativeId: "ALT 5001 B",
    recommendationPosture: "Conditional Proceed",
    recommendationConfidence: 94, evidenceCoverage: 91,
    materialConflictCount: 3, openIssueCount: 2,
    highestRisk: "Fraud and Payment Integrity", riskLevel: "High",
    customerImpact: "High", financialImpact: "Medium", operationalImpact: "Medium",
    securityImpact: "Medium", complianceImpact: "Low",
    customerJourney: "Purchase", environment: "Production", region: "Global",
    reviewStatus: "In Review", approvalRequirement: "Joint Approval", knowledgeDomain: "Payments",
    startedAt: "2026-08-03", updatedAt: "2026-08-06",
  },
  {
    id: "DIA 5002",
    workItemId: "WI 2288", workItem: "Identity Token Cache Optimization",
    intakeId: "INT 3288", crossTeamAnalysisId: "CTA 4388", crossTeamAnalysisVersionId: "CTA 4388 v2",
    decisionQuestion: "Should Identity token caching be increased to reduce authentication latency?",
    decisionReason: "Authentication latency contributes to checkout abandonment during peak windows.",
    decisionOwner: "Platform Governance Board",
    decisionDeadline: "Within 10 business days",
    submittingTeam: "Identity Engineering", businessUnit: "Platform Services",
    decisionType: "Configuration Change", workType: "Change Request", priority: "Medium",
    scope: ["Cache TTL", "Invalidation strategy", "Rollout"], outOfScope: ["Token format change"],
    assumptions: ["Cache staleness stays inside tolerance", "Revocation path remains immediate"],
    status: "Analyzing", currentStageId: "DIS 9",
    alternativeIds: ["ALT 5002 A", "ALT 5002 B", "ALT 5002 C"],
    recommendedAlternativeId: "ALT 5002 B",
    recommendationPosture: "Proceed with Guardrails",
    recommendationConfidence: 95, evidenceCoverage: 96,
    materialConflictCount: 1, openIssueCount: 1,
    highestRisk: "Security and Cache Staleness", riskLevel: "Medium",
    customerImpact: "Medium", financialImpact: "Low", operationalImpact: "Low",
    securityImpact: "High", complianceImpact: "Medium",
    customerJourney: "Authentication", environment: "Production", region: "Global",
    reviewStatus: "In Review", approvalRequirement: "Governance Board", knowledgeDomain: "Identity",
    startedAt: "2026-08-01", updatedAt: "2026-08-06",
  },
  {
    id: "DIA 5003",
    workItemId: "WI 2279", workItem: "Regional Token Vault Migration",
    intakeId: "INT 3279", crossTeamAnalysisId: "CTA 4379", crossTeamAnalysisVersionId: "CTA 4379 v3",
    decisionQuestion: "Which migration strategy should be used for the Regional Token Vault?",
    decisionReason: "Vault capacity margin in EU is below the required threshold.",
    decisionOwner: "Platform Governance Board",
    decisionDeadline: "Before EU peak season freeze",
    submittingTeam: "Payments Platform", businessUnit: "Platform Services",
    decisionType: "Migration", workType: "Initiative", priority: "Critical",
    scope: ["Migration sequence", "Cutover method", "Regional order"], outOfScope: ["Vendor replacement"],
    assumptions: ["Dual write is feasible", "Rollback window is 30 minutes"],
    status: "Needs Evidence", currentStageId: "DIS 10",
    alternativeIds: ["ALT 5003 A", "ALT 5003 B", "ALT 5003 C", "ALT 5003 D"],
    recommendedAlternativeId: null,
    recommendationPosture: "Undetermined",
    recommendationConfidence: 88, evidenceCoverage: 79,
    materialConflictCount: 2, openIssueCount: 3,
    highestRisk: "Critical Availability Dependency", riskLevel: "Critical",
    customerImpact: "High", financialImpact: "High", operationalImpact: "High",
    securityImpact: "High", complianceImpact: "High",
    customerJourney: "Purchase", environment: "Production", region: "EU",
    reviewStatus: "Pending Review", approvalRequirement: "Governance Board", knowledgeDomain: "Payments",
    startedAt: "2026-07-28", updatedAt: "2026-08-05",
  },
  {
    id: "DIA 5004",
    workItemId: "WI 2295", workItem: "Fraud Decision Timeout Adjustment",
    intakeId: "INT 3295", crossTeamAnalysisId: "CTA 4395", crossTeamAnalysisVersionId: "CTA 4395 v1",
    decisionQuestion: "Should Fraud Decision Service timeout increase from 900 ms to 1.2 seconds?",
    decisionReason: "Fraud decision timeouts are producing conservative declines at peak.",
    decisionOwner: "Risk Committee",
    decisionDeadline: "Before peak season readiness gate",
    submittingTeam: "Fraud Engineering", businessUnit: "Risk & Trust",
    decisionType: "Configuration Change", workType: "Change Request", priority: "High",
    scope: ["Timeout value", "Fallback behaviour", "Monitoring"], outOfScope: ["Model retraining"],
    assumptions: ["Checkout latency budget can absorb 300 ms"],
    status: "Analyzing", currentStageId: "DIS 8",
    alternativeIds: ["ALT 5004 A", "ALT 5004 B", "ALT 5004 C"],
    recommendedAlternativeId: "ALT 5004 B",
    recommendationPosture: "Conditional Proceed",
    recommendationConfidence: 92, evidenceCoverage: 88,
    materialConflictCount: 1, openIssueCount: 1,
    highestRisk: "Checkout Delay versus Fraud Decision Quality", riskLevel: "Medium",
    customerImpact: "Medium", financialImpact: "Medium", operationalImpact: "Medium",
    securityImpact: "Medium", complianceImpact: "Low",
    customerJourney: "Purchase", environment: "Production", region: "Global",
    reviewStatus: "In Review", approvalRequirement: "Joint Approval", knowledgeDomain: "Risk & Fraud",
    startedAt: "2026-08-04", updatedAt: "2026-08-06",
  },
  {
    id: "DIA 5005",
    workItemId: "WI 2301", workItem: "Checkout Observability Expansion",
    intakeId: "INT 3301", crossTeamAnalysisId: "CTA 4401", crossTeamAnalysisVersionId: "CTA 4401 v4",
    decisionQuestion: "Should Checkout Observability coverage expand before peak season?",
    decisionReason: "Retry and fraud decisions require finer grained telemetry to be governed safely.",
    decisionOwner: "Commerce Architecture Council",
    decisionDeadline: "Before peak season readiness gate",
    submittingTeam: "Site Reliability Engineering", businessUnit: "Digital Commerce",
    decisionType: "Observability Investment", workType: "Initiative", priority: "Medium",
    scope: ["Telemetry coverage", "Alerting", "Dashboards"], outOfScope: ["Vendor change"],
    assumptions: ["Instrumentation cost stays inside budget"],
    status: "Decision Context Ready", currentStageId: "DIS 14",
    alternativeIds: ["ALT 5005 A", "ALT 5005 B", "ALT 5005 C"],
    recommendedAlternativeId: "ALT 5005 B",
    recommendationPosture: "Proceed",
    recommendationConfidence: 97, evidenceCoverage: 98,
    materialConflictCount: 0, openIssueCount: 0,
    highestRisk: "Low", riskLevel: "Low",
    customerImpact: "Low", financialImpact: "Low", operationalImpact: "Medium",
    securityImpact: "Low", complianceImpact: "Low",
    customerJourney: "Purchase", environment: "Production", region: "Global",
    reviewStatus: "Reviewed", approvalRequirement: "Single Owner", knowledgeDomain: "Reliability",
    startedAt: "2026-07-30", updatedAt: "2026-08-06",
  },
];

export const evaluationById = (id: string) =>
  evaluations.find((e) => e.id === id) ?? evaluations[0];

/* ----------------------------------------------------------- alternatives -- */

export const alternatives: DecisionAlternative[] = [
  {
    id: "ALT 5001 A", evaluationId: "DIA 5001", code: "Option A", name: "Maintain Two Retries",
    description: "No policy change. Retain the current two attempt retry policy and continue monitoring.",
    strategicIntent: "Preserve current risk posture and avoid new coordination cost.",
    customerBenefit: "Low", businessBenefit: "Low", financialImpact: "No incremental revenue recovery",
    operationalImpact: "Low", reliabilityImpact: "Low", securityImpact: "Low", complianceImpact: "Low",
    dependencyImpact: "Low", fraudRisk: "Low", coordinationCost: "Low", implementationEffort: "Low",
    timeToBenefit: "None", reversibility: "High", evidenceRequirement: "Low",
    governanceRequirement: "None", requiredControlIds: [], requiredApprovalIds: [],
    residualRisk: "Low", opportunityCost: "Medium High",
    personaSupport: ["Fraud Engineering"], personaConcern: ["Checkout Engineering"],
    confidence: 96, status: "Modelled",
  },
  {
    id: "ALT 5001 B", evaluationId: "DIA 5001", code: "Option B", name: "Three Retries, Segmented Rollout",
    description: "Increase to three retries with 5%, 10%, 15%, then broader rollout after evidence gates.",
    strategicIntent: "Capture checkout completion opportunity while retaining reversibility and generating evidence.",
    customerBenefit: "High", businessBenefit: "High", financialImpact: "Incremental completion revenue, staged",
    operationalImpact: "Medium", reliabilityImpact: "Medium", securityImpact: "Low", complianceImpact: "Low",
    dependencyImpact: "Medium", fraudRisk: "Medium", coordinationCost: "Medium", implementationEffort: "Medium",
    timeToBenefit: "3 to 5 weeks staged", reversibility: "High", evidenceRequirement: "High",
    governanceRequirement: "Joint approval above 10% traffic",
    requiredControlIds: ["CTL 21", "CTL 22", "CTL 23"], requiredApprovalIds: ["APR 1", "APR 2"],
    residualRisk: "Medium", opportunityCost: "Low",
    personaSupport: ["Checkout Engineering", "Site Reliability Engineering"],
    personaConcern: ["Fraud Engineering"],
    confidence: 94, status: "Preferred Candidate",
  },
  {
    id: "ALT 5001 C", evaluationId: "DIA 5001", code: "Option C", name: "Three Retries, Immediate Broad Rollout",
    description: "Increase to three retries and deploy to full production traffic in a single change.",
    strategicIntent: "Realise the full completion benefit immediately.",
    customerBenefit: "High", businessBenefit: "High", financialImpact: "Fastest revenue recovery, highest variance",
    operationalImpact: "Medium", reliabilityImpact: "High", securityImpact: "Medium", complianceImpact: "Medium",
    dependencyImpact: "High", fraudRisk: "High", coordinationCost: "Medium", implementationEffort: "Low",
    timeToBenefit: "Immediate", reversibility: "Low", evidenceRequirement: "High",
    governanceRequirement: "Joint approval required",
    requiredControlIds: ["CTL 21", "CTL 22"], requiredApprovalIds: ["APR 1", "APR 2", "APR 3"],
    residualRisk: "High", opportunityCost: "Low",
    personaSupport: ["Checkout Engineering"],
    personaConcern: ["Fraud Engineering", "Payments Platform", "Release Governance"],
    confidence: 86, status: "Modelled",
  },
  {
    id: "ALT 5001 D", evaluationId: "DIA 5001", code: "Option D", name: "Dynamic Retry by Error Category",
    description: "Retry count varies by payment error classification, with conservative defaults.",
    strategicIntent: "Target recoveries precisely and limit unnecessary retry volume.",
    customerBenefit: "High", businessBenefit: "High", financialImpact: "Targeted recovery, delayed benefit",
    operationalImpact: "High", reliabilityImpact: "Medium", securityImpact: "Low", complianceImpact: "Low",
    dependencyImpact: "Medium", fraudRisk: "Medium", coordinationCost: "High", implementationEffort: "High",
    timeToBenefit: "8 to 12 weeks", reversibility: "Medium", evidenceRequirement: "High",
    governanceRequirement: "Joint approval above 10% traffic",
    requiredControlIds: ["CTL 21", "CTL 23", "CTL 24"], requiredApprovalIds: ["APR 1", "APR 2"],
    residualRisk: "Medium", opportunityCost: "Medium",
    personaSupport: ["Payments Platform"],
    personaConcern: ["Site Reliability Engineering", "Checkout Engineering"],
    confidence: 89, status: "Modelled",
  },
];

export const alternativesFor = (evaluationId: string) =>
  alternatives.filter((a) => a.evaluationId === evaluationId);

export const alternativeById = (id: string) => alternatives.find((a) => a.id === id);

/* ------------------------------------------------------- persona positions -- */

export const diPersonas = [
  { id: "PER 4101", name: "Checkout Engineering" },
  { id: "PER 4102", name: "Payments Platform" },
  { id: "PER 4103", name: "Fraud Engineering" },
  { id: "PER 4104", name: "Site Reliability Engineering" },
  { id: "PER 4105", name: "Identity Engineering" },
  { id: "PER 4107", name: "Release Governance" },
];

export const personaPositions: DecisionPersonaPositionRecord[] = [
  {
    id: "DPP 1", evaluationId: "DIA 5001", personaId: "PER 4101", persona: "Checkout Engineering",
    topPriority: "Checkout completion rate", primaryConcern: "Lost recoverable transactions",
    requiredCondition: "Rollback threshold defined", confidence: 95,
    positions: { "ALT 5001 A": "Concerned", "ALT 5001 B": "Support", "ALT 5001 C": "Support with Concern", "ALT 5001 D": "Conditional Support" },
    benefits: {
      "ALT 5001 A": "No new operational load",
      "ALT 5001 B": "Checkout completion opportunity with contained blast radius",
      "ALT 5001 C": "Fastest completion benefit",
      "ALT 5001 D": "Precise recovery targeting",
    },
    concerns: {
      "ALT 5001 A": "Opportunity cost remains unaddressed",
      "ALT 5001 B": "Longer time to full benefit",
      "ALT 5001 C": "Rollback difficulty if fraud rises",
      "ALT 5001 D": "Long implementation delay",
    },
  },
  {
    id: "DPP 2", evaluationId: "DIA 5001", personaId: "PER 4102", persona: "Payments Platform",
    topPriority: "Payment integrity and idempotency", primaryConcern: "Duplicate authorizations",
    requiredCondition: "Idempotency validation, rollback, joint approval above 10%", confidence: 93,
    positions: { "ALT 5001 A": "Neutral", "ALT 5001 B": "Conditional Support", "ALT 5001 C": "Concerned", "ALT 5001 D": "Conditional Support" },
    benefits: {
      "ALT 5001 A": "No integrity exposure",
      "ALT 5001 B": "Staged exposure supports integrity validation",
      "ALT 5001 C": "None material",
      "ALT 5001 D": "Lower retry volume on non recoverable errors",
    },
    concerns: {
      "ALT 5001 A": "Continued manual recovery workload",
      "ALT 5001 B": "Requires idempotency evidence before expansion",
      "ALT 5001 C": "Duplicate authorization exposure at full traffic",
      "ALT 5001 D": "Classification accuracy risk",
    },
  },
  {
    id: "DPP 3", evaluationId: "DIA 5001", personaId: "PER 4103", persona: "Fraud Engineering",
    topPriority: "Fraud loss inside tolerance", primaryConcern: "Retry driven fraud probing",
    requiredCondition: "Fraud Loss Analysis completed", confidence: 90,
    positions: { "ALT 5001 A": "Support", "ALT 5001 B": "Conditional Support", "ALT 5001 C": "Oppose", "ALT 5001 D": "Conditional Support" },
    benefits: {
      "ALT 5001 A": "No change to fraud surface",
      "ALT 5001 B": "Segmented traffic keeps fraud signal observable",
      "ALT 5001 C": "None material",
      "ALT 5001 D": "Fewer retries on suspicious error classes",
    },
    concerns: {
      "ALT 5001 A": "Checkout pressure returns later",
      "ALT 5001 B": "Fraud Loss Analysis still outstanding",
      "ALT 5001 C": "Unbounded fraud exposure at full traffic",
      "ALT 5001 D": "Classification may be gamed",
    },
  },
  {
    id: "DPP 4", evaluationId: "DIA 5001", personaId: "PER 4104", persona: "Site Reliability Engineering",
    topPriority: "Dependency stability", primaryConcern: "Downstream saturation",
    requiredCondition: "Progressive rollout and dependency monitoring", confidence: 92,
    positions: { "ALT 5001 A": "Support", "ALT 5001 B": "Conditional Support", "ALT 5001 C": "Concerned", "ALT 5001 D": "Concerned" },
    benefits: {
      "ALT 5001 A": "No additional load",
      "ALT 5001 B": "Load increase is observable and reversible",
      "ALT 5001 C": "None material",
      "ALT 5001 D": "Lower total retry volume once tuned",
    },
    concerns: {
      "ALT 5001 A": "None",
      "ALT 5001 B": "Requires dependency stress evidence",
      "ALT 5001 C": "Saturation risk across Payments and Identity",
      "ALT 5001 D": "Complex failure modes during tuning",
    },
  },
  {
    id: "DPP 5", evaluationId: "DIA 5001", personaId: "PER 4105", persona: "Identity Engineering",
    topPriority: "Token validation capacity", primaryConcern: "Additional validation load",
    requiredCondition: "Regional Token Vault headroom confirmed", confidence: 88,
    positions: { "ALT 5001 A": "Neutral", "ALT 5001 B": "Concerned", "ALT 5001 C": "Oppose", "ALT 5001 D": "Neutral" },
    benefits: {
      "ALT 5001 A": "No change",
      "ALT 5001 B": "Staged load increase is absorbable",
      "ALT 5001 C": "None material",
      "ALT 5001 D": "Lower incremental validation volume",
    },
    concerns: {
      "ALT 5001 A": "None",
      "ALT 5001 B": "EU vault margin currently below target",
      "ALT 5001 C": "Vault saturation risk in EU",
      "ALT 5001 D": "Uncertain steady state volume",
    },
  },
  {
    id: "DPP 6", evaluationId: "DIA 5001", personaId: "PER 4107", persona: "Release Governance",
    topPriority: "Change governance compliance", primaryConcern: "Approval threshold and change window",
    requiredCondition: "Joint approval above 10% traffic, no quarter end deployment", confidence: 97,
    positions: { "ALT 5001 A": "Neutral", "ALT 5001 B": "Conditional", "ALT 5001 C": "Review Required", "ALT 5001 D": "Conditional" },
    benefits: {
      "ALT 5001 A": "No governance action required",
      "ALT 5001 B": "Traffic gates map cleanly to approval thresholds",
      "ALT 5001 C": "None material",
      "ALT 5001 D": "Gradual exposure possible",
    },
    concerns: {
      "ALT 5001 A": "None",
      "ALT 5001 B": "Joint approval must precede the 15% gate",
      "ALT 5001 C": "Single change exceeds delegated authority",
      "ALT 5001 D": "Change complexity increases review burden",
    },
  },
];

export const positionsFor = (evaluationId: string) =>
  personaPositions.filter((p) => p.evaluationId === evaluationId);

export const positionTone = (p: PersonaPosition) =>
  p === "Support" ? "green"
    : p === "Conditional Support" || p === "Conditional" || p === "Support with Concern" ? "blue"
      : p === "Neutral" ? "slate"
        : p === "Concerned" || p === "Review Required" ? "amber" : "red";

/* --------------------------------------------------------------- tradeoffs -- */

export const tradeoffs: DecisionTradeoff[] = [
  {
    id: "DTR 1", evaluationId: "DIA 5001", alternativeIds: ["ALT 5001 B", "ALT 5001 C"],
    tradeoffType: "Customer", title: "Customer Completion versus Fraud Exposure",
    description: "Additional retry attempts recover transient declines but expand the authorization surface.",
    benefit: "More retries recover transient failures",
    cost: "More attempts can increase fraud and authorization exposure",
    affectedPersonaIds: ["PER 4101", "PER 4103", "PER 4102"],
    conditionIds: ["CND 7"], evidenceReferenceIds: ["EVD 4", "EVD 8"],
    confidence: 93, potentialCondition: "Fraud Loss Analysis before exceeding 10% traffic", status: "Material",
  },
  {
    id: "DTR 2", evaluationId: "DIA 5001", alternativeIds: ["ALT 5001 B", "ALT 5001 C"],
    tradeoffType: "Operational", title: "Reversibility versus Speed",
    description: "Segmented rollout contains adverse effects but defers full benefit realisation.",
    benefit: "Contain adverse effects and generate evidence per stage",
    cost: "Longer time to full benefit",
    affectedPersonaIds: ["PER 4101", "PER 4104"],
    conditionIds: ["CND 5"], evidenceReferenceIds: ["EVD 6"],
    confidence: 96, potentialCondition: "Rollback threshold defined per stage", status: "Material",
  },
  {
    id: "DTR 3", evaluationId: "DIA 5001", alternativeIds: ["ALT 5001 A", "ALT 5001 B", "ALT 5001 D"],
    tradeoffType: "Operational", title: "Dependency Protection versus Recovery Aggressiveness",
    description: "Conservative retry protects downstream services but forfeits recoverable transactions.",
    benefit: "Conservative retry protects downstream systems",
    cost: "Fewer customer recoveries",
    affectedPersonaIds: ["PER 4104", "PER 4105", "PER 4101"],
    conditionIds: ["CND 2", "CND 3"], evidenceReferenceIds: ["EVD 9"],
    confidence: 90, potentialCondition: "Dependency stress validation before each gate", status: "Material",
  },
  {
    id: "DTR 4", evaluationId: "DIA 5001", alternativeIds: ["ALT 5001 B", "ALT 5001 D"],
    tradeoffType: "Governance", title: "Evidence Quality versus Decision Speed",
    description: "Further testing raises confidence but delays deployment inside the release window.",
    benefit: "More testing improves confidence",
    cost: "Delays deployment",
    affectedPersonaIds: ["PER 4103", "PER 4102", "PER 4101"],
    conditionIds: ["CND 6"], evidenceReferenceIds: ["EVD 8", "EVD 9"],
    confidence: 91, potentialCondition: "Time boxed evidence window with defined exit criteria", status: "Material",
  },
  {
    id: "DTR 5", evaluationId: "DIA 5001", alternativeIds: ["ALT 5001 C", "ALT 5001 D"],
    tradeoffType: "Financial", title: "Immediate Revenue Recovery versus Loss Variance",
    description: "Immediate broad rollout maximises upside but widens the range of financial outcomes.",
    benefit: "Fastest incremental completion revenue",
    cost: "Wider variance in duplicate authorization and fraud loss",
    affectedPersonaIds: ["PER 4101", "PER 4103"],
    conditionIds: ["CND 7"], evidenceReferenceIds: ["EVD 10"],
    confidence: 87, potentialCondition: "Finance Impact Analysis before broad exposure", status: "Material",
  },
];

export const tradeoffsFor = (id: string) => tradeoffs.filter((t) => t.evaluationId === id);

/* ------------------------------------------------------------- constraints -- */

export const constraints: DecisionConstraint[] = [
  {
    id: "DCN 1", evaluationId: "DIA 5001", conditionId: "CND 1", constraintType: "Policy Constraint", kind: "Constraint",
    title: "Payment retries must preserve idempotency",
    description: "Every retry attempt must carry an idempotency key honoured end to end by the Payments API.",
    authority: "Payments Platform Standard PS-14",
    affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
    affectedPersonaIds: ["PER 4102", "PER 4101"], evidenceReferenceIds: ["EVD 5"],
    confidence: 98, status: "Active",
  },
  {
    id: "DCN 2", evaluationId: "DIA 5001", conditionId: "CND 2", constraintType: "SLO Constraint", kind: "Constraint",
    title: "Availability must remain at or above 99.95%",
    description: "Checkout availability objective across the rollout period.",
    authority: "Enterprise Reliability Policy",
    affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
    affectedPersonaIds: ["PER 4104"], evidenceReferenceIds: ["EVD 6"],
    confidence: 97, status: "Active",
  },
  {
    id: "DCN 3", evaluationId: "DIA 5001", conditionId: "CND 3", constraintType: "SLO Constraint", kind: "Constraint",
    title: "P95 latency must remain below 250 ms",
    description: "Checkout submit path latency objective.",
    authority: "Enterprise Reliability Policy",
    affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
    affectedPersonaIds: ["PER 4104", "PER 4101"], evidenceReferenceIds: ["EVD 6"],
    confidence: 96, status: "Active",
  },
  {
    id: "DCN 4", evaluationId: "DIA 5001", conditionId: "CND 4", constraintType: "Risk Threshold", kind: "Constraint",
    title: "Error rate must remain below 0.3%",
    description: "Payment submission error rate ceiling across all rollout stages.",
    authority: "Commerce Operations Standard",
    affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
    affectedPersonaIds: ["PER 4101", "PER 4102"], evidenceReferenceIds: ["EVD 3"],
    confidence: 95, status: "Active",
  },
  {
    id: "DCN 5", evaluationId: "DIA 5001", conditionId: "CND 5", constraintType: "Approval Requirement", kind: "Constraint",
    title: "Joint approval required before traffic exceeds 10%",
    description: "Payments Platform and Release Governance must jointly approve exposure above 10% of production traffic.",
    authority: "Release Governance Policy RG-08",
    affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
    affectedPersonaIds: ["PER 4102", "PER 4107"], evidenceReferenceIds: ["EVD 7"],
    confidence: 99, status: "Conditional",
  },
  {
    id: "DCN 6", evaluationId: "DIA 5001", conditionId: "CND 6", constraintType: "Operational Window", kind: "Constraint",
    title: "No deployment in the final three business days of the quarter",
    description: "Restricted change window protecting quarter end financial close.",
    authority: "Enterprise Change Policy CH-02",
    affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
    affectedPersonaIds: ["PER 4107"], evidenceReferenceIds: [],
    confidence: 99, status: "Conditional",
  },
  {
    id: "DCN 7", evaluationId: "DIA 5001", conditionId: "CND 7", constraintType: "Security Constraint", kind: "Constraint",
    title: "Fraud timeout degradation control must remain enabled",
    description: "Retries must not bypass the fraud decision degradation control.",
    authority: "Risk Committee Control Standard",
    affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"],
    affectedPersonaIds: ["PER 4103"], evidenceReferenceIds: ["EVD 8"],
    confidence: 94, status: "Active",
  },
  {
    id: "DCN 8", evaluationId: "DIA 5001", conditionId: "CND 8", constraintType: "Operational Window", kind: "Preference",
    title: "Prefer rollout stages during business hours",
    description: "Preference, not a constraint. Improves on call response during stage transitions.",
    authority: "Site Reliability Engineering",
    affectedAlternativeIds: ["ALT 5001 B"], affectedPersonaIds: ["PER 4104"], evidenceReferenceIds: [],
    confidence: 82, status: "Advisory",
  },
  {
    id: "DCN 9", evaluationId: "DIA 5001", conditionId: "CND 9", constraintType: "Risk Threshold", kind: "Assumption",
    title: "Dependency capacity can absorb a 15% retry increase",
    description: "Assumption pending the Regional Dependency Stress Test.",
    authority: "Analysis assumption",
    affectedAlternativeIds: ["ALT 5001 B", "ALT 5001 C"], affectedPersonaIds: ["PER 4104", "PER 4105"],
    evidenceReferenceIds: ["EVD 9"], confidence: 74, status: "Unvalidated",
  },
];

export const constraintsFor = (id: string) => constraints.filter((c) => c.evaluationId === id);

/* ---------------------------------------------------------------- risks --- */

export const alternativeRisks: DecisionAlternativeRisk[] = [
  ["ALT 5001 A", "RSK 1", "Continued transient decline loss", "Medium", "Manual recovery outreach", "Medium", 92, "Open"],
  ["ALT 5001 B", "RSK 2", "Duplicate Authorization", "High", "Idempotency validation + rollback threshold", "Medium", 93, "Controlled"],
  ["ALT 5001 B", "RSK 3", "Fraud Exposure", "High", "Fraud monitoring + traffic segmentation", "Medium", 88, "Evidence Pending"],
  ["ALT 5001 B", "RSK 4", "Dependency Saturation", "Medium", "Load validation + progressive rollout", "Low to Medium", 86, "Evidence Pending"],
  ["ALT 5001 C", "RSK 2", "Duplicate Authorization", "Critical", "Idempotency validation only", "High", 84, "Open"],
  ["ALT 5001 C", "RSK 3", "Fraud Exposure", "Critical", "Fraud monitoring at full traffic", "High", 80, "Open"],
  ["ALT 5001 C", "RSK 4", "Dependency Saturation", "High", "Capacity headroom review", "High", 79, "Open"],
  ["ALT 5001 C", "RSK 5", "Limited Reversibility", "High", "Feature flag rollback", "Medium High", 82, "Open"],
  ["ALT 5001 D", "RSK 6", "Error Classification Inaccuracy", "High", "Shadow evaluation + fallback to two retries", "Medium", 85, "Controlled"],
  ["ALT 5001 D", "RSK 4", "Dependency Saturation", "Medium", "Category level rate limits", "Low to Medium", 87, "Controlled"],
  ["ALT 5001 D", "RSK 7", "Implementation Delay", "High", "Phased delivery plan", "Medium", 90, "Open"],
].map((r, i) => ({
  id: `DAR ${i + 1}`, evaluationId: "DIA 5001",
  alternativeId: r[0] as string, riskId: r[1] as string, risk: r[2] as string,
  rawSeverity: r[3] as Magnitude, controlIds: [`CTL ${20 + i}`], control: r[4] as string,
  residualSeverity: r[5] as Magnitude, confidence: r[6] as number,
  evidenceReferenceIds: ["EVD 5", "EVD 8"], status: r[7] as string,
}));

export const risksFor = (evaluationId: string, alternativeId?: string) =>
  alternativeRisks.filter((r) => r.evaluationId === evaluationId && (!alternativeId || r.alternativeId === alternativeId));

/* ------------------------------------------------------- expected outcomes -- */

export const expectedOutcomes: DecisionExpectedOutcome[] = [
  ["ALT 5001 A", "Customer", "Checkout Completion", "No change", "0.0%", "%", "Continuous", 96],
  ["ALT 5001 A", "Risk", "Fraud Loss", "No change", "0.0%", "%", "Continuous", 97],
  ["ALT 5001 B", "Customer", "Checkout Completion", "+1.5%", "+1.0% to +2.0%", "%", "24 to 72 hours per rollout stage", 92],
  ["ALT 5001 B", "Business", "Duplicate Authorization", "<= 0.2%", "0.1% to 0.2%", "%", "24 to 72 hours per rollout stage", 89],
  ["ALT 5001 B", "Technical", "P95 Latency", "Remain < 250 ms", "215 ms to 245 ms", "ms", "Per stage", 93],
  ["ALT 5001 B", "Operational", "Availability", ">= 99.95%", "99.95% to 99.98%", "%", "Per stage", 94],
  ["ALT 5001 B", "Risk", "Fraud Loss", "No material increase", "0.0% to 0.1%", "%", "Per stage", 85],
  ["ALT 5001 B", "Operational", "Rollback Availability", "Available within threshold", "< 10 minutes", "min", "Per stage", 95],
  ["ALT 5001 C", "Customer", "Checkout Completion", "+1.8%", "+0.8% to +2.4%", "%", "Immediate", 82],
  ["ALT 5001 C", "Business", "Duplicate Authorization", "0.4% or higher", "0.3% to 0.7%", "%", "Immediate", 78],
  ["ALT 5001 C", "Risk", "Fraud Loss", "Potential material increase", "0.0% to 0.6%", "%", "Immediate", 74],
  ["ALT 5001 D", "Customer", "Checkout Completion", "+1.6%", "+0.9% to +2.2%", "%", "8 to 12 weeks", 84],
  ["ALT 5001 D", "Operational", "Retry Volume", "Lower than Option B", "-15% to -30%", "%", "Post tuning", 81],
].map((r, i) => ({
  id: `DEO ${i + 1}`, evaluationId: "DIA 5001", alternativeId: r[0] as string,
  outcomeType: r[1] as DecisionExpectedOutcome["outcomeType"], metric: r[2] as string,
  expectedValue: r[3] as string, expectedRange: r[4] as string, unit: r[5] as string,
  observationWindow: r[6] as string, confidence: r[7] as number,
  conditionIds: ["CND 5"], evidenceReferenceIds: ["EVD 6"],
}));

export const outcomesFor = (evaluationId: string, alternativeId?: string) =>
  expectedOutcomes.filter((o) => o.evaluationId === evaluationId && (!alternativeId || o.alternativeId === alternativeId));

/* --------------------------------------------------------------- evidence -- */

export const evidenceRecords: DiEvidence[] = [
  { id: "EVD 1", evaluationId: "DIA 5001", name: "Intake Package INT 3301", decisionDimension: "Decision Definition", evidenceType: "Governed Package", alternativesAffected: ["ALT 5001 A", "ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], authority: "Cognitive Intake", freshness: "2 days", quality: 96, required: true, confidence: 96, status: "Available" },
  { id: "EVD 2", evaluationId: "DIA 5001", name: "Persona Impact Analysis PIA 4401", decisionDimension: "Persona Positions", evidenceType: "Analysis Result", alternativesAffected: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], authority: "Persona Stewards", freshness: "1 day", quality: 94, required: true, confidence: 94, status: "Available" },
  { id: "EVD 3", evaluationId: "DIA 5001", name: "Cross Team Impact Matrix CTA 4401 v4", decisionDimension: "Cross Team Impact", evidenceType: "Analysis Result", alternativesAffected: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], authority: "Coordination Office", freshness: "1 day", quality: 95, required: true, confidence: 95, status: "Available" },
  { id: "EVD 5", evaluationId: "DIA 5001", name: "Idempotency Test Results", decisionDimension: "Payment Integrity", evidenceType: "Test Result", alternativesAffected: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], authority: "Payments Platform", freshness: "6 days", quality: 92, required: true, confidence: 92, status: "Available" },
  { id: "EVD 6", evaluationId: "DIA 5001", name: "Current Retry Metrics", decisionDimension: "Reliability", evidenceType: "Telemetry", alternativesAffected: ["ALT 5001 A", "ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], authority: "Site Reliability Engineering", freshness: "4 hours", quality: 97, required: true, confidence: 97, status: "Available" },
  { id: "EVD 7", evaluationId: "DIA 5001", name: "Prior Retry Outcome DEC 4812", decisionDimension: "Historical Comparison", evidenceType: "Outcome Record", alternativesAffected: ["ALT 5001 B", "ALT 5001 C"], authority: "Organizational Learning", freshness: "2 quarters", quality: 90, required: true, confidence: 90, status: "Available" },
  { id: "EVD 11", evaluationId: "DIA 5001", name: "Rollback Threshold Definition", decisionDimension: "Reversibility", evidenceType: "Control Definition", alternativesAffected: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], authority: "Release Governance", freshness: "3 days", quality: 93, required: true, confidence: 93, status: "Available" },
  { id: "EVD 8", evaluationId: "DIA 5001", name: "Fraud Loss Analysis", decisionDimension: "Fraud Exposure", evidenceType: "Risk Analysis", alternativesAffected: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], authority: "Fraud Engineering", freshness: "Not produced", quality: 0, required: true, confidence: 0, status: "Missing" },
  { id: "EVD 9", evaluationId: "DIA 5001", name: "Regional Dependency Stress Test", decisionDimension: "Dependency Capacity", evidenceType: "Test Result", alternativesAffected: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"], authority: "Site Reliability Engineering", freshness: "Not produced", quality: 0, required: true, confidence: 0, status: "Missing" },
  { id: "EVD 4", evaluationId: "DIA 5001", name: "Security Review", decisionDimension: "Security", evidenceType: "Review", alternativesAffected: ["ALT 5001 C", "ALT 5001 D"], authority: "Security Architecture", freshness: "Not requested", quality: 0, required: false, confidence: 0, status: "Potentially Required" },
  { id: "EVD 10", evaluationId: "DIA 5001", name: "Finance Impact Analysis", decisionDimension: "Financial", evidenceType: "Analysis", alternativesAffected: ["ALT 5001 C"], authority: "Finance Partner", freshness: "Not requested", quality: 0, required: false, confidence: 0, status: "Potentially Required" },
];

export const evidenceFor = (id: string) => evidenceRecords.filter((e) => e.evaluationId === id);
export const evidenceById = (id: string) => evidenceRecords.find((e) => e.id === id);

/* -------------------------------------------------------- prior decisions -- */

export const priorDecisions: PriorDecision[] = [
  {
    id: "DEC 4812", name: "Limited Retry Increase", decision: "Approve 5% traffic retry increase",
    similarity: 94, conditions: ["5% traffic cap", "Idempotency validation", "72 hour observation"],
    expectedOutcome: "+1.5% checkout completion",
    observedOutcome: "+1.8% checkout completion",
    unexpectedOutcome: "+0.4% duplicate authorization attempts",
    lesson: "Strengthen idempotency validation before broader traffic expansion",
    learningId: "LRN 1426", currentRelevance: "High",
  },
  {
    id: "DEC 4620", name: "Fraud Timeout Adjustment", decision: "Increase fraud decision timeout by 200 ms",
    similarity: 71, conditions: ["Monitoring on review queue depth"],
    expectedOutcome: "Improved checkout completion",
    observedOutcome: "Improved checkout completion",
    unexpectedOutcome: "Increased fraud review workload",
    lesson: "Model downstream human workload, not only system latency",
    learningId: "LRN 1388", currentRelevance: "Medium",
  },
  {
    id: "DEC 4412", name: "Peak Season Traffic Expansion", decision: "Expand traffic in progressive stages",
    similarity: 66, conditions: ["Progressive rollout", "Dependency monitoring"],
    expectedOutcome: "Absorb peak load without incident",
    observedOutcome: "Successful after progressive rollout and dependency monitoring",
    unexpectedOutcome: "None material",
    lesson: "Progressive rollout with dependency monitoring is the reliable pattern",
    learningId: "LRN 1301", currentRelevance: "Medium",
  },
];

/* ----------------------------------------------------------- dependencies -- */

export const sharedDependencies = [
  { id: "DEP 1", name: "Payments API", criticality: "Critical", exposure: "Retry volume amplification", confidence: 93, alternatives: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"] },
  { id: "DEP 2", name: "Fraud Decision Service", criticality: "Critical", exposure: "Decision volume and timeout pressure", confidence: 90, alternatives: ["ALT 5001 B", "ALT 5001 C", "ALT 5001 D"] },
  { id: "DEP 3", name: "Identity Services", criticality: "High", exposure: "Token validation load", confidence: 88, alternatives: ["ALT 5001 B", "ALT 5001 C"] },
  { id: "DEP 4", name: "Regional Token Vault", criticality: "Critical", exposure: "EU capacity margin below target", confidence: 78, alternatives: ["ALT 5001 B", "ALT 5001 C"] },
];

/* ------------------------------------------------------------- comparison -- */

export interface ComparisonRow {
  dimension: string;
  lens: ("customer" | "risk" | "governance" | "persona")[];
  values: Record<string, { direction: "positive" | "neutral" | "negative"; magnitude: string; confidence: number; context: string }>;
}

const cmp = (
  dimension: string,
  lens: ComparisonRow["lens"],
  a: [string, string, number, string],
  b: [string, string, number, string],
  c: [string, string, number, string],
  d: [string, string, number, string],
): ComparisonRow => ({
  dimension, lens,
  values: {
    "ALT 5001 A": { direction: a[0] as never, magnitude: a[1], confidence: a[2], context: a[3] },
    "ALT 5001 B": { direction: b[0] as never, magnitude: b[1], confidence: b[2], context: b[3] },
    "ALT 5001 C": { direction: c[0] as never, magnitude: c[1], confidence: c[2], context: c[3] },
    "ALT 5001 D": { direction: d[0] as never, magnitude: d[1], confidence: d[2], context: d[3] },
  },
});

export const comparisonRows: ComparisonRow[] = [
  cmp("Customer Benefit", ["customer", "persona"],
    ["neutral", "Low", 96, "No change to completion rate"],
    ["positive", "High", 92, "+1.0% to +2.0% completion, staged"],
    ["positive", "High", 82, "Fastest benefit, widest variance"],
    ["positive", "High", 84, "Targeted recovery, delayed"]),
  cmp("Business Benefit", ["customer"],
    ["neutral", "Low", 95, "Status quo revenue"],
    ["positive", "High", 91, "Staged incremental revenue"],
    ["positive", "High", 80, "Immediate but volatile"],
    ["positive", "Medium", 83, "Higher precision, later"]),
  cmp("Financial Impact", ["customer"],
    ["neutral", "None", 96, "No incremental spend or recovery"],
    ["positive", "Medium", 89, "Recovery net of monitoring cost"],
    ["negative", "Medium High", 78, "Duplicate authorization exposure"],
    ["negative", "Medium", 82, "High build cost before benefit"]),
  cmp("Reliability", ["risk"],
    ["positive", "Low risk", 96, "No new load"],
    ["neutral", "Medium", 90, "Load increase observable per stage"],
    ["negative", "High", 79, "Full load increase at once"],
    ["neutral", "Medium", 85, "Complex failure modes during tuning"]),
  cmp("Security", ["risk"],
    ["neutral", "Low", 96, "No change"],
    ["neutral", "Low", 92, "No new surface, monitored"],
    ["negative", "Medium", 81, "Broader authorization surface"],
    ["neutral", "Low", 88, "Classification data handling only"]),
  cmp("Compliance", ["governance"],
    ["neutral", "Low", 97, "No change"],
    ["neutral", "Low", 93, "Inside change policy with gates"],
    ["negative", "Medium", 80, "Exceeds delegated change authority"],
    ["neutral", "Low", 88, "Inside change policy"]),
  cmp("Operational Complexity", ["risk"],
    ["positive", "Low", 96, "No coordination required"],
    ["neutral", "Medium", 91, "Stage coordination across four teams"],
    ["neutral", "Medium", 86, "Single change, heavy monitoring"],
    ["negative", "High", 82, "Classification tuning and ownership"]),
  cmp("Dependency Risk", ["risk"],
    ["positive", "Low", 95, "No incremental dependency load"],
    ["neutral", "Medium", 86, "Staged load, stress evidence pending"],
    ["negative", "High", 76, "Vault margin insufficient in EU"],
    ["neutral", "Medium", 84, "Lower steady state volume"]),
  cmp("Fraud Risk", ["risk"],
    ["positive", "Low", 96, "No change to fraud surface"],
    ["neutral", "Medium", 85, "Segmented traffic keeps signal observable"],
    ["negative", "High", 74, "Unbounded exposure at full traffic"],
    ["neutral", "Medium", 83, "Fewer retries on suspicious classes"]),
  cmp("Coordination Requirement", ["governance", "persona"],
    ["positive", "Low", 96, "None"],
    ["neutral", "Medium", 92, "Four teams across four stages"],
    ["neutral", "Medium", 87, "Joint approval and joint monitoring"],
    ["negative", "High", 83, "Shared classification ownership"]),
  cmp("Evidence Requirement", ["governance"],
    ["positive", "Low", 96, "None additional"],
    ["negative", "High", 88, "Fraud and dependency evidence required"],
    ["negative", "High", 79, "Same evidence, no staged generation"],
    ["negative", "High", 82, "Classification accuracy evidence required"]),
  cmp("Reversibility", ["risk", "governance"],
    ["positive", "High", 97, "Nothing to reverse"],
    ["positive", "High", 94, "Stage rollback within 10 minutes"],
    ["negative", "Low", 80, "Full traffic exposure before signal"],
    ["neutral", "Medium", 85, "Fallback to two retries by category"]),
  cmp("Time to Benefit", ["customer"],
    ["negative", "None", 96, "No benefit"],
    ["neutral", "3 to 5 weeks", 91, "Benefit accrues per stage"],
    ["positive", "Immediate", 84, "Full benefit at cutover"],
    ["negative", "8 to 12 weeks", 82, "Build then tune"]),
  cmp("Implementation Effort", ["governance"],
    ["positive", "Low", 97, "No work"],
    ["neutral", "Medium", 92, "Flagging, gating, monitoring"],
    ["positive", "Low", 90, "Configuration change only"],
    ["negative", "High", 81, "Classification service work"]),
  cmp("Governance Requirement", ["governance"],
    ["positive", "None", 97, "No approval required"],
    ["neutral", "Joint above 10%", 95, "Threshold approval at the 15% gate"],
    ["negative", "Joint required", 88, "Board review required"],
    ["neutral", "Joint above 10%", 90, "Threshold approval at expansion"]),
];

/* --------------------------------------------------------------- quality -- */

export const qualityDimensions: QualityDimension[] = [
  { name: "Decision Definition", current: 97, target: 95, trend: "+2", affectedDecisions: 0 },
  { name: "Alternative Coverage", current: 95, target: 95, trend: "+1", affectedDecisions: 1 },
  { name: "Persona Coverage", current: 96, target: 95, trend: "+1", affectedDecisions: 0 },
  { name: "Condition Coverage", current: 94, target: 95, trend: "0", affectedDecisions: 2 },
  { name: "Dependency Coverage", current: 91, target: 95, trend: "-1", affectedDecisions: 3 },
  { name: "Evidence Coverage", current: 91, target: 95, trend: "+2", affectedDecisions: 4 },
  { name: "Risk Coverage", current: 95, target: 95, trend: "+1", affectedDecisions: 1 },
  { name: "Mitigation Coverage", current: 92, target: 95, trend: "+3", affectedDecisions: 2 },
  { name: "Tradeoff Transparency", current: 97, target: 95, trend: "+2", affectedDecisions: 0 },
  { name: "Historical Comparison", current: 93, target: 95, trend: "+1", affectedDecisions: 2 },
  { name: "Expected Outcome Definition", current: 92, target: 95, trend: "+2", affectedDecisions: 2 },
  { name: "Recommendation Traceability", current: 98, target: 95, trend: "+1", affectedDecisions: 0 },
];

export const qualityOverall = 94;

/* -------------------------------------------------------------- activity -- */

export const seedActivity: DecisionIntelligenceActivity[] = [
  { id: "DIACT 1", timestamp: "09:42", evaluationId: "DIA 5001", action: "Tradeoff comparison completed", description: "Option B and Option D remain close after mitigation", result: "Recorded", owner: "Decision Facilitation", auditId: "AUD 88121" },
  { id: "DIACT 2", timestamp: "09:20", evaluationId: "DIA 5001", action: "Evidence gap raised", description: "Fraud Loss Analysis requested from Fraud Engineering", result: "Open", owner: "Risk Committee", auditId: "AUD 88118" },
  { id: "DIACT 3", timestamp: "08:55", evaluationId: "DIA 5003", action: "Recommendation withheld", description: "Dependency confidence below threshold for Regional Token Vault Migration", result: "Undetermined", owner: "Architecture Council", auditId: "AUD 88110" },
  { id: "DIACT 4", timestamp: "08:31", evaluationId: "DIA 5005", action: "Decision context prepared", description: "Checkout Observability Expansion package published", result: "Ready", owner: "Decision Facilitation", auditId: "AUD 88104" },
];

/* --------------------------------------------------------- proposal state -- */

export interface ProposalParams {
  trafficExposure: number;
  progressiveRollout: boolean;
  deploymentWindow: "Standard" | "Quarter End Restricted";
  retryAttempts: number;
  removedEvidence: string[];
  addedEvidence: string[];
}

export const baselineProposal: ProposalParams = {
  trafficExposure: 5,
  progressiveRollout: true,
  deploymentWindow: "Standard",
  retryAttempts: 3,
  removedEvidence: [],
  addedEvidence: [],
};

export interface DerivedDecisionState {
  jointApprovalRequired: boolean;
  governanceRestricted: boolean;
  evidenceCoverage: number;
  confidence: number;
  posture: DecisionPosture;
  preferredAlternativeId: string;
  reversibility: Magnitude;
  optionCRisk: Magnitude;
  activeConditions: string[];
  notes: string[];
}

/** Deterministic derivation. Replaceable by an enterprise decision service. */
export function deriveDecisionState(p: ProposalParams): DerivedDecisionState {
  const notes: string[] = [];
  const jointApprovalRequired = p.trafficExposure > 10;
  const governanceRestricted = p.deploymentWindow === "Quarter End Restricted";

  const base = evidenceFor("DIA 5001");
  const required = base.filter((e) => e.required);
  const availableCount = required.filter(
    (e) => (e.status === "Available" && !p.removedEvidence.includes(e.id)) || p.addedEvidence.includes(e.id),
  ).length;
  const evidenceCoverage = Math.round((availableCount / required.length) * 100);

  let confidence = 70 + Math.round(evidenceCoverage * 0.28);
  if (p.progressiveRollout) confidence += 3; else { confidence -= 6; notes.push("Progressive rollout disabled: reversibility and operational risk worsen."); }
  if (p.trafficExposure > 50) confidence -= 6;
  else if (p.trafficExposure > 10) confidence -= 2;
  if (governanceRestricted) { confidence -= 3; notes.push("Quarter end restricted window: Option B and Option C are governance constrained."); }
  if (jointApprovalRequired) notes.push("Traffic above 10%: joint approval by Payments Platform and Release Governance is required before the gate.");
  confidence = Math.max(52, Math.min(98, confidence));

  const missingCritical = ["EVD 8", "EVD 9"].filter(
    (id) => !p.addedEvidence.includes(id),
  );
  const removedCritical = p.removedEvidence.length > 0;
  if (removedCritical) notes.push("Evidence removed: recommendation confidence reduced and conditions expanded.");

  let posture: DecisionPosture = "Conditional Proceed";
  let preferredAlternativeId = "ALT 5001 B";
  if (missingCritical.length === 0 && p.progressiveRollout && !governanceRestricted && p.trafficExposure <= 15) {
    posture = "Proceed with Guardrails";
  }
  if (evidenceCoverage < 70 || confidence < 75) posture = "Defer Pending Evidence";
  if (!p.progressiveRollout && p.trafficExposure >= 100) { posture = "Revise Proposal"; preferredAlternativeId = "ALT 5001 A"; }
  if (governanceRestricted && p.trafficExposure > 10) posture = "Escalate";

  const reversibility: Magnitude = p.progressiveRollout ? "High" : p.trafficExposure >= 50 ? "Low" : "Medium";
  const optionCRisk: Magnitude = p.trafficExposure >= 100 ? "Critical" : p.trafficExposure > 10 ? "High" : "Medium High";

  const activeConditions = [
    "Validated idempotency",
    "Fraud Loss Analysis",
    "Dependency stress validation",
    p.progressiveRollout ? "Progressive rollout" : "Progressive rollout not planned",
    "Rollback threshold",
    jointApprovalRequired ? "Joint approval obtained before exceeding 10% traffic" : "Joint approval not yet required at current exposure",
    governanceRestricted ? "Quarter end restriction blocks the deployment window" : "Do not deploy during quarter end restricted period",
  ];

  return {
    jointApprovalRequired, governanceRestricted, evidenceCoverage, confidence,
    posture, preferredAlternativeId, reversibility, optionCRisk, activeConditions, notes,
  };
}

export const recommendationFactors = [
  { factor: "Customer Opportunity", weight: "Strong Positive", direction: "positive" as const },
  { factor: "Reversibility", weight: "Strong Positive", direction: "positive" as const },
  { factor: "Evidence Generation", weight: "Positive", direction: "positive" as const },
  { factor: "Prior Outcome Support", weight: "Positive", direction: "positive" as const },
  { factor: "Fraud Risk", weight: "Moderate Negative", direction: "negative" as const },
  { factor: "Dependency Risk", weight: "Moderate Negative", direction: "negative" as const },
  { factor: "Governance Complexity", weight: "Moderate Negative", direction: "negative" as const },
  { factor: "Operational Coordination", weight: "Moderate Negative", direction: "negative" as const },
];

export const recommendationBenefits = [
  "Checkout completion improvement",
  "Retains reversibility",
  "Produces incremental evidence",
  "Limits initial blast radius",
];

export const recommendationCosts = [
  "Longer rollout duration",
  "Additional operational coordination",
  "Additional evidence requirements",
  "Fraud monitoring overhead",
];

export const recommendationCounterarguments = [
  "Option D targets recoveries more precisely and may produce a better steady state",
  "Fraud Engineering cannot fully endorse until the Fraud Loss Analysis is complete",
  "Identity Engineering capacity margin in EU is currently below target",
];

export const weakenTriggers = [
  "Duplicate authorization exceeds threshold",
  "Fraud loss materially rises",
  "Dependency capacity falls below required margin",
  "Rollback capability is unavailable",
];

export const strengthenTriggers = [
  "Fraud analysis is acceptable",
  "Dependency stress test passes",
  "Initial rollout confirms checkout benefit without adverse risk",
];

export const openIssues = [
  "Fraud Loss Analysis not yet complete",
  "Regional dependency stress evidence not yet complete",
];

export const requiredApprovals = [
  "Payments Platform joint approval before exceeding 10% traffic",
  "Release Governance change window approval",
  "Risk Committee acceptance of residual fraud exposure",
];

export const requiredReviewers = [
  "Fraud Engineering (evidence owner)",
  "Site Reliability Engineering (dependency owner)",
  "Identity Engineering (capacity owner)",
];

export const openQuestions = [
  "Can the EU Regional Token Vault margin be restored before the 15% gate?",
  "Should the 15% gate require a second fraud observation window?",
];

/* ------------------------------------------------------------ operational -- */

export const operationalState = (d: DerivedDecisionState) => {
  if (d.posture === "Escalate") return "Conflict Detected";
  if (d.posture === "Defer Pending Evidence") return "Evidence Required";
  if (d.evidenceCoverage < 100) return "Review Required";
  return "Decision Context Ready";
};

export const diTone = (s: string) =>
  ["Operational", "Decision Context Ready", "Proceed", "Available", "Controlled", "Within SLA", "Ready", "Active", "Reviewed"].includes(s) ? "green"
    : ["Analyzing", "Review Required", "Conditional Proceed", "Proceed with Guardrails", "In Review", "Modelled", "Preferred Candidate", "Conditional"].includes(s) ? "blue"
      : ["Evidence Required", "Needs Evidence", "Warning", "Defer Pending Evidence", "Evidence Pending", "Potentially Required", "Attention", "At Risk", "Unvalidated", "Pending Review", "Advisory", "Medium"].includes(s) ? "amber"
        : ["Conflict Detected", "Escalate", "Do Not Proceed", "Missing", "Blocked", "Critical", "High", "Open", "Revise Proposal"].includes(s) ? "red" : "slate";

export const magnitudeTone = (m: string) =>
  ["Low", "None"].includes(m) ? "green"
    : ["Low to Medium", "Medium"].includes(m) ? "blue"
      : ["Medium High", "High"].includes(m) ? "amber" : "red";
