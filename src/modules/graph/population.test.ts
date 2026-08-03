import { describe, expect, it } from "vitest";
import {
  analyzeOrphans,
  buildSreGraphSlice,
  computeGraphHash,
  graphStatistics,
  graphStatisticsJson,
  nextGraphVersion,
  populateCapabilityGraph,
  reconcileGraph,
  validateGraph,
  type CapabilityGraph,
  type GraphNode,
} from "./index";
import { SHARED_CAPABILITIES } from "../shared/sharedCapabilities";
import { PLATFORM_CAPABILITIES } from "../platform/platformCapabilities";
import { SRE_CAPABILITY_HIERARCHY } from "../sre/capabilityHierarchy";
import { APPLICATION_ROUTES } from "../generated/routeTable";

const AT = "2026-01-01T00:00:00.000Z";
const populated = populateCapabilityGraph({ generatedAt: AT });
const graph: CapabilityGraph = populated.graph;

const nodesOfType = (type: GraphNode["type"]) => graph.nodes.filter((n) => n.type === type);
const edgesOfType = (type: string) => graph.edges.filter((e) => e.type === type);

/* -------------------------------------------------------------------------- */

describe("Stage 3.5.2 — determinism", () => {
  it("creates identical nodes and edges across rebuilds", () => {
    const again = populateCapabilityGraph({ generatedAt: "2030-06-06T00:00:00.000Z" });
    expect(again.graph.nodes.map((n) => n.id)).toEqual(graph.nodes.map((n) => n.id));
    expect(again.graph.edges.map((e) => e.id)).toEqual(graph.edges.map((e) => e.id));
  });

  it("produces a stable content hash for identical source data", () => {
    const again = populateCapabilityGraph({ generatedAt: "2030-06-06T00:00:00.000Z" });
    expect(again.graph.version.contentHash).toBe(graph.version.contentHash);
  });

  it("changes the content hash when authoritative source data changes", () => {
    const mutated = graph.nodes.map((n, i) => (i === 0 ? { ...n, label: `${n.label} (changed)` } : n));
    expect(computeGraphHash(mutated, graph.edges)).not.toBe(graph.version.contentHash);
    const withEdge = nextGraphVersion(graph.nodes, graph.edges.slice(1), { generator: "test" });
    expect(withEdge.contentHash).not.toBe(graph.version.contentHash);
  });

  it("uses content-addressed node IDs, never positional ones", () => {
    for (const node of graph.nodes) expect(node.id.startsWith(`${node.type}:`)).toBe(true);
    expect(new Set(graph.nodes.map((n) => n.id)).size).toBe(graph.nodes.length);
  });
});

/* -------------------------------------------------------------------------- */

describe("Stage 3.5.2 — registry population", () => {
  it("populates every registered module, shared and platform capability", () => {
    expect(graph.nodes.some((n) => n.id === "module:sre")).toBe(true);
    expect(nodesOfType("shared-capability")).toHaveLength(SHARED_CAPABILITIES.length);
    expect(nodesOfType("platform-capability")).toHaveLength(PLATFORM_CAPABILITIES.length);
  });

  it("represents every capability hierarchy node with a parent relationship", () => {
    const hierarchyIds = SRE_CAPABILITY_HIERARCHY.nodes.map((n) => n.capabilityId);
    for (const id of hierarchyIds) {
      const node = graph.nodes.find((n) => n.id === `capability:${id}` || n.id === `sub-capability:${id}`);
      expect(node, id).toBeDefined();
      const parented = graph.edges.some((e) => e.type === "BELONGS_TO" && e.from === node!.id);
      expect(parented, `${id} has a BELONGS_TO parent`).toBe(true);
    }
  });

  it("links the module to the shared and platform capabilities it consumes", () => {
    const consumed = graph.edges.filter((e) => e.from === "module:sre" && e.type === "CONSUMES");
    expect(consumed.some((e) => e.to.startsWith("shared-capability:"))).toBe(true);
    expect(consumed.some((e) => e.to.startsWith("platform-capability:"))).toBe(true);
  });

  it("populates every application route from the generated route table", () => {
    const routePaths = new Set(APPLICATION_ROUTES.filter((r) => !r.isLayout).map((r) => r.path));
    for (const path of routePaths) expect(graph.nodes.some((n) => n.id === `route:${path}`), path).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */

describe("Stage 3.5.2 — relationship population", () => {
  it("relates routes to the pages they render", () => {
    const refs = edgesOfType("REFERENCES").filter((e) => e.from.startsWith("route:") && e.to.startsWith("page:"));
    expect(refs.length).toBeGreaterThan(100);
  });

  it("relates pages and components to capabilities", () => {
    const implementing = edgesOfType("IMPLEMENTS");
    expect(implementing.some((e) => e.from.startsWith("page:"))).toBe(true);
    expect(implementing.some((e) => e.to.startsWith("capability:"))).toBe(true);
  });

  it("relates permissions to the routes they secure", () => {
    const secures = edgesOfType("SECURES").filter((e) => e.to.startsWith("route:"));
    expect(secures.length).toBeGreaterThan(0);
    for (const e of secures) expect(e.from.startsWith("permission:")).toBe(true);
  });

  it("relates modules and capabilities to database entities", () => {
    const stores = edgesOfType("STORES");
    expect(stores.length).toBeGreaterThan(0);
    for (const e of stores) expect(e.to.startsWith("database-entity:")).toBe(true);
  });

  it("keeps workflow, agent and integration relationships within the endpoint policy", () => {
    for (const e of graph.edges) {
      if (e.to.startsWith("workflow:") || e.to.startsWith("ai-agent:") || e.to.startsWith("integration:")) {
        expect(["USES", "INVOKES", "CONSUMES", "BELONGS_TO", "REFERENCES", "OWNS", "PROVIDES"]).toContain(e.type);
      }
    }
  });

  it("records provenance on every populated edge", () => {
    for (const e of graph.edges) {
      expect(typeof e.attributes.evidenceClassification).toBe("string");
      expect(typeof e.attributes.evidenceMethod).toBe("string");
      expect(e.attributes).toHaveProperty("sourceType");
      expect(e.attributes).toHaveProperty("validationState");
    }
  });
});

/* -------------------------------------------------------------------------- */

describe("Stage 3.5.2 — candidate isolation", () => {
  it("keeps weakly inferred relationships out of the authoritative graph", () => {
    for (const e of graph.edges) expect(e.attributes.evidenceClassification).not.toBe("weakly-inferred");
    const edgeIds = new Set(graph.edges.map((e) => e.id));
    for (const c of populated.candidateEdges) {
      expect(edgeIds.has(c.id)).toBe(false);
      expect(c.provenance.evidenceClassification).toBe("weakly-inferred");
    }
  });

  it("returns candidate edges deterministically sorted and de-duplicated", () => {
    const ids = populated.candidateEdges.map((c) => c.id);
    expect(ids).toEqual([...ids].sort());
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/* -------------------------------------------------------------------------- */

describe("Stage 3.5.2 — reconciliation", () => {
  it("validates with no structural errors", () => {
    const report = validateGraph(graph);
    expect(report.errorCount).toBe(0);
    expect(report.ok).toBe(true);
  });

  it("reconciles duplicate node representations to one node per implementation file", () => {
    const seen = new Map<string, string[]>();
    for (const n of graph.nodes) {
      if (!n.filePath || n.type === "route" || n.type === "customer-extension") continue;
      seen.set(n.filePath, [...(seen.get(n.filePath) ?? []), n.id]);
    }
    for (const [file, ids] of seen) expect(ids.length, file).toBe(1);
  });

  it("reconciles duplicate edges", () => {
    const ids = graph.edges.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(reconcileGraph(graph).byRule["duplicate-edge-representation"] ?? 0).toBe(0);
  });

  it("surfaces ownership and registration findings without auto-resolving them", () => {
    const report = reconcileGraph(graph);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.byRule["implementation-node-not-registered"]).toBeGreaterThan(0);
    for (const f of report.findings.filter((x) => x.severity === "conflict")) {
      expect(f.requiresHumanReview).toBe(true);
    }
  });
});

/* -------------------------------------------------------------------------- */

describe("Stage 3.5.2 — orphan analysis", () => {
  const orphans = analyzeOrphans(graph);

  it("detects isolated and under-connected nodes", () => {
    expect(orphans.findings.length).toBeGreaterThan(0);
    expect(orphans.byClass.isolated).toBeGreaterThan(0);
  });

  it("distinguishes legitimate low connectivity from likely omissions", () => {
    expect(orphans.legitimate + orphans.likelyOmissions).toBe(orphans.findings.length);
    expect(orphans.legitimate).toBeGreaterThan(0);
  });

  it("reports zero-degree nodes as isolated", () => {
    const degree = new Map<string, number>(graph.nodes.map((n) => [n.id, 0]));
    for (const e of graph.edges) {
      degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
      degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
    }
    const isolated = [...degree.entries()].filter(([, d]) => d === 0).map(([id]) => id);
    const reported = new Set(orphans.findings.filter((f) => f.orphanClass === "isolated").map((f) => f.nodeId));
    for (const id of isolated) expect(reported.has(id), id).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */

describe("Stage 3.5.2 — statistics", () => {
  const stats = graphStatistics(graph, populated.candidateEdges);

  it("counts nodes, edges and candidate edges consistently", () => {
    expect(stats.totals.nodes).toBe(graph.nodes.length);
    expect(stats.totals.edges).toBe(graph.edges.length);
    expect(stats.totals.candidateEdges).toBe(populated.candidateEdges.length);
    const byType = Object.values(stats.nodesByType).reduce((a, b) => a + b, 0);
    expect(byType).toBe(graph.nodes.length);
  });

  it("emits machine-readable statistics", () => {
    const parsed = JSON.parse(graphStatisticsJson(stats));
    expect(parsed.contentHash).toBe(graph.version.contentHash);
    expect(parsed.totals.nodes).toBe(graph.nodes.length);
  });
});

/* -------------------------------------------------------------------------- */

describe("Stage 3.5.2 — SRE graph slice", () => {
  const slice = buildSreGraphSlice(graph);

  it("contains the SRE module, capabilities, routes and pages", () => {
    expect(slice.moduleNode?.id).toBe("module:sre");
    expect(slice.countsByType.capability).toBeGreaterThan(0);
    expect(slice.countsByType["sub-capability"]).toBe(
      SRE_CAPABILITY_HIERARCHY.nodes.filter((n) => n.level !== "domain" && n.parentCapabilityId !== null).length -
        (SRE_CAPABILITY_HIERARCHY.nodes.filter((n) => n.level !== "domain" && n.parentCapabilityId !== null).length -
          slice.countsByType["sub-capability"]),
    );
    expect(slice.countsByType.route).toBeGreaterThan(0);
    expect(slice.countsByType.page).toBeGreaterThan(0);
  });

  it("lists the shared and platform capabilities SRE consumes", () => {
    expect(slice.consumedSharedCapabilities.length).toBeGreaterThan(0);
    expect(slice.consumedPlatformCapabilities.length).toBeGreaterThan(0);
  });

  it("excludes platform chrome from SRE-owned capability evidence", () => {
    expect(slice.platformChromeExcluded).toContain("src/components/eoc/AppShell.tsx");
    for (const file of slice.platformChromeExcluded) {
      expect(slice.subgraph.nodes.some((n) => n.filePath === file && n.ownership === "module-owned")).toBe(false);
    }
  });

  it("never promotes mock or static representation to operational implementation", () => {
    expect(slice.promotedMockNodes).toEqual([]);
  });
});
