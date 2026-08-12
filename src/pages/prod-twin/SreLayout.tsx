import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity, ArrowRightLeft, Boxes, ChevronLeft, ChevronRight, Cloud, FileBarChart2,
  Home, Network, Package, Rocket, ShieldCheck, Sparkles, TrendingUp, Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModuleShellProvider } from "@/components/eoc/ModuleShellContext";
import { PersonaProvider } from "@/context/PersonaContext";

interface SreNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  group: string;
}

export const SRE_MODULE_NAV: SreNavItem[] = [
  { group: "Command", label: "PROD Resilience Command Center", to: "/prod-resilience-twin", icon: Activity },
  { group: "Client Twins", label: "Client Product Line Map", to: "/product-line-map", icon: Package },
  { group: "Client Twins", label: "Client Golden Workflow Map", to: "/golden-workflow-map", icon: Workflow },
  { group: "Client Twins", label: "Client Production Topology Digital Twin", to: "/production-topology", icon: Network },
  { group: "Client Twins", label: "Client SRE Operating Model Cockpit", to: "/sre-operating-model", icon: Activity },
  { group: "Client Twins", label: "Signal Intelligence", to: "/signal-intelligence", icon: Activity },
  { group: "Cloud & Platform", label: "Enterprise Cloud Application Digital Twin", to: "/enterprise-cloud-twin", icon: Cloud },
  { group: "Cloud & Platform", label: "AWS Resilience Architecture Twin", to: "/aws-resilience-architecture-twin", icon: Cloud },
  { group: "Cloud & Platform", label: "Platform Engineering & Golden Environment Factory", to: "/platform-engineering-factory", icon: Package },
  { group: "Cloud & Platform", label: "Hybrid Cloud, Data & Modernization Workbench", to: "/hybrid-cloud-workbench", icon: Cloud },
  { group: "Automation", label: "Product Reliability Automation Marketplace", to: "/automation-marketplace", icon: Boxes },
  { group: "Automation", label: "Application & Data Modernization Factory", to: "/modernization-factory", icon: Cloud },
  { group: "Automation", label: "Cyber Resilience Overlay", to: "/cyber-resilience-overlay", icon: ShieldCheck },
  { group: "Automation", label: "Automation & AI Digital Coworker Control Room", to: "/ai-coworker-control-room", icon: Sparkles },
  { group: "Transition & Value", label: "Transition & Dual-Run Command Center", to: "/transition-dual-run", icon: ArrowRightLeft },
  { group: "Transition & Value", label: "Acquisition-to-SRE Onboarding Factory", to: "/acquisition-onboarding-factory", icon: Rocket },
  { group: "Transition & Value", label: "Value Creation & PE / Board Dashboard", to: "/value-creation-board", icon: TrendingUp },
  { group: "Transition & Value", label: "Modernization Roadmap", to: "/modernization-roadmap", icon: FileBarChart2 },
  { group: "Transition & Value", label: "Interactive Demo Experience Center", to: "/interactive-demo-center", icon: Sparkles },
  { group: "Transition & Value", label: "Modernization Roadmap v2", to: "/modernization-roadmap-v2", icon: FileBarChart2 },
];

const SRE_GROUPS = ["Command", "Client Twins", "Cloud & Platform", "Automation", "Transition & Value"];

const COLLAPSE_KEY = "sre.moduleNav.collapsed";

function SreModuleSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-150 md:flex",
        collapsed ? "w-14" : "w-64",
      )}
      aria-label="Site Resilience Engineering navigation"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-900 text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Module</div>
            <div className="text-[12.5px] font-semibold leading-tight text-slate-900">Site Resilience Engineering</div>
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
          title={collapsed ? "NeuGAIN Command Center" : undefined}
          className="mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        >
          <Home className="h-4 w-4 shrink-0 text-slate-500" />
          {!collapsed && <span className="truncate">NeuGAIN Command Center</span>}
        </NavLink>
        <div className="mx-2 my-1 h-px bg-slate-200" aria-hidden />

        {SRE_GROUPS.map((group) => {
          const items = SRE_MODULE_NAV.filter((i) => i.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-2">
              {!collapsed && (
                <div className="px-4 pb-1 pt-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {group}
                </div>
              )}
              {items.map((item) => {
                const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
        {!collapsed ? "Site Resilience Engineering" : "·"}
      </div>
    </aside>
  );
}

/** Module shell for the Site Resilience Engineering pages. */
export default function SreLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  });
  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <PersonaProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground overflow-x-clip">
        <SreModuleSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <main className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-clip">
          <ModuleShellProvider>
            <Outlet />
          </ModuleShellProvider>
        </main>
      </div>
    </PersonaProvider>
  );
}
