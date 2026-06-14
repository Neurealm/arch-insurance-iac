import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Filter, Rocket, Gauge, Eye, KeyRound, ShieldCheck, Sparkles, Layers,
  Bell, HelpCircle, Calendar, ChevronRight, Search, ScanLine, Workflow,
  Boxes, Cloud, Server, Database, Activity, AlertTriangle, Target,
  ArrowRight, Building2, FileBarChart2, Bot, GitBranch, MoreVertical,
  CheckCircle2, Heart, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";

type Drawer = { kind: string; title: string; subtitle?: string; data?: any } | null;

/* ---------- DATA ---------- */

const KPIS = [
  { id: "inflight", label: "Acquisitions In Flight", value: "3", sub: "Active", hint: "Onboarding pipeline", icon: Rocket, color: "text-blue-500" },
  { id: "brown", label: "Average Brownfield Score", value: "71", sub: "Moderate Risk", hint: "Weighted across estates", icon: Gauge, color: "text-amber-500", donut: 71 },
  { id: "obs", label: "Observability Coverage", value: "78%", sub: "Across Assets", hint: "+8% vs 30d", icon: Eye, color: "text-cyan-600" },
  { id: "idn", label: "Identity Integration", value: "62%", sub: "Complete", hint: "MFA + SSO bound", icon: KeyRound, color: "text-violet-500" },
  { id: "bk", label: "Backup Validation", value: "84%", sub: "Validated", hint: "Recovery tested", icon: ShieldCheck, color: "text-emerald-500" },
  { id: "mod", label: "Modernization Candidates", value: "34", sub: "Identified", hint: "Across portfolio", icon: Sparkles, color: "text-fuchsia-500" },
  { id: "plat", label: "Platform Alignment", value: "58%", sub: "Standardized", hint: "Golden adherence", icon: Layers, color: "text-indigo-500" },
];

type StageTone = "blue" | "teal" | "amber" | "violet" | "emerald";
const toneMap: Record<StageTone, { ring: string; bar: string; chip: string; num: string; text: string; soft: string }> = {
  blue:    { ring: "ring-blue-200",    bar: "bg-blue-500",    chip: "bg-blue-50 text-blue-700 border-blue-200",       num: "bg-blue-500",    text: "text-blue-700",    soft: "bg-blue-50/60" },
  teal:    { ring: "ring-teal-200",    bar: "bg-teal-500",    chip: "bg-teal-50 text-teal-700 border-teal-200",       num: "bg-teal-500",    text: "text-teal-700",    soft: "bg-teal-50/60" },
  amber:   { ring: "ring-amber-200",   bar: "bg-amber-500",   chip: "bg-amber-50 text-amber-800 border-amber-200",     num: "bg-amber-500",   text: "text-amber-800",   soft: "bg-amber-50/60" },
  violet:  { ring: "ring-violet-200",  bar: "bg-violet-500",  chip: "bg-violet-50 text-violet-700 border-violet-200", num: "bg-violet-500",  text: "text-violet-700",  soft: "bg-violet-50/60" },
  emerald: { ring: "ring-emerald-200", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", num: "bg-emerald-500", text: "text-emerald-700", soft: "bg-emerald-50/60" },
};

const STAGES: { id: string; n: number; tone: StageTone; window: string; title: string; icon: any; metric: { v: string; k: string }; activities: string[]; outputs: string[] }[] = [
  { id: "s1", n: 1, tone: "blue",    window: "Day 0–10",  title: "Intake & Discovery",  icon: Search,
    metric: { v: "3", k: "Acquisitions" },
    activities: ["Product Inventory","Hosting Inventory","Domain Discovery","Identity Assessment","Contract Review","Customer Commitments","SLA Review","PHI Classification","Data Classification"],
    outputs: ["Stakeholder Map","Risk Profile","Asset Inventory"] },
  { id: "s2", n: 2, tone: "teal",    window: "Day 10–30", title: "Operational Baseline", icon: ScanLine,
    metric: { v: "412", k: "Assets Assessed" },
    activities: ["Observability Coverage","EDR Coverage","Logging Coverage","Backup Assessment","Vulnerability Scan","Identity Review","Privileged Access Review","Critical Workflow Identification"],
    outputs: ["Coverage Report","Cyber Assessment","Operational Baseline"] },
  { id: "s3", n: 3, tone: "amber",   window: "Day 30–60", title: "Standardization",     icon: Boxes,
    metric: { v: "124", k: "Assets Standardized" },
    activities: ["Golden Images","Agent Deployment","Logging Standards","Tagging","Patch Baselines","SLO Registration","CMDB Registration","Service Ownership Mapping"],
    outputs: ["Readiness Certification","Standardization Score"] },
  { id: "s4", n: 4, tone: "violet",  window: "Day 60–90", title: "HHAX Integration",    icon: Workflow,
    metric: { v: "68", k: "Services Integrated" },
    activities: ["Service Catalog Registration","Incident Model Integration","SRE Reviews","FinOps Governance","Security Governance","Change Governance","Executive Reporting"],
    outputs: ["Governance Alignment","Operational Acceptance"] },
  { id: "s5", n: 5, tone: "emerald", window: "Day 90+",   title: "Platform Alignment",  icon: Target,
    metric: { v: "34", k: "Modernization Tracks" },
    activities: ["Modernize","Merge","Shrink","Retire","Containerize","Cloud Align","Optimize Cost","Platform Consolidation"],
    outputs: ["Target State Alignment","Modernization Roadmap"] },
];

type AStatus = "active" | "watch";
const ACQUISITIONS: { id: string; name: string; tag: string; phase: string; phaseTone: StageTone; criticality: string; critTone: string; hosting: string; brownfield: number; bfTone: "green" | "amber" | "red"; target: string; status: AStatus }[] = [
  { id: "sandata",      name: "Sandata",        tag: "S", phase: "Platform Alignment",  phaseTone: "emerald", criticality: "Mission Critical", critTone: "bg-rose-50 text-rose-700 border-rose-200",    hosting: "AWS + Oracle", brownfield: 72, bfTone: "amber", target: "Retain & Modernize",   status: "active" },
  { id: "pavilio",      name: "Pavilio",        tag: "P", phase: "Integration",         phaseTone: "violet",  criticality: "High",            critTone: "bg-amber-50 text-amber-800 border-amber-200", hosting: "AWS",          brownfield: 81, bfTone: "red",   target: "Strategic Platform",    status: "active" },
  { id: "selfdir",      name: "Self Direction", tag: "SD", phase: "Standardization",     phaseTone: "amber",   criticality: "Medium",          critTone: "bg-amber-50 text-amber-700 border-amber-200", hosting: "GCP + AWS",    brownfield: 64, bfTone: "amber", target: "Absorb Into Platform",  status: "active" },
  { id: "generations",  name: "Generations",    tag: "G", phase: "Platform Alignment",  phaseTone: "emerald", criticality: "Low",             critTone: "bg-slate-50 text-slate-600 border-slate-200", hosting: "Liquid Web",   brownfield: 42, bfTone: "green", target: "Sunset",                status: "watch" },
];

const SCORECARD = [
  { axis: "Observability",  v: 82, q: "Can We See It?" },
  { axis: "Ownership",      v: 74, q: "Who Owns It?" },
  { axis: "Cyber Hygiene",  v: 68, q: "Is It Safe Enough?" },
  { axis: "Backup/Restore", v: 84, q: "Can We Recover It?" },
  { axis: "Identity",       v: 62, q: "Can We Control Access?" },
  { axis: "Cost Visibility",v: 71, q: "Can We Optimize It?" },
  { axis: "Modernization",  v: 58, q: "Can We Standardize It?" },
];

const HEATMAP_ROWS = ["Observability","Identity","Security","Backup","SLO","Ownership","FinOps","Automation","Documentation"];
const HEATMAP_COLS = ["Sandata","Pavilio","Self Direction","Generations","Future Acquisition"];
// Levels: g=ready, a=partial, r=gap
const HEATMAP: ("g"|"a"|"r")[][] = [
  ["g","a","a","g","a"],
  ["a","g","r","a","r"],
  ["g","a","a","g","a"],
  ["g","g","a","a","r"],
  ["a","a","r","g","r"],
  ["g","a","a","g","a"],
  ["a","a","r","a","r"],
  ["r","a","r","r","r"],
  ["a","g","a","a","r"],
];
const cellStyle: Record<"g"|"a"|"r", string> = {
  g: "bg-emerald-500/85 hover:bg-emerald-500",
  a: "bg-amber-400/85 hover:bg-amber-400",
  r: "bg-rose-500/85 hover:bg-rose-500",
};

const TOWERS = [
  { tower: "Cloud Operations",    current: "Integration", future: "Platform Aligned", progress: 60, gate: "Pass",        owner: "Neurealm", gateTone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { tower: "Platform Engineering",current: "Baseline",    future: "Platform Aligned", progress: 45, gate: "Pass",        owner: "Neurealm", gateTone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { tower: "Security Operations", current: "Baseline",    future: "Standardized",     progress: 30, gate: "Pass",        owner: "Neurealm", gateTone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { tower: "Database Operations", current: "Baseline",    future: "Standardized",     progress: 40, gate: "Pass",        owner: "Neurealm", gateTone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { tower: "Network Operations",  current: "Baseline",    future: "Standardized",     progress: 25, gate: "In Progress", owner: "HHAX",     gateTone: "bg-amber-50 text-amber-800 border-amber-200" },
  { tower: "SRE",                 current: "Integration", future: "Platform Aligned", progress: 35, gate: "Pass",        owner: "Neurealm", gateTone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { tower: "DevOps",              current: "Baseline",    future: "Platform Aligned", progress: 50, gate: "Pass",        owner: "Neurealm", gateTone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { tower: "Observability",       current: "Integration", future: "Standardized",     progress: 55, gate: "Pass",        owner: "Neurealm", gateTone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { tower: "FinOps",              current: "Baseline",    future: "Standardized",     progress: 40, gate: "Pass",        owner: "Neurealm", gateTone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

const DECISIONS = [
  { workload: "Legacy Windows IIS",         current: "Retire",                rec: "Retire",           tone: "bg-rose-50 text-rose-700 border-rose-200",       conf: 92, owner: "Platform Engineering" },
  { workload: "GCP Self Direction Cluster", current: "Legacy",                rec: "Absorb",           tone: "bg-blue-50 text-blue-700 border-blue-200",       conf: 84, owner: "Cloud Engineering" },
  { workload: "Oracle Reporting Database",  current: "Legacy",                rec: "Retain",           tone: "bg-emerald-50 text-emerald-700 border-emerald-200", conf: 81, owner: "Database Team" },
  { workload: "Generations Hosting",        current: "Legacy",                rec: "Sunset",           tone: "bg-rose-50 text-rose-700 border-rose-200",       conf: 95, owner: "Product Leadership" },
  { workload: "Citrix Environment",         current: "Legacy",                rec: "Retain & Optimize",tone: "bg-amber-50 text-amber-800 border-amber-200",    conf: 76, owner: "Platform Engineering" },
  { workload: "Custom .NET Application",    current: "Partially Standardized",rec: "Modernize",        tone: "bg-violet-50 text-violet-700 border-violet-200", conf: 70, owner: "Application Team" },
];

const ASSISTANTS = [
  { name: "Acquisition Onboarding Scout",   metric: "1,842", k: "Assets assessed",         icon: Search },
  { name: "Dependency Mapper",              metric: "4,212", k: "Dependencies mapped",     icon: GitBranch },
  { name: "Brownfield Risk Analyzer",       metric: "126",   k: "Risks identified",        icon: AlertTriangle },
  { name: "Service Ownership Mapper",       metric: "284",   k: "Ownership mapped",        icon: Building2 },
  { name: "Observability Coverage Auditor", metric: "78%",   k: "Coverage analyzed",       icon: Eye },
  { name: "Identity Integration Advisor",   metric: "62%",   k: "Identities integrated",   icon: KeyRound },
  { name: "Platform Alignment Coach",       metric: "58%",   k: "Alignment score",         icon: Layers },
  { name: "Modernization Planner",          metric: "34",    k: "Opportunities found",     icon: Sparkles },
];

const EXEC = [
  { title: "Acquisition Risks",                value: "3",      sub: "High risk areas",       icon: ShieldCheck, color: "text-rose-500" },
  { title: "Identity Gaps",                    value: "62%",    sub: "Integrated",            icon: KeyRound,    color: "text-violet-500" },
  { title: "Platform Consolidation Opportunity", value: "14",   sub: "Candidate systems",     icon: Layers,      color: "text-blue-500" },
  { title: "Modernization Potential",          value: "$2.1M",  sub: "Annual opportunity",    icon: DollarSign,  color: "text-emerald-500" },
];

/* ---------- HELPERS ---------- */

function Donut({ value, color = "stroke-amber-500", size = 56 }: { value: number; color?: string; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
        <circle cx="18" cy="18" r="15.9" fill="none" className={color} strokeWidth="3.5" strokeDasharray={`${value} 100`} strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ---------- PAGE ---------- */

export default function AcquisitionOnboardingFactory() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [env, setEnv] = useState("Production");
  const [range, setRange] = useState("Last 90 Days");
  const [filters] = useState(6);

  const radarData = useMemo(() => SCORECARD.map(s => ({ axis: s.axis, v: s.v, full: 100 })), []);

  const open = (kind: string, title: string, subtitle?: string, data?: any) =>
    setDrawer({ kind, title, subtitle, data });

  return (
    <AppShell>
      <div className="min-h-full bg-slate-50/60">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-6 py-4 flex items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">HHAX Production Resilience Operating System</div>
              <h1 className="text-[22px] font-bold text-slate-900 leading-tight mt-0.5">Acquisition-to-SRE Onboarding Factory</h1>
              <p className="text-sm text-slate-600 mt-0.5">Transform acquired environments into secure, observable, reliable, governable production services.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select value={env} onValueChange={setEnv}>
                <SelectTrigger className="h-9 w-[140px] bg-white"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><SelectValue /></span></SelectTrigger>
                <SelectContent><SelectItem value="Production">Production</SelectItem><SelectItem value="Staging">Staging</SelectItem></SelectContent>
              </Select>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="h-9 w-[160px] bg-white"><span className="inline-flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-slate-500" /><SelectValue /></span></SelectTrigger>
                <SelectContent><SelectItem value="Last 30 Days">Last 30 Days</SelectItem><SelectItem value="Last 90 Days">Last 90 Days</SelectItem><SelectItem value="Last 12 Months">Last 12 Months</SelectItem></SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => open("filters", "Filters")}>
                <Filter className="h-4 w-4" /> Filters <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{filters}</Badge>
              </Button>
              <button className="h-9 w-9 rounded-md border border-slate-200 grid place-items-center relative hover:bg-slate-50"><Bell className="h-4 w-4 text-slate-600" /><span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" /></button>
              <button className="h-9 w-9 rounded-md border border-slate-200 grid place-items-center hover:bg-slate-50"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="p-4 grid grid-cols-12 gap-4">
          {/* Center column */}
          <div className="col-span-12 xl:col-span-9 space-y-4 min-w-0">

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {KPIS.map(k => (
                <button key={k.id} onClick={() => open("kpi", k.label, k.hint, k)}
                  className="text-left rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <k.icon className={cn("h-4 w-4", k.color)} />
                      <div className="text-[11px] font-semibold text-slate-600 truncate">{k.label}</div>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    {"donut" in k && <Donut value={(k as any).donut} color="stroke-amber-500" size={36} />}
                    <div>
                      <div className="text-[22px] font-bold tabular-nums text-slate-900 leading-none">{k.value}</div>
                      <div className={cn("text-[11px] mt-0.5",
                        k.id === "brown" ? "text-amber-700 font-semibold" : "text-slate-500")}>{k.sub}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10.5px] text-blue-600 inline-flex items-center gap-0.5 hover:underline">View details <ChevronRight className="h-3 w-3" /></div>
                </button>
              ))}
            </div>

            {/* Factory pipeline */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div className="font-semibold text-slate-900">Acquisition Onboarding Factory Pipeline</div>
                <div className="text-[11px] text-slate-500">Discover → Assess → Secure → Observe → Standardize → Integrate → Modernize</div>
              </div>
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                  {STAGES.map((s, i) => {
                    const t = toneMap[s.tone];
                    return (
                      <div key={s.id} className="relative">
                        <button onClick={() => open("stage", `${s.window} · ${s.title}`, `Stage ${s.n}`, s)}
                          className={cn("group w-full text-left rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition-all", t.soft)}>
                          <div className="flex items-start gap-2">
                            <div className={cn("h-6 w-6 rounded-full text-white text-[11px] font-bold grid place-items-center shrink-0", t.num)}>{s.n}</div>
                            <div className="min-w-0">
                              <div className={cn("text-[11px] font-bold uppercase tracking-wide", t.text)}>{s.window}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <s.icon className={cn("h-4 w-4", t.text)} />
                                <div className="text-[13px] font-bold text-slate-900 truncate">{s.title}</div>
                              </div>
                            </div>
                          </div>
                          <ul className="mt-2.5 space-y-0.5 text-[11px] text-slate-700">
                            {s.activities.slice(0, 9).map(a => <li key={a} className="truncate">{a}</li>)}
                          </ul>
                          <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2">
                            <div>
                              <div className="text-[18px] font-bold tabular-nums text-slate-900">{s.metric.v}</div>
                              <div className="text-[10px] text-slate-500">{s.metric.k}</div>
                            </div>
                            <Badge variant="outline" className={cn("text-[10px]", t.chip)}>Active</Badge>
                          </div>
                        </button>
                        {i < STAGES.length - 1 && (
                          <ArrowRight className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Outputs strip */}
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
                  {STAGES.map(s => (
                    <div key={`o-${s.id}`} className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Outputs</div>
                      <ul className="space-y-1">
                        {s.outputs.map(o => (
                          <li key={o} className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" /> {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Acquisition Portfolio + Scorecard */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                  <div className="font-semibold text-slate-900">Acquisition Portfolio</div>
                  <button className="text-[11px] text-blue-600 hover:underline">View all acquisitions →</button>
                </div>
                <div className="px-2 pb-2 overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[10.5px] uppercase tracking-wide text-slate-500">
                        <th className="text-left font-semibold px-2 py-2">Acquisition</th>
                        <th className="text-left font-semibold px-2 py-2">Current Phase</th>
                        <th className="text-left font-semibold px-2 py-2">Business Criticality</th>
                        <th className="text-left font-semibold px-2 py-2">Hosting Model</th>
                        <th className="text-left font-semibold px-2 py-2">Brownfield</th>
                        <th className="text-left font-semibold px-2 py-2">Target State</th>
                        <th className="text-left font-semibold px-2 py-2">Status</th>
                        <th className="w-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ACQUISITIONS.map(a => {
                        const t = toneMap[a.phaseTone];
                        const dot = a.bfTone === "green" ? "bg-emerald-500" : a.bfTone === "amber" ? "bg-amber-500" : "bg-rose-500";
                        return (
                          <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => open("acq", a.name, a.target, a)}>
                            <td className="px-2 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold grid place-items-center">{a.tag}</div>
                                <span className="font-semibold text-slate-900">{a.name}</span>
                              </div>
                            </td>
                            <td className="px-2 py-2.5">
                              <Badge variant="outline" className={cn("text-[10px]", t.chip)}>{a.phase}</Badge>
                            </td>
                            <td className="px-2 py-2.5"><Badge variant="outline" className={cn("text-[10px]", a.critTone)}>{a.criticality}</Badge></td>
                            <td className="px-2 py-2.5 text-slate-700">{a.hosting}</td>
                            <td className="px-2 py-2.5">
                              <div className="flex items-center gap-1.5"><span className="tabular-nums font-semibold text-slate-900">{a.brownfield}</span><span className={cn("h-2 w-2 rounded-full", dot)} /></div>
                            </td>
                            <td className="px-2 py-2.5 text-slate-700">{a.target}</td>
                            <td className="px-2 py-2.5">
                              <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold",
                                a.status === "active" ? "text-emerald-700" : "text-amber-700")}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", a.status === "active" ? "bg-emerald-500" : "bg-amber-500")} />
                                {a.status === "active" ? "Active" : "Watch"}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 text-slate-400"><MoreVertical className="h-4 w-4" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <div className="font-semibold text-slate-900">Brownfield Maturity Scorecard</div>
                </div>
                <div className="px-2 pb-3 grid grid-cols-5 gap-2">
                  <div className="col-span-3 h-[230px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius="78%">
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "#475569" }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Maturity" dataKey="v" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="col-span-2 space-y-1">
                    {SCORECARD.map((s, i) => {
                      const dot = ["bg-emerald-500","bg-blue-500","bg-amber-500","bg-violet-500","bg-amber-500","bg-emerald-500","bg-violet-500"][i];
                      return (
                        <button key={s.axis} onClick={() => open("score", s.axis, s.q, s)}
                          className="w-full flex items-center justify-between text-[11px] px-2 py-1 rounded hover:bg-slate-50">
                          <span className="flex items-center gap-1.5 text-slate-700"><span className={cn("h-2 w-2 rounded-full", dot)} />{s.axis}</span>
                          <span className="tabular-nums font-semibold text-slate-900">{s.v}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mx-3 mb-3 rounded-md bg-slate-50 border border-slate-200 px-3 py-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-slate-800">Overall Brownfield Score</span>
                  <span className="inline-flex items-center gap-2"><span className="tabular-nums font-bold text-slate-900">71</span><Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">Moderate Risk</Badge></span>
                </div>
              </div>
            </div>

            {/* Heatmap + Tower table */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 pt-3 pb-2 font-semibold text-slate-900">Acquisition Readiness Matrix</div>
                <div className="px-3 pb-3">
                  <div className="grid" style={{ gridTemplateColumns: `120px repeat(${HEATMAP_COLS.length}, minmax(0, 1fr))` }}>
                    <div />
                    {HEATMAP_COLS.map(c => <div key={c} className="text-[10px] text-slate-500 px-1 pb-1 text-center font-semibold leading-tight">{c}</div>)}
                    {HEATMAP_ROWS.map((row, ri) => (
                      <FragmentRow key={row} row={row} cells={HEATMAP[ri]} onCell={(ci, cell) => open("cell", `${row} · ${HEATMAP_COLS[ci]}`, cell === "g" ? "Ready" : cell === "a" ? "Partial" : "Gap")} />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[10.5px] text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-500" /> Ready (80–100%)</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-amber-400" /> Partial (40–79%)</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-rose-500" /> Gap (0–39%)</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                  <div className="font-semibold text-slate-900">Tower Integration Dashboard</div>
                  <button className="text-[11px] text-blue-600 hover:underline">View all towers →</button>
                </div>
                <div className="px-2 pb-2 overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[10.5px] uppercase tracking-wide text-slate-500">
                        <th className="text-left font-semibold px-2 py-2">Tower</th>
                        <th className="text-left font-semibold px-2 py-2">Current State</th>
                        <th className="text-left font-semibold px-2 py-2">Future State</th>
                        <th className="text-left font-semibold px-2 py-2">Progress</th>
                        <th className="text-left font-semibold px-2 py-2">Quality Gate</th>
                        <th className="text-left font-semibold px-2 py-2">Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TOWERS.map(t => (
                        <tr key={t.tower} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => open("tower", t.tower, `${t.current} → ${t.future}`, t)}>
                          <td className="px-2 py-2 font-semibold text-slate-900">{t.tower}</td>
                          <td className="px-2 py-2"><Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200">{t.current}</Badge></td>
                          <td className="px-2 py-2"><Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">{t.future}</Badge></td>
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${t.progress}%` }} /></div>
                              <span className="tabular-nums text-slate-700 text-[11px] w-9">{t.progress}%</span>
                            </div>
                          </td>
                          <td className="px-2 py-2"><Badge variant="outline" className={cn("text-[10px]", t.gateTone)}>{t.gate}</Badge></td>
                          <td className="px-2 py-2 text-slate-700">{t.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Decision Engine */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div className="font-semibold text-slate-900">Acquisition Decision Engine</div>
                <button className="text-[11px] text-blue-600 hover:underline">View all →</button>
              </div>
              <div className="px-2 pb-3 overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-wide text-slate-500">
                      <th className="text-left font-semibold px-2 py-2">Workload</th>
                      <th className="text-left font-semibold px-2 py-2">Current State</th>
                      <th className="text-left font-semibold px-2 py-2">Recommendation</th>
                      <th className="text-left font-semibold px-2 py-2">Confidence</th>
                      <th className="text-left font-semibold px-2 py-2">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DECISIONS.map(d => (
                      <tr key={d.workload} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => open("decision", d.workload, d.rec, d)}>
                        <td className="px-2 py-2 font-semibold text-slate-900">{d.workload}</td>
                        <td className="px-2 py-2 text-slate-700">{d.current}</td>
                        <td className="px-2 py-2"><Badge variant="outline" className={cn("text-[10px]", d.tone)}>{d.rec}</Badge></td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden"><div className={cn("h-full", d.conf >= 90 ? "bg-emerald-500" : d.conf >= 80 ? "bg-blue-500" : "bg-amber-500")} style={{ width: `${d.conf}%` }} /></div>
                            <span className="tabular-nums text-slate-900 font-semibold text-[11px] w-9">{d.conf}%</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-slate-700">{d.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Executive Insights Right Panel */}
          <aside className="col-span-12 xl:col-span-3 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-3 pb-2 font-semibold text-slate-900">Executive Insights</div>
              <div className="px-3 pb-3 space-y-2">
                {EXEC.map(e => (
                  <button key={e.title} onClick={() => open("exec", e.title, e.sub, e)}
                    className="w-full text-left rounded-lg border border-slate-200 bg-white hover:shadow-sm hover:border-slate-300 transition-all p-3">
                    <div className="flex items-start gap-2">
                      <e.icon className={cn("h-4 w-4 mt-0.5 shrink-0", e.color)} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11.5px] font-semibold text-slate-700">{e.title}</div>
                        <div className="text-[18px] font-bold tabular-nums text-slate-900 mt-0.5 leading-none">{e.value}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{e.sub}</div>
                        <div className="text-[10.5px] text-blue-600 mt-1 inline-flex items-center gap-0.5">View details <ChevronRight className="h-3 w-3" /></div>
                      </div>
                    </div>
                  </button>
                ))}
                <button onClick={() => open("exec", "Operating Health", "Healthy")} className="w-full rounded-lg border border-slate-200 p-3 flex items-center gap-3 hover:shadow-sm hover:border-slate-300 transition-all">
                  <Donut value={88} color="stroke-emerald-500" size={56} />
                  <div className="text-left flex-1">
                    <div className="text-[11.5px] font-semibold text-slate-700">Operating Health</div>
                    <div className="text-[18px] font-bold tabular-nums text-slate-900 leading-none">88</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">Healthy</div>
                  </div>
                  <Heart className="h-4 w-4 text-rose-400" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div className="font-semibold text-slate-900">AI Acquisition Assistants</div>
                <button className="text-[11px] text-blue-600 hover:underline">View all →</button>
              </div>
              <div className="px-3 pb-3 space-y-1.5">
                {ASSISTANTS.map(a => (
                  <button key={a.name} onClick={() => open("assistant", a.name, a.k, a)}
                    className="w-full flex items-center gap-2.5 rounded-md hover:bg-slate-50 p-2 text-left transition-colors">
                    <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 grid place-items-center shrink-0"><a.icon className="h-3.5 w-3.5" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-slate-800 truncate">{a.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] font-bold tabular-nums text-slate-900">{a.metric}</div>
                      <div className="text-[10px] text-slate-500">{a.k}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">{drawer?.kind?.toUpperCase()}</div>
            <SheetTitle className="text-xl">{drawer?.title}</SheetTitle>
            {drawer?.subtitle && <div className="text-sm text-slate-600">{drawer.subtitle}</div>}
          </SheetHeader>

          {drawer?.kind === "acq" ? (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid grid-cols-7 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="arch">Architecture</TabsTrigger>
                <TabsTrigger value="deps">Deps</TabsTrigger>
                <TabsTrigger value="sec">Security</TabsTrigger>
                <TabsTrigger value="ops">Ops</TabsTrigger>
                <TabsTrigger value="mod">Modernize</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-3 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Business Purpose" value="Caregiver scheduling, EVV, claims" />
                  <Field label="Acquisition Date" value="Q2 2024" />
                  <Field label="Customer Impact" value="High — mission critical workflows" />
                  <Field label="Revenue Impact" value="$18M ARR" />
                  <Field label="Owner" value="VP Product Operations" />
                  <Field label="Target State" value={drawer?.data?.target || "—"} />
                </div>
              </TabsContent>
              <TabsContent value="arch" className="mt-3 text-sm text-slate-700">Hosting: {drawer?.data?.hosting}. Identity federated via Okta. Multi-cloud DB on Oracle + RDS Postgres. Networking via TGW.</TabsContent>
              <TabsContent value="deps" className="mt-3 text-sm text-slate-700">142 services, 612 integrations, 38 data flows mapped by Dependency Mapper.</TabsContent>
              <TabsContent value="sec" className="mt-3 text-sm text-slate-700">EDR 88% · Identity 62% · Backup validated · 14 critical CVEs open · Recovery tested 2025-05.</TabsContent>
              <TabsContent value="ops" className="mt-3 text-sm text-slate-700">SLO registered for top 8 workflows. On-call integrated with HHAX PagerDuty. Runbooks 71% complete.</TabsContent>
              <TabsContent value="mod" className="mt-3 text-sm text-slate-700">12 modernization tracks. 4 candidates for containerization. 2 sunset candidates.</TabsContent>
              <TabsContent value="actions" className="mt-3 space-y-2">
                {["30 Day Plan","60 Day Plan","90 Day Plan","12 Month Plan"].map(p => (
                  <div key={p} className="rounded-md border border-slate-200 p-2.5 text-sm flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{p}</span>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`Opened ${p}`)}>Open</Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          ) : (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="owner">Ownership</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-3 text-sm text-slate-700">
                Detailed summary of <b>{drawer?.title}</b>. Includes thresholds, recent changes, related acquisitions, dependent services, and recommended next steps.
              </TabsContent>
              <TabsContent value="evidence" className="mt-3 text-sm text-slate-700">Latest scans, audit artifacts, control attestations, and runbook validations.</TabsContent>
              <TabsContent value="owner" className="mt-3 text-sm text-slate-700">Service owner, escalation path, change advisory contacts.</TabsContent>
              <TabsContent value="actions" className="mt-3 space-y-2">
                <Button className="w-full" onClick={() => { toast.success("Plan generated"); setDrawer(null); }}>Generate 30/60/90 Plan</Button>
                <Button variant="outline" className="w-full" onClick={() => toast("Routed to owner")}>Route to Owner</Button>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900 mt-0.5">{value}</div>
    </div>
  );
}

function FragmentRow({ row, cells, onCell }: { row: string; cells: ("g"|"a"|"r")[]; onCell: (ci: number, cell: "g"|"a"|"r") => void }) {
  return (
    <>
      <div className="text-[11px] text-slate-700 pr-2 py-0.5 truncate">{row}</div>
      {cells.map((cell, ci) => (
        <button key={ci} onClick={() => onCell(ci, cell)} className={cn("m-0.5 h-6 rounded-sm transition-colors", cellStyle[cell])} />
      ))}
    </>
  );
}
