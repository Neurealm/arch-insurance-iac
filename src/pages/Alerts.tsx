import { useState } from "react";
import {
  Bell, AlertOctagon, AlertTriangle, Info, CheckCircle2, BellOff,
  Download, FileText, Plus, Search, Filter, Settings2, List, LayoutGrid,
  Star, MoreVertical, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  Server, Globe, Database, Network, HardDrive, Activity,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";
import { AssuranceHeader } from "@/components/assurance/AssuranceHeader";
import { cn } from "@/lib/utils";

/* ---------- KPIs ---------- */
const kpis = [
  { label: "Total Alerts",  value: "1,542", delta: "12.6%", dir: "up" as const,   deltaTone: "neutral", icon: Bell,         tone: "info" },
  { label: "Critical",      value: "156",   delta: "8.3%",  dir: "up" as const,   deltaTone: "bad",     icon: AlertOctagon, tone: "critical" },
  { label: "Warning",       value: "432",   delta: "3.1%",  dir: "down" as const, deltaTone: "good",    icon: AlertTriangle,tone: "warning" },
  { label: "Info",          value: "954",   delta: "5.7%",  dir: "up" as const,   deltaTone: "neutral", icon: Info,         tone: "info" },
  { label: "Acknowledged",  value: "214",   delta: "4.2%",  dir: "up" as const,   deltaTone: "good",    icon: CheckCircle2, tone: "healthy" },
  { label: "Suppressed",    value: "86",    delta: "12.4%", dir: "down" as const, deltaTone: "good",    icon: BellOff,      tone: "ai" },
];

const toneIconBg: Record<string, string> = {
  critical: "bg-status-critical-soft text-status-critical",
  warning: "bg-status-warning-soft text-status-warning",
  healthy: "bg-status-healthy-soft text-status-healthy",
  info: "bg-status-info-soft text-status-info",
  ai: "bg-ai-soft text-ai",
};

/* ---------- Trend / charts data ---------- */
const trendData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  Critical: 20 + Math.round(Math.sin(i / 2) * 30 + ((i * 7) % 25)),
  Warning:  60 + Math.round(Math.cos(i / 3) * 40 + ((i * 11) % 30)),
  Info:     90 + Math.round(Math.sin(i / 4 + 1) * 50 + ((i * 13) % 40)),
}));

const severityData = [
  { name: "Critical", value: 156, pct: 10, color: "hsl(var(--status-critical))" },
  { name: "Warning",  value: 432, pct: 28, color: "hsl(var(--status-warning))" },
  { name: "Info",     value: 954, pct: 62, color: "hsl(var(--status-info))" },
];

const sourceData = [
  { name: "Monitoring",     value: 842, pct: 55, color: "hsl(var(--status-info))" },
  { name: "Application",    value: 356, pct: 23, color: "hsl(var(--status-healthy))" },
  { name: "Infrastructure", value: 228, pct: 15, color: "hsl(var(--status-warning))" },
  { name: "Network",        value: 116, pct: 7,  color: "hsl(var(--ai))" },
];

const topSources = [
  { name: "Datacenter-01",   value: 245 },
  { name: "Web Server Cluster", value: 189 },
  { name: "Database Server", value: 156 },
  { name: "Network Devices", value: 134 },
  { name: "Storage Array",   value: 98 },
];

/* ---------- Active Alerts by Status ---------- */
const statusBreak = [
  { name: "New",          value: 1128, pct: 73, color: "hsl(var(--status-critical))" },
  { name: "Acknowledged", value: 214,  pct: 14, color: "hsl(var(--status-warning))" },
  { name: "In Progress",  value: 98,   pct: 6,  color: "hsl(var(--status-info))" },
  { name: "Closed",       value: 102,  pct: 7,  color: "hsl(var(--status-healthy))" },
];

const unacknowledged = [
  { label: "Critical", value: 98,  color: "text-status-critical", dot: "bg-status-critical" },
  { label: "Warning",  value: 156, color: "text-status-warning",  dot: "bg-status-warning" },
  { label: "Info",     value: 628, color: "text-status-info",     dot: "bg-status-info" },
];

const topRules = [
  { name: "CPU Utilization High", value: 245 },
  { name: "Memory Usage High",    value: 189 },
  { name: "Disk Space Low",       value: 156 },
  { name: "Service Down",         value: 134 },
  { name: "Response Time High",   value: 98 },
];

/* ---------- Alerts table ---------- */
type Severity = "Critical" | "Warning" | "Info";
type Status = "New" | "Acknowledged" | "Closed" | "In Progress";
type SrcType = "Infrastructure" | "Monitoring" | "Application" | "Network";

const srcIcon: Record<SrcType, any> = {
  Infrastructure: Server,
  Monitoring: Globe,
  Application: Activity,
  Network: Network,
};

const alerts: {
  id: string; sev: Severity; name: string; source: string; type: SrcType;
  status: Status; lastOccurred: string; count: number; ackBy: string | null;
}[] = [
  { id: "A1", sev: "Critical", name: "Database CPU Utilization is above 95%", source: "DB-Prod-01",      type: "Infrastructure", status: "New",          lastOccurred: "May 10, 2025 10:24 AM", count: 12, ackBy: null },
  { id: "A2", sev: "Critical", name: "Web Server Down",                       source: "Web-Cluster-02", type: "Monitoring",     status: "Acknowledged", lastOccurred: "May 10, 2025 10:22 AM", count: 8,  ackBy: "Sam Wilson" },
  { id: "A3", sev: "Warning",  name: "High Memory Usage",                     source: "App-Server-03",  type: "Infrastructure", status: "New",          lastOccurred: "May 10, 2025 10:21 AM", count: 15, ackBy: null },
  { id: "A4", sev: "Warning",  name: "Disk Space Low ( < 10% )",              source: "File-Server-01", type: "Infrastructure", status: "New",          lastOccurred: "May 10, 2025 10:20 AM", count: 7,  ackBy: null },
  { id: "A5", sev: "Info",     name: "Backup Completed Successfully",         source: "Backup-Server",  type: "Application",    status: "Closed",       lastOccurred: "May 10, 2025 10:18 AM", count: 1,  ackBy: "John Miller" },
  { id: "A6", sev: "Warning",  name: "High Response Time",                    source: "API-Gateway",    type: "Monitoring",     status: "Acknowledged", lastOccurred: "May 10, 2025 10:17 AM", count: 5,  ackBy: "Priya Singh" },
  { id: "A7", sev: "Info",     name: "SSL Certificate Expires in 15 Days",    source: "www.mycompany.com", type: "Monitoring",  status: "New",          lastOccurred: "May 10, 2025 10:16 AM", count: 1,  ackBy: null },
  { id: "A8", sev: "Critical", name: "Network Device Unreachable",            source: "Core-Switch-01", type: "Network",        status: "New",          lastOccurred: "May 10, 2025 10:15 AM", count: 3,  ackBy: null },
];

const sevStyle: Record<Severity, { text: string; icon: any }> = {
  Critical: { text: "text-status-critical", icon: AlertOctagon },
  Warning:  { text: "text-status-warning",  icon: AlertTriangle },
  Info:     { text: "text-status-info",     icon: Info },
};
const statusStyle: Record<Status, string> = {
  New:           "text-status-critical font-semibold",
  Acknowledged:  "bg-status-warning-soft text-status-warning font-bold",
  "In Progress": "bg-status-info-soft text-status-info font-bold",
  Closed:        "bg-status-healthy-soft text-status-healthy font-bold",
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
        <span className="text-muted-foreground font-medium">vs last 24 hours</span>
      </div>
    </div>
  );
}

function ChartCard({ title, range = "Last 24 Hours", children, className }: { title: string; range?: string; children: React.ReactNode; className?: string }) {
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

function HBars({ data }: { data: { name: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.name} className="flex items-center gap-3 text-xs">
          <span className="w-40 shrink-0 truncate font-medium">{d.name}</span>
          <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-status-info" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="text-muted-foreground tabular-nums w-10 text-right">{d.value}</span>
        </li>
      ))}
    </ul>
  );
}

function AlertsTrend() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gCrit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--status-critical))" stopOpacity={0.45} />
            <stop offset="100%" stopColor="hsl(var(--status-critical))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gWarn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--status-warning))" stopOpacity={0.45} />
            <stop offset="100%" stopColor="hsl(var(--status-warning))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gInfo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--status-info))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--status-info))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={3} />
        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={28} />
        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11, borderRadius: 8 }} />
        <Area type="monotone" dataKey="Info"     stackId="1" stroke="hsl(var(--status-info))"     strokeWidth={1.5} fill="url(#gInfo)" />
        <Area type="monotone" dataKey="Warning"  stackId="1" stroke="hsl(var(--status-warning))"  strokeWidth={1.5} fill="url(#gWarn)" />
        <Area type="monotone" dataKey="Critical" stackId="1" stroke="hsl(var(--status-critical))" strokeWidth={1.5} fill="url(#gCrit)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const Alerts = () => {
  const [, setTab] = useState("All");

  return (
    <AppShell>
      <AssuranceHeader
        title="Alerts"
        subtitle="Real-time view of alerts across your IT environment"
        actions={
          <>
            <button className="h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold inline-flex items-center gap-2 hover:bg-secondary transition">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold inline-flex items-center gap-2 hover:bg-secondary transition">
              <FileText className="h-4 w-4" /> Reports
            </button>
            <button className="h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold inline-flex items-center gap-2 hover:bg-secondary transition">
              <Settings2 className="h-4 w-4" /> Alert Rules
            </button>
            <button className="h-11 px-4 rounded-xl bg-indigo text-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-indigo/90 transition shadow-[var(--shadow-md)]">
              <Plus className="h-4 w-4" /> Create Alert Rule
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
          <ChartCard title="Alerts Over Time">
            <AlertsTrend />
          </ChartCard>
          <ChartCard title="Alerts by Severity">
            <DonutWithLegend data={severityData} total={1542} />
          </ChartCard>
          <ChartCard title="Alerts by Source Type" range="Last 7 Days">
            <DonutWithLegend data={sourceData} total={1542} />
          </ChartCard>
          <ChartCard title="Top Alert Sources" range="Last 7 Days">
            <HBars data={topSources} />
          </ChartCard>
        </div>

        {/* Body: table + side panel */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          {/* Table card */}
          <section className="bg-card border border-border rounded-2xl shadow-[var(--shadow-sm)]">
            {/* Filter bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border text-xs flex-wrap">
              {[
                { l: "Severity", v: "All" },
                { l: "Status", v: "All" },
                { l: "Source Type", v: "All" },
                { l: "Source", v: "All" },
                { l: "Rule", v: "All" },
                { l: "Time Range", v: "Last 24 Hours" },
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
              <div className="relative ml-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className="w-56 h-8 pl-8 pr-3 rounded-md border border-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-indigo/30" placeholder="Search alerts..." />
              </div>
              <button className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-secondary"><Filter className="h-3.5 w-3.5" /></button>
              <button className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-secondary"><Settings2 className="h-3.5 w-3.5" /></button>
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button className="h-8 w-8 grid place-items-center bg-secondary"><List className="h-3.5 w-3.5" /></button>
                <button className="h-8 w-8 grid place-items-center hover:bg-secondary"><LayoutGrid className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-2 text-xs text-muted-foreground">
              <span>1 - {alerts.length} of 1542</span>
              <button className="h-7 w-7 grid place-items-center rounded-md border border-border hover:bg-secondary"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button className="h-7 w-7 grid place-items-center rounded-md border border-border hover:bg-secondary"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-y border-border bg-secondary/30">
                    <th className="px-3 py-2.5 w-8"><input type="checkbox" className="rounded" /></th>
                    <th className="px-2 py-2.5 w-8"></th>
                    <th className="text-left font-semibold py-2.5 px-2">Severity</th>
                    <th className="text-left font-semibold py-2.5 px-2">Alert Name</th>
                    <th className="text-left font-semibold py-2.5 px-2">Source</th>
                    <th className="text-left font-semibold py-2.5 px-2">Source Type</th>
                    <th className="text-left font-semibold py-2.5 px-2">Status</th>
                    <th className="text-left font-semibold py-2.5 px-2">Last Occurred</th>
                    <th className="text-left font-semibold py-2.5 px-2">Count</th>
                    <th className="text-left font-semibold py-2.5 px-2">Acknowledged By</th>
                    <th className="px-2 py-2.5 w-10 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => {
                    const SevIcon = sevStyle[a.sev].icon;
                    const TypeIcon = srcIcon[a.type];
                    return (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                        <td className="px-3 py-3"><input type="checkbox" className="rounded" /></td>
                        <td className="px-2 py-3"><Star className="h-3.5 w-3.5 text-muted-foreground hover:text-status-warning cursor-pointer" /></td>
                        <td className={cn("px-2 py-3 font-bold", sevStyle[a.sev].text)}>
                          <span className="inline-flex items-center gap-1.5">
                            <SevIcon className="h-3.5 w-3.5" /> {a.sev}
                          </span>
                        </td>
                        <td className="px-2 py-3 font-medium">{a.name}</td>
                        <td className="px-2 py-3 text-muted-foreground">{a.source}</td>
                        <td className="px-2 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <TypeIcon className="h-3.5 w-3.5" /> {a.type}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          {a.status === "New" ? (
                            <span className="text-status-critical font-semibold">New</span>
                          ) : (
                            <span className={cn("text-[10px] px-2 py-1 rounded-md whitespace-nowrap", statusStyle[a.status])}>
                              {a.status}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-muted-foreground whitespace-nowrap">{a.lastOccurred}</td>
                        <td className="px-2 py-3 font-semibold">{a.count}</td>
                        <td className="px-2 py-3">
                          {a.ackBy ? (
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-[9px] font-bold">
                                {a.ackBy.split(" ").map(n => n[0]).join("")}
                              </span>
                              <span className="font-medium">{a.ackBy}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary">
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right side panel */}
          <aside className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-sm)]">
              <h3 className="text-sm font-bold mb-3">Active Alerts by Status</h3>
              <DonutWithLegend data={statusBreak} total={1542} />
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-sm)]">
              <h3 className="text-sm font-bold mb-3">Unacknowledged Alerts</h3>
              <ul className="space-y-2.5">
                {unacknowledged.map((u) => (
                  <li key={u.label} className="flex items-center gap-3 text-xs">
                    <span className={cn("h-2.5 w-2.5 rounded-full", u.dot)} />
                    <span className="flex-1 font-medium">{u.label}</span>
                    <span className={cn("font-bold tabular-nums", u.color)}>{u.value}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-3 text-xs text-indigo font-semibold hover:underline">View all</button>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">Top Alert Rules Triggered</h3>
                <span className="text-[10px] text-muted-foreground">Last 7 Days</span>
              </div>
              <ul className="space-y-2 text-xs">
                {topRules.map((r) => (
                  <li key={r.name} className="flex items-center justify-between">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground tabular-nums">{r.value}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-3 text-xs text-indigo font-semibold hover:underline">View all alert rules</button>
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
};

export default Alerts;
