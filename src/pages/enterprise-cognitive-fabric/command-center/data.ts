/**
 * Enterprise Command Center — deterministic seeded demo data.
 * No external APIs; all values are stable between renders and demos.
 */

export type DemoState = "healthy" | "degraded" | "discovery-failure" | "high-risk";
export type ViewMode = "executive" | "operations" | "architecture";

export interface Team {
  id: string;
  name: string;
  businessUnit: string;
  status: "Onboarded" | "In progress" | "Scheduled";
  onboardingPercent: number;
  owner: string;
  lastReviewed: string;
  healthScore: number;
}

export interface Persona {
  id: string;
  teamId: string;
  name: string;
  confidence: number;
  status: "Approved" | "Pending review" | "Drifting";
  approvedAttributes: number;
  pendingAttributes: number;
  lastUpdated: string;
  nextReview: string;
}

export interface CognitiveHealthDimension {
  id: string;
  name: string;
  score: number;
  baseline: number;
  target: number;
  trend: number[];
  definition: string;
  lastCalculated: string;
  positiveFactors: string[];
  negativeFactors: string[];
  recommendation: string;
  linkedTeams: string[];
  contributingSignals: string[];
}

export interface DiscoveryPipeline {
  id: string;
  source: string;
  sourceType: "Docs" | "Tickets" | "Messages" | "Code";
  status: "Running" | "Completed" | "Failed" | "Paused";
  progress: number;
  lastRun: string;
  queueDepth: number;
  processed: number;
  warnings: number;
  owner: string;
  authStatus: string;
  scope: string;
  lastSuccess: string;
  stage: string;
  artifactsDiscovered: number;
  artifactsNormalized: number;
  conditionsExtracted: number;
  personasUpdated: number;
  errors: number;
}

export interface MemoryStore {
  id: string;
  name: string;
  size: number; // TB
  recordCount: number;
  percentage: number;
  freshness: number;
  health: "Healthy" | "Watch" | "Degraded";
  monthlyGrowth: string;
  color: string;
}

export interface KnowledgeDomain {
  id: string;
  name: string;
  assets: number;
  conditions: number;
  personas: number;
  freshness: number;
  mostActiveTeam: string;
}

export interface IncomingWorkItem {
  id: string;
  title: string;
  type: "RFC" | "Design" | "Policy" | "Bug" | "Feature" | "Architecture Decision" | "Operational Change";
  originatingTeam: string;
  receivingTeam: string;
  status: "Under review" | "Impact analysis" | "Awaiting decision";
  risk: "Low" | "Medium" | "High";
  day: string;
  createdAt: string;
  dueAt: string;
}

export interface Decision {
  id: string;
  title: string;
  decision: "Approve" | "Review" | "Reject";
  impactScore: number;
  risk: "Low" | "Medium" | "High";
  owner: string;
  createdAt: string;
  originatingTeam: string;
  evaluatedPersonas: string[];
  conflicts: string[];
  conditionsEvaluated: number;
  requiredApprovals: string[];
  recommendation: string;
  evidence: string[];
  history: string[];
  predictedOutcome: string;
  actualOutcome?: string;
  summary: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  severity: "Critical" | "Warning" | "Info";
  source: string;
  owner: string;
  status: "Open" | "Acknowledged" | "Snoozed" | "Resolved";
  createdAt: string;
}

export interface CognitiveInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  affectedTeam: string;
  sources: string[];
  recommendation: string;
  reviewed: boolean;
}

export interface LearningStage {
  id: string;
  name: string;
  status: "Healthy" | "Watch" | "Failed";
  throughput: string;
  lastRun: string;
  errors: number;
  queue: number;
  agents: string;
  sla: string;
  workflows: string[];
}

export const teams: Team[] = [
  { id: "t-pay", name: "Payments", businessUnit: "Financial Services", status: "Onboarded", onboardingPercent: 100, owner: "R. Vasquez", lastReviewed: "12 Jul 2026", healthScore: 88 },
  { id: "t-idn", name: "Identity Service", businessUnit: "Platform", status: "Onboarded", onboardingPercent: 100, owner: "P. Okafor", lastReviewed: "28 Jul 2026", healthScore: 94 },
  { id: "t-acc", name: "Accounting", businessUnit: "Finance", status: "Onboarded", onboardingPercent: 100, owner: "H. Lindqvist", lastReviewed: "01 Aug 2026", healthScore: 91 },
  { id: "t-cus", name: "Customer Success", businessUnit: "Revenue", status: "In progress", onboardingPercent: 72, owner: "M. Ibrahim", lastReviewed: "30 Jul 2026", healthScore: 79 },
  { id: "t-sec", name: "Security Engineering", businessUnit: "Platform", status: "In progress", onboardingPercent: 61, owner: "D. Karlsen", lastReviewed: "22 Jul 2026", healthScore: 84 },
  { id: "t-log", name: "Logistics Ops", businessUnit: "Operations", status: "Scheduled", onboardingPercent: 18, owner: "S. Rahman", lastReviewed: "—", healthScore: 62 },
];

export const personas: Persona[] = [
  { id: "p-pay", teamId: "t-pay", name: "Payments Team Persona", confidence: 78, status: "Drifting", approvedAttributes: 46, pendingAttributes: 7, lastUpdated: "2 days ago", nextReview: "10 Aug 2026" },
  { id: "p-idn", teamId: "t-idn", name: "Identity Service Persona", confidence: 96, status: "Approved", approvedAttributes: 58, pendingAttributes: 1, lastUpdated: "6 hours ago", nextReview: "24 Aug 2026" },
  { id: "p-acc", teamId: "t-acc", name: "Accounting Persona", confidence: 91, status: "Approved", approvedAttributes: 51, pendingAttributes: 2, lastUpdated: "1 day ago", nextReview: "18 Aug 2026" },
  { id: "p-cus", teamId: "t-cus", name: "Customer Success Persona", confidence: 83, status: "Pending review", approvedAttributes: 38, pendingAttributes: 11, lastUpdated: "3 days ago", nextReview: "09 Aug 2026" },
  { id: "p-sec", teamId: "t-sec", name: "Security Engineering Persona", confidence: 89, status: "Approved", approvedAttributes: 44, pendingAttributes: 4, lastUpdated: "5 hours ago", nextReview: "20 Aug 2026" },
];

export const healthDimensions: CognitiveHealthDimension[] = [
  {
    id: "d-know", name: "Knowledge Coverage", score: 94, baseline: 86, target: 95,
    trend: [84, 86, 88, 89, 91, 93, 94],
    definition: "Share of approved enterprise sources represented in current organizational memory.",
    lastCalculated: "10:18 AM",
    positiveFactors: ["SharePoint backfill completed", "GitHub code corpus expanded 14%"],
    negativeFactors: ["Legacy Confluence server unavailable"],
    recommendation: "Restore the legacy Confluence connector to close the remaining coverage gap.",
    linkedTeams: ["Payments", "Identity Service"],
    contributingSignals: ["Source inventory", "Artifact ingestion rate", "Normalization success"],
  },
  {
    id: "d-conf", name: "Persona Confidence", score: 90, baseline: 84, target: 92,
    trend: [82, 84, 85, 87, 88, 89, 90],
    definition: "Weighted confidence across approved team personas, adjusted for human validation recency.",
    lastCalculated: "10:18 AM",
    positiveFactors: ["Accounting persona validated by owners", "12 new business conditions approved"],
    negativeFactors: ["Payments persona below 80% threshold"],
    recommendation: "Schedule a Payments persona review session with the team owner.",
    linkedTeams: ["Payments", "Accounting"],
    contributingSignals: ["Validation events", "Attribute drift", "Review recency"],
  },
  {
    id: "d-fresh", name: "Data Freshness", score: 88, baseline: 85, target: 93,
    trend: [85, 85, 86, 86, 87, 88, 88],
    definition: "Median age of ingested artifacts relative to source change frequency.",
    lastCalculated: "10:18 AM",
    positiveFactors: ["Slack ingestion running continuously"],
    negativeFactors: ["ServiceNow ticket sync on a 6-hour cadence"],
    recommendation: "Move ServiceNow ingestion to an incremental hourly schedule.",
    linkedTeams: ["Operations", "Customer Success"],
    contributingSignals: ["Last run times", "Queue depth", "Change rate"],
  },
  {
    id: "d-dec", name: "Decision Quality", score: 93, baseline: 88, target: 94,
    trend: [87, 88, 90, 91, 92, 92, 93],
    definition: "Agreement between recommended decisions and validated operational outcomes.",
    lastCalculated: "10:18 AM",
    positiveFactors: ["Predicted impact matched outcome on 27 of 29 changes"],
    negativeFactors: ["Two overridden recommendations in Logistics"],
    recommendation: "Capture override rationale to strengthen the Logistics persona.",
    linkedTeams: ["Logistics Ops", "Payments"],
    contributingSignals: ["Outcome comparison", "Override rate", "Conflict density"],
  },
  {
    id: "d-learn", name: "Learning Effectiveness", score: 95, baseline: 89, target: 95,
    trend: [88, 90, 91, 92, 93, 94, 95],
    definition: "Rate at which validated outcomes update conditions, personas, and dependencies.",
    lastCalculated: "10:18 AM",
    positiveFactors: ["41 lessons applied this month", "Feedback loop latency down to 4 hours"],
    negativeFactors: ["Manual lesson approval remains a bottleneck"],
    recommendation: "Enable delegated approval for low-risk lessons.",
    linkedTeams: ["Platform", "Finance"],
    contributingSignals: ["Lesson volume", "Loop latency", "Condition updates"],
  },
  {
    id: "d-rel", name: "System Reliability", score: 91, baseline: 90, target: 96,
    trend: [90, 90, 91, 89, 90, 91, 91],
    definition: "Availability and error budget consumption across fabric services.",
    lastCalculated: "10:18 AM",
    positiveFactors: ["No control-plane incidents in 30 days"],
    negativeFactors: ["Evidence Vault storage at 78% utilization"],
    recommendation: "Expand Evidence Vault capacity before the next quarterly ingest.",
    linkedTeams: ["Platform"],
    contributingSignals: ["Service availability", "Job failures", "Storage headroom"],
  },
];

export const pipelines: DiscoveryPipeline[] = [
  { id: "pl-conf", source: "Confluence Cloud", sourceType: "Docs", status: "Running", progress: 78, lastRun: "2 min ago", queueDepth: 1240, processed: 18422, warnings: 0, owner: "Knowledge Platform", authStatus: "OAuth valid · expires 12 Sep 2026", scope: "12 spaces · 4 label filters", lastSuccess: "Today 09:41", stage: "Normalize", artifactsDiscovered: 24118, artifactsNormalized: 18422, conditionsExtracted: 2841, personasUpdated: 9, errors: 0 },
  { id: "pl-jira", source: "Jira (Engineering)", sourceType: "Tickets", status: "Running", progress: 62, lastRun: "3 min ago", queueDepth: 3180, processed: 9410, warnings: 2, owner: "Engineering Ops", authStatus: "Service account valid", scope: "7 projects · last 24 months", lastSuccess: "Today 09:12", stage: "Extract", artifactsDiscovered: 15240, artifactsNormalized: 9410, conditionsExtracted: 1622, personasUpdated: 6, errors: 0 },
  { id: "pl-slack", source: "Slack Enterprise", sourceType: "Messages", status: "Running", progress: 55, lastRun: "1 min ago", queueDepth: 8620, processed: 41209, warnings: 1, owner: "Workplace IT", authStatus: "Enterprise grid token valid", scope: "34 approved channels", lastSuccess: "Today 10:02", stage: "Ingest", artifactsDiscovered: 82440, artifactsNormalized: 41209, conditionsExtracted: 984, personasUpdated: 4, errors: 0 },
  { id: "pl-sp", source: "SharePoint", sourceType: "Docs", status: "Completed", progress: 100, lastRun: "5 min ago", queueDepth: 0, processed: 12980, warnings: 0, owner: "Knowledge Platform", authStatus: "Certificate valid", scope: "9 site collections", lastSuccess: "Today 10:09", stage: "Publish", artifactsDiscovered: 12980, artifactsNormalized: 12980, conditionsExtracted: 1740, personasUpdated: 7, errors: 0 },
  { id: "pl-snow", source: "ServiceNow", sourceType: "Tickets", status: "Completed", progress: 100, lastRun: "7 min ago", queueDepth: 0, processed: 7620, warnings: 0, owner: "Service Management", authStatus: "OAuth valid", scope: "Incident · Change · Problem", lastSuccess: "Today 10:07", stage: "Publish", artifactsDiscovered: 7620, artifactsNormalized: 7620, conditionsExtracted: 1188, personasUpdated: 5, errors: 0 },
  { id: "pl-gh", source: "GitHub", sourceType: "Code", status: "Completed", progress: 100, lastRun: "10 min ago", queueDepth: 0, processed: 5410, warnings: 0, owner: "Engineering Ops", authStatus: "App installation valid", scope: "48 repositories", lastSuccess: "Today 10:04", stage: "Publish", artifactsDiscovered: 5410, artifactsNormalized: 5410, conditionsExtracted: 902, personasUpdated: 3, errors: 0 },
];

export const memoryStores: MemoryStore[] = [
  { id: "m-ev", name: "Evidence Vault", size: 1.6, recordCount: 1284000, percentage: 38, freshness: 92, health: "Watch", monthlyGrowth: "+142 GB", color: "#2563eb" },
  { id: "m-bc", name: "Business Conditions", size: 1.1, recordCount: 86400, percentage: 26, freshness: 95, health: "Healthy", monthlyGrowth: "+88 GB", color: "#16a34a" },
  { id: "m-pe", name: "Personas", size: 0.8, recordCount: 72, percentage: 19, freshness: 89, health: "Healthy", monthlyGrowth: "+46 GB", color: "#7c3aed" },
  { id: "m-cg", name: "Context Graph", size: 0.5, recordCount: 412000, percentage: 12, freshness: 91, health: "Healthy", monthlyGrowth: "+32 GB", color: "#f59e0b" },
  { id: "m-ot", name: "Other", size: 0.2, recordCount: 9800, percentage: 5, freshness: 84, health: "Healthy", monthlyGrowth: "+12 GB", color: "#94a3b8" },
];

export const knowledgeDomains: KnowledgeDomain[] = [
  { id: "kd-eng", name: "Engineering", assets: 12532, conditions: 2841, personas: 18, freshness: 93, mostActiveTeam: "Identity Service" },
  { id: "kd-ops", name: "Operations", assets: 8842, conditions: 1904, personas: 14, freshness: 90, mostActiveTeam: "Logistics Ops" },
  { id: "kd-sec", name: "Security", assets: 6421, conditions: 1488, personas: 9, freshness: 94, mostActiveTeam: "Security Engineering" },
  { id: "kd-cs", name: "Customer Success", assets: 4781, conditions: 1022, personas: 11, freshness: 87, mostActiveTeam: "Customer Success" },
  { id: "kd-fin", name: "Finance", assets: 3912, conditions: 861, personas: 8, freshness: 91, mostActiveTeam: "Accounting" },
  { id: "kd-hr", name: "HR", assets: 2145, conditions: 402, personas: 6, freshness: 82, mostActiveTeam: "People Ops" },
  { id: "kd-leg", name: "Legal & Compliance", assets: 1987, conditions: 511, personas: 6, freshness: 88, mostActiveTeam: "Compliance" },
];

export const incomingTrend = [
  { day: "Mon", value: 62 },
  { day: "Tue", value: 118 },
  { day: "Wed", value: 104 },
  { day: "Thu", value: 58 },
  { day: "Fri", value: 126 },
  { day: "Sat", value: 34 },
  { day: "Sun", value: 96 },
];

export const incomingWork: IncomingWorkItem[] = [
  { id: "w-1", title: "Real-time fraud scoring rollout", type: "RFC", originatingTeam: "Payments", receivingTeam: "Risk", status: "Awaiting decision", risk: "Medium", day: "Fri", createdAt: "Fri 09:20", dueAt: "12 Aug 2026" },
  { id: "w-2", title: "Identity token rotation policy", type: "Policy", originatingTeam: "Security Engineering", receivingTeam: "Platform", status: "Under review", risk: "Low", day: "Fri", createdAt: "Fri 11:05", dueAt: "14 Aug 2026" },
  { id: "w-3", title: "Ledger service partitioning", type: "Architecture Decision", originatingTeam: "Accounting", receivingTeam: "Platform", status: "Impact analysis", risk: "High", day: "Tue", createdAt: "Tue 08:41", dueAt: "11 Aug 2026" },
  { id: "w-4", title: "Checkout latency regression", type: "Bug", originatingTeam: "Customer Success", receivingTeam: "Payments", status: "Under review", risk: "High", day: "Tue", createdAt: "Tue 15:12", dueAt: "08 Aug 2026" },
  { id: "w-5", title: "Warehouse routing redesign", type: "Design", originatingTeam: "Logistics Ops", receivingTeam: "Operations", status: "Impact analysis", risk: "Medium", day: "Wed", createdAt: "Wed 10:33", dueAt: "19 Aug 2026" },
  { id: "w-6", title: "Retention window change to 18 months", type: "Operational Change", originatingTeam: "Compliance", receivingTeam: "Platform", status: "Awaiting decision", risk: "Medium", day: "Sun", createdAt: "Sun 13:48", dueAt: "15 Aug 2026" },
  { id: "w-7", title: "Self-service refunds", type: "Feature", originatingTeam: "Customer Success", receivingTeam: "Payments", status: "Under review", risk: "Low", day: "Mon", createdAt: "Mon 09:02", dueAt: "21 Aug 2026" },
];

export const decisions: Decision[] = [
  {
    id: "dc-1", title: "Add Real-time Fraud Scoring", decision: "Approve", impactScore: 92, risk: "Low", owner: "R. Vasquez", createdAt: "1 hour ago",
    originatingTeam: "Payments", evaluatedPersonas: ["Payments", "Risk", "Identity Service"], conflicts: [], conditionsEvaluated: 84,
    requiredApprovals: ["Payments owner", "Risk owner"], recommendation: "Approve with staged rollout across two payment corridors.",
    evidence: ["RFC-2841", "Fraud loss analysis Q2", "Identity latency budget"], history: ["Submitted 09:05", "Impact analysis 09:22", "Approved 09:48"],
    predictedOutcome: "Fraud loss reduction of 11–14% with < 40 ms added latency.", actualOutcome: "Pending 30-day measurement window.",
    summary: "Introduce inline fraud scoring on authorization requests.",
  },
  {
    id: "dc-2", title: "Upgrade Database Version", decision: "Approve", impactScore: 85, risk: "Medium", owner: "P. Okafor", createdAt: "2 hours ago",
    originatingTeam: "Platform", evaluatedPersonas: ["Platform", "Accounting", "Payments"], conflicts: ["Accounting month-end freeze"], conditionsEvaluated: 61,
    requiredApprovals: ["Platform owner", "Finance change board"], recommendation: "Approve outside the month-end freeze window.",
    evidence: ["Change record CHG-10421", "Compatibility matrix"], history: ["Submitted 07:40", "Conflict raised 08:02", "Approved 08:35"],
    predictedOutcome: "Two-hour maintenance window, no data-plane impact.", actualOutcome: "Completed within window.",
    summary: "Move the primary ledger cluster to the current supported major version.",
  },
  {
    id: "dc-3", title: "Third-party Logging Tool", decision: "Review", impactScore: 65, risk: "Medium", owner: "D. Karlsen", createdAt: "3 hours ago",
    originatingTeam: "Security Engineering", evaluatedPersonas: ["Security Engineering", "Compliance", "Platform"], conflicts: ["Data residency condition"], conditionsEvaluated: 47,
    requiredApprovals: ["Security owner", "Compliance owner"], recommendation: "Hold pending regional data-residency confirmation.",
    evidence: ["Vendor DPA", "Residency condition BC-338"], history: ["Submitted 06:55", "Returned for review 07:30"],
    predictedOutcome: "Improved log retention, unresolved residency exposure.",
    summary: "Adopt an external log aggregation platform for platform services.",
  },
  {
    id: "dc-4", title: "New Data Retention Policy", decision: "Approve", impactScore: 88, risk: "Low", owner: "H. Lindqvist", createdAt: "5 hours ago",
    originatingTeam: "Compliance", evaluatedPersonas: ["Compliance", "Accounting", "Customer Success"], conflicts: [], conditionsEvaluated: 52,
    requiredApprovals: ["Compliance owner"], recommendation: "Approve and publish updated retention conditions.",
    evidence: ["Policy POL-118", "Regulatory mapping"], history: ["Submitted 05:10", "Approved 05:58"],
    predictedOutcome: "Storage reduction of ~180 GB per quarter.", actualOutcome: "Storage trend consistent with prediction.",
    summary: "Reduce operational log retention from 24 to 18 months.",
  },
  {
    id: "dc-5", title: "AI Code Assistant Pilot", decision: "Reject", impactScore: 32, risk: "High", owner: "M. Ibrahim", createdAt: "1 day ago",
    originatingTeam: "Engineering Ops", evaluatedPersonas: ["Security Engineering", "Compliance", "Platform"], conflicts: ["Source code egress condition", "Vendor review incomplete"], conditionsEvaluated: 39,
    requiredApprovals: ["Security owner", "Compliance owner", "CTO"], recommendation: "Reject until source-code egress controls are evidenced.",
    evidence: ["Condition BC-102", "Vendor questionnaire (incomplete)"], history: ["Submitted yesterday 08:15", "Rejected yesterday 16:40"],
    predictedOutcome: "Unacceptable code egress exposure under current controls.",
    summary: "Pilot an external code assistant across two engineering teams.",
  },
];

export const alerts: SystemAlert[] = [
  { id: "al-1", title: "Discovery job failure: Legacy Confluence Server", severity: "Critical", source: "Discovery", owner: "Knowledge Platform", status: "Open", createdAt: "2 min ago" },
  { id: "al-2", title: "Persona confidence below threshold: Payments Team", severity: "Warning", source: "Persona Studio", owner: "R. Vasquez", status: "Open", createdAt: "15 min ago" },
  { id: "al-3", title: "High memory utilization: Evidence Vault (78%)", severity: "Info", source: "Cognitive Memory", owner: "Platform", status: "Open", createdAt: "32 min ago" },
];

export const insight: CognitiveInsight = {
  id: "in-1",
  title: "Persona Confidence Improvement",
  description:
    "Accounting Team persona confidence improved 12% this week based on new knowledge and human validation.",
  category: "Persona quality",
  confidence: 94,
  affectedTeam: "Accounting",
  sources: ["SharePoint finance handbook", "ServiceNow change history", "Owner validation session"],
  recommendation: "Promote the validated attributes into the shared finance condition set.",
  reviewed: false,
};

export const learningStages: LearningStage[] = [
  { id: "ls-1", name: "Discover", status: "Healthy", throughput: "1.2k artifacts/hr", lastRun: "2 min ago", errors: 0, queue: 1240, agents: "4 connectors", sla: "15 min", workflows: ["Source inventory", "Scope validation"] },
  { id: "ls-2", name: "Ingest", status: "Healthy", throughput: "980 artifacts/hr", lastRun: "1 min ago", errors: 0, queue: 8620, agents: "6 workers", sla: "30 min", workflows: ["Artifact ingestion"] },
  { id: "ls-3", name: "Normalize", status: "Healthy", throughput: "910 artifacts/hr", lastRun: "1 min ago", errors: 0, queue: 3180, agents: "6 workers", sla: "30 min", workflows: ["Artifact normalization"] },
  { id: "ls-4", name: "Extract", status: "Watch", throughput: "410 conditions/hr", lastRun: "3 min ago", errors: 2, queue: 640, agents: "3 extractors", sla: "1 hour", workflows: ["Business condition extraction"] },
  { id: "ls-5", name: "Validate", status: "Healthy", throughput: "128 items/hr", lastRun: "6 min ago", errors: 0, queue: 84, agents: "Human reviewers", sla: "4 hours", workflows: ["Human validation"] },
  { id: "ls-6", name: "Publish", status: "Healthy", throughput: "96 items/hr", lastRun: "5 min ago", errors: 0, queue: 21, agents: "2 publishers", sla: "1 hour", workflows: ["Memory publication"] },
  { id: "ls-7", name: "Learn", status: "Healthy", throughput: "41 lessons/mo", lastRun: "12 min ago", errors: 0, queue: 5, agents: "Learning loop", sla: "24 hours", workflows: ["Outcome comparison", "Persona update"] },
];

export const learnStageDetail = {
  predictedVsActual: "27 of 29 evaluated changes matched their predicted operational outcome.",
  personaConfidenceDelta: "+3.4 points average across 5 personas",
  conditionsChanged: 18,
  lessonsLearned: 41,
};

export const kpiTrends = {
  teams: [39, 41, 42, 44, 45, 46, 48],
  personas: [58, 61, 63, 66, 68, 70, 72],
  health: [80, 83, 85, 86, 88, 90, 92],
  jobs: [14, 17, 15, 19, 21, 20, 23],
  memory: [3.1, 3.3, 3.5, 3.7, 3.8, 4.0, 4.2],
};

/** Deterministic filter multipliers — values stay stable per filter combination. */
export const timeRanges = ["7 days", "30 days", "90 days"] as const;
export type TimeRange = (typeof timeRanges)[number];

export const filterOptions = {
  businessUnit: ["All business units", "Platform", "Financial Services", "Operations", "Revenue", "Finance"],
  team: ["All teams", ...teams.map((t) => t.name)],
  environment: ["All environments", "Production", "Staging", "Development"],
  riskLevel: ["All risk levels", "Low", "Medium", "High"],
  status: ["All statuses", "Running", "Completed", "Failed"],
  knowledgeDomain: ["All domains", ...knowledgeDomains.map((d) => d.name)],
};

export interface Filters {
  timeRange: TimeRange;
  businessUnit: string;
  team: string;
  environment: string;
  riskLevel: string;
  status: string;
  knowledgeDomain: string;
}

export const defaultFilters: Filters = {
  timeRange: "30 days",
  businessUnit: filterOptions.businessUnit[0],
  team: filterOptions.team[0],
  environment: filterOptions.environment[0],
  riskLevel: filterOptions.riskLevel[0],
  status: filterOptions.status[0],
  knowledgeDomain: filterOptions.knowledgeDomain[0],
};

/** Stable hash so the same filter set always produces the same numbers. */
export function seedFrom(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 1000) / 1000;
}

export const notificationSeed = [
  { id: "n-1", type: "Persona review", title: "Payments persona review requested", time: "8 min ago", read: false },
  { id: "n-2", type: "Discovery", title: "Legacy Confluence connector failed authentication", time: "12 min ago", read: false },
  { id: "n-3", type: "High-risk evaluation", title: "Ledger service partitioning scored High risk", time: "40 min ago", read: false },
  { id: "n-4", type: "Approval", title: "Retention window change awaiting compliance approval", time: "1 hour ago", read: false },
  { id: "n-5", type: "Drift", title: "Customer Success persona attributes drifting", time: "3 hours ago", read: false },
  { id: "n-6", type: "Learning loop", title: "41 lessons applied to organizational memory", time: "5 hours ago", read: true },
];

export const searchCatalog = [
  { id: "s-1", category: "Teams", title: "Payments", summary: "Financial Services · 88 health · owner R. Vasquez", owner: "R. Vasquez", confidence: 88, route: "/enterprise-cognitive-fabric/team-persona-construction" },
  { id: "s-2", category: "Personas", title: "Payments Team Persona", summary: "Confidence 78% · below 80% threshold · drifting", owner: "R. Vasquez", confidence: 78, route: "/enterprise-cognitive-fabric/team-persona-construction" },
  { id: "s-3", category: "Personas", title: "Customer Success Persona", summary: "Confidence 83% · pending review", owner: "M. Ibrahim", confidence: 83, route: "/enterprise-cognitive-fabric/team-persona-construction" },
  { id: "s-4", category: "Conditions", title: "Payments latency budget (BC-214)", summary: "Authorization latency must remain under 250 ms p99", owner: "Payments", confidence: 96, route: "/enterprise-cognitive-fabric/business-condition-extraction" },
  { id: "s-5", category: "Work Items", title: "Checkout latency regression", summary: "Bug · High risk · Customer Success → Payments", owner: "M. Ibrahim", confidence: 74, route: "/enterprise-cognitive-fabric/cognitive-intake" },
  { id: "s-6", category: "Decisions", title: "AI Code Assistant Pilot", summary: "Reject · impact 32 · High risk", owner: "M. Ibrahim", confidence: 91, route: "/enterprise-cognitive-fabric/decision-intelligence" },
  { id: "s-7", category: "Decisions", title: "Add Real-time Fraud Scoring", summary: "Approve · impact 92 · affects customer experience", owner: "R. Vasquez", confidence: 94, route: "/enterprise-cognitive-fabric/decision-intelligence" },
  { id: "s-8", category: "Evidence", title: "Fraud loss analysis Q2", summary: "Evidence Vault · validated 4 days ago", owner: "Risk", confidence: 89, route: "/enterprise-cognitive-fabric/enterprise-cognitive-memory" },
  { id: "s-9", category: "Knowledge Domains", title: "Engineering", summary: "12,532 assets · 2,841 conditions", owner: "Identity Service", confidence: 93, route: "/enterprise-cognitive-fabric/enterprise-source-discovery" },
  { id: "s-10", category: "Dependencies", title: "Teams dependent on Identity Service", summary: "6 teams · Payments, Accounting, Customer Success, Risk, Compliance, Logistics", owner: "P. Okafor", confidence: 92, route: "/enterprise-cognitive-fabric/cross-team-impact-matrix" },
  { id: "s-11", category: "Work Items", title: "High-risk changes this week", summary: "3 items scored High risk pending decision", owner: "Change board", confidence: 80, route: "/enterprise-cognitive-fabric/cognitive-intake" },
];

export const contextGraphNodes = [
  { id: "g-src", label: "Approved Sources", count: 6, kind: "source" as const },
  { id: "g-art", label: "Artifacts", count: 148660, kind: "artifact" as const },
  { id: "g-cond", label: "Business Conditions", count: 9277, kind: "condition" as const },
  { id: "g-per", label: "Team Personas", count: 72, kind: "persona" as const },
  { id: "g-dep", label: "Cross-Team Dependencies", count: 214, kind: "dependency" as const },
  { id: "g-mem", label: "Memory Stores", count: 5, kind: "memory" as const },
];
