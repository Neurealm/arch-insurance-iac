/**
 * Global Link Health Twin — page-specific world map.
 *
 * Presentation only; all data is injected. Simplified equirectangular
 * projection over coarse continent silhouettes, with zoom, pan, overlays
 * and keyboard-selectable links.
 */

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { twinStateColors, type RegionCallout, type TwinLink } from "../data/glhtFixtures";

export interface TwinOverlays {
  weather: boolean;
  capacity: boolean;
  impact: boolean;
  maintenance: boolean;
  agents: boolean;
}

interface Props {
  links: TwinLink[];
  callouts: RegionCallout[];
  selectedId: string | null;
  highlightRegion?: string | null;
  view: "geographic" | "topology" | "cluster";
  overlays: TwinOverlays;
  zoom: number;
  onSelect: (id: string) => void;
  onSelectRegion: (region: string) => void;
}

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

export function TwinMap({
  links, callouts, selectedId, highlightRegion, view, overlays, zoom, onSelect, onSelectRegion,
}: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  const positioned = useMemo(() => {
    if (view === "geographic") return links;
    // Topology and cluster views lay links out on a deterministic grid.
    const cols = view === "cluster" ? 4 : 6;
    return links.map((l, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = 12 + c * (76 / Math.max(1, cols - 1));
      const y = 22 + r * 18;
      return { ...l, ax: x, ay: y, bx: x + 5, by: y + 8 };
    });
  }, [links, view]);

  return (
    <div
      className="relative h-[420px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
      onPointerDown={(e) => {
        drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        setOffset({
          x: clamp(drag.current.ox + (e.clientX - drag.current.px) / 6, -60, 60),
          y: clamp(drag.current.oy + (e.clientY - drag.current.py) / 6, -60, 60),
        });
      }}
      onPointerUp={() => { drag.current = null; }}
      onPointerLeave={() => { drag.current = null; }}
    >
      <svg
        viewBox="0 0 100 90"
        className="h-full w-full touch-none"
        role="img"
        aria-label="Global link health map showing optical terminals, links and their health state"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${50 + offset.x} ${45 + offset.y}) scale(${zoom}) translate(-50 -45)`}>
          {view === "geographic" && LANDMASSES.map((d, i) => (
            <path key={i} d={d} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.2} />
          ))}

          {positioned.map((l) => {
            const color = twinStateColors[l.state];
            const selected = l.id === selectedId;
            const dim = highlightRegion && l.region !== highlightRegion;
            return (
              <g key={l.id} opacity={dim ? 0.25 : 1}>
                <line
                  x1={l.ax} y1={l.ay} x2={l.bx} y2={l.by}
                  stroke={color}
                  strokeWidth={selected ? 1.1 : 0.55}
                  strokeDasharray={l.state === "On fallback" || l.state === "Telemetry stale" ? "1.4 1" : undefined}
                />
                {overlays.capacity && (
                  <line x1={l.ax} y1={l.ay} x2={l.bx} y2={l.by} stroke="#2563eb" strokeOpacity={0.18}
                    strokeWidth={Math.min(4, 0.6 + l.capacityGbps / 12)} />
                )}
                {overlays.weather && l.weather !== "Clear" && (
                  <circle cx={(l.ax + l.bx) / 2} cy={(l.ay + l.by) / 2} r={2.6} fill="#0ea5e9" fillOpacity={0.14} />
                )}
                {overlays.impact && (l.state === "Down" || l.state === "Degraded" || l.state === "On fallback") && (
                  <circle cx={(l.ax + l.bx) / 2} cy={(l.ay + l.by) / 2} r={2.2} fill="#e11d48" fillOpacity={0.16} />
                )}
                {overlays.maintenance && l.state === "Maintenance" && (
                  <rect x={l.ax - 1.6} y={l.ay - 1.6} width={3.2} height={3.2} fill="#2563eb" fillOpacity={0.18} />
                )}
                {overlays.agents && l.agents.length > 0 && (
                  <circle cx={l.bx} cy={l.by} r={1.6} fill="none" stroke="#4f46e5" strokeOpacity={0.5} strokeWidth={0.18} />
                )}
                <circle
                  cx={l.ax} cy={l.ay} r={selected ? 1.5 : 1}
                  fill={color}
                  tabIndex={0}
                  role="button"
                  aria-label={`${l.id}, ${l.name}, ${l.state}`}
                  className="cursor-pointer focus:outline-none focus-visible:stroke-slate-900"
                  strokeWidth={selected ? 0.5 : 0}
                  stroke="#0f172a"
                  onClick={() => onSelect(l.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(l.id); } }}
                />
                <circle cx={l.bx} cy={l.by} r={0.8} fill={color} />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Region callouts */}
      {view === "geographic" && callouts.map((c) => (
        <button
          key={c.region}
          type="button"
          onClick={() => onSelectRegion(c.region)}
          style={{ left: `${clamp(c.x + offset.x * 0.6, 2, 78)}%`, top: `${clamp(c.y * 0.9 + offset.y * 0.6, 2, 78)}%` }}
          className={cn(
            "absolute w-[132px] rounded-md border bg-white/95 p-1.5 text-left text-[10px] shadow-sm backdrop-blur transition-colors hover:border-blue-400",
            c.state === "At risk" ? "border-amber-300" : "border-slate-200",
            highlightRegion === c.region && "ring-2 ring-blue-400",
          )}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="truncate font-semibold text-slate-900">{c.region}</span>
            <span
              className="rounded px-1 py-px text-[9px] font-semibold"
              style={{ backgroundColor: `${twinStateColors[c.state]}1a`, color: twinStateColors[c.state] }}
            >{c.state}</span>
          </div>
          <div className="mt-0.5 flex justify-between text-slate-600"><span>Links</span><span>{c.links}</span></div>
          <div className="flex justify-between text-slate-600"><span>Capacity</span><span>{c.capacity}</span></div>
          <div className="flex justify-between text-slate-600"><span>Utilization</span><span>{c.utilization}%</span></div>
        </button>
      ))}
    </div>
  );
}
