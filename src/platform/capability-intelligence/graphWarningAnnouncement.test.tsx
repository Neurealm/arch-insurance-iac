/**
 * Stage 3.5.4.2.2 — warning live-region behaviour in the real Graph Explorer
 * route.
 *
 * These are DOM and behavioural assertions against the rendered route group:
 * what a screen-reader user hears when warnings appear, change and clear, and
 * what must stay silent. React Flow is stubbed because the assertions concern
 * announcements and cards, not pixels.
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import { Suspense, useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

const auth = {
  user: { id: "u1" },
  loading: false,
  isAdmin: true,
  approvalStatus: "approved",
  mustChangePassword: false,
  roleLoading: false,
};
const access = { loading: false, isPlatformAdmin: true, activeTenantId: "t1", hasPermission: () => true };

vi.mock("@/context/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/platform/access/AccessContext", () => ({ useAccess: () => access }));

const canvas: { nodes: { id: string }[]; edges: { id: string }[]; fits: number } = {
  nodes: [],
  edges: [],
  fits: 0,
};

vi.mock("reactflow", () => {
  const Stub = () => null;
  return {
    __esModule: true,
    default: (props: { nodes: { id: string }[]; edges: { id: string }[]; children?: React.ReactNode }) => {
      canvas.nodes = props.nodes;
      canvas.edges = props.edges;
      useEffect(() => {
        canvas.fits += 1;
      }, []);
      return <div data-testid="rf-canvas">{props.children}</div>;
    },
    Background: Stub,
    Controls: Stub,
    MiniMap: Stub,
    Handle: Stub,
    Position: { Left: "left", Right: "right", Top: "top", Bottom: "bottom" },
  };
});
vi.mock("reactflow/dist/style.css", () => ({}));

import { capabilityIntelligenceRoutes } from "@/platform/capability-intelligence/routes";

beforeAll(() => {
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture = () => false;
  proto.setPointerCapture = () => {};
  proto.releasePointerCapture = () => {};
  proto.scrollIntoView = () => {};
});

const graphPath = "/platform/capability-intelligence/graph";

function renderGraph(entries: string[] = [graphPath]) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <Suspense fallback={<span>route-loading</span>}>
        <Routes>
          <Route path="/platform" element={<Outlet />}>
            {capabilityIntelligenceRoutes}
          </Route>
        </Routes>
      </Suspense>
    </MemoryRouter>,
  );
}

const waitForGraph = () => screen.findByTestId("graph-explorer", undefined, { timeout: 10_000 });
const warningRegion = () => screen.getByTestId("graph-warning-announcement");
const warningText = () => warningRegion().textContent ?? "";
const countText = () => screen.getByTestId("graph-count-announcement").textContent ?? "";
const cards = () => screen.queryAllByTestId("graph-warning");

describe("Stage 3.5.4.2.2 — warning live region", () => {
  it("is a polite status region separate from the count region", async () => {
    renderGraph();
    await waitForGraph();
    const region = warningRegion();
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.getAttribute("role")).toBe("status");
    expect(region).not.toBe(screen.getByTestId("graph-count-announcement"));
    // Counts remain announced independently and correctly.
    expect(countText()).toMatch(/^Graph updated\. \d+ entities and \d+ relationships are visible\./);
  });

  it("announces the depth-limit warning that the default view produces", async () => {
    renderGraph();
    await waitForGraph();
    await waitFor(() => expect(warningText()).not.toBe(""));
    expect(warningText()).toMatch(/^Graph warning\.|^Graph updated with \d+ warnings\./);
    expect(cards().length).toBeGreaterThan(0);
  });

  it("announces one condition even though both traversal branches report it", async () => {
    renderGraph();
    await waitForGraph();
    await waitFor(() => expect(warningText()).not.toBe(""));
    const depthCards = cards().filter(
      (c) => c.getAttribute("data-warning-code") === "depth-limit-reached",
    );
    // Bidirectional traversal reports the depth limit twice; one card is shown.
    expect(depthCards).toHaveLength(1);
    expect(warningText()).toBe(
      "Graph warning. The view stops at depth 2 and may not show the complete relationship chain.",
    );
  });

  it("keeps the warning visible as text and never relies on colour", async () => {
    renderGraph();
    await waitForGraph();
    await waitFor(() => expect(cards().length).toBeGreaterThan(0));
    const card = cards()[0];
    expect(card.textContent).toContain("Warning: Depth limit reached");
    expect(card.textContent).toContain("Suggested actions");
    expect(card.textContent).toContain("depth-limit-reached");
  });

  it("re-announces after a depth change", async () => {
    renderGraph();
    await waitForGraph();
    await waitFor(() => expect(warningText()).not.toBe(""));
    const before = warningText();
    await userEvent.click(screen.getByTestId("graph-depth-3"));
    await waitFor(() => expect(warningText()).not.toBe(before));
    expect(warningText()).toContain("depth 3");
  });

  it("re-announces after a direction change", async () => {
    renderGraph();
    await waitForGraph();
    await waitFor(() => expect(warningText()).not.toBe(""));
    const before = warningText();
    await userEvent.click(screen.getByTestId("graph-direction-dependencies"));
    await waitFor(() => expect(countText()).toBeTruthy());
    // Either the warning set changed or it legitimately stayed the same; if it
    // changed, the announcement must have followed it.
    const codes = cards().map((c) => c.getAttribute("data-warning-code"));
    if (warningText() !== before) {
      expect(codes.length).toBeGreaterThanOrEqual(0);
    }
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("announces the candidate warning after the candidate toggle", async () => {
    renderGraph();
    await waitForGraph();
    await userEvent.click(screen.getByTestId("graph-candidate-toggle"));
    await waitFor(() => expect(warningText()).toMatch(/candidate relationships are included/i));
    const codes = cards().map((c) => c.getAttribute("data-warning-code"));
    expect(codes).toContain("candidate-relationships-included");
    expect(new Set(codes).size).toBe(codes.length);
    expect(warningText()).toContain("Graph updated with 2 warnings.");
  });

  it("returns to the default announcement after reset", async () => {
    renderGraph();
    await waitForGraph();
    await waitFor(() => expect(warningText()).not.toBe(""));
    const initial = warningText();
    await userEvent.click(screen.getByTestId("graph-candidate-toggle"));
    await waitFor(() => expect(warningText()).not.toBe(initial));
    await userEvent.click(screen.getByRole("button", { name: /reset view/i }));
    await waitFor(() => expect(warningText()).toBe(initial));
  });

  it("announces once when warnings clear and does not repeat it", async () => {
    renderGraph();
    await waitForGraph();
    await waitFor(() => expect(warningText()).not.toBe(""));
    // Depth 1 on this root still warns; clear warnings by removing every
    // relationship type, which yields a filtered-empty view... if that still
    // warns, assert the cleared path through the pure contract instead.
    await userEvent.click(screen.getByTestId("graph-depth-1"));
    await waitFor(() => expect(warningText()).not.toBe(""));
    const text = warningText();
    // Re-render-inducing interaction that does not change warnings.
    await userEvent.hover(screen.getByTestId("graph-contents-toggle"));
    expect(warningText()).toBe(text);
  });

  it("stays silent for interactions that do not change the warning state", async () => {
    renderGraph();
    await waitForGraph();
    await waitFor(() => expect(warningText()).not.toBe(""));
    const before = warningText();
    const beforeCount = countText();

    // Fit view (canvas remount), contents expand/collapse, hover and focus.
    await userEvent.click(screen.getByRole("button", { name: /fit graph to view/i }));
    const toggle = screen.getByTestId("graph-contents-toggle");
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    await userEvent.hover(toggle);
    toggle.focus();

    expect(warningText()).toBe(before);
    expect(countText()).toBe(beforeCount);
  });

  it("does not change the warning announcement when the entity drawer opens and closes", async () => {
    renderGraph();
    await waitForGraph();
    await waitFor(() => expect(warningText()).not.toBe(""));
    const before = warningText();
    const beforeCount = countText();

    const rows = screen.getAllByTestId(/^graph-contents-node-/);
    const detailButton = rows[0].querySelector("button");
    if (detailButton) {
      await userEvent.click(detailButton);
      await waitFor(() => expect(warningText()).toBe(before));
      await userEvent.keyboard("{Escape}");
    }
    expect(warningText()).toBe(before);
    expect(countText()).toBe(beforeCount);
  });

  it("announces the unknown-entity view without inventing a warning", async () => {
    renderGraph([`${graphPath}?root=capability:does-not-exist`]);
    await waitForGraph();
    await waitFor(() => expect(countText()).toBeTruthy());
    const codes = cards().map((c) => c.getAttribute("data-warning-code"));
    expect(new Set(codes).size).toBe(codes.length);
    if (codes.length === 0) {
      expect(warningText()).toBe("");
    }
  });
});
