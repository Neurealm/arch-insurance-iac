import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Database, ArrowLeft } from "lucide-react";
import { doPages, doGroups } from "./pages";

export default function DataOrchLayout() {
  const location = useLocation();
  const active = doPages.find((p) => location.pathname.endsWith(p.slug));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Module Nav */}
      <aside className="w-72 shrink-0 bg-white border-r border-slate-200 sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-200 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
          <Link to="/prod-resilience-twin" className="inline-flex items-center gap-1 text-[11px] text-indigo-100 hover:text-white mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Resilience Twin
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/15 grid place-items-center">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-100">Module</div>
              <div className="text-sm font-bold leading-tight">Data Orchestration Twin</div>
            </div>
          </div>
        </div>
        <nav className="p-2 space-y-3">
          {doGroups.map((group) => (
            <div key={group}>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{group}</div>
              <div className="space-y-0.5">
                {doPages
                  .filter((p) => p.group === group)
                  .map((p) => (
                    <NavLink
                      key={p.slug}
                      to={`/data-orchestration-twin/${p.slug}`}
                      className={({ isActive }) =>
                        `block px-2 py-1.5 rounded-md text-[12px] leading-snug transition ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`
                      }
                    >
                      {p.title}
                    </NavLink>
                  ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Link to="/prod-resilience-twin" className="hover:text-indigo-600">Resilience Twin</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Data Orchestration Twin</span>
            {active && (
              <>
                <span>/</span>
                <span className="text-indigo-600 font-semibold">{active.title}</span>
              </>
            )}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
