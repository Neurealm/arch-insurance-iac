/**
 * Stage 3.5.3.1 — Graph Query Engine test suite.
 *
 * Covers determinism, index integrity, filters, search, traversal, dependency
 * and impact semantics, explainability, error handling and the result contract.
 */

import { describe, expect, it, beforeAll } from "vitest";
import { getPopulatedGraph } from "../populate";
import { GRAPH_EDGE_TYPES, GRAPH_NODE_TYPES } from "../types";
import type { GraphNode } from "../types";
import { createQueryEngine, GraphQueryEngine } from "./QueryEngine";
import { GraphQueryError, RELATIONSHIP_SEMANTICS, DEPENDENCY_EDGE_TYPES } from "./QueryTypes";
import { buildGraphIndexes } from "./GraphIndexes";

let engine: GraphQueryEngine;
const populated = () => getPopulatedGraph();

beforeAll(() => {
  engine = createQueryEngine();
});

const ids = (nodes: readonly GraphNode[]) => nodes.map((n) => n.id);

describe("engine construction", () => {
  it("reads the authoritative populated graph without mutating it", () => {
    const before = JSON.stringify(populated().graph);
    createQueryEngine().findByType("capability");
    expect(JSON.stringify(populated().graph)).toBe(before);
  });

  it("exposes graph lineage metadata on every result", () => {
    const result = engine.findByType("module");
    expect(result.graph.contentHash).toBe(populated().graph.version.contentHash);
    expect(result.graph.nodeCount).toBe(populated().graph.nodes.length);
    expect(result.graph.edgeCount).toBe(populated().graph.edges.length);
    expect(result.graph.schemaVersion).toBe("1.0.0");
  });
});

describe("indexes", () => {
  it("indexes every node and every edge exactly once", () => {
    const { graph, candidateEdges } = populated();
    const indexes = buildGraphIndexes(graph, candidateEdges);
    expect(indexes.nodeById.size).toBe(graph.nodes.length);
    expect(indexes.edgeById.size).toBe(graph.edges.length);
    const typed = [...indexes.nodesByType.values()].reduce((sum, list) => sum + list.length, 0);
    expect(typed).toBe(graph.nodes.length);
  });

  it("builds identical indexes on repeated construction", () => {
    const { graph, candidateEdges } = populated();
    const a = buildGraphIndexes(graph, candidateEdges);
    const b = buildGraphIndexes(graph, candidateEdges);
    expect([...a.nodesByType.keys()]).toEqual([...b.nodesByType.keys()]);
    expect([...a.byToken.keys()]).toEqual([...b.byToken.keys()]);
  });

  it("keeps candidate edges out of the authoritative adjacency indexes", () => {
    const { graph, candidateEdges } = populated();
    const indexes = buildGraphIndexes(graph, candidateEdges);
    for (const candidate of candidateEdges) {
      expect(indexes.edgeById.has(candidate.id)).toBe(false);
    }
  });
});

describe("determinism", () => {
  it("returns byte-identical results across engine instances", () => {
    const a = createQueryEngine().findNodes({ nodeTypes: ["capability"] });
    const b = createQueryEngine().findNodes({ nodeTypes: ["capability"] });
    expect(ids(a.results)).toEqual(ids(b.results));
  });

  it("returns byte-identical traversal results across runs", () => {
    const run = () => engine.getDependencies("module:sre", { maxDepth: 3 }).results.map((h) => `${h.depth}:${h.node.id}`);
    expect(run()).toEqual(run());
  });

  it("orders nodes by type then id", () => {
    const results = engine.findByType("capability").results;
    const sorted = [...results].sort((x, y) => x.type.localeCompare(y.type) || x.id.localeCompare(y.id));
    expect(ids(results)).toEqual(ids(sorted));
  });

  it("produces stable search ordering", () => {
    const run = () => engine.search("sre").results.map((n) => n.id);
    expect(run()).toEqual(run());
  });
});

describe("core node access", () => {
  it("resolves a known node by id", () => {
    expect(engine.getNode("module:sre")?.type).toBe("module");
  });

  it("returns null for an unknown node", () => {
    expect(engine.getNode("module:does-not-exist")).toBeNull();
  });

  it("returns every node of a requested type", () => {
    const expected = populated().graph.nodes.filter((n) => n.type === "route").length;
    expect(engine.findByType("route").totalAvailable).toBe(expected);
  });

  it("supports every declared node type without throwing", () => {
    for (const type of GRAPH_NODE_TYPES) {
      expect(() => engine.findByType(type)).not.toThrow();
    }
  });
});

describe("filters", () => {
  it("filters by owner using the module attribution field", () => {
    const result = engine.findByOwner("sre");
    expect(result.resultCount).toBeGreaterThan(0);
    expect(result.results.every((n) => n.moduleId === "sre")).toBe(true);
  });

  it("filters by ownership class", () => {
    const result = engine.findNodes({ ownership: ["platform-owned"] });
    expect(result.results.every((n) => n.ownership === "platform-owned")).toBe(true);
  });

  it("composes multiple criteria with AND semantics by default", () => {
    const result = engine.findNodes({ nodeTypes: ["capability"], owners: ["sre"] });
    expect(result.results.every((n) => n.type === "capability" && n.moduleId === "sre")).toBe(true);
  });

  it("supports OR semantics on request", () => {
    const anyResult = engine.findNodes({ nodeTypes: ["module"], owners: ["sre"], matchMode: "any" });
    const allResult = engine.findNodes({ nodeTypes: ["module"], owners: ["sre"], matchMode: "all" });
    expect(anyResult.totalAvailable).toBeGreaterThanOrEqual(allResult.totalAvailable);
  });

  it("filters on arbitrary schema properties", () => {
    const result = engine.findNodes({
      properties: [{ property: "evidenceClassification", operator: "equals", value: "declared" }],
    });
    expect(result.results.every((n) => n.attributes.evidenceClassification === "declared")).toBe(true);
  });

  it("warns and matches nothing for fields absent from the schema", () => {
    const result = engine.findNodes({ technologies: ["react"] });
    expect(result.filtersApplied?.ignoredFields).toContain("technology");
    expect(result.warnings.some((w) => w.code === "unsupported-property")).toBe(true);
  });

  it("reports an empty result as a success with a warning", () => {
    const result = engine.findByOwner("no-such-module");
    expect(result.success).toBe(true);
    expect(result.resultCount).toBe(0);
    expect(result.warnings.some((w) => w.code === "empty-result")).toBe(true);
  });

  it("paginates deterministically", () => {
    const all = engine.findByType("route").results;
    const page = engine.findByType("route", { limit: 5, offset: 5 });
    expect(ids(page.results)).toEqual(ids(all.slice(5, 10)));
    expect(page.truncated).toBe(true);
  });
});

describe("search", () => {
  it("ranks an exact id match first", () => {
    const result = engine.search("module:sre");
    expect(result.results[0]?.id).toBe("module:sre");
  });

  it("matches case-insensitively by default", () => {
    expect(engine.search("Reliability").resultCount).toBe(engine.search("reliability").resultCount);
  });

  it("restricts search to requested fields", () => {
    const result = engine.search("src/pages", { fields: ["filePath"], limit: 5 });
    expect(result.results.every((n) => (n.filePath ?? "").includes("src/pages"))).toBe(true);
  });

  it("finds nodes by exact label", () => {
    const first = populated().graph.nodes[0];
    expect(ids(engine.findByLabel(first.label).results)).toContain(first.id);
  });

  it("returns an empty successful result for an unmatched term", () => {
    const result = engine.search("zzz-not-present-anywhere");
    expect(result.success).toBe(true);
    expect(result.resultCount).toBe(0);
  });
});

describe("traversal", () => {
  it("respects the depth limit", () => {
    const result = engine.traverseFrom("module:sre", { direction: "in", maxDepth: 1 });
    expect(result.results.every((h) => h.depth <= 1)).toBe(true);
    expect(result.traversal?.maxDepth).toBe(1);
  });

  it("returns direct neighbours only", () => {
    const result = engine.getNeighbors("module:sre");
    expect(result.results.every((h) => h.depth === 1)).toBe(true);
  });

  it("is cycle safe", () => {
    const result = engine.traverseFrom("module:sre", { direction: "both", maxDepth: 6 });
    const visited = result.results.map((h) => h.node.id);
    expect(new Set(visited).size).toBe(visited.length);
  });

  it("produces the same node set for bfs and dfs", () => {
    const bfs = engine.traverseFrom("module:sre", { direction: "in", strategy: "bfs", maxDepth: 3 });
    const dfs = engine.traverseFrom("module:sre", { direction: "in", strategy: "dfs", maxDepth: 3 });
    expect(new Set(bfs.results.map((h) => h.node.id))).toEqual(new Set(dfs.results.map((h) => h.node.id)));
  });

  it("filters traversal by edge type", () => {
    const result = engine.traverseFrom("module:sre", { direction: "in", edgeTypes: ["BELONGS_TO"], maxDepth: 2 });
    expect(result.traversal?.edgeTypesTraversed.every((t) => t === "BELONGS_TO")).toBe(true);
  });

  it("filters traversal by node type", () => {
    const result = engine.traverseFrom("module:sre", { direction: "in", nodeTypes: ["capability"], maxDepth: 3 });
    expect(result.results.every((h) => h.node.type === "capability")).toBe(true);
  });

  it("returns paths when requested", () => {
    const result = engine.traverseFrom("module:sre", { direction: "in", maxDepth: 2, includePaths: true });
    expect(result.results[0]?.path?.nodeIds[0]).toBe("module:sre");
  });

  it("excludes candidate relationships by default", () => {
    const result = engine.traverseFrom("module:sre", { direction: "both", maxDepth: 2 });
    expect(result.traversal?.candidateRelationshipsIncluded).toBe(false);
  });

  it("labels candidate relationships when explicitly included", () => {
    const candidate = populated().candidateEdges[0];
    const result = engine.getEdges(candidate.from, { includeCandidateRelationships: true });
    const hit = result.results.find((e) => e.id === candidate.id);
    expect(hit?.candidate).toBe(true);
    expect(result.warnings.some((w) => w.code === "candidate-relationships-included")).toBe(true);
  });
});

describe("dependency and impact", () => {
  it("classifies every relationship type", () => {
    for (const type of GRAPH_EDGE_TYPES) {
      expect(RELATIONSHIP_SEMANTICS[type]).toBeTruthy();
    }
  });

  it("follows only dependency-bearing edges for dependencies", () => {
    const result = engine.getDependencies("module:sre", { maxDepth: 3 });
    expect(
      result.traversal?.edgeTypesTraversed.every((t) => DEPENDENCY_EDGE_TYPES.includes(t as never)),
    ).toBe(true);
  });

  it("treats dependents as the inverse of dependencies", () => {
    const dependencies = engine.getDependencies("module:sre", { maxDepth: 1 }).results.map((h) => h.node.id);
    for (const id of dependencies) {
      const dependents = engine.getDependents(id, { maxDepth: 1 }).results.map((h) => h.node.id);
      expect(dependents).toContain("module:sre");
    }
  });

  it("returns a wider set for downstream impact than for direct dependents", () => {
    const target = engine.findByType("capability").results[0]!.id;
    const impact = engine.getDownstreamImpact(target).totalAvailable;
    const dependents = engine.getDependents(target).totalAvailable;
    expect(impact).toBeGreaterThanOrEqual(dependents);
  });

  it("reports no dependency cycles in the authoritative graph", () => {
    expect(engine.findDependencyCycles("module:sre").resultCount).toBe(0);
  });
});

describe("paths", () => {
  it("finds a shortest path between connected nodes", () => {
    const child = engine.getChildren("module:sre").results[0]!.node.id;
    const result = engine.findShortestPath(child, "module:sre");
    expect(result.results[0]?.nodeIds.at(-1)).toBe("module:sre");
  });

  it("returns an empty successful result when unreachable", () => {
    const permission = engine.findByType("permission").results[0]!.id;
    const result = engine.findShortestPath("module:sre", permission, { maxDepth: 1 });
    expect(result.success).toBe(true);
    expect(result.resultCount).toBe(0);
  });

  it("enumerates simple paths without repeating a node", () => {
    const child = engine.getChildren("module:sre").results[0]!.node.id;
    const result = engine.findAllPaths(child, "module:sre", { maxDepth: 4, maxPaths: 10 });
    for (const path of result.results) {
      expect(new Set(path.nodeIds).size).toBe(path.nodeIds.length);
    }
  });
});

describe("explainability", () => {
  it("explains why a node matched a filter", () => {
    const result = engine.findNodes({ owners: ["sre"], nodeTypes: ["capability"] }, { explain: true, limit: 1 });
    const explanation = result.explanation?.[0];
    expect(explanation?.matchedFilters.map((m) => m.field)).toContain("owner");
  });

  it("explains traversal distance and path", () => {
    const result = engine.getChildren("module:sre", { explain: true, limit: 1 });
    expect(result.explanation?.[0]?.distance).toBe(1);
    expect(result.explanation?.[0]?.path?.nodeIds.length).toBe(2);
  });

  it("explains search ranking", () => {
    const result = engine.search("module:sre", { explain: true, limit: 1 });
    expect(result.explanation?.[0]?.searchMatches?.[0]?.matchType).toBe("exact-id");
  });

  it("summarises the filters actually applied", () => {
    const result = engine.findNodes({ nodeTypes: ["module"], text: "reliability" });
    expect(result.filtersApplied?.criteria.map((c) => c.field)).toEqual(["nodeType", "text"]);
  });
});

describe("error handling", () => {
  it("fails typed for an unknown start node", () => {
    const result = engine.getDependencies("module:nope");
    expect(result.success).toBe(false);
    expect(result.warnings[0]?.code).toBe("unknown-node");
  });

  it("throws for an unknown node type", () => {
    expect(() => engine.findNodes({ nodeTypes: ["not-a-type" as never] })).toThrow(GraphQueryError);
  });

  it("throws for an unknown edge type", () => {
    expect(() => engine.traverseFrom("module:sre", { edgeTypes: ["NOPE" as never] })).toThrow(GraphQueryError);
  });

  it("throws for a negative depth", () => {
    expect(() => engine.traverseFrom("module:sre", { maxDepth: -1 })).toThrow(GraphQueryError);
  });

  it("throws for an invalid limit", () => {
    expect(() => engine.findByType("module", { limit: -5 })).toThrow(GraphQueryError);
  });
});

describe("result contract", () => {
  it("returns the same envelope shape from every query family", () => {
    const results = [
      engine.findByType("module"),
      engine.search("sre"),
      engine.getNeighbors("module:sre"),
      engine.getCandidateRelationships(),
    ];
    for (const result of results) {
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining([
          "success",
          "results",
          "resultCount",
          "totalAvailable",
          "truncated",
          "warnings",
          "performance",
          "graph",
        ]),
      );
      expect(result.resultCount).toBe(result.results.length);
      expect(result.performance.executionTimeMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("builds a consistent induced subgraph", () => {
    const sub = engine.subgraph(["module:sre"], { direction: "in", edgeTypes: ["BELONGS_TO"], maxDepth: 2 });
    const nodeIds = new Set(sub.nodes.map((n) => n.id));
    expect(sub.edges.every((e) => nodeIds.has(e.from) && nodeIds.has(e.to))).toBe(true);
  });

  it("keeps candidate relationships out of default edge queries", () => {
    const candidate = populated().candidateEdges[0];
    const result = engine.getEdges(candidate.from);
    expect(result.results.some((e) => e.id === candidate.id)).toBe(false);
  });
});
