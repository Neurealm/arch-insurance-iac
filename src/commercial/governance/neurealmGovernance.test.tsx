import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CommercialNeurealmGovernance from "@/commercial/pages/CommercialNeurealmGovernance";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("Neurealm Governance (prototype)", () => {
  it("renders header, summary, operating model, phases, forums, RACI, registers and notice", () => {
    render(<CommercialNeurealmGovernance />);

    expect(screen.getByRole("heading", { name: "Neurealm Governance", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(/Internal governance framework supporting Day 0, Day 1, and Day 2 operations/i),
    ).toBeInTheDocument();

    expect(screen.getByText("Overall Governance Health")).toBeInTheDocument();
    expect(screen.getByText("Next Governance Meeting")).toBeInTheDocument();

    expect(screen.getByText("Neurealm Governance Operating Model")).toBeInTheDocument();
    expect(screen.getAllByText("Executive Steering Committee").length).toBeGreaterThan(0);

    expect(screen.getByText("Day 0, Day 1 and Day 2 Operational Focus")).toBeInTheDocument();
    expect(screen.getByText("Build and Transition")).toBeInTheDocument();

    expect(screen.getByText("Governance Forums")).toBeInTheDocument();
    expect(screen.getByText("RACI Snapshot, Key Functions")).toBeInTheDocument();
    expect(screen.getByText("Top Risks and Issues")).toBeInTheDocument();
    expect(screen.getByText("Key Decisions")).toBeInTheDocument();
    expect(screen.getByText("Neurealm Governance KPIs")).toBeInTheDocument();
    expect(screen.getByText("Executive Attention Required")).toBeInTheDocument();
    expect(screen.getByText("Governance Calendar")).toBeInTheDocument();
    expect(screen.getByText("Recent Governance Activity")).toBeInTheDocument();
    expect(screen.getByText("Prototype Governance View")).toBeInTheDocument();
  });

  it("recalculates Day 0 readiness when a checklist item is toggled", () => {
    render(<CommercialNeurealmGovernance />);
    expect(screen.getByText("78%")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Baseline service metrics"));
    // 13 of 15 complete -> 87%
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("approves a decision locally", () => {
    render(<CommercialNeurealmGovernance />);
    const approveButtons = screen.getAllByRole("button", { name: "Approve" });
    fireEvent.click(approveButtons[0]);
    expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
  });
});
