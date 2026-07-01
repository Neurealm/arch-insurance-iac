import { AppShell } from "@/components/eoc/AppShell";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, Search, ClipboardCheck, Wrench, CheckCircle2, Calendar, Bell,
  ShieldAlert, Users, KeyRound, Server, Lock, Monitor, ArrowRight, MessageCircle,
  HelpCircle, Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/useUserProfile";

/* ---------- Sparkline ---------- */
function Spark({ data, stroke, fill }: { data: number[]; stroke: string; fill: string }) {
  const w = 220, h = 38;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon fill={fill} points={`0,${h} ${pts} ${w},${h}`} />
      <polyline fill="none" stroke={stroke} strokeWidth={1.5} points={pts} />
    </svg>
  );
}

const kpis = [
  { label: "High Risk Identities", value: "78",  delta: "12", dir: "up",   Icon: ShieldAlert, iconBg: "bg-rose-100",    iconColor: "text-rose-600",   stroke: "#ef4444", fill: "#fee2e2", data: [10,12,14,11,18,16,22,19,24,22,28,24,32,28] },
  { label: "Stale Privileged Access", value: "312", delta: "28", dir: "up", Icon: Users,    iconBg: "bg-orange-100",  iconColor: "text-orange-600", stroke: "#f97316", fill: "#ffedd5", data: [40,38,42,46,44,52,50,58,56,62,60,66,64,70] },
  { label: "Excessive Privilege",  value: "146", delta: "11", dir: "up",   Icon: KeyRound,  iconBg: "bg-amber-100",   iconColor: "text-amber-600",  stroke: "#f59e0b", fill: "#fef3c7", data: [22,26,24,28,26,30,28,34,32,36,34,40,38,42] },
  { label: "Service Account Risk", value: "96",  delta: "8",  dir: "down", Icon: Server,    iconBg: "bg-violet-100",  iconColor: "text-violet-600", stroke: "#8b5cf6", fill: "#ede9fe", data: [32,30,34,28,30,26,28,24,26,22,24,20,22,18] },
  { label: "Vaulting Gaps",        value: "43",  delta: "6",  dir: "down", Icon: Lock,      iconBg: "bg-sky-100",     iconColor: "text-sky-600",    stroke: "#0ea5e9", fill: "#e0f2fe", data: [18,20,16,18,14,16,12,14,10,12,9,11,8,10] },
  { label: "Local Accounts",       value: "129", delta: "14", dir: "down", Icon: Monitor,   iconBg: "bg-emerald-100", iconColor: "text-emerald-600",stroke: "#10b981", fill: "#d1fae5", data: [40,38,40,36,34,32,34,30,28,30,26,24,22,20] },
];

const riskByCategory = [
  { name: "Stale Privileged Access", value: 312, pct: "39%", color: "#ef4444" },
  { name: "Excessive Privilege",     value: 146, pct: "18%", color: "#f59e0b" },
  { name: "Local Accounts",          value: 129, pct: "16%", color: "#10b981" },
  { name: "Service Account Risk",    value: 96,  pct: "12%", color: "#14b8a6" },
  { name: "Non-SSO Platforms",       value: 67,  pct: "8%",  color: "#8b5cf6" },
  { name: "Vaulting Gaps",           value: 43,  pct: "5%",  color: "#94a3b8" },
];

const trend = [
  { d: "Apr 21", total: 920, stale: 360, excessive: 180, local: 180, service: 110, vault: 60 },
  { d: "Apr 28", total: 880, stale: 340, excessive: 170, local: 160, service: 100, vault: 55 },
  { d: "May 5",  total: 860, stale: 330, excessive: 165, local: 150, service:  98, vault: 52 },
  { d: "May 12", total: 840, stale: 325, excessive: 160, local: 140, service:  96, vault: 48 },
  { d: "May 19", total: 820, stale: 318, excessive: 152, local: 134, service:  96, vault: 45 },
  { d: "May 26", total: 804, stale: 312, excessive: 146, local: 129, service:  96, vault: 43 },
];

const riskyIdentities = [
  { initials: "JS", name: "jsmith",       score: 92, top: "Stale Access",       color: "bg-rose-500" },
  { initials: "AD", name: "adm_svc_app01", score: 90, top: "Service Account",   color: "bg-orange-500" },
  { initials: "BW", name: "bwayne",        score: 85, top: "Excessive Privilege",color: "bg-amber-500" },
  { initials: "MK", name: "mking",         score: 78, top: "Stale Access",       color: "bg-violet-500" },
  { initials: "DB", name: "db_admin",      score: 72, top: "Local Account",      color: "bg-sky-500" },
];

const priorities = [
  { p: "P1", text: "Remove stale privileged access",   count: 312, color: "bg-rose-500" },
  { p: "P1", text: "Reduce service account risk",      count: 96,  color: "bg-rose-500" },
  { p: "P2", text: "Eliminate local admin accounts",   count: 129, color: "bg-amber-500" },
  { p: "P2", text: "Address vaulting gaps",            count: 43,  color: "bg-amber-500" },
  { p: "P3", text: "Migrate non-SSO platforms",        count: 67,  color: "bg-sky-500" },
];

const remediation = [
  { name: "Automated",        value: 132, pct: "62%", color: "#10b981" },
  { name: "Manual",           value: 62,  pct: "29%", color: "#f59e0b" },
  { name: "Pending Approval", value: 20,  pct: "9%",  color: "#94a3b8" },
];

const recentActivity = [
  { msg: "Removed stale admin access for jsmith",            t: "10:18 AM", color: "text-emerald-600" },
  { msg: "Disabled 3 unused local accounts",                 t: "10:07 AM", color: "text-emerald-600" },
  { msg: "Service account adm_svc_app01 recertified",        t: "09:54 AM", color: "text-sky-600" },
  { msg: "Vaulting gap closed for 2 systems",                t: "09:31 AM", color: "text-violet-600" },
  { msg: "Excessive privilege removed for bwayne",           t: "09:12 AM", color: "text-amber-600" },
];

const sources = [
  { name: "CyberArk",    initials: "CA", bg: "bg-blue-500" },
  { name: "Entra ID",    initials: "EI", bg: "bg-sky-500" },
  { name: "Axonius",     initials: "AX", bg: "bg-slate-700" },
  { name: "Wiz",         initials: "WIZ", bg: "bg-indigo-600" },
  { name: "ServiceNow",  initials: "SN", bg: "bg-emerald-600" },
  { name: "CMDB",        initials: "DB", bg: "bg-slate-500" },
];

/* ---------- Small UI bits ---------- */
const Section = ({ title, action, children, className = "" }: any) => (
  <section className={cn("bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)]", className)}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[13px] font-bold text-foreground">{title}</h3>
      {action && <button className="text-[11px] font-semibold text-indigo-600 inline-flex items-center gap-1 hover:gap-1.5 transition-all">{action} <ArrowRight className="h-3 w-3" /></button>}
    </div>
    {children}
  </section>
);

export default function PrivilegedAccessDashboard() {
  const nav = useNavigate();
  const { initials, displayName } = useUserProfile();
  return (
    <AppShell>
      <div className="min-h-full bg-slate-50/60 p-5">
        {/* ---------- Header ---------- */}
        <header className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] mb-4">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 grid place-items-center shrink-0 ring-1 ring-indigo-200/60">
              <ShieldCheck className="h-7 w-7 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-bold tracking-tight text-foreground leading-tight">Privileged Access / Identity Hygiene Agent</h1>
              <p className="text-[13px] font-semibold text-indigo-600 mt-0.5">Reduce Privileged Access Risk. Strengthen Identity Hygiene.</p>
              <p className="text-xs text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Continuously discovers and correlates identity and access data to find excessive, stale, or risky privileged access and identity hygiene issues — then drives automated remediation with full auditability.
              </p>
            </div>
            <div className="hidden lg:grid grid-cols-4 gap-3 max-w-xl">
              {[
                { Icon: Search,         color: "text-rose-600",    bg: "bg-rose-50",    title: "Discover",  sub: "Continuously finds risky access" },
                { Icon: ClipboardCheck, color: "text-indigo-600",  bg: "bg-indigo-50",  title: "Assess",    sub: "Scores risk using context & behavior" },
                { Icon: Wrench,         color: "text-amber-600",   bg: "bg-amber-50",   title: "Remediate", sub: "Automates removals & recertifications" },
                { Icon: CheckCircle2,   color: "text-emerald-600", bg: "bg-emerald-50", title: "Assure",    sub: "Tracks hygiene & proves compliance" },
              ].map((s) => (
                <div key={s.title} className="text-center">
                  <div className={cn("h-9 w-9 rounded-lg grid place-items-center mx-auto", s.bg, s.color)}>
                    <s.Icon className="h-4 w-4" />
                  </div>
                  <div className={cn("text-[11px] font-bold mt-1.5", s.color)}>{s.title}</div>
                  <div className="text-[9.5px] text-muted-foreground leading-tight mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
                </div>
                <div className="text-[10px] text-muted-foreground">Updated: 10:24 AM</div>
              </div>
              <div className="h-9 px-3 rounded-lg border border-border bg-card flex items-center gap-2 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> May 20, 2026
              </div>
              <button className="relative h-9 w-9 rounded-lg border border-border grid place-items-center">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[9px] text-white font-bold grid place-items-center">2</span>
              </button>
              <div className="h-9 w-9 rounded-full bg-indigo-600 grid place-items-center text-white text-[11px] font-bold" title={displayName}>{initials}</div>
            </div>
          </div>
        </header>

        {/* ---------- KPI strip + Agent Status ---------- */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-12 xl:col-span-9 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="bg-card rounded-xl border border-border p-3 shadow-[var(--shadow-sm)]">
                <div className="flex items-center gap-2">
                  <div className={cn("h-7 w-7 rounded-md grid place-items-center", k.iconBg, k.iconColor)}>
                    <k.Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-[10.5px] font-semibold text-muted-foreground leading-tight">{k.label}</div>
                </div>
                <div className="mt-2 flex items-end gap-1.5">
                  <div className="text-[24px] font-bold leading-none">{k.value}</div>
                  <div className={cn("text-[10px] font-bold pb-0.5", k.dir === "up" ? "text-rose-600" : "text-emerald-600")}>{k.dir === "up" ? "↑" : "↓"} {k.delta}</div>
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">vs yesterday</div>
                <div className="-mx-1 mt-1"><Spark data={k.data} stroke={k.stroke} fill={k.fill} /></div>
              </div>
            ))}
          </div>

          <div className="col-span-12 xl:col-span-3 bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold">Agent Status</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">Healthy</span>
            </div>
            <dl className="text-[11.5px] space-y-2">
              {[
                ["Status",        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operational</span>],
                ["Last Run",      <b>10:24 AM</b>],
                ["Next Run",      <b>11:00 AM</b>],
                ["Data Sources",  <b className="text-emerald-600">7 / 7 Connected</b>],
                ["Open Actions",  <b>164</b>],
                ["Automation",    <b className="text-emerald-600">Enabled</b>],
              ].map(([k, v], i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/60 pb-1.5 last:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd>{v as any}</dd>
                </div>
              ))}
            </dl>
            <button className="mt-3 text-[11px] font-semibold text-indigo-600 inline-flex items-center gap-1">View agent details <ArrowRight className="h-3 w-3" /></button>
          </div>
        </div>

        {/* ---------- Risk row ---------- */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {/* Donut */}
          <Section title="Risk by Category" action="View full risk analysis" className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
                <PieChart width={180} height={180}>
                  <Pie data={riskByCategory} dataKey="value" cx={90} cy={90} innerRadius={55} outerRadius={82} paddingAngle={1}>
                    {riskByCategory.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold">804</div>
                    <div className="text-[10px] text-muted-foreground">Total Risks</div>
                  </div>
                </div>
              </div>
              <ul className="flex-1 space-y-1.5 text-[11px]">
                {riskByCategory.map((r) => (
                  <li key={r.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: r.color }} /> <span className="text-foreground/80">{r.name}</span></span>
                    <span><b>{r.value}</b> <span className="text-muted-foreground">({r.pct})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* Trend */}
          <Section title="Risk Trend (Last 30 Days)" action="View trends & forecasts" className="col-span-12 lg:col-span-5">
            <div style={{ height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={trend} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                  <Line type="monotone" dataKey="total"     name="Total Risk"        stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="stale"     name="Stale Access"      stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="excessive" name="Excessive Privilege" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="local"     name="Local Accounts"    stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="service"   name="Service Accounts"  stroke="#14b8a6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="vault"     name="Vaulting Gaps"     stroke="#94a3b8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Top Risky Identities */}
          <Section title="Top Risky Identities" action="View all risky identities" className="col-span-12 lg:col-span-3">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase grid grid-cols-[1fr_auto_auto] gap-2 pb-1.5 border-b border-border">
              <span>Identity</span><span>Score</span><span>Top Risk</span>
            </div>
            <ul className="text-[11px]">
              {riskyIdentities.map((i) => (
                <li key={i.name} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center py-1.5 border-b border-border/60 last:border-0">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className={cn("h-5 w-5 rounded-full grid place-items-center text-[8.5px] font-bold text-white shrink-0", i.color)}>{i.initials}</span>
                    <span className="font-semibold truncate">{i.name}</span>
                  </span>
                  <span className="font-bold text-amber-600">{i.score}</span>
                  <span className="text-muted-foreground">{i.top}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* ---------- Priorities + Outcomes + Remediation + Savings ---------- */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <Section title="Top Priorities" action="View all priorities" className="col-span-12 lg:col-span-3">
            <ol className="space-y-2 text-[11.5px]">
              {priorities.map((p, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground w-3">{i + 1}</span>
                  <span className={cn("text-[9.5px] font-bold px-1.5 py-0.5 rounded-md text-white", p.color)}>{p.p}</span>
                  <span className="flex-1 truncate">{p.text}</span>
                  <b>{p.count}</b>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Business Outcomes" action="View outcome report" className="col-span-12 lg:col-span-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                { Icon: ShieldAlert,   color: "text-rose-600",    label: "Reduce Risk",        value: "804",  sub: "Total Risks Identified", delta: "↑ 15% vs last 30 days", deltaColor: "text-emerald-600" },
                { Icon: Lock,          color: "text-indigo-600",  label: "Harden Access",      value: "68%",  sub: "High Risk Remediated",   delta: "↑ 11% vs last 30 days", deltaColor: "text-emerald-600" },
                { Icon: CheckCircle2,  color: "text-emerald-600", label: "Improve Hygiene",    value: "92%",  sub: "Access Reviewed",        delta: "↑ 8% vs last 30 days",  deltaColor: "text-emerald-600" },
                { Icon: ClipboardCheck,color: "text-violet-600",  label: "Stay Compliant",     value: "100%", sub: "Audit Readiness",        delta: "No open critical findings", deltaColor: "text-muted-foreground" },
              ].map((o) => (
                <div key={o.label} className="text-center">
                  <o.Icon className={cn("h-4 w-4 mx-auto", o.color)} />
                  <div className="text-[10.5px] font-semibold text-muted-foreground mt-1">{o.label}</div>
                  <div className={cn("text-xl font-bold mt-0.5", o.color)}>{o.value}</div>
                  <div className="text-[9.5px] text-muted-foreground leading-tight">{o.sub}</div>
                  <div className={cn("text-[9px] font-semibold mt-1", o.deltaColor)}>{o.delta}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Remediation Activity (Last 7 Days)" action="View remediation center" className="col-span-12 lg:col-span-2">
            <div className="relative" style={{ height: 130 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={remediation} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={1}>
                    {remediation.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-lg font-bold leading-none">214</div>
                  <div className="text-[9px] text-muted-foreground">Actions</div>
                </div>
              </div>
            </div>
            <ul className="space-y-1 text-[10.5px] mt-1">
              {remediation.map((r) => (
                <li key={r.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: r.color }} /> {r.name}</span>
                  <span><b>{r.value}</b> <span className="text-muted-foreground">({r.pct})</span></span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Automation Savings (Last 30 Days)" action="View savings report" className="col-span-12 lg:col-span-3">
            <ul className="space-y-2.5 text-[12px]">
              {[
                { Icon: Sparkles,     color: "text-emerald-600", bg: "bg-emerald-50", label: "Actions Automated", value: "412" },
                { Icon: Calendar,     color: "text-indigo-600",  bg: "bg-indigo-50",  label: "Hours Saved",       value: "186" },
                { Icon: CheckCircle2, color: "text-violet-600",  bg: "bg-violet-50",  label: "Cost Avoidance",    value: "$24.6K" },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 border-b border-border/60 pb-2 last:border-0">
                  <div className={cn("h-8 w-8 rounded-lg grid place-items-center", r.bg, r.color)}>
                    <r.Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-muted-foreground">{r.label}</div>
                  <div className={cn("font-bold", r.color)}>{r.value}</div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* ---------- Recent Activity + Connected Sources ---------- */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <Section title="Recent Activity" action="View all" className="col-span-12 lg:col-span-8">
            <ul className="text-[11.5px]">
              {recentActivity.map((a, i) => (
                <li key={i} className="flex items-center gap-2 py-2 border-b border-border/60 last:border-0">
                  <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", a.color)} />
                  <span className="flex-1">{a.msg}</span>
                  <span className="text-muted-foreground text-[10.5px]">{a.t}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Connected Sources" action="All Healthy" className="col-span-12 lg:col-span-4">
            <div className="grid grid-cols-6 gap-2">
              {sources.map((s) => (
                <div key={s.name} className="text-center">
                  <div className={cn("h-9 w-9 rounded-lg grid place-items-center mx-auto text-white text-[10px] font-bold", s.bg)}>{s.initials}</div>
                  <div className="text-[9.5px] font-semibold mt-1 truncate">{s.name}</div>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mx-auto mt-0.5" />
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ---------- Footer info ---------- */}
        <div className="grid grid-cols-12 gap-4">
          <Section title="What this Agent Does" className="col-span-12 lg:col-span-5">
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              Finds and remediates identity and privileged access risks by correlating data from
              identity providers, PAM, SaaS, Cloud, and CMDB — reducing your attack surface
              and strengthening your security posture.
            </p>
          </Section>

          <Section title="How it Works" className="col-span-12 lg:col-span-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { Icon: Search,         label: "Discover",  sub: "Collect & correlate",  color: "text-rose-600",    bg: "bg-rose-50" },
                { Icon: ClipboardCheck, label: "Assess",    sub: "Score & prioritize",   color: "text-indigo-600",  bg: "bg-indigo-50" },
                { Icon: Wrench,         label: "Remediate", sub: "Automate & assign",    color: "text-amber-600",   bg: "bg-amber-50" },
                { Icon: CheckCircle2,   label: "Monitor",   sub: "Validate & report",    color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((s) => (
                <div key={s.label}>
                  <div className={cn("h-8 w-8 rounded-lg grid place-items-center mx-auto", s.bg, s.color)}>
                    <s.Icon className="h-4 w-4" />
                  </div>
                  <div className={cn("text-[10.5px] font-bold mt-1", s.color)}>{s.label}</div>
                  <div className="text-[9px] text-muted-foreground">{s.sub}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Need Help?" className="col-span-12 lg:col-span-3">
            <p className="text-[11.5px] text-muted-foreground mb-2">Ask the Digital Co-Worker</p>
            <button className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-semibold inline-flex items-center justify-center gap-2">
              <MessageCircle className="h-3.5 w-3.5" /> Ask a Question
            </button>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}