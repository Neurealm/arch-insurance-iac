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
