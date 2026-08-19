import { cn } from "@/lib/utils";
import { deployments } from "./data";
import { Interactive, PageHeader, Sparkline, StatusChip, statusStyles, useImpactDrawer } from "./primitives";

export default function CustomerHealthDeployments() {
  const { open } = useImpactDrawer();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Your Deployments"
        subtitle="Every environment running your workloads, with the health your users experience."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {deployments.map((d) => (
          <Interactive
            key={d.id}
            tooltip="What this deployment is doing right now, and whether anything underneath it puts your users at risk."
            onClick={() => open(d.contextId)}
            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60"
          >
            <div className={cn("flex items-center justify-between gap-2 border-b px-3.5 py-2", statusStyles[d.status].chip)}>
              <span className="text-[12px] font-medium">{statusStyles[d.status].label}</span>
              <span className="text-[11px] opacity-80">{d.tier}</span>
            </div>
            <div className="px-3.5 py-3">
              <div className="text-[14px] font-semibold text-slate-100">{d.name}</div>
              <div className="mt-0.5 text-[11.5px] text-slate-400">{d.region} · {d.nodes} nodes</div>
              <div className="mt-3 flex items-end justify-between gap-3 border-t border-slate-800 pt-3">
                <div>
                  <div className="text-[18px] font-semibold text-slate-50">{d.availability}</div>
                  <div className="text-[10.5px] text-slate-500">Availability (24h)</div>
                </div>
                <div className="w-28"><Sparkline points={d.spark} status={d.status} /></div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className={cn("text-[11.5px]", d.status === "healthy" ? "text-slate-500" : statusStyles[d.status].text)}>{d.alerts}</span>
                <StatusChip status={d.status} />
              </div>
            </div>
          </Interactive>
        ))}
      </div>
    </div>
  );
}
