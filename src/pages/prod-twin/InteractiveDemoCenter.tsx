import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Play, Filter, Bell, HelpCircle, ChevronRight, LayoutGrid, List as ListIcon,
  Activity, Bot, Brain, ShieldCheck, Workflow, TrendingUp, Heart, Users,
  AlertTriangle, ShieldX, GitBranch, DollarSign, Rocket, Database, Sparkles,
  CheckCircle2, Clock, ArrowRight, PauseCircle, RefreshCw, Pin, BarChart3,
  TrendingDown, AlertOctagon, Zap, Target, FileText, ShieldAlert,
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
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

type Drawer = { kind: string; title: string; subtitle?: string; data?: any } | null;

/* ---------- Top KPIs ---------- */
const KPIS = [
  { id: "scen",  label: "Demo Scenarios Available", icon: Workflow,    color: "text-blue-600",    value: "7",    sub: "Total" },
  { id: "cow",   label: "Digital Coworkers",        icon: Bot,         color: "text-violet-600",  value: "12",   sub: "Active" },
  { id: "ai",    label: "AI Actions Simulated",     icon: Brain,       color: "text-emerald-600", value: "147",  sub: "This Month" },
  { id: "appr",  label: "Human Approvals Required", icon: Users,       color: "text-amber-600",   value: "23",   sub: "This Month" },
  { id: "wf",    label: "Business Workflows Protected", icon: ShieldCheck, color: "text-rose-500", value: "5",   sub: "Critical" },
  { id: "val",   label: "Value Scenarios",          icon: TrendingUp,  color: "text-blue-600",    value: "7",    sub: "Active" },
  { id: "health",label: "Operating Health",         icon: Heart,       color: "text-emerald-600", value: "88",   sub: "Healthy", valueTone: "text-emerald-600" },
];

/* ---------- Scenarios ---------- */
type Scenario = {
  id: string;
  n: number;
  title: string;
  category: "Reliability" | "Cyber" | "Resilience" | "Cost" | "Acquisition";
  catTone: string;
  numTone: string;
  workflow: string;
  workflowTone: string;
  description: string;
  coworkers: { name: string; icon: any }[];
  duration: string;
  impact: "High" | "Medium" | "Low";
  impactTone: string;
  steps: Step[];
};

type Step = {
  name: string;
  actor: "AI" | "Human" | "System";
  detail: string;
  approval?: boolean;
  outcome?: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "evv", n: 1, title: "Caregiver EVV Degradation", category: "Reliability",
    catTone: "bg-blue-100 text-blue-700 ring-blue-200", numTone: "bg-blue-600",
    workflow: "Caregiver Visit / EVV", workflowTone: "text-blue-700",
    description: "EVV sync success drops below SLO. SLO Sentinel detects burn and correlates mobile API errors with database latency.",
    coworkers: [{ name: "SLO Sentinel", icon: Activity }, { name: "Incident Synthesizer", icon: Workflow }],
    duration: "12 min", impact: "High", impactTone: "text-rose-600",
    steps: [
      { name: "SLO burn detected", actor: "System", detail: "Error budget burn rate 14x in EVV sync (98.2% → 96.4%)" },
      { name: "SLO Sentinel correlates signals", actor: "AI", detail: "Mobile API 5xx spike + Aurora read replica latency p99 410ms" },
      { name: "Blast radius computed", actor: "AI", detail: "8,412 active caregivers · 1,209 in-progress visits affected" },
      { name: "Auto-mitigation proposed", actor: "AI", detail: "Failover read traffic to secondary replica; throttle retries" },
      { name: "Human approval", actor: "Human", detail: "On-call SRE confirms failover plan", approval: true },
      { name: "Failover executed", actor: "System", detail: "Read traffic rerouted; latency p99 returns to 92ms" },
      { name: "Incident postmortem drafted", actor: "AI", detail: "Auto-RCA, action items, runbook update queued", outcome: "EVV restored · 0 visits lost · postmortem in 7 min" },
    ],
  },
  {
    id: "cve", n: 2, title: "Critical CVE / Patch Wave", category: "Cyber",
    catTone: "bg-rose-100 text-rose-700 ring-rose-200", numTone: "bg-rose-600",
    workflow: "Production Infrastructure", workflowTone: "text-rose-700",
    description: "Vulnerability scanner finds critical Windows / IIS exposure and orchestrates a safe, validated patch wave.",
    coworkers: [{ name: "Patch Orchestrator", icon: ShieldX }, { name: "Golden Image Auditor", icon: ShieldCheck }],
    duration: "15 min", impact: "High", impactTone: "text-rose-600",
    steps: [
      { name: "CVE-2026-1842 detected", actor: "System", detail: "CVSS 9.8 · 142 Windows hosts in production scope" },
      { name: "Exposure mapped to services", actor: "AI", detail: "Affects Claims, Payroll, Provider Portal" },
      { name: "Patch wave proposed", actor: "AI", detail: "3 waves · canary first · maint window aligned to low-traffic hours" },
      { name: "Change Advisory approval", actor: "Human", detail: "CAB lead approves emergency CR-22841", approval: true },
      { name: "Canary patched & validated", actor: "System", detail: "8 hosts patched · synthetic checks green" },
      { name: "Production wave executed", actor: "System", detail: "134 hosts patched with rolling drain" },
      { name: "Golden image updated", actor: "AI", detail: "Baseline image rebuilt; future provisioning protected", outcome: "100% remediation · 0 customer impact · evidence pack delivered" },
    ],
  },
  {
    id: "sg", n: 3, title: "Security Group Misconfiguration", category: "Cyber",
    catTone: "bg-rose-100 text-rose-700 ring-rose-200", numTone: "bg-amber-500",
    workflow: "Security & Network", workflowTone: "text-amber-700",
    description: "Risky public ingress detected in production. Analyze blast radius and remediate with human approval.",
    coworkers: [{ name: "Security Group Diff Analyst", icon: ShieldAlert }],
    duration: "10 min", impact: "High", impactTone: "text-rose-600",
    steps: [
      { name: "Drift detected", actor: "System", detail: "0.0.0.0/0 ingress added to prod-sg-claims-api on port 5432" },
      { name: "Blast radius analysis", actor: "AI", detail: "Exposed Aurora cluster · PHI workload · 12M records" },
      { name: "Auto-revert proposed", actor: "AI", detail: "Restore prior rule set v.142 · notify owner" },
      { name: "Security Lead approval", actor: "Human", detail: "Manual confirmation of revert", approval: true },
      { name: "Rule reverted", actor: "System", detail: "Ingress restored to allowlist only" },
      { name: "Forensics packaged", actor: "AI", detail: "Actor, time, change source, evidence for audit", outcome: "Exposure window: 4m 18s · no access observed · GRC closed" },
    ],
  },
  {
    id: "rel", n: 4, title: "Release Readiness Gate", category: "Reliability",
    catTone: "bg-blue-100 text-blue-700 ring-blue-200", numTone: "bg-violet-600",
    workflow: "Change Management", workflowTone: "text-violet-700",
    description: "Product team requests release. AI checks SLO health, incidents, rollback dependencies, cyber exposure, and error budget.",
    coworkers: [{ name: "Change Risk Reviewer", icon: GitBranch }],
    duration: "14 min", impact: "High", impactTone: "text-rose-600",
    steps: [
      { name: "Release intent submitted", actor: "Human", detail: "Claims-API v4.18 · 38 commits · 6 services touched" },
      { name: "SLO & error budget check", actor: "AI", detail: "All 4 SLOs healthy · budget 71% remaining" },
      { name: "Cyber gate", actor: "AI", detail: "0 critical CVEs · SBOM clean · DAST passed" },
      { name: "Rollback plan validated", actor: "AI", detail: "Blue/green ready · DB migration reversible" },
      { name: "Release approval", actor: "Human", detail: "Release Captain green-lights deploy", approval: true },
      { name: "Progressive rollout", actor: "System", detail: "5% → 25% → 100% over 22 min" },
      { name: "Outcome", actor: "AI", detail: "All gates green · automated postcheck clean", outcome: "Deployment shipped with zero rollback · CX score steady" },
    ],
  },
  {
    id: "dr", n: 5, title: "DR / Backup Validation", category: "Resilience",
    catTone: "bg-emerald-100 text-emerald-700 ring-emerald-200", numTone: "bg-emerald-600",
    workflow: "Disaster Recovery", workflowTone: "text-emerald-700",
    description: "DR Drill validates backup, restore, RTO/RPO, database dependency, and produces a gap report.",
    coworkers: [{ name: "DR Drill Coordinator", icon: RefreshCw }],
    duration: "18 min", impact: "High", impactTone: "text-rose-600",
    steps: [
      { name: "Drill initiated", actor: "Human", detail: "Q3 DR exercise for Payroll tier", approval: true },
      { name: "Snapshot integrity", actor: "AI", detail: "All 14 backups pass checksum + restore probe" },
      { name: "Isolated restore", actor: "System", detail: "Aurora restored in DR region · 6m 12s" },
      { name: "Workload boot test", actor: "AI", detail: "App tier comes up · synthetic txns pass" },
      { name: "Gap analysis", actor: "AI", detail: "1 IAM dependency missing in DR · ticket auto-filed", outcome: "RTO 11m / RPO 38s · 1 gap remediated · evidence to GRC" },
    ],
  },
  {
    id: "fin", n: 6, title: "FinOps Optimization", category: "Cost",
    catTone: "bg-amber-100 text-amber-700 ring-amber-200", numTone: "bg-amber-500",
    workflow: "Cloud Financial Management", workflowTone: "text-amber-700",
    description: "Waste Hunter finds idle resources, poor tagging, low savings plan coverage, and product-line cost leakage.",
    coworkers: [{ name: "FinOps Waste Hunter", icon: DollarSign }],
    duration: "13 min", impact: "Medium", impactTone: "text-amber-600",
    steps: [
      { name: "Scan executed", actor: "AI", detail: "27 idle EBS · 14 over-provisioned RDS · 9% untagged" },
      { name: "Savings modeled", actor: "AI", detail: "$84.2K / mo · 12% of cloud bill" },
      { name: "Owner notifications", actor: "System", detail: "Tickets routed to 6 service owners" },
      { name: "Approvals (bulk)", actor: "Human", detail: "Owners batch-approve safe rightsizing", approval: true },
      { name: "Auto-remediation", actor: "System", detail: "Idle volumes deleted · RDS rightsized" },
      { name: "Tag enforcement", actor: "AI", detail: "Tag policy hardened in IaC", outcome: "$84.2K monthly saved · waste reduced 38% · tags enforced" },
    ],
  },
  {
    id: "acq", n: 7, title: "Acquisition Onboarding", category: "Acquisition",
    catTone: "bg-violet-100 text-violet-700 ring-violet-200", numTone: "bg-violet-600",
    workflow: "M&A Integration", workflowTone: "text-violet-700",
    description: "New acquired product enters the factory. Digital twin scores readiness across observability, identity, security, backup, cost, SLO, and modernization.",
    coworkers: [{ name: "Acquisition Onboarding Scout", icon: Rocket }, { name: "Brownfield Risk Analyzer", icon: ShieldAlert }],
    duration: "16 min", impact: "High", impactTone: "text-rose-600",
    steps: [
      { name: "Discovery sweep", actor: "AI", detail: "142 assets · 14 services · 6 data stores discovered" },
      { name: "Brownfield maturity score", actor: "AI", detail: "Observability 42 · Security 58 · Cost 61 · SLO 33" },
      { name: "Risk register populated", actor: "System", detail: "9 highs / 14 mediums opened with owners" },
      { name: "Integration plan drafted", actor: "AI", detail: "Identity merge · golden image apply · SLO definition" },
      { name: "Executive approval", actor: "Human", detail: "Onboarding plan accepted by Integration Lead", approval: true },
      { name: "Standards applied", actor: "System", detail: "EDR rolled out · backup attached · SLOs published" },
      { name: "Estate absorbed", actor: "AI", detail: "Production join · runbooks generated", outcome: "Onboarded in 16 min vs 90-day baseline · risk score 58 → 84" },
    ],
  },
];

/* ---------- Executive Insights ---------- */
const INSIGHTS = [
  { tone: "emerald", label: "Top Opportunity", title: "Containerization Program", sub: "$1.2M Annual Benefit", icon: TrendingUp },
  { tone: "rose",    label: "Highest Risk",     title: "Legacy Provider Pro Environment", sub: "Modernization Required", icon: AlertOctagon },
  { tone: "amber",   label: "Fastest ROI",      title: "Cloud Rightsizing", sub: "$340K Annual Savings", icon: DollarSign },
  { tone: "blue",    label: "Strategic Focus",  title: "SRE & Automation Maturity", sub: "Drive Reliability & Scalability", icon: Target },
  { tone: "emerald", label: "Roadmap Health",   title: "On Track", sub: "38% Complete", icon: CheckCircle2 },
];

const PILLARS = [
  { label: "Operational Excellence", pct: 72, tone: "bg-blue-500" },
  { label: "Security",               pct: 68, tone: "bg-rose-500" },
  { label: "Reliability",            pct: 74, tone: "bg-emerald-500" },
  { label: "Performance Efficiency", pct: 61, tone: "bg-violet-500" },
  { label: "Cost Optimization",      pct: 69, tone: "bg-amber-500" },
  { label: "Sustainability",         pct: 44, tone: "bg-teal-500" },
];

const AI_ENGINE = [
  { label: "Risk Forecasting",      sub: "3 Risks Identified",      icon: TrendingDown, tone: "text-rose-500" },
  { label: "Value Forecast",        sub: "$10.6M Annual Target",    icon: TrendingUp,    tone: "text-emerald-600" },
  { label: "Dependency Analysis",   sub: "92 Dependencies Mapped",  icon: Workflow,      tone: "text-violet-600" },
  { label: "Recommendation Engine", sub: "12 Recommendations",      icon: Sparkles,      tone: "text-blue-600" },
];

const TREND = [
  { m: "May '25", a: 12, t: 18, f: 18 },
  { m: "Jun '25", a: 22, t: 26, f: 27 },
  { m: "Jul '25", a: 30, t: 34, f: 36 },
  { m: "Aug '25", a: 35, t: 42, f: 46 },
  { m: "Sep '25", a: 42, t: 50, f: 56 },
  { m: "Oct '25", a: 50, t: 58, f: 66 },
  { m: "Nov '25", a: 58, t: 66, f: 75 },
  { m: "Dec '25", a: 63, t: 72, f: 82 },
  { m: "Jan '26", a: 68, t: 78, f: 88 },
  { m: "Feb '26", a: 72, t: 84, f: 92 },
  { m: "Mar '26", a: 76, t: 88, f: 95 },
  { m: "Apr '26", a: 80, t: 92, f: 97 },
  { m: "May '26", a: 84, t: 96, f: 99 },
];

const INVEST = [
  { label: "0–30 Days",   value: 2.1, pct: 11, color: "#2563eb" },
  { label: "31–90 Days",  value: 3.2, pct: 17, color: "#7c3aed" },
  { label: "3–6 Months",  value: 3.6, pct: 19, color: "#10b981" },
  { label: "6–12 Months", value: 3.8, pct: 20, color: "#f59e0b" },
  { label: "12–24 Months",value: 3.7, pct: 20, color: "#ef4444" },
  { label: "24+ Months",  value: 2.3, pct: 13, color: "#0d9488" },
];

const MILESTONES = [
  { name: "Service Catalog Complete",  date: "May 31, 2025", status: "On Track", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { name: "Golden Image Baseline",     date: "Jun 30, 2025", status: "On Track", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { name: "SLO Framework Live",        date: "Aug 15, 2025", status: "At Risk",  tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  { name: "DR Drill #1 Complete",      date: "Oct 15, 2025", status: "Planned",  tone: "bg-slate-100 text-slate-600 ring-slate-200" },
  { name: "First Cloud Migration Wave",date: "Jan 15, 2026", status: "Planned",  tone: "bg-slate-100 text-slate-600 ring-slate-200" },
];

/* ============================================================== */
export default function InteractiveDemoCenter() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("risk");
  const [demoType, setDemoType] = useState("all");
  const [env, setEnv] = useState("production");

  const sorted = useMemo(() => {
    const arr = [...SCENARIOS];
    if (sortBy === "duration") arr.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    if (sortBy === "category") arr.sort((a, b) => a.category.localeCompare(b.category));
    return arr;
  }, [sortBy]);

  const filtered = useMemo(() => {
    if (demoType === "all") return sorted;
    const map: Record<string, Scenario["category"]> = {
      reliability: "Reliability", cyber: "Cyber", resilience: "Resilience", cost: "Cost", acquisition: "Acquisition",
    };
    return sorted.filter((s) => s.category === map[demoType]);
  }, [sorted, demoType]);

  const openScenario = (s: Scenario) => setDrawer({ kind: "scenario", title: s.title, subtitle: s.workflow, data: s });

  return (
    <AppShell>
      <div className="min-h-full bg-slate-50/60">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-6 py-4 flex items-start gap-5">
            <div className="flex-1 min-w-0">
              <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-tight">Interactive Demo Scenarios</h1>
              <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
                Experience operational workflows, AI-assisted decisions, reliability engineering, cyber resilience, modernization, and service ownership in action.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select value={demoType} onValueChange={setDemoType}>
                <SelectTrigger className="h-11 w-[150px] bg-white border-slate-300">
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Demo Type</div>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="reliability">Reliability</SelectItem>
                  <SelectItem value="cyber">Cyber</SelectItem>
                  <SelectItem value="resilience">Resilience</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="acquisition">Acquisition</SelectItem>
                </SelectContent>
              </Select>
              <Select value={env} onValueChange={setEnv}>
                <SelectTrigger className="h-11 w-[160px] bg-white border-slate-300">
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Environment</div>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="dr">DR</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2" onClick={() => openScenario(filtered[0])}>
                <Play className="h-4 w-4" /> Launch Demo
              </Button>
              <Button variant="outline" className="h-11 gap-2"><Filter className="h-4 w-4" /> Filters</Button>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {KPIS.map((k) => (
              <button
                key={k.id}
                onClick={() => setDrawer({ kind: "kpi", title: k.label, data: k })}
                className="bg-white rounded-xl border border-slate-200 p-3.5 text-left hover:border-blue-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("h-8 w-8 rounded-lg grid place-items-center ring-1", `ring-${k.color.split('-')[1]}-200 bg-${k.color.split('-')[1]}-50`)}>
                    <k.icon className={cn("h-4 w-4", k.color)} />
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500" />
                </div>
                <div className="text-[11px] font-semibold text-slate-500 leading-tight">{k.label}</div>
                <div className={cn("text-2xl font-bold mt-1 tabular-nums", k.valueTone ?? "text-slate-900")}>{k.value}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{k.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="px-6 py-5 grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-9 space-y-5">
            {/* toolbar */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Select a Scenario to Launch a Live Simulation</h2>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-500">View as:</span>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                  <button onClick={() => setView("grid")} className={cn("px-2.5 h-7 rounded-md text-xs font-semibold inline-flex items-center gap-1.5", view === "grid" ? "bg-blue-50 text-blue-700" : "text-slate-500")}>
                    <LayoutGrid className="h-3.5 w-3.5" /> Grid
                  </button>
                  <button onClick={() => setView("list")} className={cn("px-2.5 h-7 rounded-md text-xs font-semibold inline-flex items-center gap-1.5", view === "list" ? "bg-blue-50 text-blue-700" : "text-slate-500")}>
                    <ListIcon className="h-3.5 w-3.5" /> List
                  </button>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 ml-3">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="risk">Risk Impact</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Scenarios grid */}
            {view === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {filtered.map((s) => <ScenarioCard key={s.id} s={s} onLaunch={() => openScenario(s)} />)}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {filtered.map((s) => (
                  <button key={s.id} onClick={() => openScenario(s)} className="w-full flex items-center gap-4 p-3.5 text-left hover:bg-slate-50">
                    <span className={cn("h-8 w-8 rounded-lg grid place-items-center text-white text-xs font-bold", s.numTone)}>{s.n}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900">{s.title}</div>
                      <div className="text-xs text-slate-500 truncate">{s.description}</div>
                    </div>
                    <Badge className={cn("ring-1", s.catTone)}>{s.category}</Badge>
                    <span className="text-xs text-slate-500 tabular-nums w-16 text-right">{s.duration}</span>
                    <span className={cn("text-xs font-bold w-16 text-right", s.impactTone)}>{s.impact}</span>
                    <Play className="h-4 w-4 text-blue-600" />
                  </button>
                ))}
              </div>
            )}

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Trend */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-bold text-slate-900 mb-2">Roadmap Progress Trend</div>
                <div className="h-44">
                  <ResponsiveContainer>
                    <LineChart data={TREND} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <RTooltip />
                      <Line type="monotone" dataKey="a" stroke="#2563eb" strokeWidth={2} dot={false} name="Actual" />
                      <Line type="monotone" dataKey="t" stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Target" />
                      <Line type="monotone" dataKey="f" stroke="#10b981" strokeWidth={2} strokeDasharray="2 4" dot={false} name="Forecast" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-1">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 bg-blue-600 rounded" /> Actual</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 bg-violet-600 rounded" /> Target</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 bg-emerald-500 rounded" /> Forecast</span>
                </div>
              </div>

              {/* Investment */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-bold text-slate-900 mb-2">Investment by Horizon</div>
                <div className="flex items-center gap-3">
                  <div className="h-36 w-36 shrink-0 relative">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={INVEST} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={2}>
                          {INVEST.map((i, idx) => <Cell key={idx} fill={i.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 grid place-items-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-base font-bold text-slate-900">$18.7M</div>
                        <div className="text-[10px] text-slate-500">Total</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {INVEST.map((i) => (
                      <div key={i.label} className="flex items-center gap-2 text-[11px]">
                        <span className="h-2 w-2 rounded-sm" style={{ background: i.color }} />
                        <span className="flex-1 text-slate-700">{i.label}</span>
                        <span className="font-bold text-slate-900 tabular-nums">${i.value}M</span>
                        <span className="text-slate-400 tabular-nums w-9 text-right">({i.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-bold text-slate-900 mb-2">Key Milestones</div>
                <div className="space-y-1.5">
                  {MILESTONES.map((m) => (
                    <div key={m.name} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.date}</div>
                      </div>
                      <Badge className={cn("ring-1 text-[10px]", m.tone)}>{m.status}</Badge>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                  View All Milestones <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div className="col-span-12 xl:col-span-3 space-y-4">
            {/* Executive Insights */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-bold text-slate-900 mb-3">Executive Insights</div>
              <div className="space-y-2">
                {INSIGHTS.map((i, idx) => (
                  <button key={idx} onClick={() => setDrawer({ kind: "insight", title: i.title, subtitle: i.label, data: i })} className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-slate-50 text-left">
                    <span className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0 ring-1",
                      i.tone === "emerald" && "bg-emerald-50 ring-emerald-200 text-emerald-600",
                      i.tone === "rose" && "bg-rose-50 ring-rose-200 text-rose-600",
                      i.tone === "amber" && "bg-amber-50 ring-amber-200 text-amber-600",
                      i.tone === "blue" && "bg-blue-50 ring-blue-200 text-blue-600",
                    )}>
                      <i.icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{i.label}</div>
                      <div className="text-xs font-bold text-slate-900 truncate">{i.title}</div>
                      <div className={cn("text-[11px] font-semibold",
                        i.tone === "emerald" && "text-emerald-600",
                        i.tone === "rose" && "text-rose-600",
                        i.tone === "amber" && "text-amber-600",
                        i.tone === "blue" && "text-blue-600",
                      )}>{i.sub}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Pillar alignment */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-bold text-slate-900 mb-3">Pillar Alignment Progress</div>
              <div className="space-y-2.5">
                {PILLARS.map((p) => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">{p.label}</span>
                      <span className="font-bold text-slate-900 tabular-nums">{p.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={cn("h-full rounded-full", p.tone)} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis Engine */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-violet-600" />
                <div className="text-sm font-bold text-slate-900">AI Analysis Engine</div>
              </div>
              <div className="space-y-2">
                {AI_ENGINE.map((a) => (
                  <div key={a.label} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <a.icon className={cn("h-4 w-4", a.tone)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{a.label}</div>
                      <div className="text-[11px] text-slate-500 truncate">{a.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => toast.success("AI Insights opened")} className="mt-3 text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                View AI Insights <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {drawer?.kind === "scenario" && <ScenarioDrawer s={drawer.data as Scenario} />}
          {drawer?.kind !== "scenario" && drawer && (
            <>
              <SheetHeader>
                <SheetTitle>{drawer.title}</SheetTitle>
                {drawer.subtitle && <div className="text-sm text-slate-500">{drawer.subtitle}</div>}
              </SheetHeader>
              <div className="mt-4 text-sm text-slate-600">
                Drill-down view with detailed evidence, dependencies, and recommended actions.
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

/* ---------- Scenario Card ---------- */
function ScenarioCard({ s, onLaunch }: { s: Scenario; onLaunch: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 hover:border-blue-300 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className={cn("h-9 w-9 rounded-lg grid place-items-center text-white text-base font-bold shrink-0", s.numTone)}>{s.n}</span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 leading-tight">{s.title}</div>
          </div>
        </div>
        <Badge className={cn("ring-1 text-[10px] shrink-0", s.catTone)}>{s.category}</Badge>
      </div>
      <div className="text-[11px]">
        <span className="text-slate-500">Workflow: </span>
        <span className={cn("font-semibold", s.workflowTone)}>{s.workflow}</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Digital Coworkers</div>
        <div className="space-y-1">
          {s.coworkers.map((c) => (
            <div key={c.name} className="inline-flex items-center gap-1.5 mr-1.5 text-[11px] bg-violet-50 text-violet-700 px-2 py-1 rounded-md">
              <c.icon className="h-3 w-3" /> {c.name}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Est. Duration</div>
          <div className="text-sm font-bold text-slate-900 tabular-nums">{s.duration}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Business Impact</div>
          <div className={cn("text-sm font-bold", s.impactTone)}>{s.impact}</div>
        </div>
      </div>
      <button onClick={onLaunch} className="mt-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5">
        <Play className="h-3.5 w-3.5" /> Launch Demo <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-80" />
      </button>
    </div>
  );
}

/* ---------- Scenario Drawer (interactive simulation) ---------- */
function ScenarioDrawer({ s }: { s: Scenario }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [approved, setApproved] = useState<Record<number, boolean>>({});
  const total = s.steps.length;

  useEffect(() => {
    setStepIdx(0); setPlaying(false); setApproved({});
  }, [s.id]);

  useEffect(() => {
    if (!playing) return;
    const step = s.steps[stepIdx];
    if (step?.approval && !approved[stepIdx]) { setPlaying(false); return; }
    if (stepIdx >= total - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStepIdx((i) => Math.min(i + 1, total - 1)), 1400);
    return () => clearTimeout(t);
  }, [playing, stepIdx, approved, s.steps, total]);

  const current = s.steps[stepIdx];
  const progress = Math.round(((stepIdx + 1) / total) * 100);
  const lastStep = stepIdx === total - 1;

  return (
    <>
      <SheetHeader>
        <div className="flex items-start gap-3">
          <span className={cn("h-10 w-10 rounded-lg grid place-items-center text-white text-base font-bold shrink-0", s.numTone)}>{s.n}</span>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-lg">{s.title}</SheetTitle>
            <div className="text-xs text-slate-500 mt-0.5">{s.workflow} · {s.duration} · Impact <span className={s.impactTone}>{s.impact}</span></div>
          </div>
          <Badge className={cn("ring-1", s.catTone)}>{s.category}</Badge>
        </div>
      </SheetHeader>

      <Tabs defaultValue="run" className="mt-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="run">Live Run</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="run" className="mt-4 space-y-4">
          {/* Player */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-700">Simulation Progress</div>
              <div className="text-xs font-bold tabular-nums text-slate-900">Step {stepIdx + 1} / {total} · {progress}%</div>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-3">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setPlaying((p) => !p)} className="bg-blue-600 hover:bg-blue-700">
                {playing ? <><PauseCircle className="h-3.5 w-3.5 mr-1" /> Pause</> : <><Play className="h-3.5 w-3.5 mr-1" /> Play</>}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setStepIdx(0); setApproved({}); setPlaying(false); }}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
              <Button size="sm" variant="outline" disabled={lastStep || (current?.approval && !approved[stepIdx])} onClick={() => setStepIdx((i) => Math.min(i + 1, total - 1))}>
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Current */}
          <div className={cn("rounded-xl border p-4",
            current?.actor === "AI" && "bg-violet-50 border-violet-200",
            current?.actor === "Human" && "bg-amber-50 border-amber-200",
            current?.actor === "System" && "bg-blue-50 border-blue-200",
          )}>
            <div className="flex items-center gap-2 mb-2">
              <ActorBadge actor={current.actor} />
              <span className="text-xs font-bold text-slate-700">Current Step</span>
            </div>
            <div className="text-sm font-bold text-slate-900">{current.name}</div>
            <div className="text-xs text-slate-700 mt-1">{current.detail}</div>
            {current.approval && !approved[stepIdx] && (
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setApproved((a) => ({ ...a, [stepIdx]: true })); toast.success("Approval recorded · simulation resumes"); setPlaying(true); }}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve & Continue
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Rejected — routed for further review")}>Reject</Button>
              </div>
            )}
            {current.outcome && (
              <div className="mt-3 rounded-lg bg-white border border-emerald-200 p-3">
                <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 mb-1">Outcome</div>
                <div className="text-sm font-bold text-slate-900">{current.outcome}</div>
              </div>
            )}
          </div>

          {/* Mini run metrics */}
          <div className="grid grid-cols-4 gap-2">
            <MiniMetric icon={Brain}  label="AI Steps"     value={s.steps.filter(x => x.actor === "AI").length} tone="text-violet-600" />
            <MiniMetric icon={Users}  label="Approvals"    value={s.steps.filter(x => x.approval).length}      tone="text-amber-600" />
            <MiniMetric icon={Zap}    label="System Acts"  value={s.steps.filter(x => x.actor === "System").length} tone="text-blue-600" />
            <MiniMetric icon={Clock}  label="ETA"          value={s.duration} tone="text-slate-700" />
          </div>
        </TabsContent>

        <TabsContent value="steps" className="mt-4">
          <ol className="relative border-l border-slate-200 ml-3 space-y-3">
            {s.steps.map((st, i) => (
              <li key={i} className="pl-4 relative">
                <span className={cn("absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-2 ring-white",
                  i < stepIdx ? "bg-emerald-500" : i === stepIdx ? "bg-blue-500 animate-pulse" : "bg-slate-300",
                )} />
                <div className="flex items-center gap-2">
                  <ActorBadge actor={st.actor} small />
                  <div className="text-sm font-bold text-slate-900">{st.name}</div>
                  {st.approval && <Badge className="bg-amber-100 text-amber-700 ring-1 ring-amber-200 text-[10px]">Human approval</Badge>}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{st.detail}</div>
                {st.outcome && <div className="text-xs text-emerald-700 mt-1 font-semibold">→ {st.outcome}</div>}
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="evidence" className="mt-4 space-y-2">
          {[
            { name: "Telemetry snapshot.json",     icon: Database,  size: "84 KB" },
            { name: "Decision trace (AI).log",     icon: Brain,     size: "12 KB" },
            { name: "Approval ledger.csv",         icon: FileText,  size: "3 KB"  },
            { name: "Audit evidence pack.pdf",     icon: ShieldCheck,size: "1.2 MB"},
          ].map((e) => (
            <div key={e.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50">
              <e.icon className="h-4 w-4 text-slate-500" />
              <div className="flex-1 text-sm font-semibold text-slate-900">{e.name}</div>
              <span className="text-xs text-slate-500 tabular-nums">{e.size}</span>
              <Button size="sm" variant="outline">Download</Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="actions" className="mt-4 space-y-2">
          {[
            { label: "Pin to Command Center", icon: Pin },
            { label: "Schedule recurring demo", icon: Clock },
            { label: "Share with stakeholders", icon: Users },
            { label: "Export run report", icon: FileText },
            { label: "Open in SRE Cockpit", icon: Activity },
          ].map((a) => (
            <button key={a.label} onClick={() => toast.success(a.label)} className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-left">
              <a.icon className="h-4 w-4 text-blue-600" />
              <span className="flex-1 text-sm font-semibold text-slate-900">{a.label}</span>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </button>
          ))}
        </TabsContent>
      </Tabs>
    </>
  );
}

function ActorBadge({ actor, small }: { actor: "AI" | "Human" | "System"; small?: boolean }) {
  const map = {
    AI:     { tone: "bg-violet-100 text-violet-700 ring-violet-200", icon: Brain },
    Human:  { tone: "bg-amber-100 text-amber-700 ring-amber-200",    icon: Users },
    System: { tone: "bg-blue-100 text-blue-700 ring-blue-200",       icon: Zap   },
  }[actor];
  const Icon = map.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md ring-1 font-bold uppercase tracking-wider", map.tone, small ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]")}>
      <Icon className={small ? "h-2.5 w-2.5" : "h-3 w-3"} /> {actor}
    </span>
  );
}

function MiniMetric({ icon: Icon, label, value, tone }: { icon: any; label: string; value: any; tone: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">
        <Icon className={cn("h-3 w-3", tone)} /> {label}
      </div>
      <div className="text-sm font-bold text-slate-900 mt-0.5">{value}</div>
    </div>
  );
}
