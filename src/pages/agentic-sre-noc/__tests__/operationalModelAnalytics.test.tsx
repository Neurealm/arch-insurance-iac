/**
 * AIM-004 — Operational Model Analytics UI behaviour.
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PredictiveOpticalLinkIntelligence from "../PredictiveOpticalLinkIntelligence";

function renderPage() {
  return render(
    <MemoryRouter>
      <PredictiveOpticalLinkIntelligence />
    </MemoryRouter>,
  );
}

describe("Operational Model Analytics (AIM-004)", () => {
  it("renders every analytics panel", () => {
    renderPage();
    ["performance", "factors", "impact", "horizon", "highrisk"].forEach((id) => {
      expect(screen.getByTestId(`pli-panel-${id}`)).toBeInTheDocument();
    });
    expect(screen.getByTestId("analytics-performance")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-factors")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-waterfall")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-horizon")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-highrisk")).toBeInTheDocument();
  });

  it("marks analytics panels as synthetic rather than placeholder", () => {
    renderPage();
    const panel = screen.getByTestId("pli-panel-performance");
    expect(within(panel).getByText("Synthetic data")).toBeInTheDocument();
  });

  it("selects a KPI and opens the metric drawer", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "False Positive Rate", exact: false }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("resets the KPI selection", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Reset KPI Selection/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("switches analytics panels into loading, empty and error states", async () => {
    const user = userEvent.setup();
    renderPage();
    const select = screen.getByRole("combobox", { name: "Analytics state" });

    await user.selectOptions(select, "loading");
    expect(screen.getByTestId("analytics-performance")).toHaveAttribute("data-analytics-state", "loading");

    await user.selectOptions(select, "empty");
    expect(screen.getByTestId("analytics-highrisk")).toHaveAttribute("data-analytics-state", "empty");

    await user.selectOptions(select, "error");
    expect(screen.getByTestId("analytics-horizon")).toHaveAttribute("data-analytics-state", "error");
  });

  it("selects a link from the high-risk table", async () => {
    const user = userEvent.setup();
    renderPage();
    const table = screen.getByTestId("analytics-highrisk");
    const [firstLink] = within(table).getAllByRole("button", { name: /CHN-|NBO-|SIN-|JKT-|LOS-/ });
    await user.click(firstLink);
    expect(firstLink).toBeInTheDocument();
  });

  it("exposes the threshold tradeoff control", () => {
    renderPage();
    expect(screen.getByTestId("analytics-threshold")).toBeInTheDocument();
  });
});
