// Canonical Contoso Global demo scenario. Deterministic — no runtime randomness.
// All operational data flows through OperationsProvider; do not import this
// directly into page components.

export type ServiceHealth =
  | "Healthy"
  | "At Risk"
  | "Degraded"
  | "Severely Degraded"
  | "Unavailable"
  | "Recovering";

export type IncidentState =
  | "Detected"
  | "Triaged"
  | "Declared"
  | "Investigating"
  | "Mitigating"
  | "Monitoring"
  | "Resolved"
  | "Closed";

export type ExecutionState =
  | "Pending"
  | "Awaiting Approval"
  | "Queued"
  | "Running"
  | "Paused"
  | "Validating"
  | "Rolling Back"
  | "Completed"
  | "Failed"
  | "Cancelled";

export type ApprovalState = "Pending" | "Approved" | "Denied" | "Expired" | "Revoked";

export type RunbookState =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Certified"
  | "Published"
  | "Deprecated"
  | "Retired";

export type AutonomyLevel =
  | "Documentation Only"
  | "Human Guided"
  | "AI Recommended"
  | "Human Initiated Automation"
  | "Approval Gated Automation"
  | "Supervised Autonomous"
  | "Policy Bounded Autonomous";

export interface Tenant {
  id: string;
  name: string;
}

export interface Component {
  id: string;
  name: string;
  kind: "api" | "compute" | "database" | "cache" | "queue" | "network" | "identity" | "vendor";
  health: ServiceHealth;
}

export interface BusinessService {
  id: string;
  name: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  environment: "Production" | "Staging" | "Development";
  region: string;
  health: ServiceHealth;
  sloAvailability: number;      // percent
  sloLatencyMs: number;         // p95 target
  errorBudgetRemaining: number; // percent
  componentIds: string[];
}

export interface DigitalWorker {
  id: string;
  name: string;
  role: string;
  autonomy: AutonomyLevel;
  status: "Idle" | "Investigating" | "Recommending" | "Executing" | "Validating";
}

export interface Incident {
  id: string;
  title: string;
  severity: "SEV 1" | "SEV 2" | "SEV 3" | "SEV 4";
  state: IncidentState;
  serviceId: string;
  openedAt: string;
  commander: string;
  summary: string;
  findings: string[];
}

export interface Change {
  id: string;
  title: string;
  deployedAt: string;
  serviceId: string;
  linkedIncidentId?: string;
  risk: "Low" | "Medium" | "High";
}

export interface RunbookStep {
  key: string;
  label: string;
  description: string;
  kind: "diagnose" | "mitigate" | "validate" | "rollback";
}

export interface Runbook {
  id: string;
  title: string;
  version: string;
  state: RunbookState;
  autonomy: AutonomyLevel;
  serviceId: string;
  fitnessScore: number; // 0-100
  steps: RunbookStep[];
}

export interface Approval {
  id: string;
  runbookId: string;
  executionId: string;
  requestedBy: string;
  requestedAt: string;
  state: ApprovalState;
  reason: string;
}

export interface Execution {
  id: string;
  runbookId: string;
  incidentId: string;
  state: ExecutionState;
  startedAt?: string;
  approvalId?: string;
}

export interface ScenarioStage {
  index: number;
  label: string;
}

export const scenarioStages: ScenarioStage[] = [
  { index: 0,  label: "Healthy baseline" },
  { index: 1,  label: "Degradation begins" },
  { index: 2,  label: "SLO burn alert activates" },
  { index: 3,  label: "Alerts correlate into one operational situation" },
  { index: 4,  label: "SEV 1 incident is declared" },
  { index: 5,  label: "Digital workers investigate" },
  { index: 6,  label: "Database hypothesis becomes dominant" },
  { index: 7,  label: "Remediation options are compared" },
  { index: 8,  label: "Runbook execution is requested" },
  { index: 9,  label: "Human approval is requested" },
  { index: 10, label: "Execution begins" },
  { index: 11, label: "Initial validation partially fails" },
  { index: 12, label: "Corrective branch executes" },
  { index: 13, label: "Service telemetry recovers" },
  { index: 14, label: "Customer journey validation succeeds" },
  { index: 15, label: "Incident resolves" },
  { index: 16, label: "Postmortem opens" },
  { index: 17, label: "Runbook improvement is proposed" },
  { index: 18, label: "New runbook version is certified" },
];

export const tenant: Tenant = { id: "tenant-contoso", name: "Contoso Global" };

export const components: Component[] = [
  { id: "cmp-api-gateway",       name: "API Gateway",          kind: "network",  health: "Healthy" },
  { id: "cmp-checkout-api",      name: "Checkout API",         kind: "api",      health: "Degraded" },
  { id: "cmp-orders-api",        name: "Orders API",           kind: "api",      health: "At Risk" },
  { id: "cmp-aks-checkout",      name: "AKS Checkout Cluster", kind: "compute",  health: "At Risk" },
  { id: "cmp-sql-primary",       name: "SQL Primary",          kind: "database", health: "Severely Degraded" },
  { id: "cmp-redis-cache",       name: "Redis Cache",          kind: "cache",    health: "Healthy" },
  { id: "cmp-kafka-orders",      name: "Kafka Orders",         kind: "queue",    health: "At Risk" },
  { id: "cmp-identity-provider", name: "Identity Provider",    kind: "identity", health: "Healthy" },
  { id: "cmp-network-ingress",   name: "Network Ingress",      kind: "network",  health: "Healthy" },
  { id: "cmp-payment-provider",  name: "Payment Provider",     kind: "vendor",   health: "Healthy" },
];

export const services: BusinessService[] = [
  {
    id: "svc-global-order-processing",
    name: "Global Order Processing",
    tier: "Tier 1",
    environment: "Production",
    region: "US Central",
    health: "Degraded",
    sloAvailability: 99.95,
    sloLatencyMs: 750,
    errorBudgetRemaining: 42,
    componentIds: components.map((c) => c.id),
  },
];

export const digitalWorkers: DigitalWorker[] = [
  { id: "DW-IC-01",       name: "DW-IC-01",       role: "Incident Commander",       autonomy: "Human Guided",             status: "Investigating" },
  { id: "DW-APP-02",      name: "DW-APP-02",      role: "Application SRE",          autonomy: "AI Recommended",           status: "Investigating" },
  { id: "DW-DB-03",       name: "DW-DB-03",       role: "Database SRE",             autonomy: "AI Recommended",           status: "Recommending"  },
  { id: "DW-NET-04",      name: "DW-NET-04",      role: "Network SRE",              autonomy: "AI Recommended",           status: "Idle"          },
  { id: "DW-CHANGE-05",   name: "DW-CHANGE-05",   role: "Change Risk Analyst",      autonomy: "AI Recommended",           status: "Recommending"  },
  { id: "DW-COMMS-06",    name: "DW-COMMS-06",    role: "Communications Coordinator", autonomy: "Human Initiated Automation", status: "Idle"     },
  { id: "DW-KNOW-07",     name: "DW-KNOW-07",     role: "Knowledge Engineer",       autonomy: "Documentation Only",       status: "Idle"          },
  { id: "DW-RCA-08",      name: "DW-RCA-08",      role: "RCA Analyst",              autonomy: "AI Recommended",           status: "Investigating" },
  { id: "DW-SEC-09",      name: "DW-SEC-09",      role: "Security Operations",      autonomy: "Approval Gated Automation", status: "Idle"          },
  { id: "DW-VALIDATE-10", name: "DW-VALIDATE-10", role: "Execution Validator",      autonomy: "Supervised Autonomous",    status: "Idle"          },
];

export const primaryIncident: Incident = {
  id: "INC-10482",
  title: "Global Order Processing checkout latency degradation",
  severity: "SEV 1",
  state: "Investigating",
  serviceId: "svc-global-order-processing",
  openedAt: "10:14 CT",
  commander: "DW-IC-01",
  summary:
    "Checkout API p95 latency rose from ~420ms to 2.8s. Transaction success declined from 99.7% to 91.4%. SQL primary connection utilization at 98%. Onset shortly after CHG-20391 index deployment.",
  findings: [
    "Recent database index deployment completed at 09:58.",
    "Checkout latency began increasing at 10:07.",
    "SQL connection pool utilization reached 98 percent at 10:12.",
    "Application pod CPU remained within normal range.",
    "Network round trip latency remained within normal range.",
    "Trace analysis showed database wait time as the dominant contributor.",
    "The index deployment changed the query plan for a high volume checkout query.",
    "Most appropriate mitigation: revert the affected index and recycle a controlled subset of application connections.",
    "Fallback: temporary connection pool increase.",
  ],
};

export const primaryChange: Change = {
  id: "CHG-20391",
  title: "Order database index optimization deployment",
  deployedAt: "09:58 CT",
  serviceId: "svc-global-order-processing",
  linkedIncidentId: "INC-10482",
  risk: "Medium",
};

export const primaryRunbook: Runbook = {
  id: "RB-0042",
  title: "Checkout Latency and Database Connection Saturation",
  version: "v3.2",
  state: "Certified",
  autonomy: "Approval Gated Automation",
  serviceId: "svc-global-order-processing",
  fitnessScore: 87,
  steps: [
    { key: "s1", label: "Confirm degradation signature",        description: "Correlate latency, error rate, and DB wait time against baseline.", kind: "diagnose" },
    { key: "s2", label: "Identify offending index",             description: "Compare query plans against pre-change baseline for top checkout queries.", kind: "diagnose" },
    { key: "s3", label: "Revert affected index",                description: "Drop and recreate the previous index definition in a controlled window.", kind: "mitigate" },
    { key: "s4", label: "Recycle checkout app connections",     description: "Drain and recycle a controlled subset of pods to refresh the connection pool.", kind: "mitigate" },
    { key: "s5", label: "Validate journey and SLIs",            description: "Run synthetic checkout journey; verify latency, error rate, connections, queue depth.", kind: "validate" },
    { key: "s6", label: "Fallback: raise connection pool cap",  description: "If validation fails, temporarily raise SQL pool cap and re-validate.", kind: "rollback" },
  ],
};

export const primaryExecution: Execution = {
  id: "EXE-8841",
  runbookId: "RB-0042",
  incidentId: "INC-10482",
  state: "Awaiting Approval",
  approvalId: "APR-4471",
};

export const primaryApproval: Approval = {
  id: "APR-4471",
  runbookId: "RB-0042",
  executionId: "EXE-8841",
  requestedBy: "DW-IC-01",
  requestedAt: "10:23 CT",
  state: "Pending",
  reason: "Approval-gated automation: revert index CHG-20391 and recycle checkout pods.",
};

export const primaryProblemId = "PRB-1082";
export const primaryPostmortemId = "PM-10482";
