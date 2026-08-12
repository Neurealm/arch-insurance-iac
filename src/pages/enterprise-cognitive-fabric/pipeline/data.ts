/**
 * Discovery Pipeline — deterministic seeded demonstration data.
 * Replaceable with API responses without changing the page components.
 */

export type ViewMode = "executive" | "operations" | "architecture";

export type PipelineState = "Running" | "Paused" | "Degraded" | "Blocked" | "Maintenance";
export type StageStatus = "Running" | "Warning" | "Blocked" | "Paused" | "Idle";
export type RunStatus = "Running" | "Warning" | "Blocked" | "Paused" | "Completed" | "Failed";
export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";
export type AlertStatus = "Open" | "Investigating" | "Acknowledged" | "Snoozed" | "Resolved";

export type StageId = "discover" | "ingest" | "parse" | "normalize" | "extract" | "validate" | "publish";

export interface PipelineStage {
  id: StageId;
  name: string;
  sequence: number;
  description: string;
  status: StageStatus;
  processedLabel: string;
  processedCount: number;
  pendingCount: number;
  failedCount: number;
  warningCount: number;
  successRate: number;
  averageDuration: string;
  p95Duration: string;
  throughput: string;
  slaTarget: string;
  slaStatus: "Within SLA" | "At risk" | "Breached";
  owner: string;
  upstreamStageId: StageId | null;
  downstreamStageId: StageId | null;
  configurationVersion: string;
  lastDeployment: string;
  lastIncident: string;
  trend: number[];
}

export interface PipelineRun {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceCategory: string;
  currentStageId: StageId;
  status: RunStatus;
  artifactCount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  startedAt: string;
  elapsedTime: string;
  estimatedCompletion: string;
  successRate: number;
  owner: string;
  queueDepth: number;
  warningCount: number;
  accessClassification: string;
  discoveryMode: string;
  schedule: string;
  configurationVersion: string;
  businessUnit: string;
  knowledgeDomain: string;
  environment: string;
}

export interface Artifact {
  id: string;
  runId: string;
  sourceId: string;
  artifactType: string;
  title: string;
  priority: "High" | "Normal" | "Low";
  stageId: StageId;
  status: "Queued" | "Processing" | "Failed" | "Complete";
  queueAge: string;
  accessClassification: string;
  attemptCount: number;
  confidence: number;
  qualityScore: number;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineAlert {
  id: string;
  title: string;
  severity: Severity;
  sourceId: string;
  sourceName: string;
  runId: string;
  stageId: StageId;
  owner: string;
  status: AlertStatus;
  time: string;
  triggerCondition: string;
  observedValue: string;
  threshold: string;
  businessImpact: string;
  technicalImpact: string;
  recommendedAction: string;
  affectedArtifacts: number;
  evidence: string[];
  history: { time: string; note: string }[];
}

export interface PipelineActivity {
  id: string;
  timestamp: string;
  eventType: string;
  title: string;
  description: string;
  sourceName: string;
  stageId: StageId;
  severity: Severity;
  owner: string;
  runId?: string;
}

export interface QualityMetric {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  variance: number;
  trend: number[];
  status: "On target" | "Below target" | "Above target";
  affectedArtifactCount: number;
  definition: string;
  topFailureCauses: { cause: string; count: number }[];
  sourceDistribution: { label: string; value: number }[];
  artifactDistribution: { label: string; value: number }[];
  affectedStages: string[];
  affectedTeams: string[];
  recommendedActions: string[];
  recentChanges: string[];
}

export interface ArtifactComposition {
  artifactType: string;
  count: number;
  percentage: number;
  averageSize: string;
  averageProcessingTime: string;
  successRate: number;
  primaryBottleneck: string;
  color: string;
  category: string;
}

export interface OutputReadiness {
  readyForExtraction: string;
  awaitingHumanValidation: string;
  blockedByPermissions: string;
  publishedToMemory: string;
  personaUpdatesPending: number;
  graphUpdatesPending: number;
}

export interface BackfillJob {
  id: string;
  scope: string;
  timeRange: string;
  startingStage: StageId;
  status: "Preparing" | "Loading artifacts" | "Processing" | "Validating" | "Publishing" | "Completed";
  progress: number;
  artifactEstimate: number;
  processedCount: number;
  correctedCount: number;
  failureCount: number;
  warningCount: number;
  personaUpdates: number;
  graphUpdates: number;
  startedAt: string;
  completedAt?: string;
}

/* --------------------------------- filters -------------------------------- */

export interface Filters {
  businessUnit: string;
  team: string;
  knowledgeDomain: string;
  sourceCategory: string;
  sourcePlatform: string;
  pipelineStage: string;
  runStatus: string;
  severity: string;
  owner: string;
  artifactType: string;
  accessClassification: string;
  environment: string;
  timeRange: string;
}

export const defaultFilters: Filters = {
  businessUnit: "All", team: "All", knowledgeDomain: "All", sourceCategory: "All",
  sourcePlatform: "All", pipelineStage: "All", runStatus: "All", severity: "All",
  owner: "All", artifactType: "All", accessClassification: "All", environment: "All",
  timeRange: "Last 24 hours",
};

export const activeFilterCount = (f: Filters) =>
  Object.entries(f).filter(([k, v]) => (k === "timeRange" ? v !== "Last 24 hours" : v !== "All")).length;

export const filterOptions: Record<keyof Filters, string[]> = {
  businessUnit: ["All", "Technology", "Product", "Customer Operations", "Security"],
  team: ["All", "Engineering Operations", "Product Operations", "Customer Support", "Enterprise Architecture", "Platform Engineering", "Site Reliability Engineering", "Security Engineering", "Data Operations", "Compliance"],
  knowledgeDomain: ["All", "Platform", "Product", "Support", "Architecture", "Reliability", "Security"],
  sourceCategory: ["All", "Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry"],
  sourcePlatform: ["All", "Confluence Cloud", "Jira Engineering", "Slack Enterprise", "Zoom Transcripts", "GitHub Enterprise", "Datadog Telemetry", "Apigee API Services"],
  pipelineStage: ["All", "Discover", "Ingest", "Parse", "Normalize", "Extract", "Validate", "Publish"],
  runStatus: ["All", "Running", "Warning", "Blocked", "Paused", "Completed", "Failed"],
  severity: ["All", "Critical", "High", "Medium", "Low", "Info"],
  owner: ["All", "Engineering Operations", "Product Operations", "Customer Support", "Enterprise Architecture", "Platform Engineering", "Site Reliability Engineering", "Security Engineering", "Data Operations", "Compliance"],
  artifactType: ["All", "Documents", "Tickets", "Chat Messages", "Meeting Transcripts", "Code Assets", "API Definitions", "Telemetry Events"],
  accessClassification: ["All", "Public", "Internal", "Confidential", "Restricted", "Highly Restricted"],
  environment: ["All", "Production", "Staging"],
  timeRange: ["Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days"],
};

/* --------------------------------- stages --------------------------------- */

export const stages: PipelineStage[] = [
  {
    id: "discover", name: "Discover", sequence: 1,
    description: "Identify candidate artifacts inside approved enterprise sources.",
    status: "Running", processedLabel: "2.4M", processedCount: 2_400_000, pendingCount: 18_000,
    failedCount: 0, warningCount: 2, successRate: 99.1, averageDuration: "18 sec", p95Duration: "31 sec",
    throughput: "12.4K/min", slaTarget: "45 sec", slaStatus: "Within SLA", owner: "Engineering Operations",
    upstreamStageId: null, downstreamStageId: "ingest", configurationVersion: "v6.1",
    lastDeployment: "2025-05-09", lastIncident: "None in 30 days",
    trend: [11.2, 11.6, 11.9, 12.1, 12.0, 12.3, 12.4],
  },
  {
    id: "ingest", name: "Ingest", sequence: 2,
    description: "Retrieve artifact content and metadata through governed connectors.",
    status: "Running", processedLabel: "2.3M", processedCount: 2_300_000, pendingCount: 24_000,
    failedCount: 0, warningCount: 1, successRate: 98.8, averageDuration: "36 sec", p95Duration: "59 sec",
    throughput: "12.1K/min", slaTarget: "75 sec", slaStatus: "Within SLA", owner: "Platform Engineering",
    upstreamStageId: "discover", downstreamStageId: "parse", configurationVersion: "v6.1",
    lastDeployment: "2025-05-09", lastIncident: "2025-04-28 connector timeout",
    trend: [11.0, 11.4, 11.7, 11.9, 12.0, 12.0, 12.1],
  },
  {
    id: "parse", name: "Parse", sequence: 3,
    description: "Convert native formats into structured text, sections, and metadata.",
    status: "Warning", processedLabel: "2.2M", processedCount: 2_200_000, pendingCount: 31_000,
    failedCount: 1, warningCount: 2, successRate: 97.5, averageDuration: "54 sec", p95Duration: "1.7 min",
    throughput: "10.7K/min", slaTarget: "90 sec", slaStatus: "At risk", owner: "Data Operations",
    upstreamStageId: "ingest", downstreamStageId: "normalize", configurationVersion: "v5.8",
    lastDeployment: "2025-05-11", lastIncident: "2025-05-12 transcript parser backlog",
    trend: [11.4, 11.1, 10.9, 10.8, 10.6, 10.6, 10.7],
  },
  {
    id: "normalize", name: "Normalize", sequence: 4,
    description: "Apply canonical schemas, entity resolution, and consistent representations.",
    status: "Running", processedLabel: "2.1M", processedCount: 2_100_000, pendingCount: 42_000,
    failedCount: 1, warningCount: 3, successRate: 96.8, averageDuration: "1.4 min", p95Duration: "2.6 min",
    throughput: "10.5K/min", slaTarget: "2 min", slaStatus: "At risk", owner: "Data Operations",
    upstreamStageId: "parse", downstreamStageId: "extract", configurationVersion: "v5.8",
    lastDeployment: "2025-05-11", lastIncident: "2025-05-12 low confidence on scanned PDFs",
    trend: [10.9, 10.8, 10.6, 10.5, 10.4, 10.5, 10.5],
  },
  {
    id: "extract", name: "Extract", sequence: 5,
    description: "Decompose normalized artifacts into candidate business conditions.",
    status: "Running", processedLabel: "2.0M", processedCount: 2_000_000, pendingCount: 39_000,
    failedCount: 0, warningCount: 1, successRate: 97.1, averageDuration: "1.8 min", p95Duration: "3.1 min",
    throughput: "10.3K/min", slaTarget: "3 min", slaStatus: "Within SLA", owner: "Enterprise Architecture",
    upstreamStageId: "normalize", downstreamStageId: "validate", configurationVersion: "v4.4",
    lastDeployment: "2025-05-06", lastIncident: "None in 14 days",
    trend: [10.1, 10.2, 10.2, 10.3, 10.4, 10.3, 10.3],
  },
  {
    id: "validate", name: "Validate", sequence: 6,
    description: "Apply policy, permission, quality, and evidence checks before publishing.",
    status: "Warning", processedLabel: "1.9M", processedCount: 1_900_000, pendingCount: 51_000,
    failedCount: 2, warningCount: 4, successRate: 95.9, averageDuration: "2.1 min", p95Duration: "4.2 min",
    throughput: "9.9K/min", slaTarget: "3 min", slaStatus: "At risk", owner: "Compliance",
    upstreamStageId: "extract", downstreamStageId: "publish", configurationVersion: "v4.4",
    lastDeployment: "2025-05-06", lastIncident: "2025-05-12 permission restriction on Apigee",
    trend: [10.4, 10.2, 10.1, 10.0, 9.9, 9.9, 9.9],
  },
  {
    id: "publish", name: "Publish", sequence: 7,
    description: "Write validated knowledge into Enterprise Cognitive Memory and the Context Graph.",
    status: "Running", processedLabel: "1.8M", processedCount: 1_800_000, pendingCount: 22_000,
    failedCount: 0, warningCount: 1, successRate: 98.3, averageDuration: "48 sec", p95Duration: "1.4 min",
    throughput: "9.8K/min", slaTarget: "90 sec", slaStatus: "Within SLA", owner: "Platform Engineering",
    upstreamStageId: "validate", downstreamStageId: null, configurationVersion: "v6.0",
    lastDeployment: "2025-05-10", lastIncident: "None in 21 days",
    trend: [9.6, 9.7, 9.7, 9.8, 9.8, 9.8, 9.8],
  },
];

export const stageById = (id: StageId) => stages.find((s) => s.id === id)!;
export const stageName = (id: StageId) => stageById(id).name;

export const lifecycleCallouts = [
  { tone: "amber" as const, text: "Parsing backlog elevated" },
  { tone: "amber" as const, text: "Validation latency rising" },
  { tone: "green" as const, text: "Publishing throughput stable" },
];

/* ---------------------------------- runs ---------------------------------- */

export const runs: PipelineRun[] = [
  {
    id: "RUN-10452", sourceId: "src-confluence", sourceName: "Confluence Cloud", sourceCategory: "Documents",
    currentStageId: "normalize", status: "Running", artifactCount: 124_532, completedCount: 118_400,
    pendingCount: 4_280, failedCount: 1_852, startedAt: "10:02 AM", elapsedTime: "3 min 22 sec",
    estimatedCompletion: "10:12 AM", successRate: 98.4, owner: "Engineering Operations", queueDepth: 4_280,
    warningCount: 1, accessClassification: "Internal", discoveryMode: "Incremental", schedule: "Every 15 min",
    configurationVersion: "v14.2", businessUnit: "Technology", knowledgeDomain: "Platform", environment: "Production",
  },
  {
    id: "RUN-10451", sourceId: "src-jira", sourceName: "Jira Engineering", sourceCategory: "Tickets",
    currentStageId: "extract", status: "Running", artifactCount: 88_214, completedCount: 83_600,
    pendingCount: 2_144, failedCount: 2_470, startedAt: "10:01 AM", elapsedTime: "4 min 1 sec",
    estimatedCompletion: "10:14 AM", successRate: 97.2, owner: "Product Operations", queueDepth: 2_144,
    warningCount: 0, accessClassification: "Internal", discoveryMode: "Incremental", schedule: "Every 15 min",
    configurationVersion: "v14.2", businessUnit: "Product", knowledgeDomain: "Product", environment: "Production",
  },
  {
    id: "RUN-10450", sourceId: "src-slack", sourceName: "Slack Enterprise", sourceCategory: "Chat",
    currentStageId: "validate", status: "Warning", artifactCount: 412_998, completedCount: 391_500,
    pendingCount: 14_220, failedCount: 7_278, startedAt: "9:58 AM", elapsedTime: "6 min 42 sec",
    estimatedCompletion: "10:22 AM", successRate: 94.8, owner: "Customer Support", queueDepth: 14_220,
    warningCount: 3, accessClassification: "Confidential", discoveryMode: "Streaming", schedule: "Real-time",
    configurationVersion: "v14.1", businessUnit: "Customer Operations", knowledgeDomain: "Support", environment: "Production",
  },
  {
    id: "RUN-10449", sourceId: "src-zoom", sourceName: "Zoom Transcripts", sourceCategory: "Meetings",
    currentStageId: "parse", status: "Warning", artifactCount: 18_920, completedCount: 17_540,
    pendingCount: 1_942, failedCount: 1_380, startedAt: "9:56 AM", elapsedTime: "8 min 16 sec",
    estimatedCompletion: "10:26 AM", successRate: 92.7, owner: "Enterprise Architecture", queueDepth: 1_942,
    warningCount: 2, accessClassification: "Confidential", discoveryMode: "Batch", schedule: "Every 6 hours",
    configurationVersion: "v14.1", businessUnit: "Technology", knowledgeDomain: "Architecture", environment: "Production",
  },
  {
    id: "RUN-10448", sourceId: "src-github", sourceName: "GitHub Enterprise", sourceCategory: "Code",
    currentStageId: "publish", status: "Running", artifactCount: 56_340, completedCount: 55_820,
    pendingCount: 412, failedCount: 108, startedAt: "9:55 AM", elapsedTime: "5 min 37 sec",
    estimatedCompletion: "10:08 AM", successRate: 99.1, owner: "Platform Engineering", queueDepth: 412,
    warningCount: 0, accessClassification: "Internal", discoveryMode: "Incremental", schedule: "Every 15 min",
    configurationVersion: "v14.2", businessUnit: "Technology", knowledgeDomain: "Platform", environment: "Production",
  },
  {
    id: "RUN-10447", sourceId: "src-datadog", sourceName: "Datadog Telemetry", sourceCategory: "Telemetry",
    currentStageId: "ingest", status: "Running", artifactCount: 1_204_844, completedCount: 1_180_200,
    pendingCount: 18_300, failedCount: 6_344, startedAt: "9:54 AM", elapsedTime: "2 min 18 sec",
    estimatedCompletion: "10:19 AM", successRate: 99.4, owner: "Site Reliability Engineering", queueDepth: 18_300,
    warningCount: 0, accessClassification: "Internal", discoveryMode: "Streaming", schedule: "Real-time",
    configurationVersion: "v14.2", businessUnit: "Technology", knowledgeDomain: "Reliability", environment: "Production",
  },
  {
    id: "RUN-10446", sourceId: "src-apigee", sourceName: "Apigee API Services", sourceCategory: "APIs",
    currentStageId: "validate", status: "Blocked", artifactCount: 8_412, completedCount: 6_180,
    pendingCount: 2_117, failedCount: 115, startedAt: "9:52 AM", elapsedTime: "12 min 3 sec",
    estimatedCompletion: "Blocked", successRate: 88.9, owner: "Security Engineering", queueDepth: 2_117,
    warningCount: 4, accessClassification: "Restricted", discoveryMode: "Scheduled", schedule: "Every 2 hours",
    configurationVersion: "v14.0", businessUnit: "Security", knowledgeDomain: "Security", environment: "Production",
  },
];

export const runStageProgress: Record<StageId, "complete" | "active" | "pending"> = {
  discover: "complete", ingest: "complete", parse: "complete",
  normalize: "active", extract: "pending", validate: "pending", publish: "pending",
};

export function timelineForRun(run: PipelineRun): { stage: PipelineStage; state: "complete" | "active" | "pending" }[] {
  const idx = stages.findIndex((s) => s.id === run.currentStageId);
  return stages.map((s, i) => ({ stage: s, state: i < idx ? "complete" : i === idx ? "active" : "pending" }));
}

/* -------------------------------- artifacts -------------------------------- */

const ARTIFACT_TYPES = ["Document", "Ticket", "Chat Thread", "Meeting Transcript", "Code File", "API Definition", "Telemetry Batch"];
const CLASSES = ["Internal", "Confidential", "Restricted", "Public"];

export function queueForStage(stageId: StageId): Artifact[] {
  const stage = stageById(stageId);
  return Array.from({ length: 12 }, (_, i) => {
    const k = stage.sequence * 7 + i;
    return {
      id: `ART-${stage.sequence}${String(1000 + i)}`,
      runId: runs[k % runs.length].id,
      sourceId: runs[k % runs.length].sourceId,
      artifactType: ARTIFACT_TYPES[k % ARTIFACT_TYPES.length],
      title: `${runs[k % runs.length].sourceName} artifact ${1000 + i}`,
      priority: (k % 5 === 0 ? "High" : k % 3 === 0 ? "Low" : "Normal") as Artifact["priority"],
      stageId,
      status: (k % 9 === 0 ? "Failed" : k % 4 === 0 ? "Processing" : "Queued") as Artifact["status"],
      queueAge: `${2 + (k % 17)} min`,
      accessClassification: CLASSES[k % CLASSES.length],
      attemptCount: 1 + (k % 3),
      confidence: 0.72 + ((k % 25) / 100),
      qualityScore: 0.8 + ((k % 18) / 100),
      errorCode: k % 9 === 0 ? "PARSE_TIMEOUT" : undefined,
      createdAt: "10:0" + (k % 9) + " AM",
      updatedAt: "10:1" + (k % 9) + " AM",
    } satisfies Artifact;
  });
}

export interface StageError {
  code: string; description: string; artifactCount: number; source: string;
  firstSeen: string; lastSeen: string; severity: Severity; retryable: boolean;
}

export const stageErrors: Record<StageId, StageError[]> = {
  discover: [{ code: "SRC_UNREACHABLE", description: "Source endpoint unreachable during enumeration", artifactCount: 12, source: "Apigee API Services", firstSeen: "09:41 AM", lastSeen: "09:52 AM", severity: "Low", retryable: true }],
  ingest: [{ code: "RATE_LIMITED", description: "Connector throttled by upstream platform", artifactCount: 240, source: "Slack Enterprise", firstSeen: "09:36 AM", lastSeen: "10:12 AM", severity: "Medium", retryable: true }],
  parse: [
    { code: "PARSE_TIMEOUT", description: "Transcript parser exceeded execution timeout", artifactCount: 1_380, source: "Zoom Transcripts", firstSeen: "09:56 AM", lastSeen: "10:16 AM", severity: "High", retryable: true },
    { code: "UNSUPPORTED_FORMAT", description: "Legacy attachment format not supported by parser", artifactCount: 118, source: "Confluence Cloud", firstSeen: "08:20 AM", lastSeen: "10:02 AM", severity: "Low", retryable: false },
  ],
  normalize: [
    { code: "LOW_CONFIDENCE_OCR", description: "Scanned PDF normalization below confidence threshold", artifactCount: 942, source: "Confluence Cloud", firstSeen: "09:22 AM", lastSeen: "10:18 AM", severity: "Medium", retryable: true },
    { code: "SCHEMA_DRIFT", description: "Source payload no longer matches canonical schema", artifactCount: 310, source: "Slack Enterprise", firstSeen: "10:11 AM", lastSeen: "10:17 AM", severity: "High", retryable: true },
    { code: "ENTITY_UNRESOLVED", description: "Entity resolution could not match an owning team", artifactCount: 176, source: "Jira Engineering", firstSeen: "09:48 AM", lastSeen: "10:14 AM", severity: "Low", retryable: true },
  ],
  extract: [{ code: "NO_CONDITIONS_FOUND", description: "No business conditions extracted from artifact body", artifactCount: 604, source: "Slack Enterprise", firstSeen: "09:30 AM", lastSeen: "10:15 AM", severity: "Low", retryable: false }],
  validate: [
    { code: "PERMISSION_BLOCK", description: "Artifact blocked by restricted permission policy", artifactCount: 2_117, source: "Apigee API Services", firstSeen: "09:52 AM", lastSeen: "10:18 AM", severity: "Critical", retryable: false },
    { code: "POLICY_THRESHOLD", description: "Validation policy threshold exceeded for source", artifactCount: 3_244, source: "Slack Enterprise", firstSeen: "09:58 AM", lastSeen: "10:19 AM", severity: "High", retryable: true },
  ],
  publish: [{ code: "MEMORY_WRITE_RETRY", description: "Cognitive Memory write retried after transient error", artifactCount: 88, source: "GitHub Enterprise", firstSeen: "09:55 AM", lastSeen: "10:05 AM", severity: "Info", retryable: true }],
};

export const stageOutputs: Record<StageId, { label: string; value: string }[]> = {
  discover: [{ label: "Candidate artifacts", value: "2,401,882" }, { label: "Metadata records", value: "2,401,882" }, { label: "Entities resolved", value: "0" }, { label: "Business inputs extracted", value: "0" }, { label: "Context Graph relationships", value: "0" }, { label: "Evidence references", value: "2,401,882" }],
  ingest: [{ label: "Normalized JSON records", value: "0" }, { label: "Metadata records", value: "2,298,410" }, { label: "Entities resolved", value: "0" }, { label: "Business inputs extracted", value: "0" }, { label: "Context Graph relationships", value: "0" }, { label: "Evidence references", value: "2,298,410" }],
  parse: [{ label: "Normalized JSON records", value: "0" }, { label: "Metadata records", value: "2,214,006" }, { label: "Entities resolved", value: "184,220" }, { label: "Business inputs extracted", value: "0" }, { label: "Context Graph relationships", value: "0" }, { label: "Evidence references", value: "2,214,006" }],
  normalize: [{ label: "Normalized JSON records", value: "2,104,772" }, { label: "Metadata records", value: "2,104,772" }, { label: "Entities resolved", value: "612,904" }, { label: "Business inputs extracted", value: "318,441" }, { label: "Context Graph relationships", value: "228,610" }, { label: "Evidence references", value: "2,104,772" }],
  extract: [{ label: "Normalized JSON records", value: "2,004,118" }, { label: "Metadata records", value: "2,004,118" }, { label: "Entities resolved", value: "702,338" }, { label: "Business inputs extracted", value: "884,190" }, { label: "Context Graph relationships", value: "512,004" }, { label: "Evidence references", value: "2,004,118" }],
  validate: [{ label: "Normalized JSON records", value: "1,902,441" }, { label: "Metadata records", value: "1,902,441" }, { label: "Entities resolved", value: "688,120" }, { label: "Business inputs extracted", value: "842,006" }, { label: "Context Graph relationships", value: "498,220" }, { label: "Evidence references", value: "1,902,441" }],
  publish: [{ label: "Normalized JSON records", value: "1,804,229" }, { label: "Metadata records", value: "1,804,229" }, { label: "Entities resolved", value: "664,882" }, { label: "Business inputs extracted", value: "812,440" }, { label: "Context Graph relationships", value: "486,118" }, { label: "Evidence references", value: "1,804,229" }],
};

export const stageDependencies: Record<StageId, { upstream: string[]; downstream: string[]; storage: string[]; topics: string[]; consumers: string[] }> = {
  discover: { upstream: ["Source Registry", "Connector Health"], downstream: ["Ingest workers"], storage: ["Discovery catalog"], topics: ["ecf.discovery.found"], consumers: ["Ingest"] },
  ingest: { upstream: ["Discover", "Credential Vault"], downstream: ["Parse workers"], storage: ["Raw artifact store"], topics: ["ecf.ingest.completed"], consumers: ["Parse"] },
  parse: { upstream: ["Ingest", "Parser registry"], downstream: ["Normalize workers"], storage: ["Parsed content store"], topics: ["ecf.parse.completed"], consumers: ["Normalize"] },
  normalize: { upstream: ["Parse", "Canonical schema service", "Entity resolution service"], downstream: ["Extract workers", "Context Graph writer"], storage: ["Normalized record store", "Object storage"], topics: ["ecf.normalize.completed", "ecf.entity.resolved"], consumers: ["Extract", "Context Graph", "Evidence Vault"] },
  extract: { upstream: ["Normalize", "Business condition models"], downstream: ["Validate workers"], storage: ["Business condition store"], topics: ["ecf.extract.completed"], consumers: ["Validate", "Team Persona Studio"] },
  validate: { upstream: ["Extract", "Policy engine", "Permission service"], downstream: ["Publish workers", "Human review queue"], storage: ["Validation ledger"], topics: ["ecf.validate.completed", "ecf.validate.blocked"], consumers: ["Publish", "Compliance review"] },
  publish: { upstream: ["Validate"], downstream: ["Enterprise Cognitive Memory", "Context Graph", "Team Personas"], storage: ["Cognitive Memory", "Graph store"], topics: ["ecf.publish.completed"], consumers: ["Decision Intelligence", "Impact Analysis", "Cognitive Search"] },
};

export const stageConfiguration: Record<StageId, { label: string; value: string }[]> = Object.fromEntries(
  stages.map((s) => [
    s.id,
    [
      { label: "Worker concurrency", value: String(16 + s.sequence * 4) },
      { label: "Batch size", value: String(250 * s.sequence) },
      { label: "Timeout", value: `${30 * s.sequence} sec` },
      { label: "Retry count", value: String(2 + (s.sequence % 3)) },
      { label: "Confidence threshold", value: "0.85" },
      { label: "Quality threshold", value: "0.90" },
      { label: "SLA", value: s.slaTarget },
    ],
  ]),
) as Record<StageId, { label: string; value: string }[]>;

/* --------------------------------- alerts --------------------------------- */

export const alerts: PipelineAlert[] = [
  {
    id: "ALR-4801", title: "Validation policy threshold exceeded for Slack Enterprise", severity: "High",
    sourceId: "src-slack", sourceName: "Slack Enterprise", runId: "RUN-10450", stageId: "validate",
    owner: "Customer Support", status: "Open", time: "10:19 AM",
    triggerCondition: "Validation failure rate above 5% over a 15 minute window",
    observedValue: "5.2% failure rate", threshold: "5.0% failure rate",
    businessImpact: "Support knowledge is delayed from reaching Cognitive Memory, reducing answer quality for customer-facing teams.",
    technicalImpact: "3,244 artifacts held in the validation queue; downstream publishing throughput reduced by 4%.",
    recommendedAction: "Review the Slack validation policy scope and retry affected artifacts after excluding ephemeral channels.",
    affectedArtifacts: 3_244,
    evidence: ["Validation ledger VL-88213", "Policy evaluation trace 10:19:04", "Run RUN-10450 stage log"],
    history: [{ time: "10:19 AM", note: "Alert raised automatically" }, { time: "10:20 AM", note: "Routed to Customer Support" }],
  },
  {
    id: "ALR-4800", title: "Zoom transcript parsing backlog detected", severity: "Medium",
    sourceId: "src-zoom", sourceName: "Zoom Transcripts", runId: "RUN-10449", stageId: "parse",
    owner: "Enterprise Architecture", status: "Investigating", time: "10:12 AM",
    triggerCondition: "Parse queue age above 8 minutes",
    observedValue: "8 min 16 sec queue age", threshold: "8 min queue age",
    businessImpact: "Meeting decisions and commitments reach the fabric later than the operating cadence requires.",
    technicalImpact: "1,942 transcripts queued; parser workers saturated at 94% utilization.",
    recommendedAction: "Increase transcript parser concurrency from 24 to 32 workers for the current window.",
    affectedArtifacts: 1_942,
    evidence: ["Parser worker metrics 09:56–10:12", "Run RUN-10449 stage log"],
    history: [{ time: "10:12 AM", note: "Alert raised automatically" }, { time: "10:15 AM", note: "Acknowledged by Enterprise Architecture" }],
  },
  {
    id: "ALR-4799", title: "Apigee API validation blocked by permission restriction", severity: "Critical",
    sourceId: "src-apigee", sourceName: "Apigee API Services", runId: "RUN-10446", stageId: "validate",
    owner: "Security Engineering", status: "Open", time: "10:04 AM",
    triggerCondition: "Permission validation denied for a restricted source",
    observedValue: "2,117 artifacts denied", threshold: "0 denied artifacts",
    businessImpact: "API governance knowledge cannot be published, leaving architecture decisions without current interface evidence.",
    technicalImpact: "Run RUN-10446 blocked at Validate; queue holding 2,117 artifacts with no retry path.",
    recommendedAction: "Request a scoped permission grant for the Apigee service account, then resume the blocked run.",
    affectedArtifacts: 2_117,
    evidence: ["Permission decision PD-2201", "Restricted policy RS-14", "Run RUN-10446 stage log"],
    history: [{ time: "10:04 AM", note: "Alert raised automatically" }],
  },
  {
    id: "ALR-4798", title: "Normalization confidence below threshold for scanned PDFs", severity: "Medium",
    sourceId: "src-confluence", sourceName: "Confluence Cloud", runId: "RUN-10452", stageId: "normalize",
    owner: "Data Operations", status: "Acknowledged", time: "9:47 AM",
    triggerCondition: "Normalization confidence below 0.85 for more than 500 artifacts",
    observedValue: "0.79 mean confidence", threshold: "0.85 mean confidence",
    businessImpact: "Scanned policy documents may enter extraction with incomplete structure, weakening derived requirements.",
    technicalImpact: "942 artifacts flagged for reprocessing with the enhanced OCR profile.",
    recommendedAction: "Reprocess affected artifacts using the high-fidelity OCR normalization profile.",
    affectedArtifacts: 942,
    evidence: ["Confidence histogram 09:00–09:47", "Normalization sample set NS-118"],
    history: [{ time: "9:47 AM", note: "Alert raised automatically" }, { time: "9:52 AM", note: "Acknowledged by Data Operations" }],
  },
  {
    id: "ALR-4797", title: "Publishing delayed for restricted content", severity: "High",
    sourceId: "src-slack", sourceName: "Slack Enterprise", runId: "RUN-10450", stageId: "publish",
    owner: "Compliance", status: "Open", time: "9:39 AM",
    triggerCondition: "Restricted artifacts awaiting compliance review beyond 30 minutes",
    observedValue: "7,120 artifacts waiting", threshold: "2,000 artifacts waiting",
    businessImpact: "Regulated knowledge is not yet available to decision workflows that depend on it.",
    technicalImpact: "Publishing queue depth elevated; Cognitive Memory writes deferred for restricted partitions.",
    recommendedAction: "Assign a compliance reviewer to clear the restricted publishing queue.",
    affectedArtifacts: 7_120,
    evidence: ["Compliance queue CQ-2025-05-13", "Restricted partition metrics"],
    history: [{ time: "9:39 AM", note: "Alert raised automatically" }],
  },
];

/* -------------------------------- activity -------------------------------- */

export const activities: PipelineActivity[] = [
  { id: "act-1", timestamp: "10:18 AM", eventType: "Stage transition", title: "New Confluence batch entered Normalize", description: "124,532 artifacts moved from Parse into Normalize.", sourceName: "Confluence Cloud", stageId: "normalize", severity: "Info", owner: "Engineering Operations", runId: "RUN-10452" },
  { id: "act-2", timestamp: "10:14 AM", eventType: "Backlog", title: "Validation queue increased 11 percent", description: "Validate queue depth rose from 46K to 51K artifacts.", sourceName: "All sources", stageId: "validate", severity: "Medium", owner: "Compliance" },
  { id: "act-3", timestamp: "10:11 AM", eventType: "Quality", title: "Artifact schema drift detected in Slack export", description: "Payload shape no longer matches canonical chat schema v5.", sourceName: "Slack Enterprise", stageId: "normalize", severity: "High", owner: "Data Operations", runId: "RUN-10450" },
  { id: "act-4", timestamp: "10:09 AM", eventType: "Run completed", title: "Publish job completed for GitHub Enterprise", description: "55,820 artifacts published to Cognitive Memory.", sourceName: "GitHub Enterprise", stageId: "publish", severity: "Info", owner: "Platform Engineering", runId: "RUN-10448" },
  { id: "act-5", timestamp: "10:06 AM", eventType: "Retry", title: "Parse retry completed for Zoom transcript batch", description: "1,140 transcripts reprocessed successfully after timeout.", sourceName: "Zoom Transcripts", stageId: "parse", severity: "Low", owner: "Enterprise Architecture", runId: "RUN-10449" },
  { id: "act-6", timestamp: "10:03 AM", eventType: "Source registered", title: "New telemetry stream registered from Prometheus", description: "Stream added to discovery boundary pending first run.", sourceName: "Prometheus", stageId: "discover", severity: "Info", owner: "Site Reliability Engineering" },
  { id: "act-7", timestamp: "9:58 AM", eventType: "Permission", title: "Restricted content routed to validation review", description: "7,120 restricted artifacts routed for compliance review.", sourceName: "Slack Enterprise", stageId: "validate", severity: "High", owner: "Compliance", runId: "RUN-10450" },
];

export const activityEventTypes = ["All", ...Array.from(new Set(activities.map((a) => a.eventType)))];

/* --------------------------------- quality -------------------------------- */

export const qualityMetrics: QualityMetric[] = [
  {
    id: "qm-parse", name: "Parse Accuracy", currentValue: 96, targetValue: 95, variance: 1,
    trend: [94, 94, 95, 95, 96, 96, 96], status: "On target", affectedArtifactCount: 1_498,
    definition: "Share of parsed artifacts whose extracted structure matches a verified reference sample.",
    topFailureCauses: [{ cause: "Transcript timeout", count: 1_380 }, { cause: "Unsupported legacy format", count: 118 }],
    sourceDistribution: [{ label: "Zoom Transcripts", value: 62 }, { label: "Confluence Cloud", value: 24 }, { label: "Slack Enterprise", value: 14 }],
    artifactDistribution: [{ label: "Meeting Transcripts", value: 58 }, { label: "Documents", value: 26 }, { label: "Chat Messages", value: 16 }],
    affectedStages: ["Parse"], affectedTeams: ["Enterprise Architecture", "Data Operations"],
    recommendedActions: ["Increase transcript parser concurrency", "Enable the legacy format converter"],
    recentChanges: ["Parser v5.8 deployed 2025-05-11"],
  },
  {
    id: "qm-normalize", name: "Normalization Completeness", currentValue: 94, targetValue: 95, variance: -1,
    trend: [95, 95, 94, 94, 94, 94, 94], status: "Below target", affectedArtifactCount: 1_428,
    definition: "Share of normalized records containing every required canonical field.",
    topFailureCauses: [{ cause: "Low confidence OCR", count: 942 }, { cause: "Schema drift", count: 310 }, { cause: "Unresolved entity", count: 176 }],
    sourceDistribution: [{ label: "Confluence Cloud", value: 55 }, { label: "Slack Enterprise", value: 27 }, { label: "Jira Engineering", value: 18 }],
    artifactDistribution: [{ label: "Documents", value: 61 }, { label: "Chat Messages", value: 24 }, { label: "Tickets", value: 15 }],
    affectedStages: ["Normalize"], affectedTeams: ["Data Operations"],
    recommendedActions: ["Reprocess scanned PDFs with high-fidelity OCR", "Update the chat canonical schema to v6"],
    recentChanges: ["Canonical schema v5 in effect since 2025-04-30"],
  },
  {
    id: "qm-extract", name: "Extraction Confidence", currentValue: 92, targetValue: 90, variance: 2,
    trend: [90, 90, 91, 91, 92, 92, 92], status: "On target", affectedArtifactCount: 604,
    definition: "Mean model confidence for business conditions extracted from normalized artifacts.",
    topFailureCauses: [{ cause: "No conditions found", count: 604 }],
    sourceDistribution: [{ label: "Slack Enterprise", value: 68 }, { label: "Jira Engineering", value: 32 }],
    artifactDistribution: [{ label: "Chat Messages", value: 70 }, { label: "Tickets", value: 30 }],
    affectedStages: ["Extract"], affectedTeams: ["Enterprise Architecture"],
    recommendedActions: ["Exclude low-signal channels from extraction"],
    recentChanges: ["Extraction model v4.4 deployed 2025-05-06"],
  },
  {
    id: "qm-validate", name: "Validation Pass Rate", currentValue: 95, targetValue: 97, variance: -2,
    trend: [97, 97, 96, 96, 95, 95, 95], status: "Below target", affectedArtifactCount: 5_361,
    definition: "Share of artifacts passing policy, permission, and evidence validation on first attempt.",
    topFailureCauses: [{ cause: "Policy threshold", count: 3_244 }, { cause: "Permission block", count: 2_117 }],
    sourceDistribution: [{ label: "Slack Enterprise", value: 60 }, { label: "Apigee API Services", value: 40 }],
    artifactDistribution: [{ label: "Chat Messages", value: 60 }, { label: "API Definitions", value: 40 }],
    affectedStages: ["Validate"], affectedTeams: ["Customer Support", "Security Engineering", "Compliance"],
    recommendedActions: ["Scope the Slack validation policy", "Request an Apigee permission grant"],
    recentChanges: ["Policy engine v4.4 deployed 2025-05-06"],
  },
  {
    id: "qm-publish", name: "Publishing Integrity", currentValue: 98, targetValue: 98, variance: 0,
    trend: [97, 98, 98, 98, 98, 98, 98], status: "On target", affectedArtifactCount: 88,
    definition: "Share of published records written to Cognitive Memory with complete evidence linkage.",
    topFailureCauses: [{ cause: "Transient memory write retry", count: 88 }],
    sourceDistribution: [{ label: "GitHub Enterprise", value: 100 }],
    artifactDistribution: [{ label: "Code Assets", value: 100 }],
    affectedStages: ["Publish"], affectedTeams: ["Platform Engineering"],
    recommendedActions: ["No action required"],
    recentChanges: ["Publisher v6.0 deployed 2025-05-10"],
  },
];

/* ------------------------------- composition ------------------------------ */

export const composition: ArtifactComposition[] = [
  { artifactType: "Documents", category: "Documents", count: 133_836, percentage: 32, averageSize: "412 KB", averageProcessingTime: "3.1 min", successRate: 97.8, primaryBottleneck: "Normalize", color: "#2563eb" },
  { artifactType: "Tickets", category: "Tickets", count: 75_283, percentage: 18, averageSize: "48 KB", averageProcessingTime: "2.4 min", successRate: 98.2, primaryBottleneck: "Extract", color: "#0d9488" },
  { artifactType: "Chat Messages", category: "Chat", count: 58_553, percentage: 14, averageSize: "6 KB", averageProcessingTime: "1.9 min", successRate: 94.8, primaryBottleneck: "Validate", color: "#7c3aed" },
  { artifactType: "Meeting Transcripts", category: "Meetings", count: 29_277, percentage: 7, averageSize: "186 KB", averageProcessingTime: "5.2 min", successRate: 92.7, primaryBottleneck: "Parse", color: "#ea580c" },
  { artifactType: "Code Assets", category: "Code", count: 37_641, percentage: 9, averageSize: "24 KB", averageProcessingTime: "1.6 min", successRate: 99.1, primaryBottleneck: "Publish", color: "#0891b2" },
  { artifactType: "API Definitions", category: "APIs", count: 25_094, percentage: 6, averageSize: "88 KB", averageProcessingTime: "2.8 min", successRate: 88.9, primaryBottleneck: "Validate", color: "#dc2626" },
  { artifactType: "Telemetry Events", category: "Telemetry", count: 58_553, percentage: 14, averageSize: "2 KB", averageProcessingTime: "0.9 min", successRate: 99.4, primaryBottleneck: "Ingest", color: "#64748b" },
];

/* --------------------------------- charts --------------------------------- */

export const throughputSeries = Array.from({ length: 12 }, (_, i) => {
  const hour = (10 + i) % 24;
  const label = `${((hour + 11) % 12) + 1}${hour < 12 ? "AM" : "PM"}`;
  const entering = 11_200 + ((i * 617) % 2_400);
  const published = entering - 900 - ((i * 233) % 700);
  return { time: label, entering, published, target: 12_000 };
});

export const queueDepthSeries = stages.map((s) => ({ stage: s.name, depth: s.pendingCount, target: 30_000 }));

export const processingTimeSeries = [
  { stage: "Discover", average: 0.3, p95: 0.52 },
  { stage: "Ingest", average: 0.6, p95: 0.98 },
  { stage: "Parse", average: 0.9, p95: 1.7 },
  { stage: "Normalize", average: 1.4, p95: 2.6 },
  { stage: "Extract", average: 1.8, p95: 3.1 },
  { stage: "Validate", average: 2.1, p95: 4.2 },
  { stage: "Publish", average: 0.8, p95: 1.4 },
];

export const failureSeries = stages.map((s) => ({
  stage: s.name,
  failures: s.failedCount * 320 + s.warningCount * 60,
  retries: s.warningCount * 180 + 40,
}));

/* -------------------------------- readiness ------------------------------- */

export const readiness: OutputReadiness = {
  readyForExtraction: "2.2M",
  awaitingHumanValidation: "51K",
  blockedByPermissions: "7K",
  publishedToMemory: "1.8M",
  personaUpdatesPending: 14,
  graphUpdatesPending: 9,
};

/* --------------------------------- KPIs ---------------------------------- */

export const kpiTrends = {
  runs: [19, 20, 21, 21, 22, 22, 23],
  artifacts: [372, 381, 389, 396, 402, 410, 418],
  duration: [4.6, 4.4, 4.3, 4.1, 4.0, 3.9, 3.8],
  success: [95.9, 96.2, 96.5, 96.8, 97.0, 97.1, 97.2],
  readiness: [85, 86, 87, 88, 89, 90, 91],
};

/* ------------------------------- scenarios -------------------------------- */

export type DemoScenario =
  | "healthy" | "validation-backlog" | "parsing-failure" | "permission-block"
  | "low-confidence" | "publishing-delay" | "volume-surge" | "restricted-review"
  | "backfill-running" | "paused";

export interface ScenarioSnapshot {
  label: string;
  banner: string | null;
  pipelineState: PipelineState;
  activeRuns: number;
  healthyRuns: number;
  warningRuns: number;
  blockedRuns: number;
  artifactsInFlight: string;
  artifactsChange: string;
  averageProcessingTime: string;
  processingChange: string;
  successRate: string;
  readinessPercent: string;
  readyLabel: string;
  stageOverrides: Partial<Record<StageId, Partial<PipelineStage>>>;
  runOverrides: Partial<Record<string, Partial<PipelineRun>>>;
  readinessOverride?: Partial<OutputReadiness>;
  extraAlerts: PipelineAlert[];
  extraActivities: PipelineActivity[];
  degradedPanels: Partial<Record<"lifecycle" | "runs" | "quality" | "alerts" | "throughput" | "readiness", string>>;
}

const base: ScenarioSnapshot = {
  label: "Healthy Pipeline",
  banner: null,
  pipelineState: "Running",
  activeRuns: 23, healthyRuns: 19, warningRuns: 3, blockedRuns: 1,
  artifactsInFlight: "418,237", artifactsChange: "+12% vs last hour",
  averageProcessingTime: "3.8 min", processingChange: "-9% vs yesterday",
  successRate: "97.2%", readinessPercent: "91%", readyLabel: "2.2M artifacts ready",
  stageOverrides: {}, runOverrides: {}, extraAlerts: [], extraActivities: [], degradedPanels: {},
};

const act = (id: string, title: string, stageId: StageId, severity: Severity, owner: string): PipelineActivity => ({
  id, timestamp: "10:20 AM", eventType: "Scenario", title, description: title,
  sourceName: "All sources", stageId, severity, owner,
});

export const scenarioSnapshots: Record<DemoScenario, ScenarioSnapshot> = {
  healthy: base,
  "validation-backlog": {
    ...base,
    label: "Validation Backlog",
    banner: "Validation backlog building — 128K artifacts are waiting on policy and permission checks.",
    pipelineState: "Degraded",
    activeRuns: 26, healthyRuns: 18, warningRuns: 6, blockedRuns: 2,
    artifactsInFlight: "512,904", artifactsChange: "+31% vs last hour",
    averageProcessingTime: "5.6 min", processingChange: "+42% vs yesterday",
    successRate: "94.1%", readinessPercent: "82%", readyLabel: "2.0M artifacts ready",
    stageOverrides: { validate: { status: "Warning", pendingCount: 128_000, successRate: 91.4, averageDuration: "4.6 min", p95Duration: "8.1 min", slaStatus: "Breached", warningCount: 9, failedCount: 5 } },
    runOverrides: { "RUN-10450": { status: "Warning", queueDepth: 38_400, successRate: 91.2 } },
    readinessOverride: { awaitingHumanValidation: "128K", readyForExtraction: "2.0M" },
    extraAlerts: [],
    extraActivities: [act("sc-vb", "Validation queue depth exceeded the 60K threshold", "validate", "High", "Compliance")],
    degradedPanels: { throughput: "Validate queue depth is 2.5x the operating target.", readiness: "Human validation queue is above capacity." },
  },
  "parsing-failure": {
    ...base,
    label: "Parsing Failure",
    banner: "Parser failures detected — transcript and legacy document parsing is failing at an elevated rate.",
    pipelineState: "Degraded",
    activeRuns: 22, healthyRuns: 16, warningRuns: 4, blockedRuns: 2,
    artifactsInFlight: "446,110", artifactsChange: "+18% vs last hour",
    averageProcessingTime: "4.9 min", processingChange: "+24% vs yesterday",
    successRate: "93.6%", readinessPercent: "86%", readyLabel: "2.1M artifacts ready",
    stageOverrides: { parse: { status: "Blocked", pendingCount: 96_000, successRate: 88.2, failedCount: 6, warningCount: 5, slaStatus: "Breached" } },
    runOverrides: { "RUN-10449": { status: "Blocked", successRate: 81.4, queueDepth: 9_880, estimatedCompletion: "Blocked" } },
    extraAlerts: [], extraActivities: [act("sc-pf", "Parser worker pool restarted after repeated timeouts", "parse", "Critical", "Data Operations")],
    degradedPanels: { lifecycle: "Parse is failing for transcript and legacy document formats.", quality: "Parse accuracy dropped below target." },
  },
  "permission-block": {
    ...base,
    label: "Permission Block",
    banner: "Permission block active — restricted sources cannot complete validation.",
    pipelineState: "Blocked",
    activeRuns: 23, healthyRuns: 17, warningRuns: 2, blockedRuns: 4,
    successRate: "95.4%", readinessPercent: "84%", readyLabel: "2.0M artifacts ready",
    stageOverrides: { validate: { status: "Blocked", pendingCount: 74_000, failedCount: 6, slaStatus: "Breached" } },
    runOverrides: { "RUN-10446": { status: "Blocked", queueDepth: 8_940 } },
    readinessOverride: { blockedByPermissions: "31K" },
    extraAlerts: [], extraActivities: [act("sc-pb", "Permission denial recorded for 3 restricted sources", "validate", "Critical", "Security Engineering")],
    degradedPanels: { alerts: "Restricted sources are blocked pending a permission grant." },
  },
  "low-confidence": {
    ...base,
    label: "Low Confidence Normalization",
    banner: "Normalization confidence degraded — scanned and image-heavy artifacts are below threshold.",
    pipelineState: "Degraded",
    successRate: "95.8%", readinessPercent: "88%", readyLabel: "2.1M artifacts ready",
    stageOverrides: { normalize: { status: "Warning", successRate: 91.2, pendingCount: 78_000, warningCount: 7, slaStatus: "At risk" } },
    runOverrides: { "RUN-10452": { status: "Warning", successRate: 92.6 } },
    extraAlerts: [], extraActivities: [act("sc-lc", "Normalization confidence fell to 0.74 for scanned documents", "normalize", "High", "Data Operations")],
    degradedPanels: { quality: "Normalization completeness is well below target." },
  },
  "publishing-delay": {
    ...base,
    label: "Publishing Delay",
    banner: "Publishing delayed — Cognitive Memory writes are queued behind compliance review.",
    pipelineState: "Degraded",
    readinessPercent: "79%", readyLabel: "1.9M artifacts ready",
    stageOverrides: { publish: { status: "Warning", pendingCount: 96_000, averageDuration: "3.4 min", p95Duration: "6.2 min", slaStatus: "Breached" } },
    runOverrides: { "RUN-10448": { status: "Warning", queueDepth: 12_400 } },
    readinessOverride: { publishedToMemory: "1.6M", personaUpdatesPending: 38, graphUpdatesPending: 27 },
    extraAlerts: [], extraActivities: [act("sc-pd", "Publishing queue exceeded target depth", "publish", "High", "Compliance")],
    degradedPanels: { readiness: "Persona and graph updates are accumulating." },
  },
  "volume-surge": {
    ...base,
    label: "High Volume Surge",
    banner: "High volume surge — intake is running 3.1x above the normal operating rate.",
    activeRuns: 41, healthyRuns: 33, warningRuns: 7, blockedRuns: 1,
    artifactsInFlight: "1,284,660", artifactsChange: "+212% vs last hour",
    averageProcessingTime: "4.4 min", processingChange: "+16% vs yesterday",
    successRate: "96.4%",
    stageOverrides: {
      discover: { pendingCount: 64_000, throughput: "31.8K/min" },
      ingest: { pendingCount: 88_000, throughput: "30.2K/min" },
      normalize: { pendingCount: 112_000, status: "Warning", slaStatus: "At risk" },
    },
    runOverrides: {}, extraAlerts: [],
    extraActivities: [act("sc-vs", "Autoscaler added 48 workers across Ingest and Normalize", "ingest", "Info", "Platform Engineering")],
    degradedPanels: { throughput: "Intake exceeds the configured target throughput." },
  },
  "restricted-review": {
    ...base,
    label: "Restricted Content Review",
    banner: "Restricted content review in progress — regulated artifacts are held for human validation.",
    readinessPercent: "85%", readyLabel: "2.1M artifacts ready",
    stageOverrides: { validate: { status: "Warning", pendingCount: 82_000 } },
    runOverrides: { "RUN-10450": { accessClassification: "Restricted", status: "Warning" } },
    readinessOverride: { awaitingHumanValidation: "82K", blockedByPermissions: "19K" },
    extraAlerts: [], extraActivities: [act("sc-rr", "19K restricted artifacts routed to compliance review", "validate", "Medium", "Compliance")],
    degradedPanels: {},
  },
  "backfill-running": {
    ...base,
    label: "Backfill in Progress",
    banner: "Historical backfill running — additional load is being applied across Parse, Normalize, and Validate.",
    activeRuns: 34, healthyRuns: 27, warningRuns: 6, blockedRuns: 1,
    artifactsInFlight: "884,120", artifactsChange: "+96% vs last hour",
    stageOverrides: { parse: { pendingCount: 68_000 }, normalize: { pendingCount: 91_000 }, validate: { pendingCount: 84_000 } },
    runOverrides: {}, extraAlerts: [],
    extraActivities: [act("sc-bf", "Backfill job BF-2044 processing 30 days of historical content", "normalize", "Info", "Data Operations")],
    degradedPanels: {},
  },
  paused: {
    ...base,
    label: "Pipeline Paused",
    banner: "Pipeline paused — no new artifacts are entering the lifecycle. Existing queues are held in place.",
    pipelineState: "Paused",
    activeRuns: 0, healthyRuns: 0, warningRuns: 0, blockedRuns: 0,
    artifactsInFlight: "418,237", artifactsChange: "held in queue",
    averageProcessingTime: "—", processingChange: "paused",
    successRate: "97.2%", readinessPercent: "91%", readyLabel: "2.2M artifacts ready",
    stageOverrides: Object.fromEntries(stages.map((s) => [s.id, { status: "Paused" as StageStatus, throughput: "0/min" }])) as Partial<Record<StageId, Partial<PipelineStage>>>,
    runOverrides: Object.fromEntries(runs.map((r) => [r.id, { status: "Paused" as RunStatus }])),
    extraAlerts: [], extraActivities: [act("sc-pp", "Pipeline paused by operator", "discover", "Medium", "Alex Valencia")],
    degradedPanels: {},
  },
};

export const demoScenarios: { id: DemoScenario; label: string }[] =
  (Object.keys(scenarioSnapshots) as DemoScenario[]).map((id) => ({ id, label: scenarioSnapshots[id].label }));

/* ------------------------------ derivations ------------------------------- */

export function resolveStages(scenario: DemoScenario, filters: Filters, paused: Set<StageId>, pipelinePaused: boolean): PipelineStage[] {
  const snap = scenarioSnapshots[scenario];
  return stages.map((s) => {
    const merged: PipelineStage = { ...s, ...(snap.stageOverrides[s.id] ?? {}) };
    if (pipelinePaused || paused.has(s.id)) {
      return { ...merged, status: "Paused", throughput: "0/min" };
    }
    if (filters.pipelineStage !== "All" && filters.pipelineStage !== s.name) {
      return { ...merged, pendingCount: Math.round(merged.pendingCount * 0.35) };
    }
    return merged;
  });
}

export function resolveRuns(scenario: DemoScenario, filters: Filters, overrides: Record<string, Partial<PipelineRun>>): PipelineRun[] {
  const snap = scenarioSnapshots[scenario];
  return runs
    .map((r) => ({ ...r, ...(snap.runOverrides[r.id] ?? {}), ...(overrides[r.id] ?? {}) }))
    .filter((r) =>
      (filters.businessUnit === "All" || r.businessUnit === filters.businessUnit) &&
      (filters.team === "All" || r.owner === filters.team) &&
      (filters.knowledgeDomain === "All" || r.knowledgeDomain === filters.knowledgeDomain) &&
      (filters.sourceCategory === "All" || r.sourceCategory === filters.sourceCategory) &&
      (filters.sourcePlatform === "All" || r.sourceName === filters.sourcePlatform) &&
      (filters.pipelineStage === "All" || stageName(r.currentStageId) === filters.pipelineStage) &&
      (filters.runStatus === "All" || r.status === filters.runStatus) &&
      (filters.owner === "All" || r.owner === filters.owner) &&
      (filters.accessClassification === "All" || r.accessClassification === filters.accessClassification) &&
      (filters.environment === "All" || r.environment === filters.environment),
    );
}

export function resolveAlerts(scenario: DemoScenario, filters: Filters, statusOverrides: Record<string, AlertStatus>): PipelineAlert[] {
  const snap = scenarioSnapshots[scenario];
  return [...snap.extraAlerts, ...alerts]
    .map((a) => ({ ...a, status: statusOverrides[a.id] ?? a.status }))
    .filter((a) =>
      (filters.severity === "All" || a.severity === filters.severity) &&
      (filters.owner === "All" || a.owner === filters.owner) &&
      (filters.pipelineStage === "All" || stageName(a.stageId) === filters.pipelineStage) &&
      (filters.sourcePlatform === "All" || a.sourceName === filters.sourcePlatform),
    );
}

export function resolveActivities(scenario: DemoScenario, filters: Filters, extra: PipelineActivity[]): PipelineActivity[] {
  const snap = scenarioSnapshots[scenario];
  return [...extra, ...snap.extraActivities, ...activities].filter((a) =>
    (filters.severity === "All" || a.severity === filters.severity) &&
    (filters.pipelineStage === "All" || stageName(a.stageId) === filters.pipelineStage) &&
    (filters.owner === "All" || a.owner === filters.owner),
  );
}

export const searchCatalog = [
  ...runs.map((r) => ({ id: r.id, type: "Pipeline Runs", title: r.id, source: r.sourceName, stage: stageName(r.currentStageId), status: r.status, owner: r.owner, time: r.startedAt })),
  ...stages.map((s) => ({ id: s.id, type: "Stages", title: s.name, source: "Pipeline", stage: s.name, status: s.status, owner: s.owner, time: "now" })),
  ...alerts.map((a) => ({ id: a.id, type: "Alerts", title: a.title, source: a.sourceName, stage: stageName(a.stageId), status: a.status, owner: a.owner, time: a.time })),
  ...Object.values(stageErrors).flat().map((e) => ({ id: e.code + e.source, type: "Errors", title: `${e.code} — ${e.description}`, source: e.source, stage: "—", status: e.severity, owner: "Data Operations", time: e.lastSeen })),
  ...composition.map((c) => ({ id: c.artifactType, type: "Artifacts", title: c.artifactType, source: "All sources", stage: c.primaryBottleneck, status: `${c.successRate}%`, owner: "—", time: "now" })),
  ...filterOptions.owner.slice(1).map((o) => ({ id: o, type: "Owners", title: o, source: "—", stage: "—", status: "Active", owner: o, time: "—" })),
  ...filterOptions.businessUnit.slice(1).map((b) => ({ id: b, type: "Business Units", title: b, source: "—", stage: "—", status: "Active", owner: b, time: "—" })),
  ...filterOptions.knowledgeDomain.slice(1).map((d) => ({ id: d, type: "Knowledge Domains", title: d, source: "—", stage: "—", status: "Active", owner: "—", time: "—" })),
];

export const notificationSeed = [
  { id: "pn-1", title: "Apigee API validation blocked by permission restriction", type: "Permission block", time: "2 min ago", read: false },
  { id: "pn-2", title: "Validate queue depth exceeded the backlog threshold", type: "Backlog threshold exceeded", time: "6 min ago", read: false },
  { id: "pn-3", title: "Parse stage degraded for transcript workloads", type: "Stage degraded", time: "14 min ago", read: false },
  { id: "pn-4", title: "Publish job completed for GitHub Enterprise", type: "Run completed", time: "21 min ago", read: true },
  { id: "pn-5", title: "Normalization quality threshold missed for scanned PDFs", type: "Quality threshold missed", time: "33 min ago", read: true },
  { id: "pn-6", title: "Team Persona update created for Platform Engineering", type: "Persona update created", time: "48 min ago", read: true },
];
