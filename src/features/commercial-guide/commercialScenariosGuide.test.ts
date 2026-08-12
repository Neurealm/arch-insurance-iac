import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialScenariosGuide } from "@/features/commercial-guide/content/pages/commercialScenarios";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialScenarios.tsx", "utf8");

describe("CDT-COMMERCIAL-GUIDE-SCENARIOS", () => {
  it("resolves page-specific content on the scenarios route", () => {
    const guide = resolveGuideForRoute("/commercial/scenarios");
    expect(guide?.pageId).toBe("commercial-scenarios");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Scenarios — Coherent Cases, Not Assembled Preferences");
  });

  it("uses the exact registered page title and route", () => {
    expect(commercialScenariosGuide.pageTitle).toBe("Scenarios");
    expect(commercialScenariosGuide.route).toBe("/commercial/scenarios");
    expect(commercialScenariosGuide.match).toBe("exact");
  });

  it("every show-on-page target exists in the real page source", () => {
    expect(commercialScenariosGuide.showOnPageTargets.length).toBe(8);
    for (const t of commercialScenariosGuide.showOnPageTargets) {
      expect(PAGE_SRC, `missing target ${t.targetId}`).toContain(`"${t.targetId}"`);
      expect(PAGE_SRC).toContain("data-guide-target");
    }
  });

  it("every documented section maps to a declared target", () => {
    const known = new Set(commercialScenariosGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialScenariosGuide.sections) {
      expect(s.targetId, `section ${s.id} has no target`).toBeTruthy();
      expect(known.has(s.targetId!), `section ${s.id} target unknown`).toBe(true);
    }
  });

  it("documents only the three real scenario codes and the baseline concept", () => {
    for (const code of ["CONSERVATIVE", "BASE", "UPSIDE"]) {
      expect(PAGE_SRC).toContain(code);
    }
    expect(PAGE_SRC).toContain("is_baseline");
    const glossaryTerms = commercialScenariosGuide.glossary.map((g) => g.term);
    for (const term of ["Scenario", "Conservative", "Base", "Upside", "Driver", "Enabling Condition", "Planning Case", "Active Scenario", "Scenario Integrity", "Scenario Rationale"]) {
      expect(glossaryTerms).toContain(term);
    }
  });

  it("documents drivers that actually render on the page", () => {
    for (const code of [
      "ACT_RAMP_FY2027",
      "RENEWAL_INFLUENCED_PCT",
      "BASE_RENEWAL_REBATE_PCT",
      "MS_ANNUAL_REV_PER_ACCT_USD",
      "ACTIVATION_FUND_PER_ACCT_USD",
      "L1_L2_SUPPORT_IN_SCOPE",
      "PAYMENT_LAG_DAYS",
    ]) {
      expect(PAGE_SRC).toContain(code);
    }
    expect(commercialScenariosGuide.inputs.length).toBeGreaterThanOrEqual(10);
  });

  it("records absent capabilities as known gaps rather than features", () => {
    const gaps = commercialScenariosGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    for (const gap of ["archive", "owner", "validation", "audit"]) {
      expect(gaps).toContain(gap);
    }
    // No create/duplicate/archive controls exist on the page.
    expect(PAGE_SRC).not.toContain("Duplicate scenario");
    expect(PAGE_SRC).not.toContain("Archive scenario");
  });

  it("covers the required business rules, mistakes, faqs and interpretation bands", () => {
    expect(commercialScenariosGuide.businessRules.length).toBe(12);
    expect(commercialScenariosGuide.commonMistakes.length).toBe(8);
    expect(commercialScenariosGuide.faqs.length).toBe(8);
    expect(commercialScenariosGuide.workflow.length).toBe(12);
    expect(commercialScenariosGuide.workedExamples.length).toBe(1);
    expect(commercialScenariosGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });

  it("states that no financial output is computed on this page", () => {
    expect(PAGE_SRC).toContain("Financial calculation engine planned");
    expect(commercialScenariosGuide.calculationLogic.join(" ")).toMatch(/No financial calculation/i);
  });
});
