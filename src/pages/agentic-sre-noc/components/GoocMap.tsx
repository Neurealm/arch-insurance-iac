// Global optical connectivity map — simplified equirectangular projection over
// a synthetic land silhouette. Presentation only; all data is injected.

import { useMemo } from "react";
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
}

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

export function GoocMap({ links, selectedId, highlightId, view, overlays, zoom, onSelect }: Props) {
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

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        role="img"
        aria-label={`Global optical connectivity map showing ${links.length} synthetic links`}
        style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
      >
        {view === "geographic" && (
          <>
            {[20, 40, 60, 80].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#e2e8f0" strokeWidth="0.15" />
            ))}
            {[20, 40, 60, 80].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#e2e8f0" strokeWidth="0.15" />
            ))}
            {LANDMASSES.map((d, i) => (
              <path key={i} d={d} fill="#e8eef5" stroke="#cbd5e1" strokeWidth="0.2" />
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
              onClick={() => onSelect(l.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(l.id); }
              }}
              className="cursor-pointer focus:outline-none"
            >
              {(isSel || isHi) && (
                <circle cx={mx} cy={my} r={4.2} fill={color} opacity={0.14}>
                  <animate attributeName="r" values="3.2;5.4;3.2" dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}
              {showWeather && <circle cx={mx} cy={my} r={3.4} fill="#d97706" opacity={0.12} />}
              {showPredicted && <circle cx={mx} cy={my} r={5.2} fill="none" stroke="#d97706" strokeWidth="0.18" strokeDasharray="0.8 0.8" />}
              {showImpact && <circle cx={mx} cy={my} r={2.6} fill="none" stroke="#e11d48" strokeWidth="0.28" />}
              <line
                x1={l.ax} y1={l.ay} x2={l.bx} y2={l.by}
                stroke={color}
                strokeWidth={isSel ? 0.85 : 0.5}
                strokeDasharray={l.status === "stale" || l.status === "maintenance" ? "1 0.8" : undefined}
                opacity={0.95}
              />
              {showFallback && (
                <line x1={l.ax} y1={l.ay + 1.2} x2={l.bx} y2={l.by + 1.2} stroke="#0284c7" strokeWidth="0.35" strokeDasharray="0.6 0.6" />
              )}
              <circle cx={l.ax} cy={l.ay} r={isSel ? 1.05 : 0.75} fill={color} stroke="#ffffff" strokeWidth="0.18" />
              <circle cx={l.bx} cy={l.by} r={isSel ? 1.05 : 0.75} fill={color} stroke="#ffffff" strokeWidth="0.18" />
              <title>{`${l.name} · ${statusLabels[l.status]} · ${l.customer}`}</title>
            </g>
          );
        })}
      </svg>

      <ul className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-x-3 gap-y-1 rounded-md border border-slate-200 bg-white/90 px-2 py-1.5 text-[10px] text-slate-600 backdrop-blur">
        {(Object.keys(statusLabels) as (keyof typeof statusLabels)[]).map((s) => (
          <li key={s} className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded" style={{ backgroundColor: statusColors[s] }} aria-hidden />
            {statusLabels[s]}
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
