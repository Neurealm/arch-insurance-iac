// Global optical connectivity map — simplified equirectangular projection over
// a synthetic land silhouette. Presentation only; all data is injected.
// Supports cursor-anchored wheel zoom, drag-to-pan and keyboard selection.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { statusColors, statusLabels, type OpticalLink } from "../data/goocFixtures";

export interface MapOverlays {
  weather: boolean;
  fallback: boolean;
  impact: boolean;
  predicted: boolean;
}

interface Props {
  links: OpticalLink[];
  selectedId: string | null;
  highlightId?: string | null;
  view: "geographic" | "topology";
  overlays: MapOverlays;
  zoom: number;
  onSelect: (id: string) => void;
  /** Called when the user zooms from inside the map (wheel / pinch). */
  onZoomChange?: (zoom: number) => void;
}

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 6;

/** Very coarse continent silhouettes in 0-100 percentage space. */
const LANDMASSES = [
  "M8,26 L20,20 L30,24 L28,34 L22,40 L18,52 L12,44 L7,34 Z",
  "M28,56 L34,50 L40,56 L38,70 L32,80 L28,70 Z",
  "M44,22 L58,18 L64,24 L58,32 L48,34 L44,28 Z",
  "M46,36 L58,34 L60,46 L56,62 L50,70 L44,58 L44,44 Z",
  "M62,26 L84,22 L92,30 L86,44 L74,50 L66,44 L62,34 Z",
  "M66,52 L78,50 L82,58 L76,66 L68,62 Z",
  "M82,66 L92,64 L94,74 L86,78 L82,72 Z",
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function GoocMap({
  links,
  selectedId,
  highlightId,
  view,
  overlays,
  zoom,
  onSelect,
  onZoomChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  const positioned = useMemo(() => {
    if (view === "geographic") return links;
    // Topology view: lay links out on a deterministic grid.
    const cols = 5;
    return links.map((l, i) => {
      const cx = 12 + (i % cols) * 19;
      const cy = 24 + Math.floor(i / cols) * 26;
      return { ...l, ax: cx, ay: cy, bx: cx + 9, by: cy + 9 };
    });
  }, [links, view]);

  // Keep the visible area inside the map bounds (viewBox units).
  const clampOffset = useCallback((x: number, y: number, z: number) => {
    const span = Math.max(0, 100 * z - 100);
    return { x: clamp(x, -span, 0), y: clamp(y, -span, 0) };
  }, []);

  // Reset the pan whenever the map is reset to its default zoom or the view flips.
  useEffect(() => {
    if (zoom <= 1) setOffset({ x: 0, y: 0 });
    else setOffset((o) => clampOffset(o.x, o.y, zoom));
  }, [zoom, clampOffset]);

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [view]);

  // Cursor-anchored wheel zoom. React's onWheel is passive, so bind natively.
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    if (!onZoomChange) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    const next = clamp(zoom * Math.exp(-dy * 0.0015), MIN_ZOOM, MAX_ZOOM);
    if (next === zoom) return;
    // Convert pointer to viewBox units (viewBox is 0 0 100 100, stretched to fit).
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const k = next / zoom;
    setOffset((o) => clampOffset(px - (px - o.x) * k, py - (py - o.y) * k, next));
    onZoomChange(Number(next.toFixed(3)));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || zoom <= 1) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      px: ((e.clientX - rect.left) / rect.width) * 100,
      py: ((e.clientY - rect.top) / rect.height) * 100,
      ox: offset.x,
      oy: offset.y,
    };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setOffset(clampOffset(d.ox + (px - d.px), d.oy + (py - d.py), zoom));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  // Counter-scale strokes and markers so they stay legible while zoomed.
  const s = 1 / zoom;
  const showLabels = zoom >= 1.6;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[460px] w-full touch-none overflow-hidden rounded-lg border border-slate-200 bg-slate-50",
        zoom > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full select-none"
        role="img"
        aria-label={`Global optical connectivity map showing ${links.length} synthetic links`}
      >
        <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
          {view === "geographic" && (
            <>
              <rect x="0" y="0" width="100" height="100" fill="#f8fafc" />
              {[20, 40, 60, 80].map((y) => (
                <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#e2e8f0" strokeWidth={0.15 * s} />
              ))}
              {[20, 40, 60, 80].map((x) => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#e2e8f0" strokeWidth={0.15 * s} />
              ))}
              {LANDMASSES.map((d, i) => (
                <path key={i} d={d} fill="#e8eef5" stroke="#cbd5e1" strokeWidth={0.2 * s} />
              ))}
            </>
          )}

          {positioned.map((l) => {
            const color = statusColors[l.status];
            const isSel = l.id === selectedId;
            const isHi = l.id === highlightId;
            const mx = (l.ax + l.bx) / 2;
            const my = (l.ay + l.by) / 2;
            const showWeather = overlays.weather && (l.status === "at_risk" || l.weatherRisk.toLowerCase().includes("rain"));
            const showFallback = overlays.fallback && l.status === "rf_fallback";
            const showImpact = overlays.impact && (l.status === "unavailable" || l.status === "degraded");
            const showPredicted = overlays.predicted && l.status === "at_risk";
            return (
              <g
                key={l.id}
                role="button"
                tabIndex={0}
                aria-label={`${l.name} — ${statusLabels[l.status]}`}
                aria-pressed={isSel}
                onClick={() => onSelect(l.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(l.id); }
                }}
                className="cursor-pointer outline-none"
              >
                {/* Invisible hit area so thin links stay easy to click. */}
                <line x1={l.ax} y1={l.ay} x2={l.bx} y2={l.by} stroke="transparent" strokeWidth={3 * s} strokeLinecap="round" />
                {(isSel || isHi) && (
                  <circle cx={mx} cy={my} r={4.2 * s} fill={color} opacity={0.18}>
                    <animate attributeName="r" values={`${3.2 * s};${5.4 * s};${3.2 * s}`} dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                {showWeather && <circle cx={mx} cy={my} r={3.4 * s} fill="#d97706" opacity={0.12} />}
                {showPredicted && <circle cx={mx} cy={my} r={5.2 * s} fill="none" stroke="#d97706" strokeWidth={0.18 * s} strokeDasharray={`${0.8 * s} ${0.8 * s}`} />}
                {showImpact && <circle cx={mx} cy={my} r={2.6 * s} fill="none" stroke="#e11d48" strokeWidth={0.28 * s} />}
                <line
                  x1={l.ax} y1={l.ay} x2={l.bx} y2={l.by}
                  stroke={color}
                  strokeWidth={(isSel ? 0.85 : 0.5) * s}
                  strokeLinecap="round"
                  strokeDasharray={l.status === "stale" || l.status === "maintenance" ? `${1 * s} ${0.8 * s}` : undefined}
                  opacity={0.95}
                />
                {showFallback && (
                  <line x1={l.ax} y1={l.ay + 1.2 * s} x2={l.bx} y2={l.by + 1.2 * s} stroke="#0284c7" strokeWidth={0.35 * s} strokeDasharray={`${0.6 * s} ${0.6 * s}`} />
                )}
                <circle cx={l.ax} cy={l.ay} r={(isSel ? 1.05 : 0.75) * s} fill={color} stroke="#ffffff" strokeWidth={0.18 * s} />
                <circle cx={l.bx} cy={l.by} r={(isSel ? 1.05 : 0.75) * s} fill={color} stroke="#ffffff" strokeWidth={0.18 * s} />
                {(showLabels || isSel || isHi) && (
                  <text
                    x={mx}
                    y={my - 1.8 * s}
                    textAnchor="middle"
                    fontSize={2.4 * s}
                    fill="#334155"
                    stroke="#ffffff"
                    strokeWidth={0.7 * s}
                    paintOrder="stroke"
                    className="pointer-events-none"
                  >
                    {l.name}
                  </text>
                )}
                <title>{`${l.name} · ${statusLabels[l.status]} · ${l.customer}`}</title>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute right-2 top-2 rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-[10px] text-slate-600 backdrop-blur">
        {Math.round(zoom * 100)}% · scroll to zoom{zoom > 1 ? " · drag to pan" : ""}
      </div>

      <ul className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-x-3 gap-y-1 rounded-md border border-slate-200 bg-white/90 px-2 py-1.5 text-[10px] text-slate-600 backdrop-blur">
        {(Object.keys(statusLabels) as (keyof typeof statusLabels)[]).map((st) => (
          <li key={st} className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded" style={{ backgroundColor: statusColors[st] }} aria-hidden />
            {statusLabels[st]}
          </li>
        ))}
      </ul>

      {links.length === 0 && (
        <div className={cn("absolute inset-0 grid place-items-center text-[12px] text-slate-500")}>
          No links match the current filters
        </div>
      )}
    </div>
  );
}
