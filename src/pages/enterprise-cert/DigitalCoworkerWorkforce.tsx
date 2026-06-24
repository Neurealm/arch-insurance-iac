import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText, GitBranch,
  Globe, HelpCircle, LayoutDashboard, Package, Plug, RefreshCw, ScrollText, Scale, Search,
  ServerCog, ShieldAlert, ShieldCheck, UserCog, Zap, X, Sparkles, TrendingUp, Clock,
  DollarSign, AlertCircle, CheckCircle2, KeyRound, Rocket, BadgeCheck, ShieldQuestion,
  Compass, Workflow, ChevronRight, Users, Flame, Layers,
} from "lucide-react";
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
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers", active: true },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center" },
    { id: "cm", label: "Change Manager", icon: GitBranch, to: "/enterprise-certificate-management/change-manager" },
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
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Workforce Status</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">12</span>
          <span className="text-xs opacity-80">Digital Coworkers</span>
        </div>
        <div className="text-xs opacity-90">249,000 Tasks YTD</div>
      </div>
    </motion.aside>
  );
}

// ============== ANIMATED COUNTER ==============
function useCountUp(target: number, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function Kpi({ label, value, suffix = "", prefix = "", decimals = 0, icon: Icon, accent = "blue", delay = 0 }: any) {
  const n = useCountUp(value);
  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  const accentMap: any = {
    blue: "from-blue-500 to-sky-400 text-blue-600 bg-blue-50",
    emerald: "from-emerald-500 to-teal-400 text-emerald-600 bg-emerald-50",
    violet: "from-violet-500 to-purple-400 text-violet-600 bg-violet-50",
    amber: "from-amber-500 to-orange-400 text-amber-600 bg-amber-50",
  };
  const [grad, fg, bg] = accentMap[accent].split(" ").reduce((acc: any[], c: string, i: number) => {
    if (i < 2) acc[0] = (acc[0] || "") + " " + c;
    else if (c.startsWith("text-")) acc[1] = c;
    else if (c.startsWith("bg-")) acc[2] = c;
    return acc;
  }, []);
  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", grad)} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
          <div className="mt-1 text-[22px] font-bold text-slate-900 tabular-nums">
            {prefix}{display}{suffix}
          </div>
        </div>
        <div className={cn("h-9 w-9 rounded-lg grid place-items-center", bg)}>
          <Icon className={cn("h-4 w-4", fg)} />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        Live · last 60s
      </div>
    </motion.div>
  );
}

// ============== COWORKER DATA ==============
type Coworker = {
  id: string; name: string; role: string; icon: any; accent: string;
  status: "Active" | "Busy" | "Idle"; workload: number;
  tasks: number; hours: number; success: number; confidence: number;
  roi: number; activities: string[]; initials: string;
  purpose: string[];
};

const coworkers: Coworker[] = [
  {
    id: "discovery", name: "Ava Chen", role: "Certificate Discovery Engineer",
    icon: Compass, accent: "blue", status: "Active", workload: 78,
    tasks: 125000, hours: 9800, success: 99.6, confidence: 96, roi: 1.42,
    initials: "AC",
    purpose: ["Finds certificates", "Discovers shadow certificates", "Maps ownership", "Updates inventory", "Correlates CMDB records"],
    activities: ["Scanning Azure subscriptions", "Reconciling certificate inventory", "Discovering unmanaged certificates"],
  },
  {
    id: "risk", name: "Marcus Hale", role: "Certificate Risk Analyst",
    icon: ShieldAlert, accent: "amber", status: "Active", workload: 62,
    tasks: 50000, hours: 7100, success: 98.9, confidence: 94, roi: 0.98,
    initials: "MH",
    purpose: ["Analyzes risk", "Scores certificates", "Detects policy violations", "Measures business impact", "Forecasts exposure"],
    activities: ["Analyzing expiring certificates", "Calculating revenue exposure", "Identifying Tier 1 service risk"],
  },
  {
    id: "renewal", name: "Priya Natarajan", role: "Certificate Renewal Coordinator",
    icon: Workflow, accent: "violet", status: "Busy", workload: 84,
    tasks: 18000, hours: 6500, success: 99.1, confidence: 93, roi: 0.81,
    initials: "PN",
    purpose: ["Plans renewals", "Coordinates approvals", "Creates changes", "Schedules maintenance windows", "Tracks SLA compliance"],
    activities: ["Planning renewal wave", "Escalating ownership issues", "Coordinating maintenance windows"],
  },
  {
    id: "deploy", name: "Diego Romero", role: "Certificate Deployment Engineer",
    icon: Rocket, accent: "emerald", status: "Active", workload: 71,
    tasks: 14000, hours: 5800, success: 99.4, confidence: 95, roi: 0.74,
    initials: "DR",
    purpose: ["Deploys certificates", "Updates bindings", "Performs installations", "Validates deployments", "Executes rollbacks"],
    activities: ["Updating load balancers", "Deploying to Kubernetes", "Validating production endpoints"],
  },
  {
    id: "audit", name: "Hannah Lee", role: "PKI Compliance Auditor",
    icon: BadgeCheck, accent: "blue", status: "Active", workload: 58,
    tasks: 22000, hours: 3900, success: 99.8, confidence: 97, roi: 0.52,
    initials: "HL",
    purpose: ["Builds audit evidence", "Tracks policy compliance", "Supports PCI", "Supports SOC2", "Supports ISO"],
    activities: ["Generating audit evidence", "Reviewing policy exceptions", "Preparing compliance reports"],
  },
  {
    id: "crypto", name: "Noah Patel", role: "Cryptography Advisor",
    icon: KeyRound, accent: "violet", status: "Active", workload: 44,
    tasks: 12000, hours: 2800, success: 98.7, confidence: 92, roi: 0.38,
    initials: "NP",
    purpose: ["Weak algorithm analysis", "Key rotation planning", "Certificate modernization", "Quantum readiness analysis"],
    activities: ["Evaluating RSA usage", "Reviewing ECC adoption", "Assessing quantum readiness"],
  },
  {
    id: "sec", name: "Yara Osman", role: "Security Investigation Analyst",
    icon: ShieldQuestion, accent: "amber", status: "Busy", workload: 67,
    tasks: 8000, hours: 2100, success: 97.8, confidence: 91, roi: 0.30,
    initials: "YO",
    purpose: ["Compromised keys", "Unauthorized issuance", "Certificate abuse", "Threat investigation", "Blast radius analysis"],
    activities: ["Investigating suspicious issuance", "Analyzing compromised keys", "Reviewing threat indicators"],
  },
];

const accentBg: Record<string, string> = {
  blue: "from-sky-400 to-blue-600",
  emerald: "from-emerald-400 to-teal-600",
  violet: "from-violet-400 to-purple-600",
  amber: "from-amber-400 to-orange-600",
};
const accentText: Record<string, string> = {
  blue: "text-blue-600", emerald: "text-emerald-600", violet: "text-violet-600", amber: "text-amber-600",
};
const statusDot: Record<string, string> = {
  Active: "bg-emerald-500", Busy: "bg-amber-500", Idle: "bg-slate-400",
};

// ============== HEADER ==============
function Header() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
      className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200"
    >
      <div className="px-6 py-3 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-slate-500 font-medium">neurealm RunOps · Managed Service Workforce</div>
          <h1 className="text-[20px] font-bold text-slate-900 leading-tight truncate">
            Certificate Digital Coworker Workforce
          </h1>
          <div className="text-[12px] text-slate-500">
            The digital workforce that powers the neurealm RunOps managed service — augmenting and scaling your enterprise teams.
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-[300px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="bg-transparent outline-none text-sm flex-1" placeholder="Search coworkers, roles, activity" />
        </div>
        <div className="flex items-center gap-1.5">
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"><RefreshCw className="h-4 w-4" /></button>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600 relative">
            <Bell className="h-4 w-4" /><span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"><HelpCircle className="h-4 w-4" /></button>
        </div>
      </div>
    </motion.header>
  );
}

// ============== COWORKER CARD ==============
function CoworkerCard({ c, onClick, onDoubleClick, index }: { c: Coworker; onClick: () => void; onDoubleClick: () => void; index: number }) {
  const Icon = c.icon;
  const tasks = useCountUp(c.tasks);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="text-left bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group"
    >
      <div className={cn("absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 blur-2xl", accentBg[c.accent])} />
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br grid place-items-center text-white font-bold text-sm shadow-sm", accentBg[c.accent])}>
            {c.initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white grid place-items-center">
            <span className={cn("h-2.5 w-2.5 rounded-full", statusDot[c.status])} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-slate-900 truncate">{c.name}</div>
          <div className={cn("text-[11px] font-semibold truncate", accentText[c.accent])}>{c.role}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", c.status === "Active" ? "bg-emerald-50 text-emerald-700" : c.status === "Busy" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>
              {c.status}
            </span>
            <span className="text-[10px] text-slate-500">Confidence {c.confidence}%</span>
          </div>
        </div>
        <Icon className={cn("h-4 w-4 shrink-0 opacity-50", accentText[c.accent])} />
      </div>

      {/* Workload bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
          <span className="font-semibold uppercase tracking-wide">Workload</span>
          <span className="tabular-nums font-semibold text-slate-700">{c.workload}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${c.workload}%` }}
            transition={{ duration: 1, delay: 0.2 + 0.05 * index, ease: "easeOut" }}
            className={cn("h-full bg-gradient-to-r rounded-full", accentBg[c.accent])}
          />
        </div>
      </div>

      {/* Current activity */}
      <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
          <Activity className="h-3 w-3" /> Current Activity
        </div>
        <div className="mt-0.5 text-[11px] text-slate-700 line-clamp-2">{c.activities[0]}</div>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Tasks</div>
          <div className="text-[12px] font-bold text-slate-900 tabular-nums">{Math.round(tasks / 1000)}k</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Hours</div>
          <div className="text-[12px] font-bold text-slate-900 tabular-nums">{(c.hours / 1000).toFixed(1)}k</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Success</div>
          <div className="text-[12px] font-bold text-emerald-600 tabular-nums">{c.success}%</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">ROI Contribution</span>
        <span className="font-bold text-slate-900">${c.roi.toFixed(2)}M</span>
      </div>
    </motion.button>
  );
}

// ============== COLLABORATION NETWORK ==============
function CollaborationNetwork({ onSelect }: { onSelect: (id: string) => void }) {
  const nodes = [
    { id: "discovery", x: 80, y: 100, label: "Discovery" },
    { id: "risk", x: 270, y: 100, label: "Risk" },
    { id: "renewal", x: 460, y: 100, label: "Renewal" },
    { id: "deploy", x: 650, y: 100, label: "Deploy" },
    { id: "audit", x: 840, y: 100, label: "Compliance" },
    { id: "crypto", x: 270, y: 220, label: "Cryptography" },
    { id: "sec", x: 650, y: 220, label: "Security Investigation" },
  ];
  const edges = [
    ["discovery", "risk"], ["risk", "renewal"], ["renewal", "deploy"], ["deploy", "audit"],
    ["risk", "crypto"], ["deploy", "sec"], ["crypto", "renewal"], ["sec", "audit"],
  ];
  const find = (id: string) => nodes.find(n => n.id === id)!;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Collaboration Network</div>
          <div className="text-[15px] font-bold text-slate-900">How the digital workforce collaborates</div>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Live workflow signals
        </div>
      </div>
      <div className="relative">
        <svg viewBox="0 0 940 280" className="w-full h-[280px]">
          <defs>
            <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {edges.map(([a, b], i) => {
            const A = find(a), B = find(b);
            return (
              <g key={i}>
                <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle r="3" fill="#3b82f6">
                  <animateMotion dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite"
                    path={`M${A.x},${A.y} L${B.x},${B.y}`} />
                </circle>
              </g>
            );
          })}
          {nodes.map((n, i) => {
            const c = coworkers.find(c => c.id === n.id)!;
            return (
              <g key={n.id} className="cursor-pointer" onClick={() => onSelect(n.id)}>
                <circle cx={n.x} cy={n.y} r="32" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                <circle cx={n.x} cy={n.y} r="32" fill="url(#flowGrad)" opacity="0.15">
                  <animate attributeName="r" values="32;36;32" dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                </circle>
                <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-slate-900 font-bold" fontSize="12">{c.initials}</text>
                <text x={n.x} y={n.y + 52} textAnchor="middle" className="fill-slate-600 font-semibold" fontSize="10">{n.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ============== UTILIZATION PANEL ==============
function UtilizationPanel() {
  const rows = [
    { label: "Current Tasks", value: 1248, accent: "bg-blue-500", pct: 82 },
    { label: "Queued Tasks", value: 342, accent: "bg-violet-500", pct: 38 },
    { label: "Completed Today", value: 4910, accent: "bg-emerald-500", pct: 94 },
    { label: "Escalations", value: 58, accent: "bg-amber-500", pct: 12 },
    { label: "Approvals Pending", value: 24, accent: "bg-sky-500", pct: 28 },
    { label: "Automation Utilization", value: 82, accent: "bg-emerald-500", pct: 82, suffix: "%" },
    { label: "Agentic Utilization", value: 61, accent: "bg-violet-500", pct: 61, suffix: "%" },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Workforce Utilization</div>
      <div className="text-[15px] font-bold text-slate-900 mb-3">Live operational workload</div>
      <div className="space-y-2.5">
        {rows.map((r, i) => (
          <motion.div key={r.label} initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-600 font-medium">{r.label}</span>
              <span className="text-slate-900 font-bold tabular-nums">{r.value.toLocaleString()}{r.suffix || ""}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 1, delay: 0.1 * i }} className={cn("h-full rounded-full", r.accent)} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============== ROI / BEFORE-AFTER ==============
function RoiAndBeforeAfter() {
  const roi = [
    { label: "Hours Saved", value: "38,000", icon: Clock, accent: "blue" },
    { label: "Cost Avoidance", value: "$4.55M", icon: DollarSign, accent: "emerald" },
    { label: "Outages Prevented", value: "14", icon: Flame, accent: "amber" },
    { label: "Audit Effort Reduced", value: "72%", icon: BookCheck, accent: "violet" },
    { label: "MTTR Reduction", value: "−93%", icon: TrendingUp, accent: "emerald" },
    { label: "Risk Reduction", value: "67%", icon: ShieldCheck, accent: "blue" },
  ];
  const ba = [
    { label: "Manual", before: 72, after: 18, color: "bg-rose-500", afterColor: "bg-emerald-500" },
    { label: "Automation", before: 18, after: 82, color: "bg-slate-300", afterColor: "bg-blue-500" },
    { label: "Agentic", before: 0, after: 61, color: "bg-slate-300", afterColor: "bg-violet-500" },
    { label: "Incidents", before: 18, after: 4, color: "bg-rose-500", afterColor: "bg-emerald-500", unit: "" },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Digital Workforce ROI</div>
          <div className="text-[15px] font-bold text-slate-900">Value delivered & operational transformation</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {roi.map((r, i) => (
          <motion.div key={r.label} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.04 * i }}
            className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/60 p-3">
            <div className="flex items-center gap-2">
              <div className={cn("h-7 w-7 rounded-lg grid place-items-center", `bg-${r.accent}-50`)}>
                <r.icon className={cn("h-3.5 w-3.5", `text-${r.accent}-600`)} />
              </div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{r.label}</div>
            </div>
            <div className="mt-1.5 text-[18px] font-bold text-slate-900">{r.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 p-4 bg-gradient-to-br from-slate-50/60 to-white">
        <div className="text-[12px] font-bold text-slate-900 mb-3">Before vs After neurealm RunOps</div>
        <div className="space-y-3">
          {ba.map((b, i) => (
            <div key={b.label}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-700">{b.label}</span>
                <span className="tabular-nums">
                  <span className="text-rose-600 font-semibold">{b.before}{b.unit ?? "%"}</span>
                  <ChevronRight className="inline h-3 w-3 mx-1 text-slate-400" />
                  <span className="text-emerald-600 font-bold">{b.after}{b.unit ?? "%"}</span>
                </span>
              </div>
              <div className="flex gap-1 h-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${b.before}%` }} transition={{ duration: 0.8, delay: 0.05 * i }} className={cn("rounded-full opacity-60", b.color)} />
                <motion.div initial={{ width: 0 }} animate={{ width: `${b.after}%` }} transition={{ duration: 0.8, delay: 0.1 + 0.05 * i }} className={cn("rounded-full", b.afterColor)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============== CONTEXTUAL PANEL CONTENT ==============
const panelContent: Record<string, any> = {
  discovery: {
    summary: "Continuously discovers, classifies, and inventories every certificate across cloud, network, application, and endpoint estates — establishing the trusted source of truth that the rest of the workforce relies on.",
    sections: [
      { title: "Discovery Coverage", items: [["Estate Coverage", "98.7%"], ["Cloud Subscriptions", "412"], ["Network Devices", "8,910"], ["Kubernetes Clusters", "147"]] },
      { title: "Inventory Accuracy", items: [["Reconciled", "99.6%"], ["CMDB Sync Lag", "< 5 min"], ["Duplicate Records Resolved", "1,284"]] },
      { title: "Shadow Certificates", items: [["Discovered", "1,847"], ["Unowned", "212"], ["Self-Signed in Prod", "63"]] },
      { title: "Recent Findings", items: [["Azure West EU", "+148 certs"], ["GKE Cluster 22", "+34 certs"], ["F5 LB Cluster", "+12 certs"]] },
    ],
  },
  risk: {
    summary: "Scores every certificate against business criticality, revenue exposure, dependency depth, and policy posture — surfacing the certificates that materially threaten service continuity.",
    sections: [
      { title: "Risk Scores", items: [["Critical", "127"], ["High", "421"], ["Medium", "1,840"], ["Low", "9,212"]] },
      { title: "Revenue Exposure", items: [["At-Risk Revenue", "$42.3M"], ["Tier 1 Services", "18"], ["Mitigation in Flight", "11"]] },
      { title: "Forecasted Risk", items: [["Next 7d", "8 critical"], ["Next 30d", "37 critical"], ["Next 90d", "112 critical"]] },
      { title: "Recommendations", items: [["Auto-renew Tier 1", "Apply"], ["Escalate orphaned", "Review"], ["Modernize 3DES", "Plan"]] },
    ],
  },
  renewal: {
    summary: "Orchestrates renewal waves end-to-end: ownership confirmation, change management, approval chains, maintenance windows, and SLA tracking — eliminating the operational drag that traditionally precedes renewals.",
    sections: [
      { title: "Upcoming Renewals", items: [["Next 24h", "42"], ["Next 7d", "318"], ["Next 30d", "1,247"]] },
      { title: "Approval Chains", items: [["Pending Approvers", "24"], ["Avg Approval Time", "1.8h"], ["Auto-Approved", "76%"]] },
      { title: "Maintenance Windows", items: [["Scheduled This Wk", "62"], ["Conflict-Free", "98%"], ["Coordinated CRs", "147"]] },
      { title: "SLA Risk", items: [["At Risk", "9"], ["Breached", "0"], ["On Track", "1,238"]] },
    ],
  },
  deploy: {
    summary: "Performs validated certificate installation across load balancers, ingress controllers, application servers, and edge nodes — with automatic rollback and post-deployment integrity verification.",
    sections: [
      { title: "Deployment Targets", items: [["Load Balancers", "1,920"], ["Kubernetes Ingress", "884"], ["App Servers", "12,400"], ["Edge / CDN", "318"]] },
      { title: "Infrastructure Dependencies", items: [["F5 BIG-IP", "Healthy"], ["NetScaler", "Healthy"], ["Istio", "Healthy"], ["AWS ALB", "Healthy"]] },
      { title: "Rollback Plans", items: [["Pre-staged", "100%"], ["Last 30d Rollbacks", "3"], ["Mean Rollback Time", "42s"]] },
      { title: "Validation Results", items: [["Handshake OK", "99.4%"], ["Chain Trust OK", "99.9%"], ["OCSP Stapled", "97.1%"]] },
    ],
  },
  audit: {
    summary: "Builds continuous, evidence-grade audit packages aligned to PCI-DSS, SOC2, ISO 27001, and HIPAA — converting certificate lifecycle activity into ready-to-submit compliance artifacts.",
    sections: [
      { title: "Audit Readiness", items: [["PCI-DSS", "98%"], ["SOC2 Type II", "97%"], ["ISO 27001", "96%"], ["HIPAA", "99%"]] },
      { title: "Evidence Generated", items: [["YTD Artifacts", "84,200"], ["Auto-Attested", "92%"], ["Manual Review", "8%"]] },
      { title: "Policy Compliance", items: [["Policy Drift", "0.4%"], ["Exceptions Open", "12"], ["Approved Exceptions", "37"]] },
      { title: "Upcoming Audits", items: [["SOC2 Window", "42 days"], ["PCI Re-attest", "108 days"]] },
    ],
  },
  crypto: {
    summary: "Maintains cryptographic hygiene at enterprise scale — weak-algorithm retirement, key-rotation cadence, certificate modernization, and PQC readiness planning.",
    sections: [
      { title: "Weak Algorithms", items: [["SHA-1 Remaining", "84"], ["3DES Remaining", "12"], ["RSA-1024", "0"]] },
      { title: "Key Rotation Status", items: [["Rotated YTD", "4,120"], ["Overdue", "37"], ["Avg Rotation Cycle", "9 mo"]] },
      { title: "Quantum Readiness", items: [["PQC Pilot Endpoints", "210"], ["Hybrid Cert Coverage", "12%"], ["NIST Track Adoption", "On Plan"]] },
      { title: "Technical Recommendations", items: [["Migrate RSA → ECC", "1,840 certs"], ["Pilot ML-KEM", "Q3"], ["Retire SHA-1", "Q2"]] },
    ],
  },
  sec: {
    summary: "Investigates certificate-related security signals — compromised keys, unauthorized issuance, CT-log anomalies, abuse patterns — and quantifies blast radius for incident response.",
    sections: [
      { title: "Compromised Keys", items: [["Active Investigations", "3"], ["Revoked This Mo", "8"], ["Time to Revoke", "18 min avg"]] },
      { title: "Threat Indicators", items: [["CT-Log Anomalies", "14"], ["Misissuance Alerts", "2"], ["Lookalike Domains", "27"]] },
      { title: "Blast Radius", items: [["Services Impacted", "varies"], ["Customer Exposure", "scoped"], ["Containment SLO", "< 30 min"]] },
      { title: "Recommended Actions", items: [["Rotate impacted keys", "Auto"], ["Notify Trust Team", "In Flight"], ["File CT report", "Queued"]] },
    ],
  },
};

function ContextPanel({ id, deep, onClose }: { id: string | null; deep: boolean; onClose: () => void }) {
  const c = useMemo(() => coworkers.find(x => x.id === id), [id]);
  const content = id ? panelContent[id] : null;
  const [tab, setTab] = useState("tasks");
  useEffect(() => { setTab("tasks"); }, [id, deep]);

  return (
    <Sheet open={!!id} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[40%] p-0 overflow-y-auto">
        {c && content && (
          <div className="flex flex-col">
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br grid place-items-center text-white font-bold text-sm shadow-sm", accentBg[c.accent])}>
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="text-[15px] truncate">{c.name}</SheetTitle>
                  <div className={cn("text-[12px] font-semibold", accentText[c.accent])}>{c.role}</div>
                </div>
                <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-500"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                <span className={cn("px-2 py-0.5 rounded-md font-semibold", c.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{c.status}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">{c.tasks.toLocaleString()} tasks</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">{c.hours.toLocaleString()} hrs saved</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">Success {c.success}%</span>
                <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 font-semibold">Confidence {c.confidence}%</span>
                {deep && <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-semibold">Workspace Mode</span>}
              </div>
            </SheetHeader>

            <div className="px-5 py-4">
              <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Executive Summary</div>
              <p className="mt-1 text-[13px] text-slate-700 leading-relaxed">{content.summary}</p>
            </div>

            {!deep ? (
              <div className="px-5 pb-6 space-y-3">
                {content.sections.map((s: any) => (
                  <div key={s.title} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">{s.title}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {s.items.map(([k, v]: [string, string]) => (
                        <div key={k} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5">
                          <span className="text-[11px] text-slate-600">{k}</span>
                          <span className="text-[12px] font-bold text-slate-900 tabular-nums">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Current Tasks</div>
                  <ul className="space-y-1.5">
                    {c.activities.map((a) => (
                      <li key={a} className="flex items-center gap-2 text-[12px] text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-blue-700 font-semibold mb-1">Tip</div>
                  <div className="text-[12px] text-slate-700">Double-click the coworker card to open the dedicated workspace with workflow, evidence, approvals, and timeline tabs.</div>
                </div>
              </div>
            ) : (
              <div className="px-5 pb-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-1 flex flex-wrap gap-1 mb-3">
                  {["tasks", "workflow", "dependencies", "coworker", "approvals", "evidence", "timeline", "metrics"].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={cn("px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize",
                        tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:bg-white/60")}>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-[12px] font-bold text-slate-900 mb-2">
                    {c.role} · {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                  {tab === "tasks" && (
                    <ul className="space-y-2">
                      {c.activities.map((a, i) => (
                        <li key={a} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                          <div className="flex items-center gap-2 text-[12px] text-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> {a}
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold">In Flight · #{1280 + i}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {tab === "workflow" && (
                    <div className="grid grid-cols-5 gap-1.5">
                      {["Detect", "Assess", "Plan", "Execute", "Verify"].map((s, i) => (
                        <div key={s} className={cn("rounded-lg px-2 py-2 text-center text-[11px] font-semibold",
                          i < 3 ? "bg-emerald-50 text-emerald-700" : i === 3 ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-500")}>{s}</div>
                      ))}
                    </div>
                  )}
                  {tab === "dependencies" && (
                    <ul className="space-y-1.5 text-[12px] text-slate-700">
                      {coworkers.filter(x => x.id !== c.id).slice(0, 4).map(x => (
                        <li key={x.id} className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-slate-400" /> Hands off to <span className="font-semibold">{x.role}</span></li>
                      ))}
                    </ul>
                  )}
                  {tab === "coworker" && (
                    <div className="text-[12px] text-slate-700">
                      <div className="font-semibold mb-1">Purpose</div>
                      <ul className="list-disc pl-5 space-y-0.5">{c.purpose.map(p => <li key={p}>{p}</li>)}</ul>
                    </div>
                  )}
                  {tab === "approvals" && (
                    <div className="space-y-1.5 text-[12px]">
                      {[["Tier 1 renewal — payments-prod", "Pending CAB"], ["Auto-approve standard renewals", "Approved"], ["Out-of-window deploy exception", "Pending"]].map(([t, s]) => (
                        <div key={t} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                          <span className="text-slate-700">{t}</span>
                          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", s === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {tab === "evidence" && (
                    <ul className="space-y-1.5 text-[12px] text-slate-700">
                      {[["Audit pack #84211", "PCI-DSS"], ["Renewal log #18992", "SOC2"], ["Discovery delta #41204", "ISO27001"]].map(([t, s]) => (
                        <li key={t} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                          <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-slate-400" />{t}</span>
                          <span className="text-[10px] font-semibold text-slate-500">{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {tab === "timeline" && (
                    <ol className="relative border-l border-slate-200 ml-2 space-y-3">
                      {["Discovered new endpoint", "Risk re-scored", "Renewal scheduled", "Deployment verified", "Evidence published"].map((e, i) => (
                        <li key={e} className="ml-3">
                          <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-blue-500" />
                          <div className="text-[12px] font-semibold text-slate-900">{e}</div>
                          <div className="text-[10px] text-slate-500">{i + 1}m ago</div>
                        </li>
                      ))}
                    </ol>
                  )}
                  {tab === "metrics" && (
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      {[["Tasks", c.tasks.toLocaleString()], ["Hours Saved", c.hours.toLocaleString()], ["Success", `${c.success}%`], ["Confidence", `${c.confidence}%`], ["ROI", `$${c.roi.toFixed(2)}M`], ["Workload", `${c.workload}%`]].map(([k, v]) => (
                        <div key={k} className="rounded-lg bg-slate-50 px-3 py-2 flex items-center justify-between">
                          <span className="text-slate-600">{k}</span>
                          <span className="font-bold text-slate-900">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============== PAGE ==============
export default function DigitalCoworkerWorkforce() {
  const [selected, setSelected] = useState<string | null>(null);
  const [deep, setDeep] = useState(false);

  const kpis = [
    { label: "Digital Coworkers", value: 12, icon: Bot, accent: "blue", delay: 0 },
    { label: "Tasks Processed", value: 249000, icon: Activity, accent: "blue", delay: 0.05 },
    { label: "Hours Saved", value: 38000, icon: Clock, accent: "emerald", delay: 0.1 },
    { label: "Escalation Rate", value: 4.7, suffix: "%", decimals: 1, icon: AlertCircle, accent: "amber", delay: 0.15 },
    { label: "Automation Coverage", value: 82, suffix: "%", icon: Zap, accent: "emerald", delay: 0.2 },
    { label: "Agentic Coverage", value: 61, suffix: "%", icon: Sparkles, accent: "violet", delay: 0.25 },
    { label: "Renewal Success", value: 99.1, suffix: "%", decimals: 1, icon: CheckCircle2, accent: "emerald", delay: 0.3 },
    { label: "Annual Value", value: 4.55, prefix: "$", suffix: "M", decimals: 2, icon: DollarSign, accent: "violet", delay: 0.35 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="px-6 py-5 space-y-5">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            {kpis.map(k => <Kpi key={k.label} {...k} />)}
          </div>

          {/* Workforce + Right column */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-9">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Workforce Command Center</div>
                  <div className="text-[16px] font-bold text-slate-900">Members of the neurealm RunOps managed operations team</div>
                </div>
                <div className="text-[11px] text-slate-500 hidden md:flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Active</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Busy</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" /> Idle</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
                {coworkers.map((c, i) => (
                  <CoworkerCard key={c.id} c={c} index={i}
                    onClick={() => { setSelected(c.id); setDeep(false); }}
                    onDoubleClick={() => { setSelected(c.id); setDeep(true); }}
                  />
                ))}
              </div>
            </div>
            <div className="col-span-12 xl:col-span-3">
              <UtilizationPanel />
            </div>
          </div>

          {/* Network + ROI */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-7">
              <CollaborationNetwork onSelect={(id) => { setSelected(id); setDeep(false); }} />
            </div>
            <div className="col-span-12 xl:col-span-5">
              <RoiAndBeforeAfter />
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 py-3">
            neurealm RunOps · Certificate Digital Coworker Workforce · A managed service powered by digital employees
          </div>
        </main>
      </div>

      <ContextPanel id={selected} deep={deep} onClose={() => setSelected(null)} />
    </div>
  );
}
