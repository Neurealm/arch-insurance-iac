import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Filter, Download, Bell, ChevronRight, TrendingUp, Sparkles,
  Eye, ShieldCheck, Settings as Cog, Award, Box, Building2,
  CheckCircle2, AlertTriangle, Activity, Target, Cloud, Zap,
  DollarSign, Heart, BarChart3, FileText, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

type Drawer = { kind: string; title: string; subtitle?: string; data?: any } | null;

/* ---------- Top KPIs ---------- */
const TOP_KPIS = [
  { id: "prog", label: "Overall Roadmap Progress", icon: Activity, color: "text-blue-600", value: "38%", sub: "On Track", tone: "text-emerald-600", showBar: true, barPct: 38 },
  { id: "init", label: "Initiatives", icon: Layers, color: "text-violet-600", value: "46", sub: "Active", tone: "text-slate-500" },
  { id: "inv",  label: "Investment", icon: DollarSign, color: "text-emerald-600", value: "$18.7M", sub: "Committed", tone: "text-slate-500" },
  { id: "val",  label: "Annual Value Target", icon: BarChart3, color: "text-blue-600", value: "$10.6M", sub: "by Year 1", tone: "text-slate-500" },
  { id: "risk", label: "Risk Reduction", icon: ShieldCheck, color: "text-rose-500", value: "High", sub: "Improving", tone: "text-emerald-600", valueTone: "text-rose-600" },
  { id: "auto", label: "Automation Coverage", icon: Cog, color: "text-amber-500", value: "61%", sub: "Current State", tone: "text-slate-500" },
  { id: "health", label: "Operating Health", icon: Heart, color: "text-emerald-500", value: "88", sub: "Healthy", tone: "text-emerald-600" },
];

/* ---------- Horizons ---------- */
type Horizon = {
  id: string;
  horizon: string;
  horizonTone: string; // background tinted box
  icon: any;
  iconTone: string;
  theme: string;
  themeTone: string;
  desc: string;
  outcomesA: string[];
  outcomesB: string[];
  impacts: { label: string; value: string; tone: string }[];
  ctaTone: string;
};

const HORIZONS: Horizon[] = [
  {
    id: "h1", horizon: "0–30 Days", horizonTone: "bg-blue-50 text-blue-700 ring-blue-200",
    icon: Eye, iconTone: "text-blue-600 bg-blue-50 ring-blue-200",
    theme: "Stabilize and See", themeTone: "text-blue-700",
    desc: "Establish visibility, understand the environment, and stabilize critical services.",
    outcomesA: ["Product & Service Catalog", "Dependency Map", "Alert Inventory & Rationalization"],
    outcomesB: ["Critical Workflow SLO Drafts", "Initial Runbook Assessment", "Transition Plan & Governance"],
    impacts: [
      { label: "Visibility", value: "+65%", tone: "text-emerald-600" },
      { label: "Risk", value: "High → Med", tone: "text-amber-600" },
      { label: "Service Health", value: "+22%", tone: "text-emerald-600" },
    ],
    ctaTone: "text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  {
    id: "h2", horizon: "31–90 Days", horizonTone: "bg-violet-50 text-violet-700 ring-violet-200",
    icon: ShieldCheck, iconTone: "text-violet-600 bg-violet-50 ring-violet-200",
    theme: "Standardize and Control", themeTone: "text-violet-700",
    desc: "Implement foundational standards and controls across the platform.",
    outcomesA: ["Golden Image Baseline", "Patch SLA Model", "Observability Tuning"],
    outcomesB: ["Vulnerability Workflow", "Runbook Inventory", "Cost Tagging & Visibility"],
    impacts: [
      { label: "Compliance", value: "+34%", tone: "text-emerald-600" },
      { label: "Security Posture", value: "+28%", tone: "text-emerald-600" },
      { label: "Cost Visibility", value: "+41%", tone: "text-emerald-600" },
    ],
    ctaTone: "text-violet-700 border-violet-200 hover:bg-violet-50",
  },
  {
    id: "h3", horizon: "3–6 Months", horizonTone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: Cog, iconTone: "text-emerald-600 bg-emerald-50 ring-emerald-200",
    theme: "Automate and Reduce Toil", themeTone: "text-emerald-700",
    desc: "Automate repeatable tasks and reduce operational friction.",
    outcomesA: ["Automated Patch Waves", "Security Group Validation", "Incident Summarization"],
    outcomesB: ["Runbook Automation", "FinOps Automation", "Alert Noise Reduction"],
    impacts: [
      { label: "Automation", value: "+58%", tone: "text-emerald-600" },
      { label: "Toil Reduction", value: "−36%", tone: "text-emerald-600" },
      { label: "MTTR Improvement", value: "−42%", tone: "text-emerald-600" },
    ],
    ctaTone: "text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  {
    id: "h4", horizon: "6–12 Months", horizonTone: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Award, iconTone: "text-amber-600 bg-amber-50 ring-amber-200",
    theme: "Engineer Reliability", themeTone: "text-amber-700",
    desc: "Embed reliability engineering principles and operational discipline.",
    outcomesA: ["SLO & Error Budget Governance", "Production Readiness Reviews", "Service Ownership Model"],
    outcomesB: ["DR Drills & Validation", "Release Guardrails", "Capacity & Performance Mgmt"],
    impacts: [
      { label: "Reliability", value: "+41%", tone: "text-emerald-600" },
      { label: "Resilience", value: "+36%", tone: "text-emerald-600" },
      { label: "Change Success", value: "+27%", tone: "text-emerald-600" },
    ],
    ctaTone: "text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  {
    id: "h5", horizon: "12–24 Months", horizonTone: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
    icon: Box, iconTone: "text-fuchsia-600 bg-fuchsia-50 ring-fuchsia-200",
    theme: "Modernize Platform", themeTone: "text-fuchsia-700",
    desc: "Modernize architecture, platforms, and data to increase agility and reduce technical debt.",
    outcomesA: ["Containerization & Service Decomp", "Infrastructure as Code Coverage", "Database Modernization"],
    outcomesB: ["GCP Rationalization", "API Standardization", "Acquisition Onboarding Factory"],
    impacts: [
      { label: "Modernization", value: "+52%", tone: "text-emerald-600" },
      { label: "Tech Debt", value: "−48%", tone: "text-emerald-600" },
      { label: "Cost to Serve", value: "−33%", tone: "text-emerald-600" },
    ],
    ctaTone: "text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-50",
  },
  {
    id: "h6", horizon: "24+ Months", horizonTone: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: Building2, iconTone: "text-slate-700 bg-slate-100 ring-slate-200",
    theme: "Scale Acquisition Engine", themeTone: "text-slate-800",
    desc: "Operate at scale across acquisitions and grow operating leverage.",
    outcomesA: ["Repeatable M&A Intake", "Operating Model Leverage", "Lower Cost-to-Serve"],
    outcomesB: ["Platform Scalability", "Standardized Integration", "Transaction Readiness"],
    impacts: [
      { label: "Operating Leverage", value: "High", tone: "text-emerald-600" },
      { label: "Scalability", value: "High", tone: "text-emerald-600" },
      { label: "Transaction Readiness", value: "High", tone: "text-emerald-600" },
    ],
    ctaTone: "text-slate-700 border-slate-200 hover:bg-slate-50",
  },
];

/* ---------- Executive insights ---------- */
const EXEC_INSIGHTS = [
  { id: "opp", label: "Top Opportunity", icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50",
    title: "Containerization Program", value: "$1.2M Annual Benefit" },
  { id: "risk", label: "Highest Risk", icon: AlertTriangle, tone: "text-rose-600 bg-rose-50",
    title: "Legacy Provider Pro Environment", value: "Modernization Required", valueTone: "text-rose-600" },
  { id: "roi", label: "Fastest ROI", icon: Zap, tone: "text-amber-600 bg-amber-50",
    title: "Cloud Rightsizing", value: "$340K Annual Savings" },
  { id: "focus", label: "Strategic Focus", icon: Target, tone: "text-blue-600 bg-blue-50",
    title: "SRE & Automation Maturity", value: "Drive Reliability & Scalability" },
  { id: "health", label: "Roadmap Health", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50",
    title: "On Track", value: "38% Complete" },
];

const PILLARS = [
  { label: "Operational Excellence", pct: 72, color: "bg-blue-500" },
  { label: "Security", pct: 68, color: "bg-emerald-500" },
  { label: "Reliability", pct: 74, color: "bg-cyan-500" },
  { label: "Performance Efficiency", pct: 61, color: "bg-amber-500" },
  { label: "Cost Optimization", pct: 69, color: "bg-violet-500" },
  { label: "Sustainability", pct: 44, color: "bg-rose-400" },
];

const AI_ITEMS = [
  { label: "Risk Forecasting", value: "3 Risks Identified" },
  { label: "Value Forecast", value: "$10.6M Annual Target" },
  { label: "Dependency Analysis", value: "92 Dependencies Mapped" },
  { label: "Recommendation Engine", value: "12 Recommendations" },
];

/* ---------- Charts data ---------- */
const TREND = [
  { m: "May '25", actual: 22, target: 25, forecast: 24 },
  { m: "Aug '25", actual: 28, target: 32, forecast: 31 },
  { m: "Nov '25", actual: 34, target: 40, forecast: 39 },
  { m: "Feb '26", actual: 38, target: 50, forecast: 49 },
  { m: "May '26", actual: 0, target: 60, forecast: 60 },
  { m: "Aug '26", actual: 0, target: 70, forecast: 72 },
  { m: "Nov '26", actual: 0, target: 80, forecast: 82 },
  { m: "Feb '27", actual: 0, target: 88, forecast: 92 },
];

const INVESTMENT = [
  { label: "0–30 Days", value: 2.1, pct: "11%", color: "#3b82f6" },
  { label: "31–90 Days", value: 3.2, pct: "17%", color: "#06b6d4" },
  { label: "3–6 Months", value: 3.6, pct: "19%", color: "#10b981" },
  { label: "6–12 Months", value: 3.8, pct: "20%", color: "#f59e0b" },
  { label: "12–24 Months", value: 3.7, pct: "20%", color: "#a855f7" },
  { label: "24+ Months", value: 2.3, pct: "13%", color: "#64748b" },
];

const MILESTONES = [
  { label: "Service Catalog Complete", date: "May 31, 2025", status: "On Track", tone: "bg-emerald-100 text-emerald-700" },
  { label: "Golden Image Baseline",    date: "Jun 30, 2025", status: "On Track", tone: "bg-emerald-100 text-emerald-700" },
  { label: "SLO Framework Live",       date: "Aug 15, 2025", status: "At Risk",  tone: "bg-amber-100 text-amber-700" },
  { label: "DR Drill #1 Complete",     date: "Oct 15, 2025", status: "Planned",  tone: "bg-slate-100 text-slate-700" },
  { label: "First Cloud Migration Wave", date: "Jan 15, 2026", status: "Planned", tone: "bg-slate-100 text-slate-700" },
];

/* ---------- Page ---------- */
export default function ModernizationRoadmap() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [env, setEnv] = useState("Production");
  const [range, setRange] = useState("Current – 24+ Months");

  const openDrawer = (d: Drawer) => setDrawer(d);

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-[#f7f8fb]">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-6 sticky top-0 z-30">
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-semibold text-slate-900 leading-tight">Modernization Roadmap</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Execute a phased roadmap to modernize, automate, secure, and scale the Client production platform.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-slate-400 ml-2">Environment</span>
              <Select value={env} onValueChange={setEnv}>
                <SelectTrigger className="h-9 w-[160px] text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Production", "Pre-Prod", "All Environments"].map((e) => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-slate-400 ml-2">Time Range</span>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="h-9 w-[200px] text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Current – 24+ Months", "Next 90 Days", "Next 12 Months", "Long Range"].map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="h-9"><Filter className="h-4 w-4 mr-1.5" />Filters</Button>
            <Button variant="outline" size="sm" className="h-9" onClick={() => toast.success("Roadmap export queued")}><Download className="h-4 w-4 mr-1.5" />Export Roadmap</Button>
            <button className="relative h-9 w-9 grid place-items-center rounded-md border border-slate-200 hover:bg-slate-50">
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] grid place-items-center font-semibold">6</span>
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 grid place-items-center text-white text-xs font-semibold">RA</div>
          </div>
        </header>

        {/* KPI Row */}
        <section className="px-6 pt-5">
          <div className="grid grid-cols-7 gap-3">
            {TOP_KPIS.map((k) => {
              const Icon = k.icon;
              return (
                <button key={k.id}
                  onClick={() => openDrawer({ kind: "kpi", title: k.label, data: k })}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 text-left hover:border-blue-300 hover:shadow-sm transition group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("h-8 w-8 rounded-lg grid place-items-center ring-1 ring-slate-200 bg-slate-50", k.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium leading-tight">{k.label}</span>
                  </div>
                  <div className={cn("text-[26px] font-bold leading-none mt-1", k.valueTone || "text-slate-900")}>{k.value}</div>
                  <div className={cn("text-[11px] mt-1.5 font-medium", k.tone)}>{k.sub}</div>
                  {k.showBar && (
                    <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${k.barPct}%` }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Main grid */}
        <section className="px-6 py-5 grid grid-cols-12 gap-5">
          {/* Horizon roadmap */}
          <div className="col-span-9 bg-white rounded-xl border border-slate-200">
            <div className="grid grid-cols-[120px_minmax(220px,1.1fr)_minmax(280px,1.4fr)_minmax(320px,1.2fr)_120px] gap-4 px-5 py-3 border-b border-slate-200 text-[11px] uppercase tracking-wide font-semibold text-slate-500">
              <div>Horizon</div>
              <div>Theme</div>
              <div>Key Outcomes</div>
              <div>Strategic Impact</div>
              <div></div>
            </div>
            <div className="relative">
              {/* vertical timeline rail */}
              <div className="absolute left-[28px] top-4 bottom-4 w-px bg-slate-200" />
              {HORIZONS.map((h, idx) => {
                const Icon = h.icon;
                return (
                  <div key={h.id} className="grid grid-cols-[120px_minmax(220px,1.1fr)_minmax(280px,1.4fr)_minmax(320px,1.2fr)_120px] gap-4 px-5 py-5 border-b last:border-b-0 border-slate-100 items-start relative">
                    {/* timeline node */}
                    <div className="absolute left-[22px] top-9 h-3 w-3 rounded-full bg-white ring-2 ring-slate-300 z-10" />
                    {/* Horizon chip */}
                    <div className="pl-12">
                      <div className={cn("inline-flex flex-col items-center justify-center rounded-xl px-4 py-3 ring-1 font-semibold text-[14px] min-w-[90px]", h.horizonTone)}>
                        <span>{h.horizon.split(" ")[0]}</span>
                        <span className="text-[11px] font-medium opacity-80 mt-0.5">{h.horizon.split(" ").slice(1).join(" ")}</span>
                      </div>
                    </div>
                    {/* Theme */}
                    <div className="flex gap-3">
                      <div className={cn("h-10 w-10 rounded-lg grid place-items-center ring-1 shrink-0", h.iconTone)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className={cn("text-[14px] font-semibold leading-tight", h.themeTone)}>{h.theme}</div>
                        <div className="text-[12px] text-slate-500 leading-snug mt-1">{h.desc}</div>
                      </div>
                    </div>
                    {/* Outcomes */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {h.outcomesA.map((o) => (
                        <div key={o} className="flex items-start gap-1.5 text-[12px] text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" /> <span>{o}</span>
                        </div>
                      ))}
                      {h.outcomesB.map((o) => (
                        <div key={o} className="flex items-start gap-1.5 text-[12px] text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" /> <span>{o}</span>
                        </div>
                      ))}
                    </div>
                    {/* Impact */}
                    <div className="grid grid-cols-3 gap-2">
                      {h.impacts.map((i) => (
                        <div key={i.label} className="rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-2 text-center">
                          <div className="text-[10px] text-slate-500 leading-tight">{i.label}</div>
                          <div className={cn("text-[14px] font-bold mt-1", i.tone)}>{i.value}</div>
                        </div>
                      ))}
                    </div>
                    {/* CTA */}
                    <div className="flex items-start justify-end">
                      <button
                        onClick={() => openDrawer({ kind: "horizon", title: h.theme, subtitle: h.horizon, data: h })}
                        className={cn("text-[12px] font-semibold px-3 py-1.5 rounded-md border transition", h.ctaTone)}>
                        View Initiatives
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right rail */}
          <div className="col-span-3 space-y-5">
            {/* Executive insights */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-[13px] font-semibold text-slate-900 mb-3">Executive Insights</div>
              <div className="space-y-2.5">
                {EXEC_INSIGHTS.map((ei) => {
                  const Icon = ei.icon;
                  return (
                    <button key={ei.id} onClick={() => openDrawer({ kind: "insight", title: ei.title, subtitle: ei.label, data: ei })}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition text-left">
                      <div className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0", ei.tone)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-slate-500 leading-tight">{ei.label}</div>
                        <div className="text-[12.5px] font-semibold text-slate-900 leading-tight mt-0.5 truncate">{ei.title}</div>
                        <div className={cn("text-[11px] mt-0.5", ei.valueTone || "text-slate-500")}>{ei.value}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 mt-2" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pillar alignment */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-[13px] font-semibold text-slate-900 mb-3">Pillar Alignment Progress</div>
              <div className="space-y-2.5">
                {PILLARS.map((p) => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between text-[12px] text-slate-700 mb-1">
                      <span>{p.label}</span>
                      <span className="font-semibold text-slate-900">{p.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={cn("h-full rounded-full", p.color)} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Roadmap Assistant */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <div className="text-[13px] font-semibold text-slate-900">AI Roadmap Assistant</div>
              </div>
              <div className="space-y-2">
                {AI_ITEMS.map((a) => (
                  <button key={a.label}
                    onClick={() => openDrawer({ kind: "ai", title: a.label, data: a })}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition">
                    <div className="text-[12px] font-semibold text-slate-900">{a.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{a.value}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => openDrawer({ kind: "ai", title: "AI Roadmap Insights", data: { value: "Synthesized recommendations" } })}
                className="mt-3 w-full text-[12px] font-semibold text-blue-600 hover:underline flex items-center justify-end gap-1">
                View AI Insights <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Bottom row */}
        <section className="px-6 pb-8 grid grid-cols-12 gap-5">
          {/* Progress trend */}
          <div className="col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-semibold text-slate-900">Roadmap Progress Trend</div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="h-1 w-3 bg-blue-500 rounded" />Actual</span>
                <span className="flex items-center gap-1"><span className="h-1 w-3 bg-amber-500 rounded" />Target</span>
                <span className="flex items-center gap-1"><span className="h-1 w-3 bg-emerald-500 rounded border-t border-dashed" />Forecast</span>
              </div>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <RTooltip />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment by horizon */}
          <div className="col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-[13px] font-semibold text-slate-900 mb-2">Investment by Horizon</div>
            <div className="flex items-center gap-4">
              <div className="relative h-[170px] w-[170px] shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={INVESTMENT} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={1} stroke="none">
                      {INVESTMENT.map((d) => <Cell key={d.label} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-[18px] font-bold text-slate-900 leading-none">$18.7M</div>
                    <div className="text-[10px] text-slate-500 mt-1">Total</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {INVESTMENT.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-[11.5px]">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                      {d.label}
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-semibold text-slate-900">${d.value.toFixed(1)}M</span>
                      <span className="text-slate-400">({d.pct})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key milestones */}
          <div className="col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-[13px] font-semibold text-slate-900 mb-3">Key Milestones</div>
            <div className="divide-y divide-slate-100">
              {MILESTONES.map((m) => (
                <button key={m.label}
                  onClick={() => openDrawer({ kind: "milestone", title: m.label, data: m })}
                  className="w-full flex items-center justify-between py-2.5 text-left hover:bg-slate-50 rounded px-1 -mx-1">
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium text-slate-900 truncate">{m.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{m.date}</div>
                  </div>
                  <span className={cn("text-[10.5px] font-semibold px-2 py-1 rounded-full shrink-0 ml-3", m.tone)}>{m.status}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => openDrawer({ kind: "milestone", title: "All Milestones", data: { value: "Full milestone register" } })}
              className="mt-3 text-[12px] font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All Milestones <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        <footer className="px-6 py-3 border-t border-slate-200 text-[11px] text-slate-400 bg-white">© 2025 Client. All rights reserved.</footer>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[640px] sm:max-w-none overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-900">{drawer?.title}</SheetTitle>
            {drawer?.subtitle && <div className="text-[12px] text-slate-500 -mt-1">{drawer.subtitle}</div>}
          </SheetHeader>
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
              <TabsTrigger value="dependencies">Deps</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4 space-y-3">
              <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                <div className="text-[12px] text-slate-500">Context</div>
                <div className="text-[13px] text-slate-800 mt-1">
                  {drawer?.kind === "horizon" && (drawer?.data as Horizon)?.desc}
                  {drawer?.kind === "kpi" && "Drill into trend, contributing initiatives, and owners for this metric."}
                  {drawer?.kind === "insight" && (drawer?.data?.value || "Detail view")}
                  {drawer?.kind === "ai" && "AI assistant context, inputs, models used, and confidence."}
                  {drawer?.kind === "milestone" && `Status: ${drawer?.data?.status || "—"} — Target: ${drawer?.data?.date || "—"}`}
                </div>
              </div>
              {drawer?.kind === "horizon" && (
                <div className="space-y-2">
                  <div className="text-[12px] font-semibold text-slate-700">Key Outcomes</div>
                  <ul className="space-y-1.5 text-[12.5px]">
                    {[...(drawer.data as Horizon).outcomesA, ...(drawer.data as Horizon).outcomesB].map((o) => (
                      <li key={o} className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5" />{o}</li>
                    ))}
                  </ul>
                  <div className="text-[12px] font-semibold text-slate-700 mt-3">Strategic Impact</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(drawer.data as Horizon).impacts.map((i) => (
                      <div key={i.label} className="rounded-lg border border-slate-200 p-2 text-center">
                        <div className="text-[10.5px] text-slate-500">{i.label}</div>
                        <div className={cn("text-[14px] font-bold mt-0.5", i.tone)}>{i.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="initiatives" className="mt-4 space-y-2 text-[12.5px] text-slate-700">
              {["Service Catalog Build-out", "SLO Drafting & Approval", "Runbook Inventory & Coverage", "Alert Rationalization Wave 1"].map((t) => (
                <div key={t} className="rounded-md border border-slate-200 p-2.5 flex items-center justify-between">
                  <span>{t}</span>
                  <Badge variant="outline" className="text-[10px]">Active</Badge>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="dependencies" className="mt-4 text-[12.5px] text-slate-700 space-y-2">
              {["Identity Migration (IAM)", "Observability Platform Rollout", "Cloud Landing Zone v2"].map((d) => (
                <div key={d} className="rounded-md border border-slate-200 p-2.5">{d}</div>
              ))}
            </TabsContent>
            <TabsContent value="evidence" className="mt-4 text-[12.5px] text-slate-700 space-y-2">
              <div className="rounded-md border border-slate-200 p-2.5 flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-slate-400" />Quarterly Roadmap Review.pdf</div>
              <div className="rounded-md border border-slate-200 p-2.5 flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-slate-400" />Initiative Plan & Owners.xlsx</div>
            </TabsContent>
            <TabsContent value="actions" className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => { toast.success("Briefing scheduled"); setDrawer(null); }}>Schedule Briefing</Button>
              <Button size="sm" variant="outline" onClick={() => { toast.success("Owner notified"); setDrawer(null); }}>Notify Owner</Button>
              <Button size="sm" variant="outline" onClick={() => { toast.success("Exported"); setDrawer(null); }}>Export Section</Button>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
