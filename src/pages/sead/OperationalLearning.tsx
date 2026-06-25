import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, Gauge, Lightbulb, GitBranch, Share2, Scale,
  Target as TargetIcon, BookOpen, TrendingUp, TrendingDown, ArrowRight,
  CheckCircle2, AlertTriangle, RefreshCw, Database, Cpu, Layers, GraduationCap,
  Activity, Download, Search, Users, UserCheck} from "lucide-react";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine,
  Line, LineChart, BarChart, Bar, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
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
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
  { icon: BookOpen, label: "Operational\nLearning", to: "/sead/operational-learning", active: true },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker" },
  { icon: Users, label: "Multi-Agent\nCollaboration", to: "/sead/multi-agent-collaboration" },
  { icon: UserCheck, label: "Human-
in-the-Loop", to: "/sead/human-in-the-loop" },
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
            <motion.span layoutId="rail-ol-indicator"
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
          <div className="text-[16px] font-semibold text-white tracking-tight">Operational Learning</div>
          <div className="text-[11px] text-slate-400">Self-improving AI — every outcome retrains the model and refines future recommendations</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-300">
        <Factory className="h-4 w-4 text-sky-300" /> Fab: DFW Semiconductor Fab
      </div>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-300">
        <span>May 23, 2025 10:24 AM CT</span>
        <span className="ml-2 inline-flex items-center gap-1 text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <button className="h-10 w-10 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 relative">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[10px] text-white grid place-items-center">2</span>
      </button>
      <button className="h-10 w-10 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300">
        <HelpCircle className="h-4 w-4" />
      </button>
      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center text-[12px] font-semibold text-white">AO</div>
    </header>
  );
}

/* ============================= data ============================= */
const accuracyTrend = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  baseline: 72,
  accuracy: 72 + i * 1.6 + (i % 3 === 0 ? 1.2 : 0),
  drift: 8 - i * 0.5,
}));

const modelVersions = [
  { v: "v3.4.1", date: "May 20", acc: 93.2, delta: +1.8, status: "active", samples: 1842, notes: "Added vibration FFT feature" },
  { v: "v3.4.0", date: "May 12", acc: 91.4, delta: +0.9, status: "archived", samples: 1604, notes: "Retrain after Bay-2 incident" },
  { v: "v3.3.2", date: "May 03", acc: 90.5, delta: +0.4, status: "archived", samples: 1418, notes: "Pump degradation labels" },
  { v: "v3.3.1", date: "Apr 24", acc: 90.1, delta: -0.2, status: "archived", samples: 1290, notes: "Hotfix — false-positive rate" },
  { v: "v3.3.0", date: "Apr 15", acc: 90.3, delta: +1.1, status: "archived", samples: 1212, notes: "New chamber telemetry stream" },
];

const learnings = [
  { id: "L-218", title: "Vacuum pump degradation precursor", source: "ETCH-217 incident", confidence: 94, impact: "High", category: "Pattern", applied: true },
  { id: "L-217", title: "Chiller temp + chamber pressure coupling", source: "Cross-Domain twin", confidence: 88, impact: "High", category: "Correlation", applied: true },
  { id: "L-216", title: "Tonight-window bias for low-utility loads", source: "Outcome ledger", confidence: 81, impact: "Medium", category: "Heuristic", applied: true },
  { id: "L-215", title: "Wet-etch recipe drift after PM", source: "Yield analytics", confidence: 76, impact: "Medium", category: "Drift", applied: false },
  { id: "L-214", title: "False-alarm cluster on humidity spikes", source: "Operator feedback", confidence: 72, impact: "Low", category: "Noise", applied: false },
  { id: "L-213", title: "Operator override pattern — night shift", source: "Governance log", confidence: 69, impact: "Medium", category: "Behavior", applied: true },
];

const feedbackMix = [
  { k: "Confirmed", v: 412, c: "#34d399" },
  { k: "Partial", v: 138, c: "#fbbf24" },
  { k: "Overridden", v: 67, c: "#f87171" },
  { k: "Pending", v: 41, c: "#94a3b8" },
];

const skillRadar = [
  { skill: "Anomaly Detect", before: 78, after: 93 },
  { skill: "Root Cause", before: 71, after: 88 },
  { skill: "Window Pick", before: 74, after: 91 },
  { skill: "Cost Forecast", before: 69, after: 84 },
  { skill: "Yield Impact", before: 66, after: 82 },
  { skill: "Risk Calib.", before: 72, after: 90 },
];

/* ============================= small bits ============================= */
function Kpi({ label, value, sub, tone = "sky", icon: Icon }: any) {
  const tones: any = {
    sky: "from-sky-500/20 to-sky-500/0 text-sky-300 border-sky-400/20",
    emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-300 border-emerald-400/20",
    violet: "from-violet-500/20 to-violet-500/0 text-violet-300 border-violet-400/20",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-300 border-amber-400/20",
  };
  return (
    <GlassCard className={`p-4 bg-gradient-to-b ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
        {Icon && <Icon className="h-4 w-4 opacity-70" />}
      </div>
      <div className="mt-2 text-[26px] font-semibold text-white tabular-nums leading-none">{value}</div>
      {sub && <div className="mt-1.5 text-[11px] text-slate-400">{sub}</div>}
    </GlassCard>
  );
}

/* ============================= page ============================= */
export default function OperationalLearning() {
  const [selected, setSelected] = useState(learnings[0]);
  const [q, setQ] = useState("");
  const [onlyApplied, setOnlyApplied] = useState(false);

  const filtered = useMemo(() => {
    return learnings.filter((l) =>
      (!q || l.title.toLowerCase().includes(q.toLowerCase()) || l.id.toLowerCase().includes(q.toLowerCase())) &&
      (!onlyApplied || l.applied)
    );
  }, [q, onlyApplied]);

  return (
    <div className="min-h-screen bg-[#05060a] text-slate-200 selection:bg-sky-500/30">
      {/* ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-sky-600/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <AppHeader />
      <div className="flex">
        <ModuleRail />

        <main className="flex-1 p-6 space-y-6">
          {/* Sub-header */}
          <div className="flex items-center gap-4">
            <button onClick={() => history.back()} className="text-sky-300 text-[12px] inline-flex items-center gap-1.5 hover:text-sky-200">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back to Knowledge Graph
            </button>
            <div className="flex-1" />
            <button className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] inline-flex items-center gap-2 hover:bg-white/[0.06]">
              <RefreshCw className="h-3.5 w-3.5" /> Retrain Now
            </button>
            <button className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] inline-flex items-center gap-2 hover:bg-white/[0.06]">
              <Download className="h-3.5 w-3.5" /> Export Learning Pack
            </button>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-4">
            <Kpi label="Active Model" value="v3.4.1" sub="Deployed May 20 · 1,842 samples" tone="sky" icon={Cpu} />
            <Kpi label="Model Accuracy" value="93.2%" sub="▲ +1.8 vs prior · target 92%" tone="emerald" icon={GraduationCap} />
            <Kpi label="Learnings Captured" value="218" sub="184 applied · 34 in review" tone="violet" icon={Layers} />
            <Kpi label="Drift Index" value="2.1%" sub="Healthy — below 5% threshold" tone="amber" icon={Activity} />
          </div>

          {/* Trend + Feedback mix */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="p-5 col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[13px] font-semibold text-white">Accuracy & Drift — 12 Weeks</div>
                  <div className="text-[11px] text-slate-400">Each retrain cycle measured against held-out outcomes</div>
                </div>
                <div className="text-[11px] text-slate-400">Baseline 72% · Target 92%</div>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accuracyTrend}>
                    <defs>
                      <linearGradient id="acc" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[60, 100]} />
                    <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} />
                    <ReferenceLine y={92} stroke="#38bdf8" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="accuracy" stroke="#34d399" strokeWidth={2} fill="url(#acc)" />
                    <Line type="monotone" dataKey="drift" stroke="#f87171" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-[13px] font-semibold text-white mb-1">Outcome Feedback Mix</div>
              <div className="text-[11px] text-slate-400 mb-4">Last 658 closed recommendations</div>
              <div className="space-y-3">
                {feedbackMix.map((f) => {
                  const total = feedbackMix.reduce((s, x) => s + x.v, 0);
                  const pct = Math.round((f.v / total) * 100);
                  return (
                    <div key={f.k}>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-slate-300">{f.k}</span>
                        <span className="tabular-nums text-slate-400">{f.v} · {pct}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: f.c }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Learnings + detail */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="p-5 col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[13px] font-semibold text-white">Recent Learnings</div>
                  <div className="text-[11px] text-slate-400">Patterns harvested from outcomes, operator feedback, and the knowledge graph</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search learnings…"
                      className="h-8 pl-7 pr-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12px] text-slate-200 placeholder:text-slate-500 w-48 focus:outline-none focus:border-sky-400/40" />
                  </div>
                  <label className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
                    <input type="checkbox" checked={onlyApplied} onChange={(e) => setOnlyApplied(e.target.checked)} className="accent-sky-400" /> Applied only
                  </label>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-white/[0.05]">
                <table className="w-full text-[12px]">
                  <thead className="bg-white/[0.02] text-slate-400">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">ID</th>
                      <th className="text-left px-3 py-2 font-medium">Insight</th>
                      <th className="text-left px-3 py-2 font-medium">Category</th>
                      <th className="text-left px-3 py-2 font-medium">Source</th>
                      <th className="text-right px-3 py-2 font-medium">Confidence</th>
                      <th className="text-right px-3 py-2 font-medium">Impact</th>
                      <th className="text-right px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr key={l.id}
                        onClick={() => setSelected(l)}
                        className={`border-t border-white/[0.04] cursor-pointer transition ${selected.id === l.id ? "bg-sky-500/[0.07]" : "hover:bg-white/[0.03]"}`}>
                        <td className="px-3 py-2 text-slate-400 tabular-nums">{l.id}</td>
                        <td className="px-3 py-2 text-white">{l.title}</td>
                        <td className="px-3 py-2 text-slate-300">{l.category}</td>
                        <td className="px-3 py-2 text-slate-400">{l.source}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-200">{l.confidence}%</td>
                        <td className="px-3 py-2 text-right">
                          <span className={`px-1.5 py-0.5 rounded text-[10.5px] ${
                            l.impact === "High" ? "bg-rose-500/15 text-rose-300" :
                            l.impact === "Medium" ? "bg-amber-500/15 text-amber-300" :
                            "bg-slate-500/15 text-slate-300"
                          }`}>{l.impact}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {l.applied
                            ? <span className="inline-flex items-center gap-1 text-emerald-300 text-[10.5px]"><CheckCircle2 className="h-3 w-3" /> Applied</span>
                            : <span className="inline-flex items-center gap-1 text-amber-300 text-[10.5px]"><AlertTriangle className="h-3 w-3" /> Review</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Learning Detail</div>
              <div className="mt-1 text-[15px] font-semibold text-white">{selected.title}</div>
              <div className="text-[11px] text-slate-400">{selected.id} · {selected.category}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[11.5px]">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-slate-400">Confidence</div>
                  <div className="text-white text-[18px] font-semibold tabular-nums">{selected.confidence}%</div>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-slate-400">Business Impact</div>
                  <div className="text-white text-[18px] font-semibold">{selected.impact}</div>
                </div>
              </div>
              <div className="mt-4 text-[12px] text-slate-300 leading-relaxed">
                Derived from <span className="text-sky-300">{selected.source}</span>. This learning has been
                {selected.applied ? <span className="text-emerald-300"> integrated into model v3.4.1</span> : <span className="text-amber-300"> queued for the next retrain cycle</span>} and
                contributes to future recommendation scoring.
              </div>
              <div className="mt-4 space-y-2 text-[12px]">
                <div className="flex items-center gap-2 text-slate-300"><Database className="h-3.5 w-3.5 text-sky-300" /> 1,842 telemetry samples reviewed</div>
                <div className="flex items-center gap-2 text-slate-300"><Brain className="h-3.5 w-3.5 text-violet-300" /> Reinforced by 14 operator confirmations</div>
                <div className="flex items-center gap-2 text-slate-300"><TrendingUp className="h-3.5 w-3.5 text-emerald-300" /> Projected accuracy gain: +1.4%</div>
              </div>
              <button className="mt-5 w-full h-9 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-200 text-[12px] inline-flex items-center justify-center gap-2 hover:bg-sky-500/25">
                {selected.applied ? <>View in Knowledge Graph <ArrowRight className="h-3.5 w-3.5" /></> : <>Apply to Next Retrain <ArrowRight className="h-3.5 w-3.5" /></>}
              </button>
            </GlassCard>
          </div>

          {/* Model versions + skill radar */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="p-5 col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[13px] font-semibold text-white">Model Version History</div>
                  <div className="text-[11px] text-slate-400">Every retrain is versioned with provenance and rollback</div>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-white/[0.05]">
                <table className="w-full text-[12px]">
                  <thead className="bg-white/[0.02] text-slate-400">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Version</th>
                      <th className="text-left px-3 py-2 font-medium">Released</th>
                      <th className="text-right px-3 py-2 font-medium">Accuracy</th>
                      <th className="text-right px-3 py-2 font-medium">Δ</th>
                      <th className="text-right px-3 py-2 font-medium">Samples</th>
                      <th className="text-left px-3 py-2 font-medium">Notes</th>
                      <th className="text-right px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelVersions.map((m) => (
                      <tr key={m.v} className="border-t border-white/[0.04]">
                        <td className="px-3 py-2 text-white font-mono">{m.v}</td>
                        <td className="px-3 py-2 text-slate-400">{m.date}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-200">{m.acc}%</td>
                        <td className={`px-3 py-2 text-right tabular-nums ${m.delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                          <span className="inline-flex items-center gap-1">
                            {m.delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {m.delta > 0 ? "+" : ""}{m.delta}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-300">{m.samples.toLocaleString()}</td>
                        <td className="px-3 py-2 text-slate-400">{m.notes}</td>
                        <td className="px-3 py-2 text-right">
                          <span className={`px-1.5 py-0.5 rounded text-[10.5px] ${m.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-400"}`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-[13px] font-semibold text-white">Skill Growth — Before vs After</div>
              <div className="text-[11px] text-slate-400 mb-3">Capability uplift across 6 reasoning skills</div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillRadar}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <PolarRadiusAxis stroke="#334155" tick={{ fontSize: 9, fill: "#475569" }} />
                    <Radar name="Before" dataKey="before" stroke="#64748b" fill="#64748b" fillOpacity={0.15} />
                    <Radar name="After" dataKey="after" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 justify-center">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-500" /> Before</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" /> After</span>
              </div>
            </GlassCard>
          </div>

          {/* Footer banner */}
          <GlassCard className="p-4 flex items-center gap-4 bg-gradient-to-r from-sky-500/[0.06] to-fuchsia-500/[0.04]">
            <GraduationCap className="h-5 w-5 text-sky-300" />
            <div className="text-[12.5px] text-slate-200">
              <span className="text-white font-semibold">Continuous improvement loop active.</span> Next scheduled retrain: <span className="text-sky-300">May 27, 02:00 CT</span> · 36 new learnings will be incorporated.
            </div>
            <div className="flex-1" />
            <button className="h-8 px-3 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[12px] hover:bg-white/[0.08]">View Pipeline</button>
          </GlassCard>
        </main>
      </div>
    </div>
  );
}
