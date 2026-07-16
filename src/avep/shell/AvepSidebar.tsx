import { NavLink, useLocation } from "react-router-dom";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { AVEP_NAV, AVEP_NAV_GROUPS } from "./navigation";
import { useAvepShell } from "./ShellState";

export function AvepSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAvepShell();
  const { pathname } = useLocation();
  const width = sidebarCollapsed ? "w-14" : "w-64";

  return (
    <aside
      className={`${width} shrink-0 h-full border-r flex flex-col transition-[width] duration-200`}
      style={{
        borderColor: "hsl(var(--avep-border))",
        background: "hsl(var(--avep-surface))",
      }}
      aria-label="AVEP primary navigation"
    >
      <div
        className="h-14 flex items-center gap-2 px-3 border-b"
        style={{ borderColor: "hsl(var(--avep-border))" }}
      >
        <div
          className="h-8 w-8 rounded-md flex items-center justify-center font-semibold"
          style={{
            background: "hsl(var(--avep-primary))",
            color: "hsl(var(--avep-primary-foreground))",
            fontSize: "var(--avep-text-sm)",
          }}
        >
          A
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-semibold" style={{ fontSize: "var(--avep-text-md)" }}>AVEP</span>
            <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
              AI VLSI Engineering
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2" role="navigation">
        {AVEP_NAV_GROUPS.map((group) => {
          const items = AVEP_NAV.filter((n) => n.group === group);
          return (
            <div key={group} className="mb-3">
              {!sidebarCollapsed && (
                <div
                  className="px-3 pb-1 uppercase"
                  style={{
                    fontSize: "var(--avep-text-2xs)",
                    letterSpacing: "var(--avep-tracking-wide)",
                    color: "hsl(var(--avep-foreground-subtle))",
                  }}
                >
                  {group}
                </div>
              )}
              <ul>
                {items.map((item) => {
                  const active = pathname === item.path || (item.path !== "/avep" && pathname.startsWith(item.path));
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <NavLink
                        to={item.path}
                        end={item.path === "/avep"}
                        title={sidebarCollapsed ? item.label : undefined}
                        className="mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors"
                        style={{
                          fontSize: "var(--avep-text-sm)",
                          background: active ? "hsl(var(--avep-primary-soft))" : "transparent",
                          color: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={toggleSidebar}
        className="h-10 border-t flex items-center justify-center gap-2 hover:bg-black/[0.03] transition-colors"
        style={{
          borderColor: "hsl(var(--avep-border))",
          color: "hsl(var(--avep-foreground-muted))",
          fontSize: "var(--avep-text-xs)",
        }}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : (
          <>
            <ChevronsLeft className="h-4 w-4" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
