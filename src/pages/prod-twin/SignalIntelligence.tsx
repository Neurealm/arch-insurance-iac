import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Info, Filter, RefreshCw, ChevronRight, Activity, ShieldCheck, AlertTriangle,
  TrendingUp, TrendingDown, Bot, Clock, Users, Zap, Database, Cloud, GitBranch,
  FileText, Bell, ArrowRight, Eye, Gauge, Boxes, Sparkles, CheckCircle2,
  CircleAlert, Globe, Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Status = "healthy" | "watch" | "risk" | "critical";
const statusCfg: Record<Status, { dot: string; chip: string; label: string }> = {
  healthy:  { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Healthy" },
  watch:    { dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",       label: "Watch" },
  risk:     { dot: "bg-orange-500",  chip: "bg-orange-50 text-orange-700 border-orange-200",    label: "At Risk" },
  critical: { dot: "bg-rose-500",    chip: "bg-rose-50 text-rose-700 border-rose-200",          label: "Critical" },
};

type Drawer = { title: string; subtitle?: string; kind: string; data?: any } | null;

const KPIS = [
  { id: "aq",   label: "Alert Quality Score",  value: "82", suffix: "/100", sub: "Good",          hint: "+6 pts vs 30 days",  icon: Gauge,        accent: "text-emerald-600" },
  { id: "nr",   label: "Noise Reduction (30d)",value: "68%",                sub: "Good",          hint: "+14% vs prior",      icon: TrendingDown, accent: "text-emerald-600" },
  { id: "mttd", label: "MTTD (Signal)",        value: "3m 12s",             sub: "Good",          hint: "-38s vs prior",      icon: Clock,        accent: "text-blue-600" },
  { id: "mttr", label: "MTTR (All Incidents)", value: "47m",                sub: "Good",          hint: "-9m vs 7 days",      icon: Activity,     accent: "text-blue-600" },
  { id: "slo",  label: "SLO Compliance",       value: "95.6%",              sub: "Good",          hint: "+2.1% vs prior",     icon: ShieldCheck,  accent: "text-emerald-600" },
  { id: "inc",  label: "Active Incidents",     value: "5",                  sub: "2 SEV1 · 1 SEV2 · 2 SEV3", hint: "Live",   icon: AlertTriangle,accent: "text-rose-600" },
  { id: "cust", label: "Impacted Customers",   value: "3,210",              sub: "Across 4 states", hint: "EVV delay scope",  icon: Users,        accent: "text-orange-600" },
];

const SIGNAL_SOURCES = [
  { id: "ds", name: "Datadog",          sub: "Metrics, Logs, Traces",    vol: "12.4M metrics / day", icon: Activity,  status: "healthy" as Status },
  { id: "up", name: "Uptrends",         sub: "Synthetic Monitoring",      vol: "24 checks · 9 ckts / min", icon: Eye, status: "healthy" as Status },
  { id: "cw", name: "AWS CloudWatch",   sub: "Metrics & Events",          vol: "8.7K metrics / min · 3.2K events", icon: Cloud, status: "healthy" as Status },
  { id: "gm", name: "GCP Cloud Monitoring", sub: "Metrics & Events",      vol: "3.2K metrics / min · 2.1 GB / min", icon: Cloud, status: "healthy" as Status },
  { id: "lg", name: "Logs (Cloud)",     sub: "Centralized Logging",       vol: "2.1 GB/min · scan 1h ago", icon: FileText, status: "healthy" as Status },
  { id: "ci", name: "CI/CD (GitHub Actions)", sub: "Pipelines & Deploys", vol: "28 workflows / day · 312 jobs", icon: GitBranch, status: "healthy" as Status },
  { id: "tr", name: "Distributed Traces", sub: "OpenTelemetry",           vol: "4.6M spans / hr",      icon: Boxes, status: "watch" as Status },
  { id: "vu", name: "Vulnerability Scanner", sub: "CNAPP / Wiz",          vol: "1.2K findings / day",  icon: ShieldCheck, status: "watch" as Status },
];

const GOLDEN = [
  { name: "Latency (p95)",        val: "420 ms",  status: "healthy" as Status, color: "stroke-violet-500" },
  { name: "Traffic (RPS)",        val: "2.84K",   status: "healthy" as Status, color: "stroke-blue-500" },
  { name: "Errors (Rate)",        val: "0.38%",   status: "healthy" as Status, color: "stroke-rose-500" },
  { name: "Saturation (CPU)",     val: "52%",     status: "healthy" as Status, color: "stroke-amber-500" },
  { name: "EVV Sync Success",     val: "98.12%",  status: "risk"    as Status, color: "stroke-emerald-500" },
  { name: "DB Health (SQL Shard 2)", val: "Degraded", status: "watch" as Status, color: "stroke-orange-500" },
  { name: "Queue Depth (Claims)", val: "1,842",   status: "watch"   as Status, color: "stroke-purple-500" },
  { name: "Batch Completion",     val: "97.4%",   status: "healthy" as Status, color: "stroke-teal-500" },
];

const CORRELATION = [
  { id: "c1", label: "Alert",            value: "EVV Sync Success below SLO", meta: "8% burn in 30m · 09:42 AM", icon: AlertTriangle, tone: "rose"  as const },
  { id: "c2", label: "Service",          value: "Caregiver Mobile / EVV",     meta: "Service ID: svc-evv · Owner Sarah Johnson", icon: Server, tone: "blue" as const, tag: "Business Critical" },
  { id: "c3", label: "Dependency",       value: "SQL Server Shard 2",         meta: "Write Latency High · p95 680ms", icon: Database, tone: "amber" as const, tag: "Degraded" },
  { id: "c4", label: "Product Line",     value: "HHA Enterprise",             meta: "Region: East · Shards 6",        icon: Boxes,    tone: "indigo" as const },
  { id: "c5", label: "Business Workflow",value: "Caregiver Visit / EVV",      meta: "Impacted · 3,210 caregivers",     icon: Users,    tone: "orange" as const, tag: "At Risk" },
];
const toneCfg = {
  rose:   "border-rose-200 bg-rose-50/60",
  blue:   "border-blue-200 bg-blue-50/60",
  amber:  "border-amber-200 bg-amber-50/60",
  indigo: "border-indigo-200 bg-indigo-50/60",
  orange: "border-orange-200 bg-orange-50/60",
} as const;

const ROUTING = [
  { svc: "Caregiver Mobile / EVV", team: "EVV Platform",   esc: "SRE Pod A",      oncall: "S. Johnson", sla: "15m" },
  { svc: "Claims Processing",      team: "Claims Platform", esc: "Data Engineering", oncall: "A. Patel", sla: "15m" },
  { svc: "Payroll Processing",     team: "Payroll Platform",esc: "Finance Eng",    oncall: "L. Romero",  sla: "30m" },
  { svc: "PHI Protection",         team: "Security Eng",   esc: "CISO Office",    oncall: "K. Yamada",  sla: "10m" },
  { svc: "Data Platform",          team: "Data Pod",       esc: "Platform SRE",   oncall: "M. Singh",   sla: "15m" },
];

const RUNBOOK_BUCKETS = [
  { id: "manual", label: "Manual",       count: 128, share: 24, color: "bg-slate-400" },
  { id: "auto",   label: "Automated",    count: 176, share: 33, color: "bg-blue-500" },
  { id: "ai",     label: "AI Assisted",  count:  96, share: 18, color: "bg-violet-500" },
  { id: "self",   label: "Self Healing", count: 112, share: 21, color: "bg-emerald-500" },
];

const POSTMORTEMS = [
  { inc: "INC-48291", sev: "SEV1", date: "May 16", root: "DB failover gap",       action: "Pre-failover health gate",  rb: "Updated", auto: "Yes",      owner: "Data Pod",       status: "Completed" },
  { inc: "INC-47632", sev: "SEV2", date: "May 13", root: "Memory leak",           action: "Heap profile in CI",        rb: "Updated", auto: "Yes",      owner: "Claims Pod",     status: "Completed" },
  { inc: "INC-47611", sev: "SEV2", date: "May 10", root: "Deploy config error",   action: "Patch Orchestrator",        rb: "Updated", auto: "Yes",      owner: "Platform Eng",   status: "Completed" },
  { inc: "INC-47102", sev: "SEV3", date: "May 8",  root: "Third-party API timeout", action: "Adaptive rate limiter",   rb: "Updated", auto: "Partial",  owner: "Integrations",   status: "Completed" },
  { inc: "INC-46891", sev: "SEV3", date: "May 6",  root: "Certificate expiry",    action: "Cert auto-renew",           rb: "Updated", auto: "Yes",      owner: "Security Eng",   status: "Completed" },
];

const TOIL = [
  { task: "Manual User Provisioning", root: "No automation",          freq: "Weekly",    hpm: 28, cand: "IAM Automation",    saved: 22 },
  { task: "Alert Noise Review",       root: "Poor alerts / thresholds", freq: "Daily",   hpm: 36, cand: "Alert Tuning + SLO", saved: 24 },
  { task: "Patch Compliance Check",   root: "Manual validation",      freq: "Bi-weekly", hpm: 20, cand: "Patch Orchestrator", saved: 17 },
  { task: "DB Backup Validation",     root: "Script gaps",            freq: "Weekly",    hpm: 22, cand: "Backup Verifier",    saved: 16 },
  { task: "Log Collection Review",    root: "Manual review",          freq: "Weekly",    hpm: 18, cand: "Log Pipeline Audit", saved: 14 },
];

const REVIEWS = [
  { name: "Weekly SRE Review",          when: "Every Tuesday 10:00 AM ET", tag: "On Track" },
  { name: "Monthly Reliability Review", when: "Next: May 27, 2025",        tag: "On Track" },
  { name: "QBR / Leadership Review",    when: "Next: Jun 10, 2025",        tag: "Scheduled" },
  { name: "Board Readout",              when: "Next: Jun 24, 2025",        tag: "Scheduled" },
];

const AI_RECS = [
  { id: "a1", title: "Enable adaptive concurrency", sub: "For EVV API to reduce retry storms.",        cta: "Review",   icon: Sparkles },
  { id: "a2", title: "Right-size 23 EC2 instances", sub: "Est. $12.4K monthly savings.",                cta: "Approve",  icon: TrendingDown },
  { id: "a3", title: "Automate backup verification", sub: "Implement Backup Verifier runbook.",         cta: "Implement",icon: Bot },
  { id: "a4", title: "Tune alerts for Claims Batch", sub: "Reduce noise by 42%.",                       cta: "Review",   icon: Bell },
];

// Sparkline generator
function spark(points: number, seed = 1) {
  let s = seed;
  return Array.from({ length: points }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    return 50 + (s / 233280) * 40 - 20 + Math.sin(i / 2 + seed) * 8;
  });
}

function Sparkline({ data, className, area = true }: { data: number[]; className?: string; area?: boolean }) {
  const w = 100, h = 36;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / Math.max(0.0001, max - min)) * (h - 4) - 2;
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const fill = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-9 w-full", className)}>
      {area && <path d={fill} className="fill-current opacity-10" />}
      <path d={path} fill="none" strokeWidth={1.5} className="stroke-current" />
    </svg>
  );
}

export default function SignalIntelligence() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [search, setSearch] = useState("");
  const open = (d: Drawer) => setDrawer(d);

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50/60 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Client Production Resilience Operating System</div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">From NOC Screen Watching to SRE Signal Intelligence</h1>
              <Info className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-0.5 text-xs text-slate-500">Service-level observability, intelligent correlation, and automated routing to the right team.</div>
          </div>
          <div className="flex items-center gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services, dashboards, owners…" className="h-9 w-72" />
            <Select defaultValue="Last 30 minutes">
              <SelectTrigger className="h-9 w-[170px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Last 15 minutes","Last 30 minutes","Last 1 hour","Last 24 hours","Last 7 days","Last 30 days","Last 90 days"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select defaultValue="Compare: 24 hours prior">
              <SelectTrigger className="h-9 w-[200px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{["Compare: 1 hour prior","Compare: 24 hours prior","Compare: 7 days prior","Compare: 30 days prior"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 border-blue-200 bg-blue-50 text-blue-700"><Filter className="h-3.5 w-3.5" /> Filters (2)</Button>
            <Button variant="ghost" size="icon" className="h-9 w-9"><RefreshCw className="h-4 w-4 text-slate-500" /></Button>
          </div>
        </div>

        {/* KPI row */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {KPIS.map((k, i) => {
              const Icon = k.icon;
              return (
                <button key={k.id} onClick={() => open({ kind: "kpi", title: k.label, subtitle: k.sub, data: k })}
                  className="group rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className={cn("rounded-md bg-slate-50 p-1.5", k.accent)}><Icon className="h-4 w-4" /></div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">Live</div>
                  </div>
                  <div className="mt-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">{k.label}</div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-2xl font-semibold tabular-nums text-slate-900">{k.value}</div>
                    {k.suffix && <div className="text-[11px] text-slate-500">{k.suffix}</div>}
                    <div className="ml-auto text-[11px] text-emerald-600">{k.sub}</div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{k.hint}</span>
                    <div className="ml-auto h-5 w-16 text-emerald-500"><Sparkline data={spark(20, i + 3)} /></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4">
          {/* Center */}
          <div className="col-span-12 space-y-4 xl:col-span-9">
            {/* Pipeline */}
            <Card title="Signal Intelligence Pipeline" sub="From raw signal to corrective action — no NOC, no screen watching.">
              <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
                {["Signal Source","Correlation Engine","Service Context","Dependency","Product","Workflow","Ownership Routing","Incident Intelligence","Corrective Action"].map((s, i, arr) => (
                  <div key={s} className="flex items-center">
                    <button onClick={() => open({ kind: "pipeline", title: s, subtitle: "Pipeline stage", data: s })}
                      className="min-w-[120px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs shadow-sm hover:border-blue-300 hover:bg-blue-50/60">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">Stage {i + 1}</div>
                      <div className="font-medium text-slate-800">{s}</div>
                    </button>
                    {i < arr.length - 1 && <ArrowRight className="mx-1 h-3.5 w-3.5 shrink-0 text-slate-400" />}
                  </div>
                ))}
              </div>
            </Card>

            {/* Signal Sources + Golden Signals + Alert Quality */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-4">
                <Card title="1. Signal Sources" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all sources →</Button>}>
                  <div className="divide-y divide-slate-100">
                    {SIGNAL_SOURCES.map(s => {
                      const Icon = s.icon;
                      return (
                        <button key={s.id} onClick={() => open({ kind: "source", title: s.name, subtitle: s.sub, data: s })}
                          className="flex w-full items-center gap-3 py-2 text-left hover:bg-slate-50/60">
                          <div className="rounded-md bg-slate-100 p-1.5 text-slate-600"><Icon className="h-4 w-4" /></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{s.name}</div>
                            <div className="text-[11px] text-slate-500">{s.sub}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-slate-600">{s.vol}</div>
                            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px]", statusCfg[s.status].chip)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg[s.status].dot)} />{statusCfg[s.status].label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>

              <div className="col-span-12 xl:col-span-5">
                <Card title="2. Golden Signals" sub="Service Aggregate" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all →</Button>}>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {GOLDEN.map((g, i) => (
                      <button key={g.name} onClick={() => open({ kind: "metric", title: g.name, subtitle: g.val, data: g })}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-blue-300 hover:bg-blue-50/40">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-medium text-slate-500">{g.name}</div>
                          <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg[g.status].dot)} />
                        </div>
                        <div className="text-sm font-semibold tabular-nums text-slate-900">{g.val}</div>
                        <div className={cn("h-8", g.color, "text-slate-400")}>
                          <Sparkline data={spark(24, i + 7)} />
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="col-span-12 xl:col-span-3">
                <Card title="3. Alert Quality Score" sub="30 days">
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24">
                      <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="82 100" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-semibold tabular-nums">82</div>
                        <div className="text-[10px] text-emerald-600">Good</div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[
                        { l: "Precision (Useful / Total)",  v: 86, c: "bg-blue-500" },
                        { l: "Recall (Detected / Actual)",  v: 78, c: "bg-indigo-500" },
                        { l: "Detection Time (Avg)",        v: 72, c: "bg-violet-500", val: "3m 12s" },
                        { l: "Noise Ratio (Non-actionable)",v: 18, c: "bg-amber-500", val: "18%", inv: true },
                      ].map(r => (
                        <div key={r.l}>
                          <div className="flex justify-between text-[10px] text-slate-500"><span>{r.l}</span><span className="font-medium text-slate-700">{(r as any).val ?? `${r.v}%`}</span></div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full", r.c)} style={{ width: `${r.v}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => open({ kind: "quality", title: "Alert Quality Trends", subtitle: "Last 30 days" })}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-50/60">
                    Alert quality trends <ChevronRight className="h-3 w-3" />
                  </button>
                </Card>
              </div>
            </div>

            {/* Correlation Engine */}
            <Card title="4. Correlation Engine" sub="Live Example — alert traced to business workflow"
              actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View full dependency map →</Button>}>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                {CORRELATION.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="flex items-center gap-1">
                      <button onClick={() => open({ kind: "node", title: n.value, subtitle: n.label, data: n })}
                        className={cn("flex-1 rounded-lg border p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow", toneCfg[n.tone])}>
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          <Icon className="h-3 w-3" /> {n.label}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{n.value}</div>
                        <div className="mt-0.5 text-[11px] text-slate-600">{n.meta}</div>
                        {n.tag && <Badge variant="outline" className="mt-1.5 border-rose-200 bg-white text-[10px] text-rose-700">{n.tag}</Badge>}
                      </button>
                      {i < CORRELATION.length - 1 && <ArrowRight className="hidden h-3 w-3 shrink-0 text-slate-400 md:block" />}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Routing + Runbook Maturity */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-7">
                <Card title="5. Service-Level Routing" sub="Alerts route to accountable teams, not a NOC queue.">
                  <div className="divide-y divide-slate-100">
                    {ROUTING.map(r => (
                      <button key={r.svc} onClick={() => open({ kind: "route", title: r.svc, subtitle: `${r.team} · SLA ${r.sla}`, data: r })}
                        className="grid w-full grid-cols-12 items-center gap-2 py-2 text-left hover:bg-slate-50/60">
                        <div className="col-span-4 flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <div>
                            <div className="text-sm font-medium">{r.svc}</div>
                            <div className="text-[11px] text-slate-500">SRE Team: {r.team} · Primary Channel: #{r.team.toLowerCase().replace(/[^a-z]/g,"-")}-alerts</div>
                          </div>
                        </div>
                        <div className="col-span-3 text-[12px] text-slate-600"><span className="text-[10px] uppercase tracking-wider text-slate-400">Escalation</span><div>{r.esc}</div></div>
                        <div className="col-span-3 text-[12px] text-slate-600"><span className="text-[10px] uppercase tracking-wider text-slate-400">On-call</span><div>{r.oncall}</div></div>
                        <div className="col-span-2 text-right"><Badge variant="outline" className="border-blue-200 bg-blue-50 text-[11px] text-blue-700">SLA: {r.sla}</Badge></div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="col-span-12 xl:col-span-5">
                <Card title="7. Runbook Maturity" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all runbooks →</Button>}>
                  <div className="grid grid-cols-4 gap-2">
                    {RUNBOOK_BUCKETS.map(b => (
                      <button key={b.id} onClick={() => open({ kind: "runbook", title: b.label, subtitle: `${b.count} runbooks` })}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-center hover:border-blue-300">
                        <div className={cn("mx-auto mb-1 h-1.5 w-10 rounded-full", b.color)} />
                        <div className="text-[11px] font-medium text-slate-500">{b.label}</div>
                        <div className="text-lg font-semibold tabular-nums">{b.count}</div>
                        <div className="text-[10px] text-slate-500">{b.share}%</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 text-[11px] text-slate-500">Maturity trend (90 days)</div>
                    <div className="grid grid-cols-1 gap-1">
                      {RUNBOOK_BUCKETS.map((b, i) => (
                        <div key={b.id} className={cn("text-slate-400", b.color.replace("bg-", "text-"))}>
                          <Sparkline data={spark(28, i + 11)} />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Incident Intelligence Assistant */}
            <Card title="6. Incident Intelligence Assistant" sub="AI-assisted analysis · production-changing actions require approval"
              actions={<Badge variant="outline" className="border-rose-200 bg-rose-50 text-[11px] text-rose-700">SEV1</Badge>}>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 rounded-lg border border-rose-200 bg-rose-50/40 p-3 md:col-span-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-rose-800">
                    <CircleAlert className="h-4 w-4" /> EVV Sync Success Dropped Below SLO
                  </div>
                  <ul className="mt-2 space-y-1 text-[12px] text-slate-700">
                    <li><span className="text-slate-500">Service:</span> Caregiver Mobile / EVV</li>
                    <li><span className="text-slate-500">Started:</span> 9:42 AM (13m ago)</li>
                    <li><span className="text-slate-500">Status:</span> Investigating</li>
                    <li><span className="text-slate-500">Commander:</span> Sarah Johnson</li>
                    <li><span className="text-slate-500">War Room:</span> #evv-inc-48291</li>
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="h-7 bg-blue-600 text-xs hover:bg-blue-700" onClick={() => open({ kind: "incident", title: "Incident Room INC-48291" })}>Open Incident Room</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Acknowledge</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Escalate</Button>
                  </div>
                </div>
                <div className="col-span-12 space-y-3 md:col-span-7">
                  <Block title="What's Happening">EVV sync success rate is 98.12% (SLO ≥ 99.5%). Error budget burn is 8% in the last 30 minutes.</Block>
                  <Block title="Likely Root Cause">SQL Server Shard 2 write latency elevated (p95 680ms) causing API retry storm and queue buildup.</Block>
                  <Block title="Customer Impact">3,210 caregivers across 4 states may experience delayed visit completion.</Block>
                  <Block title="Recommended Actions (AI)">
                    <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[12px] text-slate-700">
                      <li>Throttle retry policy to reduce load</li>
                      <li>Validate DB connection pool and max connections</li>
                      <li>Monitor queue depth and drain rate</li>
                      <li>Notify Customer Support with impact summary</li>
                    </ol>
                  </Block>
                  <div className="flex flex-wrap gap-2">
                    {["Generate Executive Summary","Create Postmortem Draft","Notify Comms"].map(a => (
                      <Button key={a} variant="outline" size="sm" className="h-7 text-xs">{a}</Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Toil + Postmortems */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-5">
                <Card title="8. Toil Register" sub="Top 5 by hours" actions={<Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700">100 hrs / month saved</Badge>}>
                  <table className="w-full text-sm">
                    <thead><tr className="text-[10px] uppercase tracking-wider text-slate-500">
                      <Th>Toil Item</Th><Th>Root Cause</Th><Th>Freq.</Th><Th>Hrs/Mo</Th><Th>Automation Candidate</Th><Th>Hrs Saved</Th>
                    </tr></thead>
                    <tbody>
                      {TOIL.map(t => (
                        <tr key={t.task} onClick={() => open({ kind: "toil", title: t.task, subtitle: t.root, data: t })} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/60">
                          <Td className="font-medium">{t.task}</Td>
                          <Td className="text-slate-600">{t.root}</Td>
                          <Td>{t.freq}</Td>
                          <Td className="tabular-nums">{t.hpm}</Td>
                          <Td><Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700">{t.cand}</Badge></Td>
                          <Td className="tabular-nums text-emerald-700">{t.saved}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
              <div className="col-span-12 xl:col-span-7">
                <Card title="9. Post-Incident Learning" sub="Blameless Culture · Last 90 days 100%" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all →</Button>}>
                  <table className="w-full text-sm">
                    <thead><tr className="text-[10px] uppercase tracking-wider text-slate-500">
                      <Th>Incident</Th><Th>Sev</Th><Th>Date</Th><Th>Root Cause</Th><Th>Corrective Action</Th><Th>Owner</Th><Th>Status</Th>
                    </tr></thead>
                    <tbody>
                      {POSTMORTEMS.map(p => (
                        <tr key={p.inc} onClick={() => open({ kind: "postmortem", title: `${p.inc} · ${p.root}`, subtitle: p.action, data: p })} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/60">
                          <Td className="font-medium">{p.inc}</Td>
                          <Td><Badge variant="outline" className={cn("text-[10px]", p.sev === "SEV1" ? "border-rose-200 bg-rose-50 text-rose-700" : p.sev === "SEV2" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{p.sev}</Badge></Td>
                          <Td className="text-slate-500">{p.date}</Td>
                          <Td className="text-slate-600">{p.root}</Td>
                          <Td className="text-slate-600">{p.action}</Td>
                          <Td>{p.owner}</Td>
                          <Td><Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">{p.status}</Badge></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <aside className="col-span-12 space-y-4 xl:col-span-3">
            <Card title="Executive Insights" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all →</Button>}>
              <div className="space-y-2.5">
                {[
                  { icon: AlertTriangle, color: "text-rose-600",    title: "Error budget burn accelerating", sub: "3 services consuming > 10% budget this month." },
                  { icon: TrendingDown,  color: "text-emerald-600", title: "Alert noise reduced 68%",        sub: "Thanks to SLO-based alerting and routing." },
                  { icon: Clock,         color: "text-blue-600",    title: "MTTR improved",                  sub: "Down 9m vs last 7 days." },
                  { icon: Zap,           color: "text-amber-600",   title: "Automation opportunities",       sub: "8 new items identified · 100 hrs/month potential." },
                ].map(i => {
                  const Icon = i.icon;
                  return (
                    <button key={i.title} onClick={() => open({ kind: "insight", title: i.title, subtitle: i.sub })}
                      className="flex w-full items-start gap-2 rounded-md border border-slate-100 bg-white p-2 text-left hover:border-blue-300 hover:bg-blue-50/40">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", i.color)} />
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold text-slate-800">{i.title}</div>
                        <div className="text-[11px] text-slate-500">{i.sub}</div>
                        <div className="mt-0.5 text-[11px] text-blue-600">View details →</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="AI Recommendations" sub="Require human approval">
              <div className="space-y-2">
                {AI_RECS.map(r => {
                  const Icon = r.icon;
                  return (
                    <div key={r.id} className="flex items-start gap-2 rounded-md border border-slate-100 bg-gradient-to-br from-blue-50/30 to-white p-2">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold text-slate-800">{r.title}</div>
                        <div className="text-[11px] text-slate-500">{r.sub}</div>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => open({ kind: "rec", title: r.title, subtitle: r.sub })}>{r.cta}</Button>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Quick Actions">
              <div className="space-y-1.5">
                {[
                  { icon: AlertTriangle, label: "Create Incident",   color: "text-rose-600" },
                  { icon: FileText,      label: "Create Runbook",    color: "text-blue-600" },
                  { icon: Activity,      label: "Schedule Game Day", color: "text-violet-600" },
                  { icon: ShieldCheck,   label: "Start PRR",         color: "text-emerald-600" },
                ].map(q => {
                  const Icon = q.icon;
                  return (
                    <button key={q.label} className="flex w-full items-center justify-between rounded-md border border-slate-100 px-2 py-1.5 text-left text-[12px] hover:border-blue-300 hover:bg-blue-50/40">
                      <span className="flex items-center gap-2"><Icon className={cn("h-3.5 w-3.5", q.color)} />{q.label}</span>
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="Service Review Cadence">
              <div className="divide-y divide-slate-100">
                {REVIEWS.map(r => (
                  <button key={r.name} onClick={() => open({ kind: "review", title: r.name, subtitle: r.when })}
                    className="flex w-full items-center justify-between py-1.5 text-left hover:bg-slate-50/60">
                    <div>
                      <div className="text-[12px] font-medium text-slate-800">{r.name}</div>
                      <div className="text-[11px] text-slate-500">{r.when}</div>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", r.tag === "On Track" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700")}>{r.tag}</Badge>
                  </button>
                ))}
              </div>
            </Card>
          </aside>
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-2 text-[11px] text-slate-500">
          Last updated: May 16, 2025 9:55 AM ET · Source: Client Signal Intelligence
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-[540px] sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle className="text-base">{drawer?.title}</SheetTitle>
            {drawer?.subtitle && <div className="text-xs text-slate-500">{drawer.subtitle}</div>}
          </SheetHeader>
          <div className="mt-4">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="signal"   className="text-xs">Signals</TabsTrigger>
                <TabsTrigger value="owners"   className="text-xs">Ownership</TabsTrigger>
                <TabsTrigger value="actions"  className="text-xs">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-3 space-y-2 text-sm">
                <Row label="Type" value={drawer?.kind ?? "—"} />
                <Row label="Status" value="Investigating" />
                <Row label="Product Line" value="HHA Enterprise" />
                <Row label="Environment" value="Production" />
                <Row label="Region" value="us-east-1" />
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[12px] text-slate-600">
                  Signal is correlated to a business workflow and routed to the accountable team. No NOC handling involved.
                </div>
              </TabsContent>
              <TabsContent value="signal" className="mt-3 space-y-2 text-sm">
                <Row label="MTTD" value="3m 12s" />
                <Row label="Precision" value="86%" />
                <Row label="Recall" value="78%" />
                <Row label="Noise Ratio" value="18%" />
                <Row label="Last Fire" value="9:42 AM" />
              </TabsContent>
              <TabsContent value="owners" className="mt-3 space-y-2 text-sm">
                <Row label="Primary Team" value="EVV Platform" />
                <Row label="SRE Pod" value="Pod A" />
                <Row label="Commander" value="Sarah Johnson" />
                <Row label="Escalation" value="Data Engineering" />
              </TabsContent>
              <TabsContent value="actions" className="mt-3 space-y-2 text-sm">
                {["Open dashboard","Open runbook","Open incident room","Generate exec summary","Create postmortem draft","Tune alert threshold"].map(a => (
                  <button key={a} className="flex w-full items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50/40">
                    <span className="text-[13px] text-slate-700">{a}</span><ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function Card({ title, sub, actions, children }: { title: string; sub?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
function Th({ children }: { children?: React.ReactNode }) { return <th className="px-2 py-1.5 text-left font-medium">{children}</th>; }
function Td({ children, className }: { children?: React.ReactNode; className?: string }) { return <td className={cn("px-2 py-1.5 align-middle", className)}>{children}</td>; }
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-100 bg-slate-50/50 px-2 py-1.5 text-[12px]">
      <span className="text-slate-500">{label}</span><span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      <div className="mt-0.5 text-[12px] text-slate-700">{children}</div>
    </div>
  );
}
