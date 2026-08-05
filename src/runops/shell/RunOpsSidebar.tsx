import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid, Boxes, BookOpen, Workflow, AlertOctagon, Bot,
  Target, Library, BarChart3, ShieldCheck, Plug, Server, Home,
  ChevronLeft, ChevronRight, Cloud, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections, sectionLanding, type NavSection } from "@/runops/shell/routes";

const iconFor: Record<NavSection, LucideIcon> = {
  "Command": LayoutGrid,
  "Services": Boxes,
  "Runbooks": BookOpen,
  "Operations": Workflow,
  "Incidents": AlertOctagon,
  "Digital Workers": Bot,
  "Reliability": Target,
  "Knowledge": Library,
  "Analytics": BarChart3,
  "Governance": ShieldCheck,
  "Integrations": Plug,
  "Platform": Server,
};

/** Group labels mirroring the Site Resilience Engineering module shell. */
const groupFor: Record<NavSection, string> = {
  "Command": "Command",
  "Services": "Service Operations",
  "Runbooks": "Service Operations",
  "Operations": "Service Operations",
  "Incidents": "Service Operations",
  "Digital Workers": "Automation & Intelligence",
  "Reliability": "Automation & Intelligence",
  "Knowledge": "Automation & Intelligence",
  "Analytics": "Automation & Intelligence",
  "Governance": "Governance & Platform",
  "Integrations": "Governance & Platform",
  "Platform": "Governance & Platform",
};

const NAV_GROUPS = [
  "Command",
  "Service Operations",
  "Automation & Intelligence",
  "Governance & Platform",
];


/** Determine which nav section is currently active from the pathname. */
export function activeSectionForPath(pathname: string): NavSection | null {
  if (pathname === "/runops" || pathname === "/runops/" || pathname === "/runops/command") return "Command";
  const rest = pathname.replace(/^\/runops\/?/, "").split("/")[0] ?? "";
  const map: Record<string, NavSection> = {
    "services": "Services",
    "runbooks": "Runbooks",
    "operations": "Operations",
    "approvals": "Operations",
    "executions": "Operations",
    "incidents": "Incidents",
    "problems": "Incidents",
    "workers": "Digital Workers",
    "automation": "Digital Workers",
    "reliability": "Reliability",
    "knowledge": "Knowledge",
    "analytics": "Analytics",
    "governance": "Governance",
    "security": "Governance",
    "ai-governance": "Governance",
    "integrations": "Integrations",
    "developer": "Integrations",
    "supply-chain": "Integrations",
    "platform": "Platform",
  };
  return map[rest] ?? null;
}

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export function RunOpsSidebar({ collapsed, onToggle, onNavigate }: Props) {
  const { pathname } = useLocation();
  const active = activeSectionForPath(pathname);

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen flex-col border-r border-slate-200 bg-white transition-[width] duration-150",
        collapsed ? "w-14" : "w-64",
      )}
      aria-label="Runbook Engineering navigation"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-900 text-white">
          <BookOpen className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Module</div>
            <div className="text-[12.5px] font-semibold leading-tight text-slate-900">Runbook Engineering</div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <NavLink
          to="/app"
          onClick={onNavigate}
          className="mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          title={collapsed ? "NeuGAIN Command Center" : undefined}
        >
          <Home className="h-4 w-4 shrink-0 text-slate-500" />
          {!collapsed && <span className="truncate">NeuGAIN Command Center</span>}
        </NavLink>
        <div className="mx-2 my-1 h-px bg-slate-200" aria-hidden />

        {NAV_GROUPS.map((group) => {
          const items = navSections.filter((s) => groupFor[s] === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-2">
              {!collapsed && (
                <div className="px-4 pb-1 pt-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {group}
                </div>
              )}
              {items.map((section) => {
                const landing = sectionLanding(section);
                const Icon = iconFor[section];
                const isActive = active === section;
                return (
                  <NavLink
                    key={section}
                    to={landing.absolutePath}
                    end={section === "Command"}
                    onClick={onNavigate}
                    className={cn(
                      "mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    )}
                    title={collapsed ? section : undefined}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                    {!collapsed && <span className="truncate">{section}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}

        <div className="mb-2">
          {!collapsed && (
            <div className="px-4 pb-1 pt-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Digital Twins
            </div>
          )}
          <NavLink
            to="/runops/aws-cots-digital-twin"
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
              isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
            )}
            title={collapsed ? "AWS COTS Digital Twin" : undefined}
          >
            {({ isActive }) => (
              <>
                <Cloud className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                {!collapsed && <span className="truncate">AWS COTS Digital Twin</span>}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
        {!collapsed ? "Runbook Engineering" : "·"}
      </div>

    </aside>
  );
}
