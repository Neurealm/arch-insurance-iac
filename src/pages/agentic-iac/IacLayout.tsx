import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Boxes, GitPullRequest, PlayCircle, ClipboardCheck,
  Settings, Search, Bell, HelpCircle, ChevronDown, Home, Cloud, CircleDot, Activity,
  Network, Plug, KeyRound, Scale, SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Asset Digital Twin", to: "/agentic-iac-engineering", icon: Boxes, enabled: true },
  { label: "Remediation Intelligence", to: "/agentic-iac-engineering/remediation-intelligence/sql-prod-07", icon: Activity, enabled: true },
  { label: "Change Engineering", to: "/agentic-iac-engineering/change-engineering/sql-prod-07", icon: GitPullRequest, enabled: true },
  { label: "Change Review & Approval", to: "/intelligent-iac/change-review/CP-2026-01842", icon: ClipboardCheck, enabled: true },
  { label: "Execution Center", to: "/intelligent-iac/execution/CP-2026-01842", icon: PlayCircle, enabled: true },
  { label: "Validation & Evidence", to: "/intelligent-iac/validation/CP-2026-01842", icon: ClipboardCheck, enabled: true },
  { label: "Customer-hosted Intelligent IaC", to: "/intelligent-iac/platform/deployment-architecture", icon: Network, enabled: true },
];

const PLATFORM_NAV = [
  { label: "Deployment Architecture", to: "/intelligent-iac/platform/deployment-architecture", icon: Network, enabled: true },
  { label: "Integrations & Connectivity", to: "/intelligent-iac/platform/integrations", icon: Plug, enabled: true },
  { label: "Access & Governance", to: "/intelligent-iac/platform/access-security", icon: KeyRound, enabled: true },
  { label: "Policies & Governance", to: "/intelligent-iac/platform/policies-governance", icon: Scale, enabled: true },
  
  { label: "System Settings", to: "/intelligent-iac/platform/system-settings", icon: SlidersHorizontal, enabled: true },
];


/** Module shell for Intelligent Infrastructure as Code (Agentic IaC Engineering). */
export default function IacLayout() {
  const { pathname } = useLocation();
  const [environment, setEnvironment] = useState("Production");
  const [query, setQuery] = useState("");

  return (
    <div className="flex min-h-screen bg-[#F6F8FA] text-slate-900">
      <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col border-r border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-slate-500">
            Intelligent
          </div>
          <div className="text-[13.5px] font-semibold leading-tight text-slate-900">
            Infrastructure as Code
          </div>
          <div className="mt-1 text-[10.5px] text-slate-500">Agentic IaC Engineering &amp; Execution</div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.enabled && pathname === item.to;
            if (!item.enabled) {
              return (
                <div
                  key={item.label}
                  aria-disabled
                  title="Available in a later release"
                  className="mx-2 my-0.5 flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] text-slate-400"
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-300" />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={cn(
                  "mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
                  active
                    ? "bg-[#EFF4FB] font-medium text-[#1B4F91] ring-1 ring-inset ring-[#CFE0F3]"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#1B4F91]" : "text-slate-500")} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="mt-3 px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Platform Administration
          </div>
          {PLATFORM_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={cn(
                  "mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
                  active
                    ? "bg-[#EFF4FB] font-medium text-[#1B4F91] ring-1 ring-inset ring-[#CFE0F3]"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#1B4F91]" : "text-slate-500")} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>


        <div className="border-t border-[#E2E8F0] py-2">
          <div className="mx-2 my-0.5 flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] text-slate-400">
            <Settings className="h-4 w-4 shrink-0 text-slate-300" />
            <span>Settings</span>
          </div>
          <Link
            to="/app"
            className="mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>NeuGAIN Command Center</span>
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-[#E2E8F0] bg-white px-4">
          <label className="relative flex-1 max-w-[420px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assets, actions, resources..."
              className="h-8 w-full rounded-md border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#1B4F91]/40 focus:bg-white"
            />
          </label>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                aria-label="Environment"
                className="h-8 appearance-none rounded-md border border-[#E2E8F0] bg-white pl-2.5 pr-7 text-[12px] font-medium text-slate-700 outline-none"
              >
                <option>Production</option>
                <option>Pre-Production</option>
                <option>Development</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
              <CircleDot className="h-3.5 w-3.5 text-emerald-600" />
              Connected
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[11.5px] text-slate-700">
              <Cloud className="h-3.5 w-3.5 text-[#1B4F91]" />
              Azure
            </div>

            <button type="button" aria-label="Notifications" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
              <Bell className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Help" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
              <HelpCircle className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Settings" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
              <Settings className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 border-l border-[#E2E8F0] pl-3">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-[#1B4F91] text-[11px] font-semibold text-white">JS</div>
              <div className="leading-tight">
                <div className="text-[12px] font-medium text-slate-800">Jane Smith</div>
                <div className="text-[10.5px] text-slate-500">Infrastructure Engineer</div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
