/**
 * Stage 3.5.3.2 — Enterprise Graph Reasoning and Analysis Engine: type model.
 *
 * This layer sits *on top of* the Stage 3.5.3.1 query engine. It never mutates
 * the graph, never re-implements traversal, and never uses LLMs, embeddings or
 * statistical inference: every conclusion is derived deterministically from
 * declared, observed or explicitly-labelled candidate facts.
 */

import type { ConfidenceLevel } from "../../types";
import type { GraphEdgeType, GraphNode, GraphNodeType } from "../types";
import type { GraphPath, QueryGraphMetadata, QueryPerformance, QueryWarning } from "../query/index";

/* -------------------------------------------------------------------------- */
/* Analysis identity                                                           */
/* -------------------------------------------------------------------------- */

export const REASONING_ANALYSES = [
  "impact",
  "dependency-chain",
  "critical-nodes",
  "bottlenecks",
  "ownership-propagation",
  "coverage-gaps",
  "circular-dependencies",
  "single-points-of-failure",
  "capability-lineage",
  "route-traceability",
] as const;

export type ReasoningAnalysis = (typeof REASONING_ANALYSES)[number];

export const REASONING_GENERATOR = "src/modules/graph/reasoning@1.0.0" as const;

/* -------------------------------------------------------------------------- */
/* Confidence policy                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Reasoning confidence is derived, never asserted. It is the *weakest* fact
 * confidence on the evidence chain, downgraded one step when any candidate
 * (weakly-inferred) relationship contributed to the conclusion.
 */
export type ReasoningConfidence = ConfidenceLevel;

const CONFIDENCE_ORDER: readonly ReasoningConfidence[] = [
  "high",
  "medium",
  "low",
  "unable-to-verify",
];

export const confidenceRank = (value: ReasoningConfidence): number => {
  const index = CONFIDENCE_ORDER.indexOf(value);
  return index === -1 ? CONFIDENCE_ORDER.length : index;
};

/** Weakest confidence across a set. An empty set is `unable-to-verify`. */
export const weakestConfidence = (
  values: readonly ReasoningConfidence[],
): ReasoningConfidence => {
  if (values.length === 0) return "unable-to-verify";
  return values.reduce((worst, v) => (confidenceRank(v) > confidenceRank(worst) ? v : worst));
};

/** One-step downgrade, used whenever candidate relationships are in play. */
export const downgradeConfidence = (value: ReasoningConfidence): ReasoningConfidence =>
  CONFIDENCE_ORDER[Math.min(confidenceRank(value) + 1, CONFIDENCE_ORDER.length - 1)];

/* -------------------------------------------------------------------------- */
/* Evidence and findings                                                       */
/* -------------------------------------------------------------------------- */

export type EvidenceKind =
  | "node-fact"
  | "edge-fact"
  | "path"
  | "degree"
  | "absence"
  | "candidate-relationship"
  | "aggregate";

export interface ReasoningEvidence {
  kind: EvidenceKind;
  /** Node id, edge id or aggregate label the evidence is about. */
  subject: string;
  statement: string;
  nodeIds?: readonly string[];
  edgeIds?: readonly string[];
  path?: GraphPath;
  confidence: ReasoningConfidence;
  /** True when the evidence rests on a weakly-inferred candidate relationship. */
  candidate: boolean;
}

export type ReasoningSeverity = "info" | "advisory" | "warning" | "critical";

export interface ReasoningFinding {
  /** Deterministic id: `<analysis>:<subject>`. */
  id: string;
  analysis: ReasoningAnalysis;
  severity: ReasoningSeverity;
  subject: string;
  summary: string;
  evidence: readonly ReasoningEvidence[];
  confidence: ReasoningConfidence;
}

export type RecommendationPriority = "P1" | "P2" | "P3";

export interface ReasoningRecommendation {
  /** Deterministic id: `<analysis>:<subject>:<action>`. */
  id: string;
  analysis: ReasoningAnalysis;
  priority: RecommendationPriority;
  subject: string;
  action: string;
  rationale: string;
  /** Node or edge ids the action applies to. */
  targets: readonly string[];
  confidence: ReasoningConfidence;
}

/* -------------------------------------------------------------------------- */
/* Standard reasoning result contract                                          */
/* -------------------------------------------------------------------------- */

export interface ReasoningResult<T> {
  success: boolean;
  analysis: ReasoningAnalysis;
  generator: typeof REASONING_GENERATOR;
  subject: string | null;
  results: readonly T[];
  resultCount: number;
  findings: readonly ReasoningFinding[];
  recommendations: readonly ReasoningRecommendation[];
  warnings: readonly QueryWarning[];
  /** Candidate relationships were followed for this analysis. */
  candidateRelationshipsIncluded: boolean;
  confidence: ReasoningConfidence;
  performance: QueryPerformance;
  graph: QueryGraphMetadata;
}

/* -------------------------------------------------------------------------- */
/* Analysis options                                                            */
/* -------------------------------------------------------------------------- */

export interface ReasoningOptions {
  /** Opt-in use of Stage 3.5.2 candidate edges. Off for every default analysis. */
  includeCandidateRelationships?: boolean;
  maxDepth?: number;
  limit?: number;
  /** Restrict analysis to these node types where the analysis supports it. */
  nodeTypes?: readonly GraphNodeType[];
  /** Restrict analysis to a single owning module. */
  moduleId?: string;
}

export interface ImpactOptions extends ReasoningOptions {
  direction?: "downstream" | "upstream" | "both";
  edgeTypes?: readonly GraphEdgeType[];
  includePaths?: boolean;
}

export interface CriticalityOptions extends ReasoningOptions {
  /** Minimum score (0–100) for inclusion. Default 1. */
  minScore?: number;
}

/* -------------------------------------------------------------------------- */
/* Analysis records                                                            */
/* -------------------------------------------------------------------------- */

export interface ImpactedNodeRecord {
  node: GraphNode;
  depth: number;
  direction: "downstream" | "upstream";
  viaEdgeType: GraphEdgeType | null;
  path?: GraphPath;
  confidence: ReasoningConfidence;
  candidate: boolean;
}

export interface BlastRadius {
  nodeId: string;
  totalImpacted: number;
  directImpacted: number;
  maxDepth: number;
  byNodeType: Readonly<Record<string, number>>;
  byModule: Readonly<Record<string, number>>;
  impactedModuleCount: number;
}

export interface DependencyChainRecord {
  /** Chain from the subject to a terminal dependency, in traversal order. */
  path: GraphPath;
  terminalNodeId: string;
  terminalNodeType: GraphNodeType;
  edgeTypes: readonly GraphEdgeType[];
  crossesModuleBoundary: boolean;
  confidence: ReasoningConfidence;
  candidate: boolean;
}

export interface CriticalNodeRecord {
  node: GraphNode;
  /** 0–100, deterministic composite of reach, fan-in, fan-out and brokerage. */
  score: number;
  dependentCount: number;
  dependencyCount: number;
  downstreamReach: number;
  upstreamReach: number;
  distinctDependentModules: number;
  /** Sole inbound provider for at least one node. */
  soleProvider: boolean;
  basis: readonly string[];
}

export interface BottleneckRecord {
  node: GraphNode;
  fanIn: number;
  fanOut: number;
  /** min(fanIn, fanOut): the throughput a single node mediates. */
  brokerageScore: number;
  mediatedModuleCount: number;
  basis: readonly string[];
}

export interface SinglePointOfFailureRecord {
  node: GraphNode;
  /** Nodes that lose all dependency supply if this node is removed. */
  strandedNodeIds: readonly string[];
  strandedCount: number;
  affectedModules: readonly string[];
  /** True when the node has no redundant sibling providing the same edge type. */
  noRedundantProvider: boolean;
}

export type OwnershipResolution =
  | "declared"
  | "propagated"
  | "conflicting"
  | "unresolved";

export interface OwnershipRecord {
  nodeId: string;
  nodeType: GraphNodeType;
  label: string;
  declaredModuleId: string | null;
  resolvedModuleId: string | null;
  resolution: OwnershipResolution;
  /** Ownership path walked to reach the resolved owner, nearest first. */
  propagationPath: readonly string[];
  candidateOwners: readonly string[];
  confidence: ReasoningConfidence;
}

export type CoverageGapKind =
  | "route-without-capability"
  | "capability-without-implementation"
  | "service-never-consumed"
  | "module-without-persona"
  | "isolated-node"
  | "unowned-implementation";

export interface CoverageGapRecord {
  kind: CoverageGapKind;
  nodeId: string;
  nodeType: GraphNodeType;
  label: string;
  moduleId: string | null;
  rationale: string;
  /** A gap that is expected by design rather than a defect. */
  expected: boolean;
}

export interface CircularDependencyRecord {
  /** Deterministic id: sorted member ids joined by `+`. */
  id: string;
  memberNodeIds: readonly string[];
  size: number;
  edgeIds: readonly string[];
  edgeTypes: readonly GraphEdgeType[];
  spansModules: readonly string[];
  /** Representative cycle path through the component. */
  representativePath: GraphPath;
  confidence: ReasoningConfidence;
  candidate: boolean;
}

export interface LineageStep {
  nodeId: string;
  nodeType: GraphNodeType;
  label: string;
  viaEdgeType: GraphEdgeType | null;
  layer: LineageLayer;
}

export type LineageLayer =
  | "route"
  | "page"
  | "component"
  | "service"
  | "api"
  | "capability"
  | "module"
  | "shared-capability"
  | "platform-capability"
  | "database-entity"
  | "other";

export interface LineageRecord {
  subjectId: string;
  steps: readonly LineageStep[];
  layersCovered: readonly LineageLayer[];
  /** Layers the chain never reaches; the traceability gap. */
  layersMissing: readonly LineageLayer[];
  complete: boolean;
  confidence: ReasoningConfidence;
  candidate: boolean;
}

export interface TraceabilityRecord extends LineageRecord {
  routeId: string;
  routePath: string | null;
  pageId: string | null;
  serviceIds: readonly string[];
  capabilityIds: readonly string[];
  moduleId: string | null;
}
