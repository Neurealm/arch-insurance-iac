/**
 * Deterministic seeded data + typed models for Business Condition Extraction.
 * No live services. Resolver functions are the seam where APIs will plug in later.
 */

export type ViewMode = "executive" | "operations" | "workbench" | "governance";
export type Density = "comfortable" | "compact";
export type Tone = "green" | "amber" | "red" | "blue" | "slate";

export type ServiceState =
  | "Operational" | "Extracting" | "Degraded" | "Paused" | "Backlogged" | "Review Required" | "Maintenance";

/* ------------------------------------------------------------------ models */

export interface BusinessCondition {
  id: string;
  conditionFamilyId: string;
  conditionTypeId: string;
  conditionStatement: string;
  subjectType: string;
  subjectId: string;
  subjectName: string;
  operator: string;
  value: string;
  valueMin: string | null;
  valueMax: string | null;
  unit: string;
  baseline: string | null;
  target: string | null;
  warningThreshold: string | null;
  criticalThreshold: string | null;
  escalationThreshold: string | null;
  timeWindow: string | null;
  trigger: string | null;
  requiredAction: string | null;
  effectiveDate: string;
  expirationDate: string | null;
  businessUnit: string;
  knowledgeDomains: string[];
  ownerTeamId: string;
  ownerTeamName: string;
  businessOwner: string;
  technicalOwner: string;
  controlOwner: string;
  approverIds: string[];
  reviewerIds: string[];
  authorityLevel: "Primary" | "Supporting" | "Historical" | "Reference" | "Unconfirmed";
  approvalState: "Approved" | "Pending Review" | "Review Required" | "Conflict Review" | "Draft";
  confidence: number;
  freshnessStatus: "Current" | "Aging" | "Stale";
  accessClassification: "Public" | "Internal" | "Confidential" | "Restricted";
  regulatoryScope: string[];
  applicableTeamIds: string[];
  applicableSystemIds: string[];
  applicableServiceIds: string[];
  applicableProductIds: string[];
  businessCapabilityIds: string[];
  customerJourneyIds: string[];
  externalStakeholderIds: string[];
  dependencyIds: string[];
  riskIds: string[];
  assumptionIds: string[];
  controlIds: string[];
  evidenceReferenceIds: string[];
  sourceArtifactIds: string[];
  sourceConditionCandidateIds: string[];
  conflictingConditionIds: string[];
  supersedesConditionId: string | null;
  supersededByConditionId: string | null;
  version: string;
  reviewStatus: "None" | "Queued" | "In Review" | "Complete";
  businessImpact: "Critical" | "High" | "Medium" | "Low";
  evidenceCoverage: number;
  downstreamUse: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ConditionCandidate {
  id: string;
  extractionJobId: string;
  canonicalArtifactId: string;
  conditionTypeId: string;
  candidateStatement: string;
  subjectCandidate: string;
  operatorCandidate: string;
  valueCandidate: string;
  unitCandidate: string;
  ownerCandidate: string;
  dependencyCandidates: string[];
  riskCandidates: string[];
  evidenceReferenceIds: string[];
  classificationConfidence: number;
  valueConfidence: number;
  ownerConfidence: number;
  authorityConfidence: number;
  overallConfidence: number;
  candidateStatus: "Suggested" | "Accepted" | "Rejected" | "Review Required" | "Conflict" | "Incomplete";
  context?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConditionEvidenceReference {
  id: string;
  conditionId: string | null;
  candidateId: string | null;
  artifactId: string;
  canonicalArtifactId: string;
  evidenceId: string;
  sourceId: string;
  sectionId: string;
  chunkId: string;
  pageNumber: number;
  paragraphNumber: number;
  passageText: string;
  contentHash: string;
  sourceAuthority: string;
  evidenceConfidence: number;
  accessClassification: string;
  sourceTimestamp: string;
  capturedAt: string;
}

export interface ConditionDependency {
  id: string;
  conditionId: string;
  dependencyType: "Upstream" | "Downstream" | "Service" | "Team" | "Data" | "Event";
  targetType: string;
  targetId: string;
  targetName: string;
  relationshipType: string;
  confidence: number;
  evidenceReferenceIds: string[];
  status: string;
}

export interface ConditionConflict {
  id: string;
  conditionAId: string;
  conditionBId: string;
  conflictType: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  businessImpact: string;
  technicalImpact: string;
  affectedTeamIds: string[];
  affectedPersonaIds: string[];
  affectedEvaluationIds: string[];
  valueA: string;
  valueB: string;
  authorityA: string;
  authorityB: string;
  effectiveDate: string;
  recommendedResolution: string;
  reviewStatus: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ConditionGap {
  id: string;
  candidateId: string;
  conditionId: string | null;
  candidateStatement: string;
  missingField: string;
  source: string;
  requiredForApproval: boolean;
  severity: "High" | "Medium" | "Low";
  confidence: number;
  recommendedAction: string;
  status: string;
  owner: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ExtractionJob {
  id: string;
  scope: string;
  source: string;
  knowledgeDomain: string;
  conditionTypeIds: string[];
  taxonomyVersion: string;
  status: "Running" | "Warning" | "Blocked" | "Paused" | "Complete" | "Queued";
  currentStageId: string;
  currentStageName: string;
  artifactCount: number;
  candidateCount: number;
  approvedConditionCount: number;
  rejectedConditionCount: number;
  conflictCount: number;
  gapCount: number;
  humanReviewCount: number;
  qualityScore: number;
  confidence: number;
  startedAt: string;
  elapsedTime: string;
  estimatedCompletion: string;
  owner: string;
  warningCount: number;
  configurationVersion: string;
}

export interface ExtractionStage {
  id: string;
  name: string;
  sequence: number;
  status: "Running" | "Warning" | "Review Required" | "Blocked" | "Idle";
  processedCount: number;
  pendingCount: number;
  failedCount: number;
  warningCount: number;
  successRate: number;
  averageDuration: string;
  p95Duration: string;
  throughput: string;
  slaTarget: string;
  slaStatus: "Within SLA" | "At Risk" | "Breached";
  owner: string;
  upstreamStageId: string | null;
  downstreamStageId: string | null;
}

export interface ConditionQualityMetric {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  variance: number;
  trend: "up" | "down" | "flat";
  status: "Healthy" | "Near Target" | "Below Target";
  affectedConditionCount: number;
  definition: string;
  topFailureCauses: string[];
}

export interface ConditionReadiness {
  approvedAndReady: number;
  awaitingHumanReview: number;
  activeConflicts: number;
  missingOwners: number;
  missingEvidence: number;
  lowConfidence: number;
  staleConditions: number;
  readyForPersonaConstruction: number;
  readyForCognitiveMemory: number;
  readyForContextGraph: number;
  readyForImpactAnalysis: number;
}

/* ------------------------------------------------------------------ stages */

const stageSeed: Omit<ExtractionStage, "upstreamStageId" | "downstreamStageId">[] = [
  { id: "load", name: "Load Canonical Artifact", sequence: 1, status: "Running", processedCount: 1_960_000, pendingCount: 12_000, failedCount: 214, warningCount: 42, successRate: 99.8, averageDuration: "2s", p95Duration: "5s", throughput: "18.2k/hr", slaTarget: "10s P95", slaStatus: "Within SLA", owner: "Knowledge Operations" },
  { id: "evidence", name: "Identify Candidate Evidence", sequence: 2, status: "Running", processedCount: 1_940_000, pendingCount: 18_000, failedCount: 486, warningCount: 128, successRate: 98.9, averageDuration: "18s", p95Duration: "41s", throughput: "16.4k/hr", slaTarget: "60s P95", slaStatus: "Within SLA", owner: "Knowledge Engineering" },
  { id: "detect", name: "Detect Condition Candidates", sequence: 3, status: "Running", processedCount: 1_910_000, pendingCount: 26_000, failedCount: 902, warningCount: 341, successRate: 97.8, averageDuration: "42s", p95Duration: "1.5m", throughput: "14.1k/hr", slaTarget: "2m P95", slaStatus: "Within SLA", owner: "Knowledge Engineering" },
  { id: "classify", name: "Classify Condition Types", sequence: 4, status: "Running", processedCount: 1_880_000, pendingCount: 31_000, failedCount: 1_204, warningCount: 402, successRate: 97.1, averageDuration: "34s", p95Duration: "1.2m", throughput: "13.6k/hr", slaTarget: "2m P95", slaStatus: "Within SLA", owner: "Taxonomy Governance" },
  { id: "normalize", name: "Normalize Values and Units", sequence: 5, status: "Warning", processedCount: 1_840_000, pendingCount: 39_000, failedCount: 2_412, warningCount: 1_118, successRate: 95.8, averageDuration: "1.1m", p95Duration: "2.7m", throughput: "11.8k/hr", slaTarget: "2.5m P95", slaStatus: "At Risk", owner: "Knowledge Engineering" },
  { id: "owners", name: "Resolve Owners and Dependencies", sequence: 6, status: "Warning", processedCount: 1_790_000, pendingCount: 46_000, failedCount: 3_042, warningCount: 1_642, successRate: 94.9, averageDuration: "1.4m", p95Duration: "3.2m", throughput: "10.2k/hr", slaTarget: "3m P95", slaStatus: "Breached", owner: "Organizational Data" },
  { id: "authority", name: "Score Authority and Confidence", sequence: 7, status: "Running", processedCount: 1_750_000, pendingCount: 28_000, failedCount: 884, warningCount: 302, successRate: 97.3, averageDuration: "37s", p95Duration: "1.4m", throughput: "12.9k/hr", slaTarget: "2m P95", slaStatus: "Within SLA", owner: "Knowledge Governance" },
  { id: "conflicts", name: "Detect Conflicts and Gaps", sequence: 8, status: "Warning", processedCount: 1_710_000, pendingCount: 41_000, failedCount: 2_884, warningCount: 1_486, successRate: 94.6, averageDuration: "1.6m", p95Duration: "3.8m", throughput: "9.4k/hr", slaTarget: "3m P95", slaStatus: "At Risk", owner: "Knowledge Governance" },
  { id: "validation", name: "Human Validation", sequence: 9, status: "Review Required", processedCount: 1_680_000, pendingCount: 427, failedCount: 118, warningCount: 427, successRate: 96.4, averageDuration: "8.2m", p95Duration: "22m", throughput: "182/hr", slaTarget: "24m P95", slaStatus: "At Risk", owner: "Domain Stewards" },
  { id: "publish", name: "Publish to Conditions Registry", sequence: 10, status: "Running", processedCount: 87_442, pendingCount: 2_184, failedCount: 64, warningCount: 22, successRate: 99.4, averageDuration: "9s", p95Duration: "21s", throughput: "4.2k/hr", slaTarget: "30s P95", slaStatus: "Within SLA", owner: "Registry Operations" },
];

export const lifecycleCallouts = [
  { tone: "amber" as Tone, text: "Owner resolution backlog elevated — 46k artifacts pending owner reconciliation." },
  { tone: "amber" as Tone, text: "Unit normalization confidence below target for legacy documents (pre-2022 PDFs)." },
  { tone: "red" as Tone, text: "Condition conflicts increasing in Payments and Identity domains (148 active)." },
  { tone: "green" as Tone, text: "Registry publishing stable at 99.4 percent success." },
];

export function resolveStages(overrides: Record<string, Partial<ExtractionStage>> = {}): ExtractionStage[] {
  return stageSeed.map((s, i) => ({
    ...s,
    upstreamStageId: i > 0 ? stageSeed[i - 1].id : null,
    downstreamStageId: i < stageSeed.length - 1 ? stageSeed[i + 1].id : null,
    ...overrides[s.id],
  }));
}

/* -------------------------------------------------------------------- jobs */

const jobSeed: ExtractionJob[] = [
  { id: "BCE-40452", scope: "Payments API Reliability Requirements", source: "Confluence Cloud", knowledgeDomain: "Payments and Reliability", conditionTypeIds: ["slo", "threshold", "dependency"], taxonomyVersion: "v4.2", status: "Warning", currentStageId: "conflicts", currentStageName: "Detect Conflicts and Gaps", artifactCount: 1, candidateCount: 42, approvedConditionCount: 31, rejectedConditionCount: 4, conflictCount: 3, gapCount: 4, humanReviewCount: 6, qualityScore: 94, confidence: 95, startedAt: "09:41", elapsedTime: "42m", estimatedCompletion: "10:38", owner: "Payments Platform", warningCount: 3, configurationVersion: "cfg-2026.08.2" },
  { id: "BCE-40451", scope: "Product Backlog Batch", source: "Jira", knowledgeDomain: "Product and Engineering", conditionTypeIds: ["requirement", "objective"], taxonomyVersion: "v4.2", status: "Running", currentStageId: "publish", currentStageName: "Publish to Conditions Registry", artifactCount: 88_214, candidateCount: 18_442, approvedConditionCount: 17_804, rejectedConditionCount: 322, conflictCount: 41, gapCount: 128, humanReviewCount: 62, qualityScore: 96, confidence: 97, startedAt: "07:12", elapsedTime: "3h 11m", estimatedCompletion: "10:52", owner: "Product Operations", warningCount: 0, configurationVersion: "cfg-2026.08.2" },
  { id: "BCE-40450", scope: "Slack Enterprise Batch", source: "Slack Enterprise", knowledgeDomain: "Customer Support and Operations", conditionTypeIds: ["decision-rule", "escalation"], taxonomyVersion: "v4.1", status: "Warning", currentStageId: "owners", currentStageName: "Resolve Owners and Dependencies", artifactCount: 412_998, candidateCount: 14_286, approvedConditionCount: 11_442, rejectedConditionCount: 1_204, conflictCount: 86, gapCount: 642, humanReviewCount: 148, qualityScore: 87, confidence: 88, startedAt: "05:02", elapsedTime: "5h 21m", estimatedCompletion: "12:40", owner: "Support Operations", warningCount: 7, configurationVersion: "cfg-2026.08.1" },
  { id: "BCE-40449", scope: "Architecture Review Transcripts", source: "Zoom Transcripts", knowledgeDomain: "Architecture and Engineering", conditionTypeIds: ["assumption", "constraint"], taxonomyVersion: "v4.1", status: "Warning", currentStageId: "validation", currentStageName: "Human Validation", artifactCount: 18_920, candidateCount: 4_212, approvedConditionCount: 3_486, rejectedConditionCount: 284, conflictCount: 22, gapCount: 186, humanReviewCount: 94, qualityScore: 85, confidence: 87, startedAt: "06:30", elapsedTime: "3h 53m", estimatedCompletion: "11:20", owner: "Architecture Guild", warningCount: 5, configurationVersion: "cfg-2026.08.1" },
  { id: "BCE-40448", scope: "Core Services Repository", source: "GitHub Enterprise", knowledgeDomain: "Engineering and Security", conditionTypeIds: ["control", "requirement"], taxonomyVersion: "v4.2", status: "Running", currentStageId: "classify", currentStageName: "Classify Condition Types", artifactCount: 56_340, candidateCount: 9_642, approvedConditionCount: 8_914, rejectedConditionCount: 142, conflictCount: 18, gapCount: 96, humanReviewCount: 24, qualityScore: 95, confidence: 96, startedAt: "08:15", elapsedTime: "2h 08m", estimatedCompletion: "11:02", owner: "Platform Security", warningCount: 1, configurationVersion: "cfg-2026.08.2" },
  { id: "BCE-40447", scope: "Customer Telemetry Batch", source: "Datadog", knowledgeDomain: "Operations and Reliability", conditionTypeIds: ["baseline", "kpi"], taxonomyVersion: "v4.2", status: "Running", currentStageId: "normalize", currentStageName: "Normalize Values and Units", artifactCount: 1_204_844, candidateCount: 31_822, approvedConditionCount: 29_710, rejectedConditionCount: 486, conflictCount: 34, gapCount: 214, humanReviewCount: 48, qualityScore: 93, confidence: 94, startedAt: "04:44", elapsedTime: "5h 39m", estimatedCompletion: "13:10", owner: "Site Reliability Engineering", warningCount: 2, configurationVersion: "cfg-2026.08.2" },
  { id: "BCE-40446", scope: "Identity Services API", source: "Apigee", knowledgeDomain: "Identity and Security", conditionTypeIds: ["threshold", "policy"], taxonomyVersion: "v4.0", status: "Blocked", currentStageId: "authority", currentStageName: "Score Authority and Confidence", artifactCount: 8_412, candidateCount: 1_284, approvedConditionCount: 842, rejectedConditionCount: 118, conflictCount: 46, gapCount: 88, humanReviewCount: 52, qualityScore: 73, confidence: 76, startedAt: "08:58", elapsedTime: "1h 25m", estimatedCompletion: "Blocked", owner: "Identity Engineering", warningCount: 12, configurationVersion: "cfg-2026.07.4" },
];

export function makeExtractionJob(partial: Partial<ExtractionJob>): ExtractionJob {
  return {
    ...jobSeed[0],
    id: `BCE-${40453 + Math.floor(Math.random() * 40)}`,
    status: "Running",
    ...partial,
  };
}

/* -------------------------------------------------------------- conditions */

const base = {
  subjectType: "Service",
  valueMin: null, valueMax: null, warningThreshold: null, criticalThreshold: null,
  escalationThreshold: null, expirationDate: null, businessUnit: "Global Commerce",
  controlOwner: "Risk & Controls", approverIds: ["USR-2201"], reviewerIds: ["USR-3310"],
  regulatoryScope: ["PCI DSS"], businessCapabilityIds: ["CAP-Payments"],
  externalStakeholderIds: [], riskIds: ["RSK-118"], assumptionIds: [], controlIds: ["CTL-402"],
  sourceConditionCandidateIds: [], conflictingConditionIds: [], supersedesConditionId: null,
  supersededByConditionId: null, version: "1.4", reviewStatus: "None" as const,
  createdAt: "2026-06-14", updatedAt: "2026-08-02", publishedAt: "2026-08-02",
  accessClassification: "Internal" as const,
};

export const conditions: BusinessCondition[] = [
  {
    ...base, id: "COND-100421", conditionFamilyId: "fam-slo", conditionTypeId: "Service Level Objective",
    conditionStatement: "Payments API monthly availability shall be at least 99.95 percent",
    subjectId: "SVC-Payments", subjectName: "Payments API", operator: ">=", value: "99.95", unit: "Percent Monthly Availability",
    baseline: "99.91", target: "99.95", timeWindow: "Calendar month", trigger: null, requiredAction: null,
    effectiveDate: "2026-07-01", knowledgeDomains: ["Payments and Reliability"],
    ownerTeamId: "TEAM-PR", ownerTeamName: "Payments Reliability", businessOwner: "D. Okafor", technicalOwner: "M. Alvarez",
    authorityLevel: "Primary", approvalState: "Approved", confidence: 98, freshnessStatus: "Current",
    applicableTeamIds: ["TEAM-PR", "TEAM-PP"], applicableSystemIds: ["SYS-Payments"], applicableServiceIds: ["SVC-Payments", "SVC-Identity"],
    applicableProductIds: ["PRD-Checkout"], customerJourneyIds: ["CJ-Checkout"], dependencyIds: ["DEP-1", "DEP-2", "DEP-3"],
    evidenceReferenceIds: ["EVR-1"], sourceArtifactIds: ["CAN-90121"], businessImpact: "Critical", evidenceCoverage: 100,
    downstreamUse: ["Payments Reliability Persona", "Impact Analysis", "Context Graph"],
  },
  {
    ...base, id: "COND-100422", conditionFamilyId: "fam-threshold", conditionTypeId: "Performance Threshold",
    conditionStatement: "Payments API P95 latency shall remain below 250 milliseconds during peak checkout periods",
    subjectId: "SVC-Payments", subjectName: "Payments API P95 Latency", operator: "<", value: "250", unit: "Milliseconds",
    baseline: "228", target: "250", warningThreshold: "220", criticalThreshold: "250", timeWindow: "Peak checkout periods",
    trigger: null, requiredAction: null, effectiveDate: "2026-07-01", knowledgeDomains: ["Payments and Checkout"],
    ownerTeamId: "TEAM-PP", ownerTeamName: "Payments Platform", businessOwner: "D. Okafor", technicalOwner: "S. Rao",
    authorityLevel: "Primary", approvalState: "Approved", confidence: 97, freshnessStatus: "Current",
    applicableTeamIds: ["TEAM-PP"], applicableSystemIds: ["SYS-Payments"], applicableServiceIds: ["SVC-Payments"],
    applicableProductIds: ["PRD-Checkout"], customerJourneyIds: ["CJ-Checkout"], dependencyIds: ["DEP-1"],
    evidenceReferenceIds: ["EVR-2"], sourceArtifactIds: ["CAN-90121"], businessImpact: "High", evidenceCoverage: 100,
    downstreamUse: ["Checkout Engineering Persona", "Impact Analysis"],
  },
  {
    ...base, id: "COND-100423", conditionFamilyId: "fam-baseline", conditionTypeId: "Baseline",
    conditionStatement: "Current Payments API error rate baseline is 0.8 percent",
    subjectId: "MET-ErrorRate", subjectType: "Metric", subjectName: "Payments API Error Rate", operator: "=", value: "0.8", unit: "Percent",
    baseline: "0.8", target: "0.3", timeWindow: "Last 30 day production average", trigger: null, requiredAction: null,
    effectiveDate: "2026-06-01", knowledgeDomains: ["Payments and Reliability"],
    ownerTeamId: "TEAM-SRE", ownerTeamName: "Site Reliability Engineering", businessOwner: "L. Chen", technicalOwner: "M. Alvarez",
    authorityLevel: "Supporting", approvalState: "Approved", confidence: 96, freshnessStatus: "Current",
    applicableTeamIds: ["TEAM-SRE"], applicableSystemIds: ["SYS-Payments"], applicableServiceIds: ["SVC-Payments"],
    applicableProductIds: ["PRD-Checkout"], customerJourneyIds: ["CJ-Checkout"], dependencyIds: [],
    evidenceReferenceIds: ["EVR-3"], sourceArtifactIds: ["CAN-90121"], businessImpact: "Medium", evidenceCoverage: 92,
    downstreamUse: ["Impact Analysis"],
  },
  {
    ...base, id: "COND-100424", conditionFamilyId: "fam-target", conditionTypeId: "Target",
    conditionStatement: "Payments API error rate target is less than 0.3 percent",
    subjectId: "MET-ErrorRate", subjectType: "Metric", subjectName: "Payments API Error Rate", operator: "<", value: "0.3", unit: "Percent",
    baseline: "0.8", target: "0.3", warningThreshold: "0.5", criticalThreshold: "0.8", escalationThreshold: "1.0 for 5 minutes",
    timeWindow: "End of Q3", trigger: null, requiredAction: null, effectiveDate: "2026-07-01",
    knowledgeDomains: ["Payments and Reliability"], ownerTeamId: "TEAM-PP", ownerTeamName: "Payments Platform",
    businessOwner: "D. Okafor", technicalOwner: "S. Rao", authorityLevel: "Primary", approvalState: "Approved",
    confidence: 96, freshnessStatus: "Current", applicableTeamIds: ["TEAM-PP", "TEAM-SRE"], applicableSystemIds: ["SYS-Payments"],
    applicableServiceIds: ["SVC-Payments"], applicableProductIds: ["PRD-Checkout"], customerJourneyIds: ["CJ-Checkout"],
    dependencyIds: [], evidenceReferenceIds: ["EVR-4"], sourceArtifactIds: ["CAN-90121"], businessImpact: "High",
    evidenceCoverage: 96, downstreamUse: ["Payments Reliability Persona", "Decision Intelligence"],
  },
  {
    ...base, id: "COND-100425", conditionFamilyId: "fam-approval", conditionTypeId: "Approval Requirement",
    conditionStatement: "Retry policy changes affecting more than 10 percent of checkout traffic require approval from Payments Reliability and Fraud Engineering",
    subjectId: "SVC-Payments", subjectName: "Payments API Retry Policy", operator: "requires", value: "Dual approval", unit: "Approval",
    baseline: null, target: null, timeWindow: null,
    trigger: "Retry policy change affecting more than 10 percent of checkout traffic",
    requiredAction: "Obtain approval from Payments Reliability and Fraud Engineering",
    effectiveDate: "2026-05-15", knowledgeDomains: ["Payments and Fraud"],
    ownerTeamId: "TEAM-PP", ownerTeamName: "Payments Platform", businessOwner: "D. Okafor", technicalOwner: "S. Rao",
    authorityLevel: "Primary", approvalState: "Review Required", confidence: 94, freshnessStatus: "Current",
    applicableTeamIds: ["TEAM-PP", "TEAM-FR"], applicableSystemIds: ["SYS-Payments"], applicableServiceIds: ["SVC-Payments", "SVC-Fraud"],
    applicableProductIds: ["PRD-Checkout"], customerJourneyIds: ["CJ-Checkout"], dependencyIds: ["DEP-2"],
    evidenceReferenceIds: ["EVR-5"], sourceArtifactIds: ["CAN-90121"], businessImpact: "High", evidenceCoverage: 88,
    reviewStatus: "Queued", downstreamUse: ["Release Approval Decision"],
  },
  {
    ...base, id: "COND-100426", conditionFamilyId: "fam-dependency", conditionTypeId: "Dependency",
    conditionStatement: "Payments API depends on Identity Services, Fraud Decision Service, and Regional Token Vault",
    subjectId: "SVC-Payments", subjectName: "Payments API", operator: "depends on", value: "3 services", unit: "Services",
    baseline: null, target: null, timeWindow: null, trigger: null, requiredAction: null,
    effectiveDate: "2026-04-02", knowledgeDomains: ["Payments and Identity"],
    ownerTeamId: "TEAM-PP", ownerTeamName: "Payments Platform", businessOwner: "D. Okafor", technicalOwner: "S. Rao",
    authorityLevel: "Primary", approvalState: "Approved", confidence: 97, freshnessStatus: "Current",
    applicableTeamIds: ["TEAM-PP", "TEAM-ID"], applicableSystemIds: ["SYS-Payments", "SYS-Identity"],
    applicableServiceIds: ["SVC-Identity", "SVC-Fraud", "SVC-TokenVault"], applicableProductIds: ["PRD-Checkout"],
    customerJourneyIds: ["CJ-Checkout"], dependencyIds: ["DEP-1", "DEP-2", "DEP-3"], evidenceReferenceIds: ["EVR-6"],
    sourceArtifactIds: ["CAN-90121"], businessImpact: "Critical", evidenceCoverage: 100,
    downstreamUse: ["Context Graph", "Impact Analysis"],
  },
  {
    ...base, id: "COND-100427", conditionFamilyId: "fam-change", conditionTypeId: "Change Constraint",
    conditionStatement: "Payments API changes may not be deployed during the final three business days of a financial quarter",
    subjectId: "SVC-Payments", subjectName: "Payments API Deployment", operator: "prohibited during", value: "Final 3 business days of quarter", unit: "Window",
    baseline: null, target: null, timeWindow: "Quarter close", trigger: "Deployment request during quarter close",
    requiredAction: "Defer deployment or obtain Release Governance exception", effectiveDate: "2026-01-01",
    knowledgeDomains: ["Payments and Finance"], ownerTeamId: "TEAM-RG", ownerTeamName: "Release Governance",
    businessOwner: "P. Nandy", technicalOwner: "R. Feld", authorityLevel: "Primary", approvalState: "Approved",
    confidence: 95, freshnessStatus: "Current", applicableTeamIds: ["TEAM-PP", "TEAM-RG"], applicableSystemIds: ["SYS-Payments"],
    applicableServiceIds: ["SVC-Payments"], applicableProductIds: ["PRD-Checkout"], customerJourneyIds: ["CJ-Checkout"],
    dependencyIds: [], evidenceReferenceIds: ["EVR-7"], sourceArtifactIds: ["CAN-90121"], businessImpact: "High",
    evidenceCoverage: 94, downstreamUse: ["Release Approval Decision", "Decision Intelligence"],
  },
  {
    ...base, id: "COND-100428", conditionFamilyId: "fam-threshold", conditionTypeId: "Performance Threshold",
    conditionStatement: "Identity token validation shall complete within 150 milliseconds at P95",
    subjectId: "SVC-Identity", subjectName: "Identity Token Validation", operator: "<=", value: "150", unit: "Milliseconds",
    baseline: "162", target: "150", timeWindow: "P95 rolling hour", trigger: null, requiredAction: null,
    effectiveDate: "2026-03-11", knowledgeDomains: ["Identity and Security"], ownerTeamId: "TEAM-ID",
    ownerTeamName: "Identity Engineering", businessOwner: "K. Duarte", technicalOwner: "H. Berg",
    authorityLevel: "Unconfirmed", approvalState: "Conflict Review", confidence: 81, freshnessStatus: "Aging",
    applicableTeamIds: ["TEAM-ID"], applicableSystemIds: ["SYS-Identity"], applicableServiceIds: ["SVC-Identity"],
    applicableProductIds: ["PRD-Checkout"], customerJourneyIds: ["CJ-Login"], dependencyIds: ["DEP-1"],
    evidenceReferenceIds: ["EVR-8"], sourceArtifactIds: ["CAN-90188"], conflictingConditionIds: ["COND-100422"],
    businessImpact: "High", evidenceCoverage: 62, reviewStatus: "In Review", version: "0.9",
    downstreamUse: ["Impact Analysis"],
  },
  {
    ...base, id: "COND-100429", conditionFamilyId: "fam-escalation", conditionTypeId: "Escalation Trigger",
    conditionStatement: "Fraud decision requests exceeding 1.2 seconds shall trigger graceful checkout degradation",
    subjectId: "SVC-Fraud", subjectName: "Fraud Decision Service", operator: ">", value: "1.2", unit: "Seconds",
    baseline: "0.9", target: "1.2", escalationThreshold: "1.2s sustained 2 minutes", timeWindow: "Rolling 2 minutes",
    trigger: "Fraud decision latency above 1.2 seconds", requiredAction: "Enable graceful checkout degradation",
    effectiveDate: "2026-06-20", knowledgeDomains: ["Fraud and Checkout"], ownerTeamId: "TEAM-FR",
    ownerTeamName: "Fraud Engineering", businessOwner: "A. Moreau", technicalOwner: "J. Whitfield",
    authorityLevel: "Supporting", approvalState: "Pending Review", confidence: 88, freshnessStatus: "Current",
    applicableTeamIds: ["TEAM-FR", "TEAM-PP"], applicableSystemIds: ["SYS-Fraud"], applicableServiceIds: ["SVC-Fraud"],
    applicableProductIds: ["PRD-Checkout"], customerJourneyIds: ["CJ-Checkout"], dependencyIds: ["DEP-2"],
    evidenceReferenceIds: ["EVR-9"], sourceArtifactIds: ["CAN-90204"], businessImpact: "Medium", evidenceCoverage: 78,
    reviewStatus: "Queued", downstreamUse: ["Code Yellow Escalation Policy"],
  },
];

/* -------------------------------------------------------------- workbench */

export interface EvidenceSection {
  id: string;
  title: string;
  passages: { id: string; text: string; candidateId: string | null; page: number; paragraph: number }[];
}

export const workbenchArtifact = {
  artifactId: "ART-51204",
  canonicalArtifactId: "CAN-90121",
  evidenceId: "EVD-77120",
  title: "Payments API Reliability Requirements v3.2",
  source: "Confluence Cloud",
  version: "3.2",
  owner: "Payments Platform",
  authority: "Primary",
  accessClassification: "Internal",
  contentHash: "sha256:7f31c0a9…be42",
  sectionReference: "Sections 1–8, pages 1–14",
  sourceTimestamp: "2026-07-28 14:02 UTC",
};

export const evidenceSections: EvidenceSection[] = [
  { id: "sec-1", title: "Executive Summary", passages: [
    { id: "p-1", text: "The Payments API is the transaction authorization backbone for global checkout and must sustain enterprise reliability commitments.", candidateId: null, page: 1, paragraph: 1 },
  ] },
  { id: "sec-2", title: "Business Objective", passages: [
    { id: "p-2", text: "Protect checkout conversion by eliminating avoidable authorization failures across all regions.", candidateId: null, page: 1, paragraph: 3 },
  ] },
  { id: "sec-3", title: "Current State", passages: [
    { id: "p-3", text: "The current baseline error rate is 0.8 percent, with a target of less than 0.3 percent.", candidateId: "CAND-3", page: 3, paragraph: 2 },
  ] },
  { id: "sec-4", title: "Service Level Objectives", passages: [
    { id: "p-4", text: "The Payments API shall maintain 99.95 percent monthly availability.", candidateId: "CAND-1", page: 4, paragraph: 1 },
  ] },
  { id: "sec-5", title: "Performance Requirements", passages: [
    { id: "p-5", text: "P95 response latency must remain below 250 milliseconds during peak checkout periods.", candidateId: "CAND-2", page: 5, paragraph: 2 },
  ] },
  { id: "sec-6", title: "Dependencies", passages: [
    { id: "p-6", text: "The service depends on Identity Services, Fraud Decision Service, and the Regional Token Vault.", candidateId: "CAND-6", page: 8, paragraph: 1 },
  ] },
  { id: "sec-7", title: "Risk Conditions", passages: [
    { id: "p-7", text: "Changes may not be deployed during the final three business days of a financial quarter.", candidateId: "CAND-7", page: 11, paragraph: 4 },
  ] },
  { id: "sec-8", title: "Approval Requirements", passages: [
    { id: "p-8", text: "Any retry policy change affecting more than 10 percent of checkout traffic requires approval from Payments Reliability and Fraud Engineering.", candidateId: "CAND-5", page: 12, paragraph: 2 },
  ] },
];

const cbase = {
  extractionJobId: "BCE-40452", canonicalArtifactId: "CAN-90121", dependencyCandidates: [] as string[],
  riskCandidates: [] as string[], createdAt: "09:44", updatedAt: "09:52",
};

export const candidates: ConditionCandidate[] = [
  { ...cbase, id: "CAND-1", conditionTypeId: "Service Level Objective", candidateStatement: "Payments API monthly availability shall be at least 99.95 percent", subjectCandidate: "Payments API", operatorCandidate: ">=", valueCandidate: "99.95", unitCandidate: "Percent Monthly Availability", ownerCandidate: "Payments Reliability", evidenceReferenceIds: ["EVR-1"], classificationConfidence: 99, valueConfidence: 99, ownerConfidence: 96, authorityConfidence: 98, overallConfidence: 98, candidateStatus: "Suggested" },
  { ...cbase, id: "CAND-2", conditionTypeId: "Performance Threshold", candidateStatement: "Payments API P95 latency shall remain below 250 milliseconds", subjectCandidate: "Payments API P95 Latency", operatorCandidate: "<", valueCandidate: "250", unitCandidate: "Milliseconds", ownerCandidate: "Payments Platform", context: "Peak Checkout Periods", evidenceReferenceIds: ["EVR-2"], classificationConfidence: 98, valueConfidence: 98, ownerConfidence: 94, authorityConfidence: 96, overallConfidence: 97, candidateStatus: "Suggested" },
  { ...cbase, id: "CAND-3", conditionTypeId: "Baseline", candidateStatement: "Payments API error rate baseline is 0.8 percent", subjectCandidate: "Payments API Error Rate", operatorCandidate: "=", valueCandidate: "0.8", unitCandidate: "Percent", ownerCandidate: "Site Reliability Engineering", evidenceReferenceIds: ["EVR-3"], classificationConfidence: 96, valueConfidence: 97, ownerConfidence: 91, authorityConfidence: 93, overallConfidence: 96, candidateStatus: "Suggested" },
  { ...cbase, id: "CAND-4", conditionTypeId: "Target", candidateStatement: "Payments API error rate target is less than 0.3 percent", subjectCandidate: "Payments API Error Rate", operatorCandidate: "<", valueCandidate: "0.3", unitCandidate: "Percent", ownerCandidate: "Payments Platform", evidenceReferenceIds: ["EVR-4"], classificationConfidence: 96, valueConfidence: 96, ownerConfidence: 92, authorityConfidence: 94, overallConfidence: 96, candidateStatus: "Suggested" },
  { ...cbase, id: "CAND-5", conditionTypeId: "Approval Requirement", candidateStatement: "Retry policy change above 10 percent of checkout traffic requires dual approval", subjectCandidate: "Payments API Retry Policy", operatorCandidate: "requires", valueCandidate: "Payments Reliability and Fraud Engineering", unitCandidate: "Approval", ownerCandidate: "Payments Platform", context: "Trigger: retry policy change affecting more than 10 percent of checkout traffic", evidenceReferenceIds: ["EVR-5"], classificationConfidence: 94, valueConfidence: 92, ownerConfidence: 88, authorityConfidence: 90, overallConfidence: 94, candidateStatus: "Review Required" },
  { ...cbase, id: "CAND-6", conditionTypeId: "Dependency", candidateStatement: "Payments API depends on Identity Services, Fraud Decision Service, Regional Token Vault", subjectCandidate: "Payments API", operatorCandidate: "depends on", valueCandidate: "Identity Services; Fraud Decision Service; Regional Token Vault", unitCandidate: "Services", ownerCandidate: "Payments Platform", dependencyCandidates: ["Identity Services", "Fraud Decision Service", "Regional Token Vault"], evidenceReferenceIds: ["EVR-6"], classificationConfidence: 97, valueConfidence: 97, ownerConfidence: 95, authorityConfidence: 96, overallConfidence: 97, candidateStatus: "Suggested" },
  { ...cbase, id: "CAND-7", conditionTypeId: "Change Constraint", candidateStatement: "No Payments API deployment during final three business days of a financial quarter", subjectCandidate: "Payments API Deployment", operatorCandidate: "prohibited during", valueCandidate: "Final three business days of a financial quarter", unitCandidate: "Window", ownerCandidate: "Release Governance", evidenceReferenceIds: ["EVR-7"], classificationConfidence: 95, valueConfidence: 94, ownerConfidence: 86, authorityConfidence: 92, overallConfidence: 95, candidateStatus: "Suggested" },
];

export const evidenceReferences: ConditionEvidenceReference[] = evidenceSections
  .flatMap((s) => s.passages.filter((p) => p.candidateId).map((p, i) => ({ s, p, i })))
  .map(({ s, p }, idx) => ({
    id: `EVR-${idx + 1}`,
    conditionId: null,
    candidateId: p.candidateId,
    artifactId: workbenchArtifact.artifactId,
    canonicalArtifactId: workbenchArtifact.canonicalArtifactId,
    evidenceId: workbenchArtifact.evidenceId,
    sourceId: "SRC-2001",
    sectionId: s.id,
    chunkId: `CHK-${1200 + idx}`,
    pageNumber: p.page,
    paragraphNumber: p.paragraph,
    passageText: p.text,
    contentHash: workbenchArtifact.contentHash,
    sourceAuthority: "Primary",
    evidenceConfidence: 96,
    accessClassification: "Internal",
    sourceTimestamp: workbenchArtifact.sourceTimestamp,
    capturedAt: "2026-08-06 09:44 UTC",
  }));

export const canonicalContext = {
  metadata: [
    ["Canonical ID", "CAN-90121"], ["Artifact Type", "Requirements Specification"], ["Schema", "canonical.doc.v4"],
    ["Language", "en-US"], ["Sections", "8"], ["Tables", "3"], ["Chunks", "42"], ["Normalized", "2026-08-05 22:18 UTC"],
  ] as [string, string][],
  sections: ["Executive Summary", "Business Objective", "Current State", "Service Level Objectives", "Performance Requirements", "Dependencies", "Risk Conditions", "Approval Requirements"],
  tables: ["SLO Summary", "Dependency Matrix", "Quarter Freeze Calendar"],
  entities: [
    { name: "Payments API", type: "Service", confidence: 99 },
    { name: "Identity Services", type: "Service", confidence: 97 },
    { name: "Fraud Decision Service", type: "Service", confidence: 96 },
    { name: "Regional Token Vault", type: "System", confidence: 95 },
    { name: "Payments Reliability", type: "Team", confidence: 98 },
    { name: "Checkout", type: "Customer Journey", confidence: 94 },
  ],
  relationships: [
    "Payments API DEPENDS ON Identity Services",
    "Payments API DEPENDS ON Fraud Decision Service",
    "Payments API OWNED BY Payments Platform",
    "Payments API SUPPORTS Checkout Customer Journey",
  ],
  chunks: [
    { id: "CHK-1204", section: "Service Level Objectives", tokens: 184 },
    { id: "CHK-1205", section: "Performance Requirements", tokens: 162 },
    { id: "CHK-1208", section: "Dependencies", tokens: 142 },
    { id: "CHK-1211", section: "Approval Requirements", tokens: 158 },
  ],
  permissions: "Internal — Payments org, Reliability guild, Governance readers",
  provenance: "Source → Evidence Vault (immutable) → Canonical v4 → Extraction job BCE-40452",
};

/* --------------------------------------------------------------- taxonomy */

export const taxonomy = [
  { id: "objectives", family: "Business Objectives", count: 6_842, approvedPercent: 94, confidence: 93, evidenceCoverage: 96, conflicts: 12, reviews: 34, status: "Healthy" },
  { id: "requirements", family: "Requirements", count: 18_426, approvedPercent: 93, confidence: 94, evidenceCoverage: 97, conflicts: 26, reviews: 88, status: "Healthy" },
  { id: "constraints", family: "Constraints", count: 9_784, approvedPercent: 91, confidence: 92, evidenceCoverage: 95, conflicts: 18, reviews: 44, status: "Healthy" },
  { id: "policies", family: "Policies", count: 4_182, approvedPercent: 96, confidence: 95, evidenceCoverage: 98, conflicts: 6, reviews: 12, status: "Healthy" },
  { id: "baselines", family: "Baselines", count: 5_612, approvedPercent: 89, confidence: 90, evidenceCoverage: 92, conflicts: 14, reviews: 38, status: "Near Target" },
  { id: "targets", family: "Targets", count: 6_028, approvedPercent: 92, confidence: 93, evidenceCoverage: 94, conflicts: 11, reviews: 26, status: "Healthy" },
  { id: "thresholds", family: "Thresholds", count: 7_442, approvedPercent: 88, confidence: 91, evidenceCoverage: 93, conflicts: 22, reviews: 52, status: "Near Target" },
  { id: "slo", family: "Service Level Objectives", count: 3_864, approvedPercent: 96, confidence: 97, evidenceCoverage: 99, conflicts: 4, reviews: 9, status: "Healthy" },
  { id: "kpi", family: "Key Performance Indicators", count: 4_226, approvedPercent: 93, confidence: 94, evidenceCoverage: 95, conflicts: 7, reviews: 18, status: "Healthy" },
  { id: "decision", family: "Decision Rules", count: 5_914, approvedPercent: 87, confidence: 89, evidenceCoverage: 90, conflicts: 19, reviews: 46, status: "Near Target" },
  { id: "assumptions", family: "Assumptions", count: 4_782, approvedPercent: 78, confidence: 82, evidenceCoverage: 74, conflicts: 9, reviews: 62, status: "Below Target" },
  { id: "dependencies", family: "Dependencies", count: 8_612, approvedPercent: 94, confidence: 95, evidenceCoverage: 97, conflicts: 16, reviews: 28, status: "Healthy" },
  { id: "risks", family: "Risks", count: 5_448, approvedPercent: 85, confidence: 87, evidenceCoverage: 88, conflicts: 13, reviews: 41, status: "Near Target" },
  { id: "controls", family: "Controls", count: 2_926, approvedPercent: 97, confidence: 96, evidenceCoverage: 99, conflicts: 3, reviews: 7, status: "Healthy" },
  { id: "approval", family: "Approval Requirements", count: 2_284, approvedPercent: 90, confidence: 92, evidenceCoverage: 94, conflicts: 8, reviews: 22, status: "Healthy" },
  { id: "cost", family: "Cost Guardrails", count: 1_486, approvedPercent: 88, confidence: 90, evidenceCoverage: 91, conflicts: 5, reviews: 14, status: "Near Target" },
  { id: "windows", family: "Operational Windows", count: 1_228, approvedPercent: 95, confidence: 94, evidenceCoverage: 96, conflicts: 2, reviews: 6, status: "Healthy" },
  { id: "change", family: "Change Restrictions", count: 1_164, approvedPercent: 96, confidence: 95, evidenceCoverage: 97, conflicts: 2, reviews: 5, status: "Healthy" },
  { id: "compliance", family: "Compliance Obligations", count: 1_872, approvedPercent: 98, confidence: 97, evidenceCoverage: 99, conflicts: 1, reviews: 4, status: "Healthy" },
  { id: "commitments", family: "Customer Commitments", count: 1_346, approvedPercent: 92, confidence: 93, evidenceCoverage: 95, conflicts: 4, reviews: 11, status: "Healthy" },
  { id: "failure", family: "Failure Conditions", count: 1_742, approvedPercent: 86, confidence: 88, evidenceCoverage: 89, conflicts: 6, reviews: 19, status: "Near Target" },
  { id: "escalation", family: "Escalation Triggers", count: 1_036, approvedPercent: 89, confidence: 90, evidenceCoverage: 92, conflicts: 5, reviews: 13, status: "Healthy" },
];

/* --------------------------------------------- baseline/target/threshold */

export interface MetricModel {
  id: string;
  name: string;
  baseline: string;
  basis: string;
  target: string;
  effectiveBy: string;
  warning: string;
  critical: string;
  escalation: string;
  owner: string;
  evidence: string;
  systems: string[];
  personas: string[];
  decisions: string[];
  series: number[];
  unit: string;
}

export const metricModels: MetricModel[] = [
  { id: "error-rate", name: "Payments API Error Rate", baseline: "0.8 percent", basis: "Last 30 day production average", target: "Less than 0.3 percent", effectiveBy: "End of Q3", warning: "0.5 percent", critical: "0.8 percent", escalation: "1.0 percent for five minutes", owner: "Payments Reliability", evidence: "Four approved artifacts and one telemetry source", systems: ["Payments API", "Checkout"], personas: ["Payments Reliability Persona"], decisions: ["Release Approval Decision"], series: [0.94, 0.91, 0.88, 0.86, 0.83, 0.81, 0.8], unit: "%" },
  { id: "p95", name: "P95 Latency", baseline: "228 ms", basis: "Peak checkout window, 14 day average", target: "Below 250 ms", effectiveBy: "In effect", warning: "220 ms", critical: "250 ms", escalation: "280 ms for three minutes", owner: "Payments Platform", evidence: "Three approved artifacts and one telemetry source", systems: ["Payments API"], personas: ["Checkout Engineering Persona"], decisions: ["Capacity Decision"], series: [246, 241, 238, 234, 231, 229, 228], unit: "ms" },
  { id: "availability", name: "Monthly Availability", baseline: "99.91 percent", basis: "Trailing three months", target: "At least 99.95 percent", effectiveBy: "In effect", warning: "99.94 percent", critical: "99.90 percent", escalation: "99.85 percent in month", owner: "Payments Reliability", evidence: "Five approved artifacts", systems: ["Payments API", "Identity Services"], personas: ["Payments Reliability Persona"], decisions: ["Code Yellow Escalation"], series: [99.88, 99.89, 99.9, 99.9, 99.91, 99.92, 99.91], unit: "%" },
  { id: "checkout", name: "Checkout Success Rate", baseline: "97.4 percent", basis: "Last 30 days, all regions", target: "At least 98.5 percent", effectiveBy: "End of Q4", warning: "97.8 percent", critical: "97.0 percent", escalation: "96.5 percent for ten minutes", owner: "Checkout Engineering", evidence: "Three approved artifacts and two telemetry sources", systems: ["Checkout"], personas: ["Checkout Engineering Persona"], decisions: ["Conversion Investment Decision"], series: [96.8, 97.0, 97.1, 97.2, 97.3, 97.4, 97.4], unit: "%" },
  { id: "fraud", name: "Fraud Decision Time", baseline: "0.9 seconds", basis: "Rolling 7 day P95", target: "Below 0.8 seconds", effectiveBy: "End of Q3", warning: "1.0 seconds", critical: "1.2 seconds", escalation: "1.2 seconds sustained two minutes", owner: "Fraud Engineering", evidence: "Two approved artifacts and one telemetry source", systems: ["Fraud Decision Service"], personas: ["Fraud Operations Persona"], decisions: ["Degradation Decision"], series: [1.05, 1.0, 0.98, 0.95, 0.93, 0.91, 0.9], unit: "s" },
  { id: "support", name: "Support Contact Rate", baseline: "3.1 per 1000 orders", basis: "Last 30 days", target: "Below 2.4 per 1000 orders", effectiveBy: "End of Q4", warning: "3.4", critical: "4.0", escalation: "4.5 for one day", owner: "Support Operations", evidence: "Two approved artifacts", systems: ["Support Desk"], personas: ["Support Operations Persona"], decisions: ["Staffing Decision"], series: [3.6, 3.5, 3.4, 3.3, 3.2, 3.1, 3.1], unit: "/1k" },
  { id: "cost", name: "Cost per Transaction", baseline: "$0.0182", basis: "Last quarter blended", target: "Below $0.0150", effectiveBy: "End of FY", warning: "$0.0190", critical: "$0.0210", escalation: "$0.0230 monthly", owner: "Payments Finance", evidence: "Three approved artifacts", systems: ["Payments API"], personas: ["Payments Finance Persona"], decisions: ["Vendor Renewal Decision"], series: [0.0201, 0.0196, 0.0193, 0.019, 0.0186, 0.0184, 0.0182], unit: "$" },
];

/* ------------------------------------------------------- authority model */

export const authorityDistribution = [
  { level: "Primary", count: 48_212, approvalRate: 97 },
  { level: "Supporting", count: 21_486, approvalRate: 92 },
  { level: "Historical", count: 9_842, approvalRate: 74 },
  { level: "Reference", count: 6_184, approvalRate: 81 },
  { level: "Unconfirmed", count: 9_088, approvalRate: 41 },
];

export const authorityEvidence = {
  primarySource: "Payments API Reliability Requirements v3.2 — Confluence Cloud",
  supportingSources: ["Payments SLO Review — Q2 2026", "Reliability Guild Charter v2"],
  historicalSources: ["Payments Availability Standard v2.4 (2024)"],
  contradictorySources: ["Identity Latency Addendum v1.1"],
  passages: 6,
  evidenceCount: 9,
  evidenceDiversity: "3 platforms, 4 owners",
  evidenceFreshness: "Newest 9 days, oldest 21 months",
  evidenceAgreement: 92,
  authorityConfidence: 96,
};

/* ------------------------------------------------------------ quality */

export const qualityDimensions: ConditionQualityMetric[] = [
  { id: "detection", name: "Condition Detection", currentValue: 95, targetValue: 96, variance: -1, trend: "up", status: "Near Target", affectedConditionCount: 1_842, definition: "Share of business conditions correctly detected in qualified evidence.", topFailureCauses: ["Narrative phrasing", "Table-only conditions"] },
  { id: "classification", name: "Condition Classification", currentValue: 94, targetValue: 95, variance: -1, trend: "flat", status: "Near Target", affectedConditionCount: 2_104, definition: "Accuracy of condition family and type assignment.", topFailureCauses: ["Baseline vs target ambiguity", "Policy vs control overlap"] },
  { id: "values", name: "Value and Unit Normalization", currentValue: 91, targetValue: 95, variance: -4, trend: "down", status: "Below Target", affectedConditionCount: 3_688, definition: "Correct normalization of numbers, ranges, units, and time windows.", topFailureCauses: ["Legacy PDF units", "Mixed percent/basis-point notation"] },
  { id: "owners", name: "Owner Resolution", currentValue: 89, targetValue: 95, variance: -6, trend: "down", status: "Below Target", affectedConditionCount: 4_212, definition: "Resolution of owning team and accountable individuals.", topFailureCauses: ["Reorganized teams", "Missing directory mapping"] },
  { id: "dependencies", name: "Dependency Resolution", currentValue: 92, targetValue: 95, variance: -3, trend: "up", status: "Near Target", affectedConditionCount: 2_486, definition: "Resolution of dependency targets to canonical entities.", topFailureCauses: ["Alias drift", "Deprecated services"] },
  { id: "authority", name: "Authority Scoring", currentValue: 93, targetValue: 95, variance: -2, trend: "flat", status: "Near Target", affectedConditionCount: 1_984, definition: "Correct ranking of source authority for competing statements.", topFailureCauses: ["Undated documents"] },
  { id: "evidence", name: "Evidence Linkage", currentValue: 98, targetValue: 98, variance: 0, trend: "flat", status: "Healthy", affectedConditionCount: 402, definition: "Every condition retains exact passage-level evidence.", topFailureCauses: ["Transcript offsets"] },
  { id: "conflicts", name: "Conflict Detection", currentValue: 90, targetValue: 94, variance: -4, trend: "down", status: "Below Target", affectedConditionCount: 3_012, definition: "Detection of contradictory or overlapping conditions.", topFailureCauses: ["Different units", "Non-overlapping effective dates"] },
  { id: "completeness", name: "Structured Field Completeness", currentValue: 92, targetValue: 95, variance: -3, trend: "up", status: "Near Target", affectedConditionCount: 2_764, definition: "Required structured fields populated before approval.", topFailureCauses: ["Missing effective dates", "Missing owners"] },
  { id: "agreement", name: "Human Review Agreement", currentValue: 94, targetValue: 95, variance: -1, trend: "up", status: "Near Target", affectedConditionCount: 612, definition: "Agreement between automated output and reviewer decision.", topFailureCauses: ["Assumption classification"] },
];

/* ----------------------------------------------------------- readiness */

export const readiness: ConditionReadiness = {
  approvedAndReady: 87_442,
  awaitingHumanReview: 427,
  activeConflicts: 148,
  missingOwners: 92,
  missingEvidence: 61,
  lowConfidence: 74,
  staleConditions: 47,
  readyForPersonaConstruction: 82_906,
  readyForCognitiveMemory: 87_442,
  readyForContextGraph: 85_214,
  readyForImpactAnalysis: 79_842,
};

export const publishingDestinations = [
  { id: "registry", name: "Conditions Registry", ready: 87_442, pending: 2_184, blocked: 148, lastPublished: "09:58", status: "Healthy" },
  { id: "graph", name: "Context Graph", ready: 85_214, pending: 2_412, blocked: 148, lastPublished: "09:54", status: "Healthy" },
  { id: "memory", name: "Enterprise Cognitive Memory", ready: 87_442, pending: 1_986, blocked: 92, lastPublished: "09:56", status: "Healthy" },
  { id: "persona", name: "Team Persona Builder", ready: 82_906, pending: 3_642, blocked: 427, lastPublished: "09:31", status: "Degraded" },
  { id: "impact", name: "Impact Analysis", ready: 79_842, pending: 4_128, blocked: 427, lastPublished: "09:28", status: "Degraded" },
  { id: "decision", name: "Decision Intelligence", ready: 78_204, pending: 3_884, blocked: 214, lastPublished: "09:22", status: "Healthy" },
  { id: "search", name: "Cognitive Search", ready: 87_442, pending: 1_204, blocked: 0, lastPublished: "10:01", status: "Healthy" },
  { id: "mcp", name: "MCP Context Services", ready: 86_118, pending: 1_486, blocked: 61, lastPublished: "09:49", status: "Healthy" },
];

/* ----------------------------------------------------- stage queues etc. */

export const stageQueue = [
  { id: "CAND-88121", statement: "Checkout retry budget shall not exceed 3 attempts per authorization", type: "Constraint", source: "Confluence Cloud", domain: "Payments and Checkout", authority: "Primary", confidence: 93, age: "12m", status: "Queued" },
  { id: "CAND-88122", statement: "Identity token validation shall complete within 150 ms at P95", type: "Performance Threshold", source: "Apigee", domain: "Identity and Security", authority: "Unconfirmed", confidence: 81, age: "26m", status: "Conflict" },
  { id: "CAND-88123", statement: "Fraud decision latency above 1.2 s triggers graceful degradation", type: "Escalation Trigger", source: "Datadog", domain: "Fraud and Checkout", authority: "Supporting", confidence: 88, age: "31m", status: "Review Required" },
  { id: "CAND-88124", statement: "Regional token vault failover must complete within 60 seconds", type: "Requirement", source: "GitHub Enterprise", domain: "Identity and Security", authority: "Primary", confidence: 95, age: "8m", status: "Queued" },
  { id: "CAND-88125", statement: "Support contact rate target below 2.4 per 1000 orders", type: "Target", source: "Jira", domain: "Customer Support and Operations", authority: "Supporting", confidence: 86, age: "44m", status: "Incomplete" },
];

export const conflicts: ConditionConflict[] = [
  { id: "CFL-3301", conditionAId: "COND-100422", conditionBId: "COND-100428", conflictType: "Threshold contradiction", severity: "High", businessImpact: "Checkout latency budget cannot be met if identity validation consumes 150 ms", technicalImpact: "Latency budget over-allocation across two services", affectedTeamIds: ["TEAM-PP", "TEAM-ID"], affectedPersonaIds: ["PER-Payments"], affectedEvaluationIds: ["EVAL-221"], valueA: "250 ms total P95", valueB: "150 ms identity P95", authorityA: "Primary", authorityB: "Unconfirmed", effectiveDate: "2026-07-01 vs 2026-03-11", recommendedResolution: "Prefer Primary authority; request identity budget restatement", reviewStatus: "Open", createdAt: "09:47", resolvedAt: null },
  { id: "CFL-3302", conditionAId: "COND-100424", conditionBId: "COND-100423", conflictType: "Baseline/target overlap", severity: "Medium", businessImpact: "Target and baseline reported in different windows", technicalImpact: "Trend comparison ambiguity", affectedTeamIds: ["TEAM-SRE"], affectedPersonaIds: ["PER-SRE"], affectedEvaluationIds: [], valueA: "< 0.3 percent by Q3", valueB: "0.8 percent 30 day average", authorityA: "Primary", authorityB: "Supporting", effectiveDate: "2026-07-01 vs 2026-06-01", recommendedResolution: "Annotate baseline window; no supersession", reviewStatus: "Open", createdAt: "09:49", resolvedAt: null },
  { id: "CFL-3303", conditionAId: "COND-100427", conditionBId: "COND-100425", conflictType: "Approval scope overlap", severity: "Low", businessImpact: "Quarter freeze and retry approval may both gate the same change", technicalImpact: "Duplicate gates in release pipeline", affectedTeamIds: ["TEAM-RG", "TEAM-PP"], affectedPersonaIds: [], affectedEvaluationIds: [], valueA: "Freeze window", valueB: "Dual approval", authorityA: "Primary", authorityB: "Primary", effectiveDate: "2026-01-01 vs 2026-05-15", recommendedResolution: "Retain both; sequence gates", reviewStatus: "Acknowledged", createdAt: "09:51", resolvedAt: null },
];

export const gaps: ConditionGap[] = [
  { id: "GAP-7701", candidateId: "CAND-5", conditionId: "COND-100425", candidateStatement: "Retry policy change requires dual approval", missingField: "Effective date", source: "Confluence Cloud", requiredForApproval: true, severity: "High", confidence: 94, recommendedAction: "Confirm effective date with Release Governance", status: "Open", owner: "Payments Platform", createdAt: "09:52", resolvedAt: null },
  { id: "GAP-7702", candidateId: "CAND-7", conditionId: "COND-100427", candidateStatement: "Quarter close deployment restriction", missingField: "Expiration date", source: "Confluence Cloud", requiredForApproval: false, severity: "Low", confidence: 95, recommendedAction: "Mark as evergreen policy", status: "Open", owner: "Release Governance", createdAt: "09:53", resolvedAt: null },
  { id: "GAP-7703", candidateId: "CAND-88125", conditionId: null, candidateStatement: "Support contact rate target", missingField: "Owner team", source: "Jira", requiredForApproval: true, severity: "High", confidence: 86, recommendedAction: "Resolve owner from directory mapping", status: "Open", owner: "Unassigned", createdAt: "09:41", resolvedAt: null },
  { id: "GAP-7704", candidateId: "CAND-88122", conditionId: "COND-100428", candidateStatement: "Identity token validation threshold", missingField: "Evidence reference", source: "Apigee", requiredForApproval: true, severity: "Medium", confidence: 81, recommendedAction: "Attach primary specification passage", status: "Open", owner: "Identity Engineering", createdAt: "09:38", resolvedAt: null },
];

export const stageOutputs = {
  "Conflict Records": 148,
  "Gap Records": 214,
  "Authority Rankings": 1_842,
  "Review Tasks": 427,
  "Condition Families": 22,
  "Supersession Candidates": 62,
};

export const stageConfiguration: [string, string][] = [
  ["Conflict similarity threshold", "0.86"],
  ["Value variance threshold", "5 percent"],
  ["Effective date overlap threshold", "30 days"],
  ["Authority weighting", "Primary 1.0 / Supporting 0.7 / Historical 0.4"],
  ["Freshness weighting", "0.25"],
  ["Human review threshold", "Confidence below 90"],
  ["Auto resolution rules", "Primary over Unconfirmed when evidence agreement > 90"],
];

/* --------------------------------------------------------------- graph */

export const graphNodes = [
  { id: "payments-api", label: "Payments API", type: "Service", x: 50, y: 46 },
  { id: "payments-platform", label: "Payments Platform", type: "Team", x: 20, y: 20 },
  { id: "sre", label: "Site Reliability Engineering", type: "Team", x: 80, y: 18 },
  { id: "identity", label: "Identity Services", type: "Service", x: 14, y: 62 },
  { id: "fraud", label: "Fraud Decision Service", type: "Service", x: 33, y: 84 },
  { id: "vault", label: "Regional Token Vault", type: "System", x: 62, y: 86 },
  { id: "checkout", label: "Checkout Customer Journey", type: "Journey", x: 86, y: 62 },
  { id: "persona-pr", label: "Payments Reliability Persona", type: "Persona", x: 88, y: 38 },
  { id: "persona-ce", label: "Checkout Engineering Persona", type: "Persona", x: 68, y: 16 },
  { id: "kpi", label: "Availability KPI", type: "Metric", x: 47, y: 14 },
  { id: "code-yellow", label: "Code Yellow Escalation Policy", type: "Policy", x: 12, y: 40 },
  { id: "release", label: "Release Approval Decision", type: "Decision", x: 82, y: 84 },
];

export const graphEdges = [
  { from: "payments-api", to: "payments-platform", label: "OWNED BY" },
  { from: "payments-api", to: "identity", label: "DEPENDS ON" },
  { from: "payments-api", to: "fraud", label: "DEPENDS ON" },
  { from: "payments-api", to: "vault", label: "DEPENDS ON" },
  { from: "payments-api", to: "checkout", label: "SUPPORTS" },
  { from: "payments-api", to: "kpi", label: "MEASURED BY" },
  { from: "payments-api", to: "persona-pr", label: "APPLIES TO" },
  { from: "payments-api", to: "persona-ce", label: "APPLIES TO" },
  { from: "payments-api", to: "sre", label: "INFORMS" },
  { from: "payments-api", to: "code-yellow", label: "TRIGGERS" },
  { from: "payments-api", to: "release", label: "APPROVED BY" },
];

export const relationshipTypes = ["OWNED BY", "DEPENDS ON", "SUPPORTS", "MEASURED BY", "APPLIES TO", "INFORMS", "TRIGGERS", "APPROVED BY"];

/* ------------------------------------------------------------- filters */

export type Filters = Record<string, string>;

export const filterOptions: Record<string, string[]> = {
  businessUnit: ["All", "Global Commerce", "Enterprise Platform", "Customer Operations"],
  team: ["All", "Payments Platform", "Payments Reliability", "Identity Engineering", "Fraud Engineering", "Release Governance", "Site Reliability Engineering"],
  knowledgeDomain: ["All", "Payments and Reliability", "Payments and Checkout", "Payments and Fraud", "Payments and Identity", "Payments and Finance", "Identity and Security", "Fraud and Checkout"],
  sourceCategory: ["All", "Documentation", "Work Management", "Communication", "Code", "Telemetry", "API Management"],
  sourcePlatform: ["All", "Confluence Cloud", "Jira", "Slack Enterprise", "Zoom Transcripts", "GitHub Enterprise", "Datadog", "Apigee"],
  artifactType: ["All", "Requirements Specification", "Runbook", "Design Document", "Transcript", "Ticket", "Telemetry Definition"],
  conditionType: ["All", "Service Level Objective", "Performance Threshold", "Baseline", "Target", "Approval Requirement", "Dependency", "Change Constraint", "Escalation Trigger"],
  conditionStatus: ["All", "Draft", "Candidate", "Published"],
  authorityLevel: ["All", "Primary", "Supporting", "Historical", "Reference", "Unconfirmed"],
  approvalState: ["All", "Approved", "Pending Review", "Review Required", "Conflict Review", "Draft"],
  confidenceBand: ["All", "95 and above", "90 to 95", "80 to 90", "Below 80"],
  evidenceCoverage: ["All", "Complete", "Partial", "Missing"],
  owner: ["All", "D. Okafor", "L. Chen", "K. Duarte", "A. Moreau", "P. Nandy"],
  technicalOwner: ["All", "M. Alvarez", "S. Rao", "H. Berg", "J. Whitfield", "R. Feld"],
  affectedSystem: ["All", "SYS-Payments", "SYS-Identity", "SYS-Fraud"],
  affectedService: ["All", "SVC-Payments", "SVC-Identity", "SVC-Fraud", "SVC-TokenVault"],
  affectedProduct: ["All", "PRD-Checkout"],
  customerJourney: ["All", "CJ-Checkout", "CJ-Login"],
  dependencyType: ["All", "Upstream", "Downstream", "Service", "Team", "Data", "Event"],
  riskLevel: ["All", "Critical", "High", "Medium", "Low"],
  accessClassification: ["All", "Public", "Internal", "Confidential", "Restricted"],
  effectiveStatus: ["All", "Effective", "Scheduled", "Expired"],
  freshness: ["All", "Current", "Aging", "Stale"],
  conflictStatus: ["All", "None", "Conflict"],
  reviewStatus: ["All", "None", "Queued", "In Review", "Complete"],
  environment: ["All", "Production", "Staging"],
  region: ["All", "NA", "EMEA", "APAC"],
  dataResidency: ["All", "US", "EU", "IN"],
  timeRange: ["Last 15 minutes", "Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days", "Last 90 days", "Custom range"],
};

export const filterLabels: Record<string, string> = {
  businessUnit: "Business Unit", team: "Team", knowledgeDomain: "Knowledge Domain", sourceCategory: "Source Category",
  sourcePlatform: "Source Platform", artifactType: "Artifact Type", conditionType: "Condition Type",
  conditionStatus: "Condition Status", authorityLevel: "Authority Level", approvalState: "Approval State",
  confidenceBand: "Confidence Band", evidenceCoverage: "Evidence Coverage", owner: "Owner",
  technicalOwner: "Technical Owner", affectedSystem: "Affected System", affectedService: "Affected Service",
  affectedProduct: "Affected Product", customerJourney: "Customer Journey", dependencyType: "Dependency Type",
  riskLevel: "Risk Level", accessClassification: "Access Classification", effectiveStatus: "Effective Status",
  freshness: "Freshness", conflictStatus: "Conflict Status", reviewStatus: "Review Status",
  environment: "Environment", region: "Region", dataResidency: "Data Residency", timeRange: "Time Range",
};

export const defaultFilters: Filters = Object.fromEntries(
  Object.keys(filterOptions).map((k) => [k, k === "timeRange" ? "Last 24 hours" : "All"]),
);

export const activeFilterCount = (f: Filters) =>
  Object.entries(f).filter(([k, v]) => (k === "timeRange" ? v !== "Last 24 hours" : v !== "All")).length;

/* -------------------------------------------------------------- resolvers */

export function resolveJobs(filters: Filters, overrides: Record<string, Partial<ExtractionJob>> = {}, extra: ExtractionJob[] = []): ExtractionJob[] {
  return [...extra, ...jobSeed]
    .map((j) => ({ ...j, ...overrides[j.id] }))
    .filter((j) => filters.sourcePlatform === "All" || j.source === filters.sourcePlatform)
    .filter((j) => filters.knowledgeDomain === "All" || j.knowledgeDomain === filters.knowledgeDomain);
}

export function resolveConditions(filters: Filters, overrides: Record<string, Partial<BusinessCondition>> = {}): BusinessCondition[] {
  const band = (c: number) =>
    c >= 95 ? "95 and above" : c >= 90 ? "90 to 95" : c >= 80 ? "80 to 90" : "Below 80";
  return conditions
    .map((c) => ({ ...c, ...overrides[c.id] }))
    .filter((c) => filters.conditionType === "All" || c.conditionTypeId === filters.conditionType)
    .filter((c) => filters.knowledgeDomain === "All" || c.knowledgeDomains.includes(filters.knowledgeDomain))
    .filter((c) => filters.team === "All" || c.ownerTeamName === filters.team)
    .filter((c) => filters.authorityLevel === "All" || c.authorityLevel === filters.authorityLevel)
    .filter((c) => filters.approvalState === "All" || c.approvalState === filters.approvalState)
    .filter((c) => filters.confidenceBand === "All" || band(c.confidence) === filters.confidenceBand)
    .filter((c) => filters.freshness === "All" || c.freshnessStatus === filters.freshness)
    .filter((c) => filters.accessClassification === "All" || c.accessClassification === filters.accessClassification)
    .filter((c) => filters.conflictStatus === "All"
      || (filters.conflictStatus === "Conflict" ? c.conflictingConditionIds.length > 0 : c.conflictingConditionIds.length === 0))
    .filter((c) => filters.reviewStatus === "All" || c.reviewStatus === filters.reviewStatus)
    .filter((c) => filters.owner === "All" || c.businessOwner === filters.owner)
    .filter((c) => filters.technicalOwner === "All" || c.technicalOwner === filters.technicalOwner);
}

export const dependencies: ConditionDependency[] = [
  { id: "DEP-1", conditionId: "COND-100421", dependencyType: "Service", targetType: "Service", targetId: "SVC-Identity", targetName: "Identity Services", relationshipType: "DEPENDS ON", confidence: 97, evidenceReferenceIds: ["EVR-6"], status: "Resolved" },
  { id: "DEP-2", conditionId: "COND-100421", dependencyType: "Service", targetType: "Service", targetId: "SVC-Fraud", targetName: "Fraud Decision Service", relationshipType: "DEPENDS ON", confidence: 96, evidenceReferenceIds: ["EVR-6"], status: "Resolved" },
  { id: "DEP-3", conditionId: "COND-100421", dependencyType: "Service", targetType: "System", targetId: "SYS-TokenVault", targetName: "Regional Token Vault", relationshipType: "DEPENDS ON", confidence: 95, evidenceReferenceIds: ["EVR-6"], status: "Resolved" },
];

export const conditionTypeDistribution = [
  { type: "Requirements", count: 18_426, approvalRate: 93, confidence: 94, conflictRate: 1.4, reviewVolume: 88, approved: 17_136, pending: 1_290, evidenceCoverage: 97, conflicts: 26, domain: "Product and Engineering", owner: "Product Operations" },
  { type: "Constraints", count: 9_784, approvalRate: 91, confidence: 92, conflictRate: 1.8, reviewVolume: 44, approved: 8_903, pending: 881, evidenceCoverage: 95, conflicts: 18, domain: "Engineering", owner: "Architecture Guild" },
  { type: "Dependencies", count: 8_612, approvalRate: 94, confidence: 95, conflictRate: 1.9, reviewVolume: 28, approved: 8_095, pending: 517, evidenceCoverage: 97, conflicts: 16, domain: "Payments and Identity", owner: "Payments Platform" },
  { type: "Thresholds", count: 7_442, approvalRate: 88, confidence: 91, conflictRate: 3.0, reviewVolume: 52, approved: 6_549, pending: 893, evidenceCoverage: 93, conflicts: 22, domain: "Reliability", owner: "SRE" },
  { type: "Business Objectives", count: 6_842, approvalRate: 94, confidence: 93, conflictRate: 1.8, reviewVolume: 34, approved: 6_431, pending: 411, evidenceCoverage: 96, conflicts: 12, domain: "Strategy", owner: "Portfolio Office" },
  { type: "Targets", count: 6_028, approvalRate: 92, confidence: 93, conflictRate: 1.8, reviewVolume: 26, approved: 5_546, pending: 482, evidenceCoverage: 94, conflicts: 11, domain: "Reliability", owner: "Payments Platform" },
  { type: "Decision Rules", count: 5_914, approvalRate: 87, confidence: 89, conflictRate: 3.2, reviewVolume: 46, approved: 5_145, pending: 769, evidenceCoverage: 90, conflicts: 19, domain: "Operations", owner: "Support Operations" },
  { type: "Baselines", count: 5_612, approvalRate: 89, confidence: 90, conflictRate: 2.5, reviewVolume: 38, approved: 4_995, pending: 617, evidenceCoverage: 92, conflicts: 14, domain: "Reliability", owner: "SRE" },
  { type: "Risks", count: 5_448, approvalRate: 85, confidence: 87, conflictRate: 2.4, reviewVolume: 41, approved: 4_631, pending: 817, evidenceCoverage: 88, conflicts: 13, domain: "Risk", owner: "Risk & Controls" },
  { type: "Assumptions", count: 4_782, approvalRate: 78, confidence: 82, conflictRate: 1.9, reviewVolume: 62, approved: 3_730, pending: 1_052, evidenceCoverage: 74, conflicts: 9, domain: "Architecture", owner: "Architecture Guild" },
];

export const sidebarStatus = {
  service: "Extraction Service",
  state: "Operational" as ServiceState,
  activeJobs: 14,
  candidatesInReview: 427,
  approvedConditions: 87_442,
};

export const kpiTrends: Record<string, number[]> = {
  extracted: [72_100, 76_400, 80_200, 84_100, 88_600, 92_000, 94_812],
  approved: [66_100, 70_400, 74_800, 78_900, 82_400, 85_100, 87_442],
  jobs: [9, 11, 10, 12, 13, 12, 14],
  quality: [89, 90, 91, 92, 92, 93, 93],
  review: [612, 588, 540, 498, 466, 441, 427],
  ready: [69_800, 72_400, 75_600, 78_100, 80_400, 82_100, 82_906],
};

export const notificationsSeed = [
  { id: "N1", title: "Conflict detected in Payments domain", detail: "COND-100422 vs COND-100428 threshold contradiction", read: false, tone: "amber" as Tone },
  { id: "N2", title: "Owner resolution backlog elevated", detail: "46,000 artifacts pending owner reconciliation", read: false, tone: "amber" as Tone },
  { id: "N3", title: "Registry publish complete", detail: "17,804 conditions published from BCE-40451", read: true, tone: "green" as Tone },
  { id: "N4", title: "Job blocked", detail: "BCE-40446 blocked at Score Authority and Confidence", read: false, tone: "red" as Tone },
];

export const searchIndex = [
  { id: "COND-100421", label: "Payments API monthly availability ≥ 99.95 percent", kind: "Condition" },
  { id: "COND-100425", label: "Retry policy dual approval requirement", kind: "Condition" },
  { id: "BCE-40452", label: "Payments API Reliability Requirements job", kind: "Job" },
  { id: "CAN-90121", label: "Payments API Reliability Requirements v3.2", kind: "Artifact" },
  { id: "conflicts", label: "Detect Conflicts and Gaps stage", kind: "Stage" },
];
