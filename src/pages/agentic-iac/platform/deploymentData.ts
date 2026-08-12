// Canonical (mock) model for the Customer Deployment Architecture screen.
// Conceptual reference architecture — no live infrastructure is described here.

export type DeploymentModel = "customer" | "vendor" | "hybrid";
export type ViewMode = "architecture" | "trust" | "dataflow" | "demo";

export type NodeId = string;

export interface ArchNode {
  id: NodeId;
  label: string;
  purpose: string;
  layer: 1 | 2 | 3 | 4;
  status?: "available" | "planned" | "customer-specific" | "demo";
  detail?: { label: string; value: string }[];
}

export const DEPLOYMENT_MODELS: {
  id: DeploymentModel;
  label: string;
  badge: string;
  conceptual?: boolean;
  summary: { label: string; value: string }[];
  statement: string;
}[] = [
  {
    id: "customer",
    label: "Customer Hosted",
    badge: "Customer Hosted",
    statement:
      "Control plane, execution services, operational data and evidence remain within the customer-controlled environment.",
    summary: [
      { label: "Control Plane", value: "Customer Environment" },
      { label: "Execution Runners", value: "Customer Environment" },
      { label: "Secrets", value: "Customer Controlled" },
      { label: "Evidence", value: "Customer Environment" },
      { label: "Production Identities", value: "Customer Controlled" },
    ],
  },
  {
    id: "vendor",
    label: "Vendor Hosted",
    badge: "Vendor Hosted — Conceptual",
    conceptual: true,
    statement:
      "Conceptual deployment option. Control plane operates in a vendor-managed environment; execution and secrets remain customer controlled.",
    summary: [
      { label: "Control Plane", value: "Vendor Managed" },
      { label: "Execution Runners", value: "Customer Environment" },
      { label: "Connectivity", value: "Customer Outbound Connectors" },
      { label: "Secrets", value: "Customer Controlled" },
      { label: "Production Identities", value: "Customer Controlled" },
    ],
  },
  {
    id: "hybrid",
    label: "Hybrid",
    badge: "Hybrid — Conceptual",
    conceptual: true,
    statement:
      "Conceptual alternative. Control plane responsibilities are split; execution and sensitive operational data remain in the customer environment.",
    summary: [
      { label: "Control Plane", value: "Split" },
      { label: "Execution Runners", value: "Customer Environment" },
      { label: "Sensitive Data", value: "Customer Environment" },
      { label: "Secrets", value: "Customer Controlled" },
      { label: "Production Identities", value: "Customer Controlled" },
    ],
  },
];

export const CONTROL_PLANE: ArchNode[] = [
  { id: "web-ui", label: "Web UI", purpose: "Engineer and administrator interface", layer: 1 },
  { id: "api-gw", label: "API Gateway", purpose: "Application / API access boundary", layer: 1 },
  { id: "agentic", label: "Agentic Orchestration", purpose: "Coordinates reasoning and workflow", layer: 1 },
  { id: "twin", label: "Digital Twin / Asset Graph", purpose: "Infrastructure state, relationships and dependencies", layer: 1 },
  { id: "action-library", label: "Action Library", purpose: "Approved infrastructure actions and engineering patterns", layer: 1 },
  { id: "remediation", label: "Remediation Intelligence", purpose: "Diagnoses operational conditions and evaluates remediation", layer: 1 },
  { id: "change-eng", label: "Change Engineering", purpose: "Generates cross-platform change packages", layer: 1 },
  { id: "policy", label: "Policy Engine", purpose: "Evaluates automation authority and production policy", layer: 1 },
  { id: "exec-orch", label: "Execution Orchestrator", purpose: "Coordinates approved execution", layer: 1 },
  { id: "validation", label: "Validation Engine", purpose: "Validates technical and service outcomes", layer: 1 },
  { id: "evidence", label: "Evidence Service", purpose: "Collects execution and validation evidence", layer: 1 },
  { id: "audit", label: "Audit & Reporting", purpose: "Immutable activity and decision history", layer: 1 },
];

export const DATA_SERVICES: ArchNode[] = [
  { id: "ds-db", label: "Operational Database", purpose: "Relational store (e.g. managed relational service)", layer: 1 },
  { id: "ds-graph", label: "Digital Twin Graph Store", purpose: "Graph store for asset relationships", layer: 1 },
  { id: "ds-object", label: "Object / Evidence Store", purpose: "Immutable object storage for evidence", layer: 1 },
  { id: "ds-config", label: "Configuration Store", purpose: "Platform and connector configuration", layer: 1 },
  { id: "ds-policy", label: "Policy Store", purpose: "Automation authority and guardrail definitions", layer: 1 },
  { id: "ds-audit", label: "Audit Store", purpose: "Append-only audit records", layer: 1 },
  { id: "ds-queue", label: "Queue / Workflow State", purpose: "Durable workflow and execution state", layer: 1 },
  { id: "ds-secrets", label: "Customer-Managed Secrets Integration", purpose: "References customer secret manager / PAM", layer: 1 },
];

export const CONTROL_PLANE_CHARACTERISTICS: { label: string; value: string }[] = [
  { label: "Deployment", value: "Customer cloud" },
  { label: "Tenant Model", value: "Single customer" },
  { label: "Network", value: "Private customer network" },
  { label: "Ingress", value: "Customer-controlled" },
  { label: "Encryption at Rest", value: "Required" },
  { label: "Encryption in Transit", value: "Required" },
  { label: "Identity", value: "Customer SSO / enterprise identity" },
  { label: "Secrets", value: "Customer-controlled secret manager / PAM" },
  { label: "High Availability", value: "Recommended" },
  { label: "Backup", value: "Required" },
  { label: "Disaster Recovery", value: "Configurable" },
  { label: "Monitoring", value: "Customer + platform telemetry" },
  { label: "Audit", value: "Enabled" },
];

const runnerDetail = (identity: string, ops: string) => [
  { label: "Deployment", value: "Customer Execution Zone" },
  { label: "Network", value: "Private" },
  { label: "Credentials", value: "Retrieved at execution time" },
  { label: "Identity", value: identity },
  { label: "Allowed Operations", value: ops },
  { label: "Can Change Package", value: "No" },
  { label: "Can Change Target", value: "No" },
  { label: "Can Add Resources", value: "Only if explicitly approved" },
  { label: "Can Destroy Resources", value: "Policy controlled" },
  { label: "Audit", value: "All operations recorded" },
];

export const EXECUTION_ZONE: ArchNode[] = [
  { id: "run-tf", label: "Terraform Runner", purpose: "Executes approved IaC plans", layer: 2, status: "demo", detail: runnerDetail("Customer execution role", "Approved IaC package only") },
  { id: "run-ps", label: "PowerShell Runner", purpose: "Executes approved Windows administration", layer: 2, status: "demo", detail: runnerDetail("Windows management identity", "Approved script actions only") },
  { id: "run-sql", label: "SQL Runner", purpose: "Executes approved database actions", layer: 2, status: "demo", detail: runnerDetail("SQL execution identity", "Approved T-SQL actions only") },
  { id: "run-k8s", label: "Kubernetes Runner", purpose: "Executes approved Kubernetes operations", layer: 2, status: "planned", detail: runnerDetail("Cluster service account", "Approved manifests only") },
  { id: "run-api", label: "API Connector", purpose: "Invokes infrastructure control-plane APIs", layer: 2, status: "available", detail: runnerDetail("Scoped API identity", "Approved API calls only") },
  { id: "run-net", label: "Network Connector", purpose: "Invokes approved firewall / load-balancer / network APIs", layer: 2, status: "planned", detail: runnerDetail("Network automation identity", "Approved network actions only") },
  { id: "run-cfg", label: "Configuration Runner", purpose: "Ansible or equivalent configuration automation", layer: 2, status: "planned", detail: runnerDetail("Configuration identity", "Approved playbooks only") },
  { id: "run-val", label: "Validation Runner", purpose: "Executes technical and synthetic validation", layer: 2, status: "demo", detail: runnerDetail("Read-only validation identity", "Validation plan only") },
];

export const MANAGED_INFRASTRUCTURE: ArchNode[] = [
  { id: "inf-aws", label: "AWS", purpose: "Cloud infrastructure", layer: 3, status: "demo", detail: [
    { label: "Discovery", value: "Read-only role" },
    { label: "Execution", value: "Scoped execution role" },
    { label: "Connection", value: "AWS APIs" },
    { label: "IaC", value: "Terraform" },
    { label: "Evidence", value: "AWS state + telemetry" },
    { label: "Secrets", value: "Customer managed" },
    { label: "Example Assets", value: "EC2, EBS, S3, VPC, IAM, Load Balancers, EKS" },
  ]},
  { id: "inf-azure", label: "Azure", purpose: "Cloud infrastructure", layer: 3, status: "planned", detail: [
    { label: "Connection", value: "Azure Resource Manager" },
    { label: "Identity", value: "Managed Identity / Service Principal" },
    { label: "IaC", value: "Terraform / Bicep" },
  ]},
  { id: "inf-gcp", label: "GCP", purpose: "Cloud infrastructure", layer: 3, status: "planned", detail: [
    { label: "Connection", value: "GCP APIs" },
    { label: "Identity", value: "Service Account" },
    { label: "IaC", value: "Terraform" },
  ]},
  { id: "inf-k8s", label: "Kubernetes", purpose: "Container orchestration", layer: 3, status: "planned" },
  { id: "inf-containers", label: "Containers", purpose: "Container workloads", layer: 3, status: "planned" },
  { id: "inf-vmware", label: "VMware", purpose: "Virtualization estate", layer: 3, status: "planned" },
  { id: "inf-nutanix", label: "Nutanix", purpose: "Hyperconverged estate", layer: 3, status: "planned" },
  { id: "inf-windows", label: "Windows Server", purpose: "Server operating system estate", layer: 3, status: "demo" },
  { id: "inf-linux", label: "Linux", purpose: "Server operating system estate", layer: 3, status: "planned" },
  { id: "inf-sql", label: "SQL Server", purpose: "Database platform", layer: 3, status: "demo" },
  { id: "inf-storage", label: "Storage", purpose: "Block and object storage", layer: 3, status: "available" },
  { id: "inf-ad", label: "Active Directory", purpose: "Directory services", layer: 3, status: "planned" },
  { id: "inf-m365", label: "Microsoft 365", purpose: "Productivity platform", layer: 3, status: "planned" },
  { id: "inf-fw", label: "Firewalls", purpose: "Network security enforcement", layer: 3, status: "planned" },
  { id: "inf-lb", label: "Load Balancers", purpose: "Traffic distribution", layer: 3, status: "planned" },
  { id: "inf-dns", label: "DNS / DHCP", purpose: "Core network services", layer: 3, status: "planned" },
  { id: "inf-metal", label: "Bare Metal", purpose: "Physical compute", layer: 3, status: "customer-specific" },
];

export const ENTERPRISE_SERVICES: ArchNode[] = [
  { id: "svc-git", label: "Git / IaC Repositories", purpose: "Source control and IaC (GitHub / GitLab / Azure DevOps)", layer: 4, status: "available" },
  { id: "svc-itsm", label: "ITSM / CMDB", purpose: "Change records, asset context, ownership", layer: 4, status: "available" },
  { id: "svc-secrets", label: "Secrets / PAM", purpose: "Customer-controlled credentials and privileged access", layer: 4, status: "available" },
  { id: "svc-sso", label: "SSO / Identity Provider", purpose: "User authentication and RBAC", layer: 4, status: "available" },
  { id: "svc-obs", label: "Observability", purpose: "Metrics, logs and telemetry", layer: 4, status: "available" },
  { id: "svc-siem", label: "SIEM", purpose: "Security and audit integration", layer: 4, status: "planned" },
  { id: "svc-backup", label: "Backup & Recovery", purpose: "Protection-state validation", layer: 4, status: "available" },
  { id: "svc-policy", label: "Policy Repository", purpose: "Enterprise automation policies", layer: 4, status: "planned" },
  { id: "svc-appmon", label: "Application Monitoring", purpose: "Business-service validation", layer: 4, status: "available" },
  { id: "svc-notify", label: "Notification / Collaboration", purpose: "Approvals and operational notifications", layer: 4, status: "available" },
];

export const ALL_NODES: ArchNode[] = [
  ...CONTROL_PLANE, ...DATA_SERVICES, ...EXECUTION_ZONE, ...MANAGED_INFRASTRUCTURE, ...ENTERPRISE_SERVICES,
];

export const LEGEND: { label: string; style: string; description: string }[] = [
  { label: "Control / Execution", style: "solid", description: "Command and execution path" },
  { label: "Authentication / Identity", style: "dashed", description: "Identity and assume-role relationships" },
  { label: "Evidence / Telemetry", style: "dotted", description: "Evidence, logs and metrics" },
  { label: "Discovery", style: "thin", description: "Read-only inventory collection" },
];

export const TRUST_CHAIN: { from: string; to: string; note: string }[] = [
  { from: "User", to: "Customer SSO", note: "Enterprise authentication" },
  { from: "Customer SSO", to: "Intelligent IaC RBAC", note: "Role and permission mapping" },
  { from: "Agentic Orchestration", to: "Policy Engine", note: "Authority evaluation — no credentials" },
  { from: "Policy Engine", to: "Execution Orchestrator", note: "Authorized package only" },
  { from: "Execution Orchestrator", to: "Customer Runner", note: "Dispatch approved actions" },
  { from: "Customer Runner", to: "Customer Secret Store / PAM", note: "Just-in-time credential retrieval" },
  { from: "Customer Runner", to: "Scoped Execution Identity", note: "Least-privilege assume role" },
  { from: "Scoped Execution Identity", to: "Infrastructure API", note: "Mutation within approved scope" },
];

export const TRUST_PRINCIPLES: string[] = [
  "Customer owns identities",
  "Customer owns secrets",
  "Production credentials resolved at execution time",
  "Least privilege",
  "Separate discovery and execution identities",
  "Human approval can be required",
  "Execution package immutable after approval",
  "No direct LLM-to-infrastructure access",
  "All production actions auditable",
  "Execution can be disabled independently of discovery",
];

export const IDENTITY_CLASSES: {
  id: string; label: string; permissions: string; purpose: string; extra: { label: string; value: string }[];
}[] = [
  { id: "discovery", label: "Discovery Identity", permissions: "Read only", purpose: "Inventory and Digital Twin",
    extra: [{ label: "Example", value: "AWS Describe APIs" }, { label: "Mutation", value: "None" }] },
  { id: "engineering", label: "Engineering Identity", permissions: "Repository / plan generation", purpose: "Generate artifacts",
    extra: [{ label: "Mutation Rights", value: "None" }, { label: "Scope", value: "Repositories and plans" }] },
  { id: "execution", label: "Execution Identity", permissions: "Scoped production mutation", purpose: "Approved change only",
    extra: [{ label: "Activated", value: "At execution" }, { label: "Controlled By", value: "Customer policy" }] },
];

export const DATA_FLOW_STEPS: { n: number; title: string; from: string; to: string; nodes: NodeId[] }[] = [
  { n: 1, title: "Discover", from: "Infrastructure APIs", to: "Discovery Connectors", nodes: ["inf-aws", "inf-sql", "inf-windows", "run-api"] },
  { n: 2, title: "Normalize", from: "Discovery", to: "Common Asset Model", nodes: ["run-api", "twin"] },
  { n: 3, title: "Model", from: "Common Asset Model", to: "Digital Twin", nodes: ["twin", "ds-graph"] },
  { n: 4, title: "Reason", from: "Digital Twin + Telemetry + Policy", to: "Agentic Intelligence", nodes: ["twin", "agentic", "policy", "remediation"] },
  { n: 5, title: "Engineer", from: "Operational Intent", to: "Change Engineering", nodes: ["change-eng", "action-library"] },
  { n: 6, title: "Version", from: "Generated Artifacts", to: "Customer Git / IaC Repository", nodes: ["change-eng", "svc-git"] },
  { n: 7, title: "Govern", from: "Change Package", to: "Policy → Human Approval when required", nodes: ["policy", "svc-notify"] },
  { n: 8, title: "Execute", from: "Approved Package", to: "Orchestrator → Runner → Scoped Identity → API", nodes: ["exec-orch", "run-tf", "run-sql", "run-ps", "inf-aws"] },
  { n: 9, title: "Validate", from: "Infrastructure + Application", to: "Validation Engine", nodes: ["run-val", "validation", "svc-appmon"] },
  { n: 10, title: "Evidence", from: "Execution + Validation", to: "Evidence Store", nodes: ["evidence", "ds-object", "audit"] },
  { n: 11, title: "Reconcile", from: "Observed Result", to: "Digital Twin", nodes: ["twin", "ds-graph"] },
];

export const DATA_CLASSIFICATION: { label: string; storage: string; note: string; sensitive?: boolean }[] = [
  { label: "Infrastructure Metadata", storage: "Operational DB / Graph", note: "Customer retained" },
  { label: "Configuration State", storage: "Operational DB", note: "Customer retained" },
  { label: "Relationships", storage: "Graph Store", note: "Customer retained" },
  { label: "Telemetry", storage: "Observability + platform", note: "Customer retained" },
  { label: "Change Artifacts", storage: "Customer Git / IaC repo", note: "Versioned" },
  { label: "Execution Events", storage: "Audit Store", note: "Append only" },
  { label: "Validation Evidence", storage: "Object / Evidence Store", note: "Immutable" },
  { label: "Policy Decisions", storage: "Audit Store", note: "Append only" },
  { label: "Approval Evidence", storage: "Audit Store", note: "Signed record" },
  { label: "Secrets", storage: "Customer Secret Manager / PAM", note: "Not stored in Digital Twin. Not exposed to LLM context. Evidence stores references only.", sensitive: true },
];

export interface TraceStep {
  n: number;
  title: string;
  lines: string[];
  nodes: NodeId[];
  card: { label: string; value: string }[];
}

export const TRACE_STEPS: TraceStep[] = [
  { n: 1, title: "Condition", lines: ["SQL-PROD-07 / OrdersDB", "LOG_BACKUP wait detected"], nodes: ["inf-sql", "inf-windows"],
    card: [{ label: "Data Accessed", value: "SQL DMV state" }, { label: "Identity", value: "SQL discovery identity" }, { label: "Operation", value: "Read" }, { label: "Evidence", value: "Condition snapshot" }, { label: "Mutation", value: "No" }] },
  { n: 2, title: "Discovery", lines: ["SQL diagnostic connector reads SQL state", "AWS discovery role reads EC2 / EBS state", "Windows discovery reads filesystem state"], nodes: ["run-api", "inf-aws", "inf-sql", "inf-windows"],
    card: [{ label: "Data Accessed", value: "SQL, EC2/EBS, Windows volume state" }, { label: "Identity", value: "Read-only discovery identities" }, { label: "Operation", value: "Describe / Read" }, { label: "Evidence", value: "Discovery snapshot" }, { label: "Mutation", value: "No" }] },
  { n: 3, title: "Digital Twin", lines: ["OrdersDB → SQL-PROD-07 → Windows L: → AWS EBS"], nodes: ["twin", "ds-graph"],
    card: [{ label: "Data Accessed", value: "Normalized asset model" }, { label: "Identity", value: "Platform service identity" }, { label: "Operation", value: "Relationship resolution" }, { label: "Evidence", value: "Twin revision" }, { label: "Mutation", value: "No" }] },
  { n: 4, title: "Remediation Intelligence", lines: ["Root cause: LOG_BACKUP", "Capacity risk: 92%", "Recommendation: Stabilize SQL + Protect Capacity"], nodes: ["remediation", "agentic", "twin"],
    card: [{ label: "Data Accessed", value: "Twin + telemetry + policy" }, { label: "Identity", value: "No infrastructure identity" }, { label: "Operation", value: "Analysis" }, { label: "Evidence", value: "Diagnosis record" }, { label: "Mutation", value: "No" }] },
  { n: 5, title: "Change Engineering", lines: ["Generate T-SQL, Terraform, AWS API payload, PowerShell", "Validation Plan and Recovery Plan"], nodes: ["change-eng", "action-library"],
    card: [{ label: "Data Accessed", value: "Action Library patterns" }, { label: "Identity", value: "Engineering identity" }, { label: "Operation", value: "Artifact generation" }, { label: "Evidence", value: "Change package draft" }, { label: "Mutation", value: "No" }] },
  { n: 6, title: "Source Control", lines: ["Generated IaC committed to Customer IaC Repository", "aws_ebs_volume 500 → 750 GB"], nodes: ["svc-git", "change-eng"],
    card: [{ label: "Data Accessed", value: "IaC repository" }, { label: "Identity", value: "Engineering identity" }, { label: "Operation", value: "Commit / PR" }, { label: "Evidence", value: "Commit SHA" }, { label: "Mutation", value: "Repository only" }] },
  { n: 7, title: "Policy & Approval", lines: ["Policy evaluated", "Human approval required", "Package CP-2026-01842", "Authorization EXEC-AUTH-01842"], nodes: ["policy", "svc-notify", "audit"],
    card: [{ label: "Data Accessed", value: "Policy store" }, { label: "Identity", value: "Approver identity (SSO)" }, { label: "Operation", value: "Authorization" }, { label: "Evidence", value: "Signed approval" }, { label: "Mutation", value: "No" }] },
  { n: 8, title: "SQL Execution", lines: ["SQL Runner → approved SQL identity → SQL-PROD-07", "Transaction-log backup executes"], nodes: ["exec-orch", "run-sql", "inf-sql", "svc-secrets"],
    card: [{ label: "Data Accessed", value: "Approved T-SQL action" }, { label: "Identity", value: "SQL execution identity" }, { label: "Operation", value: "BACKUP LOG" }, { label: "Evidence", value: "SQL output + log LSN" }, { label: "Mutation", value: "Yes — database log" }] },
  { n: 9, title: "AWS Execution", lines: ["Terraform Runner → Customer AWS execution role → AWS API → EBS", "500 GB → 750 GB"], nodes: ["exec-orch", "run-tf", "inf-aws", "svc-secrets"],
    card: [{ label: "Data Accessed", value: "Approved Terraform plan" }, { label: "Identity", value: "Customer AWS execution role" }, { label: "Target", value: "vol-0a81f2c4e7b9d1234" }, { label: "Mutation", value: "500 GB → 750 GB" }, { label: "Credential Storage", value: "Customer controlled" }, { label: "Human Approval", value: "Already satisfied" }, { label: "Evidence", value: "AWS request + response + resulting state" }] },
  { n: 10, title: "Windows Execution", lines: ["PowerShell Runner → Windows management identity → SQL-PROD-07", "L: extended to 750 GB"], nodes: ["exec-orch", "run-ps", "inf-windows"],
    card: [{ label: "Data Accessed", value: "Approved PowerShell action" }, { label: "Identity", value: "Windows management identity" }, { label: "Operation", value: "Resize-Partition" }, { label: "Evidence", value: "Command transcript" }, { label: "Mutation", value: "Yes — volume extend" }] },
  { n: 11, title: "Validation", lines: ["Validation Runner evaluates SQL, AWS, Windows, Order Processing Service", "21 / 21 Passed"], nodes: ["run-val", "validation", "svc-appmon"],
    card: [{ label: "Data Accessed", value: "Post-change state + service telemetry" }, { label: "Identity", value: "Read-only validation identity" }, { label: "Operation", value: "Validation plan" }, { label: "Evidence", value: "21 test results" }, { label: "Mutation", value: "No" }] },
  { n: 12, title: "Evidence", lines: ["Evidence captured", "EV-2026-01842"], nodes: ["evidence", "ds-object"],
    card: [{ label: "Data Accessed", value: "Execution + validation artifacts" }, { label: "Identity", value: "Evidence service identity" }, { label: "Operation", value: "Manifest write" }, { label: "Evidence", value: "EV-2026-01842 (SHA-256)" }, { label: "Mutation", value: "Evidence store only" }] },
  { n: 13, title: "Reconcile", lines: ["Digital Twin updated", "Capacity Risk: High → Low"], nodes: ["twin", "ds-graph"],
    card: [{ label: "Data Accessed", value: "Observed state" }, { label: "Identity", value: "Platform service identity" }, { label: "Operation", value: "Twin reconciliation" }, { label: "Evidence", value: "Twin revision" }, { label: "Mutation", value: "No" }] },
  { n: 14, title: "Close", lines: ["CP-2026-01842 Verified & Closed"], nodes: ["audit", "evidence"],
    card: [{ label: "Data Accessed", value: "Change record" }, { label: "Identity", value: "Approver identity" }, { label: "Operation", value: "Closure" }, { label: "Evidence", value: "Closure record" }, { label: "Mutation", value: "No" }] },
];

export type ReadinessStatus = "ready" | "connected" | "configure" | "not-enabled" | "disabled";

export interface ReadinessItem {
  id: string;
  n: string;
  label: string;
  status: ReadinessStatus;
  purpose: string;
  required: string[];
  security: string[];
}

export const READINESS: ReadinessItem[] = [
  { id: "r01", n: "01", label: "Hosting Account / Subscription", status: "ready", purpose: "Provide the customer cloud account hosting the control plane.", required: ["Dedicated account or subscription", "Budget and tagging standards"], security: ["Customer-owned account", "Audit enabled"] },
  { id: "r02", n: "02", label: "Network Zones & Connectivity", status: "ready", purpose: "Establish private network placement and outbound connectivity.", required: ["VPC / VNet", "Private subnets", "Egress policy"], security: ["Private ingress only", "No inbound from internet"] },
  { id: "r03", n: "03", label: "SSO / RBAC Integration", status: "ready", purpose: "Authenticate users through enterprise identity.", required: ["OIDC / SAML application", "Group to role mapping"], security: ["MFA enforced by IdP", "Least-privilege roles"] },
  { id: "r04", n: "04", label: "Secret Management", status: "configure", purpose: "Resolve credentials at execution time from customer secret manager or PAM.", required: ["Secret manager endpoint", "Broker policy", "Runner trust"], security: ["No standing credentials in agents", "Short-lived leases", "Audit enabled"] },
  { id: "r05", n: "05", label: "Git / IaC Repository", status: "connected", purpose: "Version generated infrastructure artifacts.", required: ["Repository", "Branch policy", "Engineering identity"], security: ["No mutation rights", "Protected branches"] },
  { id: "r06", n: "06", label: "CMDB / Asset Source", status: "connected", purpose: "Enrich the Digital Twin with ownership and change context.", required: ["CMDB API access", "Field mapping"], security: ["Read-only integration"] },
  { id: "r07", n: "07", label: "Cloud Discovery Roles", status: "connected", purpose: "Read-only inventory collection from cloud providers.", required: ["AWS read-only role", "Trust policy"], security: ["Describe / List only", "Separate from execution identity"] },
  { id: "r08", n: "08", label: "Execution Roles / Identities", status: "not-enabled", purpose: "Provide narrowly scoped mutation authority for approved production actions.", required: ["AWS execution role", "Azure execution identity", "Windows execution identity", "SQL execution identity"], security: ["Least privilege", "No standing credentials in agents", "Customer-controlled trust policy", "Audit enabled", "Production approval policy"] },
  { id: "r09", n: "09", label: "Execution Runners", status: "ready", purpose: "Customer-hosted runners that execute approved packages.", required: ["Runner hosts or containers", "Outbound connectivity"], security: ["Package-bound execution", "Immutable runtime"] },
  { id: "r10", n: "10", label: "Policy Engine", status: "configure", purpose: "Define automation authority and production guardrails.", required: ["Authority matrix", "Approval rules"], security: ["Policy versioned and audited"] },
  { id: "r11", n: "11", label: "Evidence Retention / Storage", status: "configure", purpose: "Retain immutable execution and validation evidence.", required: ["Object store bucket", "Retention policy", "Object lock"], security: ["Immutable retention", "Encryption at rest"] },
  { id: "r12", n: "12", label: "Production Execution", status: "disabled", purpose: "Master switch enabling production mutation.", required: ["Items 04, 08, 10, 11 complete", "Executive authorization"], security: ["Disabled until explicitly enabled", "Discovery operates independently"] },
];

export type MaturityState = "complete" | "ready" | "configure" | "disabled";

export const MATURITY: { id: string; label: string; state: MaturityState; detail: string; requirements: string[] }[] = [
  { id: "deploy", label: "Deploy", state: "complete", detail: "Control plane deployed into the customer environment.", requirements: ["Hosting environment", "Application deployment", "Network placement", "Encryption", "Backup"] },
  { id: "secure", label: "Secure", state: "complete", detail: "Identity, RBAC and secret integration established.", requirements: ["SSO integration", "RBAC mapping", "Secret manager integration", "Audit logging"] },
  { id: "discover", label: "Discover", state: "complete", detail: "Read-only discovery active across demo scope.", requirements: ["Discovery identities", "Connector configuration", "Scheduled collection"] },
  { id: "model", label: "Model", state: "complete", detail: "Digital Twin populated and relationships resolved.", requirements: ["Common asset model", "Relationship resolution", "Telemetry binding"] },
  { id: "engineer", label: "Engineer", state: "ready", detail: "Change packages can be generated and versioned.", requirements: ["Action Library", "Git repository", "Engineering identity"] },
  { id: "govern", label: "Govern", state: "configure", detail: "Policy and approval workflow require configuration.", requirements: ["Authority matrix", "Approval routing", "Policy store"] },
  { id: "execute", label: "Execute", state: "disabled", detail: "Production execution disabled until execution identities and policy are enabled.", requirements: ["Execution identities", "Runner authorization", "Production execution switch"] },
];

export const DEPLOYMENT_SUMMARY: { label: string; value: string }[] = [
  { label: "Primary Hosting", value: "AWS" },
  { label: "Region", value: "us-east-1" },
  { label: "Control Plane", value: "Customer Hosted" },
  { label: "Network", value: "Private" },
  { label: "Execution Zone", value: "Customer Hosted" },
  { label: "Secrets", value: "Customer Managed" },
  { label: "Evidence", value: "Customer Retained" },
  { label: "Production Access", value: "Disabled until explicitly enabled" },
];
