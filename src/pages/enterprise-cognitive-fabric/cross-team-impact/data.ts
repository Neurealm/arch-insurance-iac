/**
 * Cross Team Impact Analysis — deterministic domain model and demonstration data.
 *
 * Synthesises Persona Impact Analysis results into an enterprise coordination
 * view. Persona perspectives are never averaged: every Persona keeps its own
 * row, score, benefit, risk and review requirement. Intersections, conflicts,
 * dependencies and coordination requirements are derived deterministically from
 * the analysis state (traffic exposure, deployment timing, evidence state).
 *
 * All content is synthetic. Services are shaped so the deterministic builders
 * can later be replaced by real APIs without changing component contracts.
 */

import type { IntakeKpi } from "../cognitive-intake/data";

/* ------------------------------------------------------------------ views -- */

export type CtiView = "matrix" | "dependency" | "coordination" | "executive";

export const ctiViews: { id: CtiView; label: string }[] = [
  { id: "matrix", label: "Matrix" },
  { id: "dependency", label: "Shared Dependency" },
  { id: "coordination", label: "Coordination" },
  { id: "executive", label: "Executive" },
];

export type CtiOperationalState =
  | "Operational" | "Analyzing" | "Conflict Detected" | "Review Required"
  | "Needs Evidence" | "Degraded" | "Paused";

export type Severity = "Low" | "Medium" | "High" | "Critical";
export const severityOrder: Severity[] = ["Low", "Medium", "High", "Critical"];
export const severityRank = (s: string) => Math.max(0, severityOrder.indexOf(s as Severity));

export type ImpactDirection = "Positive" | "Neutral" | "Negative" | "Mixed" | "Review Required";

/* --------------------------------------------------------------- personas -- */

export interface CtiPersona {
  id: string;
  name: string;
  short: string;
  team: string;
  businessUnit: string;
  score: number;
  primaryBenefit: string;
  primaryRisk: string;
  highestSeverity: Severity;
  reviewRequired: boolean;
  personaImpactEvaluationId: string;
}

export const ctiPersonas: CtiPersona[] = [
  {
    id: "PER 4101", name: "Payments Platform", short: "Payments", team: "Payments Platform",
    businessUnit: "Digital Commerce", score: 68,
    primaryBenefit: "Recoverable transactions complete without customer retry",
    primaryRisk: "Duplicate authorization exposure under retry expansion",
    highestSeverity: "High", reviewRequired: true, personaImpactEvaluationId: "PIA 2101",
  },
  {
    id: "PER 4102", name: "Checkout Engineering", short: "Checkout", team: "Checkout Engineering",
    businessUnit: "Digital Commerce", score: 54,
    primaryBenefit: "Measurable checkout completion improvement",
    primaryRisk: "Latency amplification on retry-heavy paths",
    highestSeverity: "Medium", reviewRequired: false, personaImpactEvaluationId: "PIA 2102",
  },
  {
    id: "PER 4103", name: "Fraud Engineering", short: "Fraud", team: "Fraud Engineering",
    businessUnit: "Risk & Compliance", score: 76,
    primaryBenefit: "Richer retry signal for fraud model tuning",
    primaryRisk: "Fraud exposure and Fraud Decision Service volume increase",
    highestSeverity: "High", reviewRequired: true, personaImpactEvaluationId: "PIA 2103",
  },
  {
    id: "PER 4104", name: "Site Reliability Engineering", short: "SRE", team: "Site Reliability Engineering",
    businessUnit: "Enterprise Platform", score: 61,
    primaryBenefit: "Rollback and rollout controls become explicit",
    primaryRisk: "Dependency saturation and operational load",
    highestSeverity: "High", reviewRequired: true, personaImpactEvaluationId: "PIA 2104",
  },
  {
    id: "PER 4105", name: "Identity Engineering", short: "Identity", team: "Identity Engineering",
    businessUnit: "Enterprise Platform", score: 43,
    primaryBenefit: "Validation load becomes measurable and bounded",
    primaryRisk: "Token validation latency under recovery volume",
    highestSeverity: "Medium", reviewRequired: false, personaImpactEvaluationId: "PIA 2105",
  },
  {
    id: "PER 4106", name: "Release Governance", short: "Governance", team: "Release Governance",
    businessUnit: "Risk & Compliance", score: 48,
    primaryBenefit: "Rollout evidence is captured before broad exposure",
    primaryRisk: "Approval threshold and change window restrictions activate",
    highestSeverity: "Medium", reviewRequired: false, personaImpactEvaluationId: "PIA 2106",
  },
];

export const personaById = (id: string) => ctiPersonas.find((p) => p.id === id) ?? ctiPersonas[0];
export const personaByName = (name: string) => ctiPersonas.find((p) => p.name === name) ?? ctiPersonas[0];

/* ------------------------------------------------------------ analysis state */

export interface CtiAnalysisState {
  maxTraffic: number;
  deploymentTiming: "Standard window" | "Quarter end window" | "Maintenance window";
  fraudLossEvidence: boolean;
  idempotencyEvidence: boolean;
  dependencyLoadEvidence: boolean;
}

export const initialAnalysisState: CtiAnalysisState = {
  maxTraffic: 25,
  deploymentTiming: "Standard window",
  fraudLossEvidence: true,
  idempotencyEvidence: true,
  dependencyLoadEvidence: false,
};

/** Governance activates once traffic exposure exceeds the approval threshold. */
export const GOVERNANCE_TRAFFIC_THRESHOLD = 10;
export const governanceActive = (s: CtiAnalysisState) => s.maxTraffic > GOVERNANCE_TRAFFIC_THRESHOLD;
export const quarterEnd = (s: CtiAnalysisState) => s.deploymentTiming === "Quarter end window";

/** Release Governance keeps its own live score rather than a static value. */
export function governanceScore(s: CtiAnalysisState) {
  let score = 48;
  if (governanceActive(s)) score = 72;
  if (quarterEnd(s)) score += 9;
  return Math.min(96, score);
}

export function personaScore(personaId: string, s: CtiAnalysisState) {
  const base = personaById(personaId).score;
  if (personaId === "PER 4106") return governanceScore(s);
  if (personaId === "PER 4103") return Math.min(96, base + (s.fraudLossEvidence ? 0 : 8) + (s.maxTraffic > 25 ? 4 : 0));
  if (personaId === "PER 4104") return Math.min(96, base + (s.dependencyLoadEvidence ? 0 : 5));
  if (personaId === "PER 4101") return Math.min(96, base + (s.idempotencyEvidence ? 0 : 7));
  return base;
}

/* ------------------------------------------------------------- dimensions -- */

export const impactDimensions = [
  "Mission Alignment", "Customer Impact", "Service Level Impact", "Reliability",
  "Security", "Financial", "Operational", "Dependency", "Risk", "Controls",
  "Policy", "Approval", "Reversibility", "Evidence",
] as const;
export type ImpactDimension = (typeof impactDimensions)[number];

/* ------------------------------------------------------------ core models -- */

export interface CrossTeamImpactMatrixCell {
  id: string;
  analysisId: string;
  matrixMode: "persona-dimension" | "persona-persona";
  rowPersonaId: string;
  columnPersonaId?: string;
  impactDimension?: ImpactDimension;
  direction: ImpactDirection;
  severity: Severity | "None";
  confidence: number;
  summary: string;
  conditionIds: string[];
  dependencyIds: string[];
  evidenceReferenceIds: string[];
  conflictId?: string;
  opportunityId?: string;
  coordinationRequired: boolean;
}

export interface CrossTeamImpactIntersection {
  id: string;
  analysisId: string;
  personaIds: string[];
  sharedEntityId: string;
  impactDimension: ImpactDimension;
  direction: ImpactDirection;
  severity: Severity;
  confidence: number;
  conditionIds: string[];
  dependencyIds: string[];
  riskIds: string[];
  controlIds: string[];
  evidenceReferenceIds: string[];
  status: string;
  summary: string;
}

export interface CrossTeamImpactConflict {
  id: string;
  analysisId: string;
  personaAId: string;
  personaBId: string;
  conflictType: string;
  priorityA: string;
  priorityB: string;
  description: string;
  severity: Severity;
  conditionIds: string[];
  dependencyIds: string[];
  evidenceReferenceIds: string[];
  potentialCoordination: string;
  status: string;
}

export interface CrossTeamImpactAgreement {
  id: string;
  analysisId: string;
  personaIds: string[];
  title: string;
  description: string;
  conditionIds: string[];
  evidenceReferenceIds: string[];
  confidence: number;
  opportunity: string;
}

export interface CrossTeamImpactOpportunity {
  id: string;
  analysisId: string;
  personaIds: string[];
  title: string;
  description: string;
  benefitType: string;
  confidence: number;
  conditionIds: string[];
  evidenceReferenceIds: string[];
  requiredActions: string[];
}

export interface CrossTeamSharedDependency {
  id: string;
  analysisId: string;
  dependencyId: string;
  dependencyName: string;
  dependencyType: string;
  affectedPersonaIds: string[];
  criticality: Severity;
  currentHealth: string;
  impactDirection: ImpactDirection;
  capacitySignal: string;
  failurePropagation: string;
  primaryConcern: string;
  evidenceReferenceIds: string[];
  status: string;
}

export interface CrossTeamMitigationCandidate {
  id: string;
  analysisId: string;
  title: string;
  description: string;
  affectedPersonaIds: string[];
  findingIds: string[];
  conflictIds: string[];
  ownerCandidate: string;
  requiredEvidenceIds: string[];
  priority: Severity;
  status: string;
}

export interface CrossTeamCoordinationAction {
  id: string;
  analysisId: string;
  title: string;
  description: string;
  primaryOwner: string;
  participatingTeamIds: string[];
  reason: string;
  priority: Severity;
  requiredBefore: string;
  evidenceRequirementIds: string[];
  status: string;
}

export interface CrossTeamImpactStage {
  id: string;
  name: string;
  sequence: number;
  status: "Running" | "Warning" | "Blocked" | "Idle";
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

export interface CrossTeamImpactActivity {
  id: string;
  timestamp: string;
  analysisId: string;
  personaIds: string[];
  action: string;
  description: string;
  result: string;
  owner: string;
  auditId: string;
}

export interface CrossTeamImpactAnalysis {
  id: string;
  personaImpactEvaluationId: string;
  intakeId: string;
  workItemId: string;
  workItem: string;
  submittingTeam: string;
  businessUnit: string;
  workType: string;
  status: "Analyzing" | "Review Required" | "Needs Evidence" | "Analysis Complete" | "Blocked";
  owner: string;
  personaIds: string[];
  personaImpactScoreIds: string[];
  matrixCoverage: number;
  highestSeverity: Severity;
  confidence: number;
  intersectionCount: number;
  conflictCount: number;
  opportunityCount: number;
  sharedDependencyCount: number;
  sharedMitigationCount: number;
  coordinationActionCount: number;
  dependencyRisk: Severity;
  conflictState: string;
  currentStageId: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  customerJourney: string;
  region: string;
  environment: string;
}

/* -------------------------------------------------------------- lifecycle -- */

export const lifecycleStages: CrossTeamImpactStage[] = [
  ["CTS 1", "Load Persona Impact Results", "Running", "24 analysis packages loaded", 24, 3, 0, 0],
  ["CTS 2", "Normalize Persona Findings", "Running", "142 findings normalized", 142, 11, 0, 0],
  ["CTS 3", "Map Shared Entities", "Running", "86 shared entities resolved", 86, 6, 0, 0],
  ["CTS 4", "Construct Impact Matrix", "Running", "42 Persona rows · 21 impact dimensions", 42, 2, 0, 0],
  ["CTS 5", "Trace Shared Dependencies", "Warning", "184 paths evaluated · 7 critical shared dependencies", 184, 12, 0, 7],
  ["CTS 6", "Identify Impact Intersections", "Running", "31 material intersections", 31, 5, 0, 2],
  ["CTS 7", "Detect Persona Conflicts", "Warning", "9 conflicts", 9, 2, 0, 4],
  ["CTS 8", "Detect Shared Opportunities", "Running", "14 opportunities", 14, 3, 0, 0],
  ["CTS 9", "Aggregate Mitigations", "Running", "18 shared mitigation candidates", 18, 4, 0, 1],
  ["CTS 10", "Assign Coordination Ownership", "Warning", "4 ownership gaps", 21, 4, 0, 4],
  ["CTS 11", "Evaluate Enterprise Consequences", "Running", "12 material enterprise findings", 12, 3, 0, 1],
  ["CTS 12", "Prepare Decision Context", "Running", "9 complete · 3 pending", 9, 3, 0, 0],
].map(([id, name, status, detail, processed, pending, failed, warning], i) => ({
  id: id as string,
  name: name as string,
  sequence: i + 1,
  status: status as CrossTeamImpactStage["status"],
  detail: detail as string,
  processedCount: processed as number,
  pendingCount: pending as number,
  failedCount: failed as number,
  warningCount: warning as number,
  successRate: 99.6 - i * 0.22 - (status === "Warning" ? 1.4 : 0),
  averageDuration: `${(1.2 + i * 0.35).toFixed(1)}s`,
  p95Duration: `${(2.6 + i * 0.62).toFixed(1)}s`,
  throughput: `${(46 - i * 2.4).toFixed(1)}/min`,
  slaStatus: status === "Warning" ? "At Risk" : "Within SLA",
  owner: ["Enterprise Architecture", "Cognitive Fabric Platform", "Coordination Office"][i % 3],
}));

export const stageById = (id: string) => lifecycleStages.find((s) => s.id === id) ?? lifecycleStages[0];

export const lifecycleCallouts = [
  { id: "CO 1", label: "Fraud Decision Service shared impact is High", tone: "red" as const },
  { id: "CO 2", label: "Release Governance threshold affects three Personas", tone: "amber" as const },
  { id: "CO 3", label: "Identity Services dependency path requires review", tone: "amber" as const },
  { id: "CO 4", label: "Four coordination actions lack confirmed owners", tone: "amber" as const },
];

/* ------------------------------------------------------------------- kpis -- */

export const ctiKpis: IntakeKpi[] = [
  {
    id: "active-analyses", name: "Active Cross Team Analyses", value: "18", change: "+3 this week",
    context: "Cross team analyses currently in flight", status: "Healthy",
    supporting: [{ label: "Healthy", value: "13" }, { label: "Review Required", value: "3" }, { label: "Blocked", value: "2" }],
    trend: [11, 12, 13, 14, 15, 16, 17, 18],
    tooltip: "Cross Team Impact analyses currently open across the enterprise.",
  },
  {
    id: "teams-impacted", name: "Teams Impacted", value: "42", change: "across 18 analyses",
    context: "Distinct Team Personas represented in active analyses", status: "Healthy",
    supporting: [{ label: "Analyses", value: "18" }, { label: "Business Units", value: "5" }],
    trend: [30, 33, 35, 36, 38, 40, 41, 42],
    tooltip: "Distinct Team Personas appearing as rows in active Cross Team Impact matrices.",
  },
  {
    id: "intersections", name: "Material Intersections", value: "31", change: "+6 this week",
    context: "Impacts that intersect across two or more teams", status: "Attention",
    supporting: [{ label: "High", value: "12" }, { label: "Medium", value: "14" }, { label: "Critical", value: "5" }],
    trend: [18, 21, 23, 25, 27, 29, 30, 31],
    tooltip: "Intersections where local Persona impacts become enterprise consequences.",
  },
  {
    id: "conflicts", name: "Cross Team Conflicts", value: "9", change: "+2 this week",
    context: "Persona perspectives with opposing success criteria", status: "Critical",
    supporting: [{ label: "Priority", value: "4" }, { label: "Governance", value: "3" }, { label: "Dependency", value: "2" }],
    trend: [4, 5, 5, 6, 7, 8, 9, 9],
    tooltip: "Conflicts where two Team Personas require different outcomes from the same change.",
  },
  {
    id: "dependencies", name: "Shared Dependencies at Risk", value: "7", change: "+1 this week",
    context: "Shared services carrying multi team exposure", status: "Attention",
    supporting: [{ label: "Critical Services", value: "3" }, { label: "Shared Data", value: "2" }, { label: "Governance", value: "2" }],
    trend: [3, 4, 4, 5, 6, 6, 7, 7],
    tooltip: "Shared dependencies where more than one Persona experiences material exposure.",
  },
  {
    id: "confidence", name: "Coordination Confidence", value: "92%", change: "target 95%",
    context: "Confidence in coordination requirements and ownership", status: "Healthy",
    supporting: [{ label: "Target", value: "95%" }, { label: "Evidence", value: "86%" }],
    trend: [85, 86, 88, 89, 90, 91, 92, 92],
    tooltip: "Confidence that the coordination requirements and ownership assignments are complete.",
  },
];

export const kpiFocusPanel: Record<string, string> = {
  "active-analyses": "panel-queue",
  "teams-impacted": "panel-matrix",
  intersections: "panel-matrix",
  conflicts: "panel-conflicts",
  dependencies: "panel-dependencies",
  confidence: "panel-quality",
};

/* ------------------------------------------------------------------ queue -- */

export const analyses: CrossTeamImpactAnalysis[] = [
  {
    id: "CTA 3001", personaImpactEvaluationId: "PIA 2001", intakeId: "INT 1001", workItemId: "WI 8801",
    workItem: "Checkout Retry Policy Update", submittingTeam: "Checkout Engineering",
    businessUnit: "Digital Commerce", workType: "Policy Change", status: "Review Required",
    owner: "A. Whitfield", personaIds: ctiPersonas.map((p) => p.id),
    personaImpactScoreIds: ctiPersonas.map((p) => `${p.personaImpactEvaluationId}-S`),
    matrixCoverage: 100, highestSeverity: "High", confidence: 94,
    intersectionCount: 9, conflictCount: 3, opportunityCount: 2, sharedDependencyCount: 5,
    sharedMitigationCount: 5, coordinationActionCount: 7, dependencyRisk: "High",
    conflictState: "Active", currentStageId: "CTS 6",
    startedAt: "2026-08-04 09:12", updatedAt: "2026-08-06 14:02",
    customerJourney: "Checkout", region: "NA / EU", environment: "Production",
  },
  {
    id: "CTA 3002", personaImpactEvaluationId: "PIA 2002", intakeId: "INT 1004", workItemId: "WI 8814",
    workItem: "Identity Token Cache Optimization", submittingTeam: "Identity Engineering",
    businessUnit: "Enterprise Platform", workType: "Performance Change", status: "Analyzing",
    owner: "R. Kaur", personaIds: ["PER 4101", "PER 4102", "PER 4104", "PER 4105"],
    personaImpactScoreIds: ["PIA 2105-S"],
    matrixCoverage: 100, highestSeverity: "Medium", confidence: 95,
    intersectionCount: 5, conflictCount: 1, opportunityCount: 3, sharedDependencyCount: 3,
    sharedMitigationCount: 3, coordinationActionCount: 4, dependencyRisk: "Medium",
    conflictState: "Monitoring", currentStageId: "CTS 4",
    startedAt: "2026-08-05 08:40", updatedAt: "2026-08-06 13:44",
    customerJourney: "Sign In", region: "Global", environment: "Production",
  },
  {
    id: "CTA 3003", personaImpactEvaluationId: "PIA 2003", intakeId: "INT 1009", workItemId: "WI 8822",
    workItem: "Regional Token Vault Migration", submittingTeam: "Platform Engineering",
    businessUnit: "Enterprise Platform", workType: "Infrastructure Migration", status: "Needs Evidence",
    owner: "D. Osei", personaIds: [...ctiPersonas.map((p) => p.id), "PER 4107"],
    personaImpactScoreIds: ["PIA 2104-S"],
    matrixCoverage: 92, highestSeverity: "Critical", confidence: 88,
    intersectionCount: 11, conflictCount: 4, opportunityCount: 1, sharedDependencyCount: 6,
    sharedMitigationCount: 4, coordinationActionCount: 8, dependencyRisk: "Critical",
    conflictState: "Active", currentStageId: "CTS 5",
    startedAt: "2026-08-03 16:20", updatedAt: "2026-08-06 11:07",
    customerJourney: "Checkout", region: "EU", environment: "Production",
  },
  {
    id: "CTA 3004", personaImpactEvaluationId: "PIA 2004", intakeId: "INT 1012", workItemId: "WI 8830",
    workItem: "Fraud Decision Timeout Adjustment", submittingTeam: "Fraud Engineering",
    businessUnit: "Risk & Compliance", workType: "Threshold Change", status: "Analyzing",
    owner: "M. Alvarez", personaIds: ["PER 4101", "PER 4102", "PER 4103", "PER 4104", "PER 4106"],
    personaImpactScoreIds: ["PIA 2103-S"],
    matrixCoverage: 100, highestSeverity: "High", confidence: 92,
    intersectionCount: 7, conflictCount: 2, opportunityCount: 2, sharedDependencyCount: 4,
    sharedMitigationCount: 4, coordinationActionCount: 5, dependencyRisk: "High",
    conflictState: "Active", currentStageId: "CTS 7",
    startedAt: "2026-08-05 11:05", updatedAt: "2026-08-06 12:31",
    customerJourney: "Checkout", region: "NA", environment: "Production",
  },
  {
    id: "CTA 3005", personaImpactEvaluationId: "PIA 2005", intakeId: "INT 1015", workItemId: "WI 8841",
    workItem: "Checkout Observability Expansion", submittingTeam: "Site Reliability Engineering",
    businessUnit: "Enterprise Platform", workType: "Observability Change", status: "Analysis Complete",
    owner: "T. Nakamura", personaIds: ["PER 4102", "PER 4104", "PER 4101"],
    personaImpactScoreIds: ["PIA 2104-S"],
    matrixCoverage: 100, highestSeverity: "Low", confidence: 97,
    intersectionCount: 3, conflictCount: 0, opportunityCount: 4, sharedDependencyCount: 2,
    sharedMitigationCount: 2, coordinationActionCount: 2, dependencyRisk: "Low",
    conflictState: "None", currentStageId: "CTS 12",
    startedAt: "2026-08-01 10:00", updatedAt: "2026-08-05 17:12", completedAt: "2026-08-05 17:12",
    customerJourney: "Checkout", region: "Global", environment: "Production",
  },
];

export const analysisById = (id: string) => analyses.find((a) => a.id === id) ?? analyses[0];

export const queueColumns = [
  "Analysis ID", "Work Item", "Submitting Team", "Teams Evaluated", "Matrix Coverage",
  "Highest Severity", "Conflicts", "Shared Dependencies", "Shared Opportunities",
  "Coordination Actions", "Confidence", "Current Stage", "Owner", "Status", "Actions",
];

/* ---------------------------------------------------------------- filters -- */

export const filterOptions = {
  businessUnit: ["All", "Digital Commerce", "Enterprise Platform", "Risk & Compliance"],
  submittingTeam: ["All", ...Array.from(new Set(analyses.map((a) => a.submittingTeam)))],
  affectedTeam: ["All", ...ctiPersonas.map((p) => p.name)],
  teamPersona: ["All", ...ctiPersonas.map((p) => p.name)],
  knowledgeDomain: ["All", "Payments", "Identity", "Fraud", "Reliability", "Governance"],
  workType: ["All", "Policy Change", "Performance Change", "Infrastructure Migration", "Threshold Change", "Observability Change"],
  impactDimension: ["All", ...impactDimensions],
  impactDirection: ["All", "Positive", "Neutral", "Negative", "Mixed", "Review Required"],
  impactSeverity: ["All", ...severityOrder],
  riskLevel: ["All", ...severityOrder],
  conflictType: ["All", "Priority Conflict", "Governance Conflict", "Dependency Conflict"],
  opportunityType: ["All", "Customer Outcome", "Operational Learning", "Dependency Insight"],
  dependencyCriticality: ["All", ...severityOrder],
  customerJourney: ["All", "Checkout", "Sign In", "Refunds"],
  system: ["All", "Payments API", "Retry Orchestrator", "Checkout Service"],
  service: ["All", "Fraud Decision Service", "Identity Services", "Regional Token Vault"],
  product: ["All", "Digital Checkout", "Enterprise Identity"],
  approvalRequirement: ["All", "Joint Approval", "Governance Approval", "None"],
  reviewStatus: ["All", "Pending Review", "In Review", "Reviewed", "Not Required"],
  evidenceCoverage: ["All", "Below 85%", "85-95%", "Above 95%"],
  confidenceBand: ["All", "Below 85%", "85-92%", "Above 92%"],
  environment: ["All", "Production", "Staging"],
  region: ["All", "NA", "EU", "NA / EU", "Global"],
  analysisOwner: ["All", ...Array.from(new Set(analyses.map((a) => a.owner)))],
  timeRange: ["Last 24 hours", "Last 7 days", "Last 30 days", "Quarter to date"],
};

export type FilterKey = keyof typeof filterOptions;

export const defaultFilters: Record<FilterKey, string> = Object.fromEntries(
  (Object.keys(filterOptions) as FilterKey[]).map((k) => [k, k === "timeRange" ? "Last 7 days" : "All"]),
) as Record<FilterKey, string>;

export const activeFilterCount = (f: Record<FilterKey, string>) =>
  (Object.keys(f) as FilterKey[]).filter((k) => k !== "timeRange" && f[k] !== "All").length;

/* ------------------------------------------------------------- conditions -- */

export interface CtiCondition {
  id: string;
  label: string;
  detail: string;
  source: string;
  personaIds: string[];
  authority: string;
  status: string;
}

export const sharedConditions: CtiCondition[] = [
  { id: "BC 5101", label: "Availability >= 99.95%", detail: "Payments API availability may not fall below 99.95% in any rolling hour.", source: "Payments Service Level Standard", personaIds: ["PER 4101", "PER 4104"], authority: "Payments Reliability", status: "Applicable" },
  { id: "BC 5102", label: "Latency < 250 ms", detail: "Checkout authorization path must stay under 250 ms at p95.", source: "Checkout Experience Standard", personaIds: ["PER 4102", "PER 4105"], authority: "Checkout Engineering", status: "Applicable" },
  { id: "BC 5103", label: "Approval required above 10% traffic", detail: "Traffic exposure above 10% requires joint approval from Payments Reliability and Fraud Engineering.", source: "Release Governance Policy", personaIds: ["PER 4101", "PER 4103", "PER 4106"], authority: "Release Governance", status: "Conditional" },
  { id: "BC 5104", label: "Idempotency requirement", detail: "Any retry expansion must prove idempotent authorization behaviour.", source: "Payment Integrity Control", personaIds: ["PER 4101", "PER 4102", "PER 4104"], authority: "Payments Platform", status: "Applicable" },
  { id: "BC 5105", label: "Quarter end change restriction", detail: "Material production change is restricted during the quarter end freeze window.", source: "Change Management Policy", personaIds: ["PER 4106", "PER 4104"], authority: "Release Governance", status: "Conditional" },
  { id: "BC 5106", label: "Fraud timeout degradation rule", detail: "Fraud Decision Service timeouts degrade to conservative decisioning above defined volume.", source: "Fraud Operating Standard", personaIds: ["PER 4103", "PER 4101"], authority: "Fraud Engineering", status: "Applicable" },
];

export const conditionById = (id: string) => sharedConditions.find((c) => c.id === id) ?? sharedConditions[0];

/* --------------------------------------------------------------- evidence -- */

export interface CtiEvidence {
  id: string;
  label: string;
  type: string;
  authority: string;
  recency: string;
  status: "Provided" | "Missing" | "Aging";
  personaIds: string[];
}

export const evidenceRecords: CtiEvidence[] = [
  { id: "EV 7101", label: "Prior retry policy outcome record", type: "Outcome Record", authority: "Organizational Learning", recency: "14 days", status: "Provided", personaIds: ["PER 4101", "PER 4102"] },
  { id: "EV 7102", label: "Fraud loss analysis for retry expansion", type: "Analysis", authority: "Fraud Engineering", recency: "3 days", status: "Provided", personaIds: ["PER 4103"] },
  { id: "EV 7103", label: "Idempotency validation report", type: "Validation", authority: "Payments Platform", recency: "9 days", status: "Provided", personaIds: ["PER 4101", "PER 4104"] },
  { id: "EV 7104", label: "Dependency load test results", type: "Test Result", authority: "Site Reliability Engineering", recency: "—", status: "Missing", personaIds: ["PER 4104", "PER 4105"] },
  { id: "EV 7105", label: "Identity capacity headroom telemetry", type: "Telemetry", authority: "Identity Engineering", recency: "41 days", status: "Aging", personaIds: ["PER 4105"] },
  { id: "EV 7106", label: "Release governance approval record", type: "Approval", authority: "Release Governance", recency: "2 days", status: "Provided", personaIds: ["PER 4106"] },
];

export const evidenceById = (id: string) => evidenceRecords.find((e) => e.id === id) ?? evidenceRecords[0];

export function evidenceState(s: CtiAnalysisState): CtiEvidence[] {
  return evidenceRecords.map((e) => {
    if (e.id === "EV 7102" && !s.fraudLossEvidence) return { ...e, status: "Missing" as const, recency: "—" };
    if (e.id === "EV 7103" && !s.idempotencyEvidence) return { ...e, status: "Missing" as const, recency: "—" };
    if (e.id === "EV 7104" && s.dependencyLoadEvidence) return { ...e, status: "Provided" as const, recency: "1 day" };
    return e;
  });
}

/* ---------------------------------------------------- shared dependencies -- */

export const sharedDependencies: CrossTeamSharedDependency[] = [
  {
    id: "CSD 6101", analysisId: "CTA 3001", dependencyId: "SVC 301", dependencyName: "Fraud Decision Service",
    dependencyType: "Decision Service", affectedPersonaIds: ["PER 4101", "PER 4102", "PER 4103", "PER 4104"],
    criticality: "High", currentHealth: "Degraded", impactDirection: "Negative",
    capacitySignal: "72% of tested peak", failurePropagation: "Timeouts degrade to conservative decisioning, checkout declines rise",
    primaryConcern: "Increased retry volume and fraud latency",
    evidenceReferenceIds: ["EV 7102", "EV 7101"], status: "Review Required",
  },
  {
    id: "CSD 6102", analysisId: "CTA 3001", dependencyId: "SVC 302", dependencyName: "Identity Services",
    dependencyType: "Platform Service", affectedPersonaIds: ["PER 4101", "PER 4102", "PER 4105", "PER 4104"],
    criticality: "High", currentHealth: "Healthy", impactDirection: "Negative",
    capacitySignal: "64% of tested peak", failurePropagation: "Validation latency amplifies checkout p95",
    primaryConcern: "Validation latency and capacity",
    evidenceReferenceIds: ["EV 7105", "EV 7104"], status: "Needs Evidence",
  },
  {
    id: "CSD 6103", analysisId: "CTA 3001", dependencyId: "SVC 303", dependencyName: "Regional Token Vault",
    dependencyType: "Data Service", affectedPersonaIds: ["PER 4101", "PER 4104"],
    criticality: "High", currentHealth: "Healthy", impactDirection: "Mixed",
    capacitySignal: "Regional failover untested this quarter", failurePropagation: "Regional unavailability blocks authorization replay",
    primaryConcern: "Regional availability and failover",
    evidenceReferenceIds: ["EV 7104"], status: "Monitoring",
  },
  {
    id: "CSD 6104", analysisId: "CTA 3001", dependencyId: "SVC 304", dependencyName: "Retry Orchestrator",
    dependencyType: "Application Service", affectedPersonaIds: ["PER 4101", "PER 4102"],
    criticality: "Medium", currentHealth: "Healthy", impactDirection: "Positive",
    capacitySignal: "Within tested envelope", failurePropagation: "Retry stalls fall back to single attempt",
    primaryConcern: "Retry scheduling correctness",
    evidenceReferenceIds: ["EV 7101"], status: "Operational",
  },
  {
    id: "CSD 6105", analysisId: "CTA 3001", dependencyId: "GOV 401", dependencyName: "Release Approval Workflow",
    dependencyType: "Governance Dependency", affectedPersonaIds: ["PER 4101", "PER 4103", "PER 4106"],
    criticality: "Medium", currentHealth: "Healthy", impactDirection: "Review Required",
    capacitySignal: "Approval lead time 2 business days", failurePropagation: "Rollout beyond threshold blocked until approval recorded",
    primaryConcern: "Approval threshold activation above 10% traffic",
    evidenceReferenceIds: ["EV 7106"], status: "Conditional",
  },
];

export function dependenciesFor(s: CtiAnalysisState): CrossTeamSharedDependency[] {
  return sharedDependencies.map((d) => {
    if (d.id === "CSD 6101" && !s.fraudLossEvidence) return { ...d, criticality: "Critical" as Severity, status: "Needs Evidence" };
    if (d.id === "CSD 6102" && s.dependencyLoadEvidence) return { ...d, status: "Monitoring" };
    if (d.id === "CSD 6105") return { ...d, status: governanceActive(s) ? "Review Required" : "Conditional", criticality: governanceActive(s) ? ("High" as Severity) : ("Medium" as Severity) };
    return d;
  });
}

/* -------------------------------------------------------------- conflicts -- */

export function conflictsFor(s: CtiAnalysisState): CrossTeamImpactConflict[] {
  const gov = governanceActive(s);
  const qe = quarterEnd(s);
  const list: CrossTeamImpactConflict[] = [
    {
      id: "CTC 7001", analysisId: "CTA 3001", personaAId: "PER 4102", personaBId: "PER 4103",
      conflictType: "Priority Conflict", priorityA: "Customer completion", priorityB: "Fraud exposure containment",
      description: "Checkout favours recovering abandoned authorizations while Fraud favours conservative retry expansion until fraud loss evidence exists.",
      severity: s.fraudLossEvidence ? "High" : "Critical",
      conditionIds: ["BC 5106", "BC 5103"], dependencyIds: ["CSD 6101"],
      evidenceReferenceIds: s.fraudLossEvidence ? ["EV 7102"] : [],
      potentialCoordination: "Fraud Loss Validation before traffic exceeds 10%",
      status: s.fraudLossEvidence ? "Open" : "Needs Evidence",
    },
    {
      id: "CTC 7002", analysisId: "CTA 3001", personaAId: "PER 4101", personaBId: "PER 4106",
      conflictType: "Governance Conflict", priorityA: "Rollout expansion speed", priorityB: "Approval threshold enforcement",
      description: "Payments wants to expand exposure quickly to prove recovery benefit; Release Governance requires joint approval above 10% traffic.",
      severity: qe ? "Critical" : gov ? "High" : "Low",
      conditionIds: qe ? ["BC 5103", "BC 5105"] : ["BC 5103"], dependencyIds: ["CSD 6105"],
      evidenceReferenceIds: ["EV 7106"],
      potentialCoordination: "Joint approval before exceeding 10% traffic",
      status: gov ? "Open" : "Not Required",
    },
    {
      id: "CTC 7003", analysisId: "CTA 3001", personaAId: "PER 4102", personaBId: "PER 4104",
      conflictType: "Dependency Conflict", priorityA: "Aggressive retry recovery", priorityB: "Dependency protection",
      description: "Additional retry attempts increase downstream call volume on services SRE must protect during peak.",
      severity: s.dependencyLoadEvidence ? "Low" : "Medium",
      conditionIds: ["BC 5101"], dependencyIds: ["CSD 6101", "CSD 6102"],
      evidenceReferenceIds: s.dependencyLoadEvidence ? ["EV 7104"] : [],
      potentialCoordination: "Dependency load validation before 25% rollout",
      status: s.dependencyLoadEvidence ? "Mitigated" : "Open",
    },
    {
      id: "CTC 7004", analysisId: "CTA 3001", personaAId: "PER 4101", personaBId: "PER 4105",
      conflictType: "Dependency Conflict", priorityA: "Recovery volume", priorityB: "Identity service capacity",
      description: "Recovery volume raises token validation calls beyond the capacity envelope Identity currently evidences.",
      severity: "Medium",
      conditionIds: ["BC 5102"], dependencyIds: ["CSD 6102"],
      evidenceReferenceIds: ["EV 7105"],
      potentialCoordination: "Shared capacity headroom review",
      status: "Open",
    },
  ];
  return list;
}

export const conflictColumns = [
  "Persona A", "Persona B", "Conflict Type", "Priority A", "Priority B", "Conditions",
  "Shared Dependency", "Severity", "Evidence", "Potential Coordination", "Status",
];

/* ------------------------------------------------------------- agreements -- */

export const agreements: CrossTeamImpactAgreement[] = [
  { id: "CTG 8001", analysisId: "CTA 3001", personaIds: ["PER 4101", "PER 4102", "PER 4104"], title: "Progressive rollout is preferable to immediate broad deployment", description: "All three Personas accept staged exposure as the lowest risk path to production evidence.", conditionIds: ["BC 5103"], evidenceReferenceIds: ["EV 7101"], confidence: 95, opportunity: "Coordination is straightforward" },
  { id: "CTG 8002", analysisId: "CTA 3001", personaIds: ["PER 4101", "PER 4102", "PER 4104"], title: "Rollback threshold is required", description: "A quantified rollback trigger must exist before production exposure.", conditionIds: ["BC 5101"], evidenceReferenceIds: ["EV 7101"], confidence: 93, opportunity: "Single shared control satisfies three Personas" },
  { id: "CTG 8003", analysisId: "CTA 3001", personaIds: ["PER 4101", "PER 4102", "PER 4104"], title: "Idempotency validation is required", description: "Retry expansion may not proceed without proven idempotent authorization.", conditionIds: ["BC 5104"], evidenceReferenceIds: ["EV 7103"], confidence: 97, opportunity: "Removes the payment integrity objection" },
  { id: "CTG 8004", analysisId: "CTA 3001", personaIds: ["PER 4104", "PER 4105", "PER 4103"], title: "Dependency health must be measured", description: "Shared dependency health signals must be observable throughout rollout.", conditionIds: ["BC 5101", "BC 5102"], evidenceReferenceIds: ["EV 7104"], confidence: 90, opportunity: "One monitoring investment serves three teams" },
  { id: "CTG 8005", analysisId: "CTA 3001", personaIds: ["PER 4101", "PER 4103", "PER 4106"], title: "Traffic expansion requires production evidence", description: "Exposure increases only after each stage produces measured evidence.", conditionIds: ["BC 5103"], evidenceReferenceIds: ["EV 7106"], confidence: 92, opportunity: "Aligns governance and delivery cadence" },
  { id: "CTG 8006", analysisId: "CTA 3001", personaIds: ["PER 4103", "PER 4101"], title: "Material fraud changes require monitoring", description: "Fraud loss monitoring must be active for the duration of the rollout.", conditionIds: ["BC 5106"], evidenceReferenceIds: ["EV 7102"], confidence: 91, opportunity: "Shared monitoring reduces conflict severity" },
];

/* ---------------------------------------------------------- opportunities -- */

export const opportunities: CrossTeamImpactOpportunity[] = [
  { id: "CTO 9001", analysisId: "CTA 3001", personaIds: ["PER 4102", "PER 4101"], title: "Improved Checkout Completion", description: "Recoverable authorization failures complete without customer re-entry.", benefitType: "Customer Outcome", confidence: 91, conditionIds: ["BC 5102"], evidenceReferenceIds: ["EV 7101"], requiredActions: ["Measure completion delta per rollout stage"] },
  { id: "CTO 9002", analysisId: "CTA 3001", personaIds: ["PER 4101", "PER 4104", "PER 4102"], title: "Operational Learning Reuse", description: "Rollout evidence becomes a reusable pattern for future retry and recovery changes.", benefitType: "Operational Learning", confidence: 94, conditionIds: ["BC 5104"], evidenceReferenceIds: ["EV 7101", "EV 7103"], requiredActions: ["Publish outcome record to Organizational Learning"] },
  { id: "CTO 9003", analysisId: "CTA 3001", personaIds: ["PER 4104", "PER 4105", "PER 4103", "PER 4101"], title: "Improved Dependency Monitoring", description: "Shared dependency instrumentation added for this change benefits four Personas permanently.", benefitType: "Dependency Insight", confidence: 89, conditionIds: ["BC 5101"], evidenceReferenceIds: ["EV 7104"], requiredActions: ["Promote dependency dashboards to standard operating view"] },
];

/* ------------------------------------------------------------ mitigations -- */

export const mitigationCandidates: CrossTeamMitigationCandidate[] = [
  { id: "CTM 1001", analysisId: "CTA 3001", title: "Progressive Rollout", description: "Stage traffic exposure with measured evidence at each step.", affectedPersonaIds: ["PER 4101", "PER 4103", "PER 4104"], findingIds: ["CTI 1", "CTI 4"], conflictIds: ["CTC 7002"], ownerCandidate: "Checkout Engineering", requiredEvidenceIds: ["EV 7101"], priority: "High", status: "Candidate" },
  { id: "CTM 1002", analysisId: "CTA 3001", title: "Idempotency Validation", description: "Prove idempotent authorization behaviour before any production exposure.", affectedPersonaIds: ["PER 4101", "PER 4102", "PER 4104"], findingIds: ["CTI 2"], conflictIds: [], ownerCandidate: "Payments Platform", requiredEvidenceIds: ["EV 7103"], priority: "Critical", status: "Candidate" },
  { id: "CTM 1003", analysisId: "CTA 3001", title: "Dependency Load Test", description: "Validate shared dependency capacity at projected retry volume.", affectedPersonaIds: ["PER 4104", "PER 4105", "PER 4103", "PER 4101"], findingIds: ["CTI 5"], conflictIds: ["CTC 7003", "CTC 7004"], ownerCandidate: "Site Reliability Engineering", requiredEvidenceIds: ["EV 7104"], priority: "High", status: "Candidate" },
  { id: "CTM 1004", analysisId: "CTA 3001", title: "Fraud Loss Monitoring", description: "Continuous fraud loss measurement across the rollout window.", affectedPersonaIds: ["PER 4103", "PER 4101", "PER 4102"], findingIds: ["CTI 3"], conflictIds: ["CTC 7001"], ownerCandidate: "Fraud Engineering", requiredEvidenceIds: ["EV 7102"], priority: "High", status: "Candidate" },
  { id: "CTM 1005", analysisId: "CTA 3001", title: "Joint Approval Before >10%", description: "Record joint approval from Payments Reliability and Fraud Engineering before exceeding the threshold.", affectedPersonaIds: ["PER 4106", "PER 4101", "PER 4103"], findingIds: ["CTI 4"], conflictIds: ["CTC 7002"], ownerCandidate: "Release Governance", requiredEvidenceIds: ["EV 7106"], priority: "High", status: "Candidate" },
];

/* --------------------------------------------------- coordination actions -- */

export const coordinationActions: CrossTeamCoordinationAction[] = [
  { id: "CCA 1101", analysisId: "CTA 3001", title: "Fraud Loss Validation", description: "Confirm fraud loss exposure under the proposed retry envelope.", primaryOwner: "Fraud Engineering", participatingTeamIds: ["PER 4102", "PER 4101"], reason: "Retry expansion changes fraud exposure profile", priority: "High", requiredBefore: "Traffic above 10%", evidenceRequirementIds: ["EV 7102"], status: "In Progress" },
  { id: "CCA 1102", analysisId: "CTA 3001", title: "Idempotency Validation", description: "Demonstrate idempotent authorization under repeated attempts.", primaryOwner: "Payments Platform", participatingTeamIds: ["PER 4102", "PER 4104"], reason: "Duplicate authorization is a payment integrity risk", priority: "Critical", requiredBefore: "Initial rollout", evidenceRequirementIds: ["EV 7103"], status: "Complete" },
  { id: "CCA 1103", analysisId: "CTA 3001", title: "Dependency Load Validation", description: "Load test shared dependencies at projected retry volume.", primaryOwner: "Site Reliability Engineering", participatingTeamIds: ["PER 4105", "PER 4103"], reason: "Shared dependency saturation propagates across four Personas", priority: "High", requiredBefore: "25% rollout", evidenceRequirementIds: ["EV 7104"], status: "Owner Unconfirmed" },
  { id: "CCA 1104", analysisId: "CTA 3001", title: "Joint Approval", description: "Record joint approval prior to exceeding the governance threshold.", primaryOwner: "Release Governance", participatingTeamIds: ["PER 4101", "PER 4103"], reason: "Policy activates above 10% traffic exposure", priority: "High", requiredBefore: "Traffic above 10%", evidenceRequirementIds: ["EV 7106"], status: "Pending" },
  { id: "CCA 1105", analysisId: "CTA 3001", title: "Rollback Threshold", description: "Define and publish the quantified rollback trigger.", primaryOwner: "Checkout Engineering", participatingTeamIds: ["PER 4101", "PER 4104"], reason: "All Personas require a reversible rollout", priority: "High", requiredBefore: "Production rollout", evidenceRequirementIds: ["EV 7101"], status: "In Progress" },
];

export function coordinationActionsFor(s: CtiAnalysisState): CrossTeamCoordinationAction[] {
  return coordinationActions
    .filter((a) => a.id !== "CCA 1104" || governanceActive(s))
    .map((a) => {
      if (a.id === "CCA 1101" && !s.fraudLossEvidence) return { ...a, priority: "Critical" as Severity, status: "Blocked" };
      if (a.id === "CCA 1103" && s.dependencyLoadEvidence) return { ...a, status: "Complete" };
      if (a.id === "CCA 1102" && !s.idempotencyEvidence) return { ...a, status: "Blocked" };
      return a;
    });
}

/* --------------------------------------------------------- shared context -- */

export const sharedContext = {
  systems: ["Payments API", "Retry Orchestrator", "Checkout Service"],
  dependencies: ["Fraud Decision Service", "Identity Services", "Regional Token Vault"],
  customerJourney: "Checkout",
  risks: ["Duplicate Authorization", "Fraud Exposure", "Latency Amplification", "Dependency Saturation", "Customer Abandonment"],
  controls: ["Idempotency Validation", "Traffic Segmentation", "Progressive Rollout", "Automated Rollback", "Dependency Health Monitoring"],
};

export const proposedChange = {
  title: "Checkout Retry Policy Update",
  intent: "Recover transient authorization failures without customer re-entry",
  currentState: "Single authorization attempt, no orchestrated retry",
  proposedState: "Up to three orchestrated retries with backoff and idempotency key",
  rollout: "Progressive: 5% → 10% → 25% → 50%",
  primarySystems: ["Payments API", "Retry Orchestrator"],
  customerJourney: "Checkout",
};

/* -------------------------------------------------------- matrix builders -- */

interface CellSeed {
  persona: string;
  dimension: ImpactDimension;
  direction: ImpactDirection;
  severity: Severity | "None";
  summary: string;
  conditions?: string[];
  dependencies?: string[];
  evidence?: string[];
  conflictId?: string;
  opportunityId?: string;
}

const dimensionSeeds: CellSeed[] = [
  // Payments Platform
  { persona: "PER 4101", dimension: "Customer Impact", direction: "Positive", severity: "Medium", summary: "Recoverable authorizations complete without customer re-entry.", conditions: ["BC 5102"], evidence: ["EV 7101"], opportunityId: "CTO 9001" },
  { persona: "PER 4101", dimension: "Reliability", direction: "Negative", severity: "High", summary: "Retry amplification stresses the authorization path during incident conditions.", conditions: ["BC 5101"], dependencies: ["CSD 6104"], evidence: ["EV 7101"] },
  { persona: "PER 4101", dimension: "Dependency", direction: "Negative", severity: "Medium", summary: "Retry volume increases load on Fraud Decision Service and Identity Services.", dependencies: ["CSD 6101", "CSD 6102"] },
  { persona: "PER 4101", dimension: "Risk", direction: "Negative", severity: "High", summary: "Duplicate authorization exposure without proven idempotency.", conditions: ["BC 5104"], evidence: ["EV 7103"] },
  { persona: "PER 4101", dimension: "Approval", direction: "Review Required", severity: "High", summary: "Joint approval activates above the governance traffic threshold.", conditions: ["BC 5103"], conflictId: "CTC 7002" },
  { persona: "PER 4101", dimension: "Reversibility", direction: "Positive", severity: "Medium", summary: "Automated rollback restores single attempt behaviour immediately.", conditions: ["BC 5101"] },
  { persona: "PER 4101", dimension: "Financial", direction: "Mixed", severity: "Medium", summary: "Recovered revenue offset against fraud loss and dependency cost.", dependencies: ["CSD 6101"] },
  // Checkout Engineering
  { persona: "PER 4102", dimension: "Customer Impact", direction: "Positive", severity: "High", summary: "Checkout completion improves on transient failure paths.", conditions: ["BC 5102"], evidence: ["EV 7101"], opportunityId: "CTO 9001" },
  { persona: "PER 4102", dimension: "Reliability", direction: "Mixed", severity: "Medium", summary: "Recovery improves outcomes but adds latency on retry-heavy paths.", conditions: ["BC 5102"] },
  { persona: "PER 4102", dimension: "Dependency", direction: "Negative", severity: "Medium", summary: "Checkout inherits downstream saturation risk from retry volume.", dependencies: ["CSD 6101", "CSD 6102"], conflictId: "CTC 7003" },
  { persona: "PER 4102", dimension: "Risk", direction: "Negative", severity: "Medium", summary: "Conversion gain is coupled to fraud exposure increase.", conflictId: "CTC 7001", dependencies: ["CSD 6101"] },
  { persona: "PER 4102", dimension: "Approval", direction: "Neutral", severity: "None", summary: "No Checkout specific approval requirement activates." },
  { persona: "PER 4102", dimension: "Reversibility", direction: "Positive", severity: "Medium", summary: "Feature flag allows immediate reversal per traffic segment." },
  { persona: "PER 4102", dimension: "Service Level Impact", direction: "Mixed", severity: "Medium", summary: "p95 latency budget consumed by additional attempts.", conditions: ["BC 5102"] },
  // Fraud Engineering
  { persona: "PER 4103", dimension: "Customer Impact", direction: "Mixed", severity: "Medium", summary: "Recovered transactions include a proportion of fraudulent retries.", dependencies: ["CSD 6101"] },
  { persona: "PER 4103", dimension: "Financial", direction: "Negative", severity: "High", summary: "Fraud loss exposure increases with retry attempts per transaction.", conditions: ["BC 5106"], evidence: ["EV 7102"], conflictId: "CTC 7001" },
  { persona: "PER 4103", dimension: "Dependency", direction: "Negative", severity: "High", summary: "Fraud Decision Service volume rises materially under retry expansion.", dependencies: ["CSD 6101"] },
  { persona: "PER 4103", dimension: "Risk", direction: "Negative", severity: "High", summary: "Timeout degradation shifts decisioning to conservative mode.", conditions: ["BC 5106"] },
  { persona: "PER 4103", dimension: "Approval", direction: "Review Required", severity: "High", summary: "Fraud Engineering is a required joint approver above the threshold.", conditions: ["BC 5103"], conflictId: "CTC 7002" },
  { persona: "PER 4103", dimension: "Evidence", direction: "Review Required", severity: "High", summary: "Fraud loss analysis is the gating evidence for expansion.", evidence: ["EV 7102"] },
  // SRE
  { persona: "PER 4104", dimension: "Reliability", direction: "Negative", severity: "Medium", summary: "Retry storms interact badly with existing incident conditions.", conditions: ["BC 5101"] },
  { persona: "PER 4104", dimension: "Operational", direction: "Negative", severity: "High", summary: "Additional operating surface, alerts, and rollout supervision.", dependencies: ["CSD 6101", "CSD 6102"] },
  { persona: "PER 4104", dimension: "Dependency", direction: "Negative", severity: "High", summary: "Four shared dependencies absorb the amplified call volume.", dependencies: ["CSD 6101", "CSD 6102", "CSD 6103"], conflictId: "CTC 7003" },
  { persona: "PER 4104", dimension: "Controls", direction: "Review Required", severity: "Medium", summary: "Rollback automation and dependency health monitoring must be in place.", conditions: ["BC 5101"], evidence: ["EV 7104"] },
  { persona: "PER 4104", dimension: "Reversibility", direction: "Positive", severity: "High", summary: "Automated rollback path is well established for this service.", },
  { persona: "PER 4104", dimension: "Evidence", direction: "Review Required", severity: "High", summary: "Dependency load test results are not yet available.", evidence: ["EV 7104"] },
  // Identity Engineering
  { persona: "PER 4105", dimension: "Service Level Impact", direction: "Negative", severity: "Medium", summary: "Token validation latency rises with recovery volume.", conditions: ["BC 5102"], dependencies: ["CSD 6102"] },
  { persona: "PER 4105", dimension: "Dependency", direction: "Negative", severity: "Medium", summary: "Identity Services capacity headroom is consumed by retry validation.", dependencies: ["CSD 6102"], conflictId: "CTC 7004" },
  { persona: "PER 4105", dimension: "Operational", direction: "Negative", severity: "Low", summary: "Additional monitoring and capacity review effort.", evidence: ["EV 7105"] },
  { persona: "PER 4105", dimension: "Customer Impact", direction: "Neutral", severity: "None", summary: "No direct customer facing change for Identity." },
  // Release Governance (dynamic)
  { persona: "PER 4106", dimension: "Policy", direction: "Review Required", severity: "High", summary: "Approval policy activates above 10% traffic exposure.", conditions: ["BC 5103"], conflictId: "CTC 7002" },
  { persona: "PER 4106", dimension: "Approval", direction: "Review Required", severity: "High", summary: "Joint approval from Payments Reliability and Fraud Engineering is required.", conditions: ["BC 5103"], evidence: ["EV 7106"], conflictId: "CTC 7002" },
  { persona: "PER 4106", dimension: "Controls", direction: "Review Required", severity: "Medium", summary: "Change window restriction applies during the quarter end freeze.", conditions: ["BC 5105"] },
  { persona: "PER 4106", dimension: "Evidence", direction: "Positive", severity: "Low", summary: "Rollout evidence is captured at every stage.", evidence: ["EV 7106"] },
];

export function buildDimensionMatrix(state: CtiAnalysisState, analysisId = "CTA 3001"): CrossTeamImpactMatrixCell[] {
  const gov = governanceActive(state);
  const qe = quarterEnd(state);
  return dimensionSeeds.map((seed, i) => {
    let direction = seed.direction;
    let severity = seed.severity;
    let summary = seed.summary;
    const evidence = [...(seed.evidence ?? [])];

    if (seed.persona === "PER 4106") {
      if (!gov) {
        if (seed.dimension === "Policy" || seed.dimension === "Approval") {
          direction = "Neutral"; severity = "Low";
          summary = `${summary} Currently inactive at ${state.maxTraffic}% traffic exposure.`;
        }
      } else {
        severity = "High";
        summary = `${summary} Active at ${state.maxTraffic}% traffic exposure.`;
      }
      if (seed.dimension === "Controls") {
        severity = qe ? "High" : "Low";
        direction = qe ? "Review Required" : "Neutral";
        summary = qe
          ? "Quarter end change restriction is active; material change requires an exception."
          : "Change window restriction does not apply to the selected deployment timing.";
      }
    }

    if (seed.persona === "PER 4103" && !state.fraudLossEvidence) {
      if (seed.dimension === "Evidence" || seed.dimension === "Financial") {
        severity = "Critical";
        summary = `${summary} Fraud loss analysis is currently missing.`;
      }
    }
    if (seed.persona === "PER 4101" && seed.dimension === "Risk" && !state.idempotencyEvidence) {
      severity = "Critical";
      summary = `${summary} Idempotency validation is currently missing.`;
    }
    if (seed.persona === "PER 4104" && seed.dimension === "Evidence" && state.dependencyLoadEvidence) {
      direction = "Positive"; severity = "Low";
      summary = "Dependency load test results have been provided.";
    }
    if (seed.persona === "PER 4101" && seed.dimension === "Approval") {
      severity = gov ? "High" : "Low";
      direction = gov ? "Review Required" : "Neutral";
    }

    return {
      id: `CTM-D-${i + 1}`,
      analysisId,
      matrixMode: "persona-dimension" as const,
      rowPersonaId: seed.persona,
      impactDimension: seed.dimension,
      direction,
      severity,
      confidence: 88 + ((i * 7) % 9),
      summary,
      conditionIds: seed.conditions ?? [],
      dependencyIds: seed.dependencies ?? [],
      evidenceReferenceIds: evidence,
      conflictId: seed.conflictId,
      opportunityId: seed.opportunityId,
      coordinationRequired: direction === "Review Required" || severity === "High" || severity === "Critical",
    };
  });
}

interface PairSeed {
  a: string; b: string; summary: string; severity: Severity;
  conflictId?: string; opportunityId?: string;
  conditions: string[]; dependencies: string[]; mitigation?: string;
}

const pairSeeds: PairSeed[] = [
  { a: "PER 4101", b: "PER 4102", summary: "Shared goal to improve checkout completion through recoverable authorization.", severity: "Medium", opportunityId: "CTO 9001", conditions: ["BC 5102"], dependencies: ["CSD 6104"], mitigation: "Progressive Rollout" },
  { a: "PER 4101", b: "PER 4103", summary: "Retry behaviour affects payment integrity and fraud exposure simultaneously.", severity: "High", conflictId: "CTC 7001", conditions: ["BC 5103", "BC 5106", "BC 5104"], dependencies: ["CSD 6101"], mitigation: "Fraud Loss Monitoring" },
  { a: "PER 4101", b: "PER 4104", summary: "Rollout and rollback controls are jointly owned.", severity: "Medium", conditions: ["BC 5101", "BC 5104"], dependencies: ["CSD 6103"], mitigation: "Progressive Rollout" },
  { a: "PER 4101", b: "PER 4105", summary: "Recovery volume consumes Identity capacity headroom.", severity: "Medium", conflictId: "CTC 7004", conditions: ["BC 5102"], dependencies: ["CSD 6102"], mitigation: "Dependency Load Test" },
  { a: "PER 4101", b: "PER 4106", summary: "Rollout speed intersects the approval threshold policy.", severity: "High", conflictId: "CTC 7002", conditions: ["BC 5103", "BC 5105"], dependencies: ["CSD 6105"], mitigation: "Joint Approval Before >10%" },
  { a: "PER 4102", b: "PER 4103", summary: "Conversion improvement versus fraud exposure containment.", severity: "High", conflictId: "CTC 7001", conditions: ["BC 5106"], dependencies: ["CSD 6101"], mitigation: "Fraud Loss Monitoring" },
  { a: "PER 4102", b: "PER 4104", summary: "Aggressive retry recovery versus dependency protection.", severity: "Medium", conflictId: "CTC 7003", conditions: ["BC 5101"], dependencies: ["CSD 6101", "CSD 6102"], mitigation: "Dependency Load Test" },
  { a: "PER 4102", b: "PER 4105", summary: "Checkout latency budget depends on Identity validation latency.", severity: "Medium", conditions: ["BC 5102"], dependencies: ["CSD 6102"] },
  { a: "PER 4102", b: "PER 4106", summary: "Rollout stages must produce the evidence governance requires.", severity: "Low", conditions: ["BC 5103"], dependencies: ["CSD 6105"] },
  { a: "PER 4103", b: "PER 4104", summary: "Fraud Decision Service saturation is an operational and risk concern.", severity: "High", conditions: ["BC 5106", "BC 5101"], dependencies: ["CSD 6101"], mitigation: "Dependency Health Monitoring" },
  { a: "PER 4103", b: "PER 4105", summary: "Both depend on shared validation capacity during recovery peaks.", severity: "Low", conditions: ["BC 5102"], dependencies: ["CSD 6102"] },
  { a: "PER 4103", b: "PER 4106", summary: "Fraud Engineering is a required joint approver above the threshold.", severity: "High", conflictId: "CTC 7002", conditions: ["BC 5103"], dependencies: ["CSD 6105"] },
  { a: "PER 4104", b: "PER 4105", summary: "Dependency saturation and latency on Identity Services.", severity: "Medium", conditions: ["BC 5102"], dependencies: ["CSD 6102"], mitigation: "Dependency Load Test" },
  { a: "PER 4104", b: "PER 4106", summary: "Change window and rollback control expectations must align.", severity: "Medium", conditions: ["BC 5105", "BC 5101"], dependencies: ["CSD 6105"] },
  { a: "PER 4105", b: "PER 4106", summary: "Capacity evidence is required before governance approves expansion.", severity: "Low", conditions: ["BC 5103"], dependencies: ["CSD 6102"] },
];

export function buildPairMatrix(state: CtiAnalysisState, analysisId = "CTA 3001"): CrossTeamImpactMatrixCell[] {
  const conflicts = conflictsFor(state);
  const gov = governanceActive(state);
  const qe = quarterEnd(state);
  return pairSeeds.map((seed, i) => {
    const conflict = seed.conflictId ? conflicts.find((c) => c.id === seed.conflictId) : undefined;
    let severity: Severity = conflict ? conflict.severity : seed.severity;
    const govPair = seed.b === "PER 4106" || seed.a === "PER 4106";
    if (govPair) {
      if (!gov) severity = "Low";
      else if (qe) severity = severityOrder[Math.min(3, severityRank(severity) + 1)];
    }
    const active = !govPair || gov;
    const direction: ImpactDirection = conflict && active ? "Review Required"
      : seed.opportunityId ? "Positive" : severityRank(severity) >= 2 ? "Negative" : "Mixed";
    return {
      id: `CTM-P-${i + 1}`,
      analysisId,
      matrixMode: "persona-persona" as const,
      rowPersonaId: seed.a,
      columnPersonaId: seed.b,
      direction,
      severity,
      confidence: 87 + ((i * 5) % 10),
      summary: govPair && !gov ? `${seed.summary} Not currently active at ${state.maxTraffic}% traffic exposure.` : seed.summary,
      conditionIds: seed.conditions,
      dependencyIds: seed.dependencies,
      evidenceReferenceIds: conflict ? conflict.evidenceReferenceIds : [],
      conflictId: conflict && active ? conflict.id : undefined,
      opportunityId: seed.opportunityId,
      coordinationRequired: Boolean(conflict && active) || severityRank(severity) >= 2,
    };
  });
}

export function pairCell(cells: CrossTeamImpactMatrixCell[], a: string, b: string) {
  return cells.find((c) => (c.rowPersonaId === a && c.columnPersonaId === b) || (c.rowPersonaId === b && c.columnPersonaId === a));
}

/* ---------------------------------------------------------- intersections -- */

export function intersectionsFor(state: CtiAnalysisState): CrossTeamImpactIntersection[] {
  return buildPairMatrix(state)
    .filter((c) => severityRank(c.severity as Severity) >= 1)
    .map((c, i) => ({
      id: `CTX ${5000 + i}`,
      analysisId: c.analysisId,
      personaIds: [c.rowPersonaId, c.columnPersonaId!],
      sharedEntityId: c.dependencyIds[0] ?? c.conditionIds[0] ?? "Checkout Journey",
      impactDimension: (c.conflictId ? "Risk" : "Dependency") as ImpactDimension,
      direction: c.direction,
      severity: c.severity as Severity,
      confidence: c.confidence,
      conditionIds: c.conditionIds,
      dependencyIds: c.dependencyIds,
      riskIds: c.conflictId ? [c.conflictId] : [],
      controlIds: sharedContext.controls.slice(0, 2),
      evidenceReferenceIds: c.evidenceReferenceIds,
      status: c.conflictId ? "Review Required" : "Analyzing",
      summary: c.summary,
    }));
}

/* --------------------------------------------------------- workbench data -- */

export const workbenchIntersections = [
  { id: "WI 1", label: "Payments + Checkout", kind: "Shared Goal", detail: "Improve Checkout Completion", alignment: "High", tone: "green" as const, personaIds: ["PER 4101", "PER 4102"] },
  { id: "WI 2", label: "Checkout + Fraud", kind: "Conflict", detail: "Conversion versus Fraud Exposure", alignment: "High severity", tone: "red" as const, personaIds: ["PER 4102", "PER 4103"] },
  { id: "WI 3", label: "Payments + SRE", kind: "Shared Concern", detail: "Payment Integrity and Rollback", alignment: "Medium High", tone: "amber" as const, personaIds: ["PER 4101", "PER 4104"] },
  { id: "WI 4", label: "Payments + Release Governance", kind: "Conflict", detail: "Rollout Speed versus Approval Threshold", alignment: "High when above 10%", tone: "red" as const, personaIds: ["PER 4101", "PER 4106"] },
  { id: "WI 5", label: "SRE + Identity", kind: "Shared Dependency Concern", detail: "Identity Load and Latency", alignment: "Medium", tone: "amber" as const, personaIds: ["PER 4104", "PER 4105"] },
];

/* -------------------------------------------------------------- graph ----- */

export interface CtiGraphNode {
  id: string; label: string; kind: "change" | "system" | "service" | "persona" | "journey" | "governance";
  x: number; y: number; detail: string; personaIds?: string[]; direct: boolean;
}
export interface CtiGraphEdge { id: string; from: string; to: string; label: string; kind: "dependency" | "ownership" | "governance" | "customer" | "impact"; evidence: string }

export const graphNodes: CtiGraphNode[] = [
  { id: "G1", label: "Checkout Retry Policy Update", kind: "change", x: 8, y: 46, detail: "Proposed change under analysis", direct: true },
  { id: "G2", label: "Retry Orchestrator", kind: "system", x: 22, y: 46, detail: "Schedules and bounds retry attempts", direct: true },
  { id: "G3", label: "Payments API", kind: "system", x: 36, y: 30, detail: "Authorization entry point", direct: true },
  { id: "G4", label: "Payments Platform", kind: "persona", x: 50, y: 18, detail: "Owns payment integrity", personaIds: ["PER 4101"], direct: true },
  { id: "G5", label: "Fraud Decision Service", kind: "service", x: 50, y: 40, detail: "Shared decision dependency", direct: false },
  { id: "G6", label: "Fraud Engineering", kind: "persona", x: 64, y: 32, detail: "Owns fraud exposure", personaIds: ["PER 4103"], direct: false },
  { id: "G7", label: "Identity Services", kind: "service", x: 50, y: 62, detail: "Token validation dependency", direct: false },
  { id: "G8", label: "Identity Engineering", kind: "persona", x: 64, y: 70, detail: "Owns identity capacity", personaIds: ["PER 4105"], direct: false },
  { id: "G9", label: "Regional Token Vault", kind: "service", x: 36, y: 74, detail: "Regional token storage", direct: false },
  { id: "G10", label: "Site Reliability Engineering", kind: "persona", x: 64, y: 86, detail: "Owns operational resilience", personaIds: ["PER 4104"], direct: false },
  { id: "G11", label: "Checkout Customer Journey", kind: "journey", x: 80, y: 52, detail: "Customer facing outcome", direct: true },
  { id: "G12", label: "Checkout Engineering", kind: "persona", x: 80, y: 18, detail: "Owns checkout experience", personaIds: ["PER 4102"], direct: true },
  { id: "G13", label: "Release Governance", kind: "governance", x: 90, y: 82, detail: "Owns approval policy", personaIds: ["PER 4106"], direct: false },
];

export const graphEdges: CtiGraphEdge[] = [
  { id: "E1", from: "G1", to: "G2", label: "CHANGES", kind: "impact", evidence: "EV 7101" },
  { id: "E2", from: "G2", to: "G3", label: "DEPENDS ON", kind: "dependency", evidence: "EV 7103" },
  { id: "E3", from: "G3", to: "G4", label: "OWNED BY", kind: "ownership", evidence: "EV 7103" },
  { id: "E4", from: "G3", to: "G5", label: "DEPENDS ON", kind: "dependency", evidence: "EV 7102" },
  { id: "E5", from: "G5", to: "G6", label: "OWNED BY", kind: "ownership", evidence: "EV 7102" },
  { id: "E6", from: "G3", to: "G7", label: "DEPENDS ON", kind: "dependency", evidence: "EV 7105" },
  { id: "E7", from: "G7", to: "G8", label: "OWNED BY", kind: "ownership", evidence: "EV 7105" },
  { id: "E8", from: "G7", to: "G9", label: "CONSUMED BY", kind: "dependency", evidence: "EV 7104" },
  { id: "E9", from: "G9", to: "G10", label: "MEASURED BY", kind: "dependency", evidence: "EV 7104" },
  { id: "E10", from: "G3", to: "G11", label: "IMPACTS", kind: "customer", evidence: "EV 7101" },
  { id: "E11", from: "G11", to: "G12", label: "OWNED BY", kind: "ownership", evidence: "EV 7101" },
  { id: "E12", from: "G1", to: "G13", label: "GOVERNED BY", kind: "governance", evidence: "EV 7106" },
  { id: "E13", from: "G13", to: "G4", label: "REQUIRES REVIEW FROM", kind: "governance", evidence: "EV 7106" },
  { id: "E14", from: "G13", to: "G6", label: "REQUIRES REVIEW FROM", kind: "governance", evidence: "EV 7106" },
];

export const graphFilters = [
  { id: "all", label: "All" },
  { id: "direct", label: "Direct Impacts Only" },
  { id: "propagated", label: "Propagated Impacts" },
  { id: "personas", label: "Personas Only" },
  { id: "services", label: "Services Only" },
  { id: "critical", label: "Critical Paths" },
  { id: "customer", label: "Customer Path" },
  { id: "governance", label: "Governance Path" },
  { id: "failure", label: "Failure Path" },
  { id: "evidence", label: "Evidence Path" },
];

/* -------------------------------------------------------------- quality --- */

export const qualityDimensions = [
  { name: "Persona Coverage", current: 96, target: 95, trend: "+2", affected: 2 },
  { name: "Matrix Coverage", current: 98, target: 98, trend: "+1", affected: 0 },
  { name: "Condition Coverage", current: 94, target: 95, trend: "0", affected: 3 },
  { name: "Dependency Coverage", current: 91, target: 95, trend: "-1", affected: 5 },
  { name: "Conflict Detection", current: 92, target: 93, trend: "+3", affected: 4 },
  { name: "Opportunity Detection", current: 89, target: 92, trend: "+1", affected: 6 },
  { name: "Evidence Coverage", current: 86, target: 95, trend: "-2", affected: 7 },
  { name: "Coordination Ownership", current: 88, target: 95, trend: "+2", affected: 4 },
  { name: "Recommendation Traceability", current: 96, target: 95, trend: "+1", affected: 1 },
  { name: "Context Freshness", current: 95, target: 95, trend: "0", affected: 2 },
];

export const overallQuality = 92;

/* -------------------------------------------------------------- activity -- */

export const recentActivity: CrossTeamImpactActivity[] = [
  { id: "ACT 1", timestamp: "2026-08-06 14:02", analysisId: "CTA 3001", personaIds: ["PER 4103"], action: "Conflict Detected", description: "Conversion versus fraud exposure conflict raised to High", result: "Review Required", owner: "Coordination Office", auditId: "AUD 9001" },
  { id: "ACT 2", timestamp: "2026-08-06 13:38", analysisId: "CTA 3001", personaIds: ["PER 4104"], action: "Evidence Gap", description: "Dependency load test results not provided", result: "Needs Evidence", owner: "Site Reliability Engineering", auditId: "AUD 9002" },
  { id: "ACT 3", timestamp: "2026-08-06 12:20", analysisId: "CTA 3004", personaIds: ["PER 4101", "PER 4103"], action: "Intersection Identified", description: "Fraud timeout adjustment intersects payment retry envelope", result: "Analyzing", owner: "Enterprise Architecture", auditId: "AUD 9003" },
  { id: "ACT 4", timestamp: "2026-08-06 10:55", analysisId: "CTA 3003", personaIds: ["PER 4104", "PER 4105"], action: "Dependency Escalated", description: "Regional Token Vault marked critical for EU migration", result: "Blocked", owner: "Platform Engineering", auditId: "AUD 9004" },
  { id: "ACT 5", timestamp: "2026-08-05 17:12", analysisId: "CTA 3005", personaIds: ["PER 4102"], action: "Analysis Complete", description: "Observability expansion produced no cross team conflicts", result: "Analysis Complete", owner: "Site Reliability Engineering", auditId: "AUD 9005" },
];

/* ------------------------------------------------- enterprise summary ----- */

export function enterpriseSummary(state: CtiAnalysisState) {
  const conflicts = conflictsFor(state).filter((c) => c.status !== "Not Required");
  const deps = dependenciesFor(state);
  const actions = coordinationActionsFor(state);
  const evidence = evidenceState(state);
  const gaps = evidence.filter((e) => e.status !== "Provided").length;
  const criticalDeps = deps.filter((d) => severityRank(d.criticality) >= 2).length;
  const confidence = Math.max(78, 96 - gaps * 3 - conflicts.filter((c) => c.severity === "Critical").length * 4);

  return {
    workItem: proposedChange.title,
    teamsEvaluated: ctiPersonas.length,
    materialPersonaImpacts: ctiPersonas.filter((p) => personaScore(p.id, state) >= 50).length,
    criticalSharedDependencies: criticalDeps,
    conflicts: conflicts.length,
    opportunities: opportunities.length,
    mitigationCandidates: mitigationCandidates.length,
    coordinationActions: actions.length,
    evidenceGaps: gaps,
    confidence,
    finding:
      "The change offers measurable checkout completion benefit, but broader rollout creates coupled payment integrity, fraud exposure, dependency capacity, and governance consequences that cannot be managed by Checkout Engineering alone.",
    conditions: [
      "Validate idempotency",
      "Validate fraud loss",
      "Validate dependency capacity",
      "Use progressive rollout",
      "Maintain rollback threshold",
      ...(governanceActive(state) ? ["Obtain joint approval before >10% traffic"] : []),
      ...(quarterEnd(state) ? ["Obtain a quarter end change window exception"] : []),
    ],
    downstream: [
      { label: "Cross Team Impact Matrix", status: "Complete" },
      { label: "Decision Intelligence Package", status: "Pending" },
    ],
  };
}

export function operationalState(state: CtiAnalysisState): CtiOperationalState {
  const evidence = evidenceState(state);
  if (evidence.some((e) => e.status === "Missing")) return "Needs Evidence";
  if (conflictsFor(state).some((c) => c.severity === "Critical")) return "Conflict Detected";
  if (conflictsFor(state).some((c) => c.status === "Open")) return "Review Required";
  return "Operational";
}
