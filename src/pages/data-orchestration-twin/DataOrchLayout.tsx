import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Database, Home, ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight, Circle } from "lucide-react";
import { doPages, doGroups } from "./pages";
import { cn } from "@/lib/utils";

const SCROLL_KEY = "dataOrch.sidebarScroll";
let cachedScroll = 0;

export default function DataOrchLayout() {
  const location = useLocation();
  const activeIdx = doPages.findIndex((p) => location.pathname.endsWith(p.slug));
  const active = activeIdx >= 0 ? doPages[activeIdx] : undefined;
  const prev = activeIdx > 0 ? doPages[activeIdx - 1] : null;
  const next = activeIdx >= 0 && activeIdx < doPages.length - 1 ? doPages[activeIdx + 1] : null;
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("dataOrch.collapsed") === "1";
  });
  useEffect(() => {
    window.localStorage.setItem("dataOrch.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const navRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const saved = cachedScroll || parseInt(sessionStorage.getItem(SCROLL_KEY) || "0", 10);
    if (saved > 0) el.scrollTop = saved;
    const onScroll = () => {
      cachedScroll = el.scrollTop;
      sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Module Nav — white shell, matches Site Resilience Engineering module */}
      <aside
        className={cn(
          "sticky top-0 z-30 h-screen shrink-0 flex flex-col border-r border-slate-200 bg-white transition-[width] duration-150",
          collapsed ? "w-14" : "w-64",
        )}
        aria-label="SRE Data Orchestration navigation"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-900 text-white">
            <Database className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Module</div>
              <div className="text-[12.5px] font-semibold leading-tight text-slate-900">SRE Data Orchestration</div>
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

        <nav ref={navRef} className="flex-1 overflow-y-auto py-2">
          <Link
            to="/app"
            title={collapsed ? "NeuGAIN Command Center" : undefined}
            className="mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <Home className="h-4 w-4 shrink-0 text-slate-500" />
            {!collapsed && <span className="truncate">NeuGAIN Command Center</span>}
          </Link>
          <div className="mx-2 my-1 h-px bg-slate-200" aria-hidden />

          {doGroups.map((group) => {
            const items = doPages.filter((p) => p.group === group);
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
                    key={p.slug}
                    to={`/data-orchestration-twin/${p.slug}`}
                    title={collapsed ? p.title : undefined}
                    className={({ isActive }) =>
                      cn(
                        "mx-2 my-0.5 flex items-center gap-2.5 rounded-md py-2 text-[12.5px] transition-colors",
                        collapsed ? "justify-center px-0" : p.nested ? "pl-6 pr-2.5" : "px-2.5",
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Circle className={cn("h-1.5 w-1.5 shrink-0 fill-current", isActive ? "text-white" : "text-slate-400")} />
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
          {!collapsed ? "SRE Data Orchestration" : "·"}
        </div>
      </aside>


      {/* Content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 sticky top-0 z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 min-w-0">
            <Link to="/prod-resilience-twin" className="hover:text-indigo-600">Resilience Twin</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Data Orchestration Twin</span>
            {active && (
              <>
                <span>/</span>
                <span className="text-indigo-600 font-semibold truncate">{active.title}</span>
              </>
            )}
          </div>
          {active && (prev || next) && (
            <div className="flex items-center gap-1.5 shrink-0">
              {prev ? (
                <Link
                  to={`/data-orchestration-twin/${prev.slug}`}
                  title={`Previous: ${prev.title}`}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 px-2 py-1 text-[11px] text-slate-700 hover:text-indigo-700 transition max-w-[220px]"
                >
                  <ArrowLeft className="h-3 w-3 shrink-0" />
                  <span className="truncate">{prev.title}</span>
                </Link>
              ) : null}
              {next ? (
                <Link
                  to={`/data-orchestration-twin/${next.slug}`}
                  title={`Next: ${next.title}`}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 px-2 py-1 text-[11px] text-slate-700 hover:text-indigo-700 transition max-w-[220px]"
                >
                  <span className="truncate">{next.title}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                </Link>
              ) : null}
            </div>
          )}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
