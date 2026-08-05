import { AtcShell, PageHeader, Card } from "./shared";
import { REPORT_CATALOG } from "./data";
import { FileText, Download, Play, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const iconFor: Record<string, any> = {
  Daily: Clock, Shift: Users, Weekly: FileText, Monthly: FileText,
};

export default function Reports() {
  return (
    <AtcShell activeNav="reports" breadcrumb="Reports">
      <PageHeader title="Reports" subtitle="Scheduled and on-demand reports for service desk operations and AI performance." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Scheduled Reports</div><div className="text-[26px] font-bold mt-1">{REPORT_CATALOG.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Generated Today</div><div className="text-[26px] font-bold mt-1">6</div></Card>
        <Card><div className="text-[11px] text-slate-500">Recipients</div><div className="text-[26px] font-bold mt-1">42</div></Card>
        <Card><div className="text-[11px] text-slate-500">Failed (7d)</div><div className="text-[26px] font-bold mt-1 text-emerald-600">0</div></Card>
      </div>

      <div className="px-6 pb-4 grid grid-cols-12 gap-4">
        <Card title="Report Catalog" className="col-span-12 xl:col-span-8">
          <table className="w-full text-left text-[11px] -mx-4">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Report</th>
                <th className="px-3 py-2 font-semibold">Cadence</th>
                <th className="px-3 py-2 font-semibold">Audience</th>
                <th className="px-3 py-2 font-semibold">Last Run</th>
                <th className="px-3 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {REPORT_CATALOG.map((r) => {
                const Icon = iconFor[r.cadence] ?? FileText;
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded bg-indigo/10 text-indigo grid place-items-center"><Icon className="h-3.5 w-3.5" /></div>
                        <div>
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.cadence}</td>
                    <td className="px-3 py-2 text-slate-600">{r.audience}</td>
                    <td className="px-3 py-2 text-slate-600">{r.last}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="inline-flex items-center gap-1 h-7 px-2 rounded border border-slate-200 text-[10px] font-semibold hover:bg-slate-50"><Play className="h-3 w-3" /> Run</button>
                        <button className="inline-flex items-center gap-1 h-7 px-2 rounded border border-slate-200 text-[10px] font-semibold hover:bg-slate-50"><Download className="h-3 w-3" /> PDF</button>
                        <button className="inline-flex items-center gap-1 h-7 px-2 rounded border border-slate-200 text-[10px] font-semibold hover:bg-slate-50"><Download className="h-3 w-3" /> CSV</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card title="Recent Deliveries" className="col-span-12 xl:col-span-4">
          <ul className="space-y-2 text-[11px]">
            {[
              { name: "Daily Operations Report", to: "Manager Group", at: "Jun 9, 08:00", size: "218 KB" },
              { name: "Shift Handoff Report", to: "Leads Group", at: "Jun 9, 07:00", size: "94 KB" },
              { name: "SLA Risk Report", to: "Manager Group", at: "Jun 9, 09:00", size: "142 KB" },
              { name: "AI Performance Report", to: "AI Ops", at: "Jun 8, 17:00", size: "512 KB" },
              { name: "Weekly Service Desk Review", to: "Director", at: "Jun 8, 17:00", size: "1.2 MB" },
            ].map((d) => (
              <li key={d.name} className="flex items-start gap-2 pb-2 border-b border-slate-100 last:border-0">
                <FileText className="h-3.5 w-3.5 text-indigo mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{d.name}</div>
                  <div className="text-[10px] text-slate-500">{d.to} · {d.at} · {d.size}</div>
                </div>
                <button className="text-[10px] font-semibold text-indigo hover:underline">Download</button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AtcShell>
  );
}
