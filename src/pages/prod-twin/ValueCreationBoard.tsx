import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Filter, ShieldCheck, Users, Clock, Timer, Wrench, ShieldAlert, Cloud, Code2,
  BarChart3, Bell, HelpCircle, Calendar, ChevronRight, TrendingUp, Sparkles,
  Building2, Activity, Code, Layers, Zap, Settings as Cog, CheckCircle2, AlertTriangle,
  MoreVertical,
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
  ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine,
} from "recharts";

type Drawer = { kind: string; title: string; subtitle?: string; data?: any } | null;

/* ------- Sparkline ------- */
function Spark({ data, color = "#2563eb" }: { data: number[]; color?: string }) {
  const w = 110, h = 28; const mx = Math.max(...data), mn = Math.min(...data);
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - mn) / Math.max(0.001, mx - mn)) * (h - 4) - 2;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-7 w-full">
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={color} opacity={0.1} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

/* ------- KPI Row ------- */
const KPIS: { id: string; label: string; icon: any; color: string; rows: { k: string; v: string; tone?: string }[]; spark?: number[]; sparkColor?: string }[] = [
  { id: "rel", label: "Reliability Improvement", icon: ShieldCheck, color: "text-blue-500",
    rows: [{ k: "Sev1 Reduction", v: "-47%", tone: "text-emerald-600 font-bold text-2xl" }, { k: "SLO Compliance", v: "98.6% ↗", tone: "text-emerald-600 font-bold" }] },
  { id: "cir", label: "Customer Impact Reduction", icon: Users, color: "text-violet-500",
    rows: [{ k: "Caregiver Interruptions", v: "-63%", tone: "text-emerald-600 font-bold" }, { k: "Claims Disruptions", v: "-41%", tone: "text-emerald-600 font-bold" }, { k: "Payroll Incidents", v: "-52%", tone: "text-emerald-600 font-bold" }] },
  { id: "mttd", label: "MTTD Improvement", icon: Clock, color: "text-cyan-600",
    rows: [{ k: "Before", v: "28 min", tone: "text-rose-600 font-bold" }, { k: "Current", v: "4 min", tone: "text-emerald-600 font-bold" }] },
  { id: "mttr", label: "MTTR Improvement", icon: Timer, color: "text-cyan-600",
    rows: [{ k: "Before", v: "2.8 hrs", tone: "text-rose-600 font-bold" }, { k: "Current", v: "24 min", tone: "text-emerald-600 font-bold" }] },
  { id: "toil", label: "Toil Reduction", icon: Wrench, color: "text-amber-500",
    rows: [{ k: "Manual Hours Eliminated", v: "2,842", tone: "text-emerald-600 font-bold text-2xl" }, { k: "Monthly", v: "" }] },
  { id: "cyber", label: "Cyber Risk Reduction", icon: ShieldAlert, color: "text-rose-500",
    rows: [{ k: "Critical CVEs Closed", v: "91%", tone: "text-emerald-600 font-bold text-2xl" }, { k: "Patch SLA Compliance", v: "96%", tone: "text-emerald-600 font-bold" }] },
  { id: "cloud", label: "Cloud Cost Optimization", icon: Cloud, color: "text-blue-500",
    rows: [{ k: "Annualized Savings", v: "$2.7M", tone: "text-emerald-600 font-bold text-2xl" }],
    spark: [10,14,16,15,18,20,19,22,24,26,28,30], sparkColor: "#2563eb" },
  { id: "mvel", label: "Modernization Velocity", icon: Code2, color: "text-violet-500",
    rows: [{ k: "IaC Coverage", v: "74%", tone: "text-emerald-600 font-semibold" }, { k: "Golden Images", v: "83%", tone: "text-emerald-600 font-semibold" }, { k: "GitHub Actions Migration", v: "68%", tone: "text-emerald-600 font-semibold" }] },
  { id: "tr", label: "Transaction Readiness Score", icon: BarChart3, color: "text-emerald-500",
    rows: [{ k: "", v: "86", tone: "text-slate-900 font-bold text-3xl" }, { k: "Board Ready", v: "", tone: "text-emerald-600 font-semibold" }],
    spark: [60,64,66,70,72,74,78,80,82,84,85,86], sparkColor: "#10b981" },
];

/* ------- Value Engine Nodes ------- */
const NODES: { id: string; label: string; icon: any; tone: string; rows: { k: string; v: string }[] }[] = [
  { id: "tx", label: "Transaction Readiness", icon: Building2, tone: "text-blue-600",
    rows: [{ k: "Investment", v: "$1.9M" }, { k: "Progress", v: "76%" }, { k: "Value Realized", v: "$0.6M" }, { k: "Target", v: "85% ↗" }] },
  { id: "rel", label: "Reliability", icon: ShieldCheck, tone: "text-emerald-600",
    rows: [{ k: "Investment", v: "$5.4M" }, { k: "Progress", v: "78%" }, { k: "Value Realized", v: "$1.2M" }, { k: "Target", v: "85% ↗" }] },
  { id: "cx", label: "Customer Experience", icon: Users, tone: "text-violet-600",
    rows: [{ k: "Investment", v: "$3.2M" }, { k: "Progress", v: "82%" }, { k: "Value Realized", v: "$1.6M" }, { k: "Target", v: "90% ↗" }] },
  { id: "cyr", label: "Cyber Resilience", icon: ShieldAlert, tone: "text-rose-600",
    rows: [{ k: "Investment", v: "$4.1M" }, { k: "Progress", v: "76%" }, { k: "Value Realized", v: "$1.1M" }, { k: "Target", v: "85% ↗" }] },
  { id: "mod", label: "Modernization", icon: Code, tone: "text-amber-600",
    rows: [{ k: "Investment", v: "$6.8M" }, { k: "Progress", v: "69%" }, { k: "Value Realized", v: "$2.3M" }, { k: "Target", v: "85% ↗" }] },
  { id: "cop", label: "Cloud Optimization", icon: Cloud, tone: "text-cyan-600",
    rows: [{ k: "Investment", v: "$2.9M" }, { k: "Progress", v: "81%" }, { k: "Value Realized", v: "$2.7M" }, { k: "Target", v: "90% ↗" }] },
  { id: "aut", label: "Automation", icon: Zap, tone: "text-fuchsia-600",
    rows: [{ k: "Investment", v: "$2.2M" }, { k: "Progress", v: "84%" }, { k: "Value Realized", v: "$3.4M" }, { k: "Target", v: "90% ↗" }] },
  { id: "own", label: "Service Ownership", icon: Cog, tone: "text-slate-700",
    rows: [{ k: "Investment", v: "$1.6M" }, { k: "Progress", v: "75%" }, { k: "Value Realized", v: "$0.9M" }, { k: "Target", v: "85% ↗" }] },
  { id: "sca", label: "Scalability", icon: TrendingUp, tone: "text-teal-600",
    rows: [{ k: "Investment", v: "$2.1M" }, { k: "Progress", v: "71%" }, { k: "Value Realized", v: "$1.0M" }, { k: "Target", v: "85% ↗" }] },
];

/* ------- Waterfall ------- */
const WATERFALL = [
  { name: "Baseline\nTechnology Cost", value: 38.4, type: "base" },
  { name: "Reliability\nGains",        value: 1.2,  type: "pos" },
  { name: "Cloud\nSavings",            value: 2.7,  type: "pos" },
  { name: "Automation\nSavings",       value: 3.4,  type: "pos" },
  { name: "Cyber Risk\nReduction",     value: 1.1,  type: "pos" },
  { name: "Operational\nEfficiency",   value: 2.2,  type: "pos" },
  { name: "Net Annual\nValue",         value: 10.6, type: "final" },
];

/* ------- Detailed metric strips ------- */
const REL_METRICS = [
  { k: "Sev1 Reduction", v: "-47%" },
  { k: "Sev2 Reduction", v: "-38%" },
  { k: "Error Budget Health", v: "82%" },
  { k: "SLO Compliance", v: "98.6%" },
  { k: "Customer SLA Compliance", v: "99.2%" },
];
const CX_METRICS = [
  { k: "Caregiver Visit Availability", v: "99.97%" },
  { k: "Claims Processing Success", v: "99.8%" },
  { k: "Payroll Completion Success", v: "99.9%" },
  { k: "Customer Escalations", v: "-44%" },
  { k: "State SLA Violations", v: "0" },
];
const OPS_METRICS = [
  { k: "Automated Runbooks", v: "186" },
  { k: "Manual Tasks Eliminated", v: "312" },
  { k: "Alert Noise Reduction", v: "72%" },
  { k: "Hours Returned to Engineering", v: "2,842", sub: "Monthly" },
];
const CYBER_METRICS = [
  { k: "Critical Vulnerabilities", v: "18 → 2" },
  { k: "Patch Compliance", v: "96%" },
  { k: "EDR Coverage", v: "97%" },
  { k: "Golden Build Compliance", v: "92%" },
  { k: "Recovery Readiness", v: "91%" },
];
const MOD_METRICS = [
  { k: "Infrastructure as Code", v: "74%" },
  { k: "Container Candidates", v: "104" },
  { k: "Applications Modernized", v: "28" },
  { k: "GitHub Actions Migration", v: "68%" },
  { k: "Technical Debt Reduction", v: "41%" },
];

const TRANSITION = [
  { k: "Knowledge Capture", v: 72 },
  { k: "Runbooks Validated", v: 61 },
  { k: "Access Readiness", v: 64 },
  { k: "Dual Run Gates Passed", v: 82 },
  { k: "Operational Acceptance", v: 76 },
];
const TX_READINESS = [
  { k: "Scalability Score", v: "88" },
  { k: "Cost To Serve", v: "Improving", tone: "text-emerald-600" },
  { k: "Platform Standardization", v: "71%" },
  { k: "Acquisition Readiness", v: "83%" },
  { k: "Risk Profile", v: "Improving", tone: "text-emerald-600" },
  { k: "Board Readiness", v: "86" },
];

const TREND = [
  { m: "Jan '24", r: 1.2, t: 1.0, f: 1.0 },
  { m: "Mar '24", r: 2.1, t: 2.0, f: 2.1 },
  { m: "May '24", r: 3.3, t: 3.2, f: 3.3 },
  { m: "Jul '24", r: 4.5, t: 4.6, f: 4.7 },
  { m: "Sep '24", r: 5.4, t: 6.0, f: 6.1 },
  { m: "Nov '24", r: 6.0, t: 7.4, f: 7.5 },
  { m: "Jan '25", r: 6.9, t: 8.6, f: 8.8 },
  { m: "Mar '25", r: null, t: 9.4, f: 9.7 },
  { m: "May '25", r: null, t: 10.0, f: 10.4 },
  { m: "Jul '25", r: null, t: 10.6, f: 11.2 },
];

const EXEC = [
  { title: "Top Value Opportunity", value: "Containerization Program", sub: "$1.2M Annual Benefit", icon: ShieldCheck, color: "text-emerald-500" },
  { title: "Highest Risk",           value: "Legacy Provider Pro Environment", sub: "Modernization Required", icon: AlertTriangle, color: "text-amber-500" },
  { title: "Fastest ROI",            value: "Cloud Rightsizing", sub: "$340K Annual Savings", icon: TrendingUp, color: "text-blue-500" },
];
const BOARD_NARRATIVE = [
  "Operating model maturity improving",
  "Cost-to-serve declining",
  "Reliability improving",
  "Scalability increasing",
  "Transaction readiness strengthening",
];
const AI_SUPPORTS = [
  "Value Attribution",
  "Cost Analysis",
  "Reliability Trend Analysis",
  "Cyber Risk Correlation",
  "Modernization Prioritization",
  "Investment Recommendations",
  "Board Reporting",
  "Executive Summaries",
];

/* ------- PAGE ------- */
export default function ValueCreationBoard() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [env, setEnv] = useState("Production");
  const [range, setRange] = useState("Last 90 Days");
  const open = (kind: string, title: string, subtitle?: string, data?: any) => setDrawer({ kind, title, subtitle, data });

  return (
    <AppShell>
      <div className="min-h-full bg-slate-50/60">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-6 py-4 flex items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">HHAX Production Resilience Operating System</div>
              <h1 className="text-[22px] font-bold text-slate-900 leading-tight mt-0.5">Value Creation &amp; PE / Board Dashboard</h1>
              <p className="text-sm text-slate-600 mt-0.5">Demonstrate measurable business value through reliability, modernization, automation, cyber resilience, and scalable growth.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select value={env} onValueChange={setEnv}>
                <SelectTrigger className="h-9 w-[140px] bg-white"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><SelectValue /></span></SelectTrigger>
                <SelectContent><SelectItem value="Production">Production</SelectItem><SelectItem value="Pre-Prod">Pre-Prod</SelectItem></SelectContent>
              </Select>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="h-9 w-[160px] bg-white"><span className="inline-flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-slate-500" /><SelectValue /></span></SelectTrigger>
                <SelectContent><SelectItem value="Last 30 Days">Last 30 Days</SelectItem><SelectItem value="Last 90 Days">Last 90 Days</SelectItem><SelectItem value="Last 12 Months">Last 12 Months</SelectItem></SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => open("filters", "Filters")}>
                <Filter className="h-4 w-4" /> Filters
              </Button>
              <button className="h-9 w-9 rounded-md border border-slate-200 grid place-items-center relative hover:bg-slate-50"><Bell className="h-4 w-4 text-slate-600" /><span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" /></button>
              <button className="h-9 w-9 rounded-md border border-slate-200 grid place-items-center hover:bg-slate-50"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-9 space-y-4 min-w-0">
            {/* Transformation progress bar */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 md:col-span-6">
                  <div className="font-semibold text-slate-900 text-[15px]">Operating Model Transformation Progress</div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "68%" }} />
                    </div>
                    <div className="text-[26px] font-bold tabular-nums text-blue-600">68%</div>
                  </div>
                </div>
                <Stat label="Year 1 Target" value="75%" tone="text-emerald-600" />
                <Stat label="Board Confidence" value="High" tone="text-emerald-600" />
                <div className="col-span-6 md:col-span-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Transaction Readiness</div>
                  <div className="flex items-end gap-2">
                    <div className="text-[18px] font-bold text-emerald-600">Improving</div>
                    <div className="flex-1"><Spark data={[40,44,48,52,58,62,66,72,78,84,86]} color="#10b981" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-3">
              {KPIS.map(k => (
                <button key={k.id} onClick={() => open("kpi", k.label, "Board metric", k)}
                  className="text-left rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all">
                  <div className="flex items-start gap-2">
                    <k.icon className={cn("h-4 w-4 mt-0.5 shrink-0", k.color)} />
                    <div className="text-[11.5px] font-bold text-slate-700 leading-tight">{k.label}</div>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {k.rows.map((r, i) => (
                      <div key={i}>
                        {r.k && <div className="text-[10px] text-slate-500">{r.k}</div>}
                        {r.v && <div className={cn("leading-tight", r.tone || "text-slate-900 font-semibold")}>{r.v}</div>}
                      </div>
                    ))}
                    {k.spark && <Spark data={k.spark} color={k.sparkColor} />}
                  </div>
                </button>
              ))}
            </div>

            {/* Enterprise Value Engine + Waterfall */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Value Engine */}
              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 pt-3 pb-2 font-semibold text-slate-900">Enterprise Value Creation Engine</div>
                <div className="p-4 grid grid-cols-3 gap-3 items-stretch relative">
                  {NODES.map((n, i) => {
                    if (i === 4) {
                      return (
                        <div key="center" className="col-span-1 row-span-1 grid place-items-center">
                          <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 p-[3px]">
                            <div className="h-full w-full rounded-full bg-white grid place-items-center text-center px-2">
                              <div>
                                <BarChart3 className="h-5 w-5 mx-auto text-slate-700" />
                                <div className="text-[13px] font-bold text-slate-900 mt-1 leading-tight">Business<br/>Outcomes</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    const node = i < 4 ? NODES[i] : NODES[i - 1];
                    return (
                      <button key={node.id} onClick={() => open("node", node.label, "Value engine driver", node)}
                        className="text-left rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-2">
                          <node.icon className={cn("h-4 w-4", node.tone)} />
                          <div className="text-[12.5px] font-bold text-slate-900">{node.label}</div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5">
                          {node.rows.map((r, j) => (
                            <div key={j} className="contents">
                              <div className="text-[10px] text-slate-500">{r.k}</div>
                              <div className={cn("text-[10.5px] font-semibold text-right tabular-nums", r.v.includes("↗") && "text-emerald-600")}>{r.v}</div>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Waterfall */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                  <div className="font-semibold text-slate-900">Value Creation Waterfall</div>
                  <span className="text-[11px] text-slate-500">(Annualized)</span>
                </div>
                <div className="px-2 pb-2 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={WATERFALL} margin={{ top: 20, right: 12, left: 0, bottom: 28 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} interval={0} angle={0} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${v}M`} />
                      <RTooltip formatter={(v: any) => `$${v}M`} />
                      <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                        {WATERFALL.map((d, i) => (
                          <Cell key={i} fill={d.type === "base" ? "#3b82f6" : d.type === "final" ? "#10b981" : "#86efac"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 5 detailed metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <MetricCard title="Reliability Improvement" icon={ShieldCheck} color="text-blue-500" items={REL_METRICS} negativeKeys={["Sev1 Reduction","Sev2 Reduction"]} onOpen={() => open("metric", "Reliability Improvement")} />
              <MetricCard title="Customer Impact" icon={Users} color="text-violet-500" items={CX_METRICS} positiveKeys={CX_METRICS.map(m => m.k).filter(k => k !== "Customer Escalations" && k !== "State SLA Violations")} negativeKeys={["Customer Escalations"]} onOpen={() => open("metric", "Customer Impact")} />
              <MetricCard title="Operational Efficiency" icon={Activity} color="text-amber-500" items={OPS_METRICS} onOpen={() => open("metric", "Operational Efficiency")} />
              <MetricCard title="Cyber Risk Reduction" icon={ShieldAlert} color="text-rose-500" items={CYBER_METRICS} onOpen={() => open("metric", "Cyber Risk Reduction")} />
              <MetricCard title="Modernization Velocity" icon={Layers} color="text-violet-500" items={MOD_METRICS} onOpen={() => open("metric", "Modernization Velocity")} />
            </div>

            {/* Transition + Readiness + Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                <div className="font-semibold text-slate-900 mb-2 inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-500" /> Transition Confidence</div>
                <div className="space-y-2">
                  {TRANSITION.map(t => (
                    <div key={t.k}>
                      <div className="flex items-center justify-between text-[11.5px]"><span className="text-slate-600">{t.k}</span><span className="tabular-nums font-bold text-slate-900">{t.v}%</span></div>
                      <div className="h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${t.v}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                <div className="font-semibold text-slate-900 mb-2 inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Transaction Readiness</div>
                <div className="space-y-1.5">
                  {TX_READINESS.map(t => (
                    <div key={t.k} className="flex items-center justify-between text-[12px] border-b border-slate-100 last:border-0 pb-1">
                      <span className="text-slate-600">{t.k}</span>
                      <span className={cn("tabular-nums font-bold", t.tone || "text-slate-900")}>{t.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <div className="font-semibold text-slate-900 inline-flex items-center gap-2">Value Realization Trend <span className="text-[11px] text-slate-500 font-normal">(Annualized)</span></div>
                  <div className="flex items-center gap-3 text-[10.5px] text-slate-600">
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Realized Value</span>
                    <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-slate-400" style={{ borderTop: "1px dashed #94a3b8" }} />Target</span>
                    <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-emerald-500" style={{ borderTop: "1px dashed #10b981" }} />Forecast</span>
                  </div>
                </div>
                <div className="h-[200px] px-2 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TREND}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${v}M`} />
                      <RTooltip formatter={(v: any) => v ? `$${v}M` : "—"} />
                      <Line type="monotone" dataKey="r" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} name="Realized" />
                      <Line type="monotone" dataKey="t" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Target" />
                      <Line type="monotone" dataKey="f" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Forecast" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mx-3 mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11.5px]">
                  <div><div className="text-slate-500 text-[10px]">Net Annual Value</div><div className="font-bold text-slate-900">Realized to Date</div></div>
                  <div className="text-right md:text-left"><div className="text-slate-500 text-[10px]">&nbsp;</div><div className="font-bold tabular-nums">$6.9M</div></div>
                  <div><div className="text-slate-500 text-[10px]">Forecast (Next 6 Mo)</div><div className="font-bold tabular-nums">$3.7M</div></div>
                  <div><div className="text-slate-500 text-[10px]">Pipeline (Future)</div><div className="font-bold tabular-nums">$2.7M</div></div>
                  <div className="col-span-2 md:col-span-4 flex items-center justify-between border-t border-slate-200 pt-1.5">
                    <span className="font-semibold text-slate-800">Total Potential</span>
                    <span className="font-bold text-emerald-600 tabular-nums">$13.3M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Executive Panel */}
          <aside className="col-span-12 xl:col-span-3 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-3 pb-2 font-semibold text-slate-900">Executive Insights</div>
              <div className="px-3 pb-3 space-y-2">
                {EXEC.map(e => (
                  <button key={e.title} onClick={() => open("exec", e.title, e.sub, e)}
                    className="w-full text-left rounded-lg border border-slate-200 bg-white hover:shadow-sm hover:border-slate-300 transition-all p-3 flex items-start gap-2">
                    <e.icon className={cn("h-4 w-4 mt-0.5 shrink-0", e.color)} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{e.title}</div>
                      <div className="text-[13px] font-bold text-slate-900 leading-tight mt-0.5">{e.value}</div>
                      <div className={cn("text-[11px] mt-0.5", e.color === "text-amber-500" ? "text-amber-600" : "text-emerald-600", "font-semibold")}>{e.sub}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-3 pb-2 font-semibold text-slate-900 inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-500" /> Board Narrative</div>
              <ul className="px-4 pb-3 space-y-1.5">
                {BOARD_NARRATIVE.map(n => (
                  <li key={n} className="flex items-center gap-2 text-[12px] text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{n}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-3 pb-2 font-semibold text-slate-900 inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-500" /> AI-Assisted Value Realization <HelpCircle className="h-3.5 w-3.5 text-slate-400 ml-auto" /></div>
              <div className="px-4 pb-3">
                <div className="text-[11px] font-semibold text-slate-600 mb-1.5">AI Supports:</div>
                <ul className="space-y-1">
                  {AI_SUPPORTS.map(a => (
                    <li key={a} className="flex items-center gap-2 text-[12px] text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{a}</li>
                  ))}
                </ul>
                <div className="mt-3 text-[10.5px] text-slate-500 border-t border-slate-200 pt-2 underline">
                  Human approval required for all production-changing actions.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">{drawer?.kind?.toUpperCase()}</div>
            <SheetTitle className="text-xl">{drawer?.title}</SheetTitle>
            {drawer?.subtitle && <div className="text-sm text-slate-600">{drawer.subtitle}</div>}
          </SheetHeader>
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="value">Value Attribution</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-3 text-sm text-slate-700">
              Board-grade summary of <b>{drawer?.title}</b>. Includes trend, drivers, investment to date, and projected realization.
            </TabsContent>
            <TabsContent value="value" className="mt-3 text-sm text-slate-700">Linked initiatives, source systems, and attribution methodology. Reviewed by FinOps + Engineering monthly.</TabsContent>
            <TabsContent value="evidence" className="mt-3 text-sm text-slate-700">Latest scans, financial actuals, audit artifacts, customer impact reports.</TabsContent>
            <TabsContent value="actions" className="mt-3 space-y-2">
              <Button className="w-full" onClick={() => { toast.success("Board pack generated"); setDrawer(null); }}>Generate Board Pack</Button>
              <Button variant="outline" className="w-full" onClick={() => toast("Routed to CTO")}>Route to CTO</Button>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="col-span-6 md:col-span-2">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={cn("text-[20px] font-bold", tone || "text-slate-900")}>{value}</div>
    </div>
  );
}

function MetricCard({ title, icon: Icon, color, items, positiveKeys, negativeKeys, onOpen }:
  { title: string; icon: any; color: string; items: { k: string; v: string; sub?: string }[]; positiveKeys?: string[]; negativeKeys?: string[]; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="text-left rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-1.5"><Icon className={cn("h-4 w-4", color)} /><div className="text-[12.5px] font-bold text-slate-900">{title}</div></div>
        <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
      </div>
      <div className="space-y-2">
        {items.map(it => {
          const isNeg = negativeKeys?.includes(it.k);
          const isPos = !isNeg && (it.v.startsWith("-") ? true : it.v.endsWith("%") || it.v.match(/^\d/));
          const tone = isNeg ? "text-rose-600" : it.v.startsWith("-") ? "text-emerald-600" : "text-emerald-600";
          // simple progress bar width inference from %
          const pctMatch = it.v.match(/(\d+(?:\.\d+)?)%/);
          const width = pctMatch ? Math.min(100, parseFloat(pctMatch[1])) : 70;
          return (
            <div key={it.k}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 truncate pr-2">{it.k}</span>
                <span className={cn("tabular-nums font-bold", tone)}>{it.v}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden">
                <div className={cn("h-full", isNeg ? "bg-rose-400" : "bg-emerald-500")} style={{ width: `${width}%` }} />
              </div>
              {it.sub && <div className="text-[10px] text-slate-500 mt-0.5">{it.sub}</div>}
            </div>
          );
        })}
      </div>
    </button>
  );
}
