import { useState, useMemo } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { toast } from "sonner";
import sarahAsset from "@/assets/sarah-mitchell.png.asset.json";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Download, MoreVertical, GitCompare, MapPin, Award, Users, Activity, TrendingUp,
  TrendingDown, ArrowRight, ArrowLeft, ShieldCheck, ShieldAlert, Cloud, Server, Database, Sparkles,
  CheckCircle2, AlertTriangle, Brain, FileBarChart2, Briefcase, Target, Wrench, Zap,
  DollarSign, LineChart as LineIcon, ClipboardCheck, Crown, Building2,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";

/* ---------- Data ---------- */
type Trend = "up" | "down" | "flat";
type RAGStatus = "green" | "amber" | "red";

const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];
const series = (start: number, end: number, jitter = 1.5) =>
  months.map((m, i) => ({ m, v: +(start + (end - start) * (i / 11) + Math.sin(i * 1.4) * jitter).toFixed(2) }));

const responsibilities = [
  { area: "Production Operations",  kpi: "Availability",                 target: "99.95%",  baseline: "99.40%", actual: "99.97%", trend: "up",   status: "green",
    drill: ["Uptime %","P1 Count","P2 Count","MTTR","MTTD","Error Budget Consumption","Change Success Rate","Deployment Success Rate","Service Health Score","Dependency Health Score"] },
  { area: "SRE Program",            kpi: "SRE Maturity Level",           target: "Level 4", baseline: "Level 2.6", actual: "Level 3.6", trend: "up",   status: "green",
    drill: ["Service Ownership","SLI Coverage","SLO Coverage","Error Budgets","Automation Adoption","Observability Coverage","Runbook Coverage","Incident Reduction","Preventative Actions","Reliability Maturity"] },
  { area: "Service Governance",     kpi: "Governance Compliance",        target: "98%",     baseline: "82%",     actual: "96%",     trend: "up",   status: "green",
    drill: ["SLA Attainment","OLA Attainment","Vendor Performance","Audit Findings","Executive Escalations","Governance Actions","Risk Register","Compliance Exceptions"] },
  { area: "Major Incident Management", kpi: "MTTR (P1 Incidents)",       target: "< 30 min",baseline: "62 min",  actual: "18 min",  trend: "up",   status: "green",
    drill: ["Incident Volume","Incident Severity","Root Cause Categories","Recovery Times","Escalation Times","Bridge Participation","Repeat Incidents","Postmortem Completion"] },
  { area: "Customer Escalations",   kpi: "Escalation Closure (Within SLA)", target: "95%", baseline: "76%",  actual: "95%",  trend: "up",   status: "green",
    drill: ["Executive Escalations","Customer Complaints","CSAT","NPS","Open Issues","Response Times","Resolution Times","At-Risk Accounts"] },
  { area: "Operational Readiness",  kpi: "Change Success Rate",          target: "98%",     baseline: "92%",     actual: "98.8%",   trend: "up",   status: "green",
    drill: ["Patch Compliance","Backup Success","DR Readiness","Runbook Completion","Monitoring Coverage","Automation Coverage","Capacity Readiness","Platform Readiness"] },
  { area: "Capacity Planning",      kpi: "Capacity Accuracy",            target: "90%",     baseline: "71%",     actual: "89%",     trend: "flat", status: "amber",
    drill: ["CPU Utilization","Memory Utilization","Storage Consumption","Growth Forecast","Cloud Spend","Reservation Coverage","Resource Efficiency","Scaling Events"] },
  { area: "Vendor Governance",      kpi: "Vendor Performance Score",     target: "95%",     baseline: "83%",     actual: "94%",     trend: "up",   status: "green",
    drill: ["Vendor Scorecards","SLA Compliance","Contract Utilization","Cost Efficiency","Renewal Risk","Escalations","Service Credits","Vendor Risks"] },
  { area: "SLA Management",         kpi: "SLA Attainment",               target: "99%",     baseline: "93.1%",   actual: "99.3%",   trend: "up",   status: "green",
    drill: ["Availability","MTTR","Response Times","Resolution Times","Change Success","Incident Volume","Escalations","Penalty Exposure"] },
  { area: "QBR Leadership",         kpi: "QBR Completion Rate",          target: "100%",    baseline: "75%",     actual: "100%",    trend: "up",   status: "green",
    drill: ["Strategic Objectives","Completed Outcomes","Business Value Delivered","Cost Savings","Transformation Progress","Customer Satisfaction","Executive Commitments"] },
  { area: "Reliability Engineering",kpi: "Reliability Improvement (YoY)",target: "20%",     baseline: "8%",      actual: "24%",     trend: "up",   status: "green",
    drill: ["Error Budgets","SLOs","SLIs","Reliability Score","Dependency Health","Observability Coverage","Incident Prevention","Automation Impact"] },
  { area: "Platform Engineering",   kpi: "Platform Adoption Rate",       target: "85%",     baseline: "54%",     actual: "83%",     trend: "flat", status: "amber",
    drill: ["Infrastructure as Code","Golden Images","Cloud Standards","Platform Adoption","Developer Enablement","Shared Services","Release Velocity","Developer Experience"] },
  { area: "Modernization Oversight",kpi: "Modernization Progress",       target: "80%",     baseline: "38%",     actual: "72%",     trend: "up",   status: "green",
    drill: ["Apps Modernized","Apps Remaining","Containerization","Cloud Migration","Technical Debt","Legacy Retirement","Transformation Velocity","Business Value"] },
  { area: "AI Operations Adoption", kpi: "Automation Coverage",          target: "80%",     baseline: "32%",     actual: "62%",     trend: "up",   status: "amber",
    drill: ["Automation Coverage","Agent Utilization","Runbooks Automated","Tickets Eliminated","Hours Saved","Cost Reduction","Prediction Accuracy","Remediation Success"] },
] as const;

const competencies = [
  { name: "Leadership",              score: 95 },
  { name: "Service Management",      score: 98 },
  { name: "Reliability Engineering", score: 92 },
  { name: "Cloud Operations",        score: 89 },
  { name: "Platform Engineering",    score: 87 },
  { name: "FinOps",                  score: 84 },
  { name: "Cybersecurity",           score: 83 },
  { name: "Vendor Management",       score: 96 },
  { name: "Executive Communication", score: 98 },
  { name: "AI-Enabled Operations",   score: 91 },
];

const businessOutcomes = [
  { name: "Production Availability", value: "99.97%", target: "Target 99.95%", icon: ShieldCheck, color: "emerald" },
  { name: "Customer Satisfaction",   value: "4.8 / 5", target: "Target 4.5+", icon: Award, color: "violet" },
  { name: "Cloud Cost Optimization", value: "10%",    target: "Annual Reduction", icon: DollarSign, color: "blue" },
  { name: "Change Success Rate",     value: "98.8%",  target: "Target 98%+", icon: CheckCircle2, color: "emerald" },
  { name: "Major Incident Reduction",value: "25%",    target: "YoY Improvement", icon: TrendingDown, color: "rose" },
  { name: "Exec Escalation Closure", value: "95%",    target: "Within SLA", icon: Crown, color: "amber" },
];

const actionQueue = [
  { priority: "High",   initiative: "Container Platform Modernization", desc: "Migrate priority apps to Kubernetes platform", due: "Sep 30, 2026", status: "On Track", progress: 68, impact: "High" },
  { priority: "High",   initiative: "Major Incident Process Transformation", desc: "Implement proactive detection & response", due: "Aug 15, 2026", status: "On Track", progress: 73, impact: "High" },
  { priority: "High",   initiative: "Agentic Operations Rollout", desc: "Deploy AI agents for incident triage & remediation", due: "Oct 15, 2026", status: "At Risk", progress: 45, impact: "High" },
  { priority: "Medium", initiative: "Cloud Cost Optimization Program", desc: "Rightsize, reservations, and savings plans", due: "Dec 31, 2026", status: "On Track", progress: 60, impact: "Medium" },
  { priority: "Medium", initiative: "Acquisition Onboarding Factory", desc: "Standardize onboarding for acquired platforms", due: "Ongoing", status: "On Track", progress: 80, impact: "High" },
];

const reviews = [
  { name: "QBR – Executive Review",       date: "May 22, 2026" },
  { name: "Ops Steering Committee",       date: "May 16, 2026" },
  { name: "Board Technology Update",      date: "Jun 5, 2026" },
  { name: "Vendor Performance Review",    date: "Jun 12, 2026" },
  { name: "SLA Governance Review",        date: "May 30, 2026" },
];

const aiInsights = [
  "Accelerate container adoption",
  "Expand automation coverage",
  "Reduce technical debt and legacy dependency",
  "Increase platform ownership model adoption",
];

/* ---------- Helpers ---------- */
const statusToken: Record<RAGStatus, string> = {
  green: "text-emerald-600",
  amber: "text-amber-600",
  red:   "text-rose-600",
};
const ragChip = (s: RAGStatus) =>
  s === "green" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
  : s === "amber" ? "bg-amber-50 text-amber-700 border-amber-100"
  : "bg-rose-50 text-rose-700 border-rose-100";

function TrendIcon({ t }: { t: Trend | string }) {
  if (t === "up")   return <TrendingUp   className="h-3.5 w-3.5 text-emerald-600" />;
  if (t === "down") return <TrendingDown className="h-3.5 w-3.5 text-rose-600" />;
  return <ArrowRight className="h-3.5 w-3.5 text-amber-600" />;
}

/* ---------- Right Intelligence Panel ---------- */
type PanelCtx = {
  title: string;
  category: string;
  target?: string;
  baseline?: string;
  actual?: string;
  trend?: string;
  status?: RAGStatus;
  drill?: readonly string[] | string[];
};

function IntelligencePanel({ ctx, onClose }: { ctx: PanelCtx | null; onClose: () => void }) {
  const dataTrend = useMemo(() => series(72, 94, 2.2), [ctx?.title]);
  const dataForecast = useMemo(() => series(94, 98, 1), [ctx?.title]);
  const drill = ctx?.drill ?? ["Uptime %","P1 Count","P2 Count","MTTR","MTTD","Error Budget","Change Success","Deployment Success","Service Health","Dependency Health"];

  return (
    <Sheet open={!!ctx} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[35vw] min-w-[480px] max-w-[720px] overflow-y-auto bg-white/85 backdrop-blur-xl border-l border-slate-200 p-0"
      >
        {ctx && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/60">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">{ctx.category}</Badge>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${ragChip(ctx.status ?? "green")}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${ctx.status === "amber" ? "bg-amber-500" : ctx.status === "red" ? "bg-rose-500" : "bg-emerald-500"}`} />
                  {ctx.status === "amber" ? "Watch" : ctx.status === "red" ? "At Risk" : "Healthy"}
                </span>
              </div>
              <SheetHeader className="mt-2 text-left">
                <SheetTitle className="text-xl font-bold text-slate-900">{ctx.title}</SheetTitle>
                <SheetDescription className="text-xs text-slate-500">
                  Executive Owner: <b className="text-slate-700">Sarah Mitchell</b> • Business Owner: <b className="text-slate-700">VP Technology Operations</b> • Technical Owner: <b className="text-slate-700">Platform Engineering Lead</b>
                </SheetDescription>
              </SheetHeader>

              {/* KPI Hierarchy strip */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { l: "Target",     v: ctx.target ?? "—" },
                  { l: "Baseline",   v: ctx.baseline ?? "—" },
                  { l: "Actual",     v: ctx.actual ?? "—", c: "text-emerald-700" },
                  { l: "Forecast",   v: "97.4%", c: "text-blue-700" },
                ].map((m) => (
                  <div key={m.l} className="rounded-lg border border-slate-200 bg-white p-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">{m.l}</div>
                    <div className={`text-sm font-bold mt-0.5 ${m.c ?? "text-slate-900"}`}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { l: "Variance",        v: "+0.5 pts", c: "text-emerald-700" },
                  { l: "Risk Score",      v: "Low",      c: "text-emerald-700" },
                  { l: "Confidence",      v: "92%",      c: "text-slate-900" },
                ].map((m) => (
                  <div key={m.l} className="rounded-lg border border-slate-200 bg-white p-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">{m.l}</div>
                    <div className={`text-sm font-bold mt-0.5 ${m.c ?? "text-slate-900"}`}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <Tabs defaultValue="kpis" className="flex-1">
              <TabsList className="mx-5 mt-3 grid grid-cols-6 h-8 text-[11px]">
                <TabsTrigger value="kpis">KPIs</TabsTrigger>
                <TabsTrigger value="slas">SLAs</TabsTrigger>
                <TabsTrigger value="svcs">Services</TabsTrigger>
                <TabsTrigger value="ops">Op Health</TabsTrigger>
                <TabsTrigger value="trend">Trend</TabsTrigger>
                <TabsTrigger value="ai">AI Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="kpis" className="px-5 py-3 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Supporting KPIs</div>
                {drill.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => toast.success(`Drill: ${d}`)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 transition"
                  >
                    <span className="text-xs text-slate-700">{d}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">{(85 + (i * 2.3) % 14).toFixed(1)}%</span>
                      <TrendIcon t={i % 4 === 0 ? "down" : i % 5 === 0 ? "flat" : "up"} />
                    </span>
                  </button>
                ))}
              </TabsContent>

              <TabsContent value="slas" className="px-5 py-3 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Supporting SLAs</div>
                {[
                  { n: "Production Availability SLA", t: "99.95%", a: "99.97%", br: 0, pen: "$0" },
                  { n: "P1 MTTR SLA",                 t: "< 30m",  a: "18m",    br: 1, pen: "$12K" },
                  { n: "Customer Response SLA",       t: "< 15m",  a: "9m",     br: 0, pen: "$0" },
                  { n: "Change Success SLA",          t: "98%",    a: "98.8%",  br: 0, pen: "$0" },
                ].map((s) => (
                  <div key={s.n} className="px-3 py-2 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-800">{s.n}</div>
                      <Badge variant="outline" className="text-[10px]">{s.a} / {s.t}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-1.5 text-[11px] text-slate-600">
                      <div>Breach: <b className={s.br > 0 ? "text-amber-700" : "text-emerald-700"}>{s.br}</b></div>
                      <div>Penalty: <b>{s.pen}</b></div>
                      <div>Cust Impact: <b className="text-emerald-700">Low</b></div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="svcs" className="px-5 py-3 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Supporting Services</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { n: "EVV Mobile API",  k: "Application", i: Server,   c: "text-blue-600" },
                    { n: "Claims Engine",    k: "Application", i: Server,   c: "text-blue-600" },
                    { n: "AWS US-East",      k: "Cloud",       i: Cloud,    c: "text-sky-600" },
                    { n: "SQL Cluster Prod", k: "Database",    i: Database, c: "text-violet-600" },
                    { n: "API Gateway",      k: "Network",     i: Activity, c: "text-emerald-600" },
                    { n: "Workforce Platform", k: "Vendor",    i: Briefcase, c: "text-amber-600" },
                  ].map(({ n, k, i: I, c }) => (
                    <button key={n} onClick={() => toast.success(`Open ${n}`)} className="text-left px-2.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2">
                      <I className={`h-4 w-4 ${c}`} />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{n}</div>
                        <div className="text-[10px] text-slate-500">{k}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ops" className="px-5 py-3 grid grid-cols-2 gap-2">
                {[
                  { l: "Health Score",         v: 94, c: "bg-emerald-500" },
                  { l: "Risk Score",           v: 22, c: "bg-amber-500"   },
                  { l: "Technical Debt",       v: 38, c: "bg-rose-500"    },
                  { l: "Automation Score",     v: 62, c: "bg-blue-500"    },
                  { l: "Modernization Score",  v: 72, c: "bg-violet-500"  },
                  { l: "Security Score",       v: 88, c: "bg-emerald-500" },
                  { l: "Compliance Score",     v: 96, c: "bg-emerald-500" },
                ].map((m) => (
                  <div key={m.l} className="px-3 py-2 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-700">{m.l}</div>
                      <div className="text-xs font-bold text-slate-900">{m.v}</div>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${m.c}`} style={{ width: `${m.v}%` }} />
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="trend" className="px-5 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Trend Analytics</div>
                  <Select defaultValue="90">
                    <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Day</SelectItem>
                      <SelectItem value="90">90 Day</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-40 rounded-lg border border-slate-200 bg-white p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataTrend}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="m" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} width={28} />
                      <Tooltip />
                      <Area dataKey="v" stroke="#3b82f6" fill="url(#g1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: "Anomalies (30d)", v: "2",     c: "text-amber-700" },
                    { l: "Seasonality",     v: "Weekly",c: "text-slate-900" },
                    { l: "Forecast Conf.",  v: "92%",   c: "text-emerald-700" },
                  ].map((m) => (
                    <div key={m.l} className="rounded-lg border border-slate-200 bg-white p-2">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">{m.l}</div>
                      <div className={`text-sm font-bold mt-0.5 ${m.c}`}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div className="h-32 rounded-lg border border-slate-200 bg-white p-2">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Forecast</div>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={dataForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="m" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} width={28} />
                      <Line dataKey="v" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="px-5 py-3 space-y-3 text-xs text-slate-700">
                <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-violet-700 uppercase">
                    <Brain className="h-3.5 w-3.5" /> AI Executive Analysis
                  </div>
                  <div className="mt-2 space-y-2">
                    <p><b className="text-slate-900">Current state.</b> {ctx.title} is operating ahead of plan with strong automation contribution. Variance to target is positive across the last 90 days.</p>
                    <p><b className="text-slate-900">Observed trends.</b> Sustained reduction in P1 volume and MTTR improvements are reinforcing platform availability gains.</p>
                    <p><b className="text-slate-900">Emerging risks.</b> Legacy database tier dependency and partial observability coverage in two acquired platforms remain primary residual risks.</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Recommendations</div>
                  <ul className="space-y-1.5">
                    {["Accelerate container migration for top-3 revenue services","Expand SLO coverage to acquired platforms","Automate top-10 manual runbooks","Tighten change-success gates on legacy tier"].map((r) => (
                      <li key={r} className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Predicted Outcomes</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: "Availability Lift", v: "+0.04%" },
                      { l: "Cost Saved",        v: "$1.2M" },
                      { l: "P1 Reduction",      v: "-22%" },
                    ].map((p) => (
                      <div key={p.l} className="rounded-md border border-slate-200 p-2">
                        <div className="text-[10px] text-slate-500 uppercase">{p.l}</div>
                        <div className="text-sm font-bold text-slate-900">{p.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => toast.success("Action plan created")} className="text-xs"><ClipboardCheck className="h-3 w-3 mr-1.5" />Create action plan</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Briefing exported")} className="text-xs"><Download className="h-3 w-3 mr-1.5" />Export briefing</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ---------- Reusable clickable wrapper with hover preview ---------- */
function Clickable({
  preview,
  onClick,
  children,
  className = "",
}: {
  preview: { title: string; sub?: string; metric?: string };
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <HoverCard openDelay={250}>
      <HoverCardTrigger asChild>
        <button onClick={onClick} className={`text-left w-full ${className}`}>
          {children}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="left" className="w-64 text-xs">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">Quick Preview</div>
        <div className="text-sm font-bold text-slate-900 mt-0.5">{preview.title}</div>
        {preview.metric && <div className="text-base font-bold text-blue-700 mt-1">{preview.metric}</div>}
        {preview.sub && <div className="text-slate-600 mt-1">{preview.sub}</div>}
        <div className="mt-2 text-[10px] text-slate-500">Click to open intelligence panel →</div>
      </HoverCardContent>
    </HoverCard>
  );
}

/* ====================================================================== */
export default function ExecutiveServiceOwnerTwin() {
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<PanelCtx | null>(null);
  const open = (c: PanelCtx) => setCtx(c);

  return (
    <AppShell>
      <main className="flex-1 bg-slate-50/60 min-h-screen">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-start justify-between gap-6">
          <div className="flex items-start gap-3">
            <Button variant="outline" size="sm" className="h-9 text-xs mt-1" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Executive Service Owner Digital Twin</h1>
              <div className="text-sm text-slate-500 mt-1">
                Service Delivery Director <span className="mx-2 text-slate-300">•</span> Production Reliability &amp; Modernization Leader
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select defaultValue="30">
              <SelectTrigger className="h-9 w-[140px] text-xs"><Calendar className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last 1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9 text-xs"><GitCompare className="h-3.5 w-3.5 mr-1.5" />Compare</Button>
            <Button variant="outline" size="sm" className="h-9 text-xs"><Download className="h-3.5 w-3.5 mr-1.5" />Export</Button>
            <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 p-4">
          {/* LEFT — Profile */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="relative">
                <img src={sarahAsset.url} alt="Sarah Mitchell" className="w-full aspect-square object-cover rounded-lg" />
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                </span>
              </div>
              <div className="mt-3">
                <Clickable
                  preview={{ title: "Sarah Mitchell", sub: "Service Delivery Director — Executive Service Owner", metric: "15 yrs experience" }}
                  onClick={() => open({ title: "Sarah Mitchell — Executive Profile", category: "Executive", status: "green", drill: ["Direct Reports","Teams Supported","Applications Supported","Infrastructure Assets","Cloud Spend Governed","Executive Commitments","Top Initiatives","QBR Cadence"] })}
                >
                  <div className="text-xl font-bold text-slate-900">Sarah Mitchell</div>
                  <div className="text-sm text-violet-600 font-semibold">Service Delivery Director</div>
                  <div className="text-xs text-slate-600">Executive Service Owner</div>
                  <div className="text-xs text-slate-500 mt-1">Healthcare Technology Operations</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />Chicago, Illinois</div>
                </Clickable>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["AWS Certified","Google SRE Trained","ITIL 4 Expert","SAFe Agilist","FinOps Certified"].map((b) => (
                  <Badge key={b} variant="outline" className="text-[10px] bg-slate-50">{b}</Badge>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { l: "Reports To",            v: "VP Technology Operations", icon: Building2 },
                  { l: "Direct Reports",        v: "7",     icon: Users, k: "Direct Reports" },
                  { l: "Teams Supported",       v: "22",    icon: Users, k: "Teams Supported" },
                  { l: "Applications Supported",v: "37",    icon: Server, k: "Applications Supported" },
                  { l: "Infrastructure Assets", v: "1,842", icon: Database, k: "Infrastructure Assets" },
                  { l: "Cloud Spend Governed",  v: "$18.4M",icon: Cloud, k: "Cloud Spend Governed" },
                  { l: "Years of Experience",   v: "15 Years", icon: Award },
                ].map((m) => {
                  const I = m.icon;
                  return (
                    <button
                      key={m.l}
                      onClick={() => m.k && open({ title: m.l, category: "Profile Metric", actual: m.v, status: "green" })}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 text-left"
                    >
                      <span className="flex items-center gap-2 text-xs text-slate-600"><I className="h-3.5 w-3.5 text-slate-500" />{m.l}</span>
                      <span className="text-sm font-semibold text-slate-900">{m.v}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            {/* 1. Accountable For */}
            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-bold text-slate-900">1. ACCOUNTABLE FOR</div>
                <span className="text-xs text-slate-500">(Roles &amp; Responsibilities with KPIs)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Responsibility Area</th>
                      <th className="text-left px-3 py-2 font-semibold">KPI / Metric</th>
                      <th className="text-right px-3 py-2 font-semibold">Target</th>
                      <th className="text-right px-3 py-2 font-semibold">Baseline (Q1)</th>
                      <th className="text-right px-3 py-2 font-semibold">Actual (30d)</th>
                      <th className="text-center px-3 py-2 font-semibold">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responsibilities.map((r) => (
                      <tr
                        key={r.area}
                        onClick={() => open({
                          title: r.area, category: "Responsibility Area", target: r.target,
                          baseline: r.baseline, actual: r.actual, trend: r.trend, status: r.status as RAGStatus, drill: r.drill,
                        })}
                        className="border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer"
                      >
                        <td className="px-3 py-2 font-medium text-slate-800">{r.area}</td>
                        <td className="px-3 py-2 text-slate-600">{r.kpi}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{r.target}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{r.baseline}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${statusToken[r.status as RAGStatus]}`}>{r.actual}</td>
                        <td className="px-3 py-2 text-center"><span className="inline-flex"><TrendIcon t={r.trend} /></span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-700 uppercase mr-1">Decision Authority</span>
                {["Approve Major Changes","Approve Production Releases","Approve Emergency Changes","Vendor Escalations","Service Credits","Risk Acceptance"].map((d) => (
                  <button key={d} onClick={() => open({ title: d, category: "Decision Authority", actual: "Active", status: "green" })}
                    className="text-[11px] px-2 py-1 rounded-full border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700">
                    {d}
                  </button>
                ))}
              </div>
            </section>

            {/* 4. KPI / SLA Command Center */}
            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <LineIcon className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-bold text-slate-900">4. KPI / SLA COMMAND CENTER</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {[
                  { head: "Reliability", icon: ShieldCheck, color: "text-emerald-600", rows: [
                    { m: "Availability",   t: "99.95%", b: "99.40%", a: "99.97%", tr: "up" },
                    { m: "MTTR (P1)",      t: "<30 min",b: "62 min", a: "18 min", tr: "up" },
                    { m: "MTTD",           t: "<5 min", b: "12 min", a: "3 min",  tr: "up" },
                    { m: "Incident Volume",t: "-25%",   b: "—",      a: "-31%",   tr: "up" },
                    { m: "P1 Incidents",   t: "<5",     b: "9",      a: "2",      tr: "up" },
                    { m: "Problem Backlog",t: "<10",    b: "31",     a: "12",     tr: "up" },
                  ]},
                  { head: "Service Mgmt", icon: Activity, color: "text-blue-600", rows: [
                    { m: "SLA Attainment", t: "99%",  b: "93.1%", a: "99.3%", tr: "up" },
                    { m: "Change Success", t: "98%",  b: "92%",   a: "98.8%", tr: "up" },
                    { m: "Backlog Age",    t: "<7d",  b: "19d",   a: "7d",    tr: "up" },
                    { m: "Customer Esc.",  t: "<5",   b: "12",    a: "3",     tr: "up" },
                    { m: "CSAT (IT Ops)",  t: ">4.5", b: "4.1",   a: "4.7",   tr: "up" },
                    { m: "First Contact",  t: ">80%", b: "62%",   a: "86%",   tr: "up" },
                  ]},
                  { head: "Modernization", icon: Wrench, color: "text-violet-600", rows: [
                    { m: "Apps Containerized",  t: "60%", b: "18%", a: "46%", tr: "up" },
                    { m: "Infrastructure aaC",  t: "70%", b: "28%", a: "63%", tr: "up" },
                    { m: "Cloud Migration",     t: "80%", b: "41%", a: "71%", tr: "up" },
                    { m: "Automation Adoption", t: "85%", b: "39%", a: "82%", tr: "up" },
                    { m: "Technical Debt Idx",  t: ">12%",b: "-8%", a: "+18%",tr: "up" },
                    { m: "Legacy Decommission", t: "30",  b: "11",  a: "23",  tr: "up" },
                  ]},
                  { head: "Financial", icon: DollarSign, color: "text-amber-600", rows: [
                    { m: "Cloud Spend (MTD)", t: "$20.6M", b: "—",     a: "$18.4M", tr: "up" },
                    { m: "Savings YTD",       t: "$0.9M",  b: "—",     a: "$2.3M",  tr: "up" },
                    { m: "Unit Cost / App",   t: "—",      b: "Base",  a: "-14%",   tr: "up" },
                    { m: "Budget Variance",   t: "< 5%",   b: "+9%",   a: "-7%",    tr: "up" },
                    { m: "Forecast Accuracy", t: ">90%",   b: "78%",   a: "91%",    tr: "up" },
                    { m: "ROI on Ops Init.",  t: ">3x",    b: "1.6x",  a: "3.2x",   tr: "up" },
                  ]},
                ].map((col) => {
                  const I = col.icon;
                  return (
                    <div key={col.head} className="p-3">
                      <div className={`flex items-center gap-1.5 text-xs font-bold uppercase ${col.color}`}><I className="h-3.5 w-3.5" />{col.head}</div>
                      <div className="mt-2 space-y-1">
                        {col.rows.map((r) => (
                          <button key={r.m}
                            onClick={() => open({ title: r.m, category: col.head, target: r.t, baseline: r.b, actual: r.a, trend: r.tr, status: "green" })}
                            className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-slate-50 text-left">
                            <span className="text-[11px] text-slate-700 truncate">{r.m}</span>
                            <span className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-emerald-700">{r.a}</span>
                              <TrendIcon t={r.tr} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 5. Executive Action Queue */}
            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-600" />
                <div className="text-sm font-bold text-slate-900">5. EXECUTIVE ACTION QUEUE</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Priority</th>
                      <th className="text-left px-3 py-2 font-semibold">Initiative</th>
                      <th className="text-left px-3 py-2 font-semibold">Description</th>
                      <th className="text-left px-3 py-2 font-semibold">Due Date</th>
                      <th className="text-left px-3 py-2 font-semibold">Status</th>
                      <th className="text-left px-3 py-2 font-semibold w-40">Progress</th>
                      <th className="text-left px-3 py-2 font-semibold">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionQueue.map((a) => (
                      <tr key={a.initiative}
                        onClick={() => open({ title: a.initiative, category: "Executive Initiative", actual: `${a.progress}%`, target: "100%", baseline: "0%", trend: "up",
                          status: a.status === "At Risk" ? "amber" : "green",
                          drill: ["Milestones","Workstreams","Dependencies","Risks","Investments","Business Value","Adoption","KPI Impact"] })}
                        className="border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer">
                        <td className="px-3 py-2"><Badge className={a.priority === "High" ? "bg-rose-100 text-rose-700 hover:bg-rose-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>{a.priority}</Badge></td>
                        <td className="px-3 py-2 font-medium text-slate-800">{a.initiative}</td>
                        <td className="px-3 py-2 text-slate-600">{a.desc}</td>
                        <td className="px-3 py-2 text-slate-600">{a.due}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[11px] font-semibold ${a.status === "At Risk" ? "text-amber-700" : "text-emerald-700"}`}>{a.status}</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Progress value={a.progress} className="h-1.5 flex-1" />
                            <span className="text-[11px] text-slate-600 w-8 text-right">{a.progress}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2"><span className={`text-[11px] font-semibold ${a.impact === "High" ? "text-rose-700" : "text-amber-700"}`}>{a.impact}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* 2. Core Competencies */}
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-violet-600" />
                <div className="text-sm font-bold text-slate-900">2. CORE COMPETENCIES</div>
              </div>
              <div className="space-y-2">
                {competencies.map((c) => (
                  <button key={c.name}
                    onClick={() => open({ title: c.name, category: "Competency", actual: `${c.score}%`, target: "95%+", status: c.score >= 90 ? "green" : "amber",
                      drill: ["Recent Assessments","Peer Benchmarks","Training Hours","Certifications","Project Outcomes","360 Feedback","Mentorship","Improvement Plan"] })}
                    className="w-full flex items-center gap-2 text-left">
                    <span className="text-[11px] text-slate-700 w-36 truncate flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-violet-500" />{c.name}</span>
                    <Progress value={c.score} className="h-1.5 flex-1 [&>div]:bg-violet-500" />
                    <span className="text-[11px] font-semibold text-slate-900 w-9 text-right">{c.score}%</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Business Outcomes */}
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-emerald-600" />
                <div className="text-sm font-bold text-slate-900">3. BUSINESS OUTCOMES OWNED</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {businessOutcomes.map((b) => {
                  const I = b.icon;
                  return (
                    <button key={b.name}
                      onClick={() => open({ title: b.name, category: "Business Outcome", actual: b.value, target: b.target, status: "green",
                        drill: ["Quarterly Trend","Top Contributors","Underlying KPIs","At-Risk Segments","Investment to Date","Predicted FY","Customer Impact","Exec Commitments"] })}
                      className="text-left rounded-lg border border-slate-200 p-2.5 hover:border-blue-300 hover:bg-blue-50/40 transition">
                      <I className={`h-3.5 w-3.5 text-${b.color}-600`} />
                      <div className="text-[10px] text-slate-500 mt-1 leading-tight">{b.name}</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">{b.value}</div>
                      <div className="text-[10px] text-slate-500">{b.target}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* AI Executive Advisor */}
            <section className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/70 to-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <div className="text-sm font-bold text-slate-900">AI EXECUTIVE ADVISOR</div>
              </div>
              <div className="text-[11px] font-semibold text-slate-700 mb-1">Executive Summary</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Production reliability exceeds target and shows consistent improvement. Modernization is ahead of plan with strong automation adoption. Cost optimization is delivering material savings. Primary risks remain legacy platforms and manual incident processes.
              </p>
              <div className="mt-3 space-y-1.5">
                {aiInsights.map((i, idx) => (
                  <button key={i} onClick={() => open({ title: i, category: "AI Recommendation", actual: "Pending", target: "Adopt", status: "amber",
                    drill: ["Impact","Effort","Owner","Dependencies","Timeline","Investment","Risk","Expected Outcome"] })}
                    className="w-full flex items-start gap-2 text-left text-[11px] text-slate-700 hover:bg-white/60 p-1.5 rounded">
                    <span className="h-4 w-4 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold grid place-items-center shrink-0">{idx + 1}</span>
                    {i}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Confidence Score</span>
                <span className="font-bold text-emerald-700">92%</span>
              </div>
              <Progress value={92} className="h-1.5 mt-1 [&>div]:bg-emerald-500" />
              <div className="text-[10px] text-slate-500 mt-2">Insights generated: May 14, 2026 • 8:45 AM</div>
            </section>

            {/* Next Reviews */}
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-bold text-slate-900">6. NEXT EXECUTIVE REVIEWS</div>
              </div>
              <div className="space-y-1">
                {reviews.map((r) => (
                  <button key={r.name} onClick={() => open({ title: r.name, category: "Executive Review", actual: r.date, status: "green",
                    drill: ["Agenda","Attendees","KPIs in Scope","Decisions Pending","Briefing Deck","Action Items","Pre-reads","Risks"] })}
                    className="w-full flex items-center justify-between text-xs px-2 py-2 rounded hover:bg-slate-50 text-left">
                    <span className="text-slate-800">{r.name}</span>
                    <span className="text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" />{r.date}</span>
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-blue-700">View Full Calendar →</Button>
            </section>
          </div>
        </div>

        <IntelligencePanel ctx={ctx} onClose={() => setCtx(null)} />
      </main>
    </AppShell>
  );
}
