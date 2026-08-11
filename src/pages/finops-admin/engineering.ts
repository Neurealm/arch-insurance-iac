// Engineering model behind the Agentic AI FinOps & Cost Management plane:
// recommendations with full evidence, confidence and risk decomposition,
// lifecycle history, savings records with provenance and deduplication,
// baselines, exceptions, approval and autonomy policy, execution governance,
// idempotency, rollback readiness, technical and financial validation,
// anomalies, audit trail, policy versions and role-based access.
//
// All values are synthetic demonstration data for tenant "DUAL Insurance Group".

/* --------------------------------- roles ---------------------------------- */

export type RoleId =
  | "platform_admin" | "finops_admin" | "finops_analyst" | "cloud_engineer"
  | "application_owner" | "finance" | "technology_finance" | "security_admin"
  | "auditor" | "read_only";

export type Capability =
  | "approve" | "reject" | "execute" | "edit_policy" | "publish_policy"
  | "edit_baseline" | "change_realized_status" | "simulate" | "export";

export const ROLES: { id: RoleId; label: string; caps: Capability[]; note: string }[] = [
  { id: "platform_admin", label: "Platform Admin", note: "Full administrative authority across the tenant FinOps plane.", caps: ["approve", "reject", "execute", "edit_policy", "publish_policy", "edit_baseline", "change_realized_status", "simulate", "export"] },
  { id: "finops_admin", label: "FinOps Admin", note: "Owns optimization policy, approval routing and savings recognition.", caps: ["approve", "reject", "edit_policy", "publish_policy", "edit_baseline", "change_realized_status", "simulate", "export"] },
  { id: "finops_analyst", label: "FinOps Analyst", note: "Analyses opportunities and prepares recommendations for approval.", caps: ["simulate", "export"] },
  { id: "cloud_engineer", label: "Cloud Engineer", note: "Executes approved change through governed channels.", caps: ["execute", "simulate", "export"] },
  { id: "application_owner", label: "Application Owner", note: "Approves change affecting owned applications.", caps: ["approve", "reject", "export"] },
  { id: "finance", label: "Finance", note: "Validates and accepts realized savings.", caps: ["change_realized_status", "export"] },
  { id: "technology_finance", label: "Technology Finance", note: "Owns allocation, baselines and unit economics models.", caps: ["edit_baseline", "export"] },
  { id: "security_admin", label: "Security Admin", note: "Conditional approver for change affecting security posture.", caps: ["approve", "reject", "export"] },
  { id: "auditor", label: "Auditor", note: "Read-only access to every decision, policy version and audit record.", caps: ["export"] },
  { id: "read_only", label: "Read Only", note: "Read-only access to dashboards and registries.", caps: [] },
];

export function can(role: RoleId, cap: Capability): boolean {
  return ROLES.find((r) => r.id === role)?.caps.includes(cap) ?? false;
}

export const CAP_REASON: Record<Capability, string> = {
  approve: "Only Platform Admin, FinOps Admin, Application Owner or Security Admin may record an approval decision.",
  reject: "Only an approver role may reject a recommendation.",
  execute: "Only Platform Admin or Cloud Engineer may trigger a governed execution.",
  edit_policy: "Only Platform Admin or FinOps Admin may modify optimization policy.",
  publish_policy: "Only Platform Admin or FinOps Admin may publish or activate a policy version.",
  edit_baseline: "Only Platform Admin, FinOps Admin or Technology Finance may change savings baseline rules.",
  change_realized_status: "Only FinOps Admin or Finance may change realized savings status.",
  simulate: "Only analyst and administrative roles may run policy simulation.",
  export: "Export is unavailable to this role.",
};

/* ------------------------------- lifecycle -------------------------------- */

export const LIFECYCLE_STATES = [
  "Detected", "Analyzed", "Evidence Complete", "Policy Eligible", "Prioritized",
  "Approval Pending", "Approved", "Scheduled", "Executing", "Executed",
  "Technical Validation", "Financial Validation", "Realized",
] as const;

export const TERMINAL_STATES = ["Rejected", "Expired", "Rolled Back", "Disputed"] as const;

export type LifecycleState = (typeof LIFECYCLE_STATES)[number] | (typeof TERMINAL_STATES)[number];

export interface LifecycleEvent { state: LifecycleState; at: string; actor: string; evidence: string }

/* ------------------------------- confidence -------------------------------- */

export interface ScoreComponent { label: string; score: number; weight: number; basis: string }

export const CONFIDENCE_WEIGHTS: ScoreComponent[] = [
  { label: "Evidence Completeness", score: 96, weight: 0.22, basis: "Share of required evidence classes present and within freshness policy." },
  { label: "Telemetry Stability", score: 94, weight: 0.18, basis: "Variance of the utilization signal across the observation window." },
  { label: "Allocation Confidence", score: 89, weight: 0.12, basis: "Confidence that spend is attributed to the correct cost object." },
  { label: "Ownership Confidence", score: 100, weight: 0.10, basis: "Owner resolved from tag metadata and confirmed against CMDB." },
  { label: "Demand Forecast", score: 88, weight: 0.14, basis: "Forecast accuracy for this workload over the trailing four periods." },
  { label: "Historical Pattern", score: 91, weight: 0.14, basis: "Realized-versus-projected accuracy of prior recommendations of this type." },
  { label: "Architecture Understanding", score: 85, weight: 0.10, basis: "Completeness of the dependency and topology map for the resource." },
];

export function compositeConfidence(components: ScoreComponent[] = CONFIDENCE_WEIGHTS): number {
  const total = components.reduce((s, c) => s + c.weight, 0);
  return Math.round(components.reduce((s, c) => s + c.score * c.weight, 0) / total);
}

/* ---------------------------------- risk ---------------------------------- */

export interface RiskDimension { label: string; score: number; weight: number; threshold: string; basis: string }

export const RISK_DIMENSIONS: RiskDimension[] = [
  { label: "Performance", score: 15, weight: 0.16, threshold: "≤ 40 for approval-gated execution", basis: "Headroom retained above observed peak after the change." },
  { label: "Availability", score: 20, weight: 0.16, threshold: "≤ 40; > 60 blocks execution", basis: "Redundancy, instance count and restart behaviour during the change." },
  { label: "Security", score: 5, weight: 0.10, threshold: "> 0 requires Security Admin approval", basis: "Change to network exposure, IAM, encryption or logging posture." },
  { label: "Change", score: 35, weight: 0.14, threshold: "≤ 50 outside freeze windows", basis: "Recent change density and incident correlation in the target scope." },
  { label: "Blast Radius", score: 30, weight: 0.14, threshold: "≤ 5% concurrent capacity per service", basis: "Number of dependent services and share of capacity affected." },
  { label: "Business Criticality", score: 40, weight: 0.16, threshold: "Tier 1 always requires two-person approval", basis: "Service tier, revenue linkage and regulatory classification." },
  { label: "Rollback Complexity", score: 10, weight: 0.08, threshold: "≤ 30 for autonomous execution", basis: "Steps, elapsed time and data risk involved in reverting." },
  { label: "Compliance", score: 8, weight: 0.06, threshold: "> 20 requires documented exception", basis: "Regulatory retention, residency and audit obligations touched." },
];

export function compositeRisk(dims: RiskDimension[] = RISK_DIMENSIONS): number {
  const total = dims.reduce((s, d) => s + d.weight, 0);
  return Math.round(dims.reduce((s, d) => s + d.score * d.weight, 0) / total);
}

export function riskClass(score: number): "Very Low" | "Low" | "Medium" | "High" {
  if (score < 15) return "Very Low";
  if (score < 30) return "Low";
  if (score < 55) return "Medium";
  return "High";
}

/* ------------------------------ recommendations ---------------------------- */

export interface EvidenceItem {
  klass: string; source: string; timestamp: string; freshness: string;
  quality: "Complete" | "Partial" | "Missing"; detail: string;
}

export interface CandidateAction {
  option: string; savings: string; risk: string; selected: boolean; verdict: string;
}

export interface Recommendation {
  id: string;
  opportunityId: string;
  objective: string;
  resource: string;
  application: string;
  owner: string;
  environment: string;
  current: string;
  recommended: string;
  savingsMonthly: number;
  confidence: number;
  riskScore: number;
  state: LifecycleState;
  autonomy: string;
  approvalRequired: boolean;
  approvalReason: string;
  condition: string;
  analysis: [string, string][];
  candidates: CandidateAction[];
  selectionReason: string;
  evidence: EvidenceItem[];
  confidenceComponents: ScoreComponent[];
  riskDimensions: RiskDimension[];
  history: LifecycleEvent[];
  savingsRecordId?: string;
  rejection?: {
    reason: string; gap: string; policy: string; corrective: string; detectedAt: string;
  };
}

const BASE_EVIDENCE: EvidenceItem[] = [
  { klass: "CPU utilization", source: "CloudWatch + Datadog", timestamp: "2026-08-11 06:00 UTC", freshness: "4h", quality: "Complete", detail: "41 days of 1-minute resolution; p95 6.7 vCPU equivalent, p99 8.1." },
  { klass: "Memory utilization", source: "Datadog agent", timestamp: "2026-08-11 06:00 UTC", freshness: "4h", quality: "Complete", detail: "41 days; p95 22.4 GiB of 64 GiB provisioned." },
  { klass: "Network throughput", source: "VPC flow logs", timestamp: "2026-08-11 04:00 UTC", freshness: "6h", quality: "Complete", detail: "Peak 1.9 Gbps, well inside the target family's 12.5 Gbps ceiling." },
  { klass: "Disk I/O", source: "CloudWatch EBS", timestamp: "2026-08-11 05:00 UTC", freshness: "5h", quality: "Complete", detail: "Peak 4,100 IOPS against 16,000 provisioned; not a constraint on the target size." },
  { klass: "Autoscaling behaviour", source: "AWS Auto Scaling", timestamp: "2026-08-10 23:00 UTC", freshness: "11h", quality: "Complete", detail: "No scale-out events in 41 days; group min=max=1." },
  { klass: "Application topology", source: "Datadog APM", timestamp: "2026-08-11 07:00 UTC", freshness: "3h", quality: "Complete", detail: "6 upstream, 3 downstream dependencies mapped; no unresolved edges." },
  { klass: "SLO", source: "Datadog SLO", timestamp: "2026-08-11 07:00 UTC", freshness: "3h", quality: "Complete", detail: "99.9% availability objective, 41% error budget remaining this period." },
  { klass: "Business criticality", source: "CMDB", timestamp: "2026-08-04", freshness: "7d", quality: "Complete", detail: "Tier 2, revenue-supporting, no regulatory reporting dependency." },
  { klass: "Demand forecast", source: "FinOps forecast engine", timestamp: "2026-08-11 02:00 UTC", freshness: "8h", quality: "Complete", detail: "Predicted 12-month peak need 7.4 vCPU including seasonal uplift." },
  { klass: "Incident history", source: "ServiceNow", timestamp: "2026-08-11 07:30 UTC", freshness: "2h", quality: "Complete", detail: "No capacity-related incident in 180 days." },
  { klass: "Change history", source: "ServiceNow + Terraform", timestamp: "2026-08-11 07:30 UTC", freshness: "2h", quality: "Complete", detail: "Last change 34 days ago; outside the 14-day observation exclusion window." },
  { klass: "Cloud pricing", source: "AWS Price List API", timestamp: "2026-08-11 01:00 UTC", freshness: "9h", quality: "Complete", detail: "Effective negotiated rate applied; no commitment coverage on this resource." },
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "REC-88419", opportunityId: "OPP-1041",
    objective: "Reduce compute cost without violating service performance or reliability requirements.",
    resource: "analytics-prod-ec2-142", application: "Underwriting Analytics", owner: "M. Okafor",
    environment: "Production", current: "m6i.4xlarge", recommended: "m6i.2xlarge",
    savingsMonthly: 1240, confidence: 91, riskScore: 24, state: "Approval Pending",
    autonomy: "Approval Required", approvalRequired: true, approvalReason: "Production workload",
    condition: "Sustained overprovisioning",
    analysis: [
      ["Current capacity", "16 vCPU"],
      ["Observed peak", "6.7 vCPU equivalent"],
      ["Predicted need", "7.4 vCPU"],
      ["Configured safety buffer", "20%"],
      ["Eligible target", "8 vCPU"],
    ],
    candidates: [
      { option: "Do nothing", savings: "$0", risk: "None", selected: false, verdict: "Rejected — leaves $1,240/month of policy-eligible savings unaddressed with no offsetting risk reduction." },
      { option: "m6i.2xlarge (8 vCPU)", savings: "$1,240/month", risk: "Low", selected: true, verdict: "Selected — highest savings candidate remaining within utilization headroom and risk policy." },
      { option: "m6i.xlarge (4 vCPU)", savings: "$1,810/month", risk: "High", selected: false, verdict: "Rejected — 4 vCPU is below the 7.4 vCPU predicted need plus the 20% safety buffer; breaches performance risk ceiling." },
    ],
    selectionReason: "Highest savings candidate remaining within utilization headroom, SLO, confidence, business criticality and production risk policy.",
    evidence: BASE_EVIDENCE,
    confidenceComponents: CONFIDENCE_WEIGHTS,
    riskDimensions: RISK_DIMENSIONS,
    savingsRecordId: "SVG-2026-04122",
    history: [
      { state: "Detected", at: "2026-08-04 02:14 UTC", actor: "Detection agent (utilization baseline)", evidence: "28-day p95 utilization below rightsizing threshold." },
      { state: "Analyzed", at: "2026-08-04 02:14 UTC", actor: "Impact analysis agent", evidence: "Dependency map, SLO headroom and incident history loaded." },
      { state: "Evidence Complete", at: "2026-08-04 03:02 UTC", actor: "Evidence service", evidence: "12 of 12 required evidence classes present and within freshness policy." },
      { state: "Policy Eligible", at: "2026-08-04 03:02 UTC", actor: "Policy engine", evidence: "Minimum savings, confidence threshold and risk ceiling satisfied." },
      { state: "Prioritized", at: "2026-08-04 03:03 UTC", actor: "Scoring engine", evidence: "Rank 7 of 482 in the rightsizing queue; time-to-value 6 days." },
      { state: "Approval Pending", at: "2026-08-04 03:05 UTC", actor: "Approval router", evidence: "Routed to Application Owner and FinOps Lead; SLA 5 business days." },
    ],
  },
  {
    id: "REC-88420", opportunityId: "OPP-1044",
    objective: "Eliminate off-hours compute cost in non-production without affecting developer productivity.",
    resource: "np-batch-asg-07", application: "Claims Test Estate", owner: "Cloud Engineering",
    environment: "Development", current: "Always-on ASG (6 instances)", recommended: "Scheduled 07:00–20:00 weekdays",
    savingsMonthly: 3180, confidence: 94, riskScore: 9, state: "Executed",
    autonomy: "Auto Execute Low Risk", approvalRequired: false, approvalReason: "Non-production, reversible, autonomy policy permits",
    condition: "Idle capacity outside working hours",
    analysis: [
      ["Off-hours utilization", "< 3% for 62 days"],
      ["Batch dependency in window", "None"],
      ["Restore time", "< 4 minutes"],
      ["Developer calendar overlap", "0 sessions in 62 days"],
    ],
    candidates: [
      { option: "Do nothing", savings: "$0", risk: "None", selected: false, verdict: "Rejected — sustained idle spend with no operational justification." },
      { option: "Schedule 07:00–20:00 weekdays", savings: "$3,180/month", risk: "Very Low", selected: true, verdict: "Selected — matches observed access pattern with a one-hour buffer either side." },
      { option: "Schedule 09:00–18:00 weekdays", savings: "$4,020/month", risk: "Medium", selected: false, verdict: "Rejected — cuts into observed early and late developer activity in two teams." },
    ],
    selectionReason: "Largest idle window that contains no observed developer or batch activity across the 62-day window.",
    evidence: BASE_EVIDENCE.slice(0, 8).map((e) => ({ ...e, detail: e.detail.replace("41 days", "62 days") })),
    confidenceComponents: CONFIDENCE_WEIGHTS.map((c) => ({ ...c, score: Math.min(100, c.score + 3) })),
    riskDimensions: RISK_DIMENSIONS.map((d) => ({ ...d, score: Math.max(0, Math.round(d.score * 0.35)) })),
    savingsRecordId: "SVG-2026-04088",
    history: [
      { state: "Detected", at: "2026-07-02 01:10 UTC", actor: "Detection agent (idle window)", evidence: "Off-hours utilization below 3% for 62 consecutive days." },
      { state: "Evidence Complete", at: "2026-07-02 01:40 UTC", actor: "Evidence service", evidence: "Access, batch and calendar evidence complete." },
      { state: "Policy Eligible", at: "2026-07-02 01:41 UTC", actor: "Policy engine", evidence: "Autonomy policy permits non-production scheduling without approval." },
      { state: "Scheduled", at: "2026-07-02 02:00 UTC", actor: "Scheduler", evidence: "Applied at next maintenance boundary." },
      { state: "Executed", at: "2026-07-03 21:00 UTC", actor: "Scheduler automation", evidence: "Schedule policy applied; idempotency key accepted." },
      { state: "Technical Validation", at: "2026-07-10 21:00 UTC", actor: "Validation agent", evidence: "No failed developer sessions, no batch overrun, restore time 3m41s." },
      { state: "Financial Validation", at: "2026-08-05 04:00 UTC", actor: "Cloud Finance", evidence: "Two billing cycles observed; variance -0.8%." },
      { state: "Realized", at: "2026-08-06 09:12 UTC", actor: "Finance (J. Alvarez)", evidence: "Accepted into realized savings for Q3." },
    ],
  },
  {
    id: "REC-88433", opportunityId: "OPP-1043",
    objective: "Recover Kubernetes request bloat in the shared platform without destabilising tenant workloads.",
    resource: "aks-np-cluster-02 / namespace claims-batch", application: "Claims Batch Processing", owner: "Platform Engineering",
    environment: "Non-Production", current: "requests 12 vCPU / 48 GiB", recommended: "requests 6 vCPU / 24 GiB",
    savingsMonthly: 2140, confidence: 61, riskScore: 38, state: "Rejected",
    autonomy: "Recommend", approvalRequired: true, approvalReason: "Evidence incomplete — cannot route for approval",
    condition: "Container requests materially above observed usage",
    analysis: [
      ["Observed p95 CPU", "3.9 vCPU"],
      ["Observed p95 memory", "Unavailable — metering agent offline"],
      ["Request-to-usage ratio (CPU)", "3.1x"],
      ["Observation window completeness", "62%"],
    ],
    candidates: [
      { option: "Do nothing", savings: "$0", risk: "None", selected: true, verdict: "Selected by policy — insufficient evidence to justify a reduction." },
      { option: "Reduce requests to 6 vCPU / 24 GiB", savings: "$2,140/month", risk: "Medium", selected: false, verdict: "Blocked — memory telemetry incomplete; a memory-bound reduction cannot be validated." },
    ],
    selectionReason: "No action taken. Memory telemetry is below the evidence completeness threshold, so any reduction would be unverifiable and could induce OOM behaviour.",
    evidence: [
      ...BASE_EVIDENCE.slice(0, 1),
      { klass: "Memory utilization", source: "AKS metering agent", timestamp: "2026-08-11 09:14 UTC", freshness: "Stale (8h gap)", quality: "Missing", detail: "Metering agent offline in AKS non-production since 09:14 UTC; 38% of the observation window has no memory samples." },
      ...BASE_EVIDENCE.slice(2, 7),
    ],
    confidenceComponents: CONFIDENCE_WEIGHTS.map((c) =>
      c.label === "Evidence Completeness" ? { ...c, score: 62 } : c.label === "Telemetry Stability" ? { ...c, score: 48 } : c),
    riskDimensions: RISK_DIMENSIONS.map((d) => (d.label === "Availability" ? { ...d, score: 55 } : d)),
    rejection: {
      reason: "Insufficient memory telemetry",
      gap: "38% of the 28-day observation window has no memory samples for namespace claims-batch; the AKS non-production metering agent has been offline since 09:14 UTC.",
      policy: "Evidence Requirements — Kubernetes Economics v4 (minimum 90% telemetry completeness for memory-bound reductions).",
      corrective: "Restore the AKS non-production metering agent, then allow a full 28-day observation window to accumulate before re-evaluation.",
      detectedAt: "2026-08-11 09:22 UTC",
    },
    history: [
      { state: "Detected", at: "2026-08-09 01:05 UTC", actor: "Detection agent (request bloat)", evidence: "CPU request-to-usage ratio 3.1x." },
      { state: "Analyzed", at: "2026-08-09 01:06 UTC", actor: "Impact analysis agent", evidence: "Namespace dependency map loaded; memory series incomplete." },
      { state: "Rejected", at: "2026-08-11 09:22 UTC", actor: "Policy engine", evidence: "Evidence completeness 62% against a 90% requirement." },
    ],
  },
  {
    id: "REC-88441", opportunityId: "OPP-1048",
    objective: "Reduce duplicated managed-service spend in the underwriting platform.",
    resource: "underwriting-svc-mesh (4 services)", application: "Underwriting Platform", owner: "Application Architecture",
    environment: "Production", current: "Two overlapping managed caches", recommended: "Consolidate onto a single cache tier",
    savingsMonthly: 4100, confidence: 68, riskScore: 61, state: "Rejected",
    autonomy: "Observe Only", approvalRequired: true, approvalReason: "Architecture change — Architecture Review Board",
    condition: "Architectural duplication",
    analysis: [
      ["Duplicated services", "2 cache tiers serving overlapping key spaces"],
      ["Dependency edges unresolved", "3"],
      ["Estimated engineering effort", "6–9 weeks"],
      ["Composite risk", "61 / 100 (High)"],
    ],
    candidates: [
      { option: "Do nothing", savings: "$0", risk: "None", selected: true, verdict: "Selected by policy — risk exceeds the tenant ceiling for automated recommendation." },
      { option: "Consolidate cache tiers", savings: "$4,100/month", risk: "High", selected: false, verdict: "Blocked — composite risk 61 exceeds the risk ceiling of 55 and three dependency edges are unresolved." },
    ],
    selectionReason: "No action recommended. The change is a design decision requiring architecture review, not an automated optimization.",
    evidence: BASE_EVIDENCE.map((e) => (e.klass === "Application topology" ? { ...e, quality: "Partial", detail: "3 of 14 dependency edges unresolved; two services emit no APM traces." } : e)),
    confidenceComponents: CONFIDENCE_WEIGHTS.map((c) => (c.label === "Architecture Understanding" ? { ...c, score: 54 } : c)),
    riskDimensions: RISK_DIMENSIONS.map((d) => (d.label === "Business Criticality" ? { ...d, score: 85 } : d.label === "Blast Radius" ? { ...d, score: 70 } : d)),
    rejection: {
      reason: "Risk exceeds policy and architecture dependency unresolved",
      gap: "Three dependency edges in the service mesh have no observed traffic evidence, so blast radius cannot be bounded.",
      policy: "Execution Risk Policy — Platform & Architecture Efficiency v3 (risk ceiling 55, dependency completeness 100%).",
      corrective: "Instrument the two untraced services, rebuild the topology map, then refer the consolidation to the Architecture Review Board as a design item rather than an automated optimization.",
      detectedAt: "2026-08-10 14:03 UTC",
    },
    history: [
      { state: "Detected", at: "2026-08-10 13:55 UTC", actor: "Agentic architecture investigation", evidence: "Overlapping cache key spaces identified across two managed tiers." },
      { state: "Analyzed", at: "2026-08-10 14:01 UTC", actor: "Impact analysis agent", evidence: "Topology incomplete; blast radius unbounded." },
      { state: "Rejected", at: "2026-08-10 14:03 UTC", actor: "Policy engine", evidence: "Composite risk 61 above ceiling 55." },
    ],
  },
];

export const REJECTION_LIBRARY = [
  { reason: "Insufficient memory telemetry", policy: "Evidence Requirements v4", corrective: "Restore the metering agent and accumulate a full observation window." },
  { reason: "Application owner unresolved", policy: "Tagging / Allocation Rules v9", corrective: "Assign an owner tag and reconcile the resource against CMDB." },
  { reason: "SLO missing", policy: "Impact Analysis Requirements v2", corrective: "Publish an availability objective for the service before reduction is considered." },
  { reason: "Recent major change inside observation window", policy: "Observation Window Policy v3", corrective: "Wait 14 days after the change, then re-evaluate against fresh telemetry." },
  { reason: "Risk exceeds policy", policy: "Execution Risk Policy v3", corrective: "Reduce blast radius, stage the change, or route to architecture review." },
  { reason: "Projected savings below threshold", policy: "Minimum Savings Policy v2", corrective: "Aggregate into a batch candidate or accept suppression." },
  { reason: "Architecture dependency unresolved", policy: "Topology Completeness Policy v1", corrective: "Instrument untraced services and rebuild the dependency map." },
  { reason: "No validated rollback", policy: "Rollback Readiness Policy v5", corrective: "Define and test a rollback path before requesting approval." },
];

/* ------------------------------ savings records ---------------------------- */

export interface SavingsRecord {
  id: string; recommendationId: string; resource: string; application: string;
  originalConfig: string; recommendedConfig: string;
  gross: string; policyEligible: string; riskAdjusted: string; approved: string;
  executed: string; technicallyValidated: string; financiallyValidated: string; realized: string;
  executionDate: string; changeId: string; channel: string; validationPeriod: string;
  observed: string; normalized: string; variance: string;
  technicalValidation: string; performanceRegression: string; slo: string; rollback: string;
  validationPolicy: string; evidence: string[]; state: LifecycleState;
  exception?: { title: string; projected: string; observed: string; driver: string; normalized: string; status: string };
}

export const SAVINGS_RECORDS: SavingsRecord[] = [
  {
    id: "SVG-2026-04122", recommendationId: "REC-88419", resource: "analytics-prod-ec2-142", application: "Underwriting Analytics",
    originalConfig: "m6i.4xlarge", recommendedConfig: "m6i.2xlarge",
    gross: "$1,480/month", policyEligible: "$1,240/month", riskAdjusted: "$1,110/month", approved: "$1,110/month",
    executed: "$1,110/month", technicallyValidated: "$1,110/month", financiallyValidated: "$1,097/month", realized: "$1,097/month",
    executionDate: "July 8, 2026", changeId: "CHG-882901", channel: "Terraform", validationPeriod: "30 days",
    observed: "$1,084", normalized: "$1,097", variance: "-1.2%",
    technicalValidation: "Passed", performanceRegression: "None", slo: "Maintained", rollback: "Not required",
    validationPolicy: "FinOps Savings Validation v6", state: "Realized",
    evidence: ["Billing detail (AWS CUR, two cycles)", "Utilization telemetry pre and post change", "Application performance (Datadog APM)", "Resource configuration snapshot", "Change record CHG-882901", "SLO attainment report", "Business demand volume (bound policies)"],
  },
  {
    id: "SVG-2026-04088", recommendationId: "REC-88420", resource: "np-batch-asg-07", application: "Claims Test Estate",
    originalConfig: "Always-on ASG (6 instances)", recommendedConfig: "Scheduled 07:00–20:00 weekdays",
    gross: "$3,640/month", policyEligible: "$3,180/month", riskAdjusted: "$3,180/month", approved: "$3,180/month",
    executed: "$3,180/month", technicallyValidated: "$3,180/month", financiallyValidated: "$3,155/month", realized: "$3,155/month",
    executionDate: "July 3, 2026", changeId: "CHG-881442", channel: "Scheduler automation", validationPeriod: "30 days",
    observed: "$3,131", normalized: "$3,155", variance: "-0.8%",
    technicalValidation: "Passed", performanceRegression: "None", slo: "Not applicable (non-production)", rollback: "Not required",
    validationPolicy: "FinOps Savings Validation v6", state: "Realized",
    evidence: ["Billing detail (AWS CUR, two cycles)", "Instance running-hours telemetry", "Developer session logs", "Batch completion records", "Change record CHG-881442"],
  },
  {
    id: "SVG-2026-04150", recommendationId: "REC-88455", resource: "warehouse-wh-prod-01", application: "Data Warehouse",
    originalConfig: "X-Large warehouse, auto-suspend 15 min", recommendedConfig: "Large warehouse, auto-suspend 2 min",
    gross: "$21,300/month", policyEligible: "$18,400/month", riskAdjusted: "$18,400/month", approved: "$18,400/month",
    executed: "$18,400/month", technicallyValidated: "$18,400/month", financiallyValidated: "$17,100/month", realized: "$17,100/month",
    executionDate: "June 22, 2026", changeId: "CHG-879104", channel: "Terraform", validationPeriod: "30 days",
    observed: "$9,200", normalized: "$17,100", variance: "-7.1%",
    technicalValidation: "Passed", performanceRegression: "+2.9% p95 query latency (within ±5%)", slo: "Maintained", rollback: "Not required",
    validationPolicy: "FinOps Savings Validation v6", state: "Realized",
    evidence: ["Snowflake credit consumption", "Query volume and bytes scanned", "Business demand volume (TB processed)", "Contract rate schedule", "Change record CHG-879104"],
    exception: {
      title: "Savings Validation Exception — demand normalization applied",
      projected: "$18,400/month", observed: "$9,200/month", driver: "Business demand +31% (TB processed)",
      normalized: "$17,100/month", status: "Validated after demand normalization",
    },
  },
];

export const EXCEPTION_REASONS = [
  { reason: "Baseline invalid", detail: "The pre-change baseline period contains an incident or an unrelated change, so it cannot represent normal cost.", action: "Re-select a clean baseline window and re-run validation." },
  { reason: "Rollback occurred", detail: "The change was reverted inside the validation window; no savings may be claimed for the reverted period.", action: "Close the savings record as Rolled Back and re-detect if still valid." },
  { reason: "Partial execution", detail: "Only part of the recommended change applied; savings must be prorated to the applied scope.", action: "Recompute against the applied scope and re-validate." },
  { reason: "Pricing changed", detail: "Provider list or contract rates changed inside the window, moving cost independently of the change.", action: "Apply contract-rate adjustment before comparison." },
  { reason: "Business volume changed", detail: "Demand moved materially, so raw cost delta understates or overstates the change effect.", action: "Normalize by the governed demand driver." },
  { reason: "Commitment overlap", detail: "A reservation or savings plan already covered part of the reduced usage.", action: "Attribute to the commitment record and claim only incremental savings." },
  { reason: "Duplicate savings attribution", detail: "Two recommendations claim savings against the same underlying spend.", action: "Run attribution analysis and claim incremental savings only." },
  { reason: "Data incomplete", detail: "Billing or telemetry evidence is missing for part of the validation window.", action: "Hold the record in Financial Validation until evidence is complete." },
];

/* --------------------------- savings deduplication ------------------------- */

export const DEDUPLICATION = {
  scope: "AWS Prod Analytics — analytics-prod-ec2 fleet",
  overlapping: [
    { rec: "REC-88419", type: "Resource Rightsizing", claimed: "$10,000/month", attribution: "Primary", incremental: "$10,000/month" },
    { rec: "REC-88462", type: "Commitment Optimization", claimed: "$4,000/month", attribution: "Secondary", incremental: "$2,600/month" },
  ],
  naive: "$14,000/month",
  adjusted: "$12,600/month",
  overlap: "$1,400/month",
  rule: "When rightsizing precedes a commitment purchase, the commitment is priced against the post-rightsizing baseline. The overlap is attributed to the primary recommendation and removed from the secondary.",
  explanation: [
    "Rightsizing reduces on-demand usage first and is recorded as the primary attribution.",
    "The commitment recommendation is then recalculated against the reduced baseline rather than the original one.",
    "The $1,400/month overlap is removed from the secondary record so the same dollar is never counted twice.",
    "Adjusted total is published to Finance; naive total is retained only for audit comparison.",
  ],
};

/* ---------------------------- savings baseline ---------------------------- */

export const BASELINE = {
  name: "FinOps Savings Baseline v6",
  fields: [
    ["Baseline period", "30 days pre-change"],
    ["Validation period", "30 days post-change"],
    ["Normalization method", "Demand-normalized unit cost"],
    ["Business volume metric", "Transactions processed"],
    ["Seasonality", "Trailing 3-year monthly index applied"],
    ["Contract pricing", "Adjusted to effective negotiated rate at execution date"],
    ["Cloud credits", "Excluded — one-time credits never count as savings"],
    ["Commitments", "Netted against the post-change baseline"],
    ["One-time costs", "Excluded (migration, retrieval, egress on tier change)"],
    ["Currency", "USD, month-end rate"],
    ["Growth adjustment", "Applied when demand moves more than ±10%"],
  ] as [string, string][],
  summary: "Baseline 30 days pre-change; validation 30 days post-change; normalize by transactions processed; exclude one-time cloud credits; adjust for contract-rate changes.",
};

/* ------------------------------ approval policy ---------------------------- */

export const APPROVAL_POLICY = {
  name: "Production FinOps Change Approval",
  version: "v7",
  requiredWhen: [
    "Environment = Production",
    "OR Risk ≥ Medium",
    "OR Monthly Savings ≥ $10,000",
    "OR Architecture Change = True",
  ],
  approvers: ["Application Owner", "FinOps Lead"],
  conditional: [
    { role: "Security", when: "Security risk dimension > 0" },
    { role: "Platform Engineering", when: "Shared platform resources affected" },
    { role: "Change Manager", when: "Execution falls inside a restricted change window" },
  ],
  decisions: ["Approve", "Reject", "Request More Evidence", "Request Changes", "Defer", "Escalate"],
  captured: ["Approver identity and role", "Timestamp", "Decision", "Reason text", "Evidence reviewed", "Risk score at decision time", "Financial value at decision time", "Policy version in force"],
  sla: "5 business days, escalation to FinOps Director thereafter; approval expires after 14 days.",
  queue: [
    { rec: "REC-88419", approver: "M. Okafor (Application Owner)", state: "Pending", age: "2d 4h", value: "$1,110/mo", risk: "Low" },
    { rec: "REC-88419", approver: "S. Whitfield (FinOps Lead)", state: "Approved", age: "1d 2h", value: "$1,110/mo", risk: "Low" },
    { rec: "REC-88462", approver: "Finance Controller", state: "Pending", age: "4d 1h", value: "$2,600/mo", risk: "Medium" },
    { rec: "REC-88441", approver: "Architecture Review Board", state: "Blocked", age: "1d 3h", value: "$4,100/mo", risk: "High" },
  ],
};

/* ------------------------------ autonomy policy ---------------------------- */

export const AUTONOMY_DISPOSITIONS = [
  { id: "observe", label: "Observe Only", detail: "The platform records the condition but produces no recommendation.", example: "Architecture duplication in Tier-1 platforms." },
  { id: "recommend", label: "Recommend", detail: "A recommendation is produced for human consideration; no execution path is offered.", example: "Kubernetes request reduction while telemetry is incomplete." },
  { id: "approval", label: "Approval Required", detail: "Execution is available but blocked until every required approver decides.", example: "Production database or compute rightsizing — always approval required." },
  { id: "auto_low", label: "Auto Execute Low Risk", detail: "Autonomous execution permitted when composite risk is Low and rollback is verified.", example: "Sandbox orphaned disk: confidence ≥ 0.98, no attachment, age > 45 days, snapshot succeeds." },
  { id: "auto_policy", label: "Auto Execute Within Policy", detail: "Autonomous execution inside declared blast-radius, window and volume ceilings.", example: "Non-production scheduling within the approved calendar." },
  { id: "prohibited", label: "Prohibited", detail: "No execution path exists regardless of approval; the action is disallowed for this tenant.", example: "Commitment purchase and any change to IAM or logging configuration." },
];

/* --------------------------- execution governance -------------------------- */

export const EXECUTION_GOVERNANCE = {
  recommendationId: "REC-88419",
  fields: [
    ["Execution channel", "Terraform (workspace: prod-analytics)"],
    ["Change ID", "CHG-882901"],
    ["Execution identity", "svc-finops-executor (AssumeRole, external ID enforced)"],
    ["Approved plan", "plan-88419-r3 (hash 9f2c…a41d) — attached to the approval record"],
    ["Environment", "Production"],
    ["Change window", "Sat 02:00–06:00 UTC, outside retail peak freeze"],
    ["Rollback plan", "Re-apply prior instance definition from state snapshot"],
    ["Retry policy", "2 attempts, exponential backoff, idempotency key required"],
    ["Idempotency key", "REC-88419:analytics-prod-ec2-142:v3"],
    ["Validation plan", "72h technical observation, then 2 billing cycles financial validation"],
  ] as [string, string][],
  allowed: ["plan", "validate", "create pull request", "apply approved plan", "rollback approved change"],
  blocked: ["unapproved destroy", "disable logging", "unapproved IAM changes", "unscoped production modification"],
  note: "Credential material is never rendered in this interface. The execution identity is shown as a reference only.",
};

export const IDEMPOTENCY = {
  keyFormula: "recommendation-id + target-resource + change-version",
  key: "REC-88419:analytics-prod-ec2-142:v3",
  lock: "Exclusive lock held on the target resource for the duration of the apply",
  duplicateWindow: "60 minutes",
  replay: "Blocked unless explicitly authorized by a Platform Admin with a documented reason",
  correlationId: "corr-2026-08-11-88419",
  why: "A retry is only safe when the platform can prove the second attempt refers to the same intended change. Without an idempotency key, a timeout on the first attempt is indistinguishable from a failure, and a blind retry can apply a cloud modification twice — resizing twice, deleting a recreated volume, or purchasing a duplicate commitment.",
};

export const ROLLBACK_READINESS = {
  required: true,
  method: "Restore prior instance type from the captured state snapshot",
  evidence: "Pre-change configuration snapshot and Terraform state version 412",
  validation: "CPU, memory, latency, error rate and SLO observed for 60 minutes post-rollback",
  maxTime: "4 minutes",
  owner: "Cloud Engineering on-call",
  status: "Verified 2026-08-10 — rollback rehearsal completed in staging",
};

export const TECHNICAL_VALIDATION = {
  result: "Passed",
  checks: [
    ["Resource state", "m6i.2xlarge confirmed via describe-instances"],
    ["CPU", "p95 6.9 vCPU equivalent of 8 provisioned (86% headroom target met)"],
    ["Memory", "p95 23.1 GiB of 32 GiB provisioned"],
    ["Latency", "+1.2% p95 (allowed ±5%)"],
    ["Errors", "No regression; error rate 0.02% unchanged"],
    ["SLO", "Maintained; error budget consumption unchanged"],
    ["Availability", "100% during and after the change window"],
    ["Autoscaling", "No scale events triggered"],
    ["Dependency health", "All 9 mapped dependencies healthy"],
    ["Incidents", "No incident opened in the 72h observation window"],
    ["Change result", "CHG-882901 closed successful"],
  ] as [string, string][],
  variance: "+1.2%", allowed: "±5%", rollback: "Not required",
};

export const FINANCIAL_VALIDATION = {
  state: "Validated",
  checks: [
    ["Actual cost change", "-$1,084 in the first full billing period"],
    ["Billing period", "2026-07-01 to 2026-08-31 (two cycles)"],
    ["Normalization", "Demand-normalized by bound policies (+1.4% volume)"],
    ["Credits", "No credits applied in the window"],
    ["Contract changes", "None during the window"],
    ["Commitments", "No commitment coverage on this resource"],
    ["Usage volume", "+1.4% versus baseline"],
    ["Seasonality", "July index 0.98 applied"],
    ["Expected savings", "$1,110/month"],
    ["Observed savings", "$1,084/month"],
    ["Normalized savings", "$1,097/month"],
    ["Variance", "-1.2% (within ±10% tolerance)"],
  ] as [string, string][],
};

/* -------------------------------- anomalies -------------------------------- */

export interface Anomaly {
  id: string; type: string; scope: string; observed: string; expected: string; variance: string;
  confidence: number; drivers: string[]; applications: string[]; changes: string[];
  evidence: string[]; investigation: string[]; classification: string;
}

export const ANOMALIES: Anomaly[] = [
  {
    id: "ANO-3391", type: "Data-transfer increase", scope: "AWS us-east-1 → eu-west-1",
    observed: "$41.2K (7 days)", expected: "$18.6K", variance: "+121%", confidence: 84,
    drivers: ["New cross-region replication enabled on the claims document store", "Retry storm from a downstream consumer between 02:00 and 05:00 UTC"],
    applications: ["Claims API", "Document Services"],
    changes: ["CHG-884120 — enable cross-region replication (2026-08-05)"],
    evidence: ["VPC flow logs by source/destination region", "S3 replication metrics", "Consumer retry counts from APM", "Change record CHG-884120"],
    investigation: ["Confirm whether replication is a deliberate resilience requirement", "If required, evaluate compression and batching before treating as waste", "Fix the consumer retry backoff independently of the replication decision"],
    classification: "Under investigation — deliberate architecture change suspected, not waste",
  },
  {
    id: "ANO-3388", type: "Unit-cost spike", scope: "Data Warehouse — cost per TB processed",
    observed: "$52.31 / TB", expected: "$48.90 / TB", variance: "+7.0%", confidence: 79,
    drivers: ["Query mix shifted toward unclustered scans", "Warehouse auto-suspend reverted to 15 minutes by a manual change"],
    applications: ["Data Warehouse", "Underwriting Analytics"],
    changes: ["Manual console change 2026-08-07 (no change record)"],
    evidence: ["Snowflake ACCOUNT_USAGE query history", "Warehouse credit consumption", "Clustering depth by table", "Absence of a matching change record"],
    investigation: ["Restore auto-suspend to the approved 2-minute setting", "Review the top 20 unclustered scans with the data owner", "Raise a tagging/change-control exception for the untracked manual change"],
    classification: "Actionable — configuration drift confirmed",
  },
  {
    id: "ANO-3384", type: "Commitment-coverage decline", scope: "Azure Shared Services",
    observed: "61% coverage", expected: "72% coverage", variance: "-11 pts", confidence: 91,
    drivers: ["Reservation ladder expiry not renewed", "Steady-state baseline grew 6% after a workload migration"],
    applications: ["Shared Services", "Customer Portal"],
    changes: ["Reservation RSV-4471 expired 2026-08-01"],
    evidence: ["Reservation utilization and expiry ladder", "Steady-state baseline forecast", "On-demand hours by SKU"],
    investigation: ["Model a staged purchase against the new baseline", "Confirm the migration is permanent before committing to a 3-year term"],
    classification: "Actionable — commitment gap confirmed",
  },
  {
    id: "ANO-3379", type: "GPU idle cost", scope: "ML training cluster (non-production)",
    observed: "$12.8K (30 days)", expected: "$3.1K", variance: "+313%", confidence: 88,
    drivers: ["Training nodes held allocated between experiment runs", "No idle reclaim policy on the experiment namespace"],
    applications: ["Risk Modelling"],
    changes: ["None"],
    evidence: ["GPU utilization telemetry", "Job scheduler queue history", "Namespace allocation records"],
    investigation: ["Introduce idle reclaim after 45 minutes with checkpoint preservation", "Confirm with the modelling team that warm nodes are not required for iteration speed"],
    classification: "Likely waste — pending owner confirmation",
  },
];

/* ------------------------------- conflicts --------------------------------- */

export interface Conflict { id: string; object: string; conflict: string; impact: string; cta: string; severity: "warn" | "bad" }

export const CONFLICTS: Conflict[] = [
  {
    id: "CFL-01", object: "Production Resource Rightsizing",
    conflict: "Automatic retry is enabled but idempotency control is missing.",
    impact: "A side-effect-producing action could be repeated, resizing a resource twice or reapplying a superseded plan.",
    cta: "Resolve Policy", severity: "bad",
  },
  {
    id: "CFL-02", object: "Kubernetes Economics v4",
    conflict: "Telemetry completeness is below the policy requirement in AKS non-production.",
    impact: "Memory-bound reductions cannot be evidenced; 143 recommendations are held in Attention.",
    cta: "Resolve Policy", severity: "warn",
  },
  {
    id: "CFL-03", object: "Storage Lifecycle v3",
    conflict: "Rollback is undefined for archive-tier transitions.",
    impact: "Restoring an archived object incurs retrieval cost and latency that the policy does not currently account for.",
    cta: "Resolve Policy", severity: "warn",
  },
];

export const SYSTEM_ERRORS = [
  { id: "ERR-01", label: "Billing API unavailable", scope: "GCP billing export", state: "Recovered", detail: "Export delayed 46 minutes on 2026-08-10; backfilled and reconciled." },
  { id: "ERR-02", label: "Telemetry incomplete", scope: "AKS non-production", state: "Active", detail: "Metering agent offline since 09:14 UTC; Kubernetes opportunities held." },
  { id: "ERR-03", label: "Application ownership unresolved", scope: "14 resources", state: "Active", detail: "No owner tag and no CMDB match; excluded from recommendation." },
  { id: "ERR-04", label: "Cloud pricing stale", scope: "Azure price list", state: "Recovered", detail: "Refreshed 2026-08-11 01:00 UTC after a 26-hour gap." },
  { id: "ERR-05", label: "Execution channel unavailable", scope: "Kubernetes GitOps", state: "Active", detail: "Held pending telemetry recovery; no change may be applied." },
  { id: "ERR-06", label: "Savings baseline invalid", scope: "2 savings records", state: "Active", detail: "Baseline window contains an unrelated incident; re-selection required." },
  { id: "ERR-07", label: "Tagging coverage below policy", scope: "Kubernetes clusters", state: "Active", detail: "Namespace allocation coverage 74% against a 90% requirement." },
  { id: "ERR-08", label: "Approval role missing", scope: "Document Services", state: "Active", detail: "No Application Owner assigned; approvals cannot route." },
];

/* ------------------------------ policy versions ---------------------------- */

export interface PolicyVersion {
  version: string; state: "Active" | "Previous" | "Draft" | "Deprecated"; published: string; author: string;
  changes: { field: string; from: string; to: string }[];
}

export const POLICY_VERSIONS: PolicyVersion[] = [
  { version: "v12", state: "Draft", published: "—", author: "S. Whitfield", changes: [
    { field: "Confidence threshold", from: "0.88", to: "0.90" },
    { field: "Evidence requirement", from: "11 classes", to: "12 classes (adds demand forecast)" },
    { field: "Risk ceiling", from: "55", to: "50" },
    { field: "Validation window", from: "30 days", to: "45 days" },
  ] },
  { version: "v11", state: "Active", published: "2026-07-14", author: "S. Whitfield", changes: [
    { field: "Minimum savings", from: "$150/month", to: "$250/month" },
    { field: "Approval", from: "FinOps Lead", to: "FinOps Lead + Application Owner" },
  ] },
  { version: "v10", state: "Previous", published: "2026-05-02", author: "A. Iyer", changes: [
    { field: "Safety buffer", from: "15%", to: "20%" },
  ] },
  { version: "v9", state: "Deprecated", published: "2026-02-18", author: "A. Iyer", changes: [
    { field: "Observation window", from: "14 days", to: "28 days" },
  ] },
];

/* --------------------------------- audit ----------------------------------- */

export interface AuditEvent {
  at: string; actor: string; object: string; action: string; policyVersion: string;
  oldValue: string; newValue: string; reason: string; ticket: string;
}

export const AUDIT: AuditEvent[] = [
  { at: "2026-08-11 09:22 UTC", actor: "Policy engine", object: "REC-88433", action: "Recommendation rejected", policyVersion: "Kubernetes Economics v4", oldValue: "Analyzed", newValue: "Rejected", reason: "Evidence completeness 62% against a 90% requirement.", ticket: "—" },
  { at: "2026-08-10 16:41 UTC", actor: "S. Whitfield (FinOps Lead)", object: "REC-88419", action: "Recommendation approved", policyVersion: "Production FinOps Change Approval v7", oldValue: "Approval Pending", newValue: "Approved (1 of 2)", reason: "Evidence reviewed; headroom acceptable for Tier 2.", ticket: "CHG-882901" },
  { at: "2026-08-10 14:03 UTC", actor: "Policy engine", object: "REC-88441", action: "Recommendation rejected", policyVersion: "Execution Risk Policy v3", oldValue: "Analyzed", newValue: "Rejected", reason: "Composite risk 61 above ceiling 55.", ticket: "—" },
  { at: "2026-08-08 11:05 UTC", actor: "A. Iyer (Platform Admin)", object: "Rightsizing Policy", action: "Threshold changed", policyVersion: "v11 → v12 draft", oldValue: "Confidence 0.88", newValue: "Confidence 0.90", reason: "Two rollbacks in Q2 traced to marginal-confidence candidates.", ticket: "POL-2291" },
  { at: "2026-08-06 09:12 UTC", actor: "J. Alvarez (Finance)", object: "SVG-2026-04088", action: "Savings validated", policyVersion: "FinOps Savings Validation v6", oldValue: "Financial Validation", newValue: "Realized", reason: "Two billing cycles confirmed; variance -0.8%.", ticket: "FIN-7741" },
  { at: "2026-08-05 15:30 UTC", actor: "Technology Finance", object: "Savings baseline", action: "Baseline updated", policyVersion: "v5 → v6", oldValue: "Normalize by API calls", newValue: "Normalize by transactions processed", reason: "API call counts distorted by health checks.", ticket: "FIN-7702" },
  { at: "2026-07-31 08:14 UTC", actor: "Cloud Engineering", object: "CHG-880233", action: "Rollback completed", policyVersion: "Rollback Readiness Policy v5", oldValue: "Executed", newValue: "Rolled Back", reason: "SLO burn exceeded 2x within the observation window.", ticket: "INC-55210" },
  { at: "2026-07-24 12:02 UTC", actor: "Cloud Finance", object: "SVG-2026-04150", action: "Savings disputed", policyVersion: "FinOps Savings Validation v6", oldValue: "Financial Validation", newValue: "Disputed", reason: "Observed savings 50% below projection pending demand normalization.", ticket: "FIN-7688" },
  { at: "2026-07-08 02:41 UTC", actor: "svc-finops-executor", object: "CHG-882901", action: "Execution completed", policyVersion: "Execution Governance v4", oldValue: "Scheduled", newValue: "Executed", reason: "Approved plan plan-88419-r3 applied inside the change window.", ticket: "CHG-882901" },
  { at: "2026-07-02 09:55 UTC", actor: "Technology Finance", object: "Underwriting Platform", action: "Allocation changed", policyVersion: "Tagging / Allocation Rules v9", oldValue: "Shared cost spread evenly", newValue: "Allocated by bound policies", reason: "Even spread misattributed 18% of platform cost.", ticket: "FIN-7650" },
];

/* --------------------------- unit economics detail ------------------------- */

export const UNIT_DETAIL: Record<string, {
  volume: string; previous: string; variance: string;
  breakdown: [string, string][]; costTrend: number[]; volumeTrend: number[]; unitTrend: number[];
  drivers: string[]; openOpportunities: { id: string; type: string; savings: string }[];
}> = {
  "UE-01": {
    volume: "290,100 bound policies", previous: "$13.14", variance: "-5.0%",
    breakdown: [["Compute", "$1.31M"], ["Database", "$0.74M"], ["Storage", "$0.52M"], ["Network", "$0.31M"], ["Observability", "$0.22M"], ["Shared Platform", "$0.29M"], ["AI Inference", "$0.16M"], ["Third Party", "$0.07M"]],
    costTrend: [3.81, 3.74, 3.70, 3.68, 3.65, 3.62], volumeTrend: [268, 272, 279, 283, 287, 290], unitTrend: [14.21, 13.75, 13.26, 13.00, 12.72, 12.48],
    drivers: ["Underwriting rules engine compute (38% of application spend)", "Policy document storage growth 4.1% per month", "Cross-AZ chatter between rating and pricing services"],
    openOpportunities: [{ id: "OPP-1041", type: "Resource Rightsizing", savings: "$214K/mo" }, { id: "OPP-1048", type: "Platform & Architecture Efficiency", savings: "$41K/mo" }],
  },
  "UE-02": {
    volume: "557M billable API calls", previous: "$0.0043", variance: "-2.6%",
    breakdown: [["Compute", "$0.94M"], ["Database", "$0.51M"], ["API gateway", "$0.44M"], ["Network", "$0.24M"], ["Observability", "$0.13M"], ["Shared Platform", "$0.06M"], ["Third Party", "$0.02M"]],
    costTrend: [2.44, 2.42, 2.39, 2.38, 2.36, 2.34], volumeTrend: [512, 522, 531, 541, 549, 557], unitTrend: [0.00477, 0.00464, 0.00450, 0.00440, 0.00430, 0.00420],
    drivers: ["Gateway request cost at current tier", "Redundant downstream calls on the claim-status path", "Cache hit ratio 71% against an 85% target"],
    openOpportunities: [{ id: "OPP-1049", type: "Application & Service Unit Economics", savings: "$34K/mo" }],
  },
  "UE-03": {
    volume: "38,420 TB processed", previous: "$50.59", variance: "+3.4%",
    breakdown: [["Warehouse compute", "$1.34M"], ["Storage", "$0.38M"], ["Ingestion", "$0.19M"], ["Network", "$0.10M"]],
    costTrend: [1.89, 1.92, 1.95, 1.97, 1.99, 2.01], volumeTrend: [37.1, 37.4, 37.8, 38.0, 38.2, 38.4], unitTrend: [50.94, 51.34, 51.59, 51.84, 52.09, 52.31],
    drivers: ["Unclustered scans on the claims fact table", "Warehouse auto-suspend drift (see ANO-3388)", "Ingestion volume growth from the new telematics feed"],
    openOpportunities: [{ id: "OPP-1045", type: "Storage Lifecycle", savings: "$84K/mo" }],
  },
  "UE-04": {
    volume: "1,078,700 active users", previous: "$1.29", variance: "-1.2%",
    breakdown: [["Compute", "$0.61M"], ["CDN & edge", "$0.28M"], ["Database", "$0.26M"], ["Network", "$0.14M"], ["Observability", "$0.08M"]],
    costTrend: [1.41, 1.40, 1.39, 1.38, 1.38, 1.37], volumeTrend: [1032, 1044, 1055, 1063, 1071, 1079], unitTrend: [1.37, 1.34, 1.32, 1.30, 1.29, 1.27],
    drivers: ["Edge cache miss ratio on document previews", "Session store memory sizing", "Image transformation on upload"],
    openOpportunities: [],
  },
  "UE-05": {
    volume: "25.9M allocated vCPU hours", previous: "$0.041", variance: "0.0%",
    breakdown: [["Node compute", "$0.72M"], ["Storage", "$0.13M"], ["Network", "$0.12M"], ["Control plane", "$0.09M"]],
    costTrend: [1.05, 1.06, 1.06, 1.06, 1.06, 1.06], volumeTrend: [25.4, 25.5, 25.7, 25.8, 25.8, 25.9], unitTrend: [0.0413, 0.0414, 0.0412, 0.0411, 0.0410, 0.0410],
    drivers: ["Bin-packing density 61% against a 75% target", "Request bloat in three tenant namespaces", "Reserved headroom for burst workloads"],
    openOpportunities: [{ id: "OPP-1043", type: "Kubernetes Economics", savings: "$121K/mo" }],
  },
};

/* ------------------------ cloud account detail (drawer) -------------------- */

export const ACCOUNT_DETAIL: Record<string, {
  billing: [string, string][]; telemetry: [string, string][]; allocation: [string, string][];
  permissions: [string, string][]; health: [string, string][]; usage: [string, string][];
  linkedAccounts: string[]; regions: string[]; exceptions: string[];
}> = {
  "ACC-AWS": {
    linkedAccounts: ["dual-prod-analytics (4417…)", "dual-prod-claims (8820…)", "dual-shared-services (2291…)", "+61 more"],
    regions: ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-southeast-2"],
    billing: [["Export type", "Cost & Usage Report, hourly, resource-level"], ["Billing freshness", "8 minutes"], ["Pricing freshness", "9 hours"], ["Amortization", "Amortized view with commitment netting"], ["Credits", "Excluded from savings recognition"]],
    telemetry: [["CloudWatch", "Connected — 1-minute resolution"], ["Datadog", "Connected — APM, SLO, infrastructure"], ["Coverage", "97% of billable compute resources"], ["Gaps", "3 accounts with agent version below minimum"]],
    allocation: [["Tag coverage", "96%"], ["Application mapping", "94%"], ["Owner coverage", "98%"], ["Shared cost drivers", "Declared for 7 shared services"], ["Unallocated spend", "$0.23M / month"]],
    permissions: [["Access mode", "AssumeRole, read-only for ingestion"], ["Execution role", "svc-finops-executor, scoped operation allowlist"], ["External ID", "Enforced"], ["Credential reference", "Managed reference — value never rendered"], ["Rotation", "Every 90 days, last 2026-06-19"]],
    health: [["Connector status", "Healthy"], ["Last sync", "8 minutes ago"], ["Failed syncs (30d)", "0"], ["Commitment data", "Fresh — 2 hours"]],
    usage: [["Monthly spend", "$5.81M"], ["Compute share", "58%"], ["Storage share", "17%"], ["Data transfer share", "9%"], ["Managed data share", "16%"]],
    exceptions: ["Three accounts run a Datadog agent below the minimum supported version.", "One legacy account is excluded from automated execution by tenant policy."],
  },
  "ACC-K8S": {
    linkedAccounts: ["eks-prod-01", "eks-prod-02", "aks-np-cluster-01", "aks-np-cluster-02", "+5 more"],
    regions: ["us-east-1", "eu-west-1", "westeurope"],
    billing: [["Cost source", "In-cluster metering agent + provider node cost"], ["Billing freshness", "3 hours (degraded)"], ["Pricing freshness", "9 hours"], ["Amortization", "Node cost distributed by namespace request-hours"]],
    telemetry: [["Metering agent", "Degraded — offline in AKS non-production since 09:14 UTC"], ["Prometheus", "Connected"], ["Coverage", "74% of namespaces with complete series"], ["Gaps", "Memory series missing for 2 clusters"]],
    allocation: [["Namespace coverage", "74%"], ["Application mapping", "81%"], ["Owner coverage", "88%"], ["Shared platform allocation", "By allocated vCPU hour"], ["Estimated allocation in force", "Yes — 2 clusters"]],
    permissions: [["Access mode", "Cluster-scoped read via service account"], ["Execution", "GitOps reconcile only; no direct API writes"], ["Credential reference", "Managed reference — value never rendered"], ["Rotation", "Every 90 days"]],
    health: [["Connector status", "Degraded"], ["Last sync", "3 hours ago"], ["Failed syncs (30d)", "6"], ["Impact", "Kubernetes opportunities held in Attention; execution channel suspended"]],
    usage: [["Monthly spend", "$1.06M"], ["Node compute share", "68%"], ["Storage share", "12%"], ["Network share", "11%"], ["Control plane share", "9%"]],
    exceptions: ["AKS non-production metering agent offline — namespace allocation is estimated for two clusters.", "Tagging coverage below the 90% policy requirement."],
  },
};

/* -------------------------- execution channel detail ----------------------- */

export const CHANNEL_DETAIL: Record<string, {
  bindingId: string; authRef: string; environment: string; approvalPolicy: string;
  riskPolicy: string; rollback: string; workflows: string[]; audit: [string, string][];
}> = {
  "CH-TF": {
    bindingId: "BND-TF-0041", authRef: "Managed workspace token reference (value never rendered)",
    environment: "Production and non-production workspaces, separately scoped",
    approvalPolicy: "Apply requires a matching approval record and a plan hash identical to the approved plan.",
    riskPolicy: "Composite risk ≤ 55; blast radius ≤ 5% concurrent capacity per service.",
    rollback: "Required — prior state version captured before apply.",
    workflows: ["REC-88419 — apply scheduled Sat 02:00 UTC", "REC-88462 — awaiting Finance Controller approval", "REC-88401 — rollback rehearsal in staging"],
    audit: [["2026-08-11 02:41", "plan-88419-r3 generated and attached to approval"], ["2026-07-08 02:41", "CHG-882901 applied successfully"], ["2026-07-31 08:14", "CHG-880233 rolled back on SLO burn"]],
  },
  "CH-K8S": {
    bindingId: "BND-K8S-0012", authRef: "GitOps controller service account reference (value never rendered)",
    environment: "9 clusters across production and non-production",
    approvalPolicy: "Manifest change requires Platform Owner and Service Owner approval; merge is the execution boundary.",
    riskPolicy: "Suspended — telemetry completeness below policy in AKS non-production.",
    rollback: "Revert commit with automatic reconcile; expected 90 seconds.",
    workflows: ["REC-88433 — blocked, evidence incomplete", "Namespace quota update — held"],
    audit: [["2026-08-11 09:14", "Channel marked degraded — metering agent offline"], ["2026-08-09 11:02", "Manifest change merged for eks-prod-01"]],
  },
};

/* ------------------------- policy simulation scenarios --------------------- */

export interface Scenario {
  id: string; label: string; evidence: string; recommendation: string; confidence: number;
  risk: number; policy: string; approval: string; execution: string; savings: string; validation: string;
  outcome: "Recommend" | "Approval Required" | "Blocked" | "Suppressed";
}

export const SCENARIOS: Scenario[] = [
  { id: "normal", label: "Normal utilization", evidence: "12 of 12 evidence classes complete, telemetry stable", recommendation: "Rightsize m6i.4xlarge → m6i.2xlarge", confidence: 91, risk: 24, policy: "All thresholds satisfied", approval: "Required — production workload", execution: "Terraform, approved plan, change window Sat 02:00 UTC", savings: "$1,240/month gross · $1,110 risk-adjusted", validation: "72h technical, 2 billing cycles financial", outcome: "Approval Required" },
  { id: "seasonal", label: "Seasonal spike", evidence: "Complete, with a 3-year seasonality index applied", recommendation: "Rightsize deferred; target size raised to 12 vCPU", confidence: 87, risk: 31, policy: "Seasonality guard raises the predicted need above the eligible target", approval: "Required", execution: "Deferred until after the peak window", savings: "$540/month gross · $470 risk-adjusted", validation: "Post-peak observation extended to 45 days", outcome: "Recommend" },
  { id: "missing", label: "Missing telemetry", evidence: "Memory series 62% complete", recommendation: "No recommendation produced", confidence: 61, risk: 38, policy: "Evidence completeness below 90% requirement", approval: "Not routed", execution: "Not eligible", savings: "$0 claimable", validation: "N/A", outcome: "Blocked" },
  { id: "owner", label: "Owner unresolved", evidence: "Complete telemetry, no owner tag and no CMDB match", recommendation: "No recommendation produced", confidence: 74, risk: 26, policy: "Ownership confidence 0 against a required 100", approval: "Cannot route — no approver", execution: "Not eligible", savings: "$0 claimable", validation: "N/A", outcome: "Blocked" },
  { id: "highrisk", label: "High-risk workload", evidence: "Complete; Tier 1, regulated, 14 dependencies", recommendation: "Reduced target size with staged rollout", confidence: 89, risk: 58, policy: "Composite risk above the 55 ceiling", approval: "Escalated to Architecture Review Board", execution: "Blocked pending design review", savings: "$2,900/month gross · not claimable", validation: "Parallel run required", outcome: "Blocked" },
  { id: "slo", label: "SLO breach in window", evidence: "Complete; error budget exhausted", recommendation: "Suspended", confidence: 88, risk: 47, policy: "SLO guard blocks reduction while the error budget is negative", approval: "Not routed", execution: "Suspended", savings: "$0 claimable", validation: "N/A", outcome: "Blocked" },
  { id: "growth", label: "Unexpected growth", evidence: "Complete; demand +31% versus baseline", recommendation: "Rightsize cancelled; capacity retained", confidence: 84, risk: 22, policy: "Forecast guard — predicted need now exceeds the current size", approval: "Not required", execution: "No action", savings: "$0", validation: "Demand normalization applied to prior records", outcome: "Suppressed" },
  { id: "below", label: "Savings below threshold", evidence: "Complete", recommendation: "Suppressed — $180/month below the $250 minimum", confidence: 93, risk: 12, policy: "Minimum Savings Policy v2", approval: "Not routed", execution: "Not eligible", savings: "$180/month suppressed", validation: "N/A", outcome: "Suppressed" },
  { id: "rollback", label: "Rollback required", evidence: "Complete; post-change SLO burn 2.4x", recommendation: "Automatic rollback to prior configuration", confidence: 91, risk: 24, policy: "Execution Risk Policy — automatic halt on SLO burn > 2x", approval: "Not required for rollback", execution: "Rollback applied in 3m41s", savings: "$0 claimable; record closed as Rolled Back", validation: "Post-rollback telemetry confirmed healthy", outcome: "Blocked" },
  { id: "conflict", label: "Policy conflict", evidence: "Complete", recommendation: "Held — retry enabled without idempotency control", confidence: 91, risk: 24, policy: "Conflict CFL-01 between Retry Policy v2 and Execution Governance v4", approval: "Not routed", execution: "Blocked until the conflict is resolved", savings: "$1,240/month held", validation: "N/A", outcome: "Blocked" },
];

/* ------------------------------ filter options ----------------------------- */

export const FILTERS = {
  provider: ["All", "AWS", "Azure", "GCP", "Kubernetes", "Snowflake"],
  environment: ["All", "Production", "Non-Production", "Development", "Sandbox"],
  businessUnit: ["All", "Commercial Lines", "Claims", "Enterprise Data", "Distribution", "Platform Engineering"],
  category: ["All", "Resource Rightsizing", "Commitment Optimization", "Elasticity & Scheduling", "Storage Lifecycle", "Kubernetes Economics", "Network & Data Movement", "Orphaned Resources", "Platform & Architecture Efficiency", "Application & Service Unit Economics", "Governance & Realization"],
  confidence: ["All", "≥ 90%", "80–89%", "< 80%"],
  risk: ["All", "Very Low", "Low", "Medium", "High"],
  approvalState: ["All", "Not required", "Pending", "Approved", "Blocked"],
  executionState: ["All", "Not started", "Scheduled", "Executed", "Rolled Back"],
  validationState: ["All", "Not started", "Technical", "Financial", "Realized", "Disputed"],
};
