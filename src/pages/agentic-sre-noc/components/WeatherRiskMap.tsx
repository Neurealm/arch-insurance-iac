/**
 * Weather Intelligence Twin — global atmospheric risk map.
 *
 * Presentation only; all data is injected. Simplified equirectangular canvas
 * with coarse continent silhouettes, weather system zones, optical routes,
 * terminal sites and keyboard-selectable elements.
 */

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  weatherRiskColors, type WeatherLink, type WeatherSystem,
} from "../data/witFixtures";

export interface WeatherLayers {
  routes: boolean;
  terminals: boolean;
  systems: boolean;
  visibility: boolean;
  fog: boolean;
  rain: boolean;
  wind: boolean;
  humidity: boolean;
  capacity: boolean;
  customers: boolean;
  watches: boolean;
  degradation: boolean;
  fallback: boolean;
  dataGaps: boolean;
}

export const defaultWeatherLayers: WeatherLayers = {
  routes: true, terminals: true, systems: true, visibility: false, fog: true,
  rain: true, wind: false, humidity: false, capacity: false, customers: false,
  watches: true, degradation: true, fallback: false, dataGaps: true,
};

export const weatherLayerLabels: [keyof WeatherLayers, string][] = [
  ["routes", "Optical routes"], ["terminals", "Terminal sites"], ["systems", "Weather systems"],
  ["visibility", "Visibility zones"], ["fog", "Fog zones"], ["rain", "Heavy rain zones"],
  ["wind", "Wind exposure"], ["humidity", "Humidity exposure"], ["capacity", "Capacity exposure"],
  ["customers", "Customer service exposure"], ["watches", "Active weather watches"],
  ["degradation", "Predicted link degradation"], ["fallback", "Fallback readiness"],
  ["dataGaps", "Data-quality gaps"],
];

interface Props {
  systems: WeatherSystem[];
  links: WeatherLink[];
  selectedSystem: string | null;
  selectedLink: string | null;
  layers: WeatherLayers;
  view: "geographic" | "corridor";
  zoom: number;
  onSelectSystem: (id: string) => void;
  onSelectLink: (id: string) => void;
  height?: number;
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

const driverLayer: Record<string, keyof WeatherLayers> = {
  "Dense fog": "fog",
  "Low visibility": "visibility",
  "Heavy rain": "rain",
  "High humidity": "humidity",
  Wind: "wind",
  "Dust or smoke": "visibility",
  "Convective activity": "rain",
};

export function WeatherRiskMap({
  systems, links, selectedSystem, selectedLink, layers, view, zoom,
  onSelectSystem, onSelectLink, height = 430,
}: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  const laidOutLinks = view === "geographic"
    ? links
    : links.map((l, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = 10 + col * 15;
      const y = 20 + row * 14;
      return { ...l, ax: x, ay: y, bx: x + 6, by: y + 6 };
    });

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
      style={{ height }}
      onPointerDown={(e) => {
        drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        setOffset({
          x: clamp(drag.current.ox + (e.clientX - drag.current.px) / 8, -50, 50),
          y: clamp(drag.current.oy + (e.clientY - drag.current.py) / 8, -50, 50),
        });
      }}
      onPointerUp={() => { drag.current = null; }}
      onPointerLeave={() => { drag.current = null; }}
    >
      <svg
        viewBox="0 0 100 90"
        className="h-full w-full touch-none"
        role="img"
        aria-label="Global atmospheric risk map showing weather systems, optical routes, terminal sites and predicted link degradation"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${50 + offset.x} ${45 + offset.y}) scale(${zoom}) translate(-50 -45)`}>
          {view === "geographic" && LANDMASSES.map((d, i) => (
            <path key={i} d={d} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.2} />
          ))}

          {/* Weather systems */}
          {layers.systems && view === "geographic" && systems.map((s) => {
            const color = weatherRiskColors[s.state];
            const zoneLayer = driverLayer[s.driver];
            const zoneVisible = !zoneLayer || layers[zoneLayer];
            const active = selectedSystem === s.id;
            return (
              <g key={s.id}>
                {zoneVisible && (
                  <circle cx={s.x} cy={s.y} r={s.radius} fill={color} fillOpacity={active ? 0.28 : 0.16}
                    stroke={color} strokeOpacity={0.5} strokeWidth={active ? 0.4 : 0.2} />
                )}
                {layers.watches && s.watchActive && (
                  <circle cx={s.x} cy={s.y} r={s.radius + 1.2} fill="none" stroke={color}
                    strokeOpacity={0.45} strokeWidth={0.18} strokeDasharray="1 0.8" />
                )}
                {layers.dataGaps && s.dataGap && (
                  <rect x={s.x - 1.4} y={s.y - 1.4} width={2.8} height={2.8} fill="none"
                    stroke="#94a3b8" strokeWidth={0.25} strokeDasharray="0.6 0.5" />
                )}
                {layers.capacity && s.linksAtRisk > 0 && (
                  <circle cx={s.x} cy={s.y} r={Math.min(6, 1 + s.linksAtRisk * 0.6)} fill="#2563eb" fillOpacity={0.1} />
                )}
                <circle
                  cx={s.x} cy={s.y} r={1.4}
                  fill={color}
                  tabIndex={0}
                  role="button"
                  aria-label={`${s.region} weather system, ${s.driver}, risk ${s.state}, ${s.linksAtRisk} links at risk`}
                  className="cursor-pointer focus:outline-none focus-visible:stroke-slate-900"
                  strokeWidth={active ? 0.5 : 0}
                  stroke="#0f172a"
                  onClick={() => onSelectSystem(s.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectSystem(s.id); } }}
                />
              </g>
            );
          })}

          {/* Optical routes */}
          {layers.routes && laidOutLinks.map((l) => {
            const color = weatherRiskColors[l.state];
            const active = selectedLink === l.id;
            const dim = selectedSystem && !systems.find((s) => s.id === selectedSystem)?.linkIds.includes(l.id);
            return (
              <g key={l.id} opacity={dim ? 0.2 : 1}>
                <line x1={l.ax} y1={l.ay} x2={l.bx} y2={l.by} stroke={color}
                  strokeWidth={active ? 1 : 0.5}
                  strokeDasharray={l.state === "No data" ? "1 0.8" : undefined} />
                {layers.degradation && (l.state === "At risk" || l.state === "High" || l.state === "Severe") && (
                  <circle cx={(l.ax + l.bx) / 2} cy={(l.ay + l.by) / 2} r={1.8} fill={color} fillOpacity={0.14} />
                )}
                {layers.customers && l.servicesExposed > 0 && (
                  <circle cx={(l.ax + l.bx) / 2} cy={(l.ay + l.by) / 2} r={1 + l.servicesExposed * 0.3}
                    fill="#7c3aed" fillOpacity={0.1} />
                )}
                {layers.fallback && (
                  <circle cx={l.bx} cy={l.by} r={1.1} fill="none"
                    stroke={l.fallback.startsWith("Ready") ? "#059669" : "#e11d48"}
                    strokeOpacity={0.6} strokeWidth={0.18} />
                )}
                {layers.terminals && (
                  <>
                    <circle
                      cx={l.ax} cy={l.ay} r={active ? 1.2 : 0.8}
                      fill={color}
                      tabIndex={0}
                      role="button"
                      aria-label={`${l.id}, ${l.name}, risk ${l.state}, driver ${l.driver}`}
                      className="cursor-pointer focus:outline-none focus-visible:stroke-slate-900"
                      stroke="#0f172a" strokeWidth={active ? 0.4 : 0}
                      onClick={() => onSelectLink(l.id)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectLink(l.id); } }}
                    />
                    <circle cx={l.bx} cy={l.by} r={0.6} fill={color} />
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected system callout */}
      {view === "geographic" && systems.filter((s) => s.id === selectedSystem).map((s) => (
        <div
          key={s.id}
          className="absolute w-[190px] rounded-md border border-slate-200 bg-white/95 p-2 text-[10.5px] shadow-sm backdrop-blur"
          style={{ left: `${clamp(s.x + 6, 2, 68)}%`, top: `${clamp(s.y - 6, 2, 70)}%` }}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="truncate font-semibold text-slate-900">{s.region}</span>
            <span className="rounded px-1 py-px text-[9px] font-semibold"
              style={{ backgroundColor: `${weatherRiskColors[s.state]}1a`, color: weatherRiskColors[s.state] }}>
              {s.state}
            </span>
          </div>
          <div className="mt-0.5 text-slate-600">{s.driver} · {s.secondaryDriver}</div>
          <dl className="mt-1 space-y-0.5 text-slate-600">
            <div className="flex justify-between"><dt>Visibility</dt><dd>{s.visibilityKm} to {s.forecastVisibilityKm}</dd></div>
            <div className="flex justify-between"><dt>Links under watch</dt><dd>{s.linksUnderWatch}</dd></div>
            <div className="flex justify-between"><dt>Links at risk</dt><dd>{s.linksAtRisk}</dd></div>
            <div className="flex justify-between"><dt>Capacity exposed</dt><dd>{s.capacityExposed}</dd></div>
          </dl>
        </div>
      ))}

      <div className={cn("pointer-events-none absolute bottom-1.5 left-2 text-[9.5px] text-slate-500")}>
        Synthetic demonstration data. Drag to pan.
      </div>
    </div>
  );
}
