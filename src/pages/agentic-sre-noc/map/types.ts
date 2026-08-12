/**
 * GLHM-MAP-001 — Global Link Health Map foundation.
 *
 * Reusable geospatial domain interfaces for the Agentic SRE NOC mapping
 * framework. Structure only: operational fields are intentionally optional
 * and unpopulated at this stage.
 */

/** [longitude, latitude] — GeoJSON coordinate order. */
export type LngLat = [number, number];

export interface Region {
  id: string;
  name: string;
  center: LngLat;
  /** Optional coarse bounding box [west, south, east, north]. */
  bbox?: [number, number, number, number];
}

export interface Site {
  id: string;
  name: string;
  regionId: string;
  location: LngLat;
  kind?: "landing-station" | "core-pop" | "metro-pop" | "customer-edge";
}

export interface Terminal {
  id: string;
  siteId: string;
  name: string;
  location: LngLat;
}

export interface OpticalLink {
  id: string;
  name: string;
  regionId: string;
  terminalAId: string;
  terminalBId: string;
  /** Route geometry as an ordered path of coordinates. */
  path: LngLat[];
  capacityGbps?: number;
}

export interface FallbackRoute {
  id: string;
  linkId: string;
  path: LngLat[];
  medium?: "rf" | "microwave" | "diverse-fiber" | "satellite";
}

export interface CustomerService {
  id: string;
  name: string;
  customer: string;
  regionId: string;
  linkIds: string[];
  path?: LngLat[];
}

export interface Incident {
  id: string;
  regionId: string;
  location: LngLat;
  severity?: "sev1" | "sev2" | "sev3" | "sev4";
}

export interface Risk {
  id: string;
  regionId: string;
  location: LngLat;
  confidence?: number;
}

export interface CameraView {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: 0;
  pitch: 0;
}
