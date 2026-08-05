/**
 * GLHM-MAP-001 — Global Link Health Map (foundation).
 *
 * Production MapLibre GL container for the Agentic SRE NOC mapping
 * framework. Presentation only: no operational overlays, telemetry,
 * incidents or selections are rendered at this stage.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Source, type MapRef } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Maximize2, Minimize2, Play, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { createNocMapSources, isValidFeatureCollection, type NocMapSourceId } from "./geojson";
import type { CameraView } from "./types";

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
  children: React.ReactNode;
}

function ControlButton({ label, onClick, disabled, children }: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
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

  const sources = useMemo(() => createNocMapSources(), []);
  const sourceEntries = useMemo(
    () =>
      (Object.entries(sources) as Array<[NocMapSourceId, ReturnType<typeof createNocMapSources>[NocMapSourceId]]>)
        .filter(([, data]) => isValidFeatureCollection(data)),
    [sources],
  );

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

  return (
    <div className={shell} ref={containerRef}>
      <h2 className="sr-only">{title}</h2>

      {error ? (
        <MapFallback message={error} />
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
          {sourceEntries.map(([id, data]) => (
            <Source key={id} id={id} type="geojson" data={data} />
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

      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <ControlButton label="Layers (available in a later stage)" disabled>
          <Layers className="h-3.5 w-3.5" aria-hidden />
        </ControlButton>
        <ControlButton label="Search (available in a later stage)" disabled>
          <Search className="h-3.5 w-3.5" aria-hidden />
        </ControlButton>
        <ControlButton label="Legend (available in a later stage)" disabled>
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
        </ControlButton>
        <ControlButton label="Time playback (available in a later stage)" disabled>
          <Play className="h-3.5 w-3.5" aria-hidden />
        </ControlButton>
      </div>
    </div>
  );
}

export default GlobalLinkHealthMap;
