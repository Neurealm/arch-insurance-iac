/**
 * Stage 3.5.4.2.2 — presentation-layer warning deduplication and announcement
 * summarisation.
 *
 * These tests exercise the pure utility only. They prove that identical engine
 * warnings collapse to one card, that materially different warnings never
 * collapse, that ordering is deterministic and input-order independent for
 * semantically identical input, and that the input is never mutated.
 */

import { describe, it, expect } from "vitest";
import type { QueryWarning } from "@/modules/graph/query/index";
import {
  GRAPH_WARNINGS_CLEARED_ANNOUNCEMENT,
  deduplicateGraphWarnings,
  graphWarningSetSignature,
  nextWarningAnnouncement,
  graphWarningIdentity,
  presentGraphWarnings,
  summarizeGraphWarningsForAnnouncement,
} from "./graph/graphWarnings";
import type { GraphView } from "./graph/graphViewTypes";

/** Minimal graph-view stub: only the fields the warning presenter reads. */
function viewWith(warnings: QueryWarning[], depth = 2): GraphView {
  return {
    request: { direction: "both", depth, edgeTypes: [], includeCandidates: false },
    warnings,
  } as unknown as GraphView;
}

const depthWarning: QueryWarning = {
  code: "depth-limit-reached",
  message: "Traversal stopped at depth 2.",
};
const emptyWarning: QueryWarning = {
  code: "empty-result",
  message: "No relationships matched.",
  subject: "capability:alpha",
};

describe("Stage 3.5.4.2.2 — warning identity", () => {
  it("treats code, subject and message as the identity", () => {
    expect(graphWarningIdentity(depthWarning)).toBe(graphWarningIdentity({ ...depthWarning }));
    expect(graphWarningIdentity(depthWarning)).not.toBe(
      graphWarningIdentity({ ...depthWarning, subject: "capability:alpha" }),
    );
    expect(graphWarningIdentity(depthWarning)).not.toBe(
      graphWarningIdentity({ ...depthWarning, message: "Traversal stopped at depth 3." }),
    );
  });
});

describe("Stage 3.5.4.2.2 — deduplication", () => {
  it("collapses duplicate depth warnings from both traversal branches to one", () => {
    const out = deduplicateGraphWarnings([depthWarning, { ...depthWarning }]);
    expect(out).toHaveLength(1);
    expect(out[0].occurrences).toBe(2);
    expect(out[0].warning.code).toBe("depth-limit-reached");
  });

  it("collapses duplicate empty-result warnings to one", () => {
    const out = deduplicateGraphWarnings([emptyWarning, { ...emptyWarning }]);
    expect(out).toHaveLength(1);
    expect(out[0].occurrences).toBe(2);
  });

  it("keeps the same code with different subjects separate", () => {
    const out = deduplicateGraphWarnings([
      { ...emptyWarning, subject: "capability:alpha" },
      { ...emptyWarning, subject: "capability:beta" },
    ]);
    expect(out).toHaveLength(2);
    expect(out.map((o) => o.warning.subject)).toEqual(["capability:alpha", "capability:beta"]);
    expect(out.every((o) => o.occurrences === 1)).toBe(true);
  });

  it("keeps the same code with different messages separate", () => {
    const out = deduplicateGraphWarnings([
      depthWarning,
      { ...depthWarning, message: "Traversal stopped at depth 3." },
    ]);
    expect(out).toHaveLength(2);
  });

  it("keeps the same code with materially different metadata separate", () => {
    const out = deduplicateGraphWarnings([
      { code: "results-truncated", message: "Truncated at 200 relationships.", subject: "edges" },
      { code: "results-truncated", message: "Truncated at 100 entities.", subject: "nodes" },
    ]);
    expect(out).toHaveLength(2);
    expect(out.map((o) => o.warning.subject)).toEqual(["edges", "nodes"]);
  });

  it("collapses many identical warnings deterministically", () => {
    const many = Array.from({ length: 5 }, () => ({ ...depthWarning }));
    const first = deduplicateGraphWarnings(many);
    const second = deduplicateGraphWarnings(many);
    expect(first).toHaveLength(1);
    expect(first[0].occurrences).toBe(5);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("preserves the documented ordering policy across all warning types", () => {
    const out = deduplicateGraphWarnings([
      emptyWarning,
      { code: "candidate-relationships-included", message: "Candidates included." },
      { code: "path-limit-reached", message: "Path limit." },
      depthWarning,
      { code: "results-truncated", message: "Truncated." },
    ]);
    expect(out.map((o) => o.warning.code)).toEqual([
      "results-truncated",
      "depth-limit-reached",
      "path-limit-reached",
      "candidate-relationships-included",
      "empty-result",
    ]);
  });

  it("is independent of input order for semantically identical input", () => {
    const a = [depthWarning, { ...depthWarning }, emptyWarning];
    const b = [emptyWarning, { ...depthWarning }, depthWarning];
    expect(deduplicateGraphWarnings(a).map((o) => graphWarningIdentity(o.warning))).toEqual(
      deduplicateGraphWarnings(b).map((o) => graphWarningIdentity(o.warning)),
    );
  });

  it("does not mutate the input array or its warnings", () => {
    const input = [depthWarning, { ...depthWarning }, emptyWarning];
    const snapshot = JSON.stringify(input);
    deduplicateGraphWarnings(input);
    presentGraphWarnings(viewWith(input));
    expect(JSON.stringify(input)).toBe(snapshot);
    expect(input).toHaveLength(3);
  });

  it("returns an empty list when the warning conditions clear", () => {
    expect(deduplicateGraphWarnings([])).toEqual([]);
    expect(presentGraphWarnings(viewWith([]))).toEqual([]);
  });

  it("preserves the canonical code, message, subject, explanation and actions", () => {
    const [presented] = presentGraphWarnings(viewWith([depthWarning, { ...depthWarning }]));
    expect(presented.code).toBe("depth-limit-reached");
    expect(presented.detail).toBe(depthWarning.message);
    expect(presented.occurrences).toBe(2);
    expect(presented.title).toBe("Depth limit reached");
    expect(presented.explanation).toContain("depth 2");
    expect(presented.actions.length).toBeGreaterThan(0);
  });

  it("produces stable render keys for identical input", () => {
    const a = presentGraphWarnings(viewWith([depthWarning, emptyWarning]));
    const b = presentGraphWarnings(viewWith([depthWarning, emptyWarning]));
    expect(a.map((w) => w.key)).toEqual(b.map((w) => w.key));
    expect(new Set(a.map((w) => w.key)).size).toBe(a.length);
  });
});

describe("Stage 3.5.4.2.2 — announcement summary", () => {
  it("returns nothing when there are no warnings", () => {
    expect(summarizeGraphWarningsForAnnouncement([])).toBe("");
  });

  it("announces a single warning concisely", () => {
    const warnings = presentGraphWarnings(viewWith([depthWarning]));
    expect(summarizeGraphWarningsForAnnouncement(warnings)).toBe(
      "Graph warning. The view stops at depth 2 and may not show the complete relationship chain.",
    );
  });

  it("announces duplicate input as one condition", () => {
    const single = summarizeGraphWarningsForAnnouncement(presentGraphWarnings(viewWith([depthWarning])));
    const doubled = summarizeGraphWarningsForAnnouncement(
      presentGraphWarnings(viewWith([depthWarning, { ...depthWarning }])),
    );
    expect(doubled).toBe(single);
    expect(doubled).not.toContain("2 warnings");
  });

  it("announces multiple unique warnings with a count and joined clauses", () => {
    const warnings = presentGraphWarnings(
      viewWith([depthWarning, { code: "candidate-relationships-included", message: "Candidates." }]),
    );
    expect(summarizeGraphWarningsForAnnouncement(warnings)).toBe(
      "Graph updated with 2 warnings. The view stops at depth 2 and may not show the complete relationship chain and candidate relationships are included.",
    );
  });

  it("joins three or more clauses readably", () => {
    const warnings = presentGraphWarnings(
      viewWith([
        { code: "results-truncated", message: "Truncated." },
        depthWarning,
        { code: "candidate-relationships-included", message: "Candidates." },
      ]),
    );
    const text = summarizeGraphWarningsForAnnouncement(warnings);
    expect(text.startsWith("Graph updated with 3 warnings.")).toBe(true);
    expect(text).toContain(", ");
    expect(text).toContain(" and candidate relationships are included.");
  });

  it("is deterministic for identical input", () => {
    const warnings = presentGraphWarnings(viewWith([depthWarning, emptyWarning]));
    expect(summarizeGraphWarningsForAnnouncement(warnings)).toBe(
      summarizeGraphWarningsForAnnouncement(warnings),
    );
  });

  it("exposes a single cleared message", () => {
    expect(GRAPH_WARNINGS_CLEARED_ANNOUNCEMENT).toBe("Graph warnings cleared.");
  });
});

describe("Stage 3.5.4.2.2 — announcement transitions", () => {
  const depthSet = presentGraphWarnings(viewWith([depthWarning, { ...depthWarning }]));
  const twoSet = presentGraphWarnings(
    viewWith([depthWarning, { code: "candidate-relationships-included", message: "Candidates." }]),
  );

  it("announces nothing on first render when there are no warnings", () => {
    const next = nextWarningAnnouncement(null, []);
    expect(next.changed).toBe(true);
    expect(next.announcement).toBe("");
  });

  it("announces the summary when warnings first appear", () => {
    const next = nextWarningAnnouncement(null, depthSet);
    expect(next.changed).toBe(true);
    expect(next.announcement).toBe(summarizeGraphWarningsForAnnouncement(depthSet));
  });

  it("does not re-announce an unchanged warning set", () => {
    const signature = graphWarningSetSignature(depthSet);
    const next = nextWarningAnnouncement(signature, depthSet);
    expect(next.changed).toBe(false);
    expect(next.announcement).toBe("");
  });

  it("re-announces when the warning set materially changes", () => {
    const next = nextWarningAnnouncement(graphWarningSetSignature(depthSet), twoSet);
    expect(next.changed).toBe(true);
    expect(next.announcement).toContain("Graph updated with 2 warnings.");
  });

  it("announces the cleared message exactly once when warnings clear", () => {
    const cleared = nextWarningAnnouncement(graphWarningSetSignature(depthSet), []);
    expect(cleared.changed).toBe(true);
    expect(cleared.announcement).toBe(GRAPH_WARNINGS_CLEARED_ANNOUNCEMENT);
    // A subsequent render with the same (empty) set is silent.
    const again = nextWarningAnnouncement(cleared.signature, []);
    expect(again.changed).toBe(false);
    expect(again.announcement).toBe("");
  });

  it("does not announce cleared for a view that never had warnings", () => {
    const first = nextWarningAnnouncement(null, []);
    expect(first.announcement).toBe("");
    const second = nextWarningAnnouncement(first.signature, []);
    expect(second.changed).toBe(false);
  });

  it("treats a duplicate-only change as no change at all", () => {
    const once = presentGraphWarnings(viewWith([depthWarning]));
    const twice = presentGraphWarnings(viewWith([depthWarning, { ...depthWarning }]));
    expect(graphWarningSetSignature(once)).toBe(graphWarningSetSignature(twice));
    expect(nextWarningAnnouncement(graphWarningSetSignature(once), twice).changed).toBe(false);
  });
});
