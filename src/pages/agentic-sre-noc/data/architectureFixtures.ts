/**
 * Synthetic reference-architecture fixtures for the page
 * "Taara Global Link Health Twin, Production Architecture".
 *
 * Every record here is a proposed, synthetic reference design. Nothing in this
 * file describes a system that is currently deployed at Taara Communications.
 */

export type FlowKind =
  | "data" | "events" | "agent" | "recommendation" | "approval"
  | "command" | "validation" | "rollback" | "learning" | "customer";

export interface FlowMeta {
  key: FlowKind;
  label: string;
  color: string;
  dash: string;
  lineLabel: string;
  description: string;
}

export const flowTypes: FlowMeta[] = [
  { key: "data", label: "Data Flow", color: "#2563eb", dash: "none", lineLabel: "solid", description: "Telemetry and records moving from sources into storage and the twin model." },
  { key: "events", label: "Events and Messages", color: "#d97706", dash: "6 3", lineLabel: "long dash", description: "Asynchronous events published on the streaming backbone." },
  { key: "agent", label: "Agent Collaboration", color: "#7c3aed", dash: "1 3", lineLabel: "dotted", description: "Bounded reasoning and evidence exchange between specialised agents." },
  { key: "recommendation", label: "Recommendations", color: "#7c3aed", dash: "8 3 2 3", lineLabel: "dash dot", description: "Ranked, scored action proposals with rationale and evidence." },
  { key: "approval", label: "Human Approvals", color: "#0f172a", dash: "4 2", lineLabel: "short dash", description: "Human-in-the-loop authorisation for policy-bound actions." },
  { key: "command", label: "Commands and Control", color: "#059669", dash: "none", lineLabel: "solid", description: "Approved, guardrailed commands dispatched to execution targets." },
  { key: "validation", label: "Validation Feedback", color: "#0d9488", dash: "5 2", lineLabel: "medium dash", description: "Post-action service checks confirming the customer outcome." },
  { key: "rollback", label: "Rollback", color: "#dc2626", dash: "2 2", lineLabel: "fine dash", description: "Exception and rollback triggers returning the estate to a known state." },
  { key: "learning", label: "Learning Feedback", color: "#7c3aed", dash: "6 4", lineLabel: "dashed", description: "Confirmed causes, runbooks and thresholds written back to the twin." },
  { key: "customer", label: "Customer Outcome Flow", color: "#64748b", dash: "3 3", lineLabel: "dotted", description: "Service, SLO and customer experience reporting." },
];

export const deploymentViews = [
  "Logical Architecture", "Runtime Architecture", "Data Flow", "Agentic Flow",
  "Control and Execution", "Security and Governance", "Customer Service Flow",
  "Failure and Recovery Flow",
] as const;

export const cloudViews = [
  "Cloud Neutral", "Google Cloud Example", "Hybrid Deployment",
  "Customer-Hosted Control Plane", "Edge and Cloud Split",
] as const;

export const detailLevels = [
  "Executive", "Operational", "Engineering", "Security", "Data", "Full Detail",
] as const;

export type DetailLevel = (typeof detailLevels)[number];

export interface ArchComponent {
  id: string;
  name: string;
  role: string;
  detail: DetailLevel[];        // levels at which this component is shown
  technology: string[];         // cloud-neutral technology options
  gcp: string;                  // Google Cloud example mapping
  inputs: string[];
  outputs: string[];
  interfaces: string[];
  data: string[];
  failure: string;
  security: string;
  metrics: string[];
  synthetic: string;            // synthetic demonstration value
}

export interface ArchZone {
  id: string;
  column: number;               // 1..8 left to right reading order
  title: string;
  purpose: string;
  band: "core" | "cross";
  flows: FlowKind[];
  views: string[];              // deployment views in which the zone is emphasised
  components: ArchComponent[];
}

const all: DetailLevel[] = ["Executive", "Operational", "Engineering", "Security", "Data", "Full Detail"];
const eng: DetailLevel[] = ["Operational", "Engineering", "Full Detail"];
const sec: DetailLevel[] = ["Security", "Engineering", "Full Detail"];
const dat: DetailLevel[] = ["Data", "Engineering", "Full Detail"];

export const architectureZones: ArchZone[] = [
  {
    id: "sources", column: 1, band: "core",
    title: "Data Sources",
    purpose: "Systems of record and measurement that describe the optical estate, the network, the environment and the customer.",
    flows: ["data", "events"],
    views: ["Logical Architecture", "Data Flow", "Customer Service Flow", "Failure and Recovery Flow"],
    components: [
      {
        id: "src-lightbridge", name: "Lightbridge Optical Terminals", role: "Beam, link and device telemetry from optical wireless terminals.",
        detail: all, technology: ["gNMI streaming", "SNMP", "MQTT", "Terminal vendor API"], gcp: "Cloud Run collector fronting terminal APIs",
        inputs: ["Beam lock state", "Received optical power", "Link margin", "Attenuation", "Terminal alarms"],
        outputs: ["Normalised terminal telemetry stream"],
        interfaces: ["gNMI subscribe", "REST poll", "Alarm webhook"],
        data: ["Time series", "Device inventory", "Alarm events"],
        failure: "Terminal unreachable, telemetry staleness flagged and link confidence downgraded.",
        security: "Read-only credentials, per-terminal scoped identity, no command path from ingestion.",
        metrics: ["Sample interval 10s", "Freshness target < 30s", "Coverage 100% of monitored links"],
        synthetic: "34 synthetic links across 10 regions, 6 Chennai links under watch.",
      },
      {
        id: "src-network", name: "Network and IT Systems", role: "Routers, switches, interface counters, routing and QoS state.",
        detail: all, technology: ["Syslog", "SNMP", "gNMI", "Streaming telemetry"], gcp: "Pub/Sub ingest topic per domain",
        inputs: ["Interface counters", "Routing state", "QoS policy", "Handoff status"],
        outputs: ["Network state records"], interfaces: ["Syslog", "gNMI", "REST"],
        data: ["Interface metrics", "Topology", "Config state"],
        failure: "Partial domain outage isolated; twin marks affected segments as low confidence.",
        security: "Read-only NMS accounts, network segmentation, no write access.",
        metrics: ["Poll 30s", "Retention 13 months"],
        synthetic: "Synthetic handoff metrics for 30+ sites.",
      },
      {
        id: "src-weather", name: "Weather and Environment", role: "Visibility, fog, rain, wind, temperature and forecast feeds.",
        detail: all, technology: ["Provider REST APIs", "Station feeds", "Forecast model pulls"], gcp: "Scheduled Cloud Run jobs writing to BigQuery",
        inputs: ["Visibility", "Precipitation", "Wind", "Humidity", "Forecast horizon"],
        outputs: ["Environmental risk features"], interfaces: ["REST", "Bulk file"],
        data: ["Observations", "Forecasts", "Historical climatology"],
        failure: "Provider outage falls back to secondary provider and widens prediction confidence intervals.",
        security: "Outbound-only egress through an allowlisted proxy.",
        metrics: ["Refresh 15m", "Forecast horizon 24h"],
        synthetic: "Chennai fog degradation scenario over a six-hour window.",
      },
      {
        id: "src-business", name: "Business and Service Systems", role: "Customer, service, inventory, SLO and change records.",
        detail: all, technology: ["CMDB", "Inventory API", "Contract and SLO store", "Change management"], gcp: "Cloud SQL replicas and scheduled extracts",
        inputs: ["Customer services", "Service routes", "SLO targets", "Change windows"],
        outputs: ["Service context records"], interfaces: ["REST", "Database sync"],
        data: ["Customers", "Services", "SLOs", "Change calendar"],
        failure: "Stale context is flagged; risk still calculated but impact confidence reduced.",
        security: "Field-level minimisation, customer identifiers pseudonymised in analytics.",
        metrics: ["Sync 1h", "Context completeness target 99%"],
        synthetic: "12 synthetic customer services exposed to the Chennai condition.",
      },
      {
        id: "src-external", name: "External Systems", role: "ITSM, CMDB, identity and notification platforms.",
        detail: all, technology: ["ServiceNow", "CMDB", "Okta or Azure AD", "Email and SMS gateways"], gcp: "Integration adapters on Cloud Run",
        inputs: ["Incidents", "Changes", "Identity and group membership"],
        outputs: ["Incident correlation", "Authorisation context"], interfaces: ["REST", "Webhook", "OIDC"],
        data: ["Incidents", "Changes", "Roles"],
        failure: "Queued and retried with idempotency keys; operations continue without ticket linkage.",
        security: "OIDC federation, least-privilege service principals, signed webhooks.",
        metrics: ["Webhook latency < 2s"],
        synthetic: "Synthetic ITSM incident linkage for situation SIT-2026-0417.",
      },
    ],
  },
  {
    id: "ingestion", column: 2, band: "core",
    title: "Ingestion and Collection",
    purpose: "Collect, authenticate, buffer and timestamp every inbound signal without applying business logic.",
    flows: ["data", "events"],
    views: ["Logical Architecture", "Runtime Architecture", "Data Flow"],
    components: [
      {
        id: "ing-stream", name: "Streaming Telemetry Collectors", role: "gNMI, SNMP, MQTT and syslog collection at scale.",
        detail: all, technology: ["Telegraf", "gNMIc", "Vector", "Custom collectors"], gcp: "GKE collector pool writing to Pub/Sub",
        inputs: ["Terminal and network streams"], outputs: ["Timestamped raw records"],
        interfaces: ["gNMI", "SNMP", "MQTT", "Syslog"], data: ["Raw metric records"],
        failure: "Collector pool is horizontally scaled; local disk buffer absorbs downstream backpressure.",
        security: "mTLS to sources, credentials in a managed secret store, no outbound command channel.",
        metrics: ["Sustained 250k samples/min", "Buffer 15 minutes"],
        synthetic: "Deterministic replay of the Chennai six-hour window.",
      },
      {
        id: "ing-api", name: "API Connectors", role: "REST and webhook connectors for business and external systems.",
        detail: eng, technology: ["Connector framework", "Webhook receivers"], gcp: "Cloud Run services with Pub/Sub push",
        inputs: ["Service, customer, incident and change records"], outputs: ["Structured events"],
        interfaces: ["REST", "Webhook"], data: ["Business records"],
        failure: "Retry with exponential backoff and dead-letter topic.",
        security: "Signature verification and per-connector service identity.",
        metrics: ["p95 connector latency 400ms"],
        synthetic: "Synthetic ITSM and change feeds.",
      },
      {
        id: "ing-batch", name: "Batch and Scheduled Ingestion", role: "Files, exports and periodic database synchronisation.",
        detail: dat, technology: ["Scheduled jobs", "Object drop zones", "CDC"], gcp: "Cloud Scheduler with Cloud Run jobs",
        inputs: ["Inventory exports", "Historical archives"], outputs: ["Batch-loaded datasets"],
        interfaces: ["SFTP", "Object storage", "JDBC"], data: ["Reference data"],
        failure: "Idempotent loads keyed on batch identifier; partial loads are rolled back.",
        security: "Encrypted at rest, checksum verification on arrival.",
        metrics: ["Nightly load window 20 minutes"],
        synthetic: "Static synthetic estate definition.",
      },
      {
        id: "ing-weather", name: "Weather Ingestion", role: "Environmental provider integration and normalisation to a common schema.",
        detail: eng, technology: ["Provider SDKs", "Geospatial normalisation"], gcp: "Cloud Run job to BigQuery",
        inputs: ["Observations and forecasts"], outputs: ["Geo-indexed environmental features"],
        interfaces: ["REST"], data: ["Weather features"],
        failure: "Dual-provider strategy with automatic failover.",
        security: "No customer data leaves the platform to weather providers.",
        metrics: ["Refresh 15m", "Grid resolution 5km"],
        synthetic: "Chennai visibility decline curve.",
      },
    ],
  },
  {
    id: "bus", column: 2, band: "core",
    title: "Event and Streaming Backbone",
    purpose: "Decouple producers from consumers and provide replay, ordering and fan-out for every operational event.",
    flows: ["events"],
    views: ["Runtime Architecture", "Data Flow", "Agentic Flow", "Failure and Recovery Flow"],
    components: [
      {
        id: "bus-kafka", name: "Event Bus", role: "Durable, partitioned, replayable event transport.",
        detail: all, technology: ["Apache Kafka", "Managed Kafka", "Pulsar"], gcp: "Pub/Sub with ordering keys, or Managed Kafka",
        inputs: ["Collector output", "Agent events", "Action events"],
        outputs: ["Topic subscriptions for processing, agents and observability"],
        interfaces: ["Kafka protocol", "Pub/Sub push and pull"],
        data: ["Telemetry topics", "Situation topics", "Action topics", "Audit topics"],
        failure: "Multi-zone replication, consumer lag alarms, replay from retained offsets.",
        security: "Per-topic ACLs, encryption in transit and at rest, no cross-tenant topics.",
        metrics: ["Retention 7 days", "p99 publish latency 40ms"],
        synthetic: "Deterministic local event sequence in this demonstration.",
      },
    ],
  },
  {
    id: "processing", column: 3, band: "core",
    title: "Data Processing and Normalization",
    purpose: "Turn raw signals into trustworthy, schema-governed, quality-checked operational data.",
    flows: ["data"],
    views: ["Data Flow", "Runtime Architecture"],
    components: [
      {
        id: "proc-stream", name: "Stream Processing", role: "Windowed aggregation, unit normalisation and enrichment in flight.",
        detail: dat, technology: ["Apache Flink", "Apache Beam", "Spark Structured Streaming"], gcp: "Dataflow streaming pipelines",
        inputs: ["Raw topics"], outputs: ["Normalised link and service metrics"],
        interfaces: ["Streaming SQL", "Pipeline SDK"], data: ["Windowed metrics"],
        failure: "Checkpointed state with exactly-once sinks; restart from last checkpoint.",
        security: "Workload identity, no long-lived keys.",
        metrics: ["End-to-end p95 8s", "Watermark lag < 20s"],
        synthetic: "Precomputed rolling windows for the scenario.",
      },
      {
        id: "proc-etl", name: "ELT Pipelines", role: "Modelled, tested, versioned batch transformations.",
        detail: dat, technology: ["dbt", "Dataform", "Airflow"], gcp: "Dataform on BigQuery",
        inputs: ["Landed raw tables"], outputs: ["Curated marts for health, capacity and SLO"],
        interfaces: ["SQL models"], data: ["Curated marts"],
        failure: "Model-level retries with lineage-aware backfill.",
        security: "Column-level policy tags applied in the transformation layer.",
        metrics: ["Model suite runtime 9 minutes"],
        synthetic: "Static curated marts.",
      },
      {
        id: "proc-quality", name: "Data Quality and Validation", role: "Freshness, completeness, range and referential assertions on every dataset.",
        detail: dat, technology: ["Great Expectations", "Soda", "Custom assertions"], gcp: "Dataform assertions plus Cloud Monitoring",
        inputs: ["Curated datasets"], outputs: ["Quality verdict and confidence score"],
        interfaces: ["Assertion suite"], data: ["Quality results"],
        failure: "Failing datasets are quarantined and the twin lowers decision confidence.",
        security: "Quality results are auditable evidence.",
        metrics: ["Assertion pass rate target 99.5%"],
        synthetic: "All synthetic datasets pass with confidence 92%.",
      },
      {
        id: "proc-schema", name: "Schema, Metadata and Catalog", role: "Contract enforcement, lineage and discoverability.",
        detail: dat, technology: ["Schema registry", "Data catalog", "Contract tests"], gcp: "Dataplex and Data Catalog",
        inputs: ["Schemas and lineage"], outputs: ["Governed contracts"],
        interfaces: ["Registry API"], data: ["Metadata"],
        failure: "Incompatible schema changes are rejected at publish time.",
        security: "Policy tags drive downstream access control.",
        metrics: ["100% of topics under contract"],
        synthetic: "Fixed schema set for the demonstration.",
      },
    ],
  },
  {
    id: "storage", column: 3, band: "core",
    title: "Data Platform and Storage",
    purpose: "Persist time series, relational, graph, object and feature data with the right access pattern for each consumer.",
    flows: ["data"],
    views: ["Data Flow", "Runtime Architecture", "Logical Architecture"],
    components: [
      {
        id: "st-tsdb", name: "Time Series Store", role: "High-cardinality optical and network metrics.",
        detail: dat, technology: ["TimescaleDB", "Prometheus long-term store", "Columnar warehouse"], gcp: "BigQuery with partitioned metric tables",
        inputs: ["Normalised metrics"], outputs: ["Trend, baseline and anomaly queries"],
        interfaces: ["SQL", "PromQL"], data: ["Metric series"],
        failure: "Regional replicas with read failover.",
        security: "Row-level access by tenant and region.",
        metrics: ["Retention 13 months", "p95 query 1.2s"],
        synthetic: "Seven-day synthetic trend series per link.",
      },
      {
        id: "st-rdb", name: "Operational Data Store", role: "Services, customers, situations, actions and approvals.",
        detail: dat, technology: ["PostgreSQL", "Managed relational"], gcp: "Cloud SQL for PostgreSQL",
        inputs: ["Curated records"], outputs: ["Transactional reads and writes"],
        interfaces: ["SQL"], data: ["Situations", "Actions", "Approvals", "Outcomes"],
        failure: "Synchronous replica with point-in-time recovery.",
        security: "Row-level security by tenant, encrypted at rest.",
        metrics: ["RPO 5 minutes", "RTO 30 minutes"],
        synthetic: "Local fixture data only.",
      },
      {
        id: "st-graph", name: "Graph and Topology Store", role: "Service, route, terminal and dependency relationships.",
        detail: dat, technology: ["Neo4j", "JanusGraph", "Relational graph model"], gcp: "AlloyDB or Spanner graph model",
        inputs: ["Topology and dependency records"], outputs: ["Impact traversal results"],
        interfaces: ["Graph query"], data: ["Nodes and edges"],
        failure: "Rebuildable from source of record within one hour.",
        security: "Traversal scoped to caller entitlements.",
        metrics: ["Impact traversal p95 300ms"],
        synthetic: "30+ sites, 34 links, 12 services.",
      },
      {
        id: "st-object", name: "Object Storage", role: "Evidence bundles, logs, exports and model artefacts.",
        detail: dat, technology: ["Object storage with lifecycle policies"], gcp: "Cloud Storage with retention locks",
        inputs: ["Evidence and exports"], outputs: ["Immutable artefacts"],
        interfaces: ["S3-compatible API"], data: ["Evidence bundles"],
        failure: "Multi-region durability.",
        security: "Write-once retention for audit evidence.",
        metrics: ["Durability 11 nines target"],
        synthetic: "Evidence bundles rendered locally.",
      },
      {
        id: "st-feature", name: "Feature Store", role: "Versioned features for risk and anomaly models.",
        detail: dat, technology: ["Feast", "Managed feature store"], gcp: "Vertex AI Feature Store",
        inputs: ["Engineered features"], outputs: ["Consistent training and serving features"],
        interfaces: ["Online and offline read"], data: ["Feature values"],
        failure: "Serving falls back to deterministic thresholds when features are unavailable.",
        security: "No raw customer identifiers in features.",
        metrics: ["Online read p95 25ms"],
        synthetic: "Fixed feature snapshot.",
      },
    ],
  },
  {
    id: "twin", column: 4, band: "core",
    title: "Digital Twin Model",
    purpose: "A service-aware model of the estate that makes every signal interpretable in customer terms.",
    flows: ["data", "customer"],
    views: ["Logical Architecture", "Customer Service Flow", "Data Flow"],
    components: [
      {
        id: "twin-model", name: "Twin Object Model", role: "Regions, sites, terminals, optical links, service routes, customers, dependencies, fallback paths, SLOs and policies.",
        detail: all, technology: ["Domain model service", "Graph-backed projections"], gcp: "Cloud Run services over AlloyDB and BigQuery",
        inputs: ["Curated data", "Topology", "Service context"],
        outputs: ["Service-aware state of every link and customer service"],
        interfaces: ["Twin query API", "Snapshot API"],
        data: ["Entities", "Relationships", "State history"],
        failure: "Twin state is reconstructable by replaying events from the backbone.",
        security: "Entitlement filtering applied on every twin read.",
        metrics: ["State freshness < 60s", "Snapshot on every situation transition"],
        synthetic: "The Chennai Link Protection scenario state machine.",
      },
      {
        id: "twin-state", name: "Situation State Machine", role: "Formation, deduplication, lifecycle and closure of operational situations.",
        detail: eng, technology: ["Workflow state service", "Event sourcing"], gcp: "Workflows plus Cloud SQL",
        inputs: ["Detections and correlations"], outputs: ["Situations with lifecycle state"],
        interfaces: ["State API"], data: ["Situation records"],
        failure: "Deterministic replay from the situation event log.",
        security: "Immutable transition log.",
        metrics: ["Deduplication ratio target 6:1"],
        synthetic: "SIT-2026-0417, Chennai fog degradation.",
      },
    ],
  },
  {
    id: "analytics", column: 5, band: "core",
    title: "Analytics and Engineering Services",
    purpose: "Deterministic engineering calculations. These produce the numbers that decisions rely on.",
    flows: ["data", "recommendation"],
    views: ["Logical Architecture", "Runtime Architecture", "Data Flow", "Failure and Recovery Flow"],
    components: [
      {
        id: "an-health", name: "Health Calculation Service", role: "Link, route, service and SLO health scoring from measured values.",
        detail: all, technology: ["Deterministic scoring service"], gcp: "Cloud Run service with BigQuery reads",
        inputs: ["Link margin", "Optical power", "Throughput", "Latency", "Loss"],
        outputs: ["Health scores with contributing factors"],
        interfaces: ["gRPC", "REST"], data: ["Scores and factors"],
        failure: "Returns partial scores with explicit confidence rather than guessing.",
        security: "No model inference in the scoring path.",
        metrics: ["Deterministic and reproducible", "p95 180ms"],
        synthetic: "Chennai links scored at moderate to high risk.",
      },
      {
        id: "an-anomaly", name: "Anomaly Detection", role: "Per-link baselines and statistical deviation detection.",
        detail: eng, technology: ["Statistical baselines", "Seasonal decomposition", "Supervised classifiers"], gcp: "Vertex AI with BigQuery ML",
        inputs: ["Historical baselines", "Current series"], outputs: ["Ranked deviations with direction and rate"],
        interfaces: ["Batch and online scoring"], data: ["Deviation records"],
        failure: "Falls back to threshold detection when models are unavailable.",
        security: "Model versions pinned and auditable.",
        metrics: ["Precision target 0.9", "Detection lead time 45 minutes"],
        synthetic: "Chennai margin decline detected before threshold breach.",
      },
      {
        id: "an-forecast", name: "Forecasting and Prediction", role: "Risk probability, likely cause and expected time to impact.",
        detail: eng, technology: ["Gradient boosting", "Time series models", "Physics-informed attenuation models"], gcp: "Vertex AI prediction endpoints",
        inputs: ["Deviation", "Environmental forecast", "Historical degradation patterns"],
        outputs: ["Risk probability, confidence and intervention window"],
        interfaces: ["Prediction API"], data: ["Predictions"],
        failure: "Confidence widens when input features are stale.",
        security: "Explainability output retained with every prediction.",
        metrics: ["Brier score tracked weekly", "Horizon 6 hours"],
        synthetic: "Three Chennai links at high predicted risk within six hours.",
      },
      {
        id: "an-capacity", name: "Capacity and Impact Analysis", role: "Customer, capacity, SLO and error-budget exposure.",
        detail: all, technology: ["Graph traversal", "Deterministic rollup"], gcp: "AlloyDB graph traversal plus Cloud Run",
        inputs: ["Twin dependencies", "Committed capacity", "SLO targets"],
        outputs: ["Quantified exposure per condition"],
        interfaces: ["REST"], data: ["Impact records"],
        failure: "Falls back to conservative worst-case exposure.",
        security: "Customer data minimised in outputs.",
        metrics: ["Traversal p95 300ms"],
        synthetic: "12 services and 820 Gbps of committed capacity exposed.",
      },
      {
        id: "an-correlate", name: "Signal Correlation Engine", role: "Multi-signal, multi-source correlation across optical, network, weather and change data.",
        detail: eng, technology: ["Correlation rules", "Temporal clustering"], gcp: "Dataflow plus Cloud Run",
        inputs: ["Deviations", "Events", "Change records"], outputs: ["Correlated candidate conditions"],
        interfaces: ["Streaming"], data: ["Correlation sets"],
        failure: "Degrades to single-domain detection.",
        security: "Deterministic and inspectable rules.",
        metrics: ["Correlation window 30 minutes"],
        synthetic: "Fog onset correlated with margin decline across six links.",
      },
    ],
  },
  {
    id: "agentic", column: 5, band: "core",
    title: "Agentic Intelligence Layer",
    purpose: "Specialised agents that gather evidence, reason within bounds and coordinate. They consume deterministic analytics, they do not replace them.",
    flows: ["agent", "recommendation", "events"],
    views: ["Agentic Flow", "Logical Architecture", "Runtime Architecture"],
    components: [
      {
        id: "ag-orchestrator", name: "Agent Orchestration", role: "Bounded, observable multi-agent workflow with explicit step limits and tool permissions.",
        detail: all, technology: ["Graph-based agent orchestration", "Typed tool interfaces"], gcp: "Vertex AI agent engine on Cloud Run",
        inputs: ["Situation context", "Analytics outputs"], outputs: ["Coordinated evidence and candidate actions"],
        interfaces: ["Tool calling", "State store"], data: ["Agent state and traces"],
        failure: "Step and time budgets stop runaway loops; partial evidence is still published.",
        security: "Per-agent tool allowlists, no direct execution credentials.",
        metrics: ["Step budget 50", "Median run 40s"],
        synthetic: "Eight agents run the Chennai investigation deterministically.",
      },
      {
        id: "ag-shared", name: "Shared Memory and State Store", role: "Agent state, context, policies and history shared across a situation.",
        detail: eng, technology: ["Durable state store", "Vector and relational hybrid"], gcp: "Cloud SQL plus Vertex AI vector search",
        inputs: ["Agent writes"], outputs: ["Consistent situation context"],
        interfaces: ["State API"], data: ["Context records"],
        failure: "Situation continues with degraded recall; deterministic evidence remains authoritative.",
        security: "Situation-scoped isolation.",
        metrics: ["Read p95 30ms"],
        synthetic: "Single-situation context.",
      },
      {
        id: "ag-evidence", name: "Evidence Curator Agent", role: "Collects, structures, deduplicates and maintains the evidence record.",
        detail: all, technology: ["Retrieval and summarisation with citation enforcement"], gcp: "Vertex AI models with grounded citations",
        inputs: ["Analytics results", "Telemetry excerpts", "Prior incidents"],
        outputs: ["Structured evidence bundle with citations"],
        interfaces: ["Tool calling"], data: ["Evidence bundle"],
        failure: "Uncited claims are dropped rather than surfaced.",
        security: "Every assertion is traceable to a source record.",
        metrics: ["Citation coverage 100%"],
        synthetic: "22 evidence items for the Chennai situation.",
      },
    ],
  },
  {
    id: "reasoning", column: 6, band: "core",
    title: "Reasoning and Decision Services",
    purpose: "Convert evidence into ranked, explainable recommendations with confidence and rationale.",
    flows: ["recommendation", "agent"],
    views: ["Agentic Flow", "Logical Architecture", "Control and Execution"],
    components: [
      {
        id: "rs-rootcause", name: "Root Cause Analysis", role: "Hypothesis generation, elimination and confirmation against evidence.",
        detail: all, technology: ["Hypothesis engine", "Evidence scoring"], gcp: "Cloud Run service with Vertex AI reasoning",
        inputs: ["Evidence bundle", "Historical patterns"], outputs: ["Ranked causes with eliminated alternatives"],
        interfaces: ["REST"], data: ["Hypotheses"],
        failure: "Returns unresolved with the strongest partial hypothesis.",
        security: "Rationale retained for audit.",
        metrics: ["Confirmed cause rate target 85%"],
        synthetic: "Fog-driven attenuation confirmed, hardware fault eliminated.",
      },
      {
        id: "rs-recommend", name: "Recommendation Engine", role: "Scores candidate actions on outcome, technical risk, customer impact, reversibility and fallback readiness.",
        detail: all, technology: ["Deterministic scoring with policy constraints"], gcp: "Cloud Run scoring service",
        inputs: ["Causes", "Impact", "Policy", "Fallback headroom"],
        outputs: ["Ranked recommendations with approval requirement and rollback path"],
        interfaces: ["REST"], data: ["Recommendations"],
        failure: "Defaults to the least invasive monitoring action.",
        security: "Actions outside policy are never surfaced as executable.",
        metrics: ["Recommendation acceptance tracked monthly"],
        synthetic: "Monitoring increase and fallback validation recommended, traffic move held.",
      },
      {
        id: "rs-explain", name: "Confidence and Explainability", role: "Evidence, rationale and uncertainty presented with every decision.",
        detail: sec, technology: ["Explainability service"], gcp: "Cloud Run with artefact storage",
        inputs: ["Model outputs", "Evidence"], outputs: ["Human-readable rationale and confidence"],
        interfaces: ["REST"], data: ["Explanations"],
        failure: "No explanation means no recommendation is presented.",
        security: "Explanations are part of the audit record.",
        metrics: ["Explanation attached to 100% of recommendations"],
        synthetic: "Confidence 92% with stated assumptions.",
      },
    ],
  },
  {
    id: "policy", column: 6, band: "core",
    title: "Policy, Approval and Governance",
    purpose: "Decide what may run automatically, what needs a human, and what is forbidden.",
    flows: ["approval", "recommendation"],
    views: ["Security and Governance", "Control and Execution", "Failure and Recovery Flow"],
    components: [
      {
        id: "pol-engine", name: "Policy and Guardrail Service", role: "Rules, constraints, blast-radius limits, change freezes and autonomy levels.",
        detail: all, technology: ["Policy-as-code", "Rule evaluation service"], gcp: "Cloud Run with policy repository in source control",
        inputs: ["Recommendation", "Context", "Autonomy level", "Change calendar"],
        outputs: ["Permit, permit-with-approval or deny with reason"],
        interfaces: ["REST evaluation API"], data: ["Policies and decisions"],
        failure: "Fail closed. An unavailable policy service blocks execution.",
        security: "Policy changes are reviewed, versioned and audited.",
        metrics: ["Evaluation p95 60ms", "Policy coverage 100% of action types"],
        synthetic: "Traffic movement requires named human approval.",
      },
      {
        id: "pol-approval", name: "Approval and Workflow", role: "Human-in-the-loop authorisation with named approver, expiry and delegation.",
        detail: all, technology: ["Approval workflow service", "Notification adapters"], gcp: "Workflows plus Cloud SQL and notification adapters",
        inputs: ["Permitted actions requiring approval"], outputs: ["Signed approval or rejection"],
        interfaces: ["Web approval UI", "Mobile notification"], data: ["Approval records"],
        failure: "Approvals expire safely and default to no action.",
        security: "Strong authentication, separation of duties, immutable approval log.",
        metrics: ["Median approval time 4 minutes", "Expiry 30 minutes"],
        synthetic: "Approval pending for the Chennai traffic move.",
      },
    ],
  },
  {
    id: "action", column: 7, band: "core",
    title: "Action and Execution Layer",
    purpose: "Execute approved actions safely, verify them and keep rollback available at every step.",
    flows: ["command", "validation", "rollback"],
    views: ["Control and Execution", "Failure and Recovery Flow", "Runtime Architecture"],
    components: [
      {
        id: "act-runbook", name: "Playbook and Runbook Engine", role: "Versioned steps, preconditions, validations and rollback definitions.",
        detail: all, technology: ["Workflow engine", "Runbook repository in source control"], gcp: "Workflows with runbooks in Cloud Source Repositories",
        inputs: ["Approved action"], outputs: ["Ordered execution plan"],
        interfaces: ["Workflow API"], data: ["Runbooks and executions"],
        failure: "Precondition failure aborts before any change is made.",
        security: "Runbooks are reviewed artefacts, not ad-hoc scripts.",
        metrics: ["Precondition coverage 100%"],
        synthetic: "Runbook RB-OPT-014, fallback validation.",
      },
      {
        id: "act-orchestrator", name: "Command Orchestrator", role: "Idempotent, rate-limited, blast-radius-bounded command dispatch.",
        detail: eng, technology: ["Orchestration service", "Idempotency keys", "Circuit breakers"], gcp: "Cloud Run with Pub/Sub work queues",
        inputs: ["Execution plan"], outputs: ["Executed steps with results"],
        interfaces: ["Adapter API"], data: ["Execution records"],
        failure: "Circuit breaker halts execution and triggers rollback evaluation.",
        security: "Short-lived, scoped credentials issued per execution.",
        metrics: ["Concurrency limit per region", "Step timeout 90s"],
        synthetic: "Simulated execution only in this demonstration.",
      },
      {
        id: "act-adapters", name: "Integration Adapters", role: "Vendor and domain adapters for terminals, routers, RF and fibre systems and ITSM.",
        detail: eng, technology: ["Netconf", "gNMI", "CLI over SSH", "REST", "gRPC"], gcp: "Adapter services on Cloud Run with private connectivity",
        inputs: ["Normalised command"], outputs: ["Vendor-specific operation"],
        interfaces: ["Per-vendor adapter contract"], data: ["Command payloads"],
        failure: "Adapter failure is isolated to one domain.",
        security: "Least privilege per adapter, no shared administrative accounts.",
        metrics: ["Adapter success rate target 99.5%"],
        synthetic: "No real device is contacted.",
      },
      {
        id: "act-validate", name: "Validation Engine", role: "Post-action service, route, terminal and SLO verification.",
        detail: all, technology: ["Synthetic probes", "Service checks", "Telemetry reconciliation"], gcp: "Cloud Run probes plus BigQuery comparison",
        inputs: ["Pre-action baseline", "Post-action state"], outputs: ["Validation verdict"],
        interfaces: ["REST"], data: ["Validation results"],
        failure: "Failed validation automatically proposes rollback.",
        security: "Validation results are immutable evidence.",
        metrics: ["Validation window 10 minutes"],
        synthetic: "Awaiting execution in the current scenario.",
      },
      {
        id: "act-rollback", name: "Rollback Engine", role: "Automatic or manual return to the last known good state.",
        detail: all, technology: ["Inverse operation registry", "State snapshots"], gcp: "Workflows with snapshot storage",
        inputs: ["Pre-action snapshot", "Failure signal"], outputs: ["Restored state"],
        interfaces: ["Rollback API"], data: ["Snapshots"],
        failure: "If rollback cannot complete, the situation escalates to engineering immediately.",
        security: "Rollback path is validated before the action is offered.",
        metrics: ["Rollback readiness required before execution", "Target rollback 3 minutes"],
        synthetic: "Rollback marked ready.",
      },
    ],
  },
  {
    id: "targets", column: 8, band: "core",
    title: "External Systems and Execution Targets",
    purpose: "The systems that actually change state. The Twin coordinates them, it does not replace their native protection.",
    flows: ["command", "customer"],
    views: ["Control and Execution", "Failure and Recovery Flow"],
    components: [
      {
        id: "tg-terminals", name: "Lightbridge Terminals", role: "Beam reacquisition, alignment and terminal operations through vendor APIs.",
        detail: all, technology: ["Vendor API", "CLI"], gcp: "Private connectivity from adapter services",
        inputs: ["Approved terminal operations"], outputs: ["Terminal state change"],
        interfaces: ["Vendor API"], data: ["Command results"],
        failure: "Native terminal protection remains authoritative and unaffected.",
        security: "Operator-scoped credentials with command allowlists.",
        metrics: ["Reacquisition validated within 5 minutes"],
        synthetic: "Simulated only.",
      },
      {
        id: "tg-network", name: "Network Devices", role: "Routing, QoS and traffic steering changes on routers and switches.",
        detail: eng, technology: ["Netconf", "gNMI set", "Controller API"], gcp: "Private service connect to network controllers",
        inputs: ["Traffic steering commands"], outputs: ["Routing state change"],
        interfaces: ["Netconf", "gNMI"], data: ["Config deltas"],
        failure: "Config deltas are reversible and snapshotted before application.",
        security: "Change windows and freeze periods enforced by policy.",
        metrics: ["Config convergence 60s"],
        synthetic: "Simulated only.",
      },
      {
        id: "tg-rf", name: "RF and Fibre Fallback Systems", role: "Backup path activation and capacity validation.",
        detail: all, technology: ["Backup path controllers"], gcp: "Adapter services with private egress",
        inputs: ["Fallback activation"], outputs: ["Backup capacity engaged"],
        interfaces: ["Controller API"], data: ["Path state"],
        failure: "Insufficient fallback headroom blocks the traffic move at policy evaluation.",
        security: "Fallback activation always requires approval above a capacity threshold.",
        metrics: ["Headroom check before every move"],
        synthetic: "RF fallback headroom validated.",
      },
      {
        id: "tg-itsm", name: "ITSM and Notifications", role: "Incidents, changes, and stakeholder communication.",
        detail: all, technology: ["ServiceNow", "Email", "SMS", "Chat"], gcp: "Integration adapters on Cloud Run",
        inputs: ["Situation and action events"], outputs: ["Tickets and notifications"],
        interfaces: ["REST", "Webhook"], data: ["Tickets"],
        failure: "Queued and retried; operations are never blocked by ticketing.",
        security: "No customer PII in notification payloads.",
        metrics: ["Ticket created within 30s of situation formation"],
        synthetic: "Synthetic incident references.",
      },
    ],
  },
  {
    id: "api", column: 8, band: "core",
    title: "API and Service Layer",
    purpose: "A governed interface between the platform and every consumer.",
    flows: ["data", "customer"],
    views: ["Runtime Architecture", "Security and Governance", "Logical Architecture"],
    components: [
      {
        id: "api-gateway", name: "REST and GraphQL APIs", role: "Versioned, documented, contract-tested platform APIs.",
        detail: eng, technology: ["API gateway", "OpenAPI", "GraphQL"], gcp: "API Gateway or Apigee fronting Cloud Run",
        inputs: ["Client requests"], outputs: ["Twin, situation and action resources"],
        interfaces: ["HTTPS"], data: ["API contracts"],
        failure: "Graceful degradation with cached reads.",
        security: "OAuth 2.1, scoped tokens, request validation.",
        metrics: ["p95 250ms", "Availability 99.9%"],
        synthetic: "No live API in this demonstration.",
      },
      {
        id: "api-bff", name: "Backend for Frontend", role: "Aggregation and shaping for the operational experience.",
        detail: eng, technology: ["BFF service"], gcp: "Cloud Run",
        inputs: ["API and twin reads"], outputs: ["Screen-ready payloads"],
        interfaces: ["HTTPS"], data: ["View models"],
        failure: "Partial panels render with explicit unavailable states.",
        security: "Entitlement filtering before response shaping.",
        metrics: ["Page payload budget 250KB"],
        synthetic: "Local fixtures.",
      },
      {
        id: "api-authz", name: "AuthN and AuthZ", role: "Identity federation and role and attribute based access control.",
        detail: sec, technology: ["OIDC", "RBAC and ABAC", "Token exchange"], gcp: "Identity Platform with IAM",
        inputs: ["Identity assertions"], outputs: ["Scoped authorisation decisions"],
        interfaces: ["OIDC"], data: ["Roles and entitlements"],
        failure: "Fail closed.",
        security: "Least privilege, no shared accounts, session binding.",
        metrics: ["Token lifetime 15 minutes"],
        synthetic: "Platform authentication applies to this page.",
      },
      {
        id: "api-limits", name: "Rate Limiting, Validation and Caching", role: "Protects downstream systems and keeps read paths fast.",
        detail: eng, technology: ["Gateway policies", "Redis"], gcp: "Apigee policies plus Memorystore",
        inputs: ["Requests"], outputs: ["Throttled and cached responses"],
        interfaces: ["Gateway"], data: ["Cache entries"],
        failure: "Cache miss falls through to origin with a concurrency cap.",
        security: "Schema validation on every request.",
        metrics: ["Cache hit ratio target 70%"],
        synthetic: "Not applicable locally.",
      },
    ],
  },
  {
    id: "presentation", column: 8, band: "core",
    title: "Presentation and Operational Experience",
    purpose: "The screens operators, engineers and executives actually use.",
    flows: ["customer", "approval"],
    views: ["Customer Service Flow", "Logical Architecture"],
    components: [
      {
        id: "pres-web", name: "Operational Web Application", role: "Global map, KPI dashboards, risk views, agent workspace, twin assessment, approvals and reporting.",
        detail: all, technology: ["React", "TypeScript", "Design system components"], gcp: "Static hosting with CDN",
        inputs: ["BFF payloads"], outputs: ["Operator decisions"],
        interfaces: ["HTTPS", "WebSocket for live updates"], data: ["View state"],
        failure: "Read-only mode when write paths are unavailable.",
        security: "Session binding, entitlement-aware rendering.",
        metrics: ["First contentful paint target 1.5s"],
        synthetic: "This module is the reference implementation of the experience.",
      },
      {
        id: "pres-mobile", name: "Mobile and Notifications", role: "Approval prompts and situation alerts away from the desk.",
        detail: eng, technology: ["Responsive web", "Push and SMS"], gcp: "Firebase messaging",
        inputs: ["Approval requests"], outputs: ["Approve or reject decisions"],
        interfaces: ["Push", "SMS"], data: ["Notification records"],
        failure: "Falls back to email and on-call paging.",
        security: "Step-up authentication for approvals.",
        metrics: ["Notification delivery p95 5s"],
        synthetic: "Not enabled in the demonstration.",
      },
    ],
  },
  {
    id: "observability", column: 4, band: "cross",
    title: "Observability and Platform Operations",
    purpose: "The platform must be as observable as the estate it protects.",
    flows: ["events", "validation"],
    views: ["Runtime Architecture", "Security and Governance", "Failure and Recovery Flow"],
    components: [
      {
        id: "ob-metrics", name: "System Metrics", role: "Platform health, saturation, latency and error budgets.",
        detail: eng, technology: ["Prometheus", "OpenMetrics"], gcp: "Cloud Monitoring",
        inputs: ["Service metrics"], outputs: ["Platform SLOs"], interfaces: ["Scrape"], data: ["Metrics"],
        failure: "Local buffering during collector outages.",
        security: "No customer data in metric labels.",
        metrics: ["Platform availability SLO 99.9%"],
        synthetic: "Illustrative values only.",
      },
      {
        id: "ob-logs", name: "Logging", role: "Structured, correlated logs across every service.",
        detail: eng, technology: ["ELK", "Loki"], gcp: "Cloud Logging",
        inputs: ["Service logs"], outputs: ["Searchable operational history"], interfaces: ["Log API"], data: ["Logs"],
        failure: "Sampling under load, errors always retained.",
        security: "PII redaction at ingest.",
        metrics: ["Retention 90 days"],
        synthetic: "Illustrative only.",
      },
      {
        id: "ob-trace", name: "Distributed Tracing", role: "End-to-end trace from signal to action, including agent steps.",
        detail: eng, technology: ["OpenTelemetry"], gcp: "Cloud Trace",
        inputs: ["Spans"], outputs: ["Causal execution view"], interfaces: ["OTLP"], data: ["Traces"],
        failure: "Head sampling with tail retention for errors.",
        security: "Trace attributes scrubbed of secrets.",
        metrics: ["Sampling 10% baseline, 100% on situations"],
        synthetic: "Illustrative only.",
      },
      {
        id: "ob-oncall", name: "Alerting and On-call", role: "Platform alerting, paging and escalation.",
        detail: eng, technology: ["Alertmanager", "PagerDuty"], gcp: "Cloud Monitoring alerting",
        inputs: ["SLO burn"], outputs: ["Pages and escalations"], interfaces: ["Webhook"], data: ["Alerts"],
        failure: "Redundant paging providers.",
        security: "Rotation membership from identity provider.",
        metrics: ["Page acknowledgement target 5 minutes"],
        synthetic: "Illustrative only.",
      },
    ],
  },
  {
    id: "learning", column: 7, band: "cross",
    title: "Feedback and Learning Loop",
    purpose: "Every incident and recovery makes the next one faster to detect and cheaper to resolve.",
    flows: ["learning", "validation"],
    views: ["Agentic Flow", "Logical Architecture"],
    components: [
      {
        id: "lrn-capture", name: "Outcome Capture", role: "Results, validation verdicts and customer outcome recorded for every action.",
        detail: all, technology: ["Outcome store", "Evidence linkage"], gcp: "BigQuery outcome marts",
        inputs: ["Validation results", "Situation closure"], outputs: ["Outcome records"],
        interfaces: ["REST"], data: ["Outcomes"],
        failure: "Unrecorded outcomes are queued for manual closure.",
        security: "Immutable record for audit.",
        metrics: ["Outcome capture 100% of executed actions"],
        synthetic: "Recent outcomes panel on the operational page.",
      },
      {
        id: "lrn-tuning", name: "Model and Rule Tuning", role: "Threshold, baseline and model improvement from confirmed outcomes.",
        detail: eng, technology: ["Retraining pipelines", "Rule review workflow"], gcp: "Vertex AI Pipelines",
        inputs: ["Confirmed causes", "Detection performance"], outputs: ["Updated thresholds and model versions"],
        interfaces: ["Pipeline API"], data: ["Model versions"],
        failure: "Shadow evaluation before promotion; automatic rollback on regression.",
        security: "Human review required to promote a model.",
        metrics: ["Retraining cadence monthly"],
        synthetic: "Fog signature queued for retention.",
      },
      {
        id: "lrn-runbook", name: "Runbook Refinement", role: "Successful sequences become reusable, reviewed runbooks.",
        detail: all, technology: ["Runbook repository", "Review workflow"], gcp: "Source control with CI validation",
        inputs: ["Successful recovery sequences"], outputs: ["Improved runbooks"],
        interfaces: ["Git"], data: ["Runbooks"],
        failure: "Unreviewed runbooks are never executable.",
        security: "Two-person review on runbook change.",
        metrics: ["Runbook reuse rate tracked monthly"],
        synthetic: "RB-OPT-014 refinement proposed.",
      },
      {
        id: "lrn-autonomy", name: "Autonomy Readiness", role: "Evidence-based expansion of automation, one action class at a time.",
        detail: all, technology: ["Autonomy scorecard", "Policy promotion workflow"], gcp: "Policy repository with CI gates",
        inputs: ["Success rate", "Rollback rate", "Blast radius"], outputs: ["Autonomy level changes"],
        interfaces: ["Policy API"], data: ["Autonomy records"],
        failure: "Any regression demotes the action class automatically.",
        security: "Autonomy changes require governance approval.",
        metrics: ["Minimum 50 supervised executions before promotion"],
        synthetic: "Chennai monitoring actions at L4.",
      },
    ],
  },
  {
    id: "governance", column: 4, band: "cross",
    title: "Data Governance and Security",
    purpose: "Classification, access, encryption, audit, lineage, retention and compliance across every layer.",
    flows: ["approval"],
    views: ["Security and Governance"],
    components: [
      {
        id: "gov-class", name: "Data Classification", role: "Every dataset labelled and policy-tagged at creation.",
        detail: sec, technology: ["Policy tags", "Classification catalogue"], gcp: "Dataplex policy tags",
        inputs: ["Schemas"], outputs: ["Classified datasets"], interfaces: ["Catalog API"], data: ["Labels"],
        failure: "Unclassified data is not queryable by analytics.",
        security: "Classification drives masking and access.",
        metrics: ["100% classification coverage"],
        synthetic: "All demonstration data is synthetic and unclassified.",
      },
      {
        id: "gov-access", name: "Access Controls", role: "RBAC and ABAC across data, actions and approvals.",
        detail: sec, technology: ["IAM", "Row and column policies"], gcp: "IAM plus BigQuery policy tags",
        inputs: ["Identity and attributes"], outputs: ["Access decisions"], interfaces: ["IAM API"], data: ["Entitlements"],
        failure: "Fail closed.",
        security: "Separation of duties between recommendation, approval and execution.",
        metrics: ["Quarterly access recertification"],
        synthetic: "Platform roles apply.",
      },
      {
        id: "gov-crypto", name: "Encryption", role: "In transit and at rest, with managed keys.",
        detail: sec, technology: ["TLS 1.3", "Envelope encryption", "KMS"], gcp: "Cloud KMS with CMEK",
        inputs: ["All data paths"], outputs: ["Encrypted storage and transport"], interfaces: ["KMS API"], data: ["Keys"],
        failure: "Key unavailability blocks access rather than degrading to plaintext.",
        security: "Customer-managed keys supported.",
        metrics: ["Key rotation 90 days"],
        synthetic: "Not applicable locally.",
      },
      {
        id: "gov-audit", name: "Audit Logging and Lineage", role: "Who saw what, who approved what, what ran, and what changed.",
        detail: sec, technology: ["Immutable audit store", "Lineage capture"], gcp: "Cloud Audit Logs with retention lock",
        inputs: ["All privileged operations"], outputs: ["Tamper-evident audit trail"], interfaces: ["Audit API"], data: ["Audit records"],
        failure: "Audit write failure blocks the privileged operation.",
        security: "Write-once retention.",
        metrics: ["Retention 7 years", "Audit coverage 100% of actions"],
        synthetic: "Evidence bundles shown on the operational page.",
      },
      {
        id: "gov-retention", name: "Retention, Purge and Compliance", role: "Lifecycle policies aligned to SOC 2 and ISO 27001 control objectives.",
        detail: sec, technology: ["Lifecycle policies", "Control mapping"], gcp: "Storage lifecycle plus Assured Workloads where required",
        inputs: ["Policy definitions"], outputs: ["Enforced lifecycle"], interfaces: ["Policy API"], data: ["Retention rules"],
        failure: "Policy conflicts escalate to the data governance board.",
        security: "Evidence retained for audit periods.",
        metrics: ["Control mapping reviewed annually"],
        synthetic: "Proposed control set only.",
      },
    ],
  },
  {
    id: "cloud", column: 4, band: "cross",
    title: "Cloud and Infrastructure Foundation",
    purpose: "The runtime substrate. The architecture is cloud neutral; a Google Cloud mapping is shown as one worked example.",
    flows: ["data"],
    views: ["Runtime Architecture"],
    components: [
      {
        id: "cl-compute", name: "Compute and Containers", role: "Microservices, agent runtimes and collectors.",
        detail: eng, technology: ["Kubernetes", "Serverless containers"], gcp: "Cloud Run and GKE",
        inputs: ["Container images"], outputs: ["Running services"], interfaces: ["Kubernetes API"], data: ["Workloads"],
        failure: "Multi-zone scheduling with pod disruption budgets.",
        security: "Workload identity, no node-level credentials.",
        metrics: ["Zone-redundant by default"],
        synthetic: "Reference sizing only.",
      },
      {
        id: "cl-analytics", name: "Analytics and Processing", role: "Warehouse and stream processing capacity.",
        detail: dat, technology: ["Columnar warehouse", "Stream processing"], gcp: "BigQuery and Dataflow",
        inputs: ["Curated and raw data"], outputs: ["Analytical results"], interfaces: ["SQL", "Pipelines"], data: ["Datasets"],
        failure: "Reservation isolation between operational and exploratory workloads.",
        security: "Policy-tag enforcement at query time.",
        metrics: ["Slot reservation for operational queries"],
        synthetic: "Reference sizing only.",
      },
      {
        id: "cl-ml", name: "ML Platform", role: "Training, registry, serving and evaluation for prediction models.",
        detail: eng, technology: ["ML platform with model registry"], gcp: "Vertex AI",
        inputs: ["Features and labels"], outputs: ["Versioned model endpoints"], interfaces: ["Prediction API"], data: ["Models"],
        failure: "Deterministic fallback path always retained.",
        security: "Model provenance recorded.",
        metrics: ["Endpoint p95 120ms"],
        synthetic: "No models are trained in this demonstration.",
      },
      {
        id: "cl-network", name: "Networking and Connectivity", role: "Private connectivity to the operational estate.",
        detail: sec, technology: ["Private interconnect", "VPC", "Service mesh"], gcp: "VPC Service Controls and Private Service Connect",
        inputs: ["Network policy"], outputs: ["Segmented private paths"], interfaces: ["Network APIs"], data: ["Routes"],
        failure: "Redundant interconnects across two providers.",
        security: "No public path to execution targets.",
        metrics: ["Dual interconnect, diverse paths"],
        synthetic: "Reference design only.",
      },
    ],
  },
];

/* ------------------------------- connectors ------------------------------ */

export interface ArchEdge {
  from: string; to: string; kind: FlowKind; label: string;
}

export const architectureEdges: ArchEdge[] = [
  { from: "sources", to: "ingestion", kind: "data", label: "Telemetry and records" },
  { from: "ingestion", to: "bus", kind: "events", label: "Published events" },
  { from: "bus", to: "processing", kind: "data", label: "Stream consumption" },
  { from: "processing", to: "storage", kind: "data", label: "Curated datasets" },
  { from: "storage", to: "twin", kind: "data", label: "Twin projections" },
  { from: "twin", to: "analytics", kind: "data", label: "Service-aware context" },
  { from: "analytics", to: "agentic", kind: "agent", label: "Deterministic results as evidence" },
  { from: "agentic", to: "reasoning", kind: "agent", label: "Curated evidence" },
  { from: "reasoning", to: "policy", kind: "recommendation", label: "Ranked recommendations" },
  { from: "policy", to: "action", kind: "approval", label: "Approved and permitted actions" },
  { from: "action", to: "targets", kind: "command", label: "Guardrailed commands" },
  { from: "targets", to: "action", kind: "validation", label: "Post-action state" },
  { from: "action", to: "learning", kind: "validation", label: "Validated outcomes" },
  { from: "action", to: "twin", kind: "rollback", label: "Rollback and exception" },
  { from: "learning", to: "analytics", kind: "learning", label: "Tuned thresholds and models" },
  { from: "twin", to: "api", kind: "customer", label: "Service and SLO state" },
  { from: "api", to: "presentation", kind: "customer", label: "Operational experience" },
  { from: "presentation", to: "policy", kind: "approval", label: "Human approval decisions" },
];

/* ----------------------------- outcome panel ----------------------------- */

export const architectureOutcomes = [
  "Continuous global optical-service health",
  "Link degradation prediction",
  "Customer and SLO impact awareness",
  "Cross-domain root-cause investigation",
  "Governed operational recommendations",
  "Safe diagnostics and recovery",
  "Human approval for high-impact actions",
  "Continuous validation and rollback",
  "Complete operational evidence",
  "Learning from every outcome",
];

export const architectureStatement =
  "The Twin does not replace native Lightbridge protection or network controls. It provides a service-aware coordination, decision, governance, and validation layer over those systems.";

export const engineeringPrinciples = [
  { name: "Customer First", text: "Every calculation, ranking and alert is expressed in terms of the customer service affected, not the device that emitted the signal." },
  { name: "Service Aware", text: "Signals are resolved through the dependency chain to routes, services, SLOs and owners before any decision is made." },
  { name: "Evidence Driven", text: "No recommendation is presented without cited evidence, stated assumptions and an explicit confidence value." },
  { name: "Deterministic Before Generative", text: "Health, capacity, SLO, topology, risk, and policy calculations use deterministic services. Language models summarize evidence and coordinate bounded reasoning but do not replace engineering calculations." },
  { name: "Least Privilege", text: "Ingestion has no command path. Adapters hold narrow, short-lived credentials scoped to one domain and one operation class." },
  { name: "Human Governed", text: "Policy decides what may run automatically. Anything above the configured blast radius requires a named human approver." },
  { name: "Rollback Ready", text: "An action is only offered when its inverse operation is defined, validated and available for the whole execution window." },
  { name: "Observable", text: "Signal to action is traceable end to end, including every agent step, tool call, policy decision and command." },
  { name: "Failure Isolated", text: "Domain, region and adapter failures are contained. The platform degrades to read-only rather than acting on stale data." },
  { name: "Continuously Learning", text: "Confirmed causes, successful runbooks and detection performance feed back into thresholds, models and autonomy levels." },
];

/* ------------------------------- walkthrough ----------------------------- */

export interface WalkStep {
  index: number; title: string; zone: string; flow: FlowKind;
  what: string; systems: string; evidence: string; guardrail: string; result: string;
}

export const walkthrough: WalkStep[] = [
  { index: 1, title: "Signals arrive", zone: "sources", flow: "data", what: "Terminal, network, weather, service and change signals are collected continuously.", systems: "Lightbridge terminals, network devices, weather providers, CMDB, ITSM.", evidence: "Freshness and coverage per source.", guardrail: "Read-only collection, no command path.", result: "Six Chennai links reporting with current telemetry." },
  { index: 2, title: "Events are published", zone: "bus", flow: "events", what: "Every collected record becomes a durable, replayable event.", systems: "Event bus with per-domain topics.", evidence: "Offsets and consumer lag.", guardrail: "Per-topic ACLs.", result: "Ordered event stream available to all consumers." },
  { index: 3, title: "Data is normalised and validated", zone: "processing", flow: "data", what: "Units, timestamps and identifiers are normalised, then quality assertions run.", systems: "Stream processing, ELT models, quality assertions.", evidence: "Assertion results and confidence score.", guardrail: "Quarantine on failed assertions.", result: "Confidence 92% on the Chennai dataset." },
  { index: 4, title: "The twin is built", zone: "twin", flow: "data", what: "Signals are resolved to terminals, routes, services, customers, SLOs and fallback paths.", systems: "Twin object model over graph and relational stores.", evidence: "Dependency chain per link.", guardrail: "Entitlement filtering on every read.", result: "12 customer services mapped to the six links." },
  { index: 5, title: "Deviation is detected", zone: "analytics", flow: "data", what: "Per-link baselines identify margin decline before any threshold is breached.", systems: "Anomaly detection and signal correlation.", evidence: "Deviation direction, rate and baseline.", guardrail: "Deterministic detection, model optional.", result: "Margin decline detected 45 minutes before threshold." },
  { index: 6, title: "Risk is predicted", zone: "analytics", flow: "data", what: "Deviation is projected forward against the visibility forecast.", systems: "Forecasting service with environmental features.", evidence: "Probability, confidence and intervention window.", guardrail: "Confidence widens on stale inputs.", result: "Three links at high risk within six hours." },
  { index: 7, title: "Impact is quantified", zone: "analytics", flow: "customer", what: "Risk is rolled up through the dependency graph to customers, capacity and SLOs.", systems: "Capacity and impact analysis.", evidence: "Services, capacity and error budget exposed.", guardrail: "Conservative worst case on missing context.", result: "820 Gbps of committed capacity exposed." },
  { index: 8, title: "Agents collaborate", zone: "agentic", flow: "agent", what: "Specialised agents gather evidence within step and tool budgets.", systems: "Agent orchestration, shared state, evidence curator.", evidence: "Full agent trace with tool calls.", guardrail: "Step budget and tool allowlists.", result: "22 cited evidence items assembled." },
  { index: 9, title: "Cause is established", zone: "reasoning", flow: "agent", what: "Hypotheses are generated, eliminated and confirmed against evidence.", systems: "Root cause analysis service.", evidence: "Confirmed cause and eliminated alternatives.", guardrail: "Uncited claims are dropped.", result: "Fog-driven attenuation confirmed, hardware fault eliminated." },
  { index: 10, title: "Actions are recommended", zone: "reasoning", flow: "recommendation", what: "Candidate actions are scored on outcome, risk, reversibility and fallback readiness.", systems: "Recommendation engine with policy constraints.", evidence: "Score, rationale and rollback path per action.", guardrail: "Actions outside policy are never offered.", result: "Monitoring increase and fallback validation ranked first." },
  { index: 11, title: "Policy is evaluated", zone: "policy", flow: "approval", what: "Autonomy level, blast radius and change freeze are applied.", systems: "Policy and guardrail service.", evidence: "Permit, permit-with-approval or deny with reason.", guardrail: "Fail closed when policy is unavailable.", result: "Traffic movement requires named human approval." },
  { index: 12, title: "A human approves", zone: "policy", flow: "approval", what: "The duty manager reviews evidence, impact and rollback before authorising.", systems: "Approval workflow with notification adapters.", evidence: "Signed approval record with expiry.", guardrail: "Separation of duties from recommendation.", result: "Low-risk actions approved, traffic move held." },
  { index: 13, title: "Execution runs safely", zone: "action", flow: "command", what: "The runbook executes with preconditions, idempotency and blast-radius limits.", systems: "Runbook engine, command orchestrator, integration adapters.", evidence: "Step-by-step execution record.", guardrail: "Circuit breaker halts on adapter failure.", result: "Simulated execution in this demonstration." },
  { index: 14, title: "Outcome is validated", zone: "action", flow: "validation", what: "Service reachability, throughput, latency, loss and SLO state are re-checked.", systems: "Validation engine with synthetic probes.", evidence: "Pre and post comparison.", guardrail: "Failed validation proposes rollback automatically.", result: "Validation pending execution." },
  { index: 15, title: "Rollback remains available", zone: "action", flow: "rollback", what: "The inverse operation stays ready for the whole execution and validation window.", systems: "Rollback engine with state snapshots.", evidence: "Snapshot reference and rollback readiness.", guardrail: "No action without a validated rollback path.", result: "Rollback ready, target three minutes." },
  { index: 16, title: "The system learns", zone: "learning", flow: "learning", what: "Cause, evidence, runbook and environmental signature are retained and fed back.", systems: "Outcome capture, model tuning, runbook refinement, autonomy readiness.", evidence: "Outcome record linked to the situation.", guardrail: "Human review before model or autonomy promotion.", result: "Fog signature queued for retention." },
];

/* ------------------------ agent orchestration detail ---------------------- */

export interface AgentSpec {
  id: string; name: string; responsibility: string; tools: string[];
  inputs: string; outputs: string; boundary: string; autonomy: string;
}

export const agents: AgentSpec[] = [
  { id: "a-health", name: "Global Link Health Agent", responsibility: "Overall health, risk and posture across the estate.", tools: ["Health calculation service", "Twin query"], inputs: "Link and service health scores.", outputs: "Estate posture summary with the ranked watch list.", boundary: "Read-only. Cannot propose execution.", autonomy: "L1 Observe" },
  { id: "a-weather", name: "Weather Risk Agent", responsibility: "Environmental correlation and forecast interpretation.", tools: ["Weather feature store", "Correlation engine"], inputs: "Visibility, precipitation and forecast features.", outputs: "Environmental risk narrative per region.", boundary: "Read-only.", autonomy: "L1 Observe" },
  { id: "a-optical", name: "Optical Path Agent", responsibility: "Optical link and terminal analysis, margin and alignment behaviour.", tools: ["Time series query", "Terminal telemetry"], inputs: "Margin, power, attenuation and reacquisition counts.", outputs: "Optical condition assessment.", boundary: "Read-only. No terminal commands.", autonomy: "L1 Observe" },
  { id: "a-network", name: "Network Path Agent", responsibility: "Routing, handoff and performance behaviour around the link.", tools: ["Network state query", "Topology traversal"], inputs: "Interface counters and routing state.", outputs: "Network contribution to the condition.", boundary: "Read-only.", autonomy: "L1 Observe" },
  { id: "a-customer", name: "Customer Impact Agent", responsibility: "Service impact and prioritisation in customer terms.", tools: ["Impact analysis", "SLO store"], inputs: "Dependency graph and SLO targets.", outputs: "Ranked customer exposure.", boundary: "Read-only. No customer communication.", autonomy: "L2 Recommend" },
  { id: "a-rf", name: "RF Fallback Guardian", responsibility: "Backup path capacity and readiness.", tools: ["Fallback controller read", "Capacity model"], inputs: "Backup path state and headroom.", outputs: "Fallback readiness verdict.", boundary: "Read-only. Activation requires approval.", autonomy: "L2 Recommend" },
  { id: "a-slo", name: "SLO Guardian", responsibility: "Error budget and policy exposure.", tools: ["SLO store", "Policy evaluation"], inputs: "Objectives and burn rate.", outputs: "Budget impact and policy constraints.", boundary: "Read-only.", autonomy: "L2 Recommend" },
  { id: "a-recovery", name: "Recovery Orchestrator", responsibility: "Action planning, sequencing and validation coordination.", tools: ["Runbook catalogue", "Validation engine", "Rollback engine"], inputs: "Approved plan.", outputs: "Ordered execution and validation plan.", boundary: "Executes only what policy and approval permit.", autonomy: "L3 Recommend and Approve" },
  { id: "a-evidence", name: "Evidence Curator Agent", responsibility: "Collects, structures and maintains cited evidence.", tools: ["Retrieval", "Evidence store"], inputs: "All agent and analytics outputs.", outputs: "Structured evidence bundle.", boundary: "Cannot assert without a citation.", autonomy: "L1 Observe" },
];

export const autonomyLevels = [
  { level: "L1", name: "Observe", text: "Monitor and inform. No proposals are made.", state: "In use" },
  { level: "L2", name: "Recommend", text: "Suggest actions with evidence and rationale.", state: "In use" },
  { level: "L3", name: "Recommend and Approve", text: "Human approval required before any execution.", state: "In use" },
  { level: "L4", name: "Execute, Low Risk", text: "Autonomous reversible actions within a bounded blast radius.", state: "Proposed" },
  { level: "L5", name: "Execute, Policy Bound", text: "Autonomous execution within explicit guardrails and change windows.", state: "Proposed" },
  { level: "L6", name: "Closed Loop Autonomy", text: "Full cycle with validation, rollback and continuous learning.", state: "Future" },
];

/* --------------------------- nonfunctional and ops ------------------------ */

export const nonFunctional = [
  { area: "Availability", target: "99.9% platform availability, zone redundant, degrade to read-only", note: "Estate protection never depends on the Twin being available." },
  { area: "Latency", target: "Signal to detection p95 under 60 seconds", note: "Detection lead time matters more than dashboard refresh rate." },
  { area: "Throughput", target: "250k telemetry samples per minute at reference scale", note: "Scales horizontally with collector and processing pools." },
  { area: "Recovery", target: "RPO 5 minutes, RTO 30 minutes", note: "Twin state is reconstructable by event replay." },
  { area: "Scalability", target: "10x link growth without architectural change", note: "Partitioned topics and reservation-isolated analytics." },
  { area: "Security", target: "Least privilege, no public path to execution targets", note: "Separation of duties across recommend, approve and execute." },
  { area: "Auditability", target: "100% of actions and approvals recorded immutably", note: "Write-once retention for seven years." },
  { area: "Explainability", target: "Every recommendation carries evidence, rationale and confidence", note: "No explanation, no recommendation." },
  { area: "Data quality", target: "99.5% assertion pass rate", note: "Confidence is downgraded rather than hidden." },
  { area: "Cost", target: "Reservation isolation between operational and exploratory workloads", note: "Operational queries are never starved by analysis." },
];

export const integrationInventory = [
  { system: "Lightbridge optical terminals", type: "Telemetry and command target", direction: "Inbound and outbound", protocol: "Vendor API, gNMI", frequency: "10s streaming", owner: "Optical Engineering", criticality: "Critical" },
  { system: "Routers and switches", type: "Telemetry and command target", direction: "Inbound and outbound", protocol: "gNMI, Netconf, Syslog", frequency: "30s", owner: "Network Engineering", criticality: "Critical" },
  { system: "RF and fibre fallback controllers", type: "Command target", direction: "Outbound", protocol: "Controller API", frequency: "On demand", owner: "Transport Engineering", criticality: "Critical" },
  { system: "Weather providers", type: "Data source", direction: "Inbound", protocol: "REST", frequency: "15m", owner: "Data Engineering", criticality: "High" },
  { system: "CMDB and inventory", type: "Context source", direction: "Inbound", protocol: "REST, DB sync", frequency: "1h", owner: "IT Service Management", criticality: "High" },
  { system: "ServiceNow ITSM", type: "Workflow integration", direction: "Bidirectional", protocol: "REST, Webhook", frequency: "Event driven", owner: "IT Service Management", criticality: "High" },
  { system: "Identity provider", type: "Authentication and authorisation", direction: "Inbound", protocol: "OIDC", frequency: "Per session", owner: "Security", criticality: "Critical" },
  { system: "Notification platforms", type: "Outbound communication", direction: "Outbound", protocol: "SMTP, SMS, Chat API", frequency: "Event driven", owner: "Operations", criticality: "Medium" },
  { system: "SLO and contract store", type: "Context source", direction: "Inbound", protocol: "REST", frequency: "Daily", owner: "Customer Operations", criticality: "High" },
  { system: "Change management", type: "Context source", direction: "Inbound", protocol: "REST", frequency: "Event driven", owner: "Operations", criticality: "High" },
];

export const deploymentReference = [
  { view: "Cloud Neutral", summary: "Kubernetes, Kafka, PostgreSQL, a columnar warehouse, object storage and an OIDC provider.", control: "Operator-hosted or vendor-hosted", data: "Regional data residency by deployment", note: "No cloud-specific service is required by the architecture." },
  { view: "Google Cloud Example", summary: "Cloud Run and GKE, Pub/Sub, Dataflow, BigQuery, Cloud SQL and AlloyDB, Cloud Storage, Vertex AI.", control: "Vendor-hosted control plane", data: "Regional BigQuery datasets with CMEK", note: "Shown as one worked example, not a requirement." },
  { view: "Hybrid Deployment", summary: "Collection and execution adapters on premises, analytics and twin in cloud.", control: "Split control plane", data: "Raw telemetry stays on premises where required", note: "Suits estates with strict egress controls." },
  { view: "Customer-Hosted Control Plane", summary: "Entire platform inside the customer tenancy with vendor-managed release pipeline.", control: "Customer-hosted", data: "All data remains in customer tenancy", note: "Highest data control, higher operational overhead." },
  { view: "Edge and Cloud Split", summary: "Edge collectors and local detection near terminal clusters, coordination in cloud.", control: "Edge autonomy with cloud coordination", data: "Edge buffering during connectivity loss", note: "Supports remote sites with intermittent connectivity." },
];

export const architectureDecisions = [
  { id: "AD-01", decision: "Deterministic services own all engineering calculations.", rationale: "Reproducibility and auditability are required for operational decisions.", alternatives: "Model-driven scoring end to end.", status: "Accepted" },
  { id: "AD-02", decision: "Agents hold no execution credentials.", rationale: "Separation between reasoning and execution limits blast radius.", alternatives: "Agents with direct adapter access.", status: "Accepted" },
  { id: "AD-03", decision: "Policy evaluation fails closed.", rationale: "An unavailable policy service must never permit an unreviewed action.", alternatives: "Cached last-known policy.", status: "Accepted" },
  { id: "AD-04", decision: "Event backbone is the integration contract.", rationale: "Replay, decoupling and audit come from a single durable log.", alternatives: "Point-to-point service calls.", status: "Accepted" },
  { id: "AD-05", decision: "Rollback path required before an action is offered.", rationale: "Reversibility is a precondition for safe automation.", alternatives: "Rollback planned after execution.", status: "Accepted" },
  { id: "AD-06", decision: "Cloud-neutral core with a worked Google Cloud mapping.", rationale: "Avoids lock-in while giving a concrete reference implementation.", alternatives: "Single-cloud native design.", status: "Accepted" },
  { id: "AD-07", decision: "Autonomy expands per action class on evidence.", rationale: "Automation trust must be earned with measured outcomes.", alternatives: "Broad autonomy at go-live.", status: "Accepted" },
  { id: "AD-08", decision: "Native terminal and network protection stays authoritative.", rationale: "The Twin coordinates, it does not replace safety mechanisms.", alternatives: "Twin as primary protection controller.", status: "Accepted" },
];

export const architectureAssumptions = [
  "Terminal and network telemetry can be streamed read-only without vendor licence constraints.",
  "A change management system of record exists and exposes change windows via API.",
  "SLO targets and committed capacity are available per customer service.",
  "Private connectivity to execution targets can be established without public exposure.",
  "An enterprise identity provider supports OIDC and group-based entitlements.",
  "Weather providers offer sufficient spatial resolution near terminal clusters.",
  "Operations accepts named human approval for actions above the configured blast radius.",
  "All figures on this page are synthetic and illustrative, not measured Taara values.",
];

export const maturityPath = [
  { phase: "Phase 1", name: "Observe", weeks: "Weeks 1 to 8", scope: "Ingestion, normalisation, twin model, health and map experience.", exit: "Single pane of service-aware health with measured data quality." },
  { phase: "Phase 2", name: "Predict", weeks: "Weeks 9 to 16", scope: "Baselines, anomaly detection, environmental correlation and risk prediction.", exit: "Demonstrated detection lead time against historical events." },
  { phase: "Phase 3", name: "Recommend", weeks: "Weeks 17 to 24", scope: "Agent orchestration, root cause, recommendations and evidence bundles.", exit: "Recommendation acceptance measured over a full operating quarter." },
  { phase: "Phase 4", name: "Govern and Execute", weeks: "Weeks 25 to 34", scope: "Policy, approvals, runbooks, adapters, validation and rollback.", exit: "Supervised execution with 100% rollback readiness." },
  { phase: "Phase 5", name: "Expand Autonomy", weeks: "Week 35 onward", scope: "Per-action-class autonomy promotion supported by outcome evidence.", exit: "Sustained low rollback rate before each promotion." },
];

export const validationChecklist = [
  { item: "Every data source has an owner, protocol, frequency and freshness target", status: "Met" },
  { item: "All engineering calculations are deterministic and reproducible", status: "Met" },
  { item: "Agents operate within explicit step, time and tool budgets", status: "Met" },
  { item: "Every recommendation carries evidence, rationale and confidence", status: "Met" },
  { item: "Policy evaluation fails closed", status: "Met" },
  { item: "Separation of duties across recommend, approve and execute", status: "Met" },
  { item: "Rollback path defined and validated before an action is offered", status: "Met" },
  { item: "Post-action validation defined for every action class", status: "Met" },
  { item: "Immutable audit trail for actions, approvals and data access", status: "Met" },
  { item: "Signal-to-action tracing across services and agent steps", status: "Met" },
  { item: "Degradation behaviour defined for every zone", status: "Met" },
  { item: "No public network path to any execution target", status: "Met" },
  { item: "Data classification and retention defined for every dataset", status: "Met" },
  { item: "Autonomy promotion requires measured outcome evidence", status: "Met" },
  { item: "Production sizing and cost model validated with the customer", status: "Open" },
  { item: "Vendor telemetry and command licensing confirmed", status: "Open" },
];

export const scenario = {
  id: "SIT-2026-0417",
  name: "Chennai fog degradation, preventive protection",
  summary: "A synthetic six-hour scenario used to demonstrate how the architecture behaves end to end, from signal arrival to learning.",
  facts: [
    { label: "Region", value: "Chennai, India" },
    { label: "Links under watch", value: "6" },
    { label: "Links at high risk", value: "3" },
    { label: "Customer services exposed", value: "12" },
    { label: "Committed capacity exposed", value: "820 Gbps" },
    { label: "Detection lead time", value: "45 minutes" },
    { label: "Decision confidence", value: "92%" },
    { label: "Approval requirement", value: "Named human approver" },
    { label: "Rollback", value: "Ready, target 3 minutes" },
  ],
};
