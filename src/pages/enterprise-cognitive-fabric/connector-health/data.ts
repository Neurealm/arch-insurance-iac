/**
 * Connector Health — deterministic seeded data model.
 * No live credentials or external services. Credentials are represented
 * only by safe metadata (type, status, age, owner, expiration).
 */

export type ViewMode = "executive" | "operations" | "security" | "dependency";

export type HealthStatus =
  | "Healthy" | "Warning" | "Degraded" | "Unauthorized" | "Paused" | "Maintenance" | "Unavailable";
export type AuthStatus = "Valid" | "Expiring Soon" | "Failed" | "Expired" | "Not Configured";
export type AuthzStatus = "Valid" | "Permission Drift Detected" | "Restricted" | "Pending Review";
export type CertificateStatus = "Valid" | "Expiring Soon" | "Expired" | "Not Applicable";
export type RateLimitStatus = "Normal" | "Elevated" | "Throttled" | "Not Applicable";
export type FreshnessStatus = "Real Time" | "Current" | "Aging" | "Stale";
export type Severity = "Critical" | "High" | "Medium" | "Low";
export type NetworkState = "Healthy" | "Degraded" | "Critical" | "Maintenance" | "Paused" | "Checking";
export type ConnectorCategory =
  | "Documents" | "Tickets" | "Chat" | "Meetings" | "Code" | "APIs" | "Telemetry";

export interface ConnectorHealthRecord {
  id: string;
  name: string;
  description: string;
  businessPurpose: string;
  category: ConnectorCategory;
  platform: string;
  connectorType: string;
  environment: string;
  region: string;
  dataResidency: string;
  businessUnit: string;
  teamNames: string[];
  knowledgeDomains: string[];
  owner: string;
  technicalOwner: string;
  securityOwner: string;

  healthStatus: HealthStatus;
  healthSummary: string;
  availability: number;
  availabilityTarget: number;
  averageLatency: number;      // ms
  p95Latency: number;          // ms
  p99Latency: number;          // ms
  latencyTarget: number;       // ms
  throughput: number;
  throughputTarget: number;
  throughputUnit: string;
  queueDepth: number;
  maximumQueue: number;
  errorRate: number;           // %
  timeoutRate: number;         // %
  retryRate: number;           // %
  rateLimitUtilization: number;// %
  rateLimitStatus: RateLimitStatus;
  throttleEvents: number;
  queueGrowth: string;

  freshness: string;
  freshnessStatus: FreshnessStatus;
  freshnessTarget: string;
  lastSuccessfulTest: string;
  lastFailedTest: string | null;
  lastSuccessfulSync: string;
  nextSync: string;

  authenticationMethod: string;
  authenticationStatus: AuthStatus;
  credentialType: string;
  credentialAge: string;
  credentialExpiration: string;
  credentialExpiresInDays: number | null;
  lastCredentialRotation: string;
  nextCredentialRotation: string;
  failedAuthAttempts: number;
  lastAuthValidation: string;

  certificateStatus: CertificateStatus;
  certificateExpiration: string;
  certificateExpiresInDays: number | null;
  certificateIssuer: string;

  authorizationStatus: AuthzStatus;
  permissionScope: string;
  expectedPermissionScope: string[];
  actualPermissionScope: string[];
  approvedPaths: string[];
  restrictedPaths: string[];
  permissionTemplate: string;
  lastPermissionValidation: string;
  accessClassification: string;
  discoveryMode: string;
  schedule: string;

  sourceIds: string[];
  discoveryJobIds: string[];
  artifactsInFlight: number;
  personaIds: string[];
  conditionIds: string[];
  evidenceRecordCount: number;
  activeEvaluationIds: string[];
  decisionIds: string[];
  incidentIds: string[];
  externalConsumers: number;
  downstreamRisk: "Low" | "Moderate" | "High" | "Critical";
  businessImpact: string;

  warningCount: number;
  configurationVersion: string;
  timeout: string;
  retries: number;
  backoff: string;
  concurrency: number;
  batchSize: number;
  pollingInterval: string;
  streamingMode: string;
  rateLimit: string;
  errorThreshold: string;
  endpointMetadata: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorDiagnosticTest {
  id: string;
  diagnosticId: string;
  connectorId: string;
  testType: string;
  status: "Passed" | "Warning" | "Failed";
  duration: string;
  observedValue: string;
  expectedValue: string;
  evidence: string;
  recommendedAction: string;
}

export interface ConnectorDiagnostic {
  id: string;
  connectorIds: string[];
  scope: string;
  depth: string;
  status: "Queued" | "Running" | "Completed";
  progress: number;
  testsSelected: number;
  testsPassed: number;
  testsWarning: number;
  testsFailed: number;
  startedAt: string;
  completedAt: string | null;
  recommendations: string[];
  affectedSources: number;
  affectedPersonas: number;
  affectedEvaluations: number;
  tests: ConnectorDiagnosticTest[];
}

export interface ConnectorError {
  id: string;
  connectorId: string;
  connectorName: string;
  errorCode: string;
  errorCategory: string;
  description: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  retryable: boolean;
  affectedSourceIds: string[];
  affectedStageIds: string[];
  retrySuccessRate: number;
  meanTimeToRecovery: string;
  recommendedAction: string;
}

export interface ConnectorAlert {
  id: string;
  connectorId: string;
  connectorName: string;
  title: string;
  severity: Severity;
  status: "Open" | "Investigating" | "Acknowledged" | "Monitoring" | "Resolved" | "Snoozed";
  observedValue: string;
  threshold: string;
  businessImpact: string;
  technicalImpact: string;
  recommendedAction: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorDependencyImpact {
  connectorId: string;
  connectorName: string;
  sourceNames: string[];
  discoveryJobNames: string[];
  artifactCount: number;
  personaNames: string[];
  conditionNames: string[];
  evidenceRecordCount: number;
  evaluationNames: string[];
  decisionNames: string[];
  confidenceImpact: string;
  freshnessImpact: string;
  recommendedAction: string;
}

export interface ConnectorIncident {
  id: string;
  connectorId: string;
  connectorName: string;
  severity: Severity;
  summary: string;
  description: string;
  businessImpact: string;
  technicalImpact: string;
  affectedSources: number;
  affectedPersonas: number;
  affectedEvaluations: number;
  owner: string;
  resolverGroup: string;
  priority: string;
  status: "Open" | "Investigating" | "Resolved";
  createdAt: string;
  resolvedAt: string | null;
  mttaMinutes: number;
  mttrMinutes: number;
}

export interface ConnectorActivity {
  id: string;
  connectorId: string;
  connectorName: string;
  category: string;
  timestamp: string;
  action: string;
  description: string;
  result: "Passed" | "Warning" | "Failed" | "Completed";
  owner: string;
  auditId: string;
}

export interface PermissionDrift {
  connectorId: string;
  connectorName: string;
  expectedScope: string[];
  actualScope: string[];
  addedPermissions: string[];
  removedPermissions: string[];
  affectedSources: number;
  affectedClassifications: string[];
  risk: Severity;
  status: "Open" | "Acknowledged" | "Restored" | "Exception Requested";
  recommendedAction: string;
}

/* --------------------------------- filters -------------------------------- */

export interface Filters {
  businessUnit: string;
  team: string;
  knowledgeDomain: string;
  connectorCategory: string;
  platform: string;
  connectorType: string;
  connectorOwner: string;
  technicalOwner: string;
  healthStatus: string;
  authenticationStatus: string;
  authorizationStatus: string;
  accessClassification: string;
  discoveryMode: string;
  environment: string;
  region: string;
  dataResidency: string;
  credentialExpiration: string;
  certificateExpiration: string;
  rateLimitStatus: string;
  freshnessStatus: string;
  incidentStatus: string;
  timeRange: string;
}

export const defaultFilters: Filters = {
  businessUnit: "All", team: "All", knowledgeDomain: "All", connectorCategory: "All", platform: "All",
  connectorType: "All", connectorOwner: "All", technicalOwner: "All", healthStatus: "All",
  authenticationStatus: "All", authorizationStatus: "All", accessClassification: "All",
  discoveryMode: "All", environment: "All", region: "All", dataResidency: "All",
  credentialExpiration: "All", certificateExpiration: "All", rateLimitStatus: "All",
  freshnessStatus: "All", incidentStatus: "All", timeRange: "Last 24 hours",
};

export const activeFilterCount = (f: Filters) =>
  (Object.keys(f) as (keyof Filters)[]).filter((k) => f[k] !== defaultFilters[k]).length;

export const timeRanges = [
  "Last 15 minutes", "Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days", "Custom range",
];

/* -------------------------------- connectors ------------------------------- */

export const connectors: ConnectorHealthRecord[] = [
  {
    id: "CON-2001", name: "Confluence Cloud",
    description: "Primary engineering and architecture documentation workspace connector.",
    businessPurpose: "Provide governed access to engineering standards, architecture decisions, and runbooks.",
    category: "Documents", platform: "Confluence Cloud", connectorType: "REST polling",
    environment: "Production", region: "North America", dataResidency: "United States",
    businessUnit: "Engineering Operations", teamNames: ["Platform Engineering", "Architecture Office"],
    knowledgeDomains: ["Engineering", "Architecture"],
    owner: "Engineering Operations", technicalOwner: "Collaboration Platforms", securityOwner: "Security Engineering",
    healthStatus: "Healthy", healthSummary: "Availability and latency are within target. One transient timeout recovered in the last hour.",
    availability: 99.98, availabilityTarget: 99.9,
    averageLatency: 210, p95Latency: 410, p99Latency: 640, latencyTarget: 400,
    throughput: 2850, throughputTarget: 2600, throughputUnit: "artifacts per minute",
    queueDepth: 124, maximumQueue: 5000,
    errorRate: 0.12, timeoutRate: 0.04, retryRate: 0.31,
    rateLimitUtilization: 48, rateLimitStatus: "Normal", throttleEvents: 0, queueGrowth: "Stable",
    freshness: "2 minutes", freshnessStatus: "Current", freshnessTarget: "15 minutes",
    lastSuccessfulTest: "3 min ago", lastFailedTest: "58 min ago", lastSuccessfulSync: "2 minutes ago", nextSync: "in 13 min",
    authenticationMethod: "OAuth 2.0", authenticationStatus: "Valid", credentialType: "OAuth refresh token",
    credentialAge: "29 days", credentialExpiration: "in 61 days", credentialExpiresInDays: 61,
    lastCredentialRotation: "2026-07-08", nextCredentialRotation: "2026-10-06",
    failedAuthAttempts: 0, lastAuthValidation: "3 min ago",
    certificateStatus: "Not Applicable", certificateExpiration: "—", certificateExpiresInDays: null, certificateIssuer: "—",
    authorizationStatus: "Valid", permissionScope: "Space read, metadata read, attachment read",
    expectedPermissionScope: ["spaces read", "metadata read", "attachment read"],
    actualPermissionScope: ["spaces read", "metadata read", "attachment read"],
    approvedPaths: ["/spaces/engineering", "/spaces/architecture"], restrictedPaths: ["/spaces/hr"],
    permissionTemplate: "Documents — Read Only v3", lastPermissionValidation: "Today 09:40",
    accessClassification: "Internal", discoveryMode: "Incremental", schedule: "Every 15 minutes",
    sourceIds: ["SRC-1001"], discoveryJobIds: ["JOB-101", "JOB-118"], artifactsInFlight: 1240,
    personaIds: ["PER-1", "PER-2"], conditionIds: ["BC-1", "BC-4"], evidenceRecordCount: 18420,
    activeEvaluationIds: [], decisionIds: ["DEC-1"], incidentIds: [], externalConsumers: 6,
    downstreamRisk: "Low", businessImpact: "No current business impact.",
    warningCount: 1, configurationVersion: "v4.2", timeout: "30 s", retries: 3, backoff: "Exponential",
    concurrency: 8, batchSize: 250, pollingInterval: "15 min", streamingMode: "Disabled",
    rateLimit: "5,000 requests per minute", errorThreshold: "1%",
    endpointMetadata: "https://enterprise.atlassian.net/wiki/api", createdAt: "2025-11-04", updatedAt: "2026-08-06",
    affectedSourcesCount: 12, affectedPersonasCount: 8,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
  {
    id: "CON-2002", name: "Jira Engineering",
    description: "Delivery and defect ticketing connector for engineering programs.",
    businessPurpose: "Bring delivery commitments, defects, and dependencies into the fabric as evidence.",
    category: "Tickets", platform: "Jira", connectorType: "REST polling",
    environment: "Production", region: "North America", dataResidency: "United States",
    businessUnit: "Product Operations", teamNames: ["Delivery Management", "Quality Engineering"],
    knowledgeDomains: ["Product", "Engineering"],
    owner: "Product Operations", technicalOwner: "Enterprise Applications", securityOwner: "Security Engineering",
    healthStatus: "Healthy", healthSummary: "All operational targets met over the selected time range.",
    availability: 99.97, availabilityTarget: 99.9,
    averageLatency: 190, p95Latency: 360, p99Latency: 520, latencyTarget: 400,
    throughput: 1840, throughputTarget: 1700, throughputUnit: "artifacts per minute",
    queueDepth: 88, maximumQueue: 4000,
    errorRate: 0.08, timeoutRate: 0.02, retryRate: 0.18,
    rateLimitUtilization: 39, rateLimitStatus: "Normal", throttleEvents: 0, queueGrowth: "Stable",
    freshness: "3 minutes", freshnessStatus: "Current", freshnessTarget: "15 minutes",
    lastSuccessfulTest: "6 min ago", lastFailedTest: null, lastSuccessfulSync: "3 minutes ago", nextSync: "in 12 min",
    authenticationMethod: "OAuth 2.0", authenticationStatus: "Valid", credentialType: "OAuth refresh token",
    credentialAge: "43 days", credentialExpiration: "in 47 days", credentialExpiresInDays: 47,
    lastCredentialRotation: "2026-06-24", nextCredentialRotation: "2026-09-22",
    failedAuthAttempts: 0, lastAuthValidation: "6 min ago",
    certificateStatus: "Not Applicable", certificateExpiration: "—", certificateExpiresInDays: null, certificateIssuer: "—",
    authorizationStatus: "Valid", permissionScope: "Project read, issue read, metadata read",
    expectedPermissionScope: ["project read", "issue read", "metadata read"],
    actualPermissionScope: ["project read", "issue read", "metadata read"],
    approvedPaths: ["/projects/ENG", "/projects/PLAT"], restrictedPaths: ["/projects/HRIS"],
    permissionTemplate: "Tickets — Read Only v2", lastPermissionValidation: "Today 09:41",
    accessClassification: "Internal", discoveryMode: "Incremental", schedule: "Every 15 minutes",
    sourceIds: ["SRC-1002"], discoveryJobIds: ["JOB-102"], artifactsInFlight: 860,
    personaIds: ["PER-1"], conditionIds: ["BC-2"], evidenceRecordCount: 12980,
    activeEvaluationIds: [], decisionIds: [], incidentIds: [], externalConsumers: 4,
    downstreamRisk: "Low", businessImpact: "No current business impact.",
    warningCount: 0, configurationVersion: "v3.8", timeout: "30 s", retries: 3, backoff: "Exponential",
    concurrency: 6, batchSize: 200, pollingInterval: "15 min", streamingMode: "Disabled",
    rateLimit: "4,000 requests per minute", errorThreshold: "1%",
    endpointMetadata: "https://enterprise.atlassian.net/rest/api/3", createdAt: "2025-11-04", updatedAt: "2026-08-06",
    affectedSourcesCount: 9, affectedPersonasCount: 12,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
  {
    id: "CON-2003", name: "Slack Enterprise",
    description: "Enterprise conversation connector for approved operational workspaces.",
    businessPurpose: "Capture operational decisions and escalations expressed in conversation.",
    category: "Chat", platform: "Slack Enterprise", connectorType: "Event streaming",
    environment: "Production", region: "North America", dataResidency: "United States",
    businessUnit: "Customer Operations", teamNames: ["Customer Support", "Site Reliability Engineering"],
    knowledgeDomains: ["Customer Support", "Operations"],
    owner: "Collaboration Platforms", technicalOwner: "Collaboration Platforms", securityOwner: "Security Engineering",
    healthStatus: "Warning",
    healthSummary: "Permission scope changed outside the approved template and rate limit utilization is elevated.",
    availability: 99.72, availabilityTarget: 99.9,
    averageLatency: 520, p95Latency: 1300, p99Latency: 2100, latencyTarget: 800,
    throughput: 4120, throughputTarget: 5000, throughputUnit: "messages per minute",
    queueDepth: 2428, maximumQueue: 6000,
    errorRate: 0.94, timeoutRate: 0.21, retryRate: 2.4,
    rateLimitUtilization: 91, rateLimitStatus: "Throttled", throttleEvents: 14, queueGrowth: "Rising 8% per hour",
    freshness: "1 minute", freshnessStatus: "Real Time", freshnessTarget: "5 minutes",
    lastSuccessfulTest: "11 min ago", lastFailedTest: "42 min ago", lastSuccessfulSync: "1 minute ago", nextSync: "streaming",
    authenticationMethod: "OAuth 2.0", authenticationStatus: "Valid", credentialType: "OAuth bot token",
    credentialAge: "17 days", credentialExpiration: "in 73 days", credentialExpiresInDays: 73,
    lastCredentialRotation: "2026-07-20", nextCredentialRotation: "2026-10-18",
    failedAuthAttempts: 0, lastAuthValidation: "11 min ago",
    certificateStatus: "Not Applicable", certificateExpiration: "—", certificateExpiresInDays: null, certificateIssuer: "—",
    authorizationStatus: "Permission Drift Detected",
    permissionScope: "Channels read, metadata read, private channel history read",
    expectedPermissionScope: ["channels read", "metadata read", "approved workspace only"],
    actualPermissionScope: ["channels read", "metadata read", "private channel history read"],
    approvedPaths: ["#support-escalations", "#sre-operations"], restrictedPaths: ["#exec-private", "#people-ops"],
    permissionTemplate: "Chat — Approved Workspace v2", lastPermissionValidation: "Today 10:18",
    accessClassification: "Confidential", discoveryMode: "Streaming", schedule: "Continuous",
    sourceIds: ["SRC-1003"], discoveryJobIds: ["JOB-103", "JOB-119"], artifactsInFlight: 2428,
    personaIds: ["PER-1", "PER-3"], conditionIds: ["BC-3"], evidenceRecordCount: 40120,
    activeEvaluationIds: ["EVAL-2"], decisionIds: [], incidentIds: [], externalConsumers: 3,
    downstreamRisk: "High",
    businessImpact: "Conversation evidence may include unapproved private channel content until scope is restored.",
    warningCount: 3, configurationVersion: "v5.1", timeout: "20 s", retries: 5, backoff: "Exponential with jitter",
    concurrency: 12, batchSize: 500, pollingInterval: "Streaming", streamingMode: "Enabled",
    rateLimit: "6,000 events per minute", errorThreshold: "0.5%",
    endpointMetadata: "https://slack.com/api (enterprise grid)", createdAt: "2025-12-02", updatedAt: "2026-08-06",
    affectedSourcesCount: 6, affectedPersonasCount: 5,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
  {
    id: "CON-2004", name: "Zoom Transcripts",
    description: "Meeting transcript connector for approved recurring governance forums.",
    businessPurpose: "Convert governance and architecture forum discussion into decision evidence.",
    category: "Meetings", platform: "Zoom", connectorType: "REST polling",
    environment: "Production", region: "North America", dataResidency: "United States",
    businessUnit: "Enterprise Architecture", teamNames: ["Architecture Office"],
    knowledgeDomains: ["Architecture", "Governance"],
    owner: "Unified Communications", technicalOwner: "Unified Communications", securityOwner: "Security Engineering",
    healthStatus: "Warning",
    healthSummary: "OAuth credential expires in 6 days and latency exceeds the configured target.",
    availability: 99.41, availabilityTarget: 99.9,
    averageLatency: 880, p95Latency: 2400, p99Latency: 3600, latencyTarget: 1200,
    throughput: 420, throughputTarget: 500, throughputUnit: "transcripts per hour",
    queueDepth: 1942, maximumQueue: 3000,
    errorRate: 1.4, timeoutRate: 0.6, retryRate: 3.1,
    rateLimitUtilization: 62, rateLimitStatus: "Elevated", throttleEvents: 3, queueGrowth: "Rising 4% per hour",
    freshness: "9 minutes", freshnessStatus: "Aging", freshnessTarget: "30 minutes",
    lastSuccessfulTest: "21 min ago", lastFailedTest: "2 h ago", lastSuccessfulSync: "9 minutes ago", nextSync: "in 21 min",
    authenticationMethod: "OAuth 2.0", authenticationStatus: "Expiring Soon", credentialType: "OAuth refresh token",
    credentialAge: "84 days", credentialExpiration: "in 6 days", credentialExpiresInDays: 6,
    lastCredentialRotation: "2026-05-14", nextCredentialRotation: "2026-08-12",
    failedAuthAttempts: 0, lastAuthValidation: "21 min ago",
    certificateStatus: "Not Applicable", certificateExpiration: "—", certificateExpiresInDays: null, certificateIssuer: "—",
    authorizationStatus: "Valid", permissionScope: "Recording read, transcript read, metadata read",
    expectedPermissionScope: ["recording read", "transcript read", "metadata read"],
    actualPermissionScope: ["recording read", "transcript read", "metadata read"],
    approvedPaths: ["Architecture Review Board", "Change Advisory Board"], restrictedPaths: ["All 1:1 meetings"],
    permissionTemplate: "Meetings — Transcript Read v1", lastPermissionValidation: "Today 08:52",
    accessClassification: "Confidential", discoveryMode: "Scheduled", schedule: "Every 30 minutes",
    sourceIds: ["SRC-1004"], discoveryJobIds: ["JOB-104"], artifactsInFlight: 1942,
    personaIds: ["PER-2"], conditionIds: ["BC-4"], evidenceRecordCount: 6240,
    activeEvaluationIds: [], decisionIds: [], incidentIds: [], externalConsumers: 2,
    downstreamRisk: "Moderate",
    businessImpact: "Governance decision evidence will stop refreshing if the credential expires without rotation.",
    warningCount: 2, configurationVersion: "v2.6", timeout: "45 s", retries: 4, backoff: "Linear",
    concurrency: 4, batchSize: 50, pollingInterval: "30 min", streamingMode: "Disabled",
    rateLimit: "1,200 requests per minute", errorThreshold: "1.5%",
    endpointMetadata: "https://api.zoom.us/v2", createdAt: "2026-01-12", updatedAt: "2026-08-06",
    affectedSourcesCount: 4, affectedPersonasCount: 10,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
  {
    id: "CON-2005", name: "GitHub Enterprise",
    description: "Source code, pull request, and technical design connector.",
    businessPurpose: "Ground engineering reasoning in the current implemented system.",
    category: "Code", platform: "GitHub Enterprise", connectorType: "Webhook and REST",
    environment: "Production", region: "North America", dataResidency: "United States",
    businessUnit: "Platform Engineering", teamNames: ["Platform Engineering", "Developer Experience"],
    knowledgeDomains: ["Engineering", "Security"],
    owner: "Platform Engineering", technicalOwner: "Developer Platforms", securityOwner: "Application Security",
    healthStatus: "Healthy", healthSummary: "Highest availability connector in the network with headroom on all targets.",
    availability: 99.99, availabilityTarget: 99.9,
    averageLatency: 145, p95Latency: 280, p99Latency: 410, latencyTarget: 400,
    throughput: 1120, throughputTarget: 1000, throughputUnit: "assets per minute",
    queueDepth: 56, maximumQueue: 3000,
    errorRate: 0.05, timeoutRate: 0.01, retryRate: 0.09,
    rateLimitUtilization: 31, rateLimitStatus: "Normal", throttleEvents: 0, queueGrowth: "Stable",
    freshness: "4 minutes", freshnessStatus: "Current", freshnessTarget: "15 minutes",
    lastSuccessfulTest: "8 min ago", lastFailedTest: null, lastSuccessfulSync: "4 minutes ago", nextSync: "in 11 min",
    authenticationMethod: "GitHub App installation", authenticationStatus: "Valid", credentialType: "App installation token",
    credentialAge: "8 days", credentialExpiration: "in 82 days", credentialExpiresInDays: 82,
    lastCredentialRotation: "2026-07-29", nextCredentialRotation: "2026-10-27",
    failedAuthAttempts: 0, lastAuthValidation: "8 min ago",
    certificateStatus: "Valid", certificateExpiration: "2027-03-14", certificateExpiresInDays: 220,
    certificateIssuer: "Enterprise Internal CA",
    authorizationStatus: "Valid", permissionScope: "Repository read, pull request read, metadata read",
    expectedPermissionScope: ["repository read", "pull request read", "metadata read"],
    actualPermissionScope: ["repository read", "pull request read", "metadata read"],
    approvedPaths: ["org/platform", "org/payments"], restrictedPaths: ["org/security-internal"],
    permissionTemplate: "Code — Read Only v4", lastPermissionValidation: "Today 09:12",
    accessClassification: "Restricted", discoveryMode: "Event driven", schedule: "Continuous",
    sourceIds: ["SRC-1005"], discoveryJobIds: ["JOB-105"], artifactsInFlight: 560,
    personaIds: ["PER-2"], conditionIds: ["BC-1"], evidenceRecordCount: 22800,
    activeEvaluationIds: [], decisionIds: ["DEC-1"], incidentIds: [], externalConsumers: 5,
    downstreamRisk: "Low", businessImpact: "No current business impact.",
    warningCount: 0, configurationVersion: "v6.0", timeout: "25 s", retries: 3, backoff: "Exponential",
    concurrency: 10, batchSize: 300, pollingInterval: "Event driven", streamingMode: "Enabled",
    rateLimit: "8,000 requests per hour", errorThreshold: "0.5%",
    endpointMetadata: "https://github.enterprise.internal/api/v3", createdAt: "2025-10-19", updatedAt: "2026-08-06",
    affectedSourcesCount: 8, affectedPersonasCount: 9,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
  {
    id: "CON-2006", name: "Datadog Telemetry",
    description: "Operational telemetry connector for service health and reliability signals.",
    businessPurpose: "Provide live operational evidence for reliability reasoning.",
    category: "Telemetry", platform: "Datadog", connectorType: "Streaming API",
    environment: "Production", region: "Global", dataResidency: "United States",
    businessUnit: "Site Reliability Engineering", teamNames: ["Site Reliability Engineering", "Observability"],
    knowledgeDomains: ["Operations", "Reliability"],
    owner: "Site Reliability Engineering", technicalOwner: "Observability Engineering", securityOwner: "Security Engineering",
    healthStatus: "Healthy", healthSummary: "Throughput is above target with rate limit utilization inside safe bounds.",
    availability: 99.995, availabilityTarget: 99.9,
    averageLatency: 94, p95Latency: 188, p99Latency: 260, latencyTarget: 250,
    throughput: 38400, throughputTarget: 35000, throughputUnit: "events per minute",
    queueDepth: 18300, maximumQueue: 60000,
    errorRate: 0.02, timeoutRate: 0.01, retryRate: 0.04,
    rateLimitUtilization: 72, rateLimitStatus: "Elevated", throttleEvents: 0, queueGrowth: "Stable",
    freshness: "30 seconds", freshnessStatus: "Real Time", freshnessTarget: "2 minutes",
    lastSuccessfulTest: "10:22 AM", lastFailedTest: null, lastSuccessfulSync: "30 seconds ago", nextSync: "streaming",
    authenticationMethod: "API key", authenticationStatus: "Valid", credentialType: "Scoped API key",
    credentialAge: "12 days", credentialExpiration: "in 90 days", credentialExpiresInDays: 90,
    lastCredentialRotation: "2026-07-25", nextCredentialRotation: "2026-11-04",
    failedAuthAttempts: 0, lastAuthValidation: "10:22 AM",
    certificateStatus: "Not Applicable", certificateExpiration: "—", certificateExpiresInDays: null, certificateIssuer: "—",
    authorizationStatus: "Valid", permissionScope: "Metrics read, events read, monitor read",
    expectedPermissionScope: ["metrics read", "events read", "monitor read"],
    actualPermissionScope: ["metrics read", "events read", "monitor read"],
    approvedPaths: ["service:payments", "service:identity", "service:platform"], restrictedPaths: ["team:people-analytics"],
    permissionTemplate: "Telemetry — Read Only v3", lastPermissionValidation: "Today 09:05",
    accessClassification: "Confidential", discoveryMode: "Streaming", schedule: "Continuous",
    sourceIds: ["SRC-1006"], discoveryJobIds: ["JOB-106", "JOB-120"], artifactsInFlight: 18300,
    personaIds: ["PER-2", "PER-3"], conditionIds: ["BC-3"], evidenceRecordCount: 88400,
    activeEvaluationIds: [], decisionIds: [], incidentIds: [], externalConsumers: 9,
    downstreamRisk: "Low", businessImpact: "No current business impact.",
    warningCount: 0, configurationVersion: "v7.3", timeout: "15 s", retries: 2, backoff: "Exponential",
    concurrency: 16, batchSize: 1000, pollingInterval: "Streaming", streamingMode: "Enabled",
    rateLimit: "50,000 events per minute", errorThreshold: "0.25%",
    endpointMetadata: "https://api.datadoghq.com/api/v2", createdAt: "2025-09-08", updatedAt: "2026-08-06",
    affectedSourcesCount: 15, affectedPersonasCount: 18,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
  {
    id: "CON-2007", name: "Apigee Identity Services",
    description: "Identity and access API connector for the restricted identity services domain.",
    businessPurpose: "Supply authoritative identity and access control evidence to security reasoning.",
    category: "APIs", platform: "Apigee", connectorType: "REST polling",
    environment: "Production", region: "North America", dataResidency: "United States",
    businessUnit: "Security Engineering", teamNames: ["Security Engineering", "Identity Platform"],
    knowledgeDomains: ["Security", "Identity"],
    owner: "Security Engineering", technicalOwner: "Integration Platforms", securityOwner: "Security Engineering",
    healthStatus: "Degraded",
    healthSummary: "Service account token exchange is failing. Discovery is blocked and downstream evidence is going stale.",
    availability: 96.82, availabilityTarget: 99.9,
    averageLatency: 1800, p95Latency: 4700, p99Latency: 6900, latencyTarget: 1000,
    throughput: 620, throughputTarget: 1200, throughputUnit: "records per minute",
    queueDepth: 2117, maximumQueue: 4000,
    errorRate: 12.6, timeoutRate: 3.1, retryRate: 18.4,
    rateLimitUtilization: 34, rateLimitStatus: "Normal", throttleEvents: 0, queueGrowth: "Rising 22% per hour",
    freshness: "12 minutes", freshnessStatus: "Stale", freshnessTarget: "10 minutes",
    lastSuccessfulTest: "1 h 12 min ago", lastFailedTest: "10:14 AM", lastSuccessfulSync: "12 minutes ago", nextSync: "blocked",
    authenticationMethod: "Service account", authenticationStatus: "Failed", credentialType: "Service account token",
    credentialAge: "91 days", credentialExpiration: "Expired", credentialExpiresInDays: 0,
    lastCredentialRotation: "2026-05-07", nextCredentialRotation: "Overdue",
    failedAuthAttempts: 46, lastAuthValidation: "10:14 AM",
    certificateStatus: "Valid", certificateExpiration: "2026-12-01", certificateExpiresInDays: 117,
    certificateIssuer: "Enterprise Internal CA",
    authorizationStatus: "Restricted", permissionScope: "Identity read (restricted), audit read",
    expectedPermissionScope: ["identity read", "audit read"],
    actualPermissionScope: ["identity read"],
    approvedPaths: ["/identity/v2/accounts", "/identity/v2/audit"], restrictedPaths: ["/identity/v2/secrets"],
    permissionTemplate: "APIs — Restricted Read v1", lastPermissionValidation: "Today 07:30",
    accessClassification: "Highly Restricted", discoveryMode: "Scheduled", schedule: "Hourly",
    sourceIds: ["SRC-1007"], discoveryJobIds: ["JOB-107", "JOB-121"], artifactsInFlight: 2117,
    personaIds: ["PER-1", "PER-3"], conditionIds: ["BC-2", "BC-5"], evidenceRecordCount: 3240,
    activeEvaluationIds: ["EVAL-1", "EVAL-2"], decisionIds: ["DEC-2"], incidentIds: ["INC-4471"], externalConsumers: 4,
    downstreamRisk: "Critical",
    businessImpact: "Identity evidence is stale. One release approval workflow is paused and two evaluations are flagged.",
    warningCount: 6, configurationVersion: "v3.1", timeout: "60 s", retries: 5, backoff: "Exponential with jitter",
    concurrency: 4, batchSize: 100, pollingInterval: "60 min", streamingMode: "Disabled",
    rateLimit: "1,800 requests per minute", errorThreshold: "1%",
    endpointMetadata: "https://apigee.enterprise.internal/identity/v2", createdAt: "2025-08-15", updatedAt: "2026-08-06",
    affectedSourcesCount: 3, affectedPersonasCount: 4,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
  {
    id: "CON-2008", name: "ServiceNow Enterprise",
    description: "IT service management connector for incidents, changes, and problems.",
    businessPurpose: "Bring service management history into operational reasoning.",
    category: "Tickets", platform: "ServiceNow", connectorType: "REST polling",
    environment: "Production", region: "North America", dataResidency: "United States",
    businessUnit: "IT Service Management", teamNames: ["Service Desk", "Change Management"],
    knowledgeDomains: ["Operations", "Service Management"],
    owner: "IT Service Management", technicalOwner: "Enterprise Applications", securityOwner: "Security Engineering",
    healthStatus: "Healthy", healthSummary: "Synchronization and latency are inside target with no open alerts.",
    availability: 99.96, availabilityTarget: 99.9,
    averageLatency: 240, p95Latency: 490, p99Latency: 700, latencyTarget: 500,
    throughput: 1240, throughputTarget: 1100, throughputUnit: "records per minute",
    queueDepth: 72, maximumQueue: 3000,
    errorRate: 0.11, timeoutRate: 0.03, retryRate: 0.22,
    rateLimitUtilization: 44, rateLimitStatus: "Normal", throttleEvents: 0, queueGrowth: "Stable",
    freshness: "5 minutes", freshnessStatus: "Current", freshnessTarget: "20 minutes",
    lastSuccessfulTest: "9:52 AM", lastFailedTest: null, lastSuccessfulSync: "5 minutes ago", nextSync: "in 10 min",
    authenticationMethod: "OAuth 2.0", authenticationStatus: "Valid", credentialType: "OAuth refresh token",
    credentialAge: "51 days", credentialExpiration: "in 39 days", credentialExpiresInDays: 39,
    lastCredentialRotation: "2026-06-16", nextCredentialRotation: "2026-09-14",
    failedAuthAttempts: 0, lastAuthValidation: "9:52 AM",
    certificateStatus: "Not Applicable", certificateExpiration: "—", certificateExpiresInDays: null, certificateIssuer: "—",
    authorizationStatus: "Valid", permissionScope: "Incident read, change read, problem read",
    expectedPermissionScope: ["incident read", "change read", "problem read"],
    actualPermissionScope: ["incident read", "change read", "problem read"],
    approvedPaths: ["/api/now/table/incident", "/api/now/table/change_request"], restrictedPaths: ["/api/now/table/sys_user"],
    permissionTemplate: "Tickets — Read Only v2", lastPermissionValidation: "Today 09:00",
    accessClassification: "Internal", discoveryMode: "Incremental", schedule: "Every 15 minutes",
    sourceIds: ["SRC-1002"], discoveryJobIds: ["JOB-108"], artifactsInFlight: 720,
    personaIds: ["PER-3"], conditionIds: ["BC-3"], evidenceRecordCount: 15600,
    activeEvaluationIds: [], decisionIds: [], incidentIds: [], externalConsumers: 7,
    downstreamRisk: "Low", businessImpact: "No current business impact.",
    warningCount: 0, configurationVersion: "v4.0", timeout: "30 s", retries: 3, backoff: "Exponential",
    concurrency: 6, batchSize: 200, pollingInterval: "15 min", streamingMode: "Disabled",
    rateLimit: "3,000 requests per minute", errorThreshold: "1%",
    endpointMetadata: "https://enterprise.service-now.com/api/now", createdAt: "2025-11-20", updatedAt: "2026-08-06",
    affectedSourcesCount: 7, affectedPersonasCount: 6,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
  {
    id: "CON-2009", name: "SharePoint Online",
    description: "Corporate document library connector for policy and product documentation.",
    businessPurpose: "Bring policy, product, and compliance documentation into governed discovery.",
    category: "Documents", platform: "SharePoint Server", connectorType: "Graph API",
    environment: "Production", region: "Europe", dataResidency: "European Union",
    businessUnit: "Corporate Services", teamNames: ["Enterprise Compliance", "Product Marketing"],
    knowledgeDomains: ["Compliance", "Product"],
    owner: "Collaboration Platforms", technicalOwner: "Collaboration Platforms", securityOwner: "Enterprise Compliance",
    healthStatus: "Healthy",
    healthSummary: "Operationally healthy. A signing certificate expires within 18 days and requires rotation.",
    availability: 99.94, availabilityTarget: 99.9,
    averageLatency: 330, p95Latency: 720, p99Latency: 980, latencyTarget: 700,
    throughput: 1670, throughputTarget: 1500, throughputUnit: "artifacts per minute",
    queueDepth: 217, maximumQueue: 4000,
    errorRate: 0.19, timeoutRate: 0.06, retryRate: 0.38,
    rateLimitUtilization: 55, rateLimitStatus: "Normal", throttleEvents: 1, queueGrowth: "Stable",
    freshness: "5 minutes", freshnessStatus: "Current", freshnessTarget: "20 minutes",
    lastSuccessfulTest: "9:58 AM", lastFailedTest: null, lastSuccessfulSync: "5 minutes ago", nextSync: "in 10 min",
    authenticationMethod: "Certificate", authenticationStatus: "Valid", credentialType: "Certificate credential",
    credentialAge: "347 days", credentialExpiration: "in 18 days", credentialExpiresInDays: 18,
    lastCredentialRotation: "2025-08-24", nextCredentialRotation: "2026-08-24",
    failedAuthAttempts: 0, lastAuthValidation: "9:58 AM",
    certificateStatus: "Expiring Soon", certificateExpiration: "2026-08-24", certificateExpiresInDays: 18,
    certificateIssuer: "Enterprise Internal CA",
    authorizationStatus: "Valid", permissionScope: "Sites read, files read, metadata read",
    expectedPermissionScope: ["sites read", "files read", "metadata read"],
    actualPermissionScope: ["sites read", "files read", "metadata read"],
    approvedPaths: ["/sites/policy", "/sites/product"], restrictedPaths: ["/sites/people"],
    permissionTemplate: "Documents — Read Only v3", lastPermissionValidation: "Today 08:30",
    accessClassification: "Internal", discoveryMode: "Incremental", schedule: "Every 15 minutes",
    sourceIds: ["SRC-1008"], discoveryJobIds: ["JOB-109"], artifactsInFlight: 980,
    personaIds: ["PER-2"], conditionIds: ["BC-5"], evidenceRecordCount: 19800,
    activeEvaluationIds: [], decisionIds: [], incidentIds: [], externalConsumers: 4,
    downstreamRisk: "Moderate",
    businessImpact: "Policy documentation discovery will fail if the certificate is not rotated before expiration.",
    warningCount: 1, configurationVersion: "v3.4", timeout: "40 s", retries: 3, backoff: "Exponential",
    concurrency: 8, batchSize: 250, pollingInterval: "15 min", streamingMode: "Disabled",
    rateLimit: "4,500 requests per minute", errorThreshold: "1%",
    endpointMetadata: "https://graph.microsoft.com/v1.0/sites", createdAt: "2025-10-02", updatedAt: "2026-08-06",
    affectedSourcesCount: 11, affectedPersonasCount: 7,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
  {
    id: "CON-2010", name: "Prometheus",
    description: "Infrastructure metrics connector for platform reliability signals.",
    businessPurpose: "Ground infrastructure reasoning in measured platform behaviour.",
    category: "Telemetry", platform: "Prometheus", connectorType: "Scrape",
    environment: "Production", region: "Global", dataResidency: "United States",
    businessUnit: "Platform Engineering", teamNames: ["Platform Engineering", "Observability"],
    knowledgeDomains: ["Operations", "Reliability"],
    owner: "Platform Engineering", technicalOwner: "Observability Engineering", securityOwner: "Security Engineering",
    healthStatus: "Healthy", healthSummary: "Lowest latency connector in the network. No open findings.",
    availability: 99.99, availabilityTarget: 99.9,
    averageLatency: 76, p95Latency: 142, p99Latency: 210, latencyTarget: 200,
    throughput: 51200, throughputTarget: 48000, throughputUnit: "events per minute",
    queueDepth: 9420, maximumQueue: 60000,
    errorRate: 0.01, timeoutRate: 0.0, retryRate: 0.02,
    rateLimitUtilization: 21, rateLimitStatus: "Not Applicable", throttleEvents: 0, queueGrowth: "Stable",
    freshness: "15 seconds", freshnessStatus: "Real Time", freshnessTarget: "1 minute",
    lastSuccessfulTest: "10:20 AM", lastFailedTest: null, lastSuccessfulSync: "15 seconds ago", nextSync: "streaming",
    authenticationMethod: "Managed identity", authenticationStatus: "Valid", credentialType: "Workload identity",
    credentialAge: "Managed", credentialExpiration: "Not Applicable", credentialExpiresInDays: null,
    lastCredentialRotation: "Automatic", nextCredentialRotation: "Automatic",
    failedAuthAttempts: 0, lastAuthValidation: "10:20 AM",
    certificateStatus: "Valid", certificateExpiration: "2027-01-30", certificateExpiresInDays: 177,
    certificateIssuer: "Enterprise Internal CA",
    authorizationStatus: "Valid", permissionScope: "Metrics read",
    expectedPermissionScope: ["metrics read"], actualPermissionScope: ["metrics read"],
    approvedPaths: ["/api/v1/query", "/api/v1/series"], restrictedPaths: [],
    permissionTemplate: "Telemetry — Read Only v3", lastPermissionValidation: "Today 09:05",
    accessClassification: "Internal", discoveryMode: "Streaming", schedule: "Continuous",
    sourceIds: ["SRC-1006"], discoveryJobIds: ["JOB-110"], artifactsInFlight: 9420,
    personaIds: ["PER-3"], conditionIds: ["BC-3"], evidenceRecordCount: 64200,
    activeEvaluationIds: [], decisionIds: [], incidentIds: [], externalConsumers: 8,
    downstreamRisk: "Low", businessImpact: "No current business impact.",
    warningCount: 0, configurationVersion: "v2.9", timeout: "10 s", retries: 2, backoff: "Linear",
    concurrency: 20, batchSize: 2000, pollingInterval: "15 s", streamingMode: "Enabled",
    rateLimit: "Not applicable", errorThreshold: "0.25%",
    endpointMetadata: "https://prometheus.platform.internal", createdAt: "2025-07-11", updatedAt: "2026-08-06",
    affectedSourcesCount: 6, affectedPersonasCount: 11,
  } as ConnectorHealthRecord & { affectedSourcesCount: number; affectedPersonasCount: number },
];

export const connectorById = connectors.reduce<Record<string, ConnectorHealthRecord>>((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

/** Presentation counts seeded independently of the modelled id arrays. */
export const affectedCounts: Record<string, { sources: number; personas: number }> = {
  "CON-2001": { sources: 12, personas: 8 },
  "CON-2002": { sources: 9, personas: 12 },
  "CON-2003": { sources: 6, personas: 5 },
  "CON-2004": { sources: 4, personas: 10 },
  "CON-2005": { sources: 8, personas: 9 },
  "CON-2006": { sources: 15, personas: 18 },
  "CON-2007": { sources: 3, personas: 4 },
  "CON-2008": { sources: 7, personas: 6 },
  "CON-2009": { sources: 11, personas: 7 },
  "CON-2010": { sources: 6, personas: 11 },
};

export const categories: ConnectorCategory[] = [
  "Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry",
];

/* ------------------------------ filter options ----------------------------- */

const uniq = (v: string[]) => Array.from(new Set(v)).sort();

export const filterOptions: Record<keyof Filters, string[]> = {
  businessUnit: ["All", ...uniq(connectors.map((c) => c.businessUnit))],
  team: ["All", ...uniq(connectors.flatMap((c) => c.teamNames))],
  knowledgeDomain: ["All", ...uniq(connectors.flatMap((c) => c.knowledgeDomains))],
  connectorCategory: ["All", ...categories],
  platform: ["All", ...uniq(connectors.map((c) => c.platform))],
  connectorType: ["All", ...uniq(connectors.map((c) => c.connectorType))],
  connectorOwner: ["All", ...uniq(connectors.map((c) => c.owner))],
  technicalOwner: ["All", ...uniq(connectors.map((c) => c.technicalOwner))],
  healthStatus: ["All", "Healthy", "Warning", "Degraded", "Unauthorized", "Paused", "Maintenance", "Unavailable"],
  authenticationStatus: ["All", "Valid", "Expiring Soon", "Failed", "Expired", "Not Configured"],
  authorizationStatus: ["All", "Valid", "Permission Drift Detected", "Restricted", "Pending Review"],
  accessClassification: ["All", "Public", "Internal", "Confidential", "Restricted", "Highly Restricted"],
  discoveryMode: ["All", ...uniq(connectors.map((c) => c.discoveryMode))],
  environment: ["All", ...uniq(connectors.map((c) => c.environment))],
  region: ["All", ...uniq(connectors.map((c) => c.region))],
  dataResidency: ["All", ...uniq(connectors.map((c) => c.dataResidency))],
  credentialExpiration: ["All", "Expired", "Within 7 days", "Within 30 days", "Within 90 days", "Not Applicable"],
  certificateExpiration: ["All", "Expired", "Within 30 days", "Valid", "Not Applicable"],
  rateLimitStatus: ["All", "Normal", "Elevated", "Throttled", "Not Applicable"],
  freshnessStatus: ["All", "Real Time", "Current", "Aging", "Stale"],
  incidentStatus: ["All", "With Open Incident", "No Open Incident"],
  timeRange: timeRanges,
};

const credentialBucket = (c: ConnectorHealthRecord) => {
  if (c.credentialExpiresInDays === null) return "Not Applicable";
  if (c.credentialExpiresInDays <= 0) return "Expired";
  if (c.credentialExpiresInDays <= 7) return "Within 7 days";
  if (c.credentialExpiresInDays <= 30) return "Within 30 days";
  return "Within 90 days";
};

const certificateBucket = (c: ConnectorHealthRecord) => {
  if (c.certificateStatus === "Not Applicable") return "Not Applicable";
  if (c.certificateStatus === "Expired") return "Expired";
  if (c.certificateStatus === "Expiring Soon") return "Within 30 days";
  return "Valid";
};

export function matchesFilters(c: ConnectorHealthRecord, f: Filters) {
  const pairs: [string, string][] = [
    [f.businessUnit, c.businessUnit],
    [f.connectorCategory, c.category],
    [f.platform, c.platform],
    [f.connectorType, c.connectorType],
    [f.connectorOwner, c.owner],
    [f.technicalOwner, c.technicalOwner],
    [f.healthStatus, c.healthStatus],
    [f.authenticationStatus, c.authenticationStatus],
    [f.authorizationStatus, c.authorizationStatus],
    [f.accessClassification, c.accessClassification],
    [f.discoveryMode, c.discoveryMode],
    [f.environment, c.environment],
    [f.region, c.region],
    [f.dataResidency, c.dataResidency],
    [f.rateLimitStatus, c.rateLimitStatus],
    [f.freshnessStatus, c.freshnessStatus],
    [f.credentialExpiration, credentialBucket(c)],
    [f.certificateExpiration, certificateBucket(c)],
  ];
  if (pairs.some(([want, actual]) => want !== "All" && want !== actual)) return false;
  if (f.team !== "All" && !c.teamNames.includes(f.team)) return false;
  if (f.knowledgeDomain !== "All" && !c.knowledgeDomains.includes(f.knowledgeDomain)) return false;
  if (f.incidentStatus === "With Open Incident" && c.incidentIds.length === 0) return false;
  if (f.incidentStatus === "No Open Incident" && c.incidentIds.length > 0) return false;
  return true;
}

/* ------------------------------- distribution ------------------------------ */

export const healthDistribution = [
  { status: "Healthy", count: 35, color: "#059669", sources: 96, personas: 61, incidents: 0 },
  { status: "Warning", count: 2, color: "#d97706", sources: 10, personas: 15, incidents: 1 },
  { status: "Degraded", count: 1, color: "#dc2626", sources: 3, personas: 4, incidents: 1 },
  { status: "Unauthorized", count: 0, color: "#7c3aed", sources: 0, personas: 0, incidents: 0 },
  { status: "Paused", count: 0, color: "#64748b", sources: 0, personas: 0, incidents: 0 },
  { status: "Maintenance", count: 0, color: "#0891b2", sources: 0, personas: 0, incidents: 0 },
];

/* ---------------------------------- trends --------------------------------- */

export type TrendMetric = "Availability" | "Latency" | "Throughput" | "Error Rate" | "Rate-Limit Utilization";
export const trendMetrics: TrendMetric[] = [
  "Availability", "Latency", "Throughput", "Error Rate", "Rate-Limit Utilization",
];
export const trendRanges = ["Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days"];

const seedSeries = (base: number, spread: number, points: number, seed: number) =>
  Array.from({ length: points }, (_, i) => {
    const wobble = Math.sin((i + seed) * 0.7) * spread + Math.cos((i + seed) * 0.31) * (spread / 2);
    return Number((base + wobble).toFixed(3));
  });

const labelsFor = (range: string) => {
  if (range === "Last hour") return Array.from({ length: 12 }, (_, i) => `${i * 5} m`);
  if (range === "Last 6 hours") return Array.from({ length: 12 }, (_, i) => `${i * 30} m`);
  if (range === "Last 24 hours") return Array.from({ length: 12 }, (_, i) => `${String(i * 2).padStart(2, "0")}:00`);
  if (range === "Last 7 days") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return Array.from({ length: 15 }, (_, i) => `D${i * 2 + 1}`);
};

export function trendSeries(metric: TrendMetric, range: string, degraded: boolean) {
  const labels = labelsFor(range);
  const n = labels.length;
  switch (metric) {
    case "Availability": {
      const a = seedSeries(degraded ? 99.2 : 99.94, degraded ? 0.9 : 0.05, n, 3);
      return {
        target: 99.9,
        unit: "%",
        data: labels.map((t, i) => ({ t, value: Number(Math.min(100, a[i]).toFixed(3)), target: 99.9 })),
      };
    }
    case "Latency": {
      const avg = seedSeries(degraded ? 780 : 280, degraded ? 220 : 60, n, 5);
      const p95 = seedSeries(degraded ? 1900 : 560, degraded ? 500 : 120, n, 9);
      const p99 = seedSeries(degraded ? 3100 : 810, degraded ? 700 : 160, n, 13);
      return {
        target: 800,
        unit: "ms",
        data: labels.map((t, i) => ({
          t, value: Math.round(avg[i]), p95: Math.round(p95[i]), p99: Math.round(p99[i]), target: 800,
        })),
      };
    }
    case "Throughput": {
      const v = seedSeries(degraded ? 26000 : 41000, 4200, n, 7);
      return { target: 38000, unit: "per minute", data: labels.map((t, i) => ({ t, value: Math.round(v[i]), target: 38000 })) };
    }
    case "Error Rate": {
      const e = seedSeries(degraded ? 4.2 : 0.32, degraded ? 1.6 : 0.18, n, 11);
      const r = seedSeries(degraded ? 9.1 : 0.9, degraded ? 2.4 : 0.4, n, 4);
      const to = seedSeries(degraded ? 2.1 : 0.11, degraded ? 0.8 : 0.06, n, 6);
      return {
        target: 1,
        unit: "%",
        data: labels.map((t, i) => ({
          t, value: Number(Math.max(0, e[i]).toFixed(2)),
          retry: Number(Math.max(0, r[i]).toFixed(2)), timeout: Number(Math.max(0, to[i]).toFixed(2)), target: 1,
        })),
      };
    }
    default: {
      const u = seedSeries(degraded ? 88 : 54, 12, n, 2);
      return {
        target: 85,
        unit: "%",
        data: labels.map((t, i) => ({
          t, value: Math.round(Math.min(100, Math.max(0, u[i]))),
          throttle: degraded && u[i] > 88 ? 3 : 0, target: 85,
        })),
      };
    }
  }
}

/* ------------------------- authentication and certs ------------------------ */

export const credentialSummary = {
  valid: 36, expiringWithin30: 1, expired: 1, failedAuthentication: 1,
  certificatesExpiringWithin30: 2, permissionDrift: 1,
};

export const credentialRows = connectors.map((c) => ({
  connectorId: c.id,
  connectorName: c.name,
  method: c.authenticationMethod,
  status: c.authenticationStatus,
  credentialType: c.credentialType,
  age: c.credentialAge,
  expiresIn: c.credentialExpiration,
  certificate: c.certificateStatus,
  lastValidation: c.lastAuthValidation,
  owner: c.securityOwner,
}));

export const credentialWarnings = [
  "Zoom Transcripts OAuth credential expires in 6 days",
  "Apigee service account token expired",
  "Legacy SharePoint certificate expires in 18 days",
  "Slack permission scope changed outside the approved template",
];

/* -------------------------------- authorization ---------------------------- */

export const authorizationSummary = {
  validated: 38, templatesApplied: 31, drift: 1, restrictedConflicts: 1, pendingReviews: 2,
};

export const permissionDrifts: PermissionDrift[] = [
  {
    connectorId: "CON-2003", connectorName: "Slack Enterprise",
    expectedScope: ["channels read", "metadata read", "approved workspace only"],
    actualScope: ["channels read", "metadata read", "private channel history read"],
    addedPermissions: ["private channel history read"],
    removedPermissions: ["approved workspace only"],
    affectedSources: 6, affectedClassifications: ["Confidential"],
    risk: "High", status: "Open",
    recommendedAction: "Remove the unauthorized permission or approve a documented exception",
  },
  {
    connectorId: "CON-2007", connectorName: "Apigee Identity Services",
    expectedScope: ["identity read", "audit read"],
    actualScope: ["identity read"],
    addedPermissions: [],
    removedPermissions: ["audit read"],
    affectedSources: 3, affectedClassifications: ["Highly Restricted"],
    risk: "Critical", status: "Open",
    recommendedAction: "Restore audit read after reauthorization so compliance evidence resumes",
  },
];

/* ----------------------------- throughput table ---------------------------- */

export const throughputRows = connectors
  .map((c) => ({
    connectorId: c.id,
    connectorName: c.name,
    current: c.throughput,
    unit: c.throughputUnit,
    target: c.throughputTarget,
    rateLimitUtilization: c.rateLimitUtilization,
    throttleEvents: c.throttleEvents,
    queueGrowth: c.queueGrowth,
    status:
      c.healthStatus === "Degraded"
        ? "Degraded because of authentication"
        : c.rateLimitUtilization >= 85 || c.throttleEvents > 5
          ? "Warning"
          : "Healthy",
  }))
  .sort((a, b) => b.rateLimitUtilization - a.rateLimitUtilization);

/* --------------------------------- errors ---------------------------------- */

export const errorCategories = [
  "Authentication", "Authorization", "Timeout", "Rate Limit", "Network",
  "Schema Change", "Payload Rejection", "Certificate", "Source Unavailable", "Unknown",
];

export const connectorErrors: ConnectorError[] = [
  {
    id: "ERR-9001", connectorId: "CON-2007", connectorName: "Apigee Identity Services",
    errorCode: "APIGEE-AUTH-401", errorCategory: "Authentication",
    description: "Service account token exchange rejected by the identity provider.",
    count: 46, firstSeen: "10:14 AM", lastSeen: "2 min ago", retryable: false,
    affectedSourceIds: ["SRC-1007"], affectedStageIds: ["ingest", "parse"],
    retrySuccessRate: 0, meanTimeToRecovery: "—",
    recommendedAction: "Reauthorize the connector and rotate the simulated service account credential",
  },
  {
    id: "ERR-9002", connectorId: "CON-2004", connectorName: "Zoom Transcripts",
    errorCode: "ZOOM-OAUTH-EXP", errorCategory: "Authentication",
    description: "OAuth refresh token enters its expiration window in 6 days.",
    count: 1, firstSeen: "10:09 AM", lastSeen: "10:09 AM", retryable: false,
    affectedSourceIds: ["SRC-1004"], affectedStageIds: ["ingest"],
    retrySuccessRate: 0, meanTimeToRecovery: "—",
    recommendedAction: "Rotate the simulated credential before expiration",
  },
  {
    id: "ERR-9003", connectorId: "CON-2003", connectorName: "Slack Enterprise",
    errorCode: "SLACK-SCOPE-DRIFT", errorCategory: "Authorization",
    description: "Granted scope no longer matches the approved permission template.",
    count: 1, firstSeen: "10:18 AM", lastSeen: "10:18 AM", retryable: false,
    affectedSourceIds: ["SRC-1003"], affectedStageIds: ["ingest", "validate"],
    retrySuccessRate: 0, meanTimeToRecovery: "—",
    recommendedAction: "Restore the approved scope or record an approved exception",
  },
  {
    id: "ERR-9004", connectorId: "CON-2009", connectorName: "SharePoint Online",
    errorCode: "SP-CERT-EXPIRY", errorCategory: "Certificate",
    description: "Signing certificate expires within 18 days.",
    count: 1, firstSeen: "9:58 AM", lastSeen: "9:58 AM", retryable: false,
    affectedSourceIds: ["SRC-1008"], affectedStageIds: ["ingest"],
    retrySuccessRate: 0, meanTimeToRecovery: "—",
    recommendedAction: "Schedule certificate rotation with the compliance owner",
  },
  {
    id: "ERR-9005", connectorId: "CON-2001", connectorName: "Confluence Cloud",
    errorCode: "CONF-TIMEOUT-504", errorCategory: "Timeout",
    description: "Transient gateway timeout on attachment retrieval.",
    count: 12, firstSeen: "9:41 AM", lastSeen: "10:03 AM", retryable: true,
    affectedSourceIds: ["SRC-1001"], affectedStageIds: ["ingest"],
    retrySuccessRate: 96, meanTimeToRecovery: "3 min",
    recommendedAction: "No action required. Retries are succeeding within policy",
  },
  {
    id: "ERR-9006", connectorId: "CON-2003", connectorName: "Slack Enterprise",
    errorCode: "SLACK-RATE-429", errorCategory: "Rate Limit",
    description: "Event stream throttled at 91 percent rate limit utilization.",
    count: 14, firstSeen: "8:52 AM", lastSeen: "12 min ago", retryable: true,
    affectedSourceIds: ["SRC-1003"], affectedStageIds: ["ingest"],
    retrySuccessRate: 88, meanTimeToRecovery: "6 min",
    recommendedAction: "Reduce concurrency or request a higher enterprise rate limit",
  },
];

export const errorCategorySummary = errorCategories
  .map((cat) => {
    const list = connectorErrors.filter((e) => e.errorCategory === cat);
    return {
      category: cat,
      count: list.reduce((a, e) => a + e.count, 0),
      connectors: new Set(list.map((e) => e.connectorId)).size,
      sources: new Set(list.flatMap((e) => e.affectedSourceIds)).size,
      firstSeen: list[0]?.firstSeen ?? "—",
      lastSeen: list[0]?.lastSeen ?? "—",
      retrySuccessRate: list.length ? Math.round(list.reduce((a, e) => a + e.retrySuccessRate, 0) / list.length) : 0,
      mttr: list.find((e) => e.meanTimeToRecovery !== "—")?.meanTimeToRecovery ?? "—",
    };
  })
  .filter((c) => c.count > 0);

/* --------------------------------- alerts ---------------------------------- */

export const connectorAlerts: ConnectorAlert[] = [
  {
    id: "ALR-5001", connectorId: "CON-2007", connectorName: "Apigee Identity Services",
    title: "Apigee authentication failed", severity: "Critical", status: "Open",
    observedValue: "46 consecutive failures", threshold: "3 consecutive failures",
    businessImpact: "Identity evidence is stale and one release approval is paused.",
    technicalImpact: "Discovery jobs blocked; 2,117 artifacts queued.",
    recommendedAction: "Reauthorize the connector and rotate the simulated service account credential",
    owner: "Security Engineering", createdAt: "10:14 AM", updatedAt: "2 min ago",
  },
  {
    id: "ALR-5002", connectorId: "CON-2004", connectorName: "Zoom Transcripts",
    title: "Zoom credential expiring in 6 days", severity: "High", status: "Open",
    observedValue: "6 days remaining", threshold: "14 days remaining",
    businessImpact: "Governance forum evidence will stop refreshing after expiration.",
    technicalImpact: "Scheduled discovery will fail at the next token exchange.",
    recommendedAction: "Rotate the simulated credential and confirm scope",
    owner: "Unified Communications", createdAt: "10:09 AM", updatedAt: "10:09 AM",
  },
  {
    id: "ALR-5003", connectorId: "CON-2003", connectorName: "Slack Enterprise",
    title: "Slack permission drift detected", severity: "High", status: "Investigating",
    observedValue: "private channel history read granted", threshold: "Approved template scope only",
    businessImpact: "Conversation evidence may include unapproved confidential content.",
    technicalImpact: "Actual scope differs from the approved permission template.",
    recommendedAction: "Restore the approved scope or request a governed exception",
    owner: "Collaboration Platforms", createdAt: "10:18 AM", updatedAt: "6 min ago",
  },
  {
    id: "ALR-5004", connectorId: "CON-2009", connectorName: "SharePoint Online",
    title: "SharePoint certificate expires in 18 days", severity: "Medium", status: "Acknowledged",
    observedValue: "18 days remaining", threshold: "30 days remaining",
    businessImpact: "Policy documentation discovery is at risk after expiration.",
    technicalImpact: "Certificate based authentication will fail after 2026-08-24.",
    recommendedAction: "Schedule certificate rotation with the compliance owner",
    owner: "Collaboration Platforms", createdAt: "9:58 AM", updatedAt: "9:58 AM",
  },
  {
    id: "ALR-5005", connectorId: "CON-2001", connectorName: "Confluence Cloud",
    title: "Confluence latency exceeded target", severity: "Low", status: "Monitoring",
    observedValue: "P95 410 ms", threshold: "P95 400 ms",
    businessImpact: "No measurable business impact.",
    technicalImpact: "Brief P95 latency excursion during attachment retrieval.",
    recommendedAction: "Continue monitoring. No action required",
    owner: "Engineering Operations", createdAt: "9:47 AM", updatedAt: "9:47 AM",
  },
];

/* ------------------------------- dependencies ------------------------------ */

export const dependencyImpacts: ConnectorDependencyImpact[] = [
  {
    connectorId: "CON-2007", connectorName: "Apigee Identity Services",
    sourceNames: ["Identity Services API", "Access Audit Feed", "Entitlement Catalog"],
    discoveryJobNames: ["Identity hourly discovery", "Entitlement reconciliation"],
    artifactCount: 8412,
    personaNames: ["Security Engineering Persona", "Payments Platform Persona", "Identity Operations Persona", "Compliance Persona"],
    conditionNames: [
      "Authentication Availability Condition", "PCI Compliance Condition",
      "Restricted API Access Condition", "Entitlement Review Condition", "Audit Evidence Freshness Condition",
    ],
    evidenceRecordCount: 3240,
    evaluationNames: ["Payments release readiness evaluation", "Quarterly access review evaluation"],
    decisionNames: ["Payments release approval"],
    confidenceImpact: "Decision confidence reduced by 9 percent",
    freshnessImpact: "Persona freshness reduced from 94 to 81",
    recommendedAction: "Reauthorize the connector and rerun identity discovery",
  },
  {
    connectorId: "CON-2003", connectorName: "Slack Enterprise",
    sourceNames: ["Support Collaboration", "SRE Operations Channel"],
    discoveryJobNames: ["Conversation stream"],
    artifactCount: 2428,
    personaNames: ["Customer Support Persona", "Reliability Engineering Persona"],
    conditionNames: ["Escalation Handling Condition", "Conversation Evidence Scope Condition"],
    evidenceRecordCount: 1180,
    evaluationNames: ["Support escalation trend evaluation"],
    decisionNames: [],
    confidenceImpact: "Evidence admissibility under review",
    freshnessImpact: "Freshness unaffected; scope validity affected",
    recommendedAction: "Restore approved scope before admitting new conversation evidence",
  },
  {
    connectorId: "CON-2004", connectorName: "Zoom Transcripts",
    sourceNames: ["Architecture Reviews"],
    discoveryJobNames: ["Governance transcript discovery"],
    artifactCount: 1942,
    personaNames: ["Architecture Office Persona"],
    conditionNames: ["Governance Decision Evidence Condition"],
    evidenceRecordCount: 640,
    evaluationNames: [],
    decisionNames: [],
    confidenceImpact: "No current confidence impact",
    freshnessImpact: "Freshness will degrade after credential expiration",
    recommendedAction: "Rotate the simulated credential within 6 days",
  },
];

export const downstreamSummary = {
  sourcesAtRisk: 3,
  artifactsDelayed: 8412,
  discoveryJobsAffected: 2,
  personasAtRisk: 4,
  conditionsAtRisk: 5,
  evidenceDelayed: 3240,
  staleEvaluations: 2,
  decisionsAwaiting: 1,
  confidenceImpact: "Decision confidence reduced by 9 percent",
  freshnessImpact: "Persona freshness reduced from 94 to 81",
  evaluationImpact: "Two evaluations flagged for stale evidence",
  workflowImpact: "One approval workflow paused",
};

/* -------------------------------- incidents -------------------------------- */

export const seedIncidents: ConnectorIncident[] = [
  {
    id: "INC-4471", connectorId: "CON-2007", connectorName: "Apigee Identity Services",
    severity: "Critical", summary: "Identity services connector authentication failure",
    description: "Service account token exchange rejected; identity discovery blocked.",
    businessImpact: "Release approval paused pending refreshed identity evidence.",
    technicalImpact: "Discovery jobs blocked and queue rising 22 percent per hour.",
    affectedSources: 3, affectedPersonas: 4, affectedEvaluations: 2,
    owner: "Security Engineering", resolverGroup: "Integration Platforms", priority: "P1",
    status: "Investigating", createdAt: "10:16 AM", resolvedAt: null, mttaMinutes: 4, mttrMinutes: 0,
  },
];

/* -------------------------------- activity --------------------------------- */

export const seedActivity: ConnectorActivity[] = [
  { id: "CA-1", connectorId: "CON-2006", connectorName: "Datadog Telemetry", category: "Telemetry", timestamp: "10:22 AM", action: "Connection test passed", description: "Scheduled connectivity and authentication test completed successfully.", result: "Passed", owner: "Observability Engineering", auditId: "AUD-7741" },
  { id: "CA-2", connectorId: "CON-2003", connectorName: "Slack Enterprise", category: "Chat", timestamp: "10:18 AM", action: "Permission drift detected", description: "Granted scope diverged from the approved permission template.", result: "Warning", owner: "Collaboration Platforms", auditId: "AUD-7740" },
  { id: "CA-3", connectorId: "CON-2007", connectorName: "Apigee Identity Services", category: "APIs", timestamp: "10:14 AM", action: "Authentication failed", description: "Service account token exchange rejected by the identity provider.", result: "Failed", owner: "Security Engineering", auditId: "AUD-7739" },
  { id: "CA-4", connectorId: "CON-2004", connectorName: "Zoom Transcripts", category: "Meetings", timestamp: "10:09 AM", action: "Token entered expiration window", description: "OAuth refresh token expires in 6 days.", result: "Warning", owner: "Unified Communications", auditId: "AUD-7738" },
  { id: "CA-5", connectorId: "CON-2001", connectorName: "Confluence Cloud", category: "Documents", timestamp: "10:03 AM", action: "Transient timeout recovered", description: "Attachment retrieval timeout recovered on retry.", result: "Completed", owner: "Engineering Operations", auditId: "AUD-7737" },
  { id: "CA-6", connectorId: "CON-2009", connectorName: "SharePoint Online", category: "Documents", timestamp: "9:58 AM", action: "Certificate warning created", description: "Signing certificate expires within 18 days.", result: "Warning", owner: "Collaboration Platforms", auditId: "AUD-7736" },
  { id: "CA-7", connectorId: "CON-2008", connectorName: "ServiceNow Enterprise", category: "Tickets", timestamp: "9:52 AM", action: "Synchronization completed", description: "Incremental synchronization completed with no errors.", result: "Completed", owner: "IT Service Management", auditId: "AUD-7735" },
];

/* ------------------------------ notifications ------------------------------ */

export const notificationSeed = [
  { id: "N1", type: "Authentication failed", title: "Apigee Identity Services token exchange rejected", time: "8 min ago", read: false },
  { id: "N2", type: "Credential expiring", title: "Zoom Transcripts OAuth credential expires in 6 days", time: "13 min ago", read: false },
  { id: "N3", type: "Permission drift", title: "Slack Enterprise scope changed outside the approved template", time: "4 min ago", read: false },
  { id: "N4", type: "Certificate expiring", title: "SharePoint Online certificate expires in 18 days", time: "24 min ago", read: true },
  { id: "N5", type: "Rate-limit warning", title: "Slack Enterprise rate limit utilization at 91 percent", time: "30 min ago", read: true },
  { id: "N6", type: "Availability breach", title: "Apigee Identity Services availability below 99.9 percent", time: "1 h ago", read: true },
  { id: "N7", type: "Incident created", title: "INC-4471 opened for Apigee Identity Services", time: "1 h ago", read: true },
];

/* -------------------------------- KPI trends ------------------------------- */

export const kpiTrends = {
  total: [34, 34, 35, 36, 36, 37, 38, 38],
  healthy: [33, 33, 34, 34, 35, 34, 35, 35],
  attention: [1, 1, 1, 2, 1, 3, 3, 3],
  auth: [99, 99, 98, 98, 97, 97, 97, 97],
  availability: [99.94, 99.95, 99.93, 99.92, 99.9, 99.91, 99.91, 99.91],
  downstream: [2, 3, 3, 6, 8, 11, 13, 14],
};

/* --------------------------------- scenarios ------------------------------- */

export type DemoScenario =
  | "healthy" | "auth-failure" | "credential-expiration" | "certificate-expiration" | "permission-drift"
  | "rate-limit" | "latency" | "throughput-collapse" | "source-unavailable" | "paused"
  | "diagnostics-running" | "restoration" | "reset";

export interface ScenarioSnapshot {
  networkState: NetworkState;
  banner?: string;
  totalConnectors: number;
  healthyConnectors: number;
  attention: number;
  warningCount: number;
  degradedCount: number;
  authValidity: number;
  authValid: number;
  authExpiring: number;
  authFailed: number;
  availability: number;
  downstreamAtRisk: number;
  focusPanel?: string;
  highlightConnectorIds: string[];
  overrides: Record<string, Partial<ConnectorHealthRecord>>;
  degradedCharts: boolean;
  extraAlert?: ConnectorAlert;
  extraActivity?: ConnectorActivity;
}

const base = {
  networkState: "Degraded" as NetworkState,
  totalConnectors: 38, healthyConnectors: 35, attention: 3, warningCount: 2, degradedCount: 1,
  authValidity: 97, authValid: 36, authExpiring: 1, authFailed: 1,
  availability: 99.91, downstreamAtRisk: 14,
  highlightConnectorIds: [] as string[],
  overrides: {} as Record<string, Partial<ConnectorHealthRecord>>,
  degradedCharts: false,
};

export const scenarioSnapshots: Record<DemoScenario, ScenarioSnapshot> = {
  healthy: {
    ...base, networkState: "Healthy", healthyConnectors: 38, attention: 0, warningCount: 0, degradedCount: 0,
    authValidity: 100, authValid: 38, authExpiring: 0, authFailed: 0, availability: 99.97, downstreamAtRisk: 0,
    overrides: {
      "CON-2003": { healthStatus: "Healthy", authorizationStatus: "Valid", rateLimitUtilization: 61, rateLimitStatus: "Normal", throttleEvents: 0, warningCount: 0 },
      "CON-2004": { healthStatus: "Healthy", authenticationStatus: "Valid", credentialExpiration: "in 88 days", credentialExpiresInDays: 88, warningCount: 0 },
      "CON-2007": { healthStatus: "Healthy", authenticationStatus: "Valid", authorizationStatus: "Valid", availability: 99.94, averageLatency: 320, errorRate: 0.2, credentialExpiration: "in 90 days", credentialExpiresInDays: 90, freshnessStatus: "Current", warningCount: 0 },
    },
  },
  reset: { ...base },
  "auth-failure": {
    ...base,
    banner: "Apigee Identity Services authentication has failed. Identity discovery is blocked and downstream evidence is going stale.",
    focusPanel: "panel-auth", highlightConnectorIds: ["CON-2007"],
    attention: 3, degradedCount: 1, authValidity: 97, downstreamAtRisk: 14, availability: 99.88,
  },
  "credential-expiration": {
    ...base,
    banner: "Zoom Transcripts OAuth credential expires in 6 days. Rotate the simulated credential before the expiration window closes.",
    focusPanel: "panel-auth", highlightConnectorIds: ["CON-2004"], authExpiring: 1,
  },
  "certificate-expiration": {
    ...base,
    banner: "SharePoint Online signing certificate expires in 18 days. Policy documentation discovery is at risk.",
    focusPanel: "panel-auth", highlightConnectorIds: ["CON-2009"],
  },
  "permission-drift": {
    ...base,
    banner: "Slack Enterprise granted scope no longer matches the approved permission template.",
    focusPanel: "panel-drift", highlightConnectorIds: ["CON-2003"],
  },
  "rate-limit": {
    ...base, networkState: "Degraded",
    banner: "Slack Enterprise is throttled at 97 percent rate limit utilization. Conversation evidence is falling behind.",
    focusPanel: "panel-throughput", highlightConnectorIds: ["CON-2003"], degradedCharts: true,
    warningCount: 3, attention: 4,
    overrides: {
      "CON-2003": { rateLimitUtilization: 97, rateLimitStatus: "Throttled", throttleEvents: 61, queueDepth: 5820, queueGrowth: "Rising 19% per hour", freshnessStatus: "Aging" },
    },
  },
  latency: {
    ...base, networkState: "Degraded",
    banner: "Latency across document and meeting connectors exceeds target. Discovery freshness is degrading.",
    focusPanel: "panel-trends", degradedCharts: true, highlightConnectorIds: ["CON-2001", "CON-2004"],
    warningCount: 4, attention: 5, availability: 99.61,
    overrides: {
      "CON-2001": { healthStatus: "Warning", averageLatency: 910, p95Latency: 2100, p99Latency: 3100, freshnessStatus: "Aging", warningCount: 3 },
      "CON-2004": { averageLatency: 2600, p95Latency: 5200, p99Latency: 7400, freshnessStatus: "Stale" },
    },
  },
  "throughput-collapse": {
    ...base, networkState: "Critical",
    banner: "Telemetry throughput has collapsed to 22 percent of target. Reliability evidence is no longer real time.",
    focusPanel: "panel-throughput", degradedCharts: true, highlightConnectorIds: ["CON-2006"],
    attention: 5, degradedCount: 2, downstreamAtRisk: 22,
    overrides: {
      "CON-2006": { healthStatus: "Degraded", throughput: 7700, queueDepth: 54200, queueGrowth: "Rising 41% per hour", freshnessStatus: "Stale", warningCount: 7 },
    },
  },
  "source-unavailable": {
    ...base, networkState: "Critical",
    banner: "The SharePoint Online source endpoint is unavailable. Policy documentation discovery has stopped.",
    focusPanel: "panel-errors", highlightConnectorIds: ["CON-2009"], attention: 4, degradedCount: 2,
    overrides: {
      "CON-2009": { healthStatus: "Unavailable", availability: 88.4, errorRate: 41.2, freshnessStatus: "Stale", healthSummary: "Endpoint unreachable. All discovery requests are failing.", warningCount: 9 },
    },
  },
  paused: {
    ...base, networkState: "Paused",
    banner: "Slack Enterprise is paused pending permission restoration. Its queue is draining and freshness will degrade.",
    focusPanel: "panel-matrix", highlightConnectorIds: ["CON-2003"],
    overrides: {
      "CON-2003": { healthStatus: "Paused", throughput: 0, queueGrowth: "Draining", freshnessStatus: "Aging", healthSummary: "Paused by operator pending permission restoration." },
    },
  },
  "diagnostics-running": {
    ...base, networkState: "Checking",
    banner: "Diagnostics are running across the connector network. Results will settle when the run completes.",
    focusPanel: "panel-matrix",
  },
  restoration: {
    ...base, networkState: "Healthy",
    banner: "Apigee Identity Services has been reauthorized. Identity evidence and dependent personas are refreshing.",
    focusPanel: "panel-impact", highlightConnectorIds: ["CON-2007"],
    healthyConnectors: 37, attention: 1, warningCount: 1, degradedCount: 0,
    authValidity: 100, authValid: 38, authExpiring: 0, authFailed: 0, availability: 99.94, downstreamAtRisk: 2,
    overrides: {
      "CON-2007": {
        healthStatus: "Healthy", authenticationStatus: "Valid", authorizationStatus: "Valid",
        availability: 99.93, averageLatency: 340, p95Latency: 620, errorRate: 0.3, queueDepth: 210,
        freshnessStatus: "Current", credentialExpiration: "in 90 days", credentialExpiresInDays: 90,
        warningCount: 0, healthSummary: "Restored after reauthorization. Backlog is draining normally.",
      },
    },
  },
};

export const demoScenarios: { id: DemoScenario; label: string }[] = [
  { id: "healthy", label: "Healthy Connector Network" },
  { id: "auth-failure", label: "Authentication Failure" },
  { id: "credential-expiration", label: "Credential Expiration" },
  { id: "certificate-expiration", label: "Certificate Expiration" },
  { id: "permission-drift", label: "Permission Drift" },
  { id: "rate-limit", label: "Rate Limit Saturation" },
  { id: "latency", label: "Latency Degradation" },
  { id: "throughput-collapse", label: "Throughput Collapse" },
  { id: "source-unavailable", label: "Source Unavailable" },
  { id: "paused", label: "Connector Paused" },
  { id: "diagnostics-running", label: "Diagnostics Running" },
  { id: "restoration", label: "Connector Restoration" },
];

/* -------------------------------- resolvers -------------------------------- */

export function resolveConnectors(
  scenario: DemoScenario,
  filters: Filters,
  overrides: Record<string, Partial<ConnectorHealthRecord>>,
  extra: ConnectorHealthRecord[],
): ConnectorHealthRecord[] {
  const snap = scenarioSnapshots[scenario];
  return [...connectors, ...extra]
    .map((c) => ({ ...c, ...(snap.overrides[c.id] ?? {}), ...(overrides[c.id] ?? {}) }))
    .filter((c) => matchesFilters(c, filters));
}

export function resolveAlerts(
  scenario: DemoScenario,
  statusOverrides: Record<string, ConnectorAlert["status"]>,
  extra: ConnectorAlert[],
): ConnectorAlert[] {
  const snap = scenarioSnapshots[scenario];
  let list = connectorAlerts;
  if (scenario === "healthy" || scenario === "restoration") {
    list = connectorAlerts.filter((a) => a.severity === "Low" || a.severity === "Medium");
  }
  return [...extra, ...(snap.extraAlert ? [snap.extraAlert] : []), ...list]
    .map((a) => ({ ...a, status: statusOverrides[a.id] ?? a.status }));
}

export function resolveActivity(scenario: DemoScenario, extra: ConnectorActivity[]): ConnectorActivity[] {
  const snap = scenarioSnapshots[scenario];
  return [...extra, ...(snap.extraActivity ? [snap.extraActivity] : []), ...seedActivity];
}

export function resolveDrifts(scenario: DemoScenario, statuses: Record<string, PermissionDrift["status"]>): PermissionDrift[] {
  if (scenario === "healthy" || scenario === "restoration") {
    return permissionDrifts.filter((d) => d.connectorId === "CON-2003").map((d) => ({ ...d, status: statuses[d.connectorId] ?? "Restored" }));
  }
  return permissionDrifts.map((d) => ({ ...d, status: statuses[d.connectorId] ?? d.status }));
}

/* ----------------------------- search catalog ------------------------------ */

export const searchCatalog: {
  id: string; type: string; title: string; status: string; owner: string; affected: string;
}[] = [
  ...connectors.map((c) => ({
    id: c.id, type: "Connectors", title: `${c.name} (${c.id})`, status: c.healthStatus,
    owner: c.owner, affected: `${affectedCounts[c.id]?.sources ?? 0} sources`,
  })),
  ...Array.from(new Set(connectors.map((c) => c.platform))).map((p, i) => ({
    id: `PLT-${i}`, type: "Platforms", title: p, status: "Connected", owner: "Platform Engineering", affected: "—",
  })),
  ...Array.from(new Set(connectors.map((c) => c.owner))).map((o, i) => ({
    id: `OWN-${i}`, type: "Owners", title: o, status: "Active", owner: o, affected: "—",
  })),
  ...connectors.flatMap((c) => c.sourceIds).filter((v, i, a) => a.indexOf(v) === i).map((s) => ({
    id: s, type: "Sources", title: s, status: "Registered", owner: "Source Registry", affected: "—",
  })),
  ...connectors.flatMap((c) => c.discoveryJobIds).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8).map((j) => ({
    id: j, type: "Discovery Jobs", title: j, status: "Scheduled", owner: "Discovery Pipeline", affected: "—",
  })),
  ...connectorErrors.map((e) => ({
    id: e.id, type: "Errors", title: `${e.errorCode} — ${e.connectorName}`, status: e.errorCategory,
    owner: e.connectorName, affected: `${e.count} occurrences`,
  })),
  ...connectorAlerts.map((a) => ({
    id: a.id, type: "Alerts", title: a.title, status: a.status, owner: a.owner, affected: a.severity,
  })),
  ...seedIncidents.map((i) => ({
    id: i.id, type: "Incidents", title: i.summary, status: i.status, owner: i.owner, affected: `${i.affectedSources} sources`,
  })),
  { id: "PER-1", type: "Personas", title: "Security Engineering Persona", status: "At risk of staleness", owner: "Security Engineering", affected: "Apigee" },
  { id: "PER-2", type: "Personas", title: "Architecture Office Persona", status: "Healthy", owner: "Architecture Office", affected: "Zoom" },
  { id: "PER-3", type: "Personas", title: "Reliability Engineering Persona", status: "Healthy", owner: "SRE", affected: "Datadog" },
  { id: "BC-2", type: "Business Conditions", title: "PCI Compliance Condition", status: "At risk", owner: "Enterprise Compliance", affected: "Apigee" },
  { id: "BC-5", type: "Business Conditions", title: "Entitlement Review Condition", status: "At risk", owner: "Security Engineering", affected: "Apigee" },
  { id: "EVAL-1", type: "Impact Evaluations", title: "Payments release readiness evaluation", status: "Stale evidence", owner: "Payments Platform", affected: "Apigee" },
  { id: "EVAL-2", type: "Impact Evaluations", title: "Quarterly access review evaluation", status: "Stale evidence", owner: "Security Engineering", affected: "Apigee" },
];

/* --------------------------------- helpers --------------------------------- */

export const sidebarStatus = {
  state: "Degraded" as NetworkState,
  total: 38, healthy: 35, warning: 2, degraded: 1,
};

export const diagnosticTestTypes = [
  "DNS Resolution", "Network Connectivity", "TLS Handshake", "Authentication", "Authorization",
  "Permission Scope", "Endpoint Availability", "Latency", "Throughput", "Rate Limit",
  "Schema Compatibility", "Metadata Retrieval", "Sample Artifact Retrieval", "Streaming Connection",
  "Synchronization Cursor",
];

export const diagnosticDepths = [
  "Quick Health Check", "Standard Diagnostics", "Deep Diagnostics", "Security Validation", "Performance Validation",
];

export const diagnosticScopes = [
  "All Connectors", "Selected Connectors", "Connector Category", "Platform", "Business Unit", "Team", "Status",
];

export const diagnosticPhases = [
  "Preparing", "Testing Connectivity", "Testing Security", "Testing Permissions",
  "Testing Performance", "Testing Synchronization", "Analyzing Dependencies", "Completed",
];

export function buildDiagnostic(connectorIds: string[], scope: string, depth: string, tests: string[]): ConnectorDiagnostic {
  const testRows: ConnectorDiagnosticTest[] = [];
  connectorIds.slice(0, 6).forEach((cid, ci) => {
    tests.forEach((t, ti) => {
      const c = connectorById[cid];
      const failing = c?.healthStatus === "Degraded" && (t === "Authentication" || t === "Authorization");
      const warning = !failing && ((c?.authorizationStatus === "Permission Drift Detected" && t === "Permission Scope")
        || (c?.authenticationStatus === "Expiring Soon" && t === "Authentication")
        || (c?.rateLimitUtilization >= 85 && t === "Rate Limit"));
      testRows.push({
        id: `DT-${ci}-${ti}`,
        diagnosticId: "DIAG-1",
        connectorId: cid,
        testType: t,
        status: failing ? "Failed" : warning ? "Warning" : "Passed",
        duration: `${180 + ((ci * 37 + ti * 53) % 820)} ms`,
        observedValue: failing ? "HTTP 401 token exchange rejected" : warning ? "Outside approved threshold" : "Within threshold",
        expectedValue: failing ? "HTTP 200" : "Within threshold",
        evidence: `Read-only probe against ${c?.platform ?? "endpoint"} metadata`,
        recommendedAction: failing
          ? "Reauthorize the connector and rotate the simulated credential"
          : warning
            ? "Review configuration against the approved template"
            : "No action required",
      });
    });
  });
  const passed = testRows.filter((t) => t.status === "Passed").length;
  const warn = testRows.filter((t) => t.status === "Warning").length;
  const failed = testRows.filter((t) => t.status === "Failed").length;
  return {
    id: "DIAG-1", connectorIds, scope, depth, status: "Completed", progress: 100,
    testsSelected: testRows.length, testsPassed: passed, testsWarning: warn, testsFailed: failed,
    startedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    recommendations: [
      failed ? "Reauthorize Apigee Identity Services and rerun identity discovery" : "No blocking failures detected",
      warn ? "Restore the approved Slack permission scope and rotate the Zoom credential" : "No warnings detected",
      "Export diagnostics for the connector governance record",
    ],
    affectedSources: failed ? 3 : warn ? 6 : 0,
    affectedPersonas: failed ? 4 : warn ? 5 : 0,
    affectedEvaluations: failed ? 2 : 0,
    tests: testRows,
  };
}

export function makeConnector(input: {
  name: string; description: string; category: ConnectorCategory; platform: string; environment: string;
  region: string; businessUnit: string; owner: string; technicalOwner: string; securityOwner: string;
  authenticationMethod: string; permissionScope: string; accessClassification: string;
  dataResidency: string; index: number;
}): ConnectorHealthRecord {
  const id = `CON-${2011 + input.index}`;
  return {
    ...connectors[0],
    id,
    name: input.name,
    description: input.description || "Registered through the Add Connector workflow.",
    businessPurpose: "Pending business purpose confirmation.",
    category: input.category, platform: input.platform, connectorType: "REST polling",
    environment: input.environment, region: input.region, dataResidency: input.dataResidency,
    businessUnit: input.businessUnit, teamNames: ["Architecture Office"], knowledgeDomains: ["Engineering"],
    owner: input.owner, technicalOwner: input.technicalOwner, securityOwner: input.securityOwner,
    healthStatus: "Healthy", healthSummary: "Newly registered. Awaiting first full discovery cycle.",
    availability: 100, averageLatency: 0, p95Latency: 0, p99Latency: 0,
    throughput: 0, queueDepth: 0, errorRate: 0, timeoutRate: 0, retryRate: 0,
    rateLimitUtilization: 0, rateLimitStatus: "Normal", throttleEvents: 0, queueGrowth: "Stable",
    freshness: "not yet run", freshnessStatus: "Current",
    lastSuccessfulTest: "just now", lastFailedTest: null, lastSuccessfulSync: "not yet run", nextSync: "in 15 min",
    authenticationMethod: input.authenticationMethod, authenticationStatus: "Valid",
    credentialType: `${input.authenticationMethod} credential`, credentialAge: "0 days",
    credentialExpiration: "in 90 days", credentialExpiresInDays: 90,
    lastCredentialRotation: "2026-08-06", nextCredentialRotation: "2026-11-04",
    failedAuthAttempts: 0, lastAuthValidation: "just now",
    certificateStatus: "Not Applicable", certificateExpiration: "—", certificateExpiresInDays: null, certificateIssuer: "—",
    authorizationStatus: "Valid", permissionScope: input.permissionScope,
    expectedPermissionScope: [input.permissionScope], actualPermissionScope: [input.permissionScope],
    approvedPaths: [], restrictedPaths: [], permissionTemplate: "Default Read Only",
    lastPermissionValidation: "just now", accessClassification: input.accessClassification,
    sourceIds: [], discoveryJobIds: [], artifactsInFlight: 0, personaIds: [], conditionIds: [],
    evidenceRecordCount: 0, activeEvaluationIds: [], decisionIds: [], incidentIds: [], externalConsumers: 0,
    downstreamRisk: "Low", businessImpact: "No current business impact.",
    warningCount: 0, configurationVersion: "v1.0",
    createdAt: "2026-08-06", updatedAt: "2026-08-06",
  };
}
