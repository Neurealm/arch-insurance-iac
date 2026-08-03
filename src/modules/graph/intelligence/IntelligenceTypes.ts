/**
 * Stage 3.5.3.3 — Graph Intelligence and Recommendation Layer: type model.
 *
 * This layer consumes Stage 3.5.3.2 reasoning output and converts it into
 * prioritized, explainable, advisory recommendations. It never traverses the
 * graph itself, never mutates anything, and contains no LLM, embedding,
 * probabilistic or network behaviour.
 */

import type { GraphNodeType } from "../types";
import type { QueryGraphMetadata, QueryWarning } from "../query/index";
import type {
  LineageLayer,
  ReasoningAnalysis,
  ReasoningConfidence,
  ReasoningEvidence,
  ReasoningFinding,
  ReasoningSeverity,
} from "../reasoning/index";

export const INTELLIGENCE_GENERATOR = "src/modules/graph/intelligence@1.0.0" as const;

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                    */
/* -------------------------------------------------------------------------- */

export const RECOMMENDATION_CATEGORIES = [
  "ownership",
  "registration",
  "traceability",
  "resilience",
  "architecture",
  "governance",
  "operations",
] as const;

export type RecommendationCategory = (typeof RECOMMENDATION_CATEGORIES)[number];

export type RecommendationSeverity = ReasoningSeverity;

export const PRIORITY_BANDS = ["critical", "high", "medium", "low", "informational"] as const;

export type PriorityBand = (typeof PRIORITY_BANDS)[number];

/** Deterministic band thresholds over the 0–100 normalized priority score. */
export const PRIORITY_BAND_THRESHOLDS: readonly { band: PriorityBand; minScore: number }[] = [
  { band: "critical", minScore: 80 },
  { band: "high", minScore: 60 },
  { band: "medium", minScore: 40 },
  { band: "low", minScore: 20 },
  { band: "informational", minScore: 0 },
];

export const bandForScore = (score: number): PriorityBand =>
  PRIORITY_BAND_THRESHOLDS.find((t) => score >= t.minScore)?.band ?? "informational";

export const bandRank = (band: PriorityBand): number => PRIORITY_BANDS.indexOf(band);

export type RecommendationStatus =
  /** Actionable now. */
  | "open"
  /** Structurally present but expected by design; retained for transparency. */
  | "expected-by-design"
  /** Reported for awareness only; no action required. */
  | "informational"
  /** Superseded by a consolidated recommendation. */
  | "consolidated";

export type RemediationComplexity = "trivial" | "low" | "moderate" | "high";

export const COMPLEXITY_ORDER: readonly RemediationComplexity[] = [
  "trivial",
  "low",
  "moderate",
  "high",
];

/* -------------------------------------------------------------------------- */
/* Affected entities                                                           */
/* -------------------------------------------------------------------------- */

export interface AffectedEntities {
  nodeIds: readonly string[];
  routeIds: readonly string[];
  moduleIds: readonly string[];
  capabilityIds: readonly string[];
  serviceIds: readonly string[];
  platformIds: readonly string[];
  owners: readonly string[];
}

export const EMPTY_AFFECTED: AffectedEntities = {
  nodeIds: [],
  routeIds: [],
  moduleIds: [],
  capabilityIds: [],
  serviceIds: [],
  platformIds: [],
  owners: [],
};

/* -------------------------------------------------------------------------- */
/* Findings                                                                    */
/* -------------------------------------------------------------------------- */

export interface IntelligenceFinding {
  /** Deterministic id, inherited from the reasoning finding. */
  id: string;
  analysis: ReasoningAnalysis;
  severity: ReasoningSeverity;
  subject: string;
  summary: string;
  confidence: ReasoningConfidence;
  evidence: readonly ReasoningEvidence[];
  /** True when the underlying condition is expected by design. */
  expected: boolean;
  /** True when candidate (weakly-inferred) relationships contributed. */
  candidateInvolved: boolean;
}

export const toIntelligenceFinding = (
  finding: ReasoningFinding,
  expected = false,
): IntelligenceFinding => ({
  id: finding.id,
  analysis: finding.analysis,
  severity: finding.severity,
  subject: finding.subject,
  summary: finding.summary,
  confidence: finding.confidence,
  evidence: finding.evidence,
  expected,
  candidateInvolved: finding.evidence.some((e) => e.candidate),
});

/* -------------------------------------------------------------------------- */
/* Prioritization                                                              */
/* -------------------------------------------------------------------------- */

export interface PriorityFactorValue {
  /** Stable factor identifier, e.g. `blast-radius`. */
  factor: string;
  /** Normalized 0–1 input. */
  normalized: number;
  /** Maximum points this factor can contribute. */
  weight: number;
  /** normalized * weight, rounded to 2 decimals. */
  contribution: number;
  explanation: string;
}

export interface PriorityScore {
  /** 0–100, deterministic. */
  score: number;
  band: PriorityBand;
  factors: readonly PriorityFactorValue[];
  /** Multiplicative confidence factor applied to the weighted subtotal. */
  confidenceFactor: number;
  /** Points removed because candidate relationships contributed. */
  candidatePenalty: number;
  /** Points added because remediation is cheap relative to benefit. */
  remediationLeverage: number;
  /** True when the score was clamped into the informational band by design. */
  expectedByDesignClamp: boolean;
  explanation: string;
}

/* -------------------------------------------------------------------------- */
/* Remediation                                                                 */
/* -------------------------------------------------------------------------- */

export interface RemediationStep {
  order: number;
  action: string;
  targets: readonly string[];
}

export interface ExpectedMetricImpact {
  coverage: string | null;
  ownership: string | null;
  traceability: string | null;
  resilience: string | null;
}

export interface RemediationPlan {
  action: string;
  requiredUpdates: readonly string[];
  affected: AffectedEntities;
  sequence: readonly RemediationStep[];
  prerequisites: readonly string[];
  validationCriteria: readonly string[];
  expectedGraphImprovement: string;
  expectedMetricImpact: ExpectedMetricImpact;
  complexity: RemediationComplexity;
  /** Always true: this layer is advisory and never mutates anything. */
  advisoryOnly: true;
}

/* -------------------------------------------------------------------------- */
/* Consolidation and explainability                                            */
/* -------------------------------------------------------------------------- */

export interface ConsolidationInfo {
  /** Deterministic grouping key the policy emitted. */
  mergeKey: string;
  consolidated: boolean;
  mergedFindingCount: number;
  rationale: string;
}

export interface ExclusionRecord {
  findingId: string;
  reason: string;
}

export interface LineageReference {
  graphVersion: number;
  graphContentHash: string;
  nodeIds: readonly string[];
  edgeIds: readonly string[];
  layers: readonly LineageLayer[];
  reasoningAnalyses: readonly ReasoningAnalysis[];
}

export interface IntelligenceRecommendation {
  /** Deterministic id: `rec:<policyId>:<slugified merge key>`. */
  id: string;
  policyId: string;
  category: RecommendationCategory;
  severity: RecommendationSeverity;
  status: RecommendationStatus;
  priority: PriorityBand;
  priorityScore: number;
  priorityExplanation: PriorityScore;
  title: string;
  summary: string;
  subject: string;
  affected: AffectedEntities;
  evidence: readonly ReasoningEvidence[];
  sourceFindingIds: readonly string[];
  reasoningAnalyses: readonly ReasoningAnalysis[];
  confidence: ReasoningConfidence;
  confidenceRationale: string;
  candidateInvolved: boolean;
  expectedByDesign: boolean;
  expectedBenefit: string;
  remediation: RemediationPlan;
  consolidation: ConsolidationInfo;
  exclusions: readonly ExclusionRecord[];
  lineage: LineageReference;
}

/* -------------------------------------------------------------------------- */
/* Summaries and statistics                                                    */
/* -------------------------------------------------------------------------- */

export interface SummaryMetric {
  key: string;
  label: string;
  value: number;
  /** Optional 0–100 rate representation for ratio metrics. */
  unit: "count" | "percent";
}

export interface IntelligenceSummary {
  key: IntelligenceSummaryKey;
  title: string;
  metrics: readonly SummaryMetric[];
  /** Deterministic, template-generated statements. Never free-form prose. */
  highlights: readonly string[];
  topRecommendationIds: readonly string[];
}

export const INTELLIGENCE_SUMMARY_KEYS = [
  "executive",
  "architecture",
  "engineering",
  "governance",
  "registration-coverage",
  "resilience",
  "route-traceability",
] as const;

export type IntelligenceSummaryKey = (typeof INTELLIGENCE_SUMMARY_KEYS)[number];

export interface IntelligenceStatistics {
  totalFindings: number;
  totalRecommendations: number;
  recommendationsByCategory: Readonly<Record<RecommendationCategory, number>>;
  recommendationsByPriority: Readonly<Record<PriorityBand, number>>;
  recommendationsBySeverity: Readonly<Record<RecommendationSeverity, number>>;
  recommendationsByStatus: Readonly<Record<RecommendationStatus, number>>;
  affectedRouteCount: number;
  affectedModuleCount: number;
  affectedCapabilityCount: number;
  affectedNodeCount: number;
  ownershipResolutionRate: number;
  routeTraceabilityRate: number;
  singlePointOfFailureCount: number;
  cycleCount: number;
  coverageGapCount: number;
  expectedByDesignExclusionCount: number;
  candidateInfluencedRecommendationCount: number;
}

/* -------------------------------------------------------------------------- */
/* Scope and options                                                           */
/* -------------------------------------------------------------------------- */

export type IntelligenceScopeKind =
  | "graph"
  | "node"
  | "route"
  | "module"
  | "capability"
  | "platform"
  | "owner";

export interface IntelligenceScope {
  kind: IntelligenceScopeKind;
  /** null for whole-graph analysis. */
  subject: string | null;
  /** Node ids the scope resolved to, deterministically sorted. */
  resolvedNodeIds: readonly string[];
}

export interface RecommendationFilter {
  categories?: readonly RecommendationCategory[];
  priorities?: readonly PriorityBand[];
  severities?: readonly RecommendationSeverity[];
  confidences?: readonly ReasoningConfidence[];
  statuses?: readonly RecommendationStatus[];
  policyIds?: readonly string[];
  /** Minimum normalized priority score. */
  minScore?: number;
}

export interface IntelligenceOptions {
  /** Opt-in use of Stage 3.5.2 candidate edges. Off by default. */
  includeCandidateRelationships?: boolean;
  /** Filter applied after scoring, before summaries are computed. */
  filter?: RecommendationFilter;
  /**
   * Maximum number of capability nodes sampled for lineage analysis. Capped
   * for runtime, deterministic (capabilities are sorted by id first).
   */
  lineageSampleLimit?: number;
  /** Restrict analyses to these node types where supported. */
  nodeTypes?: readonly GraphNodeType[];
}

/* -------------------------------------------------------------------------- */
/* Result envelope                                                             */
/* -------------------------------------------------------------------------- */

export interface IntelligenceExecution {
  /** Always true; the layer contains no clocks, randomness or IO. */
  deterministic: true;
  generator: typeof INTELLIGENCE_GENERATOR;
  /** Graph content hash observed before any analysis ran. */
  graphContentHashBefore: string;
  /** Graph content hash observed after every analysis ran. */
  graphContentHashAfter: string;
  graphHashPreserved: boolean;
  analysesExecuted: readonly ReasoningAnalysis[];
  policiesEvaluated: readonly string[];
  candidateRelationshipsIncluded: boolean;
}

export interface IntelligenceDiagnostics {
  warnings: readonly QueryWarning[];
  /** Policies that produced no candidates, for transparency. */
  policiesWithoutRecommendations: readonly string[];
  /** Findings deliberately excluded, with reasons. */
  exclusions: readonly ExclusionRecord[];
  lineageSampleTruncated: boolean;
}

export interface IntelligenceResult {
  success: boolean;
  generator: typeof INTELLIGENCE_GENERATOR;
  scope: IntelligenceScope;
  execution: IntelligenceExecution;
  graph: QueryGraphMetadata;
  findings: readonly IntelligenceFinding[];
  recommendations: readonly IntelligenceRecommendation[];
  summaries: readonly IntelligenceSummary[];
  statistics: IntelligenceStatistics;
  confidence: ReasoningConfidence;
  lineage: LineageReference;
  diagnostics: IntelligenceDiagnostics;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Deterministic, url-safe slug used inside recommendation identifiers. */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96) || "none";

export const uniqueSorted = (values: readonly string[]): readonly string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));

export const CONFIDENCE_FACTOR: Readonly<Record<ReasoningConfidence, number>> = {
  high: 1,
  medium: 0.85,
  low: 0.7,
  "unable-to-verify": 0.5,
};
