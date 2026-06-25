import { useEffect, useState, useMemo, useCallback, useRef, memo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, Bell, ChevronDown, Factory, HelpCircle, Info, LayoutGrid, MapPin, Maximize2, Search, ShieldCheck, Sparkles, TrendingDown, TrendingUp, Wrench, Bot, Gauge, Lightbulb, GitBranch, Share2, Building2, Network as NetIcon, Boxes, Cpu, Workflow, CheckCircle2, Gavel, Brain, Scale, Command as CommandIcon, RefreshCw, Pause, Play, Clock, Filter, X, ArrowRight, Zap, Target as TargetIcon, BookOpen, Users, UserCheck, FlaskConical, MessageSquare, Network,
} from "lucide-react";
import {
  Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";
import { SelectionDrawer } from "@/features/foc-twin/SelectionDrawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Lazy-load heavy 3D viewport — improves TTI considerably.
const DigitalTwinViewport = lazy(() =>
  import("@/features/foc-twin/DigitalTwinViewport").then((m) => ({ default: m.DigitalTwinViewport })),
);

/* =====================================================================
   Factory Operations Command Center — Texas Instruments DFW Fab
   ===================================================================== */

/* ---------- mock data ---------- */

const KPIS = [
  { id: "health", label: "Factory Health Index", help: "Composite score across equipment, yield, throughput, utilities and safety.", value: 87, suffix: "/100", caption: "Good", captionColor: "text-emerald-400", trend: "▲ 3 pts vs yesterday", spark: [82,84,81,85,84,87,87], donut: 87, donutColor: "#22c55e" },
  { id: "pci", label: "Productive Capacity Index", help: "Effective wafer-start capacity vs theoretical maximum.", value: 82, suffix: "/100", caption: "Good", captionColor: "text-emerald-400", trend: "▲ 4 pts vs yesterday", spark: [76,78,79,80,81,81,82], donut: 82, donutColor: "#22c55e" },
  { id: "oee", label: "OEE", help: "Availability × Performance × Quality (rolling 24h).", value: 78.6, suffix: "%", trend: "▲ 2.1% vs yesterday", spark: [74,75,76,76,77,78,78.6] },
  { id: "tp", label: "Total Throughput", help: "Wafer outs in the last 24 hours across all product families.", value: 52340, suffix: " wfr/day", trend: "▲ 3.1% vs target (51,000)", spark: [50100,50800,51200,51600,51900,52150,52340] },
  { id: "wip", label: "WIP Lots", help: "Open lots currently moving through the fab.", value: 8742, suffix: " lots", trend: "▲ 1.2% vs yesterday", spark: [8500,8550,8600,8650,8680,8720,8742] },
  { id: "safety", label: "Safety", help: "OSHA recordable events month-to-date.", value: 0, suffix: "", caption: "Recordable Events", sub: "This Month" },
];

const AI_OBSERVATIONS = [
  { id: 1, sev: "warn",  icon: AlertTriangle, title: "Maintenance opportunity detected on ETCH-217", sub: "Health degradation pattern observed", time: "10m" },
  { id: 2, sev: "info",  icon: Info,           title: "High queue building at CMP Area",              sub: "Queue time > threshold for 18 min",   time: "18m" },
  { id: 3, sev: "info",  icon: Info,           title: "Metrology tool utilization above normal",      sub: "Increased load on MET-217, MET-219",  time: "25m" },
  { id: 4, sev: "info",  icon: Info,           title: "Utility system operating optimally",           sub: "All critical utilities within normal range", time: "32m" },
  { id: 5, sev: "info",  icon: Info,           title: "3 new lots started in LITH-021",               sub: "Monitor for cycle time impact",       time: "45m" },
  { id: 6, sev: "ok",    icon: CheckCircle2,   title: "Dispatch plan on track",                       sub: "All priority lots meeting commitments", time: "1h" },
];

const SEV_STYLES: Record<string, { color: string; bg: string; border: string; ring: string }> = {
  warn: { color: "text-amber-300",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   ring: "ring-amber-400/30" },
  info: { color: "text-sky-300",     bg: "bg-sky-500/10",     border: "border-sky-500/30",     ring: "ring-sky-400/30" },
  ok:   { color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", ring: "ring-emerald-400/30" },
  crit: { color: "text-rose-300",    bg: "bg-rose-500/10",    border: "border-rose-500/30",    ring: "ring-rose-400/30" },
};

const MAINTENANCE_OPS = [
  { id: "ETCH-217", name: "ETCH-217 (Metal Etch)",    priority: "High",   sev: "warn", window: "Tonight 10:00 PM – 2:00 AM", impact: "Increased risk of unplanned downtime", action: "Recommended" },
  { id: "CMP-038",  name: "CMP-038 (Polish)",          priority: "Medium", sev: "info", window: "Tomorrow 2:00 AM – 6:00 AM", impact: "Yield risk increasing" },
  { id: "PVD-142",  name: "PVD-142 (TiN Deposition)",  priority: "Low",    sev: "info", window: "Next Week",                  impact: "Minimal" },
  { id: "DIFF-011", name: "DIFF-011 (Diffusion)",      priority: "Low",    sev: "info", window: "Next Week",                  impact: "Minimal" },
];

const PRIORITY_STYLES: Record<string, string> = {
  High:   "bg-amber-500/15 text-amber-300 border-amber-500/40",
  Medium: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  Low:    "bg-slate-500/15 text-slate-300 border-slate-500/40",
};

const PRODUCTION_FAMILIES = [
  { family: "Logic 28nm",        wafers: 18420, pct: 35.2 },
  { family: "Analog 40nm",       wafers: 12850, pct: 24.6 },
  { family: "Power 65nm",        wafers:  9760, pct: 18.6 },
  { family: "Mixed Signal 90nm", wafers:  6240, pct: 11.9 },
  { family: "Other",             wafers:  5070, pct:  9.7 },
];

const EQUIPMENT_HEALTH = [
  { name: "Good (80-100)",   value: 798, pct: 63.9, color: "#22c55e" },
  { name: "Fair (60-79)",    value: 312, pct: 25.0, color: "#f59e0b" },
  { name: "Poor (<60)",      value:  98, pct:  7.9, color: "#ef4444" },
  { name: "Critical (<40)",  value:  40, pct:  3.2, color: "#dc2626" },
];

const UTILITY_STATUS = [
  { name: "Electricity",     status: "Good", util: 67, color: "#22c55e" },
  { name: "Nitrogen",        status: "Good", util: 65, color: "#22c55e" },
  { name: "Chilled Water",   status: "Good", util: 71, color: "#22c55e" },
  { name: "DI Water",        status: "Good", util: 58, color: "#22c55e" },
  { name: "Vacuum",          status: "Good", util: 63, color: "#22c55e" },
  { name: "Compressed Air",  status: "Good", util: 60, color: "#22c55e" },
];

const QUALITY_KPIS = [
  { label: "First Pass Yield",     value: "98.7", suffix: "%",   trend: [97.8,98.1,98.3,98.4,98.5,98.6,98.7] },
  { label: "Defect Density",       value: "0.23", suffix: "/cm²", trend: [0.31,0.29,0.27,0.26,0.25,0.24,0.23] },
  { label: "Escapes",              value: "2",    suffix: "",     trend: [5,4,4,3,3,2,2] },
  { label: "Customer Complaints",  value: "0",    suffix: "",     trend: [1,1,0,0,0,0,0] },
];

const BUSINESS_PRIORITIES = [
  { rank: 1, label: "Customer Commitments",  status: "On Track", statusColor: "text-emerald-400" },
  { rank: 2, label: "High Value Product Mix", status: "On Track", statusColor: "text-emerald-400" },
  { rank: 3, label: "Yield Improvement",      status: "On Track", statusColor: "text-emerald-400" },
  { rank: 4, label: "Cost Efficiency",        status: "On Track", statusColor: "text-emerald-400" },
  { rank: 5, label: "Capacity Optimization",  status: "At Risk",  statusColor: "text-amber-400" },
];

const PENDING_DECISIONS = [
  { icon: AlertTriangle, sev: "warn", title: "Maintenance Window Recommendation", target: "ETCH-217",        due: "1h 35m" },
  { icon: Cpu,           sev: "info", title: "Process Change Evaluation",         target: "CMP Area",        due: "2h 10m" },
  { icon: Workflow,      sev: "info", title: "Capacity Reallocation Proposal",    target: "Back End Area 2", due: "4h 20m" },
];

const ALERT_COUNTS = [
  { label: "Critical", count: 2, color: "text-rose-400",  sub: "Immediate action" },
  { label: "High",     count: 3, color: "text-amber-300", sub: "Need attention" },
  { label: "Medium",   count: 5, color: "text-yellow-300", sub: "Monitor closely" },
  { label: "Low",      count: 7, color: "text-sky-300",   sub: "Informational" },
];

const RECENT_EVENTS = [
  { t: "10:19 AM", title: "MET-217 vibration trend change detected",   tag: "Monitoring", tagColor: "text-amber-300" },
  { t: "10:15 AM", title: "Work Order WO-2025-05-217 created",         tag: "Maintenance", tagColor: "text-sky-300" },
  { t: "10:12 AM", title: "Bay 3 AMHS delay threshold exceeded",       tag: "Dispatch",    tagColor: "text-amber-300" },
  { t: "10:08 AM", title: "Chiller Loop B flow deviation",             tag: "Facilities",  tagColor: "text-amber-300" },
];

const SEARCH_INDEX = [
  { kind: "Tool", name: "ETCH-217", to: "/sead/equipment-health-intelligence" },
  { kind: "Tool", name: "CMP-038",  to: "/sead/equipment-health-intelligence" },
  { kind: "Tool", name: "PVD-142",  to: "/sead/equipment-health-intelligence" },
  { kind: "View", name: "Cross-Domain Context Twin",  to: "/sead/cross-domain-context-twin" },
  { kind: "View", name: "Maintenance Decision Sim",   to: "/sead/maintenance-decision-simulator" },
  { kind: "View", name: "Factory Impact Simulator",   to: "/sead/factory-impact-simulator" },
  { kind: "View", name: "AI Reasoning Playback",      to: "/sead/ai-reasoning-playback" },
  { kind: "View", name: "Confidence Explorer",        to: "/sead/confidence-explorer" },
  { kind: "View", name: "Explainability",             to: "/sead/explainability" },
  { kind: "View", name: "What If",                    to: "/sead/what-if" },
  { kind: "View", name: "Knowledge Graph",            to: "/sead/knowledge-graph" },
  { kind: "View", name: "Human Governance",           to: "/sead/human-governance-center" },
];

/* ---------- atoms ---------- */

const GlassCard = memo(function GlassCard({ children, className = "", onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={
        "relative rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.01] backdrop-blur-xl " +
        "shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_24px_60px_-32px_rgba(0,0,0,0.7)] " +
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:pointer-events-none " +
        className
      }
    >
      {children}
    </div>
  );
});

function useCountUp(target: number, duration = 900) {
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

function format(n: number) {
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toFixed(0);
}

const Spark = memo(function Spark({ data, color = "#38bdf8" }: { data: number[]; color?: string }) {
  const pts = useMemo(() => data.map((y, i) => ({ i, y })), [data]);
  const id = `sp-${color.replace("#", "")}`;
  return (
    <div className="h-9 w-full">
      <ResponsiveContainer>
        <AreaChart data={pts} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

function Donut({ value, color, size = 72 }: { value: number; color: string; size?: number }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const v = useCountUp(value);
  const off = c - (v / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeWidth="6" fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className="text-[18px] font-semibold text-white tabular-nums">{Math.round(v)}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">/100</div>
        </div>
      </div>
    </div>
  );
}

function InfoTip({ text }: { text: string }) {
  if (!text) return <Info className="h-3 w-3 text-slate-500" />;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-slate-500 hover:text-slate-300 transition" aria-label="More info">
          <Info className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] bg-slate-900 border-white/10 text-slate-100 text-[11px]">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function CardHeader({ title, action, sub, help }: { title: string; action?: React.ReactNode; sub?: string; help?: string }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-200 font-semibold flex items-center gap-1.5">
          {title}
          <InfoTip text={help ?? ""} />
        </div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

/* ---------- KPI card ---------- */

const KpiCard = memo(function KpiCard({ k }: { k: any }) {
  const v = useCountUp(typeof k.value === "number" ? k.value : 0);
  const isDecimal = String(k.value).includes(".");
  const valueDisplay =
    k.id === "tp" || k.id === "wip" ? format(v)
    : isDecimal ? v.toFixed(1)
    : Math.round(v).toString();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <GlassCard className="p-4 h-full hover:border-white/[0.14] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.15),0_24px_60px_-32px_rgba(0,0,0,0.7)] transition-all duration-300">
        <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold flex items-center gap-1.5">
          {k.label}
          <InfoTip text={k.help ?? ""} />
        </div>

        <div className="mt-3 flex items-start gap-3">
          {k.donut ? (
            <>
              <Donut value={k.donut} color={k.donutColor} size={68} />
              <div className="min-w-0 flex-1 mt-1">
                <div className={`text-[14px] font-semibold ${k.captionColor}`}>{k.caption}</div>
                <div className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {k.trend.replace(/[▲▼]\s?/, "")}
                </div>
              </div>
            </>
          ) : k.id === "safety" ? (
            <div className="flex items-start justify-between w-full">
              <div>
                <div className="text-[32px] font-semibold text-white tabular-nums leading-none">0</div>
                <div className="text-[11px] text-slate-300 mt-2">Recordable Events</div>
                <div className="text-[11px] text-slate-500">This Month</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 grid place-items-center shadow-[0_0_18px_-4px_rgba(16,185,129,0.55)]">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <div className="text-[28px] leading-none font-semibold text-white tabular-nums">
                  {valueDisplay}
                </div>
                <div className="text-[12px] text-slate-400 truncate">{k.suffix}</div>
              </div>
              <div className="mt-2 text-[11px] flex items-center gap-1 text-emerald-300/80">
                {k.trend.includes("▼") ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                <span className="truncate">{k.trend.replace(/[▲▼]\s?/, "")}</span>
              </div>
              <div className="mt-1 -mx-1">
                <Spark data={k.spark} color="#38bdf8" />
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
});

/* ---------- left rail ---------- */

const RAIL = [
  { icon: LayoutGrid, label: "Command Center",       to: "/sead/command-center", active: true },
  { icon: Boxes,      label: "Digital Twin",         to: "/sead/equipment-health-intelligence" },
  { icon: NetIcon,    label: "Cross-Domain",         to: "/sead/cross-domain-context-twin" },
  { icon: Wrench,     label: "Decision Sim",         to: "/sead/maintenance-decision-simulator" },
  { icon: Scale,      label: "Simulation\nCompare",  to: "/sead/simulation-comparison" },
  { icon: Factory,    label: "Factory Impact",       to: "/sead/factory-impact-simulator" },
  { icon: Sparkles,   label: "Decision Center",      to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel,      label: "Human\nGovernance",    to: "/sead/human-governance-center" },
  { icon: Brain,      label: "AI Reasoning",         to: "/sead/ai-reasoning-playback" },
  { icon: Gauge,      label: "Confidence",           to: "/sead/confidence-explorer" },
  { icon: Lightbulb,  label: "Explainability",       to: "/sead/explainability" },
  { icon: GitBranch,  label: "What If",              to: "/sead/what-if" },
  { icon: Share2,     label: "Knowledge\nGraph",     to: "/sead/knowledge-graph" },
  { icon: BookOpen, label: "Operational\nLearning", to: "/sead/operational-learning" },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker" },
  { icon: Users, label: "Multi-Agent\nCollaboration", to: "/sead/multi-agent-collaboration" },
  { icon: UserCheck, label: "Human-\nin-the-Loop", to: "/sead/human-in-the-loop" },
  { icon: FlaskConical, label: "Engineering\nSandbox", to: "/sead/engineering-sandbox" },
  { icon: MessageSquare, label: "Digital Coworker\nConversation", to: "/sead/digital-coworker-conversation" },
  { icon: Network, label: "IoT→AI\nArchitecture", to: "/sead/iot-ai-architecture" },
];

function ModuleRail() {
  const navigate = useNavigate();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5">
      {RAIL.map((r: any) => (
        <button
          key={r.label}
          onClick={() => r.to && navigate(r.to)}
          className={`group relative w-[72px] py-2.5 rounded-lg flex flex-col items-center gap-1 transition ${
            r.active
              ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <r.icon className={`h-[18px] w-[18px] transition ${r.active ? "" : "group-hover:drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]"}`} />
          <span className="text-[9.5px] leading-tight text-center px-1 whitespace-pre-line">{r.label}</span>
          {r.active && (
            <motion.span
              layoutId="rail-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]"
            />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ---------- Command Palette (⌘K) ---------- */

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return SEARCH_INDEX.slice(0, 8);
    return SEARCH_INDEX.filter((r) => r.name.toLowerCase().includes(s) || r.kind.toLowerCase().includes(s)).slice(0, 10);
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[14vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -10, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px] rounded-2xl border border-white/10 bg-[#0b1020]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 h-12 border-b border-white/[0.06]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onClose()}
                placeholder="Search tools, lots, recipes, work orders, views…"
                className="flex-1 bg-transparent text-[13px] text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <kbd className="text-[10px] px-1.5 h-5 grid place-items-center rounded bg-white/[0.06] border border-white/[0.08] text-slate-400">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-slate-500">No matches.</div>
              ) : results.map((r) => (
                <button
                  key={r.name}
                  onClick={() => { navigate(r.to); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/[0.04] transition"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 w-12">{r.kind}</span>
                  <span className="text-[13px] text-slate-100 flex-1">{r.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                </button>
              ))}
            </div>
            <div className="px-4 h-9 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500">
              <span>Press <kbd className="px-1 bg-white/[0.06] rounded">↵</kbd> to open</span>
              <span><kbd className="px-1 bg-white/[0.06] rounded">⌘</kbd> + <kbd className="px-1 bg-white/[0.06] rounded">K</kbd></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- top header ---------- */

function AppHeader({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 grid place-items-center shadow-[0_0_28px_-6px_rgba(244,63,94,0.7)] font-black text-white text-[15px] tracking-tight">
          TI
        </div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Texas Instruments</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Factory Operations Command Center</div>
          <div className="text-[11px] text-slate-400">Real-time Operational Intelligence — DFW Semiconductor Fab</div>
        </div>
      </div>

      <div className="flex-1" />

      <button
        onClick={onOpenPalette}
        className="group relative w-[300px] h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] pl-9 pr-12 text-left text-[12px] text-slate-400 hover:border-sky-400/40 hover:bg-white/[0.05] transition"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        Search tools, lots, recipes, views…
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 h-5 px-1.5 grid place-items-center rounded text-[10px] text-slate-400 bg-white/[0.05] border border-white/[0.08]">⌘K</kbd>
      </button>

      <button className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-200 hover:bg-white/[0.06]">
        <Factory className="h-4 w-4 text-sky-400" />
        <div className="text-left leading-tight">
          <div className="font-medium">DFW Semiconductor Fab</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" /> Richardson, Texas
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      <div className="text-right leading-tight">
        <div className="text-[12px] text-slate-200 tabular-nums">{date} • {time} CT</div>
        <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="relative rounded-full bg-emerald-400 h-1.5 w-1.5" />
          </span>
          Live
        </div>
      </div>

      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">5</span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <HelpCircle className="h-4 w-4" />
      </button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-[11px] font-bold text-white">AO</div>
    </header>
  );
}

/* ---------- Control bar (time range + refresh) ---------- */

const TIME_RANGES = ["1h", "8h", "24h", "7d", "30d"] as const;
type TimeRange = typeof TIME_RANGES[number];

function ControlBar({
  range, onRange, autoRefresh, setAutoRefresh, countdown,
}: { range: TimeRange; onRange: (r: TimeRange) => void; autoRefresh: boolean; setAutoRefresh: (b: boolean) => void; countdown: number }) {
  return (
    <div className="flex flex-wrap items-center gap-3 -mt-1">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Clock className="h-3.5 w-3.5" /> Range
      </div>
      <div className="flex rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        {TIME_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => onRange(r)}
            className={`px-2.5 h-7 text-[11px] font-medium transition ${
              range === r ? "bg-sky-500/20 text-sky-200" : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
            }`}
          >{r}</button>
        ))}
      </div>

      <div className="h-5 w-px bg-white/[0.06]" />

      <button
        onClick={() => setAutoRefresh(!autoRefresh)}
        className={`h-7 pl-2 pr-2.5 rounded-lg border flex items-center gap-1.5 text-[11px] transition ${
          autoRefresh
            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
            : "border-white/[0.06] bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
        }`}
        title="Toggle auto-refresh"
      >
        {autoRefresh ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {autoRefresh ? `Auto · ${countdown}s` : "Paused"}
      </button>

      <button
        className="h-7 w-7 grid place-items-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
        title="Refresh now"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Good</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Fair</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Poor</span>
      </div>
    </div>
  );
}

/* ---------- Factory Overview (3D twin) ---------- */

function FactoryOverview() {
  const [area, setArea] = useState("All Areas");
  return (
    <GlassCard className="p-4 h-full flex flex-col">
      <CardHeader
        title="Factory Overview"
        help="Interactive 3D twin of the DFW fab. Click a building to drill in."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-md bg-white/[0.03] border border-white/[0.06] overflow-hidden">
              {["All Areas", "Front End", "Back End", "Utilities"].map((a) => (
                <button
                  key={a}
                  onClick={() => setArea(a)}
                  className={`px-2 h-6 text-[10.5px] transition ${
                    area === a ? "bg-sky-500/20 text-sky-200" : "text-slate-400 hover:text-slate-100"
                  }`}
                >{a}</button>
              ))}
            </div>
            <button className="h-6 w-6 grid place-items-center rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:bg-white/[0.06]">
              <Maximize2 className="h-3 w-3" />
            </button>
          </div>
        }
      />
      <div className="flex-1 min-h-[360px] rounded-lg overflow-hidden">
        <Suspense fallback={
          <div className="h-full w-full grid place-items-center bg-white/[0.02] rounded-lg border border-white/[0.04]">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading digital twin…
            </div>
          </div>
        }>
          <DigitalTwinViewport />
        </Suspense>
      </div>
      <div className="mt-2 text-[10.5px] text-slate-500 flex items-center gap-1.5">
        <Info className="h-3 w-3" /> Click on an area to drill down · Filter: <span className="text-slate-300">{area}</span>
      </div>
    </GlassCard>
  );
}

/* ---------- AI Observation Feed ---------- */

function AiObservationFeed() {
  const [filter, setFilter] = useState<"all" | "warn" | "info" | "ok">("all");
  const items = useMemo(
    () => filter === "all" ? AI_OBSERVATIONS : AI_OBSERVATIONS.filter((o) => o.sev === filter),
    [filter],
  );
  return (
    <GlassCard className="p-4 h-full flex flex-col">
      <CardHeader
        title="AI Observation Feed"
        help="Continuous AI-generated observations across MES, FDC, SPC and CMMS feeds."
        action={<button className="text-[11px] text-sky-300 hover:text-sky-200">View All</button>}
      />
      <div className="flex gap-1 mb-2">
        {[
          { k: "all",  label: "All" },
          { k: "warn", label: "Warning" },
          { k: "info", label: "Info" },
          { k: "ok",   label: "OK" },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k as any)}
            className={`px-2 h-6 rounded-md text-[10.5px] transition ${
              filter === f.k ? "bg-white/[0.08] text-slate-100" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >{f.label}</button>
        ))}
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {items.map((o, i) => {
          const s = SEV_STYLES[o.sev];
          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition border border-transparent hover:border-white/[0.06]"
            >
              <div className={`h-8 w-8 shrink-0 grid place-items-center rounded-md ${s.bg} border ${s.border}`}>
                <o.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] text-white font-medium">{o.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{o.sub}</div>
              </div>
              <div className="text-[10px] text-slate-500 shrink-0 whitespace-nowrap">{o.time}</div>
            </motion.div>
          );
        })}
        {items.length === 0 && (
          <div className="text-center text-[11px] text-slate-500 py-8">No observations for this filter.</div>
        )}
      </div>
    </GlassCard>
  );
}

/* ---------- Maintenance Opportunities ---------- */

function MaintenanceOpportunities() {
  return (
    <GlassCard className="p-4 h-full flex flex-col">
      <CardHeader
        title="Maintenance Opportunities"
        sub="AI Prioritized"
        help="Top tool-level interventions ranked by predicted risk and revenue exposure."
        action={<button className="text-[11px] text-sky-300 hover:text-sky-200">View All (7)</button>}
      />
      <div className="space-y-2 flex-1 overflow-y-auto">
        {MAINTENANCE_OPS.map((m) => {
          const s = SEV_STYLES[m.sev];
          return (
            <div key={m.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.035] transition">
              <div className="flex items-start gap-2.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${PRIORITY_STYLES[m.priority]}`}>{m.priority}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-white font-semibold flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.color.replace("text-", "bg-")}`} /> {m.name}
                  </div>
                </div>
                {m.action && <span className="text-[10px] text-emerald-300">{m.action}</span>}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                <span className="text-slate-500">Window: </span>{m.window}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                <span className="text-slate-500">Impact: </span>{m.impact}
              </div>
              <div className="mt-2 flex justify-end">
                <button className="text-[11px] px-2.5 h-6 rounded-md bg-white/[0.04] border border-white/[0.08] text-sky-200 hover:bg-sky-500/15 hover:border-sky-400/40 transition">
                  Review
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center justify-between">
        <span className="text-[10.5px] text-slate-500">AI continuously evaluates 1,248 assets</span>
        <button className="text-[10.5px] text-sky-300 hover:text-sky-200">View Methodology</button>
      </div>
    </GlassCard>
  );
}

/* ---------- Production Summary ---------- */

const ProductionSummary = memo(function ProductionSummary() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Production Summary" help="Top product families by daily throughput." action={<button className="text-[11px] text-sky-300">Details</button>} />
      <div className="text-[10px] text-slate-500 mb-2">Top Products by Throughput</div>
      <div className="grid grid-cols-[1fr_auto_auto_60px] gap-x-3 gap-y-1.5 text-[11.5px]">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Family</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 text-right">Wfr/Day</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 text-right">%</div>
        <div />
        {PRODUCTION_FAMILIES.map((p) => (
          <div key={p.family} className="contents">
            <div className="text-slate-200 truncate">{p.family}</div>
            <div className="text-slate-200 text-right tabular-nums">{p.wafers.toLocaleString()}</div>
            <div className="text-slate-300 text-right tabular-nums">{p.pct.toFixed(1)}%</div>
            <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden self-center">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${p.pct * 2.5}%` }} transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400"
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

/* ---------- Equipment Health ---------- */

const EquipmentHealthSummary = memo(function EquipmentHealthSummary() {
  const total = EQUIPMENT_HEALTH.reduce((a, b) => a + b.value, 0);
  return (
    <GlassCard className="p-4">
      <CardHeader title="Equipment Health" help="Distribution of fleet by composite health score." action={<button className="text-[11px] text-sky-300">Details</button>} />
      <div className="flex items-center gap-3">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={EQUIPMENT_HEALTH} dataKey="value" innerRadius={38} outerRadius={56} paddingAngle={2} stroke="none" isAnimationActive={false}>
                {EQUIPMENT_HEALTH.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total</div>
              <div className="text-[18px] font-semibold text-white tabular-nums">{total.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500">Assets</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {EQUIPMENT_HEALTH.map((d) => (
            <div key={d.name} className="flex items-center text-[11.5px]">
              <span className="h-2 w-2 rounded-full mr-2" style={{ background: d.color, boxShadow: `0 0 6px ${d.color}80` }} />
              <span className="flex-1 text-slate-300 truncate">{d.name}</span>
              <span className="text-slate-200 tabular-nums w-10 text-right">{d.value}</span>
              <span className="text-slate-400 tabular-nums w-12 text-right">({d.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
});

/* ---------- Utility Status ---------- */

const UtilityStatusCard = memo(function UtilityStatusCard() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Utility Status" sub="Live vs Optimal" help="Real-time utilization for critical utilities." />
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5 text-[11.5px]">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Utility</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Status</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 text-right">Utilization</div>
        {UTILITY_STATUS.map((u) => (
          <div key={u.name} className="contents">
            <div className="text-slate-200">{u.name}</div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.color, boxShadow: `0 0 6px ${u.color}` }} />
              {u.status}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-slate-300 tabular-nums">{u.util}%</span>
              <div className="w-12 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${u.util}%` }} transition={{ duration: 1 }}
                  className="h-full" style={{ background: u.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

/* ---------- Quality Summary ---------- */

const QualitySummary = memo(function QualitySummary() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Quality Summary" help="Yield, defect density, and customer escapes." action={<button className="text-[11px] text-sky-300">Details</button>} />
      <div className="space-y-2">
        {QUALITY_KPIS.map((q) => (
          <div key={q.label} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] text-slate-300">{q.label}</div>
            </div>
            <div className="text-[13px] text-white font-semibold tabular-nums">
              {q.value}<span className="text-[10px] text-slate-500 ml-0.5">{q.suffix}</span>
            </div>
            <div className="w-[70px]"><Spark data={q.trend} color="#22c55e" /></div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

/* ---------- Business Priorities ---------- */

const BusinessPriorities = memo(function BusinessPriorities() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Business Priorities" help="Ranked operational objectives with on-track status." action={<button className="text-[11px] text-sky-300">Details</button>} />
      <div className="space-y-2">
        {BUSINESS_PRIORITIES.map((b) => (
          <div key={b.rank} className="flex items-center gap-3 py-1">
            <span className="h-6 w-6 grid place-items-center rounded-md text-[11px] font-bold text-slate-300 bg-white/[0.04] border border-white/[0.06]">
              {b.rank}
            </span>
            <span className="flex-1 text-[12px] text-slate-200">{b.label}</span>
            <span className={`text-[11px] font-medium ${b.statusColor}`}>{b.status}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

/* ---------- Pending AI Decisions ---------- */

function PendingDecisions() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Pending AI Decisions" help="Recommendations awaiting human sign-off." action={<button className="text-[11px] text-sky-300">View All (3)</button>} />
      <div className="space-y-2">
        {PENDING_DECISIONS.map((d, i) => {
          const s = SEV_STYLES[d.sev];
          return (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition border border-transparent hover:border-white/[0.06]">
              <div className={`h-8 w-8 shrink-0 grid place-items-center rounded-md ${s.bg} border ${s.border}`}>
                <d.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-white font-medium">{d.title}</div>
                <div className="text-[10.5px] text-slate-400">{d.target}</div>
              </div>
              <div className="text-[10px] text-slate-400 text-right whitespace-nowrap">Due {d.due}</div>
              <button className="text-[11px] px-2.5 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-sky-200 hover:bg-sky-500/15 hover:border-sky-400/40 transition">
                Review
              </button>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

/* ---------- Active Alerts ---------- */

const ActiveAlertsPanel = memo(function ActiveAlertsPanel() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Active Alerts" help="Open alerts by severity, last 24h." action={<button className="text-[11px] text-sky-300">View All (5)</button>} />
      <div className="grid grid-cols-4 gap-2">
        {ALERT_COUNTS.map((a) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition cursor-pointer"
          >
            <div className={`text-[28px] font-bold tabular-nums ${a.color}`}>{a.count}</div>
            <div className={`text-[10.5px] font-semibold ${a.color}`}>{a.label}</div>
            <div className="text-[9.5px] text-slate-500 mt-1 leading-tight">{a.sub}</div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
});

/* ---------- Recent Events ---------- */

const RecentEventsPanel = memo(function RecentEventsPanel() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Recent Events" help="Most recent events across monitoring and dispatch." action={<button className="text-[11px] text-sky-300">View All</button>} />
      <div className="space-y-1.5">
        {RECENT_EVENTS.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 px-1 text-[11.5px]"
          >
            <div className="text-slate-400 tabular-nums w-[60px]">{e.t}</div>
            <div className="text-slate-200 truncate">{e.title}</div>
            <div className={`text-[10.5px] ${e.tagColor}`}>{e.tag}</div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
});

/* ---------- Live ticker (footer marquee) ---------- */

function LiveTicker() {
  const items = [
    "ETCH-217 health −4 pts in last 6h",
    "Lot LX-2840 reached step 47/120",
    "Chiller Loop B flow 18.2 GPM (nominal 19.5)",
    "PVD-142 chamber pressure stable at 3.2 mTorr",
    "FOUP delay event cleared in Bay 3 AMHS",
    "Recipe RX-0421 yield trend: 98.7% (+0.3%)",
  ];
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[0.05] bg-white/[0.02] h-8">
      <div className="absolute inset-y-0 left-0 z-10 px-3 flex items-center gap-1.5 bg-gradient-to-r from-[#06080f] via-[#06080f] to-transparent pr-6">
        <Zap className="h-3 w-3 text-amber-300" />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-300">Live Tape</span>
      </div>
      <div className="absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#06080f] to-transparent" />
      <motion.div
        className="absolute top-0 left-[120px] h-full flex items-center gap-8 whitespace-nowrap text-[11px] text-slate-300"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-sky-400" /> {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- the page ---------- */

export default function FocCommandCenter() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [range, setRange] = useState<TimeRange>("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // auto-refresh countdown ticker
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setCountdown((c) => (c <= 1 ? 30 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const openPalette = useCallback(() => setPaletteOpen(true), []);

  return (
    <AppShell>
      <TooltipProvider delayDuration={150}>
        <div className="min-h-screen bg-[#06080f] text-slate-200">
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.07),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.06),_transparent_55%)]" />
            <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:48px_48px]" />
          </div>

          <AppHeader onOpenPalette={openPalette} />

          <div className="flex">
            <ModuleRail />

            <main className="flex-1 min-w-0 px-5 py-4 space-y-4">
              {/* Control bar */}
              <ControlBar
                range={range} onRange={setRange}
                autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh}
                countdown={countdown}
              />

              {/* KPI strip: 6 cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {KPIS.map((k) => <KpiCard key={k.id} k={k} />)}
              </div>

              {/* Above-the-fold cockpit: twin (wide) | feed | maintenance */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 xl:col-span-6"><FactoryOverview /></div>
                <div className="col-span-12 md:col-span-6 xl:col-span-3"><AiObservationFeed /></div>
                <div className="col-span-12 md:col-span-6 xl:col-span-3"><MaintenanceOpportunities /></div>
              </div>

              {/* Operational row */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6 xl:col-span-3"><ProductionSummary /></div>
                <div className="col-span-12 md:col-span-6 xl:col-span-3"><EquipmentHealthSummary /></div>
                <div className="col-span-12 md:col-span-4 xl:col-span-2"><UtilityStatusCard /></div>
                <div className="col-span-12 md:col-span-4 xl:col-span-2"><QualitySummary /></div>
                <div className="col-span-12 md:col-span-4 xl:col-span-2"><BusinessPriorities /></div>
              </div>

              {/* Decisions / alerts / events */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6 xl:col-span-5"><PendingDecisions /></div>
                <div className="col-span-12 md:col-span-6 xl:col-span-3"><ActiveAlertsPanel /></div>
                <div className="col-span-12 xl:col-span-4"><RecentEventsPanel /></div>
              </div>

              {/* Live ticker */}
              <LiveTicker />

              {/* footer status */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 px-1 pt-2 border-t border-white/[0.05]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    All data feeds connected
                  </span>
                  <span className="hidden md:inline">MES • FDC • SPC • CMMS • EAM • Historian • SECS/GEM • EDA • APC</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 h-4 grid place-items-center rounded text-[10px] text-slate-400 bg-white/[0.05] border border-white/[0.08]">⌘K</kbd>
                  <span>to search</span>
                  <span className="mx-2 opacity-50">·</span>
                  <span>Texas Instruments · DFW Fab · v1.3.0</span>
                </div>
              </div>
            </main>
          </div>

          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
          <SelectionDrawer />
        </div>
      </TooltipProvider>
    </AppShell>
  );
}
