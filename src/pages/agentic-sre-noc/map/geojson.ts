/**
 * GLHM-MAP-001 — reusable GeoJSON source scaffolding.
 *
 * Placeholder synthetic geometry only. No operational rendering is wired at
 * this stage; sources exist so later stages can attach layers without
 * changing the map container contract.
 */

import type { Feature, FeatureCollection, Geometry } from "geojson";

export type NocFeatureCollection = FeatureCollection<Geometry, Record<string, unknown>>;

export const NOC_MAP_SOURCE_IDS = [
  "noc-regions",
  "noc-sites",
  "noc-optical-links",
  "noc-service-corridors",
  "noc-fallback-routes",
  "noc-incidents",
  "noc-risks",
  "noc-customer-impact",
] as const;

export type NocMapSourceId = (typeof NOC_MAP_SOURCE_IDS)[number];

const empty = (): NocFeatureCollection => ({ type: "FeatureCollection", features: [] });

const point = (id: string, coordinates: [number, number]): Feature<Geometry, Record<string, unknown>> => ({
  type: "Feature",
  id,
  properties: { id, placeholder: true },
  geometry: { type: "Point", coordinates },
});

/** Coarse anchor points used only to prove source wiring. */
const ANCHORS: Array<[string, [number, number]]> = [
  ["california", [-121.9, 37.3]],
  ["london", [-0.13, 51.51]],
  ["rio", [-43.2, -22.9]],
  ["nairobi", [36.82, -1.29]],
  ["chennai", [80.27, 13.08]],
  ["mumbai", [72.88, 19.08]],
  ["singapore", [103.82, 1.35]],
  ["sydney", [151.21, -33.87]],
];

/** Validates a FeatureCollection defensively before it reaches MapLibre. */
export function isValidFeatureCollection(value: unknown): value is NocFeatureCollection {
  if (!value || typeof value !== "object") return false;
  const fc = value as NocFeatureCollection;
  return fc.type === "FeatureCollection" && Array.isArray(fc.features);
}

export function createNocMapSources(): Record<NocMapSourceId, NocFeatureCollection> {
  return {
    "noc-regions": { type: "FeatureCollection", features: ANCHORS.map(([id, c]) => point(`region-${id}`, c)) },
    "noc-sites": { type: "FeatureCollection", features: ANCHORS.map(([id, c]) => point(`site-${id}`, c)) },
    "noc-optical-links": empty(),
    "noc-service-corridors": empty(),
    "noc-fallback-routes": empty(),
    "noc-incidents": empty(),
    "noc-risks": empty(),
    "noc-customer-impact": empty(),
  };
}
