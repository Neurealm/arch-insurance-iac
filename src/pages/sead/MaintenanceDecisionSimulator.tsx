import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, Boxes, Building2, ChevronDown, Factory, FileBarChart2, Gauge, Lightbulb, GitBranch, Share2, HelpCircle, LayoutGrid, Network as NetIcon, Search, Settings as SettingsIcon, Wrench, Workflow, Bot, AlertTriangle, Cpu, TrendingUp, TrendingDown, Shield, Clock, User, Star, CheckCircle2, X, Sparkles, Activity, DollarSign, Zap, Info, Command, Download, Pin, RefreshCw, Gavel, Brain, Scale, Trophy, Minus, Target as TargetIcon, BookOpen, Users, UserCheck, FlaskConical, MessageSquare, Network,
} from "lucide-react";
import {
  Area, AreaChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";

/* ============ atoms ============ */
function GlassCard({ children, className = "", glow = "" }: any) {
  return (
    <div
      className={
        "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " +
        glow + " " + className
      }
    >
      {children}
    </div>
  );
}
function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const s = performance.now();
    const tick = (n: number) => {
      const p = Math.min(1, (n - s) / duration);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/* ============ left rail ============ */
const RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: NetIcon, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator", active: true },
  { icon: Scale, label: "Simulation\nComparison", to: "/sead/simulation-comparison" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
  { icon: BookOpen, label: "Operational\nLearning", to: "/sead/operational-learning" },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker" },
  { icon: Users, label: "Multi-Agent\nCollaboration", to: "/sead/multi-agent-collaboration" },
  { icon: UserCheck, label: "Human-\nin-the-Loop", to: "/sead/human-in-the-loop" },
  { icon: FlaskConical, label: "Engineering\nSandbox", to: "/sead/engineering-sandbox" },
  { icon: MessageSquare, label: "Digital Coworker\nConversation", to: "/sead/digital-coworker-conversation" },
  { icon: Network, label: "IoT→AI\nArchitecture", to: "/sead/iot-ai-architecture" },
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
            <span className="absolute top-1 right-2 h-3.5 min-w-3.5 px-1 rounded-full bg-rose-500 text-white text-[8.5px] font-bold grid place-items-center">
              {r.badge}
            </span>
          )}
          {r.active && (
            <motion.span
              layoutId="rail-mds-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]"
            />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ============ top header ============ */
function AppHeader() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Maintenance Decision Simulator</div>
          <div className="text-[11px] text-slate-400">Simulate maintenance windows and compare operational & business outcomes</div>
        </div>
      </div>
      <div className="flex-1" />
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

/* ============ context strip ============ */
function ContextBar({ onReason }: { onReason: () => void }) {
  const nav = useNavigate();
  const Field = ({ label, value, color = "text-slate-100" }: any) => (
    <div className="px-5 py-1.5 border-l border-white/[0.06] first:border-l-0">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-[13px] font-medium tabular-nums mt-0.5 ${color}`}>{value}</div>
    </div>
  );
  const optimize = [
    { icon: TrendingUp, label: "Maximize\nProductive\nCapacity", color: "text-emerald-300" },
    { icon: Shield, label: "Protect\nYield &\nQuality", color: "text-sky-300" },
    { icon: Clock, label: "Minimize\nUnplanned\nDowntime", color: "text-amber-300" },
    { icon: User, label: "Optimize\nResource\nUtilization", color: "text-indigo-300" },
    { icon: Star, label: "Meet\nBusiness\nCommitments", color: "text-fuchsia-300" },
  ];
  return (
    <div className="space-y-3">
      <button onClick={() => nav("/sead/cross-domain-context-twin")} className="text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Back to Context Twin
      </button>
      <div className="grid grid-cols-12 gap-3">
        <GlassCard className="col-span-12 xl:col-span-8 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="h-16 w-24 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center border border-white/10">
              <Cpu className="h-8 w-8 text-sky-300/70" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[28px] font-semibold text-white tracking-tight leading-none">ETCH-217</h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/40">Fair</span>
              </div>
              <div className="text-[12px] text-slate-400 mt-1">Metal Etch Chamber | Bay 2</div>
            </div>
            <div className="flex flex-wrap items-center ml-2">
              <Field label="Health Score" value={<><span className="text-amber-300">72</span><span className="text-slate-500">/100</span></>} />
              <Field label="RUL" value={<><span>18 days</span><div className="text-[10px] text-slate-500">(±4 days)</div></>} />
              <Field label="Utilization" value="85%" />
              <Field label="Criticality" value="High" color="text-rose-300" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 md:col-span-6 xl:col-span-2 p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">AI Observed Issue</div>
          <p className="text-[12px] text-slate-300 leading-snug">
            Increasing chamber pressure instability and He leak rate indicate higher risk of unplanned failure within 18–22 days if no maintenance is performed.
          </p>
          <button onClick={onReason} className="mt-2 text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-1">
            View AI Reasoning →
          </button>
        </GlassCard>

        <GlassCard className="col-span-12 xl:col-span-2 p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">What We Are Trying To Optimize</div>
          <div className="grid grid-cols-5 gap-2">
            {optimize.map((o) => (
              <button key={o.label} className="group flex flex-col items-center gap-1 rounded-md px-1.5 py-2 hover:bg-white/[0.04] transition">
                <o.icon className={`h-4 w-4 ${o.color}`} />
                <span className="text-[8.5px] text-center text-slate-400 group-hover:text-slate-200 whitespace-pre-line leading-tight">{o.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============ sparkline ============ */
function Spark({ data, color }: { data: number[]; color: string }) {
  const d = data.map((y, i) => ({ i, y }));
  return (
    <div className="h-6 w-20">
      <ResponsiveContainer>
        <AreaChart data={d}>
          <defs>
            <linearGradient id={`sp-${color}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.2} fill={`url(#sp-${color})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function randSeries(seed: number, n = 20, base = 50, amp = 30) {
  let s = seed;
  return Array.from({ length: n }, () => {
    s = (s * 9301 + 49297) % 233280;
    return base + ((s / 233280) - 0.5) * amp;
  });
}

/* ============ scenario card ============ */
type Scenario = {
  id: number;
  title: string;
  sub: string;
  num: string;
  color: string; // tailwind hue
  hex: string;
  badge: string;
  badgeTone: string;
  downtime: string;
  rec?: boolean;
  metrics: { label: string; value: string; tone: string; seedColor: string; seed: number }[];
  overall: { label: string; tone: string };
  confidence: number;
  // 0–100 scores for [Capacity, Yield, Risk-avoidance, Resource, Commitments]
  rawScores: [number, number, number, number, number];
};

const SCENARIOS: Scenario[] = [
  {
    id: 1, title: "Maintain Now", sub: "(Today)", num: "1",
    color: "sky", hex: "#38bdf8",
    badge: "Earliest available window", badgeTone: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    downtime: "2h 45m",
    metrics: [
      { label: "Production Impact", value: "-1,240 wafers", tone: "text-rose-300", seedColor: "#f43f5e", seed: 11 },
      { label: "Yield Impact", value: "-0.18%", tone: "text-rose-300", seedColor: "#f43f5e", seed: 12 },
      { label: "OEE Impact", value: "-2.3 pts", tone: "text-rose-300", seedColor: "#f43f5e", seed: 13 },
      { label: "Cycle Time Impact", value: "+1.6%", tone: "text-amber-300", seedColor: "#f59e0b", seed: 14 },
      { label: "Revenue Impact", value: "-$1.24M", tone: "text-rose-400", seedColor: "#f43f5e", seed: 15 },
      { label: "Risk of Unplanned Failure", value: "Low", tone: "text-emerald-300", seedColor: "#10b981", seed: 16 },
      { label: "Technician Load", value: "High", tone: "text-rose-300", seedColor: "#f43f5e", seed: 17 },
      { label: "Parts Availability", value: "Available", tone: "text-emerald-300", seedColor: "#10b981", seed: 18 },
      { label: "Utility Impact", value: "High", tone: "text-rose-300", seedColor: "#f43f5e", seed: 19 },
    ],
    overall: { label: "High", tone: "text-rose-300" },
    confidence: 68,
    rawScores: [45, 50, 30, 35, 55],
  },
  {
    id: 2, title: "Maintain Tonight", sub: "(10:00 PM – 2:00 AM)", num: "2",
    color: "emerald", hex: "#10b981",
    badge: "Recommended by AI", badgeTone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    downtime: "2h 30m", rec: true,
    metrics: [
      { label: "Production Impact", value: "-320 wafers", tone: "text-emerald-300", seedColor: "#10b981", seed: 21 },
      { label: "Yield Impact", value: "-0.02%", tone: "text-emerald-300", seedColor: "#10b981", seed: 22 },
      { label: "OEE Impact", value: "-0.6 pts", tone: "text-emerald-300", seedColor: "#10b981", seed: 23 },
      { label: "Cycle Time Impact", value: "+0.3%", tone: "text-emerald-300", seedColor: "#10b981", seed: 24 },
      { label: "Revenue Impact", value: "-$0.24M", tone: "text-emerald-300", seedColor: "#10b981", seed: 25 },
      { label: "Risk of Unplanned Failure", value: "Very Low", tone: "text-emerald-300", seedColor: "#10b981", seed: 26 },
      { label: "Technician Load", value: "Medium", tone: "text-amber-300", seedColor: "#f59e0b", seed: 27 },
      { label: "Parts Availability", value: "Available", tone: "text-emerald-300", seedColor: "#10b981", seed: 28 },
      { label: "Utility Impact", value: "Low", tone: "text-emerald-300", seedColor: "#10b981", seed: 29 },
    ],
    overall: { label: "Low", tone: "text-emerald-300" },
    confidence: 94,
    rawScores: [92, 95, 96, 80, 95],
  },
  {
    id: 3, title: "Maintain Tomorrow", sub: "(May 24)", num: "3",
    color: "amber", hex: "#f59e0b",
    badge: "Moderate Disruption", badgeTone: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    downtime: "2h 30m",
    metrics: [
      { label: "Production Impact", value: "-780 wafers", tone: "text-amber-300", seedColor: "#f59e0b", seed: 31 },
      { label: "Yield Impact", value: "-0.07%", tone: "text-amber-300", seedColor: "#f59e0b", seed: 32 },
      { label: "OEE Impact", value: "-1.4 pts", tone: "text-amber-300", seedColor: "#f59e0b", seed: 33 },
      { label: "Cycle Time Impact", value: "+0.8%", tone: "text-amber-300", seedColor: "#f59e0b", seed: 34 },
      { label: "Revenue Impact", value: "-$0.81M", tone: "text-rose-300", seedColor: "#f43f5e", seed: 35 },
      { label: "Risk of Unplanned Failure", value: "Medium", tone: "text-amber-300", seedColor: "#f59e0b", seed: 36 },
      { label: "Technician Load", value: "High", tone: "text-rose-300", seedColor: "#f43f5e", seed: 37 },
      { label: "Parts Availability", value: "Available", tone: "text-emerald-300", seedColor: "#10b981", seed: 38 },
      { label: "Utility Impact", value: "Medium", tone: "text-amber-300", seedColor: "#f59e0b", seed: 39 },
    ],
    overall: { label: "Medium", tone: "text-amber-300" },
    confidence: 79,
    rawScores: [70, 80, 70, 65, 70],
  },
  {
    id: 4, title: "Maintain Next Week", sub: "(May 27–28)", num: "4",
    color: "orange", hex: "#fb923c",
    badge: "Low Disruption (Higher Risk)", badgeTone: "bg-orange-500/15 text-orange-300 border-orange-500/40",
    downtime: "2h 45m",
    metrics: [
      { label: "Production Impact", value: "-120 wafers", tone: "text-emerald-300", seedColor: "#10b981", seed: 41 },
      { label: "Yield Impact", value: "-0.31%", tone: "text-rose-300", seedColor: "#f43f5e", seed: 42 },
      { label: "OEE Impact", value: "-0.2 pts", tone: "text-emerald-300", seedColor: "#10b981", seed: 43 },
      { label: "Cycle Time Impact", value: "+0.1%", tone: "text-emerald-300", seedColor: "#10b981", seed: 44 },
      { label: "Revenue Impact", value: "-$0.12M", tone: "text-emerald-300", seedColor: "#10b981", seed: 45 },
      { label: "Risk of Unplanned Failure", value: "High", tone: "text-rose-300", seedColor: "#f43f5e", seed: 46 },
      { label: "Technician Load", value: "Low", tone: "text-emerald-300", seedColor: "#10b981", seed: 47 },
      { label: "Parts Availability", value: "Available", tone: "text-emerald-300", seedColor: "#10b981", seed: 48 },
      { label: "Utility Impact", value: "Low", tone: "text-emerald-300", seedColor: "#10b981", seed: 49 },
    ],
    overall: { label: "Medium", tone: "text-amber-300" },
    confidence: 61,
    rawScores: [80, 55, 35, 88, 60],
  },
];

function ConfidenceGauge({ value, color }: { value: number; color: string }) {
  const v = useCountUp(value, 1200);
  const angle = (v / 100) * 180;
  return (
    <div className="relative h-8 w-16">
      <svg viewBox="0 0 64 32" className="w-full h-full">
        <path d="M4 30 A 28 28 0 0 1 60 30" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path
          d="M4 30 A 28 28 0 0 1 60 30"
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="88"
          strokeDashoffset={88 - (88 * angle) / 180}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
    </div>
  );
}

const ScenarioCard = memo(function ScenarioCard({
  s, onClick, composite, rank, delta, pinned, onPin, busy, isTop,
}: {
  s: Scenario; onClick: () => void;
  composite: number; rank: number; delta: number | null;
  pinned: boolean; onPin: () => void; busy: boolean; isTop: boolean;
}) {
  const conf = useCountUp(s.confidence);
  const score = useCountUp(composite, 700);
  const rankColors = ["text-emerald-300 bg-emerald-500/15 border-emerald-500/40", "text-sky-300 bg-sky-500/15 border-sky-500/40", "text-amber-300 bg-amber-500/15 border-amber-500/40", "text-slate-300 bg-white/[0.05] border-white/[0.10]"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: s.id * 0.05 }}
      className={`group relative rounded-xl border bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-4 transition ${
        isTop
          ? "border-emerald-400/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.55)] ring-1 ring-emerald-400/30"
          : pinned
          ? "border-sky-400/50 shadow-[0_0_30px_-10px_rgba(56,189,248,0.55)] ring-1 ring-sky-400/30"
          : "border-white/[0.07] hover:border-white/[0.14]"
      }`}
    >
      {/* top badges */}
      <div className="absolute -top-2 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        <div className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${rankColors[Math.min(rank - 1, 3)]}`}>
          #{rank} Rank
        </div>
        {isTop && (
          <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-400 text-emerald-950 flex items-center gap-1">
            <Trophy className="h-3 w-3" /> Top Score
          </div>
        )}
      </div>

      {busy && (
        <div className="absolute inset-0 z-10 rounded-xl bg-[#06080f]/70 backdrop-blur-sm grid place-items-center pointer-events-none">
          <div className="flex items-center gap-2 text-[11px] text-sky-300">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Re-simulating…
          </div>
        </div>
      )}

      {/* header row */}
      <div className="flex items-start justify-between mb-3 mt-1">
        <button onClick={onClick} className="flex items-center gap-3 text-left">
          <div
            className="h-7 w-7 rounded-full grid place-items-center text-[12px] font-bold text-white"
            style={{ background: s.hex, boxShadow: `0 0 18px -3px ${s.hex}` }}
          >
            {s.num}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-white leading-tight">{s.title}</div>
            <div className="text-[10.5px] text-slate-400">{s.sub}</div>
          </div>
        </button>
        <div className="flex items-start gap-2">
          <button
            onClick={onPin}
            title={pinned ? "Unpin scenario" : "Pin scenario for comparison"}
            className={`h-7 w-7 rounded-md grid place-items-center border ${
              pinned ? "bg-sky-500/15 border-sky-400/40 text-sky-300" : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200"
            }`}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Downtime</div>
            <div className="text-[14px] font-semibold text-white tabular-nums">{s.downtime}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className={`text-[10.5px] font-medium px-2 py-1 rounded border inline-flex items-center gap-1.5 ${s.badgeTone}`}>
          {s.rec && <Star className="h-3 w-3" />} {s.badge}
        </div>
        {delta !== null && (
          <span className={`text-[10.5px] font-semibold px-2 py-1 rounded border inline-flex items-center gap-1 ${
            delta > 0 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : delta < 0 ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
            : "bg-white/[0.04] border-white/[0.08] text-slate-300"
          }`}>
            {delta > 0 ? <TrendingUp className="h-3 w-3" /> : delta < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {delta > 0 ? "+" : ""}{delta.toFixed(1)} vs AI pick
          </span>
        )}
      </div>

      {/* composite score bar */}
      <div className="mb-3 rounded-md bg-white/[0.02] border border-white/[0.05] px-3 py-2">
        <div className="flex items-center justify-between text-[10.5px] text-slate-400 mb-1.5">
          <span className="uppercase tracking-wider">Composite Score (live)</span>
          <span className="text-white text-[13px] font-bold tabular-nums">{score.toFixed(1)}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${s.hex}66, ${s.hex})` }}
            animate={{ width: `${composite}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {s.metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between text-[11.5px] gap-2">
            <span className="text-slate-400 truncate">{m.label}</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold tabular-nums ${m.tone}`}>{m.value}</span>
              <Spark data={randSeries(m.seed, 18, 50, 30)} color={m.seedColor} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Overall Business Impact</span>
        <span className={`text-[15px] font-bold ${s.overall.tone}`}>{s.overall.label}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">AI Confidence</span>
        <div className="flex items-center gap-2">
          <ConfidenceGauge value={s.confidence} color={s.hex} />
          <span className="text-[14px] font-bold text-white tabular-nums">{conf.toFixed(0)}%</span>
        </div>
      </div>

      <button onClick={onClick} className="mt-3 w-full h-8 rounded-md bg-white/[0.04] border border-white/[0.07] text-[11.5px] text-slate-200 hover:bg-white/[0.08]">
        Open Decision Drawer →
      </button>
    </motion.div>
  );
});

/* ============ assumptions ============ */
const ASSUMPTIONS = [
  { icon: User, label: "Customer Commitments", value: "High priority shipments next 48h" },
  { icon: AlertTriangle, label: "Engineering Freeze", value: "Change freeze active until May 26" },
  { icon: Wrench, label: "Alternate Tools", value: "CMP-038 available starting tonight" },
  { icon: Zap, label: "Utility Window", value: "Chilled water maintenance tonight 9PM–3AM" },
  { icon: User, label: "Technician Schedule", value: "2 senior techs available tonight" },
];
function Assumptions() {
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-3">Key Assumptions & Constraints</div>
      <div className="space-y-2">
        {ASSUMPTIONS.map((a) => (
          <div key={a.label} className="flex items-center gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
            <div className="h-7 w-7 rounded-md bg-white/[0.04] border border-white/[0.06] grid place-items-center">
              <a.icon className="h-3.5 w-3.5 text-sky-300" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <span className="text-[12px] text-slate-200 font-medium">{a.label}</span>
              <span className="text-[10.5px] text-slate-400 text-right truncate">{a.value}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-3">View All Assumptions →</button>
    </GlassCard>
  );
}

/* ============ simulation controls ============ */
function Controls() {
  const Select = ({ label, val }: any) => (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-slate-300">{label}</span>
      <button className="h-7 px-2.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11.5px] text-slate-200 flex items-center gap-1.5 hover:bg-white/[0.08]">
        {val} <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>
    </div>
  );
  const Toggle = ({ label, on = true }: any) => {
    const [v, setV] = useState(on);
    return (
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-slate-300">{label}</span>
        <button onClick={() => setV(!v)} className={`h-5 w-9 rounded-full transition relative ${v ? "bg-sky-500" : "bg-white/[0.1]"}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${v ? "left-4" : "left-0.5"}`} />
        </button>
      </div>
    );
  };
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-3">Simulation Controls</div>
      <div className="space-y-3">
        <Select label="Simulation Horizon" val="7 Days" />
        <Select label="Confidence Level" val="90%" />
        <Select label="Yield Sensitivity" val="High" />
        <Toggle label="Include Demand Volatility" />
        <Toggle label="Include Utility Constraints" />
        <Toggle label="Include Technician Constraints" />
      </div>
      <button className="mt-4 w-full h-9 rounded-md bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-[12px] font-semibold flex items-center justify-center gap-2 shadow-[0_0_24px_-6px_rgba(56,189,248,0.7)] hover:brightness-110">
        <Sparkles className="h-3.5 w-3.5" /> Re-run Simulation
      </button>
    </GlassCard>
  );
}

/* ============ business impact chart ============ */
function makeImpactData() {
  const days = ["May 23", "May 24", "May 25", "May 26", "May 27", "May 28", "May 29"];
  return days.map((d, i) => ({
    day: d,
    "Maintain Now": -200 - i * 250 - Math.random() * 100,
    "Maintain Tonight": -i * 30 + 10,
    "Tomorrow": -100 - i * 110 - Math.random() * 40,
    "Next Week": -50 - i * 70 - Math.random() * 30,
  }));
}
function ImpactChart() {
  const data = useMemo(makeImpactData, []);
  return (
    <GlassCard className="p-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-[12px] font-semibold text-white">Business Impact Over Time (7 Day View)</div>
          <div className="text-[10.5px] text-slate-400">Cumulative revenue impact</div>
        </div>
      </div>
      <div className="h-[230px]">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false}
                   tickFormatter={(v) => `$${(v / 1000).toFixed(1)}M`} />
            <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            <Line type="monotone" dataKey="Maintain Now" stroke="#38bdf8" strokeWidth={1.8} dot={false} />
            <Line type="monotone" dataKey="Maintain Tonight" stroke="#10b981" strokeWidth={2.2} dot={false} name="Maintain Tonight (Recommended)" />
            <Line type="monotone" dataKey="Tomorrow" stroke="#a78bfa" strokeWidth={1.8} dot={false} />
            <Line type="monotone" dataKey="Next Week" stroke="#fb923c" strokeWidth={1.8} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

/* ============ weighting sliders ============ */
const WEIGHTS = [
  { label: "Productive Capacity", v: 30 },
  { label: "Yield / Quality", v: 25 },
  { label: "Unplanned Risk", v: 20 },
  { label: "Resource Utilization", v: 15 },
  { label: "Business Commitments", v: 10 },
];
function Weighting({ vals, setVals, onReset }: { vals: number[]; setVals: (v: number[]) => void; onReset: () => void }) {
  const total = vals.reduce((a, b) => a + b, 0);
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] font-semibold text-white">Decision Criteria (Weighting)</div>
          <div className="text-[10.5px] text-slate-400">Re-ranks scenarios live as you adjust</div>
        </div>
        <span className={`text-[10.5px] px-2 py-0.5 rounded border tabular-nums ${
          total === 100 ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-amber-500/30 text-amber-300 bg-amber-500/10"
        }`}>Σ {total}%</span>
      </div>
      <div className="space-y-3 mt-3">
        {WEIGHTS.map((w, i) => (
          <div key={w.label}>
            <div className="flex items-center justify-between text-[11.5px] text-slate-300 mb-1">
              <span>{w.label}</span>
              <span className="tabular-nums text-white font-semibold">{vals[i]}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={vals[i]}
              onChange={(e) => { const n = [...vals]; n[i] = +e.target.value; setVals(n); }}
              className="w-full accent-sky-400"
            />
          </div>
        ))}
      </div>
      <button onClick={onReset} className="text-[11px] text-sky-300 hover:text-sky-200 mt-3">Reset to defaults</button>
    </GlassCard>
  );
}

/* ============ AI reasoning drawer ============ */
function ReasoningDrawer({ open, onClose, scenarioId }: { open: boolean; onClose: () => void; scenarioId: number | null }) {
  const [tab, setTab] = useState("Executive Summary");
  const tabs = ["Executive Summary", "Operational", "Engineering", "AI Reasoning", "Telemetry", "Historical"];
  const s = SCENARIOS.find((x) => x.id === scenarioId) ?? SCENARIOS[1];
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40" onClick={onClose}
          />
          <motion.aside
            initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-[460px] bg-[#0a0f1c] border-l border-white/[0.08] z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.08]">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Decision Drawer</div>
                <div className="text-[13px] font-semibold text-white">{s.title} · Scenario {s.num}</div>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-white/[0.06] grid place-items-center"><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="flex items-center gap-1 px-3 border-b border-white/[0.06] overflow-x-auto">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-2.5 py-2 text-[11px] whitespace-nowrap border-b-2 transition ${
                    tab === t ? "text-sky-300 border-sky-400" : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}>{t}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 text-[12px] text-slate-300 space-y-3">
              {tab === "Executive Summary" && (
                <>
                  <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 p-3">
                    <div className="flex items-center gap-2 text-emerald-300 text-[12px] font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Recommended Action
                    </div>
                    <p className="mt-1 text-slate-200">Execute PM tonight (10:00 PM – 2:00 AM) on ETCH-217 using alternate tool CMP-038 to absorb queued lots.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-white/[0.03] border border-white/[0.06] p-3"><div className="text-[10px] text-slate-500">Expected Financial Benefit</div><div className="text-[15px] font-semibold text-emerald-300">+$1.02M</div></div>
                    <div className="rounded-md bg-white/[0.03] border border-white/[0.06] p-3"><div className="text-[10px] text-slate-500">Downtime Avoided</div><div className="text-[15px] font-semibold text-white">14h</div></div>
                    <div className="rounded-md bg-white/[0.03] border border-white/[0.06] p-3"><div className="text-[10px] text-slate-500">RUL Extension</div><div className="text-[15px] font-semibold text-white">+62 days</div></div>
                    <div className="rounded-md bg-white/[0.03] border border-white/[0.06] p-3"><div className="text-[10px] text-slate-500">Est. ROI</div><div className="text-[15px] font-semibold text-emerald-300">8.4×</div></div>
                  </div>
                  <p>Aligns with customer commitments for the next 48h while protecting yield and OEE targets. Approval recommended.</p>
                </>
              )}
              {tab === "Operational" && (
                <ul className="space-y-2 list-disc pl-4">
                  <li>PM crew: 2 senior techs scheduled (Shift B)</li>
                  <li>Alternate tool CMP-038 reserved 9:30 PM – 3:30 AM</li>
                  <li>Utility window aligned (chilled water 9PM–3AM)</li>
                  <li>WIP rerouted: 12 lots staged via AMHS</li>
                  <li>No engineering hold conflicts; ECR freeze respected</li>
                </ul>
              )}
              {tab === "Engineering" && (
                <ul className="space-y-2 list-disc pl-4">
                  <li>Bayesian RUL model (XGBoost + Weibull) updated 14m ago</li>
                  <li>Monte Carlo: 10,000 trials · 90% CI [16d, 20d]</li>
                  <li>Key features: chamber pressure variance (28%), He leak slope (21%), RF reflected power (18%)</li>
                  <li>SECS/GEM stream healthy · EDA historian within tolerance</li>
                  <li>SPC: 2 Western Electric rule warnings on CD trend</li>
                </ul>
              )}
              {tab === "AI Reasoning" && (
                <>
                  <p>Optimization function maximized expected business value subject to customer-commitment and engineering-freeze constraints.</p>
                  <p>Counterfactual: deferring PM 7 days raises probability of unplanned failure from 0.08 → 0.42 and customer-risk weight from 0.42 → 0.71, dominating any downtime savings.</p>
                  <p>Confidence intervals across scenarios overlap on yield impact (±0.04%) but diverge sharply on revenue impact, driving the recommendation.</p>
                </>
              )}
              {tab === "Telemetry" && (
                <ul className="space-y-1.5">
                  <li>Chamber Pressure σ — 0.084 mT (↑ trend)</li>
                  <li>He Leak Rate — 1.8e-6 sccs (↑ trend)</li>
                  <li>RF Reflected Power — 4.2% (↑ variance)</li>
                  <li>Endpoint Drift — within spec</li>
                  <li>Throttle Valve Position — 38.4° (stable)</li>
                </ul>
              )}
              {tab === "Historical" && (
                <ul className="space-y-1.5">
                  <li>Case ETCH-203 · 2024-11 — similar leak signature, PM @ tonight window, prevented 18h unplanned downtime</li>
                  <li>Case ETCH-211 · 2025-02 — deferred PM 9 days, resulted in chamber match failure, 22h unplanned</li>
                  <li>Case ETCH-217 · 2024-08 — same recipe ME-28-A1, PM extended RUL by 71 days</li>
                </ul>
              )}
            </div>
            <div className="border-t border-white/[0.08] p-3 flex items-center gap-2">
              <button className="flex-1 h-9 rounded-md bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-[12px] font-semibold">Approve Maintenance</button>
              <button className="h-9 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11.5px] text-slate-200 hover:bg-white/[0.08]">Escalate</button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============ command palette ============ */
function CommandPalette({ open, onClose, actions }: {
  open: boolean; onClose: () => void;
  actions: { kind: string; label: string; hint?: string; run: () => void }[];
}) {
  const [q, setQ] = useState("");
  useEffect(() => { if (!open) setQ(""); }, [open]);
  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? actions.filter((a) => a.label.toLowerCase().includes(needle) || a.kind.toLowerCase().includes(needle)) : actions.slice(0, 16);
  }, [q, actions]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-start pt-[12vh] bg-black/55 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[560px] mx-auto rounded-xl border border-white/10 bg-[#0a1020] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
          <Search className="h-4 w-4 text-slate-500" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to scenario or run action…"
            className="flex-1 bg-transparent outline-none text-[13px] text-slate-100 placeholder:text-slate-500" />
          <span className="text-[10px] text-slate-500 px-1.5 py-0.5 border border-white/10 rounded">ESC</span>
        </div>
        <div className="max-h-[360px] overflow-y-auto py-1">
          {items.length === 0 && <div className="px-4 py-6 text-center text-[12px] text-slate-500">No matches</div>}
          {items.map((it, i) => (
            <button key={i} onClick={() => { it.run(); onClose(); }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-white/[0.04]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 w-16 shrink-0">{it.kind}</span>
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

/* ============ page ============ */
export default function MaintenanceDecisionSimulator() {
  const [drawer, setDrawer] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [vals, setVals] = useState(WEIGHTS.map((w) => w.v));
  const [pinned, setPinned] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "confidence" | "downtime">("score");

  const open = useCallback((id: number) => setDrawer({ open: true, id }), []);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const resetWeights = () => { setVals(WEIGHTS.map((w) => w.v)); showToast("Weights reset"); };

  const togglePin = (id: number) => {
    const n = new Set(pinned);
    n.has(id) ? n.delete(id) : n.add(id);
    setPinned(n);
  };

  const rerun = useCallback(() => {
    setBusy(true);
    setTimeout(() => { setBusy(false); showToast("Simulation refreshed"); }, 1100);
  }, []);

  // Live composite score per scenario (0-100), normalized by total weight.
  const scored = useMemo(() => {
    const total = Math.max(1, vals.reduce((a, b) => a + b, 0));
    return SCENARIOS.map((s) => {
      const sum = s.rawScores.reduce((a, v, i) => a + v * vals[i], 0);
      return { id: s.id, composite: sum / total };
    });
  }, [vals]);

  const rankMap = useMemo(() => {
    const sorted = [...scored].sort((a, b) => b.composite - a.composite);
    const m: Record<number, number> = {};
    sorted.forEach((x, i) => (m[x.id] = i + 1));
    return m;
  }, [scored]);

  const topId = useMemo(() => scored.reduce((a, b) => (b.composite > a.composite ? b : a)).id, [scored]);
  const aiPickComposite = scored.find((x) => x.id === 2)?.composite ?? 0;

  const displayed = useMemo(() => {
    const base = [...SCENARIOS];
    if (sortBy === "score") base.sort((a, b) => rankMap[a.id] - rankMap[b.id]);
    if (sortBy === "confidence") base.sort((a, b) => b.confidence - a.confidence);
    if (sortBy === "downtime") base.sort((a, b) => a.downtime.localeCompare(b.downtime));
    return base;
  }, [sortBy, rankMap]);

  const exportCsv = () => {
    const header = "scenario,rank,composite,confidence,downtime,overall,recommended";
    const lines = SCENARIOS.map((s) => {
      const c = scored.find((x) => x.id === s.id)!;
      return [s.title, rankMap[s.id], c.composite.toFixed(2), s.confidence, s.downtime, s.overall.label, s.rec ? "yes" : "no"].join(",");
    });
    const blob = new Blob([header + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `decision-sim-${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast("Scenarios exported");
  };

  // Hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); return; }
      if (e.key === "Escape") { setPaletteOpen(false); setDrawer({ open: false, id: null }); return; }
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA")) return;
      if (e.key.toLowerCase() === "r") rerun();
      if (e.key.toLowerCase() === "e") exportCsv();
      if (/^[1-4]$/.test(e.key)) open(Number(e.key));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, rerun, scored, rankMap]);

  const paletteActions = useMemo(() => ([
    ...SCENARIOS.map((s) => ({ kind: "Scenario", label: `Open ${s.title}`, hint: `#${rankMap[s.id]} · ${s.confidence}% conf`, run: () => open(s.id) })),
    ...SCENARIOS.map((s) => ({ kind: "Pin", label: `${pinned.has(s.id) ? "Unpin" : "Pin"} ${s.title}`, run: () => togglePin(s.id) })),
    { kind: "Action", label: "Re-run Simulation", hint: "R", run: rerun },
    { kind: "Action", label: "Export CSV snapshot", hint: "E", run: exportCsv },
    { kind: "Action", label: "Reset weights", run: resetWeights },
    { kind: "Sort", label: "Sort by Composite Score", run: () => setSortBy("score") },
    { kind: "Sort", label: "Sort by Confidence", run: () => setSortBy("confidence") },
    { kind: "Sort", label: "Sort by Downtime", run: () => setSortBy("downtime") },
  ]), [rankMap, pinned, rerun, vals, scored]);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#06080f] text-slate-200">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.06),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.05),_transparent_55%)]" />
        </div>

        <AppHeader />

        <div className="flex">
          <ModuleRail />
          <main className="flex-1 min-w-0 px-5 py-4 space-y-4">
            <ContextBar onReason={() => open(2)} />

            {/* Action toolbar */}
            <div className="sticky top-0 z-30 -mx-5 px-5 py-2 bg-[#06080f]/85 backdrop-blur-md border-b border-white/[0.05]">
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setPaletteOpen(true)}
                  className="h-8 px-2.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-[11.5px] text-slate-200 hover:bg-white/[0.06]">
                  <Command className="h-3.5 w-3.5 text-sky-300" /> Quick jump
                  <span className="text-[9.5px] text-slate-500 px-1 py-0.5 border border-white/10 rounded ml-1">⌘K</span>
                </button>
                <button onClick={rerun} disabled={busy}
                  className="h-8 px-2.5 rounded-md bg-gradient-to-r from-sky-500/80 to-indigo-500/80 text-white text-[11.5px] flex items-center gap-2 hover:brightness-110 disabled:opacity-60">
                  <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} /> Re-run simulation
                  <span className="text-[9.5px] text-white/70 px-1 py-0.5 border border-white/20 rounded ml-1">R</span>
                </button>
                <button onClick={exportCsv}
                  className="h-8 px-2.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-[11.5px] text-slate-200 hover:bg-white/[0.06]">
                  <Download className="h-3.5 w-3.5 text-sky-300" /> Export
                  <span className="text-[9.5px] text-slate-500 px-1 py-0.5 border border-white/10 rounded ml-1">E</span>
                </button>
                <div className="flex items-center gap-1 ml-2 text-[10.5px] text-slate-500">
                  Sort by:
                  {(["score", "confidence", "downtime"] as const).map((k) => (
                    <button key={k} onClick={() => setSortBy(k)}
                      className={`px-2 py-1 rounded-md border ${sortBy === k ? "bg-sky-500/10 border-sky-400/40 text-sky-200" : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"}`}>
                      {k === "score" ? "Composite" : k === "confidence" ? "Confidence" : "Downtime"}
                    </button>
                  ))}
                </div>
                {pinned.size > 0 && (
                  <button onClick={() => setPinned(new Set())}
                    className="h-8 px-2.5 rounded-md bg-sky-500/10 border border-sky-400/30 text-sky-200 text-[11.5px] flex items-center gap-1.5 hover:bg-sky-500/15">
                    <X className="h-3.5 w-3.5" /> Clear {pinned.size} pinned
                  </button>
                )}
                <div className="flex-1" />
                <span className="text-[10.5px] text-slate-500">Hotkeys: <kbd className="px-1 border border-white/10 rounded">1–4</kbd> inspect · <kbd className="px-1 border border-white/10 rounded">R</kbd> re-run · <kbd className="px-1 border border-white/10 rounded">E</kbd> export</span>
              </div>
            </div>

            <section>
              <div className="flex items-baseline justify-between mb-3 px-1">
                <div>
                  <div className="text-[16px] font-semibold text-white">Compare Maintenance Window Options</div>
                  <div className="text-[11.5px] text-slate-400">Composite scores update live as you adjust the weighting sliders on the right.</div>
                </div>
                <div className="text-[10.5px] text-slate-500">Top scorer: <span className="text-emerald-300 font-semibold">{SCENARIOS.find((s) => s.id === topId)?.title}</span></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {displayed.map((s) => {
                  const sc = scored.find((x) => x.id === s.id)!;
                  return (
                    <ScenarioCard
                      key={s.id}
                      s={s}
                      onClick={() => open(s.id)}
                      composite={sc.composite}
                      rank={rankMap[s.id]}
                      delta={s.id === 2 ? null : sc.composite - aiPickComposite}
                      pinned={pinned.has(s.id)}
                      onPin={() => togglePin(s.id)}
                      busy={busy}
                      isTop={s.id === topId}
                    />
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-12 gap-3">
              <div className="xl:col-span-3"><Assumptions /></div>
              <div className="xl:col-span-3"><Controls /></div>
              <div className="xl:col-span-3"><ImpactChart /></div>
              <div className="xl:col-span-3"><Weighting vals={vals} setVals={setVals} onReset={resetWeights} /></div>
            </section>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2 border-t border-white/[0.05]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Simulation engine streaming · MES · CMMS · APC · SECS/GEM · EDA
              </span>
              <span>Texas Instruments · DFW Fab · Maintenance Decision Simulator v1.1</span>
            </div>
          </main>
        </div>

        <ReasoningDrawer open={drawer.open} scenarioId={drawer.id} onClose={() => setDrawer({ open: false, id: null })} />

        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} />

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
