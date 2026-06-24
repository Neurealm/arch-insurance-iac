import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Activity, AlertTriangle, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch,
  FileText, GitBranch, Globe, HelpCircle, KeyRound, LayoutDashboard, Package, Plug,
  RefreshCw, ScrollText, Scale, Search, Server, ServerCog, ShieldAlert, ShieldCheck,
  UserCog, Users, Zap, Cloud, Network, X, Play, Layers, ChevronRight, Sparkles,
  Compass, UserSearch, FilePlus, ShieldQuestion, BadgeCheck, Rocket, Repeat, RotateCcw,
  CircleSlash, Archive, Clock, TrendingUp, DollarSign, Flame, AlertCircle, CheckCircle2,
  PauseCircle, Workflow, GitMerge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ============== SIDEBAR (consistent with sibling pages) ==============
const navSections = [
  { label: "Command Center", items: [
    { id: "ops", label: "Operations Overview", icon: LayoutDashboard, to: "/enterprise-certificate-management" },
    { id: "risk", label: "Risk & Exposure", icon: ShieldAlert, to: "/enterprise-certificate-management/risk-exposure" },
    { id: "map", label: "Global Map", icon: Globe, to: "/enterprise-certificate-management/global-map" },
    { id: "life", label: "Lifecycle", icon: Activity, active: true },
    { id: "biz", label: "Business Services", icon: Briefcase, to: "/enterprise-certificate-management/business-services" },
    { id: "rep", label: "Reports", icon: FileText, to: "/enterprise-certificate-management/reports" },
  ]},
  { label: "Operations", items: [
    { id: "auto", label: "Agentic Execution Center", icon: Sparkles, to: "/enterprise-certificate-management/agentic-execution" },
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers" },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center" },
    { id: "cm", label: "Change Manager", icon: GitBranch, to: "/enterprise-certificate-management/change-manager" },
    { id: "int", label: "Integrations", icon: Plug, to: "/enterprise-certificate-management/integrations" },
  ]},
  { label: "Security & Compliance", items: [
    { id: "sec", label: "Security Posture", icon: ShieldCheck, to: "/enterprise-certificate-management/security-posture" },
    { id: "com", label: "Compliance Center", icon: BookCheck, to: "/enterprise-certificate-management/compliance-center" },
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
                  it.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
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
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Digital Coworker Status</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">12</span>
          <span className="text-xs opacity-80">Active</span>
        </div>
        <div className="text-xs opacity-90">249,000 Tasks YTD</div>
        <button className="mt-3 text-xs font-semibold underline-offset-2 hover:underline">View All Coworkers →</button>
      </div>
    </motion.aside>
  );
}

// ============== HEADER ==============
function Header() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
      className="sticky top-0 z-20 bg-white border-b border-slate-200"
    >
      <div className="px-6 py-3 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-slate-500 font-medium">neurealm RunOps · Enterprise Certificate Operations</div>
          <h1 className="text-[20px] font-bold text-slate-900 leading-tight truncate">
            Enterprise Certificate Lifecycle Journey
          </h1>
          <div className="text-[12px] text-slate-500">
            The certificate itself is not the challenge — managing the lifecycle across people, systems, risk, compliance, and operations is.
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-[300px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="bg-transparent outline-none text-sm flex-1" placeholder="Search stages, teams, coworkers" />
        </div>
        <div className="flex items-center gap-1.5">
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"><RefreshCw className="h-4 w-4" /></button>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600 relative">
            <Bell className="h-4 w-4" /><span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"><HelpCircle className="h-4 w-4" /></button>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"><Cog className="h-4 w-4" /></button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center text-white text-xs font-bold">SA</div>
        </div>
      </div>
      <div className="px-6 pb-2 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span>Data as of: <strong className="text-slate-700">Jun 23, 2025 10:24 AM EDT</strong></span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live telemetry</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Tenant: <strong className="text-slate-700">Palo Alto Networks</strong></span>
          <span>Window: <strong className="text-slate-700">Trailing 12 months</strong></span>
        </div>
      </div>
    </motion.header>
  );
}

// ============== COUNT-UP ==============
function CountUp({ value, prefix = "", suffix = "", decimals = 0, duration = 1.2 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - k, 3);
      setN(value * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);
  const formatted = decimals > 0
    ? n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(n).toLocaleString();
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

// ============== KPI LAYER ==============
const KPIS = [
  { id: "cert", label: "Certificates Managed", value: 42000, icon: ShieldCheck, tone: "blue" },
  { id: "ren", label: "Annual Renewals", value: 18000, icon: Repeat, tone: "blue" },
  { id: "human", label: "Human Touchpoints", value: 12400, icon: Users, tone: "amber" },
  { id: "agentic", label: "Agentic Actions", value: 249000, icon: Bot, tone: "violet" },
  { id: "autoCov", label: "Automation Coverage", value: 82, suffix: "%", icon: Zap, tone: "emerald" },
  { id: "agCov", label: "Agentic Coverage", value: 61, suffix: "%", icon: Sparkles, tone: "violet" },
  { id: "cycle", label: "Avg Renewal Cycle", value: 7.4, decimals: 1, suffix: " d", icon: Clock, tone: "blue" },
  { id: "inc", label: "Cert-Related Incidents", value: 18, icon: AlertTriangle, tone: "rose" },
  { id: "hrs", label: "Annual Hours Consumed", value: 38000, icon: Activity, tone: "amber" },
  { id: "val", label: "Annual Value Delivered", value: 4.55, decimals: 2, prefix: "$", suffix: "M", icon: DollarSign, tone: "emerald" },
];
const toneCls: Record<string, { bg: string; text: string; ring: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
};

function KpiLayer() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-3 px-6 pt-4">
      {KPIS.map((k: any, i) => {
        const t = toneCls[k.tone];
        return (
          <motion.div key={k.id}
            initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.04, duration: 0.4 }}
            className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10.5px] text-slate-500 font-medium truncate">{k.label}</div>
                <div className="text-[19px] font-bold text-slate-900 leading-tight mt-0.5 tabular-nums">
                  <CountUp value={k.value} prefix={k.prefix || ""} suffix={k.suffix || ""} decimals={k.decimals || 0} />
                </div>
              </div>
              <span className={cn("h-7 w-7 rounded-lg grid place-items-center ring-4 shrink-0", t.bg, t.text, t.ring)}>
                <k.icon className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============== LIFECYCLE STAGES ==============
type StageHealth = "green" | "yellow" | "red" | "blue";
type Stage = {
  id: string; label: string; icon: any;
  volume: string; success: string; sla: string; human: string; auto: string; agentic: string;
  health: StageHealth;
  frictions: string[];
};

const STAGES: Stage[] = [
  { id: "discovery",  label: "Discovery",  icon: Compass,        volume: "42,000", success: "97%", sla: "Low", human: "120 h", auto: "92%", agentic: "74%", health: "blue",  frictions: [] },
  { id: "ownership",  label: "Ownership",  icon: UserSearch,     volume: "38,400", success: "78%", sla: "High", human: "2,800 h", auto: "41%", agentic: "33%", health: "red", frictions: ["Ownership Unknown"] },
  { id: "request",    label: "Request",    icon: FilePlus,       volume: "18,200", success: "94%", sla: "Med", human: "1,140 h", auto: "68%", agentic: "44%", health: "yellow", frictions: [] },
  { id: "approval",   label: "Approval",   icon: ShieldQuestion, volume: "18,000", success: "88%", sla: "High", human: "3,200 h", auto: "32%", agentic: "21%", health: "red", frictions: ["Manual Approval Queue", "Change Freeze"] },
  { id: "issuance",   label: "Issuance",   icon: BadgeCheck,     volume: "17,800", success: "99%", sla: "Low", human: "240 h",   auto: "96%", agentic: "62%", health: "green", frictions: ["CA Availability"] },
  { id: "deployment", label: "Deployment", icon: Rocket,         volume: "17,200", success: "84%", sla: "High", human: "2,640 h", auto: "61%", agentic: "47%", health: "yellow", frictions: ["Deployment Dependency"] },
  { id: "validation", label: "Validation", icon: CheckCircle2,   volume: "17,200", success: "92%", sla: "Med", human: "880 h",   auto: "78%", agentic: "58%", health: "yellow", frictions: ["Failed Validation", "DNS Validation Failure"] },
  { id: "renewal",    label: "Renewal",    icon: Repeat,         volume: "16,800", success: "91%", sla: "Med", human: "1,420 h", auto: "84%", agentic: "67%", health: "green", frictions: [] },
  { id: "rotation",   label: "Rotation",   icon: RotateCcw,      volume: "6,400",  success: "95%", sla: "Low", human: "320 h",   auto: "88%", agentic: "71%", health: "blue",  frictions: [] },
  { id: "revocation", label: "Revocation", icon: CircleSlash,    volume: "1,240",  success: "97%", sla: "Med", human: "180 h",   auto: "74%", agentic: "55%", health: "green", frictions: ["Policy Exception"] },
  { id: "retirement", label: "Retirement", icon: Archive,        volume: "2,800",  success: "93%", sla: "Low", human: "210 h",   auto: "70%", agentic: "48%", health: "green", frictions: ["Expired Certificate"] },
];

const healthCls: Record<StageHealth, { bg: string; border: string; text: string; chip: string; dot: string; bar: string }> = {
  green:  { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", chip: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  yellow: { bg: "bg-amber-50",   border: "border-amber-300",   text: "text-amber-700",   chip: "bg-amber-100 text-amber-700",   dot: "bg-amber-500",   bar: "bg-amber-500" },
  red:    { bg: "bg-rose-50",    border: "border-rose-300",    text: "text-rose-700",    chip: "bg-rose-100 text-rose-700",    dot: "bg-rose-500",    bar: "bg-rose-500" },
  blue:   { bg: "bg-sky-50",     border: "border-sky-300",     text: "text-sky-700",     chip: "bg-sky-100 text-sky-700",     dot: "bg-sky-500",     bar: "bg-sky-500" },
};

// ============== SWIM LANES ==============
const TEAM_LANE: Record<string, { teams: string; hours: string }> = {
  discovery:  { teams: "PKI · Security",              hours: "120 h" },
  ownership:  { teams: "PKI · Application · Compliance", hours: "2,800 h" },
  request:    { teams: "Application · Cloud",         hours: "1,140 h" },
  approval:   { teams: "Change Mgmt · Security",      hours: "3,200 h" },
  issuance:   { teams: "PKI",                         hours: "240 h" },
  deployment: { teams: "Infrastructure · Cloud · App", hours: "2,640 h" },
  validation: { teams: "Operations · Application",    hours: "880 h" },
  renewal:    { teams: "PKI · Application",           hours: "1,420 h" },
  rotation:   { teams: "PKI · Cloud",                 hours: "320 h" },
  revocation: { teams: "Security · PKI",              hours: "180 h" },
  retirement: { teams: "Operations · Compliance",     hours: "210 h" },
};
const AUTO_LANE: Record<string, { name: string; exec: string; success: string; saved: string }> = {
  discovery:  { name: "Certificate Discovery",       exec: "1.4M",   success: "99.1%", saved: "3,200 h" },
  ownership:  { name: "CMDB Synchronization",        exec: "180K",   success: "82%",   saved: "920 h" },
  request:    { name: "Auto Enrollment",             exec: "18K",    success: "94%",   saved: "640 h" },
  approval:   { name: "Change Ticket Creation",      exec: "18K",    success: "97%",   saved: "880 h" },
  issuance:   { name: "Auto Issuance (ACME)",        exec: "17.8K",  success: "99.6%", saved: "1,120 h" },
  deployment: { name: "Auto Deployment",             exec: "12.4K",  success: "87%",   saved: "1,840 h" },
  validation: { name: "Auto Validation",             exec: "17.2K",  success: "94%",   saved: "520 h" },
  renewal:    { name: "Auto Renewal",                exec: "16.8K",  success: "96%",   saved: "2,400 h" },
  rotation:   { name: "Key Rotation Engine",         exec: "6.4K",   success: "98%",   saved: "880 h" },
  revocation: { name: "Revocation Orchestrator",     exec: "1.2K",   success: "99%",   saved: "210 h" },
  retirement: { name: "Audit Evidence Collection",   exec: "2.8K",   success: "97%",   saved: "180 h" },
};
const AGENT_LANE: Record<string, { name: string; confidence: number; tasks: string; saved: string; escalation: string }> = {
  discovery:  { name: "Certificate Discovery Engineer", confidence: 94, tasks: "1.4M",  saved: "3,200 h", escalation: "1.2%" },
  ownership:  { name: "Ownership Intelligence Agent",   confidence: 88, tasks: "240K",  saved: "1,640 h", escalation: "6.8%" },
  request:    { name: "Renewal Coordinator",            confidence: 91, tasks: "18K",   saved: "740 h",   escalation: "3.4%" },
  approval:   { name: "Compliance Auditor",             confidence: 86, tasks: "18K",   saved: "920 h",   escalation: "9.1%" },
  issuance:   { name: "Certificate Risk Analyst",       confidence: 96, tasks: "17.8K", saved: "1,180 h", escalation: "0.8%" },
  deployment: { name: "Deployment Engineer",            confidence: 89, tasks: "12.4K", saved: "2,040 h", escalation: "4.6%" },
  validation: { name: "Validation Analyst",             confidence: 92, tasks: "17.2K", saved: "680 h",   escalation: "2.8%" },
  renewal:    { name: "Renewal Coordinator",            confidence: 95, tasks: "16.8K", saved: "2,640 h", escalation: "1.4%" },
  rotation:   { name: "Cryptography Advisor",           confidence: 93, tasks: "6.4K",  saved: "920 h",   escalation: "2.1%" },
  revocation: { name: "Security Investigator",          confidence: 90, tasks: "1.2K",  saved: "260 h",   escalation: "5.2%" },
  retirement: { name: "Compliance Auditor",             confidence: 87, tasks: "2.8K",  saved: "210 h",   escalation: "4.4%" },
};

// ============== PANE CONTENT ==============
type Pane = {
  title: string;
  subtitle: string;
  intro: string;
  groups: { label: string; rows: { k: string; v: string; tone?: "red" | "amber" | "slate" | "green" }[] }[];
  coworker: { name: string; confidence: number; saved: string };
  automation: { name: string; coverage: string };
  workbench: string;
};
const PANES: Record<string, Pane> = {
  discovery: {
    title: "Discovery", subtitle: "Find every certificate, everywhere",
    intro: "Discovery establishes the source of truth. Without it, every downstream stage is operating blind.",
    groups: [
      { label: "Discovery Sources", rows: [
        { k: "Network Scans", v: "Continuous · 142 subnets" },
        { k: "Cloud APIs", v: "AWS · Azure · GCP" },
        { k: "CMDB", v: "ServiceNow · 32 imports/day" },
        { k: "Certificate Authorities", v: "7 issuers federated" },
      ]},
      { label: "Inventory Coverage", rows: [
        { k: "Visible certificates", v: "42,000", tone: "green" },
        { k: "Shadow certificates", v: "1,840", tone: "amber" },
        { k: "Unknown assets", v: "412", tone: "red" },
      ]},
    ],
    coworker: { name: "Certificate Discovery Engineer", confidence: 94, saved: "3,200 h / yr" },
    automation: { name: "Discovery Automation + CMDB Sync", coverage: "92% inventory coverage" },
    workbench: "Discovery Workbench",
  },
  ownership: {
    title: "Ownership", subtitle: "Map every certificate to a business owner",
    intro: "Unknown ownership is the #1 source of certificate-driven outages — 38% of all failures originate here.",
    groups: [
      { label: "Ownership Coverage", rows: [
        { k: "Known owners", v: "76%", tone: "amber" },
        { k: "Unknown owners", v: "9,840", tone: "red" },
        { k: "Stale owners (>180d)", v: "2,120", tone: "amber" },
      ]},
      { label: "Mapping", rows: [
        { k: "Business service mapping", v: "82% complete" },
        { k: "Application mapping", v: "71% complete", tone: "amber" },
        { k: "Organizational risk", v: "High (concentration in 4 teams)", tone: "red" },
      ]},
    ],
    coworker: { name: "Ownership Intelligence Agent", confidence: 88, saved: "1,640 h / yr" },
    automation: { name: "Ownership Correlation Engine", coverage: "Resolves 64% of unknowns" },
    workbench: "Ownership Analysis",
  },
  request: {
    title: "Request", subtitle: "Standardized intake for every certificate request",
    intro: "Self-service intake with policy-aware templates eliminates 80% of clarifying tickets.",
    groups: [
      { label: "Intake Channels", rows: [
        { k: "Self-service portal", v: "62%" },
        { k: "API / IaC", v: "28%" },
        { k: "Manual ticket", v: "10%", tone: "amber" },
      ]},
      { label: "Template Quality", rows: [
        { k: "Policy-compliant submissions", v: "94%" },
        { k: "Rework rate", v: "6%", tone: "amber" },
      ]},
    ],
    coworker: { name: "Renewal Coordinator", confidence: 91, saved: "740 h / yr" },
    automation: { name: "Auto Enrollment", coverage: "68% requests fully automated" },
    workbench: "Request Intake Console",
  },
  approval: {
    title: "Approval", subtitle: "Risk-aware, traceable governance",
    intro: "Approval chains are the largest source of cycle-time delay. RunOps shortens the median from 36h to 4h.",
    groups: [
      { label: "Approval Chains", rows: [
        { k: "Avg approvers", v: "3.4" },
        { k: "Avg approval time", v: "4.2 h", tone: "green" },
        { k: "Escalations / month", v: "78", tone: "amber" },
        { k: "SLA risk", v: "12% of requests", tone: "red" },
      ]},
      { label: "Governance", rows: [
        { k: "Change advisory board", v: "Tier 1 only" },
        { k: "Policy exceptions", v: "11 active" },
      ]},
    ],
    coworker: { name: "Compliance Auditor", confidence: 86, saved: "920 h / yr" },
    automation: { name: "Change Ticket Creation", coverage: "97% auto-created" },
    workbench: "Governance Workspace",
  },
  issuance: {
    title: "Issuance", subtitle: "Trusted certificate creation at scale",
    intro: "ACME and HSM-backed issuance pipelines run at 99.6% success across 7 CAs.",
    groups: [
      { label: "Issuance Mix", rows: [
        { k: "ACME", v: "78%" },
        { k: "EST / SCEP", v: "14%" },
        { k: "Manual CSR", v: "8%", tone: "amber" },
      ]},
      { label: "Authorities", rows: [
        { k: "External CAs", v: "DigiCert, Let's Encrypt, Sectigo" },
        { k: "Internal PKI", v: "Microsoft ADCS · HashiCorp Vault" },
      ]},
    ],
    coworker: { name: "Certificate Risk Analyst", confidence: 96, saved: "1,180 h / yr" },
    automation: { name: "Auto Issuance (ACME)", coverage: "96% issuance automated" },
    workbench: "Issuance Console",
  },
  deployment: {
    title: "Deployment", subtitle: "Push certs to every endpoint that needs them",
    intro: "Deployment is the second-highest source of operational friction — 17% of failures live here.",
    groups: [
      { label: "Targets", rows: [
        { k: "Servers", v: "8,000" },
        { k: "Load Balancers", v: "320" },
        { k: "Kubernetes ingresses", v: "1,840" },
        { k: "Cloud services", v: "Azure, AWS, GCP · 35 accounts" },
      ]},
      { label: "Safety", rows: [
        { k: "Application dependencies tracked", v: "84%", tone: "amber" },
        { k: "Rollback plans on file", v: "92%", tone: "green" },
      ]},
    ],
    coworker: { name: "Deployment Engineer", confidence: 89, saved: "2,040 h / yr" },
    automation: { name: "Auto Deployment", coverage: "61% endpoints automated" },
    workbench: "Deployment Control Center",
  },
  validation: {
    title: "Validation", subtitle: "Prove the cert works end-to-end",
    intro: "Active TLS, chain, and synthetic transaction validation catch 94% of regressions before customers do.",
    groups: [
      { label: "Checks", rows: [
        { k: "TLS handshake", v: "99.4%" },
        { k: "Chain validation", v: "98.1%" },
        { k: "Endpoint testing", v: "96.2%" },
        { k: "Application health", v: "92%", tone: "amber" },
        { k: "Customer impact validation", v: "synthetic probes / 60s" },
      ]},
    ],
    coworker: { name: "Validation Analyst", confidence: 92, saved: "680 h / yr" },
    automation: { name: "Auto Validation", coverage: "78% automated checks" },
    workbench: "Validation Console",
  },
  renewal: {
    title: "Renewal", subtitle: "Renew before risk materializes",
    intro: "Renewal pipelines are armed across 96% of certificates and forecast 90 days ahead.",
    groups: [
      { label: "Upcoming Renewals", rows: [
        { k: "Next 7 days", v: "82", tone: "red" },
        { k: "Next 30 days", v: "287", tone: "amber" },
        { k: "Next 90 days", v: "1,640" },
      ]},
      { label: "Reliability", rows: [
        { k: "Renewal success rate", v: "96%", tone: "green" },
        { k: "CA dependencies", v: "7 issuers, 2 backups" },
      ]},
    ],
    coworker: { name: "Renewal Coordinator", confidence: 95, saved: "2,640 h / yr" },
    automation: { name: "Auto Renewal", coverage: "84% renewals automated" },
    workbench: "Renewal Planner",
  },
  rotation: {
    title: "Rotation", subtitle: "Rotate keys without touching the cert",
    intro: "HSM-backed key rotation supports zero-downtime cipher upgrades.",
    groups: [
      { label: "Rotation Cadence", rows: [
        { k: "Default cadence", v: "90 days" },
        { k: "High-sensitivity cadence", v: "30 days" },
        { k: "Last cycle success", v: "98%", tone: "green" },
      ]},
    ],
    coworker: { name: "Cryptography Advisor", confidence: 93, saved: "920 h / yr" },
    automation: { name: "Key Rotation Engine", coverage: "88% keys automated" },
    workbench: "Cryptography Workspace",
  },
  revocation: {
    title: "Revocation", subtitle: "React fast when trust is broken",
    intro: "Revocation orchestrator coordinates CRL/OCSP, cert-bound endpoints, and IR within 12 minutes.",
    groups: [
      { label: "Triggers", rows: [
        { k: "Compromised keys (YTD)", v: "4", tone: "red" },
        { k: "Unauthorized certificates", v: "11", tone: "amber" },
        { k: "Policy-driven revocations", v: "42" },
      ]},
      { label: "Response", rows: [
        { k: "Avg time to revoke", v: "12 min", tone: "green" },
        { k: "Blast-radius briefings", v: "auto-generated" },
      ]},
    ],
    coworker: { name: "Security Investigation Analyst", confidence: 90, saved: "260 h / yr" },
    automation: { name: "Revocation Orchestrator", coverage: "74% workflows automated" },
    workbench: "Security Investigation Center",
  },
  retirement: {
    title: "Retirement", subtitle: "Clean exit with audit-grade evidence",
    intro: "Retirement closes the loop with attested evidence for SOC 2, ISO 27001, and PCI auditors.",
    groups: [
      { label: "Retirement", rows: [
        { k: "Certificates retired (YTD)", v: "2,800" },
        { k: "Evidence packs generated", v: "100%", tone: "green" },
        { k: "Orphaned bindings", v: "0", tone: "green" },
      ]},
    ],
    coworker: { name: "Compliance Auditor", confidence: 87, saved: "210 h / yr" },
    automation: { name: "Audit Evidence Collection", coverage: "97% auto-captured" },
    workbench: "Compliance Workspace",
  },
};

// ============== STAGE CARD ==============
function StageCard({ s, idx, onClick, onDouble, onHover }: {
  s: Stage; idx: number;
  onClick: () => void; onDouble: () => void; onHover: (id: string | null) => void;
}) {
  const h = healthCls[s.health];
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + idx * 0.07, duration: 0.45 }}
            onClick={onClick} onDoubleClick={onDouble}
            onMouseEnter={() => onHover(s.id)} onMouseLeave={() => onHover(null)}
            className={cn(
              "relative w-[170px] shrink-0 rounded-xl border bg-white p-3 text-left shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
              h.border,
            )}
          >
            {/* friction pills removed */}

            <div className="flex items-center gap-2 mb-2">
              <span className={cn("h-8 w-8 rounded-lg grid place-items-center", h.bg, h.text)}>
                <s.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-semibold">STAGE {idx + 1}</div>
                <div className="text-[13px] font-bold text-slate-900 leading-tight truncate">{s.label}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10.5px]">
              <div className="text-slate-400">Volume</div><div className="text-slate-800 font-semibold text-right tabular-nums">{s.volume}</div>
              <div className="text-slate-400">Success</div><div className="text-emerald-600 font-semibold text-right">{s.success}</div>
              <div className="text-slate-400">SLA risk</div><div className={cn("font-semibold text-right", s.sla === "High" ? "text-rose-600" : s.sla === "Med" ? "text-amber-600" : "text-slate-600")}>{s.sla}</div>
              <div className="text-slate-400">Human</div><div className="text-slate-800 font-semibold text-right">{s.human}</div>
              <div className="text-slate-400">Auto</div><div className="text-blue-600 font-semibold text-right">{s.auto}</div>
              <div className="text-slate-400">Agentic</div><div className="text-violet-600 font-semibold text-right">{s.agentic}</div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={cn("inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded", h.chip)}>
                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", h.dot)} />
                {s.health === "blue" ? "Optimized" : s.health === "green" ? "Healthy" : s.health === "yellow" ? "At risk" : "Friction"}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            </div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="font-semibold">{s.label}</div>
          <div className="text-slate-500">Click for details · Double-click for workbench</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============== VALUE STREAM (stages + flow line + swim lanes) ==============
function ValueStream({ onPick, onDeep }: { onPick: (id: string) => void; onDeep: (id: string) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className="px-6 pt-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/80 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 inline-flex items-center gap-2">
              <Workflow className="h-4 w-4 text-blue-600" /> Certificate Lifecycle Value Stream
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">11 stages · 8 teams · 11 digital coworkers · continuous operation</p>
          </div>
          <div className="flex items-center gap-3 text-[10.5px] text-slate-500">
            {(["blue", "green", "yellow", "red"] as StageHealth[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", healthCls[s].dot)} />
                {s === "blue" ? "Optimized" : s === "green" ? "Healthy" : s === "yellow" ? "At risk" : "Friction"}
              </span>
            ))}
          </div>
        </div>

        {/* Flow + stage cards */}
        <div className="relative overflow-x-auto pb-2">
          {/* animated horizontal flow line behind cards */}
          <div className="absolute left-0 right-0 top-[88px] h-[3px] bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 rounded-full">
            <motion.div
              initial={{ x: "-30%" }} animate={{ x: "130%" }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="h-full w-[20%] bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"
            />
          </div>
          <div className="relative flex items-start gap-3 min-w-max pt-3">
            {STAGES.map((s, i) => (
              <div key={s.id} className="flex items-start gap-3">
                <StageCard s={s} idx={i} onClick={() => onPick(s.id)} onDouble={() => onDeep(s.id)} onHover={setHover} />
                {i < STAGES.length - 1 && (
                  <div className="self-center text-slate-300 -mx-1"><ChevronRight className="h-4 w-4" /></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Swim lanes */}
        <div className="mt-5 space-y-2 overflow-x-auto">
          <SwimLane title="Human Touchpoints" icon={Users} accent="amber"
            cells={STAGES.map((s) => ({ id: s.id, primary: TEAM_LANE[s.id].teams, secondary: TEAM_LANE[s.id].hours, active: hover === s.id }))}
          />
          <SwimLane title="Automation" icon={Zap} accent="blue"
            cells={STAGES.map((s) => {
              const a = AUTO_LANE[s.id];
              return { id: s.id, primary: a.name, secondary: `${a.exec} · ${a.success} · ${a.saved} saved`, active: hover === s.id };
            })}
          />
          <SwimLane title="Digital Coworkers" icon={Bot} accent="violet"
            cells={STAGES.map((s) => {
              const a = AGENT_LANE[s.id];
              return { id: s.id, primary: a.name, secondary: `${a.confidence}% conf · ${a.tasks} tasks · ${a.escalation} esc`, active: hover === s.id };
            })}
          />
        </div>
      </div>
    </div>
  );
}

function SwimLane({ title, icon: Icon, accent, cells }: {
  title: string; icon: any; accent: "amber" | "blue" | "violet";
  cells: { id: string; primary: string; secondary: string; active?: boolean }[];
}) {
  const accentMap = {
    amber:  { bg: "bg-amber-50",  text: "text-amber-700",  ring: "ring-amber-100" },
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   ring: "ring-blue-100" },
    violet: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-100" },
  } as const;
  const a = accentMap[accent];
  return (
    <div className="flex items-stretch gap-3 min-w-max">
      <div className={cn("w-[160px] shrink-0 rounded-lg border border-slate-200 p-2.5 flex items-center gap-2", a.bg)}>
        <span className={cn("h-7 w-7 rounded-md grid place-items-center bg-white", a.text)}><Icon className="h-3.5 w-3.5" /></span>
        <div className="text-[11.5px] font-bold text-slate-800 leading-tight">{title}</div>
      </div>
      {cells.map((c) => (
        <motion.div key={c.id}
          animate={{ scale: c.active ? 1.02 : 1, boxShadow: c.active ? "0 4px 12px rgba(30,64,175,0.1)" : "0 0 0 rgba(0,0,0,0)" }}
          className={cn(
            "w-[170px] shrink-0 rounded-lg border bg-white p-2.5",
            c.active ? "border-blue-300" : "border-slate-200",
          )}>
          <div className="text-[11px] font-semibold text-slate-800 leading-tight truncate">{c.primary}</div>
          <div className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">{c.secondary}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ============== FAILURE HEAT MAP + SLA DASHBOARD ==============
const FAILURES = [
  { label: "Unknown Owner", pct: 38 },
  { label: "Approval Delays", pct: 22 },
  { label: "Deployment Issues", pct: 17 },
  { label: "Validation Errors", pct: 11 },
  { label: "Expired Certificates", pct: 7 },
  { label: "CA Failures", pct: 5 },
];
const heatColor = (p: number) =>
  p >= 30 ? "bg-rose-500" : p >= 15 ? "bg-orange-400" : p >= 8 ? "bg-amber-400" : "bg-emerald-400";

function FailureAndSLA() {
  return (
    <div className="px-6 pt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-slate-900 inline-flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-600" /> Failure Heat Map
          </h3>
          <span className="text-[11px] text-slate-500">Distribution of certificate failures (YTD)</span>
        </div>
        <div className="space-y-2">
          {FAILURES.map((f, i) => (
            <motion.div key={f.label}
              initial={{ width: 0, opacity: 0 }} animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 1.3 + i * 0.08, duration: 0.5 }}
            >
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="text-slate-700 font-medium">{f.label}</span>
                <span className="text-slate-500 tabular-nums">{f.pct}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${f.pct * 2.4}%` }}
                  transition={{ delay: 1.3 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                  className={cn("h-full rounded-full", heatColor(f.pct))}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-slate-900 inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" /> SLA Risk Dashboard
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          {[
            { k: "Certificates Near Expiration", v: "287", tone: "amber" },
            { k: "Critical Services At Risk", v: "42", tone: "red" },
            { k: "Potential Outages", v: "18", tone: "red" },
            { k: "Revenue Exposure", v: "$12.4M", tone: "red" },
            { k: "Customers Impacted", v: "28,000", tone: "amber" },
            { k: "Compliance Exposure", v: "7 Frameworks", tone: "slate" },
          ].map((r) => (
            <div key={r.k} className="rounded-lg border border-slate-200 p-2.5">
              <div className="text-[10.5px] text-slate-500">{r.k}</div>
              <div className={cn("text-[15px] font-bold mt-0.5",
                r.tone === "red" ? "text-rose-600" : r.tone === "amber" ? "text-amber-600" : "text-slate-800")}>{r.v}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============== EXECUTIVE INSIGHTS (before/after) ==============
const BEFORE_AFTER = [
  { k: "Manual effort", before: "72%", after: "18%" },
  { k: "Automation",    before: "18%", after: "82%" },
  { k: "Agentic AI",    before: "0%",  after: "61%" },
  { k: "Incidents / yr", before: "18", after: "4" },
  { k: "MTTR",          before: "6.4 h", after: "27 min" },
];
function Insights() {
  return (
    <div className="px-6 pt-4 pb-8 grid grid-cols-1 xl:grid-cols-5 gap-4">
      {[
        { title: "Where Time Is Consumed", icon: Clock, body: "Approval queues (3,200 h) and Ownership reconciliation (2,800 h) dominate enterprise effort.", accent: "amber" },
        { title: "Where Money Is Consumed", icon: DollarSign, body: "$2.1M / yr spent on manual deployment, validation, and exception handling.", accent: "amber" },
        { title: "Where Risk Is Introduced", icon: AlertTriangle, body: "60% of risk concentrates in Ownership + Approval — both upstream of issuance.", accent: "rose" },
        { title: "Where Automation Creates Value", icon: Zap, body: "Auto-Renewal + ACME Issuance return $1.8M / yr in avoided toil.", accent: "blue" },
        { title: "Where Agentic AI Creates Value", icon: Sparkles, body: "Ownership Intelligence + Renewal Coordinator resolve 64% of unknowns autonomously.", accent: "violet" },
      ].map((c, i) => {
        const t = toneCls[c.accent as keyof typeof toneCls];
        return (
          <motion.div key={c.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 + i * 0.08 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className={cn("h-8 w-8 rounded-lg grid place-items-center", t.bg, t.text)}><c.icon className="h-4 w-4" /></span>
            <div className="text-[13px] font-bold text-slate-900 mt-2">{c.title}</div>
            <div className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">{c.body}</div>
          </motion.div>
        );
      })}

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9 }}
        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 shadow-sm xl:col-span-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Before vs After · neurealm RunOps</div>
            <div className="text-[17px] font-bold mt-0.5">Operational transformation across the certificate lifecycle</div>
          </div>
          <span className="text-[11px] bg-white/15 rounded-md px-2 py-1 inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Sustained 12-month trend</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {BEFORE_AFTER.map((b) => (
            <div key={b.k} className="rounded-xl bg-white/10 backdrop-blur p-3">
              <div className="text-[10.5px] opacity-80 uppercase tracking-wider font-bold">{b.k}</div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-[16px] font-semibold line-through opacity-70">{b.before}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                <span className="text-[22px] font-bold tabular-nums">{b.after}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============== ANALYSIS PANE ==============
function StagePane({ open, deep, id, onClose }: {
  open: boolean; deep: boolean; id: string | null; onClose: () => void;
}) {
  const pane = id ? PANES[id] : null;
  const stage = id ? STAGES.find((s) => s.id === id) : null;
  const [tab, setTab] = useState("Overview");
  useEffect(() => { setTab(deep ? "Tasks" : "Overview"); }, [id, deep]);
  const tabs = deep
    ? ["Tasks", "Workflow", "Dependencies", "Coworker", "Approvals", "Evidence", "Timeline"]
    : ["Overview"];

  if (!pane || !stage) return null;
  const h = healthCls[stage.health];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 overflow-y-auto">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <span className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", h.bg, h.text)}>
              <stage.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-500">{pane.subtitle}</div>
              <SheetTitle className="text-base font-bold text-slate-900 leading-tight">{pane.title}</SheetTitle>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded", h.chip)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", h.dot)} /> {stage.health === "blue" ? "Optimized" : stage.health === "green" ? "Healthy" : stage.health === "yellow" ? "At risk" : "Friction"}
                </span>
                {deep && <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded font-semibold">{pane.workbench}</span>}
              </div>
            </div>
            <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100"><X className="h-4 w-4 text-slate-500" /></button>
          </div>
        </SheetHeader>

        {tabs.length > 1 && (
          <div className="px-5 pt-2 border-b border-slate-200 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn(
                "text-[11.5px] px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap",
                tab === t ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50",
              )}>{t}</button>
            ))}
          </div>
        )}

        <div className="px-5 py-4 space-y-5">
          {tab === "Overview" && (
            <>
              <p className="text-[13px] text-slate-700 leading-relaxed">{pane.intro}</p>
              {pane.groups.map((g) => (
                <div key={g.label}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">{g.label}</div>
                  <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                    {g.rows.map((r) => (
                      <div key={r.k} className="flex items-center justify-between px-3 py-2 text-[12px]">
                        <span className="text-slate-500">{r.k}</span>
                        <span className={cn("font-semibold tabular-nums",
                          r.tone === "red" ? "text-rose-600" :
                          r.tone === "amber" ? "text-amber-600" :
                          r.tone === "green" ? "text-emerald-600" : "text-slate-800")}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-violet-700 font-bold inline-flex items-center gap-1"><Bot className="h-3 w-3" /> Digital Coworker</div>
                  <div className="text-[13px] font-bold text-slate-900 mt-0.5">{pane.coworker.name}</div>
                  <div className="text-[11px] text-slate-600">Confidence {pane.coworker.confidence}% · {pane.coworker.saved}</div>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-blue-700 font-bold inline-flex items-center gap-1"><Zap className="h-3 w-3" /> Automation</div>
                  <div className="text-[13px] font-bold text-slate-900 mt-0.5">{pane.automation.name}</div>
                  <div className="text-[11px] text-slate-600">{pane.automation.coverage}</div>
                </div>
              </div>
            </>
          )}

          {tab === "Tasks" && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Operational Tasks</div>
              <div className="space-y-1.5">
                {["Triage queue", "Owner reconciliation", "Coworker handoff", "Evidence capture"].map((t) => (
                  <div key={t} className="flex items-center justify-between rounded-md border border-slate-200 px-2.5 py-2 text-[12px]">
                    <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {t}</span>
                    <span className="text-[10.5px] font-semibold text-slate-500">In progress</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Workflow" && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Workflow Progress</div>
              <div className="space-y-1.5">
                {[
                  { k: "Intake", p: 100 }, { k: "Validate", p: 92 }, { k: "Coworker action", p: 71 }, { k: "Approval", p: 48 }, { k: "Close-out", p: 12 },
                ].map((s) => (
                  <div key={s.k}>
                    <div className="flex justify-between text-[11px] text-slate-600"><span>{s.k}</span><span className="tabular-nums">{s.p}%</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.p}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Dependencies" && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Stage Dependencies</div>
              <div className="space-y-1.5">
                {["Upstream: CMDB · Cloud APIs", "Downstream: Issuance · Deployment", "Lateral: Compliance · Change Mgmt"].map((d) => (
                  <div key={d} className="rounded-md border border-slate-200 px-2.5 py-2 text-[12px] inline-flex items-center gap-2 w-full">
                    <GitMerge className="h-3.5 w-3.5 text-slate-400" /> {d}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Coworker" && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Digital Coworker Actions</div>
              <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-3 text-[12px] text-slate-700">
                <div className="font-bold text-slate-900">{pane.coworker.name}</div>
                <div className="mt-1">Confidence {pane.coworker.confidence}% · {pane.coworker.saved}</div>
                <div className="mt-2">Last action: <span className="font-semibold">auto-resolved owner mapping for 142 certs</span> · 4 min ago</div>
              </div>
            </div>
          )}
          {tab === "Approvals" && (
            <div className="text-[12px] text-slate-700">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Pending Approvals</div>
              <div className="space-y-1.5">
                {[{ k: "PROD renewal · API gateway", who: "ChangeBoard" }, { k: "Cert rotation · payment-svc", who: "Security" }].map((a) => (
                  <div key={a.k} className="flex items-center justify-between border border-slate-200 rounded-md px-2.5 py-2">
                    <span>{a.k}</span><span className="text-[10.5px] text-slate-500">{a.who}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Evidence" && (
            <div className="text-[12px] text-slate-700">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Evidence</div>
              <ul className="space-y-1.5">
                <li>10:14 EDT · CT log entry verified (Cloudflare Nimbus 2025)</li>
                <li>09:02 EDT · OCSP healthy (DigiCert)</li>
                <li>Yesterday · SOC 2 CC7.2 attested</li>
              </ul>
            </div>
          )}
          {tab === "Timeline" && (
            <div className="text-[12px] text-slate-700">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Stage Timeline</div>
              <ul className="space-y-1.5">
                <li>10:24 · Stage entered operational steady state</li>
                <li>09:40 · Coworker handoff triggered</li>
                <li>08:12 · Friction pattern detected — owner unknown</li>
              </ul>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center gap-2 sticky bottom-0 bg-white">
          <button className="text-[12px] font-semibold px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5" /> Open {pane.workbench}
          </button>
          <button className="text-[12px] font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
            View Coworker Brief
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============== PAGE ==============
export default function LifecycleJourney() {
  const [open, setOpen] = useState(false);
  const [deep, setDeep] = useState(false);
  const [id, setId] = useState<string | null>(null);

  const pick = (sid: string) => { setId(sid); setDeep(false); setOpen(true); };
  const deepPick = (sid: string) => { setId(sid); setDeep(true); setOpen(true); };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <Header />
        <KpiLayer />
        <ValueStream onPick={pick} onDeep={deepPick} />
        <FailureAndSLA />
        <Insights />
        <StagePane open={open} deep={deep} id={id} onClose={() => setOpen(false)} />
      </main>
    </div>
  );
}
