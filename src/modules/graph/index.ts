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
export { GraphQuery, queryGraph } from "./query";
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
