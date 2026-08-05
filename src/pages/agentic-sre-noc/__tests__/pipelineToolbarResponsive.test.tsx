/**
 * AIM-005.2 — Predictive Engineering Pipeline toolbar responsive and
 * accessibility regression tests.
 *
 * The 390 pixel page-level overflow measured in AIM-005.1 came from layout
 * chrome that could not shrink. These tests lock in the corrected rules:
 * the toolbar wraps, its controls shrink, and every control keeps an
 * accessible name at every breakpoint.
 */

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { PredictivePipeline } from "../pipeline/PredictivePipeline";
import NocLayout from "../NocLayout";

function renderPipeline() {
  return render(
    <MemoryRouter>
      <PredictivePipeline />
    </MemoryRouter>,
  );
}

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
}

describe("Pipeline toolbar responsive behaviour (AIM-005.2)", () => {
  it.each([1440, 768, 390, 375, 320])("renders the toolbar at %ipx", (width) => {
    setViewport(width);
    renderPipeline();
    expect(screen.getByTestId("pipeline-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("pipeline-reset")).toBeInTheDocument();
    expect(screen.getByTestId("pipeline-fullscreen")).toBeInTheDocument();
    expect(screen.getByTestId("pipeline-state-select")).toBeInTheDocument();
  });

  it("allows the toolbar and its row to wrap and shrink instead of forcing page width", () => {
    renderPipeline();
    const toolbar = screen.getByTestId("pipeline-toolbar");
    expect(toolbar.className).toContain("flex-wrap");
    expect(toolbar.className).toContain("min-w-0");
    expect(toolbar.className).toContain("max-w-full");

    const row = toolbar.parentElement as HTMLElement;
    expect(row.className).toContain("flex-wrap");
    expect(row.className).toContain("min-w-0");
    expect(row.className).toContain("max-w-full");
  });

  it("keeps no fixed width wider than the smallest supported viewport", () => {
    renderPipeline();
    const toolbar = screen.getByTestId("pipeline-toolbar");
    /* No inline or arbitrary pixel width may pin the toolbar open. */
    expect(toolbar.getAttribute("style")).toBeNull();
    expect(toolbar.className).not.toMatch(/w-\[\d{3,}px\]/);
    expect(toolbar.className).not.toMatch(/-m[xlr]?-/);
  });

  it("keeps accessible names on controls whose visible labels collapse on mobile", () => {
    renderPipeline();
    expect(screen.getByRole("button", { name: "Reset pipeline" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Full-screen pipeline" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Pipeline stage data state" })).toBeInTheDocument();
  });

  it("does not duplicate controls through hidden responsive variants", () => {
    renderPipeline();
    expect(screen.getAllByRole("button", { name: "Reset pipeline" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Full-screen pipeline" })).toHaveLength(1);
    expect(screen.getAllByTestId("pipeline-reset")).toHaveLength(1);
    expect(screen.getAllByTestId("pipeline-fullscreen")).toHaveLength(1);
  });

  it("keeps mobile touch targets at least 44 pixels and restores dense desktop sizing", () => {
    renderPipeline();
    [screen.getByTestId("pipeline-reset"), screen.getByTestId("pipeline-fullscreen")].forEach((btn) => {
      expect(btn.className).toContain("min-h-11");
      expect(btn.className).toContain("min-w-11");
      expect(btn.className).toContain("sm:min-h-0");
      expect(btn.className).toContain("sm:min-w-0");
    });
  });

  it("keeps the existing toolbar actions working", async () => {
    const user = userEvent.setup();
    renderPipeline();

    const fullscreen = screen.getByTestId("pipeline-fullscreen");
    expect(fullscreen).toHaveAttribute("aria-pressed", "false");
    await user.click(fullscreen);
    expect(screen.getByTestId("pipeline-fullscreen")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Exit full-screen pipeline" })).toBeInTheDocument();
    await user.click(screen.getByTestId("pipeline-fullscreen"));
    expect(screen.getByTestId("pipeline-fullscreen")).toHaveAttribute("aria-pressed", "false");

    fireEvent.change(screen.getByTestId("pipeline-state-select"), { target: { value: "loading" } });
    expect(screen.getByTestId("pipeline-state-select")).toHaveValue("loading");

    fireEvent.click(screen.getByTestId("pipeline-reset"));
    expect(screen.getByTestId("pipeline-state-select")).toHaveValue("ready");
  });

  it("keeps toolbar controls in a logical, focusable order", async () => {
    const user = userEvent.setup();
    renderPipeline();
    const toolbar = screen.getByTestId("pipeline-toolbar");
    screen.getByTestId("pipeline-state-select").focus();
    await user.tab();
    expect(screen.getByTestId("pipeline-reset")).toHaveFocus();
    await user.tab();
    expect(screen.getByTestId("pipeline-fullscreen")).toHaveFocus();
    within(toolbar)
      .getAllByRole("button")
      .forEach((btn) => expect(btn.className).toContain("focus-visible:ring-2"));
  });
});

describe("Module breadcrumb chrome (AIM-005.2)", () => {
  it("wraps and truncates rather than pinning a minimum page width", () => {
    render(
      <MemoryRouter initialEntries={["/agentic-sre-noc/global-link-health-twin/predictive-optical-link-intelligence"]}>
        <NocLayout />
      </MemoryRouter>,
    );
    const crumb = screen.getByRole("link", { name: "Agentic SRE NOC" });
    const bar = crumb.parentElement as HTMLElement;
    expect(bar.className).toContain("flex-wrap");
    expect(bar.className).toContain("min-w-0");
    const nav = screen.getByLabelText("Agentic SRE NOC navigation");
    expect(nav.className).toContain("max-w-[45vw]");
    expect(nav.className).toContain("sm:max-w-none");
  });
});
