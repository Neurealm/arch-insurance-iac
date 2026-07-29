import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialSensitivityGuide } from "@/features/commercial-guide/content/pages/commercialSensitivity";

const LIST_SRC = readFileSync("src/commercial/pages/CommercialSensitivity.tsx", "utf8");
const DETAIL_SRC = readFileSync("src/commercial/pages/CommercialSensitivityDetail.tsx", "utf8");
const PAGE_SRC = `${LIST_SRC}\n${DETAIL_SRC}`;

describe("CDT-COMMERCIAL-GUIDE-SENSITIVITY", () => {
  it("resolves page-specific content on the list and detail routes", () => {
    const guide = resolveGuideForRoute("/commercial/model/sensitivity");
    expect(guide?.pageId).toBe("commercial-sensitivity");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe(
      "Sensitivity Analysis — Which Assumptions Actually Move the Outcome",
    );
    expect(resolveGuideForRoute("/commercial/model/sensitivity/abc")?.pageId).toBe(
      "commercial-sensitivity",
    );
  });

  it("uses the exact registered page title, route and match", () => {
    expect(commercialSensitivityGuide.pageTitle).toBe("Sensitivity Analysis");
    expect(commercialSensitivityGuide.route).toBe("/commercial/model/sensitivity");
    expect(commercialSensitivityGuide.match).toBe("prefix");
    expect(LIST_SRC).toContain("Sensitivity Analysis");
  });

  it("every show-on-page target exists in the real page sources", () => {
    expect(commercialSensitivityGuide.showOnPageTargets.length).toBe(9);
    for (const t of commercialSensitivityGuide.showOnPageTargets) {
      expect(PAGE_SRC, `missing target ${t.targetId}`).toContain(
        `data-guide-target="${t.targetId}"`,
      );
    }
  });

  it("every documented section maps to a declared target", () => {
    const known = new Set(commercialSensitivityGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialSensitivityGuide.sections) {
      expect(s.targetId, `section ${s.id} has no target`).toBeTruthy();
      expect(known.has(s.targetId!), `section ${s.id} target unknown`).toBe(true);
    }
  });

  it("documents only the real strategies, scopes and statuses", () => {
    for (const token of ["increment_list", "value_list", "revenue", "pnl", "cash"]) {
      expect(LIST_SRC).toContain(token);
    }
    for (const status of ["draft", "completed", "failed", "archived"]) {
      expect(DETAIL_SRC).toContain(status);
    }
    const body = JSON.stringify(commercialSensitivityGuide);
    expect(body).toContain("Absolute Values (list)");
    expect(body).toContain("% Increments (list)");
  });

  it("documents only the metrics actually rendered", () => {
    for (const field of [
      "baseline_value",
      "perturbed_value",
      "absolute_delta",
      "percentage_delta",
      "variance_direction",
      "runtime_fingerprint",
      "stale_at_creation",
    ]) {
      expect(DETAIL_SRC).toContain(field);
    }
    // No elasticity measure exists anywhere on the page.
    expect(PAGE_SRC.toLowerCase()).not.toContain("elasticity");
    const gaps = commercialSensitivityGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    expect(gaps).toContain("elasticity");
    expect(gaps).toContain("breakpoint");
    expect(gaps).toContain("multi-variable");
  });

  it("distinguishes sensitivity from scenario comparison", () => {
    const faq = commercialSensitivityGuide.faqs.find((f) =>
      f.question.toLowerCase().includes("different from scenario"),
    );
    expect(faq).toBeTruthy();
    expect(faq!.answer.toLowerCase()).toContain("bundle");
    expect(commercialSensitivityGuide.commonMistakes[0].description.toLowerCase()).toContain(
      "scenario",
    );
  });

  it("states that results never mutate the active model", () => {
    expect(LIST_SRC).toContain("never mutate historical model runs");
    expect(JSON.stringify(commercialSensitivityGuide.businessRules)).toContain(
      "never mutate historical model runs",
    );
  });

  it("covers the required rules, mistakes, faqs, workflow and bands", () => {
    expect(commercialSensitivityGuide.businessRules.length).toBe(12);
    expect(commercialSensitivityGuide.commonMistakes.length).toBe(8);
    expect(commercialSensitivityGuide.faqs.length).toBe(8);
    expect(commercialSensitivityGuide.workflow.length).toBe(12);
    expect(commercialSensitivityGuide.workedExamples.length).toBe(1);
    expect(commercialSensitivityGuide.glossary.length).toBeGreaterThanOrEqual(10);
    expect(commercialSensitivityGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });
});
