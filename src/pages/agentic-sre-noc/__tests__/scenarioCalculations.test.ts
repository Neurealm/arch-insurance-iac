/**
 * AIM-006 — direct unit tests for the pure scenario functions.
 */

import { describe, expect, it } from "vitest";
import {
  applyScenarioFailure, buildScenarioTimeline, buildScenarioTimelineEvent, calculateEvidenceCompleteness,
  calculateLearningUpdates, calculateOutageMinutesAvoided, calculateRollbackDecision,
  calculateScenarioConfidence, calculateScenarioErrorBudgetPreserved, calculateScenarioOutcome,
  compareTraditionalAndAgentic, deriveScenarioStageState, evaluateScenarioApproval, normaliseStageIndex,
} from "../scenario/scenarioCalculations";
import { evidenceItems, scenarioStages } from "../scenario/scenarioFixtures";

describe("AIM-006 — deriveScenarioStageState", () => {
  it("derives every defined stage with stable metadata", () => {
    for (const definition of scenarioStages) {
      const stage = deriveScenarioStageState(definition.index);
      expect(stage.index).toBe(definition.index);
      expect(stage.title).toBe(definition.title);
      expect(stage.actor).toBe(definition.actor);
      expect(stage.state.length).toBeGreaterThan(0);
    }
  });

  it("clamps invalid stage numbers into range", () => {
    expect(deriveScenarioStageState(0).index).toBe(1);
    expect(deriveScenarioStageState(99).index).toBe(15);
    expect(normaliseStageIndex(Number.NaN)).toBe(1);
  });

  it("reaches the documented risk and confidence at the risk-prediction stage", () => {
    const stage = deriveScenarioStageState(5);
    expect(stage.riskScore).toBeCloseTo(0.94, 2);
    expect(stage.confidencePct).toBe(94);
  });

  it("blocks execution stages until approval is granted", () => {
    expect(deriveScenarioStageState(10, "none", "pending").blocked).toBe(true);
    expect(deriveScenarioStageState(10, "none", "approved").blocked).toBe(false);
  });

  it("is deterministic", () => {
    expect(deriveScenarioStageState(7, "stale-weather", "pending"))
      .toEqual(deriveScenarioStageState(7, "stale-weather", "pending"));
  });
});

describe("AIM-006 — applyScenarioFailure", () => {
  it("returns the base set unchanged for the successful scenario", () => {
    const result = applyScenarioFailure(evidenceItems, "none");
    expect(result).toEqual(evidenceItems.map((i) => ({ ...i })));
  });

  it("never mutates the base fixtures", () => {
    const before = JSON.stringify(evidenceItems);
    applyScenarioFailure(evidenceItems, "stale-weather");
    applyScenarioFailure(evidenceItems, "missing-telemetry");
    applyScenarioFailure(evidenceItems, "insufficient-fallback");
    expect(JSON.stringify(evidenceItems)).toBe(before);
  });

  it("degrades weather freshness for stale weather", () => {
    const weather = applyScenarioFailure(evidenceItems, "stale-weather").filter((i) => i.category === "Weather Evidence");
    expect(weather.every((i) => i.freshness === "stale")).toBe(true);
  });

  it("marks terminal evidence missing for missing telemetry", () => {
    const terminal = applyScenarioFailure(evidenceItems, "missing-telemetry").filter((i) => i.category === "Terminal Evidence");
    expect(terminal.every((i) => i.freshness === "missing")).toBe(true);
  });

  it("flips fallback evidence to contradicting for insufficient fallback", () => {
    const fallback = applyScenarioFailure(evidenceItems, "insufficient-fallback").filter((i) => i.category === "Fallback Evidence");
    expect(fallback.every((i) => i.stance === "contradicts")).toBe(true);
  });

  it("handles missing input safely", () => {
    expect(applyScenarioFailure([], "stale-weather")).toEqual([]);
  });
});

describe("AIM-006 — evaluateScenarioApproval", () => {
  it("does not require approval before the policy stage", () => {
    const result = evaluateScenarioApproval(5, "pending");
    expect(result.required).toBe(false);
    expect(result.canExecute).toBe(false);
  });

  it("requires approval from the policy stage", () => {
    expect(evaluateScenarioApproval(9, "pending").required).toBe(true);
  });

  it("permits execution once approved", () => {
    expect(evaluateScenarioApproval(9, "approved").canExecute).toBe(true);
  });

  it("prevents execution when rejected", () => {
    const result = evaluateScenarioApproval(10, "rejected");
    expect(result.canExecute).toBe(false);
    expect(result.state).toBe("rejected");
  });

  it("pauses when more evidence is requested", () => {
    expect(evaluateScenarioApproval(9, "evidence-requested").canExecute).toBe(false);
  });

  it("blocks execution when the fallback is insufficient even with approval", () => {
    const result = evaluateScenarioApproval(10, "approved", "insufficient-fallback");
    expect(result.canExecute).toBe(false);
    expect(result.reason).toContain("Insufficient RF Fallback Capacity");
  });

  it("requires more evidence for stale weather before approval", () => {
    expect(evaluateScenarioApproval(9, "pending", "stale-weather").reason).toContain("Additional evidence");
  });
});

describe("AIM-006 — calculateEvidenceCompleteness", () => {
  it("returns 100 for a fully current evidence set", () => {
    const items = evidenceItems.map((i) => ({ ...i, freshness: "current" as const }));
    expect(calculateEvidenceCompleteness(items)).toBe(100);
  });

  it("penalises stale evidence and excludes missing evidence", () => {
    const base = calculateEvidenceCompleteness(evidenceItems);
    expect(calculateEvidenceCompleteness(applyScenarioFailure(evidenceItems, "stale-weather"))).toBeLessThan(base);
    expect(calculateEvidenceCompleteness(applyScenarioFailure(evidenceItems, "missing-telemetry"))).toBeLessThan(base);
  });

  it("handles empty input", () => {
    expect(calculateEvidenceCompleteness([])).toBe(0);
  });
});

describe("AIM-006 — calculateScenarioConfidence", () => {
  it("ramps to the documented 94 percent by the risk stage", () => {
    expect(calculateScenarioConfidence(1)).toBeLessThan(94);
    expect(calculateScenarioConfidence(5)).toBe(94);
  });

  it("reduces confidence under each degrading simulation", () => {
    expect(calculateScenarioConfidence(5, "stale-weather")).toBeLessThan(94);
    expect(calculateScenarioConfidence(5, "conflicting-forecasts")).toBeLessThan(94);
    expect(calculateScenarioConfidence(5, "missing-telemetry")).toBeLessThan(94);
  });

  it("stays within 0 and 100 for extreme inputs", () => {
    expect(calculateScenarioConfidence(5, "missed-event", 1000)).toBe(100);
    expect(calculateScenarioConfidence(5, "missed-event", Number.NaN)).toBe(0);
  });
});

describe("AIM-006 — outcome calculations", () => {
  it("calculates outage minutes avoided", () => {
    expect(calculateOutageMinutesAvoided(45, 0)).toBe(45);
    expect(calculateOutageMinutesAvoided(45, 6)).toBe(39);
    expect(calculateOutageMinutesAvoided(10, 40)).toBe(0);
    expect(calculateOutageMinutesAvoided(Number.NaN, 5)).toBe(0);
  });

  it("calculates preserved error budget", () => {
    expect(calculateScenarioErrorBudgetPreserved(22, 0)).toBe(22);
    expect(calculateScenarioErrorBudgetPreserved(22, 8)).toBe(14);
    expect(calculateScenarioErrorBudgetPreserved(0, 5)).toBe(0);
    expect(calculateScenarioErrorBudgetPreserved(Number.NaN, Number.NaN)).toBe(0);
  });

  it("produces the documented successful outcome", () => {
    const outcome = calculateScenarioOutcome(15, "none", "approved");
    expect(outcome.predictionResult).toBe("Correct");
    expect(outcome.customerOutcome).toBe("No impact");
    expect(outcome.capacityProtectedGbps).toBe(10);
    expect(outcome.outageMinutesAvoided).toBe(45);
    expect(outcome.sloImpact).toBe("None");
    expect(outcome.errorBudgetPreservedPct).toBe(22);
    expect(outcome.preventiveActionResult).toBe("Effective");
    expect(outcome.validationResult).toBe("Passed");
    expect(outcome.rollbackResult).toBe("Not required");
    expect(outcome.evidenceCompletenessPct).toBe(100);
    expect(outcome.learningRecorded).toBe(true);
  });

  it("records a false positive outcome", () => {
    expect(calculateScenarioOutcome(15, "false-positive", "approved").predictionResult).toBe("False positive");
  });

  it("records a missed event outcome", () => {
    const outcome = calculateScenarioOutcome(15, "missed-event", "approved");
    expect(outcome.predictionResult).toBe("Missed event");
    expect(outcome.customerOutcome).toBe("Customer impact occurred");
    expect(outcome.outageMinutesAvoided).toBe(0);
  });

  it("records rollback for an execution validation failure", () => {
    const outcome = calculateScenarioOutcome(12, "validation-failure", "approved");
    expect(outcome.validationResult).toBe("Failed");
    expect(outcome.rollbackResult).toBe("Executed");
  });

  it("keeps the customer exposed when approval is rejected", () => {
    const outcome = calculateScenarioOutcome(15, "none", "rejected");
    expect(outcome.customerOutcome).toBe("Customer remains exposed");
    expect(outcome.capacityProtectedGbps).toBe(0);
  });
});

describe("AIM-006 — calculateRollbackDecision", () => {
  it("is not required before execution", () => {
    expect(calculateRollbackDecision(5).triggered).toBe(false);
    expect(calculateRollbackDecision(5).result).toBe("Not required");
  });

  it("triggers on validation failure after approval", () => {
    const decision = calculateRollbackDecision(11, "validation-failure", "approved");
    expect(decision.triggered).toBe(true);
    expect(decision.result).toBe("Executed");
  });
});

describe("AIM-006 — calculateLearningUpdates", () => {
  it("records the full learning set at the final stage", () => {
    const updates = calculateLearningUpdates("none", 15);
    expect(updates).toHaveLength(15);
    expect(updates.map((u) => u.key)).toContain("cause");
    expect(updates.every((u) => u.lifecycleState.endsWith("lifecycle update"))).toBe(true);
  });

  it("is empty before an outcome exists", () => {
    expect(calculateLearningUpdates("none", 3)).toEqual([]);
  });

  it("recommends a threshold review after a false positive", () => {
    const updates = calculateLearningUpdates("false-positive", 15);
    expect(updates.find((u) => u.key === "threshold")?.value).toContain("threshold review");
  });
});

describe("AIM-006 — compareTraditionalAndAgentic", () => {
  it("returns ten stages and ten metrics", () => {
    const model = compareTraditionalAndAgentic();
    expect(model.stageCount).toBe(10);
    expect(model.metricCount).toBe(10);
    expect(model.stages[0].stage).toBe("Detection");
  });

  it("handles empty inputs", () => {
    const model = compareTraditionalAndAgentic([], []);
    expect(model.stageCount).toBe(0);
    expect(model.metricCount).toBe(0);
  });
});

describe("AIM-006 — timeline events", () => {
  it("builds one deterministic record per stage", () => {
    const event = buildScenarioTimelineEvent(5);
    expect(event.stageIndex).toBe(5);
    expect(event.actor).toBe("Recommendation Engine");
    expect(event.timestamp).toMatch(/^T\+\d{2}:\d{2}$/);
    expect(buildScenarioTimelineEvent(5)).toEqual(event);
  });

  it("marks blocked stages", () => {
    expect(buildScenarioTimelineEvent(10, "none", "rejected").status).toBe("blocked");
  });

  it("builds the timeline up to the current stage", () => {
    const timeline = buildScenarioTimeline(6, "none", "pending");
    expect(timeline).toHaveLength(6);
    expect(timeline[5].status).toBe("active");
    expect(timeline[0].status).toBe("complete");
  });
});
