// SRE Based Agentic NOC — module shell with persistent left navigation.

import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_STATUS } from "@/data/agenticOpticalNetworkData";

const BASE = "/operations/sre-agentic-noc";

export const sreNocNav: { label: string; to: string }[] = [
  { label: "Overview", to: `${BASE}/global-optical-operations` },
  { label: "Service Reliability", to: `${BASE}/service-reliability` },
  { label: "Global Digital Twin", to: `${BASE}/global-digital-twin` },
  { label: "Active Situations", to: `${BASE}/active-situations` },
  { label: "Agentic Investigations", to: `${BASE}/agentic-investigations` },
  { label: "Actions and Approvals", to: `${BASE}/actions-and-approvals` },
  { label: "Predictive Link Risk", to: `${BASE}/predictive-link-risk` },
  { label: "Network Health", to: `${BASE}/network-health` },
  { label: "Capacity and Performance", to: `${BASE}/capacity-and-performance` },
  { label: "Customers and Services", to: `${BASE}/customers-and-services` },
  { label: "SLOs and Error Budgets", to: `${BASE}/slos-and-error-budgets` },
  { label: "Change Intelligence", to: `${BASE}/change-intelligence` },
  { label: "Knowledge and Runbooks", to: `${BASE}/knowledge-and-runbooks` },
  { label: "Agent Performance", to: `${BASE}/agent-performance` },
  { label: "Reports and Analytics", to: `${BASE}/reports-and-analytics` },
  { label: "Settings", to: `${BASE}/settings` },
];

export default function SreAgenticNocLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="fixed left-3 top-3 z-40 rounded-md border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
      >
        {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
      </button>

      <nav
        aria-label="SRE Based Agentic NOC"
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-slate-200 px-4 py-4">
          <p className="text-[13px] font-semibold text-slate-900">Terra Communications</p>
          <p className="text-[11px] text-slate-500">SRE Based Agentic NOC</p>
        </div>

        <ul className="flex-1 overflow-y-auto p-2">
          {sreNocNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn(
                  "block rounded-md px-3 py-1.5 text-[12.5px] transition",
                  isActive || location.pathname === item.to
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="space-y-3 border-t border-slate-200 px-4 py-3 text-[11px]">
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-500">Platform Status</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              {PLATFORM_STATUS.label}
            </p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-slate-500">AI Agents</p>
            <p className="mt-1 text-slate-700">{PLATFORM_STATUS.agentsActive} Active</p>
            <p className="text-slate-700">{PLATFORM_STATUS.awaitingApproval} Awaiting Approval</p>
            <p className="text-slate-700">{PLATFORM_STATUS.investigatingCritical} Investigating Critical Situation</p>
          </div>
        </div>
      </nav>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
