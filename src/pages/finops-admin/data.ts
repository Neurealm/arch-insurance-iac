// Canonical tenant model for the neugain.io Agentic AI FinOps & Cost Management
// administration plane: principles, tenant outcomes, KPIs, the optimization
// opportunity registry, the FinOps decision pipeline, unit economics, policy
// governance, cloud account health, savings realization chain and execution
// channels. All values are synthetic demonstration data for tenant
// "DUAL Insurance Group".

export type Health = "Healthy" | "Degraded" | "Error" | "Draft" | "Attention" | "Suspended";
export type Risk = "Very Low" | "Low" | "Medium" | "High";

/* -------------------------------- principles ------------------------------ */

export const PRINCIPLES = [
  {
    id: "economics",
    title: "Economics by Design",
    short: "Connect cloud spend to workloads, applications, owners, products and business value.",
    hover:
      "Spend is only actionable when it is attributed. Every dollar is resolved to a workload, an application, an accountable owner, a business unit and, where a demand driver exists, a unit of business output.",
    detail: [
      "Billing records are normalized across AWS, Azure, GCP, Kubernetes, Datadog and Snowflake into one cost object model.",
      "Tag normalization and CMDB reconciliation resolve untagged and mis-tagged spend before allocation.",
      "Shared platform cost is allocated by declared drivers, never spread evenly by default.",
      "Unit economics models bind spend to a business demand driver so efficiency is measured against output, not raw spend.",
    ],
  },
  {
    id: "actionable",
    title: "Actionable Optimization",
    short: "Detect and engineer rightsizing, commitment, elasticity, storage, network, Kubernetes and architecture opportunities.",
    hover:
      "Detection is not a recommendation feed. Each opportunity is engineered into a specific target configuration with a defined change, a savings estimate and a rollback path.",
    detail: [
      "Detection combines rules, statistical baselines, utilization telemetry, forecasting and agentic investigation.",
      "Every opportunity resolves a target configuration, not a generic 'reduce size' suggestion.",
      "Provider-native recommendations are treated as one input signal, never as the decision.",
      "Opportunities below the tenant minimum savings policy are suppressed to protect change capacity.",
    ],
  },
  {
    id: "governed",
    title: "Governed Execution",
    short: "Policy, approval, blast-radius controls, rollback readiness and bounded automation before change.",
    hover:
      "No optimization executes outside tenant policy. Risk class, confidence, business criticality and autonomy policy jointly determine whether a change is automatic, approval-gated or blocked.",
    detail: [
      "Execution occurs only through registered channels with declared invocation modes.",
      "Rollback readiness is a precondition of approval for every production change.",
      "Blast-radius ceilings cap concurrent change per service, per account and per change window.",
      "Change freeze windows and SLO burn guards suspend automation without human action.",
    ],
  },
  {
    id: "provenance",
    title: "Savings Provenance",
    short: "Trace projected, approved, executed, validated and realized savings.",
    hover:
      "A detected opportunity is not realized savings. Each savings record carries its full state chain with the evidence that moved it between states.",
    detail: [
      "Projected savings are modelled; approved savings are policy-cleared; executed savings are applied changes.",
      "Technically validated savings have confirmed configuration and unaffected service behaviour.",
      "Realized savings are confirmed against provider invoices over two billing cycles.",
      "Disputed savings are held out of realized totals until reconciled with Finance.",
    ],
  },
  {
    id: "realization",
    title: "Continuous Realization",
    short: "Execution results, telemetry, financial outcomes and human decisions improve future recommendations.",
    hover:
      "Every executed change is a labelled training signal. Accepted, rejected, rolled back and disputed outcomes recalibrate confidence and risk scoring for the next recommendation cycle.",
    detail: [
      "Rejected recommendations record the rejection reason and feed suppression rules.",
      "Rollbacks reduce confidence for the originating detection method and scope.",
      "Realized-versus-projected variance recalibrates savings estimation per opportunity type.",
      "Owner decision latency informs approval routing and escalation policy.",
    ],
  },
] as const;

/* ----------------------------- tenant outcomes ---------------------------- */

export const OUTCOMES = [
  {
    id: "compliance",
    label: "Optimization Policy Compliance",
    result: "98.9%",
    target: "≥ 98.0%",
    definition:
      "Share of executed optimization actions that satisfied every applicable tenant policy at execution time, including approval, risk, confidence, blast-radius and change-window controls.",
    calculation: "compliant executed actions ÷ total executed actions, evaluated at execution timestamp",
    trend: "+0.4 pts over 90 days",
    contributors: "Change-window exceptions in shared Kubernetes platform",
    why: "Policy compliance is the control that keeps autonomous cost action auditable and defensible to risk, audit and Finance.",
  },
  {
    id: "decision",
    label: "Median Recommendation Decision",
    result: "84 ms",
    target: "≤ 150 ms",
    definition:
      "Median latency of the scoring and policy decision applied to a detected opportunity: eligibility, scoring, risk classification and routing outcome.",
    calculation: "p50 of decision-engine latency across all scored opportunities in the period",
    trend: "-11 ms over 30 days",
    contributors: "Commitment analysis (largest evaluation graph)",
    why: "Fast deterministic decisions allow the registry to be re-scored continuously as telemetry and pricing change.",
  },
  {
    id: "validation",
    label: "Realized Savings Validation",
    result: "96.1%",
    target: "≥ 95.0%",
    definition:
      "Share of executed savings that passed technical and billing validation and were accepted as realized savings by Finance.",
    calculation: "realized savings ÷ executed savings, measured after two billing cycles",
    trend: "+1.2 pts quarter over quarter",
    contributors: "Data transfer credits pending provider reconciliation",
    why: "This is the number that separates a cost programme from a reporting exercise: it proves the money actually left the invoice.",
  },
  {
    id: "coverage",
    label: "Cost Evidence Coverage",
    result: "91.8%",
    target: "≥ 90.0%",
    definition:
      "Share of governed spend for which complete technical and financial evidence exists: billing detail, utilization telemetry, ownership and dependency context.",
    calculation: "spend with complete evidence set ÷ total spend under governance",
    trend: "+3.6 pts over 90 days",
    contributors: "Kubernetes telemetry gap in AKS non-production",
    why: "Recommendations without evidence cannot be defended in an approval review and will not be approved by application owners.",
  },
] as const;

/* ---------------------------------- KPIs ---------------------------------- */

export const KPIS = [
  {
    id: "accounts",
    label: "Active Cloud Accounts",
    value: "128",
    secondary: "connected · 4 degraded",
    definition: "Provider accounts, subscriptions, projects and clusters with an active billing and telemetry connection to the tenant.",
    rows: [["Connected", "128"], ["Degraded", "4"], ["Pending onboarding", "6"], ["Last full sync", "14 min ago"]] as [string, string][],
    why: "Every disconnected account is spend the platform cannot govern, allocate or optimize.",
  },
  {
    id: "policies",
    label: "Optimization Policies",
    value: "22",
    secondary: "active · 3 pending updates",
    definition: "Tenant policies that determine eligibility, thresholds, approval routing, autonomy and execution controls for optimization action.",
    rows: [["Active", "22"], ["Pending change review", "3"], ["Draft", "5"], ["Last publication", "4 days ago"]] as [string, string][],
    why: "Policies are the boundary between recommendation and unsupervised change.",
  },
  {
    id: "spend",
    label: "Monthly Spend Under Governance",
    value: "$12.4M",
    secondary: "94% covered by allocation",
    definition: "Normalized monthly cloud and platform spend inside the tenant governance boundary across all connected accounts.",
    rows: [["Governed spend", "$12.4M"], ["Allocation coverage", "94%"], ["Unallocated", "$0.74M"], ["Growth vs prior month", "+2.1%"]] as [string, string][],
    why: "Governance coverage sets the maximum addressable opportunity; ungoverned spend cannot be optimized safely.",
  },
  {
    id: "potential",
    label: "Potential Monthly Savings",
    value: "$1.18M",
    secondary: "Confidence 89%",
    definition: "Policy-eligible, risk-adjusted monthly savings across all open opportunities in the registry.",
    rows: [["Gross detected", "$1.64M"], ["Policy eligible", "$1.31M"], ["Risk adjusted", "$1.18M"], ["Weighted confidence", "89%"]] as [string, string][],
    why: "Gross detection overstates value. Only policy-eligible, risk-adjusted savings should ever enter a financial plan.",
  },
  {
    id: "realized",
    label: "Realized Savings This Quarter",
    value: "$2.76M",
    secondary: "96% validated",
    definition: "Savings confirmed against provider invoices after technical validation and two billing cycles of observation.",
    rows: [["Executed", "$2.92M"], ["Technically validated", "$2.81M"], ["Realized", "$2.76M"], ["Disputed", "$74K"]] as [string, string][],
    why: "Realized savings is the only figure reported to Finance; everything upstream is pipeline.",
  },
  {
    id: "cycle",
    label: "Recommendation-to-Execution Time",
    value: "3.4 days",
    secondary: "p95 8.2 days",
    definition: "Elapsed time from opportunity detection to completed execution, including analysis, approval and change-window wait.",
    rows: [["Median", "3.4 days"], ["p95", "8.2 days"], ["Approval wait (median)", "1.9 days"], ["Change-window wait", "0.7 days"]] as [string, string][],
    why: "Every day an approved opportunity waits is savings permanently lost; cycle time is the throughput constraint of the programme.",
  },
] as const;

/* ------------------------ optimization opportunity registry ---------------- */

export interface Opportunity {
  id: string;
  type: string;
  scope: string;
  domain: string;
  recs: number;
  savings: number; // monthly USD
  confidence: number;
  risk: Risk;
  status: Health;
  owner: string;
  evaluated: string;
  evidence: string[];
  method: string;
  execution: string;
  rollback: string;
  approval: string;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "OPP-1041", type: "Resource Rightsizing", scope: "AWS Prod Analytics", domain: "Compute", recs: 482,
    savings: 214000, confidence: 91, risk: "Low", status: "Healthy", owner: "Analytics Platform", evaluated: "18 min ago",
    method: "Sustained utilization baseline (p95 over 28 days) with headroom modelling",
    evidence: ["CloudWatch CPU/memory p95 over 28 days", "Instance family price-performance comparison", "Application SLO headroom from Datadog", "Change history: no capacity incidents in 90 days"],
    execution: "Terraform plan/apply through governed pipeline", rollback: "Prior instance definition retained for 14 days",
    approval: "FinOps Lead + Application Owner",
  },
  {
    id: "OPP-1042", type: "Commitment Optimization", scope: "Azure Shared Services", domain: "Commitments", recs: 94,
    savings: 166000, confidence: 88, risk: "Medium", status: "Healthy", owner: "Cloud Finance", evaluated: "42 min ago",
    method: "Coverage and utilization simulation against 12-month normalized demand forecast",
    evidence: ["Reservation coverage and utilization history", "Forecast demand with seasonality adjustment", "Existing commitment expiry ladder", "Break-even analysis at 1yr and 3yr terms"],
    execution: "Provider commitment API, staged purchase", rollback: "Not reversible — staged purchase limits exposure",
    approval: "FinOps Lead + Finance Controller",
  },
  {
    id: "OPP-1043", type: "Kubernetes Economics", scope: "EKS / AKS Clusters", domain: "Platform", recs: 143,
    savings: 121000, confidence: 86, risk: "Medium", status: "Attention", owner: "Platform Engineering", evaluated: "2 hours ago",
    method: "Request vs actual usage analysis, bin-packing efficiency and node pool sizing",
    evidence: ["Container request/limit vs observed usage", "Node pool packing density by cluster", "HPA behaviour and scaling events", "AKS non-production telemetry gap flagged"],
    execution: "GitOps manifest change via GitHub pull request", rollback: "Revert commit, automatic reconcile",
    approval: "Platform Owner + Service Owner",
  },
  {
    id: "OPP-1044", type: "Elasticity & Scheduling", scope: "Non-Production Estate", domain: "Compute", recs: 264,
    savings: 98000, confidence: 94, risk: "Very Low", status: "Healthy", owner: "Cloud Engineering", evaluated: "31 min ago",
    method: "Idle-window detection across non-production workloads with calendar correlation",
    evidence: ["Connection and request activity by hour of day", "Developer working-hours calendar", "Historical off-hours utilization < 3%", "No batch dependency in off-hours window"],
    execution: "Scheduler policy through governed automation", rollback: "Schedule disable, immediate restore",
    approval: "Auto-approved under autonomy policy",
  },
  {
    id: "OPP-1045", type: "Storage Lifecycle", scope: "S3 / Blob Archive Tier", domain: "Storage", recs: 87,
    savings: 84000, confidence: 89, risk: "Low", status: "Healthy", owner: "Data Platform", evaluated: "1 hour ago",
    method: "Access-frequency analysis with retention and regulatory hold checks",
    evidence: ["Object access frequency over 180 days", "Retention schedule and legal hold register", "Retrieval cost model at target tier", "Restore latency tolerance from data owner"],
    execution: "Lifecycle policy via Terraform", rollback: "Tier restore, retrieval cost applies",
    approval: "Data Owner + FinOps Lead",
  },
  {
    id: "OPP-1046", type: "Orphaned Resources", scope: "Multi-Cloud Estate", domain: "Waste", recs: 1142,
    savings: 76000, confidence: 96, risk: "Very Low", status: "Healthy", owner: "Cloud Engineering", evaluated: "12 min ago",
    method: "Attachment, reference and traffic analysis with 30-day quarantine",
    evidence: ["Unattached volumes, unassociated IPs, idle load balancers", "No API or network reference in 45 days", "Snapshot lineage confirms no restore dependency", "Owner notification acknowledged"],
    execution: "Cloud API delete after quarantine expiry", rollback: "Snapshot retained 30 days before deletion",
    approval: "Auto-approved under autonomy policy",
  },
  {
    id: "OPP-1047", type: "Network & Data Movement", scope: "Cross-AZ / Egress", domain: "Network", recs: 46,
    savings: 62000, confidence: 74, risk: "Medium", status: "Attention", owner: "Network Engineering", evaluated: "5 hours ago",
    method: "Flow-log topology analysis identifying avoidable cross-zone and egress paths",
    evidence: ["VPC flow logs aggregated by source/destination zone", "Service dependency map from Datadog APM", "Endpoint availability for private routing", "Latency impact modelling per path"],
    execution: "Terraform network change, staged per path", rollback: "Route revert, 5-minute convergence",
    approval: "Network Owner + SRE Lead",
  },
  {
    id: "OPP-1048", type: "Platform & Architecture Efficiency", scope: "Underwriting Platform", domain: "Architecture", recs: 14,
    savings: 41000, confidence: 68, risk: "High", status: "Attention", owner: "Application Architecture", evaluated: "1 day ago",
    method: "Agentic architecture investigation across service topology and managed-service alternatives",
    evidence: ["Service call topology and duplication analysis", "Managed-service cost/benefit comparison", "Migration effort estimate", "Business criticality: Tier 1"],
    execution: "Design review then phased engineering delivery", rollback: "Phase-gated with parallel run",
    approval: "Architecture Review Board + CTO delegate",
  },
  {
    id: "OPP-1049", type: "Application & Service Unit Economics", scope: "Claims API", domain: "Unit Economics", recs: 23,
    savings: 34000, confidence: 82, risk: "Low", status: "Healthy", owner: "Claims Engineering", evaluated: "3 hours ago",
    method: "Cost-per-transaction regression against demand to isolate non-linear cost drivers",
    evidence: ["Cost per API call trend over 12 months", "Demand normalization for seasonality", "Cache hit ratio and redundant call analysis", "Downstream managed-service pricing tiers"],
    execution: "GitHub pull request with performance gate", rollback: "Feature flag disable",
    approval: "Service Owner",
  },
  {
    id: "OPP-1050", type: "Governance & Realization", scope: "Tenant-Wide", domain: "Governance", recs: 38,
    savings: 22000, confidence: 79, risk: "Low", status: "Attention", owner: "FinOps Office", evaluated: "6 hours ago",
    method: "Allocation gap, tagging exception and stalled-savings detection",
    evidence: ["Unallocated spend by account", "Tag policy violation register", "Approved-but-unexecuted opportunity ageing", "Disputed savings reconciliation queue"],
    execution: "Allocation rule update and owner escalation", rollback: "Rule version revert",
    approval: "FinOps Lead",
  },
];

/* --------------------------- FinOps decision pipeline ---------------------- */

export interface Stage {
  id: string;
  label: string;
  metric: string;
  metricLabel: string;
  summary: string;
  listTitle: string;
  items: string[];
  controls: string[];
  health: Health;
}

export const PIPELINE: Stage[] = [
  {
    id: "discover", label: "Discover Spend", metric: "128", metricLabel: "cloud accounts", health: "Healthy",
    summary: "Continuous ingestion of billing, usage, telemetry and portfolio context across every connected provider and platform.",
    listTitle: "Sources", items: ["AWS", "Azure", "GCP", "Kubernetes", "Datadog", "Snowflake", "Billing systems", "CMDB", "Application portfolio"],
    controls: ["Connector credential rotation every 90 days", "Sync failure alerts after two consecutive misses", "Read-only ingestion roles enforced"],
  },
  {
    id: "normalize", label: "Normalize & Allocate", metric: "94%", metricLabel: "allocation coverage", health: "Healthy",
    summary: "Raw billing is normalized into a single cost object model and allocated to accountable owners and business units.",
    listTitle: "Functions", items: ["Tag normalization", "Application mapping", "Owner mapping", "Shared cost allocation", "Business unit mapping", "Unit-cost preparation"],
    controls: ["Allocation rules versioned and reviewed quarterly", "Unallocated spend escalated above 8%", "Shared cost drivers require Finance sign-off"],
  },
  {
    id: "detect", label: "Detect Opportunity", metric: "1,491", metricLabel: "active opportunities", health: "Healthy",
    summary: "Multiple independent detection methods generate candidate opportunities, deduplicated into a single registry.",
    listTitle: "Methods", items: ["Rules", "Statistics", "Utilization", "Forecasting", "Architecture analysis", "Commitment analysis", "Waste detection", "Agentic investigation"],
    controls: ["Minimum savings threshold suppresses low-value noise", "Duplicate detection across methods", "Suppression list honours prior rejections"],
  },
  {
    id: "analyze", label: "Analyze Impact", metric: "1,204", metricLabel: "impact analyses complete", health: "Healthy",
    summary: "Each candidate is evaluated against service behaviour, dependency topology and business context before it can be scored.",
    listTitle: "Evaluates", items: ["Performance", "Reliability", "SLOs", "Dependencies", "Growth", "Seasonality", "Change history", "Security", "Business criticality"],
    controls: ["Tier-1 services require dependency map completeness", "SLO headroom below 15% blocks reduction", "Open incidents suspend analysis for the scope"],
  },
  {
    id: "score", label: "Prioritize & Score", metric: "89%", metricLabel: "weighted confidence", health: "Healthy",
    summary: "A deterministic score ranks opportunities so engineering capacity is spent on the highest risk-adjusted value.",
    listTitle: "Score inputs", items: ["Savings", "Confidence", "Risk", "Business impact", "Effort", "Time to value"],
    controls: ["Scoring weights are tenant configuration, not defaults", "Score changes are versioned and explainable", "Manual override requires justification"],
  },
  {
    id: "policy", label: "Approval / Policy", metric: "37", metricLabel: "awaiting approval", health: "Attention",
    summary: "Policy determines whether an opportunity executes automatically, requires approval, or is blocked.",
    listTitle: "Applies", items: ["Risk thresholds", "Confidence thresholds", "Owner approval", "FinOps approval", "Change policy", "Autonomy policy"],
    controls: ["Two-person approval for Tier-1 production", "Approval expiry after 14 days", "Freeze windows override autonomy policy"],
  },
  {
    id: "execute", label: "Execute / Track", metric: "212", metricLabel: "changes in flight", health: "Healthy",
    summary: "Approved change is executed only through registered channels, with tracking against the originating opportunity.",
    listTitle: "Channels", items: ["Cloud APIs", "Terraform", "Kubernetes", "GitHub", "ServiceNow", "Schedulers"],
    controls: ["Rollback readiness verified pre-execution", "Blast-radius ceiling of 5% concurrent capacity per service", "Automatic halt on SLO burn > 2x"],
  },
  {
    id: "validate", label: "Validate Savings", metric: "96.1%", metricLabel: "validation pass rate", health: "Healthy",
    summary: "Technical and financial outcomes are verified before any savings are reported as realized.",
    listTitle: "Validates", items: ["Technical outcome", "Billing outcome", "Performance", "SLO", "Normalized demand", "Realized savings"],
    controls: ["Two billing cycles before realization", "Demand normalization prevents false attribution", "Disputed savings held out of realized totals"],
  },
];

/* ----------------------------- unit economics ----------------------------- */

export interface UnitRow {
  id: string; service: string; spend: string; coverage: number; bu: string;
  unit: string; costPerUnit: string; trend: string; trendDir: "up" | "down" | "flat"; owner: string;
  composition: [string, string][]; driver: string;
}

export const UNIT_ECONOMICS: UnitRow[] = [
  {
    id: "UE-01", service: "Underwriting Platform", spend: "$3.62M", coverage: 98, bu: "Commercial Lines",
    unit: "Policy", costPerUnit: "$12.48", trend: "-4.1%", trendDir: "down", owner: "M. Okafor",
    driver: "Policies bound per month, normalized for renewal mix",
    composition: [["Compute", "$1.71M"], ["Managed data", "$0.86M"], ["Storage", "$0.52M"], ["Network", "$0.31M"], ["Observability", "$0.22M"]],
  },
  {
    id: "UE-02", service: "Claims API", spend: "$2.34M", coverage: 96, bu: "Claims",
    unit: "API Call", costPerUnit: "$0.0042", trend: "-2.6%", trendDir: "down", owner: "S. Whitfield",
    driver: "Billable API calls excluding health checks and retries",
    composition: [["Compute", "$1.02M"], ["API gateway", "$0.44M"], ["Managed data", "$0.51M"], ["Network", "$0.24M"], ["Observability", "$0.13M"]],
  },
  {
    id: "UE-03", service: "Data Warehouse", spend: "$2.01M", coverage: 94, bu: "Enterprise Data",
    unit: "TB Processed", costPerUnit: "$52.31", trend: "+3.4%", trendDir: "up", owner: "P. Raghavan",
    driver: "Terabytes scanned by governed query workloads",
    composition: [["Warehouse compute", "$1.34M"], ["Storage", "$0.38M"], ["Ingestion", "$0.19M"], ["Egress", "$0.10M"]],
  },
  {
    id: "UE-04", service: "Customer Portal", spend: "$1.37M", coverage: 93, bu: "Distribution",
    unit: "Active User", costPerUnit: "$1.27", trend: "-1.2%", trendDir: "down", owner: "L. Bergström",
    driver: "Monthly active authenticated users",
    composition: [["Compute", "$0.61M"], ["CDN & edge", "$0.28M"], ["Managed data", "$0.26M"], ["Network", "$0.14M"], ["Observability", "$0.08M"]],
  },
  {
    id: "UE-05", service: "Shared Kubernetes Platform", spend: "$1.06M", coverage: 97, bu: "Platform Engineering",
    unit: "vCPU Hour", costPerUnit: "$0.041", trend: "flat", trendDir: "flat", owner: "A. Iyer",
    driver: "Allocated vCPU hours across tenanted namespaces",
    composition: [["Node compute", "$0.72M"], ["Control plane", "$0.09M"], ["Storage", "$0.13M"], ["Network", "$0.12M"]],
  },
];

/* --------------------------- policy & governance -------------------------- */

export interface PolicyRow {
  id: string; family: string; active: number; pending: number; status: Health;
  purpose: string; enforcement: string; examples: string[]; owner: string;
}

export const POLICIES: PolicyRow[] = [
  { id: "POL-01", family: "Budget Guardrails", active: 14, pending: 1, status: "Healthy", owner: "FinOps Office",
    purpose: "Constrain spend growth per business unit and account against approved budget envelopes.",
    enforcement: "Alert at 80%, approval gate at 95%, provisioning block at 105%",
    examples: ["Commercial Lines monthly ceiling $4.1M", "Non-production ceiling $0.9M", "Net-new account provisioning requires budget assignment"] },
  { id: "POL-02", family: "Approval Gates", active: 9, pending: 0, status: "Healthy", owner: "Change Governance",
    purpose: "Determine which human roles must approve an optimization before execution.",
    enforcement: "Blocking — execution channel refuses unapproved change",
    examples: ["Tier-1 production requires two-person approval", "Commitment purchase requires Finance Controller", "Approval expires after 14 days"] },
  { id: "POL-03", family: "Savings Validation Rules", active: 7, pending: 1, status: "Healthy", owner: "Cloud Finance",
    purpose: "Define what evidence is required before savings can be reported as realized.",
    enforcement: "Blocking — savings remain in executed state until satisfied",
    examples: ["Two billing cycles of invoice confirmation", "Demand normalization applied", "Variance beyond 10% routes to dispute"] },
  { id: "POL-04", family: "Execution Risk Policies", active: 11, pending: 2, status: "Attention", owner: "SRE Governance",
    purpose: "Bound the operational risk any single optimization or batch may introduce.",
    enforcement: "Blocking with automatic halt",
    examples: ["Max 5% concurrent capacity reduction per service", "Automatic rollback on SLO burn > 2x", "No Tier-1 change during retail peak freeze"] },
  { id: "POL-05", family: "Tagging / Allocation Rules", active: 18, pending: 0, status: "Healthy", owner: "FinOps Office",
    purpose: "Ensure spend resolves to an accountable owner, application and business unit.",
    enforcement: "Advisory at ingest, blocking for new resource provisioning",
    examples: ["Mandatory owner, application, environment, cost-centre tags", "Shared cost driver declaration required", "Untagged spend escalated after 7 days"] },
  { id: "POL-06", family: "Commitment Policies", active: 6, pending: 0, status: "Healthy", owner: "Cloud Finance",
    purpose: "Govern reservation and savings-plan purchase, coverage targets and expiry laddering.",
    enforcement: "Approval-gated purchase with staged exposure",
    examples: ["Coverage target 72% of steady-state baseline", "Maximum 40% of commitment ladder expiring in one quarter", "3-year terms require CFO delegate"] },
  { id: "POL-07", family: "Anomaly Thresholds", active: 12, pending: 0, status: "Healthy", owner: "FinOps Office",
    purpose: "Detect abnormal spend movement early enough to intervene within the billing period.",
    enforcement: "Alerting with owner escalation",
    examples: ["3-sigma daily deviation per service", "New service spend above $5K/day", "Egress spike above 200% of trailing baseline"] },
  { id: "POL-08", family: "Minimum Savings Policies", active: 4, pending: 0, status: "Healthy", owner: "FinOps Office",
    purpose: "Protect scarce engineering change capacity from low-value optimization noise.",
    enforcement: "Suppression at detection",
    examples: ["Minimum $250/month per opportunity", "Minimum $2,500/month for Tier-1 production change", "Aggregate small items into batch candidates"] },
  { id: "POL-09", family: "Confidence Thresholds", active: 5, pending: 0, status: "Healthy", owner: "FinOps Engineering",
    purpose: "Set the evidence bar an opportunity must clear before it can be routed for action.",
    enforcement: "Routing control",
    examples: ["0.88 minimum for approval-gated execution", "0.94 minimum for autonomous execution", "Below 0.70 routes to investigation only"] },
  { id: "POL-10", family: "Autonomy Policies", active: 8, pending: 1, status: "Attention", owner: "Platform Governance",
    purpose: "Declare where digital coworkers may act without human approval.",
    enforcement: "Blocking — determines execution mode per opportunity class",
    examples: ["Autonomous: non-production scheduling, orphan cleanup after quarantine", "Approval-gated: all production compute change", "Never autonomous: commitment purchase, architecture change"] },
];

/* ------------------------- cloud accounts & health ------------------------ */

export interface AccountRow {
  id: string; provider: string; accounts: string; status: Health; lastSync: string;
  spendCoverage: number; allocationCoverage: number; telemetry: Health;
  note: string; spend: string; connector: string;
}

export const ACCOUNTS: AccountRow[] = [
  { id: "ACC-AWS", provider: "AWS", accounts: "64 accounts", status: "Healthy", lastSync: "8 min ago", spendCoverage: 99, allocationCoverage: 96, telemetry: "Healthy", spend: "$5.81M / mo", connector: "Cost & Usage Report + AssumeRole (read-only)", note: "Organization-wide CUR delivered hourly to the tenant analytics account." },
  { id: "ACC-AZ", provider: "Azure", accounts: "38 subscriptions", status: "Healthy", lastSync: "12 min ago", spendCoverage: 98, allocationCoverage: 94, telemetry: "Healthy", spend: "$3.42M / mo", connector: "Cost Management exports + Service Principal", note: "Enterprise Agreement billing scope with amortized cost view." },
  { id: "ACC-GCP", provider: "GCP", accounts: "11 projects", status: "Healthy", lastSync: "17 min ago", spendCoverage: 97, allocationCoverage: 92, telemetry: "Healthy", spend: "$0.94M / mo", connector: "BigQuery billing export", note: "Detailed usage export with resource-level granularity enabled." },
  { id: "ACC-K8S", provider: "Kubernetes Clusters", accounts: "9 clusters", status: "Degraded", lastSync: "3 hours ago", spendCoverage: 88, allocationCoverage: 74, telemetry: "Degraded", spend: "$1.06M / mo", connector: "In-cluster metering agent", note: "AKS non-production metering agent unavailable since 09:14 UTC — namespace allocation is estimated for two clusters and Kubernetes opportunities are held in Attention." },
  { id: "ACC-DD", provider: "Datadog Telemetry", accounts: "1 org", status: "Healthy", lastSync: "4 min ago", spendCoverage: 100, allocationCoverage: 89, telemetry: "Healthy", spend: "$0.62M / mo", connector: "API key, read-only scope", note: "Provides SLO, APM dependency and utilization evidence for impact analysis." },
  { id: "ACC-SNOW", provider: "Snowflake Spend", accounts: "3 accounts", status: "Healthy", lastSync: "26 min ago", spendCoverage: 96, allocationCoverage: 91, telemetry: "Healthy", spend: "$0.55M / mo", connector: "ACCOUNT_USAGE share", note: "Warehouse-level credit consumption mapped to query workloads." },
];

/* ---------------------- savings validation & realization ------------------ */

export interface SavingsStage {
  id: string; label: string; value: string; amount: number; tone: "blue" | "amber" | "green" | "slate";
  definition: string; gate: string; records: string;
}

export const SAVINGS_CHAIN: SavingsStage[] = [
  { id: "projected", label: "Projected Savings", value: "$3.84M", amount: 3.84, tone: "slate", records: "1,491 opportunities",
    definition: "Modelled annualized savings across all open, policy-eligible opportunities before approval.", gate: "Detection + scoring complete" },
  { id: "approved", label: "Approved Savings", value: "$3.15M", amount: 3.15, tone: "blue", records: "1,104 opportunities",
    definition: "Savings from opportunities that have cleared policy and received all required human approvals.", gate: "Approval policy satisfied" },
  { id: "executed", label: "Executed Savings", value: "$2.92M", amount: 2.92, tone: "blue", records: "1,038 changes applied",
    definition: "Savings from changes applied successfully through a registered execution channel.", gate: "Change applied, rollback window open" },
  { id: "technical", label: "Technically Validated", value: "$2.81M", amount: 2.81, tone: "green", records: "994 changes verified",
    definition: "Executed change confirmed in target configuration with no adverse performance, SLO or error-rate movement.", gate: "Technical validation suite passed" },
  { id: "realized", label: "Realized Savings", value: "$2.76M", amount: 2.76, tone: "green", records: "961 savings records",
    definition: "Savings confirmed against provider invoices over two billing cycles, normalized for demand change.", gate: "Finance accepted" },
  { id: "disputed", label: "Disputed Savings", value: "$74K", amount: 0.074, tone: "amber", records: "27 savings records",
    definition: "Executed savings where billing evidence and projection disagree beyond the 10% variance tolerance.", gate: "Held out of realized totals pending reconciliation" },
];

export const REALIZATION_METRICS = [
  { id: "pass", label: "Validation Pass Rate", value: "96.1%", tone: "ok" as const, definition: "Share of executed changes that passed both technical and billing validation.", detail: "Failures are dominated by demand-driven variance in the data warehouse scope rather than change defects." },
  { id: "rollback", label: "Rollback Rate", value: "1.3%", tone: "ok" as const, definition: "Share of executed optimizations reverted within the rollback window.", detail: "13 of 1,038 changes reverted; 9 triggered automatically on SLO burn, 4 by service owner request." },
  { id: "exceptions", label: "Exceptions", value: "42", tone: "warn" as const, definition: "Executions that completed under a documented policy exception.", detail: "Predominantly change-window exceptions for the shared Kubernetes platform during the metering outage." },
  { id: "disputed", label: "Disputed Savings", value: "$74K", tone: "warn" as const, definition: "Executed savings not yet accepted as realized by Finance.", detail: "Awaiting provider credit reconciliation on cross-region data transfer for two accounts." },
];

/* ------------------------- execution channels ----------------------------- */

export interface ChannelRow {
  id: string; system: string; mode: string; approval: string; health: Health; lastSync: string;
  operations: string[]; credential: string; note: string;
}

export const CHANNELS: ChannelRow[] = [
  { id: "CH-TF", system: "Terraform", mode: "Plan / Apply", approval: "Approval Required", health: "Healthy", lastSync: "22 min ago",
    operations: ["plan", "apply (gated)", "state read"], credential: "Workspace token, rotated 90 days",
    note: "Primary channel for infrastructure change. Plan output is attached to the approval record as evidence." },
  { id: "CH-AWS", system: "AWS", mode: "API / Assume Role", approval: "Approval Required", health: "Healthy", lastSync: "8 min ago",
    operations: ["modify-instance-attribute", "delete-volume", "put-lifecycle-configuration"], credential: "AssumeRole with external ID",
    note: "Write scope limited to the declared optimization operation set; all other operations are denied by policy." },
  { id: "CH-AZ", system: "Azure", mode: "API / Service Principal", approval: "Approval Required", health: "Healthy", lastSync: "14 min ago",
    operations: ["resize VM", "modify disk tier", "reservation purchase (gated)"], credential: "Service principal with certificate auth",
    note: "Commitment purchase requires Finance Controller approval in addition to FinOps Lead." },
  { id: "CH-K8S", system: "Kubernetes", mode: "GitOps Reconcile", approval: "Approval Required", health: "Degraded", lastSync: "3 hours ago",
    operations: ["manifest update", "node pool resize", "HPA policy update"], credential: "GitOps controller service account",
    note: "Degraded: AKS non-production metering agent offline, so Kubernetes execution is held pending telemetry recovery." },
  { id: "CH-GH", system: "GitHub", mode: "Pull Request", approval: "Approval Required", health: "Healthy", lastSync: "6 min ago",
    operations: ["open PR", "attach evidence", "merge (gated)"], credential: "GitHub App installation token",
    note: "Code and manifest change always lands as a reviewable pull request with the opportunity ID in the title." },
  { id: "CH-SNOW", system: "ServiceNow", mode: "Change Record", approval: "Approval Required", health: "Healthy", lastSync: "19 min ago",
    operations: ["create change", "attach risk assessment", "close change"], credential: "Integration user, scoped app",
    note: "Every production optimization produces a change record with the risk assessment and rollback plan attached." },
  { id: "CH-DD", system: "Datadog", mode: "API", approval: "No approval", health: "Healthy", lastSync: "4 min ago",
    operations: ["read metrics", "read SLO", "read APM topology"], credential: "Read-only API key",
    note: "Read-only evidence and validation channel; carries no execution authority." },
];

/* ------------------------ rightsizing policy drawer ----------------------- */

export const RIGHTSIZING_POLICY = {
  name: "Resource Rightsizing Policy",
  status: "Active",
  focus: "Underutilized compute",
  scope: "AWS + Azure production accounts",
  minSavings: "$250 / month",
  confidenceThreshold: "0.88",
  approval: "FinOps Lead + Application Owner",
  execution: "Approval-gated",
  rollback: "Required",
  steps: [
    { id: 1, label: "Detect sustained low utilization", detail: "p95 CPU below 22% and p95 memory below 35% across a rolling 28-day window, excluding known batch windows." },
    { id: 2, label: "Resolve workload owner", detail: "Resolve the accountable owner from tag metadata, reconciled against CMDB and the application portfolio." },
    { id: 3, label: "Resolve application", detail: "Bind the resource to an application and service so business criticality and SLO context can be loaded." },
    { id: 4, label: "Load technical telemetry", detail: "Load utilization, throughput, latency, error rate, saturation and scaling behaviour from Datadog and provider metrics." },
    { id: 5, label: "Load business criticality", detail: "Load service tier, revenue linkage, regulatory classification and customer impact rating." },
    { id: 6, label: "Analyze performance headroom", detail: "Model peak and seasonal demand to confirm the target configuration retains at least 40% headroom above observed peak." },
    { id: 7, label: "Calculate target configuration", detail: "Select the lowest-cost instance family and size meeting headroom, architecture, licensing and placement constraints." },
    { id: 8, label: "Estimate savings", detail: "Compute gross, policy-eligible and risk-adjusted monthly savings using effective negotiated rates and current commitment coverage." },
    { id: 9, label: "Calculate risk", detail: "Score performance, availability, change, security and business risk into a composite risk class." },
    { id: 10, label: "Apply policy", detail: "Evaluate minimum savings, confidence threshold, autonomy policy, freeze windows and blast-radius ceilings." },
    { id: 11, label: "Route for approval", detail: "Route to FinOps Lead and Application Owner with evidence, risk assessment and rollback plan attached." },
    { id: 12, label: "Execute through governed channel", detail: "Apply through Terraform with a ServiceNow change record; rollback definition is captured before apply." },
    { id: 13, label: "Validate technical outcome", detail: "Confirm target configuration, then observe SLO, latency, error rate and saturation for 72 hours." },
    { id: 14, label: "Validate realized savings", detail: "Reconcile against provider invoices over two billing cycles with demand normalization before reporting realized savings." },
  ],
};

/* --------------------------- service contract ----------------------------- */

export const CONTRACT = [
  { term: "ATTRIBUTED", body: "Cloud cost is connected to accountable workloads and owners." },
  { term: "EVIDENCED", body: "Recommendations are grounded in technical and financial evidence." },
  { term: "RISK AWARE", body: "Service impact is considered before optimization." },
  { term: "POLICY BOUND", body: "Recommendations and actions remain inside tenant controls." },
  { term: "APPROVED", body: "Human approval occurs when risk or autonomy policy requires it." },
  { term: "CONTROLLED", body: "Execution occurs only through approved channels." },
  { term: "VALIDATED", body: "Technical and financial outcomes are measured." },
  { term: "REALIZED", body: "Projected savings are not represented as realized savings until validated." },
  { term: "TRACEABLE", body: "Savings can be traced from opportunity through financial outcome." },
  { term: "LEARNING", body: "Execution outcomes improve future recommendations." },
];

/* ------------------------------ help registry ----------------------------- */

export const HELP: Record<string, { what: string; why: string; how: string; controls: string }> = {
  registry: {
    what: "The deduplicated inventory of every open optimization opportunity detected across the tenant estate.",
    why: "It is the single work queue for cost engineering; anything not in the registry is not being managed.",
    how: "Detection methods write candidates, deduplication merges them, and scoring ranks them every six hours.",
    controls: "Minimum savings, confidence thresholds and suppression rules determine what appears here.",
  },
  pipeline: {
    what: "The end-to-end lifecycle a cost opportunity travels from raw billing discovery to validated realized savings.",
    why: "It makes explicit that a detected opportunity is not savings until executed safely and financially validated.",
    how: "Each stage has its own inputs, controls and exit criteria; opportunities cannot skip stages.",
    controls: "Stage exit criteria are tenant policy and are enforced by the decision and execution engines.",
  },
  unitecon: {
    what: "Cost expressed per unit of business output rather than per resource.",
    why: "Absolute spend rises with growth; unit cost reveals whether the platform is becoming more or less efficient.",
    how: "Allocated spend is divided by a governed demand driver, normalized for seasonality and mix.",
    controls: "Demand drivers and normalization rules require Finance sign-off before publication.",
  },
  savings: {
    what: "The savings state chain from projected through approved, executed, technically validated and realized.",
    why: "Reporting projected savings as realized destroys programme credibility with Finance.",
    how: "Each transition requires specific evidence; disputed records are held out of realized totals.",
    controls: "Savings validation rules and the two-billing-cycle observation window.",
  },
  channels: {
    what: "Registered systems through which optimization change may be executed.",
    why: "Unregistered execution paths cannot be governed, approved, audited or rolled back.",
    how: "Each binding declares invocation mode, allowed operations, approval requirement and credential reference.",
    controls: "Operation allowlists, approval requirements and credential rotation schedules.",
  },
  accounts: {
    what: "Provider accounts, subscriptions, projects and clusters connected for billing and telemetry ingestion.",
    why: "Coverage gaps become blind spots that produce both missed savings and unsafe recommendations.",
    how: "Connectors sync billing and utilization on a fixed schedule with failure alerting.",
    controls: "Read-only ingestion roles, sync failure escalation and credential rotation.",
  },
  policies: {
    what: "Tenant policy families that bound detection, routing, approval, execution and financial recognition.",
    why: "Policy is the difference between governed autonomy and unsupervised change.",
    how: "Policies are versioned artifacts, simulated before publication and evaluated at decision time.",
    controls: "Change review for policy updates and blocking enforcement at the execution channel.",
  },
};
