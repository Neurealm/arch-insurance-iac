import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialTimelinesGuide } from "@/features/commercial-guide/content/pages/commercialTimelines";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialProgramTimeline.tsx", "utf8");
const DATA_SRC = readFileSync("src/data/programTimelineMockData.ts", "utf8");
const SUMMARY_SRC = readFileSync("src/commercial/timeline/ProgramSummaryCards.tsx", "utf8");
const UPCOMING_SRC = readFileSync("src/commercial/timeline/UpcomingMilestoneCard.tsx", "utf8");
const LEGEND_SRC = readFileSync("src/commercial/timeline/TimelineLegend.tsx", "utf8");
const INTEL_SRC = readFileSync("src/commercial/timeline/ScheduleIntelligence.tsx", "utf8");
const GANTT_SRC = readFileSync("src/commercial/timeline/IntegratedTimeline.tsx", "utf8");

/** Literal data-guide-target attributes rendered by the page tree. */
const STATIC_TARGETS: Record<string, string> = {
  "timelines-context": PAGE_SRC,
  "timelines-integrated": PAGE_SRC,
  "timelines-controls": PAGE_SRC,
  "timelines-milestones": PAGE_SRC,
  "timelines-summary": SUMMARY_SRC,
  "timelines-upcoming": UPCOMING_SRC,
  "timelines-legend": LEGEND_SRC,
  "timelines-intelligence": INTEL_SRC,
  "timelines-risks": INTEL_SRC,
  "timelines-dependencies": INTEL_SRC,
  "timelines-insights": INTEL_SRC,
};

/** Lane targets emitted from the group row template. */
const LANE_TARGETS = [
  "timelines-lane-deliverables",
  "timelines-lane-customer",
  "timelines-lane-commercial",
  "timelines-lane-readiness",
];

const ALL_TARGETS = [...Object.keys(STATIC_TARGETS), ...LANE_TARGETS];

describe("CDT-COMMERCIAL-GUIDE-TIMELINES", () => {
  it("resolves page-specific content on the timelines route", () => {
    const guide = resolveGuideForRoute("/commercial/program-timeline");
    expect(guide?.pageId).toBe("commercial-program-timeline");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Timelines — Internal Readiness Behind the Customer Schedule");
  });

  it("uses the exact registered page title and route", () => {
    expect(commercialTimelinesGuide.pageTitle).toBe("Timelines");
    expect(commercialTimelinesGuide.route).toBe("/commercial/program-timeline");
    expect(PAGE_SRC).toContain("Timelines");
  });

  it("declares only targets that exist on the page", () => {
    for (const t of commercialTimelinesGuide.showOnPageTargets) {
      expect(ALL_TARGETS).toContain(t.targetId);
    }
    expect(commercialTimelinesGuide.showOnPageTargets).toHaveLength(ALL_TARGETS.length);
  });

  it("anchors static targets as JSX data-guide-target attributes", () => {
    for (const [target, src] of Object.entries(STATIC_TARGETS)) {
      expect(src).toContain(`data-guide-target="${target}"`);
    }
  });

  it("emits lane targets from the real lane group ids", () => {
    expect(GANTT_SRC).toContain("data-guide-target={`timelines-lane-${row.id}`}");
    for (const id of ["deliverables", "customer", "commercial", "readiness"]) {
      expect(DATA_SRC).toContain(`id: "${id}"`);
    }
  });

  it("maps every section target to a declared show-on-page target", () => {
    const declared = new Set(commercialTimelinesGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialTimelinesGuide.sections) {
      if (s.targetId) expect(declared.has(s.targetId)).toBe(true);
    }
  });

  it("distinguishes Timelines from Program & Timeline explicitly", () => {
    const faq = commercialTimelinesGuide.faqs.find((f) =>
      f.question.toLowerCase().includes("different from program"),
    );
    expect(faq).toBeDefined();
    const answer = faq!.answer.toLowerCase();
    expect(answer).toContain("customer");
    expect(answer).toContain("internal");
    expect(commercialTimelinesGuide.purpose.toLowerCase()).toContain("internal");
    expect(commercialTimelinesGuide.moduleConnection.toLowerCase()).toContain("program");
    const mistakes = commercialTimelinesGuide.commonMistakes.map((m) => m.description.toLowerCase()).join(" | ");
    expect(mistakes).toContain("customer schedule");
  });

  it("describes only activities, milestones and risks the page renders", () => {
    for (const name of [
      "Tooling and Access Provisioning",
      "Team Enablement and Certification",
      "Support Model Activation",
      "Service Transition Readiness",
      "Operational Acceptance",
      "Governance Model Approval",
      "Funding and Activation Approval",
      "Go-Live Readiness",
    ]) {
      expect(DATA_SRC).toContain(name);
    }
    for (const fact of ["2026-06-17", "2026-12-15", "2026-08-31", "2026-12-10"]) {
      expect(DATA_SRC).toContain(fact);
    }
  });

  it("covers the required audiences, lifecycle stages and prerequisites", () => {
    for (const a of ["Delivery", "Operations", "Commercial Lead", "Executive"] as const) {
      expect(commercialTimelinesGuide.audiences).toContain(a);
    }
    for (const s of [
      "Delivery Planning",
      "Mobilization",
      "Execution",
      "Operations",
      "Continuous Improvement",
    ] as const) {
      expect(commercialTimelinesGuide.lifecycleStages).toContain(s);
    }
    expect(commercialTimelinesGuide.prerequisites.length).toBeGreaterThanOrEqual(9);
    const users = commercialTimelinesGuide.ownership.primaryUsers ?? [];
    for (const r of [
      "Program Director",
      "PMO",
      "Delivery Lead",
      "RunOps Lead",
      "SRE Lead",
      "Transition Lead",
      "Staffing Lead",
      "Governance Lead",
      "Customer Success Lead",
      "Executive Sponsor",
    ]) {
      expect(users).toContain(r);
    }
  });

  it("declares ownership across the required roles", () => {
    const o = commercialTimelinesGuide.ownership;
    expect(o.businessOwner).toBe("Program Director");
    expect(o.commercialOwner).toBe("PMO");
    expect(o.technicalOwner).toBe("RunOps Lead");
    expect(o.executiveApprover).toBe("Delivery Executive");
    expect(o.consumersOfOutput).toContain("Governance");
    expect(o.consumersOfOutput).toContain("Overview");
  });

  it("maps the commercial relationship in both directions", () => {
    const r = commercialTimelinesGuide.relationship;
    expect(r.receivesFrom.length).toBeGreaterThanOrEqual(8);
    expect(r.models).toContain("Day 0 activities");
    expect(r.models).toContain("Day 1 stabilization");
    expect(r.models).toContain("Day 2 optimization");
    expect(r.feeds).toContain("Operational acceptance");
    expect(r.feeds).toContain("Cost timing");
  });

  it("answers the required user questions", () => {
    const qs = commercialTimelinesGuide.questionsAnswered.join(" ").toLowerCase();
    for (const fragment of [
      "internally ready",
      "day 0",
      "day 1",
      "handoff",
      "tooling",
      "governance forums",
      "operational acceptance",
      "day 2",
    ]) {
      expect(qs).toContain(fragment);
    }
    expect(commercialTimelinesGuide.questionsAnswered).toHaveLength(8);
  });

  it("states the required business rules", () => {
    const rules = commercialTimelinesGuide.businessRules.map((r) => r.rule.toLowerCase()).join(" | ");
    for (const fragment of [
      "day 1 must not begin without required day 0 readiness",
      "operational acceptance requires evidence",
      "staffing dates must align with role readiness",
      "tooling and access must precede operational responsibility",
      "training and certification must align with assigned roles",
      "governance cadence must begin before major execution",
      "must update the program page",
      "must update p&l and cash",
      "must not mask unresolved day 1 stability issues",
      "milestone completion must reflect actual evidence",
    ]) {
      expect(rules).toContain(fragment);
    }
    expect(commercialTimelinesGuide.businessRules.length).toBeGreaterThanOrEqual(13);
  });

  it("provides the required outputs, workflow and interpretation bands", () => {
    expect(commercialTimelinesGuide.outputs.length).toBeGreaterThanOrEqual(8);
    expect(commercialTimelinesGuide.workflow.length).toBeGreaterThanOrEqual(11);
    expect(commercialTimelinesGuide.workflow.map((w) => w.step)).toEqual(
      commercialTimelinesGuide.workflow.map((_, i) => i + 1),
    );
    expect(commercialTimelinesGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });

  it("includes the tooling-delay worked example with its downstream effects", () => {
    const ex = commercialTimelinesGuide.workedExamples[0];
    expect(ex.title.toLowerCase()).toContain("tooling access");
    const text = `${ex.narrative} ${(ex.steps ?? []).join(" ")} ${ex.result ?? ""}`.toLowerCase();
    for (const fragment of [
      "support model activation",
      "day 1",
      "operational acceptance",
      "escalat",
      "cost",
      "cash",
      "staffing",
    ]) {
      expect(text).toContain(fragment);
    }
  });

  it("covers the required FAQs and glossary terms", () => {
    const questions = commercialTimelinesGuide.faqs.map((f) => f.question.toLowerCase()).join(" | ");
    for (const fragment of [
      "different from program",
      "what is day 0",
      "when does day 1 begin",
      "what is operational acceptance",
      "can day 2 begin before stabilization",
      "who owns internal readiness",
      "how does staffing affect the timeline",
      "which page changes when internal dates move",
    ]) {
      expect(questions).toContain(fragment);
    }
    const terms = commercialTimelinesGuide.glossary.map((g) => g.term);
    for (const t of [
      "Day 0",
      "Day 1",
      "Day 2",
      "Operational Readiness",
      "Early-Life Support",
      "Operational Acceptance",
      "Transition",
      "Stabilization",
      "Governance Cadence",
      "Continuous Improvement",
    ]) {
      expect(terms).toContain(t);
    }
  });

  it("records prototype and Day 0/1/2 modelling gaps honestly", () => {
    const gaps = commercialTimelinesGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    expect(gaps).toContain("no explicit day 0, day 1 or day 2 sections");
    expect(gaps).toContain("early-life support");
    expect(gaps).toContain("simulated");
    expect(commercialTimelinesGuide.dataQuality.changeControl.toLowerCase()).toContain("read-only");
  });

  it("keeps the schedule and mock data unchanged", () => {
    expect(DATA_SRC).toContain('export const MOCK_TODAY = "2026-06-17"');
    expect(DATA_SRC).toContain('export const TIMELINE_START = "2026-06-01"');
    expect(DATA_SRC).toContain('export const TIMELINE_END = "2026-12-31"');
    expect(DATA_SRC).toContain('export const LAST_UPDATED = "June 17, 2026 at 10:30 AM"');
    expect(PAGE_SRC).not.toContain("useMutation(");
    expect(PAGE_SRC).not.toContain("supabase");
  });
});
