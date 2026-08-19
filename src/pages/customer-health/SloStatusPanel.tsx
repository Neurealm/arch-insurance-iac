// SLO tiles: target, current attainment, status and error budget for each objective.

import { cn } from "@/lib/utils";
import type { SloRow } from "./types";
import { sloDetails, sloRows } from "./sloDetail";
import { Interactive, MetricBar, statusStyles } from "./primitives";

export function SloTile({ s, onOpen, size = "sm" }: { s: SloRow; onOpen: (id: string) => void; size?: "sm" | "lg" }) {
  const d = sloDetails[s.contextId];
  const met = d?.statusLabel ?? statusStyles[s.status].label;
  return (
    <Interactive
      tooltip="A commitment we make to you, how we are performing against it, and how much error budget remains."
      onClick={() => onOpen(s.contextId)}
      className={cn("rounded-lg border border-slate-200 bg-white", size === "lg" ? "px-4 py-3.5" : "px-3 py-2.5")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("font-medium text-slate-500", size === "lg" ? "text-[11.5px]" : "text-[11px]")}>{s.name}</div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide",
            s.status === "healthy"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
              : "border-amber-500/40 bg-amber-500/10 text-amber-700",
          )}
        >
          {met}
        </span>
      </div>

      <div className={cn("mt-1 font-semibold leading-none text-slate-900", size === "lg" ? "text-[22px]" : "text-[16px]")}>
        {s.current}
      </div>
      <div className="mt-1 text-[11px] text-slate-500">Target {s.target}</div>

      <div className="mt-2"><MetricBar value={s.errorBudget} status={s.status} /></div>
      <div className="mt-1 flex items-baseline justify-between gap-2 text-[10.5px] text-slate-500">
        <span>Error budget remaining</span>
        <span className={cn("font-semibold tabular-nums", statusStyles[s.status].text)}>{s.errorBudget}%</span>
      </div>
    </Interactive>
  );
}

export function SloTiles({
  onOpen, rows = sloRows, size = "sm", className,
}: { onOpen: (id: string) => void; rows?: SloRow[]; size?: "sm" | "lg"; className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {rows.map((s) => (
        <SloTile key={s.id} s={s} onOpen={onOpen} size={size} />
      ))}
    </div>
  );
}
