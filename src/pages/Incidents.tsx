import { useState } from "react";
import {
  AlertTriangle, AlertOctagon, CheckCircle2, Clock, Activity, Pause,
  Download, FileText, Plus, Search, Filter, Settings2, List, LayoutGrid,
  Star, MoreVertical, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";
import { AssuranceHeader } from "@/components/assurance/AssuranceHeader";
import { cn } from "@/lib/utils";

/* ---------- KPIs ---------- */
const kpis = [
  { label: "Total Incidents", value: "1,248", delta: "8.4%", dir: "up" as const, deltaTone: "neutral", icon: AlertTriangle, tone: "info" },
  { label: "Open Incidents", value: "342", delta: "12.7%", dir: "up" as const, deltaTone: "bad", icon: AlertOctagon, tone: "warning" },
  { label: "In Progress", value: "156", delta: "4.3%", dir: "down" as const, deltaTone: "good", icon: Activity, tone: "info" },
  { label: "Resolved (7 Days)", value: "642", delta: "15.3%", dir: "up" as const, deltaTone: "good", icon: CheckCircle2, tone: "healthy" },
  { label: "SLA Breaches", value: "18", delta: "28.6%", dir: "down" as const, deltaTone: "good", icon: AlertOctagon, tone: "critical" },
  { label: "Avg. Resolution Time", value: "4h 32m", delta: "11.2%", dir: "down" as const, deltaTone: "good", icon: Clock, tone: "ai" },
];

const toneIconBg: Record<string, string> = {
  critical: "bg-status-critical-soft text-status-critical",
  warning: "bg-status-warning-soft text-status-warning",
  healthy: "bg-status-healthy-soft text-status-healthy",
  info: "bg-status-info-soft text-status-info",
  ai: "bg-ai-soft text-ai",
};

/* ---------- Charts data ---------- */
const statusData = [
  { name: "Open", value: 342, pct: 27, color: "hsl(var(--status-critical))" },
  { name: "In Progress", value: 156, pct: 13, color: "hsl(var(--status-info))" },
  { name: "On Hold", value: 68, pct: 5, color: "hsl(var(--status-warning))" },
  { name: "Pending", value: 94, pct: 8, color: "hsl(var(--ai))" },
  { name: "Resolved", value: 588, pct: 47, color: "hsl(var(--status-healthy))" },
];

const priorityData = [
  { name: "Critical", value: 108, pct: 9, color: "hsl(var(--status-critical))" },
  { name: "High", value: 356, pct: 29, color: "hsl(var(--status-warning))" },
  { name: "Medium", value: 542, pct: 43, color: "hsl(45 95% 55%)" },
  { name: "Low", value: 242, pct: 19, color: "hsl(var(--status-healthy))" },
];

const categoryData = [
  { name: "Network", value: 324, pct: 26 },
  { name: "Software", value: 298, pct: 24 },
  { name: "Hardware", value: 210, pct: 17 },
  { name: "Access / Login", value: 176, pct: 14 },
  { name: "Email / Collaboration", value: 138, pct: 11 },
  { name: "Other", value: 102, pct: 8 },
];

/* ---------- Incidents table ---------- */
type Status = "Open" | "In Progress" | "On Hold" | "Pending" | "Resolved";
type Priority = "Critical" | "High" | "Medium" | "Low";
type SLA = "At Risk" | "On Track" | "Breached";

const incidents: {
  id: string; title: string; status: Status; priority: Priority; pdir: "up" | "down" | "flat";
  category: string; group: string; assignee: string | null; sla: SLA; created: string; updated: string;
}[] = [
  { id: "INC0001248", title: "VPN connection failing for remote users",   status: "Open",        priority: "High",     pdir: "up",   category: "Network",                group: "Network Support",     assignee: null,            sla: "At Risk",  created: "May 10, 2026 10:23 AM", updated: "5m ago" },
  { id: "INC0001247", title: "Email not syncing on mobile devices",       status: "In Progress", priority: "Medium",   pdir: "flat", category: "Email / Collaboration",  group: "Messaging Team",      assignee: "Sam Wilson",    sla: "On Track", created: "May 10, 2026 10:11 AM", updated: "12m ago" },
  { id: "INC0001246", title: "Unable to access shared drive",             status: "Open",        priority: "High",     pdir: "up",   category: "Access / Login",         group: "IAM Support",         assignee: null,            sla: "At Risk",  created: "May 10, 2026 10:05 AM", updated: "18m ago" },
  { id: "INC0001245", title: "System performance is very slow",           status: "In Progress", priority: "Critical", pdir: "up",   category: "Performance",            group: "Infrastructure",      assignee: "Priya Singh",   sla: "At Risk",  created: "May 10, 2026 9:58 AM",  updated: "25m ago" },
  { id: "INC0001244", title: "Printer not responding",                    status: "On Hold",     priority: "Low",      pdir: "down", category: "Hardware",               group: "Desktop Support",     assignee: "Mark Davis",    sla: "On Track", created: "May 10, 2026 9:45 AM",  updated: "1h ago" },
  { id: "INC0001243", title: "Microsoft Teams meeting issue",             status: "Pending",     priority: "Medium",   pdir: "flat", category: "Software",               group: "Collaboration Team",  assignee: null,            sla: "On Track", created: "May 10, 2026 9:30 AM",  updated: "1h ago" },
  { id: "INC0001242", title: "New laptop setup request",                  status: "Open",        priority: "Low",      pdir: "down", category: "Request",                group: "Service Desk",        assignee: null,            sla: "On Track", created: "May 10, 2026 9:12 AM",  updated: "2h ago" },
  { id: "INC0001241", title: "Website not loading properly",              status: "In Progress", priority: "High",     pdir: "up",   category: "Software",               group: "Web Support",         assignee: "John Miller",   sla: "At Risk",  created: "May 10, 2026 9:01 AM",  updated: "2h ago" },
];

const statusBadge: Record<Status, string> = {
  "Open":        "bg-status-critical-soft text-status-critical",
  "In Progress": "bg-status-info-soft text-status-info",
  "On Hold":     "bg-status-warning-soft text-status-warning",
  "Pending":     "bg-ai-soft text-ai",
  "Resolved":    "bg-status-healthy-soft text-status-healthy",
};
const priorityColor: Record<Priority, string> = {
  Critical: "text-status-critical",
  High:     "text-status-warning",
  Medium:   "text-foreground",
  Low:      "text-status-healthy",
};
const slaBadge: Record<SLA, string> = {
  "At Risk":  "bg-status-warning-soft text-status-warning",
  "On Track": "bg-status-healthy-soft text-status-healthy",
  "Breached": "bg-status-critical-soft text-status-critical",
};

/* ---------- Reusable sub-components ---------- */
function KpiTile({ k }: { k: typeof kpis[number] }) {
  const Icon = k.icon;
  const ArrowIcon = k.dir === "up" ? ArrowUp : ArrowDown;
  const deltaText =
    k.deltaTone === "good" ? "text-status-healthy" :
    k.deltaTone === "bad"  ? "text-status-critical" :
    "text-muted-foreground";
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)] card-hover">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-muted-foreground">{k.label}</div>
          <div className="text-3xl font-bold tracking-tight mt-1">{k.value}</div>
        </div>
        <span className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", toneIconBg[k.tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className={cn("flex items-center gap-1 mt-2 text-[11px] font-semibold", deltaText)}>
        <ArrowIcon className="h-3 w-3" />
        <span>{k.delta}</span>
        <span className="text-muted-foreground font-medium">vs last 7 days</span>
      </div>
    </div>
  );
}

function ChartCard({ title, range = "Last 7 Days", children }: { title: string; range?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">{title}</h3>
        <button className="text-[11px] font-semibold text-muted-foreground border border-border rounded-md px-2 py-1 hover:bg-secondary">
          {range} ▾
        </button>
      </div>
      {children}
    </div>
  );
}

function DonutWithLegend({ data, total }: { data: { name: string; value: number; pct: number; color: string }[]; total: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[170px] h-[170px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold leading-none">{total.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Total</div>
          </div>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5 min-w-0">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="flex-1 truncate font-medium">{d.name}</span>
            <span className="text-muted-foreground tabular-nums">{d.value} ({d.pct}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryBars({ data }: { data: typeof categoryData }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.name} className="flex items-center gap-3 text-xs">
          <span className="w-36 shrink-0 truncate font-medium">{d.name}</span>
          <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-status-info" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="text-muted-foreground tabular-nums w-20 text-right">{d.value} ({d.pct}%)</span>
        </li>
      ))}
    </ul>
  );
}

function SlaGauge() {
  const value = 94;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[200px] h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="75%" outerRadius="100%" data={[{ value }]} startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={20} fill="hsl(var(--status-healthy))" background={{ fill: "hsl(var(--secondary))" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-x-0 bottom-2 grid place-items-center">
          <div className="text-3xl font-bold text-status-healthy leading-none">{value}%</div>
          <div className="text-[11px] text-muted-foreground mt-1">Compliant</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 w-full mt-2 text-center">
        <div>
          <div className="text-[11px] text-muted-foreground">SLA Met</div>
          <div className="text-base font-bold text-status-healthy">1,174</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">SLA Breached</div>
          <div className="text-base font-bold text-status-critical">74</div>
        </div>
      </div>
    </div>
  );
}

const tabs = ["All Incidents", "My Incidents", "Unassigned", "Watch List"] as const;

const Incidents = () => {
  const [tab, setTab] = useState<typeof tabs[number]>("All Incidents");

  return (
    <AppShell>
      <AssuranceHeader
        title="Incidents"
        subtitle="Monitor, manage and resolve IT incidents across the organization"
        actions={
          <>
            <button className="h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold inline-flex items-center gap-2 hover:bg-secondary transition">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold inline-flex items-center gap-2 hover:bg-secondary transition">
              <FileText className="h-4 w-4" /> Reports
            </button>
            <button className="h-11 px-4 rounded-xl bg-indigo text-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-indigo/90 transition shadow-[var(--shadow-md)]">
              <Plus className="h-4 w-4" /> New Incident
            </button>
          </>
        }
      />

      <main className="flex-1 px-8 py-6 animate-fade-in space-y-5">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((k) => <KpiTile key={k.label} k={k} />)}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <ChartCard title="Incidents by Status">
            <DonutWithLegend data={statusData} total={1248} />
          </ChartCard>
          <ChartCard title="Incidents by Priority">
            <DonutWithLegend data={priorityData} total={1248} />
          </ChartCard>
          <ChartCard title="Incidents by Category">
            <CategoryBars data={categoryData} />
          </ChartCard>
          <ChartCard title="SLA Compliance">
            <SlaGauge />
          </ChartCard>
        </div>

        {/* Table card */}
        <section className="bg-card border border-border rounded-2xl shadow-[var(--shadow-sm)]">
          {/* Tabs + tools */}
          <div className="flex items-center justify-between px-5 pt-4">
            <nav className="flex items-center gap-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                    tab === t ? "text-indigo border-b-2 border-indigo rounded-none" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  className="w-64 h-9 pl-8 pr-3 text-xs rounded-lg border border-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-indigo/30"
                  placeholder="Search incidents..."
                />
              </div>
              <button className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Filter className="h-3.5 w-3.5" /></button>
              <button className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Settings2 className="h-3.5 w-3.5" /></button>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button className="h-9 w-9 grid place-items-center bg-secondary"><List className="h-3.5 w-3.5" /></button>
                <button className="h-9 w-9 grid place-items-center hover:bg-secondary"><LayoutGrid className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border text-xs">
            {[
              { l: "Status", v: "All" },
              { l: "Priority", v: "All" },
              { l: "Category", v: "All" },
              { l: "Assignment Group", v: "All" },
              { l: "SLA Status", v: "All" },
            ].map((f) => (
              <div key={f.l} className="flex items-center gap-2">
                <span className="text-muted-foreground">{f.l}</span>
                <button className="h-8 px-2.5 rounded-md border border-border bg-card font-medium hover:bg-secondary min-w-[72px] text-left flex items-center justify-between gap-2">
                  {f.v} <span className="text-muted-foreground">▾</span>
                </button>
              </div>
            ))}
            <button className="ml-auto h-8 px-3 rounded-md border border-border bg-card font-semibold inline-flex items-center gap-1.5 hover:bg-secondary">
              <Filter className="h-3 w-3" /> More Filters
            </button>
            <span className="text-muted-foreground">1 - {incidents.length} of 1248</span>
            <button className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-secondary"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-secondary"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/30">
                  <th className="px-3 py-2.5 w-8"><input type="checkbox" className="rounded" /></th>
                  <th className="px-2 py-2.5 w-8"></th>
                  <th className="text-left font-semibold py-2.5 px-2">Incident ID</th>
                  <th className="text-left font-semibold py-2.5 px-2">Title</th>
                  <th className="text-left font-semibold py-2.5 px-2">Status</th>
                  <th className="text-left font-semibold py-2.5 px-2">Priority</th>
                  <th className="text-left font-semibold py-2.5 px-2">Category</th>
                  <th className="text-left font-semibold py-2.5 px-2">Assignment Group</th>
                  <th className="text-left font-semibold py-2.5 px-2">Assignee</th>
                  <th className="text-left font-semibold py-2.5 px-2">SLA Status</th>
                  <th className="text-left font-semibold py-2.5 px-2">Created</th>
                  <th className="text-left font-semibold py-2.5 px-2">Updated</th>
                  <th className="px-2 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                    <td className="px-3 py-3"><input type="checkbox" className="rounded" /></td>
                    <td className="px-2 py-3"><Star className="h-3.5 w-3.5 text-muted-foreground hover:text-status-warning cursor-pointer" /></td>
                    <td className="px-2 py-3 font-semibold text-indigo whitespace-nowrap">{inc.id}</td>
                    <td className="px-2 py-3 font-medium">{inc.title}</td>
                    <td className="px-2 py-3">
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap", statusBadge[inc.status])}>
                        {inc.status}
                      </span>
                    </td>
                    <td className={cn("px-2 py-3 font-semibold", priorityColor[inc.priority])}>
                      <span className="inline-flex items-center gap-1">
                        {inc.priority}
                        {inc.pdir === "up"   && <ArrowUp className="h-3 w-3" />}
                        {inc.pdir === "down" && <ArrowDown className="h-3 w-3" />}
                        {inc.pdir === "flat" && <span className="text-muted-foreground">—</span>}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">{inc.category}</td>
                    <td className="px-2 py-3 text-muted-foreground">{inc.group}</td>
                    <td className="px-2 py-3">
                      {inc.assignee ? (
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-[9px] font-bold">
                            {inc.assignee.split(" ").map(n => n[0]).join("")}
                          </span>
                          <span className="font-medium">{inc.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap", slaBadge[inc.sla])}>
                        {inc.sla}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground whitespace-nowrap">{inc.created}</td>
                    <td className="px-2 py-3 text-muted-foreground whitespace-nowrap">{inc.updated}</td>
                    <td className="px-2 py-3">
                      <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary">
                        <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AppShell>
  );
};

export default Incidents;
