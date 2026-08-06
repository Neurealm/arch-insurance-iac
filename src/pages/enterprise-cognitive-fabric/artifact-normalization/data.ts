/**
 * Artifact Normalization — deterministic seeded data model.
 * Original artifacts are never replaced. A canonical representation is created beside them.
 */

export type ViewMode = "executive" | "operations" | "workbench" | "architecture";

export type ServiceState = "Operational" | "Processing" | "Degraded" | "Paused" | "Backlogged" | "Review Required" | "Maintenance";
export type StageStatus = "Running" | "Warning" | "Blocked" | "Paused" | "Idle" | "Complete";
export type JobStatus = "Running" | "Warning" | "Blocked" | "Paused" | "Completed" | "Cancelled";
export type ApprovalStatus = "Approved" | "Pending Review" | "Rejected" | "Auto-approved" | "Escalated";
export type Severity = "Critical" | "High" | "Medium" | "Low";
export type AccessClassification = "Public" | "Internal" | "Confidential" | "Restricted" | "Highly Restricted";
export type AuthorityLevel = "Primary" | "Supporting" | "Historical" | "Unconfirmed";

/* -------------------------------- interfaces ------------------------------- */

export interface CanonicalArtifact {
  id: string;
  artifactId: string;
  evidenceId: string;
  sourceId: string;
  sourceName: string;
  schemaId: string;
  schemaVersion: string;
  artifactType: string;
  originalFormat: string;
  originalFilename: string;
  title: string;
  description: string;
  language: string;
  businessUnit: string;
  teamId: string;
  teamName: string;
  owner: string;
  businessOwner: string;
  technicalOwner: string;
  authorityLevel: AuthorityLevel;
  accessClassification: AccessClassification;
  regulatoryScope: string[];
  createdAtSource: string;
  modifiedAtSource: string;
  effectiveDate: string;
  expirationDate: string;
  normalizedAt: string;
  qualityScore: number;
  confidence: number;
  approvalStatus: ApprovalStatus;
  permissionStatus: string;
  provenanceStatus: string;
  normalizationStatus: string;
  humanReviewStatus: string;
  entityResolutionStatus: string;
  knowledgeDomains: string[];
  environment: string;
  region: string;
  dataResidency: string;
  jobId: string;
  contentHash: string;
  version: string;
  sectionCount: number;
  tableCount: number;
  entityCount: number;
  relationshipCount: number;
  chunkCount: number;
}

export interface CanonicalSection {
  id: string;
  canonicalArtifactId: string;
  heading: string;
  sectionType: string;
  sequence: number;
  pageStart: number;
  pageEnd: number;
  content: string;
  tokenCount: number;
  confidence: number;
  evidenceReferences: string[];
}

export interface CanonicalTable {
  id: string;
  canonicalArtifactId: string;
  title: string;
  headers: string[];
  rows: string[][];
  units: string[];
  pageReference: string;
  confidence: number;
  evidenceReferences: string[];
}

export interface CanonicalEntity {
  id: string;
  canonicalName: string;
  entityType: string;
  aliases: string[];
  sourceValues: string[];
  owningTeam: string;
  relatedSystemIds: string[];
  sourceCount: number;
  confidence: number;
  approvalStatus: ApprovalStatus;
}

export interface CanonicalRelationship {
  id: string;
  sourceEntityId: string;
  sourceEntityName: string;
  relationshipType: string;
  targetEntityId: string;
  targetEntityName: string;
  confidence: number;
  evidenceReferences: string[];
  approvalStatus: ApprovalStatus;
}

export interface ContextualChunk {
  id: string;
  canonicalArtifactId: string;
  sectionId: string;
  headingContext: string;
  content: string;
  tokenCount: number;
  overlap: number;
  entities: string[];
  relationshipIds: string[];
  permissionContext: string;
  evidenceReferences: string[];
  confidence: number;
}

export interface PermissionContext {
  canonicalArtifactId: string;
  sourcePermissions: string[];
  inheritedPermissions: string[];
  approvedConsumers: string[];
  restrictedConsumers: string[];
  accessClassification: AccessClassification;
  regulatoryScope: string[];
  permissionConflict: string;
}

export interface ProvenanceRecord {
  id: string;
  artifactId: string;
  evidenceId: string;
  sourceId: string;
  connectorId: string;
  discoveryRunId: string;
  ingestionBatchId: string;
  normalizationJobId: string;
  canonicalArtifactId: string;
  timestamp: string;
  owner: string;
  accessClassification: AccessClassification;
  contentHash: string;
  status: string;
}

export interface NormalizationJob {
  id: string;
  scope: string;
  sourceName: string;
  artifactType: string;
  originalFormat: string;
  schemaId: string;
  schemaName: string;
  schemaVersion: string;
  status: JobStatus;
  currentStageId: string;
  currentStageName: string;
  artifactCount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  humanReviewCount: number;
  canonicalRecordCount: number;
  canonicalRecordLabel: string;
  qualityScore: number;
  confidence: number;
  startedAt: string;
  elapsedTime: string;
  estimatedCompletion: string;
  owner: string;
  warningCount: number;
  configurationVersion: string;
}

export interface NormalizationStage {
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

export interface NormalizationException {
  id: string;
  artifactId: string;
  artifactTitle: string;
  jobId: string;
  exceptionType: string;
  severity: Severity;
  description: string;
  sourceId: string;
  sourceName: string;
  teamId: string;
  teamName: string;
  owner: string;
  qualityScore: number;
  confidence: number;
  status: string;
  createdAt: string;
  age: string;
  dueAt: string;
  downstreamImpact: string;
  recommendedAction: string;
  candidateCorrections: string[];
  evidenceExcerpt: string;
}

export interface CanonicalSchema {
  id: string;
  name: string;
  version: string;
  status: string;
  artifactTypes: string[];
  requiredFields: string[];
  optionalFields: string[];
  validationRules: string[];
  entityTypes: string[];
  relationshipTypes: string[];
  permissionBehavior: string;
  chunkingProfile: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface HumanReview {
  id: string;
  artifactId: string;
  canonicalArtifactId: string;
  exceptionId: string;
  reviewType: string;
  assignedReviewer: string;
  status: string;
  decision: string;
  comments: string;
  createdAt: string;
  dueAt: string;
  completedAt: string | null;
}

export interface NormalizationReadiness {
  readyForConditionExtraction: number;
  awaitingHumanReview: number;
  permissionBlocked: number;
  schemaFailures: number;
  entityConflicts: number;
  lowConfidence: number;
}

export interface NormalizationActivity {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  artifactId: string | null;
  jobId: string | null;
  schemaId: string | null;
  sourceId: string;
  sourceName: string;
  teamName: string;
  result: string;
  owner: string;
  auditId: string;
}

export interface NormalizationNotification {
  id: string;
  category: string;
  title: string;
  detail: string;
  severity: Severity;
  timestamp: string;
  read: boolean;
  jobId?: string;
  artifactId?: string;
}

/* --------------------------------- filters --------------------------------- */

export interface Filters {
  businessUnit: string;
  team: string;
  knowledgeDomain: string;
  sourceCategory: string;
  sourcePlatform: string;
  artifactType: string;
  originalFormat: string;
  schema: string;
  normalizationStatus: string;
  qualityBand: string;
  confidenceBand: string;
  humanReviewStatus: string;
  entityResolutionStatus: string;
  permissionStatus: string;
  accessClassification: string;
  authorityLevel: string;
  language: string;
  environment: string;
  region: string;
  dataResidency: string;
  timeRange: string;
}

export const defaultFilters: Filters = {
  businessUnit: "All", team: "All", knowledgeDomain: "All", sourceCategory: "All", sourcePlatform: "All",
  artifactType: "All", originalFormat: "All", schema: "All", normalizationStatus: "All", qualityBand: "All",
  confidenceBand: "All", humanReviewStatus: "All", entityResolutionStatus: "All", permissionStatus: "All",
  accessClassification: "All", authorityLevel: "All", language: "All", environment: "All", region: "All",
  dataResidency: "All", timeRange: "Last 24 hours",
};

export const timeRanges = [
  "Last 15 minutes", "Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days", "Custom range",
];

export const filterLabels: Record<keyof Filters, string> = {
  businessUnit: "Business Unit", team: "Team", knowledgeDomain: "Knowledge Domain", sourceCategory: "Source Category",
  sourcePlatform: "Source Platform", artifactType: "Artifact Type", originalFormat: "Original Format",
  schema: "Normalization Schema", normalizationStatus: "Normalization Status", qualityBand: "Quality Band",
  confidenceBand: "Confidence Band", humanReviewStatus: "Human Review Status",
  entityResolutionStatus: "Entity Resolution Status", permissionStatus: "Permission Status",
  accessClassification: "Access Classification", authorityLevel: "Authority Level", language: "Language",
  environment: "Environment", region: "Region", dataResidency: "Data Residency", timeRange: "Time Range",
};

export const filterOptions: Record<keyof Filters, string[]> = {
  businessUnit: ["All", "Technology", "Customer Experience", "Finance", "Security"],
  team: ["All", "Payments Platform", "Checkout Engineering", "Site Reliability Engineering", "Identity Engineering", "Fraud Engineering", "Customer Support", "Enterprise Architecture"],
  knowledgeDomain: ["All", "Reliability", "Payments", "Identity", "Fraud", "Customer Experience", "Engineering"],
  sourceCategory: ["All", "Documents", "Tickets", "Conversations", "Meetings", "Code", "APIs", "Telemetry", "Spreadsheets"],
  sourcePlatform: ["All", "Confluence Cloud", "Jira", "Slack Enterprise", "Zoom Transcripts", "GitHub Enterprise", "Datadog", "Apigee", "Google Drive"],
  artifactType: ["All", "Documents", "Tickets", "Conversations", "Meeting Transcripts", "Code", "API Definitions", "Telemetry", "Spreadsheets", "Images"],
  originalFormat: ["All", "PDF", "DOCX", "XLSX", "HTML", "JSON", "VTT", "Markdown", "OpenAPI JSON", "Repository Metadata", "TIFF"],
  schema: ["All", "Document Canonical Model v3.4", "Work Item Canonical Model v2.8", "Conversation Canonical Model v2.5", "Transcript Canonical Model v3.1", "Code Knowledge Model v2.2", "API Canonical Model v2.6", "Telemetry Canonical Model v1.9", "Spreadsheet Canonical Model v2.0", "Image Metadata Model v1.4"],
  normalizationStatus: ["All", "Published", "Processing", "Review Required", "Blocked", "Schema Failure", "Draft"],
  qualityBand: ["All", "90 and above", "75 to 89", "Below 75"],
  confidenceBand: ["All", "95 and above", "85 to 94", "Below 85"],
  humanReviewStatus: ["All", "Not Required", "Pending", "In Review", "Completed"],
  entityResolutionStatus: ["All", "Auto-resolved", "Human reviewed", "Pending review", "Conflict"],
  permissionStatus: ["All", "Preserved", "Conflict", "Missing Owner"],
  accessClassification: ["All", "Public", "Internal", "Confidential", "Restricted", "Highly Restricted"],
  authorityLevel: ["All", "Primary", "Supporting", "Historical", "Unconfirmed"],
  language: ["All", "English (US)", "English (UK)", "German", "Japanese"],
  environment: ["All", "Production", "Staging", "Development"],
  region: ["All", "North America", "Europe", "Asia Pacific", "Global"],
  dataResidency: ["All", "United States", "European Union", "United Kingdom", "Asia Pacific", "Global"],
  timeRange: timeRanges,
};

export const activeFilterCount = (f: Filters) =>
  (Object.keys(f) as (keyof Filters)[]).filter((k) => k !== "timeRange" && f[k] !== "All").length +
  (f.timeRange !== defaultFilters.timeRange ? 1 : 0);

/* -------------------------------- lifecycle -------------------------------- */

export const stages: NormalizationStage[] = [
  {
    id: "load", name: "Load Original Evidence", sequence: 1, status: "Running",
    definition: "Reads the preserved original artifact from the evidence vault. The original is never modified.",
    processedCount: 2_200_000, processedLabel: "2.2M", pendingCount: 16_000, failedCount: 0, warningCount: 1,
    successRate: 99.7, averageDuration: "3 s", p95Duration: "7 s", throughput: "11.8K per minute",
    slaTarget: "10 s", slaStatus: "Within SLA", owner: "Evidence Operations",
    upstreamStageId: null, downstreamStageId: "parse",
  },
  {
    id: "parse", name: "Parse Content", sequence: 2, status: "Running",
    definition: "Interprets each original format — documents, tickets, conversations, transcripts, code, APIs, telemetry — with a format-specific parser.",
    processedCount: 2_180_000, processedLabel: "2.18M", pendingCount: 21_000, failedCount: 1, warningCount: 3,
    successRate: 98.9, averageDuration: "28 s", p95Duration: "58 s", throughput: "10.9K per minute",
    slaTarget: "1 min", slaStatus: "Within SLA", owner: "Normalization Operations",
    upstreamStageId: "load", downstreamStageId: "structure",
  },
  {
    id: "structure", name: "Detect Structure", sequence: 3, status: "Warning",
    definition: "Identifies headings, sections, paragraphs, lists, tables, speakers, timestamps, and page references.",
    processedCount: 2_150_000, processedLabel: "2.15M", pendingCount: 28_000, failedCount: 2, warningCount: 5,
    successRate: 97.4, averageDuration: "42 s", p95Duration: "1.6 min", throughput: "10.1K per minute",
    slaTarget: "1.5 min", slaStatus: "At Risk", owner: "Normalization Operations",
    upstreamStageId: "parse", downstreamStageId: "metadata",
    bottleneck: "Table detection confidence below target for scanned PDFs.",
  },
  {
    id: "metadata", name: "Normalize Metadata", sequence: 4, status: "Running",
    definition: "Maps titles, owners, dates, units, versions, and identifiers into the canonical schema vocabulary.",
    processedCount: 2_120_000, processedLabel: "2.12M", pendingCount: 34_000, failedCount: 0, warningCount: 2,
    successRate: 98.2, averageDuration: "31 s", p95Duration: "1.1 min", throughput: "9.8K per minute",
    slaTarget: "1.5 min", slaStatus: "Within SLA", owner: "Knowledge Operations",
    upstreamStageId: "structure", downstreamStageId: "entities",
  },
  {
    id: "entities", name: "Resolve Entities", sequence: 5, status: "Warning",
    definition: "Reconciles different names for the same team, person, system, service, product, metric, or policy.",
    processedCount: 2_080_000, processedLabel: "2.08M", pendingCount: 41_000, failedCount: 2, warningCount: 6,
    successRate: 96.7, averageDuration: "1.2 min", p95Duration: "2.8 min", throughput: "9.1K per minute",
    slaTarget: "2.5 min", slaStatus: "At Risk", owner: "Knowledge Operations",
    upstreamStageId: "metadata", downstreamStageId: "access",
    bottleneck: "Entity resolution queue elevated above the normal operating band.",
  },
  {
    id: "access", name: "Preserve Access Context", sequence: 6, status: "Running",
    definition: "Carries source permissions, approved consumers, and classification into the canonical representation.",
    processedCount: 2_050_000, processedLabel: "2.05M", pendingCount: 27_000, failedCount: 1, warningCount: 2,
    successRate: 98.6, averageDuration: "26 s", p95Duration: "54 s", throughput: "9K per minute",
    slaTarget: "1 min", slaStatus: "Within SLA", owner: "Security Engineering",
    upstreamStageId: "entities", downstreamStageId: "chunks",
  },
  {
    id: "chunks", name: "Create Contextual Chunks", sequence: 7, status: "Running",
    definition: "Divides content by meaning and structure, retaining heading context, metadata, permissions, and evidence references.",
    processedCount: 2_020_000, processedLabel: "2.02M", pendingCount: 38_000, failedCount: 0, warningCount: 3,
    successRate: 97.9, averageDuration: "44 s", p95Duration: "1.7 min", throughput: "8.7K per minute",
    slaTarget: "2 min", slaStatus: "Within SLA", owner: "Retrieval Operations",
    upstreamStageId: "access", downstreamStageId: "validate",
  },
  {
    id: "validate", name: "Validate Representation", sequence: 8, status: "Warning",
    definition: "Checks schema compliance, completeness, confidence, conflicts, and provenance before publishing.",
    processedCount: 1_990_000, processedLabel: "1.99M", pendingCount: 46_000, failedCount: 3, warningCount: 7,
    successRate: 96.8, averageDuration: "1.4 min", p95Duration: "3.1 min", throughput: "8.2K per minute",
    slaTarget: "3 min", slaStatus: "At Risk", owner: "Normalization Operations",
    upstreamStageId: "chunks", downstreamStageId: "publish",
    bottleneck: "Validation review backlog increasing.",
  },
  {
    id: "publish", name: "Publish Canonical Model", sequence: 9, status: "Running",
    definition: "Publishes the canonical artifact, chunks, entities, relationships, and provenance links for downstream use.",
    processedCount: 1_960_000, processedLabel: "1.96M", pendingCount: 22_000, failedCount: 0, warningCount: 1,
    successRate: 99.1, averageDuration: "19 s", p95Duration: "39 s", throughput: "8.1K per minute",
    slaTarget: "45 s", slaStatus: "Within SLA", owner: "Knowledge Operations",
    upstreamStageId: "validate", downstreamStageId: null,
  },
];

export const lifecycleCallouts = [
  "Table detection confidence below target for scanned PDFs",
  "Entity resolution queue elevated",
  "Validation review backlog increasing",
  "Canonical publishing stable",
];

/* ---------------------------------- jobs ----------------------------------- */

export const jobs: NormalizationJob[] = [
  {
    id: "NRM-30452", scope: "Engineering Knowledge Base Batch", sourceName: "Confluence Cloud",
    artifactType: "Documents", originalFormat: "HTML and PDF", schemaId: "SCH-DOC",
    schemaName: "Document Canonical Model", schemaVersion: "v3.4", status: "Running",
    currentStageId: "metadata", currentStageName: "Normalize Metadata", artifactCount: 124_532,
    completedCount: 118_940, pendingCount: 5_592, failedCount: 62, humanReviewCount: 84,
    canonicalRecordCount: 1_420_000, canonicalRecordLabel: "1.42M", qualityScore: 95, confidence: 96,
    startedAt: "10:02 AM", elapsedTime: "3 min 22 s", estimatedCompletion: "10:14 AM",
    owner: "Engineering Operations", warningCount: 1, configurationVersion: "v4.1",
  },
  {
    id: "NRM-30451", scope: "Product Backlog Batch", sourceName: "Jira", artifactType: "Tickets",
    originalFormat: "JSON", schemaId: "SCH-WORK", schemaName: "Work Item Canonical Model", schemaVersion: "v2.8",
    status: "Running", currentStageId: "publish", currentStageName: "Publish Canonical Model",
    artifactCount: 88_214, completedCount: 86_100, pendingCount: 2_114, failedCount: 12, humanReviewCount: 18,
    canonicalRecordCount: 862_000, canonicalRecordLabel: "862K", qualityScore: 97, confidence: 98,
    startedAt: "10:01 AM", elapsedTime: "4 min 1 s", estimatedCompletion: "10:09 AM",
    owner: "Product Operations", warningCount: 0, configurationVersion: "v4.1",
  },
  {
    id: "NRM-30450", scope: "Slack Enterprise Batch", sourceName: "Slack Enterprise", artifactType: "Conversations",
    originalFormat: "JSON", schemaId: "SCH-CONV", schemaName: "Conversation Canonical Model", schemaVersion: "v2.5",
    status: "Warning", currentStageId: "access", currentStageName: "Preserve Access Context",
    artifactCount: 412_998, completedCount: 396_420, pendingCount: 14_220, failedCount: 2_358, humanReviewCount: 142,
    canonicalRecordCount: 4_700_000, canonicalRecordLabel: "4.7M", qualityScore: 88, confidence: 89,
    startedAt: "9:58 AM", elapsedTime: "6 min 42 s", estimatedCompletion: "10:21 AM",
    owner: "Customer Support", warningCount: 3, configurationVersion: "v4.0",
  },
  {
    id: "NRM-30449", scope: "Architecture Reviews", sourceName: "Zoom Transcripts", artifactType: "Meeting Transcripts",
    originalFormat: "VTT", schemaId: "SCH-TRANS", schemaName: "Transcript Canonical Model", schemaVersion: "v3.1",
    status: "Warning", currentStageId: "structure", currentStageName: "Detect Structure",
    artifactCount: 18_920, completedCount: 16_120, pendingCount: 2_640, failedCount: 160, humanReviewCount: 96,
    canonicalRecordCount: 312_000, canonicalRecordLabel: "312K", qualityScore: 84, confidence: 86,
    startedAt: "9:56 AM", elapsedTime: "8 min 16 s", estimatedCompletion: "10:26 AM",
    owner: "Enterprise Architecture", warningCount: 4, configurationVersion: "v4.1",
  },
  {
    id: "NRM-30448", scope: "Core Services Repository", sourceName: "GitHub Enterprise", artifactType: "Code",
    originalFormat: "Repository Metadata and Markdown", schemaId: "SCH-CODE", schemaName: "Code Knowledge Model",
    schemaVersion: "v2.2", status: "Running", currentStageId: "chunks", currentStageName: "Create Contextual Chunks",
    artifactCount: 56_340, completedCount: 55_880, pendingCount: 452, failedCount: 8, humanReviewCount: 4,
    canonicalRecordCount: 1_100_000, canonicalRecordLabel: "1.1M", qualityScore: 96, confidence: 97,
    startedAt: "9:55 AM", elapsedTime: "5 min 37 s", estimatedCompletion: "10:08 AM",
    owner: "Platform Engineering", warningCount: 0, configurationVersion: "v4.1",
  },
  {
    id: "NRM-30447", scope: "Customer Telemetry", sourceName: "Datadog", artifactType: "Telemetry",
    originalFormat: "JSON", schemaId: "SCH-TELE", schemaName: "Telemetry Canonical Model", schemaVersion: "v1.9",
    status: "Running", currentStageId: "entities", currentStageName: "Resolve Entities",
    artifactCount: 1_204_844, completedCount: 1_180_100, pendingCount: 24_744, failedCount: 420, humanReviewCount: 32,
    canonicalRecordCount: 8_200_000, canonicalRecordLabel: "8.2M", qualityScore: 94, confidence: 95,
    startedAt: "9:54 AM", elapsedTime: "2 min 18 s", estimatedCompletion: "10:18 AM",
    owner: "Site Reliability Engineering", warningCount: 1, configurationVersion: "v4.1",
  },
  {
    id: "NRM-30446", scope: "Identity Services API", sourceName: "Apigee", artifactType: "API Definitions",
    originalFormat: "OpenAPI JSON", schemaId: "SCH-API", schemaName: "API Canonical Model", schemaVersion: "v2.6",
    status: "Blocked", currentStageId: "validate", currentStageName: "Validate Representation",
    artifactCount: 8_412, completedCount: 6_120, pendingCount: 2_117, failedCount: 175, humanReviewCount: 62,
    canonicalRecordCount: 96_000, canonicalRecordLabel: "96K", qualityScore: 72, confidence: 78,
    startedAt: "9:52 AM", elapsedTime: "12 min 3 s", estimatedCompletion: "Blocked",
    owner: "Security Engineering", warningCount: 5, configurationVersion: "v3.9",
  },
];

/* ------------------------------ canonical artifacts ------------------------ */

export const canonicalArtifacts: CanonicalArtifact[] = [
  {
    id: "CAN-90121", artifactId: "ART-784221", evidenceId: "EVD-77421", sourceId: "SRC-2001",
    sourceName: "Confluence Cloud", schemaId: "SCH-DOC", schemaVersion: "v3.4", artifactType: "Documents",
    originalFormat: "PDF", originalFilename: "payments-api-reliability-requirements-v3.2.pdf",
    title: "Payments API Reliability Requirements",
    description: "Authoritative reliability requirements for the payments authorization API.",
    language: "English (US)", businessUnit: "Technology", teamId: "TEAM-01", teamName: "Payments Platform",
    owner: "Jane Smith", businessOwner: "Jane Smith", technicalOwner: "Payments Platform Engineering",
    authorityLevel: "Primary", accessClassification: "Confidential", regulatoryScope: ["PCI DSS"],
    createdAtSource: "2026-05-14", modifiedAtSource: "2026-08-05", effectiveDate: "2026-08-05",
    expirationDate: "2027-08-05", normalizedAt: "2026-08-06 10:04", qualityScore: 96, confidence: 96,
    approvalStatus: "Approved", permissionStatus: "Preserved", provenanceStatus: "Complete",
    normalizationStatus: "Published", humanReviewStatus: "Not Required", entityResolutionStatus: "Auto-resolved",
    knowledgeDomains: ["Reliability", "Payments"], environment: "Production", region: "North America",
    dataResidency: "United States", jobId: "NRM-30452", contentHash: "sha256:9f21c4a8e3b7…41d0", version: "3.2",
    sectionCount: 8, tableCount: 2, entityCount: 14, relationshipCount: 11, chunkCount: 26,
  },
  {
    id: "CAN-90122", artifactId: "ART-784220", evidenceId: "EVD-77422", sourceId: "SRC-2008",
    sourceName: "Google Drive", schemaId: "SCH-DOC", schemaVersion: "v3.4", artifactType: "Documents",
    originalFormat: "DOCX", originalFilename: "checkout-retry-policy-update-v1.2.docx",
    title: "Checkout Retry Policy Update",
    description: "Proposed retry and backoff policy update for checkout payment submissions.",
    language: "English (US)", businessUnit: "Customer Experience", teamId: "TEAM-02", teamName: "Checkout Engineering",
    owner: "Marcus Lee", businessOwner: "Marcus Lee", technicalOwner: "Checkout Engineering",
    authorityLevel: "Supporting", accessClassification: "Internal", regulatoryScope: [],
    createdAtSource: "2026-06-02", modifiedAtSource: "2026-08-06", effectiveDate: "2026-08-10",
    expirationDate: "2027-08-10", normalizedAt: "2026-08-06 10:07", qualityScore: 88, confidence: 90,
    approvalStatus: "Pending Review", permissionStatus: "Preserved", provenanceStatus: "Complete",
    normalizationStatus: "Review Required", humanReviewStatus: "Pending", entityResolutionStatus: "Pending review",
    knowledgeDomains: ["Payments", "Customer Experience"], environment: "Production", region: "North America",
    dataResidency: "United States", jobId: "NRM-30452", contentHash: "sha256:4c88ba02f19d…77ae", version: "1.2",
    sectionCount: 6, tableCount: 1, entityCount: 9, relationshipCount: 7, chunkCount: 18,
  },
  {
    id: "CAN-90123", artifactId: "ART-784219", evidenceId: "EVD-77423", sourceId: "SRC-2004",
    sourceName: "Zoom Transcripts", schemaId: "SCH-TRANS", schemaVersion: "v3.1", artifactType: "Meeting Transcripts",
    originalFormat: "VTT", originalFilename: "payments-incident-review-2026-08-04.vtt",
    title: "Payments Incident Review",
    description: "Transcript of the payments incident review for the 4 August authorization degradation.",
    language: "English (US)", businessUnit: "Technology", teamId: "TEAM-03", teamName: "Site Reliability Engineering",
    owner: "Priya Patel", businessOwner: "Priya Patel", technicalOwner: "Site Reliability Engineering",
    authorityLevel: "Supporting", accessClassification: "Confidential", regulatoryScope: ["Internal Audit"],
    createdAtSource: "2026-08-04", modifiedAtSource: "2026-08-04", effectiveDate: "2026-08-04",
    expirationDate: "2027-08-04", normalizedAt: "2026-08-06 10:11", qualityScore: 84, confidence: 86,
    approvalStatus: "Pending Review", permissionStatus: "Conflict", provenanceStatus: "Complete",
    normalizationStatus: "Review Required", humanReviewStatus: "In Review", entityResolutionStatus: "Conflict",
    knowledgeDomains: ["Reliability"], environment: "Production", region: "North America",
    dataResidency: "United States", jobId: "NRM-30449", contentHash: "sha256:71ae0d5c8842…9b31", version: "1",
    sectionCount: 12, tableCount: 0, entityCount: 21, relationshipCount: 16, chunkCount: 42,
  },
  {
    id: "CAN-90124", artifactId: "ART-784218", evidenceId: "EVD-77424", sourceId: "SRC-2007",
    sourceName: "Apigee", schemaId: "SCH-API", schemaVersion: "v2.6", artifactType: "API Definitions",
    originalFormat: "OpenAPI JSON", originalFilename: "identity-service-openapi-4.7.json",
    title: "Identity Service OpenAPI Specification",
    description: "Interface definition for the enterprise identity service.",
    language: "English (US)", businessUnit: "Security", teamId: "TEAM-04", teamName: "Identity Engineering",
    owner: "Security Engineering", businessOwner: "Security Engineering", technicalOwner: "Identity Engineering",
    authorityLevel: "Primary", accessClassification: "Restricted", regulatoryScope: ["SOC 2"],
    createdAtSource: "2026-03-11", modifiedAtSource: "2026-08-01", effectiveDate: "2026-08-01",
    expirationDate: "2027-08-01", normalizedAt: "2026-08-06 09:59", qualityScore: 72, confidence: 78,
    approvalStatus: "Rejected", permissionStatus: "Conflict", provenanceStatus: "Partial",
    normalizationStatus: "Schema Failure", humanReviewStatus: "Pending", entityResolutionStatus: "Conflict",
    knowledgeDomains: ["Identity"], environment: "Production", region: "Global", dataResidency: "Global",
    jobId: "NRM-30446", contentHash: "sha256:2ba7cc41e09f…5d6c", version: "4.7",
    sectionCount: 4, tableCount: 0, entityCount: 18, relationshipCount: 12, chunkCount: 22,
  },
  {
    id: "CAN-90125", artifactId: "ART-784217", evidenceId: "EVD-77425", sourceId: "SRC-2005",
    sourceName: "GitHub Enterprise", schemaId: "SCH-CODE", schemaVersion: "v2.2", artifactType: "Code",
    originalFormat: "Repository Metadata", originalFilename: "fraud-decision-service-8f4a9c.metadata.tar",
    title: "Fraud Decision Service Repository",
    description: "Canonical knowledge model for the fraud decision service repository snapshot.",
    language: "English (US)", businessUnit: "Security", teamId: "TEAM-05", teamName: "Fraud Engineering",
    owner: "Platform Engineering", businessOwner: "Fraud Engineering", technicalOwner: "Platform Engineering",
    authorityLevel: "Primary", accessClassification: "Restricted", regulatoryScope: ["SOC 2"],
    createdAtSource: "2026-07-28", modifiedAtSource: "2026-08-06", effectiveDate: "2026-08-06",
    expirationDate: "2027-08-06", normalizedAt: "2026-08-06 10:02", qualityScore: 96, confidence: 97,
    approvalStatus: "Auto-approved", permissionStatus: "Preserved", provenanceStatus: "Complete",
    normalizationStatus: "Published", humanReviewStatus: "Not Required", entityResolutionStatus: "Auto-resolved",
    knowledgeDomains: ["Fraud", "Engineering"], environment: "Production", region: "North America",
    dataResidency: "United States", jobId: "NRM-30448", contentHash: "sha256:8f4a9c1d7e22…c0f4", version: "Commit 8f4a9c",
    sectionCount: 22, tableCount: 3, entityCount: 46, relationshipCount: 38, chunkCount: 118,
  },
  {
    id: "CAN-90126", artifactId: "ART-784215", evidenceId: "EVD-77427", sourceId: "SRC-2003",
    sourceName: "Slack Enterprise", schemaId: "SCH-CONV", schemaVersion: "v2.5", artifactType: "Conversations",
    originalFormat: "JSON", originalFilename: "slack-thread-C4821-1754472000.json",
    title: "Customer Escalation Thread — Checkout Failures",
    description: "Conversation thread capturing a customer escalation about repeated checkout failures.",
    language: "English (US)", businessUnit: "Customer Experience", teamId: "TEAM-06", teamName: "Customer Support",
    owner: "Customer Support", businessOwner: "Customer Support", technicalOwner: "Checkout Engineering",
    authorityLevel: "Supporting", accessClassification: "Internal", regulatoryScope: [],
    createdAtSource: "2026-08-06", modifiedAtSource: "2026-08-06", effectiveDate: "2026-08-06",
    expirationDate: "2027-08-06", normalizedAt: "2026-08-06 10:15", qualityScore: 86, confidence: 88,
    approvalStatus: "Pending Review", permissionStatus: "Conflict", provenanceStatus: "Complete",
    normalizationStatus: "Blocked", humanReviewStatus: "Pending", entityResolutionStatus: "Pending review",
    knowledgeDomains: ["Customer Experience"], environment: "Production", region: "North America",
    dataResidency: "United States", jobId: "NRM-30450", contentHash: "sha256:5e70b93c1a4d…8f22", version: "1",
    sectionCount: 5, tableCount: 0, entityCount: 11, relationshipCount: 8, chunkCount: 14,
  },
  {
    id: "CAN-90127", artifactId: "ART-784212", evidenceId: "EVD-77430", sourceId: "SRC-2006",
    sourceName: "Datadog", schemaId: "SCH-TELE", schemaVersion: "v1.9", artifactType: "Telemetry",
    originalFormat: "JSON", originalFilename: "auth-latency-window-1754476800.json",
    title: "Authorization Latency Telemetry Window",
    description: "Canonical telemetry window covering authorization latency percentiles.",
    language: "English (US)", businessUnit: "Technology", teamId: "TEAM-03", teamName: "Site Reliability Engineering",
    owner: "Site Reliability Engineering", businessOwner: "Site Reliability Engineering",
    technicalOwner: "Site Reliability Engineering", authorityLevel: "Primary", accessClassification: "Internal",
    regulatoryScope: [], createdAtSource: "2026-08-06", modifiedAtSource: "2026-08-06",
    effectiveDate: "2026-08-06", expirationDate: "2026-09-06", normalizedAt: "2026-08-06 10:21",
    qualityScore: 97, confidence: 98, approvalStatus: "Auto-approved", permissionStatus: "Preserved",
    provenanceStatus: "Complete", normalizationStatus: "Published", humanReviewStatus: "Not Required",
    entityResolutionStatus: "Auto-resolved", knowledgeDomains: ["Reliability"], environment: "Production",
    region: "Global", dataResidency: "Global", jobId: "NRM-30447", contentHash: "sha256:3fb0a5d61c78…e402",
    version: "1", sectionCount: 2, tableCount: 1, entityCount: 6, relationshipCount: 5, chunkCount: 4,
  },
  {
    id: "CAN-90128", artifactId: "ART-784216", evidenceId: "EVD-77426", sourceId: "SRC-2008",
    sourceName: "Google Drive", schemaId: "SCH-SHEET", schemaVersion: "v2.0", artifactType: "Spreadsheets",
    originalFormat: "XLSX", originalFilename: "quarterly-reliability-scorecard-q2.xlsx",
    title: "Quarterly Reliability Scorecard",
    description: "Quarterly reliability measurements by service and business unit.",
    language: "English (US)", businessUnit: "Technology", teamId: "TEAM-03", teamName: "Site Reliability Engineering",
    owner: "Site Reliability Engineering", businessOwner: "Site Reliability Engineering",
    technicalOwner: "Site Reliability Engineering", authorityLevel: "Supporting", accessClassification: "Internal",
    regulatoryScope: [], createdAtSource: "2026-04-02", modifiedAtSource: "2026-07-02",
    effectiveDate: "2026-07-02", expirationDate: "2026-10-02", normalizedAt: "2026-08-06 09:51",
    qualityScore: 68, confidence: 71, approvalStatus: "Pending Review", permissionStatus: "Preserved",
    provenanceStatus: "Partial", normalizationStatus: "Review Required", humanReviewStatus: "Pending",
    entityResolutionStatus: "Pending review", knowledgeDomains: ["Reliability"], environment: "Production",
    region: "North America", dataResidency: "United States", jobId: "NRM-30452",
    contentHash: "sha256:0dd41f9a7b63…22e8", version: "2.0",
    sectionCount: 3, tableCount: 4, entityCount: 12, relationshipCount: 6, chunkCount: 16,
  },
];

/* --------------------------- workbench detail data ------------------------- */

export const workbenchSections: CanonicalSection[] = [
  {
    id: "SEC-1", canonicalArtifactId: "CAN-90121", heading: "Executive Summary", sectionType: "Summary",
    sequence: 1, pageStart: 1, pageEnd: 1,
    content: "The payments authorization API is the primary revenue path for card and wallet transactions. This document defines the reliability commitments, performance requirements, dependencies, and approval conditions for release r2026.08.",
    tokenCount: 148, confidence: 98, evidenceReferences: ["p.1 ¶1-2"],
  },
  {
    id: "SEC-2", canonicalArtifactId: "CAN-90121", heading: "Business Objective", sectionType: "Objective",
    sequence: 2, pageStart: 1, pageEnd: 2,
    content: "Maintain uninterrupted payment authorization for checkout while reducing customer-visible failures during peak trading windows.",
    tokenCount: 96, confidence: 97, evidenceReferences: ["p.1 ¶4"],
  },
  {
    id: "SEC-3", canonicalArtifactId: "CAN-90121", heading: "Current State", sectionType: "Context",
    sequence: 3, pageStart: 2, pageEnd: 2,
    content: "Availability over the trailing quarter measured 99.91 percent against a 99.95 percent commitment. Two incidents contributed 68 percent of the error budget consumption.",
    tokenCount: 112, confidence: 95, evidenceReferences: ["p.2 ¶1"],
  },
  {
    id: "SEC-4", canonicalArtifactId: "CAN-90121", heading: "Service-Level Objectives", sectionType: "Requirement",
    sequence: 4, pageStart: 2, pageEnd: 3,
    content: "The payments authorization API shall maintain 99.95 percent monthly availability with p95 latency at or below 250 milliseconds and p99 latency at or below 600 milliseconds.",
    tokenCount: 134, confidence: 99, evidenceReferences: ["p.2 §2.1"],
  },
  {
    id: "SEC-5", canonicalArtifactId: "CAN-90121", heading: "Performance Requirements", sectionType: "Requirement",
    sequence: 5, pageStart: 3, pageEnd: 3,
    content: "Sustained throughput of 4,000 authorizations per second with no more than 0.5 percent retryable failures during peak trading windows.",
    tokenCount: 118, confidence: 96, evidenceReferences: ["p.3 Table 1"],
  },
  {
    id: "SEC-6", canonicalArtifactId: "CAN-90121", heading: "Dependencies", sectionType: "Dependency",
    sequence: 6, pageStart: 3, pageEnd: 4,
    content: "Authorization depends on the Identity Service for token validation and the Fraud Decision Service for risk scoring. Settlement is downstream and is not in scope.",
    tokenCount: 104, confidence: 94, evidenceReferences: ["p.3 ¶6"],
  },
  {
    id: "SEC-7", canonicalArtifactId: "CAN-90121", heading: "Risk Conditions", sectionType: "Risk",
    sequence: 7, pageStart: 4, pageEnd: 4,
    content: "Identity Service latency above 120 milliseconds materially increases authorization timeouts. Concentration risk remains for a single settlement partner.",
    tokenCount: 92, confidence: 91, evidenceReferences: ["p.4 ¶2"],
  },
  {
    id: "SEC-8", canonicalArtifactId: "CAN-90121", heading: "Approval Requirements", sectionType: "Approval",
    sequence: 8, pageStart: 4, pageEnd: 4,
    content: "Release requires sign-off from the Payments Platform owner, Security Engineering, and the Site Reliability review board.",
    tokenCount: 78, confidence: 97, evidenceReferences: ["p.4 §7"],
  },
];

export const workbenchTables: CanonicalTable[] = [
  {
    id: "TBL-1", canonicalArtifactId: "CAN-90121", title: "Performance Requirements",
    headers: ["Measure", "Target", "Threshold", "Window"],
    rows: [
      ["Monthly availability", "99.95%", "99.90%", "Calendar month"],
      ["p95 authorization latency", "250 ms", "300 ms", "Rolling 5 minutes"],
      ["p99 authorization latency", "600 ms", "750 ms", "Rolling 5 minutes"],
      ["Peak throughput", "4,000 tps", "3,400 tps", "Peak trading window"],
      ["Retryable failure rate", "0.5%", "0.9%", "Rolling hour"],
    ],
    units: ["percent", "milliseconds", "milliseconds", "transactions per second", "percent"],
    pageReference: "p.3 Table 1", confidence: 93, evidenceReferences: ["p.3 Table 1"],
  },
];

export const workbenchStructureTree = [
  { heading: "Executive Summary", children: ["Purpose", "Scope of release r2026.08"] },
  { heading: "Business Objective", children: ["Revenue protection", "Customer-visible failure reduction"] },
  { heading: "Current State", children: ["Trailing availability", "Error budget consumption"] },
  { heading: "Service-Level Objectives", children: ["Availability", "p95 latency", "p99 latency"] },
  { heading: "Performance Requirements", children: ["Throughput", "Retryable failure rate", "Table 1"] },
  { heading: "Dependencies", children: ["Identity Service", "Fraud Decision Service"] },
  { heading: "Risk Conditions", children: ["Identity latency sensitivity", "Settlement concentration"] },
  { heading: "Approval Requirements", children: ["Payments Platform owner", "Security Engineering", "SRE review board"] },
];

export const workbenchDetectedStructure = {
  documentTitle: "Payments API Reliability Requirements",
  sectionsDetected: 8,
  paragraphs: 46,
  lists: 7,
  tables: 2,
  headings: 14,
  pageReferences: "p.1 to p.4",
  namedEntities: 14,
  systems: ["Payments API", "Identity Service", "Fraud Decision Service"],
  teams: ["Payments Platform", "Security Engineering", "Site Reliability Engineering"],
  metrics: ["Monthly availability", "p95 latency", "p99 latency", "Peak throughput", "Retryable failure rate"],
  dates: ["2026-05-14", "2026-08-05", "Release r2026.08"],
  requirementCandidates: 6,
  dependencyCandidates: 2,
  authorMetadata: "Jane Smith, Payments Platform",
};

export const workbenchOriginalPreview = [
  { id: "orig-title", field: "title", text: "Payments API Reliability Requirements — Version 3.2" },
  { id: "orig-summary", field: "sections", text: "Executive Summary: The payments authorization API is the primary revenue path for card and wallet transactions. This document defines reliability commitments for release r2026.08." },
  { id: "orig-req", field: "requirements_candidates", text: "2.1 Service-Level Objectives: The payments authorization API shall maintain 99.95% monthly availability with p95 latency at or below 250 ms and p99 latency at or below 600 ms." },
  { id: "orig-table", field: "tables", text: "Table 1 — Performance Requirements: availability 99.95%, p95 250 ms, p99 600 ms, peak throughput 4,000 tps, retryable failure rate 0.5%." },
  { id: "orig-dep", field: "dependencies", text: "Dependencies: Authorization depends on Identity Svc for token validation and the Fraud Decision Service for risk scoring." },
  { id: "orig-risk", field: "risk_candidates", text: "Risk: Identity Svc latency above 120 ms materially increases authorization timeouts. Settlement partner concentration remains elevated." },
  { id: "orig-approval", field: "permission_context", text: "Approval: Payments Platform owner, Security Engineering, and the SRE review board. Distribution restricted to Confidential." },
];

export const workbenchCanonicalJson = {
  artifact_id: "ART-784221",
  evidence_id: "EVD-77421",
  source_id: "SRC-2001",
  artifact_type: "Documents",
  schema_version: "Document Canonical Model v3.4",
  title: "Payments API Reliability Requirements",
  owner_team: "Payments Platform",
  business_owner: "Jane Smith",
  technical_owner: "Payments Platform Engineering",
  authority_level: "Primary",
  access_classification: "Confidential",
  created_at: "2026-05-14",
  modified_at: "2026-08-05",
  effective_date: "2026-08-05",
  sections: 8,
  tables: 2,
  entities: 14,
  relationships: 11,
  metrics: ["monthly_availability", "p95_latency_ms", "p99_latency_ms", "peak_throughput_tps", "retryable_failure_rate"],
  dependencies: ["Identity Service", "Fraud Decision Service"],
  requirements_candidates: 6,
  risk_candidates: 2,
  decision_rules_candidates: 3,
  permission_context: {
    source_permissions: ["Payments Platform — read", "Engineering Operations — read"],
    approved_consumers: ["Payments Platform Persona", "Reliability Impact Evaluation"],
    access_classification: "Confidential",
  },
  provenance: {
    connector_id: "CON-2001",
    discovery_run_id: "DISC-4921",
    ingestion_batch_id: "ING-20452",
    normalization_job_id: "NRM-30452",
    content_hash: "sha256:9f21c4a8e3b7…41d0",
  },
  confidence: 0.96,
  approval_status: "Approved",
};

/* ------------------------------ entity data -------------------------------- */

export const entityCategories = [
  { type: "Teams", count: 412_000 }, { type: "People", count: 286_000 }, { type: "Systems", count: 318_000 },
  { type: "Applications", count: 264_000 }, { type: "Services", count: 402_000 }, { type: "Products", count: 148_000 },
  { type: "Business Capabilities", count: 96_000 }, { type: "Customers", count: 612_000 },
  { type: "Vendors", count: 84_000 }, { type: "Policies", count: 72_000 }, { type: "Metrics", count: 528_000 },
  { type: "Locations", count: 178_000 },
];

export const entityResolutionSummary = {
  resolvedEntities: 3_400_000,
  resolvedLabel: "3.4M",
  autoResolved: 92,
  humanReviewed: 5,
  pendingReview: 3,
};

export const canonicalEntities: CanonicalEntity[] = [
  {
    id: "ENT-1001", canonicalName: "Payments Platform", entityType: "Teams",
    aliases: ["Payments Team", "Payments Plat.", "PayPlat"], sourceValues: ["Payments Team", "PayPlat"],
    owningTeam: "Payments Platform", relatedSystemIds: ["SYS-Payments-API"], sourceCount: 1_482,
    confidence: 98, approvalStatus: "Approved",
  },
  {
    id: "ENT-1002", canonicalName: "Payments API", entityType: "Services",
    aliases: ["payments-api", "Authorization API", "Payments Authorization Service"],
    sourceValues: ["payments-api", "Authorization API"], owningTeam: "Payments Platform",
    relatedSystemIds: ["SYS-Identity", "SYS-Fraud"], sourceCount: 2_940, confidence: 97, approvalStatus: "Approved",
  },
  {
    id: "ENT-1003", canonicalName: "Identity Service", entityType: "Services",
    aliases: ["Identity Svc", "identity-service", "IdSvc"], sourceValues: ["Identity Svc", "IdSvc"],
    owningTeam: "Identity Engineering", relatedSystemIds: ["SYS-Payments-API"], sourceCount: 1_204,
    confidence: 88, approvalStatus: "Pending Review",
  },
  {
    id: "ENT-1004", canonicalName: "p95 Authorization Latency", entityType: "Metrics",
    aliases: ["p95 latency", "auth p95", "authorization latency p95"], sourceValues: ["p95 latency", "auth p95"],
    owningTeam: "Site Reliability Engineering", relatedSystemIds: ["SYS-Payments-API"], sourceCount: 3_610,
    confidence: 96, approvalStatus: "Approved",
  },
  {
    id: "ENT-1005", canonicalName: "Checkout Customer Journey", entityType: "Business Capabilities",
    aliases: ["Checkout journey", "Checkout flow"], sourceValues: ["Checkout journey"],
    owningTeam: "Checkout Engineering", relatedSystemIds: ["SYS-Payments-API"], sourceCount: 842,
    confidence: 91, approvalStatus: "Approved",
  },
  {
    id: "ENT-1006", canonicalName: "Fraud Decision Service", entityType: "Services",
    aliases: ["fraud-decision-service", "Fraud Svc", "Risk Scoring Service"],
    sourceValues: ["Fraud Svc", "Risk Scoring Service"], owningTeam: "Fraud Engineering",
    relatedSystemIds: ["SYS-Payments-API"], sourceCount: 968, confidence: 84, approvalStatus: "Pending Review",
  },
];

export const entityQueue = [
  { artifactId: "ART-784221", artifactTitle: "Payments API Reliability Requirements", candidate: "Identity Svc", entityType: "Services", sourceValue: "Identity Svc", normalizedValue: "Identity Service", confidence: 88, queueAge: "4 min", status: "Pending Review" },
  { artifactId: "ART-784219", artifactTitle: "Payments Incident Review", candidate: "SRE on-call", entityType: "Teams", sourceValue: "SRE on-call", normalizedValue: "Site Reliability Engineering", confidence: 79, queueAge: "9 min", status: "Conflict" },
  { artifactId: "ART-784217", artifactTitle: "Fraud Decision Service Repository", candidate: "Risk Scoring Service", entityType: "Services", sourceValue: "Risk Scoring Service", normalizedValue: "Fraud Decision Service", confidence: 84, queueAge: "12 min", status: "Pending Review" },
  { artifactId: "ART-784215", artifactTitle: "Customer Escalation Thread", candidate: "Checkout team", entityType: "Teams", sourceValue: "Checkout team", normalizedValue: "Checkout Engineering", confidence: 93, queueAge: "2 min", status: "Auto-resolved" },
  { artifactId: "ART-784218", artifactTitle: "Identity Service OpenAPI Specification", candidate: "Security Eng", entityType: "Teams", sourceValue: "Security Eng", normalizedValue: "Security Engineering", confidence: 95, queueAge: "16 min", status: "Auto-resolved" },
];

export const entityConflicts = [
  {
    id: "ECF-1", sourceEntity: "Identity Svc", candidates: ["Identity Service", "Identity Provider Gateway"],
    confidence: 88, conflictType: "Ambiguous alias", sources: ["Confluence Cloud", "Apigee"],
    owners: ["Identity Engineering", "Security Engineering"],
    recommendedAction: "Map to Identity Service and register Identity Svc as an alias", reviewStatus: "Pending Review",
  },
  {
    id: "ECF-2", sourceEntity: "SRE on-call", candidates: ["Site Reliability Engineering", "Payments On-call Rota"],
    confidence: 79, conflictType: "Team versus rota", sources: ["Zoom Transcripts"],
    owners: ["Site Reliability Engineering"],
    recommendedAction: "Map to Site Reliability Engineering. Rota is not a canonical team.", reviewStatus: "In Review",
  },
  {
    id: "ECF-3", sourceEntity: "Risk Scoring Service", candidates: ["Fraud Decision Service", "Risk Analytics Platform"],
    confidence: 84, conflictType: "Competing service names", sources: ["GitHub Enterprise", "Confluence Cloud"],
    owners: ["Fraud Engineering", "Platform Engineering"],
    recommendedAction: "Map to Fraud Decision Service and record the owner as Fraud Engineering", reviewStatus: "Pending Review",
  },
];

export const relationshipTypes = [
  "Owns", "Depends On", "Consumes", "Produces", "Supports", "Governed By", "Measured By", "Impacts", "Approved By", "Used By",
];

export const canonicalRelationships: CanonicalRelationship[] = [
  { id: "REL-1", sourceEntityId: "ENT-1001", sourceEntityName: "Payments Platform Team", relationshipType: "Owns", targetEntityId: "ENT-1002", targetEntityName: "Payments API", confidence: 98, evidenceReferences: ["p.1 ¶1"], approvalStatus: "Approved" },
  { id: "REL-2", sourceEntityId: "ENT-1002", sourceEntityName: "Payments API", relationshipType: "Depends On", targetEntityId: "ENT-1003", targetEntityName: "Identity Service", confidence: 94, evidenceReferences: ["p.3 ¶6"], approvalStatus: "Approved" },
  { id: "REL-3", sourceEntityId: "ENT-1002", sourceEntityName: "Payments API", relationshipType: "Measured By", targetEntityId: "ENT-1004", targetEntityName: "P95 Latency", confidence: 96, evidenceReferences: ["p.2 §2.1"], approvalStatus: "Approved" },
  { id: "REL-4", sourceEntityId: "ENT-1002", sourceEntityName: "Payments API", relationshipType: "Supports", targetEntityId: "ENT-1005", targetEntityName: "Checkout Customer Journey", confidence: 91, evidenceReferences: ["p.1 ¶4"], approvalStatus: "Approved" },
  { id: "REL-5", sourceEntityId: "ENT-1002", sourceEntityName: "Payments API", relationshipType: "Depends On", targetEntityId: "ENT-1006", targetEntityName: "Fraud Decision Service", confidence: 87, evidenceReferences: ["p.3 ¶6"], approvalStatus: "Pending Review" },
  { id: "REL-6", sourceEntityId: "ENT-1002", sourceEntityName: "Payments API", relationshipType: "Approved By", targetEntityId: "ENT-1007", targetEntityName: "Security Engineering", confidence: 95, evidenceReferences: ["p.4 §7"], approvalStatus: "Approved" },
];

/* -------------------------------- chunking --------------------------------- */

export const chunkingMetrics = {
  chunksProduced: 11_200_000, chunksLabel: "11.2M", averageChunkSize: 684,
  withSectionContext: 96, withArtifactMetadata: 100, withPermissionContext: 100,
  withEvidenceReferences: 99, requiringReview: 214_000, requiringReviewLabel: "214K",
};

export const chunkingProfiles = [
  { name: "Document Semantic Sections", artifactTypes: "Documents, Spreadsheets", averageSize: 684, status: "Active" },
  { name: "Ticket and Comment Threads", artifactTypes: "Tickets", averageSize: 412, status: "Active" },
  { name: "Conversation Topic Windows", artifactTypes: "Conversations", averageSize: 508, status: "Active" },
  { name: "Transcript Speaker Segments", artifactTypes: "Meeting Transcripts", averageSize: 596, status: "Active" },
  { name: "Code Symbol and Documentation Blocks", artifactTypes: "Code", averageSize: 742, status: "Active" },
  { name: "API Operation Groups", artifactTypes: "API Definitions", averageSize: 388, status: "Active" },
  { name: "Telemetry Time Windows", artifactTypes: "Telemetry", averageSize: 256, status: "Active" },
  { name: "Spreadsheet Logical Regions", artifactTypes: "Spreadsheets", averageSize: 344, status: "Review" },
];

export const chunkStrategies = [
  {
    id: "fixed", name: "Fixed-size chunking", description: "Splits content every 512 tokens regardless of meaning.",
    sectionContext: 0, evidenceReferences: 62, retrievalQuality: 61,
    sample: "…600 milliseconds. Dependencies: Authorization depends on the Identity Serv",
  },
  {
    id: "structure", name: "Structure-aware chunking", description: "Splits on detected headings, tables, and lists.",
    sectionContext: 88, evidenceReferences: 91, retrievalQuality: 84,
    sample: "Service-Level Objectives — The payments authorization API shall maintain 99.95 percent monthly availability…",
  },
  {
    id: "context", name: "Context-enriched chunking", description: "Structure-aware plus heading context, metadata, entities, permissions, and evidence references.",
    sectionContext: 96, evidenceReferences: 99, retrievalQuality: 94,
    sample: "[Payments API Reliability Requirements v3.2 › Service-Level Objectives · owner Payments Platform · Confidential] The payments authorization API shall maintain 99.95 percent monthly availability…",
  },
];

export const workbenchChunks: ContextualChunk[] = [
  {
    id: "CHK-1", canonicalArtifactId: "CAN-90121", sectionId: "SEC-4",
    headingContext: "Payments API Reliability Requirements › Service-Level Objectives",
    content: "The payments authorization API shall maintain 99.95 percent monthly availability with p95 latency at or below 250 milliseconds and p99 latency at or below 600 milliseconds.",
    tokenCount: 134, overlap: 32, entities: ["Payments API", "p95 Authorization Latency"],
    relationshipIds: ["REL-3"], permissionContext: "Confidential · Payments Platform read",
    evidenceReferences: ["p.2 §2.1"], confidence: 98,
  },
  {
    id: "CHK-2", canonicalArtifactId: "CAN-90121", sectionId: "SEC-5",
    headingContext: "Payments API Reliability Requirements › Performance Requirements",
    content: "Sustained throughput of 4,000 authorizations per second with no more than 0.5 percent retryable failures during peak trading windows.",
    tokenCount: 118, overlap: 28, entities: ["Payments API"], relationshipIds: [],
    permissionContext: "Confidential · Payments Platform read", evidenceReferences: ["p.3 Table 1"], confidence: 95,
  },
  {
    id: "CHK-3", canonicalArtifactId: "CAN-90121", sectionId: "SEC-6",
    headingContext: "Payments API Reliability Requirements › Dependencies",
    content: "Authorization depends on the Identity Service for token validation and the Fraud Decision Service for risk scoring.",
    tokenCount: 104, overlap: 24, entities: ["Identity Service", "Fraud Decision Service"],
    relationshipIds: ["REL-2", "REL-5"], permissionContext: "Confidential · Payments Platform read",
    evidenceReferences: ["p.3 ¶6"], confidence: 92,
  },
  {
    id: "CHK-4", canonicalArtifactId: "CAN-90121", sectionId: "SEC-7",
    headingContext: "Payments API Reliability Requirements › Risk Conditions",
    content: "Identity Service latency above 120 milliseconds materially increases authorization timeouts.",
    tokenCount: 92, overlap: 20, entities: ["Identity Service"], relationshipIds: ["REL-2"],
    permissionContext: "Confidential · Payments Platform read", evidenceReferences: ["p.4 ¶2"], confidence: 89,
  },
];

/* -------------------------- permissions and provenance --------------------- */

export const workbenchPermission: PermissionContext = {
  canonicalArtifactId: "CAN-90121",
  sourcePermissions: ["Payments Platform — read", "Engineering Operations — read"],
  inheritedPermissions: ["Technology business unit — read"],
  approvedConsumers: ["Payments Platform Persona", "Reliability Impact Evaluation", "Cognitive Search (Confidential scope)"],
  restrictedConsumers: ["External partner personas", "Vendor personas"],
  accessClassification: "Confidential",
  regulatoryScope: ["PCI DSS"],
  permissionConflict: "None",
};

export const integrityMetrics = [
  { label: "Original permissions preserved", value: 98 },
  { label: "Access classifications preserved", value: 99 },
  { label: "Complete evidence lineage", value: 99 },
  { label: "Version lineage", value: 96 },
  { label: "Owner lineage", value: 94 },
];

export const integrityCounts = { permissionConflicts: 188, missingOwnership: 76 };

export const lineageNodes = [
  { label: "Original Artifact", recordId: "ART-784221", timestamp: "2026-08-05 16:22", owner: "Jane Smith", access: "Confidential", status: "Preserved", confidence: 100 },
  { label: "Evidence Vault Record", recordId: "EVD-77421", timestamp: "2026-08-06 10:02", owner: "Evidence Operations", access: "Confidential", status: "Registered", confidence: 100 },
  { label: "Normalization Job", recordId: "NRM-30452", timestamp: "2026-08-06 10:02", owner: "Engineering Operations", access: "Confidential", status: "Running", confidence: 96 },
  { label: "Canonical Artifact", recordId: "CAN-90121", timestamp: "2026-08-06 10:04", owner: "Payments Platform", access: "Confidential", status: "Published", confidence: 96 },
  { label: "Contextual Chunk", recordId: "CHK-1", timestamp: "2026-08-06 10:05", owner: "Retrieval Operations", access: "Confidential", status: "Indexed", confidence: 98 },
  { label: "Business Condition Candidate", recordId: "BCC-4410", timestamp: "Pending", owner: "Knowledge Operations", access: "Confidential", status: "Pending extraction", confidence: 0 },
  { label: "Team Persona", recordId: "PER-118", timestamp: "Pending", owner: "Payments Platform", access: "Confidential", status: "Awaiting refresh", confidence: 0 },
  { label: "Impact Evaluation", recordId: "IMP-2201", timestamp: "Pending", owner: "Enterprise Architecture", access: "Confidential", status: "Not started", confidence: 0 },
  { label: "Decision", recordId: "DEC-771", timestamp: "Pending", owner: "Payments Platform", access: "Confidential", status: "Not started", confidence: 0 },
];

/* -------------------------------- schemas ---------------------------------- */

export const schemas: CanonicalSchema[] = [
  {
    id: "SCH-DOC", name: "Document Canonical Model", version: "v3.4", status: "Active",
    artifactTypes: ["Documents", "Spreadsheets"],
    requiredFields: ["artifact_id", "evidence_id", "title", "owner_team", "access_classification", "sections", "provenance"],
    optionalFields: ["tables", "metrics", "effective_date", "expiration_date", "risk_candidates"],
    validationRules: ["Title must be present", "At least one section", "Provenance must resolve to an evidence record", "Access classification required"],
    entityTypes: ["Teams", "People", "Systems", "Services", "Metrics", "Policies"],
    relationshipTypes: ["Owns", "Depends On", "Measured By", "Approved By", "Supports"],
    permissionBehavior: "Inherit from source, never widen", chunkingProfile: "Document Semantic Sections",
    owner: "Knowledge Operations", createdAt: "2025-11-02", updatedAt: "2026-08-01",
  },
  {
    id: "SCH-WORK", name: "Work Item Canonical Model", version: "v2.8", status: "Active",
    artifactTypes: ["Tickets"], requiredFields: ["artifact_id", "evidence_id", "title", "state", "owner_team"],
    optionalFields: ["comments", "labels", "linked_items", "resolution"],
    validationRules: ["State must map to canonical workflow", "Owner team required"],
    entityTypes: ["Teams", "People", "Services", "Products"],
    relationshipTypes: ["Owns", "Impacts", "Depends On", "Used By"],
    permissionBehavior: "Inherit from project permissions", chunkingProfile: "Ticket and Comment Threads",
    owner: "Product Operations", createdAt: "2025-09-14", updatedAt: "2026-07-11",
  },
  {
    id: "SCH-CONV", name: "Conversation Canonical Model", version: "v2.5", status: "Active",
    artifactTypes: ["Conversations"], requiredFields: ["artifact_id", "evidence_id", "participants", "topic_windows"],
    optionalFields: ["reactions", "attachments", "linked_items"],
    validationRules: ["Participants required", "Channel permissions must be captured"],
    entityTypes: ["People", "Teams", "Services", "Customers"],
    relationshipTypes: ["Impacts", "Supports", "Used By"],
    permissionBehavior: "Inherit from channel membership at ingestion time",
    chunkingProfile: "Conversation Topic Windows", owner: "Customer Support",
    createdAt: "2025-10-08", updatedAt: "2026-06-22",
  },
  {
    id: "SCH-TRANS", name: "Transcript Canonical Model", version: "v3.1", status: "Active",
    artifactTypes: ["Meeting Transcripts"], requiredFields: ["artifact_id", "evidence_id", "speakers", "segments", "timestamps"],
    optionalFields: ["decisions", "action_items", "attendee_roles"],
    validationRules: ["Speaker segments required", "Timestamps monotonic", "Participant permission scope required"],
    entityTypes: ["People", "Teams", "Services", "Metrics"],
    relationshipTypes: ["Approved By", "Impacts", "Depends On"],
    permissionBehavior: "Inherit from meeting participants", chunkingProfile: "Transcript Speaker Segments",
    owner: "Enterprise Architecture", createdAt: "2025-12-01", updatedAt: "2026-08-03",
  },
  {
    id: "SCH-CODE", name: "Code Knowledge Model", version: "v2.2", status: "Active",
    artifactTypes: ["Code"], requiredFields: ["artifact_id", "evidence_id", "repository", "symbols", "owners_file"],
    optionalFields: ["readme_sections", "release_tags", "dependencies"],
    validationRules: ["Repository identifier required", "Owner mapping required"],
    entityTypes: ["Services", "Systems", "Teams", "Applications"],
    relationshipTypes: ["Owns", "Depends On", "Produces", "Consumes"],
    permissionBehavior: "Inherit from repository access", chunkingProfile: "Code Symbol and Documentation Blocks",
    owner: "Platform Engineering", createdAt: "2025-08-19", updatedAt: "2026-05-30",
  },
  {
    id: "SCH-API", name: "API Canonical Model", version: "v2.6", status: "Active",
    artifactTypes: ["API Definitions"], requiredFields: ["artifact_id", "evidence_id", "operations", "owner_team", "access_classification"],
    optionalFields: ["examples", "deprecations", "rate_limits"],
    validationRules: ["Operations required", "Security schemes must be captured", "Owner team required"],
    entityTypes: ["Services", "Systems", "Teams", "Policies"],
    relationshipTypes: ["Consumes", "Produces", "Governed By", "Depends On"],
    permissionBehavior: "Inherit from gateway product scope", chunkingProfile: "API Operation Groups",
    owner: "Security Engineering", createdAt: "2025-07-04", updatedAt: "2026-08-06",
  },
  {
    id: "SCH-TELE", name: "Telemetry Canonical Model", version: "v1.9", status: "Active",
    artifactTypes: ["Telemetry"], requiredFields: ["artifact_id", "evidence_id", "metric", "window", "service"],
    optionalFields: ["percentiles", "thresholds", "annotations"],
    validationRules: ["Metric name must resolve to a canonical metric", "Window required"],
    entityTypes: ["Metrics", "Services", "Systems"], relationshipTypes: ["Measured By", "Impacts"],
    permissionBehavior: "Inherit from monitoring workspace", chunkingProfile: "Telemetry Time Windows",
    owner: "Site Reliability Engineering", createdAt: "2025-06-11", updatedAt: "2026-04-18",
  },
  {
    id: "SCH-SHEET", name: "Spreadsheet Canonical Model", version: "v2.0", status: "Active",
    artifactTypes: ["Spreadsheets"], requiredFields: ["artifact_id", "evidence_id", "sheets", "regions"],
    optionalFields: ["formulas", "named_ranges", "units"],
    validationRules: ["Logical regions required", "Units must be declared or inferred with confidence"],
    entityTypes: ["Metrics", "Teams", "Services"], relationshipTypes: ["Measured By", "Owns"],
    permissionBehavior: "Inherit from file permissions", chunkingProfile: "Spreadsheet Logical Regions",
    owner: "Knowledge Operations", createdAt: "2025-10-25", updatedAt: "2026-03-09",
  },
  {
    id: "SCH-IMG", name: "Image Metadata Model", version: "v1.4", status: "Limited",
    artifactTypes: ["Images"], requiredFields: ["artifact_id", "evidence_id", "dimensions", "capture_metadata"],
    optionalFields: ["recognized_text", "captions"],
    validationRules: ["Recognized text requires a confidence score", "No inference without a text layer"],
    entityTypes: ["Teams", "Systems"], relationshipTypes: ["Used By"],
    permissionBehavior: "Inherit from source, restricted by default", chunkingProfile: "Document Semantic Sections",
    owner: "Knowledge Operations", createdAt: "2026-01-16", updatedAt: "2026-07-28",
  },
];

export const schemaComparison = {
  from: "Document Canonical Model v3.3",
  to: "Document Canonical Model v3.4",
  fieldsAdded: ["decision_rules_candidates", "effective_date", "risk_candidates"],
  fieldsRemoved: ["legacy_section_map"],
  validationChanges: ["Provenance must resolve to an evidence record", "Access classification is now required"],
  entityTypeChanges: ["Added Policies", "Metrics confidence threshold raised to 0.85"],
  relationshipTypeChanges: ["Added Approved By", "Added Supports"],
  chunkingChanges: ["Default profile moved to context-enriched chunking", "Overlap reduced from 48 to 32 tokens"],
  permissionChanges: ["Approved consumers must be explicit", "Inheritance can never widen access"],
  compatibility: "Backward compatible with a required reprocess for effective_date",
  sampleDifferences: [
    { field: "sections", before: "8", after: "8" },
    { field: "decision_rules_candidates", before: "not present", after: "3" },
    { field: "effective_date", before: "not present", after: "2026-08-05" },
    { field: "chunks", before: "31", after: "26" },
    { field: "confidence", before: "0.93", after: "0.96" },
  ],
};

export const schemaTestResult = {
  fieldsPopulated: 24,
  fieldsMissing: ["expiration_date", "decision_rules_candidates"],
  validationFailures: ["Access classification missing on one section"],
  entityChanges: "+3 canonical entities, 1 alias added",
  chunkChanges: "31 chunks reduced to 26 with richer heading context",
  confidenceChange: "+0.03",
  backwardCompatibility: "Compatible. Reprocess recommended for effective_date.",
};

/* -------------------------------- coverage --------------------------------- */

export const schemaCoverage = [
  { family: "Documents", coverage: 96, target: 97, artifacts: 842_000, unsupported: "Scanned tables without a text layer", review: 214, schema: "Document Canonical Model v3.4" },
  { family: "Tickets", coverage: 98, target: 97, artifacts: 486_000, unsupported: "Custom field macros", review: 42, schema: "Work Item Canonical Model v2.8" },
  { family: "Conversations", coverage: 91, target: 94, artifacts: 412_000, unsupported: "Threaded reactions and huddles", review: 186, schema: "Conversation Canonical Model v2.5" },
  { family: "Meeting Transcripts", coverage: 87, target: 92, artifacts: 96_000, unsupported: "Overlapping speaker segments", review: 142, schema: "Transcript Canonical Model v3.1" },
  { family: "Code Assets", coverage: 94, target: 94, artifacts: 118_000, unsupported: "Generated bindings", review: 18, schema: "Code Knowledge Model v2.2" },
  { family: "API Definitions", coverage: 93, target: 95, artifacts: 24_000, unsupported: "Vendor extensions", review: 62, schema: "API Canonical Model v2.6" },
  { family: "Telemetry Records", coverage: 97, target: 96, artifacts: 1_204_000, unsupported: "Custom histogram encodings", review: 12, schema: "Telemetry Canonical Model v1.9" },
  { family: "Spreadsheets", coverage: 89, target: 93, artifacts: 68_000, unsupported: "Merged multi-header regions", review: 96, schema: "Spreadsheet Canonical Model v2.0" },
  { family: "Images", coverage: 78, target: 85, artifacts: 42_000, unsupported: "Scans without a text layer", review: 128, schema: "Image Metadata Model v1.4" },
  { family: "Audio and Video Metadata", coverage: 74, target: 85, artifacts: 18_000, unsupported: "Non-transcribed recordings", review: 84, schema: "Transcript Canonical Model v3.1" },
];

/* --------------------------------- quality --------------------------------- */

export const overallQuality = 94;

export const qualityDimensions = [
  { name: "Structure Detection", current: 93, target: 95, trend: [95, 94.6, 94.1, 93.6, 93.2, 93], affected: 216_000, status: "Warning" },
  { name: "Metadata Completeness", current: 96, target: 96, trend: [95.4, 95.6, 95.8, 96, 96, 96], affected: 84_000, status: "Healthy" },
  { name: "Entity Resolution", current: 91, target: 94, trend: [93.4, 92.8, 92.2, 91.6, 91.2, 91], affected: 274_000, status: "Warning" },
  { name: "Relationship Mapping", current: 89, target: 92, trend: [91.2, 90.6, 90.1, 89.6, 89.2, 89], affected: 312_000, status: "Warning" },
  { name: "Permission Integrity", current: 98, target: 98, trend: [97.6, 97.8, 97.9, 98, 98, 98], affected: 42_000, status: "Healthy" },
  { name: "Contextual Chunk Quality", current: 92, target: 93, trend: [92.8, 92.6, 92.4, 92.2, 92, 92], affected: 214_000, status: "Warning" },
  { name: "Schema Compliance", current: 95, target: 95, trend: [94.4, 94.6, 94.8, 95, 95, 95], affected: 92_000, status: "Healthy" },
  { name: "Provenance Completeness", current: 99, target: 98, trend: [98.8, 98.9, 99, 99, 99, 99], affected: 12_000, status: "Healthy" },
];

export const qualityDetail: Record<string, { drivers: string[]; remediation: string[] }> = {
  "Structure Detection": {
    drivers: [
      "Scanned PDFs without a text layer reduce table detection confidence",
      "Overlapping speaker segments in meeting transcripts split sections incorrectly",
      "Merged multi-header spreadsheet regions are not resolved by the current profile",
    ],
    remediation: [
      "Request text-layer augmentation for 128 scanned artifacts",
      "Activate Transcript Canonical Model v3.1 overlap handling for architecture reviews",
      "Extend the spreadsheet region detector to merged headers",
    ],
  },
  "Entity Resolution": {
    drivers: [
      "Competing service names for the Fraud Decision Service across code and documents",
      "Team versus on-call rota ambiguity in transcripts",
      "Identity Service aliases arriving from two source systems",
    ],
    remediation: [
      "Approve the three suggested canonical mappings",
      "Register on-call rotas as non-canonical entity types",
      "Raise the alias threshold for service names to 0.85",
    ],
  },
};

/* ---------------------------- output composition --------------------------- */

export const outputComposition = [
  { type: "Canonical Artifact Records", count: 2_100_000, label: "2.1M", growth: 5.4, quality: 95, storage: "412 GB", color: "#2563eb" },
  { type: "Metadata Records", count: 2_100_000, label: "2.1M", growth: 5.4, quality: 96, storage: "96 GB", color: "#1d4ed8" },
  { type: "Sections and Content Blocks", count: 8_600_000, label: "8.6M", growth: 6.1, quality: 93, storage: "1.4 TB", color: "#0891b2" },
  { type: "Tables and Structured Elements", count: 412_000, label: "412K", growth: 3.2, quality: 90, storage: "58 GB", color: "#0e7490" },
  { type: "Canonical Entities", count: 3_400_000, label: "3.4M", growth: 4.8, quality: 91, storage: "72 GB", color: "#059669" },
  { type: "Relationships", count: 5_800_000, label: "5.8M", growth: 7.2, quality: 89, storage: "118 GB", color: "#65a30d" },
  { type: "Contextual Chunks", count: 11_200_000, label: "11.2M", growth: 8.4, quality: 92, storage: "2.1 TB", color: "#d97706" },
  { type: "Permission Records", count: 2_100_000, label: "2.1M", growth: 5.4, quality: 98, storage: "24 GB", color: "#7c3aed" },
  { type: "Provenance Links", count: 14_700_000, label: "14.7M", growth: 9.1, quality: 99, storage: "146 GB", color: "#475569" },
];

/* ------------------------------- exceptions -------------------------------- */

export const exceptionCategories = [
  { type: "Low Structure Confidence", count: 216, severity: "Medium" as Severity },
  { type: "Entity Conflict", count: 274, severity: "High" as Severity },
  { type: "Permission Conflict", count: 188, severity: "High" as Severity },
  { type: "Missing Owner", count: 76, severity: "Medium" as Severity },
  { type: "Schema Validation Failure", count: 92, severity: "Critical" as Severity },
  { type: "Unsupported Element", count: 144, severity: "Medium" as Severity },
  { type: "Ambiguous Date or Unit", count: 84, severity: "Low" as Severity },
  { type: "Conflicting Metadata", count: 52, severity: "Medium" as Severity },
  { type: "Low Chunk Quality", count: 130, severity: "Medium" as Severity },
];

export const exceptions: NormalizationException[] = [
  {
    id: "NEX-6001", artifactId: "ART-784218", artifactTitle: "Identity Service OpenAPI Specification",
    jobId: "NRM-30446", exceptionType: "Schema Validation Failure", severity: "Critical",
    description: "Vendor extensions on 42 operations are not represented in API Canonical Model v2.6, so validation fails before publishing.",
    sourceId: "SRC-2007", sourceName: "Apigee", teamId: "TEAM-04", teamName: "Identity Engineering",
    owner: "Security Engineering", qualityScore: 72, confidence: 78, status: "Open",
    createdAt: "9:59 AM", age: "23 min", dueAt: "12:00 PM",
    downstreamImpact: "Identity condition extraction blocked. Two personas cannot cite current interface behaviour.",
    recommendedAction: "Extend API Canonical Model to v2.7 with vendor extension support, then reprocess with the new schema.",
    candidateCorrections: ["Reprocess with API Canonical Model v2.7 draft", "Approve with exception and flag unsupported operations", "Reject representation"],
    evidenceExcerpt: "\"x-apigee-quota\": { \"interval\": 1, \"timeUnit\": \"minute\" }",
  },
  {
    id: "NEX-6002", artifactId: "ART-784219", artifactTitle: "Payments Incident Review",
    jobId: "NRM-30449", exceptionType: "Entity Conflict", severity: "High",
    description: "\"SRE on-call\" resolves to both Site Reliability Engineering and the Payments On-call Rota at 79 percent confidence.",
    sourceId: "SRC-2004", sourceName: "Zoom Transcripts", teamId: "TEAM-03", teamName: "Site Reliability Engineering",
    owner: "Priya Patel", qualityScore: 84, confidence: 79, status: "In Review",
    createdAt: "10:11 AM", age: "11 min", dueAt: "1:00 PM",
    downstreamImpact: "Incident evidence could be attributed to the wrong team in the reliability persona.",
    recommendedAction: "Map to Site Reliability Engineering and register the rota as a non-canonical alias.",
    candidateCorrections: ["Site Reliability Engineering", "Payments On-call Rota", "Mark unknown"],
    evidenceExcerpt: "Speaker 2: the SRE on-call paged at 14:06 and started the retry policy rollback.",
  },
  {
    id: "NEX-6003", artifactId: "ART-784215", artifactTitle: "Customer Escalation Thread — Checkout Failures",
    jobId: "NRM-30450", exceptionType: "Permission Conflict", severity: "High",
    description: "Channel membership widened after ingestion, so the normalized representation would expose content beyond the approved consumer list.",
    sourceId: "SRC-2003", sourceName: "Slack Enterprise", teamId: "TEAM-06", teamName: "Customer Support",
    owner: "Customer Support", qualityScore: 86, confidence: 88, status: "Open",
    createdAt: "10:15 AM", age: "7 min", dueAt: "1:30 PM",
    downstreamImpact: "Chunks are held out of retrieval. Customer experience persona cannot cite the escalation.",
    recommendedAction: "Resolve the permission to the ingestion-time membership and republish the canonical artifact.",
    candidateCorrections: ["Restore ingestion-time membership", "Restrict to Customer Support only", "Escalate to Security Engineering"],
    evidenceExcerpt: "channel: #checkout-escalations · members at ingestion 18 · members now 46",
  },
  {
    id: "NEX-6004", artifactId: "ART-784216", artifactTitle: "Quarterly Reliability Scorecard",
    jobId: "NRM-30452", exceptionType: "Unsupported Element", severity: "Medium",
    description: "Merged multi-header regions on sheet 2 cannot be mapped to canonical table headers.",
    sourceId: "SRC-2008", sourceName: "Google Drive", teamId: "TEAM-03", teamName: "Site Reliability Engineering",
    owner: "Site Reliability Engineering", qualityScore: 68, confidence: 71, status: "Open",
    createdAt: "9:51 AM", age: "31 min", dueAt: "4:00 PM",
    downstreamImpact: "Quarterly reliability metrics unavailable to condition extraction.",
    recommendedAction: "Reprocess with the spreadsheet merged-header profile, or correct the mapping manually.",
    candidateCorrections: ["Apply merged-header profile", "Correct mapping manually", "Approve with exception"],
    evidenceExcerpt: "Sheet 2 · rows 3-4 merged across columns B:E",
  },
  {
    id: "NEX-6005", artifactId: "ART-784220", artifactTitle: "Checkout Retry Policy Update",
    jobId: "NRM-30452", exceptionType: "Ambiguous Date or Unit", severity: "Low",
    description: "\"250\" appears without a unit in the retry backoff section and could be milliseconds or seconds.",
    sourceId: "SRC-2008", sourceName: "Google Drive", teamId: "TEAM-02", teamName: "Checkout Engineering",
    owner: "Marcus Lee", qualityScore: 88, confidence: 82, status: "Open",
    createdAt: "10:07 AM", age: "15 min", dueAt: "Tomorrow",
    downstreamImpact: "A misread unit would produce an incorrect retry threshold condition.",
    recommendedAction: "Normalize to milliseconds based on the surrounding latency context and record the correction.",
    candidateCorrections: ["250 milliseconds", "250 seconds", "Mark unknown"],
    evidenceExcerpt: "…exponential backoff beginning at 250 and doubling to a maximum of three attempts.",
  },
  {
    id: "NEX-6006", artifactId: "ART-784213", artifactTitle: "Vendor Risk Assessment Deck",
    jobId: "NRM-30452", exceptionType: "Missing Owner", severity: "Medium",
    description: "No accountable owner is declared, so the canonical artifact cannot inherit an owner lineage.",
    sourceId: "SRC-2009", sourceName: "Manual Submission", teamId: "TEAM-07", teamName: "Enterprise Architecture",
    owner: "Unassigned", qualityScore: 74, confidence: 76, status: "Open",
    createdAt: "10:04 AM", age: "18 min", dueAt: "12:30 PM",
    downstreamImpact: "Cannot be attributed to a persona or governance body.",
    recommendedAction: "Apply Enterprise Architecture as the accountable owner and reprocess metadata only.",
    candidateCorrections: ["Enterprise Architecture", "Finance Risk", "Mark unknown"],
    evidenceExcerpt: "Document properties: author field empty · last modified by service account",
  },
  {
    id: "NEX-6007", artifactId: "ART-784219", artifactTitle: "Payments Incident Review",
    jobId: "NRM-30449", exceptionType: "Low Structure Confidence", severity: "Medium",
    description: "Overlapping speaker segments reduce section boundary confidence to 74 percent.",
    sourceId: "SRC-2004", sourceName: "Zoom Transcripts", teamId: "TEAM-03", teamName: "Site Reliability Engineering",
    owner: "Priya Patel", qualityScore: 84, confidence: 74, status: "Open",
    createdAt: "10:09 AM", age: "13 min", dueAt: "2:00 PM",
    downstreamImpact: "Chunk boundaries may split a decision across two chunks.",
    recommendedAction: "Reprocess from structure detection with the overlap-aware transcript profile.",
    candidateCorrections: ["Reprocess with overlap handling", "Approve with exception", "Manual boundary correction"],
    evidenceExcerpt: "00:14:06.220 Speaker 2 / Speaker 3 overlapping utterances",
  },
  {
    id: "NEX-6008", artifactId: "ART-784212", artifactTitle: "Authorization Latency Telemetry Window",
    jobId: "NRM-30447", exceptionType: "Conflicting Metadata", severity: "Medium",
    description: "The metric name resolves to both p95_latency_ms and auth_p95 in the metric catalog.",
    sourceId: "SRC-2006", sourceName: "Datadog", teamId: "TEAM-03", teamName: "Site Reliability Engineering",
    owner: "Site Reliability Engineering", qualityScore: 97, confidence: 84, status: "Acknowledged",
    createdAt: "10:21 AM", age: "1 min", dueAt: "5:00 PM",
    downstreamImpact: "Duplicate metric entities would fragment reliability evidence.",
    recommendedAction: "Map both names to the canonical metric p95 Authorization Latency.",
    candidateCorrections: ["p95 Authorization Latency", "Keep both", "Mark unknown"],
    evidenceExcerpt: "metric: auth_p95 · alias: p95_latency_ms",
  },
];

/* --------------------------------- reviews --------------------------------- */

export const humanReviews: HumanReview[] = exceptions.slice(0, 5).map((e, i) => ({
  id: `HRV-${700 + i}`, artifactId: e.artifactId, canonicalArtifactId: `CAN-901${21 + i}`, exceptionId: e.id,
  reviewType: e.exceptionType, assignedReviewer: e.owner, status: e.status === "In Review" ? "In Review" : "Pending",
  decision: "", comments: "", createdAt: e.createdAt, dueAt: e.dueAt, completedAt: null,
}));

/* -------------------------------- readiness -------------------------------- */

export const readiness: NormalizationReadiness = {
  readyForConditionExtraction: 1_960_000,
  awaitingHumanReview: 318,
  permissionBlocked: 188,
  schemaFailures: 92,
  entityConflicts: 274,
  lowConfidence: 130,
};

/* --------------------------------- activity -------------------------------- */

export const seedActivity: NormalizationActivity[] = [
  { id: "NAC-1", timestamp: "10:22 AM", action: "Canonical model published", description: "Document Canonical Model v3.4 published 4,218 records.", artifactId: null, jobId: "NRM-30452", schemaId: "SCH-DOC", sourceId: "SRC-2001", sourceName: "Confluence Cloud", teamName: "Payments Platform", result: "Success", owner: "Engineering Operations", auditId: "AUD-5821" },
  { id: "NAC-2", timestamp: "10:18 AM", action: "Owner mapping approved", description: "Payments Platform owner mapping approved.", artifactId: "ART-784221", jobId: "NRM-30452", schemaId: "SCH-DOC", sourceId: "SRC-2001", sourceName: "Confluence Cloud", teamName: "Payments Platform", result: "Success", owner: "Jane Smith", auditId: "AUD-5822" },
  { id: "NAC-3", timestamp: "10:14 AM", action: "Structure warning created", description: "Zoom transcript structure warning created.", artifactId: "ART-784219", jobId: "NRM-30449", schemaId: "SCH-TRANS", sourceId: "SRC-2004", sourceName: "Zoom Transcripts", teamName: "Site Reliability Engineering", result: "Warning", owner: "Priya Patel", auditId: "AUD-5823" },
  { id: "NAC-4", timestamp: "10:09 AM", action: "Job completed", description: "GitHub job completed with 97 percent confidence.", artifactId: null, jobId: "NRM-30448", schemaId: "SCH-CODE", sourceId: "SRC-2005", sourceName: "GitHub Enterprise", teamName: "Fraud Engineering", result: "Success", owner: "Platform Engineering", auditId: "AUD-5824" },
  { id: "NAC-5", timestamp: "10:06 AM", action: "Permission conflict assigned", description: "Slack permission conflict assigned for review.", artifactId: "ART-784215", jobId: "NRM-30450", schemaId: "SCH-CONV", sourceId: "SRC-2003", sourceName: "Slack Enterprise", teamName: "Customer Support", result: "Review", owner: "Customer Support", auditId: "AUD-5825" },
  { id: "NAC-6", timestamp: "10:03 AM", action: "Schema activated", description: "New API schema version activated.", artifactId: null, jobId: null, schemaId: "SCH-API", sourceId: "SRC-2007", sourceName: "Apigee", teamName: "Identity Engineering", result: "Success", owner: "Security Engineering", auditId: "AUD-5826" },
  { id: "NAC-7", timestamp: "9:58 AM", action: "Backlog reduced", description: "Entity-resolution backlog reduced by 12 percent.", artifactId: null, jobId: "NRM-30447", schemaId: null, sourceId: "SRC-2006", sourceName: "Datadog", teamName: "Site Reliability Engineering", result: "Success", owner: "Knowledge Operations", auditId: "AUD-5827" },
];

export const seedNotifications: NormalizationNotification[] = [
  { id: "NNT-1", category: "Schema failure", title: "API schema validation failed", detail: "NRM-30446 blocked at Validate Representation.", severity: "Critical", timestamp: "9:59 AM", read: false, jobId: "NRM-30446" },
  { id: "NNT-2", category: "Entity conflict detected", title: "SRE on-call ambiguity", detail: "Two canonical candidates at 79 percent confidence.", severity: "High", timestamp: "10:11 AM", read: false, artifactId: "ART-784219" },
  { id: "NNT-3", category: "Permission conflict detected", title: "Slack channel membership widened", detail: "Canonical chunks held out of retrieval.", severity: "High", timestamp: "10:15 AM", read: false, artifactId: "ART-784215" },
  { id: "NNT-4", category: "Human review requested", title: "Checkout Retry Policy unit ambiguity", detail: "Unit for 250 must be confirmed.", severity: "Medium", timestamp: "10:07 AM", read: false, artifactId: "ART-784220" },
  { id: "NNT-5", category: "Normalization completed", title: "GitHub job completed", detail: "NRM-30448 published 1.1M canonical records.", severity: "Low", timestamp: "10:09 AM", read: true, jobId: "NRM-30448" },
  { id: "NNT-6", category: "New schema activated", title: "API Canonical Model v2.6", detail: "Activated for Apigee sources.", severity: "Low", timestamp: "10:03 AM", read: true },
  { id: "NNT-7", category: "Low-confidence representation", title: "Quarterly Reliability Scorecard", detail: "Confidence 71 percent. Merged headers unsupported.", severity: "Medium", timestamp: "9:51 AM", read: true, artifactId: "ART-784216" },
  { id: "NNT-8", category: "Readiness threshold exceeded", title: "Review backlog above target", detail: "318 artifacts awaiting human review.", severity: "Medium", timestamp: "10:20 AM", read: true },
  { id: "NNT-9", category: "Reprocessing completed", title: "Telemetry reprocess complete", detail: "NRM-30447 reprocessed with metric alias mapping.", severity: "Low", timestamp: "10:19 AM", read: true, jobId: "NRM-30447" },
  { id: "NNT-10", category: "Normalization failed", title: "Two transcript segments failed", detail: "Overlapping speakers exceeded the boundary tolerance.", severity: "Medium", timestamp: "10:12 AM", read: true, jobId: "NRM-30449" },
];

/* ----------------------------------- KPIs ---------------------------------- */

export const kpiTrends = {
  normalized: [1.86, 1.9, 1.94, 1.98, 2.01, 2.05, 2.08, 2.1],
  jobs: [12, 13, 14, 15, 15, 16, 16, 16],
  canonical: [16.2, 16.7, 17.1, 17.6, 18.0, 18.3, 18.5, 18.7],
  quality: [95, 95, 94.6, 94.4, 94.2, 94.1, 94, 94],
  ready: [1.72, 1.77, 1.82, 1.86, 1.9, 1.93, 1.95, 1.96],
  review: [880, 926, 978, 1_020, 1_064, 1_092, 1_110, 1_126],
};

/* -------------------------------- scenarios -------------------------------- */

export type DemoScenario =
  | "healthy" | "structure-failure" | "entity-conflict" | "permission-conflict" | "schema-change"
  | "low-confidence" | "review-backlog" | "unsupported-table" | "multilingual" | "ocr-degradation"
  | "paused" | "reprocessing" | "reset";

export interface ScenarioSnapshot {
  serviceState: ServiceState;
  banner?: string;
  normalizedLabel: string;
  normalizedChange: string;
  activeJobs: number;
  jobsHealthy: number;
  jobsWarning: number;
  jobsBlocked: number;
  canonicalLabel: string;
  qualityScore: number;
  qualityStatus: string;
  readyLabel: string;
  readyPercent: number;
  requiringReview: number;
  humanReview: number;
  entityConflicts: number;
  missingStructure: number;
  permissionConflicts: number;
  lowConfidence: number;
  focusPanel?: string;
  highlightJobIds: string[];
  highlightArtifactIds: string[];
  stageOverrides: Record<string, Partial<NormalizationStage>>;
  jobOverrides: Record<string, Partial<NormalizationJob>>;
  artifactOverrides: Record<string, Partial<CanonicalArtifact>>;
  degradedCharts: boolean;
  extraNotification?: NormalizationNotification;
  extraActivity?: NormalizationActivity;
}

const base: ScenarioSnapshot = {
  serviceState: "Operational",
  normalizedLabel: "2.1M", normalizedChange: "+108K this week",
  activeJobs: 16, jobsHealthy: 13, jobsWarning: 2, jobsBlocked: 1,
  canonicalLabel: "18.7M", qualityScore: 94, qualityStatus: "Near Target",
  readyLabel: "1.96M", readyPercent: 93,
  requiringReview: 1_126, humanReview: 318, entityConflicts: 274, missingStructure: 216,
  permissionConflicts: 188, lowConfidence: 130,
  highlightJobIds: [], highlightArtifactIds: [],
  stageOverrides: {}, jobOverrides: {}, artifactOverrides: {}, degradedCharts: false,
};

export const scenarioSnapshots: Record<DemoScenario, ScenarioSnapshot> = {
  healthy: { ...base },
  reset: { ...base },
  "structure-failure": {
    ...base, serviceState: "Degraded",
    banner: "Structure detection is failing for scanned documents and overlapping transcript segments.",
    qualityScore: 88, qualityStatus: "Below Target", missingStructure: 962, requiringReview: 1_884,
    focusPanel: "panel-lifecycle", highlightJobIds: ["NRM-30449"], highlightArtifactIds: ["CAN-90123", "CAN-90128"],
    stageOverrides: { structure: { status: "Blocked", successRate: 88.4, failedCount: 14, warningCount: 18, pendingCount: 96_000 } },
    jobOverrides: { "NRM-30449": { status: "Blocked", qualityScore: 68, confidence: 71, warningCount: 9 } },
    artifactOverrides: { "CAN-90123": { qualityScore: 68, confidence: 71, normalizationStatus: "Review Required" } },
    degradedCharts: true,
  },
  "entity-conflict": {
    ...base, serviceState: "Review Required",
    banner: "Entity resolution conflicts elevated. Competing service and team names require human review.",
    entityConflicts: 1_284, requiringReview: 2_136, qualityScore: 91, qualityStatus: "Below Target",
    focusPanel: "panel-entities", highlightArtifactIds: ["CAN-90123", "CAN-90124"],
    stageOverrides: { entities: { status: "Blocked", successRate: 91.2, pendingCount: 118_000, warningCount: 14 } },
    jobOverrides: {}, artifactOverrides: { "CAN-90123": { entityResolutionStatus: "Conflict" } }, degradedCharts: false,
  },
  "permission-conflict": {
    ...base, serviceState: "Degraded",
    banner: "Permission conflicts detected. Canonical chunks are held out of retrieval until access is resolved.",
    permissionConflicts: 842, requiringReview: 1_780,
    focusPanel: "panel-integrity", highlightArtifactIds: ["CAN-90126"],
    stageOverrides: { access: { status: "Warning", successRate: 94.1, warningCount: 9, pendingCount: 62_000 } },
    jobOverrides: { "NRM-30450": { status: "Blocked", warningCount: 8, qualityScore: 79 } },
    artifactOverrides: { "CAN-90126": { permissionStatus: "Conflict", normalizationStatus: "Blocked" } },
    degradedCharts: false,
  },
  "schema-change": {
    ...base, serviceState: "Processing",
    banner: "Document Canonical Model v3.4 activated. Affected artifacts are queued for reprocessing.",
    canonicalLabel: "19.4M", qualityScore: 95, qualityStatus: "On Target",
    focusPanel: "panel-coverage", highlightJobIds: ["NRM-30452"],
    stageOverrides: { publish: { throughput: "9.6K per minute", pendingCount: 62_000 } },
    jobOverrides: { "NRM-30452": { schemaVersion: "v3.4", qualityScore: 96, confidence: 97 } },
    artifactOverrides: {}, degradedCharts: false,
  },
  "low-confidence": {
    ...base, serviceState: "Review Required",
    banner: "Low-confidence representations detected. Ambiguous units and dates require confirmation.",
    lowConfidence: 918, requiringReview: 1_914, qualityScore: 89, qualityStatus: "Below Target",
    focusPanel: "panel-exceptions", highlightArtifactIds: ["CAN-90122", "CAN-90128"],
    stageOverrides: { validate: { status: "Warning", successRate: 92.4, warningCount: 16 } },
    jobOverrides: {}, artifactOverrides: { "CAN-90122": { confidence: 74, qualityScore: 76 } }, degradedCharts: false,
  },
  "review-backlog": {
    ...base, serviceState: "Backlogged",
    banner: "Human review backlog is above target. Condition extraction will be delayed if it persists.",
    humanReview: 2_642, requiringReview: 3_988, readyPercent: 86, readyLabel: "1.84M",
    focusPanel: "panel-exceptions",
    stageOverrides: { validate: { status: "Warning", pendingCount: 184_000, slaStatus: "Breached" } },
    jobOverrides: {}, artifactOverrides: {}, degradedCharts: true,
  },
  "unsupported-table": {
    ...base, serviceState: "Degraded",
    banner: "Unsupported table layouts detected. Merged multi-header regions cannot be mapped to canonical tables.",
    missingStructure: 604, requiringReview: 1_512,
    focusPanel: "panel-coverage", highlightArtifactIds: ["CAN-90128"],
    stageOverrides: { structure: { status: "Warning", successRate: 94.2, warningCount: 11 } },
    jobOverrides: {}, artifactOverrides: { "CAN-90128": { normalizationStatus: "Review Required", qualityScore: 62 } },
    degradedCharts: false,
  },
  multilingual: {
    ...base, serviceState: "Processing",
    banner: "Multilingual artifacts detected. German and Japanese documents are using language-specific parsers.",
    qualityScore: 92, qualityStatus: "Near Target",
    focusPanel: "panel-workbench",
    stageOverrides: { parse: { warningCount: 7, successRate: 97.4 } },
    jobOverrides: {}, artifactOverrides: { "CAN-90122": { language: "German", confidence: 86 } }, degradedCharts: false,
  },
  "ocr-degradation": {
    ...base, serviceState: "Degraded",
    banner: "Recognition quality degraded for scanned artifacts. Structure and table confidence dropped.",
    qualityScore: 86, qualityStatus: "Below Target", missingStructure: 784, requiringReview: 1_942,
    focusPanel: "panel-quality",
    stageOverrides: { parse: { status: "Warning", successRate: 94.1, warningCount: 12 }, structure: { status: "Warning", successRate: 92.8 } },
    jobOverrides: {}, artifactOverrides: {}, degradedCharts: true,
  },
  paused: {
    ...base, serviceState: "Paused",
    banner: "Normalization paused. Queued artifacts will not reach condition extraction until processing resumes.",
    activeJobs: 0, jobsHealthy: 0, jobsWarning: 0, jobsBlocked: 0,
    focusPanel: "panel-jobs",
    stageOverrides: Object.fromEntries(stages.map((s) => [s.id, { status: "Paused" as StageStatus }])),
    jobOverrides: Object.fromEntries(jobs.map((j) => [j.id, { status: "Paused" as JobStatus }])),
    artifactOverrides: {}, degradedCharts: false,
  },
  reprocessing: {
    ...base, serviceState: "Processing",
    banner: "Reprocessing in progress. Historical canonical versions are retained while new versions are produced.",
    activeJobs: 22, jobsHealthy: 18, jobsWarning: 3, jobsBlocked: 1, canonicalLabel: "19.9M",
    focusPanel: "panel-jobs", highlightJobIds: ["NRM-30452", "NRM-30447"],
    stageOverrides: { load: { pendingCount: 84_000, throughput: "16.2K per minute" } },
    jobOverrides: { "NRM-30452": { status: "Running", currentStageName: "Parse Content", currentStageId: "parse" } },
    artifactOverrides: {}, degradedCharts: false,
  },
};

export const demoScenarios: { id: DemoScenario; label: string }[] = [
  { id: "healthy", label: "Healthy Normalization" },
  { id: "structure-failure", label: "Structure Detection Failure" },
  { id: "entity-conflict", label: "Entity Conflict" },
  { id: "permission-conflict", label: "Permission Conflict" },
  { id: "schema-change", label: "Schema Version Change" },
  { id: "low-confidence", label: "Low Confidence" },
  { id: "review-backlog", label: "High Review Backlog" },
  { id: "unsupported-table", label: "Unsupported Table Layout" },
  { id: "multilingual", label: "Multilingual Artifact" },
  { id: "ocr-degradation", label: "OCR Quality Degradation" },
  { id: "paused", label: "Normalization Paused" },
  { id: "reprocessing", label: "Reprocessing in Progress" },
  { id: "reset", label: "Reset Demo Data" },
];

/* -------------------------------- resolvers -------------------------------- */

const eq = (v: string, x: string) => v === "All" || v === x;

export function matchesArtifactFilters(a: CanonicalArtifact, f: Filters) {
  const quality = f.qualityBand === "All"
    || (f.qualityBand === "90 and above" && a.qualityScore >= 90)
    || (f.qualityBand === "75 to 89" && a.qualityScore >= 75 && a.qualityScore < 90)
    || (f.qualityBand === "Below 75" && a.qualityScore < 75);
  const confidence = f.confidenceBand === "All"
    || (f.confidenceBand === "95 and above" && a.confidence >= 95)
    || (f.confidenceBand === "85 to 94" && a.confidence >= 85 && a.confidence < 95)
    || (f.confidenceBand === "Below 85" && a.confidence < 85);
  return (
    eq(f.businessUnit, a.businessUnit) && eq(f.team, a.teamName) &&
    (f.knowledgeDomain === "All" || a.knowledgeDomains.includes(f.knowledgeDomain)) &&
    eq(f.sourcePlatform, a.sourceName) && eq(f.artifactType, a.artifactType) &&
    eq(f.originalFormat, a.originalFormat) &&
    (f.schema === "All" || f.schema === `${schemas.find((s) => s.id === a.schemaId)?.name} ${a.schemaVersion}`) &&
    eq(f.normalizationStatus, a.normalizationStatus) && quality && confidence &&
    eq(f.humanReviewStatus, a.humanReviewStatus) && eq(f.entityResolutionStatus, a.entityResolutionStatus) &&
    eq(f.permissionStatus, a.permissionStatus) && eq(f.accessClassification, a.accessClassification) &&
    eq(f.authorityLevel, a.authorityLevel) && eq(f.language, a.language) &&
    eq(f.environment, a.environment) && eq(f.region, a.region) && eq(f.dataResidency, a.dataResidency)
  );
}

export function matchesJobFilters(j: NormalizationJob, f: Filters) {
  const quality = f.qualityBand === "All"
    || (f.qualityBand === "90 and above" && j.qualityScore >= 90)
    || (f.qualityBand === "75 to 89" && j.qualityScore >= 75 && j.qualityScore < 90)
    || (f.qualityBand === "Below 75" && j.qualityScore < 75);
  return (
    eq(f.sourcePlatform, j.sourceName) && eq(f.artifactType, j.artifactType) &&
    (f.schema === "All" || f.schema === `${j.schemaName} ${j.schemaVersion}`) && quality
  );
}

export function resolveStages(scenario: DemoScenario, overrides: Record<string, Partial<NormalizationStage>>): NormalizationStage[] {
  const snap = scenarioSnapshots[scenario];
  return stages.map((s) => ({ ...s, ...(snap.stageOverrides[s.id] ?? {}), ...(overrides[s.id] ?? {}) }));
}

export function resolveJobs(
  scenario: DemoScenario, filters: Filters,
  overrides: Record<string, Partial<NormalizationJob>>, extra: NormalizationJob[],
): NormalizationJob[] {
  const snap = scenarioSnapshots[scenario];
  return [...extra, ...jobs]
    .map((j) => ({ ...j, ...(snap.jobOverrides[j.id] ?? {}), ...(overrides[j.id] ?? {}) }))
    .filter((j) => matchesJobFilters(j, filters));
}

export function resolveArtifacts(
  scenario: DemoScenario, filters: Filters,
  overrides: Record<string, Partial<CanonicalArtifact>>,
): CanonicalArtifact[] {
  const snap = scenarioSnapshots[scenario];
  return canonicalArtifacts
    .map((a) => ({ ...a, ...(snap.artifactOverrides[a.id] ?? {}), ...(overrides[a.id] ?? {}) }))
    .filter((a) => matchesArtifactFilters(a, filters));
}

export function resolveExceptions(scenario: DemoScenario, statuses: Record<string, string>): NormalizationException[] {
  const list = scenario === "healthy" || scenario === "reset"
    ? exceptions.filter((e) => e.severity !== "Critical")
    : exceptions;
  return list.map((e) => ({ ...e, status: statuses[e.id] ?? e.status }));
}

export function resolveActivity(scenario: DemoScenario, extra: NormalizationActivity[]): NormalizationActivity[] {
  const snap = scenarioSnapshots[scenario];
  return [...extra, ...(snap.extraActivity ? [snap.extraActivity] : []), ...seedActivity];
}

/* ---------------------------- throughput series ---------------------------- */

export type ThroughputMetric = "Throughput" | "Queue Depth" | "Processing Time" | "Failure Rate";

export function throughputSeries(metric: ThroughputMetric, range: string, degraded: boolean) {
  const n = range === "Last 7 days" ? 14 : 12;
  const label = (i: number) => (range === "Last 7 days" ? `D-${n - i}` : range === "Last 24 hours" ? `${(i * 2) % 24}:00` : `T-${n - i}`);
  const data = Array.from({ length: n }, (_, i) => {
    const wave = Math.sin(i / 2.1) * 0.11 + Math.cos(i / 3.2) * 0.05;
    const drag = degraded ? 1 - i / (n * 2.4) : 1;
    if (metric === "Queue Depth") {
      return { t: label(i), parsed: Math.round((34_000 + wave * 8_000) * (degraded ? 1.6 : 1)), published: Math.round((22_000 + wave * 5_000) * (degraded ? 1.3 : 1)), queued: Math.round((38_742 + wave * 6_000) * (degraded ? 1.7 : 1)) };
    }
    if (metric === "Processing Time") {
      return { t: label(i), parsed: Math.round((42 + wave * 10) / (degraded ? 0.55 : 1)), published: Math.round((19 + wave * 5) / (degraded ? 0.7 : 1)), queued: Math.round((84 + wave * 18) / (degraded ? 0.6 : 1)) };
    }
    if (metric === "Failure Rate") {
      return { t: label(i), parsed: Number(((1.1 + wave * 0.5) * (degraded ? 3.2 : 1)).toFixed(2)), published: Number(((0.9 + wave * 0.3) * (degraded ? 2.4 : 1)).toFixed(2)), queued: Number(((0.6 + wave * 0.2) * (degraded ? 2.1 : 1)).toFixed(2)) };
    }
    return { t: label(i), parsed: Math.round((10_900 + wave * 1_600) * drag), published: Math.round((8_100 + wave * 1_200) * drag), queued: Math.round((9_100 + wave * 1_000) * drag) };
  });
  const target = metric === "Throughput" ? 8_000 : metric === "Queue Depth" ? 42_000 : metric === "Processing Time" ? 90 : 2;
  const unit = metric === "Throughput" ? " per minute" : metric === "Queue Depth" ? " records" : metric === "Processing Time" ? " s" : "%";
  return { data, target, unit };
}

export const queueByStage = stages.map((s) => ({ stage: s.name, depth: s.pendingCount }));

/* ------------------------------ search catalog ----------------------------- */

export const searchCatalog = [
  ...canonicalArtifacts.map((a) => ({
    id: a.artifactId, type: "Artifact", title: a.title, source: a.sourceName, team: a.teamName,
    schema: `${schemas.find((s) => s.id === a.schemaId)?.name} ${a.schemaVersion}`,
    quality: a.qualityScore, confidence: a.confidence, status: a.normalizationStatus,
  })),
  ...jobs.map((j) => ({
    id: j.id, type: "Normalization Job", title: j.scope, source: j.sourceName, team: j.owner,
    schema: `${j.schemaName} ${j.schemaVersion}`, quality: j.qualityScore, confidence: j.confidence, status: j.status,
  })),
  ...canonicalEntities.map((e) => ({
    id: e.id, type: "Entity", title: e.canonicalName, source: e.entityType, team: e.owningTeam,
    schema: "Entity catalog", quality: e.confidence, confidence: e.confidence, status: e.approvalStatus,
  })),
  ...canonicalRelationships.map((r) => ({
    id: r.id, type: "Relationship", title: `${r.sourceEntityName} ${r.relationshipType} ${r.targetEntityName}`,
    source: "Context graph", team: "Knowledge Operations", schema: "Relationship catalog",
    quality: r.confidence, confidence: r.confidence, status: r.approvalStatus,
  })),
  ...workbenchChunks.map((c) => ({
    id: c.id, type: "Chunk", title: c.headingContext, source: "Contextual chunking", team: "Retrieval Operations",
    schema: "Context-enriched", quality: c.confidence, confidence: c.confidence, status: "Indexed",
  })),
  ...schemas.map((s) => ({
    id: s.id, type: "Schema", title: `${s.name} ${s.version}`, source: s.artifactTypes.join(", "), team: s.owner,
    schema: s.version, quality: 100, confidence: 100, status: s.status,
  })),
  ...exceptions.map((e) => ({
    id: e.id, type: "Exception", title: `${e.exceptionType} — ${e.artifactTitle}`, source: e.sourceName,
    team: e.teamName, schema: "—", quality: e.qualityScore, confidence: e.confidence, status: e.status,
  })),
  ...humanReviews.map((r) => ({
    id: r.id, type: "Human Review", title: `${r.reviewType} review`, source: r.artifactId, team: r.assignedReviewer,
    schema: "—", quality: 0, confidence: 0, status: r.status,
  })),
];

export const sidebarStatus = { service: "Operational", activeJobs: 16, queued: 38_742, humanReview: 318 };

/* ------------------------------ factory helpers ---------------------------- */

export function makeNormalizationJob(index: number, scope: string, schemaName: string, schemaVersion: string, artifactCount: number, owner: string): NormalizationJob {
  return {
    ...jobs[0],
    id: `NRM-305${10 + index}`, scope, sourceName: scope, artifactType: "Documents",
    schemaName, schemaVersion, status: "Running", currentStageId: "publish",
    currentStageName: "Publish Canonical Model", artifactCount,
    completedCount: artifactCount, pendingCount: 0, failedCount: 0,
    humanReviewCount: Math.round(artifactCount * 0.002),
    canonicalRecordCount: artifactCount * 9,
    canonicalRecordLabel: `${((artifactCount * 9) / 1_000_000).toFixed(2)}M`,
    qualityScore: 95, confidence: 96, startedAt: "just now", elapsedTime: "just completed",
    estimatedCompletion: "Completed", owner, warningCount: 0,
  };
}
