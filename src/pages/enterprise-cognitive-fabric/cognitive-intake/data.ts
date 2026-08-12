/**
 * Cognitive Intake — deterministic domain models and seeded demonstration data.
 *
 * Cognitive Intake is the governed entry point for NEW WORK entering the
 * Enterprise Cognitive Fabric. It understands and structures incoming work; it
 * does NOT evaluate impact and does NOT produce a Cognitive Readiness score.
 *
 * All data is synthetic. Service accessors are shaped so a real API can replace
 * the seeds without redesigning the product surface.
 */

/* ------------------------------------------------------------------ types -- */

export type IntakeView = "queue" | "workbench" | "operations" | "executive";

export type IntakeServiceState =
  | "Operational" | "Analyzing" | "Needs Attention" | "Backlogged"
  | "Degraded" | "Paused" | "Maintenance";

export type IntakeWorkType =
  | "Feature Change" | "Configuration Change" | "Architecture Change"
  | "Infrastructure Change" | "Security Change" | "Policy Change"
  | "Process Change" | "Data Change" | "API Change" | "Release Change"
  | "Capacity Change" | "Reliability Improvement" | "Incident Remediation"
  | "Compliance Change" | "Vendor Change" | "Customer Experience Change"
  | "Governance Exception" | "Observability Change" | "Performance Change";

export interface CognitiveIntake {
  id: string;
  title: string;
  description: string;
  workType: IntakeWorkType;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: string;
  submittingTeamId: string;
  submittingTeamName: string;
  workOwner: string;
  technicalOwner: string;
  businessUnit: string;
  requestedDate: string;
  targetDate: string;
  environment: string;
  region: string;
  submissionMethod: string;
  sourceSystem: string;
  sourceRecordId: string;
  accessClassification: "Internal" | "Confidential" | "Restricted";
  originalSubmissionId: string;
  intent: string;
  currentState: string;
  proposedState: string;
  scope: string;
  expectedOutcomes: string[];
  rolloutStrategy: string;
  trafficExposure: number;
  rollbackPlan: string;
  rollbackThreshold: string;
  contextMatchScore: number;
  evidenceCoverage: number;
  intakeConfidence: number;
  packageCompleteness: number;
  currentStageId: string;
  candidatePersonaIds: string[];
  applicableConditionIds: string[];
  relatedDecisionIds: string[];
  relatedOutcomeIds: string[];
  relatedLearningRecordIds: string[];
  gapIds: string[];
  clarificationTaskIds: string[];
  intakePackageId: string;
  missingItems: number;
  conditionsMatched: number;
  submittedAt: string;
  ageHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface CognitiveIntakeChangeElement {
  id: string;
  intakeId: string;
  elementType: string;
  subjectType: string;
  subjectId: string;
  subjectName: string;
  currentValue: string;
  proposedValue: string;
  unit: string;
  scope: string;
  confidence: number;
  sourceEvidenceIds: string[];
  status: string;
  /** Workbench highlight linkage: proposal fragments → context record ids. */
  proposalAnchor?: string;
  contextIds: string[];
  packageSections: string[];
}

export interface CognitiveIntakeEntityMatch {
  id: string;
  intakeId: string;
  detectedValue: string;
  entityType: string;
  canonicalEntityId: string;
  canonicalName: string;
  confidence: number;
  owner: string;
  status: string;
}

export type IntakeMemoryType =
  | "Team Persona" | "Business Condition" | "Policy" | "Risk" | "Control"
  | "Prior Decision" | "Prior Outcome" | "Learning Record" | "Evidence";

export interface CognitiveIntakeContextMatch {
  id: string;
  intakeId: string;
  memoryRecordId: string;
  memoryType: IntakeMemoryType;
  title: string;
  relevanceScore: number;
  reason: string;
  authority: string;
  confidence: number;
  freshness: string;
  included: boolean;
  relationshipType: string;
  evidenceCount: number;
  packageSections: string[];
  /** Conditional activation — surfaced only when the decomposition triggers it. */
  activation?: "traffic-over-10" | "quarter-end";
}

export interface CognitiveIntakePersonaCandidate {
  id: string;
  intakeId: string;
  personaId: string;
  personaName: string;
  teamId: string;
  teamName: string;
  matchConfidence: number;
  matchReason: string;
  relationshipTypes: string[];
  applicableConditionIds: string[];
  evidenceReferenceIds: string[];
  criticality: "Critical Dependency" | "Supporting" | "Informational";
  selectionState: "Included" | "Excluded" | "Primary";
}

export interface CognitiveIntakeEvidence {
  id: string;
  intakeId: string;
  name: string;
  evidenceType: string;
  category: string;
  source: string;
  authority: string;
  freshness: string;
  owner: string;
  required: "Required" | "Optional" | "Potentially Required";
  provided: boolean;
  qualityScore: number;
  status: string;
  evidenceRecordId: string;
  /** Closed by a synthetic evidence addition in the Workbench. */
  closesGapId?: string;
}

export interface CognitiveIntakeGap {
  id: string;
  intakeId: string;
  intakeTitle: string;
  gapType: string;
  question: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  requiredForNextStage: boolean;
  assignedTo: string;
  dueDate: string;
  impact: string;
  status: string;
  resolution: string | null;
}

export interface CognitiveIntakeRelatedWork {
  id: string;
  intakeId: string;
  relatedRecordType: string;
  relatedRecordId: string;
  title: string;
  relationshipType: string;
  similarity: number;
  date: string;
  owner: string;
  outcome: string;
  relevance: string;
  potentialDuplicate: boolean;
  included: boolean;
  status: string;
}

export interface CognitiveIntakePackage {
  id: string;
  intakeId: string;
  intent: string;
  currentState: string;
  proposedState: string;
  scope: string;
  affectedEntityIds: string[];
  candidatePersonaIds: string[];
  applicableConditionIds: string[];
  dependencyIds: string[];
  risks: { name: string; severity: "High" | "Medium" | "Low" }[];
  assumptions: string[];
  providedEvidenceIds: string[];
  missingEvidence: string[];
  relatedDecisionIds: string[];
  relatedOutcomeIds: string[];
  relatedLearningRecordIds: string[];
  governanceRequirements: string[];
  openQuestions: string[];
  contextConfidence: number;
  packageCompleteness: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CognitiveIntakeStage {
  id: string;
  name: string;
  sequence: number;
  status: "Running" | "Warning" | "Blocked" | "Idle";
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
  description: string;
}

export interface CognitiveIntakeActivity {
  id: string;
  timestamp: string;
  intakeId: string;
  action: string;
  description: string;
  teamId: string;
  result: "Success" | "Warning" | "Blocked";
  owner: string;
  auditId: string;
}

export interface IntakeKpi {
  id: string;
  name: string;
  value: string;
  change?: string;
  context: string;
  status: "Healthy" | "Attention" | "Critical";
  supporting: { label: string; value: string }[];
  trend: number[];
  tooltip: string;
}

/* -------------------------------------------------------------------- kpis -- */

export const intakeKpis: IntakeKpi[] = [
  {
    id: "incoming", name: "Incoming Work", value: "186", change: "+28 today",
    context: "Work items received into governed intake",
    status: "Healthy",
    supporting: [{ label: "Today", value: "28" }, { label: "Active", value: "62" }],
    trend: [128, 134, 141, 149, 156, 168, 177, 186],
    tooltip: "Total incoming work received into Cognitive Intake for the selected time range.",
  },
  {
    id: "in-progress", name: "Intakes In Progress", value: "14",
    context: "Currently moving through intake stages",
    status: "Attention",
    supporting: [{ label: "Healthy", value: "10" }, { label: "Needs Attention", value: "3" }, { label: "Blocked", value: "1" }],
    trend: [9, 11, 12, 13, 12, 14, 15, 14],
    tooltip: "Work items actively progressing through the Cognitive Intake lifecycle.",
  },
  {
    id: "context-match", name: "Enterprise Context Matched", value: "91%",
    context: "169 of 186 active items",
    status: "Healthy",
    supporting: [{ label: "Matched", value: "169" }, { label: "Unmatched", value: "17" }],
    trend: [82, 84, 86, 87, 88, 90, 90, 91],
    tooltip: "Share of incoming work with enterprise context successfully retrieved from Enterprise Cognitive Memory.",
  },
  {
    id: "clarification", name: "Needs Clarification", value: "17",
    context: "Blocking information gaps across active work",
    status: "Attention",
    supporting: [
      { label: "Missing Evidence", value: "7" }, { label: "Ambiguous Scope", value: "5" },
      { label: "Missing Owner", value: "3" }, { label: "Unsupported Assumptions", value: "2" },
    ],
    trend: [24, 23, 21, 20, 19, 18, 18, 17],
    tooltip: "Work items where required information is missing, ambiguous, or unsupported.",
  },
  {
    id: "personas", name: "Candidate Personas Identified", value: "42",
    context: "Across 24 active work items",
    status: "Healthy",
    supporting: [{ label: "Work Items", value: "24" }, { label: "Avg per Item", value: "5.2" }],
    trend: [28, 31, 33, 35, 37, 39, 41, 42],
    tooltip: "Team Personas identified as potentially relevant. Impact scoring happens later in Persona Impact Analysis.",
  },
  {
    id: "packages", name: "Intake Packages Complete", value: "152",
    change: "82%",
    context: "Structurally complete enough to enter the next stage",
    status: "Healthy",
    supporting: [{ label: "Complete", value: "152" }, { label: "Incomplete", value: "34" }],
    trend: [118, 124, 131, 137, 142, 147, 150, 152],
    tooltip: "Structured Intake Packages that are complete. This is package completeness, not a Cognitive Readiness score.",
  },
];

/* --------------------------------------------------------------- lifecycle -- */

export const intakeLifecycleStages: CognitiveIntakeStage[] = [
  { id: "receive", name: "Receive Incoming Work", sequence: 1, status: "Running", processedCount: 186, pendingCount: 8, failedCount: 0, warningCount: 1, successRate: 99.8, averageDuration: "8 s", p95Duration: "22 s", throughput: "28 / day", slaStatus: "Within SLA", owner: "Intake Operations", description: "Accept incoming work from governed submission channels." },
  { id: "preserve", name: "Preserve Original Submission", sequence: 2, status: "Running", processedCount: 184, pendingCount: 2, failedCount: 0, warningCount: 1, successRate: 99.6, averageDuration: "3 s", p95Duration: "9 s", throughput: "28 / day", slaStatus: "Within SLA", owner: "Intake Operations", description: "Store the immutable original submission with content hash and access class." },
  { id: "classify", name: "Classify Work Type", sequence: 3, status: "Running", processedCount: 179, pendingCount: 7, failedCount: 1, warningCount: 3, successRate: 98.1, averageDuration: "12 s", p95Duration: "40 s", throughput: "27 / day", slaStatus: "Within SLA", owner: "Intake Operations", description: "Assign the governed work type taxonomy to incoming work." },
  { id: "decompose", name: "Decompose Proposed Change", sequence: 4, status: "Running", processedCount: 174, pendingCount: 12, failedCount: 2, warningCount: 6, successRate: 96.8, averageDuration: "48 s", p95Duration: "2 m 10 s", throughput: "26 / day", slaStatus: "Within SLA", owner: "Change Modeling", description: "Break the proposal into structured change elements with current and proposed state." },
  { id: "entities", name: "Resolve Enterprise Entities", sequence: 5, status: "Warning", processedCount: 162, pendingCount: 24, failedCount: 3, warningCount: 11, successRate: 93.4, averageDuration: "1 m 04 s", p95Duration: "3 m 25 s", throughput: "24 / day", slaStatus: "At Risk", owner: "Entity Resolution", description: "Map detected values to canonical enterprise systems, services, products, and teams." },
  { id: "context", name: "Retrieve Enterprise Context", sequence: 6, status: "Running", processedCount: 169, pendingCount: 17, failedCount: 1, warningCount: 5, successRate: 96.2, averageDuration: "52 s", p95Duration: "2 m 40 s", throughput: "25 / day", slaStatus: "Within SLA", owner: "Memory Services", description: "Retrieve relevant Enterprise Cognitive Memory for the resolved entities." },
  { id: "personas", name: "Identify Candidate Personas", sequence: 7, status: "Running", processedCount: 164, pendingCount: 22, failedCount: 1, warningCount: 6, successRate: 95.6, averageDuration: "34 s", p95Duration: "1 m 48 s", throughput: "25 / day", slaStatus: "Within SLA", owner: "Persona Services", description: "Identify Team Personas that may care about the proposed work." },
  { id: "conditions", name: "Identify Applicable Conditions", sequence: 8, status: "Running", processedCount: 160, pendingCount: 26, failedCount: 2, warningCount: 8, successRate: 94.8, averageDuration: "41 s", p95Duration: "2 m 02 s", throughput: "24 / day", slaStatus: "Within SLA", owner: "Condition Services", description: "Match approved Business Conditions that govern the proposed work." },
  { id: "evidence", name: "Evaluate Evidence & Gaps", sequence: 9, status: "Warning", processedCount: 152, pendingCount: 34, failedCount: 2, warningCount: 17, successRate: 91.7, averageDuration: "1 m 22 s", p95Duration: "4 m 05 s", throughput: "23 / day", slaStatus: "At Risk", owner: "Evidence Governance", description: "Inventory supplied evidence, expose gaps, ambiguity, and unsupported assumptions." },
  { id: "package", name: "Build Intake Package", sequence: 10, status: "Running", processedCount: 152, pendingCount: 14, failedCount: 0, warningCount: 4, successRate: 97.1, averageDuration: "26 s", p95Duration: "1 m 12 s", throughput: "23 / day", slaStatus: "Within SLA", owner: "Intake Operations", description: "Assemble the structured Intake Package from work, context, evidence, and gaps." },
  { id: "route", name: "Route to Cognitive Readiness", sequence: 11, status: "Running", processedCount: 138, pendingCount: 14, failedCount: 0, warningCount: 2, successRate: 99.1, averageDuration: "6 s", p95Duration: "18 s", throughput: "22 / day", slaStatus: "Within SLA", owner: "Intake Operations", description: "Hand the completed Intake Package to Cognitive Readiness Assessment." },
];

export const lifecycleCallouts = [
  { id: "c1", tone: "amber" as const, text: "Entity resolution requires attention for 5 incoming items" },
  { id: "c2", tone: "amber" as const, text: "17 work items require clarification" },
  { id: "c3", tone: "blue" as const, text: "Checkout Retry proposal matched 6 candidate Personas" },
  { id: "c4", tone: "green" as const, text: "Enterprise Memory context retrieval healthy" },
  { id: "c5", tone: "green" as const, text: "Readiness routing operational" },
];

/* ------------------------------------------------------------------ queue -- */

export const intakes: CognitiveIntake[] = [
  {
    id: "INT 7001", title: "Checkout Retry Policy Update",
    description: "Increase automated payment retry attempts from two to three for selected transient payment failures.",
    workType: "Configuration Change", priority: "High", status: "Needs Clarification",
    submittingTeamId: "team-checkout", submittingTeamName: "Checkout Engineering",
    workOwner: "Marcus Lee", technicalOwner: "Priya Raman", businessUnit: "Digital Commerce",
    requestedDate: "2026-07-28", targetDate: "2026-08-21", environment: "Production", region: "Global",
    submissionMethod: "Change Portal", sourceSystem: "Enterprise Change Management", sourceRecordId: "CHG 88214",
    accessClassification: "Internal", originalSubmissionId: "SUB 41002",
    intent: "Improve checkout completion when temporary payment service failures occur.",
    currentState: "Two automated retries", proposedState: "Three automated retries",
    scope: "Selected transient decline categories on Payments API and Retry Orchestrator",
    expectedOutcomes: ["Reduce customer checkout abandonment", "1 to 2 percent checkout completion improvement"],
    rolloutStrategy: "5% → 25% → 50% → 100% after validation", trafficExposure: 5,
    rollbackPlan: "Progressive rollback to two retries via configuration flag",
    rollbackThreshold: "Not defined",
    contextMatchScore: 96, evidenceCoverage: 82, intakeConfidence: 94, packageCompleteness: 82,
    currentStageId: "evidence",
    candidatePersonaIds: ["PC 01", "PC 02", "PC 03", "PC 04", "PC 05", "PC 06"],
    applicableConditionIds: ["BC 1101", "BC 1102", "BC 1103", "BC 1104", "BC 1105", "BC 1106", "BC 1107"],
    relatedDecisionIds: ["DEC 4812"], relatedOutcomeIds: ["OUT 3284"], relatedLearningRecordIds: ["LRN 1426"],
    gapIds: ["GAP 9101", "GAP 9102", "GAP 9103", "GAP 9104", "GAP 9105"],
    clarificationTaskIds: [], intakePackageId: "PKG 5001",
    missingItems: 4, conditionsMatched: 18,
    submittedAt: "2026-07-28 09:12", ageHours: 214,
    createdAt: "2026-07-28T09:12:00Z", updatedAt: "2026-08-06T14:40:00Z",
  },
  {
    id: "INT 7002", title: "Identity Token Cache Optimization",
    description: "Introduce a regional token cache tier to reduce identity verification latency.",
    workType: "Performance Change", priority: "High", status: "Package Complete",
    submittingTeamId: "team-identity", submittingTeamName: "Identity Engineering",
    workOwner: "Dana Whitfield", technicalOwner: "Owen Park", businessUnit: "Platform Services",
    requestedDate: "2026-07-30", targetDate: "2026-08-25", environment: "Production", region: "North America",
    submissionMethod: "Change Portal", sourceSystem: "Enterprise Change Management", sourceRecordId: "CHG 88240",
    accessClassification: "Internal", originalSubmissionId: "SUB 41014",
    intent: "Reduce identity verification latency at checkout.",
    currentState: "Central token verification", proposedState: "Regional token cache tier",
    scope: "Identity Services, Regional Token Vault",
    expectedOutcomes: ["Reduce P95 identity latency by 40 ms"],
    rolloutStrategy: "Region by region", trafficExposure: 20,
    rollbackPlan: "Disable regional cache tier", rollbackThreshold: "P95 latency regression > 15 ms",
    contextMatchScore: 94, evidenceCoverage: 96, intakeConfidence: 95, packageCompleteness: 94,
    currentStageId: "package",
    candidatePersonaIds: ["PC 06", "PC 04"], applicableConditionIds: ["BC 1102", "BC 1103"],
    relatedDecisionIds: ["DEC 4790"], relatedOutcomeIds: [], relatedLearningRecordIds: [],
    gapIds: [], clarificationTaskIds: [], intakePackageId: "PKG 5002",
    missingItems: 0, conditionsMatched: 12,
    submittedAt: "2026-07-30 11:04", ageHours: 168,
    createdAt: "2026-07-30T11:04:00Z", updatedAt: "2026-08-06T10:22:00Z",
  },
  {
    id: "INT 7003", title: "Fraud Decision Service Timeout Adjustment",
    description: "Raise the fraud decision service timeout to reduce false declines during peak load.",
    workType: "Configuration Change", priority: "High", status: "Analyzing",
    submittingTeamId: "team-fraud", submittingTeamName: "Fraud Engineering",
    workOwner: "Ravi Chandrasekar", technicalOwner: "Nina Alvarez", businessUnit: "Risk & Trust",
    requestedDate: "2026-08-01", targetDate: "2026-08-28", environment: "Production", region: "Global",
    submissionMethod: "Change Portal", sourceSystem: "Enterprise Change Management", sourceRecordId: "CHG 88266",
    accessClassification: "Confidential", originalSubmissionId: "SUB 41031",
    intent: "Reduce false declines caused by fraud decision timeouts.",
    currentState: "1.0 second timeout", proposedState: "1.4 second timeout",
    scope: "Fraud Decision Service",
    expectedOutcomes: ["Reduce false decline rate by 0.6 percent"],
    rolloutStrategy: "Staged by decision category", trafficExposure: 10,
    rollbackPlan: "Revert timeout configuration", rollbackThreshold: "Checkout P95 latency > 250 ms",
    contextMatchScore: 91, evidenceCoverage: 89, intakeConfidence: 88, packageCompleteness: 76,
    currentStageId: "conditions",
    candidatePersonaIds: ["PC 03", "PC 01", "PC 02", "PC 04", "PC 05"],
    applicableConditionIds: ["BC 1102", "BC 1107"],
    relatedDecisionIds: [], relatedOutcomeIds: ["OUT 3290"], relatedLearningRecordIds: [],
    gapIds: ["GAP 9110"], clarificationTaskIds: [], intakePackageId: "PKG 5003",
    missingItems: 1, conditionsMatched: 14,
    submittedAt: "2026-08-01 08:45", ageHours: 130,
    createdAt: "2026-08-01T08:45:00Z", updatedAt: "2026-08-06T09:11:00Z",
  },
  {
    id: "INT 7004", title: "Regional Token Vault Migration",
    description: "Migrate the regional token vault to the new multi-region storage architecture.",
    workType: "Architecture Change", priority: "Critical", status: "Needs Attention",
    submittingTeamId: "team-platform", submittingTeamName: "Platform Engineering",
    workOwner: "Helena Voss", technicalOwner: "Sam Okoye", businessUnit: "Platform Services",
    requestedDate: "2026-07-22", targetDate: "2026-09-15", environment: "Production", region: "EMEA",
    submissionMethod: "Architecture Review", sourceSystem: "Architecture Review Board", sourceRecordId: "RFC 2091",
    accessClassification: "Restricted", originalSubmissionId: "SUB 40988",
    intent: "Improve regional resilience for token storage.",
    currentState: "Single region vault", proposedState: "Multi region vault with active replication",
    scope: "Regional Token Vault, Identity Services, Payments API",
    expectedOutcomes: ["Regional failover under 60 seconds"],
    rolloutStrategy: "Region by region with dual write", trafficExposure: 100,
    rollbackPlan: "Fail back to single region vault", rollbackThreshold: "Replication lag > 5 seconds",
    contextMatchScore: 84, evidenceCoverage: 76, intakeConfidence: 79, packageCompleteness: 64,
    currentStageId: "entities",
    candidatePersonaIds: ["PC 06", "PC 01", "PC 04", "PC 05", "PC 02", "PC 03"],
    applicableConditionIds: ["BC 1101", "BC 1105", "BC 1106"],
    relatedDecisionIds: ["DEC 4655"], relatedOutcomeIds: [], relatedLearningRecordIds: ["LRN 1390"],
    gapIds: ["GAP 9120", "GAP 9121"], clarificationTaskIds: [], intakePackageId: "PKG 5004",
    missingItems: 6, conditionsMatched: 22,
    submittedAt: "2026-07-22 15:30", ageHours: 358,
    createdAt: "2026-07-22T15:30:00Z", updatedAt: "2026-08-05T16:02:00Z",
  },
  {
    id: "INT 7005", title: "Checkout Observability Expansion",
    description: "Expand checkout tracing coverage to include retry orchestration spans.",
    workType: "Observability Change", priority: "Medium", status: "Package Complete",
    submittingTeamId: "team-sre", submittingTeamName: "Site Reliability Engineering",
    workOwner: "Tomas Berg", technicalOwner: "Aisha Rahman", businessUnit: "Platform Services",
    requestedDate: "2026-08-02", targetDate: "2026-08-19", environment: "Production", region: "Global",
    submissionMethod: "Change Portal", sourceSystem: "Enterprise Change Management", sourceRecordId: "CHG 88301",
    accessClassification: "Internal", originalSubmissionId: "SUB 41055",
    intent: "Improve diagnostic visibility for checkout retry behavior.",
    currentState: "Partial retry tracing", proposedState: "Full retry span coverage",
    scope: "Retry Orchestrator, Observability Platform",
    expectedOutcomes: ["Reduce mean time to diagnose retry incidents"],
    rolloutStrategy: "Single deployment", trafficExposure: 100,
    rollbackPlan: "Disable expanded spans", rollbackThreshold: "Ingest cost > 12 percent increase",
    contextMatchScore: 98, evidenceCoverage: 98, intakeConfidence: 97, packageCompleteness: 96,
    currentStageId: "route",
    candidatePersonaIds: ["PC 04", "PC 02", "PC 01"], applicableConditionIds: ["BC 1102"],
    relatedDecisionIds: [], relatedOutcomeIds: [], relatedLearningRecordIds: [],
    gapIds: [], clarificationTaskIds: [], intakePackageId: "PKG 5005",
    missingItems: 0, conditionsMatched: 9,
    submittedAt: "2026-08-02 13:20", ageHours: 104,
    createdAt: "2026-08-02T13:20:00Z", updatedAt: "2026-08-06T12:00:00Z",
  },
  {
    id: "INT 7006", title: "Quarter End Release Exception",
    description: "Request an exception to deploy a payments configuration change during the quarter end freeze.",
    workType: "Governance Exception", priority: "Critical", status: "Review Required",
    submittingTeamId: "team-release", submittingTeamName: "Release Engineering",
    workOwner: "Grace Lindqvist", technicalOwner: "Kofi Mensah", businessUnit: "Digital Commerce",
    requestedDate: "2026-08-03", targetDate: "2026-08-14", environment: "Production", region: "Global",
    submissionMethod: "Governance Request", sourceSystem: "Release Governance", sourceRecordId: "GOV 1188",
    accessClassification: "Confidential", originalSubmissionId: "SUB 41062",
    intent: "Enable a time sensitive payments change during a restricted window.",
    currentState: "Deployment freeze in effect", proposedState: "Scoped deployment exception",
    scope: "Payments API, Retry Orchestrator",
    expectedOutcomes: ["Unblock revenue impacting change"],
    rolloutStrategy: "Single scoped window", trafficExposure: 100,
    rollbackPlan: "Immediate revert with pre approved runbook", rollbackThreshold: "Any payment error rate increase",
    contextMatchScore: 92, evidenceCoverage: 88, intakeConfidence: 86, packageCompleteness: 74,
    currentStageId: "evidence",
    candidatePersonaIds: ["PC 05", "PC 01", "PC 02", "PC 03", "PC 04", "PC 06"],
    applicableConditionIds: ["BC 1106", "BC 1104"],
    relatedDecisionIds: ["DEC 4712"], relatedOutcomeIds: [], relatedLearningRecordIds: [],
    gapIds: ["GAP 9130", "GAP 9131"], clarificationTaskIds: [], intakePackageId: "PKG 5006",
    missingItems: 2, conditionsMatched: 16,
    submittedAt: "2026-08-03 07:55", ageHours: 86,
    createdAt: "2026-08-03T07:55:00Z", updatedAt: "2026-08-06T08:40:00Z",
  },
  {
    id: "INT 7007", title: "Customer Support Escalation Workflow Update",
    description: "Update the escalation workflow for payment related support cases.",
    workType: "Process Change", priority: "Medium", status: "Analyzing",
    submittingTeamId: "team-support", submittingTeamName: "Customer Support Operations",
    workOwner: "Bianca Ferreira", technicalOwner: "Liam Doyle", businessUnit: "Customer Experience",
    requestedDate: "2026-08-04", targetDate: "2026-09-02", environment: "Production", region: "Global",
    submissionMethod: "Process Request", sourceSystem: "Service Management", sourceRecordId: "SRV 5522",
    accessClassification: "Internal", originalSubmissionId: "SUB 41077",
    intent: "Shorten resolution time for payment escalations.",
    currentState: "Three tier escalation", proposedState: "Two tier escalation with payments specialist routing",
    scope: "Support Operations, Payments Platform",
    expectedOutcomes: ["Reduce escalation resolution time by 20 percent"],
    rolloutStrategy: "Pilot region first", trafficExposure: 25,
    rollbackPlan: "Restore three tier workflow", rollbackThreshold: "CSAT decline > 2 points",
    contextMatchScore: 87, evidenceCoverage: 84, intakeConfidence: 82, packageCompleteness: 70,
    currentStageId: "context",
    candidatePersonaIds: ["PC 02", "PC 01", "PC 04"], applicableConditionIds: ["BC 1103"],
    relatedDecisionIds: [], relatedOutcomeIds: [], relatedLearningRecordIds: ["LRN 1402"],
    gapIds: ["GAP 9140"], clarificationTaskIds: [], intakePackageId: "PKG 5007",
    missingItems: 1, conditionsMatched: 11,
    submittedAt: "2026-08-04 16:18", ageHours: 53,
    createdAt: "2026-08-04T16:18:00Z", updatedAt: "2026-08-06T11:30:00Z",
  },
];

/* --------------------------------------------------------- INT 7001 detail -- */

export const originalSubmission = {
  submissionId: "SUB 41002",
  source: "Enterprise Change Management",
  sourceRecordId: "CHG 88214",
  sourceType: "Change Request",
  submittedBy: "Marcus Lee",
  timestamp: "2026-07-28 09:12 UTC",
  version: "v1.0",
  accessClassification: "Internal",
  contentHash: "sha256:4f19c8a2d7e3b61c0a94ff2e8b7d5610c3a1e0b9",
  title: "Checkout Retry Policy Update",
  submittingTeam: "Checkout Engineering",
  owner: "Marcus Lee",
  workType: "Configuration / Reliability Change",
  priority: "High",
  proposedChange: "Increase automated payment retry attempts from two to three for selected transient payment failures.",
  intent: "Improve checkout completion when temporary payment service failures occur.",
  proposedScope: [
    "5 percent initial traffic segment",
    "Selected transient decline categories",
    "Payments API",
    "Retry Orchestrator",
  ],
  expectedBenefit: "Reduce customer checkout abandonment",
  target: "1 to 2 percent checkout completion improvement",
  plannedRollout: ["5 percent", "25 percent", "50 percent", "100 percent after validation"],
  submittedEvidence: ["Design Document", "Current Retry Metrics", "Initial Rollout Plan"],
  knownDependencies: ["Payments API", "Fraud Decision Service", "Identity Services"],
  incompleteInformation: [
    "Idempotency Test Evidence",
    "Fraud Loss Analysis",
    "Rollback Threshold",
    "Regional Dependency Validation",
    "Quarter End Release Applicability",
  ],
  attachments: ["retry-design-v3.md", "retry-metrics-2026-07.csv", "rollout-plan-v1.md"],
};

/** Anchors let the Workbench link proposal text → decomposition → context. */
export const proposalAnchors: { id: string; label: string; text: string; elementIds: string[] }[] = [
  { id: "anchor-intent", label: "Intent", text: "Improve checkout completion when temporary payment service failures occur.", elementIds: ["CE 01"] },
  { id: "anchor-change", label: "Proposed change", text: "Increase automated payment retry attempts from two to three.", elementIds: ["CE 02", "CE 03", "CE 04"] },
  { id: "anchor-scope", label: "Scope", text: "5 percent initial traffic segment on selected transient decline categories.", elementIds: ["CE 05", "CE 09"] },
  { id: "anchor-systems", label: "Systems", text: "Payments API and Retry Orchestrator.", elementIds: ["CE 05", "CE 06"] },
  { id: "anchor-dependencies", label: "Dependencies", text: "Payments API, Fraud Decision Service, Identity Services.", elementIds: ["CE 06", "CE 07"] },
  { id: "anchor-rollout", label: "Rollout", text: "5 percent, 25 percent, 50 percent, 100 percent after validation.", elementIds: ["CE 09", "CE 10"] },
];

export const changeElements: CognitiveIntakeChangeElement[] = [
  { id: "CE 01", intakeId: "INT 7001", elementType: "Intent", subjectType: "Outcome", subjectId: "OBJ 01", subjectName: "Improve Checkout Completion", currentValue: "Baseline completion", proposedValue: "1 to 2 percent improvement", unit: "percent", scope: "Checkout Customer Journey", confidence: 96, sourceEvidenceIds: ["EV 01"], status: "Confirmed", proposalAnchor: "anchor-intent", contextIds: ["CX 02", "CX 20"], packageSections: ["Intent", "Scope"] },
  { id: "CE 02", intakeId: "INT 7001", elementType: "Current State", subjectType: "Configuration", subjectId: "CFG 01", subjectName: "Checkout Retry Policy", currentValue: "2 automated retries", proposedValue: "2 automated retries", unit: "attempts", scope: "Transient declines", confidence: 98, sourceEvidenceIds: ["EV 02"], status: "Confirmed", proposalAnchor: "anchor-change", contextIds: ["CX 11", "CX 20"], packageSections: ["Current State"] },
  { id: "CE 03", intakeId: "INT 7001", elementType: "Proposed State", subjectType: "Configuration", subjectId: "CFG 01", subjectName: "Checkout Retry Policy", currentValue: "2 automated retries", proposedValue: "3 automated retries", unit: "attempts", scope: "Transient declines", confidence: 94, sourceEvidenceIds: ["EV 01"], status: "Confirmed", proposalAnchor: "anchor-change", contextIds: ["CX 11", "CX 14", "CX 20"], packageSections: ["Proposed State", "Risks"] },
  { id: "CE 04", intakeId: "INT 7001", elementType: "Change Object", subjectType: "Configuration", subjectId: "CFG 01", subjectName: "Checkout Retry Policy", currentValue: "Managed by Retry Orchestrator", proposedValue: "Managed by Retry Orchestrator", unit: "n/a", scope: "Payments", confidence: 97, sourceEvidenceIds: ["EV 01"], status: "Confirmed", proposalAnchor: "anchor-change", contextIds: ["CX 01", "CX 11"], packageSections: ["Affected Entities"] },
  { id: "CE 05", intakeId: "INT 7001", elementType: "Primary System", subjectType: "System", subjectId: "SYS 01", subjectName: "Retry Orchestrator", currentValue: "In scope", proposedValue: "Modified", unit: "n/a", scope: "Production", confidence: 95, sourceEvidenceIds: ["EV 04"], status: "Confirmed", proposalAnchor: "anchor-systems", contextIds: ["CX 01", "CX 04"], packageSections: ["Affected Entities", "Scope"] },
  { id: "CE 06", intakeId: "INT 7001", elementType: "Primary System", subjectType: "System", subjectId: "SYS 02", subjectName: "Payments API", currentValue: "In scope", proposedValue: "Traffic profile changes", unit: "n/a", scope: "Production", confidence: 96, sourceEvidenceIds: ["EV 04"], status: "Confirmed", proposalAnchor: "anchor-systems", contextIds: ["CX 01", "CX 10", "CX 11"], packageSections: ["Affected Entities", "Dependencies"] },
  { id: "CE 07", intakeId: "INT 7001", elementType: "Related Service", subjectType: "Service", subjectId: "SVC 01", subjectName: "Fraud Decision Service", currentValue: "Dependency", proposedValue: "Higher call volume", unit: "n/a", scope: "Production", confidence: 93, sourceEvidenceIds: [], status: "Needs Evidence", proposalAnchor: "anchor-dependencies", contextIds: ["CX 03", "CX 15"], packageSections: ["Dependencies", "Risks"] },
  { id: "CE 08", intakeId: "INT 7001", elementType: "Related Service", subjectType: "Service", subjectId: "SVC 02", subjectName: "Identity Services", currentValue: "Dependency", proposedValue: "Higher call volume", unit: "n/a", scope: "Production", confidence: 84, sourceEvidenceIds: [], status: "Needs Evidence", proposalAnchor: "anchor-dependencies", contextIds: ["CX 06"], packageSections: ["Dependencies"] },
  { id: "CE 09", intakeId: "INT 7001", elementType: "Traffic Exposure", subjectType: "Rollout", subjectId: "ROL 01", subjectName: "Initial Traffic Segment", currentValue: "0 percent", proposedValue: "5 percent", unit: "percent", scope: "Checkout traffic", confidence: 92, sourceEvidenceIds: ["EV 03"], status: "Editable", proposalAnchor: "anchor-scope", contextIds: ["CX 13"], packageSections: ["Scope", "Potential Governance Requirements"] },
  { id: "CE 10", intakeId: "INT 7001", elementType: "Deployment Timing", subjectType: "Rollout", subjectId: "ROL 02", subjectName: "Deployment Window", currentValue: "Standard window", proposedValue: "Standard window", unit: "n/a", scope: "Release calendar", confidence: 90, sourceEvidenceIds: ["EV 03"], status: "Editable", proposalAnchor: "anchor-rollout", contextIds: ["CX 16"], packageSections: ["Potential Governance Requirements"] },
  { id: "CE 11", intakeId: "INT 7001", elementType: "Customer Journey", subjectType: "Journey", subjectId: "JRN 01", subjectName: "Checkout Customer Journey", currentValue: "In scope", proposedValue: "Customer facing behavior change", unit: "n/a", scope: "Global", confidence: 94, sourceEvidenceIds: ["EV 01"], status: "Confirmed", proposalAnchor: "anchor-intent", contextIds: ["CX 02"], packageSections: ["Scope", "Affected Entities"] },
  { id: "CE 12", intakeId: "INT 7001", elementType: "Related Service", subjectType: "Service", subjectId: "SVC 03", subjectName: "Regional Token Vault", currentValue: "Dependency", proposedValue: "Higher call volume", unit: "n/a", scope: "EMEA", confidence: 81, sourceEvidenceIds: [], status: "Needs Evidence", proposalAnchor: "anchor-dependencies", contextIds: ["CX 06"], packageSections: ["Dependencies", "Risks"] },
];

export const changeCharacteristics = [
  "Configuration Change", "Customer Facing", "Production Traffic Exposure",
  "Financial Transaction Behavior", "Reversible", "Progressive Rollout Supported",
];

export const riskSignals = [
  { name: "Duplicate Authorization", severity: "High" as const },
  { name: "Latency Amplification", severity: "Medium" as const },
  { name: "Fraud Decision Timeout", severity: "High" as const },
  { name: "Dependency Saturation", severity: "Medium" as const },
  { name: "Quarter End Governance Restriction", severity: "Medium" as const },
];

export const changeAssumptions = [
  "Retries remain idempotent",
  "Dependencies can absorb increased volume",
  "Fraud decision quality remains stable",
  "Third retry improves conversion",
  "Rollback can occur before material impact",
];

export const entityMatches: CognitiveIntakeEntityMatch[] = [
  { id: "EM 01", intakeId: "INT 7001", detectedValue: "retry orchestrator", entityType: "System", canonicalEntityId: "SYS 01", canonicalName: "Retry Orchestrator", confidence: 98, owner: "Payments Platform", status: "Resolved" },
  { id: "EM 02", intakeId: "INT 7001", detectedValue: "payments api", entityType: "System", canonicalEntityId: "SYS 02", canonicalName: "Payments API", confidence: 99, owner: "Payments Platform", status: "Resolved" },
  { id: "EM 03", intakeId: "INT 7001", detectedValue: "fraud service", entityType: "Service", canonicalEntityId: "SVC 01", canonicalName: "Fraud Decision Service", confidence: 94, owner: "Fraud Engineering", status: "Resolved" },
  { id: "EM 04", intakeId: "INT 7001", detectedValue: "identity", entityType: "Service", canonicalEntityId: "SVC 02", canonicalName: "Identity Services", confidence: 88, owner: "Identity Engineering", status: "Resolved" },
  { id: "EM 05", intakeId: "INT 7001", detectedValue: "token vault (EU)", entityType: "Service", canonicalEntityId: "SVC 03", canonicalName: "Regional Token Vault", confidence: 72, owner: "Platform Engineering", status: "Needs Confirmation" },
  { id: "EM 06", intakeId: "INT 7001", detectedValue: "checkout journey", entityType: "Customer Journey", canonicalEntityId: "JRN 01", canonicalName: "Checkout Customer Journey", confidence: 96, owner: "Checkout Engineering", status: "Resolved" },
  { id: "EM 07", intakeId: "INT 7001", detectedValue: "transient decline set", entityType: "Data Domain", canonicalEntityId: "DAT 04", canonicalName: "Payment Decline Taxonomy", confidence: 69, owner: "Payments Platform", status: "Unresolved" },
];

export const contextMatches: CognitiveIntakeContextMatch[] = [
  /* Team Personas */
  { id: "CX 01", intakeId: "INT 7001", memoryRecordId: "PER 2201", memoryType: "Team Persona", title: "Payments Platform", relevanceScore: 98, reason: "Owns Payments API and retry behavior", authority: "Authoritative", confidence: 98, freshness: "Current", included: true, relationshipType: "Owns change object", evidenceCount: 14, packageSections: ["Candidate Team Personas", "Affected Entities"] },
  { id: "CX 02", intakeId: "INT 7001", memoryRecordId: "PER 2202", memoryType: "Team Persona", title: "Checkout Engineering", relevanceScore: 96, reason: "Owns customer checkout journey", authority: "Authoritative", confidence: 96, freshness: "Current", included: true, relationshipType: "Owns journey", evidenceCount: 11, packageSections: ["Candidate Team Personas"] },
  { id: "CX 03", intakeId: "INT 7001", memoryRecordId: "PER 2203", memoryType: "Team Persona", title: "Fraud Engineering", relevanceScore: 93, reason: "Fraud decision dependency", authority: "Authoritative", confidence: 93, freshness: "Current", included: true, relationshipType: "Downstream dependency", evidenceCount: 9, packageSections: ["Candidate Team Personas", "Dependencies"] },
  { id: "CX 04", intakeId: "INT 7001", memoryRecordId: "PER 2204", memoryType: "Team Persona", title: "Site Reliability Engineering", relevanceScore: 91, reason: "Reliability and rollback controls", authority: "Authoritative", confidence: 91, freshness: "Current", included: true, relationshipType: "Operational control", evidenceCount: 12, packageSections: ["Candidate Team Personas", "Risks"] },
  { id: "CX 05", intakeId: "INT 7001", memoryRecordId: "PER 2205", memoryType: "Team Persona", title: "Release Governance", relevanceScore: 88, reason: "Traffic exposure and quarter end rules", authority: "Authoritative", confidence: 88, freshness: "Current", included: true, relationshipType: "Governance authority", evidenceCount: 8, packageSections: ["Candidate Team Personas", "Potential Governance Requirements"] },
  { id: "CX 06", intakeId: "INT 7001", memoryRecordId: "PER 2206", memoryType: "Team Persona", title: "Identity Engineering", relevanceScore: 84, reason: "Identity dependency", authority: "Contributing", confidence: 84, freshness: "Current", included: true, relationshipType: "Downstream dependency", evidenceCount: 6, packageSections: ["Candidate Team Personas", "Dependencies"] },
  /* Business Conditions */
  { id: "CX 10", intakeId: "INT 7001", memoryRecordId: "BC 1101", memoryType: "Business Condition", title: "Payments API Availability >= 99.95%", relevanceScore: 95, reason: "Change affects payments availability profile", authority: "Approved", confidence: 96, freshness: "Current", included: true, relationshipType: "Constrains change", evidenceCount: 5, packageSections: ["Applicable Business Conditions"] },
  { id: "CX 11", intakeId: "INT 7001", memoryRecordId: "BC 1102", memoryType: "Business Condition", title: "P95 Latency < 250 ms", relevanceScore: 94, reason: "Additional retry can amplify latency", authority: "Approved", confidence: 95, freshness: "Current", included: true, relationshipType: "Constrains change", evidenceCount: 7, packageSections: ["Applicable Business Conditions", "Risks"] },
  { id: "CX 12", intakeId: "INT 7001", memoryRecordId: "BC 1103", memoryType: "Business Condition", title: "Error Rate Target < 0.3%", relevanceScore: 90, reason: "Retry behavior changes error accounting", authority: "Approved", confidence: 92, freshness: "Current", included: true, relationshipType: "Constrains change", evidenceCount: 4, packageSections: ["Applicable Business Conditions"] },
  { id: "CX 13", intakeId: "INT 7001", memoryRecordId: "BC 1104", memoryType: "Business Condition", title: "Retry changes affecting >10% traffic require Payments Reliability and Fraud Engineering approval", relevanceScore: 99, reason: "Activated when proposed traffic exposure exceeds 10 percent", authority: "Approved", confidence: 99, freshness: "Current", included: true, relationshipType: "Governance trigger", evidenceCount: 3, packageSections: ["Potential Governance Requirements", "Applicable Business Conditions"], activation: "traffic-over-10" },
  { id: "CX 14", intakeId: "INT 7001", memoryRecordId: "BC 1105", memoryType: "Business Condition", title: "Payment retries must preserve idempotency", relevanceScore: 98, reason: "Directly governs additional retry attempts", authority: "Approved", confidence: 98, freshness: "Current", included: true, relationshipType: "Constrains change", evidenceCount: 6, packageSections: ["Applicable Business Conditions", "Risks", "Missing Evidence"] },
  { id: "CX 16", intakeId: "INT 7001", memoryRecordId: "BC 1106", memoryType: "Business Condition", title: "No deployment during final three business days of financial quarter", relevanceScore: 97, reason: "Activated when deployment timing falls inside the quarter end window", authority: "Approved", confidence: 97, freshness: "Current", included: true, relationshipType: "Governance trigger", evidenceCount: 4, packageSections: ["Potential Governance Requirements"], activation: "quarter-end" },
  { id: "CX 15", intakeId: "INT 7001", memoryRecordId: "BC 1107", memoryType: "Business Condition", title: "Fraud timeout >1.2 seconds triggers graceful degradation", relevanceScore: 89, reason: "Retry volume interacts with fraud decision latency", authority: "Approved", confidence: 90, freshness: "Current", included: true, relationshipType: "Dependency constraint", evidenceCount: 5, packageSections: ["Applicable Business Conditions", "Risks"] },
  /* Prior decision, outcome, learning */
  { id: "CX 20", intakeId: "INT 7001", memoryRecordId: "DEC 4812", memoryType: "Prior Decision", title: "Limited Retry Increase", relevanceScore: 97, reason: "Prior governed decision on the same change object", authority: "Authoritative", confidence: 97, freshness: "Current", included: true, relationshipType: "Precedent", evidenceCount: 9, packageSections: ["Prior Decisions"] },
  { id: "CX 21", intakeId: "INT 7001", memoryRecordId: "OUT 3284", memoryType: "Prior Outcome", title: "Checkout Completion +1.8%, Duplicate Authorization +0.4% until controls strengthened", relevanceScore: 96, reason: "Measured result of the prior retry increase", authority: "Authoritative", confidence: 96, freshness: "Current", included: true, relationshipType: "Measured outcome", evidenceCount: 7, packageSections: ["Prior Outcomes", "Risks"] },
  { id: "CX 22", intakeId: "INT 7001", memoryRecordId: "LRN 1426", memoryType: "Learning Record", title: "Future retry changes require stronger idempotency validation before traffic expansion", relevanceScore: 95, reason: "Organizational learning derived from the prior outcome", authority: "Approved", confidence: 95, freshness: "Current", included: true, relationshipType: "Learning", evidenceCount: 3, packageSections: ["Relevant Learning", "Missing Evidence"] },
  /* Policies, risks, controls */
  { id: "CX 30", intakeId: "INT 7001", memoryRecordId: "POL 610", memoryType: "Policy", title: "Customer facing payment behavior requires progressive rollout", relevanceScore: 88, reason: "Change is customer facing with financial impact", authority: "Approved", confidence: 90, freshness: "Current", included: true, relationshipType: "Policy", evidenceCount: 4, packageSections: ["Potential Governance Requirements"] },
  { id: "CX 31", intakeId: "INT 7001", memoryRecordId: "RSK 210", memoryType: "Risk", title: "Duplicate transaction exposure on payment retry", relevanceScore: 93, reason: "Historically observed on prior retry expansion", authority: "Authoritative", confidence: 93, freshness: "Current", included: true, relationshipType: "Known risk", evidenceCount: 6, packageSections: ["Risks"] },
  { id: "CX 32", intakeId: "INT 7001", memoryRecordId: "CTL 118", memoryType: "Control", title: "Automated rollback on duplicate authorization threshold", relevanceScore: 86, reason: "Control that must be configured before expansion", authority: "Approved", confidence: 88, freshness: "Aging", included: true, relationshipType: "Mitigating control", evidenceCount: 3, packageSections: ["Risks", "Missing Evidence"] },
  { id: "CX 33", intakeId: "INT 7001", memoryRecordId: "EVD 902", memoryType: "Evidence", title: "Retry metrics July 2026", relevanceScore: 84, reason: "Baseline retry performance", authority: "Contributing", confidence: 85, freshness: "Current", included: true, relationshipType: "Supporting evidence", evidenceCount: 1, packageSections: ["Provided Evidence"] },
];

export const personaCandidates: CognitiveIntakePersonaCandidate[] = [
  { id: "PC 01", intakeId: "INT 7001", personaId: "PER 2201", personaName: "Payments Platform", teamId: "team-payments", teamName: "Payments Platform", matchConfidence: 98, matchReason: "Owns Payments API and retry behavior", relationshipTypes: ["Owner", "Change object"], applicableConditionIds: ["BC 1101", "BC 1105"], evidenceReferenceIds: ["EV 01", "EV 02"], criticality: "Critical Dependency", selectionState: "Primary" },
  { id: "PC 02", intakeId: "INT 7001", personaId: "PER 2202", personaName: "Checkout Engineering", teamId: "team-checkout", teamName: "Checkout Engineering", matchConfidence: 96, matchReason: "Owns customer checkout journey", relationshipTypes: ["Owner", "Submitting team"], applicableConditionIds: ["BC 1103"], evidenceReferenceIds: ["EV 01"], criticality: "Critical Dependency", selectionState: "Included" },
  { id: "PC 03", intakeId: "INT 7001", personaId: "PER 2203", personaName: "Fraud Engineering", teamId: "team-fraud", teamName: "Fraud Engineering", matchConfidence: 93, matchReason: "Fraud decision dependency exposed to higher retry volume", relationshipTypes: ["Downstream dependency"], applicableConditionIds: ["BC 1107"], evidenceReferenceIds: [], criticality: "Critical Dependency", selectionState: "Included" },
  { id: "PC 04", intakeId: "INT 7001", personaId: "PER 2204", personaName: "Site Reliability Engineering", teamId: "team-sre", teamName: "Site Reliability Engineering", matchConfidence: 91, matchReason: "Reliability posture and rollback controls", relationshipTypes: ["Operational control"], applicableConditionIds: ["BC 1102"], evidenceReferenceIds: ["EV 04"], criticality: "Supporting", selectionState: "Included" },
  { id: "PC 05", intakeId: "INT 7001", personaId: "PER 2205", personaName: "Release Governance", teamId: "team-release", teamName: "Release Engineering", matchConfidence: 88, matchReason: "Traffic exposure thresholds and quarter end restrictions", relationshipTypes: ["Governance authority"], applicableConditionIds: ["BC 1104", "BC 1106"], evidenceReferenceIds: [], criticality: "Supporting", selectionState: "Included" },
  { id: "PC 06", intakeId: "INT 7001", personaId: "PER 2206", personaName: "Identity Engineering", teamId: "team-identity", teamName: "Identity Engineering", matchConfidence: 84, matchReason: "Identity dependency in the retry path", relationshipTypes: ["Downstream dependency"], applicableConditionIds: [], evidenceReferenceIds: [], criticality: "Informational", selectionState: "Included" },
];

export const evidenceItems: CognitiveIntakeEvidence[] = [
  { id: "EV 01", intakeId: "INT 7001", name: "Design Document", evidenceType: "Design", category: "Change Definition", source: "Engineering Wiki", authority: "Authoritative", freshness: "Current", owner: "Marcus Lee", required: "Required", provided: true, qualityScore: 92, status: "Accepted", evidenceRecordId: "EVD 900" },
  { id: "EV 02", intakeId: "INT 7001", name: "Current Retry Metrics", evidenceType: "Telemetry", category: "Baseline", source: "Observability Platform", authority: "Authoritative", freshness: "Current", owner: "Site Reliability Engineering", required: "Required", provided: true, qualityScore: 95, status: "Accepted", evidenceRecordId: "EVD 902" },
  { id: "EV 03", intakeId: "INT 7001", name: "Initial Rollout Plan", evidenceType: "Plan", category: "Rollout", source: "Change Portal", authority: "Contributing", freshness: "Current", owner: "Checkout Engineering", required: "Required", provided: true, qualityScore: 84, status: "Accepted", evidenceRecordId: "EVD 905" },
  { id: "EV 04", intakeId: "INT 7001", name: "Service Dependency Diagram", evidenceType: "Architecture", category: "Dependencies", source: "Architecture Repository", authority: "Contributing", freshness: "Aging", owner: "Platform Engineering", required: "Required", provided: true, qualityScore: 78, status: "Accepted with Notes", evidenceRecordId: "EVD 908" },
  { id: "EV 05", intakeId: "INT 7001", name: "Idempotency Test Results", evidenceType: "Test", category: "Correctness", source: "Test Management", authority: "Authoritative", freshness: "Missing", owner: "Payments Platform", required: "Required", provided: false, qualityScore: 0, status: "Missing", evidenceRecordId: "", closesGapId: "GAP 9101" },
  { id: "EV 06", intakeId: "INT 7001", name: "Fraud Loss Analysis", evidenceType: "Analysis", category: "Risk", source: "Risk Analytics", authority: "Authoritative", freshness: "Missing", owner: "Fraud Engineering", required: "Required", provided: false, qualityScore: 0, status: "Missing", evidenceRecordId: "", closesGapId: "GAP 9103" },
  { id: "EV 07", intakeId: "INT 7001", name: "Rollback Threshold", evidenceType: "Definition", category: "Rollback", source: "Change Portal", authority: "Contributing", freshness: "Missing", owner: "Checkout Engineering", required: "Required", provided: false, qualityScore: 0, status: "Missing", evidenceRecordId: "", closesGapId: "GAP 9102" },
  { id: "EV 08", intakeId: "INT 7001", name: "Regional Dependency Health", evidenceType: "Telemetry", category: "Dependencies", source: "Observability Platform", authority: "Contributing", freshness: "Missing", owner: "Platform Engineering", required: "Required", provided: false, qualityScore: 0, status: "Missing", evidenceRecordId: "" },
  { id: "EV 09", intakeId: "INT 7001", name: "Security Review", evidenceType: "Review", category: "Security", source: "Security Governance", authority: "Approved", freshness: "Not Started", owner: "Security Engineering", required: "Potentially Required", provided: false, qualityScore: 0, status: "Potentially Required", evidenceRecordId: "" },
  { id: "EV 10", intakeId: "INT 7001", name: "Compliance Review", evidenceType: "Review", category: "Compliance", source: "Compliance Governance", authority: "Approved", freshness: "Not Started", owner: "Compliance", required: "Potentially Required", provided: false, qualityScore: 0, status: "Potentially Required", evidenceRecordId: "" },
  { id: "EV 11", intakeId: "INT 7001", name: "Quarter End Exception", evidenceType: "Governance", category: "Release Governance", source: "Release Governance", authority: "Approved", freshness: "Not Started", owner: "Release Governance", required: "Potentially Required", provided: false, qualityScore: 0, status: "Potentially Required", evidenceRecordId: "" },
];

export const gaps: CognitiveIntakeGap[] = [
  { id: "GAP 9101", intakeId: "INT 7001", intakeTitle: "Checkout Retry Policy Update", gapType: "Missing Evidence", question: "Provide idempotency validation", description: "Idempotency test evidence is required before retry expansion, per LRN 1426.", severity: "High", requiredForNextStage: true, assignedTo: "Payments Platform", dueDate: "2026-08-11", impact: "Blocks evidence completeness and duplicate transaction risk assessment", status: "Open", resolution: null },
  { id: "GAP 9102", intakeId: "INT 7001", intakeTitle: "Checkout Retry Policy Update", gapType: "Missing Rollback Definition", question: "Define rollback threshold", description: "No numeric duplicate authorization threshold triggers rollback.", severity: "High", requiredForNextStage: true, assignedTo: "Checkout Engineering", dueDate: "2026-08-10", impact: "Rollback cannot be automated without a threshold", status: "Open", resolution: null },
  { id: "GAP 9103", intakeId: "INT 7001", intakeTitle: "Checkout Retry Policy Update", gapType: "Missing Evidence", question: "Provide fraud loss analysis", description: "Fraud loss exposure for a third retry attempt has not been quantified.", severity: "High", requiredForNextStage: true, assignedTo: "Fraud Engineering", dueDate: "2026-08-12", impact: "Fraud dependency risk cannot be sized", status: "Open", resolution: null },
  { id: "GAP 9104", intakeId: "INT 7001", intakeTitle: "Checkout Retry Policy Update", gapType: "Ambiguous Scope", question: "Confirm maximum traffic exposure", description: "Rollout plan targets 100 percent but approval thresholds depend on the maximum exposure.", severity: "Medium", requiredForNextStage: true, assignedTo: "Checkout Engineering", dueDate: "2026-08-09", impact: "Determines whether the >10 percent approval condition applies", status: "Open", resolution: null },
  { id: "GAP 9105", intakeId: "INT 7001", intakeTitle: "Checkout Retry Policy Update", gapType: "Unsupported Assumption", question: "Confirm quarter end deployment applicability", description: "Target date may fall within the quarter end restricted window.", severity: "Medium", requiredForNextStage: true, assignedTo: "Release Governance", dueDate: "2026-08-09", impact: "Determines whether a governance exception is required", status: "Open", resolution: null },
  { id: "GAP 9110", intakeId: "INT 7003", intakeTitle: "Fraud Decision Service Timeout Adjustment", gapType: "Missing Success Metric", question: "Define false decline success metric", description: "No measurable target defined for false decline reduction.", severity: "Medium", requiredForNextStage: true, assignedTo: "Fraud Engineering", dueDate: "2026-08-13", impact: "Outcome cannot be evaluated later", status: "Open", resolution: null },
  { id: "GAP 9120", intakeId: "INT 7004", intakeTitle: "Regional Token Vault Migration", gapType: "Unresolved Entity", question: "Confirm canonical regional vault instances", description: "Three detected vault identifiers cannot be resolved to canonical entities.", severity: "Critical", requiredForNextStage: true, assignedTo: "Platform Engineering", dueDate: "2026-08-08", impact: "Enterprise context retrieval incomplete", status: "Open", resolution: null },
  { id: "GAP 9121", intakeId: "INT 7004", intakeTitle: "Regional Token Vault Migration", gapType: "Missing Owner", question: "Assign EMEA data residency owner", description: "No accountable owner for residency validation.", severity: "High", requiredForNextStage: true, assignedTo: "Unassigned", dueDate: "2026-08-08", impact: "Compliance review cannot start", status: "Open", resolution: null },
  { id: "GAP 9130", intakeId: "INT 7006", intakeTitle: "Quarter End Release Exception", gapType: "Missing Evidence", question: "Provide business justification evidence", description: "Revenue impact justification not attached.", severity: "High", requiredForNextStage: true, assignedTo: "Release Engineering", dueDate: "2026-08-08", impact: "Exception cannot be reviewed", status: "Open", resolution: null },
  { id: "GAP 9131", intakeId: "INT 7006", intakeTitle: "Quarter End Release Exception", gapType: "Missing Owner", question: "Confirm executive sponsor", description: "Governance exceptions require an accountable executive sponsor.", severity: "Medium", requiredForNextStage: true, assignedTo: "Unassigned", dueDate: "2026-08-09", impact: "Approval chain incomplete", status: "Open", resolution: null },
  { id: "GAP 9140", intakeId: "INT 7007", intakeTitle: "Customer Support Escalation Workflow Update", gapType: "Ambiguous Scope", question: "Confirm pilot region", description: "Pilot region is not specified in the submission.", severity: "Low", requiredForNextStage: false, assignedTo: "Customer Support Operations", dueDate: "2026-08-15", impact: "Scope definition incomplete", status: "Open", resolution: null },
];

export const gapSummary = [
  { label: "Needs Clarification", value: 17 },
  { label: "Missing Evidence", value: 7 },
  { label: "Ambiguous Scope", value: 5 },
  { label: "Missing Owner", value: 3 },
  { label: "Unsupported Assumptions", value: 2 },
  { label: "Unresolved Entities", value: 5 },
  { label: "Missing Rollback Definition", value: 4 },
  { label: "Missing Success Metric", value: 3 },
];

export const relatedWork: CognitiveIntakeRelatedWork[] = [
  { id: "RW 01", intakeId: "INT 7001", relatedRecordType: "Prior Decision", relatedRecordId: "DEC 4812", title: "Prior Retry Increase Decision", relationshipType: "Same change object", similarity: 94, date: "2025-11-14", owner: "Payments Platform", outcome: "Approved with conditions", relevance: "High", potentialDuplicate: false, included: true, status: "Current" },
  { id: "RW 02", intakeId: "INT 7001", relatedRecordType: "Prior Outcome", relatedRecordId: "OUT 3284", title: "Prior Retry Outcome", relationshipType: "Measured result", similarity: 92, date: "2026-02-03", owner: "Payments Platform", outcome: "Completion +1.8%, duplicates +0.4%", relevance: "High", potentialDuplicate: false, included: true, status: "Current" },
  { id: "RW 03", intakeId: "INT 7001", relatedRecordType: "Prior Evaluation", relatedRecordId: "EVAL 2048", title: "Prior Retry Evaluation", relationshipType: "Prior assessment", similarity: 88, date: "2025-11-02", owner: "Cognitive Readiness", outcome: "Conditional readiness", relevance: "Medium", potentialDuplicate: false, included: true, status: "Historical" },
  { id: "RW 04", intakeId: "INT 7001", relatedRecordType: "Intake", relatedRecordId: "INT 6428", title: "Retry Timeout Adjustment", relationshipType: "Adjacent change", similarity: 71, date: "2026-05-19", owner: "Payments Platform", outcome: "Routed to readiness", relevance: "Medium", potentialDuplicate: true, included: false, status: "Closed" },
  { id: "RW 05", intakeId: "INT 7001", relatedRecordType: "Architecture Review", relatedRecordId: "RFC 2084", title: "Payments Retry Architecture Review", relationshipType: "Architectural context", similarity: 66, date: "2025-08-27", owner: "Architecture Review Board", outcome: "Accepted", relevance: "Medium", potentialDuplicate: false, included: true, status: "Historical" },
];

export const intakeHistory = [
  { id: "H1", at: "2026-07-28 09:12", action: "Submitted", detail: "Received from Enterprise Change Management CHG 88214", owner: "Marcus Lee" },
  { id: "H2", at: "2026-07-28 09:12", action: "Original Preserved", detail: "SUB 41002 stored with content hash", owner: "Intake Operations" },
  { id: "H3", at: "2026-07-28 09:14", action: "Classified", detail: "Configuration Change · Reliability", owner: "Intake Operations" },
  { id: "H4", at: "2026-07-28 09:16", action: "Decomposed", detail: "12 change elements extracted", owner: "Change Modeling" },
  { id: "H5", at: "2026-07-28 09:19", action: "Context Retrieved", detail: "23 memory records retrieved", owner: "Memory Services" },
  { id: "H6", at: "2026-07-28 09:21", action: "Personas Matched", detail: "6 candidate Team Personas identified", owner: "Persona Services" },
  { id: "H7", at: "2026-07-28 09:23", action: "Conditions Matched", detail: "18 Business Conditions matched", owner: "Condition Services" },
  { id: "H8", at: "2026-07-28 09:26", action: "Gap Detected", detail: "Idempotency evidence missing", owner: "Evidence Governance" },
  { id: "H9", at: "2026-08-06 14:40", action: "Package Updated", detail: "Package completeness recalculated to 82 percent", owner: "Intake Operations" },
];

export const activities: CognitiveIntakeActivity[] = [
  { id: "ACT 4101", timestamp: "14:40", intakeId: "INT 7001", action: "Package Updated", description: "Intake Package recalculated after evidence review", teamId: "team-checkout", result: "Warning", owner: "Intake Operations", auditId: "AUD 71001" },
  { id: "ACT 4102", timestamp: "13:02", intakeId: "INT 7004", action: "Entity Unresolved", description: "3 vault identifiers could not be resolved", teamId: "team-platform", result: "Blocked", owner: "Entity Resolution", auditId: "AUD 71002" },
  { id: "ACT 4103", timestamp: "12:18", intakeId: "INT 7005", action: "Routed", description: "Intake Package routed to Cognitive Readiness Assessment", teamId: "team-sre", result: "Success", owner: "Intake Operations", auditId: "AUD 71003" },
  { id: "ACT 4104", timestamp: "11:30", intakeId: "INT 7007", action: "Context Retrieved", description: "11 memory records retrieved", teamId: "team-support", result: "Success", owner: "Memory Services", auditId: "AUD 71004" },
  { id: "ACT 4105", timestamp: "09:11", intakeId: "INT 7003", action: "Conditions Matched", description: "14 Business Conditions matched", teamId: "team-fraud", result: "Success", owner: "Condition Services", auditId: "AUD 71005" },
];

/* --------------------------------------------------------- classification -- */

export const workClassification: {
  type: IntakeWorkType; count: number; active: number; complete: number;
  clarification: number; avgContextMatch: number; avgDuration: string;
}[] = [
  { type: "Feature Change", count: 34, active: 9, complete: 25, clarification: 4, avgContextMatch: 92, avgDuration: "3 h 40 m" },
  { type: "Configuration Change", count: 28, active: 7, complete: 24, clarification: 3, avgContextMatch: 95, avgDuration: "2 h 05 m" },
  { type: "Architecture Change", count: 12, active: 5, complete: 7, clarification: 3, avgContextMatch: 84, avgDuration: "9 h 15 m" },
  { type: "Infrastructure Change", count: 15, active: 3, complete: 12, clarification: 1, avgContextMatch: 90, avgDuration: "4 h 10 m" },
  { type: "Security Change", count: 9, active: 2, complete: 7, clarification: 1, avgContextMatch: 93, avgDuration: "5 h 30 m" },
  { type: "Policy Change", count: 6, active: 1, complete: 5, clarification: 0, avgContextMatch: 88, avgDuration: "3 h 05 m" },
  { type: "Process Change", count: 11, active: 3, complete: 8, clarification: 1, avgContextMatch: 87, avgDuration: "3 h 25 m" },
  { type: "Data Change", count: 8, active: 2, complete: 6, clarification: 1, avgContextMatch: 89, avgDuration: "4 h 45 m" },
  { type: "API Change", count: 13, active: 4, complete: 9, clarification: 1, avgContextMatch: 94, avgDuration: "3 h 15 m" },
  { type: "Release Change", count: 10, active: 2, complete: 8, clarification: 0, avgContextMatch: 96, avgDuration: "1 h 40 m" },
  { type: "Capacity Change", count: 7, active: 1, complete: 6, clarification: 0, avgContextMatch: 91, avgDuration: "2 h 55 m" },
  { type: "Reliability Improvement", count: 9, active: 3, complete: 6, clarification: 1, avgContextMatch: 93, avgDuration: "3 h 00 m" },
  { type: "Incident Remediation", count: 8, active: 4, complete: 4, clarification: 1, avgContextMatch: 90, avgDuration: "1 h 20 m" },
  { type: "Compliance Change", count: 5, active: 1, complete: 4, clarification: 0, avgContextMatch: 92, avgDuration: "6 h 10 m" },
  { type: "Vendor Change", count: 4, active: 1, complete: 3, clarification: 0, avgContextMatch: 85, avgDuration: "7 h 25 m" },
  { type: "Customer Experience Change", count: 4, active: 1, complete: 3, clarification: 0, avgContextMatch: 89, avgDuration: "3 h 50 m" },
  { type: "Governance Exception", count: 3, active: 2, complete: 1, clarification: 1, avgContextMatch: 92, avgDuration: "2 h 30 m" },
];

/* ----------------------------------------------------- decomposition quality */

export const decompositionQuality = {
  overall: 93,
  dimensions: [
    { id: "intent", name: "Intent Clarity", current: 96, target: 95, trend: "+2", affected: 4, status: "Healthy" },
    { id: "current", name: "Current State Definition", current: 91, target: 93, trend: "+1", affected: 9, status: "Attention" },
    { id: "proposed", name: "Proposed State Definition", current: 94, target: 93, trend: "+3", affected: 6, status: "Healthy" },
    { id: "scope", name: "Scope Definition", current: 88, target: 92, trend: "-1", affected: 14, status: "Attention" },
    { id: "entity", name: "Entity Resolution", current: 92, target: 95, trend: "+2", affected: 11, status: "Attention" },
    { id: "dependency", name: "Dependency Identification", current: 90, target: 92, trend: "+1", affected: 10, status: "Attention" },
    { id: "risk", name: "Risk Signal Identification", current: 91, target: 90, trend: "+2", affected: 7, status: "Healthy" },
    { id: "assumption", name: "Assumption Identification", current: 89, target: 90, trend: "0", affected: 8, status: "Attention" },
    { id: "evidence", name: "Evidence Identification", current: 94, target: 92, trend: "+3", affected: 5, status: "Healthy" },
    { id: "owner", name: "Owner Resolution", current: 95, target: 95, trend: "+1", affected: 3, status: "Healthy" },
  ],
};

/* ------------------------------------------------------- context match panel */

export const contextMatchMetrics = [
  { label: "Context Match Coverage", value: "91%" },
  { label: "Memory Records Retrieved", value: "8,426" },
  { label: "Business Conditions Matched", value: "1,284" },
  { label: "Personas Matched", value: "42" },
  { label: "Prior Decisions Matched", value: "68" },
  { label: "Outcomes Matched", value: "54" },
  { label: "Learning Records Matched", value: "31" },
];

export const contextTypeOrder: IntakeMemoryType[] = [
  "Team Persona", "Business Condition", "Policy", "Risk", "Control",
  "Prior Decision", "Prior Outcome", "Learning Record", "Evidence",
];

/* ------------------------------------------------------------------ filters */

export interface IntakeFilters {
  businessUnit: string; submittingTeam: string; workType: string; workStatus: string;
  priority: string; knowledgeDomain: string; product: string; service: string;
  system: string; customerJourney: string; workOwner: string; intakeOwner: string;
  contextStatus: string; evidenceStatus: string; personaMatchStatus: string;
  missingInformationStatus: string; riskSignal: string; accessClassification: string;
  environment: string; region: string; submissionMethod: string; dueDate: string; timeRange: string;
}

export const defaultIntakeFilters: IntakeFilters = {
  businessUnit: "All", submittingTeam: "All", workType: "All", workStatus: "All",
  priority: "All", knowledgeDomain: "All", product: "All", service: "All",
  system: "All", customerJourney: "All", workOwner: "All", intakeOwner: "All",
  contextStatus: "All", evidenceStatus: "All", personaMatchStatus: "All",
  missingInformationStatus: "All", riskSignal: "All", accessClassification: "All",
  environment: "All", region: "All", submissionMethod: "All", dueDate: "All", timeRange: "Last 30 Days",
};

export const intakeFilterLabels: Record<keyof IntakeFilters, string> = {
  businessUnit: "Business Unit", submittingTeam: "Submitting Team", workType: "Work Type",
  workStatus: "Work Status", priority: "Priority", knowledgeDomain: "Knowledge Domain",
  product: "Product", service: "Service", system: "System", customerJourney: "Customer Journey",
  workOwner: "Work Owner", intakeOwner: "Intake Owner", contextStatus: "Context Status",
  evidenceStatus: "Evidence Status", personaMatchStatus: "Persona Match Status",
  missingInformationStatus: "Missing Information", riskSignal: "Risk Signal",
  accessClassification: "Access Classification", environment: "Environment", region: "Region",
  submissionMethod: "Submission Method", dueDate: "Due Date", timeRange: "Time Range",
};

export const intakeFilterOptions: Record<keyof IntakeFilters, string[]> = {
  businessUnit: ["All", "Digital Commerce", "Platform Services", "Risk & Trust", "Customer Experience"],
  submittingTeam: ["All", ...Array.from(new Set(intakes.map((i) => i.submittingTeamName)))],
  workType: ["All", ...Array.from(new Set(intakes.map((i) => i.workType)))],
  workStatus: ["All", ...Array.from(new Set(intakes.map((i) => i.status)))],
  priority: ["All", "Critical", "High", "Medium", "Low"],
  knowledgeDomain: ["All", "Payments", "Identity", "Fraud", "Reliability", "Release Governance", "Support"],
  product: ["All", "Checkout", "Payments Platform", "Identity Platform", "Support Desk"],
  service: ["All", "Payments API", "Retry Orchestrator", "Fraud Decision Service", "Identity Services", "Regional Token Vault"],
  system: ["All", "Retry Orchestrator", "Payments API", "Observability Platform", "Regional Token Vault"],
  customerJourney: ["All", "Checkout Customer Journey", "Account Creation", "Support Escalation"],
  workOwner: ["All", ...Array.from(new Set(intakes.map((i) => i.workOwner)))],
  intakeOwner: ["All", "Intake Operations", "Change Modeling", "Evidence Governance", "Memory Services"],
  contextStatus: ["All", "Matched", "Partial", "Unmatched"],
  evidenceStatus: ["All", "Complete", "Partial", "Missing"],
  personaMatchStatus: ["All", "Matched", "Partial", "Unmatched"],
  missingInformationStatus: ["All", "None", "Some", "Blocking"],
  riskSignal: ["All", "Duplicate Authorization", "Latency Amplification", "Fraud Decision Timeout", "Dependency Saturation", "Governance Restriction"],
  accessClassification: ["All", "Internal", "Confidential", "Restricted"],
  environment: ["All", "Production", "Staging", "Development"],
  region: ["All", "Global", "North America", "EMEA", "APAC"],
  submissionMethod: ["All", "Change Portal", "Architecture Review", "Governance Request", "Process Request"],
  dueDate: ["All", "Overdue", "Next 7 Days", "Next 30 Days"],
  timeRange: ["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days", "Custom"],
};

export const savedIntakeViews = ["Default", "Needs Clarification", "Critical Work", "Ready Packages", "My Team"];

export const activeIntakeFilterCount = (f: IntakeFilters) =>
  (Object.keys(f) as (keyof IntakeFilters)[])
    .filter((k) => k !== "timeRange" && f[k] !== "All").length + (f.timeRange !== "Last 30 Days" ? 1 : 0);

const contextBucket = (n: number) => (n >= 95 ? "Matched" : n >= 85 ? "Partial" : "Unmatched");
const evidenceBucket = (n: number) => (n >= 95 ? "Complete" : n >= 80 ? "Partial" : "Missing");
const missingBucket = (n: number) => (n === 0 ? "None" : n <= 3 ? "Some" : "Blocking");

export const applyIntakeFilters = (rows: CognitiveIntake[], f: IntakeFilters, search: string) =>
  rows.filter((r) => {
    if (f.businessUnit !== "All" && r.businessUnit !== f.businessUnit) return false;
    if (f.submittingTeam !== "All" && r.submittingTeamName !== f.submittingTeam) return false;
    if (f.workType !== "All" && r.workType !== f.workType) return false;
    if (f.workStatus !== "All" && r.status !== f.workStatus) return false;
    if (f.priority !== "All" && r.priority !== f.priority) return false;
    if (f.workOwner !== "All" && r.workOwner !== f.workOwner) return false;
    if (f.accessClassification !== "All" && r.accessClassification !== f.accessClassification) return false;
    if (f.environment !== "All" && r.environment !== f.environment) return false;
    if (f.region !== "All" && r.region !== f.region) return false;
    if (f.submissionMethod !== "All" && r.submissionMethod !== f.submissionMethod) return false;
    if (f.contextStatus !== "All" && contextBucket(r.contextMatchScore) !== f.contextStatus) return false;
    if (f.evidenceStatus !== "All" && evidenceBucket(r.evidenceCoverage) !== f.evidenceStatus) return false;
    if (f.personaMatchStatus !== "All" && contextBucket(r.contextMatchScore) !== f.personaMatchStatus) return false;
    if (f.missingInformationStatus !== "All" && missingBucket(r.missingItems) !== f.missingInformationStatus) return false;
    if (f.service !== "All" && !r.scope.toLowerCase().includes(f.service.toLowerCase())) return false;
    if (f.system !== "All" && !r.scope.toLowerCase().includes(f.system.toLowerCase())) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = `${r.id} ${r.title} ${r.workType} ${r.submittingTeamName} ${r.workOwner} ${r.status} ${r.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

/* ------------------------------------------------------------ queue columns */

export const queueColumns: { key: string; label: string; pinned?: boolean }[] = [
  { key: "id", label: "Intake ID", pinned: true },
  { key: "title", label: "Work Item", pinned: true },
  { key: "workType", label: "Work Type" },
  { key: "submittingTeamName", label: "Submitting Team" },
  { key: "workOwner", label: "Owner" },
  { key: "priority", label: "Priority" },
  { key: "stage", label: "Current Stage" },
  { key: "contextMatchScore", label: "Context Match" },
  { key: "personas", label: "Candidate Personas" },
  { key: "conditionsMatched", label: "Conditions" },
  { key: "evidenceCoverage", label: "Evidence Coverage" },
  { key: "missingItems", label: "Missing Items" },
  { key: "intakeConfidence", label: "Confidence" },
  { key: "submittedAt", label: "Submitted" },
  { key: "ageHours", label: "Age" },
  { key: "status", label: "Status" },
];

export const stageName = (id: string) =>
  intakeLifecycleStages.find((s) => s.id === id)?.name ?? id;

/* -------------------------------------------------- package completeness ---- */

export interface PackageCompletenessInput {
  contextConfidence: number;
  evidenceCoverage: number;
  openQuestionsResolved: number;
  entityResolution: number;
  conditionsIdentified: number;
}

export const completenessDimensions = (i: PackageCompletenessInput) => [
  { id: "work", label: "Work Definition", value: 96 },
  { id: "entity", label: "Entity Resolution", value: i.entityResolution },
  { id: "context", label: "Enterprise Context Match", value: Math.round(i.contextConfidence) },
  { id: "persona", label: "Persona Candidates Identified", value: 100 },
  { id: "conditions", label: "Applicable Conditions Identified", value: i.conditionsIdentified },
  { id: "evidence", label: "Evidence Coverage", value: Math.round(i.evidenceCoverage) },
  { id: "questions", label: "Open Questions Resolved", value: Math.round(i.openQuestionsResolved) },
  { id: "confidence", label: "Context Confidence", value: Math.round(i.contextConfidence) },
];

export const overallCompleteness = (i: PackageCompletenessInput) => {
  const dims = completenessDimensions(i);
  const weights: Record<string, number> = {
    work: 1, entity: 1, context: 1.2, persona: 0.8, conditions: 1, evidence: 1.6, questions: 1.6, confidence: 1,
  };
  const total = dims.reduce((a, d) => a + d.value * (weights[d.id] ?? 1), 0);
  const wsum = dims.reduce((a, d) => a + (weights[d.id] ?? 1), 0);
  return Math.round(total / wsum);
};

export const nextStage = {
  name: "Cognitive Readiness Assessment",
  description:
    "Formally determine whether the Intake Package contains sufficient scope, evidence, ownership, enterprise context, and evaluation criteria to proceed into Persona Impact Analysis.",
  route: "/enterprise-cognitive-fabric/cognitive-readiness-assessment",
};

/* ------------------------------------------------------------ service layer */

/** Demonstration service accessors — swap the bodies for real API calls later. */
export const intakeService = {
  listIntakes: () => intakes,
  getIntake: (id: string) => intakes.find((i) => i.id === id) ?? intakes[0],
  listStages: () => intakeLifecycleStages,
  listChangeElements: (intakeId: string) => changeElements.filter((c) => c.intakeId === intakeId),
  listContext: (intakeId: string) => contextMatches.filter((c) => c.intakeId === intakeId),
  listPersonaCandidates: (intakeId: string) => personaCandidates.filter((p) => p.intakeId === intakeId),
  listEvidence: (intakeId: string) => evidenceItems.filter((e) => e.intakeId === intakeId),
  listGaps: (intakeId?: string) => (intakeId ? gaps.filter((g) => g.intakeId === intakeId) : gaps),
  listRelatedWork: (intakeId: string) => relatedWork.filter((r) => r.intakeId === intakeId),
  listEntities: (intakeId: string) => entityMatches.filter((e) => e.intakeId === intakeId),
  listActivity: () => activities,
};
