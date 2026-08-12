import { describe, expect, it } from "vitest";
import {
  buildCapabilityGraph,
  computeGraphHash,
  deserializeGraph,
  diffGraphs,
  EDGE_ENDPOINT_POLICY,
  GRAPH_EDGE_TYPES,
  GRAPH_NODE_TYPES,
  GRAPH_SCHEMA_VERSION,
  nextGraphVersion,
  queryGraph,
  serializeGraph,
  validateGraph,
  type CapabilityGraph,
  type GraphEdge,
  type GraphNode,
} from "./index";

const node = (id: string, type: GraphNode["type"], extra: Partial<GraphNode> = {}): GraphNode => ({
  id,
  type,
  label: id,
  moduleId: null,
  ownership: "unassigned",
  source: "declared",
  confidence: "high",
  evidence: [],
  attributes: {},
  ...extra,
});

const edge = (from: string, type: GraphEdge["type"], to: string): GraphEdge => ({
  id: `${from}|${type}|${to}`,
  type,
  from,
  to,
  source: "declared",
  confidence: "high",
  evidence: [],
  attributes: {},
});

const wrap = (nodes: GraphNode[], edges: GraphEdge[]): CapabilityGraph => ({
  schemaVersion: GRAPH_SCHEMA_VERSION,
  version: nextGraphVersion(nodes, edges, { generator: "test" }),
  nodes,
  edges,
});

/* -------------------------------------------------------------------------- */

describe("graph schema", () => {
  it("declares all 19 node types and 15 relationship types", () => {
    expect(GRAPH_NODE_TYPES).toHaveLength(19);
    expect(GRAPH_EDGE_TYPES).toHaveLength(15);
    expect(new Set(GRAPH_NODE_TYPES).size).toBe(GRAPH_NODE_TYPES.length);
    expect(new Set(GRAPH_EDGE_TYPES).size).toBe(GRAPH_EDGE_TYPES.length);
  });

  it("gives every relationship type a non-empty endpoint policy", () => {
    for (const type of GRAPH_EDGE_TYPES) {
      const policy = EDGE_ENDPOINT_POLICY[type];
      expect(policy.from.length, type).toBeGreaterThan(0);
      expect(policy.to.length, type).toBeGreaterThan(0);
    }
  });
});

describe("graph validator", () => {
  it("accepts a well-formed graph", () => {
    const report = validateGraph(
      wrap(
        [node("module:m", "module", { moduleId: "m" }), node("capability:c", "capability", { moduleId: "m" })],
        [edge("capability:c", "BELONGS_TO", "module:m")],
      ),
    );
    expect(report.ok).toBe(true);
    expect(report.errorCount).toBe(0);
  });

  it("flags dangling endpoints, self loops and duplicates as errors", () => {
    const report = validateGraph({
      nodes: [node("module:m", "module"), node("module:m", "module")],
      edges: [edge("module:m", "REFERENCES", "module:missing"), edge("module:m", "REFERENCES", "module:m")],
    });
    const rules = report.findings.map((f) => f.ruleId);
    expect(rules).toContain("duplicate-node-id");
    expect(rules).toContain("dangling-edge-endpoint");
    expect(rules).toContain("self-referencing-edge");
    expect(report.ok).toBe(false);
  });

  it("rejects relationships that violate the endpoint policy", () => {
    const report = validateGraph({
      nodes: [node("permission:p", "permission"), node("persona:x", "persona")],
      edges: [edge("permission:p", "SECURES", "persona:x")],
    });
    expect(report.findings.map((f) => f.ruleId)).toContain("invalid-edge-endpoint-type");
  });

  it("detects BELONGS_TO cycles", () => {
    const report = validateGraph({
      nodes: [node("capability:a", "capability", { moduleId: "m" }), node("capability:b", "capability", { moduleId: "m" })],
      edges: [edge("capability:a", "BELONGS_TO", "capability:b"), edge("capability:b", "BELONGS_TO", "capability:a")],
    });
    expect(report.findings.map((f) => f.ruleId)).toContain("cyclic-belongs-to");
  });

  it("warns about unowned capabilities and shared capabilities", () => {
    const report = validateGraph({
      nodes: [
        node("capability:c", "capability"),
        node("shared-capability:s", "shared-capability"),
        node("route:/x", "route"),
      ],
      edges: [],
    });
    const rules = report.findings.map((f) => f.ruleId);
    expect(rules).toContain("capability-without-module");
    expect(rules).toContain("shared-capability-without-owner");
    expect(rules).toContain("orphan-node");
  });

  it("rejects a schema version mismatch", () => {
    const report = validateGraph({ schemaVersion: "0.9.0", nodes: [], edges: [] });
    expect(report.findings.map((f) => f.ruleId)).toContain("schema-version-mismatch");
  });
});

describe("graph builder", () => {
  const graph = buildCapabilityGraph();

  it("produces a structurally valid graph from the live registries", () => {
    const report = validateGraph(graph);
    expect(report.findings.filter((f) => f.severity === "error")).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("registers modules, capabilities, shared and platform capabilities", () => {
    const q = queryGraph(graph);
    expect(q.nodesByType("module").length).toBeGreaterThan(0);
    expect(q.nodesByType("capability").length).toBeGreaterThan(0);
    expect(q.nodesByType("shared-capability").length).toBeGreaterThan(0);
    expect(q.nodesByType("platform-capability").length).toBeGreaterThan(0);
    expect(q.node("module:sre")).toBeDefined();
  });

  it("attaches every module capability to its module", () => {
    const q = queryGraph(graph);
    for (const capability of q.nodesByType("capability")) {
      expect(q.parentOf(capability.id), capability.id).not.toBeNull();
    }
  });

  it("marks manifest routes that exist in the generated route table as observed", () => {
    const q = queryGraph(graph);
    const observed = q.nodesByType("route").filter((r) => r.attributes.presentInRouteTable === true);
    expect(observed.length).toBeGreaterThan(0);
    expect(observed.every((r) => r.source === "observed")).toBe(true);
  });

  it("is deterministic — rebuilding yields an identical content hash", () => {
    expect(buildCapabilityGraph().version.contentHash).toBe(graph.version.contentHash);
  });

  it("never emits duplicate node or edge ids", () => {
    expect(new Set(graph.nodes.map((n) => n.id)).size).toBe(graph.nodes.length);
    expect(new Set(graph.edges.map((e) => e.id)).size).toBe(graph.edges.length);
  });
});

describe("graph query api", () => {
  const nodes = [
    node("module:m", "module", { moduleId: "m", ownership: "module-owned" }),
    node("capability:c", "capability", { moduleId: "m", ownership: "module-owned" }),
    node("page:p", "page", { moduleId: "m" }),
    node("platform-capability:auth", "platform-capability", { moduleId: "platform", ownership: "platform-owned" }),
    node("database-entity:profiles", "database-entity"),
  ];
  const edges = [
    edge("capability:c", "BELONGS_TO", "module:m"),
    edge("page:p", "IMPLEMENTS", "capability:c"),
    edge("module:m", "CONSUMES", "platform-capability:auth"),
    edge("platform-capability:auth", "STORES", "database-entity:profiles"),
  ];
  const q = queryGraph(wrap(nodes, edges));

  it("filters nodes by type, module and search", () => {
    expect(q.nodes({ types: ["page"] })).toHaveLength(1);
    expect(q.nodes({ moduleIds: ["m"] })).toHaveLength(3);
    expect(q.nodes({ search: "AUTH" })).toHaveLength(1);
    expect(q.nodes({ ownership: ["platform-owned"] })).toHaveLength(1);
  });

  it("walks containment", () => {
    expect(q.parentOf("capability:c")?.id).toBe("module:m");
    expect(q.childrenOf("module:m").map((n) => n.id)).toEqual(["capability:c"]);
  });

  it("traverses transitively with depth limits", () => {
    const deep = q.dependenciesOf("module:m").map((n) => n.id);
    expect(deep).toContain("platform-capability:auth");
    expect(deep).toContain("database-entity:profiles");
    expect(q.dependenciesOf("module:m", 1).map((n) => n.id)).toEqual(["platform-capability:auth"]);
  });

  it("reports dependents of a node", () => {
    expect(q.dependentsOf("platform-capability:auth").map((n) => n.id)).toContain("module:m");
  });

  it("finds a path and extracts a subgraph", () => {
    expect(q.path("module:m", "database-entity:profiles")).toHaveLength(2);
    expect(q.path("database-entity:profiles", "database-entity:profiles")).toEqual([]);
    const sub = q.subgraph(["module:m"], { direction: "out", maxDepth: 1 });
    expect(sub.nodes.map((n) => n.id).sort()).toEqual(["module:m", "platform-capability:auth"]);
  });

  it("returns stats and hotspots", () => {
    const stats = q.stats();
    expect(stats.nodeCount).toBe(5);
    expect(stats.edgeCount).toBe(4);
    expect(stats.nodesByType.module).toBe(1);
    expect(q.hotspots(1)[0].node.id).toBeDefined();
  });
});

describe("graph serialization and versioning", () => {
  const graph = wrap(
    [node("module:m", "module", { moduleId: "m" }), node("capability:c", "capability", { moduleId: "m" })],
    [edge("capability:c", "BELONGS_TO", "module:m")],
  );

  it("serializes deterministically regardless of input order", () => {
    const reversed = { ...graph, nodes: [...graph.nodes].reverse(), edges: [...graph.edges] };
    expect(serializeGraph(reversed)).toBe(serializeGraph(graph));
  });

  it("round-trips through deserialization", () => {
    const result = deserializeGraph(serializeGraph(graph));
    expect(result.errors).toEqual([]);
    expect(result.graph?.nodes).toHaveLength(2);
  });

  it("rejects tampered content", () => {
    const tampered = serializeGraph(graph).replace('"label":"module:m"', '"label":"tampered"');
    const result = deserializeGraph(tampered);
    expect(result.graph).toBeNull();
    expect(result.errors.join(" ")).toContain("hash mismatch");
  });

  it("rejects malformed documents", () => {
    expect(deserializeGraph("{oops").graph).toBeNull();
    expect(deserializeGraph(JSON.stringify({ schemaVersion: "0.1.0" })).errors.length).toBeGreaterThan(0);
  });

  it("only advances the version when content changes", () => {
    const v1 = graph.version;
    const same = nextGraphVersion(graph.nodes, graph.edges, { generator: "test", previous: v1 });
    expect(same.version).toBe(v1.version);

    const changedNodes = [...graph.nodes, node("page:p", "page", { moduleId: "m" })];
    const v2 = nextGraphVersion(changedNodes, graph.edges, { generator: "test", previous: v1 });
    expect(v2.version).toBe(v1.version + 1);
    expect(v2.previousContentHash).toBe(v1.contentHash);
    expect(computeGraphHash(changedNodes, graph.edges)).toBe(v2.contentHash);
  });

  it("diffs two graph versions", () => {
    const after = wrap(
      [...graph.nodes, node("page:p", "page", { moduleId: "m" })],
      [...graph.edges, edge("page:p", "BELONGS_TO", "module:m")],
    );
    const diff = diffGraphs(graph, after);
    expect(diff.changed).toBe(true);
    expect(diff.addedNodes).toEqual(["page:p"]);
    expect(diff.addedEdges).toEqual(["page:p|BELONGS_TO|module:m"]);
    expect(diffGraphs(graph, graph).changed).toBe(false);
  });
});
