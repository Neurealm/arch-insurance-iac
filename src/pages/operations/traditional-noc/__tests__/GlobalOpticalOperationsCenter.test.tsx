import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GlobalOpticalOperationsCenter from "../GlobalOpticalOperationsCenter";
import { opticalLinks, opticalTerminals } from "@/data/opticalNetworkData";
import { DEFAULT_FILTERS, regionalScore } from "@/hooks/useOpticalOperations";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/operations/traditional-noc/global-optical-operations"]}>
      <GlobalOpticalOperationsCenter />
    </MemoryRouter>,
  );
}

describe("Traditional NOC — Global Optical Operations Center", () => {
  it("renders the dashboard with the Traditional NOC operating-model label", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Global Optical Operations Center" })).toBeInTheDocument();
    expect(screen.getByText("Traditional NOC")).toBeInTheDocument();
  });

  it("renders CTO view by default and switches to NOC Director view", () => {
    renderPage();
    const cto = screen.getByRole("tab", { name: "CTO View" });
    expect(cto).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("tab", { name: "NOC Director View" }));
    expect(screen.getByRole("tab", { name: "NOC Director View" })).toHaveAttribute("aria-selected", "true");
  });

  it("renders the locally projected world map with terminals and routes", async () => {
    renderPage();
    const map = await screen.findByRole("img", { name: /Global optical network map/i });
    expect(map).toBeInTheDocument();
    expect(within(map).getByLabelText(/Terminal Mumbai Optical Hub/i)).toBeInTheDocument();
    expect(within(map).getByLabelText(/Optical route AMS–MUM Long-Haul Route/i)).toBeInTheDocument();
  });

  it("projects every terminal to a finite coordinate pair", async () => {
    renderPage();
    const map = await screen.findByRole("img", { name: /Global optical network map/i });
    map.querySelectorAll("circle").forEach((c) => {
      const cx = c.getAttribute("cx");
      const cy = c.getAttribute("cy");
      if (cx !== null) expect(Number.isFinite(Number(cx))).toBe(true);
      if (cy !== null) expect(Number.isFinite(Number(cy))).toBe(true);
    });
  });

  it("filters update metric cards, map nodes and map routes", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));
    fireEvent.change(screen.getByLabelText("Region"), { target: { value: "Europe" } });
    const map = await screen.findByRole("img", { name: /Global optical network map/i });
    await waitFor(() => expect(map.getAttribute("aria-label")).toContain("3 terminals"));
    expect(within(map).queryByLabelText(/Terminal Mumbai Optical Hub/i)).toBeNull();
    const impactCard = screen.getAllByText("Customer impact")
      .map((el) => el.closest("button"))
      .find((btn) => btn?.textContent?.includes("Enterprise customers"));
    expect(impactCard).toBeTruthy();
    expect(impactCard).toHaveTextContent("0");
  });

  it("opens terminal details when a map terminal is selected", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Terminal Chicago Optical Hub/i));
    expect(screen.getByText(/Chicago Optical Hub — Chicago, United States/)).toBeInTheDocument();
  });

  it("opens link details when a map route is selected", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Optical route CHI–ATL Optical Route/i));
    expect(screen.getByText(/CHI–ATL Optical Route — degraded/)).toBeInTheDocument();
  });

  it("opens the incident detail drawer", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("INC-56231"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Current hypothesis/i)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByLabelText("Close details"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("manual refresh updates the last refreshed timestamp", () => {
    vi.useFakeTimers();
    try {
      renderPage();
      const before = screen.getByText(/Last refreshed/).textContent;
      vi.advanceTimersByTime(3000);
      fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
      expect(screen.getByText(/Last refreshed/).textContent).not.toEqual(before);
    } finally {
      vi.useRealTimers();
    }
  });

  it("CSV export produces output", () => {
    const createObjectURL = vi.fn(() => "blob:csv");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /CSV/i }));
    expect(createObjectURL).toHaveBeenCalled();
  });

  it("renders an empty state when filters exclude all data", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));
    fireEvent.change(screen.getByLabelText("Terminal"), { target: { value: "chi-01" } });
    expect(screen.getAllByText(/No optical links match the current filters\./i).length).toBeGreaterThan(0);
  });

  it("uses only valid geographic coordinates in the dataset", () => {
    opticalTerminals.forEach((t) => {
      expect(Math.abs(t.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(t.longitude)).toBeLessThanOrEqual(180);
    });
    const ids = new Set(opticalTerminals.map((t) => t.id));
    opticalLinks.forEach((l) => {
      expect(ids.has(l.sourceTerminalId)).toBe(true);
      expect(ids.has(l.targetTerminalId)).toBe(true);
    });
  });

  it("computes a weighted regional status", () => {
    const healthy = regionalScore({ availability: 99.99, customersAffected: 0, criticalIncidents: 0, degradedLinks: 0, capacityPressurePercent: 40, weatherExposedLinks: 0, changeRiskPercent: 5 });
    const bad = regionalScore({ availability: 99.1, customersAffected: 55610, criticalIncidents: 1, degradedLinks: 2, capacityPressurePercent: 88, weatherExposedLinks: 3, changeRiskPercent: 34 });
    expect(healthy.status).toBe("healthy");
    expect(bad.score).toBeLessThan(healthy.score);
    expect(DEFAULT_FILTERS.region).toBe("All regions");
  });
});
