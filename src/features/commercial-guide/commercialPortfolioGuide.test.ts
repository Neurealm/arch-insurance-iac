import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialPortfolioGuide } from "@/features/commercial-guide/content/pages/commercialPortfolio";
import { searchGuide } from "@/features/commercial-guide/guideText";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialPortfolio.tsx", "utf8");

describe("CDT-COMMERCIAL-GUIDE-PORTFOLIO", () => {
  it("resolves page-specific content, not fallback", () => {
    const guide = resolveGuideForRoute("/commercial/portfolio");
    expect(guide?.pageId).toBe("commercial-portfolio");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Portfolio — Account Universe and Data Readiness");
  });

  it("every show-on-page target exists in the Portfolio page source", () => {
    for (const t of commercialPortfolioGuide.showOnPageTargets) {
      expect(PAGE_SRC, `missing target ${t.targetId}`).toContain(`data-guide-target="${t.targetId}"`);
    }
  });

  it("every documented section maps to a real target", () => {
    const known = new Set(commercialPortfolioGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialPortfolioGuide.sections) {
      expect(s.targetId, `section ${s.id} has no target`).toBeTruthy();
      expect(known.has(s.targetId!), `section ${s.id} target unknown`).toBe(true);
    }
  });

  it("records absent surfaces as known gaps rather than page sections", () => {
    const titles = commercialPortfolioGuide.sections.map((s) => s.title.toLowerCase()).join(" | ");
    for (const absent of ["account detail", "filters", "search", "renewal calendar", "icp fit"]) {
      expect(titles).not.toContain(absent);
    }
    const gaps = commercialPortfolioGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    for (const gap of ["filters", "renewal calendar", "icp fit", "segmentation", "risk"]) {
      expect(gaps).toContain(gap);
    }
  });

  it("keeps account data framed as aggregate and estimated, not validated", () => {
    expect(commercialPortfolioGuide.commercialReadiness).toBe("Not Ready");
    expect(commercialPortfolioGuide.modelConfidence).toBe("Low");
    const rules = commercialPortfolioGuide.businessRules.map((r) => `${r.rule} ${r.explanation}`).join(" ").toLowerCase();
    expect(rules).toContain("estimated values must be labelled as estimated".toLowerCase());
    expect(rules).toContain("portfolio totals must reconcile to account-level records".toLowerCase());
    expect(commercialPortfolioGuide.executiveTakeaway.toLowerCase()).toContain("aggregate");
  });

  it("related page routes are registered commercial routes", () => {
    for (const p of commercialPortfolioGuide.relatedPages) {
      expect(p.route === "/commercial" || p.route.startsWith("/commercial/")).toBe(true);
    }
  });

  it("search finds page-specific content", () => {
    expect(searchGuide(commercialPortfolioGuide, "data readiness").length).toBeGreaterThan(0);
    expect(searchGuide(commercialPortfolioGuide, "no-partner").length).toBeGreaterThan(0);
    expect(searchGuide(commercialPortfolioGuide, "zzzznotpresent").length).toBe(0);
  });

  it("covers the required catalogue sizes", () => {
    expect(commercialPortfolioGuide.faqs.length).toBeGreaterThanOrEqual(8);
    expect(commercialPortfolioGuide.commonMistakes.length).toBeGreaterThanOrEqual(8);
    expect(commercialPortfolioGuide.businessRules.length).toBe(12);
    expect(commercialPortfolioGuide.outputs.length).toBe(10);
    expect(commercialPortfolioGuide.inputs.length).toBe(16);
    expect(commercialPortfolioGuide.workflow.length).toBe(12);
    expect(commercialPortfolioGuide.teamActivities.length).toBe(9);
    expect(commercialPortfolioGuide.glossary.length).toBe(12);
    expect(commercialPortfolioGuide.workedExamples.length).toBe(1);
    expect(commercialPortfolioGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });
});
