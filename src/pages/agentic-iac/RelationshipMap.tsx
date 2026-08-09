import { useState } from "react";
import { cn } from "@/lib/utils";
import { relatedNodes, type RelatedNode, type Health } from "./data";

const HEALTH_DOT: Record<Health, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  unknown: "bg-slate-400",
};

const LINE_COLOR: Record<string, string> = {
  "CONNECTED TO": "#1B4F91",
  "PROTECTED BY": "#0F766E",
  "MONITORED BY": "#7C3AED",
  "BACKED UP BY": "#B45309",
  HOSTS: "#0891B2",
  "DEPENDS ON": "#64748B",
  "ROUTED THROUGH": "#2563EB",
};

type Filter = "1 Hop" | "2 Hops" | "Dependencies" | "Infrastructure" | "Application";
const FILTERS: Filter[] = ["1 Hop", "2 Hops", "Dependencies", "Infrastructure", "Application"];

function matches(node: RelatedNode, filter: Filter) {
  switch (filter) {
    case "1 Hop": return node.hops === 1;
    case "2 Hops": return true;
    case "Dependencies": return node.layer === "dependency";
    case "Infrastructure": return node.layer === "infrastructure";
    case "Application": return node.layer === "application";
  }
}

interface Props {
  selectedId: string | null;
  onSelect: (node: RelatedNode | null) => void;
}

/** Interactive infrastructure relationship graph centered on the asset. */
export function RelationshipMap({ selectedId, onSelect }: Props) {
  const [filter, setFilter] = useState<Filter>("1 Hop");
  const [hovered, setHovered] = useState<RelatedNode | null>(null);
  const visible = relatedNodes.filter((n) => matches(n, filter));
  const selected = relatedNodes.find((n) => n.id === selectedId) ?? null;

  return (
    <section className="flex h-full flex-col rounded-md border border-[#E2E8F0] bg-white">
      <header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2">
        <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">Relationship Map</h2>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded border px-2 py-0.5 text-[11px] transition-colors",
                filter === f
                  ? "border-[#1B4F91] bg-[#EFF4FB] text-[#1B4F91]"
                  : "border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="relative flex-1 bg-[#FCFDFE] p-2">
        <div className="relative h-[420px] w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {visible.map((n) => (
              <line
                key={n.id}
                x1="50" y1="50" x2={n.x} y2={n.y}
                stroke={LINE_COLOR[n.relationship] ?? "#94A3B8"}
                strokeWidth={selectedId === n.id || hovered?.id === n.id ? 0.6 : 0.28}
                strokeDasharray={n.layer === "dependency" ? "1.6 1.2" : undefined}
                vectorEffect="non-scaling-stroke"
                opacity={hovered && hovered.id !== n.id ? 0.35 : 0.9}
              />
            ))}
          </svg>

          {/* Center asset */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-md border border-[#1B4F91] bg-white px-3 py-2 text-center shadow-sm">
              <div className="text-[12px] font-semibold text-[#1B4F91]">PROD-WEB-023</div>
              <div className="text-[10px] text-slate-500">Azure Virtual Machine</div>
            </div>
          </div>

          {visible.map((n) => (
            <button
              key={n.id}
              type="button"
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(selectedId === n.id ? null : n)}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border bg-white px-2 py-1 text-left transition-colors",
                selectedId === n.id
                  ? "border-[#1B4F91] ring-1 ring-[#1B4F91]/30"
                  : "border-[#E2E8F0] hover:border-slate-300",
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", HEALTH_DOT[n.health])} />
                <span className="text-[11px] font-medium text-slate-800">{n.name}</span>
              </div>
              <div className="text-[9.5px] text-slate-500">{n.type}</div>
              <div className="mt-0.5 text-[8.5px] uppercase tracking-wider text-slate-400">{n.relationship}</div>
            </button>
          ))}

          {hovered && (
            <div
              style={{ left: `${Math.min(hovered.x, 72)}%`, top: `${Math.min(hovered.y + 8, 78)}%` }}
              className="pointer-events-none absolute z-10 w-56 rounded-md border border-[#E2E8F0] bg-white p-2 text-[11px] shadow-md"
            >
              <div className="font-semibold text-slate-800">{hovered.name}</div>
              <dl className="mt-1 space-y-0.5 text-slate-600">
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Type</dt><dd>{hovered.type}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Health</dt><dd className="capitalize">{hovered.health}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Relationship</dt><dd>{hovered.relationship}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Last discovered</dt><dd>{hovered.lastDiscovered}</dd></div>
              </dl>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#E2E8F0] pt-2 text-[10px] text-slate-500">
          {Object.entries(LINE_COLOR).map(([label, color]) => (
            <span key={label} className="inline-flex items-center gap-1">
              <span className="inline-block h-0.5 w-4" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>

        {selected && (
          <div className="mt-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
            <div className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full", HEALTH_DOT[selected.health])} />
              <span className="text-[12px] font-semibold text-slate-800">{selected.name}</span>
              <span className="text-[11px] text-slate-500">{selected.type}</span>
              <button
                type="button"
                onClick={() => onSelect(null)}
                className="ml-auto text-[11px] text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <ul className="mt-1.5 grid gap-0.5 text-[11px] text-slate-600 sm:grid-cols-3">
              {selected.detail.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
