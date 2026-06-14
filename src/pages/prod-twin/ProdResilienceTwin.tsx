import { useState, useMemo } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ShieldCheck, ShieldAlert, Activity, Cloud, Database, Server, Box, Users, Bell,
  HelpCircle, ChevronDown, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle,
  Info, Brain, Lock, FileText, Zap, BarChart3, DollarSign, Clock, ArrowRight,
  MoreHorizontal, X, Smartphone, Key, Network, HardDrive, Eye, Wrench,
  GitBranch, ClipboardCheck, Briefcase, FileBarChart2, Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import sarahMitchellAsset from "@/assets/sarah-mitchell.png.asset.json";

/* ---------- Engagement Team ---------- */
const engagementTeam: { name: string; role: string; avatar?: string; initials: string }[] = [
  { name: "Sarah Mitchell", role: "Service Delivery Director", avatar: sarahMitchellAsset.url, initials: "SM" },
  { name: "Marcus Chen",    role: "SRE Lead",                  initials: "MC" },
  { name: "Priya Raman",    role: "Cyber Resilience Lead",     initials: "PR" },
  { name: "David Okafor",   role: "Platform Engineering Lead", initials: "DO" },
  { name: "Elena Rossi",    role: "Modernization Architect",   initials: "ER" },
  { name: "James Carter",   role: "Transition Program Lead",   initials: "JC" },
  { name: "Aisha Patel",    role: "Value Realization Lead",    initials: "AP" },
];

/* ---------- Mock data ---------- */
const reliabilitySpark = Array.from({ length: 30 }, (_, i) => ({ x: i, y: 86 + Math.sin(i / 3) * 3 + i * 0.25 }));
const costSpark = Array.from({ length: 20 }, (_, i) => ({ x: i, y: 60 - i * 0.6 + Math.sin(i) * 2 }));
const months = ["May 25","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan 26","Feb","Mar","Apr","May 26"];
const trend = (start: number, end: number) => months.map((m, i) => ({ m, v: start + (end - start) * (i / (months.length - 1)) + (Math.sin(i * 1.3) * (Math.abs(end - start) * 0.06)) }));

const kpis = [
  { key: "rel",   title: "RELIABILITY HEALTH",   value: "94%", trend: "+6 pts vs last 30 days", icon: ShieldCheck, color: "emerald" },
  { key: "cyber", title: "CYBER EXPOSURE",       value: "18",  trend: "Open Critical Findings", icon: ShieldAlert, color: "rose" },
  { key: "mod",   title: "MODERNIZATION DEBT",   value: "62%", trend: "Resolved",               icon: Box,         color: "indigo" },
  { key: "cost",  title: "CLOUD COST POSTURE",   value: "$4.2M", trend: "Annualized Spend",     icon: Cloud,       color: "blue" },
  { key: "trans", title: "TRANSITION READINESS", value: "81%", trend: "Readiness Score",        icon: Users,       color: "violet" },
];

const workflows = [
  { key: "evv",     name: "Caregiver Visit / EVV", desc: "Digital visit verification and caregiver engagement", health: 97, owner: "Caregiver Platform Team", status: "healthy", deps: [
    { name: "Mobile Services", icon: Smartphone }, { name: "Identity", icon: Key }, { name: "API Gateway", icon: Network }, { name: "AWS Platform", icon: Cloud }, { name: "SQL Cluster", icon: Database },
  ], insight: { tone: "ai", text: "AI Recommendation", sub: "Move API workload to managed container platform" } },
  { key: "claims",  name: "Claims Processing", desc: "Claims intake, adjudication and payment", health: 93, owner: "Revenue Operations", status: "healthy", deps: [
    { name: "Claims APIs", icon: Network }, { name: "Data Warehouse", icon: Database }, { name: "SQL Platform", icon: Database }, { name: "S3 Storage", icon: HardDrive },
  ], insight: { tone: "risk", text: "Risk", sub: "Storage latency trending up" } },
  { key: "payroll", name: "Payroll Processing", desc: "Caregiver payroll and tax management", health: 98, owner: "Payroll Engineering", status: "healthy", deps: [
    { name: "Workforce Platform", icon: Users }, { name: "Identity", icon: Key }, { name: "Reporting Services", icon: FileText }, { name: "SQL Database", icon: Database },
  ], insight: { tone: "ok", text: "No risks detected", sub: "" } },
  { key: "phi",     name: "PHI Protection", desc: "Protect patient data and ensure privacy compliance", health: 95, owner: "Cybersecurity Team", status: "healthy", deps: [
    { name: "IAM", icon: Key }, { name: "Encryption", icon: Lock }, { name: "Logging", icon: FileText }, { name: "DLP", icon: ShieldCheck }, { name: "SIEM", icon: Eye },
  ], insight: { tone: "risk", text: "2 Open Findings", sub: "High severity" } },
  { key: "sla",     name: "State SLA / Customer Commitments", desc: "State reporting and customer commitments", health: 91, owner: "Platform Operations", status: "healthy", deps: [
    { name: "Customer Portals", icon: Users }, { name: "Reporting Services", icon: FileText }, { name: "Data Platform", icon: Database }, { name: "Legacy Infra", icon: Server },
  ], insight: { tone: "risk", text: "Risk", sub: "Legacy infrastructure dependency" } },
];

const sreStages = [
  { name: "Current State",  pct: 100, status: "Complete",     state: "done" },
  { name: "Stabilized",     pct: 100, status: "Complete",     state: "done" },
  { name: "Standardized",   pct: 68,  status: "In Progress",  state: "current" },
  { name: "Automated",      pct: 32,  status: "Planned",      state: "planned" },
  { name: "Product Owned",  pct: 15,  status: "Planned",      state: "planned" },
  { name: "Self Healing",   pct: 5,   status: "Future State", state: "future" },
];

const risks = [
  "Legacy SQL dependency increases outage risk",
  "Manual recovery processes in 23 services",
  "Limited container adoption (28% workloads)",
];
const opportunities = [
  "Expand Infrastructure as Code (IaC) adoption",
  "Increase automation coverage of runbooks",
  "Consolidate monitoring platforms",
];

const reliabilityTrends = [
  { key: "sev1", title: "Sev1 Incidents",      change: "-18%", color: "#ef4444", data: trend(58, 22) },
  { key: "sev2", title: "Sev2 Incidents",      change: "-12%", color: "#f59e0b", data: trend(94, 60) },
  { key: "mttr", title: "MTTR",                change: "21% Improved", color: "#10b981", data: trend(46, 28) },
  { key: "mttd", title: "MTTD",                change: "17% Improved", color: "#3b82f6", data: trend(20, 12) },
  { key: "cfr",  title: "Change Failure Rate", change: "32% Improved", color: "#06b6d4", data: trend(18, 9) },
];

const aiCaps = [
  "Detection & Alert Enrichment", "Correlation & Impact Analysis",
  "Summarization & Reporting", "Root Cause Analysis",
  "Runbook Generation", "Change Preparation",
  "Cost Optimization", "Modernization Planning",
];

const approvalQueue = [
  "Approve rolling patch plan for HHA Enterprise SQL support nodes",
  "Approve IaC drift correction for Pavilio AWS account",
  "Approve Datadog monitor threshold update for Claims API latency",
  "Approve inactive security group cleanup in Self Direction GCP project",
];

const modDebt = [{ name: "Resolved", v: 62 }, { name: "Remaining", v: 38 }];

/* ---------- Helpers ---------- */
const healthChip = (h: number) => {
  if (h >= 90) return { bg: "bg-emerald-50", text: "text-emerald-700", label: "Healthy" };
  if (h >= 70) return { bg: "bg-amber-50",   text: "text-amber-700",   label: "Watch" };
  if (h >= 50) return { bg: "bg-orange-50",  text: "text-orange-700",  label: "At Risk" };
  return        { bg: "bg-rose-50",          text: "text-rose-700",    label: "Critical" };
};

function CardShell({ title, action, children, className = "", onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">{title}</div>
        <div className="flex items-center gap-1.5">
          {action}
          <button onClick={(e) => { e.stopPropagation(); }} className="p-1 rounded hover:bg-slate-100 text-slate-400">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function ProdResilienceTwin() {
  const [drawer, setDrawer] = useState<{ title: string; subtitle?: string; body?: any } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({
    env: "Production", product: "All", hosting: "All", workflow: "All", risk: "All", time: "30 days", owner: "All",
  });
  const activeFilters = useMemo(
    () => Object.entries(filters).filter(([k, v]) => !["All", "Production", "30 days"].includes(v) || (k === "env" && v !== "Production")).map(([k,v]) => ({ k, v })),
    [filters]
  );

  const openDrawer = (title: string, subtitle?: string, body?: any) => setDrawer({ title, subtitle, body });

  const filterDef = [
    { k: "env",      label: "Environment",  opts: ["Production","Non Production","All"] },
    { k: "product",  label: "Product",      opts: ["All","Enterprise","ProviderPro","Pavilio","Fuse","Self Direction","Sandata","Generations"] },
    { k: "hosting",  label: "Hosting",      opts: ["All","AWS","GCP","Virginia Data Center","Liquid Web"] },
    { k: "workflow", label: "Workflow",     opts: ["All","Caregiver Visit / EVV","Claims","Payroll","PHI","State SLA"] },
    { k: "risk",     label: "Risk Level",   opts: ["All","Healthy","Watch","At Risk","Critical"] },
    { k: "time",     label: "Time Range",   opts: ["24 hours","7 days","30 days","90 days","12 months"] },
    { k: "owner",    label: "Owner",        opts: ["All","Platform Operations","Cybersecurity","Revenue Operations","Payroll Engineering","Caregiver Platform Team"] },
  ];

  return (
    <AppShell>
      <main className="flex-1 bg-slate-50/60 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-slate-200/80 px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[12px] font-semibold text-slate-600">HHAX Production Resilience Operating System</div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-0.5">PROD Resilience Command Center</h1>
              <p className="text-sm text-slate-500 mt-1.5 max-w-3xl">
                Protect caregiver, claims, payroll, state compliance, customer commitments, and revenue workflows while modernizing the operating model.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                </span>
                <span className="text-[11px] text-slate-500 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">Last updated: 9:42 AM ET</span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                  Operating Health: <b className="text-emerald-600">Healthy</b> <CheckCircle2 className="inline h-3 w-3 text-emerald-600 ml-0.5" />
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                  SRE Transformation Stage: <b>Standardized → Automated</b>
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 shrink-0">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm min-w-[360px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Executive Status</div>
                  <button onClick={() => openDrawer("Executive Status Report")} className="text-[11px] text-blue-600 hover:underline">View full report</button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { l: "Reliability Health", v: "94", icon: ShieldCheck, c: "text-emerald-600" },
                    { l: "Open Risks",         v: "18", icon: ShieldAlert, c: "text-rose-600" },
                    { l: "Modernization",      v: "62%", icon: Box,        c: "text-indigo-600" },
                    { l: "Cloud Cost",         v: "On Target", icon: Cloud, c: "text-blue-600", small: true },
                    { l: "Transition",         v: "81%", icon: Users,      c: "text-violet-600" },
                  ].map((m) => {
                    const I = m.icon;
                    return (
                      <button key={m.l} onClick={() => openDrawer(m.l)} className="text-center hover:bg-slate-50 rounded-lg p-1 transition">
                        <I className={`h-4 w-4 mx-auto ${m.c}`} />
                        <div className={`${m.small ? "text-[11px]" : "text-base"} font-bold text-slate-900 mt-0.5`}>{m.v}</div>
                        <div className="text-[9px] text-slate-500 leading-tight">{m.l}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button className="relative p-2 rounded-lg hover:bg-slate-100">
                  <Bell className="h-4 w-4 text-slate-600" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">2</span>
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-100"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[11px] font-bold grid place-items-center">RA</div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            {filterDef.map((f) => (
              <Select key={f.k} value={filters[f.k]} onValueChange={(v) => { setFilters((p) => ({ ...p, [f.k]: v })); toast.success(`${f.label}: ${v}`); }}>
                <SelectTrigger className="h-8 w-auto min-w-[150px] text-xs bg-white">
                  <span className="text-slate-500 mr-1">{f.label}:</span><SelectValue />
                </SelectTrigger>
                <SelectContent>{f.opts.map((o) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
              </Select>
            ))}
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setFilters({ env: "Production", product: "All", hosting: "All", workflow: "All", risk: "All", time: "30 days", owner: "All" })}>
              Reset filters
            </Button>
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-1.5 ml-2">
                {activeFilters.map(({ k, v }) => (
                  <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px]">
                    {v}
                    <button onClick={() => setFilters((p) => ({ ...p, [k]: k === "env" ? "Production" : k === "time" ? "30 days" : "All" }))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Engagement Team */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide shrink-0">Engagement Team</div>
            <div className="flex items-center gap-3 overflow-x-auto">
              {engagementTeam.map((m) => (
                <button
                  key={m.name}
                  onClick={() => openDrawer(m.name, m.role)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition shrink-0"
                >
                  <div className="relative">
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-white text-[11px] font-bold grid place-items-center ring-2 ring-white shadow-sm">
                        {m.initials}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-[12px] font-semibold text-slate-900 leading-tight">{m.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{m.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            {/* Reliability */}
            <CardShell title="Reliability Health" onClick={() => openDrawer("Reliability Health", "Drivers, trend & top impacted workflows")}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-4xl font-bold text-emerald-600 leading-none">94%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +6 pts vs last 30 days</div>
                </div>
                <div className="h-9 w-9 rounded-full bg-emerald-50 grid place-items-center"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
              </div>
              <div className="h-12 mt-2">
                <ResponsiveContainer width="100%" height="100%"><LineChart data={reliabilitySpark}><Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-2">Primary Contributors</div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                <li className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-emerald-500" /> Reduced Sev1 Volume</li>
                <li className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-emerald-500" /> Improved Detection Time</li>
                <li className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-emerald-500" /> Improved Recovery Time</li>
              </ul>
            </CardShell>

            {/* Cyber */}
            <CardShell title="Cyber Exposure" onClick={() => openDrawer("Cyber Exposure", "Open critical findings by category")}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-4xl font-bold text-rose-600 leading-none">18</div>
                  <div className="text-[11px] text-slate-500 mt-1">Open Critical Findings</div>
                </div>
                <div className="h-9 w-9 rounded-full bg-rose-50 grid place-items-center"><ShieldAlert className="h-5 w-5 text-rose-600" /></div>
              </div>
              <div className="mt-3 space-y-1.5">
                {[{n:"Identity",v:6,c:"bg-rose-500"},{n:"Cloud",v:5,c:"bg-orange-500"},{n:"Vulnerability",v:4,c:"bg-amber-500"},{n:"Third Party",v:3,c:"bg-yellow-500"}].map((r) => (
                  <div key={r.n} className="flex items-center gap-2 text-[11px]">
                    <div className="w-20 text-slate-600">{r.n}</div>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100"><div className={`h-1.5 rounded-full ${r.c}`} style={{ width: `${(r.v/6)*100}%` }} /></div>
                    <div className="w-4 font-bold text-slate-900 text-right">{r.v}</div>
                  </div>
                ))}
              </div>
            </CardShell>

            {/* Mod debt */}
            <CardShell title="Modernization Debt" onClick={() => openDrawer("Modernization Debt", "Resolved vs remaining backlog")}>
              <div className="flex items-start gap-2">
                <div className="relative" style={{ width: 86, height: 86 }}>
                  <PieChart width={86} height={86}>
                    <Pie data={modDebt} dataKey="v" cx={43} cy={43} innerRadius={28} outerRadius={40} startAngle={90} endAngle={-270}>
                      <Cell fill="#6366f1" /><Cell fill="#e2e8f0" />
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-base font-bold text-indigo-600 leading-none">62%</div>
                      <div className="text-[8px] text-slate-500">Resolved</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-[10px] space-y-0.5 mt-1">
                  <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-indigo-500 rounded-sm" /> Resolved <span className="ml-auto font-bold">62%</span></div>
                  <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-slate-300 rounded-sm" /> Remaining <span className="ml-auto font-bold">38%</span></div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-2">Top Remaining Debt</div>
              <ul className="mt-1 space-y-0.5 text-[11px]">
                {[{n:"Legacy SQL",v:"34%"},{n:"Monolithic Services",v:"28%"},{n:"Manual Deployments",v:"18%"}].map((d) => (
                  <li key={d.n} className="flex items-center gap-1 text-slate-700"><span className="h-1 w-1 rounded-full bg-indigo-400" />{d.n}<span className="ml-auto font-bold">{d.v}</span></li>
                ))}
              </ul>
            </CardShell>

            {/* Cost */}
            <CardShell title="Cloud Cost Posture" onClick={() => openDrawer("Cloud Cost Posture", "Spend by provider & savings opportunities")}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600 leading-none">$4.2<span className="text-xl">M</span></div>
                  <div className="text-[11px] text-slate-500 mt-1">Annualized Spend</div>
                </div>
                <div className="h-9 w-9 rounded-full bg-blue-50 grid place-items-center"><Cloud className="h-5 w-5 text-blue-600" /></div>
              </div>
              <div className="mt-3 rounded-lg bg-emerald-50/50 border border-emerald-100 p-2">
                <div className="text-[10px] text-slate-600">Optimization Opportunity</div>
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold text-emerald-700">$710K</div>
                  <div className="text-[10px] text-slate-500">(17% of spend)</div>
                </div>
                <div className="h-8 mt-1">
                  <ResponsiveContainer width="100%" height="100%"><AreaChart data={costSpark}><Area type="monotone" dataKey="y" stroke="#10b981" fill="#10b98122" strokeWidth={1.5} /></AreaChart></ResponsiveContainer>
                </div>
              </div>
            </CardShell>

            {/* Transition */}
            <CardShell title="Transition Readiness" onClick={() => openDrawer("Transition Readiness", "By tower & dependencies")}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-4xl font-bold text-violet-600 leading-none">81%</div>
                  <div className="text-[11px] text-slate-500 mt-1">Readiness Score</div>
                </div>
                <div className="h-9 w-9 rounded-full bg-violet-50 grid place-items-center"><Users className="h-5 w-5 text-violet-600" /></div>
              </div>
              <div className="mt-2 space-y-1.5">
                {[{n:"Documentation",v:85},{n:"Runbooks",v:78},{n:"Ownership",v:82},{n:"Automation Coverage",v:76}].map((p) => (
                  <div key={p.n}>
                    <div className="flex justify-between text-[10px]"><span className="text-slate-600">{p.n}</span><span className="font-bold text-slate-800">{p.v}%</span></div>
                    <div className="h-1 rounded-full bg-slate-100 mt-0.5"><div className="h-1 rounded-full bg-violet-500" style={{ width: `${p.v}%` }} /></div>
                  </div>
                ))}
              </div>
            </CardShell>
          </div>

          {/* Middle row */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
            {/* SRE Transformation */}
            <div className="xl:col-span-3">
              <CardShell title="SRE Transformation Posture">
                <div className="grid place-items-center py-2">
                  <div className="relative" style={{ width: 160, height: 100 }}>
                    <svg viewBox="0 0 160 100" className="w-full h-full">
                      <path d="M 15 90 A 65 65 0 0 1 145 90" stroke="#e2e8f0" strokeWidth="12" fill="none" strokeLinecap="round" />
                      <path d="M 15 90 A 65 65 0 0 1 145 90" stroke="#3b82f6" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray="204" strokeDashoffset="65" />
                    </svg>
                    <div className="absolute inset-x-0 bottom-0 text-center">
                      <div className="text-xs font-bold text-blue-600">STANDARDIZED</div>
                      <div className="text-[9px] text-slate-500">Current Stage</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {sreStages.map((s, i) => {
                    const isCurrent = s.state === "current";
                    const isDone = s.state === "done";
                    return (
                      <button
                        key={s.name}
                        onClick={() => openDrawer(`Stage: ${s.name}`, s.status)}
                        className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 transition ${isCurrent ? "bg-blue-50/60 border border-blue-100" : ""}`}
                      >
                        <div className={`h-4 w-4 rounded-full grid place-items-center shrink-0 ${isDone ? "bg-emerald-500" : isCurrent ? "bg-blue-500" : "border border-slate-300 bg-white"}`}>
                          {isDone && <CheckCircle2 className="h-3 w-3 text-white" />}
                          {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] font-semibold text-slate-700">{s.name}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[11px] font-bold ${isDone ? "text-emerald-600" : isCurrent ? "text-blue-600" : "text-slate-400"}`}>{s.pct}%</div>
                          <div className="text-[9px] text-slate-500">{s.status}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => openDrawer("SRE Roadmap Details")} className="w-full text-center text-[11px] text-blue-600 font-semibold mt-3 hover:underline">
                  View roadmap details →
                </button>
              </CardShell>
            </div>

            {/* Critical Workflow Resilience */}
            <div className="xl:col-span-6">
              <CardShell
                title="Critical Workflow Resilience"
                action={<button onClick={() => openDrawer("All Workflows")} className="text-[11px] text-blue-600 hover:underline">View all workflows</button>}
              >
                <div className="grid grid-cols-12 text-[9px] font-bold tracking-wider text-slate-400 uppercase pb-2 border-b border-slate-100">
                  <div className="col-span-3">Workflow</div>
                  <div className="col-span-1 text-center">Health</div>
                  <div className="col-span-2">Owner</div>
                  <div className="col-span-3">Key Dependencies</div>
                  <div className="col-span-3">Top Risks / AI Insights</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {workflows.map((w) => {
                    const chip = healthChip(w.health);
                    const insightTone = w.insight.tone === "ai" ? "bg-amber-50 text-amber-700 border-amber-100"
                      : w.insight.tone === "risk" ? "bg-rose-50 text-rose-700 border-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100";
                    const insightIcon = w.insight.tone === "ai" ? Sparkles : w.insight.tone === "risk" ? AlertTriangle : CheckCircle2;
                    const InsightI = insightIcon;
                    return (
                      <div
                        key={w.key}
                        onClick={() => openDrawer(`Workflow Detail: ${w.name}`, w.desc, w)}
                        className="grid grid-cols-12 items-center py-2.5 group hover:bg-blue-50/30 cursor-pointer rounded-lg px-1 -mx-1"
                      >
                        <div className="col-span-3 flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 grid place-items-center shrink-0"><Activity className="h-4 w-4" /></div>
                          <div className="min-w-0">
                            <div className="text-[12px] font-semibold text-slate-800 truncate">{w.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{w.desc}</div>
                          </div>
                        </div>
                        <div className="col-span-1 text-center">
                          <div className="text-base font-bold text-slate-900 leading-none">{w.health}</div>
                          <div className={`text-[9px] font-semibold ${chip.text}`}>{chip.label}</div>
                        </div>
                        <div className="col-span-2 text-[11px] text-slate-700 flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-slate-400" />{w.owner}
                        </div>
                        <div className="col-span-3 flex flex-wrap gap-1">
                          {w.deps.map((d) => {
                            const DI = d.icon;
                            return (
                              <button
                                key={d.name}
                                onClick={(e) => { e.stopPropagation(); openDrawer(`Dependency Detail: ${d.name}`, "Connected workflows, hosting & risks"); }}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[10px] text-slate-700"
                              >
                                <DI className="h-2.5 w-2.5 text-slate-500" />{d.name}
                              </button>
                            );
                          })}
                        </div>
                        <div className="col-span-3">
                          <div className={`inline-flex items-start gap-1.5 px-2 py-1 rounded-md border ${insightTone}`}>
                            <InsightI className="h-3 w-3 mt-0.5 shrink-0" />
                            <div className="text-[10px] leading-tight">
                              <div className="font-semibold">{w.insight.text}</div>
                              {w.insight.sub && <div className="opacity-80">{w.insight.sub}</div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-[10px] text-slate-500">
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Healthy (90-100)</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Watch (70-89)</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" />At Risk (50-69)</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Critical (0-49)</span>
                  </div>
                  <span className="flex items-center gap-1 text-blue-600"><Sparkles className="h-3 w-3" /> AI insights powered by Neurealm</span>
                </div>
              </CardShell>
            </div>

            {/* Executive Insights */}
            <div className="xl:col-span-3">
              <CardShell
                title="Executive Insights"
                action={<button onClick={() => openDrawer("Full Executive Analysis")} className="text-[11px] text-blue-600 hover:underline">View full analysis</button>}
              >
                <div className="text-[10px] font-bold text-slate-600 tracking-wider mb-1">RISKS</div>
                <ul className="space-y-1 mb-2">
                  {risks.map((r) => (
                    <li key={r} onClick={() => openDrawer(`Risk: ${r}`)} className="flex items-start gap-1.5 text-[11px] text-slate-700 hover:text-blue-600 cursor-pointer">
                      <span className="h-1 w-1 mt-1.5 rounded-full bg-rose-500 shrink-0" />{r}
                    </li>
                  ))}
                </ul>
                <button onClick={() => openDrawer("All Risks")} className="text-[10px] text-blue-600 hover:underline">View all risks →</button>

                <div className="text-[10px] font-bold text-slate-600 tracking-wider mt-3 mb-1">OPPORTUNITIES</div>
                <ul className="space-y-1 mb-2">
                  {opportunities.map((o) => (
                    <li key={o} onClick={() => openDrawer(`Opportunity: ${o}`)} className="flex items-start gap-1.5 text-[11px] text-slate-700 hover:text-blue-600 cursor-pointer">
                      <span className="h-1 w-1 mt-1.5 rounded-full bg-emerald-500 shrink-0" />{o}
                    </li>
                  ))}
                </ul>
                <button onClick={() => openDrawer("All Opportunities")} className="text-[10px] text-blue-600 hover:underline">View all opportunities →</button>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 tracking-wide">MODERNIZATION PROGRESS</div>
                    <div className="text-lg font-bold text-indigo-600">62%</div>
                    <div className="h-1 rounded-full bg-slate-100 mt-1"><div className="h-1 rounded-full bg-indigo-500" style={{ width: "62%" }} /></div>
                    <div className="text-[9px] text-emerald-600 mt-0.5">+8% vs last quarter</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 tracking-wide">AUTOMATION PROGRESS</div>
                    <div className="text-lg font-bold text-violet-600">47%</div>
                    <div className="h-1 rounded-full bg-slate-100 mt-1"><div className="h-1 rounded-full bg-violet-500" style={{ width: "47%" }} /></div>
                    <div className="text-[9px] text-emerald-600 mt-0.5">+6% vs last quarter</div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="text-[9px] font-bold text-slate-500 tracking-wide mb-1">RELIABILITY TREND (30 DAYS)</div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    {[{l:"MTTR",v:"21%",t:"Improved"},{l:"Sev1 Volume",v:"18%",t:"Reduced"},{l:"Change Failure",v:"32%",t:"Improved"}].map((m) => (
                      <div key={m.l}>
                        <div className="text-[9px] text-slate-500">{m.l}</div>
                        <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-0.5"><TrendingDown className="h-3 w-3" />{m.v}</div>
                        <div className="text-[8px] text-slate-400">{m.t}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => openDrawer("Reliability Report")} className="block text-center w-full text-[10px] text-blue-600 hover:underline mt-2">View reliability report →</button>
              </CardShell>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
            {/* Production Estate */}
            <div className="xl:col-span-4">
              <CardShell title="Production Estate Overview" action={<button onClick={() => openDrawer("Full Architecture")} className="text-[11px] text-blue-600 hover:underline">View full architecture</button>}>
                {[
                  { layer: "Applications", icon: Box, items: ["Enterprise","ProviderPro","Pavilio","Fuse","Self Direction","+12 more"] },
                  { layer: "Hosting",      icon: Cloud, items: ["AWS (us-east-1, us-west-2)","Google Cloud (us-central1)","Virginia Data Center"] },
                  { layer: "Data Layer",   icon: Database, items: ["SQL Server","PostgreSQL","Oracle","Amazon Aurora"] },
                  { layer: "Observability & Tooling", icon: Wrench, items: ["Datadog","GitHub Actions","SonarQube","Terraform","Jira","+More"] },
                ].map((row) => {
                  const RI = row.icon;
                  return (
                    <div key={row.layer} className="flex items-start gap-2 py-2 border-b border-slate-100 last:border-0">
                      <div className="w-24 shrink-0 flex items-center gap-1.5 pt-1 text-[10px] font-semibold text-slate-600">
                        <RI className="h-3.5 w-3.5 text-slate-400" /> {row.layer}
                      </div>
                      <div className="flex-1 flex flex-wrap gap-1.5">
                        {row.items.map((it) => (
                          <button
                            key={it}
                            onClick={() => openDrawer(`Node: ${it}`, row.layer)}
                            className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-[10px] text-slate-700"
                          >{it}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardShell>
            </div>

            {/* Reliability Trends */}
            <div className="xl:col-span-5">
              <CardShell title="Reliability Trends (12 Months)" action={<button onClick={() => openDrawer("Full Trends")} className="text-[11px] text-blue-600 hover:underline">View full trends</button>}>
                <div className="grid grid-cols-5 gap-2">
                  {reliabilityTrends.map((t) => (
                    <button key={t.key} onClick={() => openDrawer(`Trend: ${t.title}`)} className="text-left p-1 rounded-lg hover:bg-slate-50">
                      <div className="text-[10px] font-semibold text-slate-700 leading-tight">{t.title}</div>
                      <div className="text-sm font-bold mt-0.5" style={{ color: t.color }}>{t.change}</div>
                      <div className="text-[8px] text-slate-500">vs prior 12 months</div>
                      <div className="h-16 mt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={t.data} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
                            <Line type="monotone" dataKey="v" stroke={t.color} strokeWidth={1.5} dot={false} />
                            <XAxis dataKey="m" hide /><YAxis hide />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-400 px-0.5"><span>May '25</span><span>May '26</span></div>
                    </button>
                  ))}
                </div>
                <button onClick={() => openDrawer("SRE Reliability")} className="block text-center w-full text-[11px] text-blue-600 hover:underline mt-3">Go to SRE Reliability →</button>
              </CardShell>
            </div>

            {/* AI Safety */}
            <div className="xl:col-span-3">
              <CardShell title="AI Safety & Governance">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0" style={{ width: 56, height: 56 }}>
                    <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                      <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="6" fill="none" />
                      <circle cx="28" cy="28" r="22" stroke="#3b82f6" strokeWidth="6" fill="none" strokeDasharray="138" strokeDashoffset="35" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center"><Brain className="h-5 w-5 text-blue-600" /></div>
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">AI Assisted Operations</div>
                    <div className="text-[10px] text-slate-500 leading-snug">AI augments our teams with analysis, recommendations, and preparation. Human approval is required for all production-changing actions.</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3">
                  {aiCaps.map((c) => (
                    <div key={c} className="flex items-center gap-1 text-[10px] text-slate-700">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" /> {c}
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-2 py-1.5 flex items-center gap-1.5 text-[10px] text-blue-700">
                  <Lock className="h-3 w-3" /> Production changing actions require human approval.
                </div>
                <div className="flex gap-1.5 mt-2">
                  <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" onClick={() => openDrawer("AI Governance Policy")}>View policy</Button>
                  <Button size="sm" className="h-7 text-[10px] flex-1" onClick={() => openDrawer("Human Approval Queue", `${approvalQueue.length} pending actions`, { type: "approval" })}>Review queue</Button>
                </div>
              </CardShell>
            </div>
          </div>
        </div>

        {/* Drawer */}
        <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
          <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-lg">{drawer?.title}</SheetTitle>
              {drawer?.subtitle && <SheetDescription>{drawer.subtitle}</SheetDescription>}
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                <Badge variant="outline" className="bg-slate-50">Owner: Platform Operations</Badge>
              </div>
            </SheetHeader>
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid grid-cols-5 w-full h-8">
                <TabsTrigger value="overview" className="text-[10px]">Overview</TabsTrigger>
                <TabsTrigger value="deps" className="text-[10px]">Dependencies</TabsTrigger>
                <TabsTrigger value="risks" className="text-[10px]">Risks</TabsTrigger>
                <TabsTrigger value="actions" className="text-[10px]">Actions</TabsTrigger>
                <TabsTrigger value="audit" className="text-[10px]">Audit Trail</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="text-xs space-y-3 pt-3">
                {drawer?.body?.type === "approval" ? (
                  <div className="space-y-2">
                    {approvalQueue.map((a) => (
                      <div key={a} className="rounded-lg border border-slate-200 p-2.5">
                        <div className="text-[11px] text-slate-800">{a}</div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="h-6 text-[10px]" onClick={() => toast.success("Approved")}>Approve</Button>
                          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.message("Reviewing details")}>Review</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div><div className="text-[10px] font-bold text-slate-500 uppercase">Business Impact</div><p className="mt-1">Mission-critical workflow supporting HHAX caregivers, claims and customers across all product lines.</p></div>
                    <div><div className="text-[10px] font-bold text-slate-500 uppercase">Current Health Score</div><div className="text-2xl font-bold text-emerald-600">94</div></div>
                    <div><div className="text-[10px] font-bold text-slate-500 uppercase">Recent Incidents</div><p className="mt-1">2 Sev2 incidents in the last 30 days, both resolved within SLA.</p></div>
                    <div><div className="text-[10px] font-bold text-slate-500 uppercase">Automation Coverage</div><Progress value={64} className="h-2 mt-1" /><div className="text-[10px] mt-1">64% of operational tasks automated</div></div>
                  </>
                )}
              </TabsContent>
              <TabsContent value="deps" className="text-xs pt-3">
                <p>Connected services, infrastructure, and data dependencies feeding this view.</p>
              </TabsContent>
              <TabsContent value="risks" className="text-xs pt-3">
                <ul className="space-y-2">
                  {risks.map((r) => <li key={r} className="flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 text-rose-500 mt-0.5" />{r}</li>)}
                </ul>
              </TabsContent>
              <TabsContent value="actions" className="text-xs pt-3 space-y-2">
                <Button size="sm" className="w-full justify-start" onClick={() => toast.success("Action plan created")}><ClipboardCheck className="h-3 w-3 mr-2" />Create action plan</Button>
                <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast.success("Owner assigned")}><Users className="h-3 w-3 mr-2" />Assign owner</Button>
                <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast.success("Executive summary generated")}><FileBarChart2 className="h-3 w-3 mr-2" />Generate executive summary</Button>
                <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast.message("Opening related incidents")}><AlertTriangle className="h-3 w-3 mr-2" />Open related incidents</Button>
                <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast.success("Approval requested")}><Lock className="h-3 w-3 mr-2" />Request human approval</Button>
              </TabsContent>
              <TabsContent value="audit" className="text-xs pt-3 space-y-1.5">
                {["09:42 AM — Refresh by system","09:18 AM — Owner reviewed by RA","Yesterday — Approval workflow updated","2 days ago — SLO threshold tuned"].map((a) => (
                  <div key={a} className="flex items-center gap-2 text-slate-600"><Clock className="h-3 w-3" />{a}</div>
                ))}
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </main>
    </AppShell>
  );
}
