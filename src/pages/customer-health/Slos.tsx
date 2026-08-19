import { cn } from "@/lib/utils";
import { slos } from "./data";
import { Interactive, MetricBar, PageHeader, statusStyles, useImpactDrawer } from "./primitives";

export default function CustomerHealthSlos() {
  const { open } = useImpactDrawer();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Service Level Objectives"
        subtitle="The commitments we make to you, how we are performing against them, and how much error budget remains."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {slos.map((s) => (
          <Interactive
            key={s.id}
            tooltip="How your service is performing against a commitment we make to you, and how much error budget remains."
            onClick={() => open(s.contextId)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3.5"
          >
            <div className="text-[11.5px] text-slate-500">{s.name}</div>
            <div className="mt-1 text-[22px] font-semibold leading-none text-slate-900">{s.current}</div>
            <div className="mt-1 text-[11.5px] text-slate-500">Target {s.target}</div>
            <div className={cn("mt-2 text-[12px] font-medium", statusStyles[s.status].text)}>
              {statusStyles[s.status].label} · attainment {s.attainment}%
            </div>
            <div className="mt-2.5"><MetricBar value={s.errorBudget} status={s.status} /></div>
            <div className="mt-1 text-[10.5px] text-slate-500">{s.errorBudget}% error budget remaining</div>
          </Interactive>
        ))}
      </div>
    </div>
  );
}
