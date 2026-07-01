import { useState } from "react";
import {
  ArrowLeftRight, CheckSquare, Zap, FileText, CheckCircle2, AlertTriangle,
  Download, Plus, Calendar, Search, Filter, Settings2, List,
  Star, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";
import { AssuranceHeader } from "@/components/assurance/AssuranceHeader";
import { cn } from "@/lib/utils";

/* ---------- KPIs ---------- */
const kpis = [
  { label: "Total Changes",       value: "1,248", delta: "8.6%",  dir: "up" as const,   deltaTone: "neutral", icon: ArrowLeftRight, tone: "info" },
  { label: "Normal Changes",      value: "856",   delta: "6.1%",  dir: "up" as const,   deltaTone: "neutral", icon: CheckSquare,    tone: "healthy" },
  { label: "Emergency Changes",   value: "86",    delta: "12.4%", dir: "up" as const,   deltaTone: "bad",     icon: Zap,            tone: "critical" },
  { label: "Standard Changes",    value: "306",   delta: "3.7%",  dir: "up" as const,   deltaTone: "neutral", icon: FileText,       tone: "warning" },
  { label: "Changes Success Rate",value: "97.6%", delta: "1.8%",  dir: "up" as const,   deltaTone: "good",    icon: CheckCircle2,   tone: "healthy" },
  { label: "Change Failure Rate", value: "2.4%",  delta: "1.8%",  dir: "up" as const,   deltaTone: "bad",     icon: AlertTriangle,  tone: "critical" },
];

const toneIconBg: Record<string, string> = {
  critical: "bg-status-critical-soft text-status-critical",
  warning: "bg-status-warning-soft text-status-warning",
  healthy: "bg-status-healthy-soft text-status-healthy",
  info: "bg-status-info-soft text-status-info",
  ai: "bg-ai-soft text-ai",
};

/* ---------- Charts ---------- */
const statusData = [
  { name: "Planned",          value: 412, pct: 33, color: "hsl(var(--status-info))" },
  { name: "In Progress",      value: 218, pct: 17, color: "hsl(var(--ai))" },
  { name: "Pending Approval", value: 156, pct: 13, color: "hsl(var(--status-warning))" },
  { name: "Implemented",      value: 388, pct: 31, color: "hsl(var(--status-healthy))" },
  { name: "Cancelled",        value: 74,  pct: 6,  color: "hsl(220 12% 60%)" },
];

const priorityData = [
  { name: "Critical", value: 108, pct: 9,  color: "hsl(var(--status-critical))" },
  { name: "High",     value: 286, pct: 23, color: "hsl(var(--status-warning))" },
  { name: "Medium",   value: 542, pct: 43, color: "hsl(45 95% 55%)" },
  { name: "Low",      value: 312, pct: 25, color: "hsl(var(--status-healthy))" },
];

const categoryData = [
  { name: "Infrastructure", value: 428, pct: 34 },
  { name: "Application",    value: 312, pct: 25 },
  { name: "Database",       value: 156, pct: 13 },
  { name: "Security",       value: 128, pct: 10 },
  { name: "Network",        value: 114, pct: 9 },
  { name: "Other",          value: 110, pct: 9 },
];

const trendData = [
  { d: "Apr 11", Success: 96, Failure: 4 },
  { d: "Apr 18", Success: 95, Failure: 5 },
  { d: "Apr 25", Success: 97, Failure: 3 },
  { d: "May 2",  Success: 98, Failure: 2 },
  { d: "May 9",  Success: 97, Failure: 3 },
];

const compliance = [
  { name: "Compliant",     value: 1196, pct: 96, color: "hsl(var(--status-healthy))" },
  { name: "Non-Compliant", value: 32,   pct: 3,  color: "hsl(var(--status-critical))" },
  { name: "Unknown",       value: 20,   pct: 1,  color: "hsl(220 12% 60%)" },
];

const metrics = [
  { label: "Lead Time (Avg)",            value: "2.8 days", delta: "0.6 days", dir: "down" as const, good: true },
  { label: "Approval Time (Avg)",        value: "1.2 days", delta: "0.3 days", dir: "down" as const, good: true },
  { label: "Implementation Time (Avg)",  value: "3.6 hours",delta: "0.5 hours",dir: "up"   as const, good: false },
  { label: "Backout Rate",               value: "1.3%",     delta: "0.4%",     dir: "down" as const, good: true },
];

/* ---------- Table ---------- */
type Status = "Planned" | "In Progress" | "Pending Approval" | "Implemented" | "Cancelled";
type Priority = "Critical" | "High" | "Medium" | "Low";
type Impact = "High" | "Medium" | "Low";
type Type = "Normal" | "Emergency" | "Standard";

const changes: {
  id: string; title: string; status: Status; priority: Priority; pdir: "up"|"down"|"flat";
  type: Type; category: string; impact: Impact; risk: Impact;
  scheduled: string; requestedBy: string; cab: string; success: "Success" | "—"; updated: string;
}[] = [
  { id: "CHG003245", title: "Upgrade Windows Server 2019 to 2022", status: "Implemented",      priority: "High",   pdir: "flat", type: "Normal",    category: "Infrastructure", impact: "High",   risk: "Medium", scheduled: "May 12, 2026 10:00 PM", requestedBy: "John Miller",  cab: "IT CAB",        success: "Success", updated: "May 12, 2026 10:45 PM" },
  { id: "CHG003244", title: "Deploy new firewall rule set",        status: "In Progress",      priority: "High",   pdir: "flat", type: "Normal",    category: "Security",       impact: "High",   risk: "High",   scheduled: "May 12, 2026 09:00 PM", requestedBy: "Priya Singh",  cab: "IT CAB",        success: "—",       updated: "May 12, 2026 09:15 PM" },
  { id: "CHG003243", title: "Database index optimization",         status: "Pending Approval", priority: "Medium", pdir: "flat", type: "Normal",    category: "Database",       impact: "Medium", risk: "Low",    scheduled: "May 13, 2026 01:00 AM", requestedBy: "Sam Wilson",   cab: "DB CAB",        success: "—",       updated: "May 12, 2026 08:32 PM" },
  { id: "CHG003242", title: "Change load balancer configuration",  status: "Planned",          priority: "Medium", pdir: "flat", type: "Normal",    category: "Network",        impact: "Medium", risk: "Medium", scheduled: "May 13, 2026 11:00 PM", requestedBy: "Mark Davis",   cab: "IT CAB",        success: "—",       updated: "May 12, 2026 07:50 PM" },
  { id: "CHG003241", title: "Emergency patch for OpenSSL vulnerability", status: "Implemented", priority: "Critical", pdir: "up", type: "Emergency", category: "Security",       impact: "High",   risk: "High",   scheduled: "May 12, 2026 02:30 AM", requestedBy: "John Miller",  cab: "Emergency CAB", success: "Success", updated: "May 11, 2026 02:58 AM" },
  { id: "CHG003240", title: "Microsoft 365 update rollout",        status: "Implemented",      priority: "Low",    pdir: "down", type: "Standard",  category: "Application",    impact: "Low",    risk: "Low",    scheduled: "May 12, 2026 10:00 PM", requestedBy: "Sarah Johnson",cab: "Standard CAB",  success: "Success", updated: "May 10, 2026 10:27 PM" },
  { id: "CHG003239", title: "Add memory to application server",    status: "Cancelled",        priority: "Medium", pdir: "flat", type: "Normal",    category: "Infrastructure", impact: "Medium", risk: "Medium", scheduled: "May 12, 2026 08:00 PM", requestedBy: "Alex Morgan",  cab: "IT CAB",        success: "—",       updated: "May 10, 2026 07:10 PM" },
  { id: "CHG003238", title: "Switch network switch firmware upgrade", status: "In Progress",   priority: "Medium", pdir: "flat", type: "Normal",    category: "Network",        impact: "Low",    risk: "Low",    scheduled: "May 12, 2026 06:00 PM", requestedBy: "Mark Davis",   cab: "IT CAB",        success: "—",       updated: "May 10, 2026 05:42 PM" },
];

const statusBadge: Record<Status, string> = {
  "Planned":          "bg-status-info-soft text-status-info",
  "In Progress":      "bg-ai-soft text-ai",
  "Pending Approval": "bg-status-warning-soft text-status-warning",
  "Implemented":      "bg-status-healthy-soft text-status-healthy",
  "Cancelled":        "bg-secondary text-muted-foreground",
};
const priorityColor: Record<Priority, string> = {
  Critical: "text-status-critical",
  High:     "text-status-warning",
  Medium:   "text-foreground",
  Low:      "text-status-healthy",
};
const impactBadge: Record<Impact, string> = {
  High:   "bg-status-critical-soft text-status-critical",
  Medium: "bg-status-warning-soft text-status-warning",
  Low:    "bg-status-healthy-soft text-status-healthy",
};
const successBadge: Record<string, string> = {
  Success: "bg-status-healthy-soft text-status-healthy font-bold",
  "—": "text-muted-foreground",
};

/* ---------- helpers ---------- */
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

function ChartCard({ title, range = "Last 7 Days", children, className }: { title: string; range?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-sm)]", className)}>
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
      <div className="relative w-[160px] h-[160px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2} stroke="none">
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
          <span className="w-32 shrink-0 truncate font-medium">{d.name}</span>
          <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-status-info" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="text-muted-foreground tabular-nums w-20 text-right">{d.value} ({d.pct}%)</span>
        </li>
      ))}
    </ul>
  );
}

const ChangeManagement = () => {
  const tabs = ["All Changes", "My Changes", "Pending Approval", "In Progress", "Implemented", "Cancelled"] as const;
  const [tab, setTab] = useState<typeof tabs[number]>("All Changes");

  return (
    <AppShell>
      <AssuranceHeader
        title="Change Management"
        subtitle="Plan, track, and review all changes to your IT environment"
        actions={
          <>
            <button className="h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold inline-flex items-center gap-2 hover:bg-secondary transition">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold inline-flex items-center gap-2 hover:bg-secondary transition">
              <FileText className="h-4 w-4" /> Reports
            </button>
            <button className="h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold inline-flex items-center gap-2 hover:bg-secondary transition">
              <Calendar className="h-4 w-4" /> Change Calendar
            </button>
            <button className="h-11 px-4 rounded-xl bg-indigo text-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-indigo/90 transition shadow-[var(--shadow-md)]">
              <Plus className="h-4 w-4" /> New Change
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
          <ChartCard title="Change Status Overview">
            <DonutWithLegend data={statusData} total={1248} />
          </ChartCard>
          <ChartCard title="Changes by Priority">
            <DonutWithLegend data={priorityData} total={1248} />
          </ChartCard>
          <ChartCard title="Changes by Category">
            <CategoryBars data={categoryData} />
          </ChartCard>
          <ChartCard title="Change Success Rate Trend" range="Last 30 Days">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={28} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Success" stroke="hsl(var(--status-healthy))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Failure" stroke="hsl(var(--status-critical))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Body: table + side panel */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          {/* Table card */}
          <section className="bg-card border border-border rounded-2xl shadow-[var(--shadow-sm)]">
            {/* Tabs */}
            <div className="flex items-center justify-between px-5 pt-4">
              <nav className="flex items-center gap-1 flex-wrap">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "px-3 py-2 text-xs font-semibold transition-colors",
                      tab === t ? "text-indigo border-b-2 border-indigo" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input className="w-56 h-9 pl-8 pr-3 text-xs rounded-lg border border-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-indigo/30" placeholder="Search changes..." />
                </div>
                <button className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Filter className="h-3.5 w-3.5" /></button>
                <button className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Settings2 className="h-3.5 w-3.5" /></button>
                <button className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-secondary"><List className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border text-xs flex-wrap">
              {[
                { l: "Status", v: "All" },
                { l: "Priority", v: "All" },
                { l: "Category", v: "All" },
                { l: "Change Type", v: "All" },
                { l: "Impact", v: "All" },
                { l: "CAB", v: "All" },
                { l: "Date Range", v: "Last 30 Days" },
              ].map((f) => (
                <div key={f.l} className="flex items-center gap-2">
                  <span className="text-muted-foreground">{f.l}</span>
                  <button className="h-8 px-2.5 rounded-md border border-border bg-card font-medium hover:bg-secondary text-left flex items-center justify-between gap-2">
                    {f.v} <span className="text-muted-foreground">▾</span>
                  </button>
                </div>
              ))}
              <button className="h-8 px-3 rounded-md border border-border bg-card font-semibold inline-flex items-center gap-1.5 hover:bg-secondary">
                <Filter className="h-3 w-3" /> More Filters
              </button>
              <span className="ml-auto text-muted-foreground">1 - 25 of 1248</span>
              <button className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-secondary"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-secondary"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/30">
                    <th className="px-3 py-2.5 w-8"><input type="checkbox" className="rounded" /></th>
                    <th className="px-2 py-2.5 w-8"></th>
                    <th className="text-left font-semibold py-2.5 px-2">Change ID</th>
                    <th className="text-left font-semibold py-2.5 px-2">Title</th>
                    <th className="text-left font-semibold py-2.5 px-2">Status</th>
                    <th className="text-left font-semibold py-2.5 px-2">Priority</th>
                    <th className="text-left font-semibold py-2.5 px-2">Type</th>
                    <th className="text-left font-semibold py-2.5 px-2">Category</th>
                    <th className="text-left font-semibold py-2.5 px-2">Impact</th>
                    <th className="text-left font-semibold py-2.5 px-2">Risk</th>
                    <th className="text-left font-semibold py-2.5 px-2">Scheduled Start</th>
                    <th className="text-left font-semibold py-2.5 px-2">Requested By</th>
                    <th className="text-left font-semibold py-2.5 px-2">CAB</th>
                    <th className="text-left font-semibold py-2.5 px-2">Success</th>
                    <th className="text-left font-semibold py-2.5 px-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                      <td className="px-3 py-3"><input type="checkbox" className="rounded" /></td>
                      <td className="px-2 py-3"><Star className="h-3.5 w-3.5 text-muted-foreground hover:text-status-warning cursor-pointer" /></td>
                      <td className="px-2 py-3 font-semibold text-indigo whitespace-nowrap">{c.id}</td>
                      <td className="px-2 py-3 font-medium">{c.title}</td>
                      <td className="px-2 py-3">
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap", statusBadge[c.status])}>
                          {c.status}
                        </span>
                      </td>
                      <td className={cn("px-2 py-3 font-semibold", priorityColor[c.priority])}>
                        <span className="inline-flex items-center gap-1">
                          {c.priority}
                          {c.pdir === "up"   && <ArrowUp className="h-3 w-3" />}
                          {c.pdir === "down" && <ArrowDown className="h-3 w-3" />}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">{c.type}</td>
                      <td className="px-2 py-3 text-muted-foreground">{c.category}</td>
                      <td className="px-2 py-3">
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md", impactBadge[c.impact])}>{c.impact}</span>
                      </td>
                      <td className="px-2 py-3">
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md", impactBadge[c.risk])}>{c.risk}</span>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground whitespace-nowrap">{c.scheduled}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-[9px] font-bold">
                            {c.requestedBy.split(" ").map(n => n[0]).join("")}
                          </span>
                          <span className="font-medium whitespace-nowrap">{c.requestedBy}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground whitespace-nowrap">{c.cab}</td>
                      <td className="px-2 py-3">
                        <span className={cn("text-[10px] px-2 py-1 rounded-md", successBadge[c.success])}>{c.success}</span>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground whitespace-nowrap">{c.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right side panels */}
          <aside className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">Change Metrics</h3>
                <span className="text-[10px] text-muted-foreground">Last 30 Days</span>
              </div>
              <ul className="space-y-3">
                {metrics.map((m) => {
                  const Arrow = m.dir === "up" ? ArrowUp : ArrowDown;
                  return (
                    <li key={m.label} className="flex items-start justify-between text-xs">
                      <span className="text-muted-foreground font-medium">{m.label}</span>
                      <div className="text-right">
                        <div className="font-bold">{m.value}</div>
                        <div className={cn("text-[10px] font-semibold inline-flex items-center gap-0.5",
                          m.good ? "text-status-healthy" : "text-status-critical")}>
                          <Arrow className="h-2.5 w-2.5" /> {m.delta}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-sm)]">
              <h3 className="text-sm font-bold mb-3">Change Policy Compliance</h3>
              <DonutWithLegend data={compliance} total={1248} />
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
};

export default ChangeManagement;
