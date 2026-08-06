/**
 * AIM-006 — integration tests for the Predictive Optical Link Intelligence
 * explainability, evidence, comparison and Chennai scenario experiences.
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PredictiveOpticalLinkIntelligence from "../PredictiveOpticalLinkIntelligence";

vi.mock("maplibre-gl", () => ({ default: { Map: class {}, NavigationControl: class {} } }));

const renderPage = () =>
  render(
    <MemoryRouter>
      <PredictiveOpticalLinkIntelligence />
    </MemoryRouter>,
  );

const openExplain = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTitle("Explain Model"));
  return screen.getByRole("dialog", { name: /explain model/i });
};

describe("AIM-006 — Explain Model drawer", () => {
  it("opens from the header control", async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openExplain(user);
    expect(dialog).toBeInTheDocument();
  });

  it("exposes all explainability tabs", async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openExplain(user);
    const tabs = within(dialog).getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(8);
  });

  it("switches tab content on selection", async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openExplain(user);
    await user.click(within(dialog).getByRole("tab", { name: /evidence/i }));
    expect(within(dialog).getByRole("tab", { name: /evidence/i })).toHaveAttribute("aria-selected", "true");
  });

  it("closes and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openExplain(user);
    await user.click(within(dialog).getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog", { name: /explain model/i })).not.toBeInTheDocument();
    expect(screen.getByTitle("Explain Model")).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderPage();
    await openExplain(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /explain model/i })).not.toBeInTheDocument();
  });
});

describe("AIM-006 — evidence workspace", () => {
  it("renders the evidence index inside the drawer", async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openExplain(user);
    await user.click(within(dialog).getByRole("tab", { name: /evidence/i }));
    expect(within(dialog).getByRole("region", { name: /evidence/i })).toBeInTheDocument();
  });

  it("filters evidence by stance", async () => {
    const user = userEvent.setup();
    renderPage();
    const dialog = await openExplain(user);
    await user.click(within(dialog).getByRole("tab", { name: /evidence/i }));
    const region = within(dialog).getByRole("region", { name: /evidence/i });
    const before = within(region).getAllByRole("listitem").length;
    await user.selectOptions(within(region).getByLabelText(/stance/i), "contradicts");
    expect(within(region).getAllByRole("listitem").length).toBeLessThan(before);
  });
});

describe("AIM-006 — traditional comparison", () => {
  it("renders the comparison panel with both operating models", () => {
    renderPage();
    const panel = screen.getByRole("region", { name: /why traditional monitoring does not solve this/i });
    expect(within(panel).getByText(/traditional monitoring/i)).toBeInTheDocument();
    expect(within(panel).getByText(/agentic predictive/i)).toBeInTheDocument();
  });
});

describe("AIM-006 — Chennai predictive protection scenario", () => {
  it("renders the scenario workspace", () => {
    renderPage();
    expect(screen.getByRole("region", { name: /chennai predictive protection scenario/i })).toBeInTheDocument();
  });

  it("advances through stages with the next control", async () => {
    const user = userEvent.setup();
    renderPage();
    const section = screen.getByRole("region", { name: /chennai predictive protection scenario/i });
    await user.click(within(section).getByRole("button", { name: /next stage/i }));
    expect(within(section).getByTestId("scenario-stage-index")).toHaveTextContent("2");
  });

  it("resets back to the first stage", async () => {
    const user = userEvent.setup();
    renderPage();
    const section = screen.getByRole("region", { name: /chennai predictive protection scenario/i });
    await user.click(within(section).getByRole("button", { name: /next stage/i }));
    await user.click(within(section).getByRole("button", { name: /reset/i }));
    expect(within(section).getByTestId("scenario-stage-index")).toHaveTextContent("1");
  });

  it("blocks execution until the action is approved", async () => {
    const user = userEvent.setup();
    renderPage();
    const section = screen.getByRole("region", { name: /chennai predictive protection scenario/i });
    await user.click(within(section).getByRole("button", { name: /jump to approval/i }));
    expect(within(section).getByTestId("scenario-approval-state")).toHaveTextContent(/pending/i);
    await user.click(within(section).getByRole("button", { name: /^approve/i }));
    expect(within(section).getByTestId("scenario-approval-state")).toHaveTextContent(/approved/i);
  });

  it("applies a failure simulation and degrades confidence", async () => {
    const user = userEvent.setup();
    renderPage();
    const section = screen.getByRole("region", { name: /chennai predictive protection scenario/i });
    const before = within(section).getByTestId("scenario-confidence").textContent;
    await user.selectOptions(within(section).getByLabelText(/failure simulation/i), "stale-weather");
    expect(within(section).getByTestId("scenario-confidence").textContent).not.toBe(before);
  });

  it("restores the successful path when the simulation is cleared", async () => {
    const user = userEvent.setup();
    renderPage();
    const section = screen.getByRole("region", { name: /chennai predictive protection scenario/i });
    const select = within(section).getByLabelText(/failure simulation/i);
    const before = within(section).getByTestId("scenario-confidence").textContent;
    await user.selectOptions(select, "missing-telemetry");
    await user.selectOptions(select, "none");
    expect(within(section).getByTestId("scenario-confidence").textContent).toBe(before);
  });
});
