/**
 * RunOps Runbooks — canonical domain model.
 *
 * All entity types the application traffics in. Strict types only.
 * No runtime values live here — this file is types-only.
 */

/* ============================ Primitives ============================ */

export type Id<TBrand extends string> = string & { readonly __brand: TBrand };
export type IsoTimestamp = string;

export type TenantId          = Id<"Tenant">;
export type UserId            = Id<"User">;
export type TeamId            = Id<"Team">;
export type RoleId            = Id<"Role">;
export type ServiceId         = Id<"Service">;
export type ComponentId       = Id<"Component">;
export type DependencyId      = Id<"Dependency">;
export type CustomerJourneyId = Id<"CustomerJourney">;
export type SliId             = Id<"Sli">;
export type SloId             = Id<"Slo">;
export type TelemetrySeriesId = Id<"TelemetrySeries">;
export type AlertId           = Id<"Alert">;
export type EventId           = Id<"Event">;
export type RunbookId         = Id<"Runbook">;
export type RunbookVersionId  = Id<"RunbookVersion">;
export type RunbookStepId     = Id<"RunbookStep">;
export type RunbookTriggerId  = Id<"RunbookTrigger">;
export type RunbookTestId     = Id<"RunbookTest">;
export type CertificationId   = Id<"RunbookCertification">;
export type PolicyId          = Id<"Policy">;
export type PolicyDecisionId  = Id<"PolicyDecision">;
export type ApprovalId        = Id<"Approval">;
export type ExecutionId       = Id<"Execution">;
export type StepExecutionId   = Id<"StepExecution">;
export type EvidenceId        = Id<"EvidenceItem">;
export type IncidentId        = Id<"Incident">;
export type TimelineEventId   = Id<"IncidentTimelineEvent">;
export type HypothesisId      = Id<"Hypothesis">;
export type RemediationId     = Id<"RemediationOption">;
export type CommunicationId   = Id<"Communication">;
export type ChangeId          = Id<"Change">;
export type ProblemId         = Id<"Problem">;
export type KnownErrorId      = Id<"KnownError">;
export type PostmortemId      = Id<"Postmortem">;
export type CorrectiveActionId= Id<"CorrectiveAction">;
export type DigitalWorkerId   = Id<"DigitalWorker">;
export type CapabilityId      = Id<"WorkerCapability">;
export type ToolGrantId       = Id<"WorkerToolGrant">;
export type WorkerSessionId   = Id<"WorkerSession">;
export type WorkerEventId     = Id<"WorkerEvent">;
export type EvaluationId      = Id<"WorkerEvaluation">;
export type ConnectorId       = Id<"Connector">;
export type KnowledgeItemId   = Id<"KnowledgeItem">;
export type OperationsTaskId  = Id<"OperationsTask">;
export type NotificationId    = Id<"Notification">;
export type AuditEventId      = Id<"AuditEvent">;
export type ScenarioId        = Id<"Scenario">;
export type ScenarioStageId   = Id<"ScenarioStage">;
export type DomainEventId     = Id<"DomainEvent">;

/* ============================== Enums =============================== */

export type Environment = "Production" | "Staging" | "Development";
export type Region = "US Central" | "US East" | "EU West" | "APAC";
export type Tier = "Tier 1" | "Tier 2" | "Tier 3";
export type Severity = "SEV 1" | "SEV 2" | "SEV 3" | "SEV 4";

export type ServiceHealth =
  | "Healthy" | "At Risk" | "Degraded" | "Severely Degraded" | "Unavailable" | "Recovering";

export type IncidentState =
  | "Detected" | "Triaged" | "Declared" | "Investigating"
  | "Mitigating" | "Monitoring" | "Resolved" | "Closed";

export type ExecutionState =
  | "Pending" | "Awaiting Approval" | "Queued" | "Running" | "Paused"
  | "Validating" | "Rolling Back" | "Completed" | "Failed" | "Cancelled";

export type StepExecutionState =
  | "Pending" | "Running" | "Skipped" | "Succeeded" | "Failed" | "Compensated";

export type ApprovalState = "Pending" | "Approved" | "Denied" | "Expired" | "Revoked";

export type RunbookState =
  | "Draft" | "In Review" | "Approved" | "Certified" | "Published" | "Deprecated" | "Retired";

export type AutonomyLevel =
  | "Documentation Only" | "Human Guided" | "AI Recommended"
  | "Human Initiated Automation" | "Approval Gated Automation"
  | "Supervised Autonomous" | "Policy Bounded Autonomous";

export type Risk = "Low" | "Medium" | "High" | "Critical";
export type ChangeState = "Planned" | "Approved" | "Deploying" | "Deployed" | "Reverted" | "Failed";
export type ProblemState = "Open" | "Investigating" | "Known Error" | "Resolved" | "Closed";
export type PostmortemState = "Drafting" | "Review" | "Published" | "Archived";

export type ComponentKind =
  | "api" | "compute" | "database" | "cache" | "queue"
  | "network" | "identity" | "vendor" | "storage" | "function";

export type PolicyDecisionOutcome = "Allow" | "Require Approval" | "Deny";
export type WorkerStatus = "Idle" | "Investigating" | "Recommending" | "Executing" | "Validating" | "Paused" | "Disabled";
export type EvaluationOutcome = "Pass" | "Warn" | "Fail";
export type NotificationKind = "info" | "warning" | "critical" | "success";
export type CommunicationChannel = "Status Page" | "Email" | "Chat" | "Executive Brief" | "Customer Notice";

/* ============================ Core entities ========================= */

export interface Tenant {
  id: TenantId;
  name: string;
  slug: string;
}

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  permissions: readonly string[];
}

export interface User {
  id: UserId;
  tenantId: TenantId;
  name: string;
  email: string;
  roleIds: readonly RoleId[];
  teamIds: readonly TeamId[];
}

export interface Team {
  id: TeamId;
  tenantId: TenantId;
  name: string;
  memberUserIds: readonly UserId[];
  ownedServiceIds: readonly ServiceId[];
}

export interface ServiceOwner {
  serviceId: ServiceId;
  teamId: TeamId;
  primaryUserId: UserId;
  secondaryUserId?: UserId;
}

export interface Service {
  id: ServiceId;
  tenantId: TenantId;
  name: string;
  tier: Tier;
  environment: Environment;
  region: Region;
  health: ServiceHealth;
  componentIds: readonly ComponentId[];
  ownerTeamId: TeamId;
  dependsOnServiceIds: readonly ServiceId[];
  customerJourneyIds: readonly CustomerJourneyId[];
}

export interface Component {
  id: ComponentId;
  serviceId: ServiceId;
  name: string;
  kind: ComponentKind;
  health: ServiceHealth;
}

export interface Dependency {
  id: DependencyId;
  fromServiceId: ServiceId;
  toServiceId: ServiceId;
  criticality: "Hard" | "Soft";
  description: string;
}

export interface CustomerJourney {
  id: CustomerJourneyId;
  serviceId: ServiceId;
  name: string;
  description: string;
  steps: readonly string[];
}

/* ============================ Reliability =========================== */

export interface Sli {
  id: SliId;
  serviceId: ServiceId;
  name: string;
  unit: "percent" | "ms" | "count" | "ratio";
  queryRef: string;
}

export interface Slo {
  id: SloId;
  sliId: SliId;
  serviceId: ServiceId;
  target: number;
  window: "1h" | "24h" | "7d" | "30d" | "90d";
  description: string;
}

export interface ErrorBudget {
  sloId: SloId;
  window: Slo["window"];
  remainingPercent: number;
  burnRate: number;
  timeToExhaustionHours: number | null;
}

export interface TelemetryPoint {
  at: IsoTimestamp;
  value: number;
}

export interface TelemetrySeries {
  id: TelemetrySeriesId;
  serviceId: ServiceId;
  name: string;
  unit: "percent" | "ms" | "count" | "ratio";
  points: readonly TelemetryPoint[];
}

export interface Alert {
  id: AlertId;
  serviceId: ServiceId;
  sloId?: SloId;
  severity: Severity;
  title: string;
  firedAt: IsoTimestamp;
  state: "Firing" | "Acknowledged" | "Cleared";
}

export interface Event {
  id: EventId;
  at: IsoTimestamp;
  kind: "Deploy" | "ConfigChange" | "FeatureFlag" | "Runbook" | "Incident" | "Alert";
  actor: string;
  message: string;
  serviceId?: ServiceId;
}

/* ============================== Runbooks ============================ */

export interface RunbookStep {
  id: RunbookStepId;
  key: string;
  label: string;
  description: string;
  kind: "diagnose" | "mitigate" | "validate" | "rollback";
  autonomy: AutonomyLevel;
  requiredApproval: boolean;
  toolGrantIds: readonly ToolGrantId[];
}

export interface RunbookTrigger {
  id: RunbookTriggerId;
  runbookId: RunbookId;
  kind: "Alert" | "Incident" | "Schedule" | "Manual" | "Policy";
  expression: string;
}

export interface RunbookTest {
  id: RunbookTestId;
  runbookId: RunbookId;
  name: string;
  scenarioId: ScenarioId;
  expectedOutcome: "Mitigated" | "Rolled Back" | "Escalated";
}

export interface RunbookCertification {
  id: CertificationId;
  runbookId: RunbookId;
  versionId: RunbookVersionId;
  certifiedByUserId: UserId;
  certifiedAt: IsoTimestamp;
  expiresAt: IsoTimestamp;
  fitnessScore: number;
}

export interface RunbookVersion {
  id: RunbookVersionId;
  runbookId: RunbookId;
  version: string;
  state: RunbookState;
  steps: readonly RunbookStep[];
  changelog: string;
  createdAt: IsoTimestamp;
  createdByUserId: UserId;
}

export interface Runbook {
  id: RunbookId;
  tenantId: TenantId;
  title: string;
  serviceId: ServiceId;
  currentVersionId: RunbookVersionId;
  autonomy: AutonomyLevel;
  fitnessScore: number;
  state: RunbookState;
  ownerTeamId: TeamId;
  tags: readonly string[];
}

/* ============================ Governance ============================ */

export interface Policy {
  id: PolicyId;
  name: string;
  description: string;
  scope: "Global" | "Tenant" | "Service" | "Runbook";
  ruleExpression: string;
  requiresApproval: boolean;
}

export interface PolicyDecision {
  id: PolicyDecisionId;
  policyId: PolicyId;
  subjectId: string;
  decidedAt: IsoTimestamp;
  outcome: PolicyDecisionOutcome;
  rationale: string;
}

export interface Approval {
  id: ApprovalId;
  runbookId: RunbookId;
  executionId: ExecutionId;
  requestedByUserId: UserId | DigitalWorkerId;
  requestedAt: IsoTimestamp;
  state: ApprovalState;
  reason: string;
  decidedByUserId?: UserId;
  decidedAt?: IsoTimestamp;
}

/* ============================ Executions ============================ */

export interface StepExecution {
  id: StepExecutionId;
  executionId: ExecutionId;
  stepId: RunbookStepId;
  state: StepExecutionState;
  startedAt?: IsoTimestamp;
  endedAt?: IsoTimestamp;
  evidenceIds: readonly EvidenceId[];
  message?: string;
}

export interface Execution {
  id: ExecutionId;
  runbookId: RunbookId;
  runbookVersionId: RunbookVersionId;
  incidentId?: IncidentId;
  state: ExecutionState;
  startedAt?: IsoTimestamp;
  endedAt?: IsoTimestamp;
  approvalId?: ApprovalId;
  initiatedByUserId?: UserId;
  initiatedByWorkerId?: DigitalWorkerId;
  stepExecutionIds: readonly StepExecutionId[];
}

export interface EvidenceItem {
  id: EvidenceId;
  capturedAt: IsoTimestamp;
  kind: "log" | "metric" | "trace" | "query" | "screenshot" | "document";
  label: string;
  reference: string;
  hash: string;
}

/* ============================ Incidents ============================= */

export interface Incident {
  id: IncidentId;
  tenantId: TenantId;
  serviceId: ServiceId;
  title: string;
  severity: Severity;
  state: IncidentState;
  openedAt: IsoTimestamp;
  closedAt?: IsoTimestamp;
  commanderUserId?: UserId;
  commanderWorkerId?: DigitalWorkerId;
  summary: string;
  findings: readonly string[];
  runbookIds: readonly RunbookId[];
  changeIds: readonly ChangeId[];
}

export interface IncidentTimelineEvent {
  id: TimelineEventId;
  incidentId: IncidentId;
  at: IsoTimestamp;
  actor: string;
  kind: "state" | "hypothesis" | "action" | "communication" | "evidence";
  message: string;
}

export interface Hypothesis {
  id: HypothesisId;
  incidentId: IncidentId;
  statement: string;
  supportingEvidenceIds: readonly EvidenceId[];
  contradictoryEvidenceIds: readonly EvidenceId[];
  confidence: number;
  state: "Open" | "Confirmed" | "Rejected";
}

export interface RemediationOption {
  id: RemediationId;
  incidentId: IncidentId;
  title: string;
  description: string;
  runbookId?: RunbookId;
  estimatedRisk: Risk;
  confidence: number;
  selected: boolean;
}

export interface Communication {
  id: CommunicationId;
  incidentId: IncidentId;
  channel: CommunicationChannel;
  audience: string;
  sentAt?: IsoTimestamp;
  state: "Draft" | "Approved" | "Sent";
  content: string;
}

/* =========================== Change/Problem ========================= */

export interface Change {
  id: ChangeId;
  title: string;
  serviceId: ServiceId;
  deployedAt: IsoTimestamp;
  state: ChangeState;
  risk: Risk;
  linkedIncidentIds: readonly IncidentId[];
  approvedByUserId?: UserId;
}

export interface Problem {
  id: ProblemId;
  title: string;
  serviceId: ServiceId;
  state: ProblemState;
  linkedIncidentIds: readonly IncidentId[];
  openedAt: IsoTimestamp;
}

export interface KnownError {
  id: KnownErrorId;
  problemId: ProblemId;
  title: string;
  workaround: string;
  linkedRunbookIds: readonly RunbookId[];
}

export interface CorrectiveAction {
  id: CorrectiveActionId;
  postmortemId: PostmortemId;
  title: string;
  ownerTeamId: TeamId;
  dueAt: IsoTimestamp;
  state: "Open" | "In Progress" | "Done" | "Cancelled";
}

export interface Postmortem {
  id: PostmortemId;
  incidentId: IncidentId;
  state: PostmortemState;
  authorUserId: UserId;
  publishedAt?: IsoTimestamp;
  timelineEventIds: readonly TimelineEventId[];
  correctiveActionIds: readonly CorrectiveActionId[];
  summary: string;
  contributingFactors: readonly string[];
  whatWorked: readonly string[];
  whatDidNot: readonly string[];
}

/* ========================== Digital Workers ========================= */

export interface WorkerCapability {
  id: CapabilityId;
  workerId: DigitalWorkerId;
  name: string;
  description: string;
  autonomy: AutonomyLevel;
}

export interface WorkerToolGrant {
  id: ToolGrantId;
  workerId: DigitalWorkerId;
  toolName: string;
  scope: "Read" | "Write" | "Execute";
  requiresApproval: boolean;
}

export interface WorkerSession {
  id: WorkerSessionId;
  workerId: DigitalWorkerId;
  startedAt: IsoTimestamp;
  endedAt?: IsoTimestamp;
  contextIncidentId?: IncidentId;
  eventIds: readonly WorkerEventId[];
}

export interface WorkerEvent {
  id: WorkerEventId;
  workerId: DigitalWorkerId;
  sessionId: WorkerSessionId;
  at: IsoTimestamp;
  kind: "observation" | "hypothesis" | "recommendation" | "tool_call" | "handoff";
  message: string;
}

export interface WorkerEvaluation {
  id: EvaluationId;
  workerId: DigitalWorkerId;
  window: Slo["window"];
  outcome: EvaluationOutcome;
  score: number;
  notes: string;
}

export interface DigitalWorker {
  id: DigitalWorkerId;
  name: string;
  role: string;
  autonomy: AutonomyLevel;
  status: WorkerStatus;
  capabilityIds: readonly CapabilityId[];
  toolGrantIds: readonly ToolGrantId[];
}

/* ============================ Platform ============================== */

export interface Connector {
  id: ConnectorId;
  name: string;
  kind: "Observability" | "Ticketing" | "Chat" | "Cloud" | "Identity" | "Source Control" | "CMDB";
  state: "Not Configured" | "Connected" | "Error" | "Disabled";
}

export interface KnowledgeItem {
  id: KnowledgeItemId;
  title: string;
  serviceId?: ServiceId;
  kind: "runbook" | "postmortem" | "known_error" | "doc" | "policy";
  summary: string;
  ref: string;
}

export interface OperationsTask {
  id: OperationsTaskId;
  title: string;
  assignedTeamId: TeamId;
  state: "Todo" | "In Progress" | "Blocked" | "Done";
  dueAt?: IsoTimestamp;
  relatedIncidentId?: IncidentId;
}

export interface Notification {
  id: NotificationId;
  at: IsoTimestamp;
  kind: NotificationKind;
  title: string;
  detail?: string;
  read: boolean;
  targetUserId?: UserId;
}

export interface AuditEvent {
  id: AuditEventId;
  at: IsoTimestamp;
  actorRef: string;
  action: string;
  targetRef: string;
  detail?: string;
}

/* ============================== Scenario ============================ */

export interface ScenarioStage {
  id: ScenarioStageId;
  scenarioId: ScenarioId;
  index: number;
  label: string;
}

export interface Scenario {
  id: ScenarioId;
  name: string;
  description: string;
  stageIds: readonly ScenarioStageId[];
}
