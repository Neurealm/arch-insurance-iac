import type { CommercialGuideContent } from "./types";

export type GuideSearchEntry = { group: string; heading: string; body: string };

/** Flattens a guide into searchable entries (headings, content, roles, inputs, outputs, rules, FAQs, glossary). */
export function guideSearchIndex(guide: CommercialGuideContent): GuideSearchEntry[] {
  const entries: GuideSearchEntry[] = [];
  const push = (group: string, heading: string, body?: string) => {
    if (!heading && !body) return;
    entries.push({ group, heading, body: body ?? "" });
  };

  push("Overview", "Why This Page Exists", guide.purpose);
  push("Overview", "What This Page Represents", guide.represents);
  push("Overview", "Why This Matters", guide.whyItMatters);
  push("Overview", "How It Fits Into the Commercial Module", guide.moduleConnection);
  guide.questionsAnswered.forEach((q) => push("Overview", "Questions Answered", q));
  push("Overview", "Expected Outcome", guide.expectedOutcome);
  guide.prerequisites.forEach((p) => push("Overview", "Prerequisites", `${p.label} ${p.detail ?? ""}`));

  guide.sections.forEach((s) => push("How It Works", s.title, s.explanation));
  guide.inputs.forEach((i) => push("Inputs", i.label, `${i.description} ${i.owner ?? ""} ${i.source ?? ""}`));
  guide.outputs.forEach((o) => push("Outputs", o.label, o.description));
  guide.businessRules.forEach((r) => push("Business Rules", r.rule, r.explanation));
  guide.calculationLogic.forEach((c) => push("How It Works", "Calculation and Business Logic", c));
  guide.dataQuality.dataSources.forEach((d) => push("Data", "Data Sources", d));

  guide.workflow.forEach((w) => push("Workflow", w.title, `${w.description} ${w.role ?? ""}`));
  guide.roles.forEach((r) => push("Roles", r.role, r.responsibility));
  guide.raci.forEach((r) =>
    push("RACI", r.activity, r.assignments.map((a) => `${a.role} ${a.raci}`).join(" ")),
  );
  guide.teamActivities.forEach((t) => push("Team Activities", t.activity, `${t.role} ${t.cadence ?? ""}`));
  guide.decisions.forEach((d) => push("Decisions", d.decision, `${d.decidedBy ?? ""} ${d.evidence ?? ""}`));

  guide.interpretation.forEach((i) => push("Interpretation", i.label, `${i.criteria.join(" ")} ${i.action}`));
  guide.commonMistakes.forEach((m) => push("Common Mistakes", m.description, m.correction));
  guide.bestPractices.forEach((b) => push("Best Practices", b, ""));
  guide.workedExamples.forEach((e) => push("Worked Example", e.title, `${e.narrative} ${e.result ?? ""}`));
  guide.faqs.forEach((f) => push("FAQs", f.question, f.answer));
  guide.glossary.forEach((g) => push("Key Terms", g.term, g.definition));
  push("Interpretation", "Executive Takeaway", guide.executiveTakeaway);

  return entries;
}

export function searchGuide(guide: CommercialGuideContent, term: string): GuideSearchEntry[] {
  const q = term.trim().toLowerCase();
  if (q.length < 2) return [];
  return guideSearchIndex(guide).filter(
    (e) => e.heading.toLowerCase().includes(q) || e.body.toLowerCase().includes(q),
  );
}

export function guideToPlainText(guide: CommercialGuideContent): string {
  const lines = [
    guide.guideTitle,
    "Commercial Digital Twin Training",
    `Route: ${guide.route}`,
    `Audience: ${guide.audiences.join(", ")}`,
    `Training level: ${guide.trainingLevel}`,
    `Last updated: ${guide.lastUpdated}`,
    "",
  ];
  for (const entry of guideSearchIndex(guide)) {
    lines.push(`[${entry.group}] ${entry.heading}${entry.body ? `: ${entry.body}` : ""}`);
  }
  return lines.join("\n");
}
