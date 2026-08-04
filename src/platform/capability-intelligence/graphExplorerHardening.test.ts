/**
 * Stage 3.5.4.2.1 — Graph Explorer hardening: warning presentation, the
 * recommendation root policy, the `?root=` parameter contract and edge-limit
 * truncation.
 *
 * Pure unit coverage. Warnings are read from the existing graph-view result;
 * no second warning system and no additional query execution exist.
 */

import { describe, it, expect } from "vitest";
import type { CapabilityGraph, GraphEdge, GraphNode } from "@/modules/graph/types";
import { GRAPH_SCHEMA_VERSION } from "@/modules/graph/types";
import type { CandidateEdge } from "@/modules/graph/populationTypes";
import { createQueryEngine, getQueryEngine } from "@/modules/graph/query/index";
import { buildGraphView } from "./graph/graphView";
import { presentWarnings } from "./graph/graphWarnings";
import {
  recommendationRootExplanation,
  selectRecommendationGraphRoot,
} from "./graph/recommendationRoot";
import { resolveRootParam } from "./graph/exploreLink";
import {
  DEFAULT_EDGE_TYPES,
  DEFAULT_GRAPH_DEPTH,
  MAX_VISIBLE_EDGES,
  MAX_VISIBLE_NODES,
  type GraphViewRequest,
} from "./graph/graphViewTypes";
import { selectInitialRoot } from "./graph/initialRoot";

/* --------------------------------------------------------------- fixtures */

const node = (id: string): GraphNode => ({
  id,
  type: "service",
  label: id,
  moduleId: "fx",
  ownership: "module-owned",
  source: "declared",
  confidence: "high",
  evidence: [`fixture:${id}`],
  attributes: {},
});

const edge = (from: string, to: string): GraphEdge => ({
  id: `${from}|DEPENDS_ON|${to}`,
  type: "DEPENDS_ON",
  from,
  to,
  source: "declared",
  confidence: "high",
  evidence: [`fixture:${from}->${to}`],
  attributes: {},
});

/** Hub graph: `count` leaves plus dense inter-leaf edges. */
function hubGraph(count: number, extraRings: readonly number[]): CapabilityGraph {
  const nodes = [node("service:root"), ...Array.from({ length: count }, (_, i) => node(`service:n${i}`))];
  const edges: GraphEdge[] = Array.from({ length: count }, (_, i) => edge("service:root", `service:n${i}`));
  for (const step of extraRings) {
    for (let i = 0; i < count; i += 1) {
      edges.push(edge(`service:n${i}`, `service:n${(i + step) % count}`));
    }
  }
  return {
    schemaVersion: GRAPH_SCHEMA_VERSION,
    version: {
      version: 1,
      contentHash: "fixture",
      generator: "test",
      generatedAt: "1970-01-01T00:00:00.000Z",
      previousContentHash: null,
    },
    nodes,
    edges: edges.filter((e) => e.from !== e.to),
  };
}

const candidate = (from: string, to: string): CandidateEdge => ({
  id: `${from}|DEPENDS_ON|${to}`,
  from,
  to,
  type: "DEPENDS_ON",
  rationale: "Weak co-occurrence signal only.",
  provenance: {
    sourceType: "fixture",
    sourceId: "fixture:candidate",
    sourcePath: null,
    evidenceMethod: "co-occurrence",
    evidenceClassification: "weakly-inferred",
    evidenceStrength: null,
    validationState: "unvalidated",
    confidence: "low",
  },
});

const fixtureRequest = (over: Partial<GraphViewRequest> = {}): GraphViewRequest => ({
  rootId: "service:root",
  direction: "both",
  depth: DEFAULT_GRAPH_DEPTH,
  edgeTypes: ["DEPENDS_ON"],
  includeCandidates: false,
  ...over,
});

/* --------------------------------------------------- traversal warnings */

describe("Stage 3.5.4.2.1 — traversal warning presentation", () => {
  const engine = createQueryEngine({ graph: hubGraph(100, [1, 7]) });

  it("presents truncation warnings with title, explanation, actions and canonical code", () => {
    const view = buildGraphView(engine, fixtureRequest());
    const presented = presentWarnings(view);
    const truncation = presented.find((w) => w.code === "results-truncated");
    expect(truncation).toBeTruthy();
    expect(truncation!.title.length).toBeGreaterThan(0);
    expect(truncation!.explanation.length).toBeGreaterThan(20);
    expect(truncation!.actions.length).toBeGreaterThan(0);
    expect(truncation!.code).toBe("results-truncated");
  });

  it("matches the warning text to the underlying warning code, never inventing warnings", () => {
    const view = buildGraphView(engine, fixtureRequest());
    const presented = presentWarnings(view);
    expect(presented).toHaveLength(view.warnings.length);
    expect(presented.map((p) => p.code).sort()).toEqual([...view.warnings.map((w) => w.code)].sort());
    for (const p of presented) {
      expect(view.warnings.some((w) => w.message === p.detail)).toBe(true);
    }
  });

  it("renders multiple warnings deterministically and in a stable order", () => {
    const view = buildGraphView(engine, fixtureRequest({ depth: 3 }));
    const a = presentWarnings(view).map((w) => w.key);
    const b = presentWarnings(buildGraphView(engine, fixtureRequest({ depth: 3 }))).map((w) => w.key);
    expect(a).toEqual(b);
  });

  it("surfaces a depth-limit warning when the engine reports one", () => {
    const view = buildGraphView(engine, fixtureRequest({ depth: 1 }));
    const codes = view.warnings.map((w) => w.code);
    const presented = presentWarnings(view);
    if (codes.includes("depth-limit-reached")) {
      const depth = presented.find((w) => w.code === "depth-limit-reached")!;
      expect(depth.title).toBe("Depth limit reached");
      expect(depth.actions).toContain("Increase traversal depth");
      expect(depth.explanation).toContain("complete and valid");
    }
    expect(presented.every((p) => codes.includes(p.code))).toBe(true);
  });

  it("removes the warning once the condition clears", () => {
    const small = createQueryEngine({ graph: hubGraph(3, []) });
    const view = buildGraphView(small, fixtureRequest());
    expect(view.truncated).toBe(false);
    expect(presentWarnings(view).some((w) => w.code === "results-truncated")).toBe(false);
  });

  it("never mutates the graph-view result", () => {
    const view = buildGraphView(engine, fixtureRequest());
    const before = JSON.stringify(view.warnings);
    presentWarnings(view);
    presentWarnings(view);
    expect(JSON.stringify(view.warnings)).toBe(before);
  });
});

/* ------------------------------------------------------- edge truncation */

describe("Stage 3.5.4.2.1 — edge-limit truncation", () => {
  const engine = createQueryEngine({ graph: hubGraph(100, [1, 7]) });

  it("reduces more than 200 eligible relationships to exactly the limit", () => {
    const view = buildGraphView(engine, fixtureRequest());
    expect(view.edgeTotalAvailable).toBeGreaterThan(MAX_VISIBLE_EDGES);
    expect(view.edges.length).toBe(MAX_VISIBLE_EDGES);
    expect(view.truncated).toBe(true);
    expect(view.truncationReason).toBe("edges");
  });

  it("keeps the root and reports both visible and available totals", () => {
    const view = buildGraphView(engine, fixtureRequest());
    expect(view.nodes.some((n) => n.isRoot)).toBe(true);
    expect(view.nodes.length).toBeLessThanOrEqual(MAX_VISIBLE_NODES);
    expect(view.nodeTotalAvailable).toBeGreaterThanOrEqual(view.nodes.length);
    expect(view.edgeTotalAvailable).toBeGreaterThan(view.edges.length);
  });

  it("identifies the relationship limit in the warning", () => {
    const view = buildGraphView(engine, fixtureRequest());
    const warning = view.warnings.find((w) => w.message.includes("relationship limit"));
    expect(warning?.code).toBe("results-truncated");
    expect(warning?.message).toContain(String(MAX_VISIBLE_EDGES));
  });

  it("retains confirmed relationships before candidate relationships", () => {
    const withCandidates = createQueryEngine({
      graph: hubGraph(100, [1, 7]),
      candidateEdges: Array.from({ length: 40 }, (_, i) => candidate("service:root", `service:n${i}`)).map(
        (c, i) => ({ ...c, id: `${c.id}|candidate-${i}` }),
      ),
    });
    const view = buildGraphView(withCandidates, fixtureRequest({ includeCandidates: true }));
    expect(view.edges.length).toBe(MAX_VISIBLE_EDGES);
    expect(view.edges.every((e) => !e.candidate)).toBe(true);
  });

  it("produces the same retained edge set for reversed input order", () => {
    const graph = hubGraph(100, [1, 7]);
    const reversed = createQueryEngine({
      graph: { ...graph, nodes: [...graph.nodes].reverse(), edges: [...graph.edges].reverse() },
    });
    const a = buildGraphView(engine, fixtureRequest()).edges.map((e) => e.id);
    const b = buildGraphView(reversed, fixtureRequest()).edges.map((e) => e.id);
    expect(b).toEqual(a);
  });

  it("truncates nodes independently of edges", () => {
    const wide = createQueryEngine({ graph: hubGraph(300, []) });
    const view = buildGraphView(wide, fixtureRequest());
    expect(view.nodes.length).toBe(MAX_VISIBLE_NODES);
    expect(view.truncationReason).toBe("nodes");
  });

  it("reports both limits when both are exceeded", () => {
    const dense = createQueryEngine({ graph: hubGraph(300, [1, 7]) });
    const view = buildGraphView(dense, fixtureRequest());
    expect(view.truncationReason).toBe("both");
    expect(view.warnings.filter((w) => w.code === "results-truncated")).toHaveLength(2);
  });
});

/* -------------------------------------------- recommendation root policy */

describe("Stage 3.5.4.2.1 — recommendation graph-root policy", () => {
  const known = (ids: readonly string[]) => (id: string) => ids.includes(id);

  it("uses the single affected entity", () => {
    const s = selectRecommendationGraphRoot({ nodeIds: ["a"] }, known(["a"]));
    expect(s).toEqual({ rootId: "a", reason: "first-valid-affected", additionalAffectedCount: 0 });
  });

  it("prefers the recommendation subject when it resolves", () => {
    const s = selectRecommendationGraphRoot({ subject: "b", nodeIds: ["a", "b", "c"] }, known(["a", "b", "c"]));
    expect(s.rootId).toBe("b");
    expect(s.reason).toBe("subject");
    expect(s.additionalAffectedCount).toBe(2);
  });

  it("falls back to the first valid affected node in stable engine order", () => {
    const s = selectRecommendationGraphRoot({ subject: "missing", nodeIds: ["a", "b"] }, known(["a", "b"]));
    expect(s.rootId).toBe("a");
    expect(s.reason).toBe("first-valid-affected");
  });

  it("skips an invalid first entity and uses the next valid one", () => {
    const s = selectRecommendationGraphRoot({ nodeIds: ["ghost", "b", "c"] }, known(["b", "c"]));
    expect(s.rootId).toBe("b");
    expect(s.additionalAffectedCount).toBe(1);
  });

  it("returns no root when nothing resolves", () => {
    const s = selectRecommendationGraphRoot({ subject: "ghost", nodeIds: ["ghost", "phantom"] }, known([]));
    expect(s.rootId).toBeNull();
    expect(s.reason).toBe("none");
    expect(s.additionalAffectedCount).toBe(0);
  });

  it("respects the input order contract and is order sensitive by design", () => {
    const forward = selectRecommendationGraphRoot({ nodeIds: ["a", "b"] }, known(["a", "b"]));
    const reversed = selectRecommendationGraphRoot({ nodeIds: ["b", "a"] }, known(["a", "b"]));
    expect(forward.rootId).toBe("a");
    expect(reversed.rootId).toBe("b");
  });

  it("is stable for repeated identical input", () => {
    const input = { subject: null, nodeIds: ["a", "a", "b"] };
    const a = selectRecommendationGraphRoot(input, known(["a", "b"]));
    const b = selectRecommendationGraphRoot(input, known(["a", "b"]));
    expect(a).toEqual(b);
    expect(a.additionalAffectedCount).toBe(1);
  });

  it("communicates the root and additional affected entity count", () => {
    expect(
      recommendationRootExplanation(
        { rootId: "a", reason: "subject", additionalAffectedCount: 6 },
        "Route A",
      ),
    ).toBe("Explore from Route A, plus 6 additional affected entities");
    expect(
      recommendationRootExplanation({ rootId: "a", reason: "subject", additionalAffectedCount: 1 }, "Route A"),
    ).toBe("Explore from Route A, plus 1 additional affected entity");
    expect(
      recommendationRootExplanation({ rootId: "a", reason: "subject", additionalAffectedCount: 0 }, "Route A"),
    ).toBe("Explore from Route A");
    expect(
      recommendationRootExplanation({ rootId: null, reason: "none", additionalAffectedCount: 0 }, "x"),
    ).toContain("No affected entity");
  });
});

/* ------------------------------------------------- root parameter contract */

describe("Stage 3.5.4.2.1 — root parameter normalization", () => {
  const engine = getQueryEngine();
  const initial = selectInitialRoot(engine.source);

  it("treats a missing, empty or whitespace-only parameter as absent", () => {
    for (const raw of [null, undefined, "", " ", "   ", "\t", "\n \t"]) {
      expect(resolveRootParam(raw)).toBeNull();
    }
  });

  it("returns a non-empty parameter verbatim, never trimming a canonical id", () => {
    expect(resolveRootParam("capability:alpha")).toBe("capability:alpha");
    expect(resolveRootParam(" capability:alpha ")).toBe(" capability:alpha ");
  });

  it("resolves an absent root to the deterministic initial root", () => {
    const rootId = resolveRootParam("") ?? initial.nodeId;
    expect(rootId).toBe(initial.nodeId);
  });

  it("keeps an unknown non-empty root in the explicit unknown-entity state", () => {
    const view = buildGraphView(engine, {
      rootId: "capability:does-not-exist",
      direction: "both",
      depth: DEFAULT_GRAPH_DEPTH,
      edgeTypes: DEFAULT_EDGE_TYPES,
      includeCandidates: false,
    });
    expect(view.emptyReason).toBe("unknown-entity");
  });

  it("keeps whitespace-padded canonical ids invalid rather than silently resolving them", () => {
    const padded = ` ${initial.nodeId} `;
    expect(resolveRootParam(padded)).toBe(padded);
    const view = buildGraphView(engine, {
      rootId: padded,
      direction: "both",
      depth: DEFAULT_GRAPH_DEPTH,
      edgeTypes: DEFAULT_EDGE_TYPES,
      includeCandidates: false,
    });
    expect(view.emptyReason).toBe("unknown-entity");
  });

  it("uses the first value when a duplicate root parameter is supplied", () => {
    const params = new URLSearchParams("root=a&root=b");
    expect(resolveRootParam(params.get("root"))).toBe("a");
  });
});
