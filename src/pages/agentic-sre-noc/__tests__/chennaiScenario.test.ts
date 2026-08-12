/**
 * AIM-003 — Chennai Fog Scenario, deterministic model behaviour.
 */

import { describe, expect, it } from "vitest";
import {
  baselineWhatIf, chennaiLinks, DEFAULT_CHENNAI_LINK_ID, getChennaiLink, whatIfPresets,
} from "../chennai/chennaiFixtures";
import { applyPatch, comparePredictions, evaluateChennaiLink, explainChange } from "../chennai/chennaiModel";
import {
  buildOpticalLinksGeoJSON, buildTerminalSitesGeoJSON, buildWeatherRiskZoneGeoJSON,
  isValidChennaiCollection,
} from "../chennai/chennaiGeojson";

const link = getChennaiLink(DEFAULT_CHENNAI_LINK_ID)!;

describe("Chennai scenario model (AIM-003)", () => {
  it("reproduces the published baseline for CHN-MBL-041", () => {
    const p = evaluateChennaiLink(link);
    expect(p.riskProbability).toBeCloseTo(0.94, 2);
    expect(p.confidencePct).toBe(94);
    expect(p.riskClass).toBe("High");
    expect(p.recommendedAction).toBeTruthy();
  });

  it("is deterministic across repeated evaluations", () => {
    for (const l of chennaiLinks) {
      expect(evaluateChennaiLink(l)).toEqual(evaluateChennaiLink(l));
    }
  });

  it("lowers risk under the clear-recovery preset and raises it under dense fog", () => {
    const base = baselineWhatIf(link);
    const clear = whatIfPresets.find((p) => p.id === "clear-recovery")!;
    const dense = whatIfPresets.find((p) => p.id === "dense-fog")!;
    const baseline = evaluateChennaiLink(link);
    const better = evaluateChennaiLink(link, applyPatch(base, clear.patch));
    const worse = evaluateChennaiLink(link, applyPatch(base, dense.patch));
    expect(better.riskProbability).toBeLessThan(baseline.riskProbability);
    expect(worse.riskProbability).toBeGreaterThanOrEqual(baseline.riskProbability);
  });

  it("reduces confidence when telemetry quality degrades", () => {
    const base = baselineWhatIf(link);
    const degraded = whatIfPresets.find((p) => p.id === "degraded-telemetry")!;
    const p = evaluateChennaiLink(link, applyPatch(base, degraded.patch));
    expect(p.confidencePct).toBeLessThan(evaluateChennaiLink(link).confidencePct);
  });

  it("marks the fallback as not ready when headroom collapses", () => {
    const base = baselineWhatIf(link);
    const p = evaluateChennaiLink(link, applyPatch(base, { fallbackHeadroomPct: 8 }));
    expect(p.fallback.state).not.toBe("Ready");
  });

  it("produces a comparison table and a plain-language explanation", () => {
    const base = baselineWhatIf(link);
    const current = evaluateChennaiLink(link);
    const proposed = evaluateChennaiLink(link, applyPatch(base, { visibilityKm: 10.5, fogProbability: 5 }));
    const rows = comparePredictions(current, proposed);
    expect(rows.map((r) => r.key)).toContain("risk");
    expect(rows.every((r) => ["better", "worse", "same"].includes(r.tone))).toBe(true);
    expect(explainChange(current, proposed).length).toBeGreaterThan(20);
  });
});

describe("Chennai GeoJSON (AIM-003)", () => {
  it("emits valid collections with finite coordinates", () => {
    expect(isValidChennaiCollection(buildOpticalLinksGeoJSON())).toBe(true);
    expect(isValidChennaiCollection(buildTerminalSitesGeoJSON())).toBe(true);
    expect(isValidChennaiCollection(buildWeatherRiskZoneGeoJSON())).toBe(true);
  });

  it("emits one line feature per link", () => {
    expect(buildOpticalLinksGeoJSON().features).toHaveLength(chennaiLinks.length);
  });
});
