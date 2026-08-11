// Canonical tenant model for the neugain.io Agentic AI IAM administration
// plane. All values are synthetic demonstration data for tenant
// "DUAL Insurance Group".

export type Risk = "Low" | "Medium" | "High";
export type Tone = "ok" | "warn" | "bad" | "muted";

export function riskTone(r: Risk): Tone {
  return r === "Low" ? "ok" : r === "Medium" ? "warn" : "bad";
}

/* -------------------------------- help ----------------------------------- */

export const HELP: Record<string, { what: string; why: string; how: string; controls: string }> = {
  "Identity & Access Posture": {
    what: "A tenant-configured composite score describing the current health of identity ownership, privilege distribution, credential quality and recertification.",
    why: "Agentic execution depends on identities that are owned, scoped and reviewed. Posture makes drift visible before it becomes an incident.",
    how: "Nine weighted components are recomputed hourly from the identity registry, credential service, policy decision log and review system.",
    controls: "It is an operational indicator, not an absolute security rating. Thresholds and weights are tenant configurable.",
  },
  "Recent Access Activity": {
    what: "A stream of authorization decisions produced by the policy decision point for human and non-human identities.",
    why: "Every allow and deny must be reconstructable by an administrator or auditor.",
    how: "Each decision persists identity, action, resource, evaluated attributes, policy set, credential, session and correlation ID.",
    controls: "Retention, export and redaction of decision records are governed by tenant audit settings.",
  },
  "High Risk Assignments": {
    what: "Entitlement findings where breadth, privilege severity, credential type, ownership or review age exceed tenant thresholds.",
    why: "Overprivileged and unowned identities are the primary source of material access risk for agentic platforms.",
    how: "Findings are generated from effective permission analysis, usage telemetry and ownership resolution.",
    controls: "Findings are advisory. Permissions are never removed automatically without an approved remediation policy.",
  },
  "Top Entities by Permission Count": {
    what: "Identities and roles ranked by effective permission count after roles, direct grants and explicit denies are resolved.",
    why: "Permission breadth is a scope signal, not automatically a risk signal. Privilege severity and recent usage qualify it.",
    how: "Effective permissions are computed nightly and on every role or policy change.",
    controls: "Count alone never drives enforcement; remediation requires severity and usage evidence.",
  },
  "Access Review Summary": {
    what: "Current recertification campaign status for identities, roles and privileged permissions.",
    why: "Continued business need must be reaffirmed by an accountable owner on a defined cadence.",
    how: "Campaigns are generated from review policy per identity class and routed to resolved owners.",
    controls: "Reviewer decisions and reasons are captured and become audit evidence.",
  },
};

/* ----------------------------- principles --------------------------------- */

export const PRINCIPLES = [
  {
    id: "identity-first",
    title: "Identity Before Autonomy",
    short: "Every digital coworker and service action must execute through a known identity.",
    hover:
      "There is no anonymous execution path in neugain.io. Retrieval, model invocation, tool calls and workflow participation are all bound to a registered identity with a resolvable owner.",
    detail: [
      "Digital coworkers are first-class non-human identities, never shared user accounts.",
      "Every identity resolves to a business owner and an engineering owner.",
      "Execution without an authenticated identity is rejected at the policy decision point.",
      "Identity lifecycle state gates authentication before any entitlement is evaluated.",
    ],
  },
  {
    id: "least-privilege",
    title: "Least Privilege by Default",
    short: "Grant only the permissions required for the approved objective and operating scope.",
    hover:
      "Roles are scoped to a business domain, a data classification ceiling and an environment. Anything beyond the approved objective must be requested explicitly and expires.",
    detail: [
      "New identities start with read-only scope inside a single business domain.",
      "Write, modify and execute permissions require an approved workflow binding.",
      "Unused permission analysis continuously proposes scope reduction.",
      "Explicit denies always override inherited allows.",
    ],
  },
  {
    id: "policy-at-execution",
    title: "Policy at Execution",
    short: "Authorization is evaluated when the action occurs, not only when a role is assigned.",
    hover:
      "Role assignment establishes candidate entitlement. The final decision is made at request time using identity, resource, environment, workflow and risk attributes.",
    detail: [
      "The policy decision point evaluates RBAC entitlement and ABAC conditions together.",
      "Runtime attributes include workflow, objective, approval reference, region and session age.",
      "Conflicting policies resolve by priority, then by explicit deny.",
      "Every evaluation is retained with its attribute snapshot.",
    ],
  },
  {
    id: "short-lived",
    title: "Short-Lived Trust",
    short: "Prefer workload identity, federation and short-lived credentials over long-lived secrets.",
    hover:
      "Persistent secrets are treated as a lower trust mechanism and carry a higher credential risk weighting in posture scoring.",
    detail: [
      "OIDC federation and workload identity are the preferred authentication mechanisms.",
      "Token TTL, audience, environment binding and replay protection are enforced per identity.",
      "Just-in-time privilege expires automatically at the end of its bounded window.",
      "Secret-based credentials require rotation policy and compensating review.",
    ],
  },
  {
    id: "attestation",
    title: "Continuous Attestation",
    short: "Permissions, ownership, activity and policy compliance are continuously reviewed.",
    hover:
      "Recertification is a scheduled control, not an annual exercise. Ownership, usage and privilege severity drive review frequency.",
    detail: [
      "Privileged roles are reviewed quarterly; standard scopes semi-annually.",
      "Dormant and orphaned identities enter an out-of-cycle review immediately.",
      "Reviewer decisions capture a reason and become audit evidence.",
      "Exceptions are time-bound and re-enter review at expiry.",
    ],
  },
] as const;

/* --------------------------------- KPIs ----------------------------------- */

export type Kpi = {
  id: string;
  label: string;
  value: string;
  secondary: string;
  change?: string;
  definition: string;
  rows: [string, string][];
  why: string;
  drawerTitle: string;
};

export const KPIS: Kpi[] = [
  {
    id: "coworkers",
    label: "Digital Coworkers",
    value: "56",
    secondary: "Active",
    change: "+6 this month",
    definition: "Registered digital coworker identities capable of participating in neugain.io workflows.",
    rows: [["Active", "56"], ["Suspended", "4"], ["Review required", "7"], ["Orphaned", "1"]],
    why: "Each digital coworker is a non-human identity with its own entitlements, credential method and autonomy ceiling.",
    drawerTitle: "Digital Coworker Inventory",
  },
  {
    id: "humans",
    label: "Human Users",
    value: "342",
    secondary: "Active",
    change: "+12 this month",
    definition: "Human administrators, approvers, engineers, owners and reviewers with access to neugain.io.",
    rows: [["Active", "342"], ["Privileged", "38"], ["Dormant 90d", "11"], ["Pending review", "24"]],
    why: "Humans delegate authority to digital coworkers, so their entitlements bound what can be delegated.",
    drawerTitle: "Human Identity Inventory",
  },
  {
    id: "roles",
    label: "Roles",
    value: "87",
    secondary: "Active",
    change: "+5 this month",
    definition: "Tenant-defined bundles of permissions and policy constraints assignable to an identity.",
    rows: [["Active", "87"], ["Draft", "6"], ["Deprecated", "9"], ["Privileged", "14"]],
    why: "Roles are the primary least-privilege unit and the object of most recertification activity.",
    drawerTitle: "Role Inventory",
  },
  {
    id: "service-accounts",
    label: "Service Accounts",
    value: "124",
    secondary: "Active",
    change: "+8 this month",
    definition: "Non-human identities used by connectors, gateways, automation, integrations and execution services.",
    rows: [["Active", "124"], ["Persistent secret", "19"], ["Dormant 90d", "6"], ["Owner unresolved", "3"]],
    why: "Service accounts hold the highest concentration of persistent credentials and require the tightest posture control.",
    drawerTitle: "Service Account Inventory",
  },
  {
    id: "policies",
    label: "Access Policies",
    value: "213",
    secondary: "Active",
    change: "+14 this month",
    definition: "Policies controlling who or what can perform which action against which resource under which conditions.",
    rows: [["Active", "213"], ["Draft", "11"], ["Conflicting", "2"], ["Expiring 30d", "5"]],
    why: "Policies bind entitlement to runtime context, which is what keeps agentic execution inside approved boundaries.",
    drawerTitle: "Access Policy Inventory",
  },
  {
    id: "reviews",
    label: "Access Reviews",
    value: "96%",
    secondary: "Completion rate",
    change: "Due in 12 days",
    definition: "Current tenant access recertification status across all active campaigns.",
    rows: [["Completed", "23"], ["In progress", "1"], ["Overdue", "0"], ["Exceptions", "2"]],
    why: "Recertification is the control that keeps entitlement aligned to continued business need.",
    drawerTitle: "Access Review Campaigns",
  },
];

/* ------------------------------- posture ---------------------------------- */

export const POSTURE = {
  score: 92,
  status: "Healthy",
  segments: [
    { id: "strong", label: "Strong", pct: 72, color: "#059669", criteria: "Owned identity, federated credential, reviewed within policy, no unused privileged permission." },
    { id: "good", label: "Good", pct: 20, color: "#2563EB", criteria: "Owned and reviewed, but carries unused non-privileged permissions or a session ceiling above the domain default." },
    { id: "fair", label: "Fair", pct: 6, color: "#D97706", criteria: "Review overdue, ownership stale, or a persistent secret used where federation is available." },
    { id: "risky", label: "Risky", pct: 2, color: "#DC2626", criteria: "Unresolved owner, privileged persistent credential, expired certificate or a standing production modification permission outside workflow scope." },
  ],
  components: [
    { id: "orphan", label: "Orphaned identity rate", value: 96, note: "1 of 594 identities has no resolvable owner." },
    { id: "concentration", label: "Privilege concentration", value: 88, note: "14 privileged roles; top role holds 412 effective permissions." },
    { id: "review", label: "Review completion", value: 96, note: "23 of 24 campaigns complete; none overdue." },
    { id: "credential", label: "Credential posture", value: 84, note: "19 service accounts still authenticate with persistent secrets." },
    { id: "dormant", label: "Dormant identities", value: 91, note: "17 identities unused for 90 days across all classes." },
    { id: "violations", label: "Policy violations", value: 94, note: "2 policy conflicts open; 6 denied requests in last 24 hours." },
    { id: "lp", label: "Least privilege coverage", value: 89, note: "89% of grants map to an approved workflow objective." },
    { id: "temporary", label: "Temporary access expiration", value: 99, note: "All JIT grants expired on schedule in the last 30 days." },
    { id: "privileged", label: "Privileged access review", value: 93, note: "Privileged roles reviewed within the quarterly cadence." },
  ],
};

/* -------------------------- identity type mix ----------------------------- */

export type IdentityTypeRow = {
  id: string;
  label: string;
  count: number;
  active: number;
  suspended: number;
  highRisk: number;
  reviewRequired: number;
  avgPermissions: number;
  lastReview: string;
  note: string;
};

export const IDENTITY_TYPES: IdentityTypeRow[] = [
  { id: "digital-coworker", label: "Digital Coworkers", count: 56, active: 56, suspended: 4, highRisk: 3, reviewRequired: 7, avgPermissions: 118, lastReview: "Apr 30, 2026", note: "Non-human identities representing approved digital coworkers." },
  { id: "human", label: "Human Users", count: 342, active: 342, suspended: 9, highRisk: 4, reviewRequired: 24, avgPermissions: 41, lastReview: "Mar 28, 2026", note: "Administrators, approvers, owners, reviewers and engineers." },
  { id: "service-account", label: "Service Accounts", count: 124, active: 124, suspended: 6, highRisk: 5, reviewRequired: 12, avgPermissions: 63, lastReview: "Apr 12, 2026", note: "Connectors, gateways, integrations and execution services." },
  { id: "api-client", label: "API Clients", count: 38, active: 38, suspended: 2, highRisk: 1, reviewRequired: 4, avgPermissions: 22, lastReview: "Apr 22, 2026", note: "Registered OAuth clients consuming tenant APIs." },
  { id: "workload", label: "Workload Identities", count: 74, active: 74, suspended: 0, highRisk: 0, reviewRequired: 3, avgPermissions: 35, lastReview: "May 02, 2026", note: "Federated machine identities issued through platform trust." },
];

/* -------------------------- permission taxonomy --------------------------- */

export type PermissionCategory = {
  id: string;
  label: string;
  pct: number;
  definition: string;
  subcategories: { label: string; note: string }[];
  boundary: string;
};

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "data",
    label: "Data Access",
    pct: 32,
    definition: "Read, search and write authority over governed enterprise data domains and object stores.",
    subcategories: [
      { label: "Read Domain Evidence", note: "Bounded by data domain and classification ceiling." },
      { label: "Search Index", note: "Retrieval through the Context / Evidence service only." },
      { label: "Read Object Store", note: "Prefix-scoped, tenant-isolated." },
      { label: "Write Analytical Output", note: "Only to designated output prefixes." },
      { label: "Export Dataset", note: "Approval required; regulated domains denied." },
    ],
    boundary: "IAM authorizes the request. The Context / Evidence Layer decides which evidence is relevant and eligible.",
  },
  {
    id: "cloud",
    label: "Cloud & Infrastructure",
    pct: 24,
    definition: "Describe, modify and execute authority over cloud resources and infrastructure control planes.",
    subcategories: [
      { label: "Describe Resource", note: "Read-only inventory and configuration." },
      { label: "Modify Resource Attribute", note: "Approval required in production." },
      { label: "Apply Infrastructure Plan", note: "Requires workflow binding and rollback definition." },
      { label: "Terminate Resource", note: "Denied for all digital coworker roles." },
    ],
    boundary: "IAM authorizes the capability. Execution governance decides whether the change may run now.",
  },
  {
    id: "model",
    label: "AI / Model Access",
    pct: 16,
    definition: "Entitlement to request model capabilities through the neugain.io routing layer.",
    subcategories: [
      { label: "Invoke Model", note: "Baseline entitlement for reasoning tasks." },
      { label: "Use Premium Reasoning", note: "Cost-governed; FinOps policy applies." },
      { label: "Access Model Route", note: "Route request only, never direct provider access." },
      { label: "Embedding", note: "Used for retrieval and similarity workloads." },
      { label: "Tool-Calling Model", note: "Required for any tool invocation path." },
      { label: "Vision Model", note: "Document and image evidence interpretation." },
      { label: "High-Context Model", note: "Long-context reasoning over large evidence sets." },
    ],
    boundary: "IAM determines whether the identity may request the capability. The LLM + Model Routing layer determines which approved model handles the request.",
  },
  {
    id: "workflow",
    label: "Workflow & Orchestration",
    pct: 12,
    definition: "Participation rights inside orchestrated workflows, handoffs and approval steps.",
    subcategories: [
      { label: "Join Workflow", note: "Bound to declared workflow roles." },
      { label: "Accept Handoff", note: "Only from approved upstream coworkers." },
      { label: "Request Approval", note: "Raises an approval to a human authority." },
      { label: "Complete Step", note: "Bounded by autonomy ceiling." },
    ],
    boundary: "IAM authorizes participation. Agent Orchestration decides where the coworker participates.",
  },
  {
    id: "observability",
    label: "Observability & Monitoring",
    pct: 8,
    definition: "Read and publish authority over telemetry, metrics, traces and operational events.",
    subcategories: [
      { label: "Read Metrics", note: "Scoped to owned services." },
      { label: "Publish Metrics", note: "Namespace restricted." },
      { label: "Read Traces", note: "Redacted payloads only." },
    ],
    boundary: "IAM authorizes telemetry scope; the observability platform enforces namespace isolation.",
  },
  {
    id: "other",
    label: "Other",
    pct: 8,
    definition: "Administrative, notification, ticketing and platform-utility permissions.",
    subcategories: [
      { label: "Create Ticket", note: "ServiceNow and Jira integration scope." },
      { label: "Send Notification", note: "Approved channels only." },
      { label: "Read Configuration", note: "Non-secret configuration objects." },
    ],
    boundary: "IAM authorizes the utility action; the target system applies its own controls.",
  },
];

/* --------------------------- access activity ------------------------------ */

export type AccessEvent = {
  id: string;
  time: string;
  entity: string;
  entityType: "Digital Coworker" | "Human User" | "Service Account" | "API Client" | "Workload Identity";
  action: string;
  resource: string;
  result: "Success" | "Denied";
  source: string;
  policy: string;
  risk: Risk;
  correlation: string;
  decision: {
    identityStatus: string;
    role: string;
    credential: string;
    sessionAge: string;
    classification: string;
    environment: string;
    region: string;
    delegation: string;
    approval: string;
    checks: { label: string; result: "PASS" | "FAIL" | "NOT PRESENT" }[];
    outcome: string;
    reason: string;
  };
};

const pass = (label: string) => ({ label, result: "PASS" as const });

export const ACCESS_EVENTS: AccessEvent[] = [
  {
    id: "AUTHZ-982144",
    time: "May 14, 2026 10:31:14",
    entity: "Claims Analyzer",
    entityType: "Digital Coworker",
    action: "Read",
    resource: "s3://claims-docs/CLM-773829/*",
    result: "Success",
    source: "us-east-1",
    policy: "Claims Evidence Access",
    risk: "Low",
    correlation: "corr-6f21a9c4",
    decision: {
      identityStatus: "Active",
      role: "Claims Analyzer",
      credential: "OIDC federation · workload identity",
      sessionAge: "14 minutes",
      classification: "Confidential",
      environment: "Production",
      region: "us-east-1 (US)",
      delegation: "Not required for read-only analysis",
      approval: "Not required",
      checks: [
        pass("Identity active"),
        pass("Role Claims Analyzer attached"),
        pass("Resource domain = Claims"),
        pass("Data classification <= Confidential"),
        pass("Environment = Production"),
        pass("Region = US"),
        pass("Session age < 60 minutes"),
        pass("Requested action = Read"),
        { label: "Write permission", result: "NOT PRESENT" },
      ],
      outcome: "ALLOW READ",
      reason: "Role entitlement supplied Read on the Claims evidence prefix and all runtime conditions evaluated true.",
    },
  },
  {
    id: "AUTHZ-982145",
    time: "May 14, 2026 10:28:02",
    entity: "Ravi N.",
    entityType: "Human User",
    action: "Update",
    resource: "Optimization Policy: Rightsizing",
    result: "Success",
    source: "Console / Chrome",
    policy: "Platform Admin Policy",
    risk: "Low",
    correlation: "corr-8b0e21d7",
    decision: {
      identityStatus: "Active",
      role: "Platform Admin",
      credential: "SSO · SAML federation with MFA",
      sessionAge: "22 minutes",
      classification: "Internal",
      environment: "Production",
      region: "us-east-1 (US)",
      delegation: "N/A",
      approval: "Change ticket CHG-44821",
      checks: [pass("Identity active"), pass("MFA satisfied"), pass("Role Platform Admin attached"), pass("Change ticket referenced"), pass("Region = US")],
      outcome: "ALLOW UPDATE",
      reason: "Privileged human administrator with MFA and a referenced change record.",
    },
  },
  {
    id: "AUTHZ-982146",
    time: "May 14, 2026 10:25:41",
    entity: "Cost Optimizer",
    entityType: "Digital Coworker",
    action: "Invoke",
    resource: "AWS:DescribeInstances",
    result: "Success",
    source: "us-east-1",
    policy: "FinOps Read Policy",
    risk: "Low",
    correlation: "corr-1c74ae02",
    decision: {
      identityStatus: "Active",
      role: "FinOps Analyst",
      credential: "Workload identity · 45 minute token",
      sessionAge: "6 minutes",
      classification: "Internal",
      environment: "Production",
      region: "us-east-1 (US)",
      delegation: "Not required",
      approval: "Not required for describe actions",
      checks: [pass("Identity active"), pass("Role FinOps Analyst attached"), pass("Action in read-only set"), pass("Account in approved scope"), pass("Region = US")],
      outcome: "ALLOW INVOKE",
      reason: "Describe actions are read-only and inside the approved FinOps account scope.",
    },
  },
  {
    id: "AUTHZ-982147",
    time: "May 14, 2026 10:20:09",
    entity: "Fraud Investigator",
    entityType: "Digital Coworker",
    action: "Read",
    resource: "dynamodb://fraud-events",
    result: "Success",
    source: "us-east-1",
    policy: "Investigation Policy",
    risk: "Low",
    correlation: "corr-90fe1123",
    decision: {
      identityStatus: "Active",
      role: "Fraud Investigator",
      credential: "OIDC federation",
      sessionAge: "31 minutes",
      classification: "Restricted",
      environment: "Production",
      region: "us-east-1 (US)",
      delegation: "Investigation case INV-2291",
      approval: "Case owner authorization present",
      checks: [pass("Identity active"), pass("Case authorization present"), pass("Classification ceiling = Restricted"), pass("Region = US"), pass("Session age < 60 minutes")],
      outcome: "ALLOW READ",
      reason: "Restricted access permitted only while an authorized investigation case is open.",
    },
  },
  {
    id: "AUTHZ-982148",
    time: "May 14, 2026 10:18:55",
    entity: "svc-telemetry",
    entityType: "Service Account",
    action: "Write",
    resource: "datadog.metrics",
    result: "Success",
    source: "us-east-1",
    policy: "Telemetry Publisher",
    risk: "Low",
    correlation: "corr-3ad91007",
    decision: {
      identityStatus: "Active",
      role: "Telemetry Publisher",
      credential: "mTLS certificate · expires Aug 2026",
      sessionAge: "2 minutes",
      classification: "Internal",
      environment: "Production",
      region: "us-east-1 (US)",
      delegation: "N/A",
      approval: "Not required",
      checks: [pass("Identity active"), pass("Certificate valid"), pass("Namespace in approved scope"), pass("Action = Write metrics")],
      outcome: "ALLOW WRITE",
      reason: "Namespace-scoped metric publication by an owned platform service account.",
    },
  },
  {
    id: "AUTHZ-982149",
    time: "May 14, 2026 10:15:33",
    entity: "marketing-automation",
    entityType: "Service Account",
    action: "Write",
    resource: "snowflake.reporting",
    result: "Success",
    source: "us-east-1",
    policy: "Reporting Integration",
    risk: "Medium",
    correlation: "corr-7d5501bb",
    decision: {
      identityStatus: "Active",
      role: "Reporting Integration",
      credential: "Persistent secret · rotated 41 days ago",
      sessionAge: "9 minutes",
      classification: "Internal",
      environment: "Production",
      region: "us-east-1 (US)",
      delegation: "N/A",
      approval: "Not required",
      checks: [pass("Identity active"), pass("Secret within rotation window"), pass("Schema in approved scope"), { label: "Federated credential available", result: "FAIL" }],
      outcome: "ALLOW WRITE (elevated risk)",
      reason: "Allowed by policy, flagged Medium because a persistent secret is used where federation is available.",
    },
  },
  {
    id: "AUTHZ-982150",
    time: "May 14, 2026 10:12:04",
    entity: "API Client: mobile-app",
    entityType: "API Client",
    action: "Read",
    resource: "/api/v1/policies",
    result: "Success",
    source: "External · 198.51.100.42",
    policy: "Mobile API Policy",
    risk: "Medium",
    correlation: "corr-2ea77c19",
    decision: {
      identityStatus: "Active",
      role: "Mobile API Reader",
      credential: "OAuth client credentials · 15 minute token",
      sessionAge: "3 minutes",
      classification: "Internal",
      environment: "Production",
      region: "External ingress",
      delegation: "N/A",
      approval: "Not required",
      checks: [pass("Client registered"), pass("Scope api.policies.read"), pass("Rate limit within bounds"), { label: "Network origin internal", result: "FAIL" }],
      outcome: "ALLOW READ",
      reason: "External origin raises risk classification but remains inside the registered client scope.",
    },
  },
  {
    id: "AUTHZ-982151",
    time: "May 14, 2026 10:04:47",
    entity: "Remediation Engineer",
    entityType: "Digital Coworker",
    action: "Modify",
    resource: "k8s://cluster-prod-27/deployment/claims-api",
    result: "Denied",
    source: "us-east-1",
    policy: "Production Change Policy",
    risk: "High",
    correlation: "corr-55c1d803",
    decision: {
      identityStatus: "Active",
      role: "Remediation Engineer",
      credential: "Workload identity · 20 minute token",
      sessionAge: "4 minutes",
      classification: "Internal",
      environment: "Production",
      region: "us-east-1 (US)",
      delegation: "No valid delegation reference",
      approval: "Missing",
      checks: [
        pass("Identity active"),
        pass("Role Remediation Engineer attached"),
        pass("Target cluster in approved scope"),
        pass("Region = US"),
        { label: "Incident workflow approval reference", result: "FAIL" },
        { label: "JIT privilege active", result: "NOT PRESENT" },
      ],
      outcome: "DENY MODIFY",
      reason: "Role allows Kubernetes deployment modification, but runtime policy requires an approved incident workflow reference which was absent.",
    },
  },
];

/* --------------------------- high risk findings --------------------------- */

export type RiskFinding = {
  id: string;
  entity: string;
  entityType: string;
  risk: Risk;
  issue: string;
  owner: string;
  reviewDue: string;
  detected: string;
  permissions: string[];
  lastAccess: string;
  remediation: string;
  why: string;
};

export const RISK_FINDINGS: RiskFinding[] = [
  {
    id: "RISK-1041",
    entity: "Legacy Data Exporter",
    entityType: "Service Account",
    risk: "High",
    issue: "Broad S3 access not reviewed in 180 days",
    owner: "Unassigned",
    reviewDue: "Overdue",
    detected: "Effective permission breadth exceeds domain ceiling and review age exceeds policy.",
    permissions: ["s3:GetObject on 11 buckets", "s3:ListBucket on 11 buckets", "s3:PutObject on 3 buckets"],
    lastAccess: "62 days ago",
    remediation: "Assign an accountable owner, reduce to the two active buckets and place under quarterly review.",
    why: "Unreviewed broad object-store access is the largest single source of data exposure in the tenant.",
  },
  {
    id: "RISK-1042",
    entity: "svc-admin-automation",
    entityType: "Service Account",
    risk: "High",
    issue: "Administrative privileges with persistent credential",
    owner: "Platform Engineering",
    reviewDue: "May 20, 2026",
    detected: "Privileged role combined with a non-federated persistent secret.",
    permissions: ["iam:AttachRolePolicy", "iam:CreateAccessKey", "eks:UpdateClusterConfig"],
    lastAccess: "2 days ago",
    remediation: "Migrate to workload identity federation and split administrative actions into a JIT-elevated role.",
    why: "A privileged persistent secret cannot be revoked contextually and survives session termination.",
  },
  {
    id: "RISK-1043",
    entity: "Orphaned Service Account",
    entityType: "Service Account",
    risk: "High",
    issue: "Owner unresolved and no activity in 90 days",
    owner: "Unresolved",
    reviewDue: "Overdue",
    detected: "Ownership resolution failed and usage telemetry shows no authorization requests in 90 days.",
    permissions: ["snowflake.reporting read", "s3:GetObject on 2 buckets", "sns:Publish"],
    lastAccess: "103 days ago",
    remediation: "Assign an owner within 5 days or suspend the identity and revoke credentials.",
    why: "Unowned identities cannot be recertified and have no accountable party for incident response.",
  },
  {
    id: "RISK-1044",
    entity: "FinOps Executor",
    entityType: "Digital Coworker",
    risk: "Medium",
    issue: "Production modification permission exceeds current workflow scope",
    owner: "Cloud Economics",
    reviewDue: "Jun 02, 2026",
    detected: "Granted modify permission has no matching approved workflow objective.",
    permissions: ["ec2:ModifyInstanceAttribute", "autoscaling:UpdateAutoScalingGroup"],
    lastAccess: "17 days ago",
    remediation: "Convert standing modify permission to approval-gated JIT privilege bound to the rightsizing workflow.",
    why: "Standing production modification authority outside a workflow removes the approval control point.",
  },
  {
    id: "RISK-1045",
    entity: "Claims Analyzer v4",
    entityType: "Digital Coworker",
    risk: "Medium",
    issue: "Unused DynamoDB write permission",
    owner: "Claims Operations",
    reviewDue: "Jun 10, 2026",
    detected: "Permission assigned 184 days ago with zero recorded use.",
    permissions: ["dynamodb:PutItem on claims-index"],
    lastAccess: "Never used",
    remediation: "Remove the permission; no execution path or workflow requires this action.",
    why: "Unused write permissions widen blast radius with no operational benefit.",
  },
];

/* ----------------------------- policy changes ----------------------------- */

export type PolicyChange = {
  id: string;
  policy: string;
  change: "Created" | "Updated" | "Deprecated";
  by: string;
  time: string;
  reason: string;
  version: string;
  diff: [string, string, string][]; // field, old, new
};

export const POLICY_CHANGES: PolicyChange[] = [
  {
    id: "PC-3301",
    policy: "Claims Data Access Policy",
    change: "Updated",
    by: "Ravi N.",
    time: "May 14, 2026 10:10 AM",
    reason: "CHG-44821 · Narrow evidence prefix after claims platform migration",
    version: "v8 → v9",
    diff: [
      ["Resource scope", "s3://claims-docs/*", "s3://claims-docs/CLM-*/*"],
      ["Session age condition", "< 120 minutes", "< 60 minutes"],
      ["Classification ceiling", "Restricted", "Confidential"],
    ],
  },
  {
    id: "PC-3302",
    policy: "AI Model Access Policy",
    change: "Created",
    by: "neugain.io System",
    time: "May 13, 2026 04:45 PM",
    reason: "Model capability entitlement split from general data policy",
    version: "v1",
    diff: [
      ["Subject", "—", "Digital Coworker with model capability entitlement"],
      ["Action", "—", "RequestModelRoute, UseAdvancedReasoning"],
      ["Condition", "—", "regulated data route requires domain = Claims and approval"],
    ],
  },
  {
    id: "PC-3303",
    policy: "Cloud Infrastructure Policy",
    change: "Updated",
    by: "Priya S.",
    time: "May 13, 2026 02:21 PM",
    reason: "INC-98271 · Require workflow approval for cluster modification",
    version: "v11 → v12",
    diff: [
      ["Condition", "environment = Production", "environment = Production AND runtime.approvalRef present"],
      ["Effect on TerminateInstances", "Approval required", "Deny"],
    ],
  },
];

/* ------------------- top entities by permission count --------------------- */

export type EntityPermissionRow = {
  id: string;
  entity: string;
  type: string;
  effective: number;
  privileged: number;
  unused: number;
  lastReview: string;
  breadth: string;
  severity: string;
  usage: string;
};

export const TOP_ENTITIES: EntityPermissionRow[] = [
  { id: "platform-admins", entity: "Platform Admins", type: "Role", effective: 412, privileged: 96, unused: 18, lastReview: "Apr 02, 2026", breadth: "Tenant-wide across 24 services", severity: "96 privileged actions including IAM and execution", usage: "88% of permissions used in last 90 days" },
  { id: "cost-optimizer", entity: "Cost Optimizer", type: "Digital Coworker", effective: 286, privileged: 12, unused: 31, lastReview: "Apr 18, 2026", breadth: "Cloud and FinOps scope across 6 accounts", severity: "12 modify actions, all approval-gated", usage: "74% used; 31 permissions unused for 90 days" },
  { id: "claims-analyzer", entity: "Claims Analyzer", type: "Digital Coworker", effective: 267, privileged: 0, unused: 9, lastReview: "May 12, 2026", breadth: "Claims domain, read and analytical write", severity: "No privileged actions", usage: "91% used in last 30 days" },
  { id: "remediation-engineer", entity: "Remediation Engineer", type: "Digital Coworker", effective: 194, privileged: 22, unused: 6, lastReview: "Apr 29, 2026", breadth: "Kubernetes and infrastructure remediation", severity: "22 privileged actions, JIT only", usage: "Used within incident workflows only" },
  { id: "svc-orchestration", entity: "svc-orchestration", type: "Service Account", effective: 162, privileged: 8, unused: 14, lastReview: "Apr 09, 2026", breadth: "Workflow control plane and queue access", severity: "8 privileged workflow actions", usage: "Continuous platform usage" },
];

/* ------------------------------- reviews ---------------------------------- */

export const REVIEW_SUMMARY = {
  total: 24,
  completed: 23,
  inProgress: 1,
  overdue: 0,
  exceptions: 2,
  nextDue: "May 26, 2026",
  campaign: "Digital Coworkers · Quarterly Review",
  types: [
    "Digital Coworker Quarterly Review",
    "Privileged Role Review",
    "Service Account Review",
    "Dormant Identity Review",
    "High Risk Permission Review",
    "Application Owner Review",
  ],
  decisions: ["Certify", "Remove Permission", "Reduce Scope", "Suspend", "Change Owner", "Request Evidence", "Exception"],
  items: [
    { identity: "Claims Analyzer", owner: "Claims Operations", role: "Claims Analyzer", permissions: 86, lastUse: "Today", unused: 9, risk: "Low" as Risk, recommendation: "Certify with scope reduction on DynamoDB write." },
    { identity: "Cost Optimizer", owner: "Cloud Economics", role: "FinOps Analyst", permissions: 286, lastUse: "Yesterday", unused: 31, risk: "Medium" as Risk, recommendation: "Reduce scope: remove 31 unused permissions." },
    { identity: "Legacy Data Exporter", owner: "Unassigned", role: "Data Exporter", permissions: 74, lastUse: "62 days ago", unused: 48, risk: "High" as Risk, recommendation: "Assign owner or suspend identity." },
  ],
};

/* --------------------------- role: Claims Analyzer ------------------------ */

export const ROLE = {
  id: "role_8r0a2e7a9",
  name: "Claims Analyzer",
  objectType: "Role / Digital Coworker Access Role",
  status: "Active",
  version: "v8 Active · v9 Draft",
  description:
    "Allows the Claims Analyzer digital coworker to read approved claims evidence, invoke approved AI analysis capabilities, and produce analytical outputs within the claims domain.",
  roleType: "Digital Coworker",
  trustRequired: "Platform Managed",
  maxSession: "1 hour",
  environments: "Production + Nonproduction",
  regions: "US",
  classificationCeiling: "Confidential",
  privilegedExecution: "No",
  humanDelegation: "Not required for read-only analysis",
  created: "Apr 10, 2025",
  updated: "May 12, 2026",
  lastAccess: "May 14, 2026 10:31 AM",
  assignedEntities: [{ name: "Claims Analyzer", type: "Digital Coworker", environment: "Production" }],
  totals: { permissions: 86, allow: 86, deny: 0, services: 18 },
  groups: [
    { label: "Data", count: 42 },
    { label: "Models", count: 10 },
    { label: "Tools", count: 14 },
    { label: "Workflow", count: 10 },
    { label: "Observability", count: 6 },
    { label: "Administration", count: 4 },
  ],
  services: [
    { name: "Amazon S3", count: 24 },
    { name: "Amazon DynamoDB", count: 18 },
    { name: "AWS Lambda", count: 12 },
    { name: "Model Routing", count: 10 },
    { name: "ServiceNow", count: 8 },
    { name: "Datadog", count: 6 },
    { name: "Other Services", count: 8 },
  ],
  granular: {
    "Amazon S3": {
      allowed: ["GetObject", "ListBucket", "GetObjectVersion"],
      resources: ["claims-evidence-prod", "claims-reference-prod"],
      denied: ["PutObject", "DeleteObject", "PutBucketPolicy", "Objects outside tenant DUAL"],
      conditions: [
        "resource.domain = Claims",
        "runtime.region in [US]",
        "resource.classification <= Confidential",
        "resource.environment = Production",
        "request.origin = neugain.io Context / Evidence Service",
      ],
      calculation: [
        "Role grant: s3:Get*, s3:List* on claims-* prefixes",
        "Direct grant: none",
        "Explicit deny: s3:Put*, s3:Delete* (policy Claims Write Restriction)",
        "Policy condition: classification ceiling Confidential filters 3 restricted prefixes",
        "Effective: 3 actions on 2 buckets, read-only",
      ],
    },
  } as Record<string, {
    allowed: string[]; resources: string[]; denied: string[]; conditions: string[]; calculation: string[];
  }>,
  attachedPolicies: [
    { name: "Claims Data Access Policy", state: "Attached" },
    { name: "Claims Analysis Write Policy", state: "Attached" },
    { name: "AI Model Access Policy", state: "Attached" },
  ],
  modelCapabilities: [
    { label: "May Request Model Route", state: "Allow" },
    { label: "May Use Advanced Reasoning Tier", state: "Allow" },
    { label: "May Use Vision", state: "Allow" },
    { label: "May Use Tool-Calling Models", state: "Allow" },
    { label: "May Use Long Context", state: "Allow" },
    { label: "May Use External Provider", state: "Deny" },
    { label: "May Use Regulated Data Model Route", state: "Approval Required" },
  ],
  dataDomains: [
    { domain: "Claims", access: "Confidential" },
    { domain: "Policy", access: "Internal" },
    { domain: "Underwriting", access: "Internal" },
    { domain: "Customer", access: "Denied (Restricted)" },
    { domain: "Finance", access: "Denied" },
    { domain: "HR", access: "Denied" },
  ],
  history: [
    { time: "May 12, 2026", actor: "Ravi N.", event: "Session ceiling reduced from 120 to 60 minutes (CHG-44821)" },
    { time: "Apr 30, 2026", actor: "Access Review", event: "Certified by Claims Operations with scope reduction note" },
    { time: "Mar 02, 2026", actor: "Priya S.", event: "Vision model capability added for document evidence" },
    { time: "Apr 10, 2025", actor: "neugain.io System", event: "Role created from Digital Coworker access template" },
  ],
  usage: [
    ["Authorization requests (30d)", "18,204"],
    ["Allow rate", "99.7%"],
    ["Denies (30d)", "54"],
    ["Most used permission", "s3:GetObject (11,982)"],
    ["Least used permission", "dynamodb:PutItem (0)"],
  ] as [string, string][],
};

/* --------------------------- tool governance ------------------------------ */

export const TOOL_GOVERNANCE = [
  {
    identity: "Cost Optimizer",
    system: "AWS",
    rows: [
      { action: "DescribeInstances", effect: "Allow", constraint: "Read-only, 6 approved accounts", source: "FinOps Read Policy", lastUse: "Today" },
      { action: "ModifyInstanceAttribute", effect: "Approval Required", constraint: "Production requires owner approval + change window", source: "Production Change Policy", lastUse: "9 days ago" },
      { action: "TerminateInstances", effect: "Deny", constraint: "Prohibited for all digital coworker roles", source: "Destructive Action Policy", lastUse: "Never" },
    ],
  },
  {
    identity: "Cost Optimizer",
    system: "Terraform",
    rows: [
      { action: "Plan", effect: "Allow", constraint: "Any approved workspace", source: "IaC Read Policy", lastUse: "Today" },
      { action: "Apply", effect: "Approval Required", constraint: "Requires rollback plan and approver", source: "IaC Change Policy", lastUse: "4 days ago" },
      { action: "Destroy", effect: "Deny", constraint: "Prohibited", source: "Destructive Action Policy", lastUse: "Never" },
    ],
  },
];

/* --------------------------- delegation and JIT --------------------------- */

export const DELEGATIONS = [
  {
    id: "DEL-7741",
    delegator: "SRE Lead · Priya S.",
    delegate: "Remediation Engineer",
    action: "Apply approved Terraform plan",
    scope: "cluster-prod-27",
    duration: "15 minutes",
    approval: "APR-33192",
    workflow: "INC-98271 remediation",
    reason: "Restore claims-api capacity after node pool degradation",
    correlation: "corr-55c1d803",
    state: "Expired · permission automatically revoked",
  },
  {
    id: "DEL-7742",
    delegator: "Claims Operations · M. Doyle",
    delegate: "Claims Analyzer",
    action: "Read restricted customer attachment",
    scope: "CLM-773829",
    duration: "30 minutes",
    approval: "APR-33207",
    workflow: "Claims evidence assembly",
    reason: "Adjuster requested supporting medical documentation review",
    correlation: "corr-6f21a9c4",
    state: "Active · 12 minutes remaining",
  },
];

export const JIT_REQUEST = {
  id: "JIT-2208",
  identity: "Remediation Engineer",
  request: "Modify Production Kubernetes Deployment",
  reason: "Incident INC-98271",
  target: "cluster-prod-27 / deployment claims-api",
  duration: "20 minutes",
  requirements: [
    { label: "Workflow active", state: "Met" },
    { label: "Human approval", state: "Pending" },
    { label: "Approved target in scope", state: "Met" },
    { label: "Rollback defined", state: "Met" },
  ],
  afterWorkflow: "Privilege automatically removed at expiry or workflow completion, whichever occurs first.",
};

/* ---------------------------- credential posture -------------------------- */

export const CREDENTIALS = [
  { identity: "Claims Analyzer", type: "OIDC federation", issuer: "neugain.io Identity Service", audience: "Context Service", expires: "60 minute token", rotation: "N/A (short-lived)", lastIssued: "10:17 AM", lastUsed: "10:31 AM", persistent: "No", privileged: "No", risk: "Low" as Risk },
  { identity: "Remediation Engineer", type: "Workload identity", issuer: "neugain.io Identity Service", audience: "Execution Service", expires: "20 minute token", rotation: "N/A (short-lived)", lastIssued: "10:00 AM", lastUsed: "10:04 AM", persistent: "No", privileged: "Yes (JIT)", risk: "Medium" as Risk },
  { identity: "svc-telemetry", type: "mTLS certificate", issuer: "Internal PKI", audience: "Telemetry ingress", expires: "Aug 12, 2026", rotation: "90 days", lastIssued: "Feb 12, 2026", lastUsed: "10:18 AM", persistent: "No", privileged: "No", risk: "Low" as Risk },
  { identity: "marketing-automation", type: "Persistent secret", issuer: "Secret store", audience: "Snowflake", expires: "No expiry", rotation: "90 days (41 days elapsed)", lastIssued: "Apr 03, 2026", lastUsed: "10:15 AM", persistent: "Yes", privileged: "No", risk: "Medium" as Risk },
  { identity: "svc-admin-automation", type: "Persistent secret", issuer: "Secret store", audience: "AWS IAM", expires: "No expiry", rotation: "Overdue by 22 days", lastIssued: "Jan 18, 2026", lastUsed: "May 12, 2026", persistent: "Yes", privileged: "Yes", risk: "High" as Risk },
];

export const SESSION_CONTROLS: [string, string][] = [
  ["Token TTL", "60 minutes"],
  ["Idle timeout", "15 minutes"],
  ["Issuer", "neugain.io Identity Service"],
  ["Audience", "Context Service"],
  ["Scopes", "claims.evidence.read, model.route.request"],
  ["Environment binding", "Production"],
  ["Region", "US"],
  ["Network restriction", "Internal service mesh only"],
  ["Workload attestation", "Required"],
  ["Replay protection", "Enabled"],
  ["Reauthentication", "Required for classification escalation"],
  ["Revocation", "Immediate via session revoke"],
];

/* ------------------------------- simulator -------------------------------- */

export const SIM_IDENTITIES = ["Claims Analyzer", "Cost Optimizer", "Remediation Engineer", "svc-telemetry", "API Client: mobile-app"];
export const SIM_ACTIONS = ["Read", "Write", "Invoke", "Modify", "Execute", "Delete"];
export const SIM_RESOURCES = [
  { label: "s3://claims-docs/CLM-773829/*", domain: "Claims", classification: "Confidential" },
  { label: "s3://customer-pii/*", domain: "Customer", classification: "Restricted" },
  { label: "k8s://cluster-prod-27/deployment/claims-api", domain: "Cloud Operations", classification: "Internal" },
  { label: "snowflake.reporting", domain: "Finance", classification: "Internal" },
];
export const SIM_ROLE_CEILING: Record<string, { ceiling: string; domains: string[]; write: boolean; modify: boolean }> = {
  "Claims Analyzer": { ceiling: "Confidential", domains: ["Claims", "Policy", "Underwriting"], write: false, modify: false },
  "Cost Optimizer": { ceiling: "Internal", domains: ["Cloud Operations", "Finance"], write: true, modify: true },
  "Remediation Engineer": { ceiling: "Internal", domains: ["Cloud Operations"], write: true, modify: true },
  "svc-telemetry": { ceiling: "Internal", domains: ["Observability"], write: true, modify: false },
  "API Client: mobile-app": { ceiling: "Internal", domains: ["Policy"], write: false, modify: false },
};

const CLASS_ORDER = ["Public", "Internal", "Confidential", "Restricted", "Regulated"];
export function classAtOrBelow(value: string, ceiling: string) {
  return CLASS_ORDER.indexOf(value) <= CLASS_ORDER.indexOf(ceiling);
}

/* ------------------------- architectural boundaries ----------------------- */

export const BOUNDARIES: [string, string][] = [
  ["IAM", "Determines whether Claims Analyzer may request access to Claims evidence."],
  ["Context / Evidence Layer", "Determines what claims evidence is relevant and eligible for the objective."],
  ["LLM + Model Routing", "Determines which approved model may handle the reasoning task."],
  ["Agent Orchestration", "Determines where the coworker participates in the workflow."],
  ["Autonomy Policy", "Determines whether the action requires human approval."],
  ["Execution", "Performs the approved action and records the outcome."],
];

export const SERVICE_CONTRACT: [string, string][] = [
  ["Identified", "Every human and non-human actor has a known identity with a resolvable owner."],
  ["Authenticated", "Identity is verified through an approved trust mechanism before entitlement is evaluated."],
  ["Least privileged", "Access is limited to the permissions required for the approved objective."],
  ["Contextual", "Authorization considers identity, resource, environment, workflow and runtime context."],
  ["Bounded", "Digital coworkers cannot exceed configured permission and autonomy boundaries."],
  ["Temporary where possible", "Privileged authority expires automatically at the end of its window."],
  ["Explainable", "Every allow or deny decision can be reconstructed from retained evidence."],
  ["Reviewed", "Access remains subject to ownership resolution and recertification."],
  ["Auditable", "Identity, policy, delegation and execution decisions are retained per tenant policy."],
];

export const DEFINITIONS: [string, string][] = [
  ["Digital Coworker Identity", "A first-class non-human identity representing an approved neugain.io digital coworker."],
  ["Service Account", "Non-human identity used by a service, connector, integration or platform component."],
  ["Role", "Managed collection of permissions and constraints that may be assigned to an identity."],
  ["Permission", "Authorization to perform an action on a specific resource or class of resources."],
  ["Access Policy", "Rule determining whether a requested action is allowed or denied under defined conditions."],
  ["Effective Permission", "Final permission available after roles, direct grants, explicit denies, policy conditions and runtime constraints are evaluated."],
  ["Workload Identity", "Machine identity authenticated through a platform trust mechanism rather than a human credential."],
  ["Delegated Authority", "Temporary authority transferred from an approved human, workflow or service to another identity for a bounded purpose."],
  ["JIT Privilege", "Temporary privileged access granted only for a defined objective and time window."],
  ["Access Review", "Human or policy-assisted recertification of identity ownership, permissions and continued business need."],
];

/* ------------------------------- RBAC roles ------------------------------- */

export type AdminRoleId = "platform-admin" | "iam-admin" | "security-admin" | "coworker-admin" | "app-owner" | "approver" | "auditor";

export const ADMIN_ROLES: { id: AdminRoleId; label: string; scope: string; can: string[] }[] = [
  { id: "platform-admin", label: "Platform Admin", scope: "Full control", can: ["create", "edit", "approve", "review", "simulate"] },
  { id: "iam-admin", label: "IAM Admin", scope: "Identity, roles, policies", can: ["create", "edit", "review", "simulate"] },
  { id: "security-admin", label: "Security Admin", scope: "Privilege, credentials, policy", can: ["edit", "approve", "review", "simulate"] },
  { id: "coworker-admin", label: "Digital Coworker Admin", scope: "Coworker identity and role assignment", can: ["create", "edit", "simulate"] },
  { id: "app-owner", label: "Application Owner", scope: "Review resources they own", can: ["review", "simulate"] },
  { id: "approver", label: "Approver", scope: "Approve delegated privilege", can: ["approve", "simulate"] },
  { id: "auditor", label: "Auditor", scope: "Read-only access and history", can: ["simulate"] },
];

export const CAPABILITY_REASON: Record<string, string> = {
  create: "Your administrative role cannot create identities, roles or policies in this tenant.",
  edit: "Your administrative role is read-only for this object class.",
  approve: "Approval authority is restricted to Approver, Security Admin and Platform Admin roles.",
  review: "Access review decisions are restricted to assigned reviewers and IAM administrators.",
};

/* ------------------------------- search ----------------------------------- */

export type SearchItem = { group: string; label: string; sub: string; target: string };

export const SEARCH_INDEX: SearchItem[] = [
  { group: "Digital Coworkers", label: "Claims Analyzer", sub: "Claims domain · Confidential ceiling", target: "role" },
  { group: "Digital Coworkers", label: "Cost Optimizer", sub: "Cloud Operations · approval-gated modify", target: "entity:cost-optimizer" },
  { group: "Digital Coworkers", label: "Remediation Engineer", sub: "Kubernetes remediation · JIT privilege", target: "entity:remediation-engineer" },
  { group: "Digital Coworkers", label: "Fraud Investigator", sub: "Restricted access under investigation case", target: "event:AUTHZ-982147" },
  { group: "Human Users", label: "Ravi N.", sub: "Platform Admin", target: "event:AUTHZ-982145" },
  { group: "Service Accounts", label: "svc-telemetry", sub: "mTLS · telemetry publisher", target: "credentials" },
  { group: "Service Accounts", label: "svc-admin-automation", sub: "Privileged persistent secret", target: "risk:RISK-1042" },
  { group: "Service Accounts", label: "Legacy Data Exporter", sub: "Unowned broad S3 access", target: "risk:RISK-1041" },
  { group: "API Clients", label: "mobile-app", sub: "OAuth client · external ingress", target: "event:AUTHZ-982150" },
  { group: "Roles", label: "Claims Analyzer Role", sub: "86 permissions · 18 services", target: "role" },
  { group: "Roles", label: "Platform Admins", sub: "412 effective permissions", target: "entity:platform-admins" },
  { group: "Policies", label: "Claims Data Access Policy", sub: "Updated v8 → v9", target: "policy:PC-3301" },
  { group: "Policies", label: "AI Model Access Policy", sub: "Created v1", target: "policy:PC-3302" },
  { group: "Policies", label: "Cloud Infrastructure Policy", sub: "Updated v11 → v12", target: "policy:PC-3303" },
  { group: "Resources", label: "s3://claims-docs", sub: "Claims · Confidential", target: "category:data" },
  { group: "Resources", label: "k8s://cluster-prod-27", sub: "Cloud Operations · production", target: "category:cloud" },
];
