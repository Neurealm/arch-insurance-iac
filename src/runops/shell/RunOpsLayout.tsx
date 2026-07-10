import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutGrid, Boxes, BookOpen, Workflow, AlertOctagon, Bot,
  Target, Library, BarChart3, ShieldCheck, Plug, Server, ChevronLeft,
  ChevronRight, RefreshCw, Play, type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoAiProvider, DemoOperationsProvider, useOperations } from "@/runops/state/RunOpsProviders";

interface NavItem { to: string; label: string; icon: LucideIcon; }

const nav: NavItem[] = [
  { to: "/runops",                  label: "Command",         icon: LayoutGrid },
  { to: "/runops/services",         label: "Services",        icon: Boxes },
  { to: "/runops/runbooks",         label: "Runbooks",        icon: BookOpen },
  { to: "/runops/operations",       label: "Operations",      icon: Workflow },
  { to: "/runops/incidents",        label: "Incidents",       icon: AlertOctagon },
  { to: "/runops/digital-workers",  label: "Digital Workers", icon: Bot },
  { to: "/runops/reliability",      label: "Reliability",     icon: Target },
  { to: "/runops/knowledge",        label: "Knowledge",       icon: Library },
  { to: "/runops/analytics",        label: "Analytics",       icon: BarChart3 },
  { to: "/runops/governance",       label: "Governance",      icon: ShieldCheck },
  { to: "/runops/integrations",     label: "Integrations",    icon: Plug },
  { to: "/runops/platform",         label: "Platform",        icon: Server },
];

function healthTone(h: string): string {
  switch (h) {
    case "Healthy":            return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "At Risk":            return "bg-amber-100 text-amber-800 border-amber-200";
    case "Degraded":           return "bg-orange-100 text-orange-800 border-orange-200";
    case "Severely Degraded":  return "bg-red-100 text-red-800 border-red-200";
    case "Unavailable":        return "bg-red-200 text-red-900 border-red-300";
    case "Recovering":         return "bg-sky-100 text-sky-800 border-sky-200";
    default:                   return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function TopContextBar() {
  const { tenant, services, incident, stageIndex, stages, mode, advanceStage, resetScenario } = useOperations();
  const svc = services[0];
  const stage = stages[stageIndex];
  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/95 px-5 py-2.5 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Tenant</span>
        <span className="text-[13px] font-semibold text-slate-900">{tenant.name}</span>
      </div>
      <span className="h-4 w-px bg-slate-200" />
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Service</span>
        <span className="text-[13px] font-semibold text-slate-900">{svc.name}</span>
        <Badge variant="outline" className="text-[10px]">{svc.tier}</Badge>
        <Badge variant="outline" className="text-[10px]">{svc.environment}</Badge>
        <Badge variant="outline" className="text-[10px]">{svc.region}</Badge>
      </div>
      <span className="h-4 w-px bg-slate-200" />
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Health</span>
        <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", healthTone(svc.health))}>
          {svc.health}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Incident</span>
        <span className="text-[12px] font-semibold text-red-700">{incident.id}</span>
        <Badge className="bg-red-600 text-white text-[10px] hover:bg-red-600">{incident.severity}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Error Budget</span>
        <span className="text-[12px] font-semibold text-amber-700">{svc.errorBudgetRemaining}%</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Stage</span>
          <span className="text-[11.5px] font-semibold tabular-nums text-slate-800">
            {stageIndex} / {stages.length - 1}
          </span>
          <span className="text-[11.5px] text-slate-600">· {stage.label}</span>
        </div>
        <Badge variant="outline" className={cn("text-[10px]", mode === "demo" ? "border-sky-300 text-sky-700 bg-sky-50" : "border-emerald-300 text-emerald-700 bg-emerald-50")}>
          {mode === "demo" ? "Demo Mode" : "Connected"}
        </Badge>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={resetScenario}>
          <RefreshCw className="mr-1 h-3 w-3" /> Reset
        </Button>
        <Button size="sm" className="h-7 text-[11px]" onClick={advanceStage}>
          <Play className="mr-1 h-3 w-3" /> Advance
        </Button>
      </div>
    </div>
  );
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { pathname } = useLocation();
  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen flex-col border-r border-slate-200 bg-white transition-all",
        collapsed ? "w-14" : "w-60",
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-slate-900 text-white text-[11px] font-bold">
          RO
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold leading-tight text-slate-900">RunOps</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Runbooks</div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {nav.map((item) => {
          const active =
            item.to === "/runops"
              ? pathname === "/runops"
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/runops"}
              className={cn(
                "mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-500")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
        {!collapsed ? "v0.1 · Demo Mode" : "·"}
      </div>
    </aside>
  );
}

function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="flex-1 min-w-0 flex flex-col">
        <TopContextBar />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function RunOpsLayout() {
  return (
    <DemoOperationsProvider>
      <DemoAiProvider>
        <Shell />
      </DemoAiProvider>
    </DemoOperationsProvider>
  );
}
