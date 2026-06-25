import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowLeft, Bell, Boxes, Building2, ChevronDown, Factory, FileBarChart2, Gauge, Lightbulb, GitBranch, Share2, HelpCircle, LayoutGrid, Network as NetIcon, Plus, Minus, Maximize2, Settings as SettingsIcon, Search, Star, Wrench, Workflow, Zap, Bot, Truck, Users, UserCog, Briefcase, Beaker, FlaskConical, CircleDot, TrendingUp, TrendingDown, CheckCircle2, X, Info, Clock, AlertTriangle, Cpu, Database, ShieldCheck, HardHat, Command, Pause, Play, Download, Filter, Activity, Gavel, Brain, Scale, Target as TargetIcon, BookOpen, UserCheck, MessageSquare, Network,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { AppShell } from "@/components/eoc/AppShell";
import { SeadRail } from "@/components/sead/SeadRail";

/* =====================================================================
   Cross-Domain Context Twin — ETCH-217
   Enterprise Impact Intelligence
   Texas Instruments DFW Semiconductor Fab
   ===================================================================== */

/* ---------- shared atoms ---------- */

function GlassCard({ children, className = "" }: any) {
  return (
    <div
      className={
        "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " +
        className
      }
    >
      {children}
    </div>
  );
}

function useCountUp(target: number, duration = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/* ---------- left rail ---------- */

/* ---------- top header ---------- */

function AppHeader() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 grid place-items-center shadow-[0_0_28px_-6px_rgba(244,63,94,0.7)] font-black text-white text-[15px]">
          TI
        </div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Texas Instruments</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Cross-Domain Context Twin</div>
          <div className="text-[11px] text-slate-400">End-to-end impact view of ETCH-217 across the factory</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="relative w-[260px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          placeholder="Search domains, lots, customers…"
          className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] pl-9 pr-3 text-[12px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-400/40"
        />
      </div>
      <button className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-200 hover:bg-white/[0.06]">
        <Factory className="h-4 w-4 text-sky-400" />
        <span className="font-medium">Fab: DFW Semiconductor Fab</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>
      <div className="text-right leading-tight">
        <div className="text-[12px] text-slate-200 tabular-nums">{date} {time} CT</div>
        <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </div>
      </div>
      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">3</span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <HelpCircle className="h-4 w-4" />
      </button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-[11px] font-bold text-white">AO</div>
    </header>
  );
}

/* ---------- title bar ---------- */

function TitleBar() {
  const nav = useNavigate();
  const Field = ({ label, value, color = "text-slate-100" }: any) => (
    <div className="px-4 py-1.5 border-l border-white/[0.06] first:border-l-0">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-[12.5px] font-medium tabular-nums mt-0.5 ${color}`}>{value}</div>
    </div>
  );
  return (
    <GlassCard className="p-5">
      <button
        onClick={() => nav("/sead/equipment-health-intelligence")}
        className="text-[11px] text-sky-300 hover:text-sky-200 mb-3 flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Equipment Health
      </button>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="h-14 w-20 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center border border-white/10">
          <Cpu className="h-7 w-7 text-sky-300/70" />
        </div>
        <h1 className="text-[30px] font-semibold text-white tracking-tight leading-none">ETCH-217</h1>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/40">Fair</span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px] text-slate-300">
          <span>Health Score <span className="text-amber-300 font-semibold tabular-nums">72</span><span className="text-slate-500">/100</span></span>
          <span>RUL: <span className="text-slate-100 font-medium tabular-nums">18 days</span></span>
          <span>Utilization: <span className="text-slate-100 font-medium tabular-nums">85%</span> <ChevronDown className="inline h-3 w-3 text-slate-500" /></span>
          <span>Criticality: <span className="text-rose-300 font-semibold">High</span></span>
        </div>
      </div>
    </GlassCard>
  );
}

/* ---------- tabs ---------- */

const TABS = [
  "Impact Map", "Relationships", "Dependencies", "Constraints",
  "Timeline", "Knowledge Graph", "Risk Analysis", "Scenario Simulation",
];

function ContextTabs({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex items-center gap-1 px-2 border-b border-white/[0.06] overflow-x-auto">
      {TABS.map((t) => {
        const isActive = t === active;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`relative px-4 py-3 text-[12px] font-medium uppercase tracking-wider whitespace-nowrap transition ${
              isActive ? "text-sky-300" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t}
            {isActive && (
              <motion.span
                layoutId="ctx-tab-underline"
                className="absolute left-3 right-3 -bottom-px h-[2px] rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- domain definitions ---------- */

type Severity = "critical" | "elevated" | "monitor" | "ok";

const SEV_COLORS: Record<Severity, { stroke: string; glow: string; dot: string; text: string; bg: string; border: string }> = {
  critical: { stroke: "#ef4444", glow: "rgba(239,68,68,0.7)", dot: "bg-rose-400", text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/40" },
  elevated: { stroke: "#f97316", glow: "rgba(249,115,22,0.65)", dot: "bg-orange-400", text: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/40" },
  monitor:  { stroke: "#eab308", glow: "rgba(234,179,8,0.6)", dot: "bg-yellow-400", text: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/40" },
  ok:       { stroke: "#22c55e", glow: "rgba(34,197,94,0.55)", dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/40" },
};

type DomainCard = {
  id: string;
  title: string;
  icon: any;
  accent: string; // tailwind hex token for icon tint
  severity: Severity;
  badge: number;
  rows: { icon: any; text: string; emphasis?: string; emphasisColor?: string }[];
  // grid position
  col: number; row: number;
};

const DOMAINS: DomainCard[] = [
  { id: "production", title: "PRODUCTION", icon: Workflow, accent: "#22d3ee", severity: "ok", badge: 8, col: 1, row: 1, rows: [
    { icon: Boxes, text: "8 Active Lots" },
    { icon: Beaker, text: "3 Products" },
    { icon: Star, text: "2 Priority Families" },
  ]},
  { id: "dispatch", title: "DISPATCH", icon: Truck, accent: "#a78bfa", severity: "monitor", badge: 6, col: 2, row: 1, rows: [
    { icon: Boxes, text: "2 Alternate Tools" },
    { icon: Clock, text: "6 Queued Lots" },
    { icon: Clock, text: "18 hr Re-route Time" },
  ]},
  { id: "quality", title: "QUALITY", icon: Gauge, accent: "#34d399", severity: "ok", badge: 4, col: 3, row: 1, rows: [
    { icon: CheckCircle2, text: "2 Monitored Params" },
    { icon: AlertTriangle, text: "1 Sensitivity: High" },
    { icon: Info, text: "Yield Impact:", emphasis: "Medium", emphasisColor: "text-yellow-300" },
  ]},
  { id: "engineering", title: "ENGINEERING", icon: HardHat, accent: "#fb923c", severity: "monitor", badge: 3, col: 0, row: 2, rows: [
    { icon: FileBarChart2, text: "1 Active ECR" },
    { icon: ShieldCheck, text: "0 Engineering Holds" },
    { icon: Clock, text: "Next Change: 5 days" },
  ]},
  { id: "maintenance", title: "MAINTENANCE", icon: Wrench, accent: "#4ade80", severity: "elevated", badge: 5, col: 4, row: 2, rows: [
    { icon: Clock, text: "PM Due: 12 days" },
    { icon: Wrench, text: "2 Open Work Orders" },
    { icon: Info, text: "Backlog:", emphasis: "Medium", emphasisColor: "text-yellow-300" },
  ]},
  { id: "customers", title: "CUSTOMERS", icon: Briefcase, accent: "#38bdf8", severity: "elevated", badge: 3, col: 1, row: 3, rows: [
    { icon: Users, text: "2 Customer Commitments" },
    { icon: UserCog, text: "1 at Risk if Delayed" },
    { icon: Info, text: "Revenue Impact:", emphasis: "High", emphasisColor: "text-rose-300" },
  ]},
  { id: "utilities", title: "UTILITIES", icon: Zap, accent: "#22d3ee", severity: "ok", badge: 4, col: 2, row: 3, rows: [
    { icon: FlaskConical, text: "N2: Normal" },
    { icon: FlaskConical, text: "CDW: Normal" },
    { icon: Info, text: "Power Window:", emphasis: "Tonight", emphasisColor: "text-emerald-300" },
  ]},
  { id: "technicians", title: "TECHNICIANS", icon: UserCog, accent: "#fb923c", severity: "elevated", badge: 4, col: 3, row: 3, rows: [
    { icon: ShieldCheck, text: "2 Required Skills" },
    { icon: Users, text: "3 Technicians Available" },
    { icon: Clock, text: "Next Shift: 2:00 PM" },
  ]},
  { id: "supply", title: "SUPPLY CHAIN", icon: Database, accent: "#f472b6", severity: "monitor", badge: 3, col: 2, row: 4, rows: [
    { icon: Boxes, text: "2 Critical Parts" },
    { icon: TrendingDown, text: "1 Part Low (<=7 days)" },
    { icon: Clock, text: "Vendor Lead Time: 2 days" },
  ]},
];

/* ---------- domain card ---------- */

const DomainNode = memo(function DomainNode({
  d, selected, dimmed, hovered, onClick, onDouble, onHover, nodeRef,
}: {
  d: DomainCard; selected: boolean; dimmed: boolean; hovered: boolean;
  onClick: () => void; onDouble: () => void; onHover: (id: string | null) => void;
  nodeRef: (el: HTMLButtonElement | null) => void;
}) {
  const sev = SEV_COLORS[d.severity];
  return (
    <button
      ref={nodeRef}
      onClick={onClick}
      onDoubleClick={onDouble}
      onMouseEnter={() => onHover(d.id)}
      onMouseLeave={() => onHover(null)}
      data-domain={d.id}
      className={`w-full text-left rounded-xl border bg-[#0a1020]/80 backdrop-blur-md transition-all duration-200 group ${
        selected
          ? "border-sky-400/60 shadow-[0_0_30px_-6px_rgba(56,189,248,0.55)] -translate-y-0.5"
          : hovered
          ? "border-white/30 -translate-y-0.5"
          : "border-white/[0.08] hover:border-white/20"
      } ${dimmed ? "opacity-35" : "opacity-100"}`}
      style={{ boxShadow: selected ? undefined : `0 0 0 1px ${sev.glow.replace("0.7", "0.18").replace("0.65", "0.18").replace("0.6", "0.18").replace("0.55", "0.16")} inset` }}
    >
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <div className="flex items-center gap-1.5">
          <d.icon className="h-3.5 w-3.5" style={{ color: d.accent }} />
          <span className="text-[10.5px] font-bold tracking-[0.14em] text-slate-200">{d.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${sev.dot} ${d.severity !== "ok" ? "animate-pulse" : ""}`} />
          <span className="h-4 min-w-4 px-1 rounded-md text-[10px] font-bold grid place-items-center" style={{ backgroundColor: `${d.accent}22`, color: d.accent }}>
            {d.badge}
          </span>
        </div>
      </div>
      <div className="border-t border-white/[0.05] px-3 py-2 space-y-1.5">
        {d.rows.map((r, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <r.icon className="h-3 w-3 text-slate-500 shrink-0" />
            <span className="truncate">
              {r.text}{" "}
              {r.emphasis && <span className={`font-semibold ${r.emphasisColor ?? "text-slate-100"}`}>{r.emphasis}</span>}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
});

/* ---------- center node ---------- */

function CenterNode() {
  return (
    <div className="relative">
      <motion.div
        className="absolute -inset-8 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(56,189,248,0) 70%)" }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative h-[140px] w-[160px] rounded-2xl border border-sky-400/50 bg-[#0a1020] grid place-items-center shadow-[0_0_50px_-10px_rgba(56,189,248,0.7)]">
        <div className="flex flex-col items-center gap-1">
          <Cpu className="h-7 w-7 text-sky-300" />
          <div className="text-[14px] font-bold text-white tracking-tight">ETCH-217</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-[0.18em]">Metal Etch</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- impact map ---------- */

type ImpactMapProps = {
  selected: string | null;
  setSelected: (id: string | null) => void;
  onOpenDrawer: (id: string) => void;
  filter: Set<Severity>;
  setFilter: (f: Set<Severity>) => void;
  hovered: string | null;
  setHovered: (id: string | null) => void;
  paused: boolean;
};

function ImpactMap({ selected, setSelected, onOpenDrawer, filter, setFilter, hovered, setHovered, paused }: ImpactMapProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [paths, setPaths] = useState<Record<string, string>>({});
  const [size, setSize] = useState({ w: 1000, h: 700 });

  const recompute = useCallback(() => {
    const wrap = wrapRef.current;
    const center = centerRef.current;
    if (!wrap || !center) return;
    const wr = wrap.getBoundingClientRect();
    const cr = center.getBoundingClientRect();
    const cx = cr.left + cr.width / 2 - wr.left;
    const cy = cr.top + cr.height / 2 - wr.top;
    const next: Record<string, string> = {};
    DOMAINS.forEach((d) => {
      const el = nodeRefs.current[d.id];
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = r.left + r.width / 2 - wr.left;
      const ny = r.top + r.height / 2 - wr.top;
      const mx = (cx + nx) / 2;
      const my = (cy + ny) / 2 - Math.min(40, Math.abs(nx - cx) * 0.18);
      next[d.id] = `M${cx},${cy} Q${mx},${my} ${nx},${ny}`;
    });
    setPaths(next);
    setSize({ w: wr.width, h: wr.height });
  }, []);

  useLayoutEffect(() => {
    recompute();
    const ro = new ResizeObserver(recompute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", recompute);
    return () => { ro.disconnect(); window.removeEventListener("resize", recompute); };
  }, [recompute]);

  const visible = (d: DomainCard) => filter.size === 0 || filter.has(d.severity);
  const focus = selected ?? hovered;
  const isDim = (id: string) => (!!focus && focus !== id) || (filter.size > 0 && !filter.has(DOMAINS.find((d) => d.id === id)!.severity));

  const toggleSev = (s: Severity) => {
    const next = new Set(filter);
    next.has(s) ? next.delete(s) : next.add(s);
    setFilter(next);
  };

  const renderCell = (idx: number, extra = "") => {
    const d = DOMAINS[idx];
    return (
      <div className={extra}>
        <DomainNode
          d={d}
          selected={selected === d.id}
          hovered={hovered === d.id}
          dimmed={isDim(d.id)}
          onClick={() => setSelected(selected === d.id ? null : d.id)}
          onDouble={() => onOpenDrawer(d.id)}
          onHover={setHovered}
          nodeRef={(el) => { nodeRefs.current[d.id] = el; }}
        />
      </div>
    );
  };

  return (
    <GlassCard className="p-0 overflow-hidden relative">
      {/* severity filter bar */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-2 border-b border-white/[0.05] bg-white/[0.015]">
        <Filter className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1">Severity</span>
        {(["critical", "elevated", "monitor", "ok"] as Severity[]).map((s) => {
          const active = filter.has(s);
          const sev = SEV_COLORS[s];
          return (
            <button
              key={s}
              onClick={() => toggleSev(s)}
              className={`flex items-center gap-1.5 text-[10.5px] px-2 py-1 rounded-md border transition ${
                active ? `${sev.bg} ${sev.border} ${sev.text}` : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
              {s}
            </button>
          );
        })}
        {filter.size > 0 && (
          <button onClick={() => setFilter(new Set())} className="text-[10.5px] text-slate-500 hover:text-slate-200 ml-1">Clear</button>
        )}
        <div className="flex-1" />
        <span className={`flex items-center gap-1.5 text-[10.5px] ${paused ? "text-amber-300" : "text-emerald-300"}`}>
          <Activity className="h-3 w-3" />
          {paused ? "Stream paused" : "Streaming live"}
        </span>
      </div>

      {/* grid background */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(56,189,248,0.10), transparent 60%)" }}
      />

      <div ref={wrapRef} className="relative grid grid-cols-5 gap-x-4 gap-y-3 p-6 min-h-[640px]">
        {/* SVG lines anchored to real positions */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" width={size.w} height={size.h}>
          <defs>
            {DOMAINS.map((d) => {
              const sev = SEV_COLORS[d.severity];
              return (
                <linearGradient key={d.id} id={`grad-${d.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={sev.stroke} stopOpacity="0.05" />
                  <stop offset="50%" stopColor={sev.stroke} stopOpacity="0.7" />
                  <stop offset="100%" stopColor={sev.stroke} stopOpacity="0.95" />
                </linearGradient>
              );
            })}
          </defs>
          {DOMAINS.map((dom) => {
            const path = paths[dom.id];
            if (!path) return null;
            const sev = SEV_COLORS[dom.severity];
            const focused = !!focus && focus === dom.id;
            const dim = isDim(dom.id) ? 0.12 : focused ? 1 : 0.85;
            const sw = focused ? 3.2 : 2;
            return (
              <g key={dom.id} style={{ opacity: dim, transition: "opacity 200ms" }}>
                <path d={path} stroke={`url(#grad-${dom.id})`} strokeWidth={sw} fill="none" strokeLinecap="round" />
                {!paused && (
                  <circle r={focused ? 4.5 : 3.2} fill={sev.stroke} style={{ filter: `drop-shadow(0 0 6px ${sev.glow})` }}>
                    <animateMotion dur={focused ? "2s" : "3.4s"} repeatCount="indefinite" path={path} />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Row 1 */}
        {renderCell(0, "col-start-2 relative z-[1]")}
        {renderCell(1, "col-start-3 relative z-[1]")}
        {renderCell(2, "col-start-4 relative z-[1]")}

        {/* Row 2 */}
        {renderCell(3, "col-start-1 row-start-2 self-center relative z-[1]")}
        <div ref={centerRef} className="col-start-3 row-start-2 grid place-items-center relative z-[1]"><CenterNode /></div>
        {renderCell(4, "col-start-5 row-start-2 self-center relative z-[1]")}

        {/* Row 3 */}
        {renderCell(5, "col-start-2 row-start-3 relative z-[1]")}
        {renderCell(6, "col-start-3 row-start-3 relative z-[1]")}
        {renderCell(7, "col-start-4 row-start-3 relative z-[1]")}

        {/* Row 4 */}
        {renderCell(8, "col-start-3 row-start-4 relative z-[1]")}
      </div>

      {/* zoom controls */}
      <div className="absolute left-4 bottom-4 flex flex-col gap-1.5 z-10">
        {[Plus, Minus, Maximize2, SettingsIcon].map((I, i) => (
          <button key={i} className="h-8 w-8 rounded-md bg-white/[0.04] border border-white/[0.08] grid place-items-center text-slate-300 hover:bg-white/[0.08]">
            <I className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      {/* legend */}
      <div className="absolute left-20 bottom-4 flex items-center gap-4 text-[11px] text-slate-400 z-10">
        <span className="uppercase tracking-wider text-slate-500">Impact</span>
        {[
          { c: "bg-rose-500", l: "Critical" },
          { c: "bg-orange-500", l: "Elevated" },
          { c: "bg-yellow-500", l: "Monitor" },
          { c: "bg-emerald-500", l: "OK" },
        ].map((x) => (
          <span key={x.l} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${x.c}`} /> {x.l}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- right impact summary ---------- */

function ImpactGauge({ value, label }: { value: number; label: string }) {
  const animated = useCountUp(value);
  const angle = -90 + (animated / 100) * 180;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[120px] w-[200px]">
        <svg viewBox="0 0 200 120" className="absolute inset-0">
          <defs>
            <linearGradient id="gauge-grad" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M20,110 A80,80 0 0,1 180,110" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
          <path d="M20,110 A80,80 0 0,1 180,110" fill="none" stroke="url(#gauge-grad)" strokeWidth="14" strokeLinecap="round" />
          <g transform={`rotate(${angle} 100 110)`}>
            <line x1="100" y1="110" x2="100" y2="40" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="100" cy="110" r="4" fill="#f8fafc" />
          </g>
        </svg>
      </div>
      <div className="text-[32px] font-semibold text-rose-300 leading-none mt-1">{label}</div>
      <div className="text-[11px] text-slate-400 mt-2 text-center">
        If maintenance delayed beyond <br /> recommended window
      </div>
    </div>
  );
}

const DRIVERS = [
  { label: "Customer Commitment", val: "High", color: "text-rose-300" },
  { label: "Yield Sensitivity", val: "Medium", color: "text-yellow-300" },
  { label: "No Alternate Tool Tonight", val: "High", color: "text-rose-300" },
  { label: "Planned Utility Window Tonight", val: "Positive", color: "text-emerald-300" },
  { label: "Technician Availability", val: "Medium", color: "text-yellow-300" },
];

const FOCUS = [
  "Target maintenance during tonight's utility window",
  "Leverage alternate tool CMP-038",
  "Pre-stage critical parts (2 items low)",
  "Align with Quality on sensitive parameters",
];

function ImpactSummary() {
  return (
    <GlassCard className="p-5 space-y-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Impact Summary</div>

      <div>
        <div className="text-[11px] text-slate-400 mb-2">Overall Business Impact</div>
        <ImpactGauge value={82} label="High" />
      </div>

      <div className="border-t border-white/[0.05] pt-4">
        <div className="text-[12px] font-semibold text-slate-200 mb-3">Key Drivers</div>
        <div className="space-y-2.5">
          {DRIVERS.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-[12px]">
              <span className="text-slate-300">{d.label}</span>
              <span className={`font-semibold ${d.color}`}>{d.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.05] pt-4">
        <div className="text-[12px] font-semibold text-slate-200 mb-2">What This Means</div>
        <p className="text-[11.5px] text-slate-400 leading-relaxed">
          Delaying maintenance past the optimal window increases risk of unplanned downtime during a
          high customer commitment period with limited alternatives.
        </p>
      </div>

      <div className="border-t border-white/[0.05] pt-4">
        <div className="text-[12px] font-semibold text-slate-200 mb-2">Recommended Focus</div>
        <div className="space-y-2">
          {FOCUS.map((f) => (
            <div key={f} className="flex items-start gap-2 text-[12px] text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

/* ---------- top impacted entities ---------- */

const SPARK = Array.from({ length: 20 }, (_, i) => ({ y: 40 + Math.sin(i / 2) * 8 + i }));

function KpiCard({ title, value, valueColor, sub, subValue, subColor, foot, spark }: any) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between">
        <div className="text-[11px] text-slate-400">{title}</div>
        {spark && (
          <div className="h-8 w-20">
            <ResponsiveContainer>
              <AreaChart data={SPARK} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`sp-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area dataKey="y" stroke="#38bdf8" strokeWidth={1.5} fill={`url(#sp-${title.replace(/\s/g, "")})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <div className={`text-[28px] font-semibold leading-none tabular-nums ${valueColor || "text-white"}`}>{value}</div>
          {foot && <div className="text-[11px] text-slate-500 mt-1">{foot}</div>}
        </div>
        {sub && (
          <div className="text-right">
            <div className="text-[10.5px] text-slate-500">{sub}</div>
            <div className={`text-[13px] font-semibold ${subColor || "text-slate-200"}`}>{subValue}</div>
          </div>
        )}
      </div>
      <button className="mt-3 text-[11px] text-sky-300 hover:text-sky-200">View Details →</button>
    </GlassCard>
  );
}

function TopImpactedEntities() {
  return (
    <GlassCard className="p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-semibold mb-3">Top Impacted Entities</div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard title="Lots at Risk" value="8" foot="12.4K wafers" spark />
        <KpiCard title="Products Impacted" value="3" sub="Priority" subValue="High" subColor="text-rose-300" />
        <KpiCard title="Alternate Tools" value="2" sub="Availability" subValue="Limited" subColor="text-amber-300" />
        <KpiCard title="Revenue at Risk" value="$1.24M" valueColor="text-rose-300" sub="If delayed" subValue="> 24h" subColor="text-slate-300" />
        <KpiCard title="Yield Impact" value="-0.18%" valueColor="text-rose-300" sub="Est. if delayed" subValue="" />
        <KpiCard title="Commitments" value="2" sub="At Risk" subValue="1" subColor="text-rose-300" />
      </div>
    </GlassCard>
  );
}

/* ---------- drawer ---------- */

function ContextDrawer({ open, id, onClose }: { open: boolean; id: string | null; onClose: () => void }) {
  const d = id ? DOMAINS.find((x) => x.id === id) : null;
  const [tab, setTab] = useState("Executive");
  const [persona, setPersona] = useState("Fab Director");

  return (
    <AnimatePresence>
      {open && d && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 h-full w-[450px] z-50 bg-[#0a1020] border-l border-white/10 overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <d.icon className="h-5 w-5" style={{ color: d.accent }} />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Domain Context</div>
                  <div className="text-[15px] font-semibold text-white">{d.title}</div>
                </div>
              </div>
              <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-md text-slate-400 hover:bg-white/[0.05]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-white/[0.06]">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Persona</div>
              <div className="flex flex-wrap gap-1.5">
                {["Fab Director", "Production Mgr", "Maintenance Mgr", "Process Eng", "Reliability Eng"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`text-[10.5px] px-2 py-1 rounded-md border ${
                      persona === p
                        ? "bg-sky-500/15 border-sky-400/40 text-sky-200"
                        : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 px-3 border-b border-white/[0.06] overflow-x-auto">
              {["Executive", "Operations", "Engineering", "AI Reasoning", "Recommendations"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative px-3 py-2.5 text-[11.5px] whitespace-nowrap ${tab === t ? "text-sky-300" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {t}
                  {tab === t && <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-sky-400 rounded-full" />}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4 text-[12.5px] text-slate-300 leading-relaxed">
              {tab === "Executive" && (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">100-Level · Plant Director</div>
                  <p>
                    {d.title.toLowerCase()} exposure is currently {d.severity.toUpperCase()} for ETCH-217.
                    Tonight's maintenance window represents the lowest-risk path to preserve customer commitments
                    while protecting yield and revenue.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Revenue Exposure: $1.24M", "Customer Commitments: 2", "Confidence: 88%", "Risk Trend: ↑ Elevated"].map((s) => (
                      <div key={s} className="rounded-md bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[11.5px] text-slate-200">{s}</div>
                    ))}
                  </div>
                </>
              )}
              {tab === "Operations" && (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">200-Level · Area Manager</div>
                  <p>Dependencies, scheduling impact, and resource utilization for {d.title.toLowerCase()}. AMHS, dispatch rules, and lot priorities are factored.</p>
                </>
              )}
              {tab === "Engineering" && (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">300-Level · Process / Reliability</div>
                  <p>SECS/GEM, EDA telemetry, APC loops, and recipe inheritance considered. Bayesian dependency weighting active across knowledge graph traversal.</p>
                </>
              )}
              {tab === "AI Reasoning" && (
                <>
                  <p>Signals examined: 142 sensors · 18 work orders · 4 ECRs · 12 lot routes. Counterfactual: deferring PM 7 days raises customer-risk weight from 0.42 → 0.71.</p>
                </>
              )}
              {tab === "Recommendations" && (
                <div className="space-y-2">
                  {["Perform PM Tonight", "Reserve Alternate Tool CMP-038", "Pre-stage 2 critical parts"].map((r) => (
                    <div key={r} className="rounded-md bg-white/[0.03] border border-white/[0.06] px-3 py-2 flex items-center justify-between">
                      <span className="text-[12px] text-slate-200">{r}</span>
                      <span className="text-[10px] text-emerald-300 font-semibold">Approve</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- command palette ---------- */

function CommandPalette({ open, onClose, onJumpDomain, onSetTab, onOpenDrawer }: {
  open: boolean; onClose: () => void;
  onJumpDomain: (id: string) => void;
  onSetTab: (t: string) => void;
  onOpenDrawer: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  useEffect(() => { if (!open) setQ(""); }, [open]);

  const items = useMemo(() => {
    const list: { kind: string; label: string; hint?: string; run: () => void }[] = [
      ...DOMAINS.map((d) => ({ kind: "Domain", label: d.title, hint: `${d.severity.toUpperCase()} · ${d.badge} signals`, run: () => onJumpDomain(d.id) })),
      ...DOMAINS.map((d) => ({ kind: "Inspect", label: `Open ${d.title} drawer`, run: () => onOpenDrawer(d.id) })),
      ...TABS.map((t) => ({ kind: "Tab", label: t, run: () => onSetTab(t) })),
    ];
    const needle = q.trim().toLowerCase();
    return needle ? list.filter((i) => i.label.toLowerCase().includes(needle) || i.kind.toLowerCase().includes(needle)) : list.slice(0, 14);
  }, [q, onJumpDomain, onOpenDrawer, onSetTab]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-start pt-[12vh] bg-black/55 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[560px] rounded-xl border border-white/10 bg-[#0a1020] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
          <Search className="h-4 w-4 text-slate-500" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to domain, tab, or action…"
            className="flex-1 bg-transparent outline-none text-[13px] text-slate-100 placeholder:text-slate-500" />
          <span className="text-[10px] text-slate-500 px-1.5 py-0.5 border border-white/10 rounded">ESC</span>
        </div>
        <div className="max-h-[360px] overflow-y-auto py-1">
          {items.length === 0 && <div className="px-4 py-6 text-center text-[12px] text-slate-500">No matches</div>}
          {items.map((it, i) => (
            <button key={i} onClick={() => { it.run(); onClose(); }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-white/[0.04]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 w-14 shrink-0">{it.kind}</span>
                <span className="text-[12.5px] text-slate-100 truncate">{it.label}</span>
              </div>
              {it.hint && <span className="text-[10.5px] text-slate-500 shrink-0">{it.hint}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- live event ticker ---------- */

const TICKER_SEED = [
  { sev: "elevated", txt: "ETCH-217 RF reflected power +3.2% (rolling 5m)" },
  { sev: "monitor", txt: "Lot LOT-A2391 queued for CMP-038 (alt tool)" },
  { sev: "critical", txt: "Customer commitment LOT-A2394 at risk — ETA -4h" },
  { sev: "ok", txt: "Utility window confirmed 22:00–04:00 CT" },
  { sev: "elevated", txt: "Tech TS-04 on-call confirmed for PM window" },
  { sev: "monitor", txt: "Vendor P-9981 ETA refreshed: 2 days" },
] as const;

function EventTicker({ paused }: { paused: boolean }) {
  return (
    <div className="overflow-hidden border-t border-white/[0.06] bg-white/[0.015]">
      <div className={`flex gap-8 whitespace-nowrap py-2 px-4 text-[11.5px] ${paused ? "" : "animate-[ticker_45s_linear_infinite]"}`}
        style={{ animationPlayState: paused ? "paused" : "running" }}>
        {[...TICKER_SEED, ...TICKER_SEED].map((e, i) => {
          const sev = SEV_COLORS[e.sev as Severity];
          return (
            <span key={i} className="flex items-center gap-2 text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
              <span className={`uppercase tracking-wider text-[9.5px] ${sev.text}`}>{e.sev}</span>
              <span>{e.txt}</span>
              <span className="text-slate-600">•</span>
            </span>
          );
        })}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

/* ---------- the page ---------- */

export default function CrossDomainContextTwin() {
  const [tab, setTab] = useState("Impact Map");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<Set<Severity>>(new Set());
  const [paused, setPaused] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const openDrawer = useCallback((id: string) => { setDrawerId(id); setDrawerOpen(true); }, []);

  // Hotkeys: ⌘K palette, ESC close, P pause, 1–9 select domain, X export
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); return; }
      if (e.key === "Escape") { setPaletteOpen(false); setDrawerOpen(false); setSelected(null); return; }
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA")) return;
      if (e.key.toLowerCase() === "p") setPaused((p) => !p);
      if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (DOMAINS[idx]) setSelected(DOMAINS[idx].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const exportCsv = () => {
    const header = "domain,severity,signals,row1,row2,row3";
    const lines = DOMAINS.map((d) => [d.title, d.severity, d.badge, ...d.rows.map((r) => `"${r.text}${r.emphasis ? " " + r.emphasis : ""}"`)].join(","));
    const blob = new Blob([header + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `etch-217-cross-domain-${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast("Snapshot exported");
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#06080f] text-slate-200">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.06),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.05),_transparent_55%)]" />
        </div>

        <AppHeader />

        <div className="flex">
          <SeadRail />

          <main className="flex-1 min-w-0 px-5 py-4 space-y-4">
            <TitleBar />

            {/* Action bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setPaletteOpen(true)}
                className="h-8 px-2.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-[11.5px] text-slate-200 hover:bg-white/[0.06]">
                <Command className="h-3.5 w-3.5 text-sky-300" /> Quick jump
                <span className="text-[9.5px] text-slate-500 px-1 py-0.5 border border-white/10 rounded ml-1">⌘K</span>
              </button>
              <button onClick={() => setPaused((p) => !p)}
                className="h-8 px-2.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-[11.5px] text-slate-200 hover:bg-white/[0.06]">
                {paused ? <Play className="h-3.5 w-3.5 text-emerald-300" /> : <Pause className="h-3.5 w-3.5 text-amber-300" />}
                {paused ? "Resume stream" : "Pause stream"}
              </button>
              <button onClick={exportCsv}
                className="h-8 px-2.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-[11.5px] text-slate-200 hover:bg-white/[0.06]">
                <Download className="h-3.5 w-3.5 text-sky-300" /> Export snapshot
              </button>
              {selected && (
                <button onClick={() => setSelected(null)}
                  className="h-8 px-2.5 rounded-md bg-sky-500/10 border border-sky-400/30 flex items-center gap-2 text-[11.5px] text-sky-200 hover:bg-sky-500/15">
                  <X className="h-3.5 w-3.5" /> Clear focus: {DOMAINS.find((d) => d.id === selected)?.title}
                </button>
              )}
              <div className="flex-1" />
              <span className="text-[10.5px] text-slate-500">Hotkeys: <kbd className="px-1 border border-white/10 rounded">1–9</kbd> focus · <kbd className="px-1 border border-white/10 rounded">P</kbd> pause · <kbd className="px-1 border border-white/10 rounded">Esc</kbd> clear</span>
            </div>

            <GlassCard className="p-0 overflow-hidden">
              <ContextTabs active={tab} onChange={setTab} />

              <div className="grid grid-cols-12 gap-4 p-4">
                <div className="col-span-12 xl:col-span-9">
                  <ImpactMap
                    selected={selected}
                    setSelected={setSelected}
                    onOpenDrawer={openDrawer}
                    filter={filter}
                    setFilter={setFilter}
                    hovered={hovered}
                    setHovered={setHovered}
                    paused={paused}
                  />
                </div>
                <div className="col-span-12 xl:col-span-3">
                  <ImpactSummary />
                </div>
              </div>

              <EventTicker paused={paused} />
            </GlassCard>

            <TopImpactedEntities />

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2 border-t border-white/[0.05]">
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${paused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
                Knowledge graph streaming · MES · AMHS · SECS/GEM · EDA · Historian
              </span>
              <span>Texas Instruments · DFW Fab · Cross-Domain Context Twin v1.1</span>
            </div>
          </main>
        </div>

        <ContextDrawer open={drawerOpen} id={drawerId} onClose={() => setDrawerOpen(false)} />

        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onJumpDomain={(id) => setSelected(id)}
          onSetTab={setTab}
          onOpenDrawer={openDrawer}
        />

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] rounded-lg border border-emerald-400/40 bg-emerald-500/10 backdrop-blur-md px-4 py-2 text-[12px] text-emerald-200">
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
