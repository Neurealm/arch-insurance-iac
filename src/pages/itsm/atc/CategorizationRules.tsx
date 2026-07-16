import { useState } from "react";
import { AtcShell, PageHeader, PriBadge, Card } from "./shared";
import { CATEGORIZATION_RULES } from "./data";
import { Search, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategorizationRules() {
  const [rules, setRules] = useState(CATEGORIZATION_RULES);
  const [q, setQ] = useState("");
  const toggle = (id: string) => setRules(rs => rs.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const rows = rules.filter(r => !q || `${r.id} ${r.name} ${r.category}`.toLowerCase().includes(q.toLowerCase()));
  const enabled = rules.filter(r => r.enabled).length;

  return (
    <AtcShell activeNav="rules" breadcrumb="Categorization Rules">
      <PageHeader title="Categorization Rules" subtitle="Deterministic rules layered on top of the AI model. Higher precision, human-authored." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Total Rules</div><div className="text-[26px] font-bold mt-1">{rules.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Enabled</div><div className="text-[26px] font-bold mt-1 text-emerald-600">{enabled}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Total Matches (30d)</div><div className="text-[26px] font-bold mt-1">{rules.reduce((s, r) => s + r.matches, 0).toLocaleString()}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Avg Precision</div><div className="text-[26px] font-bold mt-1 text-emerald-600">{Math.round(rules.reduce((s, r) => s + r.precision, 0) / rules.length)}%</div></Card>
      </div>

      <div className="px-6 pb-4">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-100">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rules..." className="h-8 pl-7 pr-3 rounded border border-slate-200 text-[12px] w-64" />
            </div>
            <button className="ml-auto inline-flex items-center gap-1 h-8 px-3 rounded bg-indigo text-white text-[11px] font-semibold hover:bg-indigo/90">
              <Plus className="h-3.5 w-3.5" /> New Rule
            </button>
          </div>
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Rule</th>
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 font-semibold">Route To</th>
                <th className="px-3 py-2 font-semibold">Priority</th>
                <th className="px-3 py-2 font-semibold text-right">Matches (30d)</th>
                <th className="px-3 py-2 font-semibold text-right">Precision</th>
                <th className="px-3 py-2 font-semibold text-right">Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-800">
                    <div className="flex items-center gap-2">
                      <Settings className="h-3.5 w-3.5 text-indigo" />
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{r.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{r.category}</td>
                  <td className="px-3 py-2 text-slate-600">{r.group}</td>
                  <td className="px-3 py-2"><PriBadge p={r.priority} /></td>
                  <td className="px-3 py-2 text-right font-mono">{r.matches.toLocaleString()}</td>
                  <td className={cn("px-3 py-2 text-right font-mono", r.precision >= 95 ? "text-emerald-600" : r.precision >= 85 ? "text-amber-600" : "text-rose-600")}>{r.precision}%</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => toggle(r.id)} className={cn("relative inline-flex h-4 w-8 rounded-full transition-colors", r.enabled ? "bg-emerald-500" : "bg-slate-300")}>
                      <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform", r.enabled ? "translate-x-4" : "translate-x-0.5")} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AtcShell>
  );
}
