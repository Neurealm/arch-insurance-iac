/**
 * Team Persona Construction — deterministic seeded data model.
 *
 * All values here are synthetic demonstration data. No real employee,
 * customer, credential, or regulated data is represented. The shapes are
 * designed so a service layer can later replace the seeds without any
 * redesign of the presentation components.
 */

/* ------------------------------- primitives ------------------------------- */

export type ViewMode = "portfolio" | "construction" | "workbench" | "architecture";

export type ServiceState =
  | "Operational"
  | "Constructing"
  | "Review Required"
  | "Degraded"
  | "Paused"
  | "Maintenance";

export type StageStatus = "Running" | "Warning" | "Blocked" | "Review Required" | "Paused" | "Complete";

export type MappingState = "Included" | "Suggested" | "Excluded" | "Conflict" | "Review Required";

export type FreshnessStatus = "Current" | "Aging" | "Stale";

export type PersonaSectionType =
  | "Identity" | "Mission" | "Business Capabilities" | "Products and Services" | "Customers"
  | "Stakeholders" | "Objectives" | "Key Results" | "Service Level Objectives"
  | "Key Performance Indicators" | "Baselines" | "Targets" | "Thresholds" | "Constraints"
  | "Policies" | "Cost Guardrails" | "Compliance Obligations" | "Operational Windows"
  | "Change Restrictions" | "Approval Requirements" | "Dependencies" | "Risks" | "Failure Modes"
  | "Controls" | "Assumptions" | "Decision Rules" | "Decision Priorities" | "Common Tradeoffs"
  | "Preferred Evidence" | "Escalation Philosophy" | "Risk Appetite" | "Upstream Relationships"
  | "Downstream Relationships" | "External Customers" | "Shared Services" | "APIs and Integrations"
  | "Data Products" | "Executive Stakeholders" | "Evidence" | "Confidence" | "Approval"
  | "Freshness" | "Version";

export const PERSONA_SECTION_TYPES: PersonaSectionType[] = [
  "Identity", "Mission", "Business Capabilities", "Products and Services", "Customers",
  "Stakeholders", "Objectives", "Key Results", "Service Level Objectives",
  "Key Performance Indicators", "Baselines", "Targets", "Thresholds", "Constraints",
  "Policies", "Cost Guardrails", "Compliance Obligations", "Operational Windows",
  "Change Restrictions", "Approval Requirements", "Dependencies", "Risks", "Failure Modes",
  "Controls", "Assumptions", "Decision Rules", "Decision Priorities", "Common Tradeoffs",
  "Preferred Evidence", "Escalation Philosophy", "Risk Appetite", "Upstream Relationships",
  "Downstream Relationships", "External Customers", "Shared Services", "APIs and Integrations",
  "Data Products", "Executive Stakeholders", "Evidence", "Confidence", "Approval",
  "Freshness", "Version",
];

/* --------------------------------- models --------------------------------- */

export interface TeamPersona {
  id: string;
  teamId: string;
  teamName: string;
  businessUnit: string;
  description: string;
  mission: string;
  businessCapabilities: string[];
  productIds: string[];
  serviceIds: string[];
  systemIds: string[];
  dataProductIds: string[];
  apiIds: string[];
  internalCustomerIds: string[];
  externalCustomers: string[];
  stakeholderIds: string[];
  executiveStakeholderIds: string[];
  objectiveIds: string[];
  keyResultIds: string[];
  serviceLevelConditionIds: string[];
  kpiConditionIds: string[];
  baselineConditionIds: string[];
  targetConditionIds: string[];
  thresholdConditionIds: string[];
  constraintConditionIds: string[];
  policyConditionIds: string[];
  costGuardrailConditionIds: string[];
  complianceConditionIds: string[];
  operationalWindowConditionIds: string[];
  changeRestrictionConditionIds: string[];
  approvalRequirementConditionIds: string[];
  dependencyIds: string[];
  riskIds: string[];
  controlIds: string[];
  assumptionIds: string[];
  decisionRuleIds: string[];
  decisionPriorities: string[];
  successCriteria: string[];
  failureModes: string[];
  commonTradeoffs: string[];
  preferredEvidence: string[];
  escalationPhilosophy: string[];
  riskAppetite: string[];
  upstreamTeamIds: string[];
  downstreamTeamIds: string[];
  evidenceReferenceIds: string[];
  conditionIds: string[];
  qualityScore: number;
  completenessScore: number;
  confidence: number;
  freshnessStatus: FreshnessStatus;
  constructionStatus: "In Construction" | "Approved" | "Draft" | "Warning";
  approvalState: "Approved" | "Team Review Required" | "Owner Review" | "Conflict Review" | "Not Submitted";
  personaOwner: string;
  teamOwner: string;
  technicalOwner: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  /** display-only rollups */
  knowledgeDomains: string[];
  conditionCount: number;
  dependencyCount: number;
  capabilities: string[];
  services: string[];
  customers: string[];
  upstream: string[];
  downstream: string[];
  systems: string[];
  graphCoverage: number;
  constructionStage: string;
  evidenceCoverage: number;
  ownershipStatus: "Resolved" | "Unresolved" | "Partial";
  dependencyStatus: "Resolved" | "Conflicts" | "Pending";
  reviewStatus: "Pending" | "Complete" | "Not Started";
  warnings: number;
  riskLevel: "Low" | "Moderate" | "High";
  region: string;
  environment: string;
  product: string;
  capabilityArea: string;
  customerJourney: string;
  dataResidency: string;
  sourceAuthority: "Primary" | "Supporting" | "Derived";
  selectedConditions: number;
  includedConditions: number;
  excludedConditions: number;
  conflicts: number;
  evidenceGaps: number;
  reviewer: string;
}

export interface PersonaSection {
  id: string;
  personaId: string;
  sectionType: PersonaSectionType;
  title: string;
  summary: string;
  conditionIds: string[];
  evidenceReferenceIds: string[];
  owner: string;
  completeness: number;
  confidence: number;
  freshness: FreshnessStatus;
  reviewStatus: "Pending" | "Approved" | "Not Started";
  warningCount: number;
  values: string[];
}

export interface BusinessCondition {
  id: string;
  statement: string;
  conditionType: string;
  group: string;
  owner: string;
  authority: "Primary" | "Supporting" | "Derived";
  confidence: number;
  freshness: FreshnessStatus;
  evidenceCount: number;
  applicability: string;
  mappingState: MappingState;
  section: PersonaSectionType;
  sourceArtifact: string;
  evidencePassage: string;
  teamId: string;
}

export interface PersonaConditionMapping {
  id: string;
  personaId: string;
  sectionId: string;
  conditionId: string;
  mappingType: "Automatic" | "Suggested" | "Manual";
  applicability: string;
  confidence: number;
  mappingStatus: MappingState;
  included: boolean;
  exclusionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaRelationship {
  id: string;
  personaId: string;
  sourceType: "Team" | "Service" | "System" | "Customer" | "KPI" | "Governance";
  sourceId: string;
  relationshipType: "OWNS" | "DEPENDS ON" | "PROVIDES TO" | "CONSUMED BY" | "MEASURED BY" | "APPROVED BY" | "SUPPORTS" | "ESCALATES TO";
  targetType: "Team" | "Service" | "System" | "Customer" | "KPI" | "Governance";
  targetId: string;
  targetName: string;
  direction: "Upstream" | "Downstream" | "Bidirectional";
  criticality: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  evidenceReferenceIds: string[];
  status: "Resolved" | "Conflict" | "Pending";
}

export interface PersonaRisk {
  id: string;
  personaId: string;
  riskName: string;
  description: string;
  likelihood: "High" | "Medium" | "Low";
  impact: "Critical" | "High" | "Medium" | "Low";
  controlIds: string[];
  control: string;
  owner: string;
  evidenceReferenceIds: string[];
  status: "Controlled" | "Monitoring" | "Open";
  affectedTeam: string;
  affectedService: string;
}

export interface PersonaQuality {
  personaId: string;
  overallScore: number;
  dimensions: QualityDimension[];
  topIssues: string[];
  recommendedActions: string[];
}

export interface QualityDimension {
  name: string;
  score: number;
  target: number;
  trend: number[];
  affectedPersonas: number;
}

export interface PersonaConstructionJob {
  id: string;
  teamIds: string[];
  teamName: string;
  status: "Running" | "Warning" | "Blocked" | "Paused" | "Complete";
  currentStageId: string;
  currentStage: string;
  conditionCount: number;
  includedConditionCount: number;
  excludedConditionCount: number;
  reviewConditionCount: number;
  relationshipCount: number;
  qualityScore: number;
  completeness: number;
  confidence: number;
  warningCount: number;
  startedAt: string;
  elapsedTime: string;
  estimatedCompletion: string;
  owner: string;
  configurationVersion: string;
  personaId: string;
}

export interface PersonaConstructionStage {
  id: string;
  name: string;
  sequence: number;
  status: StageStatus;
  unit: string;
  processedCount: number;
  pendingCount: number;
  failedCount: number;
  warningCount: number;
  successRate: number;
  averageDuration: string;
  p95Duration: string;
  throughput: string;
  slaStatus: "Within SLA" | "At risk" | "Breached";
  owner: string;
  definition: string;
  upstream: string;
  downstream: string;
}

export interface PersonaGap {
  id: string;
  personaId: string;
  personaName: string;
  sectionId: string;
  gapType: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  affectedSection: string;
  qualityImpact: number;
  owner: string;
  status: "Open" | "Assigned" | "Deferred to Prompt 2";
  recommendedAction: string;
  createdAt: string;
  dueAt: string;
  age: string;
}

/* -------------------------------- filters --------------------------------- */

export interface Filters {
  businessUnit: string;
  team: string;
  knowledgeDomain: string;
  businessCapability: string;
  product: string;
  service: string;
  personaStatus: string;
  constructionStatus: string;
  approvalStatus: string;
  qualityBand: string;
  completenessBand: string;
  confidenceBand: string;
  freshness: string;
  conditionType: string;
  sourceAuthority: string;
  personaOwner: string;
  technicalOwner: string;
  riskLevel: string;
  dependencyStatus: string;
  customerJourney: string;
  environment: string;
  region: string;
  dataResidency: string;
}

export const defaultFilters: Filters = {
  businessUnit: "All", team: "All", knowledgeDomain: "All", businessCapability: "All",
  product: "All", service: "All", personaStatus: "All", constructionStatus: "All",
  approvalStatus: "All", qualityBand: "All", completenessBand: "All", confidenceBand: "All",
  freshness: "All", conditionType: "All", sourceAuthority: "All", personaOwner: "All",
  technicalOwner: "All", riskLevel: "All", dependencyStatus: "All", customerJourney: "All",
  environment: "All", region: "All", dataResidency: "All",
};

export const filterLabels: Record<keyof Filters, string> = {
  businessUnit: "Business Unit", team: "Team", knowledgeDomain: "Knowledge Domain",
  businessCapability: "Business Capability", product: "Product", service: "Service",
  personaStatus: "Persona Status", constructionStatus: "Construction Status",
  approvalStatus: "Approval Status", qualityBand: "Quality Band",
  completenessBand: "Completeness Band", confidenceBand: "Confidence Band",
  freshness: "Freshness", conditionType: "Condition Type", sourceAuthority: "Source Authority",
  personaOwner: "Persona Owner", technicalOwner: "Technical Owner", riskLevel: "Risk Level",
  dependencyStatus: "Dependency Status", customerJourney: "Customer Journey",
  environment: "Environment", region: "Region", dataResidency: "Data Residency",
};

export const filterOptions: Record<keyof Filters, string[]> = {
  businessUnit: ["All", "Commerce Engineering", "Risk Technology", "Security Engineering", "Platform Operations", "Customer Experience", "Engineering Operations"],
  team: ["All", "Payments Platform", "Checkout Engineering", "Fraud Engineering", "Identity Engineering", "Site Reliability Engineering", "Customer Support Operations", "Release Governance"],
  knowledgeDomain: ["All", "Payments", "Checkout", "Fraud & Risk", "Identity", "Reliability", "Customer Service", "Governance"],
  businessCapability: ["All", "Payment authorization", "Checkout orchestration", "Fraud decisioning", "Identity validation", "Observability", "Issue resolution", "Change control"],
  product: ["All", "Payments API", "Checkout Experience", "Fraud Decision Service", "Identity Services", "Observability Platform", "Support Console", "Release Console"],
  service: ["All", "Payments API", "Retry Orchestrator", "Tokenization Adapter", "Settlement Event Publisher", "Checkout Orchestrator", "Identity Services", "Fraud Decision Service", "Regional Token Vault", "Observability Platform"],
  personaStatus: ["All", "In Construction", "Approved", "Draft", "Warning"],
  constructionStatus: ["All", "Select Team", "Gather Approved Conditions", "Resolve Ownership and Scope", "Map Mission and Capabilities", "Model Services and Customers", "Map Dependencies and Risks", "Compile Decision Logic", "Validate Evidence and Completeness", "Team Review", "Publish Team Persona"],
  approvalStatus: ["All", "Approved", "Team Review Required", "Owner Review", "Conflict Review", "Not Submitted"],
  qualityBand: ["All", "95 and above", "90 to 94", "85 to 89", "Below 85"],
  completenessBand: ["All", "95 and above", "90 to 94", "80 to 89", "Below 80"],
  confidenceBand: ["All", "95 and above", "90 to 94", "85 to 89", "Below 85"],
  freshness: ["All", "Current", "Aging", "Stale"],
  conditionType: ["All", "Objective", "Requirement", "Constraint", "Service Level", "Metric", "Dependency", "Risk", "Decision Rule", "Control", "Approval Requirement", "Policy", "Baseline", "Target", "Threshold", "Operational Window", "Escalation Trigger"],
  sourceAuthority: ["All", "Primary", "Supporting", "Derived"],
  personaOwner: ["All", "Jane Smith", "Marcus Lee", "Priya Patel", "Security Architecture", "Reliability Operations", "Customer Support Leadership", "Engineering Governance"],
  technicalOwner: ["All", "Payments Architecture", "Checkout Architecture", "Risk Architecture", "Security Architecture", "Reliability Architecture", "Support Systems", "Governance Systems"],
  riskLevel: ["All", "Low", "Moderate", "High"],
  dependencyStatus: ["All", "Resolved", "Conflicts", "Pending"],
  customerJourney: ["All", "Checkout", "Account Access", "Issue Resolution", "Settlement", "Change Delivery"],
  environment: ["All", "Production", "Staging", "Multi-region"],
  region: ["All", "North America", "Europe", "Asia Pacific", "Global"],
  dataResidency: ["All", "US", "EU", "APAC", "Multi-region"],
};

export const activeFilterCount = (f: Filters) =>
  (Object.keys(f) as (keyof Filters)[]).filter((k) => f[k] !== "All").length;

/* ------------------------------ sidebar status ---------------------------- */

export const sidebarStatus = {
  service: "Persona Service",
  state: "Operational" as ServiceState,
  teamsOnboarded: 48,
  activePersonas: 72,
  personasInConstruction: 12,
};

/* --------------------------------- KPIs ----------------------------------- */

export interface Kpi {
  id: string;
  name: string;
  value: string;
  change?: string;
  context: string;
  supporting: { label: string; value: string }[];
  status: "Healthy" | "Attention" | "Warning";
  trend: number[];
  tooltip: string;
  target?: string;
}

export const kpis: Kpi[] = [
  {
    id: "kpi-teams",
    name: "Teams Onboarded",
    value: "48",
    change: "+4 this quarter",
    context: "87% of priority teams",
    supporting: [{ label: "Priority coverage", value: "87%" }, { label: "Pending onboarding", value: "7" }],
    status: "Healthy",
    trend: [38, 40, 41, 43, 44, 46, 47, 48],
    tooltip: "Teams with an initiated Team Persona record. Filters the Persona inventory by onboarding status.",
  },
  {
    id: "kpi-active",
    name: "Active Team Personas",
    value: "72",
    context: "Personas available to downstream consumers",
    supporting: [{ label: "Approved", value: "61" }, { label: "Review Required", value: "7" }, { label: "Draft", value: "4" }],
    status: "Healthy",
    trend: [58, 61, 64, 66, 68, 70, 71, 72],
    tooltip: "Team Personas in an active lifecycle state. Opens the inventory filtered to active records.",
  },
  {
    id: "kpi-construction",
    name: "Personas in Construction",
    value: "12",
    context: "Construction jobs currently executing",
    supporting: [{ label: "Healthy", value: "8" }, { label: "Warning", value: "3" }, { label: "Blocked", value: "1" }],
    status: "Attention",
    trend: [9, 10, 12, 11, 13, 12, 12, 12],
    tooltip: "Active construction jobs across the lifecycle. Filters Active Persona Construction Jobs.",
  },
  {
    id: "kpi-conditions",
    name: "Conditions Mapped",
    value: "82,906",
    context: "Approved conditions associated with Team Personas",
    supporting: [{ label: "Mapped", value: "76,284" }, { label: "Unmapped", value: "6,622" }],
    status: "Healthy",
    trend: [71200, 73400, 75100, 77800, 79400, 80900, 82100, 82906],
    tooltip: "Approved business conditions evaluated for Persona association. Focuses Condition Mapping Coverage.",
  },
  {
    id: "kpi-quality",
    name: "Persona Quality",
    value: "92 / 100",
    target: "Target 95",
    context: "Composite of twelve quality dimensions",
    supporting: [{ label: "Target", value: "95" }, { label: "Variance", value: "-3" }],
    status: "Healthy",
    trend: [86, 87, 88, 89, 90, 91, 92, 92],
    tooltip: "Weighted Persona quality index. Focuses Persona Quality and Completeness.",
  },
  {
    id: "kpi-attention",
    name: "Personas Requiring Attention",
    value: "14",
    context: "Blocking or degrading construction issues",
    supporting: [
      { label: "Evidence Gaps", value: "5" }, { label: "Dependency Conflicts", value: "4" },
      { label: "Missing Owners", value: "3" }, { label: "Stale Personas", value: "2" },
    ],
    status: "Attention",
    trend: [21, 19, 18, 17, 16, 15, 14, 14],
    tooltip: "Personas with at least one unresolved construction gap. Focuses Persona Construction Gaps.",
  },
];

/* ------------------------------- lifecycle -------------------------------- */

export const lifecycleStages: PersonaConstructionStage[] = [
  {
    id: "select-team", name: "Select Team", sequence: 1, status: "Running", unit: "Teams",
    processedCount: 48, pendingCount: 4, failedCount: 0, warningCount: 0, successRate: 99,
    averageDuration: "12s", p95Duration: "21s", throughput: "18 teams/hr", slaStatus: "Within SLA",
    owner: "Persona Platform",
    definition: "Resolve the team of record, its identifiers, and its organizational placement.",
    upstream: "Business Condition Extraction", downstream: "Gather Approved Conditions",
  },
  {
    id: "gather-conditions", name: "Gather Approved Conditions", sequence: 2, status: "Running", unit: "Conditions",
    processedCount: 82906, pendingCount: 2184, failedCount: 0, warningCount: 2, successRate: 98,
    averageDuration: "38s", p95Duration: "1.2m", throughput: "4.2K conditions/hr", slaStatus: "Within SLA",
    owner: "Conditions Registry",
    definition: "Collect approved business conditions whose applicability includes the selected team.",
    upstream: "Select Team", downstream: "Resolve Ownership and Scope",
  },
  {
    id: "resolve-ownership", name: "Resolve Ownership and Scope", sequence: 3, status: "Warning", unit: "Teams",
    processedCount: 44, pendingCount: 4, failedCount: 1, warningCount: 5, successRate: 93,
    averageDuration: "1.3m", p95Duration: "3.1m", throughput: "11 teams/hr", slaStatus: "At risk",
    owner: "Organizational Model",
    definition: "Determine Persona owner, team owner, technical owner, and explicit scope boundaries.",
    upstream: "Gather Approved Conditions", downstream: "Map Mission and Capabilities",
  },
  {
    id: "map-mission", name: "Map Mission and Capabilities", sequence: 4, status: "Running", unit: "Teams",
    processedCount: 42, pendingCount: 6, failedCount: 0, warningCount: 2, successRate: 96,
    averageDuration: "54s", p95Duration: "1.7m", throughput: "14 teams/hr", slaStatus: "Within SLA",
    owner: "Persona Modeling",
    definition: "Compile the team mission statement and owned business capabilities from approved conditions.",
    upstream: "Resolve Ownership and Scope", downstream: "Model Services and Customers",
  },
  {
    id: "model-services", name: "Model Services and Customers", sequence: 5, status: "Running", unit: "Teams",
    processedCount: 41, pendingCount: 7, failedCount: 0, warningCount: 3, successRate: 95,
    averageDuration: "1.1m", p95Duration: "2.4m", throughput: "12 teams/hr", slaStatus: "Within SLA",
    owner: "Service Catalog",
    definition: "Attach owned products, services, APIs, data products, and their consuming customers.",
    upstream: "Map Mission and Capabilities", downstream: "Map Dependencies and Risks",
  },
  {
    id: "map-dependencies", name: "Map Dependencies and Risks", sequence: 6, status: "Warning", unit: "Relationships",
    processedCount: 52632, pendingCount: 1842, failedCount: 2, warningCount: 7, successRate: 91,
    averageDuration: "1.8m", p95Duration: "4.6m", throughput: "2.8K relationships/hr", slaStatus: "At risk",
    owner: "Context Graph",
    definition: "Model upstream and downstream relationships, criticality, risks, and mapped controls.",
    upstream: "Model Services and Customers", downstream: "Compile Decision Logic",
  },
  {
    id: "compile-decisions", name: "Compile Decision Logic", sequence: 7, status: "Running", unit: "Decision rules",
    processedCount: 12842, pendingCount: 682, failedCount: 0, warningCount: 3, successRate: 94,
    averageDuration: "1.4m", p95Duration: "3.2m", throughput: "1.1K rules/hr", slaStatus: "Within SLA",
    owner: "Decision Intelligence",
    definition: "Assemble decision priorities, decision rules, tradeoffs, risk appetite, and escalation philosophy.",
    upstream: "Map Dependencies and Risks", downstream: "Validate Evidence and Completeness",
  },
  {
    id: "validate-evidence", name: "Validate Evidence and Completeness", sequence: 8, status: "Warning", unit: "Personas",
    processedCount: 38, pendingCount: 10, failedCount: 1, warningCount: 8, successRate: 92,
    averageDuration: "2.3m", p95Duration: "5.4m", throughput: "9 personas/hr", slaStatus: "At risk",
    owner: "Evidence Governance",
    definition: "Verify every Persona assertion traces to evidence with acceptable authority and freshness.",
    upstream: "Compile Decision Logic", downstream: "Team Review",
  },
  {
    id: "team-review", name: "Team Review", sequence: 9, status: "Review Required", unit: "Personas",
    processedCount: 61, pendingCount: 7, failedCount: 0, warningCount: 4, successRate: 97,
    averageDuration: "18m", p95Duration: "1.4h", throughput: "4 reviews/hr", slaStatus: "At risk",
    owner: "Team Owners",
    definition: "The owning team confirms the Persona reflects how it actually operates and decides.",
    upstream: "Validate Evidence and Completeness", downstream: "Publish Team Persona",
  },
  {
    id: "publish", name: "Publish Team Persona", sequence: 10, status: "Running", unit: "Personas",
    processedCount: 61, pendingCount: 7, failedCount: 0, warningCount: 1, successRate: 99,
    averageDuration: "14s", p95Duration: "26s", throughput: "22 personas/hr", slaStatus: "Within SLA",
    owner: "Persona Platform",
    definition: "Version and publish the approved Persona to downstream cognitive consumers.",
    upstream: "Team Review", downstream: "Cognitive Intake, Impact Analysis, Cognitive Memory",
  },
];

export const lifecycleCallouts: { tone: "amber" | "green"; text: string }[] = [
  { tone: "amber", text: "Dependency mapping backlog elevated" },
  { tone: "amber", text: "Persona evidence gaps detected for four teams" },
  { tone: "amber", text: "Three Personas have unresolved ownership" },
  { tone: "green", text: "Publishing service stable" },
];

/* --------------------------- selected stage detail ------------------------ */

export interface StageDependencyRow {
  source: string; relationship: string; target: string; direction: string;
  criticality: string; confidence: number; evidenceCount: number; status: string;
}

export const stageDependencies: Record<string, StageDependencyRow[]> = {
  "map-dependencies": [
    { source: "Payments Platform", relationship: "DEPENDS ON", target: "Identity Services", direction: "Upstream", criticality: "Critical", confidence: 96, evidenceCount: 14, status: "Resolved" },
    { source: "Payments Platform", relationship: "DEPENDS ON", target: "Fraud Decision Service", direction: "Upstream", criticality: "Critical", confidence: 94, evidenceCount: 11, status: "Resolved" },
    { source: "Payments Platform", relationship: "DEPENDS ON", target: "Regional Token Vault", direction: "Upstream", criticality: "Critical", confidence: 91, evidenceCount: 9, status: "Conflict" },
    { source: "Payments Platform", relationship: "PROVIDES TO", target: "Checkout Engineering", direction: "Downstream", criticality: "Critical", confidence: 97, evidenceCount: 18, status: "Resolved" },
    { source: "Payments Platform", relationship: "CONSUMED BY", target: "Finance Operations", direction: "Downstream", criticality: "High", confidence: 89, evidenceCount: 7, status: "Resolved" },
    { source: "Payments Platform", relationship: "MEASURED BY", target: "Payment Availability KPI", direction: "Bidirectional", criticality: "High", confidence: 93, evidenceCount: 6, status: "Resolved" },
    { source: "Payments Platform", relationship: "APPROVED BY", target: "Release Governance", direction: "Upstream", criticality: "Medium", confidence: 88, evidenceCount: 5, status: "Pending" },
    { source: "Payments Platform", relationship: "ESCALATES TO", target: "Site Reliability Engineering", direction: "Bidirectional", criticality: "High", confidence: 92, evidenceCount: 8, status: "Resolved" },
  ],
};

export const stageRisks: PersonaRisk[] = [
  { id: "RISK-4101", personaId: "PERSONA-1001", riskName: "Identity service latency", description: "Elevated identity validation latency delays authorization and blocks checkout completion.", likelihood: "Medium", impact: "High", controlIds: ["CTL-21"], control: "Traffic segmentation", owner: "Payments Reliability", evidenceReferenceIds: ["EV-8801"], status: "Monitoring", affectedTeam: "Payments Platform", affectedService: "Payments API" },
  { id: "RISK-4102", personaId: "PERSONA-1001", riskName: "Fraud decision timeout", description: "Fraud decisioning timeouts cause customer abandonment during peak checkout windows.", likelihood: "Medium", impact: "High", controlIds: ["CTL-22"], control: "Progressive rollout", owner: "Fraud Engineering", evidenceReferenceIds: ["EV-8804"], status: "Monitoring", affectedTeam: "Fraud Engineering", affectedService: "Fraud Decision Service" },
  { id: "RISK-4103", personaId: "PERSONA-1001", riskName: "Regional token vault failure", description: "Regional vault unavailability prevents tokenization and causes transaction loss.", likelihood: "Low", impact: "Critical", controlIds: ["CTL-23"], control: "Token handling policy", owner: "Security Engineering", evidenceReferenceIds: ["EV-8807"], status: "Open", affectedTeam: "Identity Engineering", affectedService: "Regional Token Vault" },
  { id: "RISK-4104", personaId: "PERSONA-1001", riskName: "Retry amplification", description: "Aggressive retry policy amplifies load and risks duplicate payment processing.", likelihood: "Medium", impact: "Critical", controlIds: ["CTL-24"], control: "Idempotency validation", owner: "Payments Platform", evidenceReferenceIds: ["EV-8809"], status: "Controlled", affectedTeam: "Payments Platform", affectedService: "Retry Orchestrator" },
  { id: "RISK-4105", personaId: "PERSONA-1001", riskName: "Duplicate payment processing", description: "Failover replay without idempotency keys can double-charge a customer.", likelihood: "Low", impact: "Critical", controlIds: ["CTL-25"], control: "Automated rollback", owner: "Payments Platform", evidenceReferenceIds: ["EV-8811"], status: "Controlled", affectedTeam: "Payments Platform", affectedService: "Payments API" },
];

export interface StageConflictRow {
  a: string; b: string; conflictType: string; evidence: string; authority: string;
  affectedTeams: string; recommendedAction: string; reviewStatus: string;
}

export const stageConflicts: StageConflictRow[] = [
  { a: "Payments Platform DEPENDS ON Regional Token Vault", b: "Payments Platform OWNS Regional Token Vault", conflictType: "Ownership contradiction", evidence: "ARCH-2291 vs SEC-1140", authority: "Primary vs Supporting", affectedTeams: "Payments Platform, Identity Engineering", recommendedAction: "Confirm vault ownership with Security Engineering", reviewStatus: "Pending" },
  { a: "Identity Engineering PROVIDES TO Payments Platform", b: "Identity Engineering CONSUMED BY Payments Platform", conflictType: "Direction conflict", evidence: "SVC-4410 vs SVC-4433", authority: "Primary vs Primary", affectedTeams: "Identity Engineering", recommendedAction: "Split into distinct service relationships", reviewStatus: "Pending" },
  { a: "Retry policy approval required by Fraud Engineering", b: "Retry policy owned solely by Payments Platform", conflictType: "Approval scope conflict", evidence: "POL-3320 vs RUN-7712", authority: "Primary vs Derived", affectedTeams: "Payments Platform, Fraud Engineering", recommendedAction: "Adopt joint approval condition", reviewStatus: "Open" },
  { a: "Checkout Engineering ESCALATES TO Payments Platform", b: "Payments Platform ESCALATES TO Checkout Engineering", conflictType: "Escalation loop", evidence: "ESC-9001 vs ESC-9014", authority: "Supporting vs Supporting", affectedTeams: "Payments Platform, Checkout Engineering", recommendedAction: "Define directional escalation ladder", reviewStatus: "Pending" },
];

export interface StageEvidenceRow {
  conditionId: string; condition: string; sourceArtifact: string; passage: string;
  authority: string; confidence: number; freshness: FreshnessStatus;
}

export const stageEvidence: StageEvidenceRow[] = [
  { conditionId: "COND-100421", condition: "Payments API monthly availability shall be at least 99.95 percent", sourceArtifact: "Payments API Reliability Requirements v4.2", passage: "The Payments API shall sustain a monthly availability of no less than 99.95% measured at the regional edge.", authority: "Primary", confidence: 97, freshness: "Current" },
  { conditionId: "COND-100438", condition: "Payments API depends on Identity Services, Fraud Decision Service, and Regional Token Vault", sourceArtifact: "Payments Platform Architecture Record 2291", passage: "Authorization requires a successful identity assertion, a fraud decision, and a vault token exchange.", authority: "Primary", confidence: 95, freshness: "Current" },
  { conditionId: "COND-100455", condition: "Retry policy changes affecting more than 10 percent of checkout traffic require joint approval", sourceArtifact: "Payments Change Policy 3320", passage: "Retry behaviour changes exceeding 10% of checkout traffic require approval from Payments Reliability and Fraud Engineering.", authority: "Primary", confidence: 93, freshness: "Current" },
  { conditionId: "COND-100467", condition: "Restricted token data must never be persisted outside approved vault services", sourceArtifact: "Token Handling Standard 1140", passage: "Restricted token material must not be written to any store outside an approved vault service boundary.", authority: "Primary", confidence: 98, freshness: "Current" },
  { conditionId: "COND-100482", condition: "Payments API changes may not be deployed during the final three business days of a financial quarter", sourceArtifact: "Enterprise Change Calendar FY26", passage: "A change freeze applies to revenue-path services during the final three business days of each financial quarter.", authority: "Supporting", confidence: 90, freshness: "Aging" },
];

export const stageOutputs = [
  { label: "Persona dependency records", value: "18 created, 3 updated" },
  { label: "Risk records", value: "5 created" },
  { label: "Control mappings", value: "5 mapped, 1 missing" },
  { label: "Escalation paths", value: "3 resolved, 1 loop detected" },
  { label: "Context Graph relationships", value: "24 written" },
  { label: "Review tasks", value: "4 created" },
];

export const stageConfiguration = [
  { label: "Configuration version", value: "pcs-2026.08.3" },
  { label: "Minimum relationship confidence", value: "0.85" },
  { label: "Auto mapping threshold", value: "0.92" },
  { label: "Human review threshold", value: "0.80" },
  { label: "Freshness threshold", value: "180 days" },
  { label: "Conflict policy", value: "Escalate to owning team" },
];

export const stageQueue = [
  { id: "Q-8801", team: "Identity Engineering", item: "Regional Token Vault ownership", waiting: "42m", priority: "High" },
  { id: "Q-8802", team: "Payments Platform", item: "Escalation ladder direction", waiting: "31m", priority: "Medium" },
  { id: "Q-8803", team: "Fraud Engineering", item: "Joint approval scope", waiting: "26m", priority: "High" },
  { id: "Q-8804", team: "Customer Support Operations", item: "Downstream consumer discovery", waiting: "18m", priority: "Medium" },
  { id: "Q-8805", team: "Release Governance", item: "Change window applicability", waiting: "11m", priority: "Low" },
];

/* ------------------------------- personas --------------------------------- */

const base = {
  productIds: [], serviceIds: [], systemIds: [], dataProductIds: [], apiIds: [],
  internalCustomerIds: [], stakeholderIds: [], executiveStakeholderIds: [], objectiveIds: [],
  keyResultIds: [], serviceLevelConditionIds: [], kpiConditionIds: [], baselineConditionIds: [],
  targetConditionIds: [], thresholdConditionIds: [], constraintConditionIds: [],
  policyConditionIds: [], costGuardrailConditionIds: [], complianceConditionIds: [],
  operationalWindowConditionIds: [], changeRestrictionConditionIds: [],
  approvalRequirementConditionIds: [], dependencyIds: [], riskIds: [], controlIds: [],
  assumptionIds: [], decisionRuleIds: [], upstreamTeamIds: [], downstreamTeamIds: [],
  evidenceReferenceIds: [], conditionIds: [],
};

export const personas: TeamPersona[] = [
  {
    ...base,
    id: "PERSONA-1001", teamId: "TEAM-PAY", teamName: "Payments Platform", businessUnit: "Commerce Engineering",
    description: "Operating model for the team accountable for payment authorization and settlement events.",
    mission: "Enable reliable, secure, low friction payment processing for every checkout transaction",
    businessCapabilities: ["Payment authorization", "Payment routing", "Retry orchestration", "Tokenization coordination", "Transaction event publishing"],
    externalCustomers: ["External shoppers through the checkout journey"],
    decisionPriorities: ["Payment integrity", "Customer checkout completion", "Reliability", "Security", "Regulatory compliance", "Operational reversibility"],
    successCriteria: ["Availability remains above 99.95 percent", "P95 latency remains below 250 milliseconds", "Error rate trends toward less than 0.3 percent", "No duplicate transactions", "No unauthorized token persistence"],
    failureModes: ["Payment authorization unavailable", "Retry amplification creates duplicate processing", "Identity latency blocks checkout", "Fraud timeout creates customer abandonment", "Regional dependency failure causes transaction loss"],
    commonTradeoffs: ["Fraud protection versus checkout conversion", "Retry aggressiveness versus duplicate transaction risk", "Release speed versus operational stability", "Regional resilience versus implementation complexity"],
    preferredEvidence: ["Production telemetry", "Controlled experiments", "Incident trends", "Customer conversion metrics", "Fraud loss metrics", "Dependency health"],
    escalationPhilosophy: ["Escalate before customer impact becomes widespread", "Include affected dependency owners", "Use Code Yellow for measurable but contained degradation", "Use Code Red for material payment integrity or broad customer impact"],
    riskAppetite: ["Low tolerance for payment integrity, security, and compliance risk", "Moderate tolerance for reversible performance experimentation", "Higher tolerance for internal tooling change with no customer or financial exposure"],
    qualityScore: 94, completenessScore: 92, confidence: 95, freshnessStatus: "Current",
    constructionStatus: "In Construction", approvalState: "Team Review Required",
    personaOwner: "Jane Smith", teamOwner: "Jane Smith", technicalOwner: "Payments Architecture",
    version: "v3.4-draft", createdAt: "2026-02-11", updatedAt: "2026-08-06", publishedAt: null,
    knowledgeDomains: ["Payments", "Reliability"], conditionCount: 428, dependencyCount: 18,
    capabilities: ["Payment authorization", "Payment routing", "Retry orchestration"],
    services: ["Payments API", "Retry Orchestrator", "Tokenization Adapter", "Settlement Event Publisher"],
    customers: ["Checkout Engineering", "Finance Operations", "Customer Support"],
    upstream: ["Identity Services", "Fraud Decision Service", "Regional Token Vault"],
    downstream: ["Checkout Engineering", "Finance Operations", "Customer Support Operations"],
    systems: ["Payments Core", "Token Vault", "Observability Platform"],
    graphCoverage: 92, constructionStage: "Validate Evidence and Completeness", evidenceCoverage: 95,
    ownershipStatus: "Resolved", dependencyStatus: "Conflicts", reviewStatus: "Pending", warnings: 2,
    riskLevel: "High", region: "Global", environment: "Production", product: "Payments API",
    capabilityArea: "Payment authorization", customerJourney: "Checkout", dataResidency: "Multi-region",
    sourceAuthority: "Primary", selectedConditions: 428, includedConditions: 386, excludedConditions: 26,
    conflicts: 4, evidenceGaps: 2, reviewer: "Jane Smith",
  },
  {
    ...base,
    id: "PERSONA-1002", teamId: "TEAM-CHK", teamName: "Checkout Engineering", businessUnit: "Commerce Engineering",
    description: "Operating model for the customer checkout experience team.",
    mission: "Deliver a fast and resilient customer checkout experience",
    businessCapabilities: ["Checkout orchestration", "Session management", "Payment presentation"],
    externalCustomers: ["Shoppers"],
    decisionPriorities: ["Conversion", "Resilience", "Performance"],
    successCriteria: ["Checkout completion rate stable", "Session errors below threshold"],
    failureModes: ["Session loss", "Payment step timeout"],
    commonTradeoffs: ["Feature velocity versus conversion stability"],
    preferredEvidence: ["Conversion analytics", "Session telemetry"],
    escalationPhilosophy: ["Escalate on conversion regression"],
    riskAppetite: ["Low tolerance for conversion regression"],
    qualityScore: 96, completenessScore: 97, confidence: 96, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved",
    personaOwner: "Marcus Lee", teamOwner: "Marcus Lee", technicalOwner: "Checkout Architecture",
    version: "v5.1", createdAt: "2026-01-20", updatedAt: "2026-08-04", publishedAt: "2026-08-04",
    knowledgeDomains: ["Checkout"], conditionCount: 362, dependencyCount: 22,
    capabilities: ["Checkout orchestration", "Session management"],
    services: ["Checkout Orchestrator", "Session Service"],
    customers: ["External shoppers", "Finance Operations"],
    upstream: ["Payments API", "Identity Services"],
    downstream: ["Customer Support Operations"],
    systems: ["Checkout Core", "Observability Platform"],
    graphCoverage: 95, constructionStage: "Publish Team Persona", evidenceCoverage: 97,
    ownershipStatus: "Resolved", dependencyStatus: "Resolved", reviewStatus: "Complete", warnings: 0,
    riskLevel: "Moderate", region: "Global", environment: "Production", product: "Checkout Experience",
    capabilityArea: "Checkout orchestration", customerJourney: "Checkout", dataResidency: "Multi-region",
    sourceAuthority: "Primary", selectedConditions: 362, includedConditions: 344, excludedConditions: 14,
    conflicts: 0, evidenceGaps: 0, reviewer: "Marcus Lee",
  },
  {
    ...base,
    id: "PERSONA-1003", teamId: "TEAM-FRD", teamName: "Fraud Engineering", businessUnit: "Risk Technology",
    description: "Operating model for transaction fraud prevention.",
    mission: "Prevent fraudulent transactions without creating unnecessary customer friction",
    businessCapabilities: ["Fraud decisioning", "Risk scoring", "Rule governance"],
    externalCustomers: ["Shoppers"],
    decisionPriorities: ["Fraud loss containment", "Customer friction minimisation"],
    successCriteria: ["Fraud loss rate within appetite", "False positive rate declining"],
    failureModes: ["Decision timeout", "Model drift"],
    commonTradeoffs: ["Fraud capture versus false positives"],
    preferredEvidence: ["Fraud loss metrics", "Model performance reports"],
    escalationPhilosophy: ["Escalate on material loss exposure"],
    riskAppetite: ["Low tolerance for undetected fraud"],
    qualityScore: 93, completenessScore: 94, confidence: 94, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved",
    personaOwner: "Priya Patel", teamOwner: "Priya Patel", technicalOwner: "Risk Architecture",
    version: "v4.0", createdAt: "2026-02-02", updatedAt: "2026-08-05", publishedAt: "2026-08-05",
    knowledgeDomains: ["Fraud & Risk"], conditionCount: 314, dependencyCount: 17,
    capabilities: ["Fraud decisioning", "Risk scoring"],
    services: ["Fraud Decision Service"], customers: ["Payments Platform", "Checkout Engineering"],
    upstream: ["Identity Services"], downstream: ["Payments Platform"],
    systems: ["Risk Core"], graphCoverage: 90, constructionStage: "Compile Decision Logic",
    evidenceCoverage: 94, ownershipStatus: "Resolved", dependencyStatus: "Resolved",
    reviewStatus: "Complete", warnings: 1, riskLevel: "High", region: "Global",
    environment: "Production", product: "Fraud Decision Service", capabilityArea: "Fraud decisioning",
    customerJourney: "Checkout", dataResidency: "Multi-region", sourceAuthority: "Primary",
    selectedConditions: 314, includedConditions: 297, excludedConditions: 12, conflicts: 1,
    evidenceGaps: 1, reviewer: "Priya Patel",
  },
  {
    ...base,
    id: "PERSONA-1004", teamId: "TEAM-IDN", teamName: "Identity Engineering", businessUnit: "Security Engineering",
    description: "Operating model for enterprise identity validation services.",
    mission: "Provide secure and available identity validation services",
    businessCapabilities: ["Identity validation", "Token issuance", "Credential governance"],
    externalCustomers: ["Authenticated customers"],
    decisionPriorities: ["Security", "Availability"],
    successCriteria: ["Validation latency within budget", "No credential exposure"],
    failureModes: ["Validation latency", "Vault unavailability"],
    commonTradeoffs: ["Security depth versus latency"],
    preferredEvidence: ["Security review findings", "Latency telemetry"],
    escalationPhilosophy: ["Escalate any credential exposure immediately"],
    riskAppetite: ["Very low tolerance for security risk"],
    qualityScore: 81, completenessScore: 84, confidence: 82, freshnessStatus: "Aging",
    constructionStatus: "Warning", approvalState: "Conflict Review",
    personaOwner: "Security Architecture", teamOwner: "Security Architecture", technicalOwner: "Security Architecture",
    version: "v2.6-draft", createdAt: "2026-03-14", updatedAt: "2026-07-22", publishedAt: null,
    knowledgeDomains: ["Identity"], conditionCount: 286, dependencyCount: 26,
    capabilities: ["Identity validation", "Token issuance"],
    services: ["Identity Services", "Regional Token Vault"],
    customers: ["Payments Platform", "Checkout Engineering", "Fraud Engineering"],
    upstream: ["Directory Platform"], downstream: ["Payments Platform", "Fraud Engineering"],
    systems: ["Identity Core", "Token Vault"], graphCoverage: 78,
    constructionStage: "Map Dependencies and Risks", evidenceCoverage: 84, ownershipStatus: "Unresolved",
    dependencyStatus: "Conflicts", reviewStatus: "Not Started", warnings: 5, riskLevel: "High",
    region: "Global", environment: "Production", product: "Identity Services",
    capabilityArea: "Identity validation", customerJourney: "Account Access", dataResidency: "EU",
    sourceAuthority: "Supporting", selectedConditions: 286, includedConditions: 241,
    excludedConditions: 22, conflicts: 6, evidenceGaps: 4, reviewer: "Unassigned",
  },
  {
    ...base,
    id: "PERSONA-1005", teamId: "TEAM-SRE", teamName: "Site Reliability Engineering", businessUnit: "Platform Operations",
    description: "Operating model for enterprise reliability and operational resilience.",
    mission: "Maintain reliability, observability, and operational resilience",
    businessCapabilities: ["Observability", "Incident command", "Error budget governance"],
    externalCustomers: [],
    decisionPriorities: ["Customer impact containment", "Error budget protection"],
    successCriteria: ["Error budgets respected", "Time to detect reducing"],
    failureModes: ["Detection gap", "Alert fatigue"],
    commonTradeoffs: ["Change velocity versus error budget"],
    preferredEvidence: ["Production telemetry", "Incident retrospectives"],
    escalationPhilosophy: ["Escalate early with clear customer impact framing"],
    riskAppetite: ["Low tolerance for undetected customer impact"],
    qualityScore: 97, completenessScore: 98, confidence: 97, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved",
    personaOwner: "Reliability Operations", teamOwner: "Reliability Operations", technicalOwner: "Reliability Architecture",
    version: "v6.2", createdAt: "2025-11-08", updatedAt: "2026-08-06", publishedAt: "2026-08-06",
    knowledgeDomains: ["Reliability"], conditionCount: 512, dependencyCount: 31,
    capabilities: ["Observability", "Incident command"],
    services: ["Observability Platform", "Incident Console"],
    customers: ["All engineering teams"], upstream: ["Telemetry Pipeline"],
    downstream: ["Payments Platform", "Checkout Engineering", "Release Governance"],
    systems: ["Observability Platform"], graphCoverage: 97, constructionStage: "Publish Team Persona",
    evidenceCoverage: 98, ownershipStatus: "Resolved", dependencyStatus: "Resolved",
    reviewStatus: "Complete", warnings: 0, riskLevel: "Moderate", region: "Global",
    environment: "Production", product: "Observability Platform", capabilityArea: "Observability",
    customerJourney: "Issue Resolution", dataResidency: "Multi-region", sourceAuthority: "Primary",
    selectedConditions: 512, includedConditions: 498, excludedConditions: 10, conflicts: 0,
    evidenceGaps: 0, reviewer: "Reliability Operations",
  },
  {
    ...base,
    id: "PERSONA-1006", teamId: "TEAM-CSO", teamName: "Customer Support Operations", businessUnit: "Customer Experience",
    description: "Operating model for customer issue resolution operations.",
    mission: "Resolve customer issues quickly while preserving customer trust",
    businessCapabilities: ["Issue resolution", "Case triage", "Customer communication"],
    externalCustomers: ["Customers raising support contacts"],
    decisionPriorities: ["Customer trust", "Resolution speed"],
    successCriteria: ["First contact resolution improving", "Escalation backlog stable"],
    failureModes: ["Contact surge", "Missing product context"],
    commonTradeoffs: ["Resolution speed versus investigation depth"],
    preferredEvidence: ["Case analytics", "Customer sentiment"],
    escalationPhilosophy: ["Escalate systemic issues, not individual cases"],
    riskAppetite: ["Low tolerance for customer trust damage"],
    qualityScore: 86, completenessScore: 79, confidence: 87, freshnessStatus: "Current",
    constructionStatus: "Draft", approvalState: "Owner Review",
    personaOwner: "Customer Support Leadership", teamOwner: "Customer Support Leadership", technicalOwner: "Support Systems",
    version: "v1.3-draft", createdAt: "2026-05-19", updatedAt: "2026-08-06", publishedAt: null,
    knowledgeDomains: ["Customer Service"], conditionCount: 248, dependencyCount: 15,
    capabilities: ["Issue resolution", "Case triage"], services: ["Support Console"],
    customers: ["External customers"], upstream: ["Payments Platform", "Checkout Engineering"],
    downstream: ["Product Management"], systems: ["Support Core"], graphCoverage: 71,
    constructionStage: "Resolve Ownership and Scope", evidenceCoverage: 79,
    ownershipStatus: "Partial", dependencyStatus: "Pending", reviewStatus: "Pending", warnings: 3,
    riskLevel: "Moderate", region: "North America", environment: "Production", product: "Support Console",
    capabilityArea: "Issue resolution", customerJourney: "Issue Resolution", dataResidency: "US",
    sourceAuthority: "Supporting", selectedConditions: 248, includedConditions: 196,
    excludedConditions: 31, conflicts: 2, evidenceGaps: 5, reviewer: "Unassigned",
  },
  {
    ...base,
    id: "PERSONA-1007", teamId: "TEAM-RGV", teamName: "Release Governance", businessUnit: "Engineering Operations",
    description: "Operating model for enterprise change governance.",
    mission: "Protect enterprise stability while enabling timely change",
    businessCapabilities: ["Change control", "Release approval", "Freeze administration"],
    externalCustomers: [],
    decisionPriorities: ["Enterprise stability", "Change throughput"],
    successCriteria: ["Change failure rate declining", "Approval latency within target"],
    failureModes: ["Approval bottleneck", "Unapproved change"],
    commonTradeoffs: ["Control strength versus delivery speed"],
    preferredEvidence: ["Change failure metrics", "Audit findings"],
    escalationPhilosophy: ["Escalate unapproved production change immediately"],
    riskAppetite: ["Low tolerance for uncontrolled change"],
    qualityScore: 92, completenessScore: 93, confidence: 94, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved",
    personaOwner: "Engineering Governance", teamOwner: "Engineering Governance", technicalOwner: "Governance Systems",
    version: "v3.9", createdAt: "2026-01-05", updatedAt: "2026-08-01", publishedAt: "2026-08-01",
    knowledgeDomains: ["Governance"], conditionCount: 194, dependencyCount: 28,
    capabilities: ["Change control", "Release approval"], services: ["Release Console"],
    customers: ["All engineering teams"], upstream: ["Risk Management"],
    downstream: ["Payments Platform", "Checkout Engineering", "Identity Engineering"],
    systems: ["Governance Core"], graphCoverage: 88, constructionStage: "Publish Team Persona",
    evidenceCoverage: 93, ownershipStatus: "Resolved", dependencyStatus: "Resolved",
    reviewStatus: "Complete", warnings: 0, riskLevel: "Low", region: "Global",
    environment: "Production", product: "Release Console", capabilityArea: "Change control",
    customerJourney: "Change Delivery", dataResidency: "Multi-region", sourceAuthority: "Primary",
    selectedConditions: 194, includedConditions: 188, excludedConditions: 4, conflicts: 0,
    evidenceGaps: 0, reviewer: "Engineering Governance",
  },
];

/* ---------------------------- persona sections ---------------------------- */

const paymentsSectionSeed: { type: PersonaSectionType; title: string; summary: string; values: string[]; completeness: number; confidence: number; conditions: number; evidence: number; warnings: number }[] = [
  { type: "Identity", title: "Team Identity", summary: "Payments Platform, Commerce Engineering", values: ["Team Name: Payments Platform", "Business Unit: Commerce Engineering"], completeness: 100, confidence: 98, conditions: 4, evidence: 6, warnings: 0 },
  { type: "Mission", title: "Primary Mission", summary: "Enable reliable, secure, low friction payment processing for every checkout transaction", values: ["Enable reliable, secure, low friction payment processing for every checkout transaction"], completeness: 96, confidence: 96, conditions: 6, evidence: 9, warnings: 0 },
  { type: "Business Capabilities", title: "Business Capabilities", summary: "Five owned capabilities", values: ["Payment authorization", "Payment routing", "Retry orchestration", "Tokenization coordination", "Transaction event publishing"], completeness: 93, confidence: 94, conditions: 22, evidence: 31, warnings: 0 },
  { type: "Products and Services", title: "Products and Services", summary: "Four owned services", values: ["Payments API", "Retry Orchestrator", "Tokenization Adapter", "Settlement Event Publisher"], completeness: 95, confidence: 95, conditions: 28, evidence: 44, warnings: 0 },
  { type: "Customers", title: "Customers and Stakeholders", summary: "Five internal customers and the external checkout journey", values: ["Checkout Engineering", "Fraud Engineering", "Finance Operations", "Customer Support", "Site Reliability Engineering", "External shoppers through the checkout journey"], completeness: 91, confidence: 92, conditions: 19, evidence: 26, warnings: 1 },
  { type: "Objectives", title: "Objectives", summary: "Four prioritized outcomes", values: ["Maintain payment availability", "Reduce transaction failures", "Protect customer conversion", "Preserve financial and regulatory controls"], completeness: 92, confidence: 93, conditions: 17, evidence: 24, warnings: 0 },
  { type: "Service Level Objectives", title: "Service Levels", summary: "Availability, latency, error rate", values: ["Monthly availability at least 99.95 percent", "P95 latency below 250 milliseconds during peak periods", "Error rate target below 0.3 percent"], completeness: 97, confidence: 96, conditions: 12, evidence: 21, warnings: 0 },
  { type: "Constraints", title: "Constraints", summary: "Change freeze, token handling, joint approval", values: ["No deployment during the final three business days of a financial quarter", "Restricted token data cannot be persisted outside approved vault services", "Changes affecting more than 10 percent of checkout traffic require joint approval"], completeness: 90, confidence: 91, conditions: 14, evidence: 19, warnings: 1 },
  { type: "Dependencies", title: "Dependencies", summary: "Five critical dependencies", values: ["Identity Services", "Fraud Decision Service", "Regional Token Vault", "Checkout Orchestrator", "Observability Platform"], completeness: 88, confidence: 89, conditions: 24, evidence: 33, warnings: 2 },
  { type: "Risks", title: "Risk Conditions", summary: "Five modeled risk conditions", values: ["Identity service latency", "Fraud decision timeout", "Regional token vault failure", "Retry amplification", "Duplicate payment processing"], completeness: 87, confidence: 88, conditions: 15, evidence: 22, warnings: 2 },
  { type: "Controls", title: "Controls", summary: "Five mapped controls", values: ["Idempotency validation", "Traffic segmentation", "Progressive rollout", "Automated rollback", "Token handling policy"], completeness: 89, confidence: 90, conditions: 13, evidence: 18, warnings: 1 },
  { type: "Decision Rules", title: "Decision Logic", summary: "Five governing decision rules", values: ["Customer conversion and payment integrity are both primary", "Security and regulatory controls are nonnegotiable", "Prefer reversible changes with measurable rollout stages", "Changes with broad traffic exposure require cross team approval", "Operational evidence takes priority over assumptions"], completeness: 91, confidence: 92, conditions: 18, evidence: 27, warnings: 0 },
  { type: "Decision Priorities", title: "Decision Priorities", summary: "Ordered decision priorities", values: ["Payment integrity", "Customer checkout completion", "Reliability", "Security", "Regulatory compliance", "Operational reversibility"], completeness: 94, confidence: 94, conditions: 9, evidence: 14, warnings: 0 },
  { type: "Common Tradeoffs", title: "Common Tradeoffs", summary: "Four recurring tradeoffs", values: ["Fraud protection versus checkout conversion", "Retry aggressiveness versus duplicate transaction risk", "Release speed versus operational stability", "Regional resilience versus implementation complexity"], completeness: 90, confidence: 90, conditions: 8, evidence: 12, warnings: 0 },
  { type: "Preferred Evidence", title: "Preferred Evidence", summary: "Six trusted evidence classes", values: ["Production telemetry", "Controlled experiments", "Incident trends", "Customer conversion metrics", "Fraud loss metrics", "Dependency health"], completeness: 95, confidence: 95, conditions: 7, evidence: 11, warnings: 0 },
  { type: "Escalation Philosophy", title: "Escalation Philosophy", summary: "Escalate before widespread impact", values: ["Escalate before customer impact becomes widespread", "Include affected dependency owners", "Use Code Yellow for measurable but contained degradation", "Use Code Red for material payment integrity or broad customer impact"], completeness: 92, confidence: 92, conditions: 6, evidence: 9, warnings: 0 },
  { type: "Risk Appetite", title: "Risk Appetite", summary: "Low for integrity, moderate for reversible change", values: ["Low tolerance for payment integrity, security, and compliance risk", "Moderate tolerance for reversible performance experimentation", "Higher tolerance for internal tooling change with no customer or financial exposure"], completeness: 93, confidence: 93, conditions: 5, evidence: 8, warnings: 0 },
];

export function personaSections(personaId: string): PersonaSection[] {
  const seeded = paymentsSectionSeed.map((s, i) => ({
    id: `${personaId}-SEC-${i + 1}`,
    personaId,
    sectionType: s.type,
    title: s.title,
    summary: s.summary,
    conditionIds: Array.from({ length: s.conditions }, (_, k) => `COND-${100400 + i * 30 + k}`),
    evidenceReferenceIds: Array.from({ length: s.evidence }, (_, k) => `EV-${8800 + i * 40 + k}`),
    owner: "Jane Smith",
    completeness: s.completeness,
    confidence: s.confidence,
    freshness: "Current" as FreshnessStatus,
    reviewStatus: (s.warnings > 0 ? "Pending" : "Approved") as PersonaSection["reviewStatus"],
    warningCount: s.warnings,
    values: s.values,
  }));
  const covered = new Set(seeded.map((s) => s.sectionType));
  const remainder = PERSONA_SECTION_TYPES.filter((t) => !covered.has(t)).map((t, i) => ({
    id: `${personaId}-SEC-R${i + 1}`,
    personaId,
    sectionType: t,
    title: t,
    summary: "Governed section registered; population continues during construction.",
    conditionIds: Array.from({ length: 3 + (i % 5) }, (_, k) => `COND-${101900 + i * 10 + k}`),
    evidenceReferenceIds: Array.from({ length: 2 + (i % 4) }, (_, k) => `EV-${9500 + i * 10 + k}`),
    owner: "Jane Smith",
    completeness: 74 + ((i * 7) % 22),
    confidence: 80 + ((i * 5) % 16),
    freshness: (i % 7 === 0 ? "Aging" : "Current") as FreshnessStatus,
    reviewStatus: (i % 4 === 0 ? "Pending" : "Not Started") as PersonaSection["reviewStatus"],
    warningCount: i % 6 === 0 ? 1 : 0,
    values: [],
  }));
  return [...seeded, ...remainder];
}

/* ---------------------------- condition library --------------------------- */

export const conditionGroups = [
  "Mission and Objectives", "Products and Services", "Customers and Stakeholders",
  "Service Levels and Metrics", "Constraints and Policies", "Dependencies",
  "Risks and Controls", "Decision Rules", "Approval Requirements",
  "Operational Windows", "Escalation Triggers",
];

export const paymentsConditions: BusinessCondition[] = [
  {
    id: "COND-100421", statement: "Payments API monthly availability shall be at least 99.95 percent",
    conditionType: "Service Level", group: "Service Levels and Metrics", owner: "Payments Reliability",
    authority: "Primary", confidence: 97, freshness: "Current", evidenceCount: 6,
    applicability: "Payments Platform, Production", mappingState: "Included",
    section: "Service Level Objectives", sourceArtifact: "Payments API Reliability Requirements v4.2",
    evidencePassage: "The Payments API shall sustain a monthly availability of no less than 99.95% measured at the regional edge.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100424", statement: "Payments API P95 latency shall remain below 250 milliseconds during peak checkout periods",
    conditionType: "Service Level", group: "Service Levels and Metrics", owner: "Payments Reliability",
    authority: "Primary", confidence: 96, freshness: "Current", evidenceCount: 5,
    applicability: "Payments Platform, Peak windows", mappingState: "Included",
    section: "Service Level Objectives", sourceArtifact: "Payments API Reliability Requirements v4.2",
    evidencePassage: "During peak checkout periods the P95 authorization latency shall remain below 250 ms.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100427", statement: "Current Payments API error rate baseline is 0.8 percent",
    conditionType: "Baseline", group: "Service Levels and Metrics", owner: "Payments Reliability",
    authority: "Supporting", confidence: 89, freshness: "Aging", evidenceCount: 3,
    applicability: "Payments Platform", mappingState: "Suggested", section: "Baselines",
    sourceArtifact: "Payments Quarterly Reliability Review Q2 FY26",
    evidencePassage: "The observed trailing ninety day error rate baseline for the Payments API is 0.8%.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100429", statement: "Payments API error rate target is less than 0.3 percent",
    conditionType: "Target", group: "Service Levels and Metrics", owner: "Payments Reliability",
    authority: "Primary", confidence: 94, freshness: "Current", evidenceCount: 4,
    applicability: "Payments Platform", mappingState: "Included", section: "Targets",
    sourceArtifact: "Commerce Engineering FY26 Objectives",
    evidencePassage: "Payments error rate shall trend below 0.3% by the end of the fiscal year.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100455", statement: "Retry policy changes affecting more than 10 percent of checkout traffic require approval from Payments Reliability and Fraud Engineering",
    conditionType: "Approval Requirement", group: "Approval Requirements", owner: "Payments Governance",
    authority: "Primary", confidence: 93, freshness: "Current", evidenceCount: 4,
    applicability: "Payments Platform, Fraud Engineering", mappingState: "Conflict",
    section: "Approval Requirements", sourceArtifact: "Payments Change Policy 3320",
    evidencePassage: "Retry behaviour changes exceeding 10% of checkout traffic require approval from Payments Reliability and Fraud Engineering.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100438", statement: "Payments API depends on Identity Services, Fraud Decision Service, and Regional Token Vault",
    conditionType: "Dependency", group: "Dependencies", owner: "Payments Architecture",
    authority: "Primary", confidence: 95, freshness: "Current", evidenceCount: 7,
    applicability: "Payments Platform", mappingState: "Included", section: "Dependencies",
    sourceArtifact: "Payments Platform Architecture Record 2291",
    evidencePassage: "Authorization requires a successful identity assertion, a fraud decision, and a vault token exchange.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100482", statement: "Payments API changes may not be deployed during the final three business days of a financial quarter",
    conditionType: "Operational Window", group: "Operational Windows", owner: "Release Governance",
    authority: "Supporting", confidence: 90, freshness: "Aging", evidenceCount: 3,
    applicability: "Revenue path services", mappingState: "Included", section: "Operational Windows",
    sourceArtifact: "Enterprise Change Calendar FY26",
    evidencePassage: "A change freeze applies to revenue-path services during the final three business days of each financial quarter.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100491", statement: "Payment retries must preserve idempotency across regional failover",
    conditionType: "Requirement", group: "Risks and Controls", owner: "Payments Architecture",
    authority: "Primary", confidence: 96, freshness: "Current", evidenceCount: 5,
    applicability: "Payments Platform, Multi-region", mappingState: "Included", section: "Controls",
    sourceArtifact: "Payments Resilience Standard 5510",
    evidencePassage: "Retry execution must carry a stable idempotency key that survives regional failover.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100467", statement: "Restricted token data must never be persisted outside approved vault services",
    conditionType: "Policy", group: "Constraints and Policies", owner: "Security Engineering",
    authority: "Primary", confidence: 98, freshness: "Current", evidenceCount: 6,
    applicability: "All payment services", mappingState: "Included", section: "Policies",
    sourceArtifact: "Token Handling Standard 1140",
    evidencePassage: "Restricted token material must not be written to any store outside an approved vault service boundary.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100503", statement: "Checkout degradation must prioritize completion of existing customer sessions",
    conditionType: "Decision Rule", group: "Decision Rules", owner: "Commerce Engineering",
    authority: "Supporting", confidence: 87, freshness: "Current", evidenceCount: 3,
    applicability: "Payments Platform, Checkout Engineering", mappingState: "Suggested",
    section: "Decision Rules", sourceArtifact: "Commerce Degradation Playbook 812",
    evidencePassage: "Under degradation, in-flight customer sessions take precedence over new session admission.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100512", statement: "Payments Platform owns payment authorization, routing, and retry orchestration",
    conditionType: "Objective", group: "Mission and Objectives", owner: "Payments Platform",
    authority: "Primary", confidence: 96, freshness: "Current", evidenceCount: 5,
    applicability: "Payments Platform", mappingState: "Included", section: "Business Capabilities",
    sourceArtifact: "Commerce Engineering Capability Map v9",
    evidencePassage: "Payment authorization, routing, and retry orchestration are owned by the Payments Platform team.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100518", statement: "Settlement events must be published to Finance Operations within five minutes",
    conditionType: "Requirement", group: "Products and Services", owner: "Finance Operations",
    authority: "Supporting", confidence: 84, freshness: "Aging", evidenceCount: 2,
    applicability: "Settlement Event Publisher", mappingState: "Review Required",
    section: "Products and Services", sourceArtifact: "Finance Reconciliation Requirements 402",
    evidencePassage: "Settlement events must be available to reconciliation within five minutes of authorization.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100524", statement: "Checkout Engineering is the primary internal consumer of the Payments API",
    conditionType: "Dependency", group: "Customers and Stakeholders", owner: "Commerce Engineering",
    authority: "Primary", confidence: 95, freshness: "Current", evidenceCount: 4,
    applicability: "Payments Platform", mappingState: "Included", section: "Customers",
    sourceArtifact: "Service Consumer Registry 4410",
    evidencePassage: "Checkout Engineering accounts for 91% of Payments API call volume.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100531", statement: "Identity validation latency above 400 milliseconds triggers payment escalation",
    conditionType: "Escalation Trigger", group: "Escalation Triggers", owner: "Payments Reliability",
    authority: "Supporting", confidence: 86, freshness: "Current", evidenceCount: 3,
    applicability: "Payments Platform, Identity Engineering", mappingState: "Suggested",
    section: "Escalation Philosophy", sourceArtifact: "Payments Escalation Runbook 9001",
    evidencePassage: "Sustained identity latency above 400 ms for ten minutes triggers a Code Yellow escalation.",
    teamId: "TEAM-PAY",
  },
  {
    id: "COND-100544", statement: "Legacy card gateway migration guidance is superseded",
    conditionType: "Assumption", group: "Mission and Objectives", owner: "Payments Architecture",
    authority: "Derived", confidence: 61, freshness: "Stale", evidenceCount: 1,
    applicability: "Deprecated", mappingState: "Excluded", section: "Assumptions",
    sourceArtifact: "Card Gateway Migration Plan 2023",
    evidencePassage: "The legacy card gateway will be retired following the regional migration programme.",
    teamId: "TEAM-PAY",
  },
];

/* --------------------------- persona canvas seed -------------------------- */

export const paymentsCanvas = {
  identity: { teamName: "Payments Platform", businessUnit: "Commerce Engineering" },
  mission: "Enable reliable, secure, low friction payment processing for every checkout transaction",
  capabilities: ["Payment authorization", "Payment routing", "Retry orchestration", "Tokenization coordination", "Transaction event publishing"],
  productsAndServices: ["Payments API", "Retry Orchestrator", "Tokenization Adapter", "Settlement Event Publisher"],
  customers: ["Checkout Engineering", "Fraud Engineering", "Finance Operations", "Customer Support", "Site Reliability Engineering", "External shoppers through the checkout journey"],
  objectives: ["Maintain payment availability", "Reduce transaction failures", "Protect customer conversion", "Preserve financial and regulatory controls"],
  serviceLevels: ["Monthly availability at least 99.95 percent", "P95 latency below 250 milliseconds during peak periods", "Error rate target below 0.3 percent"],
  constraints: ["No deployment during the final three business days of a financial quarter", "Restricted token data cannot be persisted outside approved vault services", "Changes affecting more than 10 percent of checkout traffic require joint approval"],
  dependencies: ["Identity Services", "Fraud Decision Service", "Regional Token Vault", "Checkout Orchestrator", "Observability Platform"],
  risks: ["Identity service latency", "Fraud decision timeout", "Regional token vault failure", "Retry amplification", "Duplicate payment processing"],
  controls: ["Idempotency validation", "Traffic segmentation", "Progressive rollout", "Automated rollback", "Token handling policy"],
  decisionLogic: ["Customer conversion and payment integrity are both primary", "Security and regulatory controls are nonnegotiable", "Prefer reversible changes with measurable rollout stages", "Changes with broad traffic exposure require cross team approval", "Operational evidence takes priority over assumptions"],
};

export const howThisTeamThinks: { key: string; title: string; values: string[] }[] = [
  { key: "mission", title: "Primary Mission", values: [paymentsCanvas.mission] },
  { key: "priorities", title: "Decision Priorities", values: personas[0].decisionPriorities },
  { key: "success", title: "Success Criteria", values: personas[0].successCriteria },
  { key: "failure", title: "Failure Modes", values: personas[0].failureModes },
  { key: "tradeoffs", title: "Common Tradeoffs", values: personas[0].commonTradeoffs },
  { key: "evidence", title: "Preferred Evidence", values: personas[0].preferredEvidence },
  { key: "escalation", title: "Escalation Philosophy", values: personas[0].escalationPhilosophy },
  { key: "appetite", title: "Risk Appetite", values: personas[0].riskAppetite },
];

/* --------------------------- condition coverage --------------------------- */

export const conditionCoverage = {
  available: 82906,
  mapped: 76284,
  unmapped: 6622,
  multiPersona: 18426,
  applicabilityReview: 427,
  categories: [
    { name: "Objectives", mapped: 92 },
    { name: "Requirements", mapped: 94 },
    { name: "Constraints", mapped: 89 },
    { name: "Service Levels", mapped: 96 },
    { name: "Metrics", mapped: 93 },
    { name: "Dependencies", mapped: 87 },
    { name: "Risks", mapped: 84 },
    { name: "Decision Rules", mapped: 88 },
    { name: "Controls", mapped: 86 },
    { name: "Approval Requirements", mapped: 91 },
  ],
};

/* ------------------------------- graph model ------------------------------ */

export interface GraphNode {
  id: string;
  label: string;
  kind: "Team" | "Service" | "System" | "Customer" | "KPI" | "Governance" | "Center";
  x: number;
  y: number;
  summary: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: PersonaRelationship["relationshipType"];
  direction: "Upstream" | "Downstream" | "Bidirectional";
  criticality: "Critical" | "High" | "Medium" | "Low";
  customerPath?: boolean;
}

export const graphNodes: GraphNode[] = [
  { id: "payments", label: "Payments Platform", kind: "Center", x: 50, y: 50, summary: "Persona under construction. 428 conditions, 18 dependencies." },
  { id: "checkout", label: "Checkout Engineering", kind: "Team", x: 20, y: 20, summary: "Primary internal consumer of the Payments API." },
  { id: "fraud", label: "Fraud Engineering", kind: "Team", x: 50, y: 14, summary: "Provides fraud decisioning to the authorization path." },
  { id: "identity", label: "Identity Engineering", kind: "Team", x: 80, y: 20, summary: "Owns identity validation and the regional token vault." },
  { id: "sre", label: "Site Reliability Engineering", kind: "Team", x: 88, y: 48, summary: "Escalation partner and observability provider." },
  { id: "finance", label: "Finance Operations", kind: "Team", x: 80, y: 80, summary: "Consumes settlement events for reconciliation." },
  { id: "support", label: "Customer Support Operations", kind: "Team", x: 50, y: 88, summary: "Consumes payment context for customer issue resolution." },
  { id: "papi", label: "Payments API", kind: "Service", x: 34, y: 38, summary: "Owned service. Availability 99.95 percent objective." },
  { id: "retry", label: "Retry Orchestrator", kind: "Service", x: 34, y: 62, summary: "Owned service. Idempotency controlled." },
  { id: "idsvc", label: "Identity Services", kind: "Service", x: 70, y: 32, summary: "Critical upstream dependency." },
  { id: "frauddec", label: "Fraud Decision Service", kind: "Service", x: 62, y: 22, summary: "Critical upstream dependency." },
  { id: "vault", label: "Regional Token Vault", kind: "System", x: 74, y: 62, summary: "Critical upstream dependency with an ownership conflict." },
  { id: "obs", label: "Observability Platform", kind: "System", x: 66, y: 76, summary: "Telemetry source for reliability evidence." },
  { id: "journey", label: "Checkout Customer Journey", kind: "Customer", x: 16, y: 62, summary: "External customer path affected by payment degradation." },
  { id: "kpi", label: "Payment Availability KPI", kind: "KPI", x: 20, y: 80, summary: "Measures the Persona against its availability objective." },
  { id: "gov", label: "Release Governance", kind: "Governance", x: 12, y: 40, summary: "Approves changes to revenue path services." },
];

export const graphEdges: GraphEdge[] = [
  { from: "payments", to: "papi", label: "OWNS", direction: "Downstream", criticality: "Critical" },
  { from: "payments", to: "retry", label: "OWNS", direction: "Downstream", criticality: "High" },
  { from: "payments", to: "idsvc", label: "DEPENDS ON", direction: "Upstream", criticality: "Critical" },
  { from: "payments", to: "frauddec", label: "DEPENDS ON", direction: "Upstream", criticality: "Critical" },
  { from: "payments", to: "vault", label: "DEPENDS ON", direction: "Upstream", criticality: "Critical" },
  { from: "payments", to: "obs", label: "DEPENDS ON", direction: "Upstream", criticality: "Medium" },
  { from: "payments", to: "checkout", label: "PROVIDES TO", direction: "Downstream", criticality: "Critical", customerPath: true },
  { from: "payments", to: "finance", label: "CONSUMED BY", direction: "Downstream", criticality: "High" },
  { from: "payments", to: "support", label: "CONSUMED BY", direction: "Downstream", criticality: "Medium", customerPath: true },
  { from: "payments", to: "kpi", label: "MEASURED BY", direction: "Bidirectional", criticality: "High" },
  { from: "payments", to: "gov", label: "APPROVED BY", direction: "Upstream", criticality: "Medium" },
  { from: "payments", to: "sre", label: "ESCALATES TO", direction: "Bidirectional", criticality: "High" },
  { from: "payments", to: "journey", label: "SUPPORTS", direction: "Downstream", criticality: "Critical", customerPath: true },
  { from: "identity", to: "idsvc", label: "OWNS", direction: "Downstream", criticality: "Critical" },
  { from: "identity", to: "vault", label: "OWNS", direction: "Downstream", criticality: "Critical" },
  { from: "fraud", to: "frauddec", label: "OWNS", direction: "Downstream", criticality: "Critical" },
  { from: "sre", to: "obs", label: "OWNS", direction: "Downstream", criticality: "High" },
  { from: "checkout", to: "journey", label: "SUPPORTS", direction: "Downstream", criticality: "Critical", customerPath: true },
];

export const relationshipTypes: PersonaRelationship["relationshipType"][] = [
  "OWNS", "DEPENDS ON", "PROVIDES TO", "CONSUMED BY", "MEASURED BY", "APPROVED BY", "SUPPORTS", "ESCALATES TO",
];

/* ---------------------------------- quality ------------------------------- */

export const qualityDimensions: QualityDimension[] = [
  { name: "Mission Clarity", score: 96, target: 95, trend: [92, 93, 94, 95, 95, 96, 96, 96], affectedPersonas: 2 },
  { name: "Ownership Completeness", score: 94, target: 95, trend: [88, 89, 91, 92, 93, 93, 94, 94], affectedPersonas: 3 },
  { name: "Capability Coverage", score: 93, target: 95, trend: [87, 88, 90, 91, 92, 92, 93, 93], affectedPersonas: 5 },
  { name: "Products and Services Coverage", score: 95, target: 95, trend: [90, 91, 92, 93, 94, 94, 95, 95], affectedPersonas: 2 },
  { name: "Objective and Metric Coverage", score: 92, target: 95, trend: [85, 87, 88, 89, 90, 91, 92, 92], affectedPersonas: 6 },
  { name: "Constraint Coverage", score: 90, target: 95, trend: [83, 84, 86, 87, 88, 89, 90, 90], affectedPersonas: 7 },
  { name: "Dependency Coverage", score: 88, target: 95, trend: [79, 81, 83, 85, 86, 87, 88, 88], affectedPersonas: 9 },
  { name: "Risk and Control Coverage", score: 87, target: 95, trend: [77, 79, 81, 83, 84, 86, 87, 87], affectedPersonas: 11 },
  { name: "Decision Logic Completeness", score: 91, target: 95, trend: [82, 84, 86, 88, 89, 90, 91, 91], affectedPersonas: 6 },
  { name: "Evidence Coverage", score: 95, target: 95, trend: [88, 90, 91, 92, 93, 94, 95, 95], affectedPersonas: 3 },
  { name: "Authority Confidence", score: 93, target: 95, trend: [86, 88, 89, 90, 91, 92, 93, 93], affectedPersonas: 4 },
  { name: "Freshness", score: 89, target: 95, trend: [80, 82, 84, 86, 87, 88, 89, 89], affectedPersonas: 12 },
];

export const overallQuality = 92;

/* ----------------------------------- gaps --------------------------------- */

export const gapCategories = [
  { name: "Missing Mission Evidence", count: 2 },
  { name: "Missing Business Owner", count: 3 },
  { name: "Unmapped Approved Conditions", count: 6622 },
  { name: "Dependency Conflicts", count: 4 },
  { name: "Missing Downstream Consumers", count: 5 },
  { name: "Incomplete Risk Controls", count: 7 },
  { name: "Low Authority Evidence", count: 4 },
  { name: "Stale Conditions", count: 12 },
  { name: "Missing Decision Rules", count: 6 },
  { name: "Incomplete Escalation Paths", count: 3 },
];

export const gaps: PersonaGap[] = [
  { id: "GAP-7001", personaId: "PERSONA-1004", personaName: "Identity Engineering", sectionId: "SEC-OWN", gapType: "Missing Business Owner", severity: "High", description: "No named business owner for the Regional Token Vault scope.", affectedSection: "Identity", qualityImpact: 6, owner: "Security Architecture", status: "Open", recommendedAction: "Assign a business owner and confirm scope boundary", createdAt: "2026-07-29", dueAt: "2026-08-12", age: "8d" },
  { id: "GAP-7002", personaId: "PERSONA-1001", personaName: "Payments Platform", sectionId: "SEC-DEP", gapType: "Dependency Conflicts", severity: "High", description: "Vault relationship is asserted as both OWNS and DEPENDS ON.", affectedSection: "Dependencies", qualityImpact: 5, owner: "Payments Architecture", status: "Open", recommendedAction: "Resolve ownership with Security Engineering", createdAt: "2026-08-01", dueAt: "2026-08-09", age: "5d" },
  { id: "GAP-7003", personaId: "PERSONA-1006", personaName: "Customer Support Operations", sectionId: "SEC-DWN", gapType: "Missing Downstream Consumers", severity: "Medium", description: "No downstream consumers modeled for resolution insights.", affectedSection: "Downstream Relationships", qualityImpact: 4, owner: "Customer Support Leadership", status: "Assigned", recommendedAction: "Discover consumers from Context Graph", createdAt: "2026-07-24", dueAt: "2026-08-14", age: "13d" },
  { id: "GAP-7004", personaId: "PERSONA-1001", personaName: "Payments Platform", sectionId: "SEC-RSK", gapType: "Incomplete Risk Controls", severity: "Medium", description: "Regional token vault failure has no mapped recovery control.", affectedSection: "Controls", qualityImpact: 4, owner: "Payments Reliability", status: "Open", recommendedAction: "Map a recovery control and expected recovery time", createdAt: "2026-08-02", dueAt: "2026-08-16", age: "4d" },
  { id: "GAP-7005", personaId: "PERSONA-1006", personaName: "Customer Support Operations", sectionId: "SEC-MIS", gapType: "Missing Mission Evidence", severity: "High", description: "Mission statement is not traceable to an approved condition.", affectedSection: "Mission", qualityImpact: 7, owner: "Customer Support Leadership", status: "Open", recommendedAction: "Map an approved mission condition", createdAt: "2026-07-30", dueAt: "2026-08-10", age: "7d" },
  { id: "GAP-7006", personaId: "PERSONA-1004", personaName: "Identity Engineering", sectionId: "SEC-EVD", gapType: "Low Authority Evidence", severity: "Medium", description: "Four dependency assertions rely on derived evidence only.", affectedSection: "Dependencies", qualityImpact: 3, owner: "Security Architecture", status: "Open", recommendedAction: "Locate primary authority artifacts", createdAt: "2026-07-27", dueAt: "2026-08-11", age: "10d" },
  { id: "GAP-7007", personaId: "PERSONA-1003", personaName: "Fraud Engineering", sectionId: "SEC-STL", gapType: "Stale Conditions", severity: "Low", description: "Twelve mapped conditions exceed the freshness threshold.", affectedSection: "Evidence", qualityImpact: 2, owner: "Risk Architecture", status: "Deferred to Prompt 2", recommendedAction: "Schedule condition refresh", createdAt: "2026-07-18", dueAt: "2026-08-20", age: "19d" },
  { id: "GAP-7008", personaId: "PERSONA-1006", personaName: "Customer Support Operations", sectionId: "SEC-DEC", gapType: "Missing Decision Rules", severity: "Medium", description: "No decision rules compiled for escalation of systemic issues.", affectedSection: "Decision Rules", qualityImpact: 4, owner: "Customer Support Leadership", status: "Open", recommendedAction: "Compile decision rules from approved conditions", createdAt: "2026-08-03", dueAt: "2026-08-17", age: "3d" },
  { id: "GAP-7009", personaId: "PERSONA-1001", personaName: "Payments Platform", sectionId: "SEC-ESC", gapType: "Incomplete Escalation Paths", severity: "Medium", description: "Escalation loop detected between Payments and Checkout.", affectedSection: "Escalation Philosophy", qualityImpact: 3, owner: "Payments Reliability", status: "Open", recommendedAction: "Define a directional escalation ladder", createdAt: "2026-08-04", dueAt: "2026-08-15", age: "2d" },
  { id: "GAP-7010", personaId: "PERSONA-1004", personaName: "Identity Engineering", sectionId: "SEC-UNM", gapType: "Unmapped Approved Conditions", severity: "Low", description: "Approved conditions with identity applicability remain unmapped.", affectedSection: "Evidence", qualityImpact: 2, owner: "Security Architecture", status: "Deferred to Prompt 2", recommendedAction: "Run applicability review", createdAt: "2026-07-21", dueAt: "2026-08-21", age: "16d" },
];

/* ----------------------------- construction jobs -------------------------- */

export const constructionJobs: PersonaConstructionJob[] = [
  { id: "TPC-50452", teamIds: ["TEAM-PAY"], teamName: "Payments Platform", status: "Warning", currentStageId: "validate-evidence", currentStage: "Validate Evidence and Completeness", conditionCount: 428, includedConditionCount: 386, excludedConditionCount: 26, reviewConditionCount: 16, relationshipCount: 18, qualityScore: 94, completeness: 92, confidence: 95, warningCount: 2, startedAt: "09:12", elapsedTime: "42m", estimatedCompletion: "18m", owner: "Jane Smith", configurationVersion: "pcs-2026.08.3", personaId: "PERSONA-1001" },
  { id: "TPC-50451", teamIds: ["TEAM-CHK"], teamName: "Checkout Engineering", status: "Running", currentStageId: "publish", currentStage: "Publish Team Persona", conditionCount: 362, includedConditionCount: 344, excludedConditionCount: 14, reviewConditionCount: 4, relationshipCount: 22, qualityScore: 96, completeness: 97, confidence: 96, warningCount: 0, startedAt: "09:04", elapsedTime: "50m", estimatedCompletion: "2m", owner: "Marcus Lee", configurationVersion: "pcs-2026.08.3", personaId: "PERSONA-1002" },
  { id: "TPC-50450", teamIds: ["TEAM-FRD"], teamName: "Fraud Engineering", status: "Running", currentStageId: "compile-decisions", currentStage: "Compile Decision Logic", conditionCount: 314, includedConditionCount: 297, excludedConditionCount: 12, reviewConditionCount: 5, relationshipCount: 17, qualityScore: 93, completeness: 94, confidence: 94, warningCount: 1, startedAt: "09:21", elapsedTime: "33m", estimatedCompletion: "26m", owner: "Priya Patel", configurationVersion: "pcs-2026.08.3", personaId: "PERSONA-1003" },
  { id: "TPC-50449", teamIds: ["TEAM-IDN"], teamName: "Identity Engineering", status: "Blocked", currentStageId: "map-dependencies", currentStage: "Map Dependencies and Risks", conditionCount: 286, includedConditionCount: 241, excludedConditionCount: 22, reviewConditionCount: 23, relationshipCount: 26, qualityScore: 81, completeness: 84, confidence: 82, warningCount: 5, startedAt: "08:47", elapsedTime: "1h 07m", estimatedCompletion: "Blocked", owner: "Security Architecture", configurationVersion: "pcs-2026.08.2", personaId: "PERSONA-1004" },
  { id: "TPC-50448", teamIds: ["TEAM-CSO"], teamName: "Customer Support Operations", status: "Warning", currentStageId: "resolve-ownership", currentStage: "Resolve Ownership and Scope", conditionCount: 248, includedConditionCount: 196, excludedConditionCount: 31, reviewConditionCount: 21, relationshipCount: 15, qualityScore: 86, completeness: 79, confidence: 87, warningCount: 3, startedAt: "09:33", elapsedTime: "21m", estimatedCompletion: "34m", owner: "Customer Support Leadership", configurationVersion: "pcs-2026.08.3", personaId: "PERSONA-1006" },
];

export const jobTimeline = [
  { stage: "Select Team", status: "Complete", at: "09:12", detail: "Team of record resolved" },
  { stage: "Gather Approved Conditions", status: "Complete", at: "09:14", detail: "428 approved conditions collected" },
  { stage: "Resolve Ownership and Scope", status: "Complete", at: "09:19", detail: "Owners resolved, scope confirmed" },
  { stage: "Map Mission and Capabilities", status: "Complete", at: "09:24", detail: "Mission and five capabilities compiled" },
  { stage: "Model Services and Customers", status: "Complete", at: "09:31", detail: "Four services, six customers modeled" },
  { stage: "Map Dependencies and Risks", status: "Warning", at: "09:41", detail: "Vault ownership conflict raised" },
  { stage: "Compile Decision Logic", status: "Complete", at: "09:47", detail: "Five decision rules compiled" },
  { stage: "Validate Evidence and Completeness", status: "Running", at: "09:54", detail: "Evidence validation in progress" },
];

export const jobLogs = [
  "09:12:04 job accepted, configuration pcs-2026.08.3",
  "09:14:37 conditions.gathered count=428 authority=primary,supporting",
  "09:19:02 ownership.resolved persona_owner=Jane Smith technical_owner=Payments Architecture",
  "09:24:41 mission.compiled confidence=0.96 evidence=9",
  "09:31:18 services.modeled owned=4 consumers=6",
  "09:41:55 WARN relationship.conflict target=Regional Token Vault types=OWNS,DEPENDS_ON",
  "09:47:22 decisions.compiled rules=5 priorities=6",
  "09:54:10 evidence.validation started sections=43",
  "09:56:31 WARN evidence.gap section=Controls risk=Regional token vault failure",
];

/* --------------------------- throughput / trends -------------------------- */

export const throughputSeries = [
  { t: "09:00", conditions: 3120, relationships: 1840, personas: 4 },
  { t: "09:10", conditions: 3480, relationships: 2010, personas: 5 },
  { t: "09:20", conditions: 3310, relationships: 2260, personas: 6 },
  { t: "09:30", conditions: 3720, relationships: 2140, personas: 5 },
  { t: "09:40", conditions: 3980, relationships: 2380, personas: 7 },
  { t: "09:50", conditions: 3860, relationships: 2520, personas: 8 },
  { t: "10:00", conditions: 4120, relationships: 2610, personas: 8 },
];

/* --------------------------------- notes ---------------------------------- */

export const provenanceChain = [
  "Payments API Reliability Requirements",
  "Canonical Artifact",
  "Business Condition COND-100421",
  "Payments Platform Persona",
  "Persona Section, Service Levels",
];

export const seedNotifications = [
  { id: "N-1", title: "Vault ownership conflict raised", detail: "Payments Platform and Identity Engineering assert conflicting ownership.", tone: "amber" as const },
  { id: "N-2", title: "Checkout Engineering Persona published", detail: "Version v5.1 is now available to downstream consumers.", tone: "green" as const },
  { id: "N-3", title: "Seven Personas awaiting team review", detail: "Team Review is the current lifecycle bottleneck.", tone: "amber" as const },
];

/* ------------------------------- resolvers -------------------------------- */

const qualityBandMatch = (band: string, score: number) => {
  if (band === "All") return true;
  if (band === "95 and above") return score >= 95;
  if (band === "90 to 94") return score >= 90 && score < 95;
  if (band === "85 to 89") return score >= 85 && score < 90;
  if (band === "80 to 89") return score >= 80 && score < 90;
  if (band === "Below 85") return score < 85;
  if (band === "Below 80") return score < 80;
  return true;
};

export function resolvePersonas(all: TeamPersona[], f: Filters, search: string): TeamPersona[] {
  const q = search.trim().toLowerCase();
  return all.filter((p) => {
    if (f.businessUnit !== "All" && p.businessUnit !== f.businessUnit) return false;
    if (f.team !== "All" && p.teamName !== f.team) return false;
    if (f.knowledgeDomain !== "All" && !p.knowledgeDomains.includes(f.knowledgeDomain)) return false;
    if (f.businessCapability !== "All" && p.capabilityArea !== f.businessCapability) return false;
    if (f.product !== "All" && p.product !== f.product) return false;
    if (f.service !== "All" && !p.services.includes(f.service) && !p.upstream.includes(f.service)) return false;
    if (f.personaStatus !== "All" && p.constructionStatus !== f.personaStatus) return false;
    if (f.constructionStatus !== "All" && p.constructionStage !== f.constructionStatus) return false;
    if (f.approvalStatus !== "All" && p.approvalState !== f.approvalStatus) return false;
    if (!qualityBandMatch(f.qualityBand, p.qualityScore)) return false;
    if (!qualityBandMatch(f.completenessBand, p.completenessScore)) return false;
    if (!qualityBandMatch(f.confidenceBand, p.confidence)) return false;
    if (f.freshness !== "All" && p.freshnessStatus !== f.freshness) return false;
    if (f.sourceAuthority !== "All" && p.sourceAuthority !== f.sourceAuthority) return false;
    if (f.personaOwner !== "All" && p.personaOwner !== f.personaOwner) return false;
    if (f.technicalOwner !== "All" && p.technicalOwner !== f.technicalOwner) return false;
    if (f.riskLevel !== "All" && p.riskLevel !== f.riskLevel) return false;
    if (f.dependencyStatus !== "All" && p.dependencyStatus !== f.dependencyStatus) return false;
    if (f.customerJourney !== "All" && p.customerJourney !== f.customerJourney) return false;
    if (f.environment !== "All" && p.environment !== f.environment) return false;
    if (f.region !== "All" && p.region !== f.region) return false;
    if (f.dataResidency !== "All" && p.dataResidency !== f.dataResidency) return false;
    if (q && !`${p.id} ${p.teamName} ${p.businessUnit} ${p.mission} ${p.personaOwner}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function resolveJobs(all: PersonaConstructionJob[], f: Filters, personaIds: Set<string>): PersonaConstructionJob[] {
  return all.filter((j) => personaIds.has(j.personaId) || activeFilterCount(f) === 0 ? personaIds.has(j.personaId) : false);
}

export function resolveGaps(all: PersonaGap[], personaIds: Set<string>, category: string | null): PersonaGap[] {
  return all.filter((g) => personaIds.has(g.personaId) && (!category || g.gapType === category));
}

export function resolveConditions(all: BusinessCondition[], f: Filters, search: string, group: string | null, category: string | null): BusinessCondition[] {
  const q = search.trim().toLowerCase();
  return all.filter((c) => {
    if (group && c.group !== group) return false;
    if (category && !c.conditionType.toLowerCase().includes(category.replace(/s$/, "").toLowerCase())) return false;
    if (f.conditionType !== "All" && c.conditionType !== f.conditionType) return false;
    if (f.sourceAuthority !== "All" && c.authority !== f.sourceAuthority) return false;
    if (f.freshness !== "All" && c.freshness !== f.freshness) return false;
    if (q && !`${c.id} ${c.statement} ${c.conditionType} ${c.owner}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export const nf = (n: number) => n.toLocaleString("en-US");
