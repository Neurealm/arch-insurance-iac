/**
 * Stage 3.5.3.5 — Controlled Change Plan and Patch Specification: type model.
 *
 * This layer converts validated Stage 3.5.3.4 simulation proposals into
 * structured, reviewable change plans and machine-readable patch
 * specifications. It is planning-only: it never mutates the canonical graph,
 * never mutates simulation results, never touches repository files, never
 * applies a patch, and contains no clocks, randomness, network, LLM or
 * embedding behaviour.
 */

import type { GraphNodeType } from "../types";
import type { ReasoningAnalysis, ReasoningConfidence, ReasoningEvidence } from "../reasoning/index";
import type { PriorityBand, RecommendationCategory } from "../intelligence/index";
import type {
  ChangeOperation,
  MetricDelta,
  ProposalScore,
  RecommendationResolution,
  RegressionFinding,
  SimulationMetrics,
  ValidationResult,
} from "../simulation/index";

export const CHANGE_PLAN_GENERATOR = "src/modules/graph/change-plan@1.0.0" as const;

/* -------------------------------------------------------------------------- */
/* Deterministic helpers                                                       */
/* -------------------------------------------------------------------------- */

/** FNV-1a (32-bit), hex encoded. Deterministic and dependency free. */
export function planHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export const planSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96) || "none";

export const planSortedUnique = (values: readonly string[]): readonly string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));

export const byString = (a: string, b: string): number => a.localeCompare(b);

/* -------------------------------------------------------------------------- */
/* Plan status                                                                 */
/* -------------------------------------------------------------------------- */

export const PLAN_STATUSES = [
  "draft",
  "blocked",
  "ready-for-review",
  "approved-for-implementation",
  "rejected",
  "superseded",
  "partially-implemented",
  "implemented",
  "validation-failed",
  "rolled-back",
] as const;

export type PlanStatus = (typeof PLAN_STATUSES)[number];

/** Statuses this stage is permitted to emit. */
export const EMITTABLE_PLAN_STATUSES = ["draft", "blocked", "ready-for-review"] as const;

export type EmittablePlanStatus = (typeof EMITTABLE_PLAN_STATUSES)[number];

/** Declarative transition table. Documented and asserted, never executed here. */
export const PLAN_STATUS_TRANSITIONS: Readonly<Record<PlanStatus, readonly PlanStatus[]>> = {
  draft: ["draft", "blocked", "ready-for-review", "rejected", "superseded"],
  blocked: ["blocked", "draft", "ready-for-review", "rejected", "superseded"],
  "ready-for-review": [
    "approved-for-implementation",
    "blocked",
    "rejected",
    "superseded",
    "draft",
  ],
  "approved-for-implementation": [
    "partially-implemented",
    "implemented",
    "validation-failed",
    "rejected",
    "superseded",
  ],
  rejected: ["superseded"],
  superseded: [],
  "partially-implemented": ["implemented", "validation-failed", "rolled-back"],
  implemented: ["validation-failed", "rolled-back"],
  "validation-failed": ["rolled-back", "partially-implemented", "rejected"],
  "rolled-back": ["draft", "superseded"],
};

export const isValidPlanTransition = (from: PlanStatus, to: PlanStatus): boolean =>
  PLAN_STATUS_TRANSITIONS[from].includes(to);

/* -------------------------------------------------------------------------- */
/* Scope                                                                       */
/* -------------------------------------------------------------------------- */

export const PLAN_SCOPE_KINDS = [
  "graph",
  "node",
  "route",
  "page",
  "service",
  "capability",
  "platform",
  "module",
  "owner",
  "recommendation",
  "proposal",
  "bundle",
  "artifact",
] as const;

export type PlanScopeKind = (typeof PLAN_SCOPE_KINDS)[number];

export interface PlanScope {
  kind: PlanScopeKind;
  subject: string | null;
  resolvedNodeIds: readonly string[];
  /** Why the scope resolved the way it did. */
  explanation: string;
}

/* -------------------------------------------------------------------------- */
/* Source references                                                           */
/* -------------------------------------------------------------------------- */

export interface SourceSimulationReference {
  simulationId: string;
  canonicalGraphHash: string;
  graphVersion: number;
  overlayContentHash: string;
  validationOutcome: ValidationResult["outcome"];
  scoreBand: ProposalScore["band"];
  score: number;
}

export interface SourceProposalReference {
  proposalId: string;
  bundleId: string | null;
  variant: string;
  kind: string;
  subject: string;
  alternativeProposalIds: readonly string[];
  selectedFromComparisonId: string | null;
  changeIds: readonly string[];
}

export interface SourceRecommendationReference {
  recommendationId: string;
  policyId: string;
  category: RecommendationCategory;
  priority: PriorityBand;
  priorityScore: number;
  findingIds: readonly string[];
  reasoningAnalyses: readonly ReasoningAnalysis[];
}

/* -------------------------------------------------------------------------- */
/* Artifacts                                                                   */
/* -------------------------------------------------------------------------- */

export const ARTIFACT_TYPES = [
  "module-manifest",
  "shared-capability-registry",
  "platform-capability-registry",
  "capability-hierarchy",
  "route-registry",
  "implementation-inventory",
  "candidate-edge-registry",
  "governance-registry",
  "graph-builder",
  "graph-population",
  "graph-validation-fixture",
  "test-suite",
  "documentation",
  "source-file",
  "unresolved",
] as const;

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export const ARTIFACT_MAPPING_METHODS = [
  "registry-metadata",
  "node-provenance",
  "graph-source-reference",
  "path-convention",
  "documentation-reference",
  "declared-catalog",
  "none",
] as const;

export type ArtifactMappingMethod = (typeof ARTIFACT_MAPPING_METHODS)[number];

export type MappingConfidence = ReasoningConfidence;

export interface ArtifactLocator {
  /** Repository-relative path. Never invented; `null` when unresolved. */
  path: string | null;
  type: ArtifactType;
  /** True when this file is the system of record for the change. */
  authoritative: boolean;
  method: ArtifactMappingMethod;
  confidence: MappingConfidence;
  evidence: readonly ReasoningEvidence[];
}

export interface ArtifactMapping {
  /** Deterministic: `map:<slug(entityId)>:<hash>`. */
  id: string;
  entityId: string;
  entityType: GraphNodeType | "graph";
  operation: ChangeOperation;
  resolved: boolean;
  /** Chosen authoritative artifact, when exactly one is deterministic. */
  selected: ArtifactLocator | null;
  candidates: readonly ArtifactLocator[];
  multipleCandidates: boolean;
  humanSelectionRequired: boolean;
  explanation: string;
}

/* -------------------------------------------------------------------------- */
/* Target selectors                                                            */
/* -------------------------------------------------------------------------- */

export const SELECTOR_TYPES = [
  "registry-record-id",
  "route-path",
  "module-id",
  "capability-id",
  "service-id",
  "platform-id",
  "owner-id",
  "relationship-tuple",
  "json-object-path",
  "typescript-exported-constant",
  "manifest-entry",
  "test-fixture-id",
  "documentation-heading",
  "unresolved",
] as const;

export type SelectorType = (typeof SELECTOR_TYPES)[number];

export type SelectorAmbiguity = "unambiguous" | "ambiguous" | "unresolved";

export type SelectorFailureBehavior = "block-patch" | "require-human-selection" | "abort-plan";

export interface TargetSelector {
  type: SelectorType;
  value: string;
  /** Number of matches the patch requires in the target artifact. */
  expectedMatchCount: number;
  evidence: readonly ReasoningEvidence[];
  ambiguity: SelectorAmbiguity;
  failureBehavior: SelectorFailureBehavior;
  explanation: string;
}

/* -------------------------------------------------------------------------- */
/* Preconditions and postconditions                                            */
/* -------------------------------------------------------------------------- */

export const PRECONDITION_KINDS = [
  "canonical-graph-hash-matches",
  "artifact-exists",
  "target-exists",
  "target-count-matches",
  "before-state-matches",
  "parameters-resolved",
  "approvals-present",
  "no-superseding-plan",
  "dependent-steps-complete",
  "simulation-still-valid",
] as const;

export type PreconditionKind = (typeof PRECONDITION_KINDS)[number];

export const POSTCONDITION_KINDS = [
  "declaration-exists",
  "declaration-absent",
  "endpoint-policy-satisfied",
  "graph-validation-passes",
  "graph-regenerates",
  "expected-entities-exist",
  "recommendation-resolved",
  "no-prohibited-regression",
  "metrics-within-tolerance",
  "content-hash-changes-only-where-expected",
] as const;

export type PostconditionKind = (typeof POSTCONDITION_KINDS)[number];

export interface PatchPrecondition {
  kind: PreconditionKind;
  subject: string;
  statement: string;
  /** Deterministically checkable now (planning time) or only at execution. */
  checkable: "planning-time" | "execution-time";
  satisfied: boolean | null;
  evidence: readonly ReasoningEvidence[];
}

export interface PatchPostcondition {
  kind: PostconditionKind;
  subject: string;
  statement: string;
  evidence: readonly ReasoningEvidence[];
}

/* -------------------------------------------------------------------------- */
/* Patch specification                                                         */
/* -------------------------------------------------------------------------- */

export const PATCH_OPERATIONS = [
  "add-record",
  "update-record",
  "remove-record",
  "add-relationship",
  "update-relationship",
  "remove-relationship",
  "add-ownership-declaration",
  "replace-ownership-declaration",
  "add-registration",
  "update-registration",
  "remove-registration",
  "add-expected-by-design-exception",
  "remove-expected-by-design-exception",
  "promote-candidate-relationship",
  "reject-candidate-relationship",
  "add-test-fixture",
  "update-test-fixture",
  "add-documentation-entry",
  "update-documentation-entry",
] as const;

export type PatchOperation = (typeof PATCH_OPERATIONS)[number];

export type PatchStatus = "specified" | "blocked" | "manual-review-required";

export interface PatchConflict {
  /** Deterministic: `pcf:<kind>:<hash>`. */
  id: string;
  kind:
    | "same-target"
    | "divergent-owner"
    | "incompatible-relationship"
    | "overlapping-removal"
    | "unresolved-artifact";
  patchIds: readonly string[];
  subject: string;
  explanation: string;
}

export interface RollbackSpecification {
  /** Deterministic: `rbk:<patchId>`. */
  id: string;
  patchId: string;
  /** Reverse semantic operation, or null when no deterministic inverse exists. */
  reverseOperation: PatchOperation | null;
  reversible: boolean;
  manualRollbackRequired: boolean;
  requiredBeforeStateEvidence: readonly string[];
  requiredAfterStateEvidence: readonly string[];
  /** Lower runs first within the rollback sequence. */
  order: number;
  dependentPatchIds: readonly string[];
  graphRegenerationRequired: boolean;
  validationRequirements: readonly string[];
  risks: readonly string[];
  limitations: readonly string[];
  explanation: string;
}

export interface PatchSpecification {
  /** Deterministic: `patch:<planId-suffix>:<operation>:<hash>`. */
  id: string;
  planId: string;
  stepId: string;
  changeId: string;
  operation: PatchOperation;
  sourceOperation: ChangeOperation;
  artifact: ArtifactLocator;
  artifactType: ArtifactType;
  selector: TargetSelector;
  status: PatchStatus;
  blockers: readonly string[];
  /** Semantic description of the state the patch expects to find. */
  beforeState: PatchStateExpectation;
  /** Semantic description of the intended state after application. */
  afterState: PatchStateExpectation;
  preconditions: readonly PatchPrecondition[];
  postconditions: readonly PatchPostcondition[];
  validationRules: readonly string[];
  rollback: RollbackSpecification;
  evidence: readonly ReasoningEvidence[];
  confidence: ReasoningConfidence;
  lineage: PlanLineage;
  explanation: string;
}

export interface PatchStateExpectation {
  /** `absent`, `present` or `present-with-value`. */
  kind: "absent" | "present" | "present-with-value";
  subject: string;
  /** Typed semantic fields; never raw source text. */
  fields: Readonly<Record<string, string | number | boolean | null>>;
  statement: string;
}

/* -------------------------------------------------------------------------- */
/* Workstreams and steps                                                       */
/* -------------------------------------------------------------------------- */

export const WORKSTREAM_KINDS = [
  "ownership-remediation",
  "route-registration",
  "page-registration",
  "service-registration",
  "capability-registration",
  "platform-registration",
  "module-registration",
  "lineage-remediation",
  "resilience-remediation",
  "dependency-remediation",
  "candidate-edge-adjudication",
  "expected-by-design-governance",
  "test-updates",
  "documentation-updates",
  "graph-regeneration",
  "graph-validation",
] as const;

export type WorkstreamKind = (typeof WORKSTREAM_KINDS)[number];

export type RiskClassification = "low" | "moderate" | "high" | "critical";

export interface PlanRisk {
  /** Deterministic: `prsk:<slug(subject)>:<hash>`. */
  id: string;
  classification: RiskClassification;
  subject: string;
  statement: string;
  entityIds: readonly string[];
  mitigations: readonly string[];
}

export interface StepDependency {
  stepId: string;
  reason: string;
}

export interface StepPrerequisite {
  kind: "parameter" | "approval" | "artifact" | "step" | "baseline";
  subject: string;
  statement: string;
  satisfied: boolean;
}

export interface StepValidation {
  kind:
    | "type-check"
    | "unit-test"
    | "graph-schema-validation"
    | "graph-endpoint-policy"
    | "graph-builder"
    | "query-engine-test"
    | "reasoning-engine-test"
    | "intelligence-engine-test"
    | "simulation-engine-test"
    | "change-plan-test"
    | "determinism-check"
    | "graph-hash-check"
    | "recommendation-resolution-check"
    | "regression-check"
    | "metric-delta-comparison"
    | "artifact-validation"
    | "documentation-validation";
  statement: string;
  /** Only set when the command exists in the repository. */
  command: string | null;
  /** Rule identifier when no repository command exists. */
  rule: string | null;
  derivation: string;
}

export interface StepRollbackInstruction {
  statement: string;
  reverseOperation: PatchOperation | null;
  manual: boolean;
  order: number;
}

export interface ChangeStep {
  /** Deterministic: `step:<planId-suffix>:<order padded>:<slug(title)>`. */
  id: string;
  order: number;
  workstreamId: string;
  workstreamKind: WorkstreamKind;
  title: string;
  description: string;
  operation: ChangeOperation | null;
  patchIds: readonly string[];
  targetArtifactPaths: readonly string[];
  targetEntityIds: readonly string[];
  preconditions: readonly StepPrerequisite[];
  requiredInputs: readonly string[];
  dependencies: readonly StepDependency[];
  parallelizable: boolean;
  expectedResult: string;
  validations: readonly StepValidation[];
  rollback: StepRollbackInstruction;
  risk: RiskClassification;
  confidence: ReasoningConfidence;
  evidence: readonly ReasoningEvidence[];
  lineage: PlanLineage;
  explanation: string;
}

export interface ChangeObjective {
  /** Deterministic: `obj:<slug(subject)>:<hash>`. */
  id: string;
  statement: string;
  recommendationIds: readonly string[];
  policyIds: readonly string[];
  expectedMetricKeys: readonly string[];
  evidence: readonly ReasoningEvidence[];
}

export interface ExpectedMetricEffect {
  key: string;
  direction: "increase" | "decrease" | "unchanged";
  baseline: number;
  simulated: number;
  delta: number;
  statement: string;
}

export interface ChangeWorkstream {
  /** Deterministic: `ws:<planId-suffix>:<kind>`. */
  id: string;
  kind: WorkstreamKind;
  objective: string;
  changeIds: readonly string[];
  operations: readonly ChangeOperation[];
  artifactPaths: readonly string[];
  stepIds: readonly string[];
  dependencies: readonly string[];
  preconditions: readonly StepPrerequisite[];
  validationCriteria: readonly string[];
  rollbackCriteria: readonly string[];
  requiredApprovalIds: readonly string[];
  expectedMetricEffects: readonly ExpectedMetricEffect[];
  risks: readonly PlanRisk[];
  evidence: readonly ReasoningEvidence[];
}

/* -------------------------------------------------------------------------- */
/* Validation plan                                                             */
/* -------------------------------------------------------------------------- */

export interface ValidationCheckpoint {
  /** Deterministic: `chk:<order padded>:<kind>`. */
  id: string;
  order: number;
  kind: StepValidation["kind"];
  statement: string;
  command: string | null;
  rule: string | null;
  blocking: boolean;
  appliesToStepIds: readonly string[];
  derivation: string;
}

export interface RollbackCheckpoint {
  /** Deterministic: `rchk:<order padded>:<slug(subject)>`. */
  id: string;
  order: number;
  subject: string;
  statement: string;
  patchIds: readonly string[];
  manual: boolean;
}

export interface RollbackPlan {
  /** Deterministic: `rbp:<planId-suffix>`. */
  id: string;
  stepRollbacks: readonly RollbackSpecification[];
  workstreamRollbackOrder: readonly string[];
  fullPlanRollbackOrder: readonly string[];
  reverseDependencyOrder: readonly string[];
  checkpoints: readonly RollbackCheckpoint[];
  partialRollbackConstraints: readonly string[];
  manualRollbackPatchIds: readonly string[];
  graphRegenerationRequired: boolean;
  risks: readonly PlanRisk[];
  limitations: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Tolerances                                                                  */
/* -------------------------------------------------------------------------- */

export const TOLERANCE_KEYS = [
  "nodeCount",
  "edgeCount",
  "ownershipResolutionRate",
  "routeTraceabilityRate",
  "coverageGapCount",
  "singlePointOfFailureCount",
  "dependencyCycleCount",
  "recommendationCount",
  "priorityScoreTotal",
  "confidence",
  "incidentalChanges",
] as const;

export type ToleranceKey = (typeof TOLERANCE_KEYS)[number];

export interface ToleranceRule {
  key: ToleranceKey;
  /** Absolute allowance around the simulated value. */
  absolute: number;
  /** Fractional allowance (0–1) around the simulated value. */
  relative: number;
  /** A metric that must never get worse than simulated. */
  regressionProhibited: boolean;
  statement: string;
}

export type ComparisonOutcome =
  | "exact-match"
  | "within-tolerance"
  | "material-deviation"
  | "regression"
  | "invalid-comparison";

export interface ToleranceComparison {
  key: ToleranceKey;
  approved: number;
  observed: number;
  delta: number;
  allowed: number;
  outcome: ComparisonOutcome;
  statement: string;
}

export interface ImplementationComparison {
  outcome: ComparisonOutcome;
  comparisons: readonly ToleranceComparison[];
  criticalRegressionKeys: readonly string[];
  explanation: string;
}

/* -------------------------------------------------------------------------- */
/* Approvals                                                                   */
/* -------------------------------------------------------------------------- */

export const APPROVAL_ROLES = [
  "module-owner",
  "capability-owner",
  "platform-owner",
  "architecture-reviewer",
  "graph-governance-reviewer",
  "security-reviewer",
  "repository-maintainer",
] as const;

export type ApprovalRole = (typeof APPROVAL_ROLES)[number];

export const APPROVAL_TRIGGERS = [
  "change-category",
  "priority",
  "risk",
  "affected-entity-count",
  "artifact-type",
  "cross-module-impact",
  "ownership-change",
  "removal-operation",
  "resilience-impact",
  "candidate-edge-decision",
  "expected-by-design-exception",
  "regression-exposure",
] as const;

export type ApprovalTrigger = (typeof APPROVAL_TRIGGERS)[number];

export interface ApprovalRequirement {
  /** Deterministic: `apr:<role>:<slug(subject)>`. */
  id: string;
  role: ApprovalRole;
  subject: string;
  triggers: readonly ApprovalTrigger[];
  /** Real assignee only when deterministically present in graph/registry data. */
  assignee: string | null;
  assigneeSource: "module-manifest" | "graph-node" | "unresolved";
  mandatory: boolean;
  /** True when no assignee could be resolved; this blocks the plan. */
  blocker: boolean;
  rationale: string;
  evidence: readonly ReasoningEvidence[];
}

export type ApprovalDecisionState = "pending" | "approved" | "rejected";

export interface ApprovalDecision {
  requirementId: string;
  state: ApprovalDecisionState;
  decidedBy: string | null;
  rationale: string;
}

/* -------------------------------------------------------------------------- */
/* Conflicts and drift                                                         */
/* -------------------------------------------------------------------------- */

export const PLAN_CONFLICT_TYPES = [
  "competing-alternatives",
  "same-source-record",
  "divergent-owner-assignment",
  "incompatible-relationship",
  "baseline-hash-mismatch",
  "superseded-by-newer-simulation",
  "artifact-precondition-mismatch",
  "conflicting-metric-expectation",
  "overlapping-removal-and-update",
] as const;

export type PlanConflictType = (typeof PLAN_CONFLICT_TYPES)[number];

export type PlanConflictSeverity = "advisory" | "warning" | "blocking";

export interface PlanConflict {
  /** Deterministic: `pcl:<type>:<hash of sorted participants>`. */
  id: string;
  type: PlanConflictType;
  severity: PlanConflictSeverity;
  planIds: readonly string[];
  patchIds: readonly string[];
  subjects: readonly string[];
  explanation: string;
  resolutionOptions: readonly string[];
}

export const DRIFT_KINDS = [
  "canonical-hash-changed",
  "artifact-changed",
  "selector-unresolved",
  "recommendation-changed",
  "recommendation-disappeared",
  "score-changed",
  "new-regression",
  "baseline-mismatch",
] as const;

export type DriftKind = (typeof DRIFT_KINDS)[number];

export type DriftClassification =
  | "none"
  | "nonmaterial"
  | "review-required"
  | "resimulation-required"
  | "plan-invalidated";

export interface DriftFinding {
  /** Deterministic: `drf:<kind>:<slug(subject)>`. */
  id: string;
  kind: DriftKind;
  subject: string;
  expected: string;
  observed: string;
  classification: DriftClassification;
  statement: string;
}

export interface DriftReport {
  planId: string;
  classification: DriftClassification;
  findings: readonly DriftFinding[];
  explanation: string;
}

/* -------------------------------------------------------------------------- */
/* Blockers, evidence, lineage, diagnostics                                    */
/* -------------------------------------------------------------------------- */

export const BLOCKER_KINDS = [
  "invalid-proposal",
  "incomplete-proposal",
  "conflicting-proposal",
  "not-recommended-proposal",
  "critical-regression",
  "unresolved-artifact-mapping",
  "ambiguous-selector",
  "unresolved-approval-role",
  "conditional-proposal",
  "baseline-drift",
] as const;

export type BlockerKind = (typeof BLOCKER_KINDS)[number];

export interface PlanBlocker {
  /** Deterministic: `blk:<kind>:<slug(subject)>`. */
  id: string;
  kind: BlockerKind;
  subject: string;
  statement: string;
  resolutionOptions: readonly string[];
}

export interface PlanEvidence {
  recommendationEvidence: readonly ReasoningEvidence[];
  simulationEvidence: readonly ReasoningEvidence[];
  artifactEvidence: readonly ReasoningEvidence[];
  metricEvidence: readonly MetricDelta[];
  resolutionEvidence: readonly RecommendationResolution[];
  regressionEvidence: readonly RegressionFinding[];
}

export interface PlanLineage {
  graphVersion: number;
  canonicalGraphHash: string;
  overlayContentHash: string;
  recommendationIds: readonly string[];
  policyIds: readonly string[];
  findingIds: readonly string[];
  proposalIds: readonly string[];
  simulationIds: readonly string[];
  reasoningAnalyses: readonly ReasoningAnalysis[];
  nodeIds: readonly string[];
  edgeIds: readonly string[];
}

export interface PlanDiagnostics {
  notes: readonly string[];
  unresolvedArtifactEntityIds: readonly string[];
  unresolvedParameters: readonly string[];
  skippedChangeIds: readonly string[];
  /** Always true; the layer has no clock, randomness, IO, network or LLM. */
  deterministic: true;
  /** Always true; the layer never writes to the repository. */
  repositoryImmutable: true;
  generator: typeof CHANGE_PLAN_GENERATOR;
}

export interface PlanExplanation {
  initiatingRecommendations: readonly string[];
  generatingPolicies: readonly string[];
  supportingFindings: readonly string[];
  selectedProposal: string;
  proposalPassedSimulationBecause: string;
  expectedResolutions: readonly string[];
  expectedMetricImprovements: readonly string[];
  artifactSelectionRationale: readonly string[];
  stepRationale: readonly string[];
  orderingRationale: string;
  approvalRationale: readonly string[];
  validationDerivation: readonly string[];
  rollbackDerivation: readonly string[];
  statusRationale: string;
  lineageStatement: string;
}

/* -------------------------------------------------------------------------- */
/* Execution constraints                                                       */
/* -------------------------------------------------------------------------- */

export interface ExecutionConstraint {
  kind:
    | "sequential-only"
    | "requires-approval-first"
    | "requires-graph-regeneration"
    | "no-partial-application"
    | "single-artifact-writer";
  subject: string;
  statement: string;
}

/* -------------------------------------------------------------------------- */
/* Plan version and request                                                    */
/* -------------------------------------------------------------------------- */

export interface PlanVersion {
  /** Monotonic within a material-input identity; always 1 for a fresh plan. */
  version: number;
  /** Hash of material inputs; changes when the plan content changes. */
  materialHash: string;
  generator: typeof CHANGE_PLAN_GENERATOR;
  previousMaterialHash: string | null;
}

export interface ChangePlanRequest {
  scope?: { kind: PlanScopeKind; subject?: string | null };
  /** Restricts plan generation to this subset of proposal change ids. */
  changeIds?: readonly string[];
  /** Bindings applied to the proposal before planning. */
  parameters?: Readonly<Record<string, string>>;
  /** Baseline the plan is expected to apply against. Defaults to canonical. */
  expectedBaselineHash?: string;
  /** Overrides the default tolerance rule set. */
  tolerances?: readonly ToleranceRule[];
  /** Plans that already exist, used for supersession and conflict detection. */
  existingPlans?: readonly ChangePlan[];
}

/* -------------------------------------------------------------------------- */
/* The plan envelope                                                           */
/* -------------------------------------------------------------------------- */

export interface ChangePlan {
  generator: typeof CHANGE_PLAN_GENERATOR;
  /** Deterministic: `plan:<canonicalHash>:<materialHash>`. */
  id: string;
  version: PlanVersion;
  status: EmittablePlanStatus;
  graphVersion: number;
  canonicalGraphHash: string;
  sourceSimulation: SourceSimulationReference;
  sourceProposals: readonly SourceProposalReference[];
  sourceRecommendations: readonly SourceRecommendationReference[];
  scope: PlanScope;
  title: string;
  objectives: readonly ChangeObjective[];
  workstreams: readonly ChangeWorkstream[];
  steps: readonly ChangeStep[];
  patches: readonly PatchSpecification[];
  artifactMappings: readonly ArtifactMapping[];
  artifactTargets: readonly string[];
  dependencies: readonly { stepId: string; dependsOn: readonly string[] }[];
  preconditions: readonly PatchPrecondition[];
  postconditions: readonly PatchPostcondition[];
  validationCheckpoints: readonly ValidationCheckpoint[];
  rollbackPlan: RollbackPlan;
  executionConstraints: readonly ExecutionConstraint[];
  tolerances: readonly ToleranceRule[];
  risks: readonly PlanRisk[];
  conflicts: readonly PlanConflict[];
  patchConflicts: readonly PatchConflict[];
  blockers: readonly PlanBlocker[];
  requiredApprovals: readonly ApprovalRequirement[];
  approvalDecisions: readonly ApprovalDecision[];
  baselineMetrics: SimulationMetrics;
  simulatedMetrics: SimulationMetrics;
  metricDeltas: readonly MetricDelta[];
  evidence: PlanEvidence;
  confidence: ReasoningConfidence;
  lineage: PlanLineage;
  explanation: PlanExplanation;
  diagnostics: PlanDiagnostics;
}

export interface PlanComparison {
  /** Deterministic: `pcmp:<hash of sorted plan ids>`. */
  id: string;
  planIds: readonly string[];
  identical: boolean;
  sharedArtifactPaths: readonly string[];
  divergentArtifactPaths: readonly string[];
  statusDifferences: readonly { planId: string; status: EmittablePlanStatus }[];
  conflicts: readonly PlanConflict[];
  explanation: string;
}
