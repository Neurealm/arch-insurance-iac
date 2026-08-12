import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EnterpriseSourceDiscovery from "../EnterpriseSourceDiscovery";
import DiscoveryScaffold from "../DiscoveryScaffold";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/enterprise-cognitive-fabric/discovery/source-discovery"]}>
      <Routes>
        <Route path="/enterprise-cognitive-fabric/discovery/source-discovery" element={<EnterpriseSourceDiscovery />} />
        <Route path="/enterprise-cognitive-fabric/discovery/ingestion-normalization" element={<DiscoveryScaffold />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  // jsdom lacks the pointer-capture APIs Radix relies on
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
});

describe("Enterprise Source Discovery", () => {
  it("renders the page title, subtitle and breadcrumb", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Enterprise Source Discovery" })).toBeInTheDocument();
    expect(screen.getByText(/Discover and inventory where organizational knowledge lives/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("renders the five KPI cards with seeded values", () => {
    renderPage();
    expect(screen.getByLabelText(/Registered Sources: 147/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Active Connectors: 38/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Artifacts Discovered: 2.4M/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Knowledge Domains: 22/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Discovery Coverage: 89%/)).toBeInTheDocument();
  });

  it("switches views and persists the preference", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("combobox", { name: "Page view" }));
    await user.click(await screen.findByRole("option", { name: "Operations View" }));
    await waitFor(() => {
      expect(window.localStorage.getItem("ecf.sourceDiscovery.prefs")).toContain("operations");
    });
  });

  it("applies and clears global filters", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Toggle filters" }));
    await user.selectOptions(screen.getByLabelText("Source Category"), "Meetings");
    await user.click(screen.getByRole("button", { name: "Apply Filters" }));
    expect(screen.getByText(/1 active filters/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear Filters" }));
    expect(screen.queryByText(/active filters/)).not.toBeInTheDocument();
  });

  it("searches and sorts the source inventory", async () => {
    const user = userEvent.setup();
    renderPage();
    const inventory = document.getElementById("panel-inventory") as HTMLElement;
    await user.type(within(inventory).getByLabelText("Search sources"), "telemetry");
    expect(within(inventory).getByText("Customer Telemetry")).toBeInTheDocument();
    expect(within(inventory).getByText("1 sources")).toBeInTheDocument();
    await user.clear(within(inventory).getByLabelText("Search sources"));
    await user.click(within(inventory).getByRole("button", { name: "Sort by Coverage" }));
    expect(within(inventory).getByText("7 sources")).toBeInTheDocument();
  });

  it("opens the source details drawer from a row", async () => {
    const user = userEvent.setup();
    renderPage();
    const inventory = document.getElementById("panel-inventory") as HTMLElement;
    await user.click(within(inventory).getByRole("button", { name: "Customer Telemetry" }));
    expect(await screen.findByText("Observability Platform")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run Discovery" })).toBeInTheDocument();
  });

  it("filters the inventory when a topology category is selected", async () => {
    const user = userEvent.setup();
    renderPage();
    const topology = document.getElementById("panel-topology") as HTMLElement;
    await user.click(within(topology).getByRole("button", { name: "Meetings" }));
    const inventory = document.getElementById("panel-inventory") as HTMLElement;
    expect(within(inventory).getByText("1 sources")).toBeInTheDocument();
    expect(within(topology).getByText("Filtered by Meetings")).toBeInTheDocument();
  });

  it("opens a connector alert drawer and offers remediation actions", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Apigee token refresh failed/ }));
    expect(await screen.findByRole("button", { name: "Acknowledge" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Escalate" })).toBeInTheDocument();
  });

  it("opens a workflow stage drawer", async () => {
    const user = userEvent.setup();
    renderPage();
    const workflow = document.getElementById("panel-workflow") as HTMLElement;
    await user.click(within(workflow).getByRole("button", { name: /Validate Access/ }));
    expect(await screen.findByText("P95 duration")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry failed items/ })).toBeInTheDocument();
  });

  it("runs the Run Discovery workflow through to completion", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Run Discovery/ }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Next" }));
    await user.click(within(dialog).getByRole("button", { name: "Next" }));
    await user.click(within(dialog).getByRole("button", { name: "Next" }));
    expect(within(dialog).getByText("Estimated duration")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Run Discovery" }));
    expect(await within(dialog).findByText("Sources discovered", {}, { timeout: 8000 })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Proceed to Ingestion" })).toBeInTheDocument();
  }, 20000);

  it("opens the export dialog and generates a JSON export", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => "blob:mock");
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    renderPage();
    await user.click(screen.getByRole("button", { name: /Export Inventory/ }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "JSON" }));
    await user.click(within(dialog).getByRole("button", { name: "Export" }));
    await waitFor(() => expect(createObjectURL).toHaveBeenCalled(), { timeout: 4000 });
  });

  it("runs the demo story from start to exit", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(await screen.findByRole("menuitem", { name: /Demo Story/ }));
    const story = await screen.findByRole("dialog", { name: "Demo story" });
    expect(within(story).getByText(/Step 1 of 6/)).toBeInTheDocument();
    await user.click(within(story).getByRole("button", { name: "Next" }));
    expect(within(story).getByText(/Step 2 of 6/)).toBeInTheDocument();
    await user.click(within(story).getByRole("button", { name: "Exit Story" }));
    expect(screen.queryByRole("dialog", { name: "Demo story" })).not.toBeInTheDocument();
  });

  it("applies a degraded demo scenario consistently across panels", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Connector Degradation" }));
    expect((await screen.findAllByText(/Four connectors are degraded/)).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Discovery Coverage: 81%/)).toBeInTheDocument();
    expect(screen.getByText("Degraded — partial data")).toBeInTheDocument();
  });

  it("routes to the ingestion scaffold from Knowledge Readiness", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Proceed to Ingestion/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Artifact Ingestion & Normalization" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Return to Enterprise Source Discovery/ })).toBeInTheDocument();
  });

  it("shows a loading state while refreshing", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Refresh/ }));
    expect(document.querySelector("[aria-busy='true']")).toBeTruthy();
  });
});
