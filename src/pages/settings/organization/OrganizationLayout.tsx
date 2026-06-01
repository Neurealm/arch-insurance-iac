import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { ORG_LEVELS, ORG_LEVEL_ORDER, HIERARCHY_ICON } from "@/config/orgLevels";
import { Network as NetworkIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrganizationLayout() {
  const { pathname } = useLocation();
  return (
    <AppShell>
      <main className="flex-1 flex min-h-0 animate-fade-in">
        <aside className="w-64 shrink-0 border-r bg-card/50 p-4 hidden md:flex flex-col gap-1">
          <NavLink
            to="/settings"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
          </NavLink>
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="h-8 w-8 rounded-md bg-navy text-white grid place-items-center">
              <NetworkIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Organization Model</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Operating hierarchy
              </div>
            </div>
          </div>
          {ORG_LEVEL_ORDER.map((k) => {
            const lvl = ORG_LEVELS[k];
            const Icon = lvl.icon;
            const to = `/settings/organization/${lvl.slug}`;
            const active = pathname.startsWith(to);
            return (
              <NavLink
                key={k}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                <Icon className="h-4 w-4" />
                {lvl.label}
              </NavLink>
            );
          })}
          <div className="my-2 border-t" />
          <NavLink
            to="/settings/organization/hierarchy"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:bg-muted/60",
              )
            }
          >
            <HIERARCHY_ICON className="h-4 w-4" />
            Hierarchy View
          </NavLink>
        </aside>
        <div className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </div>
      </main>
    </AppShell>
  );
}