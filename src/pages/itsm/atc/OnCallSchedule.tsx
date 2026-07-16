import { AtcShell, PageHeader, Card } from "./atc/shared";
import { ON_CALL } from "./atc/data";
import { CalendarClock, PhoneCall } from "lucide-react";

export default function OnCallSchedule() {
  return (
    <AtcShell activeNav="oncall" breadcrumb="On-Call Schedule">
      <PageHeader title="On-Call Schedule" subtitle="Primary, secondary, and escalation owners across all assignment groups." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Groups Covered</div><div className="text-[26px] font-bold mt-1">{ON_CALL.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Shift Coverage</div><div className="text-[26px] font-bold mt-1 text-emerald-600">100%</div></Card>
        <Card><div className="text-[11px] text-slate-500">24×7 Rotations</div><div className="text-[26px] font-bold mt-1">1</div></Card>
        <Card><div className="text-[11px] text-slate-500">Paged (24h)</div><div className="text-[26px] font-bold mt-1">6</div></Card>
      </div>

      <div className="px-6 pb-4">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            <span className="text-[13px] font-semibold text-slate-900">Today — Jun 9, 2026</span>
          </div>
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Assignment Group</th>
                <th className="px-3 py-2 font-semibold">Primary</th>
                <th className="px-3 py-2 font-semibold">Secondary</th>
                <th className="px-3 py-2 font-semibold">Escalation</th>
                <th className="px-3 py-2 font-semibold">Shift</th>
                <th className="px-3 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ON_CALL.map((o) => {
                const initials = (name: string) => name.split(" ").map(n => n[0]).join("");
                return (
                  <tr key={o.group} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-800 font-semibold">{o.group}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-[9px] font-bold">{initials(o.primary)}</div>
                        <span className="text-slate-800">{o.primary}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo/10 text-indigo grid place-items-center text-[9px] font-bold">{initials(o.secondary)}</div>
                        <span className="text-slate-700">{o.secondary}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{o.escalation}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{o.shift}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="inline-flex items-center gap-1 h-7 px-2 rounded border border-slate-200 text-[10px] font-semibold hover:bg-slate-50"><PhoneCall className="h-3 w-3" /> Page Primary</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AtcShell>
  );
}
