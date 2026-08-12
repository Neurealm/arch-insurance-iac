/**
 * AIM-006.1 — Explain Current Prediction drawer tests.
 */

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExplainModelDrawer } from "../scenario/ExplainModelDrawer";
import { renderWithScenarioState } from "./helpers/aim006Harness";

function renderDrawer() {
  const utils = renderWithScenarioState((state) => (
    <>
      <button type="button" data-explain-trigger="true" onClick={() => state.setExplainOpen(true)}>
        Explain Model
      </button>
      <ExplainModelDrawer state={state} />
    </>
  ));
  return utils;
}

const openDrawer = async (user: ReturnType<typeof renderDrawer>["user"]) => {
  await user.click(screen.getByRole("button", { name: "Explain Model" }));
  return within(screen.getByRole("dialog", { name: /explain current prediction/i }));
};

describe("AIM-006.1 — Explain Model drawer", () => {
  it("opens from the trigger and defaults to Model Overview", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    expect(drawer.getByRole("tab", { name: "Model Overview" })).toHaveAttribute("aria-selected", "true");
  });

  it("renders all eight explainability tabs with tab semantics", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    expect(drawer.getAllByRole("tab")).toHaveLength(8);
    expect(drawer.getByRole("tablist", { name: /explain current prediction sections/i })).toBeInTheDocument();
    expect(drawer.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("shows the selected link on the Current Prediction tab", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    await user.click(drawer.getByRole("tab", { name: "Current Prediction" }));
    const panel = within(drawer.getByRole("tabpanel"));
    expect(panel.getByText("CHN-MBL-041")).toBeInTheDocument();
    expect(panel.getByText("0.94")).toBeInTheDocument();
    expect(panel.getByText("94%")).toBeInTheDocument();
    expect(panel.getByText("10 Gbps")).toBeInTheDocument();
  });

  it("renders the evidence workspace on the Evidence tab", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    await user.click(drawer.getByRole("tab", { name: "Evidence" }));
    expect(drawer.getByRole("region", { name: /evidence workspace/i })).toBeInTheDocument();
  });

  it("filters evidence by stance", async () => {
    const { user, handle } = renderDrawer();
    const drawer = await openDrawer(user);
    await user.click(drawer.getByRole("tab", { name: "Evidence" }));
    const before = handle.current!.filteredEvidence.length;
    await user.selectOptions(drawer.getByLabelText(/filter evidence by stance/i), "contradicts");
    expect(handle.current!.filteredEvidence.length).toBeLessThan(before);
  });

  it("renders similar events for comparison", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    await user.click(drawer.getByRole("tab", { name: "Similar Events" }));
    expect(drawer.getByRole("region", { name: /similar events/i })).toBeInTheDocument();
  });

  it("renders governance state reflecting the current approval", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    await user.click(drawer.getByRole("tab", { name: "Governance" }));
    const panel = within(drawer.getByRole("tabpanel"));
    expect(panel.getByText(/why this action requires approval/i)).toBeInTheDocument();
    expect(panel.getByText("not-required")).toBeInTheDocument();
  });

  it("renders model limitations", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    await user.click(drawer.getByRole("tab", { name: "Limitations" }));
    expect(within(drawer.getByRole("tabpanel")).getAllByRole("listitem").length).toBeGreaterThan(0);
  });

  it("selects a feature contribution and shows its detail", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    await user.click(drawer.getByRole("tab", { name: "Feature Contributions" }));
    const rows = within(drawer.getByRole("tabpanel")).getAllByRole("button");
    await user.click(rows[0]);
    expect(screen.getByTestId("explain-factor-detail")).toBeInTheDocument();
  });

  it("exports the explain report locally", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    await user.click(drawer.getByRole("button", { name: /export explain model report/i }));
    expect(drawer.getByText(/aim006-explain-model-report\.csv/i)).toBeInTheDocument();
  });

  it("moves focus to Close on open and returns focus to the trigger on close", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    const close = drawer.getByRole("button", { name: /close explain current prediction/i });
    expect(close).toHaveFocus();
    await user.click(close);
    expect(screen.queryByRole("dialog", { name: /explain current prediction/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Explain Model" })).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const { user } = renderDrawer();
    await openDrawer(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /explain current prediction/i })).not.toBeInTheDocument();
  });

  it("keeps inactive tabs out of the tab sequence", async () => {
    const { user } = renderDrawer();
    const drawer = await openDrawer(user);
    expect(drawer.getByRole("tab", { name: "Evidence" })).toHaveAttribute("tabindex", "-1");
    expect(drawer.getByRole("tab", { name: "Model Overview" })).toHaveAttribute("tabindex", "0");
  });
});
