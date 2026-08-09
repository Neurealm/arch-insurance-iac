/** Canonical mock data for Screen 03 — Change Engineering Workspace (SQL-PROD-07). */

export const CHANGE_CONTEXT = {
  changeId: "CP-2026-01842",
  status: "Draft",
  server: "SQL-PROD-07",
  database: "OrdersDB",
  environment: "Production",
  criticality: "Tier 1",
  application: "Order Processing Service",
  cloud: "AWS",
  region: "us-east-1",
  os: "Windows Server 2022",
  engine: "Microsoft SQL Server 2022 Enterprise",
  condition: "SQL transaction log capacity approaching exhaustion",
  rootCause: "log_reuse_wait_desc = LOG_BACKUP",
  logUtilization: "92%",
  lastLogBackup: "2h 14m ago",
  windowsVolume: "L:",
  ebsVolume: "vol-0a81f2c4e7b9d1234",
  currentCapacity: "500 GB",
  targetCapacity: "750 GB",
  strategy: "Stabilize SQL + Protect Capacity",
  confidence: 96,
  downtime: "None",
  risk: "Low / Moderate",
  approvalRequired: "Yes",
  systems: "SQL Server / Windows / AWS",
  mutations: 2,
  validationTests: 21,
  created: "May 13, 2026 10:24 AM",
} as const;

export type StageKey = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const LIFECYCLE: { id: StageKey; title: string; sub: string; state: "done" | "focus" | "pending"; steps: number[] }[] = [
  { id: 1, title: "Pre-Flight", sub: "Validate State", state: "done", steps: [1] },
  { id: 2, title: "Stabilize SQL", sub: "Log Backup & Reuse", state: "done", steps: [2] },
  { id: 3, title: "Validate", sub: "Confirm Log Reuse", state: "done", steps: [3] },
  { id: 4, title: "Protect Capacity", sub: "Expand EBS", state: "focus", steps: [4] },
  { id: 5, title: "Extend OS", sub: "Windows Volume", state: "pending", steps: [5, 6] },
  { id: 6, title: "Service Test", sub: "SQL & Application", state: "pending", steps: [7] },
  { id: 7, title: "Evidence", sub: "Capture State", state: "pending", steps: [8] },
];

export type StepStatus = "Ready" | "In Focus" | "Pending";

export type ChangeStep = {
  id: number;
  title: string;
  description: string;
  technology: string[];
  artifacts: string[];
  status: StepStatus;
  stage: StageKey;
  layer: "sql" | "aws" | "windows" | "mixed";
  gate: string;
};

export const STEPS: ChangeStep[] = [
  {
    id: 1,
    title: "Preflight Validation",
    description: "Validate SQL, operating system and AWS infrastructure state before any mutation.",
    technology: ["T-SQL", "PowerShell", "AWS API"],
    artifacts: ["sql-precheck.sql", "windows-precheck.ps1", "aws-precheck.json"],
    status: "Ready",
    stage: 1,
    layer: "mixed",
    gate: "Entry gate. No mutation is permitted until every preflight assertion passes.",
  },
  {
    id: 2,
    title: "Execute Transaction Log Backup",
    description: "Run an immediate transaction log backup to resolve the LOG_BACKUP reuse blocker.",
    technology: ["T-SQL", "Enterprise Backup Automation"],
    artifacts: ["log-backup.sql"],
    status: "Ready",
    stage: 2,
    layer: "sql",
    gate: "Step 2 cannot proceed unless Step 1 passes.",
  },
  {
    id: 3,
    title: "Validate Log Reuse",
    description: "Confirm successful backup and verify SQL Server can reuse inactive transaction log space.",
    technology: ["T-SQL"],
    artifacts: ["validate-log-reuse.sql"],
    status: "Ready",
    stage: 3,
    layer: "sql",
    gate: "Step 3 must pass before the platform considers SQL stabilized.",
  },
  {
    id: 4,
    title: "Expand EBS Volume",
    description: "Increase attached EBS capacity from 500 GB to 750 GB.",
    technology: ["Terraform", "AWS API"],
    artifacts: ["ebs-volume.tf", "modify-volume.json"],
    status: "In Focus",
    stage: 4,
    layer: "aws",
    gate: "Step 4 requires SQL stable OR an explicit capacity emergency override.",
  },
  {
    id: 5,
    title: "Rescan Windows Storage",
    description: "Detect newly available disk capacity within Windows.",
    technology: ["PowerShell"],
    artifacts: ["rescan-storage.ps1"],
    status: "Pending",
    stage: 5,
    layer: "windows",
    gate: "Step 5 waits for the AWS volume modification to reach an acceptable state.",
  },
  {
    id: 6,
    title: "Extend L: Volume",
    description: "Extend NTFS filesystem to consume newly available capacity.",
    technology: ["PowerShell"],
    artifacts: ["extend-volume.ps1"],
    status: "Pending",
    stage: 5,
    layer: "windows",
    gate: "Step 6 waits for Windows to detect the new capacity.",
  },
  {
    id: 7,
    title: "SQL & Service Validation",
    description: "Validate SQL Server, OrdersDB, transaction log state and application connectivity.",
    technology: ["T-SQL", "PowerShell", "HTTP synthetic test"],
    artifacts: ["sql-postcheck.sql", "service-validation.yaml"],
    status: "Pending",
    stage: 6,
    layer: "mixed",
    gate: "Step 7 must pass before change completion.",
  },
  {
    id: 8,
    title: "Capture Evidence",
    description: "Capture resulting infrastructure state, telemetry and validation results.",
    technology: ["Agentic Workflow"],
    artifacts: ["evidence-manifest.json"],
    status: "Pending",
    stage: 7,
    layer: "mixed",
    gate: "Step 8 captures all evidence and closes the engineered change record.",
  },
];

export const TARGET_RESOURCE: { label: string; value: string }[] = [
  { label: "Volume ID", value: "vol-0a81f2c4e7b9d1234" },
  { label: "Type", value: "gp3" },
  { label: "Current Size", value: "500 GB" },
  { label: "Target Size", value: "750 GB" },
  { label: "IOPS", value: "3,000" },
  { label: "Throughput", value: "125 MB/s" },
  { label: "Attachment", value: "i-0f1a2b3c4d5e6f789" },
  { label: "Device", value: "/dev/sdf" },
  { label: "Windows Mapping", value: "Disk 2 / L:" },
  { label: "Availability Zone", value: "us-east-1a" },
  { label: "State", value: "in-use" },
  { label: "Encryption", value: "Enabled" },
  { label: "KMS", value: "Enterprise Infrastructure Key" },
];

export const EXPECTED_RESULT: { label: string; value: string }[] = [
  { label: "EBS capacity", value: "750 GB" },
  { label: "Attachment", value: "Maintained" },
  { label: "EC2 Restart", value: "Not expected" },
  { label: "SQL Restart", value: "Not required" },
  { label: "Application Interruption", value: "None expected" },
];

export const PREREQUISITES: { label: string; result: string; ok: boolean; evidence: string }[] = [
  { label: "EBS volume type supports modification", result: "Passed", ok: true, evidence: "gp3 volumes support online modification of size, IOPS and throughput." },
  { label: "Volume state is in-use", result: "Passed", ok: true, evidence: "DescribeVolumes reports state=in-use, attached to i-0f1a2b3c4d5e6f789." },
  { label: "Current modification state", result: "None active", ok: true, evidence: "DescribeVolumesModifications returned no in-progress modification for this volume." },
  { label: "Recent backup", result: "Confirmed", ok: true, evidence: "Full backup 2026-05-12 23:00, log backup chain intact prior to change." },
  { label: "EC2 health", result: "Healthy", ok: true, evidence: "Instance and system status checks passing for the last 24h." },
  { label: "Windows disk health", result: "Healthy", ok: true, evidence: "Disk 2 OperationalStatus=Online, HealthStatus=Healthy." },
  { label: "SQL database", result: "ONLINE", ok: true, evidence: "sys.databases state_desc = ONLINE for OrdersDB." },
  { label: "Availability Group", result: "Healthy", ok: true, evidence: "AG-ORDERS synchronization state healthy across replicas." },
  { label: "Application health", result: "Healthy", ok: true, evidence: "Order Processing health endpoint returning 200 with baseline latency." },
  { label: "Production policy", result: "Passed", ok: true, evidence: "POL-INFRA-014 permits online capacity expansion with approval." },
  { label: "Maintenance window", result: "Not required", ok: true, evidence: "Online EBS expansion is exempt from the standard change window." },
  { label: "Human approval", result: "Required before execution", ok: false, evidence: "Infrastructure mutation in Production always requires named approver." },
  { label: "AWS credentials", result: "Execution role available", ok: true, evidence: "Role iac-exec-prod is bound to the change package, not to the browser session." },
  { label: "Terraform state", result: "Resolved", ok: true, evidence: "Workspace aws-prod-us-east-1 state lock free, last apply 6 days ago." },
  { label: "Resource lock", result: "None", ok: true, evidence: "No conflicting change package targets this resource." },
];

export const TERRAFORM_CODE = `resource "aws_ebs_volume" "sql_prod_07_log" {
  availability_zone = "us-east-1a"

  size = 750
  type = "gp3"

  iops       = 3000
  throughput = 125

  encrypted  = true
  kms_key_id = var.infrastructure_kms_key

  tags = {
    Name        = "sql-prod-07-log"
    Environment = "production"
    Application = "order-processing"
    ManagedBy   = "intelligent-iac"
    ChangeID    = "CP-2026-01842"
  }
}`;

export const TERRAFORM_DIFF = `resource "aws_ebs_volume" "sql_prod_07_log" {

- size = 500
+ size = 750

  type       = "gp3"
  iops       = 3000
  throughput = 125
}`;

export const TERRAFORM_META: { label: string; value: string }[] = [
  { label: "Repository", value: "infrastructure/aws/production/sql" },
  { label: "Branch", value: "change/CP-2026-01842" },
  { label: "File", value: "sql-prod-07/ebs-volume.tf" },
  { label: "Terraform Workspace", value: "aws-prod-us-east-1" },
  { label: "Generated By", value: "AWS Engineering Agent" },
  { label: "Confidence", value: "98%" },
];

export const AWS_PAYLOAD = `{
  "VolumeId": "vol-0a81f2c4e7b9d1234",
  "Size": 750,
  "VolumeType": "gp3",
  "Iops": 3000,
  "Throughput": 125
}`;

export const POWERSHELL_RESCAN = `Update-HostStorageCache

Get-Disk |
    Where-Object OperationalStatus -eq 'Online'`;

export const POWERSHELL_EXTEND = `$driveLetter = "L"

$supportedSize =
    Get-PartitionSupportedSize \`
        -DriveLetter $driveLetter

Resize-Partition \`
    -DriveLetter $driveLetter \`
    -Size $supportedSize.SizeMax`;

export const SQL_PREFLIGHT = `SELECT
    name,
    state_desc,
    recovery_model_desc,
    log_reuse_wait_desc
FROM sys.databases
WHERE name = 'OrdersDB';

SELECT *
FROM sys.dm_db_log_space_usage;`;

export const SQL_BACKUP = `BACKUP LOG [OrdersDB]
TO DISK = @ApprovedBackupTarget
WITH CHECKSUM;`;

export const SQL_POSTCHECK = `SELECT
    d.name,
    d.state_desc,
    d.recovery_model_desc,
    d.log_reuse_wait_desc,
    lsu.used_log_space_in_percent
FROM sys.databases AS d
CROSS APPLY sys.dm_db_log_space_usage AS lsu
WHERE d.name = 'OrdersDB';

SELECT TOP (1)
    backup_finish_date
FROM msdb.dbo.backupset
WHERE database_name = 'OrdersDB'
  AND type = 'L'
ORDER BY backup_finish_date DESC;`;

export const SQL_POST_CHECKLIST = [
  "Database state",
  "Recovery model",
  "Log reuse wait",
  "Log space used",
  "Backup completion",
  "Active transactions",
  "Database writes",
];

export type ValidationTest = {
  category: "SQL" | "AWS" | "Windows" | "Application";
  name: string;
  precondition: string;
  expected: string;
  onFailure: string;
  evidence: string;
};

export const VALIDATIONS: ValidationTest[] = [
  { category: "SQL", name: "OrdersDB state = ONLINE", precondition: "SQL service reachable", expected: "state_desc = ONLINE", onFailure: "Stop workflow, escalate to database engineering", evidence: "sys.databases" },
  { category: "SQL", name: "Transaction log backup completed", precondition: "Step 2 executed", expected: "backupset row within change window", onFailure: "Retry backup once, then stop", evidence: "msdb.dbo.backupset" },
  { category: "SQL", name: "log_reuse_wait_desc no longer LOG_BACKUP", precondition: "Backup completed", expected: "NOTHING or benign wait", onFailure: "Stop before capacity change", evidence: "sys.databases" },
  { category: "SQL", name: "Log utilization below threshold", precondition: "Log reuse confirmed", expected: "< 70% used", onFailure: "Escalate for additional log analysis", evidence: "sys.dm_db_log_space_usage" },
  { category: "SQL", name: "Database write test successful", precondition: "DB writable", expected: "Test write committed and rolled back", onFailure: "Stop completion workflow", evidence: "Synthetic transaction" },
  { category: "SQL", name: "Database read test successful", precondition: "DB online", expected: "Reference read returns rows", onFailure: "Stop completion workflow", evidence: "Synthetic transaction" },
  { category: "SQL", name: "No abnormal blocking", precondition: "Workload active", expected: "No blocking chain > 30s", onFailure: "Capture blocking evidence, escalate", evidence: "sys.dm_exec_requests" },
  { category: "SQL", name: "SQL service healthy", precondition: "Host reachable", expected: "Service Running, errorlog clean", onFailure: "Escalate to database engineering", evidence: "SQL error log" },
  { category: "AWS", name: "EBS modification accepted", precondition: "ModifyVolume submitted", expected: "HTTP 200, state modifying", onFailure: "Stop downstream Windows actions", evidence: "ModifyVolume response" },
  { category: "AWS", name: "Volume reaches expected modification state", precondition: "Modification in progress", expected: "optimizing or completed", onFailure: "Inspect modification state, escalate", evidence: "DescribeVolumesModifications" },
  { category: "AWS", name: "Capacity reports 750 GB", precondition: "Modification progressed", expected: "Size = 750", onFailure: "Halt, do not extend Windows volume", evidence: "DescribeVolumes" },
  { category: "AWS", name: "Attachment remains intact", precondition: "Volume attached pre-change", expected: "attached to i-0f1a2b3c4d5e6f789", onFailure: "Escalate to infrastructure engineering", evidence: "DescribeVolumes" },
  { category: "AWS", name: "EC2 instance health remains healthy", precondition: "Instance running", expected: "2/2 status checks passing", onFailure: "Stop change, open incident", evidence: "DescribeInstanceStatus" },
  { category: "Windows", name: "Disk reports expanded capacity", precondition: "Storage rescan executed", expected: "Disk 2 size = 750 GB", onFailure: "Retry storage discovery", evidence: "Get-Disk" },
  { category: "Windows", name: "L: remains online", precondition: "Partition present", expected: "OperationalStatus Online", onFailure: "Escalate to platform engineering", evidence: "Get-Partition" },
  { category: "Windows", name: "NTFS reports expected capacity", precondition: "Resize-Partition executed", expected: "Volume size ≈ 750 GB", onFailure: "Do not shrink EBS, escalate", evidence: "Get-Volume" },
  { category: "Windows", name: "Filesystem health normal", precondition: "Volume online", expected: "HealthStatus Healthy", onFailure: "Preserve evidence, escalate", evidence: "Get-Volume" },
  { category: "Application", name: "Order Processing health endpoint passes", precondition: "Service running", expected: "HTTP 200 within SLA", onFailure: "Initiate application incident workflow", evidence: "Synthetic HTTP probe" },
  { category: "Application", name: "Database connectivity passes", precondition: "SQL online", expected: "Connection pool healthy", onFailure: "Stop change completion", evidence: "Application telemetry" },
  { category: "Application", name: "Synthetic order transaction succeeds", precondition: "Service healthy", expected: "Order created and reconciled", onFailure: "Open incident, preserve evidence", evidence: "Synthetic transaction" },
  { category: "Application", name: "Error rate remains within baseline", precondition: "Baseline captured pre-change", expected: "Δ error rate < 0.5%", onFailure: "Compare pre/post telemetry, escalate", evidence: "APM baseline comparison" },
];

export const RECOVERY_SECTIONS: { title: string; items: string[] }[] = [
  { title: "Before EBS Modification", items: ["If preflight fails, stop the change.", "No mutation performed."] },
  { title: "EBS Modification Failure", items: ["Stop downstream Windows actions.", "Inspect AWS modification state.", "Maintain current attachment.", "Escalate to infrastructure engineering."] },
  { title: "Windows Extension Failure", items: ["EBS remains at increased capacity.", "Do not attempt EBS shrink.", "Retry Windows storage discovery.", "Validate disk and partition state.", "Escalate if filesystem extension remains unsuccessful."] },
  { title: "SQL Validation Failure", items: ["Stop completion workflow.", "Maintain expanded infrastructure capacity.", "Preserve diagnostic evidence.", "Escalate to database engineering."] },
  { title: "Application Validation Failure", items: ["Stop change completion.", "Compare pre/post telemetry.", "Initiate application incident workflow."] },
];

export const ENGINEERING_DECISIONS: {
  area: string; selected: string; reason: string; alternative?: string; status?: string;
}[] = [
  { area: "SQL Backup", selected: "T-SQL + approved backup framework", reason: "Database-native operation required to address the LOG_BACKUP reuse condition." },
  { area: "EBS Modification", selected: "Terraform", reason: "Resource is managed through the production infrastructure repository and desired state must remain synchronized.", alternative: "AWS EC2 ModifyVolume API", status: "Available as orchestration mechanism." },
  { area: "Windows Storage Rescan", selected: "PowerShell", reason: "Guest OS storage operation cannot be completed through Terraform alone." },
  { area: "NTFS Expansion", selected: "PowerShell", reason: "Filesystem mutation occurs within the Windows guest operating system." },
  { area: "Validation", selected: "Cross-layer validation", reason: "Infrastructure success does not prove database or application success." },
];

export type PackageArtifact = {
  name: string; type: string; technology: string; generatedBy: string; version: string;
  validation: "Validated" | "Pending"; checksum: string; lastGenerated: string;
};

export const PACKAGE_ARTIFACTS: PackageArtifact[] = [
  { name: "manifest.yaml", type: "Manifest", technology: "YAML", generatedBy: "Change Orchestrator", version: "v1.3", validation: "Validated", checksum: "sha256:0af2…91c4", lastGenerated: "10:24 AM" },
  { name: "sql-precheck.sql", type: "Diagnostic", technology: "T-SQL", generatedBy: "SQL Engineering Agent", version: "v1.1", validation: "Validated", checksum: "sha256:7b13…4ae0", lastGenerated: "10:24 AM" },
  { name: "log-backup.sql", type: "Operation", technology: "T-SQL", generatedBy: "SQL Engineering Agent", version: "v1.2", validation: "Validated", checksum: "sha256:cc80…1d55", lastGenerated: "10:25 AM" },
  { name: "validate-log-reuse.sql", type: "Validation", technology: "T-SQL", generatedBy: "SQL Engineering Agent", version: "v1.0", validation: "Validated", checksum: "sha256:19fa…70b2", lastGenerated: "10:25 AM" },
  { name: "ebs-volume.tf", type: "Infrastructure", technology: "Terraform", generatedBy: "AWS Engineering Agent", version: "v2.0", validation: "Validated", checksum: "sha256:6d41…aa39", lastGenerated: "10:26 AM" },
  { name: "modify-volume.json", type: "Control Plane", technology: "AWS API", generatedBy: "AWS Engineering Agent", version: "v1.0", validation: "Validated", checksum: "sha256:be07…33f1", lastGenerated: "10:26 AM" },
  { name: "rescan-storage.ps1", type: "Automation", technology: "PowerShell", generatedBy: "Windows Engineering Agent", version: "v1.0", validation: "Validated", checksum: "sha256:2fd9…5c6b", lastGenerated: "10:27 AM" },
  { name: "extend-volume.ps1", type: "Automation", technology: "PowerShell", generatedBy: "Windows Engineering Agent", version: "v1.1", validation: "Validated", checksum: "sha256:81ce…d4a7", lastGenerated: "10:27 AM" },
  { name: "sql-postcheck.sql", type: "Validation", technology: "T-SQL", generatedBy: "SQL Engineering Agent", version: "v1.0", validation: "Pending", checksum: "sha256:44b8…9e12", lastGenerated: "10:28 AM" },
  { name: "service-validation.yaml", type: "Validation", technology: "YAML / HTTP", generatedBy: "Validation Agent", version: "v1.0", validation: "Pending", checksum: "sha256:af51…6d0c", lastGenerated: "10:28 AM" },
  { name: "recovery-plan.yaml", type: "Recovery", technology: "YAML", generatedBy: "Change Orchestrator", version: "v1.0", validation: "Validated", checksum: "sha256:3e2a…b877", lastGenerated: "10:29 AM" },
  { name: "evidence-manifest.json", type: "Evidence", technology: "Agentic Workflow", generatedBy: "Evidence Agent", version: "v1.0", validation: "Pending", checksum: "sha256:90dd…1f4e", lastGenerated: "10:29 AM" },
];

export const ARTIFACT_COUNT = PACKAGE_ARTIFACTS.length;

export const CONTRIBUTORS: {
  name: string; status: string; contribution: string; artifacts: number; confidence: number;
}[] = [
  { name: "SQL Engineering Agent", status: "Complete", contribution: "Generated SQL diagnostics, transaction-log backup operation and SQL validation.", artifacts: 4, confidence: 97 },
  { name: "AWS Engineering Agent", status: "Complete", contribution: "Generated EBS modification, Terraform delta and AWS validation.", artifacts: 2, confidence: 98 },
  { name: "Windows Engineering Agent", status: "Complete", contribution: "Generated storage rescan and NTFS extension automation.", artifacts: 2, confidence: 95 },
  { name: "Validation Agent", status: "Complete", contribution: "Generated 21 cross-layer validation tests and evidence bindings.", artifacts: 2, confidence: 96 },
  { name: "Policy Agent", status: "Complete", contribution: "Evaluated production policy, approval requirements and execution authority.", artifacts: 2, confidence: 99 },
];
