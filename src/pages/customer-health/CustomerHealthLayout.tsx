// Shell for the Customer Health Dashboard: left navigation rail, compact top
// header, and the universal CustomerImpactDrawer mounted once for all pages.

import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity, ArrowLeft, Bell, Cloud, FileBarChart2, Gauge, Globe, LayoutGrid,
  Network, RefreshCw, Settings, Sliders, Boxes, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tenant } from "./data";
import { ImpactDrawerProvider } from "./primitives";
import { CustomerImpactDrawer } from "./CustomerImpactDrawer";

interface NavItem { label: string; to: string; icon: LucideIcon }

const NAV: NavItem[] = [
  { label: "Overview", to: "/customer-health", icon: LayoutGrid },
  { label: "Deployments", to: "/customer-health/deployments", icon: Boxes },
  { label: "Events", to: "/customer-health/events", icon: Activity },
  { label: "Regions", to: "/customer-health/regions", icon: Globe },
  { label: "Dependencies", to: "/customer-health/dependencies", icon: Network },
  { label: "SLOs", to: "/customer-health/slos", icon: Gauge },
  { label: "Reports", to: "/customer-health/reports", icon: FileBarChart2 },
  { label: "Alerts", to: "/customer-health/alerts", icon: Bell },
  { label: "Settings", to: "/customer-health/settings", icon: Settings },
];

export default function CustomerHealthLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-700">
      <aside
        aria-label="Service health navigation"
        className="sticky top-0 hidden h-screen w-[92px] shrink-0 flex-col items-center border-r border-slate-200 bg-white py-3 md:flex"
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-500/15 text-sky-600">
          <Cloud className="h-5 w-5" />
        </div>
        <nav className="mt-4 flex w-full flex-1 flex-col items-center gap-1">
          {NAV.map((item) => {
            const active = item.to === "/customer-health"
              ? pathname === "/customer-health" || pathname === "/customer-health/"
              : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/customer-health"}
                className={cn(
                  "flex w-[76px] flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-[10.5px] transition-all duration-200",
                  active
                    ? "bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/30"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <NavLink
          to="/prod-resilience-twin"
          className="mt-2 flex w-[76px] flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10.5px] text-slate-500 transition-colors duration-200 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit</span>
        </NavLink>
      </aside>

      <ImpactDrawerProvider>
        {(api) => (
          <main className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  {tenant.name} · {tenant.service}
                </div>
                <div className="text-[15px] font-semibold text-slate-900">Customer Health Dashboard</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-slate-500">Last updated: {tenant.lastUpdated}</span>
                <button
                  type="button" aria-label="Refresh"
                  className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-[12px] text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
                >
                  <Activity className="h-3.5 w-3.5" /> {tenant.window}
                </button>
                <button
                  type="button"
                  className="flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-[12px] text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
                >
                  <Sliders className="h-3.5 w-3.5" /> Customize
                </button>
              </div>
            </header>

            <div className="flex-1 px-5 py-4">
              <Outlet />
            </div>

            <CustomerImpactDrawer context={api.context} onClose={api.close} />
          </main>
        )}
      </ImpactDrawerProvider>
    </div>
  );
}
