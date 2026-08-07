/**
 * Cloud FinOps Persona Attribute Store — canonical demo data layer.
 *
 * The canonical representation is STRUCTURED ATTRIBUTE RECORDS.
 * Semantic vectors and graph projections are retrieval aids only.
 * No backend, no embeddings, no LLM required.
 */

export type AttributeCategory =
  | "Data" | "Planning" | "Forecast" | "Budget" | "Value" | "Usage" | "Rate"
  | "Architecture" | "Anomaly" | "Governance" | "Lifecycle" | "Learning"
  | "Licensing" | "Sustainability" | "Controls" | "Decision";

export type AttributeType =
  | "Objective" | "Requirement" | "Condition" | "Constraint" | "Threshold" | "Risk"
  | "Control" | "Metric" | "Dependency" | "Evidence Requirement" | "Decision Rule"
  | "Approval Requirement" | "Escalation Trigger" | "Applicability Rule"
  | "Learning Trigger" | "Preference" | "Context Requirement";

export type Severity = "Low" | "Medium" | "High" | "Critical";

export type EvaluationResponse =
  | "Informational" | "Advisory" | "Review Required" | "Approval Required"
  | "Evidence Required" | "Blocked" | "Exception Required" | "Reassessment Required";

export type ApprovalState = "Draft" | "In Review" | "Approved" | "Superseded";
export type AttributeStatus = "Draft" | "Structured" | "Review Required" | "Published";
export type ValidationState = "Valid" | "Warning" | "Review Required";

export type RelationshipType =
  | "REQUIRES" | "GOVERNED_BY" | "AFFECTS" | "DEPENDS_ON" | "EVIDENCED_BY"
  | "RELATED_TO" | "ACTIVATES" | "CONSTRAINS" | "MEASURED_BY" | "TRIGGERS"
  | "SUPERSEDES" | "APPLIES_TO";

export type AttributeValue = string | number | null;

export interface AttributeApplicability {
  workTypes: string[];
  technologies: string[];
  services: string[];
  systems: string[];
  businessCapabilities: string[];
  environments: string[];
  regions: string[];
  lifecycleStages: string[];
  triggerTerms: string[];
}

export interface AttributeEvidenceRequirement {
  id: string;
  evidenceType: string;
  required: boolean;
  authorityPreference: string;
  freshnessRequirement?: string;
  description: string;
}

export interface AttributeRelationship {
  id: string;
  relationshipType: RelationshipType;
  targetType: string;
  targetId: string;
  confidence: number;
}

export interface AttributeProvenance {
  sourceArtifactId: string;
  sourceArtifactName: string;
  sourceVersion: string;
  sourcePage?: number;
  sourceSection: string;
  sourceStatement: string;
  sourceHash?: string;
}

export interface AttributeUsage {
  retrievalCount: number;
  impactEvaluations: number;
  decisionsUsing: number;
  lastQueried: string;
}

export interface AttributeVersionEntry {
  version: string;
  date: string;
  author: string;
  change: string;
}

export interface PersonaAttribute {
  id: string;
  personaId: string;
  personaVersion: string;
  category: AttributeCategory;
  name: string;
  primaryType: AttributeType;
  secondaryTypes: AttributeType[];
  statement: string;
  description?: string;
  purpose: string;
  whyFinOpsCares: string;
  subject?: string;
  predicate?: string;
  operator?: string;
  baseValue?: AttributeValue;
  targetValue?: AttributeValue;
  unit?: string;
  conditionExpression?: string;
  requiredState?: string;
  exceptionBehavior?: string;
  evaluationPriority: number;
  policyVariable?: string;
  severity: Severity;
  defaultResponse: EvaluationResponse;
  applicability: AttributeApplicability;
  evidence: AttributeEvidenceRequirement[];
  relationships: AttributeRelationship[];
  provenance: AttributeProvenance;
  usage: AttributeUsage;
  history: AttributeVersionEntry[];
  confidence: number;
  approvalState: ApprovalState;
  effectiveDate: string;
  expirationDate?: string;
  version: string;
  status: AttributeStatus;
  validationState: ValidationState;
}

export interface PolicyBinding {
  variable: string;
  description: string;
  currentValue: string;
  unit: string;
  owner: string;
  authority: string;
  effectiveDate: string;
  version: string;
  boundAttributes: string[];
  status: "Bound" | "Unresolved" | "Review Required";
  demoValue: boolean;
}

export interface WorkTypeMapping {
  workType: string;
  minimumAttributeSet: string[];
  primaryCategories: AttributeCategory[];
  typicalEvidence: string[];
  relevance: string;
  reviewPosture: EvaluationResponse;
  triggeredAttributes: string[];
}

export interface AttributeStoreQuality {
  score: number;
  structure: number;
  provenance: number;
  applicability: number;
  evidence: number;
  policyBinding: number;
  relationshipCoverage: number;
}

export interface PersonaAttributeStore {
  personaId: string;
  personaName: string;
  personaVersion: string;
  attributeStoreVersion: string;
  attributes: PersonaAttribute[];
  policyBindings: PolicyBinding[];
  workTypeMappings: WorkTypeMapping[];
  relationships: AttributeRelationship[];
  quality: AttributeStoreQuality;
  publishedAt?: string;
}

export const PERSONA_ID = "FINOPS-CLOUD-001";
export const PERSONA_ID_DISPLAY = "FINOPS CLOUD 001";
export const PERSONA_NAME = "Cloud FinOps Technologist";
export const PERSONA_VERSION = "1.0";
export const EFFECTIVE_DATE = "2026-08-07";

export const personaIdentity = {
  personaId: PERSONA_ID_DISPLAY,
  persona: PERSONA_NAME,
  personaType: "Technology Stakeholder Persona",
  primaryScope:
    "Public cloud, multi cloud, cloud native platforms, shared cloud services, cloud marketplaces, and cloud cost data",
  mission:
    "Maximize the business value of cloud usage by making cost, usage, allocation, commitments, forecasts, and tradeoffs visible and actionable.",
  decisionLens: ["Value", "Accountability", "Predictability", "Efficiency", "Commercial exposure", "Evidence quality"],
  defaultEngagement:
    "Consult Cloud FinOps when proposed work may materially change cloud usage, cost, allocation, commitments, architecture economics, billing data, or financial accountability.",
};

export const sourceDocument = {
  name: "Cloud FinOps Technologist Stakeholder Attribute Sheet",
  version: "1.0",
  personaId: PERSONA_ID_DISPLAY,
  pages: 30,
  sourceType: "Human Readable Stakeholder Attribute Sheet",
  status: "Parsed" as const,
  hash: "sha256:9f2c…c41a (placeholder)",
  created: "2026-07-28",
  owner: "Cloud FinOps Practice",
  provenanceState: "Verified — authored artifact",
  accessClassification: "Internal — Commercially Sensitive Sections Restricted",
  sections: [
    "Persona Identity", "Operating Mandate", "Decision Principles", "Relevance Triggers",
    "Cost Data", "Allocation", "Forecasting", "Budgeting", "Unit Economics", "Optimization",
    "Commitments", "Architecture Economics", "Anomalies", "Governance", "Lifecycle",
    "Evidence", "Dependencies", "Impact Taxonomy", "Decision Logic",
    "Master Attribute Register", "Work Type Trigger Matrix",
    "ECF Outbound Persona Evaluation Contract", "Framework Alignment",
  ],
};

export const attributeCategories: AttributeCategory[] = [
  "Data", "Planning", "Forecast", "Budget", "Value", "Usage", "Rate", "Architecture",
  "Anomaly", "Governance", "Lifecycle", "Learning", "Licensing", "Sustainability",
  "Controls", "Decision",
];

export const attributeTypes: AttributeType[] = [
  "Objective", "Requirement", "Condition", "Constraint", "Threshold", "Risk", "Control",
  "Metric", "Dependency", "Evidence Requirement", "Decision Rule", "Approval Requirement",
  "Escalation Trigger", "Applicability Rule", "Learning Trigger", "Preference", "Context Requirement",
];

export const relationshipTypes: RelationshipType[] = [
  "REQUIRES", "GOVERNED_BY", "AFFECTS", "DEPENDS_ON", "EVIDENCED_BY", "RELATED_TO",
  "ACTIVATES", "CONSTRAINS", "MEASURED_BY", "TRIGGERS", "SUPERSEDES", "APPLIES_TO",
];

/* ---------------------------------------------------------------------------
 * Seed register — the 80 atomic attributes decomposed from the source sheet.
 * Tuple: [n, category, name, primaryType, statement, opts]
 * ------------------------------------------------------------------------- */

type Seed = {
  n: number;
  category: AttributeCategory;
  name: string;
  type: AttributeType;
  statement: string;
  secondary?: AttributeType[];
  policyVariable?: string;
  severity?: Severity;
  response?: EvaluationResponse;
  section?: string;
  subject?: string;
  predicate?: string;
  operator?: string;
  evidence?: string[];
  workTypes?: string[];
  technologies?: string[];
  related?: number[];
};

const S = (
  n: number, category: AttributeCategory, name: string, type: AttributeType,
  statement: string, opts: Partial<Seed> = {},
): Seed => ({ n, category, name, type, statement, ...opts });

const seeds: Seed[] = [
  // ---- Data (001–010) -----------------------------------------------------
  S(1, "Data", "Billing Data Availability", "Requirement", "Authoritative provider billing and usage data must be available for the affected accounts and scope.", { section: "Cost Data", severity: "High", response: "Evidence Required", evidence: ["provider_billing_export", "account_inventory"], related: [2, 5, 6] }),
  S(2, "Data", "Billing Pipeline Integrity", "Constraint", "Changes to the cloud billing ingestion pipeline must preserve schema, lineage, and reconciliation.", { section: "Cost Data", severity: "Critical", response: "Blocked", evidence: ["pipeline_schema", "reconciliation_report"], workTypes: ["Cloud Billing Pipeline Change"], related: [1, 9] }),
  S(3, "Data", "Account and Scope Mapping", "Requirement", "Cost scope must be resolvable to accounts, subscriptions, projects, or resource groups.", { section: "Allocation", severity: "Medium", response: "Review Required", evidence: ["account_inventory"], related: [4, 7] }),
  S(4, "Data", "Tagging Coverage", "Threshold", "Cost bearing resources must meet tagging or labelling coverage policy for allocation.", { section: "Allocation", policyVariable: "finops.allocation.minimum_coverage", severity: "High", response: "Review Required", evidence: ["tag_coverage_report"], related: [3, 7, 8] }),
  S(5, "Data", "Cost Observability", "Requirement", "Material cost effect must be measurable at the decision scope.", { section: "Cost Data", severity: "High", response: "Blocked", evidence: ["cost_dataset", "reporting_view"], related: [1, 6, 47] }),
  S(6, "Data", "Data Freshness", "Condition", "Cost and usage data must meet freshness policy for the decision horizon.", { section: "Cost Data", policyVariable: "finops.data.freshness_sla", severity: "High", response: "Evidence Required", evidence: ["ingestion_latency_metric"], related: [1, 5, 10] }),
  S(7, "Data", "Allocation Rule Change", "Condition", "Allocation rule changes must identify affected consumers and restated reporting periods.", { section: "Allocation", severity: "High", response: "Review Required", workTypes: ["Allocation Rule Change"], evidence: ["allocation_rule_diff"], related: [3, 4, 9] }),
  S(8, "Data", "Shared Cost Treatment", "Requirement", "Shared and untaggable cost must have a documented, agreed distribution method.", { section: "Allocation", severity: "Medium", response: "Review Required", evidence: ["shared_cost_model"], related: [4, 41] }),
  S(9, "Data", "Historical Integrity", "Constraint", "Corrections and allocation rule changes must preserve effective dates and prior decision context.", { section: "Cost Data", severity: "Critical", response: "Blocked", evidence: ["restatement_log"], related: [2, 7] }),
  S(10, "Data", "Data Completeness", "Threshold", "Cost and usage coverage must meet completeness policy before conclusions are drawn.", { section: "Cost Data", policyVariable: "finops.data.completeness_threshold", severity: "High", response: "Evidence Required", evidence: ["coverage_report"], related: [6, 79] }),

  // ---- Planning (011–012) --------------------------------------------------
  S(11, "Planning", "Cost Estimate", "Requirement", "Material work requires a cost range and explicit usage and price assumptions.", { section: "Forecasting", severity: "High", response: "Review Required", policyVariable: "finops.materiality.cost_threshold", evidence: ["cost_estimate_model", "assumption_register"], related: [13, 14, 15, 77] }),
  S(12, "Planning", "Estimate Assumptions", "Evidence Requirement", "Estimates must state demand, price, architecture, and duration assumptions.", { section: "Forecasting", severity: "Medium", response: "Evidence Required", evidence: ["assumption_register"], related: [11, 77] }),

  // ---- Forecast (013–015) --------------------------------------------------
  S(13, "Forecast", "Forecast Update", "Condition", "Sustained demand or architecture changes must be reflected in forecast.", { section: "Forecasting", severity: "High", response: "Review Required", policyVariable: "finops.forecast.variance_threshold", evidence: ["updated_demand_forecast"], related: [11, 14, 16] }),
  S(14, "Forecast", "Demand Driver", "Dependency", "Recurring cost change must be traceable to an identified demand driver.", { section: "Forecasting", severity: "Medium", response: "Evidence Required", evidence: ["demand_driver_model"], related: [13, 18] }),
  S(15, "Forecast", "Funding Source", "Requirement", "Material recurring spend increase must identify a funding source or budget owner.", { section: "Budgeting", severity: "High", response: "Approval Required", evidence: ["budget_owner_confirmation"], related: [16, 17] }),

  // ---- Budget (016–017) ----------------------------------------------------
  S(16, "Budget", "Variance Threshold", "Threshold", "Budget and forecast variance must remain within policy or be approved.", { section: "Budgeting", policyVariable: "finops.budget.variance_threshold", severity: "High", response: "Approval Required", evidence: ["budget_actuals"], related: [13, 15, 17] }),
  S(17, "Budget", "Budget Owner Accountability", "Requirement", "Every material cost centre change must have a named accountable budget owner.", { section: "Budgeting", severity: "Medium", response: "Review Required", evidence: ["ownership_register"], related: [15, 16] }),

  // ---- Value (018–020) -----------------------------------------------------
  S(18, "Value", "Unit Cost", "Metric", "Change to cost per value unit should be modeled and monitored.", { section: "Unit Economics", policyVariable: "finops.unit_cost.variance_threshold", severity: "Medium", response: "Advisory", evidence: ["unit_economics_model"], related: [14, 19, 60] }),
  S(19, "Value", "Value Unit Definition", "Context Requirement", "The business value unit used for unit economics must be defined and agreed.", { section: "Unit Economics", severity: "Medium", response: "Review Required", evidence: ["unit_definition"], related: [18] }),
  S(20, "Value", "Cost of Delay", "Decision Rule", "Where relevant, the financial cost of not proceeding should be expressed.", { section: "Decision Logic", severity: "Low", response: "Advisory", related: [75] }),

  // ---- Usage (021–028) -----------------------------------------------------
  S(21, "Usage", "Rightsizing", "Requirement", "Provisioned capacity should be justified against observed utilization.", { section: "Optimization", severity: "Medium", response: "Review Required", technologies: ["Kubernetes", "Compute"], evidence: ["utilization_metrics"], related: [22, 27] }),
  S(22, "Usage", "Autoscaling", "Control", "Scaling limits should be explicit where runaway consumption is possible.", { section: "Optimization", severity: "High", response: "Review Required", technologies: ["Kubernetes", "AI / GPU"], evidence: ["scaling_policy"], related: [21, 69, 74] }),
  S(23, "Usage", "Idle Capacity", "Risk", "Persistent idle or orphaned capacity must be identified and remediated or accepted.", { section: "Optimization", severity: "Medium", response: "Review Required", evidence: ["idle_resource_report"], related: [21, 24] }),
  S(24, "Usage", "Non Production Scheduling", "Preference", "Non production environments should use scheduled shutdown where feasible.", { section: "Optimization", severity: "Low", response: "Advisory", related: [23] }),
  S(25, "Usage", "Storage Tiering", "Requirement", "Storage growth must have a lifecycle and tiering strategy.", { section: "Optimization", policyVariable: "finops.retention.materiality_threshold", severity: "Medium", response: "Review Required", workTypes: ["Storage Retention Increase", "Backup Change"], evidence: ["retention_policy"], related: [26, 66] }),
  S(26, "Usage", "Observability Volume", "Condition", "Logging, metrics, and tracing volume increases must model recurring cost.", { section: "Optimization", severity: "Medium", response: "Review Required", workTypes: ["Logging or Observability Expansion"], technologies: ["Kubernetes"], evidence: ["telemetry_volume_projection"], related: [25, 47] }),
  S(27, "Usage", "Optimization Tradeoff", "Constraint", "Savings must not violate required reliability, security, performance, or compliance boundaries.", { section: "Optimization", secondary: ["Decision Rule"], severity: "Critical", response: "Blocked", evidence: ["slo_impact_assessment"], related: [21, 22, 69] }),
  S(28, "Usage", "Spot and Preemptible Use", "Condition", "Interruptible capacity adoption must match workload tolerance.", { section: "Optimization", severity: "Medium", response: "Review Required", workTypes: ["Spot Adoption"], evidence: ["workload_interruption_tolerance"], related: [27, 29] }),

  // ---- Rate (029–036) ------------------------------------------------------
  S(29, "Rate", "Commitment Interaction", "Condition", "Architecture change must evaluate impact to current commitment utilization and eligibility.", { section: "Master Attribute Register", secondary: ["Dependency"], severity: "High", response: "Review Required", subject: "cloud_architecture_change", predicate: "affects_commitment_position", operator: "evaluate", evidence: ["current_commitment_inventory", "commitment_utilization", "eligible_demand_forecast"], related: [30, 31, 33] }),
  S(30, "Rate", "New Commitment", "Approval Requirement", "New long duration commitment requires demand confidence and architecture stability.", { section: "Commitments", severity: "High", response: "Approval Required", workTypes: ["Commitment Purchase"], evidence: ["demand_confidence_model"], related: [29, 31, 32] }),
  S(31, "Rate", "Commitment Utilization", "Threshold", "Commitment utilization must remain above the minimum utilization policy.", { section: "Commitments", policyVariable: "finops.commitment.minimum_utilization", severity: "High", response: "Review Required", evidence: ["commitment_utilization"], related: [29, 33] }),
  S(32, "Rate", "Commitment Coverage", "Threshold", "Coverage of eligible demand should track the target coverage policy.", { section: "Commitments", policyVariable: "finops.commitment.target_coverage", severity: "Medium", response: "Advisory", evidence: ["coverage_report"], related: [30, 31] }),
  S(33, "Rate", "Stranded Commitment", "Risk", "Migration or rightsizing that reduces eligible demand must evaluate stranded exposure.", { section: "Commitments", severity: "High", response: "Review Required", workTypes: ["Cloud Migration", "Region Expansion"], evidence: ["eligible_demand_forecast"], related: [29, 31, 37] }),
  S(34, "Rate", "Private Pricing", "Constraint", "Negotiated discounts and private pricing terms must be applied and respected in analysis.", { section: "Commitments", severity: "High", response: "Evidence Required", evidence: ["contract_rate_card"], related: [35, 56] }),
  S(35, "Rate", "Marketplace Spend", "Condition", "Marketplace or SaaS purchases must consider commitment drawdown eligibility.", { section: "Commitments", severity: "Medium", response: "Review Required", workTypes: ["Marketplace or SaaS Purchase"], evidence: ["marketplace_terms"], related: [34, 62] }),
  S(36, "Rate", "Contract Renewal Exposure", "Risk", "Work that changes demand near renewal must flag commercial negotiation exposure.", { section: "Commitments", severity: "Medium", response: "Advisory", related: [34, 30] }),

  // ---- Architecture (037–046) ---------------------------------------------
  S(37, "Architecture", "Region Placement", "Decision Rule", "Region changes require price, egress, resilience, latency, residency, and sustainability consideration.", { section: "Architecture Economics", severity: "High", response: "Review Required", workTypes: ["Region Expansion", "Multi Region HA", "Provider or Region Exit"], evidence: ["regional_price_model", "network_transfer_model"], related: [38, 39, 45, 68] }),
  S(38, "Architecture", "Data Transfer Cost", "Requirement", "Cross zone, cross region, and egress transfer cost must be modeled.", { section: "Architecture Economics", severity: "High", response: "Review Required", workTypes: ["Network Architecture Change"], evidence: ["network_transfer_model"], related: [37, 39] }),
  S(39, "Architecture", "Multi Region Duplication", "Condition", "Active duplication of workloads must state the recurring cost multiple.", { section: "Architecture Economics", severity: "Medium", response: "Review Required", workTypes: ["Multi Region HA", "DR Improvement"], evidence: ["duplication_cost_model"], related: [37, 38, 59] }),
  S(40, "Architecture", "Managed Service Premium", "Decision Rule", "Managed service adoption should compare total cost including operating effort.", { section: "Architecture Economics", severity: "Low", response: "Advisory", workTypes: ["Service Modernization"], related: [42] }),
  S(41, "Architecture", "Kubernetes Allocation", "Requirement", "Shared cluster cost needs workload or namespace allocation strategy where charge accountability is required.", { section: "Architecture Economics", severity: "High", response: "Review Required", workTypes: ["Kubernetes Change"], technologies: ["Kubernetes"], evidence: ["namespace_allocation_model"], related: [8, 22, 26] }),
  S(42, "Architecture", "Serverless Economics", "Condition", "Event driven designs must model invocation, duration, and concurrency cost behavior.", { section: "Architecture Economics", severity: "Medium", response: "Advisory", related: [40, 44] }),
  S(43, "Architecture", "Database Tier Economics", "Requirement", "Database tier and capacity changes must state recurring cost and licensing effect.", { section: "Architecture Economics", severity: "Medium", response: "Review Required", workTypes: ["Database Tier Change"], evidence: ["db_sizing_model"], related: [61, 62] }),
  S(44, "Architecture", "AI Accelerator Economics", "Requirement", "GPU or accelerator consumption, idle capacity, model hosting, inference demand, and commitment exposure should be explicit.", { section: "Architecture Economics", severity: "High", response: "Review Required", workTypes: ["AI or GPU Workload"], technologies: ["AI / GPU"], evidence: ["accelerator_demand_model"], related: [22, 29, 30, 69] }),
  S(45, "Architecture", "Resilience Cost Balance", "Constraint", "Resilience investment must be justified against the availability objective.", { section: "Architecture Economics", severity: "Medium", response: "Review Required", workTypes: ["DR Improvement"], related: [37, 39, 27] }),
  S(46, "Architecture", "Shared Platform Economics", "Requirement", "Shared platform launches must define chargeback or showback treatment.", { section: "Architecture Economics", severity: "Medium", response: "Review Required", workTypes: ["Shared Platform Launch"], related: [8, 41] }),

  // ---- Anomaly (047–049) ---------------------------------------------------
  S(47, "Anomaly", "Anomaly Detectability", "Control", "Material unexpected spend must be detectable at actionable granularity.", { section: "Anomalies", policyVariable: "finops.anomaly.materiality_threshold", severity: "High", response: "Review Required", evidence: ["anomaly_detection_config"], related: [5, 26, 69] }),
  S(48, "Anomaly", "Anomaly Ownership", "Requirement", "Detected cost anomalies must route to an accountable owner.", { section: "Anomalies", severity: "Medium", response: "Review Required", related: [47, 17] }),
  S(49, "Anomaly", "Anomaly Learning", "Learning Trigger", "Recurring anomaly patterns must feed guardrail and policy improvement.", { section: "Anomalies", severity: "Low", response: "Advisory", related: [47, 64] }),

  // ---- Governance (050–057) ------------------------------------------------
  S(50, "Governance", "FinOps Policy", "Constraint", "Work must comply with applicable FinOps policy or obtain an exception.", { section: "Governance", severity: "Critical", response: "Exception Required", evidence: ["policy_register"], related: [51, 52] }),
  S(51, "Governance", "Exception Expiry", "Requirement", "FinOps exceptions must be time bounded, owned, approved, and monitored.", { section: "Governance", severity: "High", response: "Approval Required", evidence: ["exception_record"], related: [50, 52] }),
  S(52, "Governance", "Approval Authority", "Approval Requirement", "Financial commitments must be approved at the correct authority level.", { section: "Governance", severity: "High", response: "Approval Required", related: [30, 50] }),
  S(53, "Governance", "Showback Transparency", "Requirement", "Consumers must be able to see the cost they cause.", { section: "Governance", severity: "Medium", response: "Advisory", related: [4, 8] }),
  S(54, "Governance", "Chargeback Change", "Condition", "Changes to chargeback treatment must notify affected owners before effect.", { section: "Governance", severity: "Medium", response: "Review Required", related: [7, 53] }),
  S(55, "Governance", "Segregation of Duties", "Control", "Purchase, approval, and consumption roles must remain appropriately separated.", { section: "Governance", severity: "High", response: "Review Required", related: [52, 56] }),
  S(56, "Governance", "Commercial Confidentiality", "Constraint", "Private rates and contract data must not be exposed beyond approved roles.", { section: "Governance", severity: "Critical", response: "Blocked", evidence: ["access_control_matrix"], related: [34, 55] }),
  S(57, "Governance", "Escalation Trigger", "Escalation Trigger", "Unresolved material financial exposure must escalate to financial governance.", { section: "Governance", severity: "High", response: "Reassessment Required", related: [50, 52] }),

  // ---- Lifecycle (058–059) -------------------------------------------------
  S(58, "Lifecycle", "Dual Run Period", "Requirement", "Migration plans must model temporary overlap cost and decommission date.", { section: "Lifecycle", severity: "High", response: "Review Required", workTypes: ["Cloud Migration", "Decommission"], evidence: ["migration_plan"], related: [33, 59] }),
  S(59, "Lifecycle", "Decommission Confirmation", "Requirement", "Retirement plans must confirm actual resource and commitment release.", { section: "Lifecycle", severity: "Medium", response: "Evidence Required", workTypes: ["Decommission"], evidence: ["decommission_evidence"], related: [58, 23] }),

  // ---- Learning (060–065) --------------------------------------------------
  S(60, "Learning", "Estimate vs Actual", "Learning Trigger", "Material implemented change should compare forecast and observed financial outcome.", { section: "Learning", severity: "Medium", response: "Advisory", evidence: ["post_implementation_actuals"], related: [11, 13, 18] }),
  S(61, "Licensing", "License Portability", "Condition", "Licensing implications of platform or tier change must be evaluated.", { section: "Licensing", severity: "Medium", response: "Review Required", workTypes: ["Database Tier Change", "Cloud Migration"], related: [43, 62] }),
  S(62, "Licensing", "Third Party Cost", "Requirement", "Third party and marketplace software cost must be included in total cost.", { section: "Licensing", severity: "Medium", response: "Review Required", workTypes: ["Marketplace or SaaS Purchase"], related: [35, 61] }),
  S(63, "Learning", "Benchmark Reuse", "Preference", "Comparable prior workloads should be used to sanity check estimates.", { section: "Learning", severity: "Low", response: "Advisory", related: [60, 78] }),
  S(64, "Learning", "Policy Improvement", "Learning Trigger", "Repeated cost anomalies or evidence gaps should create candidate policy or Persona updates.", { section: "Learning", severity: "Medium", response: "Advisory", related: [49, 79] }),
  S(65, "Sustainability", "Carbon Cost Signal", "Metric", "Where available, carbon intensity should accompany region and capacity decisions.", { section: "Framework Alignment", severity: "Low", response: "Informational", related: [37, 68] }),

  // ---- Controls (066–074) --------------------------------------------------
  S(66, "Controls", "Retention Control", "Control", "Data retention increases must have bounded retention and review dates.", { section: "Governance", policyVariable: "finops.retention.materiality_threshold", severity: "Medium", response: "Review Required", workTypes: ["Storage Retention Increase"], related: [25, 69] }),
  S(67, "Controls", "Quota Control", "Control", "Quota increases must state expected consumption and monitoring.", { section: "Governance", policyVariable: "finops.quota.materiality_threshold", severity: "Medium", response: "Review Required", workTypes: ["Quota Increase"], related: [69, 74] }),
  S(68, "Sustainability", "Sustainability Tradeoff", "Decision Rule", "Region and capacity choices should expose sustainability tradeoffs where policy applies.", { section: "Framework Alignment", severity: "Low", response: "Advisory", workTypes: ["Region Expansion"], related: [37, 65] }),
  S(69, "Controls", "Spend Guardrail", "Control", "High variance services should have budgets, quotas, scaling limits, alerts, or other bounded controls where technically appropriate.", { section: "Governance", severity: "High", response: "Review Required", evidence: ["guardrail_config"], related: [22, 47, 67] }),
  S(70, "Controls", "Rollback Financial Trigger", "Control", "Material experiments should define cost or unit cost stop criteria where useful.", { section: "Governance", policyVariable: "finops.experiment.spend_limit", severity: "Medium", response: "Review Required", workTypes: ["Experiment"], related: [69, 77] }),
  S(71, "Controls", "Alert Routing", "Control", "Cost alerts must route to an owner able to act.", { section: "Governance", severity: "Low", response: "Advisory", related: [48, 69] }),
  S(72, "Controls", "Environment Separation", "Control", "Production and non production spend must be separately visible.", { section: "Allocation", severity: "Medium", response: "Review Required", related: [3, 24] }),
  S(73, "Controls", "Security Control Cost", "Condition", "Security control changes must state recurring cost effect.", { section: "Governance", severity: "Low", response: "Advisory", workTypes: ["Security Control Change"], related: [27, 69] }),
  S(74, "Controls", "Provider Service Limit", "Dependency", "Provider service limits that constrain scaling or savings must be identified.", { section: "Dependencies", severity: "Medium", response: "Review Required", technologies: ["Kubernetes"], related: [22, 67] }),

  // ---- Decision (075–080) --------------------------------------------------
  S(75, "Decision", "Do Nothing Alternative", "Decision Rule", "Material decision analysis should include current state cost and opportunity cost when relevant.", { section: "Decision Logic", severity: "Medium", response: "Advisory", related: [20, 77] }),
  S(76, "Decision", "Reversibility", "Preference", "Prefer reversible financial exposure when uncertainty is high unless business value requires otherwise.", { section: "Decision Logic", severity: "Medium", response: "Advisory", related: [30, 77] }),
  S(77, "Decision", "Scenario Sensitivity", "Decision Rule", "Material decisions should expose which demand, price, or architecture assumptions most change cost outcome.", { section: "Decision Logic", severity: "High", response: "Review Required", evidence: ["sensitivity_analysis"], related: [11, 13, 75] }),
  S(78, "Decision", "Prior Outcome Reuse", "Decision Rule", "Use prior estimate and actual outcomes when comparable.", { section: "Decision Logic", severity: "Low", response: "Advisory", related: [60, 63] }),
  S(79, "Decision", "Evidence Gap", "Evidence Requirement", "If cost conclusion depends on missing demand, pricing, allocation, or commitment evidence, return Evidence Required.", { section: "Decision Logic", severity: "High", response: "Evidence Required", related: [10, 64, 80] }),
  S(80, "Decision", "FinOps Confidence", "Requirement", "FinOps conclusion must expose confidence and main uncertainty drivers.", { section: "Decision Logic", severity: "High", response: "Review Required", related: [77, 79] }),
];

export const fopId = (n: number) => `FOP-${String(n).padStart(3, "0")}`;
export const fopDisplay = (n: number) => `FOP ${String(n).padStart(3, "0")}`;

const baseEnvironments = ["production", "preproduction"];

const workTypesForCategory: Record<AttributeCategory, string[]> = {
  Data: ["Cloud Billing Pipeline Change", "Allocation Rule Change"],
  Planning: ["New Cloud Service", "Feature Launch", "Scale Increase"],
  Forecast: ["Scale Increase", "Feature Launch"],
  Budget: ["Scale Increase", "Commitment Purchase"],
  Value: ["Feature Launch", "Service Modernization"],
  Usage: ["Scale Increase", "Scale Decrease", "Kubernetes Change"],
  Rate: ["Commitment Purchase", "Cloud Migration", "Region Expansion"],
  Architecture: ["Architecture Change", "Service Modernization", "Region Expansion"],
  Anomaly: ["Incident Mitigation", "Scale Increase"],
  Governance: ["Security Control Change", "Allocation Rule Change"],
  Lifecycle: ["Cloud Migration", "Decommission"],
  Learning: ["Experiment", "Feature Launch"],
  Licensing: ["Marketplace or SaaS Purchase", "Database Tier Change"],
  Sustainability: ["Region Expansion"],
  Controls: ["Quota Increase", "Experiment", "Kubernetes Change"],
  Decision: ["Architecture Change", "Cloud Migration", "Commitment Purchase"],
};

const priorityBySeverity: Record<Severity, number> = { Critical: 1, High: 2, Medium: 3, Low: 4 };

const reviewRequiredIds = new Set(["FOP-016", "FOP-047"]);

function buildEvidence(seed: Seed): AttributeEvidenceRequirement[] {
  const list = seed.evidence?.length ? seed.evidence : ["supporting_cost_analysis"];
  return list.map((e, i) => ({
    id: `${fopId(seed.n)}-EV-${i + 1}`,
    evidenceType: e,
    required: i === 0,
    authorityPreference: i === 0 ? "Authoritative provider or finance system of record" : "Team supplied analysis",
    freshnessRequirement: i === 0 ? "Within current billing period" : "Within 90 days",
    description: `${i === 0 ? "Required" : "Preferred"} evidence: ${e.replace(/_/g, " ")}.`,
  }));
}

function buildRelationships(seed: Seed): AttributeRelationship[] {
  const rels: AttributeRelationship[] = (seed.related ?? []).map((t, i) => ({
    id: `${fopId(seed.n)}-REL-${i + 1}`,
    relationshipType: "RELATED_TO",
    targetType: "PersonaAttribute",
    targetId: fopId(t),
    confidence: 0.9,
  }));
  if (seed.policyVariable) {
    rels.push({
      id: `${fopId(seed.n)}-REL-POL`,
      relationshipType: "GOVERNED_BY",
      targetType: "PolicyVariable",
      targetId: seed.policyVariable,
      confidence: 0.98,
    });
  }
  (seed.evidence ?? []).slice(0, 2).forEach((e, i) => {
    rels.push({
      id: `${fopId(seed.n)}-REL-EV${i + 1}`,
      relationshipType: "EVIDENCED_BY",
      targetType: "Evidence",
      targetId: e,
      confidence: 0.92,
    });
  });
  rels.push({
    id: `${fopId(seed.n)}-REL-CAT`,
    relationshipType: "APPLIES_TO",
    targetType: "Category",
    targetId: seed.category,
    confidence: 1,
  });
  return rels;
}

function buildAttribute(seed: Seed): PersonaAttribute {
  const id = fopId(seed.n);
  const severity = seed.severity ?? "Medium";
  const workTypes = Array.from(new Set([...(seed.workTypes ?? []), ...workTypesForCategory[seed.category]]));
  const technologies = Array.from(new Set([...(seed.technologies ?? []), "Public Cloud"]));
  const validationState: ValidationState = reviewRequiredIds.has(id)
    ? "Review Required"
    : seed.policyVariable && ["FOP-031", "FOP-068"].includes(id) ? "Warning" : "Valid";
  return {
    id,
    personaId: PERSONA_ID,
    personaVersion: PERSONA_VERSION,
    category: seed.category,
    name: seed.name,
    primaryType: seed.type,
    secondaryTypes: seed.secondary ?? [],
    statement: seed.statement,
    purpose: `Ensure ${seed.name.toLowerCase()} is explicitly considered before the enterprise commits to work with cloud financial consequences.`,
    whyFinOpsCares: `${seed.category} attributes protect value, accountability, predictability, and commercial exposure across the cloud estate.`,
    subject: seed.subject ?? `cloud_${seed.category.toLowerCase()}_change`,
    predicate: seed.predicate ?? `requires_${seed.type.toLowerCase().replace(/\s+/g, "_")}`,
    operator: seed.operator ?? (seed.type === "Threshold" ? "within" : "evaluate"),
    baseValue: null,
    targetValue: null,
    unit: seed.type === "Threshold" ? "policy defined" : undefined,
    conditionExpression: seed.policyVariable
      ? `${seed.subject ?? "work_item"} MUST satisfy ${seed.policyVariable}`
      : `${seed.subject ?? "work_item"} MUST satisfy ${id} statement`,
    requiredState: seed.type === "Constraint" ? "Compliant or approved exception" : "Assessed with evidence",
    exceptionBehavior: seed.response === "Blocked" ? "Time bounded, approved, monitored exception only" : "Documented rationale",
    evaluationPriority: priorityBySeverity[severity],
    policyVariable: seed.policyVariable,
    severity,
    defaultResponse: seed.response ?? "Review Required",
    applicability: {
      workTypes,
      technologies,
      services: ["Cloud Cost Management", "Cloud Platform Services"],
      systems: ["Cloud Billing Platform", "FinOps Analytics"],
      businessCapabilities: ["Cloud Financial Management", "Technology Planning"],
      environments: baseEnvironments,
      regions: ["Global"],
      lifecycleStages: ["Plan", "Build", "Run", "Retire"],
      triggerTerms: [seed.name.toLowerCase(), seed.category.toLowerCase()],
    },
    evidence: buildEvidence(seed),
    relationships: buildRelationships(seed),
    provenance: {
      sourceArtifactId: "ART-FINOPS-SAS-1",
      sourceArtifactName: sourceDocument.name,
      sourceVersion: sourceDocument.version,
      sourcePage: Math.min(30, 3 + Math.floor(seed.n / 3)),
      sourceSection: seed.section ?? "Master Attribute Register",
      sourceStatement: seed.statement,
      sourceHash: `sha256:${(seed.n * 7919).toString(16)}…placeholder`,
    },
    usage: {
      retrievalCount: 120 + ((seed.n * 37) % 900),
      impactEvaluations: 4 + (seed.n % 19),
      decisionsUsing: 2 + (seed.n % 11),
      lastQueried: `Today ${String(9 + (seed.n % 3)).padStart(2, "0")}:${String((seed.n * 7) % 60).padStart(2, "0")}`,
    },
    history: [
      { version: "0.9", date: "2026-07-29", author: "Decomposition Engine", change: "Atomic record created from source statement" },
      { version: "1.0", date: EFFECTIVE_DATE, author: "Cloud FinOps Practice", change: "Structure, evidence, and applicability approved" },
    ],
    confidence: Math.min(0.99, 0.86 + ((seed.n * 13) % 12) / 100),
    approvalState: validationState === "Review Required" ? "In Review" : "Approved",
    effectiveDate: EFFECTIVE_DATE,
    version: "1.0",
    status: validationState === "Review Required" ? "Review Required" : "Structured",
    validationState,
  };
}

export const attributes: PersonaAttribute[] = seeds
  .sort((a, b) => a.n - b.n)
  .map(buildAttribute);

export const attributeById = (id: string) => attributes.find((a) => a.id === id);

/* -------------------------------- Policy --------------------------------- */

const policySeed: Array<[string, string, string, string, string, PolicyBinding["status"], boolean]> = [
  ["finops.materiality.cost_threshold", "Monthly recurring cost above which FinOps evaluation is mandatory", "25,000", "USD / month", "Cloud Financial Governance", "Bound", true],
  ["finops.budget.variance_threshold", "Allowed budget variance before approval is required", "Unresolved", "%", "Finance Budget Office", "Unresolved", false],
  ["finops.forecast.variance_threshold", "Allowed forecast variance before forecast refresh is required", "10", "%", "Cloud Financial Governance", "Bound", true],
  ["finops.commitment.minimum_utilization", "Minimum acceptable commitment utilization", "Unresolved", "%", "Procurement & Commercial", "Unresolved", false],
  ["finops.commitment.target_coverage", "Target coverage of eligible commitment demand", "72", "%", "Procurement & Commercial", "Bound", true],
  ["finops.anomaly.materiality_threshold", "Spend deviation treated as a material anomaly", "Unresolved", "USD / day", "Cloud Financial Governance", "Unresolved", false],
  ["finops.allocation.minimum_coverage", "Minimum share of cost allocatable to an owner", "95", "%", "Cloud Financial Governance", "Bound", true],
  ["finops.data.freshness_sla", "Maximum acceptable age of cost and usage data", "24", "hours", "Cloud Data Platform", "Bound", true],
  ["finops.data.completeness_threshold", "Minimum cost and usage coverage for conclusions", "98", "%", "Cloud Data Platform", "Bound", true],
  ["finops.unit_cost.variance_threshold", "Allowed movement in cost per value unit", "8", "%", "Cloud FinOps Practice", "Bound", true],
  ["finops.quota.materiality_threshold", "Quota increase size that triggers FinOps review", "Unresolved", "% of current", "Cloud Platform Engineering", "Unresolved", false],
  ["finops.experiment.spend_limit", "Maximum experiment spend before stop criteria apply", "15,000", "USD", "Cloud FinOps Practice", "Bound", true],
  ["finops.retention.materiality_threshold", "Retention increase that triggers lifecycle review", "30", "% volume growth", "Cloud Data Platform", "Review Required", true],
];

export const policyBindings: PolicyBinding[] = policySeed.map(([variable, description, currentValue, unit, owner, status, demo]) => ({
  variable,
  description,
  currentValue,
  unit,
  owner,
  authority: owner === "Finance Budget Office" ? "Enterprise Finance" : "Cloud Financial Governance",
  effectiveDate: status === "Unresolved" ? "—" : EFFECTIVE_DATE,
  version: status === "Unresolved" ? "—" : "1.0",
  boundAttributes: attributes.filter((a) => a.policyVariable === variable).map((a) => a.id),
  status,
  demoValue: demo && status !== "Unresolved",
}));

export const policyVariableCount = 34; // includes derived and inherited variables in the full register

/* ------------------------------ Work types -------------------------------- */

const workTypeSeed: Array<[string, number[], AttributeCategory[], string[], string, EvaluationResponse]> = [
  ["New Cloud Service", [11, 13, 15, 18, 47, 69, 79, 80], ["Planning", "Forecast", "Controls"], ["Cost estimate", "Demand model"], "New recurring spend and new allocation surface", "Review Required"],
  ["Scale Increase", [11, 13, 14, 16, 21, 22, 31, 69, 80], ["Forecast", "Usage", "Rate"], ["Utilization metrics", "Forecast"], "Recurring spend and commitment position change", "Review Required"],
  ["Scale Decrease", [21, 23, 31, 33, 59, 60], ["Usage", "Rate", "Lifecycle"], ["Utilization metrics", "Commitment inventory"], "Stranded commitment and savings realization", "Review Required"],
  ["Region Expansion", [33, 37, 38, 39, 45, 68], ["Architecture", "Rate", "Sustainability"], ["Regional price model", "Transfer model"], "Region economics and egress exposure", "Review Required"],
  ["Multi Region HA", [37, 39, 45, 11, 16], ["Architecture", "Budget"], ["Duplication cost model"], "Duplicated recurring cost", "Review Required"],
  ["Cloud Migration", [11, 33, 34, 58, 59, 61, 37], ["Lifecycle", "Rate"], ["Migration plan", "Rate card"], "Dual run and commitment eligibility", "Approval Required"],
  ["Service Modernization", [18, 29, 40, 42, 43, 60], ["Value", "Architecture"], ["Unit economics model"], "Unit cost and architecture economics", "Review Required"],
  ["Database Tier Change", [43, 61, 62, 11, 16], ["Architecture", "Licensing"], ["Sizing model", "License terms"], "Licensing and tier economics", "Review Required"],
  ["Kubernetes Change", [22, 26, 29, 31, 41, 69, 74, 80], ["Usage", "Architecture", "Controls"], ["Namespace allocation", "Utilization"], "Shared cluster allocation and scaling exposure", "Review Required"],
  ["Storage Retention Increase", [25, 66, 26, 11], ["Usage", "Controls"], ["Retention policy", "Volume projection"], "Compounding storage growth", "Review Required"],
  ["Logging or Observability Expansion", [26, 47, 69, 11], ["Usage", "Anomaly"], ["Telemetry volume projection"], "Telemetry cost growth", "Review Required"],
  ["Network Architecture Change", [38, 37, 39, 11], ["Architecture"], ["Transfer model"], "Data transfer and egress", "Review Required"],
  ["AI or GPU Workload", [11, 13, 18, 22, 29, 30, 44, 69, 77], ["Architecture", "Rate", "Value"], ["Accelerator demand model"], "Accelerator economics and commitment exposure", "Approval Required"],
  ["Spot Adoption", [28, 27, 22, 31], ["Usage"], ["Interruption tolerance"], "Rate optimization versus reliability", "Review Required"],
  ["Commitment Purchase", [29, 30, 31, 32, 33, 34, 52], ["Rate", "Governance"], ["Commitment inventory", "Demand confidence"], "Long duration commercial exposure", "Approval Required"],
  ["Provider or Region Exit", [33, 37, 58, 59, 34], ["Rate", "Lifecycle"], ["Exit plan", "Contract terms"], "Stranded commitment and exit cost", "Approval Required"],
  ["Shared Platform Launch", [46, 8, 41, 53], ["Architecture", "Governance"], ["Chargeback model"], "Shared cost accountability", "Review Required"],
  ["DR Improvement", [39, 45, 11, 16], ["Architecture", "Budget"], ["RTO/RPO objective"], "Resilience cost balance", "Review Required"],
  ["Security Control Change", [73, 27, 69], ["Controls", "Governance"], ["Control cost estimate"], "Recurring control cost", "Advisory"],
  ["Incident Mitigation", [47, 48, 69, 57], ["Anomaly", "Controls"], ["Anomaly detection record"], "Emergency spend exposure", "Review Required"],
  ["Decommission", [58, 59, 23, 33], ["Lifecycle"], ["Decommission evidence"], "Savings realization confirmation", "Review Required"],
  ["Cloud Billing Pipeline Change", [1, 2, 6, 9, 10], ["Data"], ["Pipeline schema", "Reconciliation"], "Cost data integrity", "Blocked"],
  ["Allocation Rule Change", [3, 4, 7, 8, 9, 54], ["Data", "Governance"], ["Allocation rule diff"], "Restated accountability", "Review Required"],
  ["Marketplace or SaaS Purchase", [35, 62, 52, 34], ["Rate", "Licensing"], ["Marketplace terms"], "Commitment drawdown and third party cost", "Approval Required"],
  ["Quota Increase", [67, 69, 74, 22], ["Controls"], ["Consumption projection"], "Unbounded consumption risk", "Review Required"],
  ["Backup Change", [25, 66, 11], ["Usage", "Controls"], ["Retention policy"], "Storage lifecycle cost", "Review Required"],
  ["Feature Launch", [11, 13, 14, 18, 47, 80], ["Planning", "Forecast", "Value"], ["Demand model"], "New demand driver", "Review Required"],
  ["Experiment", [70, 69, 77, 60], ["Controls", "Decision"], ["Stop criteria"], "Bounded experimental spend", "Advisory"],
];

export const workTypeMappings: WorkTypeMapping[] = workTypeSeed.map(([workType, ids, cats, evidence, relevance, posture]) => ({
  workType,
  minimumAttributeSet: ids.slice(0, 6).map(fopDisplay),
  primaryCategories: cats,
  typicalEvidence: evidence,
  relevance,
  reviewPosture: posture,
  triggeredAttributes: ids.map(fopId),
}));

/* --------------------------- Applicability index -------------------------- */

export interface ApplicabilityEntry {
  dimension: string;
  value: string;
  attributes: string[];
  note: string;
}

export const applicabilityIndex: ApplicabilityEntry[] = [
  { dimension: "Technology", value: "Kubernetes", attributes: [21, 22, 26, 27, 29, 31, 41, 69, 74].map(fopId), note: "Shared cluster allocation, scaling, and commitment exposure" },
  { dimension: "Technology", value: "AI / GPU", attributes: [11, 13, 18, 22, 29, 30, 44, 69, 77].map(fopId), note: "Accelerator economics and commitment exposure" },
  { dimension: "Work Type", value: "Region Change", attributes: [33, 37, 38, 39, 45, 68].map(fopId), note: "Region economics, transfer, residency, sustainability" },
  { dimension: "Cloud Service", value: "Object Storage", attributes: [25, 66, 38, 10].map(fopId), note: "Retention, tiering, and transfer" },
  { dimension: "Architecture Pattern", value: "Event Driven / Serverless", attributes: [42, 40, 18, 11].map(fopId), note: "Invocation and concurrency cost behaviour" },
  { dimension: "Lifecycle Stage", value: "Retire", attributes: [58, 59, 23, 33].map(fopId), note: "Decommission and commitment release" },
  { dimension: "Financial Pattern", value: "Committed Spend", attributes: [29, 30, 31, 32, 33, 34].map(fopId), note: "Commitment position management" },
  { dimension: "Risk Signal", value: "Unbounded Consumption", attributes: [22, 67, 69, 74, 47].map(fopId), note: "Guardrails and detectability" },
  { dimension: "Business Capability", value: "Payments", attributes: [11, 13, 15, 37, 38, 39].map(fopId), note: "Critical capability cost sensitivity" },
];

/* ------------------------------ Decomposition ----------------------------- */

export interface DecompositionStage {
  id: string;
  name: string;
  processed: number;
  accepted: number;
  needsReview: number;
  rejected: number;
  confidence: number;
  detail: string;
}

export const decompositionStages: DecompositionStage[] = [
  { id: "sections", name: "Source Sections", processed: 22, accepted: 22, needsReview: 0, rejected: 0, confidence: 0.99, detail: "All 22 source sections parsed from the Stakeholder Attribute Sheet." },
  { id: "candidates", name: "Candidate Statements", processed: 136, accepted: 118, needsReview: 12, rejected: 6, confidence: 0.94, detail: "Human readable statements extracted before atomicity resolution." },
  { id: "atomic", name: "Atomic Attributes", processed: 80, accepted: 78, needsReview: 2, rejected: 0, confidence: 0.97, detail: "Individually addressable governed records FOP 001 – FOP 080." },
  { id: "evidence", name: "Evidence Mappings", processed: 143, accepted: 138, needsReview: 5, rejected: 0, confidence: 0.95, detail: "Required and preferred evidence attached to attributes." },
  { id: "applicability", name: "Applicability Mappings", processed: 218, accepted: 214, needsReview: 4, rejected: 0, confidence: 0.93, detail: "Work type, technology, environment, and lifecycle routing." },
  { id: "policy", name: "Policy Variables", processed: 34, accepted: 29, needsReview: 5, rejected: 0, confidence: 0.9, detail: "Organization specific thresholds bound to governed policy variables." },
  { id: "relationships", name: "Relationships", processed: 426, accepted: 424, needsReview: 2, rejected: 0, confidence: 0.96, detail: "Typed edges across attributes, policy, evidence, and categories." },
  { id: "validation", name: "Validation Issues", processed: 7, accepted: 0, needsReview: 7, rejected: 0, confidence: 1, detail: "Seven warnings, zero critical errors." },
];

/* -------------------------------- KPIs ------------------------------------ */

export interface StoreKpi {
  id: string;
  label: string;
  value: string;
  support: string;
  tooltip: string;
  status: "Healthy" | "Attention" | "Risk";
  trend: string;
  filter?: { key: string; value: string };
}

export const kpis: StoreKpi[] = [
  { id: "atomic", label: "Atomic Attributes", value: "80", support: "FOP 001 through FOP 080", tooltip: "Individually addressable governed attribute records.", status: "Healthy", trend: "+80 since draft", filter: { key: "all", value: "all" } },
  { id: "categories", label: "Attribute Categories", value: "16", support: "Data, Planning, Forecast, Budget, Value, Usage, Rate, Architecture, Anomaly, Governance, Lifecycle, Learning, Licensing, Sustainability, Controls, Decision", tooltip: "Category taxonomy used for routing and reporting.", status: "Healthy", trend: "Stable" },
  { id: "hard", label: "Hard Constraints", value: "12", support: "Blocked or mandatory conditions", tooltip: "Attributes whose default response blocks or requires an exception.", status: "Attention", trend: "+1", filter: { key: "severity", value: "Critical" } },
  { id: "evidence", label: "Evidence Requirements", value: "58", support: "Required and preferred evidence mappings", tooltip: "Distinct evidence requirements across the store.", status: "Healthy", trend: "+6" },
  { id: "triggers", label: "Work Type Triggers", value: "27", support: "Cloud service, scale, architecture, migration, Kubernetes, storage, AI, network, commitment, and other work types", tooltip: "Work types mapped to candidate attribute sets.", status: "Healthy", trend: "Stable" },
  { id: "policy", label: "Resolved Policy Variables", value: "84%", support: "16% awaiting organization specific threshold binding", tooltip: "Share of policy variables with an effective governed value.", status: "Attention", trend: "+9%", filter: { key: "policy", value: "Unresolved" } },
  { id: "quality", label: "Attribute Store Quality", value: "96 / 100", support: "Structure · Provenance · Applicability · Evidence · Policy Binding · Relationship Coverage", tooltip: "Composite structural quality score.", status: "Healthy", trend: "+3" },
];

export const quality: AttributeStoreQuality = {
  score: 96, structure: 99, provenance: 98, applicability: 95, evidence: 94, policyBinding: 84, relationshipCoverage: 97,
};

/* ------------------------------ Validation -------------------------------- */

export interface ValidationIssue {
  id: string;
  attribute: string;
  issueType: string;
  severity: "Warning" | "Critical" | "Info";
  description: string;
  recommendedAction: string;
  owner: string;
  status: "Open" | "Acknowledged" | "Resolved";
}

export const validationIssues: ValidationIssue[] = [
  { id: "VAL-01", attribute: "FOP-016", issueType: "Policy Binding Missing", severity: "Warning", description: "Budget variance threshold requires enterprise policy binding.", recommendedAction: "Bind finops.budget.variance_threshold", owner: "Finance Budget Office", status: "Open" },
  { id: "VAL-02", attribute: "FOP-031", issueType: "Policy Binding Missing", severity: "Warning", description: "Minimum commitment utilization threshold unresolved.", recommendedAction: "Bind finops.commitment.minimum_utilization", owner: "Procurement & Commercial", status: "Open" },
  { id: "VAL-03", attribute: "FOP-047", issueType: "Policy Binding Missing", severity: "Warning", description: "Material anomaly threshold unresolved.", recommendedAction: "Bind finops.anomaly.materiality_threshold", owner: "Cloud Financial Governance", status: "Open" },
  { id: "VAL-04", attribute: "FOP-068", issueType: "Applicability Review", severity: "Warning", description: "Sustainability region tradeoff depends on enterprise sustainability policy.", recommendedAction: "Add applicability for sustainability governed regions", owner: "Cloud FinOps Practice", status: "Open" },
  { id: "VAL-05", attribute: "FOP-067", issueType: "Policy Binding Missing", severity: "Warning", description: "Quota materiality threshold unresolved.", recommendedAction: "Bind finops.quota.materiality_threshold", owner: "Cloud Platform Engineering", status: "Open" },
  { id: "VAL-06", attribute: "FOP-026", issueType: "Evidence Mapping", severity: "Warning", description: "Telemetry volume projection has no authoritative source system.", recommendedAction: "Add evidence authority", owner: "Observability Engineering", status: "Acknowledged" },
  { id: "VAL-07", attribute: "FOP-009", issueType: "Historical Integrity", severity: "Warning", description: "Restatement log retention window shorter than decision retention window.", recommendedAction: "Extend restatement retention", owner: "Cloud Data Platform", status: "Open" },
];

export const validationDimensions = [
  { name: "Attribute ID Uniqueness", result: "80 / 80 unique", state: "Valid" },
  { name: "Atomicity", result: "80 atomic records", state: "Valid" },
  { name: "Statement Completeness", result: "80 / 80 complete", state: "Valid" },
  { name: "Type Classification", result: "80 classified", state: "Valid" },
  { name: "Category Classification", result: "16 categories", state: "Valid" },
  { name: "Evidence Mapping", result: "143 mappings", state: "Warning" },
  { name: "Applicability Mapping", result: "218 mappings", state: "Warning" },
  { name: "Policy Variable Binding", result: "29 / 34 resolved", state: "Warning" },
  { name: "Relationship Integrity", result: "426 edges resolved", state: "Valid" },
  { name: "Provenance Completeness", result: "80 / 80 traced", state: "Valid" },
  { name: "Historical Version Integrity", result: "1 warning", state: "Warning" },
  { name: "Approval State", result: "78 approved · 2 in review", state: "Warning" },
  { name: "Confidence", result: "Mean 0.94", state: "Valid" },
] as const;

/* ------------------------------ Publication -------------------------------- */

export const publicationDestinations = [
  "Persona Attribute Store", "Applicability Index", "Semantic Retrieval Index", "Context Graph Projection",
  "MCP Context Services", "Cognitive Intake", "Persona Impact Analysis", "Cross Team Impact Analysis", "Decision Intelligence",
];

export const publishSteps = [
  "Validate Persona", "Validate 80 Attributes", "Validate Evidence Mapping", "Validate Applicability",
  "Validate Policy Bindings", "Validate Relationships", "Validate Provenance", "Create Attribute Store Version",
  "Build Applicability Index", "Create Semantic Index Placeholder Metadata", "Create Graph Projection",
  "Publish Context Service Contract", "Complete",
];

/* ------------------------------ Contract ---------------------------------- */

export const contractFields = [
  "persona_id", "persona_version", "relevance", "relevance_reason", "triggered_attributes",
  "impact_dimensions", "conditions_triggered", "constraints", "required_evidence", "evidence_gaps",
  "cost_drivers", "forecast_impact", "budget_impact", "allocation_impact", "commitment_impact",
  "unit_economics_impact", "risks", "controls", "required_stakeholders", "recommended_actions",
  "expected_outcomes", "learning_triggers", "confidence", "supporting_evidence", "historical_context_version",
];

export const relevanceValues = [
  "Not Relevant", "Informational", "Advisory", "Review Required", "Approval Required",
  "Evidence Required", "Blocked", "Exception Required", "Reassessment Required",
];

export const contractExample = {
  workItem: "Expand payment processing workload from US East to US West",
  relevance: "Review Required",
  reason:
    "The proposed work materially changes recurring cloud spend, region economics, data transfer, and commitment eligible demand.",
  triggered: [11, 13, 15, 29, 33, 37, 38, 39].map(fopDisplay),
  primaryImpact: ["Forecast", "Budget", "Commitment Utilization", "Region Economics"],
  requiredEvidence: ["Updated Demand Forecast", "Current Commitment Inventory", "Regional Price Model", "Network Transfer Model"],
  reviewers: ["Cloud FinOps", "Finance Budget Owner", "Procurement when commercial action is required"],
  proceedCondition:
    "Proceed when funding, forecast, commitment exposure, and allocation are resolved, or when an approved exception exists.",
  observation:
    "Compare actual spend, unit cost, commitment utilization, and forecast variance during the governed observation window.",
};

/* --------------------------- Retrieval simulator --------------------------- */

export interface RetrievalCandidate {
  id: string;
  name: string;
  reason: string;
  applicabilityMatch: string;
  semanticMatch: string;
  relationshipMatch: string;
  priority: "P1" | "P2" | "P3";
  confidence: number;
}

export const defaultSimulatorWork =
  "Increase Kubernetes worker node retention and baseline capacity across production clusters to support peak commerce traffic.";

export function runCandidateRetrieval(input: {
  workType: string; environment: string; scaleDirection: string;
  architectureChange: string; recurringSpendChange: string; commitmentInteraction: string;
}): RetrievalCandidate[] {
  const mapping = workTypeMappings.find((m) => m.workType === input.workType);
  const base = new Set(mapping?.triggeredAttributes ?? []);
  if (input.recurringSpendChange === "Yes") [11, 13, 14, 15, 18].forEach((n) => base.add(fopId(n)));
  if (input.architectureChange === "Yes") [27, 41, 47].forEach((n) => base.add(fopId(n)));
  if (input.commitmentInteraction !== "No") [29, 31].forEach((n) => base.add(fopId(n)));
  if (input.scaleDirection === "Increase") [21, 22, 26, 69, 74].forEach((n) => base.add(fopId(n)));
  [77, 79, 80].forEach((n) => base.add(fopId(n)));

  return Array.from(base)
    .sort()
    .map((id) => {
      const a = attributeById(id);
      return {
        id,
        name: a?.name ?? id,
        reason: mapping?.triggeredAttributes.includes(id)
          ? `Work type mapping: ${input.workType}`
          : "Signal driven applicability match",
        applicabilityMatch: `${input.workType} · ${input.environment}`,
        semanticMatch: "Semantic index placeholder — not yet computed",
        relationshipMatch: `${a?.relationships.length ?? 0} typed edges`,
        priority: (a?.severity === "Critical" ? "P1" : a?.severity === "High" ? "P1" : a?.severity === "Medium" ? "P2" : "P3") as "P1" | "P2" | "P3",
        confidence: a?.confidence ?? 0.9,
      };
    });
}

/* ------------------------------ Graph ------------------------------------- */

export interface GraphNode { id: string; label: string; kind: "Persona" | "Category" | "Attribute" | "Policy" | "Evidence"; }
export interface GraphEdge { from: string; to: string; type: RelationshipType; }

export const graphNodes: GraphNode[] = [
  { id: "persona", label: "Cloud FinOps Persona", kind: "Persona" },
  ...["Cost Data", "Allocation", "Forecast", "Budget", "Unit Economics", "Usage", "Commitments", "Architecture", "Governance", "Controls", "Learning", "Decision Logic"]
    .map((c) => ({ id: `cat:${c}`, label: c, kind: "Category" as const })),
  ...[13, 16, 29, 33, 37, 41, 60, 79].map((n) => ({ id: fopId(n), label: `${fopDisplay(n)} ${attributeById(fopId(n))?.name}`, kind: "Attribute" as const })),
  { id: "pol:budget", label: "finops.budget.variance_threshold", kind: "Policy" },
  { id: "ev:demand", label: "Demand Driver Evidence", kind: "Evidence" },
];

export const graphEdges: GraphEdge[] = [
  ...["Cost Data", "Allocation", "Forecast", "Budget", "Unit Economics", "Usage", "Commitments", "Architecture", "Governance", "Controls", "Learning", "Decision Logic"]
    .map((c) => ({ from: "persona", to: `cat:${c}`, type: "APPLIES_TO" as RelationshipType })),
  { from: "FOP-013", to: "ev:demand", type: "REQUIRES" },
  { from: "FOP-016", to: "pol:budget", type: "GOVERNED_BY" },
  { from: "FOP-029", to: "FOP-033", type: "RELATED_TO" },
  { from: "FOP-037", to: "cat:Architecture", type: "AFFECTS" },
  { from: "FOP-041", to: "cat:Allocation", type: "REQUIRES" },
  { from: "FOP-060", to: "cat:Learning", type: "TRIGGERS" },
  { from: "FOP-079", to: "cat:Decision Logic", type: "CONSTRAINS" },
];

/* ------------------------------ Activity ---------------------------------- */

export interface ActivityEntry { time: string; text: string }

export const seedActivity: ActivityEntry[] = [
  { time: "10:22 AM", text: "FOP 029 Commitment Interaction relationship mapping validated" },
  { time: "10:18 AM", text: "Kubernetes Change trigger mapping updated" },
  { time: "10:14 AM", text: "FOP 016 bound to budget variance policy variable" },
  { time: "10:09 AM", text: "FOP 047 anomaly policy binding marked Review Required" },
  { time: "10:06 AM", text: "80 atomic attributes passed ID uniqueness validation" },
  { time: "10:03 AM", text: "Cloud FinOps Attribute Store preview recalculated" },
  { time: "9:58 AM", text: "Source document version 1.0 parsed" },
  { time: "9:52 AM", text: "Attribute Store version 1.0 draft created" },
];

/* ------------------------------ Schema ------------------------------------ */

export const schemaTables = [
  "persona", "persona_attribute", "persona_attribute_applicability", "persona_attribute_evidence",
  "persona_attribute_relationship", "persona_policy_binding", "persona_work_type_mapping",
  "persona_attribute_version", "persona_attribute_provenance", "persona_attribute_usage",
];

export const schemaSql = `CREATE TABLE persona_attribute (
  id TEXT PRIMARY KEY,
  persona_id TEXT NOT NULL,
  persona_version TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  primary_type TEXT NOT NULL,
  statement TEXT NOT NULL,
  subject TEXT,
  predicate TEXT,
  operator TEXT,
  base_value JSONB,
  target_value JSONB,
  unit TEXT,
  policy_variable TEXT,
  severity TEXT,
  default_response TEXT,
  confidence NUMERIC,
  approval_state TEXT,
  effective_date TIMESTAMP,
  expiration_date TIMESTAMP,
  version TEXT NOT NULL,
  metadata JSONB
);

CREATE INDEX idx_persona_attribute_persona ON persona_attribute(persona_id);
CREATE INDEX idx_persona_attribute_category ON persona_attribute(category);
CREATE INDEX idx_persona_attribute_type ON persona_attribute(primary_type);
CREATE INDEX idx_persona_attribute_policy ON persona_attribute(policy_variable);
CREATE INDEX idx_persona_attribute_metadata ON persona_attribute USING GIN(metadata);

-- Optional Retrieval Index — Not Canonical Knowledge
-- ALTER TABLE persona_attribute ADD COLUMN embedding VECTOR(1536);`;

/* ------------------------------ Canonical JSON ---------------------------- */

export function canonicalRecord(a: PersonaAttribute) {
  return {
    attribute_id: a.id,
    persona_id: a.personaId,
    persona_version: a.personaVersion,
    category: a.category.toLowerCase(),
    attribute_name: a.name,
    attribute_type: a.primaryType.toLowerCase(),
    statement: a.statement,
    subject: a.subject ?? null,
    predicate: a.predicate ?? null,
    operator: a.operator ?? null,
    base_value: a.baseValue ?? null,
    target_value: a.targetValue ?? null,
    policy_variable: a.policyVariable ?? null,
    severity: a.severity.toLowerCase(),
    default_response: a.defaultResponse.toLowerCase().replace(/\s+/g, "_"),
    applicability: {
      work_types: a.applicability.workTypes.map((w) => w.toLowerCase().replace(/\s+/g, "_")),
      environments: a.applicability.environments,
    },
    required_evidence: a.evidence.filter((e) => e.required).map((e) => e.evidenceType),
    relationships: a.relationships
      .filter((r) => r.targetType === "PersonaAttribute")
      .map((r) => ({ type: r.relationshipType, target: r.targetId })),
    provenance: {
      source_artifact: a.provenance.sourceArtifactName,
      source_version: a.provenance.sourceVersion,
      source_section: a.provenance.sourceSection,
    },
    confidence: Number(a.confidence.toFixed(2)),
    approval_state: a.approvalState.toLowerCase().replace(/\s+/g, "_"),
    effective_date: a.effectiveDate,
  };
}

/* ------------------------------ Demo scenarios ---------------------------- */

export interface DemoScenario {
  id: string;
  name: string;
  storeStatus: StoreStatus;
  kpiOverrides: Partial<Record<string, string>>;
  banner: string;
  validationDelta?: number;
  activity: string;
}

export type StoreStatus =
  | "Draft" | "Decomposing" | "Validation Required" | "Review Required"
  | "Ready to Publish" | "Published" | "Superseded";

export const demoScenarios: DemoScenario[] = [
  { id: "healthy", name: "Healthy Attribute Store", storeStatus: "Ready to Publish", kpiOverrides: {}, banner: "All structural dimensions healthy. Five policy variables remain unresolved.", activity: "Healthy attribute store scenario loaded" },
  { id: "source-updated", name: "Source Document Updated", storeStatus: "Validation Required", kpiOverrides: { quality: "91 / 100" }, banner: "Stakeholder Attribute Sheet version 1.1 detected. Re-decomposition recommended.", validationDelta: 3, activity: "Source document version 1.1 detected" },
  { id: "decomposing", name: "Attribute Decomposition Running", storeStatus: "Decomposing", kpiOverrides: { atomic: "62" }, banner: "Decomposition in progress. Attribute registry is partially populated.", activity: "Decomposition run started" },
  { id: "policy-unresolved", name: "Unresolved Policy Binding", storeStatus: "Review Required", kpiOverrides: { policy: "71%" }, banner: "Nine policy variables are unresolved. Threshold attributes will return Evidence Required.", validationDelta: 4, activity: "Policy binding gap detected" },
  { id: "evidence-missing", name: "Evidence Mapping Missing", storeStatus: "Validation Required", kpiOverrides: { evidence: "44" }, banner: "Fourteen attributes have no authoritative evidence source.", validationDelta: 5, activity: "Evidence mapping gap detected" },
  { id: "applicability-missing", name: "Applicability Missing", storeStatus: "Validation Required", kpiOverrides: { triggers: "19" }, banner: "Eight work types have no minimum attribute set.", validationDelta: 4, activity: "Applicability gap detected" },
  { id: "relationship-conflict", name: "Relationship Conflict", storeStatus: "Review Required", kpiOverrides: { quality: "88 / 100" }, banner: "Conflicting SUPERSEDES edges detected between FOP 031 and FOP 032.", validationDelta: 2, activity: "Relationship conflict detected" },
  { id: "historical", name: "Historical Integrity Warning", storeStatus: "Review Required", kpiOverrides: {}, banner: "Restatement retention is shorter than the decision retention window.", validationDelta: 1, activity: "Historical integrity warning raised" },
  { id: "validated", name: "Validation Complete", storeStatus: "Ready to Publish", kpiOverrides: { quality: "97 / 100" }, banner: "Validation complete. Zero critical errors.", validationDelta: -3, activity: "Validation completed" },
  { id: "ready", name: "Ready to Publish", storeStatus: "Ready to Publish", kpiOverrides: {}, banner: "Attribute store version 1.0 is ready with warnings.", activity: "Attribute store marked ready to publish" },
  { id: "published", name: "Attribute Store Published", storeStatus: "Published", kpiOverrides: { quality: "96 / 100" }, banner: "Attribute store version 1.0 published to governed consumers.", activity: "Attribute store published" },
  { id: "new-version", name: "New Persona Version Detected", storeStatus: "Superseded", kpiOverrides: {}, banner: "Persona version 1.1 detected. Version 1.0 attribute store is superseded.", activity: "Persona version 1.1 detected" },
  { id: "reset", name: "Reset Demo Data", storeStatus: "Ready to Publish", kpiOverrides: {}, banner: "Demo data reset to the seeded baseline.", activity: "Demo data reset" },
];

/* ------------------------------ Demo story -------------------------------- */

export interface StoryStep { id: string; target: string; caption: string; notes: string }

export const storySteps: StoryStep[] = [
  { id: "s1", target: "panel-source", caption: "The Cloud FinOps Stakeholder Attribute Sheet is the human readable expression of how FinOps thinks, what it requires, and what other teams must consider.", notes: "Anchor the audience on the human artifact before showing decomposition." },
  { id: "s2", target: "panel-decomposition", caption: "Rather than giving an agent a thirty page document every time, ECF decomposes the persona into individually addressable attributes.", notes: "Emphasise atomicity over arbitrary RAG chunking." },
  { id: "s3", target: "panel-registry", caption: "Each requirement becomes an atomic governed record with meaning, applicability, evidence, provenance, and decision behavior.", notes: "Open FOP 029 to show the record structure." },
  { id: "s4", target: "panel-policy", caption: "Organization specific thresholds are not hard coded into the persona. Attributes bind to the policy values effective at evaluation time.", notes: "Show unresolved bindings as governance work, not defects." },
  { id: "s5", target: "panel-worktype", caption: "The Fabric can quickly narrow eighty FinOps attributes to the subset likely to matter for a particular type of work.", notes: "Kubernetes Change is the strongest example." },
  { id: "s6", target: "panel-simulator", caption: "A proposed Kubernetes change retrieves a focused candidate set of FinOps attributes before detailed evaluation begins.", notes: "Run the simulator live." },
  { id: "s7", target: "panel-graph", caption: "Each candidate retains evidence requirements and relationships to conditions, risks, controls, and other attributes.", notes: "Relationships enable dependency reasoning." },
  { id: "s8", target: "panel-architecture", caption: "Structured records are the canonical knowledge. Semantic vectors help retrieve them, graph relationships help connect them, and MCP can govern how agents access them.", notes: "MCP is access, not storage." },
  { id: "s9", target: "panel-contract", caption: "The Persona Attribute Store ultimately produces a consistent evaluation contract for Cognitive Intake, Persona Impact Analysis, Cross Team Impact Analysis, and Decision Intelligence.", notes: "Contract is the downstream integration surface." },
  { id: "s10", target: "panel-publication", caption: "The Cloud FinOps Persona is now an operational enterprise context service rather than a static document.", notes: "Publish to close the story." },
];

export const attributeStore: PersonaAttributeStore = {
  personaId: PERSONA_ID,
  personaName: PERSONA_NAME,
  personaVersion: PERSONA_VERSION,
  attributeStoreVersion: "1.0",
  attributes,
  policyBindings,
  workTypeMappings,
  relationships: attributes.flatMap((a) => a.relationships),
  quality,
};

/** Deterministic in-memory repository abstraction (PostgreSQL/JSONB compatible target). */
export const PersonaAttributeRepository = {
  list: () => attributes,
  get: (id: string) => attributeById(id),
  byCategory: (c: AttributeCategory) => attributes.filter((a) => a.category === c),
  byPolicyVariable: (v: string) => attributes.filter((a) => a.policyVariable === v),
  byWorkType: (w: string) => attributes.filter((a) => a.applicability.workTypes.includes(w)),
  store: () => attributeStore,
};
