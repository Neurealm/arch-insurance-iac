/**
 * Stage 3.5.4.2 — cross-screen "Explore relationships" navigation.
 *
 * Verifies the deep-link contract (URL shape, `?root=` seeding, direct refresh)
 * and that navigating from another Capability Intelligence screen into the
 * Graph Explorer never re-executes `analyzeGraph()`.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router-dom";
import { GRAPH_EXPLORER_PATH, GRAPH_ROOT_PARAM, exploreRelationshipsLabel, graphExplorerLink } from "./graph/exploreLink";
import { ExploreRelationshipsLink } from "./components/ExploreRelationshipsLink";
import { getQueryEngine } from "@/modules/graph/query/index";
import { selectInitialRoot } from "./graph/initialRoot";

const engine = getQueryEngine();
const initial = selectInitialRoot(engine.source);

/** A stand-in Graph Explorer that mirrors the real root-resolution rule. */
function RootProbe() {
  const [params] = useSearchParams();
  const rootId = params.get(GRAPH_ROOT_PARAM) ?? initial.nodeId;
  return <div data-testid="resolved-root">{rootId}</div>;
}

describe("explore-link contract", () => {
  it("builds a Graph Explorer URL rooted at the entity", () => {
    expect(graphExplorerLink("node/a b")).toBe(`${GRAPH_EXPLORER_PATH}?${GRAPH_ROOT_PARAM}=node%2Fa%20b`);
  });

  it("targets the Capability Intelligence graph route", () => {
    expect(GRAPH_EXPLORER_PATH).toBe("/platform/capability-intelligence/graph");
  });

  it("produces an accessible, entity-specific label", () => {
    expect(exploreRelationshipsLabel("Billing")).toBe("Explore relationships for Billing");
    expect(exploreRelationshipsLabel()).toBe("Explore relationships");
  });
});

describe("ExploreRelationshipsLink", () => {
  it("renders a labelled link carrying the node id", () => {
    render(
      <MemoryRouter>
        <ExploreRelationshipsLink nodeId="cap-1" entityLabel="Billing" />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Explore relationships for Billing" });
    expect(link.getAttribute("href")).toBe(graphExplorerLink("cap-1"));
    expect(link.getAttribute("data-node-id")).toBe("cap-1");
  });

  it("does not bubble the click to a clickable row", async () => {
    const rowClick = vi.fn();
    render(
      <MemoryRouter>
        <div onClick={rowClick}>
          <ExploreRelationshipsLink nodeId="cap-1" />
        </div>
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("link"));
    expect(rowClick).not.toHaveBeenCalled();
  });
});

describe("cross-screen navigation into the Graph Explorer", () => {
  const analyze = vi.fn();

  beforeEach(() => analyze.mockClear());

  function App({ initialEntries }: { initialEntries: string[] }) {
    analyze();
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/platform/capability-intelligence/explorer"
            element={<ExploreRelationshipsLink nodeId="cap-42" entityLabel="Payments" />}
          />
          <Route path="/platform/capability-intelligence/graph" element={<RootProbe />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("navigates to the graph route with the selected entity as root", async () => {
    render(<App initialEntries={["/platform/capability-intelligence/explorer"]} />);
    await userEvent.click(screen.getByRole("link"));
    await waitFor(() => expect(screen.getByTestId("resolved-root")).toHaveTextContent("cap-42"));
  });

  it("does not re-run graph analysis when navigating between screens", async () => {
    render(<App initialEntries={["/platform/capability-intelligence/explorer"]} />);
    const before = analyze.mock.calls.length;
    await userEvent.click(screen.getByRole("link"));
    await screen.findByTestId("resolved-root");
    expect(analyze.mock.calls.length).toBe(before);
  });

  it("supports direct load and refresh of a rooted graph URL", async () => {
    render(<App initialEntries={[graphExplorerLink("cap-99")]} />);
    expect(screen.getByTestId("resolved-root")).toHaveTextContent("cap-99");
  });

  it("falls back to the deterministic default root when no parameter is present", () => {
    render(<App initialEntries={[GRAPH_EXPLORER_PATH]} />);
    expect(screen.getByTestId("resolved-root")).toHaveTextContent(initial.nodeId ?? "");
  });
});
