import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Bell, Download, Sparkles, Layers, Bot, Code2, ShieldCheck, Box, Users,
  CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Target, Activity,
  ChevronRight, FileBarChart2, GitBranch, Workflow, Lightbulb, Shield,
  Zap, Heart, Building2, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";

/* ----------------------------- Data ----------------------------- */

const horizons = [
  {
    id: "h1", num: 1, time: "0–30 Days", title: "Stabilize & See",
    accent: "blue", progress: 65, status: "In Progress",
    outcomes: ["Product Service Catalog", "Dependency Map", "Alert Inventory", "Critical Workflow SLO Drafts", "Transition Plan", "Operational Baseline"],
    value: ["Visibility", "Risk Reduction", "Service Inventory"],
    deps: 12, businessValue: "$0.8M",
  },
  {
    id: "h2", num: 2, time: "31–90 Days", title: "Standardize & Control",
    accent: "teal", progress: 42, status: "In Progress",
    outcomes: ["Golden Image Baseline", "Patch SLA Model", "Observability Tuning", "Vulnerability Workflow", "Runbook Inventory", "Cost Tagging", "Identity Standards"],
    value: ["Governance", "Compliance", "Operational Consistency"],
    deps: 18, businessValue: "$1.6M",
  },
  {
    id: "h3", num: 3, time: "3–6 Months", title: "Automate & Reduce Toil",
    accent: "green", progress: 28, status: "In Progress",
    outcomes: ["Automated Patch Waves", "Security Group Validation", "Incident Summarization", "Runbook Automation", "FinOps Automation", "Alert Rationalization"],
    value: ["Toil Reduction", "MTTR Improvement", "Operational Efficiency"],
    deps: 22, businessValue: "$2.1M",
  },
  {
    id: "h4", num: 4, time: "6–12 Months", title: "Engineer Reliability",
    accent: "amber", progress: 15, status: "Planned",
    outcomes: ["SLO Governance", "Error Budget Governance", "Production Readiness Reviews", "Service Ownership Model", "DR Drills", "Release Guardrails"],
    value: ["Reliability", "Resilience", "Change Success"],
    deps: 24, businessValue: "$2.4M",
  },
  {
    id: "h5", num: 5, time: "12–24 Months", title: "Modernize Platform",
    accent: "purple", progress: 10, status: "Planned",
    outcomes: ["Containerization", "Service Decomposition", "Infrastructure as Code", "Database Modernization", "GCP Rationalization", "Acquisition Onboarding Factory", "Platform Consolidation"],
    value: ["Technical Debt Reduction", "Cost To Serve Reduction", "Platform Scalability"],
    deps: 26, businessValue: "$3.1M",
  },
  {
    id: "h6", num: 6, time: "24+ Months", title: "Scale Acquisition Engine",
    accent: "indigo", progress: 5, status: "Planned",
    outcomes: ["Repeatable M&A Intake", "Operating Leverage", "Platform Standardization", "Scalable Integration", "Transaction Readiness", "Board Reporting Automation"],
    value: ["Scalability", "Operating Leverage", "Enterprise Value"],
    deps: 20, businessValue: "$3.9M",
  },
];

const accentMap: Record<string, { bar: string; ring: string; chip: string; dot: string; text: string; soft: string }> = {
  blue:   { bar: "bg-blue-500",  ring: "ring-blue-500/40",  chip: "bg-blue-50 text-blue-700 border-blue-200",  dot: "bg-blue-500",  text: "text-blue-700",  soft: "bg-blue-50" },
  teal:   { bar: "bg-teal-500",  ring: "ring-teal-500/40",  chip: "bg-teal-50 text-teal-700 border-teal-200",  dot: "bg-teal-500",  text: "text-teal-700",  soft: "bg-teal-50" },
  green:  { bar: "bg-emerald-500",ring: "ring-emerald-500/40",chip: "bg-emerald-50 text-emerald-700 border-emerald-200",dot: "bg-emerald-500",text: "text-emerald-700",soft:"bg-emerald-50" },
  amber:  { bar: "bg-amber-500", ring: "ring-amber-500/40", chip: "bg-amber-50 text-amber-700 border-amber-200",dot: "bg-amber-500", text: "text-amber-700", soft: "bg-amber-50" },
  purple: { bar: "bg-violet-500",ring: "ring-violet-500/40",chip: "bg-violet-50 text-violet-700 border-violet-200",dot: "bg-violet-500",text: "text-violet-700",soft:"bg-violet-50" },
  indigo: { bar: "bg-indigo-600",ring: "ring-indigo-600/40",chip: "bg-indigo-50 text-indigo-700 border-indigo-200",dot: "bg-indigo-600",text: "text-indigo-700",soft:"bg-indigo-50" },
};

const kpis = [
  { id: "progress", label: "Roadmap Progress", value: "38%", sub: "On Track", icon: Target, tone: "indigo", ring: true, pct: 38 },
  { id: "init", label: "Modernization Initiatives", value: "46", sub: "Active", icon: Layers, tone: "blue" },
  { id: "auto", label: "Automation Coverage", value: "61%", sub: "Current", icon: Bot, tone: "emerald" },
  { id: "iac", label: "Infrastructure as Code Coverage", value: "74%", sub: "Current", icon: Code2, tone: "violet" },
  { id: "image", label: "Golden Image Adoption", value: "83%", sub: "Current", icon: ShieldCheck, tone: "teal" },
  { id: "containers", label: "Container Candidates", value: "104", sub: "Identified", icon: Box, tone: "amber" },
  { id: "acq", label: "Acquisition Readiness", value: "83%", sub: "Current", icon: Users, tone: "indigo" },
];

const trendData = [
  { m: "May '25", current: 22, target: 24, forecast: 26 },
  { m: "Aug '25", current: 28, target: 32, forecast: 33 },
  { m: "Nov '25", current: 33, target: 40, forecast: 41 },
  { m: "Feb '26", current: 38, target: 48, forecast: 49 },
  { m: "May '26", current: 44, target: 56, forecast: 57 },
  { m: "Aug '26", current: 52, target: 64, forecast: 66 },
  { m: "Nov '26", current: 60, target: 72, forecast: 74 },
  { m: "Feb '27", current: 68, target: 80, forecast: 82 },
  { m: "May '27", current: 76, target: 88, forecast: 90 },
];

const investment = [
  { name: "0–30 Days", value: 2.1, pct: "11%", color: "#1e3a8a" },
  { name: "31–90 Days", value: 3.2, pct: "17%", color: "#0d9488" },
  { name: "3–6 Months", value: 3.6, pct: "19%", color: "#10b981" },
  { name: "6–12 Months", value: 3.8, pct: "20%", color: "#f59e0b" },
  { name: "12–24 Months", value: 3.7, pct: "20%", color: "#8b5cf6" },
  { name: "24+ Months", value: 2.3, pct: "13%", color: "#6366f1" },
];

const milestones = [
  { id: "m1", label: "Service Catalog Complete", date: "May 31, 2025", status: "On Track" },
  { id: "m2", label: "Golden Image Baseline", date: "Jun 30, 2025", status: "On Track" },
  { id: "m3", label: "SLO Framework Live", date: "Aug 15, 2025", status: "At Risk" },
  { id: "m4", label: "DR Drill #1", date: "Oct 15, 2025", status: "Planned" },
  { id: "m5", label: "Cloud Migration Wave #1", date: "Jan 15, 2026", status: "Planned" },
  { id: "m6", label: "Acquisition Factory Launch", date: "Apr 30, 2026", status: "Planned" },
];

const statusChip: Record<string, string> = {
  "On Track":  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "At Risk":   "bg-rose-50 text-rose-700 border border-rose-200",
  "Planned":   "bg-slate-100 text-slate-700 border border-slate-200",
  "Completed": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "In Progress":"bg-blue-50 text-blue-700 border border-blue-200",
};

const insights = [
  { id: "i1", icon: TrendingUp, label: "Top Opportunity", title: "Containerization Program", meta: "$1.2M Annual Benefit", tint: "emerald" },
  { id: "i2", icon: AlertTriangle, label: "Highest Risk", title: "Legacy Provider Pro Environment", meta: "Modernization Required", tint: "rose" },
  { id: "i3", icon: DollarSign, label: "Fastest ROI", title: "Cloud Rightsizing", meta: "$340K Annual Savings", tint: "amber" },
  { id: "i4", icon: Target, label: "Strategic Focus", title: "SRE Maturity · Automation", meta: "Service Ownership", tint: "violet" },
  { id: "i5", icon: CheckCircle2, label: "Roadmap Health", title: "On Track", meta: "Overall execution is healthy", tint: "emerald" },
];

const tintMap: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  rose:    "bg-rose-50 text-rose-700",
  amber:   "bg-amber-50 text-amber-700",
  violet:  "bg-violet-50 text-violet-700",
  indigo:  "bg-indigo-50 text-indigo-700",
  blue:    "bg-blue-50 text-blue-700",
  teal:    "bg-teal-50 text-teal-700",
};

const wellArch = [
  { k: "Operational Excellence", v: 72, c: "bg-blue-500" },
  { k: "Security",               v: 68, c: "bg-indigo-500" },
  { k: "Reliability",            v: 74, c: "bg-emerald-500" },
  { k: "Performance Efficiency", v: 61, c: "bg-violet-500" },
  { k: "Cost Optimization",      v: 69, c: "bg-amber-500" },
  { k: "Sustainability",         v: 44, c: "bg-teal-500" },
];

const outcomes = [
  { icon: DollarSign,  label: "Lower Cost-To-Serve",          sub: "Optimize spend and increase efficiency",         tint: "emerald" },
  { icon: Shield,      label: "Higher Reliability",           sub: "Improve uptime and service stability",            tint: "blue" },
  { icon: Heart,       label: "Improved Customer Experience", sub: "Protect caregiver and patient workflows",         tint: "rose" },
  { icon: ShieldCheck, label: "Reduced Operational Risk",     sub: "Proactive risk management and compliance",        tint: "violet" },
  { icon: Building2,   label: "Acquisition Scalability",      sub: "Onboard and operate acquisitions at scale",       tint: "indigo" },
  { icon: TrendingUp,  label: "Improved Transaction Readiness", sub: "Stronger governance and operating model",       tint: "amber" },
  { icon: BarChart3,   label: "Higher Enterprise Value",      sub: "Drive sustainable growth and valuation",          tint: "teal" },
];

/* ----------------------------- Component ----------------------------- */

type Selected =
  | { kind: "horizon"; id: string }
  | { kind: "kpi"; id: string }
  | { kind: "milestone"; id: string }
  | { kind: "insight"; id: string }
  | null;

export default function ModernizationRoadmapV2() {
  const [env, setEnv] = useState<"Production" | "Non Production">("Production");
  const [view, setView] = useState("Current → 24+ Months");
  const [sel, setSel] = useState<Selected>(null);

  const selected = useMemo(() => {
    if (!sel) return null;
    if (sel.kind === "horizon")   return { ...sel, item: horizons.find((h) => h.id === sel.id)! };
    if (sel.kind === "kpi")       return { ...sel, item: kpis.find((k) => k.id === sel.id)! };
    if (sel.kind === "milestone") return { ...sel, item: milestones.find((m) => m.id === sel.id)! };
    if (sel.kind === "insight")   return { ...sel, item: insights.find((i) => i.id === sel.id)! };
    return null;
  }, [sel]);

  return (
    <AppShell>
      <div className="flex-1 bg-slate-50/60 min-h-full">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="px-6 py-4 flex items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                HHAX Production Resilience Operating System
              </div>
              <h1 className="text-[24px] font-bold tracking-tight text-slate-900 leading-tight mt-0.5">
                Modernization Roadmap
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5 max-w-3xl">
                Transform production operations through reliability engineering, platform modernization,
                automation, cyber resilience, and operational excellence.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Selector label="Environment" value={env} onChange={(v) => setEnv(v as any)} options={["Production", "Non Production"]} />
              <Selector label="Roadmap View" value={view} onChange={setView} options={["Current → 24 Months", "Current → 24+ Months", "Current → 36 Months", "Current → 60 Months"]} />
              <Button variant="outline" className="h-10 text-[13px] font-semibold border-slate-200">
                <Download className="h-4 w-4" /> Export Roadmap
              </Button>
              <Button className="h-10 text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
                <Sparkles className="h-4 w-4" /> Generate Executive Narrative
              </Button>
              <button className="relative h-10 w-10 rounded-lg border border-slate-200 grid place-items-center bg-white hover:bg-slate-50">
                <Bell className="h-4 w-4 text-slate-700" />
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 grid place-items-center text-[10px] font-bold rounded-full bg-rose-500 text-white">6</span>
              </button>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-white text-xs font-bold">RA</div>
            </div>
          </div>
        </header>

        {/* KPI strip */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <button
                  key={k.id}
                  onClick={() => setSel({ kind: "kpi", id: k.id })}
                  className="text-left rounded-xl bg-white border border-slate-200 px-4 py-3.5 hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {k.ring ? (
                      <RingProgress pct={k.pct ?? 0} />
                    ) : (
                      <span className={cn("h-10 w-10 rounded-xl grid place-items-center", tintMap[k.tone] ?? "bg-slate-100 text-slate-700")}>
                        <Icon className="h-5 w-5" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-slate-500 leading-tight">{k.label}</div>
                      <div className="text-[22px] font-bold text-slate-900 leading-none mt-1 tabular-nums">{k.value}</div>
                      <div className="text-[10.5px] text-slate-500 mt-0.5">{k.sub}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content grid */}
        <div className="px-6 py-5 grid grid-cols-12 gap-5">
          {/* Center column */}
          <div className="col-span-12 xl:col-span-9 space-y-5">
            {/* Horizons */}
            <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-slate-900">Transformation Roadmap Horizons</h2>
                <div className="flex items-center gap-3 text-[11px]">
                  <Legendot color="bg-emerald-500" label="Completed" />
                  <Legendot color="bg-blue-500" label="In Progress" />
                  <Legendot color="bg-slate-300" label="Planned" />
                  <Legendot color="bg-amber-500" label="At Risk" />
                </div>
              </div>

              {/* Timeline line */}
              <div className="relative mt-6 mb-2">
                <div className="absolute left-4 right-4 top-4 h-[2px] bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 via-violet-400 to-indigo-500" />
                <div className="relative grid grid-cols-6 gap-3">
                  {horizons.map((h, i) => {
                    const a = accentMap[h.accent];
                    return (
                      <div key={h.id} className="flex flex-col items-center">
                        <div className={cn("h-8 w-8 rounded-full bg-white border-2 grid place-items-center z-10",
                          h.progress >= 50 ? "border-emerald-500" : h.progress >= 20 ? "border-blue-500" : "border-slate-300")}>
                          <span className={cn("h-2.5 w-2.5 rounded-full", a.dot)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Horizon cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
                {horizons.map((h) => {
                  const a = accentMap[h.accent];
                  return (
                    <button
                      key={h.id}
                      onClick={() => setSel({ kind: "horizon", id: h.id })}
                      className={cn(
                        "text-left rounded-xl bg-white border border-slate-200 p-3.5 hover:shadow-md hover:border-slate-300 transition-all flex flex-col gap-3 min-h-[440px]"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className={cn("h-7 w-7 rounded-lg grid place-items-center text-[12px] font-bold", a.soft, a.text)}>
                          {h.num}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">{h.time}</span>
                      </div>

                      <div>
                        <div className={cn("text-[14px] font-bold leading-tight", a.text)}>{h.title}</div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Key Outcomes</div>
                        <ul className="space-y-1">
                          {h.outcomes.slice(0, 7).map((o) => (
                            <li key={o} className="flex items-start gap-1.5 text-[11.5px] text-slate-700 leading-tight">
                              <CheckCircle2 className={cn("h-3 w-3 mt-0.5 shrink-0", a.text)} />
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Value Delivered</div>
                        <ul className="space-y-1 mb-3">
                          {h.value.map((v) => (
                            <li key={v} className="flex items-center gap-1.5 text-[11.5px] text-slate-700">
                              <span className={cn("h-1.5 w-1.5 rounded-full", a.dot)} />
                              {v}
                            </li>
                          ))}
                        </ul>

                        <div>
                          <div className="flex items-center justify-between text-[10.5px] mb-1">
                            <span className="font-semibold text-slate-600">Progress</span>
                            <span className="font-bold text-slate-900 tabular-nums">{h.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", a.bar)} style={{ width: `${h.progress}%` }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                          <div>
                            <div className="text-[9.5px] font-bold uppercase text-slate-500">Dependencies</div>
                            <div className="text-[15px] font-bold text-slate-900 tabular-nums">{h.deps}</div>
                          </div>
                          <div>
                            <div className="text-[9.5px] font-bold uppercase text-slate-500">Business Value</div>
                            <div className="text-[15px] font-bold text-slate-900 tabular-nums">{h.businessValue}</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 text-center">
                <button className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                  Expand All Horizons <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </section>

            {/* Bottom row: Trend / Investment / Milestones */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Trend */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-[14px] font-bold text-slate-900">Roadmap Progress Trend</h3>
                  <span className="text-[11px] text-slate-500">(24 Month View)</span>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} unit="%" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="current" name="Current" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="target"  name="Target"  stroke="#1e40af" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                      <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Investment */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-slate-900 mb-2">Investment by Horizon</h3>
                <div className="flex items-center gap-3">
                  <div className="relative h-[180px] w-[180px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={investment} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                          {investment.map((d) => <Cell key={d.name} fill={d.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 grid place-items-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-[18px] font-bold text-slate-900 leading-none">$18.7M</div>
                        <div className="text-[10px] text-slate-500 mt-1">Total<br/>Investment</div>
                      </div>
                    </div>
                  </div>
                  <ul className="flex-1 space-y-1.5 min-w-0">
                    {investment.map((d) => (
                      <li key={d.name} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-slate-700 truncate">{d.name}</span>
                        </span>
                        <span className="tabular-nums font-semibold text-slate-900">${d.value}M <span className="text-slate-400 font-normal">({d.pct})</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Milestones */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-slate-900 mb-3">Major Milestones</h3>
                <ul className="divide-y divide-slate-100">
                  {milestones.map((m) => (
                    <li key={m.id}>
                      <button
                        onClick={() => setSel({ kind: "milestone", id: m.id })}
                        className="w-full text-left py-2.5 flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-semibold text-slate-900 truncate">{m.label}</div>
                          <div className="text-[10.5px] text-slate-500 mt-0.5">{m.date}</div>
                        </div>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", statusChip[m.status])}>{m.status}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button className="mt-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                  View All Milestones <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </section>

            {/* Transformation outcomes */}
            <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-900 mb-3">Transformation Outcomes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
                {outcomes.map((o) => {
                  const Icon = o.icon;
                  return (
                    <div key={o.label} className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 hover:shadow-sm hover:bg-white transition">
                      <span className={cn("h-9 w-9 rounded-full grid place-items-center mb-2", tintMap[o.tint])}>
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div className="text-[12px] font-bold text-slate-900 leading-tight">{o.label}</div>
                      <div className="text-[10.5px] text-slate-500 mt-1 leading-snug">{o.sub}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="col-span-12 xl:col-span-3 space-y-5">
            {/* Executive Insights */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-900 mb-3">Executive Insights</h3>
              <ul className="space-y-2">
                {insights.map((i) => {
                  const Icon = i.icon;
                  return (
                    <li key={i.id}>
                      <button
                        onClick={() => setSel({ kind: "insight", id: i.id })}
                        className="w-full text-left rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition p-2.5 flex items-center gap-3"
                      >
                        <span className={cn("h-9 w-9 rounded-lg grid place-items-center shrink-0", tintMap[i.tint])}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{i.label}</div>
                          <div className="text-[12.5px] font-bold text-slate-900 leading-tight truncate">{i.title}</div>
                          <div className="text-[10.5px] text-slate-500 mt-0.5 truncate">{i.meta}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* AWS Well-Architected */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-900">AWS Well-Architected Alignment</h3>
              <ul className="mt-3 space-y-2.5">
                {wellArch.map((w) => (
                  <li key={w.k}>
                    <div className="flex items-center justify-between text-[11.5px] mb-1">
                      <span className="font-semibold text-slate-700">{w.k}</span>
                      <span className="tabular-nums font-bold text-slate-900">{w.v}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", w.c)} style={{ width: `${w.v}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Assistant */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-200 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-items-center">
                  <Sparkles className="h-4.5 w-4.5" />
                </span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-slate-900">AI Roadmap Assistant</div>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0 text-[9.5px]">Beta</Badge>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-snug">
                AI-powered analysis and recommendations for smarter transformation decisions.
              </p>
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">AI Supports</div>
                <ul className="space-y-1">
                  {["Dependency Analysis","Risk Forecasting","Value Forecasting","Investment Prioritization","Roadmap Sequencing","Board Narrative Generation","Executive Reporting","Recommendation Engine"].map((c) => (
                    <li key={c} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-indigo-600 shrink-0" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { l: "Risks Identified", v: "3" },
                  { l: "Dependencies", v: "92" },
                  { l: "Recommendations", v: "12" },
                  { l: "Projected Value", v: "$10.6M" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg bg-white border border-slate-200 p-2">
                    <div className="text-[9.5px] font-bold uppercase text-slate-500 truncate">{s.l}</div>
                    <div className="text-[14px] font-bold text-slate-900 tabular-nums">{s.v}</div>
                  </div>
                ))}
              </div>
              <Button className="mt-3 w-full h-9 text-[12px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
                View AI Insights
              </Button>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                <Shield className="h-3 w-3" /> Human approval required for all production changes
              </div>
            </div>
          </aside>
        </div>

        {/* Drawer */}
        <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
          <SheetContent side="right" className="sm:max-w-[640px] w-full overflow-y-auto">
            {selected && <DrawerBody selected={selected} />}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

/* ----------------------------- Subcomponents ----------------------------- */

function Selector({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="relative">
      <span className="absolute -top-2 left-2.5 bg-white px-1 text-[9.5px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Legendot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-600">
      <span className={cn("h-2 w-2 rounded-full", color)} /> {label}
    </span>
  );
}

function RingProgress({ pct }: { pct: number }) {
  const r = 16; const c = 2 * Math.PI * r; const off = c - (pct / 100) * c;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke="#4f46e5" strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform="rotate(-90 20 20)" />
      <text x="20" y="22" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">{pct}%</text>
    </svg>
  );
}

function DrawerBody({ selected }: { selected: any }) {
  const { kind, item } = selected;

  if (kind === "horizon") {
    const a = accentMap[item.accent];
    return (
      <>
        <SheetHeader>
          <div className="flex items-center gap-2">
            <span className={cn("h-7 w-7 rounded-lg grid place-items-center text-[12px] font-bold", a.soft, a.text)}>{item.num}</span>
            <span className="text-[11px] font-semibold text-slate-500">{item.time}</span>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", statusChip[item.status])}>{item.status}</span>
          </div>
          <SheetTitle className="text-[20px]">{item.title}</SheetTitle>
          <SheetDescription>Horizon detail · Initiatives, dependencies, risks, KPIs and business value.</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
            <TabsTrigger value="deps">Dependencies</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-3">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Progress" value={`${item.progress}%`} />
              <Stat label="Dependencies" value={item.deps} />
              <Stat label="Business Value" value={item.businessValue} />
            </div>
            <Progress value={item.progress} />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Key Outcomes</div>
              <ul className="grid grid-cols-2 gap-1.5">
                {item.outcomes.map((o: string) => (
                  <li key={o} className="text-[12px] text-slate-700 flex items-start gap-1.5">
                    <CheckCircle2 className={cn("h-3.5 w-3.5 mt-0.5", a.text)} /> {o}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Value Delivered</div>
              <div className="flex flex-wrap gap-1.5">
                {item.value.map((v: string) => (
                  <span key={v} className={cn("text-[11px] px-2 py-1 rounded-md border", a.chip)}>{v}</span>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="initiatives" className="mt-3 space-y-2">
            {item.outcomes.map((o: string, i: number) => (
              <div key={o} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-slate-900">{o}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Owner: Platform Engineering · Initiative #{item.num}.{i + 1}</div>
                <Progress value={Math.min(100, item.progress + i * 5)} className="h-1.5 mt-2" />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="deps" className="mt-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-[12px]">
                <div className="flex items-center gap-2"><GitBranch className="h-3.5 w-3.5 text-slate-500" /> Upstream Dep · DEP-{(item.num * 10) + i + 1}</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Healthy</span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="ai" className="mt-3 space-y-2">
            {[
              "Recommend pulling 'Runbook Automation' forward by 30 days — dependencies met.",
              "Cost rightsizing program shows fastest ROI; align with FinOps tagging.",
              "Risk: SLO drafts incomplete for Caregiver EVV — escalate to Service Owner.",
            ].map((t) => (
              <div key={t} className="flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
                <Lightbulb className="h-4 w-4 text-indigo-600 mt-0.5" />
                <div className="text-[12px] text-slate-700">{t}</div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </>
    );
  }

  if (kind === "kpi") {
    return (
      <>
        <SheetHeader>
          <SheetTitle className="text-[20px]">{item.label}</SheetTitle>
          <SheetDescription>Current value {item.value} · {item.sub}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-[36px] font-bold text-slate-900 tabular-nums">{item.value}</div>
            <div className="text-[12px] text-slate-500">{item.sub}</div>
          </div>
          <div className="text-[12px] text-slate-600">
            Drill into contributing initiatives, owners, dependencies, and forecasted trajectory.
            All actions route through governance.
          </div>
        </div>
      </>
    );
  }

  if (kind === "milestone") {
    return (
      <>
        <SheetHeader>
          <SheetTitle className="text-[20px]">{item.label}</SheetTitle>
          <SheetDescription>Target date {item.date}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div><span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", statusChip[item.status])}>{item.status}</span></div>
          <div className="rounded-xl border border-slate-200 p-4 text-[12px] text-slate-600">
            Owner, supporting initiatives, dependencies, evidence and exec rollup appear here.
          </div>
        </div>
      </>
    );
  }

  if (kind === "insight") {
    const Icon = item.icon;
    return (
      <>
        <SheetHeader>
          <div className="flex items-center gap-2">
            <span className={cn("h-9 w-9 rounded-lg grid place-items-center", tintMap[item.tint])}><Icon className="h-4.5 w-4.5" /></span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{item.label}</div>
              <SheetTitle className="text-[18px]">{item.title}</SheetTitle>
            </div>
          </div>
          <SheetDescription>{item.meta}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 text-[12px] text-slate-600">
          Recommended next actions, owners, value attribution and supporting evidence.
        </div>
      </>
    );
  }

  return null;
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-[18px] font-bold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}
