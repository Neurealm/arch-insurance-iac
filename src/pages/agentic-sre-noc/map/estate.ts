/**
 * GLHM-MAP-002 — curated synthetic operating estate.
 *
 * Deterministic, precomputed synthetic geography for the Global Link Health
 * Twin. Two logical scales exist: the curated global demonstration estate
 * (rendered today) and the full synthetic scale metadata (future expansion).
 *
 * All coordinates are valid GeoJSON [longitude, latitude] pairs. Actual
 * optical links are strictly local/regional terminal-to-terminal paths.
 * Cross-region relationships are modelled as *service corridors*, never as
 * optical links.
 */

import type { LngLat } from "./types";

export type LinkStatus =
  | "healthy"
  | "watch"
  | "at-risk"
  | "degraded"
  | "down"
  | "recovering"
  | "maintenance";

export type RegionHealth = "Healthy" | "Watch" | "At Risk" | "Recovering";

export interface EstateRegion {
  id: string;
  name: string;
  center: LngLat;
  health: RegionHealth;
  linkCount: number;
  capacityGbps: number;
  utilizationPct: number;
  atRiskCount: number;
  degradedCount: number;
  activeIncidentCount: number;
  customerServiceCount: number;
  story: string;
}

export interface EstateSite {
  id: string;
  name: string;
  regionId: string;
  location: LngLat;
  siteType: "landing-station" | "core-pop" | "metro-pop" | "customer-edge" | "tower";
  health: "healthy" | "watch" | "at-risk" | "degraded";
  terminalCount: number;
  linkCount: number;
  customerServiceCount: number;
  capacityGbps: number;
  utilizationPct: number;
}

export interface EstateOpticalLink {
  id: string;
  name: string;
  regionId: string;
  terminalAId: string;
  terminalBId: string;
  path: LngLat[];
  status: LinkStatus;
  product: "Lightbridge" | "Beam" | "Metro" | "Backhaul";
  capacityGbps: number;
  throughputGbps: number;
  utilizationPct: number;
  availabilityPct: number;
  customerServiceCount: number;
  riskLevel: "none" | "moderate" | "high" | "severe";
  riskConfidence: number;
  fallbackReady: boolean;
  activeSituationId: string | null;
  activeIncidentId: string | null;
  maintenanceState: "none" | "planned" | "in-progress";
  recoveryState: "none" | "recovering" | "restored";
  lastTelemetryAt: string;
}

export interface EstateCorridor {
  id: string;
  name: string;
  fromRegionId: string;
  toRegionId: string;
  customerServiceCount: number;
  corridorHealth: "healthy" | "watch" | "at-risk";
}

export interface EstateFallbackRoute {
  id: string;
  linkId: string;
  regionId: string;
  medium: "rf" | "diverse-fiber";
  active: boolean;
  path: LngLat[];
}

export interface EstateRisk {
  id: string;
  linkId: string;
  regionId: string;
  location: LngLat;
  riskType: string;
  severity: "moderate" | "high" | "severe";
  probability: number;
  confidence: number;
  expectedImpactTime: string;
  capacityExposedGbps: number;
  customerServiceCount: number;
  fallbackReady: boolean;
  recommendedAction: string;
}

export interface EstateIncident {
  id: string;
  linkId: string;
  regionId: string;
  location: LngLat;
  severity: "sev1" | "sev2" | "sev3";
  status: "active" | "recovering";
  customerImpact: boolean;
  customerServiceCount: number;
  startedAt: string;
  owner: string;
}

export interface EstateCustomerImpact {
  id: string;
  regionId: string;
  location: LngLat;
  customer: string;
  state: "impacted" | "protected" | "elevated-risk";
  serviceCount: number;
}

const TELEMETRY_AT = "2026-08-05T19:12:00Z";

/** Curated regional summaries (source of truth for hubs + callouts). */
export const ESTATE_REGIONS: EstateRegion[] = [
  {
    id: "REG-CAL", name: "California", center: [-121.9, 37.35], health: "Healthy",
    linkCount: 98, capacityGbps: 1800, utilizationPct: 62, atRiskCount: 1, degradedCount: 0,
    activeIncidentCount: 0, customerServiceCount: 42,
    story: "High-capacity enterprise and data-center connectivity",
  },
  {
    id: "REG-LON", name: "London", center: [-0.13, 51.51], health: "Healthy",
    linkCount: 84, capacityGbps: 1200, utilizationPct: 58, atRiskCount: 0, degradedCount: 0,
    activeIncidentCount: 0, customerServiceCount: 36,
    story: "Metro enterprise and regional interconnect",
  },
  {
    id: "REG-RIO", name: "Rio de Janeiro", center: [-43.2, -22.9], health: "Watch",
    linkCount: 72, capacityGbps: 620, utilizationPct: 71, atRiskCount: 2, degradedCount: 0,
    activeIncidentCount: 0, customerServiceCount: 27,
    story: "Smart-city and Beam mesh capacity pressure",
  },
  {
    id: "REG-NBO", name: "Nairobi", center: [36.82, -1.29], health: "Recovering",
    linkCount: 68, capacityGbps: 450, utilizationPct: 54, atRiskCount: 0, degradedCount: 1,
    activeIncidentCount: 1, customerServiceCount: 22,
    story: "Recently recovered middle-mile service",
  },
  {
    id: "REG-CHN", name: "Chennai", center: [80.27, 13.08], health: "At Risk",
    linkCount: 38, capacityGbps: 340, utilizationPct: 63, atRiskCount: 3, degradedCount: 1,
    activeIncidentCount: 1, customerServiceCount: 18,
    story: "Fog-related optical degradation risk",
  },
  {
    id: "REG-MUM", name: "Mumbai", center: [72.88, 19.08], health: "Watch",
    linkCount: 76, capacityGbps: 710, utilizationPct: 68, atRiskCount: 2, degradedCount: 0,
    activeIncidentCount: 0, customerServiceCount: 25,
    story: "Rooftop alignment and metro service watch",
  },
  {
    id: "REG-JNB", name: "Johannesburg", center: [28.05, -26.2], health: "Healthy",
    linkCount: 61, capacityGbps: 390, utilizationPct: 52, atRiskCount: 1, degradedCount: 0,
    activeIncidentCount: 0, customerServiceCount: 19,
    story: "Regional ISP aggregation",
  },
  {
    id: "REG-DXB", name: "Dubai", center: [55.27, 25.2], health: "Healthy",
    linkCount: 54, capacityGbps: 420, utilizationPct: 47, atRiskCount: 1, degradedCount: 0,
    activeIncidentCount: 0, customerServiceCount: 16,
    story: "Enterprise and aggregation connectivity",
  },
  {
    id: "REG-SEA", name: "Southeast Asia", center: [103.82, 1.35], health: "Watch",
    linkCount: 82, capacityGbps: 760, utilizationPct: 65, atRiskCount: 2, degradedCount: 0,
    activeIncidentCount: 1, customerServiceCount: 29,
    story: "Regional mobile backhaul and metro growth",
  },
  {
    id: "REG-CAF", name: "Central Africa", center: [18.55, 4.37], health: "Healthy",
    linkCount: 44, capacityGbps: 290, utilizationPct: 49, atRiskCount: 1, degradedCount: 0,
    activeIncidentCount: 0, customerServiceCount: 14,
    story: "River-crossing middle-mile connectivity",
  },
];

/** Full synthetic scale (metadata only; not rendered in this stage). */
export const FULL_SCALE = { opticalLinks: 1248, terminals: 2496, customerServices: 320 };

interface SiteSpec {
  suffix: string;
  name: string;
  dLng: number;
  dLat: number;
  siteType: EstateSite["siteType"];
  health?: EstateSite["health"];
}

const SITE_SPECS: Record<string, SiteSpec[]> = {
  "REG-CAL": [
    { suffix: "DCI1", name: "Santa Clara DCI Campus", dLng: -0.09, dLat: 0.06, siteType: "core-pop" },
    { suffix: "ENT1", name: "San Jose Enterprise Roof", dLng: 0.06, dLat: -0.05, siteType: "customer-edge" },
    { suffix: "MET1", name: "Sunnyvale Metro POP", dLng: -0.02, dLat: -0.12, siteType: "metro-pop" },
  ],
  "REG-LON": [
    { suffix: "ENT1", name: "City of London Enterprise", dLng: 0.05, dLat: 0.01, siteType: "customer-edge" },
    { suffix: "MET1", name: "Docklands Metro POP", dLng: 0.13, dLat: -0.02, siteType: "metro-pop" },
    { suffix: "CORE", name: "West London Core POP", dLng: -0.14, dLat: 0.04, siteType: "core-pop" },
  ],
  "REG-RIO": [
    { suffix: "MESH1", name: "Centro Beam Node", dLng: 0.03, dLat: 0.02, siteType: "tower" },
    { suffix: "MESH2", name: "Botafogo Beam Node", dLng: -0.04, dLat: -0.03, siteType: "tower", health: "watch" },
    { suffix: "MBL1", name: "Barra Mobile Aggregation", dLng: -0.13, dLat: -0.09, siteType: "metro-pop" },
  ],
  "REG-NBO": [
    { suffix: "ISP1", name: "Westlands ISP Aggregation", dLng: -0.05, dLat: 0.03, siteType: "core-pop" },
    { suffix: "BH1", name: "Embakasi Backhaul Tower", dLng: 0.11, dLat: -0.04, siteType: "tower", health: "degraded" },
    { suffix: "EDGE1", name: "Karen Customer Edge", dLng: -0.09, dLat: -0.09, siteType: "customer-edge" },
  ],
  "REG-CHN": [
    { suffix: "A041", name: "Guindy Landing Station", dLng: -0.06, dLat: -0.03, siteType: "landing-station", health: "at-risk" },
    { suffix: "B041", name: "T. Nagar Enterprise Roof", dLng: 0.03, dLat: 0.02, siteType: "customer-edge", health: "at-risk" },
    { suffix: "C087", name: "Perungudi Backhaul Tower", dLng: 0.09, dLat: -0.08, siteType: "tower", health: "degraded" },
    { suffix: "D019", name: "Ambattur Metro POP", dLng: -0.11, dLat: 0.09, siteType: "metro-pop", health: "watch" },
  ],
  "REG-MUM": [
    { suffix: "A012", name: "BKC Data Centre", dLng: -0.03, dLat: -0.03, siteType: "core-pop" },
    { suffix: "B012", name: "Andheri Rooftop Terminal", dLng: 0.05, dLat: 0.04, siteType: "customer-edge", health: "watch" },
    { suffix: "M018", name: "Navi Mumbai Metro POP", dLng: 0.14, dLat: -0.07, siteType: "metro-pop" },
  ],
  "REG-JNB": [
    { suffix: "ISP1", name: "Sandton ISP Hub", dLng: 0.04, dLat: 0.05, siteType: "core-pop" },
    { suffix: "EDGE1", name: "Midrand Customer Edge", dLng: 0.11, dLat: 0.12, siteType: "customer-edge" },
    { suffix: "TWR1", name: "Roodepoort Tower", dLng: -0.12, dLat: -0.03, siteType: "tower" },
  ],
  "REG-DXB": [
    { suffix: "ENT1", name: "Business Bay Enterprise", dLng: -0.03, dLat: -0.04, siteType: "customer-edge" },
    { suffix: "AGG1", name: "Deira Aggregation POP", dLng: 0.06, dLat: 0.05, siteType: "metro-pop" },
  ],
  "REG-SEA": [
    { suffix: "MBL1", name: "Jurong Mobile Backhaul", dLng: -0.12, dLat: 0.04, siteType: "tower" },
    { suffix: "CORE", name: "Changi Core POP", dLng: 0.13, dLat: 0.02, siteType: "core-pop" },
    { suffix: "EDGE1", name: "Marina Customer Edge", dLng: 0.01, dLat: -0.03, siteType: "customer-edge", health: "watch" },
  ],
  "REG-CAF": [
    { suffix: "RVR1", name: "Kinshasa River North", dLng: -0.06, dLat: 0.03, siteType: "tower" },
    { suffix: "RVR2", name: "Kinshasa River South", dLng: 0.02, dLat: -0.05, siteType: "tower" },
  ],
};

/**
 * Regional separation factor. Sites remain within their metropolitan/regional
 * catchment (roughly 50-120 km apart) so links read as regional terminal-to-
 * terminal paths and stay legible at the global camera.
 */
const REGIONAL_SPREAD = 8;

export const ESTATE_SITES: EstateSite[] = ESTATE_REGIONS.flatMap((region) => {
  const specs = SITE_SPECS[region.id] ?? [];
  return specs.map((spec, index) => ({
    id: `SITE-${region.id.replace("REG-", "")}-${spec.suffix}`,
    name: spec.name,
    regionId: region.id,
    location: [
      Number((region.center[0] + spec.dLng * REGIONAL_SPREAD).toFixed(4)),
      Number((region.center[1] + spec.dLat * REGIONAL_SPREAD).toFixed(4)),
    ] as LngLat,
    siteType: spec.siteType,
    health: spec.health ?? "healthy",
    terminalCount: 2 + ((index + region.name.length) % 4),
    linkCount: 3 + ((index + 2) % 5),
    customerServiceCount: 2 + ((index + 1) % 6),
    capacityGbps: Math.round(region.capacityGbps / Math.max(specs.length, 1)),
    utilizationPct: region.utilizationPct + (index % 3) - 1,
  }));
});

const siteAt = (id: string): EstateSite | undefined => ESTATE_SITES.find((s) => s.id === id);

interface LinkSpec {
  id: string;
  name: string;
  regionId: string;
  a: string;
  b: string;
  terminalA: string;
  terminalB: string;
  status: LinkStatus;
  product: EstateOpticalLink["product"];
  capacityGbps: number;
  customerServiceCount: number;
  risk?: EstateOpticalLink["riskLevel"];
  riskConfidence?: number;
  fallbackReady?: boolean;
  incidentId?: string;
  situationId?: string;
  maintenanceState?: EstateOpticalLink["maintenanceState"];
  recoveryState?: EstateOpticalLink["recoveryState"];
}

/** Stable curated link specifications. IDs are preserved across stages. */
const LINK_SPECS: LinkSpec[] = [
  // Chennai — highest operational emphasis
  { id: "CHN-MBL-041", name: "Chennai Mobile Backhaul 041", regionId: "REG-CHN", a: "SITE-CHN-A041", b: "SITE-CHN-B041", terminalA: "TRM-CHN-A041", terminalB: "TRM-CHN-B041", status: "at-risk", product: "Lightbridge", capacityGbps: 40, customerServiceCount: 6, risk: "severe", riskConfidence: 0.91, fallbackReady: true, situationId: "SIT-2026-0417" },
  { id: "CHN-ENT-087", name: "Chennai Enterprise 087", regionId: "REG-CHN", a: "SITE-CHN-B041", b: "SITE-CHN-C087", terminalA: "TRM-CHN-B087", terminalB: "TRM-CHN-C087", status: "degraded", product: "Lightbridge", capacityGbps: 25, customerServiceCount: 4, risk: "high", riskConfidence: 0.84, fallbackReady: true, incidentId: "INC-CHN-4412" },
  { id: "CHN-BH-019", name: "Chennai Backhaul 019", regionId: "REG-CHN", a: "SITE-CHN-C087", b: "SITE-CHN-D019", terminalA: "TRM-CHN-C019", terminalB: "TRM-CHN-D019", status: "at-risk", product: "Backhaul", capacityGbps: 20, customerServiceCount: 3, risk: "high", riskConfidence: 0.77, fallbackReady: false },
  { id: "CHN-MET-052", name: "Chennai Metro 052", regionId: "REG-CHN", a: "SITE-CHN-A041", b: "SITE-CHN-D019", terminalA: "TRM-CHN-A052", terminalB: "TRM-CHN-D052", status: "watch", product: "Metro", capacityGbps: 25, customerServiceCount: 3, risk: "moderate", riskConfidence: 0.62 },
  { id: "CHN-ENT-093", name: "Chennai Enterprise 093", regionId: "REG-CHN", a: "SITE-CHN-B041", b: "SITE-CHN-D019", terminalA: "TRM-CHN-B093", terminalB: "TRM-CHN-D093", status: "healthy", product: "Lightbridge", capacityGbps: 20, customerServiceCount: 2 },

  // Mumbai
  { id: "MUM-DC-012", name: "Mumbai Data Centre 012", regionId: "REG-MUM", a: "SITE-MUM-A012", b: "SITE-MUM-B012", terminalA: "TRM-MUM-A012", terminalB: "TRM-MUM-B012", status: "watch", product: "Lightbridge", capacityGbps: 100, customerServiceCount: 7, risk: "moderate", riskConfidence: 0.58, fallbackReady: true },
  { id: "MUM-MET-018", name: "Mumbai Metro 018", regionId: "REG-MUM", a: "SITE-MUM-B012", b: "SITE-MUM-M018", terminalA: "TRM-MUM-B018", terminalB: "TRM-MUM-M018", status: "at-risk", product: "Metro", capacityGbps: 40, customerServiceCount: 5, risk: "high", riskConfidence: 0.71, fallbackReady: true },
  { id: "MUM-DCI-027", name: "Mumbai DCI 027", regionId: "REG-MUM", a: "SITE-MUM-A012", b: "SITE-MUM-M018", terminalA: "TRM-MUM-A027", terminalB: "TRM-MUM-M027", status: "healthy", product: "Lightbridge", capacityGbps: 100, customerServiceCount: 6 },
  { id: "MUM-MNT-031", name: "Mumbai Maintenance Window 031", regionId: "REG-MUM", a: "SITE-MUM-B012", b: "SITE-MUM-A012", terminalA: "TRM-MUM-B031", terminalB: "TRM-MUM-A031", status: "maintenance", product: "Metro", capacityGbps: 25, customerServiceCount: 2, maintenanceState: "in-progress" },

  // Nairobi
  { id: "NBO-ISP-021", name: "Nairobi ISP 021", regionId: "REG-NBO", a: "SITE-NBO-ISP1", b: "SITE-NBO-BH1", terminalA: "TRM-NBO-A021", terminalB: "TRM-NBO-B021", status: "recovering", product: "Lightbridge", capacityGbps: 40, customerServiceCount: 5, recoveryState: "recovering", incidentId: "INC-NBO-2210", fallbackReady: true },
  { id: "NBO-BH-007", name: "Nairobi Backhaul 007", regionId: "REG-NBO", a: "SITE-NBO-BH1", b: "SITE-NBO-EDGE1", terminalA: "TRM-NBO-A007", terminalB: "TRM-NBO-B007", status: "degraded", product: "Backhaul", capacityGbps: 20, customerServiceCount: 3, risk: "high", riskConfidence: 0.66 },
  { id: "NBO-MET-044", name: "Nairobi Metro 044", regionId: "REG-NBO", a: "SITE-NBO-ISP1", b: "SITE-NBO-EDGE1", terminalA: "TRM-NBO-A044", terminalB: "TRM-NBO-B044", status: "healthy", product: "Metro", capacityGbps: 25, customerServiceCount: 3 },

  // Rio de Janeiro (Beam mesh)
  { id: "RIO-MESH-023", name: "Rio Beam Mesh 023", regionId: "REG-RIO", a: "SITE-RIO-MESH1", b: "SITE-RIO-MESH2", terminalA: "TRM-RIO-A023", terminalB: "TRM-RIO-B023", status: "watch", product: "Beam", capacityGbps: 10, customerServiceCount: 4, risk: "moderate", riskConfidence: 0.55 },
  { id: "RIO-MBL-055", name: "Rio Mobile Backhaul 055", regionId: "REG-RIO", a: "SITE-RIO-MESH2", b: "SITE-RIO-MBL1", terminalA: "TRM-RIO-A055", terminalB: "TRM-RIO-B055", status: "at-risk", product: "Beam", capacityGbps: 10, customerServiceCount: 3, risk: "high", riskConfidence: 0.63, fallbackReady: true },
  { id: "RIO-MESH-061", name: "Rio Beam Mesh 061", regionId: "REG-RIO", a: "SITE-RIO-MESH1", b: "SITE-RIO-MBL1", terminalA: "TRM-RIO-A061", terminalB: "TRM-RIO-B061", status: "healthy", product: "Beam", capacityGbps: 10, customerServiceCount: 2 },
  { id: "RIO-MNT-070", name: "Rio Maintenance 070", regionId: "REG-RIO", a: "SITE-RIO-MESH2", b: "SITE-RIO-MBL1", terminalA: "TRM-RIO-A070", terminalB: "TRM-RIO-B070", status: "maintenance", product: "Beam", capacityGbps: 10, customerServiceCount: 1, maintenanceState: "planned" },

  // California
  { id: "CAL-DCI-012", name: "California DCI 012", regionId: "REG-CAL", a: "SITE-CAL-DCI1", b: "SITE-CAL-ENT1", terminalA: "TRM-CAL-A012", terminalB: "TRM-CAL-B012", status: "healthy", product: "Lightbridge", capacityGbps: 200, customerServiceCount: 9 },
  { id: "CAL-ENT-044", name: "California Enterprise 044", regionId: "REG-CAL", a: "SITE-CAL-ENT1", b: "SITE-CAL-MET1", terminalA: "TRM-CAL-A044", terminalB: "TRM-CAL-B044", status: "watch", product: "Lightbridge", capacityGbps: 100, customerServiceCount: 6, risk: "moderate", riskConfidence: 0.48 },
  { id: "CAL-MET-058", name: "California Metro 058", regionId: "REG-CAL", a: "SITE-CAL-DCI1", b: "SITE-CAL-MET1", terminalA: "TRM-CAL-A058", terminalB: "TRM-CAL-B058", status: "healthy", product: "Metro", capacityGbps: 100, customerServiceCount: 5 },

  // London
  { id: "LON-ENT-003", name: "London Enterprise 003", regionId: "REG-LON", a: "SITE-LON-ENT1", b: "SITE-LON-MET1", terminalA: "TRM-LON-A003", terminalB: "TRM-LON-B003", status: "healthy", product: "Lightbridge", capacityGbps: 100, customerServiceCount: 8 },
  { id: "LON-MET-014", name: "London Metro 014", regionId: "REG-LON", a: "SITE-LON-MET1", b: "SITE-LON-CORE", terminalA: "TRM-LON-A014", terminalB: "TRM-LON-B014", status: "healthy", product: "Metro", capacityGbps: 100, customerServiceCount: 7 },
  { id: "LON-DCI-029", name: "London DCI 029", regionId: "REG-LON", a: "SITE-LON-ENT1", b: "SITE-LON-CORE", terminalA: "TRM-LON-A029", terminalB: "TRM-LON-B029", status: "healthy", product: "Lightbridge", capacityGbps: 200, customerServiceCount: 6 },

  // Johannesburg
  { id: "JNB-ISP-033", name: "Johannesburg ISP 033", regionId: "REG-JNB", a: "SITE-JNB-ISP1", b: "SITE-JNB-EDGE1", terminalA: "TRM-JNB-A033", terminalB: "TRM-JNB-B033", status: "at-risk", product: "Lightbridge", capacityGbps: 40, customerServiceCount: 4, risk: "moderate", riskConfidence: 0.52, fallbackReady: true },
  { id: "JNB-MET-041", name: "Johannesburg Metro 041", regionId: "REG-JNB", a: "SITE-JNB-ISP1", b: "SITE-JNB-TWR1", terminalA: "TRM-JNB-A041", terminalB: "TRM-JNB-B041", status: "healthy", product: "Metro", capacityGbps: 25, customerServiceCount: 3 },
  { id: "JNB-BH-052", name: "Johannesburg Backhaul 052", regionId: "REG-JNB", a: "SITE-JNB-TWR1", b: "SITE-JNB-EDGE1", terminalA: "TRM-JNB-A052", terminalB: "TRM-JNB-B052", status: "healthy", product: "Backhaul", capacityGbps: 20, customerServiceCount: 2 },

  // Dubai
  { id: "DXB-ENT-009", name: "Dubai Enterprise 009", regionId: "REG-DXB", a: "SITE-DXB-ENT1", b: "SITE-DXB-AGG1", terminalA: "TRM-DXB-A009", terminalB: "TRM-DXB-B009", status: "healthy", product: "Lightbridge", capacityGbps: 100, customerServiceCount: 5 },
  { id: "DXB-MET-021", name: "Dubai Metro 021", regionId: "REG-DXB", a: "SITE-DXB-AGG1", b: "SITE-DXB-ENT1", terminalA: "TRM-DXB-A021", terminalB: "TRM-DXB-B021", status: "watch", product: "Metro", capacityGbps: 40, customerServiceCount: 3, risk: "moderate", riskConfidence: 0.45 },

  // Southeast Asia
  { id: "SEA-MBL-016", name: "Southeast Asia Mobile Backhaul 016", regionId: "REG-SEA", a: "SITE-SEA-MBL1", b: "SITE-SEA-CORE", terminalA: "TRM-SEA-A016", terminalB: "TRM-SEA-B016", status: "down", product: "Backhaul", capacityGbps: 20, customerServiceCount: 4, risk: "severe", riskConfidence: 0.88, fallbackReady: true, incidentId: "INC-SEA-7781" },
  { id: "SEA-ENT-038", name: "Southeast Asia Enterprise 038", regionId: "REG-SEA", a: "SITE-SEA-CORE", b: "SITE-SEA-EDGE1", terminalA: "TRM-SEA-A038", terminalB: "TRM-SEA-B038", status: "watch", product: "Lightbridge", capacityGbps: 100, customerServiceCount: 6, risk: "moderate", riskConfidence: 0.57 },
  { id: "SEA-MET-049", name: "Southeast Asia Metro 049", regionId: "REG-SEA", a: "SITE-SEA-MBL1", b: "SITE-SEA-EDGE1", terminalA: "TRM-SEA-A049", terminalB: "TRM-SEA-B049", status: "healthy", product: "Metro", capacityGbps: 40, customerServiceCount: 4 },
  { id: "SEA-MNT-055", name: "Southeast Asia Maintenance 055", regionId: "REG-SEA", a: "SITE-SEA-CORE", b: "SITE-SEA-MBL1", terminalA: "TRM-SEA-A055", terminalB: "TRM-SEA-B055", status: "maintenance", product: "Metro", capacityGbps: 25, customerServiceCount: 2, maintenanceState: "planned" },

  // Central Africa
  { id: "CAF-RVR-004", name: "Central Africa River Crossing 004", regionId: "REG-CAF", a: "SITE-CAF-RVR1", b: "SITE-CAF-RVR2", terminalA: "TRM-CAF-A004", terminalB: "TRM-CAF-B004", status: "healthy", product: "Lightbridge", capacityGbps: 40, customerServiceCount: 4 },
  { id: "CAF-RVR-011", name: "Central Africa River Crossing 011", regionId: "REG-CAF", a: "SITE-CAF-RVR2", b: "SITE-CAF-RVR1", terminalA: "TRM-CAF-A011", terminalB: "TRM-CAF-B011", status: "watch", product: "Backhaul", capacityGbps: 20, customerServiceCount: 2, risk: "moderate", riskConfidence: 0.41 },
];

function buildLink(spec: LinkSpec): EstateOpticalLink | null {
  const a = siteAt(spec.a);
  const b = siteAt(spec.b);
  if (!a || !b) return null; // missing terminal pair — excluded defensively
  const utilization = 40 + (spec.capacityGbps % 37);
  return {
    id: spec.id,
    name: spec.name,
    regionId: spec.regionId,
    terminalAId: spec.terminalA,
    terminalBId: spec.terminalB,
    path: [a.location, b.location],
    status: spec.status,
    product: spec.product,
    capacityGbps: spec.capacityGbps,
    throughputGbps: Math.round(spec.capacityGbps * (utilization / 100)),
    utilizationPct: utilization,
    availabilityPct:
      spec.status === "down" ? 96.4 : spec.status === "degraded" ? 98.9 : 99.95,
    customerServiceCount: spec.customerServiceCount,
    riskLevel: spec.risk ?? "none",
    riskConfidence: spec.riskConfidence ?? 0,
    fallbackReady: spec.fallbackReady ?? false,
    activeSituationId: spec.situationId ?? null,
    activeIncidentId: spec.incidentId ?? null,
    maintenanceState: spec.maintenanceState ?? "none",
    recoveryState: spec.recoveryState ?? "none",
    lastTelemetryAt: TELEMETRY_AT,
  };
}

export const ESTATE_OPTICAL_LINKS: EstateOpticalLink[] = LINK_SPECS
  .map(buildLink)
  .filter((l): l is EstateOpticalLink => l !== null);

/** Cross-region operational relationships — never optical links. */
const CORRIDOR_SPECS: Array<[string, string, number, EstateCorridor["corridorHealth"]]> = [
  ["REG-CAL", "REG-LON", 24, "healthy"], ["REG-CAL", "REG-SEA", 18, "healthy"],
  ["REG-CAL", "REG-RIO", 12, "watch"], ["REG-CAL", "REG-MUM", 9, "healthy"],
  ["REG-LON", "REG-MUM", 21, "healthy"], ["REG-LON", "REG-DXB", 17, "healthy"],
  ["REG-LON", "REG-NBO", 11, "watch"], ["REG-LON", "REG-JNB", 10, "healthy"],
  ["REG-LON", "REG-CAF", 7, "healthy"], ["REG-LON", "REG-RIO", 13, "healthy"],
  ["REG-RIO", "REG-JNB", 8, "watch"], ["REG-RIO", "REG-CAF", 5, "healthy"],
  ["REG-NBO", "REG-DXB", 9, "healthy"], ["REG-NBO", "REG-JNB", 12, "healthy"],
  ["REG-NBO", "REG-CAF", 6, "healthy"], ["REG-NBO", "REG-MUM", 8, "watch"],
  ["REG-CHN", "REG-SEA", 14, "at-risk"], ["REG-CHN", "REG-MUM", 16, "at-risk"],
  ["REG-CHN", "REG-DXB", 10, "watch"], ["REG-CHN", "REG-LON", 12, "watch"],
  ["REG-MUM", "REG-DXB", 15, "healthy"], ["REG-MUM", "REG-SEA", 13, "watch"],
  ["REG-MUM", "REG-JNB", 7, "healthy"], ["REG-DXB", "REG-SEA", 11, "healthy"],
  ["REG-DXB", "REG-JNB", 8, "healthy"], ["REG-DXB", "REG-CAF", 5, "healthy"],
  ["REG-SEA", "REG-JNB", 6, "healthy"], ["REG-JNB", "REG-CAF", 7, "healthy"],
  ["REG-CAF", "REG-MUM", 6, "healthy"], ["REG-SEA", "REG-RIO", 4, "healthy"],
];

export const ESTATE_CORRIDORS: EstateCorridor[] = CORRIDOR_SPECS.map(([from, to, services, health]) => ({
  id: `COR-${from.replace("REG-", "")}-${to.replace("REG-", "")}`,
  name: `${ESTATE_REGIONS.find((r) => r.id === from)?.name} to ${ESTATE_REGIONS.find((r) => r.id === to)?.name} service corridor`,
  fromRegionId: from,
  toRegionId: to,
  customerServiceCount: services,
  corridorHealth: health,
}));

function offsetPath(path: LngLat[], dLng: number, dLat: number): LngLat[] {
  const [a, b] = path;
  const mid: LngLat = [
    Number(((a[0] + b[0]) / 2 + dLng).toFixed(4)),
    Number(((a[1] + b[1]) / 2 + dLat).toFixed(4)),
  ];
  return [a, mid, b];
}

const FALLBACK_SPECS: Array<[string, EstateFallbackRoute["medium"], boolean]> = [
  ["CHN-MBL-041", "rf", true],
  ["CHN-ENT-087", "diverse-fiber", false],
  ["MUM-MET-018", "rf", false],
  ["MUM-DC-012", "diverse-fiber", false],
  ["NBO-ISP-021", "rf", true],
  ["RIO-MBL-055", "rf", false],
  ["JNB-ISP-033", "diverse-fiber", false],
  ["SEA-MBL-016", "rf", true],
];

export const ESTATE_FALLBACK_ROUTES: EstateFallbackRoute[] = FALLBACK_SPECS
  .map(([linkId, medium, active], i) => {
    const link = ESTATE_OPTICAL_LINKS.find((l) => l.id === linkId);
    if (!link) return null;
    return {
      id: `FBK-${linkId}`,
      linkId,
      regionId: link.regionId,
      medium,
      active,
      path: offsetPath(link.path, medium === "rf" ? 0.035 : -0.035, i % 2 === 0 ? 0.03 : -0.03),
    } satisfies EstateFallbackRoute;
  })
  .filter((r): r is EstateFallbackRoute => r !== null);

const riskAt = (linkId: string, dLng = 0.015, dLat = 0.015): LngLat => {
  const link = ESTATE_OPTICAL_LINKS.find((l) => l.id === linkId);
  const base = link?.path[0] ?? [0, 0];
  return [Number((base[0] + dLng).toFixed(4)), Number((base[1] + dLat).toFixed(4))];
};

export const ESTATE_RISKS: EstateRisk[] = [
  { id: "RSK-CHN-001", linkId: "CHN-MBL-041", regionId: "REG-CHN", location: riskAt("CHN-MBL-041"), riskType: "Fog-related optical degradation", severity: "severe", probability: 0.78, confidence: 0.91, expectedImpactTime: "2026-08-05T23:40:00Z", capacityExposedGbps: 40, customerServiceCount: 6, fallbackReady: true, recommendedAction: "Pre-stage RF fallback and reduce modulation order" },
  { id: "RSK-CHN-002", linkId: "CHN-BH-019", regionId: "REG-CHN", location: riskAt("CHN-BH-019", -0.02, 0.02), riskType: "Link margin decline", severity: "high", probability: 0.64, confidence: 0.77, expectedImpactTime: "2026-08-06T04:10:00Z", capacityExposedGbps: 20, customerServiceCount: 3, fallbackReady: false, recommendedAction: "Schedule alignment verification" },
  { id: "RSK-MUM-003", linkId: "MUM-MET-018", regionId: "REG-MUM", location: riskAt("MUM-MET-018", 0.02, -0.02), riskType: "Rooftop alignment drift", severity: "high", probability: 0.58, confidence: 0.71, expectedImpactTime: "2026-08-06T09:00:00Z", capacityExposedGbps: 40, customerServiceCount: 5, fallbackReady: true, recommendedAction: "Dispatch alignment coworker" },
  { id: "RSK-RIO-004", linkId: "RIO-MBL-055", regionId: "REG-RIO", location: riskAt("RIO-MBL-055", -0.02, -0.02), riskType: "Beam mesh capacity pressure", severity: "moderate", probability: 0.44, confidence: 0.63, expectedImpactTime: "2026-08-07T12:00:00Z", capacityExposedGbps: 10, customerServiceCount: 3, fallbackReady: true, recommendedAction: "Rebalance mesh traffic" },
  { id: "RSK-JNB-005", linkId: "JNB-ISP-033", regionId: "REG-JNB", location: riskAt("JNB-ISP-033", 0.02, 0.02), riskType: "Regional service risk", severity: "moderate", probability: 0.39, confidence: 0.52, expectedImpactTime: "2026-08-07T18:30:00Z", capacityExposedGbps: 40, customerServiceCount: 4, fallbackReady: true, recommendedAction: "Verify diverse fiber readiness" },
  { id: "RSK-DXB-006", linkId: "DXB-MET-021", regionId: "REG-DXB", location: riskAt("DXB-MET-021", -0.02, 0.02), riskType: "Environmental dust watch", severity: "moderate", probability: 0.35, confidence: 0.45, expectedImpactTime: "2026-08-08T06:00:00Z", capacityExposedGbps: 40, customerServiceCount: 3, fallbackReady: false, recommendedAction: "Monitor optical receive power" },
  { id: "RSK-SEA-007", linkId: "SEA-ENT-038", regionId: "REG-SEA", location: riskAt("SEA-ENT-038", 0.02, -0.02), riskType: "Convective weather risk", severity: "high", probability: 0.61, confidence: 0.57, expectedImpactTime: "2026-08-06T15:20:00Z", capacityExposedGbps: 100, customerServiceCount: 6, fallbackReady: true, recommendedAction: "Pre-position capacity on metro path" },
];

export const ESTATE_INCIDENTS: EstateIncident[] = [
  { id: "INC-CHN-4412", linkId: "CHN-ENT-087", regionId: "REG-CHN", location: riskAt("CHN-ENT-087", 0.01, -0.01), severity: "sev2", status: "active", customerImpact: true, customerServiceCount: 4, startedAt: "2026-08-05T17:42:00Z", owner: "Chennai SRE Pod" },
  { id: "INC-NBO-2210", linkId: "NBO-ISP-021", regionId: "REG-NBO", location: riskAt("NBO-ISP-021", 0.01, 0.01), severity: "sev3", status: "recovering", customerImpact: false, customerServiceCount: 5, startedAt: "2026-08-05T14:05:00Z", owner: "EMEA Reliability Pod" },
  { id: "INC-SEA-7781", linkId: "SEA-MBL-016", regionId: "REG-SEA", location: riskAt("SEA-MBL-016", -0.01, 0.01), severity: "sev1", status: "active", customerImpact: true, customerServiceCount: 4, startedAt: "2026-08-05T18:26:00Z", owner: "APAC NOC Pod" },
  { id: "INC-NBO-2214", linkId: "NBO-BH-007", regionId: "REG-NBO", location: riskAt("NBO-BH-007", -0.02, -0.01), severity: "sev3", status: "active", customerImpact: false, customerServiceCount: 3, startedAt: "2026-08-05T16:11:00Z", owner: "EMEA Reliability Pod" },
];

export const ESTATE_CUSTOMER_IMPACT: EstateCustomerImpact[] = [
  { id: "CIM-CHN-01", regionId: "REG-CHN", location: riskAt("CHN-ENT-087", 0.04, 0.02), customer: "Meridian Retail Group", state: "impacted", serviceCount: 3 },
  { id: "CIM-CHN-02", regionId: "REG-CHN", location: riskAt("CHN-MBL-041", -0.04, -0.02), customer: "Bharat Mobility", state: "protected", serviceCount: 6 },
  { id: "CIM-SEA-01", regionId: "REG-SEA", location: riskAt("SEA-MBL-016", 0.04, -0.02), customer: "Straits Telco", state: "impacted", serviceCount: 4 },
  { id: "CIM-MUM-01", regionId: "REG-MUM", location: riskAt("MUM-MET-018", -0.04, 0.02), customer: "Arcadia Financial", state: "elevated-risk", serviceCount: 5 },
  { id: "CIM-NBO-01", regionId: "REG-NBO", location: riskAt("NBO-ISP-021", 0.04, -0.03), customer: "Rift Valley ISP", state: "protected", serviceCount: 5 },
];

/** Region IDs that receive a floating HTML summary callout on desktop. */
export const CALLOUT_REGION_IDS = ["REG-CAL", "REG-LON", "REG-RIO", "REG-NBO", "REG-CHN"];

/** Priority callouts retained on tablet widths. */
export const TABLET_CALLOUT_REGION_IDS = ["REG-CHN", "REG-CAL", "REG-LON"];
