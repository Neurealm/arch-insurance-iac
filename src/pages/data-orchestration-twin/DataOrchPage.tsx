import { useParams, Navigate } from "react-router-dom";
import { doPages, type DoPage } from "./pages";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const toneMap: Record<string, string> = {
  emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
  blue: "text-blue-700 bg-blue-50 border-blue-200",
  amber: "text-amber-700 bg-amber-50 border-amber-200",
  rose: "text-rose-700 bg-rose-50 border-rose-200",
  violet: "text-violet-700 bg-violet-50 border-violet-200",
};

export default function DataOrchPage() {
  const { slug } = useParams();
  const page: DoPage | undefined = doPages.find((p) => p.slug === slug);
  if (!page) return <Navigate to="/data-orchestration-twin/executive-control-plane" replace />;

  return (
    <div className="px-6 py-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <header className="rounded-xl bg-gradient-to-br from-white to-indigo-50/40 border border-slate-200 p-5 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">{page.group}</div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">{page.title}</h1>
        <p className="text-sm text-slate-600 mt-1">{page.tagline}</p>
        <p className="text-[13px] text-slate-700 mt-3 max-w-4xl leading-relaxed">{page.purpose}</p>
      </header>

      {/* KPIs */}
      <section className={`grid gap-3 ${page.metrics.length >= 6 ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-6" : "grid-cols-2 md:grid-cols-4"}`}>
        {page.metrics.map((m) => (
          <div key={m.label} className={`rounded-lg border ${toneMap[m.tone]} p-3`}>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{m.label}</div>
            <div className="text-2xl font-bold leading-tight mt-1">{m.value}</div>
            <div className="text-[11px] text-slate-600 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </section>

      {/* Columns */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {page.columns.map((c) => (
          <div key={c.heading} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <div className="text-sm font-semibold text-slate-900">{c.heading}</div>
            </div>
            <ul className="space-y-2">
              {c.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Workflow */}
      <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-900 mb-3">Operating Workflow</div>
        <div className="flex flex-wrap items-center gap-2">
          {page.workflow.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[12px] font-medium text-indigo-700">
                <span className="text-indigo-400 mr-1.5">{i + 1}</span>{step}
              </div>
              {i < page.workflow.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-300" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
