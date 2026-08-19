import { cn } from "@/lib/utils";
import { events } from "./data";
import { Interactive, PageHeader, StatusChip, useImpactDrawer } from "./primitives";

export default function CustomerHealthEvents() {
  const { open } = useImpactDrawer();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Events"
        subtitle="Advisories, incidents and information notices raised against the services you consume."
      />
      <ul className="space-y-3">
        {events.map((e) => (
          <li key={e.id}>
            <Interactive
              tooltip="An event we are managing. Advisories describe an underlying condition; they do not automatically mean your service is impacted."
              onClick={() => open(e.contextId)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={e.status} label={e.kind} />
                <span className="text-[14px] font-semibold text-slate-900">{e.title}</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">Started {e.started} · Updated {e.updated} · Next update {e.nextUpdate}</div>
              <p className="mt-2 max-w-4xl text-[12.5px] leading-relaxed text-slate-600">{e.summary}</p>
              <dl className="mt-3 grid gap-3 border-t border-slate-200 pt-2.5 text-[11px] sm:grid-cols-4">
                <div><dt className="text-slate-500">Impact to you</dt><dd className={cn(e.impactToYou.toLowerCase().includes("no ") ? "text-emerald-400" : "text-amber-400")}>{e.impactToYou}</dd></div>
                <div><dt className="text-slate-500">Affected deployment</dt><dd className="text-slate-700">{e.affectedDeployment}</dd></div>
                <div><dt className="text-slate-500">Affected dependency</dt><dd className="text-slate-700">{e.affectedDependency}</dd></div>
                <div><dt className="text-slate-500">Provider reference</dt><dd className="font-mono text-slate-700">{e.providerReference}</dd></div>
              </dl>
            </Interactive>
          </li>
        ))}
      </ul>
    </div>
  );
}
