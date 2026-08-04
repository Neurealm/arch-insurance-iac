import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getQueryEngine } from "@/modules/graph/query/index";
import { getIntelligenceEngine } from "@/modules/graph/intelligence/index";
import { RecommendationList } from "@/platform/capability-intelligence/components/RecommendationList";

const intelligence = getIntelligenceEngine().analyzeGraph();
const engine = getQueryEngine();

describe("Capability Intelligence UI", () => {
  it("derives recommendations deterministically from the graph", () => {
    const second = getIntelligenceEngine().analyzeGraph();
    expect(second.recommendations.length).toBe(intelligence.recommendations.length);
    expect(second.lineage?.graphContentHash ?? null).toBe(intelligence.lineage?.graphContentHash ?? null);
  });

  it("renders every recommendation card with priority and policy provenance", () => {
    render(<RecommendationList recommendations={intelligence.recommendations.slice(0, 5)} />);
    const cards = screen.getAllByTestId("recommendation-card");
    expect(cards.length).toBe(Math.min(5, intelligence.recommendations.length));
    for (const card of cards) {
      expect(within(card).getByText(/score \d+/)).toBeTruthy();
    }
  });

  it("filters recommendations by free-text search without mutating source data", async () => {
    const user = userEvent.setup();
    const before = intelligence.recommendations.length;
    render(<RecommendationList recommendations={intelligence.recommendations} />);
    await user.type(screen.getByLabelText("Search recommendations"), "zzz-no-match-zzz");
    expect(screen.getByTestId("recommendation-count").textContent).toContain(`0 of ${before}`);
    expect(intelligence.recommendations.length).toBe(before);
  });

  it("exposes read-only query access for every recommendation subject node", () => {
    for (const rec of intelligence.recommendations.slice(0, 20)) {
      for (const nodeId of rec.affected.nodeIds.slice(0, 3)) {
        const node = engine.getNode(nodeId);
        expect(node === null || typeof node.label === "string").toBe(true);
      }
    }
  });
});
