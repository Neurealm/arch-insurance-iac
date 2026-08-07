/**
 * Cognitive Readiness Assessment — canonical data layer (Prompt 1).
 *
 * This module answers "do we understand the proposed work well enough to
 * evaluate its consequences?". It never approves work and never computes
 * Persona impact. All data is deterministic local demo data.
 */

export type ReadinessState =
  | "Ready" | "Conditionally Ready" | "Remediation Required" | "Evidence Required"
  | "Clarification Required" | "Blocked" | "Insufficient Context" | "Unknown";

export type ServiceState =
  | "Operational" | "Assessing" | "Evidence Required" | "Clarification Required"
  | "Remediation Required" | "Conditionally Ready" | "Ready" | "Blocked";

export type GateStatus =
  | "Passed" | "Passed with Warning" | "Needs Evidence" | "Needs Clarification"
  | "Failed" | "Not Applicable";

export type ReadinessView = "queue" | "workbench" | "coverage" | "diagnostic";

export interface CognitiveReadinessDimension {
  id: string;
  name: string;
  question: string;
  definition: string;
  score: number;
  target: number;
  confidence: number;
  evaluates: string[];
  requiredContext: string[];
  availableContext: string[];
  missingContext: string[];
  evidence: string[];
  warnings: string[];
  blockingFindings: string[];
  affectedPersonas: string[];
  affectedConditions: string[];
  affectedDependencies: string[];
  recommendedRemediation: string; // Prompt 2 placeholder
}

export interface CognitiveReadinessGate {
  id: string;
  name: string;
  purpose: string;
  requires: string[];
  status: GateStatus;
  note: string;
}

export interface CognitiveReadinessAssessment {
  id: string;
  workItem: string;
  submittingTeam: string;
  businessUnit: string;
  workType: string;
  priority: string;
  score: number;
  state: ReadinessState;
  intent: number;
  stateDefinition: number;
  dependencies: number;
  evidence: number;
  personaCoverage: number;
  conditionCoverage: number;
  execution: number;
  blockingGaps: number;
  warnings: number;
  confidence: number;
  owner: string;
  environment: string;
  region: string;
  updated: string;
  ambiguityState: string;
  contradictionState: string;
  blockingGate: string;
}

export interface CognitiveReadinessPersonaState {
  persona: string;
  candidateMatch: string;
  contextCoverage: number;
  applicableConditions: number;
  dependencyCoverage: number;
  evidenceCoverage: number;
  readiness: string;
  confidence: number;
  primaryGap: string;
}

export interface CognitiveReadinessConditionState {
  condition: string;
  type: string;
  applicability: string;
  source: string;
  authority: string;
  policyBinding: string;
  evidence: string;
  freshness: string;
  confidence: number;
  status: string;
}

export interface CognitiveReadinessDependencyState {
  dependency: string;
  relationship: string;
  owner: string;
  criticality: string;
  evidenceCoverage: number;
  freshness: string;
  confidence: number;
  affectedPersonas: string[];
  status: string;
}

export interface CognitiveReadinessEvidence {
  id: string;
  group: string;
  evidence: string;
  required: boolean;
  provided: boolean;
  authority: string;
  freshness: string;
  quality: number;
  affectedDimensions: string[];
  affectedPersonas: string[];
  status: string;
  source: string;
}

export interface CognitiveReadinessAssumption {
  id: string;
  assumption: string;
  category: string;
  source: string;
  confidence: string;
  materiality: string;
  affectedPersonas: string[];
  evidence: string;
  validationState: string;
}

export interface CognitiveReadinessConstraint {
  id: string;
  constraint: string;
  type: string;
  source: string;
  authority: string;
  applicability: string;
  affectedScope: string;
  affectedPersonas: string[];
  status: string;
}

export interface CognitiveReadinessAmbiguity {
  id: string;
  text: string;
  source: string;
  whyAmbiguous: string;
  interpretations: string[];
  affectedDimensions: string[];
  affectedPersonas: string[];
  materiality: string;
  status: string;
}

export interface CognitiveReadinessContradiction {
  id: string;
  statementA: string;
  statementB: string;
  conflictType: string;
  severity: string;
  affected: string[];
  status: string;
}

export interface CognitiveReadinessFinding {
  id: string;
  type: string;
  description: string;
  dimension: string;
  gate: string;
  severity: string;
  blocking: boolean;
  affectedPersonas: string[];
  affectedConditions: string[];
  affectedDependencies: string[];
  recommendedAction: string;
  status: string;
}

export interface CognitiveReadinessHandoffPreview {
  workItem: string;
  intakePackageVersion: string;
  assessmentVersion: string;
  historicalContextVersion: string;
}

export interface ReadinessKpi {
  id: string;
  label: string;
  value: string;
  status: "Healthy" | "Attention" | "Critical";
  detail: string;
  drilldowns: { label: string; value: number }[];
}

export interface ReadinessStage {
  id: string;
  name: string;
  status: string;
  processed: number;
  pending: number;
  warnings: number;
  failures: number;
  confidence: number;
  duration: string;
  owner: string;
}

/* ------------------------------------------------------------ dimensions -- */

export const readinessDimensions: CognitiveReadinessDimension[] = [
  {
    id: "intent",
    name: "Intent & Decision Clarity",
    question: "Do we understand what is changing and why?",
    definition: "Whether the proposed work states a problem, an objective, the decision required, and an explicit decision boundary.",
    score: 96, target: 95, confidence: 96,
    evaluates: ["Problem statement", "Business objective", "Technical objective", "Decision required", "Expected benefit", "Decision boundary", "In scope", "Out of scope"],
    requiredContext: ["Problem statement", "Business objective", "Decision required", "In scope", "Out of scope"],
    availableContext: ["Problem statement", "Business objective", "Technical objective", "Decision required", "Expected benefit", "In scope"],
    missingContext: ["Explicit out of scope statement for regional rollout"],
    evidence: ["Design Document", "Intake Package INT 7001"],
    warnings: [],
    blockingFindings: [],
    affectedPersonas: ["Checkout Engineering", "Release Governance"],
    affectedConditions: ["Traffic >10% Joint Approval"],
    affectedDependencies: [],
    recommendedRemediation: "Prompt 2: request an explicit out of scope statement from the submitting team.",
  },
  {
    id: "state",
    name: "Current & Proposed State",
    question: "Can we clearly distinguish what exists today from what will exist after the change?",
    definition: "Whether current and proposed architecture, configuration, scale, and operating state are both described with an explicit delta.",
    score: 91, target: 92, confidence: 93,
    evaluates: ["Current architecture", "Current configuration", "Current scale", "Current operating state", "Proposed architecture", "Proposed configuration", "Proposed scale", "Proposed operating state", "Explicit delta"],
    requiredContext: ["Current configuration", "Proposed configuration", "Explicit delta"],
    availableContext: ["Current architecture", "Current configuration", "Current scale", "Proposed configuration", "Explicit delta"],
    missingContext: ["Proposed operating state under peak demand"],
    evidence: ["Design Document", "Current Retry Metrics"],
    warnings: ["Proposed operating state is described only for normal demand"],
    blockingFindings: [],
    affectedPersonas: ["Checkout Engineering", "Payments Platform"],
    affectedConditions: ["P95 Latency <250ms"],
    affectedDependencies: ["Payments API"],
    recommendedRemediation: "Prompt 2: request peak demand operating state from Checkout Engineering.",
  },
  {
    id: "scope",
    name: "Scope & Dependency Context",
    question: "Do we know where the change applies and what it depends on?",
    definition: "Whether affected systems, services, capabilities, journeys, regions, environments, and dependencies are identified with ownership.",
    score: 84, target: 90, confidence: 88,
    evaluates: ["Systems", "Services", "Applications", "Platforms", "Business capabilities", "Customer journeys", "Regions", "Environments", "Upstream dependencies", "Downstream dependencies", "Shared dependencies", "Ownership"],
    requiredContext: ["Systems", "Services", "Regions", "Upstream dependencies", "Downstream dependencies", "Ownership"],
    availableContext: ["Systems", "Services", "Environments", "Upstream dependencies", "Ownership"],
    missingContext: ["Regional Token Vault capacity context", "Shared dependency map for EU region"],
    evidence: ["Design Document", "Dependency Register"],
    warnings: ["Regional Token Vault dependency is unvalidated"],
    blockingFindings: [],
    affectedPersonas: ["Identity Engineering", "Payments Platform", "Site Reliability Engineering"],
    affectedConditions: ["Regional Dependency Capacity"],
    affectedDependencies: ["Regional Token Vault", "Identity Services"],
    recommendedRemediation: "Prompt 2: open a dependency validation request against Regional Token Vault.",
  },
  {
    id: "evidence",
    name: "Evidence Sufficiency",
    question: "Is there enough trustworthy evidence to evaluate the proposed change?",
    definition: "Whether evidence exists, is authoritative, is current, and covers each evidence class relevant to the work type.",
    score: 82, target: 90, confidence: 90,
    evaluates: ["Architecture evidence", "Technical evidence", "Operational evidence", "Financial evidence", "Security evidence", "Policy evidence", "Dependency evidence", "Test evidence", "Prior outcome evidence", "Evidence authority", "Evidence freshness"],
    requiredContext: ["Architecture evidence", "Operational evidence", "Test evidence", "Dependency evidence"],
    availableContext: ["Design Document", "Current Retry Metrics", "Initial Rollout Plan", "Idempotency Test Results", "Rollback Threshold", "Prior Retry Outcome"],
    missingContext: ["Fraud Loss Analysis", "Regional Dependency Stress Test"],
    evidence: ["Idempotency Test Results", "Current Retry Metrics", "Prior Retry Outcome"],
    warnings: ["Two material evidence items are missing", "Finance impact analysis may be required above 10% traffic"],
    blockingFindings: [],
    affectedPersonas: ["Fraud Engineering", "Identity Engineering"],
    affectedConditions: ["Fraud Loss Materiality"],
    affectedDependencies: ["Fraud Decision Service", "Regional Token Vault"],
    recommendedRemediation: "Prompt 2: raise evidence requests for Fraud Loss Analysis and Regional Dependency Stress Test.",
  },
  {
    id: "enterprise",
    name: "Enterprise Context Coverage",
    question: "Can the proposed work be connected to relevant enterprise knowledge?",
    definition: "Whether candidate Personas, Business Conditions, policies, controls, risks, prior decisions, outcomes, and learning are retrievable.",
    score: 90, target: 92, confidence: 93,
    evaluates: ["Candidate Team Personas", "Business Conditions", "Policies", "Controls", "Risks", "Dependencies", "Prior Decisions", "Prior Outcomes", "Validated Learning"],
    requiredContext: ["Candidate Team Personas", "Business Conditions", "Prior Decisions"],
    availableContext: ["Candidate Team Personas", "Business Conditions", "Policies", "Prior Decisions", "Prior Outcomes", "Validated Learning"],
    missingContext: ["Policy binding for fraud loss materiality"],
    evidence: ["Enterprise Cognitive Memory", "Business Condition Registry"],
    warnings: ["Fraud loss materiality condition is pending policy binding"],
    blockingFindings: [],
    affectedPersonas: ["Fraud Engineering", "Release Governance"],
    affectedConditions: ["Fraud Loss Materiality"],
    affectedDependencies: [],
    recommendedRemediation: "Prompt 2: route the fraud loss materiality condition for policy binding.",
  },
  {
    id: "assumptions",
    name: "Assumptions, Constraints & Uncertainty",
    question: "Are important unknowns and decision boundaries explicit?",
    definition: "Whether material assumptions, constraints, thresholds, known unknowns, confidence, and sensitivity are stated rather than implied.",
    score: 78, target: 88, confidence: 84,
    evaluates: ["Demand assumptions", "Architecture assumptions", "Operational assumptions", "Financial assumptions", "Dependency assumptions", "Constraints", "Thresholds", "Known unknowns", "Confidence", "Sensitivity"],
    requiredContext: ["Demand assumptions", "Dependency assumptions", "Constraints", "Thresholds"],
    availableContext: ["Constraints", "Thresholds", "Operational assumptions"],
    missingContext: ["Confirmed demand assumption for 15% traffic", "Sensitivity range for fraud loss"],
    evidence: ["Design Document"],
    warnings: ["Demand assumption for 15% traffic is unconfirmed", "Fraud loss tolerance lacks evidence"],
    blockingFindings: [],
    affectedPersonas: ["Fraud Engineering", "Payments Platform", "Site Reliability Engineering"],
    affectedConditions: ["Fraud Loss Materiality", "Regional Dependency Capacity"],
    affectedDependencies: ["Fraud Decision Service"],
    recommendedRemediation: "Prompt 2: convert unconfirmed assumptions into explicit uncertainty markers or validation tasks.",
  },
  {
    id: "execution",
    name: "Execution & Reversibility",
    question: "Is there enough execution context to understand exposure and containment?",
    definition: "Whether rollout, exposure, observation, rollback capability, triggers, and reversibility are defined.",
    score: 86, target: 90, confidence: 92,
    evaluates: ["Rollout scope", "Rollout stages", "Traffic exposure", "Change window", "Observation window", "Rollback capability", "Rollback triggers", "Temporary resources", "Decommission requirements", "Reversibility"],
    requiredContext: ["Rollout scope", "Traffic exposure", "Rollback capability", "Rollback triggers", "Observation window"],
    availableContext: ["Rollout scope", "Rollout stages", "Traffic exposure", "Observation window", "Rollback capability", "Rollback triggers", "Reversibility"],
    missingContext: ["Decommission requirements for temporary retry buffers"],
    evidence: ["Initial Rollout Plan", "Rollback Threshold"],
    warnings: ["Phase 2 exposure is contradicted across two sources"],
    blockingFindings: [],
    affectedPersonas: ["Site Reliability Engineering", "Release Governance"],
    affectedConditions: ["Quarter End Restriction"],
    affectedDependencies: ["Payments API"],
    recommendedRemediation: "Prompt 2: resolve the phase 2 exposure contradiction before execution planning.",
  },
  {
    id: "outcome",
    name: "Outcome Observability",
    question: "Will the enterprise be able to determine whether the work achieved its intended result?",
    definition: "Whether expected outcomes, metrics, baselines, targets, observation period, owners, and learning triggers are measurable.",
    score: 88, target: 90, confidence: 91,
    evaluates: ["Expected outcomes", "Success metrics", "Failure metrics", "Baseline", "Target", "Observation period", "Evidence source", "Owner", "Escalation threshold", "Learning trigger"],
    requiredContext: ["Expected outcomes", "Success metrics", "Baseline", "Target", "Owner"],
    availableContext: ["Expected outcomes", "Success metrics", "Failure metrics", "Baseline", "Target", "Observation period", "Owner"],
    missingContext: ["Learning trigger for the outcome review"],
    evidence: ["Current Retry Metrics", "Prior Retry Outcome"],
    warnings: ["Learning trigger not defined"],
    blockingFindings: [],
    affectedPersonas: ["Checkout Engineering", "Site Reliability Engineering"],
    affectedConditions: ["Availability >=99.95%"],
    affectedDependencies: [],
    recommendedRemediation: "Prompt 2: attach a learning trigger so Organizational Learning can close the loop.",
  },
];

export const dimensionById = (id: string) =>
  readinessDimensions.find((d) => d.id === id) ?? readinessDimensions[0];

/* ----------------------------------------------------------------- gates -- */

export const readinessGates: CognitiveReadinessGate[] = [
  {
    id: "required-context",
    name: "Required Context Gate",
    purpose: "The minimum context without which no analysis is meaningful.",
    requires: ["Work identity", "Intent", "Current state", "Proposed state", "Scope", "Owner"],
    status: "Passed",
    note: "All required context elements are present in Intake Package v3.",
  },
  {
    id: "material-impact",
    name: "Material Impact Context Gate",
    purpose: "Context required when the work is materially relevant to other teams.",
    requires: ["Dependencies", "Affected systems", "Candidate Personas", "Applicable Conditions", "Material assumptions"],
    status: "Passed with Warning",
    note: "Regional Token Vault dependency and the 15% demand assumption are unvalidated.",
  },
  {
    id: "evidence",
    name: "Evidence Gate",
    purpose: "Evidence appropriate to the work type must be available and authoritative.",
    requires: ["Technical", "Architecture", "Dependency", "Financial", "Security", "Policy", "Operational"],
    status: "Passed with Warning",
    note: "Fraud Loss Analysis and Regional Dependency Stress Test are missing but non blocking at 5% exposure.",
  },
  {
    id: "execution-safety",
    name: "Execution Safety Gate",
    purpose: "Execution context required to understand exposure and containment.",
    requires: ["Rollout", "Rollback", "Observation", "Stop conditions", "Reversibility"],
    status: "Passed",
    note: "Rollback trigger defined at duplicate authorization >0.2% for five minutes.",
  },
];

/* ------------------------------------------------------------ assessments -- */

export const assessments: CognitiveReadinessAssessment[] = [
  {
    id: "CRA 7001", workItem: "Checkout Retry Policy Update", submittingTeam: "Checkout Engineering",
    businessUnit: "Commerce Engineering", workType: "Configuration / Reliability Change", priority: "High",
    score: 86, state: "Conditionally Ready", intent: 98, stateDefinition: 94, dependencies: 82, evidence: 84,
    personaCoverage: 96, conditionCoverage: 94, execution: 88, blockingGaps: 0, warnings: 3, confidence: 94,
    owner: "A. Rivera", environment: "Production", region: "Global", updated: "12 minutes ago",
    ambiguityState: "Detected", contradictionState: "Detected", blockingGate: "None",
  },
  {
    id: "CRA 7002", workItem: "Identity Token Cache Optimization", submittingTeam: "Identity Engineering",
    businessUnit: "Platform Operations", workType: "Performance Change", priority: "Medium",
    score: 92, state: "Ready", intent: 96, stateDefinition: 95, dependencies: 92, evidence: 91,
    personaCoverage: 94, conditionCoverage: 93, execution: 90, blockingGaps: 0, warnings: 1, confidence: 93,
    owner: "M. Chen", environment: "Production", region: "Global", updated: "1 hour ago",
    ambiguityState: "None", contradictionState: "None", blockingGate: "None",
  },
  {
    id: "CRA 7003", workItem: "Regional Token Vault Migration", submittingTeam: "Identity Engineering",
    businessUnit: "Platform Operations", workType: "Architecture Change", priority: "Critical",
    score: 71, state: "Evidence Required", intent: 90, stateDefinition: 82, dependencies: 64, evidence: 58,
    personaCoverage: 88, conditionCoverage: 80, execution: 70, blockingGaps: 2, warnings: 6, confidence: 79,
    owner: "S. Patel", environment: "Production", region: "EU", updated: "3 hours ago",
    ambiguityState: "Detected", contradictionState: "None", blockingGate: "Evidence Gate",
  },
  {
    id: "CRA 7004", workItem: "Fraud Decision Timeout Adjustment", submittingTeam: "Fraud Engineering",
    businessUnit: "Risk Technology", workType: "Configuration / Reliability Change", priority: "High",
    score: 84, state: "Clarification Required", intent: 84, stateDefinition: 88, dependencies: 86, evidence: 82,
    personaCoverage: 90, conditionCoverage: 88, execution: 84, blockingGaps: 0, warnings: 4, confidence: 86,
    owner: "L. Novak", environment: "Production", region: "Global", updated: "5 hours ago",
    ambiguityState: "Detected", contradictionState: "None", blockingGate: "None",
  },
  {
    id: "CRA 7005", workItem: "Checkout Observability Expansion", submittingTeam: "Site Reliability Engineering",
    businessUnit: "Platform Operations", workType: "Observability Change", priority: "Medium",
    score: 95, state: "Ready", intent: 97, stateDefinition: 96, dependencies: 94, evidence: 95,
    personaCoverage: 96, conditionCoverage: 95, execution: 93, blockingGaps: 0, warnings: 0, confidence: 96,
    owner: "R. Osei", environment: "Production", region: "Global", updated: "Yesterday",
    ambiguityState: "None", contradictionState: "None", blockingGate: "None",
  },
];

export const queueColumns: { key: string; label: string; get: (a: CognitiveReadinessAssessment) => string | number }[] = [
  { key: "id", label: "Assessment ID", get: (a) => a.id },
  { key: "workItem", label: "Work Item", get: (a) => a.workItem },
  { key: "team", label: "Submitting Team", get: (a) => a.submittingTeam },
  { key: "workType", label: "Work Type", get: (a) => a.workType },
  { key: "score", label: "Readiness Score", get: (a) => a.score },
  { key: "state", label: "Readiness State", get: (a) => a.state },
  { key: "intent", label: "Intent", get: (a) => a.intent },
  { key: "stateDefinition", label: "State Definition", get: (a) => a.stateDefinition },
  { key: "dependencies", label: "Dependencies", get: (a) => a.dependencies },
  { key: "evidence", label: "Evidence", get: (a) => a.evidence },
  { key: "personaCoverage", label: "Persona Coverage", get: (a) => a.personaCoverage },
  { key: "conditionCoverage", label: "Condition Coverage", get: (a) => a.conditionCoverage },
  { key: "execution", label: "Execution Context", get: (a) => a.execution },
  { key: "blockingGaps", label: "Blocking Gaps", get: (a) => a.blockingGaps },
  { key: "warnings", label: "Warnings", get: (a) => a.warnings },
  { key: "confidence", label: "Confidence", get: (a) => `${a.confidence}%` },
  { key: "owner", label: "Owner", get: (a) => a.owner },
  { key: "updated", label: "Updated", get: (a) => a.updated },
];

/* --------------------------------------------------------------- filters -- */

export interface ReadinessFilters {
  businessUnit: string; submittingTeam: string; workType: string; priority: string;
  readinessState: string; readinessScore: string; evidenceCoverage: string; dependencyCoverage: string;
  personaCoverage: string; conditionCoverage: string; ambiguityState: string; contradictionState: string;
  blockingGate: string; owner: string; environment: string; region: string; timeRange: string;
}

export const defaultReadinessFilters: ReadinessFilters = {
  businessUnit: "All", submittingTeam: "All", workType: "All", priority: "All",
  readinessState: "All", readinessScore: "All", evidenceCoverage: "All", dependencyCoverage: "All",
  personaCoverage: "All", conditionCoverage: "All", ambiguityState: "All", contradictionState: "All",
  blockingGate: "All", owner: "All", environment: "All", region: "All", timeRange: "Last 30 days",
};

export const readinessFilterLabels: Record<keyof ReadinessFilters, string> = {
  businessUnit: "Business Unit", submittingTeam: "Submitting Team", workType: "Work Type",
  priority: "Priority", readinessState: "Readiness State", readinessScore: "Readiness Score",
  evidenceCoverage: "Evidence Coverage", dependencyCoverage: "Dependency Coverage",
  personaCoverage: "Persona Coverage", conditionCoverage: "Condition Coverage",
  ambiguityState: "Ambiguity State", contradictionState: "Contradiction State",
  blockingGate: "Blocking Gate", owner: "Assessment Owner", environment: "Environment",
  region: "Region", timeRange: "Time Range",
};

const uniq = (v: string[]) => ["All", ...Array.from(new Set(v))];

export const readinessFilterOptions: Record<keyof ReadinessFilters, string[]> = {
  businessUnit: uniq(assessments.map((a) => a.businessUnit)),
  submittingTeam: uniq(assessments.map((a) => a.submittingTeam)),
  workType: uniq(assessments.map((a) => a.workType)),
  priority: uniq(assessments.map((a) => a.priority)),
  readinessState: uniq(assessments.map((a) => a.state)),
  readinessScore: ["All", ">= 90", "80 - 89", "< 80"],
  evidenceCoverage: ["All", ">= 90", "80 - 89", "< 80"],
  dependencyCoverage: ["All", ">= 90", "80 - 89", "< 80"],
  personaCoverage: ["All", ">= 90", "< 90"],
  conditionCoverage: ["All", ">= 90", "< 90"],
  ambiguityState: ["All", "None", "Detected"],
  contradictionState: ["All", "None", "Detected"],
  blockingGate: ["All", "None", "Evidence Gate", "Execution Safety Gate", "Required Context Gate", "Material Impact Context Gate"],
  owner: uniq(assessments.map((a) => a.owner)),
  environment: uniq(assessments.map((a) => a.environment)),
  region: uniq(assessments.map((a) => a.region)),
  timeRange: ["Last 7 days", "Last 30 days", "Last 90 days", "All time"],
};

export const savedReadinessViews = ["Default", "Blocking Only", "Evidence Gaps", "Executive Review"];

const inBand = (band: string, value: number) => {
  if (band === "All") return true;
  if (band === ">= 90") return value >= 90;
  if (band === "80 - 89") return value >= 80 && value < 90;
  if (band === "< 80") return value < 80;
  if (band === "< 90") return value < 90;
  return true;
};

export function applyReadinessFilters(
  rows: CognitiveReadinessAssessment[], f: ReadinessFilters, search: string,
): CognitiveReadinessAssessment[] {
  const q = search.trim().toLowerCase();
  return rows.filter((a) => {
    if (f.businessUnit !== "All" && a.businessUnit !== f.businessUnit) return false;
    if (f.submittingTeam !== "All" && a.submittingTeam !== f.submittingTeam) return false;
    if (f.workType !== "All" && a.workType !== f.workType) return false;
    if (f.priority !== "All" && a.priority !== f.priority) return false;
    if (f.readinessState !== "All" && a.state !== f.readinessState) return false;
    if (!inBand(f.readinessScore, a.score)) return false;
    if (!inBand(f.evidenceCoverage, a.evidence)) return false;
    if (!inBand(f.dependencyCoverage, a.dependencies)) return false;
    if (!inBand(f.personaCoverage, a.personaCoverage)) return false;
    if (!inBand(f.conditionCoverage, a.conditionCoverage)) return false;
    if (f.ambiguityState !== "All" && a.ambiguityState !== f.ambiguityState) return false;
    if (f.contradictionState !== "All" && a.contradictionState !== f.contradictionState) return false;
    if (f.blockingGate !== "All" && a.blockingGate !== f.blockingGate) return false;
    if (f.owner !== "All" && a.owner !== f.owner) return false;
    if (f.environment !== "All" && a.environment !== f.environment) return false;
    if (f.region !== "All" && a.region !== f.region) return false;
    if (q && !`${a.id} ${a.workItem} ${a.submittingTeam} ${a.workType} ${a.owner}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export const activeReadinessFilterCount = (f: ReadinessFilters) =>
  (Object.keys(f) as (keyof ReadinessFilters)[])
    .filter((k) => (k === "timeRange" ? f[k] !== "Last 30 days" : f[k] !== "All")).length;

/* ------------------------------------------------------------------ KPIs -- */

export const readinessKpis: ReadinessKpi[] = [
  { id: "active", label: "Active Assessments", value: "24", status: "Healthy", detail: "Assessments in flight across the enterprise", drilldowns: [{ label: "Critical Context Gaps", value: 7 }, { label: "Evidence Gaps", value: 18 }] },
  { id: "ready", label: "Ready", value: "11", status: "Healthy", detail: "Sufficient context to begin Persona Impact Analysis", drilldowns: [{ label: "Evidence Gaps", value: 2 }] },
  { id: "conditional", label: "Conditionally Ready", value: "6", status: "Attention", detail: "Proceed with explicit uncertainty markers", drilldowns: [{ label: "Unresolved Assumptions", value: 12 }] },
  { id: "remediation", label: "Remediation Required", value: "4", status: "Critical", detail: "A gate failure overrides the average score", drilldowns: [{ label: "Critical Context Gaps", value: 7 }] },
  { id: "evidence", label: "Evidence Required", value: "3", status: "Attention", detail: "Evidence Gate cannot pass at current exposure", drilldowns: [{ label: "Evidence Gaps", value: 18 }] },
  { id: "average", label: "Average Readiness", value: "88%", status: "Healthy", detail: "Portfolio average, not a decision", drilldowns: [{ label: "Dependency Gaps", value: 9 }] },
];

export const kpiFilterFor = (id: string): Partial<ReadinessFilters> => {
  switch (id) {
    case "ready": return { readinessState: "Ready" };
    case "conditional": return { readinessState: "Conditionally Ready" };
    case "remediation": return { readinessState: "Remediation Required" };
    case "evidence": return { readinessState: "Evidence Required" };
    default: return { readinessState: "All" };
  }
};

/* ------------------------------------------------------------- lifecycle -- */

export const readinessLifecycleStages: ReadinessStage[] = [
  { id: "load-package", name: "Load Intake Package", status: "Complete", processed: 24, pending: 0, warnings: 0, failures: 0, confidence: 99, duration: "0.4s", owner: "Readiness Service" },
  { id: "work-context", name: "Resolve Work Context", status: "Complete", processed: 24, pending: 0, warnings: 1, failures: 0, confidence: 97, duration: "0.9s", owner: "Readiness Service" },
  { id: "intent", name: "Evaluate Intent", status: "Complete", processed: 24, pending: 0, warnings: 1, failures: 0, confidence: 96, duration: "1.1s", owner: "Context Engine" },
  { id: "state", name: "Compare Current & Proposed State", status: "Complete", processed: 24, pending: 0, warnings: 2, failures: 0, confidence: 93, duration: "1.4s", owner: "Context Engine" },
  { id: "scope", name: "Resolve Scope", status: "Complete", processed: 24, pending: 0, warnings: 2, failures: 0, confidence: 91, duration: "1.2s", owner: "Context Engine" },
  { id: "dependencies", name: "Trace Dependencies", status: "Warning", processed: 22, pending: 2, warnings: 4, failures: 0, confidence: 87, duration: "2.6s", owner: "Dependency Service" },
  { id: "personas", name: "Retrieve Candidate Personas", status: "Complete", processed: 24, pending: 0, warnings: 0, failures: 0, confidence: 95, duration: "0.8s", owner: "Persona Registry" },
  { id: "conditions", name: "Retrieve Business Conditions", status: "Complete", processed: 24, pending: 0, warnings: 1, failures: 0, confidence: 94, duration: "0.7s", owner: "Condition Registry" },
  { id: "evidence", name: "Evaluate Evidence", status: "Warning", processed: 21, pending: 3, warnings: 5, failures: 0, confidence: 90, duration: "3.1s", owner: "Evidence Service" },
  { id: "assumptions", name: "Evaluate Assumptions", status: "Warning", processed: 23, pending: 1, warnings: 3, failures: 0, confidence: 84, duration: "1.0s", owner: "Context Engine" },
  { id: "constraints", name: "Evaluate Constraints", status: "Complete", processed: 24, pending: 0, warnings: 1, failures: 0, confidence: 93, duration: "0.9s", owner: "Policy Service" },
  { id: "execution", name: "Evaluate Execution Context", status: "Complete", processed: 24, pending: 0, warnings: 2, failures: 0, confidence: 92, duration: "1.3s", owner: "Release Governance" },
  { id: "outcomes", name: "Evaluate Expected Outcomes", status: "Complete", processed: 24, pending: 0, warnings: 1, failures: 0, confidence: 91, duration: "0.8s", owner: "Outcome Service" },
  { id: "ambiguity", name: "Detect Ambiguity", status: "Warning", processed: 24, pending: 0, warnings: 4, failures: 0, confidence: 88, duration: "1.6s", owner: "Language Service" },
  { id: "contradictions", name: "Detect Contradictions", status: "Warning", processed: 24, pending: 0, warnings: 1, failures: 0, confidence: 90, duration: "1.5s", owner: "Language Service" },
  { id: "gates", name: "Evaluate Readiness Gates", status: "Complete", processed: 24, pending: 0, warnings: 3, failures: 0, confidence: 95, duration: "0.6s", owner: "Readiness Service" },
  { id: "calculate", name: "Calculate Readiness", status: "Complete", processed: 24, pending: 0, warnings: 0, failures: 0, confidence: 94, duration: "0.3s", owner: "Readiness Service" },
  { id: "handoff", name: "Prepare Persona Impact Handoff", status: "Pending", processed: 17, pending: 7, warnings: 0, failures: 0, confidence: 93, duration: "0.5s", owner: "Readiness Service" },
];

export const stageById = (id: string) =>
  readinessLifecycleStages.find((s) => s.id === id) ?? readinessLifecycleStages[8];

/* --------------------------------------------------------- context matrix -- */

export interface ContextCoverageRow {
  element: string;
  available: boolean;
  complete: boolean;
  authoritative: boolean;
  current: boolean;
  consistent: boolean;
  confidence: number;
  blockingIfMissing: boolean;
}

export const contextCoverageRows: ContextCoverageRow[] = [
  { element: "Intent", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 98, blockingIfMissing: true },
  { element: "Current State", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 96, blockingIfMissing: true },
  { element: "Proposed State", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 94, blockingIfMissing: true },
  { element: "Scope", available: true, complete: true, authoritative: true, current: true, consistent: false, confidence: 88, blockingIfMissing: true },
  { element: "Systems", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 95, blockingIfMissing: true },
  { element: "Services", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 94, blockingIfMissing: false },
  { element: "Dependencies", available: true, complete: false, authoritative: true, current: false, consistent: true, confidence: 82, blockingIfMissing: true },
  { element: "Business Conditions", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 94, blockingIfMissing: false },
  { element: "Candidate Personas", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 96, blockingIfMissing: true },
  { element: "Demand Assumptions", available: true, complete: false, authoritative: false, current: true, consistent: true, confidence: 74, blockingIfMissing: false },
  { element: "Financial Context", available: false, complete: false, authoritative: false, current: false, consistent: true, confidence: 60, blockingIfMissing: false },
  { element: "Security Context", available: true, complete: false, authoritative: true, current: true, consistent: true, confidence: 84, blockingIfMissing: false },
  { element: "Compliance Context", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 91, blockingIfMissing: false },
  { element: "Rollout", available: true, complete: true, authoritative: true, current: true, consistent: false, confidence: 86, blockingIfMissing: true },
  { element: "Rollback", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 93, blockingIfMissing: true },
  { element: "Expected Outcomes", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 90, blockingIfMissing: true },
  { element: "Evidence", available: true, complete: false, authoritative: true, current: true, consistent: true, confidence: 82, blockingIfMissing: false },
  { element: "Prior Decisions", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 92, blockingIfMissing: false },
  { element: "Prior Outcomes", available: true, complete: true, authoritative: true, current: true, consistent: true, confidence: 90, blockingIfMissing: false },
  { element: "Validated Learning", available: true, complete: true, authoritative: true, current: false, consistent: true, confidence: 87, blockingIfMissing: false },
];

/* -------------------------------------------------------------- personas -- */

export const personaStates: CognitiveReadinessPersonaState[] = [
  { persona: "Checkout Engineering", candidateMatch: "Primary", contextCoverage: 96, applicableConditions: 5, dependencyCoverage: 94, evidenceCoverage: 93, readiness: "Ready", confidence: 96, primaryGap: "None" },
  { persona: "Payments Platform", candidateMatch: "Primary", contextCoverage: 94, applicableConditions: 5, dependencyCoverage: 93, evidenceCoverage: 91, readiness: "Ready", confidence: 94, primaryGap: "None" },
  { persona: "Fraud Engineering", candidateMatch: "Primary", contextCoverage: 88, applicableConditions: 4, dependencyCoverage: 90, evidenceCoverage: 68, readiness: "Ready with Evidence Gap", confidence: 88, primaryGap: "Fraud Loss Analysis" },
  { persona: "Site Reliability Engineering", candidateMatch: "Primary", contextCoverage: 92, applicableConditions: 6, dependencyCoverage: 92, evidenceCoverage: 90, readiness: "Ready", confidence: 92, primaryGap: "None" },
  { persona: "Identity Engineering", candidateMatch: "Secondary", contextCoverage: 87, applicableConditions: 3, dependencyCoverage: 72, evidenceCoverage: 84, readiness: "Ready with Dependency Warning", confidence: 87, primaryGap: "Regional Token Vault validation" },
  { persona: "Release Governance", candidateMatch: "Governance", contextCoverage: 91, applicableConditions: 5, dependencyCoverage: 90, evidenceCoverage: 89, readiness: "Ready", confidence: 91, primaryGap: "Phase 2 exposure contradiction" },
];

/* ------------------------------------------------------------ conditions -- */

export const conditionStates: CognitiveReadinessConditionState[] = [
  { condition: "Availability >=99.95%", type: "Reliability", applicability: "Always", source: "Service Level Registry", authority: "Authoritative", policyBinding: "Bound", evidence: "SLO Definition", freshness: "Current", confidence: 97, status: "Resolved" },
  { condition: "P95 Latency <250ms", type: "Performance", applicability: "Checkout path", source: "Service Level Registry", authority: "Authoritative", policyBinding: "Bound", evidence: "Latency Baseline", freshness: "Current", confidence: 95, status: "Resolved" },
  { condition: "Idempotency Required", type: "Correctness", applicability: "Payment retries", source: "Payments Standard", authority: "Authoritative", policyBinding: "Bound", evidence: "Idempotency Test Results", freshness: "Current", confidence: 96, status: "Resolved" },
  { condition: "Traffic >10% Joint Approval", type: "Governance", applicability: "Conditional", source: "Release Policy", authority: "Authoritative", policyBinding: "Bound", evidence: "Release Policy v4", freshness: "Current", confidence: 94, status: "Resolved" },
  { condition: "Quarter End Restriction", type: "Governance", applicability: "Calendar", source: "Change Calendar", authority: "Authoritative", policyBinding: "Bound", evidence: "Change Calendar", freshness: "Current", confidence: 93, status: "Resolved" },
  { condition: "Fraud Loss Materiality", type: "Risk", applicability: "Retry changes", source: "Risk Register", authority: "Provisional", policyBinding: "Review", evidence: "Not provided", freshness: "Aging", confidence: 71, status: "Policy Binding Review" },
  { condition: "Regional Dependency Capacity", type: "Capacity", applicability: "EU region", source: "Capacity Register", authority: "Provisional", policyBinding: "Unbound", evidence: "Not provided", freshness: "Stale", confidence: 64, status: "Evidence Required" },
];

/* ----------------------------------------------------------- dependencies -- */

export const dependencyStates: CognitiveReadinessDependencyState[] = [
  { dependency: "Payments API", relationship: "Downstream", owner: "Payments Platform", criticality: "Critical", evidenceCoverage: 96, freshness: "Current", confidence: 96, affectedPersonas: ["Payments Platform", "Checkout Engineering"], status: "Validated" },
  { dependency: "Fraud Decision Service", relationship: "Downstream", owner: "Fraud Engineering", criticality: "Critical", evidenceCoverage: 94, freshness: "Current", confidence: 94, affectedPersonas: ["Fraud Engineering"], status: "Validated" },
  { dependency: "Identity Services", relationship: "Shared", owner: "Identity Engineering", criticality: "High", evidenceCoverage: 87, freshness: "Aging", confidence: 87, affectedPersonas: ["Identity Engineering", "Checkout Engineering"], status: "Warning" },
  { dependency: "Regional Token Vault", relationship: "Shared", owner: "Identity Engineering", criticality: "High", evidenceCoverage: 78, freshness: "Stale", confidence: 78, affectedPersonas: ["Identity Engineering", "Site Reliability Engineering"], status: "Validation Required" },
];

/* --------------------------------------------------------------- evidence -- */

export const evidenceItems: CognitiveReadinessEvidence[] = [
  { id: "EV 01", group: "Work Definition", evidence: "Design Document", required: true, provided: true, authority: "Authoritative", freshness: "Current", quality: 94, affectedDimensions: ["intent", "state"], affectedPersonas: ["Checkout Engineering"], status: "Available", source: "Confluence / Checkout Engineering" },
  { id: "EV 02", group: "Architecture", evidence: "Retry Orchestrator Architecture", required: true, provided: true, authority: "Authoritative", freshness: "Current", quality: 92, affectedDimensions: ["state", "scope"], affectedPersonas: ["Checkout Engineering", "Payments Platform"], status: "Available", source: "Architecture Registry" },
  { id: "EV 03", group: "Operational", evidence: "Current Retry Metrics", required: true, provided: true, authority: "Authoritative", freshness: "Current", quality: 95, affectedDimensions: ["state", "outcome"], affectedPersonas: ["Site Reliability Engineering"], status: "Available", source: "Observability Platform" },
  { id: "EV 04", group: "Rollout", evidence: "Initial Rollout Plan", required: true, provided: true, authority: "Authoritative", freshness: "Current", quality: 88, affectedDimensions: ["execution"], affectedPersonas: ["Release Governance"], status: "Available", source: "Release Governance" },
  { id: "EV 05", group: "Dependencies", evidence: "Idempotency Test Results", required: true, provided: true, authority: "Authoritative", freshness: "Current", quality: 93, affectedDimensions: ["evidence", "execution"], affectedPersonas: ["Payments Platform"], status: "Available", source: "Test Platform" },
  { id: "EV 06", group: "Rollback", evidence: "Rollback Threshold", required: true, provided: true, authority: "Authoritative", freshness: "Current", quality: 91, affectedDimensions: ["execution"], affectedPersonas: ["Site Reliability Engineering", "Release Governance"], status: "Available", source: "Runbook Registry" },
  { id: "EV 07", group: "Prior Outcomes", evidence: "Prior Retry Outcome", required: false, provided: true, authority: "Authoritative", freshness: "Aging", quality: 86, affectedDimensions: ["outcome", "enterprise"], affectedPersonas: ["Checkout Engineering"], status: "Available", source: "Organizational Learning" },
  { id: "EV 08", group: "Financial", evidence: "Fraud Loss Analysis", required: true, provided: false, authority: "Not provided", freshness: "Not provided", quality: 0, affectedDimensions: ["evidence", "assumptions"], affectedPersonas: ["Fraud Engineering"], status: "Missing", source: "Risk Technology" },
  { id: "EV 09", group: "Dependencies", evidence: "Regional Dependency Stress Test", required: true, provided: false, authority: "Not provided", freshness: "Not provided", quality: 0, affectedDimensions: ["evidence", "scope"], affectedPersonas: ["Identity Engineering"], status: "Missing", source: "Identity Engineering" },
  { id: "EV 10", group: "Financial", evidence: "Finance Impact Analysis", required: false, provided: false, authority: "Not provided", freshness: "Not provided", quality: 0, affectedDimensions: ["evidence"], affectedPersonas: ["Release Governance"], status: "Potentially Required", source: "Finance" },
  { id: "EV 11", group: "Security", evidence: "Security Review", required: false, provided: false, authority: "Not provided", freshness: "Not provided", quality: 0, affectedDimensions: ["evidence"], affectedPersonas: ["Identity Engineering"], status: "Potentially Required", source: "Security Engineering" },
  { id: "EV 12", group: "Expected Outcomes", evidence: "Checkout Completion Baseline", required: true, provided: true, authority: "Authoritative", freshness: "Current", quality: 92, affectedDimensions: ["outcome"], affectedPersonas: ["Checkout Engineering"], status: "Available", source: "Analytics Platform" },
];

/* ------------------------------------------------------------ assumptions -- */

export const assumptions: CognitiveReadinessAssumption[] = [
  { id: "AS 01", assumption: "Third retry improves checkout completion", category: "Demand", source: "Design Document", confidence: "Moderate High", materiality: "High", affectedPersonas: ["Checkout Engineering"], evidence: "Prior Retry Outcome", validationState: "Explicit" },
  { id: "AS 02", assumption: "Dependencies can absorb 15% retry traffic", category: "Dependency", source: "Rollout Plan", confidence: "Moderate", materiality: "High", affectedPersonas: ["Payments Platform", "Identity Engineering"], evidence: "Not provided", validationState: "Validation Required" },
  { id: "AS 03", assumption: "Fraud loss remains within tolerance", category: "Financial", source: "Design Document", confidence: "Low until evidence", materiality: "High", affectedPersonas: ["Fraud Engineering"], evidence: "Fraud Loss Analysis missing", validationState: "Evidence Required" },
  { id: "AS 04", assumption: "Rollback can execute within five minutes", category: "Operational", source: "Runbook Registry", confidence: "High", materiality: "Critical", affectedPersonas: ["Site Reliability Engineering"], evidence: "Rollback Threshold", validationState: "Validated" },
];

/* ------------------------------------------------------------ constraints -- */

export const constraints: CognitiveReadinessConstraint[] = [
  { id: "CN 01", constraint: "Traffic >10% requires joint approval", type: "Governance", source: "Release Policy v4", authority: "Authoritative", applicability: "Conditional", affectedScope: "Phase 2 expansion", affectedPersonas: ["Release Governance", "Payments Platform"], status: "Active" },
  { id: "CN 02", constraint: "No deployment during final three business days of quarter", type: "Governance", source: "Change Calendar", authority: "Authoritative", applicability: "Calendar", affectedScope: "All phases", affectedPersonas: ["Release Governance"], status: "Active" },
  { id: "CN 03", constraint: "Availability >=99.95%", type: "Reliability", source: "Service Level Registry", authority: "Authoritative", applicability: "Always", affectedScope: "Checkout path", affectedPersonas: ["Site Reliability Engineering"], status: "Active" },
  { id: "CN 04", constraint: "P95 <250ms", type: "Performance", source: "Service Level Registry", authority: "Authoritative", applicability: "Always", affectedScope: "Checkout path", affectedPersonas: ["Checkout Engineering"], status: "Active" },
  { id: "CN 05", constraint: "Retries must preserve idempotency", type: "Correctness", source: "Payments Standard", authority: "Authoritative", applicability: "Payment retries", affectedScope: "Retry Orchestrator", affectedPersonas: ["Payments Platform"], status: "Satisfied" },
];

/* ------------------------------------------------------------ ambiguities -- */

export const ambiguities: CognitiveReadinessAmbiguity[] = [
  { id: "AM 01", text: "selected transient failures", source: "Design Document", whyAmbiguous: "No error class list is provided", interpretations: ["Gateway timeouts only", "Timeouts plus 5xx", "Any non terminal decline"], affectedDimensions: ["intent", "scope"], affectedPersonas: ["Payments Platform", "Fraud Engineering"], materiality: "High", status: "Open" },
  { id: "AM 02", text: "material traffic increase", source: "Rollout Plan", whyAmbiguous: "Material is not bound to a threshold", interpretations: ["Above 10% per Release Policy", "Above 15% per design", "Any measurable increase"], affectedDimensions: ["execution", "assumptions"], affectedPersonas: ["Release Governance"], materiality: "High", status: "Open" },
  { id: "AM 03", text: "temporary rollout", source: "Rollout Plan", whyAmbiguous: "No duration or decommission date", interpretations: ["One release cycle", "Until phase 2 review", "Indefinite"], affectedDimensions: ["execution"], affectedPersonas: ["Site Reliability Engineering"], materiality: "Medium", status: "Open" },
  { id: "AM 04", text: "support peak demand", source: "Design Document", whyAmbiguous: "No demand range is specified", interpretations: ["Historic peak", "Peak plus 20%", "Forecast holiday peak"], affectedDimensions: ["state", "assumptions"], affectedPersonas: ["Payments Platform", "Site Reliability Engineering"], materiality: "Medium", status: "Open" },
];

/* --------------------------------------------------------- contradictions -- */

export const contradictions: CognitiveReadinessContradiction[] = [
  {
    id: "CT 01",
    statementA: "Design Document: Phase 2 = 15% traffic",
    statementB: "Rollout Plan: Phase 2 = 25% traffic",
    conflictType: "Scope / Governance",
    severity: "High",
    affected: ["Release Governance", "Fraud Engineering", "Payments Platform"],
    status: "Unresolved",
  },
];

/* -------------------------------------------------------------- findings -- */

export const findings: CognitiveReadinessFinding[] = [
  { id: "RF 001", type: "Missing Evidence", description: "Fraud Loss Analysis has not been provided for a retry policy change.", dimension: "Evidence Sufficiency", gate: "Evidence Gate", severity: "High", blocking: false, affectedPersonas: ["Fraud Engineering"], affectedConditions: ["Fraud Loss Materiality"], affectedDependencies: ["Fraud Decision Service"], recommendedAction: "Request Fraud Loss Analysis from Risk Technology.", status: "Open" },
  { id: "RF 002", type: "Missing Evidence", description: "Regional Dependency Stress Test has not been provided for EU exposure.", dimension: "Evidence Sufficiency", gate: "Evidence Gate", severity: "High", blocking: false, affectedPersonas: ["Identity Engineering"], affectedConditions: ["Regional Dependency Capacity"], affectedDependencies: ["Regional Token Vault"], recommendedAction: "Request a stress test before regional expansion.", status: "Open" },
  { id: "RF 003", type: "Unresolved Assumption", description: "The demand assumption for 15% traffic is unconfirmed.", dimension: "Assumptions, Constraints & Uncertainty", gate: "Material Impact Context Gate", severity: "Medium", blocking: false, affectedPersonas: ["Payments Platform", "Identity Engineering"], affectedConditions: [], affectedDependencies: ["Payments API"], recommendedAction: "Confirm the demand assumption or carry it forward as an uncertainty marker.", status: "Open" },
  { id: "RF 004", type: "Contradiction", description: "Phase 2 exposure is stated as 15% and 25% in two authoritative sources.", dimension: "Execution & Reversibility", gate: "Execution Safety Gate", severity: "High", blocking: false, affectedPersonas: ["Release Governance", "Payments Platform"], affectedConditions: ["Traffic >10% Joint Approval"], affectedDependencies: [], recommendedAction: "Do not silently resolve. Prompt 2 adds a resolution workflow.", status: "Open" },
  { id: "RF 005", type: "Ambiguity", description: "Selected transient failures is not bound to error classes.", dimension: "Intent & Decision Clarity", gate: "Required Context Gate", severity: "Medium", blocking: false, affectedPersonas: ["Payments Platform", "Fraud Engineering"], affectedConditions: [], affectedDependencies: [], recommendedAction: "Request the error class list from Checkout Engineering.", status: "Open" },
  { id: "RF 006", type: "Dependency Validation Required", description: "Regional Token Vault dependency evidence is stale.", dimension: "Scope & Dependency Context", gate: "Material Impact Context Gate", severity: "Medium", blocking: false, affectedPersonas: ["Identity Engineering"], affectedConditions: ["Regional Dependency Capacity"], affectedDependencies: ["Regional Token Vault"], recommendedAction: "Validate the dependency and refresh evidence freshness.", status: "Open" },
  { id: "RF 007", type: "Policy Binding Required", description: "Fraud loss materiality is not yet bound to an authoritative policy.", dimension: "Enterprise Context Coverage", gate: "Material Impact Context Gate", severity: "Medium", blocking: false, affectedPersonas: ["Fraud Engineering", "Release Governance"], affectedConditions: ["Fraud Loss Materiality"], affectedDependencies: [], recommendedAction: "Route the condition for policy binding.", status: "Open" },
  { id: "RF 008", type: "Expected Outcome Gap", description: "No learning trigger is defined for the outcome review.", dimension: "Outcome Observability", gate: "Required Context Gate", severity: "Low", blocking: false, affectedPersonas: ["Checkout Engineering"], affectedConditions: [], affectedDependencies: [], recommendedAction: "Attach a learning trigger for Organizational Learning.", status: "Open" },
];

/* --------------------------------------------------------------- quality -- */

export const qualityDimensions: { name: string; score: number }[] = [
  { name: "Work Definition Quality", score: 96 },
  { name: "Context Coverage", score: 92 },
  { name: "Evidence Quality", score: 88 },
  { name: "Dependency Quality", score: 86 },
  { name: "Persona Coverage", score: 96 },
  { name: "Condition Coverage", score: 94 },
  { name: "Assumption Transparency", score: 93 },
  { name: "Constraint Transparency", score: 97 },
  { name: "Ambiguity Detection", score: 95 },
  { name: "Contradiction Detection", score: 94 },
  { name: "Execution Context", score: 90 },
  { name: "Outcome Definition", score: 91 },
  { name: "Historical Context Integrity", score: 100 },
];

export const historicalContextRewriteViolations = 0;
export const overallQuality = 94;

/* ------------------------------------------------------------ work context -- */

export const workContext = {
  workItem: "Checkout Retry Policy Update",
  submittingTeam: "Checkout Engineering",
  intent: "Improve checkout completion during transient payment failures",
  currentState: "Two automated retries",
  proposedState: "Three automated retries",
  initialScope: "5% traffic",
  potentialExpansion: "15%",
  systems: ["Retry Orchestrator", "Payments API"],
  dependencies: ["Fraud Decision Service", "Identity Services", "Regional Token Vault"],
  rollout: "Progressive",
  rollback: "Duplicate authorization >0.2% for five minutes",
  expectedOutcome: "Checkout completion +1% to +2%",
  intakePackageVersion: "INT 7001 v3",
  assessmentVersion: "CRA 7001 v2",
  historicalContextVersion: "ECM 2026.08.01",
};

export const readinessStateTone = (s: string) =>
  s === "Ready" ? "green"
    : s === "Conditionally Ready" ? "blue"
      : s === "Blocked" || s === "Remediation Required" ? "red"
        : "amber";
