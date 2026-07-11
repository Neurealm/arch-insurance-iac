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
  {
    id: "svc-payments",
    name: "Payments Platform",
    tier: "Tier 1",
    environment: "Production",
    region: "US Central",
    health: "Healthy",
    sloAvailability: 99.99,
    sloLatencyMs: 400,
    errorBudgetRemaining: 78,
    componentIds: ["cmp-payment-provider", "cmp-identity-provider", "cmp-network-ingress"],
  },
  {
    id: "svc-identity",
    name: "Identity Services",
    tier: "Tier 1",
    environment: "Production",
    region: "US Central",
    health: "At Risk",
    sloAvailability: 99.95,
    sloLatencyMs: 250,
    errorBudgetRemaining: 61,
    componentIds: ["cmp-identity-provider", "cmp-network-ingress"],
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

/* -------------------------- Context selectors -------------------------- */

export const tenants: Tenant[] = [
  { id: "tenant-contoso",  name: "Contoso Global" },
  { id: "tenant-fabrikam", name: "Fabrikam Industries" },
  { id: "tenant-northwind", name: "Northwind Retail" },
];

export const environments = ["Production", "Staging", "Development"] as const;
export type Environment = typeof environments[number];

export const regions = ["US Central", "US East", "EU West", "APAC"] as const;
export type Region = typeof regions[number];

export const timeRanges = ["15m", "1h", "6h", "24h", "7d", "30d"] as const;
export type TimeRange = typeof timeRanges[number];

export const demoRoles = [
  "SRE Engineer",
  "NOC Operator",
  "Incident Commander",
  "Service Owner",
  "Runbook Author",
  "Change Manager",
  "Digital Worker Administrator",
  "Platform Engineer",
  "Auditor",
  "Executive",
  "Read Only User",
  "Demo Controller",
] as const;
export type DemoRole = typeof demoRoles[number];

/* --------------------- Extended canonical entities --------------------- */

export interface KnowledgeItem {
  id: string; title: string; kind: "Runbook" | "Postmortem" | "Known Error" | "Playbook";
  serviceId?: string; source: string; freshness: string; snippet: string;
}
export interface Connector {
  id: string; name: string; kind: "Observability" | "Change" | "ITSM" | "Chat" | "Cloud" | "Data";
  status: "Healthy" | "Degraded" | "Unavailable"; freshness: string;
}
export interface Slo {
  id: string; serviceId: string; name: string; target: number; current: number;
  errorBudgetRemaining: number; window: string;
}
export interface EvidenceItem {
  id: string; title: string; source: string; capturedAt: string; incidentId?: string; kind: "trace" | "metric" | "log" | "config" | "change";
}
export interface Problem { id: string; title: string; state: "Open" | "Investigating" | "Closed"; serviceId: string; }
export interface Execution2 extends Execution { title: string; }

export const knowledgeItems: KnowledgeItem[] = [
  { id: "K-RB-0042", title: "RB-0042 · Checkout Latency and DB Saturation", kind: "Runbook", serviceId: "svc-global-order-processing", source: "runbook-library", freshness: "5m ago", snippet: "Approval-gated automation for query-plan regressions." },
  { id: "K-PM-10482", title: "PM-10482 · Checkout Latency Postmortem (draft)", kind: "Postmortem", serviceId: "svc-global-order-processing", source: "knowledge-base", freshness: "1h ago", snippet: "Query-plan regression from CHG-20391." },
  { id: "K-KE-217",  title: "KE-217 · SQL plan-cache warmup on index swap", kind: "Known Error", serviceId: "svc-global-order-processing", source: "knowledge-base", freshness: "12h ago", snippet: "Symptoms and workaround for post-index plan cache warmup." },
  { id: "K-PB-Checkout", title: "Playbook · Checkout SEV response", kind: "Playbook", serviceId: "svc-global-order-processing", source: "knowledge-base", freshness: "3d ago", snippet: "First-30-minute steps for checkout SEV incidents." },
];

export const connectors: Connector[] = [
  { id: "CON-OTEL",   name: "OpenTelemetry Collector", kind: "Observability", status: "Healthy",   freshness: "10s ago" },
  { id: "CON-PROM",   name: "Prometheus",              kind: "Observability", status: "Healthy",   freshness: "12s ago" },
  { id: "CON-SNOW",   name: "ServiceNow ITSM",         kind: "ITSM",          status: "Healthy",   freshness: "40s ago" },
  { id: "CON-SLACK",  name: "Slack",                   kind: "Chat",          status: "Healthy",   freshness: "8s ago"  },
  { id: "CON-AZDO",   name: "Azure DevOps",            kind: "Change",        status: "Degraded",  freshness: "2m ago"  },
  { id: "CON-AWS",    name: "AWS Cloud",               kind: "Cloud",         status: "Healthy",   freshness: "30s ago" },
  { id: "CON-SNOWFL", name: "Snowflake Warehouse",     kind: "Data",          status: "Healthy",   freshness: "5m ago"  },
];

export const slos: Slo[] = [
  { id: "SLO-GOP-AV", serviceId: "svc-global-order-processing", name: "Checkout availability", target: 99.95, current: 99.62, errorBudgetRemaining: 42, window: "28d" },
  { id: "SLO-GOP-LT", serviceId: "svc-global-order-processing", name: "Checkout p95 latency <750ms", target: 99.0,  current: 91.4, errorBudgetRemaining: 18, window: "28d" },
  { id: "SLO-PAY-AV", serviceId: "svc-payments",                name: "Payments availability",       target: 99.99, current: 99.99, errorBudgetRemaining: 78, window: "28d" },
  { id: "SLO-IDN-AV", serviceId: "svc-identity",                name: "Identity availability",       target: 99.95, current: 99.90, errorBudgetRemaining: 61, window: "28d" },
];

export const evidenceItems: EvidenceItem[] = [
  { id: "EV-101", title: "Checkout API trace p95 spans", source: "OpenTelemetry", capturedAt: "10:18 CT", incidentId: "INC-10482", kind: "trace"  },
  { id: "EV-102", title: "SQL primary conn util 98%",    source: "Prometheus",    capturedAt: "10:12 CT", incidentId: "INC-10482", kind: "metric" },
  { id: "EV-103", title: "CHG-20391 deployment record",  source: "Azure DevOps",  capturedAt: "09:58 CT", incidentId: "INC-10482", kind: "change" },
  { id: "EV-104", title: "Top query plan diff",           source: "SQL analyzer",  capturedAt: "10:20 CT", incidentId: "INC-10482", kind: "config" },
  { id: "EV-105", title: "Checkout error log burst",      source: "Loki",          capturedAt: "10:11 CT", incidentId: "INC-10482", kind: "log"    },
];

export const problemsList: Problem[] = [
  { id: "PRB-1082", title: "Post-deploy plan-cache regressions on SQL primary", state: "Investigating", serviceId: "svc-global-order-processing" },
  { id: "PRB-1077", title: "Checkout pod restart storms on config reload",       state: "Open",          serviceId: "svc-global-order-processing" },
];

export const changesList: Change[] = [
  primaryChange,
  { id: "CHG-20388", title: "Checkout API HPA tuning",           deployedAt: "yesterday", serviceId: "svc-global-order-processing", risk: "Low" },
  { id: "CHG-20376", title: "Identity token cache TTL reduction", deployedAt: "2d ago",   serviceId: "svc-identity",                risk: "Low" },
];

export const runbooksList: Runbook[] = [
  primaryRunbook,
  { id: "RB-0039", title: "SQL Primary Failover", version: "v2.1", state: "Published", autonomy: "Human Guided", serviceId: "svc-global-order-processing", fitnessScore: 74, steps: [
    { key: "s1", label: "Confirm primary is unhealthy",       description: "Verify SQL primary is unreachable or severely degraded via health probe, replication lag, and connection error rate.", kind: "diagnose" },
    { key: "s2", label: "Assess replica readiness",           description: "Check secondary replica replication lag, log shipping status, and quorum before initiating failover.", kind: "diagnose" },
    { key: "s3", label: "Quiesce application writes",         description: "Enable read-only mode on Checkout and Orders APIs and drain in-flight write transactions.", kind: "mitigate" },
    { key: "s4", label: "Promote secondary replica",          description: "Execute controlled failover to promote the healthiest secondary to primary and update the listener endpoint.", kind: "mitigate" },
    { key: "s5", label: "Repoint application connections",    description: "Recycle checkout and orders pod connection pools so clients bind to the new primary endpoint.", kind: "mitigate" },
    { key: "s6", label: "Validate service telemetry",         description: "Confirm write success rate, p95 latency, and replication resynchronization against baseline.", kind: "validate" },
    { key: "s7", label: "Run synthetic checkout journey",     description: "Execute end-to-end synthetic order to verify customer journey succeeds against the new primary.", kind: "validate" },
    { key: "s8", label: "Rollback: fail back to original primary", description: "If validation fails or original primary recovers cleanly, orchestrate a controlled fail-back during a maintenance window.", kind: "rollback" },
  ] },
  { id: "RB-0051", title: "Payments 3DS Provider Fallback", version: "v1.4", state: "Certified", autonomy: "Approval Gated Automation", serviceId: "svc-payments", fitnessScore: 81, steps: [] },
  { id: "RB-0060", title: "Identity Token Cache Recycle", version: "v1.0", state: "Approved", autonomy: "Supervised Autonomous", serviceId: "svc-identity", fitnessScore: 69, steps: [] },
];

export const executionsList: (Execution & { title: string })[] = [
  { ...primaryExecution, title: "Revert CHG-20391 and recycle checkout pods" },
  { id: "EXE-8802", runbookId: "RB-0039", incidentId: "INC-10471", state: "Completed", title: "SQL failover rehearsal" },
  { id: "EXE-8820", runbookId: "RB-0051", incidentId: "INC-10475", state: "Completed", title: "3DS provider fallback rehearsal" },
];

