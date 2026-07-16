import { AppShell } from "@/components/eoc/AppShell";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  ChevronRight, Bell, HelpCircle, RefreshCw, User, Zap, CheckCircle2, Cpu,
  LayoutDashboard, AlertOctagon, ListChecks, Users, Gauge, BookOpen, BarChart3,
  Sparkles, PhoneCall, CalendarClock, CalendarRange, Boxes, UserPlus, Settings, Plug,
  Search, ArrowUp, ArrowDown, MessageSquare, FileText, Play,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { cn } from "@/lib/utils";

/* ---------------- Left navigation ---------------- */
const navSections: {
  heading: string;
  items: { key: string; label: string; icon: any; badge?: string }[];
}[] = [
  {
    heading: "Service Desk",
    items: [
      { key: "manager", label: "Manager Overview", icon: LayoutDashboard },
      { key: "incident", label: "Incident Console", icon: AlertOctagon },
      { key: "queue", label: "Ticket Queue", icon: ListChecks },
      { key: "team", label: "My Team", icon: Users },
      { key: "sla", label: "SLAs & KPIs", icon: Gauge },
      { key: "kb", label: "Knowledge Base", icon: BookOpen },
      { key: "reports", label: "Reports", icon: BarChart3 },
      { key: "auto", label: "Auto Categorization", icon: Sparkles, badge: "AI" },
    ],
  },
  {
    heading: "Operational Tools",
    items: [
      { key: "major", label: "Major Incidents", icon: AlertOctagon },
      { key: "esc", label: "Escalations", icon: ArrowUp },
      { key: "cal", label: "Change Calendar", icon: CalendarRange },
      { key: "oncall", label: "On-Call Schedule", icon: CalendarClock },
    ],
  },
  {
    heading: "Configuration",
    items: [
      { key: "biz", label: "Business Services", icon: Boxes },
      { key: "assign", label: "Assignments", icon: UserPlus },
      { key: "rules", label: "Categorization Rules", icon: Settings },
      { key: "integ", label: "Integrations", icon: Plug },
    ],
  },
];

/* ---------------- Seed data ---------------- */
const kpis = [
  { id: "new", label: "New Tickets", suffix: "(Today)", value: "342", delta: "12%", up: true, sub: "vs yesterday (305)", spark: [280, 295, 310, 290, 305, 320, 342] },
  { id: "auto", label: "Auto-Categorized", suffix: "", value: "294", ring: 86, sub: "vs total tickets", tone: "emerald" as const },
  { id: "manual", label: "Manual Review", suffix: "", value: "48", ring: 14, sub: "Requires agent review", tone: "amber" as const },
  { id: "time", label: "Avg. Categorization Time", suffix: "", value: "2.3", unit: "sec", delta: "18%", up: false, sub: "vs last 7 days (2.8s)" },
  { id: "acc", label: "Categorization Accuracy", suffix: "", value: "94.7", unit: "%", delta: "3.6%", up: true, sub: "vs last 7 days (91.1%)" },
  { id: "res", label: "Tickets Resolved", suffix: "(Today)", value: "218", delta: "9%", up: true, sub: "vs yesterday (200)", spark: [180, 190, 205, 195, 208, 212, 218] },
];

const queueTabs = ["All Queues", "High Priority", "Unassigned", "AI Review", "Escalated"] as const;

const tickets: {
  id: string; desc: string; priority: "High" | "Medium" | "Low";
  category: string; status: "Auto-Categorized" | "Manual Review"; wait: string; agent: string;
}[] = [
  { id: "INC0012358", desc: "VPN connection dropping", priority: "High", category: "Network / VPN", status: "Auto-Categorized", wait: "00:02:14", agent: "Unassigned" },
  { id: "INC0012359", desc: "Email not syncing on mobile", priority: "Medium", category: "Email / Collaboration", status: "Auto-Categorized", wait: "00:03:45", agent: "Unassigned" },
  { id: "INC0012360", desc: "Cannot access shared drive", priority: "High", category: "Access / Permissions", status: "Manual Review", wait: "00:05:22", agent: "—" },
  { id: "INC0012361", desc: "Printer not responding", priority: "Low", category: "Hardware / Printing", status: "Auto-Categorized", wait: "00:06:11", agent: "Unassigned" },
  { id: "INC0012362", desc: "Application error on login", priority: "High", category: "Software / Applications", status: "Manual Review", wait: "00:07:33", agent: "—" },
  { id: "INC0012363", desc: "Request for software access", priority: "Medium", category: "Access / Permissions", status: "Auto-Categorized", wait: "00:08:41", agent: "Unassigned" },
  { id: "INC0012364", desc: "Slow performance on portal", priority: "Low", category: "Performance / System", status: "Auto-Categorized", wait: "00:09:18", agent: "Unassigned" },
  { id: "INC0012365", desc: "Teams unable to join meeting", priority: "Medium", category: "Collaboration / Teams", status: "Auto-Categorized", wait: "00:11:02", agent: "Unassigned" },
];

const perfSeries = [
  { d: "Jun 3", accuracy: 91, time: 2.9 },
  { d: "Jun 4", accuracy: 92, time: 2.8 },
  { d: "Jun 5", accuracy: 93, time: 2.6 },
  { d: "Jun 6", accuracy: 92, time: 2.7 },
  { d: "Jun 7", accuracy: 94, time: 2.4 },
  { d: "Jun 8", accuracy: 94, time: 2.3 },
  { d: "Jun 9", accuracy: 95, time: 2.3 },
];

const catData = [
  { name: "Network / VPN", value: 5338, pct: "28.6%", color: "#4f46e5" },
  { name: "Email / Collaboration", value: 4221, pct: "22.4%", color: "#22c55e" },
  { name: "Access / Permissions", value: 3353, pct: "17.8%", color: "#f59e0b" },
  { name: "Hardware / Devices", value: 2280, pct: "12.1%", color: "#0ea5e9" },
  { name: "Software / Applications", value: 1941, pct: "10.3%", color: "#a855f7" },
  { name: "Other", value: 1659, pct: "8.8%", color: "#94a3b8" },
];

const slaAtRisk = [
  { id: "INC0012340", pri: "P1", time: "00:14:22", label: "Network Outage" },
  { id: "INC0012345", pri: "P2", time: "00:18:47", label: "Email Down" },
  { id: "INC0012351", pri: "P2", time: "00:22:13", label: "VPN Critical" },
];

const manualReview = [
  { id: "INC0012360", desc: "Cannot access shared drive", pri: "High" },
  { id: "INC0012362", desc: "Application error on login", pri: "High" },
  { id: "INC0012375", desc: "Multiple issues reported", pri: "Medium" },
  { id: "INC0012380", desc: "Unclear description", pri: "Medium" },
  { id: "INC0012385", desc: "Access request urgent", pri: "High" },
];

const agents = [
  { name: "Jessica Miller", status: "Online", assigned: 18, resolved: 22, handle: "00:18:32" },
  { name: "Michael Chen", status: "Online", assigned: 21, resolved: 25, handle: "00:16:47" },
  { name: "Priya Patel", status: "Online", assigned: 16, resolved: 19, handle: "00:21:15" },
  { name: "David Johnson", status: "Away", assigned: 12, resolved: 15, handle: "00:19:41" },
  { name: "Sarah Williams", status: "Online", assigned: 17, resolved: 20, handle: "00:17:58" },
];

const confidenceBuckets = [
  { name: "0-20%", value: 312 },
  { name: "21-40%", value: 842 },
  { name: "41-60%", value: 1926 },
  { name: "61-80%", value: 5743 },
  { name: "81-100%", value: 10019 },
];

const alerts = [
  { time: "10:21 AM", title: "AI Model Performance Degraded", body: "Accuracy below 90% for 15 min", tone: "warning" as const },
  { time: "10:15 AM", title: "High Ticket Volume Detected", body: "156 tickets in queue", tone: "info" as const },
  { time: "10:05 AM", title: "Integration: Email System", body: "Connection restored", tone: "resolved" as const },
  { time: "09:58 AM", title: "SLA Breach Alert", body: "12 breaches in last 15 min", tone: "critical" as const },
];

/* ---------------- Small building blocks ---------------- */
function Sparkline({ data, color = "#4f46e5" }: { data: number[]; color?: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={`sk-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sk-${color})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RingPct({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} stroke="#e2e8f0" strokeWidth="5" fill="none" />
      <circle
        cx="28" cy="28" r={r} stroke={color} strokeWidth="5" fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">{pct}%</text>
    </svg>
  );
}

function PriBadge({ p }: { p: string }) {
  const cls = p === "High" || p === "P1"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : p === "Medium" || p === "P2"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-50 text-slate-700 border-slate-200";
  return <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", cls)}>{p}</span>;
}

function StatusPill({ s }: { s: "Auto-Categorized" | "Manual Review" }) {
  return s === "Auto-Categorized"
    ? <span className="rounded border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">Auto-Categorized</span>
    : <span className="rounded border border-amber-200 bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">Manual Review</span>;
}

/* ---------------- Page ---------------- */
export default function AutoTicketCategorization() {
  const [activeNav, setActiveNav] = useState("auto");
  const [queueTab, setQueueTab] = useState<typeof queueTabs[number]>("All Queues");
  const [tenant, setTenant] = useState("Meridian University");
  const navigate = useNavigate();

  const filteredTickets = useMemo(() => {
    if (queueTab === "High Priority") return tickets.filter((t) => t.priority === "High");
    if (queueTab === "Unassigned") return tickets.filter((t) => t.agent === "Unassigned" || t.agent === "—");
    if (queueTab === "AI Review") return tickets.filter((t) => t.status === "Manual Review");
    if (queueTab === "Escalated") return tickets.slice(0, 2);
    return tickets;
  }, [queueTab]);

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
                        <button
                          onClick={() => setActiveNav(it.key)}
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
                        </button>
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
            <button className="mt-3 w-full h-7 rounded border border-slate-200 text-[11px] font-medium hover:bg-slate-50">View All Queues</button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 min-w-0">
              <Link to="/itsm" className="hover:text-indigo">Service Desk Operations</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-900 font-semibold truncate">Auto Ticket Categorization</span>
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
                <span className="absolute -top-1 -right-1 h-4 w-4 grid place-items-center rounded-full bg-rose-500 text-white text-[9px] font-bold">0</span>
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

          {/* Header row */}
          <div className="px-6 pt-5 pb-3 flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Service Desk Manager View</h1>
              <p className="text-[12px] text-slate-500 mt-0.5">Real-time operational view of incoming tickets and AI categorization performance</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 h-7 text-[11px] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Auto Categorization: ON
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo/20 bg-indigo/5 text-indigo px-3 h-7 text-[11px] font-semibold">
                <Sparkles className="h-3 w-3" /> AI Model: Categorizer v2.3
              </span>
              <button className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 h-7 text-[11px] font-semibold hover:bg-slate-50">
                <BarChart3 className="h-3 w-3" /> Model Performance
              </button>
              <span className="text-[11px] text-slate-500 ml-1">Last Updated: 10:24:18 AM</span>
              <button className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 h-7 text-[11px] font-semibold hover:bg-slate-50">
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpis.map((k) => (
              <div key={k.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[11px] text-slate-500 font-medium">
                  {k.label} {k.suffix && <span className="text-slate-400">{k.suffix}</span>}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[26px] font-bold leading-none text-slate-900">{k.value}</span>
                    {k.unit && <span className="text-[13px] font-semibold text-slate-500">{k.unit}</span>}
                  </div>
                  {k.delta && (
                    <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold", k.up ? "text-emerald-600" : "text-emerald-600")}>
                      {k.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {k.delta}
                    </span>
                  )}
                  {k.ring !== undefined && (
                    <div className="ml-auto"><RingPct pct={k.ring} color={k.tone === "amber" ? "#f59e0b" : "#10b981"} /></div>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-slate-500">{k.sub}</div>
                {k.spark && <Sparkline data={k.spark} color={k.id === "res" ? "#10b981" : "#4f46e5"} />}
              </div>
            ))}
          </div>

          {/* Main grid: Queue + Perf/Pie + SLA panel */}
          <div className="px-6 pb-4 grid grid-cols-12 gap-4">
            {/* Live Ticket Queue */}
            <div className="col-span-12 xl:col-span-6 rounded-lg border border-slate-200 bg-white">
              <div className="px-4 pt-3 pb-2 border-b border-slate-100">
                <div className="text-[13px] font-semibold text-slate-900">Live Ticket Queue</div>
                <div className="mt-2 flex items-center gap-4 text-[11px]">
                  {queueTabs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setQueueTab(t)}
                      className={cn(
                        "pb-1.5 -mb-px border-b-2 font-medium transition-colors",
                        queueTab === t ? "border-indigo text-indigo" : "border-transparent text-slate-500 hover:text-slate-900"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Ticket #</th>
                      <th className="px-3 py-2 font-semibold">Short Description</th>
                      <th className="px-3 py-2 font-semibold">Priority</th>
                      <th className="px-3 py-2 font-semibold">Predicted Category</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Wait Time</th>
                      <th className="px-3 py-2 font-semibold">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 cursor-pointer">
                        <td className="px-3 py-2 font-mono text-slate-700">{t.id}</td>
                        <td className="px-3 py-2 text-slate-800">{t.desc}</td>
                        <td className="px-3 py-2"><PriBadge p={t.priority} /></td>
                        <td className="px-3 py-2 text-slate-700">{t.category}</td>
                        <td className="px-3 py-2"><StatusPill s={t.status} /></td>
                        <td className="px-3 py-2 font-mono text-slate-600">{t.wait}</td>
                        <td className="px-3 py-2 text-slate-500">{t.agent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-slate-100">
                <button className="text-[11px] font-semibold text-indigo hover:underline">View all 156 tickets in queue →</button>
              </div>
            </div>

            {/* Center: Perf + Top Categories */}
            <div className="col-span-12 xl:col-span-4 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[13px] font-semibold text-slate-900">AI Categorization Performance <span className="text-slate-400 font-normal text-[11px]">(Last 7 Days)</span></div>
                <div className="h-[190px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={perfSeries} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                      <XAxis dataKey="d" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis yAxisId="a" stroke="#64748b" fontSize={10} tickLine={false} domain={[60, 100]} unit="%" width={36} />
                      <YAxis yAxisId="b" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} unit="s" width={30} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                      <Line yAxisId="a" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                      <Line yAxisId="b" type="monotone" dataKey="time" name="Avg. Categorization Time (sec)" stroke="#4f46e5" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-600">
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-emerald-500" /> Accuracy %</span>
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-indigo" /> Avg. Categorization Time (sec)</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[13px] font-semibold text-slate-900">Top Predicted Categories <span className="text-slate-400 font-normal text-[11px]">(30 Days)</span></div>
                <div className="grid grid-cols-5 gap-3 mt-2 items-center">
                  <div className="col-span-2 h-[160px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={catData} dataKey="value" innerRadius={45} outerRadius={65} paddingAngle={2} stroke="none">
                          {catData.map((d) => <Cell key={d.name} fill={d.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 grid place-items-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-[15px] font-bold text-slate-900">18,842</div>
                        <div className="text-[9px] text-slate-500">Total Tickets</div>
                      </div>
                    </div>
                  </div>
                  <ul className="col-span-3 text-[11px] space-y-1">
                    {catData.map((c) => (
                      <li key={c.name} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="flex-1 text-slate-700 truncate">{c.name}</span>
                        <span className="font-semibold text-slate-900">{c.pct}</span>
                        <span className="text-slate-400 font-mono w-14 text-right">({c.value.toLocaleString()})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: SLA + Manual Review */}
            <div className="col-span-12 xl:col-span-2 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-slate-900">SLAs at Risk</div>
                  <button className="text-[10px] font-semibold text-indigo hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="rounded border border-rose-200 bg-rose-50 py-2 text-center">
                    <div className="text-[18px] font-bold text-rose-600 leading-none">12</div>
                    <div className="text-[9px] text-rose-700 mt-1">Breached</div>
                    <div className="text-[8px] text-rose-500">(P1/P2)</div>
                  </div>
                  <div className="rounded border border-amber-200 bg-amber-50 py-2 text-center">
                    <div className="text-[18px] font-bold text-amber-600 leading-none">27</div>
                    <div className="text-[9px] text-amber-700 mt-1">At Risk</div>
                    <div className="text-[8px] text-amber-500">(P3)</div>
                  </div>
                  <div className="rounded border border-orange-200 bg-orange-50 py-2 text-center">
                    <div className="text-[18px] font-bold text-orange-600 leading-none">41</div>
                    <div className="text-[9px] text-orange-700 mt-1">Warning</div>
                    <div className="text-[8px] text-orange-500">(P4)</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Upcoming Breaches</div>
                  <ul className="space-y-1.5 text-[10px]">
                    {slaAtRisk.map((s) => (
                      <li key={s.id} className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-700 truncate">{s.id}</span>
                        <PriBadge p={s.pri} />
                        <span className="font-mono text-rose-600 ml-auto">{s.time}</span>
                      </li>
                    ))}
                    {slaAtRisk.map((s) => (
                      <li key={s.id + "b"} className="text-slate-500 truncate">{s.label}</li>
                    )).slice(0, 0)}
                  </ul>
                  <button className="mt-2 text-[10px] font-semibold text-indigo hover:underline">View all SLA dashboard →</button>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-slate-900">Manual Review Queue</div>
                  <button className="text-[10px] font-semibold text-indigo hover:underline">View All</button>
                </div>
                <ul className="mt-2 space-y-1.5 text-[10px]">
                  {manualReview.map((m) => (
                    <li key={m.id} className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-700">{m.id}</span>
                      <span className="flex-1 text-slate-600 truncate">{m.desc}</span>
                      <PriBadge p={m.pri} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom row: Agents + Confidence + Alerts + Quick Actions */}
          <div className="px-6 pb-6 grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-4 rounded-lg border border-slate-200 bg-white">
              <div className="px-4 pt-3 pb-2 text-[13px] font-semibold text-slate-900">Agent Workload <span className="text-slate-400 font-normal text-[11px]">(Today)</span></div>
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Agent</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold text-right">Assigned</th>
                    <th className="px-3 py-2 font-semibold text-right">Resolved</th>
                    <th className="px-3 py-2 font-semibold text-right">Avg Handle Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.map((a) => (
                    <tr key={a.name} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-indigo/10 text-indigo grid place-items-center text-[9px] font-bold">
                            {a.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          {a.name}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-semibold",
                          a.status === "Online" ? "text-emerald-600" : "text-slate-500"
                        )}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", a.status === "Online" ? "bg-emerald-500" : "bg-slate-400")} />
                          {a.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-700">{a.assigned}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-700">{a.resolved}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-600">{a.handle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 border-t border-slate-100">
                <button className="text-[11px] font-semibold text-indigo hover:underline">View full team performance</button>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-[13px] font-semibold text-slate-900">Categorization Confidence Distribution <span className="text-slate-400 font-normal text-[11px]">(30 Days)</span></div>
              <div className="h-[220px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceBuckets} margin={{ top: 20, right: 8, left: 0, bottom: 20 }}>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} label={{ value: "Confidence Score", position: "bottom", fontSize: 10, fill: "#64748b" }} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={40} label={{ value: "Tickets", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} cursor={{ fill: "#f8fafc" }} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                      {confidenceBuckets.map((_, i) => (
                        <Cell key={i} fill={i === 4 ? "#4f46e5" : i === 3 ? "#6366f1" : "#a5b4fc"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-slate-900">Recent System Alerts</div>
                </div>
                <ul className="mt-2 space-y-2">
                  {alerts.map((a, i) => {
                    const tone =
                      a.tone === "critical" ? "bg-rose-500" :
                      a.tone === "warning" ? "bg-amber-500" :
                      a.tone === "resolved" ? "bg-emerald-500" : "bg-sky-500";
                    const chip =
                      a.tone === "critical" ? "bg-rose-50 text-rose-700 border-rose-200" :
                      a.tone === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      a.tone === "resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      "bg-sky-50 text-sky-700 border-sky-200";
                    const label =
                      a.tone === "critical" ? "Critical" :
                      a.tone === "warning" ? "Warning" :
                      a.tone === "resolved" ? "Resolved" : "Info";
                    return (
                      <li key={i} className="flex items-start gap-2 text-[11px]">
                        <span className={cn("mt-1 h-1.5 w-1.5 rounded-full shrink-0", tone)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono text-[10px]">{a.time}</span>
                            <span className="font-semibold text-slate-900 truncate">{a.title}</span>
                          </div>
                          <div className="text-slate-500 text-[10px] truncate">{a.body}</div>
                        </div>
                        <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold", chip)}>{label}</span>
                      </li>
                    );
                  })}
                </ul>
                <button className="mt-2 text-[11px] font-semibold text-indigo hover:underline">View all system alerts</button>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[13px] font-semibold text-slate-900">Quick Actions</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-semibold">
                  <button className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><AlertOctagon className="h-3.5 w-3.5" /> Create Major Incident</button>
                  <button className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><MessageSquare className="h-3.5 w-3.5" /> Broadcast Message</button>
                  <button className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><UserPlus className="h-3.5 w-3.5" /> Reassign Tickets</button>
                  <button className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><BookOpen className="h-3.5 w-3.5" /> Update Knowledge</button>
                  <button className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><FileText className="h-3.5 w-3.5" /> Run Report</button>
                  <button className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><Settings className="h-3.5 w-3.5" /> Configure Rules</button>
                </div>
                <button className="mt-2 text-[11px] font-semibold text-indigo hover:underline">Manager Tools & Settings</button>
              </div>
            </div>
          </div>

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
