/**
 * Discovery Configuration — deterministic demonstration data + computation engine.
 *
 * Service boundary note: every export below is synthetic, deterministic demo data.
 * Replace the `seed*` constants and the `computePreview` / `runDryRun` functions with
 * real enterprise services without changing the component contracts.
 *
 * No credentials, tokens, customer records, or regulated data appear in this module.
 */

export type ViewMode = "configuration" | "preview" | "policy" | "processing";

export const VIEW_LABEL: Record<ViewMode, string> = {
  configuration: "Configuration View",
  preview: "Preview View",
  policy: "Policy View",
  processing: "Processing View",
};

export type ScopeState = "included" | "excluded" | "restricted";
export type ServiceState =
  | "Operational" | "Draft Changes" | "Validation Required" | "Review Required"
  | "Active" | "Scheduled" | "Degraded";

/* ------------------------------------------------------------------ models */

export interface DiscoveryConfiguration {
  id: string;
  name: string;
  description: string;
  scopeType: "Enterprise" | "Business Unit" | "Domain" | "Team Group" | "Policy Domain";
  scopeIds: string[];
  businessUnitIds: string[];
  teamIds: string[];
  knowledgeDomainIds: string[];
  productIds: string[];
  serviceIds: string[];
  systemIds: string[];
  customerJourneyIds: string[];
  regionIds: string[];
  environmentIds: string[];
  sourcePlatformConfigIds: string[];
  ruleIds: string[];
  permissionPolicyId: string;
  authorityPolicyId: string;
  freshnessPolicyId: string;
  cadencePolicyId: string;
  changeDetectionPolicyId: string;
  duplicatePolicyId: string;
  traversalPolicyId: string;
  samplingPolicyId: string;
  processingHandoffPolicyId: string;
  evidencePolicyId: string;
  owner: string;
  version: string;
  environment: string;
  status: "Active" | "Draft" | "Review Required" | "Scheduled" | "Retired";
  sourceCount: number;
  ruleCount: number;
  businessUnitCount: number;
  domainCount: number;
  discoveryMode: string;
  cadence: string;
  projectedVolume: number;
  accessClassification: string;
  region: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryScopeEntry {
  id: string;
  configurationId: string;
  scopeType: ScopeDimension;
  scopeId: string;
  scopeName: string;
  state: ScopeState;
  priority: "Standard" | "High" | "Critical";
  inheritedFrom: string | null;
  explicitOverride: boolean;
  accessClassification: "Internal" | "Confidential" | "Restricted" | "Highly Restricted";
  parentId: string | null;
  weight: number;
}

export type ScopeDimension =
  | "Business Unit" | "Team" | "Knowledge Domain" | "Business Capability" | "Product"
  | "Service" | "System" | "Customer Journey" | "Region" | "Environment";

export const scopeDimensions: ScopeDimension[] = [
  "Business Unit", "Team", "Knowledge Domain", "Business Capability", "Product",
  "Service", "System", "Customer Journey", "Region", "Environment",
];

export interface DiscoverySourcePlatformConfig {
  id: string;
  configurationId: string;
  platform: string;
  enabled: boolean;
  restricted: boolean;
  sourceCount: number;
  scopeLabel: string;
  scopeIds: string[];
  contentTypes: string[];
  permissionMode: "Preserve Source ACL" | "Metadata Only" | "Governed Access";
  discoveryDepth: 1 | 2 | 3 | 99;
  cadenceOverride: string;
  authorityPreference: AuthorityBand;
  artifactShare: number;
  status: "Configured" | "Restricted" | "Needs Owner" | "Excluded";
}

export type AuthorityBand =
  | "Primary Candidate" | "Supporting Candidate" | "Reference"
  | "Historical Reference" | "Unconfirmed" | "Observed Operational Evidence"
  | "Technical Evidence";

export const authorityBands: AuthorityBand[] = [
  "Primary Candidate", "Supporting Candidate", "Reference",
  "Historical Reference", "Unconfirmed",
];

export type RuleType =
  | "Include" | "Exclude" | "Restrict" | "Prioritize" | "Sample" | "Stop Traversal"
  | "Require Metadata" | "Require Owner" | "Require Authority" | "Freshness Override"
  | "Cadence Override" | "Processing Eligibility";

export const ruleTypes: RuleType[] = [
  "Include", "Exclude", "Restrict", "Prioritize", "Sample", "Stop Traversal",
  "Require Metadata", "Require Owner", "Require Authority", "Freshness Override",
  "Cadence Override", "Processing Eligibility",
];

export interface RuleCondition {
  id: string;
  attribute: string;
  operator: string;
  value: string;
  join: "AND" | "OR";
  group: number;
}

export interface DiscoveryRule {
  id: string;
  configurationId: string;
  name: string;
  ruleType: RuleType;
  scope: string;
  sourcePlatform: string;
  contentType: string;
  conditions: RuleCondition[];
  action: string;
  priority: number;
  owner: string;
  effectiveDate: string;
  expirationDate: string | null;
  processingEligibility: string[];
  enabled: boolean;
  previewMatchCount: number;
}

export interface DiscoveryPermissionPolicy {
  id: string;
  configurationId: string;
  preserveSourceAcl: boolean;
  preserveClassification: boolean;
  preserveResidency: boolean;
  unknownPermissionBehavior: boolean;
  metadataOnlyWhenRestricted: boolean;
  permissionChangeRediscovery: boolean;
  derivedKnowledgeRules: string;
}

export interface DiscoveryAuthorityPolicy {
  id: string;
  configurationId: string;
  defaultAuthority: AuthorityBand;
  sourceTypeMappings: { sourceType: string; authority: AuthorityBand; note: string }[];
  contentSpecificOverrides: { contentType: string; authority: AuthorityBand }[];
}

export interface DiscoveryFreshnessPolicy {
  id: string;
  configurationId: string;
  sourceType: string;
  freshnessSla: string;
  warningThreshold: string;
  staleThreshold: string;
  rediscoveryTrigger: string;
  owner: string;
  expectedStale: number;
  expectedWarning: number;
}

export interface DiscoveryCadencePolicy {
  id: string;
  configurationId: string;
  mode: CadenceMode;
  incrementalSchedule: string;
  fullSchedule: string;
  eventTriggers: string[];
  scopeOverrides: { scope: string; cadence: string; inherited: boolean }[];
}

export type CadenceMode =
  | "Continuous Incremental" | "Event Driven" | "Scheduled Incremental"
  | "Scheduled Full" | "Manual" | "Hybrid";

export const cadenceModes: CadenceMode[] = [
  "Continuous Incremental", "Event Driven", "Scheduled Incremental",
  "Scheduled Full", "Manual", "Hybrid",
];

export interface DiscoveryChangeDetectionPolicy {
  id: string;
  configurationId: string;
  triggerType: string;
  triggerDiscovery: string;
  metadataRefresh: boolean;
  fullReingestion: boolean;
  permissionRevalidation: boolean;
  downstreamReassessment: boolean;
}

export interface DiscoveryDuplicatePolicy {
  id: string;
  configurationId: string;
  identityStrategies: { name: string; enabled: boolean; note: string }[];
  duplicateStrategies: { outcome: string; handling: string }[];
  preserveAllSourceIdentities: boolean;
  autoLinkThreshold: number;
  humanReviewThreshold: number;
}

export interface DiscoveryTraversalPolicy {
  id: string;
  configurationId: string;
  maxDepth: 1 | 2 | 3 | 99;
  followLinks: boolean;
  followTickets: boolean;
  followArchitectureReferences: boolean;
  followServiceReferences: boolean;
  followDependencies: boolean;
  externalBoundaryBehavior: string;
}

export interface DiscoverySamplingPolicy {
  id: string;
  configurationId: string;
  contentType: string;
  samplingMode: "No Sampling" | "Percentage Sampling" | "Recent Window Sampling" | "Metadata First Sampling";
  sampleRate: number;
  timeWindow: string;
  metadataFirst: boolean;
  protected: boolean;
}

export interface DiscoveryProcessingHandoffPolicy {
  id: string;
  configurationId: string;
  destination: string;
  eligibleContentTypes: string;
  requiredMetadata: string;
  accessRequirements: string;
  qualityThreshold: number;
  authorityRequirement: string;
  humanReviewRequired: boolean;
  enabled: boolean;
}

export interface DiscoveryEvidencePolicy {
  id: string;
  configurationId: string;
  preserveOriginal: boolean;
  preserveSourceId: boolean;
  preserveSourceVersion: boolean;
  preserveExactPassage: boolean;
  preserveContentHash: boolean;
  preserveTimestamp: boolean;
  preservePermissionContext: boolean;
  preserveClassification: boolean;
  preserveMetadata: boolean;
  preserveHistory: boolean;
}

export interface DiscoveryPreviewWarning {
  id: string;
  severity: "Warning" | "Blocking" | "Info";
  message: string;
  element: string;
  elementLabel: string;
}

export interface DiscoveryPreview {
  id: string;
  configurationId: string;
  configurationVersion: string;
  sourcesEvaluated: number;
  includedSources: number;
  excludedSources: number;
  restrictedSources: number;
  discoverableArtifacts: number;
  newArtifacts: number;
  changedArtifacts: number;
  permissionChanges: number;
  potentialDuplicates: number;
  restrictedArtifacts: number;
  conditionEligibleArtifacts: number;
  personaRelevantArtifacts: number;
  projectedIngestionVolume: number;
  projectedFullReconciliationVolume: number;
  estimatedCyclesPerDay: number;
  estimatedWorkloadPerCycle: number;
  warnings: DiscoveryPreviewWarning[];
  blockingIssues: DiscoveryPreviewWarning[];
  createdAt: string;
}

export interface DiscoveryConfigurationStage {
  id: string;
  configurationId: string;
  name: string;
  sequence: number;
  status: "Complete" | "Warning" | "Pending" | "Ready" | "Not Started" | "Failed";
  completedItems: number;
  pendingItems: number;
  warningCount: number;
  failureCount: number;
  confidence: number;
  owner: string;
  note: string;
}

/* -------------------------------------------------------------- seed: scope */

interface ScopeSeed {
  name: string; weight: number; state?: ScopeState; parent?: string;
  classification?: DiscoveryScopeEntry["accessClassification"]; priority?: DiscoveryScopeEntry["priority"];
}

const businessUnitSeed: ScopeSeed[] = [
  { name: "Commerce Engineering", weight: 0.19, priority: "Critical" },
  { name: "Identity & Access", weight: 0.14, classification: "Restricted", priority: "Critical" },
  { name: "Platform Engineering", weight: 0.16 },
  { name: "Security Engineering", weight: 0.11, classification: "Restricted", priority: "High" },
  { name: "Customer Experience", weight: 0.12 },
  { name: "Customer Support Operations", weight: 0.1 },
  { name: "Release & Governance", weight: 0.09, priority: "High" },
  { name: "Finance Operations", weight: 0.09, classification: "Confidential" },
];

const knowledgeDomainSeed: ScopeSeed[] = [
  { name: "Payments & Commerce", weight: 0.14, priority: "Critical" },
  { name: "Identity & Access", weight: 0.12, classification: "Restricted" },
  { name: "Reliability Engineering", weight: 0.12 },
  { name: "Fraud & Risk", weight: 0.09, classification: "Confidential" },
  { name: "Security", weight: 0.1, classification: "Restricted" },
  { name: "Architecture", weight: 0.11, priority: "High" },
  { name: "Observability", weight: 0.08 },
  { name: "Customer Experience", weight: 0.09 },
  { name: "Release Governance", weight: 0.08 },
  { name: "Finance Operations", weight: 0.07, classification: "Confidential" },
];

const teamSeed: ScopeSeed[] = [
  { name: "Payments Platform", weight: 0.2, parent: "Commerce Engineering" },
  { name: "Checkout Experience", weight: 0.16, parent: "Commerce Engineering" },
  { name: "Token Services", weight: 0.14, parent: "Identity & Access" },
  { name: "Access Governance", weight: 0.12, parent: "Identity & Access" },
  { name: "Core Platform Runtime", weight: 0.14, parent: "Platform Engineering" },
  { name: "Observability Engineering", weight: 0.1, parent: "Platform Engineering" },
  { name: "Support Knowledge Operations", weight: 0.08, parent: "Customer Support Operations" },
  { name: "Release Governance Board", weight: 0.06, parent: "Release & Governance" },
];

const capabilitySeed: ScopeSeed[] = [
  { name: "Order Capture", weight: 0.18 },
  { name: "Payment Authorization", weight: 0.2 },
  { name: "Identity Verification", weight: 0.17 },
  { name: "Incident Response", weight: 0.15 },
  { name: "Change Governance", weight: 0.15 },
  { name: "Revenue Recognition", weight: 0.15, classification: "Confidential" },
];

const productSeed: ScopeSeed[] = [
  { name: "Enterprise Checkout", weight: 0.24, parent: "Commerce Engineering" },
  { name: "Payments API", weight: 0.22, parent: "Payments Platform" },
  { name: "Unified Account", weight: 0.2, parent: "Identity & Access" },
  { name: "Support Console", weight: 0.17, parent: "Customer Support Operations" },
  { name: "Merchant Portal", weight: 0.17, parent: "Commerce Engineering" },
];

const serviceSeed: ScopeSeed[] = [
  { name: "Authorization Service", weight: 0.22 },
  { name: "Token Vault Service", weight: 0.2, classification: "Restricted" },
  { name: "Fraud Scoring Service", weight: 0.16 },
  { name: "Notification Service", weight: 0.14 },
  { name: "Entitlement Service", weight: 0.14 },
  { name: "Ledger Posting Service", weight: 0.14, classification: "Confidential" },
];

const systemSeed: ScopeSeed[] = [
  { name: "Core Ledger", weight: 0.2, classification: "Confidential" },
  { name: "Identity Directory", weight: 0.2, classification: "Restricted" },
  { name: "Incident Management System", weight: 0.16 },
  { name: "Service Catalog", weight: 0.16 },
  { name: "Change Management System", weight: 0.14 },
  { name: "Enterprise Data Platform", weight: 0.14 },
];

const journeySeed: ScopeSeed[] = [
  { name: "Checkout", weight: 0.3 },
  { name: "Account Access", weight: 0.26 },
  { name: "Customer Support", weight: 0.24 },
  { name: "Release Management", weight: 0.2 },
];

const regionSeed: ScopeSeed[] = [
  { name: "North America", weight: 0.46 },
  { name: "Europe", weight: 0.32 },
  { name: "Asia Pacific", weight: 0.22 },
];

const environmentSeed: ScopeSeed[] = [
  { name: "Production", weight: 0.62 },
  { name: "Preproduction", weight: 0.28 },
  { name: "Development", weight: 0.1, state: "excluded" },
];

const scopeSeedByDimension: Record<ScopeDimension, ScopeSeed[]> = {
  "Business Unit": businessUnitSeed,
  Team: teamSeed,
  "Knowledge Domain": knowledgeDomainSeed,
  "Business Capability": capabilitySeed,
  Product: productSeed,
  Service: serviceSeed,
  System: systemSeed,
  "Customer Journey": journeySeed,
  Region: regionSeed,
  Environment: environmentSeed,
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const seedScopeEntries: DiscoveryScopeEntry[] = scopeDimensions.flatMap((dim) =>
  scopeSeedByDimension[dim].map((s, i) => ({
    id: `scope-${slug(dim)}-${slug(s.name)}`,
    configurationId: "DISC-CFG-001",
    scopeType: dim,
    scopeId: `${slug(dim)}-${i + 1}`,
    scopeName: s.name,
    state: s.state ?? (s.classification === "Restricted" ? "restricted" : "included"),
    priority: s.priority ?? "Standard",
    inheritedFrom: s.parent ? s.parent : dim === "Business Unit" ? "Enterprise" : null,
    explicitOverride: Boolean(s.state) || s.priority === "Critical",
    accessClassification: s.classification ?? "Internal",
    parentId: s.parent ? slug(s.parent) : null,
    weight: s.weight,
  })),
);

/* ---------------------------------------------------------- seed: platforms */

interface PlatformSeed {
  platform: string; sourceCount: number; scopeLabel: string; share: number;
  restricted?: boolean; authority: AuthorityBand; contentTypes: string[];
  status?: DiscoverySourcePlatformConfig["status"]; depth?: 1 | 2 | 3 | 99; cadence?: string;
}

const platformSeed: PlatformSeed[] = [
  { platform: "Google Drive", sourceCount: 42, scopeLabel: "42 enterprise source collections", share: 0.16, authority: "Supporting Candidate", contentTypes: ["Document", "Spreadsheet", "Presentation", "Meeting Note"] },
  { platform: "Confluence", sourceCount: 31, scopeLabel: "31 spaces", share: 0.15, authority: "Supporting Candidate", contentTypes: ["Document", "Runbook", "Standard", "Operational Review"] },
  { platform: "Jira", sourceCount: 44, scopeLabel: "44 projects", share: 0.19, authority: "Supporting Candidate", contentTypes: ["Ticket", "Change Record"] },
  { platform: "ServiceNow", sourceCount: 18, scopeLabel: "18 service groups", share: 0.11, authority: "Observed Operational Evidence", contentTypes: ["Incident", "Change Record", "Service Catalog"] },
  { platform: "GitHub", sourceCount: 28, scopeLabel: "28 organization or repository groups", share: 0.12, authority: "Technical Evidence", contentTypes: ["Source Code Metadata", "Pull Request Metadata", "API Specification"] },
  { platform: "SharePoint", sourceCount: 12, scopeLabel: "12 collections", share: 0.07, authority: "Supporting Candidate", contentTypes: ["Document", "Presentation", "Policy"] },
  { platform: "Slack", sourceCount: 9, scopeLabel: "Selected approved channels only", share: 0.05, restricted: true, authority: "Reference", contentTypes: ["Transcript", "Meeting Note"], status: "Restricted", depth: 1 },
  { platform: "Internal Wikis", sourceCount: 6, scopeLabel: "6 wiki spaces", share: 0.03, authority: "Reference", contentTypes: ["Document", "Runbook"] },
  { platform: "Architecture Repository", sourceCount: 9, scopeLabel: "9 repositories", share: 0.05, authority: "Primary Candidate", contentTypes: ["Architecture Decision", "API Specification"] },
  { platform: "Incident Management", sourceCount: 8, scopeLabel: "8 incident queues", share: 0.03, authority: "Observed Operational Evidence", contentTypes: ["Incident", "Post Incident Review"] },
  { platform: "Observability Metadata", sourceCount: 5, scopeLabel: "5 telemetry catalogs", share: 0.02, authority: "Technical Evidence", contentTypes: ["Dashboard Metadata", "Service Catalog"] },
  { platform: "Policy Repository", sourceCount: 7, scopeLabel: "7 libraries", share: 0.02, authority: "Primary Candidate", contentTypes: ["Policy", "Standard"] },
];

export const seedPlatformConfigs: DiscoverySourcePlatformConfig[] = platformSeed.map((p, i) => ({
  id: `SPC-${String(i + 1).padStart(3, "0")}`,
  configurationId: "DISC-CFG-001",
  platform: p.platform,
  enabled: true,
  restricted: Boolean(p.restricted),
  sourceCount: p.sourceCount,
  scopeLabel: p.scopeLabel,
  scopeIds: [],
  contentTypes: p.contentTypes,
  permissionMode: p.restricted ? "Metadata Only" : "Preserve Source ACL",
  discoveryDepth: p.depth ?? 3,
  cadenceOverride: p.cadence ?? "Inherited",
  authorityPreference: p.authority,
  artifactShare: p.share,
  status: p.status ?? (p.platform === "Internal Wikis" ? "Needs Owner" : "Configured"),
}));

/* ------------------------------------------------------- seed: content types */

export interface ContentTypePolicyRow {
  contentType: string;
  discoveryState: "Allow" | "Restrict" | "Exclude";
  defaultAuthority: AuthorityBand;
  evidenceEligible: boolean;
  conditionEligible: boolean;
  personaEligible: boolean;
  memoryEligible: boolean;
  freshnessSla: string;
  accessPolicy: string;
  weight: number;
}

export const seedContentTypes: ContentTypePolicyRow[] = [
  { contentType: "Document", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "180 days", accessPolicy: "Preserve Source ACL", weight: 0.17 },
  { contentType: "Spreadsheet", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: false, memoryEligible: true, freshnessSla: "180 days", accessPolicy: "Preserve Source ACL", weight: 0.06 },
  { contentType: "Presentation", discoveryState: "Allow", defaultAuthority: "Reference", evidenceEligible: true, conditionEligible: false, personaEligible: true, memoryEligible: true, freshnessSla: "365 days", accessPolicy: "Preserve Source ACL", weight: 0.05 },
  { contentType: "Ticket", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "State plus modified date", accessPolicy: "Preserve Source ACL", weight: 0.15 },
  { contentType: "Incident", discoveryState: "Allow", defaultAuthority: "Observed Operational Evidence", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "Event based", accessPolicy: "Preserve Source ACL", weight: 0.08 },
  { contentType: "Architecture Decision", discoveryState: "Allow", defaultAuthority: "Primary Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "365 days", accessPolicy: "Preserve Source ACL", weight: 0.05 },
  { contentType: "Policy", discoveryState: "Allow", defaultAuthority: "Primary Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "180 days", accessPolicy: "Governed Access", weight: 0.04 },
  { contentType: "Standard", discoveryState: "Allow", defaultAuthority: "Primary Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "180 days", accessPolicy: "Governed Access", weight: 0.03 },
  { contentType: "Runbook", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "90 days", accessPolicy: "Preserve Source ACL", weight: 0.05 },
  { contentType: "Meeting Note", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: false, personaEligible: true, memoryEligible: false, freshnessSla: "90 days", accessPolicy: "Preserve Source ACL", weight: 0.05 },
  { contentType: "Transcript", discoveryState: "Restrict", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: false, personaEligible: true, memoryEligible: false, freshnessSla: "Event based", accessPolicy: "Governed Access", weight: 0.04 },
  { contentType: "Source Code Metadata", discoveryState: "Allow", defaultAuthority: "Technical Evidence", evidenceEligible: true, conditionEligible: false, personaEligible: false, memoryEligible: true, freshnessSla: "30 days", accessPolicy: "Preserve Source ACL", weight: 0.05 },
  { contentType: "Pull Request Metadata", discoveryState: "Allow", defaultAuthority: "Technical Evidence", evidenceEligible: true, conditionEligible: false, personaEligible: true, memoryEligible: false, freshnessSla: "30 days", accessPolicy: "Preserve Source ACL", weight: 0.04 },
  { contentType: "API Specification", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: false, memoryEligible: true, freshnessSla: "90 days", accessPolicy: "Preserve Source ACL", weight: 0.03 },
  { contentType: "Service Catalog", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "30 days", accessPolicy: "Preserve Source ACL", weight: 0.03 },
  { contentType: "Operational Review", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "90 days", accessPolicy: "Preserve Source ACL", weight: 0.03 },
  { contentType: "Post Incident Review", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "90 days", accessPolicy: "Preserve Source ACL", weight: 0.02 },
  { contentType: "Dashboard Metadata", discoveryState: "Allow", defaultAuthority: "Technical Evidence", evidenceEligible: false, conditionEligible: false, personaEligible: false, memoryEligible: true, freshnessSla: "30 days", accessPolicy: "Preserve Source ACL", weight: 0.02 },
  { contentType: "Change Record", discoveryState: "Allow", defaultAuthority: "Supporting Candidate", evidenceEligible: true, conditionEligible: true, personaEligible: true, memoryEligible: true, freshnessSla: "Event based", accessPolicy: "Preserve Source ACL", weight: 0.01 },
];

export const alwaysExcludedContent = [
  "Secrets",
  "Credentials",
  "Private personal content",
  "Direct messages unless an explicitly approved policy exists",
  "Binary content with no supported parser",
  "Temporary files",
  "Deleted content",
  "Personal drives outside approved enterprise scope",
];

/* -------------------------------------------------------------- seed: rules */

export const seedRules: DiscoveryRule[] = [
  {
    id: "RULE-1001", configurationId: "DISC-CFG-001", name: "Include approved Architecture Decision Records",
    ruleType: "Include", scope: "Enterprise", sourcePlatform: "Architecture Repository", contentType: "Architecture Decision",
    conditions: [{ id: "c1", attribute: "Content Type", operator: "equals", value: "Architecture Decision", join: "AND", group: 0 }],
    action: "Discover Full Content", priority: 100, owner: "Enterprise Architecture", effectiveDate: "2026-01-12",
    expirationDate: null, processingEligibility: ["Evidence", "Normalization", "Condition Extraction", "Persona Relevance"],
    enabled: true, previewMatchCount: 18420,
  },
  {
    id: "RULE-1002", configurationId: "DISC-CFG-001", name: "Exclude personal drive content",
    ruleType: "Exclude", scope: "Enterprise", sourcePlatform: "All Platforms", contentType: "All",
    conditions: [{ id: "c1", attribute: "Owner Scope", operator: "equals", value: "Personal", join: "AND", group: 0 }],
    action: "Do Not Discover", priority: 1000, owner: "Information Governance", effectiveDate: "2025-11-02",
    expirationDate: null, processingEligibility: [], enabled: true, previewMatchCount: 214800,
  },
  {
    id: "RULE-1003", configurationId: "DISC-CFG-001", name: "Restrict approved security repositories",
    ruleType: "Restrict", scope: "Security", sourcePlatform: "GitHub", contentType: "Source Code Metadata",
    conditions: [{ id: "c1", attribute: "Knowledge Domain", operator: "equals", value: "Security", join: "AND", group: 0 }],
    action: "Discover Metadata and Governed Content Based on Access", priority: 900, owner: "Security Engineering",
    effectiveDate: "2025-12-01", expirationDate: null, processingEligibility: ["Evidence"], enabled: true, previewMatchCount: 42600,
  },
  {
    id: "RULE-1004", configurationId: "DISC-CFG-001", name: "Prioritize approved policies",
    ruleType: "Prioritize", scope: "Enterprise", sourcePlatform: "Policy Repository", contentType: "Policy",
    conditions: [{ id: "c1", attribute: "Source Authority", operator: "equals", value: "Approved", join: "AND", group: 0 }],
    action: "Authority: Primary Candidate", priority: 120, owner: "Release & Governance", effectiveDate: "2025-10-18",
    expirationDate: null, processingEligibility: ["Evidence", "Condition Extraction", "Cognitive Memory"], enabled: true, previewMatchCount: 6240,
  },
  {
    id: "RULE-1005", configurationId: "DISC-CFG-001", name: "Require business owner for production runbooks",
    ruleType: "Require Owner", scope: "Platform Engineering", sourcePlatform: "Confluence", contentType: "Runbook",
    conditions: [
      { id: "c1", attribute: "Content Type", operator: "equals", value: "Runbook", join: "AND", group: 0 },
      { id: "c2", attribute: "Environment", operator: "equals", value: "Production", join: "AND", group: 0 },
    ],
    action: "Hold Until Owner Confirmed", priority: 300, owner: "Platform Engineering", effectiveDate: "2026-02-04",
    expirationDate: null, processingEligibility: ["Evidence", "Normalization"], enabled: true, previewMatchCount: 3180,
  },
  {
    id: "RULE-1006", configurationId: "DISC-CFG-001", name: "Exclude secrets and credential files",
    ruleType: "Exclude", scope: "Enterprise", sourcePlatform: "All Platforms", contentType: "All",
    conditions: [
      { id: "c1", attribute: "Content Signature", operator: "matches", value: "Secret or Credential Pattern", join: "OR", group: 0 },
      { id: "c2", attribute: "File Name", operator: "matches", value: "*.pem, *.key, .env", join: "OR", group: 0 },
    ],
    action: "Do Not Discover", priority: 1000, owner: "Security Engineering", effectiveDate: "2025-09-30",
    expirationDate: null, processingEligibility: [], enabled: true, previewMatchCount: 9420,
  },
  {
    id: "RULE-1007", configurationId: "DISC-CFG-001", name: "Sample low authority chat references",
    ruleType: "Sample", scope: "Enterprise", sourcePlatform: "Slack", contentType: "Transcript",
    conditions: [{ id: "c1", attribute: "Source Authority", operator: "equals", value: "Reference", join: "AND", group: 0 }],
    action: "Metadata First, 10% content sampling in preview only", priority: 200, owner: "Information Governance",
    effectiveDate: "2026-01-05", expirationDate: null, processingEligibility: ["Evidence"], enabled: true, previewMatchCount: 58200,
  },
  {
    id: "RULE-1008", configurationId: "DISC-CFG-001", name: "Stop traversal at external domains",
    ruleType: "Stop Traversal", scope: "Enterprise", sourcePlatform: "All Platforms", contentType: "All",
    conditions: [{ id: "c1", attribute: "Link Target", operator: "not in", value: "Approved Enterprise Boundary", join: "AND", group: 0 }],
    action: "Stop Traversal", priority: 950, owner: "Enterprise Architecture", effectiveDate: "2025-08-14",
    expirationDate: null, processingEligibility: [], enabled: true, previewMatchCount: 12800,
  },
];

export const ruleAttributes = [
  "Content Type", "Knowledge Domain", "Business Unit", "Owner Scope", "Source Authority",
  "Access Classification", "Data Residency", "Environment", "Modified Date", "File Name",
  "Content Signature", "Link Target", "Source Platform", "Team",
];

export const ruleOperators = ["equals", "not equals", "in", "not in", "contains", "matches", "older than", "newer than"];

export const processingDestinations = [
  "Evidence Vault", "Artifact Ingestion", "Normalization", "Condition Extraction",
  "Persona Relevance", "Cognitive Memory",
];

/* --------------------------------------------------------- seed: policies */

export const seedPermissionPolicy: DiscoveryPermissionPolicy = {
  id: "PERM-001", configurationId: "DISC-CFG-001",
  preserveSourceAcl: true, preserveClassification: true, preserveResidency: true,
  unknownPermissionBehavior: true, metadataOnlyWhenRestricted: true, permissionChangeRediscovery: true,
  derivedKnowledgeRules:
    "Derived knowledge may only be published where approved governance permits it. Derived records never escape source restrictions automatically.",
};

export const permissionInheritanceChain = [
  "Source", "Collection", "Folder or Space", "Artifact", "Evidence", "Derived Records",
];

export const seedAuthorityPolicy: DiscoveryAuthorityPolicy = {
  id: "AUTH-001", configurationId: "DISC-CFG-001", defaultAuthority: "Unconfirmed",
  sourceTypeMappings: [
    { sourceType: "Approved Policy", authority: "Primary Candidate", note: "Governed policy library" },
    { sourceType: "Approved Standard", authority: "Primary Candidate", note: "Enterprise standards" },
    { sourceType: "Architecture Decision", authority: "Primary Candidate", note: "Primary or Supporting depending on approval state" },
    { sourceType: "Runbook", authority: "Supporting Candidate", note: "Operational procedure" },
    { sourceType: "Incident Record", authority: "Observed Operational Evidence", note: "Observed operational evidence" },
    { sourceType: "Post Incident Review", authority: "Supporting Candidate", note: "Reviewed operational learning" },
    { sourceType: "Ticket", authority: "Supporting Candidate", note: "Supporting or Reference depending on state" },
    { sourceType: "Meeting Transcript", authority: "Supporting Candidate", note: "Intent signal only" },
    { sourceType: "Chat Message", authority: "Reference", note: "Reference only" },
    { sourceType: "Source Code Metadata", authority: "Technical Evidence", note: "Technical evidence" },
  ],
  contentSpecificOverrides: [
    { contentType: "Architecture Decision", authority: "Primary Candidate" },
    { contentType: "Transcript", authority: "Supporting Candidate" },
  ],
};

export const seedFreshnessPolicies: DiscoveryFreshnessPolicy[] = [
  { id: "FRESH-001", configurationId: "DISC-CFG-001", sourceType: "Policies", freshnessSla: "Review every 180 days", warningThreshold: "150 days", staleThreshold: "180 days", rediscoveryTrigger: "Scheduled + modification", owner: "Release & Governance", expectedStale: 210, expectedWarning: 640 },
  { id: "FRESH-002", configurationId: "DISC-CFG-001", sourceType: "Architecture Decisions", freshnessSla: "365 days", warningThreshold: "300 days", staleThreshold: "365 days", rediscoveryTrigger: "Scheduled", owner: "Enterprise Architecture", expectedStale: 148, expectedWarning: 512 },
  { id: "FRESH-003", configurationId: "DISC-CFG-001", sourceType: "Runbooks", freshnessSla: "90 days", warningThreshold: "70 days", staleThreshold: "90 days", rediscoveryTrigger: "Scheduled + event", owner: "Platform Engineering", expectedStale: 386, expectedWarning: 1240 },
  { id: "FRESH-004", configurationId: "DISC-CFG-001", sourceType: "Service Catalog", freshnessSla: "30 days", warningThreshold: "21 days", staleThreshold: "30 days", rediscoveryTrigger: "Event driven", owner: "Platform Engineering", expectedStale: 62, expectedWarning: 184 },
  { id: "FRESH-005", configurationId: "DISC-CFG-001", sourceType: "Operational Reviews", freshnessSla: "90 days", warningThreshold: "70 days", staleThreshold: "90 days", rediscoveryTrigger: "Scheduled", owner: "Reliability Engineering", expectedStale: 94, expectedWarning: 302 },
  { id: "FRESH-006", configurationId: "DISC-CFG-001", sourceType: "Team Operating Documents", freshnessSla: "90 days", warningThreshold: "70 days", staleThreshold: "90 days", rediscoveryTrigger: "Scheduled", owner: "Customer Support Operations", expectedStale: 128, expectedWarning: 410 },
  { id: "FRESH-007", configurationId: "DISC-CFG-001", sourceType: "Meeting Transcripts", freshnessSla: "Event based", warningThreshold: "n/a", staleThreshold: "Event superseded", rediscoveryTrigger: "Event driven", owner: "Information Governance", expectedStale: 0, expectedWarning: 96 },
  { id: "FRESH-008", configurationId: "DISC-CFG-001", sourceType: "Tickets", freshnessSla: "State plus modified date", warningThreshold: "30 days idle", staleThreshold: "90 days idle", rediscoveryTrigger: "State change", owner: "Commerce Architecture", expectedStale: 1420, expectedWarning: 3860 },
];

export const seedCadencePolicy: DiscoveryCadencePolicy = {
  id: "CAD-001", configurationId: "DISC-CFG-001", mode: "Hybrid",
  incrementalSchedule: "Every 6 hours", fullSchedule: "Weekly full reconciliation",
  eventTriggers: ["Supported source change events", "Permission change events", "Archive or delete events"],
  scopeOverrides: [
    { scope: "Enterprise", cadence: "Scheduled incremental every 6 hours", inherited: false },
    { scope: "Commerce Engineering", cadence: "Every 2 hours", inherited: false },
    { scope: "Identity & Access (Restricted)", cadence: "Every 12 hours unless event driven", inherited: false },
    { scope: "Platform Engineering", cadence: "Every 6 hours", inherited: true },
    { scope: "Policy Repository", cadence: "Daily", inherited: false },
  ],
};

export const seedChangeDetection: DiscoveryChangeDetectionPolicy[] = [
  { id: "CD-01", configurationId: "DISC-CFG-001", triggerType: "New Artifact", triggerDiscovery: "Incremental", metadataRefresh: true, fullReingestion: true, permissionRevalidation: true, downstreamReassessment: true },
  { id: "CD-02", configurationId: "DISC-CFG-001", triggerType: "Content Changed", triggerDiscovery: "Incremental", metadataRefresh: true, fullReingestion: true, permissionRevalidation: false, downstreamReassessment: true },
  { id: "CD-03", configurationId: "DISC-CFG-001", triggerType: "Metadata Changed", triggerDiscovery: "Metadata Refresh", metadataRefresh: true, fullReingestion: false, permissionRevalidation: false, downstreamReassessment: false },
  { id: "CD-04", configurationId: "DISC-CFG-001", triggerType: "Permission Changed", triggerDiscovery: "Metadata Refresh", metadataRefresh: true, fullReingestion: false, permissionRevalidation: true, downstreamReassessment: true },
  { id: "CD-05", configurationId: "DISC-CFG-001", triggerType: "Owner Changed", triggerDiscovery: "Metadata Refresh", metadataRefresh: true, fullReingestion: false, permissionRevalidation: false, downstreamReassessment: true },
  { id: "CD-06", configurationId: "DISC-CFG-001", triggerType: "Classification Changed", triggerDiscovery: "Metadata Refresh", metadataRefresh: true, fullReingestion: false, permissionRevalidation: true, downstreamReassessment: true },
  { id: "CD-07", configurationId: "DISC-CFG-001", triggerType: "Version Changed", triggerDiscovery: "Incremental", metadataRefresh: true, fullReingestion: true, permissionRevalidation: false, downstreamReassessment: true },
  { id: "CD-08", configurationId: "DISC-CFG-001", triggerType: "Archived", triggerDiscovery: "Metadata Refresh", metadataRefresh: true, fullReingestion: false, permissionRevalidation: false, downstreamReassessment: true },
  { id: "CD-09", configurationId: "DISC-CFG-001", triggerType: "Deleted", triggerDiscovery: "Metadata Refresh", metadataRefresh: true, fullReingestion: false, permissionRevalidation: true, downstreamReassessment: true },
  { id: "CD-10", configurationId: "DISC-CFG-001", triggerType: "Restored", triggerDiscovery: "Incremental", metadataRefresh: true, fullReingestion: true, permissionRevalidation: true, downstreamReassessment: true },
  { id: "CD-11", configurationId: "DISC-CFG-001", triggerType: "Source Moved", triggerDiscovery: "Incremental", metadataRefresh: true, fullReingestion: false, permissionRevalidation: true, downstreamReassessment: true },
  { id: "CD-12", configurationId: "DISC-CFG-001", triggerType: "Relationship Changed", triggerDiscovery: "Metadata Refresh", metadataRefresh: true, fullReingestion: false, permissionRevalidation: false, downstreamReassessment: true },
];

export const seedDuplicatePolicy: DiscoveryDuplicatePolicy = {
  id: "DUP-001", configurationId: "DISC-CFG-001",
  identityStrategies: [
    { name: "Exact Hash Match", enabled: true, note: "Byte identical content" },
    { name: "Canonical URL Match", enabled: true, note: "Same governed source location" },
    { name: "Source Record ID Match", enabled: true, note: "Same source system identifier" },
    { name: "Strong Metadata Match", enabled: true, note: "Title, owner, version alignment" },
    { name: "Semantic Similarity Candidate", enabled: false, note: "Human review required before linking" },
  ],
  duplicateStrategies: [
    { outcome: "Same Artifact Version", handling: "Link records, preserve both identities" },
    { outcome: "Mirrored Copy", handling: "Link records, select canonical candidate for downstream processing" },
    { outcome: "Related Artifact", handling: "Link as related, process independently" },
    { outcome: "Potential Duplicate", handling: "Human review required" },
    { outcome: "Independent Artifact", handling: "Preserve both, no linkage" },
  ],
  preserveAllSourceIdentities: true,
  autoLinkThreshold: 96,
  humanReviewThreshold: 82,
};

export const seedTraversalPolicy: DiscoveryTraversalPolicy = {
  id: "TRAV-001", configurationId: "DISC-CFG-001", maxDepth: 3,
  followLinks: true, followTickets: true, followArchitectureReferences: true,
  followServiceReferences: true, followDependencies: true,
  externalBoundaryBehavior: "Do not leave the approved enterprise boundary",
};

export const seedSamplingPolicies: DiscoverySamplingPolicy[] = [
  { id: "SAMP-001", configurationId: "DISC-CFG-001", contentType: "Chat / low authority references", samplingMode: "Metadata First Sampling", sampleRate: 10, timeWindow: "Trailing 90 days", metadataFirst: true, protected: false },
  { id: "SAMP-002", configurationId: "DISC-CFG-001", contentType: "Dashboard Metadata", samplingMode: "Recent Window Sampling", sampleRate: 40, timeWindow: "Trailing 30 days", metadataFirst: true, protected: false },
  { id: "SAMP-003", configurationId: "DISC-CFG-001", contentType: "Approved Policies", samplingMode: "No Sampling", sampleRate: 100, timeWindow: "n/a", metadataFirst: false, protected: true },
  { id: "SAMP-004", configurationId: "DISC-CFG-001", contentType: "Critical Controls", samplingMode: "No Sampling", sampleRate: 100, timeWindow: "n/a", metadataFirst: false, protected: true },
  { id: "SAMP-005", configurationId: "DISC-CFG-001", contentType: "Architecture Decisions", samplingMode: "No Sampling", sampleRate: 100, timeWindow: "n/a", metadataFirst: false, protected: true },
  { id: "SAMP-006", configurationId: "DISC-CFG-001", contentType: "Regulatory Evidence", samplingMode: "No Sampling", sampleRate: 100, timeWindow: "n/a", metadataFirst: false, protected: true },
  { id: "SAMP-007", configurationId: "DISC-CFG-001", contentType: "Decision Records", samplingMode: "No Sampling", sampleRate: 100, timeWindow: "n/a", metadataFirst: false, protected: true },
  { id: "SAMP-008", configurationId: "DISC-CFG-001", contentType: "Outcome and Validated Learning Records", samplingMode: "No Sampling", sampleRate: 100, timeWindow: "n/a", metadataFirst: false, protected: true },
];

export const seedHandoffPolicies: DiscoveryProcessingHandoffPolicy[] = [
  { id: "HND-001", configurationId: "DISC-CFG-001", destination: "Evidence Vault", eligibleContentTypes: "All discoverable content types", requiredMetadata: "Source ID, version, hash, retrieval timestamp", accessRequirements: "Preserve source permission context", qualityThreshold: 100, authorityRequirement: "Any", humanReviewRequired: false, enabled: true },
  { id: "HND-002", configurationId: "DISC-CFG-001", destination: "Artifact Ingestion", eligibleContentTypes: "Parsable enterprise content", requiredMetadata: "Owner, classification, domain", accessRequirements: "Source ACL resolved", qualityThreshold: 85, authorityRequirement: "Any", humanReviewRequired: false, enabled: true },
  { id: "HND-003", configurationId: "DISC-CFG-001", destination: "Normalization", eligibleContentTypes: "Ingested artifacts", requiredMetadata: "Canonical type, language, structure", accessRequirements: "Inherited", qualityThreshold: 88, authorityRequirement: "Any", humanReviewRequired: false, enabled: true },
  { id: "HND-004", configurationId: "DISC-CFG-001", destination: "Condition Extraction", eligibleContentTypes: "Condition eligible content types only", requiredMetadata: "Owner, authority band, effective date", accessRequirements: "Governed access confirmed", qualityThreshold: 90, authorityRequirement: "Primary or Supporting Candidate", humanReviewRequired: true, enabled: true },
  { id: "HND-005", configurationId: "DISC-CFG-001", destination: "Persona Relevance", eligibleContentTypes: "Approved conditions and persona relevant artifacts", requiredMetadata: "Team, domain, role signals", accessRequirements: "Governed access confirmed", qualityThreshold: 90, authorityRequirement: "Approved conditions only", humanReviewRequired: true, enabled: true },
  { id: "HND-006", configurationId: "DISC-CFG-001", destination: "Cognitive Memory", eligibleContentTypes: "Approved records only", requiredMetadata: "Approval record, evidence chain, classification", accessRequirements: "Publication governance approval", qualityThreshold: 94, authorityRequirement: "Approved records only", humanReviewRequired: true, enabled: true },
  { id: "HND-007", configurationId: "DISC-CFG-001", destination: "Semantic Index", eligibleContentTypes: "Approved searchable context", requiredMetadata: "Classification, residency", accessRequirements: "Permission filtered at query time", qualityThreshold: 92, authorityRequirement: "Approved records only", humanReviewRequired: false, enabled: true },
  { id: "HND-008", configurationId: "DISC-CFG-001", destination: "Context Graph", eligibleContentTypes: "Approved entity and relationship records", requiredMetadata: "Entity identity, relationship type, provenance", accessRequirements: "Permission filtered at query time", qualityThreshold: 92, authorityRequirement: "Approved records only", humanReviewRequired: false, enabled: true },
];

export const seedEvidencePolicy: DiscoveryEvidencePolicy = {
  id: "EVID-001", configurationId: "DISC-CFG-001",
  preserveOriginal: true, preserveSourceId: true, preserveSourceVersion: true,
  preserveExactPassage: true, preserveContentHash: true, preserveTimestamp: true,
  preservePermissionContext: true, preserveClassification: true, preserveMetadata: true, preserveHistory: true,
};

export const evidenceFields: { key: keyof Omit<DiscoveryEvidencePolicy, "id" | "configurationId">; label: string }[] = [
  { key: "preserveOriginal", label: "Preserve Original Artifact" },
  { key: "preserveSourceId", label: "Preserve Source ID" },
  { key: "preserveSourceVersion", label: "Preserve Source Version" },
  { key: "preserveExactPassage", label: "Preserve Exact Passage Mapping" },
  { key: "preserveContentHash", label: "Preserve Content Hash" },
  { key: "preserveTimestamp", label: "Preserve Retrieval Timestamp" },
  { key: "preservePermissionContext", label: "Preserve Permission Context" },
  { key: "preserveClassification", label: "Preserve Access Classification" },
  { key: "preserveMetadata", label: "Preserve Source Metadata" },
  { key: "preserveHistory", label: "Preserve Historical Versions" },
];

/* ------------------------------------------------------- seed: inventory */

export const seedConfigurations: DiscoveryConfiguration[] = [
  {
    id: "DISC-CFG-001", name: "Enterprise Knowledge Discovery",
    description: "Enterprise wide discovery boundary covering approved knowledge sources across all business units.",
    scopeType: "Enterprise", scopeIds: ["enterprise"], businessUnitIds: businessUnitSeed.map((b) => b.name),
    teamIds: teamSeed.map((t) => t.name), knowledgeDomainIds: knowledgeDomainSeed.map((d) => d.name),
    productIds: productSeed.map((p) => p.name), serviceIds: serviceSeed.map((s) => s.name),
    systemIds: systemSeed.map((s) => s.name), customerJourneyIds: journeySeed.map((j) => j.name),
    regionIds: regionSeed.map((r) => r.name), environmentIds: ["Production", "Preproduction"],
    sourcePlatformConfigIds: seedPlatformConfigs.map((p) => p.id), ruleIds: seedRules.map((r) => r.id),
    permissionPolicyId: "PERM-001", authorityPolicyId: "AUTH-001", freshnessPolicyId: "FRESH-001",
    cadencePolicyId: "CAD-001", changeDetectionPolicyId: "CD-01", duplicatePolicyId: "DUP-001",
    traversalPolicyId: "TRAV-001", samplingPolicyId: "SAMP-001", processingHandoffPolicyId: "HND-001",
    evidencePolicyId: "EVID-001", owner: "Enterprise Architecture", version: "4.2", environment: "Production",
    status: "Active", sourceCount: 184, ruleCount: 148, businessUnitCount: 8, domainCount: 22,
    discoveryMode: "Incremental", cadence: "Every 6 Hours", projectedVolume: 2_400_000,
    accessClassification: "Internal", region: "Global", createdAt: "2025-06-14", updatedAt: "2026-08-04",
  },
  {
    id: "DISC-CFG-002", name: "Commerce Engineering Discovery",
    description: "Business unit scoped discovery for payments, checkout, fraud, and reliability knowledge.",
    scopeType: "Business Unit", scopeIds: ["Commerce Engineering"], businessUnitIds: ["Commerce Engineering"],
    teamIds: ["Payments Platform", "Checkout Experience"],
    knowledgeDomainIds: ["Payments", "Checkout", "Fraud", "Reliability"],
    productIds: ["Enterprise Checkout", "Payments API"], serviceIds: ["Authorization Service", "Fraud Scoring Service"],
    systemIds: ["Core Ledger"], customerJourneyIds: ["Checkout"], regionIds: ["North America", "Europe"],
    environmentIds: ["Production"], sourcePlatformConfigIds: [], ruleIds: [],
    permissionPolicyId: "PERM-001", authorityPolicyId: "AUTH-001", freshnessPolicyId: "FRESH-002",
    cadencePolicyId: "CAD-002", changeDetectionPolicyId: "CD-02", duplicatePolicyId: "DUP-001",
    traversalPolicyId: "TRAV-001", samplingPolicyId: "SAMP-001", processingHandoffPolicyId: "HND-001",
    evidencePolicyId: "EVID-001", owner: "Commerce Architecture", version: "3.1", environment: "Production",
    status: "Active", sourceCount: 42, ruleCount: 38, businessUnitCount: 1, domainCount: 4,
    discoveryMode: "Incremental", cadence: "Every 2 Hours", projectedVolume: 428_000,
    accessClassification: "Internal", region: "North America", createdAt: "2025-09-02", updatedAt: "2026-07-29",
  },
  {
    id: "DISC-CFG-003", name: "Identity Restricted Knowledge",
    description: "Domain scoped discovery for identity and access knowledge under restricted access handling.",
    scopeType: "Domain", scopeIds: ["Identity & Access"], businessUnitIds: ["Identity & Access"],
    teamIds: ["Token Services", "Access Governance"], knowledgeDomainIds: ["Identity & Access", "Security"],
    productIds: ["Unified Account"], serviceIds: ["Token Vault Service", "Entitlement Service"],
    systemIds: ["Identity Directory"], customerJourneyIds: ["Account Access"], regionIds: ["North America", "Europe"],
    environmentIds: ["Production"], sourcePlatformConfigIds: [], ruleIds: [],
    permissionPolicyId: "PERM-001", authorityPolicyId: "AUTH-001", freshnessPolicyId: "FRESH-003",
    cadencePolicyId: "CAD-003", changeDetectionPolicyId: "CD-04", duplicatePolicyId: "DUP-001",
    traversalPolicyId: "TRAV-001", samplingPolicyId: "SAMP-003", processingHandoffPolicyId: "HND-001",
    evidencePolicyId: "EVID-001", owner: "Identity Architecture", version: "2.6", environment: "Production",
    status: "Active", sourceCount: 28, ruleCount: 46, businessUnitCount: 1, domainCount: 2,
    discoveryMode: "Incremental", cadence: "Every 4 Hours", projectedVolume: 214_000,
    accessClassification: "Restricted", region: "Global", createdAt: "2025-10-11", updatedAt: "2026-08-02",
  },
  {
    id: "DISC-CFG-004", name: "Customer Support Pilot",
    description: "Team group pilot covering support knowledge operations and customer resolution context.",
    scopeType: "Team Group", scopeIds: ["Support Knowledge Operations"], businessUnitIds: ["Customer Support Operations"],
    teamIds: ["Support Knowledge Operations"], knowledgeDomainIds: ["Customer Experience"],
    productIds: ["Support Console"], serviceIds: ["Notification Service"], systemIds: ["Service Catalog"],
    customerJourneyIds: ["Customer Support"], regionIds: ["North America"], environmentIds: ["Preproduction"],
    sourcePlatformConfigIds: [], ruleIds: [],
    permissionPolicyId: "PERM-001", authorityPolicyId: "AUTH-001", freshnessPolicyId: "FRESH-006",
    cadencePolicyId: "CAD-004", changeDetectionPolicyId: "CD-03", duplicatePolicyId: "DUP-001",
    traversalPolicyId: "TRAV-001", samplingPolicyId: "SAMP-002", processingHandoffPolicyId: "HND-002",
    evidencePolicyId: "EVID-001", owner: "Support Knowledge Operations", version: "0.9", environment: "Preproduction",
    status: "Draft", sourceCount: 14, ruleCount: 21, businessUnitCount: 1, domainCount: 1,
    discoveryMode: "Scheduled Full plus Incremental", cadence: "Daily", projectedVolume: 96_000,
    accessClassification: "Internal", region: "North America", createdAt: "2026-05-19", updatedAt: "2026-08-05",
  },
  {
    id: "DISC-CFG-005", name: "Quarter End Governance Discovery",
    description: "Policy domain discovery supporting quarter end governance, control evidence, and audit readiness.",
    scopeType: "Policy Domain", scopeIds: ["Release Governance"], businessUnitIds: ["Release & Governance", "Finance Operations"],
    teamIds: ["Release Governance Board"], knowledgeDomainIds: ["Release Governance", "Finance Operations"],
    productIds: [], serviceIds: ["Ledger Posting Service"], systemIds: ["Change Management System"],
    customerJourneyIds: ["Release Management"], regionIds: ["North America", "Europe", "Asia Pacific"],
    environmentIds: ["Production"], sourcePlatformConfigIds: [], ruleIds: [],
    permissionPolicyId: "PERM-001", authorityPolicyId: "AUTH-001", freshnessPolicyId: "FRESH-001",
    cadencePolicyId: "CAD-005", changeDetectionPolicyId: "CD-07", duplicatePolicyId: "DUP-001",
    traversalPolicyId: "TRAV-001", samplingPolicyId: "SAMP-004", processingHandoffPolicyId: "HND-006",
    evidencePolicyId: "EVID-001", owner: "Release & Governance", version: "1.4", environment: "Production",
    status: "Review Required", sourceCount: 18, ruleCount: 32, businessUnitCount: 2, domainCount: 2,
    discoveryMode: "Event plus Scheduled", cadence: "Weekly", projectedVolume: 128_000,
    accessClassification: "Confidential", region: "Global", createdAt: "2025-12-08", updatedAt: "2026-08-01",
  },
];

/* ------------------------------------------------------------ lifecycle */

export const seedStages: DiscoveryConfigurationStage[] = [
  ["Define Enterprise Scope", "Complete", 42, 0, 0, 0, 98, "Enterprise Architecture", "Enterprise, business unit, domain, and region scope confirmed"],
  ["Select Sources", "Complete", 184, 0, 0, 0, 96, "Enterprise Architecture", "184 sources evaluated, 162 included"],
  ["Define Discovery Boundaries", "Complete", 28, 0, 0, 0, 96, "Information Governance", "Traversal boundary held inside approved enterprise scope"],
  ["Configure Content Rules", "Complete", 148, 0, 0, 0, 95, "Information Governance", "148 rules active across include, exclude, and restrict types"],
  ["Configure Permissions", "Complete", 12, 0, 0, 0, 100, "Security Engineering", "Source ACL preservation enforced end to end"],
  ["Configure Authority & Freshness", "Complete", 18, 0, 0, 0, 94, "Release & Governance", "Authority bands and freshness SLAs assigned"],
  ["Configure Change Detection", "Complete", 12, 0, 0, 0, 95, "Platform Engineering", "12 change triggers mapped to discovery behavior"],
  ["Configure Discovery Cadence", "Complete", 5, 0, 0, 0, 96, "Platform Engineering", "Hybrid cadence with weekly full reconciliation"],
  ["Configure Processing Handoffs", "Warning", 6, 2, 1, 0, 89, "Enterprise Architecture", "2 optional mappings incomplete"],
  ["Validate Configuration", "Pending", 0, 9, 0, 0, 0, "Enterprise Architecture", "Validation runs in Prompt 2 governance"],
  ["Preview Discovery", "Ready", 0, 1, 0, 0, 95, "Enterprise Architecture", "Deterministic preview and dry run available"],
  ["Approve Configuration", "Not Started", 0, 3, 0, 0, 0, "Governance Board", "Approval workflow arrives with configuration governance"],
  ["Activate", "Not Started", 0, 2, 0, 0, 0, "Platform Engineering", "Activation and scheduled activation arrive with governance"],
].map(([name, status, completedItems, pendingItems, warningCount, failureCount, confidence, owner, note], i) => ({
  id: `STG-${i + 1}`,
  configurationId: "DISC-CFG-001",
  name: name as string,
  sequence: i + 1,
  status: status as DiscoveryConfigurationStage["status"],
  completedItems: completedItems as number,
  pendingItems: pendingItems as number,
  warningCount: warningCount as number,
  failureCount: failureCount as number,
  confidence: confidence as number,
  owner: owner as string,
  note: note as string,
}));

/* ------------------------------------------------------------- quality */

export interface QualityDimension {
  name: string; base: number; target: number; elements: string;
}

export const qualityDimensions: QualityDimension[] = [
  { name: "Scope Completeness", base: 98, target: 99, elements: "Enterprise scope, business units, domains" },
  { name: "Source Coverage", base: 96, target: 97, elements: "Source platform configuration" },
  { name: "Rule Integrity", base: 95, target: 97, elements: "Discovery rules, priority ordering" },
  { name: "Permission Preservation", base: 100, target: 100, elements: "Permission policy, inheritance chain" },
  { name: "Authority Definition", base: 94, target: 96, elements: "Authority preferences, content overrides" },
  { name: "Freshness Coverage", base: 92, target: 96, elements: "Freshness SLAs by source type" },
  { name: "Ownership Coverage", base: 94, target: 97, elements: "Source owners, rule owners" },
  { name: "Data Residency Coverage", base: 96, target: 98, elements: "Region scope, residency policy" },
  { name: "Processing Handoff Coverage", base: 97, target: 98, elements: "Handoff destinations and eligibility" },
  { name: "Preview Confidence", base: 95, target: 96, elements: "Preview and dry run determinism" },
];

/* -------------------------------------------------------------- filters */

export interface Filters {
  status: string; businessUnit: string; team: string; knowledgeDomain: string;
  sourceCategory: string; sourcePlatform: string; sourceType: string; region: string;
  environment: string; accessClassification: string; dataResidency: string; authorityLevel: string;
  cadence: string; discoveryMode: string; contentType: string; owner: string;
  version: string; createdDate: string; modifiedDate: string;
}

export const defaultFilters: Filters = {
  status: "All", businessUnit: "All", team: "All", knowledgeDomain: "All",
  sourceCategory: "All", sourcePlatform: "All", sourceType: "All", region: "All",
  environment: "All", accessClassification: "All", dataResidency: "All", authorityLevel: "All",
  cadence: "All", discoveryMode: "All", contentType: "All", owner: "All",
  version: "All", createdDate: "All", modifiedDate: "All",
};

export const filterOptions: { key: keyof Filters; label: string; options: string[] }[] = [
  { key: "status", label: "Configuration Status", options: ["All", "Active", "Draft", "Review Required", "Scheduled", "Retired"] },
  { key: "businessUnit", label: "Business Unit", options: ["All", ...businessUnitSeed.map((b) => b.name)] },
  { key: "team", label: "Team", options: ["All", ...teamSeed.map((t) => t.name)] },
  { key: "knowledgeDomain", label: "Knowledge Domain", options: ["All", ...knowledgeDomainSeed.map((d) => d.name)] },
  { key: "sourceCategory", label: "Source Category", options: ["All", "Document Management", "Work Management", "Engineering", "Operations", "Policy"] },
  { key: "sourcePlatform", label: "Source Platform", options: ["All", ...platformSeed.map((p) => p.platform)] },
  { key: "sourceType", label: "Source Type", options: ["All", "Collection", "Space", "Project", "Repository", "Channel", "Library"] },
  { key: "region", label: "Region", options: ["All", "Global", "North America", "Europe", "Asia Pacific"] },
  { key: "environment", label: "Environment", options: ["All", "Production", "Preproduction", "Development"] },
  { key: "accessClassification", label: "Access Classification", options: ["All", "Internal", "Confidential", "Restricted", "Highly Restricted"] },
  { key: "dataResidency", label: "Data Residency", options: ["All", "In Region Only", "Regional Replication Allowed", "Global"] },
  { key: "authorityLevel", label: "Authority Level", options: ["All", ...authorityBands] },
  { key: "cadence", label: "Discovery Cadence", options: ["All", "Every 2 Hours", "Every 4 Hours", "Every 6 Hours", "Daily", "Weekly"] },
  { key: "discoveryMode", label: "Discovery Mode", options: ["All", "Incremental", "Scheduled Full plus Incremental", "Event plus Scheduled", "Manual"] },
  { key: "contentType", label: "Content Type", options: ["All", ...seedContentTypes.map((c) => c.contentType)] },
  { key: "owner", label: "Owner", options: ["All", ...Array.from(new Set(seedConfigurations.map((c) => c.owner)))] },
  { key: "version", label: "Configuration Version", options: ["All", "4.2", "3.1", "2.6", "1.4", "0.9"] },
  { key: "createdDate", label: "Created Date", options: ["All", "Last 30 days", "Last 90 days", "Last 12 months", "Older"] },
  { key: "modifiedDate", label: "Modified Date", options: ["All", "Last 7 days", "Last 30 days", "Last 90 days", "Older"] },
];

export const activeFilterCount = (f: Filters) =>
  Object.values(f).filter((v) => v !== "All").length;

/* ------------------------------------------------------- draft state model */

export interface DraftState {
  name: string;
  basedOn: string;
  version: string;
  scope: Record<string, ScopeState>;
  scopePriority: Record<string, DiscoveryScopeEntry["priority"]>;
  platforms: Record<string, { enabled: boolean; restricted: boolean; depth: 1 | 2 | 3 | 99; permissionMode: DiscoverySourcePlatformConfig["permissionMode"]; cadenceOverride: string; authority: AuthorityBand }>;
  contentTypes: Record<string, ContentTypePolicyRow>;
  rules: DiscoveryRule[];
  permission: DiscoveryPermissionPolicy;
  authority: DiscoveryAuthorityPolicy;
  freshness: DiscoveryFreshnessPolicy[];
  cadence: DiscoveryCadencePolicy;
  changeDetection: DiscoveryChangeDetectionPolicy[];
  duplicate: DiscoveryDuplicatePolicy;
  traversal: DiscoveryTraversalPolicy;
  sampling: DiscoverySamplingPolicy[];
  handoffs: DiscoveryProcessingHandoffPolicy[];
  evidence: DiscoveryEvidencePolicy;
}

export function buildDraft(): DraftState {
  const scope: Record<string, ScopeState> = {};
  const scopePriority: Record<string, DiscoveryScopeEntry["priority"]> = {};
  seedScopeEntries.forEach((e) => {
    scope[e.id] = e.state;
    scopePriority[e.id] = e.priority;
  });
  const platforms: DraftState["platforms"] = {};
  seedPlatformConfigs.forEach((p) => {
    platforms[p.id] = {
      enabled: p.enabled, restricted: p.restricted, depth: p.discoveryDepth,
      permissionMode: p.permissionMode, cadenceOverride: p.cadenceOverride, authority: p.authorityPreference,
    };
  });
  const contentTypes: Record<string, ContentTypePolicyRow> = {};
  seedContentTypes.forEach((c) => { contentTypes[c.contentType] = { ...c }; });

  return {
    name: "Enterprise Knowledge Discovery v4.3 Draft",
    basedOn: "Active v4.2",
    version: "4.3",
    scope, scopePriority, platforms, contentTypes,
    rules: seedRules.map((r) => ({ ...r })),
    permission: { ...seedPermissionPolicy },
    authority: { ...seedAuthorityPolicy },
    freshness: seedFreshnessPolicies.map((f) => ({ ...f })),
    cadence: { ...seedCadencePolicy },
    changeDetection: seedChangeDetection.map((c) => ({ ...c })),
    duplicate: { ...seedDuplicatePolicy, identityStrategies: seedDuplicatePolicy.identityStrategies.map((s) => ({ ...s })) },
    traversal: { ...seedTraversalPolicy },
    sampling: seedSamplingPolicies.map((s) => ({ ...s })),
    handoffs: seedHandoffPolicies.map((h) => ({ ...h })),
    evidence: { ...seedEvidencePolicy },
  };
}

/* ------------------------------------------------- deterministic computation */

const BASE = {
  sourcesEvaluated: 184,
  includedSources: 162,
  restrictedSources: 31,
  artifacts: 2_400_000,
  newRatio: 124_000 / 2_400_000,
  changedRatio: 62_000 / 2_400_000,
  permissionChangeRatio: 4_200 / 2_400_000,
  duplicateRatio: 18_000 / 2_400_000,
  restrictedRatio: 284_000 / 2_400_000,
  conditionRatio: 146_000 / 2_400_000,
  personaRatio: 82_000 / 2_400_000,
};

const depthFactor = (d: 1 | 2 | 3 | 99) => (d === 1 ? 0.62 : d === 2 ? 0.84 : d === 3 ? 1 : 1.18);

function scopeFactorFor(draft: DraftState, dimension: ScopeDimension) {
  const entries = seedScopeEntries.filter((e) => e.scopeType === dimension);
  const total = entries.reduce((s, e) => s + e.weight, 0) || 1;
  const active = entries.reduce((s, e) => {
    const st = draft.scope[e.id];
    return s + (st === "included" ? e.weight : st === "restricted" ? e.weight * 0.6 : 0);
  }, 0);
  return active / total;
}

export function computeScopeFactors(draft: DraftState) {
  const bu = scopeFactorFor(draft, "Business Unit");
  const domain = scopeFactorFor(draft, "Knowledge Domain");
  const region = scopeFactorFor(draft, "Region");
  const environment = scopeFactorFor(draft, "Environment");
  return { bu, domain, region, environment, combined: bu * domain * (0.5 + 0.5 * region) * (0.6 + 0.4 * (environment / 0.9)) };
}

export function computePreview(draft: DraftState): DiscoveryPreview {
  const factors = computeScopeFactors(draft);

  const platformArtifactShare = seedPlatformConfigs.reduce((s, p) => {
    const d = draft.platforms[p.id];
    if (!d?.enabled) return s;
    const restrictedPenalty = d.restricted ? 0.4 : 1;
    return s + p.artifactShare * restrictedPenalty * (depthFactor(d.depth) / depthFactor(3));
  }, 0);
  const totalShare = seedPlatformConfigs.reduce((s, p) => s + p.artifactShare, 0);
  const platformFactor = platformArtifactShare / totalShare;

  const sourceFactor = seedPlatformConfigs.reduce((s, p) => {
    const d = draft.platforms[p.id];
    return s + (d?.enabled ? p.sourceCount : 0);
  }, 0) / seedPlatformConfigs.reduce((s, p) => s + p.sourceCount, 0);

  const ctTotal = seedContentTypes.reduce((s, c) => s + c.weight, 0);
  const ctActive = seedContentTypes.reduce((s, c) => {
    const row = draft.contentTypes[c.contentType];
    if (!row || row.discoveryState === "Exclude") return s;
    return s + c.weight * (row.discoveryState === "Restrict" ? 0.55 : 1);
  }, 0);
  const contentFactor = ctActive / ctTotal;

  const samplingFactor = draft.sampling.reduce((s, sp) => {
    if (sp.protected || sp.samplingMode === "No Sampling") return s;
    return s - (1 - sp.sampleRate / 100) * 0.02;
  }, 1);

  const activeExcludeRules = draft.rules.filter((r) => r.enabled && (r.ruleType === "Exclude" || r.ruleType === "Stop Traversal"));
  const ruleFactor = Math.max(0.5, 1 - activeExcludeRules.length * 0.015);

  const traversal = depthFactor(draft.traversal.maxDepth) / depthFactor(3);
  const followFactor =
    (draft.traversal.followLinks ? 0.03 : 0) +
    (draft.traversal.followTickets ? 0.03 : 0) +
    (draft.traversal.followArchitectureReferences ? 0.02 : 0) +
    (draft.traversal.followServiceReferences ? 0.02 : 0) +
    (draft.traversal.followDependencies ? 0.02 : 0);
  const traversalFactor = traversal * (0.88 + followFactor);

  const volumeFactor = factors.combined * platformFactor * contentFactor * samplingFactor * ruleFactor * traversalFactor;

  const discoverableArtifacts = Math.round(BASE.artifacts * volumeFactor);
  const includedSources = Math.max(0, Math.round(BASE.includedSources * sourceFactor * factors.bu));
  const sourcesEvaluated = BASE.sourcesEvaluated;
  const excludedSources = Math.max(0, sourcesEvaluated - includedSources);
  const restrictedSources = Math.round(
    seedPlatformConfigs.reduce((s, p) => (draft.platforms[p.id]?.restricted ? s + p.sourceCount : s), 0) +
    seedScopeEntries.filter((e) => draft.scope[e.id] === "restricted").length * 2,
  );

  const perm = draft.permission;
  const permissionStrictness =
    (perm.preserveSourceAcl ? 0.4 : 0) + (perm.metadataOnlyWhenRestricted ? 0.25 : 0) +
    (perm.unknownPermissionBehavior ? 0.2 : 0) + (perm.preserveClassification ? 0.15 : 0);
  const restrictedArtifacts = Math.round(discoverableArtifacts * BASE.restrictedRatio * (0.55 + permissionStrictness));

  const conditionHandoff = draft.handoffs.find((h) => h.destination === "Condition Extraction");
  const personaHandoff = draft.handoffs.find((h) => h.destination === "Persona Relevance");
  const conditionEligibleWeight = seedContentTypes.reduce((s, c) => {
    const row = draft.contentTypes[c.contentType];
    return row && row.conditionEligible && row.discoveryState !== "Exclude" ? s + c.weight : s;
  }, 0) / ctTotal;
  const personaEligibleWeight = seedContentTypes.reduce((s, c) => {
    const row = draft.contentTypes[c.contentType];
    return row && row.personaEligible && row.discoveryState !== "Exclude" ? s + c.weight : s;
  }, 0) / ctTotal;

  const conditionEligibleArtifacts = conditionHandoff?.enabled
    ? Math.round(discoverableArtifacts * BASE.conditionRatio * (conditionEligibleWeight / 0.79))
    : 0;
  const personaRelevantArtifacts = personaHandoff?.enabled
    ? Math.round(discoverableArtifacts * BASE.personaRatio * (personaEligibleWeight / 0.75))
    : 0;

  const newArtifacts = Math.round(discoverableArtifacts * BASE.newRatio);
  const changedArtifacts = Math.round(discoverableArtifacts * BASE.changedRatio);
  const permissionChanges = Math.round(discoverableArtifacts * BASE.permissionChangeRatio);
  const potentialDuplicates = Math.round(
    discoverableArtifacts * BASE.duplicateRatio *
    (draft.duplicate.identityStrategies.filter((s) => s.enabled).length / 4),
  );

  const cyclesPerDay = cadenceCycles(draft.cadence);
  const projectedIngestionVolume = newArtifacts + changedArtifacts;

  const warnings: DiscoveryPreviewWarning[] = [
    { id: "W1", severity: "Warning", message: "2 sources lack a confirmed business owner", element: "panel-platforms", elementLabel: "Source Platform Configuration" },
    { id: "W2", severity: "Warning", message: "1 domain has an incomplete data residency policy", element: "panel-scope", elementLabel: "Enterprise Discovery Scope" },
    { id: "W3", severity: "Warning", message: "3 source scopes have stale approval metadata", element: "panel-platforms", elementLabel: "Source Platform Configuration" },
    { id: "W4", severity: "Warning", message: "2 optional processing handoff mappings are incomplete", element: "panel-handoffs", elementLabel: "Discovery Processing Handoffs" },
    { id: "W5", severity: "Warning", message: "Transcript content is restricted and will return metadata only", element: "panel-content-types", elementLabel: "Content Type Discovery Policy" },
    { id: "W6", severity: "Warning", message: "Semantic similarity duplicate detection is disabled, duplicate estimate is conservative", element: "panel-duplicates", elementLabel: "Artifact Identity & Duplicate Policy" },
  ];
  const blocking: DiscoveryPreviewWarning[] = [];

  if (!perm.preserveSourceAcl) {
    blocking.push({ id: "B1", severity: "Blocking", message: "Source ACL preservation is disabled. Discovery cannot proceed without preserving source access.", element: "panel-permissions", elementLabel: "Discovery Permission Policy" });
  }
  if (!draft.evidence.preserveOriginal || !draft.evidence.preserveExactPassage) {
    blocking.push({ id: "B2", severity: "Blocking", message: "Evidence preservation core requirements are disabled. Traceability cannot be guaranteed.", element: "panel-evidence", elementLabel: "Evidence Preservation" });
  }
  if (draft.traversal.maxDepth === 99) {
    warnings.push({ id: "W7", severity: "Warning", message: "Unlimited traversal materially increases projected volume within the approved source scope", element: "panel-traversal", elementLabel: "Discovery Traversal & Depth" });
  }
  if (!conditionHandoff?.enabled) {
    warnings.push({ id: "W8", severity: "Warning", message: "Business Condition Extraction eligibility is disabled. No condition candidates will be produced.", element: "panel-handoffs", elementLabel: "Discovery Processing Handoffs" });
  }
  const disabledPlatforms = seedPlatformConfigs.filter((p) => !draft.platforms[p.id]?.enabled);
  if (disabledPlatforms.length) {
    warnings.push({ id: "W9", severity: "Warning", message: `${disabledPlatforms.length} source platform(s) disabled: ${disabledPlatforms.map((p) => p.platform).join(", ")}`, element: "panel-platforms", elementLabel: "Source Platform Configuration" });
  }
  const excludedDomains = seedScopeEntries.filter((e) => e.scopeType === "Knowledge Domain" && draft.scope[e.id] === "excluded");
  if (excludedDomains.length) {
    warnings.push({ id: "W10", severity: "Warning", message: `${excludedDomains.length} knowledge domain(s) excluded from discovery scope`, element: "panel-scope", elementLabel: "Enterprise Discovery Scope" });
  }

  return {
    id: "PRV-001", configurationId: "DISC-CFG-001", configurationVersion: draft.version,
    sourcesEvaluated, includedSources, excludedSources, restrictedSources,
    discoverableArtifacts, newArtifacts, changedArtifacts, permissionChanges,
    potentialDuplicates, restrictedArtifacts, conditionEligibleArtifacts, personaRelevantArtifacts,
    projectedIngestionVolume,
    projectedFullReconciliationVolume: discoverableArtifacts,
    estimatedCyclesPerDay: cyclesPerDay,
    estimatedWorkloadPerCycle: Math.round(projectedIngestionVolume / Math.max(1, cyclesPerDay)),
    warnings, blockingIssues: blocking,
    createdAt: "Deterministic preview",
  };
}

export function cadenceCycles(c: DiscoveryCadencePolicy): number {
  if (c.mode === "Manual") return 1;
  if (c.mode === "Continuous Incremental") return 24;
  if (c.mode === "Event Driven") return 12;
  if (c.mode === "Scheduled Full") return 1;
  const match = /Every (\d+) hour/i.exec(c.incrementalSchedule);
  if (match) return Math.max(1, Math.round(24 / Number(match[1])));
  if (/daily/i.test(c.incrementalSchedule)) return 1;
  return 4;
}

export const cadenceScheduleOptions = [
  "Every 1 hour", "Every 2 hours", "Every 4 hours", "Every 6 hours", "Every 12 hours", "Daily",
];

/* ------------------------------------------------------- preview breakdown */

export type BreakdownDimension =
  | "Source Platform" | "Business Unit" | "Knowledge Domain" | "Content Type"
  | "Region" | "Access Classification" | "Processing Destination";

export const breakdownDimensions: BreakdownDimension[] = [
  "Source Platform", "Business Unit", "Knowledge Domain", "Content Type",
  "Region", "Access Classification", "Processing Destination",
];

export interface BreakdownRow {
  key: string; included: number; excluded: number; restricted: number;
  newCount: number; changed: number; volume: number; warnings: number;
}

export function computeBreakdown(draft: DraftState, preview: DiscoveryPreview, dim: BreakdownDimension): BreakdownRow[] {
  const total = preview.discoverableArtifacts;
  const mk = (key: string, share: number, state: ScopeState | "mixed", warnings = 0): BreakdownRow => {
    const volume = Math.round(total * share);
    return {
      key,
      included: state === "excluded" ? 0 : Math.round(volume * (state === "restricted" ? 0.6 : 1)),
      excluded: state === "excluded" ? volume : 0,
      restricted: state === "restricted" ? Math.round(volume * 0.4) : Math.round(volume * 0.11),
      newCount: Math.round(volume * BASE.newRatio),
      changed: Math.round(volume * BASE.changedRatio),
      volume,
      warnings,
    };
  };

  if (dim === "Source Platform") {
    const enabledTotal = seedPlatformConfigs.reduce((s, p) => (draft.platforms[p.id]?.enabled ? s + p.artifactShare : s), 0) || 1;
    return seedPlatformConfigs.map((p) => {
      const d = draft.platforms[p.id];
      const state: ScopeState = !d?.enabled ? "excluded" : d.restricted ? "restricted" : "included";
      return mk(p.platform, d?.enabled ? p.artifactShare / enabledTotal : p.artifactShare / enabledTotal, state, p.status === "Needs Owner" ? 1 : 0);
    });
  }
  if (dim === "Content Type") {
    const ctTotal = seedContentTypes.reduce((s, c) => s + c.weight, 0);
    return seedContentTypes.map((c) => {
      const row = draft.contentTypes[c.contentType];
      const state: ScopeState = row.discoveryState === "Exclude" ? "excluded" : row.discoveryState === "Restrict" ? "restricted" : "included";
      return mk(c.contentType, c.weight / ctTotal, state);
    });
  }
  if (dim === "Processing Destination") {
    const shares: Record<string, number> = {
      "Evidence Vault": 1, "Artifact Ingestion": 0.42, Normalization: 0.4,
      "Condition Extraction": 0.11, "Persona Relevance": 0.07, "Cognitive Memory": 0.04,
      "Semantic Index": 0.34, "Context Graph": 0.22,
    };
    return draft.handoffs.map((h) =>
      mk(h.destination, h.enabled ? shares[h.destination] ?? 0.1 : 0, h.enabled ? "included" : "excluded"),
    );
  }
  if (dim === "Access Classification") {
    return [
      mk("Internal", 0.58, "included"), mk("Confidential", 0.22, "included"),
      mk("Restricted", 0.16, "restricted"), mk("Highly Restricted", 0.04, "restricted", 1),
    ];
  }
  const dimension: ScopeDimension =
    dim === "Business Unit" ? "Business Unit" : dim === "Knowledge Domain" ? "Knowledge Domain" : "Region";
  const entries = seedScopeEntries.filter((e) => e.scopeType === dimension);
  const totalW = entries.reduce((s, e) => s + e.weight, 0) || 1;
  return entries.map((e) => mk(e.scopeName, e.weight / totalW, draft.scope[e.id] ?? "included",
    e.accessClassification === "Restricted" ? 1 : 0));
}

/* ------------------------------------------------------------- dry run */

export const dryRunSteps = [
  "Load Configuration",
  "Evaluate Enterprise Scope",
  "Evaluate Sources",
  "Apply Rules",
  "Apply Permission Policy",
  "Apply Authority Preferences",
  "Apply Freshness",
  "Apply Change Detection",
  "Estimate Discovery",
  "Estimate Processing Handoffs",
  "Generate Preview",
];

export interface DryRunResult {
  matchedSources: number;
  excludedSources: number;
  restrictedSources: number;
  estimatedArtifacts: number;
  ruleConflicts: { id: string; message: string }[];
  ownershipGaps: string[];
  residencyGaps: string[];
  permissionWarnings: string[];
  processingWarnings: string[];
  completedAt: string;
  mutatedDownstream: false;
}

export function runDryRun(draft: DraftState, preview: DiscoveryPreview): DryRunResult {
  const enabledRules = draft.rules.filter((r) => r.enabled);
  const conflicts: { id: string; message: string }[] = [];
  enabledRules.forEach((r) => {
    enabledRules.forEach((o) => {
      if (r.id >= o.id) return;
      if (r.sourcePlatform === o.sourcePlatform && r.contentType === o.contentType &&
        ((r.ruleType === "Include" && o.ruleType === "Exclude") || (r.ruleType === "Exclude" && o.ruleType === "Include"))) {
        conflicts.push({ id: `${r.id}/${o.id}`, message: `${r.id} (${r.ruleType}) and ${o.id} (${o.ruleType}) overlap on ${r.sourcePlatform} / ${r.contentType}. Higher priority wins.` });
      }
    });
  });

  return {
    matchedSources: preview.includedSources,
    excludedSources: preview.excludedSources,
    restrictedSources: preview.restrictedSources,
    estimatedArtifacts: preview.discoverableArtifacts,
    ruleConflicts: conflicts,
    ownershipGaps: ["Internal Wikis — 2 spaces without confirmed business owner"],
    residencyGaps: draft.permission.preserveResidency ? ["Finance Operations — residency policy incomplete for Asia Pacific"] : ["Data residency preservation disabled — all domains flagged"],
    permissionWarnings: draft.permission.preserveSourceAcl
      ? ["284K artifacts will return metadata only under governed access"]
      : ["Source ACL preservation disabled — discovery blocked"],
    processingWarnings: draft.handoffs.filter((h) => !h.enabled).map((h) => `${h.destination} handoff disabled`),
    completedAt: "Deterministic dry run — no downstream state changed",
    mutatedDownstream: false,
  };
}

/* ------------------------------------------------------------- utilities */

export const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
};

export const kpiTrends = {
  configurations: [10, 10, 11, 11, 12, 12, 12],
  sources: [148, 154, 161, 166, 172, 179, 184],
  domains: [16, 17, 18, 19, 20, 21, 22],
  rules: [112, 118, 124, 131, 138, 144, 148],
  volume: [1.9, 2.0, 2.05, 2.15, 2.24, 2.32, 2.4],
  quality: [92, 93, 93, 94, 95, 95, 96],
};

export const savedViews = [
  "Enterprise default",
  "Restricted domains only",
  "Draft configurations",
  "Owner review queue",
];
