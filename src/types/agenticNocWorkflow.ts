// SRE Based Agentic NOC — Stage 2 workflow types.
// Stage 1 types remain in `agenticOpticalOperations.ts` and are not modified.

import type {
  AutonomyPolicy, RiskLevel, ValidationState,
} from "./agenticOpticalOperations";

/** Full situation lifecycle used by the Stage 2 situation workspace. */
export const SITUATION_LIFECYCLE = [
  "Detected", "Correlated", "Investigating", "Mitigating", "Recovering",
  "Validating", "Monitoring", "Resolved", "Learning",
] as const;
export type LifecycleStage = (typeof SITUATION_LIFECYCLE)[number];

export interface LifecycleEntry {
  stage: LifecycleStage;
  state: "completed" | "current" | "pending";
  timestamp?: string;
  owner: string;
  decision: string;
}

export type EvidenceCategory =
  | "Telemetry" | "Weather" | "Topology" | "Customer impact" | "Change"
  | "Capacity" | "Historical incident" | "Maintenance" | "Diagnostic result";

export type EvidenceSource =
  | "Optical telemetry" | "Weather data" | "Terminal diagnostics" | "Network telemetry"
  | "Change history" | "Customer experience" | "Historical incidents"
  | "Maintenance records" | "Capacity trends";

export interface EvidenceItem {
  id: string;
  situationId: string;
  category: EvidenceCategory;
  source: EvidenceSource;
  timestamp: string;
  freshnessSeconds: number;
  signal: string;
  observedValue: string;
  expectedValue: string;
  supportsHypothesisIds: string[];
  contradictsHypothesisIds: string[];
  reliability: number;
  relatedObject: string;
  /** Only revealed after an operator requests additional evidence. */
  requestedOnly?: boolean;
}

export type ActionState =
  | "Recommended" | "Awaiting approval" | "Approved" | "Rejected" | "Executing"
  | "Paused" | "Validating" | "Completed" | "Failed" | "Rolled back";

export interface ExecutionStage {
  id: string;
  label: string;
  progressPercent: number;
  customersImpacted: number;
  detail: string;
}

export interface ActionWorkflowDefinition {
  id: string;
  actionId: string;
  reason: string;
  affectedServices: string[];
  customersProtected: number;
  operationalRisk: string;
  autonomyPolicy: AutonomyPolicy;
  requiredApprover: string;
  rollbackPlan: string[];
  rollbackDurationMinutes: number;
  rollbackRisk: string;
  rollbackApprovalRequired: boolean;
  executionPlan: ExecutionStage[];
  validationPlanSummary: string;
  guardrail: string;
}

export type ValidationTestStatus = "Not started" | "Running" | "Passed" | "Failed";

export interface ValidationTestDefinition {
  id: string;
  name: string;
  expected: string;
  observedOnPass: string;
  observedOnFail: string;
  required: boolean;
  evidenceId: string;
}

export interface ValidationTestResult {
  id: string;
  name: string;
  status: ValidationTestStatus;
  expected: string;
  observed: string;
  timestamp?: string;
  evidenceId: string;
  required: boolean;
}

export interface RerouteSimulation {
  riskId: string;
  currentRoute: string;
  proposedRoute: string;
  availableCapacityGbps: number;
  projectedUtilizationPercent: number;
  projectedLatencyMs: number;
  servicesProtected: string[];
  customersProtected: number;
  newRisksIntroduced: string[];
  rollbackPath: string;
  recommendation: string;
}

export type ErrorBudgetWindowLabel = "1 hour" | "6 hours" | "24 hours" | "7 days" | "30 days";

export interface ErrorBudgetWindow {
  window: ErrorBudgetWindowLabel;
  burnRate: number;
  budgetRemaining: number;
  availability: number;
}

export type LearningGovernanceState =
  | "Draft" | "Under review" | "Approved" | "Implemented" | "Rejected";

export interface Stage2LearningRecord {
  id: string;
  situationId: string;
  title: string;
  primaryCause: string;
  successfulAction: string;
  evidenceUsed: string[];
  runbookChange: string;
  monitoringImprovement: string;
  automationCandidate: string;
  owner: string;
  dueDate: string;
  governanceState: LearningGovernanceState;
}

export type WorkflowEventType =
  | "Anomaly detected" | "Risk predicted" | "Situation created" | "Investigation started"
  | "Hypothesis updated" | "Evidence added" | "Action recommended" | "Approval requested"
  | "Action approved" | "Action rejected" | "Automation started" | "Traffic shifted"
  | "Validation started" | "Validation passed" | "Validation failed" | "Rollback initiated"
  | "Situation resolved" | "Learning generated";

export type EventStreamFilter =
  | "All" | "Situations" | "Investigations" | "Actions" | "Risks" | "Validation" | "Learning";

export interface WorkflowEvent {
  id: string;
  timestamp: string;
  type: WorkflowEventType;
  object: string;
  agent: string;
  humanActor?: string;
  result: string;
  confidence?: number;
  evidenceRef?: string;
  category: Exclude<EventStreamFilter, "All">;
}

export interface ScenarioStep {
  index: number;
  title: string;
  operationalEffect: string;
  panelsAffected: string[];
}

export type AutoRefreshOption = "Off" | "30 seconds" | "60 seconds" | "5 minutes";

export interface RiskWorkflowRecord {
  riskId: string;
  currentMarginDb: number;
  predictedMarginDb: number;
  preventiveAction: string;
  region: string;
  riskLevel: RiskLevel;
}

export interface ActionRuntime {
  state: ActionState;
  progressPercent: number;
  executionStageIndex: number;
  approverName?: string;
  approvalNote?: string;
  approvedAt?: string;
  riskAcknowledged?: boolean;
  rejectionReason?: string;
  alternativeRequested?: string;
  evidenceRequested?: string;
  modificationNote?: string;
  validationState: ValidationState;
  rollbackReady: boolean;
  previousLinkStatus?: string;
}
