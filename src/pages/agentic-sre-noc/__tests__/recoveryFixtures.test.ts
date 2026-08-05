/**
 * Autonomous Recovery Monitor fixture contract tests.
 *
 * Verify that the recovery execution data continues the shared Chennai
 * identifiers and stays internally consistent.
 */

import { describe, expect, it } from "vitest";
import { APPROVAL_ID } from "../data/approvalFixtures";
import { SITUATION_ID } from "../data/situationFixtures";
import {
  EXECUTION_ID, diagnostics, executionActors, executionEvidence,
  executionStateStages, liveGuardrails, ownershipMatrix, OWNERSHIP_MATRIX_COLUMNS,
  recoveryExceptions, recoveryHeader, recoveryKpis, recoveryOperations,
  recoveryOutcomes, recoveryScenario, RECOVERY_COLUMNS, DEFAULT_RECOVERY_COLUMNS,
  rollbackExecSteps, rollbackTriggers, routeObjects, scenarioInjections,
  timelineEvents, transitionStages, validationTests, workflowSteps, beamSequence,
} from "../data/recoveryFixtures";

describe("Autonomous Recovery Monitor fixtures", () => {
  it("continues the shared Chennai identifiers", () => {
    expect(EXECUTION_ID).toBe("EXE-2026-0417-01");
    expect(recoveryHeader.situationId).toBe(SITUATION_ID);
    expect(recoveryHeader.approvalId).toBe(APPROVAL_ID);
    expect(recoveryHeader.customer).toBe("Chennai Mobile Network");
    expect(recoveryHeader.customerService).toBe("Chennai Mobile Backhaul Service 041");
    expect(recoveryHeader.linkId).toBe("lnk-chennai-041");
    expect(recoveryHeader.product).toBe("Lightbridge Pro");
    expect(recoveryHeader.region).toBe("India South");
    expect(recoveryHeader.committedCapacity).toBe("10 Gbps");
  });

  it("defaults to the governed Chennai recovery in the queue", () => {
    expect(recoveryOperations[0].id).toBe(EXECUTION_ID);
    expect(recoveryOperations).toHaveLength(8);
    expect(new Set(recoveryOperations.map((r) => r.id)).size).toBe(recoveryOperations.length);
  });

  it("exposes eight KPI cards with the required headline values", () => {
    expect(recoveryKpis).toHaveLength(8);
    const byId = Object.fromEntries(recoveryKpis.map((k) => [k.id, k.value]));
    expect(byId["kpi-active"]).toBe("6");
    expect(byId["kpi-progress"]).toBe("68%");
    expect(byId["kpi-service"]).toBe("Available");
    expect(byId["kpi-restored"]).toBe("6.9 Gbps");
    expect(byId["kpi-validation"]).toBe("8 of 10");
    expect(byId["kpi-rollback"]).toBe("100%");
    expect(byId["kpi-time"]).toBe("11m 24s");
    expect(byId["kpi-avoided"]).toBe("45 minutes");
  });

  it("defines the 22 step recovery workflow in order", () => {
    expect(workflowSteps).toHaveLength(22);
    workflowSteps.forEach((s, i) => expect(s.n).toBe(i + 1));
    expect(workflowSteps[0].name).toBe("Confirm action authorization");
    expect(workflowSteps[21].name).toBe("Mark recovery complete");
  });

  it("keeps the current execution on the recovery monitoring step", () => {
    expect(recoveryHeader.currentStep).toBe("Monitor optical recovery threshold");
    expect(workflowSteps[8].name).toBe(recoveryHeader.currentStep);
    expect(workflowSteps[8].status).toBe("Running");
  });

  it("models the traffic transition from the current split to full restoration", () => {
    expect(transitionStages[0].optical).toBe(6.9);
    expect(transitionStages[0].fallback).toBe(3.1);
    const full = transitionStages.find((t) => t.id === "ts-full")!;
    expect(full.optical).toBe(10);
    expect(full.fallback).toBe(0);
    transitionStages.forEach((t) => expect(t.optical + t.fallback).toBeCloseTo(10, 5));
  });

  it("provides diagnostics across all five domains", () => {
    const groups = new Set(diagnostics.map((x) => x.group));
    expect(groups.size).toBe(5);
    expect(diagnostics.length).toBeGreaterThanOrEqual(40);
  });

  it("provides validation tests across all five validation groups", () => {
    const groups = new Set(validationTests.map((t) => t.group));
    expect(groups.size).toBe(5);
    expect(validationTests.some((t) => t.status === "Pending sustained condition")).toBe(true);
  });

  it("keeps every blocking guardrail passing except the sustained recovery warning", () => {
    const blocked = liveGuardrails.filter((g) => g.enforcement === "Blocking" && (g.status === "Blocked" || g.status === "Triggered"));
    expect(blocked).toHaveLength(0);
    expect(liveGuardrails.find((g) => g.id === "lg-sustained")!.status).toBe("Warning");
    expect(liveGuardrails).toHaveLength(14);
  });

  it("carries the approved rollback triggers and an 11 step rollback plan", () => {
    expect(rollbackTriggers).toHaveLength(10);
    expect(rollbackExecSteps).toHaveLength(11);
    expect(rollbackExecSteps[0].name).toBe("Detect rollback trigger");
    expect(rollbackExecSteps.at(-1)!.name).toBe("Reopen investigation if needed");
  });

  it("lists ten execution exceptions with response guidance", () => {
    expect(recoveryExceptions).toHaveLength(10);
    recoveryExceptions.forEach((x) => {
      expect(x.recommended.length).toBeGreaterThan(5);
      expect(x.rollbackRelation.length).toBeGreaterThan(5);
    });
  });

  it("assigns ten digital coworkers and eight human roles", () => {
    expect(executionActors.filter((a) => a.kind === "Agent")).toHaveLength(10);
    expect(executionActors.filter((a) => a.kind === "Human")).toHaveLength(8);
    expect(executionActors.some((a) => a.name === "RF Fallback Guardian")).toBe(true);
    expect(executionActors.some((a) => a.name === "Rollback Guardian")).toBe(true);
  });

  it("covers every ownership matrix column for each actor", () => {
    ownershipMatrix.forEach((r) => {
      OWNERSHIP_MATRIX_COLUMNS.forEach((c) => expect(r.cells[c]).toBeTruthy());
    });
  });

  it("links every timeline event to an existing evidence record", () => {
    const ids = new Set(executionEvidence.map((e) => e.id));
    timelineEvents.forEach((e) => expect(ids.has(e.evidence)).toBe(true));
  });

  it("links every workflow step and diagnostic to an existing evidence record", () => {
    const ids = new Set(executionEvidence.map((e) => e.id));
    workflowSteps.forEach((s) => {
      if (s.evidence !== "Not applicable") expect(ids.has(s.evidence)).toBe(true);
    });
    diagnostics.forEach((x) => expect(ids.has(x.evidence)).toBe(true));
    validationTests.forEach((t) => expect(ids.has(t.evidence)).toBe(true));
  });

  it("progresses the scenario monotonically to completion", () => {
    expect(recoveryScenario).toHaveLength(22);
    recoveryScenario.forEach((s, i) => {
      expect(s.n).toBe(i + 1);
      if (i > 0) expect(s.progress).toBeGreaterThanOrEqual(recoveryScenario[i - 1].progress);
    });
    expect(recoveryScenario.at(-1)!.state).toBe("Completed");
    expect(recoveryScenario.at(-1)!.optical).toBe(10);
    expect(recoveryScenario.at(-1)!.fallback).toBe(0);
  });

  it("provides five scenario injections mapped to real exceptions", () => {
    expect(scenarioInjections).toHaveLength(5);
    const exceptionIds = new Set(recoveryExceptions.map((x) => x.id));
    scenarioInjections.forEach((i) => expect(exceptionIds.has(i.exceptionId)).toBe(true));
  });

  it("describes the full customer service chain and alternate routes", () => {
    const ids = routeObjects.map((o) => o.id);
    ["n-customer", "n-edge", "n-partner", "n-handoff", "n-terminal-a", "e-primary", "n-terminal-b", "n-regional", "n-towers", "n-downstream", "e-rf", "e-alt-fiber", "e-alt-optical", "n-power"]
      .forEach((id) => expect(ids).toContain(id));
  });

  it("records eighteen recovery outcomes labelled as synthetic", () => {
    expect(recoveryOutcomes).toHaveLength(18);
    const byMetric = Object.fromEntries(recoveryOutcomes.map((o) => [o.metric, o.value]));
    expect(byMetric["Customer service availability"]).toBe("99.999%");
    expect(byMetric["Time to mitigate"]).toBe("4m 18s");
    expect(byMetric["Time to restore"]).toBe("18m 42s");
    expect(byMetric["Error budget preserved"]).toBe("22%");
    expect(byMetric["Outage minutes avoided"]).toBe("45");
    expect(byMetric["Autonomous steps completed"]).toBe("17");
    expect(byMetric["Human decisions required"]).toBe("2");
    expect(byMetric["Evidence completeness"]).toBe("100%");
  });

  it("defines the twelve stage beam reacquisition sequence", () => {
    expect(beamSequence).toHaveLength(12);
    expect(beamSequence[0].name).toBe("Confirm customer traffic protected");
    expect(beamSequence.at(-1)!.name).toBe("Close recovery");
  });

  it("keeps default queue columns valid", () => {
    const keys = new Set(RECOVERY_COLUMNS.map((c) => c.key));
    DEFAULT_RECOVERY_COLUMNS.forEach((k) => expect(keys.has(k)).toBe(true));
  });

  it("marks the active execution state stage as recovery monitoring", () => {
    const active = executionStateStages.find((s) => s.status === "Active");
    expect(active?.state).toBe("Recovery monitoring");
  });
});
