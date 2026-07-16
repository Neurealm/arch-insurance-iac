import { useMemo, useState } from "react";
import { AtcShell, PageHeader, PriBadge, StatusPill, Card } from "./atc/shared";
import { TICKETS, ASSIGNMENT_GROUPS, CATEGORIES } from "./atc/data";
import { Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TicketQueue() {
  const [q, setQ] = useState("");
  const [pri, setPri] = useState("All");
  const [group, setGroup] = useState("All");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => {
    return TICKETS.filter((t) => {
      if (q && !`${t.id} ${t.desc}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (pri !== "All" && t.priority !== pri) return false;
      if (group !== "All" && t.group !== group) return false;
      if (cat !== "All" && t.category !== cat) return false;
      if (status !== "All" && t.status !== status) return false;
      return true;
    });
  }, [q, pri, group, cat, status]);

  const summary = useMemo(() => ({
    total: rows.length,
    auto: rows.filter(r => r.status === "Auto-Categorized").length,
    review: rows.filter(r => r.status === "Manual Review").length,
    breached: rows.filter(r => r.slaState === "Breached").length,
    atRisk: rows.filter(r => r.slaState === "At Risk").length,
  }), [rows]);

  return (
    <AtcShell activeNav="queue" breadcrumb="Ticket Queue">
      <PageHeader title="Ticket Queue" subtitle="Every ticket flowing through the AI categorizer, with priority, source, and SLA state." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "In Queue", v: summary.total, tone: "text-slate-900" },
          { l: "Auto-Categorized", v: summary.auto, tone: "text-emerald-600" },
          { l: "Manual Review", v: summary.review, tone: "text-amber-600" },
          { l: "SLA Breached", v: summary.breached, tone: "text-rose-600" },
          { l: "SLA At Risk", v: summary.atRisk, tone: "text-amber-600" },
        ].map((k) => (
          <div key={k.l} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[11px] text-slate-500">{k.l}</div>
            <div className={cn("text-[24px] font-bold mt-1", k.tone)}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-4">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-b border-slate-100">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ticket or description..." className="h-8 pl-7 pr-3 rounded border border-slate-200 text-[12px] w-64" />
            </div>
            <select value={pri} onChange={(e) => setPri(e.target.value)} className="h-8 rounded border border-slate-200 px-2 text-[12px]">
              <option>All</option><option>P1</option><option>P2</option><option>P3</option><option>P4</option>
            </select>
            <select value={group} onChange={(e) => setGroup(e.target.value)} className="h-8 rounded border border-slate-200 px-2 text-[12px]">
              <option>All</option>
              {ASSIGNMENT_GROUPS.map((g) => <option key={g.id}>{g.name}</option>)}
            </select>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-8 rounded border border-slate-200 px-2 text-[12px]">
              <option>All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 rounded border border-slate-200 px-2 text-[12px]">
              <option>All</option><option>Auto-Categorized</option><option>Manual Review</option><option>In Progress</option><option>Escalated</option><option>Resolved</option>
            </select>
            <button className="ml-auto inline-flex items-center gap-1 h-8 px-3 rounded border border-slate-200 text-[11px] font-semibold hover:bg-slate-50">
              <Filter className="h-3 w-3" /> Save View
            </button>
            <button className="inline-flex items-center gap-1 h-8 px-3 rounded border border-slate-200 text-[11px] font-semibold hover:bg-slate-50">
              <Download className="h-3 w-3" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold w-6"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="px-3 py-2 font-semibold">Ticket #</th>
                  <th className="px-3 py-2 font-semibold">Description</th>
                  <th className="px-3 py-2 font-semibold">Priority</th>
                  <th className="px-3 py-2 font-semibold">Source</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold">Confidence</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Group</th>
                  <th className="px-3 py-2 font-semibold">Agent</th>
                  <th className="px-3 py-2 font-semibold">SLA</th>
                  <th className="px-3 py-2 font-semibold">Wait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-3 py-2 font-mono text-slate-700">{t.id}</td>
                    <td className="px-3 py-2 text-slate-800">{t.desc}</td>
                    <td className="px-3 py-2"><PriBadge p={t.priority} /></td>
                    <td className="px-3 py-2 text-slate-600">{t.source}</td>
                    <td className="px-3 py-2 text-slate-700">{t.category}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", t.confidence >= 85 ? "bg-emerald-500" : t.confidence >= 70 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${t.confidence}%` }} />
                        </div>
                        <span className="font-mono text-slate-700 text-[10px]">{t.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2"><StatusPill s={t.status} /></td>
                    <td className="px-3 py-2 text-slate-600">{t.group}</td>
                    <td className="px-3 py-2 text-slate-500">{t.agent}</td>
                    <td className="px-3 py-2"><StatusPill s={t.slaState} /></td>
                    <td className="px-3 py-2 font-mono text-slate-600">{t.wait}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={12} className="px-3 py-6 text-center text-slate-500 text-[11px]">No tickets match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 flex items-center justify-between border-t border-slate-100 text-[11px] text-slate-600">
            <div>Showing <span className="font-semibold">{rows.length}</span> of <span className="font-semibold">156</span> tickets</div>
            <div className="flex items-center gap-1">
              <button className="grid h-7 w-7 place-items-center rounded border border-slate-200 hover:bg-slate-50"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <span className="px-2">Page 1 / 13</span>
              <button className="grid h-7 w-7 place-items-center rounded border border-slate-200 hover:bg-slate-50"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
    </AtcShell>
  );
}
