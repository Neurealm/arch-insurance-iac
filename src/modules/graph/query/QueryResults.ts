/**
 * Stage 3.5.3.1 — standard query result contract.
 *
 * Every public engine operation returns the same envelope so consumers can
 * treat all queries uniformly: results, determinism metadata, warnings,
 * performance counters and graph lineage.
 */

import type { CapabilityGraph } from "../types";
import type { GraphPath, QueryErrorCode, TraversalDirection } from "./QueryTypes";

export type QueryWarningCode =
  | QueryErrorCode
  | "results-truncated"
  | "empty-result"
  | "candidate-relationships-included"
  | "depth-limit-reached"
  | "path-limit-reached";

export interface QueryWarning {
  code: QueryWarningCode;
  message: string;
  subject?: string;
}

export interface QueryFilterSummary {
  /** Deterministically ordered list of criteria actually evaluated. */
  criteria: readonly { field: string; operator: string; expected: unknown }[];
  matchMode: "all" | "any";
  ignoredFields: readonly string[];
}

export interface TraversalSummary {
  startNodeId: string | null;
  direction: TraversalDirection;
  strategy: "bfs" | "dfs";
  maxDepth: number;
  reachedDepth: number;
  edgeTypesTraversed: readonly string[];
  visitedNodeCount: number;
  candidateRelationshipsIncluded: boolean;
}

export interface QueryMatchExplanation {
  nodeId: string;
  matchedFilters: readonly {
    field: string;
    operator: string;
    expected: unknown;
    actual: unknown;
  }[];
  searchMatches?: readonly { field: string; matchType: string; score: number }[];
  path?: GraphPath;
  distance?: number;
  rankingBasis?: string;
}

export interface QueryPerformance {
  executionTimeMs: number;
  indexesUsed: readonly string[];
  scannedNodeCount: number;
  scannedEdgeCount: number;
}

export interface QueryGraphMetadata {
  version: number;
  schemaVersion: string;
  generator: string;
  contentHash: string;
  nodeCount: number;
  edgeCount: number;
  candidateEdgeCount: number;
}

export interface QueryResult<T> {
  success: boolean;
  results: readonly T[];
  resultCount: number;
  totalAvailable: number;
  truncated: boolean;
  warnings: readonly QueryWarning[];
  filtersApplied?: QueryFilterSummary;
  traversal?: TraversalSummary;
  explanation?: readonly QueryMatchExplanation[];
  performance: QueryPerformance;
  graph: QueryGraphMetadata;
}

export const graphMetadata = (
  graph: CapabilityGraph,
  candidateEdgeCount: number,
): QueryGraphMetadata => ({
  version: graph.version.version,
  schemaVersion: graph.schemaVersion,
  generator: graph.version.generator,
  contentHash: graph.version.contentHash,
  nodeCount: graph.nodes.length,
  edgeCount: graph.edges.length,
  candidateEdgeCount,
});

export interface ResultEnvelopeInput<T> {
  results: readonly T[];
  totalAvailable: number;
  truncated: boolean;
  warnings: readonly QueryWarning[];
  performance: QueryPerformance;
  graph: QueryGraphMetadata;
  filtersApplied?: QueryFilterSummary;
  traversal?: TraversalSummary;
  explanation?: readonly QueryMatchExplanation[];
  success?: boolean;
}

/** Builds the envelope. A no-match query is an ordinary success. */
export function buildResult<T>(input: ResultEnvelopeInput<T>): QueryResult<T> {
  const warnings = [...input.warnings];
  if (input.truncated && !warnings.some((w) => w.code === "results-truncated")) {
    warnings.push({
      code: "results-truncated",
      message: `Returned ${input.results.length} of ${input.totalAvailable} available results.`,
    });
  }
  return {
    success: input.success ?? true,
    results: input.results,
    resultCount: input.results.length,
    totalAvailable: input.totalAvailable,
    truncated: input.truncated,
    warnings,
    ...(input.filtersApplied ? { filtersApplied: input.filtersApplied } : {}),
    ...(input.traversal ? { traversal: input.traversal } : {}),
    ...(input.explanation ? { explanation: input.explanation } : {}),
    performance: input.performance,
    graph: input.graph,
  };
}

/** A typed failure. Used for unknown start nodes and invalid inputs. */
export function failureResult<T>(
  warnings: readonly QueryWarning[],
  performance: QueryPerformance,
  graph: QueryGraphMetadata,
): QueryResult<T> {
  return {
    success: false,
    results: [],
    resultCount: 0,
    totalAvailable: 0,
    truncated: false,
    warnings,
    performance,
    graph,
  };
}
