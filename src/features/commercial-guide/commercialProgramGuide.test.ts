import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialProgramGuide } from "@/features/commercial-guide/content/pages/commercialProgram";
import { searchGuide } from "@/features/commercial-guide/guideText";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialProgram.tsx", "utf8");

describe("CDT-COMMERCIAL-GUIDE-PROGRAM", () => {
  it("resolves page-specific content, not fallback", () => {
    const guide = resolveGuideForRoute("/commercial/program");
    expect(guide?.pageId).toBe("commercial-program");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Program — Deal Definition and Gate Model");
  });

  it("every show-on-page target exists in the Program page source", () => {
    for (const t of commercialProgramGuide.showOnPageTargets) {
      expect(PAGE_SRC, `missing target ${t.targetId}`).toContain(`data-guide-target="${t.targetId}"`);
    }
  });

  it("every documented section maps to a real target", () => {
    const known = new Set(commercialProgramGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialProgramGuide.sections) {
      expect(s.targetId, `section ${s.id} has no target`).toBeTruthy();
      expect(known.has(s.targetId!), `section ${s.id} target unknown`).toBe(true);
    }
  });

  it("records absent concepts as known gaps rather than page sections", () => {
    const titles = commercialProgramGuide.sections.map((s) => s.title.toLowerCase()).join(" | ");
    for (const absent of ["account universe", "responsibility split", "open decisions", "related documents"]) {
      expect(titles).not.toContain(absent);
    }
    const gaps = commercialProgramGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    expect(gaps).toContain("account universe");
    expect(gaps).toContain("open-decisions");
    expect(gaps).toContain("governance and authority");
  });

  it("keeps commercial terms framed as proposed, never executed", () => {
    const rules = commercialProgramGuide.businessRules.map((r) => `${r.rule} ${r.explanation}`).join(" ").toLowerCase();
    expect(rules).toContain("proposed terms must remain distinguishable from approved terms".toLowerCase());
    expect(commercialProgramGuide.commercialReadiness).toBe("Review Required");
    expect(commercialProgramGuide.executiveTakeaway.toLowerCase()).toContain("proposed");
  });

  it("related page routes are registered commercial routes", () => {
    for (const p of commercialProgramGuide.relatedPages) {
      expect(p.route === "/commercial" || p.route.startsWith("/commercial/")).toBe(true);
    }
  });

  it("search finds page-specific content", () => {
    expect(searchGuide(commercialProgramGuide, "unlock conditions").length).toBeGreaterThan(0);
    expect(searchGuide(commercialProgramGuide, "controlled operator pilot").length).toBeGreaterThan(0);
    expect(searchGuide(commercialProgramGuide, "zzzznotpresent").length).toBe(0);
  });

  it("covers the required catalogue sizes", () => {
    expect(commercialProgramGuide.faqs.length).toBeGreaterThanOrEqual(8);
    expect(commercialProgramGuide.commonMistakes.length).toBeGreaterThanOrEqual(8);
    expect(commercialProgramGuide.businessRules.length).toBe(10);
    expect(commercialProgramGuide.outputs.length).toBe(10);
    expect(commercialProgramGuide.inputs.length).toBe(16);
    expect(commercialProgramGuide.workflow.length).toBe(12);
    expect(commercialProgramGuide.teamActivities.length).toBe(9);
    expect(commercialProgramGuide.glossary.length).toBe(12);
    expect(commercialProgramGuide.workedExamples.length).toBe(1);
    expect(commercialProgramGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });
});
