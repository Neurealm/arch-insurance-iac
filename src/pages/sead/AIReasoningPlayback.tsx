import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, ChevronDown, ChevronRight, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, ArrowLeft, Play, Pause, SkipBack, SkipForward, Activity,
  TrendingUp, BookOpen, ClipboardList, Users, BarChart3, Trophy, CheckCircle2, Wand2,
  Gauge, ShieldCheck, AlertTriangle, Database, Cpu, Settings, ScrollText, Clock,
} from "lucide-react";
import etchImg from "@/assets/etch-chamber-3d.jpg";

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
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback", active: true },
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
          {r.active && (
            <motion.span layoutId="rail-arp-indicator"
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
          <div className="text-[16px] font-semibold text-white tracking-tight">AI Reasoning Playback</div>
          <div className="text-[11px] text-slate-400">Step through how NeuGAIN reasoned to recommend the optimal maintenance window</div>
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
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
        <div className="text-[11.5px] text-slate-300">May 23, 2025 · 10:24 AM CT</div>
        <span className="flex items-center gap-1 text-[10px] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">3</span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white"><HelpCircle className="h-4 w-4" /></button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 grid place-items-center text-white text-[11px] font-bold">AO</div>
    </header>
  );
}

/* ============================= data ============================= */
type Impact = "Low" | "Medium" | "High";
const impactTone = (i: Impact) =>
  i === "High" ? "text-rose-300" : i === "Medium" ? "text-amber-300" : "text-emerald-300";
const impactDot = (i: Impact) =>
  i === "High" ? "bg-rose-400" : i === "Medium" ? "bg-amber-400" : "bg-emerald-400";

const STEPS: Array<{
  n: number; time: string; off: string; title: string; sub: string;
  evidence: string; impact: Impact; confidence: number; icon: any;
  detail: string;
}> = [
  { n: 1, time: "09:42:13", off: "+00:00", title: "Detected Early Degradation Signal", sub: "Pump vibration increased above normal operating band.",
    evidence: "Vibration RMS 2.8 mm/s (↑28% vs baseline)", impact: "Low", confidence: 96, icon: Activity,
    detail: "Cryo-pump bearing vibration trended above the rolling 30-day p95 envelope for 47 minutes. Telemetry pulled from SECS/GEM stream s2f49." },
  { n: 2, time: "09:42:14", off: "+00:01", title: "Correlated With Process Instability", sub: "RF power stability and chamber pressure showed correlated drift.",
    evidence: "Pressure variation ↑16%, RF stability ↓2.1%", impact: "Low", confidence: 92, icon: TrendingUp,
    detail: "Pearson r = 0.84 between vibration spectra and RF reflected power over the last 4 process lots." },
  { n: 3, time: "09:42:15", off: "+00:02", title: "Matched Historical Degradation Patterns", sub: "Matched 6 similar historical events with confirmed failures.",
    evidence: "Pattern match score 0.82 (6/6 features aligned)", impact: "Medium", confidence: 85, icon: BookOpen,
    detail: "DTW distance against the cryo-pump degradation library returned 6 nearest neighbors; all preceded scheduled service within 14–22 days." },
  { n: 4, time: "09:42:18", off: "+00:05", title: "Checked Production Context", sub: "Evaluated lots in queue, due dates, and tool criticality.",
    evidence: "12 lots in queue, 2 customer shipments at risk if delayed", impact: "Medium", confidence: 88, icon: ClipboardList,
    detail: "MES queue depth 12; 2 lots tied to Tier-1 automotive commitments with Friday cutoffs." },
  { n: 5, time: "09:42:19", off: "+00:06", title: "Evaluated Alternate Tools", sub: "Checked availability and capacity of qualified alternate tools.",
    evidence: "2 alternate tools available, capacity constraint on Tool ETCH-221", impact: "Low", confidence: 86, icon: Boxes,
    detail: "ETCH-219 and ETCH-223 qualified for recipe MEX-7A; ETCH-221 already at 94% utilization." },
  { n: 6, time: "09:42:22", off: "+00:09", title: "Reviewed Dispatch & Resource Constraints", sub: "Validated technician availability, PM window rules, and work center load.",
    evidence: "1 qualified tech available Thu night, dispatch rules allow window", impact: "Low", confidence: 90, icon: Users,
    detail: "Tech roster checked against skill matrix; dispatch rule DR-118 permits 4h PM window between 22:00–02:00." },
  { n: 7, time: "09:42:23", off: "+00:10", title: "Analyzed Utilities & Facilities", sub: "Checked utility availability and facility constraints.",
    evidence: "DI water stable, N2 utilization 62%, no planned outages", impact: "Low", confidence: 95, icon: Gauge,
    detail: "Facilities BMS confirmed no scheduled chilled-water work; N2 header pressure within spec." },
  { n: 8, time: "09:42:24", off: "+00:11", title: "Simulated Maintenance Windows", sub: "Ran what-if simulations across 4 candidate windows.",
    evidence: "Simulated 4 windows, evaluated across 9 impact dimensions", impact: "High", confidence: 87, icon: BarChart3,
    detail: "Monte Carlo n=10,000 across Now / Tonight / Tomorrow / Next Week; objective = minimize weighted business impact." },
  { n: 9, time: "09:42:25", off: "+00:12", title: "Scored & Selected Optimal Window", sub: "Scored outcomes and selected the window with the best overall result.",
    evidence: "Window May 28, 10:00 PM – May 29, 2:00 AM scored 91/100", impact: "Low", confidence: 89, icon: Trophy,
    detail: "Tonight window scored 91/100 vs. 78 (Now), 84 (Tomorrow), 71 (Next Week)." },
  { n: 10, time: "09:42:26", off: "+00:13", title: "Generated Recommendation", sub: "Final recommendation created with rationale and guardrails.",
    evidence: "All guardrails satisfied, confidence above threshold", impact: "Low", confidence: 89, icon: CheckCircle2,
    detail: "Recommendation packaged with rationale, supporting evidence, and approval routing for governance workflow." },
];

const SUMMARY = [
  { icon: Activity, label: "Total Impact",          value: "Low",          sub: "(-$0.12M)", tone: "text-emerald-300" },
  { icon: AlertTriangle, label: "Risk of Delay",    value: "Low",          sub: "(14%)",     tone: "text-emerald-300" },
  { icon: ClipboardList, label: "Lots Affected",    value: "2 lots",       sub: "",          tone: "text-slate-200" },
  { icon: Users, label: "Customer Commitments",     value: "On Track",     sub: "",          tone: "text-emerald-300" },
  { icon: Wrench, label: "Tool Availability",       value: "Available",    sub: "",          tone: "text-emerald-300" },
  { icon: ShieldCheck, label: "Technician Availability", value: "Available", sub: "",        tone: "text-emerald-300" },
  { icon: Gauge, label: "Utility Readiness",        value: "Good",         sub: "",          tone: "text-emerald-300" },
  { icon: Cpu, label: "Model Confidence",           value: "89%",          sub: "",          tone: "text-sky-300" },
];

const DATA_SOURCES = [
  { icon: Activity, label: "Live IoT Signals", value: "128 streams" },
  { icon: BookOpen, label: "Historical Events", value: "24 events" },
  { icon: Settings, label: "Process Data",      value: "18 parameters" },
  { icon: ClipboardList, label: "Production Data", value: "WIP, lots, routes" },
  { icon: Users, label: "Dispatch Data",        value: "Rules, resources" },
  { icon: BarChart3, label: "Simulation Scenarios", value: "4 windows" },
  { icon: Cpu, label: "AI Models",              value: "8 models" },
];

/* ============================= page ============================= */
export default function AIReasoningPlayback() {
  const nav = useNavigate();
  const [active, setActive] = useState(9);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [showDetails, setShowDetails] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const timerRef = useRef<number | null>(null);

  // playback engine
  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setInterval(() => {
      setActive((s) => {
        if (s >= STEPS.length) { setPlaying(false); return s; }
        return s + 1;
      });
    }, 1200 / speed);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [playing, speed]);

  // scrub progress
  const progressPct = (active / STEPS.length) * 100;
  const elapsed = useMemo(() => {
    const s = Math.min(active, STEPS.length) - 1;
    return s < 0 ? "00:00" : STEPS[s].off.replace("+", "");
  }, [active]);

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-200" style={{
      backgroundImage:
        "radial-gradient(1000px 600px at 12% -10%, rgba(56,189,248,0.07), transparent), " +
        "radial-gradient(900px 500px at 110% 10%, rgba(139,92,246,0.06), transparent)",
    }}>
      <AppHeader />
      <div className="flex">
        <ModuleRail />
        <main className="flex-1 px-6 py-5 space-y-4">
          {/* Back link */}
          <button onClick={() => nav("/sead/ai-maintenance-decision-center")}
            className="flex items-center gap-2 text-sky-300 hover:text-sky-200 text-[12px] font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to AI Reasoning Workspace
          </button>

          {/* Equipment header strip */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-14 w-20 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-slate-900">
                  <img src={etchImg} alt="ETCH-217 chamber" className="h-full w-full object-cover opacity-90" />
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-2">
                    <div className="text-[18px] font-bold text-white">ETCH-217</div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 ring-1 ring-amber-400/30 text-amber-300">Fair</span>
                  </div>
                  <div className="text-[11.5px] text-slate-400">Metal Etch Chamber · Bay 2</div>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Recommended Window</div>
                <div className="text-[14px] font-semibold text-white">May 28, 10:00 PM – May 29, 2:00 AM</div>
                <div className="mt-1"><span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 ring-1 ring-emerald-400/30 text-emerald-300">Recommended</span></div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">AI Confidence</div>
                <div className="flex items-center gap-3">
                  <div className="text-[22px] font-bold text-white">89%</div>
                  <ConfidenceGauge value={89} />
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Overall Impact</div>
                <div className="text-[18px] font-bold text-emerald-300">Low</div>
                <div className="text-[11px] text-slate-400">(-$0.12M)</div>
              </div>
              <div className="flex-1" />
              <div className="max-w-[360px] leading-snug">
                <div className="text-[12px] font-semibold text-white mb-0.5">What is this?</div>
                <div className="text-[11px] text-slate-400">
                  This playback shows the key reasoning steps NeuGAIN took, the data and models it used,
                  and how each step influenced the final recommendation.
                </div>
                <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-1 inline-flex items-center gap-1">Learn more <ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>
          </GlassCard>

          {/* Main grid */}
          <div className="grid grid-cols-12 gap-4">
            {/* Timeline */}
            <GlassCard className="col-span-12 xl:col-span-8 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[14px] font-semibold text-white">Reasoning Timeline (Playback)</div>
                  <div className="text-[11px] text-slate-400">Replay how NeuGAIN analyzed inputs, evaluated scenarios, and generated the recommendation</div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none">
                    <input type="checkbox" checked={showDetails} onChange={(e) => setShowDetails(e.target.checked)}
                      className="h-3.5 w-3.5 accent-sky-400" /> Show details
                  </label>
                  <SpeedMenu value={speed} onChange={setSpeed} />
                  <button
                    onClick={() => { if (active >= STEPS.length) setActive(1); setPlaying((p) => !p); }}
                    className="h-8 px-3 rounded-md bg-sky-500 hover:bg-sky-400 text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-[0_0_24px_-6px_rgba(56,189,248,0.7)]">
                    {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {playing ? "Pause" : "Replay"}
                  </button>
                </div>
              </div>

              <div className="relative">
                {/* vertical track */}
                <div className="absolute left-[14px] top-2 bottom-2 w-px bg-white/10" />
                <ul className="space-y-1.5">
                  {STEPS.map((s) => {
                    const isActive = s.n === active;
                    const isDone = s.n < active;
                    const isOpen = !!expanded[s.n] || showDetails;
                    return (
                      <li key={s.n}>
                        <button
                          onClick={() => { setActive(s.n); setExpanded((e) => ({ ...e, [s.n]: !e[s.n] })); }}
                          className={`w-full text-left grid grid-cols-[88px_44px_1fr_minmax(220px,1fr)_120px_120px] gap-2 items-center px-2 py-2.5 rounded-lg transition ${
                            isActive ? "bg-sky-500/8 ring-1 ring-sky-400/30 shadow-[0_0_30px_-18px_rgba(56,189,248,0.9)]" : "hover:bg-white/[0.03]"
                          }`}
                        >
                          {/* time */}
                          <div className="leading-tight">
                            <div className="text-[12px] font-mono text-slate-200">{s.time}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{s.off}</div>
                          </div>
                          {/* node + number */}
                          <div className="relative flex items-center justify-center">
                            <span className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold ring-2 ${
                              isActive ? "bg-sky-500 text-white ring-sky-400/40" :
                              isDone ? "bg-emerald-500/20 text-emerald-300 ring-emerald-400/30" :
                              "bg-slate-800 text-slate-400 ring-white/10"
                            }`}>{s.n}</span>
                            {isActive && <span className="absolute inset-0 rounded-full ring-2 ring-sky-400/40 animate-ping" />}
                          </div>
                          {/* title */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-7 w-7 rounded-md bg-white/[0.04] ring-1 ring-white/10 grid place-items-center shrink-0">
                              <s.icon className="h-3.5 w-3.5 text-sky-300" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12.5px] font-semibold text-white truncate">{s.title}</div>
                              <div className="text-[11px] text-slate-400 truncate">{s.sub}</div>
                            </div>
                          </div>
                          {/* evidence */}
                          <div className="leading-tight min-w-0">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">Evidence</div>
                            <div className="text-[11.5px] text-slate-200 truncate">{s.evidence}</div>
                          </div>
                          {/* impact */}
                          <div className="leading-tight">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">Impact</div>
                            <div className={`text-[12px] font-semibold flex items-center gap-1.5 ${impactTone(s.impact)}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${impactDot(s.impact)}`} /> {s.impact}
                            </div>
                          </div>
                          {/* confidence */}
                          <div className="leading-tight flex items-center justify-between gap-2">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">Confidence</div>
                              <div className="text-[12px] font-semibold text-white">{s.confidence}%</div>
                            </div>
                            <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} />
                          </div>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden">
                              <div className="ml-[140px] mr-2 mb-2 p-3 rounded-md bg-white/[0.025] border border-white/[0.06]">
                                <div className="text-[11px] text-slate-300 leading-relaxed">{s.detail}</div>
                                <div className="mt-2 h-1 w-full bg-white/[0.05] rounded">
                                  <div className="h-1 rounded bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${s.confidence}%` }} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </GlassCard>

            {/* Right column */}
            <div className="col-span-12 xl:col-span-4 space-y-4">
              {/* Recommendation summary */}
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[14px] font-semibold text-white">Recommendation Summary</div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 ring-1 ring-emerald-400/30 text-emerald-300">Recommended</span>
                  <span className="text-[11.5px] text-slate-300">May 28, 10:00 PM – May 29, 2:00 AM</span>
                </div>
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-white mb-1">Why this window?</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Best balance of lowest total impact, minimal risk, and highest ability to complete.
                  </div>
                </div>
                <div className="mt-3 divide-y divide-white/[0.05]">
                  {SUMMARY.map((s) => (
                    <div key={s.label} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 text-[11.5px] text-slate-300">
                        <s.icon className="h-3.5 w-3.5 text-sky-300" /> {s.label}
                      </div>
                      <div className={`text-[11.5px] font-semibold ${s.tone}`}>
                        {s.value} {s.sub && <span className="text-slate-500 font-normal">{s.sub}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Playback controls */}
              <GlassCard className="p-4">
                <div className="text-[14px] font-semibold text-white mb-2">Playback Controls</div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    <CtlBtn onClick={() => setActive(1)} icon={SkipBack} />
                    <CtlBtn onClick={() => { if (active >= STEPS.length) setActive(1); setPlaying((p) => !p); }}
                      icon={playing ? Pause : Play} primary />
                    <CtlBtn onClick={() => setActive((s) => Math.min(s + 1, STEPS.length))} icon={SkipForward} />
                    <CtlBtn onClick={() => setActive(STEPS.length)} icon={SkipForward} />
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-400">{elapsed} / 00:13</div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="text-[11px] text-slate-400">Go to step</div>
                  <select value={active} onChange={(e) => setActive(Number(e.target.value))}
                    className="flex-1 h-7 rounded-md bg-white/[0.04] border border-white/10 text-[11.5px] text-slate-200 px-2">
                    {STEPS.map((s) => <option key={s.n} value={s.n}>Step {s.n} · {s.title}</option>)}
                  </select>
                </div>
              </GlassCard>

              {/* Data & models */}
              <GlassCard className="p-4">
                <div className="text-[14px] font-semibold text-white mb-2">Data & Models Used</div>
                <div className="divide-y divide-white/[0.05]">
                  {DATA_SOURCES.map((d) => (
                    <div key={d.label} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 text-[11.5px] text-slate-300">
                        <d.icon className="h-3.5 w-3.5 text-indigo-300" /> {d.label}
                      </div>
                      <div className="text-[11.5px] text-slate-400">{d.value}</div>
                    </div>
                  ))}
                </div>
                <button className="mt-2 text-[11px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">
                  View all data sources <ChevronRight className="h-3 w-3" />
                </button>
              </GlassCard>
            </div>
          </div>

          {/* Reasoning trace footer */}
          <GlassCard className="p-4">
            <div className="text-[14px] font-semibold text-white">Reasoning Trace</div>
            <div className="text-[11.5px] text-slate-400 mb-3">
              All steps completed successfully. NeuGAIN evaluated 312 data sources and 4 scenarios across 9 impact dimensions.
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <TraceChip label="Data Quality" value="Good" />
              <TraceChip label="Guardrails" value="Satisfied" />
              <TraceChip label="Constraints" value="Respected" />
              <TraceChip label="No Conflicts" value="Detected" />
              <TraceChip label="Recommendation" value="Ready" />
            </div>
          </GlassCard>
        </main>
      </div>
    </div>
  );
}

/* ============================= sub-components ============================= */
function ConfidenceGauge({ value }: { value: number }) {
  const r = 22, c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <svg width="56" height="36" viewBox="0 0 64 40">
      <path d={`M 8 32 A 24 24 0 0 1 56 32`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
      <path d={`M 8 32 A 24 24 0 0 1 56 32`} fill="none" stroke="url(#cg)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${dash * 0.5} ${c}`} />
      <defs>
        <linearGradient id="cg" x1="0" x2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SpeedMenu({ value, onChange }: { value: 1 | 2 | 4; onChange: (v: 1 | 2 | 4) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(Number(e.target.value) as 1 | 2 | 4)}
        className="h-8 pl-3 pr-7 rounded-md bg-white/[0.04] border border-white/10 text-[11.5px] text-slate-200 appearance-none">
        <option value={1}>1x</option><option value={2}>2x</option><option value={4}>4x</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

function CtlBtn({ icon: Icon, onClick, primary }: any) {
  return (
    <button onClick={onClick} className={`h-8 w-8 rounded-md grid place-items-center border transition ${
      primary
        ? "bg-sky-500 hover:bg-sky-400 border-sky-400/40 text-white"
        : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.07]"
    }`}>
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function TraceChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 h-7 rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/30 text-[11px] flex items-center gap-1.5 text-emerald-200">
      <CheckCircle2 className="h-3 w-3" /> {label}: <span className="font-semibold">{value}</span>
    </div>
  );
}
