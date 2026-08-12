import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, LayoutGrid, Clock, CheckCircle2, Circle } from "lucide-react";
import { ecfPages } from "./pages";
import { useEcfProgress } from "./useEcfProgress";
import { cn } from "@/lib/utils";

function Wireframe({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-slate-300 bg-slate-50 grid place-items-center text-[11px] font-medium uppercase tracking-wide text-slate-400",
        className,
      )}
      aria-label={`${label} placeholder`}
    >
      {label}
    </div>
  );
}

export default function EcfPage() {
  const { slug } = useParams();
  const idx = ecfPages.findIndex((p) => p.slug === slug);
  const { isComplete, toggle, done, total, percent } = useEcfProgress();

  if (idx < 0) return <Navigate to="/enterprise-cognitive-fabric" replace />;
  const page = ecfPages[idx];
  const prev = idx > 0 ? ecfPages[idx - 1] : null;
  const next = idx < ecfPages.length - 1 ? ecfPages[idx + 1] : null;
  const complete = isComplete(page.slug);

  return (
    <div className="px-6 py-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <header className="rounded-xl bg-gradient-to-br from-white to-indigo-50/40 border border-slate-200 p-5 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">{page.group}</div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          <span className="text-slate-400 mr-2">{String(idx + 1).padStart(2, "0")}</span>
          {page.title}
        </h1>
        <p className="text-sm text-slate-600 mt-1">{page.purpose}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] text-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-500" /> {page.duration}
          </span>
          <button
            type="button"
            onClick={() => toggle(page.slug)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] transition",
              complete
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700",
            )}
          >
            {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            {complete ? "Marked complete" : "Mark complete"}
          </button>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
              <span>Module progress</span>
              <span>{done} of {total} · {percent}%</span>
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
        <div className="grid gap-2 sm:grid-cols-2">
          <Wireframe label="Objective" className="h-10" />
          <Wireframe label="Objective" className="h-10" />
          <Wireframe label="Objective" className="h-10" />
          <Wireframe label="Objective" className="h-10" />
        </div>
      </section>

      {/* Primary Content Area */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900 mb-3">Primary Content Area</div>
            <div className="space-y-3">
              <Wireframe label="Workflow Diagram" className="h-32" />
              <div className="grid gap-3 sm:grid-cols-3">
                <Wireframe label="Card" className="h-24" />
                <Wireframe label="Card" className="h-24" />
                <Wireframe label="Card" className="h-24" />
              </div>
              <Wireframe label="Table" className="h-40" />
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900 mb-3">Dashboard Panels</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Wireframe label="Chart" className="h-32" />
              <Wireframe label="Chart" className="h-32" />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900 mb-3">Side Panel</div>
            <Wireframe label="Side Panel" className="h-56" />
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900 mb-3">Key Takeaways</div>
            <div className="space-y-2">
              <Wireframe label="Takeaway" className="h-9" />
              <Wireframe label="Takeaway" className="h-9" />
              <Wireframe label="Takeaway" className="h-9" />
            </div>
          </div>
        </aside>
      </section>

      {/* Interactive Demonstration */}
      <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-900 mb-3">Interactive Demonstration</div>
        <Wireframe label="Demonstration Area" className="h-48" />
      </section>

      {/* Summary */}
      <section className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-900 mb-3">Summary</div>
        <Wireframe label="Summary" className="h-24" />
      </section>

      {/* Navigation */}
      <nav
        className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm flex flex-wrap items-center justify-between gap-2"
        aria-label="Module page navigation"
      >
        <div className="flex items-center gap-2">
          {prev ? (
            <Link
              to={`/enterprise-cognitive-fabric/${prev.slug}`}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition max-w-[260px]"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{prev.title}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 px-2.5 py-1.5 text-[12px] text-slate-300">
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/enterprise-cognitive-fabric"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition"
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Return to Module
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition"
          >
            <Home className="h-3.5 w-3.5" /> Return to Home
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {next ? (
            <Link
              to={`/enterprise-cognitive-fabric/${next.slug}`}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition max-w-[260px]"
            >
              <span className="truncate">{next.title}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 px-2.5 py-1.5 text-[12px] text-slate-300">
              Next <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}
