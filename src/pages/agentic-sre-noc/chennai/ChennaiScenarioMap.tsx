/**
 * AIM-003 — Chennai scenario map.
 *
 * Genuine MapLibre GL rendering of the six synthetic Chennai optical links,
 * their terminals, the exposed customer-service route, the RF fallback path
 * and the dense-fog risk zone. No SVG map, background image or percentage
 * positioning is used anywhere in this component.
 */

import * as React from "react";
import Map, { Layer, Source, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Maximize2, Minimize2, Move, RotateCcw, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildCustomerServiceLocationGeoJSON, buildCustomerServiceRouteGeoJSON,
  buildOpticalLinksGeoJSON, buildRfFallbackRouteGeoJSON, buildSelectedLinkEndpointsGeoJSON,
  buildTerminalSitesGeoJSON, buildWeatherRiskZoneGeoJSON, computeScenarioBounds,
  isValidChennaiCollection, type PredictionOverrides,
} from "./chennaiGeojson";
import {
  CHENNAI_LAYER_GROUPS, customerLocationLayer, customerRouteLayer, DEFAULT_CHENNAI_VISIBILITY,
  highRiskCasingLayer, highRiskLinkLayer, linkHitLayer, linkLabelLayer, lowRiskLinkLayer,
  moderateRiskLinkLayer, rfFallbackLayer, selectedEndpointLayer, selectedHaloLayer,
  selectedLineLayer, selectedLinkFilter, terminalLabelLayer, terminalLayer, unknownRiskLinkLayer, weatherFillLayer,
  weatherOutlineLayer, withVisibility, type ChennaiLayerGroup,
} from "./chennaiLayers";
import { getTerminal } from "./chennaiFixtures";

const BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

export interface ChennaiMapProps {
  selectedLinkId: string | null;
  onSelectLink: (id: string) => void;
  selectedTerminalId: string | null;
  onSelectTerminal: (id: string | null) => void;
  /** Live What-If prediction overrides keyed by link id. */
  overrides?: PredictionOverrides;
  visibility: Record<ChennaiLayerGroup, boolean>;
  onToggleLayer: (group: ChennaiLayerGroup) => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  /** Increment to force a `map.resize()`, for example when a drawer opens. */
  resizeSignal?: number;
  className?: string;
}

interface HoverState {
  kind: "link" | "terminal";
  id: string;
  x: number;
  y: number;
  props: Record<string, unknown>;
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

function ControlButton({
  label, onClick, pressed, disabled, children,
}: {
  label: string; onClick?: () => void; pressed?: boolean; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md border shadow-sm transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
        pressed ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600",
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-slate-50 hover:text-slate-900",
      )}
    >
      {children}
    </button>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-medium text-slate-900">{v}</dd>
    </div>
  );
}

export function ChennaiScenarioMap({
  selectedLinkId, onSelectLink, selectedTerminalId, onSelectTerminal, overrides,
  visibility, onToggleLayer, isFullScreen = false, onToggleFullScreen, resizeSignal = 0, className,
}: ChennaiMapProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MapRef | null>(null);
  const hoveredRef = React.useRef<{ source: string; id: string } | null>(null);
  const [webgl] = React.useState(hasWebGL);
  const [error, setError] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [hover, setHover] = React.useState<HoverState | null>(null);
  const [layerPanelOpen, setLayerPanelOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  const bounds = React.useMemo(() => computeScenarioBounds(), []);
  const linksData = React.useMemo(() => buildOpticalLinksGeoJSON(overrides), [overrides]);
  const terminalsData = React.useMemo(() => buildTerminalSitesGeoJSON(), []);
  const routeData = React.useMemo(() => buildCustomerServiceRouteGeoJSON(), []);
  const fallbackData = React.useMemo(() => buildRfFallbackRouteGeoJSON(), []);
  const weatherData = React.useMemo(() => buildWeatherRiskZoneGeoJSON(), []);
  const customerData = React.useMemo(() => buildCustomerServiceLocationGeoJSON(), []);
  const endpointsData = React.useMemo(
    () => buildSelectedLinkEndpointsGeoJSON(selectedLinkId), [selectedLinkId],
  );

  const sourcesValid =
    isValidChennaiCollection(linksData) &&
    isValidChennaiCollection(terminalsData) &&
    isValidChennaiCollection(weatherData);

  /* Resize on container, drawer, grid and breakpoint changes. */
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => mapRef.current?.getMap()?.resize());
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const id = window.setTimeout(() => mapRef.current?.getMap()?.resize(), 80);
    return () => window.clearTimeout(id);
  }, [isFullScreen, resizeSignal]);

  const handleLoad = React.useCallback(() => {
    setLoaded(true);
    const map = mapRef.current?.getMap();
    if (!map) return;
    try {
      for (const layer of map.getStyle().layers ?? []) {
        if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", "#f8fafc");
        if (layer.id.includes("water") && layer.type === "fill") {
          map.setPaintProperty(layer.id, "fill-color", "#ffffff");
        }
        if (layer.id.includes("landcover") || layer.id.includes("landuse")) {
          if (layer.type === "fill") map.setPaintProperty(layer.id, "fill-color", "#f1f5f9");
        }
        if (layer.id.includes("boundary") && layer.type === "line") {
          map.setPaintProperty(layer.id, "line-color", "#cbd5e1");
          map.setPaintProperty(layer.id, "line-width", 0.6);
        }
        if (layer.id.includes("poi") || layer.id.includes("building")) {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      }
    } catch {
      /* style variations are non-fatal */
    }
  }, []);

  const clearHoverState = React.useCallback(() => {
    const map = mapRef.current?.getMap();
    const prev = hoveredRef.current;
    if (map && prev) {
      try {
        map.setFeatureState({ source: prev.source, id: prev.id }, { hover: false });
      } catch {
        /* source may not be ready */
      }
    }
    hoveredRef.current = null;
  }, []);

  const handleMouseMove = React.useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) {
      clearHoverState();
      setHover(null);
      return;
    }
    const source = feature.layer.id === "chn-terminals" ? "chn-terminal-sites" : "chn-optical-links";
    const id = String(feature.properties?.id ?? feature.id ?? "");
    if (!id) return;
    if (hoveredRef.current?.id !== id) {
      clearHoverState();
      const map = mapRef.current?.getMap();
      try {
        map?.setFeatureState({ source, id }, { hover: true });
      } catch {
        /* ignore */
      }
      hoveredRef.current = { source, id };
    }
    setHover({
      kind: source === "chn-terminal-sites" ? "terminal" : "link",
      id,
      x: e.point.x,
      y: e.point.y,
      props: (feature.properties ?? {}) as Record<string, unknown>,
    });
  }, [clearHoverState]);

  const handleMouseLeave = React.useCallback(() => {
    clearHoverState();
    setHover(null);
  }, [clearHoverState]);

  const handleClick = React.useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) {
      // Empty space: clear hover only; selection, filters and camera persist.
      setHover(null);
      return;
    }
    const id = String(feature.properties?.id ?? feature.id ?? "");
    if (feature.layer.id === "chn-terminals") {
      onSelectTerminal(id);
      const terminal = getTerminal(id);
      if (terminal) onSelectLink(terminal.linkId);
      return;
    }
    onSelectLink(id);
    onSelectTerminal(null);
  }, [onSelectLink, onSelectTerminal]);

  const fitAll = React.useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    map.fitBounds(bounds, { padding: 28, duration: reduced ? 0 : 400, bearing: 0, pitch: 0 });
  }, [bounds]);

  const zoomBy = React.useCallback((delta: number) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.setZoom(map.getZoom() + delta);
  }, []);

  const shell = cn(
    "relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white",
    isFullScreen ? "h-full w-full" : "h-[350px] w-full sm:h-[420px] xl:h-[400px]",
    className,
  );

  if (!webgl) {
    return (
      <div className={shell} ref={containerRef} data-testid="chennai-map-fallback">
        <MapFallback
          message="This browser or device does not support WebGL, which the Chennai scenario map requires."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className={shell} ref={containerRef} data-testid="chennai-map">
      <h3 className="sr-only">Chennai fog scenario optical link map</h3>

      {error || !sourcesValid ? (
        <MapFallback
          message={
            error ??
            "Chennai scenario geometry could not be validated. The selected-link summary and link table below remain available."
          }
          onRetry={() => setError(null)}
        />
      ) : (
        <Map
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={{ bounds, fitBoundsOptions: { padding: 28 } }}
          mapStyle={BASEMAP_STYLE}
          renderWorldCopies={false}
          dragRotate={false}
          touchPitch={false}
          pitchWithRotate={false}
          maxPitch={0}
          minZoom={8}
          maxZoom={16}
          attributionControl={false}
          interactiveLayerIds={["chn-link-hit", "chn-terminals"]}
          onLoad={handleLoad}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onError={(e) =>
            setError(
              e?.error?.message
                ? `The basemap could not be loaded (${e.error.message}). Prediction data is unaffected.`
                : "The basemap could not be loaded. Prediction data is unaffected.",
            )
          }
          style={{ width: "100%", height: "100%" }}
          aria-label="Chennai fog scenario optical link map"
        >
          {/* 2. Weather-risk polygon */}
          <Source id="chn-weather-risk-zone" type="geojson" data={weatherData} promoteId="id">
            <Layer {...withVisibility(weatherFillLayer, visibility.weatherRisk)} />
            <Layer {...withVisibility(weatherOutlineLayer, visibility.weatherRisk)} />
          </Source>

          {/* 3. Customer-service route */}
          <Source id="chn-customer-service-route" type="geojson" data={routeData} promoteId="id">
            <Layer {...withVisibility(customerRouteLayer, visibility.customerService)} />
          </Source>

          {/* 4. RF fallback route */}
          <Source id="chn-rf-fallback-route" type="geojson" data={fallbackData} promoteId="id">
            <Layer {...withVisibility(rfFallbackLayer, visibility.rfFallback)} />
          </Source>

          {/* 5-7 and selection: single optical-link source, filtered layers */}
          <Source id="chn-optical-links" type="geojson" data={linksData} promoteId="id">
            <Layer {...withVisibility(unknownRiskLinkLayer, visibility.opticalLinks)} />
            <Layer {...withVisibility(lowRiskLinkLayer, visibility.opticalLinks)} />
            <Layer {...withVisibility(moderateRiskLinkLayer, visibility.opticalLinks)} />
            <Layer {...withVisibility(highRiskCasingLayer, visibility.opticalLinks)} />
            <Layer {...withVisibility(highRiskLinkLayer, visibility.opticalLinks)} />
            <Layer
              {...withVisibility(
                { ...selectedHaloLayer, filter: selectedLinkFilter(selectedLinkId) },
                visibility.opticalLinks,
              )}
            />
            <Layer
              {...withVisibility(
                { ...selectedLineLayer, filter: selectedLinkFilter(selectedLinkId) },
                visibility.opticalLinks,
              )}
            />
            <Layer {...withVisibility(linkLabelLayer, visibility.labels && visibility.opticalLinks)} />
            <Layer {...linkHitLayer} />
          </Source>

          {/* 8. Terminal sites */}
          <Source id="chn-terminal-sites" type="geojson" data={terminalsData} promoteId="id">
            <Layer {...withVisibility(terminalLayer, visibility.terminalSites)} />
            <Layer {...withVisibility(terminalLabelLayer, visibility.labels && visibility.terminalSites)} />
          </Source>

          {/* 9. Customer-service location */}
          <Source id="chn-customer-service-location" type="geojson" data={customerData} promoteId="id">
            <Layer {...withVisibility(customerLocationLayer, visibility.customerService)} />
          </Source>

          {/* 12. Selected endpoint rings */}
          <Source id="chn-selected-link-endpoints" type="geojson" data={endpointsData} promoteId="id">
            <Layer {...withVisibility(selectedEndpointLayer, visibility.opticalLinks)} />
          </Source>
        </Map>
      )}

      {!loaded && !error && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-0 grid place-items-center bg-white/70 text-[12px] text-slate-600"
        >
          Loading Chennai basemap…
        </div>
      )}

      {/* 14. Hover overlay */}
      {hover && (
        <div
          role="tooltip"
          data-testid="chennai-map-tooltip"
          className="pointer-events-none absolute z-20 w-60 rounded-lg border border-slate-200 bg-white/98 p-2 text-[10.5px] shadow-md"
          style={{
            left: Math.min(Math.max(hover.x + 12, 8), (containerRef.current?.clientWidth ?? 400) - 250),
            top: Math.min(Math.max(hover.y + 12, 8), (containerRef.current?.clientHeight ?? 300) - 190),
          }}
        >
          {hover.kind === "link" ? (
            <>
              <p className="mb-1 text-[11px] font-semibold text-slate-900">{String(hover.props.id)}</p>
              <dl className="space-y-0.5">
                <Row k="Risk score" v={Number(hover.props.riskScore).toFixed(2)} />
                <Row k="Risk class" v={String(hover.props.riskClass)} />
                <Row k="Confidence" v={`${hover.props.confidence}%`} />
                <Row k="ETA to impact" v={formatMinutes(Number(hover.props.predictedImpactMinutes))} />
                <Row k="Capacity" v={`${hover.props.capacityGbps} Gbps`} />
                <Row k="Customer services" v={String(hover.props.customerServiceCount)} />
                <Row k="Primary driver" v={String(hover.props.primaryDriver)} />
                <Row k="Link margin" v={`${hover.props.linkMarginDb} dB`} />
                <Row k="Visibility forecast" v={`${hover.props.visibilityKm} km`} />
                <Row k="Fallback" v={hover.props.fallbackReady ? "Ready" : "Not ready"} />
                <Row k="Data quality" v={`${hover.props.dataQuality}%`} />
              </dl>
            </>
          ) : (
            <>
              <p className="mb-1 text-[11px] font-semibold text-slate-900">{String(hover.props.id)}</p>
              <dl className="space-y-0.5">
                <Row k="Product" v={String(hover.props.product)} />
                <Row k="Health" v={String(hover.props.health)} />
                <Row k="Paired terminal" v={String(hover.props.pairedTerminalId)} />
                <Row k="Beam lock" v={String(hover.props.beamLock)} />
                <Row k="Temperature" v={`${hover.props.temperatureC} C`} />
                <Row k="Firmware" v={String(hover.props.firmware)} />
                <Row k="Telemetry" v={`${hover.props.telemetryFreshnessSec} s ago`} />
              </dl>
            </>
          )}
        </div>
      )}

      {/* Map controls */}
      <div className="absolute left-2 top-2 flex flex-col gap-1">
        <ControlButton label="Zoom in" onClick={() => zoomBy(0.6)}>
          <span aria-hidden className="text-[14px] leading-none">+</span>
        </ControlButton>
        <ControlButton label="Zoom out" onClick={() => zoomBy(-0.6)}>
          <span aria-hidden className="text-[14px] leading-none">−</span>
        </ControlButton>
        <ControlButton label="Reset Chennai view" onClick={fitAll}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </ControlButton>
        <ControlButton label="Fit all links" onClick={fitAll}>
          <Move className="h-3.5 w-3.5" aria-hidden />
        </ControlButton>
        <ControlButton
          label={isFullScreen ? "Exit full-screen map" : "Full-screen map"}
          onClick={onToggleFullScreen}
          disabled={!onToggleFullScreen}
          pressed={isFullScreen}
        >
          {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />}
        </ControlButton>
      </div>

      <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
        <div className="flex flex-col gap-1">
          <ControlButton label="Layer control" pressed={layerPanelOpen} onClick={() => setLayerPanelOpen((o) => !o)}>
            <Layers className="h-3.5 w-3.5" aria-hidden />
          </ControlButton>
          <ControlButton label="Map help" pressed={helpOpen} onClick={() => setHelpOpen((o) => !o)}>
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
          </ControlButton>
        </div>

        {layerPanelOpen && (
          <fieldset
            data-testid="chennai-layer-control"
            className="w-44 rounded-lg border border-slate-200 bg-white/98 p-2 shadow-md"
          >
            <legend className="px-1 text-[10px] font-semibold text-slate-700">Map layers</legend>
            {CHENNAI_LAYER_GROUPS.map((g) => (
              <label key={g.id} className="flex items-center gap-1.5 py-0.5 text-[10.5px] text-slate-700">
                <input
                  type="checkbox"
                  checked={visibility[g.id]}
                  onChange={() => onToggleLayer(g.id)}
                  className="h-3 w-3 rounded border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                {g.label}
              </label>
            ))}
          </fieldset>
        )}

        {helpOpen && (
          <div className="w-56 rounded-lg border border-slate-200 bg-white/98 p-2 text-[10.5px] text-slate-600 shadow-md">
            <p className="font-semibold text-slate-800">Map help</p>
            <p className="mt-0.5">
              Hover a link or terminal for its operational detail. Click a link to select it and update the
              prediction summary and pipeline. Click a terminal to inspect it and highlight its paired link.
              Clicking empty map space preserves the current selection and camera.
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-lg border border-slate-200 bg-white/95 px-2 py-1.5 text-[10px] text-slate-600 shadow-sm">
        <p className="font-semibold text-slate-800">Predicted risk</p>
        <ul className="mt-0.5 space-y-0.5">
          {[
            ["High", "#dc2626"], ["Moderate", "#d97706"], ["Low", "#059669"],
          ].map(([label, color]) => (
            <li key={label} className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: color }} aria-hidden />
              {label}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded border-t border-dashed border-slate-500" aria-hidden />
            RF fallback and service route
          </li>
        </ul>
      </div>

      {selectedTerminalId && (
        <div className="absolute bottom-2 right-2 rounded-lg border border-slate-200 bg-white/95 px-2 py-1 text-[10px] text-slate-700 shadow-sm">
          Terminal selected: <span className="font-semibold">{selectedTerminalId}</span>
        </div>
      )}
    </div>
  );
}

function MapFallback({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="status"
      className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-slate-50 px-6 text-center"
    >
      <p className="text-[13px] font-semibold text-slate-800">Chennai map view unavailable</p>
      <p className="max-w-md text-[11.5px] text-slate-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Retry map
        </button>
      )}
    </div>
  );
}

export function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes)) return "Not predicted";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}
