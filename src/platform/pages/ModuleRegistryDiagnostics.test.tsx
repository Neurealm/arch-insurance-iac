import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ModuleRegistryDiagnostics from "./ModuleRegistryDiagnostics";
import ModuleRegistryUnregistered from "./ModuleRegistryUnregistered";

describe("Module Registry diagnostics view", () => {
  it("renders module, route and coverage summaries", () => {
    render(
      <MemoryRouter>
        <ModuleRegistryDiagnostics />
      </MemoryRouter>,
    );
    expect(screen.getByText("Module Registry Diagnostics")).toBeInTheDocument();
    expect(screen.getByText("Registered modules")).toBeInTheDocument();
    expect(screen.getByText("Application routes")).toBeInTheDocument();
    // The one registered module must be listed.
    expect(screen.getByText("sre")).toBeInTheDocument();
  });

  it("renders the unregistered implementation panel", () => {
    render(<ModuleRegistryUnregistered />);
    expect(screen.getByText(/unregistered items of/i)).toBeInTheDocument();
    expect(screen.getByText("Recommended action")).toBeInTheDocument();
  });
});
