import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, ArrowLeft, Gauge, Lightbulb, Database, BookOpen,
  Puzzle, ShieldCheck, Sun, Box, AlertTriangle, Info, CheckCircle2, RefreshCw,
} from "lucide-react";
import etchImg from "@/assets/etch-chamber-3d.jpg";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip,
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
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer", active: true },
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
            <motion.span layoutId="rail-conf-indicator"
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
          <div className="text-[16px] font-semibold text-white tracking-tight">Confidence Explorer</div>
          <div className="text-[11px] text-slate-400">Understand how confident NeuGAIN is in this recommendation and why</div>
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

/* ============================= gauge ============================= */
function Donut({ value, size = 180, stroke = 14, color = "#22c55e", label, sub }: any) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[34px] font-bold text-white tabular-nums leading-none">{value}%</div>
          {sub && <div className="text-[11px] text-slate-400 mt-1">{sub}</div>}
          {label && <div className="text-[11px] text-emerald-300 mt-1">{label}</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================= factor data ============================= */
const FACTORS = [
  { icon: Database, name: "Data Quality", desc: "Quality and completeness of input data", value: 95, color: "#22c55e" },
  { icon: BookOpen, name: "Historical Similarity", desc: "Similarity to past maintenance events", value: 92, color: "#22c55e" },
  { icon: Brain, name: "Model Certainty", desc: "AI model certainty in predicted outcomes", value: 86, color: "#22c55e" },
  { icon: Puzzle, name: "Context Completeness", desc: "Coverage of operational context", value: 84, color: "#22c55e" },
  { icon: ShieldCheck, name: "Assumption Reliability", desc: "Validity of assumptions used", value: 75, color: "#f59e0b" },
  { icon: Sun, name: "External Predictability", desc: "Predictability of external conditions", value: 72, color: "#f59e0b" },
  { icon: Box, name: "Simulation Confidence", desc: "Confidence in what-if simulations", value: 90, color: "#22c55e" },
];

const SOURCES = [
  { src: "IoT Telemetry (Live)", c: 98, t: 98, a: 96, w: 40, contrib: 38 },
  { src: "Process Data Historian", c: 96, t: 94, a: 95, w: 20, contrib: 19 },
  { src: "Maintenance History", c: 100, t: 90, a: 92, w: 15, contrib: 14 },
  { src: "Dispatch / RTD", c: 95, t: 95, a: 93, w: 10, contrib: 9 },
  { src: "MES / Production", c: 94, t: 92, a: 91, w: 10, contrib: 9 },
  { src: "Facilities / Utilities", c: 92, t: 90, a: 90, w: 5, contrib: 4 },
];

const TIME_SERIES = [
  { d: "May 16", v: 84 }, { d: "May 17", v: 85 }, { d: "May 18", v: 86 },
  { d: "May 19", v: 87 }, { d: "May 20", v: 86 }, { d: "May 21", v: 88 },
  { d: "May 22", v: 89 }, { d: "May 23", v: 89 },
];

const FACTOR_TABS = ["Data Quality", "Historical Similarity", "Model Certainty", "Context Completeness", "+3 more"];

/* ============================= small parts ============================= */
function Bar({ value, color = "#22c55e", w = 80 }: any) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden" style={{ width: w }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ background: color }} className="h-full rounded-full" />
      </div>
    </div>
  );
}

function FactorRow({ f }: any) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] grid place-items-center text-slate-300">
        <f.icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] text-white font-medium">{f.name}</div>
        <div className="text-[10.5px] text-slate-500">{f.desc}</div>
      </div>
      <Bar value={f.value} color={f.color} w={90} />
      <div className="text-[12.5px] font-semibold tabular-nums w-10 text-right" style={{ color: f.color }}>{f.value}%</div>
    </div>
  );
}

/* ============================= page ============================= */
export default function ConfidenceExplorer() {
  const nav = useNavigate();
  const [tab, setTab] = useState("Data Quality");

  const gaugeRot = useMemo(() => (89 / 100) * 180 - 90, []);

  return (
    <div className="min-h-screen bg-[#070912] text-slate-200 relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl" />

      <AppHeader />
      <div className="flex">
        <ModuleRail />
        <main className="flex-1 p-5 space-y-5">

          {/* HERO */}
          <GlassCard className="p-5">
            <button onClick={() => nav("/sead/ai-maintenance-decision-center")}
              className="inline-flex items-center gap-1.5 text-[12px] text-sky-300 hover:text-sky-200 mb-3">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to AI Recommendation
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
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Recommended Window</div>
                <div className="text-[15px] font-semibold text-white mt-1">May 28, 10:00 PM – May 29, 2:00 AM</div>
                <span className="inline-flex mt-2 text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">Recommended</span>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Overall Confidence</div>
                  <div className="text-[36px] font-bold text-white leading-none mt-1 tabular-nums">89%</div>
                </div>
                {/* semicircle gauge */}
                <svg width="90" height="56" viewBox="0 0 90 56">
                  <path d="M 8 50 A 37 37 0 0 1 82 50" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" strokeLinecap="round" />
                  <path d="M 8 50 A 37 37 0 0 1 82 50" stroke="#22c55e" strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray="116" strokeDashoffset={116 - (89/100) * 116} />
                  <g transform={`translate(45 50) rotate(${gaugeRot})`}>
                    <line x1="0" y1="0" x2="0" y2="-30" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <circle r="3" fill="#fff" />
                  </g>
                </svg>
              </div>
              <div className="col-span-2">
                <div className="text-[12px] text-white font-semibold">High confidence recommendation</div>
                <div className="text-[11px] text-slate-400 mt-1">Sufficient data, strong model agreement, and low uncertainty across key factors.</div>
              </div>
              <div className="col-span-2">
                <div className="text-[12px] text-white font-semibold">What is Confidence?</div>
                <div className="text-[11px] text-slate-400 mt-1">NeuGAIN Confidence reflects the reliability of the recommendation based on data quality, model certainty, assumptions, and risk.</div>
                <button className="mt-1.5 text-[11px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">Learn more →</button>
              </div>
            </div>
          </GlassCard>

          {/* MAIN 3-COL */}
          <div className="grid grid-cols-12 gap-5">

            {/* LEFT: breakdown */}
            <div className="col-span-3 space-y-5">
              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white">Confidence Breakdown</div>
                <div className="text-[11px] text-slate-500 mb-2">Confidence contribution by factor</div>
                {FACTORS.map((f) => <FactorRow key={f.name} f={f} />)}
                <div className="relative h-1.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 mt-4" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Low (0%)</span><span>Medium (50%)</span><span>High (100%)</span>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white mb-3">Confidence Level Guide</div>
                <div className="grid grid-cols-3 gap-3 text-[11px]">
                  <div>
                    <div className="text-slate-500">0 – 50%</div>
                    <div className="text-rose-400 font-semibold mt-1">Low</div>
                    <div className="text-slate-400 mt-1">High uncertainty, limited data</div>
                    <div className="text-slate-500 mt-2">Use with caution</div>
                  </div>
                  <div>
                    <div className="text-slate-500">50 – 75%</div>
                    <div className="text-amber-300 font-semibold mt-1">Medium</div>
                    <div className="text-slate-400 mt-1">Moderate confidence</div>
                    <div className="text-slate-500 mt-2">Review key assumptions</div>
                  </div>
                  <div>
                    <div className="text-slate-500">90 – 100%</div>
                    <div className="text-emerald-300 font-semibold mt-1">High</div>
                    <div className="text-slate-400 mt-1">Reliable recommendation. Monitor for changes.</div>
                    <div className="text-slate-500 mt-2">Very reliable. Proceed with confidence.</div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* CENTER: dive */}
            <div className="col-span-6 space-y-5">
              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white">Dive into Each Factor</div>
                <div className="flex items-center gap-5 mt-3 border-b border-white/[0.06]">
                  {FACTOR_TABS.map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`pb-2 text-[12px] transition relative ${tab === t ? "text-sky-300" : "text-slate-400 hover:text-slate-200"}`}>
                      {t}
                      {tab === t && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-sky-400 rounded-full" />}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-4 mt-4">
                  <div className="col-span-3 text-center">
                    <div className="text-[11px] text-slate-400 mb-2">Overall Score</div>
                    <Donut value={95} size={150} stroke={12} color="#22c55e" label="Excellent" />
                  </div>
                  <div className="col-span-4">
                    <div className="text-[11px] text-slate-400 mb-2">What This Means</div>
                    <div className="text-[12px] text-slate-200 leading-relaxed">High quality, complete, and recent data from multiple reliable sources.</div>
                    <ul className="mt-3 space-y-1.5 text-[11.5px] text-slate-300">
                      {["All critical signals are present","Low noise and abnormalities","Recent calibration and validation","No data gaps in key time window"].map(x => (
                        <li key={x} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {x}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-span-5">
                    <div className="text-[11px] text-slate-400 mb-2">Score Over Time</div>
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TIME_SERIES} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="d" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} ticks={[0,25,50,75,100]} tickFormatter={(v)=>`${v}%`} />
                          <RTooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11 }} />
                          <Line type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* sources table */}
                <div className="mt-5">
                  <div className="text-[12.5px] font-semibold text-white mb-2">Data Source Contribution</div>
                  <div className="grid grid-cols-12 text-[10.5px] uppercase tracking-wider text-slate-500 pb-2 border-b border-white/[0.06]">
                    <div className="col-span-3">Source</div>
                    <div className="col-span-2">Completeness</div>
                    <div className="col-span-2">Timeliness</div>
                    <div className="col-span-2">Accuracy</div>
                    <div className="col-span-1">Weight</div>
                    <div className="col-span-2 text-right">Contribution</div>
                  </div>
                  {SOURCES.map((s) => (
                    <div key={s.src} className="grid grid-cols-12 items-center text-[11.5px] py-2 border-b border-white/[0.04] last:border-0">
                      <div className="col-span-3 text-slate-200">{s.src}</div>
                      <div className="col-span-2 flex items-center gap-2"><span className="tabular-nums text-emerald-300 w-8">{s.c}%</span><Bar value={s.c} w={60} /></div>
                      <div className="col-span-2 flex items-center gap-2"><span className="tabular-nums text-emerald-300 w-8">{s.t}%</span><Bar value={s.t} w={60} /></div>
                      <div className="col-span-2 flex items-center gap-2"><span className="tabular-nums text-emerald-300 w-8">{s.a}%</span><Bar value={s.a} w={60} /></div>
                      <div className="col-span-1 tabular-nums text-slate-300">{s.w}%</div>
                      <div className="col-span-2 flex items-center gap-2 justify-end"><Bar value={s.contrib*2} color="#38bdf8" w={70} /><span className="tabular-nums text-sky-300 w-8 text-right">{s.contrib}%</span></div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white">Data Quality Issues <span className="text-[11px] text-slate-500 font-normal">(Low Impact)</span></div>
                <div className="space-y-2 mt-3">
                  {[
                    { icon: AlertTriangle, color: "text-amber-300", title: "Missing Vibration Sensor (X-axis)", sub: "1.2% of data points missing in last 7 days", impact: "-1%", impactColor: "text-rose-300" },
                    { icon: Info, color: "text-sky-300", title: "Temperature Sensor Drift", sub: "Minor drift detected, auto-corrected by model", impact: "-0.5%", impactColor: "text-rose-300" },
                    { icon: CheckCircle2, color: "text-emerald-300", title: "Particle Counter Maintenance", sub: "Maintenance performed 2 days ago", impact: "+0.3%", impactColor: "text-emerald-300" },
                  ].map((r) => (
                    <div key={r.title} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                      <r.icon className={`h-4 w-4 ${r.color}`} />
                      <div className="flex-1">
                        <div className="text-[12.5px] text-white">{r.title}</div>
                        <div className="text-[11px] text-slate-400">{r.sub}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">Impact on Confidence</div>
                        <div className={`text-[14px] font-semibold tabular-nums ${r.impactColor}`}>{r.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* RIGHT: summary */}
            <div className="col-span-3 space-y-5">
              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white mb-3">Confidence Summary</div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Donut value={89} size={140} stroke={12} color="#22c55e" sub="High Confidence" />
                  <div className="space-y-1.5 text-[11.5px]">
                    <div className="text-slate-400">Why this level?</div>
                    <div className="text-slate-300 leading-snug">Strong data quality and model agreement, with moderate assumptions and minimal unknowns.</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-[11.5px]">
                  {[
                    { c: "bg-emerald-400", t: "Strong Factors (4)" },
                    { c: "bg-amber-400", t: "Moderate Factors (2)" },
                    { c: "bg-orange-400", t: "Weak Factors (1)" },
                    { c: "bg-slate-500", t: "Unknowns (0)" },
                  ].map(x => (
                    <div key={x.t} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${x.c}`} /><span className="text-slate-300">{x.t}</span></div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[13.5px] font-semibold text-white">Key Assumptions</div>
                  <button className="text-[11px] text-sky-300 hover:text-sky-200">View all</button>
                </div>
                {[
                  { icon: Info, t: "Alternate qualified tools remain available", i: "Medium" },
                  { icon: Info, t: "No unplanned utility outages", i: "Medium" },
                  { icon: Database, t: "Customer demand forecast holds", i: "Low" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
                    <r.icon className="h-3.5 w-3.5 text-sky-300" />
                    <div className="flex-1 text-[11.5px] text-slate-200">{r.t}</div>
                    <div className="text-[10.5px] text-slate-400">Impact: <span className={r.i === "Medium" ? "text-amber-300" : "text-emerald-300"}>{r.i}</span></div>
                  </div>
                ))}
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[13.5px] font-semibold text-white">Main Sources of Uncertainty</div>
                  <button className="text-[11px] text-sky-300 hover:text-sky-200">View all</button>
                </div>
                {[
                  { icon: AlertTriangle, t: "Potential chamber contamination event", i: "Medium", c: "text-amber-300" },
                  { icon: ShieldCheck, t: "RF generator aging rate may accelerate", i: "Low", c: "text-emerald-300" },
                  { icon: Brain, t: "Technician availability may change", i: "Low", c: "text-emerald-300" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
                    <r.icon className="h-3.5 w-3.5 text-rose-300" />
                    <div className="flex-1 text-[11.5px] text-slate-200">{r.t}</div>
                    <div className="text-[10.5px] text-slate-400">Impact: <span className={r.c}>{r.i}</span></div>
                  </div>
                ))}
              </GlassCard>

              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white mb-3">How You Can Improve Confidence</div>
                {[
                  "Install missing vibration sensor (X-axis)\nPotential confidence gain: +2-3%",
                  "Calibrate RF generator sensors\nPotential confidence gain: +1-2%",
                  "Add additional similar tool to alternate list\nPotential confidence gain: +2-3%",
                ].map((t) => (
                  <div key={t} className="flex gap-2 py-2 border-b border-white/[0.04] last:border-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5 shrink-0" />
                    <div className="text-[11.5px] text-slate-200 whitespace-pre-line leading-snug">
                      <span className="text-white">{t.split("\n")[0]}</span>
                      <div className="text-[10.5px] text-slate-500">{t.split("\n")[1]}</div>
                    </div>
                  </div>
                ))}
                <button className="mt-3 w-full h-9 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-200 text-[12px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-sky-500/15">
                  <RefreshCw className="h-3.5 w-3.5" /> Recalculate Confidence
                </button>
                <div className="text-[10.5px] text-slate-500 mt-2 text-center">Last calculated: May 23, 10:22 AM CT</div>
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
