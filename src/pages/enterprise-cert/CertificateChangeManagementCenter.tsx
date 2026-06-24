import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText, GitBranch,
  Globe, HelpCircle, LayoutDashboard, Package, Plug, RefreshCw, ScrollText, Scale, Search,
  ServerCog, ShieldAlert, ShieldCheck, UserCog, Sparkles, X, ChevronRight, AlertTriangle,
  DollarSign, Shield, TrendingUp, CheckCircle2, Filter, ArrowUpRight, Calendar, Clock,
  PlayCircle, PauseCircle, RotateCcw, Workflow, GitPullRequest, Users, Gauge, Send,
  Layers, Zap, ListChecks, FileCheck2, AlertOctagon, Crown, ChevronLeft, ChevronDown, Eye,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ============== SIDEBAR ==============
const navSections = [
  { label: "Command Center", items: [
    { id: "ops", label: "Operations Overview", icon: LayoutDashboard, to: "/enterprise-certificate-management" },
    { id: "risk", label: "Risk & Exposure", icon: ShieldAlert, to: "/enterprise-certificate-management/risk-exposure" },
    { id: "map", label: "Global Map", icon: Globe, to: "/enterprise-certificate-management/global-map" },
    { id: "life", label: "Lifecycle", icon: Activity, to: "/enterprise-certificate-management/lifecycle" },
    { id: "biz", label: "Business Services", icon: Briefcase, to: "/enterprise-certificate-management/business-services" },
    { id: "rep", label: "Reports", icon: FileText, to: "/enterprise-certificate-management/reports" },
  ]},
  { label: "Operations", items: [
    { id: "auto", label: "Agentic Execution Center", icon: Sparkles, to: "/enterprise-certificate-management/agentic-execution" },
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers" },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center" },
    { id: "cm", label: "Change Manager", icon: GitBranch, to: "/enterprise-certificate-management/change-manager", active: true },
    { id: "int", label: "Integrations", icon: Plug },
  ]},
  { label: "Security & Compliance", items: [
    { id: "sec", label: "Security Posture", icon: ShieldCheck },
    { id: "com", label: "Compliance Center", icon: BookCheck },
    { id: "audit", label: "Audit & Evidence", icon: FileSearch },
    { id: "pol", label: "Policy Engine", icon: Scale },
    { id: "ct", label: "CT Logs Monitor", icon: ScrollText },
  ]},
  { label: "Administration", items: [
    { id: "inv", label: "Inventory", icon: Package },
    { id: "iss", label: "Issuers & CAs", icon: Building2 },
    { id: "acc", label: "Account Management", icon: UserCog },
    { id: "sys", label: "System Settings", icon: Cog },
  ]},
];

function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }}
      className="w-[240px] shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col"
    >
      <div className="px-5 pt-5 pb-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 grid place-items-center text-white text-xs font-bold">n</div>
        <div className="leading-tight">
          <div className="text-[11px] text-slate-500 font-medium">neurealm</div>
          <div className="text-base font-bold text-slate-900 -mt-0.5">RunOps</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {navSections.map((s) => (
          <div key={s.label} className="mt-4">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className="mt-1 space-y-0.5">
              {s.items.map((it: any) => {
                const inner = (<><it.icon className="h-4 w-4" /><span>{it.label}</span></>);
                const cls = cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                  it.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-blue-700 font-semibold hover:bg-blue-50"
                );
                return it.to
                  ? <Link key={it.id} to={it.to} className={cls}>{inner}</Link>
                  : <button key={it.id} className={cls}>{inner}</button>;
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Change Health</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">99.1%</span>
          <span className="text-xs opacity-80">Success</span>
        </div>
        <div className="text-xs opacity-90">287 open · 4 emergency</div>
      </div>
    </motion.aside>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500 font-medium">Enterprise Certificate Management</div>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Certificate Change Management Center</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search changes, CRs, services" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
        </div>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1.5"><GitPullRequest className="h-3.5 w-3.5" /> New Change</button>
        <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><Bell className="h-4 w-4 text-slate-600" /></button>
        <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
      </div>
    </header>
  );
}

// ============== COUNTER ==============
function useCountUp(target: number, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function KpiCard({ icon: Icon, label, value, suffix, prefix, accent, trend, danger }: any) {
  const n = useCountUp(value);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className={cn("absolute inset-x-0 top-0 h-0.5", accent)} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
            {prefix}{n.toLocaleString()}{suffix}
          </div>
        </div>
        <div className="h-9 w-9 rounded-lg bg-slate-50 grid place-items-center text-slate-600"><Icon className="h-4 w-4" /></div>
      </div>
      {trend && (
        <div className={cn("mt-2 text-[11px] font-semibold inline-flex items-center gap-1", danger ? "text-rose-600" : "text-emerald-600")}>
          <TrendingUp className="h-3 w-3" /> {trend}
        </div>
      )}
    </motion.div>
  );
}

// ============== PIPELINE STAGES ==============
const PIPELINE = [
  { id: "req", label: "Request", icon: GitPullRequest, volume: 287, sla: "98%", risk: "Low", success: 100, coworkers: 2, color: "from-sky-500 to-blue-600" },
  { id: "risk", label: "Risk Assessment", icon: ShieldAlert, volume: 248, sla: "97%", risk: "Auto", success: 99.4, coworkers: 1, color: "from-amber-500 to-orange-600" },
  { id: "biz", label: "Business Impact", icon: Briefcase, volume: 248, sla: "99%", risk: "Auto", success: 100, coworkers: 1, color: "from-blue-500 to-indigo-600" },
  { id: "appr", label: "Approval", icon: FileCheck2, volume: 73, sla: "92%", risk: "Human", success: 98.8, coworkers: 0, color: "from-violet-500 to-purple-600" },
  { id: "sched", label: "Scheduling", icon: Calendar, volume: 174, sla: "100%", risk: "Auto", success: 99.9, coworkers: 1, color: "from-cyan-500 to-sky-600" },
  { id: "exec", label: "Execution", icon: PlayCircle, volume: 38, sla: "99%", risk: "Med", success: 99.1, coworkers: 3, color: "from-emerald-500 to-teal-600" },
  { id: "val", label: "Validation", icon: CheckCircle2, volume: 38, sla: "100%", risk: "Low", success: 99.7, coworkers: 2, color: "from-green-500 to-emerald-600" },
  { id: "close", label: "Closure", icon: ListChecks, volume: 1412, sla: "100%", risk: "—", success: 100, coworkers: 1, color: "from-slate-500 to-slate-700" },
  { id: "audit", label: "Audit Archive", icon: FileSearch, volume: 18000, sla: "100%", risk: "—", success: 100, coworkers: 1, color: "from-amber-600 to-rose-600" },
];

// ============== CHANGES DATA ==============
type Change = {
  id: string; title: string; priority: "Routine" | "Normal" | "High" | "Emergency"; risk: "Low" | "Medium" | "High" | "Critical";
  riskScore: number; service: string; revenue: string; status: "Planned" | "Approval" | "Scheduled" | "Executing" | "Validating" | "Closed";
  approvalsDone: number; approvalsTotal: number; window: string; coworkers: string[]; engineers: string[]; reason: string;
  certs: number; apps: number; customers: string; compliance: string[];
};

const CHANGES: Change[] = [
  { id: "CHG-48201", title: "Renew Customer Portal Certificate", priority: "Normal", risk: "Medium", riskScore: 38, service: "Customer Portal", revenue: "$12.4M", status: "Executing", approvalsDone: 3, approvalsTotal: 3, window: "Today 22:00–23:30 UTC", coworkers: ["Renewal Coordinator","Deployment Engineer","Validation Engineer"], engineers: ["A. Patel","M. Chen"], reason: "Pre-expiry renewal (28 days remaining) for the primary customer-facing portal certificate.", certs: 4, apps: 14, customers: "28,000", compliance: ["PCI","SOC2"] },
  { id: "CHG-48205", title: "Renew API Gateway Certificate", priority: "Normal", risk: "Medium", riskScore: 32, service: "API Gateway", revenue: "$8.2M", status: "Scheduled", approvalsDone: 3, approvalsTotal: 3, window: "Tomorrow 02:00–03:00 UTC", coworkers: ["Renewal Coordinator","Deployment Engineer"], engineers: ["S. Okafor"], reason: "Coordinated renewal across 6 gateway nodes serving partner integrations.", certs: 6, apps: 22, customers: "1.2M", compliance: ["SOC2"] },
  { id: "CHG-48212", title: "Replace Weak Algorithm Certificate (SHA-1)", priority: "High", risk: "High", riskScore: 64, service: "Identity Service", revenue: "$3.6M", status: "Approval", approvalsDone: 2, approvalsTotal: 4, window: "Fri 23:00–01:00 UTC", coworkers: ["Risk Analyst","Deployment Engineer","Validation Engineer"], engineers: ["L. Rivera","P. Singh"], reason: "Migration of last 4 SHA-1 endpoints to RSA-3072 to close residual cryptographic risk.", certs: 4, apps: 9, customers: "4.4M", compliance: ["PCI","NIST","ISO27001"] },
  { id: "CHG-48218", title: "Rotate Compromised Key (Emergency)", priority: "Emergency", risk: "Critical", riskScore: 92, service: "Payments Service", revenue: "$24.0M", status: "Executing", approvalsDone: 5, approvalsTotal: 5, window: "Now (Emergency)", coworkers: ["Security Investigation","Deployment Engineer","Validation Engineer"], engineers: ["CISO Bridge","R. Khan"], reason: "Suspected key exposure flagged by CT log anomaly; emergency rotation per IR playbook.", certs: 1, apps: 18, customers: "12M", compliance: ["PCI","SOC2","NIST"] },
  { id: "CHG-48225", title: "CA Migration – DigiCert → Internal PKI", priority: "High", risk: "High", riskScore: 71, service: "Multiple", revenue: "$48.0M", status: "Planned", approvalsDone: 1, approvalsTotal: 6, window: "Wave 1: Sun 04:00 UTC", coworkers: ["Discovery Engineer","Risk Analyst","Renewal Coordinator","Compliance Auditor"], engineers: ["CAB","Architecture"], reason: "Phased CA migration across 4 waves to internal PKI, reducing external dependency.", certs: 1480, apps: 312, customers: "24M", compliance: ["PCI","SOC2","NIST","ISO27001"] },
  { id: "CHG-48231", title: "Mass Renewal Event – Q3 Wave", priority: "Normal", risk: "Medium", riskScore: 44, service: "Multiple", revenue: "$18.0M", status: "Scheduled", approvalsDone: 4, approvalsTotal: 4, window: "Sat 06:00–10:00 UTC", coworkers: ["Renewal Coordinator","Deployment Engineer","Validation Engineer"], engineers: ["NOC"], reason: "Quarterly batch renewal of 412 certificates expiring within 45 days.", certs: 412, apps: 168, customers: "8.6M", compliance: ["PCI","SOC2"] },
  { id: "CHG-48237", title: "Claims Platform mTLS Rotation", priority: "Normal", risk: "Low", riskScore: 18, service: "Claims Platform", revenue: "$6.8M", status: "Validating", approvalsDone: 3, approvalsTotal: 3, window: "Today 14:00 UTC", coworkers: ["Deployment Engineer","Validation Engineer"], engineers: ["M. Diop"], reason: "Routine mTLS certificate rotation for claims downstream integrations.", certs: 12, apps: 8, customers: "—", compliance: ["HIPAA","SOC2"] },
  { id: "CHG-48240", title: "FedRAMP Boundary Cert Refresh", priority: "High", risk: "High", riskScore: 58, service: "Federal Tenant", revenue: "$4.2M", status: "Approval", approvalsDone: 1, approvalsTotal: 5, window: "Mon 02:00–04:00 UTC", coworkers: ["Compliance Auditor","Deployment Engineer"], engineers: ["FedRAMP Lead"], reason: "FedRAMP High boundary certificate refresh with mandatory dual-control approval.", certs: 9, apps: 14, customers: "Gov", compliance: ["FedRAMP","NIST"] },
];

const STATUS_STYLE: any = {
  "Planned":    "bg-slate-50 text-slate-700 border-slate-200",
  "Approval":   "bg-violet-50 text-violet-700 border-violet-200",
  "Scheduled":  "bg-sky-50 text-sky-700 border-sky-200",
  "Executing":  "bg-blue-50 text-blue-700 border-blue-200",
  "Validating": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Closed":     "bg-slate-100 text-slate-600 border-slate-200",
};
const PRIORITY_STYLE: any = {
  "Routine":   "bg-slate-50 text-slate-700 border-slate-200",
  "Normal":    "bg-blue-50 text-blue-700 border-blue-200",
  "High":      "bg-amber-50 text-amber-700 border-amber-200",
  "Emergency": "bg-rose-50 text-rose-700 border-rose-200",
};
const RISK_STYLE: any = {
  "Low":      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "Medium":   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" },
  "High":     { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-500" },
  "Critical": { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500" },
};

// ============== RISK MATRIX ==============
const RISK_MATRIX = [
  { tier: "Low",      count: 1080, examples: "Routine Renewal", impact: "Minimal",   customer: "None",     revenue: "<$50K",  color: "from-emerald-400 to-emerald-600", style: RISK_STYLE.Low },
  { tier: "Medium",   count: 312,  examples: "Standard Rotation", impact: "Service",  customer: "<10K",    revenue: "$50K–$2M", color: "from-amber-400 to-amber-600",     style: RISK_STYLE.Medium },
  { tier: "High",     count: 84,   examples: "SHA-1 Migration",   impact: "Multi-svc",customer: "10–100K", revenue: "$2M–$10M", color: "from-orange-400 to-orange-600",   style: RISK_STYLE.High },
  { tier: "Critical", count: 4,    examples: "Compromised Key, CA Change", impact: "Enterprise", customer: "1M+",  revenue: "$10M+",  color: "from-rose-500 to-red-600",       style: RISK_STYLE.Critical },
];

// ============== ANALYTICS ==============
const RISK_BY_REGION = [
  { name: "NA",    low: 410, med: 120, high: 32, crit: 2 },
  { name: "EMEA",  low: 320, med: 96,  high: 22, crit: 1 },
  { name: "APAC",  low: 220, med: 64,  high: 18, crit: 1 },
  { name: "LATAM", low: 130, med: 32,  high: 12, crit: 0 },
];
const SUCCESS_TREND = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"][i],
  success: 96.8 + i * 0.18 + (i % 3 === 0 ? 0.3 : 0),
  rollback: 4.2 - i * 0.22 + (i % 4 === 0 ? 0.2 : 0),
}));
const APPROVAL_TREND = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"][i],
  approved: 80 + i * 6 + Math.round(Math.sin(i) * 8),
  rejected: 6 + Math.round(Math.cos(i) * 2),
  emergency: 8 + Math.round(Math.sin(i / 2) * 3),
}));

// ============== COWORKERS ==============
const COWORKERS = [
  { name: "Discovery Engineer",   conf: 98, change: "CHG-48225", actions: 412, approvals: 0, icon: Search },
  { name: "Risk Analyst",         conf: 96, change: "CHG-48212", actions: 248, approvals: 1, icon: ShieldAlert },
  { name: "Renewal Coordinator",  conf: 99, change: "CHG-48201", actions: 1420,approvals: 0, icon: RefreshCw },
  { name: "Deployment Engineer",  conf: 97, change: "CHG-48218", actions: 3120,approvals: 0, icon: PlayCircle },
  { name: "Validation Engineer",  conf: 99, change: "CHG-48237", actions: 2840,approvals: 0, icon: CheckCircle2 },
  { name: "Compliance Auditor",   conf: 98, change: "CHG-48240", actions: 980, approvals: 2, icon: BookCheck },
  { name: "Security Investigator",conf: 94, change: "CHG-48218", actions: 168, approvals: 1, icon: ShieldCheck },
];

// ============== AUTOMATIONS ==============
const AUTOMATIONS = [
  { name: "Change Record Creation", success: 100,  runs: 1480, saved: "4,200 hrs", last: "2m ago", icon: GitPullRequest },
  { name: "Risk Assessment",        success: 99.6, runs: 1480, saved: "6,800 hrs", last: "5m ago", icon: ShieldAlert },
  { name: "Business Impact Analysis", success: 99.9, runs: 1480, saved: "5,400 hrs", last: "6m ago", icon: Briefcase },
  { name: "CAB Routing",            success: 100,  runs: 1480, saved: "2,800 hrs", last: "11m ago", icon: GitBranch },
  { name: "Maintenance Window Optimizer", success: 99.2, runs: 1280, saved: "3,200 hrs", last: "1h ago", icon: Calendar },
  { name: "Validation Execution",   success: 99.7, runs: 1412, saved: "8,600 hrs", last: "3m ago", icon: CheckCircle2 },
  { name: "Audit Evidence Collection", success: 100, runs: 18000, saved: "7,000 hrs", last: "Live", icon: FileSearch },
];

// ============== CALENDAR ==============
const CAL_EVENTS: Record<number, { kind: string; label: string; color: string }[]> = {
  3:  [{ kind: "scheduled", label: "Mass Renewal Wave", color: "bg-sky-500" }],
  5:  [{ kind: "cab", label: "CAB Review", color: "bg-violet-500" }],
  8:  [{ kind: "emergency", label: "Emergency CHG-48218", color: "bg-rose-500" }],
  11: [{ kind: "scheduled", label: "API GW Renewal", color: "bg-sky-500" }],
  14: [{ kind: "blackout", label: "Trading Blackout", color: "bg-slate-700" }],
  15: [{ kind: "blackout", label: "Trading Blackout", color: "bg-slate-700" }],
  17: [{ kind: "scheduled", label: "CA Migration W1", color: "bg-indigo-500" }],
  19: [{ kind: "cab", label: "CAB Meeting", color: "bg-violet-500" }],
  22: [{ kind: "scheduled", label: "FedRAMP Boundary", color: "bg-amber-500" }],
  24: [{ kind: "scheduled", label: "EMEA Wave", color: "bg-sky-500" }],
  27: [{ kind: "cab", label: "Emergency CAB", color: "bg-rose-500" }],
  29: [{ kind: "scheduled", label: "APAC Wave", color: "bg-sky-500" }],
};

// ============== MAIN ==============
export default function CertificateChangeManagementCenter() {
  const [selected, setSelected] = useState<Change | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = useMemo(() => CHANGES.filter((c) =>
    (riskFilter === "All" || c.risk === riskFilter) &&
    (statusFilter === "All" || c.status === statusFilter)
  ), [riskFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50/60 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">

          {/* KPI LAYER */}
          <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <KpiCard icon={GitPullRequest} label="Open Changes" value={287} accent="bg-gradient-to-r from-sky-400 to-blue-500" trend="+12 today" />
            <KpiCard icon={AlertOctagon} label="Emergency" value={4} accent="bg-gradient-to-r from-rose-400 to-red-500" trend="-2 vs last wk" />
            <KpiCard icon={FileCheck2} label="Pending Approvals" value={73} accent="bg-gradient-to-r from-violet-400 to-purple-500" trend="SLA 92%" />
            <KpiCard icon={Workflow} label="Changes / Month" value={1480} accent="bg-gradient-to-r from-blue-400 to-indigo-500" trend="+18% MoM" />
            <KpiCard icon={CheckCircle2} label="Success Rate" value={99} suffix=".1%" accent="bg-gradient-to-r from-emerald-400 to-teal-500" trend="+0.4 pts" />
            <KpiCard icon={RotateCcw} label="Rollbacks" value={12} accent="bg-gradient-to-r from-amber-400 to-orange-500" trend="-38% YoY" />
            <KpiCard icon={Bot} label="Coworkers Active" value={12} accent="bg-gradient-to-r from-fuchsia-400 to-pink-500" trend="96% conf" />
            <KpiCard icon={Clock} label="MTTR (min)" value={27} accent="bg-gradient-to-r from-cyan-400 to-sky-500" trend="-22% MoM" />
            <KpiCard icon={DollarSign} label="Revenue Protected" prefix="$" value={12} suffix=".4M" accent="bg-gradient-to-r from-green-400 to-emerald-500" trend="Tier-1" />
            <KpiCard icon={Layers} label="Certs Affected" value={1150} accent="bg-gradient-to-r from-indigo-400 to-violet-500" trend="this month" />
          </section>

          {/* CHANGE PIPELINE */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[14px] font-bold text-slate-900">Change Pipeline</h2>
                <p className="text-[11px] text-slate-500">End-to-end governed certificate change lifecycle</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1"><Bot className="h-3 w-3 text-violet-500" /> Auto stage</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3 text-blue-500" /> Human stage</span>
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 pb-2">
              <div className="flex items-stretch gap-2 min-w-max">
                {PIPELINE.map((s, i) => (
                  <div key={s.id} className="flex items-stretch gap-2">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="w-[160px] rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className={cn("h-7 w-7 rounded-md bg-gradient-to-br grid place-items-center text-white", s.color)}>
                          <s.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="mt-2 text-[12px] font-bold text-slate-900">{s.label}</div>
                      <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px]">
                        <div className="text-slate-500">Volume</div><div className="text-slate-900 font-semibold text-right tabular-nums">{s.volume.toLocaleString()}</div>
                        <div className="text-slate-500">SLA</div><div className="text-emerald-700 font-semibold text-right">{s.sla}</div>
                        <div className="text-slate-500">Risk</div><div className={cn("font-semibold text-right",
                          s.risk === "High" ? "text-orange-700" : s.risk === "Med" ? "text-amber-700" : "text-slate-700")}>{s.risk}</div>
                        <div className="text-slate-500">Success</div><div className="text-slate-900 font-semibold text-right">{s.success}%</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="inline-flex items-center gap-1 text-violet-700 font-semibold"><Bot className="h-2.5 w-2.5" /> {s.coworkers}</span>
                        <span className="h-1.5 w-12 rounded-full bg-slate-100 overflow-hidden"><motion.span className={cn("block h-full bg-gradient-to-r", s.color)} initial={{ width: 0 }} animate={{ width: `${s.success}%` }} transition={{ duration: 1.2 }} /></span>
                      </div>
                    </motion.div>
                    {i < PIPELINE.length - 1 && (
                      <div className="grid place-items-center w-4 text-slate-300"><ChevronRight className="h-4 w-4" /></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FILTERS */}
          <section className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">Filters</span>
            {["All","Low","Medium","High","Critical"].map((r) => (
              <button key={r} onClick={() => setRiskFilter(r)} className={cn("h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-colors", riskFilter === r ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")}>{r === "All" ? "All Risk" : r}</button>
            ))}
            <span className="h-5 w-px bg-slate-200 mx-1" />
            {["All","Approval","Scheduled","Executing","Validating"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={cn("h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-colors", statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")}>{s === "All" ? "All Status" : s}</button>
            ))}
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">
              {["Region: All","NA","EMEA","APAC","LATAM"].map((a) => <option key={a}>{a}</option>)}
            </select>
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">
              {["Service: All","Customer Portal","API Gateway","Identity","Payments","Claims","Federal Tenant"].map((a) => <option key={a}>{a}</option>)}
            </select>
            <div className="ml-auto text-[11px] text-slate-500">{filtered.length} changes</div>
          </section>

          {/* ACTIVE CHANGE BOARD + RISK MATRIX */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900">Active Change Board</h2>
                  <p className="text-[12px] text-slate-500">Live operational view of changes in flight</p>
                </div>
                <button className="text-[11px] font-semibold text-blue-700 inline-flex items-center gap-1">Open Board <ArrowUpRight className="h-3 w-3" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((c, i) => {
                  const rs = RISK_STYLE[c.risk];
                  return (
                    <motion.button
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(c)}
                      onDoubleClick={() => { setSelected(c); setWorkspaceOpen(true); }}
                      className="text-left rounded-xl border border-slate-200 bg-white p-3.5 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10.5px] font-mono font-bold text-slate-500">{c.id}</span>
                            <span className={cn("text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border", PRIORITY_STYLE[c.priority])}>{c.priority}</span>
                          </div>
                          <div className="text-[13px] font-bold text-slate-900 mt-0.5 group-hover:text-blue-700 truncate">{c.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 inline-flex items-center gap-1"><Briefcase className="h-2.5 w-2.5" /> {c.service} · <DollarSign className="h-2.5 w-2.5" />{c.revenue}</div>
                        </div>
                        <div className={cn("shrink-0 text-center rounded-lg border px-2 py-1", rs.bg, rs.border)}>
                          <div className={cn("text-[16px] font-bold tabular-nums leading-none", rs.text)}>{c.riskScore}</div>
                          <div className={cn("text-[9px] font-bold uppercase tracking-wider mt-0.5", rs.text)}>{c.risk}</div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-[10.5px]">
                        <div className="rounded-md bg-slate-50 border border-slate-100 p-1.5">
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Status</div>
                          <span className={cn("inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border", STATUS_STYLE[c.status])}>{c.status}</span>
                        </div>
                        <div className="rounded-md bg-slate-50 border border-slate-100 p-1.5">
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Approvals</div>
                          <div className="text-[11px] font-bold text-slate-900 mt-0.5 tabular-nums">{c.approvalsDone}/{c.approvalsTotal}</div>
                          <div className="h-1 rounded-full bg-slate-200 overflow-hidden mt-0.5"><motion.div className="h-full bg-violet-500" initial={{ width: 0 }} animate={{ width: `${(c.approvalsDone / c.approvalsTotal) * 100}%` }} transition={{ duration: 0.8 }} /></div>
                        </div>
                        <div className="rounded-md bg-slate-50 border border-slate-100 p-1.5">
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Window</div>
                          <div className="text-[10.5px] font-semibold text-slate-900 mt-0.5 truncate">{c.window}</div>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {c.coworkers.slice(0, 3).map((cw, ix) => (
                            <span key={ix} className="h-5 w-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-white text-[9px] font-bold border-2 border-white -ml-1 first:ml-0" title={cw}>
                              <Bot className="h-2.5 w-2.5" />
                            </span>
                          ))}
                          <span className="text-[10px] text-slate-500 ml-1">{c.coworkers.length} coworkers</span>
                        </div>
                        <span className="text-[10.5px] font-semibold text-blue-700 inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Open <ChevronRight className="h-3 w-3" /></span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Risk Matrix */}
            <div className="col-span-12 xl:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Change Risk Matrix</h3>
                  <p className="text-[11px] text-slate-500">Impact-weighted change distribution</p>
                </div>
                <Gauge className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                {RISK_MATRIX.map((r, i) => (
                  <motion.div key={r.tier} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className={cn("rounded-lg border p-2.5", r.style.bg, r.style.border)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", r.style.dot)} />
                        <span className={cn("text-[12px] font-bold", r.style.text)}>{r.tier} Risk</span>
                      </div>
                      <span className={cn("text-[14px] font-bold tabular-nums", r.style.text)}>{r.count}</span>
                    </div>
                    <div className="mt-1.5 text-[10.5px] text-slate-600 italic">{r.examples}</div>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                      <div><div className="text-slate-400 uppercase font-semibold text-[9px]">Impact</div><div className="text-slate-700 font-semibold">{r.impact}</div></div>
                      <div><div className="text-slate-400 uppercase font-semibold text-[9px]">Customer</div><div className="text-slate-700 font-semibold">{r.customer}</div></div>
                      <div><div className="text-slate-400 uppercase font-semibold text-[9px]">Revenue</div><div className="text-slate-700 font-semibold">{r.revenue}</div></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CAB + BUSINESS IMPACT + ROLLBACK */}
          <section className="grid grid-cols-12 gap-4">
            {/* CAB */}
            <div className="col-span-12 lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">CAB Dashboard</h3>
                  <p className="text-[11px] text-slate-500">Change Advisory Board posture</p>
                </div>
                <Users className="h-4 w-4 text-violet-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Pending",   v: 73,   c: "from-violet-500 to-purple-600" },
                  { l: "Approved",  v: 1127, c: "from-emerald-500 to-teal-600" },
                  { l: "Rejected",  v: 12,   c: "from-rose-500 to-red-600" },
                  { l: "Emergency", v: 4,    c: "from-amber-500 to-orange-600" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-slate-100 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{s.l}</div>
                    <div className={cn("text-[20px] font-bold tabular-nums bg-gradient-to-r bg-clip-text text-transparent", s.c)}>{s.v.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Approver Roster</div>
                <div className="space-y-1.5">
                  {[
                    { n: "CISO Bridge",   r: "Security",   sla: "98%",  pending: 8 },
                    { n: "PCI Sponsor",   r: "Compliance", sla: "100%", pending: 12 },
                    { n: "Service Owner – Portal", r: "Business", sla: "94%", pending: 4 },
                    { n: "Architecture Lead", r: "Architecture", sla: "96%", pending: 6 },
                  ].map((a) => (
                    <div key={a.n} className="flex items-center gap-2 text-[11.5px] border border-slate-100 rounded-lg p-1.5">
                      <div className="h-6 w-6 rounded-full bg-violet-100 text-violet-700 grid place-items-center text-[10px] font-bold">{a.n.split(" ").map((x) => x[0]).join("").slice(0, 2)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{a.n}</div>
                        <div className="text-[10px] text-slate-500">{a.r}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10.5px] font-semibold text-emerald-700">{a.sla} SLA</div>
                        <div className="text-[9px] text-slate-500">{a.pending} pending</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-violet-700 font-bold mb-1 inline-flex items-center gap-1"><Bot className="h-3 w-3" /> Coworker Recommendation</div>
                <div className="text-[11.5px] text-slate-700">Auto-approve 38 low-risk routine renewals with standard approver pattern. Estimated saving: <span className="font-bold">42 reviewer hours</span>.</div>
              </div>
            </div>

            {/* Business Impact */}
            <div className="col-span-12 lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Business Impact Analyzer</h3>
                  <p className="text-[11px] text-slate-500">CHG-48201 · Customer Portal Renewal</p>
                </div>
                <Briefcase className="h-4 w-4 text-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Applications",    v: "14",       i: Layers,    c: "text-blue-600" },
                  { l: "Services",        v: "8",        i: ServerCog, c: "text-indigo-600" },
                  { l: "Customers",       v: "28,000",   i: Users,     c: "text-sky-600" },
                  { l: "Revenue",         v: "$12.4M",   i: DollarSign, c: "text-emerald-600" },
                ].map((m) => (
                  <div key={m.l} className="rounded-lg border border-slate-100 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <m.i className={cn("h-3 w-3", m.c)} />
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{m.l}</div>
                    </div>
                    <div className="text-[16px] font-bold text-slate-900 mt-0.5 tabular-nums">{m.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Compliance Coverage</div>
                <div className="flex flex-wrap gap-1.5">
                  {["PCI-DSS","SOC2","NIST","ISO27001"].map((f) => (
                    <span key={f} className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 inline-flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> {f}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Impact Radar</div>
                <ResponsiveContainer width="100%" height={170}>
                  <RadarChart data={[
                    { axis: "Customer", v: 78 },
                    { axis: "Revenue",  v: 86 },
                    { axis: "Compliance", v: 92 },
                    { axis: "Service",  v: 70 },
                    { axis: "Security", v: 64 },
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Radar dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rollback Readiness */}
            <div className="col-span-12 lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Rollback Readiness</h3>
                  <p className="text-[11px] text-slate-500">Active changes recovery posture</p>
                </div>
                <RotateCcw className="h-4 w-4 text-amber-500" />
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Readiness Score</div>
                <div className="text-[36px] font-bold text-emerald-700 leading-none mt-1 tabular-nums">98<span className="text-[18px]">%</span></div>
                <div className="text-[10.5px] text-emerald-700 mt-0.5">All active changes have validated rollback plans</div>
              </div>
              <div className="mt-3 space-y-1.5">
                {[
                  { l: "Rollback Plans",   v: "287 / 287", pct: 100, c: "bg-emerald-500" },
                  { l: "Rollback Success Probability", v: "96%", pct: 96, c: "bg-emerald-500" },
                  { l: "Recovery Time Estimate", v: "≤ 8 min", pct: 92, c: "bg-blue-500" },
                  { l: "Validation Requirements", v: "Met", pct: 100, c: "bg-violet-500" },
                ].map((r) => (
                  <div key={r.l} className="rounded-lg border border-slate-100 p-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 font-medium">{r.l}</span>
                      <span className="text-slate-900 font-bold tabular-nums">{r.v}</span>
                    </div>
                    <div className="h-1 rounded-full bg-slate-200 overflow-hidden mt-1"><motion.div className={cn("h-full", r.c)} initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 1 }} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Rollback Assets</div>
              <div className="flex flex-wrap gap-1.5">
                {["Prev Cert Snapshot","Bind Config","ALB Rule","DNS Map","Health Probes"].map((a) => (
                  <span key={a} className="text-[10.5px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 inline-flex items-center gap-1"><FileText className="h-2.5 w-2.5" /> {a}</span>
                ))}
              </div>
            </div>
          </section>

          {/* MAINTENANCE WINDOW + COWORKERS */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Maintenance Window Planner</h3>
                  <p className="text-[11px] text-slate-500">Coworker-optimized scheduling</p>
                </div>
                <Calendar className="h-4 w-4 text-sky-500" />
              </div>
              <div className="space-y-2">
                {[
                  { d: "Today", t: "22:00 – 23:30 UTC", lab: "Customer Portal Renewal", region: "NA", kind: "Scheduled", color: "bg-sky-50 border-sky-200 text-sky-700" },
                  { d: "Tomorrow", t: "02:00 – 03:00 UTC", lab: "API Gateway Renewal", region: "Global", kind: "Scheduled", color: "bg-sky-50 border-sky-200 text-sky-700" },
                  { d: "Fri", t: "23:00 – 01:00 UTC", lab: "SHA-1 Migration (High Risk)", region: "EMEA", kind: "Awaiting CAB", color: "bg-violet-50 border-violet-200 text-violet-700" },
                  { d: "Sat", t: "06:00 – 10:00 UTC", lab: "Mass Renewal Wave (412 certs)", region: "Global", kind: "Approved", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                  { d: "Mon", t: "All day", lab: "Trading Blackout – No Tier-1 Changes", region: "NA", kind: "Blackout", color: "bg-slate-100 border-slate-200 text-slate-700" },
                ].map((w, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50/60">
                    <div className="w-16 text-center shrink-0">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{w.d}</div>
                      <div className="text-[11px] font-semibold text-slate-700">{w.t.split(" ")[0]}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-bold text-slate-900 truncate">{w.lab}</div>
                      <div className="text-[10.5px] text-slate-500">{w.t} · {w.region}</div>
                    </div>
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", w.color)}>{w.kind}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-sky-700 font-bold mb-1 inline-flex items-center gap-1"><Bot className="h-3 w-3" /> Window Optimizer</div>
                <div className="text-[11.5px] text-slate-700">Detected 3 lower-risk windows in APAC. Moving 12 changes saves <span className="font-bold">2.4 hrs of customer impact</span>.</div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Digital Coworker Change Team</h3>
                  <p className="text-[11px] text-slate-500">Active automation workforce</p>
                </div>
                <Bot className="h-4 w-4 text-violet-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {COWORKERS.map((cw, i) => (
                  <motion.div key={cw.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-lg border border-slate-100 p-2.5 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-white">
                        <cw.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-slate-900 truncate">{cw.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{cw.change}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[12px] font-bold text-emerald-600 tabular-nums">{cw.conf}%</div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider">Conf</div>
                      </div>
                    </div>
                    <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px]">
                      <div className="flex items-center justify-between rounded-md bg-slate-50 border border-slate-100 px-1.5 py-1">
                        <span className="text-slate-500">Actions</span><span className="font-bold text-slate-900 tabular-nums">{cw.actions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-slate-50 border border-slate-100 px-1.5 py-1">
                        <span className="text-slate-500">Approvals</span><span className={cn("font-bold tabular-nums", cw.approvals ? "text-amber-700" : "text-slate-900")}>{cw.approvals}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CHANGE CALENDAR */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900">Change Calendar – June 2026</h3>
                <p className="text-[11px] text-slate-500">Scheduled changes, CAB meetings, blackouts</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="h-7 w-7 grid place-items-center rounded-md border border-slate-200 hover:bg-slate-50"><ChevronLeft className="h-3.5 w-3.5" /></button>
                <span className="text-[12px] font-semibold text-slate-700">June 2026</span>
                <button className="h-7 w-7 grid place-items-center rounded-md border border-slate-200 hover:bg-slate-50"><ChevronRight className="h-3.5 w-3.5" /></button>
                <span className="h-5 w-px bg-slate-200 mx-1" />
                <Legend2 items={[
                  { l: "Scheduled", c: "bg-sky-500" },
                  { l: "Emergency", c: "bg-rose-500" },
                  { l: "CAB", c: "bg-violet-500" },
                  { l: "Blackout", c: "bg-slate-700" },
                ]} />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="text-center">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 0; // start at day 1 in cell 1
                const visible = day >= 1 && day <= 30;
                const events = visible ? CAL_EVENTS[day] || [] : [];
                return (
                  <div key={i} className={cn("min-h-[72px] rounded-md border p-1.5 text-[10px]",
                    visible ? "border-slate-100 bg-white" : "border-transparent bg-slate-50/40")}>
                    {visible && (
                      <>
                        <div className="text-slate-500 font-semibold tabular-nums">{day}</div>
                        <div className="mt-1 space-y-0.5">
                          {events.map((e, ix) => (
                            <div key={ix} className="rounded px-1 py-0.5 text-white text-[9.5px] font-semibold truncate cursor-pointer" style={{}}>
                              <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1 align-middle", e.color)} />
                              <span className="text-slate-700">{e.label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* INTELLIGENCE DASHBOARD */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900">Change Intelligence Dashboard</h3>
                <p className="text-[11px] text-slate-500">Trends, distribution and operational analytics</p>
              </div>
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 lg:col-span-6 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Changes by Region & Risk</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={RISK_BY_REGION} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    <Bar dataKey="low"  stackId="a" fill="#10b981" radius={[0,0,0,0]} name="Low" />
                    <Bar dataKey="med"  stackId="a" fill="#f59e0b" name="Medium" />
                    <Bar dataKey="high" stackId="a" fill="#f97316" name="High" />
                    <Bar dataKey="crit" stackId="a" fill="#e11d48" radius={[6,6,0,0]} name="Critical" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-12 lg:col-span-6 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Success vs Rollback Trend (12 mo)</div>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={SUCCESS_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="suc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis yAxisId="l" domain={[95, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    <Area yAxisId="l" type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fill="url(#suc)" name="Success %" />
                    <Line yAxisId="r" type="monotone" dataKey="rollback" stroke="#ef4444" strokeWidth={2} dot={false} name="Rollback %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-12 lg:col-span-7 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Approval, Rejection & Emergency Trend</div>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={APPROVAL_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    <Line type="monotone" dataKey="approved"  stroke="#3b82f6" strokeWidth={2} dot={false} name="Approved" />
                    <Line type="monotone" dataKey="rejected"  stroke="#94a3b8" strokeWidth={2} dot={false} name="Rejected" />
                    <Line type="monotone" dataKey="emergency" stroke="#ef4444" strokeWidth={2} dot={false} name="Emergency" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-12 lg:col-span-5 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Compliance Coverage by Framework</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={[
                    { f: "PCI-DSS", v: 99.7 },
                    { f: "SOC2",    v: 100 },
                    { f: "NIST",    v: 99.2 },
                    { f: "ISO27001",v: 98.6 },
                    { f: "HIPAA",   v: 99.8 },
                    { f: "FedRAMP", v: 99.4 },
                  ]} layout="vertical" margin={{ top: 4, right: 8, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                    <XAxis type="number" domain={[95, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis dataKey="f" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={64} />
                    <RTooltip cursor={{ fill: "rgba(16,185,129,0.06)" }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="v" radius={[0,6,6,0]} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* AUTOMATIONS */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900">Automation Layer</h3>
                <p className="text-[11px] text-slate-500">Always-on change automations</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">7 active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
              {AUTOMATIONS.map((a) => (
                <div key={a.name} className="rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center text-slate-700"><a.icon className="h-3.5 w-3.5" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-slate-900 truncate">{a.name}</div>
                      <div className="text-[10.5px] text-slate-500 truncate">{a.runs.toLocaleString()} runs · Last {a.last}</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                    <div className="rounded bg-slate-50 border border-slate-100 px-1.5 py-1">
                      <div className="text-slate-400 uppercase font-semibold text-[9px]">Success</div>
                      <div className="text-emerald-700 font-bold tabular-nums">{a.success}%</div>
                    </div>
                    <div className="rounded bg-slate-50 border border-slate-100 px-1.5 py-1">
                      <div className="text-slate-400 uppercase font-semibold text-[9px]">Saved</div>
                      <div className="text-slate-900 font-bold">{a.saved}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* EXECUTIVE OUTCOMES */}
          <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Executive Outcomes</div>
                <div className="text-[18px] font-bold mt-0.5">Production change risk, governed and automated.</div>
              </div>
              <Crown className="h-5 w-5 text-amber-300" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
              {[
                { l: "Changes Managed",   v: "18,000" },
                { l: "Success Rate",      v: "99.1%" },
                { l: "Emergency Avoided", v: "142" },
                { l: "Hours Saved",       v: "38,000" },
                { l: "Audit Evidence",    v: "249K" },
                { l: "Revenue Protected", v: "$12.4M" },
                { l: "Services Protected",v: "500" },
              ].map((m) => (
                <div key={m.l} className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">{m.l}</div>
                  <div className="text-[18px] font-bold tabular-nums">{m.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-1">Before RunOps</div>
                <ul className="text-[12px] text-slate-200 space-y-1">
                  <li>• 86% change success · 14% rollback rate</li>
                  <li>• 42-day average lead time</li>
                  <li>• 38 emergency changes / month</li>
                  <li>• Audit evidence collected manually</li>
                </ul>
              </div>
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-1">After RunOps</div>
                <ul className="text-[12px] text-slate-100 space-y-1">
                  <li>• 99.1% change success · 0.7% rollback rate</li>
                  <li>• 4-day average lead time</li>
                  <li>• 4 emergency changes / month</li>
                  <li>• 249K evidence records auto-collected</li>
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ============ DETAIL PANEL ============ */}
      <Sheet open={!!selected && !workspaceOpen} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[40vw] p-0 bg-white overflow-y-auto">
          {selected && (() => {
            const rs = RISK_STYLE[selected.risk];
            return (
              <>
                <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                  <SheetHeader>
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-mono font-bold opacity-90">{selected.id}</span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-white/10 border-white/20")}>{selected.priority}</span>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-white/10 border-white/20">{selected.status}</span>
                    </div>
                    <SheetTitle className="text-white text-[20px] mt-1">{selected.title}</SheetTitle>
                    <div className="text-[12px] opacity-90">{selected.service} · Window: {selected.window}</div>
                  </SheetHeader>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[
                      { l: "Risk",      v: `${selected.riskScore}` },
                      { l: "Revenue",   v: selected.revenue },
                      { l: "Apps",      v: `${selected.apps}` },
                      { l: "Approvals", v: `${selected.approvalsDone}/${selected.approvalsTotal}` },
                    ].map((m) => (
                      <div key={m.l} className="rounded-lg bg-white/10 border border-white/15 p-2">
                        <div className="text-[9.5px] uppercase tracking-wider opacity-80 font-bold">{m.l}</div>
                        <div className="text-[15px] font-bold">{m.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <Section title="Executive Summary"><p className="text-[12.5px] text-slate-700 leading-relaxed">{selected.reason}</p></Section>

                  <Section title="Risk Assessment">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { l: "Technical",  v: selected.riskScore, c: rs },
                        { l: "Business",   v: Math.max(8, selected.riskScore - 12), c: RISK_STYLE.Medium },
                        { l: "Security",   v: selected.priority === "Emergency" ? 88 : 36, c: RISK_STYLE.High },
                        { l: "Compliance", v: 22, c: RISK_STYLE.Low },
                      ].map((r) => (
                        <div key={r.l} className={cn("rounded-lg border p-2", r.c.bg, r.c.border)}>
                          <div className={cn("text-[10px] uppercase tracking-wider font-bold", r.c.text)}>{r.l}</div>
                          <div className={cn("text-[18px] font-bold tabular-nums", r.c.text)}>{r.v}</div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Approval Workflow">
                    <div className="space-y-1.5">
                      {Array.from({ length: selected.approvalsTotal }).map((_, i) => {
                        const done = i < selected.approvalsDone;
                        const names = ["CISO Bridge","PCI Sponsor","Service Owner","Architecture","CAB Chair","Compliance"];
                        return (
                          <div key={i} className="flex items-center gap-2 text-[11.5px] rounded-lg border border-slate-100 p-1.5">
                            <div className={cn("h-5 w-5 rounded-full grid place-items-center", done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                              {done ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            </div>
                            <span className="font-semibold text-slate-700 flex-1">{names[i] || `Approver ${i + 1}`}</span>
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", done ? "text-emerald-700" : "text-amber-700")}>{done ? "Approved" : "Pending"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Section>

                  <Section title="Execution Targets">
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-2"><div className="text-[10px] uppercase text-slate-400 font-bold">Certificates</div><div className="font-bold text-slate-900 text-[14px]">{selected.certs}</div></div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-2"><div className="text-[10px] uppercase text-slate-400 font-bold">Applications</div><div className="font-bold text-slate-900 text-[14px]">{selected.apps}</div></div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-2"><div className="text-[10px] uppercase text-slate-400 font-bold">Customers</div><div className="font-bold text-slate-900 text-[14px]">{selected.customers}</div></div>
                    </div>
                  </Section>

                  <Section title="Validation Plan">
                    <BodyList items={["Certificate chain & SAN verification","Application health probe (5/5)","Customer synthetic transaction","Downstream integration smoke test","SLO error-budget guard"]} />
                  </Section>

                  <Section title="Compliance Coverage">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.compliance.map((f) => (
                        <span key={f} className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 inline-flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> {f}</span>
                      ))}
                    </div>
                  </Section>

                  <Section title="Digital Coworkers Assigned">
                    <div className="space-y-1">
                      {selected.coworkers.map((cw) => (
                        <div key={cw} className="flex items-center gap-2 rounded-lg border border-slate-100 p-1.5 text-[11.5px]">
                          <Bot className="h-3.5 w-3.5 text-violet-600" />
                          <span className="font-semibold text-slate-800 flex-1">{cw}</span>
                          <span className="text-[10px] font-bold text-emerald-700">Active</span>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => setWorkspaceOpen(true)} className="flex-1 h-9 rounded-lg bg-blue-600 text-white text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-blue-700"><Eye className="h-3.5 w-3.5" /> Open Workspace</button>
                    <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50"><Send className="h-3.5 w-3.5" /> Approve</button>
                    <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50"><PauseCircle className="h-3.5 w-3.5" /> Hold</button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ============ WORKSPACE PANEL ============ */}
      <Sheet open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[62vw] p-0 bg-white overflow-y-auto">
          {selected && (
            <>
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <button onClick={() => setWorkspaceOpen(false)} className="h-7 w-7 grid place-items-center rounded-md border border-slate-200 hover:bg-white"><X className="h-3.5 w-3.5" /></button>
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white"><Workflow className="h-3.5 w-3.5" /></div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Deployment Command Center</div>
                    <div className="text-[15px] font-bold text-slate-900">{selected.id} · {selected.title}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button className="h-8 px-3 text-[11.5px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Rollback Plan</button>
                    <button className="h-8 px-3 text-[11.5px] font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1.5"><PlayCircle className="h-3.5 w-3.5" /> Execute</button>
                  </div>
                </div>
              </div>
              <div className="p-5 grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-8 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2">Execution Timeline</div>
                    <div className="relative pl-4">
                      <div className="absolute left-1.5 top-1 bottom-1 w-px bg-slate-200" />
                      {[
                        { t: "22:00 UTC", l: "Pre-flight checks", s: "done" },
                        { t: "22:08 UTC", l: "Issue new certificate from internal PKI", s: "done" },
                        { t: "22:14 UTC", l: "Stage to deployment targets (14 apps)", s: "active" },
                        { t: "22:22 UTC", l: "Atomic switchover with health gating", s: "pending" },
                        { t: "22:30 UTC", l: "Customer synthetic validation", s: "pending" },
                        { t: "22:45 UTC", l: "Close & archive evidence", s: "pending" },
                      ].map((step, i) => (
                        <div key={i} className="relative pl-4 pb-3 last:pb-0">
                          <span className={cn("absolute left-[-7px] top-0.5 h-3 w-3 rounded-full border-2 border-white",
                            step.s === "done" ? "bg-emerald-500" : step.s === "active" ? "bg-blue-500 animate-pulse" : "bg-slate-300")} />
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{step.t}</div>
                          <div className="text-[12px] font-semibold text-slate-800">{step.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2">Deployment Targets</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-lg border border-slate-100 p-2 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-700">node-{(i + 1).toString().padStart(2, "0")}</span>
                            <span className={cn("h-1.5 w-1.5 rounded-full", i < 3 ? "bg-emerald-500" : i === 3 ? "bg-blue-500 animate-pulse" : "bg-slate-300")} />
                          </div>
                          <div className="text-slate-500 text-[10.5px] mt-0.5">{["AWS us-east-1","AWS us-west-2","Azure eastus","GCP us-central","AWS eu-west","AWS ap-south"][i]}</div>
                          <div className={cn("text-[10px] font-bold mt-1", i < 3 ? "text-emerald-700" : i === 3 ? "text-blue-700" : "text-slate-500")}>
                            {i < 3 ? "Deployed" : i === 3 ? "Deploying" : "Queued"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2">Live Health Probes</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={Array.from({ length: 20 }).map((_, i) => ({
                        t: i, ok: 200 + Math.round(Math.sin(i / 2) * 8 + (i > 12 ? 6 : 0)),
                        lat: 110 - Math.round(Math.sin(i / 3) * 12) + (i > 12 ? -8 : 0),
                      }))} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                        <XAxis dataKey="t" hide />
                        <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Line yAxisId="l" type="monotone" dataKey="ok"  stroke="#10b981" strokeWidth={2} dot={false} name="HTTP 200/s" />
                        <Line yAxisId="r" type="monotone" dataKey="lat" stroke="#3b82f6" strokeWidth={2} dot={false} name="Latency (ms)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5"><Bot className="h-3.5 w-3.5 text-violet-600" /> Coworker Actions</div>
                    <ul className="space-y-1.5">
                      {[
                        "Renewal Coordinator: certificate generated (RSA-3072)",
                        "Deployment Engineer: staging complete on 3 nodes",
                        "Validation Engineer: pre-checks passed",
                        "Compliance Auditor: evidence bundle initialized",
                      ].map((a) => (
                        <li key={a} className="text-[11.5px] text-slate-700 flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" /> {a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5 text-amber-600" /> Rollback Plan</div>
                    <BodyList items={["Snapshot of previous cert pinned","Atomic revert with health gating","Estimated recovery: ≤ 6 min","Auto-trigger if probe success < 95%"]} />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5"><FileSearch className="h-3.5 w-3.5 text-blue-600" /> Evidence Capture</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {["Cert metadata","Approvals","Probe results","CT log entry","Audit hash","Rollback test"].map((e) => (
                        <span key={e} className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-slate-700 font-semibold inline-flex items-center gap-1"><FileText className="h-2.5 w-2.5" /> {e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Legend2({ items }: { items: { l: string; c: string }[] }) {
  return (
    <div className="flex items-center gap-2 text-[10px] text-slate-500">
      {items.map((i) => (
        <span key={i.l} className="inline-flex items-center gap-1"><span className={cn("h-1.5 w-1.5 rounded-full", i.c)} /> {i.l}</span>
      ))}
    </div>
  );
}
function Section({ title, children }: any) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">{title}</div>
      {children}
    </div>
  );
}
function BodyList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((i) => (
        <li key={i} className="text-[12.5px] text-slate-700 flex items-start gap-1.5">
          <ChevronRight className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" /> {i}
        </li>
      ))}
    </ul>
  );
}
