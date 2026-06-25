import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowLeft, Bell, Bot, Boxes, Building2,
  ChevronDown, Cpu, Factory, FileBarChart2, Gauge, Lightbulb, GitBranch, Share2, HardHat, HelpCircle,
  Info, LayoutGrid, MapPin, MoveDiagonal, RotateCw, Search, Settings as SettingsIcon,
  ShieldCheck, Sparkles, Star, ThermometerSun, TrendingDown, TrendingUp,
  Wrench, X, Zap, ZoomIn, CheckCircle2, AlertCircle, RefreshCw, Clock,
  Workflow, FlaskConical, Database, Network as NetIcon,
  Gavel, Brain, Scale} , Target as TargetIcon } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";
import * as THREE from "three";

/* =====================================================================
   Equipment Health Intelligence — ETCH-217
   AI-Powered Semiconductor Equipment Digital Twin
   Texas Instruments DFW Semiconductor Fab
   ===================================================================== */

/* ---------- equipment master data ---------- */

const EQ = {
  id: "ETCH-217",
  type: "Metal Etch Chamber",
  manufacturer: "Applied Materials Centura® Etch",
  status: "Running",
  starred: true,
  area: "Etch Bay 2",
  process: "Metal Etch",
  node: "28nm",
  recipe: "ME-28-A1",
  utilization: "85%",
  eqId: "EQP-01842",
  installed: "Mar 12, 2021",
  serial: "AMCEN-2021-01842",
  firmware: "v7.4.2-amc",
  contract: "Premium · expires Mar 2027",
  mtbf: "842 hrs",
  mttr: "3.4 hrs",
};

const HEALTH = {
  score: 72,
  category: "Fair",
  categoryColor: "text-amber-400",
  state: "Degrading",
  trend7d: [78, 77, 76, 75, 75, 73, 72],
  confidence: 88,
  margin: "27%",
  forecast30d: 58,
};

const RUL_DATA = Array.from({ length: 30 }, (_, i) => {
  const past = i < 14;
  const x = i - 14;
  const base = 30 - i * 0.55;
  const upper = base + (past ? 0 : Math.abs(x) * 0.3);
  const lower = base - (past ? 0 : Math.abs(x) * 0.4);
  return {
    d: `D${i - 14}`,
    actual: past ? Math.max(8, base + (Math.random() - 0.5) * 1.2) : null,
    forecast: past ? null : Math.max(4, base),
    upper: past ? null : upper,
    lower: past ? null : Math.max(2, lower),
  };
});

const FAILURE_PROB = [
  { window: "7 Days", value: 8, color: "#22c55e" },
  { window: "30 Days", value: 23, color: "#f59e0b" },
  { window: "90 Days", value: 64, color: "#ef4444" },
];

const KHI = [
  { name: "Chamber Pressure Stability", val: "2.1%", trend: "down", status: "Good", color: "#22c55e", base: "1.8%", warn: "3.0%", crit: "5.0%", cal: "May 02, 2025", spark: [2.4, 2.3, 2.2, 2.1, 2.0, 2.0, 2.1], sparkColor: "#22c55e" },
  { name: "Vacuum Pump Vibration (X)", val: "2.8 mm/s", trend: "up", status: "Fair", color: "#f59e0b", base: "1.9", warn: "2.5", crit: "4.0", cal: "Apr 18, 2025", spark: [2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8], sparkColor: "#f59e0b", deltaText: "+18%", deltaColor: "text-rose-400" },
  { name: "He Helium Leak Rate", val: "3.2 sccm", trend: "up", status: "Fair", color: "#f59e0b", base: "2.4", warn: "3.5", crit: "5.5", cal: "May 12, 2025", spark: [2.6, 2.7, 2.9, 3.0, 3.1, 3.2, 3.2], sparkColor: "#f59e0b", deltaText: "+12%", deltaColor: "text-rose-400" },
  { name: "Electrode Temperature", val: "41.2 °C", trend: "flat", status: "Good", color: "#22c55e", base: "40.0", warn: "48.0", crit: "55.0", cal: "May 09, 2025", spark: [40.8, 41.0, 41.1, 41.0, 41.2, 41.1, 41.2], sparkColor: "#22c55e", deltaText: "+2%", deltaColor: "text-emerald-400" },
  { name: "RF Power Stability", val: "96.4%", trend: "down", status: "Poor", color: "#ef4444", base: "99.1%", warn: "98.0%", crit: "97.0%", cal: "Apr 30, 2025", spark: [98.8, 98.5, 98.0, 97.5, 97.0, 96.7, 96.4], sparkColor: "#ef4444", deltaText: "-5%", deltaColor: "text-rose-400" },
  { name: "Gas Flow Stability (Cl2)", val: "98.6%", trend: "flat", status: "Good", color: "#22c55e", base: "98.5%", warn: "97.0%", crit: "95.0%", cal: "May 15, 2025", spark: [98.5, 98.6, 98.5, 98.7, 98.6, 98.6, 98.6], sparkColor: "#22c55e", deltaText: "+1%", deltaColor: "text-emerald-400" },
  { name: "ESC Throttle Valve Cycles", val: "2.3K", trend: "up", status: "Fair", color: "#f59e0b", base: "1.8K", warn: "2.5K", crit: "3.5K", cal: "Mar 22, 2025", spark: [1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.3], sparkColor: "#f59e0b", deltaText: "+22%", deltaColor: "text-rose-400" },
  { name: "Chiller Delta T", val: "2.1 °C", trend: "flat", status: "Good", color: "#22c55e", base: "2.0", warn: "3.5", crit: "5.0", cal: "May 10, 2025", spark: [2.0, 2.1, 2.0, 2.1, 2.1, 2.0, 2.1], sparkColor: "#22c55e", deltaText: "+3%", deltaColor: "text-emerald-400" },
];

const RECENT_ALARMS = [
  { icon: AlertTriangle, color: "text-amber-300", bg: "bg-amber-500/10", title: "He Leak Rate High Warning", sub: "Warning", t: "Today 09:58 AM" },
  { icon: Info, color: "text-sky-300", bg: "bg-sky-500/10", title: "Recipe Change", sub: "ME-28-A1 → ME-28-B2", t: "Today 08:42 AM" },
  { icon: Info, color: "text-sky-300", bg: "bg-sky-500/10", title: "Chamber Pressure Stabilized", sub: "Adaptive control adjusted", t: "May 23 07:21 AM" },
  { icon: CheckCircle2, color: "text-emerald-300", bg: "bg-emerald-500/10", title: "Preventive Maintenance Completed", sub: "ESC calibration", t: "May 21 02:15 PM" },
];

const MAINTENANCE = [
  { icon: Wrench, title: "Preventive Maintenance", sub: "ESC & Valve Calibration", date: "May 21, 2025", ago: "2 days ago", status: "Completed" },
  { icon: Wrench, title: "Chamber Clean", sub: "Standard Clean", date: "May 14, 2025", ago: "9 days ago", status: "Completed" },
  { icon: Wrench, title: "RF Generator Check", sub: "RF Match Tuning", date: "May 7, 2025", ago: "16 days ago", status: "Completed" },
  { icon: Wrench, title: "He Leak Check", sub: "Leak Rate Verification", date: "Apr 30, 2025", ago: "23 days ago", status: "Completed" },
];

const HEALTH_TREND_PANELS = [
  { label: "Equipment Health Score", value: "72", suffix: "/100", color: "#38bdf8", data: gen(30, 70, 78) },
  { label: "Vacuum Pump Vibration (X)", value: "2.8", suffix: "mm/s", color: "#f59e0b", data: gen(30, 2.0, 2.9) },
  { label: "He Leak Rate", value: "3.2", suffix: "sccm", color: "#22c55e", data: gen(30, 2.4, 3.3), down: false },
  { label: "RF Power Stability", value: "96.4", suffix: "%", color: "#ef4444", data: gen(30, 96, 99, true) },
  { label: "ESC Valve Cycles", value: "2.3", suffix: "K", color: "#f59e0b", data: gen(30, 1.7, 2.4) },
  { label: "Chamber Pressure Stability", value: "2.1", suffix: "%", color: "#22c55e", data: gen(30, 1.9, 2.4) },
];

function gen(n: number, lo: number, hi: number, falling = false) {
  const arr: { i: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    const base = falling ? hi - (hi - lo) * p : lo + (hi - lo) * p;
    arr.push({ i, y: +(base + (Math.random() - 0.5) * (hi - lo) * 0.12).toFixed(2) });
  }
  return arr;
}

const PROCESS_UTIL = Array.from({ length: 7 }, (_, i) => ({ d: `D${i + 1}`, u: 70 + Math.round(Math.random() * 20) }));

const AI_REASONING = {
  summary: "Predicted maintenance window opens in 18 days with 88% confidence",
  signals: [
    { label: "Vacuum pump vibration X-axis", weight: 28, detail: "Trending +18% over 14d; mirrors EOL pattern from 7 similar Centura tools" },
    { label: "RF power stability", weight: 22, detail: "Variability climbed from 0.4% to 1.6% — suggests RF generator match drift" },
    { label: "He leak rate", weight: 18, detail: "+12% in 30d, correlated with O-ring degradation signature" },
    { label: "ESC throttle valve cycles", weight: 14, detail: "Accumulated cycles within 8% of replacement threshold" },
    { label: "Chamber pressure stability", weight: 10, detail: "Local oscillations during pump-down phase" },
    { label: "Recipe drift signatures", weight: 8, detail: "Subtle endpoint shift on ME-28-A1 lots" },
  ],
  counterfactual:
    "If vacuum pump vibration drops below 2.2 mm/s AND RF stability recovers above 98.5% within 48h, the recommendation downgrades to Monitor.",
};

const HOTSPOTS: { id: string; label: string; pos: [number, number, number]; status: "ok" | "warn" | "crit"; value: string }[] = [
  { id: "loadport", label: "Load Port", pos: [-2.6, -0.4, 0.9], status: "ok", value: "FOUP ready" },
  { id: "robot", label: "Transfer Robot", pos: [-1.4, 0.3, 0.6], status: "ok", value: "Cycle 4.1s" },
  { id: "chamber", label: "Vacuum Chamber", pos: [0.0, 0.7, 0.0], status: "warn", value: "2.1% drift" },
  { id: "rf", label: "RF Generator", pos: [1.3, 1.0, 0.2], status: "crit", value: "96.4% stab" },
  { id: "pump", label: "Vacuum Pump", pos: [-0.8, -0.8, -0.5], status: "warn", value: "2.8 mm/s" },
  { id: "gas", label: "Gas Delivery", pos: [-1.9, 1.0, -0.4], status: "ok", value: "Cl2 98.6%" },
  { id: "mfc", label: "Mass Flow Ctrl", pos: [-2.4, 0.5, -0.3], status: "ok", value: "Drift 0.4%" },
  { id: "esc", label: "ESC", pos: [0.3, 0.1, 0.4], status: "warn", value: "Cycles 2.3K" },
  { id: "chiller", label: "Chiller", pos: [2.2, -0.3, -0.6], status: "ok", value: "ΔT 2.1°C" },
  { id: "plc", label: "PLC Cabinet", pos: [2.5, 0.8, -0.2], status: "ok", value: "Online" },
];

/* ---------- atoms ---------- */

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

function useCountUp(target: number, duration = 1000) {
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

function CardHeader({ title, action, sub, info = true }: any) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-200 font-semibold flex items-center gap-1.5">
          {title}
          {info && <Info className="h-3 w-3 text-slate-500" />}
        </div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function Spark({ data, color }: { data: any[]; color: string }) {
  const pts = data.map ? data : [];
  const arr = typeof data[0] === "number" ? (data as number[]).map((y, i) => ({ i, y })) : (data as any);
  const id = `s-${color.replace("#", "")}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <div className="h-9 w-full">
      <ResponsiveContainer>
        <AreaChart data={arr} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area dataKey="y" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- left rail ---------- */

const RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence", active: true },
  { icon: NetIcon, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator" },
  { icon: Scale, label: "Simulation\nComparison", to: "/sead/simulation-comparison" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
];

function ModuleRail() {
  const nav = useNavigate();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5">
      {RAIL.map((r: any) => (
        <button
          key={r.label}
          onClick={() => r.to && nav(r.to)}
          className={`group relative w-[72px] py-2.5 rounded-lg flex flex-col items-center gap-1 transition ${
            r.active
              ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <r.icon className="h-[18px] w-[18px]" />
          <span className="text-[9.5px] leading-tight text-center px-1 whitespace-pre-line">{r.label}</span>
          {r.badge && (
            <span className="absolute top-1 right-1.5 h-3.5 min-w-3.5 px-1 rounded-full bg-rose-500 text-white text-[8.5px] font-bold grid place-items-center">
              {r.badge}
            </span>
          )}
          {r.active && (
            <motion.span
              layoutId="rail-eq-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]"
            />
          )}
        </button>
      ))}
    </aside>
  );
}

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
          <div className="text-[16px] font-semibold text-white tracking-tight">Equipment Health Intelligence</div>
          <div className="text-[11px] text-slate-400">Real-time health and performance view of critical equipment</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="relative w-[260px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          placeholder="Search tools, sensors, work orders…"
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

/* ---------- Equipment Title Bar ---------- */

function EquipmentTitleBar() {
  const nav = useNavigate();
  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="px-4 py-1.5 border-l border-white/[0.06] first:border-l-0">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-[12.5px] text-slate-100 font-medium tabular-nums mt-0.5">{value}</div>
    </div>
  );
  return (
    <GlassCard className="p-5">
      <button
        onClick={() => nav("/sead/command-center")}
        className="text-[11px] text-sky-300 hover:text-sky-200 mb-3 flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Factory Overview
      </button>
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-[34px] font-semibold text-white tracking-tight leading-none">{EQ.id}</h1>
        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {EQ.status}
        </span>
      </div>
      <div className="text-[13px] text-slate-300 mt-2">
        {EQ.type} <span className="text-slate-500">|</span> {EQ.manufacturer}
      </div>
      <div className="mt-4 flex flex-wrap rounded-lg bg-white/[0.02] border border-white/[0.05]">
        <Field label="Area" value={EQ.area} />
        <Field label="Process" value={EQ.process} />
        <Field label="Node" value={EQ.node} />
        <Field label="Recipe" value={EQ.recipe} />
        <Field label="Utilization" value={EQ.utilization} />
        <Field label="Equipment ID" value={EQ.eqId} />
        <Field label="Install Date" value={EQ.installed} />
        <Field label="MTBF" value={EQ.mtbf} />
        <Field label="MTTR" value={EQ.mttr} />
      </div>
    </GlassCard>
  );
}

/* ---------- 3D etch chamber ---------- */

function Chamber({ onHotspot }: { onHotspot: (id: string) => void }) {
  return (
    <group>
      {/* base platform */}
      <mesh position={[0, -1.1, 0]} receiveShadow>
        <boxGeometry args={[7, 0.3, 4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* main chamber body */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[2.2, 2.0, 2.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.25} />
      </mesh>
      {/* chamber window */}
      <mesh position={[0, 0.3, 1.11]}>
        <planeGeometry args={[1.4, 1.1]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0369a1" emissiveIntensity={0.6} metalness={0.9} roughness={0.1} transparent opacity={0.45} />
      </mesh>
      {/* plasma glow inside */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.55} />
      </mesh>
      <pointLight position={[0, 0.2, 0]} color="#c084fc" intensity={1.4} distance={3} />

      {/* RF generator stack right */}
      <mesh position={[1.8, 0.4, 0]}>
        <boxGeometry args={[1.0, 2.4, 1.6]} />
        <meshStandardMaterial color="#262f43" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[1.8, 1.2, 0.81]}>
        <planeGeometry args={[0.7, 0.5]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.8} />
      </mesh>

      {/* gas delivery left */}
      <mesh position={[-1.8, 0.4, 0]}>
        <boxGeometry args={[1.0, 2.4, 1.6]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* gas cylinders */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[-1.8, -0.5, x]}>
          <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* vacuum pumps below */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={i} position={[x, -0.75, -0.8]}>
          <cylinderGeometry args={[0.32, 0.32, 0.6, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* load port front */}
      <mesh position={[-2.6, -0.55, 1.1]}>
        <boxGeometry args={[0.7, 0.9, 0.7]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* PLC cabinet */}
      <mesh position={[2.7, 0.5, -0.4]}>
        <boxGeometry args={[0.5, 1.8, 1.0]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* hotspots */}
      {HOTSPOTS.map((h) => (
        <Hotspot key={h.id} spot={h} onClick={() => onHotspot(h.id)} />
      ))}
    </group>
  );
}

function Hotspot({ spot, onClick }: { spot: typeof HOTSPOTS[number]; onClick: () => void }) {
  const color = spot.status === "crit" ? "#ef4444" : spot.status === "warn" ? "#f59e0b" : "#22c55e";
  const [hover, setHover] = useState(false);
  return (
    <group position={spot.pos}>
      <Html center distanceFactor={6} zIndexRange={[10, 0]}>
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="relative cursor-pointer"
          style={{ pointerEvents: "auto" }}
        >
          <span
            className="block h-3 w-3 rounded-full animate-pulse"
            style={{ background: color, boxShadow: `0 0 14px ${color}, 0 0 4px #fff` }}
          />
          <span
            className="absolute h-6 w-6 rounded-full -inset-1.5 animate-ping"
            style={{ background: `${color}33` }}
          />
          {hover && (
            <div className="absolute left-4 -top-1 px-2 py-1 rounded-md bg-slate-900/95 border border-white/10 text-[10px] whitespace-nowrap text-slate-100 shadow-xl z-50">
              <div className="font-semibold">{spot.label}</div>
              <div className="text-slate-400">{spot.value}</div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function EquipmentViewer({ onHotspot }: { onHotspot: (id: string) => void }) {
  const [tab, setTab] = useState<"3d" | "pid" | "sensors" | "alarms" | "logs" | "maint">("3d");
  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="grid grid-cols-[80px_1fr]">
        {/* left view tabs */}
        <div className="border-r border-white/[0.06] py-3 px-2 flex flex-col gap-1 bg-white/[0.01]">
          {[
            { id: "3d", label: "3D", icon: Boxes },
            { id: "pid", label: "P&ID", icon: NetIcon },
            { id: "sensors", label: "Sensors", icon: Activity },
            { id: "alarms", label: "Alarms", icon: AlertTriangle },
            { id: "logs", label: "Logs", icon: FileBarChart2 },
            { id: "maint", label: "Maintenance", icon: Wrench },
          ].map((t: any) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-2 rounded-md flex flex-col items-center gap-1 text-[9.5px] transition ${
                tab === t.id ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* main viewport */}
        <div className="relative h-[480px]">
          {tab === "3d" ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06),transparent_70%)]" />
              <Canvas shadows camera={{ position: [4.5, 3.2, 5.5], fov: 38 }}>
                <ambientLight intensity={0.35} />
                <directionalLight position={[6, 8, 4]} intensity={1.0} castShadow />
                <directionalLight position={[-4, 3, -2]} intensity={0.4} color="#7dd3fc" />
                <Suspense fallback={null}>
                  <Chamber onHotspot={onHotspot} />
                  <Environment preset="warehouse" />
                </Suspense>
                <OrbitControls
                  enablePan
                  enableZoom
                  autoRotate
                  autoRotateSpeed={0.35}
                  minDistance={4}
                  maxDistance={12}
                  maxPolarAngle={Math.PI / 2.05}
                />
              </Canvas>
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">
              {tab.toUpperCase()} view — telemetry view available in drawer
            </div>
          )}

          {/* viewport controls */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {[
              { icon: RotateCw, label: "Rotate" },
              { icon: ZoomIn, label: "Zoom" },
              { icon: MoveDiagonal, label: "Pan" },
              { icon: RefreshCw, label: "Reset View" },
            ].map((c) => (
              <button
                key={c.label}
                className="h-8 px-3 rounded-md bg-slate-900/80 border border-white/[0.08] text-sky-200 text-[11px] flex items-center gap-1.5 hover:bg-sky-500/15 backdrop-blur"
              >
                <c.icon className="h-3.5 w-3.5" /> {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ---------- right column: health score, RUL, PoF ---------- */

function HealthScoreCard() {
  const score = useCountUp(HEALTH.score);
  const conf = useCountUp(HEALTH.confidence);
  return (
    <GlassCard className="p-4">
      <CardHeader title="Equipment Health Score" />
      <div className="grid grid-cols-[auto_1fr_1fr] gap-5 items-center">
        <div className="relative h-[110px] w-[110px]">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.06)" strokeWidth="9" fill="none" />
            <circle
              cx="60" cy="60" r="48"
              stroke="#f59e0b" strokeWidth="9" fill="none" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={(2 * Math.PI * 48) * (1 - score / 100)}
              style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.7))" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-[28px] font-semibold text-white tabular-nums leading-none">{Math.round(score)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">/100</div>
            </div>
          </div>
        </div>
        <div>
          <div className={`text-[22px] font-semibold ${HEALTH.categoryColor} leading-none`}>{HEALTH.category}</div>
          <div className="text-[12px] text-amber-300/80 mt-1">{HEALTH.state}</div>
          <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">Trend (7D)</div>
          <div className="text-[12px] text-rose-400 flex items-center gap-1 mt-0.5">
            <TrendingDown className="h-3 w-3" /> -6 pts
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">AI Confidence</div>
          <div className="text-[24px] text-white font-semibold tabular-nums mt-1">
            {Math.round(conf)}% <span className="text-[11px] text-emerald-400 font-normal">High</span>
          </div>
          <div className="mt-2"><Spark data={HEALTH.trend7d} color="#22c55e" /></div>
        </div>
      </div>
    </GlassCard>
  );
}

function RulCard() {
  return (
    <GlassCard className="p-4">
      <div className="grid grid-cols-[1fr_1.6fr] gap-4">
        <div>
          <CardHeader title="Remaining Useful Life (RUL)" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[40px] font-semibold text-white tabular-nums leading-none">18</span>
            <span className="text-[12px] text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">(± 4 days)</div>
          <div className="mt-3 text-[10.5px] text-slate-400">
            <div>Operating hrs left: <span className="text-slate-200 tabular-nums">432</span></div>
            <div>Historical model accuracy: <span className="text-emerald-300 tabular-nums">91%</span></div>
          </div>
        </div>
        <div className="h-[140px]">
          <ResponsiveContainer>
            <AreaChart data={RUL_DATA} margin={{ top: 10, right: 5, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="rul-band" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="d" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Area dataKey="upper" stroke="none" fill="url(#rul-band)" />
              <Area dataKey="lower" stroke="none" fill="#06080f" />
              <Line type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={1.8} dot={false} />
              <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="4 3" dot={false} />
              <RTooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 10, color: "#e2e8f0" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

function PofCard() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Probability of Failure" />
      <div className="grid grid-cols-3 gap-3">
        {FAILURE_PROB.map((f) => {
          const v = useCountUp(f.value, 1200);
          return (
            <div key={f.window}>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{f.window}</div>
              <div className="text-[26px] font-semibold text-white tabular-nums" style={{ color: f.color }}>
                {Math.round(v)}%
              </div>
              <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden mt-1">
                <motion.div initial={{ width: 0 }} animate={{ width: `${f.value}%` }} transition={{ duration: 1 }} className="h-full" style={{ background: f.color }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <div className="text-slate-400">Primary Risk Driver</div>
        <div className="text-right text-slate-200">Vacuum Pump Wear</div>
        <div className="text-slate-400">Cost Exposure</div>
        <div className="text-right text-rose-400 tabular-nums">$284K</div>
        <div className="text-slate-400">Production Impact</div>
        <div className="text-right text-amber-300">~12 lots / day</div>
      </div>
    </GlassCard>
  );
}

/* ---------- KHI table ---------- */

function KhiTable({ onRow }: { onRow: (name: string) => void }) {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Key Health Indicators" />
      <div className="overflow-x-auto">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-white/[0.06]">
              <th className="text-left font-medium py-2 pr-3">Parameter</th>
              <th className="text-right font-medium py-2 px-3">Current</th>
              <th className="text-left font-medium py-2 px-3 w-[120px]">7D Trend</th>
              <th className="text-left font-medium py-2 px-3">Status</th>
              <th className="text-right font-medium py-2 pl-3">vs Baseline</th>
            </tr>
          </thead>
          <tbody>
            {KHI.map((k, i) => (
              <motion.tr
                key={k.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onRow(k.name)}
                className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition"
              >
                <td className="py-2 pr-3 text-slate-200">{k.name}</td>
                <td className="py-2 px-3 text-right text-slate-100 tabular-nums">{k.val}</td>
                <td className="py-2 px-3"><Spark data={k.spark} color={k.sparkColor} /></td>
                <td className="py-2 px-3">
                  <span className="inline-flex items-center gap-1.5" style={{ color: k.color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: k.color }} />
                    {k.status}
                  </span>
                </td>
                <td className={`py-2 pl-3 text-right tabular-nums ${k.deltaColor || "text-slate-300"}`}>
                  {k.deltaText || "—"}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

/* ---------- Recent alarms / maintenance / process ---------- */

function RecentAlarms() {
  return (
    <GlassCard className="p-4 h-full">
      <CardHeader title="Recent Alarms & Events" action={<button className="text-[11px] text-sky-300">View All</button>} />
      <div className="space-y-1.5">
        {RECENT_ALARMS.map((a, i) => (
          <div key={i} className="flex items-start gap-3 p-2 rounded-md hover:bg-white/[0.03] cursor-pointer transition">
            <div className={`h-7 w-7 shrink-0 grid place-items-center rounded-md ${a.bg} border border-white/[0.06]`}>
              <a.icon className={`h-3.5 w-3.5 ${a.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-white font-medium truncate">{a.title}</div>
              <div className="text-[10.5px] text-slate-400">{a.sub}</div>
            </div>
            <div className="text-[10px] text-slate-500 text-right">{a.t}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function MaintenanceHistory() {
  return (
    <GlassCard className="p-4 h-full">
      <CardHeader title="Maintenance History" action={<button className="text-[11px] text-sky-300">View All</button>} />
      <div className="space-y-1.5">
        {MAINTENANCE.map((m, i) => (
          <div key={i} className="flex items-start gap-3 p-2 rounded-md hover:bg-white/[0.03] cursor-pointer transition">
            <div className="h-7 w-7 shrink-0 grid place-items-center rounded-md bg-sky-500/10 border border-sky-500/20">
              <m.icon className="h-3.5 w-3.5 text-sky-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-white font-medium truncate">{m.title}</div>
              <div className="text-[10.5px] text-slate-400">{m.sub}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-300 tabular-nums">{m.date}</div>
              <div className="text-[9.5px] text-emerald-300 mt-0.5 inline-flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" /> {m.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ProcessUtilization() {
  return (
    <GlassCard className="p-4 h-full">
      <CardHeader title="Process & Utilization" action={<button className="text-[11px] text-sky-300">View Details</button>} />
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Utilization (7D)</div>
          <div className="text-[34px] font-semibold text-white tabular-nums leading-none mt-1">85<span className="text-[14px] text-slate-400 ml-0.5">%</span></div>
          <div className="h-[80px] mt-2">
            <ResponsiveContainer>
              <AreaChart data={PROCESS_UTIL} margin={{ top: 4, right: 0, bottom: 0, left: -32 }}>
                <defs>
                  <linearGradient id="util-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={[40, 100]} />
                <XAxis dataKey="d" hide />
                <Area dataKey="u" stroke="#38bdf8" strokeWidth={1.5} fill="url(#util-grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="text-[11px] space-y-1.5 min-w-[140px]">
          {[
            ["Processed Wafers (7D)", "12,842"],
            ["Good Wafers (7D)", "12,523"],
            ["Avg Cycle Time", "48.6 sec"],
            ["OEE (7D)", "78.2%"],
            ["Down Time (7D)", "4.6 hrs"],
          ].map(([l, v]) => (
            <div key={l} className="grid grid-cols-[1fr_auto] gap-3">
              <div className="text-slate-400">{l}</div>
              <div className="text-slate-100 tabular-nums">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

/* ---------- Health Trend Panels ---------- */

function HealthTrendGrid() {
  return (
    <GlassCard className="p-4">
      <CardHeader title="Health Trend (30 Days)" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {HEALTH_TREND_PANELS.map((p) => (
          <div key={p.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] cursor-pointer transition">
            <div className="text-[10px] text-slate-400 truncate">{p.label}</div>
            <div className="text-[18px] font-semibold tabular-nums mt-1" style={{ color: p.color }}>
              {p.value}<span className="text-[10px] text-slate-500 ml-0.5">{p.suffix}</span>
            </div>
            <div className="h-[60px] mt-1 -mx-1">
              <ResponsiveContainer>
                <AreaChart data={p.data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`ht-${p.label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={p.color} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area dataKey="y" stroke={p.color} strokeWidth={1.4} fill={`url(#ht-${p.label.replace(/\s/g, "")})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 -mt-0.5">
              <span>Apr 24</span><span>May 23</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ---------- AI Reasoning + Predictive Maintenance ---------- */

function AiReasoning({ onOpen }: { onOpen: () => void }) {
  return (
    <GlassCard className="p-4 h-full">
      <CardHeader
        title="AI Reasoning"
        sub="Why health is declining"
        action={
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
            Confidence 88%
          </span>
        }
      />
      <div className="text-[12px] text-slate-200 leading-relaxed mb-3">
        <Sparkles className="inline h-3.5 w-3.5 text-amber-300 mr-1" />
        {AI_REASONING.summary}.
      </div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Top Signals Analyzed</div>
      <div className="space-y-1.5">
        {AI_REASONING.signals.slice(0, 5).map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-200 truncate pr-2">{s.label}</span>
              <span className="text-slate-400 tabular-nums">{s.weight}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${s.weight * 3}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-sky-500 to-violet-500" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2.5 rounded-md bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/90">
        <span className="font-semibold">Counterfactual: </span>{AI_REASONING.counterfactual}
      </div>
      <button onClick={onOpen} className="mt-3 w-full h-8 rounded-md bg-sky-500/15 border border-sky-400/30 text-sky-200 text-[11.5px] hover:bg-sky-500/25 transition">
        Open Full Explainability →
      </button>
    </GlassCard>
  );
}

const PRED_MAINT = [
  { title: "Replace Vacuum Pump", icon: Wrench, downtime: "4 hrs", cost: "$18K", benefit: "Restore 12% throughput, prevent unplanned downtime", conf: 92 },
  { title: "RF Generator Inspection", icon: Zap, downtime: "1.5 hrs", cost: "$3.2K", benefit: "Recover RF stability above 99%", conf: 85 },
  { title: "ESC Conditioning", icon: ThermometerSun, downtime: "2 hrs", cost: "$2.8K", benefit: "Extend ESC life ~40%", conf: 78 },
];

function PredictiveMaintenance() {
  return (
    <GlassCard className="p-4 h-full">
      <CardHeader title="Predictive Maintenance" sub="AI Recommendations" action={<span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">3 pending</span>} />
      <div className="space-y-2">
        {PRED_MAINT.map((r) => (
          <div key={r.title} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition">
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 shrink-0 grid place-items-center rounded-md bg-amber-500/10 border border-amber-500/20">
                <r.icon className="h-4 w-4 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] text-white font-semibold">{r.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{r.benefit}</div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-slate-400">
                  <span>Downtime: <span className="text-slate-200">{r.downtime}</span></span>
                  <span>Cost: <span className="text-slate-200">{r.cost}</span></span>
                  <span>Confidence: <span className="text-emerald-300 tabular-nums">{r.conf}%</span></span>
                </div>
              </div>
              <button className="text-[11px] px-2.5 h-7 rounded-md bg-sky-500/15 border border-sky-400/30 text-sky-200 hover:bg-sky-500/25 shrink-0 transition">
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function OperationalContext() {
  return (
    <GlassCard className="p-4 h-full">
      <CardHeader title="Operational Context" sub="Production line role" />
      <div className="space-y-2 text-[11.5px]">
        <Row label="Upstream" value="LITH-021, DIFF-011" />
        <Row label="Downstream" value="CMP-038, MET-217" />
        <Row label="Affected Recipes" value="ME-28-A1 · ME-28-B2 · ME-40-C1" />
        <Row label="Current Lots" value="14 active · 6 priority" />
        <Row label="Revenue at Risk" value="$2.4M / wk" color="text-rose-300" />
        <Row label="Yield Impact" value="-0.6% on Logic 28nm" color="text-amber-300" />
        <Row label="Fab Bottleneck Score" value="3 / 10 (low)" color="text-emerald-300" />
        <Row label="Customer Commitment" value="On Track · 3 priority lots due Fri" color="text-emerald-300" />
      </div>
    </GlassCard>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-1 border-b border-white/[0.03] last:border-0">
      <div className="text-slate-500 text-[11px]">{label}</div>
      <div className={`text-right ${color || "text-slate-100"}`}>{value}</div>
    </div>
  );
}

/* ---------- Right-side Drawer ---------- */

const DRAWER_TABS = ["Executive", "Operations", "Engineering", "Telemetry", "Maintenance", "AI Reasoning", "Dependencies", "Documentation"];

function KnowledgeDrawer({ open, target, onClose }: { open: boolean; target: string | null; onClose: () => void }) {
  const [tab, setTab] = useState("Executive");
  const [level, setLevel] = useState<100 | 200 | 300>(100);
  const title = target ? HOTSPOTS.find((h) => h.id === target)?.label ?? target : "Component";

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }}
          transition={{ type: "spring", damping: 26, stiffness: 220 }}
          className="fixed top-0 right-0 h-full w-[460px] bg-[#0a0e1a]/95 backdrop-blur-xl border-l border-white/[0.08] z-50 flex flex-col shadow-2xl"
        >
          <div className="flex items-start justify-between p-4 border-b border-white/[0.06]">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-sky-300">Knowledge Drawer</div>
              <div className="text-[16px] font-semibold text-white mt-0.5">{title}</div>
              <div className="text-[10.5px] text-slate-400">ETCH-217 · Applied Materials Centura®</div>
            </div>
            <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05]">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* level selector */}
          <div className="px-4 pt-3">
            <div className="grid grid-cols-3 rounded-md bg-white/[0.03] border border-white/[0.06] p-0.5 text-[11px]">
              {([100, 200, 300] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevel(lv)}
                  className={`py-1.5 rounded transition ${level === lv ? "bg-sky-500/20 text-sky-200" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {lv} Level · {lv === 100 ? "Executive" : lv === 200 ? "Operations" : "Engineering"}
                </button>
              ))}
            </div>
          </div>

          {/* tabs */}
          <div className="px-4 mt-3 flex gap-1 overflow-x-auto border-b border-white/[0.06] pb-0">
            {DRAWER_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[11px] px-2.5 py-1.5 whitespace-nowrap border-b-2 transition ${
                  tab === t ? "border-sky-400 text-sky-200" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[12px] text-slate-300">
            {level === 100 && (
              <>
                <Section title="Business Objective">
                  Sustain wafer throughput for Logic 28nm. {title} is a contributing subsystem to ETCH-217's overall health score of {HEALTH.score}.
                </Section>
                <Section title="Financial Impact">$284K cost exposure over next 30 days if no maintenance is performed. Recommended action ROI: ~8.2×.</Section>
                <Section title="Recommended Decision">Approve maintenance window <span className="text-emerald-300 font-semibold">Tonight 10 PM – 2 AM</span>. Production impact limited to 4 hrs with re-routing to ETCH-218.</Section>
              </>
            )}
            {level === 200 && (
              <>
                <Section title="Current Operating Conditions">Recipe ME-28-A1 · Chamber 2.1% pressure drift · Utilization 85%.</Section>
                <Section title="Subsystem Health">RF generator stability degraded to 96.4%. Vacuum pump vibration trending +18%.</Section>
                <Section title="Dependencies">Upstream LITH-021 (healthy) · Downstream CMP-038 (healthy). 14 active lots — 6 priority.</Section>
                <Section title="Alarm Trends">3 warnings in last 24h, all correlated to He leak rate and RF stability.</Section>
              </>
            )}
            {level === 300 && (
              <>
                <Section title="Sensor Architecture">12 process sensors · 8 utility sensors · 4 vibration accelerometers sampled at 2 kHz via SECS/GEM and streamed through EDA freeze-frame.</Section>
                <Section title="Control Loops">Adaptive APC controller tuned for endpoint detection; RF match auto-tune cycle 250 ms.</Section>
                <Section title="Predictive Model">XGBoost ensemble v4.2.1 trained on 1.4M wafer-hours across 7 Centura tools. Feature importance: vibration_x (0.28), rf_stab (0.22), he_leak (0.18).</Section>
                <Section title="Anomaly Detection">Multivariate Isolation Forest flagged 4 anomalies in last 7d, all aligned with pump-down phase.</Section>
                <Section title="Recommended Validation">Run RF match characterization sweep · Trend vibration spectrum FFT against historical EOL signature.</Section>
              </>
            )}
          </div>

          <div className="p-3 border-t border-white/[0.06] flex gap-2">
            <button className="flex-1 h-9 rounded-md bg-sky-500/20 border border-sky-400/40 text-sky-100 text-[12px] font-medium hover:bg-sky-500/30 transition">
              Open Recommended Action
            </button>
            <button className="h-9 px-3 rounded-md bg-white/[0.03] border border-white/[0.08] text-slate-300 text-[12px] hover:bg-white/[0.06]">
              Export
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{title}</div>
      <div className="text-[12px] text-slate-200 leading-relaxed">{children}</div>
    </div>
  );
}

/* ---------- the page ---------- */

export default function EquipmentHealthIntelligence() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTarget, setDrawerTarget] = useState<string | null>(null);

  const open = (id: string) => {
    setDrawerTarget(id);
    setDrawerOpen(true);
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
          <ModuleRail />

          <main className="flex-1 min-w-0 px-5 py-4 space-y-4">
            <EquipmentTitleBar />

            {/* primary row: viewer + scoring stack */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-7">
                <EquipmentViewer onHotspot={open} />
              </div>
              <div className="col-span-12 xl:col-span-5 space-y-4">
                <HealthScoreCard />
                <RulCard />
                <PofCard />
              </div>
            </div>

            {/* KHI table */}
            <KhiTable onRow={(name) => open(name)} />

            {/* row: recent alarms, maintenance, process utilization */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 xl:col-span-4"><RecentAlarms /></div>
              <div className="col-span-12 md:col-span-6 xl:col-span-4"><MaintenanceHistory /></div>
              <div className="col-span-12 xl:col-span-4"><ProcessUtilization /></div>
            </div>

            {/* health trend */}
            <HealthTrendGrid />

            {/* AI reasoning + recommendations + context */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-5"><AiReasoning onOpen={() => open("ai")} /></div>
              <div className="col-span-12 md:col-span-7 xl:col-span-4"><PredictiveMaintenance /></div>
              <div className="col-span-12 md:col-span-5 xl:col-span-3"><OperationalContext /></div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2 border-t border-white/[0.05]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Equipment data streaming · SECS/GEM · EDA · Historian
                </span>
              </div>
              <div>Texas Instruments · DFW Fab · Equipment Health Intelligence v1.0</div>
            </div>
          </main>
        </div>

        <KnowledgeDrawer open={drawerOpen} target={drawerTarget} onClose={() => setDrawerOpen(false)} />
      </div>
    </AppShell>
  );
}
