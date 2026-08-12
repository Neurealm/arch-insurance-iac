/**
 * AIM-006.1 — page-level integration for the Predictive Optical Link
 * Intelligence page. Full-page renders are expensive, so this file covers only
 * the wiring that cannot be verified from a component render.
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PredictiveOpticalLinkIntelligence from "../PredictiveOpticalLinkIntelligence";
import "./helpers/aim006Harness";

vi.mock("maplibre-gl", () => ({ default: { Map: class {}, NavigationControl: class {} } }));

function renderPage() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <PredictiveOpticalLinkIntelligence />
    </MemoryRouter>,
  );
  const scenarioRegion = screen.getByRole("region", { name: /chennai predictive protection scenario/i });
  return { user, scenarioRegion, scenario: within(scenarioRegion) };
}

describe("AIM-006.1 — page integration", () => {
  it("mounts the scenario workspace, comparison panel and header controls", () => {
    const { scenario } = renderPage();
    expect(scenario.getByTestId("scenario-workspace")).toBeInTheDocument();
    expect(screen.getByTestId("traditional-comparison")).toBeInTheDocument();
    expect(screen.getByTitle("Explain Model")).toBeInTheDocument();
    expect(screen.getByTitle(/run chennai predictive protection scenario/i)).toBeInTheDocument();
    // AIM-001 to AIM-005 smoke checks.
    expect(screen.getByTestId("pli-header")).toBeInTheDocument();
    expect(screen.getByTestId("scenario-outcome")).toBeInTheDocument();
  });

  it("opens the real Explain Model drawer from the header and exports the model report", async () => {
    const { user } = renderPage();
    await user.click(screen.getByTitle("Explain Model"));
    const drawer = within(screen.getByRole("dialog", { name: /explain current prediction/i }));
    expect(drawer.getByRole("tab", { name: "Model Overview" })).toHaveAttribute("aria-selected", "true");
    await user.click(drawer.getByRole("button", { name: /close explain current prediction/i }));

    await user.click(screen.getByTitle("Export Model Report"));
    expect(screen.getAllByText(/aim006-explain-model-report\.csv/i).length).toBeGreaterThan(0);
  });

  it("starts the scenario from the header control and progresses the workspace", async () => {
    const { user, scenario } = renderPage();
    await user.click(screen.getByTitle(/run chennai predictive protection scenario/i));
    expect(scenario.getByRole("button", { name: /^pause$/i })).toBeEnabled();
    await user.click(scenario.getByRole("button", { name: /^pause$/i }));
    await user.click(scenario.getByRole("button", { name: /^next stage$/i }));
    expect(within(screen.getByRole("region", { name: /current scenario stage/i })).getByRole("heading"))
      .toHaveTextContent(/Weather Forecast Update|Optical Trend/);
  });

  it("synchronizes Request More Evidence with the Explain Model evidence tab", async () => {
    const { user, scenario } = renderPage();
    await user.click(scenario.getByRole("button", { name: /request more evidence/i }));
    const drawer = within(screen.getByRole("dialog", { name: /explain current prediction/i }));
    expect(drawer.getByRole("tab", { name: "Evidence" })).toHaveAttribute("aria-selected", "true");
    expect(drawer.getByRole("region", { name: /evidence workspace/i })).toBeInTheDocument();
  });
});
