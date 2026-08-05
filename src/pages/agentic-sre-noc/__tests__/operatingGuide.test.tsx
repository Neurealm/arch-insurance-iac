import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { OperatingGuide } from "../components/OperatingGuide";

const metrics = [
  { label: "Services healthy", value: "320" },
  { label: "Optical availability", value: "99.999%" },
];
const facts = [
  { label: "Current stage", value: "Predict Risk" },
  { label: "Confidence", value: "88%" },
];

function setup(overrides: Partial<React.ComponentProps<typeof OperatingGuide>> = {}) {
  const props = {
    outcomeMetrics: metrics,
    objectiveFacts: facts,
    currentStageKey: "predict",
    onShowMap: vi.fn(),
    onViewRisks: vi.fn(),
    onOpenEvidence: vi.fn(),
    onViewCoworkers: vi.fn(),
    onRunScenario: vi.fn(),
    ...overrides,
  };
  render(
    <MemoryRouter>
      <OperatingGuide {...props} />
    </MemoryRouter>,
  );
  return props;
}

describe("Global Link Health Operating Guide", () => {
  it("renders the guide heading, outcome and objective", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Global Link Health Operating Guide" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Outcome" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Current Operating Objective" })).toBeInTheDocument();
    expect(screen.getByText(/Protect optical transport availability worldwide/)).toBeInTheDocument();
    expect(screen.getByText(/Protect Chennai customer services/)).toBeInTheDocument();
  });

  it("renders outcome metrics supplied by the page", () => {
    setup();
    expect(screen.getByText("320")).toBeInTheDocument();
    expect(screen.getByText("99.999%")).toBeInTheDocument();
  });

  it("defaults to summary mode with the eight operating stages", () => {
    setup();
    expect(screen.getByRole("button", { name: /summary/i })).toHaveAttribute("aria-pressed", "true");
    ["Observe", "Build Context", "Detect Change", "Predict Risk", "Determine Impact",
      "Recommend Action", "Validate Recovery", "Learn"].forEach((t) => {
      expect(screen.getAllByText(t).length).toBeGreaterThan(0);
    });
  });

  it("shows expanded detail in expanded mode", async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.queryByText(/Reduce avoidable field dispatches/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /expanded/i }));
    expect(screen.getByText(/Reduce avoidable field dispatches/)).toBeInTheDocument();
    expect(screen.getByText(/Six Chennai links under watch/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Evidence" })).toBeInTheDocument();
  });

  it("collapses and expands the guide", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /collapse guide/i }));
    expect(screen.getByText(/Current stage: 4. Predict Risk/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Outcome" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /expand guide/i }));
    expect(screen.getByRole("heading", { name: "Outcome" })).toBeInTheDocument();
  });

  it("selects a stage with the keyboard and shows its detail", async () => {
    const user = userEvent.setup();
    setup();
    const stage = screen.getByRole("button", { name: /Observe/ });
    stage.focus();
    await user.keyboard("{Enter}");
    const detail = screen.getByTestId("glht-guide-stage-detail");
    expect(within(detail).getByText(/Beam lock/)).toBeInTheDocument();
    expect(within(detail).getByText(/Telemetry Collection Agent/)).toBeInTheDocument();
    expect(stage).toHaveAttribute("aria-pressed", "true");
  });

  it("marks the current stage for assistive technology", () => {
    setup();
    expect(screen.getByRole("button", { name: /Predict Risk/ })).toHaveAttribute("aria-current", "step");
  });

  it("fires the same-page actions", async () => {
    const user = userEvent.setup();
    const props = setup();
    await user.click(screen.getByRole("button", { name: "Show on Map" }));
    await user.click(screen.getByRole("button", { name: "View At-Risk Links" }));
    await user.click(screen.getByRole("button", { name: "Run Chennai Scenario" }));
    expect(props.onShowMap).toHaveBeenCalled();
    expect(props.onViewRisks).toHaveBeenCalled();
    expect(props.onRunScenario).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "View Operating Method" }));
    expect(screen.getByRole("button", { name: /expanded/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("glht-guide-stage-detail")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open Evidence" }));
    await user.click(screen.getByRole("button", { name: "View Digital Coworkers" }));
    expect(props.onOpenEvidence).toHaveBeenCalled();
    expect(props.onViewCoworkers).toHaveBeenCalled();
  });
});
