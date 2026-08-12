/**
 * Stage 3.5.3.1 — Enterprise Capability Graph Query Engine.
 *
 * A read-only, deterministic, strongly typed query surface over the Stage 3.5.2
 * populated graph. The engine never mutates the graph, never infers new
 * relationships, and never invents attributes that the schema does not carry.
 * Identical inputs always produce identical, identically ordered output.
 */

import type { CapabilityGraph, GraphEdge, GraphEdgeType, GraphNode, GraphNodeType } from "../types";
import type { CandidateEdge } from "../populationTypes";
import { getPopulatedGraph } from "../populate";
import { buildGraphIndexes, candidateAsEdge, type GraphIndexes } from "./GraphIndexes";
import { compileCriteria, evaluateCriteria, normalize, type RelationalLookup } from "./QueryFilters";
import { allPaths, resolveMaxDepth, shortestPath, traverse } from "./GraphTraversal";
import { searchNodes } from "./GraphSearch";
import {
  buildResult,
  failureResult,
  graphMetadata,
  type QueryFilterSummary,
  type QueryGraphMetadata,
  type QueryMatchExplanation,
  type QueryPerformance,
  type QueryResult,
  type QueryWarning,
  type TraversalSummary,
} from "./QueryResults";
import {
  DEPENDENCY_EDGE_TYPES,
  GraphQueryError,
  IMPACT_EDGE_TYPES,
  RELATIONSHIP_SEMANTICS,
  isKnownEdgeType,
  isKnownNodeType,
  type GraphPath,
  type LabelledEdge,
  type NodeQueryFilters,
  type NodeQueryOptions,
  type PathQueryOptions,
  type QueryValidationIssue,
  type SearchOptions,
  type TraversalHitRecord,
  type TraversalQueryOptions,
} from "./QueryTypes";

const now = (): number => (typeof performance !== "undefined" ? performance.now() : Date.now());

/** Canonical node ordering used by every non-ranked query. */
const compareNodes = (a: GraphNode, b: GraphNode): number =>
  a.type.localeCompare(b.type) || a.id.localeCompare(b.id);

const compareEdges = (a: GraphEdge, b: GraphEdge): number =>
  a.type.localeCompare(b.type) || a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.id.localeCompare(b.id);

interface Paged<T> {
  page: readonly T[];
  totalAvailable: number;
  truncated: boolean;
}

function paginate<T>(items: readonly T[], limit?: number, offset?: number): Paged<T> {
  const start = offset ?? 0;
  const end = limit === undefined ? items.length : start + limit;
  const page = items.slice(start, end);
  return { page, totalAvailable: items.length, truncated: page.length < items.length };
}

export interface QueryEngineInput {
  graph?: CapabilityGraph;
  candidateEdges?: readonly CandidateEdge[];
}

export class GraphQueryEngine {
  private readonly graph: CapabilityGraph;
  private readonly candidateEdges: readonly CandidateEdge[];
  private readonly indexes: GraphIndexes;
  private readonly metadata: QueryGraphMetadata;
  private readonly lookup: RelationalLookup;

  constructor(input: QueryEngineInput = {}) {
    if (input.graph) {
      this.graph = input.graph;
      this.candidateEdges = input.candidateEdges ?? [];
    } else {
      const populated = getPopulatedGraph();
      this.graph = populated.graph;
      this.candidateEdges = input.candidateEdges ?? populated.candidateEdges;
    }
    this.indexes = buildGraphIndexes(this.graph, this.candidateEdges);
    this.metadata = graphMetadata(this.graph, this.candidateEdges.length);
    this.lookup = {
      personaMembers: (value) => new Set((this.indexes.nodesByPersona.get(value) ?? []).map((n) => n.id)),
      serviceMembers: (value) => new Set((this.indexes.nodesByService.get(value) ?? []).map((n) => n.id)),
    };
  }

  /* ------------------------------------------------------------- metadata */

  get source(): CapabilityGraph {
    return this.graph;
  }

  get graphMetadata(): QueryGraphMetadata {
    return this.metadata;
  }

  /** Semantic class of a relationship type, from the fixed policy table. */
  relationshipSemantics(type: GraphEdgeType) {
    return RELATIONSHIP_SEMANTICS[type];
  }

  /* ------------------------------------------------------------ internals */

  private perf(startedAt: number, indexesUsed: readonly string[], scannedNodeCount = 0, scannedEdgeCount = 0): QueryPerformance {
    return {
      executionTimeMs: Math.max(0, now() - startedAt),
      indexesUsed,
      scannedNodeCount,
      scannedEdgeCount,
    };
  }

  private emptyWarning(count: number, subject: string): readonly QueryWarning[] {
    return count === 0
      ? [{ code: "empty-result" as const, message: `No nodes matched ${subject}.`, subject }]
      : [];
  }

  private validatePagination(options: { limit?: number; offset?: number }): QueryValidationIssue[] {
    const issues: QueryValidationIssue[] = [];
    if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 0)) {
      issues.push({ code: "invalid-limit", field: "limit", message: "limit must be a non-negative integer" });
    }
    if (options.offset !== undefined && (!Number.isInteger(options.offset) || options.offset < 0)) {
      issues.push({ code: "invalid-offset", field: "offset", message: "offset must be a non-negative integer" });
    }
    return issues;
  }

  private validateTraversal(options: TraversalQueryOptions): QueryValidationIssue[] {
    const issues = this.validatePagination(options);
    if (options.maxDepth !== undefined && (!Number.isInteger(options.maxDepth) || options.maxDepth < 0)) {
      issues.push({ code: "invalid-depth", field: "maxDepth", message: "maxDepth must be a non-negative integer" });
    }
    for (const type of options.edgeTypes ?? []) {
      if (!isKnownEdgeType(type)) {
        issues.push({ code: "unknown-edge-type", field: "edgeTypes", message: `unknown edge type "${type}"` });
      }
    }
    for (const type of options.nodeTypes ?? []) {
      if (!isKnownNodeType(type)) {
        issues.push({ code: "unknown-node-type", field: "nodeTypes", message: `unknown node type "${type}"` });
      }
    }
    if (options.direction && !["in", "out", "both"].includes(options.direction)) {
      issues.push({ code: "invalid-direction", field: "direction", message: `unknown direction "${options.direction}"` });
    }
    return issues;
  }

  private validateFilters(filters: NodeQueryFilters): QueryValidationIssue[] {
    const issues: QueryValidationIssue[] = [];
    for (const type of filters.nodeTypes ?? []) {
      if (!isKnownNodeType(type)) {
        issues.push({ code: "unknown-node-type", field: "nodeTypes", message: `unknown node type "${type}"` });
      }
    }
    return issues;
  }

  private assertValid(issues: readonly QueryValidationIssue[]): void {
    if (issues.length > 0) throw new GraphQueryError(issues);
  }

  private unknownNode<T>(nodeId: string, startedAt: number): QueryResult<T> {
    return failureResult<T>(
      [{ code: "unknown-node", message: `Node "${nodeId}" does not exist in the graph.`, subject: nodeId }],
      this.perf(startedAt, ["nodeById"]),
      this.metadata,
    );
  }

  /* ------------------------------------------------------ core node access */

  getNode(nodeId: string): GraphNode | null {
    return this.indexes.nodeById.get(nodeId) ?? null;
  }

  hasNode(nodeId: string): boolean {
    return this.indexes.nodeById.has(nodeId);
  }

  getNodes(nodeIds: readonly string[]): readonly GraphNode[] {
    return nodeIds
      .map((id) => this.indexes.nodeById.get(id))
      .filter((n): n is GraphNode => Boolean(n))
      .sort(compareNodes);
  }

  getEdge(edgeId: string): GraphEdge | null {
    return this.indexes.edgeById.get(edgeId) ?? null;
  }

  /** All nodes of a type, canonically ordered. */
  findByType(type: GraphNodeType, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    return this.findNodes({ nodeTypes: [type] }, options);
  }

  findByOwner(owner: string, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    return this.findNodes({ owners: [owner] }, options);
  }

  findByDomain(domain: string, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    return this.findNodes({ domains: [domain] }, options);
  }

  findByCategory(category: string, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    return this.findNodes({ categories: [category] }, options);
  }

  findByStatus(status: string, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    return this.findNodes({ statuses: [status] }, options);
  }

  findByPersona(persona: string, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    return this.findNodes({ personas: [persona] }, options);
  }

  findByRoute(route: string, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    return this.findNodes({ routes: [route] }, options);
  }

  findByService(service: string, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    return this.findNodes({ services: [service] }, options);
  }

  findByApplication(application: string, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    return this.findNodes({ applications: [application] }, options);
  }

  /* --------------------------------------------------------- composed find */

  /** The composable filter entry point behind every `findBy*` helper. */
  findNodes(filters: NodeQueryFilters = {}, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    const startedAt = now();
    this.assertValid([...this.validateFilters(filters), ...this.validatePagination(options)]);

    const matchMode = filters.matchMode ?? "all";
    const { criteria, ignoredFields } = compileCriteria(filters, this.lookup);

    /* Index-narrowed candidate set: a single node-type filter is the only case
       where scanning the whole node list can be avoided without risking a
       different result order. */
    const scope =
      filters.nodeTypes?.length === 1 && matchMode === "all"
        ? (this.indexes.nodesByType.get(filters.nodeTypes[0]) ?? [])
        : this.graph.nodes;

    const matched: GraphNode[] = [];
    const explanations: QueryMatchExplanation[] = [];
    for (const node of scope) {
      const outcome = evaluateCriteria(node, criteria, matchMode);
      if (!outcome.matched) continue;
      matched.push(node);
      if (options.explain) explanations.push({ nodeId: node.id, matchedFilters: outcome.matches });
    }
    matched.sort(compareNodes);

    const { page, totalAvailable, truncated } = paginate(matched, options.limit, options.offset);
    const warnings: QueryWarning[] = [...this.emptyWarning(matched.length, "the supplied filters")];
    for (const field of ignoredFields) {
      warnings.push({
        code: "unsupported-property",
        field: field,
        message: `Filter field "${field}" has no representation in the current graph schema and was not applied; no results were matched on it.`,
        subject: field,
      } as QueryWarning & { field: string });
    }

    const filtersApplied: QueryFilterSummary = {
      criteria: criteria.map((c) => ({ field: c.field, operator: c.operator, expected: c.expected })),
      matchMode,
      ignoredFields,
    };

    return buildResult({
      results: page,
      totalAvailable,
      truncated,
      warnings,
      filtersApplied,
      ...(options.explain ? { explanation: explanations } : {}),
      performance: this.perf(startedAt, ["nodesByType", "nodesByPersona", "nodesByService"], scope.length),
      graph: this.metadata,
    });
  }

  /* ------------------------------------------------------------ edge access */

  /** Edges incident to a node. Candidate edges only on explicit opt-in. */
  getEdges(
    nodeId: string,
    options: { direction?: "in" | "out" | "both"; edgeTypes?: readonly GraphEdgeType[]; includeCandidateRelationships?: boolean } & {
      limit?: number;
      offset?: number;
    } = {},
  ): QueryResult<LabelledEdge> {
    const startedAt = now();
    this.assertValid(this.validateTraversal(options as TraversalQueryOptions));
    if (!this.hasNode(nodeId)) return this.unknownNode<LabelledEdge>(nodeId, startedAt);

    const direction = options.direction ?? "both";
    const wanted = options.edgeTypes?.length ? new Set(options.edgeTypes) : null;
    const collected: LabelledEdge[] = [];
    const take = (edges: readonly GraphEdge[], candidate: boolean) => {
      for (const edge of edges) {
        if (wanted && !wanted.has(edge.type)) continue;
        collected.push({ ...edge, candidate });
      }
    };
    if (direction !== "in") take(this.indexes.outgoing.get(nodeId) ?? [], false);
    if (direction !== "out") take(this.indexes.incoming.get(nodeId) ?? [], false);
    const warnings: QueryWarning[] = [];
    if (options.includeCandidateRelationships) {
      if (direction !== "in") take(this.indexes.candidateOutgoing.get(nodeId) ?? [], true);
      if (direction !== "out") take(this.indexes.candidateIncoming.get(nodeId) ?? [], true);
      warnings.push({
        code: "candidate-relationships-included",
        message: "Weakly-inferred candidate relationships are included and are flagged with candidate: true.",
        subject: nodeId,
      });
    }
    collected.sort(compareEdges);

    const { page, totalAvailable, truncated } = paginate(collected, options.limit, options.offset);
    return buildResult({
      results: page,
      totalAvailable,
      truncated,
      warnings,
      performance: this.perf(startedAt, ["outgoing", "incoming"], 0, collected.length),
      graph: this.metadata,
    });
  }

  /** Every weakly-inferred relationship held out of the authoritative graph. */
  getCandidateRelationships(): QueryResult<CandidateEdge> {
    const startedAt = now();
    const results = [...this.candidateEdges].sort((a, b) => a.id.localeCompare(b.id));
    return buildResult({
      results,
      totalAvailable: results.length,
      truncated: false,
      warnings: [
        {
          code: "candidate-relationships-included",
          message: "These relationships are weakly inferred and are not part of the authoritative graph.",
        },
      ],
      performance: this.perf(startedAt, ["candidateEdges"]),
      graph: this.metadata,
    });
  }

  /* -------------------------------------------------------------- traversal */

  private traversalResult(
    startedAt: number,
    startId: string,
    options: TraversalQueryOptions,
    effective: TraversalQueryOptions,
  ): QueryResult<TraversalHitRecord> {
    const run = traverse(this.indexes, startId, effective);
    const hits = [...run.hits].sort(
      (a, b) => a.depth - b.depth || compareNodes(a.node, b.node),
    );
    const { page, totalAvailable, truncated } = paginate(hits, options.limit, options.offset);

    const warnings: QueryWarning[] = [...this.emptyWarning(hits.length, `traversal from "${startId}"`)];
    if (run.depthLimitReached) {
      warnings.push({
        code: "depth-limit-reached",
        message: `Traversal stopped at maxDepth ${resolveMaxDepth(effective.maxDepth)}; deeper nodes were not visited.`,
        subject: startId,
      });
    }
    if (effective.includeCandidateRelationships) {
      warnings.push({
        code: "candidate-relationships-included",
        message: "Traversal followed weakly-inferred candidate relationships.",
        subject: startId,
      });
    }

    const traversal: TraversalSummary = {
      startNodeId: startId,
      direction: effective.direction ?? "out",
      strategy: effective.strategy ?? "bfs",
      maxDepth: resolveMaxDepth(effective.maxDepth),
      reachedDepth: run.reachedDepth,
      edgeTypesTraversed: run.edgeTypesTraversed,
      visitedNodeCount: run.visitedNodeCount,
      candidateRelationshipsIncluded: effective.includeCandidateRelationships === true,
    };

    const explanation: QueryMatchExplanation[] | undefined = options.explain
      ? page.map((hit) => ({
          nodeId: hit.node.id,
          matchedFilters: [],
          distance: hit.depth,
          ...(hit.path ? { path: hit.path } : {}),
          rankingBasis: `depth ${hit.depth}${hit.viaEdgeType ? ` via ${hit.viaEdgeType}` : ""}`,
        }))
      : undefined;

    return buildResult({
      results: page,
      totalAvailable,
      truncated,
      warnings,
      traversal,
      ...(explanation ? { explanation } : {}),
      performance: this.perf(startedAt, ["outgoing", "incoming", "nodeById"], run.visitedNodeCount, run.scannedEdgeCount),
      graph: this.metadata,
    });
  }

  /** Generic traversal from a node. */
  traverseFrom(startId: string, options: TraversalQueryOptions = {}): QueryResult<TraversalHitRecord> {
    const startedAt = now();
    this.assertValid(this.validateTraversal(options));
    if (!this.hasNode(startId)) return this.unknownNode<TraversalHitRecord>(startId, startedAt);
    return this.traversalResult(startedAt, startId, options, options);
  }

  /** Directly connected nodes (depth 1). */
  getNeighbors(nodeId: string, options: TraversalQueryOptions = {}): QueryResult<TraversalHitRecord> {
    const startedAt = now();
    this.assertValid(this.validateTraversal(options));
    if (!this.hasNode(nodeId)) return this.unknownNode<TraversalHitRecord>(nodeId, startedAt);
    return this.traversalResult(startedAt, nodeId, options, {
      ...options,
      direction: options.direction ?? "both",
      maxDepth: 1,
    });
  }

  /** Containment children (`BELONGS_TO` pointing at this node). */
  getChildren(nodeId: string, options: TraversalQueryOptions = {}): QueryResult<TraversalHitRecord> {
    return this.traverseFrom(nodeId, { ...options, direction: "in", edgeTypes: ["BELONGS_TO"], maxDepth: 1 });
  }

  /** Full containment subtree. */
  getDescendants(nodeId: string, options: TraversalQueryOptions = {}): QueryResult<TraversalHitRecord> {
    return this.traverseFrom(nodeId, { ...options, direction: "in", edgeTypes: ["BELONGS_TO"] });
  }

  /** Containment ancestors, nearest first. */
  getAncestors(nodeId: string, options: TraversalQueryOptions = {}): QueryResult<TraversalHitRecord> {
    return this.traverseFrom(nodeId, { ...options, direction: "out", edgeTypes: ["BELONGS_TO"] });
  }

  /* -------------------------------------------------- dependency and impact */

  /**
   * What a node relies on, following dependency-bearing relationships outward.
   * Semantics come from RELATIONSHIP_SEMANTICS, never from edge-name guessing.
   */
  getDependencies(nodeId: string, options: TraversalQueryOptions = {}): QueryResult<TraversalHitRecord> {
    return this.traverseFrom(nodeId, {
      ...options,
      direction: "out",
      edgeTypes: options.edgeTypes ?? DEPENDENCY_EDGE_TYPES,
    });
  }

  /** What relies on a node: the inverse of getDependencies. */
  getDependents(nodeId: string, options: TraversalQueryOptions = {}): QueryResult<TraversalHitRecord> {
    return this.traverseFrom(nodeId, {
      ...options,
      direction: "in",
      edgeTypes: options.edgeTypes ?? DEPENDENCY_EDGE_TYPES,
    });
  }

  /**
   * Everything that could be affected by changing this node: dependents plus
   * composition and membership relationships that carry change impact.
   */
  getDownstreamImpact(nodeId: string, options: TraversalQueryOptions = {}): QueryResult<TraversalHitRecord> {
    return this.traverseFrom(nodeId, {
      ...options,
      direction: "in",
      edgeTypes: options.edgeTypes ?? IMPACT_EDGE_TYPES,
    });
  }

  /** Everything this node itself relies on, across impact-bearing relationships. */
  getUpstreamImpact(nodeId: string, options: TraversalQueryOptions = {}): QueryResult<TraversalHitRecord> {
    return this.traverseFrom(nodeId, {
      ...options,
      direction: "out",
      edgeTypes: options.edgeTypes ?? IMPACT_EDGE_TYPES,
    });
  }

  /** Direct dependency cycles reachable from a node, if any exist. */
  findDependencyCycles(nodeId: string, options: TraversalQueryOptions = {}): QueryResult<GraphPath> {
    const startedAt = now();
    this.assertValid(this.validateTraversal(options));
    if (!this.hasNode(nodeId)) return this.unknownNode<GraphPath>(nodeId, startedAt);

    const edgeTypes = options.edgeTypes ?? DEPENDENCY_EDGE_TYPES;
    const reachable = traverse(this.indexes, nodeId, { ...options, direction: "out", edgeTypes });
    const cycles: GraphPath[] = [];
    for (const hit of reachable.hits) {
      const back = shortestPath(this.indexes, hit.node.id, nodeId, { ...options, direction: "out", edgeTypes });
      if (back.path && hit.path) {
        cycles.push({
          nodeIds: [...hit.path.nodeIds, ...back.path.nodeIds.slice(1)],
          edgeIds: [...hit.path.edgeIds, ...back.path.edgeIds],
          length: hit.path.length + back.path.length,
        });
      }
    }
    cycles.sort((a, b) => a.length - b.length || a.nodeIds.join(">").localeCompare(b.nodeIds.join(">")));
    const { page, totalAvailable, truncated } = paginate(cycles, options.limit, options.offset);
    return buildResult({
      results: page,
      totalAvailable,
      truncated,
      warnings: this.emptyWarning(cycles.length, `dependency cycles through "${nodeId}"`),
      performance: this.perf(startedAt, ["outgoing"], reachable.visitedNodeCount, reachable.scannedEdgeCount),
      graph: this.metadata,
    });
  }

  /* ------------------------------------------------------------------ paths */

  findShortestPath(fromId: string, toId: string, options: TraversalQueryOptions = {}): QueryResult<GraphPath> {
    const startedAt = now();
    this.assertValid(this.validateTraversal(options));
    if (!this.hasNode(fromId)) return this.unknownNode<GraphPath>(fromId, startedAt);
    if (!this.hasNode(toId)) return this.unknownNode<GraphPath>(toId, startedAt);

    const { path, run } = shortestPath(this.indexes, fromId, toId, { direction: "both", ...options });
    const results = path ? [path] : [];
    return buildResult({
      results,
      totalAvailable: results.length,
      truncated: false,
      warnings: this.emptyWarning(results.length, `a path from "${fromId}" to "${toId}"`),
      traversal: {
        startNodeId: fromId,
        direction: options.direction ?? "both",
        strategy: "bfs",
        maxDepth: resolveMaxDepth(options.maxDepth),
        reachedDepth: run.reachedDepth,
        edgeTypesTraversed: run.edgeTypesTraversed,
        visitedNodeCount: run.visitedNodeCount,
        candidateRelationshipsIncluded: options.includeCandidateRelationships === true,
      },
      ...(options.explain && path
        ? { explanation: [{ nodeId: toId, matchedFilters: [], path, distance: path.length, rankingBasis: "shortest hop count" }] }
        : {}),
      performance: this.perf(startedAt, ["outgoing", "incoming"], run.visitedNodeCount, run.scannedEdgeCount),
      graph: this.metadata,
    });
  }

  findAllPaths(fromId: string, toId: string, options: PathQueryOptions = {}): QueryResult<GraphPath> {
    const startedAt = now();
    this.assertValid(this.validateTraversal(options));
    if (!this.hasNode(fromId)) return this.unknownNode<GraphPath>(fromId, startedAt);
    if (!this.hasNode(toId)) return this.unknownNode<GraphPath>(toId, startedAt);

    const { paths, scannedEdgeCount, capped } = allPaths(this.indexes, fromId, toId, options);
    const { page, totalAvailable, truncated } = paginate(paths, options.limit, options.offset);
    const warnings: QueryWarning[] = [...this.emptyWarning(paths.length, `paths from "${fromId}" to "${toId}"`)];
    if (capped) {
      warnings.push({
        code: "path-limit-reached",
        message: `Path enumeration stopped at maxPaths ${options.maxPaths ?? 25}.`,
        subject: fromId,
      });
    }
    return buildResult({
      results: page,
      totalAvailable,
      truncated,
      warnings,
      performance: this.perf(startedAt, ["outgoing", "incoming"], 0, scannedEdgeCount),
      graph: this.metadata,
    });
  }

  /* ----------------------------------------------------------------- search */

  search(term: string, options: SearchOptions = {}): QueryResult<GraphNode> {
    const startedAt = now();
    this.assertValid(this.validatePagination(options));
    const { hits, scannedNodeCount } = searchNodes(this.graph.nodes, term, options);
    const { page, totalAvailable, truncated } = paginate(hits, options.limit, options.offset);
    const explanation: QueryMatchExplanation[] | undefined = options.explain
      ? page.map((hit) => ({
          nodeId: hit.node.id,
          matchedFilters: [],
          searchMatches: hit.matches,
          rankingBasis: `best match "${hit.matches[0]?.matchType}" on ${hit.matches[0]?.field}`,
        }))
      : undefined;

    return buildResult({
      results: page.map((h) => h.node),
      totalAvailable,
      truncated,
      warnings: this.emptyWarning(hits.length, `search term "${term}"`),
      ...(explanation ? { explanation } : {}),
      performance: this.perf(startedAt, ["byToken", "byNormalizedLabel"], scannedNodeCount),
      graph: this.metadata,
    });
  }

  /** Exact, case-insensitive label lookup. */
  findByLabel(label: string, options: NodeQueryOptions = {}): QueryResult<GraphNode> {
    const startedAt = now();
    this.assertValid(this.validatePagination(options));
    const matched = [...(this.indexes.byNormalizedLabel.get(normalize(label)) ?? [])].sort(compareNodes);
    const { page, totalAvailable, truncated } = paginate(matched, options.limit, options.offset);
    return buildResult({
      results: page,
      totalAvailable,
      truncated,
      warnings: this.emptyWarning(matched.length, `label "${label}"`),
      performance: this.perf(startedAt, ["byNormalizedLabel"], matched.length),
      graph: this.metadata,
    });
  }

  /* ------------------------------------------------------------- subgraphs */

  /** Induced subgraph over a node set plus everything reachable from it. */
  subgraph(nodeIds: readonly string[], options: TraversalQueryOptions = {}): CapabilityGraph {
    this.assertValid(this.validateTraversal(options));
    const keep = new Set<string>();
    for (const id of nodeIds) {
      if (!this.hasNode(id)) continue;
      keep.add(id);
      for (const hit of traverse(this.indexes, id, { includePaths: false, ...options }).hits) keep.add(hit.node.id);
    }
    return {
      schemaVersion: this.graph.schemaVersion,
      version: this.graph.version,
      nodes: this.graph.nodes.filter((n) => keep.has(n.id)),
      edges: this.graph.edges.filter((e) => keep.has(e.from) && keep.has(e.to)),
    };
  }

  /** Candidate edges shaped as labelled graph edges, for preview surfaces only. */
  candidateEdgesAsEdges(): readonly LabelledEdge[] {
    return [...this.candidateEdges]
      .map((c) => ({ ...candidateAsEdge(c), candidate: true }))
      .sort(compareEdges);
  }
}

let cached: GraphQueryEngine | null = null;

/** Process-wide engine over the populated graph. Indexes are built once. */
export const getQueryEngine = (): GraphQueryEngine => (cached ??= new GraphQueryEngine());

/** Test hook: clears the cached engine. */
export const __resetQueryEngineCache = (): void => {
  cached = null;
};

export const createQueryEngine = (input: QueryEngineInput = {}): GraphQueryEngine =>
  new GraphQueryEngine(input);
