/**
 * GLHM-MAP-002 — operational layer definitions.
 *
 * Pure style definitions and layer ordering. No component logic here so the
 * ordering and defaults can be unit tested independently of MapLibre.
 */

import type { LayerProps } from "react-map-gl/maplibre";
import type { LinkStatus } from "./estate";

/** Operational status palette (restrained, no neon, no glow). */
export const STATUS_COLORS: Record<LinkStatus, string> = {
  healthy: "#16a34a",
  watch: "#f59e0b",
  "at-risk": "#ea8b1a",
  degraded: "#f97316",
  down: "#dc2626",
  recovering: "#0d9488",
  maintenance: "#2563eb",
};

export const AUX_COLORS = {
  serviceCorridor: "#94a3b8",
  rfFallback: "#64748b",
  fiberBackup: "#7c93ad",
  risk: "#b45309",
  incident: "#b91c1c",
  customerImpact: "#7c3aed",
};

export const REGION_HEALTH_COLORS: Record<string, string> = {
  Healthy: "#16a34a",
  Watch: "#f59e0b",
  "At Risk": "#ea580c",
  Recovering: "#0d9488",
};

/** Toggleable operational layer groups. */
export const LAYER_GROUPS = [
  "regionalSummaries",
  "serviceCorridors",
  "opticalLinks",
  "sitePoints",
  "rfFallback",
  "fiberBackup",
  "predictedRisks",
  "activeIncidents",
  "customerImpact",
  "maintenance",
] as const;

export type LayerGroup = (typeof LAYER_GROUPS)[number];

export const LAYER_GROUP_LABELS: Record<LayerGroup, string> = {
  regionalSummaries: "Regional summaries",
  serviceCorridors: "Service corridors",
  opticalLinks: "Optical links",
  sitePoints: "Site points",
  rfFallback: "RF fallback",
  fiberBackup: "Fiber backup",
  predictedRisks: "Predicted risks",
  activeIncidents: "Active incidents",
  customerImpact: "Customer impact",
  maintenance: "Maintenance",
};

export const DEFAULT_LAYER_VISIBILITY: Record<LayerGroup, boolean> = {
  regionalSummaries: true,
  serviceCorridors: true,
  opticalLinks: true,
  sitePoints: true,
  rfFallback: false,
  fiberBackup: false,
  predictedRisks: true,
  activeIncidents: true,
  customerImpact: true,
  maintenance: true,
};

/** Render order, bottom to top (basemap is implicit index 0). */
export const LAYER_ORDER = [
  "corridors-line",
  "fallback-fiber",
  "fallback-rf",
  "links-healthy",
  "links-maintenance",
  "links-recovering",
  "links-watch",
  "links-at-risk",
  "links-degraded",
  "links-down",
  "region-hubs",
  "region-hub-labels",
  "site-clusters",
  "site-cluster-count",
  "site-points",
  "risk-markers",
  "incident-markers",
  "customer-impact-markers",
] as const;

const zoomWidth = (a: number, b: number): unknown => ["interpolate", ["linear"], ["zoom"], 1, a, 6, b];

const statusLine = (
  id: string,
  status: LinkStatus,
  opts: { width: [number, number]; opacity: number; dash?: number[] },
): LayerProps => ({
  id,
  type: "line",
  filter: ["==", ["get", "status"], status],
  layout: { "line-cap": "round", "line-join": "round" },
  paint: {
    "line-color": STATUS_COLORS[status],
    "line-width": zoomWidth(opts.width[0], opts.width[1]) as number,
    "line-opacity": opts.opacity,
    ...(opts.dash ? { "line-dasharray": opts.dash } : {}),
  },
});

export const corridorLayer: LayerProps = {
  id: "corridors-line",
  type: "line",
  layout: { "line-cap": "butt", "line-join": "round" },
  paint: {
    "line-color": AUX_COLORS.serviceCorridor,
    "line-width": zoomWidth(0.6, 1.2) as number,
    "line-opacity": 0.34,
    "line-dasharray": [2, 3],
  },
};

export const fiberBackupLayer: LayerProps = {
  id: "fallback-fiber",
  type: "line",
  filter: ["==", ["get", "medium"], "diverse-fiber"],
  paint: {
    "line-color": AUX_COLORS.fiberBackup,
    "line-width": zoomWidth(0.8, 2) as number,
    "line-opacity": 0.45,
    "line-dasharray": [6, 3],
  },
};

export const rfFallbackLayer: LayerProps = {
  id: "fallback-rf",
  type: "line",
  filter: ["==", ["get", "medium"], "rf"],
  paint: {
    "line-color": AUX_COLORS.rfFallback,
    "line-width": zoomWidth(0.9, 2.2) as number,
    "line-opacity": ["case", ["==", ["get", "active"], true], 0.85, 0.35],
    "line-dasharray": [2, 2],
  },
};

export const linkLayers: LayerProps[] = [
  statusLine("links-healthy", "healthy", { width: [0.9, 2], opacity: 0.45 }),
  statusLine("links-maintenance", "maintenance", { width: [1, 2.2], opacity: 0.6, dash: [1, 2] }),
  statusLine("links-recovering", "recovering", { width: [1.3, 2.8], opacity: 0.85 }),
  statusLine("links-watch", "watch", { width: [1.3, 2.8], opacity: 0.8 }),
  statusLine("links-at-risk", "at-risk", { width: [1.8, 3.6], opacity: 0.95 }),
  statusLine("links-degraded", "degraded", { width: [2, 4], opacity: 0.95 }),
  statusLine("links-down", "down", { width: [2.4, 4.6], opacity: 1, dash: [2, 1.4] }),
];

export const regionHubLayer: LayerProps = {
  id: "region-hubs",
  type: "circle",
  paint: {
    "circle-radius": zoomWidth(4.5, 8) as number,
    "circle-color": "#ffffff",
    "circle-stroke-width": 2.2,
    "circle-stroke-color": [
      "match", ["get", "health"],
      "Healthy", REGION_HEALTH_COLORS.Healthy,
      "Watch", REGION_HEALTH_COLORS.Watch,
      "At Risk", REGION_HEALTH_COLORS["At Risk"],
      "Recovering", REGION_HEALTH_COLORS.Recovering,
      "#94a3b8",
    ],
  },
};

export const regionHubLabelLayer: LayerProps = {
  id: "region-hub-labels",
  type: "symbol",
  layout: {
    "text-field": ["concat", ["get", "name"], "  ", ["to-string", ["get", "linkCount"]]],
    "text-size": 10,
    "text-offset": [0, 1.3],
    "text-anchor": "top",
    "text-allow-overlap": false,
    "text-ignore-placement": false,
  },
  paint: {
    "text-color": "#475569",
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.2,
  },
};

export const siteClusterLayer: LayerProps = {
  id: "site-clusters",
  type: "circle",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#e2e8f0",
    "circle-stroke-color": "#94a3b8",
    "circle-stroke-width": 1,
    "circle-radius": ["step", ["get", "point_count"], 8, 5, 11, 12, 14],
  },
};

export const siteClusterCountLayer: LayerProps = {
  id: "site-cluster-count",
  type: "symbol",
  filter: ["has", "point_count"],
  layout: { "text-field": ["to-string", ["get", "point_count"]], "text-size": 10 },
  paint: { "text-color": "#334155" },
};

export const sitePointLayer: LayerProps = {
  id: "site-points",
  type: "circle",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-radius": zoomWidth(2.2, 4.5) as number,
    "circle-color": "#ffffff",
    "circle-stroke-width": 1.3,
    "circle-stroke-color": [
      "match", ["get", "health"],
      "healthy", STATUS_COLORS.healthy,
      "watch", STATUS_COLORS.watch,
      "at-risk", STATUS_COLORS["at-risk"],
      "degraded", STATUS_COLORS.degraded,
      "#94a3b8",
    ],
  },
};

/** Diamond-like risk marker: square rotated via symbol is unavailable without
 *  sprites, so a distinct thick-ringed small circle plus a triangle glyph label
 *  keeps it separable from site markers without extra assets. */
export const riskMarkerLayer: LayerProps = {
  id: "risk-markers",
  type: "symbol",
  layout: {
    "text-field": "▲",
    "text-size": ["match", ["get", "severity"], "severe", 15, "high", 13, 11],
    "text-allow-overlap": true,
  },
  paint: {
    "text-color": [
      "match", ["get", "severity"],
      "severe", "#b45309", "high", "#c2410c", "#d97706",
    ],
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.4,
  },
};

export const incidentMarkerLayer: LayerProps = {
  id: "incident-markers",
  type: "symbol",
  layout: {
    "text-field": ["case", ["==", ["get", "status"], "recovering"], "◆", "■"],
    "text-size": ["match", ["get", "severity"], "sev1", 13, "sev2", 11, 10],
    "text-allow-overlap": true,
  },
  paint: {
    "text-color": ["case", ["==", ["get", "status"], "recovering"], STATUS_COLORS.recovering, AUX_COLORS.incident],
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.4,
  },
};

export const customerImpactMarkerLayer: LayerProps = {
  id: "customer-impact-markers",
  type: "symbol",
  layout: {
    "text-field": ["case", ["==", ["get", "state"], "protected"], "◇", "●"],
    "text-size": 10,
    "text-allow-overlap": true,
  },
  paint: {
    "text-color": [
      "match", ["get", "state"],
      "impacted", AUX_COLORS.customerImpact,
      "protected", "#0d9488",
      "#a855f7",
    ],
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.4,
  },
};

/** Which toggle group governs each optical-link status layer. */
export function linkLayerGroup(layerId: string): LayerGroup {
  return layerId === "links-maintenance" ? "maintenance" : "opticalLinks";
}

/** Returns a copy of a layer definition with an explicit visibility layout. */
export function withVisibility(layer: LayerProps, on: boolean): LayerProps {
  const current = (layer as unknown as { layout?: Record<string, unknown> }).layout ?? {};
  return {
    ...(layer as object),
    layout: { ...current, visibility: on ? "visible" : "none" },
  } as LayerProps;
}
