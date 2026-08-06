/**
 * AIM-006.1 — Traditional versus agentic comparison panel tests.
 */

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TraditionalComparisonPanel } from "../scenario/TraditionalComparisonPanel";
import { renderWithScenarioState } from "./helpers/aim006Harness";

function renderPanel() {
  const utils = renderWithScenarioState((state) => <TraditionalComparisonPanel state={state} />);
  const region = screen.getByRole("region", { name: /why traditional monitoring does not solve this/i });
  return { ...utils, region, scope: within(region) };
}

describe("AIM-006.1 — traditional comparison", () => {
  it("renders both operating-model columns", () => {
    const { scope } = renderPanel();
    expect(scope.getByRole("columnheader", { name: /traditional monitoring/i })).toBeInTheDocument();
    expect(scope.getByRole("columnheader", { name: /agentic predictive protection/i })).toBeInTheDocument();
  });

  it("renders one row per comparison stage", () => {
    const { scope } = renderPanel();
    const stageTable = scope.getAllByRole("table")[0];
    expect(within(stageTable).getAllByRole("row").length).toBe(11); // header plus ten stages
  });

  it("renders the synthetic-value labelling", () => {
    const { scope } = renderPanel();
    expect(scope.getAllByText(/synthetic demonstration values/i).length).toBeGreaterThan(0);
  });

  it("expands a row and shows the stage detail", async () => {
    const { user, scope } = renderPanel();
    const detection = scope.getByRole("button", { name: /^detection$/i });
    await user.click(detection);
    expect(detection).toHaveAttribute("aria-expanded", "true");
    const detail = within(screen.getByTestId("comparison-detail"));
    expect(detail.getByText(/systems involved/i)).toBeInTheDocument();
    expect(detail.getByText(/modernization requirement/i)).toBeInTheDocument();
  });

  it("collapses the row when selected again", async () => {
    const { user, scope } = renderPanel();
    const detection = scope.getByRole("button", { name: /^detection$/i });
    await user.click(detection);
    await user.click(detection);
    expect(screen.queryByTestId("comparison-detail")).not.toBeInTheDocument();
  });

  it("renders the comparison metrics table", () => {
    const { scope } = renderPanel();
    const metricsTable = scope.getAllByRole("table")[1];
    expect(within(metricsTable).getAllByRole("row").length).toBeGreaterThan(1);
  });

  it("exports the comparison locally", async () => {
    const { user, scope, handle } = renderPanel();
    await user.click(scope.getByRole("button", { name: /export comparison/i }));
    expect(handle.current!.exportMessage).toMatch(/aim006-traditional-comparison/i);
  });
});
