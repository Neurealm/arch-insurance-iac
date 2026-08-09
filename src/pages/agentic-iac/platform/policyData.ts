// Canonical (mock) policy model for the Policies & Governance screen.
// Deterministic local simulation — no external policy engine is contacted.

export type PolicyType = "Execution" | "Security" | "Governance" | "Risk" | "Approval" | "Validation" | "Evidence" | "Safety";
export type PolicyStatus = "Active" | "Draft" | "Retired";
export type RiskLevel = "informational" | "low" | "medium" | "high" | "critical";
export type SimDecision = "allow" | "approval_required" | "deny";

export interface PolicyRule {
  id: string;
  when: string[];
  then: string;
  effect: "allow" | "deny" | "approval" | "halt" | "warn";
}

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  appliesTo: string;
  description: string;
  riskCoverage: string;
  version: string;
  status: PolicyStatus;
  lastUpdated: string;
  owner: string;
  businessOwner: string;
  securityOwner: string;
  effectiveDate: string;
  reviewDate: string;
  environmentScope: string;
  technologyScope: string;
  riskScope: string;
  dependencies: string[];
  rules: PolicyRule[];
  exceptions: string[];
  approvalRequirements: string[];
  validationRequirements: string[];
  evidenceRequirements: string[];
  enforcementPoint: string[];
  lastEvaluated: string;
  evaluationCount: number;
  violations: number;
  domain: string;
  logic: string;
}

const std = {
  businessOwner: "Infrastructure Operations",
  securityOwner: "Security Architecture",
  effectiveDate: "2026-01-15",
  reviewDate: "2026-10-15",
};

export const POLICIES: Policy[] = [
  {
    id: "pol-prod-exec", name: "Production Execution Policy", type: "Execution", appliesTo: "Production",
    description: "Controls which actions can execute against production infrastructure.",
    riskCoverage: "Medium, High, Critical", version: "3.2", status: "Active", lastUpdated: "May 20, 2026",
    owner: "Security Architecture", ...std,
    environmentScope: "Production", technologyScope: "AWS, Azure, GCP, Windows, SQL, Kubernetes, Network",
    riskScope: "Medium and above",
    dependencies: ["Risk Classification Policy", "Approved Package Immutability", "Separation of Duties Policy"],
    rules: [
      { id: "R1", when: ["Environment = Production", "Action mutates infrastructure"], then: "Approved Change Package Required", effect: "deny" },
      { id: "R2", when: ["Risk = Medium"], then: "Medium-Risk Approval Workflow Required", effect: "approval" },
      { id: "R3", when: ["Action = Destructive"], then: "DENY unless explicit destructive-action exception exists", effect: "deny" },
      { id: "R4", when: ["Package signature invalid"], then: "DENY", effect: "deny" },
      { id: "R5", when: ["Authorization expired"], then: "DENY", effect: "deny" },
    ],
    exceptions: ["Emergency Access Policy v2.2 (break-glass path only)"],
    approvalRequirements: ["Risk-based approver set", "No self-approval", "Approval age limit 24 hours"],
    validationRequirements: ["Production Validation Policy v3.6 applies to every execution"],
    evidenceRequirements: ["Execution request/response", "Resulting state", "Session record"],
    enforcementPoint: ["Package Creation", "Authorization", "Infrastructure API Request", "Runtime Gate"],
    lastEvaluated: "2 min ago", evaluationCount: 1842, violations: 0, domain: "Cloud",
    logic: `{
  "policy": "production-execution",
  "version": "3.2",
  "match": { "environment": "production", "mutating": true },
  "require": ["approved_package", "valid_signature", "valid_authorization"],
  "risk_gates": { "medium": "approval:medium", "high": "approval:high", "critical": "deny" },
  "deny_if": ["destructive_action", "authorization_expired", "target_mismatch"]
}`,
  },
  {
    id: "pol-destructive", name: "Destructive Action Policy", type: "Execution", appliesTo: "All Environments",
    description: "Prohibits destructive infrastructure operations unless explicitly authorized by separate policy.",
    riskCoverage: "High, Critical", version: "2.1", status: "Active", lastUpdated: "May 18, 2026",
    owner: "Security Architecture", ...std,
    environmentScope: "All Environments", technologyScope: "All", riskScope: "High, Critical",
    dependencies: ["Risk Classification Policy", "Emergency Access Policy"],
    rules: [
      { id: "R1", when: ["Action is destructive"], then: "DENY by default", effect: "deny" },
      { id: "R2", when: ["Explicit destructive-action exception policy exists", "Environment matches exception"], then: "Route to Critical Change Workflow", effect: "approval" },
      { id: "R3", when: ["Human approval present", "No destructive exception"], then: "DENY — approval cannot override prohibition", effect: "deny" },
    ],
    exceptions: ["Named destructive-action exception policies (none currently active)"],
    approvalRequirements: ["Critical Change Workflow (4 approvers) when an exception exists"],
    validationRequirements: ["Pre-action backup verification", "Post-action state verification"],
    evidenceRequirements: ["Exception reference", "Approver record", "Recovery point reference"],
    enforcementPoint: ["Change Engineering", "Package Creation", "Runtime Gate", "Infrastructure API Request"],
    lastEvaluated: "11 min ago", evaluationCount: 96, violations: 0, domain: "Cloud",
    logic: `{ "policy": "destructive-action", "version": "2.1", "default": "deny",
  "prohibited": ["delete_production_volume","terminate_production_vm","delete_database",
    "destroy_cluster","delete_firewall_policy","remove_audit_configuration","delete_backup"],
  "override": "explicit_exception_policy_only" }`,
  },
  {
    id: "pol-least-priv", name: "Least Privilege Policy", type: "Security", appliesTo: "All",
    description: "Enforces minimum required permissions for human, service and runner identities.",
    riskCoverage: "All", version: "2.5", status: "Active", lastUpdated: "May 15, 2026",
    owner: "Security Architecture", ...std,
    environmentScope: "All", technologyScope: "All", riskScope: "All",
    dependencies: ["Separation of Duties Policy"],
    rules: [
      { id: "R1", when: ["Identity is created or modified"], then: "Scope must be explicit (account, region, resource type, tag)", effect: "deny" },
      { id: "R2", when: ["Discovery identity requests mutation"], then: "DENY", effect: "deny" },
      { id: "R3", when: ["Scope expansion requested"], then: "Administrative review required", effect: "approval" },
    ],
    exceptions: [],
    approvalRequirements: ["Security Administrator approval for scope expansion"],
    validationRequirements: ["Quarterly access review"],
    evidenceRequirements: ["Scope definition", "Approval record"],
    enforcementPoint: ["Discovery", "Runner Session", "Authorization"],
    lastEvaluated: "1 min ago", evaluationCount: 384, violations: 0, domain: "Identity & Access",
    logic: `{ "policy": "least-privilege", "version": "2.5",
  "require": ["explicit_scope","separated_discovery_execution"], "deny": ["wildcard_resource","standing_admin"] }`,
  },
  {
    id: "pol-sod", name: "Separation of Duties Policy", type: "Governance", appliesTo: "Production",
    description: "Prevents self-approval and conflicting role combinations.",
    riskCoverage: "Medium, High, Critical", version: "3.4", status: "Active", lastUpdated: "May 19, 2026",
    owner: "Governance Team", ...std,
    environmentScope: "Production", technologyScope: "All", riskScope: "Medium and above",
    dependencies: ["Approval Policy — Medium Risk", "Approval Policy — High Risk"],
    rules: [
      { id: "R1", when: ["Approver = Package author"], then: "DENY", effect: "deny" },
      { id: "R2", when: ["Approver holds both engineering and approval role for the package"], then: "DENY", effect: "deny" },
      { id: "R3", when: ["Approver modifies package during approval"], then: "Return package to engineering", effect: "deny" },
    ],
    exceptions: [],
    approvalRequirements: ["Independent approver per required role"],
    validationRequirements: ["Approver independence check at each approval"],
    evidenceRequirements: ["Author identity", "Approver identities", "Independence assertion"],
    enforcementPoint: ["Approval", "Authorization"],
    lastEvaluated: "27 min ago", evaluationCount: 217, violations: 0, domain: "Identity & Access",
    logic: `{ "policy": "separation-of-duties", "version": "3.4",
  "deny_if": ["approver == author","approver_roles ∩ engineering_roles ≠ ∅"] }`,
  },
  {
    id: "pol-risk", name: "Risk Classification Policy", type: "Risk", appliesTo: "All",
    description: "Classifies infrastructure actions according to impact, reversibility, criticality and environment.",
    riskCoverage: "Informational – Critical", version: "4.0", status: "Active", lastUpdated: "May 14, 2026",
    owner: "Governance Team", ...std,
    environmentScope: "All", technologyScope: "All", riskScope: "All",
    dependencies: [],
    rules: [
      { id: "R1", when: ["Action does not mutate state"], then: "Informational", effect: "allow" },
      { id: "R2", when: ["Non-production", "Reversible"], then: "Low", effect: "allow" },
      { id: "R3", when: ["Production", "Reversible or compensating strategy available"], then: "Medium", effect: "approval" },
      { id: "R4", when: ["Production", "Security or availability impact"], then: "High", effect: "approval" },
      { id: "R5", when: ["Destructive or irrecoverable"], then: "Critical", effect: "deny" },
    ],
    exceptions: [],
    approvalRequirements: ["Classification cannot be lowered by the requester"],
    validationRequirements: ["Score recalculated when package parameters change"],
    evidenceRequirements: ["Factor scores", "Resulting classification", "Confidence"],
    enforcementPoint: ["Remediation Recommendation", "Change Engineering", "Package Creation"],
    lastEvaluated: "3 min ago", evaluationCount: 291, violations: 0, domain: "Platform & Tools",
    logic: `{ "policy": "risk-classification", "version": "4.0",
  "factors": ["environment","criticality","resource_type","action_type","blast_radius","reversibility",
   "downtime","data_risk","security_impact","dependencies","tier","validation","recovery","history","window","approval"],
  "bands": { "0-15":"informational","16-30":"low","31-55":"medium","56-80":"high","81-100":"critical" } }`,
  },
  {
    id: "pol-appr-med", name: "Approval Policy — Medium Risk", type: "Approval", appliesTo: "Production",
    description: "Defines approval requirements for Medium Risk production actions.",
    riskCoverage: "Medium", version: "2.8", status: "Active", lastUpdated: "May 18, 2026",
    owner: "Change Management", ...std,
    environmentScope: "Production", technologyScope: "All", riskScope: "Medium",
    dependencies: ["Separation of Duties Policy"],
    rules: [
      { id: "R1", when: ["Risk = Medium", "Environment = Production"], then: "Change Manager, Database SME and Infrastructure Owner approval required", effect: "approval" },
      { id: "R2", when: ["Approval older than 24 hours"], then: "Re-approval required", effect: "deny" },
      { id: "R3", when: ["All approvals satisfied"], then: "Issue execution authorization", effect: "allow" },
    ],
    exceptions: [],
    approvalRequirements: ["Change Manager", "Database SME", "Infrastructure Owner", "Sequential", "SLA 4 hours"],
    validationRequirements: ["Validation plan attached before approval"],
    evidenceRequirements: ["Approval records", "Authorization token"],
    enforcementPoint: ["Approval", "Authorization"],
    lastEvaluated: "24 min ago", evaluationCount: 27, violations: 0, domain: "Platform & Tools",
    logic: `{ "policy": "approval-medium", "version": "2.8",
  "roles": ["change_manager","database_sme","infrastructure_owner"], "order": "sequential",
  "self_approval": false, "sla_hours": 4 }`,
  },
  {
    id: "pol-appr-high", name: "Approval Policy — High Risk", type: "Approval", appliesTo: "Production",
    description: "Defines approval requirements for High Risk production actions.",
    riskCoverage: "High, Critical", version: "3.1", status: "Active", lastUpdated: "May 18, 2026",
    owner: "Change Management", ...std,
    environmentScope: "Production", technologyScope: "All", riskScope: "High",
    dependencies: ["Separation of Duties Policy", "Destructive Action Policy"],
    rules: [
      { id: "R1", when: ["Risk = High"], then: "Infrastructure Owner, Change Manager, Domain SME and Security approval required", effect: "approval" },
      { id: "R2", when: ["Risk = Critical", "No destructive exception"], then: "DENY", effect: "deny" },
    ],
    exceptions: [],
    approvalRequirements: ["Owner", "Change Manager", "Domain SME", "Security", "SLA 8 hours"],
    validationRequirements: ["Extended validation plan", "Recovery strategy documented"],
    evidenceRequirements: ["Approval records", "Recovery plan", "Security disposition"],
    enforcementPoint: ["Approval", "Authorization"],
    lastEvaluated: "1 hour ago", evaluationCount: 14, violations: 0, domain: "Platform & Tools",
    logic: `{ "policy": "approval-high", "version": "3.1",
  "roles": ["infrastructure_owner","change_manager","domain_sme","security"], "sla_hours": 8 }`,
  },
  {
    id: "pol-validation", name: "Production Validation Policy", type: "Validation", appliesTo: "Production",
    description: "Defines mandatory infrastructure and service validation before change completion.",
    riskCoverage: "Medium and above", version: "3.6", status: "Active", lastUpdated: "May 21, 2026",
    owner: "Platform Engineering", ...std,
    environmentScope: "Production", technologyScope: "All", riskScope: "Medium and above",
    dependencies: ["Change Evidence Policy"],
    rules: [
      { id: "R1", when: ["Production execution completes"], then: "Infrastructure, OS, database, application and business-service validation required", effect: "deny" },
      { id: "R2", when: ["Any mandatory test fails"], then: "Do not close change", effect: "halt" },
      { id: "R3", when: ["Application validation fails"], then: "Change marked not complete", effect: "halt" },
    ],
    exceptions: [],
    approvalRequirements: ["Validation plan approved with the package"],
    validationRequirements: ["21 tests for CP-2026-01842", "21 / 21 must pass"],
    evidenceRequirements: ["Raw test output", "Telemetry comparison", "Integrity manifest"],
    enforcementPoint: ["Validation", "Closure"],
    lastEvaluated: "18 min ago", evaluationCount: 174, violations: 0, domain: "Applications",
    logic: `{ "policy": "production-validation", "version": "3.6",
  "required": ["infrastructure","os","database","application","business_service","telemetry","evidence"],
  "on_failure": "block_closure" }`,
  },
  {
    id: "pol-evidence", name: "Change Evidence Policy", type: "Evidence", appliesTo: "Production",
    description: "Defines evidence required for execution and change closure.",
    riskCoverage: "All production change", version: "2.4", status: "Active", lastUpdated: "May 12, 2026",
    owner: "Governance Team", ...std,
    environmentScope: "Production", technologyScope: "All", riskScope: "All",
    dependencies: ["Production Validation Policy"],
    rules: [
      { id: "R1", when: ["Execution step completes"], then: "Capture request, response and resulting state", effect: "deny" },
      { id: "R2", when: ["Evidence incomplete at closure"], then: "Block closure", effect: "halt" },
      { id: "R3", when: ["Evidence written"], then: "Record SHA-256 integrity manifest", effect: "allow" },
    ],
    exceptions: [],
    approvalRequirements: [],
    validationRequirements: ["Evidence completeness check before closure"],
    evidenceRequirements: ["Execution log", "Validation output", "Approval chain", "Authorization record", "Session record"],
    enforcementPoint: ["Runner Session", "Validation", "Closure"],
    lastEvaluated: "16 min ago", evaluationCount: 148, violations: 0, domain: "Platform & Tools",
    logic: `{ "policy": "change-evidence", "version": "2.4", "retention": "customer_defined",
  "require_at_closure": ["execution_log","validation_output","approvals","authorization","sessions","manifest"] }`,
  },
  {
    id: "pol-immutable", name: "Approved Package Immutability", type: "Execution", appliesTo: "Production",
    description: "Prevents approved change packages from being modified after authorization.",
    riskCoverage: "All production change", version: "2.3", status: "Active", lastUpdated: "May 09, 2026",
    owner: "Security Architecture", ...std,
    environmentScope: "Production", technologyScope: "All", riskScope: "All",
    dependencies: ["Production Execution Policy"],
    rules: [
      { id: "R1", when: ["Approved package is edited"], then: "Invalidate signature and revoke authorization", effect: "deny" },
      { id: "R2", when: ["New version created"], then: "Require re-engineering validation, policy reevaluation and new approval", effect: "approval" },
      { id: "R3", when: ["Runner requests target not in package"], then: "DENY", effect: "deny" },
    ],
    exceptions: [],
    approvalRequirements: ["Full re-approval for each new package version"],
    validationRequirements: ["Signature verification at each enforcement point"],
    evidenceRequirements: ["Package hash", "Version history", "Authorization state"],
    enforcementPoint: ["Authorization", "Runner Session", "Infrastructure API Request"],
    lastEvaluated: "17 min ago", evaluationCount: 128, violations: 0, domain: "Platform & Tools",
    logic: `{ "policy": "package-immutability", "version": "2.3",
  "on_mutation": ["invalidate_signature","revoke_authorization","create_draft_version"] }`,
  },
  {
    id: "pol-runtime", name: "Runtime Execution Safety", type: "Safety", appliesTo: "Production",
    description: "Defines runtime guardrails and halt conditions.",
    riskCoverage: "Medium and above", version: "2.1", status: "Active", lastUpdated: "May 17, 2026",
    owner: "Platform Engineering", ...std,
    environmentScope: "Production", technologyScope: "AWS, SQL, Windows", riskScope: "Medium and above",
    dependencies: ["Production Validation Policy"],
    rules: [
      { id: "R1", when: ["OrdersDB != ONLINE"], then: "HALT", effect: "halt" },
      { id: "R2", when: ["Application critical health fails"], then: "HALT", effect: "halt" },
      { id: "R3", when: ["Target differs from package"], then: "DENY", effect: "deny" },
      { id: "R4", when: ["Requested parameter exceeds authorization"], then: "DENY", effect: "deny" },
      { id: "R5", when: ["Credential unavailable"], then: "BLOCK", effect: "deny" },
      { id: "R6", when: ["EBS state remains optimizing beyond threshold"], then: "WARN + continue monitoring", effect: "warn" },
    ],
    exceptions: [],
    approvalRequirements: [],
    validationRequirements: ["Continuous safety-state evaluation during execution"],
    evidenceRequirements: ["Safety state transitions", "Halt reasons"],
    enforcementPoint: ["Runtime Gate", "Runner Session"],
    lastEvaluated: "17 min ago", evaluationCount: 512, violations: 0, domain: "Compute & OS",
    logic: `{ "policy": "runtime-safety", "version": "2.1",
  "halt_if": ["db_not_online","app_critical_health_fail"],
  "deny_if": ["target_mismatch","parameter_exceeds_authorization","credential_unavailable"],
  "warn_if": ["ebs_optimizing_beyond_threshold"] }`,
  },
  {
    id: "pol-emergency", name: "Emergency Access Policy", type: "Governance", appliesTo: "Production",
    description: "Controls break-glass access and emergency execution.",
    riskCoverage: "Critical", version: "2.2", status: "Active", lastUpdated: "May 10, 2026",
    owner: "Security Architecture", ...std,
    environmentScope: "Production", technologyScope: "All", riskScope: "Critical",
    dependencies: ["Destructive Action Policy", "Separation of Duties Policy"],
    rules: [
      { id: "R1", when: ["Emergency request submitted"], then: "Incident reference and emergency justification required", effect: "approval" },
      { id: "R2", when: ["Emergency approver satisfied"], then: "PAM issues temporary credential, maximum 15 minutes", effect: "approval" },
      { id: "R3", when: ["Emergency session ends"], then: "Mandatory post-event review", effect: "halt" },
    ],
    exceptions: [],
    approvalRequirements: ["Emergency Approver", "Security Administrator", "Immediate SIEM notification"],
    validationRequirements: ["Post-event validation of resulting state"],
    evidenceRequirements: ["Incident reference", "Session recording", "Approver record", "Review disposition"],
    enforcementPoint: ["Approval", "Authorization", "Runner Session"],
    lastEvaluated: "Never in current demo period", evaluationCount: 0, violations: 0, domain: "Network & Security",
    logic: `{ "policy": "emergency-access", "version": "2.2", "max_duration_minutes": 15,
  "require": ["incident_reference","justification","privileged_approver","pam_credential","session_recording","post_event_review"] }`,
  },
  {
    id: "pol-network", name: "Network Change Policy", type: "Execution", appliesTo: "Production",
    description: "Governs firewall, load-balancer and DNS change authority.",
    riskCoverage: "High", version: "1.9", status: "Active", lastUpdated: "Apr 28, 2026",
    owner: "Network Security", ...std,
    environmentScope: "Production", technologyScope: "Firewall, Load Balancer, DNS", riskScope: "High",
    dependencies: ["Approval Policy — High Risk", "Destructive Action Policy"],
    rules: [
      { id: "R1", when: ["Firewall allow rule added"], then: "Network Owner, Security Approver and Change Manager approval required", effect: "approval" },
      { id: "R2", when: ["Default-deny rule modified"], then: "DENY", effect: "deny" },
    ],
    exceptions: [],
    approvalRequirements: ["Network Owner", "Security Approver", "Change Manager"],
    validationRequirements: ["Connectivity", "Security policy", "Application reachability", "Evidence"],
    evidenceRequirements: ["Rule diff", "Connectivity proof", "Security disposition"],
    enforcementPoint: ["Change Engineering", "Approval", "Runtime Gate"],
    lastEvaluated: "3 hours ago", evaluationCount: 38, violations: 0, domain: "Network & Security",
    logic: `{ "policy": "network-change", "version": "1.9", "risk": "high",
  "approvers": ["network_owner","security","change_manager"], "deny": ["modify_default_deny"] }`,
  },
  {
    id: "pol-nonprod", name: "Non-Production Execution Policy", type: "Execution", appliesTo: "Non-Production",
    description: "Allows policy-controlled autonomous execution in non-production environments.",
    riskCoverage: "Low, Medium", version: "2.0", status: "Active", lastUpdated: "Apr 30, 2026",
    owner: "Platform Engineering", ...std,
    environmentScope: "Non-Production, Development, Test", technologyScope: "All", riskScope: "Low, Medium",
    dependencies: ["Risk Classification Policy"],
    rules: [
      { id: "R1", when: ["Environment != Production", "Risk = Low"], then: "ALLOW without human approval", effect: "allow" },
      { id: "R2", when: ["Environment != Production", "Risk = Medium"], then: "Policy-controlled execution with validation", effect: "allow" },
      { id: "R3", when: ["Action = Destructive"], then: "DENY", effect: "deny" },
    ],
    exceptions: [],
    approvalRequirements: ["None for low risk"],
    validationRequirements: ["Validation still required after execution"],
    evidenceRequirements: ["Execution log", "Validation output"],
    enforcementPoint: ["Package Creation", "Runtime Gate", "Validation"],
    lastEvaluated: "38 min ago", evaluationCount: 402, violations: 0, domain: "Compute & OS",
    logic: `{ "policy": "non-production-execution", "version": "2.0",
  "allow_if": ["env != production","risk <= medium","not destructive"], "require": ["validation"] }`,
  },
];

/* ── Summary / coverage ─────────────────────────────────────── */

export const POLICY_TOTALS = {
  totalPolicies: 42,
  policySets: 8,
  criticalHighRules: 16,
  approvalWorkflows: 6,
  violations24h: 0,
  conflicts: 0,
  governanceHealth: 98,
};

export const COVERAGE_BY_DOMAIN = [
  { domain: "Cloud (AWS/Azure/GCP)", count: 12 },
  { domain: "Compute & OS", count: 8 },
  { domain: "Data & Databases", count: 6 },
  { domain: "Network & Security", count: 5 },
  { domain: "Identity & Access", count: 4 },
  { domain: "Platform & Tools", count: 4 },
  { domain: "Applications", count: 3 },
];

export const POLICY_CATEGORIES = ["Execution", "Security", "Governance", "Risk", "Approval", "Validation", "Evidence", "Safety"] as const;

export const COVERAGE_MATRIX: Record<string, Record<string, number>> = {
  "Cloud (AWS/Azure/GCP)": { Execution: 4, Security: 2, Governance: 1, Risk: 1, Approval: 2, Validation: 1, Evidence: 1, Safety: 0 },
  "Compute & OS": { Execution: 3, Security: 1, Governance: 1, Risk: 1, Approval: 1, Validation: 1, Evidence: 0, Safety: 0 },
  "Data & Databases": { Execution: 2, Security: 1, Governance: 0, Risk: 1, Approval: 1, Validation: 1, Evidence: 0, Safety: 0 },
  "Network & Security": { Execution: 1, Security: 2, Governance: 1, Risk: 0, Approval: 1, Validation: 0, Evidence: 0, Safety: 0 },
  "Identity & Access": { Execution: 0, Security: 2, Governance: 2, Risk: 0, Approval: 0, Validation: 0, Evidence: 0, Safety: 0 },
  "Platform & Tools": { Execution: 1, Security: 0, Governance: 1, Risk: 1, Approval: 0, Validation: 0, Evidence: 1, Safety: 0 },
  Applications: { Execution: 0, Security: 0, Governance: 0, Risk: 0, Approval: 0, Validation: 2, Evidence: 1, Safety: 0 },
};

export const ENFORCEMENT_SUMMARY = [
  { label: "Observe & Discover", value: "Autonomous", tone: "ok" },
  { label: "Diagnose", value: "Autonomous", tone: "ok" },
  { label: "Engineer & Recommend", value: "Autonomous", tone: "ok" },
  { label: "Generate IaC", value: "Autonomous", tone: "ok" },
  { label: "Execute — Non-Production", value: "Policy Controlled", tone: "info" },
  { label: "Execute — Prod Low Risk", value: "Approval Required", tone: "warn" },
  { label: "Execute — Prod Medium Risk", value: "Approval Required", tone: "warn" },
  { label: "Execute — Prod High Risk", value: "Approval Required / Restricted", tone: "warn" },
  { label: "Critical / Destructive", value: "Prohibited by Default", tone: "bad" },
  { label: "Emergency", value: "Break-Glass Policy", tone: "info" },
] as const;

/* ── Policy sets ────────────────────────────────────────────── */

export interface PolicySet {
  id: string;
  name: string;
  policies: string[];
  environment: string;
  technology: string;
  version: string;
  status: "Active" | "Draft";
  lastPublished: string;
  owner: string;
}

export const POLICY_SETS: PolicySet[] = [
  {
    id: "set-prod", name: "Production Baseline",
    policies: ["Production Execution Policy", "Risk Classification Policy", "Least Privilege Policy", "Separation of Duties Policy", "Approval Policy — Medium Risk", "Approval Policy — High Risk", "Production Validation Policy", "Change Evidence Policy", "Runtime Execution Safety", "Approved Package Immutability"],
    environment: "Production", technology: "All", version: "6.2", status: "Active", lastPublished: "May 21, 2026", owner: "Security Architecture",
  },
  { id: "set-nonprod", name: "Non-Production Baseline", policies: ["Non-Production Execution Policy", "Risk Classification Policy", "Least Privilege Policy", "Production Validation Policy"], environment: "Non-Production", technology: "All", version: "3.4", status: "Active", lastPublished: "Apr 30, 2026", owner: "Platform Engineering" },
  { id: "set-cloud", name: "Cloud Infrastructure", policies: ["Production Execution Policy", "Destructive Action Policy", "Approved Package Immutability", "Runtime Execution Safety"], environment: "All", technology: "AWS, Azure, GCP", version: "4.1", status: "Active", lastPublished: "May 18, 2026", owner: "Cloud Engineering" },
  { id: "set-db", name: "Database Operations", policies: ["Production Execution Policy", "Approval Policy — Medium Risk", "Production Validation Policy", "Change Evidence Policy"], environment: "Production", technology: "SQL Server", version: "2.9", status: "Active", lastPublished: "May 19, 2026", owner: "Database Engineering" },
  { id: "set-win", name: "Windows Administration", policies: ["Production Execution Policy", "Least Privilege Policy", "Runtime Execution Safety"], environment: "All", technology: "Windows Server", version: "2.2", status: "Active", lastPublished: "May 11, 2026", owner: "Windows Platform Team" },
  { id: "set-net", name: "Network & Security", policies: ["Network Change Policy", "Destructive Action Policy", "Approval Policy — High Risk"], environment: "Production", technology: "Firewall, LB, DNS", version: "1.8", status: "Active", lastPublished: "Apr 28, 2026", owner: "Network Security" },
  { id: "set-idam", name: "Identity Administration", policies: ["Least Privilege Policy", "Separation of Duties Policy"], environment: "All", technology: "AD, Entra ID", version: "2.0", status: "Active", lastPublished: "May 05, 2026", owner: "Identity Engineering" },
  { id: "set-emerg", name: "Emergency Operations", policies: ["Emergency Access Policy", "Destructive Action Policy", "Change Evidence Policy"], environment: "Production", technology: "All", version: "1.5", status: "Active", lastPublished: "May 10, 2026", owner: "Security Architecture" },
];

export const POLICY_PRECEDENCE = [
  "Prohibited Actions", "Security Boundaries", "Resource Scope", "Environment Rules",
  "Risk Classification", "Approval Rules", "Execution Rules", "Validation Rules",
  "Evidence Rules", "Runtime Safety",
];

export const CONFLICT_EXAMPLE = {
  policyA: "Allow Production VM Restart for Operators",
  policyB: "Prohibit Tier 1 Production Restart",
  target: "Tier 1 Production VM",
  conflict: "Detected",
  resolution: "Higher-specificity / higher-priority prohibition wins.",
  final: "DENY",
};

/* ── Risk classification ────────────────────────────────────── */

export const RISK_LEVELS = [
  { id: "critical", label: "Critical", color: "#dc2626", description: "Potential severe safety, security, availability or destructive impact.", examples: ["Delete production database", "Terminate critical infrastructure", "IAM trust modification", "Privileged AD group modification"], authority: "Prohibited by Default / Emergency Policy" },
  { id: "high", label: "High", color: "#ea580c", description: "Significant production or security impact.", examples: ["Firewall rule change", "Production DB configuration", "Load-balancer routing change"], authority: "Multi-party Approval" },
  { id: "medium", label: "Medium", color: "#d97706", description: "Moderate production impact, generally reversible or with a compensating strategy.", examples: ["Production EBS expansion", "Production VM resize", "Windows filesystem extension"], authority: "Approval Required" },
  { id: "low", label: "Low", color: "#16a34a", description: "Minimal operational impact, easily reversible, low blast radius.", examples: ["Tag update", "Non-production restart", "Low-risk config change"], authority: "Policy Controlled" },
  { id: "informational", label: "Informational", color: "#1B4F91", description: "No mutation — observation only.", examples: ["Read state", "Discovery", "Telemetry"], authority: "Autonomous" },
];

export const RISK_FACTORS = [
  "Environment", "Business Criticality", "Resource Type", "Action Type", "Blast Radius",
  "Reversibility", "Expected Downtime", "Data Risk", "Security Impact", "Dependency Count",
  "Production Tier", "Validation Coverage", "Recovery Strategy", "Historical Success",
  "Change Window", "Human Approval",
];

export const CP_RISK_EXPLAIN = {
  inputs: [
    { label: "Environment", value: "Production" },
    { label: "Business Service", value: "Tier 1" },
    { label: "Action", value: "EBS Expansion" },
    { label: "Destructive", value: "No" },
    { label: "Expected Downtime", value: "None" },
    { label: "Reversible", value: "No direct shrink" },
    { label: "Compensating Strategy", value: "Yes" },
    { label: "Blast Radius", value: "Single workload" },
    { label: "Validation", value: "21 tests" },
    { label: "Backup", value: "Confirmed" },
  ],
  result: "MEDIUM RISK",
  score: 42,
  confidence: 96,
  notLow: ["Production Tier 1 workload", "Infrastructure mutation", "No direct capacity shrink rollback"],
  notHigh: ["Non-destructive", "Single workload", "No expected downtime", "Strong validation", "Backup confirmed", "Compensating strategy available"],
};

/* ── Approval rules ─────────────────────────────────────────── */

export interface ApprovalRule {
  workflow: string;
  environment: string;
  risk: string;
  approvers: string;
  approverList: string[];
  sla: string;
  status: "Active";
  sequential: boolean;
  selfApproval: boolean;
  usedBy?: string;
}

export const APPROVAL_RULES: ApprovalRule[] = [
  { workflow: "Production — Low Risk", environment: "Production", risk: "Low", approvers: "1 (Auto / Policy)", approverList: ["Change Manager"], sla: "15 min", status: "Active", sequential: false, selfApproval: false },
  { workflow: "Production — Medium Risk", environment: "Production", risk: "Medium", approvers: "3 (Eng. Owner, Change Mgr, DBA)", approverList: ["Change Manager", "Database SME", "Infrastructure Owner"], sla: "4 hr", status: "Active", sequential: true, selfApproval: false, usedBy: "CP-2026-01842" },
  { workflow: "Production — High Risk", environment: "Production", risk: "High", approvers: "3 (Owner, Change Mgr, DBA/Net)", approverList: ["Infrastructure Owner", "Change Manager", "Domain SME", "Security"], sla: "8 hr", status: "Active", sequential: true, selfApproval: false },
  { workflow: "Critical Change Workflow", environment: "Production", risk: "Critical", approvers: "4 (Owner, Security, CAB, Exec)", approverList: ["Infrastructure Owner", "Security", "CAB", "Executive Sponsor"], sla: "24 hr", status: "Active", sequential: true, selfApproval: false },
  { workflow: "Emergency Access Workflow", environment: "Production", risk: "Critical", approvers: "2 (Security, Operations Lead)", approverList: ["Security Administrator", "Operations Lead"], sla: "Immediately", status: "Active", sequential: true, selfApproval: false },
  { workflow: "Non-Production Workflow", environment: "Non-Prod", risk: "All", approvers: "0–1 (Policy Driven)", approverList: ["Policy Engine"], sla: "15 min", status: "Active", sequential: false, selfApproval: false },
];

/* ── Validation rules ───────────────────────────────────────── */

export interface ValidationRule {
  category: string;
  environment: string;
  riskThreshold: string;
  mandatory: boolean;
  minimumTests: number;
  failureBehavior: string;
}

export const VALIDATION_RULES: ValidationRule[] = [
  { category: "Infrastructure Validation", environment: "Production", riskThreshold: "Medium+", mandatory: true, minimumTests: 5, failureBehavior: "Do not close change" },
  { category: "Operating System Validation", environment: "Production", riskThreshold: "Medium+ (guest change)", mandatory: true, minimumTests: 4, failureBehavior: "Do not close change" },
  { category: "Database Validation", environment: "Production", riskThreshold: "Medium+ (database involved)", mandatory: true, minimumTests: 8, failureBehavior: "Halt downstream workflow" },
  { category: "Application Validation", environment: "Production", riskThreshold: "Medium+", mandatory: true, minimumTests: 4, failureBehavior: "Change not complete" },
  { category: "Business-Service Validation", environment: "Production", riskThreshold: "Tier 1 / Tier 2", mandatory: true, minimumTests: 2, failureBehavior: "Change not complete" },
  { category: "Security Validation", environment: "All", riskThreshold: "High+", mandatory: true, minimumTests: 3, failureBehavior: "Halt and notify security" },
  { category: "Evidence Validation", environment: "Production", riskThreshold: "All", mandatory: true, minimumTests: 1, failureBehavior: "Block closure" },
];

export const SQL_EBS_VALIDATION = [
  { label: "AWS Tests", value: 5 },
  { label: "Windows Tests", value: 4 },
  { label: "SQL Tests", value: 8 },
  { label: "Application Tests", value: 4 },
];

/* ── Enforcement rules / pipeline ───────────────────────────── */

export interface EnforcementPoint {
  point: string;
  policiesEvaluated: string[];
  decisionType: string;
  failureBehavior: string;
}

export const ENFORCEMENT_POINTS: EnforcementPoint[] = [
  { point: "Discovery", policiesEvaluated: ["Least Privilege Policy"], decisionType: "Allow / Deny", failureBehavior: "Discovery skipped, last known state retained" },
  { point: "Remediation Recommendation", policiesEvaluated: ["Risk Classification Policy"], decisionType: "Classify", failureBehavior: "Recommendation withheld" },
  { point: "Change Engineering", policiesEvaluated: ["Destructive Action Policy", "Risk Classification Policy", "Network Change Policy"], decisionType: "Allow / Deny", failureBehavior: "Package not generated" },
  { point: "Package Creation", policiesEvaluated: ["Production Execution Policy", "Risk Classification Policy"], decisionType: "Allow / Approval", failureBehavior: "Package rejected" },
  { point: "Approval", policiesEvaluated: ["Approval Policy — Medium Risk", "Approval Policy — High Risk", "Separation of Duties Policy"], decisionType: "Approval Required", failureBehavior: "Authorization not issued" },
  { point: "Authorization", policiesEvaluated: ["Approved Package Immutability", "Production Execution Policy"], decisionType: "Issue / Deny", failureBehavior: "No authorization token" },
  { point: "Runner Session", policiesEvaluated: ["Least Privilege Policy", "Runtime Execution Safety"], decisionType: "Allow / Block", failureBehavior: "Session not established" },
  { point: "Infrastructure API Request", policiesEvaluated: ["Approved Package Immutability", "Runtime Execution Safety"], decisionType: "Allow / Deny", failureBehavior: "API call never made" },
  { point: "Runtime Gate", policiesEvaluated: ["Runtime Execution Safety"], decisionType: "Continue / Halt / Warn", failureBehavior: "Execution halted" },
  { point: "Validation", policiesEvaluated: ["Production Validation Policy"], decisionType: "Pass / Fail", failureBehavior: "Change not complete" },
  { point: "Closure", policiesEvaluated: ["Change Evidence Policy", "Production Validation Policy"], decisionType: "Allow / Block", failureBehavior: "Closure blocked" },
];

export const ENFORCEMENT_PIPELINE = [
  "Intent", "Policy Context", "Risk Classification", "Policy Set", "Approval Decision",
  "Package Authorization", "Execution Policy", "Runtime Safety", "Validation Policy", "Closure Policy",
];

export const RUNTIME_SAFETY_RULES = [
  { when: "OrdersDB != ONLINE", then: "HALT", effect: "halt" },
  { when: "Application critical health fails", then: "HALT", effect: "halt" },
  { when: "Target differs from package", then: "DENY", effect: "deny" },
  { when: "Requested parameter exceeds authorization", then: "DENY", effect: "deny" },
  { when: "Credential unavailable", then: "BLOCK", effect: "deny" },
  { when: "EBS state remains optimizing longer than threshold", then: "WARN + Continue Monitoring", effect: "warn" },
] as const;

/* ── Policy effectiveness / insights ────────────────────────── */

export const EFFECTIVENESS = {
  totalEvaluations: 1842,
  allowed: 1623,
  approvalRequired: 179,
  denied: 40,
  topDenyReasons: [
    { reason: "Policy Violation", count: 18, pct: 45 },
    { reason: "Missing Approval", count: 12, pct: 30 },
    { reason: "Scope Violation", count: 7, pct: 17 },
    { reason: "Prohibited Action", count: 3, pct: 8 },
  ],
  mostEvaluated: [
    { policy: "Production Execution Policy", count: 612 },
    { policy: "Least Privilege Policy", count: 384 },
    { policy: "Risk Classification Policy", count: 291 },
    { policy: "Separation of Duties Policy", count: 217 },
  ],
};

export const CHANGE_HISTORY = [
  { id: "PC-118", policy: "Production Validation Policy", from: "3.5", to: "3.6", actor: "platform.eng@customer", date: "2026-05-21 09:14", reason: "Added business-service validation requirement", approval: "CHG0061204" },
  { id: "PC-117", policy: "Production Execution Policy", from: "3.1", to: "3.2", actor: "sec.arch@customer", date: "2026-05-20 15:38", reason: "Tightened parameter boundary evaluation", approval: "CHG0061188" },
  { id: "PC-116", policy: "Separation of Duties Policy", from: "3.3", to: "3.4", actor: "governance@customer", date: "2026-05-19 11:02", reason: "Added approver-modification restriction", approval: "CHG0061140" },
  { id: "PC-115", policy: "Destructive Action Policy", from: "2.0", to: "2.1", actor: "sec.arch@customer", date: "2026-05-18 16:45", reason: "Added backup deletion to prohibited list", approval: "CHG0061102" },
  { id: "PC-114", policy: "Approval Policy — High Risk", from: "3.0", to: "3.1", actor: "change.mgmt@customer", date: "2026-05-18 10:20", reason: "Added security approver for high risk", approval: "CHG0061090" },
  { id: "PC-113", policy: "Least Privilege Policy", from: "2.4", to: "2.5", actor: "identity.eng@customer", date: "2026-05-15 08:55", reason: "Explicit tag scoping required", approval: "CHG0060998" },
  { id: "PC-112", policy: "Risk Classification Policy", from: "3.9", to: "4.0", actor: "governance@customer", date: "2026-05-14 14:11", reason: "Added recovery-strategy factor", approval: "CHG0060955" },
];

export const PROHIBITED_EXAMPLES = [
  "Delete production volume", "Terminate production VM", "Delete database", "Destroy cluster",
  "Delete firewall policy", "Remove audit configuration", "Delete backup",
];

/* ── Simulation engine ──────────────────────────────────────── */

export interface SimInput {
  environment: string;
  technology: string;
  asset: string;
  action: string;
  currentState: string;
  requestedState: string;
  criticality: string;
  packageId: string;
  role: string;
  approvals: string;
  validation: string;
  recovery: string;
}

export interface SimResult {
  decision: SimDecision;
  risk: RiskLevel;
  policiesEvaluated: number;
  passed: number;
  reason: string;
  detail: { label: string; value: string }[];
  requiredApprovers?: string[];
  requiredValidation?: string[];
  policy?: string;
}

export const DEFAULT_SIM: SimInput = {
  environment: "Production",
  technology: "AWS / SQL / Windows",
  asset: "vol-0a81f2c4e7b9d1234",
  action: "Resize EBS Volume",
  currentState: "500 GB",
  requestedState: "750 GB",
  criticality: "Tier 1",
  packageId: "CP-2026-01842 v1.0",
  role: "Terraform Runner (aws-exec-prod)",
  approvals: "3 / 3",
  validation: "21 tests",
  recovery: "Compensating strategy available",
};

export const SIM_ACTIONS = [
  "Resize EBS Volume", "Delete EBS Volume", "Restart Windows Service",
  "Add Production Allow Rule", "Restart Tier 1 Production VM", "Read Volume State",
];
export const SIM_ENVIRONMENTS = ["Production", "Non-Production", "Development", "Test"];
export const SIM_SIZES = ["750 GB", "1 TB"];

export function runSimulation(input: SimInput): SimResult {
  const isProd = input.environment === "Production";
  const action = input.action;

  if (/^Read/i.test(action)) {
    return {
      decision: "allow", risk: "informational", policiesEvaluated: 3, passed: 3,
      reason: "Read-only observation. No mutation, no approval required.",
      detail: [{ label: "Authority", value: "Autonomous" }, { label: "Infrastructure Mutation", value: "None" }],
      policy: "Risk Classification Policy v4.0",
    };
  }

  if (/^Delete|Terminate|Destroy/i.test(action)) {
    return {
      decision: "deny", risk: "critical", policiesEvaluated: 12, passed: 9,
      reason: "Destructive action prohibited by default. Human approval cannot override a standard prohibition.",
      detail: [
        { label: "Policy", value: "Destructive Action Policy v2.1" },
        { label: "Risk", value: "Critical" },
        { label: "Human Approval", value: "Cannot override standard prohibition" },
        { label: "Required", value: "Separate explicit destructive-action policy or emergency workflow" },
        { label: "Infrastructure API Called", value: "No" },
        { label: "Credential", value: "Not issued" },
      ],
      policy: "Destructive Action Policy v2.1",
    };
  }

  if (/Allow Rule/i.test(action)) {
    return {
      decision: "approval_required", risk: "high", policiesEvaluated: 11, passed: 11,
      reason: "High-risk network change requires multi-party approval before authorization is issued.",
      detail: [
        { label: "Policy", value: "Network Change Policy v1.9" },
        { label: "Risk", value: "High" },
        { label: "Approval SLA", value: "8 hours" },
      ],
      requiredApprovers: ["Network Owner", "Security Approver", "Change Manager"],
      requiredValidation: ["Connectivity", "Security Policy", "Application Reachability", "Evidence"],
      policy: "Network Change Policy v1.9",
    };
  }

  if (/Restart Tier 1/i.test(action)) {
    return {
      decision: "deny", risk: "high", policiesEvaluated: 12, passed: 10,
      reason: "Conflict resolved in favour of the higher-specificity prohibition on Tier 1 production restart.",
      detail: [
        { label: "Policy A", value: CONFLICT_EXAMPLE.policyA },
        { label: "Policy B", value: CONFLICT_EXAMPLE.policyB },
        { label: "Conflict", value: "Detected" },
        { label: "Resolution", value: CONFLICT_EXAMPLE.resolution },
        { label: "Infrastructure API Called", value: "No" },
      ],
      policy: "Policy Precedence — Prohibited Actions",
    };
  }

  if (!isProd) {
    return {
      decision: "allow", risk: "low", policiesEvaluated: 8, passed: 8,
      reason: "Non-production baseline permits low-risk execution without human approval. Validation still required.",
      detail: [
        { label: "Policy Set", value: "Non-Production Baseline v3.4" },
        { label: "Approval", value: "Not required" },
        { label: "Validation", value: "Required" },
      ],
      requiredValidation: ["Service state", "Application health"],
      policy: "Non-Production Execution Policy v2.0",
    };
  }

  const exceedsParameter = input.requestedState === "1 TB";
  if (exceedsParameter) {
    return {
      decision: "deny", risk: "medium", policiesEvaluated: 12, passed: 11,
      reason: "Requested parameter exceeds approved package.",
      detail: [
        { label: "Approved", value: "750 GB" },
        { label: "Requested", value: "1 TB" },
        { label: "Policy", value: "Approved Package Immutability v2.3 (package-bound execution)" },
        { label: "Infrastructure API Called", value: "No" },
        { label: "Credential", value: "Not issued / action not authorized" },
      ],
      policy: "Approved Package Immutability v2.3",
    };
  }

  const noPackage = !input.packageId || /none/i.test(input.packageId);
  if (noPackage) {
    return {
      decision: "deny", risk: "medium", policiesEvaluated: 12, passed: 10,
      reason: "Production mutation requires an approved change package.",
      detail: [
        { label: "Package", value: "None" },
        { label: "Policy", value: "Production Execution Policy v3.2" },
        { label: "Infrastructure API Called", value: "No" },
      ],
      policy: "Production Execution Policy v3.2",
    };
  }

  const approvalsSatisfied = input.approvals === "3 / 3";
  if (!approvalsSatisfied) {
    return {
      decision: "approval_required", risk: "medium", policiesEvaluated: 12, passed: 11,
      reason: "Medium-risk production action requires three independent approvals before authorization.",
      detail: [
        { label: "Approvals", value: input.approvals },
        { label: "Policy", value: "Approval Policy — Medium Risk v2.8" },
        { label: "SLA", value: "4 hours" },
      ],
      requiredApprovers: ["Change Manager", "Database SME", "Infrastructure Owner"],
      policy: "Approval Policy — Medium Risk v2.8",
    };
  }

  return {
    decision: "allow", risk: "medium", policiesEvaluated: 12, passed: 12,
    reason: "Within approved scope and not prohibited.",
    detail: [
      { label: "Approval", value: "Satisfied" },
      { label: "Scope", value: "Valid" },
      { label: "Package", value: "Valid" },
      { label: "Authorization", value: "EXEC-AUTH-01842 (Valid)" },
      { label: "Identity", value: "aws-exec-prod (Scoped)" },
      { label: "Validation", value: "21 tests defined" },
      { label: "Recovery", value: "Compensating strategy available" },
    ],
    policy: "Production Execution Policy v3.2",
  };
}

export const EVALUATION_EXAMPLE = [
  { label: "Action", value: "Resize EBS Volume" },
  { label: "Target", value: "vol-0a81f2c4e7b9d1234" },
  { label: "Requested", value: "750 GB" },
  { label: "Environment", value: "Production" },
  { label: "Risk Level", value: "Medium" },
  { label: "Package", value: "CP-2026-01842 v1.0" },
  { label: "Approvals", value: "3 of 3 (Satisfied)" },
  { label: "Authorization", value: "EXEC-AUTH-01842 (Valid)" },
  { label: "Identity", value: "aws-exec-prod (Scoped)" },
  { label: "Decision", value: "Allowed by Policy" },
  { label: "Reason", value: "Within scope, approved, not prohibited" },
];

export const EXPORT_STEPS = [
  "Compiling policy library...", "Compiling policy sets...", "Compiling risk model...",
  "Compiling enforcement points...", "Compiling approval rules...", "Compiling validation rules...",
  "Compiling evaluation statistics...", "Compiling change history...", "Report prepared.",
];
