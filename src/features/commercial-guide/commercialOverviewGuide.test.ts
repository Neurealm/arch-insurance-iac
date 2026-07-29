import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialOverviewGuide } from "@/features/commercial-guide/content/pages/commercialOverview";
import { searchGuide, guideToPlainText } from "@/features/commercial-guide/guideText";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialOverview.tsx", "utf8");

describe("CDT-COMMERCIAL-GUIDE-OVERVIEW", () => {
  it("resolves page-specific content, not fallback", () => {
    const guide = resolveGuideForRoute("/commercial");
    expect(guide?.pageId).toBe("commercial-overview");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Overview — Consolidated Commercial View");
  });

  it("every show-on-page target exists in the Overview page source", () => {
    for (const t of commercialOverviewGuide.showOnPageTargets) {
      expect(PAGE_SRC, `missing target ${t.targetId}`).toContain(`data-guide-target="${t.targetId}"`);
    }
  });

  it("every documented section maps to a real target", () => {
    const known = new Set(commercialOverviewGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialOverviewGuide.sections) {
      expect(s.targetId, `section ${s.id} has no target`).toBeTruthy();
      expect(known.has(s.targetId!), `section ${s.id} target unknown`).toBe(true);
    }
  });

  it("does not describe sections that are absent from the page", () => {
    const text = guideToPlainText(commercialOverviewGuide).toLowerCase();
    // These live only in knownGaps / negative statements, never as a documented section.
    const sectionTitles = commercialOverviewGuide.sections.map((s) => s.title.toLowerCase()).join(" | ");
    for (const absent of ["scenario selector", "cash health", "staffing readiness", "risk register", "recent changes"]) {
      expect(sectionTitles).not.toContain(absent);
    }
    expect(text).toContain("no cash or sustainability indicator on overview");
  });

  it("related page routes are registered commercial routes", () => {
    for (const p of commercialOverviewGuide.relatedPages) {
      expect(p.route.startsWith("/commercial/")).toBe(true);
    }
  });

  it("supports all three guide modes and admin-only data quality content", () => {
    expect(commercialOverviewGuide.modes).toEqual(["executive", "practitioner", "administrator"]);
    expect(commercialOverviewGuide.executiveTakeaway.length).toBeGreaterThan(50);
    expect(commercialOverviewGuide.dataQuality.knownGaps.length).toBeGreaterThan(0);
  });

  it("search finds page-specific content", () => {
    expect(searchGuide(commercialOverviewGuide, "baseline").length).toBeGreaterThan(0);
    expect(searchGuide(commercialOverviewGuide, "gate progression").length).toBeGreaterThan(0);
    expect(searchGuide(commercialOverviewGuide, "zzzznotpresent").length).toBe(0);
  });

  it("covers the required catalogue sizes", () => {
    expect(commercialOverviewGuide.faqs.length).toBeGreaterThanOrEqual(8);
    expect(commercialOverviewGuide.commonMistakes.length).toBeGreaterThanOrEqual(8);
    expect(commercialOverviewGuide.raci.length).toBe(6);
    expect(commercialOverviewGuide.workflow.length).toBe(10);
    expect(commercialOverviewGuide.glossary.length).toBe(8);
    expect(commercialOverviewGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });
});
