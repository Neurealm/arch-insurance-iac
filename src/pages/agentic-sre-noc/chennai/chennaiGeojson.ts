/**
 * AIM-003 — Chennai scenario GeoJSON adapters.
 *
 * One source per logical concept, never one source per risk class. Feature ids
 * are stable and match the fixture identifiers so MapLibre feature state can
 * drive hover, selection and What-If styling without rebuilding sources.
 */

import type { Feature, FeatureCollection, LineString, Point, Polygon } from "geojson";
import {
  chennaiLinks, chennaiTerminals, customerServiceLocation, customerServiceRoute,
  getTerminal, rfFallbackRoute, weatherRiskZone, type ChennaiLink,
} from "./chennaiFixtures";
import type { ChennaiPrediction } from "./chennaiModel";

export const CHENNAI_SOURCE_IDS = [
  "chn-terminal-sites",
  "chn-optical-links",
  "chn-customer-service-route",
  "chn-rf-fallback-route",
  "chn-weather-risk-zone",
  "chn-customer-service-location",
  "chn-selected-link-endpoints",
] as const;

export type ChennaiSourceId = (typeof CHENNAI_SOURCE_IDS)[number];

export type LinkFeature = Feature<LineString, Record<string, unknown>>;
export type PointFeature = Feature<Point, Record<string, unknown>>;

function validCoord(c: unknown): c is [number, number] {
  return (
    Array.isArray(c) && c.length === 2 &&
    typeof c[0] === "number" && typeof c[1] === "number" &&
    Number.isFinite(c[0]) && Number.isFinite(c[1]) &&
    c[0] >= -180 && c[0] <= 180 && c[1] >= -90 && c[1] <= 90
  );
}

/** Defensive validation before any collection reaches MapLibre. */
export function isValidChennaiCollection(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const fc = value as FeatureCollection;
  if (fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) return false;
  return fc.features.every((f) => {
    if (!f?.geometry) return false;
    if (f.geometry.type === "Point") return validCoord(f.geometry.coordinates);
    if (f.geometry.type === "LineString") {
      return f.geometry.coordinates.length >= 2 && f.geometry.coordinates.every(validCoord);
    }
    if (f.geometry.type === "Polygon") {
      return f.geometry.coordinates.every((ring) => ring.length >= 4 && ring.every(validCoord));
    }
    return false;
  });
}

/** Optional live prediction overrides keyed by link id (What-If output). */
export type PredictionOverrides = Record<string, ChennaiPrediction | undefined>;

function linkRisk(link: ChennaiLink, overrides?: PredictionOverrides) {
  const p = overrides?.[link.id];
  return {
    riskScore: p ? p.riskProbability : link.riskScore,
    riskClass: p ? p.riskClass : link.riskClass,
    confidence: p ? p.confidencePct : link.confidencePct,
    predictedImpactMinutes: p
      ? (p.etaMinutes ?? link.predictedImpactMinutes)
      : link.predictedImpactMinutes,
    fallbackReady: p ? p.fallback.state === "Ready" : link.fallbackReady,
    fallbackHeadroomPct: p ? Math.round(p.fallback.score * 100) : link.fallbackHeadroomPct,
    recommendedAction: p ? p.recommendedAction?.name ?? link.recommendedAction : link.recommendedAction,
  };
}

export function buildOpticalLinksGeoJSON(
  overrides?: PredictionOverrides,
): FeatureCollection<LineString, Record<string, unknown>> {
  const features: LinkFeature[] = [];
  for (const link of chennaiLinks) {
    const a = getTerminal(link.terminalA);
    const b = getTerminal(link.terminalB);
    if (!a || !b || !validCoord(a.coordinates) || !validCoord(b.coordinates)) continue;
    const live = linkRisk(link, overrides);
    features.push({
      type: "Feature",
      id: link.id,
      properties: {
        id: link.id,
        name: link.name,
        regionId: link.regionId,
        product: link.product,
        riskScore: live.riskScore,
        riskClass: live.riskClass,
        confidence: live.confidence,
        predictedImpactMinutes: live.predictedImpactMinutes,
        capacityGbps: link.capacityGbps,
        customerServiceCount: link.customerServiceCount,
        customerServiceIds: link.customerServiceIds.join(", "),
        primaryDriver: link.primaryDriver,
        fallbackReady: live.fallbackReady,
        fallbackHeadroomPct: live.fallbackHeadroomPct,
        linkMarginDb: link.linkMarginDb,
        receivedPowerDbm: link.receivedPowerDbm,
        attenuationDb: link.attenuationDb,
        visibilityKm: link.visibilityKm,
        fogProbability: link.fogProbability,
        humidityPct: link.humidityPct,
        rainfallMmHr: link.rainfallMmHr,
        degradationRateDbHr: link.degradationRateDbHr,
        dataQuality: link.dataQualityPct,
        sourceAgreement: link.sourceAgreementPct,
        serviceCriticality: link.serviceCriticality,
        currentStatus: link.currentStatus,
        recommendedAction: live.recommendedAction,
      },
      geometry: { type: "LineString", coordinates: [a.coordinates, b.coordinates] },
    });
  }
  return { type: "FeatureCollection", features };
}

export function buildTerminalSitesGeoJSON(): FeatureCollection<Point, Record<string, unknown>> {
  return {
    type: "FeatureCollection",
    features: chennaiTerminals.filter((t) => validCoord(t.coordinates)).map((t) => ({
      type: "Feature",
      id: t.id,
      properties: {
        id: t.id,
        name: t.name,
        product: t.product,
        health: t.health,
        pairedTerminalId: t.pairedTerminalId,
        linkId: t.linkId,
        beamLock: t.beamLock,
        temperatureC: t.temperatureC,
        firmware: t.firmware,
        telemetryFreshnessSec: t.telemetryFreshnessSec,
      },
      geometry: { type: "Point", coordinates: t.coordinates },
    })),
  };
}

export function buildCustomerServiceRouteGeoJSON(): FeatureCollection<LineString, Record<string, unknown>> {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: customerServiceRoute.id,
        properties: {
          id: customerServiceRoute.id,
          serviceId: customerServiceRoute.serviceId,
          customer: customerServiceRoute.customer,
        },
        geometry: { type: "LineString", coordinates: customerServiceRoute.coordinates },
      },
    ],
  };
}

export function buildRfFallbackRouteGeoJSON(): FeatureCollection<LineString, Record<string, unknown>> {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: rfFallbackRoute.id,
        properties: { id: rfFallbackRoute.id, linkId: rfFallbackRoute.linkId },
        geometry: { type: "LineString", coordinates: rfFallbackRoute.coordinates },
      },
    ],
  };
}

export function buildWeatherRiskZoneGeoJSON(): FeatureCollection<Polygon, Record<string, unknown>> {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: weatherRiskZone.id,
        properties: {
          id: weatherRiskZone.id,
          label: weatherRiskZone.label,
          visibilityKm: weatherRiskZone.visibilityKm,
        },
        geometry: { type: "Polygon", coordinates: weatherRiskZone.coordinates },
      },
    ],
  };
}

export function buildCustomerServiceLocationGeoJSON(): FeatureCollection<Point, Record<string, unknown>> {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: customerServiceLocation.id,
        properties: {
          id: customerServiceLocation.id,
          name: customerServiceLocation.name,
          serviceId: customerServiceLocation.serviceId,
          capacityGbps: customerServiceLocation.capacityGbps,
          criticality: customerServiceLocation.criticality,
        },
        geometry: { type: "Point", coordinates: customerServiceLocation.coordinates },
      },
    ],
  };
}

export function buildSelectedLinkEndpointsGeoJSON(
  selectedLinkId: string | null,
): FeatureCollection<Point, Record<string, unknown>> {
  const link = chennaiLinks.find((l) => l.id === selectedLinkId);
  if (!link) return { type: "FeatureCollection", features: [] };
  const points = [getTerminal(link.terminalA), getTerminal(link.terminalB)].filter(Boolean);
  return {
    type: "FeatureCollection",
    features: points
      .filter((t) => t && validCoord(t.coordinates))
      .map((t) => ({
        type: "Feature",
        id: `sel-${t!.id}`,
        properties: { id: t!.id, linkId: link.id, label: link.id },
        geometry: { type: "Point", coordinates: t!.coordinates },
      })),
  };
}

/** Bounds that fit every Chennai link, route, terminal and the risk zone. */
export function computeScenarioBounds(): [[number, number], [number, number]] {
  const coords: [number, number][] = [
    ...chennaiTerminals.map((t) => t.coordinates),
    ...customerServiceRoute.coordinates,
    ...rfFallbackRoute.coordinates,
    ...weatherRiskZone.coordinates[0],
    customerServiceLocation.coordinates,
  ].filter(validCoord);
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const pad = 0.02;
  return [
    [Math.min(...lons) - pad, Math.min(...lats) - pad],
    [Math.max(...lons) + pad, Math.max(...lats) + pad],
  ];
}
