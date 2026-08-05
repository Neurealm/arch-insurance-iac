/**
 * AIM-005 — Model training, validation, drift and governance data model.
 *
 * Every record below is a synthetic Taara-aligned demonstration fixture. No
 * real training run, deployment, security review or approval is represented.
 */

/* ------------------------------ shared enums ------------------------------ */

export type LifecycleTab =
  | "Training Data"
  | "Validation"
  | "Backtesting"
  | "Explainability"
  | "Drift"
  | "Governance";

export type GateStatus = "Pass" | "Conditional Pass" | "Review" | "Fail" | "Insufficient Evidence";

export type DriftStatus = "Stable" | "Watch" | "Action Required" | "Blocking" | "Insufficient Evidence";

export type RetrainingLevel =
  | "Retraining Required"
  | "Retraining Recommended"
  | "Monitor"
  | "No Action";

export type QualityTreatment =
  | "Imputed"
  | "Excluded"
  | "Flagged"
  | "Down-weighted"
  | "Retained with quality feature";

export type PredictionClassification =
  | "Correct Prediction"
  | "False Positive"
  | "Missed Event"
  | "Correct No-Risk"
  | "Insufficient Evidence";

export type CoverageDimension =
  | "Regions"
  | "Products"
  | "Link distances"
  | "Environmental conditions"
  | "Customer-service types"
  | "Risk classes"
  | "Incident severities"
  | "Fallback configurations"
  | "Firmware cohorts"
  | "Site types";

/* ------------------------------ training data ----------------------------- */

export interface TrainingDataset {
  id: string;
  version: string;
  label: string;
  totalSamples: number;
  totalSamplesLabel: string;
  windowStart: string;
  windowEnd: string;
  windowLabel: string;
  qualityScorePct: number;
  lineageStatus: "Complete" | "Partial" | "Missing";
  priorVersion: string | null;
}

export interface TrainingDatasetComposition {
  key: string;
  label: string;
  sharePct: number;
  priorSharePct: number;
  samples: number;
  color: string;
  description: string;
}

export interface TrainingCoverageRecord {
  dimension: CoverageDimension;
  key: string;
  label: string;
  sharePct: number;
  samples: number;
  /** Share of the live operating estate, used to judge representativeness. */
  estateSharePct: number;
}

export interface ClassBalanceRecord {
  key: string;
  label: string;
  naturalPct: number;
  trainingPct: number;
  technique: string;
}

export interface DataQualityRecord {
  key: string;
  label: string;
  affectedPct: number;
  treatment: QualityTreatment;
  note: string;
}

export interface TrainingProvenanceRecord {
  id: string;
  source: string;
  owner: string;
  collectionPeriod: string;
  schemaVersion: string;
  transformationVersion: string;
  qualityResult: string;
  lineageStatus: "Complete" | "Partial" | "Missing";
  approvalStatus: "Approved" | "Conditional" | "Pending";
  retention: string;
  region: string;
}

export interface SamplingStrategyRecord {
  key: string;
  label: string;
  detail: string;
}

/* -------------------------------- validation ------------------------------ */

export interface ValidationSummaryMetric {
  key: string;
  label: string;
  value: number;
  unit: "%" | "min";
  target: number;
  /** true when a higher value is better. */
  higherIsBetter: boolean;
  description: string;
}

export interface ValidationSegment {
  id: string;
  dimension: string;
  label: string;
  samples: number;
  accuracyPct: number;
  falsePositivePct: number;
  missedEventPct: number;
  meanWarningMinutes: number;
  calibrationErrorPct: number;
  critical: boolean;
}

export interface ValidationResultRecord extends ValidationSegment {
  status: GateStatus;
}

export interface ValidationSplit {
  key: "Training" | "Validation" | "Final Holdout";
  label: string;
  window: string;
  samples: number;
  sharePct: number;
}

export interface ModelReleaseGate {
  id: string;
  label: string;
  target: string;
  targetValue: number;
  actualValue: number;
  unit: "%" | "min" | "boolean";
  higherIsBetter: boolean;
  critical: boolean;
  evidence: string;
  reviewer: string;
  reviewDate: string;
}

export interface ValidationResult {
  version: string;
  summary: ValidationSummaryMetric[];
  segments: ValidationSegment[];
  splits: ValidationSplit[];
  holdoutRules: string[];
}

/* ------------------------------- backtesting ------------------------------ */

export interface BacktestPoint {
  month: string;
  accuracyPct: number;
  customerImpactRecallPct: number;
  falsePositivePct: number;
  meanWarningMinutes: number;
  preventiveEffectivenessPct: number;
}

export interface BacktestSeries {
  version: string;
  region: string;
  product: string;
  points: BacktestPoint[];
}

export interface BacktestAnnotation {
  id: string;
  month: string;
  kind:
    | "Model retraining"
    | "Threshold change"
    | "Weather-source outage"
    | "Firmware cohort addition"
    | "Data-quality incident"
    | "Model promotion"
    | "Rollback test"
    | "Major regional event";
  summary: string;
}

export interface BacktestEvent {
  id: string;
  event: string;
  region: string;
  linkId: string;
  date: string;
  driver: string;
  predictionScore: number;
  predictedEta: string;
  actualOutcome: string;
  actionTaken: string;
  customerImpact: string;
  classification: PredictionClassification;
  evidenceQuality: "Complete" | "Partial" | "Missing";
}

export interface BacktestSummary {
  months: number;
  meanAccuracyPct: number;
  meanFalsePositivePct: number;
  meanWarningMinutes: number;
  bestMonth: string;
  worstMonth: string;
  trend: "improving" | "declining" | "flat";
}

/* ------------------------------ explainability ---------------------------- */

export interface ExplainabilityValidationRecord {
  id: string;
  predictionId: string;
  linkId: string;
  primaryFactor: string;
  evidenceCompletenessPct: number;
  factorStabilityPct: number;
  humanAgreement: "Agree" | "Partial" | "Disagree";
  ruleOverride: boolean;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  missingEvidence: string[];
  explanationConfidencePct: number;
  explanationLatencyMs: number;
}

export interface ExplainabilityQuality {
  completeEvidencePct: number;
  stableFactorRankingPct: number;
  similarEventSupportPct: number;
  humanAgreementPct: number;
  fastExplanationPct: number;
  ruleOverridePct: number;
  status: GateStatus;
}

/* ---------------------------------- drift --------------------------------- */

export interface DriftMetric {
  id: string;
  label: string;
  category:
    | "Input Data Drift"
    | "Feature Drift"
    | "Prediction Drift"
    | "Calibration Drift"
    | "Regional Drift"
    | "Product Drift"
    | "Weather-Pattern Drift"
    | "Service-Mix Drift"
    | "Firmware-Cohort Drift"
    | "Data-Quality Drift";
  score: number;
  threshold: number;
  trend: "rising" | "falling" | "flat";
  scope: string;
  operationalEffect: string;
  recommendedResponse: string;
  owner: string;
  lastEvaluated: string;
  blocking: boolean;
  evidenceComplete: boolean;
  trainingDistribution: { bucket: string; sharePct: number }[];
  currentDistribution: { bucket: string; sharePct: number }[];
  affectedPredictions: number;
  history: { month: string; score: number }[];
}

export interface DriftAssessment {
  metrics: (DriftMetric & { status: DriftStatus })[];
  worstStatus: DriftStatus;
  blockingCount: number;
  actionCount: number;
  watchCount: number;
}

export type DriftSimulationKey =
  | "weather-pattern"
  | "new-product-cohort"
  | "sensor-calibration"
  | "regional-data-loss"
  | "model-calibration"
  | "none";

export interface RetrainingRecommendation {
  level: RetrainingLevel;
  reasons: string[];
  score: number;
  recommendedBy: string;
  targetWindow: string;
}

/* ------------------------------- governance ------------------------------- */

export interface ModelVersion {
  id: string;
  version: string;
  label: string;
  status: "Retired" | "Superseded" | "Active" | "Candidate";
  modelType: string;
  trainingDataVersion: string;
  featureSetVersion: string;
  ruleSetVersion: string;
  deploymentStatus: string;
  runtimeLocation: string;
  trainedOn: string;
  promotedOn: string | null;
  accuracyPct: number;
  meanWarningMinutes: number;
  falsePositivePct: number;
  missedEventPct: number;
  coveragePct: number;
  calibrationErrorPct: number;
  regionPerformance: { region: string; accuracyPct: number }[];
  productPerformance: { product: string; accuracyPct: number }[];
  inferenceCostPer1k: number;
  runtimeLatencyMs: number;
}

export interface ModelApproval {
  id: string;
  approvalType: string;
  version: string;
  approver: string;
  decision: "Approved" | "Conditionally approved" | "Rejected" | "Pending";
  conditions: string;
  timestamp: string;
  evidence: string;
  changeRecord: string;
}

export interface ModelGovernanceRecord {
  activeVersion: string;
  rollbackVersion: string;
  candidateVersion: string;
  status: string;
  owner: string;
  approvalDate: string;
  nextReview: string;
  ownership: { role: string; name: string }[];
  securityReview: { item: string; value: string; status: GateStatus }[];
  explainabilityReview: { item: string; value: string; status: GateStatus }[];
  operationalReview: { item: string; value: string; status: GateStatus }[];
  rollbackReadiness: { item: string; value: string; ready: boolean }[];
  retirementConditions: string[];
  openRisks: { id: string; risk: string; severity: "Low" | "Medium" | "High"; owner: string; state: string }[];
  requiredActions: { id: string; action: string; owner: string; due: string }[];
}

export interface ModelPromotionDecision {
  eligible: boolean;
  blockers: string[];
  warnings: string[];
  requiredApprovers: string[];
  steps: { key: string; label: string; passed: boolean; detail: string }[];
}

export interface ModelRollbackDecision {
  ready: boolean;
  blockers: string[];
  activeVersion: string;
  rollbackVersion: string;
  estimatedMinutes: number;
  validationPlan: string[];
  requiredApprover: string;
}

export interface ModelLifecycleActivity {
  id: string;
  at: string;
  event: string;
  version: string;
  actor: string;
  result: string;
  scope: string;
  evidence: string;
  changeRecord: string;
  status: "Complete" | "In progress" | "Blocked" | "Informational";
}

export interface ModelLimitation {
  id: string;
  limitation: string;
  scope: string;
  mitigation: string;
}

export interface ModelEvidenceRecord {
  id: string;
  artifact: string;
  kind: string;
  owner: string;
  producedOn: string;
  status: "Complete" | "Partial" | "Missing";
  location: string;
}

export interface ModelVersionTimelineEvent {
  id: string;
  at: string;
  version: string;
  title: string;
  detail: string;
  kind: "trained" | "approved" | "promoted" | "rollback-test" | "validation" | "review";
}

export interface GovernanceNote {
  id: string;
  at: string;
  author: string;
  note: string;
}

export interface GovernanceReadiness {
  scorePct: number;
  status: GateStatus;
  passedGates: number;
  totalGates: number;
  failedCriticalGates: string[];
}
