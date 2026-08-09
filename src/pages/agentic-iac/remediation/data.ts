/** Screen 02 — Remediation Intelligence local mock data (no APIs). */

export type ScenarioKey = "normal" | "backup-failure" | "capacity-critical" | "long-transaction";

export const SCENARIOS: { key: ScenarioKey; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "backup-failure", label: "Backup Failure" },
  { key: "capacity-critical", label: "Capacity Critical" },
  { key: "long-transaction", label: "Long Running Transaction" },
];

export interface ScenarioData {
  banner: {
    status: string;
    headline: string;
    secondary: string;
    riskScore: number;
    classification: string;
    timeToExhaustion: string;
    logUtilization: string;
    dbState: string;
    availability: string;
    serviceImpact: string;
    tone: "critical" | "high" | "stable";
  };
  sql: {
    logReuseWait: string;
    lastLogBackup: string;
    currentLogSize: string;
    usedPct: number;
    freeGb: string;
    growthRate: string;
    forecastExhaustion: string;
    vlfCount: string;
    vlfHealth: string;
    writeRate: string;
    checkpointAge: string;
    activeTransactions: string;
    longestTransaction: string;
  };
  rootCause: {
    title: string;
    detail: string;
    observed: string[];
    confidence: number;
  };
  contributing: { label: string; value: string }[];
  decisionTrace: {
    observed: string[];
    inferences: string[];
    decisions: string[];
    rejected: { label: string; reason: string }[];
    final: string;
    confidence: number;
  };
  recommendationNote: string;
}

const baseSql = {
  currentLogSize: "450 GB",
  vlfCount: "18,742",
  vlfHealth: "High / requires review",
  writeRate: "78.4 MB/sec",
  checkpointAge: "16 min",
};

export const SCENARIO_DATA: Record<ScenarioKey, ScenarioData> = {
  "backup-failure": {
    banner: {
      status: "PRODUCTION RISK DETECTED",
      headline: "SQL Transaction Log Capacity Approaching Exhaustion",
      secondary: "Immediate action recommended to prevent potential database impact.",
      riskScore: 82,
      classification: "High",
      timeToExhaustion: "47 min",
      logUtilization: "92%",
      dbState: "ONLINE",
      availability: "Healthy",
      serviceImpact: "None",
      tone: "high",
    },
    sql: {
      ...baseSql,
      logReuseWait: "LOG_BACKUP",
      lastLogBackup: "2h 14m ago",
      usedPct: 92,
      freeGb: "38 GB",
      growthRate: "+7.8 GB/hour",
      forecastExhaustion: "47 minutes",
      activeTransactions: "2",
      longestTransaction: "00:08:32",
    },
    rootCause: {
      title: "Transaction log backup has not completed successfully.",
      detail:
        "The database uses the FULL recovery model. SQL Server requires successful transaction log backups before inactive log records can be marked reusable when the reuse wait is LOG_BACKUP.",
      observed: ["log_reuse_wait_desc = LOG_BACKUP", "Last successful transaction log backup: 2h 14m ago"],
      confidence: 96,
    },
    contributing: [
      { label: "VLF count unusually high", value: "18,742" },
      { label: "Active long-running transaction", value: "00:08:32" },
      { label: "Log filesystem utilization", value: "92%" },
      { label: "Storage headroom", value: "38 GB" },
      { label: "Recent log growth", value: "+7.8 GB/hour" },
      { label: "Backup pipeline state", value: "Degraded" },
    ],
    decisionTrace: {
      observed: [
        "Log utilization 92%",
        "Growth +7.8 GB/hour",
        "FULL recovery model",
        "LOG_BACKUP",
        "Last log backup 2h14m",
      ],
      inferences: [
        "Inactive log records cannot currently be reused.",
        "Continued growth threatens filesystem capacity.",
      ],
      decisions: [
        "Correct backup/truncation condition first.",
        "Increase storage headroom to reduce near-term production risk.",
      ],
      rejected: [
        { label: "Restart SQL", reason: "No technical requirement and introduces outage." },
        { label: "Shrink log", reason: "Does not resolve reuse blocker and may worsen VLF fragmentation." },
      ],
      final: "Stabilize SQL + Protect Capacity",
      confidence: 96,
    },
    recommendationNote:
      "Execute an immediate transaction log backup to remove the LOG_BACKUP wait, then expand EBS and extend the filesystem to increase capacity headroom.",
  },
  "capacity-critical": {
    banner: {
      status: "PRODUCTION RISK DETECTED",
      headline: "SQL Transaction Log Capacity Critically Low",
      secondary: "Capacity exhaustion imminent. Immediate remediation required.",
      riskScore: 94,
      classification: "Critical",
      timeToExhaustion: "14 min",
      logUtilization: "97%",
      dbState: "ONLINE",
      availability: "Healthy",
      serviceImpact: "None",
      tone: "critical",
    },
    sql: {
      ...baseSql,
      currentLogSize: "473 GB",
      logReuseWait: "LOG_BACKUP",
      lastLogBackup: "2h 41m ago",
      usedPct: 97,
      freeGb: "15 GB",
      growthRate: "+8.4 GB/hour",
      forecastExhaustion: "14 minutes",
      activeTransactions: "3",
      longestTransaction: "00:11:04",
    },
    rootCause: {
      title: "Transaction log backup has not completed successfully.",
      detail:
        "The reuse blocker remains LOG_BACKUP, and remaining filesystem headroom is now below the production safety threshold.",
      observed: ["log_reuse_wait_desc = LOG_BACKUP", "Free capacity: 15 GB", "Forecast exhaustion: 14 minutes"],
      confidence: 97,
    },
    contributing: [
      { label: "Log filesystem utilization", value: "97%" },
      { label: "Storage headroom", value: "15 GB" },
      { label: "Recent log growth", value: "+8.4 GB/hour" },
      { label: "VLF count unusually high", value: "18,742" },
      { label: "Backup pipeline state", value: "Degraded" },
      { label: "Safety threshold", value: "Violated" },
    ],
    decisionTrace: {
      observed: ["Log utilization 97%", "Free capacity 15 GB", "Growth +8.4 GB/hour", "LOG_BACKUP"],
      inferences: [
        "Filesystem exhaustion is likely within the next change window.",
        "Backup-only remediation may not complete before capacity is exhausted.",
      ],
      decisions: [
        "Execute log backup and EBS expansion in parallel-approved sequence.",
        "Escalate EBS capacity protection to immediate priority.",
      ],
      rejected: [
        { label: "Restart SQL", reason: "No technical requirement and introduces outage." },
        { label: "Shrink log", reason: "Does not resolve reuse blocker and may worsen VLF fragmentation." },
      ],
      final: "Protect Capacity + Stabilize SQL",
      confidence: 97,
    },
    recommendationNote:
      "Capacity headroom is below the safety threshold. Expand EBS capacity while executing the transaction log backup.",
  },
  "long-transaction": {
    banner: {
      status: "PRODUCTION RISK DETECTED",
      headline: "Transaction Log Reuse Blocked by Active Transaction",
      secondary: "Long-running transaction is preventing log truncation.",
      riskScore: 76,
      classification: "High",
      timeToExhaustion: "58 min",
      logUtilization: "89%",
      dbState: "ONLINE",
      availability: "Healthy",
      serviceImpact: "None",
      tone: "high",
    },
    sql: {
      ...baseSql,
      currentLogSize: "436 GB",
      logReuseWait: "ACTIVE_TRANSACTION",
      lastLogBackup: "12m ago",
      usedPct: 89,
      freeGb: "52 GB",
      growthRate: "+6.9 GB/hour",
      forecastExhaustion: "58 minutes",
      activeTransactions: "4",
      longestTransaction: "01:47:18",
    },
    rootCause: {
      title: "Long-running active transaction preventing log reuse.",
      detail:
        "Transaction log backups are completing, but an open transaction is holding the log active, so inactive VLFs cannot be marked reusable.",
      observed: ["log_reuse_wait_desc = ACTIVE_TRANSACTION", "Longest running transaction: 01:47:18"],
      confidence: 94,
    },
    contributing: [
      { label: "Longest running transaction", value: "01:47:18" },
      { label: "Active transactions", value: "4" },
      { label: "Log filesystem utilization", value: "89%" },
      { label: "Storage headroom", value: "52 GB" },
      { label: "Recent log growth", value: "+6.9 GB/hour" },
      { label: "Backup pipeline state", value: "Healthy" },
    ],
    decisionTrace: {
      observed: [
        "Log utilization 89%",
        "Growth +6.9 GB/hour",
        "FULL recovery model",
        "ACTIVE_TRANSACTION",
        "Last log backup 12m",
      ],
      inferences: [
        "Backups are healthy; the open transaction is holding log space active.",
        "Truncation resumes once the transaction commits or is resolved.",
      ],
      decisions: [
        "Identify and engage the session owner for the long-running transaction.",
        "Maintain capacity headroom protection until the transaction resolves.",
      ],
      rejected: [
        { label: "Restart SQL", reason: "Would roll back the open transaction and cause production impact." },
        { label: "Shrink log", reason: "Cannot reclaim space while the log remains active." },
      ],
      final: "Resolve Active Transaction + Protect Capacity",
      confidence: 94,
    },
    recommendationNote:
      "Backups are completing normally. Focus remediation on resolving the long-running transaction while protecting capacity.",
  },
  normal: {
    banner: {
      status: "CONDITION STABLE",
      headline: "SQL Transaction Log Operating Within Normal Parameters",
      secondary: "No remediation required. Continuous evaluation active.",
      riskScore: 18,
      classification: "Low",
      timeToExhaustion: "No forecast",
      logUtilization: "41%",
      dbState: "ONLINE",
      availability: "Healthy",
      serviceImpact: "None",
      tone: "stable",
    },
    sql: {
      ...baseSql,
      currentLogSize: "204 GB",
      logReuseWait: "NOTHING",
      lastLogBackup: "6m ago",
      usedPct: 41,
      freeGb: "284 GB",
      growthRate: "+0.9 GB/hour",
      forecastExhaustion: "No forecast",
      vlfCount: "612",
      vlfHealth: "Normal",
      writeRate: "44.1 MB/sec",
      checkpointAge: "3 min",
      activeTransactions: "1",
      longestTransaction: "00:00:12",
    },
    rootCause: {
      title: "No blocking condition detected.",
      detail:
        "Transaction log backups are completing on schedule and inactive log records are being reused normally.",
      observed: ["log_reuse_wait_desc = NOTHING", "Last successful transaction log backup: 6m ago"],
      confidence: 99,
    },
    contributing: [
      { label: "VLF count", value: "612" },
      { label: "Longest running transaction", value: "00:00:12" },
      { label: "Log filesystem utilization", value: "41%" },
      { label: "Storage headroom", value: "284 GB" },
      { label: "Recent log growth", value: "+0.9 GB/hour" },
      { label: "Backup pipeline state", value: "Healthy" },
    ],
    decisionTrace: {
      observed: ["Log utilization 41%", "Growth +0.9 GB/hour", "FULL recovery model", "NOTHING"],
      inferences: ["Log reuse is functioning as designed.", "No capacity risk within the forecast horizon."],
      decisions: ["Continue observation.", "No infrastructure mutation proposed."],
      rejected: [
        { label: "Expand EBS", reason: "No capacity pressure detected." },
        { label: "Shrink log", reason: "No operational benefit and introduces VLF fragmentation risk." },
      ],
      final: "Continue Monitoring",
      confidence: 99,
    },
    recommendationNote: "No remediation is required. The system will continue evaluating log growth and reuse behaviour.",
  },
};

export const ASSET = {
  server: "SQL-PROD-07",
  database: "OrdersDB",
  environment: "Production",
  cloud: "AWS",
  region: "us-east-1",
  compute: "AWS EC2",
  os: "Windows Server 2022",
  platform: "Microsoft SQL Server 2022 Enterprise",
  role: "Primary",
  recoveryModel: "FULL",
  application: "Order Processing Service",
  criticality: "Tier 1",
  logFile: "L:\\MSSQL\\LOG\\OrdersDB.ldf",
  filesystemCapacity: "500 GB",
  ebsVolume: "vol-0a81f2c4e7b9d1234",
  ebsType: "gp3",
  ebsCapacity: "500 GB",
  ebsProposed: "750 GB",
  instanceType: "m5.2xlarge",
  instanceId: "i-0f1a2b3c4d5e6f789",
};

export const CONDITIONS_EVALUATED: { code: string; result: string; state: "detected" | "secondary" | "clear" }[] = [
  { code: "LOG_BACKUP", result: "Detected", state: "detected" },
  { code: "ACTIVE_TRANSACTION", result: "Present but not primary blocker", state: "secondary" },
  { code: "AVAILABILITY_REPLICA", result: "Not detected", state: "clear" },
  { code: "REPLICATION", result: "Not detected", state: "clear" },
  { code: "DATABASE_MIRRORING", result: "Not detected", state: "clear" },
  { code: "CHECKPOINT", result: "Not primary blocker", state: "secondary" },
  { code: "ACTIVE_BACKUP_OR_RESTORE", result: "Not detected", state: "clear" },
  { code: "XTP_CHECKPOINT", result: "Not detected", state: "clear" },
  { code: "OTHER_TRANSIENT", result: "Not detected", state: "clear" },
];

export type Risk = "Low" | "Medium" | "High";

export interface RemediationOption {
  priority: number;
  action: string;
  purpose: string;
  impact: string;
  automation: string;
  risk: Risk;
  recommendation: string;
  tone: "primary" | "required" | "recommended" | "warning" | "prohibited";
  note?: string;
}

export const REMEDIATION_OPTIONS: RemediationOption[] = [
  {
    priority: 1,
    action: "Execute Transaction Log Backup",
    purpose: "Restore successful log backup and remove the LOG_BACKUP reuse blocker.",
    impact: "None expected",
    automation: "Available",
    risk: "Low",
    recommendation: "EXECUTE FIRST",
    tone: "primary",
  },
  {
    priority: 2,
    action: "Validate Log Reuse",
    purpose: "Confirm SQL Server can reuse inactive log space after successful backup.",
    impact: "None",
    automation: "Available",
    risk: "Low",
    recommendation: "REQUIRED",
    tone: "required",
  },
  {
    priority: 3,
    action: "Expand AWS EBS Volume",
    purpose: "Increase infrastructure capacity headroom while the underlying SQL condition is stabilized. 500 GB → 750 GB.",
    impact: "None expected, pending EBS modification eligibility validation.",
    automation: "Available",
    risk: "Low",
    recommendation: "RECOMMENDED CAPACITY PROTECTION",
    tone: "recommended",
  },
  {
    priority: 4,
    action: "Extend Windows L: Volume",
    purpose: "Expose newly provisioned EBS capacity to the Windows filesystem. Method: PowerShell.",
    impact: "None expected",
    automation: "Available",
    risk: "Low",
    recommendation: "REQUIRED AFTER EBS EXPANSION",
    tone: "required",
  },
  {
    priority: 5,
    action: "Investigate Backup Pipeline Failure",
    purpose: "Determine why scheduled SQL transaction log backups stopped completing successfully.",
    impact: "None",
    automation: "Partially available",
    risk: "Low",
    recommendation: "REQUIRED ROOT-CAUSE FOLLOW-UP",
    tone: "required",
  },
  {
    priority: 6,
    action: "Shrink SQL Log File",
    purpose: "Return allocated log file space to filesystem.",
    impact: "Potential performance impact",
    automation: "Available",
    risk: "Medium",
    recommendation: "NOT RECOMMENDED",
    tone: "warning",
    note: "Shrinking the log does not resolve the truncation blocker and can contribute to repeated growth and VLF fragmentation.",
  },
  {
    priority: 7,
    action: "Restart SQL Server",
    purpose: "Attempt to reset condition.",
    impact: "Production interruption",
    automation: "—",
    risk: "High",
    recommendation: "PROHIBITED",
    tone: "prohibited",
    note: "No evidence indicates restart is required and a restart introduces unnecessary production impact.",
  },
];

export const PLAN_PHASES: { title: string; steps: string[] }[] = [
  {
    title: "Phase 1 — Stabilize SQL",
    steps: [
      "Validate current SQL and database state.",
      "Validate backup destination and backup pipeline.",
      "Execute immediate transaction log backup.",
      "Verify backup completion.",
      "Re-query log reuse wait.",
      "Confirm inactive VLF reuse.",
      "Measure log utilization and growth rate.",
    ],
  },
  {
    title: "Phase 2 — Protect Infrastructure Capacity",
    steps: [
      "Validate EBS online modification eligibility.",
      "Expand EBS volume from 500 GB to 750 GB.",
      "Monitor EBS modification state.",
      "Rescan Windows storage.",
      "Extend L: NTFS volume.",
      "Validate resulting filesystem capacity.",
    ],
  },
  {
    title: "Phase 3 — Validate Service",
    steps: [
      "Validate SQL Server state.",
      "Validate OrdersDB ONLINE.",
      "Validate database write operation.",
      "Validate application connectivity.",
      "Validate Order Processing Service.",
      "Validate backup pipeline.",
      "Validate monitoring.",
      "Capture resulting digital-twin state.",
    ],
  },
  {
    title: "Phase 4 — Follow-Up",
    steps: [
      "Investigate backup pipeline failure.",
      "Review VLF count.",
      "Review transaction log sizing strategy.",
      "Determine whether 750 GB should become the permanent IaC desired state.",
    ],
  },
];

export const WHY_THIS_APPROACH = [
  "Addresses root cause rather than only adding storage.",
  "Provides immediate capacity protection.",
  "Avoids unnecessary SQL restart.",
  "Avoids log shrink as a default remediation.",
  "Preserves application availability.",
  "Uses existing infrastructure control planes.",
  "Creates repeatable automation artifacts.",
  "Allows human approval before infrastructure mutation.",
  "Produces validation evidence.",
];

export const AGENTS: { name: string; inputs: string[]; result: string; meta?: string }[] = [
  {
    name: "SQL Diagnostic Agent",
    inputs: [
      "Database state",
      "Recovery model",
      "log_reuse_wait_desc",
      "log_space_usage",
      "Active transactions",
      "Backup history",
      "VLF information",
    ],
    result: "LOG_BACKUP identified as primary reuse blocker.",
    meta: "Confidence 96%",
  },
  {
    name: "Infrastructure Context Agent",
    inputs: [
      "SQL-PROD-07",
      "EC2 instance",
      "Windows volume L:",
      "EBS volume",
      "Application dependency",
      "Monitoring",
      "Backup relationship",
    ],
    result: "12 infrastructure relationships resolved.",
  },
  {
    name: "Capacity Risk Agent",
    inputs: ["Current utilization", "Growth velocity", "Historical utilization", "Free capacity", "EBS capacity"],
    result: "Estimated exhaustion: 47 minutes.",
  },
  {
    name: "Remediation Planning Agent",
    inputs: ["7 remediation strategies evaluated", "2 rejected"],
    result: "Recommended 5-step primary sequence.",
  },
  {
    name: "Policy Agent",
    inputs: [
      "Production change policy",
      "Database availability requirements",
      "Change window",
      "EBS online modification policy",
      "Automation authority",
    ],
    result:
      "SQL backup action auto-approved. EBS capacity modification requires human approval. SQL restart prohibited without incident commander approval.",
  },
  {
    name: "Validation Agent",
    inputs: ["SQL validation tests: 8", "AWS tests: 5", "Windows tests: 4", "Application tests: 4"],
    result: "21 validation tests prepared.",
  },
];

export const EVIDENCE_SOURCES = [
  "SQL Server DMVs",
  "SQL Server Backup History",
  "Windows Storage Management",
  "AWS EC2 API",
  "AWS EBS API",
  "CloudWatch",
  "CMDB",
  "Application Dependency Map",
  "Backup Platform",
  "Infrastructure Repository",
  "Policy Repository",
];

export const AUTOMATION_AUTHORITY: { capability: string; authority: string; tone: "auto" | "policy" | "human" | "prohibited" }[] = [
  { capability: "Observe", authority: "Autonomous", tone: "auto" },
  { capability: "Diagnose", authority: "Autonomous", tone: "auto" },
  { capability: "Recommend", authority: "Autonomous", tone: "auto" },
  { capability: "Generate Change", authority: "Autonomous", tone: "auto" },
  { capability: "Execute SQL Backup", authority: "Policy Approved", tone: "policy" },
  { capability: "Modify Production EBS", authority: "Human Approval", tone: "human" },
  { capability: "Extend Windows Volume", authority: "Human Approval inherited from change package", tone: "human" },
  { capability: "Restart SQL", authority: "Prohibited", tone: "prohibited" },
];

export const REFRESH_STEPS = [
  "Collecting SQL state...",
  "Querying AWS infrastructure...",
  "Resolving dependencies...",
  "Evaluating telemetry...",
  "Comparing remediation strategies...",
  "Analysis complete.",
];

export type DepHealth = "healthy" | "warning" | "critical";

export interface DepNode {
  id: string;
  name: string;
  type: string;
  sub?: string;
  health: DepHealth;
  state: string;
  relationship: string;
  x: number;
  y: number;
}

export const DEP_NODES: DepNode[] = [
  { id: "ordersdb", name: "OrdersDB", type: "SQL Database", health: "healthy", state: "ONLINE / FULL recovery", relationship: "SERVES", x: 12, y: 20 },
  { id: "ldf", name: "OrdersDB.ldf", type: "Log File", sub: "L:\\MSSQL\\LOG\\", health: "critical", state: "450 GB, growing", relationship: "USES", x: 36, y: 20 },
  { id: "volume", name: "Disk L:", type: "NTFS Volume", health: "warning", state: "92% utilized", relationship: "RESIDES ON", x: 60, y: 20 },
  { id: "ebs", name: "vol-0a81f2c4e7b9d1234", type: "EBS Volume (gp3)", sub: "500 GB", health: "warning", state: "Modification eligible", relationship: "BACKED BY", x: 85, y: 20 },
  { id: "sqlserver", name: "SQL Server 2022", type: "Database Platform", health: "healthy", state: "Enterprise Edition", relationship: "HOSTED ON", x: 12, y: 52 },
  { id: "ec2", name: "i-0f1a2b3c4d5e6f789", type: "EC2 Instance", sub: "m5.2xlarge", health: "healthy", state: "running", relationship: "HOSTED ON", x: 36, y: 52 },
  { id: "host", name: "SQL-PROD-07", type: "AWS EC2 Host", health: "healthy", state: "Windows Server 2022", relationship: "HOSTED ON", x: 60, y: 52 },
  { id: "monitoring", name: "Monitoring", type: "CloudWatch / SQL Insights", health: "healthy", state: "Reporting", relationship: "MONITORED BY", x: 85, y: 52 },
  { id: "vpc", name: "VPC / Subnet", type: "Network", sub: "us-east-1a", health: "healthy", state: "Attached", relationship: "RESIDES ON", x: 12, y: 82 },
  { id: "app", name: "Order Processing Service", type: "Application", health: "healthy", state: "3,450 tx/min", relationship: "SERVES", x: 40, y: 82 },
  { id: "backup", name: "Backup Pipeline", type: "SQL Backup Job", health: "critical", state: "Degraded — last success 2h 14m", relationship: "PROTECTED BY", x: 68, y: 82 },
  { id: "awsbackup", name: "AWS Backup Vault", type: "Backup Service", health: "healthy", state: "Available", relationship: "PROTECTED BY", x: 90, y: 82 },
];

export const DEP_EDGES: { from: string; to: string; label: string; dashed?: boolean }[] = [
  { from: "ordersdb", to: "ldf", label: "USES" },
  { from: "ldf", to: "volume", label: "RESIDES ON" },
  { from: "volume", to: "ebs", label: "BACKED BY", dashed: true },
  { from: "ordersdb", to: "sqlserver", label: "HOSTED ON" },
  { from: "sqlserver", to: "ec2", label: "HOSTED ON" },
  { from: "ec2", to: "host", label: "HOSTED ON" },
  { from: "ebs", to: "host", label: "BACKED BY", dashed: true },
  { from: "host", to: "monitoring", label: "MONITORED BY", dashed: true },
  { from: "ec2", to: "vpc", label: "RESIDES ON" },
  { from: "ordersdb", to: "app", label: "SERVES" },
  { from: "ordersdb", to: "backup", label: "PROTECTED BY" },
  { from: "backup", to: "awsbackup", label: "PROTECTED BY" },
];
