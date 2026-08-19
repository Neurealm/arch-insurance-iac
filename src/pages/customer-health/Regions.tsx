import { cn } from "@/lib/utils";
import { regions } from "./data";
import { Interactive, PageHeader, Panel, statusStyles, useImpactDrawer } from "./primitives";

export default function CustomerHealthRegions() {
  const { open } = useImpactDrawer();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Regions"
        subtitle="Cloud regions your deployments depend on, and whether a regional condition reaches you."
      />
      <Panel title="Regional Map" subtitle="Select a region to see whether anything you run there is affected">
        <div className="relative h-64 overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_40%,rgba(56,189,248,0.12),transparent_60%)]" aria-hidden />
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => open(r.contextId)}
              title={`${r.name} — ${r.note}`}
              aria-label={`${r.name} region health`}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1.5 transition-transform duration-200 hover:scale-125"
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
            >
              <span className={cn("block h-3 w-3 rounded-full ring-4 ring-slate-900", statusStyles[r.status].dot)} />
            </button>
          ))}
        </div>
      </Panel>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {regions.map((r) => (
          <Interactive
            key={r.id}
            tooltip="Whether this cloud region is healthy, and whether anything you run there is affected."
            onClick={() => open(r.contextId)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] font-semibold text-slate-100">{r.name}</span>
              <span className={cn("text-[12px] font-medium", statusStyles[r.status].text)}>{statusStyles[r.status].label}</span>
            </div>
            <p className="mt-1 text-[11.5px] text-slate-400">{r.note}</p>
          </Interactive>
        ))}
      </div>
    </div>
  );
}
