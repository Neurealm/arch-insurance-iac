import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Filter, ShieldCheck, Activity, Bot, Sparkles, CheckCircle2, Clock, Eye, Workflow,
  AlertTriangle, GitBranch, Database, Package, ChevronRight, Users, BookOpen,
  CalendarDays, KeyRound, Server, Cloud, BarChart3, FileBarChart2, Bell, ScrollText,
  ArrowRightLeft, ShieldAlert, Target, Layers, MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Risk = "low" | "medium" | "high" | "critical";
const riskChip: Record<Risk, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
  critical: "bg-rose-100 text-rose-800 border-rose-300",
};
type Drawer = { kind: string; title: string; subtitle?: string; data?: any } | null;

/* --- Sparkline --- */
function spark(n: number, seed: number) {
  let s = seed;
  return Array.from({ length: n }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    return 50 + (s / 233280) * 30 - 15 + Math.sin(i / 2 + seed) * 6;
  });
}
function Sparkline({ data, color = "text-blue-500" }: { data: number[]; color?: string }) {
  const w = 100, h = 28;
  const mx = Math.max(...data), mn = Math.min(...data);
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - mn) / Math.max(0.001, mx - mn)) * (h - 4) - 2;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-6 w-full", color)}>
      <path d={`${path} L${w},${h} L0,${h} Z`} className="fill-current opacity-10" />
      <path d={path} fill="none" strokeWidth={1.5} className="stroke-current" />
    </svg>
  );
}

function Donut({ value, color = "stroke-emerald-500", center }: { value: number; color?: string; center: { v: string; sub: string } }) {
  return (
    <div className="relative h-20 w-20">
      <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
        <circle cx="18" cy="18" r="15.9" fill="none" className={color} strokeWidth="3.5" strokeDasharray={`${value} 100`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-base font-semibold tabular-nums text-slate-900">{center.v}</div>
        <div className="text-[9px] text-slate-500">{center.sub}</div>
      </div>
    </div>
  );
}

/* ---------------- DATA ---------------- */

const KPIS = [
  { id: "tr",       label: "Transition Readiness",      value: "68%", sub: "Overall",         hint: "+12% vs last 30 days", icon: Target,         color: "text-blue-500"    },
  { id: "kc",       label: "Knowledge Captured",        value: "72%", sub: "Validated",       hint: "+14% vs last 30 days", icon: BookOpen,       color: "text-emerald-500" },
  { id: "rb",       label: "Runbook Completion",        value: "61%", sub: "Complete",        hint: "+9% vs last 30 days",  icon: ScrollText,     color: "text-amber-500"   },
  { id: "ar",       label: "Access Readiness",          value: "64%", sub: "Provisioned",     hint: "+8% vs last 30 days",  icon: KeyRound,       color: "text-violet-500"  },
  { id: "dr",       label: "Co-Run Readiness",          value: "42%", sub: "Prepared",        hint: "+6% vs last 30 days",  icon: ArrowRightLeft, color: "text-fuchsia-500" },
  { id: "risks",    label: "Critical Risks",            value: "7",   sub: "Open",            hint: "-3 vs last 30 days",   icon: ShieldAlert,    color: "text-rose-500"    },
  { id: "modern",   label: "Modernization Opps",        value: "34",  sub: "Identified",      hint: "+10 vs last 30 days",  icon: Sparkles,       color: "text-cyan-600"    },
];

type PhaseStatus = "complete" | "active" | "planned";
const PHASES: { id: string; n: number; title: string; status: PhaseStatus; metrics: { k: string; v: string }[]; contents: string[] }[] = [
  { id: "p0", n: 0, title: "Confidential Discovery", status: "complete", metrics: [{k:"Artifacts",v:"124"},{k:"Stakeholders",v:"28"},{k:"Open Data Gaps",v:"14"}], contents: ["Stakeholder Map","Scope Towers","Decision Calendar","Data Requests","Governance Structure"] },
  { id: "p1", n: 1, title: "Knowledge Capture", status: "complete", metrics: [{k:"Runbooks",v:"286"},{k:"Diagrams",v:"142"},{k:"Alerts",v:"328"}], contents: ["Product Inventory","Service Inventory","Runbooks","Access Models","Architecture","Alert Catalog","Ticket History"] },
  { id: "p2", n: 2, title: "Reverse Shadow", status: "active",   metrics: [{k:"Observed Workflows",v:"68"},{k:"Incidents Observed",v:"24"},{k:"Runbooks Reviewed",v:"102"}], contents: ["Observe Operations","Validate Procedures","Identify Gaps","Document Dependencies"] },
  { id: "p3", n: 3, title: "Shadow Support", status: "planned",  metrics: [{k:"Actions Proposed",v:"0"},{k:"Recommendations",v:"0"},{k:"Runbooks Drafted",v:"0"}], contents: ["Neurealm Recommends","HHAX Executes","Validation Captured"] },
  { id: "p4", n: 4, title: "Co-Run", status: "planned",          metrics: [{k:"Shared Services",v:"0"},{k:"Quality Gates",v:"0"},{k:"Reviews Scheduled",v:"0"}], contents: ["Shared Execution","Quality Gates","Joint Governance","Operational Reviews"] },
  { id: "p5", n: 5, title: "Takeover", status: "planned",        metrics: [{k:"Towers Transitioned",v:"0"},{k:"Ownership Defined",v:"0"},{k:"Acceptance Tests",v:"0"}], contents: ["Defined Ownership","Acceptance Validation","Tower Transition","Service Ownership"] },
  { id: "p6", n: 6, title: "Stabilize", status: "planned",       metrics: [{k:"Stability Index",v:"0"},{k:"SLO Compliance",v:"0%"},{k:"Runbook Complete",v:"0%"}], contents: ["SLO Governance","Patch Hygiene","Incident Hygiene","Runbook Completeness","Observability"] },
  { id: "p7", n: 7, title: "Modernize", status: "planned",       metrics: [{k:"Modernization Tracks",v:"34"},{k:"Automation %",v:"0%"},{k:"DR Maturity",v:"0"}], contents: ["Automation","IaC","Golden Images","FinOps","Platform Engineering","Containerization","DR Maturity"] },
];

const DUAL_RUN = [
  { id: "cgm", service: "Caregiver Mobile",   sub: "Member app, auth, APIs", cur: "Incumbent", fut: "Neurealm + HHAX", phase: "Phase 2 Reverse Shadow", phaseTone: "blue",    status: "On Track", risk: "low" as Risk,    slo: "low" as Risk,    next: "Shadow Support", date: "Jul 15, 2025" },
  { id: "clm", service: "Claims Processing", sub: "Claims intake, adjudication", cur: "Incumbent", fut: "Neurealm + HHAX", phase: "Phase 1 Knowledge Capture", phaseTone: "violet", status: "On Track", risk: "medium" as Risk, slo: "high" as Risk,   next: "Reverse Shadow", date: "Jul 31, 2025" },
  { id: "pay", service: "Payroll",            sub: "Provider payroll, payments", cur: "Incumbent", fut: "Neurealm + HHAX", phase: "Phase 2 Reverse Shadow", phaseTone: "blue",    status: "On Track", risk: "low" as Risk,    slo: "medium" as Risk, next: "Shadow Support", date: "Jul 15, 2025" },
  { id: "pp",  service: "Provider Portal",    sub: "Provider web portal",     cur: "Incumbent", fut: "Neurealm + HHAX", phase: "Phase 1 Knowledge Capture", phaseTone: "violet", status: "On Track", risk: "medium" as Risk, slo: "medium" as Risk, next: "Reverse Shadow", date: "Jul 31, 2025" },
  { id: "idd", service: "IDD / Citrix",       sub: "Thick client environment", cur: "Incumbent", fut: "Neurealm + HHAX", phase: "Phase 0 Discovery Complete", phaseTone: "emerald", status: "Complete", risk: "low" as Risk, slo: "low" as Risk,   next: "Knowledge Capture", date: "Complete" },
];

const RISKS = [
  { id: "r1", risk: "Loss of institutional knowledge", control: "Structured knowledge capture & runbook validation", owner: "Transition Lead",            severity: "high" as Risk,   status: "Open" },
  { id: "r2", risk: "Access delays",                   control: "Access readiness tracker & escalation path",        owner: "Identity Team",              severity: "medium" as Risk, status: "Open" },
  { id: "r3", risk: "Production disruption",           control: "Shadow/co-run gates & rollback plans",              owner: "Operations",                 severity: "high" as Risk,   status: "Open" },
  { id: "r4", risk: "Alert noise",                     control: "Datadog rationalization & SLO-based routing",       owner: "SRE",                        severity: "medium" as Risk, status: "In Progress" },
  { id: "r5", risk: "Security exposure",               control: "Baseline controls before takeover",                 owner: "Cyber Security",             severity: "high" as Risk,   status: "Open" },
  { id: "r6", risk: "Incumbent sensitivity",           control: "Confidential transition governance",                owner: "Exec Steering Committee",    severity: "high" as Risk,   status: "Open" },
];

const HEATMAP_ROWS = ["HHA Enterprise","Sandata Fuse","SAM","Provider Pro","Pavilio","Self Direction","Generations"];
const HEATMAP_COLS = ["Runbooks","Architecture","Dependencies","Alerts","Ownership","DR","Security","Automation"];
const heatSeed = (r:number,c:number) => {
  const v = ((r*7 + c*13 + 11) * 17) % 100;
  if (v < 35) return "miss";
  if (v < 65) return "partial";
  return "complete";
};
const heatClass: Record<string,string> = {
  complete: "bg-emerald-500",
  partial:  "bg-amber-400",
  miss:     "bg-rose-400",
};
const heatLabel: Record<string,string> = { complete: "Complete (80–100%)", partial: "Partial (40–79%)", miss: "Missing (0–39%)" };

const ACCESS = [
  { id: "aws",    label: "AWS Accounts",     provisioned: 58, total: 66 },
  { id: "gcp",    label: "GCP Projects",     provisioned: 8,  total: 16 },
  { id: "github", label: "GitHub Repos",     provisioned: 8,  total: 16 },
  { id: "dd",     label: "Datadog",          provisioned: 8,  total: 16 },
  { id: "ctx",    label: "Citrix / NetScaler", provisioned: 4, total: 8 },
  { id: "vpn",    label: "VPN / Jump Hosts", provisioned: 6,  total: 10 },
  { id: "ora",    label: "Oracle / Databases", provisioned: 4, total: 12 },
];

const CALENDAR = [
  { id: "c1", date: "Jun 28, 2025", label: "Knowledge Capture Complete",  status: "On Track" },
  { id: "c2", date: "Jul 31, 2025", label: "Reverse Shadow Complete",     status: "On Track" },
  { id: "c3", date: "Aug 15, 2025", label: "Shadow Support Begin",        status: "Planned"  },
  { id: "c4", date: "Sep 1, 2025",  label: "Co-Run Start",                status: "Planned"  },
  { id: "c5", date: "Oct 15, 2025", label: "Takeover Phase Start",        status: "Planned"  },
  { id: "c6", date: "Dec 1, 2025",  label: "Stabilization Checkpoint",    status: "Planned"  },
  { id: "c7", date: "Feb 1, 2026",  label: "Modernization Acceleration",  status: "Planned"  },
];

const ASSISTANTS = [
  { id: "a1", label: "Acquisition Onboarding Scout",  metric: "1 in progress" },
  { id: "a2", label: "Knowledge Capture Analyzer",    metric: "1,842 artifacts" },
  { id: "a3", label: "Runbook Validator",             metric: "62 runbooks" },
  { id: "a4", label: "Access Readiness Tracker",      metric: "212 requests" },
  { id: "a5", label: "Dependency Mapper",             metric: "124 maps" },
  { id: "a6", label: "Transition Risk Monitor",       metric: "7 open risks" },
];

const INSIGHTS = [
  { id: "i1", icon: ShieldAlert,  title: "Transition Risk",       sub: "7 open risks require attention",       color: "text-rose-500" },
  { id: "i2", icon: BookOpen,     title: "Knowledge Gaps",        sub: "14 critical knowledge gaps",           color: "text-amber-500" },
  { id: "i3", icon: KeyRound,     title: "Access Delays",         sub: "28 blocked access requests",           color: "text-violet-500" },
  { id: "i4", icon: Sparkles,     title: "Modernization Potential", sub: "34 high value opportunities",        color: "text-cyan-600" },
  { id: "i5", icon: Activity,     title: "Operating Health",      sub: "Overall transition health is 86 (Healthy)", color: "text-emerald-500" },
];

const MILESTONES = [
  { id: "m1", title: "Completed stakeholder mapping", date: "May 16, 2025", tone: "ok" },
  { id: "m2", title: "Captured 286 runbooks",         date: "May 16, 2025", tone: "ok" },
  { id: "m3", title: "Observed 68 critical workflows", date: "May 15, 2025", tone: "ok" },
  { id: "m4", title: "Access delay in Datadog",       date: "May 16, 2025", tone: "warn" },
  { id: "m5", title: "Reverse shadow sessions ongoing", date: "May 16, 2025", tone: "info" },
];

/* ---------------- COMPONENT ---------------- */

export default function TransitionDualRun() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [env, setEnv] = useState("prod");
  const [time, setTime] = useState("90d");
  const [pl, setPl] = useState("all");
  const [risk, setRisk] = useState("all");

  const open = (d: Drawer) => setDrawer(d);
  const close = () => setDrawer(null);

  const phaseTone = (s: PhaseStatus) =>
    s === "complete" ? "border-emerald-300 bg-emerald-50/60"
    : s === "active" ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
    : "border-slate-200 bg-white";
  const phaseDot = (s: PhaseStatus) =>
    s === "complete" ? "bg-emerald-500" : s === "active" ? "bg-blue-500" : "bg-slate-300";
  const phaseBadge = (s: PhaseStatus) =>
    s === "complete" ? "bg-emerald-100 text-emerald-700"
    : s === "active" ? "bg-blue-100 text-blue-700"
    : "bg-slate-100 text-slate-600";

  return (
    <AppShell>
      <div className="flex-1 bg-slate-50/60 min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">HHAX Production Resilience Operating System</div>
              <h1 className="text-xl font-semibold text-slate-900 mt-0.5">Transition & Dual-Run Command Center</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">Govern knowledge transfer, continuity, dual-run execution, service ownership adoption, and modernization without customer disruption.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select value={env} onValueChange={setEnv}>
                <SelectTrigger className="h-9 w-[140px] text-xs"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /><SelectValue /></span></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prod">Production</SelectItem>
                  <SelectItem value="nonprod">Non-Production</SelectItem>
                </SelectContent>
              </Select>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="h-9 w-[140px] text-xs"><CalendarDays className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5"><Filter className="h-3.5 w-3.5" />Filters <Badge className="ml-1 h-4 px-1 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100">5</Badge></Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative"><Bell className="h-4 w-4" /><span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" /></Button>
            </div>
          </div>
        </div>

        {/* Status Strip */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-[10px] uppercase text-slate-500 tracking-wide">Transition Status</div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-base font-semibold text-slate-900">Phase 2</div>
                <div className="text-[11px] text-blue-600 font-medium">Reverse Shadow</div>
              </div>
            </div>
            {[
              { label: "Overall Readiness", v: 68, color: "stroke-emerald-500", sub: "" },
              { label: "Knowledge Capture", v: 72, color: "stroke-emerald-500", sub: "" },
              { label: "Access Readiness",  v: 64, color: "stroke-amber-500",  sub: "" },
              { label: "Production Risk",   v: 18, color: "stroke-emerald-500", sub: "", overrideValue: "Low" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase text-slate-500 tracking-wide truncate">{s.label}</div>
                  <div className="text-base font-semibold text-slate-900 mt-1">{s.overrideValue ?? `${s.v}%`}</div>
                </div>
                <Donut value={s.v} color={s.color} center={{ v: s.overrideValue ?? `${s.v}%`, sub: "" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4 p-6">
          {/* LEFT: workspace */}
          <div className="col-span-12 xl:col-span-9 space-y-4">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
              {KPIS.map((k, i) => (
                <button
                  key={k.id}
                  onClick={() => open({ kind: "kpi", title: k.label, subtitle: k.sub, data: k })}
                  className="text-left rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <k.icon className={cn("h-3.5 w-3.5", k.color)} />
                      <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">{k.label}</span>
                    </div>
                    <MoreVertical className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{k.value}</div>
                  <div className="text-[11px] text-slate-500">{k.sub}</div>
                  <Sparkline data={spark(20, i + 3)} color={k.color} />
                  <div className="text-[10px] text-slate-400">{k.hint}</div>
                </button>
              ))}
            </div>

            {/* Lifecycle */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Transition Lifecycle Command Map</h2>
                  <p className="text-[11px] text-slate-500">Click a phase to view details, artifacts, and risks.</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Completed</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />In Progress</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" />Planned</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
                {PHASES.map((p, idx) => (
                  <div key={p.id} className="relative">
                    <button
                      onClick={() => open({ kind: "phase", title: `Phase ${p.n}: ${p.title}`, subtitle: p.status.toUpperCase(), data: p })}
                      className={cn("w-full text-left rounded-lg border p-3 hover:shadow-md transition-all", phaseTone(p.status))}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={cn("h-2 w-2 rounded-full", phaseDot(p.status))} />
                        <span className="text-[10px] uppercase tracking-wide text-slate-500">Phase {p.n}</span>
                      </div>
                      <div className="text-[12px] font-semibold text-slate-900 leading-tight min-h-[28px]">{p.title}</div>
                      <Badge className={cn("mt-1.5 h-4 text-[9px] px-1.5 capitalize", phaseBadge(p.status))}>{p.status}</Badge>
                      <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                        {p.metrics.map((m) => (
                          <div key={m.k} className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 truncate">{m.k}</span>
                            <span className="font-semibold tabular-nums text-slate-900">{m.v}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                    {idx < PHASES.length - 1 && (
                      <div className="hidden xl:block absolute top-1/2 -right-1 -translate-y-1/2 z-10">
                        <ChevronRight className="h-3 w-3 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dual Run + Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900">Dual-Run Governance</h2>
                  <p className="text-[11px] text-slate-500">Service tower ownership and transition status.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50/70 text-[10px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Service Tower</th>
                        <th className="text-left px-2 py-2 font-medium">Current</th>
                        <th className="text-left px-2 py-2 font-medium">Future</th>
                        <th className="text-left px-2 py-2 font-medium">Phase</th>
                        <th className="text-left px-2 py-2 font-medium">Status</th>
                        <th className="text-left px-2 py-2 font-medium">Risk</th>
                        <th className="text-left px-2 py-2 font-medium">SLO</th>
                        <th className="text-left px-2 py-2 font-medium">Next Milestone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DUAL_RUN.map((r) => (
                        <tr key={r.id} className="border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer" onClick={() => open({ kind: "service", title: r.service, subtitle: r.sub, data: r })}>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Package className="h-3.5 w-3.5 text-slate-400" />
                              <div className="min-w-0">
                                <div className="font-medium text-slate-900 truncate">{r.service}</div>
                                <div className="text-[10px] text-slate-500 truncate">{r.sub}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 text-slate-700">{r.cur}<div className="text-[10px] text-slate-400">(Global Logic)</div></td>
                          <td className="px-2 py-2.5 text-slate-700">{r.fut}<div className="text-[10px] text-slate-400">Shared</div></td>
                          <td className="px-2 py-2.5">
                            <Badge className={cn("h-5 text-[10px] px-1.5",
                              r.phaseTone === "blue" ? "bg-blue-100 text-blue-700"
                              : r.phaseTone === "violet" ? "bg-violet-100 text-violet-700"
                              : "bg-emerald-100 text-emerald-700")}>{r.phase}</Badge>
                          </td>
                          <td className="px-2 py-2.5"><span className="flex items-center gap-1 text-slate-700"><span className={cn("h-1.5 w-1.5 rounded-full", r.status === "Complete" ? "bg-emerald-500" : "bg-emerald-500")} />{r.status}</span></td>
                          <td className="px-2 py-2.5"><span className={cn("inline-flex h-5 items-center rounded border px-1.5 text-[10px] capitalize", riskChip[r.risk])}>{r.risk}</span></td>
                          <td className="px-2 py-2.5"><span className={cn("inline-flex h-5 items-center rounded border px-1.5 text-[10px] capitalize", riskChip[r.slo])}>{r.slo}</span></td>
                          <td className="px-2 py-2.5"><div className="text-slate-700">{r.next}</div><div className="text-[10px] text-slate-400">{r.date}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-[11px] text-blue-600 hover:underline cursor-pointer">View all service towers (18) →</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900">Risk Register</h2>
                  <p className="text-[11px] text-slate-500">Top transition risks and controls.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50/70 text-[10px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Risk</th>
                        <th className="text-left px-2 py-2 font-medium">Control</th>
                        <th className="text-left px-2 py-2 font-medium">Owner</th>
                        <th className="text-left px-2 py-2 font-medium">Severity</th>
                        <th className="text-left px-2 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RISKS.map((r) => (
                        <tr key={r.id} className="border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer" onClick={() => open({ kind: "risk", title: r.risk, subtitle: r.owner, data: r })}>
                          <td className="px-3 py-2.5 font-medium text-slate-900">{r.risk}</td>
                          <td className="px-2 py-2.5 text-slate-600">{r.control}</td>
                          <td className="px-2 py-2.5 text-slate-700">{r.owner}</td>
                          <td className="px-2 py-2.5"><span className={cn("inline-flex h-5 items-center rounded border px-1.5 text-[10px] capitalize", riskChip[r.severity])}>{r.severity}</span></td>
                          <td className="px-2 py-2.5"><span className="inline-flex items-center gap-1 text-slate-700 text-[11px]"><span className={cn("h-1.5 w-1.5 rounded-full", r.status === "Open" ? "bg-rose-500" : "bg-amber-500")} />{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-[11px] text-blue-600 hover:underline cursor-pointer">View all risks (7) →</div>
              </div>
            </div>

            {/* Heatmap + Access + Calendar + Assistants */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              {/* Heatmap */}
              <div className="xl:col-span-1 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Knowledge Capture Heatmap</h3>
                <p className="text-[11px] text-slate-500 mb-3">Coverage by product line and artifact type.</p>
                <div className="overflow-x-auto">
                  <table className="text-[10px]">
                    <thead>
                      <tr>
                        <th className="text-left text-slate-500 font-medium pr-2 pb-1">Product Line</th>
                        {HEATMAP_COLS.map((c) => <th key={c} className="text-left text-slate-500 font-medium px-1 pb-1 whitespace-nowrap">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {HEATMAP_ROWS.map((row, ri) => (
                        <tr key={row}>
                          <td className="pr-2 py-1 text-slate-700 whitespace-nowrap">{row}</td>
                          {HEATMAP_COLS.map((col, ci) => {
                            const s = heatSeed(ri, ci);
                            return (
                              <td key={col} className="px-0.5 py-0.5">
                                <button
                                  onClick={() => open({ kind: "heat", title: `${row} • ${col}`, subtitle: heatLabel[s], data: { row, col, s } })}
                                  className={cn("h-5 w-7 rounded hover:ring-2 hover:ring-blue-300", heatClass[s])}
                                  title={heatLabel[s]}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500" />Complete (80–100%)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-400" />Partial (40–79%)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-400" />Missing (0–39%)</span>
                </div>
              </div>

              {/* Access Tracker */}
              <div className="xl:col-span-1 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Access Readiness Tracker</h3>
                <p className="text-[11px] text-slate-500 mb-2">Access provisioning status by system.</p>
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  <div><div className="text-base font-semibold text-blue-600 tabular-nums">212</div><div className="text-[9px] uppercase text-slate-500">Requested</div></div>
                  <div><div className="text-base font-semibold text-emerald-600 tabular-nums">136</div><div className="text-[9px] uppercase text-slate-500">Provisioned</div></div>
                  <div><div className="text-base font-semibold text-amber-600 tabular-nums">48</div><div className="text-[9px] uppercase text-slate-500">Pending</div></div>
                  <div><div className="text-base font-semibold text-rose-600 tabular-nums">28</div><div className="text-[9px] uppercase text-slate-500">Blocked</div></div>
                </div>
                <div className="space-y-1.5">
                  {ACCESS.map((a) => {
                    const pct = (a.provisioned / a.total) * 100;
                    const pend = Math.max(0, a.total - a.provisioned - Math.round(a.total*0.1));
                    const block = a.total - a.provisioned - pend;
                    return (
                      <button key={a.id} onClick={() => open({ kind: "access", title: a.label, data: a })} className="w-full text-left hover:bg-blue-50/40 rounded p-1">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-700">{a.label}</span>
                          <span className="tabular-nums text-slate-500">{a.provisioned} / <span className="text-rose-600">{block}</span></span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
                          <div className="bg-emerald-500 h-full" style={{ width: `${pct}%` }} />
                          <div className="bg-amber-400 h-full" style={{ width: `${(pend/a.total)*100}%` }} />
                          <div className="bg-rose-500 h-full flex-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-[11px] text-blue-600 hover:underline cursor-pointer">View all access requests →</div>
              </div>

              {/* Calendar */}
              <div className="xl:col-span-1 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Transition Decision Calendar</h3>
                <p className="text-[11px] text-slate-500 mb-2">Key milestones and decision points.</p>
                <div className="space-y-1.5">
                  {CALENDAR.map((c) => (
                    <button key={c.id} onClick={() => open({ kind: "milestone", title: c.label, subtitle: c.date, data: c })} className="w-full text-left flex items-center justify-between rounded hover:bg-blue-50/40 p-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-[10px] text-slate-500 tabular-nums w-[68px] shrink-0">{c.date.replace(", 2025","").replace(", 2026","")}</div>
                        <div className="text-[11px] text-slate-800 truncate">{c.label}</div>
                      </div>
                      <Badge className={cn("h-4 text-[9px] px-1.5", c.status === "On Track" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>{c.status}</Badge>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-blue-600 hover:underline cursor-pointer">View full calendar →</div>
              </div>

              {/* Assistants */}
              <div className="xl:col-span-1 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">AI Transition Assistants</h3>
                <p className="text-[11px] text-slate-500 mb-2">Digital coworkers supporting the transition.</p>
                <div className="space-y-1.5">
                  {ASSISTANTS.map((a) => (
                    <button key={a.id} onClick={() => open({ kind: "assistant", title: a.label, data: a })} className="w-full text-left flex items-center gap-2 rounded hover:bg-blue-50/40 p-1.5">
                      <div className="h-6 w-6 rounded bg-blue-50 grid place-items-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-slate-800 truncate">{a.label}</div>
                        <div className="text-[10px] text-slate-500">{a.metric}</div>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-300" />
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-blue-600 hover:underline cursor-pointer">View all AI coworkers →</div>
              </div>
            </div>

            {/* Tower Transition Dashboard */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-900">Tower Transition Dashboard</h2>
              <p className="text-[11px] text-slate-500 mb-3">Service tower progress, ownership, and quality gates.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {[
                  { name: "Cloud Operations",    cur: "Incumbent",     fut: "Neurealm + HHAX", prog: 62, qg: "Pass", risk: "low" as Risk, icon: Cloud },
                  { name: "Platform Engineering",cur: "Incumbent",     fut: "Neurealm",        prog: 48, qg: "Pass", risk: "medium" as Risk, icon: Layers },
                  { name: "Security Operations", cur: "Incumbent",     fut: "Neurealm + HHAX", prog: 54, qg: "Pass", risk: "high" as Risk, icon: ShieldCheck },
                  { name: "Database Operations", cur: "Incumbent",     fut: "Neurealm",        prog: 71, qg: "Pass", risk: "medium" as Risk, icon: Database },
                  { name: "Network Operations",  cur: "Incumbent",     fut: "Neurealm + HHAX", prog: 58, qg: "Watch", risk: "medium" as Risk, icon: GitBranch },
                  { name: "SRE",                 cur: "Incumbent",     fut: "Neurealm",        prog: 42, qg: "Pass", risk: "low" as Risk, icon: Activity },
                  { name: "DevOps",              cur: "Incumbent",     fut: "Neurealm",        prog: 65, qg: "Pass", risk: "low" as Risk, icon: Workflow },
                  { name: "Observability",       cur: "Incumbent",     fut: "Neurealm",        prog: 38, qg: "Watch", risk: "medium" as Risk, icon: Eye },
                  { name: "FinOps",              cur: "HHAX",          fut: "HHAX + Neurealm", prog: 30, qg: "Planned", risk: "low" as Risk, icon: BarChart3 },
                ].map((t) => (
                  <button key={t.name} onClick={() => open({ kind: "tower", title: t.name, data: t })} className="text-left rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-7 w-7 rounded-md bg-slate-50 grid place-items-center"><t.icon className="h-3.5 w-3.5 text-slate-600" /></div>
                      <div className="text-[12px] font-semibold text-slate-900 truncate">{t.name}</div>
                    </div>
                    <div className="text-[10px] text-slate-500">{t.cur} → <span className="text-slate-800">{t.fut}</span></div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${t.prog}%` }} />
                      </div>
                      <span className="text-[10px] tabular-nums text-slate-600">{t.prog}%</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge className={cn("h-4 text-[9px] px-1.5", t.qg === "Pass" ? "bg-emerald-100 text-emerald-700" : t.qg === "Watch" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600")}>{t.qg}</Badge>
                      <span className={cn("inline-flex h-4 items-center rounded border px-1.5 text-[9px] capitalize", riskChip[t.risk])}>{t.risk}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Executive Insights */}
          <div className="col-span-12 xl:col-span-3 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900">Executive Insights</h3>
                <button className="text-[11px] text-blue-600 hover:underline">View all →</button>
              </div>
              <div className="space-y-1.5">
                {INSIGHTS.map((i) => (
                  <button key={i.id} onClick={() => open({ kind: "insight", title: i.title, data: i })} className="w-full flex items-start gap-2 p-2 rounded hover:bg-blue-50/40 text-left">
                    <i.icon className={cn("h-4 w-4 mt-0.5", i.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-slate-900">{i.title}</div>
                      <div className="text-[10px] text-slate-500">{i.sub}</div>
                      <div className="text-[10px] text-blue-600 mt-0.5">See details →</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Overall Transition Health</h3>
              <div className="flex items-center gap-4">
                <Donut value={86} color="stroke-emerald-500" center={{ v: "86", sub: "Healthy" }} />
                <div className="flex-1 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Healthy</span><span className="tabular-nums font-semibold">14</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Watch</span><span className="tabular-nums font-semibold">3</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />At Risk</span><span className="tabular-nums font-semibold">2</span></div>
                </div>
              </div>
              <button className="mt-2 text-[11px] text-blue-600 hover:underline">Health details →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900">Recent Milestones & Updates</h3>
                <button className="text-[11px] text-blue-600 hover:underline">View all →</button>
              </div>
              <div className="space-y-1.5">
                {MILESTONES.map((m) => (
                  <div key={m.id} className="flex items-start gap-2 p-1.5">
                    {m.tone === "ok" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5" />}
                    {m.tone === "warn" && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />}
                    {m.tone === "info" && <Clock className="h-3.5 w-3.5 text-blue-500 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-slate-800">{m.title}</div>
                      <div className="text-[10px] text-slate-500">{m.date}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-slate-400">All times shown in ET</div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && close()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">{drawer?.title}</SheetTitle>
            {drawer?.subtitle && <div className="text-xs text-slate-500">{drawer.subtitle}</div>}
          </SheetHeader>
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid grid-cols-6 h-8">
              <TabsTrigger value="overview" className="text-[11px]">Overview</TabsTrigger>
              <TabsTrigger value="deps"     className="text-[11px]">Deps</TabsTrigger>
              <TabsTrigger value="mit"      className="text-[11px]">Mitigation</TabsTrigger>
              <TabsTrigger value="owner"    className="text-[11px]">Owner</TabsTrigger>
              <TabsTrigger value="evidence" className="text-[11px]">Evidence</TabsTrigger>
              <TabsTrigger value="audit"    className="text-[11px]">Audit</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="text-xs text-slate-600 space-y-3 mt-3">
              <div>This item is governed by the HHAX transition program and tracked under the Production Resilience Operating System.</div>
              {drawer?.data?.contents && (
                <ul className="list-disc pl-4 space-y-1">
                  {drawer.data.contents.map((c: string) => <li key={c}>{c}</li>)}
                </ul>
              )}
              {drawer?.data?.metrics && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {drawer.data.metrics.map((m: any) => (
                    <div key={m.k} className="rounded-md border border-slate-200 p-2">
                      <div className="text-[10px] uppercase text-slate-500">{m.k}</div>
                      <div className="text-base font-semibold tabular-nums text-slate-900">{m.v}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-3">
                <Button size="sm" className="h-8 text-xs" onClick={() => { toast.success("Approved"); close(); }}>Approve</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { toast("Acknowledged"); close(); }}>Acknowledge</Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={close}>Close</Button>
              </div>
            </TabsContent>
            <TabsContent value="deps" className="text-xs text-slate-600 mt-3">Upstream and downstream dependencies are validated through dependency mapping coworker.</TabsContent>
            <TabsContent value="mit" className="text-xs text-slate-600 mt-3">Mitigation owned by control owner with weekly progress review at the transition steering committee.</TabsContent>
            <TabsContent value="owner" className="text-xs text-slate-600 mt-3">Service tower owner accountable for execution and quality gates.</TabsContent>
            <TabsContent value="evidence" className="text-xs text-slate-600 mt-3">Linked runbooks, architecture diagrams, and validation artifacts (62 items).</TabsContent>
            <TabsContent value="audit" className="text-xs text-slate-600 mt-3">All changes captured to immutable audit log with attributed actors.</TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
