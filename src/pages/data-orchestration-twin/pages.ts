export interface DoPage {
  slug: string;
  title: string;
  group: string;
  tagline: string;
  purpose: string;
  metrics: { label: string; value: string; sub: string; tone: "emerald" | "blue" | "amber" | "rose" | "violet" }[];
  columns: { heading: string; items: string[] }[];
  workflow: string[];
  nested?: boolean;
}

const g = (group: string) => group;

export const doPages: DoPage[] = [
  {
    slug: "executive-control-plane",
    title: "Executive Control Plane",
    group: g("Overview"),
    tagline: "Single pane for the entire Data Orchestration Twin program",
    purpose:
      "Executive-facing command surface that rolls up every module — from contracts and connectors to hydration, lineage, and query readiness — into decision-ready KPIs.",
    metrics: [
      { label: "Sources Onboarded", value: "184 / 212", sub: "87% of scoped inventory", tone: "emerald" },
      { label: "Contracts Signed", value: "62", sub: "Data contracts in force", tone: "blue" },
      { label: "Query Readiness", value: "91%", sub: "Domains graph-ready", tone: "emerald" },
      { label: "Freshness p95", value: "18s", sub: "Ingest → queryable", tone: "blue" },
      { label: "Duplication Rate", value: "2.1%", sub: "Post-dedup, ↓ from 14%", tone: "amber" },
      { label: "$ / Insight", value: "$0.11", sub: "Blended pipeline cost", tone: "violet" },
    ],
    columns: [
      {
        heading: "Program Health",
        items: [
          "Data Contracts — 62 signed, 8 pending",
          "Connector Fleet — 141 active, 6 quarantined",
          "Hydration Coverage — 88% of critical records",
          "Lineage Traceability — 96% end-to-end",
        ],
      },
      {
        heading: "Executive Decisions Pending",
        items: [
          "Approve tier-2 retention economics change",
          "Sign off graph projection v3 rollout",
          "Ratify no-duplication policy exception (SOC2 replay)",
          "Fund backlog spike for schema drift automation",
        ],
      },
      {
        heading: "SOW Milestones",
        items: [
          "M1 Scope Registry — Complete",
          "M2 Onboarding Factory — 82% of sources",
          "M3 Canonical Model — In UAT",
          "M4 Agentic Handoff — Design freeze",
        ],
      },
    ],
    workflow: [
      "Contract signed",
      "Source onboarded",
      "Schema mapped",
      "Hydration built",
      "Lineage certified",
      "Graph projected",
      "Agentic query enabled",
    ],
  },
  {
    slug: "use-case-to-data-contract-mapper",
    title: "Use Case to Data Contract Mapper",
    group: g("Contract & Scope"),
    tagline: "Trace every business use case to the data contracts that guarantee it",
    purpose:
      "Bidirectional matrix linking business use cases (SLO defense, fraud, capacity) to the fields, freshness, and quality guarantees they require — enforced as versioned data contracts.",
    metrics: [
      { label: "Use Cases Mapped", value: "148", sub: "Across 12 domains", tone: "blue" },
      { label: "Contracts Bound", value: "62", sub: "1:many use cases", tone: "emerald" },
      { label: "Uncovered Cases", value: "9", sub: "Awaiting contract", tone: "amber" },
      { label: "SLA Adherence", value: "97.8%", sub: "Contract obligations met", tone: "emerald" },
    ],
    columns: [
      {
        heading: "High-Priority Use Cases",
        items: [
          "SLO burn detection — Contract v2.3",
          "Change → incident correlation — Contract v1.8",
          "Fraud signal enrichment — Contract v3.1 (draft)",
          "Cost anomaly attribution — Contract v1.2",
        ],
      },
      {
        heading: "Contract Obligations",
        items: [
          "Freshness ≤ 30s p95",
          "Field completeness ≥ 99%",
          "Schema change notice ≥ 14d",
          "PII fields masked at ingest",
        ],
      },
      {
        heading: "Uncovered / At-Risk",
        items: [
          "Capacity forecast — needs telemetry contract",
          "Blue/green rollout validation — no owner",
          "Insider risk — missing identity join",
        ],
      },
    ],
    workflow: ["Use case defined", "Fields identified", "Owner assigned", "SLAs negotiated", "Contract published", "Producer instrumented", "Consumer validated"],
  },
  {
    slug: "log-source-inventory-and-scope-registry",
    title: "Log Source Inventory and Scope Registry",
    group: g("Contract & Scope"),
    tagline: "The single source of truth for what is (and isn't) in scope",
    purpose:
      "Registry of every candidate log/metric/trace source across cloud, on-prem, SaaS, and OT — with owner, criticality, in-scope status, and rationale.",
    metrics: [
      { label: "Sources Discovered", value: "347", sub: "Across 6 environments", tone: "blue" },
      { label: "In Scope", value: "212", sub: "61% of discovered", tone: "emerald" },
      { label: "Deferred", value: "78", sub: "Backlogged w/ rationale", tone: "amber" },
      { label: "Owner Assigned", value: "94%", sub: "Registry coverage", tone: "emerald" },
    ],
    columns: [
      {
        heading: "Top Environments",
        items: [
          "AWS us-east-1 — 89 sources",
          "Azure prod-east — 54 sources",
          "On-prem DC-2 — 38 sources",
          "SaaS (M365, SFDC, Zoom) — 27 sources",
        ],
      },
      {
        heading: "In-Scope Categories",
        items: ["App logs", "Infra metrics", "Distributed traces", "Change events", "Security signals", "Business KPIs"],
      },
      {
        heading: "Deferred (with reason)",
        items: [
          "Legacy AS/400 — no shipper",
          "Vendor SaaS w/o export API",
          "Low-value debug streams",
          "Duplicated by upstream contract",
        ],
      },
    ],
    workflow: ["Discover", "Classify", "Assign owner", "Score value", "Decide in/out", "Register", "Publish rationale"],
  },
  {
    slug: "data-placement-and-economics-decision-engine",
    title: "Data Placement and Economics Decision Engine",
    group: g("Contract & Scope"),
    tagline: "Where each dataset lives — and why it's the cheapest right answer",
    purpose:
      "Decision engine that picks the right tier (hot lake, warm lake, cold archive, SIEM, graph) for every dataset based on query pattern, freshness need, and unit economics.",
    metrics: [
      { label: "Datasets Placed", value: "412", sub: "Tier decisions recorded", tone: "blue" },
      { label: "Monthly Savings", value: "$286K", sub: "vs default hot storage", tone: "emerald" },
      { label: "Hot Tier Share", value: "22%", sub: "Down from 71%", tone: "emerald" },
      { label: "Placement Recomputes", value: "Daily", sub: "Auto re-eval by usage", tone: "blue" },
    ],
    columns: [
      {
        heading: "Placement Tiers",
        items: [
          "Hot lake — sub-minute analytics",
          "Warm lake — 24h queryable",
          "Cold archive — compliance replay",
          "Graph store — agentic queries",
          "SIEM — security correlation",
        ],
      },
      {
        heading: "Economic Signals",
        items: ["Ingest $/GB", "Query $/scan", "Retention $/GB-mo", "Egress $/GB", "License-tier ceiling"],
      },
      {
        heading: "Recent Reassignments",
        items: [
          "VPC flow logs — Hot → Warm ($42K/mo saved)",
          "Endpoint AV — Warm → Cold ($18K/mo)",
          "Trace exemplars — Warm → Graph (query win)",
        ],
      },
    ],
    workflow: ["Profile usage", "Score value", "Score cost", "Recommend tier", "Route pipeline", "Measure delta", "Recompute"],
  },
  {
    slug: "no-duplication-strategy-and-retention-policy",
    title: "No Duplication Strategy and Retention Policy",
    group: g("Contract & Scope"),
    tagline: "One canonical copy, one retention rule, zero shadow lakes",
    purpose:
      "Enforces a single-source-of-truth pattern for every event class, with retention that matches the strictest use case + compliance requirement.",
    metrics: [
      { label: "Duplication Rate", value: "2.1%", sub: "↓ from 14% baseline", tone: "emerald" },
      { label: "Shadow Copies Eliminated", value: "37", sub: "Pipelines retired", tone: "emerald" },
      { label: "Retention Policies", value: "24", sub: "Governed & versioned", tone: "blue" },
      { label: "Compliance Overrides", value: "6", sub: "SOX/HIPAA/GDPR", tone: "amber" },
    ],
    columns: [
      {
        heading: "Canonical Owners",
        items: ["Auth events → IAM team", "Change events → Release eng", "Cost events → FinOps", "Security events → SecOps"],
      },
      {
        heading: "Retention Tiers",
        items: ["Hot 7d", "Warm 30d", "Cold 400d", "Archive 7y (compliance)"],
      },
      {
        heading: "Enforcement",
        items: ["Ingest-time dedup keys", "Pipeline registry blocks duplicates", "Quarterly duplicate hunt", "Retention gap alarms"],
      },
    ],
    workflow: ["Declare canonical source", "Retire duplicates", "Assign retention", "Bind compliance", "Monitor drift", "Reassert quarterly"],
  },
  {
    slug: "options-and-tradeoff-matrix",
    title: "Options and Tradeoff Matrix",
    group: g("Contract & Scope"),
    tagline: "Every architectural choice with its explicit cost, risk, and speed tradeoff",
    purpose:
      "Structured matrix of pipeline, storage, and hydration options — with weighted scoring across cost, latency, complexity, and reversibility to support defensible decisions.",
    metrics: [
      { label: "Decisions Recorded", value: "88", sub: "Fully documented", tone: "blue" },
      { label: "Reversible Choices", value: "71%", sub: "Two-way doors", tone: "emerald" },
      { label: "Open Debates", value: "5", sub: "Awaiting arch review", tone: "amber" },
    ],
    columns: [
      {
        heading: "Common Tradeoffs",
        items: [
          "Stream vs micro-batch",
          "Schema-on-read vs schema-on-write",
          "Lakehouse vs warehouse",
          "Central vs federated ownership",
        ],
      },
      {
        heading: "Scoring Axes",
        items: ["Unit cost", "Freshness", "Query performance", "Operational complexity", "Reversibility", "Vendor lock-in"],
      },
      {
        heading: "Recent Decisions",
        items: [
          "Iceberg over Delta (interop)",
          "OTel over proprietary agent",
          "Federated ownership for domain metrics",
        ],
      },
    ],
    workflow: ["Frame decision", "List options", "Score axes", "Weight & rank", "Review & approve", "Publish rationale"],
  },
  {
    slug: "connector-access-and-governance-registry",
    title: "Connector, Access, and Governance Registry",
    group: g("Fetch & Onboard"),
    tagline: "Every connector, every credential, every policy — in one governed registry",
    purpose:
      "Catalog of all data connectors with owner, auth mode, scope, rate limits, and the policies they must obey. Wired to secret rotation and access reviews.",
    metrics: [
      { label: "Active Connectors", value: "141", sub: "Across 38 systems", tone: "blue" },
      { label: "Quarantined", value: "6", sub: "Policy/credential fail", tone: "amber" },
      { label: "Secret Rotation", value: "100%", sub: "Auto ≤ 90 days", tone: "emerald" },
      { label: "Access Reviews", value: "Q2 done", sub: "Next: Jul 15", tone: "blue" },
    ],
    columns: [
      {
        heading: "Auth Modes",
        items: ["OAuth2", "mTLS", "IAM role assumption", "API key (rotating)", "Kerberos (legacy)"],
      },
      {
        heading: "Governance Controls",
        items: ["Least-privilege scope", "Field-level allowlist", "Rate-limit contracts", "Egress DLP hooks"],
      },
      {
        heading: "Quarantined",
        items: ["Legacy Jira token — expired", "Zoom API — scope drift", "OT gateway — cert renewal"],
      },
    ],
    workflow: ["Register connector", "Assign owner", "Bind policy", "Provision credential", "Verify scope", "Enroll in rotation"],
  },
  {
    slug: "fetch-orchestration-scheduler",
    title: "Fetch Orchestration Scheduler",
    group: g("Fetch & Onboard"),
    tagline: "Right-sized pull cadence for every source — no more, no less",
    purpose:
      "Central scheduler that chooses between streaming, micro-batch, and windowed pulls based on freshness contract, source rate-limits, and cost target.",
    metrics: [
      { label: "Scheduled Jobs", value: "1,842", sub: "Across 141 connectors", tone: "blue" },
      { label: "On-Time Rate", value: "99.6%", sub: "Within SLA window", tone: "emerald" },
      { label: "Rate-Limit Backoffs", value: "0.3%", sub: "Below 1% target", tone: "emerald" },
      { label: "Avg Fetch Lag", value: "9s", sub: "p95 22s", tone: "blue" },
    ],
    columns: [
      {
        heading: "Mode Distribution",
        items: ["Stream — 38%", "Micro-batch (30s) — 41%", "Batch (5m) — 17%", "Windowed (hourly+) — 4%"],
      },
      {
        heading: "Constraints Honored",
        items: ["Source rate limits", "Cost budgets", "Freshness contracts", "Downstream backpressure"],
      },
      {
        heading: "Recent Actions",
        items: ["Auto-throttled SFDC (429s)", "Promoted VPC flows to micro-batch", "Shifted M365 pulls off business hours"],
      },
    ],
    workflow: ["Read contract", "Pick mode", "Compute cadence", "Emit schedule", "Monitor SLA", "Auto-tune"],
  },
  {
    slug: "source-onboarding-factory",
    title: "Source Onboarding Factory",
    group: g("Fetch & Onboard"),
    tagline: "Onboard a new source in hours, not weeks — with a repeatable factory",
    purpose:
      "Assembly-line for new source onboarding: template selection → connector deploy → schema discovery → hydration wiring → certification.",
    metrics: [
      { label: "Sources Onboarded (Qtr)", value: "48", sub: "Avg 6.2 days each", tone: "emerald" },
      { label: "In Flight", value: "12", sub: "At various stages", tone: "blue" },
      { label: "Template Reuse", value: "76%", sub: "Onboarding via template", tone: "emerald" },
      { label: "First-Time-Right", value: "88%", sub: "No rework needed", tone: "emerald" },
    ],
    columns: [
      {
        heading: "Factory Stages",
        items: ["Intake", "Template match", "Connector deploy", "Schema discover", "Hydration wire", "Certify"],
      },
      {
        heading: "In Flight",
        items: ["Splunk ES → canonical (stage 4)", "New AWS acct — 8 sources (stage 3)", "OT historian (stage 2)"],
      },
      {
        heading: "Templates",
        items: ["AWS CloudWatch pack", "K8s cluster pack", "SaaS OAuth pack", "OT/OPC-UA pack"],
      },
    ],
    workflow: ["Intake ticket", "Match template", "Deploy connector", "Discover schema", "Wire hydration", "Run acceptance", "Certify"],
  },
  {
    slug: "assisted-schema-discovery-and-field-mapping",
    title: "Assisted Schema Discovery and Field Mapping",
    group: g("Schema & Hygiene"),
    tagline: "AI-assisted mapping from raw payloads to your canonical fields",
    purpose:
      "Auto-detects source schemas, proposes mappings to the canonical model, and surfaces confidence so humans only review the ambiguous cases.",
    metrics: [
      { label: "Fields Mapped", value: "18,472", sub: "Auto + human", tone: "blue" },
      { label: "Auto-Accept Rate", value: "74%", sub: "≥ 0.9 confidence", tone: "emerald" },
      { label: "Awaiting Review", value: "126", sub: "0.5–0.9 confidence", tone: "amber" },
      { label: "Rejected", value: "8", sub: "Ambiguous / conflicting", tone: "rose" },
    ],
    columns: [
      {
        heading: "Discovery Techniques",
        items: ["Sample-based inference", "Historical embedding match", "Contract cross-check", "Semantic label search"],
      },
      {
        heading: "Human Review Queue",
        items: ["SFDC.custom__risk_score → risk.score?", "K8s.pod.labels.env → env.name?", "OT.tag.T-104 → tempC?"],
      },
      {
        heading: "Quality Guards",
        items: ["Type check", "Unit check", "Null tolerance", "Cardinality sanity"],
      },
    ],
    workflow: ["Sample source", "Infer schema", "Propose mapping", "Score confidence", "Human review", "Publish mapping"],
  },
  {
    slug: "schema-drift-and-exception-workbench",
    title: "Schema Drift and Exception Workbench",
    group: g("Schema & Hygiene"),
    tagline: "Catch and triage every producer-side schema change before it breaks a query",
    purpose:
      "Detects added/removed/renamed/typed fields, routes exceptions to the right owner, and auto-generates compatibility shims where safe.",
    metrics: [
      { label: "Drift Events (30d)", value: "214", sub: "Auto-detected", tone: "blue" },
      { label: "Auto-Resolved", value: "68%", sub: "Additive & safe", tone: "emerald" },
      { label: "Owner Escalations", value: "42", sub: "Breaking changes", tone: "amber" },
      { label: "Consumer Breakage", value: "0", sub: "Rolling 30d", tone: "emerald" },
    ],
    columns: [
      {
        heading: "Drift Types",
        items: ["Field added (safe)", "Field renamed (needs alias)", "Type changed (breaking)", "Field removed (breaking)"],
      },
      {
        heading: "Auto Actions",
        items: ["Alias created", "Downstream test triggered", "Contract PR opened", "Producer team notified"],
      },
      {
        heading: "Open Exceptions",
        items: ["SFDC.status enum expanded", "Auth log ts precision change", "K8s v1.30 label deprecations"],
      },
    ],
    workflow: ["Detect drift", "Classify severity", "Auto-shim if safe", "Notify owners", "Approve fix", "Deploy shim"],
  },
  {
    slug: "log-hygiene-completeness-and-standardization-console",
    title: "Log Hygiene, Completeness, and Standardization Console",
    group: g("Schema & Hygiene"),
    tagline: "Every event tagged, timed, and correlated — the way SRE expects",
    purpose:
      "Enforces required fields (trace_id, service, env, ts_utc), unit standardization, and semantic tagging so every downstream consumer starts from clean data.",
    metrics: [
      { label: "Completeness", value: "99.1%", sub: "Required fields present", tone: "emerald" },
      { label: "Standardization", value: "97.6%", sub: "Canonical units/labels", tone: "emerald" },
      { label: "Correlation Ready", value: "94%", sub: "Trace_id + service_id", tone: "blue" },
      { label: "Hygiene Rejects", value: "0.4%", sub: "Sent to DLQ", tone: "amber" },
    ],
    columns: [
      {
        heading: "Required Fields",
        items: ["ts_utc (RFC3339)", "service_id", "env", "trace_id", "tenant_id (if multi)", "severity"],
      },
      {
        heading: "Standardization Rules",
        items: ["Bytes not MB", "UTC not local", "Enum case normalized", "Semantic tag pack applied"],
      },
      {
        heading: "Top Offenders (30d)",
        items: ["Legacy app-x missing trace_id", "OT historian local time", "SaaS Y inconsistent severity"],
      },
    ],
    workflow: ["Ingest", "Validate required", "Standardize units", "Tag semantics", "Route or DLQ", "Report hygiene score"],
  },
  {
    slug: "hydration-and-enrichment-method-selector",
    title: "Hydration and Enrichment Method Selector",
    group: g("Hydration & Lineage"),
    tagline: "Pick the right enrichment strategy for each field — join, lookup, embed, or infer",
    purpose:
      "Chooses between join-at-query, lookup-at-ingest, embedding, and model-inference for each field to hit freshness, cost, and accuracy targets.",
    metrics: [
      { label: "Enriched Fields", value: "742", sub: "Across canonical model", tone: "blue" },
      { label: "Ingest-time Lookups", value: "58%", sub: "Fastest at query", tone: "emerald" },
      { label: "Query-time Joins", value: "31%", sub: "Freshness > storage", tone: "blue" },
      { label: "Model-Inferred", value: "11%", sub: "Owner+category signals", tone: "violet" },
    ],
    columns: [
      {
        heading: "Method Menu",
        items: ["Static lookup (CMDB)", "Streaming join", "Query-time join", "Vector-embed match", "LLM classify"],
      },
      {
        heading: "Decision Signals",
        items: ["Freshness need", "Cost budget", "Cardinality", "Accuracy floor", "Reversibility"],
      },
      {
        heading: "Notable Choices",
        items: ["Owner via CMDB lookup", "Blast-radius via graph traversal", "Root-cause hint via LLM"],
      },
    ],
    workflow: ["Field profiled", "Method scored", "Method selected", "Enrichment deployed", "Accuracy measured", "Rebalance"],
  },
  {
    slug: "hydrated-record-builder",
    title: "Hydrated Record Builder",
    group: g("Hydration & Lineage"),
    tagline: "Assemble the fully-hydrated business record every consumer needs",
    purpose:
      "Combines raw event + enrichments + relationships into a single canonical record — the atomic unit consumed by dashboards, agents, and models.",
    metrics: [
      { label: "Records / min", value: "1.4M", sub: "Fully hydrated", tone: "blue" },
      { label: "Hydration Completeness", value: "96%", sub: "All required enrichments", tone: "emerald" },
      { label: "Build Latency p95", value: "220ms", sub: "Event → hydrated", tone: "emerald" },
      { label: "DLQ Rate", value: "0.2%", sub: "Missing enrichment", tone: "amber" },
    ],
    columns: [
      {
        heading: "Record Shapes",
        items: ["Incident context", "Change context", "Customer session", "Asset lifecycle", "Cost lineage"],
      },
      {
        heading: "Enrichment Sources",
        items: ["CMDB", "Ownership graph", "Change registry", "Vector context store", "Cost ledger"],
      },
      {
        heading: "Consumers",
        items: ["SRE runbooks", "Agentic queries", "Executive dashboards", "Model training pipelines"],
      },
    ],
    workflow: ["Receive event", "Fetch enrichments", "Assemble record", "Validate completeness", "Emit to consumers", "Log lineage"],
  },
  {
    slug: "data-lineage-and-traceability-view",
    title: "Data Lineage and Traceability View",
    group: g("Hydration & Lineage"),
    tagline: "Every field, every hop — provable end-to-end",
    purpose:
      "Field-level lineage from source system through every transform to every consumer — with the audit trail regulators, auditors, and engineers demand.",
    metrics: [
      { label: "Coverage", value: "96%", sub: "Fields with lineage", tone: "emerald" },
      { label: "Lineage Nodes", value: "38K", sub: "Sources, transforms, sinks", tone: "blue" },
      { label: "Audit Queries (30d)", value: "412", sub: "Answered in seconds", tone: "emerald" },
      { label: "Gaps", value: "4%", sub: "Legacy pipelines", tone: "amber" },
    ],
    columns: [
      {
        heading: "Views",
        items: ["Field-level lineage", "System-level graph", "Consumer impact map", "Regulatory trace"],
      },
      {
        heading: "Common Audit Prompts",
        items: [
          "Where does customer.email flow?",
          "Which reports depend on billing.line_item?",
          "Was field X ever exported to Y?",
        ],
      },
      {
        heading: "Known Gaps",
        items: ["Legacy ETL Talend jobs", "Ad-hoc notebook exports", "3rd-party SaaS post-processing"],
      },
    ],
    workflow: ["Emit lineage at each hop", "Stitch graph", "Index by field", "Serve audit queries", "Fill gaps"],
  },
  {
    slug: "canonical-operational-data-model",
    title: "Canonical Operational Data Model",
    group: g("Model & Graph"),
    tagline: "The shared language every team and every agent speaks",
    purpose:
      "Versioned canonical model of entities (service, asset, change, incident, customer) and events — the lingua franca that keeps dashboards, agents, and SLOs consistent.",
    metrics: [
      { label: "Entities", value: "38", sub: "Governed & versioned", tone: "blue" },
      { label: "Event Types", value: "142", sub: "Mapped from producers", tone: "blue" },
      { label: "Producers Conformant", value: "91%", sub: "Emitting canonical", tone: "emerald" },
      { label: "Model Version", value: "v4.2", sub: "Prev: v4.1 (14d ago)", tone: "violet" },
    ],
    columns: [
      {
        heading: "Core Entities",
        items: ["Service", "Asset", "Change", "Incident", "Customer", "Cost line", "Policy"],
      },
      {
        heading: "Governance",
        items: ["RFC process for changes", "Backward-compat required", "Deprecation windows ≥ 90d", "Owner per entity"],
      },
      {
        heading: "Recent Changes",
        items: ["Added policy.control_map", "Deprecated legacy.customer_id", "Split incident.severity into 2 fields"],
      },
    ],
    workflow: ["Propose RFC", "Review compat", "Version bump", "Publish", "Migrate producers", "Deprecate old"],
  },
  {
    slug: "relationship-key-and-graph-projection-builder",
    title: "Relationship, Key, and Graph Projection Builder",
    group: g("Model & Graph"),
    tagline: "Turn events into a queryable knowledge graph — reliably",
    purpose:
      "Manages join keys, relationship types, and graph projections so agentic reasoning can traverse services → assets → incidents → customers with confidence.",
    metrics: [
      { label: "Relationships", value: "212", sub: "Typed & indexed", tone: "blue" },
      { label: "Key Coverage", value: "98%", sub: "Records w/ join keys", tone: "emerald" },
      { label: "Graph Nodes", value: "4.2M", sub: "Projected daily", tone: "blue" },
      { label: "Traversal p95", value: "84ms", sub: "3-hop query", tone: "emerald" },
    ],
    columns: [
      {
        heading: "Key Relationships",
        items: ["service.owns → asset", "change.affects → service", "incident.impacts → customer", "policy.governs → asset"],
      },
      {
        heading: "Projections",
        items: ["Blast-radius graph", "Ownership graph", "Compliance graph", "Cost-attribution graph"],
      },
      {
        heading: "Key Health",
        items: ["Composite keys documented", "Stale key detection", "Cardinality alarms"],
      },
    ],
    workflow: ["Declare relationship", "Bind keys", "Build projection", "Index for traversal", "Serve queries", "Monitor freshness"],
  },
  {
    slug: "query-readiness-and-confidence-scorecard",
    title: "Query Readiness and Confidence Scorecard",
    group: g("Query & Performance"),
    tagline: "Know exactly which questions the data can answer well — right now",
    purpose:
      "Per-domain scorecard rating whether the data is complete, fresh, and correlated enough for humans and agents to trust the answer.",
    metrics: [
      { label: "Domains Ready", value: "22 / 24", sub: "≥ 90 score", tone: "emerald" },
      { label: "Avg Confidence", value: "91", sub: "Blended across domains", tone: "emerald" },
      { label: "At Risk", value: "2", sub: "Below 80 score", tone: "amber" },
      { label: "Untrusted Answers", value: "0.6%", sub: "Auto-flagged to users", tone: "blue" },
    ],
    columns: [
      {
        heading: "Score Inputs",
        items: ["Completeness", "Freshness", "Correlation", "Lineage certainty", "Model accuracy"],
      },
      {
        heading: "Top Domains",
        items: ["Reliability — 96", "Change — 94", "Cost — 92", "Security — 88", "Customer CX — 82"],
      },
      {
        heading: "Watchlist",
        items: ["Customer CX (missing survey join)", "Vendor perf (sparse SLA data)"],
      },
    ],
    workflow: ["Compute per-domain score", "Publish scorecard", "Flag low-confidence answers", "Route to backlog", "Re-score daily"],
  },
  {
    slug: "performance-latency-and-freshness-lab",
    title: "Performance, Latency, and Freshness Lab",
    group: g("Query & Performance"),
    tagline: "Continuously benchmark the whole pipeline against its SLOs",
    purpose:
      "Runs synthetic and shadow traffic against pipelines and graph queries to keep latency and freshness inside contracted SLOs.",
    metrics: [
      { label: "SLO Attainment", value: "99.4%", sub: "Rolling 30d", tone: "emerald" },
      { label: "Freshness p95", value: "18s", sub: "Ingest → queryable", tone: "emerald" },
      { label: "Query p95", value: "180ms", sub: "Hydrated record read", tone: "emerald" },
      { label: "Regression Alarms", value: "3", sub: "Active this week", tone: "amber" },
    ],
    columns: [
      {
        heading: "Bench Suites",
        items: ["Hot query set", "Graph traversal set", "Agentic multi-hop set", "Cold replay set"],
      },
      {
        heading: "Regressions",
        items: ["Graph 3-hop +23ms after v4.2 model bump", "Cold replay slower on new tier", "SFDC pull latency spike"],
      },
      {
        heading: "Tuning Levers",
        items: ["Index rebuild cadence", "Cache warmers", "Placement retiering", "Pre-aggregation"],
      },
    ],
    workflow: ["Author bench", "Run scheduled", "Compare to SLO", "Alarm on regression", "Tune", "Re-baseline"],
  },
  {
    slug: "context-graph-and-agentic-query-handoff-layer",
    title: "Context Graph and Agentic Query Handoff Layer",
    group: g("Query & Performance"),
    tagline: "Where hydrated data becomes agent-ready context",
    purpose:
      "Serves the canonical graph + hydrated records to AI coworkers with the auth, scoping, and citations required for trustworthy agentic answers.",
    metrics: [
      { label: "Agents Served", value: "27", sub: "Across SRE, Sec, FinOps", tone: "blue" },
      { label: "Grounded Answers", value: "94%", sub: "With cited evidence", tone: "emerald" },
      { label: "Hallucination Rate", value: "0.9%", sub: "Below 2% target", tone: "emerald" },
      { label: "Avg Context Size", value: "12K tok", sub: "Per query", tone: "blue" },
    ],
    columns: [
      {
        heading: "Handoff Interfaces",
        items: ["Graph query API", "Hydrated record fetch", "Semantic search over context", "Streaming event tap"],
      },
      {
        heading: "Guarantees to Agents",
        items: ["Field-level lineage", "Freshness stamp", "Scoped access", "Cited evidence for every claim"],
      },
      {
        heading: "Top Agent Uses",
        items: ["Incident triage", "Change risk read", "Cost anomaly attribution", "Compliance evidence build"],
      },
    ],
    workflow: ["Agent query", "Scope + auth", "Traverse graph", "Fetch records", "Attach citations", "Return grounded answer"],
  },
  {
    slug: "data-gap-register-and-engineering-backlog",
    title: "Data Gap Register and Engineering Backlog",
    group: g("Delivery"),
    tagline: "Every known gap, prioritized, with an owner and a date",
    purpose:
      "Consolidated backlog of missing data, weak enrichments, and blocked use cases — sized, prioritized, and burned down each sprint.",
    metrics: [
      { label: "Open Gaps", value: "63", sub: "Across 12 domains", tone: "amber" },
      { label: "Closed (30d)", value: "22", sub: "Burn-down healthy", tone: "emerald" },
      { label: "Blocked Use Cases", value: "9", sub: "Awaiting data", tone: "amber" },
      { label: "Avg Time to Close", value: "11d", sub: "Median", tone: "blue" },
    ],
    columns: [
      {
        heading: "Top Gaps",
        items: [
          "No trace_id from legacy app-x",
          "Vendor SLA breach signal missing",
          "Customer sentiment not joined to incident",
          "OT alarm severity not standardized",
        ],
      },
      {
        heading: "Priority Signals",
        items: ["Blocked use case count", "SLO risk", "Compliance exposure", "$ opportunity"],
      },
      {
        heading: "This Sprint",
        items: ["Ship trace_id shim for app-x", "Vendor SLA feed contract", "Sentiment join proto"],
      },
    ],
    workflow: ["Log gap", "Score priority", "Assign owner", "Sprint plan", "Deliver", "Verify closure"],
  },
  {
    slug: "sow-execution-plan-and-acceptance-dashboard",
    title: "SOW Execution Plan and Acceptance Dashboard",
    group: g("Delivery"),
    tagline: "Prove the SOW is on track — with acceptance criteria met, milestone by milestone",
    purpose:
      "Executive-grade view of SOW milestones, acceptance criteria, evidence links, and burndown against dates and dollars.",
    metrics: [
      { label: "Milestones Complete", value: "6 / 9", sub: "67%", tone: "emerald" },
      { label: "Acceptance Passed", value: "48 / 54", sub: "Criteria met", tone: "emerald" },
      { label: "Schedule Variance", value: "-2d", sub: "Ahead of plan", tone: "emerald" },
      { label: "Cost Variance", value: "+1.4%", sub: "Within tolerance", tone: "blue" },
    ],
    columns: [
      {
        heading: "Milestones",
        items: [
          "M1 Scope Registry — ✓",
          "M2 Onboarding Factory — ✓",
          "M3 Canonical Model — UAT",
          "M4 Agentic Handoff — Design",
          "M5 Value Realization — Planned",
        ],
      },
      {
        heading: "Acceptance Criteria",
        items: [
          "≥ 90% domains query-ready",
          "≤ 30s p95 freshness",
          "≤ 3% duplication",
          "Full lineage on tier-1 fields",
        ],
      },
      {
        heading: "Evidence Attached",
        items: ["Readiness scorecards", "Freshness bench runs", "Lineage exports", "Auditor sign-offs"],
      },
    ],
    workflow: ["Publish milestone plan", "Define acceptance", "Attach evidence", "Review with sponsor", "Sign off", "Advance"],
  },
];

export const doGroups = Array.from(new Set(doPages.map((p) => p.group)));
