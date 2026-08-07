import { describe, expect, it } from "vitest";
import { computeReadiness, initialWorkbenchState, recommendationFor } from "./engine";
import {
  activeReadinessFilterCount, applyReadinessFilters, assessments, defaultReadinessFilters,
  contextCoverageRows, findings, historicalContextRewriteViolations, readinessDimensions,
  readinessLifecycleStages, personaStates, conditionStates, dependencyStates, evidenceItems,
} from "./data";

const base = initialWorkbenchState;

describe("cognitive readiness model", () => {
  it("has eight readiness dimensions with the seeded defaults", () => {
    expect(readinessDimensions).toHaveLength(8);
    const byId = Object.fromEntries(readinessDimensions.map((d) => [d.id, d.score]));
    expect(byId.intent).toBe(96);
    expect(byId.evidence).toBe(82);
    expect(byId.assumptions).toBe(78);
  });

  it("has an eighteen stage lifecycle", () => {
    expect(readinessLifecycleStages).toHaveLength(18);
  });

  it("computes the seeded baseline as conditionally ready", () => {
    const c = computeReadiness(base);
    expect(c.state).toBe("Conditionally Ready");
    expect(c.passedGates).toBe(4);
    expect(c.blockingGaps).toHaveLength(0);
    expect(recommendationFor(c)).toMatch(/uncertainty markers/);
  });

  it("fails the Execution Safety Gate and requires remediation when rollback is removed", () => {
    const c = computeReadiness({ ...base, rollbackDefined: false });
    expect(c.gates.find((g) => g.id === "execution-safety")?.status).toBe("Failed");
    expect(c.state).toBe("Remediation Required");
    expect(c.blockingGaps).toContain("Rollback capability is undefined");
  });

  it("recalculates readiness when rollback is restored", () => {
    const removed = computeReadiness({ ...base, rollbackDefined: false });
    const restored = computeReadiness(base);
    expect(restored.score).toBeGreaterThan(removed.score);
    expect(restored.state).toBe("Conditionally Ready");
  });

  it("blocks readiness when the proposed state is removed", () => {
    const c = computeReadiness({ ...base, proposedStateDefined: false });
    expect(c.gates.find((g) => g.id === "required-context")?.status).toBe("Failed");
    expect(c.state).toBe("Blocked");
  });

  it("increases evidence sufficiency and Fraud persona readiness when evidence is added", () => {
    const before = computeReadiness(base);
    const after = computeReadiness({ ...base, fraudLossAnalysisProvided: true });
    expect(after.dimensionScores.evidence).toBeGreaterThan(before.dimensionScores.evidence);
    expect(after.personas.find((p) => p.persona === "Fraud Engineering")?.readiness).toBe("Ready");
  });

  it("activates governance context above 10% traffic exposure", () => {
    const c = computeReadiness({ ...base, trafficExposure: 15 });
    expect(c.governanceRequired).toBe(true);
    expect(c.state).toBe("Evidence Required");
  });

  it("improves dependency readiness when dependency evidence is resolved", () => {
    const c = computeReadiness({ ...base, regionalDependencyValidated: true });
    expect(c.dependencies.find((d) => d.dependency === "Regional Token Vault")?.status).toBe("Validated");
    expect(c.dimensionScores.scope).toBeGreaterThan(84);
  });

  it("lets a critical gate failure override a favourable average score", () => {
    const c = computeReadiness({
      ...base, rollbackDefined: false, fraudLossAnalysisProvided: true,
      stressTestProvided: true, regionalDependencyValidated: true,
    });
    expect(c.state).toBe("Remediation Required");
    expect(c.overrideReason).toMatch(/Execution Safety Gate/);
  });
});

describe("assessment queue", () => {
  it("filters by readiness state", () => {
    const rows = applyReadinessFilters(assessments, { ...defaultReadinessFilters, readinessState: "Ready" }, "");
    expect(rows.map((r) => r.id)).toEqual(["CRA 7002", "CRA 7005"]);
  });

  it("searches across id, work item, and team", () => {
    expect(applyReadinessFilters(assessments, defaultReadinessFilters, "vault")).toHaveLength(1);
  });

  it("counts active filters", () => {
    expect(activeReadinessFilterCount(defaultReadinessFilters)).toBe(0);
    expect(activeReadinessFilterCount({ ...defaultReadinessFilters, priority: "High" })).toBe(1);
  });
});

describe("coverage, findings and integrity", () => {
  it("exposes coverage rows, personas, conditions, dependencies and evidence", () => {
    expect(contextCoverageRows.length).toBeGreaterThanOrEqual(20);
    expect(personaStates).toHaveLength(6);
    expect(conditionStates).toHaveLength(7);
    expect(dependencyStates).toHaveLength(4);
    expect(evidenceItems.filter((e) => e.required && !e.provided).map((e) => e.evidence))
      .toEqual(["Fraud Loss Analysis", "Regional Dependency Stress Test"]);
  });

  it("keeps historical context rewrite violations at zero", () => {
    expect(historicalContextRewriteViolations).toBe(0);
  });

  it("traces every finding to a dimension and a gate", () => {
    findings.forEach((f) => {
      expect(f.dimension).toBeTruthy();
      expect(f.gate).toBeTruthy();
    });
  });
});
