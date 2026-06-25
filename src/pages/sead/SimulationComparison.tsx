import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, ArrowLeft, Gauge, Lightbulb, GitBranch, Share2,
  Scale, Star, Award, Cpu, Users, DollarSign, Clock, Droplet, ShieldAlert,
  TrendingUp, TrendingDown, CheckCircle2, Download, RotateCcw, Plus, Search,
  Command as CmdIcon, Pin, Trophy, Play, ArrowUpDown, Keyboard, Minus, Target as TargetIcon, BookOpen} from "lucide-react";
import etchImg from "@/assets/etch-chamber-3d.jpg";
import {
  BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RTooltip, Legend, LineChart, Line as RLine,
} from "recharts";

function GlassCard({ children, className = "" }: any) {
  return (
    <div className={
      "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
      "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " + className
    }>{children}</div>
  );
}

const RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: NetIcon, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator" },
  { icon: Scale, label: "Simulation\nComparison", to: "/sead/simulation-comparison", active: true },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
  { icon: BookOpen, label: "Operational
Learning", to: "/sead/operational-learning" },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker" },
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
            <motion.span layoutId="rail-simcomp-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          )}
        </button>
      ))}
    </aside>
  );
}

function AppHeader({ onOpenPalette }: any) {
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Simulation Comparison</div>
          <div className="text-[11px] text-slate-400">Compare alternative maintenance windows and select the optimal outcome</div>
        </div>
      </div>
      <div className="flex-1" />
      <button onClick={onOpenPalette}
        className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] flex items-center gap-2 text-[11.5px] text-slate-300">
        <Search className="h-3.5 w-3.5" /> Search scenarios, actions…
        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-slate-400 flex items-center gap-1">
          <CmdIcon className="h-2.5 w-2.5" />K
        </span>
      </button>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
        <Factory className="h-3.5 w-3.5 text-slate-400" />
        <div className="leading-tight">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Fab</div>
          <div className="text-[12px] text-white font-medium">DFW Semiconductor Fab</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-2" />
      </div>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
        <div className="text-[12px] text-slate-200">May 23, 2025 10:24 AM CT</div>
        <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <button className="relative h-9 w-9 rounded-lg hover:bg-white/[0.04] grid place-items-center text-slate-300">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 grid place-items-center text-[9px] rounded-full bg-rose-500 text-white">2</span>
      </button>
      <button className="h-9 w-9 rounded-lg hover:bg-white/[0.04] grid place-items-center text-slate-300"><HelpCircle className="h-4 w-4" /></button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center text-white text-[12px] font-semibold">AO</div>
    </header>
  );
}

/* =========== scenarios with raw scores =========== */
type Scenario = {
  key: "A" | "B" | "C";
  title: string;
  window: string;
  desc: string;
  color: "emerald" | "sky" | "fuchsia";
  prodImpact: { level: string; tone: string; sub: string };
  yieldImpact: { level: string; tone: string; sub: string };
  custImpact: { level: string; tone: string; sub: string };
  maintCost: string;
  downtime: string;
  utility: { level: string; tone: string; sub: string };
  /** raw 0-100 scores per priority key */
  raw: Record<string, number>;
  confidence: number;
};

const SCENARIOS: Scenario[] = [
  {
    key: "A", title: "Maintain Tonight", window: "May 28, 10:00 PM – May 29, 2:00 AM",
    desc: "Perform maintenance during current planned window",
    color: "emerald",
    prodImpact: { level: "High", tone: "text-emerald-300", sub: "+9.2K wafers" },
    yieldImpact: { level: "High", tone: "text-emerald-300", sub: "+0.08%" },
    custImpact: { level: "Low", tone: "text-emerald-300", sub: "Low Risk" },
    maintCost: "$8.7K", downtime: "4.0 hrs",
    utility: { level: "Low", tone: "text-emerald-300", sub: "$1.2K" },
    raw: { throughput: 94, yield: 92, customer: 95, cost: 86, downtime: 88, utility: 94, risk: 95 },
    confidence: 89,
  },
  {
    key: "B", title: "Maintain Tomorrow", window: "May 29, 10:00 PM – May 30, 2:00 AM",
    desc: "Defer maintenance by 24 hours",
    color: "sky",
    prodImpact: { level: "Medium", tone: "text-sky-300", sub: "+3.1K wafers" },
    yieldImpact: { level: "Medium", tone: "text-sky-300", sub: "-0.02%" },
    custImpact: { level: "Medium", tone: "text-amber-300", sub: "Medium Risk" },
    maintCost: "$8.7K", downtime: "4.0 hrs",
    utility: { level: "Medium", tone: "text-amber-300", sub: "$4.6K" },
    raw: { throughput: 74, yield: 70, customer: 68, cost: 86, downtime: 88, utility: 70, risk: 72 },
    confidence: 82,
  },
  {
    key: "C", title: "Wait 7 Days", window: "Jun 4, 10:00 PM – Jun 5, 2:00 AM",
    desc: "Extend operation and perform in 7 days",
    color: "fuchsia",
    prodImpact: { level: "Low", tone: "text-rose-300", sub: "-12.6K wafers" },
    yieldImpact: { level: "Low", tone: "text-rose-300", sub: "-0.15%" },
    custImpact: { level: "High", tone: "text-rose-300", sub: "High Risk" },
    maintCost: "$9.1K", downtime: "4.0 hrs",
    utility: { level: "High", tone: "text-rose-300", sub: "$9.3K" },
    raw: { throughput: 28, yield: 32, customer: 22, cost: 78, downtime: 88, utility: 30, risk: 24 },
    confidence: 71,
  },
];

const accent = (c: string) => ({
  emerald: { text: "text-emerald-300", bar: "from-emerald-400 to-emerald-500", glow: "shadow-[0_0_30px_-12px_rgba(16,185,129,0.7)]", ring: "ring-emerald-400/30", border: "border-emerald-400/30", dot: "#10b981" },
  sky: { text: "text-sky-300", bar: "from-sky-400 to-sky-500", glow: "shadow-[0_0_30px_-12px_rgba(56,189,248,0.7)]", ring: "ring-sky-400/30", border: "border-sky-400/30", dot: "#38bdf8" },
  fuchsia: { text: "text-fuchsia-300", bar: "from-fuchsia-400 to-fuchsia-500", glow: "shadow-[0_0_30px_-12px_rgba(232,121,249,0.6)]", ring: "ring-fuchsia-400/30", border: "border-fuchsia-400/30", dot: "#e879f9" },
} as any)[c];

/* =========== priorities + presets =========== */
const INITIAL_PRIORITIES = [
  { key: "throughput", label: "Production Throughput", color: "#38bdf8", v: 80 },
  { key: "yield", label: "Yield / Quality", color: "#a78bfa", v: 70 },
  { key: "customer", label: "Customer Commitments", color: "#e879f9", v: 60 },
  { key: "cost", label: "Maintenance Cost", color: "#f472b6", v: 40 },
  { key: "downtime", label: "Downtime", color: "#fb7185", v: 50 },
  { key: "utility", label: "Utility / Facilities", color: "#fb923c", v: 40 },
  { key: "risk", label: "Risk / Reliability", color: "#38bdf8", v: 70 },
];

const PRESETS: Record<string, Record<string, number>> = {
  Balanced:        { throughput: 80, yield: 70, customer: 60, cost: 40, downtime: 50, utility: 40, risk: 70 },
  "Max Throughput":{ throughput: 100, yield: 60, customer: 70, cost: 20, downtime: 60, utility: 30, risk: 60 },
  "Max Yield":     { throughput: 60, yield: 100, customer: 75, cost: 30, downtime: 40, utility: 30, risk: 70 },
  "Min Cost":      { throughput: 50, yield: 50, customer: 50, cost: 100, downtime: 40, utility: 80, risk: 40 },
  "Min Risk":      { throughput: 60, yield: 70, customer: 90, cost: 30, downtime: 60, utility: 50, risk: 100 },
};

function computeScore(s: Scenario, weights: typeof INITIAL_PRIORITIES) {
  const sumW = weights.reduce((a, w) => a + w.v, 0) || 1;
  const composite = weights.reduce((acc, w) => acc + (s.raw[w.key] ?? 0) * w.v, 0) / sumW;
  return Math.round(composite);
}

/* =========== scenario card =========== */
const ScenarioCard = ({
  s, score, rank, winnerKey, selected, pinned, dimmed, onSelect, onPin,
}: any) => {
  const a = accent(s.color);
  const chartData = useMemo(() => {
    const days = ["May 28", "May 29", "May 30", "May 31", "Jun 1", "Jun 2", "Jun 3"];
    const seed = s.key.charCodeAt(0);
    return days.map((d, i) => ({
      d,
      Production: 30 + ((seed * (i + 1)) % 40),
      Yield: 20 + ((seed * (i + 2)) % 35),
      Risk: 15 + ((seed * (i + 3)) % 30),
      Cost: 10 + ((seed * (i + 4)) % 25),
    }));
  }, [s.key]);
  const isWinner = s.key === winnerKey;
  const delta = score - (SCENARIOS.find((x) => x.key === winnerKey)?.raw ? 0 : 0);

  return (
    <motion.div layout
      animate={{ opacity: dimmed ? 0.45 : 1, scale: selected ? 1.005 : 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className={`relative ${pinned ? "ring-2 ring-sky-400/60 rounded-xl" : ""}`}>
      <GlassCard className={`p-5 relative ${a.glow} ${selected ? `ring-1 ${a.ring}` : ""}`}>
        {isWinner && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 grid place-items-center shadow-[0_0_18px_-2px_rgba(251,191,36,0.7)]">
            <Trophy className="h-3.5 w-3.5 text-white" />
          </motion.div>
        )}
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`text-[11px] uppercase tracking-[0.18em] font-semibold ${a.text}`}>Scenario {s.key}</div>
            <div className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-slate-300">#{rank}</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onPin}
              className={`h-6 w-6 grid place-items-center rounded ${pinned ? "bg-sky-500/15 text-sky-300" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}
              title="Pin scenario">
              <Pin className="h-3 w-3" />
            </button>
            {isWinner && (
              <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                <Star className="h-3 w-3" /> Top Score
              </div>
            )}
          </div>
        </div>
        <div className="text-[18px] font-semibold text-white">{s.title}</div>
        <div className="text-[11.5px] text-slate-300 mt-0.5">{s.window}</div>
        <div className="text-[11px] text-slate-400 mt-1.5">{s.desc}</div>

        <div className="mt-4 flex items-end gap-2">
          <motion.div key={score} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`text-[40px] leading-none font-bold tabular-nums ${a.text}`}>{score}</motion.div>
          <div className="text-[11px] text-slate-400 pb-1.5">/100</div>
          <div className="flex-1" />
          {!isWinner && (
            <div className={`text-[11px] font-medium flex items-center gap-1 ${delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {delta >= 0 ? "+" : ""}{delta} vs top
            </div>
          )}
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
          <motion.div initial={false} animate={{ width: `${score}%` }} transition={{ type: "spring", stiffness: 200, damping: 26 }}
            className={`h-full rounded-full bg-gradient-to-r ${a.bar}`} />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { icon: Cpu, label: "Production Impact", v: s.prodImpact },
            { icon: Award, label: "Yield Impact", v: s.yieldImpact },
            { icon: Users, label: "Customer Impact", v: s.custImpact },
          ].map((b, i) => (
            <div key={i} className="rounded-lg bg-white/[0.025] border border-white/[0.05] p-2.5">
              <div className="flex items-center gap-1 text-[9.5px] text-slate-400 uppercase tracking-wider"><b.icon className="h-3 w-3" /> {b.label}</div>
              <div className={`text-[12.5px] font-semibold mt-1 ${b.v.tone}`}>{b.v.level}</div>
              <div className="text-[10.5px] text-slate-400">{b.v.sub}</div>
            </div>
          ))}
          {[
            { icon: DollarSign, label: "Maintenance Cost", val: s.maintCost, sub: "", tone: undefined as any },
            { icon: Clock, label: "Downtime", val: s.downtime, sub: "", tone: undefined as any },
            { icon: Droplet, label: "Utility Impact", val: s.utility.level, sub: s.utility.sub, tone: s.utility.tone },
          ].map((b, i) => (
            <div key={i} className="rounded-lg bg-white/[0.025] border border-white/[0.05] p-2.5">
              <div className="flex items-center gap-1 text-[9.5px] text-slate-400 uppercase tracking-wider"><b.icon className="h-3 w-3" /> {b.label}</div>
              <div className={`text-[12.5px] font-semibold mt-1 ${b.tone ?? "text-white"}`}>{b.val}</div>
              {b.sub && <div className="text-[10.5px] text-slate-400">{b.sub}</div>}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] text-slate-400">Impact Over Time (7 Days)</div>
            <div className="text-[10px] text-slate-500">Confidence <span className="text-slate-300">{s.confidence}%</span></div>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false}
                  ticks={[0, 50, 100]} tickFormatter={(v) => (v === 0 ? "Low" : v === 50 ? "Neutral" : "High")} />
                <RTooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }} />
                <RBar dataKey="Production" stackId="a" fill="#38bdf8" />
                <RBar dataKey="Yield" stackId="a" fill="#10b981" />
                <RBar dataKey="Risk" stackId="a" fill="#a78bfa" />
                <RBar dataKey="Cost" stackId="a" fill="#f59e0b" />
                <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4 }} iconSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <button onClick={onSelect}
          className={`mt-3 w-full h-9 rounded-lg text-[11.5px] font-semibold flex items-center justify-center gap-2 transition ${
            selected ? "bg-sky-500/20 border border-sky-400/40 text-sky-200" : "bg-white/[0.03] border border-white/[0.06] text-slate-200 hover:bg-white/[0.06]"
          }`}>
          <CheckCircle2 className="h-3.5 w-3.5" /> {selected ? "Selected" : "Select Scenario"}
        </button>
      </GlassCard>
    </motion.div>
  );
};

/* =========== priorities panel =========== */
function PrioritiesPanel({ values, setValues, onReset, activePreset, onPreset }: any) {
  const sumW = values.reduce((a: number, w: any) => a + w.v, 0);
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[13px] text-white font-semibold">Adjust Priorities</div>
        <div className="flex items-center gap-2">
          <div className={`text-[10px] px-1.5 py-0.5 rounded border ${sumW === 0 ? "bg-rose-500/15 border-rose-400/30 text-rose-300" : "bg-white/[0.04] border-white/[0.06] text-slate-400"} tabular-nums`}>Σ {sumW}</div>
          <button onClick={onReset} className="text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>
      <div className="text-[10.5px] text-slate-400 mb-2.5">Sliders re-rank scenarios live</div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {Object.keys(PRESETS).map((p) => (
          <button key={p} onClick={() => onPreset(p)}
            className={`text-[10.5px] px-2 py-1 rounded-md border transition ${
              activePreset === p ? "bg-sky-500/15 border-sky-400/30 text-sky-200" : "bg-white/[0.025] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]"
            }`}>{p}</button>
        ))}
      </div>

      <div className="space-y-3">
        {values.map((p: any, idx: number) => (
          <div key={p.key}>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                {p.label}
              </div>
              <div className="text-slate-400 tabular-nums">{p.v}%</div>
            </div>
            <input type="range" min={0} max={100} value={p.v}
              onChange={(e) => {
                const v = +e.target.value;
                setValues(values.map((x: any, i: number) => i === idx ? { ...x, v } : x));
              }}
              className="w-full mt-1 accent-sky-400 h-1" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* =========== metric table (live) =========== */
const METRICS_DEFS = [
  { metric: "Production Throughput", key: "throughput", weight: 20, A: { val: "+9.2K", tone: "text-emerald-300" }, B: { val: "+3.1K", tone: "text-sky-300" }, C: { val: "-12.6K", tone: "text-rose-300" } },
  { metric: "Yield / Quality", key: "yield", weight: 20, A: { val: "+0.08%", tone: "text-emerald-300" }, B: { val: "-0.02%", tone: "text-sky-300" }, C: { val: "-0.15%", tone: "text-rose-300" } },
  { metric: "Customer Commitments", key: "customer", weight: 15, A: { val: "Low Risk", tone: "text-emerald-300" }, B: { val: "Medium Risk", tone: "text-amber-300" }, C: { val: "High Risk", tone: "text-rose-300" } },
  { metric: "Maintenance Cost", key: "cost", weight: 10, A: { val: "$8.7K", tone: "text-white" }, B: { val: "$8.7K", tone: "text-white" }, C: { val: "$9.1K", tone: "text-white" } },
  { metric: "Downtime", key: "downtime", weight: 10, A: { val: "4.0 hrs", tone: "text-white" }, B: { val: "4.0 hrs", tone: "text-white" }, C: { val: "4.0 hrs", tone: "text-white" } },
  { metric: "Utility / Facilities Impact", key: "utility", weight: 10, A: { val: "$1.2K", tone: "text-emerald-300" }, B: { val: "$4.6K", tone: "text-amber-300" }, C: { val: "$9.3K", tone: "text-rose-300" } },
  { metric: "Risk / Reliability", key: "risk", weight: 15, A: { val: "Low", tone: "text-emerald-300" }, B: { val: "Medium", tone: "text-amber-300" }, C: { val: "High", tone: "text-rose-300" } },
];

function MetricTable({ scores, weights }: any) {
  const sumW = weights.reduce((a: number, w: any) => a + w.v, 0) || 1;
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] text-white font-semibold">Detailed Metric Comparison</div>
        <div className="text-[10.5px] text-slate-400">Weights normalized live</div>
      </div>
      <table className="w-full text-[11.5px]">
        <thead>
          <tr className="text-slate-400 border-b border-white/[0.06]">
            <th className="text-left py-2 font-medium">Metric</th>
            <th className="text-left font-medium">Weight</th>
            <th className="text-left font-medium text-emerald-300">Scenario A</th>
            <th className="text-left font-medium text-sky-300">Scenario B</th>
            <th className="text-left font-medium text-fuchsia-300">Scenario C</th>
          </tr>
        </thead>
        <tbody>
          {METRICS_DEFS.map((m) => {
            const w = weights.find((x: any) => x.key === m.key)?.v ?? m.weight;
            const pct = Math.round((w / sumW) * 100);
            return (
              <tr key={m.metric} className="border-b border-white/[0.04]">
                <td className="py-2 text-slate-200">{m.metric}</td>
                <td className="text-slate-400 tabular-nums">{pct}%</td>
                <td className={m.A.tone}>{m.A.val}</td>
                <td className={m.B.tone}>{m.B.val}</td>
                <td className={m.C.tone}>{m.C.val}</td>
              </tr>
            );
          })}
          <tr className="border-t border-white/[0.1]">
            <td className="py-3 text-slate-200">
              <div className="font-semibold">Composite Score</div>
              <div className="text-[10px] text-slate-400">(Weighted live)</div>
            </td>
            <td className="text-slate-400">100%</td>
            <td><span className="text-emerald-300 font-semibold tabular-nums">{scores.A}</span><span className="text-slate-500 text-[10px]"> /100</span></td>
            <td><span className="text-sky-300 font-semibold tabular-nums">{scores.B}</span><span className="text-slate-500 text-[10px]"> /100</span></td>
            <td><span className="text-fuchsia-300 font-semibold tabular-nums">{scores.C}</span><span className="text-slate-500 text-[10px]"> /100</span></td>
          </tr>
        </tbody>
      </table>
    </GlassCard>
  );
}

/* =========== sensitivity =========== */
function Sensitivity({ pair, setPair }: { pair: [string, string]; setPair: (p: [string, string]) => void }) {
  const [open, setOpen] = useState(false);
  const data = useMemo(() => {
    const a = SCENARIOS.find((s) => s.key === pair[0])!;
    const b = SCENARIOS.find((s) => s.key === pair[1])!;
    const avg = (s: Scenario, focus: number) => {
      // focus 0 = cost weighting, 10 = throughput weighting; interpolate raw blend
      const tw = focus / 10;
      return Math.round(s.raw.throughput * tw + s.raw.cost * (1 - tw));
    };
    return Array.from({ length: 11 }, (_, i) => ({ x: i, [pair[0]]: avg(a, i), [pair[1]]: avg(b, i) }));
  }, [pair]);
  const colorOf = (k: string) => SCENARIOS.find((s) => s.key === k)!.color === "emerald" ? "#10b981" : SCENARIOS.find((s) => s.key === k)!.color === "sky" ? "#38bdf8" : "#e879f9";
  const pairs = [["A","B"],["A","C"],["B","C"]] as const;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-[13px] text-white font-semibold">Sensitivity Analysis</div>
          <div className="text-[10.5px] text-slate-400">How the chosen pair ranks as the cost↔throughput emphasis shifts</div>
        </div>
        <div className="flex items-center gap-2 relative">
          <div className="text-[10.5px] text-slate-400">Compare</div>
          <button onClick={() => setOpen((v) => !v)}
            className="text-[11px] px-2.5 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-200 flex items-center gap-1.5 hover:bg-white/[0.06]">
            Scenario {pair[0]} vs Scenario {pair[1]} <ChevronDown className="h-3 w-3" />
          </button>
          {open && (
            <div className="absolute top-9 right-0 z-20 w-44 rounded-lg border border-white/[0.08] bg-[#0c1024]/95 backdrop-blur-xl p-1 shadow-2xl">
              {pairs.map((p) => (
                <button key={p.join()} onClick={() => { setPair([p[0], p[1]]); setOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded text-[11.5px] text-slate-200 hover:bg-white/[0.06]">
                  Scenario {p[0]} vs Scenario {p[1]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-[180px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="x" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false}
              ticks={[0, 5, 10]} tickFormatter={(v) => v === 0 ? "Focus on Cost" : v === 5 ? "Balanced" : "Focus on Throughput"} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
            <RTooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }} />
            <RLine type="monotone" dataKey={pair[0]} stroke={colorOf(pair[0])} strokeWidth={2.2} dot={{ r: 3, fill: colorOf(pair[0]) }} />
            <RLine type="monotone" dataKey={pair[1]} stroke={colorOf(pair[1])} strokeWidth={2.2} dot={{ r: 3, fill: colorOf(pair[1]) }} />
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} formatter={(v) => `Scenario ${v}`} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[13px] text-white font-semibold mt-3 mb-2">Key Insights</div>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { icon: ShieldAlert, color: "text-amber-300", title: "Risk Exposure", body: "Waiting 7 days increases risk of pump failure by 4.2x" },
          { icon: Users, color: "text-sky-300", title: "Commitment Impact", body: "Scenario C threatens 2 customer commitments" },
          { icon: DollarSign, color: "text-emerald-300", title: "Cost Difference", body: "Scenario A saves $1.6K compared to waiting 7 days" },
        ].map((k, i) => (
          <div key={i} className="rounded-lg bg-white/[0.025] border border-white/[0.05] p-3">
            <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${k.color}`}><k.icon className="h-3.5 w-3.5" /> {k.title}</div>
            <div className="text-[11px] text-slate-300 mt-1 leading-snug">{k.body}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* =========== recommendation =========== */
function RecommendationSummary({ winner, score, onSelect, onExport }: any) {
  return (
    <GlassCard className="p-4">
      <div className="text-[13px] text-white font-semibold mb-3">Recommendation Summary</div>
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/25 p-3">
        <div className="text-[13px] font-semibold text-emerald-300">Scenario {winner.key}: {winner.title}</div>
        <div className="text-[11px] text-slate-300 mt-0.5">Top composite under current priority weights.</div>
      </div>
      <ul className="mt-3 space-y-2 text-[11.5px] text-slate-300">
        {[
          `Highest composite score (${score}/100)`,
          "Best balance of production, yield, risk and cost",
          "Meets all commitments with minimal risk",
          `Confidence ${winner.confidence}% across all simulations`,
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> {t}
          </li>
        ))}
      </ul>
      <button onClick={onSelect}
        className="mt-4 w-full h-10 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-200 text-[12.5px] font-semibold flex items-center justify-center gap-2 hover:bg-sky-500/20">
        <CheckCircle2 className="h-4 w-4" /> Select This Scenario
      </button>
      <button onClick={onExport}
        className="mt-2 w-full h-9 rounded-lg text-slate-300 text-[11.5px] flex items-center justify-center gap-2 hover:bg-white/[0.03]">
        <Download className="h-3.5 w-3.5" /> Export Comparison Report
      </button>
    </GlassCard>
  );
}

/* =========== command palette =========== */
function CommandPalette({ open, onClose, actions }: any) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); else setQ(""); }, [open]);
  const filtered = useMemo(() => actions.filter((a: any) => a.label.toLowerCase().includes(q.toLowerCase())), [q, actions]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-start pt-[14vh]">
          <motion.div initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[560px] max-w-[92vw] rounded-xl border border-white/[0.08] bg-[#0c1024]/95 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 h-11 border-b border-white/[0.06]">
              <Search className="h-4 w-4 text-slate-400" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to scenario or run an action…"
                className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder:text-slate-500" />
              <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Esc</span>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-1">
              {filtered.length === 0 && <div className="px-3 py-6 text-center text-[12px] text-slate-500">No matches</div>}
              {filtered.map((a: any) => (
                <button key={a.label} onClick={() => { a.run(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/[0.05] text-left">
                  <a.icon className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-[12.5px] text-slate-200 flex-1">{a.label}</span>
                  {a.hint && <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">{a.hint}</span>}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========== page =========== */
export default function SimulationComparison() {
  const nav = useNavigate();
  const [priorities, setPriorities] = useState(INITIAL_PRIORITIES);
  const [activePreset, setActivePreset] = useState<string>("Balanced");
  const [selected, setSelected] = useState<"A" | "B" | "C">("A");
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"composite" | "confidence" | "key">("composite");
  const [pair, setPair] = useState<[string, string]>(["A", "B"]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hkOpen, setHkOpen] = useState(false);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const reset = () => { setPriorities(INITIAL_PRIORITIES); setActivePreset("Balanced"); flash("Priorities reset"); };
  const applyPreset = (name: string) => {
    const p = PRESETS[name];
    setPriorities(priorities.map((x) => ({ ...x, v: p[x.key] ?? x.v })));
    setActivePreset(name);
    flash(`Preset applied · ${name}`);
  };

  const scores = useMemo(() => ({
    A: computeScore(SCENARIOS[0], priorities),
    B: computeScore(SCENARIOS[1], priorities),
    C: computeScore(SCENARIOS[2], priorities),
  }), [priorities]);

  // detect manual edits → clear preset highlight
  useEffect(() => {
    const p = PRESETS[activePreset];
    if (!p) return;
    const match = priorities.every((x) => p[x.key] === x.v);
    if (!match) setActivePreset("");
  }, [priorities, activePreset]);

  const ranked = useMemo(() => {
    const list = SCENARIOS.map((s) => ({ s, score: scores[s.key] }));
    if (sortBy === "composite") list.sort((a, b) => b.score - a.score);
    if (sortBy === "confidence") list.sort((a, b) => b.s.confidence - a.s.confidence);
    if (sortBy === "key") list.sort((a, b) => a.s.key.localeCompare(b.s.key));
    return list;
  }, [scores, sortBy]);

  const winnerKey = useMemo(() => {
    return SCENARIOS.reduce((best, s) => scores[s.key] > scores[best.key] ? s : best, SCENARIOS[0]).key;
  }, [scores]);
  const winnerObj = SCENARIOS.find((s) => s.key === winnerKey)!;

  const rerun = () => {
    setRerunning(true);
    setTimeout(() => { setRerunning(false); flash("Simulation refreshed"); }, 1200);
  };

  const exportCSV = useCallback(() => {
    const header = ["Scenario", "Title", "Composite", "Confidence", "Maint Cost", "Downtime", "Window"];
    const rows = SCENARIOS.map((s) => [s.key, s.title, scores[s.key], s.confidence + "%", s.maintCost, s.downtime, s.window]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "simulation-comparison.csv"; a.click();
    URL.revokeObjectURL(url);
    flash("Exported CSV");
  }, [scores]);

  const togglePin = (k: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      flash(next.has(k) ? `Pinned scenario ${k}` : `Unpinned scenario ${k}`);
      return next;
    });
  };

  const select = (k: "A" | "B" | "C") => { setSelected(k); flash(`Scenario ${k} selected`); };

  // hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); return; }
      if (e.key === "Escape") { setPaletteOpen(false); setHkOpen(false); return; }
      if (e.key === "?") { setHkOpen((v) => !v); return; }
      if (["1","2","3"].includes(e.key)) { select((["A","B","C"] as const)[+e.key - 1]); return; }
      if (e.key.toLowerCase() === "r") { rerun(); return; }
      if (e.key.toLowerCase() === "e") { exportCSV(); return; }
      if (e.key.toLowerCase() === "p") { togglePin(["A","B","C"][Math.floor(Math.random()*3)]); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportCSV]);

  const paletteActions = [
    { label: "Open Scenario A · Maintain Tonight", icon: CheckCircle2, hint: "1", run: () => select("A") },
    { label: "Open Scenario B · Maintain Tomorrow", icon: CheckCircle2, hint: "2", run: () => select("B") },
    { label: "Open Scenario C · Wait 7 Days", icon: CheckCircle2, hint: "3", run: () => select("C") },
    ...Object.keys(PRESETS).map((p) => ({ label: `Apply preset · ${p}`, icon: Sparkles, run: () => applyPreset(p) })),
    { label: "Re-run simulation", icon: Play, hint: "R", run: rerun },
    { label: "Export comparison CSV", icon: Download, hint: "E", run: exportCSV },
    { label: "Reset priorities", icon: RotateCcw, run: reset },
    { label: "Back to Decision Simulator", icon: ArrowLeft, run: () => nav("/sead/maintenance-decision-simulator") },
    { label: "Go to Factory Impact Simulator", icon: Factory, run: () => nav("/sead/factory-impact-simulator") },
  ];

  return (
    <div className="min-h-screen bg-[#080b16] text-slate-200 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(800px 500px at 12% -10%, rgba(56,189,248,0.10), transparent 60%), radial-gradient(900px 600px at 100% 110%, rgba(232,121,249,0.07), transparent 60%)" }} />
      <div className="relative">
        <AppHeader onOpenPalette={() => setPaletteOpen(true)} />
        <div className="flex">
          <ModuleRail />
          <main className="flex-1 p-5 space-y-5">
            {/* hero strip */}
            <GlassCard className="p-4">
              <div className="flex items-center gap-5 flex-wrap">
                <button onClick={() => nav("/sead/maintenance-decision-simulator")} className="text-[11.5px] text-sky-300 hover:text-sky-200 flex items-center gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Recommendation
                </button>
                <div className="flex items-center gap-3">
                  <img src={etchImg} alt="ETCH-217" className="h-14 w-20 rounded-md object-cover ring-1 ring-white/10" />
                  <div className="leading-tight">
                    <div className="flex items-center gap-2">
                      <div className="text-[15px] font-semibold text-white">ETCH-217</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/25">Fair</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Metal Etch Chamber | Bay 2</div>
                    <div className="text-[11px] text-slate-400">Focus: Vacuum Pump Degradation</div>
                  </div>
                </div>
                <div className="h-10 w-px bg-white/[0.08]" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Current Recommendation</div>
                  <div className="text-[13px] text-white font-semibold">{winnerObj.title}</div>
                  <div className="text-[11px] text-slate-400">{winnerObj.window}</div>
                  <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">Top Composite</span>
                </div>
                <div className="h-10 w-px bg-white/[0.08]" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Overall Confidence</div>
                  <div className="flex items-end gap-2">
                    <div className="text-[26px] font-bold text-white tabular-nums">{winnerObj.confidence}%</div>
                    <div className="relative h-9 w-16">
                      <svg viewBox="0 0 64 32" className="absolute inset-0">
                        <path d="M4,30 A28,28 0 0 1 60,30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                        <path d="M4,30 A28,28 0 0 1 60,30" fill="none" stroke="#10b981" strokeWidth="5"
                          strokeDasharray="88" strokeDashoffset={88 - (winnerObj.confidence * 88) / 100} />
                      </svg>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-300">High</div>
                </div>
                <div className="h-10 w-px bg-white/[0.08]" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Optimization Objective</div>
                  <div className="flex items-center gap-1.5 text-[13px] text-white font-semibold"><Scale className="h-3.5 w-3.5 text-sky-300" /> {activePreset || "Custom"}</div>
                  <div className="text-[11px] text-slate-400">Weighted across all objectives</div>
                </div>
                <div className="flex-1" />
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 leading-tight">
                  <div className="text-[11px] text-slate-300">Comparing 3 Scenarios</div>
                  <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5"><Plus className="h-3 w-3" /> All scenarios meet mandatory constraints</div>
                  <button className="mt-1 text-[10.5px] px-2 py-0.5 rounded border border-sky-400/30 text-sky-300 hover:bg-sky-500/10">Edit Constraints</button>
                </div>
              </div>
            </GlassCard>

            {/* sticky action bar */}
            <div className="sticky top-2 z-30">
              <GlassCard className="px-3 py-2 flex items-center gap-2 flex-wrap">
                <button onClick={rerun} disabled={rerunning}
                  className="h-8 px-3 rounded-md bg-sky-500/15 border border-sky-400/30 text-sky-200 text-[11.5px] font-medium flex items-center gap-1.5 hover:bg-sky-500/25 disabled:opacity-60">
                  <motion.span animate={{ rotate: rerunning ? 360 : 0 }} transition={{ repeat: rerunning ? Infinity : 0, duration: 0.9, ease: "linear" }}>
                    <Play className="h-3.5 w-3.5" />
                  </motion.span>
                  {rerunning ? "Re-running…" : "Re-run Simulation"}
                </button>
                <button onClick={exportCSV}
                  className="h-8 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-200 text-[11.5px] flex items-center gap-1.5 hover:bg-white/[0.08]">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button onClick={reset}
                  className="h-8 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-200 text-[11.5px] flex items-center gap-1.5 hover:bg-white/[0.08]">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
                <div className="h-6 w-px bg-white/[0.08]" />
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort
                </div>
                {(["composite","confidence","key"] as const).map((k) => (
                  <button key={k} onClick={() => setSortBy(k)}
                    className={`h-7 px-2 rounded-md text-[11px] border transition ${sortBy === k ? "bg-sky-500/15 border-sky-400/30 text-sky-200" : "bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]"}`}>
                    {k === "composite" ? "Composite" : k === "confidence" ? "Confidence" : "Letter"}
                  </button>
                ))}
                <div className="flex-1" />
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Trophy className="h-3.5 w-3.5 text-amber-300" /> Top:
                  <span className={accent(winnerObj.color).text + " font-semibold"}>Scenario {winnerObj.key}</span>
                  <span className="text-slate-400 tabular-nums">({scores[winnerObj.key]})</span>
                </div>
                {pinned.size > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-sky-300">
                    <Pin className="h-3.5 w-3.5" /> Pinned: {[...pinned].join(", ")}
                    <button onClick={() => { setPinned(new Set()); flash("Pins cleared"); }} className="text-slate-400 hover:text-white"><Minus className="h-3 w-3" /></button>
                  </div>
                )}
                <button onClick={() => setHkOpen((v) => !v)} title="Keyboard shortcuts"
                  className="h-8 w-8 rounded-md bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
                  <Keyboard className="h-3.5 w-3.5" />
                </button>
              </GlassCard>
            </div>

            <div className="grid grid-cols-12 gap-5">
              {/* scenario cards */}
              <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
                {ranked.map(({ s }, i) => (
                  <ScenarioCard key={s.key} s={s} score={scores[s.key]} rank={
                    [...SCENARIOS].map((x) => ({ k: x.key, sc: scores[x.key] })).sort((a, b) => b.sc - a.sc).findIndex((x) => x.k === s.key) + 1
                  } winnerKey={winnerKey} selected={selected === s.key} pinned={pinned.has(s.key)}
                    dimmed={pinned.size > 0 && !pinned.has(s.key)}
                    onSelect={() => select(s.key as any)} onPin={() => togglePin(s.key)} />
                ))}
              </div>

              {/* right column */}
              <div className="col-span-12 lg:col-span-3 space-y-4">
                <PrioritiesPanel values={priorities} setValues={setPriorities} onReset={reset}
                  activePreset={activePreset} onPreset={applyPreset} />
                <GlassCard className="p-4">
                  <div className="text-[12px] text-slate-300 font-medium">Live Ranking</div>
                  <div className="text-[10.5px] text-slate-400">Updates as you move sliders</div>
                  <div className="grid grid-cols-3 gap-2 mt-2.5">
                    {SCENARIOS.map((s) => {
                      const sc = scores[s.key]; const isW = s.key === winnerKey;
                      const a = accent(s.color);
                      return (
                        <div key={s.key}
                          className={`rounded-md py-1.5 text-center border ${isW ? `${a.border} bg-emerald-500/10` : "border-white/[0.08] bg-white/[0.02]"}`}>
                          <span className={`${a.text} font-semibold text-[11.5px]`}>{s.key}</span>
                          <span className="text-slate-200 text-[11px] tabular-nums ml-1">{sc}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-3">Quick presets</div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-[10.5px]">
                    {["Max Throughput", "Max Yield", "Min Cost", "Min Risk"].map((t) => (
                      <button key={t} onClick={() => applyPreset(t)}
                        className={`h-7 rounded-md border ${activePreset === t ? "bg-sky-500/15 border-sky-400/30 text-sky-200" : "border-white/[0.08] bg-white/[0.02] text-slate-200 hover:bg-white/[0.05]"}`}>{t}</button>
                    ))}
                  </div>
                </GlassCard>
                <RecommendationSummary winner={winnerObj} score={scores[winnerKey]}
                  onSelect={() => select(winnerKey)} onExport={exportCSV} />
              </div>
            </div>

            {/* bottom row */}
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-5"><MetricTable scores={scores} weights={priorities} /></div>
              <div className="col-span-12 lg:col-span-7"><Sensitivity pair={pair} setPair={setPair} /></div>
            </div>
          </main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} />

      {/* hotkey cheatsheet */}
      <AnimatePresence>
        {hkOpen && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-4 right-4 z-40 w-[260px] rounded-xl border border-white/[0.08] bg-[#0c1024]/95 backdrop-blur-xl p-3 shadow-2xl">
            <div className="text-[12px] font-semibold text-white mb-2 flex items-center gap-1.5"><Keyboard className="h-3.5 w-3.5" /> Shortcuts</div>
            <ul className="space-y-1 text-[11px] text-slate-300">
              {[
                ["⌘/Ctrl K", "Command palette"],
                ["1 / 2 / 3", "Select Scenario A/B/C"],
                ["R", "Re-run simulation"],
                ["E", "Export CSV"],
                ["P", "Toggle a pin"],
                ["?", "Toggle this panel"],
                ["Esc", "Close overlays"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between">
                  <span className="text-slate-400">{v}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-300">{k}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#0c1024]/95 border border-white/[0.08] text-[12px] text-slate-100 shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
