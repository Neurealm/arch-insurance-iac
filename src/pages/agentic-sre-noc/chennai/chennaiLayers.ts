/**
 * AIM-003 — Chennai scenario MapLibre layer definitions.
 *
 * One optical-link source with filtered layers by risk class, plus subordinate
 * weather, route, terminal and selection layers. Order matches the approved
 * reference: weather, service route, fallback, low, moderate, high, terminals,
 * customer location, selection halo, selection line, endpoint rings, labels.
 */

import type {
  CircleLayerSpecification, FillLayerSpecification, FilterSpecification,
  LineLayerSpecification, SymbolLayerSpecification,
} from "maplibre-gl";

export type ChennaiLayerGroup =
  | "opticalLinks" | "terminalSites" | "weatherRisk" | "customerService" | "rfFallback" | "labels";

export const CHENNAI_LAYER_GROUPS: { id: ChennaiLayerGroup; label: string }[] = [
  { id: "opticalLinks", label: "Optical Links" },
  { id: "terminalSites", label: "Terminal Sites" },
  { id: "weatherRisk", label: "Weather Risk" },
  { id: "customerService", label: "Customer Service" },
  { id: "rfFallback", label: "RF Fallback" },
  { id: "labels", label: "Labels" },
];

export const DEFAULT_CHENNAI_VISIBILITY: Record<ChennaiLayerGroup, boolean> = {
  opticalLinks: true,
  terminalSites: true,
  weatherRisk: true,
  customerService: true,
  rfFallback: true,
  labels: true,
};

export const RISK_COLORS = {
  High: "#dc2626",
  Moderate: "#d97706",
  Low: "#059669",
  Unknown: "#94a3b8",
} as const;

/* ------------------------------ weather zone ------------------------------ */

export const weatherFillLayer: FillLayerSpecification = {
  id: "chn-weather-fill",
  type: "fill",
  source: "chn-weather-risk-zone",
  paint: { "fill-color": "#f59e0b", "fill-opacity": 0.1 },
};

export const weatherOutlineLayer: LineLayerSpecification = {
  id: "chn-weather-outline",
  type: "line",
  source: "chn-weather-risk-zone",
  paint: { "line-color": "#d97706", "line-width": 1, "line-opacity": 0.45, "line-dasharray": [3, 2] },
};

/* -------------------------------- routes --------------------------------- */

export const customerRouteLayer: LineLayerSpecification = {
  id: "chn-customer-route",
  type: "line",
  source: "chn-customer-service-route",
  paint: {
    "line-color": "#64748b",
    "line-width": 2,
    "line-opacity": 0.42,
    "line-dasharray": [1.5, 1.5],
  },
};

export const rfFallbackLayer: LineLayerSpecification = {
  id: "chn-rf-fallback",
  type: "line",
  source: "chn-rf-fallback-route",
  paint: {
    "line-color": "#475569",
    "line-width": ["case", ["boolean", ["feature-state", "active"], false], 2.6, 1.6],
    "line-opacity": ["case", ["boolean", ["feature-state", "active"], false], 0.85, 0.35],
    "line-dasharray": [2, 2],
  },
};

/* ----------------------------- optical links ------------------------------ */

const linkBase = (id: string, riskClass: keyof typeof RISK_COLORS, width: number, opacity: number): LineLayerSpecification => ({
  id,
  type: "line",
  source: "chn-optical-links",
  filter: ["==", ["get", "riskClass"], riskClass],
  layout: { "line-cap": "round", "line-join": "round" },
  paint: {
    "line-color": RISK_COLORS[riskClass],
    "line-width": [
      "case",
      ["boolean", ["feature-state", "hover"], false], width + 1.4,
      width,
    ],
    "line-opacity": opacity,
  },
});

export const lowRiskLinkLayer = linkBase("chn-link-low", "Low", 1.6, 0.7);
export const moderateRiskLinkLayer = linkBase("chn-link-moderate", "Moderate", 2.4, 0.85);
export const highRiskCasingLayer: LineLayerSpecification = {
  id: "chn-link-high-casing",
  type: "line",
  source: "chn-optical-links",
  filter: ["==", ["get", "riskClass"], "High"],
  layout: { "line-cap": "round", "line-join": "round" },
  paint: { "line-color": "#7f1d1d", "line-width": 4.6, "line-opacity": 0.28 },
};
export const highRiskLinkLayer = linkBase("chn-link-high", "High", 3, 0.95);
export const unknownRiskLinkLayer = linkBase("chn-link-unknown", "Unknown", 1.4, 0.5);

/** Wide transparent line used only to make hover and click reliable. */
export const linkHitLayer: LineLayerSpecification = {
  id: "chn-link-hit",
  type: "line",
  source: "chn-optical-links",
  paint: { "line-color": "#000000", "line-opacity": 0.001, "line-width": 16 },
};

/* ------------------------------- terminals -------------------------------- */

export const terminalLayer: CircleLayerSpecification = {
  id: "chn-terminals",
  type: "circle",
  source: "chn-terminal-sites",
  paint: {
    "circle-radius": ["case", ["boolean", ["feature-state", "hover"], false], 6.5, 5],
    "circle-color": "#ffffff",
    "circle-stroke-width": 1.8,
    "circle-stroke-color": [
      "match", ["get", "health"],
      "Impaired", "#dc2626",
      "Degrading", "#d97706",
      "#0f766e",
    ],
  },
};

export const customerLocationLayer: CircleLayerSpecification = {
  id: "chn-customer-location",
  type: "circle",
  source: "chn-customer-service-location",
  paint: {
    "circle-radius": 6,
    "circle-color": "#1d4ed8",
    "circle-opacity": 0.9,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
  },
};

/* ------------------------------- selection -------------------------------- */

export const selectedHaloLayer: LineLayerSpecification = {
  id: "chn-selected-halo",
  type: "line",
  source: "chn-optical-links",
  filter: ["==", ["get", "id"], "__none__"],
  layout: { "line-cap": "round" },
  paint: {
    "line-color": [
      "match", ["get", "riskClass"],
      "High", RISK_COLORS.High,
      "Moderate", RISK_COLORS.Moderate,
      "Low", RISK_COLORS.Low,
      RISK_COLORS.Unknown,
    ],
    "line-width": 12,
    "line-opacity": 0.18,
  },
};

export const selectedLineLayer: LineLayerSpecification = {
  id: "chn-selected-line",
  type: "line",
  source: "chn-optical-links",
  filter: ["==", ["get", "id"], "__none__"],
  layout: { "line-cap": "round" },
  paint: {
    "line-color": [
      "match", ["get", "riskClass"],
      "High", RISK_COLORS.High,
      "Moderate", RISK_COLORS.Moderate,
      "Low", RISK_COLORS.Low,
      RISK_COLORS.Unknown,
    ],
    "line-width": 2.2,
    "line-opacity": 1,
  },
};

export const selectedEndpointLayer: CircleLayerSpecification = {
  id: "chn-selected-endpoints",
  type: "circle",
  source: "chn-selected-link-endpoints",
  paint: {
    "circle-radius": 8,
    "circle-color": "#ffffff",
    "circle-opacity": 0.15,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#0f172a",
  },
};

/* --------------------------------- labels --------------------------------- */

export const linkLabelLayer: SymbolLayerSpecification = {
  id: "chn-link-labels",
  type: "symbol",
  source: "chn-optical-links",
  layout: {
    "symbol-placement": "line-center",
    "text-field": ["get", "id"],
    "text-size": 10,
    "text-offset": [0, -0.9],
    "text-allow-overlap": false,
  },
  paint: { "text-color": "#334155", "text-halo-color": "#ffffff", "text-halo-width": 1.4 },
};

export const terminalLabelLayer: SymbolLayerSpecification = {
  id: "chn-terminal-labels",
  type: "symbol",
  source: "chn-terminal-sites",
  minzoom: 11.4,
  layout: {
    "text-field": ["get", "id"],
    "text-size": 9.5,
    "text-offset": [0, 1.1],
    "text-anchor": "top",
    "text-allow-overlap": false,
  },
  paint: { "text-color": "#475569", "text-halo-color": "#ffffff", "text-halo-width": 1.4 },
};

/** Applies a layout visibility flag to any layer spec. */
export function withVisibility<T extends { layout?: Record<string, unknown> }>(layer: T, visible: boolean): T {
  return {
    ...layer,
    layout: { ...(layer.layout ?? {}), visibility: visible ? "visible" : "none" },
  };
}

/** Typed selection filter for the selected-link halo and inner line. */
export function selectedLinkFilter(selectedLinkId: string | null): FilterSpecification {
  return ["==", ["get", "id"], selectedLinkId ?? "__none__"];
}
