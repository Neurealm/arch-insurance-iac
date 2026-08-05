import { describe, expect, it } from "vitest";
import {
  buildCustomerImpactGeoJSON, buildFallbackRoutesGeoJSON, buildIncidentsGeoJSON, buildMapSummary,
  buildOpticalLinksGeoJSON, buildRegionsGeoJSON, buildRisksGeoJSON, buildServiceCorridorsGeoJSON,
  buildSitesGeoJSON, greatCircle, isValidCoordinate, isValidPath, summaryText,
} from "../adapters";
import {
  CALLOUT_REGION_IDS, ESTATE_CORRIDORS, ESTATE_FALLBACK_ROUTES, ESTATE_INCIDENTS,
  ESTATE_OPTICAL_LINKS, ESTATE_REGIONS, ESTATE_RISKS, ESTATE_SITES, TABLET_CALLOUT_REGION_IDS,
  type EstateOpticalLink, type EstateRegion, type EstateSite,
} from "../estate";
import {
  DEFAULT_LAYER_VISIBILITY, LAYER_GROUPS, LAYER_ORDER, linkLayerGroup, linkLayers, withVisibility,
} from "../layers";
import { LEGEND_ENTRIES } from "../MapLegend";

describe("GLHM-MAP-002 curated estate", () => {
  it("models ten curated operating regions with summary data", () => {
    expect(ESTATE_REGIONS).toHaveLength(10);
    const chennai = ESTATE_REGIONS.find((r) => r.id === "REG-CHN")!;
    expect(chennai.health).toBe("At Risk");
    expect(chennai.linkCount).toBe(38);
    expect(chennai.capacityGbps).toBe(340);
    expect(chennai.atRiskCount).toBe(3);
  });

  it("renders a controlled visual density", () => {
    expect(ESTATE_OPTICAL_LINKS.length).toBeGreaterThanOrEqual(28);
    expect(ESTATE_OPTICAL_LINKS.length).toBeLessThanOrEqual(45);
    expect(ESTATE_CORRIDORS.length).toBeGreaterThanOrEqual(22);
    expect(ESTATE_CORRIDORS.length).toBeLessThanOrEqual(35);
    expect(ESTATE_SITES.length).toBeGreaterThanOrEqual(20);
    expect(ESTATE_SITES.length).toBeLessThanOrEqual(35);
    expect(ESTATE_FALLBACK_ROUTES.length).toBeGreaterThanOrEqual(6);
    expect(ESTATE_FALLBACK_ROUTES.length).toBeLessThanOrEqual(10);
    expect(ESTATE_RISKS.length).toBeGreaterThanOrEqual(6);
    expect(ESTATE_RISKS.length).toBeLessThanOrEqual(10);
    expect(ESTATE_INCIDENTS.length).toBeGreaterThanOrEqual(3);
    expect(ESTATE_INCIDENTS.length).toBeLessThanOrEqual(5);
    expect(ESTATE_OPTICAL_LINKS.filter((l) => l.status === "maintenance").length).toBeGreaterThanOrEqual(3);
  });

  it("preserves stable synthetic identifiers", () => {
    for (const id of ["CHN-MBL-041", "MUM-DC-012", "NBO-ISP-021", "RIO-MESH-023", "CAL-DCI-012", "LON-ENT-003", "JNB-ISP-033", "DXB-ENT-009", "SEA-MBL-016", "CAF-RVR-004"]) {
      expect(ESTATE_OPTICAL_LINKS.some((l) => l.id === id)).toBe(true);
    }
    const chn = ESTATE_OPTICAL_LINKS.find((l) => l.id === "CHN-MBL-041")!;
    expect(chn.terminalAId).toBe("TRM-CHN-A041");
    expect(chn.terminalBId).toBe("TRM-CHN-B041");
  });

  it("keeps actual optical links local to their region", () => {
    for (const link of ESTATE_OPTICAL_LINKS) {
      const [a, b] = link.path;
      expect(Math.abs(a[0] - b[0])).toBeLessThan(1);
      expect(Math.abs(a[1] - b[1])).toBeLessThan(1);
      expect(a).not.toEqual(b);
    }
  });
});

describe("GLHM-MAP-002 coordinate validation", () => {
  it("accepts valid coordinates and rejects invalid ones", () => {
    expect(isValidCoordinate([80.27, 13.08])).toBe(true);
    expect(isValidCoordinate([999, 13])).toBe(false);
    expect(isValidCoordinate([13.08, Number.NaN])).toBe(false);
    expect(isValidCoordinate([13.08])).toBe(false);
    expect(isValidCoordinate(null)).toBe(false);
    expect(isValidPath([[0, 0]])).toBe(false);
    expect(isValidPath([[0, 0], [1, 1]])).toBe(true);
  });

  it("excludes sites with invalid coordinates", () => {
    const bad: EstateSite = { ...ESTATE_SITES[0], id: "SITE-BAD", location: [999, 999] };
    const fc = buildSitesGeoJSON([ESTATE_SITES[0], bad]);
    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].id).toBe(ESTATE_SITES[0].id);
  });

  it("excludes optical links with a missing terminal pair", () => {
    const broken: EstateOpticalLink = { ...ESTATE_OPTICAL_LINKS[0], id: "BROKEN", terminalBId: "" };
    const fc = buildOpticalLinksGeoJSON([broken]);
    expect(fc.features).toHaveLength(0);
    expect(fc.type).toBe("FeatureCollection");
  });

  it("excludes corridors referencing a missing region", () => {
    const fc = buildServiceCorridorsGeoJSON(
      [{ id: "COR-X", name: "x", fromRegionId: "REG-CHN", toRegionId: "REG-NOPE", customerServiceCount: 1, corridorHealth: "healthy" }],
      ESTATE_REGIONS,
    );
    expect(fc.features).toHaveLength(0);
  });

  it("returns an empty collection rather than throwing on empty input", () => {
    expect(buildRisksGeoJSON([]).features).toEqual([]);
    expect(buildIncidentsGeoJSON([]).features).toEqual([]);
    expect(buildCustomerImpactGeoJSON([]).features).toEqual([]);
    expect(buildRegionsGeoJSON([]).features).toEqual([]);
  });
});

describe("GLHM-MAP-002 GeoJSON adapters", () => {
  it("builds regions with styling and summary properties", () => {
    const fc = buildRegionsGeoJSON();
    expect(fc.features).toHaveLength(10);
    const chn = fc.features.find((f) => f.id === "REG-CHN")!;
    expect(chn.geometry.type).toBe("Point");
    expect(chn.properties.health).toBe("At Risk");
    expect(chn.properties.activeIncidentCount).toBe(1);
  });

  it("builds sites with type and health properties", () => {
    const fc = buildSitesGeoJSON();
    expect(fc.features.length).toBe(ESTATE_SITES.length);
    expect(fc.features[0].properties).toHaveProperty("siteType");
    expect(fc.features[0].properties).toHaveProperty("terminalCount");
  });

  it("builds one optical-link source carrying status properties", () => {
    const fc = buildOpticalLinksGeoJSON();
    expect(fc.features.length).toBe(ESTATE_OPTICAL_LINKS.length);
    const statuses = new Set(fc.features.map((f) => f.properties.status));
    expect(statuses.has("healthy")).toBe(true);
    expect(statuses.has("at-risk")).toBe(true);
    expect(statuses.has("down")).toBe(true);
    for (const key of ["capacityGbps", "utilizationPct", "riskLevel", "fallbackReady", "maintenanceState", "lastTelemetryAt"]) {
      expect(fc.features[0].properties).toHaveProperty(key);
    }
  });

  it("builds curved service corridors distinct from optical links", () => {
    const fc = buildServiceCorridorsGeoJSON();
    expect(fc.features.length).toBe(ESTATE_CORRIDORS.length);
    expect(fc.features[0].properties.kind).toBe("service-corridor");
    expect(fc.features[0].geometry.coordinates.length).toBeGreaterThan(2);
  });

  it("generates great-circle geometry that stays within valid bounds", () => {
    const path = greatCircle([-0.13, 51.51], [80.27, 13.08], 20);
    expect(path).toHaveLength(21);
    for (const [lng, lat] of path) {
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
      expect(Math.abs(lat)).toBeLessThanOrEqual(90);
    }
  });

  it("builds fallback routes tagged by medium and active state", () => {
    const fc = buildFallbackRoutesGeoJSON();
    expect(fc.features.length).toBe(ESTATE_FALLBACK_ROUTES.length);
    expect(fc.features.some((f) => f.properties.medium === "rf")).toBe(true);
    expect(fc.features.some((f) => f.properties.medium === "diverse-fiber")).toBe(true);
    expect(fc.features.some((f) => f.properties.active === true)).toBe(true);
  });

  it("builds risk, incident and customer-impact features", () => {
    const risks = buildRisksGeoJSON();
    expect(risks.features.length).toBe(ESTATE_RISKS.length);
    expect(risks.features[0].properties).toHaveProperty("recommendedAction");

    const incidents = buildIncidentsGeoJSON();
    expect(incidents.features.some((f) => f.properties.status === "recovering")).toBe(true);

    const impact = buildCustomerImpactGeoJSON();
    const states = new Set(impact.features.map((f) => f.properties.state));
    expect(states.has("impacted")).toBe(true);
    expect(states.has("protected")).toBe(true);
    expect(states.has("elevated-risk")).toBe(true);
  });

  it("drops malformed risk and incident features", () => {
    expect(buildRisksGeoJSON([{ ...ESTATE_RISKS[0], location: [500, 500] }]).features).toHaveLength(0);
    expect(buildIncidentsGeoJSON([{ ...ESTATE_INCIDENTS[0], location: [Number.NaN, 5] }]).features).toHaveLength(0);
  });
});

describe("GLHM-MAP-002 layers", () => {
  it("declares layers in the required operational order", () => {
    expect(LAYER_ORDER[0]).toBe("corridors-line");
    expect(LAYER_ORDER.indexOf("links-healthy")).toBeLessThan(LAYER_ORDER.indexOf("links-down"));
    expect(LAYER_ORDER.indexOf("links-down")).toBeLessThan(LAYER_ORDER.indexOf("region-hubs"));
    expect(LAYER_ORDER.indexOf("site-points")).toBeLessThan(LAYER_ORDER.indexOf("risk-markers"));
    expect(LAYER_ORDER[LAYER_ORDER.length - 1]).toBe("customer-impact-markers");
  });

  it("filters one optical-link source by status", () => {
    expect(linkLayers).toHaveLength(7);
    for (const layer of linkLayers) {
      expect(layer.filter?.[0]).toBe("==");
    }
    expect(linkLayerGroup("links-maintenance")).toBe("maintenance");
    expect(linkLayerGroup("links-down")).toBe("opticalLinks");
  });

  it("uses default layer visibility with fallback layers off", () => {
    expect(LAYER_GROUPS).toHaveLength(10);
    expect(DEFAULT_LAYER_VISIBILITY.rfFallback).toBe(false);
    expect(DEFAULT_LAYER_VISIBILITY.fiberBackup).toBe(false);
    expect(DEFAULT_LAYER_VISIBILITY.opticalLinks).toBe(true);
    expect(DEFAULT_LAYER_VISIBILITY.regionalSummaries).toBe(true);
    expect(DEFAULT_LAYER_VISIBILITY.predictedRisks).toBe(true);
  });

  it("toggles layer visibility without mutating the definition", () => {
    const off = withVisibility(linkLayers[0], false) as { layout?: Record<string, unknown> };
    const on = withVisibility(linkLayers[0], true) as { layout?: Record<string, unknown> };
    expect(off.layout?.visibility).toBe("none");
    expect(on.layout?.visibility).toBe("visible");
    expect((linkLayers[0] as { layout?: Record<string, unknown> }).layout?.visibility).toBeUndefined();
  });
});

describe("GLHM-MAP-002 legend, callouts and summary", () => {
  it("covers every legend state with a pattern or glyph", () => {
    expect(LEGEND_ENTRIES).toHaveLength(13);
    for (const entry of LEGEND_ENTRIES) {
      expect(entry.color).toMatch(/^#/);
      expect(entry.glyph ?? entry.pattern).toBeTruthy();
    }
    const labels = LEGEND_ENTRIES.map((e) => e.label);
    expect(labels).toContain("Service Corridor");
    expect(labels).toContain("Customer Impact");
  });

  it("selects five desktop callouts and a reduced tablet set", () => {
    expect(CALLOUT_REGION_IDS).toHaveLength(5);
    expect(CALLOUT_REGION_IDS).toContain("REG-CHN");
    expect(TABLET_CALLOUT_REGION_IDS.length).toBeLessThan(CALLOUT_REGION_IDS.length);
    expect(TABLET_CALLOUT_REGION_IDS).toContain("REG-CHN");
    for (const id of CALLOUT_REGION_IDS) {
      const region = ESTATE_REGIONS.find((r) => r.id === id) as EstateRegion;
      expect(region).toBeTruthy();
      expect(region.capacityGbps).toBeGreaterThan(0);
    }
  });

  it("computes accessible map summary counts", () => {
    const summary = buildMapSummary();
    expect(summary.regions).toBe(10);
    expect(summary.links).toBe(ESTATE_OPTICAL_LINKS.length);
    const total = summary.healthy + summary.watch + summary.atRisk + summary.degraded +
      summary.down + summary.recovering + summary.maintenance;
    expect(total).toBe(summary.links);
    expect(summaryText(summary)).toContain("operating regions visible");
    expect(summaryText(summary)).toContain("predicted risks");
  });
});
