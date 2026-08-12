import { describe, expect, it, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { geoNaturalEarth1 } from "d3-geo";
import SreAgenticOpticalOperationsCenter from "../SreAgenticOpticalOperationsCenter";
import {
  createGreatCircle, projectTerminal,
} from "@/components/operations/AgenticGlobalOpticalMap";
import { terminals } from "@/data/agenticOpticalNetworkData";

const ROUTE = "/operations/sre-agentic-noc/global-optical-operations";

function renderPage(initial = ROUTE) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path={ROUTE} element={<SreAgenticOpticalOperationsCenter />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SRE Based Agentic NOC — Global Optical Operations Center", () => {
  it("renders the page with the operating model title", async () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Global Optical Operations Center" })).toBeInTheDocument();
    expect(screen.getAllByText("SRE Based Agentic NOC").length).toBeGreaterThan(0);
    expect(screen.getByText("Observe. Understand. Predict. Act. Learn.")).toBeInTheDocument();
  });

  it("renders loading states before data settles", () => {
    renderPage();
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
  });

  it("renders SRE View by default and switches to Executive View", async () => {
    renderPage();
    const sreButton = screen.getByRole("button", { name: "SRE View" });
    expect(sreButton).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Executive View" }));
    expect(screen.getByRole("button", { name: "Executive View" })).toHaveAttribute("aria-pressed", "true");
  });

  it("renders map geography and great circle routes", async () => {
    const { container } = renderPage();
    const map = await screen.findByRole("img", { name: /Global reliability digital twin/i });
    expect(map).toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="map-countries"] path').length).toBeGreaterThan(50);
    expect(container.querySelectorAll('[data-testid="map-routes"] > g').length).toBeGreaterThan(0);
  });

  it("projects terminal coordinates correctly and rejects invalid coordinates", () => {
    const projection = geoNaturalEarth1().fitExtent([[18, 18], [1182, 522]], {
      type: "Sphere",
    } as never);
    const point = projectTerminal(projection, terminals[0]);
    expect(point).not.toBeNull();
    expect(Number.isFinite(point![0])).toBe(true);
    const invalid = projectTerminal(projection, { ...terminals[0], latitude: Number.NaN, longitude: 999 });
    expect(invalid).toBeNull();
  });

  it("builds curved great circle geometry rather than straight lines", () => {
    const feature = createGreatCircle(terminals[3], terminals[4], 16);
    expect(feature.geometry.coordinates).toHaveLength(17);
    const [first] = feature.geometry.coordinates;
    expect(first[0]).toBeCloseTo(terminals[3].longitude, 3);
  });

  it("filters update the map", async () => {
    const { container } = renderPage();
    await screen.findByRole("img", { name: /Global reliability digital twin/i });
    const before = container.querySelectorAll('[data-testid="map-terminals"] > g').length;
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    fireEvent.change(screen.getByLabelText("Region"), { target: { value: "APAC" } });
    const after = container.querySelectorAll('[data-testid="map-terminals"] > g').length;
    expect(after).toBeLessThan(before);
  });

  it("layer toggles update the map", async () => {
    const { container } = renderPage();
    await screen.findByRole("img", { name: /Global reliability digital twin/i });
    expect(container.querySelectorAll('[data-testid="map-terminals"] > g').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Terminals" }));
    expect(container.querySelectorAll('[data-testid="map-terminals"] > g').length).toBe(0);
  });

  it("opens terminal details on selection", async () => {
    renderPage();
    const terminal = await screen.findByRole("button", { name: /Terminal Mumbai Landing Station/i });
    fireEvent.click(terminal);
    expect(screen.getByText(/Selected terminal Mumbai Landing Station/)).toBeInTheDocument();
  });

  it("opens link details on selection", async () => {
    renderPage();
    const route = await screen.findByRole("button", { name: /Optical route AMS-MUM/i });
    fireEvent.click(route);
    expect(screen.getByText(/Selected route AMS-MUM/)).toBeInTheDocument();
  });

  it("renders empty states when filters exclude all data", async () => {
    renderPage(`${ROUTE}?region=LATAM&networkStatus=critical`);
    expect(await screen.findByText(/No terminals or routes match the current filters/i)).toBeInTheDocument();
  });

  it("supports reduced motion via CSS media query", async () => {
    const { container } = renderPage();
    await screen.findByRole("img", { name: /Global reliability digital twin/i });
    const styles = Array.from(container.querySelectorAll("style")).map((s) => s.textContent ?? "").join("");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });

  it("renders the primary situation and event stream content", async () => {
    renderPage();
    expect(await screen.findByText("Mumbai to Amsterdam Optical Corridor Degradation")).toBeInTheDocument();
    const stream = screen.getByLabelText("AI Native Operational Event Stream");
    expect(within(stream).getByText("Auto remediation progressing")).toBeInTheDocument();
  });
});
