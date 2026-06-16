/**
 * Evidence Graph & Root Cause Engine — data model + curated mock graph
 * for the Payment Latency Incident hero scenario.
 *
 * The structure is intentionally extensible so real telemetry / change /
 * APM integrations could replace the mock data without touching UI code.
 */

export type EvidenceStatus =
  | "primary_cause"
  | "critical"
  | "warning"
  | "healthy"
  | "excluded"
  | "info";

export type EvidenceCategory =
  | "Change"
  | "APM"
  | "Infrastructure"
  | "Database"
  | "Transaction"
  | "Reliability"
  | "Eventing"
  | "Business Service"
  | "FinOps"
  | "Security"
  | "Edge"
  | "API"
  | "Excluded Signal"
  | "NOVA";

export type EvidenceNodeType =
  | "Change Event"
  | "Metric Deviation"
  | "APM Trace"
  | "Infrastructure Saturation"
  | "Application Degradation"
  | "Transaction Impact"
  | "SLO Burn"
  | "Business Impact"
  | "Cost Impact"
  | "Security Context"
  | "Downstream Impact"
  | "NOVA Inference"
  | "Recommendation"
  | "Excluded Signal";

export type RelationshipType =
  | "Precedes"
  | "Correlates With"
  | "Contributes To"
  | "Causes Hypothesis"
  | "Amplifies"
  | "Downstream Impact"
  | "Rules Out"
  | "Supports Recommendation";

export type SourceSystemName =
  | "CloudWatch Metrics"
  | "CloudWatch Logs"
  | "AWS X-Ray"
  | "AWS Application Signals"
  | "OpenTelemetry"
  | "AWS CloudTrail"
  | "AWS Config"
  | "AWS Cost Explorer"
  | "AWS GuardDuty"
  | "AWS Security Hub"
  | "ServiceNow"
  | "GitHub Actions"
  | "PagerDuty"
  | "Deployment Pipeline"
  | "SLO Engine"
  | "Service Health Model";

export interface SourceSystem {
  name: SourceSystemName;
  type: "Metrics" | "Logs" | "Traces" | "Changes" | "Security" | "Cost" | "ITSM" | "Reliability";
  trustLevel: "High" | "Medium" | "Low";
  lastUpdated: string;
  coverage: number; // 0-100
  freshness: "Live" | "Near-Live" | "Delayed";
  exampleObjects: string[];
}

export interface EvidenceNode {
  id: string;
  label: string;
  type: EvidenceNodeType;
  category: EvidenceCategory;
  status: EvidenceStatus;
  confidence: number;          // 0-100
  timestamp: string;           // "10:04"
  source: SourceSystemName;
  metric?: string;
  baseline?: string;
  actual?: string;
  change?: string;
  unit?: string;
  description: string;
  interpretation?: string;
  relatedObjectId?: string;
  relatedObjectType?: "businessService" | "transaction" | "appService" | "awsResource" | "timeline" | "change" | "trace";
  severity?: "Low" | "Medium" | "High" | "Critical";
  owner?: string;
  // Position on the canonical canvas (relative 0-100). UI may override.
  x: number;
  y: number;
}

export interface EvidenceEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: RelationshipType;
  confidence: number;
  strength: "Strong" | "Moderate" | "Weak";
  lagMinutes: number;
  description: string;
  isPrimaryPath: boolean;
  status: EvidenceStatus;
  evidenceReason: string;
}

export interface RootCauseHypothesis {
  id: string;
  name: string;
  confidence: number;
  status: "Selected" | "Alternative" | "Rejected";
  summary: string;
  supportingEvidenceNodeIds: string[];
  contradictingEvidenceNodeIds: string[];
  reasonSelected?: string;
  reasonNotSelected?: string;
  recommendedAction: string;
  risk: "Low" | "Medium" | "High";
  expectedRecovery: string;
  costImpact: string;
}

export interface TimelineCorrelationItem {
  time: string;
  eventType: string;
  affectedObject: string;
  metricBefore?: string;
  metricAfter?: string;
  confidence: number;
  source: SourceSystemName;
  isPrimary?: boolean;
}

export interface BlastRadiusItem {
  id: string;
  name: string;
  layer: "Business" | "Transaction" | "Application" | "Infrastructure";
  status: EvidenceStatus;
  note: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  confidence: number;
  risk: "Low" | "Medium" | "High";
  approvalRequired: boolean;
  expectedRecovery: string;
  expectedP95: string;
  expectedErrorRate: string;
  expectedSaturation: string;
  expectedHourlyCost: string;
  rollbackPath: "Available" | "Manual" | "Not Available";
  runbook: "Ready" | "Draft" | "Missing";
  emergencyChange?: string;
  supportingEvidenceNodeIds: string[];
  isPrimary: boolean;
  rationale: string;
}

export interface ConfidenceBreakdownItem {
  label: string;
  value: number;
}

export interface ExcludedSignal {
  id: string;
  label: string;
  source: SourceSystemName;
  confidence: number;
  timestamp: string;
  reason: string;
}

export interface EvidenceCompleteness {
  overall: number;
  telemetryCoverage: number;
  traceCoverage: number;
  changeCoverage: number;
  dependencyConfidence: number;
  sourceFreshness: number;
  ownershipCoverage: number;
  sloCoverage: number;
  gaps: string[];
}

export interface EvidenceGraph {
  id: string;
  scenarioId: string;
  incidentId: string;
  title: string;
  summary: string;
  probableRootCause: string;
  confidence: number;
  risk: "Low" | "Medium" | "High";
  generatedAt: string;
  primaryHypothesisId: string;
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  hypotheses: RootCauseHypothesis[];
  timelineCorrelation: TimelineCorrelationItem[];
  blastRadius: BlastRadiusItem[];
  recommendedActions: RecommendedAction[];
  excludedSignals: ExcludedSignal[];
  sourceSystems: SourceSystem[];
  confidenceBreakdown: ConfidenceBreakdownItem[];
  completeness: EvidenceCompleteness;
  whyWhyNot: { selected: string[]; alternatives: { hypothesisId: string; bullets: string[] }[] };
}

/* ------------------------------------------------------------------ */
/* SOURCE SYSTEMS                                                      */
/* ------------------------------------------------------------------ */
const SOURCE_SYSTEMS: SourceSystem[] = [
  { name: "CloudWatch Metrics",      type: "Metrics", trustLevel: "High",   lastUpdated: "15s ago", coverage: 94, freshness: "Live",       exampleObjects: ["Aurora CPU", "ECS CPU", "SQS Depth"] },
  { name: "AWS Application Signals", type: "Traces",  trustLevel: "High",   lastUpdated: "20s ago", coverage: 89, freshness: "Live",       exampleObjects: ["Payment Service P95", "Process Payment errors"] },
  { name: "AWS X-Ray",               type: "Traces",  trustLevel: "High",   lastUpdated: "25s ago", coverage: 84, freshness: "Live",       exampleObjects: ["Trace waterfall"] },
  { name: "OpenTelemetry",           type: "Traces",  trustLevel: "High",   lastUpdated: "18s ago", coverage: 81, freshness: "Live",       exampleObjects: ["Connection pool", "DB wait"] },
  { name: "Deployment Pipeline",     type: "Changes", trustLevel: "High",   lastUpdated: "12m ago", coverage: 99, freshness: "Near-Live",  exampleObjects: ["v2.14.7 release"] },
  { name: "GitHub Actions",          type: "Changes", trustLevel: "High",   lastUpdated: "12m ago", coverage: 96, freshness: "Near-Live",  exampleObjects: ["Build #4821"] },
  { name: "AWS CloudTrail",          type: "Changes", trustLevel: "High",   lastUpdated: "45s ago", coverage: 92, freshness: "Near-Live",  exampleObjects: ["API calls"] },
  { name: "AWS Cost Explorer",       type: "Cost",    trustLevel: "Medium", lastUpdated: "5m ago",  coverage: 88, freshness: "Delayed",    exampleObjects: ["Hourly run rate"] },
  { name: "AWS GuardDuty",           type: "Security",trustLevel: "High",   lastUpdated: "1m ago",  coverage: 91, freshness: "Live",       exampleObjects: ["Findings"] },
  { name: "SLO Engine",              type: "Reliability", trustLevel: "High", lastUpdated: "10s ago", coverage: 100, freshness: "Live",    exampleObjects: ["Burn rate", "Error budget"] },
  { name: "Service Health Model",    type: "Reliability", trustLevel: "High", lastUpdated: "10s ago", coverage: 100, freshness: "Live",    exampleObjects: ["Business service health"] },
  { name: "ServiceNow",              type: "ITSM",    trustLevel: "High",   lastUpdated: "30s ago", coverage: 95, freshness: "Near-Live",  exampleObjects: ["INC-48291", "CHG-77128"] },
];

/* ------------------------------------------------------------------ */
/* HYPOTHESES                                                          */
/* ------------------------------------------------------------------ */
const HYPOTHESES: RootCauseHypothesis[] = [
  {
    id: "hyp-deploy",
    name: "Deployment Regression",
    confidence: 87,
    status: "Selected",
    summary: "Payment Service deployment v2.14.7 likely introduced connection pool behavior that saturated Aurora PostgreSQL.",
    supportingEvidenceNodeIds: ["n-deploy","n-p95","n-pool","n-cpu","n-errors","n-slo","n-sqs"],
    contradictingEvidenceNodeIds: [],
    reasonSelected:
      "Change occurred 12 minutes before degradation. Impacted transaction maps to Payment Service. Connection pool saturation rose immediately after release. Edge and API layers remained normal. APM concentrates latency inside Payment Service and Aurora.",
    recommendedAction: "Rollback deployment v2.14.7",
    risk: "Medium",
    expectedRecovery: "~15 min after approval",
    costImpact: "Returns to baseline ($518/hr)",
  },
  {
    id: "hyp-traffic",
    name: "Traffic Surge",
    confidence: 42,
    status: "Alternative",
    summary: "Increased traffic may have contributed to saturation, but traffic did not rise enough to fully explain the degradation.",
    supportingEvidenceNodeIds: ["n-p95"],
    contradictingEvidenceNodeIds: ["n-deploy","n-pool"],
    reasonNotSelected:
      "Traffic rose from 2,800 to 3,900 rpm — moderate. Pool saturation increased disproportionately, and the timing aligns to the release, not to a traffic step change.",
    recommendedAction: "Increase ECS task count",
    risk: "Low",
    expectedRecovery: "Unlikely to resolve root cause",
    costImpact: "Higher ECS cost, no DB relief",
  },
  {
    id: "hyp-db",
    name: "Database Infrastructure Failure",
    confidence: 36,
    status: "Alternative",
    summary: "Aurora is saturated, but failover readiness, backups, and storage health are normal.",
    supportingEvidenceNodeIds: ["n-cpu","n-conn"],
    contradictingEvidenceNodeIds: ["n-deploy"],
    reasonNotSelected:
      "No AWS Aurora service event. Failover health OK. Storage and replica lag normal. Saturation appears workload-driven, not infrastructure-driven.",
    recommendedAction: "Scale Aurora writer instance",
    risk: "Medium",
    expectedRecovery: "~18 min",
    costImpact: "+$210/hr ongoing",
  },
  {
    id: "hyp-sec",
    name: "Security Event",
    confidence: 18,
    status: "Alternative",
    summary: "A GuardDuty finding exists but does not align with the affected dependency path or timing.",
    supportingEvidenceNodeIds: ["n-guard"],
    contradictingEvidenceNodeIds: ["n-deploy","n-pool"],
    reasonNotSelected:
      "Finding is on an adjacent workload. No WAF spike, no IAM anomaly on Payment Service, no unusual CloudTrail on Aurora. Timing does not match.",
    recommendedAction: "Investigate adjacent workload (parallel track)",
    risk: "Low",
    expectedRecovery: "N/A",
    costImpact: "N/A",
  },
  {
    id: "hyp-3p",
    name: "Third-Party Dependency",
    confidence: 12,
    status: "Alternative",
    summary: "External dependency issue is unlikely because edge, API gateway, KMS, and external call timings remain normal.",
    supportingEvidenceNodeIds: [],
    contradictingEvidenceNodeIds: ["n-edge","n-apigw"],
    reasonNotSelected:
      "Trace waterfall shows external calls are normal. Latency is concentrated inside Payment Service and Aurora.",
    recommendedAction: "No action",
    risk: "Low",
    expectedRecovery: "N/A",
    costImpact: "N/A",
  },
];

/* ------------------------------------------------------------------ */
/* NODES — positioned on a 100x100 canvas grid                         */
/* ------------------------------------------------------------------ */
const NODES: EvidenceNode[] = [
  { id: "n-deploy",  label: "Deployment v2.14.7",         type: "Change Event",            category: "Change",          status: "primary_cause", confidence: 96, timestamp: "10:04", source: "Deployment Pipeline",     description: "Payment Service deployment completed 12 minutes before degradation.", interpretation: "Strong temporal alignment with the failure pattern.", relatedObjectId: "change-cd-7741", relatedObjectType: "change", severity: "High", owner: "Payments SRE", x: 8,  y: 50 },
  { id: "n-p95",     label: "P95 latency 228→912ms",      type: "Metric Deviation",        category: "APM",             status: "critical",      confidence: 99, timestamp: "10:08", source: "AWS Application Signals", metric: "Payment Service P95", baseline: "228 ms", actual: "912 ms", change: "+300%", unit: "ms", description: "Payment Service P95 latency increased materially after deployment.", relatedObjectId: "svc-pay", relatedObjectType: "appService", severity: "Critical", owner: "Payments SRE", x: 25, y: 30 },
  { id: "n-pool",    label: "Connection pool saturation",  type: "Infrastructure Saturation", category: "Database",      status: "critical",      confidence: 94, timestamp: "10:11", source: "OpenTelemetry",           metric: "Pool utilization", baseline: "38%", actual: "94%", change: "+56pt", description: "Payment Service connection pool reached saturation, increasing DB wait time.", relatedObjectId: "svc-pay", relatedObjectType: "appService", severity: "Critical", x: 38, y: 55 },
  { id: "n-conn",    label: "Active connections +43%",     type: "Metric Deviation",        category: "Database",        status: "critical",      confidence: 97, timestamp: "10:11", source: "CloudWatch Metrics",      metric: "Aurora connections", baseline: "Normal", actual: "+43%", description: "Active Aurora connections increased sharply after Payment Service latency rose.", relatedObjectId: "g-data", relatedObjectType: "awsResource", severity: "Critical", x: 42, y: 78 },
  { id: "n-cpu",     label: "Aurora CPU 44→91%",           type: "Infrastructure Saturation", category: "Infrastructure",status: "critical",      confidence: 99, timestamp: "10:11", source: "CloudWatch Metrics",      metric: "Aurora CPU", baseline: "44%", actual: "91%", change: "+47pt", description: "Aurora PostgreSQL CPU reached saturation threshold.", relatedObjectId: "g-data", relatedObjectType: "awsResource", severity: "Critical", x: 55, y: 30 },
  { id: "n-errors",  label: "Process Payment errors 2.7%", type: "Transaction Impact",      category: "Transaction",     status: "critical",      confidence: 99, timestamp: "10:12", source: "AWS Application Signals", metric: "Error rate", baseline: "0.08%", actual: "2.7%", change: "×34", description: "Payment transaction errors increased above SLO threshold.", relatedObjectId: "tx-pay", relatedObjectType: "transaction", severity: "Critical", x: 65, y: 56 },
  { id: "n-slo",     label: "Error budget burn 8.4×",      type: "SLO Burn",                category: "Reliability",     status: "critical",      confidence: 96, timestamp: "10:12", source: "SLO Engine",              metric: "Burn rate", baseline: "1.0×", actual: "8.4×", description: "Payment Services error budget is being consumed at elevated burn rate.", relatedObjectId: "bs-pay", relatedObjectType: "businessService", severity: "Critical", x: 78, y: 34 },
  { id: "n-sqs",     label: "SQS depth 2.1k→24k",          type: "Downstream Impact",       category: "Eventing",        status: "warning",       confidence: 95, timestamp: "10:14", source: "CloudWatch Metrics",      metric: "Queue depth", baseline: "2,100", actual: "24,000", description: "Payment event backlog increased due to slower processing and retry behavior.", x: 75, y: 75 },
  { id: "n-order",   label: "Order Management warning",    type: "Business Impact",         category: "Business Service",status: "warning",       confidence: 91, timestamp: "10:16", source: "Service Health Model",    description: "Order confirmation delayed because payment confirmation is degraded.", relatedObjectId: "bs-order", relatedObjectType: "businessService", severity: "Medium", x: 90, y: 60 },
  { id: "n-notif",   label: "Notification Services warning", type: "Business Impact",       category: "Business Service",status: "warning",       confidence: 91, timestamp: "10:16", source: "Service Health Model",    description: "Notification delivery delayed because payment events are backlogged.", relatedObjectId: "bs-notif", relatedObjectType: "businessService", severity: "Medium", x: 92, y: 85 },
  { id: "n-cost",    label: "Cost +$224/hr",               type: "Cost Impact",             category: "FinOps",          status: "warning",       confidence: 88, timestamp: "10:17", source: "AWS Cost Explorer",       metric: "Hourly run rate", baseline: "$518/hr", actual: "$742/hr", description: "ECS auto-scaling and Aurora IO increased hourly run rate.", x: 88, y: 18 },
  { id: "n-guard",   label: "GuardDuty finding (not causal)", type: "Security Context",     category: "Security",        status: "excluded",      confidence: 82, timestamp: "10:15", source: "AWS GuardDuty",           description: "Medium-severity finding on adjacent workload; timing and dependency evidence do not support causality.", x: 22, y: 88 },
  { id: "n-edge",    label: "CloudFront normal",           type: "Excluded Signal",         category: "Edge",            status: "excluded",      confidence: 96, timestamp: "10:12", source: "CloudWatch Metrics",      description: "Edge latency remained within baseline.", x: 50, y: 92 },
  { id: "n-apigw",   label: "API Gateway normal",          type: "Excluded Signal",         category: "API",             status: "excluded",      confidence: 96, timestamp: "10:12", source: "CloudWatch Metrics",      description: "API Gateway latency and error rates remained within normal range.", x: 62, y: 90 },
  { id: "n-nova",    label: "NOVA root cause inference",   type: "NOVA Inference",          category: "NOVA",            status: "info",          confidence: 87, timestamp: "10:20", source: "SLO Engine",              description: "NOVA synthesized 9 supporting signals across change, APM, database, SLO, and downstream queues into a probable root cause.", x: 48, y: 8 },
];

/* ------------------------------------------------------------------ */
/* EDGES                                                               */
/* ------------------------------------------------------------------ */
const EDGES: EvidenceEdge[] = [
  { id: "e1", sourceNodeId: "n-deploy", targetNodeId: "n-p95",     relationshipType: "Precedes",              confidence: 94, strength: "Strong",   lagMinutes: 4, description: "Deployment occurred before latency increase.", isPrimaryPath: true,  status: "critical", evidenceReason: "Deployment completed 10:04. Latency began rising 10:08. No other high-risk change in the correlation window." },
  { id: "e2", sourceNodeId: "n-p95",    targetNodeId: "n-pool",    relationshipType: "Correlates With",       confidence: 87, strength: "Strong",   lagMinutes: 3, description: "Latency increase aligns with database wait time.", isPrimaryPath: true, status: "critical", evidenceReason: "OpenTelemetry shows pool utilization rising in lockstep with Payment Service P95." },
  { id: "e3", sourceNodeId: "n-pool",   targetNodeId: "n-cpu",     relationshipType: "Contributes To",        confidence: 91, strength: "Strong",   lagMinutes: 0, description: "Connection pool saturation increased active database pressure.", isPrimaryPath: true, status: "critical", evidenceReason: "Active connections grew with pool saturation, driving Aurora CPU." },
  { id: "e3b",sourceNodeId: "n-pool",   targetNodeId: "n-conn",    relationshipType: "Amplifies",             confidence: 90, strength: "Strong",   lagMinutes: 0, description: "Saturated pool issues more concurrent queries.", isPrimaryPath: false, status: "critical", evidenceReason: "Connection growth concentrated to Payment Service identity." },
  { id: "e4", sourceNodeId: "n-cpu",    targetNodeId: "n-errors",  relationshipType: "Contributes To",        confidence: 89, strength: "Strong",   lagMinutes: 1, description: "Database saturation aligns with increased transaction errors.", isPrimaryPath: true, status: "critical", evidenceReason: "Timeouts on payment writes correlate with Aurora CPU breach." },
  { id: "e5", sourceNodeId: "n-errors", targetNodeId: "n-slo",     relationshipType: "Causes Hypothesis",     confidence: 96, strength: "Strong",   lagMinutes: 0, description: "Transaction errors directly consume service error budget.", isPrimaryPath: true, status: "critical", evidenceReason: "SLO engine attributes burn entirely to Process Payment." },
  { id: "e6", sourceNodeId: "n-slo",    targetNodeId: "n-order",   relationshipType: "Contributes To",        confidence: 95, strength: "Strong",   lagMinutes: 1, description: "SLO breach translates to business service degradation.", isPrimaryPath: true, status: "warning", evidenceReason: "Order Management depends on Payment confirmation." },
  { id: "e7", sourceNodeId: "n-errors", targetNodeId: "n-sqs",     relationshipType: "Downstream Impact",     confidence: 84, strength: "Moderate", lagMinutes: 2, description: "Payment retry & event delay increased queue depth.", isPrimaryPath: false, status: "warning", evidenceReason: "Retry storm amplifies event publication." },
  { id: "e8", sourceNodeId: "n-sqs",    targetNodeId: "n-notif",   relationshipType: "Downstream Impact",     confidence: 88, strength: "Strong",   lagMinutes: 2, description: "Notification delivery depends on payment event queue.", isPrimaryPath: true, status: "warning", evidenceReason: "Notification consumer lag grew with SQS depth." },
  { id: "e9", sourceNodeId: "n-errors", targetNodeId: "n-cost",    relationshipType: "Amplifies",             confidence: 80, strength: "Moderate", lagMinutes: 5, description: "Auto-scaling response to errors increased run rate.", isPrimaryPath: false, status: "warning", evidenceReason: "ECS scaled out under elevated error rate." },
  { id: "e10",sourceNodeId: "n-guard",  targetNodeId: "n-errors",  relationshipType: "Rules Out",             confidence: 78, strength: "Moderate", lagMinutes: 0, description: "Security finding ruled out as causal.", isPrimaryPath: false, status: "excluded", evidenceReason: "Adjacent workload, no IAM/CloudTrail anomalies on Payment Service." },
  { id: "e11",sourceNodeId: "n-edge",   targetNodeId: "n-p95",     relationshipType: "Rules Out",             confidence: 96, strength: "Strong",   lagMinutes: 0, description: "Edge ruled out — latency is internal.", isPrimaryPath: false, status: "excluded", evidenceReason: "CloudFront latency within baseline." },
  { id: "e12",sourceNodeId: "n-apigw",  targetNodeId: "n-p95",     relationshipType: "Rules Out",             confidence: 96, strength: "Strong",   lagMinutes: 0, description: "API Gateway ruled out — latency is downstream.", isPrimaryPath: false, status: "excluded", evidenceReason: "API GW p95 stable." },
  { id: "e13",sourceNodeId: "n-nova",   targetNodeId: "n-deploy",  relationshipType: "Supports Recommendation", confidence: 87, strength: "Strong", lagMinutes: 0, description: "NOVA cites deployment as the strongest primary cause candidate.", isPrimaryPath: false, status: "info", evidenceReason: "Reasoning trail concludes rollback as defensible action." },
];

/* ------------------------------------------------------------------ */
/* TIMELINE CORRELATION                                                */
/* ------------------------------------------------------------------ */
const TIMELINE: TimelineCorrelationItem[] = [
  { time: "10:00", eventType: "Baseline",   affectedObject: "Payment Service",    metricBefore: "P95 228 ms",      metricAfter: "—",              confidence: 99, source: "AWS Application Signals" },
  { time: "10:04", eventType: "Change",     affectedObject: "Payment Service",    metricBefore: "v2.14.6",         metricAfter: "v2.14.7",        confidence: 99, source: "Deployment Pipeline", isPrimary: true },
  { time: "10:08", eventType: "Metric",     affectedObject: "Payment Service",    metricBefore: "228 ms",          metricAfter: "640 ms rising",  confidence: 96, source: "AWS Application Signals", isPrimary: true },
  { time: "10:11", eventType: "Infra",      affectedObject: "Aurora PostgreSQL",  metricBefore: "CPU 44%",         metricAfter: "CPU 91%",        confidence: 99, source: "CloudWatch Metrics", isPrimary: true },
  { time: "10:12", eventType: "SLO",        affectedObject: "Payment Services",   metricBefore: "Errors 0.08%",    metricAfter: "Errors 2.7%",    confidence: 99, source: "SLO Engine", isPrimary: true },
  { time: "10:14", eventType: "Downstream", affectedObject: "SQS Payment Events", metricBefore: "2,100 msgs",      metricAfter: "24,000 msgs",    confidence: 95, source: "CloudWatch Metrics" },
  { time: "10:16", eventType: "Business",   affectedObject: "Order Management",   metricBefore: "Healthy",         metricAfter: "Warning",        confidence: 91, source: "Service Health Model" },
  { time: "10:18", eventType: "Incident",   affectedObject: "INC-48291",          metricBefore: "—",               metricAfter: "Opened",         confidence: 99, source: "ServiceNow" },
  { time: "10:20", eventType: "NOVA",       affectedObject: "Root Cause Hypothesis", metricBefore: "—",            metricAfter: "Confidence 87%", confidence: 87, source: "SLO Engine", isPrimary: true },
  { time: "10:22", eventType: "Change",     affectedObject: "CHG-77128",          metricBefore: "—",               metricAfter: "Drafted",        confidence: 99, source: "ServiceNow" },
  { time: "10:24", eventType: "Approval",   affectedObject: "Change Advisory",    metricBefore: "—",               metricAfter: "Requested",      confidence: 99, source: "ServiceNow" },
  { time: "10:26", eventType: "Runbook",    affectedObject: "Rollback Runbook",   metricBefore: "—",               metricAfter: "Ready",          confidence: 99, source: "ServiceNow" },
  { time: "10:30", eventType: "Status",     affectedObject: "Approval Gate",      metricBefore: "—",               metricAfter: "Awaiting",       confidence: 99, source: "ServiceNow" },
];

/* ------------------------------------------------------------------ */
/* BLAST RADIUS                                                        */
/* ------------------------------------------------------------------ */
const BLAST: BlastRadiusItem[] = [
  { id: "br-bs-pay",   name: "Payment Services",       layer: "Business",       status: "critical", note: "Primary impacted business service" },
  { id: "br-tx-pay",   name: "Process Payment",        layer: "Transaction",    status: "critical", note: "Errors 2.7% · P95 912 ms" },
  { id: "br-svc-pay",  name: "Payment Service",        layer: "Application",    status: "critical", note: "v2.14.7 regression candidate" },
  { id: "br-aurora",   name: "Aurora PostgreSQL",      layer: "Infrastructure", status: "critical", note: "CPU 91% · connections +43%" },
  { id: "br-sqs",      name: "SQS Payment Events",     layer: "Infrastructure", status: "warning",  note: "Depth 24,000" },
  { id: "br-bs-order", name: "Order Management",       layer: "Business",       status: "warning",  note: "Delayed confirmations" },
  { id: "br-bs-notif", name: "Notification Services",  layer: "Business",       status: "warning",  note: "Delayed sends" },
  { id: "br-tx-order", name: "Submit Order",           layer: "Transaction",    status: "warning",  note: "Step delay propagating" },
  { id: "br-bs-cx",    name: "Customer Experience",    layer: "Business",       status: "healthy",  note: "Exposed but uninterrupted" },
  { id: "br-bs-anal",  name: "Analytics Platform",     layer: "Business",       status: "healthy",  note: "Unaffected" },
  { id: "br-bs-id",    name: "Identity Services",      layer: "Business",       status: "healthy",  note: "Unaffected" },
];

/* ------------------------------------------------------------------ */
/* RECOMMENDED ACTIONS                                                 */
/* ------------------------------------------------------------------ */
const RECOMMENDATIONS: RecommendedAction[] = [
  {
    id: "rec-rollback",
    title: "Rollback Payment Service deployment v2.14.7",
    confidence: 87, risk: "Medium", approvalRequired: true,
    expectedRecovery: "15 min after approval",
    expectedP95: "260 ms",
    expectedErrorRate: "0.18%",
    expectedSaturation: "Aurora CPU 52%",
    expectedHourlyCost: "$518",
    rollbackPath: "Available", runbook: "Ready", emergencyChange: "CHG-77128",
    supportingEvidenceNodeIds: ["n-deploy","n-p95","n-pool","n-cpu","n-errors","n-slo"],
    isPrimary: true,
    rationale: "Targets the most likely root cause directly. Lowest expected time-to-restore and lowest residual risk.",
  },
  {
    id: "rec-scale-db",
    title: "Scale Aurora writer instance (r6g.4xlarge)",
    confidence: 72, risk: "Medium", approvalRequired: true,
    expectedRecovery: "18 min",
    expectedP95: "420 ms",
    expectedErrorRate: "0.9%",
    expectedSaturation: "Aurora CPU 71%",
    expectedHourlyCost: "$728",
    rollbackPath: "Manual", runbook: "Ready",
    supportingEvidenceNodeIds: ["n-cpu","n-conn"],
    isPrimary: false,
    rationale: "Relieves symptom but does not address probable root cause. Higher ongoing cost.",
  },
  {
    id: "rec-scale-ecs",
    title: "Increase Payment Service ECS task count",
    confidence: 41, risk: "Low", approvalRequired: false,
    expectedRecovery: "Unlikely",
    expectedP95: "780 ms",
    expectedErrorRate: "2.1%",
    expectedSaturation: "Aurora CPU 93%",
    expectedHourlyCost: "$612",
    rollbackPath: "Available", runbook: "Ready",
    supportingEvidenceNodeIds: [],
    isPrimary: false,
    rationale: "Adds load to the saturated database — risk of worsening the incident.",
  },
];

/* ------------------------------------------------------------------ */
/* EXCLUDED SIGNALS                                                    */
/* ------------------------------------------------------------------ */
const EXCLUDED: ExcludedSignal[] = [
  { id: "ex-cf",    label: "CloudFront latency normal",         source: "CloudWatch Metrics", confidence: 96, timestamp: "10:12", reason: "Edge latency within baseline" },
  { id: "ex-apigw", label: "API Gateway latency normal",        source: "CloudWatch Metrics", confidence: 96, timestamp: "10:12", reason: "API GW p95 stable" },
  { id: "ex-kms",   label: "KMS latency normal",                source: "CloudWatch Metrics", confidence: 94, timestamp: "10:12", reason: "Encrypt/decrypt latency normal" },
  { id: "ex-waf",   label: "WAF blocks normal",                 source: "AWS Security Hub",   confidence: 92, timestamp: "10:12", reason: "No spike in blocks or rate-limits" },
  { id: "ex-aws",   label: "No AWS regional event detected",    source: "AWS CloudTrail",     confidence: 99, timestamp: "10:12", reason: "AWS Health dashboard clean" },
  { id: "ex-fail",  label: "No Aurora failover event",          source: "CloudWatch Metrics", confidence: 99, timestamp: "10:12", reason: "Writer stable, replica lag normal" },
  { id: "ex-guard", label: "No critical GuardDuty on Payment",  source: "AWS GuardDuty",      confidence: 88, timestamp: "10:15", reason: "Finding is on adjacent workload" },
  { id: "ex-iam",   label: "No IAM policy change on Payment",   source: "AWS CloudTrail",     confidence: 96, timestamp: "10:12", reason: "No principal/policy mutation detected" },
  { id: "ex-sg",    label: "No security group change on Aurora",source: "AWS Config",         confidence: 97, timestamp: "10:12", reason: "No drift on data subnet SGs" },
  { id: "ex-nat",   label: "No NAT Gateway anomaly",            source: "CloudWatch Metrics", confidence: 95, timestamp: "10:12", reason: "Egress within baseline" },
];

/* ------------------------------------------------------------------ */
/* CONFIDENCE BREAKDOWN                                                */
/* ------------------------------------------------------------------ */
const CONFIDENCE_BREAKDOWN: ConfidenceBreakdownItem[] = [
  { label: "Change timing alignment",     value: 94 },
  { label: "Dependency path alignment",   value: 91 },
  { label: "Metric anomaly strength",     value: 96 },
  { label: "APM trace confirmation",      value: 89 },
  { label: "SLO impact alignment",        value: 95 },
  { label: "Alternative exclusion",       value: 78 },
  { label: "Source coverage",             value: 84 },
  { label: "Data freshness",              value: 99 },
];

/* ------------------------------------------------------------------ */
/* GRAPHS REGISTRY                                                     */
/* ------------------------------------------------------------------ */
export const PAYMENT_LATENCY_GRAPH: EvidenceGraph = {
  id: "eg-payment-latency",
  scenarioId: "payment-latency",
  incidentId: "INC-48291",
  title: "Payment Latency Incident",
  summary:
    "Deployment v2.14.7 introduced connection pool saturation against Aurora PostgreSQL, causing Payment Service latency, Process Payment errors, SLO burn, SQS backlog, and downstream business impact.",
  probableRootCause: "Deployment Regression",
  confidence: 87,
  risk: "Medium",
  generatedAt: "10:20",
  primaryHypothesisId: "hyp-deploy",
  nodes: NODES,
  edges: EDGES,
  hypotheses: HYPOTHESES,
  timelineCorrelation: TIMELINE,
  blastRadius: BLAST,
  recommendedActions: RECOMMENDATIONS,
  excludedSignals: EXCLUDED,
  sourceSystems: SOURCE_SYSTEMS,
  confidenceBreakdown: CONFIDENCE_BREAKDOWN,
  completeness: {
    overall: 86,
    telemetryCoverage: 91,
    traceCoverage: 84,
    changeCoverage: 96,
    dependencyConfidence: 78,
    sourceFreshness: 99,
    ownershipCoverage: 88,
    sloCoverage: 92,
    gaps: [
      "No database query plan sample available.",
      "Limited synthetic transaction data for Payment Services.",
      "CloudTrail does not show database parameter changes.",
      "No recent DR test attached to Payment Services.",
    ],
  },
  whyWhyNot: {
    selected: [
      "Deployment occurred 12 minutes before degradation.",
      "Affected transaction maps to Payment Service.",
      "Payment Service v2.14.7 is the changed component.",
      "Connection pool saturation increased after deployment.",
      "Aurora CPU rose after Payment Service latency rose.",
      "APM traces show latency concentrated in Payment Service and Aurora.",
      "Edge and API layers remained normal.",
      "SLO burn aligns with transaction error increase.",
    ],
    alternatives: [
      { hypothesisId: "hyp-traffic", bullets: ["Traffic rose but not enough to explain the failure pattern.", "Latency increase is disproportionate to traffic delta."] },
      { hypothesisId: "hyp-db",      bullets: ["Aurora saturated, but failover & backup health are normal.", "No AWS regional / infrastructure event."] },
      { hypothesisId: "hyp-sec",     bullets: ["GuardDuty finding is adjacent, not on Payment Service.", "No IAM/CloudTrail anomaly on Payment Service."] },
      { hypothesisId: "hyp-3p",      bullets: ["Trace data does not show external dependency latency.", "Latency is internal to Payment Service & Aurora."] },
    ],
  },
};

export const EVIDENCE_GRAPHS: EvidenceGraph[] = [PAYMENT_LATENCY_GRAPH];

export function getEvidenceGraphForScenario(scenarioId: string | null | undefined): EvidenceGraph | null {
  if (!scenarioId) return null;
  return EVIDENCE_GRAPHS.find(g => g.scenarioId === scenarioId) ?? null;
}

/* ------------------------------------------------------------------ */
/* MODE → HIGHLIGHT HELPERS                                            */
/* ------------------------------------------------------------------ */
export type EvidenceGraphMode =
  | "causal"
  | "hypotheses"
  | "timeline"
  | "blast"
  | "recommendation";

export const EVIDENCE_MODES: { id: EvidenceGraphMode; label: string }[] = [
  { id: "causal",         label: "Causal Chain" },
  { id: "hypotheses",     label: "Hypotheses" },
  { id: "timeline",       label: "Timeline Correlation" },
  { id: "blast",          label: "Blast Radius" },
  { id: "recommendation", label: "Recommendation" },
];

/** Pretty palette per node status — light theme only. */
export const NODE_STATUS_STYLE: Record<EvidenceStatus, { ring: string; bg: string; text: string; dot: string; label: string }> = {
  primary_cause: { ring: "ring-violet-300",  bg: "bg-violet-50",  text: "text-violet-700", dot: "bg-violet-500",  label: "Primary cause candidate" },
  critical:      { ring: "ring-rose-300",    bg: "bg-rose-50",    text: "text-rose-700",   dot: "bg-rose-500",    label: "Critical" },
  warning:       { ring: "ring-amber-300",   bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-500",   label: "Warning" },
  healthy:       { ring: "ring-emerald-300", bg: "bg-emerald-50", text: "text-emerald-700",dot: "bg-emerald-500", label: "Healthy" },
  excluded:      { ring: "ring-slate-200",   bg: "bg-slate-50",   text: "text-slate-500",  dot: "bg-slate-400",   label: "Excluded" },
  info:          { ring: "ring-indigo-300",  bg: "bg-indigo-50",  text: "text-indigo-700", dot: "bg-indigo-500",  label: "Info" },
};

export function categoryAccent(category: EvidenceCategory): string {
  switch (category) {
    case "Change":           return "text-violet-700 bg-violet-50 border-violet-200";
    case "APM":              return "text-rose-700 bg-rose-50 border-rose-200";
    case "Infrastructure":   return "text-rose-700 bg-rose-50 border-rose-200";
    case "Database":         return "text-rose-700 bg-rose-50 border-rose-200";
    case "Transaction":      return "text-rose-700 bg-rose-50 border-rose-200";
    case "Reliability":      return "text-amber-700 bg-amber-50 border-amber-200";
    case "Eventing":         return "text-amber-700 bg-amber-50 border-amber-200";
    case "Business Service": return "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200";
    case "FinOps":           return "text-teal-700 bg-teal-50 border-teal-200";
    case "Security":         return "text-indigo-700 bg-indigo-50 border-indigo-200";
    case "NOVA":             return "text-violet-700 bg-violet-50 border-violet-200";
    default:                 return "text-slate-600 bg-slate-50 border-slate-200";
  }
}
