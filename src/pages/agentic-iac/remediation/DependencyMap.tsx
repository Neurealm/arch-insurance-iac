import { useState } from "react";
import { cn } from "@/lib/utils";
import { DEP_NODES, DEP_EDGES, type DepNode, type DepHealth } from "./data";

const DOT: Record<DepHealth, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
};

const byId = (id: string) => DEP_NODES.find((n) => n.id === id)!;

/** Interactive infrastructure dependency map for the remediation workspace. */
export function DependencyMap() {
  const [hovered, setHovered] = useState<DepNode | null>(null);
  const [selected, setSelected] = useState<DepNode | null>(null);

  return (
    <div className="flex flex-col">
      <div className="relative h-[340px] w-full rounded-md border border-[#E2E8F0] bg-[#FCFDFE] p-2">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {DEP_EDGES.map((e, i) => {
            const a = byId(e.from);
            const b = byId(e.to);
            return (
              <line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#94A3B8"
                strokeWidth={0.3}
                strokeDasharray={e.dashed ? "1.6 1.2" : undefined}
                vectorEffect="non-scaling-stroke"
                opacity={hovered && hovered.id !== e.from && hovered.id !== e.to ? 0.25 : 0.85}
              />
            );
          })}
        </svg>

        {DEP_NODES.map((n) => (
          <button
            key={n.id}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(selected?.id === n.id ? null : n)}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border bg-white px-2 py-1 text-left shadow-sm transition-colors",
              selected?.id === n.id ? "border-[#1B4F91] ring-1 ring-[#1B4F91]/30" : "border-[#E2E8F0] hover:border-slate-300",
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", DOT[n.health])} />
              <span className="text-[10.5px] font-medium text-slate-800">{n.name}</span>
            </div>
            <div className="text-[9px] text-slate-500">{n.type}</div>
            {n.sub && <div className="text-[8.5px] text-slate-400">{n.sub}</div>}
          </button>
        ))}

        {hovered && (
          <div
            style={{ left: `${Math.min(hovered.x, 66)}%`, top: `${Math.min(hovered.y + 9, 74)}%` }}
            className="pointer-events-none absolute z-10 w-56 rounded-md border border-[#E2E8F0] bg-white p-2 text-[11px] shadow-md"
          >
            <div className="font-semibold text-slate-800">{hovered.name}</div>
            <dl className="mt-1 space-y-0.5 text-slate-600">
              <div className="flex justify-between gap-2"><dt className="text-slate-500">Type</dt><dd>{hovered.type}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">Health</dt><dd className="capitalize">{hovered.health}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">Relationship</dt><dd>{hovered.relationship}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">State</dt><dd className="text-right">{hovered.state}</dd></div>
            </dl>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Healthy</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Warning</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Critical</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-px w-5 bg-slate-400" />Dependency</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-px w-5 border-t border-dashed border-slate-400" />Backed by / Monitored by</span>
      </div>

      {selected && (
        <div className="mt-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
          <div className="flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", DOT[selected.health])} />
            <span className="text-[12px] font-semibold text-slate-800">{selected.name}</span>
            <span className="text-[11px] text-slate-500">{selected.type}</span>
            <button type="button" onClick={() => setSelected(null)} className="ml-auto text-[11px] text-slate-500 hover:text-slate-800">
              Close
            </button>
          </div>
          <dl className="mt-1.5 grid gap-1 text-[11px] text-slate-600 sm:grid-cols-3">
            <div><dt className="text-slate-500">Relationship</dt><dd>{selected.relationship}</dd></div>
            <div><dt className="text-slate-500">Current state</dt><dd>{selected.state}</dd></div>
            <div><dt className="text-slate-500">Health</dt><dd className="capitalize">{selected.health}</dd></div>
          </dl>
        </div>
      )}
    </div>
  );
}
