/**
 * Screen 04 — Change Review & Approval canonical demo data.
 *
 * Presentation-only. Nothing here executes anything; it describes the
 * engineered package CP-2026-01842 handed over from Change Engineering.
 */

export const PACKAGE_ID = "CP-2026-01842";
export const EXEC_AUTH_TOKEN = "EXEC-AUTH-01842";
export const POLICY_NAME = "Production-Change-Policy-v3.2";
export const PACKAGE_CHECKSUM =
  "sha256:9f2c41a7be03d5e8c17b4a6d02f9e3ab5c7d1084ef62a93bd4157cc0e8a72b16";

export type Risk = "Low" | "Moderate" | "High";

export const summary = {
  target: "SQL-PROD-07 / OrdersDB",
  targetSub: "Primary / Production",
  businessService: "Order Processing Service",
  tier: "Tier 1",
  throughput: "~3,450 transactions / min",
  objective:
    "Restore SQL transaction log reuse and increase transaction-log capacity headroom.",
  proposedActions: [
    "Execute transaction log backup",
    "Validate log reuse",
    "Expand AWS EBS: 500 GB → 750 GB",
    "Extend Windows L:: 500 GB → 750 GB",
    "Validate SQL and application",
  ],
  expectedOutcome: [
    "LOG_BACKUP condition cleared",
    "Additional 250 GB infrastructure capacity",
    "Transaction log capacity risk stabilized",
    "Order Processing Service remains available",
  ],
  downtime: "None",
  downtimeSub:
    "No service interruption expected based on current engineering analysis.",
};

export type ReadinessLine = {
  label: string;
  value: string;
  ok: boolean;
  evidence: { check: string; observed: string; expected: string; source: string; timestamp: string; confidence: string };
};

export const readinessLines: ReadinessLine[] = [
  {
    label: "Preflight Checks",
    value: "14 / 14 Passed",
    ok: true,
    evidence: { check: "Preflight suite", observed: "14 passed, 0 failed", expected: "14 passed", source: "Preflight Agent", timestamp: "2 min ago", confidence: "High" },
  },
  {
    label: "Policy Checks",
    value: "18 / 18 Passed",
    ok: true,
    evidence: { check: "Policy evaluation", observed: "18 controls passed", expected: "18 controls passed", source: POLICY_NAME, timestamp: "3 min ago", confidence: "High" },
  },
  {
    label: "Validation Tests Prepared",
    value: "21",
    ok: true,
    evidence: { check: "Validation plan", observed: "21 tests across 4 domains", expected: "≥ 12 tests", source: "Validation Agent", timestamp: "4 min ago", confidence: "High" },
  },
  {
    label: "Destructive Changes",
    value: "0",
    ok: true,
    evidence: { check: "Terraform plan analysis", observed: "0 destroy operations", expected: "0", source: "Terraform Plan", timestamp: "4 min ago", confidence: "High" },
  },
  {
    label: "Resources Destroyed",
    value: "0",
    ok: true,
    evidence: { check: "Plan resource delta", observed: "0 to add, 1 to change, 0 to destroy", expected: "0 destroyed", source: "Terraform Plan", timestamp: "4 min ago", confidence: "High" },
  },
  {
    label: "Backup Confirmed",
    value: "Yes",
    ok: true,
    evidence: { check: "Recent full database backup", observed: "FULL backup 2h 14m ago", expected: "< 24h", source: "msdb.dbo.backupset", timestamp: "1 min ago", confidence: "High" },
  },
  {
    label: "Recovery Strategy",
    value: "Available",
    ok: true,
    evidence: { check: "Recovery plan artifact", observed: "Compensating strategy defined for all steps", expected: "Defined", source: "Change Package", timestamp: "5 min ago", confidence: "High" },
  },
  {
    label: "Credentials & Access",
    value: "Verified",
    ok: true,
    evidence: { check: "IAM + SQL principal validation", observed: "ec2:ModifyVolume, sysadmin verified", expected: "Sufficient", source: "Access Agent", timestamp: "3 min ago", confidence: "High" },
  },
  {
    label: "Monitoring & Alerts",
    value: "Configured",
    ok: true,
    evidence: { check: "Monitoring coverage", observed: "CloudWatch, SQL monitor, synthetic active", expected: "Active", source: "Monitoring Configuration", timestamp: "2 min ago", confidence: "High" },
  },
  {
    label: "Engineering Confidence",
    value: "High",
    ok: true,
    evidence: { check: "Model confidence", observed: "96%", expected: "≥ 85%", source: "Remediation Model", timestamp: "6 min ago", confidence: "96%" },
  },
];

export const terraformPlan = `Terraform will perform the following actions:

  # aws_ebs_volume.sql_prod_07_log will be updated in-place
  ~ resource "aws_ebs_volume" "sql_prod_07_log" {
        id          = "vol-0a81f2c4e7b9d1234"
        availability_zone = "us-east-1a"
      ~ size        = 500 -> 750
        type        = "gp3"
        iops        = 3000
        throughput  = 125
        encrypted   = true
        kms_key_id  = "arn:aws:kms:us-east-1:123456789012:key/ebs-prod"
        tags        = {
            "Name"        = "sql-prod-07-log"
            "Service"     = "OrderProcessing"
            "Criticality" = "Tier1"
        }
    }

Plan: 0 to add, 1 to change, 0 to destroy.

Note: no resource replacement, detach or instance restart is required.
Volume modification is performed online (elastic volumes).`;

export const diffUnchanged = [
  { key: "type", value: "gp3" },
  { key: "iops", value: "3000" },
  { key: "throughput", value: "125" },
  { key: "encrypted", value: "true" },
];

export const diffFacts = [
  { label: "Destructive Operations", value: "0" },
  { label: "Replacement Required", value: "No" },
  { label: "Resource Detach Required", value: "No" },
  { label: "Instance Restart Expected", value: "No" },
];

export type DomainRow = {
  domain: string;
  actions: string;
  technology: string;
  artifacts: string;
  tests: string;
  risk: Risk;
  detail: string[];
};

export const domainRows: DomainRow[] = [
  {
    domain: "SQL Server", actions: "3", technology: "T-SQL", artifacts: "4", tests: "8", risk: "Low",
    detail: [
      "BACKUP LOG [OrdersDB] TO DISK = '\\\\backup\\OrdersDB\\log_*.trn'",
      "Re-evaluate log_reuse_wait_desc in sys.databases",
      "Post-change DBCC SQLPERF(LOGSPACE) verification",
      "Artifacts: backup script, reuse validation, logspace probe, rollback notes",
    ],
  },
  {
    domain: "AWS Cloud", actions: "2", technology: "Terraform / AWS API", artifacts: "3", tests: "5", risk: "Low",
    detail: [
      "terraform apply — aws_ebs_volume.sql_prod_07_log size 500 → 750",
      "ec2:DescribeVolumesModifications polling until state = completed",
      "Artifacts: plan file, apply manifest, modification watcher",
    ],
  },
  {
    domain: "Windows Server", actions: "2", technology: "PowerShell", artifacts: "2", tests: "4", risk: "Low",
    detail: [
      "Update-HostStorageCache; Get-PartitionSupportedSize",
      "Resize-Partition -DriveLetter L -Size <max>",
      "Artifacts: extension script, filesystem verification",
    ],
  },
  {
    domain: "Application", actions: "1", technology: "HTTP / Synthetic", artifacts: "1", tests: "4", risk: "Low",
    detail: [
      "Order Processing synthetic transaction (create → confirm → read)",
      "Artifacts: synthetic test definition",
    ],
  },
  {
    domain: "Agentic Workflow", actions: "Evidence Capture", technology: "Workflow Orchestration", artifacts: "2", tests: "—", risk: "Low",
    detail: [
      "Capture pre/post state, command output, timings and gate decisions",
      "Assemble immutable evidence bundle for Validation & Evidence",
    ],
  },
];

export const riskLines = [
  { label: "Technical Risk", value: "Low" },
  { label: "Business Impact During Change", value: "Low" },
  { label: "Failure Impact", value: "Moderate" },
  { label: "Likelihood of Failure", value: "Low" },
  { label: "Data Loss Risk", value: "Low" },
  { label: "Availability Risk", value: "Low" },
  { label: "Rollback Complexity", value: "Moderate" },
  { label: "Blast Radius", value: "Single SQL workload / Order Processing Service" },
];

export const ifNotPerformed = [
  "SQL transaction log capacity may again approach exhaustion",
  "Database writes may fail",
  "Order processing transactions may fail",
  "Application errors may increase",
  "Production incident may occur",
];

export const ifPerformed = [
  { risk: "Transaction log backup failure", mitigation: "Stop before infrastructure change; preserve state; investigate backup pipeline." },
  { risk: "EBS modification failure", mitigation: "Online modification; volume remains attached and usable at 500 GB. Escalate to cloud engineering." },
  { risk: "Windows filesystem extension failure", mitigation: "Capacity remains at prior size; no data impact. Retry after storage cache refresh." },
  { risk: "Application validation failure", mitigation: "Do not mark complete; compare pre/post state and invoke incident workflow." },
];

export type Prereq = {
  label: string;
  status: string;
  observed: string;
  expected: string;
  source: string;
  timestamp: string;
  confidence: string;
};

export const prerequisites: Prereq[] = [
  { label: "Recent full database backup", status: "Passed", observed: "FULL backup completed 2h 14m ago", expected: "< 24 hours", source: "msdb.dbo.backupset", timestamp: "1 min ago", confidence: "High" },
  { label: "Transaction log backup destination", status: "Available", observed: "\\\\backup\\OrdersDB writable, 3.2 TB free", expected: "Writable, > 100 GB free", source: "Backup share probe", timestamp: "1 min ago", confidence: "High" },
  { label: "SQL-PROD-07 health", status: "Passed", observed: "Service running, CPU 34%, no blocking chains", expected: "Healthy", source: "SQL monitoring", timestamp: "2 min ago", confidence: "High" },
  { label: "OrdersDB state", status: "ONLINE", observed: "state_desc = ONLINE", expected: "ONLINE", source: "sys.databases", timestamp: "2 min ago", confidence: "High" },
  { label: "OrdersDB recovery model", status: "FULL", observed: "recovery_model_desc = FULL", expected: "FULL", source: "sys.databases", timestamp: "2 min ago", confidence: "High" },
  { label: "AWS EBS online modification eligible", status: "Passed", observed: "gp3, elastic volumes supported", expected: "Eligible", source: "ec2:DescribeVolumes", timestamp: "3 min ago", confidence: "High" },
  { label: "No active EBS modification", status: "Passed", observed: "No modification in progress", expected: "None active", source: "ec2:DescribeVolumesModifications", timestamp: "3 min ago", confidence: "High" },
  { label: "EC2 instance health", status: "Passed", observed: "2/2 status checks passing", expected: "2/2 passing", source: "ec2:DescribeInstanceStatus", timestamp: "3 min ago", confidence: "High" },
  { label: "Windows disk health", status: "Passed", observed: "Disk 3 healthy, no pending reboot", expected: "Healthy", source: "Get-Disk / Get-Volume", timestamp: "3 min ago", confidence: "High" },
  { label: "Sufficient IAM permissions", status: "Passed", observed: "ec2:ModifyVolume, ec2:DescribeVolumes* granted", expected: "Granted", source: "IAM simulation", timestamp: "4 min ago", confidence: "High" },
  { label: "Terraform state resolved", status: "Passed", observed: "State lock free, no drift on target resource", expected: "Resolved", source: "Terraform backend", timestamp: "4 min ago", confidence: "High" },
  { label: "Infrastructure repository available", status: "Passed", observed: "infra/aws-sql-prod reachable, branch clean", expected: "Reachable", source: "Repository", timestamp: "4 min ago", confidence: "High" },
  { label: "Monitoring configured", status: "Passed", observed: "CloudWatch + SQL alerts active", expected: "Active", source: "Monitoring Configuration", timestamp: "2 min ago", confidence: "High" },
  { label: "Application synthetic test available", status: "Passed", observed: "Order Processing synthetic registered", expected: "Available", source: "Synthetic monitoring", timestamp: "2 min ago", confidence: "High" },
  { label: "Policy checks", status: "Passed", observed: "18 / 18 controls passed", expected: "All passed", source: POLICY_NAME, timestamp: "3 min ago", confidence: "High" },
  { label: "Change window", status: "Not required", observed: "Online, non-destructive change", expected: "Not required", source: "Change policy", timestamp: "3 min ago", confidence: "High" },
];

export type Gate = { stage: string; gate: string; onFailure: string; authority: string };

export const gates: Gate[] = [
  { stage: "PRECHECK", gate: "All 16 prerequisites must pass.", onFailure: "Stop workflow before any change is attempted.", authority: "Autonomous" },
  { stage: "SQL STABILIZATION", gate: "Transaction log backup must complete successfully.", onFailure: "Stop workflow. Do not proceed to normal capacity workflow unless emergency capacity policy is invoked.", authority: "Policy Approved" },
  { stage: "LOG REUSE VALIDATION", gate: "SQL Server reuse state must be re-evaluated.", onFailure: "If LOG_BACKUP remains, stop normal workflow and investigate the backup pipeline.", authority: "Autonomous" },
  { stage: "EBS EXPANSION", gate: "AWS eligibility confirmed and approval token required.", onFailure: "Stop. Volume remains at 500 GB; escalate to cloud engineering.", authority: "Human Approval Required" },
  { stage: "WINDOWS EXTENSION", gate: "EBS capacity must be visible to Windows.", onFailure: "Stop. Refresh storage cache and re-evaluate; no data impact.", authority: "Human Approval Required (inherited)" },
  { stage: "SQL VALIDATION", gate: "Log reuse restored and log space within threshold.", onFailure: "Stop workflow, preserve expanded infrastructure, escalate to database engineering.", authority: "Autonomous" },
  { stage: "APPLICATION VALIDATION", gate: "Order Processing synthetic transaction passes.", onFailure: "Do not mark change complete. Escalate.", authority: "Autonomous" },
  { stage: "EVIDENCE", gate: "Complete evidence bundle captured and sealed.", onFailure: "Change remains open until evidence is complete.", authority: "Autonomous" },
];

export type RecoveryItem = { title: string; reversible: string; detail: string[]; note?: string };

export const recovery: RecoveryItem[] = [
  {
    title: "SQL Log Backup", reversible: "Not applicable",
    detail: ["Stop", "Preserve database state", "Collect diagnostics", "Investigate backup pipeline"],
  },
  {
    title: "EBS Expansion", reversible: "No direct online shrink",
    detail: ["Compensating strategy: available", "Volume remains healthy and attached at the increased size", "Capacity reduction requires a planned migration, not an online reversal"],
    note: "Increasing EBS capacity is non-destructive but cannot simply be reversed through online volume shrink.",
  },
  {
    title: "Windows Volume Extension", reversible: "Not required for capacity increase",
    detail: ["Maintain expanded filesystem and investigate downstream issue"],
  },
  {
    title: "SQL Validation Failure", reversible: "—",
    detail: ["Stop workflow", "Preserve expanded infrastructure", "Collect diagnostics", "Escalate to database engineering"],
  },
  {
    title: "Application Failure", reversible: "—",
    detail: ["Stop completion", "Compare pre/post state", "Invoke incident workflow if required"],
  },
];

export const recoveryFacts = [
  { label: "Automatic Destructive Rollback", value: "Disabled" },
  { label: "Recovery Plan", value: "Available" },
  { label: "Compensating Actions", value: "Defined" },
];

export type EvidenceBlock = { title: string; evidence: string[]; sources: string[]; confidence?: string };

export const evidenceBlocks: EvidenceBlock[] = [
  { title: "Root Cause Confirmed", evidence: ["LOG_BACKUP blocking transaction log reuse."], sources: ["SQL DMVs", "Backup History"], confidence: "96%" },
  { title: "Capacity Risk", evidence: ["Log volume 92%", "Growth: +7.8 GB/hour", "Forecast: 47 minutes to exhaustion at diagnosis"], sources: ["Telemetry", "SQL", "Windows"] },
  { title: "Proposed Solution", evidence: ["SQL stabilization plus infrastructure headroom addresses both the immediate cause and the capacity risk."], sources: ["Engineering Analysis", "Remediation Model"] },
  { title: "No Downtime Expected", evidence: ["EBS modification online eligible", "Windows extension online", "SQL restart not required"], sources: ["Architecture", "Platform capabilities"] },
  { title: "Test Coverage", evidence: ["21 validation tests across SQL, AWS, Windows and application."], sources: ["Validation Plan"] },
  { title: "Monitoring in Place", evidence: ["CloudWatch", "SQL monitoring", "Application synthetic monitoring", "Alerts remain active before, during and after execution."], sources: ["Monitoring Configuration"] },
];

export const policyControls = [
  { control: "Production change requires traceable package", status: "Passed" },
  { control: "IaC required for cloud infrastructure mutation", status: "Passed" },
  { control: "Backup required before Tier 1 database change", status: "Passed" },
  { control: "Validation plan required", status: "Passed" },
  { control: "Recovery plan required", status: "Passed" },
  { control: "Human approval required for production EBS modification", status: "Required" },
  { control: "SQL restart without incident authorization", status: "Prohibited" },
  { control: "Destructive cloud operation", status: "None detected" },
];

export type AuthorityLevel = "Autonomous" | "Policy Approved" | "Human Approval Required" | "Prohibited";

export const authority: { capability: string; level: AuthorityLevel; note?: string }[] = [
  { capability: "Observe & Monitor", level: "Autonomous" },
  { capability: "Diagnose", level: "Autonomous" },
  { capability: "Recommend", level: "Autonomous" },
  { capability: "Generate Change Package", level: "Autonomous" },
  { capability: "Generate IaC", level: "Autonomous" },
  { capability: "Generate Validation", level: "Autonomous" },
  { capability: "Execute SQL Log Backup", level: "Policy Approved" },
  { capability: "Modify AWS EBS", level: "Human Approval Required" },
  { capability: "Extend Windows Volume", level: "Human Approval Required", note: "Inherited from approved package" },
  { capability: "Validate", level: "Autonomous" },
  { capability: "Capture Evidence", level: "Autonomous" },
  { capability: "Restart SQL Server", level: "Prohibited" },
  { capability: "Destroy Infrastructure", level: "Prohibited", note: "Prohibited for this package" },
];

export const approvers = [
  { id: "primary", name: "Primary Approver", role: "Change Manager", initials: "CM" },
  { id: "technical", name: "Technical Approver", role: "Database SME", initials: "DB" },
  { id: "infra", name: "Infrastructure Owner", role: "Infrastructure Lead", initials: "IL" },
];

export const blastChain = [
  "Order Processing Service",
  "OrdersDB",
  "SQL-PROD-07",
  "Windows L:",
  "AWS EBS vol-0a81f2c4e7b9d1234",
];

export const blastFacts = [
  { label: "Directly Modified Assets", value: "2" },
  { label: "SQL Server", value: "Operational action only" },
  { label: "AWS EBS", value: "Infrastructure mutation" },
  { label: "Windows L:", value: "Filesystem mutation" },
  { label: "Potentially Affected Business Service", value: "1" },
  { label: "Expected User Impact", value: "None" },
  { label: "Cross-Region Impact", value: "None" },
  { label: "Other Databases", value: "None expected" },
];

export const beforeAfter = [
  { label: "SQL log reuse", before: "Blocked by LOG_BACKUP", after: "Restored" },
  { label: "Log filesystem utilization", before: "92%", after: "Reduced / stabilized" },
  { label: "EBS", before: "500 GB", after: "750 GB" },
  { label: "Windows L:", before: "500 GB", after: "750 GB" },
  { label: "Production Risk", before: "High", after: "Low" },
  { label: "Order Processing", before: "At risk", after: "Healthy" },
];

export const initialHistory = [
  { event: "Remediation Generated", actor: "Intelligent IaC", when: "18 min ago", comment: "Root cause LOG_BACKUP identified with 96% confidence.", version: "0.1" },
  { event: "Change Engineered", actor: "Intelligent IaC", when: "12 min ago", comment: "8-step cross-platform execution plan engineered.", version: "0.5" },
  { event: "Engineering Validation Completed", actor: "Validation Agent", when: "8 min ago", comment: "21 validation tests prepared across 4 domains.", version: "0.8" },
  { event: "Policy Evaluation Completed", actor: "Policy Agent", when: "5 min ago", comment: "18 / 18 controls passed under " + POLICY_NAME + ".", version: "0.9" },
  { event: "Submitted for Approval", actor: "System", when: "2 min ago", comment: "Package marked Ready for Approval.", version: "0.9" },
];

export const changeRequestReasons = [
  "Validation gap",
  "Risk concern",
  "Recovery concern",
  "IaC change required",
  "SQL procedure concern",
  "Maintenance requirement",
  "Policy concern",
  "Other",
];

export const rejectReasons = [
  "Production risk unacceptable",
  "Incorrect remediation",
  "Business timing",
  "Policy violation",
  "Technical concern",
  "Duplicate / no longer required",
];

export const approvalSteps = [
  "Recording approval...",
  "Signing change package...",
  "Generating execution authorization token...",
  "Locking package version...",
  "Preparing execution manifest...",
];
