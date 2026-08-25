import { useState } from "react";
import { cn } from "@/lib/utils";
import { EventCard } from "./EventCards";
import { classificationStyles } from "./eventDetail";
import { PageHeader } from "./primitives";
import { useEventFeed } from "./useEventFeed";

const filters = ["All", "Incident", "Degradation", "Advisory", "Information", "Maintenance"] as const;

export default function CustomerHealthEvents() {
  const { events, scenarioLabel, advance, live, setLive } = useEventFeed();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const shown = filter === "All" ? events : events.filter((e) => e.kind === filter);

  const counts = (kind: string) => events.filter((e) => e.kind === kind && e.active !== false).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Events"
        subtitle="Ranked by how much each event affects you — actual impact first, infrastructure severity last."
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        {filters.map((f) => {
          const cls = classificationStyles[f];
          return (
            <button
              key={f} type="button" onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                filter === f ? "border-slate-900 bg-slate-900 text-white" : cls ? cls.chip : "border-slate-200 bg-slate-50 text-slate-600",
              )}
            >
              {f}
              {f !== "All" && <span className="ml-1.5 tabular-nums opacity-70">{counts(f)}</span>}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", live ? "animate-pulse bg-emerald-500" : "bg-slate-300")} aria-hidden />
            {live ? "Live feed" : "Paused"}
          </span>
          <button type="button" onClick={() => setLive(!live)} className="rounded-md border border-slate-200 px-2 py-1 hover:border-slate-300">
            {live ? "Pause" : "Resume"}
          </button>
          <button type="button" onClick={advance} className="rounded-md border border-slate-200 px-2 py-1 hover:border-slate-300">
            Simulate change
          </button>
          <span className="hidden sm:inline">Scenario: {scenarioLabel}</span>
        </div>
      </div>

      <ul className="space-y-3">
        {shown.map((e) => (
          <li key={e.id}><EventCard e={e} /></li>
        ))}
        {shown.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[12.5px] text-slate-500">
            No events in this classification.
          </li>
        )}
      </ul>
    </div>
  );
}
