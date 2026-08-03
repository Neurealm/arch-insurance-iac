/**
 * Stage 3.5.1 — Capability Relationship Graph public API.
 *
 * Data model and services only. No visualization, no application behaviour.
 */

export * from "./types";
export { validateGraph } from "./validate";
export {
  buildCapabilityGraph,
  getCapabilityGraph,
  __resetGraphCache,
  GRAPH_GENERATOR,
  type BuildGraphInput,
} from "./build";
export { GraphQuery, queryGraph } from "./query/LegacyGraphQuery";
export {
  computeGraphHash,
  deserializeGraph,
  diffGraphs,
  nextGraphVersion,
  serializeGraph,
  type DeserializeResult,
  type GraphDiff,
  type VersionInput,
} from "./serialize";

/* Stage 3.5.2 — population, reconciliation, orphan analysis and statistics. */
export * from "./populationTypes";
export {
  populateCapabilityGraph,
  getPopulatedGraph,
  __resetPopulationCache,
  POPULATION_GENERATOR,
  type PopulateInput,
} from "./populate";
export { reconcileGraph, nodeDegrees } from "./reconcile";
export { analyzeOrphans } from "./orphans";
export { graphStatistics, graphStatisticsJson, connectedComponents, maxDepth } from "./statistics";
export { buildSreGraphSlice, SRE_MODULE_ID } from "./sreSlice";

/* Stage 3.5.3.1 — deterministic read-only query engine. */
export {
  GraphQueryEngine,
  createQueryEngine,
  getQueryEngine,
  __resetQueryEngineCache,
  GraphQueryError,
  RELATIONSHIP_SEMANTICS,
  DEPENDENCY_EDGE_TYPES,
  IMPACT_EDGE_TYPES,
  UNSUPPORTED_ATTRIBUTE_FIELDS,
  type QueryEngineInput,
  type QueryResult,
  type QueryWarning,
  type QueryMatchExplanation,
  type QueryPerformance,
  type QueryFilterSummary,
  type TraversalSummary,
  type NodeQueryFilters,
  type NodeQueryOptions,
  type TraversalQueryOptions,
  type PathQueryOptions,
  type SearchOptions,
  type GraphPath,
  type TraversalHitRecord,
  type LabelledEdge,
  type RelationshipSemantics,
} from "./query/index";

/* Stage 3.5.3.2 — deterministic reasoning and analysis engine. */
export * from "./reasoning/index";

