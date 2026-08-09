// Deterministic local model for the System Settings screen.
// Nothing here contacts real services — every value is simulated demo state.

export type SettingValue = string | number | boolean | string[];

export type SystemSetting = {
  id: string;
  category: string;
  section: string;
  name: string;
  value: SettingValue;
  defaultValue: SettingValue;
  options?: string[];
  environment?: string;
  inherited?: boolean;
  sensitive?: boolean;
  executionSensitive?: boolean;
  policyControlled?: boolean;
  policyRef?: string;
  requiresReview?: boolean;
  description?: string;
  unit?: string;
};

export type SystemHealthScenario =
  | "healthy" | "ai_failure" | "database_degraded" | "graph_failure"
  | "evidence_failure" | "runner_failure" | "backup_failure";

export type ConfigurationScenario =
  | "production_baseline" | "discovery_conservative" | "engineering_only"
  | "governed_execution" | "validation_strict" | "maintenance";

export const CATEGORIES = [
  "General", "Security & Compliance", "Execution & Runners", "Data & Storage",
  "Notifications", "AI & Model", "Discovery & Inventory", "Validation & Evidence",
  "Integrations", "Maintenance",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PLATFORM_INFO = [
  { label: "Platform Name", value: "Intelligent Infrastructure as Code" },
  { label: "Version", value: "1.0.0 (Build 2026.08.09.1)" },
  { label: "Deployment Model", value: "Customer Hosted" },
  { label: "Primary Environment", value: "Production" },
  { label: "Region", value: "us-east-1" },
  { label: "Customer Account", value: "123456789012 (Prod)" },
  { label: "Time Zone", value: "America/Chicago (CT)" },
  { label: "System Uptime", value: "21 days, 7 hours, 34 minutes" },
];

const s = (
  id: string, category: Category, section: string, name: string,
  value: SettingValue, extra: Partial<SystemSetting> = {},
): SystemSetting => ({ id, category, section, name, value, defaultValue: value, ...extra });

export const BASE_SETTINGS: SystemSetting[] = [
  // General
  s("gen.default_env", "General", "Global Platform Defaults", "Default Environment for New Items", "Non-Production", { options: ["Non-Production", "Development", "Test", "Production"] }),
  s("gen.default_risk", "General", "Global Platform Defaults", "Default Risk Classification", "Medium", { options: ["Low", "Medium", "High"], policyControlled: true, policyRef: "Risk Classification Policy v4.0", description: "Policy determines the actual risk of an action; this is only a starting default." }),
  s("gen.default_approval", "General", "Global Platform Defaults", "Default Approval Workflow", "Production — Medium Risk", { options: ["Production — Low Risk", "Production — Medium Risk", "Production — High Risk"], policyControlled: true, policyRef: "Approval Policy — Medium Risk v2.8" }),
  s("gen.default_validation", "General", "Global Platform Defaults", "Default Validation Template", "Standard Infrastructure Validation", { options: ["Standard Infrastructure Validation", "Enhanced Validation", "Database + Application"] }),
  s("gen.default_evidence", "General", "Global Platform Defaults", "Default Evidence Retention Policy", "Production — 1 Year", { options: ["Production — 1 Year", "Production — 3 Years", "Production — 7 Years"] }),
  s("gen.change_windows", "General", "Global Platform Defaults", "Enable Change Windows by Default", true),
  s("gen.enforce_tags", "General", "Global Platform Defaults", "Enforce Tags on Discovered Resources", true),
  s("gen.tag_key", "General", "Global Platform Defaults", "Default Resource Tag Key", "ManagedBy"),
  s("gen.tag_value", "General", "Global Platform Defaults", "Default Resource Tag Value", "IntelligentIaC"),
  s("beh.mfa", "General", "System Behavior", "Require MFA for All Interactive Users", true, { sensitive: true }),
  s("beh.idle", "General", "System Behavior", "Session Idle Timeout", 30, { unit: "minutes", sensitive: true }),
  s("beh.max_session", "General", "System Behavior", "Maximum Session Duration", 8, { unit: "hours", sensitive: true }),
  s("beh.autologout", "General", "System Behavior", "Auto-Logout on Role Change", true, { sensitive: true }),
  s("beh.concurrent", "General", "System Behavior", "Concurrent Sessions per User", 3),
  s("beh.package_bound", "General", "System Behavior", "Enforce Package-Bound Execution", true, { executionSensitive: true, policyControlled: true, policyRef: "Approved Package Immutability v2.3" }),
  s("beh.block_on_val", "General", "System Behavior", "Block Execution if Validation Fails", true, { executionSensitive: true, policyControlled: true, policyRef: "Production Validation Policy v3.6" }),
  s("beh.pause_discovery", "General", "System Behavior", "Pause Workflow on Critical Discovery Failure", true),
  s("beh.high_risk_approval", "General", "System Behavior", "Require Approval for High Risk Actions", true, { executionSensitive: true, policyControlled: true, policyRef: "Approval Policy — High Risk v3.1" }),
  s("beh.breakglass", "General", "System Behavior", "Enable Break-Glass Workflow", true, { sensitive: true, policyControlled: true, policyRef: "Emergency Access Policy v2.2" }),
  s("beh.breakglass_max", "General", "System Behavior", "Break-Glass Max Duration", 15, { unit: "minutes", sensitive: true }),
  s("beh.theme", "General", "System Behavior", "UI Theme", "Light", { options: ["Light", "System"] }),
  s("beh.destructive", "General", "System Behavior", "Allow Destructive Actions", false, { executionSensitive: true, policyControlled: true, policyRef: "Destructive Action Policy v2.1", description: "Prohibited by governance policy — a platform default cannot enable it." }),

  // Security & Compliance
  s("sec.sso", "Security & Compliance", "Identity", "Identity Provider", "Customer SSO (SAML / OIDC)", { sensitive: true }),
  s("sec.rbac", "Security & Compliance", "Identity", "RBAC Source", "Enterprise Directory Groups", { sensitive: true }),
  s("sec.enc_rest", "Security & Compliance", "Encryption", "Encryption at Rest", "Customer Managed Key (KMS)", { sensitive: true }),
  s("sec.enc_transit", "Security & Compliance", "Encryption", "Encryption in Transit", "TLS 1.3 Required", { sensitive: true }),
  s("sec.secret_store", "Security & Compliance", "Secrets", "Secret Store", "Customer Secret Manager / PAM", { sensitive: true, description: "Customer controlled. The platform never stores credential values." }),
  s("sec.jit", "Security & Compliance", "Secrets", "Just-In-Time Credential Issuance", true, { sensitive: true }),
  s("sec.standing", "Security & Compliance", "Secrets", "Standing Agent Credentials", false, { sensitive: true, policyControlled: true, policyRef: "Least Privilege Policy v2.5" }),
  s("sec.secrets_in_ai", "Security & Compliance", "Secrets", "Secret Values in AI Context", false, { sensitive: true, policyControlled: true, policyRef: "Least Privilege Policy v2.5" }),
  s("sec.audit", "Security & Compliance", "Audit", "Audit Logging", true, { sensitive: true }),
  s("sec.audit_immutable", "Security & Compliance", "Audit", "Immutable Audit Store", true, { sensitive: true }),
  s("sec.siem", "Security & Compliance", "Audit", "SIEM Forwarding", true),
  s("sec.access_review", "Security & Compliance", "Audit", "Access Review Cadence", "Quarterly", { options: ["Monthly", "Quarterly", "Semi-Annual"] }),

  // Execution & Runners
  s("exec.package_bound", "Execution & Runners", "Execution Controls", "Package-Bound Execution", true, { executionSensitive: true }),
  s("exec.auth_required", "Execution & Runners", "Execution Controls", "Authorization Required", true, { executionSensitive: true }),
  s("exec.jit_cred", "Execution & Runners", "Execution Controls", "JIT Credential at Execution", true, { executionSensitive: true }),
  s("exec.runtime_safety", "Execution & Runners", "Execution Controls", "Runtime Safety Evaluation Interval", 3, { unit: "seconds", executionSensitive: true }),
  s("exec.prod_execution", "Execution & Runners", "Execution Controls", "Production Execution", "Policy Governed", { options: ["Policy Governed", "Disabled"], executionSensitive: true }),
  s("exec.action_autoupdate", "Execution & Runners", "Action Library", "Action Library Auto-Update", false),
  s("exec.action_vendor", "Execution & Runners", "Action Library", "New Vendor Actions", "Require Review", { options: ["Require Review", "Auto Accept"] }),
  s("exec.action_default", "Execution & Runners", "Action Library", "New Actions Default", "Engineering Only", { options: ["Engineering Only", "Production Eligible"] }),
  s("exec.action_prod", "Execution & Runners", "Action Library", "Production Eligibility", "Explicit Approval Required", { options: ["Explicit Approval Required"] }),
  s("exec.action_pinning", "Execution & Runners", "Action Library", "Action Version Pinning", true),
  s("exec.action_deprecated", "Execution & Runners", "Action Library", "Deprecated Actions", "Blocked after policy-defined period", { options: ["Blocked after policy-defined period", "Warn only"] }),

  // Data & Storage
  s("data.audit_ret", "Data & Storage", "Data Retention & Purging", "Audit Log Retention", "1 Year", { options: ["1 Year", "3 Years", "7 Years"], sensitive: true }),
  s("data.exec_ret", "Data & Storage", "Data Retention & Purging", "Execution Evidence Retention", "1 Year", { options: ["1 Year", "3 Years", "7 Years"], sensitive: true }),
  s("data.pkg_ret", "Data & Storage", "Data Retention & Purging", "Change Package Retention", "90 Days", { options: ["90 Days", "1 Year", "3 Years"] }),
  s("data.disc_ret", "Data & Storage", "Data Retention & Purging", "Discovery Data Retention", "30 Days", { options: ["30 Days", "90 Days", "1 Year"] }),
  s("data.tel_ret", "Data & Storage", "Data Retention & Purging", "Telemetry Data Retention", "30 Days", { options: ["30 Days", "90 Days"] }),
  s("data.backup", "Data & Storage", "Backup & Recovery", "Backup Schedule", "Every 12 hours", { options: ["Every 6 hours", "Every 12 hours", "Daily"] }),
  s("data.dr", "Data & Storage", "Backup & Recovery", "DR Mode", "Warm Standby", { options: ["Warm Standby", "Backup Restore"] }),
  s("data.backup_ret", "Data & Storage", "Backup & Recovery", "Backup Retention", "30 Days", { options: ["14 Days", "30 Days", "90 Days"] }),

  // Notifications
  s("notif.channel", "Notifications", "Channels", "Primary Channel", "Collaboration (Teams)", { options: ["Collaboration (Teams)", "Email", "ITSM", "Webhook"] }),
  s("notif.approval", "Notifications", "Channels", "Approval Notifications", true),
  s("notif.exec", "Notifications", "Channels", "Execution Notifications", true),
  s("notif.halt", "Notifications", "Channels", "Runtime Halt Notifications", true),
  s("notif.health", "Notifications", "Channels", "System Health Notifications", true),
  s("notif.digest", "Notifications", "Channels", "Daily Governance Digest", true),

  // AI & Model
  s("ai.primary", "AI & Model", "Inference", "Primary Endpoint", "Customer-Hosted Gateway", { sensitive: true }),
  s("ai.fallback", "AI & Model", "Inference", "Fallback Endpoint", "Configured", { sensitive: true }),
  s("ai.failover", "AI & Model", "Inference", "Automatic Failover", true),
  s("ai.threshold", "AI & Model", "Inference", "Failure Threshold", 3, { unit: "consecutive failures" }),
  s("ai.prod_access", "AI & Model", "Trust Boundary", "Direct AI Production Access", false, { sensitive: true, policyControlled: true, policyRef: "Production Execution Policy v3.2", description: "The model never holds production credentials or execution authority." }),
  s("ai.credentials", "AI & Model", "Trust Boundary", "AI Access to Credentials", false, { sensitive: true, policyControlled: true, policyRef: "Least Privilege Policy v2.5" }),
  s("ai.exec_if_down", "AI & Model", "Trust Boundary", "Allow Execution if AI Unavailable", "Approved deterministic packages only", { options: ["Approved deterministic packages only", "Blocked"] }),
  s("ai.retention", "AI & Model", "Trust Boundary", "Prompt / Context Retention", "30 Days", { options: ["7 Days", "30 Days", "90 Days"], sensitive: true }),

  // Discovery & Inventory
  s("disc.schedule", "Discovery & Inventory", "Discovery", "Discovery Schedule", 5, { unit: "minutes" }),
  s("disc.event", "Discovery & Inventory", "Discovery", "Event-Driven Discovery", true),
  s("disc.stale", "Discovery & Inventory", "Discovery", "Stale Asset Threshold", 30, { unit: "minutes" }),
  s("disc.recon", "Discovery & Inventory", "Digital Twin", "Relationship Reconciliation", 15, { unit: "minutes" }),
  s("disc.versioning", "Discovery & Inventory", "Digital Twin", "Asset Versioning", true),
  s("disc.history", "Discovery & Inventory", "Digital Twin", "Historical State", true),
  s("disc.rel_version", "Discovery & Inventory", "Digital Twin", "Relationship Versioning", true),
  s("disc.confidence", "Discovery & Inventory", "Digital Twin", "Confidence Scoring", true),
  s("disc.provenance", "Discovery & Inventory", "Digital Twin", "Provenance", "Required", { options: ["Required", "Optional"] }),
  s("disc.service_map", "Discovery & Inventory", "Digital Twin", "Business Service Mapping", true),
  s("disc.drift", "Discovery & Inventory", "Digital Twin", "Drift Detection", true),
  s("disc.autorecon", "Discovery & Inventory", "Digital Twin", "Auto-Reconcile After Execution", true),
  s("disc.preserve", "Discovery & Inventory", "Digital Twin", "Preserve Last Known State", true),

  // Validation & Evidence
  s("val.mandatory", "Validation & Evidence", "Validation", "Mandatory Test Pass Rate", "100%", { options: ["100%", "95%"], executionSensitive: true }),
  s("val.tier1", "Validation & Evidence", "Validation", "Tier 1 Application Validation", "Required", { options: ["Required", "Optional"], executionSensitive: true }),
  s("val.business", "Validation & Evidence", "Validation", "Business Service Validation", "Required", { options: ["Required", "Optional"] }),
  s("val.window", "Validation & Evidence", "Validation", "Observation Window", 15, { unit: "minutes" }),
  s("val.critical_alert", "Validation & Evidence", "Validation", "Critical Alert Behavior", "Blocks Closure", { options: ["Blocks Closure", "Warn"] }),
  s("val.new_warning", "Validation & Evidence", "Validation", "New Warning Behavior", "Requires Review", { options: ["Requires Review", "Informational"] }),
  s("ev.runner_logs", "Validation & Evidence", "Evidence Capture", "Capture Runner Logs", true),
  s("ev.control_plane", "Validation & Evidence", "Evidence Capture", "Capture Control Plane Response", true),
  s("ev.pre", "Validation & Evidence", "Evidence Capture", "Capture Pre-State", true),
  s("ev.post", "Validation & Evidence", "Evidence Capture", "Capture Post-State", true),
  s("ev.validation", "Validation & Evidence", "Evidence Capture", "Capture Validation Output", true),
  s("ev.approval", "Validation & Evidence", "Evidence Capture", "Capture Approval Chain", true),
  s("ev.policy", "Validation & Evidence", "Evidence Capture", "Capture Policy Trace", true),
  s("ev.authz", "Validation & Evidence", "Evidence Capture", "Capture Authorization", true),
  s("ev.metrics", "Validation & Evidence", "Evidence Capture", "Capture Business Service Metrics", "Tier 1 Required", { options: ["Tier 1 Required", "All", "Optional"] }),
  s("ev.hash", "Validation & Evidence", "Evidence Capture", "Hash Evidence (SHA-256)", true),
  s("ev.immutable", "Validation & Evidence", "Evidence Capture", "Immutable Evidence Store", true, { sensitive: true }),

  // Integrations
  s("int.default_mode", "Integrations", "Integration Defaults", "New Integrations Default Mode", "Discovery Only", { options: ["Discovery Only", "Discovery + Execution"], executionSensitive: true }),
  s("int.validate", "Integrations", "Integration Defaults", "Require Credential Validation on Save", true),
  s("int.timeout", "Integrations", "Integration Defaults", "Default Connector Timeout", 60, { unit: "seconds" }),
  s("int.retry", "Integrations", "Integration Defaults", "Retry Attempts on Failure", 3),
  s("int.health", "Integrations", "Integration Defaults", "Health Check Interval", 5, { unit: "minutes" }),
  s("int.git", "Integrations", "Change Engineering", "Require Git Pull Request", true, { executionSensitive: true }),
  s("int.iac", "Integrations", "Change Engineering", "Preferred IaC", "Terraform", { options: ["Terraform", "Bicep", "CloudFormation"] }),
  s("int.api_equiv", "Integrations", "Change Engineering", "Generate API Equivalent", true),
  s("int.precheck", "Integrations", "Change Engineering", "Generate Precheck", true),
  s("int.postcheck", "Integrations", "Change Engineering", "Generate Postcheck", true),
  s("int.recovery", "Integrations", "Change Engineering", "Generate Recovery Plan", true),

  // Maintenance
  s("mnt.channel", "Maintenance", "Platform Release", "Release Channel", "Stable", { options: ["Stable", "Preview"] }),
  s("mnt.auto", "Maintenance", "Platform Release", "Automatic Platform Updates", false, { sensitive: true }),
  s("mnt.model", "Maintenance", "Platform Release", "Update Model", "Customer Controlled", { options: ["Customer Controlled"] }),
  s("mnt.signed", "Maintenance", "Platform Release", "Signed Release Required", true, { sensitive: true }),
  s("mnt.nonprod", "Maintenance", "Platform Release", "Non-Production Validation Required", true),
  s("mnt.prod_approval", "Maintenance", "Platform Release", "Production Deployment Approval", "Required", { options: ["Required"] }),
  s("mnt.maintenance_mode", "Maintenance", "Maintenance Mode", "Maintenance Mode", false, { executionSensitive: true }),
];

/* ── health ─────────────────────────────────────────────────── */

export interface HealthRow { label: string; value: string; state: "healthy" | "warning" | "degraded" | "failed" }

export const HEALTH_SCENARIOS: { id: SystemHealthScenario; label: string }[] = [
  { id: "healthy", label: "All Systems Healthy" },
  { id: "ai_failure", label: "AI Endpoint Failure" },
  { id: "database_degraded", label: "Operational DB Degraded" },
  { id: "graph_failure", label: "Graph Store Failure" },
  { id: "evidence_failure", label: "Evidence Store Failure" },
  { id: "runner_failure", label: "Terraform Runner Pool Failure" },
  { id: "backup_failure", label: "Backup Failure" },
];

export function healthRows(scenario: SystemHealthScenario): HealthRow[] {
  const ok = (label: string, value = "Healthy"): HealthRow => ({ label, value, state: "healthy" });
  const rows: HealthRow[] = [
    ok("Control Plane"), ok("Operational Database"), ok("Graph Store"), ok("Evidence Store"),
    ok("Message Queue"), ok("Cache"), ok("Policy Engine"), ok("Validation Engine"),
    ok("AI Inference Endpoint"),
    { label: "Runners", value: "11 / 11 Online", state: "healthy" },
    { label: "Connectors", value: "18 / 18 Online", state: "healthy" },
    ok("Backup"), { label: "DR", value: "Ready", state: "healthy" },
  ];
  const set = (label: string, value: string, state: HealthRow["state"]) => {
    const r = rows.find((x) => x.label === label);
    if (r) { r.value = value; r.state = state; }
  };
  if (scenario === "ai_failure") set("AI Inference Endpoint", "Unavailable", "failed");
  if (scenario === "database_degraded") set("Operational Database", "Degraded", "degraded");
  if (scenario === "graph_failure") set("Graph Store", "Failed", "failed");
  if (scenario === "evidence_failure") set("Evidence Store", "Unavailable", "failed");
  if (scenario === "runner_failure") set("Runners", "8 / 11 Online (Terraform pool 0/3)", "degraded");
  if (scenario === "backup_failure") { set("Backup", "Failed", "failed"); set("DR", "At Risk", "warning"); }
  return rows;
}

export function overallHealth(scenario: SystemHealthScenario) {
  if (scenario === "healthy") return { label: "ALL SYSTEMS OPERATIONAL", tone: "ok" as const };
  if (scenario === "backup_failure") return { label: "DEGRADED — DATA PROTECTION", tone: "warn" as const };
  if (scenario === "runner_failure" || scenario === "database_degraded") return { label: "DEGRADED — REDUCED CAPABILITY", tone: "warn" as const };
  return { label: "DEGRADED — CAPABILITY BLOCKED", tone: "bad" as const };
}

export interface CapabilityImpact { capability: string; state: "Available" | "Degraded" | "Blocked" | "Unavailable"; reason: string }

export function capabilityImpact(scenario: SystemHealthScenario): CapabilityImpact[] {
  const base: CapabilityImpact[] = [
    { capability: "Asset Digital Twin", state: "Available", reason: "Graph store healthy" },
    { capability: "Discovery", state: "Available", reason: "Connectors online" },
    { capability: "Remediation Intelligence", state: "Available", reason: "AI endpoint healthy" },
    { capability: "Change Engineering", state: "Available", reason: "AI endpoint and graph healthy" },
    { capability: "Approval", state: "Available", reason: "Policy engine healthy" },
    { capability: "Production Execution", state: "Available", reason: "Runners online, evidence capture available" },
    { capability: "Validation", state: "Available", reason: "Validation engine healthy" },
    { capability: "Change Closure", state: "Available", reason: "Evidence store healthy" },
  ];
  const set = (cap: string, state: CapabilityImpact["state"], reason: string) => {
    const r = base.find((x) => x.capability === cap);
    if (r) { r.state = state; r.reason = reason; }
  };
  switch (scenario) {
    case "ai_failure":
      set("Remediation Intelligence", "Unavailable", "New AI reasoning unavailable");
      set("Change Engineering", "Unavailable", "New package generation requires inference");
      set("Production Execution", "Available", "Approved deterministic packages may still execute if policy allows");
      break;
    case "database_degraded":
      set("Change Engineering", "Blocked", "New workflow creation blocked");
      set("Approval", "Degraded", "Workflow state writes degraded");
      set("Production Execution", "Degraded", "Active execution handled per policy-safe path");
      break;
    case "graph_failure":
      set("Asset Digital Twin", "Degraded", "Relationship queries unavailable");
      set("Remediation Intelligence", "Degraded", "Dependency context unavailable");
      set("Change Engineering", "Blocked", "Blocked for dependency-sensitive changes");
      set("Production Execution", "Available", "Approved immutable package carries required context");
      break;
    case "evidence_failure":
      set("Production Execution", "Blocked", "Evidence capture required by Change Evidence Policy v2.4");
      set("Validation", "Degraded", "Available but evidence cannot be finalized");
      set("Change Closure", "Blocked", "Evidence package cannot be sealed");
      break;
    case "runner_failure":
      set("Production Execution", "Degraded", "AWS IaC execution blocked — Terraform runner pool offline");
      break;
    case "backup_failure":
      set("Production Execution", "Degraded", "Recovery point verification unavailable for backup-dependent changes");
      break;
    default: break;
  }
  return base;
}

export const DIAGNOSTICS = [
  { component: "Control Plane API", version: "1.0.0", state: "Healthy", latency: "42 ms", lastCheck: "1 min ago", dependency: "Operational Database" },
  { component: "Digital Twin Graph", version: "1.0.0", state: "Healthy", latency: "18 ms (query)", lastCheck: "1 min ago", dependency: "Graph Store" },
  { component: "Policy Engine", version: "1.0.0", state: "Healthy", latency: "27 ms (P95 eval)", lastCheck: "2 min ago", dependency: "Policy Store" },
  { component: "Execution Orchestrator", version: "1.0.0", state: "Healthy", latency: "0 active workflows", lastCheck: "1 min ago", dependency: "Queue / Runners" },
  { component: "Validation Engine", version: "1.0.0", state: "Healthy", latency: "63 ms", lastCheck: "2 min ago", dependency: "Connectors" },
  { component: "Evidence Service", version: "1.0.0", state: "Healthy", latency: "35 ms", lastCheck: "2 min ago", dependency: "Object Store" },
  { component: "AI Endpoint", version: "gateway-2026.07", state: "Healthy", latency: "310 ms", lastCheck: "3 min ago", dependency: "Customer AI Gateway" },
  { component: "Audit Store", version: "1.0.0", state: "Healthy", latency: "22 ms", lastCheck: "4 min ago", dependency: "Immutable Storage" },
];

export const LICENSE_USAGE = [
  { label: "License Edition", value: "Enterprise" },
  { label: "Licensed Modules", value: "All Demo Modules" },
  { label: "Assets Managed", value: "4,287" },
  { label: "Active Users", value: "86" },
  { label: "Connected Integrations", value: "18" },
  { label: "Execution Runners", value: "11" },
  { label: "API Calls (24h)", value: "128,942" },
  { label: "Policy Evaluations (24h)", value: "1,842" },
  { label: "Change Packages (30d)", value: "164" },
  { label: "Execution Transactions (30d)", value: "71" },
  { label: "Validation Tests (30d)", value: "2,418" },
  { label: "Evidence Storage", value: "1.24 TB" },
];

export const USAGE_BY_CAPABILITY = [
  { capability: "Digital Twin", count: "412,880 reconciliations", trend: "+4%" },
  { capability: "Remediation Intelligence", count: "318 diagnoses", trend: "+11%" },
  { capability: "Change Engineering", count: "164 packages", trend: "+8%" },
  { capability: "Execution", count: "71 transactions", trend: "+3%" },
  { capability: "Validation", count: "2,418 tests", trend: "+9%" },
  { capability: "Integrations", count: "128,942 API calls", trend: "+2%" },
  { capability: "Policy Evaluations", count: "1,842 decisions", trend: "+6%" },
  { capability: "AI Inference", count: "1,204 requests", trend: "+14%" },
];

export const RELEASE_INFO = [
  { label: "Current Version", value: "1.0.0" },
  { label: "Current Build", value: "2026.08.09.1" },
  { label: "Release Channel", value: "Stable" },
  { label: "Automatic Platform Updates", value: "Disabled" },
  { label: "Update Model", value: "Customer Controlled" },
  { label: "Signed Release Required", value: "Yes" },
  { label: "Non-Production Validation Required", value: "Yes" },
  { label: "Production Deployment Approval", value: "Required" },
];

export const UPDATE_CHECK_STEPS = [
  "Checking release channel...", "Validating release manifest...", "Checking compatibility...",
  "Checking connector versions...", "Checking runner versions...", "Checking database migration requirements...",
];

export const UPDATE_WORKFLOW = [
  "Service Team Release", "Signed Artifact", "Customer Review", "Non-Production Deployment",
  "Platform Validation", "Customer Approval", "Production Deployment", "Post-Upgrade Validation", "Evidence",
];

export const SAVE_STEPS = [
  "Validating settings...", "Checking dependencies...", "Checking policy compatibility...",
  "Checking active workflows...", "Checking runner compatibility...", "Checking integration dependencies...",
  "Validation complete.",
];

export const PRECEDENCE = [
  "Security Prohibition", "Governance Policy", "Environment Policy", "Technology Policy",
  "Change Package", "System Defaults", "User Preference",
];

export const INHERITANCE_CHAIN = [
  { level: "Platform Default", value: "Standard Validation" },
  { level: "Environment (Production)", value: "Enhanced Validation" },
  { level: "Technology Domain (SQL)", value: "Database + Application" },
  { level: "Action Template", value: "Capacity Expansion Template" },
  { level: "Change Package (CP-2026-01842)", value: "21-Test Validation Plan" },
];

export const ENVIRONMENTS = ["Global", "Development", "Test", "Non-Production", "Production"];

export const ENV_OVERRIDES = [
  { setting: "Validation Observation Window", global: "15 min", production: "30 min", nonprod: "5 min" },
  { setting: "Discovery Schedule", global: "5 min", production: "5 min", nonprod: "15 min" },
  { setting: "Approval Requirement", global: "Risk based", production: "Required", nonprod: "Not required" },
  { setting: "Evidence Retention", global: "1 Year", production: "1 Year", nonprod: "90 Days" },
];

export const SQL_EBS_CONFIG = [
  { label: "Discovery Schedule", value: "5 min" },
  { label: "AWS Connector", value: "Enabled" },
  { label: "SQL Discovery", value: "Enabled" },
  { label: "Windows Discovery", value: "Enabled" },
  { label: "Digital Twin Reconciliation", value: "15 min" },
  { label: "Default Risk", value: "Medium" },
  { label: "Production Approval", value: "Required" },
  { label: "Package-Bound Execution", value: "Enabled" },
  { label: "Terraform", value: "Preferred IaC" },
  { label: "PowerShell", value: "Allowed" },
  { label: "T-SQL", value: "Allowed" },
  { label: "AWS Execution Runner", value: "Online" },
  { label: "SQL Runner", value: "Online" },
  { label: "PowerShell Runner", value: "Online" },
  { label: "Production Validation", value: "Required" },
  { label: "Application Validation (Tier 1)", value: "Required" },
  { label: "Evidence", value: "Required" },
  { label: "Observation Window", value: "15 min" },
  { label: "Customer Secrets", value: "Required" },
  { label: "Direct AI Production Access", value: "Disabled" },
];

export const STAGE_TRACE: { stage: string; settings: { label: string; value: string }[] }[] = [
  { stage: "Asset Digital Twin", settings: [
    { label: "Discovery", value: "Every 5 min" }, { label: "Relationship Reconciliation", value: "Every 15 min" },
    { label: "Preserve Last Known State", value: "Enabled" }, { label: "Drift Detection", value: "Enabled" }] },
  { stage: "Remediation Intelligence", settings: [
    { label: "AI Endpoint", value: "Customer-hosted gateway" }, { label: "Direct Production Access", value: "Disabled" },
    { label: "Telemetry Window", value: "24 hours" }, { label: "Default Risk", value: "Medium" }] },
  { stage: "Change Engineering", settings: [
    { label: "Preferred IaC", value: "Terraform" }, { label: "Generate Precheck", value: "Enabled" },
    { label: "Generate Postcheck", value: "Enabled" }, { label: "Generate Recovery", value: "Enabled" },
    { label: "Git PR", value: "Required" }] },
  { stage: "Approval", settings: [
    { label: "Production Approval", value: "Required" }, { label: "Workflow", value: "Production — Medium Risk" },
    { label: "Self Approval", value: "Prohibited" }, { label: "SLA", value: "4 hours" }] },
  { stage: "Execution", settings: [
    { label: "Package Bound", value: "Enabled" }, { label: "Authorization Required", value: "Enabled" },
    { label: "JIT Credential", value: "Enabled" }, { label: "Runtime Safety", value: "3 sec" }] },
  { stage: "Validation", settings: [
    { label: "Mandatory Tests", value: "100%" }, { label: "Tier 1 App Validation", value: "Required" },
    { label: "Evidence", value: "Required" }, { label: "Observation", value: "15 min" }] },
];

export const CONFIG_SCENARIOS: { id: ConfigurationScenario; label: string; purpose: string; changes: { id: string; value: SettingValue }[]; banner?: string }[] = [
  { id: "production_baseline", label: "Production Baseline", purpose: "Default governed operating configuration.", changes: [] },
  { id: "discovery_conservative", label: "Discovery Conservative", purpose: "Low-intrusion onboarding.", banner: "LOW-INTRUSION ONBOARDING",
    changes: [{ id: "disc.schedule", value: 15 }, { id: "disc.event", value: false }, { id: "disc.stale", value: 60 }, { id: "exec.prod_execution", value: "Disabled" }] },
  { id: "engineering_only", label: "Engineering Only", purpose: "Full reasoning and code generation without infrastructure mutation.", banner: "ENGINEERING WITHOUT MUTATION",
    changes: [{ id: "exec.prod_execution", value: "Disabled" }, { id: "int.git", value: true }, { id: "int.default_mode", value: "Discovery Only" }] },
  { id: "governed_execution", label: "Governed Execution", purpose: "Operating mode supporting the SQL/EBS demonstration.", banner: "GOVERNED EXECUTION ENABLED",
    changes: [{ id: "exec.prod_execution", value: "Policy Governed" }, { id: "exec.package_bound", value: true }, { id: "exec.auth_required", value: true }, { id: "exec.jit_cred", value: true }, { id: "val.tier1", value: "Required" }] },
  { id: "validation_strict", label: "Validation Strict", purpose: "Closure requirements increased.", banner: "CLOSURE REQUIREMENTS INCREASED",
    changes: [{ id: "val.window", value: 30 }, { id: "val.tier1", value: "Required" }, { id: "val.business", value: "Required" }, { id: "val.mandatory", value: "100%" }, { id: "val.critical_alert", value: "Blocks Closure" }, { id: "val.new_warning", value: "Requires Review" }] },
  { id: "maintenance", label: "Maintenance Mode", purpose: "New production executions blocked; visibility preserved.", banner: "MAINTENANCE MODE",
    changes: [{ id: "mnt.maintenance_mode", value: true }, { id: "exec.prod_execution", value: "Disabled" }] },
];

export const SCHEDULES = [
  { task: "Discovery", schedule: "Every 5 minutes", last: "12:57 PM", next: "1:02 PM", status: "Healthy", owner: "Platform" },
  { task: "Relationship Reconciliation", schedule: "Every 15 minutes", last: "12:45 PM", next: "1:00 PM", status: "Healthy", owner: "Platform" },
  { task: "Evidence Integrity", schedule: "Daily 02:00", last: "Today 02:00 AM", next: "Tomorrow 02:00 AM", status: "Healthy", owner: "Governance" },
  { task: "Backup", schedule: "Every 12 hours", last: "Today 11:45 AM", next: "Today 10:45 PM", status: "Successful", owner: "Platform" },
  { task: "DR Check", schedule: "Monthly", last: "Aug 01, 2026", next: "Sep 01, 2026", status: "Completed", owner: "Platform" },
  { task: "Certificate Check", schedule: "Weekly", last: "Aug 05, 2026", next: "Aug 12, 2026", status: "Healthy", owner: "Security" },
  { task: "Credential Rotation Check", schedule: "Weekly", last: "Aug 06, 2026", next: "Aug 13, 2026", status: "Healthy", owner: "Security" },
  { task: "Access Review", schedule: "Quarterly", last: "Jul 01, 2026", next: "Oct 01, 2026", status: "Scheduled", owner: "Governance" },
  { task: "Platform Health Check", schedule: "Every 1 minute", last: "12:59 PM", next: "1:00 PM", status: "Healthy", owner: "Platform" },
  { task: "Workflow Cleanup", schedule: "Daily 02:00", last: "Today 02:00 AM", next: "Tomorrow 02:00 AM", status: "Healthy", owner: "Platform" },
  { task: "Policy Cache Refresh", schedule: "Every 5 minutes", last: "12:57 PM", next: "1:02 PM", status: "Healthy", owner: "Governance" },
];

export const FEATURES = [
  { id: "twin", name: "Digital Twin", description: "Asset discovery, modeling and reconciliation", enabled: true, dependents: ["Remediation Intelligence", "Change Engineering", "Validation"] },
  { id: "remediation", name: "Remediation Intelligence", description: "AI-driven diagnosis and recommendations", enabled: true, dependents: ["Change Engineering"] },
  { id: "engineering", name: "Change Engineering", description: "Generate IaC, scripts and remediation packages", enabled: true, dependents: ["Execution Orchestration"] },
  { id: "execution", name: "Execution Orchestration", description: "Orchestrate and execute approved changes", enabled: true, dependents: ["Validation & Evidence"] },
  { id: "validation", name: "Validation & Evidence", description: "Validate outcomes and collect evidence", enabled: true, dependents: ["Change Closure"] },
  { id: "agentic", name: "Agentic Workflows", description: "Autonomous and semi-autonomous workflows", enabled: false, beta: true, dependents: [] },
];

export const READINESS = [
  { area: "General", pct: 100 }, { area: "Security", pct: 100 }, { area: "Execution", pct: 100 },
  { area: "Data", pct: 100 }, { area: "AI", pct: 100 }, { area: "Discovery", pct: 92 },
  { area: "Engineering", pct: 100 }, { area: "Validation", pct: 100 }, { area: "Integrations", pct: 89 },
  { area: "Maintenance", pct: 100 },
];

export const READINESS_OUTSTANDING = [
  "Azure Discovery — Not configured", "GCP Discovery — Not configured", "Network Runner — Disabled",
];

export const PILOT_READINESS = [
  "Digital Twin", "SQL Discovery", "AWS Discovery", "Windows Discovery", "AI Endpoint", "Terraform",
  "SQL Runner", "PowerShell Runner", "AWS Runner", "Package Bound", "Approval", "Validation", "Evidence",
];

export const RUNNERS = [
  { name: "Terraform Runner Pool", online: 3, total: 3, scope: "Approved IaC package only" },
  { name: "PowerShell Runner Pool", online: 2, total: 2, scope: "Approved Windows administration" },
  { name: "SQL Runner Pool", online: 2, total: 2, scope: "Approved database actions" },
  { name: "Validation Runner Pool", online: 2, total: 2, scope: "Technical and synthetic validation" },
  { name: "API Connector Pool", online: 2, total: 2, scope: "Infrastructure control-plane APIs" },
];

export const CHANGE_LOG_SEED = [
  { time: "12:42 PM", actor: "jane.smith", section: "Validation", setting: "Observation Window", prev: "15 min", next: "30 min", reason: "Extended Tier 1 validation", status: "Applied", sensitivity: "Operational", evidence: "CFG-EV-00318" },
  { time: "11:18 AM", actor: "sec.admin", section: "Security", setting: "Break-Glass Max Duration", prev: "30 min", next: "15 min", reason: "Reduced emergency exposure window", status: "Applied", sensitivity: "Security Sensitive", evidence: "CFG-EV-00317" },
  { time: "09:04 AM", actor: "platform.admin", section: "Discovery", setting: "Discovery Schedule", prev: "15 min", next: "5 min", reason: "Pilot freshness requirement", status: "Applied", sensitivity: "Operational", evidence: "CFG-EV-00316" },
];

export const CONFIG_SNAPSHOT = [
  { label: "Last Snapshot", value: "Today 12:30 PM" },
  { label: "Configuration Version", value: "CFG-2026-081" },
  { label: "Integrity", value: "Verified" },
  { label: "Secrets", value: "Excluded" },
  { label: "Credential Values", value: "Excluded" },
  { label: "Authorization Tokens", value: "Excluded" },
];

export const DEMO_STORY = [
  { title: "Platform Defaults", body: "Customer-hosted instance, version and global defaults are explicit — not hidden SaaS behavior.", tab: "General" as Category },
  { title: "Trust Boundary", body: "Direct AI production access is disabled and cannot be enabled by a platform default.", tab: "AI & Model" as Category },
  { title: "Discovery", body: "Asset freshness is controlled by discovery schedule, event-driven updates and stale thresholds.", tab: "Discovery & Inventory" as Category },
  { title: "Engineering", body: "Terraform is the preferred IaC, with generated precheck, postcheck and recovery artifacts and a required Git pull request.", tab: "Integrations" as Category },
  { title: "Execution", body: "Runners execute only package-bound actions with authorization and JIT credentials.", tab: "Execution & Runners" as Category },
  { title: "Validation", body: "Tier 1 business-service outcome verification is required before closure.", tab: "Validation & Evidence" as Category },
  { title: "AI", body: "The model holds no credentials and no infrastructure authority; failover is deterministic.", tab: "AI & Model" as Category },
  { title: "Resilience", body: "Evidence Store failure blocks production execution safely while discovery and engineering continue.", tab: "General" as Category, health: "evidence_failure" as SystemHealthScenario },
  { title: "SQL/EBS Configuration", body: "These are the exact settings that enabled CP-2026-01842.", tab: "General" as Category },
  { title: "Governance Precedence", body: "Policies override platform defaults. A default cannot weaken an enforced prohibition.", tab: "General" as Category },
];

export function sensitivityOf(setting: SystemSetting): "Low Impact" | "Operational" | "Security Sensitive" | "Execution Sensitive" {
  if (setting.executionSensitive) return "Execution Sensitive";
  if (setting.sensitive) return "Security Sensitive";
  if (setting.category === "General" || setting.category === "Notifications") return "Low Impact";
  return "Operational";
}
