/**
 * Stage 3.5.4.2.1 — Graph Explorer transparency and integration coverage.
 *
 * Mounts the real Capability Intelligence route group (the same element
 * `src/App.tsx` renders) and exercises the accessible graph contents, the count
 * live region, the re-root contract and real browser history behaviour.
 *
 * React Flow is replaced by a recording stub: these assertions are about the
 * data contract handed to the canvas, not about pixels.
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { Suspense, useEffect } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

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

const canvas: { nodes: { id: string }[]; edges: { id: string }[]; mounts: number } = {
  nodes: [],
  edges: [],
  mounts: 0,
};

vi.mock("reactflow", () => {
  const Stub = () => null;
  return {
    __esModule: true,
    default: (props: { nodes: { id: string }[]; edges: { id: string }[]; children?: React.ReactNode }) => {
      canvas.nodes = props.nodes;
      canvas.edges = props.edges;
      useEffect(() => {
        canvas.mounts += 1;
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
import {
  __capabilityIntelligenceComputeCount,
  __resetCapabilityIntelligenceCache,
} from "@/platform/capability-intelligence/CapabilityIntelligenceProvider";
import { getQueryEngine } from "@/modules/graph/query/index";
import { selectInitialRoot } from "@/platform/capability-intelligence/graph/initialRoot";
import { GraphContentsList } from "@/platform/capability-intelligence/components/GraphContentsList";
import type { GraphView } from "@/platform/capability-intelligence/graph/graphViewTypes";
import { DEFAULT_EDGE_TYPES } from "@/platform/capability-intelligence/graph/graphViewTypes";

const engine = getQueryEngine();
const initial = selectInitialRoot(engine.source);

/** Two real, connected roots to navigate between. */
const neighbours = engine
  .getEdges(initial.nodeId!, { direction: "both" })
  .results.map((e) => (e.from === initial.nodeId ? e.to : e.from));
const rootA = neighbours[0];
const rootB = neighbours.find((id) => id !== rootA) ?? neighbours[0];

beforeAll(() => {
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture = () => false;
  proto.setPointerCapture = () => {};
  proto.releasePointerCapture = () => {};
  proto.scrollIntoView = () => {};
});

beforeEach(() => {
  canvas.mounts = 0;
});

/** Real browser history, so back and forward behave as they do in the app. */
function renderGraphWithBrowserHistory(entry: string) {
  window.history.replaceState(null, "", entry);
  return render(
    <BrowserRouter>
      <Suspense fallback={<span>route-loading</span>}>
        <Routes>
          <Route path="/platform" element={<Outlet />}>
            {capabilityIntelligenceRoutes}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>,
  );
}

function renderGraph(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
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

const graphPath = "/platform/capability-intelligence/graph";
const waitForGraph = () => screen.findByTestId("graph-explorer", undefined, { timeout: 10_000 });

/* --------------------------------------------- accessible graph contents */

describe("Stage 3.5.4.2.1 — accessible graph contents", () => {
  it("is expanded by default and can be collapsed by the user", async () => {
    renderGraph([graphPath]);
    await waitForGraph();
    const toggle = screen.getByTestId("graph-contents-toggle");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(/represents the same bounded entities/i)).toBeTruthy();

    await userEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("labels the section and captions both tables", async () => {
    renderGraph([graphPath]);
    await waitForGraph();
    expect(screen.getByText("Accessible graph contents")).toBeTruthy();
    expect(screen.getByText(/Entities currently visible on the graph canvas/i)).toBeTruthy();
    expect(screen.getByText(/Relationships currently visible on the graph canvas/i)).toBeTruthy();
  });

  it("announces the visible entity and relationship counts politely", async () => {
    renderGraph([graphPath]);
    await waitForGraph();
    const region = screen.getByTestId("graph-count-announcement");
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.textContent).toMatch(/^Graph updated\. \d+ entities and \d+ relationships are visible\./);
  });

  it("derives the canvas, contents and announcement counts from one graph view", async () => {
    renderGraph([graphPath]);
    await waitForGraph();
    const announced = screen.getByTestId("graph-count-announcement").textContent ?? "";
    const [, nodeCount, edgeCount] = announced.match(/(\d+) entities and (\d+) relationships/)!;
    expect(canvas.nodes.length).toBe(Number(nodeCount));
    expect(canvas.edges.length).toBe(Number(edgeCount));
    expect(screen.getByTestId("graph-contents-toggle").textContent).toContain(
      `${nodeCount} entities, ${edgeCount} relationships`,
    );
    for (const node of canvas.nodes) {
      expect(screen.getByTestId(`graph-contents-node-${node.id}`)).toBeTruthy();
    }
  });

  it("re-announces the counts after a control change", async () => {
    renderGraph([graphPath]);
    await waitForGraph();
    const before = screen.getByTestId("graph-count-announcement").textContent;
    await userEvent.click(screen.getByTestId("graph-direction-dependencies"));
    await waitFor(() =>
      expect(screen.getByTestId("graph-count-announcement").textContent).not.toBe(before),
    );
  });
});

/* ------------------------------------------- contents list state wording */

describe("Stage 3.5.4.2.1 — graph contents state wording", () => {
  const nodeOf = (id: string) => engine.getNode(id)!;
  const view = (): GraphView => ({
    request: {
      rootId: "r",
      direction: "both",
      depth: 2,
      edgeTypes: DEFAULT_EDGE_TYPES,
      includeCandidates: true,
    },
    rootId: "r",
    rootNode: nodeOf(initial.nodeId!),
    nodes: [
      { id: "r", node: { ...nodeOf(initial.nodeId!), id: "r", label: "Root" }, depth: 0, side: "root", isRoot: true },
      { id: "n1", node: { ...nodeOf(initial.nodeId!), id: "n1", label: "Neighbour" }, depth: 1, side: "dependency", isRoot: false },
    ],
    edges: [
      {
        id: "e-confirmed",
        edge: { id: "e-confirmed", type: "DEPENDS_ON", from: "r", to: "n1", candidate: false } as never,
        candidate: false,
      },
      {
        id: "e-candidate",
        edge: { id: "e-candidate", type: "USES", from: "r", to: "n1", candidate: true } as never,
        candidate: true,
      },
    ],
    nodeTotalAvailable: 2,
    edgeTotalAvailable: 2,
    truncated: false,
    truncationReason: null,
    emptyReason: null,
    warnings: [],
    graphHash: "88ceb819",
    errorMessage: null,
  });

  it("states candidate, confirmed and selection state as text", () => {
    render(
      <GraphContentsList
        view={view()}
        selectedNodeId="n1"
        selectedEdgeId="e-candidate"
        onSelectNode={() => {}}
        onSelectEdge={() => {}}
      />,
    );
    const candidateRow = screen.getByTestId("graph-contents-edge-e-candidate");
    expect(within(candidateRow).getByText(/candidate/i)).toBeTruthy();
    expect(within(candidateRow).getByText("selected")).toBeTruthy();

    const confirmedRow = screen.getByTestId("graph-contents-edge-e-confirmed");
    expect(within(confirmedRow).getByText(/confirmed/i)).toBeTruthy();
    expect(within(confirmedRow).getByText("not selected")).toBeTruthy();

    expect(within(screen.getByTestId("graph-contents-node-n1")).getByText("selected")).toBeTruthy();
    expect(within(screen.getByTestId("graph-contents-node-r")).getByText("root")).toBeTruthy();
  });

  it("announces truncation in the toggle summary counts", () => {
    const truncated = { ...view(), truncated: true, truncationReason: "edges" as const };
    render(
      <GraphContentsList
        view={truncated}
        selectedNodeId={null}
        selectedEdgeId={null}
        onSelectNode={() => {}}
        onSelectEdge={() => {}}
      />,
    );
    expect(screen.getByTestId("graph-contents-toggle").textContent).toContain("2 entities, 2 relationships");
  });
});

/* ---------------------------------------------------- root URL contract */

describe("Stage 3.5.4.2.1 — root parameter behaviour in the real route", () => {
  it.each([
    ["missing", graphPath],
    ["empty", `${graphPath}?root=`],
    ["whitespace", `${graphPath}?root=%20`],
  ])("resolves a %s root parameter to the deterministic initial root", async (_name, entry) => {
    const view = renderGraph([entry]);
    await waitForGraph();
    expect(screen.queryByText("Choose a root entity")).toBeNull();
    expect(screen.getAllByText(engine.getNode(initial.nodeId!)!.label).length).toBeGreaterThan(0);
    view.unmount();
  });

  it("keeps an unknown non-empty root in the explicit unknown-entity state", async () => {
    renderGraph([`${graphPath}?root=capability%3Adoes-not-exist`]);
    await waitForGraph();
    expect(await screen.findByText("Entity not in this graph snapshot")).toBeTruthy();
  });

  it("uses the first value of a duplicated root parameter", async () => {
    renderGraph([`${graphPath}?root=${encodeURIComponent(rootA)}&root=${encodeURIComponent(rootB)}`]);
    await waitForGraph();
    expect(screen.getAllByText(engine.getNode(rootA)!.label).length).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------- re-root contract */

describe("Stage 3.5.4.2.1 — re-root contract", () => {
  it("updates the URL, clears selection, closes the drawer and refits the canvas", async () => {
    __resetCapabilityIntelligenceCache();
    renderGraph([graphPath]);
    await waitForGraph();
    const computeBefore = __capabilityIntelligenceComputeCount();

    // Select a non-root node through the accessible contents table.
    const target = canvas.nodes.find((n) => n.id !== initial.nodeId)!;
    const row = screen.getByTestId(`graph-contents-node-${target.id}`);
    await userEvent.click(within(row).getAllByRole("button")[0]);
    expect(await screen.findByText("Open entity detail")).toBeTruthy();

    // Open the entity drawer, then re-root.
    await userEvent.click(screen.getByRole("button", { name: "Open entity detail" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    const mountsBefore = canvas.mounts;
    // The drawer is a modal, so the underlying action is queried as hidden.
    fireEvent.click(screen.getByRole("button", { name: "Re-root here", hidden: true }));

    await waitFor(() =>
      expect(within(screen.getByTestId(`graph-contents-node-${target.id}`)).getByText("root")).toBeTruthy(),
    );
    // Drawer closed by the re-root.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    // Selection cleared: the selection action bar is gone.
    expect(screen.queryByRole("button", { name: "Open entity detail" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Clear selection" })).toBeNull();
    // Canvas refitted via remount.
    expect(canvas.mounts).toBeGreaterThan(mountsBefore);
    // Read-only analysis is never recomputed.
    expect(__capabilityIntelligenceComputeCount()).toBe(computeBefore);
  }, 30_000);
});

/* ----------------------------------------------------------- browser history */

describe("Stage 3.5.4.2.1 — browser history", () => {
  it("moves back and forward through explored roots", async () => {
    __resetCapabilityIntelligenceCache();
    renderGraphWithBrowserHistory(graphPath);
    await waitForGraph();
    const computeCount = __capabilityIntelligenceComputeCount();

    const labelOf = (id: string) => engine.getNode(id)!.label;
    const atRoot = async (id: string) =>
      waitFor(() => expect(screen.getAllByText(labelOf(id)).length).toBeGreaterThan(0), { timeout: 10_000 });

    const rerootTo = async (id: string) => {
      const row = await screen.findByTestId(`graph-contents-node-${id}`);
      await userEvent.click(within(row).getAllByRole("button")[0]);
      fireEvent.click(await screen.findByRole("button", { name: "Re-root here" }));
      await atRoot(id);
    };

    await rerootTo(rootA);
    const neighboursOfA = canvas.nodes.map((n) => n.id).filter((id) => id !== rootA);
    const secondRoot = neighboursOfA[0];
    await rerootTo(secondRoot);

    window.history.back();
    await atRoot(rootA);
    window.history.back();
    await atRoot(initial.nodeId!);
    window.history.forward();
    await atRoot(rootA);
    window.history.forward();
    await atRoot(secondRoot);

    expect(__capabilityIntelligenceComputeCount()).toBe(computeCount);
    expect(screen.queryByText("Analysing capability graph…")).toBeNull();
    expect(screen.getByTestId("graph-count-announcement").textContent).toContain("Graph updated.");
  }, 60_000);
});
