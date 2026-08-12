/**
 * GLHM-MAP-002 — GeoJSON adapters.
 *
 * Pure functions that convert the curated synthetic estate into MapLibre-ready
 * FeatureCollections. Every adapter validates coordinates and silently drops
 * malformed features (reporting them in development logs) so that a single bad
 * record can never blank the map.
 */

import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import {
  ESTATE_CORRIDORS, ESTATE_CUSTOMER_IMPACT, ESTATE_FALLBACK_ROUTES, ESTATE_INCIDENTS,
  ESTATE_OPTICAL_LINKS, ESTATE_REGIONS, ESTATE_RISKS, ESTATE_SITES,
  type EstateCorridor, type EstateCustomerImpact, type EstateFallbackRoute, type EstateIncident,
  type EstateOpticalLink, type EstateRegion, type EstateRisk, type EstateSite, type LinkStatus,
} from "./estate";
import type { LngLat } from "./types";

export type Props = Record<string, unknown>;
export type PointCollection = FeatureCollection<Point, Props>;
export type LineCollection = FeatureCollection<LineString, Props>;

/** Development-only diagnostics for excluded features. */
function reportInvalid(kind: string, id: string, reason: string) {
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[GLHM map] excluded ${kind} "${id}": ${reason}`);
  }
}

export function isValidCoordinate(value: unknown): value is LngLat {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [lng, lat] = value as [unknown, unknown];
  return (
    typeof lng === "number" && typeof lat === "number" &&
    Number.isFinite(lng) && Number.isFinite(lat) &&
    lng >= -180 && lng <= 180 && lat >= -85 && lat <= 85
  );
}

export function isValidPath(value: unknown): value is LngLat[] {
  return Array.isArray(value) && value.length >= 2 && value.every(isValidCoordinate);
}

const pointFeature = (id: string, coordinates: LngLat, properties: Props): Feature<Point, Props> => ({
  type: "Feature", id, properties: { ...properties, id }, geometry: { type: "Point", coordinates },
});

const lineFeature = (id: string, coordinates: LngLat[], properties: Props): Feature<LineString, Props> => ({
  type: "Feature", id, properties: { ...properties, id }, geometry: { type: "LineString", coordinates },
});

const emptyPoints = (): PointCollection => ({ type: "FeatureCollection", features: [] });
const emptyLines = (): LineCollection => ({ type: "FeatureCollection", features: [] });

/** Great-circle interpolation between two coordinates (no external dependency). */
export function greatCircle(a: LngLat, b: LngLat, steps = 48): LngLat[] {
  const toRad = Math.PI / 180;
  const [lon1, lat1] = [a[0] * toRad, a[1] * toRad];
  const [lon2, lat2] = [b[0] * toRad, b[1] * toRad];
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2,
  ));
  if (!Number.isFinite(d) || d === 0) return [a, b];
  const out: LngLat[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    out.push([
      Number(((Math.atan2(y, x) / toRad)).toFixed(4)),
      Number(((Math.atan2(z, Math.sqrt(x * x + y * y)) / toRad)).toFixed(4)),
    ]);
  }
  // Guard against antimeridian jumps (world copies are disabled).
  for (let i = 1; i < out.length; i += 1) {
    if (Math.abs(out[i][0] - out[i - 1][0]) > 180) return [a, b];
  }
  return out;
}

export function buildRegionsGeoJSON(regions: EstateRegion[] = ESTATE_REGIONS): PointCollection {
  const features = regions.flatMap((r) => {
    if (!isValidCoordinate(r.center)) { reportInvalid("region", r.id, "invalid center"); return []; }
    return [pointFeature(r.id, r.center, {
      name: r.name, health: r.health, linkCount: r.linkCount, capacityGbps: r.capacityGbps,
      utilizationPct: r.utilizationPct, atRiskCount: r.atRiskCount, degradedCount: r.degradedCount,
      activeIncidentCount: r.activeIncidentCount, customerServiceCount: r.customerServiceCount,
    })];
  });
  return features.length ? { type: "FeatureCollection", features } : emptyPoints();
}

export function buildSitesGeoJSON(sites: EstateSite[] = ESTATE_SITES): PointCollection {
  const features = sites.flatMap((s) => {
    if (!isValidCoordinate(s.location)) { reportInvalid("site", s.id, "invalid location"); return []; }
    return [pointFeature(s.id, s.location, {
      name: s.name, regionId: s.regionId, siteType: s.siteType, health: s.health,
      terminalCount: s.terminalCount, linkCount: s.linkCount,
      customerServiceCount: s.customerServiceCount, capacityGbps: s.capacityGbps,
      utilizationPct: s.utilizationPct,
    })];
  });
  return features.length ? { type: "FeatureCollection", features } : emptyPoints();
}

export function buildOpticalLinksGeoJSON(links: EstateOpticalLink[] = ESTATE_OPTICAL_LINKS): LineCollection {
  const features = links.flatMap((l) => {
    if (!l.terminalAId || !l.terminalBId) { reportInvalid("optical link", l.id, "missing terminal pair"); return []; }
    if (!isValidPath(l.path)) { reportInvalid("optical link", l.id, "invalid geometry"); return []; }
    return [lineFeature(l.id, l.path, {
      name: l.name, regionId: l.regionId, status: l.status, product: l.product,
      capacityGbps: l.capacityGbps, throughputGbps: l.throughputGbps, utilizationPct: l.utilizationPct,
      availabilityPct: l.availabilityPct, customerServiceCount: l.customerServiceCount,
      riskLevel: l.riskLevel, riskConfidence: l.riskConfidence, fallbackReady: l.fallbackReady,
      activeSituationId: l.activeSituationId, activeIncidentId: l.activeIncidentId,
      maintenanceState: l.maintenanceState, recoveryState: l.recoveryState,
      lastTelemetryAt: l.lastTelemetryAt,
    })];
  });
  return features.length ? { type: "FeatureCollection", features } : emptyLines();
}

export function buildServiceCorridorsGeoJSON(
  corridors: EstateCorridor[] = ESTATE_CORRIDORS,
  regions: EstateRegion[] = ESTATE_REGIONS,
): LineCollection {
  const byId = new Map(regions.map((r) => [r.id, r]));
  const features = corridors.flatMap((c) => {
    const from = byId.get(c.fromRegionId);
    const to = byId.get(c.toRegionId);
    if (!from || !to) { reportInvalid("service corridor", c.id, "missing region"); return []; }
    if (!isValidCoordinate(from.center) || !isValidCoordinate(to.center)) {
      reportInvalid("service corridor", c.id, "invalid region geometry"); return [];
    }
    const path = greatCircle(from.center, to.center, 40);
    if (!isValidPath(path)) { reportInvalid("service corridor", c.id, "invalid corridor geometry"); return []; }
    return [lineFeature(c.id, path, {
      name: c.name, kind: "service-corridor", fromRegionId: c.fromRegionId, toRegionId: c.toRegionId,
      customerServiceCount: c.customerServiceCount, corridorHealth: c.corridorHealth,
    })];
  });
  return features.length ? { type: "FeatureCollection", features } : emptyLines();
}

export function buildFallbackRoutesGeoJSON(
  routes: EstateFallbackRoute[] = ESTATE_FALLBACK_ROUTES,
): LineCollection {
  const features = routes.flatMap((r) => {
    if (!isValidPath(r.path)) { reportInvalid("fallback route", r.id, "invalid geometry"); return []; }
    return [lineFeature(r.id, r.path, {
      linkId: r.linkId, regionId: r.regionId, medium: r.medium, active: r.active,
    })];
  });
  return features.length ? { type: "FeatureCollection", features } : emptyLines();
}

export function buildRisksGeoJSON(risks: EstateRisk[] = ESTATE_RISKS): PointCollection {
  const features = risks.flatMap((r) => {
    if (!isValidCoordinate(r.location)) { reportInvalid("risk", r.id, "invalid location"); return []; }
    if (!r.severity) { reportInvalid("risk", r.id, "malformed risk feature"); return []; }
    return [pointFeature(r.id, r.location, {
      linkId: r.linkId, regionId: r.regionId, riskType: r.riskType, severity: r.severity,
      probability: r.probability, confidence: r.confidence, expectedImpactTime: r.expectedImpactTime,
      capacityExposedGbps: r.capacityExposedGbps, customerServiceCount: r.customerServiceCount,
      fallbackReady: r.fallbackReady, recommendedAction: r.recommendedAction,
    })];
  });
  return features.length ? { type: "FeatureCollection", features } : emptyPoints();
}

export function buildIncidentsGeoJSON(incidents: EstateIncident[] = ESTATE_INCIDENTS): PointCollection {
  const features = incidents.flatMap((i) => {
    if (!isValidCoordinate(i.location)) { reportInvalid("incident", i.id, "invalid location"); return []; }
    if (!i.severity || !i.status) { reportInvalid("incident", i.id, "malformed incident feature"); return []; }
    return [pointFeature(i.id, i.location, {
      linkId: i.linkId, regionId: i.regionId, severity: i.severity, status: i.status,
      customerImpact: i.customerImpact, customerServiceCount: i.customerServiceCount,
      startedAt: i.startedAt, owner: i.owner,
    })];
  });
  return features.length ? { type: "FeatureCollection", features } : emptyPoints();
}

export function buildCustomerImpactGeoJSON(
  impacts: EstateCustomerImpact[] = ESTATE_CUSTOMER_IMPACT,
): PointCollection {
  const features = impacts.flatMap((c) => {
    if (!isValidCoordinate(c.location)) { reportInvalid("customer impact", c.id, "invalid location"); return []; }
    return [pointFeature(c.id, c.location, {
      regionId: c.regionId, customer: c.customer, state: c.state, serviceCount: c.serviceCount,
    })];
  });
  return features.length ? { type: "FeatureCollection", features } : emptyPoints();
}

export interface MapSummary {
  regions: number;
  links: number;
  healthy: number;
  watch: number;
  atRisk: number;
  degraded: number;
  down: number;
  recovering: number;
  maintenance: number;
  risks: number;
  incidents: number;
  customerImpact: number;
}

const countStatus = (links: EstateOpticalLink[], status: LinkStatus) =>
  links.filter((l) => l.status === status).length;

export function buildMapSummary(
  links: EstateOpticalLink[] = ESTATE_OPTICAL_LINKS,
  regions: EstateRegion[] = ESTATE_REGIONS,
  risks: EstateRisk[] = ESTATE_RISKS,
  incidents: EstateIncident[] = ESTATE_INCIDENTS,
  impacts: EstateCustomerImpact[] = ESTATE_CUSTOMER_IMPACT,
): MapSummary {
  return {
    regions: regions.length,
    links: links.length,
    healthy: countStatus(links, "healthy"),
    watch: countStatus(links, "watch"),
    atRisk: countStatus(links, "at-risk"),
    degraded: countStatus(links, "degraded"),
    down: countStatus(links, "down"),
    recovering: countStatus(links, "recovering"),
    maintenance: countStatus(links, "maintenance"),
    risks: risks.length,
    incidents: incidents.length,
    customerImpact: impacts.length,
  };
}

export function summaryText(s: MapSummary): string {
  return (
    `${s.regions} operating regions visible. ${s.links} optical links rendered: ` +
    `${s.healthy} healthy, ${s.watch} watch, ${s.atRisk} at risk, ${s.degraded} degraded, ` +
    `${s.down} down, ${s.recovering} recovering, ${s.maintenance} in maintenance. ` +
    `${s.incidents} active incidents, ${s.risks} predicted risks, ` +
    `${s.customerImpact} customer impact markers.`
  );
}
