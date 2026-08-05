/**
 * AIM-005.1 — Model lifecycle workspace integration with the
 * Predictive Optical Link Intelligence page.
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PredictiveOpticalLinkIntelligence from "../PredictiveOpticalLinkIntelligence";
import { lifecycleTabs } from "../lifecycle/lifecycleFixtures";

function renderPage() {
  return render(
    <MemoryRouter>
      <PredictiveOpticalLinkIntelligence />
    </MemoryRouter>,
  );
}

function workspace() {
  return within(screen.getByTestId("model-lifecycle-workspace"));
}

async function openTab(user: ReturnType<typeof userEvent.setup>, name: string) {
  const tablist = within(screen.getByTestId("lifecycle-tablist"));
  await user.click(tablist.getByRole("tab", { name }));
}

describe("Lifecycle workspace integration (AIM-005.1)", () => {
  it("mounts the workspace in the page and removes the placeholder", () => {
    renderPage();
    expect(screen.getByTestId("model-lifecycle-workspace")).toBeInTheDocument();
    expect(screen.getAllByTestId("model-lifecycle-workspace")).toHaveLength(1);
    expect(screen.queryByText(/Reserved for .* visual/)).not.toBeInTheDocument();
  });

  it("defaults to the Training Data tab", () => {
    expect(lifecycleTabs[0]).toBe("Training Data");
    renderPage();
    expect(screen.getByTestId("lifecycle-tab-training")).toBeInTheDocument();
  });

  it("switches lifecycle tabs from the page", async () => {
    const user = userEvent.setup();
    renderPage();
    await openTab(user, "Validation");
    expect(screen.getByTestId("lifecycle-tab-validation")).toBeInTheDocument();
  });

  it("reflects the shared region and product in lifecycle scope", async () => {
    const user = userEvent.setup();
    renderPage();
    const header = within(screen.getByTestId("pli-header"));
    const region = header.getByRole("combobox", { name: "Region" });
    const nextRegion = within(region).getAllByRole("option")[1].textContent as string;
    await user.selectOptions(region, nextRegion);
    expect(workspace().getAllByText(new RegExp(`Region ${nextRegion}`)).length).toBeGreaterThan(0);
  });

  it("passes horizon, threshold and selected link into validation scope", async () => {
    const user = userEvent.setup();
    renderPage();
    await openTab(user, "Validation");
    const scope = screen.getByTestId("validation-scope");
    expect(scope.textContent).toMatch(/forecast horizon/i);
    expect(scope.textContent).toMatch(/confidence threshold \d+ percent/i);
  });

  it("shows the active model version in the header", () => {
    renderPage();
    expect(screen.getByTestId("pli-active-version").textContent).toBe("v2.4.1");
  });

  it("focuses the Drift tab from the bottom governance strip", async () => {
    const user = userEvent.setup();
    renderPage();
    const strip = within(screen.getByTestId("pli-panel-governance"));
    await user.click(strip.getByRole("button", { name: "Drift monitoring" }));
    expect(screen.getByTestId("lifecycle-tab-drift")).toBeInTheDocument();
  });

  it("opens and closes the provenance panel from training data", async () => {
    const user = userEvent.setup();
    renderPage();
    const triggers = workspace().getAllByRole("button", { name: /provenance/i });
    await user.click(triggers[0]);
    const drawer = screen.getByTestId("provenance-drawer");
    expect(drawer).toBeInTheDocument();
    await user.click(within(drawer).getByRole("button", { name: "Close" }));
    expect(screen.queryByTestId("provenance-drawer")).not.toBeInTheDocument();
  });

  it("keeps the page usable when the lifecycle workspace errors", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.selectOptions(workspace().getByRole("combobox", { name: "Lifecycle state" }), "error");
    expect(screen.getByTestId("pli-panel-pipeline")).toBeInTheDocument();
    expect(screen.getByTestId("pli-kpis")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Predictive Optical Link Intelligence" })).toBeInTheDocument();
  });

  it("keeps the page usable while lifecycle data is loading", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.selectOptions(workspace().getByRole("combobox", { name: "Lifecycle state" }), "loading");
    expect(screen.getByTestId("pli-panel-chennai")).toBeInTheDocument();
  });

  it("uses a horizontally scrollable tab strip only", () => {
    renderPage();
    expect(screen.getByTestId("lifecycle-tablist").className).toContain("overflow-x-auto");
    expect(screen.getByTestId("pli-page").className).toContain("overflow-x-hidden");
  });

  it("exposes lifecycle tabs with correct tab semantics", () => {
    renderPage();
    const tablist = within(screen.getByTestId("lifecycle-tablist"));
    lifecycleTabs.forEach((tab) => {
      expect(tablist.getByRole("tab", { name: tab })).toBeInTheDocument();
    });
  });
});
