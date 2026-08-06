/**
 * Cross Team Impact Analysis — Prompt 2 operational domain.
 *
 * Extends the Prompt 1 deterministic model with coordination operations:
 * scenarios, mitigations and tradeoffs, coordination actions, acknowledgements,
 * reviews, escalation, evidence remediation, reanalysis, version history,
 * decision context and routing. Nothing here averages Persona perspectives —
 * coordination records differences, it does not erase them.
 */

import {
  agreements, conflictsFor, coordinationActionsFor, ctiPersonas, dependenciesFor, evidenceState,
  governanceActive, mitigationCandidates, opportunities, personaById, personaScore, quarterEnd,
  severityRank, sharedConditions, buildDimensionMatrix, intersectionsFor, proposedChange,
  type CtiAnalysisState, type Severity,
} from "./data";

/* ------------------------------------------------------------ scenarios -- */

export interface CrossTeamImpactScenario {
  id: string;
  analysisId: string;
  name: string;
  description: string;
  proposalParameters: CtiAnalysisState & { retryAttempts: number; progressiveRollout: boolean };
  personaScores: Record<string, number>;
  matrixCellIds: string[];
  intersectionIds: string[];
  conflictIds: string[];
  dependencyIds: string[];
  mitigationIds: string[];
  coordinationActionIds: string[];
  confidence: number;
  createdAt: string;
}

export type ScenarioParams = CtiAnalysisState & { retryAttempts: number; progressiveRollout: boolean };

export const baselineParams: ScenarioParams = {
  retryAttempts: 3,
  maxTraffic: 5,
  deploymentTiming: "Standard window",
  progressiveRollout: true,
  idempotencyEvidence: true,
  fraudLossEvidence: false,
  dependencyLoadEvidence: false,
};

export const trafficOptions = [5, 10, 15, 25, 50, 100];
export const timingOptions: ScenarioParams["deploymentTiming"][] = [
  "Standard window", "Quarter end window", "Maintenance window",
];
export const retryOptions = [1, 2, 3, 4, 5];

export const scenarioPresets: { id: string; name: string; description: string; params: ScenarioParams }[] = [
  { id: "SCN A", name: "Scenario A", description: "3 retries · 5% traffic · progressive rollout", params: { ...baselineParams } },
  { id: "SCN B", name: "Scenario B", description: "3 retries · 15% traffic · progressive rollout", params: { ...baselineParams, maxTraffic: 15 } },
  { id: "SCN C", name: "Scenario C", description: "3 retries · 100% traffic · no progressive rollout", params: { ...baselineParams, maxTraffic: 100, progressiveRollout: false } },
];

export const toAnalysisState = (p: ScenarioParams): CtiAnalysisState => ({
  maxTraffic: p.maxTraffic,
  deploymentTiming: p.deploymentTiming,
  fraudLossEvidence: p.fraudLossEvidence,
  idempotencyEvidence: p.idempotencyEvidence,
  dependencyLoadEvidence: p.dependencyLoadEvidence,
});

/** Progressive rollout and retry depth adjust Persona pressure deterministically. */
export function scenarioPersonaScore(personaId: string, p: ScenarioParams) {
  let score = personaScore(personaId, toAnalysisState(p));
  if (!p.progressiveRollout && ["PER 4101", "PER 4103", "PER 4104", "PER 4106"].includes(personaId)) score += 8;
  if (p.progressiveRollout && personaId === "PER 4102") score += 2;
  if (p.retryAttempts >= 4 && ["PER 4103", "PER 4104", "PER 4105"].includes(personaId)) score += 4;
  if (p.retryAttempts <= 1 && personaId !== "PER 4102") score -= 5;
  return Math.max(10, Math.min(99, score));
}

export interface ScenarioMetrics {
  teamsMaterial: number;
  criticalCells: number;
  highCells: number;
  conflicts: number;
  dependencyRisk: number;
  governanceRequirements: number;
  customerOpportunity: number;
  mitigationsRequired: number;
  coordinationActions: number;
  evidenceGaps: number;
  confidence: number;
  personaScores: Record<string, number>;
}

export function scenarioMetrics(p: ScenarioParams): ScenarioMetrics {
  const state = toAnalysisState(p);
  const cells = buildDimensionMatrix(state);
  const conflicts = conflictsFor(state).filter((c) => c.status !== "Not Required");
  const deps = dependenciesFor(state);
  const evidence = evidenceState(state);
  const gaps = evidence.filter((e) => e.status !== "Provided").length;
  const personaScores = Object.fromEntries(ctiPersonas.map((x) => [x.id, scenarioPersonaScore(x.id, p)]));
  const governanceRequirements = (governanceActive(state) ? 1 : 0) + (quarterEnd(state) ? 1 : 0) + (p.progressiveRollout ? 0 : 1);
  const confidence = Math.max(
    62,
    96 - gaps * 3 - conflicts.filter((c) => c.severity === "Critical").length * 5 - (p.progressiveRollout ? 0 : 6),
  );
  return {
    teamsMaterial: Object.values(personaScores).filter((s) => s >= 50).length,
    criticalCells: cells.filter((c) => c.severity === "Critical").length + (p.progressiveRollout ? 0 : 2),
    highCells: cells.filter((c) => c.severity === "High").length,
    conflicts: conflicts.length,
    dependencyRisk: deps.filter((d) => severityRank(d.criticality) >= 2).length,
    governanceRequirements,
    customerOpportunity: Math.round(Math.min(100, p.maxTraffic * 0.6 + (p.retryAttempts * 8))),
    mitigationsRequired: mitigationCandidates.length - (p.maxTraffic <= 5 ? 1 : 0),
    coordinationActions: coordinationActionsFor(state).length,
    evidenceGaps: gaps,
    confidence,
    personaScores,
  };
}

export type DeltaLabel = "Improved" | "Worsened" | "Newly Activated" | "Resolved" | "Unchanged";

export function deltaLabel(before: number, after: number): DeltaLabel {
  if (before === 0 && after > 0) return "Newly Activated";
  if (before > 0 && after === 0) return "Resolved";
  if (after > before) return "Worsened";
  if (after < before) return "Improved";
  return "Unchanged";
}

export const comparisonRows: { key: keyof ScenarioMetrics; label: string; lowerIsBetter: boolean }[] = [
  { key: "teamsMaterial", label: "Teams materially impacted", lowerIsBetter: true },
  { key: "criticalCells", label: "Critical matrix cells", lowerIsBetter: true },
  { key: "highCells", label: "High matrix cells", lowerIsBetter: true },
  { key: "conflicts", label: "Conflicts", lowerIsBetter: true },
  { key: "dependencyRisk", label: "Shared dependency risk", lowerIsBetter: true },
  { key: "governanceRequirements", label: "Governance requirements", lowerIsBetter: true },
  { key: "customerOpportunity", label: "Customer opportunity", lowerIsBetter: false },
  { key: "mitigationsRequired", label: "Mitigation requirements", lowerIsBetter: true },
  { key: "coordinationActions", label: "Coordination actions", lowerIsBetter: true },
  { key: "evidenceGaps", label: "Evidence gaps", lowerIsBetter: true },
  { key: "confidence", label: "Analysis confidence", lowerIsBetter: false },
];

/* ----------------------------------------------------------- mitigations -- */

export interface CrossTeamMitigation {
  id: string;
  analysisId: string;
  title: string;
  description: string;
  owner: string;
  participatingTeamIds: string[];
  findingIds: string[];
  intersectionIds: string[];
  conflictIds: string[];
  dependencyIds: string[];
  requiredEvidenceIds: string[];
  expectedBenefits: string[];
  negativeConsequences: string[];
  benefitingPersonaIds: string[];
  adversePersonaIds: string[];
  originalSeverity: Severity;
  residualSeverity: Severity;
  confidence: number;
  status: "Candidate" | "Accepted" | "Rejected" | "Evidence Required";
}

export const seedMitigations: CrossTeamMitigation[] = [
  {
    id: "CTM 1001", analysisId: "CTA 3001", title: "Progressive Rollout",
    description: "Stage traffic exposure with measured evidence at every step before expanding.",
    owner: "Checkout Engineering", participatingTeamIds: ["PER 4101", "PER 4104", "PER 4103"],
    findingIds: ["CTI 1", "CTI 4"], intersectionIds: ["CTI 1", "CTI 4"], conflictIds: ["CTC 7003", "CTC 7002"],
    dependencyIds: ["CSD 6101", "CSD 6104"], requiredEvidenceIds: ["EV 7101"],
    expectedBenefits: ["Reliability risk contained", "Fraud exposure bounded per stage", "Operational containment"],
    negativeConsequences: ["Longer rollout duration", "Delayed availability of the completion benefit"],
    benefitingPersonaIds: ["PER 4103", "PER 4104", "PER 4106"],
    adversePersonaIds: ["PER 4102", "PER 4101"],
    originalSeverity: "Medium", residualSeverity: "Low", confidence: 93, status: "Candidate",
  },
  {
    id: "CTM 1002", analysisId: "CTA 3001", title: "Idempotency Validation",
    description: "Prove idempotent authorization behaviour before any production exposure.",
    owner: "Payments Platform", participatingTeamIds: ["PER 4102", "PER 4104"],
    findingIds: ["CTI 2"], intersectionIds: ["CTI 2"], conflictIds: [],
    dependencyIds: ["CSD 6104"], requiredEvidenceIds: ["EV 7103"],
    expectedBenefits: ["Duplicate transaction risk removed"],
    negativeConsequences: ["Additional validation effort before rollout"],
    benefitingPersonaIds: ["PER 4101", "PER 4102", "PER 4104"],
    adversePersonaIds: ["PER 4102"],
    originalSeverity: "Critical", residualSeverity: "Medium", confidence: 96, status: "Candidate",
  },
  {
    id: "CTM 1003", analysisId: "CTA 3001", title: "Dependency Stress Test",
    description: "Validate shared dependency capacity at projected retry volume.",
    owner: "Site Reliability Engineering", participatingTeamIds: ["PER 4105", "PER 4103", "PER 4101"],
    findingIds: ["CTI 5"], intersectionIds: ["CTI 5"], conflictIds: ["CTC 7003", "CTC 7004"],
    dependencyIds: ["CSD 6101", "CSD 6102", "CSD 6103"], requiredEvidenceIds: ["EV 7104"],
    expectedBenefits: ["Shared dependency risk quantified", "Capacity envelope evidenced"],
    negativeConsequences: ["Requires an environment window", "Delays 25% expansion"],
    benefitingPersonaIds: ["PER 4104", "PER 4105", "PER 4103"],
    adversePersonaIds: ["PER 4102"],
    originalSeverity: "High", residualSeverity: "Low", confidence: 90, status: "Evidence Required",
  },
  {
    id: "CTM 1004", analysisId: "CTA 3001", title: "Fraud Loss Monitoring",
    description: "Continuous fraud loss measurement across the whole rollout window.",
    owner: "Fraud Engineering", participatingTeamIds: ["PER 4102", "PER 4101"],
    findingIds: ["CTI 3"], intersectionIds: ["CTI 3"], conflictIds: ["CTC 7001"],
    dependencyIds: ["CSD 6101"], requiredEvidenceIds: ["EV 7102"],
    expectedBenefits: ["Fraud risk observable in production", "Conflict severity reduced"],
    negativeConsequences: ["Fraud analyst load during rollout"],
    benefitingPersonaIds: ["PER 4103", "PER 4101"],
    adversePersonaIds: ["PER 4103"],
    originalSeverity: "High", residualSeverity: "Medium", confidence: 91, status: "Candidate",
  },
  {
    id: "CTM 1005", analysisId: "CTA 3001", title: "Joint Approval Before >10%",
    description: "Record joint approval from Payments Reliability and Fraud Engineering before exceeding the threshold.",
    owner: "Release Governance", participatingTeamIds: ["PER 4101", "PER 4103"],
    findingIds: ["CTI 4"], intersectionIds: ["CTI 4"], conflictIds: ["CTC 7002"],
    dependencyIds: ["CSD 6105"], requiredEvidenceIds: ["EV 7106"],
    expectedBenefits: ["Governance conflict addressed", "Threshold enforcement is explicit"],
    negativeConsequences: ["Two business day approval lead time"],
    benefitingPersonaIds: ["PER 4106", "PER 4103"],
    adversePersonaIds: ["PER 4101", "PER 4102"],
    originalSeverity: "High", residualSeverity: "Medium", confidence: 92, status: "Candidate",
  },
  {
    id: "CTM 1006", analysisId: "CTA 3001", title: "Reduce Maximum Traffic Exposure to 10%",
    description: "Cap exposure at the approval threshold until fraud and dependency evidence exists.",
    owner: "Release Governance", participatingTeamIds: ["PER 4103", "PER 4104", "PER 4101"],
    findingIds: ["CTI 4"], intersectionIds: ["CTI 4"], conflictIds: ["CTC 7002", "CTC 7001"],
    dependencyIds: ["CSD 6105"], requiredEvidenceIds: ["EV 7106"],
    expectedBenefits: ["Governance constraint avoided", "Fraud exposure bounded", "Dependency load bounded"],
    negativeConsequences: ["Checkout sees slower learning and rollout", "Payments sees delayed availability benefit"],
    benefitingPersonaIds: ["PER 4103", "PER 4106", "PER 4104"],
    adversePersonaIds: ["PER 4102", "PER 4101"],
    originalSeverity: "High", residualSeverity: "Low", confidence: 88, status: "Candidate",
  },
  {
    id: "CTM 1007", analysisId: "CTA 3001", title: "Require Longer Observation Window",
    description: "Hold each rollout stage for a full business cycle before expanding.",
    owner: "Site Reliability Engineering", participatingTeamIds: ["PER 4103", "PER 4101"],
    findingIds: ["CTI 5"], intersectionIds: ["CTI 5"], conflictIds: ["CTC 7003"],
    dependencyIds: ["CSD 6102"], requiredEvidenceIds: ["EV 7104"],
    expectedBenefits: ["Dependency behaviour observed under real load", "Fraud pattern detection window widened"],
    negativeConsequences: ["Checkout delivery speed reduced"],
    benefitingPersonaIds: ["PER 4104", "PER 4103"],
    adversePersonaIds: ["PER 4102"],
    originalSeverity: "Medium", residualSeverity: "Low", confidence: 87, status: "Candidate",
  },
];

const rankToSeverity = (r: number): Severity => (["Low", "Medium", "High", "Critical"] as Severity[])[Math.max(0, Math.min(3, r))];

/** Residual severity after accepted mitigations. Raw severity is never overwritten. */
export function residualFor(rawSeverity: Severity, appliedMitigations: CrossTeamMitigation[]): Severity {
  const drop = appliedMitigations.reduce((acc, m) => acc + (severityRank(m.originalSeverity) - severityRank(m.residualSeverity) > 0 ? 1 : 0), 0);
  return rankToSeverity(severityRank(rawSeverity) - drop);
}

export interface CoordinatedConflictView {
  conflictId: string;
  label: string;
  rawSeverity: Severity;
  residualSeverity: Severity;
  mitigationsApplied: string[];
  confidence: number;
}

export function coordinatedConflicts(
  state: CtiAnalysisState, accepted: string[], mitigations: CrossTeamMitigation[],
): CoordinatedConflictView[] {
  return conflictsFor(state)
    .filter((c) => c.status !== "Not Required")
    .map((c) => {
      const applied = mitigations.filter((m) => accepted.includes(m.id) && m.conflictIds.includes(c.id));
      return {
        conflictId: c.id,
        label: `${personaById(c.personaAId).short} ↔ ${personaById(c.personaBId).short}`,
        rawSeverity: c.severity,
        residualSeverity: residualFor(c.severity, applied),
        mitigationsApplied: applied.map((m) => m.title),
        confidence: Math.min(98, 84 + applied.length * 4),
      };
    });
}

/* --------------------------------------------------- coordination actions */

export type CoordinationStatus =
  | "Proposed" | "Assigned" | "Acknowledged" | "In Progress" | "Evidence Required" | "Complete" | "Blocked";

export const coordinationStatuses: CoordinationStatus[] = [
  "Proposed", "Assigned", "Acknowledged", "In Progress", "Evidence Required", "Complete", "Blocked",
];

export interface CoordinationRecord {
  id: string;
  title: string;
  description: string;
  primaryOwner: string;
  participants: string[];
  priority: Severity;
  requiredBefore: string;
  evidenceRequirement: string;
  status: CoordinationStatus;
  dueDate: string;
  dependencies: string[];
  acknowledgements: string[];
}

export const seedCoordinationRecords: CoordinationRecord[] = [
  { id: "CCA 1101", title: "Fraud Loss Validation", description: "Confirm fraud loss exposure under the proposed retry envelope.", primaryOwner: "Fraud Engineering", participants: ["Checkout Engineering", "Payments Platform"], priority: "High", requiredBefore: "Traffic above 10%", evidenceRequirement: "EV 7102 Fraud loss analysis", status: "In Progress", dueDate: "2026-08-12", dependencies: ["CSD 6101"], acknowledgements: ["Fraud Engineering"] },
  { id: "CCA 1102", title: "Idempotency Validation", description: "Demonstrate idempotent authorization under repeated attempts.", primaryOwner: "Payments Platform", participants: ["Checkout Engineering", "Site Reliability Engineering"], priority: "Critical", requiredBefore: "Initial rollout", evidenceRequirement: "EV 7103 Idempotency validation report", status: "Complete", dueDate: "2026-08-04", dependencies: ["CSD 6104"], acknowledgements: ["Payments Platform", "Checkout Engineering"] },
  { id: "CCA 1103", title: "Dependency Stress Test", description: "Load test shared dependencies at projected retry volume.", primaryOwner: "Site Reliability Engineering", participants: ["Identity Engineering", "Fraud Engineering"], priority: "High", requiredBefore: "25% rollout", evidenceRequirement: "EV 7104 Dependency load test", status: "Evidence Required", dueDate: "2026-08-14", dependencies: ["CSD 6102", "CSD 6103"], acknowledgements: [] },
  { id: "CCA 1104", title: "Joint Approval", description: "Record joint approval prior to exceeding the governance threshold.", primaryOwner: "Release Governance", participants: ["Payments Platform", "Fraud Engineering"], priority: "High", requiredBefore: "Traffic above 10%", evidenceRequirement: "EV 7106 Approval record", status: "Proposed", dueDate: "2026-08-11", dependencies: ["CSD 6105"], acknowledgements: [] },
  { id: "CCA 1105", title: "Rollback Threshold Validation", description: "Define, test and publish the quantified rollback trigger.", primaryOwner: "Checkout Engineering", participants: ["Payments Platform", "Site Reliability Engineering"], priority: "High", requiredBefore: "Production rollout", evidenceRequirement: "EV 7101 Prior outcome record", status: "Assigned", dueDate: "2026-08-10", dependencies: ["CSD 6104"], acknowledgements: ["Checkout Engineering"] },
];

/* ------------------------------------------------------ acknowledgements -- */

export type AckStatus =
  | "Acknowledged" | "Acknowledged with Conditions" | "Evidence Required" | "Approval Required"
  | "Correction Requested" | "Pending" | "Disagrees";

export interface CrossTeamAcknowledgement {
  id: string;
  analysisId: string;
  personaId: string;
  teamId: string;
  personaOwner: string;
  status: AckStatus;
  conditions: string[];
  comments: string;
  topFinding: string;
  requiredAction: string;
  reviewState: string;
  acknowledgedAt: string;
}

export const seedAcknowledgements: CrossTeamAcknowledgement[] = [
  { id: "ACK 1", analysisId: "CTA 3001", personaId: "PER 4101", teamId: "Payments Platform", personaOwner: "D. Okonkwo", status: "Acknowledged with Conditions", conditions: ["Idempotency evidence retained", "Rollback threshold published"], comments: "Recovery benefit accepted, integrity controls must remain mandatory.", topFinding: "Duplicate authorization exposure under retry expansion", requiredAction: "Maintain idempotency validation", reviewState: "Reviewed", acknowledgedAt: "2026-08-06 09:41" },
  { id: "ACK 2", analysisId: "CTA 3001", personaId: "PER 4102", teamId: "Checkout Engineering", personaOwner: "M. Alvarez", status: "Acknowledged", conditions: [], comments: "Findings represent the checkout perspective accurately.", topFinding: "Measurable checkout completion improvement", requiredAction: "Publish rollback threshold", reviewState: "Reviewed", acknowledgedAt: "2026-08-06 09:52" },
  { id: "ACK 3", analysisId: "CTA 3001", personaId: "PER 4103", teamId: "Fraud Engineering", personaOwner: "S. Bhatt", status: "Evidence Required", conditions: ["Fraud loss analysis for the full retry envelope"], comments: "Cannot acknowledge exposure without loss modelling.", topFinding: "Fraud exposure and decision service volume increase", requiredAction: "Complete fraud loss validation", reviewState: "Awaiting Evidence", acknowledgedAt: "—" },
  { id: "ACK 4", analysisId: "CTA 3001", personaId: "PER 4104", teamId: "Site Reliability Engineering", personaOwner: "P. Novak", status: "Acknowledged", conditions: ["Dependency dashboards live before 25%"], comments: "Progressive rollout mitigation accepted.", topFinding: "Dependency saturation and operational load", requiredAction: "Run dependency stress test", reviewState: "Reviewed", acknowledgedAt: "2026-08-06 10:09" },
  { id: "ACK 5", analysisId: "CTA 3001", personaId: "PER 4105", teamId: "Identity Engineering", personaOwner: "R. Haddad", status: "Acknowledged", conditions: [], comments: "Capacity telemetry refresh scheduled.", topFinding: "Token validation latency under recovery volume", requiredAction: "Refresh capacity telemetry", reviewState: "Reviewed", acknowledgedAt: "2026-08-06 10:06" },
  { id: "ACK 6", analysisId: "CTA 3001", personaId: "PER 4106", teamId: "Release Governance", personaOwner: "L. Whitfield", status: "Approval Required", conditions: ["Joint approval recorded before exceeding 10% traffic"], comments: "Acknowledgement does not constitute approval.", topFinding: "Approval threshold and change window restrictions activate", requiredAction: "Record joint approval", reviewState: "Approval Pending", acknowledgedAt: "—" },
];

/* --------------------------------------------------------------- reviews -- */

export interface CrossTeamImpactReview {
  id: string;
  analysisId: string;
  personaId: string;
  intersectionId?: string;
  conflictId?: string;
  dependencyId?: string;
  reviewType: "Persona Owner" | "Dependency Owner" | "Cross Team" | "Governance";
  severity: Severity;
  reviewer: string;
  status: "Open" | "Confirmed" | "Challenged" | "Evidence Required" | "Escalated";
  decision: string;
  comments: string;
  requestedAt: string;
  dueAt: string;
  completedAt?: string;
}

export const seedReviews: CrossTeamImpactReview[] = [
  { id: "REV 1", analysisId: "CTA 3001", personaId: "PER 4101", intersectionId: "CTI 2", reviewType: "Persona Owner", severity: "High", reviewer: "D. Okonkwo", status: "Confirmed", decision: "Representation confirmed", comments: "Intersections match the Persona Impact result.", requestedAt: "2026-08-06 09:10", dueAt: "2026-08-08", completedAt: "2026-08-06 09:41" },
  { id: "REV 2", analysisId: "CTA 3001", personaId: "PER 4103", conflictId: "CTC 7001", reviewType: "Persona Owner", severity: "High", reviewer: "S. Bhatt", status: "Evidence Required", decision: "—", comments: "Fraud loss analysis required before confirming conflict severity.", requestedAt: "2026-08-06 09:15", dueAt: "2026-08-09" },
  { id: "REV 3", analysisId: "CTA 3001", personaId: "PER 4104", dependencyId: "CSD 6102", reviewType: "Cross Team", severity: "Medium", reviewer: "P. Novak", status: "Open", decision: "—", comments: "Awaiting Identity capacity refresh.", requestedAt: "2026-08-06 09:30", dueAt: "2026-08-11" },
  { id: "REV 4", analysisId: "CTA 3001", personaId: "PER 4106", conflictId: "CTC 7002", reviewType: "Governance", severity: "High", reviewer: "L. Whitfield", status: "Open", decision: "—", comments: "Threshold activation confirmed above 10% traffic.", requestedAt: "2026-08-06 10:03", dueAt: "2026-08-11" },
];

export interface DependencyOwnerReview {
  dependencyId: string;
  dependency: string;
  owner: string;
  affectedTeams: string[];
  impact: string;
  capacitySignal: string;
  failurePropagation: string;
  requiredEvidence: string;
  reviewer: string;
  status: "Evidence Required" | "Acknowledged" | "Review Required" | "Confirmed" | "Challenged" | "Escalated";
}

export const seedDependencyReviews: DependencyOwnerReview[] = [
  { dependencyId: "CSD 6101", dependency: "Fraud Decision Service", owner: "Fraud Engineering", affectedTeams: ["Payments", "Checkout", "SRE"], impact: "Timeout degradation raises declines", capacitySignal: "72% of tested peak", failurePropagation: "Conservative decisioning, checkout declines rise", requiredEvidence: "Fraud loss analysis", reviewer: "S. Bhatt", status: "Evidence Required" },
  { dependencyId: "CSD 6102", dependency: "Identity Services", owner: "Identity Engineering", affectedTeams: ["Payments", "Checkout", "SRE"], impact: "Validation latency amplifies checkout p95", capacitySignal: "64% of tested peak", failurePropagation: "Latency propagates to authorization path", requiredEvidence: "Capacity headroom telemetry", reviewer: "R. Haddad", status: "Acknowledged" },
  { dependencyId: "CSD 6103", dependency: "Regional Token Vault", owner: "Platform Engineering", affectedTeams: ["Payments", "SRE"], impact: "Regional unavailability blocks replay", capacitySignal: "Failover untested this quarter", failurePropagation: "Authorization replay unavailable in region", requiredEvidence: "Regional failover test", reviewer: "T. Nguyen", status: "Review Required" },
];

/* ------------------------------------------------------------ escalation -- */

export const escalationReasons = [
  "Critical Customer Impact", "Critical Financial Impact", "Security Conflict", "Compliance Conflict",
  "Unresolved Governance Constraint", "Unowned Coordination Action", "Critical Shared Dependency",
  "Unresolved Persona Conflict", "Evidence Unavailable", "Executive Tradeoff Required",
];

export interface CrossTeamEscalation {
  id: string;
  analysisId: string;
  issueType: string;
  title: string;
  description: string;
  severity: Severity;
  affectedTeamIds: string[];
  businessImpact: string;
  customerImpact: string;
  technicalImpact: string;
  evidenceReferenceIds: string[];
  owner: string;
  dueDate: string;
  status: "Open" | "In Review" | "Resolved";
  createdAt: string;
}

export const seedEscalations: CrossTeamEscalation[] = [
  {
    id: "ESC 1", analysisId: "CTA 3001", issueType: "Critical Shared Dependency",
    title: "Fraud Decision Service capacity unproven at projected retry volume",
    description: "Four Personas depend on the service and no load evidence exists for the proposed envelope.",
    severity: "High", affectedTeamIds: ["PER 4101", "PER 4102", "PER 4103", "PER 4104"],
    businessImpact: "Authorization completion benefit cannot be realised safely",
    customerImpact: "Elevated decline risk during peak",
    technicalImpact: "Conservative decisioning under timeout",
    evidenceReferenceIds: ["EV 7104"], owner: "Coordination Office", dueDate: "2026-08-13",
    status: "Open", createdAt: "2026-08-06 10:18",
  },
];

/* ------------------------------------------------------ evidence catalogue */

export const evidenceTypes = [
  "Load Test", "Fraud Analysis", "Dependency Capacity Test", "Security Review", "Customer Analysis",
  "Financial Analysis", "Compliance Evidence", "Rollback Test", "Operational Readiness", "Architecture Review",
];

/* ------------------------------------------------------------ reanalysis -- */

export const reanalysisScopes = [
  "Full Analysis", "Selected Personas", "Selected Matrix Cells", "Shared Dependencies", "Conflicts Only",
  "Mitigation Changes", "Evidence Changes", "Persona Version Changes", "Condition Version Changes",
];

export const reanalysisSteps = [
  "Load Existing Analysis", "Apply Updated Inputs", "Rebuild Matrix", "Retrace Dependencies",
  "Recalculate Intersections", "Recalculate Conflicts", "Recalculate Opportunities",
  "Recalculate Coordination Actions", "Prepare New Version", "Completed",
];

export const executionSteps = [
  "Loading Persona Impact Results", "Normalizing Findings", "Mapping Shared Entities", "Building Matrix",
  "Tracing Dependencies", "Detecting Intersections", "Detecting Conflicts", "Detecting Opportunities",
  "Aggregating Mitigations", "Assigning Coordination Ownership", "Evaluating Enterprise Consequences",
  "Preparing Decision Context", "Completed",
];

/* ------------------------------------------------- start analysis wizard -- */

export const startSteps = [
  "Select Persona Impact Analysis", "Select Personas", "Analysis Scope", "Propagation Rules",
  "Quality Controls", "Review", "Execute",
];

export const completedPersonaAnalyses = [
  { id: "EVAL 2048", workItem: "Checkout Retry Policy Update", team: "Checkout Engineering", completedAt: "2026-08-06 08:40", personas: 6 },
  { id: "EVAL 2044", workItem: "Fraud Decision Timeout Adjustment", team: "Fraud Engineering", completedAt: "2026-08-05 16:11", personas: 5 },
  { id: "EVAL 2039", workItem: "Regional Token Vault Migration", team: "Platform Engineering", completedAt: "2026-08-05 11:02", personas: 7 },
  { id: "EVAL 2035", workItem: "Identity Token Cache Optimization", team: "Identity Engineering", completedAt: "2026-08-04 15:26", personas: 4 },
];

export const analysisScopeOptions = [
  "Shared Objectives", "Shared Risks", "Shared Dependencies", "Shared Controls", "Shared Policies",
  "Approval Requirements", "Customer Journeys", "Financial Consequences", "Operational Consequences",
  "Security Consequences", "Compliance Consequences", "Conflict Areas", "Shared Opportunities", "Mitigations",
];

export const propagationRuleOptions = [
  "Direct Impact", "One Hop Dependency Impact", "Two Hop Critical Dependency Impact",
  "Customer Journey Propagation", "Governance Propagation", "Shared Service Propagation",
];

export const qualityControlDefaults = {
  minPersonaConfidence: 85,
  minConditionAuthority: 90,
  minDependencyConfidence: 80,
  minMatrixCoverage: 95,
  humanReviewThreshold: 70,
  criticalIntersectionThreshold: 2,
};

/* ------------------------------------------------- version sensitivity ---- */

export interface PersonaVersionSensitivity {
  personaId: string;
  fromVersion: string;
  toVersion: string;
  driver: string;
  cellsAdded: number;
  cellsRemoved: number;
  severityChanges: { cell: string; from: Severity; to: Severity }[];
  conflictChanges: string[];
  coordinationChanges: string[];
  reviewerChanges: string[];
}

export const personaVersionSensitivity: PersonaVersionSensitivity[] = [
  {
    personaId: "PER 4101", fromVersion: "v3.3", toVersion: "v3.4",
    driver: "Approval threshold tightened from 20% traffic to 10% traffic",
    cellsAdded: 2, cellsRemoved: 0,
    severityChanges: [
      { cell: "Payments ↔ Release Governance · Approval", from: "Medium", to: "High" },
      { cell: "Payments ↔ Fraud · Risk", from: "Medium", to: "High" },
    ],
    conflictChanges: ["CTC 7002 activates at 10% rather than 20%"],
    coordinationChanges: ["Joint Approval required earlier in the rollout"],
    reviewerChanges: ["Fraud Engineering review becomes mandatory earlier"],
  },
  {
    personaId: "PER 4104", fromVersion: "v2.8", toVersion: "v2.9",
    driver: "Dependency saturation tolerance reduced",
    cellsAdded: 1, cellsRemoved: 1,
    severityChanges: [{ cell: "SRE · Dependency", from: "Medium", to: "High" }],
    conflictChanges: ["CTC 7003 severity raised when load evidence is absent"],
    coordinationChanges: ["Dependency Stress Test moves before 25% rollout"],
    reviewerChanges: ["Identity Engineering added as reviewer"],
  },
];

export interface ConditionSensitivity {
  conditionId: string;
  label: string;
  oldValue: string;
  currentValue: string;
  affectedPersonaIds: string[];
  matrixEffect: string;
  coordinationEffect: string;
}

export const conditionSensitivity: ConditionSensitivity[] = [
  {
    conditionId: "BC 5103", label: "Retry Approval Requirement", oldValue: "20% traffic", currentValue: "10% traffic",
    affectedPersonaIds: ["PER 4101", "PER 4103", "PER 4106"],
    matrixEffect: "Three cells increase severity", coordinationEffect: "New coordination action added: Joint Approval",
  },
  {
    conditionId: "BC 5105", label: "Quarter End Restriction", oldValue: "Five days", currentValue: "Three days",
    affectedPersonaIds: ["PER 4106", "PER 4104"],
    matrixEffect: "Governance conflict applies to a narrower time window", coordinationEffect: "Change window exception scope reduced",
  },
];

/* ------------------------------------------------------ version history -- */

export interface CrossTeamAnalysisVersion {
  id: string;
  analysisId: string;
  version: number;
  previousVersionId?: string;
  personaVersions: Record<string, string>;
  conditionVersions: Record<string, string>;
  matrixCoverage: number;
  criticalCells: number;
  highCells: number;
  conflicts: number;
  dependencies: number;
  mitigations: number;
  coordinationActions: number;
  acknowledgements: number;
  confidence: number;
  changeReason: string;
  createdBy: string;
  createdAt: string;
  teamScope: string[];
}

const basePersonaVersions = {
  "PER 4101": "v3.3", "PER 4102": "v2.4", "PER 4103": "v4.1",
  "PER 4104": "v2.8", "PER 4105": "v1.9", "PER 4106": "v3.0",
};

export const seedVersions: CrossTeamAnalysisVersion[] = [
  {
    id: "CTAV 1", analysisId: "CTA 3001", version: 1, personaVersions: basePersonaVersions,
    conditionVersions: { "BC 5103": "v1 (20%)", "BC 5105": "v2 (five days)" },
    matrixCoverage: 92, criticalCells: 0, highCells: 8, conflicts: 3, dependencies: 5, mitigations: 4,
    coordinationActions: 4, acknowledgements: 2, confidence: 86,
    changeReason: "Initial Cross Team synthesis", createdBy: "Coordination Office", createdAt: "2026-08-05 16:40",
    teamScope: ["PER 4101", "PER 4102", "PER 4103", "PER 4104", "PER 4105", "PER 4106"],
  },
  {
    id: "CTAV 2", analysisId: "CTA 3001", version: 2, previousVersionId: "CTAV 1",
    personaVersions: basePersonaVersions,
    conditionVersions: { "BC 5103": "v2 (10%)", "BC 5105": "v2 (five days)" },
    matrixCoverage: 96, criticalCells: 0, highCells: 9, conflicts: 3, dependencies: 5, mitigations: 5,
    coordinationActions: 4, acknowledgements: 3, confidence: 89,
    changeReason: "After fraud evidence provided", createdBy: "Fraud Engineering", createdAt: "2026-08-06 09:12",
    teamScope: ["PER 4101", "PER 4102", "PER 4103", "PER 4104", "PER 4105", "PER 4106"],
  },
  {
    id: "CTAV 3", analysisId: "CTA 3001", version: 3, previousVersionId: "CTAV 2",
    personaVersions: { ...basePersonaVersions, "PER 4101": "v3.4" },
    conditionVersions: { "BC 5103": "v2 (10%)", "BC 5105": "v3 (three days)" },
    matrixCoverage: 98, criticalCells: 1, highCells: 12, conflicts: 4, dependencies: 5, mitigations: 6,
    coordinationActions: 5, acknowledgements: 4, confidence: 91,
    changeReason: "After traffic exposure increased to 15%", createdBy: "Coordination Office", createdAt: "2026-08-06 10:14",
    teamScope: ["PER 4101", "PER 4102", "PER 4103", "PER 4104", "PER 4105", "PER 4106"],
  },
  {
    id: "CTAV 4", analysisId: "CTA 3001", version: 4, previousVersionId: "CTAV 3",
    personaVersions: { ...basePersonaVersions, "PER 4101": "v3.4" },
    conditionVersions: { "BC 5103": "v2 (10%)", "BC 5105": "v3 (three days)" },
    matrixCoverage: 98, criticalCells: 0, highCells: 9, conflicts: 4, dependencies: 5, mitigations: 7,
    coordinationActions: 5, acknowledgements: 5, confidence: 93,
    changeReason: "After shared mitigations accepted", createdBy: "Coordination Office", createdAt: "2026-08-06 10:41",
    teamScope: ["PER 4101", "PER 4102", "PER 4103", "PER 4104", "PER 4105", "PER 4106"],
  },
];

export type DiffState = "Added" | "Removed" | "Changed" | "Unchanged" | "Material Change";

export interface VersionDiffRow { field: string; left: string; right: string; state: DiffState }

export function compareVersions(a: CrossTeamAnalysisVersion, b: CrossTeamAnalysisVersion): VersionDiffRow[] {
  const num = (field: string, l: number, r: number, material = 2): VersionDiffRow => ({
    field, left: String(l), right: String(r),
    state: l === r ? "Unchanged" : Math.abs(r - l) >= material ? "Material Change" : "Changed",
  });
  const rows: VersionDiffRow[] = [
    { field: "Team Scope", left: `${a.teamScope.length} Personas`, right: `${b.teamScope.length} Personas`, state: a.teamScope.length === b.teamScope.length ? "Unchanged" : "Changed" },
    ...Object.keys(a.personaVersions).map<VersionDiffRow>((k) => ({
      field: `${personaById(k).short} Persona version`, left: a.personaVersions[k], right: b.personaVersions[k] ?? "—",
      state: a.personaVersions[k] === b.personaVersions[k] ? "Unchanged" : "Material Change",
    })),
    ...Object.keys(a.conditionVersions).map<VersionDiffRow>((k) => ({
      field: `${k} condition version`, left: a.conditionVersions[k], right: b.conditionVersions[k] ?? "—",
      state: a.conditionVersions[k] === b.conditionVersions[k] ? "Unchanged" : "Material Change",
    })),
    num("Matrix coverage", a.matrixCoverage, b.matrixCoverage),
    num("Critical cells", a.criticalCells, b.criticalCells, 1),
    num("High cells", a.highCells, b.highCells),
    num("Conflicts", a.conflicts, b.conflicts, 1),
    num("Shared dependencies", a.dependencies, b.dependencies, 1),
    num("Mitigations", a.mitigations, b.mitigations, 1),
    num("Coordination actions", a.coordinationActions, b.coordinationActions, 1),
    num("Acknowledgements", a.acknowledgements, b.acknowledgements, 1),
    num("Confidence", a.confidence, b.confidence, 3),
    { field: "Change reason", left: a.changeReason, right: b.changeReason, state: a.changeReason === b.changeReason ? "Unchanged" : "Changed" },
  ];
  return rows;
}

/* --------------------------------------------------------- decision package */

export interface CrossTeamDecisionPackage {
  id: string;
  analysisId: string;
  analysisVersionId: string;
  workItemId: string;
  personaIds: string[];
  personaVersions: Record<string, string>;
  criticalIntersectionIds: string[];
  highIntersectionIds: string[];
  sharedDependencyIds: string[];
  conflictIds: string[];
  agreementIds: string[];
  opportunityIds: string[];
  mitigationIds: string[];
  coordinationActionIds: string[];
  acknowledgementIds: string[];
  evidenceIds: string[];
  missingEvidence: string[];
  governanceRequirements: string[];
  escalationIds: string[];
  openIssues: string[];
  enterpriseSummary: string;
  analysisConfidence: number;
  status: "Draft" | "Ready" | "Routed";
  createdAt: string;
}

export const decisionFraming =
  "The proposed retry change presents meaningful customer completion opportunity, but coordinated rollout is required because payment integrity, fraud exposure, dependency capacity, and governance constraints span multiple teams.";

export const decisionConditions = [
  "Validated Fraud Loss Analysis",
  "Validated Dependency Stress Test",
  "Idempotency Controls",
  "Progressive Rollout",
  "Rollback Threshold",
  "Joint Approval before >10% traffic",
];

export function buildDecisionPackage(
  state: CtiAnalysisState, version: CrossTeamAnalysisVersion, accepted: string[],
  acks: CrossTeamAcknowledgement[], escalations: CrossTeamEscalation[],
): CrossTeamDecisionPackage {
  const evidence = evidenceState(state);
  const conflicts = conflictsFor(state).filter((c) => c.status !== "Not Required");
  const inter = intersectionsFor(state);
  return {
    id: "CTDP 1", analysisId: "CTA 3001", analysisVersionId: version.id, workItemId: "WI 1204",
    personaIds: ctiPersonas.map((p) => p.id), personaVersions: version.personaVersions,
    criticalIntersectionIds: inter.filter((i) => i.severity === "Critical").map((i) => i.id),
    highIntersectionIds: inter.filter((i) => i.severity === "High").map((i) => i.id),
    sharedDependencyIds: dependenciesFor(state).map((d) => d.id),
    conflictIds: conflicts.map((c) => c.id),
    agreementIds: agreements.map((a) => a.id),
    opportunityIds: opportunities.map((o) => o.id),
    mitigationIds: accepted,
    coordinationActionIds: coordinationActionsFor(state).map((a) => a.id),
    acknowledgementIds: acks.map((a) => a.id),
    evidenceIds: evidence.filter((e) => e.status === "Provided").map((e) => e.id),
    missingEvidence: evidence.filter((e) => e.status !== "Provided").map((e) => e.label),
    governanceRequirements: [
      ...(governanceActive(state) ? ["Joint approval before exceeding 10% traffic exposure"] : []),
      ...(quarterEnd(state) ? ["Quarter end change window exception"] : []),
      "Rollback threshold published before production rollout",
    ],
    escalationIds: escalations.map((e) => e.id),
    openIssues: [
      ...conflicts.filter((c) => c.status === "Open").map((c) => `${c.id} open conflict`),
      ...acks.filter((a) => a.status !== "Acknowledged").map((a) => `${personaById(a.personaId).short}: ${a.status}`),
    ],
    enterpriseSummary: decisionFraming,
    analysisConfidence: Math.max(72, 96 - evidence.filter((e) => e.status !== "Provided").length * 3),
    status: "Draft", createdAt: "2026-08-06 10:52",
  };
}

/* ----------------------------------------------------------- readiness --- */

export interface ReadinessMetric { name: string; value: number; target: number }

export type ReadinessState =
  | "Analysis Complete" | "Coordination In Progress" | "Review Complete" | "Decision Context Ready";

export function readinessMetrics(
  state: CtiAnalysisState, accepted: string[], acks: CrossTeamAcknowledgement[], records: CoordinationRecord[],
): { metrics: ReadinessMetric[]; state: ReadinessState } {
  const evidence = evidenceState(state);
  const evidenceCoverage = Math.round((evidence.filter((e) => e.status === "Provided").length / evidence.length) * 100);
  const ownership = Math.round((records.filter((r) => r.status !== "Proposed").length / Math.max(1, records.length)) * 100);
  const ackCoverage = Math.round((acks.filter((a) => a.status.startsWith("Acknowledged")).length / Math.max(1, acks.length)) * 100);
  const mitigationCoverage = Math.round((accepted.length / seedMitigations.length) * 100);
  const confidence = Math.max(70, Math.round((evidenceCoverage + ownership + ackCoverage + 96 + 98) / 5));
  const metrics: ReadinessMetric[] = [
    { name: "Persona Coverage", value: 100, target: 100 },
    { name: "Matrix Coverage", value: 98, target: 98 },
    { name: "Dependency Coverage", value: 91, target: 95 },
    { name: "Condition Coverage", value: 94, target: 95 },
    { name: "Evidence Coverage", value: evidenceCoverage, target: 95 },
    { name: "Conflict Traceability", value: 96, target: 95 },
    { name: "Coordination Ownership", value: ownership, target: 95 },
    { name: "Acknowledgement Coverage", value: ackCoverage, target: 90 },
    { name: "Mitigation Coverage", value: mitigationCoverage, target: 70 },
    { name: "Analysis Confidence", value: confidence, target: 90 },
  ];
  const readiness: ReadinessState =
    evidenceCoverage >= 95 && ackCoverage >= 90 && ownership >= 95 ? "Decision Context Ready"
      : ackCoverage >= 60 && ownership >= 60 ? "Review Complete"
        : accepted.length > 0 ? "Coordination In Progress" : "Analysis Complete";
  return { metrics, state: readiness };
}

/* ------------------------------------------------------------- routing --- */

export const decisionIntelligenceRoute = "/enterprise-cognitive-fabric/evaluation/decision-intelligence";

export interface RoutingValidation {
  checks: { label: string; state: "Pass" | "Warning" | "Blocked"; detail: string }[];
  blocking: string[];
  warnings: string[];
  canRoute: boolean;
}

export function validateRouting(
  state: CtiAnalysisState, accepted: string[], acks: CrossTeamAcknowledgement[],
  records: CoordinationRecord[], versionExists: boolean, owner: string | null,
): RoutingValidation {
  const conflicts = conflictsFor(state).filter((c) => c.status !== "Not Required");
  const evidence = evidenceState(state);
  const gaps = evidence.filter((e) => e.status !== "Provided");
  const unowned = records.filter((r) => r.status === "Proposed");
  const checks: RoutingValidation["checks"] = [
    { label: "Persona Impact Analysis complete", state: "Pass", detail: "6 Persona results loaded from EVAL 2048" },
    { label: "Cross Team Matrix complete", state: "Pass", detail: "98% matrix coverage" },
    { label: "Critical dependency findings recorded", state: "Pass", detail: `${dependenciesFor(state).length} shared dependencies recorded` },
    { label: "Material conflicts recorded", state: "Pass", detail: `${conflicts.length} conflicts recorded with both perspectives preserved` },
    {
      label: "Coordination owners assigned or explicitly unresolved",
      state: unowned.length ? "Warning" : "Pass",
      detail: unowned.length ? `${unowned.length} action(s) remain proposed and are recorded as unresolved` : "All actions owned",
    },
    { label: "Evidence gaps recorded", state: gaps.length ? "Warning" : "Pass", detail: gaps.length ? `${gaps.length} evidence gap(s) recorded` : "No gaps" },
    { label: "Mitigations recorded", state: accepted.length ? "Pass" : "Warning", detail: `${accepted.length} mitigation(s) accepted` },
    { label: "Acknowledgement states recorded", state: "Pass", detail: `${acks.length} team acknowledgement records` },
    { label: "Analysis version preserved", state: versionExists ? "Pass" : "Blocked", detail: versionExists ? "Version history intact" : "No analysis version available" },
    { label: "Accountable analysis owner", state: owner ? "Pass" : "Blocked", detail: owner ?? "No accountable owner assigned" },
  ];
  const blocking = checks.filter((c) => c.state === "Blocked").map((c) => c.label);
  const warnings = checks.filter((c) => c.state === "Warning").map((c) => c.label);
  return { checks, blocking, warnings, canRoute: blocking.length === 0 };
}

/* ------------------------------------------------------- notifications --- */

export const notificationTypes = [
  "Cross Team Analysis Started", "Analysis Completed", "Critical Intersection Detected", "Conflict Detected",
  "Shared Dependency Risk", "Coordination Action Assigned", "Coordination Action Overdue", "Evidence Requested",
  "Evidence Added", "Team Acknowledgement Requested", "Team Acknowledged", "Mitigation Proposed",
  "Mitigation Accepted", "Escalation Created", "Analysis Recalculated", "Persona Version Changed",
  "Condition Version Changed", "Decision Context Ready",
];

export interface CrossTeamNotification {
  id: string;
  analysisId: string;
  type: string;
  title: string;
  description: string;
  severity: Severity;
  owner: string;
  status: "Unread" | "Read";
  createdAt: string;
}

export const seedNotifications: CrossTeamNotification[] = [
  { id: "NTF 1", analysisId: "CTA 3001", type: "Conflict Detected", title: "Payments and Fraud intersection raised to High", description: "Conversion versus fraud exposure conflict requires coordination.", severity: "High", owner: "Coordination Office", status: "Unread", createdAt: "10:22 AM" },
  { id: "NTF 2", analysisId: "CTA 3001", type: "Evidence Requested", title: "Fraud loss analysis requested", description: "Requested from Fraud Engineering before traffic exceeds 10%.", severity: "High", owner: "Fraud Engineering", status: "Unread", createdAt: "10:18 AM" },
  { id: "NTF 3", analysisId: "CTA 3001", type: "Shared Dependency Risk", title: "Fraud Decision Service flagged as shared critical dependency", description: "Four Personas depend on the service.", severity: "High", owner: "Site Reliability Engineering", status: "Unread", createdAt: "09:58 AM" },
  { id: "NTF 4", analysisId: "CTA 3001", type: "Coordination Action Assigned", title: "Joint approval assigned to Release Governance", description: "Required before exceeding 10% traffic exposure.", severity: "Medium", owner: "Release Governance", status: "Read", createdAt: "10:03 AM" },
  { id: "NTF 5", analysisId: "CTA 3001", type: "Analysis Recalculated", title: "CTA 3001 version 3 created", description: "Traffic exposure increased to 15%.", severity: "Low", owner: "Coordination Office", status: "Read", createdAt: "09:52 AM" },
];

/* ------------------------------------------------------------- activity -- */

export interface OpsActivity {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  owner: string;
  result: string;
}

export const seedOpsActivity: OpsActivity[] = [
  { id: "OA 1", timestamp: "10:22 AM", action: "Intersection Updated", description: "Payments and Fraud intersection marked High", owner: "Coordination Office", result: "Review Required" },
  { id: "OA 2", timestamp: "10:18 AM", action: "Evidence Requested", description: "Fraud Loss Analysis requested", owner: "Fraud Engineering", result: "Pending" },
  { id: "OA 3", timestamp: "10:14 AM", action: "Scenario Changed", description: "Traffic exposure increased to 15%, Release Governance conflict activated", owner: "Coordination Office", result: "Conflict Detected" },
  { id: "OA 4", timestamp: "10:09 AM", action: "Mitigation Accepted", description: "SRE accepted Progressive Rollout mitigation", owner: "Site Reliability Engineering", result: "Accepted" },
  { id: "OA 5", timestamp: "10:06 AM", action: "Dependency Review", description: "Identity dependency review acknowledged", owner: "Identity Engineering", result: "Acknowledged" },
  { id: "OA 6", timestamp: "10:03 AM", action: "Coordination Assigned", description: "Joint approval coordination action assigned to Release Governance", owner: "Release Governance", result: "Assigned" },
  { id: "OA 7", timestamp: "09:58 AM", action: "Dependency Flagged", description: "Fraud Decision Service flagged as shared critical dependency", owner: "Site Reliability Engineering", result: "Critical" },
  { id: "OA 8", timestamp: "09:52 AM", action: "Version Created", description: "CTA 3001 version 3 created", owner: "Coordination Office", result: "Recorded" },
];

/* --------------------------------------------------------- global search -- */

export interface SearchHit {
  id: string;
  type: string;
  analysis: string;
  teams: string;
  issue: string;
  severity: string;
  owner: string;
  status: string;
  target: string;
}

export function searchEverything(
  q: string, state: CtiAnalysisState, mitigations: CrossTeamMitigation[],
  records: CoordinationRecord[], acks: CrossTeamAcknowledgement[],
  escalations: CrossTeamEscalation[], versions: CrossTeamAnalysisVersion[],
): SearchHit[] {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const hits: SearchHit[] = [];
  const push = (h: SearchHit) => hits.push(h);

  ctiPersonas.forEach((p) => push({ id: p.id, type: "Persona", analysis: "CTA 3001", teams: p.team, issue: p.primaryRisk, severity: p.highestSeverity, owner: p.team, status: p.reviewRequired ? "Review Required" : "Reviewed", target: "panel-personas" }));
  buildDimensionMatrix(state).forEach((c) => push({ id: c.id, type: "Matrix Cell", analysis: "CTA 3001", teams: personaById(c.rowPersonaId).short, issue: `${c.impactDimension ?? "Persona"} · ${c.summary}`, severity: String(c.severity), owner: personaById(c.rowPersonaId).team, status: c.coordinationRequired ? "Coordination Required" : "Recorded", target: "panel-matrix" }));
  intersectionsFor(state).forEach((i) => push({ id: i.id, type: "Intersection", analysis: "CTA 3001", teams: i.personaIds.map((p) => personaById(p).short).join(" + "), issue: i.summary, severity: i.severity, owner: "Coordination Office", status: i.status, target: "panel-workbench" }));
  conflictsFor(state).forEach((c) => push({ id: c.id, type: "Conflict", analysis: "CTA 3001", teams: `${personaById(c.personaAId).short} ↔ ${personaById(c.personaBId).short}`, issue: c.description, severity: c.severity, owner: "Coordination Office", status: c.status, target: "panel-conflicts" }));
  agreements.forEach((a) => push({ id: a.id, type: "Agreement", analysis: "CTA 3001", teams: a.personaIds.map((p) => personaById(p).short).join(", "), issue: a.title, severity: "Low", owner: "Coordination Office", status: "Agreed", target: "panel-agreements" }));
  opportunities.forEach((o) => push({ id: o.id, type: "Opportunity", analysis: "CTA 3001", teams: o.personaIds.map((p) => personaById(p).short).join(", "), issue: o.title, severity: "Low", owner: "Coordination Office", status: o.benefitType, target: "panel-opportunities" }));
  dependenciesFor(state).forEach((d) => push({ id: d.id, type: "Shared Dependency", analysis: "CTA 3001", teams: d.affectedPersonaIds.map((p) => personaById(p).short).join(", "), issue: `${d.dependencyName} · ${d.primaryConcern}`, severity: d.criticality, owner: d.dependencyType, status: d.status, target: "panel-dependencies" }));
  mitigations.forEach((m) => push({ id: m.id, type: "Mitigation", analysis: "CTA 3001", teams: m.participatingTeamIds.map((p) => personaById(p).short).join(", "), issue: m.title, severity: m.originalSeverity, owner: m.owner, status: m.status, target: "panel-mitigation-planner" }));
  records.forEach((r) => push({ id: r.id, type: "Coordination Action", analysis: "CTA 3001", teams: r.participants.join(", "), issue: r.title, severity: r.priority, owner: r.primaryOwner, status: r.status, target: "panel-coordination-actions" }));
  evidenceState(state).forEach((e) => push({ id: e.id, type: "Evidence", analysis: "CTA 3001", teams: e.personaIds.map((p) => personaById(p).short).join(", "), issue: e.label, severity: e.status === "Missing" ? "High" : "Low", owner: e.authority, status: e.status, target: "panel-evidence-remediation" }));
  versions.forEach((v) => push({ id: v.id, type: "Analysis Version", analysis: v.analysisId, teams: `${v.teamScope.length} Personas`, issue: v.changeReason, severity: "Low", owner: v.createdBy, status: `v${v.version}`, target: "panel-version-history" }));
  acks.forEach((a) => push({ id: a.id, type: "Acknowledgement", analysis: a.analysisId, teams: a.teamId, issue: a.topFinding, severity: a.status === "Acknowledged" ? "Low" : "Medium", owner: a.personaOwner, status: a.status, target: "panel-acknowledgement" }));
  escalations.forEach((e) => push({ id: e.id, type: "Escalation", analysis: e.analysisId, teams: e.affectedTeamIds.map((p) => personaById(p).short).join(", "), issue: e.title, severity: e.severity, owner: e.owner, status: e.status, target: "panel-escalation" }));
  sharedConditions.forEach((c) => push({ id: c.id, type: "Condition", analysis: "CTA 3001", teams: c.personaIds.map((p) => personaById(p).short).join(", "), issue: c.label, severity: "Low", owner: c.authority, status: c.status, target: "panel-condition-sensitivity" }));

  return hits.filter((h) => [h.id, h.type, h.analysis, h.teams, h.issue, h.severity, h.owner, h.status].join(" ").toLowerCase().includes(term)).slice(0, 60);
}

export const searchExamples = [
  "Conflicts involving Fraud",
  "Critical shared dependencies",
  "Release Governance",
  "Proposed",
  "Payments",
  "v3.3",
];

/* ---------------------------------------------------------------- export -- */

export const exportFormats = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot"];
export const exportScopes = [
  "Current Analysis", "Selected Analyses", "Matrix", "Current Matrix View", "Conflicts", "Shared Dependencies",
  "Agreements", "Opportunities", "Mitigations", "Coordination Actions", "Scenario Comparison",
  "Version Comparison", "Decision Context Package", "Full Analysis",
];
export const exportOptions = [
  "Persona Results", "Persona Versions", "Conditions", "Matrix Cells", "Intersections", "Dependencies",
  "Conflicts", "Opportunities", "Evidence", "Mitigations", "Acknowledgements", "Coordination Actions",
  "Escalations", "History",
];

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const head = Object.keys(rows[0]);
  return [head.join(","), ...rows.map((r) => head.map((h) => csvCell(r[h])).join(","))].join("\n");
}

export function toYaml(value: unknown, indent = 0): string {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value.map((v) => (typeof v === "object" && v !== null
      ? `${pad}-\n${toYaml(v, indent + 2)}`
      : `${pad}- ${String(v)}`)).join("\n");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      typeof v === "object" && v !== null ? `${pad}${k}:\n${toYaml(v, indent + 2)}` : `${pad}${k}: ${String(v)}`,
    ).join("\n");
  }
  return `${pad}${String(value)}`;
}

export function buildExportRows(
  scope: string, state: CtiAnalysisState, mitigations: CrossTeamMitigation[],
  records: CoordinationRecord[], acks: CrossTeamAcknowledgement[],
): Record<string, unknown>[] {
  switch (scope) {
    case "Conflicts":
      return conflictsFor(state).map((c) => ({ id: c.id, personaA: personaById(c.personaAId).name, personaB: personaById(c.personaBId).name, type: c.conflictType, severity: c.severity, status: c.status, coordination: c.potentialCoordination }));
    case "Shared Dependencies":
      return dependenciesFor(state).map((d) => ({ id: d.id, dependency: d.dependencyName, criticality: d.criticality, health: d.currentHealth, teams: d.affectedPersonaIds.length, status: d.status }));
    case "Agreements":
      return agreements.map((a) => ({ id: a.id, title: a.title, personas: a.personaIds.length, confidence: a.confidence }));
    case "Opportunities":
      return opportunities.map((o) => ({ id: o.id, title: o.title, benefit: o.benefitType, confidence: o.confidence }));
    case "Mitigations":
      return mitigations.map((m) => ({ id: m.id, title: m.title, owner: m.owner, original: m.originalSeverity, residual: m.residualSeverity, status: m.status }));
    case "Coordination Actions":
      return records.map((r) => ({ id: r.id, title: r.title, owner: r.primaryOwner, priority: r.priority, status: r.status, due: r.dueDate }));
    case "Scenario Comparison":
      return scenarioPresets.map((p) => ({ scenario: p.name, ...scenarioMetrics(p.params), personaScores: undefined }));
    case "Version Comparison":
      return compareVersions(seedVersions[0], seedVersions[seedVersions.length - 1]).map((r) => ({ field: r.field, from: r.left, to: r.right, state: r.state }));
    case "Matrix":
    case "Current Matrix View":
      return buildDimensionMatrix(state).map((c) => ({ id: c.id, persona: personaById(c.rowPersonaId).name, dimension: c.impactDimension ?? "—", direction: c.direction, severity: c.severity, confidence: c.confidence }));
    case "Decision Context Package":
      return acks.map((a) => ({ team: a.teamId, status: a.status, topFinding: a.topFinding, requiredAction: a.requiredAction }));
    default:
      return ctiPersonas.map((p) => ({ id: p.id, persona: p.name, team: p.team, score: personaScore(p.id, state), severity: p.highestSeverity, benefit: p.primaryBenefit, risk: p.primaryRisk }));
  }
}

/* ----------------------------------------------------------- demo story --- */

export interface StoryStep { id: number; title: string; caption: string; notes: string; target: string; action?: string }

export const storySteps: StoryStep[] = [
  { id: 1, title: "Teams Impacted", caption: "Persona Impact Analysis tells us how each team is affected. Cross Team Impact Analysis shows what happens when those perspectives intersect.", notes: "Anchor the audience on the shift from local to enterprise consequence.", target: "panel-kpis" },
  { id: 2, title: "Cross Team Matrix", caption: "The matrix preserves each team's perspective rather than averaging six teams into one enterprise score.", notes: "Point out that every Persona keeps its own row.", target: "panel-matrix" },
  { id: 3, title: "Payments and Fraud", caption: "Payments sees recovery opportunity while Fraud sees increased fraud exposure and service demand.", notes: "Both readings are correct; the tension is real.", target: "panel-cell", action: "select-payments-fraud" },
  { id: 4, title: "Shared Dependencies", caption: "The Fabric recognizes that multiple teams depend on the same services, so one local change can create coupled enterprise consequences.", notes: "Coupling is what turns a local change into an enterprise change.", target: "panel-dependencies" },
  { id: 5, title: "Fraud Decision Service", caption: "A single shared dependency connects Payments, Checkout, Fraud, and Site Reliability Engineering.", notes: "Four Personas, one service.", target: "panel-dependencies", action: "select-fraud-dependency" },
  { id: 6, title: "Cross Team Agreements", caption: "Not every intersection is a conflict. Teams often agree on controls such as progressive rollout, rollback thresholds, and dependency monitoring.", notes: "Coordination starts from agreement, not only from conflict.", target: "panel-agreements" },
  { id: 7, title: "Traffic Exposure 15%", caption: "As rollout scope changes, the matrix immediately activates a cross team governance requirement involving Payments Reliability and Fraud Engineering.", notes: "Watch the governance row light up.", target: "panel-scenario", action: "traffic-15" },
  { id: 8, title: "Quarter End Window", caption: "The same proposal now creates a material Release Governance intersection because timing changed.", notes: "Nothing about the change itself moved — only the window.", target: "panel-scenario", action: "quarter-end" },
  { id: 9, title: "Coordinated Mitigation", caption: "A mitigation can address multiple team concerns at once, but its tradeoffs remain visible.", notes: "Tradeoffs are never collapsed into one number.", target: "panel-mitigation-planner" },
  { id: 10, title: "Apply Mitigations", caption: "Residual impact is recalculated without erasing the original findings that led to the mitigation.", notes: "Raw and residual are shown side by side.", target: "panel-raw-coordinated", action: "apply-mitigations" },
  { id: 11, title: "Ownership and Acknowledgement", caption: "Teams remain autonomous, but ownership, evidence, and required coordination are explicit.", notes: "Acknowledgement is not approval.", target: "panel-acknowledgement" },
  { id: 12, title: "Decision Context Package", caption: "The result is a structured enterprise context package for Decision Intelligence, preserving both agreements and unresolved tradeoffs.", notes: "This page never issues the decision.", target: "panel-decision-package" },
];

/* -------------------------------------------------------- demo scenarios -- */

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  params: Partial<ScenarioParams>;
  accepted?: string[];
  ackOverride?: Partial<Record<string, AckStatus>>;
  coordinationOverride?: Partial<Record<string, CoordinationStatus>>;
  escalate?: boolean;
  note: string;
}

export const demoScenarios: DemoScenario[] = [
  { id: "DS 1", name: "Healthy Cross Team Portfolio", description: "Low exposure, all evidence present", params: { maxTraffic: 5, fraudLossEvidence: true, idempotencyEvidence: true, dependencyLoadEvidence: true, progressiveRollout: true, deploymentTiming: "Standard window" }, accepted: ["CTM 1001", "CTM 1002"], note: "All Personas acknowledged, no active governance requirement" },
  { id: "DS 2", name: "Critical Shared Dependency", description: "Fraud Decision Service becomes critical", params: { maxTraffic: 25, fraudLossEvidence: false, dependencyLoadEvidence: false }, note: "Dependency criticality escalates to Critical" },
  { id: "DS 3", name: "High Fraud Conflict", description: "Fraud exposure conflict at scale", params: { maxTraffic: 50, fraudLossEvidence: false }, note: "Checkout and Fraud conflict rises to Critical" },
  { id: "DS 4", name: "High Reliability Conflict", description: "Dependency protection versus retry recovery", params: { maxTraffic: 50, dependencyLoadEvidence: false }, note: "SRE and Checkout dependency conflict is active" },
  { id: "DS 5", name: "Approval Threshold Triggered", description: "Traffic exceeds the 10% governance threshold", params: { maxTraffic: 15 }, note: "Joint approval coordination action activates" },
  { id: "DS 6", name: "Quarter End Restriction Triggered", description: "Deployment moves into the restricted window", params: { maxTraffic: 15, deploymentTiming: "Quarter end window" }, note: "Release Governance conflict becomes Critical" },
  { id: "DS 7", name: "Evidence Missing", description: "Fraud and idempotency evidence withdrawn", params: { fraudLossEvidence: false, idempotencyEvidence: false }, note: "Service state moves to Needs Evidence" },
  { id: "DS 8", name: "Dependency Capacity Unknown", description: "No dependency load evidence", params: { dependencyLoadEvidence: false, maxTraffic: 25 }, note: "Dependency stress test becomes mandatory" },
  { id: "DS 9", name: "Progressive Rollout Disabled", description: "Full exposure without staging", params: { maxTraffic: 100, progressiveRollout: false }, note: "Critical cells increase and confidence falls" },
  { id: "DS 10", name: "Shared Mitigation Applied", description: "Progressive rollout and load test accepted", params: { maxTraffic: 15, dependencyLoadEvidence: true }, accepted: ["CTM 1001", "CTM 1003"], note: "Residual severities fall while raw findings remain" },
  { id: "DS 11", name: "Coordination Owner Missing", description: "Joint approval remains proposed", params: { maxTraffic: 15 }, coordinationOverride: { "CCA 1104": "Proposed", "CCA 1105": "Proposed" }, note: "Routing records unresolved ownership as a warning" },
  { id: "DS 12", name: "Team Acknowledgement Pending", description: "Two teams have not acknowledged", params: {}, ackOverride: { "PER 4103": "Pending", "PER 4106": "Pending" }, note: "Acknowledgement coverage falls" },
  { id: "DS 13", name: "Team Disagrees", description: "Fraud Engineering disagrees with the synthesis", params: { fraudLossEvidence: false }, ackOverride: { "PER 4103": "Disagrees" }, note: "Disagreement is preserved, not resolved away" },
  { id: "DS 14", name: "Persona Version Changed", description: "Payments Persona moves to v3.4", params: { maxTraffic: 15 }, note: "Approval threshold tightens to 10% traffic" },
  { id: "DS 15", name: "Condition Version Changed", description: "Quarter end restriction shortened", params: { deploymentTiming: "Quarter end window" }, note: "Governance conflict applies to a narrower window" },
  { id: "DS 16", name: "Escalation Created", description: "Unresolved dependency risk escalated", params: { maxTraffic: 50, dependencyLoadEvidence: false }, escalate: true, note: "Escalation record created for executive tradeoff" },
  { id: "DS 17", name: "Analysis Recalculated", description: "Reanalysis produces a new version", params: { maxTraffic: 15, dependencyLoadEvidence: true }, note: "Prior versions are preserved" },
  { id: "DS 18", name: "Decision Context Ready", description: "All evidence, ownership and acknowledgement in place", params: { maxTraffic: 10, fraudLossEvidence: true, idempotencyEvidence: true, dependencyLoadEvidence: true }, accepted: ["CTM 1001", "CTM 1002", "CTM 1003", "CTM 1004"], coordinationOverride: { "CCA 1104": "Complete", "CCA 1103": "Complete" }, ackOverride: { "PER 4103": "Acknowledged", "PER 4106": "Acknowledged with Conditions" }, note: "Readiness reaches Decision Context Ready" },
  { id: "DS 0", name: "Reset Demo Data", description: "Return to the seeded baseline", params: { ...baselineParams }, accepted: [], note: "All operational overlays cleared" },
];

export const workItemSummary = proposedChange;
