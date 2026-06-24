import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertCircle, AlertTriangle, Bell, BookCheck, Bot, Briefcase, Building2,
  CheckCircle2, ChevronRight, Clock, Cog, Compass, DollarSign, FileSearch, FileText,
  Flame, GitBranch, Globe, HelpCircle, KeyRound, LayoutDashboard, Package, Plug,
  RefreshCw, Rocket, Scale, ScrollText, Search, ServerCog, ShieldAlert, ShieldCheck,
  ShieldQuestion, Sparkles, TrendingUp, UserCog, Users, Workflow, X, Zap, Radio,
  PlayCircle, ArrowUpRight, BadgeCheck, Cpu, Layers, Eye,
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
    { id: "rep", label: "Reports", icon: FileText },
  ]},
  { label: "Operations", items: [
    { id: "auto", label: "Agentic Execution Center", icon: Sparkles, to: "/enterprise-certificate-management/agentic-execution" },
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers" },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center", active: true },
    { id: "cm", label: "Change Manager", icon: GitBranch },
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
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider opacity-80 font-bold">
          <Radio className="h-3 w-3" /> Live Operations
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">287</span>
          <span className="text-xs opacity-80">Active Tasks</span>
        </div>
        <div className="text-xs opacity-90">12 coworkers · 22 engineers</div>
      </div>
    </motion.aside>
  );
}

// ============== COUNTER ==============
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

function Kpi({ label, value, suffix = "", prefix = "", decimals = 0, icon: Icon, tone = "blue", delay = 0 }: any) {
  const n = useCountUp(value);
  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  const tones: Record<string, string> = {
    blue: "from-sky-400 to-blue-600 text-blue-600 bg-blue-50",
    emerald: "from-emerald-400 to-teal-600 text-emerald-600 bg-emerald-50",
    amber: "from-amber-400 to-orange-600 text-amber-600 bg-amber-50",
    rose: "from-rose-400 to-red-600 text-rose-600 bg-rose-50",
    violet: "from-violet-400 to-purple-600 text-violet-600 bg-violet-50",
    slate: "from-slate-400 to-slate-600 text-slate-600 bg-slate-100",
  };
  const t = tones[tone].split(" ");
  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="relative bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", t[0], t[1])} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold truncate">{label}</div>
          <div className="mt-0.5 text-[18px] font-bold text-slate-900 tabular-nums">
            {prefix}{display}{suffix}
          </div>
        </div>
        <div className={cn("h-7 w-7 rounded-lg grid place-items-center shrink-0", t[4])}>
          <Icon className={cn("h-3.5 w-3.5", t[3])} />
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        Live
      </div>
    </motion.div>
  );
}

// ============== QUEUE DATA ==============
type Queue = {
  id: string; name: string; icon: any; volume: number; sla: "green" | "amber" | "red" | "blue";
  coworkers: number; engineers: number; automation: number; mix: { p1: number; p2: number; p3: number };
  cards: { title: string; service: string; owner: string; days: number; priority: "P1" | "P2" | "P3"; risk: number; status: string }[];
};

const queues: Queue[] = [
  {
    id: "renewals", name: "Renewals", icon: RefreshCw, volume: 318, sla: "amber",
    coworkers: 3, engineers: 5, automation: 84,
    mix: { p1: 12, p2: 84, p3: 222 },
    cards: [
      { title: "Certificate Expiring in 7 Days", service: "payments-prod", owner: "Payments SRE", days: 7, priority: "P1", risk: 92, status: "Renewal Planned" },
      { title: "Mass Renewal Wave — Edge Tier", service: "edge-cdn", owner: "Network Eng", days: 14, priority: "P2", risk: 64, status: "Scheduled" },
      { title: "Unknown Owner", service: "legacy-mw", owner: "—", days: 11, priority: "P2", risk: 78, status: "Owner Lookup" },
    ],
  },
  {
    id: "incidents", name: "Incidents", icon: AlertTriangle, volume: 4, sla: "red",
    coworkers: 2, engineers: 4, automation: 56,
    mix: { p1: 1, p2: 2, p3: 1 },
    cards: [
      { title: "TLS Handshake Failures — Checkout", service: "checkout-api", owner: "Payments SRE", days: 0, priority: "P1", risk: 98, status: "Mitigating" },
      { title: "Intermediate Chain Trust Issue", service: "partner-api", owner: "Platform Eng", days: 0, priority: "P2", risk: 71, status: "Investigating" },
    ],
  },
  {
    id: "deployments", name: "Deployments", icon: Rocket, volume: 49, sla: "green",
    coworkers: 2, engineers: 3, automation: 91,
    mix: { p1: 4, p2: 18, p3: 27 },
    cards: [
      { title: "Deployment Validation Failed", service: "ingress-eu", owner: "Platform Eng", days: 0, priority: "P1", risk: 81, status: "Rollback Ready" },
      { title: "Load Balancer Binding Refresh", service: "f5-cluster-3", owner: "Network Eng", days: 1, priority: "P2", risk: 42, status: "In Flight" },
    ],
  },
  {
    id: "exceptions", name: "Exceptions", icon: ShieldQuestion, volume: 73, sla: "amber",
    coworkers: 1, engineers: 2, automation: 38,
    mix: { p1: 6, p2: 31, p3: 36 },
    cards: [
      { title: "Policy Exception Review — Self-Signed", service: "internal-tools", owner: "PKI Team", days: 3, priority: "P2", risk: 58, status: "Pending Review" },
      { title: "Weak Algorithm Exception (SHA-1)", service: "legacy-edi", owner: "PKI Team", days: 6, priority: "P2", risk: 66, status: "Awaiting CAB" },
    ],
  },
  {
    id: "approvals", name: "Approvals", icon: BadgeCheck, volume: 24, sla: "blue",
    coworkers: 1, engineers: 3, automation: 76,
    mix: { p1: 2, p2: 9, p3: 13 },
    cards: [
      { title: "Tier 1 Renewal — payments-prod", service: "payments-prod", owner: "CAB", days: 1, priority: "P1", risk: 88, status: "Pending CAB" },
      { title: "Out-of-Window Deploy Request", service: "checkout-api", owner: "CAB", days: 0, priority: "P1", risk: 74, status: "Pending Approval" },
    ],
  },
  {
    id: "compliance", name: "Compliance", icon: BookCheck, volume: 36, sla: "green",
    coworkers: 1, engineers: 2, automation: 92,
    mix: { p1: 2, p2: 12, p3: 22 },
    cards: [
      { title: "PCI Audit Request — Q3 Window", service: "payments-prod", owner: "Compliance", days: 42, priority: "P2", risk: 48, status: "Evidence Generating" },
      { title: "SOC2 Continuous Attestation", service: "saas-tenant-mt", owner: "Compliance", days: 0, priority: "P3", risk: 22, status: "On Track" },
    ],
  },
  {
    id: "security", name: "Security", icon: ShieldAlert, volume: 11, sla: "red",
    coworkers: 1, engineers: 2, automation: 64,
    mix: { p1: 3, p2: 5, p3: 3 },
    cards: [
      { title: "Compromised Key Investigation", service: "partner-api", owner: "Sec Investigations", days: 0, priority: "P1", risk: 97, status: "Containment" },
      { title: "Unauthorized Issuance Alert", service: "*.corp.acme", owner: "Trust Team", days: 0, priority: "P1", risk: 89, status: "CT Triage" },
    ],
  },
  {
    id: "escalations", name: "Escalations", icon: Flame, volume: 18, sla: "amber",
    coworkers: 1, engineers: 2, automation: 22,
    mix: { p1: 4, p2: 9, p3: 5 },
    cards: [
      { title: "Ownership Resolution Required", service: "legacy-mw", owner: "Service Owner", days: 4, priority: "P2", risk: 72, status: "Awaiting Owner" },
      { title: "Executive Escalation — Outage Risk", service: "checkout-api", owner: "VP Eng", days: 0, priority: "P1", risk: 95, status: "Open" },
    ],
  },
];

const slaTone: Record<string, { dot: string; bg: string; ring: string; label: string }> = {
  green: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700", ring: "ring-emerald-200", label: "Healthy" },
  amber: { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700", ring: "ring-amber-200", label: "Approaching SLA" },
  red: { dot: "bg-rose-500", bg: "bg-rose-50 text-rose-700", ring: "ring-rose-200", label: "SLA Risk" },
  blue: { dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700", ring: "ring-blue-200", label: "Optimized" },
};

const priorityTone: Record<string, string> = {
  P1: "bg-rose-50 text-rose-700 border-rose-200",
  P2: "bg-amber-50 text-amber-700 border-amber-200",
  P3: "bg-slate-50 text-slate-700 border-slate-200",
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
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              neurealm RunOps · Live Operations
            </span>
            <span className="text-slate-300">·</span>
            <span>Managed Service · Tier 1 Coverage</span>
          </div>
          <h1 className="text-[20px] font-bold text-slate-900 leading-tight truncate">
            Enterprise Certificate Operations Center
          </h1>
          <div className="text-[12px] text-slate-500">
            The live operational heartbeat of the certificate managed service — humans, automation, and digital coworkers running the service in real time.
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-[280px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="bg-transparent outline-none text-sm flex-1" placeholder="Search queues, tasks, services" />
        </div>
        <div className="flex items-center gap-1.5">
          <button className="h-9 px-3 grid place-items-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold flex-row gap-1.5 flex">
            <PlayCircle className="h-4 w-4" /> Run Health Check
          </button>
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

// ============== QUEUE COLUMN ==============
function QueueColumn({ q, index, onSelect, onDeep }: { q: Queue; index: number; onSelect: (id: string) => void; onDeep: (id: string) => void }) {
  const Icon = q.icon;
  const t = slaTone[q.sla];
  const vol = useCountUp(q.volume);
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.04 * index }}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col min-w-[270px]"
    >
      <button
        onClick={() => onSelect(q.id)}
        onDoubleClick={() => onDeep(q.id)}
        className="text-left p-3 border-b border-slate-100 hover:bg-slate-50/60 transition-colors rounded-t-2xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("h-8 w-8 rounded-lg grid place-items-center ring-2", t.bg, t.ring)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-slate-900 truncate">{q.name}</div>
              <div className="text-[10px] text-slate-500">Queue health · <span className="font-semibold">{t.label}</span></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[18px] font-bold text-slate-900 tabular-nums leading-none">{Math.round(vol).toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">items</div>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1">
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">P1 {q.mix.p1}</span>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">P2 {q.mix.p2}</span>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">P3 {q.mix.p3}</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-md bg-slate-50 py-1">
            <div className="text-[9px] text-slate-500 uppercase font-semibold">Coworkers</div>
            <div className="text-[12px] font-bold text-violet-600">{q.coworkers}</div>
          </div>
          <div className="rounded-md bg-slate-50 py-1">
            <div className="text-[9px] text-slate-500 uppercase font-semibold">Engineers</div>
            <div className="text-[12px] font-bold text-blue-600">{q.engineers}</div>
          </div>
          <div className="rounded-md bg-slate-50 py-1">
            <div className="text-[9px] text-slate-500 uppercase font-semibold">Auto</div>
            <div className="text-[12px] font-bold text-emerald-600">{q.automation}%</div>
          </div>
        </div>
      </button>
      <div className="p-2 space-y-1.5 flex-1">
        {q.cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 + 0.05 * i }}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(q.id)}
            onDoubleClick={() => onDeep(q.id)}
            className="cursor-pointer rounded-lg border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-2.5 hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-[11.5px] font-semibold text-slate-900 leading-snug">{c.title}</div>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0", priorityTone[c.priority])}>{c.priority}</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1.5">
              <Briefcase className="h-2.5 w-2.5" /> {c.service} · {c.owner}
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-12 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn("h-full rounded-full", c.risk > 80 ? "bg-rose-500" : c.risk > 60 ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${c.risk}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 tabular-nums">{c.risk}</span>
              </div>
              <span className="text-[10px] text-slate-500">{c.days === 0 ? "now" : `${c.days}d`} · {c.status}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============== LIVE TIMELINE ==============
const seedEvents = [
  { type: "renewal", icon: RefreshCw, text: "Certificate renewed", target: "edge-cdn-eu · *.edge.acme.com", tone: "emerald" },
  { type: "deploy", icon: Rocket, text: "Deployment completed", target: "ingress-prod · k8s-cluster-12", tone: "blue" },
  { type: "validate", icon: CheckCircle2, text: "Validation successful", target: "payments-prod · OCSP stapled", tone: "emerald" },
  { type: "owner", icon: Users, text: "Unknown owner resolved", target: "legacy-mw · → Platform Eng", tone: "blue" },
  { type: "security", icon: ShieldAlert, text: "Compromised key investigated", target: "partner-api · containment in progress", tone: "rose" },
  { type: "policy", icon: ShieldQuestion, text: "Policy violation detected", target: "internal-tools · self-signed in prod", tone: "amber" },
  { type: "audit", icon: BookCheck, text: "Audit evidence generated", target: "PCI-DSS · evidence pack #84211", tone: "violet" },
  { type: "escalation", icon: Flame, text: "Escalation created", target: "checkout-api · outage risk", tone: "rose" },
  { type: "discovery", icon: Compass, text: "148 new certificates discovered", target: "Azure West EU subscription scan", tone: "blue" },
];

const eventTones: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

function LiveTimeline() {
  const [events, setEvents] = useState(() => seedEvents.map((e, i) => ({ ...e, id: i, t: i * 11 + 4 })));
  useEffect(() => {
    const id = setInterval(() => {
      setEvents(prev => {
        const e = seedEvents[Math.floor(Math.random() * seedEvents.length)];
        return [{ ...e, id: Date.now(), t: 0 }, ...prev.slice(0, 14)];
      });
    }, 4200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[640px]">
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Live Operations Timeline</div>
          <div className="text-[14px] font-bold text-slate-900">Real-time activity stream</div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Streaming
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div
              key={e.id}
              initial={{ y: -12, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-white px-2.5 py-2 hover:bg-slate-50/60"
            >
              <div className={cn("h-7 w-7 rounded-lg grid place-items-center shrink-0", eventTones[e.tone])}>
                <e.icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-semibold text-slate-900 truncate">{e.text}</div>
                <div className="text-[10px] text-slate-500 truncate">{e.target}</div>
              </div>
              <div className="text-[10px] text-slate-400 tabular-nums">{e.t === 0 ? "now" : `${e.t}s`}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============== WORKFORCE PANEL ==============
function WorkforcePanel() {
  const humans = [
    { name: "PKI Team", count: 6, util: 78, task: "Reviewing exception queue" },
    { name: "Operations", count: 5, util: 82, task: "Coordinating renewal wave" },
    { name: "Security", count: 4, util: 64, task: "Compromised key investigation" },
    { name: "Compliance", count: 3, util: 54, task: "PCI evidence assembly" },
    { name: "Infrastructure", count: 4, util: 71, task: "F5 LB binding refresh" },
  ];
  const cos = [
    { name: "Discovery Engineer", initials: "AC", util: 78, task: "Azure subscription scan", accent: "blue" },
    { name: "Risk Analyst", initials: "MH", util: 62, task: "Revenue exposure calc", accent: "amber" },
    { name: "Renewal Coordinator", initials: "PN", util: 84, task: "Renewal wave planning", accent: "violet" },
    { name: "Deployment Engineer", initials: "DR", util: 71, task: "Kubernetes ingress refresh", accent: "emerald" },
    { name: "Compliance Auditor", initials: "HL", util: 58, task: "PCI audit pack", accent: "blue" },
    { name: "Cryptography Advisor", initials: "NP", util: 44, task: "RSA → ECC migration plan", accent: "violet" },
    { name: "Security Investigator", initials: "YO", util: 67, task: "CT-log anomaly triage", accent: "amber" },
  ];
  const accentBg: Record<string, string> = {
    blue: "from-sky-400 to-blue-600", emerald: "from-emerald-400 to-teal-600",
    violet: "from-violet-400 to-purple-600", amber: "from-amber-400 to-orange-600",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Workforce Operations</div>
          <div className="text-[14px] font-bold text-slate-900">Live workload — engineers + digital coworkers</div>
        </div>
        <div className="text-[10px] text-slate-500">22 humans · 12 coworkers</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Human Engineers</div>
          <div className="space-y-1.5">
            {humans.map((h, i) => (
              <motion.div key={h.name} initial={{ x: -6, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}
                className="rounded-lg border border-slate-100 bg-slate-50/40 px-2.5 py-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{h.name}</span>
                  <span className="text-slate-500">{h.count} engineers · {h.util}%</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${h.util}%` }} transition={{ duration: 0.9, delay: 0.1 * i }} className="h-full rounded-full bg-blue-500" />
                </div>
                <div className="mt-1 text-[10px] text-slate-500 truncate">⤷ {h.task}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Digital Coworkers</div>
          <div className="space-y-1.5">
            {cos.map((c, i) => (
              <motion.div key={c.name} initial={{ x: 6, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}
                className="rounded-lg border border-slate-100 bg-white px-2.5 py-2 flex items-center gap-2">
                <div className={cn("h-7 w-7 rounded-lg bg-gradient-to-br grid place-items-center text-white font-bold text-[10px] shrink-0", accentBg[c.accent])}>
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900 truncate">{c.name}</span>
                    <span className="text-slate-500 tabular-nums">{c.util}%</span>
                  </div>
                  <div className="mt-0.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${c.util}%` }} transition={{ duration: 0.9, delay: 0.1 * i }} className="h-full rounded-full bg-violet-500" />
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500 truncate">⤷ {c.task}</div>
                </div>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== SLA CONTROL TOWER ==============
function SlaControlTower() {
  const rows = [
    { label: "Expiring in 7 Days", value: "287", icon: Clock, tone: "amber" },
    { label: "Critical Services Impacted", value: "42", icon: Briefcase, tone: "rose" },
    { label: "Renewals Within SLA", value: "99.1%", icon: CheckCircle2, tone: "emerald" },
    { label: "Escalations", value: "18", icon: Flame, tone: "amber" },
    { label: "Potential Outages", value: "4", icon: AlertTriangle, tone: "rose" },
    { label: "Revenue Exposure", value: "$12.4M", icon: DollarSign, tone: "rose" },
    { label: "Customers Impacted", value: "28,000", icon: Users, tone: "amber" },
  ];
  const toneBg: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">SLA Control Tower</div>
      <div className="text-[14px] font-bold text-slate-900 mb-3">Executive heat map · next 7 days</div>
      <div className="grid grid-cols-2 gap-2">
        {rows.map((r, i) => (
          <motion.div key={r.label} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 * i }}
            className={cn("rounded-lg border px-2.5 py-2", toneBg[r.tone])}>
            <div className="flex items-center justify-between">
              <r.icon className="h-3.5 w-3.5 opacity-70" />
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{r.label}</span>
            </div>
            <div className="mt-1 text-[18px] font-bold tabular-nums">{r.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============== HEALTH MAP ==============
function HealthMap() {
  const regions = [
    { name: "North America", code: "NA", certs: 18400, issues: 142, renewals: 96, incidents: 2, sla: 99.3, cx: "20%", cy: "38%" },
    { name: "Europe", code: "EU", certs: 12100, issues: 84, renewals: 71, incidents: 1, sla: 99.1, cx: "48%", cy: "32%" },
    { name: "APAC", code: "AP", certs: 8200, issues: 41, renewals: 58, incidents: 1, sla: 98.8, cx: "78%", cy: "48%" },
    { name: "South America", code: "SA", certs: 2100, issues: 12, renewals: 14, incidents: 0, sla: 99.6, cx: "28%", cy: "72%" },
    { name: "Middle East / Africa", code: "MEA", certs: 1200, issues: 8, renewals: 9, incidents: 0, sla: 99.7, cx: "55%", cy: "58%" },
  ];
  const tone = (n: number) => n > 1 ? "fill-rose-500" : n > 0 ? "fill-amber-500" : "fill-emerald-500";
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Operational Health Map</div>
          <div className="text-[14px] font-bold text-slate-900">Global certificate operations</div>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Watch</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Risk</span>
        </div>
      </div>
      <div className="relative rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden h-[260px]">
        <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* Stylized continents */}
          <g fill="#e2e8f0">
            <path d="M5,22 Q8,12 22,14 Q34,16 32,28 Q28,38 18,40 Q8,38 5,30 Z" />
            <path d="M40,18 Q48,12 58,16 Q62,22 56,28 Q48,32 42,28 Z" />
            <path d="M62,20 Q76,16 86,22 Q92,30 84,40 Q72,46 64,38 Q60,30 62,20 Z" />
            <path d="M22,46 Q30,42 34,50 Q32,58 24,58 Q18,54 22,46 Z" />
            <path d="M48,40 Q56,38 60,46 Q58,54 50,54 Q44,50 48,40 Z" />
          </g>
        </svg>
        {regions.map((r, i) => (
          <motion.div
            key={r.code}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 + 0.08 * i, type: "spring" }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: r.cx, top: r.cy }}
          >
            <div className="relative">
              <span className={cn("absolute inset-0 rounded-full animate-ping opacity-60", r.incidents > 1 ? "bg-rose-400" : r.incidents > 0 ? "bg-amber-400" : "bg-emerald-400")} />
              <button className={cn("relative h-3 w-3 rounded-full ring-2 ring-white shadow", r.incidents > 1 ? "bg-rose-500" : r.incidents > 0 ? "bg-amber-500" : "bg-emerald-500")} />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 mt-2 w-[200px] rounded-lg border border-slate-200 bg-white p-2 shadow-lg z-10 pointer-events-none">
              <div className="text-[11px] font-bold text-slate-900">{r.name}</div>
              <div className="grid grid-cols-2 gap-1 mt-1 text-[10px] text-slate-600">
                <div>Certs <span className="font-bold text-slate-900">{r.certs.toLocaleString()}</span></div>
                <div>Issues <span className="font-bold text-slate-900">{r.issues}</span></div>
                <div>Renewals <span className="font-bold text-slate-900">{r.renewals}</span></div>
                <div>Incidents <span className="font-bold text-slate-900">{r.incidents}</span></div>
                <div className="col-span-2">SLA <span className="font-bold text-emerald-700">{r.sla}%</span></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {regions.map(r => (
          <div key={r.code} className="rounded-md border border-slate-100 bg-slate-50/50 px-2 py-1.5 text-center">
            <div className="text-[9px] text-slate-500 font-semibold">{r.code}</div>
            <div className="text-[11px] font-bold text-slate-900 tabular-nums">{(r.certs / 1000).toFixed(1)}k</div>
            <div className="text-[9px] text-emerald-700 font-semibold">{r.sla}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============== AUTOMATIONS ==============
function AutomationCenter() {
  const autos = [
    { name: "Auto Discovery", runs: 1248, success: 99.6, hours: 920, last: "12s ago", status: "Running" },
    { name: "Auto Renewal", runs: 318, success: 99.1, hours: 740, last: "1m ago", status: "Running" },
    { name: "Auto Deployment", runs: 612, success: 99.4, hours: 480, last: "2m ago", status: "Running" },
    { name: "Auto Validation", runs: 2340, success: 99.9, hours: 380, last: "8s ago", status: "Running" },
    { name: "Auto Ticket Creation", runs: 487, success: 99.8, hours: 210, last: "30s ago", status: "Running" },
    { name: "CMDB Sync", runs: 96, success: 100, hours: 170, last: "5m ago", status: "Running" },
    { name: "Compliance Evidence", runs: 1820, success: 99.7, hours: 410, last: "45s ago", status: "Running" },
    { name: "Owner Notification", runs: 342, success: 99.5, hours: 80, last: "1m ago", status: "Running" },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Automation Control Center</div>
          <div className="text-[14px] font-bold text-slate-900">Active automations · always-on</div>
        </div>
        <div className="text-[10px] text-slate-500">8 active · 0 paused</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {autos.map((a, i) => (
          <motion.div key={a.name} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.03 * i }}
            className="rounded-lg border border-slate-100 px-2.5 py-2 flex items-center gap-3 bg-gradient-to-br from-white to-slate-50/40">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 grid place-items-center">
              <Zap className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="font-bold text-slate-900 truncate">{a.name}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> {a.status}
                </span>
              </div>
              <div className="mt-0.5 grid grid-cols-4 gap-1 text-[10px] text-slate-600">
                <div>Runs <span className="font-bold text-slate-900">{a.runs.toLocaleString()}</span></div>
                <div>Success <span className="font-bold text-emerald-700">{a.success}%</span></div>
                <div>Hrs <span className="font-bold text-slate-900">{a.hours}</span></div>
                <div className="text-slate-500">{a.last}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============== BUSINESS IMPACT ==============
function BusinessImpact() {
  const rows = [
    { label: "Revenue Protected", value: "$12.4M", icon: DollarSign, tone: "emerald" },
    { label: "Customers Protected", value: "28,000", icon: Users, tone: "blue" },
    { label: "Critical Services Protected", value: "42", icon: Briefcase, tone: "violet" },
    { label: "Audit Hours Saved", value: "355", icon: BookCheck, tone: "blue" },
    { label: "Incidents Avoided", value: "14", icon: ShieldCheck, tone: "emerald" },
    { label: "Value Delivered", value: "$4.55M", icon: TrendingUp, tone: "violet" },
  ];
  const toneBg: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Business Impact</div>
      <div className="text-[14px] font-bold text-slate-900 mb-3">Operational outcomes delivered</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {rows.map((r, i) => (
          <motion.div key={r.label} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}
            className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/60 p-3">
            <div className={cn("h-7 w-7 rounded-lg grid place-items-center", toneBg[r.tone])}>
              <r.icon className="h-3.5 w-3.5" />
            </div>
            <div className="mt-1.5 text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{r.label}</div>
            <div className="text-[18px] font-bold text-slate-900">{r.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============== BEFORE / AFTER ==============
function BeforeAfter() {
  const rows = [
    { label: "Incidents", before: "18", after: "4" },
    { label: "Manual Effort", before: "72%", after: "18%" },
    { label: "MTTR", before: "6.4 hrs", after: "27 min" },
    { label: "Audit Hours", before: "400", after: "45" },
  ];
  return (
    <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide opacity-70 font-semibold">Executive Summary</div>
      <div className="text-[16px] font-bold mb-3">Before RunOps vs After RunOps</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {rows.map((r, i) => (
          <motion.div key={r.label} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06 * i }}
            className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-wide opacity-70 font-semibold">{r.label}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[14px] font-bold text-rose-300 line-through opacity-80">{r.before}</span>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              <span className="text-[18px] font-bold text-emerald-300">{r.after}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============== CONTEXT PANEL ==============
const panelContent: Record<string, any> = {
  renewals: {
    title: "Renewal Queue", icon: RefreshCw, tone: "violet",
    summary: "Active renewal wave coordinated end-to-end — discovery, approvals, change windows, deployment, and validation — by the Renewal Coordinator with Tier 1 SRE oversight.",
    sections: [
      { title: "Upcoming Renewals", items: [["Next 24h", "42"], ["Next 7d", "318"], ["Next 30d", "1,247"]] },
      { title: "Critical Renewals", items: [["P1 Tier 1", "12"], ["Revenue Exposure", "$8.2M"]] },
      { title: "Ownership Status", items: [["Owners Confirmed", "94%"], ["Unknown Owners", "18"]] },
      { title: "SLA Risk", items: [["At Risk", "9"], ["On Track", "1,238"]] },
      { title: "Assigned Resources", items: [["Coworkers", "3"], ["Engineers", "5"]] },
    ],
    actions: ["Promote renewal wave to CAB", "Auto-resolve unknown owners", "Schedule maintenance windows"],
  },
  incidents: {
    title: "Incident Queue", icon: AlertTriangle, tone: "rose",
    summary: "Two TLS-related incidents currently active — checkout handshake failures in mitigation, partner API chain trust under investigation. Containment underway.",
    sections: [
      { title: "Incident Details", items: [["Open", "4"], ["P1", "1"], ["P2", "2"]] },
      { title: "Affected Services", items: [["checkout-api", "P1"], ["partner-api", "P2"]] },
      { title: "Customer Impact", items: [["Customers", "12,400"], ["Geographies", "NA, EU"]] },
      { title: "Revenue Impact", items: [["Per Hour", "$420k"], ["Cumulative", "$1.1M"]] },
      { title: "Current Actions", items: [["Rollback Staged", "Yes"], ["Comms Sent", "Yes"]] },
    ],
    actions: ["Engage Tier 1 SRE bridge", "Execute rollback for checkout-api", "Notify executive stakeholders"],
  },
  deployments: {
    title: "Deployment Queue", icon: Rocket, tone: "blue",
    summary: "49 in-flight deployments across load balancers, Kubernetes ingress controllers, and application servers — orchestrated by the Deployment Engineer coworker with full rollback staging.",
    sections: [
      { title: "Deployment Targets", items: [["Load Balancers", "18"], ["K8s Ingress", "22"], ["App Servers", "9"]] },
      { title: "Infrastructure Dependencies", items: [["F5", "Healthy"], ["NetScaler", "Healthy"], ["Istio", "Healthy"]] },
      { title: "Rollback Plan", items: [["Pre-staged", "100%"], ["Mean Rollback", "42s"]] },
      { title: "Validation Status", items: [["Handshake OK", "99.4%"], ["OCSP", "97.1%"]] },
      { title: "Risk Assessment", items: [["High-Risk", "3"], ["Standard", "46"]] },
    ],
    actions: ["Approve standard deployments", "Hold high-risk for CAB review", "Run post-deploy validation"],
  },
  exceptions: {
    title: "Exceptions Queue", icon: ShieldQuestion, tone: "amber",
    summary: "Policy exception pipeline tracks self-signed certificates in production, weak-algorithm usage, and CA-policy deviations awaiting CAB review.",
    sections: [
      { title: "Policy Violations", items: [["Self-Signed Prod", "63"], ["SHA-1", "84"], ["Other", "12"]] },
      { title: "Audit Requests", items: [["Open", "8"], ["This Quarter", "23"]] },
      { title: "Framework Impact", items: [["PCI-DSS", "Yes"], ["SOC2", "Yes"]] },
      { title: "Evidence Status", items: [["Auto-Generated", "92%"], ["Manual", "8%"]] },
      { title: "Compliance Risk", items: [["Score", "Low"], ["Trend", "↓ 8%"]] },
    ],
    actions: ["Open CAB ticket for SHA-1 exceptions", "Replace self-signed with managed PKI", "Refresh evidence pack"],
  },
  approvals: {
    title: "Approvals Queue", icon: BadgeCheck, tone: "blue",
    summary: "24 pending approvals — Tier 1 renewals and out-of-window deploys awaiting CAB attestation. Auto-approval already covers 76% of standard changes.",
    sections: [
      { title: "Pending", items: [["CAB", "11"], ["Service Owners", "9"], ["Security", "4"]] },
      { title: "Avg Approval Time", items: [["P1", "1.2h"], ["P2", "2.8h"], ["P3", "auto"]] },
      { title: "Auto-Approved (7d)", items: [["Standard Changes", "412"], ["Coverage", "76%"]] },
    ],
    actions: ["Expedite CAB attestation", "Auto-approve low-risk standard changes", "Notify approver delegates"],
  },
  compliance: {
    title: "Compliance Queue", icon: BookCheck, tone: "emerald",
    summary: "Continuous compliance posture across PCI, SOC2, ISO 27001, and HIPAA — with evidence assembled in real time by the Compliance Auditor coworker.",
    sections: [
      { title: "Policy Violations", items: [["Open", "12"], ["Closed (30d)", "118"]] },
      { title: "Audit Requests", items: [["Active", "3"], ["Upcoming", "2"]] },
      { title: "Framework Impact", items: [["PCI", "98%"], ["SOC2", "97%"], ["ISO", "96%"]] },
      { title: "Evidence Status", items: [["Artifacts YTD", "84,200"], ["Auto-Attested", "92%"]] },
    ],
    actions: ["Publish Q3 PCI evidence pack", "Close low-severity exceptions", "Schedule SOC2 walkthrough"],
  },
  security: {
    title: "Security Queue", icon: ShieldAlert, tone: "rose",
    summary: "Active security investigations covering compromised keys, unauthorized issuance, and CT-log anomalies. Containment SLO targets sub-30-minute response.",
    sections: [
      { title: "Compromised Keys", items: [["Active", "3"], ["Revoked (30d)", "8"]] },
      { title: "Unauthorized Issuance", items: [["CT Anomalies", "14"], ["Misissuance Alerts", "2"]] },
      { title: "Threat Indicators", items: [["Lookalike Domains", "27"], ["Phishing Certs", "9"]] },
      { title: "Blast Radius", items: [["Services Touched", "11"], ["Customers", "scoped"]] },
      { title: "Mitigation Actions", items: [["Rotations", "Auto"], ["Revocations", "Live"]] },
    ],
    actions: ["Rotate impacted keys", "File CT-log report", "Engage Trust Team"],
  },
  escalations: {
    title: "Escalation Queue", icon: Flame, tone: "amber",
    summary: "Escalations spanning ownership unknowns, outage-risk certificates, and executive review items requiring VP-level attention.",
    sections: [
      { title: "Escalation Reason", items: [["Ownership", "7"], ["Outage Risk", "4"], ["Compliance", "3"], ["Approval", "4"]] },
      { title: "Approvals Required", items: [["VP Eng", "3"], ["CISO", "2"]] },
      { title: "Business Impact", items: [["Revenue at Risk", "$3.6M"], ["Customers", "8,200"]] },
      { title: "Current Owner", items: [["RunOps Duty Mgr", "—"]] },
      { title: "Risk Exposure", items: [["Composite", "High"]] },
    ],
    actions: ["Escalate to VP Eng bridge", "Confirm service owners", "Brief CISO on key incident"],
  },
};

function ContextPanel({ id, deep, onClose }: { id: string | null; deep: boolean; onClose: () => void }) {
  const content = id ? panelContent[id] : null;
  const [tab, setTab] = useState("tasks");
  useEffect(() => { setTab("tasks"); }, [id, deep]);
  if (!content) return (
    <Sheet open={!!id} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[40%] p-0" />
    </Sheet>
  );
  const Icon = content.icon;
  const toneMap: Record<string, string> = {
    violet: "from-violet-500 to-purple-600 bg-violet-50 text-violet-700",
    rose: "from-rose-500 to-red-600 bg-rose-50 text-rose-700",
    blue: "from-sky-500 to-blue-600 bg-blue-50 text-blue-700",
    amber: "from-amber-500 to-orange-600 bg-amber-50 text-amber-700",
    emerald: "from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-700",
  };
  const t = toneMap[content.tone].split(" ");
  const q = queues.find(q => q.id === id);
  return (
    <Sheet open={!!id} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[40%] p-0 overflow-y-auto">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={cn("h-11 w-11 rounded-xl bg-gradient-to-br grid place-items-center text-white shadow-sm", t[0], t[1])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-[15px] truncate">{content.title}</SheetTitle>
              <div className="text-[12px] text-slate-500">{deep ? "Operational Workspace" : "Operations Detail"}</div>
            </div>
            <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-500"><X className="h-4 w-4" /></button>
          </div>
          {q && (
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <span className={cn("px-2 py-0.5 rounded-md font-semibold", slaTone[q.sla].bg)}>{slaTone[q.sla].label}</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">{q.volume} items</span>
              <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 font-semibold">{q.coworkers} coworkers</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">{q.engineers} engineers</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">{q.automation}% auto</span>
              {deep && <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-semibold">Workspace Mode</span>}
            </div>
          )}
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
              <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Recommended Actions</div>
              <ul className="space-y-1.5">
                {content.actions.map((a: string) => (
                  <li key={a} className="flex items-center gap-2 text-[12px] text-slate-700">
                    <ArrowUpRight className="h-3.5 w-3.5 text-blue-500 shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3">
              <div className="text-[11px] uppercase tracking-wide text-blue-700 font-semibold mb-1">Tip</div>
              <div className="text-[12px] text-slate-700">Double-click any queue or task to open the operational workspace with tasks, evidence, dependencies, approvals, and timeline.</div>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-1 flex flex-wrap gap-1 mb-3">
              {["tasks", "dependencies", "evidence", "timeline", "approvals", "coworker", "automation", "risk", "impact"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize",
                    tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:bg-white/60")}>
                  {t}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[12px] font-bold text-slate-900 mb-2 capitalize">{content.title} · {tab}</div>
              {tab === "tasks" && q && (
                <ul className="space-y-2">
                  {q.cards.map((c, i) => (
                    <li key={c.title} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <div className="text-[12px] font-semibold text-slate-900">{c.title}</div>
                        <div className="text-[10px] text-slate-500">{c.service} · {c.status}</div>
                      </div>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", priorityTone[c.priority])}>{c.priority}</span>
                    </li>
                  ))}
                </ul>
              )}
              {tab === "dependencies" && (
                <ul className="space-y-1.5 text-[12px] text-slate-700">
                  {["Service Owner sign-off", "Change Advisory Board", "Maintenance window calendar", "Infrastructure team handover"].map(d => (
                    <li key={d} className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-slate-400" /> {d}</li>
                  ))}
                </ul>
              )}
              {tab === "evidence" && (
                <ul className="space-y-1.5 text-[12px] text-slate-700">
                  {[["Run log #84211", "Operational"], ["CAB ticket #18992", "Approval"], ["Validation report #41204", "Quality"]].map(([t, s]) => (
                    <li key={t} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-slate-400" />{t}</span>
                      <span className="text-[10px] font-semibold text-slate-500">{s}</span>
                    </li>
                  ))}
                </ul>
              )}
              {tab === "timeline" && (
                <ol className="relative border-l border-slate-200 ml-2 space-y-3">
                  {["Queue opened", "Coworker assigned", "Approval granted", "Action executed", "Validation complete"].map((e, i) => (
                    <li key={e} className="ml-3">
                      <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-blue-500" />
                      <div className="text-[12px] font-semibold text-slate-900">{e}</div>
                      <div className="text-[10px] text-slate-500">{i + 1}m ago</div>
                    </li>
                  ))}
                </ol>
              )}
              {tab === "approvals" && (
                <div className="space-y-1.5 text-[12px]">
                  {[["Service Owner — payments-prod", "Approved"], ["CAB attestation", "Pending"], ["Security sign-off", "Approved"]].map(([t, s]) => (
                    <div key={t} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <span className="text-slate-700">{t}</span>
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", s === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "coworker" && (
                <div className="text-[12px] text-slate-700">
                  <div className="flex items-center gap-2 mb-2"><Bot className="h-4 w-4 text-violet-600" /><span className="font-semibold">Digital Coworkers on this queue</span></div>
                  <ul className="space-y-1.5">
                    {["Renewal Coordinator — wave planning", "Compliance Auditor — evidence", "Discovery Engineer — owner lookup"].map(x => (
                      <li key={x} className="rounded-lg bg-slate-50 px-3 py-2">{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              {tab === "automation" && (
                <ul className="space-y-1.5 text-[12px]">
                  {[["Auto-renewal", "Running"], ["Owner notification", "Running"], ["CMDB sync", "Idle"]].map(([n, s]) => (
                    <li key={n} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <span className="flex items-center gap-2 text-slate-700"><Zap className="h-3.5 w-3.5 text-emerald-500" />{n}</span>
                      <span className="text-[10px] font-semibold text-emerald-700">{s}</span>
                    </li>
                  ))}
                </ul>
              )}
              {tab === "risk" && (
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {[["Composite", "High"], ["SLA", "At Risk"], ["Compliance", "Low"], ["Outage Likelihood", "Medium"]].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-slate-600">{k}</span><span className="font-bold text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "impact" && (
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {[["Revenue at Risk", "$3.6M"], ["Customers", "8,200"], ["Services", "12"], ["Geographies", "NA, EU"]].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-slate-600">{k}</span><span className="font-bold text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============== PAGE ==============
export default function OperationsCenter() {
  const [selected, setSelected] = useState<string | null>(null);
  const [deep, setDeep] = useState(false);

  const kpis = [
    { label: "Active Certificates", value: 42000, icon: ShieldCheck, tone: "blue", delay: 0 },
    { label: "Requires Action", value: 287, icon: AlertCircle, tone: "amber", delay: 0.04 },
    { label: "Open Incidents", value: 4, icon: AlertTriangle, tone: "rose", delay: 0.08 },
    { label: "Pending Deployments", value: 49, icon: Rocket, tone: "blue", delay: 0.12 },
    { label: "Compliance Exceptions", value: 73, icon: ShieldQuestion, tone: "amber", delay: 0.16 },
    { label: "Escalations", value: 18, icon: Flame, tone: "rose", delay: 0.2 },
    { label: "Coworkers Active", value: 12, icon: Bot, tone: "violet", delay: 0.24 },
    { label: "SLA Compliance", value: 99.1, suffix: "%", decimals: 1, icon: CheckCircle2, tone: "emerald", delay: 0.28 },
    { label: "MTTR", value: 27, suffix: " min", icon: Clock, tone: "emerald", delay: 0.32 },
    { label: "Automation Coverage", value: 82, suffix: "%", icon: Zap, tone: "emerald", delay: 0.36 },
    { label: "Agentic Coverage", value: 61, suffix: "%", icon: Sparkles, tone: "violet", delay: 0.4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="px-6 py-5 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-11 gap-2.5">
            {kpis.map(k => <Kpi key={k.label} {...k} />)}
          </div>

          {/* Command Board + Timeline */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-9">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Operations Command Board</div>
                  <div className="text-[16px] font-bold text-slate-900">Live operational queues</div>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Approaching SLA</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> SLA Risk</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Optimized</span>
                </div>
              </div>
              <div className="overflow-x-auto pb-2 -mx-1 px-1">
                <div className="grid grid-flow-col auto-cols-[minmax(270px,1fr)] gap-3">
                  {queues.map((q, i) => (
                    <QueueColumn key={q.id} q={q} index={i}
                      onSelect={(id) => { setSelected(id); setDeep(false); }}
                      onDeep={(id) => { setSelected(id); setDeep(true); }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-12 xl:col-span-3">
              <LiveTimeline />
            </div>
          </div>

          {/* Workforce + SLA */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8"><WorkforcePanel /></div>
            <div className="col-span-12 xl:col-span-4"><SlaControlTower /></div>
          </div>

          {/* Health Map + Automations */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-7"><HealthMap /></div>
            <div className="col-span-12 xl:col-span-5"><AutomationCenter /></div>
          </div>

          {/* Business Impact */}
          <BusinessImpact />

          {/* Before / After */}
          <BeforeAfter />

          <div className="text-center text-[11px] text-slate-400 py-3">
            neurealm RunOps · Enterprise Certificate Operations Center · Operated by engineers, automation, and digital coworkers
          </div>
        </main>
      </div>

      <ContextPanel id={selected} deep={deep} onClose={() => setSelected(null)} />
    </div>
  );
}
