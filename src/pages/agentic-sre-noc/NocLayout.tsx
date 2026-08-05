import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, Circle, Home, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import { nocGroups, nocPages, nocPath } from "./pages";

const COLLAPSE_KEY = "agenticSreNoc.collapsed";

/** Module shell for the Agentic SRE NOC pages. */
export default function NocLayout() {
  const { pathname } = useLocation();
  const active =
    nocPages.find((p) => p.slug && pathname === nocPath(p.slug)) ??
    nocPages.find((p) => !p.slug);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  });
  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          "sticky top-0 z-30 h-screen shrink-0 flex flex-col border-r border-slate-200 bg-white transition-[width] duration-150",
          collapsed ? "w-14" : "w-64",
        )}
        aria-label="Agentic SRE NOC navigation"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-900 text-white">
            <Radar className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Module</div>
              <div className="text-[12.5px] font-semibold leading-tight text-slate-900">Agentic SRE NOC</div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <Link
            to="/app"
            title={collapsed ? "NeuGAIN Command Center" : undefined}
            className="mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <Home className="h-4 w-4 shrink-0 text-slate-500" />
            {!collapsed && <span className="truncate">NeuGAIN Command Center</span>}
          </Link>
          <div className="mx-2 my-1 h-px bg-slate-200" aria-hidden />

          {nocGroups.map((group) => {
            const items = nocPages.filter((p) => p.group === group);
            if (!items.length) return null;
            return (
              <div key={group} className="mb-2">
                {!collapsed && (
                  <div className="px-4 pb-1 pt-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {group}
                  </div>
                )}
                {items.map((p) => (
                  <NavLink
                    key={p.slug || "index"}
                    to={nocPath(p.slug)}
                    end={!p.slug}
                    title={collapsed ? p.title : undefined}
                    className={({ isActive }) =>
                      cn(
                        "mx-2 my-0.5 flex items-center gap-2.5 rounded-md py-2 text-[12.5px] transition-colors",
                        collapsed ? "justify-center px-0" : "px-2.5",
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Circle
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 fill-current",
                            isActive ? "text-white" : "text-slate-400",
                          )}
                        />
                        {!collapsed && <span className="truncate">{p.title}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
          {!collapsed ? "Agentic SRE NOC" : "·"}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="bg-white border-b border-slate-200 px-6 py-2 sticky top-0 z-10 flex items-center gap-2 text-[11px] text-slate-500">
          <Link to="/app" className="hover:text-indigo-600">NeuGAIN</Link>
          <span>/</span>
          <Link to={nocPath("")} className="text-slate-700 font-medium hover:text-indigo-600">
            Agentic SRE NOC
          </Link>
          {active && (
            <>
              <span>/</span>
              <span className="text-indigo-600 font-semibold truncate">{active.title}</span>
            </>
          )}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
