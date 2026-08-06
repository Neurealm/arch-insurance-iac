/**
 * Enterprise Source Discovery — deterministic seeded demonstration data.
 *
 * Every structure here is shaped so it can later be replaced by an API
 * response without changing the components that consume it.
 */

export type ViewMode = "executive" | "operations" | "architecture";

export type DemoScenario =
  | "healthy"
  | "connector-degradation"
  | "permission-failure"
  | "meeting-coverage-gap"
  | "high-growth-source"
  | "restricted-source"
  | "discovery-backlog"
  | "new-platform";

export const demoScenarios: { id: DemoScenario; label: string }[] = [
  { id: "healthy", label: "Healthy Enterprise" },
  { id: "connector-degradation", label: "Connector Degradation" },
  { id: "permission-failure", label: "Permission Failure" },
  { id: "meeting-coverage-gap", label: "Meeting Coverage Gap" },
  { id: "high-growth-source", label: "High Growth Source" },
  { id: "restricted-source", label: "Restricted Source Detected" },
  { id: "discovery-backlog", label: "Discovery Backlog" },
  { id: "new-platform", label: "New Platform Discovered" },
];

export type SourceCategory =
  | "Documents"
  | "Tickets"
  | "Chat"
  | "Meetings"
  | "Code"
  | "APIs"
  | "Telemetry";

export const sourceCategories: SourceCategory[] = [
  "Documents",
  "Tickets",
  "Chat",
  "Meetings",
  "Code",
  "APIs",
  "Telemetry",
];

export type SourceStatus = "Healthy" | "Warning" | "Degraded" | "Paused";
export type AccessClassification = "Approved" | "Restricted" | "Pending";
export type DiscoveryMode = "Incremental" | "Streaming" | "Batch" | "Scheduled" | "Deep";

export interface EnterpriseSource {
  id: string;
  name: string;
  category: SourceCategory;
  platform: string;
  businessOwner: string;
  technicalOwner: string;
  status: SourceStatus;
  artifactCount: number;
  newArtifacts: number;
  lastSync: string;
  lastSyncMinutes: number;
  lastFailedSync: string;
  accessClassification: AccessClassification;
  coverage: number;
  discoveryMode: DiscoveryMode;
  freshness: string;
  knowledgeDomains: string[];
  teams: string[];
  purpose: string;
  authenticationStatus: string;
  authorizationScope: string;
  securityClassification: string;
  dataResidency: string;
  schedule: string;
  queueDepth: number;
  warnings: string[];
  businessUnit: string;
  environment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Connector {
  id: string;
  sourceId: string;
  name: string;
  status: SourceStatus | "Unauthorized";
  authenticationStatus: string;
  authorizationScope: string;
  schedule: string;
  queueDepth: number;
  processedCount: number;
  warningCount: number;
  lastSuccessfulRun: string;
  lastFailedRun: string;
  averageLatency: string;
}

export interface DiscoveryJob {
  id: string;
  name: string;
  scope: string;
  mode: string;
  status: "idle" | "running" | "completed";
  progress: number;
  currentStage: string;
  startedAt: string | null;
  completedAt: string | null;
  sourceCount: number;
  artifactCount: number;
  warningCount: number;
  restrictedCount: number;
}

export interface SourceCoverage {
  sourceCategory: SourceCategory;
  currentCoverage: number;
  targetCoverage: number;
  artifactCount: number;
  trend: number;
  gap: number;
}

export interface KnowledgeDomain {
  id: string;
  name: string;
  assetCount: number;
  sourceCount: number;
  teamCount: number;
  personaCount: number;
  coverage: number;
  freshness: string;
  mostActiveSource: string;
}

export interface DiscoveryActivity {
  id: string;
  timestamp: string;
  eventType: string;
  title: string;
  description: string;
  sourceId: string | null;
  category: SourceCategory;
  severity: "info" | "warning" | "success";
  owner: string;
}

export interface DiscoveryInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  evidenceCount: number;
  affectedEntity: string;
  recommendation: string;
  reviewStatus: "new" | "reviewed";
}

export interface WorkflowStage {
  id: string;
  name: string;
  status: "Healthy" | "Warning" | "Degraded";
  throughput: string;
  successRate: number;
  pendingQueue: string;
  lastCompleted: string;
  warningCount: number;
  averageDuration: string;
  p95Duration: string;
  itemsCompleted: number;
  itemsFailed: number;
  slaStatus: string;
  linkedConnectors: string[];
}

export interface KnowledgeReadiness {
  readySources: number;
  pendingValidation: number;
  restrictedSources: number;
  estimatedArtifacts: string;
  nextStage: string;
}

export interface ConnectorAlert {
  id: string;
  title: string;
  severity: "Warning" | "Degraded";
  age: string;
  connectorId: string;
}

/* ------------------------------- topology --------------------------------- */

export const topologyCategories: { category: SourceCategory; platforms: string[] }[] = [
  { category: "Documents", platforms: ["Confluence", "SharePoint", "Google Drive", "Box"] },
  { category: "Tickets", platforms: ["Jira", "ServiceNow", "Azure DevOps", "Buganizer"] },
  { category: "Chat", platforms: ["Slack", "Microsoft Teams", "Google Chat"] },
  { category: "Meetings", platforms: ["Zoom Transcripts", "Google Meet Transcripts", "Microsoft Teams Recordings"] },
  { category: "Code", platforms: ["GitHub", "GitLab", "Bitbucket"] },
  { category: "APIs", platforms: ["REST APIs", "GraphQL Endpoints", "Partner APIs"] },
  { category: "Telemetry", platforms: ["Datadog", "Splunk", "CloudWatch", "Prometheus", "New Relic"] },
];

export const topologyOutputs = [
  { id: "source-registry", name: "Source Registry", description: "System of record for discovered enterprise sources" },
  { id: "artifact-queue", name: "Artifact Queue", description: "Discovered artifacts awaiting ingestion" },
  { id: "metadata-index", name: "Metadata Index", description: "Searchable metadata, ownership, and classification" },
  { id: "connector-health", name: "Connector Health", description: "Connector status and operational performance" },
  { id: "access-policy", name: "Access Policy Validation", description: "Permissions, classification, and compliance validation" },
];

/* ------------------------------- sources ---------------------------------- */

export const enterpriseSources: EnterpriseSource[] = [
  {
    id: "src-eng-kb",
    name: "Engineering Knowledge Base",
    category: "Documents",
    platform: "Confluence Cloud",
    businessOwner: "Engineering Operations",
    technicalOwner: "Platform Enablement",
    status: "Healthy",
    artifactCount: 124532,
    newArtifacts: 2140,
    lastSync: "2 min ago",
    lastSyncMinutes: 2,
    lastFailedSync: "None in 30 days",
    accessClassification: "Approved",
    coverage: 94,
    discoveryMode: "Incremental",
    freshness: "Fresh",
    knowledgeDomains: ["Engineering", "Operations"],
    teams: ["Platform Engineering", "Release Engineering"],
    purpose: "Authoritative engineering standards, runbooks, and architecture decisions.",
    authenticationStatus: "OAuth token valid",
    authorizationScope: "Read-only, approved spaces",
    securityClassification: "Internal",
    dataResidency: "US-East",
    schedule: "Every 5 minutes",
    queueDepth: 320,
    warnings: [],
    businessUnit: "Technology",
    environment: "Production",
    createdAt: "2025-11-04",
    updatedAt: "2026-08-06",
  },
  {
    id: "src-product-backlog",
    name: "Product Backlog",
    category: "Tickets",
    platform: "Jira",
    businessOwner: "Product Operations",
    technicalOwner: "Product Systems",
    status: "Healthy",
    artifactCount: 88214,
    newArtifacts: 1830,
    lastSync: "3 min ago",
    lastSyncMinutes: 3,
    lastFailedSync: "None in 30 days",
    accessClassification: "Approved",
    coverage: 91,
    discoveryMode: "Incremental",
    freshness: "Fresh",
    knowledgeDomains: ["Product", "Engineering"],
    teams: ["Product Management", "Delivery"],
    purpose: "Delivery commitments, dependencies, and scope decisions across product lines.",
    authenticationStatus: "Service account valid",
    authorizationScope: "Read-only, approved projects",
    securityClassification: "Internal",
    dataResidency: "US-East",
    schedule: "Every 5 minutes",
    queueDepth: 210,
    warnings: [],
    businessUnit: "Product",
    environment: "Production",
    createdAt: "2025-11-06",
    updatedAt: "2026-08-06",
  },
  {
    id: "src-support-collab",
    name: "Support Collaboration",
    category: "Chat",
    platform: "Slack Enterprise",
    businessOwner: "Customer Support",
    technicalOwner: "Support Systems",
    status: "Healthy",
    artifactCount: 412998,
    newArtifacts: 18400,
    lastSync: "1 min ago",
    lastSyncMinutes: 1,
    lastFailedSync: "None in 30 days",
    accessClassification: "Approved",
    coverage: 87,
    discoveryMode: "Streaming",
    freshness: "Real-time",
    knowledgeDomains: ["Customer Support", "Operations"],
    teams: ["Support Engineering", "Escalation Management"],
    purpose: "Operational conversations that reveal recurring customer conditions and escalations.",
    authenticationStatus: "Enterprise grid token valid",
    authorizationScope: "Approved channels only",
    securityClassification: "Confidential",
    dataResidency: "US-East",
    schedule: "Continuous stream",
    queueDepth: 1240,
    warnings: [],
    businessUnit: "Customer Experience",
    environment: "Production",
    createdAt: "2025-12-01",
    updatedAt: "2026-08-06",
  },
  {
    id: "src-arch-reviews",
    name: "Architecture Reviews",
    category: "Meetings",
    platform: "Zoom Transcripts",
    businessOwner: "Enterprise Architecture",
    technicalOwner: "Collaboration Platform",
    status: "Warning",
    artifactCount: 18920,
    newArtifacts: 340,
    lastSync: "9 min ago",
    lastSyncMinutes: 9,
    lastFailedSync: "9 min ago",
    accessClassification: "Approved",
    coverage: 76,
    discoveryMode: "Batch",
    freshness: "Delayed",
    knowledgeDomains: ["Engineering", "Security"],
    teams: ["Enterprise Architecture", "Security Architecture"],
    purpose: "Design rationale and architectural constraints captured in review sessions.",
    authenticationStatus: "OAuth token valid",
    authorizationScope: "Recorded review sessions",
    securityClassification: "Internal",
    dataResidency: "US-West",
    schedule: "Hourly batch",
    queueDepth: 860,
    warnings: ["Transcript conversion backlog is 9 minutes behind schedule"],
    businessUnit: "Technology",
    environment: "Production",
    createdAt: "2026-01-12",
    updatedAt: "2026-08-06",
  },
  {
    id: "src-core-services",
    name: "Core Services Repository",
    category: "Code",
    platform: "GitHub Enterprise",
    businessOwner: "Platform Engineering",
    technicalOwner: "Developer Experience",
    status: "Healthy",
    artifactCount: 56340,
    newArtifacts: 910,
    lastSync: "4 min ago",
    lastSyncMinutes: 4,
    lastFailedSync: "None in 30 days",
    accessClassification: "Approved",
    coverage: 93,
    discoveryMode: "Incremental",
    freshness: "Fresh",
    knowledgeDomains: ["Engineering", "Operations"],
    teams: ["Platform Engineering", "SRE"],
    purpose: "Implementation truth: service contracts, deployment topology, and change history.",
    authenticationStatus: "GitHub App installed",
    authorizationScope: "Read-only, approved organizations",
    securityClassification: "Internal",
    dataResidency: "US-East",
    schedule: "Every 10 minutes",
    queueDepth: 140,
    warnings: [],
    businessUnit: "Technology",
    environment: "Production",
    createdAt: "2025-10-22",
    updatedAt: "2026-08-06",
  },
  {
    id: "src-customer-telemetry",
    name: "Customer Telemetry",
    category: "Telemetry",
    platform: "Datadog",
    businessOwner: "Site Reliability Engineering",
    technicalOwner: "Observability Platform",
    status: "Healthy",
    artifactCount: 1204844,
    newArtifacts: 62400,
    lastSync: "30 sec ago",
    lastSyncMinutes: 0.5,
    lastFailedSync: "None in 30 days",
    accessClassification: "Approved",
    coverage: 96,
    discoveryMode: "Streaming",
    freshness: "Real-time",
    knowledgeDomains: ["Operations", "Engineering"],
    teams: ["SRE", "Network Operations"],
    purpose: "Live operational signals establishing how services actually behave in production.",
    authenticationStatus: "API key valid",
    authorizationScope: "Read-only metrics and events",
    securityClassification: "Internal",
    dataResidency: "US-East",
    schedule: "Continuous stream",
    queueDepth: 2100,
    warnings: [],
    businessUnit: "Technology",
    environment: "Production",
    createdAt: "2025-09-18",
    updatedAt: "2026-08-06",
  },
  {
    id: "src-identity-api",
    name: "Identity Services API",
    category: "APIs",
    platform: "Apigee",
    businessOwner: "Security Engineering",
    technicalOwner: "Identity Platform",
    status: "Degraded",
    artifactCount: 8412,
    newArtifacts: 62,
    lastSync: "12 min ago",
    lastSyncMinutes: 12,
    lastFailedSync: "12 min ago",
    accessClassification: "Restricted",
    coverage: 71,
    discoveryMode: "Scheduled",
    freshness: "Stale",
    knowledgeDomains: ["Security", "Engineering"],
    teams: ["Security Engineering", "Identity Platform"],
    purpose: "Identity and entitlement contracts governing access across enterprise services.",
    authenticationStatus: "Token refresh failed",
    authorizationScope: "Restricted — security review required",
    securityClassification: "Restricted",
    dataResidency: "US-East",
    schedule: "Every 30 minutes",
    queueDepth: 0,
    warnings: ["Apigee token refresh failed", "Restricted classification blocks ingestion"],
    businessUnit: "Technology",
    environment: "Production",
    createdAt: "2026-02-03",
    updatedAt: "2026-08-06",
  },
];

export const connectors: Connector[] = enterpriseSources.map((s) => ({
  id: `con-${s.id}`,
  sourceId: s.id,
  name: `${s.platform} Connector`,
  status: s.status,
  authenticationStatus: s.authenticationStatus,
  authorizationScope: s.authorizationScope,
  schedule: s.schedule,
  queueDepth: s.queueDepth,
  processedCount: s.artifactCount,
  warningCount: s.warnings.length,
  lastSuccessfulRun: s.lastSync,
  lastFailedRun: s.lastFailedSync,
  averageLatency: s.discoveryMode === "Streaming" ? "180 ms" : "1.4 s",
}));

export const connectorAlerts: ConnectorAlert[] = [
  { id: "alert-zoom", title: "Zoom transcript connector backlog", severity: "Warning", age: "9m ago", connectorId: "con-src-arch-reviews" },
  { id: "alert-apigee", title: "Apigee token refresh failed", severity: "Degraded", age: "12m ago", connectorId: "con-src-identity-api" },
  { id: "alert-sharepoint", title: "Legacy SharePoint folder permissions changed", severity: "Warning", age: "18m ago", connectorId: "con-src-eng-kb" },
];

export const connectorHealthCounts = {
  total: 38,
  Healthy: 35,
  Warning: 2,
  Degraded: 1,
  Unauthorized: 0,
  Paused: 0,
};

export const sourceCoverage: SourceCoverage[] = [
  { sourceCategory: "Documents", currentCoverage: 92, targetCoverage: 95, artifactCount: 412000, trend: 2, gap: 3 },
  { sourceCategory: "Tickets", currentCoverage: 90, targetCoverage: 95, artifactCount: 288000, trend: 1, gap: 5 },
  { sourceCategory: "Chat", currentCoverage: 84, targetCoverage: 90, artifactCount: 512000, trend: 6, gap: 6 },
  { sourceCategory: "Meetings", currentCoverage: 72, targetCoverage: 90, artifactCount: 96000, trend: -3, gap: 18 },
  { sourceCategory: "Code", currentCoverage: 94, targetCoverage: 95, artifactCount: 184000, trend: 1, gap: 1 },
  { sourceCategory: "APIs", currentCoverage: 79, targetCoverage: 90, artifactCount: 42000, trend: -2, gap: 11 },
  { sourceCategory: "Telemetry", currentCoverage: 96, targetCoverage: 95, artifactCount: 866000, trend: 3, gap: 0 },
];

export const knowledgeDomains: KnowledgeDomain[] = [
  { id: "dom-eng", name: "Engineering", assetCount: 342000, sourceCount: 38, teamCount: 14, personaCount: 18, coverage: 93, freshness: "Fresh", mostActiveSource: "Engineering Knowledge Base" },
  { id: "dom-ops", name: "Operations", assetCount: 248000, sourceCount: 29, teamCount: 11, personaCount: 13, coverage: 91, freshness: "Fresh", mostActiveSource: "Customer Telemetry" },
  { id: "dom-sec", name: "Security", assetCount: 186000, sourceCount: 21, teamCount: 8, personaCount: 9, coverage: 84, freshness: "Delayed", mostActiveSource: "Identity Services API" },
  { id: "dom-cs", name: "Customer Support", assetCount: 142000, sourceCount: 17, teamCount: 9, personaCount: 8, coverage: 87, freshness: "Real-time", mostActiveSource: "Support Collaboration" },
  { id: "dom-prod", name: "Product", assetCount: 98000, sourceCount: 15, teamCount: 7, personaCount: 7, coverage: 89, freshness: "Fresh", mostActiveSource: "Product Backlog" },
  { id: "dom-fin", name: "Finance", assetCount: 64000, sourceCount: 9, teamCount: 4, personaCount: 4, coverage: 78, freshness: "Delayed", mostActiveSource: "Finance Document Library" },
  { id: "dom-hr", name: "HR", assetCount: 42000, sourceCount: 7, teamCount: 3, personaCount: 3, coverage: 74, freshness: "Delayed", mostActiveSource: "People Operations Handbook" },
  { id: "dom-legal", name: "Legal & Compliance", assetCount: 31000, sourceCount: 6, teamCount: 3, personaCount: 2, coverage: 71, freshness: "Stale", mostActiveSource: "Contract Repository" },
];

export const workflowStages: WorkflowStage[] = [
  { id: "stg-discover", name: "Discover", status: "Healthy", throughput: "12.4K/m", successRate: 99, pendingQueue: "1.2K", lastCompleted: "10:22 AM", warningCount: 0, averageDuration: "410 ms", p95Duration: "980 ms", itemsCompleted: 742000, itemsFailed: 210, slaStatus: "Within SLA", linkedConnectors: ["Confluence Cloud", "Jira", "Slack Enterprise"] },
  { id: "stg-auth", name: "Authenticate", status: "Healthy", throughput: "12.1K/m", successRate: 98, pendingQueue: "850", lastCompleted: "10:22 AM", warningCount: 1, averageDuration: "260 ms", p95Duration: "720 ms", itemsCompleted: 726000, itemsFailed: 480, slaStatus: "Within SLA", linkedConnectors: ["Apigee", "GitHub Enterprise"] },
  { id: "stg-inventory", name: "Inventory", status: "Healthy", throughput: "10.7K/m", successRate: 97, pendingQueue: "1.6K", lastCompleted: "10:21 AM", warningCount: 1, averageDuration: "620 ms", p95Duration: "1.4 s", itemsCompleted: 642000, itemsFailed: 690, slaStatus: "Within SLA", linkedConnectors: ["SharePoint", "Zoom Transcripts"] },
  { id: "stg-classify", name: "Classify", status: "Healthy", throughput: "10.5K/m", successRate: 98, pendingQueue: "1.1K", lastCompleted: "10:20 AM", warningCount: 0, averageDuration: "540 ms", p95Duration: "1.2 s", itemsCompleted: 630000, itemsFailed: 320, slaStatus: "Within SLA", linkedConnectors: ["Slack Enterprise", "Datadog"] },
  { id: "stg-validate", name: "Validate Access", status: "Warning", throughput: "10.3K/m", successRate: 99, pendingQueue: "620", lastCompleted: "10:20 AM", warningCount: 2, averageDuration: "380 ms", p95Duration: "1.1 s", itemsCompleted: 618000, itemsFailed: 140, slaStatus: "At risk", linkedConnectors: ["Apigee", "SharePoint"] },
  { id: "stg-register", name: "Register", status: "Healthy", throughput: "9.9K/m", successRate: 99, pendingQueue: "3.4K", lastCompleted: "10:20 AM", warningCount: 0, averageDuration: "300 ms", p95Duration: "860 ms", itemsCompleted: 594000, itemsFailed: 90, slaStatus: "Within SLA", linkedConnectors: ["Source Registry"] },
  { id: "stg-queue", name: "Queue for Ingestion", status: "Healthy", throughput: "9.9K/m", successRate: 99, pendingQueue: "3.4K", lastCompleted: "10:19 AM", warningCount: 0, averageDuration: "210 ms", p95Duration: "640 ms", itemsCompleted: 594000, itemsFailed: 60, slaStatus: "Within SLA", linkedConnectors: ["Artifact Queue"] },
];

export const discoveryActivity: DiscoveryActivity[] = [
  { id: "act-1", timestamp: "10:22 AM", eventType: "Source onboarded", title: "New source onboarded: Customer Advisory Notes", description: "Customer Advisory Notes registered from Confluence Cloud with approved access.", sourceId: "src-eng-kb", category: "Documents", severity: "success", owner: "Engineering Operations" },
  { id: "act-2", timestamp: "10:18 AM", eventType: "Connector reauthorized", title: "Connector reauthorized: ServiceNow", description: "Service account credentials rotated and reauthorized without downtime.", sourceId: "src-product-backlog", category: "Tickets", severity: "info", owner: "Product Operations" },
  { id: "act-3", timestamp: "10:14 AM", eventType: "Growth detected", title: "High growth detected in Slack Enterprise (+32%)", description: "Support Collaboration artifact volume increased 32% week over week.", sourceId: "src-support-collab", category: "Chat", severity: "info", owner: "Customer Support" },
  { id: "act-4", timestamp: "10:11 AM", eventType: "Source registered", title: "New API registered: Fraud Decision Service", description: "Partner API registered pending access policy validation.", sourceId: "src-identity-api", category: "APIs", severity: "warning", owner: "Security Engineering" },
  { id: "act-5", timestamp: "10:07 AM", eventType: "Backlog reduced", title: "Meeting transcript backlog reduced by 18%", description: "Batch throughput improvements reduced transcript backlog.", sourceId: "src-arch-reviews", category: "Meetings", severity: "success", owner: "Enterprise Architecture" },
  { id: "act-6", timestamp: "10:03 AM", eventType: "Stream discovered", title: "Telemetry stream discovered from Prometheus cluster", description: "New Prometheus cluster detected and added to the discovery scope.", sourceId: "src-customer-telemetry", category: "Telemetry", severity: "info", owner: "Site Reliability Engineering" },
];

export const discoveryInsights: DiscoveryInsight[] = [
  { id: "ins-1", title: "Highest growth source family", description: "Chat · +32% this week", category: "Growth", confidence: 94, evidenceCount: 18, affectedEntity: "Support Collaboration", recommendation: "Increase streaming capacity before the next support surge.", reviewStatus: "new" },
  { id: "ins-2", title: "Lowest coverage source family", description: "Meetings · 72%", category: "Coverage", confidence: 91, evidenceCount: 12, affectedEntity: "Architecture Reviews", recommendation: "Extend transcript retention and enable incremental discovery.", reviewStatus: "new" },
  { id: "ins-3", title: "Most active domain", description: "Engineering · 342K assets", category: "Domain", confidence: 97, evidenceCount: 26, affectedEntity: "Engineering", recommendation: "No action required; monitor freshness weekly.", reviewStatus: "reviewed" },
  { id: "ins-4", title: "Sources requiring follow up", description: "3 sources need owner or access action", category: "Governance", confidence: 88, evidenceCount: 9, affectedEntity: "Identity Services API", recommendation: "Resolve Apigee token refresh and confirm restricted scope.", reviewStatus: "new" },
  { id: "ins-5", title: "Suggested next action", description: "Review meeting transcript coverage and API permission gaps", category: "Recommendation", confidence: 90, evidenceCount: 14, affectedEntity: "Meetings, APIs", recommendation: "Schedule a coverage review with Enterprise Architecture and Security Engineering.", reviewStatus: "new" },
];

export const knowledgeReadiness: KnowledgeReadiness = {
  readySources: 137,
  pendingValidation: 7,
  restrictedSources: 3,
  estimatedArtifacts: "2.2M",
  nextStage: "Artifact Ingestion & Normalization",
};

export const kpiTrends = {
  sources: [128, 131, 134, 137, 141, 144, 147],
  connectors: [34, 35, 36, 36, 37, 38, 38],
  artifacts: [1.9, 2.0, 2.05, 2.15, 2.25, 2.32, 2.4],
  domains: [18, 19, 19, 20, 21, 22, 22],
  coverage: [78, 80, 82, 84, 86, 88, 89],
};

/* -------------------------------- filters --------------------------------- */

export const filterOptions = {
  businessUnit: ["All", "Technology", "Product", "Customer Experience", "Corporate"],
  team: ["All", "Platform Engineering", "SRE", "Product Management", "Support Engineering", "Enterprise Architecture", "Security Engineering"],
  knowledgeDomain: ["All", ...knowledgeDomains.map((d) => d.name)],
  sourceCategory: ["All", ...sourceCategories],
  platform: ["All", "Confluence Cloud", "Jira", "Slack Enterprise", "Zoom Transcripts", "GitHub Enterprise", "Datadog", "Apigee"],
  connectorStatus: ["All", "Healthy", "Warning", "Degraded", "Paused"],
  accessClassification: ["All", "Approved", "Restricted", "Pending"],
  discoveryMode: ["All", "Incremental", "Streaming", "Batch", "Scheduled", "Deep"],
  environment: ["All", "Production", "Staging"],
  dateRange: ["Last 24 hours", "Last 7 days", "Last 30 days", "Last 90 days"],
};

export interface Filters {
  businessUnit: string;
  team: string;
  knowledgeDomain: string;
  sourceCategory: string;
  platform: string;
  connectorStatus: string;
  accessClassification: string;
  discoveryMode: string;
  environment: string;
  dateRange: string;
}

export const defaultFilters: Filters = {
  businessUnit: "All",
  team: "All",
  knowledgeDomain: "All",
  sourceCategory: "All",
  platform: "All",
  connectorStatus: "All",
  accessClassification: "All",
  discoveryMode: "All",
  environment: "All",
  dateRange: "Last 7 days",
};

export function activeFilterCount(f: Filters): number {
  return (Object.keys(f) as (keyof Filters)[]).filter(
    (k) => (k === "dateRange" ? f[k] !== defaultFilters.dateRange : f[k] !== "All"),
  ).length;
}

/* ----------------------------- search catalog ----------------------------- */

export const searchCatalog = [
  { id: "s1", type: "Sources", name: "Engineering Knowledge Base", platform: "Confluence Cloud", owner: "Engineering Operations", status: "Healthy", coverage: "94%", lastSync: "2 min ago", sourceId: "src-eng-kb" },
  { id: "s2", type: "Sources", name: "Architecture Reviews", platform: "Zoom Transcripts", owner: "Enterprise Architecture", status: "Warning", coverage: "76%", lastSync: "9 min ago", sourceId: "src-arch-reviews" },
  { id: "s3", type: "Connectors", name: "Apigee Connector", platform: "Apigee", owner: "Security Engineering", status: "Degraded", coverage: "71%", lastSync: "12 min ago", sourceId: "src-identity-api" },
  { id: "s4", type: "Knowledge Domains", name: "Engineering", platform: "Multiple", owner: "Engineering Operations", status: "Healthy", coverage: "93%", lastSync: "2 min ago", sourceId: null },
  { id: "s5", type: "Owners", name: "Security Engineering", platform: "Multiple", owner: "Security Engineering", status: "Degraded", coverage: "71%", lastSync: "12 min ago", sourceId: "src-identity-api" },
  { id: "s6", type: "Platforms", name: "Slack Enterprise", platform: "Slack Enterprise", owner: "Customer Support", status: "Healthy", coverage: "87%", lastSync: "1 min ago", sourceId: "src-support-collab" },
  { id: "s7", type: "Artifacts", name: "Telemetry added this week", platform: "Datadog", owner: "Site Reliability Engineering", status: "Healthy", coverage: "96%", lastSync: "30 sec ago", sourceId: "src-customer-telemetry" },
  { id: "s8", type: "Access Policies", name: "Restricted APIs", platform: "Apigee", owner: "Security Engineering", status: "Restricted", coverage: "71%", lastSync: "12 min ago", sourceId: "src-identity-api" },
  { id: "s9", type: "Discovery Jobs", name: "Nightly deep discovery", platform: "Discovery Engine", owner: "Platform Enablement", status: "Healthy", coverage: "89%", lastSync: "6 h ago", sourceId: null },
  { id: "s10", type: "Teams", name: "Support Engineering", platform: "Slack Enterprise", owner: "Customer Support", status: "Healthy", coverage: "87%", lastSync: "1 min ago", sourceId: "src-support-collab" },
];

/* ----------------------------- notifications ------------------------------ */

export const notificationSeed = [
  { id: "n1", type: "Connector failure", title: "Apigee connector token refresh failed", time: "12m ago", read: false },
  { id: "n2", type: "Access policy warning", title: "SharePoint folder permissions changed", time: "18m ago", read: false },
  { id: "n3", type: "Source approval request", title: "Customer Advisory Notes awaiting approval", time: "22m ago", read: false },
  { id: "n4", type: "Coverage decrease", title: "Meetings coverage dropped to 72%", time: "35m ago", read: false },
  { id: "n5", type: "Discovery completed", title: "Incremental discovery completed across 141 sources", time: "48m ago", read: true },
  { id: "n6", type: "Restricted source detected", title: "Identity Services API classified restricted", time: "1h ago", read: true },
  { id: "n7", type: "New platform discovered", title: "Prometheus cluster detected in telemetry scope", time: "1h ago", read: true },
];

/* ------------------------------- scenarios -------------------------------- */

export interface ScenarioSnapshot {
  registeredSources: number;
  activeConnectors: number;
  healthyConnectors: number;
  warningConnectors: number;
  degradedConnectors: number;
  artifactsLabel: string;
  artifactsChange: string;
  domains: number;
  coverage: number;
  coverageStatus: "Healthy" | "Watch" | "Degraded";
  readiness: KnowledgeReadiness;
  banner: string | null;
  degradedPanels: Record<string, string | null>;
  sourceOverrides: Partial<Record<string, Partial<EnterpriseSource>>>;
  extraActivity: DiscoveryActivity[];
}

const baseReadiness = knowledgeReadiness;

export const scenarioSnapshots: Record<DemoScenario, ScenarioSnapshot> = {
  healthy: {
    registeredSources: 147,
    activeConnectors: 38,
    healthyConnectors: 35,
    warningConnectors: 2,
    degradedConnectors: 1,
    artifactsLabel: "2.4M",
    artifactsChange: "+124K this week",
    domains: 22,
    coverage: 89,
    coverageStatus: "Healthy",
    readiness: baseReadiness,
    banner: null,
    degradedPanels: {},
    sourceOverrides: {},
    extraActivity: [],
  },
  "connector-degradation": {
    registeredSources: 147,
    activeConnectors: 38,
    healthyConnectors: 29,
    warningConnectors: 5,
    degradedConnectors: 4,
    artifactsLabel: "2.3M",
    artifactsChange: "+68K this week",
    domains: 22,
    coverage: 81,
    coverageStatus: "Degraded",
    readiness: { ...baseReadiness, readySources: 118, pendingValidation: 19, estimatedArtifacts: "1.9M" },
    banner: "Four connectors are degraded. Discovery throughput and coverage are reduced across Documents and APIs.",
    degradedPanels: {
      connectors: "Four connectors are degraded; connector counts may lag by one collection cycle.",
      inventory: "Sync times for degraded connectors may be incomplete.",
    },
    sourceOverrides: {
      "src-eng-kb": { status: "Degraded", lastSync: "22 min ago", coverage: 78, warnings: ["Confluence API rate limit exceeded"] },
      "src-core-services": { status: "Warning", lastSync: "14 min ago", coverage: 86 },
    },
    extraActivity: [
      { id: "act-cd", timestamp: "10:24 AM", eventType: "Connector degraded", title: "Confluence Cloud connector degraded", description: "Rate limiting reduced discovery throughput by 42%.", sourceId: "src-eng-kb", category: "Documents", severity: "warning", owner: "Engineering Operations" },
    ],
  },
  "permission-failure": {
    registeredSources: 147,
    activeConnectors: 38,
    healthyConnectors: 33,
    warningConnectors: 3,
    degradedConnectors: 2,
    artifactsLabel: "2.4M",
    artifactsChange: "+96K this week",
    domains: 22,
    coverage: 84,
    coverageStatus: "Watch",
    readiness: { ...baseReadiness, readySources: 129, pendingValidation: 14, restrictedSources: 6, estimatedArtifacts: "2.0M" },
    banner: "Access policy validation failed for two sources. Restricted content is excluded from ingestion.",
    degradedPanels: {
      workflow: "Validate Access is rejecting items pending a security review.",
      inventory: "Two sources are blocked by access policy validation.",
    },
    sourceOverrides: {
      "src-identity-api": { warnings: ["Apigee token refresh failed", "Access policy validation rejected"], coverage: 61 },
      "src-arch-reviews": { accessClassification: "Pending", status: "Warning" },
    },
    extraActivity: [
      { id: "act-pf", timestamp: "10:25 AM", eventType: "Access denied", title: "Access policy validation failed for Identity Services API", description: "Security review required before artifacts can be queued.", sourceId: "src-identity-api", category: "APIs", severity: "warning", owner: "Security Engineering" },
    ],
  },
  "meeting-coverage-gap": {
    registeredSources: 147,
    activeConnectors: 38,
    healthyConnectors: 34,
    warningConnectors: 3,
    degradedConnectors: 1,
    artifactsLabel: "2.4M",
    artifactsChange: "+112K this week",
    domains: 22,
    coverage: 85,
    coverageStatus: "Watch",
    readiness: { ...baseReadiness, readySources: 132, pendingValidation: 11, estimatedArtifacts: "2.1M" },
    banner: "Meeting coverage dropped to 58%. Architectural decision context may be incomplete.",
    degradedPanels: { coverage: "Meeting transcripts are 18 points below target coverage." },
    sourceOverrides: {
      "src-arch-reviews": { coverage: 58, status: "Warning", lastSync: "26 min ago", warnings: ["Transcript retention window shortened by platform policy"] },
    },
    extraActivity: [
      { id: "act-mcg", timestamp: "10:26 AM", eventType: "Coverage decrease", title: "Meeting transcript coverage decreased to 58%", description: "Retention policy change reduced available transcripts.", sourceId: "src-arch-reviews", category: "Meetings", severity: "warning", owner: "Enterprise Architecture" },
    ],
  },
  "high-growth-source": {
    registeredSources: 149,
    activeConnectors: 39,
    healthyConnectors: 36,
    warningConnectors: 2,
    degradedConnectors: 1,
    artifactsLabel: "2.7M",
    artifactsChange: "+318K this week",
    domains: 22,
    coverage: 90,
    coverageStatus: "Healthy",
    readiness: { ...baseReadiness, readySources: 141, estimatedArtifacts: "2.5M" },
    banner: "Support Collaboration grew 61% this week. Streaming capacity is scaling automatically.",
    degradedPanels: {},
    sourceOverrides: {
      "src-support-collab": { artifactCount: 664200, newArtifacts: 61200, coverage: 90 },
    },
    extraActivity: [
      { id: "act-hg", timestamp: "10:27 AM", eventType: "Growth detected", title: "Support Collaboration grew 61% week over week", description: "Streaming connector scaled to sustain artifact volume.", sourceId: "src-support-collab", category: "Chat", severity: "info", owner: "Customer Support" },
    ],
  },
  "restricted-source": {
    registeredSources: 148,
    activeConnectors: 38,
    healthyConnectors: 34,
    warningConnectors: 3,
    degradedConnectors: 1,
    artifactsLabel: "2.4M",
    artifactsChange: "+118K this week",
    domains: 22,
    coverage: 87,
    coverageStatus: "Watch",
    readiness: { ...baseReadiness, readySources: 134, restrictedSources: 8, pendingValidation: 9, estimatedArtifacts: "2.1M" },
    banner: "A newly discovered source contains restricted content and is held for classification review.",
    degradedPanels: { inventory: "One newly discovered source is held pending classification review." },
    sourceOverrides: {
      "src-product-backlog": { accessClassification: "Restricted", status: "Warning", warnings: ["Restricted labels detected in 1,204 issues"] },
    },
    extraActivity: [
      { id: "act-rs", timestamp: "10:28 AM", eventType: "Restricted detected", title: "Restricted content detected in Product Backlog", description: "1,204 issues carry restricted labels and are excluded pending review.", sourceId: "src-product-backlog", category: "Tickets", severity: "warning", owner: "Product Operations" },
    ],
  },
  "discovery-backlog": {
    registeredSources: 147,
    activeConnectors: 38,
    healthyConnectors: 32,
    warningConnectors: 5,
    degradedConnectors: 1,
    artifactsLabel: "2.4M",
    artifactsChange: "+41K this week",
    domains: 22,
    coverage: 83,
    coverageStatus: "Watch",
    readiness: { ...baseReadiness, readySources: 121, pendingValidation: 23, estimatedArtifacts: "1.8M" },
    banner: "Discovery queues are backing up. Register and Queue for Ingestion are behind target throughput.",
    degradedPanels: { workflow: "Queue depth exceeds target for Register and Queue for Ingestion." },
    sourceOverrides: {
      "src-customer-telemetry": { queueDepth: 18400, status: "Warning" },
    },
    extraActivity: [
      { id: "act-db", timestamp: "10:29 AM", eventType: "Backlog detected", title: "Ingestion queue depth exceeded target", description: "Queue depth of 18.4K exceeds the 5K operational target.", sourceId: "src-customer-telemetry", category: "Telemetry", severity: "warning", owner: "Site Reliability Engineering" },
    ],
  },
  "new-platform": {
    registeredSources: 152,
    activeConnectors: 40,
    healthyConnectors: 37,
    warningConnectors: 2,
    degradedConnectors: 1,
    artifactsLabel: "2.5M",
    artifactsChange: "+164K this week",
    domains: 23,
    coverage: 90,
    coverageStatus: "Healthy",
    readiness: { ...baseReadiness, readySources: 142, pendingValidation: 9, estimatedArtifacts: "2.3M" },
    banner: "A new platform was discovered in the approved network boundary and added to the discovery scope.",
    degradedPanels: {},
    sourceOverrides: {},
    extraActivity: [
      { id: "act-np", timestamp: "10:30 AM", eventType: "Platform discovered", title: "New platform discovered: GitLab Self-Managed", description: "Five repositories detected and queued for access validation.", sourceId: "src-core-services", category: "Code", severity: "info", owner: "Platform Engineering" },
    ],
  },
};

/** Apply a demo scenario and the active filters to the seeded source list. */
export function resolveSources(scenario: DemoScenario, filters: Filters): EnterpriseSource[] {
  const overrides = scenarioSnapshots[scenario].sourceOverrides;
  return enterpriseSources
    .map((s) => ({ ...s, ...(overrides[s.id] ?? {}) }))
    .filter((s) => {
      if (filters.sourceCategory !== "All" && s.category !== filters.sourceCategory) return false;
      if (filters.platform !== "All" && s.platform !== filters.platform) return false;
      if (filters.connectorStatus !== "All" && s.status !== filters.connectorStatus) return false;
      if (filters.accessClassification !== "All" && s.accessClassification !== filters.accessClassification) return false;
      if (filters.discoveryMode !== "All" && s.discoveryMode !== filters.discoveryMode) return false;
      if (filters.environment !== "All" && s.environment !== filters.environment) return false;
      if (filters.businessUnit !== "All" && s.businessUnit !== filters.businessUnit) return false;
      if (filters.team !== "All" && !s.teams.includes(filters.team)) return false;
      if (filters.knowledgeDomain !== "All" && !s.knowledgeDomains.includes(filters.knowledgeDomain)) return false;
      return true;
    });
}

export const runDiscoveryStages = [
  "Connecting",
  "Authenticating",
  "Discovering",
  "Inventorying",
  "Classifying",
  "Validating",
  "Registering",
  "Completed",
];

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
