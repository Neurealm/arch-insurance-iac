/** Screen 06 — Validation & Evidence canonical data (CP-2026-01842). */

export const VAL_PACKAGE = {
  packageId: "CP-2026-01842",
  packageVersion: "1.0",
  state: "Immutable",
  authorization: "EXEC-AUTH-01842",
  executionStatus: "EXECUTION COMPLETE",
  executionDuration: "00:17:39",
  target: "SQL-PROD-07 / OrdersDB",
  environment: "Production",
  businessService: "Order Processing Service",
  criticality: "Tier 1",
  provider: "AWS",
  region: "us-east-1",
  steps: "8 / 8 Completed",
  gates: "8 / 8 Passed",
  safetyViolations: 0,
  interruptions: "None detected",
  validatedBy: "Intelligent IaC Validation Engine",
  engineVersion: "v2.3.1",
  confidence: 98,
  evidenceId: "EV-2026-01842",
  evidencePackage: "evidence-2026-01842.zip",
  executionEvents: 47,
  evidenceHash:
    "sha256:9f4c1d2a7b83e60518c4d9a1fe72b6035ad84c19e0f7b2c6d3418a95e7c02b6f",
};

export type ValidationScenario =
  | "success"
  | "sql_failure"
  | "drift"
  | "app_regression"
  | "evidence_incomplete";

export const SCENARIOS: { id: ValidationScenario; label: string; note: string }[] = [
  { id: "success", label: "Successful Validation", note: "All 21 validation tests pass; change is eligible for closure." },
  { id: "sql_failure", label: "SQL Validation Failure", note: "Infrastructure succeeded but log reuse still blocked — closure denied." },
  { id: "drift", label: "Infrastructure Drift Detected", note: "Observed AWS state differs from the approved desired state." },
  { id: "app_regression", label: "Application Regression", note: "Business service telemetry regressed after the change." },
  { id: "evidence_incomplete", label: "Evidence Incomplete", note: "Evidence chain cannot be sealed; change cannot be closed." },
];

export const VERIFICATION_SEQUENCE = [
  "Loading pre-change state...",
  "Loading intended state...",
  "Collecting current SQL state...",
  "Collecting AWS state...",
  "Collecting Windows state...",
  "Executing final SQL validation...",
  "Executing application synthetic validation...",
  "Comparing baseline telemetry...",
  "Reconciling Digital Twin...",
  "Validating evidence integrity...",
  "Calculating outcome confidence...",
  "Final verification complete.",
];

export const CLOSURE_SEQUENCE = [
  "Validating closure criteria...",
  "Locking validation evidence...",
  "Finalizing evidence manifest...",
  "Updating Digital Twin...",
  "Updating change record...",
  "Recording outcome...",
  "Closing remediation...",
];

export const ORIGINAL_CONDITION = {
  detected: "May 13, 2026 10:12 AM",
  rows: [
    ["Condition", "SQL transaction-log capacity at risk"],
    ["Log reuse wait", "LOG_BACKUP"],
    ["Log filesystem utilization", "92%"],
    ["Transaction-log growth", "+7.8 GB/hour"],
    ["Predicted exhaustion", "47 minutes"],
    ["EBS capacity", "500 GB"],
    ["Windows L: capacity", "500 GB"],
    ["OrdersDB", "ONLINE"],
    ["Order Processing Service", "Healthy"],
    ["Production risk", "High"],
  ] as [string, string][],
  rootCause:
    "Transaction-log backup had not completed successfully, preventing inactive log records from becoming reusable.",
};

export const INTENDED_OUTCOME = [
  "SQL transaction-log backup succeeds",
  "LOG_BACKUP no longer blocks log reuse",
  "Log reuse restored",
  "Log utilization below operating threshold",
  "AWS EBS capacity: 750 GB",
  "Windows L: capacity: 750 GB",
  "OrdersDB remains ONLINE",
  "SQL read/write remains healthy",
  "Order Processing Service remains healthy",
  "Synthetic order transaction: PASS",
  "Material service interruption: None",
  "Capacity risk: Low",
  "Digital Twin updated to resulting state",
];

export type Verdict = "PASS" | "FAIL" | "WARN";

export type OutcomeRow = {
  id: string;
  measure: string;
  before: string;
  intended: string;
  actual: string;
  result: Verdict;
  detail: string;
  source: string;
};

export const OUTCOME_ROWS: OutcomeRow[] = [
  { id: "OV-01", measure: "Log Reuse Wait", before: "LOG_BACKUP", intended: "Cleared", actual: "NOTHING", result: "PASS", source: "SQL Server DMV — sys.databases.log_reuse_wait_desc", detail: "No current condition is preventing transaction-log reuse." },
  { id: "OV-02", measure: "Transaction Log Utilization", before: "92%", intended: "Below operating threshold", actual: "31%", result: "PASS", source: "DBCC SQLPERF(LOGSPACE)", detail: "Log space used fell from 92% to 31% after backup completion and volume expansion." },
  { id: "OV-03", measure: "EBS Capacity", before: "500 GB", intended: "750 GB", actual: "750 GB", result: "PASS", source: "AWS EC2 DescribeVolumes", detail: "vol-0a1b2c3d4e5f67890 reports Size=750, State=in-use, ModificationState=completed." },
  { id: "OV-04", measure: "Windows L: Capacity", before: "500 GB", intended: "750 GB", actual: "750 GB", result: "PASS", source: "Get-Volume / Get-Partition", detail: "Partition extended to the full 750 GB disk; NTFS healthy." },
  { id: "OV-05", measure: "OrdersDB State", before: "ONLINE", intended: "ONLINE", actual: "ONLINE", result: "PASS", source: "sys.databases.state_desc", detail: "Database remained ONLINE for the entire execution window." },
  { id: "OV-06", measure: "SQL Read", before: "Healthy", intended: "Healthy", actual: "PASS", result: "PASS", source: "Validation read probe", detail: "SELECT probe against OrdersDB returned in 4 ms." },
  { id: "OV-07", measure: "SQL Write", before: "Healthy", intended: "Healthy", actual: "PASS", result: "PASS", source: "Validation write probe", detail: "Transactional write probe committed and rolled back successfully." },
  { id: "OV-08", measure: "Synthetic Order", before: "PASS", intended: "PASS", actual: "PASS", result: "PASS", source: "Order Processing synthetic monitor", detail: "End-to-end synthetic order completed in 812 ms." },
  { id: "OV-09", measure: "Application Availability", before: "Healthy", intended: "Healthy", actual: "Healthy", result: "PASS", source: "Application health endpoint", detail: "/health returned 200 across all application nodes." },
  { id: "OV-10", measure: "Material Downtime", before: "N/A", intended: "None", actual: "None Detected", result: "PASS", source: "Availability telemetry correlation", detail: "No availability gap detected across the execution and validation window." },
];

export type ValTest = {
  id: string;
  name: string;
  domain: "SQL Server" | "AWS" | "Windows" | "Application";
  method: string;
  expected: string;
  observed: string;
  result: Verdict;
  source: string;
  timestamp: string;
  duration: string;
  confidence: number;
  raw: string;
  event: string;
  asset: string;
};

const t = (n: number) => `May 13, 2026 12:58:${String(20 + n).padStart(2, "0")}`;

export const TESTS: ValTest[] = [
  { id: "SQL-VAL-001", name: "Database Online", domain: "SQL Server", method: "T-SQL query via managed SQL agent", expected: "ONLINE", observed: "ONLINE", result: "PASS", source: "SQL Server DMV", timestamp: t(1), duration: "0.4 s", confidence: 99, raw: "SELECT state_desc FROM sys.databases WHERE name='OrdersDB';\n-- ONLINE", event: "EXEC-EVT-041", asset: "SQL-PROD-07 / OrdersDB" },
  { id: "SQL-VAL-002", name: "Transaction Log Backup", domain: "SQL Server", method: "Backup history inspection", expected: "Successful", observed: "Successful", result: "PASS", source: "msdb.dbo.backupset", timestamp: t(2), duration: "0.6 s", confidence: 99, raw: "type='L' backup_finish_date=2026-05-13 12:44:02 is_damaged=0", event: "EXEC-EVT-018", asset: "SQL-PROD-07 / OrdersDB" },
  { id: "SQL-VAL-003", name: "Log Reuse Wait", domain: "SQL Server", method: "T-SQL DMV read", expected: "Not LOG_BACKUP", observed: "NOTHING", result: "PASS", source: "SQL Server DMV", timestamp: t(3), duration: "0.3 s", confidence: 99, raw: "log_reuse_wait_desc = NOTHING", event: "EXEC-EVT-021", asset: "SQL-PROD-07 / OrdersDB" },
  { id: "SQL-VAL-004", name: "Log Reuse Available", domain: "SQL Server", method: "Log space sampling", expected: "Yes", observed: "Yes", result: "PASS", source: "DBCC SQLPERF(LOGSPACE)", timestamp: t(4), duration: "0.3 s", confidence: 98, raw: "Log Space Used (%) = 31.4", event: "EXEC-EVT-022", asset: "SQL-PROD-07 / OrdersDB" },
  { id: "SQL-VAL-005", name: "Database Read", domain: "SQL Server", method: "Read probe", expected: "Success", observed: "Success", result: "PASS", source: "Validation probe", timestamp: t(5), duration: "0.2 s", confidence: 99, raw: "SELECT TOP 1 order_id FROM dbo.Orders; -- 4 ms", event: "EXEC-EVT-043", asset: "SQL-PROD-07 / OrdersDB" },
  { id: "SQL-VAL-006", name: "Database Write", domain: "SQL Server", method: "Transactional write probe", expected: "Success", observed: "Success", result: "PASS", source: "Validation probe", timestamp: t(6), duration: "0.3 s", confidence: 99, raw: "BEGIN TRAN ... COMMIT; -- 6 ms", event: "EXEC-EVT-044", asset: "SQL-PROD-07 / OrdersDB" },
  { id: "SQL-VAL-007", name: "Blocking", domain: "SQL Server", method: "Wait statistics sampling", expected: "Within normal operating threshold", observed: "Normal", result: "PASS", source: "sys.dm_exec_requests", timestamp: t(7), duration: "0.4 s", confidence: 97, raw: "blocked_sessions = 0; max wait 12 ms", event: "EXEC-EVT-045", asset: "SQL-PROD-07" },
  { id: "SQL-VAL-008", name: "Critical SQL Errors", domain: "SQL Server", method: "Error log scan", expected: "None", observed: "None", result: "PASS", source: "SQL Server error log", timestamp: t(8), duration: "0.9 s", confidence: 98, raw: "severity >= 17 matches: 0", event: "EXEC-EVT-046", asset: "SQL-PROD-07" },

  { id: "AWS-VAL-001", name: "EBS Capacity", domain: "AWS", method: "AWS EC2 API", expected: "750 GB", observed: "750 GB", result: "PASS", source: "DescribeVolumes", timestamp: t(9), duration: "0.5 s", confidence: 99, raw: '{"VolumeId":"vol-0a1b2c3d4e5f67890","Size":750}', event: "EXEC-EVT-029", asset: "vol-0a1b2c3d4e5f67890" },
  { id: "AWS-VAL-002", name: "EBS Attachment", domain: "AWS", method: "AWS EC2 API", expected: "Attached to SQL-PROD-07", observed: "Attached", result: "PASS", source: "DescribeVolumes", timestamp: t(10), duration: "0.4 s", confidence: 99, raw: '{"Attachments":[{"InstanceId":"i-05ef7a91","State":"attached","Device":"xvdf"}]}', event: "EXEC-EVT-030", asset: "i-05ef7a91" },
  { id: "AWS-VAL-003", name: "Volume State", domain: "AWS", method: "AWS EC2 API", expected: "Completed / healthy", observed: "Completed", result: "PASS", source: "DescribeVolumesModifications", timestamp: t(11), duration: "0.4 s", confidence: 99, raw: '{"ModificationState":"completed","Progress":100}', event: "EXEC-EVT-031", asset: "vol-0a1b2c3d4e5f67890" },
  { id: "AWS-VAL-004", name: "EC2 Health", domain: "AWS", method: "AWS EC2 API", expected: "Healthy", observed: "Healthy", result: "PASS", source: "DescribeInstanceStatus", timestamp: t(12), duration: "0.4 s", confidence: 99, raw: '{"SystemStatus":"ok","InstanceStatus":"ok"}', event: "EXEC-EVT-032", asset: "i-05ef7a91" },
  { id: "AWS-VAL-005", name: "Unexpected Infrastructure Change", domain: "AWS", method: "Desired-state reconciliation", expected: "None", observed: "None detected", result: "PASS", source: "Terraform state + CloudTrail", timestamp: t(13), duration: "1.2 s", confidence: 98, raw: "drift resources: 0 · out-of-band CloudTrail mutations: 0", event: "EXEC-EVT-033", asset: "SQL-PROD-07 stack" },

  { id: "WIN-VAL-001", name: "Disk Capacity Detection", domain: "Windows", method: "PowerShell (Get-Disk)", expected: "750 GB available", observed: "750 GB", result: "PASS", source: "Windows storage subsystem", timestamp: t(14), duration: "0.6 s", confidence: 99, raw: "Number 2 Size 750GB PartitionStyle GPT HealthStatus Healthy", event: "EXEC-EVT-035", asset: "SQL-PROD-07" },
  { id: "WIN-VAL-002", name: "L: Volume Capacity", domain: "Windows", method: "PowerShell (Get-Volume)", expected: "750 GB", observed: "750 GB", result: "PASS", source: "Windows storage subsystem", timestamp: t(15), duration: "0.5 s", confidence: 99, raw: "DriveLetter L Size 750GB SizeRemaining 517GB", event: "EXEC-EVT-036", asset: "SQL-PROD-07 L:" },
  { id: "WIN-VAL-003", name: "NTFS Health", domain: "Windows", method: "PowerShell (Get-Volume)", expected: "Healthy", observed: "Healthy", result: "PASS", source: "Windows storage subsystem", timestamp: t(16), duration: "0.5 s", confidence: 98, raw: "FileSystemType NTFS HealthStatus Healthy OperationalStatus OK", event: "EXEC-EVT-037", asset: "SQL-PROD-07 L:" },
  { id: "WIN-VAL-004", name: "Filesystem Accessibility", domain: "Windows", method: "Filesystem probe", expected: "Accessible", observed: "Accessible", result: "PASS", source: "Windows agent", timestamp: t(17), duration: "0.4 s", confidence: 99, raw: "Test-Path L:\\MSSQL\\LOG -> True", event: "EXEC-EVT-038", asset: "SQL-PROD-07 L:" },

  { id: "APP-VAL-001", name: "Health Endpoint", domain: "Application", method: "HTTPS probe", expected: "Healthy", observed: "Healthy", result: "PASS", source: "Order Processing Service", timestamp: t(18), duration: "0.3 s", confidence: 99, raw: 'GET /health -> 200 {"status":"healthy"}', event: "EXEC-EVT-040", asset: "Order Processing Service" },
  { id: "APP-VAL-002", name: "Database Connectivity", domain: "Application", method: "Application dependency probe", expected: "Successful", observed: "Successful", result: "PASS", source: "Order Processing Service", timestamp: t(19), duration: "0.3 s", confidence: 99, raw: 'GET /health/dependencies -> {"ordersdb":"ok","latency_ms":5}', event: "EXEC-EVT-041", asset: "Order Processing Service" },
  { id: "APP-VAL-003", name: "Synthetic Order Transaction", domain: "Application", method: "Synthetic transaction", expected: "PASS", observed: "PASS", result: "PASS", source: "Synthetic monitoring", timestamp: t(20), duration: "0.9 s", confidence: 98, raw: "order SYN-88213 created, priced, persisted, reversed — 812 ms", event: "EXEC-EVT-042", asset: "Order Processing Service" },
  { id: "APP-VAL-004", name: "Application Telemetry", domain: "Application", method: "Baseline comparison", expected: "Within baseline", observed: "Within baseline", result: "PASS", source: "APM telemetry", timestamp: t(21), duration: "1.1 s", confidence: 97, raw: "tps 3472 (+0.64%) · err 0.11% · p95 229 ms", event: "EXEC-EVT-047", asset: "Order Processing Service" },
];

export const DOMAINS = ["SQL Server", "AWS", "Windows", "Application"] as const;

export const TWIN_ROWS = [
  { attr: "EBS Volume", prev: "500 GB", cur: "750 GB", change: "+250 GB", status: "Updated" },
  { attr: "Windows L:", prev: "500 GB", cur: "750 GB", change: "+250 GB", status: "Updated" },
  { attr: "Log Reuse Wait", prev: "LOG_BACKUP", cur: "NOTHING", change: "Cleared", status: "Updated" },
  { attr: "Log Utilization", prev: "92%", cur: "31%", change: "-61 pp", status: "Updated" },
  { attr: "Capacity Risk", prev: "High", cur: "Low", change: "Improved", status: "Updated" },
  { attr: "Database State", prev: "ONLINE", cur: "ONLINE", change: "None", status: "Verified" },
  { attr: "Application Health", prev: "Healthy", cur: "Healthy", change: "None", status: "Verified" },
  { attr: "Automation State", prev: "Change Pending", cur: "Verified", change: "Completed", status: "Updated" },
];

export const SERVICE_ROWS = [
  { m: "Transactions / minute", before: "3,450", after: "3,472", delta: "+0.64%", good: true },
  { m: "Error Rate", before: "0.12%", after: "0.11%", delta: "-0.01%", good: true },
  { m: "P95 Latency", before: "235 ms", after: "229 ms", delta: "-6 ms", good: true },
  { m: "Health", before: "Healthy", after: "Healthy", delta: "—", good: true },
  { m: "Synthetic Order", before: "PASS", after: "PASS", delta: "—", good: true },
  { m: "Database Connectivity", before: "Healthy", after: "Healthy", delta: "—", good: true },
  { m: "Critical Alerts", before: "0", after: "0", delta: "—", good: true },
];

export const INTEGRITY_ROWS: [string, string][] = [
  ["Manifest", "Valid"],
  ["Package Signature", "Valid"],
  ["Execution Authorization", "Valid"],
  ["Pre-State Snapshot", "Signed"],
  ["Post-State Snapshot", "Signed"],
  ["Execution Events", "Complete"],
  ["Validation Results", "Complete"],
  ["Evidence Chain", "Complete"],
  ["Package Version", "1.0"],
  ["Change Package", "Immutable"],
];

export const TRACE = [
  { k: "Original Condition", v: "SQL transaction-log capacity risk", to: "/remediation/SQL-PROD-07" },
  { k: "Diagnosis", v: "LOG_BACKUP blocking log reuse", to: "/remediation/SQL-PROD-07" },
  { k: "Remediation Decision", v: "Stabilize SQL + Protect Capacity", to: "/remediation/SQL-PROD-07" },
  { k: "Change Package", v: "CP-2026-01842", to: "/changes/SQL-PROD-07" },
  { k: "Approval", v: "EXEC-AUTH-01842", to: "/approvals/CP-2026-01842" },
  { k: "Execution", v: "8 / 8 stages completed", to: "/execution/CP-2026-01842" },
  { k: "Validation", v: "21 / 21 passed", to: null },
  { k: "Observed Outcome", v: "Capacity risk mitigated", to: null },
  { k: "Digital Twin", v: "Reconciled", to: "/resources" },
  { k: "Evidence Record", v: "EV-2026-01842", to: null },
];

export const TIMELINE = [
  ["Detected", "10:12 AM"],
  ["Diagnosis Completed", "10:28 AM"],
  ["Remediation Selected", "10:31 AM"],
  ["Change Engineered", "10:34 AM"],
  ["Submitted for Approval", "10:36 AM"],
  ["Approved", "10:42 AM"],
  ["Execution Started", "12:41 PM"],
  ["Execution Completed", "12:58 PM"],
  ["Validation Completed", "12:59 PM"],
] as [string, string][];

export const DURATIONS: [string, string][] = [
  ["Time to Diagnose", "16 min"],
  ["Time to Engineer", "6 min"],
  ["Approval Time", "8 min"],
  ["Execution Time", "17 min"],
  ["Validation Time", "< 1 min"],
  ["Total Active Remediation Time", "46 min"],
];

export const AUTOMATION_OUTCOME: [string, string][] = [
  ["Actions Engineered", "8"],
  ["Execution Stages", "8"],
  ["Control Planes", "3"],
  ["Infrastructure Mutations", "2"],
  ["Validation Tests", "21"],
  ["Manual Infrastructure Commands", "0"],
  ["Human Approval", "1 governance event"],
  ["Execution Gate Decisions", "8"],
  ["Evidence Items", "126"],
  ["Automation Coverage", "100% for this transaction"],
  ["Manual Console Access", "None"],
  ["Production Restart", "None"],
  ["Material Downtime", "None Detected"],
];

export const EVIDENCE_TABS = [
  "Summary", "Approval", "Package", "SQL", "AWS", "Windows",
  "Application", "Execution", "Validation", "Policy", "Digital Twin", "Integrity",
] as const;

export const EVIDENCE_TAB_CONTENT: Record<string, [string, string][]> = {
  Summary: [["Evidence ID", "EV-2026-01842"], ["Change Package", "CP-2026-01842 v1.0"], ["Outcome", "Remediation Verified"], ["Validation", "21 / 21 Passed"], ["Confidence", "98%"], ["Recorded", "May 13, 2026 12:59 PM"]],
  Approval: [["Authorization", "EXEC-AUTH-01842"], ["Primary Approver", "Jane Smith — Change Approver"], ["Technical Approver", "SQL Platform Engineering"], ["Infrastructure Approver", "Cloud Infrastructure"], ["Approved At", "May 13, 2026 10:42 AM"], ["Signature", "Valid"]],
  Package: [["Package", "CP-2026-01842"], ["Version", "1.0 (Immutable)"], ["Artifacts", "8 engineered actions"], ["Terraform", "ebs_volume size 500 → 750"], ["Checksum", "Verified"], ["Deviation", "None"]],
  SQL: [["Backup", "Log backup completed 12:44:02"], ["Log Reuse Wait", "NOTHING"], ["Log Utilization", "31%"], ["Database State", "ONLINE"], ["Read/Write Probes", "PASS / PASS"], ["Critical Errors", "0"]],
  AWS: [["Volume", "vol-0a1b2c3d4e5f67890"], ["Size", "750 GiB"], ["Modification State", "completed"], ["Attachment", "i-05ef7a91 (attached)"], ["Instance Status", "ok / ok"], ["Out-of-band changes", "0"]],
  Windows: [["Disk", "750 GB detected"], ["L: Volume", "750 GB"], ["NTFS", "Healthy"], ["Free Space", "517 GB"], ["Accessibility", "Accessible"], ["Reboot Required", "No"]],
  Application: [["Health Endpoint", "200 healthy"], ["DB Connectivity", "ok (5 ms)"], ["Synthetic Order", "PASS (812 ms)"], ["TPS", "3,472"], ["Error Rate", "0.11%"], ["P95 Latency", "229 ms"]],
  Execution: [["Execution Events", "47"], ["Stages", "8 / 8 completed"], ["Gates", "8 / 8 passed"], ["Duration", "00:17:39"], ["Safety Violations", "0"], ["Halts", "None"]],
  Validation: [["Total Tests", "21"], ["Passed", "21"], ["Failed", "0"], ["SQL", "8 / 8"], ["AWS", "5 / 5"], ["Windows + Application", "8 / 8"]],
  Policy: [["Production-Change-Policy", "v3.2 — compliant"], ["Runtime-Execution-Safety", "v2.1 — compliant"], ["Data-Protection-Policy", "v1.4 — compliant"], ["Violations", "0"], ["Waivers", "None"], ["Segregation of Duties", "Enforced"]],
  "Digital Twin": [["Asset", "SQL-PROD-07"], ["Attributes Updated", "6"], ["Attributes Verified", "2"], ["Configuration Confidence", "99%"], ["Reconciled", "May 13, 2026 12:59 PM"], ["Source", "Execution Evidence + Current Discovery"]],
  Integrity: [["Manifest", "Valid"], ["Signature", "Valid"], ["Evidence Chain", "Complete"], ["Hash", "sha256:9f4c1d2a…c02b6f"], ["Package", "evidence-2026-01842.zip"], ["Integrity", "VERIFIED"]],
};
