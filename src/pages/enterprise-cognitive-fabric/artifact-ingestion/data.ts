/**
 * Artifact Ingestion — deterministic seeded data model.
 * No live sources, credentials, or enterprise content. Synthetic metadata only.
 */

export type ViewMode = "executive" | "operations" | "governance" | "evidence";

export type IngestionState = "Operational" | "Running" | "Degraded" | "Paused" | "Backlogged" | "Maintenance";
export type StageStatus = "Running" | "Warning" | "Blocked" | "Paused" | "Idle" | "Complete";
export type BatchStatus = "Running" | "Warning" | "Blocked" | "Paused" | "Completed" | "Cancelled";
export type ArtifactStatus =
  | "Ready for Normalization" | "Review Required" | "Permission Review" | "Blocked"
  | "Quarantined" | "Processing" | "Unsupported" | "Corrupted" | "Stale";
export type DuplicateStatus = "Unique" | "Possible Duplicate" | "Exact Duplicate" | "Version Update" | "Conflicting Version";
export type AuthorityLevel = "Primary" | "Supporting" | "Historical" | "Unconfirmed";
export type AccessClassification = "Public" | "Internal" | "Confidential" | "Restricted" | "Highly Restricted";
export type FreshnessStatus = "Current" | "Recent" | "Aging" | "Stale";
export type Severity = "Critical" | "High" | "Medium" | "Low";

/* ------------------------------- interfaces ------------------------------- */

export interface ArtifactRecord {
  id: string;
  title: string;
  description: string;
  sourceId: string;
  sourceName: string;
  sourceCategory: string;
  ingestionMethod: string;
  artifactType: string;
  format: string;
  mimeType: string;
  originalFilename: string;
  contentSize: string;
  contentSizeBytes: number;
  contentHash: string;
  teamId: string;
  teamName: string;
  businessUnit: string;
  knowledgeDomains: string[];
  owner: string;
  authorityLevel: AuthorityLevel;
  version: string;
  previousVersionId: string | null;
  versionRelationship: string;
  accessClassification: AccessClassification;
  regulatoryScope: string[];
  sourceCreatedAt: string;
  sourceModifiedAt: string;
  receivedAt: string;
  freshnessStatus: FreshnessStatus;
  ingestionStatus: ArtifactStatus;
  duplicateStatus: DuplicateStatus;
  validationScore: number;
  qualityScore: number;
  permissionStatus: string;
  evidenceId: string;
  batchId: string;
  normalizationQueueId: string | null;
  environment: string;
  region: string;
  dataResidency: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

export interface IngestionBatch {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceCategory: string;
  ingestionMethod: string;
  status: BatchStatus;
  artifactCount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  quarantinedCount: number;
  duplicateCandidateCount: number;
  versionCount: number;
  permissionReviewCount: number;
  currentStageId: string;
  currentStageName: string;
  startedAt: string;
  elapsedTime: string;
  estimatedCompletion: string;
  successRate: number;
  owner: string;
  queueDepth: number;
  warningCount: number;
  configurationVersion: string;
  accessClassification: AccessClassification;
  artifactTypes: string[];
}

export interface IngestionStage {
  id: string;
  name: string;
  sequence: number;
  status: StageStatus;
  definition: string;
  processedCount: number;
  processedLabel: string;
  pendingCount: number;
  failedCount: number;
  warningCount: number;
  successRate: number;
  averageDuration: string;
  p95Duration: string;
  throughput: string;
  slaTarget: string;
  slaStatus: string;
  owner: string;
  upstreamStageId: string | null;
  downstreamStageId: string | null;
  bottleneck?: string;
}

export interface ArtifactMetadata {
  artifactId: string;
  title: string;
  author: string;
  createdDate: string;
  modifiedDate: string;
  language: string;
  sections: number;
  tables: number;
  attachments: number;
  participants: string[];
  speakers: string[];
  timestamps: string;
  tags: string[];
}

export interface ArtifactPermission {
  artifactId: string;
  sourcePermissions: string[];
  inheritedPermissions: string[];
  approvedConsumers: string[];
  restrictedConsumers: string[];
  accessClassification: AccessClassification;
  regulatoryScope: string[];
  permissionDrift: string;
}

export interface DuplicateCandidate {
  id: string;
  artifactId: string;
  artifactTitle: string;
  candidateArtifactId: string;
  candidateTitle: string;
  semanticSimilarity: number;
  contentHashSimilarity: number;
  metadataSimilarity: number;
  relationshipType: string;
  authorityConflict: boolean;
  ownerConflict: boolean;
  owner: string;
  authority: AuthorityLevel;
  reviewStatus: string;
  recommendedAction: string;
}

export interface ArtifactVersion {
  id: string;
  artifactFamilyId: string;
  artifactId: string;
  artifactFamilyName: string;
  version: string;
  previousVersion: string;
  changeType: string;
  sourceTimestamp: string;
  ingestedTimestamp: string;
  contentHash: string;
  owner: string;
  status: string;
}

export interface IngestionException {
  id: string;
  artifactId: string;
  artifactTitle: string;
  batchId: string;
  exceptionType: string;
  severity: Severity;
  description: string;
  sourceId: string;
  sourceName: string;
  teamId: string;
  teamName: string;
  owner: string;
  status: string;
  createdAt: string;
  age: string;
  dueAt: string;
  downstreamImpact: string;
  recommendedAction: string;
}

export interface EvidenceRecord {
  id: string;
  artifactId: string;
  sourceId: string;
  connectorId: string;
  discoveryRunId: string;
  ingestionBatchId: string;
  immutableEvidenceId: string;
  contentHash: string;
  sourceIdentifier: string;
  version: string;
  owner: string;
  accessClassification: AccessClassification;
  receivedAt: string;
  evidenceVaultLocation: string;
}

export interface NormalizationReadiness {
  readyCount: number;
  humanReviewCount: number;
  permissionBlockedCount: number;
  quarantinedCount: number;
  unsupportedCount: number;
  duplicateReviewCount: number;
}

export interface IngestionActivity {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  artifactId: string | null;
  batchId: string | null;
  sourceId: string;
  sourceName: string;
  teamName: string;
  result: string;
  owner: string;
  auditId: string;
}

export interface IngestionNotification {
  id: string;
  category: string;
  title: string;
  detail: string;
  severity: Severity;
  timestamp: string;
  read: boolean;
  batchId?: string;
  artifactId?: string;
}

/* --------------------------------- filters -------------------------------- */

export interface Filters {
  businessUnit: string;
  team: string;
  knowledgeDomain: string;
  sourceCategory: string;
  sourcePlatform: string;
  artifactType: string;
  format: string;
  ingestionMethod: string;
  batchStatus: string;
  artifactStatus: string;
  owner: string;
  accessClassification: string;
  authorityLevel: string;
  freshness: string;
  duplicateStatus: string;
  validationStatus: string;
  environment: string;
  region: string;
  dataResidency: string;
  timeRange: string;
}

export const defaultFilters: Filters = {
  businessUnit: "All", team: "All", knowledgeDomain: "All", sourceCategory: "All",
  sourcePlatform: "All", artifactType: "All", format: "All", ingestionMethod: "All",
  batchStatus: "All", artifactStatus: "All", owner: "All", accessClassification: "All",
  authorityLevel: "All", freshness: "All", duplicateStatus: "All", validationStatus: "All",
  environment: "All", region: "All", dataResidency: "All", timeRange: "Last 24 hours",
};

export const activeFilterCount = (f: Filters) =>
  (Object.keys(f) as (keyof Filters)[]).filter((k) => k !== "timeRange" && f[k] !== "All").length +
  (f.timeRange !== defaultFilters.timeRange ? 1 : 0);

export const timeRanges = [
  "Last 15 minutes", "Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days", "Custom range",
];

export const filterLabels: Record<keyof Filters, string> = {
  businessUnit: "Business Unit", team: "Team", knowledgeDomain: "Knowledge Domain",
  sourceCategory: "Source Category", sourcePlatform: "Source Platform", artifactType: "Artifact Type",
  format: "File Format", ingestionMethod: "Ingestion Method", batchStatus: "Batch Status",
  artifactStatus: "Artifact Status", owner: "Owner", accessClassification: "Access Classification",
  authorityLevel: "Authority Level", freshness: "Freshness", duplicateStatus: "Duplicate Status",
  validationStatus: "Validation Status", environment: "Environment", region: "Region",
  dataResidency: "Data Residency", timeRange: "Time Range",
};

export const filterOptions: Record<keyof Filters, string[]> = {
  businessUnit: ["All", "Technology", "Customer Experience", "Finance", "Security"],
  team: ["All", "Payments Platform", "Checkout Engineering", "Site Reliability Engineering", "Identity Engineering", "Fraud Engineering", "Customer Support", "Enterprise Architecture"],
  knowledgeDomain: ["All", "Reliability", "Payments", "Identity", "Fraud", "Customer Experience", "Engineering"],
  sourceCategory: ["All", "Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry", "Spreadsheets"],
  sourcePlatform: ["All", "Confluence Cloud", "Jira Engineering", "Slack Enterprise", "Zoom Transcripts", "GitHub Enterprise", "Datadog Telemetry", "Apigee Identity Services", "Google Drive", "Manual Submission"],
  artifactType: ["All", "Requirements Document", "Design Document", "Meeting Transcript", "API Definition", "Code Repository Snapshot", "Ticket", "Chat Thread", "Telemetry Record", "Spreadsheet"],
  format: ["All", "PDF", "DOCX", "XLSX", "PPTX", "HTML", "JSON", "XML", "CSV", "Markdown", "VTT", "TXT", "YAML", "Images", "Audio", "TAR Metadata Snapshot", "Other"],
  ingestionMethod: ["All", "Incremental Discovery", "Incremental", "Streaming", "Batch", "Scheduled", "Historical Backfill", "Manual Submission", "Metadata Only"],
  batchStatus: ["All", "Running", "Warning", "Blocked", "Paused", "Completed"],
  artifactStatus: ["All", "Ready for Normalization", "Review Required", "Permission Review", "Blocked", "Quarantined", "Processing", "Unsupported", "Corrupted", "Stale"],
  owner: ["All", "Jane Smith", "Marcus Lee", "Priya Patel", "Security Engineering", "Platform Engineering", "Engineering Operations", "Product Operations", "Customer Support", "Site Reliability Engineering", "Enterprise Architecture"],
  accessClassification: ["All", "Public", "Internal", "Confidential", "Restricted", "Highly Restricted"],
  authorityLevel: ["All", "Primary", "Supporting", "Historical", "Unconfirmed"],
  freshness: ["All", "Current", "Recent", "Aging", "Stale"],
  duplicateStatus: ["All", "Unique", "Possible Duplicate", "Exact Duplicate", "Version Update", "Conflicting Version"],
  validationStatus: ["All", "Passed", "Warning", "Failed"],
  environment: ["All", "Production", "Staging", "Development"],
  region: ["All", "North America", "Europe", "Asia Pacific", "Global"],
  dataResidency: ["All", "United States", "European Union", "United Kingdom", "Asia Pacific", "Global"],
  timeRange: timeRanges,
};

/* -------------------------------- lifecycle -------------------------------- */

export const stages: IngestionStage[] = [
  {
    id: "receive", name: "Receive", sequence: 1, status: "Running",
    definition: "Accepts artifacts delivered by approved connectors and authorized manual submissions.",
    processedCount: 2_400_000, processedLabel: "2.4M", pendingCount: 18_000, failedCount: 0, warningCount: 1,
    successRate: 99.5, averageDuration: "4 s", p95Duration: "8 s", throughput: "8,400 artifacts/min",
    slaTarget: "10 s", slaStatus: "Within SLA", owner: "Ingestion Operations",
    upstreamStageId: null, downstreamStageId: "authenticate",
  },
  {
    id: "authenticate", name: "Authenticate Source", sequence: 2, status: "Running",
    definition: "Confirms the delivering connector and source identity before any artifact is retained.",
    processedCount: 2_380_000, processedLabel: "2.38M", pendingCount: 19_000, failedCount: 1, warningCount: 2,
    successRate: 99.3, averageDuration: "6 s", p95Duration: "12 s", throughput: "8,120 artifacts/min",
    slaTarget: "15 s", slaStatus: "Within SLA", owner: "Security Engineering",
    upstreamStageId: "receive", downstreamStageId: "capture",
  },
  {
    id: "capture", name: "Capture Original", sequence: 3, status: "Running",
    definition: "Preserves the unmodified original artifact and issues an immutable evidence identifier.",
    processedCount: 2_350_000, processedLabel: "2.35M", pendingCount: 24_000, failedCount: 0, warningCount: 1,
    successRate: 99.1, averageDuration: "14 s", p95Duration: "29 s", throughput: "7,900 artifacts/min",
    slaTarget: "30 s", slaStatus: "Within SLA", owner: "Evidence Operations",
    upstreamStageId: "authenticate", downstreamStageId: "metadata",
  },
  {
    id: "metadata", name: "Extract Metadata", sequence: 4, status: "Running",
    definition: "Reads structural and descriptive metadata without altering the original artifact.",
    processedCount: 2_310_000, processedLabel: "2.31M", pendingCount: 31_000, failedCount: 1, warningCount: 3,
    successRate: 98.8, averageDuration: "22 s", p95Duration: "44 s", throughput: "7,450 artifacts/min",
    slaTarget: "45 s", slaStatus: "Within SLA", owner: "Ingestion Operations",
    upstreamStageId: "capture", downstreamStageId: "permissions",
  },
  {
    id: "permissions", name: "Preserve Permissions", sequence: 5, status: "Warning",
    definition: "Carries source permissions and access classification forward with the artifact.",
    processedCount: 2_280_000, processedLabel: "2.28M", pendingCount: 36_000, failedCount: 2, warningCount: 4,
    successRate: 97.9, averageDuration: "28 s", p95Duration: "1.1 min", throughput: "6,980 artifacts/min",
    slaTarget: "1 min", slaStatus: "At Risk", owner: "Security Engineering",
    upstreamStageId: "metadata", downstreamStageId: "duplicate",
    bottleneck: "Permission preservation latency rising against the one minute target.",
  },
  {
    id: "duplicate", name: "Detect Version and Duplicate", sequence: 6, status: "Running",
    definition: "Determines whether the artifact is new, a revision, a duplicate, or a conflicting version.",
    processedCount: 2_250_000, processedLabel: "2.25M", pendingCount: 42_000, failedCount: 0, warningCount: 3,
    successRate: 98.4, averageDuration: "34 s", p95Duration: "1.4 min", throughput: "6,620 artifacts/min",
    slaTarget: "1.5 min", slaStatus: "Within SLA", owner: "Knowledge Operations",
    upstreamStageId: "permissions", downstreamStageId: "validate",
    bottleneck: "Duplicate review queue elevated above the normal operating band.",
  },
  {
    id: "validate", name: "Validate Artifact", sequence: 7, status: "Warning",
    definition: "Confirms completeness, readability, supported format, and source consistency.",
    processedCount: 2_220_000, processedLabel: "2.22M", pendingCount: 48_000, failedCount: 3, warningCount: 5,
    successRate: 97.6, averageDuration: "46 s", p95Duration: "1.8 min", throughput: "6,240 artifacts/min",
    slaTarget: "2 min", slaStatus: "At Risk", owner: "Ingestion Operations",
    upstreamStageId: "duplicate", downstreamStageId: "evidence",
    bottleneck: "Artifact validation failures above baseline for meeting transcripts.",
  },
  {
    id: "evidence", name: "Register Evidence", sequence: 8, status: "Running",
    definition: "Registers the artifact in the evidence vault with hash, provenance, and ownership.",
    processedCount: 2_190_000, processedLabel: "2.19M", pendingCount: 25_000, failedCount: 0, warningCount: 1,
    successRate: 99.2, averageDuration: "18 s", p95Duration: "36 s", throughput: "6,180 artifacts/min",
    slaTarget: "40 s", slaStatus: "Within SLA", owner: "Evidence Operations",
    upstreamStageId: "validate", downstreamStageId: "queue",
  },
  {
    id: "queue", name: "Queue for Normalization", sequence: 9, status: "Running",
    definition: "Places qualified artifacts on the normalization queue with priority and lineage intact.",
    processedCount: 2_200_000, processedLabel: "2.2M", pendingCount: 42_318, failedCount: 0, warningCount: 1,
    successRate: 98.9, averageDuration: "11 s", p95Duration: "24 s", throughput: "6,050 artifacts/min",
    slaTarget: "30 s", slaStatus: "Within SLA", owner: "Normalization Operations",
    upstreamStageId: "evidence", downstreamStageId: null,
  },
];

export const stageById = stages.reduce<Record<string, IngestionStage>>((a, s) => { a[s.id] = s; return a; }, {});

/* --------------------------------- batches --------------------------------- */

export const batches: IngestionBatch[] = [
  {
    id: "ING-20452", sourceId: "SRC-2001", sourceName: "Confluence Cloud", sourceCategory: "Documents",
    ingestionMethod: "Incremental Discovery", status: "Running", artifactCount: 124_532,
    completedCount: 118_940, pendingCount: 4_280, failedCount: 62, quarantinedCount: 18,
    duplicateCandidateCount: 214, versionCount: 1_842, permissionReviewCount: 36,
    currentStageId: "metadata", currentStageName: "Extract Metadata", startedAt: "10:02 AM",
    elapsedTime: "3 min 22 s", estimatedCompletion: "10:09 AM", successRate: 98.9,
    owner: "Engineering Operations", queueDepth: 4_280, warningCount: 1, configurationVersion: "v3.4",
    accessClassification: "Confidential", artifactTypes: ["Requirements Document", "Design Document"],
  },
  {
    id: "ING-20451", sourceId: "SRC-2002", sourceName: "Jira Engineering", sourceCategory: "Tickets",
    ingestionMethod: "Incremental Discovery", status: "Running", artifactCount: 88_214,
    completedCount: 85_980, pendingCount: 2_144, failedCount: 24, quarantinedCount: 4,
    duplicateCandidateCount: 96, versionCount: 640, permissionReviewCount: 12,
    currentStageId: "evidence", currentStageName: "Register Evidence", startedAt: "10:01 AM",
    elapsedTime: "4 min 1 s", estimatedCompletion: "10:08 AM", successRate: 99.2,
    owner: "Product Operations", queueDepth: 2_144, warningCount: 0, configurationVersion: "v3.4",
    accessClassification: "Internal", artifactTypes: ["Ticket"],
  },
  {
    id: "ING-20450", sourceId: "SRC-2003", sourceName: "Slack Enterprise", sourceCategory: "Chat",
    ingestionMethod: "Streaming", status: "Warning", artifactCount: 412_998,
    completedCount: 396_420, pendingCount: 14_220, failedCount: 1_284, quarantinedCount: 62,
    duplicateCandidateCount: 3_120, versionCount: 0, permissionReviewCount: 284,
    currentStageId: "permissions", currentStageName: "Preserve Permissions", startedAt: "9:58 AM",
    elapsedTime: "6 min 42 s", estimatedCompletion: "10:16 AM", successRate: 96.8,
    owner: "Customer Support", queueDepth: 14_220, warningCount: 3, configurationVersion: "v3.3",
    accessClassification: "Internal", artifactTypes: ["Chat Thread"],
  },
  {
    id: "ING-20449", sourceId: "SRC-2004", sourceName: "Zoom Transcripts", sourceCategory: "Meetings",
    ingestionMethod: "Batch", status: "Warning", artifactCount: 18_920,
    completedCount: 16_820, pendingCount: 1_942, failedCount: 158, quarantinedCount: 24,
    duplicateCandidateCount: 42, versionCount: 12, permissionReviewCount: 96,
    currentStageId: "validate", currentStageName: "Validate Artifact", startedAt: "9:56 AM",
    elapsedTime: "8 min 16 s", estimatedCompletion: "10:19 AM", successRate: 94.7,
    owner: "Enterprise Architecture", queueDepth: 1_942, warningCount: 2, configurationVersion: "v3.4",
    accessClassification: "Confidential", artifactTypes: ["Meeting Transcript"],
  },
  {
    id: "ING-20448", sourceId: "SRC-2005", sourceName: "GitHub Enterprise", sourceCategory: "Code",
    ingestionMethod: "Incremental", status: "Running", artifactCount: 56_340,
    completedCount: 55_890, pendingCount: 412, failedCount: 8, quarantinedCount: 0,
    duplicateCandidateCount: 24, versionCount: 4_820, permissionReviewCount: 2,
    currentStageId: "queue", currentStageName: "Queue for Normalization", startedAt: "9:55 AM",
    elapsedTime: "5 min 37 s", estimatedCompletion: "10:07 AM", successRate: 99.4,
    owner: "Platform Engineering", queueDepth: 412, warningCount: 0, configurationVersion: "v3.4",
    accessClassification: "Restricted", artifactTypes: ["Code Repository Snapshot"],
  },
  {
    id: "ING-20447", sourceId: "SRC-2006", sourceName: "Datadog Telemetry", sourceCategory: "Telemetry",
    ingestionMethod: "Streaming", status: "Running", artifactCount: 1_204_844,
    completedCount: 1_182_100, pendingCount: 18_300, failedCount: 420, quarantinedCount: 6,
    duplicateCandidateCount: 8_240, versionCount: 0, permissionReviewCount: 0,
    currentStageId: "receive", currentStageName: "Receive", startedAt: "9:54 AM",
    elapsedTime: "2 min 18 s", estimatedCompletion: "10:12 AM", successRate: 99.6,
    owner: "Site Reliability Engineering", queueDepth: 18_300, warningCount: 0, configurationVersion: "v3.4",
    accessClassification: "Internal", artifactTypes: ["Telemetry Record"],
  },
  {
    id: "ING-20446", sourceId: "SRC-2007", sourceName: "Apigee Identity Services", sourceCategory: "APIs",
    ingestionMethod: "Scheduled", status: "Blocked", artifactCount: 8_412,
    completedCount: 6_120, pendingCount: 2_117, failedCount: 175, quarantinedCount: 12,
    duplicateCandidateCount: 4, versionCount: 128, permissionReviewCount: 46,
    currentStageId: "authenticate", currentStageName: "Authenticate Source", startedAt: "9:52 AM",
    elapsedTime: "12 min 3 s", estimatedCompletion: "Blocked", successRate: 88.4,
    owner: "Security Engineering", queueDepth: 2_117, warningCount: 4, configurationVersion: "v3.2",
    accessClassification: "Restricted", artifactTypes: ["API Definition"],
  },
];

export const batchById = batches.reduce<Record<string, IngestionBatch>>((a, b) => { a[b.id] = b; return a; }, {});

/* -------------------------------- artifacts -------------------------------- */

export const artifacts: ArtifactRecord[] = [
  {
    id: "ART-784221", title: "Payments API Reliability Requirements",
    description: "Authoritative reliability requirements for the payments authorization API, including availability and latency commitments.",
    sourceId: "SRC-2001", sourceName: "Confluence Cloud", sourceCategory: "Documents",
    ingestionMethod: "Incremental Discovery", artifactType: "Requirements Document", format: "PDF",
    mimeType: "application/pdf", originalFilename: "payments-api-reliability-requirements-v3.2.pdf",
    contentSize: "2.8 MB", contentSizeBytes: 2_936_012, contentHash: "sha256:9f21c4a8e3b7…41d0",
    teamId: "TEAM-01", teamName: "Payments Platform", businessUnit: "Technology",
    knowledgeDomains: ["Reliability", "Payments"], owner: "Jane Smith", authorityLevel: "Primary",
    version: "3.2", previousVersionId: "ART-782014", versionRelationship: "Revision of 3.1",
    accessClassification: "Confidential", regulatoryScope: ["PCI DSS"],
    sourceCreatedAt: "2026-05-14", sourceModifiedAt: "2026-08-05", receivedAt: "10:02 AM",
    freshnessStatus: "Current", ingestionStatus: "Ready for Normalization", duplicateStatus: "Unique",
    validationScore: 96, qualityScore: 94, permissionStatus: "Preserved",
    evidenceId: "EVD-77421", batchId: "ING-20452", normalizationQueueId: "NRM-8291",
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "Section 2.1 — The payments authorization API shall maintain 99.95 percent monthly availability with p95 latency at or below 250 milliseconds…",
    createdAt: "2026-08-05", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784220", title: "Checkout Retry Policy Update",
    description: "Proposed retry and backoff policy update for checkout payment submission failures.",
    sourceId: "SRC-2008", sourceName: "Google Drive", sourceCategory: "Documents",
    ingestionMethod: "Incremental Discovery", artifactType: "Design Document", format: "DOCX",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    originalFilename: "checkout-retry-policy-update-v1.2.docx",
    contentSize: "1.4 MB", contentSizeBytes: 1_468_006, contentHash: "sha256:4c88ba02f19d…77ae",
    teamId: "TEAM-02", teamName: "Checkout Engineering", businessUnit: "Customer Experience",
    knowledgeDomains: ["Payments", "Customer Experience"], owner: "Marcus Lee", authorityLevel: "Supporting",
    version: "1.2", previousVersionId: "ART-781902", versionRelationship: "New version of 1.1",
    accessClassification: "Internal", regulatoryScope: [],
    sourceCreatedAt: "2026-06-02", sourceModifiedAt: "2026-08-06", receivedAt: "10:04 AM",
    freshnessStatus: "Current", ingestionStatus: "Review Required", duplicateStatus: "Possible Duplicate",
    validationScore: 82, qualityScore: 79, permissionStatus: "Preserved",
    evidenceId: "EVD-77422", batchId: "ING-20452", normalizationQueueId: null,
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "Retry attempts shall be capped at three with exponential backoff beginning at 250 milliseconds…",
    createdAt: "2026-08-06", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784219", title: "Payments Incident Review",
    description: "Meeting transcript from the payments incident review covering the 4 August authorization degradation.",
    sourceId: "SRC-2004", sourceName: "Zoom Transcripts", sourceCategory: "Meetings",
    ingestionMethod: "Batch", artifactType: "Meeting Transcript", format: "VTT",
    mimeType: "text/vtt", originalFilename: "payments-incident-review-2026-08-04.vtt",
    contentSize: "4.2 MB", contentSizeBytes: 4_404_019, contentHash: "sha256:71ae0d5c8842…9b31",
    teamId: "TEAM-03", teamName: "Site Reliability Engineering", businessUnit: "Technology",
    knowledgeDomains: ["Reliability"], owner: "Priya Patel", authorityLevel: "Supporting",
    version: "1", previousVersionId: null, versionRelationship: "Original",
    accessClassification: "Confidential", regulatoryScope: ["Internal Audit"],
    sourceCreatedAt: "2026-08-04", sourceModifiedAt: "2026-08-04", receivedAt: "9:57 AM",
    freshnessStatus: "Recent", ingestionStatus: "Permission Review", duplicateStatus: "Unique",
    validationScore: 88, qualityScore: 85, permissionStatus: "Review pending",
    evidenceId: "EVD-77423", batchId: "ING-20449", normalizationQueueId: null,
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "Speaker 1: authorization error rate climbed to 4.1 percent at 14:06 UTC before the retry policy change took effect…",
    createdAt: "2026-08-04", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784218", title: "Identity Service OpenAPI Specification",
    description: "Machine-readable interface definition for the enterprise identity service.",
    sourceId: "SRC-2007", sourceName: "Apigee", sourceCategory: "APIs",
    ingestionMethod: "Scheduled", artifactType: "API Definition", format: "JSON",
    mimeType: "application/json", originalFilename: "identity-service-openapi-4.7.json",
    contentSize: "840 KB", contentSizeBytes: 860_160, contentHash: "sha256:2ba7cc41e09f…5d6c",
    teamId: "TEAM-04", teamName: "Identity Engineering", businessUnit: "Security",
    knowledgeDomains: ["Identity"], owner: "Security Engineering", authorityLevel: "Primary",
    version: "4.7", previousVersionId: "ART-780044", versionRelationship: "Revision of 4.6",
    accessClassification: "Restricted", regulatoryScope: ["SOC 2", "Internal Audit"],
    sourceCreatedAt: "2026-03-11", sourceModifiedAt: "2026-08-01", receivedAt: "9:52 AM",
    freshnessStatus: "Recent", ingestionStatus: "Blocked", duplicateStatus: "Unique",
    validationScore: 74, qualityScore: 71, permissionStatus: "Source authentication failed",
    evidenceId: "EVD-77424", batchId: "ING-20446", normalizationQueueId: null,
    environment: "Production", region: "Global", dataResidency: "Global",
    preview: "paths: /v1/tokens: post: summary: Issue a service access token…",
    createdAt: "2026-08-01", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784217", title: "Fraud Decision Service Repository",
    description: "Metadata snapshot of the fraud decision service repository at the current release commit.",
    sourceId: "SRC-2005", sourceName: "GitHub Enterprise", sourceCategory: "Code",
    ingestionMethod: "Incremental", artifactType: "Code Repository Snapshot", format: "TAR Metadata Snapshot",
    mimeType: "application/x-tar", originalFilename: "fraud-decision-service-8f4a9c.metadata.tar",
    contentSize: "18.7 MB", contentSizeBytes: 19_608_371, contentHash: "sha256:8f4a9c1d7e22…c0f4",
    teamId: "TEAM-05", teamName: "Fraud Engineering", businessUnit: "Security",
    knowledgeDomains: ["Fraud", "Engineering"], owner: "Platform Engineering", authorityLevel: "Primary",
    version: "Commit 8f4a9c", previousVersionId: "ART-783990", versionRelationship: "Version update",
    accessClassification: "Restricted", regulatoryScope: ["SOC 2"],
    sourceCreatedAt: "2026-07-28", sourceModifiedAt: "2026-08-06", receivedAt: "9:55 AM",
    freshnessStatus: "Current", ingestionStatus: "Ready for Normalization", duplicateStatus: "Version Update",
    validationScore: 98, qualityScore: 96, permissionStatus: "Preserved",
    evidenceId: "EVD-77425", batchId: "ING-20448", normalizationQueueId: "NRM-8292",
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "repository: fraud-decision-service · modules: 42 · services: 6 · owners file present · release tag r2026.08.1",
    createdAt: "2026-08-06", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784216", title: "Quarterly Reliability Scorecard",
    description: "Spreadsheet of quarterly reliability measurements by service and business unit.",
    sourceId: "SRC-2008", sourceName: "Google Drive", sourceCategory: "Spreadsheets",
    ingestionMethod: "Incremental Discovery", artifactType: "Spreadsheet", format: "XLSX",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    originalFilename: "quarterly-reliability-scorecard-q2.xlsx",
    contentSize: "3.1 MB", contentSizeBytes: 3_250_585, contentHash: "sha256:0dd41f9a7b63…22e8",
    teamId: "TEAM-03", teamName: "Site Reliability Engineering", businessUnit: "Technology",
    knowledgeDomains: ["Reliability"], owner: "Site Reliability Engineering", authorityLevel: "Supporting",
    version: "2.0", previousVersionId: "ART-779812", versionRelationship: "Revision of 1.9",
    accessClassification: "Internal", regulatoryScope: [],
    sourceCreatedAt: "2026-04-02", sourceModifiedAt: "2026-07-02", receivedAt: "9:48 AM",
    freshnessStatus: "Aging", ingestionStatus: "Corrupted", duplicateStatus: "Unique",
    validationScore: 41, qualityScore: 38, permissionStatus: "Preserved",
    evidenceId: "EVD-77426", batchId: "ING-20452", normalizationQueueId: null,
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "Workbook stream ended unexpectedly at sheet 3. Partial content retained for evidence only.",
    createdAt: "2026-07-02", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784215", title: "Customer Escalation Thread — Checkout Failures",
    description: "Chat thread capturing a customer escalation about repeated checkout failures.",
    sourceId: "SRC-2003", sourceName: "Slack Enterprise", sourceCategory: "Chat",
    ingestionMethod: "Streaming", artifactType: "Chat Thread", format: "JSON",
    mimeType: "application/json", originalFilename: "slack-thread-C4821-1754472000.json",
    contentSize: "412 KB", contentSizeBytes: 421_888, contentHash: "sha256:5e70b93c1a4d…8f22",
    teamId: "TEAM-06", teamName: "Customer Support", businessUnit: "Customer Experience",
    knowledgeDomains: ["Customer Experience"], owner: "Customer Support", authorityLevel: "Supporting",
    version: "1", previousVersionId: null, versionRelationship: "Original",
    accessClassification: "Internal", regulatoryScope: [],
    sourceCreatedAt: "2026-08-06", sourceModifiedAt: "2026-08-06", receivedAt: "10:14 AM",
    freshnessStatus: "Current", ingestionStatus: "Permission Review", duplicateStatus: "Unique",
    validationScore: 79, qualityScore: 76, permissionStatus: "Channel permission drift detected",
    evidenceId: "EVD-77427", batchId: "ING-20450", normalizationQueueId: null,
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "Customer reported three declined attempts within four minutes on the same payment instrument…",
    createdAt: "2026-08-06", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784214", title: "Legacy Settlement Runbook",
    description: "Historical settlement runbook retained for lineage. Superseded by the current settlement operations guide.",
    sourceId: "SRC-2001", sourceName: "Confluence Cloud", sourceCategory: "Documents",
    ingestionMethod: "Historical Backfill", artifactType: "Requirements Document", format: "HTML",
    mimeType: "text/html", originalFilename: "legacy-settlement-runbook.html",
    contentSize: "620 KB", contentSizeBytes: 634_880, contentHash: "sha256:c1902ffab74e…3311",
    teamId: "TEAM-01", teamName: "Payments Platform", businessUnit: "Technology",
    knowledgeDomains: ["Payments"], owner: "Engineering Operations", authorityLevel: "Historical",
    version: "1.0", previousVersionId: null, versionRelationship: "Superseded",
    accessClassification: "Internal", regulatoryScope: [],
    sourceCreatedAt: "2023-11-04", sourceModifiedAt: "2024-02-18", receivedAt: "9:41 AM",
    freshnessStatus: "Stale", ingestionStatus: "Stale", duplicateStatus: "Exact Duplicate",
    validationScore: 63, qualityScore: 58, permissionStatus: "Preserved",
    evidenceId: "EVD-77428", batchId: "ING-20452", normalizationQueueId: null,
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "Settlement batches are cut at 02:00 local time. This procedure was superseded in February 2024…",
    createdAt: "2024-02-18", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784213", title: "Vendor Risk Assessment Deck",
    description: "Presentation summarizing third-party vendor risk posture for the payments programme.",
    sourceId: "SRC-2008", sourceName: "Google Drive", sourceCategory: "Documents",
    ingestionMethod: "Manual Submission", artifactType: "Design Document", format: "PPTX",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    originalFilename: "vendor-risk-assessment-q3.pptx",
    contentSize: "9.4 MB", contentSizeBytes: 9_856_614, contentHash: "sha256:aa41d8e7cc09…7d5b",
    teamId: "TEAM-07", teamName: "Enterprise Architecture", businessUnit: "Finance",
    knowledgeDomains: ["Engineering"], owner: "Enterprise Architecture", authorityLevel: "Unconfirmed",
    version: "1.0", previousVersionId: null, versionRelationship: "Original",
    accessClassification: "Highly Restricted", regulatoryScope: ["SOC 2", "Vendor Risk"],
    sourceCreatedAt: "2026-08-05", sourceModifiedAt: "2026-08-05", receivedAt: "10:03 AM",
    freshnessStatus: "Current", ingestionStatus: "Quarantined", duplicateStatus: "Unique",
    validationScore: 68, qualityScore: 64, permissionStatus: "Restricted content held",
    evidenceId: "EVD-77429", batchId: "ING-20452", normalizationQueueId: null,
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "Slide 4 — Vendor concentration risk remains elevated for settlement processing partners…",
    createdAt: "2026-08-05", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784212", title: "Authorization Latency Telemetry Window",
    description: "Telemetry record window covering authorization latency percentiles for the payments service.",
    sourceId: "SRC-2006", sourceName: "Datadog Telemetry", sourceCategory: "Telemetry",
    ingestionMethod: "Streaming", artifactType: "Telemetry Record", format: "JSON",
    mimeType: "application/json", originalFilename: "auth-latency-window-1754476800.json",
    contentSize: "128 KB", contentSizeBytes: 131_072, contentHash: "sha256:3fb0a5d61c78…e402",
    teamId: "TEAM-03", teamName: "Site Reliability Engineering", businessUnit: "Technology",
    knowledgeDomains: ["Reliability"], owner: "Site Reliability Engineering", authorityLevel: "Primary",
    version: "1", previousVersionId: null, versionRelationship: "Original",
    accessClassification: "Internal", regulatoryScope: [],
    sourceCreatedAt: "2026-08-06", sourceModifiedAt: "2026-08-06", receivedAt: "10:20 AM",
    freshnessStatus: "Current", ingestionStatus: "Ready for Normalization", duplicateStatus: "Unique",
    validationScore: 99, qualityScore: 97, permissionStatus: "Preserved",
    evidenceId: "EVD-77430", batchId: "ING-20447", normalizationQueueId: "NRM-8293",
    environment: "Production", region: "Global", dataResidency: "Global",
    preview: "p50 118 ms · p95 242 ms · p99 511 ms · window 10:05–10:20 UTC",
    createdAt: "2026-08-06", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784211", title: "Scanned Settlement Agreement",
    description: "Scanned image of a legacy settlement agreement submitted for evidence retention.",
    sourceId: "SRC-2009", sourceName: "Manual Submission", sourceCategory: "Documents",
    ingestionMethod: "Manual Submission", artifactType: "Requirements Document", format: "Images",
    mimeType: "image/tiff", originalFilename: "settlement-agreement-scan.tiff",
    contentSize: "22.4 MB", contentSizeBytes: 23_488_102, contentHash: "sha256:6d2c07be1194…ba97",
    teamId: "TEAM-01", teamName: "Payments Platform", businessUnit: "Finance",
    knowledgeDomains: ["Payments"], owner: "Engineering Operations", authorityLevel: "Unconfirmed",
    version: "1", previousVersionId: null, versionRelationship: "Original",
    accessClassification: "Confidential", regulatoryScope: ["Contract Retention"],
    sourceCreatedAt: "2026-08-06", sourceModifiedAt: "2026-08-06", receivedAt: "10:06 AM",
    freshnessStatus: "Current", ingestionStatus: "Unsupported", duplicateStatus: "Unique",
    validationScore: 52, qualityScore: 47, permissionStatus: "Declared at submission",
    evidenceId: "EVD-77431", batchId: "ING-20452", normalizationQueueId: null,
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "Multi-page TIFF. Text layer absent. Requires optical character recognition augmentation before normalization.",
    createdAt: "2026-08-06", updatedAt: "2026-08-06",
  },
  {
    id: "ART-784210", title: "Payments SLO Notes",
    description: "Working notes summarizing payments service level objectives discussed in architecture review.",
    sourceId: "SRC-2001", sourceName: "Confluence Cloud", sourceCategory: "Documents",
    ingestionMethod: "Incremental Discovery", artifactType: "Design Document", format: "Markdown",
    mimeType: "text/markdown", originalFilename: "payments-slo-notes.md",
    contentSize: "84 KB", contentSizeBytes: 86_016, contentHash: "sha256:b7411e0ac5d2…19f0",
    teamId: "TEAM-01", teamName: "Payments Platform", businessUnit: "Technology",
    knowledgeDomains: ["Reliability", "Payments"], owner: "Jane Smith", authorityLevel: "Supporting",
    version: "1.4", previousVersionId: null, versionRelationship: "Original",
    accessClassification: "Internal", regulatoryScope: [],
    sourceCreatedAt: "2026-07-19", sourceModifiedAt: "2026-08-02", receivedAt: "10:02 AM",
    freshnessStatus: "Recent", ingestionStatus: "Review Required", duplicateStatus: "Possible Duplicate",
    validationScore: 81, qualityScore: 78, permissionStatus: "Preserved",
    evidenceId: "EVD-77432", batchId: "ING-20452", normalizationQueueId: null,
    environment: "Production", region: "North America", dataResidency: "United States",
    preview: "Target availability 99.95 percent. Error budget policy: freeze on 50 percent burn within seven days…",
    createdAt: "2026-08-02", updatedAt: "2026-08-06",
  },
];

export const artifactById = artifacts.reduce<Record<string, ArtifactRecord>>((a, r) => { a[r.id] = r; return a; }, {});

/* -------------------------- metadata & permissions ------------------------- */

export const artifactMetadata: Record<string, ArtifactMetadata> = {
  "ART-784221": {
    artifactId: "ART-784221", title: "Payments API Reliability Requirements", author: "Jane Smith",
    createdDate: "2026-05-14", modifiedDate: "2026-08-05", language: "English (US)",
    sections: 14, tables: 6, attachments: 2, participants: [], speakers: [],
    timestamps: "Source created and modified timestamps preserved",
    tags: ["reliability", "payments", "availability", "sla"],
  },
  "ART-784219": {
    artifactId: "ART-784219", title: "Payments Incident Review", author: "Zoom meeting recorder",
    createdDate: "2026-08-04", modifiedDate: "2026-08-04", language: "English (US)",
    sections: 1, tables: 0, attachments: 0,
    participants: ["Priya Patel", "Jane Smith", "Marcus Lee", "Site Reliability on-call"],
    speakers: ["Speaker 1", "Speaker 2", "Speaker 3"],
    timestamps: "Utterance-level timestamps preserved",
    tags: ["incident", "payments", "postmortem"],
  },
};

export const defaultMetadata = (a: ArtifactRecord): ArtifactMetadata => ({
  artifactId: a.id, title: a.title, author: a.owner,
  createdDate: a.sourceCreatedAt, modifiedDate: a.sourceModifiedAt, language: "English (US)",
  sections: 8, tables: 2, attachments: 0, participants: [], speakers: [],
  timestamps: "Source timestamps preserved", tags: a.knowledgeDomains.map((d) => d.toLowerCase()),
});

export const artifactPermissions: Record<string, ArtifactPermission> = {
  "ART-784221": {
    artifactId: "ART-784221",
    sourcePermissions: ["Payments Platform — read", "Engineering Operations — read"],
    inheritedPermissions: ["Technology business unit — read"],
    approvedConsumers: ["Payments Platform Persona", "Reliability Impact Evaluation"],
    restrictedConsumers: ["External partner personas"],
    accessClassification: "Confidential", regulatoryScope: ["PCI DSS"], permissionDrift: "None",
  },
  "ART-784219": {
    artifactId: "ART-784219",
    sourcePermissions: ["Site Reliability Engineering — read"],
    inheritedPermissions: ["Incident reviewers — read"],
    approvedConsumers: ["Reliability Persona"],
    restrictedConsumers: ["Customer Support Persona", "Vendor personas"],
    accessClassification: "Confidential", regulatoryScope: ["Internal Audit"],
    permissionDrift: "Participant list includes two members outside the approved reviewer group",
  },
  "ART-784215": {
    artifactId: "ART-784215",
    sourcePermissions: ["Customer Support — read", "Checkout Engineering — read"],
    inheritedPermissions: ["Customer Experience business unit — read"],
    approvedConsumers: ["Customer Experience Persona"],
    restrictedConsumers: ["Finance personas"],
    accessClassification: "Internal", regulatoryScope: [],
    permissionDrift: "Channel membership widened after the artifact was discovered",
  },
};

export const defaultPermission = (a: ArtifactRecord): ArtifactPermission => ({
  artifactId: a.id,
  sourcePermissions: [`${a.teamName} — read`],
  inheritedPermissions: [`${a.businessUnit} business unit — read`],
  approvedConsumers: [`${a.teamName} Persona`],
  restrictedConsumers: ["Unapproved personas"],
  accessClassification: a.accessClassification,
  regulatoryScope: a.regulatoryScope,
  permissionDrift: a.permissionStatus === "Preserved" ? "None" : a.permissionStatus,
});

/* ------------------------- duplicates and versions ------------------------- */

export const duplicateSummary = {
  unique: 2_160_000, uniqueLabel: "2.16M",
  newVersions: 62_000, newVersionsLabel: "62K",
  exactDuplicates: 18_000, exactDuplicatesLabel: "18K",
  semanticDuplicates: 642,
  conflictingVersions: 84,
  reviewRequired: 726,
};

export const duplicateCandidates: DuplicateCandidate[] = [
  {
    id: "DUP-4401", artifactId: "ART-784220", artifactTitle: "Checkout Retry Policy Update v1.2",
    candidateArtifactId: "ART-781902", candidateTitle: "Checkout Retry Policy v1.1",
    semanticSimilarity: 94, contentHashSimilarity: 12, metadataSimilarity: 88,
    relationshipType: "New Version", authorityConflict: false, ownerConflict: false,
    owner: "Marcus Lee", authority: "Supporting", reviewStatus: "Review",
    recommendedAction: "Confirm as the current version and supersede v1.1",
  },
  {
    id: "DUP-4402", artifactId: "ART-784210", artifactTitle: "Payments SLO Notes",
    candidateArtifactId: "ART-784221", candidateTitle: "Payments Reliability Requirements",
    semanticSimilarity: 86, contentHashSimilarity: 4, metadataSimilarity: 61,
    relationshipType: "Possible Duplicate", authorityConflict: true, ownerConflict: false,
    owner: "Jane Smith", authority: "Supporting", reviewStatus: "Human Review",
    recommendedAction: "Keep both and mark the requirements document as authoritative",
  },
  {
    id: "DUP-4403", artifactId: "ART-784214", artifactTitle: "Legacy Settlement Runbook",
    candidateArtifactId: "ART-770210", candidateTitle: "Settlement Operations Guide",
    semanticSimilarity: 99, contentHashSimilarity: 100, metadataSimilarity: 92,
    relationshipType: "Exact Duplicate", authorityConflict: false, ownerConflict: false,
    owner: "Engineering Operations", authority: "Historical", reviewStatus: "Auto-resolved",
    recommendedAction: "Retain as historical evidence and exclude from normalization",
  },
  {
    id: "DUP-4404", artifactId: "ART-784217", artifactTitle: "Fraud Decision Service Repository",
    candidateArtifactId: "ART-783990", candidateTitle: "Fraud Decision Service Repository (r2026.07.4)",
    semanticSimilarity: 91, contentHashSimilarity: 38, metadataSimilarity: 96,
    relationshipType: "New Version", authorityConflict: false, ownerConflict: false,
    owner: "Platform Engineering", authority: "Primary", reviewStatus: "Confirmed",
    recommendedAction: "Version confirmed. Prior snapshot retained for lineage",
  },
  {
    id: "DUP-4405", artifactId: "ART-784213", artifactTitle: "Vendor Risk Assessment Deck",
    candidateArtifactId: "ART-782771", candidateTitle: "Vendor Risk Assessment Q2",
    semanticSimilarity: 78, contentHashSimilarity: 6, metadataSimilarity: 74,
    relationshipType: "Conflicting Version", authorityConflict: true, ownerConflict: true,
    owner: "Enterprise Architecture", authority: "Unconfirmed", reviewStatus: "Human Review",
    recommendedAction: "Confirm the accountable owner before either version is trusted",
  },
];

export const artifactVersions: ArtifactVersion[] = [
  {
    id: "VER-9001", artifactFamilyId: "FAM-101", artifactId: "ART-784220",
    artifactFamilyName: "Checkout Retry Policy", version: "1.2", previousVersion: "1.1",
    changeType: "Content revision", sourceTimestamp: "2026-08-06 09:41",
    ingestedTimestamp: "2026-08-06 10:04", contentHash: "sha256:4c88ba02f19d…77ae",
    owner: "Marcus Lee", status: "Review",
  },
  {
    id: "VER-9002", artifactFamilyId: "FAM-102", artifactId: "ART-784221",
    artifactFamilyName: "Payments API Reliability Requirements", version: "3.2", previousVersion: "3.1",
    changeType: "Requirement added", sourceTimestamp: "2026-08-05 16:22",
    ingestedTimestamp: "2026-08-06 10:02", contentHash: "sha256:9f21c4a8e3b7…41d0",
    owner: "Jane Smith", status: "Confirmed",
  },
  {
    id: "VER-9003", artifactFamilyId: "FAM-103", artifactId: "ART-784217",
    artifactFamilyName: "Fraud Decision Service Repository", version: "Commit 8f4a9c", previousVersion: "Commit 61c02d",
    changeType: "Release snapshot", sourceTimestamp: "2026-08-06 08:14",
    ingestedTimestamp: "2026-08-06 09:55", contentHash: "sha256:8f4a9c1d7e22…c0f4",
    owner: "Platform Engineering", status: "Confirmed",
  },
  {
    id: "VER-9004", artifactFamilyId: "FAM-104", artifactId: "ART-784218",
    artifactFamilyName: "Identity Service OpenAPI Specification", version: "4.7", previousVersion: "4.6",
    changeType: "Interface change", sourceTimestamp: "2026-08-01 11:02",
    ingestedTimestamp: "2026-08-06 09:52", contentHash: "sha256:2ba7cc41e09f…5d6c",
    owner: "Security Engineering", status: "Blocked",
  },
  {
    id: "VER-9005", artifactFamilyId: "FAM-105", artifactId: "ART-784216",
    artifactFamilyName: "Quarterly Reliability Scorecard", version: "2.0", previousVersion: "1.9",
    changeType: "Quarterly refresh", sourceTimestamp: "2026-07-02 09:00",
    ingestedTimestamp: "2026-08-06 09:48", contentHash: "sha256:0dd41f9a7b63…22e8",
    owner: "Site Reliability Engineering", status: "Failed validation",
  },
];

/* -------------------------------- exceptions ------------------------------- */

export const exceptionCategories = [
  { type: "Corrupted or Unreadable", count: 84, severity: "High" as Severity },
  { type: "Unsupported Format", count: 212, severity: "Medium" as Severity },
  { type: "Permission Conflict", count: 418, severity: "High" as Severity },
  { type: "Missing Owner", count: 76, severity: "Medium" as Severity },
  { type: "Missing Classification", count: 19, severity: "Medium" as Severity },
  { type: "Duplicate Conflict", count: 642, severity: "Medium" as Severity },
  { type: "Stale Artifact", count: 31, severity: "Low" as Severity },
  { type: "Source Authentication Failure", count: 8_412, severity: "Critical" as Severity },
  { type: "Policy Violation", count: 42, severity: "Critical" as Severity },
];

export const exceptions: IngestionException[] = [
  {
    id: "EXC-5501", artifactId: "ART-784218", artifactTitle: "Identity Service OpenAPI Specification",
    batchId: "ING-20446", exceptionType: "Source Authentication Failure", severity: "Critical",
    description: "The Apigee connector token exchange was rejected, so 8,412 API definition records cannot be received.",
    sourceId: "SRC-2007", sourceName: "Apigee Identity Services", teamId: "TEAM-04", teamName: "Identity Engineering",
    owner: "Security Engineering", status: "Open", createdAt: "9:52 AM", age: "26 min", dueAt: "11:00 AM",
    downstreamImpact: "Identity normalization halted. 4 personas and 2 impact evaluations are running on stale evidence.",
    recommendedAction: "Reauthorize the Apigee connector, then retry the blocked batch from Authenticate Source.",
  },
  {
    id: "EXC-5502", artifactId: "ART-784219", artifactTitle: "Payments Incident Review",
    batchId: "ING-20449", exceptionType: "Permission Conflict", severity: "High",
    description: "Transcript participants include members outside the approved reviewer group recorded on the source.",
    sourceId: "SRC-2004", sourceName: "Zoom Transcripts", teamId: "TEAM-03", teamName: "Site Reliability Engineering",
    owner: "Priya Patel", status: "Investigating", createdAt: "9:57 AM", age: "21 min", dueAt: "12:00 PM",
    downstreamImpact: "Reliability persona cannot cite the incident review until the permission scope is validated.",
    recommendedAction: "Validate the permission scope against the source meeting record and release or restrict.",
  },
  {
    id: "EXC-5503", artifactId: "ART-784216", artifactTitle: "Quarterly Reliability Scorecard",
    batchId: "ING-20452", exceptionType: "Corrupted or Unreadable", severity: "High",
    description: "The workbook stream ended unexpectedly at sheet three during capture.",
    sourceId: "SRC-2008", sourceName: "Google Drive", teamId: "TEAM-03", teamName: "Site Reliability Engineering",
    owner: "Site Reliability Engineering", status: "Open", createdAt: "9:48 AM", age: "30 min", dueAt: "2:00 PM",
    downstreamImpact: "Quarterly reliability evidence unavailable for the reliability impact evaluation.",
    recommendedAction: "Retry capture from Receive. If the source file is damaged, request augmentation from the owner.",
  },
  {
    id: "EXC-5504", artifactId: "ART-784211", artifactTitle: "Scanned Settlement Agreement",
    batchId: "ING-20452", exceptionType: "Unsupported Format", severity: "Medium",
    description: "Multi-page TIFF has no text layer and cannot be normalized without optical character recognition.",
    sourceId: "SRC-2009", sourceName: "Manual Submission", teamId: "TEAM-01", teamName: "Payments Platform",
    owner: "Engineering Operations", status: "Open", createdAt: "10:06 AM", age: "12 min", dueAt: "Tomorrow",
    downstreamImpact: "Contract evidence unavailable to the payments persona.",
    recommendedAction: "Request augmentation to add a recognized text layer, then reprocess from Extract Metadata.",
  },
  {
    id: "EXC-5505", artifactId: "ART-784213", artifactTitle: "Vendor Risk Assessment Deck",
    batchId: "ING-20452", exceptionType: "Policy Violation", severity: "Critical",
    description: "Highly restricted content submitted manually without an approved consumer list.",
    sourceId: "SRC-2009", sourceName: "Manual Submission", teamId: "TEAM-07", teamName: "Enterprise Architecture",
    owner: "Enterprise Architecture", status: "Quarantined", createdAt: "10:03 AM", age: "15 min", dueAt: "11:30 AM",
    downstreamImpact: "Held before any persona or decision can reference the content.",
    recommendedAction: "Confirm the accountable owner and approved consumers, then release from quarantine or reject.",
  },
  {
    id: "EXC-5506", artifactId: "ART-784214", artifactTitle: "Legacy Settlement Runbook",
    batchId: "ING-20452", exceptionType: "Stale Artifact", severity: "Low",
    description: "Artifact has not changed at the source in over two years and is superseded by a current guide.",
    sourceId: "SRC-2001", sourceName: "Confluence Cloud", teamId: "TEAM-01", teamName: "Payments Platform",
    owner: "Engineering Operations", status: "Acknowledged", createdAt: "9:41 AM", age: "37 min", dueAt: "Next review",
    downstreamImpact: "None. Retained as historical evidence only.",
    recommendedAction: "Retain as historical evidence and exclude from normalization.",
  },
  {
    id: "EXC-5507", artifactId: "ART-784210", artifactTitle: "Payments SLO Notes",
    batchId: "ING-20452", exceptionType: "Duplicate Conflict", severity: "Medium",
    description: "86 percent semantic similarity to the authoritative payments reliability requirements.",
    sourceId: "SRC-2001", sourceName: "Confluence Cloud", teamId: "TEAM-01", teamName: "Payments Platform",
    owner: "Jane Smith", status: "Open", createdAt: "10:02 AM", age: "16 min", dueAt: "3:00 PM",
    downstreamImpact: "Risk of conflicting reliability targets reaching the payments persona.",
    recommendedAction: "Keep both and mark the requirements document as the authoritative source.",
  },
  {
    id: "EXC-5508", artifactId: "ART-784215", artifactTitle: "Customer Escalation Thread — Checkout Failures",
    batchId: "ING-20450", exceptionType: "Permission Conflict", severity: "High",
    description: "Channel membership widened after discovery, so observed access exceeds the expected scope.",
    sourceId: "SRC-2003", sourceName: "Slack Enterprise", teamId: "TEAM-06", teamName: "Customer Support",
    owner: "Customer Support", status: "Open", createdAt: "10:14 AM", age: "4 min", dueAt: "1:00 PM",
    downstreamImpact: "Customer experience persona cannot cite the escalation until access is validated.",
    recommendedAction: "Validate the channel permission scope and restore the approved membership boundary.",
  },
];

/* ------------------------------- quality data ------------------------------ */

export const qualityMetrics = [
  { name: "Original Artifact Preservation", current: 99.8, target: 99.5, trend: [99.6, 99.7, 99.7, 99.8, 99.8, 99.8], affected: 4_800, status: "Healthy" },
  { name: "Metadata Completeness", current: 96, target: 97, trend: [97, 96.8, 96.4, 96.2, 96, 96], affected: 96_000, status: "Warning" },
  { name: "Permission Preservation", current: 94, target: 98, trend: [97.4, 96.8, 96, 95.2, 94.6, 94], affected: 144_000, status: "Warning" },
  { name: "Version Detection Accuracy", current: 97, target: 96, trend: [96.4, 96.6, 96.8, 97, 97, 97], affected: 72_000, status: "Healthy" },
  { name: "Duplicate Detection Confidence", current: 92, target: 94, trend: [93.6, 93.2, 92.8, 92.4, 92.1, 92], affected: 192_000, status: "Warning" },
  { name: "Artifact Validation Pass Rate", current: 97.6, target: 98, trend: [98.2, 98, 97.9, 97.8, 97.7, 97.6], affected: 57_600, status: "Warning" },
  { name: "Evidence Registration Integrity", current: 99.2, target: 99, trend: [99.1, 99.1, 99.2, 99.2, 99.2, 99.2], affected: 19_200, status: "Healthy" },
];

export const qualityDetail: Record<string, { drivers: string[]; affectedSources: string[]; remediation: string[] }> = {
  "Permission Preservation": {
    drivers: [
      "Slack channel membership changed after discovery for 284 artifacts",
      "Zoom transcripts include participants outside the approved reviewer group",
      "Apigee scheduled batch blocked before permissions could be captured",
    ],
    affectedSources: ["Slack Enterprise", "Zoom Transcripts", "Apigee Identity Services"],
    remediation: [
      "Validate permission scope for the 418 artifacts awaiting review",
      "Restore the approved channel membership boundary in Slack",
      "Reauthorize the Apigee connector and retry the blocked batch",
    ],
  },
};

/* ------------------------------- provenance -------------------------------- */

export const provenanceMetrics = [
  { label: "Artifacts with Complete Provenance", value: 98 },
  { label: "Artifacts with Verified Owners", value: 94 },
  { label: "Artifacts with Source Permissions Preserved", value: 95 },
  { label: "Artifacts with Immutable Evidence IDs", value: 100 },
  { label: "Artifacts with Version History", value: 91 },
];

export const lineageChain = [
  { label: "Source System", value: "Confluence Cloud", detail: "Connector CON-2001 · authenticated 10:01 AM" },
  { label: "Source Space", value: "Engineering Knowledge Base", detail: "Space owner Engineering Operations" },
  { label: "Discovery Run", value: "DISC-4921", detail: "Incremental discovery started 10:00 AM" },
  { label: "Ingestion Batch", value: "ING-20452", detail: "124,532 artifacts · Extract Metadata" },
  { label: "Evidence Vault Record", value: "EVD-77421", detail: "Immutable evidence ID issued 10:02 AM" },
  { label: "Normalization Queue", value: "NRM-8291", detail: "Queued 10:03 AM · priority Standard" },
];

export const lineageFacts = {
  sourceTimestamp: "2026-08-05 16:22",
  ingestionTimestamp: "2026-08-06 10:02",
  contentHash: "sha256:9f21c4a8e3b7…41d0",
  owner: "Jane Smith",
  accessClassification: "Confidential" as AccessClassification,
  version: "3.2",
  status: "Evidence registered and queued for normalization",
};

export const evidenceRecords: EvidenceRecord[] = artifacts.map((a) => ({
  id: a.evidenceId, artifactId: a.id, sourceId: a.sourceId, connectorId: `CON-${2000 + Number(a.sourceId.slice(-1))}`,
  discoveryRunId: "DISC-4921", ingestionBatchId: a.batchId, immutableEvidenceId: `${a.evidenceId}-IMM`,
  contentHash: a.contentHash, sourceIdentifier: `${a.sourceName}/${a.originalFilename}`, version: a.version,
  owner: a.owner, accessClassification: a.accessClassification, receivedAt: a.receivedAt,
  evidenceVaultLocation: `vault://ecf/evidence/${a.evidenceId.toLowerCase()}`,
}));

/* --------------------------- access & classification ----------------------- */

export const accessDistribution = [
  { label: "Public", value: 8, color: "#94a3b8" },
  { label: "Internal", value: 46, color: "#2563eb" },
  { label: "Confidential", value: 29, color: "#0891b2" },
  { label: "Restricted", value: 14, color: "#d97706" },
  { label: "Highly Restricted", value: 3, color: "#dc2626" },
];

export const accessSummary = {
  permissionsPreserved: 95,
  permissionReviewsPending: 418,
  permissionConflicts: 26,
  restrictedQuarantined: 42,
  classificationMissing: 19,
};

export const permissionReviews = [
  {
    artifactId: "ART-784219", artifact: "Payments Incident Review", source: "Zoom Transcripts",
    expected: "Site Reliability Engineering — read", observed: "Site Reliability Engineering plus two external reviewers",
    conflict: "Scope widened", owner: "Priya Patel", action: "Validate Permission",
  },
  {
    artifactId: "ART-784215", artifact: "Customer Escalation Thread", source: "Slack Enterprise",
    expected: "Customer Support — read", observed: "Customer Support plus Finance channel members",
    conflict: "Scope widened", owner: "Customer Support", action: "Validate Permission",
  },
  {
    artifactId: "ART-784213", artifact: "Vendor Risk Assessment Deck", source: "Manual Submission",
    expected: "Approved consumer list required", observed: "No approved consumers declared",
    conflict: "Missing declaration", owner: "Enterprise Architecture", action: "Apply Classification",
  },
  {
    artifactId: "ART-784218", artifact: "Identity Service OpenAPI Specification", source: "Apigee",
    expected: "Security Engineering — read", observed: "Not captured, source authentication failed",
    conflict: "Not captured", owner: "Security Engineering", action: "Retry",
  },
];

/* ------------------------------- composition ------------------------------- */

export const artifactTypeComposition = [
  { label: "Documents", value: 32, color: "#2563eb" },
  { label: "Tickets", value: 18, color: "#0891b2" },
  { label: "Chat Messages", value: 14, color: "#7c3aed" },
  { label: "Meeting Transcripts", value: 7, color: "#db2777" },
  { label: "Code Assets", value: 9, color: "#059669" },
  { label: "API Definitions", value: 6, color: "#d97706" },
  { label: "Telemetry Records", value: 14, color: "#475569" },
];

export const formatComposition = [
  { label: "PDF", value: 18, color: "#2563eb" }, { label: "DOCX", value: 11, color: "#1d4ed8" },
  { label: "XLSX", value: 7, color: "#0891b2" }, { label: "PPTX", value: 4, color: "#0e7490" },
  { label: "HTML", value: 6, color: "#7c3aed" }, { label: "JSON", value: 15, color: "#059669" },
  { label: "XML", value: 3, color: "#047857" }, { label: "CSV", value: 5, color: "#65a30d" },
  { label: "Markdown", value: 8, color: "#ca8a04" }, { label: "VTT", value: 6, color: "#db2777" },
  { label: "TXT", value: 4, color: "#9333ea" }, { label: "YAML", value: 3, color: "#0d9488" },
  { label: "Images", value: 5, color: "#d97706" }, { label: "Audio", value: 3, color: "#dc2626" },
  { label: "Other", value: 2, color: "#94a3b8" },
];

/* ----------------------------- throughput series --------------------------- */

export type ThroughputMetric = "Throughput" | "Queue Depth" | "Processing Time" | "Failure Rate";

export const throughputRanges = ["Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days"];

const pointCount = (range: string) => (range === "Last hour" ? 12 : range === "Last 6 hours" ? 12 : range === "Last 24 hours" ? 12 : 14);

export function throughputSeries(metric: ThroughputMetric, range: string, degraded: boolean) {
  const n = pointCount(range);
  const label = (i: number) =>
    range === "Last 7 days" ? `D-${n - i}` : range === "Last 24 hours" ? `${(i * 2) % 24}:00` : `T-${n - i}`;
  const data = Array.from({ length: n }, (_, i) => {
    const wave = Math.sin(i / 2.2) * 0.12 + Math.cos(i / 3.4) * 0.06;
    const drag = degraded ? 1 - i / (n * 2.6) : 1;
    if (metric === "Queue Depth") {
      return {
        t: label(i),
        received: Math.round((38_000 + wave * 9_000) * (degraded ? 1.5 : 1)),
        registered: Math.round((35_500 + wave * 8_000) * (degraded ? 1.2 : 1)),
        queued: Math.round((42_318 + wave * 6_000) * (degraded ? 1.6 : 1)),
      };
    }
    if (metric === "Processing Time") {
      return {
        t: label(i),
        received: Math.round((46 + wave * 12) / (degraded ? 0.55 : 1)),
        registered: Math.round((18 + wave * 6) / (degraded ? 0.7 : 1)),
        queued: Math.round((11 + wave * 4) / (degraded ? 0.8 : 1)),
      };
    }
    if (metric === "Failure Rate") {
      return {
        t: label(i),
        received: Number(((1.3 + wave * 0.6) * (degraded ? 3.1 : 1)).toFixed(2)),
        registered: Number(((0.8 + wave * 0.4) * (degraded ? 2.6 : 1)).toFixed(2)),
        queued: Number(((0.4 + wave * 0.2) * (degraded ? 2.2 : 1)).toFixed(2)),
      };
    }
    return {
      t: label(i),
      received: Math.round((8_400 + wave * 1_400) * drag),
      registered: Math.round((6_180 + wave * 1_100) * drag),
      queued: Math.round((6_050 + wave * 900) * drag),
    };
  });
  const target = metric === "Throughput" ? 6_000 : metric === "Queue Depth" ? 45_000 : metric === "Processing Time" ? 60 : 2;
  const unit = metric === "Throughput" ? " artifacts/min" : metric === "Queue Depth" ? " artifacts" : metric === "Processing Time" ? " s" : "%";
  return { data, target, unit };
}

export const queueByStage = stages.map((s) => ({ stage: s.name, depth: s.pendingCount }));

/* ------------------------------- readiness --------------------------------- */

export const readiness: NormalizationReadiness = {
  readyCount: 2_200_000,
  humanReviewCount: 1_482,
  permissionBlockedCount: 418,
  quarantinedCount: 126,
  unsupportedCount: 296,
  duplicateReviewCount: 642,
};

/* -------------------------------- activity --------------------------------- */

export const seedActivity: IngestionActivity[] = [
  {
    id: "ACT-9001", timestamp: "10:22 AM", action: "Batch received artifacts",
    description: "Confluence batch received 4,218 new artifacts.", artifactId: null, batchId: "ING-20452",
    sourceId: "SRC-2001", sourceName: "Confluence Cloud", teamName: "Payments Platform",
    result: "Success", owner: "Engineering Operations", auditId: "AUD-4821",
  },
  {
    id: "ACT-9002", timestamp: "10:18 AM", action: "New version detected",
    description: "New version detected for Checkout Retry Policy.", artifactId: "ART-784220", batchId: "ING-20452",
    sourceId: "SRC-2008", sourceName: "Google Drive", teamName: "Checkout Engineering",
    result: "Review", owner: "Marcus Lee", auditId: "AUD-4822",
  },
  {
    id: "ACT-9003", timestamp: "10:14 AM", action: "Permission warning created",
    description: "Slack permission preservation warning created.", artifactId: "ART-784215", batchId: "ING-20450",
    sourceId: "SRC-2003", sourceName: "Slack Enterprise", teamName: "Customer Support",
    result: "Warning", owner: "Customer Support", auditId: "AUD-4823",
  },
  {
    id: "ACT-9004", timestamp: "10:09 AM", action: "Batch queued for normalization",
    description: "GitHub batch queued for normalization.", artifactId: null, batchId: "ING-20448",
    sourceId: "SRC-2005", sourceName: "GitHub Enterprise", teamName: "Fraud Engineering",
    result: "Success", owner: "Platform Engineering", auditId: "AUD-4824",
  },
  {
    id: "ACT-9005", timestamp: "10:06 AM", action: "Released from quarantine",
    description: "Zoom transcript released from quarantine after permission validation.", artifactId: "ART-784219",
    batchId: "ING-20449", sourceId: "SRC-2004", sourceName: "Zoom Transcripts",
    teamName: "Site Reliability Engineering", result: "Success", owner: "Priya Patel", auditId: "AUD-4825",
  },
  {
    id: "ACT-9006", timestamp: "10:03 AM", action: "Manual artifact upload submitted",
    description: "Manual artifact upload submitted by Product Operations.", artifactId: "ART-784213",
    batchId: "ING-20452", sourceId: "SRC-2009", sourceName: "Manual Submission",
    teamName: "Enterprise Architecture", result: "Review", owner: "Product Operations", auditId: "AUD-4826",
  },
  {
    id: "ACT-9007", timestamp: "9:58 AM", action: "Batch blocked",
    description: "Apigee batch blocked by authentication failure.", artifactId: null, batchId: "ING-20446",
    sourceId: "SRC-2007", sourceName: "Apigee Identity Services", teamName: "Identity Engineering",
    result: "Failure", owner: "Security Engineering", auditId: "AUD-4827",
  },
];

export const seedNotifications: IngestionNotification[] = [
  { id: "NTF-1", category: "Batch failed", title: "Apigee batch blocked", detail: "ING-20446 blocked at Authenticate Source.", severity: "Critical", timestamp: "9:58 AM", read: false, batchId: "ING-20446" },
  { id: "NTF-2", category: "Permission conflict", title: "Slack permission drift", detail: "284 artifacts awaiting permission validation.", severity: "High", timestamp: "10:14 AM", read: false, batchId: "ING-20450" },
  { id: "NTF-3", category: "Duplicate detected", title: "Possible duplicate for Payments", detail: "Payments SLO Notes is 86 percent similar to the reliability requirements.", severity: "Medium", timestamp: "10:02 AM", read: false, artifactId: "ART-784210" },
  { id: "NTF-4", category: "New version detected", title: "Checkout Retry Policy v1.2", detail: "New version supersedes v1.1 pending confirmation.", severity: "Medium", timestamp: "10:18 AM", read: false, artifactId: "ART-784220" },
  { id: "NTF-5", category: "Artifact quarantined", title: "Vendor Risk Assessment Deck", detail: "Highly restricted manual submission held for policy review.", severity: "Critical", timestamp: "10:03 AM", read: false, artifactId: "ART-784213" },
  { id: "NTF-6", category: "Unsupported format", title: "Scanned Settlement Agreement", detail: "TIFF without a text layer requires augmentation.", severity: "Medium", timestamp: "10:06 AM", read: true, artifactId: "ART-784211" },
  { id: "NTF-7", category: "Artifact validation failed", title: "Quarterly Reliability Scorecard", detail: "Workbook stream ended unexpectedly during capture.", severity: "High", timestamp: "9:48 AM", read: true, artifactId: "ART-784216" },
  { id: "NTF-8", category: "Normalization queue threshold exceeded", title: "Queue at 42,318 artifacts", detail: "Queue depth is within capacity but trending upward.", severity: "Low", timestamp: "10:20 AM", read: true },
  { id: "NTF-9", category: "Manual upload review requested", title: "Product Operations submission", detail: "Manual submission requires owner confirmation.", severity: "Medium", timestamp: "10:03 AM", read: true, artifactId: "ART-784213" },
  { id: "NTF-10", category: "Batch completed", title: "GitHub batch queued", detail: "ING-20448 completed and queued for normalization.", severity: "Low", timestamp: "10:09 AM", read: true, batchId: "ING-20448" },
];

/* ---------------------------------- KPIs ----------------------------------- */

export const kpiTrends = {
  received: [2.21, 2.24, 2.27, 2.3, 2.33, 2.36, 2.38, 2.4],
  batches: [14, 15, 16, 16, 17, 18, 18, 18],
  queue: [36_100, 37_400, 38_900, 39_800, 40_600, 41_400, 42_000, 42_318],
  success: [98.9, 98.9, 98.8, 98.8, 98.7, 98.7, 98.7, 98.7],
  ready: [2.02, 2.06, 2.1, 2.13, 2.16, 2.18, 2.19, 2.2],
  action: [1_180, 1_240, 1_290, 1_340, 1_390, 1_430, 1_460, 1_482],
};

/* -------------------------------- scenarios -------------------------------- */

export type DemoScenario =
  | "healthy" | "surge" | "permission-conflict" | "duplicate-spike" | "new-version"
  | "unsupported-format" | "corrupted-artifact" | "restricted-quarantine"
  | "source-auth-failure" | "manual-upload-review" | "queue-backlog" | "paused" | "reset";

export interface ScenarioSnapshot {
  ingestionState: IngestionState;
  banner?: string;
  artifactsReceived: string;
  artifactsReceivedChange: string;
  activeBatches: number;
  batchesHealthy: number;
  batchesWarning: number;
  batchesBlocked: number;
  queueDepth: number;
  queueChange: string;
  queueStatus: string;
  successRate: number;
  readyLabel: string;
  readyPercent: number;
  requiringAction: number;
  quarantined: number;
  duplicateReview: number;
  permissionReview: number;
  unsupported: number;
  focusPanel?: string;
  highlightBatchIds: string[];
  highlightArtifactIds: string[];
  stageOverrides: Record<string, Partial<IngestionStage>>;
  batchOverrides: Record<string, Partial<IngestionBatch>>;
  artifactOverrides: Record<string, Partial<ArtifactRecord>>;
  degradedCharts: boolean;
  extraActivity?: IngestionActivity;
  extraNotification?: IngestionNotification;
}

const baseSnapshot: ScenarioSnapshot = {
  ingestionState: "Operational",
  artifactsReceived: "2.4M", artifactsReceivedChange: "+124K this week",
  activeBatches: 18, batchesHealthy: 15, batchesWarning: 2, batchesBlocked: 1,
  queueDepth: 42_318, queueChange: "+8% versus last hour", queueStatus: "Within Capacity",
  successRate: 98.7, readyLabel: "2.2M", readyPercent: 91,
  requiringAction: 1_482, quarantined: 126, duplicateReview: 642, permissionReview: 418, unsupported: 296,
  highlightBatchIds: [], highlightArtifactIds: [],
  stageOverrides: {}, batchOverrides: {}, artifactOverrides: {},
  degradedCharts: false,
};

export const scenarioSnapshots: Record<DemoScenario, ScenarioSnapshot> = {
  healthy: { ...baseSnapshot },
  reset: { ...baseSnapshot },
  surge: {
    ...baseSnapshot, ingestionState: "Running",
    banner: "High volume surge. Telemetry and chat sources are delivering above the normal operating band.",
    artifactsReceived: "2.9M", artifactsReceivedChange: "+512K this week",
    activeBatches: 24, batchesHealthy: 20, batchesWarning: 3, batchesBlocked: 1,
    queueDepth: 96_420, queueChange: "+118% versus last hour", queueStatus: "Above Capacity",
    successRate: 97.9, readyLabel: "2.6M", readyPercent: 88,
    focusPanel: "panel-throughput", highlightBatchIds: ["ING-20447", "ING-20450"],
    stageOverrides: { receive: { pendingCount: 62_000, throughput: "14,200 artifacts/min" }, queue: { pendingCount: 96_420 } },
    batchOverrides: { "ING-20447": { artifactCount: 2_408_112, queueDepth: 48_900, warningCount: 2, status: "Warning" } },
    artifactOverrides: {}, degradedCharts: false,
  },
  "permission-conflict": {
    ...baseSnapshot, ingestionState: "Degraded",
    banner: "Permission preservation is failing for Slack and Zoom sources. Artifacts are held before normalization.",
    successRate: 97.1, requiringAction: 2_140, permissionReview: 1_082,
    focusPanel: "panel-access", highlightArtifactIds: ["ART-784219", "ART-784215"],
    stageOverrides: { permissions: { status: "Warning", successRate: 94.2, failedCount: 9, warningCount: 12, pendingCount: 58_000 } },
    batchOverrides: { "ING-20450": { status: "Warning", warningCount: 7, permissionReviewCount: 782, successRate: 94.1 } },
    artifactOverrides: {
      "ART-784215": { ingestionStatus: "Permission Review", permissionStatus: "Channel permission drift detected", validationScore: 68 },
      "ART-784219": { ingestionStatus: "Permission Review", validationScore: 74 },
    },
    degradedCharts: false,
  },
  "duplicate-spike": {
    ...baseSnapshot, ingestionState: "Running",
    banner: "Duplicate review queue elevated. Historical backfill is producing a high candidate match rate.",
    requiringAction: 3_260, duplicateReview: 2_418,
    focusPanel: "panel-duplicates", highlightArtifactIds: ["ART-784210", "ART-784214"],
    stageOverrides: { duplicate: { status: "Warning", pendingCount: 118_000, successRate: 96.1, warningCount: 9 } },
    batchOverrides: {}, artifactOverrides: {
      "ART-784210": { duplicateStatus: "Possible Duplicate", ingestionStatus: "Review Required" },
      "ART-784214": { duplicateStatus: "Exact Duplicate" },
    },
    degradedCharts: false,
  },
  "new-version": {
    ...baseSnapshot, ingestionState: "Operational",
    banner: "New authoritative version detected for Checkout Retry Policy. Prior version retained for lineage.",
    focusPanel: "panel-duplicates", highlightArtifactIds: ["ART-784220"],
    stageOverrides: {}, batchOverrides: {},
    artifactOverrides: { "ART-784220": { duplicateStatus: "Version Update", ingestionStatus: "Review Required", version: "1.2" } },
    degradedCharts: false,
  },
  "unsupported-format": {
    ...baseSnapshot, ingestionState: "Running",
    banner: "Unsupported format volume increased. Scanned images without a text layer cannot be normalized.",
    requiringAction: 1_894, unsupported: 708,
    focusPanel: "panel-exceptions", highlightArtifactIds: ["ART-784211"],
    stageOverrides: { validate: { status: "Warning", failedCount: 9, warningCount: 11 } },
    batchOverrides: {}, artifactOverrides: { "ART-784211": { ingestionStatus: "Unsupported", validationScore: 44 } },
    degradedCharts: false,
  },
  "corrupted-artifact": {
    ...baseSnapshot, ingestionState: "Degraded",
    banner: "Corrupted artifacts detected during capture. Affected spreadsheets are held for retry.",
    requiringAction: 1_712, successRate: 97.4,
    focusPanel: "panel-exceptions", highlightArtifactIds: ["ART-784216"],
    stageOverrides: { capture: { status: "Warning", failedCount: 6, successRate: 97.2 }, validate: { status: "Warning", failedCount: 8 } },
    batchOverrides: { "ING-20452": { status: "Warning", warningCount: 4, failedCount: 214, successRate: 97.6 } },
    artifactOverrides: { "ART-784216": { ingestionStatus: "Corrupted", validationScore: 32 } },
    degradedCharts: true,
  },
  "restricted-quarantine": {
    ...baseSnapshot, ingestionState: "Running",
    banner: "Highly restricted content quarantined before it can reach any persona or decision.",
    quarantined: 428, requiringAction: 1_784,
    focusPanel: "panel-exceptions", highlightArtifactIds: ["ART-784213"],
    stageOverrides: {}, batchOverrides: {},
    artifactOverrides: { "ART-784213": { ingestionStatus: "Quarantined", accessClassification: "Highly Restricted" } },
    degradedCharts: false,
  },
  "source-auth-failure": {
    ...baseSnapshot, ingestionState: "Degraded",
    banner: "Apigee source authentication failed. 8,412 API definition records are blocked at intake.",
    activeBatches: 18, batchesHealthy: 14, batchesWarning: 2, batchesBlocked: 2,
    successRate: 96.2, requiringAction: 9_894,
    focusPanel: "panel-lifecycle", highlightBatchIds: ["ING-20446"], highlightArtifactIds: ["ART-784218"],
    stageOverrides: { authenticate: { status: "Blocked", failedCount: 12, successRate: 94.1, pendingCount: 46_000 } },
    batchOverrides: { "ING-20446": { status: "Blocked", warningCount: 6, successRate: 84.2 } },
    artifactOverrides: { "ART-784218": { ingestionStatus: "Blocked", validationScore: 61 } },
    degradedCharts: true,
  },
  "manual-upload-review": {
    ...baseSnapshot, ingestionState: "Operational",
    banner: "Manual submission awaiting owner and classification confirmation before it enters the lifecycle.",
    requiringAction: 1_506,
    focusPanel: "panel-queue", highlightArtifactIds: ["ART-784213", "ART-784211"],
    stageOverrides: {}, batchOverrides: {},
    artifactOverrides: {}, degradedCharts: false,
  },
  "queue-backlog": {
    ...baseSnapshot, ingestionState: "Backlogged",
    banner: "Normalization queue backlogged. Downstream persona freshness will degrade if the backlog persists.",
    queueDepth: 184_920, queueChange: "+337% versus last hour", queueStatus: "Backlogged",
    successRate: 98.1, readyPercent: 84,
    focusPanel: "panel-throughput",
    stageOverrides: { queue: { status: "Warning", pendingCount: 184_920, throughput: "3,120 artifacts/min", slaStatus: "Breached" } },
    batchOverrides: {}, artifactOverrides: {}, degradedCharts: true,
  },
  paused: {
    ...baseSnapshot, ingestionState: "Paused",
    banner: "Intake paused. Work already in flight is draining and no new artifacts are being accepted.",
    activeBatches: 0, batchesHealthy: 0, batchesWarning: 0, batchesBlocked: 0,
    queueStatus: "Draining", successRate: 98.7,
    focusPanel: "panel-batches",
    stageOverrides: Object.fromEntries(stages.map((s) => [s.id, { status: "Paused" as StageStatus }])),
    batchOverrides: Object.fromEntries(batches.map((b) => [b.id, { status: "Paused" as BatchStatus }])),
    artifactOverrides: {}, degradedCharts: false,
  },
};

export const demoScenarios: { id: DemoScenario; label: string }[] = [
  { id: "healthy", label: "Healthy Ingestion" },
  { id: "surge", label: "High Volume Surge" },
  { id: "permission-conflict", label: "Permission Conflict" },
  { id: "duplicate-spike", label: "Duplicate Spike" },
  { id: "new-version", label: "New Version Detected" },
  { id: "unsupported-format", label: "Unsupported Format" },
  { id: "corrupted-artifact", label: "Corrupted Artifact" },
  { id: "restricted-quarantine", label: "Restricted Content Quarantine" },
  { id: "source-auth-failure", label: "Source Authentication Failure" },
  { id: "manual-upload-review", label: "Manual Upload Review" },
  { id: "queue-backlog", label: "Queue Backlog" },
  { id: "paused", label: "Intake Paused" },
  { id: "reset", label: "Reset Demo Data" },
];

/* -------------------------------- resolvers -------------------------------- */

export function matchesFilters(a: ArtifactRecord, f: Filters) {
  const eq = (v: string, x: string) => v === "All" || v === x;
  return (
    eq(f.businessUnit, a.businessUnit) &&
    eq(f.team, a.teamName) &&
    (f.knowledgeDomain === "All" || a.knowledgeDomains.includes(f.knowledgeDomain)) &&
    eq(f.sourceCategory, a.sourceCategory) &&
    eq(f.sourcePlatform, a.sourceName) &&
    eq(f.artifactType, a.artifactType) &&
    eq(f.format, a.format) &&
    eq(f.ingestionMethod, a.ingestionMethod) &&
    eq(f.artifactStatus, a.ingestionStatus) &&
    eq(f.owner, a.owner) &&
    eq(f.accessClassification, a.accessClassification) &&
    eq(f.authorityLevel, a.authorityLevel) &&
    eq(f.freshness, a.freshnessStatus) &&
    eq(f.duplicateStatus, a.duplicateStatus) &&
    (f.validationStatus === "All"
      || (f.validationStatus === "Passed" && a.validationScore >= 90)
      || (f.validationStatus === "Warning" && a.validationScore >= 70 && a.validationScore < 90)
      || (f.validationStatus === "Failed" && a.validationScore < 70)) &&
    eq(f.environment, a.environment) &&
    eq(f.region, a.region) &&
    eq(f.dataResidency, a.dataResidency)
  );
}

export function matchesBatchFilters(b: IngestionBatch, f: Filters) {
  const eq = (v: string, x: string) => v === "All" || v === x;
  return (
    eq(f.sourceCategory, b.sourceCategory) &&
    eq(f.sourcePlatform, b.sourceName) &&
    eq(f.ingestionMethod, b.ingestionMethod) &&
    eq(f.batchStatus, b.status) &&
    eq(f.owner, b.owner) &&
    eq(f.accessClassification, b.accessClassification)
  );
}

export function resolveStages(scenario: DemoScenario, overrides: Record<string, Partial<IngestionStage>>): IngestionStage[] {
  const snap = scenarioSnapshots[scenario];
  return stages.map((s) => ({ ...s, ...(snap.stageOverrides[s.id] ?? {}), ...(overrides[s.id] ?? {}) }));
}

export function resolveBatches(
  scenario: DemoScenario, filters: Filters,
  overrides: Record<string, Partial<IngestionBatch>>, extra: IngestionBatch[],
): IngestionBatch[] {
  const snap = scenarioSnapshots[scenario];
  return [...extra, ...batches]
    .map((b) => ({ ...b, ...(snap.batchOverrides[b.id] ?? {}), ...(overrides[b.id] ?? {}) }))
    .filter((b) => matchesBatchFilters(b, filters));
}

export function resolveArtifacts(
  scenario: DemoScenario, filters: Filters,
  overrides: Record<string, Partial<ArtifactRecord>>, extra: ArtifactRecord[],
): ArtifactRecord[] {
  const snap = scenarioSnapshots[scenario];
  return [...extra, ...artifacts]
    .map((a) => ({ ...a, ...(snap.artifactOverrides[a.id] ?? {}), ...(overrides[a.id] ?? {}) }))
    .filter((a) => matchesFilters(a, filters));
}

export function resolveActivity(scenario: DemoScenario, extra: IngestionActivity[]): IngestionActivity[] {
  const snap = scenarioSnapshots[scenario];
  return [...extra, ...(snap.extraActivity ? [snap.extraActivity] : []), ...seedActivity];
}

export function resolveExceptions(scenario: DemoScenario, statuses: Record<string, string>): IngestionException[] {
  const list = scenario === "healthy" || scenario === "reset"
    ? exceptions.filter((e) => e.severity !== "Critical")
    : exceptions;
  return list.map((e) => ({ ...e, status: statuses[e.id] ?? e.status }));
}

/* ------------------------------ search catalog ----------------------------- */

export const searchCatalog: {
  id: string; type: string; title: string; source: string; team: string; status: string;
  owner: string; validationScore: number | null;
}[] = [
  ...artifacts.map((a) => ({
    id: a.id, type: "Artifact", title: a.title, source: a.sourceName, team: a.teamName,
    status: a.ingestionStatus, owner: a.owner, validationScore: a.validationScore,
  })),
  ...batches.map((b) => ({
    id: b.id, type: "Batch", title: `${b.sourceName} ${b.ingestionMethod} batch`, source: b.sourceName,
    team: b.owner, status: b.status, owner: b.owner, validationScore: null,
  })),
  ...duplicateCandidates.map((d) => ({
    id: d.id, type: "Duplicate", title: `${d.artifactTitle} vs ${d.candidateTitle}`, source: "Duplicate detection",
    team: "Knowledge Operations", status: d.reviewStatus, owner: d.owner, validationScore: d.semanticSimilarity,
  })),
  ...artifactVersions.map((v) => ({
    id: v.id, type: "Version", title: `${v.artifactFamilyName} ${v.version}`, source: "Version detection",
    team: "Knowledge Operations", status: v.status, owner: v.owner, validationScore: null,
  })),
  ...evidenceRecords.slice(0, 6).map((e) => ({
    id: e.id, type: "Evidence Record", title: `${e.immutableEvidenceId}`, source: e.sourceIdentifier,
    team: "Evidence Operations", status: "Registered", owner: e.owner, validationScore: null,
  })),
  ...exceptions.map((e) => ({
    id: e.id, type: e.status === "Quarantined" ? "Quarantine Record" : "Exception", title: `${e.exceptionType} — ${e.artifactTitle}`,
    source: e.sourceName, team: e.teamName, status: e.status, owner: e.owner, validationScore: null,
  })),
];

export const sidebarStatus = {
  service: "Operational",
  activeBatches: 18,
  queued: 42_318,
  quarantined: 126,
};

export const uploadFormats = [
  "PDF", "DOCX", "XLSX", "PPTX", "CSV", "JSON", "XML", "YAML", "Markdown", "TXT", "VTT", "Images", "Audio metadata",
];

export function makeManualArtifact(input: {
  title: string; description: string; sourceName: string; teamName: string; businessUnit: string;
  knowledgeDomain: string; owner: string; authorityLevel: AuthorityLevel; accessClassification: AccessClassification;
  artifactType: string; format: string; version: string; tags: string[]; index: number; batchId: string;
}): ArtifactRecord {
  const id = `ART-79${100 + input.index}`;
  return {
    ...artifacts[0],
    id,
    title: input.title,
    description: input.description || "Manually submitted artifact awaiting review.",
    sourceId: "SRC-2009", sourceName: input.sourceName || "Manual Submission", sourceCategory: "Documents",
    ingestionMethod: "Manual Submission", artifactType: input.artifactType, format: input.format,
    mimeType: "application/octet-stream", originalFilename: `${input.title.toLowerCase().replace(/\s+/g, "-")}.${input.format.toLowerCase()}`,
    contentSize: "1.2 MB", contentSizeBytes: 1_258_291, contentHash: `sha256:manual${input.index}…0000`,
    teamId: "TEAM-99", teamName: input.teamName, businessUnit: input.businessUnit,
    knowledgeDomains: [input.knowledgeDomain], owner: input.owner, authorityLevel: input.authorityLevel,
    version: input.version || "1", previousVersionId: null, versionRelationship: "Original",
    accessClassification: input.accessClassification, regulatoryScope: [],
    sourceCreatedAt: "2026-08-06", sourceModifiedAt: "2026-08-06", receivedAt: "just now",
    freshnessStatus: "Current", ingestionStatus: "Review Required", duplicateStatus: "Unique",
    validationScore: 80, qualityScore: 78, permissionStatus: "Declared at submission",
    evidenceId: `EVD-79${100 + input.index}`, batchId: input.batchId, normalizationQueueId: null,
    preview: "Manual submission preview unavailable. Original artifact preserved in the evidence vault.",
    createdAt: "2026-08-06", updatedAt: "2026-08-06",
  };
}

export function makeManualBatch(index: number, artifactCount: number, owner: string): IngestionBatch {
  return {
    id: `ING-205${10 + index}`, sourceId: "SRC-2009", sourceName: "Manual Submission",
    sourceCategory: "Documents", ingestionMethod: "Manual Submission", status: "Running",
    artifactCount, completedCount: 0, pendingCount: artifactCount, failedCount: 0, quarantinedCount: 0,
    duplicateCandidateCount: 0, versionCount: 0, permissionReviewCount: artifactCount,
    currentStageId: "receive", currentStageName: "Receive", startedAt: "just now",
    elapsedTime: "0 s", estimatedCompletion: "in 2 min", successRate: 100, owner,
    queueDepth: artifactCount, warningCount: 0, configurationVersion: "v3.4",
    accessClassification: "Internal", artifactTypes: ["Manual Submission"],
  };
}

export function makeDiscoveryBatch(index: number, sourceName: string, method: string, artifactCount: number, owner: string): IngestionBatch {
  return {
    ...batches[0],
    id: `ING-206${10 + index}`, sourceName, ingestionMethod: method, status: "Running",
    artifactCount, completedCount: artifactCount, pendingCount: 0, failedCount: 0,
    quarantinedCount: 0, duplicateCandidateCount: Math.round(artifactCount * 0.002),
    versionCount: Math.round(artifactCount * 0.014), permissionReviewCount: Math.round(artifactCount * 0.0004),
    currentStageId: "queue", currentStageName: "Queue for Normalization", startedAt: "just now",
    elapsedTime: "just completed", estimatedCompletion: "Completed", successRate: 99.1, owner,
    queueDepth: 0, warningCount: 0,
  };
}
