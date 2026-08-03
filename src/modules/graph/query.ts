/**
 * Stage 3.5.1 — graph query API.
 *
 * A read-only, in-memory query surface over a CapabilityGraph. Indexes are
 * built once per instance; every method is pure and returns new arrays.
 */

import type {
  CapabilityGraph,
  EdgeDirection,
  GraphEdge,
  GraphEdgeType,
  GraphNode,
  GraphNodeType,
  NodeFilter,
  TraversalHit,
  TraversalOptions,
} from "./types";

export class GraphQuery {
  private readonly nodesById = new Map<string, GraphNode>();
  private readonly outgoing = new Map<string, GraphEdge[]>();
  private readonly incoming = new Map<string, GraphEdge[]>();

  constructor(private readonly graph: CapabilityGraph) {
    for (const node of graph.nodes) this.nodesById.set(node.id, node);
    for (const edge of graph.edges) {
      if (!this.nodesById.has(edge.from) || !this.nodesById.has(edge.to)) continue;
      (this.outgoing.get(edge.from) ?? this.outgoing.set(edge.from, []).get(edge.from)!).push(edge);
      (this.incoming.get(edge.to) ?? this.incoming.set(edge.to, []).get(edge.to)!).push(edge);
    }
  }

  /* --------------------------------------------------------------- lookups */

  get source(): CapabilityGraph {
    return this.graph;
  }

  node(id: string): GraphNode | undefined {
    return this.nodesById.get(id);
  }

  nodes(filter: NodeFilter = {}): readonly GraphNode[] {
    const search = filter.search?.toLowerCase();
    return this.graph.nodes.filter((n) => {
      if (filter.types && !filter.types.includes(n.type)) return false;
      if (filter.moduleIds && !filter.moduleIds.includes(n.moduleId ?? "")) return false;
      if (filter.ownership && !filter.ownership.includes(n.ownership)) return false;
      if (filter.sources && !filter.sources.includes(n.source)) return false;
      if (search) {
        const haystack = `${n.id} ${n.label} ${n.description ?? ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }

  nodesByType(type: GraphNodeType): readonly GraphNode[] {
    return this.nodes({ types: [type] });
  }

  edges(direction: EdgeDirection, nodeId: string, edgeTypes?: readonly GraphEdgeType[]): readonly GraphEdge[] {
    const out = direction === "in" ? [] : (this.outgoing.get(nodeId) ?? []);
    const inc = direction === "out" ? [] : (this.incoming.get(nodeId) ?? []);
    const all = [...out, ...inc];
    return edgeTypes ? all.filter((e) => edgeTypes.includes(e.type)) : all;
  }

  edgesOfType(type: GraphEdgeType): readonly GraphEdge[] {
    return this.graph.edges.filter((e) => e.type === type);
  }

  /** Directly connected nodes, optionally filtered by edge and node type. */
  neighbors(nodeId: string, options: TraversalOptions = {}): readonly GraphNode[] {
    const direction = options.direction ?? "both";
    const ids = new Set<string>();
    for (const edge of this.edges(direction, nodeId, options.edgeTypes)) {
      ids.add(edge.from === nodeId ? edge.to : edge.from);
    }
    const result = [...ids].map((id) => this.nodesById.get(id)!).filter(Boolean);
    return options.nodeTypes ? result.filter((n) => options.nodeTypes!.includes(n.type)) : result;
  }

  /* ------------------------------------------------------------- traversal */

  /** Breadth-first traversal returning each reachable node with its depth. */
  traverse(startId: string, options: TraversalOptions = {}): readonly TraversalHit[] {
    const start = this.nodesById.get(startId);
    if (!start) return [];
    const direction = options.direction ?? "out";
    const maxDepth = options.maxDepth ?? Number.POSITIVE_INFINITY;

    const hits: TraversalHit[] = [];
    const visited = new Set<string>([startId]);
    let frontier: TraversalHit[] = [{ node: start, depth: 0, path: [] }];
    if (options.includeStart) hits.push(frontier[0]);

    while (frontier.length) {
      const next: TraversalHit[] = [];
      for (const current of frontier) {
        if (current.depth >= maxDepth) continue;
        for (const edge of this.edges(direction, current.node.id, options.edgeTypes)) {
          const otherId = edge.from === current.node.id ? edge.to : edge.from;
          if (visited.has(otherId)) continue;
          visited.add(otherId);
          const node = this.nodesById.get(otherId);
          if (!node) continue;
          const hit: TraversalHit = {
            node,
            depth: current.depth + 1,
            path: [...current.path, edge.id],
          };
          next.push(hit);
          if (!options.nodeTypes || options.nodeTypes.includes(node.type)) hits.push(hit);
        }
      }
      frontier = next;
    }
    return hits;
  }

  /** Shortest edge path between two nodes, or null when unreachable. */
  path(fromId: string, toId: string, options: TraversalOptions = {}): readonly string[] | null {
    if (fromId === toId) return [];
    const hit = this.traverse(fromId, { direction: "both", ...options }).find(
      (h) => h.node.id === toId,
    );
    return hit ? hit.path : null;
  }

  /** Every node reachable from `nodeId` plus the edges between them. */
  subgraph(nodeIds: readonly string[], options: TraversalOptions = {}): CapabilityGraph {
    const keep = new Set<string>(nodeIds.filter((id) => this.nodesById.has(id)));
    for (const id of nodeIds) {
      for (const hit of this.traverse(id, options)) keep.add(hit.node.id);
    }
    return {
      schemaVersion: this.graph.schemaVersion,
      version: this.graph.version,
      nodes: this.graph.nodes.filter((n) => keep.has(n.id)),
      edges: this.graph.edges.filter((e) => keep.has(e.from) && keep.has(e.to)),
    };
  }

  /* ------------------------------------------------------- derived answers */

  /** Everything a node depends on, transitively. */
  dependenciesOf(nodeId: string, maxDepth?: number): readonly GraphNode[] {
    return this.traverse(nodeId, {
      direction: "out",
      edgeTypes: ["DEPENDS_ON", "CONSUMES", "USES", "INVOKES", "STORES"],
      maxDepth,
    }).map((h) => h.node);
  }

  /** Everything that would be affected by changing a node, transitively. */
  dependentsOf(nodeId: string, maxDepth?: number): readonly GraphNode[] {
    return this.traverse(nodeId, {
      direction: "in",
      edgeTypes: ["DEPENDS_ON", "CONSUMES", "USES", "INVOKES", "IMPLEMENTS", "BELONGS_TO"],
      maxDepth,
    }).map((h) => h.node);
  }

  /** Containment children of a node (BELONGS_TO pointing at it). */
  childrenOf(nodeId: string): readonly GraphNode[] {
    return this.edges("in", nodeId, ["BELONGS_TO"])
      .map((e) => this.nodesById.get(e.from)!)
      .filter(Boolean);
  }

  /** Containment parent of a node, if any. */
  parentOf(nodeId: string): GraphNode | null {
    const edge = this.edges("out", nodeId, ["BELONGS_TO"])[0];
    return edge ? (this.nodesById.get(edge.to) ?? null) : null;
  }

  /** Node IDs sorted by total degree, most connected first. */
  hotspots(limit = 10): readonly { node: GraphNode; degree: number }[] {
    return this.graph.nodes
      .map((node) => ({
        node,
        degree: (this.outgoing.get(node.id)?.length ?? 0) + (this.incoming.get(node.id)?.length ?? 0),
      }))
      .sort((a, b) => b.degree - a.degree || a.node.id.localeCompare(b.node.id))
      .slice(0, limit);
  }

  stats() {
    const countBy = <T extends string>(values: readonly T[]) =>
      values.reduce<Record<string, number>>((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {});
    return {
      nodeCount: this.graph.nodes.length,
      edgeCount: this.graph.edges.length,
      nodesByType: countBy(this.graph.nodes.map((n) => n.type)),
      edgesByType: countBy(this.graph.edges.map((e) => e.type)),
      nodesByOwnership: countBy(this.graph.nodes.map((n) => n.ownership)),
      isolatedNodeCount: this.graph.nodes.filter(
        (n) => !this.outgoing.has(n.id) && !this.incoming.has(n.id),
      ).length,
    };
  }
}

export const queryGraph = (graph: CapabilityGraph): GraphQuery => new GraphQuery(graph);
