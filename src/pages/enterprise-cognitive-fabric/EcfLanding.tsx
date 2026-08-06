import { Link } from "react-router-dom";
import { Brain, Clock, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { ecfModule, ecfPages } from "./pages";
import { useEcfProgress } from "./useEcfProgress";

export default function EcfLanding() {
  const { isComplete, done, total, percent } = useEcfProgress();

  return (
    <div className="px-6 py-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <header className="rounded-xl bg-gradient-to-br from-white to-indigo-50/40 border border-slate-200 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-900 text-white">
            <Brain className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Module</div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{ecfModule.title}</h1>
            <p className="text-sm text-slate-600 mt-1">{ecfModule.subtitle}</p>
            <p className="text-[13px] text-slate-700 mt-3 max-w-4xl leading-relaxed">{ecfModule.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] text-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-500" /> Estimated duration: {ecfModule.duration}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] text-slate-700">
            {total} sections
          </span>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
              <span>Progress</span>
              <span>{done} of {total} complete · {percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      </header>

      {/* Learning Objectives */}
      <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-900 mb-3">Learning Objectives</div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {ecfModule.objectives.map((o) => (
            <li key={o} className="flex items-start gap-2 text-[13px] text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-300 mt-0.5 shrink-0" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Module Navigation Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ecfPages.map((p, i) => {
          const complete = isComplete(p.slug);
          return (
            <div key={p.slug} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                  Module {String(i + 1).padStart(2, "0")}
                </div>
                {complete ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Circle className="h-3.5 w-3.5" /> Not started
                  </span>
                )}
              </div>
              <h2 className="text-[15px] font-semibold text-slate-900 mt-1">{p.title}</h2>
              <p className="text-[12.5px] text-slate-600 mt-1 flex-1">{p.purpose}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> {p.duration}
                </span>
                <Link
                  to={`/enterprise-cognitive-fabric/${p.slug}`}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition"
                >
                  Launch <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
