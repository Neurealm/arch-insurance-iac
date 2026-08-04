import { describe, expect, it, beforeEach } from "vitest";
import { getCapabilityGraph } from "../build";
import {
  createSimulationEngine,
  type ChangeProposal,
  type ProposedChange,
  type SimulationResult,
} from "../simulation/index";
import {
  ARTIFACT_CATALOG,
  createChangePlanEngine,
  DEFAULT_TOLERANCES,
  detectPatchConflicts,
  EMITTABLE_PLAN_STATUSES,
  INVERSE_PATCH_OPERATION,
  isValidPlanTransition,
  mapEntityToArtifacts,
  manifestPathFor,
  PATCH_OPERATIONS,
  PATCH_OPERATION_FOR_CHANGE,
  PLAN_STATUS_TRANSITIONS,
  planHash,
  planSortedUnique,
  WORKSTREAM_FOR_OPERATION,
  WORKSTREAM_ORDER,
  __resetChangePlanEngineCache,
  type ChangePlan,
} from "./index";

const graph = getCapabilityGraph();
const simulation = createSimulationEngine();
const engine = createChangePlanEngine({ graph, simulationEngine: simulation });

const proposals = simulation.generateProposals();
const complete = proposals.filter((p) => !p.incomplete);
const incomplete = proposals.filter((p) => p.incomplete);

const simulate = (proposal: ChangeProposal): SimulationResult =>
  simulation.simulateProposal(proposal);

const firstPlan = (): ChangePlan => {
  const proposal = complete[0] ?? proposals[0];
  return engine.buildPlanFromSimulation(simulate(proposal));
};

describe("Stage 3.5.3.5 — static contracts", () => {
  it("maps every change operation to a workstream and a patch operation", () => {
    for (const [op, ws] of Object.entries(WORKSTREAM_FOR_OPERATION)) {
      expect(WORKSTREAM_ORDER).toContain(ws);
      expect(PATCH_OPERATIONS).toContain(PATCH_OPERATION_FOR_CHANGE[op as never]);
    }
  });

  it("declares an inverse (or an explicit null) for every patch operation", () => {
    for (const op of PATCH_OPERATIONS) {
      expect(Object.prototype.hasOwnProperty.call(INVERSE_PATCH_OPERATION, op)).toBe(true);
    }
    expect(INVERSE_PATCH_OPERATION["add-record"]).toBe("remove-record");
    expect(INVERSE_PATCH_OPERATION["remove-record"]).toBeNull();
  });

  it("only permits the three emittable plan statuses", () => {
    expect(EMITTABLE_PLAN_STATUSES).toEqual(["draft", "blocked", "ready-for-review"]);
    for (const status of EMITTABLE_PLAN_STATUSES) {
      expect(PLAN_STATUS_TRANSITIONS[status].length).toBeGreaterThan(0);
    }
  });

  it("enforces the declared status transition table", () => {
    expect(isValidPlanTransition("draft", "ready-for-review")).toBe(true);
    expect(isValidPlanTransition("superseded", "draft")).toBe(false);
    expect(isValidPlanTransition("ready-for-review", "implemented")).toBe(false);
  });

  it("hashes deterministically and sorts uniquely", () => {
    expect(planHash("abc")).toBe(planHash("abc"));
    expect(planHash("abc")).not.toBe(planHash("abd"));
    expect(planSortedUnique(["b", "a", "b"])).toEqual(["a", "b"]);
  });

  it("declares tolerances with prohibited regressions on quality metrics", () => {
    const keys = DEFAULT_TOLERANCES.map((t) => t.key);
    expect(keys).toContain("ownershipResolutionRate");
    expect(keys).toContain("incidentalChanges");
    expect(DEFAULT_TOLERANCES.find((t) => t.key === "dependencyCycleCount")?.regressionProhibited).toBe(true);
  });
});

describe("Stage 3.5.3.5 — artifact mapping", () => {
  it("uses the documented manifest path convention", () => {
    expect(manifestPathFor("sre")).toBe("src/modules/sre/module.manifest.ts");
    expect(ARTIFACT_CATALOG.some((c) => c.path === "src/modules/sre/module.manifest.ts")).toBe(true);
  });

  it("never invents a path when nothing authoritative exists", () => {
    const mapping = mapEntityToArtifacts(
      { graph, knownModuleIds: [], catalog: [] },
      "node:unknown",
      "add-node",
      null,
    );
    expect(mapping.resolved).toBe(false);
    expect(mapping.selected).toBeNull();
    expect(mapping.candidates).toEqual([]);
    expect(mapping.explanation).toContain("No path was invented");
  });

  it("resolves the manifest for a registered module-owned entity", () => {
    const node = graph.nodes.find((n) => n.moduleId === "sre");
    expect(node).toBeDefined();
    const mapping = mapEntityToArtifacts(
      { graph, knownModuleIds: ["sre"] },
      node!.id,
      "declare-ownership",
      node!,
    );
    expect(mapping.resolved).toBe(true);
    expect(mapping.candidates.some((c) => c.path === manifestPathFor("sre"))).toBe(true);
  });

  it("flags human selection when several authoritative artifacts compete", () => {
    const node = graph.nodes.find((n) => n.type === "capability");
    const mapping = mapEntityToArtifacts(
      { graph, knownModuleIds: ["sre"] },
      node!.id,
      "add-capability-registration",
      node!,
    );
    const authoritative = mapping.candidates.filter((c) => c.authoritative);
    if (authoritative.length > 1) {
      expect(mapping.humanSelectionRequired).toBe(true);
      expect(mapping.selected).toBeNull();
    } else {
      expect(mapping.selected).not.toBeNull();
    }
  });

  it("is deterministic across repeated calls", () => {
    const node = graph.nodes.find((n) => n.moduleId === "sre")!;
    const a = mapEntityToArtifacts({ graph, knownModuleIds: ["sre"] }, node.id, "declare-ownership", node);
    const b = mapEntityToArtifacts({ graph, knownModuleIds: ["sre"] }, node.id, "declare-ownership", node);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("Stage 3.5.3.5 — plan generation over the real graph", () => {
  it("generates at least one plan from the real proposal set", () => {
    expect(proposals.length).toBeGreaterThan(0);
    const plan = firstPlan();
    expect(plan.generator).toBe("src/modules/graph/change-plan@1.0.0");
    expect(plan.id.startsWith("plan:")).toBe(true);
  });

  it("emits only draft, blocked or ready-for-review", () => {
    for (const proposal of proposals.slice(0, 12)) {
      const plan = engine.buildPlanFromSimulation(simulate(proposal));
      expect(EMITTABLE_PLAN_STATUSES).toContain(plan.status);
    }
  });

  it("blocks plans built from incomplete proposals", () => {
    if (incomplete.length === 0) return;
    const plan = engine.buildPlanFromSimulation(simulate(incomplete[0]));
    expect(plan.status).toBe("blocked");
    expect(plan.blockers.length).toBeGreaterThan(0);
  });

  it("records every blocker with resolution options", () => {
    for (const proposal of proposals.slice(0, 10)) {
      const plan = engine.buildPlanFromSimulation(simulate(proposal));
      for (const blocker of plan.blockers) {
        expect(blocker.statement.length).toBeGreaterThan(0);
        expect(blocker.resolutionOptions.length).toBeGreaterThan(0);
      }
    }
  });

  it("produces identical plans for identical inputs", () => {
    const proposal = complete[0] ?? proposals[0];
    const a = engine.buildPlanFromSimulation(simulate(proposal));
    const b = engine.buildPlanFromSimulation(simulate(proposal));
    expect(a.id).toBe(b.id);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("orders steps by the fixed workstream order", () => {
    const plan = firstPlan();
    const ranks = plan.steps.map((s) => WORKSTREAM_ORDER.indexOf(s.workstreamKind));
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
    expect(plan.steps.map((s) => s.order)).toEqual(plan.steps.map((_, i) => i + 1));
  });

  it("links every step to at least one patch and back to its workstream", () => {
    const plan = firstPlan();
    const workstreamIds = new Set(plan.workstreams.map((w) => w.id));
    const patchIds = new Set(plan.patches.map((p) => p.id));
    for (const step of plan.steps) {
      expect(workstreamIds.has(step.workstreamId)).toBe(true);
      expect(step.patchIds.length).toBeGreaterThan(0);
      for (const id of step.patchIds) expect(patchIds.has(id)).toBe(true);
    }
  });

  it("gives every patch a before-state, after-state and rollback", () => {
    const plan = firstPlan();
    for (const patch of plan.patches) {
      expect(patch.beforeState.statement.length).toBeGreaterThan(0);
      expect(patch.afterState.statement.length).toBeGreaterThan(0);
      expect(patch.rollback.patchId).toBe(patch.id);
      expect(patch.rollback.validationRequirements.length).toBeGreaterThan(0);
    }
  });

  it("never emits a patch containing raw source code", () => {
    const plan = firstPlan();
    for (const patch of plan.patches) {
      const serialized = JSON.stringify(patch);
      expect(serialized).not.toContain("=>");
      expect(serialized).not.toContain("function (");
    }
  });

  it("marks unresolved artifacts as blockers rather than guessing", () => {
    const plan = firstPlan();
    for (const patch of plan.patches.filter((p) => p.artifact.path === null)) {
      expect(patch.status).not.toBe("specified");
      expect(plan.blockers.some((b) => b.kind === "unresolved-artifact-mapping")).toBe(true);
    }
  });

  it("requires approvals and blocks when no owner is declared", () => {
    const plan = firstPlan();
    expect(plan.requiredApprovals.length).toBeGreaterThan(0);
    for (const approval of plan.requiredApprovals) {
      expect(approval.mandatory).toBe(true);
      if (approval.assignee === null) {
        expect(approval.blocker).toBe(true);
        expect(approval.assigneeSource).toBe("unresolved");
      }
    }
    expect(plan.approvalDecisions.every((d) => d.state === "pending")).toBe(true);
  });

  it("derives validation checkpoints, using only real repository commands", () => {
    const plan = firstPlan();
    expect(plan.validationCheckpoints.length).toBeGreaterThan(5);
    for (const checkpoint of plan.validationCheckpoints) {
      expect(checkpoint.command !== null || checkpoint.rule !== null).toBe(true);
      if (checkpoint.command) {
        expect(["npm run test", "npm run build"]).toContain(checkpoint.command);
      }
      expect(checkpoint.derivation.length).toBeGreaterThan(0);
    }
  });

  it("builds a reverse-order rollback plan", () => {
    const plan = firstPlan();
    const forward = plan.steps.map((s) => s.id);
    expect(plan.rollbackPlan.fullPlanRollbackOrder).toEqual([...forward].reverse());
    expect(plan.rollbackPlan.graphRegenerationRequired).toBe(true);
    expect(plan.rollbackPlan.workstreamRollbackOrder).toEqual(
      [...plan.workstreams.map((w) => w.id)].reverse(),
    );
  });

  it("declares execution constraints including approval gating", () => {
    const plan = firstPlan();
    expect(plan.executionConstraints.some((c) => c.kind === "requires-approval-first")).toBe(true);
    expect(plan.executionConstraints.some((c) => c.kind === "requires-graph-regeneration")).toBe(true);
  });

  it("carries full lineage from recommendation to patch", () => {
    const plan = firstPlan();
    expect(plan.lineage.recommendationIds.length).toBeGreaterThan(0);
    expect(plan.lineage.policyIds.length).toBeGreaterThan(0);
    expect(plan.lineage.simulationIds.length).toBeGreaterThan(0);
    for (const patch of plan.patches) {
      expect(patch.lineage.canonicalGraphHash).toBe(plan.canonicalGraphHash);
    }
  });

  it("explains status, ordering, approvals, validation and rollback", () => {
    const plan = firstPlan();
    const e = plan.explanation;
    expect(e.statusRationale.length).toBeGreaterThan(0);
    expect(e.orderingRationale.length).toBeGreaterThan(0);
    expect(e.lineageStatement).toContain(plan.canonicalGraphHash);
    expect(e.validationDerivation.length).toBeGreaterThan(0);
    expect(e.rollbackDerivation.length).toBe(plan.patches.length);
  });

  it("reports deterministic, repository-immutable diagnostics", () => {
    const plan = firstPlan();
    expect(plan.diagnostics.deterministic).toBe(true);
    expect(plan.diagnostics.repositoryImmutable).toBe(true);
  });
});

describe("Stage 3.5.3.5 — scope, conflicts, drift and comparison", () => {
  it("resolves a graph scope to the touched entities", () => {
    const changes: readonly ProposedChange[] = complete[0]?.changes ?? proposals[0].changes;
    const scope = engine.resolveScope("graph", null, changes);
    expect(scope.kind).toBe("graph");
    expect(scope.explanation.length).toBeGreaterThan(0);
  });

  it("reports an empty scope honestly rather than widening it", () => {
    const changes = proposals[0].changes;
    const scope = engine.resolveScope("module", "module-that-does-not-exist", changes);
    expect(scope.resolvedNodeIds).toEqual([]);
    expect(scope.explanation).toContain("matched no proposal entity");
  });

  it("detects patches competing for the same selector", () => {
    const plan = firstPlan();
    const conflicts = detectPatchConflicts([...plan.patches, ...plan.patches]);
    if (plan.patches.length > 0) {
      expect(conflicts.some((c) => c.kind === "same-target" || c.kind === "unresolved-artifact")).toBe(true);
    }
  });

  it("detects cross-plan conflicts over the same source record", () => {
    const proposal = complete[0] ?? proposals[0];
    const existing = engine.buildPlanFromSimulation(simulate(proposal));
    const second = engine.buildPlanFromSimulation(simulate(proposal), {
      existingPlans: [{ ...existing, id: `${existing.id}:other` }],
    });
    if (existing.patches.length > 0) {
      expect(second.conflicts.some((c) => c.type === "same-source-record")).toBe(true);
    }
  });

  it("reports no drift against the current canonical graph", () => {
    const plan = firstPlan();
    const drift = engine.detectDrift(plan, plan.canonicalGraphHash);
    const unresolved = plan.artifactMappings.filter((m) => !m.resolved).length;
    if (unresolved === 0) {
      expect(drift.classification).toBe("none");
    } else {
      expect(drift.classification).toBe("review-required");
    }
  });

  it("classifies a changed canonical hash as requiring re-simulation", () => {
    const plan = firstPlan();
    const drift = engine.detectDrift(plan, "deadbeef");
    expect(drift.classification).toBe("resimulation-required");
    expect(drift.findings.some((f) => f.kind === "canonical-hash-changed")).toBe(true);
  });

  it("compares an implementation that matches the simulation exactly", () => {
    const plan = firstPlan();
    const comparison = engine.compareImplementation(plan, plan.simulatedMetrics, 0);
    expect(["exact-match", "within-tolerance"]).toContain(comparison.outcome);
    expect(comparison.criticalRegressionKeys).toEqual([]);
  });

  it("flags a prohibited regression outside tolerance", () => {
    const plan = firstPlan();
    const worse = { ...plan.simulatedMetrics, dependencyCycleCount: plan.simulatedMetrics.dependencyCycleCount + 3 };
    const comparison = engine.compareImplementation(plan, worse, 0);
    expect(comparison.outcome).toBe("regression");
    expect(comparison.criticalRegressionKeys).toContain("dependencyCycleCount");
  });

  it("flags incidental changes as a regression", () => {
    const plan = firstPlan();
    const comparison = engine.compareImplementation(plan, plan.simulatedMetrics, 2);
    expect(comparison.criticalRegressionKeys).toContain("incidentalChanges");
  });

  it("compares plans by artifact target", () => {
    const proposal = complete[0] ?? proposals[0];
    const a = engine.buildPlanFromSimulation(simulate(proposal));
    const comparison = engine.comparePlans([a, a]);
    expect(comparison.planIds).toHaveLength(2);
    expect(comparison.identical).toBe(true);
    expect(comparison.divergentArtifactPaths).toEqual([]);
  });
});

describe("Stage 3.5.3.5 — immutability guarantees", () => {
  beforeEach(() => __resetChangePlanEngineCache());

  it("leaves the canonical graph hash unchanged", () => {
    const before = getCapabilityGraph().version.contentHash;
    for (const proposal of proposals.slice(0, 8)) {
      engine.buildPlanFromSimulation(simulate(proposal));
    }
    expect(getCapabilityGraph().version.contentHash).toBe(before);
  });

  it("does not mutate the source simulation result", () => {
    const proposal = complete[0] ?? proposals[0];
    const result = simulate(proposal);
    const snapshot = JSON.stringify(result);
    engine.buildPlanFromSimulation(result);
    expect(JSON.stringify(result)).toBe(snapshot);
  });

  it("does not mutate the source proposal", () => {
    const proposal = complete[0] ?? proposals[0];
    const snapshot = JSON.stringify(proposal);
    engine.buildPlanFromSimulation(simulate(proposal));
    expect(JSON.stringify(proposal)).toBe(snapshot);
  });
});
