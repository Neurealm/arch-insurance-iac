/**
 * Screen 05 — Execution Center canonical (simulated) data for the approved,
 * immutable change package CP-2026-01842. No real control planes are touched.
 */

export const EXEC_PACKAGE = {
  packageId: "CP-2026-01842",
  packageVersion: "1.0",
  authorization: "EXEC-AUTH-01842",
  state: "Immutable",
  target: "SQL-PROD-07 / OrdersDB",
  environment: "Production",
  businessService: "Order Processing Service",
  criticality: "Tier 1",
  provider: "AWS",
  region: "us-east-1",
  expectedDowntime: "None expected",
  validationTests: 21,
  approvedBy: "Current Demo User",
  approvalState: "Valid",
  signature: "Valid",
  checksum: "sha256:9f2c41ab7d05e6c3f8b1a4d27e59c0836aa41f7c2b9de5013c47a8f6b25d9e10",
  artifacts: 12,
} as const;

export const VOLUME = {
  id: "vol-0a81f2c4e7b9d1234",
  before: "500 GB",
  desired: "750 GB",
  type: "gp3",
  iops: "3,000",
  throughput: "125 MB/s",
  attachment: "SQL-PROD-07",
};

export type StepDef = {
  id: number;
  name: string;
  short: string;
  caption: string;
  seconds: number;
  weight: number;
  controlPlane: "sql" | "aws" | "windows" | "app" | "orchestration";
  technology: string;
  gate: string;
  requiredEvidence: string;
  failureBehavior: string;
  recovery: string;
};

export const STEPS: StepDef[] = [
  {
    id: 1, name: "Preflight", short: "PREFLIGHT", caption: "Validate State", seconds: 8, weight: 8,
    controlPlane: "orchestration", technology: "Workflow Orchestration",
    gate: "All 14 preflight checks must pass.",
    requiredEvidence: "14/14 checks passed",
    failureBehavior: "Stop before any mutation. No control plane is contacted.",
    recovery: "No compensating action required — nothing has been changed.",
  },
  {
    id: 2, name: "Stabilize SQL", short: "STABILIZE SQL", caption: "Log Backup", seconds: 10, weight: 12,
    controlPlane: "sql", technology: "T-SQL / approved backup framework",
    gate: "Transaction-log backup must complete successfully.",
    requiredEvidence: "Backup completion + checksum",
    failureBehavior: "Stop workflow. Do not begin infrastructure mutation.",
    recovery: "Not applicable — preserve database state, collect diagnostics, investigate backup pipeline.",
  },
  {
    id: 3, name: "Validate Log Reuse", short: "VALIDATE REUSE", caption: "Confirm Log Reuse", seconds: 6, weight: 8,
    controlPlane: "sql", technology: "T-SQL",
    gate: "log_reuse_wait_desc must no longer report LOG_BACKUP.",
    requiredEvidence: "SQL DMV evidence",
    failureBehavior: "Halt before infrastructure mutation and investigate backup chain.",
    recovery: "No infrastructure changed. Investigate backup metadata / chain state.",
  },
  {
    id: 4, name: "Expand AWS EBS Volume", short: "EXPAND EBS", caption: "AWS EBS Volume", seconds: 18, weight: 26,
    controlPlane: "aws", technology: "Terraform → AWS Provider → EC2 API → EBS Control Plane",
    gate: "ModifyVolume accepted and capacity available for downstream action.",
    requiredEvidence: "AWS volume modification state",
    failureBehavior: "Stop before guest-OS action. Preserve volume state.",
    recovery: "No online shrink. Compensating strategy only — retain capacity, investigate.",
  },
  {
    id: 5, name: "Extend Windows Volume", short: "EXTEND WINDOWS", caption: "Extend L: Volume", seconds: 10, weight: 14,
    controlPlane: "windows", technology: "PowerShell / approved remote management channel",
    gate: "Windows reports expected capacity and healthy filesystem.",
    requiredEvidence: "Windows volume evidence",
    failureBehavior: "Halt. Do NOT attempt to shrink the expanded EBS volume.",
    recovery: "Retry storage discovery, inspect partition state, escalate to Windows engineering.",
  },
  {
    id: 6, name: "Validate SQL", short: "VALIDATE SQL", caption: "SQL Checks", seconds: 8, weight: 10,
    controlPlane: "sql", technology: "T-SQL",
    gate: "All required SQL read/write and state tests pass.",
    requiredEvidence: "SQL validation evidence",
    failureBehavior: "Stop. Preserve expanded infrastructure and escalate to database engineering.",
    recovery: "Diagnostics captured; infrastructure state preserved.",
  },
  {
    id: 7, name: "Validate Application", short: "VALIDATE APPLICATION", caption: "App Synthetic Test", seconds: 8, weight: 12,
    controlPlane: "app", technology: "Synthetic Monitoring / HTTP validation",
    gate: "Order Processing synthetic transaction must pass.",
    requiredEvidence: "Application validation evidence",
    failureBehavior: "Change is NOT complete. Escalate; do not roll back EBS automatically.",
    recovery: "Preserve infrastructure state, compare baseline telemetry, notify application owner.",
  },
  {
    id: 8, name: "Capture Evidence", short: "CAPTURE EVIDENCE", caption: "Collect & Reconcile", seconds: 6, weight: 10,
    controlPlane: "orchestration", technology: "Agentic orchestration",
    gate: "All required evidence collected and manifest generated.",
    requiredEvidence: "evidence-manifest.json",
    failureBehavior: "Execution cannot be declared complete without evidence.",
    recovery: "Re-run evidence collection.",
  },
];

export const PREFLIGHT_CHECKS = [
  "Validate execution authorization",
  "Verify package signature",
  "Verify package version",
  "Confirm package immutable",
  "Validate SQL-PROD-07 health",
  "Validate OrdersDB ONLINE",
  "Validate Windows health",
  "Validate EBS state",
  "Validate IAM permissions",
  "Validate monitoring",
  "Validate application baseline",
  "Validate recent backup",
  "Validate Terraform state",
  "Validate policy authorization",
];

export const TERRAFORM_DIFF = `# aws_ebs_volume.sql_prod_07_log will be updated in-place
~ resource "aws_ebs_volume" "sql_prod_07_log" {
      id          = "vol-0a81f2c4e7b9d1234"
    ~ size        = 500 -> 750
      type        = "gp3"
      iops        = 3000
      throughput  = 125
      encrypted   = true
  }

Plan: 0 to add, 1 to change, 0 to destroy.`;

export const AWS_API_CALL = `POST https://ec2.us-east-1.amazonaws.com/
Action=ModifyVolume
VolumeId=vol-0a81f2c4e7b9d1234
Size=750
VolumeType=gp3

# Response
{
  "VolumeModification": {
    "VolumeId": "vol-0a81f2c4e7b9d1234",
    "ModificationState": "modifying",
    "OriginalSize": 500,
    "TargetSize": 750,
    "Progress": 0
  }
}`;

export const AGENTS = [
  { name: "Orchestration Agent", responsibility: "Sequence gated stages", authority: "Approved Package Only", confidence: "99%" },
  { name: "SQL Execution Agent", responsibility: "Transaction-log backup and SQL state evaluation", authority: "Approved Package Only", confidence: "97%" },
  { name: "AWS Execution Agent", responsibility: "ModifyVolume on vol-0a81f2c4e7b9d1234", authority: "Approved Package Only", confidence: "96%" },
  { name: "Windows Execution Agent", responsibility: "Rescan storage and extend L:", authority: "Approved Package Only", confidence: "95%" },
  { name: "Validation Agent", responsibility: "Execute 21 validation tests", authority: "Read / Evaluate", confidence: "98%" },
  { name: "Runtime Safety Agent", responsibility: "Continuous production guardrail evaluation", authority: "May stop or pause execution", confidence: "98%" },
  { name: "Evidence Agent", responsibility: "Collect and reconcile evidence", authority: "Read / Record", confidence: "99%" },
  { name: "Policy Agent", responsibility: "Enforce Runtime-Execution-Safety-v2.1", authority: "May block execution", confidence: "99%" },
];

export const SCENARIOS = [
  { id: "success", label: "Successful Execution (Default)" },
  { id: "sql_backup_failure", label: "SQL Backup Failure" },
  { id: "log_backup_persists", label: "LOG_BACKUP Persists" },
  { id: "ebs_delay", label: "EBS Modification Delay" },
  { id: "windows_extension_failure", label: "Windows Extension Failure" },
  { id: "application_validation_failure", label: "Application Validation Failure" },
] as const;

export const STORY_STEPS = [
  { title: "Approved Package", body: "The system can execute only what was approved. Package CP-2026-01842 v1.0 is immutable and carries authorization EXEC-AUTH-01842." },
  { title: "Execution Plan", body: "Eight gated stages. Each operation requires evidence before the next begins." },
  { title: "Multi-Control-Plane Orchestration", body: "Intelligent IaC coordinates the correct execution technology for each layer: T-SQL, Terraform / EC2 API, PowerShell, synthetic monitoring." },
  { title: "Runtime Guardrails", body: "Production health is continuously evaluated while the change executes." },
  { title: "Execution Gate", body: "Command completion alone does not authorize continuation. The gate must be satisfied by evidence." },
  { title: "Failure Simulation", body: "Switch the demo scenario to Application Validation Failure to show that infrastructure success is not business success." },
  { title: "Evidence", body: "Every decision, response and validation is captured into the execution evidence record." },
  { title: "Final Verification", body: "Execution completes — final outcome verification happens in Validation & Evidence." },
];
