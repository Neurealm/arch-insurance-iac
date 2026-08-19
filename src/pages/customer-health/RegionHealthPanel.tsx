// Interactive region map + region list. Every region shows two independent
// states: the Azure / infrastructure condition, and the customer's own
// service health in that region.

import { WhyThisMatters } from "./whyThisMatters";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { regions } from "./data";
import { statusStyles, useImpactDrawer } from "./primitives";
import { useFilters, useObjectHighlight } from "./filters";
import type { RegionRow } from "./types";
import { WORLD_PATH } from "./worldPath";

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

/* ------------------------------ map overlays ------------------------------ */

type LayerId = "deployments" | "traffic" | "replication" | "events" | "maintenance" | "coverage";

const LAYERS: { id: LayerId; label: string }[] = [
  { id: "deployments", label: "Your deployments" },
  { id: "traffic", label: "Traffic routing" },
  { id: "replication", label: "DR replication" },
  { id: "events", label: "Provider events" },
  { id: "maintenance", label: "Planned maintenance" },
  { id: "coverage", label: "Serving coverage" },
];

const DEFAULT_LAYERS: Record<LayerId, boolean> = {
  deployments: true, traffic: true, replication: true, events: true, maintenance: true, coverage: false,
};

/** Traffic and replication paths between regions the customer actually uses. */
const ROUTES: { from: string; to: string; kind: "traffic" | "replication"; label: string }[] = [
  { from: "r-west", to: "r-east", kind: "traffic", label: "US traffic balanced East ↔ West" },
  { from: "r-eu", to: "r-east", kind: "traffic", label: "EU overflow routed to East US" },
  { from: "r-sea", to: "r-eu", kind: "traffic", label: "APAC edge reads served from North Europe" },
  { from: "r-east", to: "r-central", kind: "replication", label: "Continuous replication to DR standby" },
];

/** Percentage of customer traffic served from a region, parsed from the estate data. */
function trafficShare(r: RegionRow): number | null {
  const m = /(\d+)%/.exec(r.exposure ?? "");
  return m ? Number(m[1]) : null;
}

function maintenanceSoon(r: RegionRow): boolean {
  return /maintenance/i.test(r.activeEventSummary ?? "");
}

function point(r: RegionRow) {
  return { x: (r.lon ?? 0) + 180, y: 90 - (r.lat ?? 0) };
}

function RegionMarker({
  r, hover, setHover, open, view, layers, selected, onSelect,
}: {
  r: RegionRow;
  hover: string | null;
  setHover: (fn: string | null | ((h: string | null) => string | null)) => void;
  open: (id: string) => void;
  view: (typeof MAP_VIEWS)[number];
  layers: Record<LayerId, boolean>;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const infra = statusStyles[r.infraStatus];
  const svc = statusStyles[r.serviceStatus];
  const { bind, className: corrClass } = useObjectHighlight(`region:${r.id}`);
  const pos = projectRegion(r, view);
  if (!pos.visible) return null;
  if (!layers.deployments && r.hasDeployment === false && r.activeEvents === 0) return null;
  const attention = r.infraStatus !== "healthy" && layers.events;
  const share = trafficShare(r);
  const isSelected = selected === r.id;
  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
    >
      <button
        type="button"
        onClick={() => { onSelect(r.id); open(r.contextId); }}
        onMouseEnter={() => { setHover(r.id); bind.onMouseEnter?.(); }}
        onMouseLeave={() => { setHover((h) => (h === r.id ? null : h)); bind.onMouseLeave?.(); }}
        onFocus={() => { setHover(r.id); bind.onFocus?.(); }}
        onBlur={() => { setHover((h) => (h === r.id ? null : h)); bind.onBlur?.(); }}
        aria-label={`${r.name}: infrastructure ${infra.label}, your service ${r.hasDeployment ? svc.label : "not deployed"}${share ? `, ${share}% of your traffic` : ""}`}
        aria-pressed={isSelected}
        className={cn(
          "relative flex cursor-pointer flex-col items-center rounded-md px-1 py-1 transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70",
          isSelected && "scale-110",
          corrClass,
        )}
      >
        <span className="relative block">
          {attention && (
            <span className={cn("absolute -inset-1 animate-ping rounded-full opacity-40", infra.dot)} aria-hidden />
          )}
          {isSelected && <span className="absolute -inset-1.5 rounded-full ring-2 ring-sky-500/70" aria-hidden />}
          {/* outer ring = Azure infrastructure, inner dot = your service */}
          <span className={cn("relative block h-4 w-4 rounded-full ring-2 ring-white shadow", infra.dot, r.hasDeployment ? "" : "opacity-50")} />
          {r.hasDeployment && layers.deployments && (
            <span className={cn("absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white", svc.dot)} />
          )}
          {layers.events && r.activeEvents > 0 && (
            <span
              className="absolute -right-2 -top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-500 px-1 text-[8px] font-semibold text-white ring-1 ring-white"
              aria-hidden
            >
              {r.activeEvents}
            </span>
          )}
          {layers.maintenance && maintenanceSoon(r) && (
            <span className="absolute -bottom-1.5 -left-2 rounded-sm bg-sky-600 px-0.5 text-[7px] font-semibold uppercase text-white ring-1 ring-white" aria-hidden>
              mnt
            </span>
          )}
        </span>
        <span className="mt-1 whitespace-nowrap rounded bg-white/85 px-1 text-[9.5px] font-medium text-slate-700 shadow-sm">
          {r.name}
          {layers.traffic && share !== null && <span className="ml-1 text-slate-500">{share}%</span>}
        </span>
      </button>
      {hover === r.id && <HoverCard r={r} />}
    </div>
  );
}

export function RegionMap({ height = "h-72" }: { height?: string }) {
  const { open } = useImpactDrawer();
  const { set: setFilter } = useFilters();
  const [hover, setHover] = useState<string | null>(null);
  const [viewId, setViewId] = useState<MapViewId>("world");
  const [layers, setLayers] = useState<Record<LayerId, boolean>>(DEFAULT_LAYERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const view = MAP_VIEWS.find((v) => v.id === viewId) ?? MAP_VIEWS[0];
  const box = viewBoxOf(view);
  const selected = regions.find((r) => r.id === selectedId) ?? null;

  const graticule: number[] = [];
  for (let lon = -180; lon <= 180; lon += 30) graticule.push(lon);
  const parallels: number[] = [];
  for (let lat = -60; lat <= 80; lat += 20) parallels.push(lat);

  const deployed = regions.filter((r) => r.hasDeployment);
  const servedTraffic = deployed.reduce((sum, r) => sum + (trafficShare(r) ?? 0), 0);
  const providerEvents = regions.reduce((sum, r) => sum + r.activeEvents, 0);
  const affectingYou = regions.filter((r) => r.hasDeployment && r.serviceStatus !== "healthy").length;

  const stroke = box.w / 900;

  return (
    <div className="space-y-2">
      <div className={cn("relative overflow-hidden rounded-lg border border-slate-200 bg-[#eef4fa]", height)}>
        <svg
          className="absolute inset-0 h-full w-full transition-all duration-500"
          viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="World map showing Azure regions where your services run, the traffic they serve and any provider events"
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

          {/* Serving coverage: approximate area each deployment serves */}
          {layers.coverage && deployed.map((r) => {
            const p = point(r);
            const share = trafficShare(r) ?? 10;
            return (
              <circle
                key={`cov-${r.id}`}
                cx={p.x}
                cy={p.y}
                r={8 + share / 4}
                fill="rgba(14,165,233,0.10)"
                stroke="rgba(14,165,233,0.35)"
                strokeWidth={stroke}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Traffic routing and replication paths */}
          {ROUTES.map((route) => {
            if (route.kind === "traffic" && !layers.traffic) return null;
            if (route.kind === "replication" && !layers.replication) return null;
            const a = regions.find((r) => r.id === route.from);
            const b = regions.find((r) => r.id === route.to);
            if (!a || !b) return null;
            const p1 = point(a);
            const p2 = point(b);
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2 - Math.abs(p2.x - p1.x) * 0.18 - 4;
            const active = selectedId === a.id || selectedId === b.id || hover === a.id || hover === b.id;
            return (
              <path
                key={`${route.from}-${route.to}`}
                d={`M${p1.x} ${p1.y} Q${cx} ${cy} ${p2.x} ${p2.y}`}
                fill="none"
                stroke={route.kind === "replication" ? "#8b5cf6" : "#0ea5e9"}
                strokeOpacity={active ? 0.95 : 0.45}
                strokeWidth={active ? stroke * 2.2 : stroke * 1.4}
                strokeDasharray={route.kind === "replication" ? `${stroke * 4} ${stroke * 3}` : undefined}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              >
                <title>{route.label}</title>
              </path>
            );
          })}
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

        {/* At-a-glance answers, left as customer outcomes rather than infrastructure counts */}
        <div className="absolute left-2 top-2 z-20 flex flex-wrap gap-1.5">
          {[
            { k: "Regions serving you", v: `${deployed.length}` },
            { k: "Traffic covered", v: `${servedTraffic}%` },
            { k: "Provider events", v: `${providerEvents}` },
            { k: "Affecting your service", v: affectingYou === 0 ? "None" : `${affectingYou}` },
          ].map((c) => (
            <span
              key={c.k}
              className="rounded-md border border-slate-200 bg-white/90 px-2 py-0.5 text-[10px] text-slate-600 shadow-sm backdrop-blur"
            >
              {c.k} <span className="font-semibold text-slate-900">{c.v}</span>
            </span>
          ))}
        </div>

        {regions.map((r) => (
          <RegionMarker
            key={r.id}
            r={r}
            hover={hover}
            setHover={setHover}
            open={open}
            view={view}
            layers={layers}
            selected={selectedId}
            onSelect={setSelectedId}
          />
        ))}

        <div className="absolute bottom-2 left-3 z-20 flex flex-wrap items-center gap-3 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-600">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-slate-300 ring-2 ring-white" aria-hidden />Outer ring: Azure infrastructure</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-slate-500" aria-hidden />Inner dot: your service</span>
          {layers.traffic && <span className="flex items-center gap-1"><span className="h-0.5 w-4 rounded bg-sky-500" aria-hidden />Traffic routing</span>}
          {layers.replication && <span className="flex items-center gap-1"><span className="h-0.5 w-4 rounded bg-violet-500" aria-hidden />DR replication</span>}
        </div>
      </div>

      {/* Overlay controls */}
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Map overlays">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Overlays</span>
        {LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={layers[l.id]}
            onClick={() => setLayers((s) => ({ ...s, [l.id]: !s[l.id] }))}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10.5px] font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70",
              layers[l.id]
                ? "border-sky-200 bg-sky-50 text-sky-700"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Tactical actions for the region the customer selected */}
      {selected && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div className="mr-auto">
            <div className="text-[12px] font-semibold text-slate-900">{selected.name}</div>
            <p className="text-[10.5px] text-slate-600">
              {selected.hasDeployment
                ? `${selected.deploymentSummary} · ${selected.exposure} · potential impact ${selected.potentialImpact}`
                : "You run nothing here — provider conditions in this region do not reach your users."}
            </p>
          </div>
          {[
            { label: "Open impact detail", run: () => open(selected.contextId) },
            { label: "Focus dashboard on this region", run: () => setFilter("region", selected.id) },
            { label: "Show only what affects me", run: () => setFilter("view", "affecting") },
            { label: "Clear selection", run: () => { setSelectedId(null); setFilter("region", "all"); } },
          ].map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.run}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors duration-200 hover:border-sky-300 hover:text-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
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
