/**
 * Stage 3.5.4.1.1 — application-layer coverage for Capability Intelligence.
 *
 * Behaviour and data-contract assertions against the real engines. No mocks of
 * graph data and no snapshots.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getQueryEngine } from "@/modules/graph/query/index";
import { getIntelligenceEngine } from "@/modules/graph/intelligence/index";
import { graphStatistics } from "@/modules/graph/statistics";
import {
  CapabilityIntelligenceProvider,
  computeCapabilityIntelligence,
  __capabilityIntelligenceComputeCount,
  __resetCapabilityIntelligenceCache,
} from "@/platform/capability-intelligence/CapabilityIntelligenceProvider";
import { CapabilityOverviewCards } from "@/platform/capability-intelligence/components/CapabilityOverviewCards";
import { CapabilityExplorerTable } from "@/platform/capability-intelligence/components/CapabilityExplorerTable";
import { EntityDrawer } from "@/platform/capability-intelligence/components/EntityDrawer";
import { RecommendationList } from "@/platform/capability-intelligence/components/RecommendationList";
import { buildOrphanIndex, formatRate, metricOf, confidenceLabel, statusLabel } from "@/platform/capability-intelligence/presentation";

// Radix Select relies on pointer-capture APIs jsdom does not implement.
beforeAll(() => {
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture = () => false;
  proto.setPointerCapture = () => {};
  proto.releasePointerCapture = () => {};
  proto.scrollIntoView = () => {};
});

const engine = getQueryEngine();
const intelligence = getIntelligenceEngine().analyzeGraph();
const statistics = graphStatistics();
const orphanIds = buildOrphanIndex(engine.source);

const renderOverview = () =>
  render(
    <CapabilityOverviewCards
      intelligence={intelligence}
      statistics={statistics}
      graph={intelligence.graph}
      analysisDurationMs={12}
      computedAt={new Date(0).toISOString()}
    />,
  );

describe("Capability Intelligence — provider lifecycle", () => {
  beforeAll(() => __resetCapabilityIntelligenceCache());

  it("computes the intelligence snapshot exactly once and reuses it", async () => {
    const first = computeCapabilityIntelligence();
    const countAfterFirst = __capabilityIntelligenceComputeCount();
    expect(countAfterFirst).toBe(1);

    render(
      <MemoryRouter>
        <CapabilityIntelligenceProvider>
          <div>child</div>
        </CapabilityIntelligenceProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText("child")).toBeTruthy());
    expect(__capabilityIntelligenceComputeCount()).toBe(1);
    expect(computeCapabilityIntelligence()).toBe(first);
  });

  it("keeps the compute count stable across explorer filtering, paging and drawer use", async () => {
    const before = __capabilityIntelligenceComputeCount();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CapabilityExplorerTable engine={engine} onSelect={() => {}} />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText("Search entities"), "platform");
    await user.click(screen.getByLabelText("Next page"));
    expect(__capabilityIntelligenceComputeCount()).toBe(before);
  });
});

describe("Capability Intelligence — overview", () => {
  it("maps node, edge and hash values straight from the engine result", () => {
    renderOverview();
    expect(screen.getByTestId("kpi-Nodes").textContent).toBe(intelligence.graph.nodeCount.toLocaleString());
    expect(screen.getByTestId("kpi-Edges").textContent).toBe(intelligence.graph.edgeCount.toLocaleString());
    expect(screen.getByTestId("graph-hash").textContent).toBe(intelligence.graph.contentHash);
  });

  it("shows every priority band separately and never merges low with informational", () => {
    renderOverview();
    const p = intelligence.statistics.recommendationsByPriority;
    expect(screen.getByTestId("kpi-Critical").textContent).toBe(String(p.critical));
    expect(screen.getByTestId("kpi-High").textContent).toBe(String(p.high));
    expect(screen.getByTestId("kpi-Medium").textContent).toBe(String(p.medium));
    expect(screen.getByTestId("kpi-Low").textContent).toBe(String(p.low));
    expect(screen.getByTestId("kpi-Informational").textContent).toBe(String(p.informational));
    expect(screen.getByTestId("kpi-Low").textContent).not.toBe(String(p.low + p.informational));
  });

  it("preserves engine precision for rate metrics", () => {
    renderOverview();
    expect(screen.getByTestId("kpi-Ownership resolution").textContent).toBe(
      formatRate(metricOf(intelligence.statistics.ownershipResolutionRate)),
    );
    expect(screen.getByTestId("kpi-Route traceability").textContent).toBe(
      formatRate(metricOf(intelligence.statistics.routeTraceabilityRate)),
    );
  });

  it("distinguishes a zero value from an unavailable or unverifiable metric", () => {
    expect(formatRate({ kind: "value", value: 0 })).toBe("0%");
    expect(formatRate(metricOf(undefined))).toBe("Not available");
    expect(formatRate({ kind: "unverified" })).toBe("Unable to verify");
    expect(formatRate({ kind: "value", value: 0.462 })).toBe("46.2%");
  });

  it("frames registration as coverage and surfaces expected-by-design exclusions", () => {
    renderOverview();
    expect(screen.getByText("Registration coverage")).toBeTruthy();
    expect(screen.getByTestId("kpi-Open coverage gaps").textContent).toBe(
      intelligence.statistics.coverageGapCount.toLocaleString(),
    );
    expect(screen.getByTestId("kpi-Expected-by-design exclusions").textContent).toBe(
      intelligence.statistics.expectedByDesignExclusionCount.toLocaleString(),
    );
    expect(screen.getByTestId("kpi-Unregistered inventory")).toBeTruthy();
  });

  it("humanizes analysis confidence while retaining the raw engine value", () => {
    renderOverview();
    expect(screen.getByTestId("kpi-Analysis confidence").textContent).toBe(confidenceLabel(intelligence.confidence));
    expect(screen.getByTestId("confidence-raw").textContent).toContain(intelligence.confidence);
  });

  /* ------------------------------------ Stage 3.5.4.1.2 — KPI semantics */

  it("emits a valid description-list group per KPI with the term before its value", () => {
    const { container } = renderOverview();
    const groups = container.querySelectorAll("dl > div");
    expect(groups.length).toBeGreaterThan(0);
    for (const group of Array.from(groups)) {
      const children = Array.from(group.children);
      const dtIndex = children.findIndex((c) => c.tagName === "DT");
      const ddIndex = children.findIndex((c) => c.tagName === "DD");
      expect(dtIndex).toBeGreaterThanOrEqual(0);
      expect(ddIndex).toBeGreaterThanOrEqual(0);
      // Term must precede its definition in the accessibility tree.
      expect(dtIndex).toBeLessThan(ddIndex);
      // Exactly one definition value per term — supporting context is not a <dd>.
      expect(group.querySelectorAll("dd").length).toBe(1);
      expect(group.querySelectorAll("dt").length).toBe(1);
    }
  });

  it("associates supporting context with the metric via aria-describedby, not a second dd", () => {
    const { container } = renderOverview();
    const value = screen.getByTestId("kpi-Candidate edges");
    const describedBy = value.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const hint = container.querySelector(`#${CSS.escape(describedBy as string)}`);
    expect(hint?.tagName).toBe("P");
    expect(hint?.textContent).toBe("Weakly inferred relationships");
    const term = value.previousElementSibling;
    expect(term?.tagName).toBe("DT");
    expect(term?.textContent).toBe("Candidate edges");
  });

  it("keeps every dl a direct term/value container (no stray dd outside a group)", () => {
    const { container } = renderOverview();
    for (const dd of Array.from(container.querySelectorAll("dd"))) {
      expect(dd.parentElement?.parentElement?.tagName).toBe("DL");
    }
  });

  /* --------------------------- Stage 3.5.4.1.2 — responsive grid balance */

  it("balances the eight-tile recommendation summary across breakpoints", () => {
    const { container } = renderOverview();
    const section = container.querySelector('section[aria-labelledby="recommendation-summary"]');
    const grid = section?.querySelector("dl");
    expect(grid?.querySelectorAll("dl > div").length ?? section?.querySelectorAll("dl > div").length).toBe(8);
    const cls = grid?.className ?? "";
    expect(cls).toContain("grid-cols-2");
    expect(cls).toContain("md:grid-cols-4");
    expect(cls).toContain("2xl:grid-cols-8");
    // Six-column layout produced two orphan tiles on the second row.
    expect(cls).not.toContain("md:grid-cols-6");
  });
});


describe("Capability Intelligence — explorer", () => {
  const renderExplorer = () => {
    const selected: string[] = [];
    render(<CapabilityExplorerTable engine={engine} onSelect={(id) => selected.push(id)} />);
    return selected;
  };

  it("renders no more than one page of rows and reports the range", () => {
    renderExplorer();
    expect(screen.getAllByTestId("paged-row").length).toBeLessThanOrEqual(25);
    expect(screen.getByTestId("paged-range").textContent).toContain(String(engine.source.nodes.length));
  });

  it("filters by free text and clamps paging back to the first page", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await user.click(screen.getByLabelText("Next page"));
    await user.type(screen.getByLabelText("Search entities"), "capability");
    expect(screen.getByTestId("paged-range").textContent).toContain("Showing 1–");
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByTestId("paged-range").textContent).toContain(String(engine.source.nodes.length));
  });

  it("labels the module identifier column as the owning module", () => {
    renderExplorer();
    expect(screen.getByRole("button", { name: "Sort by Owning module" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sort by Ownership status" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Sort by Owner" })).toBeNull();
  });

  it("exposes deterministic orphan filtering", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await user.click(screen.getByLabelText("Connectivity"));
    await user.click(await screen.findByRole("option", { name: "orphan" }));
    const orphanRange = screen.getByTestId("paged-range").textContent ?? "";
    expect(orphanRange).toContain(String(orphanIds.size));
    for (const row of screen.getAllByTestId("paged-row")) {
      expect(within(row).getByText("orphan")).toBeTruthy();
    }

    await user.click(screen.getByLabelText("Connectivity"));
    await user.click(await screen.findByRole("option", { name: "connected" }));
    expect(screen.getByTestId("paged-range").textContent).toContain(
      String(engine.source.nodes.length - orphanIds.size),
    );
    for (const row of screen.getAllByTestId("paged-row")) {
      expect(within(row).queryByText("orphan")).toBeNull();
    }
  });

  it("annotates sortable headers with aria-sort states", async () => {
    const user = userEvent.setup();
    renderExplorer();
    const header = () => screen.getByRole("button", { name: "Sort by Entity" }).closest("th") as HTMLElement;
    expect(header().getAttribute("aria-sort")).toBe("ascending");
    expect(
      (screen.getByRole("button", { name: "Sort by Type" }).closest("th") as HTMLElement).getAttribute("aria-sort"),
    ).toBe("none");
    await user.click(screen.getByRole("button", { name: "Sort by Entity" }));
    expect(header().getAttribute("aria-sort")).toBe("descending");
  });

  it("announces the result range in a live region", () => {
    renderExplorer();
    const range = screen.getByTestId("paged-range");
    expect(range.getAttribute("aria-live")).toBe("polite");
  });
});

describe("Capability Intelligence — recommendation center", () => {
  const sample = intelligence.recommendations.slice(0, 12);

  it("renders identifiers, statuses, priority and severity from the engine", () => {
    render(<RecommendationList recommendations={sample} />);
    const cards = screen.getAllByTestId("recommendation-card");
    cards.forEach((card, i) => {
      const r = sample[i];
      expect(within(card).getByTestId("recommendation-id").textContent).toBe(r.id);
      expect(within(card).getByTestId("recommendation-status").getAttribute("data-status")).toBe(r.status);
      expect(within(card).getByTestId("recommendation-status").textContent).toContain(statusLabel(r.status));
      expect(within(card).getByTestId("recommendation-priority").getAttribute("data-priority")).toBe(r.priority);
      expect(within(card).getByTestId("recommendation-severity").getAttribute("data-severity")).toBe(r.severity);
    });
  });

  it("distinguishes expected-by-design recommendations from open ones", () => {
    const expected = intelligence.recommendations.filter((r) => r.expectedByDesign).slice(0, 3);
    const open = intelligence.recommendations.filter((r) => !r.expectedByDesign).slice(0, 3);
    if (expected.length) {
      render(<RecommendationList recommendations={expected} />);
      expect(screen.getAllByTestId("expected-by-design").length).toBe(expected.length);
    }
    const view = render(<RecommendationList recommendations={open} />);
    expect(within(view.container as HTMLElement).queryAllByTestId("expected-by-design").length).toBe(0);
  });

  it("filters by priority and category without mutating the source array", async () => {
    const user = userEvent.setup();
    const before = [...intelligence.recommendations.map((r) => r.id)];
    render(<RecommendationList recommendations={intelligence.recommendations} />);
    await user.click(screen.getByLabelText("Priority"));
    await user.click(await screen.findByRole("option", { name: "critical" }));
    const criticalCount = intelligence.recommendations.filter((r) => r.priority === "critical").length;
    expect(screen.getByTestId("recommendation-count").textContent).toContain(`${criticalCount} of`);
    expect(intelligence.recommendations.map((r) => r.id)).toEqual(before);
  });
});

describe("Capability Intelligence — entity drawer", () => {
  const orphanId = [...orphanIds][0];
  const connectedId = engine.source.nodes.find((n) => !orphanIds.has(n.id))!.id;

  it("opens for a selected entity and renders canonical data", () => {
    render(
      <EntityDrawer nodeId={connectedId} engine={engine} intelligence={intelligence} onOpenChange={() => {}} />,
    );
    const node = engine.getNode(connectedId)!;
    expect(screen.getAllByText(node.label).length).toBeGreaterThan(0);
    expect(screen.getByText(node.id)).toBeTruthy();
    expect(screen.getByText("Owning module")).toBeTruthy();
  });

  it("marks orphan entities in the drawer", () => {
    render(<EntityDrawer nodeId={orphanId} engine={engine} intelligence={intelligence} onOpenChange={() => {}} />);
    expect(screen.getByTestId("entity-connectivity").textContent).toContain("Orphan");
  });

  it("does not recompute the intelligence snapshot when opened", () => {
    const before = __capabilityIntelligenceComputeCount();
    render(<EntityDrawer nodeId={connectedId} engine={engine} intelligence={intelligence} onOpenChange={() => {}} />);
    expect(__capabilityIntelligenceComputeCount()).toBe(before);
  });
});

describe("Capability Intelligence — orphan definition", () => {
  it("matches the canonical graph statistics orphan total", () => {
    expect(orphanIds.size).toBe(statistics.totals.orphanNodes);
    expect(buildOrphanIndex(engine.source).size).toBe(orphanIds.size);
  });
});
