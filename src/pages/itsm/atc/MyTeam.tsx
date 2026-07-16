import { AtcShell, PageHeader, StatusPill, Card } from "./atc/shared";
import { AGENTS } from "./atc/data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { UserPlus, MessageSquare, GraduationCap } from "lucide-react";

export default function MyTeam() {
  const online = AGENTS.filter(a => a.status === "Online").length;
  const totalAssigned = AGENTS.reduce((s, a) => s + a.assigned, 0);
  const totalResolved = AGENTS.reduce((s, a) => s + a.resolved, 0);
  const chartData = AGENTS.filter(a => a.assigned > 0).map(a => ({ name: a.name.split(" ")[0], assigned: a.assigned, resolved: a.resolved }));

  return (
    <AtcShell activeNav="team" breadcrumb="My Team">
      <PageHeader title="My Team" subtitle="Roster, capacity, categorization corrections, and SLA compliance for your service desk agents." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Agents Online", v: `${online} / ${AGENTS.length}`, tone: "text-emerald-600" },
          { l: "Assigned Today", v: totalAssigned, tone: "text-slate-900" },
          { l: "Resolved Today", v: totalResolved, tone: "text-slate-900" },
          { l: "Avg SLA Compliance", v: "96%", tone: "text-emerald-600" },
          { l: "Corrections Made", v: 34, tone: "text-indigo" },
        ].map((k) => (
          <div key={k.l} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[11px] text-slate-500">{k.l}</div>
            <div className={cn("text-[24px] font-bold mt-1", k.tone)}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 rounded-lg border border-slate-200 bg-white">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-100">
            <div className="text-[13px] font-semibold text-slate-900">Team Roster</div>
            <div className="text-[11px] text-slate-500">Shift 07:00 – 19:00 · Service Desk L1 + specialties</div>
          </div>
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Agent</th>
                <th className="px-3 py-2 font-semibold">Group</th>
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold text-right">Assigned</th>
                <th className="px-3 py-2 font-semibold text-right">Resolved</th>
                <th className="px-3 py-2 font-semibold text-right">Reopened</th>
                <th className="px-3 py-2 font-semibold text-right">Avg Handle</th>
                <th className="px-3 py-2 font-semibold text-right">SLA</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {AGENTS.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo/10 text-indigo grid place-items-center text-[9px] font-bold">{a.name.split(" ").map(n => n[0]).join("")}</div>
                      {a.name}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{a.group}</td>
                  <td className="px-3 py-2 text-slate-600">{a.role}</td>
                  <td className="px-3 py-2"><StatusPill s={a.status} /></td>
                  <td className="px-3 py-2 text-right font-mono">{a.assigned}</td>
                  <td className="px-3 py-2 text-right font-mono">{a.resolved}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-600">{a.reopened}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-600">{a.handle}</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-600">{a.sla}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button title="Reassign" className="grid h-6 w-6 place-items-center rounded border border-slate-200 hover:bg-slate-50"><UserPlus className="h-3 w-3" /></button>
                      <button title="Message" className="grid h-6 w-6 place-items-center rounded border border-slate-200 hover:bg-slate-50"><MessageSquare className="h-3 w-3" /></button>
                      <button title="Coach" className="grid h-6 w-6 place-items-center rounded border border-slate-200 hover:bg-slate-50"><GraduationCap className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <Card title="Assigned vs Resolved (Today)">
            <div className="h-[260px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="assigned" fill="#a5b4fc" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="resolved" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-600 mt-1">
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-indigo/30" /> Assigned</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-indigo" /> Resolved</span>
            </div>
          </Card>

          <Card title="Coaching Recommendations" subtitle="AI-suggested based on categorization corrections and handle time.">
            <ul className="space-y-2 text-[11px]">
              <li className="border-l-2 border-amber-400 pl-2">
                <div className="font-semibold text-slate-900">Alex Rodriguez</div>
                <div className="text-slate-600">Reopened rate 13.6% · consider Hardware / Domain-join refresher.</div>
              </li>
              <li className="border-l-2 border-amber-400 pl-2">
                <div className="font-semibold text-slate-900">Priya Patel</div>
                <div className="text-slate-600">3 categorization corrections this shift on Software / Applications.</div>
              </li>
              <li className="border-l-2 border-emerald-400 pl-2">
                <div className="font-semibold text-slate-900">Emily Thompson</div>
                <div className="text-slate-600">Highest resolved (21) and 99% SLA — nominate for peer coaching.</div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </AtcShell>
  );
}
