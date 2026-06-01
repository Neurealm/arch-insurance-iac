import { coworkers } from "@/data/eoc";
import { Bot, Workflow, ShieldCheck, Building2, ClipboardCheck } from "lucide-react";

const iconFor: Record<string, any> = {
  orch: Bot, triage: Workflow, change: ShieldCheck, vendor: Building2, sla: ClipboardCheck,
};

export function DigitalCoworkers() {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Active Digital Coworkers</h2>
        <button className="text-xs font-semibold text-indigo hover:underline">View All</button>
      </div>
      <ul className="space-y-1 flex-1">
        {coworkers.map((c) => {
          const Icon = iconFor[c.id] ?? Bot;
          return (
            <li key={c.id}>
              <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-ai-soft/60 transition text-left">
                <span className="relative h-9 w-9 rounded-lg grid place-items-center shrink-0 bg-ai-soft text-ai border border-ai/20">
                  <Icon className="h-4 w-4" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-status-healthy ring-2 ring-card" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-[11px] text-status-healthy font-medium inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-healthy animate-pulse" /> Running
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Health</div>
                  <div className="text-sm font-bold text-status-healthy">{c.health}%</div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border text-sm">
        <span className="text-muted-foreground font-medium">Total Active</span>
        <span className="text-ai font-bold text-base">18</span>
      </div>
    </section>
  );
}