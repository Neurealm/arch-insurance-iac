import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, Bell, BookCheck, Bot, Briefcase, Building2, CheckCircle2,
  ChevronRight, Clock, Cog, Compass, DollarSign, FileSearch, FileText, GitBranch,
  Globe, HelpCircle, KeyRound, LayoutDashboard, Package, PauseCircle, PlayCircle,
  Plug, RefreshCw, Rocket, Scale, ScrollText, Search, ServerCog, ShieldAlert,
  ShieldCheck, ShieldQuestion, Sparkles, TrendingDown, UserCog, Users, Workflow, X,
  Zap, Radio, ArrowUpRight, BadgeCheck, Layers, Eye, Cpu, Hourglass, Gauge, Network,
  Server, Cloud, Lock, FileCheck, AlertCircle, Crown,
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
    { id: "auto", label: "Agentic Execution Center", icon: Sparkles, to: "/enterprise-certificate-management/agentic-execution", active: true },
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers" },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center" },
    { id: "cm", label: "Change Manager", icon: GitBranch, to: "/enterprise-certificate-management/change-manager" },
    { id: "int", label: "Integrations", icon: Plug, to: "/enterprise-certificate-management/integrations" },
  ]},
  { label: "Security & Compliance", items: [
    { id: "sec", label: "Security Posture", icon: ShieldCheck, to: "/enterprise-certificate-management/security-posture" },
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
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-violet-600 via-blue-600 to-sky-500 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider opacity-90 font-bold">
          <Sparkles className="h-3 w-3" /> Agentic Mode
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">97.4%</span>
          <span className="text-xs opacity-90">Confidence</span>
        </div>
        <div className="text-xs opacity-90">7 coworkers executing</div>
      </div>
    </motion.aside>
  );
}

// ============== COUNT-UP ==============
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
  const tones: Record<string, string[]> = {
    blue: ["from-sky-400 to-blue-600", "bg-blue-50", "text-blue-600"],
    rose: ["from-rose-400 to-red-600", "bg-rose-50", "text-rose-600"],
    amber: ["from-amber-400 to-orange-600", "bg-amber-50", "text-amber-600"],
    violet: ["from-violet-400 to-purple-600", "bg-violet-50", "text-violet-600"],
    emerald: ["from-emerald-400 to-teal-600", "bg-emerald-50", "text-emerald-600"],
  };
  const t = tones[tone];
  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="relative bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", t[0])} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold truncate">{label}</div>
          <div className="mt-0.5 text-[18px] font-bold text-slate-900 tabular-nums">{prefix}{display}{suffix}</div>
        </div>
        <div className={cn("h-7 w-7 rounded-lg grid place-items-center shrink-0", t[1])}>
          <Icon className={cn("h-3.5 w-3.5", t[2])} />
        </div>
      </div>
    </motion.div>
  );
}

// ============== WORKFLOW DATA ==============
type NodeStatus = "pending" | "running" | "completed" | "escalated" | "failed";

type WFNode = {
  id: string; label: string; sub: string; icon: any;
  start: number; duration: number; // seconds within simulation
};

const workflow: WFNode[] = [
  { id: "trigger", label: "Certificate Expiring", sub: "7 days · payments-prod", icon: AlertTriangle, start: 0, duration: 2 },
  { id: "discovery", label: "Discovery Engineer", sub: "Locate · classify · scope", icon: Compass, start: 2, duration: 3 },
  { id: "owner", label: "Owner Identification", sub: "CMDB + signals", icon: Users, start: 5, duration: 3 },
  { id: "risk", label: "Risk Analyst", sub: "Blast radius · revenue", icon: ShieldAlert, start: 8, duration: 3 },
  { id: "planner", label: "Renewal Planner", sub: "Window · approvals · order", icon: Workflow, start: 11, duration: 3 },
  { id: "deploy", label: "Deployment Engineer", sub: "LB · K8s · edge", icon: Rocket, start: 14, duration: 3 },
  { id: "validate", label: "Validation Engineer", sub: "Handshake · chain · health", icon: BadgeCheck, start: 17, duration: 3 },
  { id: "compliance", label: "Compliance Auditor", sub: "Evidence · attestation", icon: BookCheck, start: 20, duration: 3 },
  { id: "resolved", label: "Resolved", sub: "Audit-ready · zero impact", icon: CheckCircle2, start: 23, duration: 1 },
];

const TOTAL = 25; // total simulated seconds

// ============== HEADER ==============
function Header({ running, onToggle, onReset, t }: { running: boolean; onToggle: () => void; onReset: () => void; t: number }) {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
      className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200"
    >
      <div className="px-6 py-3 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-violet-500 animate-pulse" /> neurealm RunOps · Autonomous Operations
            </span>
            <span className="text-slate-300">·</span>
            <span>Mission Control</span>
          </div>
          <h1 className="text-[20px] font-bold text-slate-900 leading-tight truncate flex items-center gap-2">
            Agentic Execution Center
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">LIVE</span>
          </h1>
          <div className="text-[12px] text-slate-500">
            The digital coworkers do not alert. They perform the work — detect, decide, execute, and prove.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <Hourglass className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-600 font-semibold tabular-nums">T+{t.toFixed(1)}s</span>
          </div>
          <button onClick={onReset} className="h-9 px-3 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-semibold flex-row gap-1.5 flex">
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
          <button onClick={onToggle} className={cn("h-9 px-3 grid place-items-center rounded-lg text-white text-[12px] font-semibold flex-row gap-1.5 flex shadow-sm",
            running ? "bg-amber-600 hover:bg-amber-700" : "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
          )}>
            {running ? <><PauseCircle className="h-4 w-4" /> Pause Simulation</> : <><PlayCircle className="h-4 w-4" /> Run Simulation</>}
          </button>
        </div>
      </div>
    </motion.header>
  );
}

// ============== STATUS HELPERS ==============
function nodeStatus(node: WFNode, t: number): NodeStatus {
  if (t < node.start) return "pending";
  if (t < node.start + node.duration) return "running";
  return "completed";
}
const statusTone: Record<NodeStatus, { ring: string; bg: string; text: string; dot: string; label: string }> = {
  pending:    { ring: "ring-slate-200", bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300", label: "Pending" },
  running:    { ring: "ring-violet-300", bg: "bg-gradient-to-br from-violet-50 to-blue-50", text: "text-violet-700", dot: "bg-violet-500", label: "Running" },
  completed:  { ring: "ring-emerald-300", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Completed" },
  escalated:  { ring: "ring-amber-300", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Escalated" },
  failed:     { ring: "ring-rose-300", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Failed" },
};

// ============== WORKFLOW CANVAS ==============
function WorkflowCanvas({ t, onSelect, onDeep }: { t: number; onSelect: (id: string) => void; onDeep: (id: string) => void }) {
  // 3 rows x 3 cols positions
  const cols = 3;
  const positions = workflow.map((_, i) => ({ col: i % cols, row: Math.floor(i / cols) }));
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(circle_at_20%_30%,hsl(220,90%,60%)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,hsl(270,80%,60%)_0%,transparent_50%)]" />
      <div className="flex items-center justify-between mb-3 relative">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Autonomous Workflow Canvas</div>
          <div className="text-[15px] font-bold text-slate-900">Detect → Decide → Execute → Prove</div>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> Pending</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" /> Running</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 relative">
        {workflow.map((n, i) => {
          const s = nodeStatus(n, t);
          const tone = statusTone[s];
          const Icon = n.icon;
          const progress = s === "running" ? Math.min(1, (t - n.start) / n.duration) : s === "completed" ? 1 : 0;
          const pos = positions[i];
          const nextPos = positions[i + 1];
          return (
            <div key={n.id} className="relative">
              <motion.button
                type="button"
                onClick={() => onSelect(n.id)}
                onDoubleClick={() => onDeep(n.id)}
                whileHover={{ y: -3 }}
                animate={s === "running" ? { boxShadow: ["0 0 0 0 rgba(139,92,246,0.4)", "0 0 0 10px rgba(139,92,246,0)"] } : {}}
                transition={s === "running" ? { duration: 1.4, repeat: Infinity } : {}}
                className={cn("w-full text-left rounded-xl p-3 ring-2 transition-all relative overflow-hidden", tone.ring, tone.bg)}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn("h-9 w-9 rounded-lg grid place-items-center bg-white shadow-sm", tone.text)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-[12.5px] font-bold text-slate-900 truncate">{n.label}</div>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1", tone.text)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot, s === "running" && "animate-pulse")} />
                        {tone.label}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-600 truncate">{n.sub}</div>
                    <div className="mt-1.5 h-1 rounded-full bg-white/70 overflow-hidden">
                      <motion.div
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.3 }}
                        className={cn("h-full rounded-full", s === "completed" ? "bg-emerald-500" : "bg-gradient-to-r from-violet-500 to-blue-500")}
                      />
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Arrow to next */}
              {nextPos && (
                <>
                  {nextPos.row === pos.row && nextPos.col > pos.col && (
                    <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-3 h-6">
                      <ChevronRight className={cn("h-4 w-4", s === "completed" ? "text-emerald-500" : "text-slate-300")} />
                    </div>
                  )}
                  {nextPos.row > pos.row && pos.col === cols - 1 && (
                    <div className="hidden md:block absolute -bottom-3 right-3 z-10">
                      <ChevronRight className={cn("h-4 w-4 rotate-90", s === "completed" ? "text-emerald-500" : "text-slate-300")} />
                    </div>
                  )}
                  {nextPos.row > pos.row && pos.col === 0 && nextPos.col === 0 && (
                    <div className="hidden md:block absolute -bottom-3 left-3 z-10">
                      <ChevronRight className={cn("h-4 w-4 rotate-90", s === "completed" ? "text-emerald-500" : "text-slate-300")} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============== LIVE TIMELINE ==============
const timelineEvents = [
  { tStart: 1.5, time: "09:01", text: "Certificate identified", detail: "payments-prod *.pay.acme.com · 7d", icon: AlertTriangle, tone: "amber" },
  { tStart: 4.5, time: "09:02", text: "Owner identified", detail: "Payments SRE · 99% confidence", icon: Users, tone: "blue" },
  { tStart: 7.5, time: "09:03", text: "Risk score calculated", detail: "Blast radius · 14 apps · $12.4M", icon: ShieldAlert, tone: "rose" },
  { tStart: 10.5, time: "09:05", text: "Renewal submitted", detail: "DigiCert · ACME · auto-approved", icon: Workflow, tone: "violet" },
  { tStart: 13.5, time: "09:07", text: "Certificate issued", detail: "Chain validated · key escrowed", icon: KeyRound, tone: "blue" },
  { tStart: 16.5, time: "09:09", text: "Deployment completed", detail: "12 LBs · 8 ingress · 4 edges", icon: Rocket, tone: "blue" },
  { tStart: 19.5, time: "09:11", text: "Validation passed", detail: "Handshake 100% · OCSP stapled", icon: CheckCircle2, tone: "emerald" },
  { tStart: 22.5, time: "09:13", text: "Audit evidence generated", detail: "PCI · SOC2 · ISO27001 packs", icon: BookCheck, tone: "violet" },
  { tStart: 24, time: "09:14", text: "Workflow closed", detail: "Zero impact · audit-ready", icon: CheckCircle2, tone: "emerald" },
];

const evTone: Record<string, string> = {
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  rose: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

function LiveTimeline({ t }: { t: number }) {
  const visible = timelineEvents.filter(e => t >= e.tStart);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[520px]">
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Live Execution Timeline</div>
          <div className="text-[14px] font-bold text-slate-900">Real-time events</div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
          </span>
          Streaming
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ol className="relative border-l border-slate-200 ml-3 space-y-2">
          <AnimatePresence initial={false}>
            {[...visible].reverse().map((e) => (
              <motion.li
                key={e.time}
                initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="ml-3 relative"
              >
                <span className={cn("absolute -left-[19px] top-1 h-3 w-3 rounded-full ring-2 ring-white", e.tone === "emerald" ? "bg-emerald-500" : e.tone === "rose" ? "bg-rose-500" : e.tone === "amber" ? "bg-amber-500" : e.tone === "violet" ? "bg-violet-500" : "bg-blue-500")} />
                <div className="rounded-lg border border-slate-100 bg-white p-2.5 hover:bg-slate-50/60">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("h-6 w-6 rounded-md grid place-items-center shrink-0", evTone[e.tone])}>
                        <e.icon className="h-3 w-3" />
                      </div>
                      <div className="text-[11.5px] font-semibold text-slate-900">{e.text}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 tabular-nums shrink-0">{e.time}</div>
                  </div>
                  <div className="ml-8 text-[10.5px] text-slate-500 mt-0.5">{e.detail}</div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {visible.length === 0 && (
            <div className="text-[11px] text-slate-400 italic ml-3">Awaiting simulation start…</div>
          )}
        </ol>
      </div>
    </div>
  );
}

// ============== COWORKER ACTION CARDS ==============
const coworkers = [
  { id: "discovery", role: "Discovery Engineer", initials: "AC", accent: "blue", evidence: ["Cert metadata", "Inventory delta", "SAN list"], expected: "Locate cert + scope", action: "Querying CMDB + cloud APIs" },
  { id: "owner", role: "Owner Identification", initials: "OI", accent: "blue", evidence: ["CMDB owner", "Code-owner file", "Last requester"], expected: "Confirm authoritative owner", action: "Cross-checking ownership signals" },
  { id: "risk", role: "Risk Analyst", initials: "MH", accent: "amber", evidence: ["42 dependencies", "Tier 1 exposure", "Customer fan-out"], expected: "Blast radius + recommendation", action: "Calculating blast radius" },
  { id: "planner", role: "Renewal Planner", initials: "PN", accent: "violet", evidence: ["Maintenance window", "Approval chain", "Change record"], expected: "Approved renewal plan", action: "Coordinating CAB + window" },
  { id: "deploy", role: "Deployment Engineer", initials: "DR", accent: "blue", evidence: ["Target inventory", "Rollback snapshot", "Binding map"], expected: "Production deployment", action: "Updating LB + K8s bindings" },
  { id: "validate", role: "Validation Engineer", initials: "VE", accent: "emerald", evidence: ["Handshake probes", "Chain trust", "Service health"], expected: "Customer-visible health", action: "Probing endpoints worldwide" },
  { id: "compliance", role: "Compliance Auditor", initials: "HL", accent: "violet", evidence: ["PCI evidence", "SOC2 attestation", "ISO control mapping"], expected: "Audit-grade evidence", action: "Assembling evidence packs" },
];

const accentBg: Record<string, string> = {
  blue: "from-sky-400 to-blue-600", emerald: "from-emerald-400 to-teal-600",
  violet: "from-violet-400 to-purple-600", amber: "from-amber-400 to-orange-600",
};

function CoworkerActionCards({ t, onSelect, onDeep }: { t: number; onSelect: (id: string) => void; onDeep: (id: string) => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Digital Coworker Actions</div>
          <div className="text-[14px] font-bold text-slate-900">Active coworkers on this execution</div>
        </div>
        <div className="text-[10px] text-slate-500">7 coworkers · 0 escalations</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {coworkers.map((c, i) => {
          const node = workflow.find(n => n.id === c.id)!;
          const s = nodeStatus(node, t);
          const tone = statusTone[s];
          const progress = s === "running" ? Math.min(1, (t - node.start) / node.duration) : s === "completed" ? 1 : 0;
          const confidence = 92 + Math.round(progress * 6);
          const evidenceShown = s === "completed" ? c.evidence : s === "running" ? c.evidence.slice(0, 1 + Math.floor(progress * (c.evidence.length - 1))) : [];
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              onDoubleClick={() => onDeep(c.id)}
              initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}
              whileHover={{ y: -3 }}
              className="text-left bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="flex items-start gap-2.5">
                <div className="relative">
                  <div className={cn("h-10 w-10 rounded-lg bg-gradient-to-br grid place-items-center text-white font-bold text-[11px] shadow-sm", accentBg[c.accent])}>
                    {c.initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-white grid place-items-center">
                    <span className={cn("h-2 w-2 rounded-full", tone.dot, s === "running" && "animate-pulse")} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-slate-900 truncate">{c.role}</div>
                  <div className={cn("text-[10px] font-semibold", tone.text)}>{tone.label}</div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="rounded-md bg-slate-50 px-2 py-1">
                  <div className="text-slate-500">Confidence</div>
                  <div className="font-bold text-slate-900 tabular-nums">{s === "pending" ? "—" : `${confidence}%`}</div>
                </div>
                <div className="rounded-md bg-slate-50 px-2 py-1">
                  <div className="text-slate-500">Approval</div>
                  <div className="font-bold text-emerald-700">Preapproved</div>
                </div>
              </div>
              <div className="mt-2 rounded-md border border-slate-100 px-2 py-1.5">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Current Action</div>
                <div className="text-[11px] text-slate-700">{s === "pending" ? "Awaiting upstream signals" : s === "completed" ? "Handed off · evidence sealed" : c.action}</div>
              </div>
              <div className="mt-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Evidence Collected</div>
                <div className="flex flex-wrap gap-1">
                  {evidenceShown.length === 0 && <span className="text-[10px] text-slate-400 italic">—</span>}
                  <AnimatePresence>
                    {evidenceShown.map(e => (
                      <motion.span key={e} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {e}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-500"><span className="font-semibold">Expected:</span> {c.expected}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ============== EVIDENCE PANEL ==============
const allEvidence = [
  { id: "meta", label: "Certificate metadata", tStart: 2, icon: FileText, tone: "blue" },
  { id: "chain", label: "Certificate chain", tStart: 3, icon: Layers, tone: "blue" },
  { id: "owner", label: "Owner records", tStart: 5, icon: Users, tone: "blue" },
  { id: "cmdb", label: "CMDB references", tStart: 6, icon: Network, tone: "blue" },
  { id: "dns", label: "DNS validation", tStart: 11, icon: Globe, tone: "violet" },
  { id: "ca", label: "CA response", tStart: 13, icon: BadgeCheck, tone: "violet" },
  { id: "deploy", label: "Deployment validation", tStart: 16, icon: Rocket, tone: "emerald" },
  { id: "health", label: "Service health checks", tStart: 19, icon: Activity, tone: "emerald" },
  { id: "ctrl", label: "Compliance controls", tStart: 21, icon: Lock, tone: "violet" },
  { id: "audit", label: "Audit evidence", tStart: 23, icon: FileCheck, tone: "emerald" },
];

function EvidencePanel({ t }: { t: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Evidence Engine</div>
          <div className="text-[14px] font-bold text-slate-900">Evidence assembled in real time</div>
        </div>
        <div className="text-[10px] text-slate-500">{allEvidence.filter(e => t >= e.tStart).length}/{allEvidence.length} sealed</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {allEvidence.map(e => {
          const ready = t >= e.tStart;
          return (
            <motion.div
              key={e.id}
              animate={{ opacity: ready ? 1 : 0.35, y: ready ? 0 : 4 }}
              transition={{ duration: 0.4 }}
              className={cn("rounded-lg border px-2.5 py-2 flex items-start gap-2 transition-all",
                ready ? "border-slate-200 bg-white shadow-sm" : "border-dashed border-slate-200 bg-slate-50/30")}
            >
              <div className={cn("h-7 w-7 rounded-md grid place-items-center shrink-0", evTone[e.tone])}>
                <e.icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-900 truncate">{e.label}</div>
                <div className="text-[9.5px] text-slate-500">{ready ? "Sealed" : "Pending"}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============== CONFIDENCE GAUGES ==============
function Gauge2({ label, value, t, threshold }: { label: string; value: number; t: number; threshold: number }) {
  const active = t >= threshold;
  const display = active ? value : 0;
  const animVal = useCountUp(display);
  const pct = Math.min(100, Math.max(0, animVal));
  const r = 32;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[88px] w-[88px]">
        <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <motion.circle cx="40" cy="40" r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="7"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-[15px] font-bold text-slate-900 tabular-nums">{Math.round(animVal)}%</div>
          </div>
        </div>
      </div>
      <div className="text-[10.5px] text-slate-600 font-semibold mt-1 text-center">{label}</div>
    </div>
  );
}

function ConfidenceEngine({ t }: { t: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Confidence Engine</div>
      <div className="text-[14px] font-bold text-slate-900 mb-3">Decision-grade certainty</div>
      <div className="grid grid-cols-4 gap-2">
        <Gauge2 label="Owner" value={99} t={t} threshold={5} />
        <Gauge2 label="Deployment" value={97} t={t} threshold={14} />
        <Gauge2 label="Validation" value={100} t={t} threshold={17} />
        <Gauge2 label="Overall" value={97.4} t={t} threshold={2} />
      </div>
    </div>
  );
}

// ============== APPROVAL ENGINE ==============
function ApprovalEngine() {
  const rows = [
    { label: "Renewal", decision: "Preapproved", tone: "emerald" },
    { label: "Deployment", decision: "Preapproved", tone: "emerald" },
    { label: "Revocation", decision: "Human Approval Required", tone: "amber" },
    { label: "CA Change", decision: "Human Approval Required", tone: "amber" },
    { label: "Rollback", decision: "No Approval Required", tone: "blue" },
    { label: "Emergency Override", decision: "Human + Audit", tone: "rose" },
  ];
  const toneBg: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Approval Engine</div>
          <div className="text-[14px] font-bold text-slate-900">Governance decision matrix</div>
        </div>
        <Lock className="h-4 w-4 text-slate-400" />
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <motion.div key={r.label} initial={{ x: -6, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}
            className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
            <span className="text-[12px] font-semibold text-slate-700">{r.label}</span>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", toneBg[r.tone])}>{r.decision}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============== BUSINESS IMPACT SIMULATION ==============
function BusinessImpactSim({ t }: { t: number }) {
  const resolved = t >= TOTAL - 1;
  const mix = Math.min(1, Math.max(0, (t - 8) / (TOTAL - 9)));
  const revenue = useCountUp(resolved ? 0 : Math.round(12.4 * (1 - mix) * 100) / 100);
  const customers = useCountUp(resolved ? 0 : Math.round(28000 * (1 - mix)));
  const services = useCountUp(resolved ? 0 : Math.round(8 * (1 - mix)));
  const risk = useCountUp(resolved ? 12 : Math.round(92 - mix * 80));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Business Impact Simulation</div>
          <div className="text-[14px] font-bold text-slate-900">Risk burndown in real time</div>
        </div>
        <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", resolved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
          {resolved ? "Resolved" : "In Flight"}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Revenue at Risk", before: "$12.4M", after: `$${revenue.toFixed(2)}M`, icon: DollarSign },
          { label: "Customers Impacted", before: "28,000", after: Math.round(customers).toLocaleString(), icon: Users },
          { label: "Critical Services", before: "8", after: Math.round(services).toString(), icon: Briefcase },
          { label: "Risk Score", before: "92", after: Math.round(risk).toString(), icon: Gauge },
        ].map((r, i) => (
          <motion.div key={r.label} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}
            className="rounded-xl border border-slate-200 p-3 bg-gradient-to-br from-white to-slate-50/50">
            <div className="flex items-center gap-2">
              <r.icon className="h-3.5 w-3.5 text-slate-400" />
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{r.label}</div>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[12px] font-bold text-rose-500 line-through opacity-70">{r.before}</span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-[16px] font-bold text-emerald-600 tabular-nums">{r.after}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============== OPERATIONAL WORKSPACE ==============
function OperationalWorkspace() {
  const rows = [
    { k: "Certificate", v: "*.pay.acme.com", icon: KeyRound },
    { k: "Owner", v: "Payments SRE", icon: Users },
    { k: "Business Service", v: "Checkout · Subscriptions", icon: Briefcase },
    { k: "Dependencies", v: "42 (14 apps · 28 infra)", icon: Network },
    { k: "Applications", v: "checkout-api · billing-svc · ...", icon: Layers },
    { k: "Servers", v: "184 nodes (k8s + VM)", icon: Server },
    { k: "Cloud Resources", v: "Azure West EU · AWS us-east-1", icon: Cloud },
    { k: "Load Balancers", v: "F5 BIG-IP · ALB · NetScaler", icon: Network },
    { k: "Certificate Authority", v: "DigiCert (ACME)", icon: BadgeCheck },
    { k: "Current State", v: "Expiring · 7 days", icon: Clock },
    { k: "Target State", v: "Renewed · audit-ready", icon: ShieldCheck },
    { k: "Execution State", v: "Autonomous · 97.4% confidence", icon: Sparkles },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Operational Workspace</div>
      <div className="text-[14px] font-bold text-slate-900 mb-3">Live entity state under execution</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {rows.map((r, i) => (
          <motion.div key={r.k} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.03 * i }}
            className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/40 px-2.5 py-1.5">
            <r.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{r.k}</div>
              <div className="text-[11.5px] text-slate-900 font-semibold truncate">{r.v}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============== OUTCOME DASHBOARD ==============
function OutcomeDashboard() {
  const rows = [
    { label: "Time to Detect", value: "2 min", icon: Eye },
    { label: "Time to Analyze", value: "3 min", icon: Cpu },
    { label: "Time to Renew", value: "4 min", icon: RefreshCw },
    { label: "Time to Deploy", value: "2 min", icon: Rocket },
    { label: "Time to Validate", value: "2 min", icon: CheckCircle2 },
    { label: "Total Resolution", value: "14 min", icon: Hourglass, highlight: true },
    { label: "Manual Hours Avoided", value: "6.5", icon: Clock },
    { label: "Incidents Prevented", value: "1", icon: ShieldCheck },
    { label: "Revenue Protected", value: "$12.4M", icon: DollarSign, highlight: true },
    { label: "Customers Protected", value: "28,000", icon: Users, highlight: true },
  ];
  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 text-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#3b82f6_0%,transparent_40%),radial-gradient(circle_at_80%_80%,#8b5cf6_0%,transparent_40%)]" />
      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide opacity-80 font-semibold">
          <Crown className="h-3.5 w-3.5" /> Executive Outcome
        </div>
        <div className="text-[16px] font-bold mb-3">Autonomous resolution · zero impact</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {rows.map((r, i) => (
            <motion.div key={r.label} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}
              className={cn("rounded-xl p-3 border", r.highlight ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10")}>
              <div className="flex items-center gap-2 opacity-80">
                <r.icon className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wide font-semibold">{r.label}</span>
              </div>
              <div className={cn("mt-1 font-bold tabular-nums", r.highlight ? "text-[20px] text-emerald-300" : "text-[16px]")}>{r.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============== CONTEXT PANEL ==============
const panelContent: Record<string, any> = {
  trigger: {
    title: "Trigger · Certificate Expiring", icon: AlertTriangle, tone: "amber",
    summary: "Continuous discovery detected that *.pay.acme.com is 7 days from expiration. Risk score 92, Tier 1 service, autonomous workflow engaged.",
    sections: [
      { title: "Signal", items: [["Source", "Discovery scan"], ["Detected", "T+0"]] },
      { title: "Trigger Criteria", items: [["Days Remaining", "7"], ["Tier", "1"], ["Risk Score", "92"]] },
    ],
  },
  discovery: {
    title: "Discovery Engineer", icon: Compass, tone: "blue",
    summary: "Locates the certificate across cloud, on-prem, and edge estates, classifies it, and scopes downstream dependencies for the rest of the workflow.",
    sections: [
      { title: "Discovery Sources", items: [["Cloud APIs", "Azure · AWS"], ["Network Scan", "F5 · NetScaler"], ["K8s", "147 clusters"]] },
      { title: "Certificates Found", items: [["Primary", "1"], ["Wildcard SAN", "12"]] },
      { title: "Inventory Coverage", items: [["Reconciled", "100%"], ["CMDB Synced", "Yes"]] },
      { title: "Evidence Gathered", items: [["Cert metadata", "Sealed"], ["SAN list", "Sealed"]] },
    ],
  },
  owner: {
    title: "Owner Identification Agent", icon: Users, tone: "blue",
    summary: "Cross-references CMDB ownership, code-owner files, last-requester telemetry, and Slack channel signals to produce a confidence-scored owner.",
    sections: [
      { title: "Ownership Analysis", items: [["CMDB Owner", "Payments SRE"], ["Code-Owner Match", "Yes"], ["Last Requester", "Aligned"]] },
      { title: "Business Service Mapping", items: [["Checkout", "Tier 1"], ["Subscriptions", "Tier 1"]] },
      { title: "Application Mapping", items: [["Apps", "14"], ["Surfaces", "Web · Mobile · API"]] },
      { title: "Confidence Calculation", items: [["Score", "99%"], ["Signals", "4/4 aligned"]] },
    ],
  },
  risk: {
    title: "Risk Analyst", icon: ShieldAlert, tone: "rose",
    summary: "Quantifies blast radius, revenue exposure, and customer fan-out — produces the recommendation that authorizes the renewal track.",
    sections: [
      { title: "Risk Calculation", items: [["Composite Score", "92"], ["Trend", "↑"]] },
      { title: "Business Impact", items: [["Services", "8"], ["Apps", "14"]] },
      { title: "Revenue Exposure", items: [["At-Risk", "$12.4M"], ["Per Hour", "$420k"]] },
      { title: "Customer Impact", items: [["Customers", "28,000"], ["Geographies", "NA · EU"]] },
      { title: "Recommendation", items: [["Action", "Proceed with renewal"], ["Override", "Not required"]] },
    ],
  },
  planner: {
    title: "Renewal Planner", icon: Workflow, tone: "violet",
    summary: "Selects renewal strategy, schedules maintenance window, confirms approval chain, and creates the change record consumed by deployment.",
    sections: [
      { title: "Renewal Strategy", items: [["CA", "DigiCert (ACME)"], ["Key", "ECC P-256"]] },
      { title: "Maintenance Window", items: [["Window", "T+30 min"], ["Conflicts", "None"]] },
      { title: "Approvals", items: [["CAB", "Preapproved"], ["Service Owner", "Preapproved"]] },
      { title: "Scheduling", items: [["Order", "LB → Ingress → Edge"]] },
    ],
  },
  deploy: {
    title: "Deployment Engineer", icon: Rocket, tone: "blue",
    summary: "Executes the validated rollout across load balancers, ingress controllers, and edge nodes with pre-staged rollback at every step.",
    sections: [
      { title: "Deployment Targets", items: [["F5 LBs", "12"], ["K8s Ingress", "8"], ["Edge / CDN", "4"]] },
      { title: "Rollback Plan", items: [["Pre-Staged", "100%"], ["Mean Rollback", "42s"]] },
      { title: "Infrastructure Impact", items: [["Customer-Facing Restart", "0"], ["Bindings Updated", "184"]] },
      { title: "Validation Requirements", items: [["Handshake", "Required"], ["Chain", "Required"]] },
    ],
  },
  validate: {
    title: "Validation Engineer", icon: BadgeCheck, tone: "emerald",
    summary: "Probes endpoints globally, validates trust chains, checks OCSP stapling, and confirms customer-visible service health is fully green.",
    sections: [
      { title: "Endpoint Validation", items: [["Probes Run", "1,240"], ["Pass Rate", "100%"]] },
      { title: "Chain Validation", items: [["Trust", "OK"], ["Stapled OCSP", "Yes"]] },
      { title: "Service Health", items: [["RUM Errors", "0"], ["Synthetic", "Green"]] },
      { title: "Customer Impact Validation", items: [["Sessions", "Stable"], ["Latency", "Δ 0ms"]] },
    ],
  },
  compliance: {
    title: "Compliance Auditor", icon: BookCheck, tone: "violet",
    summary: "Assembles audit-grade evidence packs aligned to PCI-DSS, SOC2, and ISO 27001 — published continuously, ready for external attestation.",
    sections: [
      { title: "Audit Evidence", items: [["Artifacts", "27"], ["Sealed", "100%"]] },
      { title: "Compliance Mapping", items: [["PCI-DSS", "Yes"], ["SOC2", "Yes"], ["ISO27001", "Yes"]] },
      { title: "Framework Alignment", items: [["Controls Touched", "14"]] },
      { title: "Evidence Generated", items: [["Cert lifecycle log", "Sealed"], ["Approval chain", "Sealed"]] },
    ],
  },
  resolved: {
    title: "Resolved", icon: CheckCircle2, tone: "emerald",
    summary: "Certificate renewed. Services validated. Risk score collapsed from 92 to 12. Audit evidence published. Zero customer impact.",
    sections: [
      { title: "Final State", items: [["Outcome", "Success"], ["Total Time", "14 min"]] },
      { title: "Impact", items: [["Revenue Saved", "$12.4M"], ["Customers Saved", "28,000"]] },
    ],
  },
};

function ContextPanel({ id, deep, onClose }: { id: string | null; deep: boolean; onClose: () => void }) {
  const content = id ? panelContent[id] : null;
  const [tab, setTab] = useState("evidence");
  useEffect(() => { setTab("evidence"); }, [id, deep]);
  if (!content) return (
    <Sheet open={!!id} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[40%] p-0" />
    </Sheet>
  );
  const Icon = content.icon;
  const toneMap: Record<string, string[]> = {
    blue: ["from-sky-500 to-blue-600"],
    violet: ["from-violet-500 to-purple-600"],
    amber: ["from-amber-500 to-orange-600"],
    rose: ["from-rose-500 to-red-600"],
    emerald: ["from-emerald-500 to-teal-600"],
  };
  return (
    <Sheet open={!!id} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[40%] p-0 overflow-y-auto">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={cn("h-11 w-11 rounded-xl bg-gradient-to-br grid place-items-center text-white shadow-sm", toneMap[content.tone][0])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-[15px] truncate">{content.title}</SheetTitle>
              <div className="text-[12px] text-slate-500">{deep ? "Advanced Execution Workspace" : "Node Detail"}</div>
            </div>
            <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-500"><X className="h-4 w-4" /></button>
          </div>
          {deep && <div className="mt-2 flex gap-1.5"><span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-semibold">Workspace Mode</span></div>}
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
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3">
              <div className="text-[11px] uppercase tracking-wide text-violet-700 font-semibold mb-1">Tip</div>
              <div className="text-[12px] text-slate-700">Double-click the node to open the advanced execution workspace with evidence, approvals, dependencies, timeline, automation, and impact tabs.</div>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-1 flex flex-wrap gap-1 mb-3">
              {["evidence", "approvals", "workflow", "dependencies", "timeline", "coworker", "automation", "impact", "risk"].map(tt => (
                <button key={tt} onClick={() => setTab(tt)}
                  className={cn("px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize",
                    tab === tt ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:bg-white/60")}>
                  {tt}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[12px] font-bold text-slate-900 mb-2 capitalize">{content.title} · {tab}</div>
              {tab === "evidence" && (
                <ul className="space-y-1.5 text-[12px]">
                  {["Run log", "Approval chain", "Validation probes", "Audit attestation"].map((e, i) => (
                    <li key={e} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-slate-400" />{e} #{84000 + i}</span>
                      <span className="text-[10px] font-semibold text-emerald-700">Sealed</span>
                    </li>
                  ))}
                </ul>
              )}
              {tab === "approvals" && (
                <div className="space-y-1.5 text-[12px]">
                  {[["Service Owner", "Auto-approved"], ["CAB", "Preapproved"], ["Security", "Preapproved"], ["Emergency Override", "Not used"]].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <span className="text-slate-700">{k}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "workflow" && (
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {["Detect", "Decide", "Plan", "Execute", "Prove"].map((s, i) => (
                    <div key={s} className={cn("rounded-lg px-2 py-2 text-[11px] font-semibold",
                      i < 3 ? "bg-emerald-50 text-emerald-700" : i === 3 ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700")}>{s}</div>
                  ))}
                </div>
              )}
              {tab === "dependencies" && (
                <ul className="space-y-1.5 text-[12px] text-slate-700">
                  {["Upstream node handoff", "CMDB ownership lookup", "CA ACME endpoint", "Load balancer fleet"].map(d => (
                    <li key={d} className="flex items-center gap-2"><Network className="h-3.5 w-3.5 text-slate-400" /> {d}</li>
                  ))}
                </ul>
              )}
              {tab === "timeline" && (
                <ol className="relative border-l border-slate-200 ml-2 space-y-3">
                  {["Activated", "Evidence assembled", "Decision rendered", "Action executed", "Handoff sealed"].map((e, i) => (
                    <li key={e} className="ml-3">
                      <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-violet-500" />
                      <div className="text-[12px] font-semibold text-slate-900">{e}</div>
                      <div className="text-[10px] text-slate-500">{i + 1}s ago</div>
                    </li>
                  ))}
                </ol>
              )}
              {tab === "coworker" && (
                <div className="text-[12px] text-slate-700">
                  <div className="flex items-center gap-2 mb-2"><Bot className="h-4 w-4 text-violet-600" /><span className="font-semibold">Coworker actions</span></div>
                  <ul className="space-y-1.5">
                    {["Gathered context", "Calculated confidence", "Executed authorized action", "Sealed evidence"].map(x => (
                      <li key={x} className="rounded-lg bg-slate-50 px-3 py-2">{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              {tab === "automation" && (
                <ul className="space-y-1.5 text-[12px]">
                  {[["ACME orchestrator", "Running"], ["Binding refresh", "Running"], ["Evidence publisher", "Running"]].map(([n, s]) => (
                    <li key={n} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <span className="flex items-center gap-2 text-slate-700"><Zap className="h-3.5 w-3.5 text-emerald-500" />{n}</span>
                      <span className="text-[10px] font-semibold text-emerald-700">{s}</span>
                    </li>
                  ))}
                </ul>
              )}
              {tab === "impact" && (
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {[["Revenue Protected", "$12.4M"], ["Customers", "28,000"], ["Services", "8"], ["Outage Avoided", "Yes"]].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-slate-600">{k}</span><span className="font-bold text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "risk" && (
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {[["Pre-Execution", "92"], ["Post-Execution", "12"], ["Δ", "−80"], ["Confidence", "97.4%"]].map(([k, v]) => (
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
export default function AgenticExecutionCenter() {
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [deep, setDeep] = useState(false);
  const last = useRef(performance.now());

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      if (running) {
        setT(prev => {
          const next = prev + dt;
          return next > TOTAL ? TOTAL : next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const reset = () => { setT(0); setRunning(true); last.current = performance.now(); };

  const kpis = [
    { label: "Cert Risk Score", value: 92, icon: Gauge, tone: "rose", delay: 0 },
    { label: "Days Remaining", value: 7, icon: Clock, tone: "amber", delay: 0.04 },
    { label: "Affected Apps", value: 14, icon: Layers, tone: "amber", delay: 0.08 },
    { label: "Business Services", value: 8, icon: Briefcase, tone: "amber", delay: 0.12 },
    { label: "Customers Impacted", value: 28000, icon: Users, tone: "rose", delay: 0.16 },
    { label: "Revenue Exposure", value: 12.4, prefix: "$", suffix: "M", decimals: 1, icon: DollarSign, tone: "rose", delay: 0.2 },
    { label: "Coworkers Active", value: 7, icon: Bot, tone: "violet", delay: 0.24 },
    { label: "Confidence", value: 97.4, suffix: "%", decimals: 1, icon: Sparkles, tone: "violet", delay: 0.28 },
    { label: "Expected Resolution", value: 14, suffix: " min", icon: Hourglass, tone: "emerald", delay: 0.32 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/40 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header running={running} onToggle={() => setRunning(r => !r)} onReset={reset} t={t} />
        <main className="px-6 py-5 space-y-5">
          {/* Progress strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide px-2">Execution</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div animate={{ width: `${(t / TOTAL) * 100}%` }} transition={{ duration: 0.2 }}
                className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 tabular-nums px-2">{Math.round((t / TOTAL) * 100)}%</span>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-2.5">
            {kpis.map(k => <Kpi key={k.label} {...k} />)}
          </div>

          {/* Workflow + Timeline */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <WorkflowCanvas t={t}
                onSelect={(id) => { setSelected(id); setDeep(false); }}
                onDeep={(id) => { setSelected(id); setDeep(true); }}
              />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <LiveTimeline t={t} />
            </div>
          </div>

          {/* Coworker action cards */}
          <CoworkerActionCards t={t}
            onSelect={(id) => { setSelected(id); setDeep(false); }}
            onDeep={(id) => { setSelected(id); setDeep(true); }}
          />

          {/* Evidence + Confidence + Approval */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-6"><EvidencePanel t={t} /></div>
            <div className="col-span-12 md:col-span-6 xl:col-span-3"><ConfidenceEngine t={t} /></div>
            <div className="col-span-12 md:col-span-6 xl:col-span-3"><ApprovalEngine /></div>
          </div>

          {/* Impact + Workspace */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-7"><BusinessImpactSim t={t} /></div>
            <div className="col-span-12 xl:col-span-5"><OperationalWorkspace /></div>
          </div>

          {/* Outcome */}
          <OutcomeDashboard />

          <div className="text-center text-[11px] text-slate-400 py-3">
            neurealm RunOps · Agentic Execution Center · Autonomous certificate operations with auditable evidence
          </div>
        </main>
      </div>

      <ContextPanel id={selected} deep={deep} onClose={() => setSelected(null)} />
    </div>
  );
}
