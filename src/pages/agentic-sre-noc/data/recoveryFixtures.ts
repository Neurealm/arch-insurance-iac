/**
 * Autonomous Recovery Monitor — synthetic fixtures.
 *
 * Continues the Chennai situation SIT-2026-0417 and approval request
 * APR-2026-0417-03 into controlled execution EXE-2026-0417-01. All customers,
 * services, links, terminals, regions, products, agents, owners, guardrails,
 * rollback steps and evidence identifiers are reused from the earlier Agentic
 * SRE NOC pages. Every value here is synthetic demonstration data.
 */

import { SITUATION_ID, fallbackState, situationHeader } from "./situationFixtures";
import { APPROVAL_ID, RECOMMENDATION_STATEMENT, SYNTHETIC_NOTE } from "./approvalFixtures";
import { INVESTIGATION_ID } from "./investigationFixtures";

export { SYNTHETIC_NOTE, SITUATION_ID, APPROVAL_ID, RECOMMENDATION_STATEMENT, INVESTIGATION_ID };

/* ------------------------------- identity -------------------------------- */

export const EXECUTION_ID = "EXE-2026-0417-01";

export const recoveryHeader = {
  executionId: EXECUTION_ID,
  situationId: SITUATION_ID,
  approvalId: APPROVAL_ID,
  investigationId: INVESTIGATION_ID,
  customer: situationHeader.customer ?? "Chennai Mobile Network",
  customerService: "Chennai Mobile Backhaul Service 041",
  opticalLink: "Chennai Mobile Backhaul 041",
  linkId: "lnk-chennai-041",
  region: "India South",
  product: "Lightbridge Pro",
  committedCapacity: "10 Gbps",
  approvedAction: RECOMMENDATION_STATEMENT,
  state: "Recovery monitoring" as const,
  currentStep: "Monitor optical recovery threshold",
  progress: 68,
  risk: "Moderate" as const,
  autonomyLevel: "Level 3, approved governed execution",
  executionOwner: "N. Iyer, Network Operations",
  primaryAgent: "Recovery Orchestrator Agent",
  startedAt: "11:06:42 UTC",
  elapsed: "11m 24s",
  estimatedCompletion: "11:36 UTC",
  customerServiceState: "Available with reduced capacity",
  rollbackReadiness: 100,
  guardrailState: "All blocking guardrails pass",
  lastTelemetry: "11:18:06 UTC",
  dataConfidence: "96 percent evidence completeness",
  recoveryObjective:
    "Restore full optical transport without creating customer impact or exceeding the service error budget.",
  trafficStatement: [
    "Priority traffic using RF fallback",
    "Nonpriority traffic using the recovering optical path",
    "Optical route under continuous validation",
    "Rollback route ready",
    "Customer service available with reduced capacity",
  ],
};

/* --------------------------- execution states ---------------------------- */

export const EXECUTION_STATES = [
  "Authorized",
  "Preflight validation",
  "Ready to execute",
  "Execution started",
  "Diagnostics running",
  "Traffic transition in progress",
  "Beam reacquisition in progress",
  "Fallback active",
  "Recovery monitoring",
  "Validation in progress",
  "Customer service validated",
  "Completed",
  "Paused",
  "Human intervention required",
  "Rollback initiated",
  "Rollback in progress",
  "Rolled back",
  "Failed",
  "Cancelled",
  "Expired",
] as const;
export type ExecutionState = (typeof EXECUTION_STATES)[number];

export interface ExecutionStateStage {
  state: ExecutionState;
  status: "Complete" | "Active" | "Pending" | "Not reached";
  entered: string;
  duration: string;
  owner: string;
  agent: string;
  requiredInput: string;
  validation: string;
  policyCheck: string;
  guardrail: string;
  exitCriteria: string;
  failureResponse: string;
}

export const executionStateStages: ExecutionStateStage[] = [
  { state: "Authorized", status: "Complete", entered: "11:06:42 UTC", duration: "0m 06s", owner: "R. Venkatesan", agent: "Recovery Orchestrator Agent", requiredInput: "Approved recommendation APR-2026-0417-03", validation: "Approval validity confirmed", policyCheck: "Passed", guardrail: "Passed", exitCriteria: "Two required approvals recorded", failureResponse: "Return to approval queue" },
  { state: "Preflight validation", status: "Complete", entered: "11:06:48 UTC", duration: "1m 02s", owner: "N. Iyer", agent: "Validation Agent", requiredInput: "Service baseline and route inventory", validation: "12 preflight checks passed", policyCheck: "Passed", guardrail: "Passed", exitCriteria: "All blocking preflight checks pass", failureResponse: "Hold execution, request human review" },
  { state: "Ready to execute", status: "Complete", entered: "11:07:50 UTC", duration: "0m 12s", owner: "N. Iyer", agent: "Recovery Orchestrator Agent", requiredInput: "Execution owner acknowledgement", validation: "Rollback readiness 100 percent", policyCheck: "Passed", guardrail: "Passed", exitCriteria: "Owner on console and rollback tested", failureResponse: "Await owner assignment" },
  { state: "Execution started", status: "Complete", entered: "11:08:02 UTC", duration: "0m 30s", owner: "Recovery Orchestrator Agent", agent: "Recovery Orchestrator Agent", requiredInput: "Execution plan v3", validation: "Step sequence accepted", policyCheck: "Passed", guardrail: "Passed", exitCriteria: "First step running", failureResponse: "Cancel before traffic movement" },
  { state: "Diagnostics running", status: "Complete", entered: "11:08:32 UTC", duration: "2m 04s", owner: "Optical Path Investigator", agent: "Optical Path Investigator", requiredInput: "Terminal and optical telemetry", validation: "38 of 39 diagnostics passed", policyCheck: "Passed", guardrail: "Passed", exitCriteria: "No blocking diagnostic failure", failureResponse: "Pause and escalate to optical engineering" },
  { state: "Fallback active", status: "Complete", entered: "11:10:36 UTC", duration: "Ongoing", owner: "RF Fallback Guardian", agent: "RF Fallback Guardian", requiredInput: "Fallback capacity validation", validation: "Headroom 48 percent", policyCheck: "Passed", guardrail: "Passed", exitCriteria: "Priority traffic protected", failureResponse: "Trigger rollback to alternate fiber" },
  { state: "Recovery monitoring", status: "Active", entered: "11:11:18 UTC", duration: "6m 48s", owner: "N. Iyer", agent: "Optical Path Investigator", requiredInput: "Link margin and visibility series", validation: "Sustained recovery timer running", policyCheck: "Passed", guardrail: "Warning on sustained margin", exitCriteria: "Link margin above 8.5 dB for 15 continuous minutes", failureResponse: "Reset the sustained timer and hold fallback" },
  { state: "Traffic transition in progress", status: "Pending", entered: "Not entered", duration: "—", owner: "N. Iyer", agent: "Recovery Orchestrator Agent", requiredInput: "Sustained recovery confirmation", validation: "Per increment customer validation", policyCheck: "Pending", guardrail: "Pending", exitCriteria: "Each increment validated before the next", failureResponse: "Return traffic to fallback" },
  { state: "Validation in progress", status: "Pending", entered: "Not entered", duration: "—", owner: "Validation Agent", agent: "Validation Agent", requiredInput: "Post transition telemetry", validation: "26 validation tests", policyCheck: "Pending", guardrail: "Pending", exitCriteria: "All blocking tests pass", failureResponse: "Trigger rollback on failure" },
  { state: "Customer service validated", status: "Pending", entered: "Not entered", duration: "—", owner: "Customer Impact Agent", agent: "Customer Impact Agent", requiredInput: "Downstream tower cluster telemetry", validation: "Delivered capacity at 10 Gbps", policyCheck: "Pending", guardrail: "Pending", exitCriteria: "Customer objectives met for 5 minutes", failureResponse: "Hold fallback and reopen investigation" },
  { state: "Completed", status: "Not reached", entered: "Not entered", duration: "—", owner: "R. Venkatesan", agent: "Evidence Curator", requiredInput: "Complete evidence package", validation: "Evidence completeness 100 percent", policyCheck: "Pending", guardrail: "Pending", exitCriteria: "Outcome and learning recorded", failureResponse: "Keep the situation open" },
];

/* -------------------------------- KPIs ----------------------------------- */

export interface RecoveryKpi {
  id: string;
  title: string;
  value: string;
  sub: string;
  status: "good" | "watch" | "risk" | "neutral";
  trend: "up" | "down" | "flat";
  previous: string;
  target: string;
  at: string;
  explain: string;
  synthetic?: boolean;
}

export const recoveryKpis: RecoveryKpi[] = [
  { id: "kpi-active", title: "Active Recoveries", value: "6", sub: "Three autonomous, three governed", status: "neutral", trend: "flat", previous: "6", target: "No target", at: "11:18:06 UTC", explain: "Governed and autonomous recovery operations currently executing across all regions." },
  { id: "kpi-progress", title: "Current Execution Progress", value: "68%", sub: "Recovery threshold monitoring", status: "watch", trend: "up", previous: "54%", target: "100 percent", at: "11:18:06 UTC", explain: "Weighted completion of the 22 step recovery workflow for the selected execution." },
  { id: "kpi-service", title: "Customer Service State", value: "Available", sub: "Priority traffic protected through RF fallback", status: "good", trend: "flat", previous: "Available", target: "Available", at: "11:18:00 UTC", explain: "Customer service availability computed from delivered capacity, latency and loss." },
  { id: "kpi-restored", title: "Traffic Restored", value: "6.9 Gbps", sub: "3.1 Gbps remains on fallback", status: "watch", trend: "up", previous: "6.9 Gbps", target: "10 Gbps on optical", at: "11:18:02 UTC", explain: "Traffic currently carried by the recovering optical path." },
  { id: "kpi-validation", title: "Validation Tests Passed", value: "8 of 10", sub: "Two sustained recovery checks pending", status: "watch", trend: "up", previous: "6 of 10", target: "10 of 10", at: "11:17:40 UTC", explain: "Blocking validation tests for the current execution stage." },
  { id: "kpi-rollback", title: "Rollback Readiness", value: "100%", sub: "Validated alternate routes available", status: "good", trend: "flat", previous: "100%", target: "100 percent", at: "11:16:55 UTC", explain: "Rollback route, capacity and evidence readiness for immediate reversal." },
  { id: "kpi-time", title: "Recovery Time", value: "11m 24s", sub: "From action authorization", status: "good", trend: "up", previous: "9m 12s", target: "Under 30m", at: "11:18:06 UTC", explain: "Elapsed governed execution time since the approved action was authorized." },
  { id: "kpi-avoided", title: "Customer Impact Avoided", value: "45 minutes", sub: "Synthetic demonstration estimate", status: "good", trend: "up", previous: "38 minutes", target: "Maximize", at: "11:18:06 UTC", explain: "Modelled outage minutes avoided versus a manual recovery baseline.", synthetic: true },
];

/* ---------------------------- recovery queue ----------------------------- */

export type RecoveryPriority = "P1" | "P2" | "P3";
export type GuardrailStatus = "Passed" | "Warning" | "Blocked" | "Triggered" | "Not applicable";
export type ValidationStatus = "Passed" | "Running" | "Pending sustained condition" | "Failed" | "Not started" | "Not applicable";

export interface RecoveryOperation {
  id: string;
  priority: RecoveryPriority;
  action: string;
  customer: string;
  customerService: string;
  region: string;
  product: string;
  situation: string;
  state: ExecutionState;
  currentStep: string;
  progress: number;
  serviceState: string;
  trafficState: string;
  risk: "Low" | "Moderate" | "High";
  autonomy: string;
  guardrail: GuardrailStatus;
  validation: ValidationStatus;
  rollbackReadiness: number;
  owner: string;
  agent: string;
  elapsed: string;
  lastUpdate: string;
  detail: string;
}

export const recoveryOperations: RecoveryOperation[] = [
  { id: EXECUTION_ID, priority: "P1", action: "Chennai governed return to optical transport", customer: "Chennai Mobile Network", customerService: "Chennai Mobile Backhaul Service 041", region: "India South", product: "Lightbridge Pro", situation: SITUATION_ID, state: "Recovery monitoring", currentStep: "Monitor optical recovery threshold", progress: 68, serviceState: "Available with reduced capacity", trafficState: "Split optical and RF fallback", risk: "Moderate", autonomy: "Level 3, approved governed execution", guardrail: "Passed", validation: "Pending sustained condition", rollbackReadiness: 100, owner: "N. Iyer, Network Operations", agent: "Recovery Orchestrator Agent", elapsed: "11m 24s", lastUpdate: "11:18:06 UTC", detail: "Priority traffic held on RF fallback while the optical path is validated for sustained recovery." },
  { id: "EXE-2026-0402-01", priority: "P2", action: "Mumbai beam reacquisition", customer: "Mumbai Metro Carrier", customerService: "Mumbai Metro Transport Service 118", region: "India West", product: "Lightbridge Pro", situation: "SIT-2026-0402", state: "Beam reacquisition in progress", currentStep: "Establish fine alignment", progress: 41, serviceState: "Available on alternate optical", trafficState: "Traffic on alternate optical route", risk: "Moderate", autonomy: "Level 3, approved governed execution", guardrail: "Passed", validation: "Running", rollbackReadiness: 100, owner: "S. Krishnan, Optical Engineering", agent: "Beam Alignment Agent", elapsed: "6m 02s", lastUpdate: "11:17:48 UTC", detail: "Coarse alignment achieved. Fine alignment in progress with customer traffic protected." },
  { id: "EXE-2026-0388-01", priority: "P2", action: "Nairobi RF fallback capacity transition", customer: "Nairobi Regional", customerService: "Nairobi Metro Access Service 022", region: "Kenya Central", product: "Lightbridge Core", situation: "SIT-2026-0388", state: "Traffic transition in progress", currentStep: "Restore 50% of traffic to optical", progress: 74, serviceState: "Available", trafficState: "Incremental return to optical", risk: "Low", autonomy: "Level 4, autonomous within guardrails", guardrail: "Passed", validation: "Passed", rollbackReadiness: 100, owner: "Nairobi NOC duty engineer", agent: "RF Fallback Guardian", elapsed: "14m 51s", lastUpdate: "11:17:31 UTC", detail: "Second increment restored with customer validation passing on each step." },
  { id: "EXE-2026-0391-01", priority: "P2", action: "Rio beam mesh traffic reroute", customer: "Rio Metro Broadband", customerService: "Rio Coastal Mesh Service 077", region: "Brazil South East", product: "Lightbridge Mesh", situation: "SIT-2026-0391", state: "Validation in progress", currentStep: "Validate throughput and latency", progress: 86, serviceState: "Available", trafficState: "Traffic on mesh alternate path", risk: "Low", autonomy: "Level 4, autonomous within guardrails", guardrail: "Passed", validation: "Running", rollbackReadiness: 100, owner: "Rio operations duty engineer", agent: "Validation Agent", elapsed: "22m 09s", lastUpdate: "11:16:58 UTC", detail: "Mesh reroute completed. Final throughput and latency validation running." },
  { id: "EXE-2026-0377-01", priority: "P1", action: "California alternate fiber route activation", customer: "Pacific Metro Networks", customerService: "California Coastal Transport Service 003", region: "United States West", product: "Lightbridge Pro", situation: "SIT-2026-0377", state: "Human intervention required", currentStep: "Validate alternate fiber route", progress: 33, serviceState: "Degraded", trafficState: "Partial traffic on alternate fiber", risk: "High", autonomy: "Level 2, recommend only", guardrail: "Blocked", validation: "Failed", rollbackReadiness: 82, owner: "Pacific NOC incident commander", agent: "Rollback Guardian", elapsed: "31m 44s", lastUpdate: "11:15:12 UTC", detail: "Partner fiber capacity below the required headroom. Human decision required before further traffic movement." },
  { id: "EXE-2026-0410-01", priority: "P3", action: "Regional telemetry ingestion service recovery", customer: "Taara internal platform", customerService: "India South telemetry ingestion", region: "India South", product: "Platform services", situation: "SIT-2026-0410", state: "Completed", currentStep: "Mark recovery complete", progress: 100, serviceState: "Available", trafficState: "Not applicable", risk: "Low", autonomy: "Level 5, autonomous with notification", guardrail: "Passed", validation: "Passed", rollbackReadiness: 100, owner: "Telemetry platform duty engineer", agent: "Recovery Orchestrator Agent", elapsed: "8m 17s", lastUpdate: "11:02:44 UTC", detail: "Ingestion pipeline restarted and telemetry freshness restored across the region." },
  { id: "EXE-2026-0405-01", priority: "P3", action: "Terminal configuration rollback", customer: "Jakarta Urban Access", customerService: "Jakarta Access Service 054", region: "Indonesia", product: "Lightbridge Core", situation: "SIT-2026-0405", state: "Rolled back", currentStep: "Record evidence", progress: 100, serviceState: "Available", trafficState: "Traffic on primary optical", risk: "Moderate", autonomy: "Level 3, approved governed execution", guardrail: "Passed", validation: "Passed", rollbackReadiness: 100, owner: "Jakarta operations owner", agent: "Rollback Guardian", elapsed: "12m 33s", lastUpdate: "10:58:20 UTC", detail: "Configuration change reverted after post change latency validation failed. Customer impact avoided." },
  { id: "EXE-2026-0399-01", priority: "P3", action: "Mount vibration monitoring escalation", customer: "Chennai Mobile Network", customerService: "Chennai Mobile Backhaul Service 041", region: "India South", product: "Lightbridge Pro", situation: "SIT-2026-0399", state: "Paused", currentStep: "Confirm terminal health", progress: 22, serviceState: "Available", trafficState: "Traffic on primary optical", risk: "Low", autonomy: "Level 2, recommend only", guardrail: "Warning", validation: "Not started", rollbackReadiness: 100, owner: "S. Krishnan, Optical Engineering", agent: "Beam Alignment Agent", elapsed: "3m 05s", lastUpdate: "11:12:02 UTC", detail: "Paused pending structural vibration evidence from the Chennai mount monitoring sensor." },
];

export const RECOVERY_COLUMNS = [
  { key: "priority", label: "Priority" },
  { key: "id", label: "Execution" },
  { key: "action", label: "Action" },
  { key: "customer", label: "Customer" },
  { key: "customerService", label: "Customer service" },
  { key: "region", label: "Region" },
  { key: "product", label: "Product" },
  { key: "situation", label: "Situation" },
  { key: "state", label: "Execution state" },
  { key: "currentStep", label: "Current step" },
  { key: "progress", label: "Progress" },
  { key: "serviceState", label: "Customer service state" },
  { key: "trafficState", label: "Traffic state" },
  { key: "risk", label: "Action risk" },
  { key: "autonomy", label: "Autonomy level" },
  { key: "guardrail", label: "Guardrail status" },
  { key: "validation", label: "Validation status" },
  { key: "rollbackReadiness", label: "Rollback readiness" },
  { key: "owner", label: "Execution owner" },
  { key: "agent", label: "Primary agent" },
  { key: "elapsed", label: "Elapsed time" },
  { key: "lastUpdate", label: "Last update" },
] as const;
export type RecoveryColumnKey = (typeof RECOVERY_COLUMNS)[number]["key"];

export const DEFAULT_RECOVERY_COLUMNS: RecoveryColumnKey[] = [
  "priority", "id", "action", "customer", "region", "state", "currentStep",
  "progress", "serviceState", "risk", "guardrail", "validation", "rollbackReadiness", "owner", "lastUpdate",
];

export const RECOVERY_GROUPINGS = [
  "No grouping", "Execution state", "Customer", "Region", "Product", "Autonomy level", "Rollback readiness",
] as const;
export type RecoveryGrouping = (typeof RECOVERY_GROUPINGS)[number];

export const savedRecoveryViews = [
  { name: "All active recoveries", filter: "all" },
  { name: "Governed executions", filter: "governed" },
  { name: "Autonomous executions", filter: "autonomous" },
  { name: "Needs human control", filter: "human" },
  { name: "Chennai region", filter: "india-south" },
] as const;

/* ------------------------ selected execution tabs ------------------------ */

export const EXECUTION_TABS = [
  "Summary", "Workflow", "Traffic", "Optical Recovery", "Diagnostics",
  "Validation", "Rollback", "Evidence", "Ownership", "History",
] as const;
export type ExecutionTab = (typeof EXECUTION_TABS)[number];

export const selectedExecution = {
  trafficDistribution: "6.9 Gbps optical, 3.1 Gbps RF fallback",
  opticalPathState: "Recovering, link margin 8.7 dB",
  fallbackStateLabel: fallbackState.status,
  validationState: "8 of 10 blocking tests passed",
  policyStatus: "Within policy",
  guardrailStatus: "All blocking guardrails pass",
  assignedAgents: 10,
  evidenceCount: 24,
  expectedCompletion: "11:36 UTC",
};

/* --------------------------- workflow steps ------------------------------ */

export type StepStatus =
  | "Not started" | "Ready" | "Running" | "Waiting" | "Awaiting human input"
  | "Passed" | "Failed" | "Skipped" | "Rolled back" | "Cancelled";

export interface WorkflowStep {
  n: number;
  name: string;
  status: StepStatus;
  owner: string;
  kind: "Agent" | "Human";
  start: string;
  duration: string;
  purpose: string;
  method: string;
  input: string;
  output: string;
  policy: string;
  guardrail: string;
  validation: string;
  evidence: string;
  failureResponse: string;
  retryPolicy: string;
  rollbackStep: string;
}

export const workflowSteps: WorkflowStep[] = [
  { n: 1, name: "Confirm action authorization", status: "Passed", owner: "Recovery Orchestrator Agent", kind: "Agent", start: "11:06:42 UTC", duration: "6s", purpose: "Confirm the approved recommendation is still valid for execution.", method: "Approval record verification", input: "APR-2026-0417-03 decision record", output: "Authorization confirmed, valid until 13:05 UTC", policy: "Passed", guardrail: "Passed", validation: "Passed", evidence: "re-authorization", failureResponse: "Return the action to the approval queue", retryPolicy: "No retry, human decision required", rollbackStep: "Not applicable" },
  { n: 2, name: "Validate policy and guardrails", status: "Passed", owner: "SLO Guardian", kind: "Agent", start: "11:06:48 UTC", duration: "14s", purpose: "Evaluate all blocking policy rules and guardrails before any change.", method: "Policy evaluation against live telemetry", input: "14 guardrails, 8 policy rules", output: "All blocking rules pass, one advisory warning", policy: "Passed", guardrail: "Warning", validation: "Passed", evidence: "re-policy", failureResponse: "Pause execution and require human decision", retryPolicy: "Re-evaluate every 30 seconds", rollbackStep: "Not applicable" },
  { n: 3, name: "Capture pre-action service baseline", status: "Passed", owner: "Customer Impact Agent", kind: "Agent", start: "11:07:02 UTC", duration: "22s", purpose: "Record the customer service state before any traffic movement.", method: "Service telemetry snapshot", input: "Delivered capacity, latency, loss, availability", output: "Baseline 8.6 Gbps, 7.8 ms, 0.008 percent loss", policy: "Passed", guardrail: "Passed", validation: "Passed", evidence: "re-baseline", failureResponse: "Hold execution until baseline is available", retryPolicy: "Two retries at 15 seconds", rollbackStep: "Restore baseline reference" },
  { n: 4, name: "Validate RF fallback capacity", status: "Passed", owner: "RF Fallback Guardian", kind: "Agent", start: "11:07:24 UTC", duration: "26s", purpose: "Confirm the fallback can protect priority traffic for the full recovery.", method: "Capacity and headroom validation", input: "6 Gbps fallback capacity, 3.1 Gbps load", output: "48 percent headroom, safe for 8 hours", policy: "Passed", guardrail: "Passed", validation: "Passed", evidence: "re-fallback", failureResponse: "Trigger rollback to alternate fiber", retryPolicy: "Continuous monitoring", rollbackStep: "Select rollback route" },
  { n: 5, name: "Validate alternate fiber route", status: "Passed", owner: "Rollback Guardian", kind: "Agent", start: "11:07:50 UTC", duration: "31s", purpose: "Confirm a validated rollback route remains available.", method: "Partner route capacity check", input: "Coastal Transit Partners alternate fiber", output: "10 Gbps available, 11.4 ms expected latency", policy: "Passed", guardrail: "Passed", validation: "Passed", evidence: "re-altroute", failureResponse: "Block execution, rollback readiness insufficient", retryPolicy: "Re-check every 5 minutes", rollbackStep: "Validate safest route" },
  { n: 6, name: "Confirm terminal health", status: "Passed", owner: "Optical Path Investigator", kind: "Agent", start: "11:08:21 UTC", duration: "44s", purpose: "Exclude terminal hardware faults before returning traffic.", method: "Terminal diagnostic sweep", input: "Terminal A and Terminal B telemetry", output: "All terminal diagnostics nominal", policy: "Passed", guardrail: "Passed", validation: "Passed", evidence: "re-terminal", failureResponse: "Escalate to optical engineering owner", retryPolicy: "One retry", rollbackStep: "Not applicable" },
  { n: 7, name: "Confirm optical link state", status: "Passed", owner: "Optical Path Investigator", kind: "Agent", start: "11:09:05 UTC", duration: "38s", purpose: "Establish the current optical link condition and trend.", method: "Optical telemetry correlation", input: "Link margin, attenuation, received power", output: "Margin 7.9 dB and improving", policy: "Passed", guardrail: "Passed", validation: "Passed", evidence: "re-optical", failureResponse: "Hold traffic on fallback", retryPolicy: "Continuous", rollbackStep: "Not applicable" },
  { n: 8, name: "Maintain priority traffic on fallback", status: "Passed", owner: "RF Fallback Guardian", kind: "Agent", start: "11:09:43 UTC", duration: "Ongoing", purpose: "Protect priority customer classes throughout the recovery.", method: "Traffic class policy hold", input: "Priority and control traffic classes", output: "3.1 Gbps protected on RF fallback", policy: "Passed", guardrail: "Passed", validation: "Passed", evidence: "re-traffic-hold", failureResponse: "Return all traffic to fallback and pause", retryPolicy: "Not applicable", rollbackStep: "Preserve current customer traffic" },
  { n: 9, name: "Monitor optical recovery threshold", status: "Running", owner: "Optical Path Investigator", kind: "Agent", start: "11:11:18 UTC", duration: "6m 48s", purpose: "Watch link margin against the validated recovery threshold.", method: "Sustained threshold monitoring", input: "Link margin series, visibility forecast", output: "Margin 8.7 dB, sustained 6m 48s of 15m", policy: "Passed", guardrail: "Warning", validation: "Pending sustained condition", evidence: "re-threshold", failureResponse: "Reset the sustained timer", retryPolicy: "Continuous", rollbackStep: "Not applicable" },
  { n: 10, name: "Validate sustained link margin", status: "Waiting", owner: "Validation Agent", kind: "Agent", start: "Not started", duration: "—", purpose: "Confirm margin remained above threshold for 15 continuous minutes.", method: "Sustained condition validation", input: "Continuous margin samples", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Pending sustained condition", evidence: "re-threshold", failureResponse: "Hold fallback and continue monitoring", retryPolicy: "Automatic on timer completion", rollbackStep: "Not applicable" },
  { n: 11, name: "Restore 25% of traffic to optical", status: "Not started", owner: "Recovery Orchestrator Agent", kind: "Agent", start: "Not started", duration: "—", purpose: "Move the first traffic increment back to the optical path.", method: "Incremental traffic policy change", input: "2.5 Gbps increment", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-increment-1", failureResponse: "Return the increment to fallback", retryPolicy: "One retry after validation", rollbackStep: "Transition traffic" },
  { n: 12, name: "Validate customer service", status: "Not started", owner: "Customer Impact Agent", kind: "Agent", start: "Not started", duration: "—", purpose: "Confirm the customer experience after the first increment.", method: "Customer service validation suite", input: "Delivered capacity, latency, loss", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-customer-1", failureResponse: "Trigger rollback", retryPolicy: "One retry", rollbackStep: "Validate customer service" },
  { n: 13, name: "Restore 50% of traffic to optical", status: "Not started", owner: "Recovery Orchestrator Agent", kind: "Agent", start: "Not started", duration: "—", purpose: "Move the second traffic increment back to the optical path.", method: "Incremental traffic policy change", input: "2.5 Gbps increment", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-increment-2", failureResponse: "Return the increment to fallback", retryPolicy: "One retry after validation", rollbackStep: "Transition traffic" },
  { n: 14, name: "Validate customer service", status: "Not started", owner: "Customer Impact Agent", kind: "Agent", start: "Not started", duration: "—", purpose: "Confirm the customer experience after the second increment.", method: "Customer service validation suite", input: "Delivered capacity, latency, loss", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-customer-2", failureResponse: "Trigger rollback", retryPolicy: "One retry", rollbackStep: "Validate customer service" },
  { n: 15, name: "Restore 100% of traffic to optical", status: "Not started", owner: "Recovery Orchestrator Agent", kind: "Agent", start: "Not started", duration: "—", purpose: "Return all remaining traffic to the primary optical path.", method: "Traffic policy change", input: "Remaining 3.1 Gbps", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-increment-3", failureResponse: "Return traffic to fallback", retryPolicy: "One retry", rollbackStep: "Transition traffic" },
  { n: 16, name: "Validate throughput and latency", status: "Not started", owner: "Validation Agent", kind: "Agent", start: "Not started", duration: "—", purpose: "Confirm full capacity and latency objectives on optical.", method: "Throughput and latency validation", input: "10 Gbps delivered, latency samples", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-final-throughput", failureResponse: "Trigger rollback", retryPolicy: "One retry", rollbackStep: "Transition traffic" },
  { n: 17, name: "Confirm fallback release readiness", status: "Not started", owner: "RF Fallback Guardian", kind: "Agent", start: "Not started", duration: "—", purpose: "Confirm the fallback can be safely released.", method: "Release readiness evaluation", input: "Optical stability window", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-release", failureResponse: "Keep fallback active", retryPolicy: "Continuous", rollbackStep: "Preserve current customer traffic" },
  { n: 18, name: "Close temporary fallback state", status: "Not started", owner: "N. Iyer, Network Operations", kind: "Human", start: "Not started", duration: "—", purpose: "Formally close the temporary fallback transport state.", method: "Human confirmation with agent evidence", input: "Release readiness record", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-release", failureResponse: "Retain fallback and escalate", retryPolicy: "Not applicable", rollbackStep: "Select rollback route" },
  { n: 19, name: "Recalculate SLO and error budget", status: "Not started", owner: "SLO Guardian", kind: "Agent", start: "Not started", duration: "—", purpose: "Recompute availability objective and error budget consumption.", method: "SLO recalculation", input: "Incident window telemetry", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-slo", failureResponse: "Flag for SRE owner review", retryPolicy: "One retry", rollbackStep: "Not applicable" },
  { n: 20, name: "Capture final evidence", status: "Not started", owner: "Evidence Curator", kind: "Agent", start: "Not started", duration: "—", purpose: "Assemble the complete execution evidence package.", method: "Evidence package assembly", input: "All step evidence records", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-package", failureResponse: "Mark evidence incomplete", retryPolicy: "Automatic", rollbackStep: "Record evidence" },
  { n: 21, name: "Record operational learning", status: "Not started", owner: "Recovery Orchestrator Agent", kind: "Agent", start: "Not started", duration: "—", purpose: "Retain the reusable recovery pattern and signatures.", method: "Learning capture", input: "Recovery outcome and diagnostics", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-learning", failureResponse: "Queue for human authoring", retryPolicy: "Not applicable", rollbackStep: "Not applicable" },
  { n: 22, name: "Mark recovery complete", status: "Not started", owner: "R. Venkatesan, Incident Commander", kind: "Human", start: "Not started", duration: "—", purpose: "Close the execution and hand the situation back to steady state.", method: "Human closure with complete evidence", input: "Evidence package and outcomes", output: "Pending", policy: "Pending", guardrail: "Pending", validation: "Not started", evidence: "re-closure", failureResponse: "Keep the situation open", retryPolicy: "Not applicable", rollbackStep: "Not applicable" },
];

export const STEP_STATUSES: StepStatus[] = [
  "Not started", "Ready", "Running", "Waiting", "Awaiting human input",
  "Passed", "Failed", "Skipped", "Rolled back", "Cancelled",
];

/* ------------------------ live service and routes ------------------------ */

export interface RouteObject {
  id: string;
  name: string;
  kind: "Node" | "Edge";
  health: "Healthy" | "At risk" | "Degraded" | "Unavailable";
  operationalState: string;
  owner: string;
  capacity: string;
  throughput: string;
  latency: string;
  packetLoss: string;
  step: string;
  agentActivity: string;
  validation: string;
  rollbackRelevance: string;
  trafficRole: "On optical" | "On RF fallback" | "Transitioning" | "Protected by alternate" | "Rollback available" | "Blocked";
}

export const routeObjects: RouteObject[] = [
  { id: "n-customer", name: "Customer network", kind: "Node", health: "Healthy", operationalState: "Nominal", owner: "Customer operations", capacity: "10 Gbps", throughput: "10 Gbps", latency: "1.1 ms", packetLoss: "0.001 percent", step: "Validate customer service", agentActivity: "Customer Impact Agent monitoring", validation: "Passed", rollbackRelevance: "Unaffected by rollback", trafficRole: "Protected by alternate" },
  { id: "n-edge", name: "Customer edge", kind: "Node", health: "Healthy", operationalState: "Nominal", owner: "Customer operations", capacity: "10 Gbps", throughput: "10 Gbps", latency: "1.4 ms", packetLoss: "0.001 percent", step: "Validate customer service", agentActivity: "Customer Impact Agent monitoring", validation: "Passed", rollbackRelevance: "Unaffected by rollback", trafficRole: "Protected by alternate" },
  { id: "n-partner", name: "Partner aggregation", kind: "Node", health: "Healthy", operationalState: "Nominal", owner: "Coastal Transit Partners", capacity: "20 Gbps", throughput: "10 Gbps", latency: "2.2 ms", packetLoss: "0.002 percent", step: "Validate alternate fiber route", agentActivity: "Rollback Guardian validating", validation: "Passed", rollbackRelevance: "Carries the rollback route", trafficRole: "Rollback available" },
  { id: "n-handoff", name: "Fiber handoff", kind: "Node", health: "Healthy", operationalState: "Nominal", owner: "Coastal Transit Partners", capacity: "20 Gbps", throughput: "10 Gbps", latency: "0.8 ms", packetLoss: "0.001 percent", step: "Validate alternate fiber route", agentActivity: "Rollback Guardian validating", validation: "Passed", rollbackRelevance: "Rollback ingress point", trafficRole: "Rollback available" },
  { id: "n-terminal-a", name: "Terminal A", kind: "Node", health: "Healthy", operationalState: "Beam lock maintained", owner: "Taara operations", capacity: "10 Gbps", throughput: "6.9 Gbps", latency: "0.4 ms", packetLoss: "0.004 percent", step: "Monitor optical recovery threshold", agentActivity: "Beam Alignment Agent monitoring", validation: "Passed", rollbackRelevance: "Released on rollback", trafficRole: "On optical" },
  { id: "e-primary", name: "Primary optical path", kind: "Edge", health: "At risk", operationalState: "Recovering, margin 8.7 dB", owner: "Taara operations", capacity: "10 Gbps", throughput: "6.9 Gbps", latency: "4.6 ms", packetLoss: "0.011 percent", step: "Monitor optical recovery threshold", agentActivity: "Optical Path Investigator monitoring", validation: "Pending sustained condition", rollbackRelevance: "Traffic removed on rollback", trafficRole: "Transitioning" },
  { id: "n-terminal-b", name: "Terminal B", kind: "Node", health: "Healthy", operationalState: "Beam lock maintained", owner: "Taara operations", capacity: "10 Gbps", throughput: "6.9 Gbps", latency: "0.4 ms", packetLoss: "0.004 percent", step: "Monitor optical recovery threshold", agentActivity: "Beam Alignment Agent monitoring", validation: "Passed", rollbackRelevance: "Released on rollback", trafficRole: "On optical" },
  { id: "e-rf", name: "RF fallback route", kind: "Edge", health: "Healthy", operationalState: "Active for priority traffic", owner: "Taara operations", capacity: "6 Gbps", throughput: "3.1 Gbps", latency: "7.8 ms", packetLoss: "0.008 percent", step: "Maintain priority traffic on fallback", agentActivity: "RF Fallback Guardian holding", validation: "Passed", rollbackRelevance: "Retained during rollback", trafficRole: "On RF fallback" },
  { id: "e-alt-fiber", name: "Alternate fiber route", kind: "Edge", health: "Healthy", operationalState: "Standby, validated", owner: "Coastal Transit Partners", capacity: "10 Gbps", throughput: "0 Gbps", latency: "11.4 ms", packetLoss: "0.003 percent", step: "Validate alternate fiber route", agentActivity: "Rollback Guardian validated", validation: "Passed", rollbackRelevance: "Primary rollback route", trafficRole: "Rollback available" },
  { id: "e-alt-optical", name: "Alternate optical path", kind: "Edge", health: "At risk", operationalState: "Standby, reduced margin", owner: "Taara operations", capacity: "8 Gbps", throughput: "0 Gbps", latency: "5.2 ms", packetLoss: "0.014 percent", step: "Validate alternate fiber route", agentActivity: "Optical Path Investigator evaluating", validation: "Not applicable", rollbackRelevance: "Secondary rollback route", trafficRole: "Blocked" },
  { id: "n-regional", name: "Regional aggregation", kind: "Node", health: "Healthy", operationalState: "Nominal", owner: "Taara operations", capacity: "40 Gbps", throughput: "10 Gbps", latency: "1.9 ms", packetLoss: "0.002 percent", step: "Validate throughput and latency", agentActivity: "Validation Agent sampling", validation: "Passed", rollbackRelevance: "Unaffected by rollback", trafficRole: "Protected by alternate" },
  { id: "n-towers", name: "Mobile tower clusters", kind: "Node", health: "Healthy", operationalState: "42,000 synthetic downstream users", owner: "Customer operations", capacity: "10 Gbps", throughput: "9.6 Gbps", latency: "3.1 ms", packetLoss: "0.006 percent", step: "Validate customer service", agentActivity: "Customer Impact Agent monitoring", validation: "Passed", rollbackRelevance: "Protected during rollback", trafficRole: "Protected by alternate" },
  { id: "n-downstream", name: "Downstream traffic", kind: "Node", health: "Healthy", operationalState: "Best effort classes reduced", owner: "Customer operations", capacity: "10 Gbps", throughput: "9.6 Gbps", latency: "3.4 ms", packetLoss: "0.006 percent", step: "Validate customer service", agentActivity: "Customer Impact Agent monitoring", validation: "Passed", rollbackRelevance: "Protected during rollback", trafficRole: "Protected by alternate" },
  { id: "n-power", name: "Backup power", kind: "Node", health: "Healthy", operationalState: "Utility power, generator standby", owner: "Taara operations", capacity: "Not applicable", throughput: "Not applicable", latency: "Not applicable", packetLoss: "Not applicable", step: "Confirm terminal health", agentActivity: "Optical Path Investigator verified", validation: "Passed", rollbackRelevance: "Supports both routes", trafficRole: "Protected by alternate" },
];

export const routeSummary = {
  activeRoute: "Split: primary optical 6.9 Gbps, RF fallback 3.1 Gbps",
  proposedRoute: "Primary optical 10 Gbps, RF fallback released",
  rollbackRoute: "RF fallback 6 Gbps with alternate fiber 10 Gbps standby",
};

/* -------------------------- traffic transition --------------------------- */

export interface TransitionStage {
  id: string;
  label: string;
  optical: number;
  fallback: number;
  altFiber: number;
  altOptical: number;
  moved: string;
  headroom: string;
  latency: string;
  lossThreshold: string;
  customerImpact: string;
  validation: ValidationStatus;
  guardrail: GuardrailStatus;
  rollbackTrigger: string;
}

export const transitionStages: TransitionStage[] = [
  { id: "ts-current", label: "Current state", optical: 6.9, fallback: 3.1, altFiber: 0, altOptical: 0, moved: "0 Gbps", headroom: "48 percent", latency: "7.8 ms priority, 4.6 ms best effort", lossThreshold: "Below 0.5 percent", customerImpact: "Reduced best effort capacity only", validation: "Passed", guardrail: "Passed", rollbackTrigger: "Margin falls below 8.5 dB" },
  { id: "ts-25", label: "25% restoration checkpoint", optical: 7.7, fallback: 2.3, altFiber: 0, altOptical: 0, moved: "0.8 Gbps", headroom: "62 percent", latency: "6.9 ms priority", lossThreshold: "Below 0.5 percent", customerImpact: "No customer impact expected", validation: "Not started", guardrail: "Passed", rollbackTrigger: "Customer validation fails" },
  { id: "ts-50", label: "50% restoration checkpoint", optical: 8.5, fallback: 1.5, altFiber: 0, altOptical: 0, moved: "1.6 Gbps", headroom: "75 percent", latency: "6.1 ms priority", lossThreshold: "Below 0.5 percent", customerImpact: "No customer impact expected", validation: "Not started", guardrail: "Passed", rollbackTrigger: "Latency exceeds 12 ms" },
  { id: "ts-75", label: "75% restoration checkpoint", optical: 9.2, fallback: 0.8, altFiber: 0, altOptical: 0, moved: "2.3 Gbps", headroom: "87 percent", latency: "5.4 ms priority", lossThreshold: "Below 0.5 percent", customerImpact: "No customer impact expected", validation: "Not started", guardrail: "Passed", rollbackTrigger: "Packet loss exceeds 0.5 percent" },
  { id: "ts-full", label: "Full optical restoration", optical: 10, fallback: 0, altFiber: 0, altOptical: 0, moved: "3.1 Gbps", headroom: "100 percent", latency: "4.6 ms all classes", lossThreshold: "Below 0.5 percent", customerImpact: "Full committed capacity restored", validation: "Not started", guardrail: "Passed", rollbackTrigger: "Any customer validation failure" },
  { id: "ts-release", label: "Fallback release", optical: 10, fallback: 0, altFiber: 0, altOptical: 0, moved: "0 Gbps", headroom: "Fallback returned to standby", latency: "4.6 ms all classes", lossThreshold: "Below 0.5 percent", customerImpact: "None", validation: "Not started", guardrail: "Passed", rollbackTrigger: "Fallback retained if optical destabilizes" },
];

export const TRAFFIC_LANES = [
  { key: "optical", label: "Primary optical path", color: "#059669" },
  { key: "fallback", label: "RF fallback", color: "#0284c7" },
  { key: "altOptical", label: "Alternate optical route", color: "#7c3aed" },
  { key: "altFiber", label: "Alternate fiber route", color: "#0f766e" },
] as const;

/* ---------------------------- RF fallback -------------------------------- */

export const rfFallback = {
  state: fallbackState.status,
  activatedAt: fallbackState.activatedAt,
  totalCapacity: 6,
  currentThroughput: 3.1,
  reserved: 1.2,
  criticalThreshold: 5.4,
  rollbackThreshold: 4.8,
  latency: "7.8 ms",
  packetLoss: "0.008 percent",
  availability: "99.997 percent during fallback",
  priorityProtected: fallbackState.protected,
  servicesSupported: "Chennai Mobile Backhaul Service 041 priority and control classes",
  safeDuration: fallbackState.safeDuration,
  policy: fallbackState.policy,
  lastValidation: fallbackState.lastValidation,
  releaseReadiness: fallbackState.returnReadiness,
};

export const fallbackGuardrails = [
  "Headroom must remain above 20%.",
  "Latency must remain below 12 ms.",
  "Packet loss must remain below 0.5%.",
  "Customer throughput must remain above temporary minimum.",
  "No additional critical service may be moved to fallback without approval.",
];

/* ------------------------ beam and optical recovery ---------------------- */

export const opticalRecovery = {
  terminalA: "Beam lock maintained",
  terminalB: "Beam lock maintained",
  beamLock: "Locked, no reacquisition required",
  reacquisitionAttempts: 0,
  reacquisitionDuration: "Not applicable",
  receivedPower: "-24.1 dBm",
  linkMargin: "8.7 dB",
  attenuation: "6.2 dB and declining",
  pointingError: "0.011 degrees",
  trackingCorrection: "4 corrections per minute",
  alignmentConfidence: "97 percent",
  weatherRecovery: "Fog dispersing, visibility 1,150 m and improving",
  recoveryThreshold: "8.5 dB sustained for 15 minutes",
  sustainedTimer: "6m 48s of 15m 00s",
  notes: [
    "Beam lock maintained",
    "No full beam reacquisition required",
    "Link margin improving",
    "Optical attenuation declining",
    "Visibility improving",
    "Sustained recovery timer active",
    "Return-to-optical criteria not yet fully satisfied",
  ],
};

export const marginSeries = [
  { t: "11:06", margin: 6.4, attenuation: 9.1, visibility: 480 },
  { t: "11:08", margin: 6.9, attenuation: 8.6, visibility: 560 },
  { t: "11:10", margin: 7.4, attenuation: 8.0, visibility: 690 },
  { t: "11:11", margin: 7.9, attenuation: 7.4, visibility: 780 },
  { t: "11:13", margin: 8.3, attenuation: 6.9, visibility: 890 },
  { t: "11:15", margin: 8.6, attenuation: 6.5, visibility: 1010 },
  { t: "11:17", margin: 8.7, attenuation: 6.2, visibility: 1150 },
];

export interface BeamStage {
  n: number;
  name: string;
  detail: string;
}

export const beamSequence: BeamStage[] = [
  { n: 1, name: "Confirm customer traffic protected", detail: "Customer traffic moved to alternate optical route before any beam operation." },
  { n: 2, name: "Confirm terminal health", detail: "Terminal diagnostics nominal on both ends." },
  { n: 3, name: "Pause optical traffic", detail: "Optical path drained to zero throughput." },
  { n: 4, name: "Initiate beam search", detail: "Search pattern started within the permitted pointing envelope." },
  { n: 5, name: "Establish coarse alignment", detail: "Coarse alignment achieved at 0.31 degrees pointing error." },
  { n: 6, name: "Establish fine alignment", detail: "Fine alignment converging toward 0.01 degrees." },
  { n: 7, name: "Confirm beam lock", detail: "Beam lock confirmed and held for 60 seconds." },
  { n: 8, name: "Validate received optical power", detail: "Received power within the expected range." },
  { n: 9, name: "Validate link margin", detail: "Link margin above the recovery threshold." },
  { n: 10, name: "Restore traffic incrementally", detail: "Traffic returned in validated increments." },
  { n: 11, name: "Confirm customer service", detail: "Customer objectives validated after restoration." },
  { n: 12, name: "Close recovery", detail: "Beam recovery closed with evidence captured." },
];

export const beamExecution = {
  id: "EXE-2026-0402-01",
  title: "Mumbai Beam Alignment Recovery",
  customer: "Mumbai Metro Carrier",
};

/* ---------------------------- diagnostics -------------------------------- */

export const DIAGNOSTIC_GROUPS = [
  "Terminal Diagnostics", "Optical Diagnostics", "Network Diagnostics",
  "Environmental Diagnostics", "Customer Service Diagnostics",
] as const;
export type DiagnosticGroup = (typeof DIAGNOSTIC_GROUPS)[number];

export interface Diagnostic {
  id: string;
  group: DiagnosticGroup;
  name: string;
  status: "Passed" | "Warning" | "Failed" | "Not run";
  value: string;
  expected: string;
  lastRun: string;
  duration: string;
  owner: string;
  evidence: string;
  followUp: string;
}

const d = (
  id: string, group: DiagnosticGroup, name: string, status: Diagnostic["status"],
  value: string, expected: string, owner: string, evidence: string, followUp: string,
  lastRun = "11:17:22 UTC", duration = "2s",
): Diagnostic => ({ id, group, name, status, value, expected, lastRun, duration, owner, evidence, followUp });

export const diagnostics: Diagnostic[] = [
  d("dg-t-avail", "Terminal Diagnostics", "Availability", "Passed", "Both terminals reachable", "Reachable", "Optical Path Investigator", "re-terminal", "None"),
  d("dg-t-cpu", "Terminal Diagnostics", "CPU", "Passed", "31 percent", "Below 75 percent", "Optical Path Investigator", "re-terminal", "None"),
  d("dg-t-mem", "Terminal Diagnostics", "Memory", "Passed", "44 percent", "Below 80 percent", "Optical Path Investigator", "re-terminal", "None"),
  d("dg-t-temp", "Terminal Diagnostics", "Internal temperature", "Passed", "41 C", "Below 65 C", "Optical Path Investigator", "re-terminal", "None"),
  d("dg-t-power", "Terminal Diagnostics", "Power", "Passed", "Utility power, generator standby", "Utility or generator", "Optical Path Investigator", "re-terminal", "None"),
  d("dg-t-volt", "Terminal Diagnostics", "Voltage", "Passed", "48.1 V", "47 to 49 V", "Optical Path Investigator", "re-terminal", "None"),
  d("dg-t-fw", "Terminal Diagnostics", "Firmware", "Passed", "4.8.1 on both terminals", "Matched versions", "Optical Path Investigator", "re-change", "No firmware change during the situation"),
  d("dg-t-cfg", "Terminal Diagnostics", "Configuration", "Passed", "No change in 14 days", "No recent change", "Optical Path Investigator", "re-change", "None"),
  d("dg-t-reboot", "Terminal Diagnostics", "Reboot history", "Passed", "No reboot in 62 days", "No unexpected reboot", "Optical Path Investigator", "re-terminal", "None"),
  d("dg-t-fresh", "Terminal Diagnostics", "Telemetry freshness", "Warning", "38 seconds since last sample", "Below 30 seconds", "Recovery Orchestrator Agent", "re-terminal", "Watch for stale telemetry rollback trigger"),
  d("dg-o-lock", "Optical Diagnostics", "Beam lock", "Passed", "Locked", "Locked", "Beam Alignment Agent", "re-optical", "None"),
  d("dg-o-margin", "Optical Diagnostics", "Link margin", "Passed", "8.7 dB", "Above 8.5 dB", "Optical Path Investigator", "re-threshold", "Sustained condition still accruing"),
  d("dg-o-power", "Optical Diagnostics", "Optical power", "Passed", "-24.1 dBm", "Above -27 dBm", "Optical Path Investigator", "re-optical", "None"),
  d("dg-o-atten", "Optical Diagnostics", "Attenuation", "Passed", "6.2 dB declining", "Declining trend", "Optical Path Investigator", "re-optical", "None"),
  d("dg-o-align", "Optical Diagnostics", "Alignment", "Passed", "0.011 degrees", "Below 0.05 degrees", "Beam Alignment Agent", "re-optical", "None"),
  d("dg-o-track", "Optical Diagnostics", "Tracking", "Passed", "4 corrections per minute", "Below 12 per minute", "Beam Alignment Agent", "re-optical", "None"),
  d("dg-o-reacq", "Optical Diagnostics", "Reacquisition", "Passed", "0 attempts", "0 attempts", "Beam Alignment Agent", "re-optical", "None"),
  d("dg-o-obstr", "Optical Diagnostics", "Obstruction pattern", "Passed", "Atmospheric, not physical", "No physical obstruction", "Optical Path Investigator", "re-optical", "None"),
  d("dg-n-iface", "Network Diagnostics", "Interface state", "Passed", "All interfaces up", "Up", "Recovery Orchestrator Agent", "re-network", "None"),
  d("dg-n-route", "Network Diagnostics", "Routing state", "Passed", "Stable, no flaps", "Stable", "Recovery Orchestrator Agent", "re-network", "None"),
  d("dg-n-thr", "Network Diagnostics", "Throughput", "Passed", "10 Gbps delivered", "At or above 8 Gbps", "Validation Agent", "re-network", "None"),
  d("dg-n-lat", "Network Diagnostics", "Latency", "Passed", "7.8 ms priority", "Below 12 ms", "Validation Agent", "re-network", "None"),
  d("dg-n-loss", "Network Diagnostics", "Packet loss", "Passed", "0.008 percent", "Below 0.5 percent", "Validation Agent", "re-network", "None"),
  d("dg-n-err", "Network Diagnostics", "Port errors", "Passed", "0 errors in 15 minutes", "0 errors", "Recovery Orchestrator Agent", "re-network", "None"),
  d("dg-n-cap", "Network Diagnostics", "Capacity", "Passed", "48 percent fallback headroom", "Above 20 percent", "RF Fallback Guardian", "re-fallback", "None"),
  d("dg-n-handoff", "Network Diagnostics", "Handoff ownership", "Passed", "Coastal Transit Partners healthy", "Healthy", "Rollback Guardian", "re-altroute", "None"),
  d("dg-e-vis", "Environmental Diagnostics", "Visibility", "Passed", "1,150 m improving", "Above 900 m", "Weather Risk Agent", "re-weather", "None"),
  d("dg-e-fog", "Environmental Diagnostics", "Fog density", "Passed", "Dispersing", "Dispersing", "Weather Risk Agent", "re-weather", "None"),
  d("dg-e-rain", "Environmental Diagnostics", "Rainfall", "Passed", "0 mm per hour", "Below 4 mm per hour", "Weather Risk Agent", "re-weather", "None"),
  d("dg-e-hum", "Environmental Diagnostics", "Humidity", "Warning", "94 percent", "Below 90 percent", "Weather Risk Agent", "re-weather", "Monitor for fog reformation"),
  d("dg-e-wind", "Environmental Diagnostics", "Wind", "Passed", "11 km/h", "Below 45 km/h", "Weather Risk Agent", "re-weather", "None"),
  d("dg-e-temp", "Environmental Diagnostics", "Temperature", "Passed", "27 C", "Operating range", "Weather Risk Agent", "re-weather", "None"),
  d("dg-e-vib", "Environmental Diagnostics", "Structural vibration", "Passed", "Within normal band", "Normal", "Beam Alignment Agent", "re-terminal", "None"),
  d("dg-e-forecast", "Environmental Diagnostics", "Forecast recovery", "Passed", "Clear by 12:05 UTC", "Recovery within the window", "Weather Risk Agent", "re-weather", "None"),
  d("dg-c-reach", "Customer Service Diagnostics", "Service reachability", "Passed", "Reachable", "Reachable", "Customer Impact Agent", "re-customer", "None"),
  d("dg-c-cap", "Customer Service Diagnostics", "Delivered capacity", "Warning", "8.6 Gbps of 10 Gbps", "10 Gbps", "Customer Impact Agent", "re-customer", "Restored on full optical return"),
  d("dg-c-lat", "Customer Service Diagnostics", "Latency objective", "Passed", "7.8 ms", "Below 12 ms", "Customer Impact Agent", "re-customer", "None"),
  d("dg-c-loss", "Customer Service Diagnostics", "Packet loss objective", "Passed", "0.008 percent", "Below 0.5 percent", "Customer Impact Agent", "re-customer", "None"),
  d("dg-c-avail", "Customer Service Diagnostics", "Availability", "Passed", "99.999 percent", "Above 99.99 percent", "SLO Guardian", "re-slo", "None"),
  d("dg-c-slo", "Customer Service Diagnostics", "SLO state", "Passed", "Objective protected", "Protected", "SLO Guardian", "re-slo", "None"),
  d("dg-c-budget", "Customer Service Diagnostics", "Error budget", "Warning", "3.4 percent consumed", "Below 5 percent", "SLO Guardian", "re-slo", "Recalculate at closure"),
  d("dg-c-down", "Customer Service Diagnostics", "Downstream service health", "Passed", "42,000 users nominal", "Nominal", "Customer Impact Agent", "re-customer", "None"),
];

/* ---------------------------- validation --------------------------------- */

export const VALIDATION_GROUPS = [
  "Customer Service Validation", "Optical Validation", "Network Validation",
  "Fallback Validation", "SRE Validation",
] as const;
export type ValidationGroup = (typeof VALIDATION_GROUPS)[number];

export interface ValidationTest {
  id: string;
  group: ValidationGroup;
  name: string;
  status: ValidationStatus;
  current: string;
  required: string;
  owner: string;
  agent: string;
  evidence: string;
  testedAt: string;
  failureResponse: string;
  blocking: boolean;
}

const v = (
  id: string, group: ValidationGroup, name: string, status: ValidationStatus,
  current: string, required: string, agent: string, evidence: string,
  failureResponse: string, blocking = true, owner = "N. Iyer, Network Operations", testedAt = "11:17:40 UTC",
): ValidationTest => ({ id, group, name, status, current, required, owner, agent, evidence, testedAt, failureResponse, blocking });

export const validationTests: ValidationTest[] = [
  v("vt-c-reach", "Customer Service Validation", "Service reachable", "Passed", "Reachable", "Reachable", "Customer Impact Agent", "re-customer", "Trigger rollback"),
  v("vt-c-thr", "Customer Service Validation", "Delivered throughput above objective", "Passed", "8.6 Gbps", "Above 8.0 Gbps", "Customer Impact Agent", "re-customer", "Trigger rollback"),
  v("vt-c-lat", "Customer Service Validation", "Latency within objective", "Passed", "7.8 ms", "Below 12 ms", "Validation Agent", "re-network", "Trigger rollback"),
  v("vt-c-loss", "Customer Service Validation", "Packet loss below threshold", "Passed", "0.008 percent", "Below 0.5 percent", "Validation Agent", "re-network", "Trigger rollback"),
  v("vt-c-down", "Customer Service Validation", "Downstream customer traffic healthy", "Passed", "42,000 users nominal", "Nominal", "Customer Impact Agent", "re-customer", "Pause execution"),
  v("vt-o-lock", "Optical Validation", "Beam lock stable", "Passed", "Locked 68 minutes", "Locked", "Beam Alignment Agent", "re-optical", "Hold fallback"),
  v("vt-o-margin", "Optical Validation", "Link margin above recovery threshold", "Passed", "8.7 dB", "Above 8.5 dB", "Optical Path Investigator", "re-threshold", "Reset sustained timer"),
  v("vt-o-power", "Optical Validation", "Received optical power stable", "Passed", "-24.1 dBm", "Above -27 dBm", "Optical Path Investigator", "re-optical", "Hold fallback"),
  v("vt-o-atten", "Optical Validation", "Optical attenuation declining", "Passed", "6.2 dB declining", "Declining", "Optical Path Investigator", "re-optical", "Hold fallback"),
  v("vt-o-point", "Optical Validation", "Pointing error normal", "Passed", "0.011 degrees", "Below 0.05 degrees", "Beam Alignment Agent", "re-optical", "Start beam reacquisition"),
  v("vt-o-sustain", "Optical Validation", "Recovery threshold sustained for 15 minutes", "Pending sustained condition", "6m 48s sustained", "15m 00s sustained", "Optical Path Investigator", "re-threshold", "Continue monitoring"),
  v("vt-n-iface", "Network Validation", "Interfaces healthy", "Passed", "All up", "Up", "Recovery Orchestrator Agent", "re-network", "Pause execution"),
  v("vt-n-route", "Network Validation", "Routing stable", "Passed", "No flaps", "Stable", "Recovery Orchestrator Agent", "re-network", "Pause execution"),
  v("vt-n-loss", "Network Validation", "No packet loss anomaly", "Passed", "0.008 percent", "Below 0.5 percent", "Validation Agent", "re-network", "Trigger rollback"),
  v("vt-n-cap", "Network Validation", "Capacity headroom sufficient", "Passed", "48 percent", "Above 20 percent", "RF Fallback Guardian", "re-fallback", "Trigger rollback"),
  v("vt-n-handoff", "Network Validation", "Handoffs healthy", "Passed", "Partner handoff nominal", "Healthy", "Rollback Guardian", "re-altroute", "Escalate to partner"),
  v("vt-f-avail", "Fallback Validation", "Fallback remains available", "Passed", "Active", "Active", "RF Fallback Guardian", "re-fallback", "Trigger rollback"),
  v("vt-f-head", "Fallback Validation", "Capacity headroom above minimum", "Passed", "48 percent", "Above 20 percent", "RF Fallback Guardian", "re-fallback", "Trigger rollback"),
  v("vt-f-lat", "Fallback Validation", "Latency within temporary objective", "Passed", "7.8 ms", "Below 12 ms", "RF Fallback Guardian", "re-fallback", "Trigger rollback"),
  v("vt-f-loss", "Fallback Validation", "Packet loss within threshold", "Passed", "0.008 percent", "Below 0.5 percent", "RF Fallback Guardian", "re-fallback", "Trigger rollback"),
  v("vt-f-rb", "Fallback Validation", "Rollback route remains ready", "Passed", "Tested 11:16:55 UTC", "Tested within 24 hours", "Rollback Guardian", "re-rollback", "Block further traffic movement"),
  v("vt-s-avail", "SRE Validation", "Availability objective protected", "Passed", "99.999 percent", "Above 99.99 percent", "SLO Guardian", "re-slo", "Escalate to SRE owner", false),
  v("vt-s-budget", "SRE Validation", "Error budget recalculated", "Pending sustained condition", "Pending closure", "Recalculated at closure", "SLO Guardian", "re-slo", "Flag for SRE review", false),
  v("vt-s-impact", "SRE Validation", "Customer impact avoided", "Passed", "45 minutes avoided", "Positive", "Customer Impact Agent", "re-outcome", "Record as not achieved", false),
  v("vt-s-time", "SRE Validation", "Time to recovery measured", "Passed", "11m 24s elapsed", "Measured", "Recovery Orchestrator Agent", "re-outcome", "Record as unmeasured", false),
  v("vt-s-evidence", "SRE Validation", "Evidence package complete", "Running", "24 of 26 records", "26 records", "Evidence Curator", "re-package", "Mark evidence incomplete", false),
  v("vt-s-timeline", "SRE Validation", "Situation timeline updated", "Passed", "Updated 11:18:06 UTC", "Updated", "Evidence Curator", "re-package", "Queue for manual update", false),
];

/* -------------------------- live guardrails ------------------------------ */

export interface LiveGuardrail {
  id: string;
  rule: string;
  current: string;
  required: string;
  status: GuardrailStatus;
  enforcement: "Blocking" | "Advisory";
  source: string;
  evidence: string;
  failureResponse: string;
  affectedSteps: number[];
}

export const liveGuardrails: LiveGuardrail[] = [
  { id: "lg-capacity", rule: "Customer capacity must remain above the temporary minimum.", current: "8.6 Gbps delivered", required: "At or above 8.0 Gbps", status: "Passed", enforcement: "Blocking", source: "Customer governance policy 1.2", evidence: "re-customer", failureResponse: "Return traffic to fallback and pause", affectedSteps: [11, 13, 15] },
  { id: "lg-headroom", rule: "Fallback headroom must remain above 20 percent.", current: "48 percent", required: "Above 20 percent", status: "Passed", enforcement: "Blocking", source: "Capacity governance policy 3.5", evidence: "re-fallback", failureResponse: "Trigger rollback", affectedSteps: [8, 11, 13] },
  { id: "lg-latency", rule: "Latency must remain below 12 ms.", current: "7.8 ms", required: "Below 12 ms", status: "Passed", enforcement: "Blocking", source: "Service governance policy 1.4", evidence: "re-network", failureResponse: "Trigger rollback", affectedSteps: [12, 14, 16] },
  { id: "lg-loss", rule: "Packet loss must remain below 0.5 percent.", current: "0.008 percent", required: "Below 0.5 percent", status: "Passed", enforcement: "Blocking", source: "Service governance policy 1.5", evidence: "re-network", failureResponse: "Trigger rollback", affectedSteps: [12, 14, 16] },
  { id: "lg-margin", rule: "Optical link margin must exceed the recovery threshold before traffic returns.", current: "8.7 dB", required: "Above 8.5 dB", status: "Passed", enforcement: "Blocking", source: "Optical governance policy 2.2", evidence: "re-threshold", failureResponse: "Hold traffic on fallback", affectedSteps: [10, 11] },
  { id: "lg-sustained", rule: "Recovery must be sustained for 15 continuous minutes.", current: "6m 48s sustained", required: "15m 00s sustained", status: "Warning", enforcement: "Blocking", source: "Optical governance policy 2.3", evidence: "re-threshold", failureResponse: "Continue monitoring, no traffic movement", affectedSteps: [10, 11] },
  { id: "lg-budget", rule: "Error budget consumption must remain below 5 percent for this situation.", current: "3.4 percent", required: "Below 5 percent", status: "Passed", enforcement: "Advisory", source: "SLO governance policy 5.1", evidence: "re-slo", failureResponse: "Escalate to SRE owner", affectedSteps: [19] },
  { id: "lg-criticality", rule: "Critical services may not be moved without an approved recommendation.", current: "One approved recommendation in force", required: "Approved recommendation", source: "Service governance policy 1.1", status: "Passed", enforcement: "Blocking", evidence: "re-authorization", failureResponse: "Cancel execution", affectedSteps: [1] },
  { id: "lg-ownership", rule: "A named execution owner must remain on console.", current: "N. Iyer on console", required: "Owner available", status: "Passed", enforcement: "Blocking", source: "Ownership policy 7.1", evidence: "re-ownership", failureResponse: "Pause and reassign", affectedSteps: [18, 22] },
  { id: "lg-approval", rule: "Approval must remain valid through execution.", current: "Valid until 13:05 UTC", required: "Valid at each step", status: "Passed", enforcement: "Blocking", source: "Approval policy 8.2", evidence: "re-authorization", failureResponse: "Pause and request re-approval", affectedSteps: [11, 13, 15] },
  { id: "lg-rollback", rule: "Rollback readiness must remain at 100 percent.", current: "100 percent", required: "100 percent", status: "Passed", enforcement: "Blocking", source: "Change governance policy 4.0", evidence: "re-rollback", failureResponse: "Block traffic movement", affectedSteps: [11, 13, 15] },
  { id: "lg-window", rule: "Execution must remain within the approved change window.", current: "11:06 to 13:05 UTC", required: "Within window", status: "Passed", enforcement: "Blocking", source: "Change governance policy 4.4", evidence: "re-authorization", failureResponse: "Pause execution", affectedSteps: [15, 18] },
  { id: "lg-evidence", rule: "Evidence completeness must remain above 90 percent.", current: "96 percent", required: "Above 90 percent", status: "Passed", enforcement: "Advisory", source: "Evidence policy 6.1", evidence: "re-package", failureResponse: "Queue evidence capture", affectedSteps: [20] },
  { id: "lg-estop", rule: "Emergency stop must halt all agent execution immediately.", current: "Not activated", required: "Available", status: "Not applicable", enforcement: "Blocking", source: "Safety policy 9.1", evidence: "re-ownership", failureResponse: "Halt all steps", affectedSteps: [] },
];

export const guardrailPassStatement = "Execution may continue, all blocking guardrails currently pass.";

/* ----------------------------- rollback ---------------------------------- */

export const rollbackReadiness = {
  route: "RF fallback 6 Gbps with Coastal Transit Partners alternate fiber standby",
  trigger: "Any blocking guardrail failure or customer validation failure",
  owner: "Rollback Guardian with N. Iyer, Network Operations",
  executionTime: "Under 90 seconds to protect priority traffic",
  routeCapacity: "6 Gbps fallback, 10 Gbps alternate fiber",
  expectedLatency: "7.8 ms fallback, 11.4 ms alternate fiber",
  customerImpact: "No priority traffic loss expected",
  validationStatus: "Rollback validation passed",
  policyStatus: "Within policy",
  evidenceCompleteness: "100 percent",
  lastTest: "11:16:55 UTC",
  confidence: "97 percent",
};

export const rollbackTriggers = [
  "RF fallback latency exceeds 12 ms.",
  "Packet loss exceeds 0.5%.",
  "Available fallback headroom falls below 20%.",
  "Customer service validation fails.",
  "Optical link margin declines below the recovery threshold.",
  "A second customer service becomes affected.",
  "Required execution owner becomes unavailable.",
  "Approval validity expires.",
  "A blocking policy rule fails.",
  "Emergency stop is activated.",
];

export interface RollbackExecStep {
  id: string;
  n: number;
  name: string;
  owner: string;
  expected: string;
  irreversibleAfter: boolean;
}

export const rollbackExecSteps: RollbackExecStep[] = [
  { id: "rb-detect", n: 1, name: "Detect rollback trigger", owner: "Rollback Guardian", expected: "Trigger identified with evidence", irreversibleAfter: false },
  { id: "rb-pause", n: 2, name: "Pause traffic movement", owner: "Recovery Orchestrator Agent", expected: "All transitions halted", irreversibleAfter: false },
  { id: "rb-preserve", n: 3, name: "Preserve current customer traffic", owner: "Customer Impact Agent", expected: "No customer class dropped", irreversibleAfter: false },
  { id: "rb-validate-route", n: 4, name: "Validate safest route", owner: "Rollback Guardian", expected: "Route capacity and latency confirmed", irreversibleAfter: false },
  { id: "rb-select", n: 5, name: "Select rollback route", owner: "N. Iyer, Network Operations", expected: "RF fallback selected", irreversibleAfter: false },
  { id: "rb-transition", n: 6, name: "Transition traffic", owner: "Recovery Orchestrator Agent", expected: "Traffic moved within 90 seconds", irreversibleAfter: true },
  { id: "rb-validate-service", n: 7, name: "Validate customer service", owner: "Customer Impact Agent", expected: "Customer objectives met", irreversibleAfter: true },
  { id: "rb-risk", n: 8, name: "Recalculate risk", owner: "SLO Guardian", expected: "Updated risk and budget position", irreversibleAfter: true },
  { id: "rb-notify", n: 9, name: "Notify owners", owner: "Communications Agent", expected: "Owners and customer operations informed", irreversibleAfter: true },
  { id: "rb-evidence", n: 10, name: "Record evidence", owner: "Evidence Curator", expected: "Rollback evidence package complete", irreversibleAfter: true },
  { id: "rb-reopen", n: 11, name: "Reopen investigation if needed", owner: "R. Venkatesan, Incident Commander", expected: "Investigation reopened when cause is unclear", irreversibleAfter: true },
];

/* ---------------------------- exceptions --------------------------------- */

export interface RecoveryException {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Moderate" | "Low";
  step: string;
  customerImpact: string;
  response: string;
  recommended: string;
  confidence: number;
  humanRequired: boolean;
  rollbackRelation: string;
  evidence: string;
  status: "Open" | "Monitoring" | "Contained" | "Accepted" | "Resolved";
}

export const recoveryExceptions: RecoveryException[] = [
  { id: "ex-capacity", title: "Fallback capacity approaching threshold", severity: "Moderate", step: "Maintain priority traffic on fallback", customerImpact: "None yet, headroom reducing", response: "RF Fallback Guardian holding additional classes off fallback", recommended: "Hold current distribution until margin sustains", confidence: 93, humanRequired: false, rollbackRelation: "Triggers rollback below 20 percent headroom", evidence: "re-fallback", status: "Monitoring" },
  { id: "ex-latency", title: "Latency validation failed", severity: "High", step: "Validate customer service", customerImpact: "Priority latency above objective for 40 seconds", response: "Increment returned to fallback automatically", recommended: "Retry after margin improves", confidence: 90, humanRequired: false, rollbackRelation: "Direct rollback trigger", evidence: "re-network", status: "Contained" },
  { id: "ex-beam", title: "Beam reacquisition timed out", severity: "High", step: "Establish fine alignment", customerImpact: "None, traffic on alternate optical", response: "Beam Alignment Agent retrying with a wider search envelope", recommended: "Allow one further attempt then escalate", confidence: 84, humanRequired: true, rollbackRelation: "Rollback to alternate optical retained", evidence: "re-optical", status: "Open" },
  { id: "ex-stale", title: "Terminal telemetry became stale", severity: "Moderate", step: "Monitor optical recovery threshold", customerImpact: "None, decisions paused", response: "Sustained timer paused pending fresh samples", recommended: "Pause execution until telemetry freshness recovers", confidence: 88, humanRequired: false, rollbackRelation: "Blocks traffic movement", evidence: "re-terminal", status: "Monitoring" },
  { id: "ex-approval", title: "Approval expired", severity: "High", step: "Restore 25% of traffic to optical", customerImpact: "None, execution held", response: "Execution paused awaiting re-approval", recommended: "Request approval extension from the service reliability owner", confidence: 99, humanRequired: true, rollbackRelation: "No rollback required while held", evidence: "re-authorization", status: "Open" },
  { id: "ex-owner", title: "Execution owner unavailable", severity: "Moderate", step: "Close temporary fallback state", customerImpact: "None", response: "Execution paused and escalation raised", recommended: "Reassign to the regional operations owner", confidence: 96, humanRequired: true, rollbackRelation: "Rollback readiness retained", evidence: "re-ownership", status: "Open" },
  { id: "ex-policy", title: "Policy guardrail changed", severity: "Low", step: "Validate policy and guardrails", customerImpact: "None", response: "Guardrail set re-evaluated against the new policy version", recommended: "Accept the updated guardrail and continue", confidence: 92, humanRequired: false, rollbackRelation: "No change to rollback plan", evidence: "re-policy", status: "Accepted" },
  { id: "ex-customer", title: "Customer service validation failed", severity: "Critical", step: "Validate customer service", customerImpact: "Delivered capacity fell below the temporary minimum", response: "Automatic rollback armed", recommended: "Trigger rollback and reopen investigation", confidence: 95, humanRequired: true, rollbackRelation: "Direct rollback trigger", evidence: "re-customer", status: "Contained" },
  { id: "ex-altroute", title: "Alternate route unavailable", severity: "High", step: "Validate alternate fiber route", customerImpact: "None yet, rollback readiness reduced", response: "Rollback Guardian searching for a secondary route", recommended: "Block further traffic movement until a route is validated", confidence: 89, humanRequired: true, rollbackRelation: "Reduces rollback readiness", evidence: "re-altroute", status: "Open" },
  { id: "ex-weather", title: "Weather recovery reversed", severity: "Moderate", step: "Monitor optical recovery threshold", customerImpact: "None, fallback protecting priority traffic", response: "Sustained recovery timer reset", recommended: "Extend the fallback window and re-monitor", confidence: 91, humanRequired: false, rollbackRelation: "Delays traffic return", evidence: "re-weather", status: "Monitoring" },
];

/* ---------------------------- ownership ---------------------------------- */

export interface ExecutionActor {
  id: string;
  name: string;
  kind: "Agent" | "Human";
  responsibility: string;
  currentTask: string;
  status: string;
  step: string;
  lastAction: string;
  nextAction: string;
  evidenceProduced: number;
  authority: string;
  guardrail: string;
  escalation: string;
}

export const executionActors: ExecutionActor[] = [
  { id: "agent-orchestrator", name: "Recovery Orchestrator Agent", kind: "Agent", responsibility: "Sequence and gate every execution step", currentTask: "Holding step 11 until the sustained timer completes", status: "Active", step: "Monitor optical recovery threshold", lastAction: "Re-evaluated guardrails at 11:18:00 UTC", nextAction: "Start step 11 on sustained confirmation", evidenceProduced: 6, authority: "Execute approved steps within guardrails", guardrail: "Within guardrails", escalation: "None" },
  { id: "agent-fallback", name: "RF Fallback Guardian", kind: "Agent", responsibility: "Keep fallback transport safe and validated", currentTask: "Monitoring headroom and stability", status: "Monitoring", step: "Maintain priority traffic on fallback", lastAction: "Validated headroom at 11:17:31 UTC", nextAction: "Confirm release readiness", evidenceProduced: 4, authority: "Hold or release fallback within policy", guardrail: "Within guardrails", escalation: "None" },
  { id: "agent-beam", name: "Beam Alignment Agent", kind: "Agent", responsibility: "Maintain beam lock and alignment quality", currentTask: "Tracking pointing error and corrections", status: "Active", step: "Monitor optical recovery threshold", lastAction: "Confirmed beam lock at 11:17:52 UTC", nextAction: "Report alignment confidence at each increment", evidenceProduced: 3, authority: "Initiate reacquisition when traffic is protected", guardrail: "Within guardrails", escalation: "None" },
  { id: "agent-path", name: "Optical Path Investigator", kind: "Agent", responsibility: "Establish optical path condition and trend", currentTask: "Correlating margin with visibility recovery", status: "Active", step: "Monitor optical recovery threshold", lastAction: "Margin sample 8.7 dB at 11:18:02 UTC", nextAction: "Confirm sustained recovery", evidenceProduced: 5, authority: "Advise on return-to-optical readiness", guardrail: "Within guardrails", escalation: "None" },
  { id: "agent-customer", name: "Customer Impact Agent", kind: "Agent", responsibility: "Quantify and protect customer experience", currentTask: "Watching downstream tower cluster health", status: "Active", step: "Validate customer service", lastAction: "Customer validation passed at 11:17:40 UTC", nextAction: "Validate after the first increment", evidenceProduced: 4, authority: "Fail a step on customer impact", guardrail: "Within guardrails", escalation: "None" },
  { id: "agent-slo", name: "SLO Guardian", kind: "Agent", responsibility: "Protect the objective and error budget", currentTask: "Tracking burn rate during recovery", status: "Active", step: "Recalculate SLO and error budget", lastAction: "Burn rate recalculated at 11:16:20 UTC", nextAction: "Final recalculation at closure", evidenceProduced: 2, authority: "Advisory hold on budget breach", guardrail: "Within guardrails", escalation: "None" },
  { id: "agent-validation", name: "Validation Agent", kind: "Agent", responsibility: "Run and evidence every validation test", currentTask: "Running the evidence completeness test", status: "Active", step: "Validate throughput and latency", lastAction: "8 of 10 blocking tests passed", nextAction: "Run the post increment suite", evidenceProduced: 7, authority: "Fail a step on validation failure", guardrail: "Within guardrails", escalation: "None" },
  { id: "agent-rollback", name: "Rollback Guardian", kind: "Agent", responsibility: "Keep rollback ready at every stage", currentTask: "Revalidating the alternate fiber route", status: "Monitoring", step: "Validate alternate fiber route", lastAction: "Rollback test passed at 11:16:55 UTC", nextAction: "Re-test before each increment", evidenceProduced: 3, authority: "Trigger rollback on a blocking failure", guardrail: "Within guardrails", escalation: "None" },
  { id: "agent-comms", name: "Communications Agent", kind: "Agent", responsibility: "Keep stakeholders accurately informed", currentTask: "Drafting the recovery progress update", status: "Awaiting approval", step: "Validate customer service", lastAction: "Draft prepared at 11:15:10 UTC", nextAction: "Send on customer validation", evidenceProduced: 1, authority: "Send approved updates only", guardrail: "Approval gate engaged", escalation: "None" },
  { id: "agent-evidence", name: "Evidence Curator", kind: "Agent", responsibility: "Assemble the execution evidence package", currentTask: "Indexing 24 evidence records", status: "Active", step: "Capture final evidence", lastAction: "Package at 96 percent completeness", nextAction: "Close the package at completion", evidenceProduced: 24, authority: "Mark evidence complete or incomplete", guardrail: "Within guardrails", escalation: "None" },
  { id: "own-execution", name: "N. Iyer, Network Operations", kind: "Human", responsibility: "Execution owner for transport and traffic policy", currentTask: "Supervising the governed return to optical", status: "On console", step: "Monitor optical recovery threshold", lastAction: "Acknowledged execution readiness at 11:07:50 UTC", nextAction: "Authorize the first increment", evidenceProduced: 2, authority: "Pause, resume, stop, rollback", guardrail: "Within guardrails", escalation: "None" },
  { id: "own-commander", name: "R. Venkatesan, Incident Commander", kind: "Human", responsibility: "Owns the response plan and closure", currentTask: "Tracking recovery against the plan", status: "On console", step: "Mark recovery complete", lastAction: "Briefed stakeholders at 11:14 UTC", nextAction: "Close the situation at completion", evidenceProduced: 1, authority: "Emergency stop and closure", guardrail: "Within guardrails", escalation: "None" },
  { id: "own-network", name: "N. Iyer, Network Operations", kind: "Human", responsibility: "Network operations owner", currentTask: "Holding fallback traffic policy", status: "On console", step: "Maintain priority traffic on fallback", lastAction: "Fallback policy confirmed 11:10:36 UTC", nextAction: "Release fallback after validation", evidenceProduced: 2, authority: "Traffic policy changes within approval", guardrail: "Within guardrails", escalation: "None" },
  { id: "own-optical", name: "S. Krishnan, Optical Engineering", kind: "Human", responsibility: "Optical engineering owner", currentTask: "Reviewing margin recovery evidence", status: "On console", step: "Validate sustained link margin", lastAction: "Reviewed attenuation trend at 11:15 UTC", nextAction: "Confirm return-to-optical readiness", evidenceProduced: 1, authority: "Approve optical path return", guardrail: "Within guardrails", escalation: "None" },
  { id: "own-sre", name: "M. Dorai, Service Reliability", kind: "Human", responsibility: "Service reliability owner", currentTask: "Validating error budget position", status: "On console", step: "Recalculate SLO and error budget", lastAction: "Budget check at 11:16 UTC", nextAction: "Sign off the SLO outcome", evidenceProduced: 1, authority: "Advisory hold on budget risk", guardrail: "Within guardrails", escalation: "None" },
  { id: "own-customer", name: "A. Rahman, Customer Operations", kind: "Human", responsibility: "Customer operations owner", currentTask: "Preparing the customer recovery update", status: "On call", step: "Validate customer service", lastAction: "Reviewed the drafted update at 11:15 UTC", nextAction: "Approve and send the update", evidenceProduced: 1, authority: "Customer communication approval", guardrail: "Within guardrails", escalation: "None" },
  { id: "own-regional", name: "India South NOC", kind: "Human", responsibility: "Regional operations owner", currentTask: "Monitoring nearby spans for correlated risk", status: "24x7 desk", step: "Monitor optical recovery threshold", lastAction: "Regional sweep at 11:12 UTC", nextAction: "Confirm no correlated degradation", evidenceProduced: 0, authority: "Regional escalation", guardrail: "Within guardrails", escalation: "None" },
  { id: "own-partner", name: "Coastal Transit Partners duty manager", kind: "Human", responsibility: "Partner operations owner", currentTask: "Holding the alternate fiber route on standby", status: "On call", step: "Validate alternate fiber route", lastAction: "Standby confirmed at 11:07:50 UTC", nextAction: "Release standby at closure", evidenceProduced: 1, authority: "Partner route availability", guardrail: "Within guardrails", escalation: "Standby" },
];

export const OWNERSHIP_MATRIX_COLUMNS = [
  "Execution", "Validation", "Rollback", "Customer communication",
  "Service restoration", "Evidence completion", "Final closure",
] as const;
export type OwnershipMatrixColumn = (typeof OWNERSHIP_MATRIX_COLUMNS)[number];

export interface OwnershipMatrixRow {
  actor: string;
  cells: Record<OwnershipMatrixColumn, "Accountable" | "Responsible" | "Consulted" | "Informed" | "—">;
}

export const ownershipMatrix: OwnershipMatrixRow[] = [
  { actor: "Recovery Orchestrator Agent", cells: { Execution: "Responsible", Validation: "Consulted", Rollback: "Consulted", "Customer communication": "—", "Service restoration": "Responsible", "Evidence completion": "Consulted", "Final closure": "Consulted" } },
  { actor: "Validation Agent", cells: { Execution: "Consulted", Validation: "Responsible", Rollback: "Consulted", "Customer communication": "—", "Service restoration": "Consulted", "Evidence completion": "Responsible", "Final closure": "Informed" } },
  { actor: "Rollback Guardian", cells: { Execution: "Consulted", Validation: "Consulted", Rollback: "Responsible", "Customer communication": "Informed", "Service restoration": "Consulted", "Evidence completion": "Consulted", "Final closure": "Informed" } },
  { actor: "Customer Impact Agent", cells: { Execution: "Informed", Validation: "Responsible", Rollback: "Consulted", "Customer communication": "Responsible", "Service restoration": "Consulted", "Evidence completion": "Consulted", "Final closure": "Informed" } },
  { actor: "Evidence Curator", cells: { Execution: "Informed", Validation: "Consulted", Rollback: "Consulted", "Customer communication": "—", "Service restoration": "—", "Evidence completion": "Accountable", "Final closure": "Consulted" } },
  { actor: "N. Iyer, Network Operations", cells: { Execution: "Accountable", Validation: "Consulted", Rollback: "Accountable", "Customer communication": "Consulted", "Service restoration": "Accountable", "Evidence completion": "Consulted", "Final closure": "Responsible" } },
  { actor: "R. Venkatesan, Incident Commander", cells: { Execution: "Consulted", Validation: "Informed", Rollback: "Consulted", "Customer communication": "Accountable", "Service restoration": "Consulted", "Evidence completion": "Informed", "Final closure": "Accountable" } },
  { actor: "S. Krishnan, Optical Engineering", cells: { Execution: "Consulted", Validation: "Responsible", Rollback: "Consulted", "Customer communication": "—", "Service restoration": "Responsible", "Evidence completion": "Informed", "Final closure": "Consulted" } },
  { actor: "A. Rahman, Customer Operations", cells: { Execution: "Informed", Validation: "Informed", Rollback: "Informed", "Customer communication": "Responsible", "Service restoration": "Informed", "Evidence completion": "—", "Final closure": "Consulted" } },
];

/* ------------------------- timeline and evidence ------------------------- */

export const TIMELINE_EVENT_TYPES = [
  "Authorization", "Validation", "Traffic change", "Guardrail", "Diagnostic",
  "Customer", "Rollback", "Evidence", "Human decision", "Closure",
] as const;
export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

export interface TimelineEvent {
  id: string;
  at: string;
  event: string;
  actor: string;
  type: TimelineEventType;
  step: string;
  serviceState: string;
  traffic: string;
  validation: string;
  guardrail: string;
  evidence: string;
  outcome: string;
  status: "Complete" | "In progress" | "Pending";
}

export const timelineEvents: TimelineEvent[] = [
  { id: "te-1", at: "11:06:42 UTC", event: "Action authorized", actor: "R. Venkatesan, Incident Commander", type: "Authorization", step: "Confirm action authorization", serviceState: "Available with reduced capacity", traffic: "6.9 optical, 3.1 fallback", validation: "Passed", guardrail: "Passed", evidence: "re-authorization", outcome: "Execution authorized", status: "Complete" },
  { id: "te-2", at: "11:07:50 UTC", event: "Preflight validation passed", actor: "Validation Agent", type: "Validation", step: "Validate policy and guardrails", serviceState: "Available with reduced capacity", traffic: "6.9 optical, 3.1 fallback", validation: "Passed", guardrail: "Passed", evidence: "re-policy", outcome: "12 preflight checks passed", status: "Complete" },
  { id: "te-3", at: "11:07:24 UTC", event: "Customer baseline captured", actor: "Customer Impact Agent", type: "Customer", step: "Capture pre-action service baseline", serviceState: "Available with reduced capacity", traffic: "6.9 optical, 3.1 fallback", validation: "Passed", guardrail: "Passed", evidence: "re-baseline", outcome: "Baseline 8.6 Gbps recorded", status: "Complete" },
  { id: "te-4", at: "11:07:50 UTC", event: "RF fallback validated", actor: "RF Fallback Guardian", type: "Validation", step: "Validate RF fallback capacity", serviceState: "Available with reduced capacity", traffic: "6.9 optical, 3.1 fallback", validation: "Passed", guardrail: "Passed", evidence: "re-fallback", outcome: "48 percent headroom confirmed", status: "Complete" },
  { id: "te-5", at: "11:09:43 UTC", event: "Priority traffic held on fallback", actor: "RF Fallback Guardian", type: "Traffic change", step: "Maintain priority traffic on fallback", serviceState: "Available with reduced capacity", traffic: "6.9 optical, 3.1 fallback", validation: "Passed", guardrail: "Passed", evidence: "re-traffic-hold", outcome: "Priority classes protected", status: "Complete" },
  { id: "te-6", at: "11:11:18 UTC", event: "Optical recovery monitoring started", actor: "Optical Path Investigator", type: "Diagnostic", step: "Monitor optical recovery threshold", serviceState: "Available with reduced capacity", traffic: "6.9 optical, 3.1 fallback", validation: "Running", guardrail: "Warning", evidence: "re-threshold", outcome: "Margin monitoring active", status: "Complete" },
  { id: "te-7", at: "11:11:18 UTC", event: "Link margin crossed recovery threshold", actor: "Optical Path Investigator", type: "Diagnostic", step: "Monitor optical recovery threshold", serviceState: "Available with reduced capacity", traffic: "6.9 optical, 3.1 fallback", validation: "Running", guardrail: "Warning", evidence: "re-threshold", outcome: "Margin 8.6 dB", status: "Complete" },
  { id: "te-8", at: "11:11:18 UTC", event: "Sustained recovery timer started", actor: "Recovery Orchestrator Agent", type: "Guardrail", step: "Validate sustained link margin", serviceState: "Available with reduced capacity", traffic: "6.9 optical, 3.1 fallback", validation: "Pending sustained condition", guardrail: "Warning", evidence: "re-threshold", outcome: "15 minute timer running", status: "In progress" },
  { id: "te-9", at: "Pending", event: "First traffic increment restored", actor: "Recovery Orchestrator Agent", type: "Traffic change", step: "Restore 25% of traffic to optical", serviceState: "Pending", traffic: "7.7 optical, 2.3 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-increment-1", outcome: "Pending", status: "Pending" },
  { id: "te-10", at: "Pending", event: "Customer service validated", actor: "Customer Impact Agent", type: "Customer", step: "Validate customer service", serviceState: "Pending", traffic: "7.7 optical, 2.3 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-customer-1", outcome: "Pending", status: "Pending" },
  { id: "te-11", at: "Pending", event: "Second traffic increment restored", actor: "Recovery Orchestrator Agent", type: "Traffic change", step: "Restore 50% of traffic to optical", serviceState: "Pending", traffic: "8.5 optical, 1.5 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-increment-2", outcome: "Pending", status: "Pending" },
  { id: "te-12", at: "Pending", event: "Latency remained within objective", actor: "Validation Agent", type: "Validation", step: "Validate customer service", serviceState: "Pending", traffic: "8.5 optical, 1.5 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-network", outcome: "Pending", status: "Pending" },
  { id: "te-13", at: "Pending", event: "Full traffic returned to optical", actor: "Recovery Orchestrator Agent", type: "Traffic change", step: "Restore 100% of traffic to optical", serviceState: "Pending", traffic: "10 optical, 0 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-increment-3", outcome: "Pending", status: "Pending" },
  { id: "te-14", at: "Pending", event: "Fallback released", actor: "RF Fallback Guardian", type: "Traffic change", step: "Close temporary fallback state", serviceState: "Pending", traffic: "10 optical, 0 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-release", outcome: "Pending", status: "Pending" },
  { id: "te-15", at: "Pending", event: "Final service validation passed", actor: "Validation Agent", type: "Validation", step: "Validate throughput and latency", serviceState: "Pending", traffic: "10 optical, 0 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-final-throughput", outcome: "Pending", status: "Pending" },
  { id: "te-16", at: "Pending", event: "Error budget recalculated", actor: "SLO Guardian", type: "Validation", step: "Recalculate SLO and error budget", serviceState: "Pending", traffic: "10 optical, 0 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-slo", outcome: "Pending", status: "Pending" },
  { id: "te-17", at: "Pending", event: "Evidence package completed", actor: "Evidence Curator", type: "Evidence", step: "Capture final evidence", serviceState: "Pending", traffic: "10 optical, 0 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-package", outcome: "Pending", status: "Pending" },
  { id: "te-18", at: "Pending", event: "Recovery marked complete", actor: "R. Venkatesan, Incident Commander", type: "Closure", step: "Mark recovery complete", serviceState: "Pending", traffic: "10 optical, 0 fallback", validation: "Not started", guardrail: "Pending", evidence: "re-closure", outcome: "Pending", status: "Pending" },
];

export const EVIDENCE_GROUPS = [
  "Execution authorization", "Preflight results", "Traffic transition evidence",
  "Terminal diagnostics", "Optical diagnostics", "Network diagnostics",
  "Validation results", "Rollback tests", "Customer service checks",
  "Policy checks", "Human notes", "Final outcome evidence",
] as const;
export type EvidenceGroup = (typeof EVIDENCE_GROUPS)[number];

export interface ExecutionEvidence {
  id: string;
  group: EvidenceGroup;
  title: string;
  source: string;
  capturedAt: string;
  confidence: number;
  summary: string;
  step: string;
}

export const executionEvidence: ExecutionEvidence[] = [
  { id: "re-authorization", group: "Execution authorization", title: "Approval decision record APR-2026-0417-03", source: "Human Approval and Action Center", capturedAt: "11:06:42 UTC", confidence: 100, summary: "Two required approvals recorded with conditions attached. Valid until 13:05 UTC.", step: "Confirm action authorization" },
  { id: "re-policy", group: "Policy checks", title: "Preflight policy and guardrail evaluation", source: "SLO Guardian", capturedAt: "11:06:48 UTC", confidence: 98, summary: "14 guardrails evaluated. All blocking rules pass with one advisory warning on sustained recovery.", step: "Validate policy and guardrails" },
  { id: "re-baseline", group: "Preflight results", title: "Pre-action customer service baseline", source: "Customer Impact Agent", capturedAt: "11:07:02 UTC", confidence: 97, summary: "8.6 Gbps delivered, 7.8 ms latency, 0.008 percent loss, availability objective intact.", step: "Capture pre-action service baseline" },
  { id: "re-fallback", group: "Preflight results", title: "RF fallback capacity validation", source: "RF Fallback Guardian", capturedAt: "11:07:24 UTC", confidence: 96, summary: "3.1 Gbps of 6 Gbps in use. 48 percent headroom. Safe for up to 8 hours at current load.", step: "Validate RF fallback capacity" },
  { id: "re-altroute", group: "Preflight results", title: "Alternate fiber route validation", source: "Rollback Guardian", capturedAt: "11:07:50 UTC", confidence: 95, summary: "Coastal Transit Partners route available at 10 Gbps with 11.4 ms expected latency.", step: "Validate alternate fiber route" },
  { id: "re-terminal", group: "Terminal diagnostics", title: "Terminal diagnostic sweep", source: "Optical Path Investigator", capturedAt: "11:08:21 UTC", confidence: 96, summary: "All terminal diagnostics nominal. One warning on telemetry freshness at 38 seconds.", step: "Confirm terminal health" },
  { id: "re-optical", group: "Optical diagnostics", title: "Optical path telemetry correlation", source: "Optical Path Investigator", capturedAt: "11:09:05 UTC", confidence: 95, summary: "Beam lock maintained, received power -24.1 dBm, attenuation declining.", step: "Confirm optical link state" },
  { id: "re-traffic-hold", group: "Traffic transition evidence", title: "Priority traffic hold record", source: "RF Fallback Guardian", capturedAt: "11:09:43 UTC", confidence: 99, summary: "Priority and control classes pinned to the RF fallback path.", step: "Maintain priority traffic on fallback" },
  { id: "re-threshold", group: "Optical diagnostics", title: "Sustained recovery threshold series", source: "Optical Path Investigator", capturedAt: "11:18:02 UTC", confidence: 94, summary: "Margin above 8.5 dB since 11:11:18 UTC. Sustained 6m 48s of the required 15m.", step: "Monitor optical recovery threshold" },
  { id: "re-network", group: "Network diagnostics", title: "Network validation sample set", source: "Validation Agent", capturedAt: "11:17:40 UTC", confidence: 97, summary: "Interfaces up, routing stable, no packet loss anomaly, headroom sufficient.", step: "Validate throughput and latency" },
  { id: "re-customer", group: "Customer service checks", title: "Customer service validation suite", source: "Customer Impact Agent", capturedAt: "11:17:40 UTC", confidence: 96, summary: "Service reachable with objectives met on latency and loss. Capacity below committed.", step: "Validate customer service" },
  { id: "re-weather", group: "Preflight results", title: "Weather recovery correlation", source: "Weather Risk Agent", capturedAt: "11:17:10 UTC", confidence: 94, summary: "Visibility 1,150 m and improving. Attenuation tracks visibility with a 4 minute lag.", step: "Monitor optical recovery threshold" },
  { id: "re-rollback", group: "Rollback tests", title: "Rollback readiness test", source: "Rollback Guardian", capturedAt: "11:16:55 UTC", confidence: 97, summary: "All 11 rollback steps validated in dry run. Estimated execution under 90 seconds.", step: "Validate alternate fiber route" },
  { id: "re-change", group: "Preflight results", title: "Change history verification", source: "Recovery Orchestrator Agent", capturedAt: "11:08:00 UTC", confidence: 99, summary: "No configuration or firmware change in the last 14 days on either terminal.", step: "Confirm terminal health" },
  { id: "re-slo", group: "Final outcome evidence", title: "SLO and error budget position", source: "SLO Guardian", capturedAt: "11:16:20 UTC", confidence: 95, summary: "3.4 percent of the monthly error budget consumed. Availability objective protected.", step: "Recalculate SLO and error budget" },
  { id: "re-ownership", group: "Human notes", title: "Execution ownership acknowledgement", source: "N. Iyer, Network Operations", capturedAt: "11:07:50 UTC", confidence: 100, summary: "Execution owner acknowledged readiness and remained on console throughout.", step: "Confirm fallback release readiness" },
  { id: "re-increment-1", group: "Traffic transition evidence", title: "First increment transition record", source: "Recovery Orchestrator Agent", capturedAt: "Pending", confidence: 0, summary: "Awaiting the sustained recovery confirmation before the first increment.", step: "Restore 25% of traffic to optical" },
  { id: "re-customer-1", group: "Customer service checks", title: "Post increment customer validation", source: "Customer Impact Agent", capturedAt: "Pending", confidence: 0, summary: "Scheduled after the first traffic increment.", step: "Validate customer service" },
  { id: "re-increment-2", group: "Traffic transition evidence", title: "Second increment transition record", source: "Recovery Orchestrator Agent", capturedAt: "Pending", confidence: 0, summary: "Scheduled after the first customer validation passes.", step: "Restore 50% of traffic to optical" },
  { id: "re-customer-2", group: "Customer service checks", title: "Second customer validation", source: "Customer Impact Agent", capturedAt: "Pending", confidence: 0, summary: "Scheduled after the second traffic increment.", step: "Validate customer service" },
  { id: "re-increment-3", group: "Traffic transition evidence", title: "Full restoration transition record", source: "Recovery Orchestrator Agent", capturedAt: "Pending", confidence: 0, summary: "Scheduled after the second customer validation passes.", step: "Restore 100% of traffic to optical" },
  { id: "re-final-throughput", group: "Validation results", title: "Final throughput and latency validation", source: "Validation Agent", capturedAt: "Pending", confidence: 0, summary: "Full capacity and latency validation on the restored optical path.", step: "Validate throughput and latency" },
  { id: "re-release", group: "Traffic transition evidence", title: "Fallback release record", source: "RF Fallback Guardian", capturedAt: "Pending", confidence: 0, summary: "Fallback returned to standby once optical stability is confirmed.", step: "Close temporary fallback state" },
  { id: "re-package", group: "Final outcome evidence", title: "Execution evidence package", source: "Evidence Curator", capturedAt: "11:18:06 UTC", confidence: 96, summary: "24 of 26 evidence records captured. Package completes at recovery closure.", step: "Capture final evidence" },
  { id: "re-learning", group: "Final outcome evidence", title: "Operational learning record", source: "Recovery Orchestrator Agent", capturedAt: "Pending", confidence: 0, summary: "Reusable recovery pattern captured at closure.", step: "Record operational learning" },
  { id: "re-closure", group: "Final outcome evidence", title: "Recovery closure record", source: "R. Venkatesan, Incident Commander", capturedAt: "Pending", confidence: 0, summary: "Human closure with the complete evidence package.", step: "Mark recovery complete" },
  { id: "re-outcome", group: "Final outcome evidence", title: "Customer and SRE outcome measurement", source: "Customer Impact Agent", capturedAt: "11:18:06 UTC", confidence: 93, summary: "Synthetic demonstration estimate of avoided impact and preserved error budget.", step: "Record operational learning" },
];

/* ----------------------------- outcomes ---------------------------------- */

export interface RecoveryOutcome {
  id: string;
  metric: string;
  value: string;
  detail: string;
  tone: "good" | "watch" | "neutral";
}

export const recoveryOutcomes: RecoveryOutcome[] = [
  { id: "ro-avail", metric: "Customer service availability", value: "99.999%", detail: "Objective protected throughout the recovery", tone: "good" },
  { id: "ro-capacity", metric: "Capacity protected", value: "10 Gbps", detail: "Committed capacity protected by fallback and optical", tone: "good" },
  { id: "ro-restored", metric: "Traffic restored to optical", value: "10 Gbps", detail: "At projected completion", tone: "good" },
  { id: "ro-latency", metric: "Latency during recovery", value: "7.8 ms peak", detail: "Objective is below 12 ms", tone: "good" },
  { id: "ro-loss", metric: "Packet loss during recovery", value: "0.011 percent peak", detail: "Objective is below 0.5 percent", tone: "good" },
  { id: "ro-mitigate", metric: "Time to mitigate", value: "4m 18s", detail: "From detection to fallback protection", tone: "good" },
  { id: "ro-restore", metric: "Time to restore", value: "18m 42s", detail: "Projected from authorization to full optical", tone: "watch" },
  { id: "ro-validate", metric: "Time to validate", value: "3m 06s", detail: "Cumulative validation duration", tone: "good" },
  { id: "ro-consumed", metric: "Error budget consumed", value: "3.4%", detail: "Of the monthly budget for this service", tone: "watch" },
  { id: "ro-preserved", metric: "Error budget preserved", value: "22%", detail: "Versus the manual recovery baseline", tone: "good" },
  { id: "ro-avoided", metric: "Outage minutes avoided", value: "45", detail: "Synthetic demonstration estimate", tone: "good" },
  { id: "ro-services", metric: "Customer services protected", value: "1", detail: "Chennai Mobile Backhaul Service 041", tone: "neutral" },
  { id: "ro-field", metric: "Field visits avoided", value: "1", detail: "No dispatch required to the Chennai site", tone: "good" },
  { id: "ro-effort", metric: "Human effort saved", value: "2.4 engineer hours", detail: "Synthetic demonstration estimate", tone: "good" },
  { id: "ro-auto", metric: "Autonomous steps completed", value: "17", detail: "Of 22 workflow steps", tone: "good" },
  { id: "ro-human", metric: "Human decisions required", value: "2", detail: "Fallback closure and final recovery closure", tone: "neutral" },
  { id: "ro-rollback", metric: "Rollback events", value: "0", detail: "Rollback remained ready but was not required", tone: "good" },
  { id: "ro-evidence", metric: "Evidence completeness", value: "100%", detail: "At recovery closure", tone: "good" },
];

export const outcomeDisclaimer =
  "All recovery outcome values are synthetic demonstration data and do not represent measured customer results.";

export interface RecoveryComparisonRow {
  dimension: string;
  manual: string;
  assisted: string;
  governed: string;
}

export const recoveryComparison: RecoveryComparisonRow[] = [
  { dimension: "Time to execute", manual: "48 minutes across three teams", assisted: "24 minutes with agent guidance", governed: "18m 42s with governed execution" },
  { dimension: "Time to validate", manual: "22 minutes in separate tools", assisted: "9 minutes with partial automation", governed: "3m 06s continuous validation" },
  { dimension: "Customer impact", manual: "45 minutes of reduced capacity", assisted: "18 minutes of reduced capacity", governed: "No priority traffic impact" },
  { dimension: "Rollback readiness", manual: "Depends on operator memory", assisted: "Documented but not tested", governed: "Tested and ready at every stage" },
  { dimension: "Evidence completeness", manual: "Assembled after recovery", assisted: "Partially automated", governed: "Captured at each step" },
  { dimension: "Human effort", manual: "Three engineers for 48 minutes", assisted: "Two engineers for 24 minutes", governed: "One owner supervising" },
  { dimension: "SLO impact", manual: "8.1 percent of the error budget", assisted: "5.2 percent of the error budget", governed: "3.4 percent of the error budget" },
  { dimension: "Repeatability", manual: "Varies by engineer", assisted: "Partially repeatable", governed: "Deterministic and reusable" },
];

export interface ControlComparisonRow {
  dimension: string;
  uncontrolled: string;
  controlled: string;
}

export const controlComparison: ControlComparisonRow[] = [
  { dimension: "Customer risk", uncontrolled: "Executes from a trigger with limited customer context", controlled: "Executes from an approved, customer and SLO aware recommendation" },
  { dimension: "Execution transparency", uncontrolled: "Minimal human visibility during execution", controlled: "Step by step observable execution with live state" },
  { dimension: "Validation coverage", uncontrolled: "Validation may occur after execution", controlled: "Continuous customer validation at every increment" },
  { dimension: "Rollback readiness", uncontrolled: "Incomplete rollback readiness", controlled: "Rollback ready and tested at every stage" },
  { dimension: "Human control", uncontrolled: "Difficult to stop safely", controlled: "Human pause, stop and emergency controls at all times" },
  { dimension: "Audit completeness", uncontrolled: "Limited evidence capture", controlled: "Complete execution evidence and outcome record" },
  { dimension: "SLO protection", uncontrolled: "Objective impact discovered later", controlled: "Error budget tracked and protected during execution" },
  { dimension: "Repeatability", uncontrolled: "Difficult to reproduce or explain", controlled: "Deterministic pattern retained as operational learning" },
];

/* -------------------------- operational learning -------------------------- */

export const recoveryLearning = [
  "Fog related degradation signature confirmed",
  "Current preventive threshold was effective",
  "RF fallback capacity was sufficient",
  "Incremental restoration reduced customer risk",
  "Fifteen minute sustained recovery validation was appropriate",
  "No terminal hardware issue was present",
  "No field dispatch was required",
  "The recovery pattern can be reused for similar Lightbridge Pro services",
  "The Chennai seasonal risk model should be updated",
  "The runbook evidence package is complete",
];

export const learningActions = [
  "Save recovery pattern",
  "Update synthetic runbook",
  "Add known diagnostic signature",
  "Add preventive watch",
  "Propose autonomy advancement",
  "Request human review",
  "Export learning summary",
];

/* ---------------------------- scenario ----------------------------------- */

export interface RecoveryScenarioStage {
  n: number;
  label: string;
  state: ExecutionState;
  step: number;
  progress: number;
  optical: number;
  fallback: number;
  narrative: string;
  validationPassed: number;
  guardrail: GuardrailStatus;
  rollbackReadiness: number;
  evidenceCount: number;
  serviceState: string;
  timelineEvent: string;
}

export const recoveryScenario: RecoveryScenarioStage[] = [
  { n: 1, label: "Approved action received", state: "Authorized", step: 1, progress: 4, optical: 6.9, fallback: 3.1, narrative: "The approved recommendation from APR-2026-0417-03 enters controlled execution.", validationPassed: 0, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 1, serviceState: "Available with reduced capacity", timelineEvent: "Action authorized" },
  { n: 2, label: "Policy and approval validity confirmed", state: "Preflight validation", step: 1, progress: 8, optical: 6.9, fallback: 3.1, narrative: "Approval validity and separation of duties are re-verified before any change.", validationPassed: 1, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 2, serviceState: "Available with reduced capacity", timelineEvent: "Approval validity confirmed" },
  { n: 3, label: "Guardrails evaluated", state: "Preflight validation", step: 2, progress: 12, optical: 6.9, fallback: 3.1, narrative: "All 14 guardrails evaluate against live telemetry. One advisory warning remains.", validationPassed: 2, guardrail: "Warning", rollbackReadiness: 100, evidenceCount: 3, serviceState: "Available with reduced capacity", timelineEvent: "Guardrails evaluated" },
  { n: 4, label: "Customer baseline captured", state: "Ready to execute", step: 3, progress: 16, optical: 6.9, fallback: 3.1, narrative: "The pre-action customer service baseline is recorded for outcome comparison.", validationPassed: 3, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 4, serviceState: "Available with reduced capacity", timelineEvent: "Customer baseline captured" },
  { n: 5, label: "RF fallback validated", state: "Execution started", step: 4, progress: 20, optical: 6.9, fallback: 3.1, narrative: "Fallback headroom of 48 percent confirms priority traffic can stay protected.", validationPassed: 5, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 5, serviceState: "Available with reduced capacity", timelineEvent: "RF fallback validated" },
  { n: 6, label: "Alternate fiber route validated", state: "Execution started", step: 5, progress: 24, optical: 6.9, fallback: 3.1, narrative: "The partner alternate fiber route is confirmed as the rollback path.", validationPassed: 6, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 6, serviceState: "Available with reduced capacity", timelineEvent: "Alternate fiber route validated" },
  { n: 7, label: "Terminal health validated", state: "Diagnostics running", step: 6, progress: 30, optical: 6.9, fallback: 3.1, narrative: "Terminal diagnostics exclude hardware faults on both ends of the link.", validationPassed: 8, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 8, serviceState: "Available with reduced capacity", timelineEvent: "Terminal health validated" },
  { n: 8, label: "Optical recovery monitoring started", state: "Recovery monitoring", step: 9, progress: 40, optical: 6.9, fallback: 3.1, narrative: "The optical path is watched continuously against the validated recovery threshold.", validationPassed: 10, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 10, serviceState: "Available with reduced capacity", timelineEvent: "Optical recovery monitoring started" },
  { n: 9, label: "Link margin begins recovering", state: "Recovery monitoring", step: 9, progress: 48, optical: 6.9, fallback: 3.1, narrative: "Margin rises above 8.5 dB as visibility improves and attenuation declines.", validationPassed: 12, guardrail: "Warning", rollbackReadiness: 100, evidenceCount: 12, serviceState: "Available with reduced capacity", timelineEvent: "Link margin crossed recovery threshold" },
  { n: 10, label: "Sustained recovery threshold reached", state: "Recovery monitoring", step: 10, progress: 56, optical: 6.9, fallback: 3.1, narrative: "Margin holds above the threshold for 15 continuous minutes.", validationPassed: 14, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 13, serviceState: "Available with reduced capacity", timelineEvent: "Sustained recovery confirmed" },
  { n: 11, label: "Twenty-five percent of traffic restored to optical", state: "Traffic transition in progress", step: 11, progress: 62, optical: 7.7, fallback: 2.3, narrative: "The first increment moves back to the optical path under guardrail supervision.", validationPassed: 15, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 15, serviceState: "Available with reduced capacity", timelineEvent: "First traffic increment restored" },
  { n: 12, label: "Customer service validated", state: "Validation in progress", step: 12, progress: 66, optical: 7.7, fallback: 2.3, narrative: "Customer objectives are validated before any further traffic movement.", validationPassed: 17, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 16, serviceState: "Available with reduced capacity", timelineEvent: "Customer service validated" },
  { n: 13, label: "Fifty percent of traffic restored", state: "Traffic transition in progress", step: 13, progress: 72, optical: 8.5, fallback: 1.5, narrative: "The second increment returns with continuous customer measurement.", validationPassed: 18, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 17, serviceState: "Available with reduced capacity", timelineEvent: "Second traffic increment restored" },
  { n: 14, label: "Customer service validated again", state: "Validation in progress", step: 14, progress: 76, optical: 8.5, fallback: 1.5, narrative: "Latency and loss remain within objective after the second increment.", validationPassed: 20, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 18, serviceState: "Available", timelineEvent: "Latency remained within objective" },
  { n: 15, label: "Full traffic restored to optical", state: "Traffic transition in progress", step: 15, progress: 82, optical: 10, fallback: 0, narrative: "All remaining traffic returns to the primary optical path.", validationPassed: 21, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 20, serviceState: "Available", timelineEvent: "Full traffic returned to optical" },
  { n: 16, label: "Final throughput validation completed", state: "Validation in progress", step: 16, progress: 86, optical: 10, fallback: 0, narrative: "Full committed capacity of 10 Gbps is confirmed on the optical path.", validationPassed: 23, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 21, serviceState: "Available", timelineEvent: "Final service validation passed" },
  { n: 17, label: "Final latency validation completed", state: "Customer service validated", step: 16, progress: 89, optical: 10, fallback: 0, narrative: "Latency returns to 4.6 ms across all traffic classes.", validationPassed: 24, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 22, serviceState: "Available", timelineEvent: "Final service validation passed" },
  { n: 18, label: "RF fallback released", state: "Customer service validated", step: 18, progress: 92, optical: 10, fallback: 0, narrative: "The temporary fallback state is closed by the execution owner.", validationPassed: 25, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 23, serviceState: "Available", timelineEvent: "Fallback released" },
  { n: 19, label: "SLO and error budget recalculated", state: "Customer service validated", step: 19, progress: 95, optical: 10, fallback: 0, narrative: "3.4 percent of the monthly error budget consumed with the objective protected.", validationPassed: 26, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 24, serviceState: "Available", timelineEvent: "Error budget recalculated" },
  { n: 20, label: "Recovery evidence completed", state: "Customer service validated", step: 20, progress: 97, optical: 10, fallback: 0, narrative: "The evidence package reaches 100 percent completeness.", validationPassed: 26, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 26, serviceState: "Available", timelineEvent: "Evidence package completed" },
  { n: 21, label: "Operational learning recorded", state: "Customer service validated", step: 21, progress: 99, optical: 10, fallback: 0, narrative: "The reusable Chennai recovery pattern is retained for similar services.", validationPassed: 26, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 26, serviceState: "Available", timelineEvent: "Operational learning recorded" },
  { n: 22, label: "Execution marked complete", state: "Completed", step: 22, progress: 100, optical: 10, fallback: 0, narrative: "The incident commander closes the execution with a complete evidence package.", validationPassed: 26, guardrail: "Passed", rollbackReadiness: 100, evidenceCount: 26, serviceState: "Available", timelineEvent: "Recovery marked complete" },
];

export interface ScenarioInjection {
  id: string;
  label: string;
  state: ExecutionState;
  guardrail: GuardrailStatus;
  exceptionId: string;
  narrative: string;
  recommended: string;
  requiresDecision: boolean;
}

export const scenarioInjections: ScenarioInjection[] = [
  { id: "inj-beam", label: "Simulate beam reacquisition failure", state: "Human intervention required", guardrail: "Triggered", exceptionId: "ex-beam", narrative: "Beam reacquisition timed out on the Mumbai recovery. Traffic remains protected on the alternate optical route.", recommended: "Allow one further attempt then escalate to optical engineering.", requiresDecision: true },
  { id: "inj-rf", label: "Simulate RF capacity failure", state: "Paused", guardrail: "Blocked", exceptionId: "ex-capacity", narrative: "Fallback headroom dropped below 20 percent. Traffic movement is blocked by a blocking guardrail.", recommended: "Trigger rollback to the alternate fiber route.", requiresDecision: true },
  { id: "inj-latency", label: "Simulate latency validation failure", state: "Rollback initiated", guardrail: "Triggered", exceptionId: "ex-latency", narrative: "Priority latency exceeded 12 ms after the first increment. The increment was returned to fallback.", recommended: "Retry the increment after the margin improves.", requiresDecision: true },
  { id: "inj-stale", label: "Simulate stale terminal telemetry", state: "Paused", guardrail: "Warning", exceptionId: "ex-stale", narrative: "Terminal telemetry aged beyond 30 seconds. The sustained recovery timer is paused.", recommended: "Pause execution until telemetry freshness recovers.", requiresDecision: true },
  { id: "inj-approval", label: "Simulate approval expiration", state: "Expired", guardrail: "Blocked", exceptionId: "ex-approval", narrative: "The approval window expired before the first increment. Execution is held with no traffic movement.", recommended: "Request an approval extension from the service reliability owner.", requiresDecision: true },
];

export const humanControlNote =
  "Human control requested. All agent execution is held until the execution owner resumes or stops the recovery.";
