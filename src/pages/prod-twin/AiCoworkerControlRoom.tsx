import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Filter, TrendingUp, TrendingDown, ShieldCheck, Activity, Bot, Sparkles,
  CheckCircle2, Clock, Eye, Zap, Workflow, FileBarChart2, BellRing, Target,
  DollarSign, AlertTriangle, GitBranch, KeyRound, Database, Package, MoreVertical,
  ChevronRight, PlayCircle, PauseCircle, ShieldAlert, ScrollText, Users,
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
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
        <circle cx="18" cy="18" r="15.9" fill="none" className={color} strokeWidth="3.5" strokeDasharray={`${value} 100`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg font-semibold tabular-nums text-slate-900">{center.v}</div>
        <div className="text-[10px] text-slate-500">{center.sub}</div>
      </div>
    </div>
  );
}

const KPIS = [
  { id: "auto",      label: "Automation Index",      value: "74%",     sub: "Across all levels",      hint: "+8% vs 30 days",   icon: Bot,           color: "text-blue-500",    up: true  },
  { id: "toil",      label: "Toil Reduction",        value: "1,842",   unit: "hrs", sub: "Saved this month", hint: "+12% vs 30d",  icon: Clock,         color: "text-emerald-500", up: true  },
  { id: "slo",       label: "SLO Health",            value: "98.6%",   sub: "All Golden Workflows",   hint: "+1.3% vs 30d",     icon: Target,        color: "text-emerald-500", up: true  },
  { id: "budget",    label: "Error Budget Status",   value: "22%",     sub: "Remaining (Weighted)",   hint: "-5% vs 30 days",   icon: Activity,      color: "text-amber-500",   up: false },
  { id: "prepared",  label: "AI Actions Prepared",   value: "156",     sub: "Awaiting approval",      hint: "+18 vs 30 days",   icon: Sparkles,      color: "text-violet-500",  up: true  },
  { id: "executed",  label: "Auto Actions Executed", value: "312",     sub: "L4 actions this month",  hint: "+22 vs 30 days",   icon: Zap,           color: "text-emerald-500", up: true  },
  { id: "prevent",   label: "Incidents Prevented",   value: "27",      sub: "Predicted & avoided",    hint: "+7 vs 30 days",    icon: ShieldCheck,   color: "text-blue-500",    up: true  },
];

const LEVELS = [
  { id: "L0", title: "L0: Observe",              tone: "blue",     icon: Eye,           desc: "Read-only intelligence",        ex: "Summarize incident timeline, explain SLO burn, show top risks.", metric: "1,248", metricLabel: "Observations" },
  { id: "L1", title: "L1: Recommend",            tone: "indigo",   icon: Sparkles,      desc: "AI suggests action",            ex: "Patch plan, security group fix, rightsizing recommendation.",     metric: "186",   metricLabel: "Recommendations" },
  { id: "L2", title: "L2: Prepare",              tone: "violet",   icon: Workflow,      desc: "AI prepares artifacts",         ex: "Change record, runbook, rollback plan, Terraform diff, postmortem.", metric: "156", metricLabel: "Prepared Actions" },
  { id: "L3", title: "L3: Execute with Approval",tone: "amber",    icon: CheckCircle2,  desc: "Human approves execution",      ex: "Restart service, apply patch, update security group, scale node group.", metric: "24",  metricLabel: "Awaiting Approval" },
  { id: "L4", title: "L4: Restricted Autonomy",  tone: "emerald",  icon: Zap,           desc: "Pre-approved, low-risk",        ex: "Clear cache, rotate non-prod credentials, restart stateless worker, collect diagnostics.", metric: "312", metricLabel: "Auto Executed" },
];
const toneBg: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
};
const toneDot: Record<string, string> = {
  blue: "bg-blue-500", indigo: "bg-indigo-500", violet: "bg-violet-500", amber: "bg-amber-500", emerald: "bg-emerald-500",
};

const COWORKERS = [
  { id: "slo",   name: "SLO Sentinel",                  icon: Target,       status: "Active",    badge: "18 Insights",     desc: "Watches SLOs & error budgets by golden workflow and service.", level: "L0–L2" },
  { id: "incs",  name: "Incident Synthesizer",          icon: Activity,     status: "Active",    badge: "7 Incidents",     desc: "Builds timeline, impact, root cause signals, and summary.",      level: "L1–L2" },
  { id: "run",   name: "Runbook Composer",              icon: ScrollText,   status: "Active",    badge: "12 Runbooks",     desc: "Creates structured runbooks with owner, steps, rollback.",       level: "L2" },
  { id: "chg",   name: "Change Risk Reviewer",          icon: ShieldCheck,  status: "Reviewing", badge: "9 Changes",       desc: "Reviews risk vs dependencies, error budget, exposure, rollback.", level: "L1–L3", warn: true },
  { id: "patch", name: "Patch Orchestrator",            icon: GitBranch,    status: "Active",    badge: "18 Patches",      desc: "Groups vulnerabilities by risk, product, downtime, evidence.",   level: "L2–L3" },
  { id: "img",   name: "Golden Image Auditor",          icon: Package,      status: "Active",    badge: "6 Drift Events",  desc: "Detects drift from approved images and CIS baseline.",           level: "L1" },
  { id: "sg",    name: "Security Group Diff Analyst",   icon: ShieldAlert,  status: "Active",    badge: "17 Changes",      desc: "Flags risky SG / firewall changes before deployment.",           level: "L1–L2" },
  { id: "dr",    name: "DR Drill Coordinator",          icon: Workflow,     status: "Ready",     badge: "2 Drills Planned",desc: "Plans and validates DR drills; captures evidence and gaps.",     level: "L2–L3", warn: true },
  { id: "fin",   name: "FinOps Waste Hunter",           icon: DollarSign,   status: "Active",    badge: "23 Opportunities",desc: "Finds waste, rightsizing, RI gaps, tagging gaps, cost anomalies.",level: "L1–L2" },
  { id: "ma",    name: "Acquisition Onboarding Scout",  icon: Users,        status: "Active",    badge: "1 In Progress",   desc: "Runs 60-day M&A tech intake: identity, telemetry, backup, SLO.", level: "L0–L1" },
  { id: "pm",    name: "Postmortem Scribe",             icon: FileBarChart2,status: "Active",    badge: "4 Drafts",        desc: "Produces blameless postmortems and tracks corrective actions.",  level: "L1–L2" },
  { id: "own",   name: "Service Ownership Coach",       icon: ShieldCheck,  status: "Active",    badge: "8 Teams",         desc: "Helps teams move to service ownership with guardrails.",         level: "L0–L1" },
];
const statusChip: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Reviewing: "bg-amber-50 text-amber-700 border-amber-200",
  Ready: "bg-blue-50 text-blue-700 border-blue-200",
};

const ACTIONS: Array<{ id: string; title: string; coworker: string; level: string; target: string; risk: Risk; created: string; status: string; statusTone: string; owner: string; }> = [
  { id: "a1", title: "Patch plan for SQL Server Shard 2",        coworker: "Patch Orchestrator",         level: "L1 Recommend",   target: "SQL Server Shard 2",   risk: "high",   created: "May 14, 09:12", status: "Recommended", statusTone: "bg-emerald-50 text-emerald-700 border-emerald-200", owner: "DB Team" },
  { id: "a2", title: "Security group rule ingress 0.0.0.0/0",    coworker: "Security Group Diff Analyst",level: "L1 Recommend",   target: "sg-prod-claims-042",   risk: "high",   created: "May 14, 08:45", status: "Recommended", statusTone: "bg-emerald-50 text-emerald-700 border-emerald-200", owner: "Platform Eng" },
  { id: "a3", title: "Rotate non-prod database credentials",     coworker: "Service Ownership Coach",    level: "L4 Auto Executed",target: "Non-Prod DB",          risk: "low",    created: "May 14, 07:34", status: "Executed",    statusTone: "bg-blue-50 text-blue-700 border-blue-200",         owner: "Automation" },
  { id: "a4", title: "Generate rollback plan for IDD release",   coworker: "Runbook Composer",           level: "L2 Prepare",     target: "IDD Release 2025.5.1", risk: "medium", created: "May 14, 07:01", status: "Prepared",    statusTone: "bg-violet-50 text-violet-700 border-violet-200",   owner: "Release Eng" },
  { id: "a5", title: "Rightsizing recommendation for EKS nodes", coworker: "FinOps Waste Hunter",        level: "L1 Recommend",   target: "EKS Node Group",       risk: "low",    created: "May 14, 06:32", status: "Recommended", statusTone: "bg-emerald-50 text-emerald-700 border-emerald-200", owner: "Cloud Team" },
  { id: "a6", title: "Restart stateless worker on Caregiver API",coworker: "Incident Synthesizer",       level: "L4 Auto Executed",target: "caregiver-api-3",      risk: "low",    created: "May 13, 22:18", status: "Executed",    statusTone: "bg-blue-50 text-blue-700 border-blue-200",         owner: "Automation" },
  { id: "a7", title: "Approve patch wave for Windows IIS fleet", coworker: "Patch Orchestrator",         level: "L3 Awaiting",    target: "IIS Fleet (38 hosts)", risk: "medium", created: "May 13, 17:55", status: "Awaiting",    statusTone: "bg-amber-50 text-amber-700 border-amber-200",      owner: "Platform Eng" },
  { id: "a8", title: "DR failover drill validation for Claims",  coworker: "DR Drill Coordinator",       level: "L2 Prepare",     target: "Claims Processing",    risk: "high",   created: "May 13, 14:02", status: "Prepared",    statusTone: "bg-violet-50 text-violet-700 border-violet-200",   owner: "SRE" },
];

const EXEC_INSIGHTS = [
  { id: "risk", icon: ShieldAlert,  tone: "text-rose-600 bg-rose-50",        title: "Top Risks",              detail: "3 critical exposures require action" },
  { id: "rec",  icon: ShieldCheck,  tone: "text-blue-600 bg-blue-50",        title: "Recovery Risk",          detail: "Identity recovery not fully validated" },
  { id: "opp",  icon: Sparkles,     tone: "text-violet-600 bg-violet-50",    title: "Automation Opportunity", detail: "27 automation opportunities identified" },
  { id: "sec",  icon: ShieldCheck,  tone: "text-emerald-600 bg-emerald-50",  title: "Security Health",        detail: "Overall cyber health is 87 (Healthy)" },
];

const WINS = [
  { time: "May 13, 14:22", text: "Prevented ransomware on file server" },
  { time: "May 13, 11:34", text: "Auto restarted worker (non-prod)" },
  { time: "May 12, 16:10", text: "Detected SLO burn early on Claims API" },
];

const OP_HEALTH: Array<{ k: string; v: string; tone: string }> = [
  { k: "Reliability", v: "Healthy", tone: "text-emerald-600" },
  { k: "Security",    v: "Watch",   tone: "text-amber-600" },
  { k: "Performance", v: "Healthy", tone: "text-emerald-600" },
  { k: "Cost",        v: "Healthy", tone: "text-emerald-600" },
  { k: "Automation",  v: "Healthy", tone: "text-emerald-600" },
];

export default function AiCoworkerControlRoom() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [tab, setTab] = useState<"all" | "L1" | "L2" | "L3" | "L4">("all");
  const filteredActions = useMemo(() => {
    if (tab === "all") return ACTIONS;
    return ACTIONS.filter(a => a.level.startsWith(tab));
  }, [tab]);

  const open = (d: Drawer) => setDrawer(d);

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="px-6 pt-6 pb-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Automation & AI Digital Coworker Control Room
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              AI-assisted operations with human approval across reliability, security, performance, and cost.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="prod">
              <SelectTrigger className="h-9 w-[150px] bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="prod"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Production</span></SelectItem>
                <SelectItem value="np">Non-Production</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="30d">
              <SelectTrigger className="h-9 w-[140px] bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-9 bg-white"><Filter className="h-4 w-4 mr-1.5" />Filters (6)</Button>
          </div>
        </header>

        <div className="px-6 pb-10 grid grid-cols-12 gap-4">
          {/* Main column */}
          <div className="col-span-12 xl:col-span-9 space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
              {KPIS.map(k => {
                const Icon = k.icon;
                return (
                  <button key={k.id} onClick={() => open({ kind: "kpi", title: k.label, subtitle: k.sub, data: k })}
                    className="text-left rounded-xl border border-slate-200 bg-white p-3 hover:shadow-sm transition">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn("h-3.5 w-3.5", k.color)} />
                        <span className="text-[11px] font-medium text-slate-600">{k.label}</span>
                      </div>
                      <MoreVertical className="h-3 w-3 text-slate-300" />
                    </div>
                    <div className="text-2xl font-semibold tabular-nums text-slate-900">
                      {k.value}{(k as any).unit && <span className="text-sm text-slate-500 ml-1">{(k as any).unit}</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{k.sub}</div>
                    <div className="mt-1.5"><Sparkline data={spark(20, k.id.length * 7)} color={k.color} /></div>
                    <div className={cn("text-[10px] mt-1 inline-flex items-center gap-1", k.up ? "text-emerald-600" : "text-rose-600")}>
                      {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {k.hint}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Automation Levels Overview */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Automation Levels Overview</div>
                  <div className="text-[11px] text-slate-500">Hover a level to see examples and metrics</div>
                </div>
                <Badge variant="outline" className="text-[10px]">Governed by Approval Policy</Badge>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {LEVELS.map((l) => {
                  const Icon = l.icon;
                  return (
                    <button key={l.id} onClick={() => open({ kind: "level", title: l.title, subtitle: l.desc, data: l })}
                      className={cn("text-left rounded-lg border p-3 hover:shadow-sm transition", toneBg[l.tone])}>
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold">
                          <Icon className="h-4 w-4" /> {l.title}
                        </div>
                        <MoreVertical className="h-3 w-3 opacity-50" />
                      </div>
                      <div className="text-[11px] mt-1 opacity-90">{l.desc}</div>
                      <div className="text-[10px] mt-2 text-slate-600 bg-white/60 rounded p-2 leading-snug min-h-[60px]">
                        {l.ex}
                      </div>
                      <div className="mt-2">
                        <div className="text-xl font-semibold tabular-nums text-slate-900">{l.metric}</div>
                        <div className="text-[10px] text-slate-500">{l.metricLabel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Continuum bar */}
              <div className="mt-4 px-1">
                <div className="relative h-2 rounded-full bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200">
                  {LEVELS.map((l, i) => (
                    <span key={l.id} className={cn("absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full ring-2 ring-white", toneDot[l.tone])}
                      style={{ left: `${(i / (LEVELS.length - 1)) * 100}%`, transform: "translate(-50%,-50%)" }} />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                  <span>Human Insight</span>
                  <span>Human in the Loop</span>
                  <span>Automated Execution</span>
                </div>
              </div>
            </div>

            {/* Digital Coworkers */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Digital Coworkers</div>
                  <div className="text-[11px] text-slate-500">AI teammates assisting HHAX operations</div>
                </div>
                <button className="text-[11px] text-blue-600 inline-flex items-center gap-1 hover:underline">
                  View All Coworkers <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {COWORKERS.map(c => {
                  const Icon = c.icon;
                  return (
                    <button key={c.id} onClick={() => open({ kind: "coworker", title: c.name, subtitle: c.desc, data: c })}
                      className="text-left rounded-lg border border-slate-200 p-3 hover:border-blue-300 hover:shadow-sm transition bg-white">
                      <div className="flex items-start justify-between">
                        <div className={cn("h-7 w-7 rounded-md grid place-items-center", c.warn ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600")}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <MoreVertical className="h-3 w-3 text-slate-300" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-2">{c.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{c.desc}</div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", statusChip[c.status])}>{c.status}</span>
                        <span className="text-[10px] text-slate-500">{c.badge}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Action Center */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-slate-900">AI Action Center</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs"><PauseCircle className="h-3 w-3 mr-1" />Pause All</Button>
                  <Button size="sm" className="h-7 text-xs"><PlayCircle className="h-3 w-3 mr-1" />Approve Selected</Button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-3 border-b border-slate-100">
                {[
                  { id: "all", label: `All (${ACTIONS.length})` },
                  { id: "L1",  label: `L1 Recommend (62)` },
                  { id: "L2",  label: `L2 Prepare (48)` },
                  { id: "L3",  label: `L3 Awaiting (24)` },
                  { id: "L4",  label: `L4 Executed (22)` },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as any)}
                    className={cn("px-2.5 py-1.5 text-[11px] font-medium border-b-2 -mb-px",
                      tab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700")}>
                    {t.label}
                  </button>
                ))}
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500">
                    <th className="font-medium py-1.5">Action</th>
                    <th className="font-medium">Digital Coworker</th>
                    <th className="font-medium">Level</th>
                    <th className="font-medium">Target</th>
                    <th className="font-medium">Risk</th>
                    <th className="font-medium">Created</th>
                    <th className="font-medium">Status</th>
                    <th className="font-medium">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActions.map(a => (
                    <tr key={a.id} onClick={() => open({ kind: "action", title: a.title, subtitle: a.coworker, data: a })}
                      className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <td className="py-2 font-medium text-slate-800">{a.title}</td>
                      <td className="text-slate-600">{a.coworker}</td>
                      <td><span className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-50 text-slate-700 border-slate-200">{a.level}</span></td>
                      <td className="text-slate-600">{a.target}</td>
                      <td><span className={cn("text-[10px] px-1.5 py-0.5 rounded border capitalize", riskChip[a.risk])}>{a.risk}</span></td>
                      <td className="text-slate-500">{a.created}</td>
                      <td><span className={cn("text-[10px] px-1.5 py-0.5 rounded border", a.statusTone)}>{a.status}</span></td>
                      <td className="text-slate-600">{a.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="text-[11px] text-blue-600 mt-3 inline-flex items-center gap-1 hover:underline">
                View all AI actions <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Right rail */}
          <div className="col-span-12 xl:col-span-3 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-slate-900">Executive Insights</div>
                <button className="text-[10px] text-blue-600 hover:underline">View all</button>
              </div>
              <ul className="space-y-2.5">
                {EXEC_INSIGHTS.map(i => {
                  const Icon = i.icon;
                  return (
                    <li key={i.id}>
                      <button onClick={() => open({ kind: "insight", title: i.title, subtitle: i.detail, data: i })}
                        className="w-full text-left flex items-start gap-2.5 hover:bg-slate-50 p-1.5 rounded-md">
                        <span className={cn("h-7 w-7 rounded-md grid place-items-center shrink-0", i.tone)}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-slate-800">{i.title}</div>
                          <div className="text-[10px] text-slate-500 leading-snug">{i.detail}</div>
                          <div className="text-[10px] text-blue-600 mt-0.5 inline-flex items-center gap-0.5">See details <ChevronRight className="h-2.5 w-2.5" /></div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900 mb-3">AI Assist Health</div>
              <div className="flex items-center gap-3">
                <Donut value={92} color="stroke-emerald-500" center={{ v: "92%", sub: "Last 30 days" }} />
                <div className="space-y-1.5 text-[11px] flex-1">
                  <div className="text-slate-500 leading-tight">Recommendations<br /><span className="text-slate-700 font-medium">accepted</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Accepted</span><span className="font-semibold tabular-nums">144</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Rejected</span><span className="font-semibold tabular-nums">9</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Pending</span><span className="font-semibold tabular-nums">3</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-slate-900">Recent AI Wins</div>
                <button className="text-[10px] text-blue-600 hover:underline">View all</button>
              </div>
              <ul className="space-y-2.5">
                {WINS.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[12px] text-slate-800">{w.text}</div>
                      <div className="text-[10px] text-slate-500">{w.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-slate-900">Operating Health</div>
                <button className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-0.5">View details <ChevronRight className="h-2.5 w-2.5" /></button>
              </div>
              <ul className="space-y-1.5">
                {OP_HEALTH.map(h => (
                  <li key={h.k} className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-600">{h.k}</span>
                    <span className={cn("font-semibold inline-flex items-center gap-1", h.tone)}>
                      {h.v} <ChevronRight className="h-3 w-3" />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="text-[10px] text-slate-500 mt-2">Health scores are weighted across all services</div>
            </div>
          </div>

          {/* Bottom filter bar */}
          <div className="col-span-12">
            <div className="rounded-xl border border-slate-200 bg-white p-3 grid grid-cols-2 md:grid-cols-7 gap-3 items-end">
              {[
                { l: "Environment", v: "Production" },
                { l: "Product Line", v: "All" },
                { l: "Cloud Platform", v: "All" },
                { l: "Risk", v: "All" },
                { l: "Control Type", v: "All" },
                { l: "Modernization Status", v: "All" },
                { l: "Time Range", v: "Last 30 days" },
              ].map(f => (
                <div key={f.l}>
                  <div className="text-[10px] font-medium text-slate-500 mb-1 uppercase tracking-wide">{f.l}</div>
                  <Select defaultValue="x">
                    <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder={f.v}>{f.v}</SelectValue></SelectTrigger>
                    <SelectContent><SelectItem value="x">{f.v}</SelectItem></SelectContent>
                  </Select>
                </div>
              ))}
              <div className="col-span-2 md:col-span-7 flex justify-end">
                <Button variant="outline" size="sm" className="h-7 text-xs">Clear Filters</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
          {drawer && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg">{drawer.title}</SheetTitle>
                {drawer.subtitle && <p className="text-[12px] text-slate-500">{drawer.subtitle}</p>}
              </SheetHeader>
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid grid-cols-5 h-9">
                  <TabsTrigger value="overview" className="text-[11px]">Overview</TabsTrigger>
                  <TabsTrigger value="impact" className="text-[11px]">Impact</TabsTrigger>
                  <TabsTrigger value="governance" className="text-[11px]">Governance</TabsTrigger>
                  <TabsTrigger value="evidence" className="text-[11px]">Evidence</TabsTrigger>
                  <TabsTrigger value="actions" className="text-[11px]">Actions</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-3 mt-4 text-[12px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border p-2"><div className="text-[10px] text-slate-500">Type</div><div className="font-semibold">{drawer.kind}</div></div>
                    <div className="rounded-md border p-2"><div className="text-[10px] text-slate-500">Owner</div><div className="font-semibold">{drawer.data?.owner || "SRE Platform"}</div></div>
                    <div className="rounded-md border p-2"><div className="text-[10px] text-slate-500">Approval</div><div className="font-semibold">Required for L3+</div></div>
                    <div className="rounded-md border p-2"><div className="text-[10px] text-slate-500">Audit</div><div className="font-semibold">Logged</div></div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">AI Reasoning</div>
                    <p className="text-slate-700 leading-snug">
                      AI synthesized telemetry across service ownership, SLO burn, exposure, and customer impact to
                      recommend this action. All steps are reversible and tied to a runbook with rollback evidence.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="impact" className="space-y-2 mt-4 text-[12px]">
                  {["Caregiver EVV","Claims Processing","Provider Portal"].map(s => (
                    <div key={s} className="flex items-center justify-between rounded-md border p-2">
                      <span>{s}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">SLO safe</span>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="governance" className="space-y-2 mt-4 text-[12px]">
                  <div className="rounded-md border p-3">
                    <div className="font-semibold mb-1">Policy Guardrails</div>
                    <ul className="space-y-1 text-slate-600">
                      <li>• L0–L2 do not change production state.</li>
                      <li>• L3 requires service owner approval.</li>
                      <li>• L4 is pre-approved, low-risk, reversible.</li>
                      <li>• All actions emit audit trail and notify owners.</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="evidence" className="space-y-2 mt-4 text-[12px]">
                  {["Change Record CHG-44219","Runbook RB-1182","Rollback Plan v3","Audit Log Entry"].map(e => (
                    <div key={e} className="flex items-center justify-between rounded-md border p-2">
                      <span>{e}</span>
                      <Button size="sm" variant="outline" className="h-6 text-[10px]">Open</Button>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="actions" className="space-y-2 mt-4 text-[12px]">
                  <Button className="w-full" onClick={() => { toast.success("Approved – queued for execution"); setDrawer(null); }}>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Execute
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => toast.success("Routed to owning team")}>
                    <BellRing className="h-4 w-4 mr-1.5" /> Route to Service Owner
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => toast.message("Snoozed 24h")}>Snooze 24h</Button>
                  <Button variant="ghost" className="w-full text-rose-600" onClick={() => { toast.error("Rejected – feedback captured"); setDrawer(null); }}>
                    Reject with feedback
                  </Button>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
