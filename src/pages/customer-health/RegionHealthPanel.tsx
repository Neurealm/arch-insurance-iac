// Interactive region map + region list. Every region shows two independent
// states: the Azure / infrastructure condition, and the customer's own
// service health in that region.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { regions } from "./data";
import { statusStyles, useImpactDrawer } from "./primitives";
import { useCorrelation } from "./correlation";
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


function RegionMarker({
  r, hover, setHover, open,
}: {
  r: RegionRow;
  hover: string | null;
  setHover: (fn: string | null | ((h: string | null) => string | null)) => void;
  open: (id: string) => void;
}) {
  const infra = statusStyles[r.infraStatus];
  const svc = statusStyles[r.serviceStatus];
  const { bind, className: corrClass } = useCorrelation(`region:${r.id}`);
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
      <button
        type="button"
        onClick={() => open(r.contextId)}
        onMouseEnter={(e) => { setHover(r.id); bind.onMouseEnter?.(); }}
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
          {/* outer ring = Azure infrastructure, inner dot = your service */}
          <span className={cn("block h-4 w-4 rounded-full ring-2 ring-white", infra.dot, r.hasDeployment ? "" : "opacity-50")} />
          {r.hasDeployment && (
            <span className={cn("absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white", svc.dot)} />
          )}
        </span>
        <span className="mt-1 whitespace-nowrap rounded bg-white/85 px-1 text-[9.5px] font-medium text-slate-600">{r.name}</span>
      </button>
      {hover === r.id && <HoverCard r={r} />}
    </div>
  );
}

export function RegionMap({ height = "h-64" }: { height?: string }) {
  const { open } = useImpactDrawer();
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className={cn("relative rounded-lg border border-slate-200 bg-slate-50", height)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg bg-[radial-gradient(circle_at_30%_40%,rgba(56,189,248,0.12),transparent_60%)]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)",
          backgroundSize: "8% 16%",
        }}
      />
      {regions.map((r) => (
        <RegionMarker key={r.id} r={r} hover={hover} setHover={setHover} open={open} />
      ))}
      <div className="absolute bottom-2 left-3 flex flex-wrap gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-slate-300" aria-hidden />Outer ring: Azure infrastructure</span>
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
  const { bind, className: corrClass } = useCorrelation(`region:${r.id}`);
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
