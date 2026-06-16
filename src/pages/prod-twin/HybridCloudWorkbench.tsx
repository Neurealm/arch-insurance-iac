import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Info, Filter, ChevronRight, TrendingUp, TrendingDown, Cloud, Database,
  ShieldCheck, Activity, DollarSign, Boxes, Monitor, Building2, KeyRound,
  Sparkles, AlertTriangle, Server, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Status = "healthy" | "watch" | "risk" | "critical";
const dotCls: Record<Status, string> = {
  healthy: "bg-emerald-500", watch: "bg-amber-500", risk: "bg-rose-500", critical: "bg-rose-600",
};
const chipCls: Record<Status, string> = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  watch:   "bg-amber-50 text-amber-700 border-amber-200",
  risk:    "bg-rose-50 text-rose-700 border-rose-200",
  critical:"bg-rose-100 text-rose-800 border-rose-300",
};

type Drawer = { title: string; subtitle?: string; kind: string; data?: any } | null;

const KPIS = [
  { id: "wl",   label: "Workloads",              value: "412",    sub: "Total",              hint: "+14 vs 30 days",   icon: Boxes,        accent: "text-blue-600", up: true },
  { id: "mod",  label: "Modernization Progress", value: "38%",    sub: "By Workloads",       hint: "+6% vs 30 days",   icon: Sparkles,     accent: "text-indigo-600", up: true },
  { id: "cost", label: "Cloud Cost (MTD)",       value: "$4.82M", sub: "Monthly",            hint: "-7% vs prior 30 days", icon: DollarSign, accent: "text-emerald-600", up: false },
  { id: "inc",  label: "Incidents Impacted",     value: "23",     sub: "Last 30 Days",       hint: "-35% vs 30 days",  icon: AlertTriangle,accent: "text-rose-600", up: false },
  { id: "rel",  label: "Reliability Score",      value: "92",     sub: "/ 100",              hint: "+3 pts vs 30 days",icon: ShieldCheck,  accent: "text-emerald-600", up: true },
  { id: "auto", label: "Automation Coverage",    value: "61%",    sub: "Operational Tasks",  hint: "+8% vs 30 days",   icon: Activity,     accent: "text-violet-600", up: true },
  { id: "val",  label: "Modernization Value",    value: "$6.41M", sub: "Projected 12 months",hint: "+11% vs 30 days",  icon: TrendingUp,   accent: "text-teal-600", up: true },
];

const ENVS = [
  { id: "aws",     name: "AWS",               sub: "Primary Cloud",            meta: "242 workloads · 61%",        status: "healthy" as Status, brand: "text-orange-500" },
  { id: "gcp",     name: "GCP",               sub: "Containment / Select",     meta: "48 workloads · 12%",         status: "watch"   as Status, brand: "text-sky-500" },
  { id: "azure",   name: "Azure / Entra ID",  sub: "Identity & Access",        meta: "Foundational",               status: "healthy" as Status, brand: "text-blue-600" },
  { id: "ashburn", name: "Ashburn DC",        sub: "Databases & Core Infra",   meta: "On-prem",                    status: "healthy" as Status, brand: "text-slate-700" },
  { id: "citrix",  name: "Citrix Environment",sub: "IDD Thick Client",         meta: "Operational",                status: "watch"   as Status, brand: "text-red-500" },
  { id: "oracle",  name: "Oracle / Exadata",  sub: "Critical Databases",       meta: "On AWS",                     status: "healthy" as Status, brand: "text-red-600" },
];

const WORKLOADS = [
  { wl: "Caregiver EVV (East Shard)",  crit: "Mission-critical", debt: "High",   ready: "Replatform", data: "High",   comp: "PHI",      op: "Incident-prone", auto: "Scriptable", cost: "High",   action: "Migrate to EKS + Aurora", score: 87 },
  { wl: "IDD Thick Client",            crit: "High",             debt: "Medium", ready: "Rehost",     data: "Medium", comp: "PHI",      op: "Stable",         auto: "Manual",     cost: "Medium", action: "Optimize Citrix + Surges", score: 74 },
  { wl: "Claims Processing Batch",     crit: "High",             debt: "High",   ready: "Refactor",   data: "High",   comp: "PHI",      op: "Incident-prone", auto: "Scriptable", cost: "High",   action: "Refactor + Event Driven", score: 82 },
  { wl: "Payroll & Timekeeping",       crit: "High",             debt: "Medium", ready: "Replatform", data: "Medium", comp: "PHI / PCI",op: "Stable",         auto: "API-ready",  cost: "Medium", action: "Move to Managed Services", score: 71 },
  { wl: "Reporting & Analytics",       crit: "Medium",           debt: "High",   ready: "Replatform", data: "High",   comp: "PHI",      op: "Stable",         auto: "API-ready",  cost: "High",   action: "Modernize on AWS", score: 78 },
  { wl: "Legacy Windows App (IIS)",    crit: "Low",              debt: "High",   ready: "Retire",     data: "Low",    comp: "None",     op: "Fragile",        auto: "Manual",     cost: "High",   action: "Retire / Replace", score: 91 },
  { wl: "Sandata Fuse Integration",    crit: "High",             debt: "Medium", ready: "Replatform", data: "Medium", comp: "PHI",      op: "Stable",         auto: "Scriptable", cost: "Medium", action: "Containerize Connectors", score: 72 },
  { wl: "Data Mart ETL",               crit: "Medium",           debt: "Medium", ready: "Replatform", data: "Medium", comp: "PHI",      op: "Stable",         auto: "API-ready",  cost: "Medium", action: "Move to Managed ETL", score: 69 },
];

// tag color map for decision engine cells
function tagCls(v: string): string {
  const r = "border-rose-200 bg-rose-50 text-rose-700";
  const o = "border-orange-200 bg-orange-50 text-orange-700";
  const a = "border-amber-200 bg-amber-50 text-amber-700";
  const e = "border-emerald-200 bg-emerald-50 text-emerald-700";
  const b = "border-blue-200 bg-blue-50 text-blue-700";
  const v2 = "border-violet-200 bg-violet-50 text-violet-700";
  const s = "border-slate-200 bg-slate-50 text-slate-700";
  switch (v) {
    case "Mission-critical": case "High": case "Incident-prone": case "Fragile": return r;
    case "Medium": case "Manual": case "Rehost": return a;
    case "Low": case "Stable": case "API-ready": case "Scriptable": return e;
    case "PHI": case "PHI / PCI": return v2;
    case "Replatform": case "Refactor": case "Retire": return b;
    case "None": return s;
    default: return o;
  }
}

const INSIGHTS = [
  { icon: AlertTriangle, color: "text-rose-600",    title: "Top Risk",                  sub: "3 workloads at risk of missing SLOs" },
  { icon: TrendingUp,    color: "text-emerald-600", title: "Migration Opportunity",     sub: "38 workloads ready for next step" },
  { icon: DollarSign,    color: "text-amber-600",   title: "Cost Optimization",         sub: "$1.21M monthly savings available" },
  { icon: ShieldCheck,   color: "text-blue-600",    title: "Reliability Improvement",   sub: "MTTR down 32% this month" },
];

const RECS = [
  { title: "Migrate 12 SQL Server DBs",  sub: "to Aurora PostgreSQL · Est. savings: $420K / year",  cta: "Review" },
  { title: "Rightsize 83 EC2 Instances", sub: "Est. savings: $310K / year",                          cta: "Review" },
  { title: "Automate 27 Manual Tasks",   sub: "Est. 1,380 hrs saved / month",                        cta: "Review" },
  { title: "Optimize Citrix Surges",     sub: "Est. savings: $180K / year",                          cta: "Review" },
];

const ROADMAP = [
  { name: "Assessment",  v: 100, color: "text-emerald-500" },
  { name: "Planning",    v: 68,  color: "text-blue-500" },
  { name: "Execution",   v: 28,  color: "text-amber-500" },
  { name: "Validation",  v: 12,  color: "text-violet-500" },
];

function spark(points: number, seed = 1) {
  let s = seed;
  return Array.from({ length: points }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    return 50 + (s / 233280) * 30 - 15 + Math.sin(i / 2 + seed) * 6;
  });
}
function Sparkline({ data, className, up = true }: { data: number[]; className?: string; up?: boolean }) {
  const w = 100, h = 30;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / Math.max(0.0001, max - min)) * (h - 4) - 2;
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const fill = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-7 w-full", className, up ? "text-emerald-500" : "text-rose-500")}>
      <path d={fill} className="fill-current opacity-10" />
      <path d={path} fill="none" strokeWidth={1.5} className="stroke-current" />
    </svg>
  );
}

// Donut for workbench cards
function Donut({ segments, center }: { segments: { label: string; value: number; color: string }[]; center: { v: string; sub: string } }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
          {segments.map((s, i) => {
            const v = (s.value / total) * 100;
            const el = <circle key={i} cx="18" cy="18" r="15.9" fill="none" className={s.color} strokeWidth="3.5"
              strokeDasharray={`${v} 100`} strokeDashoffset={-acc} strokeLinecap="butt" />;
            acc += v;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold tabular-nums">{center.v}</div>
          <div className="text-[10px] text-slate-500">{center.sub}</div>
        </div>
      </div>
      <ul className="flex-1 space-y-1">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", s.color.replace("stroke-", "bg-"))} /><span className="text-slate-700">{s.label}</span></span>
            <span className="font-semibold tabular-nums text-slate-800">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HybridCloudWorkbench() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const open = (d: Drawer) => setDrawer(d);

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50/60 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Client Production Resilience Operating System</div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Hybrid Cloud, Data & Modernization Workbench</h1>
              <Info className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-0.5 text-xs text-slate-500">Operate today. Modernize with confidence. Deliver lasting value.</div>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="Production">
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><SelectValue /></span>
              </SelectTrigger>
              <SelectContent>{["Production","Non Production","All"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select defaultValue="Last 30 days">
              <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{["Last 30 days","Last 90 days","Last 12 months"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 border-blue-200 bg-blue-50 text-blue-700"><Filter className="h-3.5 w-3.5" /> Filters (6)</Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {KPIS.map((k, i) => {
              const Icon = k.icon;
              return (
                <button key={k.id} onClick={() => open({ kind: "kpi", title: k.label, subtitle: k.sub, data: k })}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <div className={cn("rounded-md bg-slate-50 p-1.5", k.accent)}><Icon className="h-4 w-4" /></div>
                    <div className="text-[11px] font-medium text-slate-600">{k.label}</div>
                  </div>
                  <div className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{k.value}</div>
                  <div className="text-[11px] text-slate-500">{k.sub}</div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
                    <span className={cn("inline-flex items-center gap-0.5", k.up ? "text-emerald-600" : "text-rose-600")}>
                      {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{k.hint}
                    </span>
                    <div className="h-5 w-16"><Sparkline data={spark(20, i + 3)} up={k.up} /></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4">
          <div className="col-span-12 space-y-4 xl:col-span-9">

            {/* Hybrid Environment Overview */}
            <Card title="Hybrid Environment Overview">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {ENVS.map(e => {
                  const icon = e.id === "aws" ? Cloud : e.id === "gcp" ? Cloud : e.id === "azure" ? KeyRound :
                               e.id === "ashburn" ? Building2 : e.id === "citrix" ? Monitor : Database;
                  const Icon = icon;
                  return (
                    <button key={e.id} onClick={() => open({ kind: "env", title: e.name, subtitle: e.sub, data: e })}
                      className="group rounded-xl border border-slate-200 bg-white p-3 text-left hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                      <div className="flex items-start gap-2">
                        <div className={cn("rounded-md bg-slate-50 p-1.5", e.brand)}><Icon className="h-4 w-4" /></div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{e.name}</div>
                          <div className="text-[11px] text-slate-500">{e.sub}</div>
                        </div>
                        <span className={cn("h-1.5 w-1.5 rounded-full", dotCls[e.status])} />
                      </div>
                      <div className="mt-2 text-[12px] font-medium text-slate-700">{e.meta}</div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Modernization Workbench */}
            <Card title="Modernization Workbench">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {/* 1 Ashburn DB */}
                <WBCard title="Ashburn Database" sub="Modernization" icon={<Building2 className="h-4 w-4 text-slate-600" />}
                  onClick={() => open({ kind: "wb", title: "Ashburn Database", subtitle: "Modernization" })}>
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className={cn("h-6 rounded border", i % 4 === 0 ? "border-amber-300 bg-amber-50" : "border-slate-300 bg-white")} />
                      ))}
                    </div>
                    <div className="mt-2 text-center text-[10px] uppercase tracking-wider text-slate-400">SQL Server Shard Topology</div>
                  </div>
                  <StatList rows={[
                    ["SQL Server Shards", "24"],
                    ["Storage", "1.82 PB"],
                    ["Avg CPU", "42%"],
                    ["Replication", "2-way"],
                    ["Backup Success", "98.6%"],
                  ]} />
                  <div className="mt-2 h-8 text-emerald-500"><Sparkline data={spark(28, 12)} /></div>
                </WBCard>

                {/* 2 AWS Modernization */}
                <WBCard title="AWS Modernization" sub="EC2, EKS, ECS, Lambda" icon={<Cloud className="h-4 w-4 text-orange-500" />}
                  onClick={() => open({ kind: "wb", title: "AWS Modernization", subtitle: "EC2, EKS, ECS, Lambda" })}>
                  <Donut center={{ v: "242", sub: "Workloads" }} segments={[
                    { label: "EC2 (Windows)", value: 82,  color: "stroke-blue-500" },
                    { label: "EC2 (Linux)",   value: 96,  color: "stroke-sky-500" },
                    { label: "EKS",           value: 28,  color: "stroke-emerald-500" },
                    { label: "Lambda",        value: 18,  color: "stroke-violet-500" },
                    { label: "Other",         value: 18,  color: "stroke-slate-400" },
                  ]} />
                  <StatList rows={[
                    ["Rightsized Savings", "$1.21M", "text-emerald-700"],
                    ["EC2 Lifecycle > 3 yrs", "61", "text-amber-700"],
                    ["Reserved Coverage", "64%"],
                  ]} />
                </WBCard>

                {/* 3 GCP */}
                <WBCard title="GCP Containment" sub="Strategic Retention" icon={<Cloud className="h-4 w-4 text-sky-500" />}
                  onClick={() => open({ kind: "wb", title: "GCP Containment", subtitle: "Strategic Retention" })}>
                  <Donut center={{ v: "48", sub: "Workloads" }} segments={[
                    { label: "GKE",            value: 16, color: "stroke-emerald-500" },
                    { label: "Compute Engine", value: 16, color: "stroke-blue-500" },
                    { label: "Cloud SQL",      value: 8,  color: "stroke-amber-500" },
                    { label: "Other",          value: 8,  color: "stroke-slate-400" },
                  ]} />
                  <StatList rows={[
                    ["Monthly Cost", "$412K"],
                    ["Why Retained", "4"],
                    ["Migration Candidates", "11", "text-amber-700"],
                  ]} />
                </WBCard>

                {/* 4 Citrix */}
                <WBCard title="Citrix Support Pocket" sub="IDD Thick Client" icon={<Monitor className="h-4 w-4 text-red-500" />}
                  onClick={() => open({ kind: "wb", title: "Citrix Support Pocket", subtitle: "IDD Thick Client" })}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-center">
                      <Monitor className="mx-auto h-6 w-6 text-slate-500" />
                      <div className="mt-1 text-lg font-semibold tabular-nums">3,842</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">Users</div>
                    </div>
                    <ul className="space-y-1 text-[11px]">
                      {[
                        ["Site", "Citrix on-prem"],
                        ["NetScaler VIPs", "4"],
                        ["License Model", "Concurrent"],
                        ["Surge Model", "Auto-scale"],
                        ["Support", "24x7"],
                      ].map(([l,v]) => (
                        <li key={l} className="flex justify-between"><span className="text-slate-500">{l}:</span><span className="font-medium text-slate-800">{v}</span></li>
                      ))}
                    </ul>
                  </div>
                </WBCard>

                {/* 5 Oracle */}
                <WBCard title="Oracle / Exadata" sub="Posture" icon={<Database className="h-4 w-4 text-red-600" />}
                  onClick={() => open({ kind: "wb", title: "Oracle / Exadata", subtitle: "Posture" })}>
                  <StatList rows={[
                    ["Exadata on AWS", "X8M"],
                    ["Databases", "14"],
                    ["Avg CPU", "35%"],
                    ["Storage", "42 TB"],
                    ["Data Guard", "2-site"],
                    ["DR RPO / RTO", "15m / 2h"],
                  ]} />
                  <div className="mt-2 h-8 text-blue-500"><Sparkline data={spark(28, 22)} /></div>
                </WBCard>

                {/* 6 Database Reliability */}
                <WBCard title="Database Reliability" sub="Health" icon={<Database className="h-4 w-4 text-blue-600" />}
                  onClick={() => open({ kind: "wb", title: "Database Reliability", subtitle: "Health" })}>
                  <StatList rows={[
                    ["Backup Success",        "98.6%", "text-emerald-700"],
                    ["Restore Test (QTD)",    "97%",   "text-emerald-700"],
                    ["Shards",                "38"],
                    ["Avg Latency (ms)",      "12"],
                    ["Connection Pool Health","96%"],
                    ["Failover Readiness",    "Ready", "text-emerald-700"],
                  ]} />
                </WBCard>
              </div>
            </Card>

            {/* Modernization Decision Engine */}
            <Card title="Modernization Decision Engine" sub="Workload-level recommendations · click any row for deep-dive">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                      <Th>Workload</Th>
                      <Th>Business Criticality</Th>
                      <Th>Technical Debt</Th>
                      <Th>Cloud Readiness</Th>
                      <Th>Data Complexity</Th>
                      <Th>Compliance Sensitivity</Th>
                      <Th>Operational Risk</Th>
                      <Th>Automation Readiness</Th>
                      <Th>Cost Opportunity</Th>
                      <Th>Action</Th>
                      <Th>Score</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {WORKLOADS.map(w => (
                      <tr key={w.wl} onClick={() => open({ kind: "workload", title: w.wl, subtitle: `${w.crit} · ${w.action}`, data: w })}
                        className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/70">
                        <Td className="font-medium text-slate-900">{w.wl}</Td>
                        {[w.crit,w.debt,w.ready,w.data,w.comp,w.op,w.auto,w.cost].map((v, i) => (
                          <Td key={i}><Pill cls={tagCls(v)}>{v}</Pill></Td>
                        ))}
                        <Td><Pill cls="border-blue-200 bg-blue-50 text-blue-700">{w.action}</Pill></Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <span className="w-7 text-right text-[12px] font-semibold tabular-nums">{w.score}</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div className={cn("h-full", w.score >= 85 ? "bg-emerald-500" : w.score >= 75 ? "bg-blue-500" : "bg-amber-500")} style={{ width: `${w.score}%` }} />
                            </div>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-2 text-[12px] text-blue-600 hover:underline">View all workloads →</button>
            </Card>
          </div>

          {/* Right panel */}
          <aside className="col-span-12 space-y-4 xl:col-span-3">
            <Card title="Executive Insights" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all →</Button>}>
              <div className="space-y-2">
                {INSIGHTS.map(i => {
                  const Icon = i.icon;
                  return (
                    <button key={i.title} onClick={() => open({ kind: "insight", title: i.title, subtitle: i.sub })}
                      className="flex w-full items-start gap-2 rounded-md border border-slate-100 bg-white p-2 text-left hover:border-blue-300 hover:bg-blue-50/40">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", i.color)} />
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold text-slate-800">{i.title}</div>
                        <div className="text-[11px] text-slate-500">{i.sub}</div>
                        <div className="mt-0.5 text-[11px] text-blue-600">See details →</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="Modernization Roadmap" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View roadmap →</Button>}>
              <div className="flex items-center gap-3">
                <div className="relative h-24 w-24">
                  <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                    {(() => {
                      let acc = 0;
                      return ROADMAP.map((r, i) => {
                        const share = (r.v / ROADMAP.reduce((s, x) => s + x.v, 0)) * 100;
                        const el = <circle key={i} cx="18" cy="18" r="15.9" fill="none" className={r.color} strokeWidth="3.5"
                          strokeDasharray={`${share} 100`} strokeDashoffset={-acc} />;
                        acc += share;
                        return el;
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-lg font-semibold tabular-nums">38%</div>
                    <div className="text-[10px] text-slate-500">Complete</div>
                  </div>
                </div>
                <ul className="flex-1 space-y-1.5">
                  {ROADMAP.map(r => (
                    <li key={r.name} className="flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", r.color.replace("text-", "bg-"))} />{r.name}</span>
                      <span className="font-semibold tabular-nums text-slate-800">{r.v}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card title="AI Recommendations" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all →</Button>}>
              <div className="space-y-2">
                {RECS.map(r => (
                  <div key={r.title} className="flex items-start gap-2 rounded-md border border-slate-100 bg-gradient-to-br from-blue-50/30 to-white p-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-[12px] font-semibold text-slate-800">{r.title}</div>
                      <div className="text-[11px] text-slate-500">{r.sub}</div>
                    </div>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => open({ kind: "rec", title: r.title, subtitle: r.sub })}>{r.cta}</Button>
                  </div>
                ))}
                <div className="rounded-md border border-amber-200 bg-amber-50/60 px-2 py-1 text-center text-[11px] text-amber-800">
                  AI insights require human approval.
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-2 text-[11px] text-slate-500">
          Last updated: May 22, 2025 · Source: Client Modernization Workbench
        </div>
      </div>

      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-[560px] sm:max-w-[560px]">
          <SheetHeader>
            <SheetTitle className="text-base">{drawer?.title}</SheetTitle>
            {drawer?.subtitle && <div className="text-xs text-slate-500">{drawer.subtitle}</div>}
          </SheetHeader>
          <div className="mt-4">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="text-[11px]">Overview</TabsTrigger>
                <TabsTrigger value="deps" className="text-[11px]">Deps</TabsTrigger>
                <TabsTrigger value="cost" className="text-[11px]">Cost</TabsTrigger>
                <TabsTrigger value="risk" className="text-[11px]">Risk</TabsTrigger>
                <TabsTrigger value="mod" className="text-[11px]">Modernize</TabsTrigger>
                <TabsTrigger value="actions" className="text-[11px]">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-3 space-y-2 text-sm">
                <Row label="Business Purpose" value="Caregiver Visit / EVV completion at scale" />
                <Row label="Owner" value="EVV Platform Pod" />
                <Row label="Current Architecture" value="EC2 + SQL Server (Ashburn)" />
                <Row label="Target Architecture" value="EKS + Aurora PostgreSQL" />
                <Row label="Environment" value="Production" />
              </TabsContent>
              <TabsContent value="deps" className="mt-3 space-y-2 text-sm">
                {["Caregiver Mobile App","EVV API","SQL Server Shard 2","Identity Service","Sandata Fuse"].map(d => <Row key={d} label="Depends on" value={d} />)}
              </TabsContent>
              <TabsContent value="cost" className="mt-3 space-y-2 text-sm">
                <Row label="Current Spend" value="$184K / mo" />
                <Row label="Projected Spend" value="$121K / mo" />
                <Row label="Savings Opportunity" value="$756K / yr" />
              </TabsContent>
              <TabsContent value="risk" className="mt-3 space-y-2 text-sm">
                <Row label="Operational Risk" value="High — retry storms" />
                <Row label="Technical Debt" value="High" />
                <Row label="Compliance Exposure" value="PHI" />
              </TabsContent>
              <TabsContent value="mod" className="mt-3 space-y-2 text-sm">
                {[["Rehost","Not recommended"],["Replatform","Recommended"],["Refactor","Phase 2"],["Retain","No"],["Retire","No"]].map(([k,v]) => <Row key={k} label={k} value={v} />)}
              </TabsContent>
              <TabsContent value="actions" className="mt-3 space-y-2 text-sm">
                {["30-day plan","90-day plan","180-day plan","Open architecture review","Open cost model","Open Neurealm playbook"].map(a => (
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
function WBCard({ title, sub, icon, children, onClick }: { title: string; sub: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        {icon}
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="text-[11px] text-slate-500">{sub}</div>
        </div>
      </div>
      {children}
      <button onClick={onClick} className="mt-1 text-left text-[12px] text-blue-600 hover:underline">View Details →</button>
    </div>
  );
}
function StatList({ rows }: { rows: (string[])[] }) {
  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/40">
      {rows.map(([l, v, cls]) => (
        <li key={l} className="flex items-center justify-between px-2 py-1 text-[12px]">
          <span className="text-slate-600">{l}</span>
          <span className={cn("font-semibold tabular-nums", cls ?? "text-slate-900")}>{v}</span>
        </li>
      ))}
    </ul>
  );
}
function Th({ children }: { children?: React.ReactNode }) { return <th className="px-2 py-1.5 text-left font-medium">{children}</th>; }
function Td({ children, className }: { children?: React.ReactNode; className?: string }) { return <td className={cn("px-2 py-1.5 align-middle", className)}>{children}</td>; }
function Pill({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={cn("inline-flex rounded-md border px-1.5 py-0.5 text-[11px] font-medium", cls)}>{children}</span>;
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-100 bg-slate-50/50 px-2 py-1.5 text-[12px]">
      <span className="text-slate-500">{label}</span><span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
