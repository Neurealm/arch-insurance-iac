import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CommercialStaffingResources from "@/commercial/pages/CommercialStaffingResources";

describe("Staffing & Resources", () => {
  it("renders the header and key sections", () => {
    render(
      <MemoryRouter>
        <CommercialStaffingResources />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /Neurealm Staffing & Resources/i })).toBeInTheDocument();
    expect(screen.getByText(/Critical Role Coverage/i)).toBeInTheDocument();
    expect(screen.getByText(/Capacity and Demand Gaps/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Resource Risks/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Prototype Staffing View/i)).toBeInTheDocument();
  });
});
