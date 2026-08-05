import { describe, expect, it } from "vitest";
import { links } from "../data/goocFixtures";
import { customerServices } from "../data/cshFixtures";
import {
  chennaiForecast, FEATURED_RISK_ID, predictedLinkRisks, predictiveAgents,
  predictiveScenario, preventiveActions,
} from "../data/plrFixtures";

describe("Predictive Link Risk Center fixtures", () => {
  it("reuses existing optical link identifiers", () => {
    const ids = new Set(links.map((l) => l.id));
    predictedLinkRisks.forEach((r) => expect(ids.has(r.linkId)).toBe(true));
  });

  it("reuses existing customer service identifiers", () => {
    const ids = new Set(customerServices.map((s) => s.id));
    predictedLinkRisks.forEach((r) => expect(ids.has(r.serviceId)).toBe(true));
  });

  it("features the Chennai fog risk with the documented scenario values", () => {
    const featured = predictedLinkRisks.find((r) => r.id === FEATURED_RISK_ID);
    expect(featured).toBeDefined();
    expect(featured?.linkId).toBe("lnk-chennai-041");
    expect(featured?.capacityGbps).toBe(10);
    expect(featured?.product).toBe("Lightbridge Pro");
    expect(featured?.rank).toBe(1);
  });

  it("ranks risks uniquely", () => {
    const ranks = predictedLinkRisks.map((r) => r.rank);
    expect(new Set(ranks).size).toBe(ranks.length);
  });

  it("forecasts margin falling below the 4 dB threshold within six hours", () => {
    const at6 = chennaiForecast.find((p) => p.hour === 6);
    expect(at6).toBeDefined();
    expect(at6!.margin).toBeLessThan(4);
    expect(chennaiForecast.find((p) => p.hour === 0)!.margin).toBeGreaterThan(9);
  });

  it("recommends exactly one preventive action requiring approval", () => {
    const recommended = preventiveActions.filter((a) => a.recommended);
    expect(recommended).toHaveLength(1);
    expect(recommended[0].automation).toBe("Approval required");
  });

  it("gates the scenario on a human approval stage", () => {
    expect(predictiveScenario).toHaveLength(14);
    expect(predictiveScenario.filter((s) => s.requiresApproval)).toHaveLength(1);
  });

  it("lists ten predictive digital coworkers with unique ids", () => {
    expect(predictiveAgents).toHaveLength(10);
    expect(new Set(predictiveAgents.map((a) => a.id)).size).toBe(10);
  });
});
