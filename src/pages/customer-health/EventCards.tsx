// Customer-impact-first event list. Ranking is driven by actual customer
// impact, then potential impact, deployments exposed, duration and — last —
// infrastructure severity.

import { cn } from "@/lib/utils";
import { classificationStyles } from "./eventDetail";
import { Interactive, useImpactDrawer } from "./primitives";
import type { ServiceEvent } from "./types";

const impactTone = (e: ServiceEvent) =>
  (e.ranking?.actualImpact ?? 0) >= 2
    ? "text-red-600"
    : (e.ranking?.actualImpact ?? 0) === 1
      ? "text-amber-600"
      : "text-emerald-600";

export function EventCard({ e, compact = false }: { e: ServiceEvent; compact?: boolean }) {
  const { open } = useImpactDrawer();
  const cls = classificationStyles[e.kind] ?? classificationStyles.Advisory;
  return (
    <Interactive
      tooltip="Events are ranked by how much they affect you — not by infrastructure severity alone."
      onClick={() => open(e.contextId)}
      correlationKey={`event:${e.id}`}
      className={cn(
        "rounded-xl border bg-white px-4 py-3.5",
        (e.ranking?.actualImpact ?? 0) >= 3
          ? "border-red-300"
          : (e.ranking?.actualImpact ?? 0) >= 2
            ? "border-orange-300"
            : "border-slate-200",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", cls.chip)}>{cls.label}</span>
        <span className={cn("font-semibold text-slate-900", compact ? "text-[13.5px]" : "text-[14px]")}>{e.title}</span>
        {e.active === false && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">CLOSED</span>
        )}
      </div>
      <p className="mt-2 max-w-4xl text-[12.5px] leading-relaxed text-slate-600">{e.summary}</p>
      <dl className={cn("mt-3 grid gap-3 border-t border-slate-200 pt-2.5 text-[11px]", compact ? "sm:grid-cols-3" : "sm:grid-cols-4")}>
        <div><dt className="text-slate-500">Started</dt><dd className="text-slate-700">{e.started}</dd></div>
        <div><dt className="text-slate-500">Last updated</dt><dd className="text-slate-700 tabular-nums">{e.updated}</dd></div>
        <div><dt className="text-slate-500">Affected deployment</dt><dd className="text-slate-700">{e.affectedDeployment}</dd></div>
        <div><dt className="text-slate-500">Affected dependency</dt><dd className="text-slate-700">{e.affectedDependency}</dd></div>
        <div><dt className="text-slate-500">Customer impact</dt><dd className={impactTone(e)}>{e.customerImpact ?? e.impactToYou}</dd></div>
        <div><dt className="text-slate-500">Response status</dt><dd className="text-slate-700">{e.responseStatus ?? e.response}</dd></div>
        <div><dt className="text-slate-500">Next update</dt><dd className="text-slate-700">{e.nextUpdate}</dd></div>
        <div><dt className="text-slate-500">Deployments exposed</dt><dd className="text-slate-700 tabular-nums">{e.ranking?.exposedDeployments ?? 0}</dd></div>
      </dl>
    </Interactive>
  );
}
