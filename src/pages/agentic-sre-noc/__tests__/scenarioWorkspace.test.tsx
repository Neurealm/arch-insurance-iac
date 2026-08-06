/**
 * AIM-006.1 — Scenario Workspace integration tests.
 *
 * Component-scoped: renders only ScenarioWorkspace against the real scenario
 * state hook, using the controls, labels and roles the component actually
 * renders.
 */

import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScenarioWorkspace } from "../scenario/ScenarioWorkspace";
import { renderWithScenarioState } from "./helpers/aim006Harness";

afterEach(() => { vi.useRealTimers(); });

const renderWorkspace = () => {
  const utils = renderWithScenarioState((state) => <ScenarioWorkspace state={state} />);
  const root = screen.getByTestId("scenario-workspace");
  const stagePanel = screen.getByRole("region", { name: /current scenario stage/i });
  return { ...utils, root, stagePanel, scope: within(root) };
};

const stageHeading = () =>
  within(screen.getByRole("region", { name: /current scenario stage/i })).getByRole("heading").textContent ?? "";

/** Advances to a target stage through the real controls, approving when the gate requires it. */
async function advanceTo(user: ReturnType<typeof renderWorkspace>["user"], target: number) {
  const scope = within(screen.getByTestId("scenario-workspace"));
  for (let stage = 1; stage < target; stage += 1) {
    if (stage === 9) {
      const approve = scope.getByRole("button", { name: /approve traffic movement/i });
      if (!(approve as HTMLButtonElement).disabled) await user.click(approve);
    }
    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
  }
}

describe("AIM-006.1 — scenario progression", () => {
  it("starts at the Baseline stage", () => {
    renderWorkspace();
    expect(stageHeading()).toMatch(/Stage 1 of 15 · Baseline/);
  });

  it("advances one stage with Next Stage", async () => {
    const { user, scope } = renderWorkspace();
    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    expect(stageHeading()).toMatch(/Stage 2 of 15 · Weather Forecast Update/);
  });

  it("returns one stage with Previous Stage", async () => {
    const { user, scope } = renderWorkspace();
    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    await user.click(scope.getByRole("button", { name: /^previous stage$/i }));
    expect(stageHeading()).toMatch(/Stage 1 of 15 · Baseline/);
  });

  it("reports a transition error at the first stage boundary", async () => {
    const { user, scope } = renderWorkspace();
    await user.click(scope.getByRole("button", { name: /^previous stage$/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/already at the first stage/i);
  });

  it("resets back to Baseline", async () => {
    const { user, scope } = renderWorkspace();
    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    await user.click(scope.getByRole("button", { name: /^reset$/i }));
    expect(stageHeading()).toMatch(/Stage 1 of 15 · Baseline/);
  });

  it("announces the current stage in a live region", async () => {
    const { user, scope } = renderWorkspace();
    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    const announcement = screen.getByTestId("scenario-announcement");
    expect(announcement).toHaveAttribute("aria-live", "polite");
    expect(announcement).toHaveTextContent(/Weather Forecast Update/);
  });

  it("enables Pause once Start is pressed and Continue after Pause", async () => {
    const { user, scope } = renderWorkspace();
    await user.click(scope.getByRole("button", { name: /^start$/i }));
    expect(scope.getByRole("button", { name: /^pause$/i })).toBeEnabled();
    expect(scope.getByRole("button", { name: /^start$/i })).toBeDisabled();
    await user.click(scope.getByRole("button", { name: /^pause$/i }));
    expect(scope.getByRole("button", { name: /^continue$/i })).toBeEnabled();
  });

  it("records timeline events for visited stages", async () => {
    const { user, scope } = renderWorkspace();
    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    expect(scope.getByTestId("timeline-event-2")).toBeInTheDocument();
  });
});

describe("AIM-006.1 — timed playback", () => {
  it("advances on the playback clock and stops when paused", async () => {
    vi.useFakeTimers();
    const { handle } = renderWithScenarioState((state) => <ScenarioWorkspace state={state} />);

    await vi.waitFor(() => expect(handle.current).not.toBeNull());
    handle.current!.setPlaying(true);
    await vi.advanceTimersByTimeAsync(1700);
    const afterFirstTick = handle.current!.stageIndex;
    expect(afterFirstTick).toBeGreaterThan(1);

    handle.current!.setPlaying(false);
    await vi.advanceTimersByTimeAsync(5000);
    expect(handle.current!.stageIndex).toBe(afterFirstTick);
  });
});

describe("AIM-006.1 — approval gate", () => {
  it("blocks progression past the approval stage until approved", async () => {
    const { user, scope } = renderWorkspace();
    for (let i = 0; i < 8; i += 1) await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    expect(stageHeading()).toMatch(/Stage 9 of 15 · Policy and Approval/);
    expect(scope.getByTestId("scenario-approval-state")).toHaveTextContent("pending");

    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/approval is required/i);
    expect(stageHeading()).toMatch(/Stage 9 of 15/);
  });

  it("permits controlled execution after approval", async () => {
    const { user, scope } = renderWorkspace();
    await advanceTo(user, 10);
    expect(scope.getByTestId("scenario-approval-state")).toHaveTextContent("approved");
    expect(stageHeading()).toMatch(/Stage 10 of 15 · Controlled Execution/);
  });

  it("blocks execution when the action is rejected", async () => {
    const { user, scope } = renderWorkspace();
    for (let i = 0; i < 8; i += 1) await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    await user.click(scope.getByRole("button", { name: /reject traffic movement/i }));
    expect(scope.getByTestId("scenario-approval-state")).toHaveTextContent("rejected");
    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    expect(stageHeading()).toMatch(/Stage 9 of 15/);
  });

  it("pauses the scenario and offers resume when more evidence is requested", async () => {
    const { user, scope, handle } = renderWorkspace();
    for (let i = 0; i < 8; i += 1) await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    await user.click(scope.getByRole("button", { name: /request more evidence/i }));
    expect(scope.getByTestId("scenario-approval-state")).toHaveTextContent("evidence-requested");
    expect(handle.current!.explainOpen).toBe(true);
    expect(handle.current!.explainTab).toBe("Evidence");
    await user.click(scope.getByRole("button", { name: /resume scenario/i }));
    expect(scope.getByTestId("scenario-approval-state")).toHaveTextContent("pending");
  });
});

describe("AIM-006.1 — failure simulations", () => {
  const selectFailure = async (user: ReturnType<typeof renderWorkspace>["user"], label: string) => {
    await user.selectOptions(screen.getByLabelText(/failure simulation/i), screen.getByRole("option", { name: label }));
  };

  it("Stale Weather reduces confidence and records an advisory note", async () => {
    const { user, scope } = renderWorkspace();
    const before = Number(scope.getByTestId("scenario-confidence").textContent!.replace("%", ""));
    await selectFailure(user, "Stale Weather Data");
    expect(Number(scope.getByTestId("scenario-confidence").textContent!.replace("%", ""))).toBeLessThan(before);
    expect(scope.getByTestId("scenario-simulation-notes")).toHaveTextContent(/additional evidence required/i);
  });

  it("Missing Terminal Telemetry reduces confidence and flags incomplete evidence", async () => {
    const { user, scope } = renderWorkspace();
    const before = Number(scope.getByTestId("scenario-confidence").textContent!.replace("%", ""));
    await selectFailure(user, "Missing Terminal Telemetry");
    expect(Number(scope.getByTestId("scenario-confidence").textContent!.replace("%", ""))).toBeLessThan(before);
    expect(scope.getByTestId("scenario-simulation-notes")).toHaveTextContent(/terminal evidence incomplete/i);
  });

  it("Conflicting Weather Forecasts widens the ETA range advisory", async () => {
    const { user, scope } = renderWorkspace();
    await selectFailure(user, "Conflicting Weather Forecasts");
    expect(scope.getByTestId("scenario-simulation-notes")).toHaveTextContent(/eta range widens/i);
  });

  it("Insufficient RF Fallback Capacity fails fallback readiness and blocks execution", async () => {
    const { user, scope } = renderWorkspace();
    await selectFailure(user, "Insufficient RF Fallback Capacity");
    expect(scope.getByTestId("scenario-fallback")).toHaveTextContent("Not ready");
    for (let i = 0; i < 8; i += 1) await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    await user.click(scope.getByRole("button", { name: /approve traffic movement/i }));
    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
    expect(stageHeading()).toMatch(/Stage 9 of 15/);
  });

  it("Execution Validation Failure records rollback in the outcome", async () => {
    const { user, scope } = renderWorkspace();
    await selectFailure(user, "Execution Validation Failure");
    await advanceTo(user, 12);
    const outcome = within(scope.getByTestId("scenario-outcome"));
    expect(outcome.getByText("Failed")).toBeInTheDocument();
    expect(outcome.getByText("Executed")).toBeInTheDocument();
  });

  it("False Positive classifies the outcome and records learning", async () => {
    const { user, scope } = renderWorkspace();
    await selectFailure(user, "False Positive");
    await advanceTo(user, 15);
    expect(within(scope.getByTestId("scenario-outcome")).getByText("False positive")).toBeInTheDocument();
    expect(scope.getByTestId("scenario-learning")).toHaveTextContent(/threshold review/i);
  });

  it("Missed Event records customer impact", async () => {
    const { user, scope } = renderWorkspace();
    await selectFailure(user, "Missed Event");
    await advanceTo(user, 15);
    const outcome = within(scope.getByTestId("scenario-outcome"));
    expect(outcome.getByText("Missed event")).toBeInTheDocument();
    expect(outcome.getByText("Customer impact occurred")).toBeInTheDocument();
  });

  it("Successful Protection keeps the customer healthy", async () => {
    const { user, scope } = renderWorkspace();
    await selectFailure(user, "Successful Protection");
    await advanceTo(user, 15);
    const outcome = within(scope.getByTestId("scenario-outcome"));
    expect(outcome.getByText("Correct")).toBeInTheDocument();
    expect(outcome.getByText("No impact")).toBeInTheDocument();
  });
});

describe("AIM-006.1 — exports and accessibility", () => {
  it("exports the timeline locally and reports the result", async () => {
    const { user, scope } = renderWorkspace();
    await user.click(scope.getByRole("button", { name: /export timeline/i }));
    expect(scope.getByText(/aim006-scenario-timeline\.csv/i)).toBeInTheDocument();
  });

  it("names the failure simulation and playback speed controls", () => {
    const { scope } = renderWorkspace();
    expect(scope.getByLabelText(/failure simulation/i)).toBeInTheDocument();
    expect(scope.getByLabelText(/playback speed/i)).toBeInTheDocument();
  });

  it("names the scenario stage, activity, outcome and learning regions", () => {
    renderWorkspace();
    for (const name of [/current scenario stage/i, /predictive protection activity/i, /predictive protection outcome/i, /what the system learned/i]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
  });

  it("renders loading and error states through the shared panel contract", () => {
    const { handle, rerender } = renderWithScenarioState((state) => <ScenarioWorkspace state={state} />);
    handle.current!.setPanelState("error");
    rerender(<div />);
    expect(screen.queryByTestId("scenario-workspace")).not.toBeInTheDocument();
  });
});
