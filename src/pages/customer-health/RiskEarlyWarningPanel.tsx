// Risk & Early Warning tiles. Risk is forward-looking and is rendered
// separately from current health, so a tile can read "Healthy + Elevated Risk".

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel, RiskSignal, RiskTrend } from "./types";
import { riskSignals } from "./riskDetail";
import { Interactive, Sparkline, statusStyles } from "./primitives";
import { WhyThisMatters } from "./whyThisMatters";

export const riskLevelStyles: Record<RiskLevel | "None", string> = {
  None: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  Low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  Moderate: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  Elevated: "border-orange-500/45 bg-orange-500/10 text-orange-700",
  High: "border-red-500/40 bg-red-500/10 text-red-700",
};

export const trendStyles: Record<RiskTrend, { text: string; Icon: typeof ArrowRight }> = {
  Deteriorating: { text: "text-orange-600", Icon: ArrowUpRight },
  Stable: { text: "text-slate-500", Icon: ArrowRight },
  Improving: { text: "text-emerald-600", Icon: ArrowDownRight },
};

export function RiskTile({ r, onOpen }: { r: RiskSignal; onOpen: (id: string) => void }) {
  const trend = trendStyles[r.trend ?? "Stable"];
  const health = statusStyles[r.currentHealth ?? "healthy"];
  return (
    <Interactive
      tooltip={r.question ?? "A forward-looking signal — it describes what could happen, not what has happened."}
      onClick={() => onOpen(r.contextId)}
      correlationKey={`risk:${r.id}`}
      footer={<WhyThisMatters objectKey={`risk:${r.id}`} align="right" />}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-medium text-slate-500">{r.label}</div>
        <span className={cn("rounded-full border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide", riskLevelStyles[r.level])}>
          {r.level}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", health.dot)} aria-hidden />
        <span className={cn("text-[11px] font-medium", health.text)}>{r.currentHealthLabel ?? health.label}</span>
      </div>

      <Sparkline points={r.spark} status={r.status} className="mt-1.5" />

      <div className={cn("mt-1 flex items-center gap-1 text-[10.5px] font-medium", trend.text)}>
        <trend.Icon className="h-3 w-3 shrink-0" aria-hidden />
        {r.trend ?? "Stable"}
        {r.trendNote && <span className="truncate font-normal text-slate-500"> · {r.trendNote}</span>}
      </div>

      <div className="mt-1.5 border-t border-slate-100 pt-1.5">
        <div className="text-[9.5px] uppercase tracking-[0.12em] text-slate-400">Affected deployments</div>
        <div className="truncate text-[11px] text-slate-600">{(r.affectedDeployments ?? []).join(", ") || "None"}</div>
      </div>
    </Interactive>
  );
}

export function RiskTiles({ onOpen, signals = riskSignals }: { onOpen: (id: string) => void; signals?: RiskSignal[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
      {signals.map((r) => (
        <RiskTile key={r.id} r={r} onOpen={onOpen} />
      ))}
    </div>
  );
}
