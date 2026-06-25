import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, ArrowLeft, Gauge, Lightbulb, GitBranch, Share2,
  CheckCircle2, RotateCcw, SlidersHorizontal, Database, Droplet, Truck,
  Users, Activity, Wind, FileWarning, UserPlus, ArrowUp, ArrowDown,
} from "lucide-react";
import etchImg from "@/assets/etch-chamber-3d.jpg";
import {
  BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RTooltip, Legend, ScatterChart, Scatter, ZAxis, ReferenceLine,
} from "recharts";

/* ============================= atoms ============================= */
function GlassCard({ children, className = "" }: any) {
  return (
    <div className={
      "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
      "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " + className
    }>{children}</div>
  );
}

/* ============================= rail ============================= */
const RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: NetIcon, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator" },
  { icon: Scale, label: "Simulation\nComparison", to: "/sead/simulation-comparison" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if", active: true },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
];

function ModuleRail() {
  const nav = useNavigate();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5">
      {RAIL.map((r: any) => (
        <button key={r.label} onClick={() => r.to && nav(r.to)}
          className={`group relative w-[72px] py-2.5 rounded-lg flex flex-col items-center gap-1 transition ${
            r.active
              ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}>
          <r.icon className="h-[18px] w-[18px]" />
          <span className="text-[9.5px] leading-tight text-center px-1 whitespace-pre-line">{r.label}</span>
          {r.active && (
            <motion.span layoutId="rail-whatif-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ============================= header ============================= */
function AppHeader() {
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">What Changes My Recommendation?</div>
          <div className="text-[11px] text-slate-400">See how different scenarios and constraints impact the optimal maintenance window</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
        <Factory className="h-3.5 w-3.5 text-slate-400" />
        <div className="leading-tight">
          <div className="text-[9.5px] uppercase tracking-wider text-slate-500">Fab</div>
          <div className="text-[12.5px] font-semibold text-white">DFW Semiconductor Fab</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
      </div>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
        <div className="leading-tight">
          <div className="text-[12.5px] text-white font-semibold">May 23, 2025 10:24 AM CT</div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 text-[9px] bg-sky-500 text-white rounded-full w-4 h-4 grid place-items-center">2</span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white"><HelpCircle className="h-4 w-4" /></button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-white text-[11px] font-bold">AO</div>
    </header>
  );
}

/* ============================= data ============================= */
const FACTORS = [
  { id: "metrology", icon: Database, name: "Another Metrology Tool Becomes Available", sub: "Tool MET-04 returns from PM" },
  { id: "utility",   icon: Droplet,  name: "Utility Outage Cancelled",                   sub: "DI water outage on May 28 cancelled" },
  { id: "shipment",  icon: Truck,    name: "Customer Shipment Accelerated",              sub: "Customer 1 moves shipment up 2 days" },
  { id: "tech",      icon: Users,    name: "Technician Unavailable",                     sub: "Primary technician unavailable May 28" },
  { id: "vib",       icon: Activity, name: "New Vibration Threshold Exceeded",           sub: "Pump vibration exceeds warning threshold" },
  { id: "pressure",  icon: Wind,     name: "Chamber Pressure Stabilizes",                sub: "Pressure variance returns to normal range" },
  { id: "ecn",       icon: FileWarning, name: "Engineering Change Freeze Removed",       sub: "ECN freeze lifted on May 29" },
  { id: "crew",      icon: UserPlus, name: "Additional Maintenance Crew Available",      sub: "Second crew available May 28 night" },
];

type Scenario = {
  key: string; label: string; sub: string; window: string;
  conf: number; confTrend: "up" | "down";
  impact: string; impactVal: string; impactColor: string;
  risk: string; riskTrend: "up" | "down"; riskColor: string;
  delivery: string; deliveryColor: string;
  color: string;
};

const SCENARIOS: Scenario[] = [
  { key: "A", label: "Scenario A", sub: "If Another Metrology Tool Becomes Available",
    window: "May 29, 10:00 PM\n– May 30, 2:00 AM",
    conf: 82, confTrend: "down",
    impact: "Medium", impactVal: "(-$0.28M)", impactColor: "text-amber-300",
    risk: "Low (16%)", riskTrend: "up", riskColor: "text-emerald-300",
    delivery: "On Track", deliveryColor: "text-emerald-300",
    color: "#22c55e" },
  { key: "B", label: "Scenario B", sub: "If Utility Outage Cancelled",
    window: "May 28, 3:00 PM\n– May 28, 7:00 PM",
    conf: 91, confTrend: "up",
    impact: "Lower", impactVal: "(-$0.34M)", impactColor: "text-emerald-300",
    risk: "Low (12%)", riskTrend: "down", riskColor: "text-emerald-300",
    delivery: "On Track", deliveryColor: "text-emerald-300",
    color: "#38bdf8" },
  { key: "C", label: "Scenario C", sub: "If Customer Shipment Accelerated",
    window: "May 30, 10:00 PM\n– May 31, 2:00 AM",
    conf: 67, confTrend: "down",
    impact: "High", impactVal: "(-$1.05M)", impactColor: "text-rose-300",
    risk: "High (48%)", riskTrend: "up", riskColor: "text-rose-300",
    delivery: "At Risk", deliveryColor: "text-rose-300",
    color: "#f43f5e" },
  { key: "D", label: "Scenario D", sub: "If Technician Unavailable",
    window: "May 29, 10:00 PM\n– May 30, 2:00 AM",
    conf: 76, confTrend: "down",
    impact: "Medium", impactVal: "(-$0.45M)", impactColor: "text-amber-300",
    risk: "Medium (26%)", riskTrend: "up", riskColor: "text-amber-300",
    delivery: "On Track", deliveryColor: "text-emerald-300",
    color: "#a855f7" },
];

const OBJECTIVES = ["Throughput", "Yield", "On-time\nDelivery", "Maintenance\nCost", "Downtime", "Utility\nCost", "Quality\nRisk", "Safety\n& EHS", "Inventory", "Overall"];
const CHART_DATA = OBJECTIVES.map((o, i) => ({
  name: o,
  Current: [0.05, 0.04, 0.02, -0.1, -0.08, 0.03, 0.06, 0.05, -0.04, -0.12][i],
  A: [-0.18, -0.22, -0.15, 0.08, 0.12, -0.18, -0.2, -0.14, 0.1, -0.28][i],
  B: [0.22, 0.28, 0.18, -0.12, -0.2, 0.24, 0.18, 0.22, -0.1, 0.34][i],
  C: [-0.78, -0.65, -0.92, 0.34, 0.55, -0.42, -0.62, -0.48, 0.28, -1.05][i],
  D: [-0.32, -0.28, -0.22, 0.12, 0.16, -0.18, -0.25, -0.2, 0.08, -0.45][i],
}));

const PRIORITIES = [
  { name: "Throughput",       v: "High",    c: "text-emerald-300" },
  { name: "Yield",            v: "High",    c: "text-emerald-300" },
  { name: "On-time Delivery", v: "High",    c: "text-emerald-300" },
  { name: "Maintenance Cost", v: "Medium",  c: "text-amber-300" },
  { name: "Downtime",         v: "High",    c: "text-emerald-300" },
  { name: "Utility Cost",     v: "Medium",  c: "text-amber-300" },
];

/* ============================= page ============================= */
export default function WhatIf() {
  const nav = useNavigate();
  const [on, setOn] = useState<Record<string, boolean>>({});

  const toggled = useMemo(() => Object.values(on).filter(Boolean).length, [on]);
  const reset = () => setOn({});

  const summary = [
    { key: "Current\n(Baseline)", x: 0, y: 1, fill: "#38bdf8", r: 9 },
    { key: "Scenario A", x: 0.28, y: 2, fill: "#f59e0b", r: 12 },
    { key: "Scenario B", x: -0.65, y: 1, fill: "#22c55e", r: 12 },
    { key: "Scenario C", x: 0.95, y: 3, fill: "#f43f5e", r: 12 },
    { key: "Scenario D", x: 0.45, y: 2, fill: "#a855f7", r: 12 },
  ];

  return (
    <div className="min-h-screen bg-[#070912] text-slate-200 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-3xl" />

      <AppHeader />
      <div className="flex">
        <ModuleRail />
        <main className="flex-1 p-5 space-y-5">

          {/* HERO */}
          <GlassCard className="p-5">
            <button onClick={() => nav("/sead/ai-maintenance-decision-center")}
              className="inline-flex items-center gap-1.5 text-[12px] text-sky-300 hover:text-sky-200 mb-3">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Recommendation
            </button>
            <div className="grid grid-cols-12 gap-5 items-center">
              <div className="col-span-3 flex items-center gap-3">
                <div className="h-20 w-24 rounded-lg overflow-hidden border border-white/[0.06] bg-black/40">
                  <img src={etchImg} alt="ETCH-217" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[22px] font-bold text-white tracking-tight">ETCH-217</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">Fair</span>
                  </div>
                  <div className="text-[11.5px] text-slate-400">Metal Etch Chamber | Bay 2</div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Recommended Window (Current)</div>
                <div className="text-[15px] font-semibold text-white mt-1">May 28, 10:00 PM – May 29, 2:00 AM</div>
                <span className="inline-flex mt-2 text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">Recommended</span>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Overall Confidence</div>
                  <div className="text-[32px] font-bold text-white leading-none mt-1 tabular-nums">89%</div>
                </div>
                <svg width="90" height="56" viewBox="0 0 90 56">
                  <path d="M 8 50 A 37 37 0 0 1 82 50" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" strokeLinecap="round" />
                  <path d="M 8 50 A 37 37 0 0 1 82 50" stroke="#22c55e" strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray="116" strokeDashoffset={116 - (89/100) * 116} />
                  <g transform="translate(45 50) rotate(70)">
                    <line x1="0" y1="0" x2="0" y2="-30" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <circle r="3" fill="#fff" />
                  </g>
                </svg>
              </div>
              <div className="col-span-2">
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Overall Impact</div>
                <div className="text-[28px] font-bold text-emerald-300 leading-none mt-1">Low</div>
                <div className="text-[11px] text-slate-400 mt-1">(-$0.12M)</div>
              </div>
              <div className="col-span-2">
                <div className="text-[12px] text-white font-semibold">This recommendation is optimal</div>
                <div className="text-[11px] text-slate-400 mt-1">Based on all current data, constraints, and simulations across 10 objective areas.</div>
                <button className="mt-1 text-[11px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">How we evaluate windows →</button>
              </div>
            </div>
          </GlassCard>

          {/* MAIN */}
          <div className="grid grid-cols-12 gap-5">

            {/* LEFT: Change Factors */}
            <div className="col-span-3">
              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white">Change Factors</div>
                <div className="text-[11px] text-slate-500">Toggle factors to see how the recommendation changes</div>
                <div className="mt-3 space-y-2">
                  {FACTORS.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] transition">
                      <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] grid place-items-center text-slate-300 shrink-0">
                        <f.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11.5px] text-white font-medium leading-tight">{f.name}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{f.sub}</div>
                      </div>
                      <button
                        onClick={() => setOn((s) => ({ ...s, [f.id]: !s[f.id] }))}
                        className={`relative shrink-0 w-9 h-5 rounded-full transition ${on[f.id] ? "bg-sky-500" : "bg-white/[0.08]"}`}>
                        <motion.span
                          animate={{ x: on[f.id] ? 18 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 left-0 w-4 h-4 rounded-full bg-white shadow" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={reset}
                  className="mt-4 w-full h-9 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[12px] text-slate-200 inline-flex items-center justify-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset All
                </button>
              </GlassCard>
            </div>

            {/* RIGHT: Impact + Charts */}
            <div className="col-span-9 space-y-5">
              <GlassCard className="p-5">
                <div className="flex items-baseline gap-2">
                  <div className="text-[13.5px] font-semibold text-white">Impact of Changes</div>
                  <div className="text-[11px] text-slate-500">(Select one or more factors{toggled ? `, ${toggled} active` : ""})</div>
                </div>
                <div className="grid grid-cols-5 gap-3 mt-3">
                  {/* Current */}
                  <div className="rounded-xl border border-sky-400/30 bg-sky-500/[0.06] p-3 ring-1 ring-sky-400/20">
                    <div className="text-[12.5px] text-sky-200 font-semibold">Current Recommendation</div>
                    <div className="text-[13px] text-white font-semibold mt-1 whitespace-pre-line">May 28, 10:00 PM{"\n"}– May 29, 2:00 AM</div>
                    <span className="inline-flex mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">Recommended</span>
                    <div className="mt-3 space-y-1.5">
                      {[
                        { k: "Confidence", v: "89%", c: "text-white" },
                        { k: "Total Impact", v: "Low", sub: "(-$0.12M)", c: "text-emerald-300" },
                        { k: "Risk of Delay", v: "Low (14%)", c: "text-emerald-300" },
                        { k: "On-time Delivery", v: "On Track", c: "text-emerald-300" },
                      ].map((r) => (
                        <div key={r.k} className="flex items-baseline justify-between text-[11px] py-1 border-b border-white/[0.04] last:border-0">
                          <span className="text-slate-400">{r.k}</span>
                          <div className="text-right">
                            <div className={`font-semibold ${r.c}`}>{r.v}</div>
                            {r.sub && <div className="text-[10px] text-slate-500">{r.sub}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-3 w-full h-8 rounded-lg border border-sky-400/30 bg-sky-500/10 text-[11.5px] text-sky-200 font-medium">Baseline</button>
                  </div>

                  {/* Scenarios */}
                  {SCENARIOS.map((s) => (
                    <div key={s.key} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[12.5px] text-white font-semibold">{s.label}</div>
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">Changed</span>
                      </div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5">{s.sub}</div>
                      <div className="text-[12.5px] text-white font-semibold mt-2 whitespace-pre-line leading-tight">{s.window}</div>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-baseline justify-between text-[11px] py-1 border-b border-white/[0.04]">
                          <span className="text-slate-400">Confidence</span>
                          <span className={`font-semibold inline-flex items-center gap-1 ${s.confTrend === "up" ? "text-emerald-300" : "text-rose-300"}`}>
                            {s.conf}% {s.confTrend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between text-[11px] py-1 border-b border-white/[0.04]">
                          <span className="text-slate-400">Total Impact</span>
                          <div className="text-right">
                            <div className={`font-semibold ${s.impactColor}`}>{s.impact}</div>
                            <div className="text-[10px] text-slate-500">{s.impactVal}</div>
                          </div>
                        </div>
                        <div className="flex items-baseline justify-between text-[11px] py-1 border-b border-white/[0.04]">
                          <span className="text-slate-400">Risk of Delay</span>
                          <span className={`font-semibold inline-flex items-center gap-1 ${s.riskColor}`}>
                            {s.risk} {s.riskTrend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between text-[11px] py-1">
                          <span className="text-slate-400">On-time Delivery</span>
                          <span className={`font-semibold ${s.deliveryColor}`}>{s.delivery}</span>
                        </div>
                      </div>
                      <button className="mt-3 w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[11.5px] text-slate-300">View Details</button>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="grid grid-cols-2 gap-5">
                <GlassCard className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-[13.5px] font-semibold text-white">Impact Comparison Across Objectives</div>
                    <select className="h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300 px-2">
                      <option>Total Impact ($)</option>
                    </select>
                  </div>
                  <div className="h-[230px] mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={CHART_DATA} margin={{ top: 6, right: 8, left: -10, bottom: 6 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} />
                        <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v.toFixed(1)}M`} domain={[-1.1, 1.1]} />
                        <RTooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11 }} />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                        <RBar dataKey="Current" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                        <RBar dataKey="A" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                        <RBar dataKey="B" fill="#22c55e" radius={[2, 2, 0, 0]} />
                        <RBar dataKey="C" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                        <RBar dataKey="D" fill="#a855f7" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10.5px] text-slate-300 mt-1">
                    {[
                      { c: "#38bdf8", t: "Current (Baseline)" },
                      { c: "#f59e0b", t: "Scenario A" },
                      { c: "#22c55e", t: "Scenario B" },
                      { c: "#f43f5e", t: "Scenario C" },
                      { c: "#a855f7", t: "Scenario D" },
                    ].map((l) => (
                      <span key={l.t} className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: l.c }} /> {l.t}
                      </span>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="text-[13.5px] font-semibold text-white">Overall Impact Summary</div>
                  <div className="h-[260px] mt-2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 16 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" dataKey="x" name="Impact" domain={[-1.1, 1.1]} stroke="#64748b" fontSize={10}
                          tickFormatter={(v) => `$${v.toFixed(1)}M`}
                          label={{ value: "Lower Total Impact (Better)         Higher Total Impact (Worse)", position: "insideBottom", offset: -8, fill: "#64748b", fontSize: 10 }} />
                        <YAxis type="number" dataKey="y" name="Risk" domain={[0, 4]} ticks={[1,2,3]} tickFormatter={(v)=> ["Low","Medium","High"][v-1] || ""} stroke="#64748b" fontSize={10} />
                        <ZAxis dataKey="r" range={[120, 260]} />
                        <RTooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11 }} />
                        <ReferenceLine x={0} stroke="rgba(255,255,255,0.1)" />
                        <Scatter data={summary} shape={(p: any) => (
                          <g>
                            <circle cx={p.cx} cy={p.cy} r={9} fill={p.payload.fill} fillOpacity={0.9} stroke={p.payload.fill} strokeOpacity={0.4} strokeWidth={6} />
                            <text x={p.cx + 14} y={p.cy + 4} fill="#cbd5e1" fontSize={10}>{p.payload.key}</text>
                          </g>
                        )} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <GlassCard className="p-5">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-emerald-500/15 border border-emerald-400/30 grid place-items-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div className="text-[13.5px] font-semibold text-white">Key Takeaway</div>
                </div>
                <div className="text-[11.5px] text-slate-300 leading-relaxed mt-3">
                  The current recommendation remains the best balance of lowest total impact, minimal risk, and highest ability to complete.
                </div>
                <div className="text-[11.5px] text-slate-400 leading-relaxed mt-2">
                  <span className="text-emerald-300 font-semibold">Scenario B</span> could be better if utility outage is cancelled, but it depends on high certainty of availability.
                </div>
              </div>

              <div className="col-span-7">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13.5px] font-semibold text-white">What matters most to you?</div>
                    <div className="text-[11px] text-slate-500">Adjust priorities to see how the optimal window changes.</div>
                  </div>
                  <button className="h-8 px-3 rounded-lg bg-sky-500/10 border border-sky-400/30 text-[11.5px] text-sky-200 inline-flex items-center gap-1.5 hover:bg-sky-500/15">
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust Priorities
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2 mt-3">
                  {PRIORITIES.map((p) => (
                    <div key={p.name} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                      <div className="text-[10.5px] text-slate-400">{p.name}</div>
                      <div className={`text-[13px] font-semibold mt-1 ${p.c}`}>{p.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </main>
      </div>
    </div>
  );
}
