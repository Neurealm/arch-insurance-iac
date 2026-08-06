/**
 * Enterprise Source Registry — deterministic demonstration data model.
 * Structured so local seeds can be swapped for real APIs without UI redesign.
 */

export type ViewMode = "catalog" | "operations" | "governance" | "relationship";

export type RegistryState = "Operational" | "Reconciling" | "Degraded" | "Review Required" | "Maintenance";
export type RegistryStatus =
  | "Active" | "Warning" | "Degraded" | "Pending" | "Action Required" | "Possible Duplicate" | "Paused" | "Deprecated";
export type AuthorityLevel = "Primary" | "Supporting" | "Historical" | "Reference" | "Unconfirmed";
export type ApprovalState = "Approved" | "Pending Review" | "Restricted Approval" | "Review Required" | "Deprecated";
export type AccessClassification = "Public" | "Internal" | "Confidential" | "Restricted" | "Highly Restricted";
export type FreshnessStatus = "Real Time" | "Current" | "Aging" | "Stale";
export type ConnectorStatus = "Healthy" | "Degraded" | "Failing" | "Paused" | "Not Configured";
export type Severity = "Critical" | "High" | "Medium" | "Low";
export type LifecycleStage =
  | "Discovered" | "Registered" | "Validated" | "Approved" | "Active" | "Restricted" | "Paused" | "Deprecated";

export interface SourceRegistryRecord {
  id: string;
  sourceName: string;
  description: string;
  businessPurpose: string;
  category: string;
  platform: string;
  environment: string;
  region: string;
  dataResidency: string;
  businessUnit: string;
  businessOwner: string;
  technicalOwner: string;
  dataSteward: string;
  securityOwner: string;
  complianceOwner: string;
  teamsRepresented: number;
  teamNames: string[];
  knowledgeDomains: string[];
  businessCapabilities: string[];
  customerJourneys: string[];
  productsServices: string[];
  externalStakeholders: string[];
  authorityLevel: AuthorityLevel;
  approvalState: ApprovalState;
  accessClassification: AccessClassification;
  regulatoryScope: string[];
  retentionPolicy: string;
  legalHold: boolean;
  allowedUses: string[];
  restrictedUses: string[];
  registryStatus: RegistryStatus;
  lifecycleStage: LifecycleStage;
  freshnessStatus: FreshnessStatus;
  qualityScore: number;
  ownershipConfidence: number;
  authorityConfidence: number;
  metadataCompleteness: number;
  relationshipCoverage: number;
  connectorId: string;
  connectorStatus: ConnectorStatus;
  authenticationStatus: string;
  authorizationScope: string;
  discoveryMode: string;
  scheduleId: string;
  schedule: string;
  lastSync: string;
  nextRun: string;
  artifactCount: number;
  queueDepth: number;
  successRate: number;
  warningCount: number;
  processingReadiness: string;
  configurationVersion: string;
  createdAt: string;
  discoveredAt: string;
  updatedAt: string;
  nextReviewDate: string;
  reviewCadence: string;
  replacementSourceId?: string;
  relationshipCounts: {
    artifacts: number;
    conditions: number;
    personas: number;
    dependencies: number;
    decisions: number;
    consumers: number;
  };
}

export interface SourceRelationship {
  id: string;
  sourceId: string;
  relationshipType:
    | "REPRESENTS_TEAM" | "CONTAINS_DOMAIN" | "SUPPORTS_CAPABILITY" | "PRODUCES_ARTIFACT"
    | "SUPPORTS_CONDITION" | "INFORMS_PERSONA" | "REFERENCED_BY_DECISION"
    | "SUPPORTS_CUSTOMER_JOURNEY" | "DEPENDS_ON_SYSTEM" | "CONSUMED_BY_STAKEHOLDER";
  targetType: string;
  targetId: string;
  targetName: string;
  confidence: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceAuthority {
  sourceId: string;
  authorityLevel: AuthorityLevel;
  authoritativeFor: string[];
  conflictingSources: string[];
  rank: number;
  confidence: number;
  approvedBy: string;
  approvedAt: string;
}

export interface SourceQuality {
  sourceId: string;
  overallScore: number;
  ownershipCompleteness: number;
  metadataCompleteness: number;
  authorityConfidence: number;
  freshness: number;
  relationshipCoverage: number;
  approvalCoverage: number;
  sourceHealth: number;
  topIssues: string[];
  recommendedActions: string[];
}

export interface RegistryException {
  id: string;
  sourceId: string;
  sourceName: string;
  exceptionType: string;
  severity: Severity;
  description: string;
  owner: string;
  status: "Open" | "Acknowledged" | "Assigned" | "Snoozed" | "Resolved";
  createdAt: string;
  ageLabel: string;
  dueAt: string;
  recommendedAction: string;
}

export interface DuplicateCandidate {
  id: string;
  primarySourceId: string;
  primarySourceName: string;
  candidateSourceId: string;
  candidateSourceName: string;
  semanticSimilarity: number;
  artifactOverlap: number;
  conditionOverlap: number;
  ownershipConflict: boolean;
  authorityConflict: boolean;
  recommendation: string;
  reviewStatus: "Open" | "Related" | "Duplicate" | "Merged" | "Kept Both" | "Human Review";
}

export interface SourceReview {
  id: string;
  sourceId: string;
  sourceName: string;
  reviewType: string;
  reason: string;
  priority: Severity;
  assignedReviewer: string;
  dueDate: string;
  ageLabel: string;
  status: "Open" | "In Review" | "Information Requested" | "Approved" | "Rejected" | "Extended";
  decision?: string;
  comments: string[];
}

export interface RegistryActivity {
  id: string;
  sourceId: string;
  sourceName: string;
  action: string;
  description: string;
  changedBy: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  auditId: string;
  status: string;
}

export interface RegistryReconciliation {
  id: string;
  scope: string;
  status: "Idle" | "Running" | "Completed";
  progress: number;
  sourcesEvaluated: number;
  relationshipsEvaluated: number;
  duplicatesIdentified: number;
  ownershipConflicts: number;
  authorityConflicts: number;
  permissionIssues: number;
  staleSources: number;
  relationshipsRepaired: number;
  reviewTasksCreated: number;
  startedAt: string;
  completedAt?: string;
}

/* --------------------------------- filters -------------------------------- */

export interface Filters {
  businessUnit: string;
  team: string;
  knowledgeDomain: string;
  sourceCategory: string;
  platform: string;
  sourceOwner: string;
  technicalOwner: string;
  registryStatus: string;
  connectorStatus: string;
  authorityLevel: string;
  approvalState: string;
  accessClassification: string;
  freshness: string;
  qualityBand: string;
  discoveryMode: string;
  environment: string;
  region: string;
  dataResidency: string;
  dateRange: string;
}

export const defaultFilters: Filters = {
  businessUnit: "All", team: "All", knowledgeDomain: "All", sourceCategory: "All", platform: "All",
  sourceOwner: "All", technicalOwner: "All", registryStatus: "All", connectorStatus: "All",
  authorityLevel: "All", approvalState: "All", accessClassification: "All", freshness: "All",
  qualityBand: "All", discoveryMode: "All", environment: "All", region: "All", dataResidency: "All",
  dateRange: "Last 30 days",
};

export const activeFilterCount = (f: Filters) =>
  (Object.keys(f) as (keyof Filters)[]).filter((k) => f[k] !== defaultFilters[k]).length;

/* --------------------------------- records -------------------------------- */

const rel = (artifacts: number, conditions: number, personas: number, dependencies: number, decisions: number, consumers: number) =>
  ({ artifacts, conditions, personas, dependencies, decisions, consumers });

export const sources: SourceRegistryRecord[] = [
  {
    id: "SRC-1001", sourceName: "Engineering Knowledge Base",
    description: "Primary engineering documentation space covering architecture decisions, runbooks, standards, and platform guidance.",
    businessPurpose: "Authoritative reference for engineering standards and operating procedures.",
    category: "Documents", platform: "Confluence Cloud", environment: "Production", region: "North America",
    dataResidency: "United States", businessUnit: "Technology",
    businessOwner: "Engineering Operations", technicalOwner: "Collaboration Platforms",
    dataSteward: "Dana Whitfield", securityOwner: "Security Engineering", complianceOwner: "Enterprise Compliance",
    teamsRepresented: 8, teamNames: ["Platform Engineering", "Developer Platforms", "SRE", "Architecture Office"],
    knowledgeDomains: ["Engineering", "Architecture"], businessCapabilities: ["Software Delivery", "Platform Operations"],
    customerJourneys: ["Developer Onboarding"], productsServices: ["Internal Developer Platform"],
    externalStakeholders: ["Managed Services Partner"],
    authorityLevel: "Primary", approvalState: "Approved", accessClassification: "Internal",
    regulatoryScope: ["SOX"], retentionPolicy: "7 years", legalHold: false,
    allowedUses: ["Condition extraction", "Persona construction", "Decision evidence"],
    restrictedUses: ["External distribution"],
    registryStatus: "Active", lifecycleStage: "Active", freshnessStatus: "Current",
    qualityScore: 95, ownershipConfidence: 96, authorityConfidence: 94, metadataCompleteness: 97, relationshipCoverage: 93,
    connectorId: "CON-CONF-01", connectorStatus: "Healthy", authenticationStatus: "Valid — OAuth token refreshed 2h ago",
    authorizationScope: "Space read, attachment read", discoveryMode: "Incremental", scheduleId: "SCH-15M",
    schedule: "Every 15 minutes", lastSync: "3 min ago", nextRun: "in 12 min",
    artifactCount: 124_532, queueDepth: 4_280, successRate: 98.4, warningCount: 1,
    processingReadiness: "Ready", configurationVersion: "v6.2",
    createdAt: "2023-02-14", discoveredAt: "2023-02-14", updatedAt: "2026-08-06", nextReviewDate: "2026-11-01",
    reviewCadence: "Quarterly",
    relationshipCounts: rel(124_532, 18_420, 14, 6_240, 812, 9),
  },
  {
    id: "SRC-1002", sourceName: "Product Backlog",
    description: "Enterprise product delivery backlog containing epics, stories, defects, and delivery commitments.",
    businessPurpose: "Operational record of product intent, scope, and delivery sequencing.",
    category: "Tickets", platform: "Jira", environment: "Production", region: "North America",
    dataResidency: "United States", businessUnit: "Product",
    businessOwner: "Product Operations", technicalOwner: "Enterprise Applications",
    dataSteward: "Rachel Ortiz", securityOwner: "Security Engineering", complianceOwner: "Enterprise Compliance",
    teamsRepresented: 12, teamNames: ["Product Operations", "Payments Platform", "Growth", "Core Services"],
    knowledgeDomains: ["Product", "Engineering"], businessCapabilities: ["Product Management", "Delivery Planning"],
    customerJourneys: ["Feature Request to Release"], productsServices: ["Customer Portal", "Payments"],
    externalStakeholders: [],
    authorityLevel: "Primary", approvalState: "Approved", accessClassification: "Internal",
    regulatoryScope: [], retentionPolicy: "5 years", legalHold: false,
    allowedUses: ["Condition extraction", "Impact analysis"], restrictedUses: ["Customer-facing summaries"],
    registryStatus: "Active", lifecycleStage: "Active", freshnessStatus: "Current",
    qualityScore: 93, ownershipConfidence: 94, authorityConfidence: 92, metadataCompleteness: 95, relationshipCoverage: 90,
    connectorId: "CON-JIRA-01", connectorStatus: "Healthy", authenticationStatus: "Valid — service account",
    authorizationScope: "Project read, issue read", discoveryMode: "Incremental", scheduleId: "SCH-10M",
    schedule: "Every 10 minutes", lastSync: "6 min ago", nextRun: "in 4 min",
    artifactCount: 88_214, queueDepth: 2_144, successRate: 97.2, warningCount: 0,
    processingReadiness: "Ready", configurationVersion: "v4.8",
    createdAt: "2022-09-01", discoveredAt: "2022-09-01", updatedAt: "2026-08-05", nextReviewDate: "2026-10-15",
    reviewCadence: "Quarterly",
    relationshipCounts: rel(88_214, 21_310, 18, 9_120, 1_044, 7),
  },
  {
    id: "SRC-1003", sourceName: "Support Collaboration",
    description: "Enterprise messaging workspace covering incident response, escalation, and customer support coordination.",
    businessPurpose: "Real-time operational context for support and reliability decisions.",
    category: "Chat", platform: "Slack Enterprise", environment: "Production", region: "Global",
    dataResidency: "United States", businessUnit: "Customer Operations",
    businessOwner: "Customer Support", technicalOwner: "Collaboration Platforms",
    dataSteward: "Miguel Santos", securityOwner: "Security Engineering", complianceOwner: "Privacy Office",
    teamsRepresented: 6, teamNames: ["Customer Support", "SRE", "Incident Command"],
    knowledgeDomains: ["Customer Support", "Operations"], businessCapabilities: ["Incident Management", "Customer Care"],
    customerJourneys: ["Issue Report to Resolution"], productsServices: ["Support Desk"],
    externalStakeholders: ["Outsourced Support Partner"],
    authorityLevel: "Supporting", approvalState: "Approved", accessClassification: "Confidential",
    regulatoryScope: ["GDPR"], retentionPolicy: "2 years", legalHold: false,
    allowedUses: ["Condition extraction", "Persona construction"], restrictedUses: ["Individual performance evaluation"],
    registryStatus: "Active", lifecycleStage: "Active", freshnessStatus: "Current",
    qualityScore: 88, ownershipConfidence: 91, authorityConfidence: 82, metadataCompleteness: 88, relationshipCoverage: 86,
    connectorId: "CON-SLACK-01", connectorStatus: "Healthy", authenticationStatus: "Valid — enterprise grant",
    authorizationScope: "Channel read (approved list)", discoveryMode: "Streaming", scheduleId: "SCH-STREAM",
    schedule: "Continuous", lastSync: "moments ago", nextRun: "continuous",
    artifactCount: 412_998, queueDepth: 14_220, successRate: 94.8, warningCount: 3,
    processingReadiness: "Validation backlog", configurationVersion: "v3.1",
    createdAt: "2023-05-22", discoveredAt: "2023-05-22", updatedAt: "2026-08-06", nextReviewDate: "2026-09-12",
    reviewCadence: "Quarterly",
    relationshipCounts: rel(412_998, 12_840, 11, 7_410, 402, 5),
  },
  {
    id: "SRC-1004", sourceName: "Architecture Reviews",
    description: "Recorded architecture review sessions with transcripts, decisions, and follow-up actions.",
    businessPurpose: "Decision lineage for architecture governance.",
    category: "Meetings", platform: "Zoom Transcripts", environment: "Production", region: "North America",
    dataResidency: "United States", businessUnit: "Technology",
    businessOwner: "Enterprise Architecture", technicalOwner: "Unified Communications",
    dataSteward: "Unassigned", securityOwner: "Security Engineering", complianceOwner: "Enterprise Compliance",
    teamsRepresented: 10, teamNames: ["Architecture Office", "Platform Engineering", "Security Engineering"],
    knowledgeDomains: ["Architecture", "Engineering"], businessCapabilities: ["Architecture Governance"],
    customerJourneys: [], productsServices: ["Internal Developer Platform"], externalStakeholders: [],
    authorityLevel: "Supporting", approvalState: "Approved", accessClassification: "Confidential",
    regulatoryScope: [], retentionPolicy: "3 years", legalHold: false,
    allowedUses: ["Decision evidence"], restrictedUses: ["External distribution", "Persona attribution"],
    registryStatus: "Warning", lifecycleStage: "Active", freshnessStatus: "Aging",
    qualityScore: 76, ownershipConfidence: 71, authorityConfidence: 74, metadataCompleteness: 72, relationshipCoverage: 68,
    connectorId: "CON-ZOOM-01", connectorStatus: "Degraded", authenticationStatus: "Valid — token expires in 6 days",
    authorizationScope: "Recording read", discoveryMode: "Scheduled", scheduleId: "SCH-DAILY",
    schedule: "Daily at 02:00", lastSync: "19 h ago", nextRun: "in 5 h",
    artifactCount: 18_920, queueDepth: 1_942, successRate: 92.7, warningCount: 2,
    processingReadiness: "Coverage below threshold", configurationVersion: "v2.4",
    createdAt: "2023-11-08", discoveredAt: "2023-11-08", updatedAt: "2026-07-28", nextReviewDate: "2026-08-09",
    reviewCadence: "Monthly",
    relationshipCounts: rel(18_920, 4_120, 8, 2_140, 318, 3),
  },
  {
    id: "SRC-1005", sourceName: "Core Services Repository",
    description: "Source control organization containing core platform services, infrastructure code, and deployment pipelines.",
    businessPurpose: "Ground truth for implemented behaviour and technical constraints.",
    category: "Code", platform: "GitHub Enterprise", environment: "Production", region: "North America",
    dataResidency: "United States", businessUnit: "Technology",
    businessOwner: "Platform Engineering", technicalOwner: "Developer Platforms",
    dataSteward: "Owen Reyes", securityOwner: "Application Security", complianceOwner: "Enterprise Compliance",
    teamsRepresented: 9, teamNames: ["Platform Engineering", "Core Services", "SRE"],
    knowledgeDomains: ["Engineering", "Security"], businessCapabilities: ["Software Delivery", "Security Engineering"],
    customerJourneys: [], productsServices: ["Core Services"], externalStakeholders: [],
    authorityLevel: "Primary", approvalState: "Approved", accessClassification: "Restricted",
    regulatoryScope: ["SOX", "PCI DSS"], retentionPolicy: "Indefinite", legalHold: false,
    allowedUses: ["Condition extraction", "Dependency analysis"], restrictedUses: ["Persona attribution", "External distribution"],
    registryStatus: "Active", lifecycleStage: "Active", freshnessStatus: "Current",
    qualityScore: 96, ownershipConfidence: 97, authorityConfidence: 96, metadataCompleteness: 96, relationshipCoverage: 94,
    connectorId: "CON-GH-01", connectorStatus: "Healthy", authenticationStatus: "Valid — GitHub App installation",
    authorizationScope: "Repository read (approved orgs)", discoveryMode: "Event driven", scheduleId: "SCH-EVENT",
    schedule: "On commit", lastSync: "1 min ago", nextRun: "on next event",
    artifactCount: 56_340, queueDepth: 412, successRate: 99.1, warningCount: 0,
    processingReadiness: "Ready", configurationVersion: "v5.0",
    createdAt: "2021-06-30", discoveredAt: "2022-01-11", updatedAt: "2026-08-06", nextReviewDate: "2026-12-01",
    reviewCadence: "Semi-annual",
    relationshipCounts: rel(56_340, 15_240, 12, 11_820, 640, 4),
  },
  {
    id: "SRC-1006", sourceName: "Customer Telemetry",
    description: "Production observability platform holding metrics, traces, service health, and reliability signals.",
    businessPurpose: "Operational truth for reliability, performance, and customer impact.",
    category: "Telemetry", platform: "Datadog", environment: "Production", region: "Global",
    dataResidency: "Multi-region", businessUnit: "Technology",
    businessOwner: "Site Reliability Engineering", technicalOwner: "Observability Engineering",
    dataSteward: "Ines Kaur", securityOwner: "Security Engineering", complianceOwner: "Enterprise Compliance",
    teamsRepresented: 15, teamNames: ["SRE", "Platform Engineering", "Network Operations", "Payments Platform"],
    knowledgeDomains: ["Operations", "Reliability"], businessCapabilities: ["Service Reliability", "Capacity Management"],
    customerJourneys: ["Service Availability"], productsServices: ["Customer Portal", "Payments"],
    externalStakeholders: ["Managed Services Partner"],
    authorityLevel: "Primary", approvalState: "Approved", accessClassification: "Confidential",
    regulatoryScope: [], retentionPolicy: "13 months", legalHold: false,
    allowedUses: ["Condition extraction", "Impact analysis", "Decision evidence"], restrictedUses: [],
    registryStatus: "Active", lifecycleStage: "Active", freshnessStatus: "Real Time",
    qualityScore: 98, ownershipConfidence: 98, authorityConfidence: 97, metadataCompleteness: 98, relationshipCoverage: 96,
    connectorId: "CON-DD-01", connectorStatus: "Healthy", authenticationStatus: "Valid — scoped API key",
    authorizationScope: "Metrics read, events read", discoveryMode: "Streaming", scheduleId: "SCH-STREAM",
    schedule: "Continuous", lastSync: "moments ago", nextRun: "continuous",
    artifactCount: 1_204_844, queueDepth: 18_300, successRate: 99.4, warningCount: 0,
    processingReadiness: "Ready", configurationVersion: "v7.1",
    createdAt: "2022-03-19", discoveredAt: "2022-03-19", updatedAt: "2026-08-06", nextReviewDate: "2026-10-01",
    reviewCadence: "Quarterly",
    relationshipCounts: rel(1_204_844, 9_640, 16, 14_220, 908, 8),
  },
  {
    id: "SRC-1007", sourceName: "Identity Services API",
    description: "API gateway catalog exposing identity, authentication, and entitlement services.",
    businessPurpose: "Contract-level truth for identity behaviour and access constraints.",
    category: "APIs", platform: "Apigee", environment: "Production", region: "North America",
    dataResidency: "United States", businessUnit: "Security",
    businessOwner: "Security Engineering", technicalOwner: "Integration Platforms",
    dataSteward: "Unassigned", securityOwner: "Security Governance", complianceOwner: "Regulatory Affairs",
    teamsRepresented: 11, teamNames: ["Security Engineering", "Integration Platforms", "Identity Services"],
    knowledgeDomains: ["Security", "Identity"], businessCapabilities: ["Identity & Access Management"],
    customerJourneys: ["Customer Sign-in"], productsServices: ["Identity Services"],
    externalStakeholders: ["External Auditor"],
    authorityLevel: "Primary", approvalState: "Restricted Approval", accessClassification: "Restricted",
    regulatoryScope: ["SOX", "GDPR"], retentionPolicy: "7 years", legalHold: true,
    allowedUses: ["Condition extraction (approved consumers only)"],
    restrictedUses: ["Persona construction", "External distribution", "Unrestricted search"],
    registryStatus: "Degraded", lifecycleStage: "Restricted", freshnessStatus: "Aging",
    qualityScore: 71, ownershipConfidence: 68, authorityConfidence: 79, metadataCompleteness: 74, relationshipCoverage: 65,
    connectorId: "CON-APIGEE-01", connectorStatus: "Failing", authenticationStatus: "Token exchange failing (401)",
    authorizationScope: "Proxy read — pending re-consent", discoveryMode: "Scheduled", scheduleId: "SCH-6H",
    schedule: "Every 6 hours", lastSync: "12 h ago", nextRun: "blocked",
    artifactCount: 8_412, queueDepth: 2_117, successRate: 88.9, warningCount: 4,
    processingReadiness: "Blocked", configurationVersion: "v3.9",
    createdAt: "2023-01-05", discoveredAt: "2023-01-05", updatedAt: "2026-08-06", nextReviewDate: "2026-08-06",
    reviewCadence: "Monthly",
    relationshipCounts: rel(8_412, 3_120, 6, 4_940, 288, 6),
  },
  {
    id: "SRC-1008", sourceName: "Legacy Product Requirements Archive",
    description: "Historical requirements library retained from the legacy document management platform.",
    businessPurpose: "Historical record of prior product commitments and decision lineage.",
    category: "Documents", platform: "SharePoint Server", environment: "Legacy", region: "North America",
    dataResidency: "United States", businessUnit: "Product",
    businessOwner: "Unassigned", technicalOwner: "Legacy Applications",
    dataSteward: "Unassigned", securityOwner: "Security Engineering", complianceOwner: "Enterprise Compliance",
    teamsRepresented: 3, teamNames: ["Product Operations", "Legacy Applications"],
    knowledgeDomains: ["Product"], businessCapabilities: ["Product Management"],
    customerJourneys: [], productsServices: ["Legacy Portal"], externalStakeholders: [],
    authorityLevel: "Historical", approvalState: "Review Required", accessClassification: "Internal",
    regulatoryScope: [], retentionPolicy: "10 years", legalHold: false,
    allowedUses: ["Historical reference"], restrictedUses: ["Current condition extraction", "Persona construction"],
    registryStatus: "Action Required", lifecycleStage: "Registered", freshnessStatus: "Stale",
    qualityScore: 54, ownershipConfidence: 22, authorityConfidence: 48, metadataCompleteness: 58, relationshipCoverage: 41,
    connectorId: "CON-SP-01", connectorStatus: "Degraded", authenticationStatus: "Valid — NTLM service account",
    authorizationScope: "Site read", discoveryMode: "Full scan", scheduleId: "SCH-WEEKLY",
    schedule: "Weekly, Sunday 03:00", lastSync: "22 days ago", nextRun: "in 4 days",
    artifactCount: 31_442, queueDepth: 0, successRate: 81.3, warningCount: 6,
    processingReadiness: "Not ready", configurationVersion: "v1.2",
    createdAt: "2019-04-02", discoveredAt: "2022-08-17", updatedAt: "2026-07-14", nextReviewDate: "2026-08-06",
    reviewCadence: "Monthly",
    relationshipCounts: rel(31_442, 2_240, 2, 810, 96, 1),
  },
  {
    id: "SRC-1009", sourceName: "Payments Architecture Notes",
    description: "Working architecture library for payments modernization, integration patterns, and settlement design.",
    businessPurpose: "Design intent and constraint capture for the payments platform.",
    category: "Documents", platform: "Google Drive", environment: "Production", region: "North America",
    dataResidency: "United States", businessUnit: "Payments",
    businessOwner: "Payments Platform", technicalOwner: "Workspace Engineering",
    dataSteward: "Laura Chen", securityOwner: "Security Engineering", complianceOwner: "Regulatory Affairs",
    teamsRepresented: 4, teamNames: ["Payments Platform", "Architecture Office"],
    knowledgeDomains: ["Payments", "Architecture"], businessCapabilities: ["Payment Processing"],
    customerJourneys: ["Checkout"], productsServices: ["Payments"], externalStakeholders: ["Acquiring Bank"],
    authorityLevel: "Supporting", approvalState: "Pending Review", accessClassification: "Confidential",
    regulatoryScope: ["PCI DSS"], retentionPolicy: "5 years", legalHold: false,
    allowedUses: ["Condition extraction (post approval)"], restrictedUses: ["External distribution"],
    registryStatus: "Pending", lifecycleStage: "Validated", freshnessStatus: "Current",
    qualityScore: 84, ownershipConfidence: 88, authorityConfidence: 72, metadataCompleteness: 86, relationshipCoverage: 74,
    connectorId: "CON-GDRIVE-01", connectorStatus: "Healthy", authenticationStatus: "Valid — domain-wide delegation",
    authorizationScope: "Shared drive read", discoveryMode: "Incremental", scheduleId: "SCH-HOURLY",
    schedule: "Hourly", lastSync: "34 min ago", nextRun: "in 26 min",
    artifactCount: 6_348, queueDepth: 188, successRate: 96.2, warningCount: 1,
    processingReadiness: "Awaiting approval", configurationVersion: "v1.0",
    createdAt: "2026-07-28", discoveredAt: "2026-07-28", updatedAt: "2026-08-06", nextReviewDate: "2026-08-07",
    reviewCadence: "Quarterly",
    relationshipCounts: rel(6_348, 1_420, 3, 640, 42, 2),
  },
  {
    id: "SRC-1010", sourceName: "Duplicate Retry Policy Repository",
    description: "Secondary space containing retry, backoff, and idempotency policies overlapping an approved reliability space.",
    businessPurpose: "Reliability policy capture — authority not yet validated.",
    category: "Documents", platform: "Confluence Cloud", environment: "Production", region: "North America",
    dataResidency: "United States", businessUnit: "Technology",
    businessOwner: "Reliability Engineering", technicalOwner: "Collaboration Platforms",
    dataSteward: "Unassigned", securityOwner: "Security Engineering", complianceOwner: "Enterprise Compliance",
    teamsRepresented: 2, teamNames: ["Reliability Engineering"],
    knowledgeDomains: ["Reliability"], businessCapabilities: ["Service Reliability"],
    customerJourneys: [], productsServices: [], externalStakeholders: [],
    authorityLevel: "Unconfirmed", approvalState: "Review Required", accessClassification: "Internal",
    regulatoryScope: [], retentionPolicy: "3 years", legalHold: false,
    allowedUses: [], restrictedUses: ["Condition extraction until authority confirmed"],
    registryStatus: "Possible Duplicate", lifecycleStage: "Registered", freshnessStatus: "Current",
    qualityScore: 67, ownershipConfidence: 61, authorityConfidence: 38, metadataCompleteness: 70, relationshipCoverage: 44,
    connectorId: "CON-CONF-02", connectorStatus: "Healthy", authenticationStatus: "Valid — OAuth token",
    authorizationScope: "Space read", discoveryMode: "Incremental", scheduleId: "SCH-HOURLY",
    schedule: "Hourly", lastSync: "12 min ago", nextRun: "in 48 min",
    artifactCount: 1_284, queueDepth: 62, successRate: 95.4, warningCount: 2,
    processingReadiness: "Held for review", configurationVersion: "v1.1",
    createdAt: "2026-05-19", discoveredAt: "2026-05-19", updatedAt: "2026-08-06", nextReviewDate: "2026-08-06",
    reviewCadence: "Monthly",
    relationshipCounts: rel(1_284, 210, 1, 96, 12, 1),
  },
];

export const sourceById = (id: string) => sources.find((s) => s.id === id);

/* ------------------------------ filter options ---------------------------- */

const uniq = (values: string[]) => Array.from(new Set(values)).sort();

export const filterOptions: Record<keyof Filters, string[]> = {
  businessUnit: ["All", ...uniq(sources.map((s) => s.businessUnit))],
  team: ["All", ...uniq(sources.flatMap((s) => s.teamNames))],
  knowledgeDomain: ["All", ...uniq(sources.flatMap((s) => s.knowledgeDomains))],
  sourceCategory: ["All", ...uniq(sources.map((s) => s.category))],
  platform: ["All", ...uniq(sources.map((s) => s.platform))],
  sourceOwner: ["All", ...uniq(sources.map((s) => s.businessOwner))],
  technicalOwner: ["All", ...uniq(sources.map((s) => s.technicalOwner))],
  registryStatus: ["All", ...uniq(sources.map((s) => s.registryStatus))],
  connectorStatus: ["All", ...uniq(sources.map((s) => s.connectorStatus))],
  authorityLevel: ["All", "Primary", "Supporting", "Historical", "Reference", "Unconfirmed"],
  approvalState: ["All", "Approved", "Pending Review", "Restricted Approval", "Review Required", "Deprecated"],
  accessClassification: ["All", "Public", "Internal", "Confidential", "Restricted", "Highly Restricted"],
  freshness: ["All", "Real Time", "Current", "Aging", "Stale"],
  qualityBand: ["All", "90 and above", "75 to 89", "60 to 74", "Below 60"],
  discoveryMode: ["All", ...uniq(sources.map((s) => s.discoveryMode))],
  environment: ["All", ...uniq(sources.map((s) => s.environment))],
  region: ["All", ...uniq(sources.map((s) => s.region))],
  dataResidency: ["All", ...uniq(sources.map((s) => s.dataResidency))],
  dateRange: ["Last 24 hours", "Last 7 days", "Last 30 days", "Last 90 days", "Custom Range"],
};

const qualityBand = (score: number) =>
  score >= 90 ? "90 and above" : score >= 75 ? "75 to 89" : score >= 60 ? "60 to 74" : "Below 60";

export function matchesFilters(s: SourceRegistryRecord, f: Filters) {
  const checks: [string, string][] = [
    [f.businessUnit, s.businessUnit], [f.sourceCategory, s.category], [f.platform, s.platform],
    [f.sourceOwner, s.businessOwner], [f.technicalOwner, s.technicalOwner],
    [f.registryStatus, s.registryStatus], [f.connectorStatus, s.connectorStatus],
    [f.authorityLevel, s.authorityLevel], [f.approvalState, s.approvalState],
    [f.accessClassification, s.accessClassification], [f.freshness, s.freshnessStatus],
    [f.qualityBand, qualityBand(s.qualityScore)], [f.discoveryMode, s.discoveryMode],
    [f.environment, s.environment], [f.region, s.region], [f.dataResidency, s.dataResidency],
  ];
  if (checks.some(([filter, value]) => filter !== "All" && filter !== value)) return false;
  if (f.team !== "All" && !s.teamNames.includes(f.team)) return false;
  if (f.knowledgeDomain !== "All" && !s.knowledgeDomains.includes(f.knowledgeDomain)) return false;
  return true;
}

/* ---------------------------------- quality -------------------------------- */

export const registryQuality = {
  overall: 92,
  dimensions: [
    { id: "ownership", label: "Ownership Completeness", score: 94, target: 95, trend: 2, affected: 4, filter: { key: "registryStatus" as const, value: "Action Required" } },
    { id: "metadata", label: "Metadata Completeness", score: 93, target: 95, trend: 1, affected: 6, filter: { key: "qualityBand" as const, value: "60 to 74" } },
    { id: "authority", label: "Authority Confidence", score: 89, target: 92, trend: -1, affected: 9, filter: { key: "authorityLevel" as const, value: "Unconfirmed" } },
    { id: "freshness", label: "Freshness", score: 88, target: 92, trend: -2, affected: 11, filter: { key: "freshness" as const, value: "Stale" } },
    { id: "relationship", label: "Relationship Coverage", score: 91, target: 93, trend: 3, affected: 7, filter: { key: "qualityBand" as const, value: "75 to 89" } },
    { id: "approval", label: "Approval Coverage", score: 95, target: 96, trend: 1, affected: 7, filter: { key: "approvalState" as const, value: "Pending Review" } },
    { id: "health", label: "Source Health", score: 92, target: 95, trend: 0, affected: 5, filter: { key: "registryStatus" as const, value: "Degraded" } },
  ],
};

export const sourceQualityDetail: Record<string, SourceQuality> = Object.fromEntries(
  sources.map((s) => [
    s.id,
    {
      sourceId: s.id,
      overallScore: s.qualityScore,
      ownershipCompleteness: s.ownershipConfidence,
      metadataCompleteness: s.metadataCompleteness,
      authorityConfidence: s.authorityConfidence,
      freshness: s.freshnessStatus === "Stale" ? 38 : s.freshnessStatus === "Aging" ? 68 : 96,
      relationshipCoverage: s.relationshipCoverage,
      approvalCoverage: s.approvalState === "Approved" ? 100 : s.approvalState === "Restricted Approval" ? 70 : 40,
      sourceHealth: s.connectorStatus === "Healthy" ? 96 : s.connectorStatus === "Degraded" ? 68 : 42,
      topIssues:
        s.qualityScore >= 90
          ? ["No material quality issues detected"]
          : [
              s.ownershipConfidence < 70 ? "Business ownership unresolved" : "Metadata gaps on recent artifacts",
              s.freshnessStatus === "Stale" ? "Content has not changed in 90+ days" : "Freshness trending below target",
              s.authorityConfidence < 60 ? "Authority level not validated" : "Relationship coverage below target",
            ],
      recommendedActions:
        s.qualityScore >= 90
          ? ["Maintain quarterly review cadence"]
          : ["Assign a business owner", "Run reconciliation for this source", "Schedule an authority review"],
    } satisfies SourceQuality,
  ]),
);

/* -------------------------------- distribution ----------------------------- */

export const categoryDistribution = [
  { category: "Documents", sources: 42, artifacts: 486_210, avgQuality: 86, approvedPct: 88, freshPct: 79, color: "#2563eb" },
  { category: "Tickets", sources: 21, artifacts: 188_402, avgQuality: 91, approvedPct: 95, freshPct: 93, color: "#0d9488" },
  { category: "Chat", sources: 18, artifacts: 612_884, avgQuality: 84, approvedPct: 89, freshPct: 96, color: "#7c3aed" },
  { category: "Meetings", sources: 16, artifacts: 92_140, avgQuality: 78, approvedPct: 81, freshPct: 62, color: "#ea580c" },
  { category: "Code", sources: 14, artifacts: 142_880, avgQuality: 95, approvedPct: 97, freshPct: 98, color: "#0891b2" },
  { category: "APIs", sources: 17, artifacts: 44_210, avgQuality: 82, approvedPct: 76, freshPct: 71, color: "#dc2626" },
  { category: "Telemetry", sources: 12, artifacts: 2_884_020, avgQuality: 96, approvedPct: 98, freshPct: 99, color: "#65a30d" },
  { category: "Other", sources: 7, artifacts: 18_440, avgQuality: 74, approvedPct: 68, freshPct: 58, color: "#64748b" },
];

/* ---------------------------- authority matrix ----------------------------- */

export const authorityDefinitions: { level: AuthorityLevel; definition: string }[] = [
  { level: "Primary", definition: "Authoritative source for a business condition or operating domain" },
  { level: "Supporting", definition: "Useful evidence that reinforces another authoritative source" },
  { level: "Historical", definition: "Retained for prior state and decision lineage" },
  { level: "Reference", definition: "Informational but not decision authoritative" },
  { level: "Unconfirmed", definition: "Authority has not been validated" },
];

export const approvalColumns: ApprovalState[] = ["Approved", "Pending Review", "Restricted Approval", "Review Required", "Deprecated"];

export const authorityMatrix: Record<AuthorityLevel, Record<ApprovalState, number>> = {
  Primary: { Approved: 58, "Pending Review": 2, "Restricted Approval": 6, "Review Required": 1, Deprecated: 0 },
  Supporting: { Approved: 41, "Pending Review": 3, "Restricted Approval": 2, "Review Required": 2, Deprecated: 1 },
  Historical: { Approved: 12, "Pending Review": 0, "Restricted Approval": 0, "Review Required": 3, Deprecated: 4 },
  Reference: { Approved: 15, "Pending Review": 1, "Restricted Approval": 1, "Review Required": 1, Deprecated: 0 },
  Unconfirmed: { Approved: 2, "Pending Review": 1, "Restricted Approval": 0, "Review Required": 4, Deprecated: 0 },
};

/* -------------------------------- exceptions ------------------------------- */

export const exceptions: RegistryException[] = [
  {
    id: "EXC-2001", sourceId: "SRC-1008", sourceName: "Legacy Product Requirements Archive",
    exceptionType: "Missing Business Owner", severity: "High",
    description: "No business owner assigned since the legacy platform migration.",
    owner: "Product Operations", status: "Open", createdAt: "2026-07-14", ageLabel: "23 days",
    dueAt: "Today", recommendedAction: "Assign a business owner and confirm authority level",
  },
  {
    id: "EXC-2002", sourceId: "SRC-1008", sourceName: "Legacy Product Requirements Archive",
    exceptionType: "Stale Sources", severity: "Medium",
    description: "No new or modified artifacts detected in 90 days.",
    owner: "Legacy Applications", status: "Open", createdAt: "2026-07-02", ageLabel: "35 days",
    dueAt: "In 2 days", recommendedAction: "Confirm retirement or restore synchronization",
  },
  {
    id: "EXC-2003", sourceId: "SRC-1010", sourceName: "Duplicate Retry Policy Repository",
    exceptionType: "Possible Duplicates", severity: "High",
    description: "86 percent semantic similarity with the approved Retry Policy Repository v1.",
    owner: "Reliability Engineering", status: "Open", createdAt: "2026-08-05", ageLabel: "1 day",
    dueAt: "Today", recommendedAction: "Open duplicate comparison and merge or mark related",
  },
  {
    id: "EXC-2004", sourceId: "SRC-1007", sourceName: "Identity Services API",
    exceptionType: "Degraded Connector", severity: "Critical",
    description: "Token exchange failing with 401 responses for 12 hours.",
    owner: "Integration Platforms", status: "Assigned", createdAt: "2026-08-06", ageLabel: "12 hours",
    dueAt: "In 2 hours", recommendedAction: "Re-consent the service account and rerun discovery",
  },
  {
    id: "EXC-2005", sourceId: "SRC-1007", sourceName: "Identity Services API",
    exceptionType: "Permission Conflict", severity: "High",
    description: "Restricted classification conflicts with two approved downstream consumers.",
    owner: "Security Governance", status: "Open", createdAt: "2026-08-06", ageLabel: "9 hours",
    dueAt: "Today", recommendedAction: "Confirm approved consumer list and update access policy",
  },
  {
    id: "EXC-2006", sourceId: "SRC-1004", sourceName: "Architecture Reviews",
    exceptionType: "Stale Sources", severity: "Medium",
    description: "Meeting coverage below the configured freshness threshold.",
    owner: "Architecture Office", status: "Acknowledged", createdAt: "2026-07-28", ageLabel: "9 days",
    dueAt: "In 3 days", recommendedAction: "Extend transcript capture to all review sessions",
  },
  {
    id: "EXC-2007", sourceId: "SRC-1010", sourceName: "Duplicate Retry Policy Repository",
    exceptionType: "Authority Conflict", severity: "High",
    description: "Unconfirmed authority overlaps a Primary source for the same conditions.",
    owner: "Architecture Office", status: "Open", createdAt: "2026-08-04", ageLabel: "2 days",
    dueAt: "Today", recommendedAction: "Rank sources and confirm the authoritative record",
  },
  {
    id: "EXC-2008", sourceId: "SRC-1004", sourceName: "Architecture Reviews",
    exceptionType: "Incomplete Team Mapping", severity: "Low",
    description: "4 participating teams are not mapped to the source record.",
    owner: "Architecture Office", status: "Open", createdAt: "2026-07-30", ageLabel: "7 days",
    dueAt: "In 5 days", recommendedAction: "Map participating teams from meeting attendance",
  },
  {
    id: "EXC-2009", sourceId: "SRC-1009", sourceName: "Payments Architecture Notes",
    exceptionType: "Missing Classification", severity: "Medium",
    description: "Regulatory scope requires confirmation before approval.",
    owner: "Regulatory Affairs", status: "Open", createdAt: "2026-08-03", ageLabel: "3 days",
    dueAt: "Tomorrow", recommendedAction: "Confirm PCI DSS scope and retention policy",
  },
  {
    id: "EXC-2010", sourceId: "SRC-1003", sourceName: "Support Collaboration",
    exceptionType: "Missing Business Owner", severity: "Low",
    description: "Backup owner is not assigned for the escalation channel set.",
    owner: "Customer Support", status: "Snoozed", createdAt: "2026-07-21", ageLabel: "16 days",
    dueAt: "In 8 days", recommendedAction: "Assign a backup business owner",
  },
];

export const exceptionSummary = [
  { type: "Stale Sources", count: 3 },
  { type: "Missing Business Owner", count: 2 },
  { type: "Possible Duplicates", count: 2 },
  { type: "Degraded Connector", count: 1 },
  { type: "Permission Conflict", count: 1 },
  { type: "Missing Classification", count: 1 },
  { type: "Authority Conflict", count: 2 },
  { type: "Incomplete Team Mapping", count: 4 },
];

/* -------------------------------- duplicates ------------------------------- */

export const duplicateCandidates: DuplicateCandidate[] = [
  {
    id: "DUP-3001",
    primarySourceId: "SRC-1011", primarySourceName: "Retry Policy Repository v1",
    candidateSourceId: "SRC-1010", candidateSourceName: "Duplicate Retry Policy Repository",
    semanticSimilarity: 86, artifactOverlap: 71, conditionOverlap: 82,
    ownershipConflict: true, authorityConflict: true,
    recommendation: "Merge into Retry Policy Repository v1 and retain aliases",
    reviewStatus: "Open",
  },
];

export const duplicateComparison = {
  left: {
    id: "SRC-1011", sourceName: "Retry Policy Repository v1", platform: "Confluence Cloud",
    owner: "Reliability Engineering", teams: 7, domains: "Reliability, Engineering",
    authority: "Primary", freshness: "Current", quality: 91, conditions: 1_842, personas: 9, decisions: 214,
    artifacts: 4_820, approvalState: "Approved",
  },
  right: {
    id: "SRC-1010", sourceName: "Duplicate Retry Policy Repository", platform: "Confluence Cloud",
    owner: "Reliability Engineering", teams: 2, domains: "Reliability",
    authority: "Unconfirmed", freshness: "Current", quality: 67, conditions: 210, personas: 1, decisions: 12,
    artifacts: 1_284, approvalState: "Review Required",
  },
};

/* ------------------------------- relationships ----------------------------- */

export const relationshipSummary = {
  teams: 48, domains: 22, conditions: 87_442, personas: 72,
  dependencies: 52_632, decisions: 4_812, consumers: 38,
};

export const relationshipNodes = [
  { id: "sources", label: "Sources", value: 147, route: null },
  { id: "teams", label: "Teams", value: 48, route: null },
  { id: "artifacts", label: "Artifacts", value: 2_154_334, route: "/enterprise-cognitive-fabric/discovery/pipelines" },
  { id: "conditions", label: "Conditions", value: 87_442, route: "/enterprise-cognitive-fabric/business-condition-extraction" },
  { id: "personas", label: "Personas", value: 72, route: "/enterprise-cognitive-fabric/team-persona-construction" },
  { id: "decisions", label: "Decisions", value: 4_812, route: "/enterprise-cognitive-fabric/decision-intelligence" },
  { id: "outcomes", label: "Outcomes", value: 1_284, route: "/enterprise-cognitive-fabric/organizational-learning" },
];

export const lineageStages = [
  "Source system", "Connector", "Artifact ingestion", "Normalization", "Evidence vault",
  "Conditions registry", "Context graph", "Personas", "Impact evaluations", "Decisions", "Actual outcomes",
];

export function relationshipsForSource(s: SourceRegistryRecord): SourceRelationship[] {
  const mk = (
    type: SourceRelationship["relationshipType"], targetType: string, name: string, confidence: number, i: number,
  ): SourceRelationship => ({
    id: `${s.id}-REL-${i}`, sourceId: s.id, relationshipType: type, targetType,
    targetId: `${targetType.slice(0, 3).toUpperCase()}-${1000 + i}`, targetName: name,
    confidence, status: confidence >= 80 ? "Confirmed" : "Inferred",
    createdAt: s.createdAt, updatedAt: s.updatedAt,
  });
  let i = 0;
  return [
    ...s.teamNames.map((t) => mk("REPRESENTS_TEAM", "Team", t, 92, i++)),
    ...s.knowledgeDomains.map((d) => mk("CONTAINS_DOMAIN", "Domain", d, 88, i++)),
    ...s.businessCapabilities.map((c) => mk("SUPPORTS_CAPABILITY", "Capability", c, 84, i++)),
    ...s.customerJourneys.map((j) => mk("SUPPORTS_CUSTOMER_JOURNEY", "Journey", j, 76, i++)),
    ...s.productsServices.map((p) => mk("DEPENDS_ON_SYSTEM", "System", p, 81, i++)),
    ...s.externalStakeholders.map((e) => mk("CONSUMED_BY_STAKEHOLDER", "Stakeholder", e, 68, i++)),
    mk("PRODUCES_ARTIFACT", "Artifact set", `${s.category} artifacts`, 95, i++),
    mk("SUPPORTS_CONDITION", "Conditions", `${s.relationshipCounts.conditions.toLocaleString("en-US")} business conditions`, 87, i++),
    mk("INFORMS_PERSONA", "Personas", `${s.relationshipCounts.personas} team personas`, 79, i++),
    mk("REFERENCED_BY_DECISION", "Decisions", `${s.relationshipCounts.decisions} decisions`, 83, i++),
  ];
}

export const sourceAuthorityDetail: Record<string, SourceAuthority> = Object.fromEntries(
  sources.map((s) => [
    s.id,
    {
      sourceId: s.id, authorityLevel: s.authorityLevel,
      authoritativeFor: s.knowledgeDomains,
      conflictingSources: s.id === "SRC-1010" ? ["SRC-1011"] : [],
      rank: s.authorityLevel === "Primary" ? 1 : s.authorityLevel === "Supporting" ? 2 : 3,
      confidence: s.authorityConfidence,
      approvedBy: s.approvalState === "Approved" ? "Architecture Office" : "Pending",
      approvedAt: s.approvalState === "Approved" ? s.updatedAt : "—",
    } satisfies SourceAuthority,
  ]),
);

/* ------------------------------- lifecycle --------------------------------- */

export const lifecycleCounts: { stage: LifecycleStage; count: number; delta: string }[] = [
  { stage: "Discovered", count: 6, delta: "+2 today" },
  { stage: "Registered", count: 147, delta: "+8 this month" },
  { stage: "Validated", count: 140, delta: "+6 this month" },
  { stage: "Approved", count: 128, delta: "+5 this month" },
  { stage: "Active", count: 132, delta: "+4 this month" },
  { stage: "Restricted", count: 12, delta: "+1 this week" },
  { stage: "Paused", count: 2, delta: "no change" },
  { stage: "Deprecated", count: 5, delta: "+1 this week" },
];

export const lifecycleTransitions = [
  "Payments Architecture Notes moved Validated to Pending Approval",
  "Identity Services API moved Active to Restricted",
  "Legacy Support Wiki moved Active to Deprecated",
  "Customer Advisory Notes moved Discovered to Registered",
];

/* ------------------------------- review queue ------------------------------ */

export const reviews: SourceReview[] = [
  {
    id: "REV-4001", sourceId: "SRC-1009", sourceName: "Payments Architecture Notes",
    reviewType: "Initial Approval", reason: "New source registration", priority: "Medium",
    assignedReviewer: "Jane Smith", dueDate: "Tomorrow", ageLabel: "1 day", status: "Open", comments: [],
  },
  {
    id: "REV-4002", sourceId: "SRC-1008", sourceName: "Legacy Product Requirements Archive",
    reviewType: "Authority Review", reason: "Conflicting and stale requirements", priority: "High",
    assignedReviewer: "Marcus Lee", dueDate: "Today", ageLabel: "23 days", status: "In Review", comments: [],
  },
  {
    id: "REV-4003", sourceId: "SRC-1010", sourceName: "Duplicate Retry Policy Repository",
    reviewType: "Duplicate Review", reason: "86 percent similarity with approved policy", priority: "High",
    assignedReviewer: "Priya Patel", dueDate: "Today", ageLabel: "1 day", status: "Open", comments: [],
  },
  {
    id: "REV-4004", sourceId: "SRC-1007", sourceName: "Identity Services API",
    reviewType: "Access Review", reason: "Restricted API and degraded token", priority: "Critical",
    assignedReviewer: "Security Governance", dueDate: "2 hours", ageLabel: "12 hours", status: "Open", comments: [],
  },
  {
    id: "REV-4005", sourceId: "SRC-1004", sourceName: "Architecture Reviews",
    reviewType: "Freshness Review", reason: "Meeting coverage below threshold", priority: "Medium",
    assignedReviewer: "Architecture Office", dueDate: "3 days", ageLabel: "9 days", status: "Open", comments: [],
  },
];

/* --------------------------------- activity -------------------------------- */

export const activities: RegistryActivity[] = [
  { id: "ACT-01", sourceId: "SRC-1012", sourceName: "Customer Advisory Notes", action: "New source registered", description: "Registered from Enterprise Source Discovery", changedBy: "Alex Valencia", timestamp: "10:18 AM", auditId: "AUD-88231", status: "Completed" },
  { id: "ACT-02", sourceId: "SRC-1009", sourceName: "Payments Architecture Notes", action: "Source approved", description: "Initial approval granted", changedBy: "Jane Smith", timestamp: "10:12 AM", previousValue: "Pending Review", newValue: "Approved", auditId: "AUD-88228", status: "Completed" },
  { id: "ACT-03", sourceId: "SRC-1008", sourceName: "Legacy Product Requirements Archive", action: "Business owner changed", description: "Owner reassigned pending confirmation", changedBy: "Marcus Lee", timestamp: "10:04 AM", previousValue: "Unassigned", newValue: "Product Operations", auditId: "AUD-88221", status: "Pending" },
  { id: "ACT-04", sourceId: "SRC-1010", sourceName: "Retry Policy Repository", action: "Possible duplicate detected", description: "86 percent semantic similarity", changedBy: "Reconciliation Service", timestamp: "9:56 AM", auditId: "AUD-88214", status: "Open" },
  { id: "ACT-05", sourceId: "SRC-1007", sourceName: "Identity Services API", action: "Access classification changed to Restricted", description: "Applied by security governance", changedBy: "Security Governance", timestamp: "9:48 AM", previousValue: "Confidential", newValue: "Restricted", auditId: "AUD-88209", status: "Completed" },
  { id: "ACT-06", sourceId: "—", sourceName: "Registry", action: "Registry reconciliation completed", description: "147 sources evaluated", changedBy: "Reconciliation Service", timestamp: "9:35 AM", auditId: "AUD-88201", status: "Completed" },
  { id: "ACT-07", sourceId: "SRC-1013", sourceName: "Legacy Support Wiki", action: "Source deprecated", description: "Replaced by Support Knowledge Base", changedBy: "Customer Support", timestamp: "9:21 AM", previousValue: "Active", newValue: "Deprecated", auditId: "AUD-88194", status: "Completed" },
];

/* ------------------------------ notifications ------------------------------ */

export const notificationSeed = [
  { id: "N1", type: "Source approval requested", title: "Payments Architecture Notes awaiting initial approval", time: "12 min ago", read: false },
  { id: "N2", type: "Connector degraded", title: "Identity Services API token exchange failing", time: "34 min ago", read: false },
  { id: "N3", type: "Duplicate identified", title: "Duplicate Retry Policy Repository matches an approved source", time: "1 h ago", read: false },
  { id: "N4", type: "Owner missing", title: "Legacy Product Requirements Archive has no business owner", time: "2 h ago", read: true },
  { id: "N5", type: "Source became stale", title: "Architecture Reviews coverage below freshness threshold", time: "4 h ago", read: true },
  { id: "N6", type: "Authority conflict detected", title: "Unconfirmed authority overlaps a Primary reliability source", time: "5 h ago", read: true },
  { id: "N7", type: "Reconciliation completed", title: "147 sources evaluated, 9 exceptions raised", time: "Today 9:35 AM", read: true },
];

/* -------------------------------- KPI trends ------------------------------- */

export const kpiTrends = {
  total: [132, 134, 136, 139, 141, 143, 145, 147],
  approved: [112, 115, 118, 120, 123, 125, 127, 128],
  pending: [4, 5, 6, 5, 7, 8, 7, 7],
  restricted: [9, 9, 10, 10, 11, 11, 12, 12],
  quality: [86, 87, 88, 89, 90, 91, 92, 92],
  action: [14, 13, 12, 12, 11, 10, 9, 9],
};

/* ------------------------------ demo scenarios ----------------------------- */

export type DemoScenario =
  | "healthy" | "pending-approval" | "duplicates" | "missing-ownership" | "authority-conflict"
  | "restricted" | "connector-degradation" | "stale" | "permission-drift" | "reconciling" | "reset";

export interface ScenarioSnapshot {
  registryState: RegistryState;
  banner?: string;
  totalSources: number;
  approvedSources: number;
  pendingReview: number;
  restrictedSources: number;
  qualityScore: number;
  actionRequired: number;
  focusPanel?: string;
  highlightSourceIds: string[];
  extraException?: RegistryException;
  extraActivity?: RegistryActivity;
  extraNotification?: { id: string; type: string; title: string; time: string; read: boolean };
}

export const scenarioSnapshots: Record<DemoScenario, ScenarioSnapshot> = {
  healthy: {
    registryState: "Operational", totalSources: 147, approvedSources: 128, pendingReview: 7,
    restrictedSources: 12, qualityScore: 92, actionRequired: 9, highlightSourceIds: [],
  },
  reset: {
    registryState: "Operational", totalSources: 147, approvedSources: 128, pendingReview: 7,
    restrictedSources: 12, qualityScore: 92, actionRequired: 9, highlightSourceIds: [],
  },
  "pending-approval": {
    registryState: "Review Required",
    banner: "Payments Architecture Notes is awaiting initial approval. Review is due tomorrow.",
    totalSources: 148, approvedSources: 128, pendingReview: 9, restrictedSources: 12,
    qualityScore: 91, actionRequired: 10, focusPanel: "panel-reviews", highlightSourceIds: ["SRC-1009"],
  },
  duplicates: {
    registryState: "Review Required",
    banner: "Two possible duplicate sources detected with 86 percent semantic similarity.",
    totalSources: 147, approvedSources: 127, pendingReview: 8, restrictedSources: 12,
    qualityScore: 89, actionRequired: 11, focusPanel: "panel-exceptions", highlightSourceIds: ["SRC-1010"],
  },
  "missing-ownership": {
    registryState: "Review Required",
    banner: "2 registered sources have no business owner. Downstream persona attribution is blocked.",
    totalSources: 147, approvedSources: 126, pendingReview: 7, restrictedSources: 12,
    qualityScore: 87, actionRequired: 12, focusPanel: "panel-exceptions", highlightSourceIds: ["SRC-1008"],
  },
  "authority-conflict": {
    registryState: "Review Required",
    banner: "Authority conflict detected between a Primary source and an Unconfirmed source for reliability conditions.",
    totalSources: 147, approvedSources: 127, pendingReview: 7, restrictedSources: 12,
    qualityScore: 88, actionRequired: 11, focusPanel: "panel-authority", highlightSourceIds: ["SRC-1010"],
  },
  restricted: {
    registryState: "Operational",
    banner: "Identity Services API is Restricted. Only approved consumers may use its evidence.",
    totalSources: 147, approvedSources: 128, pendingReview: 7, restrictedSources: 14,
    qualityScore: 91, actionRequired: 9, focusPanel: "panel-registry", highlightSourceIds: ["SRC-1007"],
  },
  "connector-degradation": {
    registryState: "Degraded",
    banner: "Apigee connector is failing token exchange. Identity Services API discovery is blocked.",
    totalSources: 147, approvedSources: 128, pendingReview: 7, restrictedSources: 12,
    qualityScore: 86, actionRequired: 12, focusPanel: "panel-exceptions", highlightSourceIds: ["SRC-1007"],
  },
  stale: {
    registryState: "Review Required",
    banner: "3 sources have exceeded their freshness threshold and may no longer reflect current operations.",
    totalSources: 147, approvedSources: 128, pendingReview: 7, restrictedSources: 12,
    qualityScore: 85, actionRequired: 13, focusPanel: "panel-quality", highlightSourceIds: ["SRC-1008", "SRC-1004"],
  },
  "permission-drift": {
    registryState: "Degraded",
    banner: "Permission drift detected. Source access no longer matches the approved authorization scope.",
    totalSources: 147, approvedSources: 128, pendingReview: 7, restrictedSources: 13,
    qualityScore: 87, actionRequired: 12, focusPanel: "panel-exceptions", highlightSourceIds: ["SRC-1007"],
  },
  reconciling: {
    registryState: "Reconciling",
    banner: "Registry reconciliation is in progress. Counts will settle when reconciliation completes.",
    totalSources: 147, approvedSources: 128, pendingReview: 7, restrictedSources: 12,
    qualityScore: 92, actionRequired: 9, focusPanel: "panel-quality", highlightSourceIds: [],
  },
};

export const demoScenarios: { id: DemoScenario; label: string }[] = [
  { id: "healthy", label: "Healthy Registry" },
  { id: "pending-approval", label: "New Source Pending Approval" },
  { id: "duplicates", label: "Duplicate Sources Detected" },
  { id: "missing-ownership", label: "Missing Ownership" },
  { id: "authority-conflict", label: "Authority Conflict" },
  { id: "restricted", label: "Restricted Source" },
  { id: "connector-degradation", label: "Connector Degradation" },
  { id: "stale", label: "Stale Source" },
  { id: "permission-drift", label: "Permission Drift" },
  { id: "reconciling", label: "Registry Reconciliation in Progress" },
];

/* -------------------------------- resolvers -------------------------------- */

export function resolveSources(
  scenario: DemoScenario,
  filters: Filters,
  overrides: Record<string, Partial<SourceRegistryRecord>>,
  extra: SourceRegistryRecord[],
): SourceRegistryRecord[] {
  const scenarioPatch: Record<string, Partial<SourceRegistryRecord>> = {};
  if (scenario === "connector-degradation") {
    scenarioPatch["SRC-1007"] = { connectorStatus: "Failing", registryStatus: "Degraded", processingReadiness: "Blocked", warningCount: 6 };
  }
  if (scenario === "stale") {
    scenarioPatch["SRC-1004"] = { freshnessStatus: "Stale", registryStatus: "Action Required", qualityScore: 64 };
  }
  if (scenario === "missing-ownership") {
    scenarioPatch["SRC-1008"] = { businessOwner: "Unassigned", ownershipConfidence: 12, registryStatus: "Action Required" };
  }
  if (scenario === "permission-drift") {
    scenarioPatch["SRC-1007"] = { accessClassification: "Highly Restricted", authorizationScope: "Drifted — scope reduced by provider" };
  }
  if (scenario === "restricted") {
    scenarioPatch["SRC-1007"] = { registryStatus: "Active", lifecycleStage: "Restricted" };
  }
  return [...sources, ...extra]
    .map((s) => ({ ...s, ...(scenarioPatch[s.id] ?? {}), ...(overrides[s.id] ?? {}) }))
    .filter((s) => matchesFilters(s, filters));
}

export function resolveExceptions(
  scenario: DemoScenario,
  statusOverrides: Record<string, RegistryException["status"]>,
): RegistryException[] {
  let list = exceptions;
  if (scenario === "healthy" || scenario === "reset") list = exceptions.filter((e) => e.severity !== "Low");
  if (scenario === "duplicates") list = exceptions.filter((e) => e.exceptionType.includes("Duplicate") || e.exceptionType.includes("Authority")).concat(exceptions.filter((e) => !e.exceptionType.includes("Duplicate") && !e.exceptionType.includes("Authority")));
  if (scenario === "connector-degradation") list = exceptions.filter((e) => e.exceptionType === "Degraded Connector").concat(exceptions.filter((e) => e.exceptionType !== "Degraded Connector"));
  return list.map((e) => ({ ...e, status: statusOverrides[e.id] ?? e.status }));
}

export function resolveReviews(scenario: DemoScenario, overrides: Record<string, Partial<SourceReview>>): SourceReview[] {
  return reviews.map((r) => ({ ...r, ...(overrides[r.id] ?? {}) }));
}

export function resolveActivities(scenario: DemoScenario, extra: RegistryActivity[]): RegistryActivity[] {
  const snapshot = scenarioSnapshots[scenario];
  return [...extra, ...(snapshot.extraActivity ? [snapshot.extraActivity] : []), ...activities];
}

/* ------------------------------ search catalog ----------------------------- */

export const searchCatalog: {
  id: string; type: string; title: string; platform: string; owner: string;
  authority: string; status: string; quality: string;
}[] = [
  ...sources.map((s) => ({
    id: s.id, type: "Sources", title: `${s.sourceName} (${s.id})`, platform: s.platform,
    owner: s.businessOwner, authority: s.authorityLevel, status: s.registryStatus, quality: `${s.qualityScore}`,
  })),
  ...Array.from(new Set(sources.map((s) => s.platform))).map((p, i) => ({
    id: `PLAT-${i}`, type: "Platforms", title: p, platform: p, owner: "Platform Engineering",
    authority: "—", status: "Connected", quality: "—",
  })),
  ...Array.from(new Set(sources.map((s) => s.businessOwner))).map((o, i) => ({
    id: `OWN-${i}`, type: "Owners", title: o, platform: "—", owner: o, authority: "—", status: "Active", quality: "—",
  })),
  ...Array.from(new Set(sources.flatMap((s) => s.teamNames))).map((t, i) => ({
    id: `TEAM-${i}`, type: "Teams", title: t, platform: "—", owner: t, authority: "—", status: "Mapped", quality: "—",
  })),
  ...Array.from(new Set(sources.flatMap((s) => s.knowledgeDomains))).map((d, i) => ({
    id: `DOM-${i}`, type: "Knowledge Domains", title: d, platform: "—", owner: "Architecture Office",
    authority: "—", status: "Active", quality: "—",
  })),
  { id: "BC-1", type: "Business Conditions", title: "Payment retries must not duplicate settlement", platform: "Confluence Cloud", owner: "Payments Platform", authority: "Primary", status: "Validated", quality: "94" },
  { id: "BC-2", type: "Business Conditions", title: "Restricted APIs require named consumer approval", platform: "Apigee", owner: "Security Engineering", authority: "Primary", status: "Validated", quality: "91" },
  { id: "PER-1", type: "Personas", title: "Fraud Operations Persona", platform: "—", owner: "Risk Operations", authority: "—", status: "Active", quality: "88" },
  { id: "PER-2", type: "Personas", title: "Reliability Engineering Persona", platform: "—", owner: "SRE", authority: "—", status: "Active", quality: "93" },
  { id: "ART-1", type: "Artifacts", title: "Retry and backoff standard v4", platform: "Confluence Cloud", owner: "Reliability Engineering", authority: "Primary", status: "Published", quality: "92" },
  { id: "DEC-1", type: "Decisions", title: "Adopt idempotency keys for all payment writes", platform: "—", owner: "Architecture Office", authority: "—", status: "Approved", quality: "—" },
  { id: "POL-1", type: "Policies", title: "Restricted data handling policy", platform: "—", owner: "Security Governance", authority: "—", status: "Active", quality: "—" },
];

/* --------------------------------- helpers --------------------------------- */

export const sidebarStatus = {
  state: "Operational" as RegistryState,
  registered: 147,
  pendingReview: 7,
  warnings: 5,
};

export function makeRegisteredSource(input: {
  sourceName: string; description: string; category: string; platform: string; environment: string;
  businessUnit: string; region: string; dataResidency: string; businessOwner: string; technicalOwner: string;
  authorityLevel: AuthorityLevel; accessClassification: AccessClassification; discoveryMode: string;
  knowledgeDomains: string[]; index: number;
}): SourceRegistryRecord {
  const id = `SRC-${1011 + input.index}`;
  return {
    id,
    sourceName: input.sourceName,
    description: input.description || "Registered through the Source Registry registration workflow.",
    businessPurpose: "Pending business purpose confirmation.",
    category: input.category, platform: input.platform, environment: input.environment,
    region: input.region, dataResidency: input.dataResidency, businessUnit: input.businessUnit,
    businessOwner: input.businessOwner, technicalOwner: input.technicalOwner,
    dataSteward: "Unassigned", securityOwner: "Security Engineering", complianceOwner: "Enterprise Compliance",
    teamsRepresented: 1, teamNames: ["Architecture Office"],
    knowledgeDomains: input.knowledgeDomains.length ? input.knowledgeDomains : ["Engineering"],
    businessCapabilities: [], customerJourneys: [], productsServices: [], externalStakeholders: [],
    authorityLevel: input.authorityLevel, approvalState: "Pending Review",
    accessClassification: input.accessClassification, regulatoryScope: [], retentionPolicy: "5 years",
    legalHold: false, allowedUses: [], restrictedUses: ["Condition extraction until approved"],
    registryStatus: "Pending", lifecycleStage: "Registered", freshnessStatus: "Current",
    qualityScore: 72, ownershipConfidence: 70, authorityConfidence: 60, metadataCompleteness: 68, relationshipCoverage: 40,
    connectorId: "CON-NEW-01", connectorStatus: "Healthy", authenticationStatus: "Valid — newly configured",
    authorizationScope: "Read", discoveryMode: input.discoveryMode, scheduleId: "SCH-HOURLY",
    schedule: "Hourly", lastSync: "not yet run", nextRun: "in 1 h",
    artifactCount: 0, queueDepth: 0, successRate: 100, warningCount: 0,
    processingReadiness: "Awaiting first discovery", configurationVersion: "v1.0",
    createdAt: "2026-08-06", discoveredAt: "2026-08-06", updatedAt: "2026-08-06", nextReviewDate: "2026-08-13",
    reviewCadence: "Quarterly",
    relationshipCounts: rel(0, 0, 0, 0, 0, 0),
  };
}
