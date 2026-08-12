/**
 * Enterprise Cognitive Health — deterministic domain model and seeded demonstration data.
 *
 * Measures the health of the enterprise shared decision environment: whether the
 * organization can preserve context, see dependencies, coordinate across teams,
 * decide with evidence, and learn from outcomes.
 *
 * This is NOT infrastructure uptime, NOT a generic KPI scorecard, and NOT an
 * employee performance system. Health belongs to the operating context that a
 * Team Persona represents, never to a person.
 *
 * Every value below is synthetic. Service boundaries are shaped so each seeded
 * collection can be replaced by an enterprise API without changing consumers.
 */

import type { Tone } from "../persona-studio/primitives";

/* ============================================================== views */

export type ChView = "executive" | "portfolio" | "signal" | "diagnostic" | "learning";

export const chViews: { id: ChView; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "portfolio", label: "Portfolio" },
  { id: "signal", label: "Signals" },
  { id: "diagnostic", label: "Diagnostic" },
  { id: "learning", label: "Learning" },
];

/* ============================================================== bands */

export type HealthBand =
  | "Strong" | "Healthy" | "Healthy with Attention Areas" | "Needs Attention"
  | "At Risk" | "Critical" | "Unknown";

/** Deterministic band derivation. Never rely on color alone — the band label ships with every score. */
export const bandFor = (score: number): HealthBand =>
  score >= 95 ? "Strong"
    : score >= 90 ? "Healthy"
      : score >= 86 ? "Healthy with Attention Areas"
        : score >= 78 ? "Needs Attention"
          : score >= 70 ? "At Risk"
            : "Critical";

export const chTone = (s: string): Tone => {
  const v = s.toLowerCase();
  if (["strong", "healthy", "improving", "operational", "effective", "validated", "running", "resolved", "current", "strong contributor", "positive contributor", "high", "adequate", "complete", "owned"].some((k) => v === k || v.startsWith(k))) return "green";
  if (["critical", "at risk", "failed", "breach", "missing", "unowned", "critical contributor", "deteriorating"].some((k) => v.includes(k))) return "red";
  if (["needs attention", "attention", "warning", "review", "pending", "aging", "partial", "medium high", "unresolved", "degraded", "recalculating", "insufficient", "attention contributor", "stale"].some((k) => v.includes(k))) return "amber";
  if (["neutral", "unknown", "not applicable"].some((k) => v.includes(k))) return "slate";
  return "blue";
};

/** Trend glyph text — never color alone. */
export const trendLabel = (n: number) => (n > 0 ? `Improving +${n}` : n < 0 ? `Deteriorating ${n}` : "Flat");

/* ============================================================== models */

export interface CognitiveHealthDimension {
  id: string;
  name: string;
  short: string;
  description: string;
  whyItMatters: string;
  score: number;
  target: number;
  previousScore: number;
  trend: number;
  confidence: number;
  status: HealthBand;
  weight: number;
  signalIds: string[];
  positiveContributorIds: string[];
  negativeContributorIds: string[];
  affectedScopeIds: string[];
  primaryPositiveDriver: string;
  primaryNegativeDriver: string;
  recommendedFocus: string;
}

export interface CognitiveHealthSignal {
  id: string;
  name: string;
  dimensionId: string;
  scopeType: "Enterprise" | "Business Unit" | "Team Persona" | "Knowledge Domain";
  scopeId: string;
  definition: string;
  calculation: string;
  currentValue: string;
  currentNumeric: number;
  targetValue: string;
  previousValue: string;
  unit: string;
  trend: number;
  confidence: number;
  severity: "Critical" | "High" | "Medium High" | "Medium" | "Low" | "Informational";
  sourceModule: string;
  sourceRecordIds: string[];
  recordCount: number;
  freshness: string;
  status: string;
  affectedDecisionIds: string[];
  series: number[];
}

export interface CognitiveHealthContributor {
  id: string;
  dimensionId: string;
  signalId: string;
  sourceModule: string;
  sourceRecordIds: string[];
  contributionDirection: "Positive" | "Negative";
  contributionMagnitude: number;
  confidence: number;
  affectedDecisionIds: string[];
  affectedPersonaIds: string[];
  description: string;
}

export interface CognitiveHealthDiagnosticPath {
  id: string;
  healthDimensionId: string;
  scopeType: string;
  scopeId: string;
  title: string;
  description: string;
  sourceModuleIds: string[];
  sourceRecordIds: string[];
  signalIds: string[];
  intermediateEffects: string[];
  enterpriseConsequences: string[];
  confidence: number;
  status: string;
  affectedDecisionIds: string[];
  affectedTeams: string[];
}

export interface BusinessUnitCognitiveHealth {
  id: string;
  businessUnit: string;
  overallScore: number;
  dimensionScores: Record<string, number>;
  trend: number;
  primaryConcern: string;
  criticalSignalIds: string[];
  status: HealthBand;
}

export interface TeamPersonaCognitiveHealth {
  id: string;
  personaId: string;
  persona: string;
  personaVersion: string;
  overallScore: number;
  dimensionScores: Record<string, number>;
  personaQuality: number;
  dependencyHealth: number;
  openConflictCount: number;
  coordinationActionCount: number;
  evidenceGapCount: number;
  activeDecisionIds: string[];
  learningReuse: number;
  responseLatency: string;
  freshness: string;
  attentionItems: string[];
  strengths: string[];
  recentChanges: string[];
  status: HealthBand;
}

export interface KnowledgeDomainCognitiveHealth {
  id: string;
  knowledgeDomain: string;
  overallScore: number;
  dimensionScores: Record<string, number>;
  evidenceQuality: number;
  dependencyVisibility: number;
  decisionConfidence: number;
  learningReuse: number;
  trend: number;
  attentionSignalIds: string[];
  status: HealthBand;
}

export interface CognitiveHealthLatencyMetric {
  id: string;
  name: string;
  stageFrom: string;
  stageTo: string;
  currentDuration: string;
  targetDuration: string;
  previousDuration: string;
  unit: string;
  trend: number;
  affectedScopeIds: string[];
  bottleneckReasonIds: string[];
  status: string;
}

export interface CognitiveHealthChange {
  id: string;
  dimensionId: string;
  dimensionName: string;
  scopeType: string;
  scopeId: string;
  previousValue: number;
  currentValue: number;
  change: number;
  contributingSignalIds: string[];
  associatedEventIds: string[];
  confidence: number;
  timestamp: string;
}

export interface CognitiveHealthStage {
  id: string;
  name: string;
  sequence: number;
  status: string;
  detail: string;
  processedCount: string;
  pendingCount: string;
  failedCount: number;
  warningCount: number;
  successRate: string;
  averageDuration: string;
  p95Duration: string;
  owner: string;
  confidence: number;
}

export interface CognitiveHealthActivity {
  id: string;
  timestamp: string;
  scopeType: string;
  scopeId: string;
  dimensionId: string;
  action: string;
  description: string;
  result: string;
  owner: string;
  auditId: string;
}

export interface EnterpriseCognitiveHealthSnapshot {
  id: string;
  scopeType: string;
  scopeId: string;
  timestamp: string;
  echiScore: number;
  targetScore: number;
  previousScore: number;
  confidence: number;
  status: HealthBand;
  dimensionScores: Record<string, number>;
  criticalSignalCount: number;
  attentionDomainCount: number;
  affectedDecisionIds: string[];
  createdAt: string;
}

/* ============================================================== dimensions */

export const dimensions: CognitiveHealthDimension[] = [
  {
    id: "DIM IQ", name: "Information Quality", short: "Info Quality", weight: 0.16,
    description: "Whether enterprise information is authoritative, evidence linked, current, complete, and reusable.",
    whyItMatters: "Decisions inherit the quality of the information behind them. Unauthoritative or stale context silently degrades every downstream evaluation.",
    score: 92, target: 95, previousScore: 88, trend: 4, confidence: 95, status: bandFor(92),
    signalIds: ["CHS 1001", "CHS 1008", "CHS 1009", "CHS 1010"],
    positiveContributorIds: ["CTR 01"], negativeContributorIds: ["CTR 02"],
    affectedScopeIds: ["Commerce Engineering", "Customer Support Operations"],
    primaryPositiveDriver: "Evidence coverage reached 98% across approved conditions",
    primaryNegativeDriver: "148 unresolved authority conflicts",
    recommendedFocus: "Resolve authority conflicts in Payments and Customer Support source sets.",
  },
  {
    id: "DIM CP", name: "Context Preservation", short: "Context", weight: 0.14,
    description: "Whether important enterprise context remains traceable across evidence, conditions, Personas, decisions, outcomes, and historical versions.",
    whyItMatters: "Without preserved context the enterprise cannot reconstruct why a decision was made, and historical judgement cannot be evaluated fairly.",
    score: 96, target: 97, previousScore: 95, trend: 1, confidence: 97, status: bandFor(96),
    signalIds: ["CHS 1002", "CHS 1011", "CHS 1012"],
    positiveContributorIds: ["CTR 03"], negativeContributorIds: ["CTR 04"],
    affectedScopeIds: ["Enterprise"],
    primaryPositiveDriver: "Zero historical context rewrite violations",
    primaryNegativeDriver: "2% incomplete outcome lineage",
    recommendedFocus: "Close outcome to decision linkage gaps in the Regional Token Vault program.",
  },
  {
    id: "DIM DV", name: "Dependency Visibility", short: "Dependency", weight: 0.15,
    description: "Whether teams and decision makers can see the systems, services, teams, policies, and customer journeys affected by change.",
    whyItMatters: "Unseen dependencies become discovered consequences. Visibility before decision is the difference between coordination and escalation.",
    score: 84, target: 92, previousScore: 82, trend: 2, confidence: 91, status: bandFor(84),
    signalIds: ["CHS 1003", "CHS 1013", "CHS 1014"],
    positiveContributorIds: ["CTR 05"], negativeContributorIds: ["CTR 06"],
    affectedScopeIds: ["Identity & Access", "Commerce Engineering"],
    primaryPositiveDriver: "Shared dependency detection increased 12%",
    primaryNegativeDriver: "12 critical dependency paths require validation",
    recommendedFocus: "Revalidate Identity Services and Regional Token Vault relationships.",
  },
  {
    id: "DIM CTA", name: "Cross Team Awareness", short: "Cross Team", weight: 0.15,
    description: "Whether teams understand how their work affects other Team Personas before consequences become reactive.",
    whyItMatters: "Late awareness converts a design conversation into an incident review. Awareness is the earliest and cheapest coordination control.",
    score: 81, target: 90, previousScore: 76, trend: 5, confidence: 93, status: bandFor(81),
    signalIds: ["CHS 1004", "CHS 1015", "CHS 1016", "CHS 1017"],
    positiveContributorIds: ["CTR 07", "CTR 08"], negativeContributorIds: ["CTR 09", "CTR 10"],
    affectedScopeIds: ["Commerce Engineering", "Customer Support Operations"],
    primaryPositiveDriver: "Persona coverage improved from 84% to 92%",
    primaryNegativeDriver: "4 unowned coordination actions",
    recommendedFocus: "Assign ownership for open coordination actions in Commerce.",
  },
  {
    id: "DIM DC", name: "Decision Confidence", short: "Decision", weight: 0.16,
    description: "Whether enterprise decisions are made with sufficient context, evidence, alternatives, risk analysis, and explicit tradeoffs.",
    whyItMatters: "Confidence is not certainty. It records whether the decision environment was complete enough to justify the choice that was made.",
    score: 89, target: 95, previousScore: 87, trend: 2, confidence: 94, status: bandFor(89),
    signalIds: ["CHS 1005", "CHS 1018", "CHS 1019"],
    positiveContributorIds: ["CTR 11"], negativeContributorIds: ["CTR 12"],
    affectedScopeIds: ["Platform Engineering", "Commerce Engineering"],
    primaryPositiveDriver: "Tradeoff transparency at 97%",
    primaryNegativeDriver: "4 active decisions with material evidence gaps",
    recommendedFocus: "Close Regional Token Vault decision evidence gaps.",
  },
  {
    id: "DIM RL", name: "Response Latency", short: "Latency", weight: 0.12,
    description: "How quickly the enterprise can establish shared understanding and coordinate around cross team impact. This is organizational understanding time, not software response time.",
    whyItMatters: "Slow shared understanding delays every downstream decision and pushes coordination onto individuals rather than the operating model.",
    score: 78, target: 90, previousScore: 72, trend: 6, confidence: 90, status: bandFor(78),
    signalIds: ["CHS 1006", "CHS 1020", "CHS 1021"],
    positiveContributorIds: ["CTR 13"], negativeContributorIds: ["CTR 14"],
    affectedScopeIds: ["Enterprise"],
    primaryPositiveDriver: "Intake to readiness reduced by 2.1 hours",
    primaryNegativeDriver: "Cross team understanding still 2.1 business days",
    recommendedFocus: "Attack evidence clarification and dependency validation bottlenecks.",
  },
  {
    id: "DIM LM", name: "Learning Maturity", short: "Learning", weight: 0.12,
    description: "Whether decisions are connected to outcomes and whether validated learning improves future enterprise context.",
    whyItMatters: "An enterprise that does not reuse validated learning re-pays the same coordination cost on every similar decision.",
    score: 86, target: 92, previousScore: 82, trend: 4, confidence: 92, status: bandFor(86),
    signalIds: ["CHS 1007", "CHS 1022", "CHS 1023"],
    positiveContributorIds: ["CTR 15"], negativeContributorIds: ["CTR 16"],
    affectedScopeIds: ["Enterprise", "Commerce Engineering"],
    primaryPositiveDriver: "Validated learning reuse at 82%",
    primaryNegativeDriver: "18 validated learnings pending publication",
    recommendedFocus: "Clear the learning publication backlog.",
  },
];

export const dimensionById = (id: string) => dimensions.find((d) => d.id === id) ?? dimensions[3];
export const dimensionByName = (name: string) => dimensions.find((d) => d.name === name);

/* ================================================================= ECHI */

export const echiSnapshot: EnterpriseCognitiveHealthSnapshot = {
  id: "ECHS 4410", scopeType: "Enterprise", scopeId: "Enterprise",
  timestamp: "2026-08-06 21:40 UTC",
  echiScore: 87, targetScore: 92, previousScore: 84, confidence: 94,
  status: "Healthy with Attention Areas",
  dimensionScores: Object.fromEntries(dimensions.map((d) => [d.id, d.score])),
  criticalSignalCount: 12, attentionDomainCount: 8,
  affectedDecisionIds: ["DEC 5001", "DEC 5003", "DEC 5006", "DEC 5011"],
  createdAt: "2026-08-06 21:40 UTC",
};

export const echiHighlights = {
  largestPositiveContributor: "Context Preservation 96",
  largestNegativeContributor: "Response Latency 78",
  mostImproved: "Response Latency +6",
  mostDeteriorated: "Dependency Freshness in Identity domain -2",
  primaryImprovement: "Information Quality +4",
  primaryConcern: "Response Latency 78",
  largestStructuralRisk: "Cross Team Awareness 81",
  mostStable: "Context Preservation 96",
};

/** Weighted contribution of each dimension to the ECHI. Deterministic, not statistical. */
export const dimensionContribution = (d: CognitiveHealthDimension) => Number((d.score * d.weight).toFixed(1));

/* ================================================================= KPIs */

export interface ChKpi {
  id: string; label: string; value: string; supporting: string[];
  trend: string; trendDirection: "up" | "down" | "flat"; status: string; tooltip: string;
}

export const chKpis: ChKpi[] = [
  {
    id: "critical-signals", label: "Critical Health Signals", value: "12",
    supporting: ["4 Cross Team", "3 Dependency", "3 Response Latency", "2 Learning"],
    trend: "-3 versus prior period", trendDirection: "down", status: "Attention",
    tooltip: "Health signals at Critical or High severity that currently affect an active decision.",
  },
  {
    id: "attention-domains", label: "Domains Needing Attention", value: "8",
    supporting: ["3 Commerce", "2 Identity", "1 Customer Support", "2 Platform"],
    trend: "-1 versus prior period", trendDirection: "down", status: "Needs Attention",
    tooltip: "Knowledge domains scoring below the Healthy band on at least one dimension.",
  },
  {
    id: "healthy-personas", label: "Healthy Team Personas", value: "61 of 72",
    supporting: ["7 Review Required", "4 Draft excluded from the health denominator"],
    trend: "+5 versus prior period", trendDirection: "up", status: "Healthy",
    tooltip: "Team Personas whose operating context scores in the Healthy band or better. Personas represent context, not people.",
  },
  {
    id: "decision-confidence", label: "Decisions with High Context Confidence", value: "91%",
    supporting: ["Target 95%"], trend: "+2 versus prior period", trendDirection: "up", status: "Healthy",
    tooltip: "Share of active decisions whose context package meets the enterprise evidence and coverage bar.",
  },
  {
    id: "understanding-time", label: "Cross Team Understanding Time", value: "2.1 Business Days",
    supporting: ["Target under 1 business day", "Previous 2.8 days"],
    trend: "-0.7 days", trendDirection: "down", status: "Attention",
    tooltip: "Elapsed organizational time from intake to shared cross team understanding. Not software response time.",
  },
  {
    id: "learning-reuse", label: "Learning Reuse", value: "82%",
    supporting: ["Validated learning reused in relevant downstream context"],
    trend: "+6 versus prior period", trendDirection: "up", status: "Healthy",
    tooltip: "Share of validated learning records retrieved into a later, relevant decision context.",
  },
];

export const kpiFocusPanel = (id: string) => ({
  "critical-signals": "panel-critical",
  "attention-domains": "panel-domains",
  "healthy-personas": "panel-personas",
  "decision-confidence": "panel-decision-confidence",
  "understanding-time": "panel-latency",
  "learning-reuse": "panel-learning-maturity",
}[id] ?? "panel-dimensions");

/* ============================================================ lifecycle */

export const chStages: CognitiveHealthStage[] = [
  { id: "CHS S1", name: "Collect ECF Signals", sequence: 1, status: "Running", detail: "24.8M health source references", processedCount: "24,812,406", pendingCount: "12,204", failedCount: 0, warningCount: 2, successRate: "99.6%", averageDuration: "1.4s", p95Duration: "3.1s", owner: "Health Telemetry", confidence: 97 },
  { id: "CHS S2", name: "Validate Signal Quality", sequence: 2, status: "Running", detail: "98% valid", processedCount: "24,318,092", pendingCount: "9,140", failedCount: 3, warningCount: 6, successRate: "98.0%", averageDuration: "0.9s", p95Duration: "2.4s", owner: "Health Telemetry", confidence: 96 },
  { id: "CHS S3", name: "Normalize Health Measures", sequence: 3, status: "Running", detail: "96% complete", processedCount: "23,346,208", pendingCount: "24,880", failedCount: 1, warningCount: 4, successRate: "96.4%", averageDuration: "1.1s", p95Duration: "2.9s", owner: "Health Modeling", confidence: 95 },
  { id: "CHS S4", name: "Calculate Dimension Scores", sequence: 4, status: "Running", detail: "7 dimensions calculated", processedCount: "7", pendingCount: "0", failedCount: 0, warningCount: 0, successRate: "100%", averageDuration: "2.2s", p95Duration: "4.0s", owner: "Health Modeling", confidence: 94 },
  { id: "CHS S5", name: "Calculate ECHI", sequence: 5, status: "Running", detail: "87 current", processedCount: "1", pendingCount: "0", failedCount: 0, warningCount: 0, successRate: "100%", averageDuration: "0.4s", p95Duration: "0.8s", owner: "Health Modeling", confidence: 94 },
  { id: "CHS S6", name: "Detect Material Changes", sequence: 6, status: "Warning", detail: "12 critical signals", processedCount: "486", pendingCount: "18", failedCount: 0, warningCount: 12, successRate: "94.1%", averageDuration: "1.8s", p95Duration: "4.6s", owner: "Health Analysis", confidence: 92 },
  { id: "CHS S7", name: "Identify Contributing Causes", sequence: 7, status: "Running", detail: "38 contributing causes", processedCount: "38", pendingCount: "6", failedCount: 0, warningCount: 3, successRate: "95.8%", averageDuration: "3.4s", p95Duration: "7.2s", owner: "Health Analysis", confidence: 89 },
  { id: "CHS S8", name: "Map Affected Domains", sequence: 8, status: "Running", detail: "8 attention domains", processedCount: "42", pendingCount: "2", failedCount: 0, warningCount: 1, successRate: "97.2%", averageDuration: "1.2s", p95Duration: "2.6s", owner: "Health Analysis", confidence: 93 },
  { id: "CHS S9", name: "Evaluate Decision Consequences", sequence: 9, status: "Warning", detail: "4 active decisions affected by degraded signals", processedCount: "128", pendingCount: "9", failedCount: 0, warningCount: 4, successRate: "93.4%", averageDuration: "2.6s", p95Duration: "6.1s", owner: "Decision Governance", confidence: 91 },
  { id: "CHS S10", name: "Prepare Health Context", sequence: 10, status: "Running", detail: "Current", processedCount: "1", pendingCount: "0", failedCount: 0, warningCount: 0, successRate: "100%", averageDuration: "0.6s", p95Duration: "1.2s", owner: "Health Modeling", confidence: 94 },
];

export const stageById = (id: string) => chStages.find((s) => s.id === id) ?? chStages[6];

export const lifecycleCallouts = [
  "Response Latency remains the lowest scoring dimension at 78 against a target of 90",
  "12 critical health signals currently affect 4 active enterprise decisions",
  "Identity dependency evidence freshness declined 2 points this period",
  "18 validated learnings remain unpublished and are not yet reusable in future intake",
];

export const chStageTabs = [
  "Overview", "Signals", "Causes", "Domains", "Teams", "Decisions", "Learning", "Outputs",
] as const;
export type ChStageTab = typeof chStageTabs[number];

export const stageCauseRows = [
  { id: "CAU 01", cause: "Identity dependency evidence aging beyond 90 days", dimension: "Dependency Visibility", scope: "Identity & Access", contribution: "-4.2", evidence: "EVH 2201, EVH 2204", confidence: 91, status: "Open" },
  { id: "CAU 02", cause: "Coordination actions without confirmed owner", dimension: "Cross Team Awareness", scope: "Commerce Engineering", contribution: "-3.6", evidence: "EVH 2210", confidence: 94, status: "Open" },
  { id: "CAU 03", cause: "Learning publication backlog blocks downstream retrieval", dimension: "Learning Maturity", scope: "Enterprise", contribution: "-2.8", evidence: "EVH 2218", confidence: 90, status: "Open" },
  { id: "CAU 04", cause: "Repeated clarification cycles on high dependency intake", dimension: "Response Latency", scope: "Enterprise", contribution: "-3.1", evidence: "EVH 2222", confidence: 88, status: "Open" },
  { id: "CAU 05", cause: "Customer Support Persona evidence coverage decline", dimension: "Information Quality", scope: "Customer Support Operations", contribution: "-1.9", evidence: "EVH 2226", confidence: 92, status: "Open" },
  { id: "CAU 06", cause: "Persona coverage expansion across Commerce", dimension: "Cross Team Awareness", scope: "Commerce Engineering", contribution: "+4.4", evidence: "EVH 2230", confidence: 95, status: "Sustained" },
  { id: "CAU 07", cause: "Decision context snapshot coverage at 98%", dimension: "Context Preservation", scope: "Enterprise", contribution: "+2.1", evidence: "EVH 2234", confidence: 97, status: "Sustained" },
  { id: "CAU 08", cause: "Regional Token Vault decision evidence gaps", dimension: "Decision Confidence", scope: "Platform Engineering", contribution: "-2.4", evidence: "EVH 2238", confidence: 93, status: "Open" },
];

export const stageDecisionRows = [
  { id: "DEC 5001", decision: "Checkout Retry Policy Update", signal: "Cross Team Acknowledgement Coverage", state: "Executed, under learning review", risk: "Medium" },
  { id: "DEC 5003", decision: "Regional Token Vault Migration", signal: "Decision Evidence Coverage", state: "Review Required", risk: "High" },
  { id: "DEC 5006", decision: "Payment Provider Failover Policy", signal: "Critical Dependency Validation", state: "Analyzing", risk: "High" },
  { id: "DEC 5011", decision: "Identity Token Rotation Window", signal: "Average Cross Team Understanding Time", state: "Awaiting Coordination", risk: "Medium High" },
];

export const stageLearningRows = [
  { id: "LRN 1182", record: "Progressive rollout reduces operational blast radius", reuse: "Reused in 9 decisions", effect: "+2.1 Learning Maturity" },
  { id: "LRN 1204", record: "Idempotency validation under production concurrency", reuse: "Pending publication", effect: "Blocked, no reuse" },
  { id: "LRN 1211", record: "Rollback thresholds accelerate containment", reuse: "Reused in 14 decisions", effect: "+1.8 Learning Maturity" },
  { id: "LRN 1219", record: "Dependency amplification underestimated above 20% traffic", reuse: "Pending effectiveness review", effect: "Neutral" },
];

export const stageOutputs = [
  { id: "OUT 1", output: "Health Dimension Records", count: "7", status: "Current" },
  { id: "OUT 2", output: "ECHI Calculation", count: "1", status: "Current" },
  { id: "OUT 3", output: "Attention Records", count: "38", status: "Open" },
  { id: "OUT 4", output: "Diagnostic Paths", count: "3", status: "Under Review" },
];

/* ================================================================ signals */

const s = (
  id: string, name: string, dimensionId: string, scopeId: string, definition: string, calculation: string,
  current: string, currentNumeric: number, target: string, previous: string, unit: string, trend: number,
  confidence: number, severity: CognitiveHealthSignal["severity"], sourceModule: string,
  recordCount: number, freshness: string, status: string, decisions: string[], series: number[],
): CognitiveHealthSignal => ({
  id, name, dimensionId,
  scopeType: scopeId === "Enterprise" ? "Enterprise" : "Business Unit",
  scopeId, definition, calculation, currentValue: current, currentNumeric, targetValue: target,
  previousValue: previous, unit, trend, confidence, severity, sourceModule,
  sourceRecordIds: [`SRC ${id.slice(-4)}A`, `SRC ${id.slice(-4)}B`],
  recordCount, freshness, status, affectedDecisionIds: decisions, series,
});

export const signals: CognitiveHealthSignal[] = [
  s("CHS 1001", "Authoritative Condition Coverage", "DIM IQ", "Enterprise", "Share of approved Business Conditions backed by an authoritative, owned source.", "Approved conditions with authoritative source divided by all approved conditions.", "93%", 93, "97%", "90%", "percent", 3, 95, "Medium", "Business Condition Extraction", 12480, "6 hours", "Healthy", ["DEC 5003"], [88, 89, 90, 91, 93]),
  s("CHS 1002", "Decision Context Snapshot Coverage", "DIM CP", "Enterprise", "Share of recorded decisions carrying a complete, immutable context snapshot.", "Decisions with a full snapshot divided by all recorded decisions.", "98%", 98, "99%", "97%", "percent", 1, 98, "Low", "Decision Intelligence", 3284, "2 hours", "Strong", [], [95, 96, 97, 97, 98]),
  s("CHS 1003", "Critical Dependency Validation", "DIM DV", "Commerce Engineering", "Share of critical dependency relationships validated against current evidence.", "Validated critical dependencies divided by known critical dependencies.", "84%", 84, "95%", "82%", "percent", 2, 91, "Critical", "Enterprise Cognitive Memory", 1842, "4 days", "Needs Attention", ["DEC 5006", "DEC 5011"], [76, 78, 80, 82, 84]),
  s("CHS 1004", "Cross Team Acknowledgement Coverage", "DIM CTA", "Commerce Engineering", "Share of cross team impacts formally acknowledged by the affected Team Persona owner.", "Acknowledged impacts divided by all identified cross team impacts.", "84%", 84, "95%", "78%", "percent", 6, 93, "High", "Cross Team Impact Analysis", 486, "8 hours", "Needs Attention", ["DEC 5001", "DEC 5011"], [70, 74, 78, 81, 84]),
  s("CHS 1005", "Decision Evidence Coverage", "DIM DC", "Enterprise", "Share of decision criteria supported by sufficient, current evidence at decision time.", "Criteria with sufficient evidence divided by all decision criteria.", "91%", 91, "95%", "89%", "percent", 2, 94, "High", "Decision Intelligence", 3284, "3 hours", "Healthy", ["DEC 5003"], [85, 87, 88, 89, 91]),
  s("CHS 1006", "Average Cross Team Understanding Time", "DIM RL", "Enterprise", "Elapsed organizational time from intake to shared cross team understanding. Not software response time.", "Median elapsed business days from intake acceptance to cross team acknowledgement.", "2.1 days", 21, "Under 1 day", "2.8 days", "business days", 6, 90, "Critical", "Cognitive Intake", 1204, "12 hours", "Attention", ["DEC 5011"], [34, 31, 28, 24, 21]),
  s("CHS 1007", "Validated Learning Reuse", "DIM LM", "Enterprise", "Share of validated learning records retrieved into a later, relevant decision context.", "Learning records reused downstream divided by published validated learning records.", "82%", 82, "92%", "76%", "percent", 6, 92, "Medium", "Organizational Learning", 1426, "1 day", "Healthy", [], [68, 71, 74, 76, 82]),
  s("CHS 1008", "Evidence Authority Confidence", "DIM IQ", "Enterprise", "Confidence that the cited source is the authoritative record for the claim it supports.", "Weighted authority score across all cited evidence records.", "93%", 93, "96%", "91%", "percent", 2, 94, "Medium", "Artifact Normalization", 98420, "9 hours", "Healthy", [], [88, 89, 91, 91, 93]),
  s("CHS 1009", "Information Freshness", "DIM IQ", "Enterprise", "Share of active enterprise records within their defined freshness window.", "Records inside freshness window divided by all active records.", "89%", 89, "94%", "88%", "percent", 1, 92, "Medium High", "Artifact Ingestion", 482000, "3 hours", "Needs Attention", [], [85, 86, 87, 88, 89]),
  s("CHS 1010", "Ownership Completeness", "DIM IQ", "Enterprise", "Share of enterprise records with a confirmed accountable owner.", "Records with confirmed owner divided by all records requiring one.", "94%", 94, "98%", "92%", "percent", 2, 95, "Medium", "Enterprise Source Discovery", 41000, "1 day", "Healthy", [], [89, 90, 91, 92, 94]),
  s("CHS 1011", "Evidence Provenance Completeness", "DIM CP", "Enterprise", "Share of evidence records with a complete, unbroken provenance chain to origin.", "Evidence with complete provenance divided by all evidence records.", "99%", 99, "99%", "99%", "percent", 0, 98, "Low", "Enterprise Cognitive Memory", 98420, "2 hours", "Strong", [], [97, 98, 98, 99, 99]),
  s("CHS 1012", "Outcome Decision Linkage", "DIM CP", "Enterprise", "Share of observed outcomes traceable to the decision that predicted them.", "Linked outcomes divided by all recorded outcomes.", "91%", 91, "96%", "90%", "percent", 1, 93, "Medium", "Organizational Learning", 1426, "6 hours", "Healthy", ["DEC 5003"], [86, 88, 89, 90, 91]),
  s("CHS 1013", "Critical Dependency Ownership", "DIM DV", "Enterprise", "Share of critical dependency relationships with a confirmed owning team context.", "Owned critical dependencies divided by all critical dependencies.", "91%", 91, "97%", "90%", "percent", 1, 92, "Medium", "Enterprise Cognitive Memory", 1842, "2 days", "Healthy", [], [86, 88, 89, 90, 91]),
  s("CHS 1014", "Shared Dependency Detection Before Decision", "DIM DV", "Enterprise", "Share of shared dependencies detected before the decision rather than during execution.", "Pre-decision detections divided by all shared dependency detections.", "86%", 86, "94%", "84%", "percent", 2, 90, "High", "Cross Team Impact Analysis", 742, "1 day", "Needs Attention", ["DEC 5006"], [78, 80, 82, 84, 86]),
  s("CHS 1015", "Persona Impact Coverage", "DIM CTA", "Enterprise", "Share of decisions evaluated against every potentially affected Team Persona.", "Decisions with full persona evaluation divided by all evaluated decisions.", "92%", 92, "96%", "84%", "percent", 8, 95, "Medium", "Persona Impact Analysis", 3284, "5 hours", "Healthy", [], [80, 82, 84, 88, 92]),
  s("CHS 1016", "Coordination Ownership", "DIM CTA", "Commerce Engineering", "Share of coordination actions with a confirmed accountable owner.", "Owned coordination actions divided by all open coordination actions.", "82%", 82, "95%", "80%", "percent", 2, 94, "High", "Cross Team Impact Analysis", 486, "4 hours", "Needs Attention", ["DEC 5001"], [74, 76, 78, 80, 82]),
  s("CHS 1017", "Conflict Resolution Coverage", "DIM CTA", "Commerce Engineering", "Share of detected cross team conflicts carried to an explicit resolution.", "Resolved conflicts divided by all detected material conflicts.", "79%", 79, "92%", "76%", "percent", 3, 91, "High", "Cross Team Impact Analysis", 214, "7 hours", "Needs Attention", ["DEC 5001"], [70, 72, 74, 76, 79]),
  s("CHS 1018", "Alternative Coverage", "DIM DC", "Enterprise", "Share of decisions evaluating at least three materially distinct alternatives.", "Decisions meeting the alternative bar divided by all decisions.", "95%", 95, "97%", "94%", "percent", 1, 96, "Low", "Decision Intelligence", 3284, "3 hours", "Strong", [], [92, 93, 93, 94, 95]),
  s("CHS 1019", "Expected Outcome Coverage", "DIM DC", "Enterprise", "Share of recorded decisions registering measurable expected outcomes.", "Decisions with expected outcomes divided by all recorded decisions.", "92%", 92, "96%", "90%", "percent", 2, 94, "Medium", "Decision Intelligence", 3284, "4 hours", "Healthy", [], [86, 88, 89, 90, 92]),
  s("CHS 1020", "Time to Resolve Critical Evidence Gaps", "DIM RL", "Enterprise", "Elapsed organizational time to close an evidence gap blocking a decision.", "Median elapsed hours from gap identification to gap closure.", "18.4 hours", 184, "Under 8 hours", "24.2 hours", "hours", 5, 89, "High", "Cognitive Intake", 486, "10 hours", "Needs Attention", ["DEC 5003"], [30, 28, 26, 24, 18]),
  s("CHS 1021", "Time to Cross Team Acknowledgement", "DIM RL", "Enterprise", "Elapsed organizational time from impact notification to owner acknowledgement.", "Median elapsed business days from notification to acknowledgement.", "1.3 days", 13, "Under 0.5 days", "1.7 days", "business days", 4, 90, "High", "Cross Team Impact Analysis", 486, "8 hours", "Needs Attention", ["DEC 5011"], [22, 20, 18, 17, 13]),
  s("CHS 1022", "Outcome Reconciliation Coverage", "DIM LM", "Enterprise", "Share of executed decisions whose outcomes have been fully reconciled against expectation.", "Fully reconciled decisions divided by executed decisions.", "78%", 78, "90%", "74%", "percent", 4, 91, "Medium High", "Organizational Learning", 3284, "1 day", "Needs Attention", [], [64, 68, 71, 74, 78]),
  s("CHS 1023", "Learning Publication Coverage", "DIM LM", "Enterprise", "Share of validated learning records published into Enterprise Cognitive Memory.", "Published validated learning divided by all validated learning.", "88%", 88, "97%", "86%", "percent", 2, 92, "Medium High", "Organizational Learning", 186, "1 day", "Needs Attention", [], [80, 82, 84, 86, 88]),
];

export const signalById = (id: string) => signals.find((x) => x.id === id);
export const signalsForDimension = (dimensionId: string) => signals.filter((x) => x.dimensionId === dimensionId);

/* =========================================================== contributors */

export const contributors: CognitiveHealthContributor[] = [
  { id: "CTR 01", dimensionId: "DIM IQ", signalId: "CHS 1001", sourceModule: "Business Condition Extraction", sourceRecordIds: ["COND 100425", "COND 100612"], contributionDirection: "Positive", contributionMagnitude: 4.1, confidence: 95, affectedDecisionIds: [], affectedPersonaIds: ["Payments Platform"], description: "Authoritative source resolution across payments condition set" },
  { id: "CTR 02", dimensionId: "DIM IQ", signalId: "CHS 1008", sourceModule: "Artifact Normalization", sourceRecordIds: ["ART 88120", "ART 88144"], contributionDirection: "Negative", contributionMagnitude: -2.6, confidence: 92, affectedDecisionIds: ["DEC 5003"], affectedPersonaIds: ["Customer Support Operations"], description: "148 unresolved authority conflicts across overlapping source systems" },
  { id: "CTR 03", dimensionId: "DIM CP", signalId: "CHS 1011", sourceModule: "Enterprise Cognitive Memory", sourceRecordIds: ["MEM 44012"], contributionDirection: "Positive", contributionMagnitude: 2.8, confidence: 98, affectedDecisionIds: [], affectedPersonaIds: [], description: "Zero historical context rewrite violations across all versioned records" },
  { id: "CTR 04", dimensionId: "DIM CP", signalId: "CHS 1012", sourceModule: "Organizational Learning", sourceRecordIds: ["OL 9003"], contributionDirection: "Negative", contributionMagnitude: -1.2, confidence: 93, affectedDecisionIds: ["DEC 5003"], affectedPersonaIds: ["Identity Engineering"], description: "2% of observed outcomes lack a complete decision linkage" },
  { id: "CTR 05", dimensionId: "DIM DV", signalId: "CHS 1014", sourceModule: "Cross Team Impact Analysis", sourceRecordIds: ["CTI 3301"], contributionDirection: "Positive", contributionMagnitude: 3.2, confidence: 90, affectedDecisionIds: [], affectedPersonaIds: ["Site Reliability Engineering"], description: "Shared dependency detection before decision increased 12%" },
  { id: "CTR 06", dimensionId: "DIM DV", signalId: "CHS 1003", sourceModule: "Enterprise Cognitive Memory", sourceRecordIds: ["DEP 7712", "DEP 7718"], contributionDirection: "Negative", contributionMagnitude: -5.4, confidence: 91, affectedDecisionIds: ["DEC 5006", "DEC 5011"], affectedPersonaIds: ["Identity Engineering"], description: "12 critical dependency paths require validation, primarily in Identity" },
  { id: "CTR 07", dimensionId: "DIM CTA", signalId: "CHS 1015", sourceModule: "Persona Impact Analysis", sourceRecordIds: ["PIA 2201"], contributionDirection: "Positive", contributionMagnitude: 4.4, confidence: 95, affectedDecisionIds: [], affectedPersonaIds: ["Checkout Engineering"], description: "Persona coverage improved from 84% to 92%" },
  { id: "CTR 08", dimensionId: "DIM CTA", signalId: "CHS 1004", sourceModule: "Cross Team Impact Analysis", sourceRecordIds: ["CTI 3312"], contributionDirection: "Positive", contributionMagnitude: 2.2, confidence: 93, affectedDecisionIds: ["DEC 5001"], affectedPersonaIds: ["Payments Platform"], description: "Cross Team Matrix usage increased 18%" },
  { id: "CTR 09", dimensionId: "DIM CTA", signalId: "CHS 1016", sourceModule: "Cross Team Impact Analysis", sourceRecordIds: ["ACT 5540", "ACT 5541", "ACT 5544", "ACT 5549"], contributionDirection: "Negative", contributionMagnitude: -3.6, confidence: 94, affectedDecisionIds: ["DEC 5001"], affectedPersonaIds: ["Checkout Engineering", "Identity Engineering"], description: "4 coordination actions lack confirmed owners" },
  { id: "CTR 10", dimensionId: "DIM CTA", signalId: "CHS 1017", sourceModule: "Cross Team Impact Analysis", sourceRecordIds: ["CNF 2210"], contributionDirection: "Negative", contributionMagnitude: -2.9, confidence: 91, affectedDecisionIds: ["DEC 5001", "DEC 5011"], affectedPersonaIds: ["Customer Support Operations"], description: "9 material conflicts remain unresolved" },
  { id: "CTR 11", dimensionId: "DIM DC", signalId: "CHS 1018", sourceModule: "Decision Intelligence", sourceRecordIds: ["DEC 5001"], contributionDirection: "Positive", contributionMagnitude: 3.0, confidence: 96, affectedDecisionIds: [], affectedPersonaIds: [], description: "Tradeoff transparency at 97% across recorded decisions" },
  { id: "CTR 12", dimensionId: "DIM DC", signalId: "CHS 1005", sourceModule: "Decision Intelligence", sourceRecordIds: ["DEC 5003", "DEC 5006"], contributionDirection: "Negative", contributionMagnitude: -3.4, confidence: 94, affectedDecisionIds: ["DEC 5003", "DEC 5006"], affectedPersonaIds: ["Identity Engineering"], description: "4 active decisions contain material evidence gaps" },
  { id: "CTR 13", dimensionId: "DIM RL", signalId: "CHS 1020", sourceModule: "Cognitive Intake", sourceRecordIds: ["INT 8801"], contributionDirection: "Positive", contributionMagnitude: 5.1, confidence: 89, affectedDecisionIds: [], affectedPersonaIds: [], description: "Intake to readiness reduced by 2.1 hours after context match improvements" },
  { id: "CTR 14", dimensionId: "DIM RL", signalId: "CHS 1006", sourceModule: "Cognitive Intake", sourceRecordIds: ["INT 8812"], contributionDirection: "Negative", contributionMagnitude: -6.2, confidence: 90, affectedDecisionIds: ["DEC 5011"], affectedPersonaIds: ["Identity Engineering"], description: "Cross team understanding still requires 2.1 business days" },
  { id: "CTR 15", dimensionId: "DIM LM", signalId: "CHS 1007", sourceModule: "Organizational Learning", sourceRecordIds: ["LRN 1182", "LRN 1211"], contributionDirection: "Positive", contributionMagnitude: 4.2, confidence: 92, affectedDecisionIds: [], affectedPersonaIds: ["Site Reliability Engineering"], description: "Validated learning reuse rose to 82%" },
  { id: "CTR 16", dimensionId: "DIM LM", signalId: "CHS 1023", sourceModule: "Organizational Learning", sourceRecordIds: ["LRN 1204"], contributionDirection: "Negative", contributionMagnitude: -3.1, confidence: 92, affectedDecisionIds: [], affectedPersonaIds: ["Payments Platform"], description: "18 validated learnings pending publication and unavailable to future intake" },
];

export const contributorsForDimension = (dimensionId: string) => contributors.filter((c) => c.dimensionId === dimensionId);

/* ======================================================= diagnostic paths */

export const diagnosticPaths: CognitiveHealthDiagnosticPath[] = [
  {
    id: "PATH 01", healthDimensionId: "DIM CTA", scopeType: "Business Unit", scopeId: "Commerce Engineering",
    title: "Aging Identity dependency evidence extends cross team coordination",
    description: "A contributing path, not a proven cause. Evidence supports the sequence but alternative explanations are not fully excluded.",
    sourceModuleIds: ["Team Persona Construction", "Persona Impact Analysis", "Cross Team Impact Analysis"],
    sourceRecordIds: ["DEP 7712", "PIA 2201", "CTI 3312"],
    signalIds: ["CHS 1003", "CHS 1004", "CHS 1021"],
    intermediateEffects: [
      "Identity Engineering Persona contains aging dependency evidence",
      "Dependency confidence decreases",
      "Persona Impact Analysis requires additional review",
      "Cross Team Impact Matrix contains unresolved Identity intersections",
      "Coordination time increases",
      "Cross Team Awareness score decreases",
    ],
    enterpriseConsequences: [
      "4 active decisions have extended review cycles",
      "2 decisions are using context with aging dependency records",
    ],
    confidence: 91, status: "Under Review",
    affectedDecisionIds: ["DEC 5006", "DEC 5011"],
    affectedTeams: ["Identity Engineering", "Checkout Engineering", "Payments Platform"],
  },
  {
    id: "PATH 02", healthDimensionId: "DIM RL", scopeType: "Business Unit", scopeId: "Commerce Engineering",
    title: "Unowned coordination actions hold decision context in review",
    description: "A contributing path, not a proven cause. Ownership gaps correlate strongly with unresolved acknowledgement state.",
    sourceModuleIds: ["Cross Team Impact Analysis", "Decision Intelligence"],
    sourceRecordIds: ["ACT 5540", "ACT 5541", "ACT 5544", "ACT 5549"],
    signalIds: ["CHS 1016", "CHS 1004", "CHS 1021"],
    intermediateEffects: [
      "Four coordination actions have no confirmed owner",
      "Acknowledgement remains pending",
      "Decision Context cannot close review state",
      "Response Latency increases",
    ],
    enterpriseConsequences: [
      "3 Cross Team analyses contain ownership gaps",
      "Escalation increasingly depends on named individuals rather than the operating model",
    ],
    confidence: 94, status: "Open",
    affectedDecisionIds: ["DEC 5001", "DEC 5011"],
    affectedTeams: ["Checkout Engineering", "Customer Support Operations"],
  },
  {
    id: "PATH 03", healthDimensionId: "DIM LM", scopeType: "Enterprise", scopeId: "Enterprise",
    title: "Unpublished validated learning causes repeated evidence requests",
    description: "A contributing path, not a proven cause. The retrieval gap is observable, downstream coordination overhead is inferred.",
    sourceModuleIds: ["Organizational Learning", "Enterprise Cognitive Memory", "Cognitive Intake"],
    sourceRecordIds: ["LRN 1204", "MEM 44012", "INT 8812"],
    signalIds: ["CHS 1023", "CHS 1007", "CHS 1020"],
    intermediateEffects: [
      "Validated learning about retry dependency testing is not yet published",
      "Future Intake does not automatically retrieve updated guidance",
      "Repeated evidence requests occur",
      "Coordination overhead remains elevated",
    ],
    enterpriseConsequences: [
      "7 Cognitive Intake packages required repeated clarification",
      "Duplicate coordination effort across Payments and SRE",
    ],
    confidence: 88, status: "Open",
    affectedDecisionIds: ["DEC 5003"],
    affectedTeams: ["Payments Platform", "Site Reliability Engineering"],
  },
];

export const pathsForDimension = (dimensionId: string) =>
  diagnosticPaths.filter((p) => p.healthDimensionId === dimensionId);

/* ======================================================== business units */

const bu = (
  businessUnit: string, overall: number, scores: number[], trend: number, primaryConcern: string, critical: string[],
): BusinessUnitCognitiveHealth => ({
  id: `BUH ${businessUnit.slice(0, 3).toUpperCase()}`,
  businessUnit, overallScore: overall,
  dimensionScores: Object.fromEntries(dimensions.map((d, i) => [d.id, scores[i]])),
  trend, primaryConcern, criticalSignalIds: critical, status: bandFor(overall),
});

export const businessUnits: BusinessUnitCognitiveHealth[] = [
  bu("Commerce Engineering", 88, [93, 97, 85, 84, 91, 79, 87], 4, "Coordination ownership gaps in checkout changes", ["CHS 1016", "CHS 1004"]),
  bu("Identity & Access", 83, [89, 95, 76, 79, 86, 74, 81], 1, "Aging dependency evidence across token services", ["CHS 1003"]),
  bu("Platform Engineering", 90, [94, 97, 88, 86, 90, 82, 89], 3, "Regional Token Vault decision evidence gaps", ["CHS 1005"]),
  bu("Customer Experience", 86, [91, 96, 84, 82, 88, 78, 85], 3, "Journey dependency coverage below target", []),
  bu("Customer Support Operations", 82, [86, 94, 80, 74, 84, 76, 80], -1, "Persona evidence coverage declined 3 points", ["CHS 1004"]),
  bu("Release & Governance", 91, [94, 98, 88, 89, 93, 84, 90], 2, "Approval latency at quarter boundaries", []),
  bu("Security Engineering", 93, [96, 98, 90, 88, 94, 87, 92], 2, "Control evidence refresh cadence", []),
  bu("Finance Operations", 89, [93, 96, 86, 85, 90, 81, 88], 1, "Financial outcome reconciliation lag", []),
];

/* ========================================================= team personas */

const tp = (
  persona: string, version: string, overall: number, scores: number[], quality: number, depHealth: number,
  conflicts: number, actions: number, gaps: number, decisions: string[], reuse: number, latency: string,
  freshness: string, attention: string[], strengths: string[], changes: string[],
): TeamPersonaCognitiveHealth => ({
  id: `TPH ${persona.slice(0, 4).toUpperCase()}`, personaId: `PER ${persona.slice(0, 3).toUpperCase()}`,
  persona, personaVersion: version, overallScore: overall,
  dimensionScores: Object.fromEntries(dimensions.map((d, i) => [d.id, scores[i]])),
  personaQuality: quality, dependencyHealth: depHealth, openConflictCount: conflicts,
  coordinationActionCount: actions, evidenceGapCount: gaps, activeDecisionIds: decisions,
  learningReuse: reuse, responseLatency: latency, freshness, attentionItems: attention,
  strengths, recentChanges: changes, status: bandFor(overall),
});

export const personaHealth: TeamPersonaCognitiveHealth[] = [
  tp("Payments Platform", "v3.4", 88, [94, 97, 86, 84, 91, 79, 87], 94, 86, 2, 5, 3, ["DEC 5001", "DEC 5006"], 88, "1.9 days", "4 hours",
    ["Retry dependency learning pending publication", "Two unresolved conflicts with Fraud Engineering"],
    ["Evidence coverage 94%", "Context preservation 97%"],
    ["Cross Team Awareness +6 this period", "Dependency Visibility +2"]),
  tp("Checkout Engineering", "v4.1", 90, [95, 97, 88, 87, 92, 81, 89], 95, 88, 1, 4, 2, ["DEC 5001"], 86, "1.8 days", "3 hours",
    ["Two coordination actions without confirmed owner"],
    ["Highest persona evidence coverage in Commerce", "Decision confidence 92%"],
    ["Overall +4 this period"]),
  tp("Fraud Engineering", "v2.8", 86, [92, 96, 84, 82, 89, 78, 85], 91, 84, 3, 3, 4, ["DEC 5001"], 82, "2.0 days", "9 hours",
    ["Fraud model dependency evidence approaching freshness limit"],
    ["Strong control evidence", "Zero context rewrite violations"],
    ["Learning Maturity +3"]),
  tp("Identity Engineering", "v2.7", 80, [88, 95, 74, 77, 85, 72, 80], 89, 74, 5, 7, 8, ["DEC 5006", "DEC 5011"], 76, "2.6 days", "4 days",
    ["12 dependency relationships need validation", "Aging dependency evidence"],
    ["Context preservation 95%"],
    ["Dependency Visibility -2", "Overall -1"]),
  tp("Site Reliability Engineering", "v5.2", 93, [96, 98, 91, 89, 94, 86, 93], 97, 91, 1, 2, 1, ["DEC 5006"], 92, "1.4 days", "2 hours",
    ["Observability dependency map refresh due"],
    ["Highest learning reuse", "Fastest cross team acknowledgement"],
    ["Response Latency +7"]),
  tp("Customer Support Operations", "v3.1", 82, [86, 94, 80, 74, 84, 76, 80], 85, 80, 4, 6, 6, ["DEC 5011"], 74, "2.9 days", "2 days",
    ["Acknowledgement coverage 68%", "Persona evidence coverage declined 3 points"],
    ["Journey coverage is broad"],
    ["Information Quality -3", "Cross Team Awareness -1"]),
  tp("Release Governance", "v2.3", 91, [94, 98, 88, 89, 93, 84, 90], 96, 88, 0, 1, 1, ["DEC 5003"], 89, "1.6 days", "5 hours",
    ["Quarter end restriction review pending"],
    ["Complete approval traceability", "Zero open conflicts"],
    ["Decision Confidence +2"]),
];

export const personaById = (id: string) => personaHealth.find((p) => p.id === id);

/* ====================================================== knowledge domains */

const kd = (
  knowledgeDomain: string, overall: number, scores: number[], evidenceQuality: number, depVis: number,
  decisionConf: number, reuse: number, trend: number, attention: string[],
): KnowledgeDomainCognitiveHealth => ({
  id: `KDH ${knowledgeDomain.slice(0, 3).toUpperCase()}`, knowledgeDomain, overallScore: overall,
  dimensionScores: Object.fromEntries(dimensions.map((d, i) => [d.id, scores[i]])),
  evidenceQuality, dependencyVisibility: depVis, decisionConfidence: decisionConf, learningReuse: reuse,
  trend, attentionSignalIds: attention, status: bandFor(overall),
});

export const knowledgeDomains: KnowledgeDomainCognitiveHealth[] = [
  kd("Payments & Commerce", 88, [93, 97, 85, 84, 91, 79, 87], 93, 85, 91, 88, 4, ["CHS 1016"]),
  kd("Identity & Access", 82, [88, 95, 75, 78, 85, 73, 80], 88, 75, 85, 76, 1, ["CHS 1003"]),
  kd("Reliability Engineering", 93, [96, 98, 91, 89, 94, 86, 93], 96, 91, 94, 92, 3, []),
  kd("Security", 94, [97, 99, 91, 90, 95, 88, 93], 97, 91, 95, 91, 2, []),
  kd("Customer Experience", 85, [90, 96, 83, 81, 87, 77, 84], 90, 83, 87, 80, 2, ["CHS 1004"]),
  kd("Release Governance", 91, [94, 98, 88, 89, 93, 84, 90], 94, 88, 93, 89, 2, []),
  kd("Fraud & Risk", 86, [92, 96, 84, 82, 89, 78, 85], 92, 84, 89, 82, 3, []),
  kd("Observability", 92, [95, 98, 90, 88, 93, 85, 91], 95, 90, 93, 90, 3, []),
  kd("Architecture", 89, [93, 97, 87, 86, 90, 82, 88], 93, 87, 90, 86, 2, []),
];

/* ============================================================== heatmap */

export type HeatmapMode = "business-unit" | "team-persona" | "knowledge-domain";

export interface HeatmapRow {
  id: string; label: string; sublabel: string; overall: number; trend: number;
  cells: { dimensionId: string; score: number; band: HealthBand; trend: number; confidence: number }[];
}

export function heatmapRows(mode: HeatmapMode): HeatmapRow[] {
  const build = (id: string, label: string, sublabel: string, overall: number, scoreMap: Record<string, number>, trend: number): HeatmapRow => ({
    id, label, sublabel, overall, trend,
    cells: dimensions.map((d, i) => ({
      dimensionId: d.id,
      score: scoreMap[d.id],
      band: bandFor(scoreMap[d.id]),
      trend: ((overall + i * 3) % 7) - 2,
      confidence: 88 + ((overall + i) % 10),
    })),
  });
  if (mode === "team-persona") {
    return personaHealth.map((p) => build(p.id, p.persona, p.personaVersion, p.overallScore, p.dimensionScores, p.overallScore >= 88 ? 3 : p.overallScore >= 82 ? 1 : -1));
  }
  if (mode === "knowledge-domain") {
    return knowledgeDomains.map((k) => build(k.id, k.knowledgeDomain, "Knowledge Domain", k.overallScore, k.dimensionScores, k.trend));
  }
  return businessUnits.map((b) => build(b.id, b.businessUnit, "Business Unit", b.overallScore, b.dimensionScores, b.trend));
}

/* ====================================================== latency analysis */

export const latencyMetrics: CognitiveHealthLatencyMetric[] = [
  { id: "LAT 1", name: "Intake to Context Match", stageFrom: "Cognitive Intake", stageTo: "Context Match", currentDuration: "2.4 hours", targetDuration: "Under 1 hour", previousDuration: "3.1 hours", unit: "hours", trend: 4, affectedScopeIds: ["Enterprise"], bottleneckReasonIds: ["BN 1"], status: "Needs Attention" },
  { id: "LAT 2", name: "Intake to Readiness", stageFrom: "Cognitive Intake", stageTo: "Cognitive Readiness", currentDuration: "6.2 hours", targetDuration: "Under 4 hours", previousDuration: "8.3 hours", unit: "hours", trend: 6, affectedScopeIds: ["Enterprise"], bottleneckReasonIds: ["BN 1", "BN 4"], status: "Needs Attention" },
  { id: "LAT 3", name: "Readiness to Persona Impact", stageFrom: "Cognitive Readiness", stageTo: "Persona Impact Analysis", currentDuration: "0.8 business days", targetDuration: "Under 0.5 days", previousDuration: "1.1 business days", unit: "business days", trend: 3, affectedScopeIds: ["Commerce Engineering"], bottleneckReasonIds: ["BN 4"], status: "Needs Attention" },
  { id: "LAT 4", name: "Persona Impact to Cross Team Understanding", stageFrom: "Persona Impact Analysis", stageTo: "Cross Team Understanding", currentDuration: "1.3 business days", targetDuration: "Under 0.5 days", previousDuration: "1.7 business days", unit: "business days", trend: 4, affectedScopeIds: ["Commerce Engineering", "Identity & Access"], bottleneckReasonIds: ["BN 2", "BN 3"], status: "At Risk" },
  { id: "LAT 5", name: "Cross Team Understanding to Decision Context", stageFrom: "Cross Team Understanding", stageTo: "Decision Context", currentDuration: "0.8 business days", targetDuration: "Under 0.5 days", previousDuration: "1.0 business days", unit: "business days", trend: 2, affectedScopeIds: ["Enterprise"], bottleneckReasonIds: ["BN 3"], status: "Needs Attention" },
  { id: "LAT 6", name: "Total Cross Team Understanding", stageFrom: "Cognitive Intake", stageTo: "Decision Context", currentDuration: "2.1 business days", targetDuration: "Under 1 business day", previousDuration: "2.8 business days", unit: "business days", trend: 6, affectedScopeIds: ["Enterprise"], bottleneckReasonIds: ["BN 1", "BN 2", "BN 3", "BN 4"], status: "Attention" },
];

export const latencyBottlenecks = [
  { id: "BN 1", name: "Evidence Clarification", share: "34%", detail: "Repeated clarification requests on high dependency intake packages", trend: -3 },
  { id: "BN 2", name: "Dependency Validation", share: "27%", detail: "Aging Identity dependency evidence requires manual revalidation", trend: -1 },
  { id: "BN 3", name: "Coordination Ownership", share: "24%", detail: "Coordination actions without a confirmed accountable owner", trend: 2 },
  { id: "BN 4", name: "Persona Review", share: "15%", detail: "Persona version review queued behind validation backlog", trend: 4 },
];

/* ================================================ dimension metric groups */

export interface MetricRow { label: string; value: string; numeric: number; target?: string; status: string; note?: string }

export const dependencyVisibilityMetrics: MetricRow[] = [
  { label: "Known Critical Dependencies", value: "1,842", numeric: 100, status: "Current" },
  { label: "Validated Critical Dependencies", value: "1,624", numeric: 88, status: "Needs Attention" },
  { label: "Validation Coverage", value: "88%", numeric: 88, target: "95%", status: "Needs Attention" },
  { label: "Relationships with Current Evidence", value: "84%", numeric: 84, target: "94%", status: "Needs Attention" },
  { label: "Relationships with Confirmed Owner", value: "91%", numeric: 91, target: "97%", status: "Healthy" },
  { label: "Shared Dependencies Detected Before Decision", value: "86%", numeric: 86, target: "94%", status: "Needs Attention" },
  { label: "Critical Unknowns", value: "12", numeric: 12, target: "0", status: "Critical" },
];

export const highAttentionDependencies = [
  { id: "DEP 7712", name: "Identity Services", personas: ["Payments Platform", "Checkout Engineering", "Identity Engineering"], confidence: 74, freshness: "112 days", owner: "Confirmed", decisions: ["DEC 5006", "DEC 5011"], effect: "-2.4 Dependency Visibility" },
  { id: "DEP 7718", name: "Fraud Decision Service", personas: ["Fraud Engineering", "Payments Platform"], confidence: 82, freshness: "48 days", owner: "Confirmed", decisions: ["DEC 5001"], effect: "-1.1 Dependency Visibility" },
  { id: "DEP 7724", name: "Regional Token Vault", personas: ["Identity Engineering", "Platform Engineering"], confidence: 71, freshness: "134 days", owner: "Unconfirmed", decisions: ["DEC 5003"], effect: "-3.0 Dependency Visibility" },
  { id: "DEP 7729", name: "Customer Identity Graph", personas: ["Identity Engineering", "Customer Experience"], confidence: 79, freshness: "96 days", owner: "Confirmed", decisions: ["DEC 5011"], effect: "-1.6 Dependency Visibility" },
  { id: "DEP 7733", name: "Observability Platform", personas: ["Site Reliability Engineering"], confidence: 92, freshness: "11 days", owner: "Confirmed", decisions: [], effect: "+0.8 Dependency Visibility" },
];

export const informationQualityMetrics: MetricRow[] = [
  { label: "Evidence Coverage", value: "98%", numeric: 98, target: "99%", status: "Strong" },
  { label: "Authority Confidence", value: "93%", numeric: 93, target: "96%", status: "Healthy" },
  { label: "Freshness", value: "89%", numeric: 89, target: "94%", status: "Needs Attention" },
  { label: "Ownership Completeness", value: "94%", numeric: 94, target: "98%", status: "Healthy" },
  { label: "Conflict Free Approved Conditions", value: "92%", numeric: 92, target: "97%", status: "Healthy" },
  { label: "Persona Evidence Coverage", value: "94%", numeric: 94, target: "97%", status: "Healthy" },
  { label: "Canonical Artifact Quality", value: "94%", numeric: 94, target: "96%", status: "Healthy" },
];

export const informationQualityAttention = [
  "148 authority conflicts awaiting resolution",
  "482K stale records outside their freshness window",
  "41K ownership resolutions pending confirmation",
];

export const contextPreservationMetrics: MetricRow[] = [
  { label: "Evidence Provenance", value: "99%", numeric: 99, target: "99%", status: "Strong" },
  { label: "Condition Evidence Trace", value: "98%", numeric: 98, target: "99%", status: "Strong" },
  { label: "Persona Evidence Trace", value: "96%", numeric: 96, target: "98%", status: "Strong" },
  { label: "Decision Context Snapshot Coverage", value: "98%", numeric: 98, target: "99%", status: "Strong" },
  { label: "Historical Persona Version Integrity", value: "99%", numeric: 99, target: "99%", status: "Strong" },
  { label: "Outcome Decision Linkage", value: "91%", numeric: 91, target: "96%", status: "Healthy" },
  { label: "Learning Source Decision Trace", value: "98%", numeric: 98, target: "99%", status: "Strong" },
];

/** Must remain zero in every healthy scenario. Historical context is never rewritten. */
export const historicalRewriteViolations = 0;

export const decisionConfidenceMetrics: MetricRow[] = [
  { label: "Persona Coverage", value: "96%", numeric: 96, target: "98%", status: "Strong" },
  { label: "Condition Coverage", value: "94%", numeric: 94, target: "97%", status: "Healthy" },
  { label: "Dependency Coverage", value: "91%", numeric: 91, target: "96%", status: "Healthy" },
  { label: "Evidence Coverage", value: "91%", numeric: 91, target: "95%", status: "Healthy" },
  { label: "Alternative Coverage", value: "95%", numeric: 95, target: "97%", status: "Strong" },
  { label: "Tradeoff Transparency", value: "97%", numeric: 97, target: "98%", status: "Strong" },
  { label: "Expected Outcome Coverage", value: "92%", numeric: 92, target: "96%", status: "Healthy" },
  { label: "Recommendation Traceability", value: "98%", numeric: 98, target: "99%", status: "Strong" },
  { label: "Decisions with Critical Evidence Gaps", value: "4", numeric: 4, target: "0", status: "Attention" },
];

export const crossTeamAwarenessMetrics: MetricRow[] = [
  { label: "Persona Impact Coverage", value: "92%", numeric: 92, target: "96%", status: "Healthy" },
  { label: "Cross Team Matrix Coverage", value: "88%", numeric: 88, target: "95%", status: "Needs Attention" },
  { label: "Critical Shared Dependency Detection", value: "86%", numeric: 86, target: "94%", status: "Needs Attention" },
  { label: "Acknowledgement Coverage", value: "84%", numeric: 84, target: "95%", status: "Needs Attention" },
  { label: "Coordination Ownership", value: "82%", numeric: 82, target: "95%", status: "Needs Attention" },
  { label: "Conflict Detection", value: "92%", numeric: 92, target: "95%", status: "Healthy" },
  { label: "Mitigation Coverage", value: "89%", numeric: 89, target: "94%", status: "Healthy" },
  { label: "Average Coordination Completion", value: "2.1 business days", numeric: 21, target: "Under 1 day", status: "Attention" },
];

export const learningMaturityMetrics: MetricRow[] = [
  { label: "Decisions with Expected Outcomes", value: "92%", numeric: 92, target: "96%", status: "Healthy" },
  { label: "Decisions with Observed Outcomes", value: "82%", numeric: 82, target: "92%", status: "Needs Attention" },
  { label: "Outcome Reconciliation", value: "78%", numeric: 78, target: "90%", status: "Needs Attention" },
  { label: "Validated Learning Coverage", value: "82%", numeric: 82, target: "92%", status: "Needs Attention" },
  { label: "Learning Publication", value: "88%", numeric: 88, target: "97%", status: "Healthy" },
  { label: "Learning Reuse", value: "82%", numeric: 82, target: "92%", status: "Healthy" },
  { label: "Learning Effectiveness Review", value: "74%", numeric: 74, target: "88%", status: "At Risk" },
  { label: "Learning Reassessment Coverage", value: "79%", numeric: 79, target: "90%", status: "Needs Attention" },
];

export const learningMaturityAttention = [
  "18 validated learnings pending publication",
  "128 learning records pending effectiveness review",
];

/* ================================================== module health matrix */

export type ContributionLevel =
  | "Strong Contributor" | "Positive Contributor" | "Neutral" | "Attention Contributor" | "Critical Contributor";

export interface ModuleContributionRow { module: string; route: string; levels: Record<string, ContributionLevel> }

const mc = (module: string, route: string, levels: ContributionLevel[]): ModuleContributionRow => ({
  module, route, levels: Object.fromEntries(dimensions.map((d, i) => [d.id, levels[i]])),
});

export const moduleContributions: ModuleContributionRow[] = [
  mc("Source Discovery", "/enterprise-cognitive-fabric/discovery/source-discovery", ["Strong Contributor", "Positive Contributor", "Positive Contributor", "Neutral", "Positive Contributor", "Neutral", "Neutral"]),
  mc("Artifact Ingestion", "/enterprise-cognitive-fabric/discovery/artifact-ingestion", ["Strong Contributor", "Positive Contributor", "Neutral", "Neutral", "Positive Contributor", "Attention Contributor", "Neutral"]),
  mc("Artifact Normalization", "/enterprise-cognitive-fabric/discovery/artifact-normalization", ["Attention Contributor", "Strong Contributor", "Positive Contributor", "Neutral", "Positive Contributor", "Neutral", "Neutral"]),
  mc("Business Condition Extraction", "/enterprise-cognitive-fabric/discovery/business-condition-extraction", ["Strong Contributor", "Strong Contributor", "Positive Contributor", "Positive Contributor", "Strong Contributor", "Neutral", "Positive Contributor"]),
  mc("Team Persona Construction", "/enterprise-cognitive-fabric/persona-studio/team-persona-construction", ["Positive Contributor", "Positive Contributor", "Attention Contributor", "Strong Contributor", "Positive Contributor", "Attention Contributor", "Positive Contributor"]),
  mc("Persona Validation", "/enterprise-cognitive-fabric/persona-studio/persona-validation", ["Strong Contributor", "Strong Contributor", "Positive Contributor", "Strong Contributor", "Positive Contributor", "Attention Contributor", "Positive Contributor"]),
  mc("Enterprise Cognitive Memory", "/enterprise-cognitive-fabric/cognitive-memory/enterprise-cognitive-memory", ["Strong Contributor", "Strong Contributor", "Critical Contributor", "Positive Contributor", "Strong Contributor", "Positive Contributor", "Strong Contributor"]),
  mc("Cognitive Intake", "/enterprise-cognitive-fabric/evaluation/cognitive-intake", ["Positive Contributor", "Positive Contributor", "Positive Contributor", "Positive Contributor", "Positive Contributor", "Critical Contributor", "Neutral"]),
  mc("Persona Impact Analysis", "/enterprise-cognitive-fabric/evaluation/persona-impact-analysis", ["Positive Contributor", "Positive Contributor", "Positive Contributor", "Strong Contributor", "Strong Contributor", "Attention Contributor", "Positive Contributor"]),
  mc("Cross Team Impact Analysis", "/enterprise-cognitive-fabric/evaluation/cross-team-impact-analysis", ["Neutral", "Positive Contributor", "Strong Contributor", "Critical Contributor", "Strong Contributor", "Critical Contributor", "Positive Contributor"]),
  mc("Decision Intelligence", "/enterprise-cognitive-fabric/evaluation/decision-intelligence", ["Positive Contributor", "Strong Contributor", "Positive Contributor", "Positive Contributor", "Strong Contributor", "Attention Contributor", "Strong Contributor"]),
  mc("Organizational Learning", "/enterprise-cognitive-fabric/learning/organizational-learning", ["Positive Contributor", "Strong Contributor", "Positive Contributor", "Positive Contributor", "Positive Contributor", "Neutral", "Critical Contributor"]),
];

export const contributionTone = (l: ContributionLevel): Tone =>
  l === "Strong Contributor" ? "green"
    : l === "Positive Contributor" ? "blue"
      : l === "Neutral" ? "slate"
        : l === "Attention Contributor" ? "amber" : "red";

/** Short glyph so the matrix never relies on color alone. */
export const contributionGlyph = (l: ContributionLevel) =>
  l === "Strong Contributor" ? "S"
    : l === "Positive Contributor" ? "P"
      : l === "Neutral" ? "—"
        : l === "Attention Contributor" ? "A" : "C";

/* ================================================================ trends */

export type TrendRange = "30 Days" | "90 Days" | "Quarter" | "Year";
export const trendRanges: TrendRange[] = ["30 Days", "90 Days", "Quarter", "Year"];

export interface TrendPoint { period: string; ECHI: number; [key: string]: number | string }

const trendPeriods: Record<TrendRange, string[]> = {
  "30 Days": ["Week 1", "Week 2", "Week 3", "Week 4", "Current"],
  "90 Days": ["Apr", "May", "Jun", "Jul", "Current"],
  Quarter: ["Q3 25", "Q4 25", "Q1 26", "Q2 26", "Current"],
  Year: ["Aug 25", "Nov 25", "Feb 26", "May 26", "Current"],
};

const baseSeries: Record<string, number[]> = {
  ECHI: [78, 80, 82, 84, 87],
  "DIM IQ": [84, 86, 88, 88, 92],
  "DIM CP": [94, 95, 95, 95, 96],
  "DIM DV": [76, 78, 80, 82, 84],
  "DIM CTA": [70, 72, 76, 76, 81],
  "DIM DC": [82, 84, 86, 87, 89],
  "DIM RL": [67, 69, 72, 72, 78],
  "DIM LM": [74, 77, 80, 82, 86],
};

export function trendSeries(range: TrendRange): TrendPoint[] {
  const periods = trendPeriods[range];
  // Longer ranges start from a lower baseline; deterministic, no randomness.
  const damp = range === "Year" ? 8 : range === "Quarter" ? 5 : range === "90 Days" ? 2 : 0;
  return periods.map((period, i) => {
    const p: TrendPoint = { period, ECHI: baseSeries.ECHI[i] - (i < 4 ? damp : 0) };
    dimensions.forEach((d) => { p[d.id] = baseSeries[d.id][i] - (i < 4 ? damp : 0); });
    return p;
  });
}

export interface AssociatedEvent { id: string; label: string; period: string; detail: string }

/** Labelled Associated Event, never Cause. Correlation is displayed, causality is not claimed. */
export const associatedEvents: AssociatedEvent[] = [
  { id: "EVT 1", label: "Major Persona Validation Completion", period: "Week 2", detail: "38 Team Personas revalidated across Commerce and Platform" },
  { id: "EVT 2", label: "Memory Refresh", period: "Week 3", detail: "Enterprise Cognitive Memory reindexed with 4.2M refreshed records" },
  { id: "EVT 3", label: "Decision Program Launch", period: "Week 3", detail: "Checkout resilience decision program entered execution" },
  { id: "EVT 4", label: "Learning Publication", period: "Week 4", detail: "22 validated learning records published into memory" },
  { id: "EVT 5", label: "Dependency Revalidation", period: "Current", detail: "Payments dependency set revalidated, Identity set still pending" },
];

/* ======================================================= change explainer */

export const healthChanges: CognitiveHealthChange[] = [
  { id: "CHG 1", dimensionId: "DIM RL", dimensionName: "Response Latency", scopeType: "Enterprise", scopeId: "Enterprise", previousValue: 72, currentValue: 78, change: 6, contributingSignalIds: ["CHS 1020", "CHS 1021"], associatedEventIds: ["EVT 2"], confidence: 90, timestamp: "2026-08-04" },
  { id: "CHG 2", dimensionId: "DIM CTA", dimensionName: "Cross Team Awareness", scopeType: "Enterprise", scopeId: "Enterprise", previousValue: 76, currentValue: 81, change: 5, contributingSignalIds: ["CHS 1015", "CHS 1004"], associatedEventIds: ["EVT 1"], confidence: 93, timestamp: "2026-08-03" },
  { id: "CHG 3", dimensionId: "DIM IQ", dimensionName: "Information Quality", scopeType: "Enterprise", scopeId: "Enterprise", previousValue: 88, currentValue: 92, change: 4, contributingSignalIds: ["CHS 1001", "CHS 1010"], associatedEventIds: ["EVT 2"], confidence: 95, timestamp: "2026-08-02" },
  { id: "CHG 4", dimensionId: "DIM LM", dimensionName: "Learning Maturity", scopeType: "Enterprise", scopeId: "Enterprise", previousValue: 82, currentValue: 86, change: 4, contributingSignalIds: ["CHS 1007", "CHS 1023"], associatedEventIds: ["EVT 4"], confidence: 92, timestamp: "2026-08-01" },
  { id: "CHG 5", dimensionId: "DIM DV", dimensionName: "Dependency Freshness", scopeType: "Knowledge Domain", scopeId: "Identity & Access", previousValue: 77, currentValue: 75, change: -2, contributingSignalIds: ["CHS 1003"], associatedEventIds: ["EVT 5"], confidence: 91, timestamp: "2026-08-05" },
  { id: "CHG 6", dimensionId: "DIM IQ", dimensionName: "Customer Support Persona Evidence Coverage", scopeType: "Team Persona", scopeId: "Customer Support Operations", previousValue: 89, currentValue: 86, change: -3, contributingSignalIds: ["CHS 1009"], associatedEventIds: [], confidence: 92, timestamp: "2026-08-05" },
  { id: "CHG 7", dimensionId: "DIM DC", dimensionName: "Decision Evidence Completeness", scopeType: "Business Unit", scopeId: "Platform Engineering", previousValue: 91, currentValue: 90, change: -1, contributingSignalIds: ["CHS 1005"], associatedEventIds: ["EVT 3"], confidence: 93, timestamp: "2026-08-06" },
];

/* ====================================================== critical signals */

export const criticalSignals = [
  { id: "CRS 1", signal: "Identity Dependency Validation", dimension: "Dependency Visibility", scope: "Identity & Access", severity: "Critical", current: "84%", target: "95%", trend: 2, decisions: ["DEC 5006", "DEC 5011"], teams: ["Identity Engineering", "Payments Platform"], owner: "Identity Platform Context", status: "Open", signalId: "CHS 1003" },
  { id: "CRS 2", signal: "Checkout Cross Team Coordination Ownership", dimension: "Cross Team Awareness", scope: "Commerce Engineering", severity: "High", current: "82%", target: "95%", trend: 2, decisions: ["DEC 5001"], teams: ["Checkout Engineering", "Customer Support Operations"], owner: "Commerce Coordination Context", status: "Open", signalId: "CHS 1016" },
  { id: "CRS 3", signal: "Regional Token Vault Decision Evidence", dimension: "Decision Confidence", scope: "Platform Engineering", severity: "High", current: "79%", target: "92%", trend: -1, decisions: ["DEC 5003"], teams: ["Identity Engineering", "Release Governance"], owner: "Platform Decision Context", status: "Open", signalId: "CHS 1005" },
  { id: "CRS 4", signal: "Learning Publication Backlog", dimension: "Learning Maturity", scope: "Enterprise", severity: "Medium High", current: "18 validated records", target: "Under 5", trend: 2, decisions: [], teams: ["Payments Platform", "Site Reliability Engineering"], owner: "Learning Governance Context", status: "Open", signalId: "CHS 1023" },
  { id: "CRS 5", signal: "Cross Team Understanding Time", dimension: "Response Latency", scope: "Enterprise", severity: "Critical", current: "2.1 days", target: "Under 1 day", trend: 6, decisions: ["DEC 5011"], teams: ["Identity Engineering", "Customer Support Operations"], owner: "Coordination Context", status: "Improving", signalId: "CHS 1006" },
  { id: "CRS 6", signal: "Customer Support Acknowledgement Coverage", dimension: "Cross Team Awareness", scope: "Customer Support Operations", severity: "High", current: "68%", target: "95%", trend: -1, decisions: ["DEC 5011"], teams: ["Customer Support Operations"], owner: "Support Coordination Context", status: "Open", signalId: "CHS 1004" },
];

/* =============================================================== summary */

export const healthSummary = {
  currentEchi: 87,
  target: 92,
  status: "Healthy with Attention Areas" as HealthBand,
  strongest: ["Context Preservation 96", "Information Quality 92"],
  attention: ["Response Latency 78", "Cross Team Awareness 81", "Dependency Visibility 84"],
  primaryFinding:
    "The enterprise has strong evidence preservation and increasingly reliable decision context, but cross team coordination and dependency validation still require too much time and manual ownership.",
  positiveSignals: [
    "Persona Coverage improving",
    "Cross Team Matrix adoption increasing",
    "Decision context quality improving",
    "Validated learning reuse increasing",
  ],
  attentionSignals: [
    "Identity dependency evidence aging",
    "Coordination ownership gaps",
    "Learning publication backlog",
    "Repeated clarification in high dependency changes",
  ],
  decisionExposure: "4 active decisions affected by attention level health signals",
  improvementLevers: [
    "Validate critical dependency relationships",
    "Assign open coordination ownership",
    "Publish approved learning backlog",
    "Improve high dependency team Persona freshness",
  ],
};

/* ============================================================== activity */

export const chActivity: CognitiveHealthActivity[] = [
  { id: "CHA 1", timestamp: "2026-08-06 21:40", scopeType: "Enterprise", scopeId: "Enterprise", dimensionId: "DIM RL", action: "ECHI recalculated", description: "ECHI moved from 84 to 87 following latency and awareness improvements", result: "Recorded", owner: "Health Modeling", auditId: "AUD 90112" },
  { id: "CHA 2", timestamp: "2026-08-06 18:05", scopeType: "Knowledge Domain", scopeId: "Identity & Access", dimensionId: "DIM DV", action: "Material change detected", description: "Dependency freshness declined 2 points in the Identity domain", result: "Attention record created", owner: "Health Analysis", auditId: "AUD 90108" },
  { id: "CHA 3", timestamp: "2026-08-06 14:22", scopeType: "Business Unit", scopeId: "Commerce Engineering", dimensionId: "DIM CTA", action: "Contributing cause identified", description: "Four coordination actions without confirmed owner linked to acknowledgement lag", result: "Diagnostic path PATH 02 opened", owner: "Health Analysis", auditId: "AUD 90101" },
  { id: "CHA 4", timestamp: "2026-08-05 09:48", scopeType: "Enterprise", scopeId: "Enterprise", dimensionId: "DIM LM", action: "Learning signal refreshed", description: "Validated learning reuse recalculated to 82%", result: "Signal updated", owner: "Learning Governance", auditId: "AUD 90094" },
  { id: "CHA 5", timestamp: "2026-08-04 16:30", scopeType: "Enterprise", scopeId: "Enterprise", dimensionId: "DIM CP", action: "Integrity check completed", description: "Historical context rewrite violations verified at zero", result: "Passed", owner: "Memory Governance", auditId: "AUD 90088" },
];

/* =============================================================== filters */

export type ChFilterKey =
  | "businessUnit" | "team" | "persona" | "knowledgeDomain" | "capability" | "product" | "service"
  | "system" | "customerJourney" | "region" | "environment" | "dimension" | "band" | "signalType"
  | "severity" | "confidenceBand" | "freshness" | "decisionType" | "workType" | "dependencyCriticality"
  | "learningStatus" | "timeRange" | "comparisonPeriod";

export const chFilterOptions: { key: ChFilterKey; label: string; options: string[] }[] = [
  { key: "businessUnit", label: "Business Unit", options: ["All", ...businessUnits.map((b) => b.businessUnit)] },
  { key: "team", label: "Team", options: ["All", "Checkout", "Payments", "Identity", "Fraud", "SRE", "Support", "Governance"] },
  { key: "persona", label: "Team Persona", options: ["All", ...personaHealth.map((p) => p.persona)] },
  { key: "knowledgeDomain", label: "Knowledge Domain", options: ["All", ...knowledgeDomains.map((k) => k.knowledgeDomain)] },
  { key: "capability", label: "Business Capability", options: ["All", "Order Capture", "Payment Authorization", "Identity Verification", "Fraud Decisioning", "Service Recovery"] },
  { key: "product", label: "Product", options: ["All", "Checkout", "Wallet", "Subscriptions", "Merchant Portal"] },
  { key: "service", label: "Service", options: ["All", "Payment Gateway", "Identity Services", "Fraud Decision Service", "Token Vault", "Observability Platform"] },
  { key: "system", label: "System", options: ["All", "Commerce Core", "Identity Core", "Risk Engine", "Ledger", "Support Desk"] },
  { key: "customerJourney", label: "Customer Journey", options: ["All", "Guest Checkout", "Returning Checkout", "Account Recovery", "Refund", "Dispute"] },
  { key: "region", label: "Region", options: ["All", "North America", "EMEA", "APAC", "LATAM"] },
  { key: "environment", label: "Environment", options: ["All", "Production", "Staging", "Pre-Production"] },
  { key: "dimension", label: "Health Dimension", options: ["All", ...dimensions.map((d) => d.name)] },
  { key: "band", label: "Health Band", options: ["All", "Strong", "Healthy", "Healthy with Attention Areas", "Needs Attention", "At Risk", "Critical"] },
  { key: "signalType", label: "Signal Type", options: ["All", "Coverage", "Confidence", "Freshness", "Latency", "Ownership", "Reuse"] },
  { key: "severity", label: "Severity", options: ["All", "Critical", "High", "Medium High", "Medium", "Low", "Informational"] },
  { key: "confidenceBand", label: "Confidence Band", options: ["All", "Above 95%", "90-95%", "Below 90%"] },
  { key: "freshness", label: "Data Freshness", options: ["All", "Under 24 hours", "1-7 days", "Over 7 days"] },
  { key: "decisionType", label: "Decision Type", options: ["All", "Policy Change", "Migration", "Configuration Change", "Capacity Change", "Governance Change"] },
  { key: "workType", label: "Work Type", options: ["All", "Change Request", "Incident Follow Up", "Program Initiative", "Compliance Action"] },
  { key: "dependencyCriticality", label: "Dependency Criticality", options: ["All", "Critical", "High", "Medium", "Low"] },
  { key: "learningStatus", label: "Learning Status", options: ["All", "Validated", "Published", "Pending Publication", "Pending Review"] },
  { key: "timeRange", label: "Time Range", options: ["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days", "Quarter", "Year", "Custom"] },
  { key: "comparisonPeriod", label: "Comparison Period", options: ["Previous Period", "Previous Quarter", "Same Period Last Year", "Baseline"] },
];

export const chDefaultFilters = chFilterOptions.reduce((acc, f) => {
  acc[f.key] = f.key === "timeRange" ? "Last 30 Days" : f.key === "comparisonPeriod" ? "Previous Period" : "All";
  return acc;
}, {} as Record<ChFilterKey, string>);

export const chActiveFilterCount = (f: Record<ChFilterKey, string>) =>
  chFilterOptions.filter((o) => f[o.key] !== chDefaultFilters[o.key]).length;

/* ==================================================== workbench derivation */

export type WorkbenchScope =
  | "Enterprise" | "Commerce Engineering" | "Identity & Access" | "Platform Engineering"
  | "Customer Experience" | "Customer Support Operations" | "Release & Governance"
  | "Security Engineering" | "Finance Operations";

export const workbenchScopes: WorkbenchScope[] = [
  "Enterprise", "Commerce Engineering", "Identity & Access", "Platform Engineering",
  "Customer Experience", "Customer Support Operations", "Release & Governance",
  "Security Engineering", "Finance Operations",
];

export interface ChWorkbenchParams {
  scope: WorkbenchScope;
  dimensionId: string;
  timeRange: TrendRange;
}

export const chBaselineParams: ChWorkbenchParams = {
  scope: "Commerce Engineering",
  dimensionId: "DIM CTA",
  timeRange: "30 Days",
};

export interface ChDerivedState {
  score: number;
  target: number;
  previous: number;
  trend: number;
  confidence: number;
  status: HealthBand;
  definition: string;
  supportingSignals: CognitiveHealthSignal[];
  positive: CognitiveHealthContributor[];
  negative: CognitiveHealthContributor[];
  paths: CognitiveHealthDiagnosticPath[];
  scopeNote: string;
  timeNote: string;
  echi: number;
}

/**
 * Deterministic scope and time adjustment. Demonstration arithmetic only — this
 * intentionally does not imply statistical precision.
 */
export function deriveHealthState(p: ChWorkbenchParams): ChDerivedState {
  const dim = dimensionById(p.dimensionId);
  const scopeRow = businessUnits.find((b) => b.businessUnit === p.scope);
  const base = scopeRow ? scopeRow.dimensionScores[dim.id] : dim.score;

  const timeAdj = p.timeRange === "Year" ? -6 : p.timeRange === "Quarter" ? -4 : p.timeRange === "90 Days" ? -2 : 0;
  const score = Math.max(40, Math.min(99, base + timeAdj + (p.scope === "Enterprise" ? 0 : 0)));
  const previous = Math.max(38, score - dim.trend);
  const confidence = Math.max(70, dim.confidence - (p.timeRange === "Year" ? 5 : p.timeRange === "Quarter" ? 3 : 0));

  const scopeSignals = signalsForDimension(dim.id)
    .filter((sig) => p.scope === "Enterprise" || sig.scopeId === "Enterprise" || sig.scopeId === p.scope);

  return {
    score,
    target: dim.target,
    previous,
    trend: score - previous,
    confidence,
    status: bandFor(score),
    definition: dim.description,
    supportingSignals: scopeSignals.length ? scopeSignals : signalsForDimension(dim.id),
    positive: contributorsForDimension(dim.id).filter((c) => c.contributionDirection === "Positive"),
    negative: contributorsForDimension(dim.id).filter((c) => c.contributionDirection === "Negative"),
    paths: pathsForDimension(dim.id).length ? pathsForDimension(dim.id) : diagnosticPaths,
    scopeNote: scopeRow
      ? `Scope score derived from ${scopeRow.businessUnit} signal set. Primary concern: ${scopeRow.primaryConcern}.`
      : "Enterprise scope aggregates every business unit signal set at equal weight.",
    timeNote: timeAdj === 0
      ? "Trend reflects the last 30 days of health measurement."
      : `Longer windows include earlier, lower baselines. Scores shift by ${timeAdj} points across the ${p.timeRange} window.`,
    echi: echiSnapshot.echiScore + Math.round(timeAdj / 2),
  };
}

/* ======================================================= workbench detail */

export const workbenchSupportingSignals = [
  { label: "Persona Impact Coverage", value: "92%", target: "96%", trend: 8 },
  { label: "Cross Team Matrix Coverage", value: "88%", target: "95%", trend: 4 },
  { label: "Acknowledgement Coverage", value: "84%", target: "95%", trend: 6 },
  { label: "Coordination Ownership", value: "82%", target: "95%", trend: 2 },
  { label: "Conflict Resolution Coverage", value: "79%", target: "92%", trend: 3 },
  { label: "Average Cross Team Understanding Time", value: "2.1 business days", target: "Under 1 day", trend: 6 },
];

export const workbenchConsequences = {
  business: [
    "4 active decisions have extended review cycles",
    "7 Cognitive Intake packages required repeated clarification",
    "3 Cross Team analyses contain ownership gaps",
    "2 decisions are using context with aging dependency records",
  ],
  customer: [
    "Longer decision cycles for checkout and identity changes",
    "Higher likelihood that downstream impact is discovered late",
  ],
  operational: [
    "Repeated evidence gathering",
    "Duplicate coordination",
    "Escalation dependency on individuals",
  ],
  levers: [
    "Validate Identity dependency relationships",
    "Assign ownership for open coordination actions",
    "Publish validated retry dependency learning",
    "Improve Customer Support Persona evidence coverage",
  ],
};
