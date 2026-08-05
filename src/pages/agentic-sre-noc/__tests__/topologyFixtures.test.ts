import { describe, expect, it } from "vitest";
import { customerServices, DEFAULT_SERVICE_ID } from "../data/cshFixtures";
import {
  blastRadius, buildTopology, CALIFORNIA_SERVICE_ID, dependencyScenario, ownershipMatrix,
  relationshipRows, resiliencePaths, topologyKpis, topologyOverlays,
} from "../data/topologyFixtures";

const chennai = customerServices.find((s) => s.id === DEFAULT_SERVICE_ID)!;
const california = customerServices.find((s) => s.id === CALIFORNIA_SERVICE_ID)!;

describe("topology fixtures", () => {
  it("builds a ten stage end to end chain", () => {
    const g = buildTopology(chennai);
    expect(g.chain).toHaveLength(10);
    g.chain.forEach((id) => expect(g.nodes.some((n) => n.id === id)).toBe(true));
  });

  it("resolves every edge endpoint to a node", () => {
    const g = buildTopology(chennai);
    const ids = new Set(g.nodes.map((n) => n.id));
    g.edges.forEach((e) => { expect(ids.has(e.from)).toBe(true); expect(ids.has(e.to)).toBe(true); });
  });

  it("models healthy terminals with an unavailable upstream handoff for California", () => {
    const g = buildTopology(california);
    expect(g.nodes.find((n) => n.id === "t-terminal-a")!.health).toBe("Healthy");
    expect(g.nodes.find((n) => n.id === "t-optical")!.health).toBe("Healthy");
    expect(g.nodes.find((n) => n.id === "t-handoff")!.health).toBe("Unavailable");
    expect(g.nodes.find((n) => n.id === "t-service")!.health).toBe("Unavailable");
  });

  it("produces a deterministic blast radius", () => {
    const g = buildTopology(chennai);
    const b = blastRadius("t-optical", chennai, g);
    const map = Object.fromEntries(b.rows);
    expect(map["Customers affected"]).toBe("1 customer");
    expect(map["Committed capacity at risk"]).toBe("10 Gbps");
    expect(map["Downstream users exposed"]).toContain("42,000");
    expect(b.recoveryPath).toContain("RF fallback available");
  });

  it("exposes eight KPIs and eight scorecard values", () => {
    expect(topologyKpis).toHaveLength(8);
    expect(topologyKpis.map((k) => k.value)).toContain("1,248");
  });

  it("lists resilience paths and relationship rows", () => {
    const g = buildTopology(chennai);
    expect(resiliencePaths(chennai).length).toBeGreaterThanOrEqual(5);
    expect(relationshipRows(g).length).toBe(g.edges.length);
  });

  it("carries the twelve stage dependency scenario and the ownership gap", () => {
    expect(dependencyScenario).toHaveLength(12);
    expect(dependencyScenario.some((s) => s.requiresApproval)).toBe(true);
    expect(ownershipMatrix.some((r) => r.escalationOwner === "Not assigned")).toBe(true);
    expect(topologyOverlays.some((o) => o.category === "Ownership gaps")).toBe(true);
  });
});
