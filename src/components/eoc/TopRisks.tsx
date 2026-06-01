import { risks, type Risk } from "@/data/eoc";
import { ShieldAlert, ShieldCheck, ShieldX, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const lvl: Record<Risk["level"], { icon: any; chip: string; iconBg: string; iconText: string }> = {
  Critical: { icon: ShieldX,    chip: "bg-status-critical text-white", iconBg: "bg-status-critical-soft", iconText: "text-status-critical" },
  High:     { icon: ShieldAlert,chip: "bg-status-warning text-white", iconBg: "bg-status-warning-soft", iconText: "text-status-warning" },
  Medium:   { icon: Shield,     chip: "bg-status-warning-soft text-status-warning border border-status-warning/30", iconBg: "bg-status-warning-soft", iconText: "text-status-warning" },
  Low:      { icon: ShieldCheck,chip: "bg-status-info-soft text-status-info border border-status-info/30", iconBg: "bg-status-info-soft", iconText: "text-status-info" },
};

export function TopRisks() {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Top Risks</h2>
        <button className="text-xs font-semibold text-indigo hover:underline">View All</button>
      </div>
      <ul className="space-y-2 flex-1">
        {risks.map((r) => {
          const L = lvl[r.level];
          const Icon = L.icon;
          return (
            <li key={r.id}>
              <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/70 transition text-left">
                <span className={cn("h-9 w-9 rounded-lg grid place-items-center shrink-0", L.iconBg, L.iconText)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{r.description}</div>
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md", L.chip)}>
                  {r.level}
                </span>
                <div className="text-right ml-2 min-w-[56px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Score</div>
                  <div className="text-sm font-bold text-foreground">{r.score}</div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}