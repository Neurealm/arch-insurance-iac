import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EnterpriseCommandCenter from "../EnterpriseCommandCenter";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 200 }}>{children}</div>
    ),
  };
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/enterprise-cognitive-fabric/command-center"]}>
      <EnterpriseCommandCenter />
    </MemoryRouter>,
  );
}

describe("Enterprise Command Center", () => {
  it("renders the page title and seeded KPI values", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Enterprise Command Center", level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/Teams Onboarded: 48/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Active Personas: 72/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cognitive Health Score: 92\/100/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Active Discovery Jobs: 23/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enterprise Memory: 4.2 TB/)).toBeInTheDocument();
  });

  it("renders all primary panels", () => {
    renderPage();
    for (const t of [
      "Cognitive Health Overview",
      "Active Discovery Pipelines",
      "Enterprise Memory Utilization",
      "Top Knowledge Domains",
      "Incoming Work Overview",
      "Recent Decisions",
      "System Alerts",
      "Cognitive Insights",
      "Learning Loop Status",
    ]) {
      expect(screen.getByRole("heading", { name: t, level: 2 })).toBeInTheDocument();
    }
  });

  it("opens a discovery pipeline drawer from a table row", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Confluence Cloud pipeline/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Discovery scope")).toBeInTheDocument();
  });

  it("opens a decision drawer from a table row", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Add Real-time Fraud Scoring, Approve/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Recommendation")).toBeInTheDocument();
  });

  it("toggles the filter toolbar", () => {
    renderPage();
    expect(screen.queryByLabelText("Business unit")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Toggle filters"));
    expect(screen.getByLabelText("Business unit")).toBeInTheDocument();
  });

  it("applies and clears a knowledge domain filter", () => {
    renderPage();
    const domains = screen.getByRole("heading", { name: "Top Knowledge Domains" }).closest("section")!;
    fireEvent.click(within(domains).getByRole("button", { name: /^Engineering/ }));
    expect(screen.getByText(/Clear filter/)).toBeInTheDocument();
  });

  it("opens the export modal", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Export Report/ }));
    expect(screen.getByRole("dialog", { name: /Export Report/ })).toBeInTheDocument();
  });

  it("refreshes and updates the timestamp", async () => {
    vi.useFakeTimers();
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Refresh/ }));
    expect(screen.getByText(/Refreshing Command Center data/)).toBeInTheDocument();
    vi.advanceTimersByTime(1200);
    vi.useRealTimers();
  });
});
