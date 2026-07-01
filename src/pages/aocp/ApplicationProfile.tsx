import { AppShell } from "@/components/eoc/AppShell";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowRight, Bot, Box, CheckCircle2,
  ChevronRight, Clock, Cloud, Code2, Database, ExternalLink,
  GitBranch, Globe, KeyRound, Layers, LayoutGrid, Link2,
  Package, Server, Settings, ShieldCheck, Sparkles, Star,
  TrendingUp, Users, Zap,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

/* ── helpers ─────────────────────────────────────── */
const sparkData = (seed: number, n = 14, base = 60, amp = 12) =>
  Array.from({ length: n }, (_, i) => ({
    v: base + Math.sin(i / 2 + seed) * amp + ((seed * 3 + i) % 5),
  }));

function Spark({ color, data }: { color: string; data: { v: number }[] }) {
  const id = `sp-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#${id})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MiniLine({ color, data }: { color: string; data: { v: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={24}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Badge({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "blue" | "violet" | "slate" }) {
  const cls = {
    green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber:  "bg-amber-50  text-amber-700  border-amber-200",
    red:    "bg-rose-50   text-rose-700   border-rose-200",
    blue:   "bg-blue-50   text-blue-700   border-blue-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    slate:  "bg-slate-50  text-slate-600  border-slate-200",
  }[tone];
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold", cls)}>{label}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl bg-card border border-border p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>;
}

/* ── KPI strip ───────────────────────────────────── */
const kpis = [
  { label: "Health Score",       value: "78",    unit: "/100", delta: "↑ 4 pts",  tone: "green",  color: "#10b981", icon: Activity },
  { label: "PA Customizations",  value: "2,847", unit: "",     delta: "↑ 12%",    tone: "blue",   color: "#3b82f6", icon: Settings },
  { label: "Open P1/P2 Tickets", value: "12",    unit: "",     delta: "↓ 3",      tone: "amber",  color: "#f59e0b", icon: AlertTriangle },
  { label: "Environments",       value: "5",     unit: "",     delta: "Stable",   tone: "slate",  color: "#64748b", icon: Layers },
  { label: "Integrations",       value: "42",    unit: "",     delta: "↑ 2",      tone: "violet", color: "#8b5cf6", icon: Link2 },
  { label: "App Users",          value: "1,248", unit: "",     delta: "↑ 8%",     tone: "green",  color: "#10b981", icon: Users },
  { label: "Uptime (30d)",       value: "99.7%", unit: "",     delta: "On target", tone: "green", color: "#10b981", icon: ShieldCheck },
  { label: "Automation Rate",    value: "83%",   unit: "",     delta: "↑ 5 pp",   tone: "blue",   color: "#3b82f6", icon: Zap },
];

/* ── Lifecycle timeline ──────────────────────────── */
const lifecycle = [
  { phase: "Build", date: "Jan 2021", status: "done" },
  { phase: "UAT",   date: "Sep 2021", status: "done" },
  { phase: "Go-Live", date: "Jan 2022", status: "done" },
  { phase: "Stable", date: "Jun 2022", status: "done" },
  { phase: "Enhancements", date: "2023–24", status: "done" },
  { phase: "Modernize", date: "2026–26", status: "active" },
  { phase: "Cloud-Native", date: "2027", status: "future" },
];

/* ── Ownership ───────────────────────────────────── */
const owners = [
  { initials: "BP", name: "Brandon Parker",   role: "Business Owner",       bg: "bg-blue-500" },
  { initials: "CS", name: "Chantel Smith",    role: "Claims Partner",       bg: "bg-violet-500" },
  { initials: "TW", name: "Tyler Wang",       role: "Technical Owner",      bg: "bg-emerald-500" },
  { initials: "DR", name: "Divya Raman",      role: "Delivery Manager",     bg: "bg-amber-500" },
  { initials: "MK", name: "Michael Kim",      role: "Support Lead",         bg: "bg-rose-500" },
  { initials: "PJ", name: "Priya Joshi",      role: "Request Manager",      bg: "bg-indigo-500" },
];

/* ── Recent changes ──────────────────────────────── */
const changes = [
  { id: "CHG-4821", desc: "PA Rule Engine upgrade v3.4",    date: "Jun 4, 2026",  status: "Completed", tone: "green" as const },
  { id: "CHG-4798", desc: "FHIR CMS API endpoint migration", date: "Jun 2, 2026",  status: "Completed", tone: "green" as const },
  { id: "CHG-4776", desc: "DB index optimization — Claims",  date: "May 29, 2026", status: "Completed", tone: "green" as const },
  { id: "CHG-4751", desc: "SSO integration — Azure AD",      date: "May 22, 2026", status: "Completed", tone: "green" as const },
  { id: "CHG-4812", desc: "EDI Clearinghouse connector v2",  date: "Jun 6, 2026",  status: "In Progress", tone: "amber" as const },
];

/* ── Key files ───────────────────────────────────── */
const files = [
  { name: "Architecture_Diagram_v4.pdf",   type: "PDF",  date: "May 30, 2026" },
  { name: "Tech_Debt_Register_2026.xlsx",  type: "XLSX", date: "May 28, 2026" },
  { name: "CMDB_Export_2026-06.csv",       type: "CSV",  date: "Jun 1, 2026"  },
];

/* ── NOVA AI suggestions ─────────────────────────── */
const novaItems = [
  { icon: AlertTriangle, color: "text-rose-500",   bg: "bg-rose-50",   text: "3 critical open tickets approaching SLA breach — review now" },
  { icon: TrendingUp,    color: "text-blue-500",   bg: "bg-blue-50",   text: "Health score trending up +4 pts this month — good momentum" },
  { icon: Zap,           color: "text-violet-500", bg: "bg-violet-50", text: "83% automation rate — 4 remaining manual workflows eligible for automation" },
  { icon: ShieldCheck,   color: "text-emerald-500",bg: "bg-emerald-50",text: "99.7% uptime over last 30 days — meeting SLA target" },
];

const navTabs = [
  { label: "Profile",       to: "#",                         active: true  },
  { label: "Environments",  to: "/aocp/claims-processing/environments" },
  { label: "Criticality",   to: "/aocp/claims-processing/criticality"  },
  { label: "Outcomes",      to: "/aocp/claims-processing/outcomes"     },
  { label: "Architecture",  to: "/aocp/claims-processing/architecture" },
  { label: "Lifecycle",     to: "/aocp/claims-processing/lifecycle"    },
  { label: "Admin Model",   to: "/aocp/claims-processing/admin"        },
];

/* ═══════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════ */
export default function ApplicationProfile() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-background">

        {/* ── Top bar ── */}
        <header className="border-b border-border bg-card px-6 h-14 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground" onClick={() => navigate("/crm")}>CRM</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="cursor-pointer hover:text-foreground">Claims Processing Platform</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">Application Profile</span>
          </div>
          <div className="flex-1" />
          {/* context strip */}
          {[
            ["Customer", "Molina Corp"],
            ["Claims Processing Platform", ""],
            ["AOCP Phase", "Discovery"],
            ["Completeness", "72%"],
            ["Last Updated", "Jun 5, 2026"],
          ].map(([k, v]) => (
            <div key={k} className="hidden xl:flex flex-col leading-tight border-l border-border pl-4">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</span>
              {v && <span className="text-[12px] font-semibold">{v}</span>}
            </div>
          ))}
          <button className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700">
            <Bot className="h-3.5 w-3.5" /> Ask NOVA
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-accent">
            <ExternalLink className="h-3.5 w-3.5" /> Export
          </button>
        </header>

        {/* ── Sub-nav tabs ── */}
        <nav className="border-b border-border bg-card px-6 flex gap-1 shrink-0">
          {navTabs.map((t) => (
            <button
              key={t.label}
              onClick={() => t.to !== "#" && navigate(t.to)}
              className={cn(
                "px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-colors",
                t.active
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* ── Main content ── */}
        <main className="flex-1 p-5 space-y-4 overflow-auto">

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            {kpis.map((k) => (
              <Card key={k.label} className="flex flex-col gap-1 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md grid place-items-center shrink-0"
                    style={{ background: `${k.color}1a`, color: k.color }}>
                    <k.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground leading-tight">{k.label}</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-[22px] font-bold leading-none">{k.value}</span>
                  {k.unit && <span className="text-[11px] text-muted-foreground mb-0.5">{k.unit}</span>}
                </div>
                <div className="-mx-1">
                  <Spark color={k.color} data={sparkData(kpis.indexOf(k))} />
                </div>
                <span className={cn("text-[10px] font-semibold",
                  k.tone === "green" ? "text-emerald-600" :
                  k.tone === "amber" ? "text-amber-600" :
                  k.tone === "red"   ? "text-rose-600" : "text-muted-foreground"
                )}>{k.delta}</span>
              </Card>
            ))}
          </div>

          {/* Row 2: App overview + Ownership + NOVA */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

            {/* App Overview */}
            <Card className="xl:col-span-4">
              <SectionTitle>Application Overview</SectionTitle>
              <div className="flex items-start gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-600 text-white grid place-items-center shrink-0">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[15px] font-bold leading-tight">Claims Processing Platform</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">Enterprise Healthcare Payer · Core Operations</div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge label="Production" tone="green" />
                    <Badge label="Tier 1 Critical" tone="red" />
                    <Badge label="Regulated" tone="amber" />
                    <Badge label="HIPAA" tone="blue" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2.5 text-[12px]">
                {[
                  ["Application Type",   "Custom Enterprise App"],
                  ["Primary Platform",   "Claims Processing"],
                  ["Vendor / Owner",     "Molina Corp (Internal)"],
                  ["Business Unit",      "Claims Operations"],
                  ["Go-Live Date",       "January 2022"],
                  ["Application ID",     "APP-2026-CPP-001"],
                  ["CMDB CI",            "CI-CPP-PROD-001"],
                  ["Hosting",            "Hybrid (AWS + On-Prem)"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="text-[10px] text-muted-foreground font-medium">{l}</div>
                    <div className="font-semibold text-[12px]">{v}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Ownership */}
            <Card className="xl:col-span-4">
              <SectionTitle>Ownership & Stakeholders</SectionTitle>
              <div className="space-y-2">
                {owners.map((o) => (
                  <div key={o.name} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                    <div className={cn("h-8 w-8 rounded-full text-white grid place-items-center text-[11px] font-bold shrink-0", o.bg)}>
                      {o.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold truncate">{o.name}</div>
                      <div className="text-[10px] text-muted-foreground">{o.role}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </Card>

            {/* NOVA AI Panel */}
            <Card className="xl:col-span-4 border-violet-200 bg-violet-50/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-violet-600 text-white grid place-items-center">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-[12px] font-bold text-violet-700">NOVA Digital Coworker</span>
                <Badge label="Active" tone="violet" />
              </div>
              <p className="text-[11px] text-violet-800 mb-3 leading-relaxed">
                Insights & Recommendations for <strong>Claims Processing Platform</strong>
              </p>
              <div className="space-y-2">
                {novaItems.map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-violet-100">
                    <div className={cn("h-6 w-6 rounded-md grid place-items-center shrink-0 mt-0.5", n.bg)}>
                      <n.icon className={cn("h-3 w-3", n.color)} />
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground">{n.text}</p>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
                <Bot className="h-3.5 w-3.5" /> Ask NOVA a Question
              </button>
            </Card>
          </div>

          {/* Row 3: Health Summary + Lifecycle + Recent Changes */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

            {/* App Health Summary */}
            <Card className="xl:col-span-4">
              <SectionTitle>Application Health Summary</SectionTitle>
              <div className="flex items-center gap-4 mb-4">
                {/* score ring */}
                <div className="relative h-20 w-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#10b981" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 32 * 0.78} ${2 * Math.PI * 32 * 0.22}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[20px] font-bold leading-none">78</span>
                    <span className="text-[9px] text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { label: "Availability",  val: 99, color: "#10b981" },
                    { label: "Performance",   val: 82, color: "#3b82f6" },
                    { label: "Security",      val: 74, color: "#f59e0b" },
                    { label: "Compliance",    val: 88, color: "#8b5cf6" },
                    { label: "Supportability",val: 71, color: "#14b8a6" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="text-[10px] w-24 text-muted-foreground">{m.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.val}%`, background: m.color }} />
                      </div>
                      <span className="text-[10px] font-semibold w-8 text-right">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* mini trend */}
              <div className="text-[10px] text-muted-foreground mb-1">Health Score — Last 6 Months</div>
              <MiniLine color="#10b981" data={[60, 63, 67, 70, 74, 78].map(v => ({ v }))} />
            </Card>

            {/* Lifecycle Timeline */}
            <Card className="xl:col-span-4">
              <SectionTitle>Lifecycle Timeline</SectionTitle>
              <div className="relative mt-2">
                {/* connector line */}
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-3">
                  {lifecycle.map((l) => (
                    <div key={l.phase} className="flex items-center gap-3 relative pl-8">
                      <div className={cn(
                        "absolute left-0 h-7 w-7 rounded-full border-2 grid place-items-center",
                        l.status === "done"   ? "bg-emerald-500 border-emerald-500 text-white" :
                        l.status === "active" ? "bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100" :
                        "bg-background border-border text-muted-foreground"
                      )}>
                        {l.status === "done"   && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {l.status === "active" && <Activity className="h-3.5 w-3.5" />}
                        {l.status === "future" && <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1">
                        <div className={cn("text-[12px] font-semibold",
                          l.status === "active" ? "text-blue-600" :
                          l.status === "future" ? "text-muted-foreground" : ""
                        )}>{l.phase}</div>
                        <div className="text-[10px] text-muted-foreground">{l.date}</div>
                      </div>
                      {l.status === "active" && <Badge label="Current" tone="blue" />}
                      {l.status === "done"   && <Badge label="Complete" tone="green" />}
                      {l.status === "future" && <Badge label="Planned" tone="slate" />}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recent Changes */}
            <Card className="xl:col-span-4">
              <div className="flex items-center justify-between mb-3">
                <SectionTitle>Recent Changes</SectionTitle>
                <button className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2">
                {changes.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                    <div className="h-6 w-6 rounded-md bg-slate-100 text-slate-600 grid place-items-center shrink-0 mt-0.5">
                      <GitBranch className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-muted-foreground">{c.id}</div>
                      <div className="text-[11px] font-semibold leading-snug">{c.desc}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{c.date}</div>
                    </div>
                    <Badge label={c.status} tone={c.tone} />
                  </div>
                ))}
              </div>

              {/* Key Files */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Related Evidence</div>
                <div className="space-y-1.5">
                  {files.map((f) => (
                    <div key={f.name} className="flex items-center gap-2 text-[11px]">
                      <div className="h-5 w-8 rounded bg-slate-100 text-slate-600 grid place-items-center text-[8px] font-bold shrink-0">{f.type}</div>
                      <span className="flex-1 truncate text-blue-600 cursor-pointer hover:underline">{f.name}</span>
                      <span className="text-muted-foreground shrink-0">{f.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Row 4: Key Metrics tiles + Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

            {/* Key Quality Indicators */}
            <Card className="xl:col-span-8">
              <SectionTitle>Key Quality Indicators</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Ticket Volume (MTD)",    value: "5,042",  sub: "↑ 4% vs last month",   color: "#3b82f6",  icon: LayoutGrid },
                  { label: "Avg Resolution Time",    value: "4.2 hrs", sub: "↓ 0.8 hrs improved",  color: "#10b981",  icon: Clock },
                  { label: "First Contact Resolution",value: "74%",   sub: "↑ 2pp vs target",      color: "#8b5cf6",  icon: CheckCircle2 },
                  { label: "CSAT Score",             value: "4.4/5",  sub: "↑ 0.2 vs last quarter",color: "#f59e0b",  icon: Star },
                  { label: "Critical Vulnerabilities",value: "12",    sub: "↓ 6 vs last month",     color: "#ef4444",  icon: AlertTriangle },
                  { label: "Patch Compliance",       value: "91%",    sub: "↑ 3pp this month",      color: "#10b981",  icon: ShieldCheck },
                  { label: "Code Coverage",          value: "68%",    sub: "Target: 80%",           color: "#f59e0b",  icon: Code2 },
                  { label: "Deployment Frequency",   value: "2/wk",   sub: "On track",              color: "#3b82f6",  icon: GitBranch },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-border p-3 bg-background/60">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-6 w-6 rounded-md grid place-items-center shrink-0"
                        style={{ background: `${m.color}1a`, color: m.color }}>
                        <m.icon className="h-3 w-3" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium leading-tight">{m.label}</span>
                    </div>
                    <div className="text-[18px] font-bold">{m.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions + Tech Tags */}
            <Card className="xl:col-span-4">
              <SectionTitle>Quick Actions</SectionTitle>
              <div className="space-y-2 mb-4">
                {[
                  { label: "Delete Application",   icon: Settings,  color: "text-slate-600",   bg: "bg-slate-50"   },
                  { label: "Vehicle Profile",       icon: Server,    color: "text-blue-600",    bg: "bg-blue-50"    },
                  { label: "Template Profile",      icon: Package,   color: "text-violet-600",  bg: "bg-violet-50"  },
                  { label: "Schedule Assessment",   icon: Clock,     color: "text-amber-600",   bg: "bg-amber-50"   },
                  { label: "Create Action Item",    icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((a) => (
                  <button key={a.label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border hover:bg-accent text-left">
                    <div className={cn("h-6 w-6 rounded-md grid place-items-center shrink-0", a.bg)}>
                      <a.icon className={cn("h-3 w-3", a.color)} />
                    </div>
                    <span className="text-[12px] font-semibold">{a.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Technology Stack</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Java 17", "Spring Boot", "Oracle DB", "React", "AWS EKS", "Kafka", "Redis", "FHIR R4", "HL7", "HIPAA"].map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-accent text-[10px] font-semibold text-muted-foreground border border-border">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

        </main>
      </div>
    </AppShell>
  );
}
