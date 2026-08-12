/**
 * Stage 3.5.3.4 — Graph Change Simulation and Remediation Proposal Engine:
 * type model.
 *
 * This layer converts Stage 3.5.3.3 intelligence recommendations into typed,
 * advisory graph change proposals and evaluates their effect against an
 * isolated in-memory overlay. It never mutates the canonical graph, never
 * writes to registries, manifests, routes or source files, and contains no
 * LLM, embedding, probabilistic, timestamp, random or network behaviour.
 */

import type { GraphEdgeType, GraphNodeType, GraphAttributeValue } from "../types";
import type { QueryGraphMetadata, QueryWarning } from "../query/index";
import type {
  ReasoningAnalysis,
  ReasoningConfidence,
  ReasoningEvidence,
} from "../reasoning/index";
import type {
  IntelligenceRecommendation,
  PriorityBand,
  RecommendationCategory,
} from "../intelligence/index";

export const SIMULATION_GENERATOR = "src/modules/graph/simulation@1.0.0" as const;

/* -------------------------------------------------------------------------- */
/* Deterministic helpers                                                       */
/* -------------------------------------------------------------------------- */

/** FNV-1a (32-bit), hex encoded. Deterministic and dependency free. */
export function stableHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export const simSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96) || "none";

export const sortedUnique = (values: readonly string[]): readonly string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));

export const round2 = (value: number): number => Math.round(value * 100) / 100;

/* -------------------------------------------------------------------------- */
/* Change operations                                                           */
/* -------------------------------------------------------------------------- */

export const CHANGE_OPERATIONS = [
  "add-node",
  "add-edge",
  "remove-node",
  "remove-edge",
  "replace-edge",
  "update-node-metadata",
  "update-edge-metadata",
  "declare-ownership",
  "replace-ownership",
  "add-route-registration",
  "add-service-registration",
  "add-capability-registration",
  "add-platform-registration",
  "add-module-registration",
  "add-lineage-relationship",
  "mark-expected-by-design",
  "promote-candidate-edge",
  "reject-candidate-edge",
] as const;

export type ChangeOperation = (typeof CHANGE_OPERATIONS)[number];

export type ChangeTargetKind = "node" | "edge" | "node-pair" | "graph";

export interface ChangeTarget {
  kind: ChangeTargetKind;
  /** Node id, edge id, or `<from>|<TYPE>|<to>` for a node pair. */
  id: string;
  nodeIds: readonly string[];
  edgeIds: readonly string[];
}

export type ChangeSourceKind =
  | "intelligence-recommendation"
  | "reasoning-finding"
  | "candidate-edge"
  | "operator-parameter";

export interface ChangeSource {
  kind: ChangeSourceKind;
  /** Recommendation id, finding id, edge id or parameter name. */
  id: string;
  policyId: string | null;
}

export interface ChangeRationale {
  /** Why the change is required, template generated. Never free-form prose. */
  statement: string;
  /** Reasoning analyses that justify the change. */
  analyses: readonly ReasoningAnalysis[];
  evidence: readonly ReasoningEvidence[];
}

export interface ChangeDependency {
  /** Change id this change must be applied after. */
  changeId: string;
  reason: string;
}

/** Concrete node payload for additive operations. */
export interface ProposedNodePayload {
  id: string;
  type: GraphNodeType;
  label: string;
  moduleId: string | null;
  attributes?: Readonly<Record<string, GraphAttributeValue>>;
}

/** Concrete edge payload for additive operations. */
export interface ProposedEdgePayload {
  from: string;
  to: string;
  type: GraphEdgeType;
  attributes?: Readonly<Record<string, GraphAttributeValue>>;
}

export interface ProposedChange {
  /** Deterministic: `chg:<operation>:<slug(target.id)>:<hash>`. */
  id: string;
  operation: ChangeOperation;
  target: ChangeTarget;
  source: ChangeSource;
  rationale: ChangeRationale;
  dependencies: readonly ChangeDependency[];
  node?: ProposedNodePayload;
  edge?: ProposedEdgePayload;
  /** Replacement edge for `replace-edge`. */
  replacementEdge?: ProposedEdgePayload;
  metadata?: Readonly<Record<string, GraphAttributeValue>>;
  ownerModuleId?: string | null;
  /** True when the operation can be deterministically inverted. */
  reversible: boolean;
  /** Deterministic inverse description used to build rollback sequences. */
  inverseOperation: ChangeOperation | null;
  /** Parameter names that must be resolved before this change can be applied. */
  requiredParameters: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Parameterized proposals                                                     */
/* -------------------------------------------------------------------------- */

export type ParameterType =
  | "module-id"
  | "owner-id"
  | "capability-id"
  | "service-id"
  | "platform-id"
  | "node-id"
  | "relationship-type"
  | "candidate-decision"
  | "justification";

export interface ParameterCandidate {
  value: string;
  label: string;
  evidence: readonly ReasoningEvidence[];
  /** Deterministic 0–100 support score derived from graph facts only. */
  support: number;
}

export interface ParameterDefinition {
  name: string;
  type: ParameterType;
  required: boolean;
  description: string;
  /** Fixed allowed values, when the domain is closed. */
  allowedValues: readonly string[];
  /** Candidate values derived from the graph, deterministically sorted. */
  candidates: readonly ParameterCandidate[];
  constraints: readonly string[];
  /** Only set when a single candidate is deterministically justified. */
  defaultValue: string | null;
}

export type ParameterBinding = Readonly<Record<string, string>>;

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

export const VALIDATION_RULES = [
  "node-exists",
  "node-absent",
  "edge-exists",
  "edge-absent",
  "endpoint-exists",
  "endpoint-policy",
  "duplicate-node",
  "duplicate-edge",
  "identifier-collision",
  "required-metadata",
  "ownership-conflict",
  "registration-hierarchy",
  "route-lineage",
  "candidate-edge-state",
  "expected-by-design-justification",
  "removal-safety",
  "orphan-creation",
  "broken-dependency",
  "cycle-introduction",
  "scope-validity",
  "parameter-completeness",
  "contradictory-operations",
  "cross-proposal-contradiction",
] as const;

export type ValidationRuleId = (typeof VALIDATION_RULES)[number];

export type ValidationOutcome =
  | "valid"
  | "valid-with-warnings"
  | "incomplete"
  | "conflicting"
  | "invalid";

export type ValidationSeverity = "info" | "warning" | "error" | "blocking";

export interface ValidationIssue {
  ruleId: ValidationRuleId;
  severity: ValidationSeverity;
  subject: string;
  message: string;
  changeIds: readonly string[];
}

export interface ValidationResult {
  proposalId: string;
  outcome: ValidationOutcome;
  rulesApplied: readonly ValidationRuleId[];
  issues: readonly ValidationIssue[];
  missingParameters: readonly string[];
  executable: boolean;
}

/* -------------------------------------------------------------------------- */
/* Conflicts                                                                   */
/* -------------------------------------------------------------------------- */

export const CONFLICT_TYPES = [
  "divergent-ownership",
  "incompatible-relationship",
  "removal-dependency",
  "duplicate-registration",
  "contradictory-candidate-decision",
  "conflicting-expected-by-design",
  "circular-proposal-dependency",
  "ordering-conflict",
  "scope-conflict",
  "simultaneous-alternatives",
] as const;

export type ConflictType = (typeof CONFLICT_TYPES)[number];

export type ConflictSeverity = "advisory" | "warning" | "blocking";

export interface ProposalConflict {
  /** Deterministic: `cfl:<type>:<hash of sorted participants>`. */
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  proposalIds: readonly string[];
  changeIds: readonly string[];
  entityIds: readonly string[];
  explanation: string;
  resolutionOptions: readonly string[];
  evidence: readonly ReasoningEvidence[];
  /** Set when duplicates were deterministically consolidated. */
  consolidationRationale: string | null;
}

/* -------------------------------------------------------------------------- */
/* Proposals                                                                   */
/* -------------------------------------------------------------------------- */

export type ProposalKind =
  | "ownership-declaration"
  | "ownership-adjudication"
  | "route-registration"
  | "service-registration"
  | "capability-registration"
  | "platform-registration"
  | "module-registration"
  | "lineage-relationship"
  | "redundancy"
  | "expected-by-design"
  | "candidate-decision"
  | "cycle-break"
  | "chain-decomposition";

export interface ProposalRisk {
  id: string;
  severity: ConflictSeverity;
  statement: string;
  entityIds: readonly string[];
}

export interface ProposalLineage {
  graphVersion: number;
  canonicalGraphHash: string;
  nodeIds: readonly string[];
  edgeIds: readonly string[];
  reasoningAnalyses: readonly ReasoningAnalysis[];
  recommendationId: string;
  policyId: string;
}

export interface ExpectedImprovement {
  /** Metric keys the proposal is expected to move, with the direction. */
  metrics: readonly { key: string; direction: "increase" | "decrease"; statement: string }[];
  resolvesRecommendationIds: readonly string[];
}

export interface ChangeProposal {
  /** Deterministic: `prop:<policyId>:<slug(subject)>:<variant>`. */
  id: string;
  kind: ProposalKind;
  /** Alternative discriminator; `primary` when a proposal has no alternatives. */
  variant: string;
  /** Ids of sibling proposals that are mutually exclusive alternatives. */
  alternativeProposalIds: readonly string[];
  title: string;
  summary: string;
  subject: string;
  category: RecommendationCategory;
  priority: PriorityBand;
  priorityScore: number;
  recommendationId: string;
  policyId: string;
  sourceFindingIds: readonly string[];
  changes: readonly ProposedChange[];
  parameters: readonly ParameterDefinition[];
  prerequisites: readonly string[];
  validationRules: readonly ValidationRuleId[];
  expectedImprovement: ExpectedImprovement;
  risks: readonly ProposalRisk[];
  confidence: ReasoningConfidence;
  evidence: readonly ReasoningEvidence[];
  lineage: ProposalLineage;
  /** True when required parameters remain unbound. */
  incomplete: boolean;
  complexity: "trivial" | "low" | "moderate" | "high";
  reversible: boolean;
}

/* -------------------------------------------------------------------------- */
/* Metrics                                                                     */
/* -------------------------------------------------------------------------- */

export interface SimulationMetrics {
  nodeCount: number;
  edgeCount: number;
  ownershipResolutionRate: number;
  declaredOwnershipCount: number;
  propagatedOwnershipCount: number;
  conflictingOwnershipCount: number;
  unresolvedOwnershipCount: number;
  routeTraceabilityRate: number;
  fullyTraceableRouteCount: number;
  coverageGapCount: number;
  expectedByDesignGapCount: number;
  singlePointOfFailureCount: number;
  bottleneckCount: number;
  dependencyCycleCount: number;
  missingLineageLayerCount: number;
  orphanNodeCount: number;
  recommendationCount: number;
  recommendationsByCategory: Readonly<Record<RecommendationCategory, number>>;
  recommendationsByPriority: Readonly<Record<PriorityBand, number>>;
  priorityScoreTotal: number;
  priorityScoreMax: number;
  priorityScoreMean: number;
}

export type MetricDirection = "improved" | "regressed" | "unchanged";

export interface MetricDelta {
  key: string;
  label: string;
  baseline: number;
  simulated: number;
  delta: number;
  /** Whether an increase is good for this metric. */
  higherIsBetter: boolean;
  direction: MetricDirection;
}

/* -------------------------------------------------------------------------- */
/* Recommendation resolution                                                   */
/* -------------------------------------------------------------------------- */

export type ResolutionClassification =
  | "resolved"
  | "partially-resolved"
  | "unresolved"
  | "superseded"
  | "invalidated"
  | "regressed";

export interface RecommendationResolution {
  recommendationId: string;
  policyId: string;
  category: RecommendationCategory;
  classification: ResolutionClassification;
  baselineState: {
    present: true;
    priority: PriorityBand;
    priorityScore: number;
    affectedNodeCount: number;
    findingCount: number;
  };
  simulatedState: {
    present: boolean;
    priority: PriorityBand | null;
    priorityScore: number | null;
    affectedNodeCount: number;
    findingCount: number;
  };
  evidence: readonly ReasoningEvidence[];
  explanation: string;
  remainingWork: readonly string[];
  residualRiskIds: readonly string[];
  confidence: ReasoningConfidence;
  relatedNewFindingIds: readonly string[];
}

export interface ResidualRisk {
  id: string;
  severity: ConflictSeverity;
  subject: string;
  statement: string;
  entityIds: readonly string[];
  confidence: ReasoningConfidence;
}

/* -------------------------------------------------------------------------- */
/* Regressions                                                                 */
/* -------------------------------------------------------------------------- */

export const REGRESSION_KINDS = [
  "new-dependency-cycle",
  "new-single-point-of-failure",
  "new-ownership-conflict",
  "reduced-traceability",
  "increased-unresolved-ownership",
  "new-coverage-gap",
  "broken-lineage",
  "orphaned-node",
  "invalid-route-relationship",
  "reduced-confidence",
  "higher-priority-recommendation",
  "increased-blast-radius",
  "removed-required-evidence",
  "unexpected-recommendation-growth",
] as const;

export type RegressionKind = (typeof REGRESSION_KINDS)[number];

export type RegressionSeverity = "info" | "warning" | "critical";

export interface RegressionFinding {
  /** Deterministic: `reg:<kind>:<slug(subject)>`. */
  id: string;
  kind: RegressionKind;
  severity: RegressionSeverity;
  priority: PriorityBand;
  scope: string;
  subject: string;
  statement: string;
  affectedEntityIds: readonly string[];
  reversible: boolean;
  confidence: ReasoningConfidence;
  /** Metric keys or finding ids the detection was based on. */
  detectionBasis: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Scoring                                                                     */
/* -------------------------------------------------------------------------- */

export const RECOMMENDATION_BANDS = [
  "strongly-recommended",
  "recommended",
  "conditional",
  "low-value",
  "not-recommended",
  "invalid",
] as const;

export type ProposalRecommendationBand = (typeof RECOMMENDATION_BANDS)[number];

export interface ScoreComponent {
  key: string;
  label: string;
  normalized: number;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface ProposalScore {
  /** 0–100 normalized composite. */
  score: number;
  benefitScore: number;
  riskScore: number;
  complexityScore: number;
  confidenceScore: number;
  band: ProposalRecommendationBand;
  benefitComponents: readonly ScoreComponent[];
  riskComponents: readonly ScoreComponent[];
  complexityComponents: readonly ScoreComponent[];
  /** Gating rules that forced the band, in evaluation order. */
  gatesApplied: readonly string[];
  explanation: string;
}

/* -------------------------------------------------------------------------- */
/* Scope and request                                                           */
/* -------------------------------------------------------------------------- */

export type SimulationScopeKind =
  | "graph"
  | "node"
  | "route"
  | "module"
  | "capability"
  | "service"
  | "platform"
  | "owner"
  | "recommendation"
  | "proposal"
  | "bundle";

export interface SimulationScope {
  kind: SimulationScopeKind;
  subject: string | null;
  resolvedNodeIds: readonly string[];
}

export interface SimulationFilter {
  categories?: readonly RecommendationCategory[];
  priorities?: readonly PriorityBand[];
  confidences?: readonly ReasoningConfidence[];
  policyIds?: readonly string[];
  entityTypes?: readonly GraphNodeType[];
  /** Drop results carrying a regression at or above this severity. */
  maxRegressionSeverity?: RegressionSeverity;
}

export interface SimulationRequest {
  scope?: SimulationScope | { kind: SimulationScopeKind; subject?: string | null };
  proposalIds?: readonly string[];
  /** Parameter bindings keyed by proposal id. */
  parameters?: Readonly<Record<string, ParameterBinding>>;
  filter?: SimulationFilter;
  /** Opt-in use of Stage 3.5.2 candidate relationships. Off by default. */
  includeCandidateRelationships?: boolean;
  /** Deterministic cap on capability lineage sampling, forwarded downstream. */
  lineageSampleLimit?: number;
}

/* -------------------------------------------------------------------------- */
/* Overlay                                                                     */
/* -------------------------------------------------------------------------- */

export interface OverlayConstruction {
  /** Canonical hash the overlay was derived from. */
  baseContentHash: string;
  /** Deterministic hash of the overlay content. */
  overlayContentHash: string;
  appliedChangeIds: readonly string[];
  skippedChangeIds: readonly string[];
  addedNodeIds: readonly string[];
  removedNodeIds: readonly string[];
  modifiedNodeIds: readonly string[];
  addedEdgeIds: readonly string[];
  removedEdgeIds: readonly string[];
  /** Node and edge counts before and after. */
  nodeCountBefore: number;
  nodeCountAfter: number;
  edgeCountBefore: number;
  edgeCountAfter: number;
  notes: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Sequencing and bundles                                                      */
/* -------------------------------------------------------------------------- */

export interface SequenceStep {
  order: number;
  proposalIds: readonly string[];
  /** True when the proposals in this step have no interdependencies. */
  parallelizable: boolean;
  blockedBy: readonly string[];
  rationale: string;
}

export interface ProposalSequence {
  steps: readonly SequenceStep[];
  parallelGroups: readonly (readonly string[])[];
  sequentialGroups: readonly (readonly string[])[];
  alternativeBranches: readonly (readonly string[])[];
  blockingDependencies: readonly { proposalId: string; dependsOn: readonly string[] }[];
  circularDependencies: readonly (readonly string[])[];
  rollbackOrder: readonly string[];
}

export interface IntermediateState {
  order: number;
  proposalId: string;
  overlayContentHash: string;
  metrics: SimulationMetrics;
  deltas: readonly MetricDelta[];
}

export interface ProposalBundleResult {
  /** Deterministic: `bundle:<hash of sorted proposal ids>`. */
  bundleId: string;
  proposalIds: readonly string[];
  sequence: ProposalSequence;
  conflicts: readonly ProposalConflict[];
  validationResults: readonly ValidationResult[];
  intermediateStates: readonly IntermediateState[];
  finalMetrics: SimulationMetrics;
  baselineMetrics: SimulationMetrics;
  deltas: readonly MetricDelta[];
  resolutions: readonly RecommendationResolution[];
  regressions: readonly RegressionFinding[];
  cumulativeBenefit: number;
  cumulativeRisk: number;
  score: ProposalScore;
  overlay: OverlayConstruction;
  canonicalGraphHashBefore: string;
  canonicalGraphHashAfter: string;
  canonicalGraphHashPreserved: boolean;
  diagnostics: SimulationDiagnostics;
}

/* -------------------------------------------------------------------------- */
/* Diagnostics, evidence, confidence, lineage                                  */
/* -------------------------------------------------------------------------- */

export interface SimulationDiagnostics {
  warnings: readonly QueryWarning[];
  skippedProposalIds: readonly string[];
  unresolvedParameters: readonly { proposalId: string; parameters: readonly string[] }[];
  notes: readonly string[];
  /** Always true; this layer contains no clocks, randomness, IO or LLMs. */
  deterministic: true;
  generator: typeof SIMULATION_GENERATOR;
}

export interface SimulationLineage {
  graphVersion: number;
  canonicalGraphHash: string;
  overlayContentHash: string;
  nodeIdsBefore: readonly string[];
  nodeIdsAfter: readonly string[];
  edgeIdsBefore: readonly string[];
  edgeIdsAfter: readonly string[];
  reasoningAnalyses: readonly ReasoningAnalysis[];
  policyIds: readonly string[];
  recommendationIds: readonly string[];
}

export interface SimulationExplanation {
  recommendationId: string;
  policyId: string;
  findingIds: readonly string[];
  changeStatements: readonly string[];
  validationRulesApplied: readonly ValidationRuleId[];
  conflictIds: readonly string[];
  overlayConstruction: string;
  metricsCompared: readonly string[];
  resolutionBasis: readonly string[];
  regressionBasis: readonly string[];
  scoreExplanation: string;
  outcomeExplanation: string;
}

export interface SimulationResult {
  success: boolean;
  generator: typeof SIMULATION_GENERATOR;
  /** Deterministic: `sim:<canonical hash>:<hash of proposal + parameters>`. */
  simulationId: string;
  proposalId: string;
  graphVersion: number;
  canonicalGraphHashBefore: string;
  canonicalGraphHashAfter: string;
  canonicalGraphHashPreserved: boolean;
  overlayContentHash: string;
  scope: SimulationScope;
  graph: QueryGraphMetadata;
  proposal: ChangeProposal;
  proposedChanges: readonly ProposedChange[];
  validation: ValidationResult;
  conflicts: readonly ProposalConflict[];
  baselineMetrics: SimulationMetrics;
  simulatedMetrics: SimulationMetrics;
  metricDeltas: readonly MetricDelta[];
  resolvedRecommendations: readonly RecommendationResolution[];
  partiallyResolvedRecommendations: readonly RecommendationResolution[];
  unresolvedRecommendations: readonly RecommendationResolution[];
  newFindings: readonly string[];
  residualRisks: readonly ResidualRisk[];
  regressions: readonly RegressionFinding[];
  executionSequence: ProposalSequence;
  score: ProposalScore;
  evidence: readonly ReasoningEvidence[];
  confidence: ReasoningConfidence;
  lineage: SimulationLineage;
  overlay: OverlayConstruction;
  explanation: SimulationExplanation;
  diagnostics: SimulationDiagnostics;
}

/* -------------------------------------------------------------------------- */
/* Alternative comparison                                                      */
/* -------------------------------------------------------------------------- */

export interface AlternativeOutcome {
  proposalId: string;
  variant: string;
  score: ProposalScore;
  metrics: SimulationMetrics;
  deltas: readonly MetricDelta[];
  resolvedRecommendationIds: readonly string[];
  residualRecommendationIds: readonly string[];
  regressions: readonly RegressionFinding[];
  risks: readonly ProposalRisk[];
  complexity: ChangeProposal["complexity"];
  confidence: ReasoningConfidence;
}

export type AlternativeVerdict = "preferred" | "equivalent" | "decision-required";

export interface AlternativeComparison {
  /** Deterministic: `alt:<hash of sorted proposal ids>`. */
  comparisonId: string;
  subject: string;
  alternatives: readonly AlternativeOutcome[];
  verdict: AlternativeVerdict;
  preferredProposalId: string | null;
  rationale: string;
  discriminators: readonly string[];
  canonicalGraphHashPreserved: boolean;
}

/* -------------------------------------------------------------------------- */
/* Shared input contract                                                       */
/* -------------------------------------------------------------------------- */

export interface BaselineSnapshot {
  metrics: SimulationMetrics;
  recommendations: readonly IntelligenceRecommendation[];
  findingIds: readonly string[];
  contentHash: string;
}
