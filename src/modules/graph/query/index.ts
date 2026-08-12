/**
 * Stage 3.5.3.1 — Graph Query Engine public API.
 *
 * Read-only and deterministic. No visualization, no application behaviour.
 */

export * from "./QueryTypes";
export * from "./QueryResults";
export {
  buildGraphIndexes,
  candidateAsEdge,
  type GraphIndexes,
} from "./GraphIndexes";
export {
  compileCriteria,
  evaluateCriteria,
  matchProperty,
  matchText,
  normalize,
  selectorValues,
  tokenize,
  isSupportedField,
  type Criterion,
  type RelationalLookup,
} from "./QueryFilters";
export { traverse, shortestPath, allPaths, resolveMaxDepth, type TraversalRun } from "./GraphTraversal";
export { searchNodes, type SearchHit, type SearchMatchDetail } from "./GraphSearch";
export {
  GraphQueryEngine,
  createQueryEngine,
  getQueryEngine,
  __resetQueryEngineCache,
  type QueryEngineInput,
} from "./QueryEngine";
