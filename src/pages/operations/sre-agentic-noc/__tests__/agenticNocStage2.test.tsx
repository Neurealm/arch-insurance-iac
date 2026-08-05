import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Stage2WorkflowSection } from "../Stage2WorkflowSection";
import {
  computeConfidence, lifecycleEntries, rankHypotheses, useAgenticNocStore,
  availableEvidence, customersImpacted, rollbackAvailable,
} from "@/stores/useAgenticNocStore";
import { PRIMARY_ACTION_ID, PRIMARY_SITUATION_ID, scenarioSteps } from "@/data/agenticNocWorkflowData";

function renderSection() {
  return render(<MemoryRouter><Stage2WorkflowSection /></MemoryRouter>);
}

describe("SRE Based Agentic NOC — Stage 2 workflows", () => {
  beforeEach(() => {
    useAgenticNocStore.getState().resetScenario();
  });

  it("renders the situation lifecycle with the current stage and next decision", () => {
    renderSection();
    expect(screen.getByText("Situation Lifecycle")).toBeInTheDocument();
    expect(screen.getByText(/Next required decision/)).toBeInTheDocument();
  });

  it("advances and rewinds the demonstration scenario deterministically", () => {
    renderSection();
    const next = screen.getByRole("button", { name: "Next step" });
    for (let i = 0; i < 5; i += 1) fireEvent.click(next);
    expect(screen.getByTestId("scenario-step")).toHaveTextContent("Step 5 of 17");
    fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
    expect(screen.getByTestId("scenario-step")).toHaveTextContent("Step 4 of 17");
    expect(useAgenticNocStore.getState().events).toHaveLength(4);
  });

  it("runs the full scenario to the learning stage", () => {
    const store = useAgenticNocStore.getState();
    scenarioSteps.forEach(() => useAgenticNocStore.getState().advanceScenario());
    const state = useAgenticNocStore.getState();
    expect(state.scenarioStep).toBe(17);
    expect(state.lifecycleStage).toBe("Learning");
    expect(state.validationState).toBe("Passed");
    expect(customersImpacted(state)).toBe(0);
    expect(store).toBeDefined();
  });

  it("eliminates and promotes hypotheses and records the decision", () => {
    renderSection();
    fireEvent.click(screen.getAllByRole("button", { name: "Eliminate" })[0]);
    expect(useAgenticNocStore.getState().eliminatedHypothesisIds.length).toBeGreaterThan(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Promote to cause" })[0]);
    expect(useAgenticNocStore.getState().promotedHypothesisId).toBeTruthy();
  });

  it("opens the evidence drawer and filters evidence", () => {
    renderSection();
    fireEvent.click(screen.getAllByRole("button", { name: "View evidence" })[0]);
    const drawer = screen.getByRole("dialog");
    const before = Number(within(drawer).getByTestId("evidence-count").textContent?.split(" ")[0]);
    fireEvent.change(within(drawer).getByLabelText("Show"), { target: { value: "Supporting only" } });
    const after = Number(within(drawer).getByTestId("evidence-count").textContent?.split(" ")[0]);
    expect(after).toBeLessThanOrEqual(before);
  });

  it("requires an approver, a note and a risk acknowledgement before approval", () => {
    renderSection();
    fireEvent.click(screen.getAllByRole("button", { name: "Review and decide" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Approval requires/);
    expect(useAgenticNocStore.getState().actionRuntimes[PRIMARY_ACTION_ID].state).not.toBe("Approved");
  });

  it("approves, executes with confirmation, validates and rolls back", () => {
    renderSection();
    fireEvent.click(screen.getAllByRole("button", { name: "Review and decide" })[0]);
    fireEvent.change(screen.getByLabelText("Approval note"), { target: { value: "Guardrails reviewed" } });
    fireEvent.click(screen.getByLabelText(/acknowledge the operational risk/));
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(useAgenticNocStore.getState().actionRuntimes[PRIMARY_ACTION_ID].state).toBe("Approved");

    fireEvent.click(screen.getByRole("button", { name: "Execute" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm execution" }));
    expect(useAgenticNocStore.getState().actionRuntimes[PRIMARY_ACTION_ID].state).toBe("Executing");

    useAgenticNocStore.getState().startValidation();
    useAgenticNocStore.getState().completeValidation();
    expect(useAgenticNocStore.getState().validationState).toBe("Passed");
    expect(customersImpacted(useAgenticNocStore.getState())).toBe(0);

    useAgenticNocStore.getState().rollbackAction(PRIMARY_ACTION_ID);
    const state = useAgenticNocStore.getState();
    expect(state.actionRuntimes[PRIMARY_ACTION_ID].state).toBe("Rolled back");
    expect(state.validationState).toBe("Not started");
  });

  it("marks rollback as available while an action is executing", () => {
    useAgenticNocStore.getState().approveAction(PRIMARY_ACTION_ID, {
      approver: "Lead", note: "ok", riskAcknowledged: true,
    });
    useAgenticNocStore.getState().executeAction(PRIMARY_ACTION_ID);
    expect(rollbackAvailable(useAgenticNocStore.getState(), PRIMARY_ACTION_ID)).toBe(true);
  });

  it("records failing validation and recommends rollback", () => {
    renderSection();
    useAgenticNocStore.getState().startValidation();
    fireEvent.click(screen.getByRole("button", { name: "Record failing results" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/required validation test failed/);
  });

  it("filters the workflow event stream by category", () => {
    renderSection();
    for (let i = 0; i < 12; i += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    const state = useAgenticNocStore.getState();
    expect(state.eventFilter).toBe("Actions");
    expect(state.events.some((e) => e.category === "Actions")).toBe(true);
  });

  it("opens a deterministic reroute simulation", () => {
    renderSection();
    fireEvent.click(screen.getAllByRole("button", { name: "Simulate reroute" })[0]);
    expect(screen.getByRole("dialog")).toHaveTextContent("Proposed route");
  });

  it("dismisses a predicted risk", () => {
    renderSection();
    const before = screen.getAllByRole("button", { name: "Dismiss with reason" }).length;
    fireEvent.click(screen.getAllByRole("button", { name: "Dismiss with reason" })[0]);
    expect(screen.getAllByRole("button", { name: "Dismiss with reason" }).length).toBe(before - 1);
  });

  it("computes confidence deterministically from the evidence set", () => {
    const evidence = availableEvidence(PRIMARY_SITUATION_ID, false);
    const first = computeConfidence("hyp-1", evidence);
    const second = computeConfidence("hyp-1", evidence);
    expect(first).toBe(second);
    const ranked = rankHypotheses(PRIMARY_SITUATION_ID, false, [], null);
    expect(ranked[0].confidence).toBeGreaterThanOrEqual(ranked[1].confidence);
  });

  it("returns nine lifecycle stages with exactly one current stage", () => {
    const entries = lifecycleEntries("Validating");
    expect(entries).toHaveLength(9);
    expect(entries.filter((e) => e.state === "current")).toHaveLength(1);
  });

  it("closes drawers with the Escape key", () => {
    renderSection();
    fireEvent.click(screen.getAllByRole("button", { name: "View evidence" })[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
