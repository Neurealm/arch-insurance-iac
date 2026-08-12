/**
 * Stage 3.5.4.2 — Interactive Graph Explorer.
 *
 * Covers the graph-view contract against the real canonical graph: taxonomy
 * completeness, deterministic root selection, deterministic bounded views,
 * deterministic layout, candidate handling, empty-state diagnosis, read-only
 * guarantees, and route/tab registration.
 */

import { describe, it, expect } from "vitest";
import { getQueryEngine } from "@/modules/graph/query/index";
import { GRAPH_NODE_TYPES } from "@/modules/graph/types";
import {
  DEFAULT_EDGE_TYPES,
  DEFAULT_GRAPH_DEPTH,
  GRAPH_DEPTHS,
  MAX_VISIBLE_EDGES,
  MAX_VISIBLE_NODES,
  type GraphViewRequest,
} from "./graph/graphViewTypes";
import { NODE_GROUP_SPECS, groupForNodeType, unmappedNodeTypes } from "./graph/nodeTaxonomy";
import { selectInitialRoot } from "./graph/initialRoot";
import { buildGraphView, neighborsWithinView } from "./graph/graphView";
import { layoutGraphView } from "./graph/graphLayout";
import { nodeAccessibleLabel, toCanvasEdges, toCanvasNodes } from "./graph/reactFlowAdapter";
import { capabilityIntelligenceRoutes } from "./routes";

const engine = getQueryEngine();
const initial = selectInitialRoot(engine.source);

const baseRequest = (over: Partial<GraphViewRequest> = {}): GraphViewRequest => ({
  rootId: initial.nodeId,
  direction: "both",
  depth: DEFAULT_GRAPH_DEPTH,
  edgeTypes: DEFAULT_EDGE_TYPES,
  includeCandidates: false,
  ...over,
});

describe("graph explorer visual taxonomy", () => {
  it("maps every canonical node type to exactly one visual family", () => {
    expect(unmappedNodeTypes()).toEqual([]);
    for (const type of GRAPH_NODE_TYPES) {
      expect(NODE_GROUP_SPECS[groupForNodeType(type)]).toBeTruthy();
    }
  });

  it("gives every family a text marker so meaning never depends on colour", () => {
    for (const spec of Object.values(NODE_GROUP_SPECS)) {
      expect(spec.marker.trim().length).toBeGreaterThan(0);
      expect(spec.label.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("deterministic initial root", () => {
  it("selects the same root for the same graph every time", () => {
    const again = selectInitialRoot(engine.source);
    expect(again.nodeId).toBe(initial.nodeId);
    expect(again.basis).toBe(initial.basis);
  });

  it("selects a connected node and explains the basis", () => {
    expect(initial.nodeId).toBeTruthy();
    expect(initial.degree).toBeGreaterThan(0);
    expect(initial.explanation.length).toBeGreaterThan(10);
  });

  it("is order independent", () => {
    const reversed = {
      nodes: [...engine.source.nodes].reverse(),
      edges: [...engine.source.edges].reverse(),
    };
    expect(selectInitialRoot(reversed).nodeId).toBe(initial.nodeId);
  });
});

describe("bounded graph views", () => {
  it("never exceeds the node and edge safety limits at any offered depth", () => {
    for (const depth of GRAPH_DEPTHS) {
      const view = buildGraphView(engine, baseRequest({ depth }));
      expect(view.nodes.length).toBeLessThanOrEqual(MAX_VISIBLE_NODES);
      expect(view.edges.length).toBeLessThanOrEqual(MAX_VISIBLE_EDGES);
    }
  });

  it("produces byte-identical views for identical inputs", () => {
    const a = buildGraphView(engine, baseRequest());
    const b = buildGraphView(engine, baseRequest());
    expect(a.nodes.map((n) => n.id)).toEqual(b.nodes.map((n) => n.id));
    expect(a.edges.map((e) => e.id)).toEqual(b.edges.map((e) => e.id));
  });

  it("states truncation explicitly rather than silently dropping entities", () => {
    const view = buildGraphView(engine, baseRequest({ depth: 3 }));
    if (view.truncated) {
      expect(view.truncationReason).not.toBeNull();
      expect(view.nodeTotalAvailable).toBeGreaterThanOrEqual(view.nodes.length);
      expect(view.warnings.some((w) => w.code === "results-truncated")).toBe(true);
    } else {
      expect(view.truncationReason).toBeNull();
    }
  });

  it("always includes the root and only edges between visible nodes", () => {
    const view = buildGraphView(engine, baseRequest());
    const ids = new Set(view.nodes.map((n) => n.id));
    expect(ids.has(initial.nodeId!)).toBe(true);
    for (const e of view.edges) {
      expect(ids.has(e.edge.from)).toBe(true);
      expect(ids.has(e.edge.to)).toBe(true);
    }
  });

  it("scopes dependency and dependent directions correctly", () => {
    const deps = buildGraphView(engine, baseRequest({ direction: "dependencies" }));
    const dependents = buildGraphView(engine, baseRequest({ direction: "dependents" }));
    for (const n of deps.nodes) expect(n.side === "root" || n.side === "dependency").toBe(true);
    for (const n of dependents.nodes) expect(n.side === "root" || n.side === "dependent").toBe(true);
  });

  it("honours relationship type filters", () => {
    const view = buildGraphView(engine, baseRequest({ edgeTypes: ["DEPENDS_ON"] }));
    for (const e of view.edges) expect(e.edge.type).toBe("DEPENDS_ON");
  });

  it("excludes candidate relationships by default and labels them when included", () => {
    const off = buildGraphView(engine, baseRequest());
    expect(off.edges.every((e) => !e.candidate)).toBe(true);

    const on = buildGraphView(engine, baseRequest({ includeCandidates: true }));
    expect(on.edges.length).toBeGreaterThanOrEqual(off.edges.length);
    for (const e of toCanvasEdges(on).filter((_, i) => on.edges[i].candidate)) {
      expect(e.label).toContain("(candidate)");
      expect(e.dashed).toBe(true);
    }
  });

  it("distinguishes an unknown entity from an orphan", () => {
    const unknown = buildGraphView(engine, baseRequest({ rootId: "capability:does-not-exist" }));
    expect(unknown.emptyReason).toBe("unknown-entity");

    const orphan = engine.source.nodes.find(
      (n) => engine.getEdges(n.id, { direction: "both" }).resultCount === 0,
    );
    if (orphan) {
      const view = buildGraphView(engine, baseRequest({ rootId: orphan.id }));
      expect(["orphan-root", "confirmed-none-candidates-exist"]).toContain(view.emptyReason);
    }
  });

  it("reports filter-driven emptiness separately from structural emptiness", () => {
    const view = buildGraphView(engine, baseRequest({ edgeTypes: [] }));
    expect(view.emptyReason).toBe("no-matching-relationships");
    expect(view.edges.length).toBe(0);
  });

  it("does not mutate the canonical graph", () => {
    const nodeCount = engine.source.nodes.length;
    const edgeCount = engine.source.edges.length;
    const hash = engine.source.version.contentHash;
    for (const depth of GRAPH_DEPTHS) {
      buildGraphView(engine, baseRequest({ depth, includeCandidates: true }));
    }
    expect(engine.source.nodes.length).toBe(nodeCount);
    expect(engine.source.edges.length).toBe(edgeCount);
    expect(engine.source.version.contentHash).toBe(hash);
  });
});

describe("deterministic layout and presentation", () => {
  const view = buildGraphView(engine, baseRequest());

  it("positions every visible node and repeats positions exactly", () => {
    const a = layoutGraphView(view);
    const b = layoutGraphView(view);
    for (const n of view.nodes) {
      expect(a.positions.get(n.id)).toEqual(b.positions.get(n.id));
      expect(a.positions.has(n.id)).toBe(true);
    }
  });

  it("keeps the root centred with dependencies left and dependents right", () => {
    const layout = layoutGraphView(view);
    const rootX = layout.positions.get(view.rootId!)!.x;
    for (const n of view.nodes) {
      const x = layout.positions.get(n.id)!.x;
      if (n.side === "dependency") expect(x).toBeLessThan(rootX);
      if (n.side === "dependent") expect(x).toBeGreaterThan(rootX);
    }
  });

  it("renders the canonical node type as text on every node", () => {
    const nodes = toCanvasNodes(view, layoutGraphView(view));
    for (const [i, n] of nodes.entries()) {
      expect(n.sublabel).toContain(view.nodes[i].node.type);
    }
  });

  it("describes nodes without relying on colour", () => {
    const label = nodeAccessibleLabel(view.nodes[0]);
    expect(label).toContain(view.nodes[0].node.label);
    expect(label).toContain("registration");
  });
});

describe("selection highlighting", () => {
  it("highlights only neighbours already visible in the view", () => {
    const view = buildGraphView(engine, baseRequest());
    const { nodeIds, edgeIds } = neighborsWithinView(view, view.rootId);
    const visible = new Set(view.nodes.map((n) => n.id));
    for (const id of nodeIds) expect(visible.has(id)).toBe(true);
    const visibleEdges = new Set(view.edges.map((e) => e.id));
    for (const id of edgeIds) expect(visibleEdges.has(id)).toBe(true);
  });

  it("returns no highlights when nothing is selected", () => {
    const view = buildGraphView(engine, baseRequest());
    const { nodeIds, edgeIds } = neighborsWithinView(view, null);
    expect(nodeIds.size).toBe(0);
    expect(edgeIds.size).toBe(0);
  });
});

describe("route registration", () => {
  it("registers the graph route inside the guarded Capability Intelligence group", () => {
    const children = (capabilityIntelligenceRoutes.props.children as React.ReactElement[]).flat();
    expect(children.some((c) => c.props.path === "graph")).toBe(true);
    expect(capabilityIntelligenceRoutes.props.path).toBe("capability-intelligence");
  });
});
