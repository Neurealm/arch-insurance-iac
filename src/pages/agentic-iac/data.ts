/**
 * Mock data model for the Intelligent Infrastructure as Code platform.
 *
 * The shapes here are intentionally provider-agnostic so later assets can
 * represent AWS / Azure / GCP, Kubernetes, Windows/Linux, SQL Server, AD,
 * VMware, bare metal, firewalls, load balancers, DNS/DHCP and storage
 * without reshaping the twin model.
 */

export type Health = "healthy" | "warning" | "critical" | "unknown";
export type RiskClass = "Low" | "Medium" | "High";
export type AutomationReadiness = "Ready" | "Partial" | "Manual";
export type Provider = "azure" | "aws" | "gcp" | "onprem";

export interface AssetTag {
  label: string;
}

export interface AssetIdentity {
  id: string;
  name: string;
  provider: Provider;
  assetType: string;
  os: string;
  workload: string;
  health: Health;
  environment: string;
  region: string;
  owner: string;
  criticality: string;
  lastDiscovered: string;
  cmdbId: string;
  tags: string[];
}

export interface ConfigProperty {
  label: string;
  value: string;
  /** Optional operational emphasis for values that need engineer attention. */
  tone?: "default" | "good" | "warn" | "bad";
  hint?: string;
}

export interface ConfigSection {
  key: string;
  title: string;
  properties: ConfigProperty[];
}

export type RelationshipKind =
  | "CONNECTED TO"
  | "PROTECTED BY"
  | "MONITORED BY"
  | "BACKED UP BY"
  | "HOSTS"
  | "DEPENDS ON"
  | "ROUTED THROUGH";

export type RelationshipLayer = "infrastructure" | "application" | "dependency";

export interface RelatedNode {
  id: string;
  name: string;
  type: string;
  health: Health;
  relationship: RelationshipKind;
  layer: RelationshipLayer;
  hops: 1 | 2;
  lastDiscovered: string;
  /** Position on a 0-100 coordinate plane used by the SVG relationship map. */
  x: number;
  y: number;
  detail: string[];
}

export interface AssetAction {
  id: string;
  category: ActionCategory;
  name: string;
  description: string;
  automation: AutomationReadiness;
  risk: RiskClass;
}

export type ActionCategory =
  | "Compute"
  | "Storage"
  | "Windows"
  | "IIS"
  | "Network"
  | "Security"
  | "Protection";

export interface ChangeRecord {
  id: string;
  date: string;
  action: string;
  initiatedBy: string;
  method: string;
  changeId: string;
  status: "Successful" | "Failed" | "Rolled Back";
  validation: string;
  intent: string;
  artifacts: string[];
  timestamp: string;
}

export const ACTION_CATEGORIES: ActionCategory[] = [
  "Compute",
  "Storage",
  "Windows",
  "IIS",
  "Network",
  "Security",
  "Protection",
];

export const asset: AssetIdentity = {
  id: "prod-web-023",
  name: "PROD-WEB-023",
  provider: "azure",
  assetType: "Azure Virtual Machine",
  os: "Windows Server 2022 Datacenter",
  workload: "IIS 10.0",
  health: "healthy",
  environment: "Production",
  region: "East US 2",
  owner: "Web Platform Team",
  criticality: "Tier 1",
  lastDiscovered: "5 minutes ago",
  cmdbId: "CI-7845123",
  tags: ["web", "production", "iis", "finance", "pci"],
};

export const confidenceStrip = [
  { label: "Configuration Confidence", value: "98%", tone: "good" as const },
  { label: "Relationship Confidence", value: "96%", tone: "good" as const },
  { label: "Discovery Freshness", value: "5 min", tone: "default" as const },
  { label: "Automation Coverage", value: "86%", tone: "default" as const },
  { label: "Policy Compliance", value: "94%", tone: "default" as const },
  { label: "Drift", value: "No Drift Detected", tone: "good" as const },
];

export const configSections: ConfigSection[] = [
  {
    key: "compute",
    title: "Compute",
    properties: [
      { label: "VM Size", value: "Standard_D4s_v5" },
      { label: "vCPU", value: "4" },
      { label: "Memory", value: "16 GB" },
      { label: "Power State", value: "Running", tone: "good" },
      { label: "Availability Zone", value: "2" },
    ],
  },
  {
    key: "network",
    title: "Network",
    properties: [
      { label: "Private IP", value: "10.10.2.15" },
      { label: "Subnet", value: "prod-web-subnet" },
      { label: "VNet", value: "prod-vnet-01" },
      { label: "NSG", value: "prod-web-nsg" },
      { label: "Load Balancer", value: "prod-web-lb" },
    ],
  },
  {
    key: "storage",
    title: "Storage",
    properties: [
      { label: "OS Disk", value: "prod-web-023-os" },
      { label: "Type", value: "Premium SSD v2" },
      { label: "Capacity", value: "128 GiB" },
      { label: "Data Disk", value: "prod-web-023-data01" },
      { label: "Drive", value: "D:" },
      { label: "Capacity", value: "250 GiB" },
      { label: "Utilization", value: "91%", tone: "warn", hint: "Approaching capacity threshold" },
    ],
  },
  {
    key: "os",
    title: "Operating System",
    properties: [
      { label: "Edition", value: "Windows Server 2022 Datacenter" },
      { label: "Build", value: "20348.2342" },
      { label: "Last Patch", value: "May 2026" },
      { label: "Patch Compliance", value: "95%" },
      { label: "Missing Updates", value: "2", tone: "warn" },
    ],
  },
  {
    key: "iis",
    title: "IIS",
    properties: [
      { label: "State", value: "Running", tone: "good" },
      { label: "Sites", value: "2" },
      { label: "Application Pools", value: "3" },
      { label: "Primary Site", value: "Finance-Web-App" },
      { label: "TLS Certificate", value: "Valid", tone: "good" },
      { label: "Certificate Expiration", value: "83 days" },
    ],
  },
  {
    key: "protection",
    title: "Protection",
    properties: [
      { label: "Backup", value: "Successful", tone: "good" },
      { label: "Last Backup", value: "12 hours ago" },
      { label: "Monitoring", value: "Azure Monitor / Log Analytics" },
      { label: "Security", value: "Microsoft Defender" },
    ],
  },
];

export const relatedNodes: RelatedNode[] = [
  {
    id: "prod-web-nsg",
    name: "prod-web-nsg",
    type: "Network Security Group",
    health: "healthy",
    relationship: "PROTECTED BY",
    layer: "infrastructure",
    hops: 1,
    lastDiscovered: "5 min ago",
    x: 18,
    y: 20,
    detail: ["Inbound rules: 6", "Outbound rules: 3", "Last rule change: Apr 21, 2026"],
  },
  {
    id: "prod-web-lb",
    name: "prod-web-lb",
    type: "Load Balancer",
    health: "healthy",
    relationship: "ROUTED THROUGH",
    layer: "infrastructure",
    hops: 1,
    lastDiscovered: "5 min ago",
    x: 50,
    y: 8,
    detail: ["Backend pool members: 4", "Probe: HTTPS /health", "Rule: prod-web-443"],
  },
  {
    id: "prod-vnet-01",
    name: "prod-vnet-01",
    type: "Virtual Network",
    health: "healthy",
    relationship: "CONNECTED TO",
    layer: "infrastructure",
    hops: 1,
    lastDiscovered: "5 min ago",
    x: 84,
    y: 20,
    detail: ["Address space: 10.10.0.0/16", "Subnet: prod-web-subnet", "Peerings: 2"],
  },
  {
    id: "prod-web-023-os",
    name: "prod-web-023-os",
    type: "OS Disk",
    health: "healthy",
    relationship: "CONNECTED TO",
    layer: "infrastructure",
    hops: 1,
    lastDiscovered: "5 min ago",
    x: 12,
    y: 52,
    detail: ["Premium SSD v2", "128 GiB", "Encryption: platform-managed key"],
  },
  {
    id: "prod-web-023-data01",
    name: "prod-web-023-data01",
    type: "Data Disk (D:)",
    health: "warning",
    relationship: "CONNECTED TO",
    layer: "infrastructure",
    hops: 1,
    lastDiscovered: "5 min ago",
    x: 88,
    y: 52,
    detail: ["Premium SSD v2", "250 GiB provisioned", "Utilization: 91%"],
  },
  {
    id: "prod-backup-vault",
    name: "prod-backup-vault",
    type: "Backup Vault",
    health: "healthy",
    relationship: "BACKED UP BY",
    layer: "infrastructure",
    hops: 1,
    lastDiscovered: "12 hours ago",
    x: 18,
    y: 84,
    detail: ["Policy: prod-daily-0100", "Last recovery point: 12 hours ago", "Retention: 35 days"],
  },
  {
    id: "log-analytics-workspace",
    name: "log-analytics-workspace",
    type: "Monitoring",
    health: "healthy",
    relationship: "MONITORED BY",
    layer: "infrastructure",
    hops: 1,
    lastDiscovered: "5 min ago",
    x: 84,
    y: 84,
    detail: ["Workspace: prod-eus2-law", "Agent: AMA 1.29", "Ingestion: nominal"],
  },
  {
    id: "finance-web-app",
    name: "Finance-Web-App",
    type: "Application",
    health: "healthy",
    relationship: "HOSTS",
    layer: "application",
    hops: 1,
    lastDiscovered: "5 min ago",
    x: 50,
    y: 92,
    detail: ["IIS site binding: 443", "App pool: FinanceWebPool", "Business service: Finance Portal"],
  },
  {
    id: "prod-sql-04",
    name: "prod-sql-04",
    type: "SQL Database",
    health: "healthy",
    relationship: "DEPENDS ON",
    layer: "dependency",
    hops: 2,
    lastDiscovered: "9 min ago",
    x: 92,
    y: 68,
    detail: ["Azure SQL, Business Critical", "Connection: FinanceDb", "Failover group: eus2-cus"],
  },
  {
    id: "corp-dns",
    name: "corp-dns",
    type: "DNS",
    health: "healthy",
    relationship: "DEPENDS ON",
    layer: "dependency",
    hops: 2,
    lastDiscovered: "27 min ago",
    x: 8,
    y: 68,
    detail: ["Zone: corp.internal", "Record: prod-web-023.corp.internal", "Resolvers: 2"],
  },
];

export const actions: AssetAction[] = [
  { id: "resize-compute", category: "Compute", name: "Resize Compute", description: "Change VM size (vCPU / memory) with controlled restart", automation: "Ready", risk: "Medium" },
  { id: "start-vm", category: "Compute", name: "Start VM", description: "Power on the virtual machine", automation: "Ready", risk: "Low" },
  { id: "stop-vm", category: "Compute", name: "Stop VM", description: "Deallocate the virtual machine", automation: "Ready", risk: "High" },
  { id: "restart-vm", category: "Compute", name: "Restart VM", description: "Guest-aware restart with health validation", automation: "Ready", risk: "Medium" },
  { id: "redeploy-vm", category: "Compute", name: "Redeploy VM", description: "Move the VM to new host hardware", automation: "Partial", risk: "High" },
  { id: "capture-image", category: "Compute", name: "Capture Image", description: "Create a managed image from current state", automation: "Ready", risk: "Low" },

  { id: "expand-disk", category: "Storage", name: "Expand Disk", description: "Increase attached disk and filesystem capacity", automation: "Ready", risk: "Low" },
  { id: "attach-disk", category: "Storage", name: "Attach Disk", description: "Attach a new managed disk and initialize volume", automation: "Ready", risk: "Low" },
  { id: "detach-disk", category: "Storage", name: "Detach Disk", description: "Offline and detach an attached managed disk", automation: "Partial", risk: "High" },
  { id: "create-snapshot", category: "Storage", name: "Create Snapshot", description: "Create a point-in-time managed disk snapshot", automation: "Ready", risk: "Low" },
  { id: "modify-disk-perf", category: "Storage", name: "Modify Disk Performance", description: "Adjust provisioned IOPS and throughput", automation: "Ready", risk: "Medium" },

  { id: "restart-service", category: "Windows", name: "Restart Service", description: "Restart a Windows service with dependency awareness", automation: "Ready", risk: "Medium" },
  { id: "patch-server", category: "Windows", name: "Patch Server", description: "Apply approved updates in a maintenance window", automation: "Ready", risk: "Medium" },
  { id: "modify-service", category: "Windows", name: "Modify Service", description: "Change service startup type or recovery options", automation: "Ready", risk: "Low" },
  { id: "update-configuration", category: "Windows", name: "Update Configuration", description: "Apply desired-state configuration to the guest", automation: "Partial", risk: "Medium" },
  { id: "manage-certificate", category: "Windows", name: "Manage Certificate", description: "Install, renew or remove a machine certificate", automation: "Ready", risk: "Medium" },
  { id: "modify-registry", category: "Windows", name: "Modify Registry Setting", description: "Apply a governed registry value change", automation: "Partial", risk: "High" },
  { id: "extend-filesystem", category: "Windows", name: "Extend Filesystem", description: "Extend an NTFS volume into unallocated capacity", automation: "Ready", risk: "Low" },

  { id: "recycle-app-pool", category: "IIS", name: "Recycle Application Pool", description: "Recycle an application pool with drain handling", automation: "Ready", risk: "Low" },
  { id: "restart-site", category: "IIS", name: "Restart Site", description: "Stop and start an IIS site", automation: "Ready", risk: "Medium" },
  { id: "modify-binding", category: "IIS", name: "Modify Binding", description: "Change site host header, port or certificate binding", automation: "Ready", risk: "Medium" },
  { id: "deploy-certificate", category: "IIS", name: "Deploy Certificate", description: "Deploy and bind a TLS certificate to a site", automation: "Ready", risk: "Medium" },
  { id: "modify-app-pool", category: "IIS", name: "Modify Application Pool", description: "Change identity, recycling or pipeline settings", automation: "Ready", risk: "Medium" },
  { id: "deploy-app-config", category: "IIS", name: "Deploy Application Configuration", description: "Apply governed web.config transformation", automation: "Partial", risk: "Medium" },

  { id: "modify-nsg", category: "Network", name: "Modify NSG", description: "Add, change or remove a network security rule", automation: "Ready", risk: "High" },
  { id: "modify-nic", category: "Network", name: "Modify NIC", description: "Change IP configuration or accelerated networking", automation: "Partial", risk: "High" },
  { id: "change-dns", category: "Network", name: "Change DNS", description: "Update DNS servers or resolution records", automation: "Ready", risk: "Medium" },
  { id: "modify-lb-membership", category: "Network", name: "Modify Load Balancer Membership", description: "Add or drain the asset from a backend pool", automation: "Ready", risk: "Medium" },

  { id: "review-defender", category: "Security", name: "Review Defender Findings", description: "Inspect open Microsoft Defender recommendations", automation: "Ready", risk: "Low" },
  { id: "remediate-vuln", category: "Security", name: "Remediate Vulnerability", description: "Apply remediation for an identified vulnerability", automation: "Partial", risk: "Medium" },
  { id: "rotate-secret", category: "Security", name: "Rotate Secret", description: "Rotate a managed credential or key reference", automation: "Ready", risk: "Medium" },

  { id: "run-backup", category: "Protection", name: "Run Backup", description: "Trigger an on-demand protected backup job", automation: "Ready", risk: "Low" },
  { id: "restore", category: "Protection", name: "Restore", description: "Restore from a selected recovery point", automation: "Partial", risk: "High" },
  { id: "modify-backup-policy", category: "Protection", name: "Modify Backup Policy", description: "Change schedule or retention policy binding", automation: "Ready", risk: "Medium" },
];

export const changeHistory: ChangeRecord[] = [
  {
    id: "c1",
    date: "May 12, 2026 14:32",
    action: "Expand Data Disk D:",
    initiatedBy: "Jane Smith",
    method: "IaC Pipeline",
    changeId: "CHG-10482",
    status: "Successful",
    validation: "9 / 9 Passed",
    intent: "Increase D: capacity from 200 GiB to 250 GiB ahead of month-end finance load.",
    artifacts: ["terraform/prod-web-023/disk.tf", "arm/disk-expand.json", "powershell/Extend-Volume.ps1"],
    timestamp: "2026-05-12T14:32:00Z",
  },
  {
    id: "c2",
    date: "May 5, 2026 09:15",
    action: "IIS Certificate Update",
    initiatedBy: "John Doe",
    method: "PowerShell",
    changeId: "CHG-10391",
    status: "Successful",
    validation: "8 / 8 Passed",
    intent: "Replace expiring TLS certificate on Finance-Web-App binding 443.",
    artifacts: ["powershell/Deploy-Certificate.ps1", "evidence/tls-chain-validation.json"],
    timestamp: "2026-05-05T09:15:00Z",
  },
  {
    id: "c3",
    date: "Apr 28, 2026 16:40",
    action: "OS Patch (KB5036892)",
    initiatedBy: "System",
    method: "Patch Automation",
    changeId: "CHG-10284",
    status: "Successful",
    validation: "10 / 10 Passed",
    intent: "Apply April cumulative update within the Tier 1 maintenance window.",
    artifacts: ["patch/ring-prod-web.json", "evidence/post-patch-health.json"],
    timestamp: "2026-04-28T16:40:00Z",
  },
  {
    id: "c4",
    date: "Apr 21, 2026 02:10",
    action: "Backup Policy Update",
    initiatedBy: "Jane Smith",
    method: "IaC Pipeline",
    changeId: "CHG-10192",
    status: "Successful",
    validation: "7 / 7 Passed",
    intent: "Move asset to prod-daily-0100 policy with 35-day retention.",
    artifacts: ["terraform/protection/policy-binding.tf"],
    timestamp: "2026-04-21T02:10:00Z",
  },
  {
    id: "c5",
    date: "Apr 14, 2026 11:05",
    action: "NSG Rule Update",
    initiatedBy: "John Doe",
    method: "Terraform",
    changeId: "CHG-10087",
    status: "Successful",
    validation: "6 / 6 Passed",
    intent: "Restrict inbound management access to the privileged access subnet.",
    artifacts: ["terraform/network/prod-web-nsg.tf", "evidence/rule-diff.txt"],
    timestamp: "2026-04-14T11:05:00Z",
  },
];

export const assetIntelligence = [
  { label: "Configuration Confidence", value: "98%" },
  { label: "Relationship Confidence", value: "96%" },
  { label: "Drift Detected", value: "No", tone: "good" as const },
  { label: "Automation Coverage", value: "86%" },
  { label: "Available Automated Actions", value: "37" },
  { label: "Linked Runbooks", value: "12" },
  { label: "Policy Compliance", value: "94%" },
  { label: "Open Vulnerabilities", value: "2 Medium", tone: "warn" as const },
  { label: "Last Inventory Scan", value: "5 minutes ago" },
];

export const discoverySources = [
  "Azure Resource Graph",
  "CMDB",
  "Azure Monitor",
  "Log Analytics",
  "Windows Management",
  "IIS Configuration",
];

export const provenance = [
  { domain: "Cloud Control Plane", source: "Azure Resource Graph" },
  { domain: "Configuration Management", source: "CMDB" },
  { domain: "Operating System", source: "Windows Management" },
  { domain: "Application Configuration", source: "IIS" },
  { domain: "Telemetry", source: "Azure Monitor" },
  { domain: "Logs", source: "Log Analytics" },
  { domain: "Protection", source: "Backup Vault" },
  { domain: "Security", source: "Microsoft Defender" },
];

export const provenanceStats = [
  { label: "Last reconciliation", value: "5 minutes ago" },
  { label: "Objects reconciled", value: "47" },
  { label: "Relationships resolved", value: "18" },
  { label: "Configuration attributes", value: "126" },
];

export interface ActionPlan {
  actionTitle: string;
  currentState: { label: string; value: string; tone?: "warn" }[];
  capacityOptions: string[];
  defaultCapacity: string;
  currentCapacity: string;
  operations: string[];
  methods: string[];
  interruption: string;
  duration: string;
  risk: RiskClass;
  rollback: string;
  policy: string;
}

/** Deep plan for the demonstrated action; other actions render a generic plan. */
export const expandDiskPlan: ActionPlan = {
  actionTitle: "Expand Data Disk",
  currentState: [
    { label: "Azure Managed Disk", value: "prod-web-023-data01" },
    { label: "Provisioned", value: "250 GiB" },
    { label: "Windows Volume", value: "D:" },
    { label: "Utilization", value: "91%", tone: "warn" },
  ],
  capacityOptions: ["300 GiB", "500 GiB", "750 GiB", "1 TiB"],
  defaultCapacity: "500 GiB",
  currentCapacity: "250 GiB",
  operations: [
    "Validate Azure disk expansion eligibility",
    "Confirm successful recovery point",
    "Validate storage policy",
    "Generate infrastructure change",
    "Modify Azure Managed Disk",
    "Wait for Azure control-plane completion",
    "Rescan Windows storage",
    "Extend NTFS filesystem",
    "Validate filesystem capacity",
    "Validate IIS service",
    "Execute application health test",
    "Capture resulting state",
  ],
  methods: ["Terraform", "Azure Resource Manager API", "PowerShell"],
  interruption: "None",
  duration: "4–7 minutes",
  risk: "Low",
  rollback:
    "Disk capacity reduction is not directly supported. Compensating recovery procedure available.",
  policy: "Production change approval required.",
};

export function genericPlan(action: AssetAction): ActionPlan {
  return {
    actionTitle: action.name,
    currentState: [
      { label: "Target asset", value: asset.name },
      { label: "Asset type", value: asset.assetType },
      { label: "Environment", value: asset.environment },
      { label: "Criticality", value: asset.criticality },
    ],
    capacityOptions: [],
    defaultCapacity: "",
    currentCapacity: "",
    operations: [
      "Validate operational eligibility",
      "Confirm protection state",
      "Validate applicable policy",
      "Generate infrastructure change",
      `Execute ${action.name.toLowerCase()}`,
      "Validate resulting state",
      "Execute application health test",
      "Capture resulting state",
    ],
    methods: ["Terraform", "Azure Resource Manager API", "PowerShell"],
    interruption: action.risk === "Low" ? "None" : "Brief service interruption possible",
    duration: action.risk === "High" ? "10–20 minutes" : "3–8 minutes",
    risk: action.risk,
    rollback:
      action.risk === "High"
        ? "Rollback requires a compensating procedure and an approved recovery point."
        : "Reversible through a compensating governed change.",
    policy: "Production change approval required.",
  };
}

export const REFRESH_STEPS = [
  "Discovering asset state...",
  "Resolving relationships...",
  "Reconciling configuration...",
  "Evaluating drift...",
  "Twin refreshed.",
];
