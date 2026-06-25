import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, Gauge, Lightbulb, GitBranch, Share2, Scale,
  Target as TargetIcon, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle,
  Clock, DollarSign, Search, Download, ArrowRight, Activity, Award, BookOpen} from "lucide-react";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine,
  BarChart, Bar, Cell,
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
  { icon: BookOpen, label: "Operational\nLearning", to: "/sead/operational-learning" },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker", active: true },
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
            <motion.span layoutId="rail-ot-indicator"
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
          <div className="text-[16px] font-semibold text-white tracking-tight">AI Outcome Tracker</div>
          <div className="text-[11px] text-slate-400">Closed-loop accuracy — predicted vs realized impact of every AI recommendation</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
        <Factory className="h-3.5 w-3.5 text-slate-400" />
        <div className="leading-tight">
          <div className="text-[9.5px] uppercase tracking-wider text-slate-500">Fab</div>
          <div className="text-[12.5px] font-semibold text-white">DFW Semiconductor Fab</div>
        </div>
      </div>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white">
        <Bell className="h-4 w-4" />
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white">
        <HelpCircle className="h-4 w-4" />
      </button>
    </header>
  );
}

/* ============================= data ============================= */
type Outcome = {
  id: string; date: string; rec: string; equipment: string; window: string;
  status: "Success" | "Partial" | "Missed";
  predUptime: number; actUptime: number;
  predRevenue: number; actRevenue: number;
  predDowntime: number; actDowntime: number;
  confidence: number;
};

const OUTCOMES: Outcome[] = [
  { id: "REC-2087", date: "Jun 18", rec: "Tonight 23:00 — Slot Valve Service", equipment: "MET 041", window: "4h",
    status: "Success", predUptime: 99.2, actUptime: 99.4, predRevenue: 4.8, actRevenue: 5.1, predDowntime: 240, actDowntime: 218, confidence: 89 },
  { id: "REC-2081", date: "Jun 16", rec: "Defer PM — Litho 18", equipment: "LITHO 18", window: "—",
    status: "Success", predUptime: 98.7, actUptime: 98.9, predRevenue: 2.1, actRevenue: 2.3, predDowntime: 0, actDowntime: 0, confidence: 82 },
  { id: "REC-2074", date: "Jun 14", rec: "AMHS Bay 3 Reroute", equipment: "AMHS Bay 3", window: "Continuous",
    status: "Partial", predUptime: 97.5, actUptime: 96.8, predRevenue: 1.6, actRevenue: 0.9, predDowntime: 90, actDowntime: 145, confidence: 76 },
  { id: "REC-2068", date: "Jun 11", rec: "Chamber Recipe Tune — Etch 12", equipment: "ETCH 12", window: "6h",
    status: "Success", predUptime: 99.0, actUptime: 99.1, predRevenue: 3.2, actRevenue: 3.4, predDowntime: 360, actDowntime: 340, confidence: 91 },
  { id: "REC-2061", date: "Jun 09", rec: "Vision Calibration — VSN 4.8", equipment: "VSN 4.8", window: "2h",
    status: "Missed", predUptime: 98.4, actUptime: 96.2, predRevenue: 1.1, actRevenue: -0.4, predDowntime: 120, actDowntime: 260, confidence: 68 },
  { id: "REC-2055", date: "Jun 07", rec: "Chilled Water B — Load Shed", equipment: "Utility CW-B", window: "8h",
    status: "Success", predUptime: 99.5, actUptime: 99.6, predRevenue: 0.8, actRevenue: 1.0, predDowntime: 0, actDowntime: 0, confidence: 87 },
  { id: "REC-2049", date: "Jun 04", rec: "Priority Lot Re-route A10482", equipment: "LITHO 21", window: "—",
    status: "Success", predUptime: 99.1, actUptime: 99.3, predRevenue: 2.6, actRevenue: 2.9, predDowntime: 0, actDowntime: 0, confidence: 84 },
  { id: "REC-2042", date: "Jun 02", rec: "Balanced Recovery — Metrology", equipment: "Metrology Grp", window: "12h",
    status: "Partial", predUptime: 98.2, actUptime: 97.6, predRevenue: 3.9, actRevenue: 3.1, predDowntime: 420, actDowntime: 510, confidence: 79 },
];

const TREND = [
  { wk: "W18", accuracy: 86, predicted: 19.2, actual: 17.8 },
  { wk: "W19", accuracy: 88, predicted: 21.4, actual: 20.9 },
  { wk: "W20", accuracy: 84, predicted: 18.7, actual: 16.3 },
  { wk: "W21", accuracy: 90, predicted: 22.1, actual: 22.4 },
  { wk: "W22", accuracy: 91, predicted: 23.8, actual: 24.3 },
  { wk: "W23", accuracy: 89, predicted: 20.6, actual: 20.1 },
  { wk: "W24", accuracy: 92, predicted: 25.1, actual: 25.7 },
  { wk: "W25", accuracy: 93, predicted: 26.4, actual: 27.1 },
];

const STATUS_STYLES: Record<Outcome["status"], string> = {
  Success: "text-emerald-300 bg-emerald-500/10 ring-emerald-400/30",
  Partial: "text-amber-300 bg-amber-500/10 ring-amber-400/30",
  Missed:  "text-rose-300 bg-rose-500/10 ring-rose-400/30",
};

/* ============================= page ============================= */
export default function OutcomeTracker() {
  const [filter, setFilter] = useState<"All" | Outcome["status"]>("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string>(OUTCOMES[0].id);

  const filtered = useMemo(() => OUTCOMES.filter(o =>
    (filter === "All" || o.status === filter) &&
    (q === "" || (o.rec + o.equipment + o.id).toLowerCase().includes(q.toLowerCase()))
  ), [filter, q]);

  const stats = useMemo(() => {
    const total = OUTCOMES.length;
    const success = OUTCOMES.filter(o => o.status === "Success").length;
    const predSum = OUTCOMES.reduce((a, o) => a + o.predRevenue, 0);
    const actSum  = OUTCOMES.reduce((a, o) => a + o.actRevenue, 0);
    const acc = Math.round((1 - Math.abs(predSum - actSum) / predSum) * 100);
    const avgConf = Math.round(OUTCOMES.reduce((a, o) => a + o.confidence, 0) / total);
    return { total, success, predSum, actSum, acc, avgConf };
  }, []);

  const sel = OUTCOMES.find(o => o.id === selected)!;

  return (
    <div className="min-h-screen w-full bg-[#06070b] text-slate-100">
      <div className="flex">
        <ModuleRail />
        <div className="flex-1 min-w-0">
          <AppHeader />
          <main className="p-6 space-y-5">
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                  <Award className="h-3 w-3" /> Realized Accuracy
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{stats.acc}%</div>
                <div className="text-[11px] text-emerald-300 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +2.4 pp vs prior month</div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                  <CheckCircle2 className="h-3 w-3" /> Success Rate
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{Math.round((stats.success/stats.total)*100)}%</div>
                <div className="text-[11px] text-slate-400">{stats.success}/{stats.total} recommendations</div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                  <DollarSign className="h-3 w-3" /> Realized Revenue
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">${stats.actSum.toFixed(1)}M</div>
                <div className="text-[11px] text-emerald-300">vs ${stats.predSum.toFixed(1)}M predicted</div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                  <Gauge className="h-3 w-3" /> Avg Confidence
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{stats.avgConf}%</div>
                <div className="text-[11px] text-slate-400">Model calibration: healthy</div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                  <Clock className="h-3 w-3" /> Avg Cycle to Verify
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">3.8d</div>
                <div className="text-[11px] text-emerald-300 flex items-center gap-1"><TrendingDown className="h-3 w-3" /> −0.6d</div>
              </GlassCard>
            </div>

            {/* Trend + Per-rec accuracy */}
            <div className="grid lg:grid-cols-3 gap-4">
              <GlassCard className="lg:col-span-2 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-white">Predicted vs Realized — 8 week trend</div>
                    <div className="text-[11px] text-slate-400">Revenue uplift attributed to AI recommendations</div>
                  </div>
                  <button className="text-[11px] text-slate-300 hover:text-white inline-flex items-center gap-1 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06]">
                    <Download className="h-3 w-3" /> Export
                  </button>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TREND}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="wk" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1f2937", fontSize: 11 }} />
                      <Area type="monotone" dataKey="predicted" stroke="#38bdf8" fill="url(#g1)" strokeWidth={2} name="Predicted ($M)" />
                      <Area type="monotone" dataKey="actual"    stroke="#34d399" fill="url(#g2)" strokeWidth={2} name="Realized ($M)" />
                      <ReferenceLine y={0} stroke="#334155" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="text-sm font-semibold text-white mb-2">Recommendation Accuracy by Week</div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TREND}>
                      <XAxis dataKey="wk" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={[70, 100]} />
                      <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1f2937", fontSize: 11 }} />
                      <Bar dataKey="accuracy" radius={[4,4,0,0]}>
                        {TREND.map((t, i) => (
                          <Cell key={i} fill={t.accuracy >= 90 ? "#34d399" : t.accuracy >= 85 ? "#38bdf8" : "#f59e0b"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* Outcomes table + detail */}
            <div className="grid lg:grid-cols-3 gap-4">
              <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <Activity className="h-4 w-4 text-sky-300" />
                  <div className="text-sm font-semibold text-white">Recommendation Outcomes</div>
                  <div className="flex-1" />
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
                      className="h-7 pl-7 pr-2 text-[12px] rounded bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-slate-500 w-44" />
                  </div>
                  <div className="flex gap-1">
                    {(["All","Success","Partial","Missed"] as const).map(s => (
                      <button key={s} onClick={() => setFilter(s)}
                        className={`text-[11px] px-2 h-7 rounded ring-1 ${filter===s ? "bg-sky-500/15 text-sky-200 ring-sky-400/40" : "bg-white/[0.03] text-slate-300 ring-white/[0.06] hover:text-white"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-h-[440px] overflow-auto">
                  <table className="w-full text-[12px]">
                    <thead className="bg-white/[0.02] text-slate-400 text-[10.5px] uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2">ID</th>
                        <th className="text-left px-4 py-2">Recommendation</th>
                        <th className="text-left px-4 py-2">Equipment</th>
                        <th className="text-right px-4 py-2">Predicted</th>
                        <th className="text-right px-4 py-2">Realized</th>
                        <th className="text-right px-4 py-2">Δ</th>
                        <th className="text-left px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(o => {
                        const delta = o.actRevenue - o.predRevenue;
                        return (
                          <tr key={o.id} onClick={() => setSelected(o.id)}
                            className={`border-t border-white/[0.04] cursor-pointer hover:bg-white/[0.03] ${selected===o.id ? "bg-sky-500/5" : ""}`}>
                            <td className="px-4 py-2 text-slate-400 font-mono">{o.id}</td>
                            <td className="px-4 py-2 text-white">{o.rec}</td>
                            <td className="px-4 py-2 text-slate-300">{o.equipment}</td>
                            <td className="px-4 py-2 text-right text-slate-300">${o.predRevenue.toFixed(1)}M</td>
                            <td className="px-4 py-2 text-right text-white">${o.actRevenue.toFixed(1)}M</td>
                            <td className={`px-4 py-2 text-right font-medium ${delta>=0 ? "text-emerald-300" : "text-rose-300"}`}>
                              {delta>=0 ? "+" : ""}{delta.toFixed(1)}M
                            </td>
                            <td className="px-4 py-2">
                              <span className={`text-[10.5px] px-2 py-0.5 rounded-full ring-1 ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Outcome detail</div>
                <div className="mt-1 text-sm font-semibold text-white">{sel.rec}</div>
                <div className="text-[11px] text-slate-400">{sel.id} · {sel.date} · {sel.equipment}</div>
                <div className={`mt-3 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full ring-1 ${STATUS_STYLES[sel.status]}`}>
                  {sel.status === "Success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {sel.status}
                </div>

                <div className="mt-4 space-y-3 text-[12px]">
                  <Row label="Predicted uptime" pred={`${sel.predUptime}%`} act={`${sel.actUptime}%`} good={sel.actUptime >= sel.predUptime} />
                  <Row label="Revenue uplift"   pred={`$${sel.predRevenue.toFixed(1)}M`} act={`$${sel.actRevenue.toFixed(1)}M`} good={sel.actRevenue >= sel.predRevenue} />
                  <Row label="Downtime (min)"   pred={`${sel.predDowntime}`}             act={`${sel.actDowntime}`}             good={sel.actDowntime <= sel.predDowntime} />
                  <Row label="Confidence"       pred={`${sel.confidence}%`}              act="—"                                 good />
                </div>

                <button className="mt-4 w-full h-9 rounded-lg bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30 text-[12px] inline-flex items-center justify-center gap-1 hover:bg-sky-500/25">
                  Open in Knowledge Graph <ArrowRight className="h-3 w-3" />
                </button>
              </GlassCard>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Row({ label, pred, act, good }: { label: string; pred: string; act: string; good: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
      <div className="text-slate-400">{label}</div>
      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-[11px]">Pred {pred}</span>
        <span className={`font-semibold ${good ? "text-emerald-300" : "text-rose-300"}`}>Act {act}</span>
      </div>
    </div>
  );
}
