/**
 * AIM-006 — Explainability, evidence, comparison and predictive protection
 * scenario types.
 *
 * Everything here is synthetic demonstration data. No production model, no
 * network action and no Taara integration is represented.
 */

export type EvidenceCategory =
  | "Weather Evidence"
  | "Optical Evidence"
  | "Terminal Evidence"
  | "Network Evidence"
  | "Customer and SLO Evidence"
  | "Historical Evidence"
  | "Fallback Evidence"
  | "Data Quality"
  | "Contradicting Evidence"
  | "Remaining Uncertainty";

export type EvidenceStance = "supports" | "contradicts" | "neutral";
export type EvidenceFreshness = "current" | "recent" | "stale" | "missing";
export type Reliability = "high" | "medium" | "low";

export interface EvidenceItem {
  id: string;
  category: EvidenceCategory;
  source: string;
  observation: string;
  value: string;
  unit: string;
  timestamp: string;
  freshness: EvidenceFreshness;
  reliability: Reliability;
  relevance: number;
  stance: EvidenceStance;
  interpretation: string;
  provenance: string;
  relatedFeature: string;
  relatedHypothesis: string;
  relatedSignal: string;
}

export interface SimilarEvent {
  id: string;
  name: string;
  region: string;
  product: string;
  linkDistanceKm: number;
  primaryDriver: string;
  environmentalSignature: string;
  opticalSignature: string;
  similarity: number;
  predictionScore: number;
  actualOutcome: string;
  customerImpact: string;
  actionTaken: string;
  recoveryResult: string;
  predictionAccuracy: string;
  evidenceQuality: string;
  operationalLesson: string;
}

export interface ComparisonStage {
  key: string;
  stage: string;
  traditional: string;
  agentic: string;
  systemsInvolved: string;
  engineeringOwner: string;
  operationalRisk: string;
  customerEffect: string;
  evidenceCreated: string;
  modernizationRequirement: string;
}

export interface ComparisonMetric {
  key: string;
  label: string;
  traditional: string;
  agentic: string;
}

export type ScenarioFailureKey =
  | "none"
  | "stale-weather"
  | "missing-telemetry"
  | "conflicting-forecasts"
  | "insufficient-fallback"
  | "validation-failure"
  | "false-positive"
  | "missed-event"
  | "successful-protection";

export interface ScenarioFailureOption {
  key: ScenarioFailureKey;
  label: string;
  effects: readonly string[];
}

export interface ScenarioStageDefinition {
  index: number;
  key: string;
  title: string;
  actor: string;
  summary: string;
  state: readonly string[];
  focus: "map" | "pipeline" | "analytics" | "governance" | "evidence" | "outcome";
}

export interface ScenarioStageState {
  index: number;
  key: string;
  title: string;
  actor: string;
  summary: string;
  state: readonly string[];
  focus: ScenarioStageDefinition["focus"];
  riskScore: number;
  confidencePct: number;
  etaLabel: string;
  fallbackReady: boolean;
  customerHealthy: boolean;
  approvalRequired: boolean;
  executionAllowed: boolean;
  pipelineStageKey: string;
  notes: readonly string[];
  blocked: boolean;
  blockedReason: string | null;
}

export type ApprovalState = "not-required" | "pending" | "approved" | "rejected" | "evidence-requested";

export interface ScenarioApprovalResult {
  required: boolean;
  state: ApprovalState;
  canExecute: boolean;
  reason: string;
  policyBasis: readonly string[];
}

export interface ScenarioOutcome {
  predictionResult: string;
  customerOutcome: string;
  capacityProtectedGbps: number;
  outageMinutesAvoided: number;
  sloImpact: string;
  errorBudgetPreservedPct: number;
  preventiveActionResult: string;
  validationResult: string;
  rollbackResult: string;
  evidenceCompletenessPct: number;
  learningRecorded: boolean;
  nextRecommendedImprovement: string;
}

export interface LearningUpdate {
  key: string;
  label: string;
  value: string;
  lifecycleState: "Proposed lifecycle update" | "Reviewed lifecycle update" | "Approved lifecycle update";
}

export interface ScenarioTimelineEvent {
  id: string;
  timestamp: string;
  stageIndex: number;
  stage: string;
  event: string;
  actor: string;
  object: string;
  input: string;
  output: string;
  evidence: string;
  policyState: string;
  customerState: string;
  status: "complete" | "active" | "blocked" | "pending";
}

export type ExplainTab =
  | "Model Overview"
  | "Current Prediction"
  | "Feature Contributions"
  | "Evidence"
  | "Similar Events"
  | "Performance"
  | "Governance"
  | "Limitations";

export type ScenarioPanelState = "ready" | "loading" | "empty" | "error";
