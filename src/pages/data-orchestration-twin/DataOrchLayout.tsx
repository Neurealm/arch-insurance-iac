import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Database, ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight, Circle } from "lucide-react";
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
      {/* Module Nav — dark navy, matches root sidebar language */}
      <aside
        className={cn(
          "transition-[width] duration-300 shrink-0 sticky top-0 h-screen overflow-hidden flex flex-col",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          collapsed ? "w-14" : "w-72",
        )}
      >
        {/* Brand header */}
        <div className={cn("shrink-0 border-b border-sidebar-border/60", collapsed ? "px-2 py-3" : "px-3 py-3")}>
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center shrink-0 shadow-lg shadow-indigo-500/20">
                <Database className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9.5px] font-semibold tracking-[0.16em] text-sidebar-foreground/50">MODULE</div>
                <div className="text-[13px] font-bold leading-tight truncate text-white">Data Orchestration Twin</div>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse navigation"
                title="Collapse"
                className="h-7 w-7 grid place-items-center rounded-md text-sidebar-foreground/60 hover:bg-white/[0.06] hover:text-white transition"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center">
                <Database className="h-4 w-4 text-white" />
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                aria-label="Expand navigation"
                title="Expand"
                className="h-6 w-6 grid place-items-center rounded text-sidebar-foreground/60 hover:bg-white/[0.06] hover:text-white transition"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Back link */}
        {!collapsed && (
          <Link
            to="/prod-resilience-twin"
            className="mx-3 mt-2 mb-1 inline-flex items-center gap-1.5 text-[11px] text-sidebar-foreground/55 hover:text-white transition"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Resilience Twin
          </Link>
        )}

        {/* Sections */}
        <nav ref={navRef} className={cn("flex-1 overflow-y-auto", collapsed ? "px-1 py-2" : "px-2 py-2 space-y-3")}>
          {doGroups.map((group) => {
            const items = doPages.filter((p) => p.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                {!collapsed && (
                  <div className="px-3 pt-2 pb-1.5 text-[9.5px] font-semibold tracking-[0.16em] text-sidebar-foreground/45">
                    {group.toUpperCase()}
                  </div>
                )}
                <div className={collapsed ? "space-y-1" : "space-y-0.5"}>
                  {items.map((p) => (
                    <NavLink
                      key={p.slug}
                      to={`/data-orchestration-twin/${p.slug}`}
                      title={p.title}
                      className={({ isActive }) =>
                        cn(
                          "group w-full flex items-center gap-2 rounded-lg transition-colors",
                          collapsed ? "h-9 justify-center" : "px-3 py-1.5 text-[12.5px]",
                          isActive
                            ? "bg-sidebar-primary/15 text-sidebar-primary font-semibold ring-1 ring-sidebar-primary/25"
                            : "text-sidebar-foreground/80 hover:bg-white/[0.05] hover:text-white",
                        )
                      }
                    >
                      <Circle className="h-1.5 w-1.5 fill-current shrink-0 opacity-60" />
                      {!collapsed && <span className="flex-1 truncate leading-snug">{p.title}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
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
