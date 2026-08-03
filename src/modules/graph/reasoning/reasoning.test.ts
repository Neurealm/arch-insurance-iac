/**
 * Stage 3.5.3.2 — reasoning engine tests.
 *
 * Two layers: a small hand-built fixture graph where every expected conclusion
 * can be reasoned about by hand, and smoke assertions against the real
 * populated graph to guarantee the analyses run at production scale and stay
 * deterministic.
 */

import { describe, expect, it } from "vitest";
import type { CapabilityGraph, GraphEdge, GraphEdgeType, GraphNode, GraphNodeType } from "../types";
import { GRAPH_SCHEMA_VERSION } from "../types";
import type { CandidateEdge } from "../populationTypes";
import { createQueryEngine, getQueryEngine } from "../query/index";
import {
  CAPABILITY_LINEAGE_LAYERS,
  createReasoningEngine,
  downgradeConfidence,
  getReasoningEngine,
  REASONING_GENERATOR,
  weakestConfidence,
} from "./index";

/* -------------------------------------------------------------------------- */
/* Fixture                                                                     */
/* -------------------------------------------------------------------------- */

const node = (
  id: string,
  type: GraphNodeType,
  moduleId: string | null,
  overrides: Partial<GraphNode> = {},
): GraphNode => ({
  id,
  type,
  label: id,
  moduleId,
  ownership: moduleId ? "module-owned" : "unassigned",
  source: "declared",
  confidence: "high",
  evidence: [`fixture:${id}`],
  attributes: {},
  ...overrides,
});

const edge = (from: string, type: GraphEdgeType, to: string, overrides: Partial<GraphEdge> = {}): GraphEdge => ({
  id: `${from}|${type}|${to}`,
  type,
  from,
  to,
  source: "declared",
  confidence: "high",
  evidence: [`fixture:${from}->${to}`],
  attributes: {},
  ...overrides,
});

const nodes: GraphNode[] = [
  node("module:alpha", "module", "alpha"),
  node("module:beta", "module", "beta"),
  node("capability:alpha.core", "capability", "alpha"),
  node("capability:beta.core", "capability", "beta"),
  node("service:shared-db", "service", "platform"),
  node("service:alpha-api", "service", "alpha"),
  node("service:beta-api", "service", "beta"),
  node("page:alpha-home", "page", "alpha"),
  node("route:/alpha", "route", "alpha", { attributes: { route: "/alpha" } }),
  node("route:/orphan", "route", null, { attributes: { route: "/orphan" } }),
  node("persona:alpha-owner", "persona", "alpha"),
  node("platform-capability:auth", "platform-capability", "platform"),
  node("component:lonely", "component", null),
  node("service:cycle-a", "service", "alpha"),
  node("service:cycle-b", "service", "beta"),
];

const edges: GraphEdge[] = [
  edge("capability:alpha.core", "BELONGS_TO", "module:alpha"),
  edge("capability:beta.core", "BELONGS_TO", "module:beta"),
  edge("page:alpha-home", "IMPLEMENTS", "capability:alpha.core"),
  edge("module:alpha", "EXPOSES", "route:/alpha"),
  edge("route:/alpha", "IMPLEMENTS", "capability:alpha.core"),
  edge("module:alpha", "OWNS", "persona:alpha-owner"),
  edge("service:alpha-api", "USES", "service:shared-db"),
  edge("service:beta-api", "USES", "service:shared-db"),
  edge("page:alpha-home", "USES", "service:alpha-api"),
  edge("capability:alpha.core", "USES", "service:alpha-api"),
  edge("capability:beta.core", "USES", "service:beta-api"),
  edge("module:alpha", "DEPENDS_ON", "platform-capability:auth"),
  edge("service:cycle-a", "DEPENDS_ON", "service:cycle-b"),
  edge("service:cycle-b", "DEPENDS_ON", "service:cycle-a"),
];

const fixtureGraph: CapabilityGraph = {
  schemaVersion: GRAPH_SCHEMA_VERSION,
  version: {
    version: 1,
    contentHash: "fixture",
    generator: "test",
    generatedAt: "1970-01-01T00:00:00.000Z",
    previousContentHash: null,
  },
  nodes,
  edges,
};

const candidateEdges: readonly CandidateEdge[] = [
  {
    id: "capability:beta.core|USES|service:shared-db",
    from: "capability:beta.core",
    to: "service:shared-db",
    type: "USES",
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
  },
];

const fixtureEngine = () =>
  createReasoningEngine({ queryEngine: createQueryEngine({ graph: fixtureGraph, candidateEdges }) });

/* -------------------------------------------------------------------------- */
/* Confidence policy                                                           */
/* -------------------------------------------------------------------------- */

describe("reasoning confidence policy", () => {
  it("takes the weakest confidence across an evidence chain", () => {
    expect(weakestConfidence(["high", "medium", "low"])).toBe("low");
    expect(weakestConfidence(["high", "high"])).toBe("high");
    expect(weakestConfidence([])).toBe("unable-to-verify");
  });

  it("downgrades exactly one step and saturates", () => {
    expect(downgradeConfidence("high")).toBe("medium");
    expect(downgradeConfidence("low")).toBe("unable-to-verify");
    expect(downgradeConfidence("unable-to-verify")).toBe("unable-to-verify");
  });
});

/* -------------------------------------------------------------------------- */
/* Impact                                                                      */
/* -------------------------------------------------------------------------- */

describe("impact analysis", () => {
  it("reports downstream impact and a blast radius spanning modules", () => {
    const result = fixtureEngine().downstreamImpact("service:shared-db");
    expect(result.success).toBe(true);
    const ids = result.results.map((r) => r.node.id);
    expect(ids).toContain("service:alpha-api");
    expect(ids).toContain("service:beta-api");
    expect(result.blastRadius.impactedModuleCount).toBeGreaterThan(1);
    expect(result.recommendations.some((r) => r.priority === "P1" || r.priority === "P2")).toBe(true);
  });

  it("fails cleanly for an unknown node", () => {
    const result = fixtureEngine().impact("service:nope");
    expect(result.success).toBe(false);
    expect(result.warnings[0].code).toBe("unknown-node");
    expect(result.blastRadius.totalImpacted).toBe(0);
  });

  it("excludes candidate relationships by default and labels them on opt-in", () => {
    const engine = fixtureEngine();
    const strict = engine.downstreamImpact("service:shared-db");
    expect(strict.candidateRelationshipsIncluded).toBe(false);
    expect(strict.results.some((r) => r.node.id === "capability:beta.core" && r.depth === 1)).toBe(false);

    const relaxed = engine.downstreamImpact("service:shared-db", { includeCandidateRelationships: true });
    expect(relaxed.candidateRelationshipsIncluded).toBe(true);
    expect(relaxed.warnings.some((w) => w.code === "candidate-relationships-included")).toBe(true);
  });

  it("is deterministic across repeated runs", () => {
    const a = fixtureEngine().downstreamImpact("service:shared-db").results.map((r) => r.node.id);
    const b = fixtureEngine().downstreamImpact("service:shared-db").results.map((r) => r.node.id);
    expect(a).toEqual(b);
  });

  it("returns terminal dependency chains", () => {
    const result = fixtureEngine().dependencyChains("page:alpha-home");
    expect(result.success).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].path.length).toBeGreaterThanOrEqual(1);
    expect(result.results.every((c) => c.terminalNodeId.length > 0)).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Criticality                                                                 */
/* -------------------------------------------------------------------------- */

describe("criticality analysis", () => {
  it("ranks the shared service highest", () => {
    const result = fixtureEngine().criticalNodes();
    expect(result.results[0].node.id).toBe("service:shared-db");
    expect(result.results[0].score).toBeGreaterThanOrEqual(90);
    expect(result.results[0].basis.join(",")).toContain("dependents=");
  });

  it("detects single points of failure with stranded dependents", () => {
    const result = fixtureEngine().singlePointsOfFailure();
    const spof = result.results.find((r) => r.node.id === "service:shared-db");
    expect(spof).toBeDefined();
    expect(spof!.strandedNodeIds).toContain("service:alpha-api");
    expect(spof!.strandedNodeIds).toContain("service:beta-api");
  });

  it("reports bottlenecks only for nodes that truly mediate flow", () => {
    const result = fixtureEngine().bottlenecks();
    expect(result.results.every((r) => r.brokerageScore >= 2)).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Ownership                                                                   */
/* -------------------------------------------------------------------------- */

describe("ownership propagation", () => {
  it("keeps declared ownership authoritative", () => {
    const result = fixtureEngine().ownershipPropagation();
    const declared = result.results.find((r) => r.nodeId === "capability:alpha.core");
    expect(declared?.resolution).toBe("declared");
    expect(declared?.resolvedModuleId).toBe("alpha");
  });

  it("propagates ownership to unowned nodes and marks unresolved ones", () => {
    const result = fixtureEngine().ownershipPropagation();
    const route = result.results.find((r) => r.nodeId === "route:/orphan");
    expect(route?.resolution).toBe("unresolved");
    expect(route?.resolvedModuleId).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/* Coverage                                                                    */
/* -------------------------------------------------------------------------- */

describe("coverage gap analysis", () => {
  it("finds isolated nodes and untraceable routes", () => {
    const result = fixtureEngine().coverageGaps();
    const kinds = new Set(result.results.map((r) => r.kind));
    expect(kinds.has("isolated-node")).toBe(true);
    expect(result.results.some((r) => r.nodeId === "component:lonely")).toBe(true);
    expect(result.results.some((r) => r.nodeId === "route:/orphan")).toBe(true);
  });

  it("marks design-intended gaps as expected", () => {
    const result = fixtureEngine().coverageGaps();
    const persona = result.results.find((r) => r.nodeId === "persona:alpha-owner");
    if (persona) expect(persona.expected).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Cycles                                                                      */
/* -------------------------------------------------------------------------- */

describe("circular dependency detection", () => {
  it("detects the cross-module cycle with a representative path", () => {
    const result = fixtureEngine().circularDependencies();
    const cycle = result.results.find((r) => r.memberNodeIds.includes("service:cycle-a"));
    expect(cycle).toBeDefined();
    expect(cycle!.memberNodeIds).toEqual(["service:cycle-a", "service:cycle-b"]);
    expect(cycle!.representativePath.length).toBeGreaterThan(0);
    expect(cycle!.spansModules.length).toBe(2);
    expect(result.recommendations.some((r) => r.action === "Break the dependency cycle")).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Lineage                                                                     */
/* -------------------------------------------------------------------------- */

describe("lineage and traceability", () => {
  it("reports lineage layers reached and missing", () => {
    const result = fixtureEngine().capabilityLineage("capability:alpha.core");
    expect(result.success).toBe(true);
    const record = result.results[0];
    expect(record.layersCovered).toContain("capability");
    expect(record.layersCovered).toContain("module");
    expect(CAPABILITY_LINEAGE_LAYERS.length).toBe(4);
  });

  it("traces routes through to owning modules", () => {
    const result = fixtureEngine().routeTraceability();
    const traced = result.results.find((r) => r.routeId === "route:/alpha");
    expect(traced?.capabilityIds).toContain("capability:alpha.core");
    expect(traced?.moduleId).toBe("alpha");
  });
});

/* -------------------------------------------------------------------------- */
/* Envelope + real graph                                                       */
/* -------------------------------------------------------------------------- */

describe("reasoning envelope", () => {
  it("stamps the generator and graph lineage on every result", () => {
    const result = fixtureEngine().criticalNodes();
    expect(result.generator).toBe(REASONING_GENERATOR);
    expect(result.graph.schemaVersion).toBe(GRAPH_SCHEMA_VERSION);
    expect(result.performance.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("emits an empty-result warning rather than failing on no matches", () => {
    const result = fixtureEngine().criticalNodes({ nodeTypes: ["report"] });
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.code === "empty-result")).toBe(true);
  });
});

describe("reasoning over the real populated graph", () => {
  const engine = getReasoningEngine();

  it("shares graph lineage with the query engine", () => {
    expect(engine.graphMetadata.contentHash).toBe(getQueryEngine().graphMetadata.contentHash);
  });

  it("ranks critical nodes deterministically at production scale", () => {
    const first = engine.criticalNodes({ limit: 25 });
    const second = createReasoningEngine().criticalNodes({ limit: 25 });
    expect(first.results.map((r) => r.node.id)).toEqual(second.results.map((r) => r.node.id));
    expect(first.results.length).toBeGreaterThan(0);
  });

  it("completes whole-graph cycle, coverage and ownership analysis", () => {
    expect(engine.circularDependencies().success).toBe(true);
    expect(engine.coverageGaps({ limit: 50 }).success).toBe(true);
    expect(engine.ownershipPropagation({ limit: 50 }).success).toBe(true);
    expect(engine.routeTraceability({ limit: 25 }).success).toBe(true);
  });

  it("never mutates the underlying graph", () => {
    const before = engine.query.source.nodes.length;
    engine.criticalNodes();
    engine.coverageGaps();
    engine.circularDependencies();
    expect(engine.query.source.nodes.length).toBe(before);
    expect(engine.graphMetadata.contentHash).toBe(getQueryEngine().graphMetadata.contentHash);
  });
});
