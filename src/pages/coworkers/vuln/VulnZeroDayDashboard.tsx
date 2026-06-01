import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Bug, Shield, AlertTriangle, Crosshair, CheckCircle2, Clock, ShieldAlert,
  Home, Database, Users, FileText, ShieldOff, BarChart3, Settings as Cog,
  HelpCircle, Calendar, Bell, ChevronRight, ArrowLeft, Sparkles, Activity,
  Plug, MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------- tiny sparkline -------- */
function Spark({ data, color, fill }: { data: number[]; color: string; fill?: string }) {
  const w = 180, h = 36, max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <polygon fill={fill} points={`0,${h} ${pts} ${w},${h}`} />}
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
    </svg>
  );
}

const up = [10,14,12,18,16,22,20,26,24,30,28,34];
const down = [34,30,32,26,28,22,24,18,20,14,16,10];
const wave = [14,18,12,22,16,24,18,26,20,28,22,30];

/* -------- KPI card -------- */
function Kpi({
  Icon, iconBg, iconColor, label, value, delta, deltaDir, sub, sparkColor, sparkFill, data,
}: any) {
  return (
    <div className="bg-card rounded-xl border border-border p-3.5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2">
        <div className={cn("h-7 w-7 rounded-md grid place-items-center", iconBg, iconColor)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
        {delta && (
          <div className={cn("text-[11px] font-semibold", deltaDir === "up" ? "text-rose-600" : "text-emerald-600")}>
            {deltaDir === "up" ? "↑" : "↓"} {delta}
          </div>
        )}
      </div>
      <div className="mt-2"><Spark data={data} color={sparkColor} fill={sparkFill} /></div>
      <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

/* -------- Donut -------- */
function Donut() {
  const seg = [
    { v: 20, c: "#ef4444", label: "Zero-Day Actively Exploited", count: "38 (20%)" },
    { v: 32, c: "#f59e0b", label: "Known Exploited (KEV)", count: "62 (32%)" },
    { v: 28, c: "#eab308", label: "High Severity (Not KEV)", count: "54 (28%)" },
    { v: 20, c: "#22c55e", label: "Medium / Low", count: "40 (20%)" },
  ];
  let acc = 0;
  const R = 42, C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="14" />
          {seg.map((s, i) => {
            const len = (s.v / 100) * C;
            const el = (
              <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={s.c} strokeWidth="14"
                strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} />
            );
            acc += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xl font-bold">194</div>
            <div className="text-[9px] text-muted-foreground">Total<br/>Critical + High</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 text-[11px]">
        {seg.map(s => (
          <div key={s.label} className="flex items-start gap-2">
            <span className="h-2 w-2 rounded-full mt-1 shrink-0" style={{ background: s.c }} />
            <div className="flex-1">
              <div className="font-semibold leading-tight">{s.label}</div>
              <div className="text-muted-foreground">{s.count}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------- Sidebar -------- */
const sideNav = [
  { icon: Home, label: "Overview", active: true },
  { icon: ShieldOff, label: "Exposures" },
  { icon: Database, label: "Assets" },
  { icon: Users, label: "Actions" },
  { icon: ShieldAlert, label: "Exceptions" },
  { icon: FileText, label: "Reports" },
  { icon: Plug, label: "Integrations" },
  { icon: Cog, label: "Settings" },
];

function HeatCell({ n, tone }: { n: number; tone: "crit" | "high" | "med" | "low" }) {
  const map = {
    crit: "bg-rose-100 text-rose-700",
    high: "bg-orange-100 text-orange-700",
    med:  "bg-amber-100 text-amber-700",
    low:  "bg-emerald-100 text-emerald-700",
  } as const;
  return <div className={cn("h-9 grid place-items-center rounded-md text-sm font-bold", map[tone])}>{n}</div>;
}

const heatRows: { svc: string; vals: [number, number, number, number] }[] = [
  { svc: "Customer Portal",   vals: [12, 28, 14, 3] },
  { svc: "Payment Processing",vals: [15, 35, 21, 5] },
  { svc: "Identity & Access", vals: [6, 18, 16, 4] },
  { svc: "Data Platform",     vals: [3, 9, 17, 6] },
  { svc: "Employee Services", vals: [2, 7, 12, 9] },
  { svc: "Corporate Systems", vals: [0, 2, 7, 12] },
];

const topVulns = [
  ["CVE-2025-31324", "Critical", 287, "up"],
  ["CVE-2025-29927", "Critical", 198, "up"],
  ["CVE-2025-27363", "High", 176, "up"],
  ["CVE-2025-24983", "High", 142, "down"],
  ["CVE-2025-22457", "High", 118, "down"],
] as const;

const workflow = [
  { n: 1, label: "Detect & Ingest",     value: "194", sub: "New exposures", pct: 100, color: "bg-violet-500" },
  { n: 2, label: "Correlate & Enrich",  value: "194", sub: "Correlated",    pct: 100, color: "bg-blue-500" },
  { n: 3, label: "Prioritize",          value: "156", sub: "High / Critical", pct: 80, color: "bg-orange-500" },
  { n: 4, label: "Assign & Act",        value: "98",  sub: "In Progress",   pct: 50, color: "bg-emerald-500" },
  { n: 5, label: "Remediate & Validate",value: "312", sub: "Remediated (7D)", pct: 100, color: "bg-emerald-600" },
  { n: 6, label: "Exception Mgmt",      value: "22",  sub: "Under Review",  pct: 30, color: "bg-violet-600" },
];

export default function VulnZeroDayDashboard() {
  const nav = useNavigate();
  return (
    <AppShell>
      <div className="min-h-full bg-slate-50/60">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-start gap-3">
              <button onClick={() => nav(-1)} className="h-9 w-9 rounded-lg border border-border grid place-items-center bg-card hover:bg-secondary/60">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="h-11 w-11 rounded-xl bg-violet-100 grid place-items-center text-violet-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight">Digital Co-Worker</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[15px] font-semibold text-violet-700">Vulnerability / Zero-Day Response Coordination</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">Mythos Use Case</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="font-semibold text-foreground">Operational</div>
                  <div className="text-muted-foreground text-[10px]">Updated: 10:24 AM</div>
                </div>
              </div>
              <button className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-semibold flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> May 20, 2025
              </button>
              <button className="relative h-9 w-9 rounded-lg border border-border bg-card grid place-items-center">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">9</span>
              </button>
              <div className="h-9 w-9 rounded-full bg-slate-200 grid place-items-center text-xs font-bold text-slate-700">RB</div>
            </div>
          </div>

          {/* Top row: What this Does + Current Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mb-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-xl bg-violet-600 grid place-items-center text-white shrink-0">
                  <Bug className="h-10 w-10" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold mb-1">What this Digital Co-Worker Does</div>
                  <p className="text-xs text-foreground/80 leading-snug">
                    Continuously monitors threat intelligence and security signals to coordinate zero-day and vulnerability
                    responses. It correlates data from Axonius, Wiz, CyberArk, ServiceNow, and CMDB to prioritize exposed
                    assets, identify owners, recommend remediation actions, and track exceptions — accelerating risk
                    reduction and keeping your business resilient.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-[360px] shrink-0">
                  {[
                    { Icon: Sparkles, t: "Proactive", d: "Detects and prioritizes exposures early", c: "text-blue-600" },
                    { Icon: Activity, t: "Coordinated", d: "Aligns people, process, & platforms", c: "text-violet-600" },
                    { Icon: BarChart3, t: "Actionable", d: "Clear next steps and owner assignments", c: "text-orange-600" },
                    { Icon: CheckCircle2, t: "Auditable", d: "Full traceability and exception tracking", c: "text-emerald-600" },
                  ].map(p => (
                    <div key={p.t} className="rounded-lg border border-border p-2">
                      <div className={cn("flex items-center gap-1.5 text-[11px] font-bold", p.c)}>
                        <p.Icon className="h-3.5 w-3.5" /> {p.t}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{p.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-sm font-bold text-violet-700">
                  <Crosshair className="h-4 w-4" /> Current Focus
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white">P1</span>
              </div>
              <div className="text-sm font-bold mt-1">Active Zero-Day: CVE-2025-31324</div>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                Actively exploited vulnerability in edge devices. Immediate action required.
              </p>
              <div className="mt-3 space-y-1.5 text-[11px]">
                <Row label="Impacted Assets" value="287" />
                <Row label="Criticality" value={<span className="text-rose-600 font-bold">Critical</span>} />
                <Row label="First Seen" value="May 19, 2025 08:42 AM" />
                <Row label="Status" value={<span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 text-[10px] font-bold">In Progress</span>} />
              </div>
              <button className="text-[11px] font-semibold text-violet-700 mt-3 inline-flex items-center gap-1">
                View incident details <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
            <Kpi Icon={ShieldAlert} iconBg="bg-rose-50" iconColor="text-rose-600" label="Critical Exposures" value="38" delta="12" deltaDir="up" sub="vs yesterday" sparkColor="#ef4444" sparkFill="#fee2e2" data={up} />
            <Kpi Icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-600" label="High Exposures" value="156" delta="8" deltaDir="up" sub="vs yesterday" sparkColor="#f97316" sparkFill="#ffedd5" data={wave} />
            <Kpi Icon={Crosshair} iconBg="bg-blue-50" iconColor="text-blue-600" label="Assets at Risk" value="1,247" delta="93" deltaDir="down" sub="vs yesterday" sparkColor="#3b82f6" sparkFill="#dbeafe" data={down} />
            <Kpi Icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Remediated (7D)" value="312" delta="25%" deltaDir="up" sub="vs last 7 days" sparkColor="#10b981" sparkFill="#d1fae5" data={up} />
            <Kpi Icon={Clock} iconBg="bg-violet-50" iconColor="text-violet-600" label="MTTR (Critical)" value="4.2 hrs" delta="1.3 hrs" deltaDir="down" sub="vs last 7 days" sparkColor="#8b5cf6" sparkFill="#ede9fe" data={down} />
            <Kpi Icon={Shield} iconBg="bg-slate-100" iconColor="text-slate-600" label="Exceptions" value="22" delta="3" deltaDir="down" sub="vs yesterday" sparkColor="#64748b" sparkFill="#e2e8f0" data={wave} />
          </div>

          {/* Middle: heat map / donut / top vulns / priorities */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_320px] gap-3 mb-4">
            {/* Heat map */}
            <section className="bg-card rounded-xl border border-border p-4">
              <div className="text-sm font-bold mb-2">Exposure Risk Heat Map <span className="text-[10px] font-normal text-muted-foreground">(by Business Service)</span></div>
              <div className="grid grid-cols-[1fr_repeat(4,minmax(0,1fr))] gap-1.5 text-[10px]">
                <div></div>
                <div className="text-center font-semibold text-muted-foreground">Critical</div>
                <div className="text-center font-semibold text-muted-foreground">High</div>
                <div className="text-center font-semibold text-muted-foreground">Medium</div>
                <div className="text-center font-semibold text-muted-foreground">Low</div>
                {heatRows.map(r => (
                  <Fragment key={r.svc}>
                    <div className="text-[11px] font-medium flex items-center">{r.svc}</div>
                    <HeatCell n={r.vals[0]} tone="crit" />
                    <HeatCell n={r.vals[1]} tone="high" />
                    <HeatCell n={r.vals[2]} tone="med" />
                    <HeatCell n={r.vals[3]} tone="low" />
                  </Fragment>
                ))}
              </div>
              <button className="text-[11px] font-semibold text-violet-700 mt-3 inline-flex items-center gap-1">View all services <ChevronRight className="h-3 w-3" /></button>
            </section>

            {/* Donut */}
            <section className="bg-card rounded-xl border border-border p-4">
              <div className="text-sm font-bold mb-3">Exposure Breakdown</div>
              <Donut />
              <button className="text-[11px] font-semibold text-violet-700 mt-3 inline-flex items-center gap-1">View all exposures <ChevronRight className="h-3 w-3" /></button>
            </section>

            {/* Top vulns */}
            <section className="bg-card rounded-xl border border-border p-4">
              <div className="text-sm font-bold mb-3">Top Vulnerabilities</div>
              <div className="text-[10px] font-semibold text-muted-foreground grid grid-cols-[1fr_60px_60px_30px] gap-2 pb-1 border-b border-border">
                <span>CVE</span><span>Severity</span><span className="text-right">Impacted</span><span className="text-right">Trend</span>
              </div>
              {topVulns.map(([cve, sev, n, dir]) => (
                <div key={cve} className="grid grid-cols-[1fr_60px_60px_30px] gap-2 items-center py-2 border-b border-border last:border-0 text-[11px]">
                  <span className="font-mono font-semibold">{cve}</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded w-fit",
                    sev === "Critical" ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700"
                  )}>{sev}</span>
                  <span className="text-right font-semibold">{n}</span>
                  <span className={cn("text-right", dir === "up" ? "text-rose-600" : "text-emerald-600")}>
                    {dir === "up" ? "↗" : "↘"}
                  </span>
                </div>
              ))}
              <button className="text-[11px] font-semibold text-violet-700 mt-3 inline-flex items-center gap-1">View all vulnerabilities <ChevronRight className="h-3 w-3" /></button>
            </section>

            {/* Priorities + Recent Activity */}
            <section className="space-y-3">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="text-sm font-bold mb-2">Top Priorities <span className="text-[10px] font-normal text-muted-foreground">(Next 24-48 hrs)</span></div>
                <div className="space-y-2 text-[11px]">
                  {[
                    { p: "P1", c: "bg-rose-500", t: "Remediate CVE-2025-31324 on 287 assets" },
                    { p: "P2", c: "bg-orange-500", t: "Review 22 exception requests" },
                    { p: "P3", c: "bg-amber-500", t: "Remediate high exposures in Payment Processing service" },
                  ].map((x, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground w-3">{i + 1}</span>
                      <span className={cn("text-[9px] font-bold text-white px-1.5 py-0.5 rounded shrink-0", x.c)}>{x.p}</span>
                      <span className="leading-snug">{x.t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold">Recent Activity</div>
                  <button className="text-[10px] font-semibold text-violet-700">View all</button>
                </div>
                <div className="space-y-2 text-[11px]">
                  {[
                    ["Exception approved for 10.0.1.25", "10:12 AM"],
                    ["Patch deployed on 56 assets", "09:58 AM"],
                    ["New CVE-2025-29927 detected", "09:41 AM"],
                    ["Owner assigned for 34 assets", "09:23 AM"],
                  ].map(([t, time]) => (
                    <div key={t} className="flex justify-between gap-2">
                      <span className="leading-snug">{t}</span>
                      <span className="text-muted-foreground text-[10px] shrink-0">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Bottom: Workflow + integrations / sources */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 mb-4">
            <section className="bg-card rounded-xl border border-border p-4">
              <div className="text-sm font-bold mb-3">Response Workflow</div>
              <div className="grid grid-cols-6 gap-2">
                {workflow.map((s, i) => (
                  <div key={s.n} className="relative">
                    <div className="text-[10px] font-bold text-muted-foreground">{s.n}. {s.label}</div>
                    <div className="text-xl font-bold mt-1">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.sub}</div>
                    <div className="h-1 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%` }} />
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{s.pct}%</div>
                    {i < workflow.length - 1 && (
                      <ChevronRight className="absolute -right-2 top-3 h-4 w-4 text-muted-foreground/50" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold">Connected Integrations</div>
                <span className="text-[10px] font-bold text-emerald-600">All Healthy</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                {["Axonius","Wiz","CyberArk","ServiceNow","CMDB"].map(n => (
                  <div key={n}>
                    <div className="h-10 rounded-lg bg-secondary/60 border border-border grid place-items-center text-[10px] font-bold">{n.slice(0,4)}</div>
                    <div className="flex items-center justify-center gap-1 mt-1 text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {n}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Footer row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-card rounded-xl border border-border p-3 flex items-start gap-2">
              <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 grid place-items-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[12px] font-bold">AI Insight</div>
                <div className="text-[11px] text-muted-foreground leading-snug">
                  Concentrate on CVE-2025-31324 and related asset groups. Remediating these will reduce your critical exposure by an estimated 42%.
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-bold">Need Help?</div>
                <div className="text-[10px] text-muted-foreground">Ask the Digital Co-Worker</div>
              </div>
              <button className="text-[11px] font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg">Ask a Question</button>
            </div>
            <div className="bg-card rounded-xl border border-border p-3">
              <div className="text-[12px] font-bold mb-1.5">Sources</div>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {["Axonius","Wiz","CyberArk","ServiceNow","CMDB"].map(s => (
                  <span key={s} className="px-2 py-1 rounded-md bg-secondary/60 border border-border font-semibold">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}