import { type Incident } from "@/data/eoc";
import { useIncidents } from "@/hooks/data/useIncidents";
import { AlertOctagon, AlertTriangle, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const sev: Record<Incident["severity"], { icon: any; text: string; bg: string }> = {
  Critical: { icon: AlertOctagon, text: "text-status-critical", bg: "bg-status-critical-soft" },
  High:     { icon: AlertTriangle, text: "text-status-warning", bg: "bg-status-warning-soft" },
  Medium:   { icon: AlertTriangle, text: "text-status-warning", bg: "bg-status-warning-soft" },
  Low:      { icon: Info, text: "text-status-info", bg: "bg-status-info-soft" },
};

const prioColor: Record<Incident["priority"], string> = {
  P1: "bg-status-critical-soft text-status-critical border-status-critical/30",
  P2: "bg-status-warning-soft text-status-warning border-status-warning/30",
  P3: "bg-status-info-soft text-status-info border-status-info/30",
  P4: "bg-secondary text-muted-foreground border-border",
};

export function IncidentsPanel() {
  const { incidents, loading, mode } = useIncidents();
  return (
    <section className="bg-card rounded-2xl border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">
          Top Active Incidents
          {mode === "demo" && (
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border border-border px-1.5 py-0.5 rounded">
              Demo
            </span>
          )}
        </h2>
        <button className="text-xs font-semibold text-indigo hover:underline">View All</button>
      </div>
      <ul className="space-y-1 flex-1">
        {loading && incidents.length === 0 ? (
          <li className="text-xs text-muted-foreground p-2.5">Loading…</li>
        ) : incidents.length === 0 ? (
          <li className="text-xs text-muted-foreground p-2.5">No active incidents.</li>
        ) : (
          incidents.map((inc) => {
            const s = sev[inc.severity];
            const Icon = s.icon;
            return (
              <li key={inc.id}>
                <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/70 transition text-left group">
                  <span className={cn("h-9 w-9 rounded-lg grid place-items-center shrink-0", s.bg, s.text)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-muted-foreground">{inc.id}</span>
                      <span className="text-sm font-semibold truncate">{inc.title}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      <span className={cn("font-semibold", s.text)}>{inc.severity}</span>
                      <span className="mx-1.5">•</span>
                      Started {inc.startedAgo}
                    </div>
                  </div>
                  <span className={cn("text-[11px] font-bold px-2 py-1 rounded-md border", prioColor[inc.priority])}>
                    {inc.priority}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                </button>
              </li>
            );
          })
        )}
      </ul>
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border text-sm">
        <span className="text-muted-foreground font-medium">Total Open Incidents</span>
        <span className="text-status-critical font-bold text-base">{incidents.length}</span>
      </div>
    </section>
  );
}