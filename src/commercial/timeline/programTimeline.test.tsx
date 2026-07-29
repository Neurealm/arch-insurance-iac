import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CommercialProgramTimeline from "@/commercial/pages/CommercialProgramTimeline";

describe("Program & Customer Timelines (prototype)", () => {
  it("renders header, summary cards, timeline lanes, milestones and notice", () => {
    render(
      <MemoryRouter>
        <CommercialProgramTimeline />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /Program & Customer Timelines/i })).toBeInTheDocument();
    expect(screen.getByText(/Program Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Neurealm Deliverables/i)).toBeInTheDocument();
    expect(screen.getByText(/Operational Readiness/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Go-Live/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/do not represent committed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Today marker/i)).toBeInTheDocument();
  });
});
