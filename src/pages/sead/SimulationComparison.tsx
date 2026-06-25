import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, ArrowLeft, Gauge, Lightbulb, GitBranch, Share2,
  Scale, Star, Award, Cpu, Users, DollarSign, Clock, Droplet, ShieldAlert,
  TrendingUp, TrendingDown, CheckCircle2, Download, RotateCcw, Plus,
} from "lucide-react";
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

function AppHeader() {
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

/* =========== scenarios =========== */
type Scenario = {
  key: "A" | "B" | "C";
  title: string;
  window: string;
  desc: string;
  score: number;
  scoreLabel?: string;
  color: string; // tailwind hue token base
  recommended?: boolean;
  prodImpact: { level: string; tone: string; sub: string };
  yieldImpact: { level: string; tone: string; sub: string };
  custImpact: { level: string; tone: string; sub: string };
  maintCost: string;
  downtime: string;
  utility: { level: string; tone: string; sub: string };
};

const SCENARIOS: Scenario[] = [
  {
    key: "A", title: "Maintain Tonight", window: "May 28, 10:00 PM – May 29, 2:00 AM",
    desc: "Perform maintenance during current planned window",
    score: 91, scoreLabel: "Best", color: "emerald", recommended: true,
    prodImpact: { level: "High", tone: "text-emerald-300", sub: "+9.2K wafers" },
    yieldImpact: { level: "High", tone: "text-emerald-300", sub: "+0.08%" },
    custImpact: { level: "Low", tone: "text-emerald-300", sub: "Low Risk" },
    maintCost: "$8.7K", downtime: "4.0 hrs",
    utility: { level: "Low", tone: "text-emerald-300", sub: "$1.2K" },
  },
  {
    key: "B", title: "Maintain Tomorrow", window: "May 29, 10:00 PM – May 30, 2:00 AM",
    desc: "Defer maintenance by 24 hours",
    score: 78, color: "sky",
    prodImpact: { level: "Medium", tone: "text-sky-300", sub: "+3.1K wafers" },
    yieldImpact: { level: "Medium", tone: "text-sky-300", sub: "-0.02%" },
    custImpact: { level: "Medium", tone: "text-amber-300", sub: "Medium Risk" },
    maintCost: "$8.7K", downtime: "4.0 hrs",
    utility: { level: "Medium", tone: "text-amber-300", sub: "$4.6K" },
  },
  {
    key: "C", title: "Wait 7 Days", window: "Jun 4, 10:00 PM – Jun 5, 2:00 AM",
    desc: "Extend operation and perform in 7 days",
    score: 43, color: "fuchsia",
    prodImpact: { level: "Low", tone: "text-rose-300", sub: "-12.6K wafers" },
    yieldImpact: { level: "Low", tone: "text-rose-300", sub: "-0.15%" },
    custImpact: { level: "High", tone: "text-rose-300", sub: "High Risk" },
    maintCost: "$9.1K", downtime: "4.0 hrs",
    utility: { level: "High", tone: "text-rose-300", sub: "$9.3K" },
  },
];

const accent = (c: string) => ({
  emerald: { text: "text-emerald-300", bar: "from-emerald-400 to-emerald-500", glow: "shadow-[0_0_30px_-12px_rgba(16,185,129,0.7)]", ring: "ring-emerald-400/30", border: "border-emerald-400/30" },
  sky: { text: "text-sky-300", bar: "from-sky-400 to-sky-500", glow: "shadow-[0_0_30px_-12px_rgba(56,189,248,0.7)]", ring: "ring-sky-400/30", border: "border-sky-400/30" },
  fuchsia: { text: "text-fuchsia-300", bar: "from-fuchsia-400 to-fuchsia-500", glow: "shadow-[0_0_30px_-12px_rgba(232,121,249,0.6)]", ring: "ring-fuchsia-400/30", border: "border-fuchsia-400/30" },
} as any)[c];

function ScenarioCard({ s }: { s: Scenario }) {
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

  return (
    <GlassCard className={`p-5 relative ${a.glow}`}>
      <div className="flex items-start justify-between mb-1.5">
        <div className={`text-[11px] uppercase tracking-[0.18em] font-semibold ${a.text}`}>Scenario {s.key}</div>
        {s.recommended && (
          <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            <Star className="h-3 w-3" /> Recommended
          </div>
        )}
      </div>
      <div className="text-[18px] font-semibold text-white">{s.title}</div>
      <div className="text-[11.5px] text-slate-300 mt-0.5">{s.window}</div>
      <div className="text-[11px] text-slate-400 mt-1.5">{s.desc}</div>

      <div className="mt-4 flex items-end gap-2">
        <div className={`text-[40px] leading-none font-bold ${a.text}`}>{s.score}</div>
        <div className="text-[11px] text-slate-400 pb-1.5">/100</div>
        <div className="flex-1" />
        {s.scoreLabel && <div className={`text-[11px] font-medium ${a.text}`}>{s.scoreLabel}</div>}
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${a.bar}`} style={{ width: `${s.score}%` }} />
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
          { icon: DollarSign, label: "Maintenance Cost", val: s.maintCost, sub: "" },
          { icon: Clock, label: "Downtime", val: s.downtime, sub: "" },
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
        <div className="text-[11px] text-slate-400 mb-1">Impact Over Time (7 Days)</div>
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
    </GlassCard>
  );
}

/* =========== priorities =========== */
const INITIAL_PRIORITIES = [
  { key: "throughput", label: "Production Throughput", color: "#38bdf8", v: 80 },
  { key: "yield", label: "Yield / Quality", color: "#a78bfa", v: 70 },
  { key: "customer", label: "Customer Commitments", color: "#e879f9", v: 60 },
  { key: "cost", label: "Maintenance Cost", color: "#f472b6", v: 40 },
  { key: "downtime", label: "Downtime", color: "#fb7185", v: 50 },
  { key: "utility", label: "Utility / Facilities", color: "#fb923c", v: 40 },
  { key: "risk", label: "Risk / Reliability", color: "#38bdf8", v: 70 },
];

function PrioritiesPanel({ values, setValues, onReset }: any) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[13px] text-white font-semibold">Adjust Priorities</div>
        <button onClick={onReset} className="text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-1">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
      <div className="text-[10.5px] text-slate-400 mb-3">Move sliders to see how priorities change the recommendation</div>
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

/* =========== detailed metric comparison =========== */
const METRICS = [
  { metric: "Production Throughput", weight: "20%", A: { val: "+9.2K", tone: "text-emerald-300" }, B: { val: "+3.1K", tone: "text-sky-300" }, C: { val: "-12.6K", tone: "text-rose-300" } },
  { metric: "Yield / Quality", weight: "20%", A: { val: "+0.08%", tone: "text-emerald-300" }, B: { val: "-0.02%", tone: "text-sky-300" }, C: { val: "-0.15%", tone: "text-rose-300" } },
  { metric: "Customer Commitments", weight: "15%", A: { val: "Low Risk", tone: "text-emerald-300" }, B: { val: "Medium Risk", tone: "text-amber-300" }, C: { val: "High Risk", tone: "text-rose-300" } },
  { metric: "Maintenance Cost", weight: "10%", A: { val: "$8.7K", tone: "text-white" }, B: { val: "$8.7K", tone: "text-white" }, C: { val: "$9.1K", tone: "text-white" } },
  { metric: "Downtime", weight: "10%", A: { val: "4.0 hrs", tone: "text-white" }, B: { val: "4.0 hrs", tone: "text-white" }, C: { val: "4.0 hrs", tone: "text-white" } },
  { metric: "Utility / Facilities Impact", weight: "10%", A: { val: "$1.2K", tone: "text-emerald-300" }, B: { val: "$4.6K", tone: "text-amber-300" }, C: { val: "$9.3K", tone: "text-rose-300" } },
  { metric: "Risk / Reliability", weight: "15%", A: { val: "Low", tone: "text-emerald-300" }, B: { val: "Medium", tone: "text-amber-300" }, C: { val: "High", tone: "text-rose-300" } },
];

function MetricTable() {
  return (
    <GlassCard className="p-5">
      <div className="text-[13px] text-white font-semibold mb-3">Detailed Metric Comparison</div>
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
          {METRICS.map((m) => (
            <tr key={m.metric} className="border-b border-white/[0.04]">
              <td className="py-2 text-slate-200">{m.metric}</td>
              <td className="text-slate-400">{m.weight}</td>
              <td className={m.A.tone}>{m.A.val}</td>
              <td className={m.B.tone}>{m.B.val}</td>
              <td className={m.C.tone}>{m.C.val}</td>
            </tr>
          ))}
          <tr className="border-t border-white/[0.1]">
            <td className="py-3 text-slate-200">
              <div className="font-semibold">Composite Score</div>
              <div className="text-[10px] text-slate-400">(Weighted)</div>
            </td>
            <td className="text-slate-400">100%</td>
            <td><span className="text-emerald-300 font-semibold">91</span><span className="text-slate-500 text-[10px]"> /100</span></td>
            <td><span className="text-sky-300 font-semibold">78</span><span className="text-slate-500 text-[10px]"> /100</span></td>
            <td><span className="text-fuchsia-300 font-semibold">43</span><span className="text-slate-500 text-[10px]"> /100</span></td>
          </tr>
        </tbody>
      </table>
    </GlassCard>
  );
}

/* =========== sensitivity =========== */
function Sensitivity() {
  const data = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => ({
      x: i,
      A: 88 - Math.sin(i / 2) * 4 + (i > 7 ? 2 : 0),
      B: 75 - i * 4 + Math.sin(i) * 2,
    }));
  }, []);
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-[13px] text-white font-semibold">Sensitivity Analysis</div>
          <div className="text-[10.5px] text-slate-400">How the top 2 scenarios rank as you change priorities</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10.5px] text-slate-400">Compare</div>
          <button className="text-[11px] px-2.5 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-200 flex items-center gap-1.5">
            Scenario A vs Scenario B <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="h-[180px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="x" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false}
              ticks={[0, 5, 10]} tickFormatter={(v) => v === 0 ? "Focus on Cost" : v === 5 ? "Priority Shift" : "Focus on Throughput"} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
            <RTooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }} />
            <RLine type="monotone" dataKey="A" stroke="#10b981" strokeWidth={2.2} dot={{ r: 3, fill: "#10b981" }} />
            <RLine type="monotone" dataKey="B" stroke="#38bdf8" strokeWidth={2.2} dot={{ r: 3, fill: "#38bdf8" }} />
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} formatter={(v) => v === "A" ? "Scenario A" : "Scenario B"} />
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
function RecommendationSummary() {
  return (
    <GlassCard className="p-4">
      <div className="text-[13px] text-white font-semibold mb-3">Recommendation Summary</div>
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/25 p-3">
        <div className="text-[13px] font-semibold text-emerald-300">Scenario A: Maintain Tonight</div>
        <div className="text-[11px] text-slate-300 mt-0.5">Remains the optimal choice with your current priorities.</div>
      </div>
      <ul className="mt-3 space-y-2 text-[11.5px] text-slate-300">
        {[
          "Highest composite score (91/100)",
          "Best balance of production, yield, risk and cost",
          "Meets all commitments with minimal risk",
          "High confidence across all simulations (89%)",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> {t}
          </li>
        ))}
      </ul>
      <button className="mt-4 w-full h-10 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-200 text-[12.5px] font-semibold flex items-center justify-center gap-2 hover:bg-sky-500/20">
        <CheckCircle2 className="h-4 w-4" /> Select This Scenario
      </button>
      <button className="mt-2 w-full h-9 rounded-lg text-slate-300 text-[11.5px] flex items-center justify-center gap-2 hover:bg-white/[0.03]">
        <Download className="h-3.5 w-3.5" /> Export Comparison Report
      </button>
    </GlassCard>
  );
}

/* =========== page =========== */
export default function SimulationComparison() {
  const nav = useNavigate();
  const [priorities, setPriorities] = useState(INITIAL_PRIORITIES);
  const reset = () => setPriorities(INITIAL_PRIORITIES);

  return (
    <div className="min-h-screen bg-[#080b16] text-slate-200 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(800px 500px at 12% -10%, rgba(56,189,248,0.10), transparent 60%), radial-gradient(900px 600px at 100% 110%, rgba(232,121,249,0.07), transparent 60%)" }} />
      <div className="relative">
        <AppHeader />
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
                  <div className="text-[13px] text-white font-semibold">Maintain Tonight</div>
                  <div className="text-[11px] text-slate-400">May 28, 10:00 PM – May 29, 2:00 AM</div>
                  <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">Recommended</span>
                </div>
                <div className="h-10 w-px bg-white/[0.08]" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Overall Confidence</div>
                  <div className="flex items-end gap-2">
                    <div className="text-[26px] font-bold text-white">89%</div>
                    <div className="relative h-9 w-16">
                      <svg viewBox="0 0 64 32" className="absolute inset-0">
                        <path d="M4,30 A28,28 0 0 1 60,30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                        <path d="M4,30 A28,28 0 0 1 60,30" fill="none" stroke="#10b981" strokeWidth="5"
                          strokeDasharray="88" strokeDashoffset={88 - 78} />
                      </svg>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-300">High</div>
                </div>
                <div className="h-10 w-px bg-white/[0.08]" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Optimization Objective</div>
                  <div className="flex items-center gap-1.5 text-[13px] text-white font-semibold"><Scale className="h-3.5 w-3.5 text-sky-300" /> Balanced</div>
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

            <div className="grid grid-cols-12 gap-5">
              {/* scenario cards */}
              <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
                {SCENARIOS.map((s) => <ScenarioCard key={s.key} s={s} />)}
              </div>

              {/* right column */}
              <div className="col-span-12 lg:col-span-3 space-y-4">
                <PrioritiesPanel values={priorities} setValues={setPriorities} onReset={reset} />
                <GlassCard className="p-4">
                  <div className="text-[12px] text-slate-300 font-medium">See How Recommendation Changes</div>
                  <div className="text-[11px] text-slate-400 mt-2">Current (Balanced)</div>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    <div className="rounded-md border border-emerald-400/30 bg-emerald-500/10 py-1.5 text-center"><span className="text-emerald-300 font-semibold text-[11.5px]">A</span> <span className="text-emerald-200 text-[11px]">91</span></div>
                    <div className="rounded-md border border-white/[0.08] bg-white/[0.02] py-1.5 text-center"><span className="text-sky-300 font-semibold text-[11.5px]">B</span> <span className="text-slate-300 text-[11px]">78</span></div>
                    <div className="rounded-md border border-white/[0.08] bg-white/[0.02] py-1.5 text-center"><span className="text-fuchsia-300 font-semibold text-[11.5px]">C</span> <span className="text-slate-300 text-[11px]">43</span></div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-3">What if we prioritize...</div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-[10.5px]">
                    {["Max Throughput", "Max Yield", "Min Cost", "Min Risk"].map((t) => (
                      <button key={t} className="h-7 rounded-md border border-white/[0.08] bg-white/[0.02] text-slate-200 hover:bg-white/[0.05]">{t}</button>
                    ))}
                  </div>
                </GlassCard>
                <RecommendationSummary />
              </div>
            </div>

            {/* bottom row */}
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-5"><MetricTable /></div>
              <div className="col-span-12 lg:col-span-7"><Sensitivity /></div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
