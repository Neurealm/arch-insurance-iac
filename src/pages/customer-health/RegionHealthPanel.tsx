// Interactive region map + region list. Every region shows two independent
// states: the Azure / infrastructure condition, and the customer's own
// service health in that region.

import { WhyThisMatters } from "./whyThisMatters";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { regions } from "./data";
import { statusStyles, useImpactDrawer } from "./primitives";
import { useObjectHighlight } from "./filters";
import type { RegionRow } from "./types";

function HoverCard({ r }: { r: RegionRow }) {
  const infra = statusStyles[r.infraStatus];
  const svc = statusStyles[r.serviceStatus];
  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-60 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-xl">
      <div className="text-[12.5px] font-semibold text-slate-900">{r.name}</div>
      <div className="text-[10.5px] text-slate-500">{r.geo}</div>
      <dl className="mt-2 space-y-1">
        {[
          ["Infrastructure health", infra.label, infra.text],
          ["Your service health", r.hasDeployment ? svc.label : "Not applicable", r.hasDeployment ? svc.text : "text-slate-500"],
          ["Customer deployments", r.hasDeployment ? `${r.deploymentCount} · ${r.nodes} nodes` : "None", "text-slate-700"],
          ["Active events", r.activeEventSummary, "text-slate-700"],
          ["Current exposure", r.exposure, "text-slate-700"],
          ["Potential impact", r.potentialImpact, r.potentialImpact === "None" ? "text-emerald-600" : "text-amber-600"],
        ].map(([k, v, c]) => (
          <div key={k} className="flex items-baseline justify-between gap-3">
            <dt className="text-[10.5px] text-slate-500">{k}</dt>
            <dd className={cn("text-right text-[11px] font-medium", c)}>{v}</dd>
          </div>
        ))}
      </dl>
      {!r.hasDeployment && (
        <p className="mt-2 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] text-slate-600">
          No customer deployment in this region
        </p>
      )}
    </div>
  );
}


/* Equirectangular projection helpers: x = lon + 180, y = 90 - lat. */
type MapViewId = "world" | "americas" | "europe" | "apac";
const MAP_VIEWS: { id: MapViewId; label: string; lon: [number, number]; lat: [number, number] }[] = [
  { id: "world", label: "World", lon: [-180, 180], lat: [-58, 84] },
  { id: "americas", label: "Americas", lon: [-170, -30], lat: [-56, 72] },
  { id: "europe", label: "Europe", lon: [-26, 46], lat: [33, 71] },
  { id: "apac", label: "Asia Pacific", lon: [62, 180], lat: [-46, 56] },
];

function viewBoxOf(v: (typeof MAP_VIEWS)[number]) {
  const x = v.lon[0] + 180;
  const y = 90 - v.lat[1];
  return { x, y, w: v.lon[1] - v.lon[0], h: v.lat[1] - v.lat[0] };
}

function projectRegion(r: RegionRow, v: (typeof MAP_VIEWS)[number]) {
  const box = viewBoxOf(v);
  if (r.lat === undefined || r.lon === undefined) return { left: r.x, top: r.y, visible: true };
  const px = r.lon + 180;
  const py = 90 - r.lat;
  const left = ((px - box.x) / box.w) * 100;
  const top = ((py - box.y) / box.h) * 100;
  return { left, top, visible: left >= -2 && left <= 102 && top >= -2 && top <= 102 };
}

function RegionMarker({
  r, hover, setHover, open, view,
}: {
  r: RegionRow;
  hover: string | null;
  setHover: (fn: string | null | ((h: string | null) => string | null)) => void;
  open: (id: string) => void;
  view: (typeof MAP_VIEWS)[number];
}) {
  const infra = statusStyles[r.infraStatus];
  const svc = statusStyles[r.serviceStatus];
  const { bind, className: corrClass } = useObjectHighlight(`region:${r.id}`);
  const pos = projectRegion(r, view);
  if (!pos.visible) return null;
  const attention = r.infraStatus !== "healthy";
  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
    >
      <button
        type="button"
        onClick={() => open(r.contextId)}
        onMouseEnter={() => { setHover(r.id); bind.onMouseEnter?.(); }}
        onMouseLeave={() => { setHover((h) => (h === r.id ? null : h)); bind.onMouseLeave?.(); }}
        onFocus={() => { setHover(r.id); bind.onFocus?.(); }}
        onBlur={() => { setHover((h) => (h === r.id ? null : h)); bind.onBlur?.(); }}
        aria-label={`${r.name}: infrastructure ${infra.label}, your service ${r.hasDeployment ? svc.label : "not deployed"}`}
        className={cn(
          "relative flex cursor-pointer flex-col items-center rounded-md px-1 py-1 transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70",
          corrClass,
        )}
      >
        <span className="relative block">
          {attention && (
            <span className={cn("absolute -inset-1 animate-ping rounded-full opacity-40", infra.dot)} aria-hidden />
          )}
          {/* outer ring = Azure infrastructure, inner dot = your service */}
          <span className={cn("relative block h-4 w-4 rounded-full ring-2 ring-white shadow", infra.dot, r.hasDeployment ? "" : "opacity-50")} />
          {r.hasDeployment && (
            <span className={cn("absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white", svc.dot)} />
          )}
        </span>
        <span className="mt-1 whitespace-nowrap rounded bg-white/85 px-1 text-[9.5px] font-medium text-slate-700 shadow-sm">{r.name}</span>
      </button>
      {hover === r.id && <HoverCard r={r} />}
    </div>
  );
}

export function RegionMap({ height = "h-64" }: { height?: string }) {
  const { open } = useImpactDrawer();
  const [hover, setHover] = useState<string | null>(null);
  const [viewId, setViewId] = useState<MapViewId>("world");
  const view = MAP_VIEWS.find((v) => v.id === viewId) ?? MAP_VIEWS[0];
  const box = viewBoxOf(view);
  const graticule: number[] = [];
  for (let lon = -180; lon <= 180; lon += 30) graticule.push(lon);
  const parallels: number[] = [];
  for (let lat = -60; lat <= 80; lat += 20) parallels.push(lat);

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-slate-200 bg-[#eef4fa]", height)}>
      <svg
        className="absolute inset-0 h-full w-full transition-all duration-500"
        viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="World map showing Azure regions where your services run"
      >
        <defs>
          <linearGradient id="ch-ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8f1fb" />
            <stop offset="100%" stopColor="#dfeaf6" />
          </linearGradient>
        </defs>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="url(#ch-ocean)" />
        <g stroke="#c3d4e6" strokeWidth={box.w / 1600} opacity={0.9}>
          {graticule.map((lon) => (
            <line key={`m${lon}`} x1={lon + 180} y1={box.y} x2={lon + 180} y2={box.y + box.h} />
          ))}
          {parallels.map((lat) => (
            <line key={`p${lat}`} x1={box.x} y1={90 - lat} x2={box.x + box.w} y2={90 - lat} />
          ))}
        </g>
        <path
          d={WORLD_PATH}
          fill="#cbd8e6"
          stroke="#93a8bf"
          strokeWidth={box.w / 1400}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="absolute right-2 top-2 z-20 flex gap-1 rounded-md border border-slate-200 bg-white/90 p-0.5 shadow-sm backdrop-blur">
        {MAP_VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setViewId(v.id)}
            aria-pressed={viewId === v.id}
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70",
              viewId === v.id ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {regions.map((r) => (
        <RegionMarker key={r.id} r={r} hover={hover} setHover={setHover} open={open} view={view} />
      ))}
      <div className="absolute bottom-2 left-3 z-20 flex flex-wrap gap-3 rounded bg-white/75 px-1.5 py-0.5 text-[10px] text-slate-600">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-slate-300 ring-2 ring-white" aria-hidden />Outer ring: Azure infrastructure</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-slate-500" aria-hidden />Inner dot: your service</span>
      </div>
    </div>
  );
}



function RegionListItem({
  r, hover, setHover, open, infra, svc,
}: {
  r: RegionRow;
  hover: string | null;
  setHover: (fn: string | null | ((h: string | null) => string | null)) => void;
  open: (id: string) => void;
  infra: (typeof statusStyles)[keyof typeof statusStyles];
  svc: (typeof statusStyles)[keyof typeof statusStyles];
}) {
  const { bind, className: corrClass } = useObjectHighlight(`region:${r.id}`);
  return (
    <li className="relative">
      <button
        type="button"
        onClick={() => open(r.contextId)}
        onMouseEnter={() => { setHover(r.id); bind.onMouseEnter?.(); }}
        onMouseLeave={() => { setHover((h) => (h === r.id ? null : h)); bind.onMouseLeave?.(); }}
        onFocus={() => bind.onFocus?.()}
        onBlur={() => bind.onBlur?.()}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70",
          corrClass,
        )}
      >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold text-slate-900">{r.name}</span>
                <span className="text-[10.5px] text-slate-500">{r.hasDeployment ? `${r.deploymentCount} deployment${r.deploymentCount === 1 ? "" : "s"} · ${r.nodes} nodes` : "No deployment"}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Azure infrastructure</div>
                  <div className={cn("flex items-center gap-1.5 text-[12px] font-medium", infra.text)}>
                    <span className={cn("h-2 w-2 rounded-full", infra.dot)} aria-hidden />{infra.label}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Your service</div>
                  {r.hasDeployment ? (
                    <div className={cn("flex items-center gap-1.5 text-[12px] font-medium", svc.text)}>
                      <span className={cn("h-2 w-2 rounded-full", svc.dot)} aria-hidden />{svc.label}
                    </div>
                  ) : (
                    <div className="text-[12px] font-medium text-slate-500">Not applicable</div>
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                {r.hasDeployment ? r.activeEventSummary : "No customer deployment in this region"}
              </p>
            </button>
      <div className="mt-1.5 flex justify-end">
        <WhyThisMatters objectKey={`region:${r.id}`} align="right" />
      </div>
      {hover === r.id && <HoverCard r={r} />}
    </li>
  );
}

export function RegionList({ limit, dense = false }: { limit?: number; dense?: boolean }) {
  const { open } = useImpactDrawer();
  const [hover, setHover] = useState<string | null>(null);
  const rows = limit ? regions.slice(0, limit) : regions;
  return (
    <ul className={cn("grid gap-2", !dense && "sm:grid-cols-2 xl:grid-cols-3")}>
      {rows.map((r) => {
        const infra = statusStyles[r.infraStatus];
        const svc = statusStyles[r.serviceStatus];
        return (
          <RegionListItem key={r.id} r={r} hover={hover} setHover={setHover} open={open} infra={infra} svc={svc} />
        );
      })}
    </ul>
  );
}
