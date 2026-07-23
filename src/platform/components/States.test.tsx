import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ForbiddenState, LoadingState, EmptyState, ErrorState, sanitizeError } from "./States";

describe("platform State components", () => {
  it("LoadingState announces status", () => {
    render(<LoadingState label="Checking access…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Checking access…");
  });

  it("EmptyState renders title and description", () => {
    render(<EmptyState title="No members" description="Invite someone." />);
    expect(screen.getByText("No members")).toBeInTheDocument();
    expect(screen.getByText("Invite someone.")).toBeInTheDocument();
  });

  it("ForbiddenState shows required permission and is announced", () => {
    render(
      <MemoryRouter>
        <ForbiddenState permission="members.manage" />
      </MemoryRouter>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/members\.manage/)).toBeInTheDocument();
  });

  it("ErrorState renders sanitized message and retry", () => {
    render(<ErrorState error={new Error("permission denied for table foo: bar")} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/bar/)).toBeInTheDocument();
  });

  it("sanitizeError strips PostgREST noise", () => {
    expect(sanitizeError("permission denied for table x: nope"))
      .toBe("nope");
    expect(sanitizeError("new row violates row-level security policy for table foo"))
      .toBe("You are not allowed to perform this action.");
  });
});
