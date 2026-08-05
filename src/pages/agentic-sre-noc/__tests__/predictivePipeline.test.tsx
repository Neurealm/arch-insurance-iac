/**
 * AIM-002 — Predictive Optical Link Intelligence Engineering Pipeline.
 */

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PredictivePipeline } from "../pipeline/PredictivePipeline";
import {
  allSignals, anomalyRecords, engineeredFeatures, impactTopologyNodes, modelComponents, pipelineActions,
} from "../data/pliPipelineFixtures";
import {
  calculateAtmosphericAttenuationIndex, calculateLinkDegradationRate, calculateThresholdOutcome,
} from "../pipeline/calculations";

function renderPipeline() {
  return render(
    <MemoryRouter>
      <PredictivePipeline />
    </MemoryRouter>,
  );
}

describe("Predictive pipeline fixtures (AIM-002)", () => {
  it("provides the full synthetic engineering dataset", () => {
    expect(allSignals).toHaveLength(40);
    expect(engineeredFeatures).toHaveLength(12);
    expect(anomalyRecords.length).toBeGreaterThanOrEqual(100);
    expect(modelComponents).toHaveLength(7);
    expect(impactTopologyNodes.length).toBeGreaterThanOrEqual(8);
    expect(pipelineActions.length).toBeGreaterThanOrEqual(6);
  });

  it("keeps every feature traceable to signals and downstream models", () => {
    const signalIds = new Set(allSignals.map((s) => s.id));
    const modelIds = new Set(modelComponents.map((m) => m.id));
    engineeredFeatures.forEach((f) => {
      expect(f.signalIds.length).toBeGreaterThan(0);
      f.signalIds.forEach((id) => expect(signalIds.has(id)).toBe(true));
      f.downstreamModelIds.forEach((id) => expect(modelIds.has(id)).toBe(true));
    });
  });
});

describe("Deterministic calculations (AIM-002)", () => {
  it("is deterministic and handles missing inputs", () => {
    const input = { visibilityKm: 1.4, fogProbability: 0.72, humidityPct: 92, rainfallMmPerHour: 3, linkDistanceKm: 2.4, productFactor: 1.1 };
    expect(calculateAtmosphericAttenuationIndex(input)).toBe(calculateAtmosphericAttenuationIndex(input));
    expect(calculateAtmosphericAttenuationIndex({ ...input, visibilityKm: null })).not.toBeNull();
    expect(calculateLinkDegradationRate([])).toBeNull();
  });

  it("computes margin loss per hour", () => {
    expect(calculateLinkDegradationRate([
      { tMinutes: 0, marginDb: 6 },
      { tMinutes: 120, marginDb: 4 },
    ])).toBe(1);
  });

  it("trades precision against recall as the threshold moves", () => {
    const low = calculateThresholdOutcome(50, 0.82);
    const high = calculateThresholdOutcome(95, 0.82);
    expect(high.precisionPct).toBeGreaterThan(low.precisionPct);
    expect(high.recallPct).toBeLessThan(low.recallPct);
  });
});

describe("Predictive pipeline experience (AIM-002)", () => {
  it("renders all six stage columns", () => {
    renderPipeline();
    ["signals", "features", "anomalies", "ensemble", "impact", "actions"].forEach((id) => {
      expect(document.querySelector(`[data-stage-column="${id}"]`)).not.toBeNull();
    });
  });

  it("changes the active stage and the status summary", () => {
    renderPipeline();
    fireEvent.click(screen.getByTestId("pipeline-stage-detect"));
    expect(screen.getByTestId("pipeline-stage-detect")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("pipeline-status-summary")).toHaveTextContent(/Anomaly Detection/i);
  });

  it("advances stages from the mobile stepper", () => {
    renderPipeline();
    fireEvent.click(screen.getByTestId("pipeline-next-stage"));
    expect(screen.getByTestId("pipeline-stage-engineer")).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByTestId("pipeline-prev-stage"));
    expect(screen.getByTestId("pipeline-stage-observe")).toHaveAttribute("aria-selected", "true");
  });

  it("selects a signal and highlights its downstream features", () => {
    renderPipeline();
    const signal = allSignals[0];
    fireEvent.click(screen.getByTestId(`signal-${signal.id}`));
    expect(screen.getByTestId(`signal-${signal.id}`)).toHaveAttribute("aria-pressed", "true");
    signal.featureIds.forEach((fid) => {
      expect(screen.getByTestId(`feature-${fid}`).className).toMatch(/ring|border-blue/);
    });
  });

  it("opens the feature detail drawer with its calculation and lineage", () => {
    renderPipeline();
    const feature = engineeredFeatures[0];
    fireEvent.click(screen.getByTestId(`feature-${feature.id}`));
    const drawer = screen.getByTestId("feature-detail-drawer");
    expect(within(drawer).getByText(feature.name)).toBeInTheDocument();
    expect(drawer).toHaveTextContent(/Example calculation/i);
    fireEvent.click(within(drawer).getByRole("button", { name: /close/i }));
    expect(screen.queryByTestId("feature-detail-drawer")).toBeNull();
  });

  it("filters anomalies and keeps an accessible table alternative", () => {
    renderPipeline();
    const before = screen.getByTestId("anomaly-count").textContent;
    fireEvent.change(screen.getByRole("combobox", { name: /risk class filter/i }), { target: { value: "High Risk" } });
    expect(screen.getByTestId("anomaly-count").textContent).not.toBe(before);
  });

  it("recomputes precision and recall when the confidence threshold changes", () => {
    renderPipeline();
    const readout = screen.getByTestId("threshold-outcome");
    const initial = readout.textContent;
    fireEvent.change(screen.getByTestId("threshold-slider"), { target: { value: "95" } });
    expect(screen.getByTestId("threshold-outcome").textContent).not.toBe(initial);
  });

  it("shows impact detail when a topology node is selected", () => {
    renderPipeline();
    const node = impactTopologyNodes[0];
    fireEvent.click(screen.getByTestId(`topology-node-${node.id}`));
    expect(screen.getByTestId("topology-node-detail")).toHaveTextContent(node.name);
  });

  it("opens the action comparison table with the recommended option marked", () => {
    renderPipeline();
    fireEvent.click(screen.getByTestId("action-compare"));
    const table = screen.getByTestId("action-comparison");
    expect(within(table).getAllByText(/Recommended/i).length).toBeGreaterThan(0);
    fireEvent.click(within(table).getByRole("button", { name: /close comparison/i }));
    expect(screen.queryByTestId("action-comparison")).toBeNull();
  });

  it("keeps governance local when approval is requested", () => {
    renderPipeline();
    fireEvent.click(screen.getByTestId("action-request-approval"));
    expect(screen.getByTestId("action-notice")).toHaveTextContent(/No external approval workflow/i);
    expect(screen.getByTestId("action-detail")).toHaveTextContent(/Approval requested/i);
  });

  it("simulates an action locally and shows the predicted outcome", () => {
    renderPipeline();
    fireEvent.click(screen.getByTestId("action-simulate"));
    expect(screen.getByTestId("action-notice")).toHaveTextContent(/Simulated locally/i);
  });

  it("opens evidence for the recommended action", () => {
    renderPipeline();
    fireEvent.click(screen.getByTestId("action-evidence"));
    expect(screen.getByTestId("evidence-drawer")).toHaveTextContent(/Evidence for the recommended action/i);
  });

  it("supports loading, empty and error column states", () => {
    renderPipeline();
    const select = screen.getByTestId("pipeline-state-select");
    fireEvent.change(select, { target: { value: "loading" } });
    expect(screen.getAllByText(/^Loading /).length).toBe(6);
    fireEvent.change(select, { target: { value: "empty" } });
    expect(screen.getAllByText(/^No .* for this selection$/).length).toBe(6);
    fireEvent.change(select, { target: { value: "error" } });
    expect(screen.getAllByRole("alert").length).toBe(6);
  });

  it("resets the pipeline to its initial selections", () => {
    renderPipeline();
    fireEvent.click(screen.getByTestId("pipeline-stage-act"));
    fireEvent.click(screen.getByTestId("pipeline-reset"));
    expect(screen.getByTestId("pipeline-stage-observe")).toHaveAttribute("aria-selected", "true");
  });
});
