/**
 * GLHM-MAP-001 / GLHM-MAP-002 — Global Link Health Map.
 *
 * GLHM-MAP-001 established the MapLibre foundation (basemap, camera,
 * ResizeObserver, fallbacks). GLHM-MAP-002 adds the curated operational
 * estate: regions, sites, optical links by status, service corridors,
 * fallback routes, risks, incidents and customer impact — plus the legend,
 * layer control, regional callouts and an accessible map summary.
 *
 * No hover, selection, fly-to, search or scenario playback in this stage.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Source, type MapRef } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Maximize2, Minimize2, Play, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidFeatureCollection } from "./geojson";
import type { CameraView } from "./types";
import {
  buildCustomerImpactGeoJSON, buildFallbackRoutesGeoJSON, buildIncidentsGeoJSON,
  buildMapSummary, buildOpticalLinksGeoJSON, buildRegionsGeoJSON, buildRisksGeoJSON,
  buildServiceCorridorsGeoJSON, buildSitesGeoJSON, summaryText,
} from "./adapters";
import {
  corridorLayer, customerImpactMarkerLayer, DEFAULT_LAYER_VISIBILITY, fiberBackupLayer,
  incidentMarkerLayer, linkLayerGroup, linkLayers, regionHubLabelLayer, regionHubLayer,
  rfFallbackLayer, riskMarkerLayer, siteClusterCountLayer, siteClusterLayer, sitePointLayer,
  type LayerGroup,
} from "./layers";
import { CALLOUT_REGION_IDS, ESTATE_REGIONS, TABLET_CALLOUT_REGION_IDS } from "./estate";
import { MapLegend } from "./MapLegend";
import { MapLayerControl } from "./MapLayerControl";
import { RegionCallout } from "./RegionCallout";

/** Approved global view: Americas through Australia, no continent bias. */
export const GLOBAL_VIEW: CameraView = {
  longitude: 12,
  latitude: 18,
  zoom: 1.05,
  bearing: 0,
  pitch: 0,
};

/** Americas through Australia, matching the approved reference framing. */
export const GLOBAL_BOUNDS: [[number, number], [number, number]] = [
  [-168, -56],
  [178, 74],
];

const BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

type Breakpoint = "mobile" | "tablet" | "desktop";

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window === "undefined" ? "desktop" : window.innerWidth < 768 ? "mobile" : window.innerWidth < 1280 ? "tablet" : "desktop",
  );
  useEffect(() => {
    const onResize = () =>
      setBp(window.innerWidth < 768 ? "mobile" : window.innerWidth < 1280 ? "tablet" : "desktop");
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return bp;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

function MapFallback({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-50 px-6 text-center"
    >
      <p className="text-[13px] font-semibold text-slate-800">Map view unavailable</p>
      <p className="max-w-md text-[12px] text-slate-600">{message}</p>
    </div>
  );
}

interface ControlButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  children: React.ReactNode;
}

function ControlButton({ label, onClick, disabled, pressed, children }: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md border shadow-sm transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
        pressed ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600",
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-slate-50 hover:text-slate-900",
      )}
    >
      {children}
    </button>
  );
}

export interface GlobalLinkHealthMapProps {
  /** Rendered as the accessible map title. */
  title?: string;
  className?: string;
  /** Optional external full screen toggle (page-level dialog). */
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export function GlobalLinkHealthMap({
  title = "Global link health map",
  className,
  isFullScreen = false,
  onToggleFullScreen,
}: GlobalLinkHealthMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const [webgl] = useState(hasWebGL);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const breakpoint = useBreakpoint();

  const [visibility, setVisibility] = useState<Record<LayerGroup, boolean>>({ ...DEFAULT_LAYER_VISIBILITY });
  const [legendOpen, setLegendOpen] = useState(true);
  const [legendShown, setLegendShown] = useState(true);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);

  useEffect(() => {
    setLegendOpen(breakpoint === "desktop");
    setLegendShown(breakpoint !== "mobile");
  }, [breakpoint]);

  const toggleLayer = useCallback((group: LayerGroup) => {
    setVisibility((prev) => ({ ...prev, [group]: !prev[group] }));
  }, []);

  // Memoized GeoJSON adapters — computed once, never rebuilt on toggles.
  const regionsData = useMemo(() => buildRegionsGeoJSON(), []);
  const sitesData = useMemo(() => buildSitesGeoJSON(), []);
  const linksData = useMemo(() => buildOpticalLinksGeoJSON(), []);
  const corridorsData = useMemo(() => buildServiceCorridorsGeoJSON(), []);
  const fallbackData = useMemo(() => buildFallbackRoutesGeoJSON(), []);
  const risksData = useMemo(() => buildRisksGeoJSON(), []);
  const incidentsData = useMemo(() => buildIncidentsGeoJSON(), []);
  const customerImpactData = useMemo(() => buildCustomerImpactGeoJSON(), []);
  const summary = useMemo(() => buildMapSummary(), []);

  const callouts = useMemo(() => {
    if (breakpoint === "mobile" || !visibility.regionalSummaries) return [];
    const ids = breakpoint === "tablet" ? TABLET_CALLOUT_REGION_IDS : CALLOUT_REGION_IDS;
    return ESTATE_REGIONS.filter((r) => ids.includes(r.id));
  }, [breakpoint, visibility.regionalSummaries]);

  const vis = (on: boolean) => ({ visibility: (on ? "visible" : "none") as "visible" | "none" });

  // Resize the canvas whenever the container box changes (nav collapse,
  // drawer open/close, full screen, window resize).
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.getMap()?.resize();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => mapRef.current?.getMap()?.resize(), 60);
    return () => window.clearTimeout(id);
  }, [isFullScreen]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    const map = mapRef.current?.getMap();
    if (!map) return;
    try {
      // Neutral operational palette: white water, very light gray land.
      for (const layer of map.getStyle().layers ?? []) {
        if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", "#eef2f6");
        if (layer.id.includes("water")) {
          if (layer.type === "fill") map.setPaintProperty(layer.id, "fill-color", "#ffffff");
          if (layer.type === "line") map.setPaintProperty(layer.id, "line-color", "#ffffff");
        }
        if (layer.id.includes("landcover") || layer.id.includes("landuse") || layer.id === "land") {
          if (layer.type === "fill") map.setPaintProperty(layer.id, "fill-color", "#f1f5f9");
        }
        if (layer.id.includes("boundary")) {
          if (layer.type === "line") {
            map.setPaintProperty(layer.id, "line-color", "#cbd5e1");
            map.setPaintProperty(layer.id, "line-width", 0.5);
          }
        }
        if (layer.id.includes("road") || layer.id.includes("building") || layer.id.includes("poi")) {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      }
    } catch {
      // Style variations are non-fatal; the basemap still renders.
    }
  }, []);

  const resetView = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    map.fitBounds(GLOBAL_BOUNDS, { padding: 8, duration: reduced ? 0 : 400, bearing: 0, pitch: 0 });
  }, []);

  const zoomBy = useCallback((delta: number) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.setZoom(map.getZoom() + delta);
  }, []);

  const shell = cn(
    "relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white",
    isFullScreen ? "h-full" : "h-[360px] md:h-[470px] lg:h-[560px]",
    className,
  );

  if (!webgl) {
    return (
      <div className={shell} ref={containerRef}>
        <MapFallback message="This browser or device does not support WebGL, which the network map requires. Use an up-to-date desktop browser with hardware acceleration enabled." />
      </div>
    );
  }

  const sourcesValid =
    isValidFeatureCollection(regionsData) && isValidFeatureCollection(linksData) &&
    isValidFeatureCollection(corridorsData);

  return (
    <div>
      <div className={shell} ref={containerRef}>
        <h2 className="sr-only">{title}</h2>

        {error || !sourcesValid ? (
          <MapFallback
            message={error ?? "Operational map data could not be validated. Network operations data is unaffected."}
          />
        ) : (
          <Map
            ref={mapRef}
            mapLib={maplibregl}
            initialViewState={{
              bounds: GLOBAL_BOUNDS,
              fitBoundsOptions: { padding: 8 },
            }}
            mapStyle={BASEMAP_STYLE}
            renderWorldCopies={false}
            dragRotate={false}
            touchPitch={false}
            pitchWithRotate={false}
            maxPitch={0}
            minZoom={0.6}
            maxZoom={9}
            attributionControl={false}
            onLoad={handleLoad}
            onError={(e) =>
              setError(
                e?.error?.message
                  ? `The basemap could not be loaded (${e.error.message}). Network operations data is unaffected.`
                  : "The basemap could not be loaded. Network operations data is unaffected.",
              )
            }
            style={{ width: "100%", height: "100%" }}
            aria-label={title}
          >
            {/* 2. Service corridors */}
            <Source id="serviceCorridors" type="geojson" data={corridorsData} promoteId="id">
              <Layer {...corridorLayer} layout={{ ...corridorLayer.layout, ...vis(visibility.serviceCorridors) }} />
            </Source>

            {/* 3-4. Fiber backup then RF fallback */}
            <Source id="fallbackRoutes" type="geojson" data={fallbackData} promoteId="id">
              <Layer {...fiberBackupLayer} layout={{ ...fiberBackupLayer.layout, ...vis(visibility.fiberBackup) }} />
              <Layer {...rfFallbackLayer} layout={{ ...rfFallbackLayer.layout, ...vis(visibility.rfFallback) }} />
            </Source>

            {/* 5-11. Optical links by status, subordinate to prominent states */}
            <Source id="opticalLinks" type="geojson" data={linksData} promoteId="id">
              {linkLayers.map((layer) => (
                <Layer
                  key={layer.id}
                  {...layer}
                  layout={{ ...layer.layout, ...vis(visibility[linkLayerGroup(String(layer.id))]) }}
                />
              ))}
            </Source>

            {/* 12. Region hubs */}
            <Source id="regions" type="geojson" data={regionsData} promoteId="id">
              <Layer {...regionHubLayer} layout={{ ...regionHubLayer.layout, ...vis(true) }} />
              <Layer {...regionHubLabelLayer} layout={{ ...regionHubLabelLayer.layout, ...vis(true) }} />
            </Source>

            {/* 13. Sites (native clustering) */}
            <Source
              id="sites"
              type="geojson"
              data={sitesData}
              promoteId="id"
              cluster
              clusterRadius={38}
              clusterMaxZoom={5}
            >
              <Layer {...siteClusterLayer} layout={{ ...siteClusterLayer.layout, ...vis(visibility.sitePoints) }} />
              <Layer {...siteClusterCountLayer} layout={{ ...siteClusterCountLayer.layout, ...vis(visibility.sitePoints) }} />
              <Layer {...sitePointLayer} layout={{ ...sitePointLayer.layout, ...vis(visibility.sitePoints) }} />
            </Source>

            {/* 14. Predicted risks */}
            <Source id="risks" type="geojson" data={risksData} promoteId="id">
              <Layer {...riskMarkerLayer} layout={{ ...riskMarkerLayer.layout, ...vis(visibility.predictedRisks) }} />
            </Source>

            {/* 15. Active incidents */}
            <Source id="incidents" type="geojson" data={incidentsData} promoteId="id">
              <Layer {...incidentMarkerLayer} layout={{ ...incidentMarkerLayer.layout, ...vis(visibility.activeIncidents) }} />
            </Source>

            {/* 16. Customer impact */}
            <Source id="customerImpact" type="geojson" data={customerImpactData} promoteId="id">
              <Layer
                {...customerImpactMarkerLayer}
                layout={{ ...customerImpactMarkerLayer.layout, ...vis(visibility.customerImpact) }}
              />
            </Source>

            {callouts.map((region) => (
              <RegionCallout key={region.id} region={region} />
            ))}
          </Map>
        )}

        {!loaded && !error && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute inset-0 grid place-items-center bg-white/70 text-[12px] text-slate-600"
          >
            Loading global network basemap…
          </div>
        )}

        {/* Compact operational status strip */}
        <div className="pointer-events-none absolute left-1/2 top-3 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-[10.5px] text-slate-600 shadow-sm sm:flex">
          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Map data current
          </span>
          <span aria-hidden className="text-slate-300">|</span>
          <span>Curated estate loaded</span>
          <span aria-hidden className="text-slate-300">|</span>
          <span>{summary.links} visible links</span>
          <span aria-hidden className="text-slate-300">|</span>
          <span>{summary.risks} predictive risks</span>
          <span aria-hidden className="text-slate-300">|</span>
          <span>Updated 22 seconds ago</span>
        </div>

        {/* Map controls */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <ControlButton label="Zoom in" onClick={() => zoomBy(0.6)}>
            <span aria-hidden className="text-[15px] leading-none">+</span>
          </ControlButton>
          <ControlButton label="Zoom out" onClick={() => zoomBy(-0.6)}>
            <span aria-hidden className="text-[15px] leading-none">−</span>
          </ControlButton>
          <ControlButton label="Reset global view" onClick={resetView}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </ControlButton>
          <ControlButton
            label={isFullScreen ? "Exit full screen map" : "Full screen map"}
            onClick={onToggleFullScreen}
            disabled={!onToggleFullScreen}
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />}
          </ControlButton>
        </div>

        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          <div className="flex flex-col gap-1.5">
            <ControlButton
              label="Map layers"
              pressed={layerPanelOpen}
              onClick={() => setLayerPanelOpen((o) => !o)}
            >
              <Layers className="h-3.5 w-3.5" aria-hidden />
            </ControlButton>
            <ControlButton label="Search (available in a later stage)" disabled>
              <Search className="h-3.5 w-3.5" aria-hidden />
            </ControlButton>
            <ControlButton
              label="Map legend"
              pressed={legendShown}
              onClick={() => setLegendShown((s) => !s)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            </ControlButton>
            <ControlButton label="Time playback (available in a later stage)" disabled>
              <Play className="h-3.5 w-3.5" aria-hidden />
            </ControlButton>
          </div>
          <MapLayerControl
            open={layerPanelOpen}
            visibility={visibility}
            onToggle={toggleLayer}
            onClose={() => setLayerPanelOpen(false)}
          />
        </div>

        {legendShown && (
          <div className="absolute bottom-7 left-3">
            <MapLegend open={legendOpen} onToggle={() => setLegendOpen((o) => !o)} />
          </div>
        )}

        <p className="pointer-events-none absolute bottom-1 right-2 text-[9px] text-slate-400">
          © OpenStreetMap contributors, © CARTO
        </p>
      </div>

      {/* Accessible operational summary */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500" data-testid="glhm-map-summary">
        <span className="sr-only">{summaryText(summary)}</span>
        <span aria-hidden>{summary.regions} regions</span>
        <span aria-hidden>· {summary.links} links</span>
        <span aria-hidden>· {summary.healthy} healthy</span>
        <span aria-hidden>· {summary.watch} watch</span>
        <span aria-hidden>· {summary.atRisk} at risk</span>
        <span aria-hidden>· {summary.degraded} degraded</span>
        <span aria-hidden>· {summary.down} down</span>
        <span aria-hidden>· {summary.incidents} incidents</span>
        <span aria-hidden>· {summary.customerImpact} customer impact</span>
      </div>
    </div>
  );
}

export default GlobalLinkHealthMap;
