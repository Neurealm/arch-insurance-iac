import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Brain, Home, ChevronsLeft, ChevronsRight, ChevronDown, ChevronRight, Circle, RefreshCw } from "lucide-react";
import { ecfPages, ecfGroups } from "./pages";
import { cn } from "@/lib/utils";

const SCROLL_KEY = "ecf.sidebarScroll";
let cachedScroll = 0;

// Sub-pages nested under a parent page. The parent page itself is NOT repeated
// here — the parent nav link is the entry point for it.
const subNavBySlug: Record<string, { to: string; label: string }[]> = {
  "enterprise-source-discovery": [
    { to: "/enterprise-cognitive-fabric/discovery/configuration", label: "Discovery Configuration" },
    { to: "/enterprise-cognitive-fabric/discovery/pipelines", label: "Discovery Pipelines" },
    { to: "/enterprise-cognitive-fabric/discovery/source-registry", label: "Source Registry" },
    { to: "/enterprise-cognitive-fabric/discovery/connector-health", label: "Connector Health" },
  ],
  "team-persona-construction": [
    { to: "/enterprise-cognitive-fabric/persona-studio/team-persona-library", label: "Team Persona Library" },
    { to: "/enterprise-cognitive-fabric/persona-studio/persona-validation", label: "Persona Validation" },
    { to: "/enterprise-cognitive-fabric/persona-studio/persona-version-history", label: "Persona Version History" },
  ],
};

// Path prefixes that keep a parent's sub-nav expanded.
const subNavPrefixBySlug: Record<string, string[]> = {
  "enterprise-source-discovery": [
    "/enterprise-cognitive-fabric/enterprise-source-discovery",
    "/enterprise-cognitive-fabric/discovery",
  ],
  "team-persona-construction": [
    "/enterprise-cognitive-fabric/team-persona-construction",
    "/enterprise-cognitive-fabric/persona-studio",
  ],
  "enterprise-cognitive-memory": [
    "/enterprise-cognitive-fabric/enterprise-cognitive-memory",
    "/enterprise-cognitive-fabric/cognitive-memory",
  ],
};


export default function EcfLayout() {
  const location = useLocation();
  const activeIdx = ecfPages.findIndex((p) => location.pathname.endsWith(p.slug));
  const active = activeIdx >= 0 ? ecfPages[activeIdx] : undefined;

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ecf.collapsed") === "1";
  });
  useEffect(() => {
    window.localStorage.setItem("ecf.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({});

  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

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
      <aside
        className={cn(
          "sticky top-0 z-30 h-screen shrink-0 flex flex-col border-r border-slate-200 bg-white transition-[width] duration-150",
          collapsed ? "w-14" : "w-64",
        )}
        aria-label="Enterprise Cognitive Fabric navigation"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-900 text-white">
            <Brain className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Module</div>
              <div className="text-[12.5px] font-semibold leading-tight text-slate-900">Enterprise Cognitive Fabric</div>
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
          <NavLink
            to="/enterprise-cognitive-fabric"
            end
            title={collapsed ? "Module Home" : undefined}
            className={({ isActive }) =>
              cn(
                "mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px]",
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
              )
            }
          >
            <Brain className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">Module Home</span>}
          </NavLink>
          <div className="mx-2 my-1 h-px bg-slate-200" aria-hidden />

          {ecfGroups.map((group) => {
            const items = ecfPages.filter((p) => p.group === group);
            if (!items.length) return null;
            return (
              <div key={group} className="mb-2">
                {!collapsed && (
                  <div className="px-4 pb-1 pt-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {group}
                  </div>
                )}
                {items.map((p) => {
                  const subNav = subNavBySlug[p.slug];
                  const routeExpanded =
                    !!subNav &&
                    (subNavPrefixBySlug[p.slug] ?? []).some(
                      (prefix) => location.pathname === prefix || location.pathname.startsWith(prefix + "/"),
                    );
                  const override = manualExpanded[p.slug];
                  const expanded = !!subNav && (override ?? routeExpanded);
                  return (
                  <div key={p.slug}>
                    <NavLink
                      to={`/enterprise-cognitive-fabric/${p.slug}`}
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
                          <Circle className={cn("h-1.5 w-1.5 shrink-0 fill-current", isActive ? "text-white" : "text-slate-400")} />
                          {!collapsed && <span className="truncate">{p.title}</span>}
                          {!collapsed && subNav && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setManualExpanded((m) => ({ ...m, [p.slug]: !expanded }));
                              }}
                              aria-expanded={expanded}
                              aria-label={`${expanded ? "Collapse" : "Expand"} ${p.title} nested pages`}
                              className={cn(
                                "ml-auto grid h-5 w-5 shrink-0 place-items-center rounded",
                                isActive ? "text-white hover:bg-white/20" : "text-slate-400 hover:bg-slate-200 hover:text-slate-700",
                              )}
                            >
                              {expanded ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </NavLink>

                    {!collapsed && subNav && expanded && (
                      <ul className="ml-6 border-l border-slate-200 pl-2">
                        {subNav.map((s) => (
                          <li key={s.to}>
                            <NavLink
                              to={s.to}
                              className={({ isActive }) =>
                                cn(
                                  "my-0.5 block rounded-md px-2 py-1.5 text-[11.5px] transition-colors",
                                  isActive ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                )
                              }
                            >
                              {s.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  );
                })}

              </div>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-3 py-2">
          {!collapsed ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                System Status: Operational
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">All Systems Operational</div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>Last Updated: {lastUpdated}</span>
                <button
                  type="button"
                  onClick={() => setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))}
                  aria-label="Refresh system status"
                  className="grid h-5 w-5 place-items-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid place-items-center" title="All systems operational">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="All systems operational" />
            </div>
          )}
        </div>

      </aside>

      <main className="flex-1 min-w-0">
        <div className="bg-white border-b border-slate-200 px-6 py-2 sticky top-0 z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 min-w-0">
            <Link to="/app" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <Link to="/enterprise-cognitive-fabric" className="text-slate-700 font-medium hover:text-indigo-600">
              Enterprise Cognitive Fabric
            </Link>
            {active && (
              <>
                <span>/</span>
                <span className="text-indigo-600 font-semibold truncate">{active.title}</span>
              </>
            )}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
