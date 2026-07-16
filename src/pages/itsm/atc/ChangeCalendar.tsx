import { AtcShell, PageHeader, StatusPill, Card } from "./atc/shared";
import { CHANGES } from "./atc/data";
import { CalendarRange, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const riskTone: Record<string, string> = {
  Low: "text-emerald-600 border-emerald-200 bg-emerald-50",
  Medium: "text-amber-600 border-amber-200 bg-amber-50",
  High: "text-rose-600 border-rose-200 bg-rose-50",
};

export default function ChangeCalendar() {
  return (
    <AtcShell activeNav="cal" breadcrumb="Change Calendar">
      <PageHeader title="Change Calendar" subtitle="Upcoming changes that may affect ticket volume or categorization accuracy." actions={
        <button className="inline-flex items-center gap-1.5 rounded bg-indigo text-white px-3 h-7 text-[11px] font-semibold hover:bg-indigo/90">
          <Plus className="h-3 w-3" /> Schedule Change
        </button>
      } />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Scheduled (7d)</div><div className="text-[26px] font-bold mt-1">{CHANGES.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">High Risk</div><div className="text-[26px] font-bold mt-1 text-rose-600">{CHANGES.filter(c => c.risk === "High").length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Awaiting Approval</div><div className="text-[26px] font-bold mt-1 text-amber-600">{CHANGES.filter(c => c.state === "Pending" || c.state === "Draft").length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Blackout Windows</div><div className="text-[26px] font-bold mt-1">2</div></Card>
      </div>

      <div className="px-6 pb-4">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-slate-500" />
            <span className="text-[13px] font-semibold text-slate-900">Change Schedule — Week of Jun 9, 2026</span>
          </div>
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Change #</th>
                <th className="px-3 py-2 font-semibold">Title</th>
                <th className="px-3 py-2 font-semibold">Window</th>
                <th className="px-3 py-2 font-semibold">Service</th>
                <th className="px-3 py-2 font-semibold">Owner</th>
                <th className="px-3 py-2 font-semibold">Risk</th>
                <th className="px-3 py-2 font-semibold">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CHANGES.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-slate-700">{c.id}</td>
                  <td className="px-3 py-2 text-slate-800 font-semibold">{c.title}</td>
                  <td className="px-3 py-2 text-slate-700 font-mono text-[10px]">{c.window}</td>
                  <td className="px-3 py-2 text-slate-700">{c.service}</td>
                  <td className="px-3 py-2 text-slate-600">{c.owner}</td>
                  <td className="px-3 py-2">
                    <span className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold", riskTone[c.risk])}>{c.risk}</span>
                  </td>
                  <td className="px-3 py-2"><StatusPill s={c.state} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AtcShell>
  );
}
