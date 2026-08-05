import { useState } from "react";
import { AtcShell, PageHeader, Card } from "./shared";
import { KB_ARTICLES, CATEGORIES } from "./data";
import { Search, BookOpen, ThumbsUp, Eye, Plus } from "lucide-react";

export default function KnowledgeBase() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const rows = KB_ARTICLES.filter(k => {
    if (q && !`${k.id} ${k.title}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat !== "All" && k.category !== cat) return false;
    return true;
  });

  return (
    <AtcShell activeNav="kb" breadcrumb="Knowledge Base">
      <PageHeader title="Knowledge Base" subtitle="Articles the AI categorizer suggests to agents and self-service users." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Articles Published</div><div className="text-[26px] font-bold mt-1">218</div></Card>
        <Card><div className="text-[11px] text-slate-500">Views (30d)</div><div className="text-[26px] font-bold mt-1">42,118</div></Card>
        <Card><div className="text-[11px] text-slate-500">Avg. Helpfulness</div><div className="text-[26px] font-bold mt-1 text-emerald-600">93%</div></Card>
        <Card><div className="text-[11px] text-slate-500">AI-Suggested Rate</div><div className="text-[26px] font-bold mt-1 text-indigo">71%</div></Card>
      </div>

      <div className="px-6 pb-4">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-b border-slate-100">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles..." className="h-8 pl-7 pr-3 rounded border border-slate-200 text-[12px] w-64" />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-8 rounded border border-slate-200 px-2 text-[12px]">
              <option>All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button className="ml-auto inline-flex items-center gap-1 h-8 px-3 rounded bg-indigo text-white text-[11px] font-semibold hover:bg-indigo/90">
              <Plus className="h-3.5 w-3.5" /> New Article
            </button>
          </div>
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Article #</th>
                <th className="px-3 py-2 font-semibold">Title</th>
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 font-semibold text-right">Views</th>
                <th className="px-3 py-2 font-semibold text-right">Helpful</th>
                <th className="px-3 py-2 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-slate-700">{k.id}</td>
                  <td className="px-3 py-2 text-slate-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-indigo shrink-0" />
                      {k.title}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{k.category}</td>
                  <td className="px-3 py-2 text-right"><span className="inline-flex items-center gap-1 font-mono"><Eye className="h-3 w-3 text-slate-400" />{k.views.toLocaleString()}</span></td>
                  <td className="px-3 py-2 text-right"><span className="inline-flex items-center gap-1 font-mono text-emerald-600"><ThumbsUp className="h-3 w-3" />{k.useful}%</span></td>
                  <td className="px-3 py-2 text-slate-600">{k.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AtcShell>
  );
}
