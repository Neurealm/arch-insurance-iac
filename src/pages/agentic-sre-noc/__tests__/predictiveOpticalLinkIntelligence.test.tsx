/**
 * AIM-001 — Predictive Optical Link Intelligence page framework tests.
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PredictiveOpticalLinkIntelligence from "../PredictiveOpticalLinkIntelligence";
import { kpiMetrics, panelSpecs } from "../data/pliFixtures";
import { nocPages } from "../pages";

function renderPage() {
  return render(
    <MemoryRouter>
      <PredictiveOpticalLinkIntelligence />
    </MemoryRouter>,
  );
}

describe("Predictive Optical Link Intelligence (AIM-001)", () => {
  it("renders the page identity", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Predictive Optical Link Intelligence" })).toBeInTheDocument();
    expect(screen.getByText(/Predict optical-link degradation before customer impact/i)).toBeInTheDocument();
    expect(screen.getByText("Active Model")).toBeInTheDocument();
    expect(screen.getAllByText(/v2\.4\.1/).length).toBeGreaterThan(0);
  });

  it("renders the breadcrumb trail", () => {
    renderPage();
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByText("Agentic SRE NOC")).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Global Link Health Twin" })).toBeInTheDocument();
  });

  it("exposes all header controls", () => {
    renderPage();
    /* Scope to the page header: role queries across the whole page are both
       ambiguous (analytics panels expose their own filters) and very slow. */
    const header = within(screen.getByTestId("pli-header"));

    const comboboxNames = header
      .getAllByRole("combobox")
      .map((el) => el.getAttribute("aria-label") ?? el.getAttribute("name") ?? "");
    ["Scenario", "Time range", "Forecast horizon", "Region", "Product", "Panel state"].forEach((l) => {
      expect(comboboxNames).toContain(l);
    });

    const buttonLabels = header.getAllByRole("button").map((el) => el.textContent ?? "");
    ["Explain Model", "Run What-If", "Export Model Report", "Full screen", "Actions"].forEach((n) => {
      expect(buttonLabels.some((label) => new RegExp(n, "i").test(label))).toBe(true);
    });
  });


  it("renders seven KPI cards with the approved synthetic values", () => {
    renderPage();
    expect(kpiMetrics).toHaveLength(7);
    ["8,721", "32", "6", "5h 42m", "94.1%", "2.8%", "1,284"].forEach((v) => {
      expect(screen.getAllByText(v).length).toBeGreaterThan(0);
    });
  });

  it("renders every placeholder panel shell", () => {
    renderPage();
    panelSpecs.forEach((p) => {
      expect(screen.getByTestId(`pli-panel-${p.id}`)).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: p.title })).toBeInTheDocument();
    });
  });

  it("switches panels into loading, empty and error states", async () => {
    const user = userEvent.setup();
    renderPage();
    const select = screen.getByRole("combobox", { name: "Panel state" });

    await user.selectOptions(select, "loading");
    expect(screen.getByTestId("pli-panel-pipeline")).toHaveAttribute("data-panel-state", "loading");
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);

    await user.selectOptions(select, "empty");
    expect(screen.getAllByText(/No data for the current selection/).length).toBe(panelSpecs.length);

    await user.selectOptions(select, "error");
    // Panels report the error state; other live regions on the page may also be alerts.
    expect(document.querySelectorAll('[data-panel-state="error"]').length).toBe(panelSpecs.length);
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(panelSpecs.length);
  });

  it("uses a twelve-column grid without horizontal overflow", () => {
    renderPage();
    const page = screen.getByTestId("pli-page");
    expect(page.className).toContain("overflow-x-hidden");
    expect(page.className).toContain("bg-white");
    expect(page.querySelector(".xl\\:grid-cols-12")).not.toBeNull();
    expect(screen.getByTestId("pli-panel-pipeline").className).toContain("xl:col-span-12");
    expect(screen.getByTestId("pli-panel-chennai").className).not.toContain("xl:col-span-7");

  });

  it("keeps panel titles accessible and describes each panel", () => {
    renderPage();
    const panel = screen.getByTestId("pli-panel-horizon");
    expect(panel).toHaveAttribute("aria-labelledby", "pli-panel-horizon");
    expect(panel).toHaveAttribute("aria-describedby", "pli-panel-horizon-desc");
  });

  it("opens the Explain Current Prediction drawer from the header", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTitle("Explain Model"));
    expect(
      screen.getByRole("dialog", { name: /explain current prediction/i }),
    ).toBeInTheDocument();
  });

  it("registers the page in the module registry", () => {
    expect(
      nocPages.some((p) => p.slug === "global-link-health-twin/predictive-optical-link-intelligence"),
    ).toBe(true);
  });
});
