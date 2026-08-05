import { AtcShell, PageHeader, Card } from "./shared";
import { ASSIGNMENT_GROUPS, CATEGORY_DIST } from "./data";
import { UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Assignments() {
  const totalMembers = ASSIGNMENT_GROUPS.reduce((s, g) => s + g.members, 0);
  const totalQueue = ASSIGNMENT_GROUPS.reduce((s, g) => s + g.queue, 0);

  return (
    <AtcShell activeNav="assign" breadcrumb="Assignments">
      <PageHeader title="Assignments" subtitle="Assignment groups, current queue depth, and category-to-group routing map." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Groups</div><div className="text-[26px] font-bold mt-1">{ASSIGNMENT_GROUPS.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Agents</div><div className="text-[26px] font-bold mt-1">{totalMembers}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Total Queue Depth</div><div className="text-[26px] font-bold mt-1">{totalQueue}</div></Card>
        <Card><div className="text-[11px] text-slate-500">First-Assignment Accuracy</div><div className="text-[26px] font-bold mt-1 text-emerald-600">91%</div></Card>
      </div>

      <div className="px-6 pb-4 grid grid-cols-12 gap-4">
        <Card title="Assignment Groups" className="col-span-12 xl:col-span-7">
          <table className="w-full text-left text-[11px] -mx-4">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Group</th>
                <th className="px-3 py-2 font-semibold text-right">Members</th>
                <th className="px-3 py-2 font-semibold text-right">Queue</th>
                <th className="px-3 py-2 font-semibold text-right">Avg Handle</th>
                <th className="px-3 py-2 font-semibold">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ASSIGNMENT_GROUPS.map((g) => {
                const capacity = Math.min(100, Math.round((g.queue / (g.members * 4)) * 100));
                const tone = capacity >= 90 ? "bg-rose-500" : capacity >= 70 ? "bg-amber-500" : "bg-emerald-500";
                return (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded bg-indigo/10 text-indigo grid place-items-center"><Users className="h-3.5 w-3.5" /></div>
                        <div>
                          <div className="font-semibold">{g.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{g.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{g.members}</td>
                    <td className="px-3 py-2 text-right font-mono">{g.queue}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">{g.avgHandle}</td>
                    <td className="px-3 py-2 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn("h-full", tone)} style={{ width: `${capacity}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-slate-600 w-8 text-right">{capacity}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card title="Category → Group Routing" subtitle="How the AI routes each predicted category." className="col-span-12 xl:col-span-5">
          <ul className="space-y-2 -mt-1">
            {CATEGORY_DIST.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-[11px] p-2 rounded border border-slate-100">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="flex-1 text-slate-800 font-semibold">{c.name}</span>
                <UserPlus className="h-3 w-3 text-slate-400" />
                <span className="text-slate-700">{c.group}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AtcShell>
  );
}
