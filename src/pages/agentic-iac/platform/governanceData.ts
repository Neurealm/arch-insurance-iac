// Canonical (mock) governance model for the Access & Governance screen.
// Deterministic local simulation only — no IdP, PAM, IAM or infrastructure calls.

export type Decision = "allow" | "approval_required" | "deny";
export type PrincipalType = "human" | "service_identity" | "runner" | "federated";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export type GovernanceScenario =
  | "normal"
  | "unauthorized_prod"
  | "expired_authorization"
  | "runner_scope_violation"
  | "secret_failure"
  | "self_approval"
  | "break_glass"
  | "package_modified"
  | "stale_identity";

export interface AccessPrincipal {
  id: string;
  name: string;
  type: PrincipalType;
  roles: string[];
  status: "active" | "inactive" | "review";
  authentication: string;
  owner: string;
  lastAccess: string;
  technology?: string;
  environment?: string;
  purpose?: string;
}

export interface AuthorizationPolicy {
  id: string;
  name: string;
  version: string;
  status: "active" | "draft";
  scope: string;
  owner: string;
  businessOwner: string;
  securityOwner: string;
  reviewFrequency: string;
  lastReview: string;
  nextReview: string;
  rules: string[];
  evaluations24h: number;
  allowed: number;
  denied: number;
  errors: number;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  environment: string;
  riskLevels: RiskLevel[];
  requiredRoles: string[];
  approvalOrder: string;
  maxApprovalAge: string;
  escalation: string;
  selfApproval: boolean;
  emergencyOverride: string;
}

export interface AuthorizationContext {
  principal: string;
  environment: string;
  technology: string;
  action: string;
  target: string;
  risk: RiskLevel;
  packageId?: string;
  packageVersion?: string;
  authorizationId?: string;
  approvalState?: "satisfied" | "incomplete" | "none";
  requestedSizeGb?: number;
  approvedSizeGb?: number;
  authorizationExpired?: boolean;
  secretAvailable?: boolean;
  selfApproval?: boolean;
  prohibited?: boolean;
}

/* ── Identity model ─────────────────────────────────────────── */

export const PRINCIPAL_SUMMARY = [
  { type: "Users (Human)", count: 86, examples: "Engineers, Operators, Admins", defaultAccess: "RBAC + Policy", authentication: "SSO (SAML/OIDC)", lastAccess: "2 minutes ago", status: "Active" },
  { type: "Service Identities", count: 17, examples: "AWS Roles, SPNs, Service Accounts", defaultAccess: "Scoped by Purpose", authentication: "Non-Interactive", lastAccess: "5 minutes ago", status: "Active" },
  { type: "Automation Runners", count: 11, examples: "Terraform, PowerShell, SQL Runners", defaultAccess: "Runner Policy + Role", authentication: "Workload Identity", lastAccess: "1 minute ago", status: "Active" },
  { type: "External / SSO Identities", count: 6, examples: "External Auditors, Partners", defaultAccess: "Read Only", authentication: "SSO / Federated", lastAccess: "1 hour ago", status: "Active" },
];

export const IDENTITY_TYPE_BREAKDOWN = [
  { label: "Users (Human)", value: 86, pct: 72, color: "#16a34a" },
  { label: "Service Identities", value: 17, pct: 14, color: "#db2777" },
  { label: "Automation Runners", value: 11, pct: 9, color: "#0ea5e9" },
  { label: "External / SSO", value: 6, pct: 5, color: "#1B4F91" },
];

export const PRINCIPALS: AccessPrincipal[] = [
  { id: "p-jane", name: "jane.smith", type: "human", roles: ["Platform Administrator"], status: "active", authentication: "SSO (SAML)", owner: "Platform Engineering", lastAccess: "2 min ago", environment: "Production" },
  { id: "p-john", name: "john.doe", type: "human", roles: ["Change Manager"], status: "active", authentication: "SSO (SAML) + MFA", owner: "Service Management", lastAccess: "5 min ago", environment: "Production" },
  { id: "p-maria", name: "maria.chen", type: "human", roles: ["Database SME"], status: "active", authentication: "SSO (SAML) + MFA", owner: "Database Engineering", lastAccess: "9 min ago", environment: "Production", technology: "SQL" },
  { id: "p-eng", name: "r.alvarez", type: "human", roles: ["Infrastructure Engineer"], status: "active", authentication: "SSO (SAML)", owner: "Cloud Engineering", lastAccess: "1 min ago", environment: "Production" },
  { id: "p-sec", name: "s.patel", type: "human", roles: ["Security Administrator"], status: "active", authentication: "SSO (SAML) + MFA", owner: "Security Architecture", lastAccess: "22 min ago" },
  { id: "p-aud", name: "external.auditor", type: "federated", roles: ["Auditor"], status: "active", authentication: "SSO / Federated", owner: "Internal Audit", lastAccess: "1 hour ago" },
  { id: "p-disc-aws", name: "iac-discovery-prod", type: "service_identity", roles: ["Discovery Identity"], status: "active", authentication: "AWS AssumeRole", owner: "Cloud Engineering", lastAccess: "2 min ago", technology: "AWS", environment: "Production", purpose: "Read-only inventory" },
  { id: "p-exec-aws", name: "iac-execution-prod", type: "service_identity", roles: ["Execution Identity"], status: "active", authentication: "AWS AssumeRole (JIT)", owner: "Cloud Engineering", lastAccess: "18 min ago", technology: "AWS", environment: "Production", purpose: "Approved EC2/EBS mutation" },
  { id: "p-sql-read", name: "sql-prod-read", type: "service_identity", roles: ["Discovery Identity"], status: "active", authentication: "Integrated Security", owner: "Database Engineering", lastAccess: "1 min ago", technology: "SQL", environment: "Production", purpose: "Diagnostics" },
  { id: "p-sql-exec", name: "sql-prod-exec", type: "service_identity", roles: ["Execution Identity"], status: "active", authentication: "PAM issued (JIT)", owner: "Database Engineering", lastAccess: "18 min ago", technology: "SQL", environment: "Production", purpose: "Approved T-SQL package" },
  { id: "p-win-exec", name: "svc-iac-win-exec", type: "service_identity", roles: ["Execution Identity"], status: "active", authentication: "PAM issued (JIT)", owner: "Windows Platform Team", lastAccess: "17 min ago", technology: "Windows", environment: "Production", purpose: "Approved PowerShell package" },
  { id: "p-legacy", name: "legacy-sql-admin", type: "service_identity", roles: ["Legacy Diagnostic"], status: "review", authentication: "Integrated Security", owner: "Database Engineering", lastAccess: "6 days ago", technology: "SQL", environment: "Production", purpose: "Legacy diagnostics" },
  { id: "p-tf", name: "terraform-runner-01", type: "runner", roles: ["Terraform Runner"], status: "active", authentication: "Workload Identity", owner: "Platform Engineering", lastAccess: "17 min ago", technology: "AWS", environment: "Production" },
  { id: "p-ps", name: "powershell-runner-01", type: "runner", roles: ["PowerShell Runner"], status: "active", authentication: "Workload Identity", owner: "Platform Engineering", lastAccess: "17 min ago", technology: "Windows", environment: "Production" },
  { id: "p-sqlr", name: "sql-runner-01", type: "runner", roles: ["SQL Runner"], status: "active", authentication: "Workload Identity", owner: "Platform Engineering", lastAccess: "18 min ago", technology: "SQL", environment: "Production" },
  { id: "p-k8s", name: "k8s-runner-01", type: "runner", roles: ["Kubernetes Runner"], status: "active", authentication: "Workload Identity", owner: "Container Platform Team", lastAccess: "40 min ago", technology: "Kubernetes", environment: "Non-Production" },
  { id: "p-net", name: "network-runner-01", type: "runner", roles: ["Network Runner"], status: "review", authentication: "Workload Identity", owner: "Network Engineering", lastAccess: "2 hours ago", technology: "Network", environment: "Production" },
  { id: "p-val", name: "validation-runner-01", type: "runner", roles: ["Validation Runner"], status: "active", authentication: "Workload Identity", owner: "Platform Engineering", lastAccess: "16 min ago", environment: "Production" },
];

/* ── Authorization model ────────────────────────────────────── */

export const AUTHORIZATION_MODEL = [
  { stage: "Observe", sub: "(Read Only)", state: "enabled" },
  { stage: "Engineer", sub: "(Generate)", state: "enabled" },
  { stage: "Validate", sub: "(Assess)", state: "enabled" },
  { stage: "Execute", sub: "(Non-Prod)", state: "enabled" },
  { stage: "Execute", sub: "(Prod – Low Risk)", state: "approval" },
  { stage: "Execute", sub: "(Prod – High Risk)", state: "disabled" },
] as const;

export const GOVERNANCE_SUMMARY = [
  "Least Privilege", "Role Based Access", "Separation of Duties", "Just-In-Time Access",
  "MFA for Interactive Users", "Privileged Access Mgmt", "Session Recording (Privileged)",
];

export const RISK_APPROVAL = [
  { label: "Low Risk Actions", value: "Autonomous", tone: "ok" },
  { label: "Medium Risk Actions", value: "Approval Required", tone: "warn" },
  { label: "High Risk Actions", value: "Approval Required", tone: "warn" },
  { label: "Critical / Destructive", value: "Prohibited", tone: "bad" },
  { label: "Emergency Access", value: "Break-Glass Policy", tone: "info" },
];

/* ── Roles / authority ──────────────────────────────────────── */

export interface RoleDef {
  id: string;
  name: string;
  members: number;
  can: string[];
  cannot: string[];
}

export const HUMAN_ROLES: RoleDef[] = [
  {
    id: "infra-engineer", name: "Infrastructure Engineer", members: 18,
    can: ["Engineer change", "Generate IaC artifacts", "Submit package for approval", "Execute in Development within scope"],
    cannot: ["Self-approve governed production change", "Issue execution authorization", "Retrieve production secret directly"],
  },
  {
    id: "change-manager", name: "Change Manager", members: 6,
    can: ["Approve qualifying production packages", "View engineering evidence", "View validation plan", "Review recovery strategy", "Approve / reject"],
    cannot: ["Modify package after approval", "Directly invoke runner", "Retrieve production credential", "Skip validation gate"],
  },
  {
    id: "db-sme", name: "Database SME", members: 4,
    can: ["Technical approval for SQL changes", "Review SQL diagnostic evidence", "Review SQL remediation", "Approve database-specific risk"],
    cannot: ["Expand AWS authorization scope", "Change infrastructure package after approval"],
  },
  {
    id: "infra-owner", name: "Infrastructure Owner", members: 5,
    can: ["Approve infrastructure mutation", "Review AWS / Windows impact", "Review infrastructure scope"],
    cannot: ["Approve database risk on behalf of Database SME unless separately assigned"],
  },
  {
    id: "sec-admin", name: "Security Administrator", members: 3,
    can: ["Manage privileged access policy", "Review service identities", "Manage security policy", "Approve sensitive role changes"],
    cannot: ["Execute infrastructure mutation solely because of security role", "Silently delete audit evidence"],
  },
  {
    id: "platform-admin", name: "Platform Administrator", members: 2,
    can: ["Configure platform settings", "Manage standard roles", "Manage connectors", "View policies", "Operate platform"],
    cannot: ["Alter security-critical production policy without security authority", "Delete audit", "Reveal secrets", "Bypass package-bound execution policy"],
  },
  {
    id: "auditor", name: "Auditor", members: 12,
    can: ["View assets, changes, approvals, execution, validation, evidence, policies and audit logs"],
    cannot: ["Mutate infrastructure", "Approve changes", "Access credentials"],
  },
  {
    id: "operator", name: "Operator", members: 32,
    can: ["Monitor execution", "View operational state", "Raise remediation requests"],
    cannot: ["Approve production change", "Execute production mutation"],
  },
];

export const ROLE_HIERARCHY = [
  { name: "Platform Administrators", count: 2, depth: 0 },
  { name: "Security Administrators", count: 3, depth: 1 },
  { name: "Operations Administrators", count: 4, depth: 1 },
  { name: "Change Managers", count: 6, depth: 2 },
  { name: "Automation Engineers", count: 18, depth: 2 },
  { name: "Operators", count: 32, depth: 2 },
  { name: "Read Only / Auditors", count: 12, depth: 1 },
];

export const AGENT_AUTHORITY_ROWS = [
  "May Read Authorized Context", "May Generate Recommendation", "May Generate Code",
  "May Approve Own Change", "May Retrieve Production Secret", "May Assume Production Role",
  "May Directly Call Production API", "May Create Execution Authorization", "May Alter Approved Package",
];

export const AGENTS = [
  { name: "Asset Context Agent", code: false },
  { name: "SQL Diagnostic Agent", code: false },
  { name: "Remediation Agent", code: false },
  { name: "Change Engineering Agent", code: true },
  { name: "Policy Analysis Agent", code: false },
  { name: "Validation Agent", code: true },
  { name: "Evidence Agent", code: false },
];

export const RUNNER_AUTHORITY_ROWS = [
  "May Receive Approved Package", "May Receive Authorization", "May Retrieve Scoped Credential",
  "May Execute Package", "May Change Package", "May Change Target", "May Expand Parameters",
  "May Bypass Gate", "May Grant Itself Additional Authority",
];

export const RUNNERS = [
  { name: "Terraform Runner", status: "Healthy" },
  { name: "PowerShell Runner", status: "Healthy" },
  { name: "SQL Runner", status: "Healthy" },
  { name: "Kubernetes Runner", status: "Healthy" },
  { name: "Network Runner", status: "Review Required", reason: "Credential rotation due in 5 days" },
  { name: "Validation Runner", status: "Healthy" },
];

/* ── Environment / technology authority ─────────────────────── */

export const ENVIRONMENTS = ["Development", "Test", "Non-Production", "Production"] as const;
export const TECHNOLOGIES = ["AWS", "Azure", "GCP", "Windows", "SQL", "Kubernetes", "VMware", "Nutanix", "Network", "Active Directory", "Microsoft 365"] as const;

export const ENV_AUTHORITY: Record<string, { generate: string; execute: string; approval: string }> = {
  Development: { generate: "Allowed", execute: "Allowed within scope", approval: "Not required for low-risk actions" },
  Test: { generate: "Allowed", execute: "Allowed within scope", approval: "Policy controlled" },
  "Non-Production": { generate: "Allowed", execute: "Policy controlled", approval: "May be automated" },
  Production: { generate: "Allowed", execute: "No direct execution — submit only", approval: "Required according to risk" },
};

export const TECH_AUTHORITY: Record<string, Record<string, string>> = {
  "Infrastructure Engineer": { AWS: "Engineering + submit", Azure: "Engineering + submit", GCP: "Read only", Windows: "Engineering + submit", SQL: "Read only", Kubernetes: "Engineering + submit", VMware: "Read only", Nutanix: "Read only", Network: "No access", "Active Directory": "Read only", "Microsoft 365": "No access" },
  "Database SME": { AWS: "Read only", Azure: "Read only", GCP: "No access", Windows: "Read only", SQL: "Engineering + technical approval", Kubernetes: "No access", VMware: "No access", Nutanix: "No access", Network: "No access", "Active Directory": "Read only", "Microsoft 365": "No access" },
  "Change Manager": { AWS: "Approval", Azure: "Approval", GCP: "Approval", Windows: "Approval", SQL: "Approval (with SME)", Kubernetes: "Approval", VMware: "Approval", Nutanix: "Approval", Network: "Approval", "Active Directory": "Approval", "Microsoft 365": "Approval" },
  "Security Administrator": { AWS: "Policy only", Azure: "Policy only", GCP: "Policy only", Windows: "Policy only", SQL: "Policy only", Kubernetes: "Policy only", VMware: "Policy only", Nutanix: "Policy only", Network: "Policy only", "Active Directory": "Policy + review", "Microsoft 365": "Policy only" },
  Auditor: { AWS: "Read only", Azure: "Read only", GCP: "Read only", Windows: "Read only", SQL: "Read only", Kubernetes: "Read only", VMware: "Read only", Nutanix: "Read only", Network: "Read only", "Active Directory": "Read only", "Microsoft 365": "Read only" },
};

export const RESOURCE_SCOPE = {
  identity: "iac-execution-prod",
  rows: [
    { label: "AWS Account", value: "Production Applications" },
    { label: "Regions", value: "us-east-1" },
    { label: "Resource Types", value: "EC2 / EBS" },
    { label: "Required Tags", value: "ManagedBy=IntelligentIaC" },
  ],
  allowed: ["ModifyVolume", "ModifyInstanceAttribute where approved", "Read validation state"],
  excluded: ["IAM", "Organizations", "KMS Policies", "Billing", "Unapproved Accounts", "Untagged Resources"],
  expansion: "Scope expansion requires administrative review.",
};

/* ── Authorization token / time bounds ──────────────────────── */

export const AUTHORIZATION_TOKEN = {
  id: "EXEC-AUTH-01842",
  packageId: "CP-2026-01842",
  version: "1.0",
  environment: "Production",
  issuedBy: "Policy + Approval Service",
  targetScope: "Defined package assets",
  allowedOperations: "Defined package operations",
  expiration: "Time bounded",
  reusable: "No",
  transferable: "No",
  packageMutation: "Invalidates authorization",
  state: "Consumed",
};

export const TIME_BOUNDS = [
  { label: "Authorization Issued", value: "12:38 PM" },
  { label: "Valid From", value: "12:40 PM" },
  { label: "Expires", value: "1:40 PM" },
  { label: "Consumed", value: "12:43 PM" },
  { label: "Reuse", value: "Not Allowed" },
  { label: "Credential Session", value: "12:43 – 12:58 PM" },
  { label: "Runner Authority After Expiration", value: "None" },
];

/* ── Policies ───────────────────────────────────────────────── */

export const POLICIES: AuthorizationPolicy[] = [
  {
    id: "pol-pkg", name: "Package-Bound Execution Policy", version: "3.4", status: "active",
    scope: "Production execution runners", owner: "Security Architecture",
    businessOwner: "Infrastructure Operations", securityOwner: "Security Architecture",
    reviewFrequency: "Quarterly", lastReview: "2026-06-14", nextReview: "2026-09-14",
    rules: [
      "Execution package required", "Package signature required", "Authorization required",
      "Target must match package", "Action must match package", "Parameters must not exceed package",
      "Required gates cannot be skipped", "Package version must remain immutable",
      "Expired authorization denied", "Destructive action prohibited unless explicit policy exists",
    ],
    evaluations24h: 128, allowed: 119, denied: 9, errors: 0,
  },
  { id: "pol-auth", name: "Authentication Policy", version: "2.0", status: "active", scope: "All interactive users", owner: "Identity Engineering", businessOwner: "Enterprise IT", securityOwner: "Security Architecture", reviewFrequency: "Annual", lastReview: "2026-02-01", nextReview: "2027-02-01", rules: ["SSO required", "MFA required for interactive users", "No local accounts"], evaluations24h: 212, allowed: 198, denied: 14, errors: 0 },
  { id: "pol-role", name: "Role Assignment Policy", version: "1.8", status: "active", scope: "All principals", owner: "Identity Engineering", businessOwner: "Enterprise IT", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-07-02", nextReview: "2026-10-02", rules: ["Role assignment requires owner approval", "No standing privileged assignment", "Assignments reviewed quarterly"], evaluations24h: 41, allowed: 39, denied: 2, errors: 0 },
  { id: "pol-prod", name: "Production Execution Policy", version: "4.1", status: "active", scope: "Production mutation", owner: "Platform Engineering", businessOwner: "Infrastructure Operations", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-06-30", nextReview: "2026-09-30", rules: ["Approved package required", "Risk-based approval required", "Scoped execution identity required", "Session recording for privileged sessions"], evaluations24h: 96, allowed: 88, denied: 8, errors: 0 },
  { id: "pol-sod", name: "Separation of Duties", version: "2.1", status: "active", scope: "Approval and engineering roles", owner: "Security Architecture", businessOwner: "Governance", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-05-19", nextReview: "2026-08-19", rules: ["Package author may not approve own change", "Independent technical approver required for high risk", "Approver may not modify package"], evaluations24h: 34, allowed: 31, denied: 3, errors: 0 },
  { id: "pol-pam", name: "Privileged Access Policy", version: "3.0", status: "active", scope: "Privileged sessions", owner: "Privileged Access Team", businessOwner: "Security", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-07-10", nextReview: "2026-10-10", rules: ["No standing privileged sessions", "JIT issuance only", "Recording required", "Maximum session duration enforced"], evaluations24h: 58, allowed: 56, denied: 2, errors: 0 },
  { id: "pol-bg", name: "Break-Glass Policy", version: "1.5", status: "active", scope: "Emergency access", owner: "Security Architecture", businessOwner: "Service Management", securityOwner: "Security Architecture", reviewFrequency: "Semi-annual", lastReview: "2026-03-11", nextReview: "2026-09-11", rules: ["Incident reference required", "Privileged approver required", "PAM-issued temporary credential", "Session recording enabled", "Maximum 15 minutes", "Post-event review mandatory"], evaluations24h: 0, allowed: 0, denied: 0, errors: 0 },
  { id: "pol-agent", name: "Agent Authority Policy", version: "2.2", status: "active", scope: "AI / agent identities", owner: "Platform Engineering", businessOwner: "Governance", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-06-02", nextReview: "2026-09-02", rules: ["Agents hold no production credentials", "Agents cannot create authorization", "Agents cannot approve their own output", "No secret material in model context"], evaluations24h: 402, allowed: 402, denied: 0, errors: 0 },
  { id: "pol-runner", name: "Runner Authority Policy", version: "2.7", status: "active", scope: "Execution runners", owner: "Platform Engineering", businessOwner: "Infrastructure Operations", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-06-02", nextReview: "2026-09-02", rules: ["Runner executes package only", "Runner cannot alter target or parameters", "Runner cannot self-grant authority"], evaluations24h: 77, allowed: 74, denied: 3, errors: 0 },
  { id: "pol-cred", name: "Credential Policy", version: "2.4", status: "active", scope: "All credentials", owner: "Privileged Access Team", businessOwner: "Security", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-07-10", nextReview: "2026-10-10", rules: ["Customer-controlled storage", "Short-lived credentials preferred", "No credential display", "No fallback credential"], evaluations24h: 143, allowed: 141, denied: 2, errors: 0 },
  { id: "pol-session", name: "Session Policy", version: "1.9", status: "active", scope: "Runtime sessions", owner: "Platform Engineering", businessOwner: "Infrastructure Operations", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-06-21", nextReview: "2026-09-21", rules: ["Maximum session duration", "Recording for privileged sessions", "Revocation supported"], evaluations24h: 61, allowed: 60, denied: 1, errors: 0 },
  { id: "pol-scope", name: "Resource Scope Policy", version: "2.0", status: "active", scope: "Execution identities", owner: "Cloud Engineering", businessOwner: "Infrastructure Operations", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-05-30", nextReview: "2026-08-30", rules: ["Tag-scoped resources only", "Account and region allow-list", "Scope expansion requires administrative review"], evaluations24h: 88, allowed: 84, denied: 4, errors: 0 },
  { id: "pol-approval", name: "Approval Policy", version: "3.2", status: "active", scope: "Change approvals", owner: "Service Management", businessOwner: "Governance", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-06-08", nextReview: "2026-09-08", rules: ["Risk-based approver set", "Approval age limit", "Self-approval prohibited"], evaluations24h: 27, allowed: 25, denied: 2, errors: 0 },
  { id: "pol-review", name: "Access Review Policy", version: "1.6", status: "active", scope: "All principals", owner: "Security Architecture", businessOwner: "Governance", securityOwner: "Security Architecture", reviewFrequency: "Quarterly", lastReview: "2026-07-01", nextReview: "2026-10-01", rules: ["Quarterly review of privileged roles", "Service identity ownership required", "Findings tracked to disposition"], evaluations24h: 12, allowed: 12, denied: 0, errors: 0 },
];

export const POLICY_PRECEDENCE = [
  { level: "Prohibited Action", note: "Explicit technical prohibition — cannot be overridden by approval" },
  { level: "Role Permission", note: "What the principal is entitled to attempt" },
  { level: "Approval", note: "Human authorization within permitted boundaries" },
];

/* ── Approval workflows ─────────────────────────────────────── */

export const WORKFLOWS: ApprovalWorkflow[] = [
  { id: "wf-prod-high", name: "Production — High Risk", environment: "Production", riskLevels: ["high", "critical"], requiredRoles: ["Change Manager", "Infrastructure Owner", "Database SME"], approvalOrder: "Sequential", maxApprovalAge: "24 hours", escalation: "Escalate to Platform Owner after 4 hours", selfApproval: false, emergencyOverride: "Break-Glass Policy only" },
  { id: "wf-prod-med", name: "Production — Medium Risk", environment: "Production", riskLevels: ["medium"], requiredRoles: ["Change Manager", "Infrastructure Owner", "Database SME"], approvalOrder: "Parallel then final", maxApprovalAge: "24 hours", escalation: "Escalate after 8 hours", selfApproval: false, emergencyOverride: "Policy controlled" },
  { id: "wf-prod-low", name: "Production — Low Risk", environment: "Production", riskLevels: ["low"], requiredRoles: ["Change Manager"], approvalOrder: "Single", maxApprovalAge: "48 hours", escalation: "None", selfApproval: false, emergencyOverride: "Policy controlled" },
  { id: "wf-nonprod", name: "Non-Production Automated", environment: "Non-Production", riskLevels: ["low", "medium"], requiredRoles: ["Policy Engine"], approvalOrder: "Automated", maxApprovalAge: "N/A", escalation: "None", selfApproval: false, emergencyOverride: "N/A" },
  { id: "wf-sandbox", name: "Sandbox Autonomous", environment: "Development", riskLevels: ["low"], requiredRoles: [], approvalOrder: "None", maxApprovalAge: "N/A", escalation: "None", selfApproval: false, emergencyOverride: "N/A" },
  { id: "wf-emergency", name: "Emergency / Break-Glass", environment: "Production", riskLevels: ["critical"], requiredRoles: ["Emergency Approver", "Security Administrator"], approvalOrder: "Sequential", maxApprovalAge: "15 minutes", escalation: "Immediate SIEM notification", selfApproval: false, emergencyOverride: "Governed emergency path" },
];

export const CP_APPROVALS = [
  { role: "Change Manager", approver: "john.doe", state: "Approved", time: "12:34 PM", independent: true },
  { role: "Infrastructure Owner", approver: "k.osei", state: "Approved", time: "12:36 PM", independent: true },
  { role: "Database SME", approver: "maria.chen", state: "Approved", time: "12:38 PM", independent: true },
];

/* ── Privileged access / sessions ───────────────────────────── */

export const PRIVILEGED_STATUS = [
  { label: "Privileged Roles", value: 9 },
  { label: "Standing Privileged Sessions", value: 0 },
  { label: "Privileged Sessions (Last 24h)", value: 4 },
  { label: "Break-Glass Accounts", value: 2 },
  { label: "Break-Glass Usage (Last 30d)", value: 0 },
];

export interface SessionRow {
  id: string;
  principal: string;
  technology: string;
  target: string;
  start: string;
  end: string;
  duration: string;
  recorded: boolean;
  state: "Completed" | "Active" | "Revoked";
  credentialAlias: string;
}

export const SESSIONS: SessionRow[] = [
  { id: "SES-4411", principal: "sql-runner-01", technology: "SQL", target: "SQL-PROD-07", start: "12:43 PM", end: "12:46 PM", duration: "3 min", recorded: true, state: "Completed", credentialAlias: "pam://sql-prod-exec#jit" },
  { id: "SES-4412", principal: "terraform-runner-01", technology: "AWS", target: "vol-0a81f2c4e7b9d1234", start: "12:47 PM", end: "12:52 PM", duration: "5 min", recorded: true, state: "Completed", credentialAlias: "sts://iac-execution-prod#session" },
  { id: "SES-4413", principal: "powershell-runner-01", technology: "Windows", target: "SQL-PROD-07 (L:)", start: "12:52 PM", end: "12:56 PM", duration: "4 min", recorded: true, state: "Completed", credentialAlias: "pam://svc-iac-win-exec#jit" },
  { id: "SES-4414", principal: "validation-runner-01", technology: "Multi", target: "Validation plan 21 tests", start: "12:56 PM", end: "12:58 PM", duration: "2 min", recorded: true, state: "Completed", credentialAlias: "workload://validation#scoped" },
];

export const BREAK_GLASS_CONTROLS = [
  { label: "Break-Glass Accounts", value: "2" },
  { label: "Stored", value: "Customer PAM" },
  { label: "Direct Login", value: "Disabled by default" },
  { label: "Activation", value: "Policy controlled" },
  { label: "Maximum Duration", value: "15 min" },
  { label: "MFA", value: "Required for human emergency access" },
  { label: "Session Recording", value: "Required" },
  { label: "SIEM Notification", value: "Required" },
  { label: "Approval", value: "Required except explicitly configured emergency policy" },
  { label: "Post-Event Review", value: "Mandatory" },
  { label: "Last Used", value: "Never in current demo period" },
];

export const BREAK_GLASS_REQUEST = [
  { label: "Requester", value: "Senior Infrastructure Engineer" },
  { label: "Target", value: "Production" },
  { label: "Reason", value: "Active Tier 1 incident" },
  { label: "Incident", value: "INC-2026-8841" },
  { label: "Requested Duration", value: "15 minutes" },
  { label: "Requested Scope", value: "Specific resource" },
];

export const BREAK_GLASS_REQUIREMENTS = [
  "Incident reference", "Emergency justification", "Privileged approver",
  "PAM-issued temporary credential", "Session recording", "Enhanced audit", "Post-event review",
];

export const BREAK_GLASS_FLOW = [
  "Emergency Request", "Incident Validation", "Break-Glass Policy", "Emergency Approver",
  "PAM", "Temporary Credential", "Restricted Session", "Execution", "Credential Expiration", "Mandatory Review",
];

export const BREAK_GLASS_STATE = [
  { label: "Standing Emergency Credential", value: "NO" },
  { label: "General Administrator Access", value: "NO" },
  { label: "Session Scope", value: "Restricted" },
  { label: "Session Recording", value: "Enabled" },
  { label: "Post-Event Review", value: "Required" },
];

/* ── Decision trace ─────────────────────────────────────────── */

export const TRACE_STEPS = [
  "Authenticate principal", "Resolve role", "Resolve environment", "Resolve resource scope",
  "Resolve requested action", "Determine risk", "Check package requirement", "Validate package signature",
  "Validate package scope", "Validate approval", "Validate authorization token", "Validate session",
  "Resolve execution identity", "Evaluate destructive-action restrictions", "Evaluate runtime safety",
  "Produce authorization decision",
];

export const EXPLAINABILITY_ATTRIBUTES = [
  "Principal", "Role", "Environment", "Technology", "Resource", "Action", "Risk Classification",
  "Package", "Package Version", "Authorization", "Approval State", "Session State", "Credential State",
  "Policy Version", "Time Window", "Resource Scope", "Requested Parameters", "Runtime Safety State",
];

/* ── Denied actions / activity / insights ───────────────────── */

export interface DeniedAction {
  id: string;
  principal: string;
  action: string;
  target: string;
  decision: "DENY";
  policy: string;
  apiCalled: "No";
  time: string;
}

export const DENIED_ACTIONS: DeniedAction[] = [
  { id: "D-01", principal: "r.alvarez", action: "Unapproved production execution", target: "vol-0a81f2c4e7b9d1234", decision: "DENY", policy: "Production Execution Policy v4.1", apiCalled: "No", time: "11:42 AM" },
  { id: "D-02", principal: "terraform-runner-01", action: "Execute with expired authorization", target: "EXEC-AUTH-01799", decision: "DENY", policy: "Package-Bound Execution Policy v3.4", apiCalled: "No", time: "10:18 AM" },
  { id: "D-03", principal: "terraform-runner-01", action: "Parameter scope violation (1 TB)", target: "vol-0a81f2c4e7b9d1234", decision: "DENY", policy: "Package-Bound Execution Policy v3.4", apiCalled: "No", time: "09:55 AM" },
  { id: "D-04", principal: "sql-runner-01", action: "Attempted prohibited SQL restart", target: "SQL-PROD-07", decision: "DENY", policy: "Production Execution Policy v4.1", apiCalled: "No", time: "09:31 AM" },
  { id: "D-05", principal: "iac-execution-prod", action: "Unauthorized IAM change", target: "role/app-prod", decision: "DENY", policy: "Resource Scope Policy v2.0", apiCalled: "No", time: "08:47 AM" },
  { id: "D-06", principal: "r.alvarez", action: "Self-approval", target: "CP-2026-01842", decision: "DENY", policy: "Separation-of-Duties-v2.1", apiCalled: "No", time: "12:31 PM" },
  { id: "D-07", principal: "network-runner-01", action: "Execute with stale runner credential", target: "fw-core-01", decision: "DENY", policy: "Credential Policy v2.4", apiCalled: "No", time: "07:12 AM" },
];

export interface ActivityRow {
  time: string;
  principal: string;
  principalType: PrincipalType;
  action: string;
  target: string;
  environment: string;
  technology: string;
  risk: RiskLevel;
  decision: "Success" | "Denied";
  packageId: string;
  ip: string;
}

export const ACTIVITY: ActivityRow[] = [
  { time: "12:57 PM", principal: "jane.smith", principalType: "human", action: "Login (SSO)", target: "Platform", environment: "Production", technology: "Platform", risk: "low", decision: "Success", packageId: "—", ip: "10.20.5.12" },
  { time: "12:56 PM", principal: "iac-exec-aws-prod", principalType: "service_identity", action: "Assume Role", target: "AWS: Prod Applications", environment: "Production", technology: "AWS", risk: "medium", decision: "Success", packageId: "CP-2026-01842", ip: "10.20.3.45" },
  { time: "12:55 PM", principal: "terraform-runner-01", principalType: "runner", action: "Start Session", target: "AWS EBS Resize", environment: "Production", technology: "AWS", risk: "medium", decision: "Success", packageId: "CP-2026-01842", ip: "10.20.3.46" },
  { time: "12:54 PM", principal: "john.doe", principalType: "human", action: "Approve Change", target: "CP-2026-01842", environment: "Production", technology: "Platform", risk: "medium", decision: "Success", packageId: "CP-2026-01842", ip: "10.20.5.15" },
  { time: "12:52 PM", principal: "sql-runner-01", principalType: "runner", action: "Execute SQL", target: "SQL-PROD-07", environment: "Production", technology: "SQL", risk: "medium", decision: "Success", packageId: "CP-2026-01842", ip: "10.20.3.47" },
  { time: "12:31 PM", principal: "r.alvarez", principalType: "human", action: "Self-approve package", target: "CP-2026-01842", environment: "Production", technology: "Platform", risk: "high", decision: "Denied", packageId: "CP-2026-01842", ip: "10.20.5.31" },
  { time: "09:55 AM", principal: "terraform-runner-01", principalType: "runner", action: "Modify Volume (1 TB)", target: "vol-0a81f2c4e7b9d1234", environment: "Production", technology: "AWS", risk: "high", decision: "Denied", packageId: "CP-2026-01842", ip: "10.20.3.46" },
];

export interface Insight {
  id: string;
  finding: string;
  severity: "low" | "medium" | "high";
  evidence: string;
  principal: string;
  capability: string;
  risk: string;
  recommended: string;
  policy: string;
  owner: string;
  due: string;
  disposition: string;
}

export const INSIGHTS: Insight[] = [
  { id: "GI-01", finding: "Execution request outside normal time window", severity: "low", evidence: "3 execution requests between 02:00–04:00", principal: "terraform-runner-01", capability: "Execution", risk: "Low", recommended: "Confirm maintenance window definition", policy: "Session Policy v1.9", owner: "Platform Engineering", due: "2026-08-20", disposition: "Open" },
  { id: "GI-02", finding: "Role assumption from unexpected runner", severity: "medium", evidence: "network-runner-01 assumed AWS discovery role", principal: "network-runner-01", capability: "Discovery", risk: "Medium", recommended: "Validate runner-to-role mapping", policy: "Runner Authority Policy v2.7", owner: "Network Engineering", due: "2026-08-16", disposition: "Under review" },
  { id: "GI-03", finding: "Repeated denied request", severity: "medium", evidence: "4 denials for parameter scope in 24h", principal: "terraform-runner-01", capability: "Execution", risk: "Medium", recommended: "Review requested package parameters", policy: "Package-Bound Execution Policy v3.4", owner: "Platform Engineering", due: "2026-08-14", disposition: "Open" },
  { id: "GI-04", finding: "Stale privileged assignment", severity: "high", evidence: "legacy-sql-admin unused 6 days, db_owner privileges", principal: "legacy-sql-admin", capability: "SQL Execution", risk: "High", recommended: "Reduce privilege to diagnostic read", policy: "Access Review Policy v1.6", owner: "Database Engineering", due: "2026-08-12", disposition: "Remediation proposed" },
  { id: "GI-05", finding: "Approval unusually fast", severity: "low", evidence: "Approval recorded 41 seconds after submission", principal: "john.doe", capability: "Approval", risk: "Low", recommended: "Confirm reviewer had evidence access", policy: "Approval Policy v3.2", owner: "Service Management", due: "2026-08-22", disposition: "Observation" },
  { id: "GI-06", finding: "Authorization requested but not used", severity: "low", evidence: "EXEC-AUTH-01799 expired unconsumed", principal: "terraform-runner-01", capability: "Execution", risk: "Low", recommended: "No action — expired safely", policy: "Package-Bound Execution Policy v3.4", owner: "Platform Engineering", due: "—", disposition: "Closed" },
];

/* ── Access reviews / service identity health ───────────────── */

export const REVIEW_LIFECYCLE = [
  "Review Created", "Owners Assigned", "Users / Roles Evaluated", "Findings",
  "Revoke / Retain / Modify", "Security Approval", "Closed",
];

export const REVIEW_CATEGORIES = [
  { label: "Dormant users", count: 3 },
  { label: "Excess privilege", count: 2 },
  { label: "Stale identities", count: 1 },
  { label: "Unowned service identities", count: 0 },
  { label: "Unused privileged role", count: 1 },
  { label: "Out-of-policy assignment", count: 1 },
];

export const SERVICE_IDENTITY_HEALTH = [
  { label: "Total", value: 17 },
  { label: "Healthy", value: 15 },
  { label: "Review Required", value: 2 },
  { label: "Stale", value: 1 },
  { label: "Over-Privileged", value: 1 },
  { label: "No Owner", value: 0 },
];

export const SERVICE_IDENTITY_FINDING = {
  identity: "legacy-sql-admin",
  issue: "Permissions exceed required diagnostic scope.",
  current: "db_owner",
  required: "Read diagnostics",
  recommendation: "Reduce privilege.",
};

export const SERVICE_IDENTITY_TYPES = ["Discovery", "Execution", "Validation", "Repository", "Monitoring", "Evidence", "Integration"];

/* ── SQL/EBS governance chain ───────────────────────────────── */

export const SQL_EBS_GOVERNANCE = [
  { label: "SQL Diagnostic Identity", value: "Healthy", key: "sql-read" },
  { label: "AWS Discovery Role", value: "Healthy", key: "aws-read" },
  { label: "SQL Execution Identity", value: "Healthy", key: "sql-exec" },
  { label: "AWS Execution Role", value: "Healthy", key: "aws-exec" },
  { label: "Windows Execution Identity", value: "Healthy", key: "win-exec" },
  { label: "Terraform Runner", value: "Authorized", key: "tf" },
  { label: "SQL Runner", value: "Authorized", key: "sqlr" },
  { label: "PowerShell Runner", value: "Authorized", key: "psr" },
  { label: "Production Policy", value: "Passed", key: "policy" },
  { label: "Separation of Duties", value: "Passed", key: "sod" },
  { label: "Required Approvals", value: "3 / 3", key: "approvals" },
  { label: "Package Signature", value: "Valid", key: "signature" },
  { label: "Authorization", value: "EXEC-AUTH-01842", key: "auth" },
  { label: "Runtime Sessions", value: "Completed", key: "sessions" },
  { label: "Evidence", value: "Complete", key: "evidence" },
];

export const GOVERNANCE_TRACE = [
  "SQL Diagnostic Agent reads authorized data. No production execution authority.",
  "Remediation Agent generates recommendation. No production execution authority.",
  "Change Engineering generates package.",
  "Policy classifies change Medium Risk.",
  "Production workflow requires three approvals.",
  "Independent approvers approve.",
  "Package becomes immutable.",
  "EXEC-AUTH-01842 generated.",
  "Terraform Runner receives scoped AWS session.",
  "SQL Runner receives scoped SQL session.",
  "PowerShell Runner receives scoped Windows session.",
  "Each runner performs only package-defined actions.",
  "Sessions terminate.",
  "Authorization consumed.",
  "Evidence preserved.",
];

/* ── Scenarios ──────────────────────────────────────────────── */

export interface ScenarioDef {
  id: GovernanceScenario;
  label: string;
  severity: "normal" | "warning" | "critical";
  headline?: string;
  reason?: string;
  authorizationHealth: number;
  deniedDelta: number;
  sqlEbsReady: boolean;
  failingGovernanceKeys: string[];
  degraded: { label: string; value: string; tone: "ok" | "warn" | "bad" }[];
  detail: { label: string; value: string }[];
  recommended?: string;
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: "normal", label: "Normal Operations", severity: "normal",
    authorizationHealth: 98, deniedDelta: 0, sqlEbsReady: true, failingGovernanceKeys: [],
    degraded: [], detail: [],
  },
  {
    id: "unauthorized_prod", label: "Unapproved Production Request", severity: "warning",
    headline: "PRODUCTION EXECUTION DENIED — NO APPROVED PACKAGE",
    reason: "A production mutation was requested without an approved, signed execution package.",
    authorizationHealth: 94, deniedDelta: 1, sqlEbsReady: false, failingGovernanceKeys: ["policy", "signature", "auth"],
    degraded: [{ label: "Production Execution", value: "Blocked", tone: "bad" }, { label: "Engineering", value: "Available", tone: "ok" }],
    detail: [
      { label: "Principal", value: "r.alvarez (Infrastructure Engineer)" },
      { label: "Action", value: "Modify EBS Volume" },
      { label: "Package", value: "None" },
      { label: "Infrastructure API Called", value: "No" },
      { label: "Decision", value: "DENY" },
    ],
    recommended: "Submit the change through Change Engineering to generate a governed package.",
  },
  {
    id: "expired_authorization", label: "Expired Authorization", severity: "warning",
    headline: "EXECUTION BLOCKED — AUTHORIZATION EXPIRED",
    reason: "The execution authorization passed its validity window before consumption.",
    authorizationHealth: 92, deniedDelta: 1, sqlEbsReady: false, failingGovernanceKeys: ["auth", "sessions"],
    degraded: [{ label: "Execution", value: "Blocked", tone: "bad" }, { label: "Approval", value: "Retained", tone: "ok" }],
    detail: [
      { label: "Authorization", value: "EXEC-AUTH-01799" },
      { label: "Expired", value: "1:40 PM" },
      { label: "Reuse", value: "Not Allowed" },
      { label: "Infrastructure API Called", value: "No" },
      { label: "Decision", value: "DENY" },
    ],
    recommended: "Request a new authorization from the approval service — the package remains immutable.",
  },
  {
    id: "runner_scope_violation", label: "Runner Scope Violation (1 TB)", severity: "critical",
    headline: "PARAMETER EXCEEDS PACKAGE AUTHORIZATION",
    reason: "The runner requested a volume size larger than the approved package parameter. Denied before any AWS API call.",
    authorizationHealth: 90, deniedDelta: 1, sqlEbsReady: false, failingGovernanceKeys: ["tf", "signature"],
    degraded: [{ label: "AWS Execution", value: "Blocked", tone: "bad" }, { label: "Diagnosis", value: "Available", tone: "ok" }],
    detail: [
      { label: "Action", value: "ModifyVolume" },
      { label: "Target", value: "vol-0a81f2c4e7b9d1234" },
      { label: "Approved Size", value: "750 GB" },
      { label: "Maximum Authorized", value: "750 GB" },
      { label: "Requested Size", value: "1024 GB (1 TB)" },
      { label: "Infrastructure API Called", value: "No" },
      { label: "Decision", value: "DENY" },
    ],
    recommended: "Return the package to engineering for re-scoping and re-approval.",
  },
  {
    id: "secret_failure", label: "Secret / PAM Retrieval Failure", severity: "critical",
    headline: "NO CREDENTIAL ISSUED — PRODUCTION EXECUTION BLOCKED",
    reason: "Customer credential authority is unreachable. No credential is cached or substituted.",
    authorizationHealth: 87, deniedDelta: 2, sqlEbsReady: false, failingGovernanceKeys: ["sql-exec", "aws-exec", "win-exec", "tf", "sqlr", "psr"],
    degraded: [
      { label: "Privileged Access", value: "Degraded", tone: "warn" },
      { label: "Execution", value: "Blocked", tone: "bad" },
      { label: "Observation", value: "Available", tone: "ok" },
      { label: "Diagnosis", value: "Available", tone: "ok" },
      { label: "Engineering", value: "Available", tone: "ok" },
    ],
    detail: [
      { label: "Credential Retrieval", value: "Unavailable" },
      { label: "Fallback Credential", value: "None" },
      { label: "Standing Credential", value: "None" },
      { label: "Infrastructure API Called", value: "No" },
      { label: "Decision", value: "DENY execution" },
    ],
    recommended: "Restore PAM connectivity; observation, diagnosis and engineering remain available.",
  },
  {
    id: "self_approval", label: "Self-Approval Attempt", severity: "critical",
    headline: "DENIED — SEPARATION-OF-DUTIES POLICY",
    reason: "Human involvement alone is not sufficient. The approver must hold independent authority.",
    authorizationHealth: 93, deniedDelta: 1, sqlEbsReady: false, failingGovernanceKeys: ["sod", "approvals", "auth"],
    degraded: [{ label: "Approval Chain", value: "Incomplete", tone: "bad" }, { label: "Engineering", value: "Available", tone: "ok" }],
    detail: [
      { label: "Package", value: "CP-2026-01842" },
      { label: "Author", value: "Infrastructure Engineer" },
      { label: "Attempted Role", value: "Approver" },
      { label: "Required", value: "Independent Change Manager / Technical Approver" },
      { label: "Credential Issued", value: "No" },
      { label: "Authorization Generated", value: "No" },
      { label: "Infrastructure Mutation", value: "None" },
      { label: "Audit Event", value: "Created" },
      { label: "Policy", value: "Separation-of-Duties-v2.1" },
      { label: "Decision", value: "DENY" },
    ],
    recommended: "Route package to authorized independent approver.",
  },
  {
    id: "package_modified", label: "Package Modified After Approval", severity: "critical",
    headline: "PACKAGE SIGNATURE INVALIDATED",
    reason: "An approved package was edited. Approval and authorization do not carry forward to a new version.",
    authorizationHealth: 91, deniedDelta: 1, sqlEbsReady: false, failingGovernanceKeys: ["signature", "auth", "approvals"],
    degraded: [{ label: "Execution", value: "Blocked", tone: "bad" }, { label: "Engineering", value: "Available", tone: "ok" }],
    detail: [
      { label: "Approved Package", value: "v1.0" },
      { label: "Change", value: "EBS target size 750 GB → 1 TB" },
      { label: "Authorization", value: "EXEC-AUTH-01842" },
      { label: "Authorization State", value: "REVOKED" },
      { label: "New Package Version", value: "v1.1 Draft" },
      { label: "Required", value: "Re-engineering validation, policy reevaluation, new approval, new authorization" },
    ],
    recommended: "Re-run engineering validation and obtain fresh approvals for v1.1.",
  },
  {
    id: "stale_identity", label: "Stale Execution Identity Finding", severity: "warning",
    headline: "NEW PRODUCTION EXECUTION BLOCKED PENDING IDENTITY REVIEW",
    reason: "An access review finding restricts new production execution until the identity is reviewed.",
    authorizationHealth: 95, deniedDelta: 0, sqlEbsReady: false, failingGovernanceKeys: ["aws-exec"],
    degraded: [
      { label: "Digital Twin", value: "Unaffected", tone: "ok" },
      { label: "Engineering", value: "Unaffected", tone: "ok" },
      { label: "Execution", value: "Blocked", tone: "bad" },
    ],
    detail: [
      { label: "Finding", value: "Stale AWS execution identity detected" },
      { label: "Policy Response", value: "Block new execution until reviewed" },
    ],
    recommended: "Complete the access review and dispose of the finding.",
  },
  {
    id: "break_glass", label: "Break-Glass Emergency Access", severity: "warning",
    headline: "EMERGENCY ACCESS AUTHORIZED — GOVERNED PATH",
    reason: "Emergency access is a governed path, not a bypass. Recording, approval and post-event review remain mandatory.",
    authorizationHealth: 96, deniedDelta: 0, sqlEbsReady: true, failingGovernanceKeys: [],
    degraded: [{ label: "Emergency Session", value: "Restricted scope", tone: "warn" }, { label: "Audit", value: "Enhanced", tone: "ok" }],
    detail: BREAK_GLASS_STATE,
    recommended: "Complete mandatory post-event review after credential expiration.",
  },
];

/* ── Configuration / ownership ──────────────────────────────── */

export const CONFIG_STATE = [
  { label: "Identity", value: "Configured" },
  { label: "Roles", value: "Configured" },
  { label: "MFA", value: "Configured" },
  { label: "PAM", value: "Connected" },
  { label: "JIT", value: "Enabled" },
  { label: "Package-Bound Execution", value: "Enabled" },
  { label: "Approval", value: "Enabled" },
  { label: "Access Review", value: "Scheduled" },
  { label: "Break Glass", value: "Configured" },
  { label: "Audit", value: "Enabled" },
  { label: "Production Authority", value: "Governed" },
];

export const OWNERSHIP = [
  { label: "Enterprise Identity", value: "CUSTOMER" },
  { label: "Role Model", value: "SHARED" },
  { label: "Production Policies", value: "CUSTOMER" },
  { label: "Execution Identities", value: "CUSTOMER" },
  { label: "PAM", value: "CUSTOMER" },
  { label: "Approval Authority", value: "CUSTOMER" },
  { label: "Package Enforcement", value: "PLATFORM" },
  { label: "Policy Evaluation", value: "PLATFORM" },
  { label: "Audit Generation", value: "PLATFORM" },
  { label: "Access Reviews", value: "CUSTOMER / SHARED" },
];

export const HEALTH_FACTORS = [
  "Authentication", "Role hygiene", "Service identity health", "Policy health",
  "Separation of duties", "Privileged access health", "Approval health",
  "Credential health", "Session health", "Access review health",
];

export const AUDIT_FIELDS = [
  "Who / What", "Role", "Action", "Target", "Environment", "Risk", "Policy Version",
  "Decision", "Reason", "Package", "Approval", "Authorization", "Credential Alias",
  "Session", "Timestamp", "Evidence ID",
];

export const EXPORT_STEPS = [
  "Compiling identities...", "Compiling roles...", "Compiling assignments...",
  "Compiling authorization policies...", "Compiling privileged sessions...",
  "Compiling approval workflows...", "Compiling denied actions...",
  "Compiling governance findings...", "Report prepared.",
];

export const DEMO_STORY = [
  { title: "AI vs Authority", message: "AI may reason and engineer without holding production authority." },
  { title: "Identity Separation", message: "Human, service and runner principals are distinct, with distinct authority." },
  { title: "Discovery vs Execution", message: "AWS discovery and execution use separate, independently scoped roles." },
  { title: "Risk-Based Governance", message: "Low risk is autonomous, medium and high require approval, critical/destructive is prohibited." },
  { title: "SQL/EBS Approval", message: "CP-2026-01842 required three independent approvals before authorization existed." },
  { title: "Package-Bound Execution", message: "The runner may only act on the approved target with the approved parameters." },
  { title: "Temporary Credentials", message: "Credentials are JIT-issued from customer PAM and expire with the session." },
  { title: "Failure Safety", message: "A 1 TB request is denied before any AWS API call is made." },
  { title: "Emergency Governance", message: "Break-glass is a governed path with approval, recording and mandatory review." },
  { title: "Audit", message: "Every decision is explainable and evidenced — nothing bypasses the audit trail." },
];

/* ── Authorization engine ───────────────────────────────────── */

export interface EngineResult {
  decision: Decision;
  reason: string;
  trace: { step: string; state: "PASS" | "FAIL" | "N/A" }[];
}

export function evaluateAuthorization(ctx: AuthorizationContext): EngineResult {
  const trace: { step: string; state: "PASS" | "FAIL" | "N/A" }[] = [];
  let decision: Decision | null = null;
  let reason = "";
  const isProd = ctx.environment === "Production";
  const mutating = !/read|view|describe|validate/i.test(ctx.action);

  const push = (step: string, state: "PASS" | "FAIL" | "N/A") => trace.push({ step, state });

  push("Authenticate principal", "PASS");
  push("Resolve role", "PASS");
  push("Resolve environment", "PASS");
  push("Resolve resource scope", ctx.target ? "PASS" : "N/A");
  push("Resolve requested action", "PASS");
  push("Determine risk", "PASS");

  if (ctx.prohibited) {
    push("Check package requirement", "N/A");
    push("Validate package signature", "N/A");
    push("Validate package scope", "N/A");
    push("Validate approval", "N/A");
    push("Validate authorization token", "N/A");
    push("Validate session", "N/A");
    push("Resolve execution identity", "N/A");
    push("Evaluate destructive-action restrictions", "FAIL");
    push("Evaluate runtime safety", "N/A");
    push("Produce authorization decision", "PASS");
    return { decision: "deny", reason: "Action is explicitly prohibited by policy. Human approval cannot override a technical prohibition.", trace };
  }

  const packagePresent = !!ctx.packageId && ctx.packageId !== "None";
  push("Check package requirement", isProd && mutating ? (packagePresent ? "PASS" : "FAIL") : "N/A");
  if (isProd && mutating && !packagePresent) {
    decision = "deny";
    reason = "Production mutation requires an approved execution package.";
  }

  push("Validate package signature", packagePresent ? "PASS" : "N/A");
  push("Validate package scope", packagePresent ? "PASS" : "N/A");

  if (!decision) {
    if (ctx.selfApproval) {
      push("Validate approval", "FAIL");
      decision = "deny";
      reason = "Separation-of-Duties-v2.1 — the package author may not approve their own change.";
    } else if (ctx.approvalState === "incomplete") {
      push("Validate approval", "FAIL");
      decision = "approval_required";
      reason = "Approval chain incomplete — independent approvers required before authorization is issued.";
    } else if (isProd && mutating && ctx.approvalState !== "satisfied") {
      push("Validate approval", "FAIL");
      decision = "approval_required";
      reason = "Risk-based approval required for this production action.";
    } else {
      push("Validate approval", isProd && mutating ? "PASS" : "N/A");
    }
  } else {
    push("Validate approval", "N/A");
  }

  if (!decision && ctx.authorizationExpired) {
    push("Validate authorization token", "FAIL");
    decision = "deny";
    reason = "Execution authorization has expired and cannot be reused.";
  } else {
    push("Validate authorization token", decision ? "N/A" : ctx.authorizationId ? "PASS" : isProd && mutating ? "FAIL" : "N/A");
    if (!decision && isProd && mutating && !ctx.authorizationId) {
      decision = "deny";
      reason = "No valid execution authorization present for this action.";
    }
  }

  push("Validate session", decision ? "N/A" : "PASS");

  if (!decision && ctx.secretAvailable === false) {
    push("Resolve execution identity", "FAIL");
    decision = "deny";
    reason = "Credential authority unreachable — no credential issued and no fallback exists.";
  } else {
    push("Resolve execution identity", decision ? "N/A" : "PASS");
  }

  push("Evaluate destructive-action restrictions", decision ? "N/A" : "PASS");

  if (!decision && ctx.requestedSizeGb != null && ctx.approvedSizeGb != null && ctx.requestedSizeGb > ctx.approvedSizeGb) {
    push("Evaluate runtime safety", "FAIL");
    decision = "deny";
    reason = `Parameter exceeds package authorization (requested ${ctx.requestedSizeGb} GB, approved ${ctx.approvedSizeGb} GB).`;
  } else {
    push("Evaluate runtime safety", decision ? "N/A" : "PASS");
  }

  push("Produce authorization decision", "PASS");

  if (!decision) {
    decision = "allow";
    reason = "Package, approval, identity, policy, parameter and session checks all passed.";
  }
  return { decision, reason, trace };
}

export const DEFAULT_CONTEXT: AuthorizationContext = {
  principal: "terraform-runner-01",
  environment: "Production",
  technology: "AWS",
  action: "Modify EBS Volume",
  target: "vol-0a81f2c4e7b9d1234",
  risk: "medium",
  packageId: "CP-2026-01842",
  packageVersion: "1.0",
  authorizationId: "EXEC-AUTH-01842",
  approvalState: "satisfied",
  requestedSizeGb: 750,
  approvedSizeGb: 750,
  authorizationExpired: false,
  secretAvailable: true,
  selfApproval: false,
  prohibited: false,
};

export function contextForScenario(s: GovernanceScenario): AuthorizationContext {
  const c = { ...DEFAULT_CONTEXT };
  if (s === "unauthorized_prod") { c.packageId = "None"; c.authorizationId = undefined; c.approvalState = "none"; }
  if (s === "expired_authorization") c.authorizationExpired = true;
  if (s === "runner_scope_violation") c.requestedSizeGb = 1024;
  if (s === "secret_failure") c.secretAvailable = false;
  if (s === "self_approval") { c.selfApproval = true; c.principal = "r.alvarez"; c.approvalState = "incomplete"; }
  if (s === "package_modified") { c.packageVersion = "1.1 Draft"; c.authorizationExpired = true; }
  if (s === "stale_identity") { c.secretAvailable = true; c.approvalState = "satisfied"; }
  return c;
}
