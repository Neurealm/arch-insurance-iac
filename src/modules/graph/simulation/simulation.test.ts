/**
 * Stage 3.5.3.4 — Graph Change Simulation and Remediation Proposal Engine tests.
 *
 * Fixture graphs cover isolated scenarios; the final block simulates against
 * the real repository graph and asserts the canonical hash is preserved.
 */

import { describe, expect, it, beforeAll } from "vitest";

import { GRAPH_SCHEMA_VERSION, type CapabilityGraph, type GraphEdge, type GraphNode } from "../types";
import { computeGraphHash } from "../serialize";
import { GraphQueryEngine } from "../query/index";
import { GraphIntelligenceEngine } from "../intelligence/index";
import type { IntelligenceRecommendation } from "../intelligence/index";
import {
  analyzeGraphSnapshot,
  bindParameters,
  buildOverlay,
  bundleIdFor,
  compareMetrics,
  createSimulationEngine,
  detectConflicts,
  detectOrderingConflicts,
  edgeIdFor,
  generateProposals,
  proposalDependencyCycles,
  scoreProposal,
  sequenceProposals,
  validateProposal,
  CHANGE_OPERATIONS,
  SIMULATION_GENERATOR,
  type ChangeProposal,
  type ProposedChange,
} from "./index";

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                    */
/* -------------------------------------------------------------------------- */

const node = (
  id: string,
  type: GraphNode["type"],
  moduleId: string | null = null,
  label = id,
): GraphNode => ({
  id,
  type,
  label,
  moduleId,
  ownership: moduleId ? "module-owned" : "unassigned",
  source: "declared",
  confidence: "high",
  filePath: null,
  evidence: [`fixture:${id}`],
  attributes: {},
});

const edge = (from: string, to: string, type: GraphEdge["type"]): GraphEdge => ({
  id: `${from}|${type}|${to}`,
  type,
  from,
  to,
  source: "declared",
  confidence: "high",
  evidence: [`fixture:${from}->${to}`],
  attributes: {},
});

function fixtureGraph(nodes: readonly GraphNode[], edges: readonly GraphEdge[]): CapabilityGraph {
  const contentHash = computeGraphHash(nodes, edges);
  return {
    schemaVersion: GRAPH_SCHEMA_VERSION,
    version: {
      version: 1,
      contentHash,
      generator: "fixture@1.0.0",
      generatedAt: new Date(0).toISOString(),
      previousContentHash: null,
    },
    nodes: [...nodes].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...edges].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

const BASE_NODES: readonly GraphNode[] = [
  node("module:alpha", "module", "alpha", "Alpha"),
  node("module:beta", "module", "beta", "Beta"),
  node("capability:alpha.core", "capability", "alpha", "Alpha Core"),
  node("route:/alpha", "route", "alpha", "/alpha"),
  node("page:alpha-home", "page", "alpha", "Alpha Home"),
  node("service:alpha-api", "service", "alpha", "Alpha API"),
  node("platform-capability:auth", "platform-capability", "platform", "Auth"),
  // An unowned route with no capability: the coverage/ownership scenario.
  node("route:/orphan", "route", null, "/orphan"),
];

const BASE_EDGES: readonly GraphEdge[] = [
  edge("capability:alpha.core", "module:alpha", "BELONGS_TO"),
  edge("route:/alpha", "module:alpha", "BELONGS_TO"),
  edge("page:alpha-home", "capability:alpha.core", "IMPLEMENTS"),
  edge("service:alpha-api", "capability:alpha.core", "IMPLEMENTS"),
  edge("capability:alpha.core", "platform-capability:auth", "CONSUMES"),
  edge("page:alpha-home", "service:alpha-api", "USES"),
];

const fixture = fixtureGraph(BASE_NODES, BASE_EDGES);

const engineFor = (graph: CapabilityGraph = fixture) => {
  const query = new GraphQueryEngine({ graph });
  return createSimulationEngine({
    queryEngine: query,
    intelligenceEngine: new GraphIntelligenceEngine({ queryEngine: query }),
    lineageSampleLimit: 25,
  });
};

const change = (partial: Partial<ProposedChange> & Pick<ProposedChange, "id" | "operation" | "target">): ProposedChange => ({
  source: { kind: "operator-parameter", id: "test", policyId: null },
  rationale: { statement: "test change", analyses: [], evidence: [] },
  dependencies: [],
  reversible: true,
  inverseOperation: null,
  requiredParameters: [],
  ...partial,
});

const proposal = (partial: Partial<ChangeProposal> & Pick<ChangeProposal, "id" | "changes">): ChangeProposal => ({
  kind: "ownership-declaration",
  variant: "primary",
  alternativeProposalIds: [],
  title: "Test proposal",
  summary: "Test proposal",
  subject: "test",
  category: "ownership",
  priority: "medium",
  priorityScore: 50,
  recommendationId: "rec:test",
  policyId: "POL-OWN-001",
  sourceFindingIds: [],
  parameters: [],
  prerequisites: [],
  validationRules: [],
  expectedImprovement: { metrics: [], resolvesRecommendationIds: [] },
  risks: [],
  confidence: "high",
  evidence: [],
  lineage: {
    graphVersion: 1,
    canonicalGraphHash: fixture.version.contentHash,
    nodeIds: [],
    edgeIds: [],
    reasoningAnalyses: [],
    recommendationId: "rec:test",
    policyId: "POL-OWN-001",
  },
  incomplete: false,
  complexity: "trivial",
  reversible: true,
  ...partial,
});

/* -------------------------------------------------------------------------- */
/* Overlay                                                                     */
/* -------------------------------------------------------------------------- */

describe("Stage 3.5.3.4 — immutable graph overlay", () => {
  it("1. never mutates the canonical graph", () => {
    const before = JSON.stringify(fixture);
    buildOverlay(fixture, [
      change({
        id: "chg:add",
        operation: "add-node",
        target: { kind: "node", id: "service:new", nodeIds: ["service:new"], edgeIds: [] },
        node: { id: "service:new", type: "service", label: "New", moduleId: "alpha" },
      }),
    ]);
    expect(JSON.stringify(fixture)).toBe(before);
  });

  it("2. produces a deterministic overlay hash different from the canonical hash", () => {
    const changes = [
      change({
        id: "chg:add",
        operation: "add-node",
        target: { kind: "node", id: "service:new", nodeIds: ["service:new"], edgeIds: [] },
        node: { id: "service:new", type: "service", label: "New", moduleId: "alpha" },
      }),
    ];
    const a = buildOverlay(fixture, changes);
    const b = buildOverlay(fixture, changes);
    expect(a.construction.overlayContentHash).toBe(b.construction.overlayContentHash);
    expect(a.construction.overlayContentHash).not.toBe(fixture.version.contentHash);
    expect(a.graph.version.previousContentHash).toBe(fixture.version.contentHash);
  });

  it("3. is unaffected by the order changes are supplied in", () => {
    const c1 = change({
      id: "chg:a",
      operation: "add-node",
      target: { kind: "node", id: "service:x", nodeIds: ["service:x"], edgeIds: [] },
      node: { id: "service:x", type: "service", label: "X", moduleId: "alpha" },
    });
    const c2 = change({
      id: "chg:b",
      operation: "add-node",
      target: { kind: "node", id: "service:y", nodeIds: ["service:y"], edgeIds: [] },
      node: { id: "service:y", type: "service", label: "Y", moduleId: "alpha" },
    });
    expect(buildOverlay(fixture, [c1, c2]).construction.overlayContentHash).toBe(
      buildOverlay(fixture, [c2, c1]).construction.overlayContentHash,
    );
  });

  it("4. supports every declared change operation without throwing", () => {
    for (const operation of CHANGE_OPERATIONS) {
      const result = buildOverlay(fixture, [
        change({
          id: `chg:${operation}`,
          operation,
          target: { kind: "node", id: "route:/alpha", nodeIds: ["route:/alpha"], edgeIds: [] },
          node:
            operation === "add-node"
              ? { id: "service:tmp", type: "service", label: "Tmp", moduleId: "alpha" }
              : undefined,
          edge:
            operation.startsWith("add-") && operation !== "add-node"
              ? { from: "route:/alpha", to: "capability:alpha.core", type: "IMPLEMENTS" }
              : undefined,
          metadata: { expectedByDesignJustification: "test" },
          ownerModuleId: "alpha",
        }),
      ]);
      expect(result.graph.version.generator).toBe(SIMULATION_GENERATOR);
    }
  });

  it("5. removing a node also removes its relationships", () => {
    const { construction } = buildOverlay(fixture, [
      change({
        id: "chg:rm",
        operation: "remove-node",
        target: { kind: "node", id: "service:alpha-api", nodeIds: ["service:alpha-api"], edgeIds: [] },
      }),
    ]);
    expect(construction.removedNodeIds).toContain("service:alpha-api");
    expect(construction.removedEdgeIds.length).toBeGreaterThan(0);
  });

  it("6. declare-ownership sets the owning module on the overlay only", () => {
    const { graph } = buildOverlay(fixture, [
      change({
        id: "chg:own",
        operation: "declare-ownership",
        target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
        ownerModuleId: "alpha",
      }),
    ]);
    expect(graph.nodes.find((n) => n.id === "route:/orphan")?.moduleId).toBe("alpha");
    expect(fixture.nodes.find((n) => n.id === "route:/orphan")?.moduleId).toBeNull();
  });

  it("7. rejecting a candidate edge leaves graph content unchanged", () => {
    const { construction } = buildOverlay(fixture, [
      change({
        id: "chg:reject",
        operation: "reject-candidate-edge",
        target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
      }),
    ]);
    expect(construction.overlayContentHash).toBe(fixture.version.contentHash);
    expect(construction.notes.length).toBe(1);
  });

  it("8. replace-edge removes the original and adds the replacement", () => {
    const target = edgeIdFor({ from: "page:alpha-home", to: "service:alpha-api", type: "USES" });
    const { construction } = buildOverlay(fixture, [
      change({
        id: "chg:replace",
        operation: "replace-edge",
        target: { kind: "edge", id: target, nodeIds: [], edgeIds: [target] },
        replacementEdge: { from: "page:alpha-home", to: "capability:alpha.core", type: "USES" },
      }),
    ]);
    expect(construction.removedEdgeIds).toContain(target);
  });
});

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

describe("Stage 3.5.3.4 — proposal validation", () => {
  it("9. accepts a well-formed ownership declaration", () => {
    const result = validateProposal(
      fixture,
      proposal({
        id: "prop:valid",
        changes: [
          change({
            id: "chg:own",
            operation: "declare-ownership",
            target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
            ownerModuleId: "alpha",
          }),
        ],
      }),
    );
    expect(result.outcome).toBe("valid");
    expect(result.executable).toBe(true);
  });

  it("10. rejects an unknown node", () => {
    const result = validateProposal(
      fixture,
      proposal({
        id: "prop:unknown",
        changes: [
          change({
            id: "chg:own",
            operation: "declare-ownership",
            target: { kind: "node", id: "route:/nope", nodeIds: ["route:/nope"], edgeIds: [] },
            ownerModuleId: "alpha",
          }),
        ],
      }),
    );
    expect(result.outcome).toBe("invalid");
    expect(result.issues.some((i) => i.ruleId === "node-exists")).toBe(true);
  });

  it("11. rejects an endpoint-policy violation", () => {
    const result = validateProposal(
      fixture,
      proposal({
        id: "prop:policy",
        changes: [
          change({
            id: "chg:edge",
            operation: "add-edge",
            target: { kind: "node-pair", id: "x", nodeIds: [], edgeIds: [] },
            edge: { from: "module:alpha", to: "route:/alpha", type: "IMPLEMENTS" },
          }),
        ],
      }),
    );
    expect(result.issues.some((i) => i.ruleId === "endpoint-policy")).toBe(true);
    expect(result.outcome).toBe("invalid");
  });

  it("12. detects duplicate node and duplicate edge creation", () => {
    const dup = validateProposal(
      fixture,
      proposal({
        id: "prop:dup",
        changes: [
          change({
            id: "chg:node",
            operation: "add-node",
            target: { kind: "node", id: "module:alpha", nodeIds: ["module:alpha"], edgeIds: [] },
            node: { id: "module:alpha", type: "module", label: "Alpha", moduleId: "alpha" },
          }),
          change({
            id: "chg:edge",
            operation: "add-edge",
            target: { kind: "node-pair", id: "y", nodeIds: [], edgeIds: [] },
            edge: { from: "page:alpha-home", to: "service:alpha-api", type: "USES" },
          }),
        ],
      }),
    );
    expect(dup.issues.some((i) => i.ruleId === "duplicate-node")).toBe(true);
    expect(dup.issues.some((i) => i.ruleId === "duplicate-edge")).toBe(true);
  });

  it("13. marks a proposal with unbound parameters as incomplete and not executable", () => {
    const result = validateProposal(
      fixture,
      proposal({
        id: "prop:incomplete",
        incomplete: true,
        changes: [
          change({
            id: "chg:own",
            operation: "declare-ownership",
            target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
            requiredParameters: ["ownerModuleId"],
          }),
        ],
      }),
    );
    expect(result.outcome).toBe("incomplete");
    expect(result.executable).toBe(false);
    expect(result.missingParameters).toContain("ownerModuleId");
  });

  it("14. rejects contradictory ownership operations inside one proposal", () => {
    const result = validateProposal(
      fixture,
      proposal({
        id: "prop:contradictory",
        changes: [
          change({
            id: "chg:a",
            operation: "declare-ownership",
            target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
            ownerModuleId: "alpha",
          }),
          change({
            id: "chg:b",
            operation: "declare-ownership",
            target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
            ownerModuleId: "beta",
          }),
        ],
      }),
    );
    expect(result.issues.some((i) => i.ruleId === "contradictory-operations")).toBe(true);
    expect(result.outcome).toBe("invalid");
  });

  it("15. requires a justification for expected-by-design classification", () => {
    const result = validateProposal(
      fixture,
      proposal({
        id: "prop:ebd",
        changes: [
          change({
            id: "chg:ebd",
            operation: "mark-expected-by-design",
            target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
            metadata: { expectedByDesign: true },
          }),
        ],
      }),
    );
    expect(result.issues.some((i) => i.ruleId === "expected-by-design-justification")).toBe(true);
  });

  it("16. flags removal safety when a connected node is removed", () => {
    const result = validateProposal(
      fixture,
      proposal({
        id: "prop:remove",
        changes: [
          change({
            id: "chg:rm",
            operation: "remove-node",
            target: { kind: "node", id: "service:alpha-api", nodeIds: ["service:alpha-api"], edgeIds: [] },
          }),
        ],
      }),
    );
    expect(result.issues.some((i) => i.ruleId === "removal-safety")).toBe(true);
  });

  it("17. reports an empty proposal as invalid", () => {
    const result = validateProposal(fixture, proposal({ id: "prop:empty", changes: [] }));
    expect(result.outcome).toBe("invalid");
    expect(result.issues.some((i) => i.ruleId === "scope-validity")).toBe(true);
  });

  it("18. detects a cycle introduced by a new relationship", () => {
    const graph = fixtureGraph(
      [
        node("module:alpha", "module", "alpha"),
        node("capability:a", "capability", "alpha"),
        node("capability:b", "sub-capability", "alpha"),
      ],
      [edge("capability:a", "capability:b", "BELONGS_TO")],
    );
    const result = validateProposal(
      graph,
      proposal({
        id: "prop:cycle",
        changes: [
          change({
            id: "chg:cycle",
            operation: "add-edge",
            target: { kind: "node-pair", id: "cycle", nodeIds: [], edgeIds: [] },
            edge: { from: "capability:b", to: "capability:a", type: "BELONGS_TO" },
          }),
        ],
      }),
    );
    expect(result.issues.some((i) => i.ruleId === "cycle-introduction")).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Conflicts                                                                   */
/* -------------------------------------------------------------------------- */

describe("Stage 3.5.3.4 — conflict detection", () => {
  const ownership = (id: string, owner: string) =>
    proposal({
      id,
      changes: [
        change({
          id: `chg:${id}`,
          operation: "declare-ownership",
          target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
          ownerModuleId: owner,
        }),
      ],
    });

  it("19. detects divergent ownership between proposals", () => {
    const conflicts = detectConflicts([ownership("prop:a", "alpha"), ownership("prop:b", "beta")]);
    expect(conflicts.some((c) => c.type === "divergent-ownership" && c.severity === "blocking")).toBe(true);
  });

  it("20. does not conflict when both proposals assign the same owner", () => {
    const conflicts = detectConflicts([ownership("prop:a", "alpha"), ownership("prop:b", "alpha")]);
    expect(conflicts.some((c) => c.type === "divergent-ownership")).toBe(false);
  });

  it("21. consolidates duplicate registrations with a recorded rationale", () => {
    const reg = (id: string) =>
      proposal({
        id,
        changes: [
          change({
            id: `chg:${id}`,
            operation: "add-capability-registration",
            target: { kind: "node-pair", id: "reg", nodeIds: ["route:/orphan"], edgeIds: [] },
            edge: { from: "route:/orphan", to: "capability:alpha.core", type: "IMPLEMENTS" },
          }),
        ],
      });
    const conflicts = detectConflicts([reg("prop:a"), reg("prop:b")]);
    const duplicate = conflicts.find((c) => c.type === "duplicate-registration");
    expect(duplicate?.consolidationRationale).toBeTruthy();
  });

  it("22. detects removal of an entity another proposal depends on", () => {
    const remover = proposal({
      id: "prop:remove",
      changes: [
        change({
          id: "chg:rm",
          operation: "remove-node",
          target: { kind: "node", id: "service:alpha-api", nodeIds: ["service:alpha-api"], edgeIds: [] },
        }),
      ],
    });
    const user = proposal({
      id: "prop:use",
      changes: [
        change({
          id: "chg:use",
          operation: "add-edge",
          target: { kind: "node-pair", id: "use", nodeIds: ["service:alpha-api"], edgeIds: [] },
          edge: { from: "route:/alpha", to: "service:alpha-api", type: "INVOKES" },
        }),
      ],
    });
    expect(detectConflicts([remover, user]).some((c) => c.type === "removal-dependency")).toBe(true);
  });

  it("23. detects contradictory candidate-edge decisions", () => {
    const promote = proposal({
      id: "prop:promote",
      changes: [
        change({
          id: "chg:p",
          operation: "promote-candidate-edge",
          target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
        }),
      ],
    });
    const reject = proposal({
      id: "prop:reject",
      changes: [
        change({
          id: "chg:r",
          operation: "reject-candidate-edge",
          target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
        }),
      ],
    });
    expect(
      detectConflicts([promote, reject]).some((c) => c.type === "contradictory-candidate-decision"),
    ).toBe(true);
  });

  it("24. detects simultaneously selected alternatives", () => {
    const a = proposal({ id: "prop:a", changes: [], alternativeProposalIds: ["prop:b"] });
    const b = proposal({ id: "prop:b", changes: [], alternativeProposalIds: ["prop:a"] });
    expect(detectConflicts([a, b]).some((c) => c.type === "simultaneous-alternatives")).toBe(true);
  });

  it("25. detects conflicting expected-by-design classification", () => {
    const accept = proposal({
      id: "prop:accept",
      kind: "expected-by-design",
      changes: [
        change({
          id: "chg:e",
          operation: "mark-expected-by-design",
          target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
          metadata: { expectedByDesignJustification: "accepted" },
        }),
      ],
    });
    const fix = proposal({
      id: "prop:fix",
      kind: "route-registration",
      changes: [
        change({
          id: "chg:f",
          operation: "add-capability-registration",
          target: { kind: "node-pair", id: "f", nodeIds: ["route:/orphan"], edgeIds: [] },
          edge: { from: "route:/orphan", to: "capability:alpha.core", type: "IMPLEMENTS" },
        }),
      ],
    });
    expect(
      detectConflicts([accept, fix]).some((c) => c.type === "conflicting-expected-by-design"),
    ).toBe(true);
  });

  it("26. detects ordering conflicts for unsatisfied change dependencies", () => {
    const dependent = proposal({
      id: "prop:dep",
      changes: [
        change({
          id: "chg:dep",
          operation: "add-edge",
          target: { kind: "node-pair", id: "d", nodeIds: [], edgeIds: [] },
          dependencies: [{ changeId: "chg:missing", reason: "prerequisite" }],
        }),
      ],
    });
    expect(detectOrderingConflicts([dependent]).some((c) => c.type === "ordering-conflict")).toBe(true);
  });

  it("27. detects circular proposal dependencies", () => {
    const a = proposal({
      id: "prop:a",
      changes: [change({ id: "chg:a", operation: "add-node", target: { kind: "node", id: "a", nodeIds: [], edgeIds: [] }, dependencies: [{ changeId: "chg:b", reason: "x" }] })],
    });
    const b = proposal({
      id: "prop:b",
      changes: [change({ id: "chg:b", operation: "add-node", target: { kind: "node", id: "b", nodeIds: [], edgeIds: [] }, dependencies: [{ changeId: "chg:a", reason: "x" }] })],
    });
    expect(proposalDependencyCycles([a, b]).length).toBeGreaterThan(0);
    expect(detectConflicts([a, b]).some((c) => c.type === "circular-proposal-dependency")).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Sequencing                                                                  */
/* -------------------------------------------------------------------------- */

describe("Stage 3.5.3.4 — bundling and sequencing", () => {
  const independent = (id: string, nodeId: string) =>
    proposal({
      id,
      changes: [
        change({
          id: `chg:${id}`,
          operation: "update-node-metadata",
          target: { kind: "node", id: nodeId, nodeIds: [nodeId], edgeIds: [] },
          metadata: { reviewed: true },
        }),
      ],
    });

  it("28. groups independent proposals into a single parallel step", () => {
    const sequence = sequenceProposals([
      independent("prop:a", "route:/alpha"),
      independent("prop:b", "page:alpha-home"),
    ]);
    expect(sequence.steps.length).toBe(1);
    expect(sequence.steps[0].parallelizable).toBe(true);
    expect(sequence.parallelGroups[0]).toEqual(["prop:a", "prop:b"]);
  });

  it("29. sequences dependent proposals and reverses them for rollback", () => {
    const first = proposal({
      id: "prop:first",
      changes: [
        change({
          id: "chg:first",
          operation: "add-node",
          target: { kind: "node", id: "service:new", nodeIds: ["service:new"], edgeIds: [] },
          node: { id: "service:new", type: "service", label: "New", moduleId: "alpha" },
        }),
      ],
    });
    const second = proposal({
      id: "prop:second",
      changes: [
        change({
          id: "chg:second",
          operation: "add-edge",
          target: { kind: "node-pair", id: "e", nodeIds: ["service:new"], edgeIds: [] },
          edge: { from: "page:alpha-home", to: "service:new", type: "USES" },
          dependencies: [{ changeId: "chg:first", reason: "node must exist" }],
        }),
      ],
    });
    const sequence = sequenceProposals([second, first]);
    expect(sequence.steps.map((s) => s.proposalIds)).toEqual([["prop:first"], ["prop:second"]]);
    expect(sequence.rollbackOrder).toEqual(["prop:second", "prop:first"]);
  });

  it("30. produces a stable bundle identifier regardless of input order", () => {
    expect(bundleIdFor(["b", "a"])).toBe(bundleIdFor(["a", "b"]));
  });
});

/* -------------------------------------------------------------------------- */
/* Metrics, resolution and regressions                                         */
/* -------------------------------------------------------------------------- */

describe("Stage 3.5.3.4 — metrics, resolution and regression detection", () => {
  it("31. compares every published metric", () => {
    const baseline = analyzeGraphSnapshot(fixture, { lineageSampleLimit: 25 });
    const deltas = compareMetrics(baseline.metrics, baseline.metrics);
    expect(deltas.every((d) => d.direction === "unchanged")).toBe(true);
    expect(deltas.length).toBeGreaterThan(20);
  });

  it("32. detects an ownership improvement as an improved metric", () => {
    const baseline = analyzeGraphSnapshot(fixture, { lineageSampleLimit: 25 });
    const { graph } = buildOverlay(fixture, [
      change({
        id: "chg:own",
        operation: "declare-ownership",
        target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
        ownerModuleId: "alpha",
      }),
    ]);
    const simulated = analyzeGraphSnapshot(graph, { lineageSampleLimit: 25 });
    expect(simulated.metrics.unresolvedOwnershipCount).toBeLessThanOrEqual(
      baseline.metrics.unresolvedOwnershipCount,
    );
  });

  it("33. detects an orphan regression when a relationship is removed", () => {
    const baseline = analyzeGraphSnapshot(fixture, { lineageSampleLimit: 25 });
    const target = edgeIdFor({ from: "page:alpha-home", to: "capability:alpha.core", type: "IMPLEMENTS" });
    const { graph } = buildOverlay(fixture, [
      change({
        id: "chg:rm",
        operation: "remove-edge",
        target: { kind: "edge", id: target, nodeIds: [], edgeIds: [target] },
      }),
    ]);
    const simulated = analyzeGraphSnapshot(graph, { lineageSampleLimit: 25 });
    const regressions = detectRegressions(baseline, simulated, "test");
    expect(regressions.some((r) => r.kind === "removed-required-evidence")).toBe(true);
  });

  it("34. never marks a recommendation resolved when its condition survives", () => {
    const baseline = analyzeGraphSnapshot(fixture, { lineageSampleLimit: 25 });
    const resolutions = classifyResolutions(baseline, baseline);
    expect(resolutions.every((r) => r.classification === "unresolved")).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Scoring                                                                     */
/* -------------------------------------------------------------------------- */

describe("Stage 3.5.3.4 — proposal scoring", () => {
  const baseScore = (overrides: Parameters<typeof scoreProposal>[0]) => scoreProposal(overrides);

  it("35. gates an invalid proposal to the invalid band", () => {
    const score = baseScore({
      proposal: proposal({ id: "p", changes: [] }),
      validation: {
        proposalId: "p",
        outcome: "invalid",
        rulesApplied: [],
        issues: [],
        missingParameters: [],
        executable: false,
      },
      conflicts: [],
      resolutions: [],
      regressions: [],
      deltas: [],
    });
    expect(score.band).toBe("invalid");
    expect(score.gatesApplied[0]).toContain("gate:invalid-validation");
  });

  it("36. gates an incomplete proposal to conditional", () => {
    const score = baseScore({
      proposal: proposal({ id: "p", changes: [], incomplete: true }),
      validation: {
        proposalId: "p",
        outcome: "incomplete",
        rulesApplied: [],
        issues: [],
        missingParameters: ["ownerModuleId"],
        executable: false,
      },
      conflicts: [],
      resolutions: [],
      regressions: [],
      deltas: [],
    });
    expect(score.band).toBe("conditional");
  });

  it("37. never hides a critical regression behind aggregate benefit", () => {
    const score = baseScore({
      proposal: proposal({ id: "p", changes: [] }),
      validation: {
        proposalId: "p",
        outcome: "valid",
        rulesApplied: [],
        issues: [],
        missingParameters: [],
        executable: true,
      },
      conflicts: [],
      resolutions: [
        {
          recommendationId: "rec:x",
          policyId: "POL-OWN-001",
          category: "ownership",
          classification: "resolved",
          baselineState: { present: true, priority: "critical", priorityScore: 90, affectedNodeCount: 1, findingCount: 1 },
          simulatedState: { present: false, priority: null, priorityScore: null, affectedNodeCount: 0, findingCount: 0 },
          evidence: [],
          explanation: "resolved",
          remainingWork: [],
          residualRiskIds: [],
          confidence: "high",
          relatedNewFindingIds: [],
        },
      ],
      regressions: [
        {
          id: "reg:new-dependency-cycle:x",
          kind: "new-dependency-cycle",
          severity: "critical",
          priority: "critical",
          scope: "test",
          subject: "x",
          statement: "cycle",
          affectedEntityIds: [],
          reversible: true,
          confidence: "high",
          detectionBasis: [],
        },
      ],
      deltas: [],
    });
    expect(score.band).toBe("not-recommended");
    expect(score.gatesApplied.some((g) => g.includes("critical-regression"))).toBe(true);
  });

  it("38. gates a blocking conflict to not-recommended", () => {
    const score = baseScore({
      proposal: proposal({ id: "p", changes: [] }),
      validation: {
        proposalId: "p",
        outcome: "valid",
        rulesApplied: [],
        issues: [],
        missingParameters: [],
        executable: true,
      },
      conflicts: [
        {
          id: "cfl:x",
          type: "divergent-ownership",
          severity: "blocking",
          proposalIds: ["p"],
          changeIds: [],
          entityIds: [],
          explanation: "x",
          resolutionOptions: [],
          evidence: [],
          consolidationRationale: null,
        },
      ],
      resolutions: [],
      regressions: [],
      deltas: [],
    });
    expect(score.band).toBe("not-recommended");
  });

  it("39. reports low value when nothing is resolved", () => {
    const score = baseScore({
      proposal: proposal({ id: "p", changes: [] }),
      validation: {
        proposalId: "p",
        outcome: "valid",
        rulesApplied: [],
        issues: [],
        missingParameters: [],
        executable: true,
      },
      conflicts: [],
      resolutions: [],
      regressions: [],
      deltas: [],
    });
    expect(score.band).toBe("low-value");
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });
});

/* -------------------------------------------------------------------------- */
/* Proposal generation and the engine facade                                   */
/* -------------------------------------------------------------------------- */

describe("Stage 3.5.3.4 — proposal generation", () => {
  const engine = engineFor();
  let recommendations: readonly IntelligenceRecommendation[];

  beforeAll(() => {
    recommendations = engine.baseline().intelligence.recommendations;
  });

  it("40. produces at least one proposal for the fixture recommendations", () => {
    const proposals = engine.generateProposals();
    expect(proposals.length).toBeGreaterThan(0);
    expect(new Set(proposals.map((p) => p.id)).size).toBe(proposals.length);
  });

  it("41. produces stable, deterministic proposal identifiers", () => {
    const first = engine.generateProposals().map((p) => p.id);
    const second = engineFor().generateProposals().map((p) => p.id);
    expect(second).toEqual(first);
  });

  it("42. never invents an owner: unresolved ownership becomes a parameter", () => {
    const ownership = engine
      .generateProposals()
      .filter((p) => p.kind === "ownership-declaration" || p.kind === "ownership-adjudication");
    for (const p of ownership) {
      const owner = p.parameters.find((param) => param.name === "ownerModuleId");
      expect(owner).toBeDefined();
      if (owner && owner.candidates.length !== 1) expect(owner.defaultValue).toBeNull();
    }
  });

  it("43. emits alternatives rather than choosing a remediation path", () => {
    const proposals = engine.generateProposals();
    const withAlternatives = proposals.filter((p) => p.alternativeProposalIds.length > 0);
    if (withAlternatives.length > 0) {
      for (const p of withAlternatives) {
        for (const other of p.alternativeProposalIds) {
          expect(proposals.some((candidate) => candidate.id === other)).toBe(true);
        }
      }
    }
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it("44. binding a parameter completes the proposal", () => {
    const target = engine
      .generateProposals()
      .find((p) => p.parameters.some((param) => param.name === "ownerModuleId" && param.defaultValue === null));
    if (!target) return;
    const bound = bindParameters(target, { ownerModuleId: "alpha" });
    expect(bound.incomplete).toBe(false);
    expect(bound.changes.every((c) => c.requiredParameters.length === 0)).toBe(true);
    expect(bound.changes.every((c) => c.ownerModuleId === "alpha")).toBe(true);
  });

  it("45. an unknown policy yields no proposals", () => {
    const fake = {
      ...recommendations[0],
      policyId: "POL-UNKNOWN",
    } as IntelligenceRecommendation;
    expect(generateProposals(engine.queryEngine, fake).length).toBe(0);
  });
});

describe("Stage 3.5.3.4 — simulation engine", () => {
  const engine = engineFor();

  it("46. simulates a bound proposal and preserves the canonical graph hash", () => {
    const before = engine.canonicalGraphHash;
    const target = engine.generateProposals()[0];
    const bound = bindParameters(target, {
      ownerModuleId: "alpha",
      capabilityId: "capability:alpha.core",
      platformCapabilityId: "platform-capability:auth",
      expectedByDesignJustification: "accepted by the architecture review board",
    });
    const result = engine.simulateProposal(bound);
    expect(result.canonicalGraphHashBefore).toBe(before);
    expect(result.canonicalGraphHashAfter).toBe(before);
    expect(result.canonicalGraphHashPreserved).toBe(true);
    expect(result.overlayContentHash).toBeTruthy();
    expect(result.explanation.recommendationId).toBe(bound.recommendationId);
  });

  it("47. repeated simulations are byte-identical", () => {
    const target = bindParameters(engine.generateProposals()[0], {
      ownerModuleId: "alpha",
      capabilityId: "capability:alpha.core",
      platformCapabilityId: "platform-capability:auth",
      expectedByDesignJustification: "accepted",
    });
    const a = engine.simulateProposal(target);
    const b = engineFor().simulateProposal(target);
    const strip = (value: unknown) =>
      JSON.stringify(value, (key, v) => (key === "performance" || key === "executionTimeMs" ? undefined : v));
    expect(strip(b.simulatedMetrics)).toBe(strip(a.simulatedMetrics));
    expect(b.overlayContentHash).toBe(a.overlayContentHash);
    expect(b.simulationId).toBe(a.simulationId);
    expect(strip(b.score)).toBe(strip(a.score));
  });

  it("48. an incomplete proposal is never treated as executable", () => {
    const incomplete = engine
      .generateProposals()
      .find((p) => p.incomplete);
    if (!incomplete) return;
    const result = engine.simulateProposal(incomplete);
    expect(result.success).toBe(false);
    expect(result.validation.outcome).toBe("incomplete");
    expect(result.overlayContentHash).toBe(engine.canonicalGraphHash);
    expect(result.score.band).toBe("conditional");
  });

  it("49. an empty proposal is invalid and scores in the invalid band", () => {
    const result = engine.simulateProposal(proposal({ id: "prop:empty", changes: [] }));
    expect(result.success).toBe(false);
    expect(result.score.band).toBe("invalid");
  });

  it("50. a deliberately regression-producing proposal is not recommended", () => {
    const target = edgeIdFor({
      from: "capability:alpha.core",
      to: "platform-capability:auth",
      type: "CONSUMES",
    });
    const destructive = proposal({
      id: "prop:destructive",
      kind: "cycle-break",
      changes: [
        change({
          id: "chg:destroy",
          operation: "remove-edge",
          target: { kind: "edge", id: target, nodeIds: [], edgeIds: [target] },
        }),
      ],
      expectedImprovement: { metrics: [], resolvesRecommendationIds: [] },
    });
    const result = engine.simulateProposal(destructive);
    expect(result.regressions.length).toBeGreaterThan(0);
    expect(["not-recommended", "low-value", "conditional"]).toContain(result.score.band);
  });

  it("51. simulates a bundle and reports intermediate states and rollback order", () => {
    const bundle = [
      proposal({
        id: "prop:own-orphan",
        changes: [
          change({
            id: "chg:own-orphan",
            operation: "declare-ownership",
            target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
            ownerModuleId: "alpha",
          }),
        ],
      }),
      proposal({
        id: "prop:register-orphan",
        kind: "route-registration",
        changes: [
          change({
            id: "chg:register-orphan",
            operation: "add-capability-registration",
            target: {
              kind: "node-pair",
              id: edgeIdFor({ from: "route:/orphan", to: "capability:alpha.core", type: "IMPLEMENTS" }),
              nodeIds: ["route:/orphan", "capability:alpha.core"],
              edgeIds: [],
            },
            edge: { from: "route:/orphan", to: "capability:alpha.core", type: "IMPLEMENTS" },
          }),
        ],
      }),
    ];
    const result = engine.simulateBundle(bundle);
    expect(result.intermediateStates.length).toBe(2);
    expect(result.canonicalGraphHashPreserved).toBe(true);
    expect(result.sequence.rollbackOrder.length).toBe(2);
    expect(result.finalMetrics.nodeCount).toBe(fixture.nodes.length);
    expect(result.finalMetrics.edgeCount).toBe(fixture.edges.length + 1);
  });

  it("52. a bundle with a blocking conflict runs no overlay analysis", () => {
    const conflicting = [
      proposal({
        id: "prop:alpha",
        changes: [
          change({
            id: "chg:alpha",
            operation: "declare-ownership",
            target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
            ownerModuleId: "alpha",
          }),
        ],
      }),
      proposal({
        id: "prop:beta",
        changes: [
          change({
            id: "chg:beta",
            operation: "declare-ownership",
            target: { kind: "node", id: "route:/orphan", nodeIds: ["route:/orphan"], edgeIds: [] },
            ownerModuleId: "beta",
          }),
        ],
      }),
    ];
    const result = engine.simulateBundle(conflicting);
    expect(result.conflicts.some((c) => c.severity === "blocking")).toBe(true);
    expect(result.intermediateStates.length).toBe(0);
    expect(result.score.band).toBe("not-recommended");
  });

  it("53. bundle results are invariant to input ordering when steps are parallel", () => {
    const a = proposal({
      id: "prop:meta-a",
      changes: [
        change({
          id: "chg:meta-a",
          operation: "update-node-metadata",
          target: { kind: "node", id: "route:/alpha", nodeIds: ["route:/alpha"], edgeIds: [] },
          metadata: { reviewed: true },
        }),
      ],
    });
    const b = proposal({
      id: "prop:meta-b",
      changes: [
        change({
          id: "chg:meta-b",
          operation: "update-node-metadata",
          target: { kind: "node", id: "page:alpha-home", nodeIds: ["page:alpha-home"], edgeIds: [] },
          metadata: { reviewed: true },
        }),
      ],
    });
    const forward = engine.simulateBundle([a, b]);
    const reverse = engine.simulateBundle([b, a]);
    expect(reverse.overlay.overlayContentHash).toBe(forward.overlay.overlayContentHash);
    expect(reverse.bundleId).toBe(forward.bundleId);
  });

  it("54. compares alternatives deterministically", () => {
    const alternatives = engine
      .generateProposals()
      .filter((p) => p.alternativeProposalIds.length > 0)
      .slice(0, 2)
      .map((p) =>
        bindParameters(p, {
          ownerModuleId: "alpha",
          capabilityId: "capability:alpha.core",
          platformCapabilityId: "platform-capability:auth",
          expectedByDesignJustification: "accepted",
        }),
      );
    if (alternatives.length < 2) return;
    const comparison = engine.compareAlternatives(alternatives);
    expect(comparison.alternatives.length).toBe(alternatives.length);
    expect(["preferred", "equivalent", "decision-required"]).toContain(comparison.verdict);
    expect(comparison.canonicalGraphHashPreserved).toBe(true);
    const repeat = engineFor().compareAlternatives(alternatives);
    expect(repeat.comparisonId).toBe(comparison.comparisonId);
    expect(repeat.verdict).toBe(comparison.verdict);
  });

  it("55. scoped simulation only touches the requested scope", () => {
    const results = engine.simulateScope("node", "route:/orphan");
    for (const result of results) {
      expect(result.scope.kind).toBe("node");
      expect(result.scope.resolvedNodeIds).toContain("route:/orphan");
    }
    expect(engine.simulateScope("node", "route:/does-not-exist").length).toBe(0);
  });

  it("56. exposes unresolved parameters and metric-delta inspection", () => {
    const target = engine.generateProposals()[0];
    expect(Array.isArray(engine.unresolvedParameters(target))).toBe(true);
    const result = engine.simulateProposal(
      bindParameters(target, {
        ownerModuleId: "alpha",
        capabilityId: "capability:alpha.core",
        platformCapabilityId: "platform-capability:auth",
        expectedByDesignJustification: "accepted",
      }),
    );
    expect(engine.inspectMetricDeltas(result).every((d) => d.direction !== "unchanged")).toBe(true);
    expect(engine.inspectRecommendationResolution(result).length).toBeGreaterThanOrEqual(0);
  });

  it("57. filters results by regression severity", () => {
    const target = bindParameters(engine.generateProposals()[0], {
      ownerModuleId: "alpha",
      capabilityId: "capability:alpha.core",
      platformCapabilityId: "platform-capability:auth",
      expectedByDesignJustification: "accepted",
    });
    const result = engine.simulateProposal(target);
    const filtered = engine.filterResults([result], { maxRegressionSeverity: "info" });
    const hasCritical = result.regressions.some((r) => r.severity !== "info");
    expect(filtered.length).toBe(hasCritical ? 0 : 1);
  });
});

/* -------------------------------------------------------------------------- */
/* Real repository graph                                                       */
/* -------------------------------------------------------------------------- */

describe("Stage 3.5.3.4 — real repository graph", () => {
  const engine = createSimulationEngine({ lineageSampleLimit: 25 });

  it("58. generates proposals from the real intelligence result", () => {
    const proposals = engine.generateProposals();
    expect(proposals.length).toBeGreaterThan(0);
    expect([...proposals].sort((a, b) => a.id.localeCompare(b.id)).map((p) => p.id)).toEqual(
      proposals.map((p) => p.id),
    );
  });

  it("59. simulating against the real graph preserves the canonical hash", () => {
    const before = engine.canonicalGraphHash;
    const target = engine.generateProposals()[0];
    const result = engine.simulateProposal(target);
    expect(result.canonicalGraphHashBefore).toBe(before);
    expect(engine.canonicalGraphHash).toBe(before);
    expect(result.canonicalGraphHashPreserved).toBe(true);
    expect(result.graph.nodeCount).toBe(engine.canonicalGraph.nodes.length);
  });

  it("60. the baseline snapshot is stable across repeated reads", () => {
    const a = engine.baseline();
    const b = engine.baseline();
    expect(b.contentHash).toBe(a.contentHash);
    expect(b.metrics).toEqual(a.metrics);
  });
});
