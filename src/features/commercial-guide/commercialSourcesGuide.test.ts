import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialSourcesGuide } from "@/features/commercial-guide/content/pages/commercialSources";
import { searchGuide } from "@/features/commercial-guide/guideText";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialSources.tsx", "utf8");

describe("CDT-COMMERCIAL-GUIDE-SOURCES", () => {
  it("resolves page-specific content, not fallback", () => {
    const guide = resolveGuideForRoute("/commercial/sources");
    expect(guide?.pageId).toBe("commercial-sources");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Sources — Evidence, Provenance and Confidence");
  });

  it("every show-on-page target exists in the Sources page source", () => {
    for (const t of commercialSourcesGuide.showOnPageTargets) {
      expect(PAGE_SRC, `missing target ${t.targetId}`).toContain(`data-guide-target="${t.targetId}"`);
    }
  });

  it("every documented section maps to a real target", () => {
    const known = new Set(commercialSourcesGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialSourcesGuide.sections) {
      expect(s.targetId, `section ${s.id} has no target`).toBeTruthy();
      expect(known.has(s.targetId!), `section ${s.id} target unknown`).toBe(true);
    }
  });

  it("records absent attributes as known gaps rather than page sections", () => {
    const titles = commercialSourcesGuide.sections.map((s) => s.title.toLowerCase()).join(" | ");
    for (const absent of ["lineage", "conflict", "filters", "detail view", "last updated"]) {
      expect(titles).not.toContain(absent);
    }
    const gaps = commercialSourcesGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    for (const gap of ["owner", "version", "confidence", "conflict", "lineage", "search or filters"]) {
      expect(gaps).toContain(gap);
    }
  });

  it("states the metadata-only, no-storage posture", () => {
    const gaps = commercialSourcesGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    expect(gaps).toContain("no document storage");
    expect(gaps).toContain("metadata only");
    expect(commercialSourcesGuide.executiveTakeaway.toLowerCase()).toContain("metadata only");
  });

  it("keeps draft, approved and superseded evidence distinct", () => {
    const rules = commercialSourcesGuide.businessRules.map((r) => `${r.rule} ${r.explanation}`).join(" ").toLowerCase();
    expect(rules).toContain("draft documents must not be represented as executed agreements".toLowerCase());
    expect(rules).toContain("superseded sources remain traceable".toLowerCase());
    expect(rules).toContain("newer does not automatically mean more authoritative".toLowerCase());
    expect(commercialSourcesGuide.commercialReadiness).toBe("Review Required");
  });

  it("related page routes are registered commercial routes", () => {
    for (const p of commercialSourcesGuide.relatedPages) {
      expect(p.route === "/commercial" || p.route.startsWith("/commercial/")).toBe(true);
    }
  });

  it("search finds page-specific content", () => {
    expect(searchGuide(commercialSourcesGuide, "provenance").length).toBeGreaterThan(0);
    expect(searchGuide(commercialSourcesGuide, "superseded").length).toBeGreaterThan(0);
    expect(searchGuide(commercialSourcesGuide, "zzzznotpresent").length).toBe(0);
  });

  it("covers the required catalogue sizes", () => {
    expect(commercialSourcesGuide.faqs.length).toBeGreaterThanOrEqual(8);
    expect(commercialSourcesGuide.commonMistakes.length).toBeGreaterThanOrEqual(8);
    expect(commercialSourcesGuide.businessRules.length).toBe(10);
    expect(commercialSourcesGuide.outputs.length).toBe(8);
    expect(commercialSourcesGuide.inputs.length).toBe(16);
    expect(commercialSourcesGuide.workflow.length).toBe(12);
    expect(commercialSourcesGuide.teamActivities.length).toBe(9);
    expect(commercialSourcesGuide.glossary.length).toBe(12);
    expect(commercialSourcesGuide.workedExamples.length).toBe(1);
    expect(commercialSourcesGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });
});
