/**
 * Persona Impact Analysis — deterministic domain models and seeded demonstration data.
 *
 * The page evaluates ONE proposed change through MULTIPLE Team Persona perspectives.
 * No live model, graph database, or backend API is used. All values are synthetic and
 * deterministic so that seeded data can later be replaced by services without redesign.
 */

import type { IntakeKpi } from "../cognitive-intake/data";

export type ImpactDirection = "Positive" | "Neutral" | "Negative" | "Mixed" | "Review Required";
export type ImpactSeverity = "Informational" | "Low" | "Medium" | "High" | "Critical";
export type PiaView = "queue" | "workbench" | "comparison" | "architecture";

export const piaViews: { id: PiaView; label: string }[] = [
  { id: "queue", label: "Analysis Queue" },
  { id: "workbench", label: "Workbench" },
  { id: "comparison", label: "Comparison" },
  { id: "architecture", label: "Architecture" },
];

/* ------------------------------------------------------------- dimensions -- */

export const impactDimensions = [
  "Mission Alignment", "Business Objective Impact", "Customer Impact", "Service Level Impact",
  "Performance Impact", "Reliability Impact", "Security Impact", "Compliance Impact",
  "Financial Impact", "Operational Impact", "Dependency Impact", "Capacity Impact",
  "Data Impact", "Risk Impact", "Control Impact", "Policy Impact", "Change Window Impact",
  "Approval Impact", "Reversibility", "Evidence Sufficiency", "Decision Logic Alignment",
] as const;
export type ImpactDimension = (typeof impactDimensions)[number];

export const severityOrder: ImpactSeverity[] = ["Informational", "Low", "Medium", "High", "Critical"];
export const severityRank = (s: ImpactSeverity) => severityOrder.indexOf(s);

/* ----------------------------------------------------------------- models -- */

export interface PersonaImpactEvaluation {
  id: string;
  intakeId: string;
  intakePackageVersionId: string;
  title: string;
  submittingTeam: string;
  workType: string;
  businessUnit: string;
  environment: string;
  region: string;
  customerJourney: string;
  status: string;
  owner: string;
  selectedPersonaIds: string[];
  currentStageId: string;
  primaryImpact: string;
  highestSeverity: ImpactSeverity;
  overallConfidence: number;
  evidenceCoverage: number;
  conflictCount: number;
  opportunityCount: number;
  findingIds: string[];
  recommendationIds: string[];
  reviewStatus: string;
  riskLevel: string;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface PersonaImpactFinding {
  id: string;
  evaluationId: string;
  personaId: string;
  impactDimension: ImpactDimension;
  title: string;
  description: string;
  direction: ImpactDirection;
  severity: ImpactSeverity;
  impactScoreContribution: number;
  confidence: number;
  conditionIds: string[];
  evidenceReferenceIds: string[];
  dependencyIds: string[];
  riskIds: string[];
  controlIds: string[];
  mitigationIds: string[];
  personaSections: string[];
  reviewRequired: boolean;
  status: string;
}

export interface PersonaImpactScore {
  id: string;
  evaluationId: string;
  personaId: string;
  score: number;
  classification: string;
  confidence: number;
  positiveContribution: number;
  negativeContribution: number;
  governanceContribution: number;
  dependencyContribution: number;
  riskContribution: number;
  evidenceConfidence: number;
  findingIds: string[];
  calculatedAt: string;
}

export interface PersonaImpactConflict {
  id: string;
  evaluationId: string;
  personaAId: string;
  personaBId: string;
  conflictType: string;
  description: string;
  personaAPosition: string;
  personaBPosition: string;
  severity: ImpactSeverity;
  conditionIds: string[];
  evidenceReferenceIds: string[];
  potentialResolution: string;
  reviewStatus: string;
}

export interface PersonaImpactOpportunity {
  id: string;
  evaluationId: string;
  personaIds: string[];
  title: string;
  description: string;
  benefitType: string;
  confidence: number;
  conditionIds: string[];
  evidenceReferenceIds: string[];
}

export interface PersonaImpactRecommendation {
  id: string;
  evaluationId: string;
  personaId: string;
  title: string;
  description: string;
  recommendationType: string;
  priority: string;
  required: boolean;
  conditionIds: string[];
  evidenceReferenceIds: string[];
  mitigationIds: string[];
  status: string;
}

export interface PersonaImpactMitigation {
  id: string;
  evaluationId: string;
  personaId: string;
  findingId: string;
  title: string;
  description: string;
  mitigationType: string;
  owner: string;
  requiredEvidenceIds: string[];
  status: string;
}

export interface PersonaImpactDependencyPath {
  id: string;
  evaluationId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipPath: string[];
  criticality: string;
  confidence: number;
  affectedPersonaIds: string[];
  evidenceReferenceIds: string[];
  propagation: string;
}

export interface PersonaImpactStage {
  id: string;
  name: string;
  sequence: number;
  status: "Running" | "Warning" | "Blocked" | "Idle";
  processedCount: string;
  pendingCount: string;
  failedCount: string;
  warningCount: string;
  successRate: number;
  averageDuration: string;
  p95Duration: string;
  throughput: string;
  slaStatus: string;
  owner: string;
}

export interface PersonaImpactActivity {
  id: string;
  timestamp: string;
  evaluationId: string;
  personaId: string;
  action: string;
  description: string;
  result: string;
  owner: string;
  auditId: string;
}

/* --------------------------------------------------------------- personas -- */

export interface ImpactPersona {
  id: string;
  name: string;
  version: string;
  quality: number;
  confidence: number;
  freshness: string;
  mission: string;
  decisionPriorities: string[];
  successCriteria: string[];
  constraints: string[];
  dependencies: string[];
  risks: string[];
  controls: string[];
  preferredEvidence: string[];
  riskAppetite: string;
  escalationPhilosophy: string;
  approvalRequirements: string[];
  commonTradeoffs: string[];
  owner: string;
}

export const impactPersonas: ImpactPersona[] = [
  {
    id: "PER 4101", name: "Payments Platform", version: "v3.4", quality: 94, confidence: 95, freshness: "Current",
    mission: "Enable reliable, secure, low friction payment processing",
    decisionPriorities: ["Payment Integrity", "Checkout Completion", "Reliability", "Security", "Regulatory Compliance", "Operational Reversibility"],
    successCriteria: ["Availability >= 99.95%", "P95 Latency < 250 ms", "Error Rate Target < 0.3%", "No Duplicate Transactions"],
    constraints: ["Retry changes above 10% traffic require joint approval", "No deployment during final three business days of financial quarter"],
    dependencies: ["Identity Services", "Fraud Decision Service", "Regional Token Vault"],
    risks: ["Duplicate Authorization", "Retry Amplification", "Dependency Saturation"],
    controls: ["Idempotency Validation", "Progressive Rollout", "Traffic Segmentation", "Automated Rollback"],
    preferredEvidence: ["Production Telemetry", "Controlled Experiment", "Dependency Health", "Fraud Loss Metrics"],
    riskAppetite: "Low for payment integrity, moderate for latency",
    escalationPhilosophy: "Escalate on any duplicate authorization signal within five minutes",
    approvalRequirements: ["Payments Reliability", "Fraud Engineering above 10% traffic"],
    commonTradeoffs: ["Completion rate versus duplicate exposure", "Latency versus recovery attempts"],
    owner: "D. Alvarez",
  },
  {
    id: "PER 4102", name: "Checkout Engineering", version: "v2.9", quality: 92, confidence: 93, freshness: "Current",
    mission: "Maximize successful, low friction checkout completion for customers",
    decisionPriorities: ["Checkout Completion", "Customer Experience", "Latency", "Recovery of Transient Failures", "Release Velocity"],
    successCriteria: ["Checkout completion >= 96.5%", "Perceived checkout latency < 2.5 s", "Abandonment < 3%"],
    constraints: ["Customer visible delay above 3 s requires experience review"],
    dependencies: ["Payments API", "Retry Orchestrator", "Fraud Decision Service"],
    risks: ["Customer Perceived Delay", "Duplicate Charge Complaints", "Conversion Regression"],
    controls: ["Client Timeout Budget", "Progressive Rollout", "Experience Telemetry"],
    preferredEvidence: ["Conversion Experiment", "Session Telemetry", "Customer Support Signals"],
    riskAppetite: "Moderate, favors recovery attempts",
    escalationPhilosophy: "Escalate on conversion regression beyond 0.4 points",
    approvalRequirements: ["Checkout Experience Review for customer visible latency changes"],
    commonTradeoffs: ["Recovery attempts versus perceived latency"],
    owner: "M. Chen",
  },
  {
    id: "PER 4103", name: "Fraud Engineering", version: "v3.1", quality: 95, confidence: 94, freshness: "Current",
    mission: "Limit fraud loss exposure while preserving legitimate transaction flow",
    decisionPriorities: ["Fraud Loss Containment", "Decision Accuracy", "Fraud Service Stability", "Regulatory Reporting"],
    successCriteria: ["Fraud loss rate < 0.08%", "Fraud decision P95 < 1.2 s", "False positive rate < 1.4%"],
    constraints: ["Retry volume increases require fraud loss analysis before expansion"],
    dependencies: ["Fraud Decision Service", "Payments API", "Identity Services"],
    risks: ["Fraud Loss Increase", "Fraud Service Saturation", "Decision Timeout Degradation"],
    controls: ["Fraud Loss Monitoring", "Rate Limiting", "Graceful Degradation"],
    preferredEvidence: ["Fraud Loss Analysis", "Decision Latency Telemetry", "Retry Correlation Study"],
    riskAppetite: "Very low for fraud loss",
    escalationPhilosophy: "Escalate immediately when fraud loss trend exceeds baseline by 15%",
    approvalRequirements: ["Fraud Engineering approval above 10% retry traffic"],
    commonTradeoffs: ["Checkout completion versus fraud exposure"],
    owner: "R. Okafor",
  },
  {
    id: "PER 4104", name: "Site Reliability Engineering", version: "v4.0", quality: 96, confidence: 96, freshness: "Current",
    mission: "Protect enterprise service reliability, dependency health, and operational reversibility",
    decisionPriorities: ["Error Budget Protection", "Dependency Health", "Rollback Readiness", "Observability", "Incident Reduction"],
    successCriteria: ["Error budget burn < 2x", "Rollback within 5 minutes", "Dependency saturation < 70%"],
    constraints: ["Change requires documented rollback threshold", "No unmonitored traffic expansion"],
    dependencies: ["Retry Orchestrator", "Regional Token Vault", "Observability Platform"],
    risks: ["Dependency Saturation", "Retry Storm", "Rollback Delay"],
    controls: ["Automated Rollback", "Saturation Alerting", "Progressive Rollout", "Traffic Segmentation"],
    preferredEvidence: ["Dependency Stress Test", "Production Telemetry", "Rollback Drill Results"],
    riskAppetite: "Low for saturation, moderate for controlled experiments",
    escalationPhilosophy: "Escalate to incident command on error budget burn above 4x",
    approvalRequirements: ["SRE review for rollout expansion"],
    commonTradeoffs: ["Recovery attempts versus downstream saturation"],
    owner: "T. Ferreira",
  },
  {
    id: "PER 4105", name: "Identity Engineering", version: "v2.6", quality: 91, confidence: 92, freshness: "Current",
    mission: "Provide accurate, performant identity validation for enterprise transactions",
    decisionPriorities: ["Validation Accuracy", "Token Availability", "Latency", "Regional Compliance"],
    successCriteria: ["Token validation P95 < 90 ms", "Identity availability >= 99.97%"],
    constraints: ["Regional token residency must be preserved"],
    dependencies: ["Regional Token Vault", "Identity Services"],
    risks: ["Validation Load Increase", "Token Vault Contention"],
    controls: ["Token Caching", "Rate Limiting", "Regional Failover"],
    preferredEvidence: ["Validation Load Telemetry", "Regional Dependency Stress Test"],
    riskAppetite: "Moderate",
    escalationPhilosophy: "Escalate on validation latency regression above 20%",
    approvalRequirements: ["Identity review for load increases above 10%"],
    commonTradeoffs: ["Cache freshness versus validation load"],
    owner: "S. Mehta",
  },
  {
    id: "PER 4106", name: "Release Governance", version: "v1.8", quality: 93, confidence: 97, freshness: "Current",
    mission: "Ensure enterprise change follows approved policy, windows, and approval requirements",
    decisionPriorities: ["Policy Adherence", "Approval Completeness", "Change Window Compliance", "Auditability"],
    successCriteria: ["100% approvals recorded", "No unapproved quarter end deployments"],
    constraints: ["Traffic exposure above 10% requires joint approval", "No deployment in final three business days of financial quarter"],
    dependencies: ["Change Management Platform", "Approval Registry"],
    risks: ["Unapproved Expansion", "Change Window Violation", "Audit Finding"],
    controls: ["Approval Gate", "Change Freeze Enforcement", "Audit Trail"],
    preferredEvidence: ["Approval Records", "Change Calendar", "Policy Citations"],
    riskAppetite: "Very low for policy violations",
    escalationPhilosophy: "Escalate to change board on any policy exception request",
    approvalRequirements: ["Payments Reliability", "Fraud Engineering", "Change Board for exceptions"],
    commonTradeoffs: ["Delivery speed versus governed approval"],
    owner: "K. Lindqvist",
  },
];

export const personaById = (id: string) => impactPersonas.find((p) => p.id === id) ?? impactPersonas[0];
export const personaByName = (name: string) => impactPersonas.find((p) => p.name === name) ?? impactPersonas[0];

/* ------------------------------------------------------------- conditions -- */

export interface ImpactCondition {
  id: string;
  statement: string;
  conditionType: string;
  personaIds: string[];
  whyRelevant: string;
  authority: string;
  confidence: number;
  freshness: string;
  impactDimension: ImpactDimension;
  status: string;
}

export const impactConditions: ImpactCondition[] = [
  {
    id: "COND 100421", statement: "Availability >= 99.95%", conditionType: "SLO", personaIds: ["PER 4101"],
    whyRelevant: "Retry behaviour changes affect payment path availability", authority: "Primary",
    confidence: 96, freshness: "Current", impactDimension: "Service Level Impact", status: "Applicable",
  },
  {
    id: "COND 100422", statement: "P95 Latency < 250 ms", conditionType: "Threshold", personaIds: ["PER 4101", "PER 4102"],
    whyRelevant: "Additional retry attempts extend transaction duration", authority: "Primary",
    confidence: 94, freshness: "Current", impactDimension: "Performance Impact", status: "Applicable",
  },
  {
    id: "COND 100425", statement: "Traffic exposure above 10% requires Payments Reliability and Fraud Engineering approval",
    conditionType: "Approval Requirement", personaIds: ["PER 4101", "PER 4103", "PER 4106"],
    whyRelevant: "Maximum planned scope reaches 15% traffic", authority: "Governing",
    confidence: 99, freshness: "Current", impactDimension: "Approval Impact", status: "Conditional",
  },
  {
    id: "COND 100426", statement: "Payments dependencies must remain below 70% saturation",
    conditionType: "Dependency Constraint", personaIds: ["PER 4101", "PER 4104", "PER 4105"],
    whyRelevant: "Retry expansion increases downstream call volume", authority: "Primary",
    confidence: 92, freshness: "Current", impactDimension: "Dependency Impact", status: "Applicable",
  },
  {
    id: "COND 100427", statement: "Payment retries must preserve idempotency", conditionType: "Control",
    personaIds: ["PER 4101", "PER 4102", "PER 4104"],
    whyRelevant: "Additional retry increases duplicate authorization exposure", authority: "Governing",
    confidence: 97, freshness: "Current", impactDimension: "Reliability Impact", status: "Applicable",
  },
  {
    id: "COND 100428", statement: "No deployment during the final three business days of the financial quarter",
    conditionType: "Change Constraint", personaIds: ["PER 4106", "PER 4101"],
    whyRelevant: "Deployment timing determines change window compliance", authority: "Governing",
    confidence: 98, freshness: "Current", impactDimension: "Change Window Impact", status: "Conditional",
  },
  {
    id: "COND 100429", statement: "Fraud decision timeout above 1.2 seconds triggers graceful degradation",
    conditionType: "Escalation Trigger", personaIds: ["PER 4103", "PER 4102", "PER 4104"],
    whyRelevant: "Retry volume increases fraud decision service load", authority: "Primary",
    confidence: 93, freshness: "Current", impactDimension: "Operational Impact", status: "Applicable",
  },
  {
    id: "COND 100430", statement: "Fraud loss rate must remain below 0.08%", conditionType: "Threshold",
    personaIds: ["PER 4103"], whyRelevant: "Repeated authorization attempts can increase fraud exposure",
    authority: "Primary", confidence: 95, freshness: "Current", impactDimension: "Financial Impact", status: "Applicable",
  },
  {
    id: "COND 100431", statement: "Token validation P95 must remain below 90 ms", conditionType: "Threshold",
    personaIds: ["PER 4105"], whyRelevant: "Retries add identity validation calls", authority: "Primary",
    confidence: 91, freshness: "Current", impactDimension: "Capacity Impact", status: "Applicable",
  },
  {
    id: "COND 100432", statement: "Every traffic expansion requires a documented rollback threshold",
    conditionType: "Control", personaIds: ["PER 4104", "PER 4101"],
    whyRelevant: "Reversibility is required before broader exposure", authority: "Governing",
    confidence: 96, freshness: "Current", impactDimension: "Reversibility", status: "Applicable",
  },
];

export const conditionById = (id: string) => impactConditions.find((c) => c.id === id);

/* --------------------------------------------------------------- evidence -- */

export interface ImpactEvidence {
  id: string;
  name: string;
  evidenceType: string;
  personaIds: string[];
  dimensions: ImpactDimension[];
  authority: string;
  freshness: string;
  quality: number;
  required: boolean;
  status: "Provided" | "Missing";
  summary: string;
  source: string;
}

export const impactEvidence: ImpactEvidence[] = [
  {
    id: "EVD 7701", name: "Retry Policy Design Document", evidenceType: "Design Document",
    personaIds: ["PER 4101", "PER 4102"], dimensions: ["Business Objective Impact", "Decision Logic Alignment"],
    authority: "Primary", freshness: "Current", quality: 92, required: true, status: "Provided",
    summary: "Describes the third retry attempt, backoff schedule, and traffic segmentation plan.",
    source: "Checkout Engineering",
  },
  {
    id: "EVD 7702", name: "Current Retry Metrics", evidenceType: "Production Telemetry",
    personaIds: ["PER 4101", "PER 4104"], dimensions: ["Reliability Impact", "Performance Impact"],
    authority: "Primary", freshness: "Current", quality: 95, required: true, status: "Provided",
    summary: "Two retry baseline: 1.9% transient failure recovery, P95 payment latency 214 ms.",
    source: "Observability Platform",
  },
  {
    id: "EVD 7703", name: "Initial Rollout Plan", evidenceType: "Change Plan",
    personaIds: ["PER 4104", "PER 4106"], dimensions: ["Operational Impact", "Change Window Impact"],
    authority: "Primary", freshness: "Current", quality: 90, required: true, status: "Provided",
    summary: "5% traffic segment first, expansion to 15% only after validation gates pass.",
    source: "Site Reliability Engineering",
  },
  {
    id: "EVD 7704", name: "Idempotency Test Results", evidenceType: "Controlled Experiment",
    personaIds: ["PER 4101", "PER 4103"], dimensions: ["Reliability Impact", "Control Impact"],
    authority: "Primary", freshness: "Current", quality: 96, required: true, status: "Provided",
    summary: "12,400 replayed authorizations produced zero duplicate captures under the new retry path.",
    source: "Payments Platform",
  },
  {
    id: "EVD 7705", name: "Rollback Threshold Definition", evidenceType: "Control Definition",
    personaIds: ["PER 4104", "PER 4101"], dimensions: ["Reversibility", "Control Impact"],
    authority: "Governing", freshness: "Current", quality: 94, required: true, status: "Provided",
    summary: "Automatic rollback at duplicate authorization above 0.2% sustained for five minutes.",
    source: "Site Reliability Engineering",
  },
  {
    id: "OUT 3284", name: "Prior Retry Outcome", evidenceType: "Observed Outcome",
    personaIds: ["PER 4101", "PER 4102"], dimensions: ["Business Objective Impact", "Reliability Impact"],
    authority: "Primary", freshness: "Recent", quality: 93, required: false, status: "Provided",
    summary: "2024 retry expansion recovered 1.4% of transient failures with no duplicate capture regression.",
    source: "Enterprise Cognitive Memory",
  },
  {
    id: "LRN 1426", name: "Idempotency Learning Record", evidenceType: "Learning Record",
    personaIds: ["PER 4101", "PER 4103", "PER 4104"], dimensions: ["Risk Impact", "Control Impact"],
    authority: "Primary", freshness: "Recent", quality: 91, required: false, status: "Provided",
    summary: "Duplicate authorization incidents historically follow retry changes without key scoping.",
    source: "Organizational Learning",
  },
  {
    id: "EVD 7706", name: "Fraud Loss Analysis", evidenceType: "Financial Analysis",
    personaIds: ["PER 4103"], dimensions: ["Financial Impact", "Risk Impact"],
    authority: "Primary", freshness: "Missing", quality: 0, required: true, status: "Missing",
    summary: "Required to quantify fraud exposure from additional authorization attempts.",
    source: "Fraud Engineering",
  },
  {
    id: "EVD 7707", name: "Regional Dependency Stress Test", evidenceType: "Stress Test",
    personaIds: ["PER 4104", "PER 4105"], dimensions: ["Dependency Impact", "Capacity Impact"],
    authority: "Primary", freshness: "Missing", quality: 0, required: true, status: "Missing",
    summary: "Required to validate Regional Token Vault behaviour at 15% retry traffic.",
    source: "Site Reliability Engineering",
  },
];

export const evidenceById = (id: string) => impactEvidence.find((e) => e.id === id);

/* ------------------------------------------------------------ evaluations -- */

export const evaluations: PersonaImpactEvaluation[] = [
  {
    id: "EVAL 2048", intakeId: "INT 5521", intakePackageVersionId: "PKG 5521 v4",
    title: "Checkout Retry Policy Update", submittingTeam: "Checkout Engineering",
    workType: "Policy Change", businessUnit: "Digital Commerce", environment: "Production",
    region: "North America", customerJourney: "Checkout",
    status: "Review Required", owner: "M. Chen",
    selectedPersonaIds: impactPersonas.map((p) => p.id),
    currentStageId: "risks", primaryImpact: "Payment Reliability and Fraud Risk",
    highestSeverity: "High", overallConfidence: 94, evidenceCoverage: 86,
    conflictCount: 2, opportunityCount: 2,
    findingIds: [], recommendationIds: [], reviewStatus: "Pending Review", riskLevel: "High",
    startedAt: "Today 08:12", updatedAt: "Today 09:41", completedAt: null,
  },
  {
    id: "EVAL 2049", intakeId: "INT 5522", intakePackageVersionId: "PKG 5522 v2",
    title: "Identity Token Cache Optimization", submittingTeam: "Identity Engineering",
    workType: "Performance Change", businessUnit: "Enterprise Platform", environment: "Production",
    region: "Global", customerJourney: "Authentication",
    status: "Analyzing", owner: "S. Mehta",
    selectedPersonaIds: ["PER 4105", "PER 4101", "PER 4104", "PER 4106"],
    currentStageId: "objectives", primaryImpact: "Latency Improvement",
    highestSeverity: "Medium", overallConfidence: 95, evidenceCoverage: 96,
    conflictCount: 0, opportunityCount: 3,
    findingIds: [], recommendationIds: [], reviewStatus: "Not Required", riskLevel: "Medium",
    startedAt: "Today 07:55", updatedAt: "Today 09:20", completedAt: null,
  },
  {
    id: "EVAL 2050", intakeId: "INT 5523", intakePackageVersionId: "PKG 5523 v6",
    title: "Regional Token Vault Migration", submittingTeam: "Platform Engineering",
    workType: "Infrastructure Migration", businessUnit: "Enterprise Platform", environment: "Production",
    region: "European Union", customerJourney: "Checkout",
    status: "Needs Evidence", owner: "T. Ferreira",
    selectedPersonaIds: ["PER 4101", "PER 4102", "PER 4103", "PER 4104", "PER 4105", "PER 4106"],
    currentStageId: "dependencies", primaryImpact: "Critical Dependency Transition",
    highestSeverity: "Critical", overallConfidence: 88, evidenceCoverage: 79,
    conflictCount: 3, opportunityCount: 1,
    findingIds: [], recommendationIds: [], reviewStatus: "Pending Review", riskLevel: "Critical",
    startedAt: "Yesterday 16:40", updatedAt: "Today 08:05", completedAt: null,
  },
  {
    id: "EVAL 2051", intakeId: "INT 5524", intakePackageVersionId: "PKG 5524 v3",
    title: "Fraud Decision Timeout Adjustment", submittingTeam: "Fraud Engineering",
    workType: "Threshold Change", businessUnit: "Risk & Compliance", environment: "Production",
    region: "North America", customerJourney: "Checkout",
    status: "Analyzing", owner: "R. Okafor",
    selectedPersonaIds: ["PER 4103", "PER 4102", "PER 4101", "PER 4104", "PER 4106"],
    currentStageId: "decision-logic", primaryImpact: "Checkout and Fraud Tradeoff",
    highestSeverity: "High", overallConfidence: 92, evidenceCoverage: 91,
    conflictCount: 2, opportunityCount: 1,
    findingIds: [], recommendationIds: [], reviewStatus: "Pending Review", riskLevel: "High",
    startedAt: "Today 06:30", updatedAt: "Today 09:02", completedAt: null,
  },
  {
    id: "EVAL 2052", intakeId: "INT 5525", intakePackageVersionId: "PKG 5525 v2",
    title: "Checkout Observability Expansion", submittingTeam: "Site Reliability Engineering",
    workType: "Observability Change", businessUnit: "Digital Commerce", environment: "Production",
    region: "Global", customerJourney: "Checkout",
    status: "Analysis Complete", owner: "T. Ferreira",
    selectedPersonaIds: ["PER 4104", "PER 4102", "PER 4101"],
    currentStageId: "results", primaryImpact: "Operational Visibility Improvement",
    highestSeverity: "Low", overallConfidence: 97, evidenceCoverage: 98,
    conflictCount: 0, opportunityCount: 4,
    findingIds: [], recommendationIds: [], reviewStatus: "Complete", riskLevel: "Low",
    startedAt: "Yesterday 11:15", updatedAt: "Today 07:10", completedAt: "Today 07:10",
  },
];

export const evaluationById = (id: string) => evaluations.find((e) => e.id === id) ?? evaluations[0];

export const queueColumns = [
  "Evaluation ID", "Work Item", "Submitting Team", "Personas", "Primary Impact", "Highest Severity",
  "Overall Confidence", "Evidence Coverage", "Conflicts", "Opportunities", "Current Stage",
  "Owner", "Started", "Status", "Actions",
] as const;

/* -------------------------------------------------------------- lifecycle -- */

export const lifecycleStages: PersonaImpactStage[] = [
  { id: "intake", name: "Load Intake Package", sequence: 1, status: "Running", processedCount: "24 active", pendingCount: "0", failedCount: "0", warningCount: "0", successRate: 99.8, averageDuration: "3 s", p95Duration: "6 s", throughput: "24 / hr", slaStatus: "Within SLA", owner: "Intake Services" },
  { id: "scope", name: "Confirm Persona Scope", sequence: 2, status: "Running", processedCount: "42 Personas confirmed", pendingCount: "3", failedCount: "0", warningCount: "1", successRate: 98.9, averageDuration: "9 s", p95Duration: "18 s", throughput: "42 / hr", slaStatus: "Within SLA", owner: "Persona Studio" },
  { id: "context", name: "Retrieve Persona Context", sequence: 3, status: "Running", processedCount: "1,284 context records", pendingCount: "34", failedCount: "0", warningCount: "4", successRate: 97.8, averageDuration: "14 s", p95Duration: "31 s", throughput: "1.2k / hr", slaStatus: "Within SLA", owner: "Cognitive Memory" },
  { id: "conditions", name: "Match Applicable Conditions", sequence: 4, status: "Running", processedCount: "426 conditions matched", pendingCount: "22", failedCount: "1", warningCount: "6", successRate: 96.9, averageDuration: "11 s", p95Duration: "26 s", throughput: "426 / hr", slaStatus: "Within SLA", owner: "Condition Services" },
  { id: "dependencies", name: "Trace Dependencies", sequence: 5, status: "Warning", processedCount: "184 dependency paths", pendingCount: "12 requiring review", failedCount: "1", warningCount: "12", successRate: 93.8, averageDuration: "21 s", p95Duration: "48 s", throughput: "184 / hr", slaStatus: "At Risk", owner: "Platform Engineering" },
  { id: "objectives", name: "Evaluate Objectives & Metrics", sequence: 6, status: "Running", processedCount: "92% complete", pendingCount: "8%", failedCount: "0", warningCount: "3", successRate: 96.4, averageDuration: "16 s", p95Duration: "34 s", throughput: "38 / hr", slaStatus: "Within SLA", owner: "Analysis Services" },
  { id: "constraints", name: "Evaluate Constraints & Policies", sequence: 7, status: "Running", processedCount: "95% complete", pendingCount: "5%", failedCount: "0", warningCount: "2", successRate: 97.1, averageDuration: "12 s", p95Duration: "27 s", throughput: "40 / hr", slaStatus: "Within SLA", owner: "Release Governance" },
  { id: "risks", name: "Evaluate Risks & Controls", sequence: 8, status: "Warning", processedCount: "17 high risk findings", pendingCount: "6", failedCount: "0", warningCount: "17", successRate: 94.2, averageDuration: "23 s", p95Duration: "51 s", throughput: "36 / hr", slaStatus: "At Risk", owner: "Risk Engineering" },
  { id: "decision-logic", name: "Evaluate Decision Logic", sequence: 9, status: "Running", processedCount: "91% complete", pendingCount: "9%", failedCount: "0", warningCount: "4", successRate: 95.6, averageDuration: "18 s", p95Duration: "39 s", throughput: "34 / hr", slaStatus: "Within SLA", owner: "Analysis Services" },
  { id: "score", name: "Score Persona Impact", sequence: 10, status: "Running", processedCount: "38 Personas scored", pendingCount: "4", failedCount: "0", warningCount: "2", successRate: 97.4, averageDuration: "7 s", p95Duration: "15 s", throughput: "38 / hr", slaStatus: "Within SLA", owner: "Analysis Services" },
  { id: "conflicts", name: "Identify Conflicts & Opportunities", sequence: 11, status: "Warning", processedCount: "9 conflicts", pendingCount: "14 opportunities", failedCount: "0", warningCount: "9", successRate: 93.1, averageDuration: "13 s", p95Duration: "29 s", throughput: "23 / hr", slaStatus: "At Risk", owner: "Cross Team Coordination" },
  { id: "recommendations", name: "Generate Recommendations", sequence: 12, status: "Running", processedCount: "36 complete", pendingCount: "6", failedCount: "0", warningCount: "1", successRate: 96.8, averageDuration: "10 s", p95Duration: "22 s", throughput: "36 / hr", slaStatus: "Within SLA", owner: "Analysis Services" },
  { id: "results", name: "Prepare Impact Results", sequence: 13, status: "Running", processedCount: "31 complete", pendingCount: "11", failedCount: "0", warningCount: "2", successRate: 98.2, averageDuration: "8 s", p95Duration: "17 s", throughput: "31 / hr", slaStatus: "Within SLA", owner: "Decision Services" },
];

export const stageById = (id: string) => lifecycleStages.find((s) => s.id === id) ?? lifecycleStages[7];
export const stageName = (id: string) => stageById(id).name;

export const lifecycleCallouts = [
  { severity: "High", text: "Payments retry evaluation has two high severity Persona impacts" },
  { severity: "Warning", text: "Identity dependency confidence below target" },
  { severity: "Warning", text: "Fraud Engineering requires additional evidence" },
  { severity: "Positive", text: "Checkout Engineering shows measurable opportunity" },
];

/* -------------------------------------------------------------------- kpis -- */

export const piaKpis: IntakeKpi[] = [
  {
    id: "active", name: "Active Impact Evaluations", value: "24", change: "+3", context: "Evaluations currently in analysis",
    status: "Healthy", supporting: [{ label: "Healthy", value: "18" }, { label: "Review Required", value: "4" }, { label: "Blocked", value: "2" }],
    trend: [17, 18, 19, 21, 20, 22, 23, 24],
    tooltip: "Evaluations that have loaded a governed Intake Package and are progressing through the analysis lifecycle.",
  },
  {
    id: "personas", name: "Team Personas Evaluated", value: "42", context: "Across 24 evaluations",
    status: "Healthy", supporting: [{ label: "Current Versions", value: "40" }, { label: "Aging", value: "2" }],
    trend: [31, 33, 35, 36, 38, 39, 41, 42],
    tooltip: "Distinct approved Team Personas used as evaluation perspectives. Personas are never modified by this page.",
  },
  {
    id: "impacts", name: "Material Impacts Identified", value: "67", change: "+9", context: "Findings above informational severity",
    status: "Attention", supporting: [{ label: "High", value: "21" }, { label: "Medium", value: "32" }, { label: "Opportunity", value: "14" }],
    trend: [48, 51, 55, 58, 60, 63, 65, 67],
    tooltip: "Impact findings with material consequence to at least one Team Persona.",
  },
  {
    id: "conflicts", name: "Cross Team Conflicts", value: "9", change: "+2", context: "Persona perspectives in tension",
    status: "Attention", supporting: [{ label: "Priority", value: "4" }, { label: "Approval", value: "3" }, { label: "Dependency", value: "2" }],
    trend: [5, 6, 6, 7, 7, 8, 8, 9],
    tooltip: "Conflicts are surfaced for cross team coordination. This page does not resolve them.",
  },
  {
    id: "evidence", name: "Evaluations Needing Evidence", value: "7", context: "Blocked on evidence sufficiency",
    status: "Attention", supporting: [{ label: "Test", value: "3" }, { label: "Dependency", value: "2" }, { label: "Rollback", value: "2" }],
    trend: [9, 9, 8, 8, 7, 8, 7, 7],
    tooltip: "Evaluations where a required evidence record is missing for at least one impact conclusion.",
  },
  {
    id: "confidence", name: "Analysis Confidence", value: "93%", change: "Target 95%", context: "Weighted across active evaluations",
    status: "Healthy", supporting: [{ label: "Above Target", value: "16" }, { label: "Below Target", value: "8" }],
    trend: [88, 89, 90, 91, 91, 92, 93, 93],
    tooltip: "Confidence reflects evidence authority, persona freshness, and condition match strength. It is not a probability of success.",
  },
];

/* ------------------------------------------------------------ filter sets -- */

export const filterOptions = {
  businessUnit: ["All", "Digital Commerce", "Enterprise Platform", "Risk & Compliance"],
  submittingTeam: ["All", "Checkout Engineering", "Identity Engineering", "Platform Engineering", "Fraud Engineering", "Site Reliability Engineering"],
  affectedTeam: ["All", ...impactPersonas.map((p) => p.name)],
  teamPersona: ["All", ...impactPersonas.map((p) => p.name)],
  knowledgeDomain: ["All", "Payments", "Identity", "Fraud", "Reliability", "Governance"],
  workType: ["All", "Policy Change", "Performance Change", "Infrastructure Migration", "Threshold Change", "Observability Change"],
  impactStatus: ["All", "Analyzing", "Review Required", "Needs Evidence", "Analysis Complete"],
  riskLevel: ["All", "Low", "Medium", "High", "Critical"],
  impactSeverity: ["All", ...severityOrder],
  impactDimension: ["All", ...impactDimensions],
  confidenceBand: ["All", "Below 85%", "85-92%", "Above 92%"],
  evidenceCoverage: ["All", "Below 85%", "85-95%", "Above 95%"],
  conditionType: ["All", "SLO", "Threshold", "Approval Requirement", "Dependency Constraint", "Control", "Change Constraint", "Escalation Trigger"],
  dependencyCriticality: ["All", "Critical", "High", "Medium", "Low"],
  approvalRequirement: ["All", "Required", "Conditional", "Not Required"],
  environment: ["All", "Production", "Staging"],
  region: ["All", "Global", "North America", "European Union"],
  customerJourney: ["All", "Checkout", "Authentication"],
  evaluationOwner: ["All", "M. Chen", "S. Mehta", "T. Ferreira", "R. Okafor"],
  reviewStatus: ["All", "Not Required", "Pending Review", "Complete"],
  timeRange: ["Last 24 hours", "Last 7 days", "Last 30 days", "Quarter to date"],
};

export type FilterKey = keyof typeof filterOptions;

export const defaultFilters: Record<FilterKey, string> = Object.fromEntries(
  (Object.keys(filterOptions) as FilterKey[]).map((k) => [k, k === "timeRange" ? "Last 7 days" : "All"]),
) as Record<FilterKey, string>;

/* --------------------------------------------------------- proposal state -- */

export interface ProposalState {
  intent: string;
  currentState: string;
  proposedState: string;
  initialTraffic: number;
  maxTraffic: number;
  deploymentTiming: "Standard window" | "Quarter end window";
  progressiveRollout: boolean;
  idempotencyEvidence: boolean;
  fraudLossEvidence: boolean;
  dependencyStressEvidence: boolean;
  rollbackThreshold: boolean;
}

export const initialProposal: ProposalState = {
  intent: "Improve checkout completion during transient payment failures",
  currentState: "Two automated retries",
  proposedState: "Three automated retries",
  initialTraffic: 5,
  maxTraffic: 15,
  deploymentTiming: "Standard window",
  progressiveRollout: true,
  idempotencyEvidence: true,
  fraudLossEvidence: false,
  dependencyStressEvidence: false,
  rollbackThreshold: true,
};

export const proposalSystems = ["Retry Orchestrator", "Payments API"];
export const proposalRelatedServices = ["Fraud Decision Service", "Identity Services", "Regional Token Vault"];

/* ------------------------------------------------------- analysis engine -- */

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

const finding = (
  p: Partial<PersonaImpactFinding> & {
    id: string; personaId: string; impactDimension: ImpactDimension; title: string;
    description: string; direction: ImpactDirection; severity: ImpactSeverity;
    impactScoreContribution: number; confidence: number;
  },
): PersonaImpactFinding => ({
  evaluationId: "EVAL 2048",
  conditionIds: [], evidenceReferenceIds: [], dependencyIds: [], riskIds: [], controlIds: [],
  mitigationIds: [], personaSections: [], reviewRequired: false, status: "Open", ...p,
});

/** Deterministic per persona evaluation for the selected proposal state. */
export function evaluatePersona(personaId: string, s: ProposalState): PersonaImpactFinding[] {
  const governanceActive = s.maxTraffic > 10 || s.deploymentTiming === "Quarter end window";
  const quarterEnd = s.deploymentTiming === "Quarter end window";
  const out: PersonaImpactFinding[] = [];

  if (personaId === "PER 4101") {
    out.push(finding({
      id: "PIF 8101", personaId, impactDimension: "Business Objective Impact",
      title: "Maintain Payment Availability", direction: "Positive", severity: "Medium",
      description: "Additional retry may recover transient payment failures and protect availability objectives.",
      impactScoreContribution: -8, confidence: 92,
      conditionIds: ["COND 100421"], evidenceReferenceIds: ["OUT 3284", "EVD 7702"],
      personaSections: ["Mission", "Success Criteria"],
    }));
    out.push(finding({
      id: "PIF 8102", personaId, impactDimension: "Reliability Impact",
      title: "Duplicate Transaction Processing", direction: "Negative",
      severity: s.idempotencyEvidence ? "High" : "Critical",
      description: s.idempotencyEvidence
        ? "Additional retry increases duplicate authorization exposure. Idempotency test evidence is present and constrains the risk."
        : "Additional retry increases duplicate authorization exposure and no idempotency test evidence is attached.",
      impactScoreContribution: s.idempotencyEvidence ? 22 : 30,
      confidence: s.idempotencyEvidence ? 96 : 74,
      conditionIds: ["COND 100427"],
      evidenceReferenceIds: s.idempotencyEvidence ? ["EVD 7704", "OUT 3284", "LRN 1426"] : ["LRN 1426"],
      riskIds: ["RSK 501"], controlIds: ["CTL 301"],
      personaSections: ["Risks", "Controls"], reviewRequired: true,
    }));
    out.push(finding({
      id: "PIF 8103", personaId, impactDimension: "Performance Impact",
      title: "Transaction Latency Extension", direction: "Negative", severity: "Medium",
      description: "A third retry attempt can extend transaction duration against the P95 latency threshold.",
      impactScoreContribution: 12, confidence: 91,
      conditionIds: ["COND 100422"], evidenceReferenceIds: ["EVD 7702"],
      personaSections: ["Success Criteria"],
    }));
    out.push(finding({
      id: "PIF 8104", personaId, impactDimension: "Dependency Impact",
      title: "Downstream Call Volume Increase", direction: "Negative",
      severity: s.maxTraffic > 10 ? "High" : "Medium",
      description: "Additional retries increase call volume to Fraud Decision Service, Identity Services, and Regional Token Vault.",
      impactScoreContribution: s.maxTraffic > 10 ? 16 : 11, confidence: s.dependencyStressEvidence ? 94 : 89,
      conditionIds: ["COND 100426"], dependencyIds: ["DEP 901", "DEP 902", "DEP 903"],
      evidenceReferenceIds: s.dependencyStressEvidence ? ["EVD 7707"] : [],
      personaSections: ["Dependencies"],
    }));
    out.push(finding({
      id: "PIF 8105", personaId, impactDimension: "Approval Impact",
      title: governanceActive ? "Joint Approval Requirement Activated" : "Approval Requirement Not Yet Triggered",
      direction: governanceActive ? "Review Required" : "Neutral",
      severity: governanceActive ? "High" : "Low",
      description: governanceActive
        ? `Planned exposure of ${s.maxTraffic}% activates joint Payments Reliability and Fraud Engineering approval.`
        : `Planned exposure of ${s.maxTraffic}% remains below the 10% joint approval threshold.`,
      impactScoreContribution: governanceActive ? 18 : 2, confidence: 99,
      conditionIds: ["COND 100425"], personaSections: ["Constraints", "Approval Requirements"],
      reviewRequired: governanceActive,
    }));
    out.push(finding({
      id: "PIF 8106", personaId, impactDimension: "Reversibility",
      title: s.progressiveRollout ? "Change Remains Reversible" : "Reversibility Degraded",
      direction: s.progressiveRollout ? "Positive" : "Negative",
      severity: s.progressiveRollout ? "Low" : "High",
      description: s.progressiveRollout
        ? "Progressive rollout and a defined rollback threshold preserve operational reversibility."
        : "Progressive rollout is disabled, so exposure cannot be withdrawn incrementally.",
      impactScoreContribution: s.progressiveRollout ? -6 : 17,
      confidence: 94, conditionIds: ["COND 100432"],
      evidenceReferenceIds: s.rollbackThreshold ? ["EVD 7705", "EVD 7703"] : [],
      controlIds: ["CTL 302"], personaSections: ["Controls"],
    }));
  }

  if (personaId === "PER 4102") {
    out.push(finding({
      id: "PIF 8201", personaId, impactDimension: "Customer Impact",
      title: "Checkout Completion Recovery", direction: "Positive", severity: "Medium",
      description: "Transient failure recovery is expected to lift completed checkouts for affected sessions.",
      impactScoreContribution: -12, confidence: 90,
      conditionIds: ["COND 100422"], evidenceReferenceIds: ["OUT 3284", "EVD 7701"],
      personaSections: ["Mission", "Decision Priorities"],
    }));
    out.push(finding({
      id: "PIF 8202", personaId, impactDimension: "Performance Impact",
      title: "Customer Perceived Delay", direction: "Negative", severity: "Medium",
      description: "A third retry adds to perceived checkout wait time within the client timeout budget.",
      impactScoreContribution: 14, confidence: 88,
      conditionIds: ["COND 100422"], evidenceReferenceIds: ["EVD 7702"],
      personaSections: ["Success Criteria", "Risks"],
    }));
    out.push(finding({
      id: "PIF 8203", personaId, impactDimension: "Reliability Impact",
      title: "Duplicate Charge Complaint Exposure", direction: "Negative",
      severity: s.idempotencyEvidence ? "Medium" : "High",
      description: "Duplicate authorizations surface to customers as duplicate charge complaints.",
      impactScoreContribution: s.idempotencyEvidence ? 10 : 18,
      confidence: s.idempotencyEvidence ? 92 : 78,
      conditionIds: ["COND 100427"], evidenceReferenceIds: s.idempotencyEvidence ? ["EVD 7704"] : [],
      personaSections: ["Risks"],
    }));
    out.push(finding({
      id: "PIF 8204", personaId, impactDimension: "Operational Impact",
      title: "Fraud Decision Timeout Interaction", direction: "Mixed", severity: "Medium",
      description: "Retry attempts interact with the fraud decision timeout trigger for graceful degradation.",
      impactScoreContribution: 8, confidence: 87,
      conditionIds: ["COND 100429"], dependencyIds: ["DEP 901"],
      personaSections: ["Dependencies"],
    }));
    out.push(finding({
      id: "PIF 8205", personaId, impactDimension: "Change Window Impact",
      title: quarterEnd ? "Quarter End Timing Blocks Release" : "Change Window Acceptable",
      direction: quarterEnd ? "Review Required" : "Neutral",
      severity: quarterEnd ? "High" : "Informational",
      description: quarterEnd
        ? "The requested deployment window falls inside the quarter end restriction, delaying checkout benefit."
        : "The requested deployment window is outside restricted periods.",
      impactScoreContribution: quarterEnd ? 10 : 0, confidence: 96,
      conditionIds: ["COND 100428"], personaSections: ["Constraints"],
    }));
  }

  if (personaId === "PER 4103") {
    out.push(finding({
      id: "PIF 8301", personaId, impactDimension: "Financial Impact",
      title: "Fraud Loss Exposure Increase", direction: "Negative",
      severity: s.maxTraffic > 10 ? "High" : "Medium",
      description: "Repeated authorization attempts increase the surface for fraudulent transaction success.",
      impactScoreContribution: s.maxTraffic > 10 ? 24 : 16,
      confidence: s.fraudLossEvidence ? 93 : 72,
      conditionIds: ["COND 100430"], evidenceReferenceIds: s.fraudLossEvidence ? ["EVD 7706"] : [],
      riskIds: ["RSK 502"], personaSections: ["Mission", "Risks"], reviewRequired: true,
    }));
    out.push(finding({
      id: "PIF 8302", personaId, impactDimension: "Capacity Impact",
      title: "Fraud Decision Service Volume", direction: "Negative", severity: "High",
      description: "Each retry issues an additional fraud decision call, increasing service load and timeout risk.",
      impactScoreContribution: 18, confidence: 90,
      conditionIds: ["COND 100429"], dependencyIds: ["DEP 901"],
      personaSections: ["Dependencies", "Risks"],
    }));
    out.push(finding({
      id: "PIF 8303", personaId, impactDimension: "Evidence Sufficiency",
      title: s.fraudLossEvidence ? "Fraud Loss Analysis Provided" : "Fraud Loss Analysis Missing",
      direction: s.fraudLossEvidence ? "Positive" : "Review Required",
      severity: s.fraudLossEvidence ? "Low" : "High",
      description: s.fraudLossEvidence
        ? "Fraud loss analysis is attached and supports quantified exposure assessment."
        : "Fraud Engineering cannot quantify exposure without fraud loss analysis for the proposed retry volume.",
      impactScoreContribution: s.fraudLossEvidence ? -6 : 14, confidence: 95,
      evidenceReferenceIds: ["EVD 7706"], personaSections: ["Preferred Evidence"],
      reviewRequired: !s.fraudLossEvidence,
    }));
    out.push(finding({
      id: "PIF 8304", personaId, impactDimension: "Approval Impact",
      title: governanceActive ? "Fraud Approval Required Before Expansion" : "Fraud Approval Not Yet Required",
      direction: governanceActive ? "Review Required" : "Neutral",
      severity: governanceActive ? "High" : "Low",
      description: governanceActive
        ? "Fraud Engineering approval is required before traffic exposure exceeds 10%."
        : "Current planned exposure stays below the approval threshold.",
      impactScoreContribution: governanceActive ? 16 : 2, confidence: 99,
      conditionIds: ["COND 100425"], personaSections: ["Approval Requirements"],
      reviewRequired: governanceActive,
    }));
    out.push(finding({
      id: "PIF 8305", personaId, impactDimension: "Control Impact",
      title: "Graceful Degradation Control Required", direction: "Review Required", severity: "Medium",
      description: "Fraud decision timeout controls must remain effective under increased retry volume.",
      impactScoreContribution: 9, confidence: 91,
      conditionIds: ["COND 100429"], controlIds: ["CTL 303"], personaSections: ["Controls"],
    }));
  }

  if (personaId === "PER 4104") {
    out.push(finding({
      id: "PIF 8401", personaId, impactDimension: "Dependency Impact",
      title: "Dependency Saturation Risk", direction: "Negative",
      severity: s.dependencyStressEvidence ? "Medium" : "High",
      description: "Retry expansion raises call volume across three downstream dependencies.",
      impactScoreContribution: s.dependencyStressEvidence ? 13 : 20,
      confidence: s.dependencyStressEvidence ? 93 : 80,
      conditionIds: ["COND 100426"], dependencyIds: ["DEP 902", "DEP 903"],
      evidenceReferenceIds: s.dependencyStressEvidence ? ["EVD 7707"] : [],
      personaSections: ["Dependencies", "Risks"], reviewRequired: !s.dependencyStressEvidence,
    }));
    out.push(finding({
      id: "PIF 8402", personaId, impactDimension: "Operational Impact",
      title: "Retry Storm Potential", direction: "Negative", severity: "Medium",
      description: "Correlated transient failures can amplify into a retry storm without traffic segmentation.",
      impactScoreContribution: 12, confidence: 89,
      conditionIds: ["COND 100426"], riskIds: ["RSK 503"], controlIds: ["CTL 304"],
      personaSections: ["Risks", "Controls"],
    }));
    out.push(finding({
      id: "PIF 8403", personaId, impactDimension: "Reversibility",
      title: s.progressiveRollout ? "Controlled Rollout Improves Reversibility" : "Rollback Confidence Reduced",
      direction: s.progressiveRollout ? "Positive" : "Negative",
      severity: s.progressiveRollout ? "Low" : "High",
      description: s.progressiveRollout
        ? "Segmented rollout gives SRE a measurable, reversible exposure path."
        : "Without progressive rollout, rollback becomes an all or nothing operation.",
      impactScoreContribution: s.progressiveRollout ? -9 : 19, confidence: 95,
      conditionIds: ["COND 100432"], evidenceReferenceIds: s.rollbackThreshold ? ["EVD 7705"] : [],
      personaSections: ["Controls", "Success Criteria"],
    }));
    out.push(finding({
      id: "PIF 8404", personaId, impactDimension: "Service Level Impact",
      title: "Error Budget Consumption", direction: "Mixed", severity: "Medium",
      description: "Recovery of transient failures may reduce error budget burn while latency rises.",
      impactScoreContribution: 7, confidence: 90,
      conditionIds: ["COND 100421", "COND 100422"], personaSections: ["Decision Priorities"],
    }));
    out.push(finding({
      id: "PIF 8405", personaId, impactDimension: "Evidence Sufficiency",
      title: s.dependencyStressEvidence ? "Dependency Stress Test Provided" : "Regional Dependency Stress Test Missing",
      direction: s.dependencyStressEvidence ? "Positive" : "Review Required",
      severity: s.dependencyStressEvidence ? "Low" : "High",
      description: "Dependency behaviour at maximum planned traffic must be demonstrated before expansion.",
      impactScoreContribution: s.dependencyStressEvidence ? -5 : 13, confidence: 94,
      evidenceReferenceIds: ["EVD 7707"], personaSections: ["Preferred Evidence"],
      reviewRequired: !s.dependencyStressEvidence,
    }));
  }

  if (personaId === "PER 4105") {
    out.push(finding({
      id: "PIF 8501", personaId, impactDimension: "Capacity Impact",
      title: "Additional Token Validation Load", direction: "Negative",
      severity: s.maxTraffic > 10 ? "Medium" : "Low",
      description: "Each retry triggers another identity validation, raising token validation throughput.",
      impactScoreContribution: s.maxTraffic > 10 ? 14 : 9, confidence: 90,
      conditionIds: ["COND 100431"], dependencyIds: ["DEP 903"], personaSections: ["Dependencies"],
    }));
    out.push(finding({
      id: "PIF 8502", personaId, impactDimension: "Performance Impact",
      title: "Token Vault Contention", direction: "Negative", severity: "Medium",
      description: "Regional Token Vault contention could raise validation latency beyond the 90 ms threshold.",
      impactScoreContribution: 11, confidence: s.dependencyStressEvidence ? 92 : 84,
      conditionIds: ["COND 100431", "COND 100426"], evidenceReferenceIds: s.dependencyStressEvidence ? ["EVD 7707"] : [],
      personaSections: ["Risks", "Success Criteria"],
    }));
    out.push(finding({
      id: "PIF 8503", personaId, impactDimension: "Control Impact",
      title: "Rate Limiting Control Applies", direction: "Neutral", severity: "Low",
      description: "Existing rate limiting and regional failover controls remain effective at planned volumes.",
      impactScoreContribution: 3, confidence: 91,
      controlIds: ["CTL 305"], personaSections: ["Controls"],
    }));
    out.push(finding({
      id: "PIF 8504", personaId, impactDimension: "Compliance Impact",
      title: "Regional Residency Preserved", direction: "Positive", severity: "Informational",
      description: "The proposal does not alter regional token residency behaviour.",
      impactScoreContribution: -4, confidence: 96,
      personaSections: ["Constraints"],
    }));
  }

  if (personaId === "PER 4106") {
    out.push(finding({
      id: "PIF 8601", personaId, impactDimension: "Approval Impact",
      title: governanceActive ? "Governed Approval Path Activated" : "No Approval Gate Currently Triggered",
      direction: governanceActive ? "Review Required" : "Neutral",
      severity: governanceActive ? "High" : "Low",
      description: governanceActive
        ? `Planned exposure ${s.maxTraffic}% and timing ${s.deploymentTiming} require a governed approval path before release.`
        : `Planned exposure ${s.maxTraffic}% in a standard window does not activate the joint approval gate.`,
      impactScoreContribution: governanceActive ? 26 : 6, confidence: 99,
      conditionIds: ["COND 100425"], personaSections: ["Constraints", "Approval Requirements"],
      reviewRequired: governanceActive,
    }));
    out.push(finding({
      id: "PIF 8602", personaId, impactDimension: "Change Window Impact",
      title: quarterEnd ? "Quarter End Change Restriction Violated" : "Change Window Compliant",
      direction: quarterEnd ? "Negative" : "Positive",
      severity: quarterEnd ? "Critical" : "Informational",
      description: quarterEnd
        ? "The requested deployment falls inside the final three business days of the financial quarter."
        : "The requested deployment falls outside restricted change periods.",
      impactScoreContribution: quarterEnd ? 24 : -5, confidence: 98,
      conditionIds: ["COND 100428"], personaSections: ["Constraints"], reviewRequired: quarterEnd,
    }));
    out.push(finding({
      id: "PIF 8603", personaId, impactDimension: "Policy Impact",
      title: "Audit Trail Requirement", direction: "Review Required", severity: "Medium",
      description: "Approval records and policy citations must be captured for the traffic expansion decision.",
      impactScoreContribution: governanceActive ? 10 : 4, confidence: 97,
      conditionIds: ["COND 100425"], personaSections: ["Controls"],
    }));
    out.push(finding({
      id: "PIF 8604", personaId, impactDimension: "Evidence Sufficiency",
      title: "Approval Evidence Completeness", direction: s.fraudLossEvidence ? "Neutral" : "Review Required",
      severity: s.fraudLossEvidence ? "Low" : "Medium",
      description: "Approvers require fraud loss analysis and dependency stress results before granting expansion.",
      impactScoreContribution: s.fraudLossEvidence ? 3 : 8, confidence: 94,
      evidenceReferenceIds: ["EVD 7706", "EVD 7707"], personaSections: ["Preferred Evidence"],
    }));
  }

  return out;
}

export function scorePersona(personaId: string, s: ProposalState): PersonaImpactScore {
  const findings = evaluatePersona(personaId, s);
  const negative = findings.filter((f) => f.impactScoreContribution > 0);
  const positive = findings.filter((f) => f.impactScoreContribution < 0);
  const sum = (arr: PersonaImpactFinding[]) => arr.reduce((a, f) => a + Math.abs(f.impactScoreContribution), 0);
  const bucket = (dims: ImpactDimension[]) =>
    sum(findings.filter((f) => dims.includes(f.impactDimension) && f.impactScoreContribution > 0));

  const negativeContribution = sum(negative);
  const positiveContribution = sum(positive);
  const governanceContribution = bucket(["Approval Impact", "Policy Impact", "Change Window Impact"]);
  const dependencyContribution = bucket(["Dependency Impact", "Capacity Impact"]);
  const riskContribution = bucket(["Reliability Impact", "Risk Impact", "Financial Impact"]);
  const evidenceConfidence = Math.round(
    findings.reduce((a, f) => a + f.confidence, 0) / Math.max(1, findings.length),
  );

  const score = clamp(Math.round(negativeContribution + positiveContribution * 0.55));
  const classification =
    score >= 70 ? "High Impact" : score >= 60 ? "Material Impact" : score >= 45 ? "Moderate Impact" : score >= 25 ? "Limited Impact" : "Minimal Impact";

  return {
    id: `PIS ${personaId.replace("PER ", "")}`, evaluationId: "EVAL 2048", personaId,
    score, classification, confidence: evidenceConfidence,
    positiveContribution, negativeContribution, governanceContribution,
    dependencyContribution, riskContribution, evidenceConfidence,
    findingIds: findings.map((f) => f.id), calculatedAt: "Today 09:41",
  };
}

export const personaSummaryMeta: Record<string, { topBenefit: string; topRisk: string; requiredReview: boolean }> = {
  "PER 4101": { topBenefit: "Checkout recovery", topRisk: "Duplicate transactions", requiredReview: true },
  "PER 4102": { topBenefit: "Checkout conversion", topRisk: "Latency and customer delay", requiredReview: false },
  "PER 4103": { topBenefit: "None direct", topRisk: "Fraud loss and fraud service volume", requiredReview: true },
  "PER 4104": { topBenefit: "Measurable controlled rollout", topRisk: "Operational rollback and dependency saturation", requiredReview: false },
  "PER 4105": { topBenefit: "No direct benefit", topRisk: "Additional validation load", requiredReview: false },
  "PER 4106": { topBenefit: "Governed, auditable change", topRisk: "Unapproved traffic expansion", requiredReview: true },
};

/* -------------------------------------------------------------- conflicts -- */

export function conflictsFor(s: ProposalState): PersonaImpactConflict[] {
  const governanceActive = s.maxTraffic > 10 || s.deploymentTiming === "Quarter end window";
  return [
    {
      id: "CFL 6601", evaluationId: "EVAL 2048", personaAId: "PER 4102", personaBId: "PER 4103",
      conflictType: "Business Priority Tradeoff",
      description: "Checkout completion improvement raises fraud exposure that Fraud Engineering must contain.",
      personaAPosition: "Increase Checkout Completion", personaBPosition: "Limit Fraud Exposure",
      severity: "High", conditionIds: ["COND 100430", "COND 100422"],
      evidenceReferenceIds: ["OUT 3284", "EVD 7706"],
      potentialResolution: "Segment retry expansion by risk tier and monitor fraud loss before each expansion step.",
      reviewStatus: "Open",
    },
    {
      id: "CFL 6602", evaluationId: "EVAL 2048", personaAId: "PER 4101", personaBId: "PER 4106",
      conflictType: "Governance Constraint",
      description: "Payments prefers progressive expansion after validation while governance requires approval before exceeding 10% traffic.",
      personaAPosition: "Progressive retry expansion after validation",
      personaBPosition: "Approval required before traffic above 10%",
      severity: governanceActive ? "High" : "Medium",
      conditionIds: ["COND 100425", "COND 100428"], evidenceReferenceIds: ["EVD 7703"],
      potentialResolution: "Pre stage joint approval so validated expansion can proceed without a change window gap.",
      reviewStatus: governanceActive ? "Open" : "Monitoring",
    },
    {
      id: "CFL 6603", evaluationId: "EVAL 2048", personaAId: "PER 4102", personaBId: "PER 4104",
      conflictType: "Operational Tradeoff",
      description: "Aggressive transient retry recovery conflicts with protecting downstream dependency saturation.",
      personaAPosition: "Aggressive transient retry recovery",
      personaBPosition: "Protect downstream dependency saturation",
      severity: "Medium", conditionIds: ["COND 100426"], evidenceReferenceIds: ["EVD 7707"],
      potentialResolution: "Apply retry budget per dependency with saturation based automatic suppression.",
      reviewStatus: "Open",
    },
  ];
}

export const sharedFindings = [
  { id: "SHR 1", text: "All selected Personas agree progressive rollout is preferable to immediate broad rollout", personaIds: impactPersonas.map((p) => p.id), category: "Controls" },
  { id: "SHR 2", text: "Payments, Checkout, and SRE agree rollback thresholds are required", personaIds: ["PER 4101", "PER 4102", "PER 4104"], category: "Controls" },
  { id: "SHR 3", text: "Payments and Fraud agree idempotency evidence is required", personaIds: ["PER 4101", "PER 4103"], category: "Evidence Requirements" },
  { id: "SHR 4", text: "SRE and Identity agree dependency health must be monitored", personaIds: ["PER 4104", "PER 4105"], category: "Dependencies" },
  { id: "SHR 5", text: "Checkout and Payments agree transient failure recovery may improve conversion", personaIds: ["PER 4101", "PER 4102"], category: "Objectives" },
];

export const sharedRisks = ["Duplicate authorization exposure", "Dependency saturation", "Unapproved traffic expansion"];
export const sharedObjectives = ["Protect payment integrity", "Improve transient failure recovery", "Preserve reversibility"];
export const sharedControls = ["Idempotency validation", "Progressive rollout", "Automated rollback", "Traffic segmentation"];
export const sharedEvidenceRequirements = ["Fraud loss analysis", "Regional dependency stress test", "Production telemetry"];

/* --------------------------------------------------------- opportunities -- */

export const opportunities: PersonaImpactOpportunity[] = [
  {
    id: "OPP 4401", evaluationId: "EVAL 2048", personaIds: ["PER 4102", "PER 4101"],
    title: "Transient Failure Conversion Recovery",
    description: "Recovered transient failures convert sessions that currently abandon at the payment step.",
    benefitType: "Customer Outcome", confidence: 90,
    conditionIds: ["COND 100421"], evidenceReferenceIds: ["OUT 3284"],
  },
  {
    id: "OPP 4402", evaluationId: "EVAL 2048", personaIds: ["PER 4104"],
    title: "Segmented Rollout Measurement",
    description: "Traffic segmentation produces a controlled measurement path reusable for future retry changes.",
    benefitType: "Operational Learning", confidence: 92,
    conditionIds: ["COND 100432"], evidenceReferenceIds: ["EVD 7703"],
  },
];

/* -------------------------------------------------- mitigations and recs -- */

export const mitigations: PersonaImpactMitigation[] = [
  { id: "MIT 5501", evaluationId: "EVAL 2048", personaId: "PER 4101", findingId: "PIF 8102", title: "Idempotency Verification", description: "Verify idempotency key scoping across all three retry attempts before expansion.", mitigationType: "Control Verification", owner: "Payments Platform", requiredEvidenceIds: ["EVD 7704"], status: "In Place" },
  { id: "MIT 5502", evaluationId: "EVAL 2048", personaId: "PER 4104", findingId: "PIF 8401", title: "Traffic Segmentation", description: "Expand retry behaviour by traffic segment with saturation gates between steps.", mitigationType: "Rollout Control", owner: "Site Reliability Engineering", requiredEvidenceIds: ["EVD 7703"], status: "In Place" },
  { id: "MIT 5503", evaluationId: "EVAL 2048", personaId: "PER 4101", findingId: "PIF 8106", title: "Rollback at Duplicate Authorization above 0.2% for 5 minutes", description: "Automated rollback trigger bound to duplicate authorization rate.", mitigationType: "Automated Rollback", owner: "Payments Platform", requiredEvidenceIds: ["EVD 7705"], status: "In Place" },
  { id: "MIT 5504", evaluationId: "EVAL 2048", personaId: "PER 4103", findingId: "PIF 8301", title: "Fraud Loss Monitoring", description: "Monitor fraud loss rate per retry segment with an expansion hold rule.", mitigationType: "Monitoring", owner: "Fraud Engineering", requiredEvidenceIds: ["EVD 7706"], status: "Required" },
  { id: "MIT 5505", evaluationId: "EVAL 2048", personaId: "PER 4104", findingId: "PIF 8401", title: "Dependency Saturation Monitoring", description: "Alert on downstream saturation above 70% during any expansion step.", mitigationType: "Monitoring", owner: "Site Reliability Engineering", requiredEvidenceIds: ["EVD 7707"], status: "Required" },
];

export const recommendations: PersonaImpactRecommendation[] = [
  { id: "REC 9901", evaluationId: "EVAL 2048", personaId: "PER 4101", title: "Proceed only through segmented rollout", description: "Proceed only through segmented rollout with validated idempotency, fraud loss monitoring, dependency health validation, and joint approval before traffic exceeds 10%.", recommendationType: "Conditional Proceed", priority: "High", required: true, conditionIds: ["COND 100425", "COND 100427"], evidenceReferenceIds: ["EVD 7704", "EVD 7705"], mitigationIds: ["MIT 5501", "MIT 5502", "MIT 5503"], status: "Proposed" },
  { id: "REC 9902", evaluationId: "EVAL 2048", personaId: "PER 4103", title: "Obtain fraud loss analysis before expansion", description: "Fraud Engineering requires quantified loss exposure for the third retry attempt before approving traffic above 10%.", recommendationType: "Evidence Requirement", priority: "High", required: true, conditionIds: ["COND 100430"], evidenceReferenceIds: ["EVD 7706"], mitigationIds: ["MIT 5504"], status: "Proposed" },
  { id: "REC 9903", evaluationId: "EVAL 2048", personaId: "PER 4104", title: "Validate dependency behaviour at maximum planned traffic", description: "Run the regional dependency stress test at 15% retry traffic before the final expansion step.", recommendationType: "Evidence Requirement", priority: "High", required: true, conditionIds: ["COND 100426"], evidenceReferenceIds: ["EVD 7707"], mitigationIds: ["MIT 5505"], status: "Proposed" },
  { id: "REC 9904", evaluationId: "EVAL 2048", personaId: "PER 4106", title: "Pre stage joint approval record", description: "Capture Payments Reliability and Fraud Engineering approval before the expansion step that crosses 10% traffic.", recommendationType: "Governance Action", priority: "High", required: true, conditionIds: ["COND 100425"], evidenceReferenceIds: [], mitigationIds: [], status: "Proposed" },
  { id: "REC 9905", evaluationId: "EVAL 2048", personaId: "PER 4102", title: "Instrument perceived latency per retry segment", description: "Measure customer perceived checkout latency separately for each retry segment.", recommendationType: "Measurement", priority: "Medium", required: false, conditionIds: ["COND 100422"], evidenceReferenceIds: ["EVD 7702"], mitigationIds: [], status: "Proposed" },
];

export const requiredReviewers = ["Payments Reliability", "Fraud Engineering", "Site Reliability Engineering"];

/* ------------------------------------------------------------ dependencies -- */

export const dependencyPaths: PersonaImpactDependencyPath[] = [
  { id: "DEP 901", evaluationId: "EVAL 2048", sourceEntityId: "Retry Orchestrator", targetEntityId: "Fraud Decision Service", relationshipPath: ["CHANGES", "DEPENDS ON"], criticality: "Critical", confidence: 93, affectedPersonaIds: ["PER 4103", "PER 4102"], evidenceReferenceIds: ["EVD 7702"], propagation: "Outbound call volume increase" },
  { id: "DEP 902", evaluationId: "EVAL 2048", sourceEntityId: "Payments API", targetEntityId: "Identity Services", relationshipPath: ["DEPENDS ON"], criticality: "High", confidence: 90, affectedPersonaIds: ["PER 4105", "PER 4101"], evidenceReferenceIds: [], propagation: "Validation load increase" },
  { id: "DEP 903", evaluationId: "EVAL 2048", sourceEntityId: "Identity Services", targetEntityId: "Regional Token Vault", relationshipPath: ["DEPENDS ON", "PROVIDES TO"], criticality: "Critical", confidence: 88, affectedPersonaIds: ["PER 4105", "PER 4104"], evidenceReferenceIds: ["EVD 7707"], propagation: "Token contention risk" },
  { id: "DEP 904", evaluationId: "EVAL 2048", sourceEntityId: "Retry Orchestrator", targetEntityId: "Checkout Customer Journey", relationshipPath: ["IMPACTS"], criticality: "High", confidence: 92, affectedPersonaIds: ["PER 4102"], evidenceReferenceIds: ["OUT 3284"], propagation: "Customer perceived latency" },
  { id: "DEP 905", evaluationId: "EVAL 2048", sourceEntityId: "Checkout Retry Policy Update", targetEntityId: "Release Governance Persona", relationshipPath: ["GOVERNED BY", "REQUIRES REVIEW FROM"], criticality: "Critical", confidence: 99, affectedPersonaIds: ["PER 4106"], evidenceReferenceIds: [], propagation: "Approval gate activation" },
];

export interface GraphNode {
  id: string; label: string; kind: "change" | "service" | "persona" | "journey";
  x: number; y: number; summary: string;
}
export interface GraphEdge { id: string; from: string; to: string; label: string; kind: "dependency" | "governance" | "customer" | "ownership" }

export const graphNodes: GraphNode[] = [
  { id: "N1", label: "Checkout Retry Policy Update", kind: "change", x: 50, y: 8, summary: "Proposed change under evaluation. Three automated retries, 5% to 15% traffic." },
  { id: "N2", label: "Retry Orchestrator", kind: "service", x: 22, y: 28, summary: "Primary system changed by the proposal." },
  { id: "N3", label: "Payments API", kind: "service", x: 50, y: 30, summary: "Primary payment execution path." },
  { id: "N4", label: "Payments Platform", kind: "persona", x: 12, y: 52, summary: "Owns payment integrity and reliability objectives." },
  { id: "N5", label: "Checkout Engineering", kind: "persona", x: 33, y: 68, summary: "Owns checkout completion and customer experience." },
  { id: "N6", label: "Fraud Decision Service", kind: "service", x: 72, y: 30, summary: "Evaluates each authorization attempt." },
  { id: "N7", label: "Fraud Engineering", kind: "persona", x: 84, y: 52, summary: "Owns fraud loss containment and decision accuracy." },
  { id: "N8", label: "Identity Services", kind: "service", x: 62, y: 52, summary: "Validates identity tokens for each attempt." },
  { id: "N9", label: "Identity Engineering", kind: "persona", x: 70, y: 72, summary: "Owns token validation performance and residency." },
  { id: "N10", label: "Regional Token Vault", kind: "service", x: 44, y: 52, summary: "Stores regional tokens used for validation." },
  { id: "N11", label: "Site Reliability Engineering", kind: "persona", x: 24, y: 88, summary: "Owns dependency health, error budget, and rollback readiness." },
  { id: "N12", label: "Checkout Customer Journey", kind: "journey", x: 52, y: 88, summary: "Customer facing journey affected by latency and completion." },
  { id: "N13", label: "Release Governance", kind: "persona", x: 86, y: 12, summary: "Owns approval requirements and change window policy." },
];

export const graphEdges: GraphEdge[] = [
  { id: "E1", from: "N1", to: "N2", label: "CHANGES", kind: "dependency" },
  { id: "E2", from: "N1", to: "N3", label: "CHANGES", kind: "dependency" },
  { id: "E3", from: "N3", to: "N4", label: "OWNED BY", kind: "ownership" },
  { id: "E4", from: "N2", to: "N5", label: "OWNED BY", kind: "ownership" },
  { id: "E5", from: "N3", to: "N6", label: "DEPENDS ON", kind: "dependency" },
  { id: "E6", from: "N6", to: "N7", label: "OWNED BY", kind: "ownership" },
  { id: "E7", from: "N3", to: "N8", label: "DEPENDS ON", kind: "dependency" },
  { id: "E8", from: "N8", to: "N10", label: "DEPENDS ON", kind: "dependency" },
  { id: "E9", from: "N8", to: "N9", label: "OWNED BY", kind: "ownership" },
  { id: "E10", from: "N10", to: "N11", label: "MEASURED BY", kind: "dependency" },
  { id: "E11", from: "N2", to: "N12", label: "IMPACTS", kind: "customer" },
  { id: "E12", from: "N12", to: "N5", label: "PROVIDES TO", kind: "customer" },
  { id: "E13", from: "N1", to: "N13", label: "GOVERNED BY", kind: "governance" },
  { id: "E14", from: "N13", to: "N4", label: "REQUIRES REVIEW FROM", kind: "governance" },
  { id: "E15", from: "N6", to: "N11", label: "MEASURED BY", kind: "dependency" },
];

export const graphFilters = [
  { id: "all", label: "All Entities" },
  { id: "personas", label: "Personas Only" },
  { id: "services", label: "Services Only" },
  { id: "critical", label: "Critical Paths" },
  { id: "customer", label: "Customer Impact Path" },
  { id: "governance", label: "Governance Path" },
  { id: "dependency", label: "Dependency Path" },
];

/* ---------------------------------------------------------------- quality -- */

export const qualityDimensions = [
  { name: "Persona Coverage", current: 96, target: 95, trend: "+2", affected: 1 },
  { name: "Condition Coverage", current: 94, target: 95, trend: "+1", affected: 3 },
  { name: "Evidence Coverage", current: 86, target: 95, trend: "-1", affected: 7 },
  { name: "Dependency Coverage", current: 92, target: 95, trend: "+3", affected: 4 },
  { name: "Risk Detection", current: 95, target: 94, trend: "+2", affected: 1 },
  { name: "Control Mapping", current: 94, target: 94, trend: "0", affected: 2 },
  { name: "Conflict Detection", current: 91, target: 93, trend: "+1", affected: 5 },
  { name: "Recommendation Traceability", current: 96, target: 95, trend: "+1", affected: 0 },
  { name: "Persona Freshness", current: 95, target: 95, trend: "0", affected: 2 },
  { name: "Explanation Coverage", current: 98, target: 96, trend: "+1", affected: 0 },
];

export const overallQuality = 93;

/* --------------------------------------------------------------- activity -- */

export const activityRows: PersonaImpactActivity[] = [
  { id: "ACT 1", timestamp: "Today 09:41", evaluationId: "EVAL 2048", personaId: "PER 4103", action: "Finding Raised", description: "Fraud loss exposure increase flagged for review", result: "Warning", owner: "Analysis Services", auditId: "AUD 77120" },
  { id: "ACT 2", timestamp: "Today 09:22", evaluationId: "EVAL 2048", personaId: "PER 4106", action: "Governance Evaluated", description: "Approval requirement evaluated against planned traffic exposure", result: "Success", owner: "Release Governance", auditId: "AUD 77118" },
  { id: "ACT 3", timestamp: "Today 09:04", evaluationId: "EVAL 2050", personaId: "PER 4104", action: "Dependency Traced", description: "Regional Token Vault propagation path expanded", result: "Warning", owner: "Platform Engineering", auditId: "AUD 77115" },
  { id: "ACT 4", timestamp: "Today 08:47", evaluationId: "EVAL 2048", personaId: "PER 4101", action: "Evidence Linked", description: "Idempotency test results attached to duplicate transaction finding", result: "Success", owner: "Payments Platform", auditId: "AUD 77111" },
  { id: "ACT 5", timestamp: "Today 08:12", evaluationId: "EVAL 2048", personaId: "PER 4101", action: "Analysis Started", description: "Intake Package PKG 5521 v4 loaded for persona impact analysis", result: "Success", owner: "Analysis Services", auditId: "AUD 77104" },
];

/* ----------------------------------------------------------- result panel -- */

export function resultSummary(s: ProposalState) {
  const personaIds = impactPersonas.map((p) => p.id);
  const findings = personaIds.flatMap((id) => evaluatePersona(id, s));
  const material = findings.filter((f) => severityRank(f.severity) >= severityRank("Medium"));
  const scores = personaIds.map((id) => scorePersona(id, s));
  const highest = [...scores].sort((a, b) => b.score - a.score)[0];
  const governance = scores.find((sc) => sc.personaId === "PER 4106")!;
  const missing = impactEvidence.filter((e) =>
    (e.id === "EVD 7706" && !s.fraudLossEvidence) ||
    (e.id === "EVD 7707" && !s.dependencyStressEvidence) ||
    (e.id === "EVD 7704" && !s.idempotencyEvidence));
  const coverage = Math.round(((impactEvidence.length - missing.length) / impactEvidence.length) * 100);
  const confidence = Math.round(findings.reduce((a, f) => a + f.confidence, 0) / findings.length);
  return {
    personaCount: personaIds.length,
    conditionCount: 18,
    dependencyPathCount: 12,
    materialFindingCount: material.length,
    conflictCount: conflictsFor(s).filter((c) => c.reviewStatus === "Open").length,
    opportunityCount: opportunities.length,
    mitigationCount: mitigations.length,
    missingEvidence: missing.map((m) => m.name),
    confidence,
    coverage,
    highestPersona: personaById(highest.personaId).name,
    highestScore: highest.score,
    governanceScore: governance.score,
    scores,
  };
}
