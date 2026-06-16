// Demo scenario data model + curated scenario library for the
// Enterprise Cloud Application Digital Twin page.
// Designed so a single `Scenario` object is the source of truth for
// every visible section of the page. Replace `BASELINE_*` arrays with
// live telemetry in the future without touching consumers.

export type Health = "healthy" | "warning" | "critical" | "info";
export type ScenarioStatus = "healthy" | "warning" | "critical" | "simulation" | "resolved";
export type ViewId =
  | "twin" | "apm" | "infra" | "security" | "finops"
  | "reliability" | "incident" | "change" | "simulation";

/* ------------------------------------------------------------------ */
/* BASELINE TWIN STATE                                                 */
/* ------------------------------------------------------------------ */

export interface BusinessService {
  id: string; name: string; health: Health;
  avail: string; sloTarget: string; sloActual: string;
  p95: string; err: string; tx: string;
  incidents: number; risk: number; impact: string; owner: string;
}
export interface Transaction {
  id: string; name: string; health: Health;
  p50: string; p95: string; p99: string;
  err: string; tput: string; sloT: string; sloA: string;
  owner: string; lastDeploy: string; changes: number;
  topDep: string; costPerK: string;
}
export interface AppService {
  id: string; name: string; runtime: string; version: string; health: Health;
  p95: string; err: string; sat: string; tput: string; tasks: number;
  deploy: string; owner: string; cost: string; sec: string; changes: number;
}
export interface AwsResource { name: string; status: Health; util?: string; cost?: string; }
export interface AwsGroup { id: string; name: string; tone: string; resources: AwsResource[]; }
export interface GlobalKpi { id: string; label: string; value: string; tone: Health; }
export interface TimelineEvent {
  t: string; type: string; label: string; tone: Health;
  affects?: string[]; evidence?: string;
}

export const BASELINE_BUSINESS_SERVICES: BusinessService[] = [
  { id: "bs-cx",   name: "Customer Experience",   health: "healthy", avail: "99.98%", sloTarget: "99.95%", sloActual: "99.98%", p95: "182 ms", err: "0.08%", tx: "1.8M/hr",  incidents: 0, risk: 21, impact: "Medium",   owner: "Experience SRE Squad" },
  { id: "bs-om",   name: "Order Management",      health: "healthy", avail: "99.96%", sloTarget: "99.95%", sloActual: "99.96%", p95: "286 ms", err: "0.18%", tx: "612K/hr",  incidents: 0, risk: 28, impact: "High",     owner: "Orders SRE Squad" },
  { id: "bs-id",   name: "Identity Services",     health: "healthy", avail: "99.99%", sloTarget: "99.99%", sloActual: "99.99%", p95: "146 ms", err: "0.03%", tx: "920K/hr",  incidents: 0, risk: 18, impact: "Critical", owner: "Identity Platform Team" },
  { id: "bs-pay",  name: "Payment Services",      health: "healthy", avail: "99.97%", sloTarget: "99.95%", sloActual: "99.97%", p95: "228 ms", err: "0.08%", tx: "184.2K/hr",incidents: 0, risk: 26, impact: "High",     owner: "Payments SRE Squad" },
  { id: "bs-noti", name: "Notification Services", health: "healthy", avail: "99.94%", sloTarget: "99.90%", sloActual: "99.94%", p95: "210 ms", err: "0.12%", tx: "248K/hr",  incidents: 0, risk: 24, impact: "Medium",   owner: "Messaging Platform Team" },
  { id: "bs-ana",  name: "Analytics Platform",    health: "healthy", avail: "99.96%", sloTarget: "99.90%", sloActual: "99.96%", p95: "220 ms", err: "0.11%", tx: "4.8K jobs/hr", incidents: 0, risk: 27, impact: "Medium", owner: "Data Platform Team" },
];

export const BASELINE_TRANSACTIONS: Transaction[] = [
  { id: "tx-login",  name: "User Login",        health: "healthy", p50: "88 ms",  p95: "146 ms", p99: "290 ms",  err: "0.03%", tput: "8,100 rpm", sloT: "99.99%", sloA: "99.99%", owner: "Identity Platform Team", lastDeploy: "2 days ago",  changes: 0, topDep: "Authentication Service", costPerK: "$0.22" },
  { id: "tx-search", name: "Product Search",    health: "healthy", p50: "112 ms", p95: "240 ms", p99: "410 ms",  err: "0.09%", tput: "6,400 rpm", sloT: "99.95%", sloA: "99.96%", owner: "Search Platform Team",   lastDeploy: "6 hours ago", changes: 1, topDep: "Catalog Service",         costPerK: "$0.18" },
  { id: "tx-cart",   name: "Add to Cart",       health: "healthy", p50: "94 ms",  p95: "188 ms", p99: "320 ms",  err: "0.11%", tput: "5,800 rpm", sloT: "99.95%", sloA: "99.97%", owner: "Commerce SRE Squad",     lastDeploy: "1 day ago",   changes: 0, topDep: "Catalog Service",         costPerK: "$0.16" },
  { id: "tx-order",  name: "Submit Order",      health: "healthy", p50: "186 ms", p95: "342 ms", p99: "640 ms",  err: "0.18%", tput: "5,400 rpm", sloT: "99.95%", sloA: "99.96%", owner: "Orders SRE Squad",       lastDeploy: "3 hours ago", changes: 2, topDep: "Payment Service",         costPerK: "$0.42" },
  { id: "tx-pay",    name: "Process Payment",   health: "healthy", p50: "108 ms", p95: "228 ms", p99: "412 ms",  err: "0.08%", tput: "3,900 rpm", sloT: "99.95%", sloA: "99.97%", owner: "Payments SRE Squad",     lastDeploy: "2 hours ago", changes: 3, topDep: "Aurora PostgreSQL",       costPerK: "$0.34" },
  { id: "tx-noti",   name: "Send Notification", health: "healthy", p50: "82 ms",  p95: "210 ms", p99: "420 ms",  err: "0.12%", tput: "4,100 rpm", sloT: "99.90%", sloA: "99.94%", owner: "Messaging Platform Team",lastDeploy: "8 hours ago", changes: 1, topDep: "SQS",                     costPerK: "$0.12" },
  { id: "tx-report", name: "Generate Report",   health: "healthy", p50: "240 ms", p95: "520 ms", p99: "980 ms",  err: "0.14%", tput: "320 rpm",   sloT: "99.90%", sloA: "99.94%", owner: "Data Platform Team",     lastDeploy: "4 days ago",  changes: 0, topDep: "Analytics Platform",      costPerK: "$0.34" },
];

export const BASELINE_APP_SERVICES: AppService[] = [
  { id: "svc-web",   name: "Web Front End",         runtime: "ECS Fargate", version: "v8.4.0",  health: "healthy", p95: "210 ms", err: "0.12%", sat: "48%", tput: "9,200 rpm",  tasks: 24, deploy: "1 day ago",   owner: "Experience SRE Squad",   cost: "$11,400/mo", sec: "Clean",   changes: 0 },
  { id: "svc-mob",   name: "Mobile API",            runtime: "ECS Fargate", version: "v4.2.1",  health: "healthy", p95: "240 ms", err: "0.18%", sat: "52%", tput: "5,400 rpm",  tasks: 18, deploy: "2 days ago",  owner: "Experience SRE Squad",   cost: "$9,800/mo",  sec: "1 low",   changes: 0 },
  { id: "svc-search",name: "Search Service",        runtime: "ECS Fargate", version: "v3.1.4",  health: "healthy", p95: "180 ms", err: "0.09%", sat: "44%", tput: "6,400 rpm",  tasks: 16, deploy: "6 hours ago", owner: "Search Platform Team",   cost: "$7,200/mo",  sec: "Clean",   changes: 1 },
  { id: "svc-cat",   name: "Catalog Service",       runtime: "ECS Fargate", version: "v6.0.2",  health: "healthy", p95: "160 ms", err: "0.07%", sat: "38%", tput: "7,100 rpm",  tasks: 20, deploy: "3 days ago",  owner: "Commerce SRE Squad",     cost: "$8,600/mo",  sec: "Clean",   changes: 0 },
  { id: "svc-order", name: "Order Service",         runtime: "ECS Fargate", version: "v5.8.2",  health: "healthy", p95: "342 ms", err: "0.18%", sat: "54%", tput: "5,400 rpm",  tasks: 28, deploy: "3 hours ago", owner: "Orders SRE Squad",       cost: "$14,600/mo", sec: "Clean",   changes: 2 },
  { id: "svc-pay",   name: "Payment Service",       runtime: "ECS Fargate", version: "v2.14.6", health: "healthy", p95: "228 ms", err: "0.08%", sat: "44%", tput: "3,900 rpm",  tasks: 28, deploy: "2 days ago",  owner: "Payments SRE Squad",     cost: "$15,400/mo", sec: "Clean",   changes: 1 },
  { id: "svc-noti",  name: "Notification Service",  runtime: "Lambda",      version: "v4.0.6",  health: "healthy", p95: "210 ms", err: "0.12%", sat: "44%", tput: "4,100 rpm",  tasks: 0,  deploy: "8 hours ago", owner: "Messaging Platform Team",cost: "$5,400/mo",  sec: "Clean",   changes: 1 },
  { id: "svc-rep",   name: "Reporting Service",     runtime: "ECS Fargate", version: "v2.3.0",  health: "healthy", p95: "520 ms", err: "0.14%", sat: "40%", tput: "320 rpm",    tasks: 8,  deploy: "4 days ago",  owner: "Data Platform Team",     cost: "$4,800/mo",  sec: "Clean",   changes: 0 },
  { id: "svc-auth",  name: "Authentication Service",runtime: "Lambda",      version: "v3.2.1",  health: "healthy", p95: "146 ms", err: "0.03%", sat: "42%", tput: "8,100 rpm",  tasks: 0,  deploy: "2 days ago",  owner: "Identity Platform Team", cost: "$7,900/mo",  sec: "Clean",   changes: 0 },
  { id: "svc-inv",   name: "Inventory Service",     runtime: "ECS Fargate", version: "v3.5.1",  health: "healthy", p95: "200 ms", err: "0.10%", sat: "46%", tput: "3,200 rpm",  tasks: 12, deploy: "5 days ago",  owner: "Commerce SRE Squad",     cost: "$6,400/mo",  sec: "Clean",   changes: 0 },
  { id: "svc-rec",   name: "Recommendation Service",runtime: "Lambda",      version: "v1.9.2",  health: "healthy", p95: "260 ms", err: "0.18%", sat: "50%", tput: "2,800 rpm",  tasks: 0,  deploy: "2 days ago",  owner: "Data Platform Team",     cost: "$5,100/mo",  sec: "Clean",   changes: 0 },
];

export const BASELINE_AWS_GROUPS: AwsGroup[] = [
  { id: "g-edge", name: "Edge & Access", tone: "from-sky-50 to-white", resources: [
    { name: "Route53",    status: "healthy", util: "—",   cost: "$120/mo" },
    { name: "CloudFront", status: "healthy", util: "62%", cost: "$3,400/mo" },
    { name: "AWS WAF",    status: "healthy", util: "—",   cost: "$680/mo" },
  ]},
  { id: "g-api", name: "API & Routing", tone: "from-indigo-50 to-white", resources: [
    { name: "API Gateway",              status: "healthy", util: "58%", cost: "$2,100/mo" },
    { name: "Application Load Balancer", status: "healthy", util: "54%", cost: "$1,820/mo" },
  ]},
  { id: "g-compute", name: "Compute", tone: "from-violet-50 to-white", resources: [
    { name: "ECS Fargate",    status: "healthy", util: "54%", cost: "$84,200/mo" },
    { name: "Lambda",         status: "healthy", util: "44%", cost: "$18,400/mo" },
    { name: "Step Functions", status: "healthy", util: "—",   cost: "$1,260/mo" },
  ]},
  { id: "g-data", name: "Data", tone: "from-rose-50 to-white", resources: [
    { name: "Aurora PostgreSQL", status: "healthy", util: "44%", cost: "$52,800/mo" },
    { name: "DynamoDB",          status: "healthy", util: "48%", cost: "$22,400/mo" },
    { name: "ElastiCache Redis", status: "healthy", util: "52%", cost: "$11,200/mo" },
    { name: "S3",                status: "healthy", util: "—",   cost: "$14,600/mo" },
  ]},
  { id: "g-event", name: "Eventing", tone: "from-amber-50 to-white", resources: [
    { name: "EventBridge", status: "healthy", util: "—",  cost: "$840/mo" },
    { name: "SNS",         status: "healthy", util: "—",  cost: "$420/mo" },
    { name: "SQS",         status: "healthy", util: "1.2K msgs queued", cost: "$680/mo" },
  ]},
  { id: "g-net", name: "Network", tone: "from-teal-50 to-white", resources: [
    { name: "VPC",            status: "healthy", util: "—", cost: "—" },
    { name: "Subnets",        status: "healthy", util: "—", cost: "—" },
    { name: "Security Groups",status: "healthy", util: "—", cost: "—" },
    { name: "NAT Gateway",    status: "healthy", util: "62%", cost: "$4,200/mo" },
    { name: "Transit Gateway",status: "healthy", util: "44%", cost: "$2,100/mo" },
  ]},
  { id: "g-sec", name: "Security", tone: "from-indigo-50 to-white", resources: [
    { name: "IAM",            status: "healthy", util: "—", cost: "—" },
    { name: "KMS",            status: "healthy", util: "—", cost: "$320/mo" },
    { name: "Secrets Manager",status: "healthy", util: "Rotated", cost: "$280/mo" },
    { name: "GuardDuty",      status: "healthy", util: "—", cost: "$1,420/mo" },
    { name: "Security Hub",   status: "healthy", util: "—", cost: "$840/mo" },
  ]},
  { id: "g-obs", name: "Observability", tone: "from-sky-50 to-white", resources: [
    { name: "CloudWatch",        status: "healthy", util: "—", cost: "$8,400/mo" },
    { name: "Application Signals", status: "healthy", util: "—", cost: "$2,100/mo" },
    { name: "X-Ray",             status: "healthy", util: "—", cost: "$1,240/mo" },
    { name: "OpenTelemetry",     status: "healthy", util: "—", cost: "—" },
  ]},
  { id: "g-cost", name: "Cost", tone: "from-teal-50 to-white", resources: [
    { name: "Cost Explorer",      status: "info", util: "—", cost: "—" },
    { name: "Budgets",            status: "healthy", util: "On track", cost: "—" },
    { name: "Anomaly Detection",  status: "healthy", util: "0 anomalies", cost: "—" },
    { name: "Savings Plans",      status: "info", util: "62% coverage", cost: "—" },
  ]},
];

export const BASELINE_GLOBAL_KPIS: GlobalKpi[] = [
  { id: "health",  label: "Overall Health",        value: "Healthy",  tone: "healthy" },
  { id: "inc",     label: "Active Incidents",      value: "0",        tone: "healthy" },
  { id: "slo",     label: "SLO Compliance",        value: "99.98%",   tone: "healthy" },
  { id: "budget",  label: "Error Budget Remaining",value: "94%",      tone: "healthy" },
  { id: "p95",     label: "P95 Latency",           value: "188 ms",   tone: "healthy" },
  { id: "err",     label: "Error Rate",            value: "0.08%",    tone: "healthy" },
  { id: "spend",   label: "Monthly Spend",         value: "$451.8K",  tone: "info"    },
  { id: "fcst",    label: "Forecast Spend",        value: "$468.2K",  tone: "info"    },
  { id: "sec",     label: "Security Findings",     value: "5",        tone: "healthy" },
  { id: "auto",    label: "Automation Opps",       value: "11",       tone: "info"    },
];

export const BASELINE_TIMELINE: TimelineEvent[] = [
  { t: "-12h", type: "Change",     label: "Aurora parameter group review",         tone: "info" },
  { t: "-8h",  type: "Deployment", label: "Notification Service v4.0.6 released",  tone: "info" },
  { t: "-3h",  type: "Deployment", label: "Order Service v5.8.2 released",         tone: "info" },
  { t: "-1h",  type: "SLO",        label: "All SLOs within target",                tone: "healthy" },
];

/* ------------------------------------------------------------------ */
/* SCENARIO MODEL                                                      */
/* ------------------------------------------------------------------ */

export interface NovaResponse {
  summary: string;
  evidence: string[];
  rootCause: string;
  blastRadius: string[];
  recommended: { title: string; confidence: number; risk: "Low" | "Medium" | "High"; approval: "Required" | "Auto" };
  secondary?: string;
  nextBestAction: string;
}

export interface PlaybackStep {
  label: string;
  description?: string;
  focusIds: string[];
  selectId?: string;
  openNova?: boolean;
  view?: ViewId;
  timelineCursor?: string;
}

export interface BeforeAfterMetric {
  label: string;
  before: string;
  after: string;
  toneBefore: Health;
  toneAfter: Health;
}

export interface RecommendedAction {
  title: string;
  impact?: string;
  confidence: number;
  risk: "Low" | "Medium" | "High";
}

export interface Scenario {
  id: string;
  name: string;
  status: ScenarioStatus;
  severity: "none" | "low" | "medium" | "high" | "critical";
  demoPurpose: string;
  primaryView: ViewId;
  recommendedLens: string;
  primaryImpactedService: string | null;
  estimatedDuration: string;
  talkingPoints: string[];
  activeSelection: string | null;
  impactedLayers: string[];

  globalMetricOverrides: Partial<Record<string, { value: string; tone: Health }>>;
  businessServiceOverrides: Record<string, Partial<BusinessService>>;
  transactionOverrides: Record<string, Partial<Transaction>>;
  applicationServiceOverrides: Record<string, Partial<AppService>>;
  awsResourceOverrides: Record<string, {
    worst?: Health;
    resources?: Record<string, Partial<AwsResource>>;
  }>;

  highlightedDependencyPath: string[];
  criticalEdges: Array<[string, string]>;
  warningEdges: Array<[string, string]>;

  timelineEvents: TimelineEvent[];
  novaResponse: NovaResponse;
  recommendedActions: RecommendedAction[];
  playbackSteps: PlaybackStep[];
  beforeAndAfterMetrics: BeforeAfterMetric[];
  impactSummary: Array<{ label: string; value: string }>;
  availableReports: string[];
  acceptanceChecks: string[];
}

/* ------------------------------------------------------------------ */
/* HERO SCENARIOS                                                      */
/* ------------------------------------------------------------------ */

const PAYMENT_LATENCY: Scenario = {
  id: "payment-latency",
  name: "Payment Latency Incident",
  status: "critical",
  severity: "critical",
  demoPurpose: "Show SRE investigation from business service to transaction to application service to AWS resource to NOVA recommendation.",
  primaryView: "twin",
  recommendedLens: "SRE Operations",
  primaryImpactedService: "Payment Services",
  estimatedDuration: "7 minutes",
  impactedLayers: ["Business Services", "Transactions", "Application Services", "AWS Resources", "NOVA"],
  activeSelection: "svc-pay",
  talkingPoints: [
    "Payment Services degraded after a 12-minute-old deployment.",
    "Aurora connection pool saturation is the suspected root cause.",
    "Blast radius reaches Order Management and Notification Services.",
    "NOVA recommends rollback with 87% confidence; human approval required.",
  ],
  globalMetricOverrides: {
    health:  { value: "Warning",   tone: "warning" },
    inc:     { value: "2",         tone: "critical" },
    slo:     { value: "99.91%",    tone: "healthy" },
    budget:  { value: "38%",       tone: "warning" },
    p95:     { value: "284 ms",    tone: "warning" },
    err:     { value: "0.42%",     tone: "warning" },
    spend:   { value: "$482.3K",   tone: "info" },
    fcst:    { value: "$516.8K",   tone: "warning" },
    sec:     { value: "17",        tone: "warning" },
    auto:    { value: "23",        tone: "info" },
  },
  businessServiceOverrides: {
    "bs-pay":  { health: "critical", avail: "99.72%", sloActual: "99.72%", p95: "912 ms", err: "2.70%", risk: 89, incidents: 1 },
    "bs-om":   { health: "warning",  avail: "99.88%", sloActual: "99.88%", p95: "421 ms", err: "0.62%", risk: 64 },
    "bs-noti": { health: "warning",  avail: "99.81%", sloActual: "99.81%", p95: "680 ms", err: "1.10%", risk: 58, incidents: 1 },
  },
  transactionOverrides: {
    "tx-pay":   { health: "critical", p50: "310 ms", p95: "912 ms", p99: "1,840 ms", err: "2.70%", sloA: "99.72%", changes: 3 },
    "tx-order": { health: "warning",  p50: "230 ms", p95: "610 ms", p99: "1,120 ms", err: "0.90%", sloA: "99.86%" },
    "tx-noti":  { health: "warning",  p50: "180 ms", p95: "680 ms", p99: "1,310 ms", err: "1.10%", sloA: "99.81%" },
  },
  applicationServiceOverrides: {
    "svc-pay":   { health: "critical", version: "v2.14.7", p95: "912 ms", err: "2.70%", sat: "88%", tasks: 42, deploy: "2 hours ago", cost: "$18,200/mo", sec: "2 high", changes: 3 },
    "svc-order": { health: "warning",  p95: "610 ms", err: "0.90%", sat: "71%" },
    "svc-noti":  { health: "warning",  p95: "680 ms", err: "1.10%", sat: "62%" },
  },
  awsResourceOverrides: {
    "g-data": {
      worst: "critical",
      resources: {
        "Aurora PostgreSQL": { status: "critical", util: "91%", cost: "$62,400/mo" },
      },
    },
    "g-event": {
      worst: "warning",
      resources: { "SQS": { status: "warning", util: "24K msgs queued" } },
    },
    "g-compute": {
      worst: "warning",
      resources: { "ECS Fargate": { status: "warning", util: "78%" } },
    },
    "g-sec": {
      worst: "warning",
      resources: {
        "Secrets Manager": { status: "warning", util: "8 keys >90d" },
        "GuardDuty":       { status: "warning", util: "1 medium finding" },
      },
    },
    "g-cost": {
      worst: "warning",
      resources: {
        "Budgets":           { status: "warning", util: "+8.8% variance" },
        "Anomaly Detection": { status: "warning", util: "3 anomalies" },
      },
    },
    "g-net": {
      worst: "warning",
      resources: { "NAT Gateway": { status: "warning", util: "82%" } },
    },
    "g-api": {
      worst: "warning",
      resources: { "Application Load Balancer": { status: "warning", util: "74%" } },
    },
  },
  highlightedDependencyPath: ["bs-pay","tx-pay","svc-pay","g-data","g-event","svc-noti","bs-noti","svc-order","bs-om"],
  criticalEdges: [
    ["bs-pay","tx-pay"], ["tx-pay","svc-pay"], ["svc-pay","g-data"],
  ],
  warningEdges: [
    ["svc-pay","g-event"], ["g-event","svc-noti"], ["svc-noti","bs-noti"],
    ["bs-pay","tx-order"], ["tx-order","svc-order"], ["svc-order","g-data"],
  ],
  timelineEvents: [
    { t: "10:00", type: "Baseline",   label: "Normal baseline",                                tone: "healthy", affects: [] },
    { t: "10:04", type: "Deployment", label: "Payment Service v2.14.7 deployment completed",   tone: "info",    affects: ["svc-pay"], evidence: "CI/CD pipeline #4821 promoted v2.14.7 to prod" },
    { t: "10:08", type: "Alert",      label: "P95 latency begins rising on Process Payment",   tone: "warning", affects: ["tx-pay","svc-pay"], evidence: "P95 228 ms → 412 ms over 90 seconds" },
    { t: "10:11", type: "Alert",      label: "Aurora CPU threshold breached (>85%)",           tone: "critical",affects: ["g-data"], evidence: "Aurora writer CPU 91% sustained" },
    { t: "10:12", type: "SLO",        label: "Payment error rate exceeds SLO threshold",       tone: "critical",affects: ["bs-pay","tx-pay"], evidence: "Error rate 0.08% → 2.7%" },
    { t: "10:14", type: "Alert",      label: "SQS queue depth begins increasing",              tone: "warning", affects: ["g-event"], evidence: "Queue depth 1.2K → 18K messages" },
    { t: "10:16", type: "SLO",        label: "Order Management moves to warning",              tone: "warning", affects: ["bs-om","svc-order"], evidence: "P95 286 ms → 421 ms, err +0.44%" },
    { t: "10:18", type: "Incident",   label: "Incident INC-48291 opened",                      tone: "critical",affects: ["bs-pay"], evidence: "Auto-opened by SLO burn policy" },
    { t: "10:20", type: "Automation", label: "NOVA generates root cause hypothesis",           tone: "info",    affects: ["svc-pay"], evidence: "Confidence 87%" },
    { t: "10:22", type: "Change",     label: "Emergency change CHG-77128 drafted",             tone: "warning", affects: ["svc-pay"], evidence: "Rollback to v2.14.6" },
    { t: "10:24", type: "Approval",   label: "Human approval requested",                       tone: "warning", affects: ["svc-pay"], evidence: "Routed to Payments SRE Squad on-call" },
    { t: "10:26", type: "Runbook",    label: "Rollback runbook ready",                         tone: "info",    affects: ["svc-pay"], evidence: "Runbook RB-PAY-014 prepared" },
    { t: "10:30", type: "Approval",   label: "Awaiting approval",                              tone: "warning", affects: ["svc-pay"] },
  ],
  novaResponse: {
    summary: "Payment Services is critical due to elevated payment latency, increased transaction errors, and Aurora PostgreSQL saturation.",
    evidence: [
      "Payment Service P95 latency increased from 228 ms to 912 ms.",
      "Payment Service error rate increased from 0.08% to 2.7%.",
      "Aurora CPU reached 91%.",
      "Aurora active connections increased by 43%.",
      "Error budget burn rate increased to 8.4× normal.",
      "Deployment v2.14.7 occurred 12 minutes before degradation.",
      "SQS queue depth increased to 24,000 messages.",
      "Order Management is now warning due to delayed payment confirmation.",
      "Notification Services is warning due to delayed payment events.",
    ],
    rootCause: "Payment Service deployment v2.14.7 introduced connection pool saturation against Aurora PostgreSQL.",
    blastRadius: ["Payment Services","Order Management","Notification Services","Process Payment","Submit Order","Payment Service","Aurora PostgreSQL","SQS Payment Events Queue"],
    recommended: { title: "Rollback Payment Service deployment v2.14.7", confidence: 87, risk: "Medium", approval: "Required" },
    secondary: "Temporarily increase Aurora capacity and reduce retry concurrency.",
    nextBestAction: "Create emergency change, notify Payments SRE Squad, execute rollback runbook, monitor latency recovery, and generate incident update.",
  },
  recommendedActions: [
    { title: "Rollback deployment v2.14.7", impact: "Restore P95 to ~228 ms",  confidence: 87, risk: "Medium" },
    { title: "Scale Aurora writer instance", impact: "Relieve CPU saturation", confidence: 72, risk: "Low" },
    { title: "Throttle payment retry storm", impact: "Reduce error rate",      confidence: 81, risk: "Low" },
    { title: "Increase SQS consumers",       impact: "Drain backlog",          confidence: 76, risk: "Low" },
  ],
  playbackSteps: [
    { label: "Normal baseline",          description: "All services healthy.",                                    focusIds: [],                                                 timelineCursor: "10:00" },
    { label: "Deployment occurs",        description: "Payment Service v2.14.7 deployed.",                        focusIds: ["svc-pay"],                                        selectId: "svc-pay",  timelineCursor: "10:04" },
    { label: "Latency rises",            description: "Process Payment + Payment Service P95 spike.",             focusIds: ["tx-pay","svc-pay"],                               selectId: "tx-pay",   timelineCursor: "10:08" },
    { label: "Aurora saturates",         description: "Aurora CPU 91%, connections +43%.",                        focusIds: ["g-data","svc-pay"],                               selectId: "g-data",   timelineCursor: "10:11" },
    { label: "Error budget burns",       description: "SLO burn rate 8.4× normal.",                               focusIds: ["bs-pay","tx-pay"],                                selectId: "bs-pay",   timelineCursor: "10:12", view: "reliability" },
    { label: "Downstream impact",        description: "SQS, Notification, Order Management degrade.",             focusIds: ["g-event","svc-noti","bs-noti","bs-om","svc-order"], selectId: "g-event", timelineCursor: "10:16" },
    { label: "NOVA forms hypothesis",    description: "Evidence graph + probable root cause.",                    focusIds: ["svc-pay","g-data"],                               selectId: "svc-pay",  openNova: true, timelineCursor: "10:20" },
    { label: "Decision recommended",     description: "Rollback vs scale Aurora comparison.",                     focusIds: ["svc-pay"],                                        selectId: "svc-pay",  timelineCursor: "10:22" },
    { label: "Human approval requested", description: "Emergency change and rollback runbook ready.",             focusIds: ["svc-pay"],                                        selectId: "svc-pay",  timelineCursor: "10:24", view: "change" },
  ],
  beforeAndAfterMetrics: [
    { label: "Payment latency", before: "912 ms",  after: "260 ms",  toneBefore: "critical", toneAfter: "healthy" },
    { label: "Error rate",      before: "2.70%",   after: "0.18%",   toneBefore: "critical", toneAfter: "healthy" },
    { label: "Aurora CPU",      before: "91%",     after: "52%",     toneBefore: "critical", toneAfter: "healthy" },
    { label: "SLO burn",        before: "8.4×",    after: "1.1×",    toneBefore: "critical", toneAfter: "healthy" },
    { label: "Hourly cost",     before: "$742",    after: "$518",    toneBefore: "warning",  toneAfter: "healthy" },
    { label: "Business impact", before: "High",    after: "Low",     toneBefore: "critical", toneAfter: "healthy" },
  ],
  impactSummary: [
    { label: "Impacted Business Services", value: "3" },
    { label: "Impacted Transactions",      value: "2" },
    { label: "Critical Resources",         value: "2" },
    { label: "Warning Resources",          value: "3" },
    { label: "Active Incident",            value: "INC-48291" },
    { label: "Open Change",                value: "CHG-77128" },
    { label: "SLO Burn Rate",              value: "8.4×" },
    { label: "Business Impact",            value: "High" },
    { label: "Recovery Time",              value: "~15 min after approval" },
    { label: "Recommended Action",         value: "Rollback v2.14.7" },
  ],
  availableReports: ["Incident RCA", "Exec Summary", "SRE Report", "FinOps Impact", "Customer Impact"],
  acceptanceChecks: [
    "Payment Service node is critical",
    "Aurora PostgreSQL is critical",
    "SQS is warning",
    "Dependency path is highlighted",
    "NOVA recommendation visible",
  ],
};

const NORMAL_OPS: Scenario = {
  id: "normal-ops",
  name: "Normal Operations",
  status: "healthy",
  severity: "none",
  demoPurpose: "Show steady-state production health.",
  primaryView: "twin",
  recommendedLens: "Executive",
  primaryImpactedService: null,
  estimatedDuration: "2 minutes",
  impactedLayers: [],
  activeSelection: null,
  talkingPoints: [
    "All monitored business services within SLO targets.",
    "Telemetry coverage 91%, dependency confidence 78%.",
    "Error budget posture healthy across all critical journeys.",
  ],
  globalMetricOverrides: {
    health: { value: "Healthy",  tone: "healthy" },
    inc:    { value: "0",        tone: "healthy" },
    slo:    { value: "99.98%",   tone: "healthy" },
    budget: { value: "94%",      tone: "healthy" },
    p95:    { value: "188 ms",   tone: "healthy" },
    err:    { value: "0.08%",    tone: "healthy" },
    spend:  { value: "$451.8K",  tone: "info" },
    fcst:   { value: "$468.2K",  tone: "info" },
    sec:    { value: "5",        tone: "healthy" },
    auto:   { value: "11",       tone: "info" },
  },
  businessServiceOverrides: {},
  transactionOverrides: {},
  applicationServiceOverrides: {},
  awsResourceOverrides: {},
  highlightedDependencyPath: [],
  criticalEdges: [],
  warningEdges: [],
  timelineEvents: BASELINE_TIMELINE,
  novaResponse: {
    summary: "All monitored business services are operating within defined SLO targets. No active incidents are detected. Current telemetry coverage is 91%, dependency confidence is 78%, and error budget posture is healthy.",
    evidence: [
      "0 critical incidents in the last 24 hours.",
      "All transaction error rates within target.",
      "Aurora CPU steady at 44%.",
      "SQS queue depth nominal.",
    ],
    rootCause: "No active issue.",
    blastRadius: [],
    recommended: { title: "No action required", confidence: 99, risk: "Low", approval: "Auto" },
    nextBestAction: "Continue monitoring; review next deployment window for Payment Service v2.14.7 release.",
  },
  recommendedActions: [
    { title: "Optimize idle ECS tasks", impact: "Save ~$3,400/mo", confidence: 72, risk: "Low" },
    { title: "Promote Reporting Service to ARM", impact: "Save ~$1,800/mo", confidence: 68, risk: "Low" },
  ],
  playbackSteps: [
    { label: "Steady state", description: "All systems nominal.", focusIds: [], timelineCursor: "-1h" },
  ],
  beforeAndAfterMetrics: [],
  impactSummary: [
    { label: "Active Incidents", value: "0" },
    { label: "SLO Compliance",   value: "99.98%" },
    { label: "Error Budget",     value: "94%" },
    { label: "Monthly Spend",    value: "$451.8K" },
  ],
  availableReports: ["Weekly Reliability", "Cost Posture", "Exec Summary"],
  acceptanceChecks: [
    "No critical pulses",
    "No highlighted incident path",
    "NOVA shows healthy posture",
  ],
};

/* ------------------------------------------------------------------ */
/* SECONDARY SCENARIOS                                                 */
/* ------------------------------------------------------------------ */

const AURORA_SATURATION: Scenario = {
  id: "aurora-saturation",
  name: "Aurora Saturation",
  status: "critical",
  severity: "critical",
  demoPurpose: "Show infrastructure and database telemetry investigation.",
  primaryView: "infra",
  recommendedLens: "Infrastructure",
  primaryImpactedService: "Payment Services",
  estimatedDuration: "5 minutes",
  impactedLayers: ["Application Services", "AWS Resources"],
  activeSelection: "g-data",
  talkingPoints: [
    "Aurora writer CPU sustained above 90%.",
    "Read replica lag elevated; connection pool nearing exhaustion.",
    "Mitigation options: scale writer, route reads to replica, throttle clients.",
  ],
  globalMetricOverrides: {
    health: { value: "Warning",  tone: "warning" },
    inc:    { value: "1",        tone: "critical" },
    slo:    { value: "99.94%",   tone: "warning" },
    budget: { value: "62%",      tone: "warning" },
    p95:    { value: "242 ms",   tone: "warning" },
    err:    { value: "0.28%",    tone: "warning" },
  },
  businessServiceOverrides: { "bs-pay": { health: "warning", p95: "612 ms", err: "1.20%" } },
  transactionOverrides: { "tx-pay": { health: "warning", p95: "612 ms", err: "1.20%" } },
  applicationServiceOverrides: { "svc-pay": { health: "warning", p95: "612 ms", err: "1.20%", sat: "82%" } },
  awsResourceOverrides: {
    "g-data": { worst: "critical", resources: { "Aurora PostgreSQL": { status: "critical", util: "92%" } } },
    "g-compute": { worst: "warning", resources: { "ECS Fargate": { status: "warning", util: "76%" } } },
  },
  highlightedDependencyPath: ["svc-pay","g-data"],
  criticalEdges: [["svc-pay","g-data"]],
  warningEdges: [["bs-pay","tx-pay"],["tx-pay","svc-pay"]],
  timelineEvents: [
    { t: "09:30", type: "Baseline",   label: "Baseline Aurora CPU 44%",            tone: "healthy" },
    { t: "10:05", type: "Workload",   label: "Workload increase from batch jobs",  tone: "info" },
    { t: "10:18", type: "Alert",      label: "Aurora CPU > 85% sustained",         tone: "warning", affects: ["g-data"] },
    { t: "10:28", type: "Alert",      label: "Connection pool > 90%",              tone: "critical",affects: ["g-data"] },
    { t: "10:35", type: "Automation", label: "NOVA recommends writer scale-up",    tone: "info" },
  ],
  novaResponse: {
    summary: "Aurora PostgreSQL writer is saturated. Payment Services is degraded but not critical.",
    evidence: [
      "Aurora CPU sustained 90-92%.",
      "Read latency elevated 12 ms → 42 ms.",
      "Connection pool at 94%.",
      "Slow query log: 128 events in last 15m.",
    ],
    rootCause: "Increased read concurrency from upstream batch reporting jobs combined with steady payment write load.",
    blastRadius: ["Payment Services","Aurora PostgreSQL","Order Management"],
    recommended: { title: "Scale Aurora writer to db.r6g.4xlarge", confidence: 82, risk: "Low", approval: "Required" },
    secondary: "Route reporting reads to read replica.",
    nextBestAction: "Approve writer scale-up and reroute batch reporting to replica endpoint.",
  },
  recommendedActions: [
    { title: "Scale Aurora writer", impact: "Reduce CPU saturation", confidence: 82, risk: "Low" },
    { title: "Route reads to replica", impact: "Reduce writer load", confidence: 77, risk: "Low" },
  ],
  playbackSteps: [
    { label: "Aurora baseline",   focusIds: ["g-data"], selectId: "g-data", timelineCursor: "09:30" },
    { label: "Workload increase", focusIds: ["g-data"], selectId: "g-data", timelineCursor: "10:05" },
    { label: "Saturation alert",  focusIds: ["g-data","svc-pay"], selectId: "g-data", timelineCursor: "10:18" },
    { label: "NOVA recommendation", focusIds: ["g-data"], selectId: "g-data", openNova: true, timelineCursor: "10:35" },
  ],
  beforeAndAfterMetrics: [
    { label: "Aurora CPU", before: "92%", after: "54%", toneBefore: "critical", toneAfter: "healthy" },
    { label: "Read latency", before: "42 ms", after: "16 ms", toneBefore: "warning", toneAfter: "healthy" },
    { label: "Payment P95", before: "612 ms", after: "232 ms", toneBefore: "warning", toneAfter: "healthy" },
  ],
  impactSummary: [
    { label: "Critical Resources", value: "1" },
    { label: "Warning Resources",  value: "2" },
    { label: "Recommended Action", value: "Scale writer" },
  ],
  availableReports: ["Infrastructure Report", "FinOps Impact"],
  acceptanceChecks: ["Aurora critical", "Path svc-pay → g-data highlighted"],
};

const SQS_BACKLOG: Scenario = {
  id: "sqs-backlog",
  name: "SQS Backlog",
  status: "warning",
  severity: "high",
  demoPurpose: "Show asynchronous eventing and downstream service degradation.",
  primaryView: "apm",
  recommendedLens: "APM",
  primaryImpactedService: "Notification Services",
  estimatedDuration: "4 minutes",
  impactedLayers: ["Application Services", "AWS Resources"],
  activeSelection: "svc-noti",
  talkingPoints: [
    "SQS queue depth elevated; consumer lag growing.",
    "Notification delivery delays propagate to customer experience.",
    "Recommendation: scale consumers and inspect DLQ.",
  ],
  globalMetricOverrides: {
    health: { value: "Warning", tone: "warning" },
    inc:    { value: "1",       tone: "warning" },
    p95:    { value: "224 ms",  tone: "warning" },
    err:    { value: "0.32%",   tone: "warning" },
  },
  businessServiceOverrides: { "bs-noti": { health: "warning", err: "0.80%", p95: "520 ms" } },
  transactionOverrides:     { "tx-noti": { health: "warning", err: "0.80%", p95: "520 ms" } },
  applicationServiceOverrides: { "svc-noti": { health: "warning", err: "0.80%", p95: "520 ms" } },
  awsResourceOverrides: {
    "g-event": { worst: "warning", resources: { "SQS": { status: "warning", util: "18K msgs queued" } } },
  },
  highlightedDependencyPath: ["bs-noti","tx-noti","svc-noti","g-event"],
  criticalEdges: [],
  warningEdges: [["bs-noti","tx-noti"],["tx-noti","svc-noti"],["svc-noti","g-event"]],
  timelineEvents: [
    { t: "10:00", type: "Baseline", label: "Queue depth nominal",      tone: "healthy" },
    { t: "10:12", type: "Alert",    label: "Queue depth > 10K",        tone: "warning", affects: ["g-event"] },
    { t: "10:20", type: "Alert",    label: "Consumer lag elevated",    tone: "warning", affects: ["svc-noti"] },
    { t: "10:28", type: "Automation", label: "NOVA recommends consumer scale-out", tone: "info" },
  ],
  novaResponse: {
    summary: "SQS queue depth elevated; Notification Service consumer lag is growing.",
    evidence: ["Queue depth 1.2K → 18K", "Consumer lag 2s → 18s", "DLQ count 142"],
    rootCause: "Insufficient consumer concurrency for current event burst.",
    blastRadius: ["Notification Services","SQS"],
    recommended: { title: "Scale Notification Service consumers +50%", confidence: 78, risk: "Low", approval: "Required" },
    nextBestAction: "Approve scale-out and inspect DLQ for poison messages.",
  },
  recommendedActions: [
    { title: "Scale consumers +50%", impact: "Drain backlog", confidence: 78, risk: "Low" },
    { title: "Inspect DLQ", impact: "Identify poison messages", confidence: 60, risk: "Low" },
  ],
  playbackSteps: [
    { label: "Baseline",        focusIds: ["g-event"], selectId: "g-event", timelineCursor: "10:00" },
    { label: "Backlog grows",   focusIds: ["g-event","svc-noti"], selectId: "g-event", timelineCursor: "10:12" },
    { label: "Lag elevated",    focusIds: ["svc-noti"], selectId: "svc-noti", timelineCursor: "10:20" },
    { label: "NOVA action",     focusIds: ["svc-noti","g-event"], selectId: "svc-noti", openNova: true, timelineCursor: "10:28" },
  ],
  beforeAndAfterMetrics: [
    { label: "Queue depth", before: "18K", after: "1.2K", toneBefore: "warning", toneAfter: "healthy" },
    { label: "Consumer lag", before: "18s", after: "2s",  toneBefore: "warning", toneAfter: "healthy" },
  ],
  impactSummary: [
    { label: "Queue depth", value: "18K" },
    { label: "DLQ count",   value: "142" },
  ],
  availableReports: ["APM Report", "Eventing Report"],
  acceptanceChecks: ["SQS warning", "Notification Service warning"],
};

const DEPLOYMENT_REGRESSION: Scenario = {
  id: "deployment-regression",
  name: "Deployment Regression",
  status: "critical",
  severity: "critical",
  demoPurpose: "Show change correlation and rollback decisioning.",
  primaryView: "change",
  recommendedLens: "Change Impact",
  primaryImpactedService: "Payment Services",
  estimatedDuration: "6 minutes",
  impactedLayers: ["Application Services","Changes"],
  activeSelection: "svc-pay",
  talkingPoints: [
    "Payment Service v2.14.7 introduced a regression.",
    "Change correlation links deploy to error spike with 92% confidence.",
    "Rollback runbook is staged and ready for approval.",
  ],
  globalMetricOverrides: {
    health: { value: "Warning",  tone: "warning" },
    inc:    { value: "1",        tone: "critical" },
    p95:    { value: "284 ms",   tone: "warning" },
    err:    { value: "0.42%",    tone: "warning" },
  },
  businessServiceOverrides: { "bs-pay": { health: "critical", err: "2.20%", p95: "812 ms" } },
  transactionOverrides:     { "tx-pay": { health: "critical", err: "2.20%", p95: "812 ms" } },
  applicationServiceOverrides: { "svc-pay": { health: "critical", version: "v2.14.7", err: "2.20%", p95: "812 ms", changes: 3 } },
  awsResourceOverrides: {},
  highlightedDependencyPath: ["bs-pay","tx-pay","svc-pay"],
  criticalEdges: [["bs-pay","tx-pay"],["tx-pay","svc-pay"]],
  warningEdges: [],
  timelineEvents: [
    { t: "10:04", type: "Deployment", label: "Payment Service v2.14.7 deployed", tone: "info",     affects: ["svc-pay"] },
    { t: "10:09", type: "Alert",      label: "Error rate spike detected",        tone: "critical", affects: ["svc-pay"] },
    { t: "10:15", type: "Automation", label: "NOVA links deploy to spike (92%)", tone: "info" },
    { t: "10:22", type: "Change",     label: "Emergency rollback drafted",       tone: "warning" },
  ],
  novaResponse: {
    summary: "Payment Service v2.14.7 deployment is the likely cause of the current error spike.",
    evidence: ["Deploy at 10:04", "Error rate spike at 10:09", "No other changes in window", "Diff includes connection pool change"],
    rootCause: "Regression in connection handling introduced by v2.14.7.",
    blastRadius: ["Payment Services","Order Management"],
    recommended: { title: "Rollback to v2.14.6", confidence: 92, risk: "Medium", approval: "Required" },
    nextBestAction: "Execute rollback runbook and post-mortem.",
  },
  recommendedActions: [
    { title: "Rollback v2.14.7", impact: "Restore baseline", confidence: 92, risk: "Medium" },
    { title: "Hotfix forward",   impact: "Avoid rollback",   confidence: 54, risk: "High" },
  ],
  playbackSteps: [
    { label: "Deploy event",   focusIds: ["svc-pay"], selectId: "svc-pay", timelineCursor: "10:04" },
    { label: "Error spike",    focusIds: ["svc-pay","tx-pay"], selectId: "tx-pay", timelineCursor: "10:09" },
    { label: "Correlation",    focusIds: ["svc-pay"], selectId: "svc-pay", openNova: true, timelineCursor: "10:15" },
    { label: "Rollback ready", focusIds: ["svc-pay"], selectId: "svc-pay", timelineCursor: "10:22" },
  ],
  beforeAndAfterMetrics: [
    { label: "Error rate", before: "2.20%", after: "0.08%", toneBefore: "critical", toneAfter: "healthy" },
    { label: "P95",        before: "812 ms", after: "228 ms", toneBefore: "warning", toneAfter: "healthy" },
  ],
  impactSummary: [
    { label: "Change",         value: "CHG-77128" },
    { label: "Confidence",     value: "92%" },
    { label: "Recommended",    value: "Rollback v2.14.7" },
  ],
  availableReports: ["Change Impact Report", "RCA"],
  acceptanceChecks: ["Change linked to spike", "Rollback recommended"],
};

const SECURITY_EXPOSURE: Scenario = {
  id: "security-exposure",
  name: "Security Exposure",
  status: "warning",
  severity: "high",
  demoPurpose: "Show security posture, blast radius, and remediation workflow.",
  primaryView: "security",
  recommendedLens: "Security",
  primaryImpactedService: "Customer Experience",
  estimatedDuration: "5 minutes",
  impactedLayers: ["AWS Resources","Security"],
  activeSelection: "g-sec",
  talkingPoints: [
    "GuardDuty surfaced anomalous IAM access pattern.",
    "Secrets rotation overdue on payment DB master.",
    "Blast radius scoped to Customer Experience journey.",
  ],
  globalMetricOverrides: {
    health: { value: "Warning", tone: "warning" },
    sec:    { value: "21",      tone: "warning" },
  },
  businessServiceOverrides: { "bs-cx": { health: "warning" } },
  transactionOverrides: {},
  applicationServiceOverrides: { "svc-web": { health: "warning", sec: "2 high" } },
  awsResourceOverrides: {
    "g-sec": { worst: "warning", resources: {
      "GuardDuty":       { status: "warning", util: "1 medium finding" },
      "Secrets Manager": { status: "warning", util: "8 keys >90d" },
    }},
  },
  highlightedDependencyPath: ["bs-cx","svc-web","g-sec"],
  criticalEdges: [],
  warningEdges: [["svc-web","g-sec"]],
  timelineEvents: [
    { t: "08:00", type: "Security", label: "GuardDuty finding opened",       tone: "warning", affects: ["g-sec"] },
    { t: "09:15", type: "Security", label: "Secrets rotation alert (>90d)",  tone: "warning", affects: ["g-sec"] },
    { t: "10:05", type: "Automation", label: "NOVA recommends remediation",  tone: "info" },
  ],
  novaResponse: {
    summary: "Customer Experience has elevated security risk from anomalous IAM access and overdue secret rotations.",
    evidence: ["GuardDuty: 5 unusual API calls from new IP", "Secrets > 90 days: 8 keys", "Inspector: Node 16 EOL in 1 task def"],
    rootCause: "Operational drift and stale credentials in non-rotated secrets.",
    blastRadius: ["Customer Experience","Web Front End"],
    recommended: { title: "Rotate 8 stale secrets and revoke anomalous IAM session", confidence: 84, risk: "Low", approval: "Required" },
    nextBestAction: "Approve rotation runbook and update IAM access policy.",
  },
  recommendedActions: [
    { title: "Rotate stale secrets", impact: "Reduce exposure",  confidence: 84, risk: "Low" },
    { title: "Revoke IAM session",   impact: "Stop suspect access", confidence: 79, risk: "Low" },
  ],
  playbackSteps: [
    { label: "Finding opened", focusIds: ["g-sec"], selectId: "g-sec", timelineCursor: "08:00" },
    { label: "Rotation alert", focusIds: ["g-sec"], selectId: "g-sec", timelineCursor: "09:15" },
    { label: "NOVA action",    focusIds: ["g-sec","svc-web"], selectId: "g-sec", openNova: true, timelineCursor: "10:05" },
  ],
  beforeAndAfterMetrics: [
    { label: "Findings", before: "21", after: "5",  toneBefore: "warning", toneAfter: "healthy" },
    { label: "Stale secrets", before: "8", after: "0", toneBefore: "warning", toneAfter: "healthy" },
  ],
  impactSummary: [
    { label: "Findings", value: "21" },
    { label: "Blast Radius", value: "Customer Experience" },
  ],
  availableReports: ["Security Report","Compliance Posture"],
  acceptanceChecks: ["Security findings raised","Remediation recommended"],
};

const COST_ANOMALY: Scenario = {
  id: "cost-anomaly",
  name: "Cost Anomaly",
  status: "warning",
  severity: "medium",
  demoPurpose: "Show FinOps impact, unit economics, and optimization recommendations.",
  primaryView: "finops",
  recommendedLens: "FinOps",
  primaryImpactedService: "Order Management",
  estimatedDuration: "4 minutes",
  impactedLayers: ["AWS Resources","FinOps"],
  activeSelection: "g-cost",
  talkingPoints: [
    "Order Management spend trending +8.8% vs budget.",
    "Forecast overshoots monthly target by $34K.",
    "Three optimization actions could recover ~$24K/mo.",
  ],
  globalMetricOverrides: {
    health: { value: "Warning",  tone: "warning" },
    spend:  { value: "$482.3K",  tone: "warning" },
    fcst:   { value: "$516.8K",  tone: "warning" },
  },
  businessServiceOverrides: { "bs-om": { health: "warning" } },
  transactionOverrides: {},
  applicationServiceOverrides: { "svc-order": { health: "warning", cost: "$16,800/mo" } },
  awsResourceOverrides: {
    "g-cost": { worst: "warning", resources: {
      "Budgets":           { status: "warning", util: "+8.8% variance" },
      "Anomaly Detection": { status: "warning", util: "3 anomalies" },
    }},
  },
  highlightedDependencyPath: ["bs-om","svc-order","g-cost"],
  criticalEdges: [],
  warningEdges: [["bs-om","svc-order"],["svc-order","g-cost"]],
  timelineEvents: [
    { t: "Day 1", type: "FinOps", label: "Budget on track",                tone: "healthy" },
    { t: "Day 9", type: "FinOps", label: "Variance crosses +5% threshold", tone: "warning" },
    { t: "Day 12", type: "FinOps", label: "Anomaly Detection raises 3 events", tone: "warning" },
    { t: "Day 14", type: "Automation", label: "NOVA recommends optimization plan", tone: "info" },
  ],
  novaResponse: {
    summary: "Order Management spend trending above budget; three optimization actions could recover ~$24K/mo.",
    evidence: ["+8.8% variance", "3 anomalies", "Idle ECS tasks $7K/mo", "ALB underutilized $4K/mo"],
    rootCause: "Capacity provisioned for peak retained at off-peak.",
    blastRadius: ["Order Management","Order Service"],
    recommended: { title: "Right-size Order Service ECS + ALB", confidence: 76, risk: "Low", approval: "Required" },
    nextBestAction: "Apply optimization plan in next change window.",
  },
  recommendedActions: [
    { title: "Right-size Order Service ECS", impact: "Save ~$12K/mo", confidence: 76, risk: "Low" },
    { title: "Consolidate ALBs",             impact: "Save ~$4K/mo",  confidence: 68, risk: "Low" },
    { title: "Promote to Savings Plans",     impact: "Save ~$8K/mo",  confidence: 80, risk: "Low" },
  ],
  playbackSteps: [
    { label: "Budget healthy",  focusIds: ["g-cost"], selectId: "g-cost", timelineCursor: "Day 1" },
    { label: "Variance alert",  focusIds: ["g-cost"], selectId: "g-cost", timelineCursor: "Day 9" },
    { label: "Anomalies",       focusIds: ["g-cost","svc-order"], selectId: "g-cost", timelineCursor: "Day 12" },
    { label: "NOVA plan",       focusIds: ["g-cost"], selectId: "g-cost", openNova: true, timelineCursor: "Day 14" },
  ],
  beforeAndAfterMetrics: [
    { label: "Monthly spend", before: "$482.3K", after: "$458.1K", toneBefore: "warning", toneAfter: "healthy" },
    { label: "Variance",      before: "+8.8%",   after: "+0.4%",   toneBefore: "warning", toneAfter: "healthy" },
  ],
  impactSummary: [
    { label: "Variance",    value: "+8.8%" },
    { label: "Forecast",    value: "$516.8K" },
    { label: "Opportunity", value: "$24K/mo" },
  ],
  availableReports: ["FinOps Report","Unit Economics"],
  acceptanceChecks: ["Cost variance visible","Optimization plan visible"],
};

const AZ_FAILURE: Scenario = {
  id: "az-failure",
  name: "Availability Zone Failure",
  status: "simulation",
  severity: "high",
  demoPurpose: "Show resilience simulation and impact propagation.",
  primaryView: "simulation",
  recommendedLens: "Simulation",
  primaryImpactedService: "Multiple services",
  estimatedDuration: "6 minutes",
  impactedLayers: ["AWS Resources","Application Services","Business Services"],
  activeSelection: null,
  talkingPoints: [
    "Simulate us-east-1a outage and measure propagation.",
    "Validate cross-AZ failover and RTO/RPO posture.",
    "Surface recommended improvements after the simulation.",
  ],
  globalMetricOverrides: {
    health: { value: "Simulation", tone: "info" },
  },
  businessServiceOverrides: {
    "bs-pay": { health: "warning" }, "bs-om": { health: "warning" }, "bs-cx": { health: "warning" },
  },
  transactionOverrides: {},
  applicationServiceOverrides: {
    "svc-pay": { health: "warning" }, "svc-order": { health: "warning" }, "svc-web": { health: "warning" },
  },
  awsResourceOverrides: {
    "g-compute": { worst: "warning", resources: { "ECS Fargate": { status: "warning", util: "AZ-a draining" } } },
    "g-data":    { worst: "warning", resources: { "Aurora PostgreSQL": { status: "warning", util: "Failover ready" } } },
  },
  highlightedDependencyPath: ["bs-cx","bs-pay","bs-om","svc-web","svc-pay","svc-order","g-compute","g-data"],
  criticalEdges: [],
  warningEdges: [["svc-pay","g-compute"],["svc-order","g-compute"],["svc-pay","g-data"]],
  timelineEvents: [
    { t: "T+0",  type: "Simulation", label: "Simulate AZ-a failure", tone: "info" },
    { t: "T+1m", type: "Simulation", label: "ECS tasks draining",     tone: "warning" },
    { t: "T+2m", type: "Simulation", label: "Aurora failover complete", tone: "info" },
    { t: "T+4m", type: "Simulation", label: "Steady state restored",  tone: "healthy" },
  ],
  novaResponse: {
    summary: "Simulated AZ-a failure: customer journey impact is brief; cross-AZ failover behaves as designed.",
    evidence: ["Aurora failover 38s", "ECS rebalance 2m", "ALB cross-AZ routing healthy"],
    rootCause: "N/A (simulation).",
    blastRadius: ["Customer Experience","Payment Services","Order Management"],
    recommended: { title: "Enable read replica routing", confidence: 80, risk: "Low", approval: "Auto" },
    nextBestAction: "Adopt recommended improvements; rerun simulation quarterly.",
  },
  recommendedActions: [
    { title: "Enable read replica routing", impact: "Reduce failover blast", confidence: 80, risk: "Low" },
    { title: "Review connection pooling",   impact: "Faster recovery",       confidence: 70, risk: "Low" },
  ],
  playbackSteps: [
    { label: "Simulation start", focusIds: ["g-compute","g-data"], selectId: "g-compute", timelineCursor: "T+0" },
    { label: "Draining",         focusIds: ["g-compute"], selectId: "g-compute", timelineCursor: "T+1m" },
    { label: "Failover complete", focusIds: ["g-data"], selectId: "g-data", timelineCursor: "T+2m" },
    { label: "Recovered",        focusIds: [], timelineCursor: "T+4m" },
  ],
  beforeAndAfterMetrics: [
    { label: "RTO", before: "—", after: "~4 min", toneBefore: "info", toneAfter: "healthy" },
    { label: "RPO", before: "—", after: "~30 s",  toneBefore: "info", toneAfter: "healthy" },
  ],
  impactSummary: [
    { label: "RTO", value: "~4 min" },
    { label: "RPO", value: "~30 s" },
    { label: "Confidence", value: "82%" },
  ],
  availableReports: ["Simulation Report","Resilience Posture"],
  acceptanceChecks: ["Simulation lens active","Failover succeeds"],
};

const POST_INCIDENT_RCA: Scenario = {
  id: "post-incident-rca",
  name: "Post Incident RCA",
  status: "resolved",
  severity: "low",
  demoPurpose: "Show RCA generation, prevention actions, and executive summary.",
  primaryView: "incident",
  recommendedLens: "Incident Command",
  primaryImpactedService: "Payment Services",
  estimatedDuration: "5 minutes",
  impactedLayers: ["Incidents","Changes"],
  activeSelection: "svc-pay",
  talkingPoints: [
    "Incident INC-48217 resolved after rollback.",
    "Prevention actions: connection pool guardrail, canary gates.",
    "Executive RCA generated automatically.",
  ],
  globalMetricOverrides: {
    health: { value: "Healthy", tone: "healthy" },
    inc:    { value: "0",       tone: "healthy" },
    slo:    { value: "99.97%",  tone: "healthy" },
    budget: { value: "62%",     tone: "warning" },
  },
  businessServiceOverrides: { "bs-pay": { health: "healthy", incidents: 0 } },
  transactionOverrides:     { "tx-pay": { health: "healthy", p95: "260 ms", err: "0.18%" } },
  applicationServiceOverrides: { "svc-pay": { health: "healthy", version: "v2.14.6", p95: "260 ms", err: "0.18%", sat: "52%" } },
  awsResourceOverrides: {},
  highlightedDependencyPath: ["bs-pay","tx-pay","svc-pay"],
  criticalEdges: [],
  warningEdges: [],
  timelineEvents: [
    { t: "10:18", type: "Incident",   label: "INC-48217 opened",         tone: "critical" },
    { t: "10:30", type: "Change",     label: "Rollback executed",        tone: "warning" },
    { t: "10:44", type: "SLO",        label: "P95 recovered to baseline", tone: "healthy" },
    { t: "11:00", type: "Automation", label: "RCA generated",            tone: "info" },
  ],
  novaResponse: {
    summary: "Incident resolved. RCA and prevention actions are ready for executive review.",
    evidence: ["Rollback at 10:30","P95 recovered at 10:44","Customer impact ~0.6% checkout failure rate during window"],
    rootCause: "Connection pool change in v2.14.7 exhausted Aurora connections.",
    blastRadius: ["Payment Services","Order Management"],
    recommended: { title: "Adopt prevention plan", confidence: 95, risk: "Low", approval: "Auto" },
    nextBestAction: "Approve prevention plan and publish exec summary.",
  },
  recommendedActions: [
    { title: "Connection pool guardrail", impact: "Prevent recurrence", confidence: 95, risk: "Low" },
    { title: "Canary deploy gate",         impact: "Catch earlier",      confidence: 88, risk: "Low" },
  ],
  playbackSteps: [
    { label: "Incident",     focusIds: ["bs-pay"], selectId: "bs-pay", timelineCursor: "10:18" },
    { label: "Rollback",     focusIds: ["svc-pay"], selectId: "svc-pay", timelineCursor: "10:30" },
    { label: "Recovered",    focusIds: ["svc-pay"], selectId: "svc-pay", timelineCursor: "10:44" },
    { label: "RCA generated", focusIds: [], openNova: true, timelineCursor: "11:00" },
  ],
  beforeAndAfterMetrics: [
    { label: "Status", before: "Critical", after: "Resolved", toneBefore: "critical", toneAfter: "healthy" },
    { label: "P95",    before: "912 ms",   after: "260 ms",   toneBefore: "critical", toneAfter: "healthy" },
  ],
  impactSummary: [
    { label: "Incident",  value: "INC-48217" },
    { label: "Duration",  value: "~26 min" },
    { label: "Customer impact", value: "~0.6%" },
  ],
  availableReports: ["Executive RCA","Prevention Plan","Customer Comms"],
  acceptanceChecks: ["RCA visible","Prevention actions visible"],
};

/* ------------------------------------------------------------------ */

export const SCENARIOS: Scenario[] = [
  NORMAL_OPS,
  PAYMENT_LATENCY,
  AURORA_SATURATION,
  SQS_BACKLOG,
  DEPLOYMENT_REGRESSION,
  SECURITY_EXPOSURE,
  COST_ANOMALY,
  AZ_FAILURE,
  POST_INCIDENT_RCA,
];

export const DEFAULT_SCENARIO_ID = PAYMENT_LATENCY.id;

export const STATUS_TONE: Record<ScenarioStatus, { dot: string; chip: string; ring: string; soft: string; text: string; label: string }> = {
  healthy:    { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200",   ring: "ring-emerald-300/60", soft: "bg-emerald-50/60", text: "text-emerald-700", label: "Healthy" },
  warning:    { dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",         ring: "ring-amber-300/60",   soft: "bg-amber-50/60",   text: "text-amber-700",   label: "Warning" },
  critical:   { dot: "bg-rose-500",    chip: "bg-rose-50 text-rose-700 border-rose-200",            ring: "ring-rose-300/60",    soft: "bg-rose-50/60",    text: "text-rose-700",    label: "Critical" },
  simulation: { dot: "bg-sky-500",     chip: "bg-sky-50 text-sky-700 border-sky-200",               ring: "ring-sky-300/60",     soft: "bg-sky-50/60",     text: "text-sky-700",     label: "Simulation" },
  resolved:   { dot: "bg-violet-500",  chip: "bg-violet-50 text-violet-700 border-violet-200",      ring: "ring-violet-300/60",  soft: "bg-violet-50/60",  text: "text-violet-700",  label: "Resolved" },
};

/* ------------------------------------------------------------------ */
/* DERIVE: merge baseline + scenario into final view state             */
/* ------------------------------------------------------------------ */

export interface DerivedTwinState {
  scenario: Scenario;
  stepIndex: number;
  globalKpis: GlobalKpi[];
  businessServices: BusinessService[];
  transactions: Transaction[];
  appServices: AppService[];
  awsGroups: AwsGroup[];
  timelineEvents: TimelineEvent[];
  highlightedNodes: Set<string>;
  criticalEdges: Set<string>;
  warningEdges: Set<string>;
  novaResponse: NovaResponse;
  recommendedActions: RecommendedAction[];
}

const edgeKey = (a: string, b: string) => `${a}|${b}`;

export function deriveTwinState(scenario: Scenario, stepIndex: number): DerivedTwinState {
  const globalKpis = BASELINE_GLOBAL_KPIS.map(k => {
    const o = scenario.globalMetricOverrides[k.id];
    return o ? { ...k, value: o.value, tone: o.tone } : k;
  });

  const businessServices = BASELINE_BUSINESS_SERVICES.map(b => {
    const o = scenario.businessServiceOverrides[b.id];
    return o ? { ...b, ...o } : b;
  });

  const transactions = BASELINE_TRANSACTIONS.map(t => {
    const o = scenario.transactionOverrides[t.id];
    return o ? { ...t, ...o } : t;
  });

  const appServices = BASELINE_APP_SERVICES.map(s => {
    const o = scenario.applicationServiceOverrides[s.id];
    return o ? { ...s, ...o } : s;
  });

  const awsGroups = BASELINE_AWS_GROUPS.map(g => {
    const o = scenario.awsResourceOverrides[g.id];
    if (!o) return g;
    const resources = g.resources.map(r => {
      const ro = o.resources?.[r.name];
      return ro ? { ...r, ...ro } : r;
    });
    return { ...g, resources };
  });

  // Per-step focus expands the highlighted set
  const step = scenario.playbackSteps[stepIndex];
  const extraFocus = step?.focusIds ?? [];
  const highlightedNodes = new Set<string>([...scenario.highlightedDependencyPath, ...extraFocus]);

  const criticalEdges = new Set(scenario.criticalEdges.map(([a, b]) => edgeKey(a, b)));
  const warningEdges  = new Set(scenario.warningEdges.map(([a, b])  => edgeKey(a, b)));

  return {
    scenario,
    stepIndex,
    globalKpis,
    businessServices,
    transactions,
    appServices,
    awsGroups,
    timelineEvents: scenario.timelineEvents,
    highlightedNodes,
    criticalEdges,
    warningEdges,
    novaResponse: scenario.novaResponse,
    recommendedActions: scenario.recommendedActions,
  };
}
