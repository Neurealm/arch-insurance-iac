import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialRevenueGuide } from "@/features/commercial-guide/content/pages/commercialRevenue";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialRevenue.tsx", "utf8");

/** Targets applied as literal JSX attributes on the page. */
const STATIC_TARGETS = [
  "revenue-context",
  "revenue-summary",
  "revenue-by-scenario",
];
/** Targets passed through typed props / row definitions. */
const PROP_TARGETS = [
  "revenue-drivers",
  "revenue-base",
  "revenue-by-stream",
  "revenue-by-period",
  "revenue-renewal",
  "revenue-expansion",
  "revenue-services",
  "revenue-funding",
  "revenue-detail",
];

describe("CDT-COMMERCIAL-GUIDE-REVENUE", () => {
  it("resolves page-specific content on the revenue route", () => {
    const guide = resolveGuideForRoute("/commercial/model/revenue");
    expect(guide?.pageId).toBe("commercial-revenue");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Revenue — Where Neurealm's Money Actually Comes From");
  });

  it("uses the exact registered page title and route", () => {
    expect(commercialRevenueGuide.pageTitle).toBe("Revenue");
    expect(commercialRevenueGuide.route).toBe("/commercial/model/revenue");
    expect(PAGE_SRC).toContain("Project Momentous — Revenue Engine");
  });

  it("every show-on-page target exists in the real page source", () => {
    expect(commercialRevenueGuide.showOnPageTargets.length).toBe(12);
    const declared = commercialRevenueGuide.showOnPageTargets.map((t) => t.targetId);
    expect(new Set(declared).size).toBe(declared.length);
    for (const t of STATIC_TARGETS) {
      expect(declared).toContain(t);
      expect(PAGE_SRC, `missing target ${t}`).toContain(`data-guide-target="${t}"`);
    }
    for (const t of PROP_TARGETS) {
      expect(declared).toContain(t);
      expect(PAGE_SRC, `missing target ${t}`).toContain(`"${t}"`);
    }
    // The anchors are wired through real attributes / props, not decoration.
    expect(PAGE_SRC).toContain("data-guide-target={targetId}");
    expect(PAGE_SRC).toContain("data-guide-target={periodTargetId}");
    expect(PAGE_SRC).toContain("data-guide-target={r.target}");
  });

  it("every documented section maps to a declared target", () => {
    const known = new Set(commercialRevenueGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialRevenueGuide.sections) {
      expect(s.targetId, `section ${s.id} has no target`).toBeTruthy();
      expect(known.has(s.targetId!), `section ${s.id} target unknown`).toBe(true);
    }
  });

  it("documents only the revenue streams that actually exist", () => {
    for (const code of [
      "REV-01-BASE-REB",
      "REV-02-MKT-REB",
      "REV-03-NFLEX-REB",
      "REV-04-FLEX-REB",
      "REV-05-GROWTH-ACCEL",
      "REV-06-GROWTH-SHARE",
      "REV-07-ACT-FUND",
      "REV-08-MDF",
      "REV-09-SUP-READ",
      "REV-10-MS",
      "REV-11-PS",
      "REV-TOTAL",
    ]) {
      expect(PAGE_SRC, `stream ${code} missing from page`).toContain(code);
    }
    const body = JSON.stringify(commercialRevenueGuide);
    for (const phrase of [
      "influenced renewal",
      "Activation Fund",
      "MDF",
      "Support Readiness",
      "Managed",
      "professional services",
      "growth-share",
    ]) {
      expect(body.toLowerCase()).toContain(phrase.toLowerCase());
    }
    // No invented streams.
    for (const invented of ["subscription resale", "hardware", "royalty"]) {
      expect(body.toLowerCase()).not.toContain(invented);
    }
  });

  it("documents only the volume drivers and base rows that render", () => {
    for (const code of [
      "VOL-CUM-ACT",
      "VOL-NEW-ACT",
      "VOL-CONV-REBATE",
      "VOL-CONV-EXPAND",
      "VOL-CONV-MS",
      "REV-ACT-ARR",
      "REV-INCR-ARR",
      "REV-NEW-ACT-ARR",
      "REV-EAR-INFLUENCED",
    ]) {
      expect(PAGE_SRC).toContain(code);
    }
    for (const fy of ["FY2027", "FY2031"]) expect(PAGE_SRC).toContain(fy);
  });

  it("records the real gaps rather than inventing capability", () => {
    const gaps = commercialRevenueGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    expect(gaps).toContain("cohort");
    expect(gaps).toContain("trend chart");
    expect(gaps).toContain("concentration");
    expect(gaps).toContain("revenue-at-risk");
    // The page renders no chart and no account-level revenue breakdown.
    expect(PAGE_SRC.toLowerCase()).not.toContain("recharts");
  });

  it("separates ARR from Neurealm revenue and recognition from cash", () => {
    const arrFaq = commercialRevenueGuide.faqs.find((f) =>
      f.question.toLowerCase().includes("portfolio arr"),
    );
    expect(arrFaq).toBeTruthy();
    const rules = JSON.stringify(commercialRevenueGuide.businessRules).toLowerCase();
    expect(rules).toContain("portfolio arr is not neurealm revenue");
    expect(rules).toContain("revenue recognition is not cash receipt");
    expect(rules).toContain("not double counted");
  });

  it("covers the required rules, mistakes, faqs, workflow and bands", () => {
    expect(commercialRevenueGuide.businessRules.length).toBe(15);
    expect(commercialRevenueGuide.commonMistakes.length).toBe(8);
    expect(commercialRevenueGuide.faqs.length).toBe(8);
    expect(commercialRevenueGuide.workflow.length).toBe(13);
    expect(commercialRevenueGuide.workedExamples.length).toBe(1);
    expect(commercialRevenueGuide.glossary.length).toBeGreaterThanOrEqual(10);
    expect(commercialRevenueGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });
});
