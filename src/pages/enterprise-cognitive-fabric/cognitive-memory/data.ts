/**
 * Enterprise Cognitive Memory — deterministic seeded domain data.
 * No backend, vector DB, graph DB, or model calls. All synthetic enterprise content.
 * Structured so seeds can be swapped for API responses without redesigning the page.
 */

/* ------------------------------- core models ------------------------------ */

export type MemoryView = "executive" | "explorer" | "architecture" | "governance";

export type MemoryRecordType =
  | "Evidence Record" | "Canonical Artifact" | "Business Condition" | "Team Persona"
  | "Entity" | "Relationship" | "Policy" | "Risk" | "Control"
  | "Decision" | "Outcome" | "Learning Record";

export type AuthorityLevel =
  | "Primary" | "Supporting" | "Registry Verified" | "Observed Production Outcome"
  | "Outcome Validated" | "Historical" | "Reference" | "Unconfirmed";

export type ApprovalState =
  | "Approved" | "Approved with Conditions" | "Conflict Review" | "Pending Review" | "Draft" | "Superseded";

export type FreshnessStatus = "Current" | "Aging" | "Stale" | "Unknown";

export type AccessClassification = "Public" | "Internal" | "Confidential" | "Restricted";

export interface StructuredCondition {
  subject: string; operator: string; value: string; unit: string;
  baseline: string; target: string; threshold: string; effectiveDate: string;
  teams: string[]; systems: string[]; dependencies: string[]; risks: string[]; controls: string[];
}

export interface StructuredPersona {
  mission: string; capabilities: string[]; products: string[]; services: string[];
  customers: string[]; objectives: string[]; metrics: string[]; constraints: string[];
  dependencies: string[]; risks: string[]; decisionLogic: string[]; howThisTeamThinks: string[];
}

export interface StructuredDecision {
  decisionStatement: string; alternatives: string[]; selectedOption: string;
  expectedOutcomes: string[]; approvers: string[]; affectedPersonas: string[];
  conditions: string[]; evidence: string[];
}

export interface StructuredOutcome {
  expectedResult: string; observedResult: string; variance: string;
  customerImpact: string; operationalImpact: string; lessons: string[];
}

export interface StructuredLearning {
  observedOutcome: string; validatedLesson: string; conditionsUpdated: string[];
  controlsUpdated: string[]; personaSectionsUpdated: string[]; confidenceChanges: string[];
}

export interface EvidenceReference {
  id: string; sourceArtifact: string; passage: string; authority: AuthorityLevel;
  confidence: number; hash: string; capturedAt: string; permissions: string;
}

export interface MemoryRelationship {
  id: string; sourceRecordId: string; relationshipType: RelationshipType; targetRecordId: string;
  targetLabel: string; confidence: number; evidenceReferenceIds: string[];
  effectiveDate: string; expirationDate: string | null; status: "Active" | "Pending" | "Retired";
}

export type RelationshipType =
  | "OWNS" | "DEPENDS ON" | "PROVIDES TO" | "SUPPORTS" | "MEASURED BY" | "GOVERNED BY"
  | "REQUIRES APPROVAL FROM" | "INFORMED" | "RESULTED IN" | "UPDATED BY" | "LEARNED FROM";

export interface MemoryIndexRecord {
  id: string; memoryRecordId: string; indexType: string; indexStatus: string;
  semanticMetadata: string; searchFacets: string[]; accessFilters: string[];
  embeddingMetadataPlaceholder: string; indexedAt: string; version: string;
}

export interface MemoryVersion {
  version: string; state: "Current" | "Prior" | "Superseded"; effectivePeriod: string; summary: string;
}

export interface MemoryRecord {
  id: string;
  recordType: MemoryRecordType;
  title: string;
  description: string;
  knowledgeDomains: string[];
  businessUnit: string;
  businessPurpose: string;
  memoryLayer: string;
  teamIds: string[]; productIds: string[]; serviceIds: string[]; systemIds: string[];
  customerJourneyIds: string[];
  owner: string; businessOwner: string; technicalOwner: string; dataSteward: string; securityOwner: string;
  authorityLevel: AuthorityLevel;
  approvalState: ApprovalState;
  qualityScore: number;
  confidence: number;
  freshnessStatus: FreshnessStatus;
  accessClassification: AccessClassification;
  approvedConsumers: string[]; restrictedConsumers: string[];
  regulatoryScope: string; dataResidency: string;
  evidence: EvidenceReference[];
  evidenceCount: number;
  relationshipIds: string[];
  relationshipCount: number;
  sourceRecordIds: string[];
  consumerIds: string[];
  reuseCount: number;
  decisionImpact: string;
  indexStatus: string;
  version: string;
  versions: MemoryVersion[];
  effectiveDate: string; expirationDate: string | null;
  createdAt: string; updatedAt: string; publishedAt: string;
  lastSourceUpdate: string;
  reviewState: string;
  evidenceCoverage: number;
  sourceCategory: string; sourcePlatform: string;
  environment: string; region: string;
  structured?: {
    condition?: StructuredCondition; persona?: StructuredPersona; decision?: StructuredDecision;
    outcome?: StructuredOutcome; learning?: StructuredLearning; entity?: Record<string, string>;
  };
}

export interface DecisionMemoryRecord {
  id: string; decisionId: string; decisionStatement: string; alternatives: string[];
  selectedOption: string; expectedOutcomes: string[]; actualOutcomeIds: string[];
  affectedPersonaIds: string[]; conditionIds: string[]; evidenceReferenceIds: string[];
  approverIds: string[]; decisionDate: string; status: string;
}

export interface OutcomeMemoryRecord {
  id: string; outcomeId: string; decisionId: string; expectedResult: string; observedResult: string;
  variance: string; customerImpact: string; businessImpact: string; operationalImpact: string;
  telemetryEvidenceIds: string[]; lessons: string[]; validatedAt: string;
}

export interface MemoryLearningRecord {
  id: string; decisionId: string; outcomeId: string; lesson: string;
  affectedConditionIds: string[]; affectedPersonaIds: string[]; controlUpdates: string[];
  confidenceUpdates: string[]; memoryUpdateIds: string[]; approvedBy: string; publishedAt: string;
}

export interface MemoryLifecycleStage {
  id: string; name: string; sequence: number;
  status: "Running" | "Warning" | "Paused" | "Failed" | "Idle";
  processedCount: number; pendingCount: number; failedCount: number; warningCount: number;
  successRate: number; averageDuration: string; p95Duration: string; throughput: string;
  slaStatus: string; owner: string; configurationVersion: string;
  completedThisHour: number; reviewRequired: number;
  summary: string;
}

export interface MemoryIndexingJob {
  id: string; memoryLayer: string; scope: string; status: "Running" | "Warning" | "Paused" | "Failed";
  recordCount: number; indexedCount: number; pendingCount: number; failedCount: number;
  coverage: number; startedAt: string; elapsedTime: string; owner: string;
  configurationVersion: string; warnings: string; throughput: string;
  averageDuration: string; p95Duration: string;
}

export interface MemoryQuality {
  overallScore: number;
  dimensions: QualityDimension[];
}

export interface QualityDimension {
  key: string; name: string; current: number; target: number; trend: number[];
  affectedRecords: string; status: "Healthy" | "Attention" | "At Risk";
}

export interface MemoryQuery {
  id: string; question: string; filters: Record<string, string>;
  includedRecordIds: string[]; excludedRecordIds: string[]; resultSummary: string;
  conclusions: string[]; supportingRecordIds: string[]; evidenceReferenceIds: string[];
  relationshipPaths: string[]; confidence: number; createdAt: string;
}

/* --------------------------------- filters -------------------------------- */

export interface MemoryFilters {
  memoryType: string; businessUnit: string; team: string; knowledgeDomain: string;
  businessCapability: string; product: string; service: string; system: string;
  customerJourney: string; sourceCategory: string; sourcePlatform: string; owner: string;
  authority: string; approvalState: string; accessClassification: string; freshness: string;
  confidenceBand: string; qualityBand: string; evidenceCoverage: string; versionStatus: string;
  relationshipType: string; environment: string; region: string; dataResidency: string;
  effectiveDate: string; timeRange: string;
}

export const defaultMemoryFilters: MemoryFilters = {
  memoryType: "All", businessUnit: "All", team: "All", knowledgeDomain: "All",
  businessCapability: "All", product: "All", service: "All", system: "All",
  customerJourney: "All", sourceCategory: "All", sourcePlatform: "All", owner: "All",
  authority: "All", approvalState: "All", accessClassification: "All", freshness: "All",
  confidenceBand: "All", qualityBand: "All", evidenceCoverage: "All", versionStatus: "All",
  relationshipType: "All", environment: "All", region: "All", dataResidency: "All",
  effectiveDate: "All", timeRange: "Last 30 Days",
};

export const memoryFilterOptions: Record<keyof MemoryFilters, string[]> = {
  memoryType: ["All", "Evidence Record", "Canonical Artifact", "Business Condition", "Team Persona", "Entity", "Policy", "Decision", "Outcome", "Learning Record"],
  businessUnit: ["All", "Commerce", "Platform Engineering", "Risk & Compliance", "Customer Operations"],
  team: ["All", "Payments Platform", "Checkout Engineering", "Fraud Engineering", "Identity Engineering", "Site Reliability Engineering", "Release Governance"],
  knowledgeDomain: ["All", "Payments & Reliability", "Payments & Commerce", "Identity & Access", "Fraud & Risk", "Release Governance", "Customer Experience"],
  businessCapability: ["All", "Payment Authorization", "Checkout", "Identity Verification", "Fraud Decisioning", "Release Management"],
  product: ["All", "Commerce Checkout", "Payments API", "Identity Suite"],
  service: ["All", "Payments API", "Retry Orchestrator", "Identity Services", "Fraud Decision Service", "Regional Token Vault"],
  system: ["All", "Core Ledger", "Token Vault", "Event Bus", "Observability Platform"],
  customerJourney: ["All", "Checkout", "Account Creation", "Refunds", "Dispute Resolution"],
  sourceCategory: ["All", "Documentation", "Architecture", "Meeting Transcript", "Telemetry", "Policy Register", "Ticketing"],
  sourcePlatform: ["All", "Confluence", "SharePoint", "GitHub", "Jira", "ServiceNow", "Observability Platform"],
  owner: ["All", "Payments Reliability", "Payments Platform", "Checkout Engineering", "Identity Engineering", "Release Governance", "Site Reliability Engineering", "Jane Smith"],
  authority: ["All", "Primary", "Supporting", "Registry Verified", "Observed Production Outcome", "Outcome Validated", "Historical", "Reference", "Unconfirmed"],
  approvalState: ["All", "Approved", "Approved with Conditions", "Conflict Review", "Pending Review", "Draft", "Superseded"],
  accessClassification: ["All", "Public", "Internal", "Confidential", "Restricted"],
  freshness: ["All", "Current", "Aging", "Stale", "Unknown"],
  confidenceBand: ["All", "95% and above", "90% to 94%", "80% to 89%", "Below 80%"],
  qualityBand: ["All", "95 and above", "90 to 94", "80 to 89", "Below 80"],
  evidenceCoverage: ["All", "Complete", "Partial", "Missing"],
  versionStatus: ["All", "Current", "Prior", "Superseded"],
  relationshipType: ["All", "OWNS", "DEPENDS ON", "PROVIDES TO", "SUPPORTS", "MEASURED BY", "GOVERNED BY", "REQUIRES APPROVAL FROM", "INFORMED", "RESULTED IN", "UPDATED BY", "LEARNED FROM"],
  environment: ["All", "Production", "Staging", "Corporate"],
  region: ["All", "North America", "European Union", "Asia Pacific"],
  dataResidency: ["All", "US", "EU", "APAC", "Global"],
  effectiveDate: ["All", "Effective Now", "Future Dated", "Expired"],
  timeRange: ["Last 24 Hours", "Last 7 Days", "Last 30 Days", "Last 90 Days", "Last Year", "All Time", "Custom"],
};

export const memoryFilterLabels: Record<keyof MemoryFilters, string> = {
  memoryType: "Memory Type", businessUnit: "Business Unit", team: "Team",
  knowledgeDomain: "Knowledge Domain", businessCapability: "Business Capability",
  product: "Product", service: "Service", system: "System", customerJourney: "Customer Journey",
  sourceCategory: "Source Category", sourcePlatform: "Source Platform", owner: "Owner",
  authority: "Authority", approvalState: "Approval State", accessClassification: "Access Classification",
  freshness: "Freshness", confidenceBand: "Confidence Band", qualityBand: "Quality Band",
  evidenceCoverage: "Evidence Coverage", versionStatus: "Version Status",
  relationshipType: "Relationship Type", environment: "Environment", region: "Region",
  dataResidency: "Data Residency", effectiveDate: "Effective Date", timeRange: "Time Range",
};

/* ---------------------------------- KPIs ---------------------------------- */

export interface MemoryKpi {
  id: string; name: string; value: string; change?: string; context: string;
  status: "Healthy" | "Attention" | "At Risk"; tooltip: string; trend: number[];
  supporting: { label: string; value: string }[];
}

export const memoryKpis: MemoryKpi[] = [
  {
    id: "kpi-records", name: "Enterprise Memory Records", value: "24.8M", change: "+1.2M this month",
    context: "Governed records across all nine memory layers", status: "Healthy",
    tooltip: "Total governed memory records including evidence, canonical artifacts, conditions, entities, relationships, decisions, outcomes, and learning.",
    trend: [21.1, 21.8, 22.3, 22.9, 23.4, 23.9, 24.3, 24.8],
    supporting: [{ label: "layers", value: "9" }, { label: "domains", value: "22" }],
  },
  {
    id: "kpi-evidence", name: "Evidence Records", value: "2.4M", change: "98% complete provenance",
    context: "Original artifacts with immutable identity and chain of custody", status: "Healthy",
    tooltip: "Preserved original evidence with content hashes, exact passages, source identity, and permissions.",
    trend: [2.0, 2.05, 2.1, 2.18, 2.24, 2.31, 2.36, 2.4],
    supporting: [{ label: "immutable IDs", value: "100%" }, { label: "hash verified", value: "99.4%" }],
  },
  {
    id: "kpi-conditions", name: "Approved Business Conditions", value: "87,442",
    context: "Current, evidence linked, reusable", status: "Healthy",
    tooltip: "Approved objectives, requirements, constraints, thresholds, policies, and decision rules available for reuse.",
    trend: [79.2, 80.9, 82.4, 83.8, 85.1, 86.0, 86.8, 87.4],
    supporting: [{ label: "conflicts", value: "148" }, { label: "pending", value: "427" }],
  },
  {
    id: "kpi-personas", name: "Active Team Personas", value: "72",
    context: "Evidence linked team operating models", status: "Attention",
    tooltip: "Team Personas registered in enterprise memory with approval and evidence state.",
    trend: [63, 65, 66, 68, 69, 70, 71, 72],
    supporting: [{ label: "Approved", value: "61" }, { label: "Review Required", value: "7" }, { label: "Draft", value: "4" }],
  },
  {
    id: "kpi-relationships", name: "Context Relationships", value: "5.8M", change: "+184K this month",
    context: "Typed relationships across the Enterprise Context Graph", status: "Healthy",
    tooltip: "Relationships connecting teams, systems, services, products, customers, conditions, Personas, decisions, and outcomes.",
    trend: [4.9, 5.0, 5.2, 5.3, 5.45, 5.6, 5.7, 5.8],
    supporting: [{ label: "teams", value: "48" }, { label: "types", value: "11" }],
  },
  {
    id: "kpi-quality", name: "Memory Quality", value: "94 / 100", change: "Target 95",
    context: "Composite trust score across eleven dimensions", status: "Healthy",
    tooltip: "Composite of evidence coverage, authority, freshness, ownership, and relationship completeness.",
    trend: [90, 91, 91, 92, 93, 93, 94, 94],
    supporting: [
      { label: "Evidence", value: "98" }, { label: "Authority", value: "93" },
      { label: "Freshness", value: "89" }, { label: "Ownership", value: "94" }, { label: "Relationships", value: "92" },
    ],
  },
];

/* ---------------------------- memory architecture -------------------------- */

export interface MemoryLayer {
  id: string; sequence: number; name: string; purpose: string;
  metrics: { label: string; value: string }[];
  consumers: string[]; storageResponsibility: string;
  status: "Operational" | "Indexing" | "Review Required";
}

export const memoryLayers: MemoryLayer[] = [
  {
    id: "evidence-vault", sequence: 1, name: "Evidence Vault",
    purpose: "Preserve original artifacts, exact passages, content hashes, versions, source identities, permissions, and chain of custody",
    metrics: [{ label: "evidence records", value: "2.4M" }, { label: "complete provenance", value: "98%" }, { label: "immutable IDs", value: "100%" }],
    consumers: ["Canonical Artifact Store", "Memory Workbench", "Decision Ledger"],
    storageResponsibility: "Immutable object preservation and chain of custody", status: "Operational",
  },
  {
    id: "canonical-store", sequence: 2, name: "Canonical Artifact Store",
    purpose: "Store normalized artifact representations, sections, tables, entities, relationships, contextual chunks, metadata, permissions, and provenance",
    metrics: [{ label: "canonical artifacts", value: "2.1M" }, { label: "structured records", value: "18.7M" }, { label: "normalization quality", value: "94%" }],
    consumers: ["Conditions Registry", "Semantic Index", "Context Graph"],
    storageResponsibility: "Normalized structure and contextual chunking", status: "Operational",
  },
  {
    id: "conditions-registry", sequence: 3, name: "Conditions Registry",
    purpose: "Store approved objectives, requirements, constraints, baselines, targets, thresholds, dependencies, risks, policies, controls, and decision rules",
    metrics: [{ label: "approved conditions", value: "87,442" }, { label: "active conflicts", value: "148" }, { label: "pending reviews", value: "427" }],
    consumers: ["Team Persona Library", "Impact Evaluation", "Decision Ledger"],
    storageResponsibility: "Governed business meaning and decision rules", status: "Review Required",
  },
  {
    id: "persona-library", sequence: 4, name: "Team Persona Library",
    purpose: "Store evidence linked team operating models, priorities, dependencies, risks, constraints, and decision logic",
    metrics: [{ label: "active Personas", value: "72" }, { label: "approved", value: "61" }, { label: "avg evidence coverage", value: "94%" }],
    consumers: ["Context Graph", "Persona Impact Analysis", "Cognitive Intake"],
    storageResponsibility: "Team perspective and decision logic", status: "Operational",
  },
  {
    id: "context-graph", sequence: 5, name: "Enterprise Context Graph",
    purpose: "Connect teams, systems, services, products, customers, conditions, evidence, Personas, decisions, and outcomes",
    metrics: [{ label: "relationships", value: "5.8M" }, { label: "teams", value: "48" }, { label: "knowledge domains", value: "22" }],
    consumers: ["Semantic Index", "Memory Workbench", "Cross Team Impact Matrix"],
    storageResponsibility: "Typed relationship topology", status: "Indexing",
  },
  {
    id: "semantic-index", sequence: 6, name: "Semantic Index",
    purpose: "Support contextual retrieval across approved records while preserving authority, freshness, access, evidence, and confidence",
    metrics: [{ label: "indexed records", value: "24.1M" }, { label: "index coverage", value: "96%" }, { label: "avg retrieval", value: "1.8 s" }],
    consumers: ["Memory Workbench", "Search Services", "MCP Context Services (Prompt 2)"],
    storageResponsibility: "Retrieval with authority and access preservation", status: "Indexing",
  },
  {
    id: "decision-ledger", sequence: 7, name: "Decision Ledger",
    purpose: "Preserve decisions, alternatives, assumptions, approvals, expected outcomes, affected Personas, business conditions, and evidence",
    metrics: [{ label: "decisions", value: "4,812" }, { label: "active evaluations", value: "186" }, { label: "evidence coverage", value: "91%" }],
    consumers: ["Outcome Ledger", "Decision Intelligence", "Memory Workbench"],
    storageResponsibility: "Decision record of the enterprise", status: "Operational",
  },
  {
    id: "outcome-ledger", sequence: 8, name: "Outcome Ledger",
    purpose: "Preserve observed results, incidents, telemetry, customer impact, operational impact, and variance from expected outcomes",
    metrics: [{ label: "outcomes", value: "3,284" }, { label: "linked decisions", value: "1,426" }, { label: "outcome linkage", value: "82%" }],
    consumers: ["Learning Records", "Organizational Learning", "Health & Governance"],
    storageResponsibility: "Observed enterprise result", status: "Review Required",
  },
  {
    id: "learning-records", sequence: 9, name: "Learning Records",
    purpose: "Preserve validated lessons created from observed outcomes",
    metrics: [{ label: "learning records", value: "1,426" }, { label: "conditions influenced", value: "842" }, { label: "Persona sections updated", value: "128" }],
    consumers: ["Conditions Registry", "Team Persona Library", "Organizational Learning"],
    storageResponsibility: "Validated organizational lessons", status: "Operational",
  },
];

export type FlowMode = "data" | "governance" | "decision" | "learning";

export interface MemoryFlow {
  id: string; from: string; to: string; label: string; modes: FlowMode[];
}

export const memoryFlows: MemoryFlow[] = [
  { id: "f1", from: "evidence-vault", to: "canonical-store", label: "Evidence → Canonical Artifacts", modes: ["data", "governance"] },
  { id: "f2", from: "canonical-store", to: "conditions-registry", label: "Canonical Artifacts → Business Conditions", modes: ["data", "governance"] },
  { id: "f3", from: "conditions-registry", to: "persona-library", label: "Business Conditions → Team Personas", modes: ["data", "governance"] },
  { id: "f4", from: "persona-library", to: "context-graph", label: "Conditions + Personas → Context Graph", modes: ["data"] },
  { id: "f5", from: "context-graph", to: "semantic-index", label: "Approved records → Semantic Index", modes: ["data", "governance"] },
  { id: "f6", from: "semantic-index", to: "decision-ledger", label: "Context → Decisions", modes: ["decision"] },
  { id: "f7", from: "decision-ledger", to: "outcome-ledger", label: "Decisions → Outcomes", modes: ["decision", "learning"] },
  { id: "f8", from: "outcome-ledger", to: "learning-records", label: "Outcomes → Learning", modes: ["learning"] },
  { id: "f9", from: "learning-records", to: "conditions-registry", label: "Learning → Future Memory Updates (historical records remain unchanged)", modes: ["learning", "governance"] },
];

/* --------------------------------- lifecycle ------------------------------- */

export const memoryLifecycleStages: MemoryLifecycleStage[] = [
  { id: "receive", name: "Receive Approved Records", sequence: 1, status: "Running", processedCount: 184220, pendingCount: 4120, failedCount: 22, warningCount: 8, successRate: 99.6, averageDuration: "0.6 s", p95Duration: "1.4 s", throughput: "3.2K / min", slaStatus: "Within SLA", owner: "Memory Platform", configurationVersion: "v4.2", completedThisHour: 18422, reviewRequired: 12, summary: "Approved conditions, Personas, decisions, and outcomes enter the memory layer." },
  { id: "identity", name: "Resolve Record Identity", sequence: 2, status: "Running", processedCount: 181980, pendingCount: 3880, failedCount: 41, warningCount: 26, successRate: 99.1, averageDuration: "0.9 s", p95Duration: "2.1 s", throughput: "2.9K / min", slaStatus: "Within SLA", owner: "Memory Platform", configurationVersion: "v4.2", completedThisHour: 17420, reviewRequired: 34, summary: "Deterministic identity resolution against canonical enterprise entities." },
  { id: "ownership", name: "Apply Ownership & Authority", sequence: 3, status: "Warning", processedCount: 176440, pendingCount: 9240, failedCount: 88, warningCount: 214, successRate: 96.4, averageDuration: "1.4 s", p95Duration: "4.8 s", throughput: "2.1K / min", slaStatus: "At Risk", owner: "Enterprise Data Governance", configurationVersion: "v4.1", completedThisHour: 12880, reviewRequired: 214, summary: "Ownership resolution backlog elevated for meeting derived records." },
  { id: "provenance", name: "Link Evidence & Provenance", sequence: 4, status: "Running", processedCount: 179220, pendingCount: 5120, failedCount: 34, warningCount: 44, successRate: 98.8, averageDuration: "1.1 s", p95Duration: "3.2 s", throughput: "2.6K / min", slaStatus: "Within SLA", owner: "Memory Platform", configurationVersion: "v4.2", completedThisHour: 16240, reviewRequired: 44, summary: "Every memory record is bound to exact source passages and hashes." },
  { id: "access", name: "Apply Access Context", sequence: 5, status: "Running", processedCount: 178900, pendingCount: 4420, failedCount: 12, warningCount: 18, successRate: 99.4, averageDuration: "0.7 s", p95Duration: "1.8 s", throughput: "3.0K / min", slaStatus: "Within SLA", owner: "Security Engineering", configurationVersion: "v3.9", completedThisHour: 16980, reviewRequired: 18, summary: "Access classification, residency, and consumer scope applied at record level." },
  { id: "relationships", name: "Create Graph Relationships", sequence: 6, status: "Running", processedCount: 168220, pendingCount: 8420, failedCount: 62, warningCount: 96, successRate: 98.1, averageDuration: "1.8 s", p95Duration: "5.4 s", throughput: "1.8K / min", slaStatus: "Within SLA", owner: "Context Graph Engineering", configurationVersion: "v2.8", completedThisHour: 11240, reviewRequired: 96, summary: "Typed relationships created across teams, systems, conditions, and decisions." },
  { id: "index", name: "Build Semantic Index", sequence: 7, status: "Running", processedCount: 162400, pendingCount: 12240, failedCount: 148, warningCount: 182, successRate: 97.2, averageDuration: "2.4 s", p95Duration: "7.1 s", throughput: "1.4K / min", slaStatus: "Within SLA", owner: "Retrieval Engineering", configurationVersion: "v5.1", completedThisHour: 9840, reviewRequired: 182, summary: "Approved records indexed with authority, freshness, and access filters preserved." },
  { id: "validate", name: "Validate Quality & Freshness", sequence: 8, status: "Warning", processedCount: 158200, pendingCount: 14820, failedCount: 96, warningCount: 342, successRate: 95.1, averageDuration: "1.9 s", p95Duration: "6.2 s", throughput: "1.2K / min", slaStatus: "At Risk", owner: "Memory Quality", configurationVersion: "v4.0", completedThisHour: 8420, reviewRequired: 342, summary: "Three Team Personas contain stale conditions; freshness SLA under pressure." },
  { id: "publish", name: "Publish Memory Services", sequence: 9, status: "Running", processedCount: 156900, pendingCount: 3240, failedCount: 8, warningCount: 14, successRate: 99.5, averageDuration: "0.8 s", p95Duration: "2.2 s", throughput: "2.4K / min", slaStatus: "Within SLA", owner: "Memory Platform", configurationVersion: "v4.2", completedThisHour: 14220, reviewRequired: 14, summary: "Published memory services expose governed retrieval to approved consumers." },
  { id: "observe", name: "Observe Use", sequence: 10, status: "Running", processedCount: 421800, pendingCount: 0, failedCount: 4, warningCount: 22, successRate: 99.9, averageDuration: "0.2 s", p95Duration: "0.6 s", throughput: "6.8K / min", slaStatus: "Within SLA", owner: "Memory Platform", configurationVersion: "v4.2", completedThisHour: 40120, reviewRequired: 6, summary: "Retrieval, reuse, and consumer telemetry observed continuously." },
  { id: "decisions", name: "Link Decisions", sequence: 11, status: "Running", processedCount: 4812, pendingCount: 186, failedCount: 6, warningCount: 28, successRate: 97.8, averageDuration: "3.1 s", p95Duration: "9.4 s", throughput: "120 / hr", slaStatus: "Within SLA", owner: "Decision Intelligence", configurationVersion: "v2.4", completedThisHour: 42, reviewRequired: 28, summary: "Decisions bound to the context that existed when they were approved." },
  { id: "outcomes", name: "Link Outcomes", sequence: 12, status: "Warning", processedCount: 3284, pendingCount: 428, failedCount: 18, warningCount: 62, successRate: 92.4, averageDuration: "4.2 s", p95Duration: "12.6 s", throughput: "84 / hr", slaStatus: "At Risk", owner: "Site Reliability Engineering", configurationVersion: "v2.2", completedThisHour: 24, reviewRequired: 62, summary: "Decision to outcome linkage improving but still below the 90% target." },
  { id: "learning", name: "Publish Learning", sequence: 13, status: "Running", processedCount: 1426, pendingCount: 64, failedCount: 2, warningCount: 9, successRate: 98.6, averageDuration: "2.8 s", p95Duration: "8.1 s", throughput: "36 / hr", slaStatus: "Within SLA", owner: "Organizational Learning", configurationVersion: "v1.9", completedThisHour: 11, reviewRequired: 9, summary: "Learning publication healthy; lessons routed to conditions and Persona sections." },
];

export const lifecycleCallouts = [
  { id: "c1", severity: "Warning", text: "Ownership resolution backlog elevated", stageId: "ownership" },
  { id: "c2", severity: "Warning", text: "Meeting transcript indexing below target", stageId: "index" },
  { id: "c3", severity: "Attention", text: "Three Team Personas contain stale conditions", stageId: "validate" },
  { id: "c4", severity: "Improving", text: "Decision to outcome linkage improving", stageId: "outcomes" },
  { id: "c5", severity: "Healthy", text: "Learning publication healthy", stageId: "learning" },
];

export interface QualityIssue {
  id: string; record: string; memoryType: MemoryRecordType; issue: string;
  severity: "Critical" | "High" | "Medium" | "Low"; qualityImpact: string; owner: string;
  evidenceState: string; recommendedAction: string; status: string;
}

export const qualityIssues: QualityIssue[] = [
  { id: "QI 4401", record: "MEM 100426 Quarter End Deployment Restriction", memoryType: "Policy", issue: "Conflicting effective dates across two policy sources", severity: "High", qualityImpact: "-6 authority", owner: "Release Governance", evidenceState: "Partial", recommendedAction: "Reconcile source policy register", status: "Open" },
  { id: "QI 4402", record: "MEM 100425 Identity Services", memoryType: "Entity", issue: "Latency condition older than freshness SLA", severity: "Medium", qualityImpact: "-4 freshness", owner: "Identity Engineering", evidenceState: "Complete", recommendedAction: "Refresh from service registry", status: "In Review" },
  { id: "QI 4403", record: "MEM 100431 Customer Support Escalation Philosophy", memoryType: "Team Persona", issue: "Section evidence derived only from meeting transcript", severity: "Medium", qualityImpact: "-5 evidence coverage", owner: "Customer Operations", evidenceState: "Weak", recommendedAction: "Request documented escalation standard", status: "Open" },
  { id: "QI 4404", record: "MEM 100438 Legacy Payments Architecture", memoryType: "Canonical Artifact", issue: "Superseded by v3.2 but still referenced by two Personas", severity: "High", qualityImpact: "-7 version integrity", owner: "Payments Platform", evidenceState: "Complete", recommendedAction: "Repoint references to current version", status: "Open" },
  { id: "QI 4405", record: "MEM 100427 Checkout Retry Policy Outcome", memoryType: "Outcome", issue: "Telemetry evidence missing for two impact claims", severity: "Medium", qualityImpact: "-3 outcome linkage", owner: "Site Reliability Engineering", evidenceState: "Partial", recommendedAction: "Attach observability export", status: "In Review" },
  { id: "QI 4406", record: "MEM 100442 Refund Processing Window", memoryType: "Business Condition", issue: "Owner unresolved after team reorganization", severity: "Low", qualityImpact: "-2 ownership", owner: "Unassigned", evidenceState: "Complete", recommendedAction: "Assign steward via governance queue", status: "Open" },
];

export interface FreshnessRow {
  id: string; record: string; lastSourceUpdate: string; memoryUpdate: string;
  freshnessSla: string; currentAge: string; affectedConsumers: number; status: FreshnessStatus;
}

export const freshnessRows: FreshnessRow[] = [
  { id: "FR 1", record: "MEM 100425 Identity Services", lastSourceUpdate: "2026-05-18", memoryUpdate: "2026-05-19", freshnessSla: "90 days", currentAge: "80 days", affectedConsumers: 14, status: "Aging" },
  { id: "FR 2", record: "MEM 100426 Quarter End Deployment Restriction", lastSourceUpdate: "2026-02-02", memoryUpdate: "2026-02-04", freshnessSla: "180 days", currentAge: "185 days", affectedConsumers: 22, status: "Stale" },
  { id: "FR 3", record: "MEM 100431 Customer Support Escalation Philosophy", lastSourceUpdate: "2026-01-14", memoryUpdate: "2026-01-16", freshnessSla: "120 days", currentAge: "204 days", affectedConsumers: 9, status: "Stale" },
  { id: "FR 4", record: "MEM 100421 Payments API Availability", lastSourceUpdate: "2026-07-28", memoryUpdate: "2026-07-28", freshnessSla: "90 days", currentAge: "9 days", affectedConsumers: 38, status: "Current" },
  { id: "FR 5", record: "MEM 100438 Legacy Payments Architecture", lastSourceUpdate: "2025-11-02", memoryUpdate: "2025-11-05", freshnessSla: "365 days", currentAge: "277 days", affectedConsumers: 6, status: "Aging" },
];

/* -------------------------------- records --------------------------------- */

const ev = (
  id: string, sourceArtifact: string, passage: string, authority: AuthorityLevel,
  confidence: number, hash: string, capturedAt: string, permissions: string,
): EvidenceReference => ({ id, sourceArtifact, passage, authority, confidence, hash, capturedAt, permissions });

const baseRecord = {
  businessUnit: "Commerce",
  regulatoryScope: "PCI DSS",
  dataResidency: "Global",
  environment: "Production",
  region: "North America",
  sourceCategory: "Documentation",
  sourcePlatform: "Confluence",
  productIds: ["Commerce Checkout"],
  serviceIds: ["Payments API"],
  systemIds: ["Core Ledger"],
  customerJourneyIds: ["Checkout"],
  approvedConsumers: ["Persona Impact Analysis", "Cognitive Intake", "Decision Intelligence"],
  restrictedConsumers: ["External Partner Portal"],
  consumerIds: ["Impact Evaluation", "Search Services"],
  reviewState: "Current",
  expirationDate: null as string | null,
};

export const memoryRecords: MemoryRecord[] = [
  {
    ...baseRecord,
    id: "MEM 100421",
    recordType: "Business Condition",
    title: "Payments API monthly availability shall be at least 99.95 percent",
    description: "Availability service level governing the Payments API across all production regions, measured monthly against successful authorization requests.",
    knowledgeDomains: ["Payments & Reliability"],
    businessPurpose: "Protect checkout completion and merchant settlement reliability.",
    memoryLayer: "Conditions Registry",
    teamIds: ["Payments Platform", "Site Reliability Engineering"],
    owner: "Payments Reliability", businessOwner: "VP Commerce Platform", technicalOwner: "Payments Platform Lead",
    dataSteward: "Reliability Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Primary", approvalState: "Approved",
    qualityScore: 97, confidence: 98, freshnessStatus: "Current", accessClassification: "Internal",
    evidence: [
      ev("EVD 77421", "Payments API Reliability Requirements v3.2", "Monthly availability for the Payments API shall be at least 99.95 percent measured across successful authorization requests.", "Primary", 98, "sha256:9f21…c4a1", "2026-07-28 09:14", "Internal — Commerce Platform"),
      ev("EVD 77422", "Commerce Service Level Register 2026", "Tier 1 commerce services carry a 99.95 percent monthly availability commitment.", "Supporting", 94, "sha256:4b70…88de", "2026-06-11 15:02", "Internal — Governance"),
      ev("EVD 77423", "Q2 Reliability Review Minutes", "Availability target reaffirmed with no exception approved for the retry program.", "Supporting", 88, "sha256:1ac9…52b7", "2026-05-30 11:40", "Internal — Payments"),
      ev("EVD 77424", "Observability Availability Export", "Trailing twelve month availability observed at 99.962 percent.", "Observed Production Outcome", 96, "sha256:77dd…9013", "2026-08-01 02:00", "Internal — SRE"),
    ],
    evidenceCount: 4, relationshipIds: ["REL 5001", "REL 5002"], relationshipCount: 18,
    sourceRecordIds: ["CAN 38421"], reuseCount: 412, decisionImpact: "High",
    indexStatus: "Indexed", version: "v3.2",
    versions: [
      { version: "v3.2", state: "Current", effectivePeriod: "2026-07-28 → present", summary: "Availability target restated with regional measurement clarification." },
      { version: "v3.1", state: "Prior", effectivePeriod: "2026-01-04 → 2026-07-27", summary: "Original 99.95 percent commitment." },
      { version: "v2.8", state: "Superseded", effectivePeriod: "2025-02-10 → 2026-01-03", summary: "99.9 percent commitment." },
    ],
    effectiveDate: "2026-07-28", createdAt: "2025-02-10", updatedAt: "2026-07-28", publishedAt: "2026-07-28",
    lastSourceUpdate: "2026-07-28", evidenceCoverage: 100,
    structured: {
      condition: {
        subject: "Payments API monthly availability", operator: ">=", value: "99.95", unit: "percent",
        baseline: "99.90 percent (2025)", target: "99.95 percent", threshold: "Breach below 99.95 percent monthly",
        effectiveDate: "2026-07-28",
        teams: ["Payments Platform", "Site Reliability Engineering"],
        systems: ["Payments API", "Core Ledger", "Retry Orchestrator"],
        dependencies: ["Identity Services", "Fraud Decision Service"],
        risks: ["Dependency degradation", "Retry amplification"],
        controls: ["Progressive rollout", "Automated rollback", "Dependency health validation"],
      },
    },
  },
  {
    ...baseRecord,
    id: "MEM 100422",
    recordType: "Team Persona",
    title: "Payments Platform Team Persona",
    description: "Evidence linked operating model for the Payments Platform team including mission, dependencies, constraints, and decision logic.",
    knowledgeDomains: ["Payments & Commerce"],
    businessPurpose: "Represent how Payments Platform evaluates change from its own perspective.",
    memoryLayer: "Team Persona Library",
    teamIds: ["Payments Platform"],
    owner: "Jane Smith", businessOwner: "VP Commerce Platform", technicalOwner: "Payments Platform Lead",
    dataSteward: "Commerce Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Primary", approvalState: "Approved",
    qualityScore: 96, confidence: 95, freshnessStatus: "Current", accessClassification: "Internal",
    evidence: [
      ev("EVD 78011", "Payments Platform Charter", "The Payments Platform team owns authorization, retry orchestration, and settlement integrity.", "Primary", 97, "sha256:a012…7f31", "2026-07-02 08:11", "Internal — Commerce"),
      ev("EVD 78012", "Payments Architecture Decision Log", "Idempotency keys are mandatory for all retryable authorization paths.", "Primary", 95, "sha256:be44…2201", "2026-06-18 13:26", "Internal — Commerce"),
    ],
    evidenceCount: 428, relationshipIds: ["REL 5003"], relationshipCount: 84,
    sourceRecordIds: ["MEM 100421", "CAN 38421"], reuseCount: 388, decisionImpact: "High",
    indexStatus: "Indexed", version: "v3.4",
    versions: [
      { version: "v3.4", state: "Current", effectivePeriod: "2026-07-02 → present", summary: "Retry decision logic and idempotency constraint added." },
      { version: "v3.3", state: "Prior", effectivePeriod: "2026-04-14 → 2026-07-01", summary: "Dependency set expanded to Fraud Decision Service." },
    ],
    effectiveDate: "2026-07-02", createdAt: "2025-06-01", updatedAt: "2026-07-02", publishedAt: "2026-07-02",
    lastSourceUpdate: "2026-07-01", evidenceCoverage: 94,
    structured: {
      persona: {
        mission: "Operate a reliable, idempotent, and auditable payment authorization platform for global commerce.",
        capabilities: ["Payment Authorization", "Retry Orchestration", "Settlement Integrity", "Tokenization"],
        products: ["Payments API", "Commerce Checkout"],
        services: ["Payments API", "Retry Orchestrator", "Regional Token Vault"],
        customers: ["Checkout Engineering", "Merchant Operations", "Enterprise Merchants"],
        objectives: ["Availability >= 99.95%", "P95 authorization latency < 250 ms", "Zero duplicate settlement events"],
        metrics: ["Availability", "P95 latency", "Duplicate authorization rate", "Authorization success rate"],
        constraints: ["No deployment during final three business days of financial quarter", "Idempotency required on all retry paths"],
        dependencies: ["Identity Services", "Fraud Decision Service", "Core Ledger"],
        risks: ["Retry amplification", "Duplicate authorization", "Dependency saturation"],
        decisionLogic: ["Reliability outranks conversion when duplicate risk is material", "Traffic expansion requires validated idempotency evidence", "Joint approval required above 10% checkout traffic"],
        howThisTeamThinks: ["Prefers reversible, progressively rolled out change", "Low risk appetite for settlement correctness", "Treats dependency health as a release gate"],
      },
    },
  },
  {
    ...baseRecord,
    id: "MEM 100423",
    recordType: "Canonical Artifact",
    title: "Payments API Reliability Requirements v3.2",
    description: "Normalized canonical representation of the Payments API reliability requirements document including sections, tables, entities, and contextual chunks.",
    knowledgeDomains: ["Payments & Reliability"],
    businessPurpose: "Provide the normalized source of reliability meaning for downstream conditions.",
    memoryLayer: "Canonical Artifact Store",
    teamIds: ["Payments Platform"],
    owner: "Payments Platform", businessOwner: "VP Commerce Platform", technicalOwner: "Payments Platform Lead",
    dataSteward: "Commerce Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Primary", approvalState: "Approved",
    qualityScore: 95, confidence: 96, freshnessStatus: "Current", accessClassification: "Confidential",
    evidence: [ev("EVD 77421", "Payments API Reliability Requirements v3.2", "Section 4.2 — Availability, latency, and error rate commitments.", "Primary", 98, "sha256:9f21…c4a1", "2026-07-28 09:14", "Confidential — Commerce Platform")],
    evidenceCount: 12, relationshipIds: ["REL 5004"], relationshipCount: 34,
    sourceRecordIds: ["EVD 77421"], reuseCount: 264, decisionImpact: "High",
    indexStatus: "Indexed", version: "v3.2",
    versions: [{ version: "v3.2", state: "Current", effectivePeriod: "2026-07-28 → present", summary: "Normalized from source document revision 3.2." }],
    effectiveDate: "2026-07-28", createdAt: "2025-02-10", updatedAt: "2026-07-28", publishedAt: "2026-07-28",
    lastSourceUpdate: "2026-07-28", evidenceCoverage: 98,
    sourceCategory: "Architecture",
  },
  {
    ...baseRecord,
    id: "MEM 100424",
    recordType: "Decision",
    title: "Checkout Retry Policy Update",
    description: "Approved decision to increase automated payment retries for a limited share of checkout traffic under explicit control conditions.",
    knowledgeDomains: ["Payments & Commerce"],
    businessPurpose: "Improve checkout completion without compromising settlement correctness.",
    memoryLayer: "Decision Ledger",
    teamIds: ["Checkout Engineering", "Payments Platform"],
    owner: "Checkout Engineering", businessOwner: "Director Checkout", technicalOwner: "Checkout Engineering Lead",
    dataSteward: "Commerce Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Primary", approvalState: "Approved with Conditions",
    qualityScore: 92, confidence: 91, freshnessStatus: "Current", accessClassification: "Internal",
    evidence: [
      ev("EVD 79101", "Checkout Retry Impact Evaluation EVAL 2048", "Limited retry increase projected to improve checkout completion by 1.5 percent.", "Primary", 93, "sha256:2f8a…41bb", "2026-04-02 10:22", "Internal — Commerce"),
      ev("EVD 79102", "Payments Reliability Review Record", "Approval conditional on idempotency validation and 5 percent traffic cap.", "Primary", 95, "sha256:8c31…70ea", "2026-04-03 16:45", "Internal — Payments"),
    ],
    evidenceCount: 18, relationshipIds: ["REL 5005"], relationshipCount: 26,
    sourceRecordIds: ["MEM 100421", "MEM 100422"], reuseCount: 96, decisionImpact: "High",
    indexStatus: "Indexed", version: "v1.2",
    versions: [{ version: "v1.2", state: "Current", effectivePeriod: "2026-04-03 → present", summary: "Approved with conditions." }],
    effectiveDate: "2026-04-03", createdAt: "2026-03-18", updatedAt: "2026-04-03", publishedAt: "2026-04-03",
    lastSourceUpdate: "2026-04-03", evidenceCoverage: 91,
    structured: {
      decision: {
        decisionStatement: "Approve a limited increase of automated payment retries from two attempts to three for five percent of checkout traffic.",
        alternatives: ["No change to retry behavior", "Full rollout to all checkout traffic", "Limited retry increase for five percent of traffic", "Retry increase restricted to a single region"],
        selectedOption: "Limited retry increase for five percent of traffic",
        expectedOutcomes: ["Checkout completion improves 1.5 percent", "No measurable increase in duplicate authorizations", "P95 latency remains under 250 ms"],
        approvers: ["Payments Reliability", "Fraud Engineering", "Site Reliability Engineering", "Release Governance"],
        affectedPersonas: ["Payments Platform", "Checkout Engineering", "Fraud Engineering", "Site Reliability Engineering"],
        conditions: ["MEM 100421 Availability >= 99.95%", "P95 latency < 250 ms", "Joint approval above 10% checkout traffic"],
        evidence: ["EVAL 2048", "Idempotency test report", "Fraud loss analysis"],
      },
    },
  },
  {
    ...baseRecord,
    id: "MEM 100425",
    recordType: "Entity",
    title: "Identity Services",
    description: "Registry verified service entity providing authentication and token validation to the payment authorization path.",
    knowledgeDomains: ["Identity & Access"],
    businessPurpose: "Represent the identity dependency in the enterprise context graph.",
    memoryLayer: "Enterprise Context Graph",
    teamIds: ["Identity Engineering"],
    serviceIds: ["Identity Services"],
    owner: "Identity Engineering", businessOwner: "VP Platform Engineering", technicalOwner: "Identity Services Lead",
    dataSteward: "Identity Data Steward", securityOwner: "Platform Security",
    authorityLevel: "Registry Verified", approvalState: "Approved",
    qualityScore: 93, confidence: 97, freshnessStatus: "Aging", accessClassification: "Restricted",
    evidence: [ev("EVD 80211", "Service Registry Export", "Identity Services is a Tier 1 dependency of Payments API authorization.", "Registry Verified", 97, "sha256:33ce…a12f", "2026-05-18 07:30", "Restricted — Platform Security")],
    evidenceCount: 6, relationshipIds: ["REL 5006"], relationshipCount: 41,
    sourceRecordIds: ["Service Registry"], reuseCount: 208, decisionImpact: "Medium",
    indexStatus: "Reindex Pending", version: "v2.1",
    versions: [{ version: "v2.1", state: "Current", effectivePeriod: "2026-05-18 → present", summary: "Registry sync." }],
    effectiveDate: "2026-05-18", createdAt: "2024-09-02", updatedAt: "2026-05-19", publishedAt: "2026-05-19",
    lastSourceUpdate: "2026-05-18", evidenceCoverage: 86,
    businessUnit: "Platform Engineering",
    sourceCategory: "Architecture", sourcePlatform: "ServiceNow",
    structured: {
      entity: {
        "Entity Type": "Service", "Criticality Tier": "Tier 1", "Owning Team": "Identity Engineering",
        "Consumers": "Payments API, Checkout, Fraud Decision Service", "Region": "North America, European Union",
        "Data Residency": "EU restricted for EU tokens", "Availability Target": "99.99 percent",
      },
    },
  },
  {
    ...baseRecord,
    id: "MEM 100426",
    recordType: "Policy",
    title: "Quarter End Deployment Restriction",
    description: "Policy condition prohibiting production deployment during the final three business days of the financial quarter.",
    knowledgeDomains: ["Release Governance"],
    businessPurpose: "Protect financial close integrity from release induced disruption.",
    memoryLayer: "Conditions Registry",
    teamIds: ["Release Governance"],
    owner: "Release Governance", businessOwner: "Chief Financial Controller", technicalOwner: "Release Engineering Lead",
    dataSteward: "Governance Data Steward", securityOwner: "Enterprise Security",
    authorityLevel: "Primary", approvalState: "Conflict Review",
    qualityScore: 81, confidence: 84, freshnessStatus: "Stale", accessClassification: "Internal",
    evidence: [
      ev("EVD 81002", "Enterprise Release Policy 2026", "No production deployment is permitted in the final three business days of a financial quarter.", "Primary", 92, "sha256:5511…bb02", "2026-02-02 12:00", "Internal — Governance"),
      ev("EVD 81003", "Commerce Release Exception Register", "Commerce holds a standing exception for severity one remediation.", "Supporting", 78, "sha256:9a4e…30c8", "2025-12-11 09:45", "Internal — Commerce"),
    ],
    evidenceCount: 5, relationshipIds: ["REL 5007"], relationshipCount: 22,
    sourceRecordIds: ["Policy Register"], reuseCount: 142, decisionImpact: "High",
    indexStatus: "Indexed", version: "v4.0",
    versions: [
      { version: "v4.0", state: "Current", effectivePeriod: "2026-02-02 → present", summary: "Three business day restriction." },
      { version: "v3.6", state: "Superseded", effectivePeriod: "2025-01-08 → 2026-02-01", summary: "Two business day restriction." },
    ],
    effectiveDate: "2026-02-02", createdAt: "2024-01-08", updatedAt: "2026-02-04", publishedAt: "2026-02-04",
    lastSourceUpdate: "2026-02-02", evidenceCoverage: 74, reviewState: "Conflict Review",
    businessUnit: "Risk & Compliance",
    sourceCategory: "Policy Register", sourcePlatform: "SharePoint",
    structured: {
      condition: {
        subject: "Production deployment during quarter end", operator: "prohibited", value: "final three business days", unit: "business days",
        baseline: "Two business days (v3.6)", target: "Three business days", threshold: "Any deployment inside the window is a policy breach",
        effectiveDate: "2026-02-02",
        teams: ["Release Governance", "Payments Platform", "Checkout Engineering"],
        systems: ["Payments API", "Core Ledger"],
        dependencies: ["Financial close calendar"],
        risks: ["Conflicting exception register", "Stale policy evidence"],
        controls: ["Release freeze gate", "Exception approval workflow"],
      },
    },
  },
  {
    ...baseRecord,
    id: "MEM 100427",
    recordType: "Outcome",
    title: "Checkout Retry Policy Outcome",
    description: "Observed production outcome following the limited retry increase, including customer and operational impact and variance from expectation.",
    knowledgeDomains: ["Payments & Reliability"],
    businessPurpose: "Record what actually happened after the retry decision.",
    memoryLayer: "Outcome Ledger",
    teamIds: ["Site Reliability Engineering", "Checkout Engineering"],
    owner: "Site Reliability Engineering", businessOwner: "Director Reliability", technicalOwner: "SRE Lead",
    dataSteward: "Reliability Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Observed Production Outcome", approvalState: "Approved",
    qualityScore: 94, confidence: 96, freshnessStatus: "Current", accessClassification: "Internal",
    evidence: [
      ev("EVD 82301", "Checkout Conversion Telemetry Export", "Checkout completion improved 1.8 percent across the treated traffic segment.", "Observed Production Outcome", 97, "sha256:6dd1…4c9a", "2026-06-30 23:59", "Internal — SRE"),
      ev("EVD 82302", "Duplicate Authorization Analysis", "Duplicate authorization attempts increased 0.4 percent in the treated segment.", "Observed Production Outcome", 95, "sha256:0f77…19b5", "2026-06-30 23:59", "Internal — Payments"),
    ],
    evidenceCount: 9, relationshipIds: ["REL 5008"], relationshipCount: 17,
    sourceRecordIds: ["MEM 100424"], reuseCount: 74, decisionImpact: "High",
    indexStatus: "Indexed", version: "v1.0",
    versions: [{ version: "v1.0", state: "Current", effectivePeriod: "2026-06-30 → present", summary: "Outcome validated by SRE." }],
    effectiveDate: "2026-06-30", createdAt: "2026-06-30", updatedAt: "2026-07-02", publishedAt: "2026-07-02",
    lastSourceUpdate: "2026-06-30", evidenceCoverage: 88,
    sourceCategory: "Telemetry", sourcePlatform: "Observability Platform",
    structured: {
      outcome: {
        expectedResult: "Checkout completion improves 1.5 percent with no measurable duplicate authorization increase.",
        observedResult: "Checkout completion improved 1.8 percent. Duplicate authorization attempts increased 0.4 percent.",
        variance: "+0.3 percent completion above expectation; duplicate authorization variance unfavourable.",
        customerImpact: "Positive completion impact; 214 duplicate authorization holds required release within 24 hours.",
        operationalImpact: "Retry Orchestrator load increased 6 percent; no availability breach recorded.",
        lessons: ["Idempotency validation must precede any traffic expansion", "Duplicate authorization telemetry should gate rollout stages"],
      },
    },
  },
  {
    ...baseRecord,
    id: "MEM 100428",
    recordType: "Learning Record",
    title: "Retry Idempotency Learning",
    description: "Validated organizational lesson created from the observed retry outcome and applied to conditions, controls, and Persona sections.",
    knowledgeDomains: ["Payments & Reliability"],
    businessPurpose: "Ensure future retry changes carry stronger idempotency evidence.",
    memoryLayer: "Learning Records",
    teamIds: ["Payments Platform", "Site Reliability Engineering"],
    owner: "Payments Reliability", businessOwner: "VP Commerce Platform", technicalOwner: "Payments Platform Lead",
    dataSteward: "Reliability Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Outcome Validated", approvalState: "Approved",
    qualityScore: 93, confidence: 94, freshnessStatus: "Current", accessClassification: "Internal",
    evidence: [ev("EVD 83401", "Retry Program Retrospective", "Future retry changes require stronger idempotency validation before traffic expansion.", "Outcome Validated", 94, "sha256:c103…7ffa", "2026-07-08 14:10", "Internal — Payments")],
    evidenceCount: 4, relationshipIds: ["REL 5009"], relationshipCount: 12,
    sourceRecordIds: ["MEM 100427"], reuseCount: 58, decisionImpact: "Medium",
    indexStatus: "Indexed", version: "v1.0",
    versions: [{ version: "v1.0", state: "Current", effectivePeriod: "2026-07-08 → present", summary: "Lesson published to memory." }],
    effectiveDate: "2026-07-08", createdAt: "2026-07-08", updatedAt: "2026-07-08", publishedAt: "2026-07-08",
    lastSourceUpdate: "2026-07-08", evidenceCoverage: 92,
    structured: {
      learning: {
        observedOutcome: "Duplicate authorization attempts increased 0.4 percent after the limited retry increase.",
        validatedLesson: "Future retry changes require stronger idempotency validation before traffic expansion.",
        conditionsUpdated: ["MEM 100421 Availability condition control set", "Retry approval requirement threshold"],
        controlsUpdated: ["Idempotency validation", "Progressive rollout gating"],
        personaSectionsUpdated: ["Payments Platform — Decision Logic", "Checkout Engineering — Constraints", "Site Reliability Engineering — Risks"],
        confidenceChanges: ["Retry approval requirement confidence 88% → 94%"],
      },
    },
  },
  {
    ...baseRecord,
    id: "MEM 100429",
    recordType: "Control",
    title: "Idempotency Validation Control",
    description: "Mandatory control requiring verified idempotency keys on all retryable authorization paths before traffic expansion.",
    knowledgeDomains: ["Payments & Reliability"],
    businessPurpose: "Prevent duplicate settlement events during retry changes.",
    memoryLayer: "Conditions Registry",
    teamIds: ["Payments Platform"],
    owner: "Payments Reliability", businessOwner: "VP Commerce Platform", technicalOwner: "Payments Platform Lead",
    dataSteward: "Reliability Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Primary", approvalState: "Approved",
    qualityScore: 95, confidence: 96, freshnessStatus: "Current", accessClassification: "Internal",
    evidence: [ev("EVD 78012", "Payments Architecture Decision Log", "Idempotency keys are mandatory for all retryable authorization paths.", "Primary", 95, "sha256:be44…2201", "2026-06-18 13:26", "Internal — Commerce")],
    evidenceCount: 3, relationshipIds: [], relationshipCount: 15,
    sourceRecordIds: ["CAN 38421"], reuseCount: 132, decisionImpact: "High",
    indexStatus: "Indexed", version: "v2.0",
    versions: [{ version: "v2.0", state: "Current", effectivePeriod: "2026-07-08 → present", summary: "Strengthened after retry outcome." }],
    effectiveDate: "2026-07-08", createdAt: "2025-05-20", updatedAt: "2026-07-08", publishedAt: "2026-07-08",
    lastSourceUpdate: "2026-06-18", evidenceCoverage: 96,
  },
  {
    ...baseRecord,
    id: "MEM 100430",
    recordType: "Business Condition",
    title: "Payments API P95 authorization latency shall remain below 250 milliseconds",
    description: "Latency threshold governing authorization responsiveness across production regions.",
    knowledgeDomains: ["Payments & Reliability"],
    businessPurpose: "Preserve checkout responsiveness under retry load.",
    memoryLayer: "Conditions Registry",
    teamIds: ["Payments Platform", "Site Reliability Engineering"],
    owner: "Payments Reliability", businessOwner: "VP Commerce Platform", technicalOwner: "Payments Platform Lead",
    dataSteward: "Reliability Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Primary", approvalState: "Approved",
    qualityScore: 94, confidence: 95, freshnessStatus: "Current", accessClassification: "Internal",
    evidence: [ev("EVD 77421", "Payments API Reliability Requirements v3.2", "P95 authorization latency shall remain below 250 milliseconds.", "Primary", 96, "sha256:9f21…c4a1", "2026-07-28 09:14", "Internal — Commerce Platform")],
    evidenceCount: 3, relationshipIds: [], relationshipCount: 14,
    sourceRecordIds: ["CAN 38421"], reuseCount: 246, decisionImpact: "Medium",
    indexStatus: "Indexed", version: "v3.2",
    versions: [{ version: "v3.2", state: "Current", effectivePeriod: "2026-07-28 → present", summary: "Latency threshold restated." }],
    effectiveDate: "2026-07-28", createdAt: "2025-02-10", updatedAt: "2026-07-28", publishedAt: "2026-07-28",
    lastSourceUpdate: "2026-07-28", evidenceCoverage: 97,
    structured: {
      condition: {
        subject: "Payments API P95 authorization latency", operator: "<", value: "250", unit: "milliseconds",
        baseline: "232 ms", target: "< 250 ms", threshold: "Alert above 240 ms", effectiveDate: "2026-07-28",
        teams: ["Payments Platform", "Site Reliability Engineering"], systems: ["Payments API", "Retry Orchestrator"],
        dependencies: ["Identity Services"], risks: ["Retry induced latency"], controls: ["Traffic segmentation", "Progressive rollout"],
      },
    },
  },
  {
    ...baseRecord,
    id: "MEM 100431",
    recordType: "Team Persona",
    title: "Customer Support Escalation Philosophy",
    description: "Customer Operations Persona section describing escalation posture and thresholds derived largely from meeting evidence.",
    knowledgeDomains: ["Customer Experience"],
    businessPurpose: "Represent how Customer Operations escalates payment failures.",
    memoryLayer: "Team Persona Library",
    teamIds: ["Customer Operations"],
    owner: "Customer Operations", businessOwner: "VP Customer Operations", technicalOwner: "Support Platform Lead",
    dataSteward: "Customer Data Steward", securityOwner: "Enterprise Security",
    authorityLevel: "Supporting", approvalState: "Pending Review",
    qualityScore: 78, confidence: 74, freshnessStatus: "Stale", accessClassification: "Internal",
    evidence: [ev("EVD 84102", "Support Escalation Working Session", "Payment failures affecting more than fifty merchants escalate within one hour.", "Supporting", 72, "sha256:41ba…d902", "2026-01-14 10:05", "Internal — Support")],
    evidenceCount: 1, relationshipIds: [], relationshipCount: 6,
    sourceRecordIds: ["Meeting Transcript"], reuseCount: 18, decisionImpact: "Low",
    indexStatus: "Indexed", version: "v1.4",
    versions: [{ version: "v1.4", state: "Current", effectivePeriod: "2026-01-16 → present", summary: "Escalation thresholds captured from working session." }],
    effectiveDate: "2026-01-16", createdAt: "2025-08-03", updatedAt: "2026-01-16", publishedAt: "2026-01-16",
    lastSourceUpdate: "2026-01-14", evidenceCoverage: 46, reviewState: "Evidence Review",
    businessUnit: "Customer Operations",
    sourceCategory: "Meeting Transcript", sourcePlatform: "Confluence",
  },
  {
    ...baseRecord,
    id: "MEM 100438",
    recordType: "Canonical Artifact",
    title: "Legacy Payments Architecture Record",
    description: "Superseded canonical architecture record retained for historical decision reconstruction.",
    knowledgeDomains: ["Payments & Commerce"],
    businessPurpose: "Preserve the architecture context that existed for prior decisions.",
    memoryLayer: "Canonical Artifact Store",
    teamIds: ["Payments Platform"],
    owner: "Payments Platform", businessOwner: "VP Commerce Platform", technicalOwner: "Payments Platform Lead",
    dataSteward: "Commerce Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Historical", approvalState: "Superseded",
    qualityScore: 84, confidence: 82, freshnessStatus: "Aging", accessClassification: "Internal",
    evidence: [ev("EVD 70112", "Payments Architecture v2.4", "Retry orchestration handled inline by the authorization service.", "Historical", 82, "sha256:aa19…6c40", "2025-11-02 09:00", "Internal — Commerce")],
    evidenceCount: 7, relationshipIds: [], relationshipCount: 11,
    sourceRecordIds: ["EVD 70112"], reuseCount: 31, decisionImpact: "Low",
    indexStatus: "Archived", version: "v2.4",
    versions: [
      { version: "v3.2", state: "Current", effectivePeriod: "2026-07-28 → present", summary: "Replaced by current architecture record." },
      { version: "v2.4", state: "Superseded", effectivePeriod: "2024-06-01 → 2026-07-27", summary: "Legacy inline retry architecture." },
    ],
    effectiveDate: "2024-06-01", expirationDate: "2026-07-27", createdAt: "2024-06-01", updatedAt: "2025-11-05", publishedAt: "2025-11-05",
    lastSourceUpdate: "2025-11-02", evidenceCoverage: 79, reviewState: "Superseded",
    sourceCategory: "Architecture",
  },
  {
    ...baseRecord,
    id: "MEM 100442",
    recordType: "Business Condition",
    title: "Refund processing shall complete within five business days",
    description: "Customer facing refund commitment governing settlement reversal timelines.",
    knowledgeDomains: ["Payments & Commerce"],
    businessPurpose: "Protect customer trust in refund handling.",
    memoryLayer: "Conditions Registry",
    teamIds: ["Payments Platform", "Customer Operations"],
    owner: "Unassigned", businessOwner: "Director Commerce Operations", technicalOwner: "Settlement Lead",
    dataSteward: "Commerce Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Supporting", approvalState: "Pending Review",
    qualityScore: 86, confidence: 87, freshnessStatus: "Current", accessClassification: "Internal",
    evidence: [ev("EVD 85220", "Commerce Customer Commitments 2026", "Refunds complete within five business days of approval.", "Supporting", 89, "sha256:73f1…5ab6", "2026-06-04 11:20", "Internal — Commerce")],
    evidenceCount: 2, relationshipIds: [], relationshipCount: 8,
    sourceRecordIds: ["CAN 39002"], reuseCount: 64, decisionImpact: "Medium",
    indexStatus: "Indexed", version: "v1.1",
    versions: [{ version: "v1.1", state: "Current", effectivePeriod: "2026-06-04 → present", summary: "Refund window restated." }],
    effectiveDate: "2026-06-04", createdAt: "2025-04-11", updatedAt: "2026-06-04", publishedAt: "2026-06-04",
    lastSourceUpdate: "2026-06-04", evidenceCoverage: 72, reviewState: "Owner Review",
    customerJourneyIds: ["Refunds"],
  },
  {
    ...baseRecord,
    id: "MEM 100445",
    recordType: "Evidence Record",
    title: "Fraud Loss Analysis — Retry Program",
    description: "Preserved evidence artifact analysing fraud loss exposure associated with expanded retry behaviour.",
    knowledgeDomains: ["Fraud & Risk"],
    businessPurpose: "Support fraud risk evaluation for retry decisions.",
    memoryLayer: "Evidence Vault",
    teamIds: ["Fraud Engineering"],
    owner: "Fraud Engineering", businessOwner: "VP Risk", technicalOwner: "Fraud Platform Lead",
    dataSteward: "Risk Data Steward", securityOwner: "Enterprise Security",
    authorityLevel: "Primary", approvalState: "Approved",
    qualityScore: 91, confidence: 92, freshnessStatus: "Current", accessClassification: "Confidential",
    evidence: [ev("EVD 86110", "Fraud Loss Analysis Retry Program", "Expanded retries increase fraud attempt surface by an estimated 0.2 percent.", "Primary", 92, "sha256:d5c2…8811", "2026-05-22 16:35", "Confidential — Risk")],
    evidenceCount: 1, relationshipIds: [], relationshipCount: 9,
    sourceRecordIds: ["EVD 86110"], reuseCount: 44, decisionImpact: "Medium",
    indexStatus: "Indexed", version: "v1.0",
    versions: [{ version: "v1.0", state: "Current", effectivePeriod: "2026-05-22 → present", summary: "Evidence preserved." }],
    effectiveDate: "2026-05-22", createdAt: "2026-05-22", updatedAt: "2026-05-22", publishedAt: "2026-05-22",
    lastSourceUpdate: "2026-05-22", evidenceCoverage: 100,
    businessUnit: "Risk & Compliance", sourceCategory: "Documentation", sourcePlatform: "SharePoint",
  },
  {
    ...baseRecord,
    id: "MEM 100448",
    recordType: "Risk",
    title: "Retry Amplification Risk",
    description: "Registered risk describing cascading load and duplicate authorization exposure from expanded retry behaviour.",
    knowledgeDomains: ["Payments & Reliability"],
    businessPurpose: "Track the primary risk associated with retry expansion.",
    memoryLayer: "Conditions Registry",
    teamIds: ["Payments Platform", "Site Reliability Engineering"],
    owner: "Site Reliability Engineering", businessOwner: "Director Reliability", technicalOwner: "SRE Lead",
    dataSteward: "Reliability Data Steward", securityOwner: "Commerce Security",
    authorityLevel: "Supporting", approvalState: "Approved",
    qualityScore: 89, confidence: 88, freshnessStatus: "Current", accessClassification: "Internal",
    evidence: [ev("EVD 82302", "Duplicate Authorization Analysis", "Duplicate authorization attempts increased 0.4 percent in the treated segment.", "Observed Production Outcome", 95, "sha256:0f77…19b5", "2026-06-30 23:59", "Internal — Payments")],
    evidenceCount: 3, relationshipIds: [], relationshipCount: 13,
    sourceRecordIds: ["MEM 100427"], reuseCount: 52, decisionImpact: "High",
    indexStatus: "Indexed", version: "v1.3",
    versions: [{ version: "v1.3", state: "Current", effectivePeriod: "2026-07-02 → present", summary: "Risk severity raised after observed outcome." }],
    effectiveDate: "2026-07-02", createdAt: "2026-03-20", updatedAt: "2026-07-02", publishedAt: "2026-07-02",
    lastSourceUpdate: "2026-06-30", evidenceCoverage: 90,
  },
];

/* ------------------------------ decision ledger ---------------------------- */

export const decisionMemoryRecords: DecisionMemoryRecord[] = [{
  id: "DMR 1", decisionId: "DEC 4812",
  decisionStatement: "Approve a limited increase of automated payment retries from two attempts to three for five percent of checkout traffic.",
  alternatives: ["No change", "Full rollout", "Limited five percent rollout", "Single region rollout"],
  selectedOption: "Limited five percent rollout",
  expectedOutcomes: ["Checkout completion improves 1.5 percent"],
  actualOutcomeIds: ["OUT 3284"],
  affectedPersonaIds: ["MEM 100422", "Checkout Engineering", "Fraud Engineering", "Site Reliability Engineering"],
  conditionIds: ["MEM 100421", "MEM 100430", "MEM 100426"],
  evidenceReferenceIds: ["EVD 79101", "EVD 79102", "EVD 86110"],
  approverIds: ["Payments Reliability", "Fraud Engineering", "Site Reliability Engineering", "Release Governance"],
  decisionDate: "2026-04-03", status: "Approved with Conditions",
}];

export const outcomeMemoryRecords: OutcomeMemoryRecord[] = [{
  id: "OMR 1", outcomeId: "OUT 3284", decisionId: "DEC 4812",
  expectedResult: "Checkout completion improves 1.5 percent",
  observedResult: "Checkout completion improved 1.8 percent; duplicate authorization attempts increased 0.4 percent",
  variance: "+0.3 percent completion; unfavourable duplicate authorization variance",
  customerImpact: "214 duplicate authorization holds released within 24 hours",
  businessImpact: "Estimated 1.2M USD incremental completed checkout value",
  operationalImpact: "Retry Orchestrator load +6 percent",
  telemetryEvidenceIds: ["EVD 82301", "EVD 82302"],
  lessons: ["Idempotency validation must precede traffic expansion"],
  validatedAt: "2026-07-02",
}];

export const memoryLearningRecords: MemoryLearningRecord[] = [{
  id: "LMR 1", decisionId: "DEC 4812", outcomeId: "OUT 3284",
  lesson: "Future retry changes require stronger idempotency validation before traffic expansion",
  affectedConditionIds: ["MEM 100421", "MEM 100430"],
  affectedPersonaIds: ["MEM 100422"],
  controlUpdates: ["Idempotency validation", "Progressive rollout gating"],
  confidenceUpdates: ["Retry approval requirement 88% → 94%"],
  memoryUpdateIds: ["MEM 100429"],
  approvedBy: "Payments Reliability", publishedAt: "2026-07-08",
}];

/* ------------------------------ index records ------------------------------ */

export const memoryIndexRecords: MemoryIndexRecord[] = memoryRecords.slice(0, 6).map((r, i) => ({
  id: `IDXR ${9000 + i}`, memoryRecordId: r.id, indexType: "Semantic + Facet",
  indexStatus: r.indexStatus, semanticMetadata: `${r.recordType} · ${r.knowledgeDomains[0]}`,
  searchFacets: [r.recordType, r.knowledgeDomains[0], r.owner, r.freshnessStatus],
  accessFilters: [r.accessClassification, r.dataResidency],
  embeddingMetadataPlaceholder: "embedding metadata reserved for Prompt 2 services",
  indexedAt: r.publishedAt, version: r.version,
}));

/* ------------------------------ indexing jobs ------------------------------ */

export const memoryIndexingJobs: MemoryIndexingJob[] = [
  { id: "IDX 60452", memoryLayer: "Semantic Index", scope: "Payments Domain", status: "Running", recordCount: 428000, indexedCount: 401000, pendingCount: 27000, failedCount: 84, coverage: 94, startedAt: "2026-08-06 18:12", elapsedTime: "2h 31m", owner: "Retrieval Engineering", configurationVersion: "v5.1", warnings: "None", throughput: "2.6K / min", averageDuration: "1.9 s", p95Duration: "5.8 s" },
  { id: "IDX 60451", memoryLayer: "Context Graph", scope: "Team Persona Relationships", status: "Running", recordCount: 84000, indexedCount: 79000, pendingCount: 5000, failedCount: 22, coverage: 94, startedAt: "2026-08-06 19:04", elapsedTime: "1h 39m", owner: "Context Graph Engineering", configurationVersion: "v2.8", warnings: "None", throughput: "1.1K / min", averageDuration: "2.4 s", p95Duration: "6.9 s" },
  { id: "IDX 60450", memoryLayer: "Evidence Vault", scope: "Meeting Transcripts", status: "Warning", recordCount: 312000, indexedCount: 274000, pendingCount: 38000, failedCount: 412, coverage: 88, startedAt: "2026-08-06 14:48", elapsedTime: "5h 55m", owner: "Memory Platform", configurationVersion: "v4.2", warnings: "Transcript indexing below target; speaker attribution incomplete", throughput: "840 / min", averageDuration: "3.1 s", p95Duration: "11.4 s" },
  { id: "IDX 60449", memoryLayer: "Decision Ledger", scope: "Commerce Decisions", status: "Running", recordCount: 1284, indexedCount: 1238, pendingCount: 46, failedCount: 3, coverage: 96, startedAt: "2026-08-06 20:02", elapsedTime: "41m", owner: "Decision Intelligence", configurationVersion: "v2.4", warnings: "None", throughput: "38 / min", averageDuration: "4.2 s", p95Duration: "12.1 s" },
];

export const indexingFailures = [
  { id: "IF 1", jobId: "IDX 60450", record: "Transcript 2026-04-18 Payments Sync", reason: "Speaker attribution incomplete", severity: "Medium", retryable: true },
  { id: "IF 2", jobId: "IDX 60450", record: "Transcript 2026-05-02 Fraud Review", reason: "Access classification unresolved", severity: "High", retryable: false },
  { id: "IF 3", jobId: "IDX 60452", record: "CAN 39114 Settlement Runbook", reason: "Canonical section boundary invalid", severity: "Low", retryable: true },
  { id: "IF 4", jobId: "IDX 60451", record: "REL 60221 Persona → Service", reason: "Target entity unresolved in registry", severity: "Medium", retryable: true },
];

/* ------------------------------- composition ------------------------------- */

export interface CompositionRow {
  id: string; label: string; count: string; numeric: number; growth: string;
  quality: number; freshness: number; access: string; filterType: string;
}

export const memoryComposition: CompositionRow[] = [
  { id: "comp-evidence", label: "Evidence Records", count: "2.4M", numeric: 2400000, growth: "+4.2%", quality: 96, freshness: 93, access: "Mixed", filterType: "Evidence Record" },
  { id: "comp-canonical", label: "Canonical Artifacts", count: "2.1M", numeric: 2100000, growth: "+3.8%", quality: 94, freshness: 91, access: "Internal", filterType: "Canonical Artifact" },
  { id: "comp-conditions", label: "Business Conditions", count: "87,442", numeric: 87442, growth: "+2.6%", quality: 95, freshness: 90, access: "Internal", filterType: "Business Condition" },
  { id: "comp-personas", label: "Team Personas", count: "72", numeric: 72, growth: "+1.4%", quality: 93, freshness: 88, access: "Internal", filterType: "Team Persona" },
  { id: "comp-entities", label: "Enterprise Entities", count: "3.4M", numeric: 3400000, growth: "+5.1%", quality: 92, freshness: 86, access: "Restricted", filterType: "Entity" },
  { id: "comp-relationships", label: "Context Relationships", count: "5.8M", numeric: 5800000, growth: "+3.3%", quality: 92, freshness: 89, access: "Internal", filterType: "Relationship" },
  { id: "comp-policies", label: "Policies & Controls", count: "24,842", numeric: 24842, growth: "+1.1%", quality: 90, freshness: 84, access: "Internal", filterType: "Policy" },
  { id: "comp-decisions", label: "Decision Records", count: "4,812", numeric: 4812, growth: "+2.2%", quality: 91, freshness: 92, access: "Internal", filterType: "Decision" },
  { id: "comp-outcomes", label: "Outcome Records", count: "3,284", numeric: 3284, growth: "+2.8%", quality: 88, freshness: 94, access: "Internal", filterType: "Outcome" },
  { id: "comp-learning", label: "Learning Records", count: "1,426", numeric: 1426, growth: "+3.6%", quality: 90, freshness: 95, access: "Internal", filterType: "Learning Record" },
];

/* ------------------------------ quality & trust ---------------------------- */

export const memoryQuality: MemoryQuality = {
  overallScore: 94,
  dimensions: [
    { key: "evidence", name: "Evidence Coverage", current: 98, target: 98, trend: [95, 96, 96, 97, 97, 98, 98, 98], affectedRecords: "48K partial", status: "Healthy" },
    { key: "provenance", name: "Provenance Completeness", current: 99, target: 99, trend: [97, 97, 98, 98, 98, 99, 99, 99], affectedRecords: "24K partial", status: "Healthy" },
    { key: "ownership", name: "Ownership Completeness", current: 94, target: 97, trend: [91, 92, 92, 93, 93, 94, 94, 94], affectedRecords: "9.2K unresolved", status: "Attention" },
    { key: "authority", name: "Authority Confidence", current: 93, target: 95, trend: [90, 91, 91, 92, 92, 93, 93, 93], affectedRecords: "12.4K unconfirmed", status: "Attention" },
    { key: "freshness", name: "Freshness", current: 89, target: 93, trend: [88, 88, 89, 89, 90, 89, 89, 89], affectedRecords: "186K aging or stale", status: "At Risk" },
    { key: "access", name: "Access Integrity", current: 98, target: 99, trend: [97, 97, 98, 98, 98, 98, 98, 98], affectedRecords: "1.1K review", status: "Healthy" },
    { key: "relationships", name: "Relationship Completeness", current: 92, target: 95, trend: [88, 89, 90, 90, 91, 91, 92, 92], affectedRecords: "142K sparse", status: "Attention" },
    { key: "version", name: "Version Integrity", current: 96, target: 97, trend: [94, 94, 95, 95, 96, 96, 96, 96], affectedRecords: "4.8K stale references", status: "Healthy" },
    { key: "decision-linkage", name: "Decision Linkage", current: 91, target: 94, trend: [86, 87, 88, 89, 90, 90, 91, 91], affectedRecords: "412 decisions", status: "Attention" },
    { key: "outcome-linkage", name: "Outcome Linkage", current: 82, target: 90, trend: [74, 76, 78, 79, 80, 81, 82, 82], affectedRecords: "586 decisions unlinked", status: "At Risk" },
    { key: "learning-linkage", name: "Learning Linkage", current: 84, target: 90, trend: [77, 78, 80, 81, 82, 83, 84, 84], affectedRecords: "264 outcomes unlearned", status: "At Risk" },
  ],
};

/* --------------------------- freshness & authority ------------------------- */

export const freshnessDistribution = [
  { label: "Current", value: 91, tone: "green" as const },
  { label: "Aging", value: 6, tone: "amber" as const },
  { label: "Stale", value: 2, tone: "red" as const },
  { label: "Unknown", value: 1, tone: "slate" as const },
];

export const authorityDistribution = [
  { label: "Primary", value: 42, tone: "green" as const },
  { label: "Supporting", value: 31, tone: "blue" as const },
  { label: "Observed Outcome", value: 8, tone: "green" as const },
  { label: "Historical", value: 7, tone: "slate" as const },
  { label: "Reference", value: 9, tone: "slate" as const },
  { label: "Unconfirmed", value: 3, tone: "red" as const },
];

export const attentionRecords = [
  { id: "MEM 100425", label: "Identity Services latency condition", reason: "Aging beyond registry sync window", recordId: "MEM 100425" },
  { id: "MEM 100426", label: "Quarter End Deployment Restriction", reason: "Stale policy evidence and conflicting exception register", recordId: "MEM 100426" },
  { id: "MEM 100431", label: "Customer Support escalation philosophy", reason: "Single meeting derived evidence source", recordId: "MEM 100431" },
  { id: "MEM 100438", label: "Legacy Payments architecture record", reason: "Superseded record still referenced by two Personas", recordId: "MEM 100438" },
];

/* -------------------------------- context graph ---------------------------- */

export interface GraphNode {
  id: string; label: string; type: string; memoryType: MemoryRecordType | "Team" | "Service" | "Journey";
  x: number; y: number; owner: string; summary: string; recordId?: string;
}

export interface GraphEdge {
  id: string; from: string; to: string; type: RelationshipType;
  evidence: string; confidence: number; lineage: ("decision" | "outcome" | "learning" | "evidence")[];
}

export const graphNodes: GraphNode[] = [
  { id: "n-payments", label: "Payments Platform", type: "Team", memoryType: "Team", x: 50, y: 50, owner: "Jane Smith", summary: "Center of the current context. Owns Payments API and Retry Orchestrator.", recordId: "MEM 100422" },
  { id: "n-checkout", label: "Checkout Engineering", type: "Team", memoryType: "Team", x: 22, y: 22, owner: "Director Checkout", summary: "Consumes Payments API for checkout completion." },
  { id: "n-fraud", label: "Fraud Engineering", type: "Team", memoryType: "Team", x: 78, y: 20, owner: "VP Risk", summary: "Owns Fraud Decision Service and fraud loss exposure." },
  { id: "n-identity", label: "Identity Engineering", type: "Team", memoryType: "Team", x: 16, y: 76, owner: "VP Platform Engineering", summary: "Owns Identity Services, a Tier 1 authorization dependency." },
  { id: "n-sre", label: "Site Reliability Engineering", type: "Team", memoryType: "Team", x: 84, y: 74, owner: "Director Reliability", summary: "Owns reliability outcomes and rollback gating." },
  { id: "n-api", label: "Payments API", type: "Service", memoryType: "Service", x: 50, y: 20, owner: "Payments Platform", summary: "Authorization service governed by availability and latency conditions." },
  { id: "n-retry", label: "Retry Orchestrator", type: "Service", memoryType: "Service", x: 66, y: 38, owner: "Payments Platform", summary: "Executes retry policy for failed authorizations." },
  { id: "n-idsvc", label: "Identity Services", type: "Service", memoryType: "Entity", x: 26, y: 60, owner: "Identity Engineering", summary: "Registry verified dependency with aging freshness.", recordId: "MEM 100425" },
  { id: "n-fraudsvc", label: "Fraud Decision Service", type: "Service", memoryType: "Service", x: 78, y: 46, owner: "Fraud Engineering", summary: "Evaluates fraud risk inline with authorization." },
  { id: "n-vault", label: "Regional Token Vault", type: "Service", memoryType: "Service", x: 36, y: 82, owner: "Payments Platform", summary: "Region scoped token storage with residency constraints." },
  { id: "n-journey", label: "Checkout Customer Journey", type: "Journey", memoryType: "Journey", x: 12, y: 42, owner: "Commerce", summary: "End to end customer checkout experience." },
  { id: "n-availability", label: "Availability Condition", type: "Condition", memoryType: "Business Condition", x: 40, y: 34, owner: "Payments Reliability", summary: "Availability >= 99.95 percent monthly.", recordId: "MEM 100421" },
  { id: "n-latency", label: "Latency Threshold", type: "Condition", memoryType: "Business Condition", x: 60, y: 62, owner: "Payments Reliability", summary: "P95 authorization latency < 250 ms.", recordId: "MEM 100430" },
  { id: "n-approval", label: "Retry Approval Requirement", type: "Condition", memoryType: "Business Condition", x: 88, y: 58, owner: "Release Governance", summary: "Changes affecting more than 10 percent of checkout traffic require joint approval." },
  { id: "n-idempotency", label: "Idempotency Control", type: "Control", memoryType: "Control", x: 32, y: 40, owner: "Payments Reliability", summary: "Mandatory idempotency validation on retry paths.", recordId: "MEM 100429" },
  { id: "n-decision", label: "Retry Decision", type: "Decision", memoryType: "Decision", x: 62, y: 84, owner: "Checkout Engineering", summary: "DEC 4812 limited retry increase approved with conditions.", recordId: "MEM 100424" },
  { id: "n-outcome", label: "Retry Outcome", type: "Outcome", memoryType: "Outcome", x: 46, y: 92, owner: "Site Reliability Engineering", summary: "OUT 3284 checkout completion improved 1.8 percent.", recordId: "MEM 100427" },
  { id: "n-learning", label: "Learning Record", type: "Learning", memoryType: "Learning Record", x: 26, y: 92, owner: "Payments Reliability", summary: "LRN 1426 strengthen idempotency validation before retry expansion.", recordId: "MEM 100428" },
];

export const graphEdges: GraphEdge[] = [
  { id: "e1", from: "n-payments", to: "n-api", type: "OWNS", evidence: "EVD 78011 Payments Platform Charter", confidence: 98, lineage: ["evidence"] },
  { id: "e2", from: "n-payments", to: "n-retry", type: "OWNS", evidence: "EVD 78011 Payments Platform Charter", confidence: 97, lineage: ["evidence"] },
  { id: "e3", from: "n-api", to: "n-idsvc", type: "DEPENDS ON", evidence: "EVD 80211 Service Registry Export", confidence: 96, lineage: ["evidence"] },
  { id: "e4", from: "n-api", to: "n-fraudsvc", type: "DEPENDS ON", evidence: "EVD 86110 Fraud Loss Analysis", confidence: 93, lineage: ["evidence"] },
  { id: "e5", from: "n-api", to: "n-checkout", type: "PROVIDES TO", evidence: "EVD 79101 Checkout Retry Impact Evaluation", confidence: 95, lineage: ["evidence"] },
  { id: "e6", from: "n-checkout", to: "n-journey", type: "SUPPORTS", evidence: "Commerce Journey Map 2026", confidence: 91, lineage: ["evidence"] },
  { id: "e7", from: "n-api", to: "n-availability", type: "MEASURED BY", evidence: "EVD 77421 Reliability Requirements v3.2", confidence: 98, lineage: ["evidence"] },
  { id: "e8", from: "n-api", to: "n-latency", type: "MEASURED BY", evidence: "EVD 77421 Reliability Requirements v3.2", confidence: 96, lineage: ["evidence"] },
  { id: "e9", from: "n-retry", to: "n-idempotency", type: "GOVERNED BY", evidence: "EVD 78012 Architecture Decision Log", confidence: 95, lineage: ["evidence"] },
  { id: "e10", from: "n-decision", to: "n-approval", type: "REQUIRES APPROVAL FROM", evidence: "EVD 79102 Reliability Review Record", confidence: 94, lineage: ["decision"] },
  { id: "e11", from: "n-availability", to: "n-decision", type: "INFORMED", evidence: "EVAL 2048 Impact Evaluation", confidence: 93, lineage: ["decision"] },
  { id: "e12", from: "n-decision", to: "n-outcome", type: "RESULTED IN", evidence: "EVD 82301 Conversion Telemetry", confidence: 97, lineage: ["decision", "outcome"] },
  { id: "e13", from: "n-outcome", to: "n-learning", type: "LEARNED FROM", evidence: "EVD 83401 Retry Program Retrospective", confidence: 94, lineage: ["outcome", "learning"] },
  { id: "e14", from: "n-learning", to: "n-idempotency", type: "UPDATED BY", evidence: "LRN 1426 Learning Record", confidence: 94, lineage: ["learning"] },
  { id: "e15", from: "n-sre", to: "n-outcome", type: "OWNS", evidence: "SRE Outcome Register", confidence: 96, lineage: ["outcome"] },
  { id: "e16", from: "n-fraud", to: "n-fraudsvc", type: "OWNS", evidence: "Risk Service Registry", confidence: 97, lineage: ["evidence"] },
  { id: "e17", from: "n-identity", to: "n-idsvc", type: "OWNS", evidence: "EVD 80211 Service Registry Export", confidence: 98, lineage: ["evidence"] },
  { id: "e18", from: "n-payments", to: "n-vault", type: "OWNS", evidence: "Payments Architecture v3.2", confidence: 95, lineage: ["evidence"] },
  { id: "e19", from: "n-payments", to: "n-sre", type: "REQUIRES APPROVAL FROM", evidence: "Release Governance Matrix", confidence: 92, lineage: ["decision"] },
  { id: "e20", from: "n-payments", to: "n-fraud", type: "REQUIRES APPROVAL FROM", evidence: "Release Governance Matrix", confidence: 91, lineage: ["decision"] },
];

/* --------------------------------- workbench ------------------------------- */

export interface WorkbenchResult {
  id: string; memoryType: string; title: string; whyRelevant: string;
  authority: AuthorityLevel; confidence: number; freshness: FreshnessStatus;
  evidenceCount: number; accessState: AccessClassification; relationship: string;
  recordId?: string; evidenceId?: string; supports: string[];
}

export const defaultMemoryQuestion =
  "What should teams know before increasing automated payment retries from two attempts to three?";

export const suggestedQuestions = [
  "What teams are affected by changing Payments API retry behavior?",
  "What service levels govern payment retries?",
  "Which decisions depended on Identity Services this quarter?",
  "Which Team Personas contain stale evidence?",
  "What changed in the quarter end deployment policy?",
  "What evidence supports the Payments availability target?",
  "What did we know when DEC 4812 was approved?",
  "What happened after the prior retry decision?",
];

export const workbenchResults: WorkbenchResult[] = [
  { id: "wr-1", memoryType: "Team Persona", title: "Payments Platform Persona", whyRelevant: "Owns retry orchestration and settlement correctness", authority: "Primary", confidence: 95, freshness: "Current", evidenceCount: 428, accessState: "Internal", relationship: "OWNS Retry Orchestrator", recordId: "MEM 100422", supports: ["c-conclusion", "c-personas", "c-reviewers"] },
  { id: "wr-2", memoryType: "Team Persona", title: "Checkout Engineering Persona", whyRelevant: "Owns checkout completion metric affected by retries", authority: "Primary", confidence: 93, freshness: "Current", evidenceCount: 316, accessState: "Internal", relationship: "PROVIDES TO Checkout Journey", supports: ["c-personas", "c-conclusion"] },
  { id: "wr-3", memoryType: "Team Persona", title: "Fraud Engineering Persona", whyRelevant: "Retry expansion increases fraud attempt surface", authority: "Primary", confidence: 91, freshness: "Current", evidenceCount: 208, accessState: "Confidential", relationship: "REQUIRES APPROVAL FROM", supports: ["c-personas", "c-reviewers"] },
  { id: "wr-4", memoryType: "Team Persona", title: "Site Reliability Engineering Persona", whyRelevant: "Owns rollback thresholds and observed outcomes", authority: "Primary", confidence: 94, freshness: "Current", evidenceCount: 242, accessState: "Internal", relationship: "OWNS Retry Outcome", supports: ["c-personas", "c-controls", "c-reviewers"] },
  { id: "wr-5", memoryType: "Business Condition", title: "Payments API Availability Condition", whyRelevant: "Retry load can threaten the availability commitment", authority: "Primary", confidence: 98, freshness: "Current", evidenceCount: 4, accessState: "Internal", relationship: "MEASURED BY Payments API", recordId: "MEM 100421", evidenceId: "EVD 77421", supports: ["c-conditions", "c-conclusion"] },
  { id: "wr-6", memoryType: "Business Condition", title: "Payments API Latency Threshold", whyRelevant: "Additional retry attempts add authorization latency", authority: "Primary", confidence: 95, freshness: "Current", evidenceCount: 3, accessState: "Internal", relationship: "MEASURED BY Payments API", recordId: "MEM 100430", evidenceId: "EVD 77421", supports: ["c-conditions"] },
  { id: "wr-7", memoryType: "Business Condition", title: "Retry Approval Requirement", whyRelevant: "Traffic share above ten percent requires joint approval", authority: "Primary", confidence: 94, freshness: "Current", evidenceCount: 2, accessState: "Internal", relationship: "REQUIRES APPROVAL FROM Release Governance", supports: ["c-conditions", "c-reviewers"] },
  { id: "wr-8", memoryType: "Control", title: "Idempotency Control", whyRelevant: "Primary control preventing duplicate authorization", authority: "Primary", confidence: 96, freshness: "Current", evidenceCount: 3, accessState: "Internal", relationship: "GOVERNS Retry Orchestrator", recordId: "MEM 100429", evidenceId: "EVD 78012", supports: ["c-controls", "c-conclusion"] },
  { id: "wr-9", memoryType: "Entity", title: "Identity Services Dependency", whyRelevant: "Tier 1 dependency in the authorization path with aging freshness", authority: "Registry Verified", confidence: 97, freshness: "Aging", evidenceCount: 6, accessState: "Restricted", relationship: "DEPENDS ON Payments API", recordId: "MEM 100425", evidenceId: "EVD 80211", supports: ["c-controls", "c-conclusion"] },
  { id: "wr-10", memoryType: "Entity", title: "Fraud Decision Service Dependency", whyRelevant: "Inline fraud evaluation scales with retry attempts", authority: "Registry Verified", confidence: 93, freshness: "Current", evidenceCount: 4, accessState: "Confidential", relationship: "DEPENDS ON Payments API", supports: ["c-controls", "c-evidence"] },
  { id: "wr-11", memoryType: "Policy", title: "Quarter End Deployment Restriction", whyRelevant: "Blocks rollout inside the quarter end window", authority: "Primary", confidence: 84, freshness: "Stale", evidenceCount: 5, accessState: "Internal", relationship: "GOVERNED BY Release Policy", recordId: "MEM 100426", evidenceId: "EVD 81002", supports: ["c-conditions", "c-reviewers"] },
  { id: "wr-12", memoryType: "Decision", title: "Prior Retry Decision", whyRelevant: "Establishes the precedent and its approved conditions", authority: "Primary", confidence: 91, freshness: "Current", evidenceCount: 18, accessState: "Internal", relationship: "INFORMED by availability condition", recordId: "MEM 100424", evidenceId: "EVD 79101", supports: ["c-prior-decision", "c-conclusion"] },
  { id: "wr-13", memoryType: "Outcome", title: "Prior Retry Outcome", whyRelevant: "Shows what actually happened after the prior change", authority: "Observed Production Outcome", confidence: 96, freshness: "Current", evidenceCount: 9, accessState: "Internal", relationship: "RESULTED IN from DEC 4812", recordId: "MEM 100427", evidenceId: "EVD 82301", supports: ["c-observed-outcome", "c-prior-expected"] },
  { id: "wr-14", memoryType: "Learning Record", title: "Retry Idempotency Learning Record", whyRelevant: "Validated lesson governing future retry expansion", authority: "Outcome Validated", confidence: 94, freshness: "Current", evidenceCount: 4, accessState: "Internal", relationship: "LEARNED FROM OUT 3284", recordId: "MEM 100428", evidenceId: "EVD 83401", supports: ["c-learning", "c-conclusion"] },
];

export interface Conclusion {
  id: string; group: string; text: string; supportingIds: string[];
}

export const workbenchConclusions: Conclusion[] = [
  { id: "c-conclusion", group: "Primary Conclusion", text: "Increasing retries may improve checkout completion, but introduces material duplicate transaction, latency, fraud, dependency, and release governance risks.", supportingIds: ["wr-1", "wr-5", "wr-8", "wr-9", "wr-12", "wr-14"] },
  { id: "c-personas", group: "Affected Team Personas", text: "Payments Platform · Checkout Engineering · Fraud Engineering · Site Reliability Engineering · Identity Engineering", supportingIds: ["wr-1", "wr-2", "wr-3", "wr-4", "wr-9"] },
  { id: "c-conditions", group: "Applicable Conditions", text: "Availability >= 99.95% · P95 latency < 250 ms · Error rate target < 0.3% · Changes affecting >10% checkout traffic require joint approval · No deployment during final three business days of financial quarter", supportingIds: ["wr-5", "wr-6", "wr-7", "wr-11"] },
  { id: "c-controls", group: "Required Controls", text: "Idempotency validation · Traffic segmentation · Progressive rollout · Automated rollback · Dependency health validation", supportingIds: ["wr-4", "wr-8", "wr-9", "wr-10"] },
  { id: "c-evidence", group: "Recommended Evidence", text: "Load tests · Idempotency tests · Fraud loss analysis · Checkout conversion analysis · Dependency health · Rollback thresholds", supportingIds: ["wr-10", "wr-13"] },
  { id: "c-prior-decision", group: "Prior Decision", text: "Limited retry increase approved for 5% traffic", supportingIds: ["wr-12"] },
  { id: "c-prior-expected", group: "Prior Expected Outcome", text: "Improve checkout completion 1.5%", supportingIds: ["wr-13"] },
  { id: "c-observed-outcome", group: "Observed Outcome", text: "Checkout completion improved 1.8%. Duplicate authorization attempts increased 0.4%.", supportingIds: ["wr-13"] },
  { id: "c-learning", group: "Learning", text: "Future retry changes require stronger idempotency validation before traffic expansion", supportingIds: ["wr-14"] },
  { id: "c-reviewers", group: "Required Reviewers", text: "Payments Reliability · Fraud Engineering · Site Reliability Engineering · Release Governance", supportingIds: ["wr-1", "wr-3", "wr-4", "wr-7", "wr-11"] },
];

export const seededMemoryQuery: MemoryQuery = {
  id: "MQ 1", question: defaultMemoryQuestion, filters: { knowledgeDomain: "Payments & Reliability", team: "All", authority: "Primary or better" },
  includedRecordIds: workbenchResults.map((r) => r.id), excludedRecordIds: [],
  resultSummary: "14 governed memory records retrieved across five layers.",
  conclusions: workbenchConclusions.map((c) => c.id),
  supportingRecordIds: workbenchResults.map((r) => r.recordId ?? r.id),
  evidenceReferenceIds: ["EVD 77421", "EVD 78012", "EVD 79101", "EVD 82301", "EVD 83401"],
  relationshipPaths: ["Payments Platform → Payments API → Identity Services", "DEC 4812 → OUT 3284 → LRN 1426"],
  confidence: 93, createdAt: "2026-08-06 20:41",
};

/* ---------------------------- provenance lineage --------------------------- */

export interface LineageNode {
  id: string; label: string; type: string; owner: string; timestamp: string;
  authority: AuthorityLevel; confidence: number; access: AccessClassification;
  version: string; status: string; chains: ("evidence" | "approval" | "decision" | "outcome" | "learning")[];
  detail: string; recordId?: string;
}

export const lineageNodes: LineageNode[] = [
  { id: "SRC", label: "Payments API Reliability Requirements v3.2", type: "Source Artifact", owner: "Payments Platform", timestamp: "2026-07-28 09:14", authority: "Primary", confidence: 98, access: "Confidential", version: "v3.2", status: "Current", chains: ["evidence", "approval"], detail: "Source of record for reliability commitments." },
  { id: "EVD 77421", label: "Evidence Record EVD 77421", type: "Evidence", owner: "Memory Platform", timestamp: "2026-07-28 09:14", authority: "Primary", confidence: 98, access: "Confidential", version: "v1", status: "Immutable", chains: ["evidence"], detail: "Exact passage preserved with sha256:9f21…c4a1." },
  { id: "CAN 38421", label: "Canonical Artifact CAN 38421", type: "Canonical Artifact", owner: "Payments Platform", timestamp: "2026-07-28 10:02", authority: "Primary", confidence: 96, access: "Confidential", version: "v3.2", status: "Published", chains: ["evidence"], detail: "Normalized sections, tables, and contextual chunks.", recordId: "MEM 100423" },
  { id: "COND 100421", label: "COND 100421 Availability >= 99.95%", type: "Business Condition", owner: "Payments Reliability", timestamp: "2026-07-28 11:40", authority: "Primary", confidence: 98, access: "Internal", version: "v3.2", status: "Approved", chains: ["evidence", "approval", "decision"], detail: "Availability commitment.", recordId: "MEM 100421" },
  { id: "COND 100422", label: "COND 100422 P95 latency < 250 ms", type: "Business Condition", owner: "Payments Reliability", timestamp: "2026-07-28 11:41", authority: "Primary", confidence: 95, access: "Internal", version: "v3.2", status: "Approved", chains: ["evidence", "approval"], detail: "Latency threshold.", recordId: "MEM 100430" },
  { id: "COND 100425", label: "COND 100425 Error rate < 0.3%", type: "Business Condition", owner: "Payments Reliability", timestamp: "2026-07-28 11:42", authority: "Primary", confidence: 93, access: "Internal", version: "v3.2", status: "Approved", chains: ["evidence", "approval"], detail: "Error rate target." },
  { id: "COND 100426", label: "COND 100426 Quarter end deployment restriction", type: "Policy Condition", owner: "Release Governance", timestamp: "2026-02-04 08:00", authority: "Primary", confidence: 84, access: "Internal", version: "v4.0", status: "Conflict Review", chains: ["approval", "decision"], detail: "Release freeze governing rollout timing.", recordId: "MEM 100426" },
  { id: "PERSONA", label: "Team Personas — Payments Platform, Checkout Engineering, Fraud Engineering", type: "Team Persona", owner: "Persona Governance", timestamp: "2026-07-02 08:11", authority: "Primary", confidence: 94, access: "Internal", version: "v3.4", status: "Approved", chains: ["approval", "decision"], detail: "Team perspectives mapped to the affected conditions.", recordId: "MEM 100422" },
  { id: "EVAL 2048", label: "Impact Evaluation EVAL 2048", type: "Impact Evaluation", owner: "Checkout Engineering", timestamp: "2026-04-02 10:22", authority: "Primary", confidence: 93, access: "Internal", version: "v1.0", status: "Complete", chains: ["decision"], detail: "Cross Persona impact evaluation for the retry change." },
  { id: "DEC 4812", label: "Decision DEC 4812 — Approve limited retry increase", type: "Decision", owner: "Checkout Engineering", timestamp: "2026-04-03 16:45", authority: "Primary", confidence: 91, access: "Internal", version: "v1.2", status: "Approved with Conditions", chains: ["approval", "decision", "outcome"], detail: "Approved with idempotency and traffic cap conditions.", recordId: "MEM 100424" },
  { id: "OUT 3284", label: "Outcome OUT 3284 — Checkout completion improved 1.8%", type: "Outcome", owner: "Site Reliability Engineering", timestamp: "2026-06-30 23:59", authority: "Observed Production Outcome", confidence: 96, access: "Internal", version: "v1.0", status: "Validated", chains: ["outcome", "learning"], detail: "Observed result with unfavourable duplicate authorization variance.", recordId: "MEM 100427" },
  { id: "LRN 1426", label: "Learning LRN 1426 — Strengthen idempotency validation before retry expansion", type: "Learning Record", owner: "Payments Reliability", timestamp: "2026-07-08 14:10", authority: "Outcome Validated", confidence: 94, access: "Internal", version: "v1.0", status: "Published", chains: ["learning"], detail: "Lesson routed to conditions, controls, and Persona sections.", recordId: "MEM 100428" },
];

/* ------------------------------- helper logic ------------------------------ */

const confidenceBand = (c: number) =>
  c >= 95 ? "95% and above" : c >= 90 ? "90% to 94%" : c >= 80 ? "80% to 89%" : "Below 80%";

const qualityBand = (q: number) =>
  q >= 95 ? "95 and above" : q >= 90 ? "90 to 94" : q >= 80 ? "80 to 89" : "Below 80";

const coverageBand = (c: number) => (c >= 95 ? "Complete" : c >= 70 ? "Partial" : "Missing");

export const activeMemoryFilterCount = (f: MemoryFilters): number =>
  (Object.keys(f) as (keyof MemoryFilters)[])
    .filter((k) => (k === "timeRange" ? f[k] !== "Last 30 Days" : f[k] !== "All")).length;

export function applyMemoryFilters(
  records: MemoryRecord[], f: MemoryFilters, search: string,
): MemoryRecord[] {
  const q = search.trim().toLowerCase();
  return records.filter((r) => {
    if (f.memoryType !== "All" && r.recordType !== f.memoryType) return false;
    if (f.businessUnit !== "All" && r.businessUnit !== f.businessUnit) return false;
    if (f.team !== "All" && !r.teamIds.includes(f.team)) return false;
    if (f.knowledgeDomain !== "All" && !r.knowledgeDomains.includes(f.knowledgeDomain)) return false;
    if (f.product !== "All" && !r.productIds.includes(f.product)) return false;
    if (f.service !== "All" && !r.serviceIds.includes(f.service)) return false;
    if (f.system !== "All" && !r.systemIds.includes(f.system)) return false;
    if (f.customerJourney !== "All" && !r.customerJourneyIds.includes(f.customerJourney)) return false;
    if (f.sourceCategory !== "All" && r.sourceCategory !== f.sourceCategory) return false;
    if (f.sourcePlatform !== "All" && r.sourcePlatform !== f.sourcePlatform) return false;
    if (f.owner !== "All" && r.owner !== f.owner) return false;
    if (f.authority !== "All" && r.authorityLevel !== f.authority) return false;
    if (f.approvalState !== "All" && r.approvalState !== f.approvalState) return false;
    if (f.accessClassification !== "All" && r.accessClassification !== f.accessClassification) return false;
    if (f.freshness !== "All" && r.freshnessStatus !== f.freshness) return false;
    if (f.confidenceBand !== "All" && confidenceBand(r.confidence) !== f.confidenceBand) return false;
    if (f.qualityBand !== "All" && qualityBand(r.qualityScore) !== f.qualityBand) return false;
    if (f.evidenceCoverage !== "All" && coverageBand(r.evidenceCoverage) !== f.evidenceCoverage) return false;
    if (f.versionStatus !== "All") {
      const state = r.versions.find((v) => v.version === r.version)?.state ?? "Current";
      if (state !== f.versionStatus) return false;
    }
    if (f.environment !== "All" && r.environment !== f.environment) return false;
    if (f.region !== "All" && r.region !== f.region) return false;
    if (f.dataResidency !== "All" && r.dataResidency !== f.dataResidency) return false;
    if (f.effectiveDate === "Expired" && !r.expirationDate) return false;
    if (f.effectiveDate === "Effective Now" && r.expirationDate) return false;
    if (q) {
      const hay = `${r.id} ${r.title} ${r.recordType} ${r.owner} ${r.knowledgeDomains.join(" ")} ${r.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export const recordToRow = (r: MemoryRecord): (string | number)[] => [
  r.id, r.title, r.recordType, r.knowledgeDomains.join("; "), r.owner, r.authorityLevel,
  r.approvalState, `${r.confidence}%`, r.freshnessStatus, r.evidenceCount, r.relationshipCount,
  r.accessClassification, r.version, r.updatedAt,
];

export const savedViews = ["Default", "Payments Reliability", "Governance Review", "Stale Memory", "Decision Lineage"];

export const memoryServiceStates = ["Operational", "Indexing", "Degraded", "Review Required", "Paused", "Maintenance"] as const;
export type MemoryServiceState = (typeof memoryServiceStates)[number];
