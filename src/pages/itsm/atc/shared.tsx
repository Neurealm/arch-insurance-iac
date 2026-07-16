import { AppShell } from "@/components/eoc/AppShell";
import { Link } from "react-router-dom";
import { ReactNode, useState } from "react";
import {
  ChevronRight, Bell, HelpCircle, RefreshCw, User,
  LayoutDashboard, AlertOctagon, ListChecks, Users, Gauge, BookOpen, BarChart3,
  Sparkles, CalendarClock, CalendarRange, Boxes, UserPlus, Settings, Plug, ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- Nav ---------------- */
export type NavKey =
  | "manager" | "incident" | "queue" | "team" | "sla" | "kb" | "reports" | "auto"
  | "major" | "esc" | "cal" | "oncall"
  | "biz" | "assign" | "rules" | "integ";

const BASE = "/itsm/auto-ticket-categorization";

export const navSections: {
  heading: string;
  items: { key: NavKey; label: string; icon: any; to: string; badge?: string }[];
}[] = [
  {
    heading: "Service Desk",
    items: [
      { key: "manager", label: "Manager Overview", icon: LayoutDashboard, to: BASE },
      { key: "incident", label: "Incident Console", icon: AlertOctagon, to: `${BASE}/incident-console` },
      { key: "queue", label: "Ticket Queue", icon: ListChecks, to: `${BASE}/ticket-queue` },
      { key: "team", label: "My Team", icon: Users, to: `${BASE}/my-team` },
      { key: "sla", label: "SLAs & KPIs", icon: Gauge, to: `${BASE}/sla-kpis` },
      { key: "kb", label: "Knowledge Base", icon: BookOpen, to: `${BASE}/knowledge-base` },
      { key: "reports", label: "Reports", icon: BarChart3, to: `${BASE}/reports` },
      { key: "auto", label: "Auto Categorization", icon: Sparkles, to: `${BASE}/auto`, badge: "AI" },
    ],
  },
  {
    heading: "Operational Tools",
    items: [
      { key: "major", label: "Major Incidents", icon: AlertOctagon, to: `${BASE}/major-incidents` },
      { key: "esc", label: "Escalations", icon: ArrowUp, to: `${BASE}/escalations` },
      { key: "cal", label: "Change Calendar", icon: CalendarRange, to: `${BASE}/change-calendar` },
      { key: "oncall", label: "On-Call Schedule", icon: CalendarClock, to: `${BASE}/on-call-schedule` },
    ],
  },
  {
    heading: "Configuration",
    items: [
      { key: "biz", label: "Business Services", icon: Boxes, to: `${BASE}/business-services` },
      { key: "assign", label: "Assignments", icon: UserPlus, to: `${BASE}/assignments` },
      { key: "rules", label: "Categorization Rules", icon: Settings, to: `${BASE}/categorization-rules` },
      { key: "integ", label: "Integrations", icon: Plug, to: `${BASE}/integrations` },
    ],
  },
];

/* ---------------- Building blocks ---------------- */
export function PriBadge({ p }: { p: string }) {
  const cls = p === "High" || p === "P1" || p === "Critical"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : p === "Medium" || p === "P2" || p === "Warning"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : p === "P3"
    ? "bg-sky-50 text-sky-700 border-sky-200"
    : "bg-slate-50 text-slate-700 border-slate-200";
  return <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", cls)}>{p}</span>;
}

export function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    "Auto-Categorized": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Manual Review": "border-amber-200 bg-amber-50 text-amber-700",
    "Open": "border-sky-200 bg-sky-50 text-sky-700",
    "In Progress": "border-indigo/30 bg-indigo/5 text-indigo",
    "Resolved": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Closed": "border-slate-200 bg-slate-50 text-slate-600",
    "Escalated": "border-rose-200 bg-rose-50 text-rose-700",
    "Breached": "border-rose-200 bg-rose-50 text-rose-700",
    "At Risk": "border-amber-200 bg-amber-50 text-amber-700",
    "On Track": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Online": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Away": "border-slate-200 bg-slate-50 text-slate-600",
    "Busy": "border-amber-200 bg-amber-50 text-amber-700",
    "Offline": "border-slate-200 bg-slate-50 text-slate-500",
    "Connected": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Degraded": "border-amber-200 bg-amber-50 text-amber-700",
    "Disconnected": "border-rose-200 bg-rose-50 text-rose-700",
    "Active": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Draft": "border-slate-200 bg-slate-50 text-slate-600",
    "Scheduled": "border-indigo/30 bg-indigo/5 text-indigo",
    "Approved": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Pending": "border-amber-200 bg-amber-50 text-amber-700",
  };
  const cls = map[s] ?? "border-slate-200 bg-slate-50 text-slate-700";
  return <span className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap", cls)}>{s}</span>;
}

export function Card({ title, subtitle, action, children, className }: {
  title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white", className)}>
      {(title || action) && (
        <header className="px-4 pt-3 pb-2 flex items-start gap-2 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            {title && <div className="text-[13px] font-semibold text-slate-900">{title}</div>}
            {subtitle && <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>}
          </div>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function PageHeader({
  title, subtitle, actions,
}: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="px-6 pt-5 pb-3 flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 h-7 text-[11px] font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Auto Categorization: ON
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo/20 bg-indigo/5 text-indigo px-3 h-7 text-[11px] font-semibold">
          <Sparkles className="h-3 w-3" /> Categorizer v2.3
        </span>
        {actions}
        <button className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 h-7 text-[11px] font-semibold hover:bg-slate-50">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>
    </div>
  );
}

/* ---------------- Shell ---------------- */
export function AtcShell({
  activeNav, breadcrumb, children,
}: {
  activeNav: NavKey;
  breadcrumb: string;
  children: ReactNode;
}) {
  const [tenant, setTenant] = useState("Meridian University");

  return (
    <AppShell>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-[220px] shrink-0 flex-col bg-white border-r border-slate-200">
          <div className="px-4 py-4 flex items-center gap-2 border-b border-slate-200">
            <div className="h-8 w-8 rounded-lg bg-indigo grid place-items-center text-white text-xs font-bold">N</div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold leading-tight">Neugain.io</div>
              <div className="text-[10px] text-slate-500 leading-tight">RunOps Digital Twin</div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-3">
            {navSections.map((sec) => (
              <div key={sec.heading} className="mb-3">
                <div className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{sec.heading}</div>
                <ul>
                  {sec.items.map((it) => {
                    const Icon = it.icon;
                    const active = activeNav === it.key;
                    return (
                      <li key={it.key}>
                        <Link
                          to={it.to}
                          className={cn(
                            "w-full flex items-center gap-2 px-4 py-1.5 text-[12px] font-medium transition-colors",
                            active
                              ? "bg-indigo/10 text-indigo border-r-2 border-indigo"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="flex-1 text-left truncate">{it.label}</span>
                          {it.badge && (
                            <span className="text-[9px] font-bold text-indigo bg-indigo/10 border border-indigo/20 rounded px-1">{it.badge}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="border-t border-slate-200 p-3 text-[11px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Service Desk Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
              </span>
            </div>
            <div className="text-slate-500">Agents Online <span className="float-right font-mono text-slate-900">23 / 28</span></div>
            <div className="text-slate-500 mt-1">In Queues <span className="float-right font-mono text-slate-900">156</span></div>
            <div className="text-slate-500 mt-1">Longest Wait <span className="float-right font-mono text-rose-600">00:12:47</span></div>
            <Link to={`${BASE}/ticket-queue`} className="mt-3 flex items-center justify-center w-full h-7 rounded border border-slate-200 text-[11px] font-medium hover:bg-slate-50">View All Queues</Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 min-w-0">
              <Link to="/itsm" className="hover:text-indigo">Service Desk Operations</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to={BASE} className="hover:text-indigo">Auto Ticket Categorization</Link>
              {breadcrumb && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-slate-900 font-semibold truncate">{breadcrumb}</span>
                </>
              )}
            </div>
            <div className="ml-auto flex items-center gap-3 text-[12px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Tenant:</span>
                <select
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                  className="h-8 rounded border border-slate-200 bg-white px-2 text-[12px] font-medium"
                >
                  <option>Meridian University</option>
                  <option>Contoso Health</option>
                  <option>Northwind Bank</option>
                </select>
              </div>
              <span className="text-slate-500">June 9, 2026 10:24 AM</span>
              <button aria-label="Notifications" className="relative grid h-8 w-8 place-items-center rounded border border-slate-200 hover:bg-slate-50">
                <Bell className="h-4 w-4 text-slate-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 grid place-items-center rounded-full bg-rose-500 text-white text-[9px] font-bold">3</span>
              </button>
              <button aria-label="Help" className="grid h-8 w-8 place-items-center rounded border border-slate-200 hover:bg-slate-50">
                <HelpCircle className="h-4 w-4 text-slate-600" />
              </button>
              <button aria-label="Profile" className="grid h-8 w-8 place-items-center rounded border border-slate-200 hover:bg-slate-50">
                <User className="h-4 w-4 text-slate-600" />
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="h-8 w-8 rounded-full bg-indigo/10 grid place-items-center text-indigo text-[11px] font-bold">RB</div>
                <div className="leading-tight">
                  <div className="text-[12px] font-semibold">Ryan Blackwell</div>
                  <div className="text-[10px] text-slate-500">Service Desk Manager</div>
                </div>
              </div>
            </div>
          </div>

          {children}

          {/* Footer */}
          <div className="border-t border-slate-200 bg-white px-6 py-2 flex items-center gap-6 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> System Status: <span className="font-semibold text-emerald-600">All Systems Operational</span></span>
            <span>ServiceNow: <span className="font-semibold text-slate-700">Connected</span></span>
            <span>Auto Categorization: <span className="font-semibold text-slate-700">Operational</span></span>
            <span>AI Model: <span className="font-semibold text-slate-700">v2.3 (94.7% accuracy)</span></span>
            <span className="ml-auto">© 2026 Neugain.io RunOps Digital Twin</span>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
