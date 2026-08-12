/**
 * Discovery Configuration — deterministic seeded data model.
 * Structured so each collection can later be swapped for an API response
 * without changing the page components.
 */

export type ViewMode = "executive" | "operations" | "governance";

export type SourceCategory =
  | "Documents" | "Tickets" | "Chat" | "Meetings" | "Code" | "APIs" | "Telemetry" | "Other";

export type SourceStatus = "Healthy" | "Warning" | "Degraded" | "Paused";
export type AccessState = "Approved" | "Restricted" | "Pending" | "Denied";
export type DiscoveryMode = "Streaming" | "Incremental" | "Scheduled" | "Batch" | "Metadata only" | "Permission validation only";
export type AccessClassification = "Public" | "Internal" | "Confidential" | "Restricted" | "Highly Restricted";
export type AuthMethod = "OAuth" | "Service Account" | "API Key" | "Personal Access Token" | "Basic Authentication" | "Managed Identity" | "Custom Credential";

export interface DiscoveryConfiguration {
  id: string;
  name: string;
  environment: string;
  status: "Active" | "Draft" | "Pending Approval";
  version: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  approvalStatus: "Approved" | "Pending" | "Not required";
}

export interface SourceConfiguration {
  id: string;
  name: string;
  category: SourceCategory;
  platform: string;
  businessOwner: string;
  technicalOwner: string;
  businessUnit: string;
  team: string;
  knowledgeDomains: string[];
  status: SourceStatus;
  access: AccessState;
  accessClassification: AccessClassification;
  authenticationMethod: AuthMethod;
  authorizationScope: string[];
  discoveryMode: DiscoveryMode;
  scheduleId: string;
  scheduleLabel: string;
  lastRun: string;
  artifactEstimate: number;
  coverage: number;
  warnings: string[];
  environment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorConfiguration {
  id: string;
  sourceId: string;
  name: string;
  platform: string;
  connectorType: string;
  authenticationMethod: AuthMethod;
  authenticationStatus: "Valid" | "Expiring" | "Failed";
  tokenExpiration: string;
  permissionScope: string[];
  dataResidency: string;
  retryPolicy: string;
  rateLimit: string;
  timeout: string;
  pollingInterval: string;
  streamingEnabled: boolean;
  lastSuccessfulTest: string;
  lastFailedTest: string;
  averageLatency: string;
  warnings: string[];
}

export interface DiscoveryPolicy {
  id: string;
  name: string;
  description: string;
  businessPurpose: string;
  enabled: boolean;
  owner: string;
  coveredSources: number;
  coveredCategories: SourceCategory[];
  classifications: AccessClassification[];
  excludedClassifications: AccessClassification[];
  knowledgeDomains: string[];
  triggers: string[];
  actions: string[];
  exceptions: string[];
  uncoveredSources: string[];
  reviewCadence: string;
  approvalOwner: string;
  lastUpdated: string;
  audit: { at: string; by: string; change: string }[];
}

export interface ScheduleProfile {
  id: string;
  name: string;
  frequency: string;
  timezone: string;
  nextRun: string;
  sources: number;
  status: "Active" | "Paused";
  owner: string;
  lastUpdated: string;
  retryPolicy: string;
  maximumDuration: string;
  notificationRuleIds: string[];
}

export interface DataClassificationRule {
  id: string;
  name: AccessClassification;
  description: string;
  sources: number;
  status: "Active" | "Inactive";
  owner: string;
  retention: string;
  reviewDate: string;
  detectionCriteria: string;
  keywords: string[];
  patterns: string[];
  sourceCategories: SourceCategory[];
  knowledgeDomains: string[];
  accessRequirements: string;
  dataResidency: string;
  reviewCadence: string;
  actions: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  eventType: string;
  severity: "Info" | "Warning" | "Critical";
  threshold: string;
  sources: string;
  categories: string;
  teams: string;
  recipients: string;
  deliveryChannels: string[];
  escalationDelay: string;
  repeatFrequency: string;
  enabled: boolean;
}

export interface ConfigurationChange {
  id: string;
  time: string;
  objectType: string;
  objectId: string;
  changeType: string;
  description: string;
  previousValue: string;
  newValue: string;
  changedBy: string;
  changeReason: string;
  approvalStatus: "Approved" | "Pending" | "Auto-approved";
  auditId: string;
  relatedSource?: string;
  relatedPolicy?: string;
  relatedSchedule?: string;
}

export interface DiscoveryOption {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  category: "Content" | "Detection" | "Governance" | "Operations";
  requiresApproval: boolean;
}

export interface ConnectorSummaryRow {
  id: string;
  label: string;
  count: number;
  detail: string;
  items: string[];
}

/* -------------------------------- filters -------------------------------- */

export interface Filters {
  businessUnit: string;
  team: string;
  knowledgeDomain: string;
  sourceCategory: string;
  platform: string;
  owner: string;
  connectorStatus: string;
  accessClassification: string;
  discoveryMode: string;
  environment: string;
  configurationStatus: string;
  scheduleProfile: string;
}

export const defaultFilters: Filters = {
  businessUnit: "All", team: "All", knowledgeDomain: "All", sourceCategory: "All",
  platform: "All", owner: "All", connectorStatus: "All", accessClassification: "All",
  discoveryMode: "All", environment: "All", configurationStatus: "All", scheduleProfile: "All",
};

export const activeFilterCount = (f: Filters) =>
  Object.values(f).filter((v) => v !== "All").length;

export const filterOptions: Record<keyof Filters, string[]> = {
  businessUnit: ["All", "Technology", "Product", "Customer Operations", "Security"],
  team: ["All", "Engineering Operations", "Product Operations", "Customer Support", "Enterprise Architecture", "Platform Engineering", "Site Reliability Engineering", "Security Engineering"],
  knowledgeDomain: ["All", "Platform", "Product", "Support", "Architecture", "Reliability", "Security"],
  sourceCategory: ["All", "Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry"],
  platform: ["All", "Confluence Cloud", "Jira", "Slack Enterprise", "Zoom Transcripts", "GitHub Enterprise", "Datadog", "Apigee"],
  owner: ["All", "Engineering Operations", "Product Operations", "Customer Support", "Enterprise Architecture", "Platform Engineering", "Site Reliability Engineering", "Security Engineering"],
  connectorStatus: ["All", "Healthy", "Warning", "Degraded", "Paused"],
  accessClassification: ["All", "Public", "Internal", "Confidential", "Restricted", "Highly Restricted"],
  discoveryMode: ["All", "Streaming", "Incremental", "Scheduled", "Batch"],
  environment: ["All", "Production", "Staging"],
  configurationStatus: ["All", "Active", "Draft", "Pending Approval"],
  scheduleProfile: ["All", "High Frequency Sources", "Real Time Streaming", "Hourly Batch", "Daily Deep Scan", "Weekly Full Discovery"],
};

/* --------------------------------- seeds --------------------------------- */

export const configuration: DiscoveryConfiguration = {
  id: "cfg-ecf-prod",
  name: "Enterprise Discovery Configuration",
  environment: "Production",
  status: "Active",
  version: "v14.2",
  createdAt: "2024-11-02",
  updatedAt: "2025-05-12 10:15",
  updatedBy: "Alex Valencia",
  approvalStatus: "Approved",
};

export const sourceConfigurations: SourceConfiguration[] = [
  {
    id: "src-ekb", name: "Engineering Knowledge Base", category: "Documents", platform: "Confluence Cloud",
    businessOwner: "Engineering Operations", technicalOwner: "Priya Raman", businessUnit: "Technology",
    team: "Engineering Operations", knowledgeDomains: ["Platform", "Architecture"], status: "Healthy",
    access: "Approved", accessClassification: "Internal", authenticationMethod: "OAuth",
    authorizationScope: ["Content read", "Attachments", "Historical content"], discoveryMode: "Incremental",
    scheduleId: "sch-high", scheduleLabel: "Every 15 min", lastRun: "2 min ago", artifactEstimate: 184320,
    coverage: 96, warnings: [], environment: "Production", createdAt: "2024-11-04", updatedAt: "2025-05-11 16:40",
  },
  {
    id: "src-backlog", name: "Product Backlog", category: "Tickets", platform: "Jira",
    businessOwner: "Product Operations", technicalOwner: "Dan Whitfield", businessUnit: "Product",
    team: "Product Operations", knowledgeDomains: ["Product"], status: "Healthy", access: "Approved",
    accessClassification: "Internal", authenticationMethod: "Service Account",
    authorizationScope: ["Content read", "Metadata only"], discoveryMode: "Incremental",
    scheduleId: "sch-high", scheduleLabel: "Every 15 min", lastRun: "3 min ago", artifactEstimate: 97430,
    coverage: 94, warnings: [], environment: "Production", createdAt: "2024-11-06", updatedAt: "2025-05-09 09:12",
  },
  {
    id: "src-support", name: "Support Collaboration", category: "Chat", platform: "Slack Enterprise",
    businessOwner: "Customer Support", technicalOwner: "Iris Nakamura", businessUnit: "Customer Operations",
    team: "Customer Support", knowledgeDomains: ["Support"], status: "Healthy", access: "Approved",
    accessClassification: "Confidential", authenticationMethod: "OAuth",
    authorizationScope: ["Content read", "Attachments"], discoveryMode: "Streaming",
    scheduleId: "sch-stream", scheduleLabel: "Real-time", lastRun: "1 min ago", artifactEstimate: 512900,
    coverage: 91, warnings: [], environment: "Production", createdAt: "2024-12-01", updatedAt: "2025-05-10 14:02",
  },
  {
    id: "src-arch", name: "Architecture Reviews", category: "Meetings", platform: "Zoom Transcripts",
    businessOwner: "Enterprise Architecture", technicalOwner: "Alex Valencia", businessUnit: "Technology",
    team: "Enterprise Architecture", knowledgeDomains: ["Architecture"], status: "Warning", access: "Approved",
    accessClassification: "Confidential", authenticationMethod: "Service Account",
    authorizationScope: ["Content read", "Historical content"], discoveryMode: "Batch",
    scheduleId: "sch-hourly", scheduleLabel: "Every 6 hours", lastRun: "9 min ago", artifactEstimate: 8420,
    coverage: 71, warnings: ["Transcript backlog exceeds 30 minutes"], environment: "Production",
    createdAt: "2025-01-15", updatedAt: "2025-05-12 10:15",
  },
  {
    id: "src-core", name: "Core Services Repository", category: "Code", platform: "GitHub Enterprise",
    businessOwner: "Platform Engineering", technicalOwner: "Marcus Hale", businessUnit: "Technology",
    team: "Platform Engineering", knowledgeDomains: ["Platform"], status: "Healthy", access: "Approved",
    accessClassification: "Internal", authenticationMethod: "Personal Access Token",
    authorizationScope: ["Content read", "Metadata only"], discoveryMode: "Incremental",
    scheduleId: "sch-high", scheduleLabel: "Every 15 min", lastRun: "4 min ago", artifactEstimate: 264100,
    coverage: 93, warnings: [], environment: "Production", createdAt: "2024-11-19", updatedAt: "2025-04-28 11:31",
  },
  {
    id: "src-telemetry", name: "Customer Telemetry", category: "Telemetry", platform: "Datadog",
    businessOwner: "Site Reliability Engineering", technicalOwner: "Nina Alvarez", businessUnit: "Technology",
    team: "Site Reliability Engineering", knowledgeDomains: ["Reliability"], status: "Healthy", access: "Approved",
    accessClassification: "Internal", authenticationMethod: "API Key",
    authorizationScope: ["Metadata only", "Content read"], discoveryMode: "Streaming",
    scheduleId: "sch-stream", scheduleLabel: "Real-time", lastRun: "30 sec ago", artifactEstimate: 1240000,
    coverage: 98, warnings: [], environment: "Production", createdAt: "2025-02-03", updatedAt: "2025-05-12 08:55",
  },
  {
    id: "src-identity", name: "Identity Services API", category: "APIs", platform: "Apigee",
    businessOwner: "Security Engineering", technicalOwner: "Jordan Lee", businessUnit: "Security",
    team: "Security Engineering", knowledgeDomains: ["Security"], status: "Degraded", access: "Restricted",
    accessClassification: "Highly Restricted", authenticationMethod: "Managed Identity",
    authorizationScope: ["Metadata only"], discoveryMode: "Scheduled",
    scheduleId: "sch-hourly", scheduleLabel: "Every 2 hours", lastRun: "12 min ago", artifactEstimate: 3120,
    coverage: 58, warnings: ["Credential rotation required", "Permission scope narrower than policy"],
    environment: "Production", createdAt: "2025-03-12", updatedAt: "2025-05-12 09:21",
  },
];

export const connectors: ConnectorConfiguration[] = sourceConfigurations.map((s, i) => ({
  id: `con-${s.id}`,
  sourceId: s.id,
  name: `${s.platform} Connector`,
  platform: s.platform,
  connectorType: s.discoveryMode === "Streaming" ? "Streaming" : "Polling",
  authenticationMethod: s.authenticationMethod,
  authenticationStatus: s.status === "Degraded" ? "Failed" : s.status === "Warning" ? "Expiring" : "Valid",
  tokenExpiration: ["2025-11-04", "2025-09-18", "2026-01-22", "2025-06-30", "2025-12-14", "2026-03-01", "2025-05-19"][i],
  permissionScope: s.authorizationScope,
  dataResidency: i % 3 === 0 ? "US East" : i % 3 === 1 ? "EU West" : "US Central",
  retryPolicy: "Exponential backoff, 5 attempts",
  rateLimit: `${(i + 3) * 100} req/min`,
  timeout: "30s",
  pollingInterval: s.scheduleLabel,
  streamingEnabled: s.discoveryMode === "Streaming",
  lastSuccessfulTest: ["09:58", "09:41", "10:02", "07:30", "09:12", "10:04", "06:12"][i],
  lastFailedTest: s.status === "Healthy" ? "—" : ["—", "—", "—", "08:44", "—", "—", "09:19"][i],
  averageLatency: `${180 + i * 45} ms`,
  warnings: s.warnings,
}));

export const connectorSummaryRows: ConnectorSummaryRow[] = [
  { id: "auth", label: "Authentication Methods", count: 12, detail: "Credential types approved for enterprise connectors.", items: ["OAuth 2.0", "Service Account", "API Key", "Personal Access Token", "Managed Identity", "Basic Authentication"] },
  { id: "perm", label: "Permission Templates", count: 18, detail: "Reusable permission scopes applied to new sources.", items: ["Read-only content", "Metadata only", "Content + attachments", "Restricted folder read", "Historical archive read"] },
  { id: "access", label: "Access Policies", count: 24, detail: "Policies that govern who may consume discovered artifacts.", items: ["Team-scoped read", "Business-unit scoped", "Security review required", "Regulated data hold"] },
  { id: "class", label: "Data Classifications", count: 9, detail: "Classification labels available to discovery.", items: ["Public", "Internal", "Confidential", "Restricted", "Highly Restricted"] },
  { id: "ret", label: "Retention Policies", count: 11, detail: "Retention windows applied to discovered artifacts.", items: ["30 days", "180 days", "1 year", "3 years", "7 years regulated"] },
  { id: "sched", label: "Scheduling Profiles", count: 14, detail: "Reusable discovery cadences.", items: ["Real-time", "Every 15 minutes", "Hourly", "Every 6 hours", "Daily", "Weekly"] },
  { id: "alert", label: "Alert Rules", count: 16, detail: "Operational and governance alerting rules.", items: ["Job failures", "Connector errors", "Permission changes", "Coverage drops"] },
];

export const policies: DiscoveryPolicy[] = [
  ["pol-access", "Access Validation", "Validates that source permissions are preserved before artifacts are registered.", 147, 0],
  ["pol-class", "Data Classification", "Applies enterprise classification labels to every discovered artifact.", 147, 0],
  ["pol-pii", "PII Detection", "Detects personal information in discovered content and restricts downstream use.", 132, 4],
  ["pol-sensitive", "Sensitive Content Detection", "Identifies confidential and regulated content prior to ingestion.", 128, 6],
  ["pol-incremental", "Incremental Discovery", "Limits scans to changed content to reduce load on enterprise systems.", 121, 2],
  ["pol-delete", "Delete Detection", "Removes artifacts from cognitive memory when deleted at the source.", 139, 1],
  ["pol-orphan", "Orphaned Content Detection", "Flags content with no active owner or team.", 118, 5],
  ["pol-autoreg", "Automatic Source Registration", "Registers newly detected sources subject to approval.", 96, 8],
].map(([id, name, description, coveredSources, exceptions], i) => ({
  id: id as string,
  name: name as string,
  description: description as string,
  businessPurpose: "Ensures the Fabric only learns from approved, governed organizational knowledge.",
  enabled: true,
  owner: ["Security Engineering", "Data Governance", "Security Engineering", "Data Governance", "Platform Engineering", "Platform Engineering", "Data Governance", "Enterprise Architecture"][i],
  coveredSources: coveredSources as number,
  coveredCategories: ["Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry"] as SourceCategory[],
  classifications: ["Internal", "Confidential", "Restricted", "Highly Restricted"] as AccessClassification[],
  excludedClassifications: ["Public"] as AccessClassification[],
  knowledgeDomains: ["Platform", "Product", "Support", "Architecture", "Reliability", "Security"],
  triggers: ["Source registration", "Scheduled discovery run", "Permission change detected"],
  actions: ["Validate", "Tag", "Restrict", "Notify owner"],
  exceptions: Array.from({ length: exceptions as number }, (_, k) => `Exception ${k + 1}: legacy archive path excluded`),
  uncoveredSources: 147 - (coveredSources as number) > 0
    ? [`${147 - (coveredSources as number)} sources outside policy scope`, "Zoom Transcripts archive", "Apigee sandbox catalog"]
    : [],
  reviewCadence: ["Quarterly", "Quarterly", "Monthly", "Monthly", "Semi-annual", "Quarterly", "Quarterly", "Monthly"][i],
  approvalOwner: "Alex Valencia",
  lastUpdated: ["2025-05-02", "2025-04-18", "2025-05-08", "2025-05-08", "2025-03-27", "2025-04-02", "2025-04-22", "2025-05-11"][i],
  audit: [
    { at: "2025-05-11 09:20", by: "Alex Valencia", change: "Coverage scope extended to Meetings" },
    { at: "2025-03-04 14:02", by: "Jordan Lee", change: "Exception added for legacy archive" },
  ],
}));

export const schedules: ScheduleProfile[] = [
  { id: "sch-high", name: "High Frequency Sources", frequency: "Every 15 minutes", timezone: "America/New_York", nextRun: "10:30 AM", sources: 64, status: "Active", owner: "Platform Engineering", lastUpdated: "2025-05-11", retryPolicy: "3 retries, 2 min backoff", maximumDuration: "10 min", notificationRuleIds: ["alr-jobs"] },
  { id: "sch-stream", name: "Real Time Streaming", frequency: "Continuous", timezone: "America/New_York", nextRun: "Continuous", sources: 18, status: "Active", owner: "Site Reliability Engineering", lastUpdated: "2025-05-10", retryPolicy: "Automatic reconnect", maximumDuration: "n/a", notificationRuleIds: ["alr-connector"] },
  { id: "sch-hourly", name: "Hourly Batch", frequency: "Every hour", timezone: "America/New_York", nextRun: "11:00 AM", sources: 23, status: "Active", owner: "Engineering Operations", lastUpdated: "2025-05-09", retryPolicy: "2 retries, 5 min backoff", maximumDuration: "45 min", notificationRuleIds: ["alr-jobs"] },
  { id: "sch-daily", name: "Daily Deep Scan", frequency: "Daily at 2:00 AM", timezone: "America/New_York", nextRun: "2:00 AM", sources: 12, status: "Active", owner: "Data Governance", lastUpdated: "2025-05-04", retryPolicy: "1 retry", maximumDuration: "4 hours", notificationRuleIds: ["alr-coverage"] },
  { id: "sch-weekly", name: "Weekly Full Discovery", frequency: "Sunday at 1:00 AM", timezone: "America/New_York", nextRun: "Sun 1:00 AM", sources: 8, status: "Active", owner: "Enterprise Architecture", lastUpdated: "2025-04-30", retryPolicy: "1 retry", maximumDuration: "8 hours", notificationRuleIds: ["alr-coverage"] },
];

export const classificationRules: DataClassificationRule[] = [
  { id: "cls-public", name: "Public", description: "Public information with no restrictions", sources: 41, status: "Active", owner: "Data Governance", retention: "3 years", reviewDate: "2025-09-01", detectionCriteria: "Source-level label", keywords: ["public", "press"], patterns: [], sourceCategories: ["Documents"], knowledgeDomains: ["Product"], accessRequirements: "None", dataResidency: "Any", reviewCadence: "Annual", actions: ["Tag"] },
  { id: "cls-internal", name: "Internal", description: "Internal use within the organization", sources: 78, status: "Active", owner: "Data Governance", retention: "3 years", reviewDate: "2025-08-15", detectionCriteria: "Default classification", keywords: ["internal"], patterns: [], sourceCategories: ["Documents", "Tickets", "Code"], knowledgeDomains: ["Platform", "Product"], accessRequirements: "Employee", dataResidency: "Region of origin", reviewCadence: "Annual", actions: ["Tag"] },
  { id: "cls-conf", name: "Confidential", description: "Business confidential information", sources: 18, status: "Active", owner: "Security Engineering", retention: "5 years", reviewDate: "2025-07-01", detectionCriteria: "Keyword and pattern match", keywords: ["confidential", "roadmap", "contract"], patterns: ["ACC-[0-9]{6}"], sourceCategories: ["Documents", "Chat", "Meetings"], knowledgeDomains: ["Architecture", "Support"], accessRequirements: "Named team", dataResidency: "Region of origin", reviewCadence: "Semi-annual", actions: ["Tag", "Restrict", "Notify"] },
  { id: "cls-restricted", name: "Restricted", description: "Restricted data with limited access", sources: 8, status: "Active", owner: "Security Engineering", retention: "7 years", reviewDate: "2025-06-20", detectionCriteria: "Pattern match and source label", keywords: ["restricted"], patterns: ["SSN|PAN"], sourceCategories: ["APIs", "Documents"], knowledgeDomains: ["Security"], accessRequirements: "Security approval", dataResidency: "In-country", reviewCadence: "Quarterly", actions: ["Restrict", "Require review"] },
  { id: "cls-high", name: "Highly Restricted", description: "Highly sensitive or regulated data", sources: 2, status: "Active", owner: "Security Engineering", retention: "7 years regulated", reviewDate: "2025-06-01", detectionCriteria: "Regulated content model", keywords: ["PHI", "PCI"], patterns: ["[0-9]{16}"], sourceCategories: ["APIs"], knowledgeDomains: ["Security"], accessRequirements: "Compliance approval", dataResidency: "In-country", reviewCadence: "Quarterly", actions: ["Restrict", "Exclude", "Quarantine"] },
];

export const discoveryOptions: DiscoveryOption[] = [
  { id: "opt-hist", name: "Include Historical Content", enabled: true, description: "Discover content created before the source was registered.", category: "Content", requiresApproval: false },
  { id: "opt-newsrc", name: "Detect New Sources Automatically", enabled: true, description: "Register newly detected systems subject to approval.", category: "Detection", requiresApproval: true },
  { id: "opt-deleted", name: "Detect Deleted Content", enabled: true, description: "Remove artifacts from memory when deleted at the source.", category: "Detection", requiresApproval: false },
  { id: "opt-sensitive", name: "Classify Sensitive Data", enabled: true, description: "Apply classification models to discovered content.", category: "Governance", requiresApproval: false },
  { id: "opt-meta", name: "Extract Metadata", enabled: true, description: "Capture ownership, timestamps, and structural metadata.", category: "Content", requiresApproval: false },
  { id: "opt-orphan", name: "Detect Orphaned Content", enabled: false, description: "Flag artifacts with no active owner or team.", category: "Detection", requiresApproval: false },
  { id: "opt-perm", name: "Validate Permissions", enabled: true, description: "Verify source permissions before registration.", category: "Governance", requiresApproval: false },
  { id: "opt-volume", name: "Estimate Ingestion Volume", enabled: true, description: "Estimate artifact volume before ingestion is queued.", category: "Operations", requiresApproval: false },
  { id: "opt-attach", name: "Capture Attachments", enabled: true, description: "Include attachments where authorization allows.", category: "Content", requiresApproval: false },
  { id: "opt-version", name: "Preserve Version History", enabled: false, description: "Retain prior revisions of discovered artifacts.", category: "Content", requiresApproval: false },
  { id: "opt-dupe", name: "Detect Duplicate Artifacts", enabled: true, description: "Collapse duplicates across systems before ingestion.", category: "Detection", requiresApproval: false },
  { id: "opt-owner", name: "Detect Conflicting Ownership", enabled: false, description: "Identify artifacts claimed by multiple teams.", category: "Governance", requiresApproval: false },
  { id: "opt-drift", name: "Enable Continuous Drift Detection", enabled: true, description: "Monitor sources for structural or ownership drift.", category: "Operations", requiresApproval: true },
  { id: "opt-registry", name: "Create Source Registry Entries Automatically", enabled: true, description: "Write qualified sources into the enterprise source registry.", category: "Operations", requiresApproval: false },
];

export const alertRules: AlertRule[] = [
  { id: "alr-jobs", name: "Discovery Job Failures", eventType: "Job failure", severity: "Critical", threshold: "1 failure", sources: "All", categories: "All", teams: "Platform Engineering", recipients: "Admins, Source Owners", deliveryChannels: ["In app", "Email"], escalationDelay: "15 min", repeatFrequency: "Hourly", enabled: true },
  { id: "alr-connector", name: "Connector Errors", eventType: "Connector error", severity: "Critical", threshold: "3 errors / 10 min", sources: "All", categories: "All", teams: "Platform Engineering", recipients: "Admins, Source Owners", deliveryChannels: ["In app", "Email"], escalationDelay: "10 min", repeatFrequency: "Hourly", enabled: true },
  { id: "alr-perm", name: "Permission Changes", eventType: "Permission change", severity: "Warning", threshold: "Any change", sources: "All", categories: "All", teams: "Security Engineering", recipients: "Security Team", deliveryChannels: ["In app"], escalationDelay: "None", repeatFrequency: "None", enabled: true },
  { id: "alr-volume", name: "High Volume Growth", eventType: "Volume growth", severity: "Warning", threshold: "+25% week over week", sources: "All", categories: "All", teams: "Data Governance", recipients: "Data Steward, Admins", deliveryChannels: ["Email"], escalationDelay: "None", repeatFrequency: "Daily", enabled: true },
  { id: "alr-coverage", name: "Coverage Drops", eventType: "Coverage decrease", severity: "Warning", threshold: "-5% coverage", sources: "All", categories: "All", teams: "Data Governance", recipients: "Data Steward, Admins", deliveryChannels: ["In app", "Email"], escalationDelay: "30 min", repeatFrequency: "Daily", enabled: true },
  { id: "alr-restricted", name: "Restricted Source Detected", eventType: "Restricted source", severity: "Critical", threshold: "Any detection", sources: "All", categories: "APIs, Documents", teams: "Security Engineering", recipients: "Security and Compliance", deliveryChannels: ["In app", "Email"], escalationDelay: "5 min", repeatFrequency: "None", enabled: true },
  { id: "alr-drift", name: "Persona Impact Risk from Source Drift", eventType: "Drift detected", severity: "Warning", threshold: "Drift score > 0.4", sources: "All", categories: "All", teams: "Enterprise Architecture", recipients: "Persona Owner", deliveryChannels: ["In app"], escalationDelay: "None", repeatFrequency: "Weekly", enabled: true },
];

export const recentChanges: ConfigurationChange[] = [
  { id: "chg-1", time: "10:15 AM", objectType: "Schedule", objectId: "sch-hourly", changeType: "Updated", description: "Updated schedule for Zoom Transcripts", previousValue: "Every 12 hours", newValue: "Every 6 hours", changedBy: "Alex Valencia", changeReason: "Reduce transcript latency", approvalStatus: "Approved", auditId: "AUD-48211", relatedSource: "Architecture Reviews", relatedSchedule: "Hourly Batch" },
  { id: "chg-2", time: "9:42 AM", objectType: "Source", objectId: "src-advisory", changeType: "Created", description: "New source added: Customer Advisory Notes", previousValue: "—", newValue: "Registered, Incremental, Internal", changedBy: "Maya Patel", changeReason: "Advisory program onboarding", approvalStatus: "Approved", auditId: "AUD-48207", relatedSource: "Customer Advisory Notes" },
  { id: "chg-3", time: "9:21 AM", objectType: "Access Policy", objectId: "pol-access", changeType: "Updated", description: "Access policy updated: Apigee API sources", previousValue: "Approved", newValue: "Restricted", changedBy: "Jordan Lee", changeReason: "Security review outcome", approvalStatus: "Approved", auditId: "AUD-48199", relatedSource: "Identity Services API", relatedPolicy: "Access Validation" },
  { id: "chg-4", time: "8:55 AM", objectType: "Classification", objectId: "cls-high", changeType: "Created", description: "New classification rule: Highly Restricted", previousValue: "—", newValue: "Active, 2 sources", changedBy: "Alex Valencia", changeReason: "Regulated data program", approvalStatus: "Approved", auditId: "AUD-48190", relatedPolicy: "Data Classification" },
  { id: "chg-5", time: "8:30 AM", objectType: "Connector", objectId: "con-servicenow", changeType: "Reauthorized", description: "Connector reauthorized: ServiceNow", previousValue: "Token expiring", newValue: "Valid until 2026-02-01", changedBy: "Maya Patel", changeReason: "Scheduled credential rotation", approvalStatus: "Auto-approved", auditId: "AUD-48181" },
];

export const accessBreakdown = [
  { label: "Approved", value: 128, pct: 87, color: "#16a34a", state: "Approved" as AccessState },
  { label: "Restricted", value: 12, pct: 8, color: "#f59e0b", state: "Restricted" as AccessState },
  { label: "Pending", value: 5, pct: 3, color: "#3b82f6", state: "Pending" as AccessState },
  { label: "Denied", value: 2, pct: 1, color: "#dc2626", state: "Denied" as AccessState },
];

export const accessMatrix = {
  rows: ["Engineering Operations", "Product Operations", "Customer Support", "Enterprise Architecture", "Platform Engineering", "Security Engineering"],
  cols: ["Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry"] as SourceCategory[],
  cell: (r: number, c: number): AccessState => {
    const k = (r * 7 + c) % 11;
    if (k === 3) return "Restricted";
    if (k === 7) return "Pending";
    if (k === 10) return "Denied";
    return "Approved";
  },
};

export const kpiTrends = {
  sources: [131, 134, 136, 139, 141, 144, 147],
  connectors: [33, 34, 35, 36, 37, 37, 38],
  jobs: [55, 56, 57, 58, 60, 61, 62],
  policy: [82, 83, 84, 86, 87, 88, 89],
  permissions: [112, 115, 117, 119, 121, 123, 124],
};

/* ------------------------------- scenarios -------------------------------- */

export type DemoScenario =
  | "healthy" | "connector-degradation" | "permission-failure" | "sensitive-data"
  | "schedule-backlog" | "coverage-gap" | "restricted-source" | "configuration-drift" | "pending-approval";

export interface ScenarioSnapshot {
  label: string;
  banner: string | null;
  configuredSources: number;
  activeConnectors: number;
  healthyConnectors: number;
  warningConnectors: number;
  degradedConnectors: number;
  scheduledJobs: number;
  policyCoverage: number;
  permissionValidations: number;
  permissionStatus: string;
  systemStatus: "Operational" | "Degraded" | "Attention required";
  degradedPanels: Partial<Record<"policies" | "sources" | "connectors" | "schedules" | "access" | "classification" | "alerts", string>>;
  extraChanges: ConfigurationChange[];
  extraNotifications: { id: string; title: string; type: string; time: string; read: boolean }[];
  pendingApproval: boolean;
  accessOverride?: { approved: number; restricted: number; pending: number; denied: number };
  sourceOverride?: Partial<Record<string, Partial<SourceConfiguration>>>;
}

const baseSnapshot: ScenarioSnapshot = {
  label: "Healthy Configuration",
  banner: null,
  configuredSources: 147,
  activeConnectors: 38,
  healthyConnectors: 35,
  warningConnectors: 2,
  degradedConnectors: 1,
  scheduledJobs: 62,
  policyCoverage: 89,
  permissionValidations: 124,
  permissionStatus: "No issues",
  systemStatus: "Operational",
  degradedPanels: {},
  extraChanges: [],
  extraNotifications: [],
  pendingApproval: false,
};

const change = (id: string, description: string, extra: Partial<ConfigurationChange> = {}): ConfigurationChange => ({
  id, time: "10:22 AM", objectType: "Configuration", objectId: id, changeType: "Detected",
  description, previousValue: "—", newValue: "—", changedBy: "System", changeReason: "Scenario event",
  approvalStatus: "Auto-approved", auditId: `AUD-${id.slice(-5)}`, ...extra,
});

export const scenarioSnapshots: Record<DemoScenario, ScenarioSnapshot> = {
  healthy: baseSnapshot,
  "connector-degradation": {
    ...baseSnapshot,
    label: "Connector Degradation",
    banner: "Connector degradation detected — 4 connectors are failing authentication or exceeding latency thresholds.",
    healthyConnectors: 30, warningConnectors: 4, degradedConnectors: 4,
    systemStatus: "Degraded",
    degradedPanels: { connectors: "4 connectors degraded. Reauthorization required for Apigee and Zoom.", sources: "2 sources are not collecting." },
    extraChanges: [change("chg-cd1", "Connector degraded: Apigee identity connector", { objectType: "Connector" })],
    extraNotifications: [{ id: "n-cd1", title: "Apigee connector failing authentication", type: "Connector failure", time: "2 min ago", read: false }],
  },
  "permission-failure": {
    ...baseSnapshot,
    label: "Permission Validation Failure",
    banner: "Permission validation failed for 6 sources — discovery paused for affected sources.",
    permissionValidations: 118, permissionStatus: "6 failures",
    systemStatus: "Attention required",
    accessOverride: { approved: 116, restricted: 18, pending: 9, denied: 4 },
    degradedPanels: { access: "6 sources failed permission validation in the last run.", sources: "Discovery paused where permissions could not be verified." },
    extraChanges: [change("chg-pf1", "Permission validation failed for Identity Services API", { objectType: "Access Policy", relatedSource: "Identity Services API" })],
    extraNotifications: [{ id: "n-pf1", title: "Permission validation failure on 6 sources", type: "Permission validation issue", time: "just now", read: false }],
  },
  "sensitive-data": {
    ...baseSnapshot,
    label: "Sensitive Data Detected",
    banner: "Sensitive content detected in 3 sources — artifacts quarantined pending review.",
    systemStatus: "Attention required",
    degradedPanels: { classification: "3 sources produced Highly Restricted matches awaiting review." },
    extraChanges: [change("chg-sd1", "Highly Restricted content detected in Support Collaboration", { objectType: "Classification" })],
    extraNotifications: [{ id: "n-sd1", title: "Sensitive data detected in Support Collaboration", type: "Sensitive data detection", time: "5 min ago", read: false }],
  },
  "schedule-backlog": {
    ...baseSnapshot,
    label: "Schedule Backlog",
    banner: "Discovery backlog building — 9 scheduled jobs are behind their target window.",
    scheduledJobs: 71,
    systemStatus: "Degraded",
    degradedPanels: { schedules: "9 jobs behind schedule. Hourly Batch is 38 minutes late." },
    extraChanges: [change("chg-sb1", "Hourly Batch exceeded maximum duration", { objectType: "Schedule" })],
    extraNotifications: [{ id: "n-sb1", title: "Hourly Batch schedule is running late", type: "Schedule failure", time: "8 min ago", read: false }],
  },
  "coverage-gap": {
    ...baseSnapshot,
    label: "Policy Coverage Gap",
    banner: "Policy coverage dropped to 74% — 38 sources are outside at least one required policy.",
    policyCoverage: 74,
    systemStatus: "Attention required",
    degradedPanels: { policies: "38 sources are not covered by PII Detection or Sensitive Content Detection." },
    extraChanges: [change("chg-cg1", "Policy coverage decreased by 15%", { objectType: "Policy" })],
    extraNotifications: [{ id: "n-cg1", title: "Policy coverage decreased below threshold", type: "Policy coverage decrease", time: "12 min ago", read: false }],
  },
  "restricted-source": {
    ...baseSnapshot,
    label: "Restricted Source Added",
    banner: "A Highly Restricted source was registered and requires compliance approval before discovery begins.",
    configuredSources: 148,
    accessOverride: { approved: 128, restricted: 14, pending: 4, denied: 2 },
    systemStatus: "Attention required",
    degradedPanels: { access: "Regulated Claims Repository is restricted pending compliance approval." },
    extraChanges: [change("chg-rs1", "Restricted source registered: Regulated Claims Repository", { objectType: "Source", approvalStatus: "Pending" })],
    extraNotifications: [{ id: "n-rs1", title: "Restricted source requires approval", type: "Source approval request", time: "3 min ago", read: false }],
  },
  "configuration-drift": {
    ...baseSnapshot,
    label: "Configuration Drift",
    banner: "Configuration drift detected — 5 sources no longer match their approved configuration baseline.",
    systemStatus: "Degraded",
    degradedPanels: { sources: "5 sources drifted from the approved baseline.", policies: "Drift affects Incremental Discovery scope." },
    extraChanges: [change("chg-cd2", "Drift detected on Core Services Repository", { objectType: "Source" })],
    extraNotifications: [{ id: "n-dr1", title: "Configuration drift detected on 5 sources", type: "Drift detected", time: "6 min ago", read: false }],
  },
  "pending-approval": {
    ...baseSnapshot,
    label: "Pending Approval",
    banner: "Configuration v14.3 is pending approval from Alex Valencia — editing is restricted until reviewed.",
    pendingApproval: true,
    systemStatus: "Attention required",
    degradedPanels: {},
    extraChanges: [change("chg-pa1", "Configuration submitted for approval", { objectType: "Configuration", approvalStatus: "Pending" })],
    extraNotifications: [{ id: "n-pa1", title: "Configuration approval requested", type: "Configuration approval request", time: "1 min ago", read: false }],
  },
};

export const demoScenarios: { id: DemoScenario; label: string }[] = (
  Object.keys(scenarioSnapshots) as DemoScenario[]
).map((id) => ({ id, label: scenarioSnapshots[id].label }));

export const notificationSeed = [
  { id: "n-1", title: "Zoom Transcripts connector latency above threshold", type: "Connector failure", time: "12 min ago", read: false },
  { id: "n-2", title: "Daily Deep Scan completed with 2 warnings", type: "Schedule failure", time: "1 hr ago", read: false },
  { id: "n-3", title: "Permission validation completed for 124 sources", type: "Permission validation issue", time: "2 hr ago", read: true },
  { id: "n-4", title: "Customer Advisory Notes awaiting source approval", type: "Source approval request", time: "3 hr ago", read: false },
];

/* ------------------------------ filter engine ----------------------------- */

export function resolveSources(scenario: DemoScenario, filters: Filters): SourceConfiguration[] {
  const snap = scenarioSnapshots[scenario];
  let rows = sourceConfigurations.map((s) => ({ ...s }));

  if (scenario === "connector-degradation") {
    rows = rows.map((s) => (s.id === "src-arch" ? { ...s, status: "Degraded" as SourceStatus, warnings: [...s.warnings, "Connector authentication failed"] } : s));
  }
  if (scenario === "permission-failure") {
    rows = rows.map((s) =>
      s.id === "src-support" || s.id === "src-identity"
        ? { ...s, access: "Denied" as AccessState, status: "Degraded" as SourceStatus, warnings: [...s.warnings, "Permission validation failed"] }
        : s,
    );
  }
  if (scenario === "schedule-backlog") {
    rows = rows.map((s) => (s.discoveryMode === "Batch" || s.discoveryMode === "Scheduled" ? { ...s, status: "Warning" as SourceStatus, lastRun: "48 min ago" } : s));
  }
  if (scenario === "restricted-source") {
    rows = [
      ...rows,
      {
        ...sourceConfigurations[0],
        id: "src-claims", name: "Regulated Claims Repository", category: "Documents", platform: "SharePoint",
        businessOwner: "Compliance", technicalOwner: "Jordan Lee", businessUnit: "Security", team: "Security Engineering",
        knowledgeDomains: ["Security"], status: "Paused", access: "Pending", accessClassification: "Highly Restricted",
        discoveryMode: "Permission validation only", scheduleLabel: "Paused", lastRun: "Never",
        artifactEstimate: 0, coverage: 0, warnings: ["Awaiting compliance approval"],
      },
    ];
  }
  if (scenario === "configuration-drift") {
    rows = rows.map((s) => (s.id === "src-core" ? { ...s, status: "Warning" as SourceStatus, warnings: [...s.warnings, "Drifted from approved baseline"] } : s));
  }
  void snap;

  const f = filters;
  return rows.filter((s) =>
    (f.businessUnit === "All" || s.businessUnit === f.businessUnit) &&
    (f.team === "All" || s.team === f.team) &&
    (f.knowledgeDomain === "All" || s.knowledgeDomains.includes(f.knowledgeDomain)) &&
    (f.sourceCategory === "All" || s.category === f.sourceCategory) &&
    (f.platform === "All" || s.platform === f.platform) &&
    (f.owner === "All" || s.businessOwner === f.owner) &&
    (f.connectorStatus === "All" || s.status === f.connectorStatus) &&
    (f.accessClassification === "All" || s.accessClassification === f.accessClassification) &&
    (f.discoveryMode === "All" || s.discoveryMode === f.discoveryMode) &&
    (f.environment === "All" || s.environment === f.environment) &&
    (f.scheduleProfile === "All" || schedules.find((x) => x.id === s.scheduleId)?.name === f.scheduleProfile),
  );
}

export const platformsByCategory: Record<SourceCategory, string[]> = {
  Documents: ["Confluence", "SharePoint", "Google Drive", "Box"],
  Tickets: ["Jira", "ServiceNow", "Azure DevOps", "Buganizer"],
  Chat: ["Slack", "Microsoft Teams", "Google Chat"],
  Meetings: ["Zoom", "Google Meet", "Microsoft Teams"],
  Code: ["GitHub", "GitLab", "Bitbucket"],
  APIs: ["Apigee", "REST API", "GraphQL API"],
  Telemetry: ["Datadog", "Splunk", "Prometheus", "New Relic"],
  Other: ["Custom Connector"],
};

export const searchCatalog = [
  ...sourceConfigurations.map((s) => ({ id: s.id, type: "Sources", name: s.name, status: s.status, owner: s.businessOwner, related: s.platform, updated: s.updatedAt })),
  ...connectors.map((c) => ({ id: c.id, type: "Connectors", name: c.name, status: c.authenticationStatus, owner: c.platform, related: c.connectorType, updated: c.lastSuccessfulTest })),
  ...schedules.map((s) => ({ id: s.id, type: "Schedules", name: s.name, status: s.status, owner: s.owner, related: s.frequency, updated: s.lastUpdated })),
  ...policies.map((p) => ({ id: p.id, type: "Policies", name: p.name, status: p.enabled ? "Enabled" : "Disabled", owner: p.owner, related: `${p.coveredSources} sources`, updated: p.lastUpdated })),
  ...classificationRules.map((c) => ({ id: c.id, type: "Classifications", name: c.name, status: c.status, owner: c.owner, related: `${c.sources} sources`, updated: c.reviewDate })),
  ...alertRules.map((a) => ({ id: a.id, type: "Alert Rules", name: a.name, status: a.enabled ? "Active" : "Paused", owner: a.recipients, related: a.severity, updated: "today" })),
  ...recentChanges.map((c) => ({ id: c.id, type: "Recent Changes", name: c.description, status: c.approvalStatus, owner: c.changedBy, related: c.objectType, updated: c.time })),
];
