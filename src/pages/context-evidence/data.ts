// Canonical mock model for the Context / Evidence Layer tenant administration
// plane. All numbers are internally consistent: source rows drive the KPI
// counts, quality aggregate, entity emphasis and pipeline throughput.

export type Health = "Healthy" | "Degraded" | "Inactive" | "Error";
export type Classification = "Public" | "Internal" | "Confidential" | "Restricted" | "Licensed";

export interface SourceRow {
  id: string;
  name: string;
  domain: string;
  type: string;
  connector: string;
  status: Health;
  statusReason?: string;
  lastIngest: string;
  objects: number;
  objectsLabel: string;
  freshness: number;
  freshnessSla: number;
  quality: number;
  qualityParts: Record<string, number>;
  classification: Classification;
  region: string;
  owner: string;
  description: string;
  auth: string;
  authState: string;
  lastSuccessfulJob: string;
  failures: number;
  throughput: string;
  contextProfiles: number;
  coworkers: string[];
  pii: "Detected" | "None" | "Masked";
}

export const SOURCES: SourceRow[] = [
  {
    id: "SRC-SNW-001", name: "Snowflake, Underwriting", domain: "Underwriting", type: "Database",
    connector: "Snowflake", status: "Healthy", lastIngest: "2 min ago", objects: 2_300_000,
    objectsLabel: "2.3M", freshness: 98, freshnessSla: 90, quality: 96,
    qualityParts: { Completeness: 97, Accuracy: 96, Consistency: 95, Timeliness: 98, Validity: 96, Uniqueness: 94, Provenance: 99, Conformity: 97 },
    classification: "Confidential", region: "US East", owner: "Data Engineering",
    description: "Governed underwriting warehouse: submissions, pricing, bound policy facts.",
    auth: "OAuth Service Principal", authState: "Valid · rotates in 54 days",
    lastSuccessfulJob: "2026-08-11 10:32:14 UTC", failures: 7, throughput: "284 objects/sec",
    contextProfiles: 14, coworkers: ["Underwriting Assistant", "Policy Change Assistant", "Risk Analyst"], pii: "Detected",
  },
  {
    id: "SRC-S3-002", name: "S3, Submissions", domain: "Underwriting", type: "Object Store",
    connector: "AWS S3", status: "Healthy", lastIngest: "5 min ago", objects: 4_700_000,
    objectsLabel: "4.7M", freshness: 97, freshnessSla: 90, quality: 93,
    qualityParts: { Completeness: 94, Accuracy: 92, Consistency: 91, Timeliness: 97, Validity: 93, Uniqueness: 90, Provenance: 99, Conformity: 94 },
    classification: "Confidential", region: "US East", owner: "Data Engineering",
    description: "Raw broker submission packages, ACORD forms, SOVs and loss runs.",
    auth: "IAM Role Assumption", authState: "Valid",
    lastSuccessfulJob: "2026-08-11 10:29:02 UTC", failures: 12, throughput: "512 objects/sec",
    contextProfiles: 11, coworkers: ["Underwriting Assistant", "Submission Triage"], pii: "Detected",
  },
  {
    id: "SRC-SPO-003", name: "SharePoint, Policies", domain: "Policy", type: "Document",
    connector: "SharePoint", status: "Healthy", lastIngest: "12 min ago", objects: 1_200_000,
    objectsLabel: "1.2M", freshness: 99, freshnessSla: 90, quality: 95,
    qualityParts: { Completeness: 96, Accuracy: 95, Consistency: 94, Timeliness: 99, Validity: 95, Uniqueness: 92, Provenance: 98, Conformity: 96 },
    classification: "Internal", region: "US East", owner: "Policy Operations",
    description: "Policy wordings, endorsements, forms library and operating procedures.",
    auth: "Entra ID App Registration", authState: "Valid",
    lastSuccessfulJob: "2026-08-11 10:22:41 UTC", failures: 0, throughput: "96 objects/sec",
    contextProfiles: 9, coworkers: ["Policy Change Assistant", "Compliance Reviewer"], pii: "None",
  },
  {
    id: "SRC-SNOW-004", name: "ServiceNow", domain: "IT Operations", type: "ITSM",
    connector: "ServiceNow", status: "Degraded", statusReason: "OAuth token expires in 2 hours.",
    lastIngest: "3 min ago", objects: 1_100_000, objectsLabel: "1.1M", freshness: 96, freshnessSla: 90, quality: 94,
    qualityParts: { Completeness: 95, Accuracy: 94, Consistency: 93, Timeliness: 96, Validity: 94, Uniqueness: 93, Provenance: 99, Conformity: 95 },
    classification: "Internal", region: "US East", owner: "IT Service Management",
    description: "Incidents, changes, problems, CMDB CIs and service ownership records.",
    auth: "OAuth 2.0", authState: "Expiring — rotate credential",
    lastSuccessfulJob: "2026-08-11 10:31:07 UTC", failures: 3, throughput: "142 objects/sec",
    contextProfiles: 8, coworkers: ["SRE Copilot", "Change Reviewer"], pii: "None",
  },
  {
    id: "SRC-DC-005", name: "Duck Creek PolicyCenter", domain: "Insurance", type: "Policy Administration",
    connector: "REST API", status: "Healthy", lastIngest: "7 min ago", objects: 854_000,
    objectsLabel: "854K", freshness: 95, freshnessSla: 90, quality: 92,
    qualityParts: { Completeness: 93, Accuracy: 92, Consistency: 90, Timeliness: 95, Validity: 92, Uniqueness: 91, Provenance: 99, Conformity: 93 },
    classification: "Restricted", region: "US East", owner: "Insurance Platform",
    description: "System of record for policy lifecycle, endorsements, billing linkage.",
    auth: "mTLS + Client Credentials", authState: "Valid",
    lastSuccessfulJob: "2026-08-11 10:27:55 UTC", failures: 1, throughput: "64 objects/sec",
    contextProfiles: 12, coworkers: ["Policy Change Assistant", "Underwriting Assistant"], pii: "Detected",
  },
  {
    id: "SRC-VSK-006", name: "Verisk CAT Data", domain: "Risk", type: "External API",
    connector: "REST API", status: "Healthy", lastIngest: "15 min ago", objects: 312_000,
    objectsLabel: "312K", freshness: 98, freshnessSla: 85, quality: 97,
    qualityParts: { Completeness: 98, Accuracy: 98, Consistency: 96, Timeliness: 98, Validity: 97, Uniqueness: 96, Provenance: 100, Conformity: 98 },
    classification: "Licensed", region: "US East", owner: "Risk Engineering",
    description: "Licensed catastrophe hazard scores, peril models and geocoded exposure.",
    auth: "API Key (vault reference)", authState: "Valid",
    lastSuccessfulJob: "2026-08-11 10:19:33 UTC", failures: 0, throughput: "22 objects/sec",
    contextProfiles: 6, coworkers: ["Risk Analyst"], pii: "None",
  },
  {
    id: "SRC-AWS-007", name: "AWS Cost Explorer", domain: "Cloud FinOps", type: "Cloud",
    connector: "AWS", status: "Healthy", lastIngest: "8 min ago", objects: 192_000,
    objectsLabel: "192K", freshness: 94, freshnessSla: 90, quality: 91,
    qualityParts: { Completeness: 92, Accuracy: 91, Consistency: 89, Timeliness: 94, Validity: 91, Uniqueness: 90, Provenance: 98, Conformity: 92 },
    classification: "Internal", region: "US East", owner: "Cloud FinOps",
    description: "Cost and usage records, amortized spend, savings plan coverage.",
    auth: "IAM Role Assumption", authState: "Valid",
    lastSuccessfulJob: "2026-08-11 10:26:12 UTC", failures: 2, throughput: "18 objects/sec",
    contextProfiles: 5, coworkers: ["FinOps Analyst"], pii: "None",
  },
  {
    id: "SRC-DDG-008", name: "Datadog", domain: "Observability", type: "Telemetry",
    connector: "Datadog", status: "Healthy", lastIngest: "1 min ago", objects: 2_100_000,
    objectsLabel: "2.1M", freshness: 99, freshnessSla: 95, quality: 93,
    qualityParts: { Completeness: 94, Accuracy: 93, Consistency: 92, Timeliness: 99, Validity: 93, Uniqueness: 91, Provenance: 99, Conformity: 94 },
    classification: "Internal", region: "US East", owner: "SRE",
    description: "Service telemetry references, SLO state, monitor and incident signals.",
    auth: "API + App Key (vault reference)", authState: "Valid",
    lastSuccessfulJob: "2026-08-11 10:33:48 UTC", failures: 4, throughput: "620 objects/sec",
    contextProfiles: 7, coworkers: ["SRE Copilot"], pii: "None",
  },
];

export const INACTIVE_SOURCES = 2;
export const TOTAL_SOURCES = 40;

/* ------------------------------- Pipeline -------------------------------- */

export interface PipelineStage {
  id: string;
  name: string;
  metricA: string;
  metricB: string;
  purpose: string;
  components: string[];
  configuration: [string, string][];
  rules: string[];
  inputs: string[];
  outputs: string[];
  gates: string[];
  downstream: string[];
  owner: string;
  changes: { at: string; actor: string; change: string }[];
}

export const PIPELINE: PipelineStage[] = [
  {
    id: "ingest", name: "Ingest", metricA: "38 Sources", metricB: "1.2K objects/sec",
    purpose: "Acquire enterprise records, documents, events and telemetry references from governed connectors without mutating source systems.",
    components: ["Connector runtime", "Incremental ingestion", "Event streaming", "CDC", "Bulk ingestion"],
    configuration: [["Runtime", "Tenant-hosted connector pool"], ["Checkpointing", "Per-source watermark"], ["Backpressure", "Adaptive, 1.2K obj/sec ceiling"], ["Retry", "Exponential, max 5"], ["Dead letter queue", "Enabled"]],
    rules: ["Read-only credentials only", "Checkpoint committed after durable write", "Poison objects routed to DLQ with source reference"],
    inputs: ["Source system APIs", "Object storage", "CDC streams", "Webhooks"],
    outputs: ["Raw evidence records", "Ingest audit events"],
    gates: ["Credential validity", "Schema discovery success", "Volume anomaly guard"],
    downstream: ["Normalize"], owner: "Data Engineering",
    changes: [{ at: "2026-08-09 14:02", actor: "r.nair", change: "Raised S3 parallelism 8 → 12" }],
  },
  {
    id: "normalize", name: "Normalize", metricA: "124 Schemas", metricB: "94% auto-mapped",
    purpose: "Convert heterogeneous source payloads into canonical tenant schemas with stable identifiers and typed fields.",
    components: ["Parsing", "Schema mapping", "Entity extraction", "Deduplication", "Type normalization"],
    configuration: [["Canonical schemas", "124"], ["Auto-map confidence floor", "0.88"], ["Dedup strategy", "Deterministic key + fuzzy fallback"], ["Unit normalization", "ISO 4217 / ISO 8601"], ["Unmapped field policy", "Retain as annotated extension"]],
    rules: ["Reject records failing required-field conformity", "Preserve raw payload pointer for provenance"],
    inputs: ["Raw evidence records"], outputs: ["Canonical evidence objects", "Schema conflict exceptions"],
    gates: ["Schema conformity ≥ 95%", "Duplicate rate < 2%"],
    downstream: ["Enrich"], owner: "Data Engineering",
    changes: [{ at: "2026-08-07 09:41", actor: "a.deshpande", change: "Added Duck Creek endorsement mapping v3" }],
  },
  {
    id: "enrich", name: "Enrich", metricA: "6.4M entities", metricB: "2.1K metadata tags",
    purpose: "Resolve entities, attach classification, ownership, domain and relationship metadata before indexing.",
    components: ["Classification", "Metadata", "Relationship extraction", "PII detection", "Ownership", "Domain tagging"],
    configuration: [["Entity resolution", "Blocking + probabilistic scoring"], ["Match threshold", "0.91"], ["PII detection", "Pattern + model ensemble"], ["Classification model", "Tenant policy driven"], ["Ownership resolution", "CMDB + HR directory"]],
    rules: ["Every object receives a classification before index", "PII detection failure blocks indexing"],
    inputs: ["Canonical evidence objects"], outputs: ["Enriched evidence", "Entity + relationship assertions"],
    gates: ["Classification coverage 100%", "Entity match precision ≥ 0.95"],
    downstream: ["Index"], owner: "Context Engineering",
    changes: [{ at: "2026-08-05 16:20", actor: "s.iyer", change: "Match threshold 0.89 → 0.91" }],
  },
  {
    id: "index", name: "Index", metricA: "Vector · Graph · Keyword · Relational · Temporal", metricB: "24.7M relationships",
    purpose: "Persist evidence into complementary retrieval structures so hybrid retrieval can serve semantic, structural and temporal questions.",
    components: ["Vector index", "Knowledge graph", "Metadata index", "Keyword index", "Temporal index", "Structured query index"],
    configuration: [["Embedding model", "tenant-pinned, versioned"], ["Vector dimensions", "1024"], ["Graph store", "Property graph, 24.7M edges"], ["Replication", "3x, multi-AZ"], ["Reindex policy", "On schema or model version change"]],
    rules: ["Index writes are transactional with provenance record", "Stale embeddings invalidated on model version change"],
    inputs: ["Enriched evidence"], outputs: ["Queryable indexes", "Index lag metrics"],
    gates: ["Index lag < 90s", "Replication healthy"],
    downstream: ["Validate"], owner: "Platform Engineering",
    changes: [{ at: "2026-08-10 11:12", actor: "r.nair", change: "Vector index optimization window moved to 02:00 UTC" }],
  },
  {
    id: "validate", name: "Validate", metricA: "Quality 94.1", metricB: "Freshness 96.4%",
    purpose: "Continuously measure evidence against quality, freshness, provenance and policy rules, and quarantine what fails.",
    components: ["Completeness", "Accuracy", "Freshness", "Consistency", "Provenance", "Policy validation"],
    configuration: [["Evaluation cadence", "Continuous + hourly rollup"], ["Quality floor for context", "0.82"], ["Freshness target", "90%"], ["Quarantine", "Enabled"], ["Exception routing", "Data steward queue"]],
    rules: ["Objects below quality floor are excluded from context assembly", "Freshness violation raises source-level warning"],
    inputs: ["Queryable indexes"], outputs: ["Quality scores", "Exceptions", "Eligibility flags"],
    gates: ["Provenance coverage ≥ 99%", "Open critical exceptions = 0"],
    downstream: ["Assemble"], owner: "Data Governance",
    changes: [{ at: "2026-08-08 08:55", actor: "m.okafor", change: "Added schema violation rule SV-12" }],
  },
  {
    id: "assemble", name: "Assemble", metricA: "Context Packs", metricB: "On-demand",
    purpose: "Construct bounded, task-specific, permission-aware evidence packages for downstream model and agent reasoning.",
    components: ["Intent resolution", "Evidence retrieval", "Hybrid search", "Reranking", "Entitlement filtering", "Token budgeting", "Context construction", "Citation/provenance attachment"],
    configuration: [["Retrieval mode", "Hybrid"], ["Retrievers", "Vector · Keyword · Graph · Structured · Temporal"], ["Reranking", "Enabled"], ["Permission filtering", "Required"], ["Provenance attachment", "Required"], ["Freshness validation", "Required"], ["Conflict detection", "Enabled"], ["Token budgeting", "Enabled"], ["Maximum context", "32K equivalent tokens"], ["Evidence citation", "Required"], ["Minimum evidence score", "0.82"], ["Evidence conflict policy", "Mark and surface"], ["Missing evidence policy", "Return incomplete-context status"]],
    rules: ["Entitlement filter runs before ranking, never after", "Every returned fragment carries citation and timestamp"],
    inputs: ["Agent objective", "Context requirement", "Eligible evidence"],
    outputs: ["Context Pack", "Assembly trace", "Incomplete-context status"],
    gates: ["Entitlement filter applied", "Citation coverage 100%", "Within token budget"],
    downstream: ["LLM / Agent reasoning"], owner: "Context Engineering",
    changes: [{ at: "2026-08-11 07:30", actor: "s.iyer", change: "Minimum evidence score 0.80 → 0.82" }],
  },
];

export const ASSEMBLY_FLOW = [
  "Agent Objective", "Context Requirement", "Evidence Retrieval", "Entitlement Filter",
  "Quality/Freshness Filter", "Conflict Detection", "Reranking", "Token Allocation", "Context Pack",
];

/* -------------------------------- Storage -------------------------------- */

export interface IndexSlice {
  id: string; name: string; gb: number; pct: number; color: string;
  objects: string; queries: string; latency: string; replication: string; retention: string; optimized: string;
}

export const STORAGE: IndexSlice[] = [
  { id: "vector", name: "Vector Index", gb: 512, pct: 42, color: "#2563eb", objects: "12.8M vectors", queries: "1.9M / day", latency: "31 ms p95", replication: "3x multi-AZ", retention: "Tied to source retention", optimized: "2026-08-11 02:00 UTC" },
  { id: "graph", name: "Graph Index", gb: 256, pct: 21, color: "#0ea5e9", objects: "6.4M nodes · 24.7M edges", queries: "410K / day", latency: "48 ms p95", replication: "3x multi-AZ", retention: "Rolling 36 months", optimized: "2026-08-10 02:00 UTC" },
  { id: "document", name: "Document Store", gb: 288, pct: 24, color: "#64748b", objects: "9.1M documents", queries: "780K / day", latency: "22 ms p95", replication: "3x multi-AZ", retention: "Source policy", optimized: "2026-08-09 02:00 UTC" },
  { id: "relational", name: "Relational Store", gb: 96, pct: 8, color: "#14b8a6", objects: "38.2M rows", queries: "1.2M / day", latency: "14 ms p95", replication: "2x + PITR", retention: "84 months", optimized: "2026-08-11 02:00 UTC" },
  { id: "cache", name: "Other / Cache", gb: 48, pct: 4, color: "#cbd5e1", objects: "Context pack cache", queries: "3.4M / day", latency: "4 ms p95", replication: "None (ephemeral)", retention: "15 minutes", optimized: "Continuous" },
];

/* ------------------------------ Entity model ------------------------------ */

export interface EntityDef {
  id: string; name: string; count: string; domain: string; x: number; y: number;
  description: string; schema: string[]; sources: string[]; quality: number; schemaUpdated: string;
}

export const ENTITIES: EntityDef[] = [
  { id: "customer", name: "Customer", count: "2.7M", domain: "Insurance", x: 90, y: 60, description: "Resolved insured party across policy, billing and CRM systems.", schema: ["customer_id", "legal_name", "tax_id (masked)", "segment", "status"], sources: ["Duck Creek PolicyCenter", "Snowflake, Underwriting"], quality: 95, schemaUpdated: "2026-07-28" },
  { id: "broker", name: "Broker", count: "820K", domain: "Underwriting", x: 90, y: 190, description: "Producer or intermediary submitting risk on behalf of a customer.", schema: ["broker_id", "agency", "license_state", "appointment_status"], sources: ["Duck Creek PolicyCenter", "S3, Submissions"], quality: 92, schemaUpdated: "2026-07-14" },
  { id: "submission", name: "Submission", count: "4.3M", domain: "Underwriting", x: 300, y: 190, description: "Inbound risk package under evaluation prior to binding.", schema: ["submission_id", "broker_id", "received_at", "line_of_business", "status"], sources: ["S3, Submissions", "Snowflake, Underwriting"], quality: 93, schemaUpdated: "2026-08-02" },
  { id: "policy", name: "Policy", count: "1.2M", domain: "Policy", x: 300, y: 60, description: "Bound contract of insurance with term, coverage and endorsement history.", schema: ["policy_id", "customer_id", "effective_date", "expiry_date", "premium"], sources: ["Duck Creek PolicyCenter", "SharePoint, Policies"], quality: 96, schemaUpdated: "2026-08-05" },
  { id: "claim", name: "Claim", count: "3.1M", domain: "Claims", x: 520, y: 60, description: "Reported loss event associated with a policy and its adjudication state.", schema: ["claim_id", "policy_id", "loss_date", "reserve", "status"], sources: ["Duck Creek PolicyCenter"], quality: 94, schemaUpdated: "2026-07-30" },
  { id: "asset", name: "Asset", count: "1.1M", domain: "Risk", x: 520, y: 190, description: "Insured property, vehicle, equipment or scheduled item.", schema: ["asset_id", "policy_id", "asset_type", "value", "location_id"], sources: ["Snowflake, Underwriting", "S3, Submissions"], quality: 91, schemaUpdated: "2026-07-22" },
  { id: "location", name: "Location", count: "1.8M", domain: "Risk", x: 720, y: 190, description: "Geocoded site with occupancy, construction and protection attributes.", schema: ["location_id", "geohash", "construction", "occupancy", "protection_class"], sources: ["Verisk CAT Data", "S3, Submissions"], quality: 95, schemaUpdated: "2026-08-01" },
  { id: "risk", name: "Risk", count: "2.9M", domain: "Risk", x: 720, y: 60, description: "Hazard and exposure scoring attached to a location or asset.", schema: ["risk_id", "location_id", "peril", "score", "model_version"], sources: ["Verisk CAT Data"], quality: 97, schemaUpdated: "2026-08-06" },
];

export interface EdgeDef {
  id: string; from: string; to: string; label: string;
  cardinality: string; confidence: number; source: string; rule: string;
}

export const EDGES: EdgeDef[] = [
  { id: "e1", from: "customer", to: "policy", label: "OWNS", cardinality: "1 : N", confidence: 0.99, source: "Duck Creek PolicyCenter", rule: "policy.customer_id → customer.customer_id (deterministic key)" },
  { id: "e2", from: "broker", to: "submission", label: "SUBMITS", cardinality: "1 : N", confidence: 0.98, source: "S3, Submissions", rule: "submission.broker_id resolved via producer code mapping" },
  { id: "e3", from: "submission", to: "policy", label: "CREATES", cardinality: "1 : 0..1", confidence: 0.96, source: "Snowflake, Underwriting", rule: "bind event links submission_id to issued policy_id" },
  { id: "e4", from: "policy", to: "claim", label: "HAS", cardinality: "1 : N", confidence: 0.99, source: "Duck Creek PolicyCenter", rule: "claim.policy_id foreign key" },
  { id: "e5", from: "policy", to: "asset", label: "COVERS", cardinality: "1 : N", confidence: 0.97, source: "Snowflake, Underwriting", rule: "schedule line items expanded to asset records" },
  { id: "e6", from: "asset", to: "location", label: "LOCATED_AT", cardinality: "N : 1", confidence: 0.94, source: "S3, Submissions", rule: "address normalization + geocode match ≥ 0.94" },
  { id: "e7", from: "location", to: "risk", label: "HAS", cardinality: "1 : N", confidence: 0.98, source: "Verisk CAT Data", rule: "geohash join to licensed peril grid" },
  { id: "e8", from: "claim", to: "policy", label: "REFERENCES", cardinality: "N : 1", confidence: 0.99, source: "Duck Creek PolicyCenter", rule: "reverse traversal of claim.policy_id" },
];

/* -------------------------------- Quality -------------------------------- */

export interface QualityDim {
  key: string; score: number; definition: string; calculation: string;
  target: number; contributors: string[]; violations: number; trend: string;
}

export const QUALITY: QualityDim[] = [
  { key: "Completeness", score: 95, definition: "Share of required canonical fields populated on evidence objects.", calculation: "populated_required_fields / expected_required_fields", target: 90, contributors: ["S3, Submissions", "AWS Cost Explorer"], violations: 11, trend: "+1.2 vs prior period" },
  { key: "Accuracy", score: 94, definition: "Agreement between evidence values and authoritative reference records.", calculation: "matched_values / sampled_values against system of record", target: 90, contributors: ["Duck Creek PolicyCenter"], violations: 8, trend: "+0.6" },
  { key: "Consistency", score: 93, definition: "Cross-source agreement for the same resolved entity attribute.", calculation: "1 − conflicting_attribute_pairs / compared_pairs", target: 90, contributors: ["Snowflake, Underwriting", "Duck Creek PolicyCenter"], violations: 14, trend: "−0.3" },
  { key: "Timeliness", score: 96, definition: "Evidence delivered within its source-specific latency window.", calculation: "objects_within_sla / total_objects", target: 90, contributors: ["Datadog"], violations: 7, trend: "+2.1" },
  { key: "Validity", score: 94, definition: "Conformance of values to declared types, ranges and enumerations.", calculation: "valid_values / evaluated_values", target: 90, contributors: ["AWS Cost Explorer"], violations: 9, trend: "+0.4" },
  { key: "Uniqueness", score: 92, definition: "Absence of duplicate evidence objects for the same source record.", calculation: "1 − duplicate_objects / total_objects", target: 90, contributors: ["S3, Submissions"], violations: 16, trend: "+1.0" },
  { key: "Provenance Coverage", score: 99, definition: "Objects carrying complete origin and transformation lineage.", calculation: "objects_with_full_lineage / total_objects", target: 90, contributors: ["All sources"], violations: 2, trend: "flat" },
  { key: "Schema Conformity", score: 97, definition: "Objects conforming to the current canonical schema version.", calculation: "conforming_objects / total_objects", target: 90, contributors: ["Duck Creek PolicyCenter"], violations: 12, trend: "+0.8" },
];

export const QUALITY_EXCEPTIONS = [
  { id: "QX-2041", type: "Quality exception", object: "S3, Submissions · loss_run parser", impact: "312 objects excluded from context eligibility", action: "Republish parser mapping v4 and re-run backfill" },
  { id: "QX-2042", type: "Freshness violation", object: "AWS Cost Explorer", impact: "Cost evidence aged 31h against a 24h SLA", action: "Increase poll frequency or relax source freshness SLA" },
  { id: "QX-2043", type: "Schema violation", object: "Duck Creek PolicyCenter · endorsement.v3", impact: "12 fields unmapped, endorsement context incomplete", action: "Approve pending canonical mapping change CHG-88213" },
];

/* ------------------------------- Policies -------------------------------- */

export interface PolicyFamily {
  id: string; name: string; count: number; state: string; tone: "ok" | "warn";
  controls: string; items: { name: string; scope: string; status: string }[];
}

export const POLICIES: PolicyFamily[] = [
  { id: "access", name: "Access Control Policies", count: 12, state: "1 pending update", tone: "warn", controls: "Which principals and context profiles may read evidence from a given source or domain.", items: [{ name: "Underwriting evidence read", scope: "Domain: Underwriting", status: "Active" }, { name: "Restricted PAS read", scope: "SRC-DC-005", status: "Pending update" }] },
  { id: "classification", name: "Data Classification Rules", count: 8, state: "All active", tone: "ok", controls: "How evidence is labelled (Public → Restricted) and what that label enables downstream.", items: [{ name: "PII auto-classification", scope: "All sources", status: "Active" }, { name: "Licensed data label", scope: "SRC-VSK-006", status: "Active" }] },
  { id: "retention", name: "Retention Policies", count: 5, state: "All active", tone: "ok", controls: "How long evidence and derived indexes are retained before purge.", items: [{ name: "Claims 84-month retention", scope: "Domain: Claims", status: "Active" }] },
  { id: "masking", name: "Masking / Redaction Rules", count: 6, state: "2 pending updates", tone: "warn", controls: "Which attributes are masked or redacted before evidence enters a context pack.", items: [{ name: "Tax ID masking", scope: "Entity: Customer", status: "Pending update" }, { name: "Claimant name redaction", scope: "Domain: Claims", status: "Pending update" }] },
  { id: "usage", name: "Evidence Usage Policies", count: 7, state: "All active", tone: "ok", controls: "Permitted purposes for evidence — reasoning, decision support, execution or audit only.", items: [{ name: "Licensed data non-derivative use", scope: "SRC-VSK-006", status: "Active" }] },
  { id: "eligibility", name: "Context Eligibility Policies", count: 5, state: "All active", tone: "ok", controls: "Whether an evidence object may participate in a specific AI reasoning process.", items: [{ name: "Minimum evidence score 0.82", scope: "Tenant", status: "Active" }] },
  { id: "provenance", name: "Provenance Requirements", count: 4, state: "All active", tone: "ok", controls: "Lineage and citation that must accompany evidence in every context pack.", items: [{ name: "Citation required", scope: "Tenant", status: "Active" }] },
  { id: "freshness", name: "Freshness Policies", count: 9, state: "1 warning", tone: "warn", controls: "Maximum permitted evidence age per source and domain before exclusion.", items: [{ name: "Cloud FinOps 24h window", scope: "SRC-AWS-007", status: "Warning" }] },
];

/* ------------------------------- Principles ------------------------------- */

export const PRINCIPLES = [
  { id: "trust", title: "Trust by Design", short: "Provenance, quality, permissions, lineage, and security applied before evidence reaches a digital coworker.", hover: "Every piece of evidence retains its source, version, timestamp, entitlement context, classification, and transformation history.", detail: ["Provenance record written at ingest and immutable thereafter.", "Entitlement evaluated at assembly time against the requesting principal, never cached across principals.", "Classification is mandatory; unclassified objects cannot be indexed.", "Every transformation step appends to the lineage chain with actor and version."] },
  { id: "context", title: "Context is King", short: "Right information, right time, right perspective.", hover: "Context is dynamically assembled around the digital coworker objective instead of sending every available document or record to an LLM.", detail: ["Objective is resolved into an explicit context requirement before retrieval.", "Token budgeting enforces bounded packs rather than maximal retrieval.", "Perspective filters apply domain and role framing to the same underlying evidence."] },
  { id: "connected", title: "Connected Intelligence", short: "Unify data, knowledge, events, entities, and relationships.", hover: "Vector search alone is insufficient. neugain.io combines semantic, graph, relational, keyword, metadata, and temporal context.", detail: ["Hybrid retrieval fans out across five retrievers and reconciles results.", "Graph traversal supplies structural context vector search cannot express.", "Temporal index answers 'what was true then' as well as 'what is true now'."] },
  { id: "actionable", title: "Actionable Outcomes", short: "Evidence exists to support decisions and measurable action.", hover: "Context assembly is optimized for downstream reasoning, decision support, agent execution, and validation, not merely document retrieval.", detail: ["Context packs carry decision-relevant structure, not raw document dumps.", "Missing evidence returns an explicit incomplete-context status rather than a confident guess.", "Conflicting evidence is surfaced to the reasoning layer, not silently resolved."] },
  { id: "learning", title: "Continuous Learning", short: "Outcomes continuously improve evidence and context.", hover: "Validation results, human decisions, execution outcomes, and feedback become signals for improving retrieval, ranking, evidence quality, and future context assembly.", detail: ["Human approvals and rejections feed reranking calibration.", "Execution validation results update source-level quality weighting.", "Unused evidence in successful outcomes lowers future retrieval priority."] },
];

export const OUTCOMES = [
  { id: "accuracy", label: "Context Decision Support Accuracy", value: "94.1%", definition: "Share of sampled digital coworker decisions where the assembled context contained the evidence a qualified reviewer deemed necessary and sufficient.", calculation: "sufficient_context_decisions / reviewed_decisions", target: "90%", result: "94.1%", measuredBy: "Validation & learning service, weekly stratified sample", why: "A coworker cannot reason correctly from an incomplete evidence package." },
  { id: "latency", label: "Median Context Assembly", value: "118 ms", definition: "Median wall-clock time to construct a complete, entitlement-filtered context pack.", calculation: "p50 of assembly span duration", target: "≤ 150 ms", result: "118 ms", measuredBy: "Context service tracing", why: "Assembly latency is on the critical path of every agent turn." },
  { id: "freshness", label: "Evidence Freshness SLA", value: "96.4%", definition: "Share of evidence objects inside their configured maximum age.", calculation: "objects_within_freshness_sla / total_objects", target: "90%", result: "96.4%", measuredBy: "Validation stage hourly rollup", why: "Digital coworkers should not decide from stale operational or business state." },
  { id: "traceable", label: "Traceable Evidence Coverage", value: "99.2%", definition: "Share of evidence fragments returned in context packs carrying full citation and lineage.", calculation: "cited_fragments / returned_fragments", target: "99%", result: "99.2%", measuredBy: "Assembly trace audit", why: "Untraceable evidence cannot be defended in review, audit or regulatory examination." },
];

/* --------------------------------- Help ---------------------------------- */

export const HELP: Record<string, { what: string; why: string; how: string; controls: string }> = {
  "Context Freshness": { what: "A measure of whether evidence remains within the maximum age allowed for its intended purpose.", why: "neugain.io coworkers act on operational and financial state; stale evidence produces confidently wrong decisions.", how: "Each source declares a freshness SLA. The validation stage timestamps every object and computes age at rollup and again at assembly time.", controls: "Exclusion of aged evidence from context packs, source-level warnings, and freshness policy enforcement." },
  "Evidence Quality": { what: "A weighted aggregate of completeness, accuracy, consistency, validity, timeliness, uniqueness, provenance and schema conformity.", why: "Retrieval ranking and eligibility both depend on a defensible quality signal rather than recency alone.", how: "Dimension scores are computed continuously per source and rolled up hourly into a tenant score.", controls: "Context eligibility floor, retrieval ranking weight, and the data steward exception queue." },
  "Context Assembly": { what: "The runtime construction of a bounded, permission-aware evidence package for a specific agent objective.", why: "Sending everything to a model is expensive, slow and unsafe; assembly makes context intentional.", how: "Intent resolution → hybrid retrieval → entitlement filter → quality/freshness filter → conflict detection → reranking → token allocation.", controls: "Retriever mix, minimum evidence score, token budget, citation requirement and conflict policy." },
  "Provenance": { what: "The traceable origin and transformation history of a piece of evidence.", why: "Every agent-influenced decision must be defensible to audit and regulators.", how: "A lineage record is written at ingest and appended at each pipeline stage with actor, version and timestamp.", controls: "Citation attachment, audit trail completeness and provenance coverage gating." },
  "Entity Resolution": { what: "Identifying when records from different systems describe the same real-world object.", why: "Without resolution the graph fragments and coworkers reason over partial views of a customer or risk.", how: "Deterministic keys first, then probabilistic blocking and scoring with a 0.91 match threshold.", controls: "Graph node identity, relationship derivation and cross-source consistency scoring." },
  "Hybrid Retrieval": { what: "Combining semantic, keyword, graph, relational, metadata and temporal retrieval into one result set.", why: "Single-modality retrieval misses structural, exact-match and point-in-time evidence.", how: "Retrievers fan out in parallel; results are deduplicated, entitlement-filtered and reranked.", controls: "Retriever selection, weighting and reranking behaviour." },
  "Context Eligibility": { what: "Rules determining whether evidence may participate in a specific AI reasoning process.", why: "Some evidence is authorized to exist in the tenant but not authorized to inform a given decision.", how: "Eligibility policies evaluate classification, quality, freshness, usage purpose and requesting principal.", controls: "Which evidence a context profile may ever see, independent of retrieval relevance." },
};

/* -------------------------------- Filters -------------------------------- */

export const DOMAINS = Array.from(new Set(SOURCES.map((s) => s.domain)));
export const TYPES = Array.from(new Set(SOURCES.map((s) => s.type)));
export const CLASSIFICATIONS = Array.from(new Set(SOURCES.map((s) => s.classification)));
export const REGIONS = Array.from(new Set(SOURCES.map((s) => s.region)));

export const CONNECTOR_CATALOG: { category: string; connectors: string[] }[] = [
  { category: "Database", connectors: ["Snowflake", "PostgreSQL"] },
  { category: "Object Storage", connectors: ["AWS S3", "Azure Blob"] },
  { category: "Document Repository", connectors: ["SharePoint"] },
  { category: "SaaS", connectors: ["Salesforce", "Workday"] },
  { category: "ITSM", connectors: ["ServiceNow"] },
  { category: "Cloud", connectors: ["AWS", "Azure"] },
  { category: "Observability", connectors: ["Datadog", "Splunk"] },
  { category: "Code Repository", connectors: ["GitHub"] },
  { category: "Data Warehouse", connectors: ["Snowflake", "BigQuery"] },
  { category: "Streaming", connectors: ["Kafka"] },
  { category: "External API", connectors: ["REST API"] },
];

export const AUDIT_TRAIL = [
  { at: "2026-08-11 07:30 UTC", actor: "s.iyer (Context Admin)", object: "Assemble stage", action: "Update", oldValue: "min_evidence_score 0.80", newValue: "0.82", reason: "Reduce low-signal fragments in underwriting packs", ticket: "CHG-88190" },
  { at: "2026-08-10 11:12 UTC", actor: "r.nair (Platform Admin)", object: "Vector Index", action: "Update", oldValue: "optimize 04:00 UTC", newValue: "02:00 UTC", reason: "Avoid overlap with warehouse load", ticket: "CHG-88176" },
  { at: "2026-08-09 14:02 UTC", actor: "r.nair (Platform Admin)", object: "SRC-S3-002", action: "Update", oldValue: "parallelism 8", newValue: "parallelism 12", reason: "Submission backlog burn-down", ticket: "CHG-88151" },
  { at: "2026-08-08 08:55 UTC", actor: "m.okafor (Security Admin)", object: "Schema validation", action: "Create", oldValue: "—", newValue: "Rule SV-12", reason: "Detect unmapped endorsement fields", ticket: "CHG-88120" },
  { at: "2026-08-05 16:20 UTC", actor: "s.iyer (Context Admin)", object: "Entity resolution", action: "Update", oldValue: "threshold 0.89", newValue: "0.91", reason: "False-merge rate above tolerance", ticket: "CHG-88044" },
];

export type Role = "Platform Admin" | "Context Admin" | "Data Engineer" | "Security Admin" | "AI Engineer" | "Auditor" | "Read Only";

export const ROLE_CAPABILITIES: Record<Role, string[]> = {
  "Platform Admin": ["sources", "schemas", "indexing", "policies", "settings"],
  "Context Admin": ["schemas", "context-rules"],
  "Data Engineer": ["sources", "schemas", "indexing"],
  "Security Admin": ["policies", "classification", "permissions"],
  "AI Engineer": ["context-rules"],
  "Auditor": [],
  "Read Only": [],
};

export const GUARANTEES = [
  { key: "TRACED", q: "Where did this information originate?" },
  { key: "DATED", q: "How current is it?" },
  { key: "AUTHORIZED", q: "Was the agent entitled to use it?" },
  { key: "RELATED", q: "How does it connect to the current situation?" },
  { key: "VALIDATED", q: "Does it meet required quality standards?" },
  { key: "BOUNDED", q: "Is only the required context being supplied?" },
  { key: "EXPLAINED", q: "Can we show why this evidence was selected?" },
];
