/**
 * AtlasCloud Production — SaaS Production demonstration tenant.
 *
 * A fictional B2B workflow-automation SaaS platform with ~2,400 customer
 * organizations across enterprise and midmarket tiers, running multi-tenant
 * Kubernetes infrastructure across North American and European production
 * regions. API-first, event-driven, continuously delivered, 24/7. ALL data —
 * customer names, transactions, subscriptions, API keys, tenant accounts — is
 * synthetic. Simulated provider aliases are illustrative only; no vendor
 * certification, partnership, or live production integration is implied.
 *
 * This module extends the shared multi-industry tenant architecture. Pages
 * consume it through the existing OperationsProvider via TenantFixtureBundle.
 */

import type {
  Approval, BusinessService, Change, Component, Connector, DigitalWorker,
  EvidenceItem, Execution, Incident, KnowledgeItem, Problem, Runbook,
  ScenarioStage, Slo, Tenant,
} from "@/runops/data/scenario";
import { saasProductionIndustry } from "./industryProfiles";
import type {
  TenantFixtureBundle, TenantOperationalProfile, TenantProfileRecord,
} from "./types";

export const atlasCloudTenant: Tenant = {
  id: "tenant-saas-production",
  name: "AtlasCloud Production",
};

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

const services: BusinessService[] = [
  {
    id: "svc-saas-customer-platform",
    name: "AtlasCloud Customer Platform",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "Degraded",
    sloAvailability: 99.95, sloLatencyMs: 300, errorBudgetRemaining: 22,
    componentIds: [
      "cmp-saas-cdn", "cmp-saas-waf", "cmp-saas-glb", "cmp-saas-api-gw",
      "cmp-saas-mesh", "cmp-saas-k8s-use1", "cmp-saas-k8s-euw1",
    ],
  },
  {
    id: "svc-saas-web",
    name: "Customer Web Application",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "At Risk",
    sloAvailability: 99.9, sloLatencyMs: 1200, errorBudgetRemaining: 54,
    componentIds: ["cmp-saas-cdn", "cmp-saas-web-workload", "cmp-saas-api-gw", "cmp-saas-authn"],
  },
  {
    id: "svc-saas-public-api",
    name: "Public API",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "Severely Degraded",
    sloAvailability: 99.95, sloLatencyMs: 250, errorBudgetRemaining: 8,
    componentIds: [
      "cmp-saas-api-gw", "cmp-saas-api-workload", "cmp-saas-authz",
      "cmp-saas-pg-primary", "cmp-saas-pg-replicas", "cmp-saas-tenant-shards",
      "cmp-saas-conn-pool", "cmp-saas-redis",
    ],
  },
  {
    id: "svc-saas-identity",
    name: "Authentication and Authorization",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "Healthy",
    sloAvailability: 99.99, sloLatencyMs: 200, errorBudgetRemaining: 84,
    componentIds: ["cmp-saas-authn", "cmp-saas-authz", "cmp-saas-secrets"],
  },
  {
    id: "svc-saas-workflow",
    name: "Workflow Execution Engine",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "Degraded",
    sloAvailability: 99.9, sloLatencyMs: 1500, errorBudgetRemaining: 31,
    componentIds: [
      "cmp-saas-workflow-workers", "cmp-saas-kafka", "cmp-saas-consumer-group",
      "cmp-saas-dlq", "cmp-saas-pg-replicas", "cmp-saas-redis",
    ],
  },
  {
    id: "svc-saas-tenant",
    name: "Tenant Provisioning and Configuration",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "Healthy",
    sloAvailability: 99.9, sloLatencyMs: 5000, errorBudgetRemaining: 79,
    componentIds: ["cmp-saas-cp-api", "cmp-saas-cp-db", "cmp-saas-secrets", "cmp-saas-feature-flags"],
  },
  {
    id: "svc-saas-notifications",
    name: "Notifications and Webhooks",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "At Risk",
    sloAvailability: 99.5, sloLatencyMs: 30000, errorBudgetRemaining: 46,
    componentIds: ["cmp-saas-webhook-dispatcher", "cmp-saas-kafka", "cmp-saas-dlq", "cmp-saas-redis"],
  },
  {
    id: "svc-saas-data",
    name: "Operational Data Platform",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "Degraded",
    sloAvailability: 99.9, sloLatencyMs: 3000, errorBudgetRemaining: 27,
    componentIds: [
      "cmp-saas-pg-primary", "cmp-saas-pg-replicas", "cmp-saas-tenant-shards",
      "cmp-saas-conn-pool", "cmp-saas-object-store",
    ],
  },
  {
    id: "svc-saas-streaming",
    name: "Event Streaming",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "At Risk",
    sloAvailability: 99.9, sloLatencyMs: 500, errorBudgetRemaining: 39,
    componentIds: ["cmp-saas-kafka", "cmp-saas-consumer-group", "cmp-saas-dlq"],
  },
  {
    id: "svc-saas-search",
    name: "Search and Indexing",
    tier: "Tier 2", environment: "Production", region: "US East + EU West",
    health: "Healthy",
    sloAvailability: 99.5, sloLatencyMs: 800, errorBudgetRemaining: 71,
    componentIds: ["cmp-saas-search", "cmp-saas-kafka", "cmp-saas-object-store"],
  },
  {
    id: "svc-saas-billing",
    name: "Subscription Billing",
    tier: "Tier 1", environment: "Production", region: "US East + EU West",
    health: "Healthy",
    sloAvailability: 99.99, sloLatencyMs: 800, errorBudgetRemaining: 87,
    componentIds: ["cmp-saas-billing-integration", "cmp-saas-pg-primary"],
  },
  {
    id: "svc-saas-admin",
    name: "Customer Administration",
    tier: "Tier 2", environment: "Production", region: "US East + EU West",
    health: "Healthy",
    sloAvailability: 99.5, sloLatencyMs: 1500, errorBudgetRemaining: 82,
    componentIds: ["cmp-saas-web-workload", "cmp-saas-cp-api", "cmp-saas-authn"],
  },
  {
    id: "svc-saas-observability",
    name: "Platform Observability",
    tier: "Tier 2", environment: "Production", region: "US East + EU West",
    health: "Healthy",
    sloAvailability: 99.9, sloLatencyMs: 2000, errorBudgetRemaining: 78,
    componentIds: ["cmp-saas-otel", "cmp-saas-metrics", "cmp-saas-logs", "cmp-saas-tracing"],
  },
  {
    id: "svc-saas-developer",
    name: "Developer Platform and CI/CD",
    tier: "Tier 2", environment: "Production", region: "US East",
    health: "Healthy",
    sloAvailability: 99.5, sloLatencyMs: 15000, errorBudgetRemaining: 76,
    componentIds: ["cmp-saas-ci-cd", "cmp-saas-gitops", "cmp-saas-artifact-reg", "cmp-saas-github"],
  },
];

/* -------------------------------------------------------------------------- */
/* Topology components — >40                                                   */
/* -------------------------------------------------------------------------- */

const components: Component[] = [
  // Edge
  { id: "cmp-saas-cdn",           name: "CDN (simulated)",                     kind: "network",  health: "Healthy" },
  { id: "cmp-saas-waf",           name: "WAF (simulated)",                     kind: "network",  health: "Healthy" },
  { id: "cmp-saas-glb",           name: "Global Load Balancer (simulated)",     kind: "network",  health: "Healthy" },
  { id: "cmp-saas-dns",           name: "DNS (simulated Route 53)",             kind: "network",  health: "Healthy" },
  { id: "cmp-saas-regional-net",  name: "Regional Network",                     kind: "network",  health: "Healthy" },
  { id: "cmp-saas-api-gw",        name: "API Gateway",                          kind: "api",      health: "Degraded" },
  { id: "cmp-saas-mesh",          name: "Service Mesh (simulated Istio)",       kind: "network",  health: "Healthy" },

  // Compute
  { id: "cmp-saas-k8s-use1",      name: "Kubernetes Cluster · us-east-1",       kind: "compute",  health: "At Risk" },
  { id: "cmp-saas-k8s-euw1",      name: "Kubernetes Cluster · eu-west-1",       kind: "compute",  health: "Healthy" },
  { id: "cmp-saas-nodepool-web",  name: "Node Pool · Web",                      kind: "compute",  health: "Healthy" },
  { id: "cmp-saas-nodepool-api",  name: "Node Pool · API",                      kind: "compute",  health: "At Risk" },
  { id: "cmp-saas-nodepool-work", name: "Node Pool · Workflow",                 kind: "compute",  health: "Healthy" },
  { id: "cmp-saas-web-workload",  name: "Web Workload (Deployments)",           kind: "compute",  health: "Healthy" },
  { id: "cmp-saas-api-workload",  name: "API Workload (Deployments)",           kind: "compute",  health: "Degraded" },
  { id: "cmp-saas-workflow-workers", name: "Workflow Workers",                   kind: "compute",  health: "At Risk" },

  // Identity
  { id: "cmp-saas-authn",         name: "Authentication Service",               kind: "identity", health: "Healthy" },
  { id: "cmp-saas-authz",         name: "Authorization Service (tenant policy)", kind: "identity", health: "Healthy" },

  // Data
  { id: "cmp-saas-pg-primary",    name: "PostgreSQL Primary Cluster (simulated Aurora)", kind: "database", health: "Severely Degraded" },
  { id: "cmp-saas-pg-replicas",   name: "PostgreSQL Read Replicas",             kind: "database", health: "Degraded" },
  { id: "cmp-saas-tenant-shards", name: "Tenant Shards",                        kind: "database", health: "Severely Degraded" },
  { id: "cmp-saas-conn-pool",     name: "Database Connection Pool (simulated PgBouncer)", kind: "compute", health: "Severely Degraded" },
  { id: "cmp-saas-redis",         name: "Redis Cache Cluster",                  kind: "cache",    health: "At Risk" },

  // Streaming
  { id: "cmp-saas-kafka",         name: "Event Streaming Cluster (simulated MSK)", kind: "queue",  health: "At Risk" },
  { id: "cmp-saas-consumer-group",name: "Consumer Groups",                      kind: "queue",    health: "At Risk" },
  { id: "cmp-saas-dlq",           name: "Dead-Letter Queues",                   kind: "queue",    health: "Healthy" },

  // Search + storage
  { id: "cmp-saas-search",        name: "Search Cluster (simulated Elasticsearch)", kind: "database", health: "Healthy" },
  { id: "cmp-saas-object-store",  name: "Object Storage (simulated S3)",        kind: "database", health: "Healthy" },

  // Control plane + config
  { id: "cmp-saas-cp-api",        name: "Control Plane API",                    kind: "api",      health: "Healthy" },
  { id: "cmp-saas-cp-db",         name: "Control Plane DB",                     kind: "database", health: "Healthy" },
  { id: "cmp-saas-feature-flags", name: "Feature Flag Service (simulated LaunchDarkly)", kind: "vendor", health: "Healthy" },
  { id: "cmp-saas-secrets",       name: "Secrets Manager (simulated)",          kind: "vendor",   health: "Healthy" },

  // Webhook + billing
  { id: "cmp-saas-webhook-dispatcher", name: "Webhook Dispatcher",             kind: "compute",  health: "At Risk" },
  { id: "cmp-saas-billing-integration", name: "Billing Integration (simulated Stripe)", kind: "vendor", health: "Healthy" },

  // CI/CD
  { id: "cmp-saas-github",        name: "Source Control (simulated GitHub)",    kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-ci-cd",         name: "CI/CD Pipelines (simulated)",           kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-gitops",        name: "GitOps Controller (simulated Argo CD)", kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-artifact-reg",  name: "Artifact Registry (simulated)",         kind: "vendor",   health: "Healthy" },

  // Observability
  { id: "cmp-saas-otel",          name: "OpenTelemetry Collectors",             kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-metrics",       name: "Metrics Platform (simulated Prometheus)", kind: "vendor", health: "Healthy" },
  { id: "cmp-saas-logs",          name: "Logging Platform (simulated Loki)",     kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-tracing",       name: "Tracing Platform (simulated Tempo)",    kind: "vendor",   health: "Healthy" },

  // Incident + support
  { id: "cmp-saas-incident-mgmt", name: "Incident Management (simulated PagerDuty)", kind: "vendor", health: "Healthy" },
  { id: "cmp-saas-itsm",          name: "ITSM (simulated ServiceNow)",           kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-status-page",   name: "Status Page (simulated Statuspage)",    kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-support",       name: "Customer Support (simulated Zendesk)",  kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-crm",           name: "CRM (simulated Salesforce)",             kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-collab",        name: "Collaboration (simulated Slack)",       kind: "vendor",   health: "Healthy" },

  // Backup + DR
  { id: "cmp-saas-backup",        name: "Backup and Recovery (simulated)",       kind: "vendor",   health: "Healthy" },
  { id: "cmp-saas-dr-region",     name: "Disaster Recovery Region (eu-central-1)", kind: "compute", health: "Healthy" },
];

/* -------------------------------------------------------------------------- */
/* Digital workers                                                             */
/* -------------------------------------------------------------------------- */

const digitalWorkers: DigitalWorker[] = [
  { id: "DW-SAAS-IC-01",       name: "DW-SAAS-IC-01",       role: "Production Incident Commander",     autonomy: "Human Guided",              status: "Investigating" },
  { id: "DW-SAAS-APP-02",      name: "DW-SAAS-APP-02",      role: "Application SRE",                    autonomy: "AI Recommended",            status: "Investigating" },
  { id: "DW-SAAS-K8S-03",      name: "DW-SAAS-K8S-03",      role: "Kubernetes Platform SRE",            autonomy: "AI Recommended",            status: "Recommending"  },
  { id: "DW-SAAS-DATA-04",     name: "DW-SAAS-DATA-04",     role: "Data Reliability Engineer",          autonomy: "Approval Gated Automation", status: "Investigating" },
  { id: "DW-SAAS-STREAM-05",   name: "DW-SAAS-STREAM-05",   role: "Streaming Reliability Engineer",     autonomy: "AI Recommended",            status: "Idle"          },
  { id: "DW-SAAS-EDGE-06",     name: "DW-SAAS-EDGE-06",     role: "Edge and Network SRE",               autonomy: "AI Recommended",            status: "Idle"          },
  { id: "DW-SAAS-RELEASE-07",  name: "DW-SAAS-RELEASE-07",  role: "Release Risk Analyst",               autonomy: "AI Recommended",            status: "Recommending"  },
  { id: "DW-SAAS-SEC-08",      name: "DW-SAAS-SEC-08",      role: "Cloud Security Analyst",             autonomy: "Approval Gated Automation", status: "Idle"          },
  { id: "DW-SAAS-IMPACT-09",   name: "DW-SAAS-IMPACT-09",   role: "Customer and Tenant Impact Analyst", autonomy: "AI Recommended",            status: "Investigating" },
  { id: "DW-SAAS-FINOPS-10",   name: "DW-SAAS-FINOPS-10",   role: "Cloud Cost and Capacity Analyst",    autonomy: "Documentation Only",        status: "Idle"          },
  { id: "DW-SAAS-COMMS-11",    name: "DW-SAAS-COMMS-11",    role: "Customer Communications Coordinator", autonomy: "Human Initiated Automation", status: "Idle"        },
  { id: "DW-SAAS-VALIDATE-12", name: "DW-SAAS-VALIDATE-12", role: "Execution Validator",                autonomy: "Supervised Autonomous",     status: "Idle"          },
];

/* -------------------------------------------------------------------------- */
/* Primary incident scenario — hot tenant shard                                */
/* -------------------------------------------------------------------------- */

const primaryIncident: Incident = {
  id: "INC-SAAS-8842",
  title: "Enterprise API latency and 5xx degradation caused by hot tenant shard",
  severity: "SEV 1",
  state: "Investigating",
  serviceId: "svc-saas-public-api",
  openedAt: "14:07 UTC",
  commander: "DW-SAAS-IC-01",
  summary:
    "A query-routing optimization was enabled through a feature flag (CHG-SAAS-4418). Traffic for several high-volume enterprise tenants concentrated on one database shard. Database connection utilization reached 97%, API p99 latency rose from 620ms to 3.4s, and the 5xx rate is elevated. Kafka consumer lag on downstream workflows is climbing. Most small tenants remain healthy; enterprise customer journeys are degraded. The service is consuming error budget at a fast-burn rate. Tenant-isolation invariants are intact — no cross-tenant reads observed. All customer data is synthetic.",
  findings: [
    "Feature flag ff-query-router-v2 enabled at 100% at 13:58 UTC (CHG-SAAS-4418).",
    "Connection utilization on tenant-shard-07 reached 97% at 14:03 UTC.",
    "API p99 latency rose from 620ms to 3.4s on enterprise cohort routes.",
    "5xx rate on /v1/workflows spiked to 4.8% (baseline 0.12%).",
    "Kafka consumer lag on workflow-completion topic climbed to 220s.",
    "Small-tenant cohort remains within SLO — hotspot confined to shard-07.",
    "Tenant-isolation controls verified — no cross-tenant data observed.",
    "ARR-at-risk estimate: elevated for the enterprise cohort (~46 accounts flagged).",
    "Strongest remediation: disable ff-query-router-v2, restore prior routing, rebalance affected connections.",
    "Fallback: temporary per-tenant rate limit for the enterprise cohort routed via shard-07.",
  ],
};

const primaryChange: Change = {
  id: "CHG-SAAS-4418",
  title: "Query-routing optimization feature rollout (ff-query-router-v2)",
  deployedAt: "13:58 UTC",
  serviceId: "svc-saas-public-api",
  linkedIncidentId: primaryIncident.id,
  risk: "Medium",
};

/* -------------------------------------------------------------------------- */
/* Runbooks — 16                                                               */
/* -------------------------------------------------------------------------- */

const primaryRunbook: Runbook = {
  id: "RB-SAAS-042",
  title: "Multi-Tenant API Latency, Hot Shard, and Connection Pool Saturation",
  version: "v4.1",
  state: "Certified",
  autonomy: "Approval Gated Automation",
  serviceId: "svc-saas-public-api",
  fitnessScore: 92,
  steps: [
    { key: "s01", label: "Confirm affected regions, cohorts, routes, and shards",
      description: "Enumerate regions, customer cohorts (enterprise vs midmarket), affected API routes, and shard IDs from telemetry and API gateway logs.", kind: "diagnose" },
    { key: "s02", label: "Evaluate SLO burn and commercial impact",
      description: "Compute burn rate for p99 latency, 5xx, and workflow-completion SLOs. Estimate ARR-at-risk explicitly as an estimated metric.", kind: "diagnose" },
    { key: "s03", label: "Correlate changes, flags, traces, connections, tenant traffic",
      description: "Cross-reference recent CHG events, feature flags, top traces, DB connection utilization, and per-tenant traffic distribution.", kind: "diagnose" },
    { key: "s04", label: "Identify hot shards and noisy-neighbor contribution",
      description: "Rank shards by connection saturation and top tenants by query cost. Confirm hotspot concentration.", kind: "diagnose" },
    { key: "s05", label: "Verify tenant-isolation controls",
      description: "Sample authz decisions and query bindings to confirm no cross-tenant reads or writes. Halt if any violation is detected.", kind: "validate" },
    { key: "s06", label: "Compare remediation options",
      description: "Score feature rollback, shard rebalance, per-tenant rate limit, workload scaling, and regional traffic shift by expected impact and blast radius.", kind: "diagnose" },
    { key: "s07", label: "Disable problematic feature flag via approved control",
      description: "Toggle ff-query-router-v2 off through the change-managed feature flag service. Record the change.", kind: "mitigate" },
    { key: "s08", label: "Restore prior routing behavior",
      description: "Re-enable prior routing policy and confirm request distribution rebalances across shards.", kind: "mitigate" },
    { key: "s09", label: "Recycle or rebalance connections safely",
      description: "Drain and refresh the affected pool in bounded batches. Watch for connection storms.", kind: "mitigate" },
    { key: "s10", label: "Apply temporary tenant-aware rate protection if required",
      description: "Only when validation still fails, enforce per-tenant rate protection for the enterprise cohort. Time-boxed.", kind: "mitigate" },
    { key: "s11", label: "Validate p95, p99, 5xx, workflow completion, consumer lag, journeys",
      description: "Verify recovery against SLIs and run synthetic customer journeys across all cohorts and regions.", kind: "validate" },
    { key: "s12", label: "Confirm no tenant data crossed boundaries",
      description: "Re-run the tenant-isolation verification suite. Any anomaly halts the runbook and escalates to Security.", kind: "validate" },
    { key: "s13", label: "Communicate to customer-success and support",
      description: "Coordinate with Customer Communications Coordinator; update status page and internal support playbook.", kind: "validate" },
    { key: "s14", label: "Monitor error-budget recovery",
      description: "Track fast-burn to healthy-burn transition. Hold enhanced monitoring for 60 minutes.", kind: "validate" },
    { key: "s15", label: "Roll back remediation on integrity or isolation risk",
      description: "If data integrity, availability, or tenant isolation degrades, revert changes and escalate to Incident Commander + Security.", kind: "rollback" },
  ],
};

const runbookStub = (id: string, title: string, serviceId: string, fitness: number, steps: Runbook["steps"] = []): Runbook => ({
  id, title, version: "v1.0", state: "Certified", autonomy: "Approval Gated Automation",
  serviceId, fitnessScore: fitness, steps,
});

const runbooksList: Runbook[] = [
  primaryRunbook,
  runbookStub("RB-SAAS-047", "Public API 5xx Rate Increase", "svc-saas-public-api", 84, [
    { key: "s1", label: "Confirm 5xx signature",              description: "Correlate 5xx by route, cohort, and shard.", kind: "diagnose" },
    { key: "s2", label: "Identify top error class",           description: "Rank error classes and upstream dependencies.", kind: "diagnose" },
    { key: "s3", label: "Mitigate top contributor",            description: "Apply canonical mitigation with change control.", kind: "mitigate" },
    { key: "s4", label: "Validate 5xx recovery",               description: "Confirm 5xx rate returns below SLO threshold.", kind: "validate" },
    { key: "s5", label: "Rollback on integrity risk",          description: "Revert and escalate if integrity concern.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-052", "Database Connection Pool Saturation", "svc-saas-data", 87, [
    { key: "s1", label: "Confirm pool saturation",  description: "Measure pool utilization and wait times.", kind: "diagnose" },
    { key: "s2", label: "Identify hot tenants",      description: "Rank tenants by connection consumption.", kind: "diagnose" },
    { key: "s3", label: "Recycle affected pools",     description: "Drain and refresh pools in bounded batches.", kind: "mitigate" },
    { key: "s4", label: "Validate pool health",       description: "Confirm pool utilization returns to healthy range.", kind: "validate" },
    { key: "s5", label: "Rollback on data risk",      description: "Revert and escalate on any data-integrity concern.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-057", "Kafka Consumer Lag and Backlog Recovery", "svc-saas-streaming", 85, [
    { key: "s1", label: "Confirm consumer lag",        description: "Identify lagging consumer groups and partitions.", kind: "diagnose" },
    { key: "s2", label: "Scale consumer group",         description: "Scale out consumers with concurrency safety.", kind: "mitigate" },
    { key: "s3", label: "Drain backlog at controlled rate", description: "Bounded drain, watch downstream health.", kind: "mitigate" },
    { key: "s4", label: "Validate lag recovery",         description: "Confirm lag returns below threshold.", kind: "validate" },
    { key: "s5", label: "Rollback scale if instability", description: "Return to baseline capacity on instability.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-061", "Cache Stampede Protection", "svc-saas-data", 78, [
    { key: "s1", label: "Confirm cache stampede",      description: "Detect thundering-herd on origin.", kind: "diagnose" },
    { key: "s2", label: "Enable request coalescing",   description: "Turn on single-flight/coalescing at cache tier.", kind: "mitigate" },
    { key: "s3", label: "Validate hit ratio recovery", description: "Confirm hit ratio and origin load recover.", kind: "validate" },
    { key: "s4", label: "Rollback coalescing on regression", description: "Revert coalescing on adverse behavior.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-066", "Authentication Service Degradation", "svc-saas-identity", 88, [
    { key: "s1", label: "Confirm authn degradation",  description: "Correlate login success and latency against baseline.", kind: "diagnose" },
    { key: "s2", label: "Failover to standby authn",   description: "Shift authn traffic to standby under change control.", kind: "mitigate" },
    { key: "s3", label: "Validate customer login",      description: "Confirm login success rate returns to SLO.", kind: "validate" },
    { key: "s4", label: "Rollback on session anomaly",  description: "Revert if session issuance shows anomaly.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-071", "TLS Certificate Expiration", "svc-saas-customer-platform", 82, [
    { key: "s1", label: "Inventory certificate state", description: "Enumerate certs approaching expiration.", kind: "diagnose" },
    { key: "s2", label: "Rotate certificate",           description: "Stage rotation with reversible steps.", kind: "mitigate" },
    { key: "s3", label: "Validate TLS chain",            description: "Confirm chain validity from CDN and clients.", kind: "validate" },
    { key: "s4", label: "Rollback rotation",             description: "Revert on trust or handshake failures.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-076", "Regional Failover", "svc-saas-customer-platform", 91, [
    { key: "s1", label: "Confirm regional impairment",  description: "Validate regional health and blast radius.", kind: "diagnose" },
    { key: "s2", label: "Shift traffic to healthy region", description: "Execute regional traffic shift under approval.", kind: "mitigate" },
    { key: "s3", label: "Validate cross-region flows",   description: "Verify customer journeys on secondary region.", kind: "validate" },
    { key: "s4", label: "Failback plan",                 description: "Stage failback runbook once primary recovers.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-081", "Noisy-Neighbor Containment", "svc-saas-public-api", 80, [
    { key: "s1", label: "Identify noisy tenant",          description: "Rank tenants by resource consumption.", kind: "diagnose" },
    { key: "s2", label: "Apply tenant-aware rate limit",  description: "Enforce per-tenant rate limit under approval.", kind: "mitigate" },
    { key: "s3", label: "Validate neighbor recovery",      description: "Confirm other tenants recover to SLO.", kind: "validate" },
    { key: "s4", label: "Remove rate limit",               description: "Remove protection once demand normalizes.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-086", "Canary Deployment Rollback", "svc-saas-developer", 89, [
    { key: "s1", label: "Confirm canary regression",   description: "Compare canary vs baseline error/latency.", kind: "diagnose" },
    { key: "s2", label: "Rollback canary",              description: "Revert canary via GitOps under approval.", kind: "mitigate" },
    { key: "s3", label: "Validate baseline health",      description: "Confirm baseline metrics recover.", kind: "validate" },
    { key: "s4", label: "Reissue smaller canary",        description: "Stage smaller canary for fix.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-091", "Feature-Flag Emergency Disablement", "svc-saas-public-api", 90, [
    { key: "s1", label: "Confirm flag impact",           description: "Correlate flag exposure with SLO burn.", kind: "diagnose" },
    { key: "s2", label: "Disable flag via approved control", description: "Toggle flag off through change-managed control.", kind: "mitigate" },
    { key: "s3", label: "Validate customer journeys",     description: "Confirm journeys recover across cohorts.", kind: "validate" },
    { key: "s4", label: "Rollback flag change",           description: "Revert if downstream regressions appear.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-096", "Webhook Delivery Backlog", "svc-saas-notifications", 79, [
    { key: "s1", label: "Confirm webhook backlog",       description: "Measure webhook queue depth and delivery delay.", kind: "diagnose" },
    { key: "s2", label: "Scale dispatcher",               description: "Scale out dispatcher workers safely.", kind: "mitigate" },
    { key: "s3", label: "Validate delivery success",       description: "Confirm SLO for webhook success/latency recovers.", kind: "validate" },
    { key: "s4", label: "Rollback scaling on instability", description: "Return to baseline capacity on instability.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-101", "Kubernetes CrashLoop and Capacity Recovery", "svc-saas-customer-platform", 83, [
    { key: "s1", label: "Confirm crashloop signature",    description: "Identify affected deployments and node pools.", kind: "diagnose" },
    { key: "s2", label: "Cordon and drain affected nodes", description: "Isolate impaired nodes under approval.", kind: "mitigate" },
    { key: "s3", label: "Validate pod health",             description: "Confirm pod readiness returns to healthy.", kind: "validate" },
    { key: "s4", label: "Rollback drain",                   description: "Uncordon nodes on recovery.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-106", "Storage Growth and Capacity Protection", "svc-saas-data", 74, [
    { key: "s1", label: "Confirm growth trajectory",      description: "Project time-to-full for affected storage.", kind: "diagnose" },
    { key: "s2", label: "Expand storage / prune backups", description: "Apply approved capacity relief.", kind: "mitigate" },
    { key: "s3", label: "Validate capacity health",        description: "Confirm capacity headroom returns to policy.", kind: "validate" },
    { key: "s4", label: "Rollback pruning on data risk",   description: "Halt pruning on data-integrity concern.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-111", "DNS or Global Traffic Routing Degradation", "svc-saas-customer-platform", 81, [
    { key: "s1", label: "Confirm DNS/GTM failure",       description: "Correlate resolver health and GTM policy.", kind: "diagnose" },
    { key: "s2", label: "Failover to healthy resolver",  description: "Shift resolution under approval.", kind: "mitigate" },
    { key: "s3", label: "Validate global reachability",   description: "Confirm reachability from external probes.", kind: "validate" },
    { key: "s4", label: "Rollback DNS change",             description: "Revert change on anomaly.", kind: "rollback" },
  ]),
  runbookStub("RB-SAAS-116", "Tenant Isolation Verification", "svc-saas-identity", 95, [
    { key: "s1", label: "Sample authz decisions",         description: "Sample authorization decisions across tenants.", kind: "diagnose" },
    { key: "s2", label: "Verify query bindings",          description: "Confirm queries bind to owning tenant.", kind: "diagnose" },
    { key: "s3", label: "Run isolation test suite",        description: "Execute isolation test cases against production shadow.", kind: "validate" },
    { key: "s4", label: "Escalate on violation",           description: "Halt and escalate on any anomaly.", kind: "rollback" },
  ]),
];

const primaryExecution: Execution = {
  id: "EXE-SAAS-7804",
  runbookId: primaryRunbook.id,
  incidentId: primaryIncident.id,
  state: "Awaiting Approval",
  approvalId: "APR-SAAS-8842",
};

const primaryApproval: Approval = {
  id: "APR-SAAS-8842",
  runbookId: primaryRunbook.id,
  executionId: primaryExecution.id,
  requestedBy: "DW-SAAS-IC-01",
  requestedAt: "14:14 UTC",
  state: "Pending",
  reason: "Approval-gated automation: disable ff-query-router-v2, restore prior routing, and rebalance affected DB connections. Tenant-isolation verification is a hard gate. Security-control bypass is prohibited by policy.",
};

/* -------------------------------------------------------------------------- */
/* SLOs                                                                        */
/* -------------------------------------------------------------------------- */

const slos: Slo[] = [
  { id: "SLO-SAAS-PLATFORM-AV",   serviceId: "svc-saas-customer-platform", name: "Customer platform availability",       target: 99.95, current: 99.71, errorBudgetRemaining: 22, window: "28d" },
  { id: "SLO-SAAS-API-AV",        serviceId: "svc-saas-public-api",         name: "Public API availability",              target: 99.95, current: 99.28, errorBudgetRemaining: 8,  window: "28d" },
  { id: "SLO-SAAS-AUTH-AV",       serviceId: "svc-saas-identity",           name: "Authentication availability",           target: 99.99, current: 99.98, errorBudgetRemaining: 84, window: "28d" },
  { id: "SLO-SAAS-API-P95",       serviceId: "svc-saas-public-api",         name: "Public API p95 latency <250ms",         target: 99.0,  current: 88.4,  errorBudgetRemaining: 12, window: "28d" },
  { id: "SLO-SAAS-API-P99",       serviceId: "svc-saas-public-api",         name: "Public API p99 latency <800ms",         target: 99.0,  current: 76.2,  errorBudgetRemaining: 5,  window: "28d" },
  { id: "SLO-SAAS-WF-START",      serviceId: "svc-saas-workflow",           name: "Workflow-start latency p95 <1500ms",    target: 99.0,  current: 94.6,  errorBudgetRemaining: 31, window: "28d" },
  { id: "SLO-SAAS-WF-COMPLETE",   serviceId: "svc-saas-workflow",           name: "Workflow-completion reliability",        target: 99.5,  current: 98.4,  errorBudgetRemaining: 26, window: "28d" },
  { id: "SLO-SAAS-WH-LAT",        serviceId: "svc-saas-notifications",      name: "Webhook-delivery latency p95 <30s",     target: 99.0,  current: 96.2,  errorBudgetRemaining: 46, window: "28d" },
  { id: "SLO-SAAS-WH-SUCC",       serviceId: "svc-saas-notifications",      name: "Webhook success",                        target: 99.5,  current: 99.11, errorBudgetRemaining: 41, window: "28d" },
  { id: "SLO-SAAS-DATA-FRESH",    serviceId: "svc-saas-data",               name: "Data freshness <60s",                   target: 99.0,  current: 95.4,  errorBudgetRemaining: 27, window: "28d" },
  { id: "SLO-SAAS-SEARCH-FRESH",  serviceId: "svc-saas-search",             name: "Search freshness <120s",                target: 99.0,  current: 98.7,  errorBudgetRemaining: 71, window: "28d" },
  { id: "SLO-SAAS-TENANT-PROV",   serviceId: "svc-saas-tenant",             name: "Tenant-provisioning completion",         target: 99.0,  current: 99.6,  errorBudgetRemaining: 79, window: "28d" },
  { id: "SLO-SAAS-DATA-DURAB",    serviceId: "svc-saas-data",               name: "Data durability (illustrative)",         target: 99.999999, current: 99.999999, errorBudgetRemaining: 100, window: "28d" },
  { id: "SLO-SAAS-REGIONAL-REC",  serviceId: "svc-saas-customer-platform",  name: "Regional recovery time <30m",           target: 99.0,  current: 99.2,  errorBudgetRemaining: 82, window: "28d" },
];

/* -------------------------------------------------------------------------- */
/* Connectors                                                                  */
/* -------------------------------------------------------------------------- */

const connectors: Connector[] = [
  { id: "CON-SAAS-CLOUD",   name: "Cloud provider (simulated AWS)",         kind: "Cloud",         status: "Healthy",  freshness: "20s ago" },
  { id: "CON-SAAS-K8S",     name: "Kubernetes (simulated EKS)",             kind: "Cloud",         status: "Healthy",  freshness: "12s ago" },
  { id: "CON-SAAS-OTEL",    name: "OpenTelemetry Collector (synthetic)",    kind: "Observability", status: "Healthy",  freshness: "8s ago"  },
  { id: "CON-SAAS-METRICS", name: "Metrics platform (simulated Prometheus)", kind: "Observability", status: "Healthy",  freshness: "10s ago" },
  { id: "CON-SAAS-LOGS",    name: "Logging platform (simulated Loki)",       kind: "Observability", status: "Healthy",  freshness: "10s ago" },
  { id: "CON-SAAS-TRACING", name: "Tracing platform (simulated Tempo)",      kind: "Observability", status: "Healthy",  freshness: "12s ago" },
  { id: "CON-SAAS-DBMON",   name: "Database monitoring (simulated)",         kind: "Observability", status: "Degraded", freshness: "45s ago" },
  { id: "CON-SAAS-KAFKA",   name: "Event streaming (simulated MSK)",         kind: "Data",          status: "Degraded", freshness: "30s ago" },
  { id: "CON-SAAS-GITHUB",  name: "GitHub (simulated)",                       kind: "Change",        status: "Healthy",  freshness: "1m ago"  },
  { id: "CON-SAAS-CICD",    name: "CI/CD (simulated)",                        kind: "Change",        status: "Healthy",  freshness: "40s ago" },
  { id: "CON-SAAS-GITOPS",  name: "GitOps controller (simulated Argo CD)",   kind: "Change",        status: "Healthy",  freshness: "25s ago" },
  { id: "CON-SAAS-FF",      name: "Feature flag service (simulated LaunchDarkly)", kind: "Change",  status: "Healthy",  freshness: "20s ago" },
  { id: "CON-SAAS-SECRETS", name: "Secrets manager (simulated)",              kind: "Cloud",         status: "Healthy",  freshness: "1m ago"  },
  { id: "CON-SAAS-INCIDENT",name: "Incident management (simulated PagerDuty)", kind: "ITSM",         status: "Healthy",  freshness: "15s ago" },
  { id: "CON-SAAS-ITSM",    name: "ITSM (simulated ServiceNow)",              kind: "ITSM",          status: "Healthy",  freshness: "40s ago" },
  { id: "CON-SAAS-SUPPORT", name: "Customer support (simulated Zendesk)",     kind: "ITSM",          status: "Healthy",  freshness: "1m ago"  },
  { id: "CON-SAAS-STATUS",  name: "Status page (simulated Statuspage)",       kind: "Chat",          status: "Healthy",  freshness: "30s ago" },
  { id: "CON-SAAS-BILLING", name: "Billing (simulated Stripe)",               kind: "Data",          status: "Healthy",  freshness: "2m ago"  },
  { id: "CON-SAAS-CRM",     name: "CRM (simulated Salesforce)",                kind: "Data",          status: "Healthy",  freshness: "5m ago"  },
  { id: "CON-SAAS-COLLAB",  name: "Collaboration (simulated Slack)",           kind: "Chat",          status: "Healthy",  freshness: "6s ago"  },
];

/* -------------------------------------------------------------------------- */
/* Changes / knowledge / evidence / problems / executions                      */
/* -------------------------------------------------------------------------- */

const changesList: Change[] = [
  primaryChange,
  { id: "CHG-SAAS-4412", title: "Kubernetes cluster autoscaler upgrade (us-east-1)", deployedAt: "yesterday", serviceId: "svc-saas-customer-platform", risk: "Low" },
  { id: "CHG-SAAS-4405", title: "PostgreSQL minor version patch (replicas)",         deployedAt: "2d ago",     serviceId: "svc-saas-data",              risk: "Low" },
  { id: "CHG-SAAS-4398", title: "WAF rule refresh",                                   deployedAt: "3d ago",     serviceId: "svc-saas-customer-platform", risk: "Low" },
];

const knowledgeItems: KnowledgeItem[] = [
  { id: "K-SAAS-RB-042", title: "RB-SAAS-042 · Multi-Tenant API Latency, Hot Shard, and Connection Pool Saturation", kind: "Runbook",    serviceId: "svc-saas-public-api", source: "runbook-library", freshness: "3m ago",  snippet: "Approval-gated feature rollback, connection rebalance, tenant-isolation verification." },
  { id: "K-SAAS-RB-116", title: "RB-SAAS-116 · Tenant Isolation Verification",                                       kind: "Runbook",    serviceId: "svc-saas-identity",   source: "runbook-library", freshness: "1h ago",  snippet: "Standing verification suite for tenant isolation invariants." },
  { id: "K-SAAS-KE-311", title: "KE-311 · Feature-flag rollouts causing shard hotspots",                             kind: "Known Error", serviceId: "svc-saas-public-api", source: "knowledge-base",  freshness: "1d ago",  snippet: "Symptoms and safe rollout strategy for routing changes." },
  { id: "K-SAAS-KE-317", title: "KE-317 · Connection storm on pool recycle",                                          kind: "Known Error", serviceId: "svc-saas-data",       source: "knowledge-base",  freshness: "2d ago",  snippet: "Guardrails when refreshing PgBouncer pools." },
  { id: "K-SAAS-PB-EBP", title: "Playbook · Error-budget policy and release gates",                                   kind: "Playbook",    serviceId: "svc-saas-customer-platform", source: "knowledge-base", freshness: "1w ago", snippet: "Error-budget-driven release velocity, canary duration, and approval requirements." },
  { id: "K-SAAS-PM-8842",title: "PM-SAAS-8842 · Hot-shard degradation postmortem (draft)",                            kind: "Postmortem",  serviceId: "svc-saas-public-api", source: "knowledge-base",  freshness: "in progress", snippet: "Draft postmortem including SLO impact, release controls, architecture contributors." },
];

const evidenceItems: EvidenceItem[] = [
  { id: "EV-SAAS-501", title: "Feature flag ff-query-router-v2 rollout record", source: "Feature flag (simulated)",    capturedAt: "13:58 UTC", incidentId: primaryIncident.id, kind: "change" },
  { id: "EV-SAAS-502", title: "DB connection utilization time series",           source: "Prometheus (synthetic)",       capturedAt: "14:03 UTC", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-SAAS-503", title: "API p99 latency and 5xx by cohort",                source: "Prometheus (synthetic)",       capturedAt: "14:06 UTC", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-SAAS-504", title: "Distributed trace sample · slow /v1/workflows",    source: "OpenTelemetry (synthetic)",    capturedAt: "14:08 UTC", incidentId: primaryIncident.id, kind: "trace"  },
  { id: "EV-SAAS-505", title: "Kafka consumer lag histogram",                     source: "Stream broker (simulated)",    capturedAt: "14:09 UTC", incidentId: primaryIncident.id, kind: "metric" },
  { id: "EV-SAAS-506", title: "Tenant-isolation audit sample",                    source: "Security audit (synthetic)",   capturedAt: "14:10 UTC", incidentId: primaryIncident.id, kind: "log"    },
  { id: "EV-SAAS-507", title: "Enterprise-cohort ARR-at-risk estimate",           source: "Impact analytics (synthetic)", capturedAt: "14:11 UTC", incidentId: primaryIncident.id, kind: "config" },
];

const problemsList: Problem[] = [
  { id: "PRB-SAAS-929", title: "Query-routing feature rollouts cause tenant-shard hotspots", state: "Investigating", serviceId: "svc-saas-public-api" },
  { id: "PRB-SAAS-921", title: "Connection storm on pool recycle in high-QPS regions",       state: "Open",          serviceId: "svc-saas-data" },
  { id: "PRB-SAAS-914", title: "Webhook dispatcher backpressure at peak hours",              state: "Open",          serviceId: "svc-saas-notifications" },
];

const scenarioStages: ScenarioStage[] = [
  { index: 0,  label: "Production Reliability Command Center — baseline" },
  { index: 1,  label: "Customer Platform Digital Twin overview" },
  { index: 2,  label: "Multi-region service topology inspection" },
  { index: 3,  label: "Telemetry and distributed tracing review" },
  { index: 4,  label: "SLO fast burn detected (p99, 5xx)" },
  { index: 5,  label: "Correlated production alerts converge on shard-07" },
  { index: 6,  label: "Production Incident Command declared (SEV 1)" },
  { index: 7,  label: "Multi-tenant investigation across cohorts and regions" },
  { index: 8,  label: "Hot-shard hypothesis becomes dominant" },
  { index: 9,  label: "Remediation options compared with error-budget policy" },
  { index: 10, label: "Runbook RB-SAAS-042 selected" },
  { index: 11, label: "Policy and change preflight — tenant-isolation gate" },
  { index: 12, label: "Human approval requested (Incident Commander + Change Manager)" },
  { index: 13, label: "Supervised autonomous execution — flag disable, routing restore, connection rebalance" },
  { index: 14, label: "Customer journey validation across cohorts and regions" },
  { index: 15, label: "Customer communications sent and status page updated" },
  { index: 16, label: "Incident resolves — no tenant boundary crossed" },
  { index: 17, label: "Blameless postmortem PM-SAAS-8842 opens" },
  { index: 18, label: "Runbook and architecture improvement proposed" },
  { index: 19, label: "Reliability and commercial value captured" },
];

const executionsList: (Execution & { title: string })[] = [
  { ...primaryExecution, title: "Feature flag disable + routing restore + connection rebalance (RB-SAAS-042)" },
  { id: "EXE-SAAS-7712", runbookId: "RB-SAAS-057", incidentId: "INC-SAAS-8810", state: "Completed", title: "Kafka consumer lag recovery rehearsal" },
  { id: "EXE-SAAS-7688", runbookId: "RB-SAAS-086", incidentId: "INC-SAAS-8791", state: "Completed", title: "Canary rollback rehearsal" },
  { id: "EXE-SAAS-7654", runbookId: "RB-SAAS-076", incidentId: "INC-SAAS-8772", state: "Completed", title: "Regional failover rehearsal (eu-west-1 → eu-central-1)" },
];

/* -------------------------------------------------------------------------- */
/* Profile                                                                     */
/* -------------------------------------------------------------------------- */

export const atlasCloudProfile: TenantOperationalProfile = {
  tenantId: atlasCloudTenant.id,
  industryProfileId: saasProductionIndustry.id,
  displayName: "AtlasCloud Production",
  shortName: "AtlasCloud",
  industry: "saas-production",
  businessDescription:
    "Fictional B2B workflow-automation SaaS platform serving ~2,400 customer organizations across enterprise and midmarket tiers. API-first, event-driven workflow processing, customer webhooks, subscription billing, continuous delivery. Multi-tenant Kubernetes architecture across North American (us-east-1) and European (eu-west-1) production regions with a warm DR footprint in eu-central-1. Regional data-residency requirements apply.",
  operatingModel:
    "Product-aligned engineering teams supported by a central Platform/SRE organization that owns Kubernetes, streaming, data, edge, and observability fleets. 24×7 follow-the-sun on-call. Error-budget-driven release governance.",
  operatingHours: "24×7 with follow-the-sun on-call",
  geographicScope: "North America (us-east-1) + Europe (eu-west-1) production · eu-central-1 DR",
  defaultServiceId: "svc-saas-customer-platform",
  defaultScenarioId: "scenario-saas-hot-shard-degradation",
  defaultStoryId: "story-saas-hot-shard-degradation",
  defaultEnvironment: "Production",
  defaultRegion: "US East + EU West",
  defaultTimeRange: "1h",
  tenantAccent: "sky",
  dataClassification: "Synthetic demonstration — no real customer data, no real API keys, no real subscription records",
  complianceContext: [
    "SOC 2 control areas (mapping only)",
    "ISO/IEC 27001 control areas (mapping only)",
    "Data residency (internal reference)",
    "Customer SLA (internal reference)",
    "Change management (internal reference)",
    "Access control (internal reference)",
    "Incident response (internal reference)",
    "Business continuity (internal reference)",
    "Backup and recovery (internal reference)",
    "Secure development (internal reference)",
    "Artifact provenance (internal reference)",
    "Tenant isolation (internal reference)",
    "Audit retention (internal reference)",
  ],
  operationalPriorities: [
    "Customer availability",
    "Tenant isolation",
    "Data freshness and integrity",
    "Data durability",
    "Security-control integrity",
    "Release velocity governed by error budget",
    "Customer-commercial impact awareness",
  ],
  hardGuardrails: [
    ...saasProductionIndustry.hardGuardrails,
    { id: "gr-saas-tenant-isolation", title: "Tenant isolation",
      rule: "No mitigation may cross tenant boundaries. Cross-tenant reads/writes halt the runbook and escalate to Security." },
    { id: "gr-saas-no-security-bypass", title: "No security-control bypass",
      rule: "WAF, authz, secrets management, and audit controls may not be bypassed to accelerate mitigation." },
    { id: "gr-saas-no-destructive-db", title: "No unapproved destructive database action",
      rule: "Schema migrations, drops, and destructive DML require Change Manager + Data Reliability Engineer approval." },
    { id: "gr-saas-residency", title: "Data residency",
      rule: "Regional failover must respect tenant data-residency contracts. Cross-region movement of EU-resident data requires explicit approval." },
    { id: "gr-saas-audit-retention", title: "Audit retention",
      rule: "Audit-log retention windows may not be shortened during incident response." },
    { id: "gr-saas-emergency-access", title: "Emergency access",
      rule: "Break-glass access is time-boxed, recorded, and requires Security acknowledgment. Digital workers may not initiate emergency access." },
    { id: "gr-saas-rate-limit", title: "Permanent rate-limit change",
      rule: "Permanent rate-limit changes require Product + Customer-Success approval; only temporary time-boxed limits may be applied during incidents." },
  ],
  terminologyOverrides: {
    incident:    "Production incident",
    approval:    "Change approval",
    journey:     "Customer journey",
    impact:      "Customer impact",
    slo:         "SLO",
    errorBudget: "Error budget",
  },
  scenarioMode: "demonstration",
  syntheticDataNotice:
    "Synthetic demonstration environment. All customer names, transactions, subscriptions, API keys, and tenant accounts are fictional. Simulated provider aliases (AWS, EKS, MSK, Aurora, PagerDuty, Stripe, LaunchDarkly, Argo CD, Zendesk, Salesforce, and similar) are illustrative only — no vendor certification, partnership, or live production integration is implied.",
  sourceSystemAliases: [
    { id: "ssa-saas-cloud",   systemName: "Simulated AWS",              aliasIn: "Cloud provider",   purpose: "Regional cloud infrastructure (simulation only)" },
    { id: "ssa-saas-k8s",     systemName: "Simulated EKS",              aliasIn: "Kubernetes",       purpose: "Multi-tenant application platform (simulation only)" },
    { id: "ssa-saas-pg",      systemName: "Simulated Aurora PostgreSQL", aliasIn: "Operational DB",  purpose: "Primary + read replicas (simulation only)" },
    { id: "ssa-saas-kafka",   systemName: "Simulated Amazon MSK",        aliasIn: "Streaming",       purpose: "Event streaming (simulation only)" },
    { id: "ssa-saas-redis",   systemName: "Simulated ElastiCache Redis", aliasIn: "Cache",           purpose: "Session and query cache (simulation only)" },
    { id: "ssa-saas-search",  systemName: "Simulated Elasticsearch",     aliasIn: "Search",          purpose: "Search and indexing (simulation only)" },
    { id: "ssa-saas-otel",    systemName: "OpenTelemetry (synthetic)",   aliasIn: "Observability",   purpose: "Traces, metrics, logs (simulation only)" },
    { id: "ssa-saas-ff",      systemName: "Simulated LaunchDarkly",       aliasIn: "Feature flags",  purpose: "Progressive delivery (simulation only)" },
    { id: "ssa-saas-argo",    systemName: "Simulated Argo CD",           aliasIn: "GitOps",          purpose: "Continuous delivery (simulation only)" },
    { id: "ssa-saas-pagerduty", systemName: "Simulated PagerDuty",       aliasIn: "Incident mgmt",   purpose: "Paging and escalation (simulation only)" },
    { id: "ssa-saas-stripe",  systemName: "Simulated Stripe",             aliasIn: "Billing",         purpose: "Subscription billing (simulation only)" },
    { id: "ssa-saas-statuspage", systemName: "Simulated Statuspage",      aliasIn: "Status page",     purpose: "Customer status communications (simulation only)" },
    { id: "ssa-saas-zendesk", systemName: "Simulated Zendesk",           aliasIn: "Support",         purpose: "Customer support (simulation only)" },
    { id: "ssa-saas-sfdc",    systemName: "Simulated Salesforce",         aliasIn: "CRM",             purpose: "Customer accounts (simulation only)" },
  ],
  profileVersion: "2.0.0",
  profileState: "Active",
};

/* -------------------------------------------------------------------------- */
/* Bundle                                                                      */
/* -------------------------------------------------------------------------- */

export const atlasCloudBundle: TenantFixtureBundle = {
  tenant: atlasCloudTenant,
  services, components, digitalWorkers, slos, connectors,
  runbooksList, changesList, knowledgeItems, evidenceItems, problemsList,
  scenarioStages,
  primaryIncident, primaryChange, primaryRunbook, primaryExecution, primaryApproval,
  primaryProblemId: "PRB-SAAS-929",
  primaryPostmortemId: "PM-SAAS-8842",
  executionsList,
  initialAuditLog: [
    { id: "AUD-SAAS-1", at: "13:58 UTC", actor: "system",             action: "change.deployed",     target: primaryChange.id,   detail: "ff-query-router-v2 enabled at 100%" },
    { id: "AUD-SAAS-2", at: "14:03 UTC", actor: "system",             action: "signal.detected",     target: "cmp-saas-tenant-shards", detail: "Connection saturation on shard-07" },
    { id: "AUD-SAAS-3", at: "14:07 UTC", actor: "system",             action: "incident.declared",   target: primaryIncident.id, detail: "SEV 1 production incident" },
    { id: "AUD-SAAS-4", at: "14:10 UTC", actor: "DW-SAAS-DATA-04",    action: "hypothesis.raised",   target: primaryIncident.id, detail: "Hot tenant shard from ff-query-router-v2" },
    { id: "AUD-SAAS-5", at: "14:12 UTC", actor: "DW-SAAS-IMPACT-09",  action: "impact.rescored",     target: primaryIncident.id, detail: "Enterprise cohort ARR-at-risk elevated" },
    { id: "AUD-SAAS-6", at: "14:14 UTC", actor: "DW-SAAS-IC-01",      action: "approval.requested",  target: primaryApproval.id, detail: "Disable flag, restore routing, rebalance (RB-SAAS-042)" },
  ],
  initialNotifications: [
    { id: "N-SAAS-1", at: "14:07 UTC", kind: "critical", title: "SEV 1 production incident",         detail: `${primaryIncident.id} · Public API`,             entityRef: primaryIncident.id,  route: `/runops/incidents/${primaryIncident.id}` },
    { id: "N-SAAS-2", at: "14:08 UTC", kind: "warning",  title: "API p99 fast-burn",                 detail: "Enterprise cohort · us-east-1",                    entityRef: "SLO-SAAS-API-P99",  route: "/runops/reliability/slos" },
    { id: "N-SAAS-3", at: "14:09 UTC", kind: "warning",  title: "Public API 5xx elevated",           detail: "/v1/workflows · 4.8%",                             entityRef: "SLO-SAAS-API-AV",   route: "/runops/reliability/slos" },
    { id: "N-SAAS-4", at: "14:10 UTC", kind: "warning",  title: "Kafka consumer lag climbing",       detail: "workflow-completion · 220s",                       entityRef: "SLO-SAAS-WF-COMPLETE", route: "/runops/reliability/slos" },
    { id: "N-SAAS-5", at: "14:14 UTC", kind: "info",     title: "Change approval requested",         detail: `${primaryApproval.id} · ${primaryRunbook.id}`,     entityRef: primaryApproval.id,  route: "/runops/approvals" },
  ],
};

export const atlasCloudRecord: TenantProfileRecord = {
  profile: atlasCloudProfile,
  industry: saasProductionIndustry,
  bundle: atlasCloudBundle,
};
