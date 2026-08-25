import { Download } from "lucide-react";
import { reports } from "./data";
import { Interactive, PageHeader, useImpactDrawer } from "./primitives";

export default function CustomerHealthReports() {
  const { open } = useImpactDrawer();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports"
        subtitle="Evidence you can share internally: availability, events, changes and SLO attainment."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Interactive
            key={r.id}
            tooltip="What this report contains and the period it covers."
            onClick={() => open(r.contextId)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-slate-900">{r.name}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{r.period} · {r.format}</div>
              </div>
              <Download className="h-4 w-4 shrink-0 text-sky-600" />
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{r.description}</p>
          </Interactive>
        ))}
      </div>
    </div>
  );
}
